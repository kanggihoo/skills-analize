/*
 * 141 · 글로 그린 고래 — a paragraph typeset inside a shape that keeps changing.
 *
 * A deep-blue sea poster on paper. One invented Korean paragraph about a whale is set INSIDE a whale silhouette: the
 * whale exists only as its text (plus a faint body shadow and an eye the text flows around). It rises nose-up to
 * breathe (its spine bends, the flukes flick), arches over, dives, and its outline morphs into a big water drop;
 * the paragraph reflows into every in-between shape. One phrase, 「숨을 쉬러 올라온다」, keeps the single accent
 * colour through every layout.
 *
 * flow.js holds the pure half (shape, scanline spans, Knuth–Plass, keyframe solver); this file bakes the layouts in
 * setup and draws. Every syllable's path is its position in the first layout plus the steps between consecutive
 * layouts: drift inside a line is spread linearly over its interval; a change of line (or of the line's first/last
 * word) is a FLIP whose play window is centred on the interval, staggered by reading order, along a short arc —
 * a long one wraps like a carriage return instead. Through the dive the layouts are stages 0.45 s apart and every
 * word makes one staggered flight per stage. frame(t) only sums those steps and draws.
 */
import { defineDemo, rand, track, ease, clamp, lerp, smooth } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { TEXT, ACCENT, FS, LH, TAU, keyTimes, buildParagraph, makeShapes, solveLayouts } from './flow.js';

const D = 10;
const W = 1080, H = 1920;

// ---------------------------------------------------------------- tokens
const PAPER = '#ece3cf', INK = '#17366b', CREAM = '#f4ebd8', ACC = '#ff7d5d', SHADE = '#061838';
const CREAM_RGB = '244,235,216';
const SERIF = `"${FONTS.gowunBatang.family}"`, LATIN = `"${FONTS.instrumentSerif.family}"`;
const F_BODY = `400 ${FS}px ${SERIF}`, F_ACC = `700 ${FS}px ${SERIF}`;
const PX0 = 40, PX1 = 1040, PY0 = 236, PY1 = 1880;         // the sea panel inside the paper frame

// ---------------------------------------------------------------- placement (rigid: never reflows the text)
const OX = track([[0, 540], [2.2, 540], [4.3, 556], [5.3, 596], [6.9, 540]]);
const OY = track([[0, 1100], [2.2, 1090], [4.3, 950], [5.0, 930], [6.9, 1030]]);
const BOB = (t) => 6 * Math.sin((TAU * t) / 3.4);
const DEPTH = track([[0, 186], [2.2, 184], [4.3, 42], [5.0, 40], [7.2, 330], [10, 338]]);
const FLIP_T = (dist) => 0.34 + 0.22 * Math.min(1, dist / 500);   // flight time grows with the distance (s)
const STAG = 0.12;                                               // reading-order stagger across the paragraph (s)
const STAGE_STAG = 0.35;                                         // stagger inside a stage (fraction of the stage)
const WRAP = 200;                                                // longer layout changes wrap instead of flying (px)
const sstep = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * p * (p * (p * 6 - 15) + 10));

// ---------------------------------------------------------------- bakes
function offscreen(w, h, headless) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d', headless ? { willReadFrequently: true } : undefined) };
}
function grain(g, w, h, seed, amt) {
  const r = rand(seed), img = g.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const k = (r() - 0.5) * amt; d[i] += k; d[i + 1] += k; d[i + 2] += k * 0.9; }
  g.putImageData(img, 0, 0);
}

async function bakeSea(headless) {
  const { c, g } = offscreen(W, H, headless);
  const gr = g.createLinearGradient(0, PY0, 0, PY1);
  gr.addColorStop(0, '#3a72b6'); gr.addColorStop(0.24, '#24589d'); gr.addColorStop(0.62, '#163e7f'); gr.addColorStop(1, '#0a2250');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const top = g.createRadialGradient(470, PY0 - 80, 40, 470, PY0 - 80, 900);
  top.addColorStop(0, 'rgba(170,215,245,0.34)'); top.addColorStop(1, 'rgba(170,215,245,0)');
  g.fillStyle = top; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(540, 1000, 500, 540, 1000, 1250);
  vg.addColorStop(0, 'rgba(4,14,38,0)'); vg.addColorStop(1, 'rgba(4,14,38,0.45)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  grain(g, W, H, 141, 9);
  return createImageBitmap(c);
}

async function bakeRays(headless) {
  const { c, g } = offscreen(W, 1300, headless);
  g.filter = 'blur(22px)';
  for (const [x, w, a] of [[180, 120, 0.1], [380, 90, 0.07], [560, 150, 0.09], [770, 80, 0.06], [930, 120, 0.07]]) {
    const gr = g.createLinearGradient(0, 0, 0, 1300);
    gr.addColorStop(0, `rgba(200,230,250,${a})`); gr.addColorStop(1, 'rgba(200,230,250,0)');
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(x - w * 0.3, 0); g.lineTo(x + w * 0.3, 0); g.lineTo(x - 260 + w, 1300); g.lineTo(x - 260 - w * 0.6, 1300); g.fill();
  }
  return createImageBitmap(c);
}

async function bakeFrame(headless) {
  const { c, g } = offscreen(W, H, headless);
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  grain(g, W, H, 77, 12);
  const r = rand(78);
  g.globalAlpha = 0.06; g.strokeStyle = '#6b5a44'; g.lineWidth = 1;
  for (let i = 0; i < 180; i++) {
    const x = r() * W, y = r() * H, a = r() * TAU, l = 6 + r() * 20;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  g.globalAlpha = 1;
  g.fillStyle = INK; g.textBaseline = 'alphabetic';
  g.font = `700 66px ${SERIF}`; g.fillText('푸른', 60, 132);
  g.fillStyle = ACC; g.fillText('숨', 60 + g.measureText('푸른 ').width, 132);       // the accent's word, once more
  g.fillStyle = 'rgba(23,54,107,0.66)'; g.font = `400 25px ${SERIF}`;
  g.fillText('한 문단으로 지은 고래 한 마리', 62, 184);
  g.font = `400 23px ${SERIF}`; g.textAlign = 'right';
  g.fillText('수심', 1020, 92);
  g.textAlign = 'left';
  g.fillStyle = INK; g.fillRect(PX0, 210, PX1 - PX0, 2.5);
  g.clearRect(PX0, PY0, PX1 - PX0, PY1 - PY0);                // the sea panel shows through
  g.strokeStyle = 'rgba(23,54,107,0.5)'; g.lineWidth = 2;
  g.strokeRect(PX0 - 1, PY0 - 1, PX1 - PX0 + 2, PY1 - PY0 + 2);
  return createImageBitmap(c);
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '141-shape-text',
  title: '글로 그린 고래',
  tech: '모양 안 조판 · 스캔라인 구간 + Knuth–Plass 줄 나누기 + 단어 재배치',
  duration: D,
  background: PAPER,

  async setup(api) {
    await fontReady(F_BODY, TEXT);
    await fontReady(F_ACC, ACCENT);
    await fontReady(`700 66px ${SERIF}`, '푸른 숨');
    await fontReady(`400 25px ${SERIF}`, '한 문단으로 지은 고래 한 마리수심');
    await fontReady(`400 64px ${LATIN}`, '0123456789 m');
    const g = (this.ctx = api.canvas({ z: 0, attrs: api.headless ? { willReadFrequently: true } : undefined }).ctx);

    // ---- the paragraph, measured in its fonts, and every keyframe layout
    const P = (this.P = buildParagraph((ch, acc) => { g.font = acc ? F_ACC : F_BODY; return g.measureText(ch).width; }));
    const shapes = (this.shapes = makeShapes());
    const times = keyTimes();
    const L = solveLayouts(P, shapes, times);
    Object.assign(this, { KT: Float64Array.from(times), KX: L.KX, KY: L.KY, KS: L.KS, stats: L.stats });
    const K = times.length, NC = P.chars.length;

    // ---- motion: every syllable's path is its first position plus the steps between consecutive layouts.
    // A step inside the same line (same span, same first and last syllable) is drift: spread linearly over its
    // keyframe interval. Any other step is a layout change: a FLIP whose play window (length T) is centred on the
    // interval, so the text neither lags nor leads the shape and a change undone a keyframe later nearly cancels.
    this.steps = Array.from({ length: NC }, () => []);
    for (let k = 0; k + 1 < K; k++)
      for (let c = 0; c < NC; c++) {
        const i0 = k * NC + c, i1 = i0 + NC;
        const dx = L.KX[i1] - L.KX[i0], dy = L.KY[i1] - L.KY[i0], dist = Math.hypot(dx, dy);
        if (dist < 1e-4) continue;
        const flip = L.KSIG[i0] !== L.KSIG[i1] || dist > 18;
        const ord = P.chars[c].word / (P.nWords - 1), span = times[k + 1] - times[k];
        const line = Math.abs(dy) > LH * 0.5, sg = line ? Math.sign(dy) : Math.sign(dx);
        if (span > 0.2 && span < 1) {
          // a stage: one flight per word, staggered in reading order, windows of consecutive stages abut
          const a = times[k] + STAGE_STAG * span * ord;
          this.steps[c].push({ flip: true, stage: true, a, b: a + span, dx, dy, line, dist, sg });
        } else {
          const T = FLIP_T(dist), mid = (times[k] + times[k + 1]) / 2 + STAG * (ord - 0.5);
          this.steps[c].push(flip ? { flip, wrap: dist >= WRAP, a: mid - T / 2, b: mid + T / 2, dx, dy, line, dist, sg }
            : { flip, a: times[k], b: times[k + 1], dx, dy });
        }
      }

    // ---- bakes and particles
    this.sea = await bakeSea(api.headless);
    this.rays = await bakeRays(api.headless);
    this.frameImg = await bakeFrame(api.headless);
    const r = rand(1410);
    this.snow = Array.from({ length: 70 }, (_, i) => ({ x: PX0 + r() * (PX1 - PX0), y: PY0 + r() * (PY1 - PY0), v: 6 + r() * 14, ph: r() * TAU,
      rad: i < 58 ? 1 + r() * 1.8 : 3 + r() * 4, a: i < 58 ? 0.12 + r() * 0.28 : 0.06 + r() * 0.08 }));
    this.breath = Array.from({ length: 14 }, (_, i) => {
      const t0 = 3.85 + i * 0.07 + r() * 0.05, sh = shapes.at(t0), s = this.scaleAt(t0);
      return { t0, x0: OX(t0) + sh.blow[0] * s, y0: OY(t0) + BOB(t0) + sh.blow[1] * s, dx: (r() - 0.5) * 30, rad: 5 + r() * 9, v: 300 + r() * 160, ph: r() * TAU };
    });
    this.after = Array.from({ length: 20 }, (_, i) => ({ t0: 7.25 + i * 0.13 + r() * 0.1, u: r(), rad: 4 + r() * 10, v: 90 + r() * 90, ph: r() * TAU }));
  },

  /** scale at t: linear between keyframes */
  scaleAt(t) {
    const KT = this.KT, K = KT.length;
    if (t <= KT[0]) return this.KS[0];
    if (t >= KT[K - 1]) return this.KS[K - 1];
    let k = 0;
    while (KT[k + 1] < t) k++;
    return lerp(this.KS[k], this.KS[k + 1], (t - KT[k]) / (KT[k + 1] - KT[k]));
  },

  frame(t) {
    const g = this.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash([]);
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';

    // ---- sea, light, surface
    g.drawImage(this.sea, 0, 0);
    const breathe = Math.exp(-(((t - 4.35) / 0.55) ** 2));
    g.globalAlpha = 0.85 + 0.5 * breathe;
    g.drawImage(this.rays, 14 * Math.sin(t * 0.5), PY0 - 40);
    g.globalAlpha = 1;
    g.fillStyle = `rgba(${CREAM_RGB},0.08)`;
    g.beginPath(); g.moveTo(PX0, PY0);
    for (let x = PX0; x <= PX1; x += 20) g.lineTo(x, PY0 + 30 + 7 * Math.sin(x / 70 + t * 1.6) + 4 * Math.sin(x / 31 - t * 2.3));
    g.lineTo(PX1, PY0); g.fill();
    this.drawSnow(g, t, false);

    // ---- the body shadow at t, in stage coordinates
    const sh = this.shapes.at(t), s = this.scaleAt(t), ox = OX(t), oy = OY(t) + BOB(t);
    const intro = smooth(t / 0.7);
    const P = sh.P, n = P.length / 2;
    g.beginPath();
    for (let i = 0; i < n; i++) { const x = ox + P[i * 2] * s, y = oy + P[i * 2 + 1] * s; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.closePath();
    g.globalAlpha = 0.26 * intro; g.fillStyle = SHADE; g.fill();
    for (const [lw, a] of [[34, 0.05], [20, 0.06], [9, 0.07]]) { g.globalAlpha = a * intro; g.strokeStyle = SHADE; g.lineWidth = lw; g.stroke(); }
    g.globalAlpha = 1;

    // ---- the paragraph
    this.drawText(g, t, ox, oy);

    // ---- eye → highlight of the drop
    const hx = ox + sh.hole.x * s, hy = oy + sh.hole.y * s;
    const eyeA = intro * (1 - smooth(sh.m * 2.2));
    if (eyeA > 0.01) {
      let blink = 0;
      for (const b of [1.95, 3.25]) blink = Math.max(blink, 1 - Math.abs(t - b) / 0.08);
      g.globalAlpha = eyeA; g.strokeStyle = CREAM; g.lineWidth = 3;
      g.beginPath(); g.arc(hx, hy, 13 * s, 0, TAU); g.stroke();
      g.fillStyle = CREAM; g.beginPath(); g.ellipse(hx + 3 * s, hy - 1 * s, 6 * s, 6 * s * (1 - 0.85 * clamp(blink)), 0, 0, TAU); g.fill();
    }
    const hiA = smooth((sh.m - 0.55) / 0.45);
    if (hiA > 0.01) {
      g.globalAlpha = hiA * 0.9; g.strokeStyle = CREAM; g.lineWidth = 6;
      g.beginPath(); g.arc(hx + 10, hy + 6, 22, Math.PI * 1.02, Math.PI * 1.42); g.stroke();
      g.fillStyle = CREAM; g.beginPath(); g.arc(hx + 18, hy - 22, 4.5, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;

    // ---- breath bubbles from the blowhole
    for (const b of this.breath) {
      const age = t - b.t0;
      if (age < 0 || age > 1.6) continue;
      const bx = b.x0 + b.dx + 12 * Math.sin(age * 7 + b.ph), by = b.y0 - b.v * age - 60 * age * age;
      this.bubble(g, bx, by, b.rad * (0.6 + 0.4 * smooth(age / 0.3)), smooth(age / 0.15) * (1 - smooth((age - 1.1) / 0.5)) * clamp((by - PY0 - 20) / 80));
    }
    // ---- the drop settles: two rings echo its outline
    const drop = this.shapes.drop;
    for (const [t0, k] of [[7.08, 1], [7.3, 0.6]]) {
      const p = (t - t0) / 1.1;
      if (p <= 0 || p >= 1) continue;
      const sc = s * (1.06 + 0.32 * ease.outCubic(p));
      g.globalAlpha = 0.42 * k * (1 - p); g.strokeStyle = CREAM; g.lineWidth = 3;
      g.beginPath();
      for (let i = 0; i < n; i += 2) { const x = ox + drop[i * 2] * sc, y = oy + drop[i * 2 + 1] * sc; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.closePath(); g.stroke();
    }
    g.globalAlpha = 1;
    // ---- afterglow bubbles rising beside the drop (never across the text)
    for (const b of this.after) {
      const age = t - b.t0;
      if (age < 0) continue;
      const side = b.u < 0.5 ? -1 : 1, R = this.shapes.dropR * s;
      const bx = ox + side * (0.86 + 0.5 * Math.abs(b.u - 0.5)) * R + 10 * Math.sin(age * 3 + b.ph), by = oy + R * 0.9 - b.v * age;
      this.bubble(g, bx, by, b.rad, smooth(age / 0.3) * clamp((by - PY0 - 30) / 120));
    }

    this.drawSnow(g, t, true);
    g.globalAlpha = 1;
    g.drawImage(this.frameImg, 0, 0);
    this.drawDepth(g, t);
  },

  drawSnow(g, t, near) {
    const h = PY1 - PY0;
    g.fillStyle = CREAM;
    for (const s of this.snow) {
      if ((s.rad > 2.8) !== near) continue;
      const y = PY0 + ((((s.y - PY0 - s.v * t) % h) + h) % h), x = s.x + 10 * Math.sin(t * 0.7 + s.ph);
      g.globalAlpha = s.a;
      g.beginPath(); g.arc(x, y, s.rad, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
  },

  bubble(g, x, y, r, a) {
    if (a <= 0.01) return;
    g.globalAlpha = a * 0.75; g.strokeStyle = CREAM; g.lineWidth = 2;
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
    g.globalAlpha = a * 0.12; g.fillStyle = CREAM; g.fill();
    g.globalAlpha = a * 0.9;
    g.beginPath(); g.arc(x, y, r * 0.6, Math.PI * 1.15, Math.PI * 1.45); g.stroke();
    g.globalAlpha = 1;
  },

  drawDepth(g, t) {
    const txt = String(Math.round(DEPTH(t)));
    g.fillStyle = INK; g.font = `400 64px ${LATIN}`; g.textAlign = 'center';
    const cw = 30;                                             // fixed digit cells: the number never jitters
    let x = 1020 - 40 - txt.length * cw;
    for (const ch of txt) { g.fillText(ch, x + cw / 2, 168); x += cw; }
    g.textAlign = 'right'; g.font = `400 40px ${LATIN}`; g.fillText('m', 1020, 168);
    g.textAlign = 'left';
  },

  /** every syllable: keyframe interpolation + FLIP offsets; entrance in reading order; accent phrase emphasis */
  drawText(g, t, ox, oy) {
    const { KT, KX, KY, P } = this;
    const K = KT.length, NC = P.chars.length;
    const glow = smooth((t - 7.7) / 0.8);
    const draw = (acc) => {
      g.font = acc ? F_ACC : F_BODY;
      g.fillStyle = acc ? ACC : CREAM;
      for (let c = 0; c < NC; c++) {
        const ch = P.chars[c];
        if (ch.acc !== acc) continue;
        let x = KX[c], y = KY[c], lift = 0, vis = 1;
        for (const st of this.steps[c]) {
          if (t >= st.b) { x += st.dx; y += st.dy; continue; }
          if (t <= st.a) continue;
          const p = (t - st.a) / (st.b - st.a);
          if (st.wrap) {
            // a long change wraps like a carriage return: out past the old line end on a short arc, fading, then in
            // from before the new line start (reading order decides the side), so it never flies across other words
            if (p < 0.5) { const q = sstep(p * 2); x += st.sg * 34 * q; y -= 6 * Math.sin(Math.PI * q / 2); vis *= 1 - q; }
            else { const q = sstep(p * 2 - 1); x += st.dx - st.sg * 34 * (1 - q); y += st.dy - 6 * Math.cos(Math.PI * q / 2); vis *= q; }
            continue;
          }
          const e = st.stage ? 0.45 * p + 0.55 * sstep(p) : st.flip ? sstep(p) : p;   // stages never fully stop
          x += st.dx * e; y += st.dy * e;
          if (st.line) {                                         // a change of line takes a short arc, upward
            const bump = Math.min(40, 0.09 * st.dist) * Math.sin(Math.PI * e);
            let nx = -st.dy / st.dist, ny = st.dx / st.dist;
            if (ny > 0) { nx = -nx; ny = -ny; }
            x += nx * bump; y += ny * bump;
          }
          if (st.flip) lift = Math.max(lift, Math.sin(Math.PI * e) * Math.min(1, st.dist / 160));
        }
        // entrance: syllables appear in reading order, rising a little
        const ta = 0.4 + 1.45 * (c / NC), pa = clamp((t - ta) / 0.24);
        if (pa <= 0) continue;
        y += 10 * (1 - ease.outCubic(pa));
        let a = pa * vis * (1 - 0.35 * lift), sc = 1 - 0.06 * lift;
        if (a <= 0.004) continue;
        if (acc) sc += 0.16 * Math.exp(-(((t - 4.15 - 0.05 * ch.ai) / 0.18) ** 2));   // the phrase swells as the whale exhales
        else a *= 1 - 0.25 * glow;
        g.globalAlpha = a;
        if (sc !== 1) {
          g.setTransform(sc, 0, 0, sc, ox + x + (ch.w / 2) * (1 - sc), oy + y);
          g.fillText(ch.ch, 0, 0);
          g.setTransform(1, 0, 0, 1, 0, 0);
        } else g.fillText(ch.ch, ox + x, oy + y);
      }
    };
    draw(false);
    draw(true);
    g.globalAlpha = 1;
    // afterglow: an underline sweeps under the accent phrase in its final layout
    if (glow > 0) {
      const k = K - 1;
      const segs = [];
      for (const c of P.chars) {
        if (!c.acc) continue;
        const x = KX[k * NC + c.c], y = KY[k * NC + c.c], last = segs[segs.length - 1];
        if (last && Math.abs(last.y - y) < 1 && x - last.x1 < FS) last.x1 = x + c.w; else segs.push({ x0: x, x1: x + c.w, y });
      }
      let left = segs.reduce((a, q) => a + q.x1 - q.x0, 0) * ease.inOutCubic(clamp((t - 7.8) / 0.9));
      g.strokeStyle = ACC; g.lineWidth = 3.5; g.globalAlpha = 0.9;
      for (const q of segs) {
        if (left <= 0) break;
        const l = Math.min(left, q.x1 - q.x0);
        g.beginPath(); g.moveTo(ox + q.x0, oy + q.y + 9); g.lineTo(ox + q.x0 + l, oy + q.y + 9); g.stroke();
        left -= l;
      }
      g.globalAlpha = 1;
    }
  },
});
