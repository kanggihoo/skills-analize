/*
 * face.js — 코드로 짠 한글: a Hangul typeface that exists only as code (no font file).
 *
 *   jamo      each consonant/vowel is a set of stroke SKELETONS (polylines with corner flags, rings, dots)
 *             on a unit design box; consonants take a continuous `slant` (the leg of ㄱ in 가 sweeps left,
 *             in 고/각 it drops straight) so position variants share one topology and can morph.
 *   모아쓰기   syllable() decomposes a precomposed syllable (U+AC00…) into 초·중·종 and picks the layout class
 *             from the vowel (V: initial on the left, H: initial on top, M: mixed) × final present or not;
 *             every vowel returns its own strokes in em and the slot boxes for the initial and the final.
 *             Double initials and compound finals are two consonants set side by side in half boxes.
 *   outline   renderUnits() offsets the skeletons into filled polygons (real outlines, crisp at any size):
 *             per-segment width from the stroke direction (contrast = an elliptical pen), exact corner joins
 *             (offset-line intersections, with separate outer/inner fillet radii for "roundness"),
 *             flat / round / brush terminals (cap bulge, start press, end taper), superellipse rings,
 *             per-jamo density limits so counters never close at heavy weights, stencil cut bands.
 *             Outer contours are oriented positive and holes negative, so one nonzero fill is the union.
 * Nothing here depends on time; the same input always gives the same polygons.
 */

const SQ = (x) => x * x;
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, k) => a + (b - a) * k;

export const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
export const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split('');
export const JONG = ['', ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'.split('')];
const VCLASS = {};
for (const v of 'ㅏㅐㅑㅒㅓㅔㅕㅖㅣ') VCLASS[v] = 'V';
for (const v of 'ㅗㅛㅜㅠㅡ') VCLASS[v] = 'H';
for (const v of 'ㅘㅙㅚㅝㅞㅟㅢ') VCLASS[v] = 'M';
const MIX = { 'ㅘ': ['ㅗ', 'ㅏ'], 'ㅙ': ['ㅗ', 'ㅐ'], 'ㅚ': ['ㅗ', 'ㅣ'], 'ㅝ': ['ㅜ', 'ㅓ'], 'ㅞ': ['ㅜ', 'ㅔ'], 'ㅟ': ['ㅜ', 'ㅣ'], 'ㅢ': ['ㅡ', 'ㅣ'] };
// double initials and compound finals: two consonants side by side
const PAIRS = {
  'ㄲ': ['ㄱ', 'ㄱ'], 'ㄸ': ['ㄷ', 'ㄷ'], 'ㅃ': ['ㅂ', 'ㅂ'], 'ㅆ': ['ㅅ', 'ㅅ'], 'ㅉ': ['ㅈ', 'ㅈ'],
  'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'], 'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'], 'ㄼ': ['ㄹ', 'ㅂ'],
  'ㄽ': ['ㄹ', 'ㅅ'], 'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'], 'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ'],
};

// ---------------------------------------------------------------- skeleton builders (y down)
// polyline: interior vertices are corners (k = 1); smooth samples (arcs) carry k = 0
const seg = (...p) => ({ p, k: p.map(() => 1) });
const loop = (...p) => ({ p, k: p.map(() => 1), closed: true });
const ring = (cx, cy, rx, ry, free = false) => ({ ring: [cx, cy, rx, ry], free });
const on = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
function curve() {
  const p = [], k = [];
  const api = {
    L(x, y) { p.push([x, y]); k.push(1); return api; },
    /** elliptical arc, angles in degrees (0 = +x, 90 = down) */
    A(cx, cy, rx, ry, a0, a1) {
      const n = Math.max(8, Math.ceil(Math.abs(a1 - a0) / 9));
      for (let i = 0; i <= n; i++) {
        const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180;
        p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
        k.push(i === 0 || i === n ? 1 : 0);
      }
      return api;
    },
    get s() { return { p, k }; },
  };
  return api;
}

// ---------------------------------------------------------------- consonants on the unit box
// s = slant: 1 for an initial beside a vertical vowel (가), 0 on top of a horizontal vowel (고) or as a final (각)
const CONS = {
  'ㄱ': (s) => [seg([0.06, 0.14], [0.90, 0.14], [0.90 - 0.30 * s, 0.94])],
  'ㄴ': () => [seg([0.12, 0.06], [0.12, 0.88], [0.94, 0.88])],
  'ㄷ': () => [seg([0.92, 0.12], [0.12, 0.12], [0.12, 0.88], [0.94, 0.88])],
  'ㄹ': () => [seg([0.10, 0.10], [0.88, 0.10], [0.88, 0.49], [0.12, 0.49], [0.12, 0.88], [0.92, 0.88])],
  'ㅁ': () => [loop([0.12, 0.12], [0.88, 0.12], [0.88, 0.88], [0.12, 0.88])],
  'ㅂ': () => [seg([0.14, 0.04], [0.14, 0.90], [0.86, 0.90], [0.86, 0.04]), seg([0.14, 0.47], [0.86, 0.47])],
  'ㅅ': (s) => { const a = [0.50, 0.06], b = [0.06, 0.94]; return [seg(a, b), seg(on(a, b, 0.40 - 0.04 * s), [0.94, 0.94 - 0.12 * s])]; },
  'ㅇ': () => [ring(0.5, 0.5, 0.42, 0.42)],
  'ㅈ': (s) => { const a = [0.50, 0.12], b = [0.08, 0.94]; return [seg([0.08, 0.12], [0.92, 0.12]), seg(a, b), seg(on(a, b, 0.38), [0.92, 0.94 - 0.12 * s])]; },
  'ㅊ': (s) => { const a = [0.50, 0.29], b = [0.08, 0.96]; return [seg([0.50, 0.05], [0.50, 0.29]), seg([0.08, 0.29], [0.92, 0.29]), seg(a, b), seg(on(a, b, 0.36), [0.92, 0.96 - 0.12 * s])]; },
  'ㅋ': (s) => { const k = [0.90, 0.14], e = [0.90 - 0.30 * s, 0.94]; return [seg([0.06, 0.14], k, e), seg([0.08, 0.53], on(k, e, (0.53 - 0.14) / 0.80))]; },
  'ㅌ': () => [seg([0.92, 0.10], [0.12, 0.10], [0.12, 0.90], [0.94, 0.90]), seg([0.12, 0.50], [0.88, 0.50])],
  'ㅍ': () => [seg([0.06, 0.12], [0.94, 0.12]), seg([0.32, 0.12], [0.32, 0.88]), seg([0.68, 0.12], [0.68, 0.88]), seg([0.04, 0.88], [0.96, 0.88])],
  'ㅎ': () => [seg([0.50, 0.0], [0.50, 0.14]), seg([0.08, 0.14], [0.92, 0.14]), ring(0.5, 0.65, 0.34, 0.30)],
};

// figures for the readouts (unit box, mapped onto DIGBOX), advance 0.60 em
const DIGBOX = [0.07, 0.22, 0.53, 0.90];
const DIG = {
  '0': () => [ring(0.5, 0.5, 0.5, 0.5, true)],
  '1': () => [seg([0.16, 0.22], [0.60, 0.0], [0.60, 1.0])],
  '2': () => [curve().A(0.5, 0.27, 0.44, 0.27, 180, 375).L(0.04, 1.0).L(0.98, 1.0).s],
  '3': () => [curve().A(0.47, 0.25, 0.41, 0.25, 195, 450).s, curve().A(0.49, 0.73, 0.47, 0.27, 270, 525).s],
  '4': () => [seg([0.72, 1.0], [0.72, 0.0], [0.02, 0.70], [0.98, 0.70])],
  '5': () => [curve().L(0.88, 0.0).L(0.20, 0.0).A(0.48, 0.67, 0.45, 0.33, 222, 500).s],
  '6': () => [ring(0.5, 0.67, 0.46, 0.33, true), seg([0.80, 0.0], [0.11, 0.56])],
  '7': () => [seg([0.02, 0.0], [0.98, 0.0], [0.36, 1.0])],
  '8': () => [ring(0.5, 0.245, 0.39, 0.245, true), ring(0.5, 0.725, 0.47, 0.275, true)],
  '9': () => [ring(0.5, 0.33, 0.46, 0.33, true), seg([0.89, 0.44], [0.20, 1.0])],
};

// ---------------------------------------------------------------- vowels (strokes directly in em) + slot boxes
function vowel(v, f) {
  const S = [];
  let cho, jong = [0.14, 0.66, 0.88, 0.95];
  const cls = VCLASS[v];
  if (cls === 'V') {
    // vertical vowels: the stem runs the full height (to the final's shoulder when there is a final)
    const yT = 0.05, yB = f ? 0.61 : 0.95, yM = f ? 0.30 : 0.48, dd = f ? 0.08 : 0.11;
    const st = (x) => seg([x, yT], [x, yB]);
    const br = (x0, x1, y) => seg([x0, y], [x1, y]);
    let xr;
    switch (v) {
      case 'ㅣ': S.push(st(0.78)); xr = 0.67; break;
      case 'ㅏ': S.push(st(0.70), br(0.70, 0.92, yM)); xr = 0.60; break;
      case 'ㅑ': S.push(st(0.68), br(0.68, 0.92, yM - dd), br(0.68, 0.92, yM + dd)); xr = 0.58; break;
      case 'ㅓ': S.push(br(0.58, 0.84, yM), st(0.84)); xr = 0.51; break;
      case 'ㅕ': S.push(br(0.56, 0.84, yM - dd), br(0.56, 0.84, yM + dd), st(0.84)); xr = 0.49; break;
      case 'ㅐ': S.push(st(0.64), br(0.64, 0.88, yM), st(0.88)); xr = 0.55; break;
      case 'ㅒ': S.push(st(0.64), br(0.64, 0.88, yM - dd), br(0.64, 0.88, yM + dd), st(0.88)); xr = 0.55; break;
      case 'ㅔ': S.push(br(0.52, 0.72, yM), st(0.72), st(0.88)); xr = 0.46; break;
      case 'ㅖ': S.push(br(0.50, 0.72, yM - dd), br(0.50, 0.72, yM + dd), st(0.72), st(0.88)); xr = 0.44; break;
    }
    cho = f ? [0.08, 0.07, xr, 0.51] : [0.08, 0.14, xr, 0.86];
  } else if (cls === 'H') {
    // horizontal vowels: a full-width bar under the initial
    const bar = (y) => seg([0.06, y], [0.94, y]);
    if (v === 'ㅡ') {
      S.push(bar(f ? 0.48 : 0.72));
      cho = f ? [0.17, 0.05, 0.83, 0.35] : [0.14, 0.10, 0.86, 0.58];
    } else if (v === 'ㅗ' || v === 'ㅛ') {
      const y = f ? 0.52 : 0.80, y0 = f ? 0.37 : 0.57;
      for (const x of v === 'ㅗ' ? [0.5] : [0.36, 0.64]) S.push(seg([x, y0], [x, y]));
      S.push(bar(y));
      cho = f ? [0.17, 0.04, 0.83, 0.31] : [0.14, 0.07, 0.86, 0.49];
    } else {
      const y = f ? 0.39 : 0.57, y1 = f ? 0.61 : 0.95;
      S.push(bar(y));
      for (const x of v === 'ㅜ' ? [0.52] : [0.37, 0.65]) S.push(seg([x, y], [x, y1]));
      cho = f ? [0.17, 0.04, 0.83, 0.30] : [0.14, 0.08, 0.86, 0.47];
      jong = [0.14, 0.68, 0.86, 0.95];
    }
  } else {
    // mixed: the horizontal part under the initial, the vertical part on the right
    const [h, r] = MIX[v];
    const yT = 0.05, yB = f ? 0.62 : 0.95, yM = f ? 0.27 : 0.42, yM2 = f ? 0.50 : 0.67;
    const st = (x) => seg([x, yT], [x, yB]);
    const R = [];
    let xe;
    switch (r) {
      case 'ㅏ': R.push(st(0.76), seg([0.76, yM], [0.94, yM])); xe = 0.66; break;
      case 'ㅐ': R.push(st(0.66), seg([0.66, yM], [0.88, yM]), st(0.88)); xe = 0.56; break;
      case 'ㅣ': R.push(st(0.82)); xe = 0.72; break;
      case 'ㅓ': R.push(seg([0.66, yM2], [0.86, yM2]), st(0.86)); xe = 0.62; break;
      case 'ㅔ': R.push(seg([0.58, yM2], [0.74, yM2]), st(0.74), st(0.88)); xe = 0.52; break;
    }
    const xm = (0.06 + xe) / 2;
    let choB;
    if (h === 'ㅗ') { const y = f ? 0.46 : 0.66, y0 = f ? 0.33 : 0.50; S.push(seg([xm, y0], [xm, y]), seg([0.06, y], [xe, y])); choB = f ? 0.28 : 0.44; }
    else if (h === 'ㅜ') { const y = f ? 0.38 : 0.55, y1 = f ? 0.62 : 0.93; S.push(seg([0.06, y], [xe, y]), seg([xm + 0.03, y], [xm + 0.03, y1])); choB = f ? 0.30 : 0.46; }
    else { const y = f ? 0.46 : 0.68; S.push(seg([0.06, y], [xe, y])); choB = f ? 0.34 : 0.54; }
    S.push(...R);
    cho = [0.08, f ? 0.04 : 0.06, Math.min(0.62, xe + 0.02), choB];
    jong = [0.14, 0.68, 0.86, 0.95];
  }
  // the vowel's own box (for the composition diagram): its skeleton bounds, padded
  let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
  for (const s of S) for (const q of s.p) { x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); }
  return { strokes: S, cho, jong, box: [x0 - 0.03, y0 - 0.02, x1 + 0.03, y1 + 0.02], cls };
}

// ---------------------------------------------------------------- unit box → em
const mapPt = (b, q) => [b[0] + q[0] * (b[2] - b[0]), b[1] + q[1] * (b[3] - b[1])];
function mapStrokes(strokes, b) {
  return strokes.map((st) => {
    if (st.ring) {
      const [cx, cy] = mapPt(b, st.ring);
      let rx = st.ring[2] * (b[2] - b[0]), ry = st.ring[3] * (b[3] - b[1]);
      if (!st.free) { if (rx > 1.2 * ry) rx = 1.2 * ry; if (ry > 1.15 * rx) ry = 1.15 * rx; }   // ㅇ stays round-ish in any slot
      return { ring: [cx, cy, rx, ry] };
    }
    return { p: st.p.map((q) => mapPt(b, q)), k: st.k, closed: st.closed };
  });
}

/** one consonant (or a doubled / compound pair) placed in box → units [{ name, strokes (em) }] */
export function consUnits(name, box, slant = 0) {
  const pair = PAIRS[name];
  if (pair) {
    const w = box[2] - box[0];
    return [...consUnits(pair[0], [box[0], box[1], box[0] + 0.47 * w, box[3]], 0),
      ...consUnits(pair[1], [box[0] + 0.53 * w, box[1], box[2], box[3]], slant)];
  }
  return [{ name, strokes: mapStrokes(CONS[name](slant), box) }];
}

/** 모아쓰기: syllable → { descs: [{ slot, name, box, slant | strokes }], cls, f } or null */
export function syllable(ch) {
  const c = ch.codePointAt(0) - 0xac00;
  if (!(c >= 0 && c < 11172)) return null;
  const cho = CHO[Math.floor(c / 588)], jung = JUNG[Math.floor((c % 588) / 28)], jong = JONG[c % 28];
  const f = jong !== '';
  const V = vowel(jung, f);
  const slant = V.cls === 'V' ? (f ? 0.6 : 1) : V.cls === 'M' ? 0.35 : 0;
  const descs = [
    { slot: 'cho', name: cho, box: V.cho, slant },
    { slot: 'jung', name: jung, box: V.box, strokes: V.strokes },
  ];
  if (f) descs.push({ slot: 'jong', name: jong, box: V.jong, slant: 0 });
  return { descs, cls: V.cls, f };
}
/** a desc (possibly with a morphed box / slant) → its units */
export function descUnits(d) {
  if (d.strokes) return [{ name: d.name, strokes: d.strokes }];
  return consUnits(d.name, d.box, d.slant);
}

const glyphCache = new Map();
/** any character the face knows → { units, adv (em) } */
export function glyphUnits(ch) {
  if (glyphCache.has(ch)) return glyphCache.get(ch);
  let g;
  const syl = syllable(ch);
  if (syl) g = { units: syl.descs.flatMap(descUnits), adv: 1 };
  else if (DIG[ch]) g = { units: [{ name: ch, strokes: mapStrokes(DIG[ch](), DIGBOX) }], adv: 0.60 };
  else if (ch === '.') g = { units: [{ name: ch, strokes: [{ dot: [0.13, 0.87] }] }], adv: 0.26 };
  else if (ch === '·') g = { units: [{ name: ch, strokes: [{ dot: [0.18, 0.52] }] }], adv: 0.36 };
  else g = { units: [], adv: ch === ' ' ? 0.28 : 0.5 };
  glyphCache.set(ch, g);
  return g;
}

// ---------------------------------------------------------------- parameters → widths
/** stem width (em) from the weight axis: geometric, hairline 0.010 em … black 0.125 em */
export const stemOf = (wt) => 0.010 * Math.pow(12.5, clamp(wt, 0, 1.1));
/** the weight that gives a stem of `px` at an em of `em` px (for small labels) */
export const weightFor = (px, em) => Math.log(clamp(px / em / 0.010, 1, 13)) / Math.log(12.5);
const smin = (a, m) => (m === Infinity ? a : a / Math.pow(1 + Math.pow(a / m, 4), 0.25));

/** parallel horizontal / vertical features of one jamo → the widest stems that keep its counters open */
function densityLimits(strokes, wd) {
  const H = [], V = [];
  for (const st of strokes) {
    if (st.ring) {
      const [cx0, cy, rx0, ry] = st.ring, cx = cx0 * wd, rx = rx0 * wd;
      H.push([cy - ry, cx - 0.5 * rx, cx + 0.5 * rx], [cy + ry, cx - 0.5 * rx, cx + 0.5 * rx]);
      V.push([cx - rx, cy - 0.5 * ry, cy + 0.5 * ry], [cx + rx, cy - 0.5 * ry, cy + 0.5 * ry]);
      continue;
    }
    if (st.dot) continue;
    const p = st.p, n = p.length, m = st.closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const a = p[i], b = p[(i + 1) % n];
      const ax = a[0] * wd, bx = b[0] * wd, dx = bx - ax, dy = b[1] - a[1];
      if (Math.abs(dy) < 0.4 * Math.abs(dx)) H.push([(a[1] + b[1]) / 2, Math.min(ax, bx), Math.max(ax, bx)]);
      else if (Math.abs(dx) < 0.4 * Math.abs(dy)) V.push([(ax + bx) / 2, Math.min(a[1], b[1]), Math.max(a[1], b[1])]);
    }
  }
  const lim = (F) => {
    let m = Infinity;
    for (let i = 0; i < F.length; i++) for (let j = i + 1; j < F.length; j++) {
      const ov = Math.min(F[i][2], F[j][2]) - Math.max(F[i][1], F[j][1]);
      const d = Math.abs(F[i][0] - F[j][0]);
      if (ov > 0.01 && d > 0.004) m = Math.min(m, 0.55 * d);
    }
    return m;
  };
  return [lim(V), lim(H)];
}

// ---------------------------------------------------------------- offsetting skeletons into outlines (px)
function segDirs(pts, closed) {
  const n = pts.length, m = closed ? n : n - 1, d = new Array(m);
  for (let i = 0; i < m; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1e-9;
    d[i] = [dx / l, dy / l, l];
  }
  return d;
}

/**
 * One side (sg = ±1 along n = (−dy, dx)) of a corner at V between direction da (width wa) and db (width wb).
 * The side's offset lines are intersected exactly; with a radius the corner is a circular fillet tangent to both
 * (the centre lies on the lines offset a further rho toward the inside of the turn). The outer side of the turn
 * uses ro, the inner side ri, each clamped to 45 % of the adjacent straight runs (la, lb).
 */
function cornerPts(out, V, da, db, wa, wb, sg, ro, ri, la, lb) {
  const cr = da[0] * db[1] - da[1] * db[0], dt = da[0] * db[0] + da[1] * db[1];
  const ha = wa / 2, hb = wb / 2;
  const nax = -da[1], nay = da[0], nbx = -db[1], nby = db[0];
  if (Math.abs(cr) < 0.03 && dt > 0) {          // (almost) straight on: a smooth vertex
    let nx = nax + nbx, ny = nay + nby; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const h = (ha + hb) / 2;
    out.push([V[0] + sg * nx * h, V[1] + sg * ny * h]);
    return;
  }
  if (Math.abs(cr) < 1e-6) {                    // a full reversal: bevel across (never in the face's own skeletons)
    out.push([V[0] + sg * nax * ha, V[1] + sg * nay * ha], [V[0] + sg * nbx * hb, V[1] + sg * nby * hb]);
    return;
  }
  const tau = cr > 0 ? 1 : -1;
  const theta = Math.atan2(Math.abs(cr), dt);
  const inner = sg === tau;
  let rho = inner ? ri : ro;
  // on the inner side the crossing strokes eat into the run at both ends (a U-turn has two inner fillets on one run)
  const avA = inner ? la - wb : la, avB = inner ? lb - wa : lb;
  rho = Math.max(0, Math.min(rho, 0.45 * Math.min(avA, avB) / Math.max(Math.tan(theta / 2), 0.05)));
  const oa = sg * ha + tau * rho, ob = sg * hb + tau * rho;
  const ax = V[0] + nax * oa, ay = V[1] + nay * oa, bx = V[0] + nbx * ob, by = V[1] + nby * ob;
  const u = ((bx - ax) * db[1] - (by - ay) * db[0]) / cr;
  const cx = ax + da[0] * u, cy = ay + da[1] * u;
  if (rho < 0.05) {
    // sharp: the miter point, or a bevel when an acute miter would spike
    if (Math.hypot(cx - V[0], cy - V[1]) > 2.6 * Math.max(ha, hb)) {
      out.push([V[0] + sg * nax * ha, V[1] + sg * nay * ha], [V[0] + sg * nbx * hb, V[1] + sg * nby * hb]);
    } else out.push([cx, cy]);
    return;
  }
  const a0 = Math.atan2(-tau * nay, -tau * nax), sweep = tau * theta;
  const steps = Math.max(2, Math.min(18, Math.ceil(Math.abs(sweep) * Math.sqrt(rho) * 1.25)));
  for (let i = 0; i <= steps; i++) {
    const a = a0 + sweep * i / steps;
    out.push([cx + rho * Math.cos(a), cy + rho * Math.sin(a)]);
  }
}

/** cap from one side of an end to the other: bulge b (0 flat … 1 half-ellipse of the stroke's half width) */
function capPts(out, E, dd, hp, hm, b, dir, steps) {
  if (b < 0.02) return;
  const nx = -dd[1], ny = dd[0], bh = b * (hp + hm) / 2;
  for (let j = 1; j < steps; j++) {
    const phi = Math.PI * j / steps, c = Math.cos(phi), s = Math.sin(phi);
    const h = c > 0 ? (dir > 0 ? hp : hm) : (dir > 0 ? hm : hp);
    out.push([E[0] + dir * (nx * c * h + dd[0] * s * bh), E[1] + dir * (ny * c * h + dd[1] * s * bh)]);
  }
}

function areaOf(poly) {
  let A = 0;
  for (let i = 0, n = poly.length; i < n; i++) { const a = poly[i], b = poly[(i + 1) % n]; A += a[0] * b[1] - b[0] * a[1]; }
  return A / 2;
}
/** push a contour with the wanted orientation (+1 outer, −1 hole) as a flat array */
function pushContour(sink, poly, want) {
  if (poly.length < 3) return;
  const A = areaOf(poly);
  const flat = new Array(poly.length * 2);
  const rev = (A > 0) !== (want > 0);
  for (let i = 0, n = poly.length; i < n; i++) {
    const q = poly[rev ? n - 1 - i : i];
    flat[2 * i] = q[0]; flat[2 * i + 1] = q[1];
    const ink = sink.ink;
    if (q[0] < ink[0]) ink[0] = q[0]; if (q[1] < ink[1]) ink[1] = q[1];
    if (q[0] > ink[2]) ink[2] = q[0]; if (q[1] > ink[3]) ink[3] = q[1];
  }
  sink.fill.push(flat);
}

/**
 * Open stroke outline. o: { W(dx,dy) → px width, ro, ri, b0, b1 (cap bulges), kb0, kb1 (brush at start/end), em (px) }
 * The brush terminal: the start presses (one side swells, writing direction), the end tapers to a rounded tip.
 */
function openOutline(pts0, ks0, o, sink) {
  // drop repeated points
  const pts = [pts0[0]], ks = [ks0[0]];
  for (let i = 1; i < pts0.length; i++) {
    const a = pts[pts.length - 1], b = pts0[i];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 1e-3) { pts.push(b); ks.push(ks0[i]); }
  }
  if (pts.length < 2) return;
  let d = segDirs(pts, false);
  const runA = pts.map((_, i) => (i > 0 ? d[i - 1][2] : 0)), runB = pts.map((_, i) => (i < d.length ? d[i][2] : 0));
  // brush terminals need samples near the ends: subdivide the first / last segment (smooth vertices)
  const Lb = 0.06 * o.em, len0 = d[0][2], lenL = d[d.length - 1][2];
  const Lt = Math.min(0.5 * lenL, 0.20 * o.em);
  let total = 0; for (const q of d) total += q[2];
  const P = [], K = [], RA = [], RB = [];
  for (let i = 0; i < pts.length; i++) {
    P.push(pts[i]); K.push(ks[i]); RA.push(runA[i]); RB.push(runB[i]);
    if (i === pts.length - 1) break;
    const cuts = [];
    if (i === 0 && o.kb0 > 0) for (const f of [0.5, 1, 1.6, 2.4]) { const s = f * Lb; if (s < 0.45 * len0) cuts.push(s); }
    if (i === d.length - 1 && o.kb1 > 0) for (const f of [1, 0.75, 0.5, 0.3, 0.14]) { const e = f * Lt; if (e < 0.98 * lenL) cuts.push(lenL - e); }
    cuts.sort((a, b) => a - b);
    let last = -1;
    for (const c of cuts) {
      if (c - last < 0.5) continue;
      last = c;
      P.push([pts[i][0] + d[i][0] * c, pts[i][1] + d[i][1] * c]); K.push(0); RA.push(0); RB.push(0);
    }
  }
  const n = P.length;
  d = segDirs(P, false);
  const S = [0]; for (let i = 1; i < n; i++) S.push(S[i - 1] + d[i - 1][2]);
  total = S[n - 1];
  const wseg = d.map((q) => o.W(q[0], q[1]));
  const mult = (s, sg) => {
    let m = 1;
    if (o.kb0 > 0) m *= 1 + o.kb0 * (sg < 0 ? 0.42 : 0.10) * Math.exp(-SQ(s / Lb));
    const e = total - s;
    if (o.kb1 > 0 && e < Lt) { const q = 1 - e / Lt; m *= 1 - 0.62 * o.kb1 * q * q; }
    return m;
  };
  const side = (sg) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const V = P[i];
      if (i === 0 || i === n - 1) {
        const dd = i === 0 ? d[0] : d[n - 2], w = i === 0 ? wseg[0] : wseg[n - 2];
        const h = w / 2 * mult(S[i], sg);
        out.push([V[0] - sg * dd[1] * h, V[1] + sg * dd[0] * h]);
      } else if (K[i]) {
        cornerPts(out, V, d[i - 1], d[i], wseg[i - 1], wseg[i], sg, o.ro, o.ri, RA[i] || d[i - 1][2], RB[i] || d[i][2]);
      } else {
        const da = d[i - 1], db = d[i];
        let nx = -(da[1] + db[1]), ny = da[0] + db[0]; const l = Math.hypot(nx, ny) || 1e-9; nx /= l; ny /= l;
        const cs = Math.max(0.35, -nx * db[1] + ny * db[0]);
        const h = (wseg[i - 1] + wseg[i]) / 4 * mult(S[i], sg) / cs;
        out.push([V[0] + sg * nx * h, V[1] + sg * ny * h]);
      }
    }
    return out;
  };
  const A = side(1), B = side(-1);
  const steps = Math.max(4, Math.min(16, Math.round(Math.sqrt(o.W(1, 0) + o.W(0, 1)) * 1.6)));
  const poly = A;
  const dl = d[n - 2], wl = wseg[n - 2], w0 = wseg[0];
  capPts(poly, P[n - 1], dl, wl / 2 * mult(total, 1), wl / 2 * mult(total, -1), o.b1, 1, steps);
  for (let i = B.length - 1; i >= 0; i--) poly.push(B[i]);
  capPts(poly, P[0], d[0], w0 / 2 * mult(0, 1), w0 / 2 * mult(0, -1), o.b0, -1, steps);
  pushContour(sink, poly, 1);
}

/** closed stroke (ㅁ or a sampled ring): two closed side contours, the larger outer (+), the smaller a hole (−) */
function closedOutline(P, K, o, sink) {
  const n = P.length;
  if (n < 3) return;
  const d = segDirs(P, true);
  const wseg = d.map((q) => o.W(q[0], q[1]));
  const side = (sg) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const pv = (i - 1 + n) % n, da = d[pv], db = d[i], V = P[i];
      if (K[i]) cornerPts(out, V, da, db, wseg[pv], wseg[i], sg, o.ro, o.ri, da[2], db[2]);
      else {
        let nx = -(da[1] + db[1]), ny = da[0] + db[0]; const l = Math.hypot(nx, ny) || 1e-9; nx /= l; ny /= l;
        const cs = Math.max(0.35, -nx * db[1] + ny * db[0]);
        const h = (wseg[pv] + wseg[i]) / 4 / cs;
        out.push([V[0] + sg * nx * h, V[1] + sg * ny * h]);
      }
    }
    return out;
  };
  const A = side(1), B = side(-1);
  const big = Math.abs(areaOf(A)) >= Math.abs(areaOf(B));
  pushContour(sink, big ? A : B, 1);
  pushContour(sink, big ? B : A, -1);
}

function distToSeg(p, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy || 1e-12;
  const k = clamp(((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / l2);
  return Math.hypot(p[0] - a[0] - vx * k, p[1] - a[1] - vy * k);
}
const polyLen = (pts, closed) => {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  if (closed) L += Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]);
  return L;
};
function truncate(pts, ks, L) {
  const o = [pts[0]], k = [ks[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (acc + l >= L) {
      const f = (L - acc) / (l || 1);
      if (f > 1e-3) { o.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); k.push(1); }
      break;
    }
    o.push(b); k.push(ks[i]); acc += l;
  }
  return { pts: o, ks: k };
}

/** an empty sink: fill contours, stencil bands, skeleton polylines, nodes, ink bounds, the pen tip */
export const newSink = () => ({ fill: [], bands: [], skel: [], nodes: [], ink: [Infinity, Infinity, -Infinity, -Infinity], tip: null });

/**
 * Outline units (strokes in em, y down) with parameters P = { wt, ct, wd, rd, tm, st } at a placement
 *   place = { x, y, s (px per em), sk (lean, em per em above the baseline), anim: [affine | null per unit], reveal }
 * The em → px chain: x × wd → unit affine [a b c d e f] (fly-in) → lean x += sk·(0.95 − y) → (x, y) + s·(x, y).
 * reveal (0..1) draws the strokes in writing order up to that fraction of their total length.
 * opt.skel: also record the skeleton; opt.skelOnly: skeleton only (no outlines).
 */
export function renderUnits(units, P, place, sink, opt = {}) {
  const s = place.s, wd = P.wd ?? 1, sk = place.sk || 0;
  const wv0 = stemOf(P.wt), wh0 = wv0 * (0.9 - 0.68 * clamp(P.ct ?? 0, 0, 1));
  const tm = P.tm ?? 1, kb = clamp(tm - 1, 0, 1), bulge = clamp(tm, 0, 1);
  const stress = -0.36 * kb, cS = Math.cos(stress), sS = Math.sin(stress);
  const rd = clamp(P.rd ?? 0, 0, 1);
  const ne = 3.1 - 1.1 * rd;          // ring superellipse exponent: soft square → ellipse
  const gap = (P.st || 0) * 0.032;
  const items = [];
  let total = 0;
  for (let ui = 0; ui < units.length; ui++) {
    const u = units[ui], A = place.anim && place.anim[ui];
    const [wvMax, whMax] = densityLimits(u.strokes, wd);
    const wvU = smin(wv0, wvMax), whU = Math.min(smin(wh0, whMax), wvU);
    const sc = A ? Math.sqrt(Math.abs(A[0] * A[3] - A[1] * A[2])) : 1;
    const pw = s * sc;
    const W = (dx, dy) => { const rx = dx * cS - dy * sS, ry = dx * sS + dy * cS; return pw * Math.sqrt(SQ(wvU * ry) + SQ(whU * rx)); };
    const toPx = (x, y) => {
      let ex = x * wd, ey = y;
      if (A) { const nx = A[0] * ex + A[2] * ey + A[4], ny = A[1] * ex + A[3] * ey + A[5]; ex = nx; ey = ny; }
      ex += sk * (0.95 - ey);
      return [place.x + s * ex, place.y + s * ey];
    };
    const uo = { W, ro: rd * (wvU * pw * 0.5 + 0.045 * pw), ri: rd * 0.03 * pw, em: pw, wvPx: wvU * pw, whPx: whU * pw, gap: gap * pw };
    const first = items.length;
    for (const st of u.strokes) {
      let it;
      if (st.ring) {
        const [cx, cy, rx, ry] = st.ring;
        const N = Math.max(28, Math.min(128, Math.ceil(2 * Math.PI * Math.max(rx * wd, ry) * pw / 5)));
        const pts = [], e = 2 / ne;
        for (let i = 0; i < N; i++) {
          const a = -Math.PI / 2 - 2 * Math.PI * i / N, c = Math.cos(a), sn = Math.sin(a);
          pts.push(toPx(cx + rx * Math.sign(c) * Math.pow(Math.abs(c), e), cy + ry * Math.sign(sn) * Math.pow(Math.abs(sn), e)));
        }
        it = { kind: 'ring', pts, ks: pts.map(() => 0), closed: true, center: toPx(cx, cy) };
      } else if (st.dot) {
        it = { kind: 'dot', c: toPx(st.dot[0], st.dot[1]), r: 0.72 * wvU * pw };
      } else {
        const pts = st.p.map((q) => toPx(q[0], q[1]));
        it = { kind: st.closed ? 'loop' : 'line', pts, ks: st.k.slice(), closed: !!st.closed };
      }
      it.uo = uo;
      it.len = it.kind === 'dot' ? 2 * it.r : polyLen(it.pts, it.closed);
      total += it.len;
      items.push(it);
    }
    // attachments: an open end lying on another stroke of the same jamo is a joint (flat, hidden, stencil-cut)
    const tol = 0.022 * pw;
    for (let i = first; i < items.length; i++) {
      const it = items[i];
      if (it.kind !== 'line') continue;
      it.att = [null, null];
      for (const [e, end] of [[0, it.pts[0]], [1, it.pts[it.pts.length - 1]]]) {
        for (let j = first; j < items.length && !it.att[e]; j++) {
          const h = items[j];
          if (j === i || (h.kind !== 'line' && h.kind !== 'loop')) continue;
          const m = h.closed ? h.pts.length : h.pts.length - 1;
          for (let q = 0; q < m; q++) {
            const a = h.pts[q], b = h.pts[(q + 1) % h.pts.length];
            if (distToSeg(end, a, b) < tol) { const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; it.att[e] = [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; break; }
          }
        }
      }
    }
  }

  const budget = (place.reveal ?? 1) * total;
  let acc = 0;
  for (const it of items) {
    const avail = budget - acc;
    acc += it.len;
    if (avail <= 1e-6) break;
    const uo = it.uo, partial = avail < it.len - 1e-6;
    if (it.kind === 'dot') {
      const N = 20, poly = [];
      for (let i = 0; i < N; i++) { const a = 2 * Math.PI * i / N; poly.push([it.c[0] + it.r * Math.cos(a), it.c[1] + it.r * Math.sin(a)]); }
      if (!opt.skelOnly) pushContour(sink, poly, 1);
      continue;
    }
    let pts = it.pts, ks = it.ks, closed = it.closed;
    if (partial) {
      const open = closed ? pts.concat([pts[0]]) : pts, ok = closed ? ks.concat([1]) : ks;
      ({ pts, ks } = truncate(open, ok, avail));
      closed = false;
      if (pts.length < 2) continue;
    }
    const att0 = it.att ? it.att[0] : null, att1 = it.att && !partial ? it.att[1] : null;
    if (!opt.skelOnly) {
      if (closed) closedOutline(pts, ks, uo, sink);
      else openOutline(pts, ks, {
        W: uo.W, ro: uo.ro, ri: uo.ri, em: uo.em,
        b0: att0 ? 0 : bulge * (1 - 0.45 * kb), b1: att1 ? 0 : bulge,
        kb0: att0 ? 0 : kb, kb1: att1 ? 0 : kb,
      }, sink);
    }
    if (opt.skel) {
      sink.skel.push({ pts, closed });
      if (it.kind === 'ring') sink.nodes.push([it.center[0], it.center[1], 2]);
      else {
        for (let i = 0; i < pts.length; i++) {
          const end = !closed && (i === 0 || i === pts.length - 1);
          if (end || ks[i]) sink.nodes.push([pts[i][0], pts[i][1], end ? 0 : 1]);
        }
      }
    }
    if (partial) sink.tip = pts[pts.length - 1];
    // stencil: thin bands cut across joints, corners and the thin parts of rings
    if (uo.gap > 0.05 && !partial && !opt.skelOnly) {
      const g = uo.gap, band = (cx, cy, ux, uy, len, half) => {
        const nx = -uy, ny = ux;
        sink.bands.push([cx - nx * half, cy - ny * half, cx + ux * len - nx * half, cy + uy * len - ny * half,
          cx + ux * len + nx * half, cy + uy * len + ny * half, cx + nx * half, cy + ny * half]);
      };
      if (it.kind === 'ring') {
        const N = pts.length;
        for (const i of [0, N >> 1]) {
          const a = pts[(i - 1 + N) % N], b = pts[(i + 1) % N], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
          const ux = (b[0] - a[0]) / l, uy = (b[1] - a[1]) / l, w = uo.W(ux, uy);
          band(pts[i][0] - ux * g / 2, pts[i][1] - uy * g / 2, ux, uy, g, w * 0.75);
        }
      } else {
        const d = segDirs(pts, closed), n = pts.length;
        for (const [e, att] of [[0, att0], [1, att1]]) {
          if (!att || closed) continue;
          const P0 = e === 0 ? pts[0] : pts[n - 1], dd = e === 0 ? d[0] : [-d[d.length - 1][0], -d[d.length - 1][1]];
          const hw = uo.W(att[0], att[1]), ws = uo.W(dd[0], dd[1]);
          band(P0[0] + dd[0] * hw / 2, P0[1] + dd[1] * hw / 2, dd[0], dd[1], g, ws * 0.65);
        }
        for (let i = closed ? 0 : 1; i < (closed ? n : n - 1); i++) {
          if (!ks[i]) continue;
          const da = d[(i - 1 + d.length) % d.length], db = d[i % d.length];
          if (Math.abs(da[0] * db[1] - da[1] * db[0]) < 0.2) continue;
          const wa = uo.W(da[0], da[1]), wb = uo.W(db[0], db[1]);
          band(pts[i][0] + db[0] * wa / 2, pts[i][1] + db[1] * wa / 2, db[0], db[1], g, wb * 0.75 + uo.ri);
        }
      }
    }
  }
  return sink;
}

/** lay a line of text out: [{ ch, x (em from the line start) }], total advance (em) — tracking in em */
export function layout(str, P, trackEm = 0) {
  const out = [];
  let x = 0;
  for (const ch of Array.from(str)) {
    const g = glyphUnits(ch);
    out.push({ ch, x, g });
    x += g.adv * (P.wd ?? 1) + (ch === ' ' ? 0 : trackEm);
  }
  return { items: out, adv: x - (out.length ? trackEm : 0) };
}
