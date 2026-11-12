/*
 * 97 · 양말 도둑 — 말하는 자막 · 단어 단위 타이밍 + 하이라이트 필 + 강조 팝
 *
 * A 9.6-second spoken hook in the short-form style: "매일 밤 양말이 한 짝씩 사라지는 이유, 드디어 찾았어요.
 * 범인은 바로… 얘였어요! 근데 너무 귀여워서 봐줬어요." One table of word timings (SPEECH, the way a forced
 * aligner returns them) drives everything on screen:
 *   - captions: phrases → pages (break at , . ! ?), pages → one or two lines by 어절 and width (measured once),
 *     a pill that slides and resizes from word box to word box (FLIP: first/last rects measured in setup, the
 *     leading edge eases faster than the trailing one), spoken words bright, upcoming words dim, key words pop
 *     (overshoot + accent colour + a swoosh drawn under them), pages push the old lines up and out
 *   - the speaker: syllable onsets from the table, the vowel of each syllable picks the mouth shape (Hangul
 *     decomposition), ㅁ/ㅂ/ㅍ close the lips, pauses close the mouth; the waveform chip is drawn from the same envelope
 *   - the scene: every story beat (socks pop, one sock vanishes, the torch, the cat) is keyed to a word's start time
 * Determinism: frame(t) is a closed-form function of t; static art is baked in setup; the context is reset each frame.
 */
import { defineDemo, rand, ease, clamp, lerp, smooth, track } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const W = 1080, H = 1920, D = 9.6;
const TAU = Math.PI * 2;
const SANS = `"${FONTS.pretendard.family}"`;

// ---------------------------------------------------------------- palette (night room → warm at the end)
const INK = '#17132c';
const ACC = '#ffd23f';                       // the one accent: pill, key words, swooshes, impact
const ACC_RGB = [255, 210, 63], INK_RGB = [23, 19, 44], WHITE_RGB = [255, 255, 255];
const SKIN = '#f3c39c', HAIR = '#3b2741', PJ = '#6f7fe2', PJ2 = '#8693ee', BLANKET = '#2f7f86', BLANKET2 = '#3f9a9f';
const BASKET = '#c99158', BASKET2 = '#9b6535', CAT = '#f29c4b', CAT2 = '#d2722b', CREAM = '#fff3dd';
const SOCKS = [
  { base: '#ef7a6d', stripe: '#fff1d6', cuff: '#c9574d', patch: '#fff1d6', dots: false },
  { base: '#78d0bd', stripe: '#fbf4dc', cuff: '#4fae9b', patch: '#3e9c8a', dots: false },   // the pair that loses one
  { base: '#a98ae6', stripe: '#fff1d6', cuff: '#8467c9', patch: '#fff1d6', dots: true },
];

// ================================================================ the speech timing table (seconds)
// [word as spoken/written, start, end, emphasis (1 = key word, 2 = the hero word)]
const SPEECH = [
  ['매일', 0.42, 0.70],
  ['밤', 0.72, 0.94],
  ['양말이', 1.00, 1.46, 1],
  ['한', 1.56, 1.72],
  ['짝씩', 1.74, 2.02],
  ['사라지는', 2.08, 2.60, 1],
  ['이유,', 2.64, 2.96],
  ['드디어', 3.22, 3.58],
  ['찾았어요.', 3.64, 4.18, 1],
  ['범인은', 4.42, 4.80],
  ['바로…', 4.86, 5.20],
  ['얘였어요!', 5.48, 6.16, 2],
  ['근데', 6.90, 7.12],
  ['너무', 7.16, 7.42],
  ['귀여워서', 7.46, 7.96, 1],
  ['봐줬어요.', 8.04, 8.66],
];

// ---------------------------------------------------------------- Hangul → mouth shapes
// vowel (중성) index → viseme; ㅁ ㅂ ㅃ ㅍ as onset / ㅁ ㅂ ㅄ ㅍ as coda close the lips
const VIS = {
  a: { open: 1.0, wide: 1.0, round: 0 }, e: { open: 0.62, wide: 1.14, round: 0 }, eo: { open: 0.74, wide: 0.9, round: 0.35 },
  o: { open: 0.56, wide: 0.68, round: 1 }, u: { open: 0.4, wide: 0.6, round: 1 }, eu: { open: 0.3, wide: 1.12, round: 0 },
  i: { open: 0.32, wide: 1.22, round: 0 },
};
const JUNG_VIS = ['a', 'e', 'a', 'e', 'eo', 'e', 'eo', 'e', 'o', 'a', 'e', 'e', 'o', 'u', 'eo', 'e', 'i', 'u', 'eu', 'i', 'i'];
const BILAB_ON = new Set([6, 7, 8, 17]), BILAB_CODA = new Set([16, 17, 18, 26]);
function decompose(ch) {
  const c = ch.codePointAt(0) - 0xac00;
  if (c < 0 || c > 11171) return null;
  const jong = c % 28, jung = ((c - jong) / 28) % 21, cho = Math.floor(c / 588);
  return { cho, jung, jong };
}

// ---------------------------------------------------------------- the table → words, syllables, pages
const WORDS = SPEECH.map(([raw, s, e, emph = 0], i) => {
  const disp = raw.replace(/\.$/, '');                       // captions drop the full stop, keep , … ! ?
  const punct = /[,.!?…]$/.test(raw);
  const parts = Array.from(raw).map(decompose).filter(Boolean);
  const wts = parts.map((_, j) => (j === parts.length - 1 && punct ? 1.3 : 1));
  const tot = wts.reduce((a, b) => a + b, 0);
  let acc = 0;
  const syl = parts.map((p, j) => {
    const on = s + (e - s) * acc / tot;
    acc += wts[j];
    return { on, dur: (e - s) * wts[j] / tot, vis: VIS[JUNG_VIS[p.jung]], bOn: BILAB_ON.has(p.cho), bCoda: BILAB_CODA.has(p.jong), loud: 0.75 + 0.25 * hash(i * 7 + j, 3) };
  });
  return { i, raw, disp, s, e, emph, punct, syl, n: parts.length };
});
// phrase → page: a page ends after , . ! ? (not …) or before a pause ≥ 0.45 s
const PAGES = [];
{
  let cur = [];
  WORDS.forEach((w, i) => {
    cur.push(i);
    const next = WORDS[i + 1];
    if (!next || /[,.!?]$/.test(w.raw) || next.s - w.e >= 0.45) { PAGES.push({ words: cur }); cur = []; }
  });
  PAGES.forEach((P, p) => {
    P.words.forEach((i) => { WORDS[i].page = p; });
    const first = WORDS[P.words[0]], prev = p > 0 ? WORDS[PAGES[p - 1].words.at(-1)] : null;
    P.tin = prev ? Math.max(prev.e + 0.06, first.s - 0.3) : Math.max(0.05, first.s - 0.3);
  });
  PAGES.forEach((P, p) => { P.tout = p + 1 < PAGES.length ? PAGES[p + 1].tin : Infinity; });
}
const LAST = WORDS[WORDS.length - 1];
const at = (raw) => WORDS.find((w) => w.raw === raw).s;
// story beats, all read from the table
const T_SOCKS = at('양말이'), T_ONE = at('짝씩'), T_VANISH = at('사라지는'), T_WHY = at('이유,');
const T_RAISE = at('드디어'), T_FOUND = at('찾았어요.'), T_WHO = at('범인은'), T_PEEK = at('바로…'), T_REVEAL = at('얘였어요!');
const T_BUT = at('근데'), T_CUTE = at('귀여워서'), T_FORGIVE = at('봐줬어요.');
const T_IN = T_VANISH + 0.36;                 // the yanked sock dives into the basket

// ---------------------------------------------------------------- small closed-form motion helpers
function hash(a, b = 0) {
  let h = Math.imul(a | 0, 0x9e3779b1) ^ Math.imul((b | 0) + 0x632be5ab, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const wobble = (t, f = 3, d = 5) => (t <= 0 ? 0 : Math.exp(-d * t) * Math.sin(TAU * f * t));
const spring = (t, f = 1.6, d = 6) => (t <= 0 ? 0 : 1 - Math.exp(-d * t) * Math.cos(TAU * f * t));
/** a pop: up to 1 in `rise` s (out-cubic), then a damped swing back through 0 */
const pulse = (t, rise = 0.07, f = 2.0, d = 9) => (t <= 0 ? 0 : t < rise ? ease.outCubic(t / rise) : Math.exp(-d * (t - rise)) * Math.cos(TAU * f * (t - rise)));
const win = (t, a, b, fi = 0.15, fo = 0.15) => smooth((t - a) / fi) * (1 - smooth((t - b) / fo));
const mixRGB = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(4)})`;

// ================================================================ the voice: mouth + waveform envelope from the table
function voice(t) {
  for (const w of WORDS) {
    if (t < w.s - 0.02 || t > w.e + 0.12) continue;
    if (t < w.e) {
      let j = w.syl.length - 1;
      while (j > 0 && w.syl[j].on > t) j--;
      const y = w.syl[j], u = clamp((t - y.on) / y.dur), v = y.vis;
      let a = y.bOn ? smooth((u - 0.1) / 0.2) : smooth(u / 0.18);          // lips part on the onset (after a closure for ㅁㅂㅍ)
      a *= 1 - 0.5 * smooth((u - 0.6) / 0.4);                               // half-close toward the next syllable (the flap)
      if (y.bCoda) a *= 1 - smooth((u - 0.62) / 0.24);                       // ㅁ/ㅂ coda: lips shut
      const p = j > 0 ? w.syl[j - 1].vis : v, k = smooth(u / 0.3);
      return { open: a * v.open, wide: lerp(p.wide, v.wide, k), round: lerp(p.round, v.round, k), amp: a * (0.55 + 0.45 * v.open) * y.loud };
    }
    const y = w.syl[w.syl.length - 1], k = 1 - smooth((t - w.e) / 0.09);
    const end = y.bCoda ? 0 : 0.5 * y.vis.open;
    return { open: end * k, wide: y.vis.wide, round: y.vis.round, amp: 0.4 * end * k * y.loud };
  }
  return { open: 0, wide: 1, round: 0, amp: 0 };
}

// ================================================================ captions
const F = 96;                                 // caption size (px), Pretendard 900
const TRACK = -0.02 * F;
const PITCH = 1.5 * F, YC = 1432, MAXW = 900;
const PADX = 18, PADT = 15, PADB = 13;
const DIM_A = 0.4;
let ASC = 80, DSC = 14;

function layoutCaptions(m) {
  m.font = `900 ${F}px ${SANS}`;
  m.letterSpacing = `${TRACK}px`;
  const ref = m.measureText('가힣봐');
  ASC = ref.actualBoundingBoxAscent; DSC = ref.actualBoundingBoxDescent;
  const GAP = 0.36 * F;
  for (const w of WORDS) {
    const mm = m.measureText(w.disp);
    w.adv = mm.width - TRACK;               // drop the tracking after the last glyph
    w.inkL = mm.actualBoundingBoxLeft; w.inkR = mm.actualBoundingBoxRight;
  }
  const width = (ids) => ids.reduce((a, i) => a + WORDS[i].adv, 0) + GAP * (ids.length - 1);
  for (const P of PAGES) {
    const ids = P.words, syl = ids.reduce((a, i) => a + WORDS[i].n, 0);
    let lines = [ids];
    if (width(ids) > MAXW || syl > 9) {
      // two lines, broken between 어절: balance the widths, never end a line on a one-syllable word (한, 그 …),
      // prefer a break after punctuation, and on a tie the longer first line
      let best = null;
      for (let b = 1; b < ids.length; b++) {
        const a1 = ids.slice(0, b), a2 = ids.slice(b), w1 = width(a1), w2 = width(a2);
        if (Math.max(w1, w2) > MAXW) continue;
        const endW = WORDS[ids[b - 1]];
        const cost = Math.abs(w1 - w2) + (endW.n === 1 ? 400 : 0) - (endW.punct ? 60 : 0) - 0.05 * w1;
        if (!best || cost < best.cost) best = { cost, lines: [a1, a2] };
      }
      lines = best.lines;
    }
    P.lines = lines.map((ids2, l) => {
      const n = lines.length, lw = width(ids2);
      const base = YC + (l - (n - 1) / 2) * PITCH + 0.36 * F;
      let x = W / 2 - lw / 2;
      for (const i of ids2) {
        const w = WORDS[i];
        w.line = l; w.x = x; w.base = base;
        w.bx0 = x - w.inkL; w.bx1 = x + w.inkR;
        w.cx = (w.bx0 + w.bx1) / 2; w.cy = base - (ASC - DSC) / 2;
        x += w.adv + GAP;
      }
      return { ids: ids2, cx: W / 2, cy: base - (ASC - DSC) / 2, base };
    });
  }
  // the push: the outgoing page moves up by exactly the distance the incoming one rises, so the two blocks travel
  // together with a constant gap (a rolling caption window) instead of crossing
  PAGES.forEach((P, p) => {
    const h = (Q) => Q.lines.length * PITCH;
    P.din = p ? (h(PAGES[p - 1]) + h(P)) / 2 + 0.5 * F : 1.1 * F;
    P.dout = p + 1 < PAGES.length ? (h(P) + h(PAGES[p + 1])) / 2 + 0.5 * F : 0;
  });
}

/**
 * a page line's motion: it rises in from below (the gap under the outgoing page) and is pushed up and out when the
 * next page rises — both on the same quick ease, lines 0.03 s apart. Lines fade by their height in the caption
 * window (soft edges above y 1300 and below y 1600) and by time on the way out.
 */
const PUSH = (u) => 1 - Math.pow(1 - clamp(u), 4);       // quart out
const PUSH_DUR = 0.42;
function lineXf(P, l, t) {
  const ti = t - (P.tin + l * 0.03);
  if (ti < 0) return null;
  let dy = P.din * (1 - PUSH(ti / PUSH_DUR)), a = smooth(ti / 0.12);
  const s = 0.96 + 0.04 * ease.outCubic(clamp(ti / 0.3));
  const to = t - (P.tout + l * 0.03);
  if (to > 0) { dy -= P.dout * PUSH(to / PUSH_DUR); a *= 1 - smooth((to - 0.04) / 0.26); }
  const cy = P.lines[l].cy + dy;
  a *= smooth((cy - 1282) / 76) * smooth((1690 - cy) / 96);
  return a > 0.002 ? { dy, a, s } : null;
}
/** index of the word the pill is on (the last one that has started), −1 before the first */
function currentWord(t) {
  let k = -1;
  for (let i = 0; i < WORDS.length; i++) if (WORDS[i].s <= t) k = i;
  return k;
}
/** how far the pill has arrived on word k (0..1), whether it slid within a page, and the fade after the last word */
function pillArrival(k, t) {
  const w = WORDS[k], tau = t - w.s;
  const slide = k > 0 && WORDS[k - 1].page === w.page;
  const arrive = slide ? ease.outCubic(clamp(tau / 0.12)) : clamp(tau / 0.08);
  const fade = 1 - smooth((t - LAST.e - 0.3) / 0.35);
  return { slide, arrive, fade, tau };
}
/** weight of "the pill is on me" for word i: drives the ink-on-yellow colour and the outline fade */
function pillWeight(i, t, k, A) {
  if (k < 0) return 0;
  if (i === k) return A.arrive * A.fade;
  if (i === k - 1 && A.slide) return 1 - A.arrive;
  return 0;
}
/** key-word pop: scale overshoot + a little rotation; ordinary words get a small tick */
function wordPop(w, t, cw) {
  const tau = t - w.s;
  if (tau < 0) return { s: 1, r: 0 };
  if (!w.emph) return { s: 1 + 0.055 * pulse(tau, 0.05, 2.2, 12), r: 0 };
  const hero = w.emph === 2;
  const s = 1 + (hero ? 0.46 : 0.3) * pulse(tau, 0.07, 2.0, hero ? 7 : 9) + (hero ? 0.13 * smooth(tau / 0.25) : 0.06 * cw);
  const r = (hero ? -0.09 : -0.06) * Math.exp(-6 * tau) * Math.sin(TAU * 2.6 * tau + 0.6);
  return { s, r };
}
/**
 * every visible word's affine (stage px) this frame: line transform ∘ word pop about the word centre.
 * A popping word pushes its neighbours on the line aside by the width it gains (and pulls them back as it settles),
 * so the pill never runs into the next word.
 */
function captionItems(t, k, A) {
  const items = [];
  PAGES.forEach((P) => P.lines.forEach((L, l) => {
    const X = lineXf(P, l, t);
    if (!X) return;
    const ws = L.ids.map((i) => { const w = WORDS[i], cw = pillWeight(i, t, k, A); return { w, cw, pop: wordPop(w, t, cw) }; });
    const ext = ws.map((q) => (q.pop.s - 1) * ((q.w.bx1 - q.w.bx0) / 2 + PADX));
    ws.forEach((q, j) => {
      let dx = 0;
      for (let m = 0; m < ws.length; m++) dx += m < j ? ext[m] : m > j ? -ext[m] : 0;
      const cx = L.cx + (q.w.cx + dx - L.cx) * X.s, cy = L.cy + (q.w.cy - L.cy) * X.s + X.dy;
      items.push([q.w, { cx, cy, s: X.s * q.pop.s, ls: X.s, r: q.pop.r, a: X.a, cw: q.cw }]);
    });
  }));
  return items;
}
function pillRectOf(w, xf) {
  const hw = (w.bx1 - w.bx0) / 2 + PADX, top = ASC + PADT, bot = DSC + PADB;
  const oy = w.cy - w.base;                              // centre relative to baseline
  return { cx: xf.cx, cy: xf.cy, hw: hw * xf.s, ht: (top + oy) * xf.s, hb: (bot - oy) * xf.s, r: xf.r, a: xf.a };
}

function drawWordText(g, w, xf) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(xf.cx, xf.cy);
  if (xf.r) g.rotate(xf.r);
  g.scale(xf.s, xf.s);
  g.translate(-w.cx, -w.cy);
}

/** a swoosh under a key word, drawn on with its progress (filled tapered stroke + ink edge) */
function swoosh(g, w, xf, pr, hero) {
  if (pr <= 0.001) return;
  const x0 = w.bx0 - 12, x1 = w.bx1 + 18, yb = w.base + DSC + PADB;
  const P0 = [x0, yb + 12], C1 = [lerp(x0, x1, 0.3), yb + 26], C2 = [lerp(x0, x1, 0.72), yb + 18], P3 = [x1, yb];
  const bz = (u) => {
    const v = 1 - u;
    return [v * v * v * P0[0] + 3 * v * v * u * C1[0] + 3 * v * u * u * C2[0] + u * u * u * P3[0],
      v * v * v * P0[1] + 3 * v * v * u * C1[1] + 3 * v * u * u * C2[1] + u * u * u * P3[1]];
  };
  const N = 26, wmax = hero ? 17 : 12, L = [], R = [];
  for (let s = 0; s <= N; s++) {
    const u = (s / N) * pr, p = bz(u), q = bz(Math.min(1, u + 0.01)), p0 = bz(Math.max(0, u - 0.01));
    let tx = q[0] - p0[0], ty = q[1] - p0[1];
    const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const wd = wmax * Math.pow(Math.sin(Math.PI * clamp(u * 0.92 + 0.04)), 0.6) * (0.55 + 0.45 * u);
    L.push([p[0] - ty * wd / 2, p[1] + tx * wd / 2]); R.push([p[0] + ty * wd / 2, p[1] - tx * wd / 2]);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(xf.cx, xf.cy);
  g.scale(xf.s, xf.ls);                   // stretches with the pop, stays at the line's height
  g.translate(-w.cx, -w.cy);
  g.beginPath();
  g.moveTo(L[0][0], L[0][1]);
  for (const p of L) g.lineTo(p[0], p[1]);
  for (let s = R.length - 1; s >= 0; s--) g.lineTo(R[s][0], R[s][1]);
  g.closePath();
  g.globalAlpha = xf.a;
  g.lineJoin = 'round'; g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  g.fillStyle = ACC; g.fill();
  g.globalAlpha = 1;
}

function drawCaptions(g, t) {
  const k = currentWord(t);
  const A = k >= 0 ? pillArrival(k, t) : null;
  const items = captionItems(t, k, A);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.font = `900 ${F}px ${SANS}`;
  g.letterSpacing = `${TRACK}px`;
  g.textBaseline = 'alphabetic';
  g.textAlign = 'left';
  g.lineJoin = 'round';
  // 1 · hard drop shadows (sticker style, no blur)
  g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 0.17 * F;
  for (const [w, xf] of items) {
    const up = w.i > k;
    drawWordText(g, w, { ...xf, cy: xf.cy + 9 });
    g.globalAlpha = xf.a * (up ? 0.3 : 0.55);
    g.strokeText(w.disp, w.x, w.base); g.fillText(w.disp, w.x, w.base);
  }
  g.globalAlpha = 1;
  // 2 · swooshes under the key words, drawn on as they are spoken; the popping pill and the next line stay on top
  for (const [w, xf] of items) {
    if (!w.emph) continue;
    const pr = ease.outCubic(clamp((t - w.s - 0.05) / (w.emph === 2 ? 0.3 : 0.24)));
    swoosh(g, w, xf, pr, w.emph === 2);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.lineJoin = 'round';
  // 3 · the pill: slides and resizes between the measured word rects (FLIP); the leading edge moves first
  if (k >= 0) {
    const wk = WORDS[k], xk = items.find((it) => it[0] === wk);
    if (xk) {
      let R = pillRectOf(wk, xk[1]);
      if (A.slide) {
        const wp = WORDS[k - 1], xp = items.find((it) => it[0] === wp);
        if (xp) {
          const R0 = pillRectOf(wp, xp[1]), tau = A.tau;
          const sameLine = wp.line === wk.line;
          const eL = ease.outCubic(clamp(tau / (sameLine ? 0.085 : 0.11))), eT = ease.outCubic(clamp(tau / (sameLine ? 0.17 : 0.15)));
          const eM = ease.outCubic(clamp(tau / 0.13));
          const right = R.cx > R0.cx;
          const l0 = R0.cx - R0.hw, r0 = R0.cx + R0.hw, l1 = R.cx - R.hw, r1 = R.cx + R.hw;
          const l = lerp(l0, l1, right ? eT : eL), r = lerp(r0, r1, right ? eL : eT);
          R = { cx: (l + r) / 2, hw: (r - l) / 2, cy: lerp(R0.cy, R.cy, eM), ht: lerp(R0.ht, R.ht, eM), hb: lerp(R0.hb, R.hb, eM),
            r: lerp(R0.r, R.r, eM), a: R.a };
        }
      } else {
        const e = 0.55 + 0.45 * ease.outBack(clamp(A.tau / 0.24), 2.2);
        R = { ...R, hw: R.hw * e, ht: R.ht * e, hb: R.hb * e, a: R.a * clamp(A.tau / 0.06) };
      }
      const fe = A.fade, a = R.a * fe;
      if (a > 0.002) {
        const sh = 0.7 + 0.3 * fe;
        const hw = R.hw * sh, ht = R.ht * sh, hb = R.hb * sh;
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.translate(R.cx, R.cy);
        if (R.r) g.rotate(R.r);
        const rad = Math.min(30, (ht + hb) / 2);
        g.globalAlpha = a * 0.6; g.fillStyle = INK;
        g.beginPath(); g.roundRect(-hw, -ht + 8, hw * 2, ht + hb, rad); g.fill();
        g.globalAlpha = a; g.fillStyle = ACC;
        g.beginPath(); g.roundRect(-hw, -ht, hw * 2, ht + hb, rad); g.fill();
        g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
        g.globalAlpha = a * 0.45; g.fillStyle = '#fff6cf';   // a soft gloss on the upper edge
        g.beginPath(); g.roundRect(-hw + 12, -ht + 8, hw * 2 - 24, 9, 5); g.fill();
        g.globalAlpha = 1;
      }
    }
  }
  // 4 · words: outline, then fill (dim → ink on the pill → white, or the accent for key words)
  g.lineWidth = 0.17 * F; g.strokeStyle = INK;
  for (const [w, xf] of items) {
    const cw = xf.cw, up = w.i > k || (w.i === k && cw < 1 && !A.slide && A.tau < 0.08);
    const spokenC = w.emph ? ACC_RGB : WHITE_RGB;
    const before = w.i >= k ? WHITE_RGB : spokenC;
    const beforeA = w.i >= k ? DIM_A : 1;
    let col = before, ca = beforeA;
    if (cw > 0) { col = mixRGB(before, INK_RGB, cw); ca = lerp(beforeA, 1, cw); }
    if (w.i === k && A && A.fade < 1) { col = mixRGB(spokenC, INK_RGB, cw); ca = 1; }
    drawWordText(g, w, xf);
    g.globalAlpha = xf.a * (1 - cw) * (up ? 0.9 : 1);
    if (g.globalAlpha > 0.003) g.strokeText(w.disp, w.x, w.base);
    g.globalAlpha = xf.a;
    g.fillStyle = rgba(col, ca);
    g.fillText(w.disp, w.x, w.base);
  }
  g.globalAlpha = 1;
  g.setTransform(1, 0, 0, 1, 0, 0);
}

// ================================================================ the speaker chip: a waveform drawn from the timing
const CHIP = { x: 540, y: 1252, w: 420, h: 66 };
const BAR_DT = 1 / 24, BAR_V = 250;            // one bar per 1/24 s, scrolling 250 px/s (now = centre)
function drawChip(g, t) {
  const a = smooth((t - 0.1) / 0.3) * (1 - smooth((t - LAST.e - 0.4) / 0.4) * 0.6);
  if (a < 0.003) return;
  const { x, y, w, h } = CHIP;
  const pop = 0.9 + 0.1 * ease.outBack(clamp((t - 0.1) / 0.35));
  g.setTransform(pop, 0, 0, pop, x * (1 - pop), y * (1 - pop));
  g.globalAlpha = a;
  g.fillStyle = 'rgba(14,12,36,0.62)';
  g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.fill();
  g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.14)'; g.stroke();
  // speaker icon, its sound arcs lit by the envelope
  const v = voice(t), ix = x - w / 2 + 40;
  g.fillStyle = '#fff';
  g.beginPath(); g.moveTo(ix - 14, y - 7); g.lineTo(ix - 6, y - 7); g.lineTo(ix + 5, y - 16); g.lineTo(ix + 5, y + 16); g.lineTo(ix - 6, y + 7); g.lineTo(ix - 14, y + 7); g.closePath(); g.fill();
  g.lineCap = 'round'; g.lineWidth = 3.5;
  for (let j = 0; j < 2; j++) {
    g.strokeStyle = rgba(ACC_RGB, clamp(0.25 + v.amp * 1.6 - j * 0.35));
    g.beginPath(); g.arc(ix + 6, y, 11 + j * 9, -0.9, 0.9); g.stroke();
  }
  // bars: one per absolute time slot, so they scroll with t; past = white, future = dim, key words = accent
  const x0 = x - w / 2 + 78, x1 = x + w / 2 - 26, cx = (x0 + x1) / 2;
  const n0 = Math.floor((t - (cx - x0) / BAR_V) / BAR_DT), n1 = Math.ceil((t + (x1 - cx) / BAR_V) / BAR_DT);
  g.lineWidth = 5.5;
  for (let n = n0; n <= n1; n++) {
    const tn = n * BAR_DT, bx = cx + (tn - t) * BAR_V;
    if (bx < x0 || bx > x1) continue;
    const e = Math.min(1, (bx - x0) / 30, (x1 - bx) / 30);
    const amp = voice(tn).amp * (0.62 + 0.38 * hash(n, 11));
    const hh = 3 + 40 * amp;
    const kw = WORDS.find((q) => q.emph && tn >= q.s && tn <= q.e);
    const past = tn <= t;
    g.strokeStyle = kw && past ? ACC : past ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.3)';
    g.globalAlpha = a * e;
    g.beginPath(); g.moveTo(bx, y - hh / 2); g.lineTo(bx, y + hh / 2); g.stroke();
  }
  g.globalAlpha = a;
  g.fillStyle = ACC;                                   // the playhead
  g.beginPath(); g.arc(cx, y + h / 2 - 9, 3.5, 0, TAU); g.fill();
  g.globalAlpha = 1; g.lineCap = 'butt';
  g.setTransform(1, 0, 0, 1, 0, 0);
}

// ================================================================ the scene
const PX = 330, PY = 650, PR = 150;           // the speaker's head
const BX = 872, RY = 1004;                    // the laundry basket (centre x, rim y)
const FLOOR_Y = 1070;
const lineY = (x) => { const u = (x - 10) / 1060; return (1 - u) * (1 - u) * 168 + 2 * u * (1 - u) * 248 + u * u * 176; };
const PAIRS = [610, 790, 966];

let HEADLESS = false;
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d', HEADLESS ? { willReadFrequently: true } : undefined) };
}
const fillStroke = (g, fill, lw = 6) => { g.fillStyle = fill; g.fill(); g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); };

function bakeRoom() {
  const { c, g } = mk(W, H);
  // wall
  let gr = g.createLinearGradient(0, 0, 0, FLOOR_Y);
  gr.addColorStop(0, '#272d66'); gr.addColorStop(1, '#1c2050');
  g.fillStyle = gr; g.fillRect(0, 0, W, FLOOR_Y);
  g.fillStyle = 'rgba(255,255,255,0.028)';
  for (let x = 0; x < W; x += 54) g.fillRect(x, 0, 22, FLOOR_Y);
  const r = rand(97);
  g.fillStyle = 'rgba(255,255,255,0.05)';
  for (let x = 27; x < W; x += 54) for (let y = 30; y < FLOOR_Y; y += 60) { g.beginPath(); g.arc(x + 11, y + (x % 108 ? 30 : 0), 3, 0, TAU); g.fill(); }
  // window: night sky, moon, frame, curtains
  g.save();
  g.beginPath(); g.roundRect(64, 96, 260, 356, 22); g.clip();
  gr = g.createLinearGradient(0, 96, 0, 452); gr.addColorStop(0, '#0d113a'); gr.addColorStop(1, '#253378');
  g.fillStyle = gr; g.fillRect(64, 96, 260, 356);
  gr = g.createRadialGradient(236, 196, 30, 236, 196, 170); gr.addColorStop(0, 'rgba(255,240,200,0.45)'); gr.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = gr; g.fillRect(64, 96, 260, 356);
  g.fillStyle = '#fff2c8'; g.beginPath(); g.arc(236, 196, 40, 0, TAU); g.fill();
  g.fillStyle = 'rgba(214,196,150,0.55)'; g.beginPath(); g.arc(222, 186, 8, 0, TAU); g.fill(); g.beginPath(); g.arc(250, 214, 6, 0, TAU); g.fill();
  // far roofs
  g.fillStyle = '#141a4a';
  g.beginPath(); g.moveTo(64, 452); g.lineTo(64, 380); g.lineTo(120, 380); g.lineTo(120, 352); g.lineTo(176, 352); g.lineTo(176, 396); g.lineTo(240, 396); g.lineTo(240, 366); g.lineTo(324, 366); g.lineTo(324, 452); g.fill();
  g.fillStyle = 'rgba(255,214,140,0.5)';
  [[132, 366], [150, 366], [252, 380], [276, 380], [84, 396]].forEach(([x, y]) => g.fillRect(x, y, 9, 11));
  g.restore();
  g.beginPath(); g.roundRect(64, 96, 260, 356, 22); g.lineWidth = 16; g.strokeStyle = '#3a4384'; g.stroke();
  g.lineWidth = 10; g.beginPath(); g.moveTo(194, 100); g.lineTo(194, 448); g.moveTo(68, 274); g.lineTo(320, 274); g.stroke();
  g.lineWidth = 5; g.strokeStyle = INK; g.beginPath(); g.roundRect(56, 88, 276, 372, 28); g.stroke();
  g.fillStyle = '#3a4384'; g.beginPath(); g.roundRect(40, 452, 308, 26, 10); g.fill(); g.lineWidth = 5; g.stroke();
  // curtains
  const curtain = (x0, dir) => {
    g.beginPath(); g.moveTo(x0, 70);
    g.bezierCurveTo(x0 + dir * 70, 70, x0 + dir * 80, 300, x0 + dir * 40, 520);
    g.quadraticCurveTo(x0 + dir * 20, 540, x0, 530); g.closePath();
    fillStroke(g, '#463c8e', 5);
    g.strokeStyle = 'rgba(20,16,60,0.35)'; g.lineWidth = 4;
    for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(x0 + dir * 20 * k, 80); g.quadraticCurveTo(x0 + dir * 26 * k, 300, x0 + dir * 12 * k, 520); g.stroke(); }
  };
  curtain(24, 1); curtain(364, -1);
  g.fillStyle = '#2c2560'; g.beginPath(); g.roundRect(10, 60, 370, 18, 9); g.fill();
  // floor
  gr = g.createLinearGradient(0, FLOOR_Y, 0, H); gr.addColorStop(0, '#191b44'); gr.addColorStop(1, '#0f1131');
  g.fillStyle = gr; g.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 3;
  for (let k = -6; k <= 12; k++) { g.beginPath(); g.moveTo(540 + k * 90, FLOOR_Y); g.lineTo(540 + k * 260, H); g.stroke(); }
  g.fillStyle = '#15173d'; g.fillRect(0, FLOOR_Y - 18, W, 22);
  g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(0, FLOOR_Y - 18, W, 4);
  // rug under the basket
  g.fillStyle = '#2e3478'; g.beginPath(); g.ellipse(BX, 1228, 210, 50, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 4; g.setLineDash([10, 10]);
  g.beginPath(); g.ellipse(BX, 1228, 186, 40, 0, 0, TAU); g.stroke(); g.setLineDash([]);
  // the headboard and the pillow (behind the speaker)
  g.beginPath(); g.roundRect(26, 760, 620, 380, [70, 70, 0, 0]); fillStroke(g, '#3a2d5e', 6);
  g.beginPath(); g.roundRect(60, 794, 552, 300, [50, 50, 0, 0]); g.fillStyle = '#46386f'; g.fill();
  g.beginPath(); g.roundRect(96, 790, 470, 150, 64); fillStroke(g, '#dcd8f5', 6);
  g.strokeStyle = 'rgba(80,70,140,0.25)'; g.lineWidth = 5; g.beginPath(); g.moveTo(140, 900); g.quadraticCurveTo(330, 930, 520, 900); g.stroke();
  // a framed doodle on the wall (right)
  g.beginPath(); g.roundRect(820, 470, 150, 190, 12); fillStroke(g, '#ece6ff', 5);
  g.fillStyle = '#c3b7f0'; g.fillRect(836, 486, 118, 158);
  g.fillStyle = '#ef7a6d'; g.beginPath(); g.arc(895, 545, 24, 0, TAU); g.fill();
  g.fillStyle = '#78d0bd'; g.beginPath(); g.moveTo(836, 644); g.lineTo(880, 590); g.lineTo(918, 626); g.lineTo(954, 600); g.lineTo(954, 644); g.fill();
  // moonlight shaft (soft, additive)
  g.globalCompositeOperation = 'lighter';
  gr = g.createLinearGradient(140, 200, 560, 1100); gr.addColorStop(0, 'rgba(160,180,255,0.10)'); gr.addColorStop(1, 'rgba(160,180,255,0.0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(70, 150); g.lineTo(320, 150); g.lineTo(760, 1100); g.lineTo(380, 1100); g.closePath(); g.fill();
  g.globalCompositeOperation = 'source-over';
  return c;
}

function bakeBlanket() {
  const { c, g } = mk(W, H);
  g.beginPath();
  g.moveTo(-30, 1150);
  g.bezierCurveTo(120, 1110, 220, 1150, 340, 1128);
  g.bezierCurveTo(470, 1104, 600, 1128, 706, 1116);
  g.quadraticCurveTo(742, 1114, 744, 1160);
  g.lineTo(736, 1930); g.lineTo(-30, 1930); g.closePath();
  g.fillStyle = BLANKET; g.fill();
  g.save(); g.clip();
  // quilt stitches (diamonds) and a fold shadow
  g.strokeStyle = 'rgba(255,255,255,0.13)'; g.lineWidth = 4; g.setLineDash([14, 10]);
  for (let k = -10; k < 14; k++) {
    g.beginPath(); g.moveTo(k * 110, 1100); g.lineTo(k * 110 + 820, 1920); g.stroke();
    g.beginPath(); g.moveTo(k * 110, 1100); g.lineTo(k * 110 - 820, 1920); g.stroke();
  }
  g.setLineDash([]);
  g.fillStyle = BLANKET2; g.beginPath(); g.moveTo(-30, 1150); g.bezierCurveTo(120, 1110, 220, 1150, 340, 1128); g.bezierCurveTo(470, 1104, 600, 1128, 706, 1116); g.lineTo(706, 1160); g.bezierCurveTo(560, 1170, 300, 1160, -30, 1190); g.fill();
  g.fillStyle = 'rgba(10,30,40,0.35)'; g.fillRect(700, 1100, 60, 830);
  g.restore();
  g.beginPath();
  g.moveTo(-30, 1150);
  g.bezierCurveTo(120, 1110, 220, 1150, 340, 1128);
  g.bezierCurveTo(470, 1104, 600, 1128, 706, 1116);
  g.quadraticCurveTo(742, 1114, 744, 1160);
  g.lineTo(736, 1930);
  g.lineWidth = 6; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke();
  return c;
}

function bakeOverlays() {
  // vignette, caption scrim, grain tile, a soft dot sprite
  const v = mk(W, H);
  let gr = v.g.createRadialGradient(540, 860, 420, 540, 900, 1250);
  gr.addColorStop(0, 'rgba(6,5,20,0)'); gr.addColorStop(1, 'rgba(6,5,20,0.6)');
  v.g.fillStyle = gr; v.g.fillRect(0, 0, W, H);
  gr = v.g.createLinearGradient(0, 1150, 0, H);
  gr.addColorStop(0, 'rgba(8,7,26,0)'); gr.addColorStop(0.22, 'rgba(8,7,26,0.42)'); gr.addColorStop(1, 'rgba(8,7,26,0.62)');
  v.g.fillStyle = gr; v.g.fillRect(0, 1150, W, H - 1150);
  const n = mk(256, 256), img = n.g.createImageData(256, 256), r = rand(5);
  for (let i = 0; i < img.data.length; i += 4) { const q = (r() * 255) | 0; img.data[i] = img.data[i + 1] = img.data[i + 2] = q; img.data[i + 3] = 255; }
  n.g.putImageData(img, 0, 0);
  const d = mk(64, 64);
  gr = d.g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  d.g.fillStyle = gr; d.g.fillRect(0, 0, 64, 64);
  return { vig: v.c, grain: n.c, dot: d.c };
}

// ---------------------------------------------------------------- socks
function sockPath(g, f) {
  g.beginPath();
  g.moveTo(-26 * f, 0); g.lineTo(26 * f, 0); g.lineTo(26 * f, 92);
  g.quadraticCurveTo(26 * f, 100, 36 * f, 100);
  g.lineTo(58 * f, 100); g.quadraticCurveTo(86 * f, 100, 86 * f, 124); g.quadraticCurveTo(86 * f, 148, 58 * f, 148);
  g.lineTo(-2 * f, 148); g.quadraticCurveTo(-26 * f, 148, -26 * f, 122); g.closePath();
}
function drawSock(g, x, y, rot, sx, sy, kind, f, alpha = 1) {
  g.save();
  g.globalAlpha = alpha;
  g.translate(x, y); g.rotate(rot); g.scale(sx * 0.86, sy * 0.86);
  sockPath(g, f); g.fillStyle = kind.base; g.fill();
  g.save(); sockPath(g, f); g.clip();
  g.fillStyle = kind.stripe;
  if (kind.dots) { for (let yy = 34; yy < 150; yy += 30) for (let xx = -20; xx < 90; xx += 30) { g.beginPath(); g.arc(xx * f + ((yy / 30) % 2) * 15 * f, yy, 6, 0, TAU); g.fill(); } }
  else for (let yy = 26; yy < 96; yy += 24) g.fillRect(-100, yy, 200, 10);
  g.fillStyle = kind.cuff; g.fillRect(-100, 0, 200, 18);
  g.fillStyle = kind.patch; g.beginPath(); g.arc(-26 * f, 148, 24, 0, TAU); g.fill(); g.beginPath(); g.arc(86 * f, 124, 22, 0, TAU); g.fill();
  g.restore();
  sockPath(g, f); g.lineWidth = 5.5; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke();
  g.restore();
}
function drawPin(g, x, y, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath(); g.roundRect(-7, -20, 14, 38, 4); fillStroke(g, '#e2bd8c', 4);
  g.restore();
}
/** the line, the pins and the socks; one sock of the middle pair is yanked down into the basket on "사라지는" */
function drawLine(g, t) {
  const dip = 26 * win(t, T_VANISH, T_VANISH + 0.08, 0.06, 0.1) + 10 * wobble(t - T_VANISH - 0.12, 2.6, 4);
  g.beginPath();
  for (let x = -10; x <= 1090; x += 20) {
    const y = lineY(x) + dip * Math.exp(-((x - 822) ** 2) / (2 * 180 * 180)) + 6 * wobble(t - T_SOCKS, 2, 4) * Math.sin((x / 1080) * Math.PI);
    if (x === -10) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.lineWidth = 4; g.strokeStyle = '#d8d3f0'; g.stroke();
  PAIRS.forEach((cx, p) => {
    const pop = pulse(t - T_SOCKS - p * 0.08, 0.07, 2.2, 7);
    for (let s = 0; s < 2; s++) {
      const x = cx + (s ? 32 : -32), y = lineY(x) + dip * Math.exp(-((x - 822) ** 2) / (2 * 180 * 180)) + 6 * wobble(t - T_SOCKS, 2, 4) * Math.sin((x / 1080) * Math.PI);
      const kind = SOCKS[p], f = s ? 1 : -1;
      let rot = 0.035 * Math.sin(1.3 * t + p * 1.7 + s) + 0.16 * wobble(t - T_SOCKS - p * 0.08, 1.8, 3.5) * (s ? 1 : -1);
      let sc = 1 + 0.14 * pop;
      const target = p === 1 && s === 1;
      if (p === 1 && s === 0) rot += 0.22 * wobble(t - T_IN + 0.3, 1.2, 2.2);          // left alone, it swings
      if (target) {
        rot += 0.14 * wobble(t - T_ONE, 3.2, 4);                                         // "한 짝씩": the one that will go
        const tv = t - T_VANISH;
        if (tv > 0) {
          if (tv < 0.09) {                                                               // a tug: stretched down
            const k = smooth(tv / 0.09);
            drawSock(g, x, y + 8 * k, rot, sc * (1 - 0.1 * k), sc * (1 + 0.26 * k), kind, f);
            drawPin(g, x, y, 0);
            continue;
          }
          // yanked along a curve into the basket, with a short ghost trail
          for (let gk = 3; gk >= 0; gk--) {
            const u = clamp((tv - 0.09 - gk * 0.022) / (T_IN - T_VANISH - 0.09));
            if (u <= 0 || u >= 1) continue;
            const e = ease.inCubic(u * 0.6 + 0.4) * 1.0;
            const q = clamp((e - ease.inCubic(0.4)) / (1 - ease.inCubic(0.4)));
            const v = 1 - q;
            const px = v * v * v * x + 3 * v * v * q * (x + 160) + 3 * v * q * q * (BX + 120) + q * q * q * BX;
            const py = v * v * v * y + 3 * v * v * q * (y + 220) + 3 * v * q * q * (RY - 260) + q * q * q * (RY - 10);
            drawSock(g, px, py, rot + q * 4.2, 1 - 0.2 * q, 1 + 0.2 * (1 - q), kind, f, gk ? 0.22 / gk : 1);
          }
          drawPin(g, x, y, 0.6 * wobble(tv - 0.09, 4, 4));
          continue;
        }
      }
      drawSock(g, x, y, rot, sc, sc, kind, f);
      drawPin(g, x, y, 0);
    }
  });
}

// ---------------------------------------------------------------- the speaker
const P_BROW = track([[0, 0.1], [T_SOCKS, 0.4], [T_ONE, 0.2], [T_WHY, 0.75, ease.outBack], [T_RAISE, 0.3], [T_FOUND, 1.0, ease.outBack], [T_WHO, -0.55], [T_REVEAL - 0.02, -0.6], [T_REVEAL + 0.12, 1.3, ease.outBack], [T_BUT, 0.5], [T_CUTE, 0.35], [D, 0.2]]);
const P_EYE = track([[0, 1], [T_WHO, 1], [T_WHO + 0.3, 0.55], [T_REVEAL - 0.02, 0.5], [T_REVEAL + 0.1, 1.32, ease.outBack], [T_BUT - 0.2, 1.1], [T_BUT + 0.2, 1]]);
const P_HAPPY = track([[0, 0], [T_CUTE - 0.1, 0], [T_CUTE + 0.15, 1], [D, 1]]);
const P_LOOK = track([
  [0, [0, 0]], [T_SOCKS - 0.1, [0, 0]], [T_SOCKS + 0.12, [0.7, -0.9]], [T_VANISH + 0.1, [0.75, -0.8]], [T_IN, [1, 0.7]], [T_WHY + 0.05, [0.05, 0.1]],
  [T_FOUND - 0.05, [0.05, 0.1]], [T_FOUND + 0.25, [1, 0.6]], [T_REVEAL, [1, 0.6]], [T_REVEAL + 0.12, [0, 0]], [T_REVEAL + 0.75, [0, 0]], [T_REVEAL + 0.95, [1, 0.2]], [T_BUT - 0.05, [1, 0.2]], [T_BUT + 0.15, [0, 0]],
]);
const P_LEAN = track([[0, 0], [T_WHO, 0], [T_WHO + 0.4, 1], [T_REVEAL, 1], [T_REVEAL + 0.08, -0.8, ease.outCubic], [T_REVEAL + 0.6, 0, ease.inOutCubic]]);
const P_ARM = track([[0, 0], [T_RAISE, 0], [T_RAISE + 0.32, 1, (p) => ease.outBack(p, 2)], [T_FORGIVE - 0.02, 1], [T_FORGIVE + 0.36, 0]]);
const P_SHRUG = track([[0, 0], [T_FORGIVE, 0], [T_FORGIVE + 0.18, 1, ease.outBack], [T_FORGIVE + 0.62, 1], [T_FORGIVE + 0.95, 0.15]]);
const BLINKS = [1.3, 3.0, 6.62, 9.05];

function personState(t) {
  let blink = 1;
  for (const b of BLINKS) { const u = (t - b) / 0.15; if (u > 0 && u < 1) blink = Math.min(blink, Math.abs(u - 0.5) * 2); }
  const v = voice(t);
  let nod = 0;
  for (const w of WORDS) if (w.emph) nod += (w.emph === 2 ? -16 : 9) * wobble(t - w.s, 2.2, 6);
  const lean = P_LEAN(t), shrug = P_SHRUG(t);
  return {
    v, blink, nod, lean, shrug,
    brow: P_BROW(t), eye: P_EYE(t), happy: P_HAPPY(t), look: P_LOOK(t), arm: P_ARM(t),
    blush: 0.35 + 0.65 * smooth((t - T_CUTE + 0.1) / 0.4),
    tilt: -0.06 * win(t, T_WHY, T_RAISE, 0.18, 0.25) + 0.05 * lean + 0.09 * shrug + 0.012 * Math.sin(t * 1.7),
  };
}

function drawPerson(g, t, S, after) {
  const sy = -14 * S.shrug;
  if (!after) {
    // neck + torso
    g.save(); g.translate(PX, PY + sy);
    g.beginPath(); g.roundRect(-36, 96, 72, 90, 20); fillStroke(g, SKIN, 6);
    g.beginPath();
    g.moveTo(-196, 560); g.lineTo(-200, 272); g.bezierCurveTo(-200, 192, -150, 160, -70, 156); g.lineTo(70, 156);
    g.bezierCurveTo(150, 160, 200, 192, 200, 272); g.lineTo(196, 560); g.closePath();
    g.fillStyle = PJ; g.fill();
    g.save(); g.clip();
    g.fillStyle = PJ2; for (let x = -200; x < 210; x += 44) g.fillRect(x, 150, 16, 420);
    g.restore();
    g.lineWidth = 6; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke();
    g.beginPath(); g.moveTo(-72, 154); g.lineTo(-4, 232); g.lineTo(-40, 240); g.lineTo(-100, 178); g.closePath(); fillStroke(g, '#f4f1ff', 5);
    g.beginPath(); g.moveTo(72, 154); g.lineTo(4, 232); g.lineTo(40, 240); g.lineTo(100, 178); g.closePath(); fillStroke(g, '#f4f1ff', 5);
    g.fillStyle = '#f4f1ff'; [290, 350].forEach((y) => { g.beginPath(); g.arc(0, y, 8, 0, TAU); g.fill(); });
    g.restore();
    // head
    const hx = PX + 16 * S.lean, hy = PY + sy + S.nod + 3 * S.v.open;
    g.save(); g.translate(hx, hy); g.rotate(S.tilt);
    g.beginPath(); g.arc(0, -16, 164, 0, TAU); fillStroke(g, HAIR, 6);
    [-1, 1].forEach((s) => { g.beginPath(); g.arc(s * 146, 20, 30, 0, TAU); fillStroke(g, SKIN, 6); });
    g.beginPath(); g.arc(0, 0, PR, 0, TAU); fillStroke(g, SKIN, 6);
    // bangs
    g.beginPath();
    g.moveTo(-156, 12);
    g.bezierCurveTo(-172, -120, -80, -180, 0, -178);
    g.bezierCurveTo(92, -178, 172, -120, 156, 12);
    g.bezierCurveTo(146, -36, 112, -70, 62, -74);
    g.bezierCurveTo(34, -52, -6, -44, -40, -64);
    g.bezierCurveTo(-92, -84, -134, -50, -156, 12);
    g.closePath(); fillStroke(g, HAIR, 6);
    g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.arc(0, -40, 120, -2.3, -1.5); g.stroke(); g.lineCap = 'butt';
    // cheeks
    g.fillStyle = `rgba(240,110,120,${(0.22 + 0.4 * S.blush).toFixed(3)})`;
    [-1, 1].forEach((s) => { g.beginPath(); g.ellipse(s * 90, 50, 26 + 4 * S.blush, 15, 0, 0, TAU); g.fill(); });
    // brows
    g.strokeStyle = INK; g.lineCap = 'round'; g.lineWidth = 11;
    [-1, 1].forEach((s) => {
      const by = -50 - 16 * S.brow, ang = s * (-0.1 * S.brow + (S.brow < 0 ? 0.32 * -S.brow : 0));
      g.save(); g.translate(s * 56, by); g.rotate(ang);
      g.beginPath(); g.moveTo(-22, 0); g.lineTo(22, 0); g.stroke(); g.restore();
    });
    // eyes
    const lx = S.look[0] * 8, ly = S.look[1] * 6;
    [-1, 1].forEach((s) => {
      g.save(); g.translate(s * 54, -2);
      const open = S.eye * S.blink;
      if (S.happy > 0.5) {
        g.lineWidth = 7; g.beginPath(); g.moveTo(-17, 6); g.quadraticCurveTo(0, -18, 17, 6); g.stroke();
      } else if (open < 0.18) {
        g.lineWidth = 6; g.beginPath(); g.moveTo(-16, 0); g.quadraticCurveTo(0, 10, 16, 0); g.stroke();
      } else {
        const rx = 15 * (1 + 0.18 * (S.eye - 1)), ry = 20 * open;
        g.fillStyle = INK; g.beginPath(); g.ellipse(lx, ly, rx, ry, 0, 0, TAU); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(lx + 5, ly - 7 * open, 5, 0, TAU); g.fill();
        if (S.eye > 1.1) { g.lineWidth = 3; g.strokeStyle = INK; g.beginPath(); g.ellipse(lx, ly, rx + 7, ry + 7, 0, 0, TAU); g.stroke(); }
      }
      g.restore();
    });
    // nose
    g.lineWidth = 5; g.beginPath(); g.moveTo(-6, 18); g.quadraticCurveTo(8, 28, -2, 36); g.stroke();
    // mouth: viseme from the syllable under the playhead
    drawMouth(g, S.v, S.happy);
    g.restore();
  } else {
    // the arm (over the blanket) with the torch
    const sh = [PX + 162, PY + 214 + sy];
    const rest = [PX + 236, PY + 520], up = [PX + 282, PY + 262 + sy];
    const k = S.arm;
    const hand = [lerp(rest[0], up[0], k), lerp(rest[1], up[1], k)];
    const aim = beamTarget(t);
    const aUp = Math.atan2(aim[1] - hand[1], aim[0] - hand[0]);
    const ang = lerp(0.18, aUp, clamp(k));
    g.lineCap = 'round';
    g.strokeStyle = INK; g.lineWidth = 66; g.beginPath(); g.moveTo(sh[0], sh[1]); g.lineTo(hand[0], hand[1]); g.stroke();
    g.strokeStyle = PJ; g.lineWidth = 54; g.beginPath(); g.moveTo(sh[0], sh[1]); g.lineTo(hand[0], hand[1]); g.stroke();
    g.lineCap = 'butt';
    g.save(); g.translate(hand[0], hand[1]); g.rotate(ang);
    g.beginPath(); g.roundRect(-36, -16, 92, 32, 10); fillStroke(g, '#e4e3f2', 5);
    g.beginPath(); g.roundRect(50, -24, 30, 48, 9); fillStroke(g, '#b5b8d8', 5);
    const on = torchOn(t);
    g.fillStyle = on > 0.5 ? '#fff4c2' : '#8b8fb8'; g.beginPath(); g.ellipse(80, 0, 6, 19, 0, 0, TAU); g.fill();
    g.restore();
    g.beginPath(); g.arc(hand[0], hand[1], 29, 0, TAU); fillStroke(g, SKIN, 6);
    g.strokeStyle = 'rgba(23,19,44,0.5)'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(hand[0] - 10, hand[1] - 8); g.lineTo(hand[0] + 6, hand[1] - 12); g.stroke(); g.lineCap = 'butt';
    S.lens = [hand[0] + Math.cos(ang) * 84, hand[1] + Math.sin(ang) * 84];
  }
}

function drawMouth(g, v, happy) {
  g.save(); g.translate(0, 72);
  const open = v.open;
  if (open < 0.05) {
    g.lineWidth = 7; g.strokeStyle = INK; g.lineCap = 'round';
    const wdt = 22 + 6 * happy;
    g.beginPath(); g.moveTo(-wdt, -2); g.quadraticCurveTo(0, 14 + 8 * happy, wdt, -2); g.stroke();
    g.lineCap = 'butt';
  } else {
    const rx = (24 + 14 * v.wide) * (1 - 0.32 * v.round), ry = 8 + 38 * open;
    const top = -6;
    g.beginPath();
    // flatter top lip, rounder bottom; round vowels → closer to a circle
    g.moveTo(-rx, top + 4);
    g.quadraticCurveTo(0, top - 6 - 4 * v.round, rx, top + 4);
    g.bezierCurveTo(rx, top + ry * (0.9 + 0.2 * v.round), -rx, top + ry * (0.9 + 0.2 * v.round), -rx, top + 4);
    g.closePath();
    g.fillStyle = '#5a1b32'; g.fill();
    g.save(); g.clip();
    if (open > 0.3) { g.fillStyle = '#fff'; g.fillRect(-rx, top - 10, rx * 2, 12); }
    g.fillStyle = '#ef7d92'; g.beginPath(); g.ellipse(0, top + ry * 0.78, rx * 0.62, ry * 0.36, 0, 0, TAU); g.fill();
    g.restore();
    g.lineWidth = 6; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke();
  }
  g.restore();
}

// ---------------------------------------------------------------- the torch beam
const BEAM = track([[0, [640, 1190]], [T_FOUND + 0.06, [640, 1190]], [T_FOUND + 0.42, [BX, 1068]], [T_REVEAL, [BX, 1068]], [T_REVEAL + 0.22, [BX, 900], ease.outCubic], [D, [BX, 900]]]);
const beamTarget = (t) => BEAM(t);
function torchOn(t) {
  if (t < T_FOUND) return 0;
  const u = t - T_FOUND;
  const flick = u < 0.05 ? 1 : u < 0.09 ? 0.15 : u < 0.13 ? 1 : u < 0.16 ? 0.4 : 1;
  return flick * (1 - smooth((t - T_FORGIVE - 0.1) / 0.18));
}
function drawBeam(g, t, lens) {
  const on = torchOn(t);
  if (on < 0.01 || !lens) return;
  const [tx, ty] = beamTarget(t);
  const dx = tx - lens[0], dy = ty - lens[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const R = 150 + 30 * smooth((t - T_REVEAL) / 0.3), soft = 1 - 0.45 * smooth((t - T_REVEAL) / 0.3);
  g.globalCompositeOperation = 'lighter';
  let gr = g.createLinearGradient(lens[0], lens[1], tx, ty);
  gr.addColorStop(0, `rgba(255,232,160,${(0.34 * on).toFixed(3)})`); gr.addColorStop(1, `rgba(255,232,160,${(0.08 * on * soft).toFixed(3)})`);
  g.fillStyle = gr;
  g.beginPath();
  g.moveTo(lens[0] + nx * 16, lens[1] + ny * 16); g.lineTo(tx + nx * R, ty + ny * R);
  g.lineTo(tx + ux * R * 0.4 + nx * R * 0.5, ty + uy * R * 0.4 + ny * R * 0.5);
  g.lineTo(tx + ux * R * 0.4 - nx * R * 0.5, ty + uy * R * 0.4 - ny * R * 0.5);
  g.lineTo(tx - nx * R, ty - ny * R); g.lineTo(lens[0] - nx * 16, lens[1] - ny * 16); g.closePath(); g.fill();
  gr = g.createRadialGradient(tx, ty, 10, tx, ty, R * 1.15);
  gr.addColorStop(0, `rgba(255,236,170,${(0.3 * on * soft).toFixed(3)})`); gr.addColorStop(1, 'rgba(255,236,170,0)');
  g.fillStyle = gr; g.beginPath(); g.ellipse(tx, ty, R * 1.15, R * 0.95, 0, 0, TAU); g.fill();
  g.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- the basket and the culprit
function basketWobble(t) {
  return 0.07 * wobble(t - T_IN, 3, 5) + 0.05 * wobble(t - T_PEEK + 0.18, 4, 6) + 0.05 * wobble(t - T_WHO - 0.2, 4, 6) - 0.06 * wobble(t - T_REVEAL, 2.4, 5);
}
function catHeadY(t) {
  const peek = 74 * smooth((t - T_PEEK - 0.05) / 0.22);
  const burst = spring(t - T_REVEAL, 1.5, 6.5);
  return RY + 160 - peek - (310 - peek) * burst * (t >= T_REVEAL ? 1 : 0);
}
function drawBasketBack(g) {
  g.beginPath(); g.ellipse(BX, RY, 150, 34, 0, 0, TAU); fillStroke(g, '#4b2d1c', 6);
}
function drawBasketFront(g, t) {
  g.beginPath();
  g.moveTo(BX - 150, RY); g.lineTo(BX - 124, RY + 206); g.quadraticCurveTo(BX, RY + 226, BX + 124, RY + 206); g.lineTo(BX + 150, RY);
  g.quadraticCurveTo(BX, RY + 40, BX - 150, RY); g.closePath();
  g.fillStyle = BASKET; g.fill();
  g.save(); g.clip();
  g.strokeStyle = BASKET2; g.lineWidth = 6;
  for (let y = RY + 40; y < RY + 230; y += 30) { g.beginPath(); g.moveTo(BX - 170, y); g.quadraticCurveTo(BX, y + 28, BX + 170, y); g.stroke(); }
  for (let x = -130; x <= 130; x += 38) { g.beginPath(); g.moveTo(BX + x, RY + 20); g.lineTo(BX + x * 0.86, RY + 220); g.stroke(); }
  g.restore();
  g.lineWidth = 6; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke();
  // rim
  g.beginPath(); g.ellipse(BX, RY + 4, 156, 22, 0, 0, Math.PI); g.lineWidth = 22; g.strokeStyle = INK; g.stroke();
  g.lineWidth = 13; g.strokeStyle = '#dca46a'; g.stroke();
  // handles
  [-1, 1].forEach((s) => { g.beginPath(); g.ellipse(BX + s * 142, RY + 56, 12, 22, 0, 0, TAU); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); });
}
function drawCat(g, t) {
  const y = catHeadY(t);
  if (y > RY + 158) return;
  const tr = t - T_REVEAL;
  const stretch = tr > 0 ? 0.14 * Math.exp(-5 * tr) * Math.cos(TAU * 1.5 * tr) : 0;
  g.save(); g.translate(BX, y);
  g.rotate(0.05 * Math.sin(t * 1.4) * smooth(tr / 0.6) + 0.12 * wobble(tr, 1.6, 4));
  g.scale(1 - stretch * 0.6, 1 + stretch);
  // body (mostly inside the basket)
  g.beginPath(); g.roundRect(-82, 30, 164, 260, 70); fillStroke(g, CAT, 6);
  g.beginPath(); g.ellipse(0, 96, 52, 60, 0, 0, TAU); g.fillStyle = CREAM; g.fill();
  // ears (twitch while peeking)
  const tw = 0.18 * Math.max(0, Math.sin((t - T_PEEK) * 22)) * win(t, T_PEEK + 0.12, T_REVEAL, 0.05, 0.05);
  [-1, 1].forEach((s) => {
    g.save(); g.translate(s * 52, -60); g.rotate(s * (0.18 + (s > 0 ? tw : 0)));
    g.beginPath(); g.moveTo(-30, 18); g.quadraticCurveTo(-8, -70, 6, -58); g.quadraticCurveTo(30, -30, 30, 18); g.closePath(); fillStroke(g, CAT, 6);
    g.beginPath(); g.moveTo(-14, 10); g.quadraticCurveTo(-2, -42, 6, -38); g.quadraticCurveTo(18, -18, 16, 10); g.closePath(); g.fillStyle = '#f7b0a4'; g.fill();
    g.restore();
  });
  // head
  g.beginPath(); g.ellipse(0, 0, 100, 86, 0, 0, TAU); fillStroke(g, CAT, 6);
  g.save(); g.beginPath(); g.ellipse(0, 0, 97, 83, 0, 0, TAU); g.clip();
  g.fillStyle = CAT2;
  [[-26, -86], [0, -90], [26, -86]].forEach(([x, yy]) => { g.beginPath(); g.ellipse(x, yy, 8, 30, 0, 0, TAU); g.fill(); });
  g.beginPath(); g.ellipse(-98, 6, 30, 9, 0.2, 0, TAU); g.fill(); g.beginPath(); g.ellipse(98, 6, 30, 9, -0.2, 0, TAU); g.fill();
  g.fillStyle = CREAM; g.beginPath(); g.ellipse(0, 44, 58, 40, 0, 0, TAU); g.fill();
  g.restore();
  // eyes: wide at the reveal, a slow blink on "귀여워서"
  const blink = 1 - win(t, T_CUTE + 0.05, T_CUTE + 0.62, 0.16, 0.2) * 0.92 - win(t, T_PEEK + 0.1, T_PEEK + 0.2, 0.04, 0.05) * 0.9;
  [-1, 1].forEach((s) => {
    g.save(); g.translate(s * 40, -6);
    if (blink < 0.2) { g.lineWidth = 6; g.strokeStyle = INK; g.lineCap = 'round'; g.beginPath(); g.moveTo(-16, 2); g.quadraticCurveTo(0, 12, 16, 2); g.stroke(); g.lineCap = 'butt'; }
    else {
      g.beginPath(); g.ellipse(0, 0, 20, 23 * blink, 0, 0, TAU); fillStroke(g, '#bfe36a', 5);
      g.fillStyle = INK; g.beginPath(); g.ellipse(2 * s * 0, 2, 7 + 5 * smooth(tr / 0.2), 18 * blink, 0, 0, TAU); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(6, -8 * blink, 5, 0, TAU); g.fill();
    }
    g.restore();
  });
  // nose, whiskers
  g.fillStyle = '#f08a9a'; g.beginPath(); g.moveTo(-9, 24); g.lineTo(9, 24); g.lineTo(0, 34); g.closePath(); g.fill();
  g.strokeStyle = INK; g.lineWidth = 3.5; g.lineCap = 'round';
  [-1, 1].forEach((s) => { for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(s * 52, 38 + k * 12); g.lineTo(s * 108, 30 + k * 22); g.stroke(); } });
  g.lineCap = 'butt';
  // the missing sock, in its mouth
  if (t > T_REVEAL - 0.05) {
    const sw = 0.22 * wobble(tr - 0.05, 1.4, 2.2) + 0.05 * Math.sin(t * 2.1);
    drawSock(g, 14, 44, -0.5 + sw, 0.92, 0.92, SOCKS[1], 1);
  }
  g.lineWidth = 5; g.strokeStyle = INK; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-12, 40); g.quadraticCurveTo(0, 50, 2, 40); g.quadraticCurveTo(6, 50, 18, 40); g.stroke(); g.lineCap = 'butt';
  g.restore();
}
function drawPaws(g, t) {
  const tr = t - T_REVEAL - 0.1;
  if (tr <= 0) return;
  const k = ease.outBack(clamp(tr / 0.2), 2.4);
  [-1, 1].forEach((s) => {
    g.save(); g.translate(BX + s * 62, RY + 6 - 14 * k); g.scale(k, k);
    g.beginPath(); g.ellipse(0, 0, 30, 20, 0, 0, TAU); fillStroke(g, CREAM, 5);
    g.lineWidth = 3; g.beginPath(); g.moveTo(-8, 8); g.lineTo(-8, 18); g.moveTo(8, 8); g.lineTo(8, 18); g.stroke();
    g.restore();
  });
}
function drawTail(g, t) {
  const tr = t - T_REVEAL - 0.25;
  if (tr <= 0) return;
  const k = smooth(tr / 0.4), sw = Math.sin(t * 2.6) * 30 * k;
  g.lineCap = 'round';
  const path = () => { g.beginPath(); g.moveTo(BX + 120, RY + 60); g.bezierCurveTo(BX + 190, RY + 40, BX + 200 + sw * 0.5, RY - 60 * k, BX + 160 + sw, RY - 120 * k); };
  path(); g.lineWidth = 36; g.strokeStyle = INK; g.stroke();
  path(); g.lineWidth = 24; g.strokeStyle = CAT; g.stroke();
  g.lineCap = 'butt';
}
/** the stash: socks lying by the basket, lit up by the torch */
function drawStash(g) {
  drawSock(g, 1050, 1232, 1.45, 0.85, 0.85, SOCKS[2], 1);         // one on the floor
}
function drawDraped(g) {
  drawSock(g, BX + 92, RY - 4, -0.12, 0.88, 0.88, SOCKS[0], 1);    // one over the rim
}

// ---------------------------------------------------------------- impact and small fx
function drawImpact(g, t, dot) {
  const tr = t - T_REVEAL;
  if (tr < 0 || tr > 1.2) return;
  const cy = RY - 150;
  // ring
    for (let j = 0; j < 2; j++) {
    const uj = clamp((tr - j * 0.1) / 0.55);
    if (uj <= 0 || uj >= 1) continue;
    const rr = 80 + (j ? 340 : 280) * ease.outCubic(uj), lw = (j ? 6 : 14) * (1 - uj) + 2;
    g.globalAlpha = (1 - uj);
    g.lineWidth = lw + 6; g.strokeStyle = INK; g.beginPath(); g.arc(BX, cy, rr, 0, TAU); g.stroke();
    g.lineWidth = lw; g.strokeStyle = j ? '#fff' : ACC; g.stroke();
  }
  // rays
  g.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + 0.2 + 0.2 * hash(i, 4), sp = 0.8 + 0.4 * hash(i, 5);
    const r0 = 120 + 260 * ease.outCubic(clamp(tr / 0.4)) * sp, r1 = r0 + 70 * (1 - clamp(tr / 0.45));
    if (tr > 0.45) continue;
    g.globalAlpha = 1 - clamp(tr / 0.45);
    g.lineWidth = 9; g.strokeStyle = i % 2 ? '#fff' : ACC;
    g.beginPath(); g.moveTo(BX + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(BX + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke();
  }
  g.lineCap = 'butt';
  // sparkles that drift down
  for (let i = 0; i < 16; i++) {
    const a = hash(i, 8) * TAU, v = 260 + 320 * hash(i, 9), life = 0.7 + 0.4 * hash(i, 10);
    if (tr > life) continue;
    const x = BX + Math.cos(a) * v * (1 - Math.exp(-3 * tr)) / 3 * 2, y = cy + Math.sin(a) * v * (1 - Math.exp(-3 * tr)) / 3 * 2 + 200 * tr * tr;
    const s = 16 * (1 - tr / life);
    g.globalAlpha = 1 - tr / life;
    g.drawImage(dot, x - s, y - s, 2 * s, 2 * s);
  }
  g.globalAlpha = 1;
}
function drawPuff(g, t) {
  const tr = t - T_IN;
  if (tr < 0 || tr > 0.6) return;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI, r = 30 + 90 * ease.outCubic(tr / 0.6);
    const x = BX + Math.cos(a) * r * 1.4, y = RY - 6 + Math.sin(a) * r * 0.5;
    g.globalAlpha = (1 - tr / 0.6) * 0.8;
    g.fillStyle = '#e9e4ff';
    g.beginPath(); g.arc(x, y, 16 * (1 - tr / 0.6) + 6, 0, TAU); g.fill();
  }
  g.globalAlpha = 1;
}
function drawMark(g, t) {
  // "?" on "이유," → "!" on the reveal
  const tq = t - T_WHY - 0.06, tx = t - T_REVEAL;
  if (tq < 0) return;
  const isEx = tx >= 0;
  const k = isEx ? ease.outBack(clamp(tx / 0.25), 2.6) : ease.outBack(clamp(tq / 0.3), 2.2);
  const out = 1 - smooth((t - T_BUT + 0.3) / 0.3);
  const fadeQ = isEx ? 1 : 1;
  if (out <= 0.01) return;
  g.save();
  g.translate(522, 432);
  g.rotate((isEx ? -0.12 : 0.16) + 0.2 * wobble(isEx ? tx : tq, 2, 4));
  g.scale(k * (isEx ? 1.15 : 1), k * (isEx ? 1.15 : 1));
  g.globalAlpha = out * fadeQ;
  g.font = `900 132px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const ch = isEx ? '!' : '?';
  g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 22;
  g.strokeText(ch, 0, 8); g.fillText(ch, 0, 8);
  g.strokeText(ch, 0, 0);
  g.fillStyle = isEx ? ACC : '#fff'; g.fillText(ch, 0, 0);
  g.restore();
  g.globalAlpha = 1;
}
function drawHearts(g, t) {
  for (let i = 0; i < 3; i++) {
    const tr = t - T_CUTE - 0.1 - i * 0.14;
    if (tr < 0 || tr > 1.5) continue;
    const x = BX + (i - 1) * 70 + 14 * Math.sin(tr * 5 + i), y = RY - 270 - 150 * ease.outCubic(tr / 1.5) - i * 10;
    const s = 1.5 * ease.outBack(clamp(tr / 0.25), 2.5) * (1 - 0.3 * tr / 1.5);
    g.save(); g.translate(x, y); g.scale(s, s); g.rotate((i - 1) * 0.2);
    g.globalAlpha = 1 - smooth((tr - 1.0) / 0.5);
    g.beginPath(); g.moveTo(0, 14); g.bezierCurveTo(-34, -8, -18, -34, 0, -18); g.bezierCurveTo(18, -34, 34, -8, 0, 14); g.closePath();
    fillStroke(g, '#ff8fb1', 4.5);
    g.restore();
  }
  g.globalAlpha = 1;
}
const STARS = (() => { const r = rand(31); return Array.from({ length: 11 }, () => ({ x: 76 + r() * 236, y: 108 + r() * 220, s: 1.5 + r() * 2.5, ph: r() * TAU, f: 1 + r() * 2 })); })();
const MOTES = (() => { const r = rand(43); return Array.from({ length: 26 }, () => ({ u: r(), v: r(), s: 3 + r() * 6, ph: r() * TAU, sp: 0.02 + r() * 0.04 })); })();
const BOKEH = (() => { const r = rand(59); return Array.from({ length: 7 }, () => ({ x: r() * 1080, y: 200 + r() * 1100, s: 40 + r() * 70, a: 0.04 + r() * 0.06, ph: r() * TAU })); })();

// ---------------------------------------------------------------- camera (slow push, handheld drift, punch on the reveal)
function camera(t, depth) {
  const tr = t - T_REVEAL;
  const punch = tr > 0 ? 0.045 * (1 - Math.exp(-tr * 40)) * Math.exp(-tr * 5) : 0;
  const s = 1 + (0.035 + 0.035 * ease.inOutCubic(t / D) + punch) * depth;
  const sk = tr > 0 ? Math.exp(-tr * 7) : 0;
  const dx = (4 * Math.sin(t * 0.5) + 16 * sk * Math.sin(tr * 52)) * depth;
  const dy = (3 * Math.sin(t * 0.37 + 1) + 11 * sk * Math.sin(tr * 45 + 1) + 6 * wobble(t - T_IN, 3, 6)) * depth;
  const fx = 560, fy = 900;
  return [s, fx - fx * s + dx, fy - fy * s + dy];
}
const setCam = (g, c) => g.setTransform(c[0], 0, 0, c[0], c[1], c[2]);

// ================================================================ demo
defineDemo({
  id: '97-karaoke-captions',
  title: '양말 도둑',
  tech: '말하는 자막 · 단어 단위 타이밍 + 하이라이트 필 + 강조 팝',
  duration: D,
  background: '#0f1131',
  async setup(api) {
    HEADLESS = api.headless;
    const chars = WORDS.map((w) => w.disp).join('') + '?!가힣봐';
    await fontReady(`900 ${F}px ${SANS}`, chars);
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.g = ctx;
    layoutCaptions(ctx);
    this.room = bakeRoom();
    this.blanket = bakeBlanket();
    Object.assign(this, bakeOverlays());
    // composite every baked layer once now (first-composite AA differences stay out of the frames)
    ctx.drawImage(this.room, 0, 0); ctx.drawImage(this.blanket, 0, 0); ctx.drawImage(this.vig, 0, 0);
    ctx.globalAlpha = 0.05; ctx.drawImage(this.grain, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(this.dot, 0, 0);
  },
  frame(t) {
    const g = this.g;
    g.reset();
    // --- far: the room (bg parallax 0.75)
    setCam(g, camera(t, 0.75));
    g.drawImage(this.room, 0, 0);
    // stars and the moon's dust motes
    g.fillStyle = '#fff';
    for (const s of STARS) { g.globalAlpha = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * s.f * 2 + s.ph)); g.beginPath(); g.arc(s.x, s.y, s.s, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'lighter';
    for (const m of MOTES) {
      const v = (m.v + t * m.sp) % 1, x = lerp(lerp(90, 320, m.u), lerp(400, 740, m.u), v) + 10 * Math.sin(t * 0.8 + m.ph), y = lerp(170, 1060, v);
      g.globalAlpha = 0.5 * Math.sin(Math.PI * v) * (0.6 + 0.4 * Math.sin(t * 2 + m.ph));
      g.drawImage(this.dot, x - m.s, y - m.s, m.s * 2, m.s * 2);
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    // --- mid: the line and the socks (0.88)
    setCam(g, camera(t, 0.88));
    drawLine(g, t);
    // --- near: speaker, basket, cat (1.0)
    const cam1 = camera(t, 1);
    setCam(g, cam1);
    const S = personState(t);
    drawPerson(g, t, S, false);
    drawStash(g);
    drawBasketBack(g);
    g.save(); g.translate(BX, RY + 200); g.rotate(basketWobble(t)); g.translate(-BX, -RY - 200);
    g.save(); g.beginPath(); g.rect(BX - 420, 0, 840, RY + 196); g.clip();   // the cat lives inside the basket
    drawCat(g, t);
    g.restore();
    drawBasketFront(g, t);
    drawDraped(g);
    drawPaws(g, t);
    g.restore();
    drawTail(g, t);
    drawPuff(g, t);
    // --- front: the blanket (1.04), then the arm and the torch over it
    setCam(g, camera(t, 1.04));
    g.drawImage(this.blanket, 0, 0);
    setCam(g, cam1);
    drawPerson(g, t, S, true);
    // suspense: the room dims around the torch spot ("범인은 바로…"), lifts on the reveal, warms at the end
    const dim = 0.5 * win(t, T_WHO - 0.05, T_REVEAL + 0.05, 0.4, 0.25);
    if (dim > 0.003) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      const [tx, ty] = beamTarget(t), sx = cam1[0] * tx + cam1[1], sy = cam1[0] * ty + cam1[2];
      const gr = g.createRadialGradient(sx, sy, 140, sx, sy, 560);
      gr.addColorStop(0, 'rgba(5,4,20,0)'); gr.addColorStop(1, `rgba(5,4,20,${dim.toFixed(3)})`);
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      setCam(g, cam1);
    }
    drawBeam(g, t, S.lens);
    drawMark(g, t);
    drawHearts(g, t);
    drawImpact(g, t, this.dot);
    // --- front bokeh (1.25)
    setCam(g, camera(t, 1.25));
    g.globalCompositeOperation = 'lighter';
    for (const b of BOKEH) {
      g.globalAlpha = b.a * (0.7 + 0.3 * Math.sin(t * 0.9 + b.ph));
      const x = b.x + 30 * Math.sin(t * 0.21 + b.ph), y = b.y - 18 * t;
      g.drawImage(this.dot, x - b.s, y - b.s, b.s * 2, b.s * 2);
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    // --- screen space: warm grade, flash, vignette + scrim, grain
    g.setTransform(1, 0, 0, 1, 0, 0);
    const warm = smooth((t - T_CUTE + 0.2) / 1.2);
    if (warm > 0.003) {
      g.globalCompositeOperation = 'multiply';
      g.fillStyle = `rgba(255,214,170,${(0.5 * warm).toFixed(3)})`; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      const gr = g.createRadialGradient(BX - 200, 860, 60, BX - 200, 860, 760);
      gr.addColorStop(0, `rgba(255,150,70,${(0.2 * warm).toFixed(3)})`); gr.addColorStop(1, 'rgba(255,150,70,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'source-over';
    }
    const fl = t > T_REVEAL ? 0.3 * Math.exp(-(t - T_REVEAL) * 9) : 0;
    if (fl > 0.003) { g.fillStyle = `rgba(255,246,214,${fl.toFixed(3)})`; g.fillRect(0, 0, W, H); }
    g.drawImage(this.vig, 0, 0);
    const q = Math.floor(t * 12);
    g.globalAlpha = 0.05;
    const ox = Math.floor(hash(q, 1) * 256), oy = Math.floor(hash(q, 2) * 256);
    for (let y = -oy; y < H; y += 256) for (let x = -ox; x < W; x += 256) g.drawImage(this.grain, x, y);
    g.globalAlpha = 1;
    // --- captions (screen space, never shaken by the camera)
    drawChip(g, t);
    drawCaptions(g, t);
  },
});
