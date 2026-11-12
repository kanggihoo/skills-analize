/*
 * 30 · 움직이는 글자 — Korean kinetic typography with a variable font.
 * Every syllable of "작은 소리가 / 큰 울림이 된다" is its own absolutely positioned span whose weight
 * (font-variation-settings "wght", Pretendard Variable 45–920), size, tracking, position, blur and glow are
 * written every frame as pure functions of t — no CSS transitions. The line layout is our own: in setup the
 * real advance width of each syllable is measured at ten weights and the optical centre of the Hangul em box is
 * found (DOM baseline + canvas ink bounds); every frame each line is re-set from those widths, so when a syllable
 * swells, appears or tightens its neighbours make room and the line re-centres.
 * Cues follow an imagined narration (syllable onsets); a weight wave travels through the line, "큰" swells,
 * "울림이" rings like a struck bell (a damped oscillation of the weight axis, with outline echoes), "된다" lands,
 * and everything settles into a quiet two-line layout with an emphasis dot (드러냄표) over "큰".
 * A canvas underneath draws ripples from each spoken syllable and the narration's waveform.
 */
import { defineDemo, track, ease, clamp, lerp, smooth } from '../_lib/stage.js';

const D = 9.5;
const FONT = '"Pretendard Variable", Pretendard, sans-serif';
const WS = [45, 100, 200, 300, 400, 500, 600, 700, 800, 920];   // weights measured in setup

// the narration: syllable, line, word-final?, cue (s), loudness
const SYL = [
  ['작', 0, false, 0.50, 0.30], ['은', 0, true, 0.74, 0.26],
  ['소', 0, false, 1.28, 0.32], ['리', 0, false, 1.48, 0.28], ['가', 0, true, 1.70, 0.26],
  ['큰', 1, true, 3.05, 1.00],
  ['울', 1, false, 3.72, 0.62], ['림', 1, false, 3.95, 0.58], ['이', 1, true, 4.18, 0.52],
  ['된', 1, false, 4.90, 0.74], ['다', 1, true, 5.16, 0.70],
].map(([ch, line, wordEnd, cue, amp], i) => ({ ch, line, wordEnd, cue, amp, i }));
const KEUN = 5;

// ---- the story's shared envelopes
const settle = (t) => ease.inOutCubic(clamp((t - 6.95) / 1.45));
const wave1 = (t, i) => { if (t < 1.6 || t > 3.3) return 0; const c = (t - 2.0) / 0.15 - 0.8; return Math.exp(-(((i - c) / 0.85) ** 2)); };
// the climax sweep runs through all eleven syllables, then once more, faster and softer
const wave2 = (t, i) => {
  if (t < 5.25 || t > 7.4) return 0;
  const c1 = (t - 5.55) / 0.1 - 1.5, c2 = (t - 6.35) / 0.07 - 1.5;
  return Math.exp(-(((i - c1) / 1.1) ** 2)) + 0.55 * Math.exp(-(((i - c2) / 1.0) ** 2));
};
const appear = (t, s, dur = 0.3) => smooth((t - s.cue + 0.06) / dur);
const accent = (t, s) => { const a = t - s.cue; return a < 0 ? 0 : (1 - Math.exp(-a / 0.025)) * Math.exp(-a / 0.3); };
const ring = (t, s, f = 3.1, k = 2.6) => { const a = t - s.cue; return a < 0 ? 0 : Math.exp(-k * a) * Math.sin(2 * Math.PI * f * a); };

const lineY = [
  track([[0, 900], [2.85, 900], [3.3, 742, ease.outCubic], [6.95, 742], [8.4, 806]]),
  track([[0, 1030], [3.0, 1030], [4.6, 1004], [6.95, 1004], [8.4, 966]]),
];
// 큰: size multiplier — a hit with overshoot, then it gives room as the rest of the line arrives
const keunK = track([[3.0, 0.45], [3.24, 2.3, ease.outBack], [3.7, 1.85], [4.3, 1.45], [5.0, 1.32], [6.95, 1.32], [8.4, 1.0]]);
const keunW = track([[3.0, 45], [3.2, 920, ease.outExpo], [6.95, 880], [8.4, 840]]);

const COL = { ink: [243, 238, 230], amber: [255, 178, 98] };
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;
const mixC = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);

/** every syllable's look at time t (before layout): weight, size px, tracking after (em), dy, alpha, blur, colour, glow */
function look(t, s) {
  const S = settle(t), ap = appear(t, s), ac = accent(t, s);
  const w1 = s.line === 0 ? wave1(t, s.i) : 0, w2 = wave2(t, s.i);
  let W, size, trk, dy = 0, alpha, blur = 0, col = COL.ink, glow = 0, glowCol = [255, 255, 255], rot = 0;
  if (s.line === 0) {
    // a whisper: hairline weight, wide tracking, drifting up out of a blur; each syllable is spoken with a small
    // weight accent; the travelling wave thickens and tightens it; 큰's hit pushes the line back
    const hush = smooth((t - 3.05) / 0.25) * (1 - smooth((t - 5.4) / 0.4));
    W = 70 + 120 * ap + 300 * ac + 560 * w1 + 620 * w2;
    size = 92 * (1 + 0.06 * ac + 0.1 * w1 + 0.13 * w2);
    trk = 0.1 + 0.32 * (1 - ap) - 0.07 * w1 - 0.04 * w2;
    dy = 30 * (1 - ap) - 10 * ac;
    alpha = ap * (0.9 - 0.38 * hush);
    blur = 7 * (1 - ap);
    glow = 0.55 * w1 + 0.5 * w2 + 0.25 * ac;
    // final: light and quiet
    W = lerp(W, 300, S); size = lerp(size, 92, S); trk = lerp(trk, 0.04, S); alpha = lerp(alpha, 0.66, S);
  } else if (s.i === KEUN) {
    const a = smooth((t - s.cue + 0.03) / 0.1);
    W = keunW(t) + 40 * w2;
    size = 136 * keunK(t) * (1 + 0.08 * w2);
    trk = 0.0;
    alpha = a;
    blur = 6 * (1 - a);
    const hit = t < s.cue ? 0 : Math.exp(-(t - s.cue) / 0.5);
    col = mixC(COL.ink, COL.amber, smooth((t - s.cue) / 0.2));
    glow = 0.35 + 1.2 * hit + 0.6 * w2;
    glowCol = COL.amber;
    rot = -2.5 * ring(t, s, 2.2, 3.5);
    W = lerp(W, 860, S); trk = lerp(trk, -0.01, S);
    glow = lerp(glow, 0.3, S);
  } else if (s.i <= 8) {
    // 울림이: a struck bell — the weight axis rings around its rest value, the size breathes with it
    const r = ring(t, s);
    W = 430 + 120 * ap + 300 * r + 420 * w2;
    size = 136 * (1 + 0.05 * r + 0.12 * w2) * (0.8 + 0.2 * ap);
    trk = 0.06 * (1 - ap) - 0.01;
    dy = 18 * (1 - ap);
    alpha = ap;
    blur = 5 * (1 - ap);
    glow = 0.3 * Math.abs(r) + 0.55 * w2 + 0.2 * ac;
    W = lerp(W, 760, S); size = lerp(size, 136, S); trk = lerp(trk, -0.02, S); glow = lerp(glow, 0, S);
  } else {
    // 된다: it lands — drops in, a firm weight, a small squash
    const p = clamp((t - s.cue + 0.05) / 0.32);
    W = 260 + 560 * ease.outCubic(p) + 120 * ac + 380 * w2;
    size = 136 * (1 + 0.1 * w2) * (0.9 + 0.1 * ease.outBack(p));
    trk = -0.01;
    dy = -70 * (1 - ease.outBack(p, 2.2));
    alpha = smooth(p * 2.2);
    blur = 4 * (1 - smooth(p * 1.6));
    glow = 0.5 * w2 + 0.3 * ac;
    W = lerp(W, 760, S); size = lerp(size, 136, S); trk = lerp(trk, -0.02, S); glow = lerp(glow, 0, S);
  }
  if (s.i !== KEUN) col = mixC(col, [255, 255, 255], clamp(0.6 * (w1 + w2)));
  if (s.line === 0) col = mixC(col, [206, 202, 214], S);
  return { W: clamp(W, 45, 920), size, trk, dy: lerp(dy, 0, S), alpha: clamp(alpha), blur, col, glow, glowCol, rot: lerp(rot, 0, S), present: s.i === KEUN ? smooth((t - s.cue + 0.03) / 0.1) : ap };
}

defineDemo({
  id: '30-kinetic-type',
  title: '움직이는 글자',
  tech: '가변 폰트 · font-variation-settings 굵기 축 + 글자 단위 모션',
  duration: D,
  background: '#090a14',
  setup({ stage, canvas, layer }) {
    // ---------------- measure the font: advance widths per weight, the optical centre of the em box
    const scaleOf = () => stage.getBoundingClientRect().width / 1080 || 1;
    const meas = document.createElement('div');
    meas.style.cssText = `position:absolute;left:0;top:0;visibility:hidden;white-space:pre;font-family:${FONT};font-size:200px;line-height:1`;
    const probe = document.createElement('span');
    probe.style.cssText = 'display:inline-block';
    const mark = document.createElement('span');
    mark.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    meas.append(probe, mark);
    stage.appendChild(meas);
    const sc = scaleOf();
    const adv = {};
    for (const ch of new Set(SYL.map((s) => s.ch))) {
      adv[ch] = WS.map((w) => {
        probe.style.fontVariationSettings = `"wght" ${w}`;
        probe.textContent = ch.repeat(4);
        return probe.getBoundingClientRect().width / sc / 800;      // em per syllable (4 in a row averages any kerning)
      });
    }
    probe.textContent = '가';
    const baseline = (mark.getBoundingClientRect().top - meas.getBoundingClientRect().top) / sc / 200;  // em from box top
    const c2 = document.createElement('canvas').getContext('2d');
    c2.font = `500 200px ${FONT}`;
    const m = c2.measureText(SYL.map((s) => s.ch).join(''));
    let inkMid = -0.36, inkHalf = 0.44;                               // fallback: ink centre ≈ 0.36 em above baseline
    if (m && Number.isFinite(m.actualBoundingBoxAscent) && m.actualBoundingBoxAscent > 0) {
      inkMid = (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2 / 200;
      inkHalf = (m.actualBoundingBoxDescent + m.actualBoundingBoxAscent) / 2 / 200;
    }
    const KC = Number.isFinite(baseline) && baseline > 0.3 && baseline < 1.2 ? baseline + inkMid : 0.5;  // em, box top → optical centre
    stage.removeChild(meas);
    const advAt = (ch, w) => {
      const a = adv[ch];
      for (let k = 1; k < WS.length; k++) if (w <= WS[k]) return lerp(a[k - 1], a[k], (w - WS[k - 1]) / (WS[k] - WS[k - 1]));
      return a[WS.length - 1];
    };

    // ---------------- layers: a static backdrop, a canvas for ripples and the waveform, the type
    const bgEl = layer('div', { z: 0 });
    bgEl.style.background = 'radial-gradient(120% 75% at 50% 46%, #1a1d3a 0%, #10122a 42%, #08090f 100%)';
    const { ctx: g } = canvas({ z: 1 });
    const typeEl = layer('div', { z: 2 });
    const mk = (ch, extra = '') => {
      const e = document.createElement('span');
      e.textContent = ch;
      e.style.cssText = `position:absolute;left:0;top:0;white-space:pre;line-height:1;font-family:${FONT};transform-origin:50% ${(KC * 100).toFixed(2)}%;${extra}`;
      typeEl.appendChild(e);
      return e;
    };
    // outline echoes behind 큰 and 울림이 (drawn first, so they sit under the letters)
    const echoes = [];
    for (const s of SYL) {
      if (s.line !== 1 || s.i > 8) continue;
      const n = s.i === KEUN ? 3 : 2;
      for (let k = 0; k < n; k++) echoes.push({ s, k, el: mk(s.ch, 'color:transparent;-webkit-text-stroke:2px rgba(255,255,255,0.5)') });
    }
    const els = SYL.map((s) => mk(s.ch));
    const dot = document.createElement('div');                       // 드러냄표 over 큰
    dot.style.cssText = 'position:absolute;left:0;top:0;width:18px;height:18px;border-radius:50%;background:#ffb262;box-shadow:0 0 18px rgba(255,170,90,.7)';
    typeEl.appendChild(dot);

    // ---------------- per frame
    const pos = new Array(SYL.length);
    this.render = (t) => {
      const S = settle(t);
      const L = SYL.map((s) => look(t, s));
      // set each line from the measured advances: presence scales a syllable's advance so arriving words push the
      // line open smoothly; tracking is in ems of the syllable's own size; the word space is 0.27 em of the line
      for (const line of [0, 1]) {
        const idx = SYL.filter((s) => s.line === line).map((s) => s.i);
        const base = line === 0 ? 92 : 136;
        let total = 0;
        const parts = idx.map((i, k) => {
          const s = SYL[i], l = L[i];
          const w = advAt(s.ch, l.W) * l.size;
          const last = k === idx.length - 1;
          const gap = last ? 0 : l.trk * l.size + (s.wordEnd ? 0.27 * base : 0);
          const p = l.present;
          const nextP = last ? 0 : L[idx[k + 1]].present;
          const adv = (w + gap * nextP) * p;
          total += adv;
          return { i, w, adv };
        });
        let x = 540 - total / 2;
        const y = lineY[line](t);
        for (const q of parts) { pos[q.i] = { x: x + q.w / 2 * L[q.i].present, y, w: q.w }; x += q.adv; }
      }
      // type
      SYL.forEach((s, i) => {
        const l = L[i], e = els[i], p = pos[i];
        if (l.alpha <= 0.002) { e.style.opacity = '0'; return; }
        e.style.fontSize = `${l.size.toFixed(2)}px`;
        e.style.fontVariationSettings = `"wght" ${l.W.toFixed(1)}`;
        e.style.fontWeight = `${Math.round(l.W)}`;
        e.style.transform = `translate(${(p.x - p.w / 2).toFixed(2)}px, ${(p.y + l.dy - KC * l.size).toFixed(2)}px) rotate(${l.rot.toFixed(2)}deg)`;
        e.style.opacity = l.alpha.toFixed(3);
        e.style.color = rgba(l.col, 1);
        e.style.filter = l.blur > 0.05 ? `blur(${l.blur.toFixed(2)}px)` : 'none';
        e.style.textShadow = l.glow > 0.01 ? `0 0 ${(14 + 26 * l.glow).toFixed(1)}px ${rgba(l.glowCol, Math.min(0.85, 0.5 * l.glow))}` : 'none';
      });
      // echoes: an outline copy swelling out of the letter and fading (several per syllable, staggered)
      for (const { s, k, el } of echoes) {
        const a = t - s.cue - 0.1 * k - (s.i === KEUN ? 0.05 : 0.08);
        const l = L[s.i], p = pos[s.i];
        const life = s.i === KEUN ? 1.5 : 1.2;
        if (a < 0 || a > life || l.alpha < 0.05) { el.style.opacity = '0'; continue; }
        const grow = 1 + (s.i === KEUN ? 1.15 : 0.6) * (1 - Math.exp(-2.4 * a));
        const op = (s.i === KEUN ? 0.55 : 0.4) * Math.exp(-2.6 * a / life) * smooth(a / 0.06) * (1 - S);
        el.style.fontSize = `${l.size.toFixed(2)}px`;
        el.style.fontVariationSettings = `"wght" ${l.W.toFixed(1)}`;
        el.style.transform = `translate(${(p.x - p.w / 2).toFixed(2)}px, ${(p.y + l.dy - KC * l.size).toFixed(2)}px) scale(${grow.toFixed(4)})`;
        el.style.opacity = op.toFixed(3);
        el.style.webkitTextStroke = `${(2.2 / grow).toFixed(2)}px ${s.i === KEUN ? 'rgba(255,190,120,0.9)' : 'rgba(255,255,255,0.75)'}`;
      }
      // 드러냄표: an emphasis dot appears over 큰 as the layout settles
      {
        const l = L[KEUN], p = pos[KEUN];
        const a = smooth((t - 7.75) / 0.5);
        // centred over the syllable, just above its ink (as 드러냄표 sit in Korean typesetting)
        const cy = p.y + l.dy - inkHalf * l.size - 24 - 14 * (1 - ease.outBack(clamp((t - 7.75) / 0.5)));
        dot.style.transform = `translate(${(p.x - 9).toFixed(2)}px, ${(cy - 9).toFixed(2)}px) scale(${(0.4 + 0.6 * a).toFixed(3)})`;
        dot.style.opacity = a.toFixed(3);
      }

      // ---------------- canvas: ripples from each spoken syllable, the narration waveform
      g.clearRect(0, 0, 1080, 1920);
      g.globalCompositeOperation = 'lighter';
      for (const s of SYL) {
        const p = pos[s.i];
        const n = s.i === KEUN ? 4 : 1;
        for (let k = 0; k < n; k++) {
          const a = t - s.cue - 0.14 * k;
          if (a < 0 || a > 3.2) continue;
          const R = 30 + (s.i === KEUN ? 760 : 420) * (1 - Math.exp(-1.25 * a));
          const al = (s.i === KEUN ? 0.32 : 0.16) * s.amp * Math.exp(-1.3 * a) * smooth(a / 0.08) * (1 - 0.7 * S);
          g.strokeStyle = s.i === KEUN ? rgba(COL.amber, al) : rgba([200, 210, 255], al);
          g.lineWidth = s.i === KEUN ? 2.2 : 1.4;
          g.beginPath();
          g.arc(p.x, p.y, R, 0, Math.PI * 2);
          g.stroke();
        }
      }
      // waveform: bars for the narration's loudness, drawn up to the play head, collapsing to a calm line
      const X0 = 150, X1 = 930, Y = 1372, T0 = 0.2, T1 = 5.9;
      const head = clamp((t - T0) / (T1 - T0));
      const env = (tau) => {
        let v = 0;
        for (const s of SYL) {
          const a = tau - s.cue + 0.02;
          if (a < 0 || a > 0.9) continue;
          const body = a < 0.05 ? a / 0.05 : Math.exp(-(a - 0.05) / (s.i === KEUN ? 0.22 : 0.11));
          const tail = s.i >= 6 && s.i <= 8 ? 0.35 * Math.exp(-a / 0.35) * (0.6 + 0.4 * Math.sin(a * 40)) : 0;   // 울림: a ringing tail
          v += s.amp * (body + tail);
        }
        return Math.min(1.2, v);
      };
      const flat = 1 - smooth((t - 6.9) / 1.2);
      const barW = 4, step = 9;
      for (let x = X0; x <= X1; x += step) {
        const u = (x - X0) / (X1 - X0);
        const tau = T0 + u * (T1 - T0);
        const played = u <= head;
        const hsh = Math.sin(x * 12.9898) * 43758.5453, jitter = hsh - Math.floor(hsh);
        const h = played ? 3 + 120 * env(tau) * (0.55 + 0.45 * jitter) * flat : 3;
        g.fillStyle = played ? rgba([226, 228, 255], 0.34 + 0.2 * (1 - flat)) : 'rgba(226,228,255,0.12)';
        g.fillRect(x - barW / 2, Y - h / 2, barW, h);
      }
      if (head < 1 && t > T0) {
        const hx = X0 + head * (X1 - X0);
        g.fillStyle = rgba(COL.amber, 0.75);
        g.fillRect(hx - 1, Y - 70, 2, 140);
      }
      g.globalCompositeOperation = 'source-over';
    };
  },
  frame(t) {
    this.render(t);
  },
});
