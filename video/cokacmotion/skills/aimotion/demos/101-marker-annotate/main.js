/*
 * 101 · 여백에 남긴 비법 — a printed recipe page under a warm desk lamp, and the hand that finds the one line that matters.
 * The annotation layer is the whole technique: every mark is a polyline with a pen-pressure width profile, drawn on by
 * arc length at the speed of a hand (minimum-jerk envelope × the 2/3 power law), and inked onto the paper with multiply.
 *
 *   squiggle under 한 꼬집 → highlighter swipe over step 3 (chisel nib, edges, streaks, pooling, a lighter back-pass)
 *   → bracket beside step 2 → margin note 이게 / 비법! written stroke-by-stroke → loose open circle around 반만
 *   → arrow shaft, head flicked on (climax ≈ 5.97 s) → double underline → pen put down, camera pulls back.
 */
import { defineDemo, clamp, lerp, ramp, smooth, track, rand } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';

const W = 1080, H = 1920, D = 10, TAU = Math.PI * 2;
const SERIF = 'Noto Serif KR', SANS = 'Pretendard Variable', HAND = 'Nanum Pen Script';
const INK = '#2b2520', SOFT = '#5f554b', MUTE = '#8f8170';
const PEN = [196, 40, 32];            // red felt-tip
const HL = [255, 232, 40];            // highlighter body
const HL_EDGE = [232, 172, 18];       // ink that collects on the felt's borders and where the tip rests
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// the sheet on the desk (world coords), turned a hair; text and marks live in its local frame
const PAPER = { x: 58, y: 92, w: 964, h: 1568, rot: -0.0085 };
const PC = [PAPER.x + PAPER.w / 2, PAPER.y + PAPER.h / 2];
const WB = [-60, -60, 1200, 2040];    // world (desk) bounds baked once
const WS = 1.4;                       // world bake scale (stays sharp under the push-in)

// page grid
const X0 = 132, XS = 180, COL = 694, XM = 742, XR = 984;

// ---------------------------------------------------------------- timeline (s)
const T = {
  squig: [0.70, 1.20],
  hl1: [1.40, 2.26], hl2: [2.34, 2.66],
  hlDown: [2.72, 3.10],
  bracket: [3.14, 3.58],
  note: [3.70, 4.60],
  circle: [4.66, 5.46],
  shaft: [5.49, 5.82],
  barb1: [5.84, 5.90], barb2: [5.905, 5.965],
  impact: 5.965,
  ul1: [6.42, 6.62], ul2: [6.68, 6.84],
  penDown: [7.02, 7.46],
};
// camera: [zoom, centre x, centre y] — wide page → closes in on step 2 and the margin → pulls back to the annotated page
const CAM = track([
  [0.0, [1.035, 540, 950]],
  [1.2, [1.045, 540, 960]],
  [2.6, [1.075, 545, 1000]],
  [3.5, [1.11, 545, 1030]],
  [4.45, [1.15, 580, 1035]],
  [5.35, [1.135, 540, 1042]],
  [6.4, [1.145, 541, 1045]],
  [8.7, [1.035, 540, 955]],
  [10, [1.03, 540, 952]],
]);

// minimum-jerk reach (Flash & Hogan 1985): position 10u³ − 15u⁴ + 6u⁵ — the hand starts slow, runs, settles
const minjerk = (u) => { u = clamp(u); return u * u * u * (10 - 15 * u + 6 * u * u); };
const minjerkV = (u) => { u = clamp(u); return 30 * u * u * (1 - u) * (1 - u); };

// ---------------------------------------------------------------- geometry helpers
function resample(raw, step) {
  const n = raw.length, cum = new Float64Array(n);
  for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]);
  const L = cum[n - 1], m = Math.max(2, Math.round(L / step) + 1), out = [];
  let j = 0;
  for (let k = 0; k < m; k++) {
    const s = (L * k) / (m - 1);
    while (j < n - 2 && cum[j + 1] < s) j++;
    const f = (s - cum[j]) / Math.max(1e-9, cum[j + 1] - cum[j]);
    out.push([lerp(raw[j][0], raw[j + 1][0], f), lerp(raw[j][1], raw[j + 1][1], f)]);
  }
  return out;
}
function chaikin(pts, it) {
  for (let k = 0; k < it; k++) {
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      out.push([0.75 * ax + 0.25 * bx, 0.75 * ay + 0.25 * by], [0.25 * ax + 0.75 * bx, 0.25 * ay + 0.75 * by]);
    }
    out.push(pts[pts.length - 1]);
    pts = out;
  }
  return pts;
}
function cubic(p0, p1, p2, p3, n = 200) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, v = 1 - u;
    out.push([v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
      v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]);
  }
  return out;
}
/** one quad sub-path, always wound the same way so a single nonzero fill unions the whole ribbon (self-overlaps included) */
function quad(c, ax, ay, bx, by, cx, cy, dx, dy) {
  const A = (ax * by - bx * ay) + (bx * cy - cx * by) + (cx * dy - dx * cy) + (dx * ay - ax * dy);
  c.moveTo(ax, ay);
  if (A >= 0) { c.lineTo(bx, by); c.lineTo(cx, cy); c.lineTo(dx, dy); }
  else { c.lineTo(dx, dy); c.lineTo(cx, cy); c.lineTo(bx, by); }
}

// ---------------------------------------------------------------- strokes: polyline + pressure + hand timing
/**
 * A pen stroke. Resampled to even arc length; each point carries a normal, a half-width (pressure profile) and a
 * "hand time" h ∈ [0, 1]: dt/ds ∝ (κ + κ0)^(1/3) — the 2/3 power law, so the pen slows in tight turns.
 * At time t the drawn length is the point where h = minjerk((t − t0)/(t1 − t0)).
 */
function penStroke(raw, o) {
  const P = resample(raw, 1.4), n = P.length;
  const X = new Float32Array(n), Y = new Float32Array(n), NX = new Float32Array(n), NY = new Float32Array(n);
  const S = new Float32Array(n), Hh = new Float32Array(n), Wd = new Float32Array(n), K = new Float32Array(n);
  for (let i = 0; i < n; i++) { X[i] = P[i][0]; Y[i] = P[i][1]; if (i) S[i] = S[i - 1] + Math.hypot(X[i] - X[i - 1], Y[i] - Y[i - 1]); }
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 2), b = Math.min(n - 1, i + 2);
    const tx = X[b] - X[a], ty = Y[b] - Y[a], l = Math.hypot(tx, ty) || 1;
    NX[i] = -ty / l; NY[i] = tx / l;
  }
  for (let i = 1; i < n - 1; i++) {
    let d = Math.atan2(Y[i + 1] - Y[i], X[i + 1] - X[i]) - Math.atan2(Y[i] - Y[i - 1], X[i] - X[i - 1]);
    d = Math.atan2(Math.sin(d), Math.cos(d));
    K[i] = Math.abs(d) / Math.max(1e-6, (S[i + 1] - S[i - 1]) / 2);
  }
  const Ks = new Float32Array(n);
  for (let i = 0; i < n; i++) {   // curvature, box-smoothed over ±6 samples (≈ ±8 px)
    let a = 0, m = 0;
    for (let j = Math.max(0, i - 6); j <= Math.min(n - 1, i + 6); j++) { a += K[j]; m++; }
    Ks[i] = a / m;
  }
  const k0 = o.k0 ?? 1 / 260;
  let acc = 0;
  const dh = new Float32Array(n);
  for (let i = 1; i < n; i++) { dh[i] = Math.cbrt(Ks[i] + k0); acc += (S[i] - S[i - 1]) * dh[i]; Hh[i] = acc; }
  for (let i = 0; i < n; i++) Hh[i] /= acc;
  dh[0] = dh[1];
  // speed along the path (px/s ∝ minjerk'(u) / (dh/ds)) → a slow pen leaves a slightly wider line
  const V = new Float32Array(n);
  let vmax = 1e-9;
  for (let i = 0; i < n; i++) {
    let lo = 0, hi = 1;
    for (let it = 0; it < 22; it++) { const mid = (lo + hi) / 2; if (minjerk(mid) < Hh[i]) lo = mid; else hi = mid; }
    V[i] = minjerkV((lo + hi) / 2) / dh[i];
    vmax = Math.max(vmax, V[i]);
  }
  const L = S[n - 1], r = rand(o.seed || 1), p1 = r() * TAU, p2 = r() * TAU;
  const tin = o.tin ?? 7, tout = o.tout ?? 0.14, endW = o.endW ?? 0.22, land = o.land ?? 0.45, vary = o.vary ?? 0.09;
  for (let i = 0; i < n; i++) {
    const s = S[i];
    const a = land + (1 - land) * smooth(s / tin);
    const b = 1 - (1 - endW) * smooth((s - L * (1 - tout)) / (L * tout));
    const nz = 1 + vary * (0.6 * Math.sin(s / 21 + p1) + 0.4 * Math.sin(s / 7.7 + p2));
    const slow = 1 + 0.14 * (1 - V[i] / vmax);
    Wd[i] = o.w0 * a * b * nz * slow;
  }
  return { X, Y, NX, NY, S, Hh, Wd, n, L, t0: o.t0, t1: o.t1, rgb: o.rgb || PEN, alpha: o.alpha ?? 0.94, dot: o.dot ?? true };
}

/** fractional index of the pen at time t (−1 before the stroke starts) */
function strokeAt(st, t) {
  if (t <= st.t0) return -1;
  const e = minjerk((t - st.t0) / (st.t1 - st.t0));
  if (e >= 1) return st.n - 1;
  const Hh = st.Hh;
  let lo = 0, hi = st.n - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (Hh[m] <= e) lo = m; else hi = m; }
  return lo + (e - Hh[lo]) / Math.max(1e-9, Hh[hi] - Hh[lo]);
}
function pointAt(st, fi) {
  const i = Math.max(0, Math.min(st.n - 2, Math.floor(fi))), f = clamp(fi - i);
  return [lerp(st.X[i], st.X[i + 1], f), lerp(st.Y[i], st.Y[i + 1], f)];
}
function tipOf(st, t) { return pointAt(st, Math.max(0, strokeAt(st, clamp(t, st.t0 + 1e-4, st.t1)))); }

/** the drawn prefix of a pen stroke as one filled path: quads between offset points + round caps */
function drawPen(c, st, t) {
  const fi = strokeAt(st, t);
  if (fi < 0) return;
  const { X, Y, NX, NY, Wd } = st;
  const k = Math.floor(fi), f = fi - k;
  c.beginPath();
  for (let i = 0; i < k; i++) {
    const j = i + 1;
    quad(c, X[i] + NX[i] * Wd[i], Y[i] + NY[i] * Wd[i], X[i] - NX[i] * Wd[i], Y[i] - NY[i] * Wd[i],
      X[j] - NX[j] * Wd[j], Y[j] - NY[j] * Wd[j], X[j] + NX[j] * Wd[j], Y[j] + NY[j] * Wd[j]);
  }
  let ex = X[k], ey = Y[k], ew = Wd[k];
  if (f > 1e-4 && k < st.n - 1) {
    const j = k + 1;
    ex = lerp(X[k], X[j], f); ey = lerp(Y[k], Y[j], f); ew = lerp(Wd[k], Wd[j], f);
    const nx = lerp(NX[k], NX[j], f), ny = lerp(NY[k], NY[j], f);
    quad(c, X[k] + NX[k] * Wd[k], Y[k] + NY[k] * Wd[k], X[k] - NX[k] * Wd[k], Y[k] - NY[k] * Wd[k],
      ex - nx * ew, ey - ny * ew, ex + nx * ew, ey + ny * ew);
  }
  c.moveTo(X[0] + Wd[0], Y[0]); c.arc(X[0], Y[0], Wd[0], 0, TAU);
  c.moveTo(ex + ew, ey); c.arc(ex, ey, ew, 0, TAU);
  c.fillStyle = rgba(st.rgb, st.alpha);
  c.fill();
  if (st.dot) {   // the pen rested before it moved: a little more ink where it landed
    const r = st.Wd[Math.min(3, st.n - 1)] * 1.05;
    c.beginPath(); c.moveTo(X[0] + r, Y[0]); c.arc(X[0], Y[0], r, 0, TAU);
    c.fillStyle = rgba(st.rgb, 0.22); c.fill();
  }
}

// ---------------------------------------------------------------- highlighter: a chisel nib swept along a path
/**
 * The nib is a short segment (half-length A, angle φ ≈ −68°) carried along the path; consecutive nib positions span a quad.
 * Pressure wobbles A and φ; the swipe overshoots the words and rises a little (a right hand pivoting at the wrist).
 */
function hlStroke(o) {
  const r = rand(o.seed), p = [r() * TAU, r() * TAU, r() * TAU, r() * TAU];
  const raw = [], N = Math.ceil(Math.abs(o.x1 - o.x0));
  for (let k = 0; k <= N; k++) {
    const u = k / N, x = lerp(o.x0, o.x1, u);
    raw.push([x, o.y + o.slope * (x - o.x0) - o.bow * Math.sin(Math.PI * u) + 1.4 * Math.sin(u * 6.3 + p[0]) + 0.6 * Math.sin(u * 19 + p[1])]);
  }
  const P = resample(raw, 2), n = P.length;
  const X = new Float32Array(n), Y = new Float32Array(n), S = new Float32Array(n), A = new Float32Array(n);
  const UX = new Float32Array(n), UY = new Float32Array(n), Hh = new Float32Array(n);
  for (let i = 0; i < n; i++) { X[i] = P[i][0]; Y[i] = P[i][1]; if (i) S[i] = S[i - 1] + Math.hypot(X[i] - X[i - 1], Y[i] - Y[i - 1]); }
  const L = S[n - 1];
  for (let i = 0; i < n; i++) {
    const s = S[i];
    Hh[i] = s / L;   // a straight swipe: the power law is flat, only the min-jerk envelope shapes the speed
    A[i] = o.a * (1 + 0.05 * Math.sin(s / 37 + p[2]) + 0.03 * Math.sin(s / 11 + p[3])) * (o.pressIn ? 0.9 + 0.1 * smooth(s / 30) : 1);
    const ang = o.ang + 0.035 * Math.sin(s / 53 + p[1]);
    UX[i] = Math.cos(ang); UY[i] = Math.sin(ang);
  }
  // dry streaks: thin bands of extra (or missing) ink where the felt is uneven
  const streaks = [];
  for (let j = 0; j < o.streaks; j++) {
    const s0 = r() * 0.55 * L;
    streaks.push({ off: -0.78 + 1.56 * r(), wid: 0.025 + 0.05 * r(), s0, s1: Math.min(L, s0 + (0.25 + 0.5 * r()) * L), a: 0.12 + 0.14 * r() });
  }
  return { X, Y, S, A, UX, UY, Hh, n, L, t0: o.t0, t1: o.t1, alpha: o.alpha, edgeA: o.edgeA, pool: o.pool, streaks };
}
const idxAt = (st, s) => clamp(Math.round(s / (st.L / (st.n - 1))), 0, st.n - 1);
/** quads between nib offsets o0..o1 (in units of the half-length) over indices [i0, fi] (fractional end) */
function hlQuads(c, st, i0, fi, o0 = -1, o1 = 1) {
  const { X, Y, A, UX, UY } = st;
  const k = Math.floor(fi), f = fi - k;
  const pt = (i, o) => [X[i] + UX[i] * A[i] * o, Y[i] + UY[i] * A[i] * o];
  for (let i = i0; i < k; i++) {
    const a = pt(i, o1), b = pt(i, o0), d = pt(i + 1, o0), e = pt(i + 1, o1);
    quad(c, a[0], a[1], b[0], b[1], d[0], d[1], e[0], e[1]);
  }
  if (f > 1e-4 && k < st.n - 1 && k >= i0) {
    const j = k + 1, x = lerp(X[k], X[j], f), y = lerp(Y[k], Y[j], f), aa = lerp(A[k], A[j], f);
    const ux = lerp(UX[k], UX[j], f), uy = lerp(UY[k], UY[j], f);
    const a = pt(k, o1), b = pt(k, o0);
    quad(c, a[0], a[1], b[0], b[1], x + ux * aa * o0, y + uy * aa * o0, x + ux * aa * o1, y + uy * aa * o1);
  }
}
/** ink pooled under a resting nib: a gradient band parallel to the nib, darkest at the end */
function hlPool(c, st, atStart, fi, k) {
  if (k <= 0.001) return;
  const i = atStart ? 0 : st.n - 1, dir = atStart ? 1 : -1, len = 26;
  let gx = -st.UY[i], gy = st.UX[i];
  const j = clamp(i + dir * 6, 0, st.n - 1);
  if ((st.X[j] - st.X[i]) * gx + (st.Y[j] - st.Y[i]) * gy < 0) { gx = -gx; gy = -gy; }
  const g = c.createLinearGradient(st.X[i], st.Y[i], st.X[i] + gx * len, st.Y[i] + gy * len);
  g.addColorStop(0, rgba(HL_EDGE, st.pool * k));
  g.addColorStop(0.3, rgba(HL_EDGE, st.pool * 0.4 * k));
  g.addColorStop(1, rgba(HL_EDGE, 0));
  const m = Math.ceil((len + 8) / (st.L / (st.n - 1)));
  c.beginPath();
  if (atStart) hlQuads(c, st, 0, Math.min(m, fi)); else hlQuads(c, st, Math.max(0, st.n - 1 - m), st.n - 1);
  c.fillStyle = g;
  c.fill();
}
function drawHL(c, st, t) {
  const fi = strokeAt(st, t);
  if (fi < 0) return;
  c.beginPath(); hlQuads(c, st, 0, fi, -1, 1);
  c.fillStyle = rgba(HL, st.alpha); c.fill();
  // the felt's two borders carry more ink (the band dries darker at its edges)
  c.beginPath(); hlQuads(c, st, 0, fi, 0.8, 1); hlQuads(c, st, 0, fi, -1, -0.84);
  c.fillStyle = rgba(HL_EDGE, st.edgeA); c.fill();
  for (const sk of st.streaks) {
    const i0 = idxAt(st, sk.s0), i1 = Math.min(fi, idxAt(st, sk.s1));
    if (i1 <= i0 + 1) continue;
    c.beginPath(); hlQuads(c, st, i0, i1, sk.off - sk.wid, sk.off + sk.wid);
    c.fillStyle = rgba(HL_EDGE, sk.a * st.edgeA * 2.2); c.fill();
  }
  hlPool(c, st, true, fi, 1);
  if (fi >= st.n - 1) hlPool(c, st, false, fi, smooth((t - st.t1) / 0.2));
}

// ---------------------------------------------------------------- handwriting: glyphs written along their strokes
/**
 * Each syllable is rasterised once (2×). Its ink splits into connected components (jamo / strokes), ordered the way
 * Hangul is written (left → right, top → bottom); inside a component a BFS from its top-left pixel gives the distance
 * along the ink. At time t a pixel shows when the pen, running each component with a minimum-jerk profile, has passed it.
 */
function bakeGlyph(ch, size, mkc) {
  const S = 2, font = `${size * S}px "${HAND}"`;
  const m = mkc(8, 8).g;
  m.font = font;
  const mm = m.measureText(ch);
  const pad = 6, l = Math.ceil(mm.actualBoundingBoxLeft), asc = Math.ceil(mm.actualBoundingBoxAscent);
  const w = l + Math.ceil(mm.actualBoundingBoxRight) + 2 * pad, h = asc + Math.ceil(mm.actualBoundingBoxDescent) + 2 * pad;
  const full = mkc(w, h);
  full.g.font = font; full.g.fillStyle = rgba(PEN, 1);
  full.g.fillText(ch, pad + l, pad + asc);
  const px = full.g.getImageData(0, 0, w, h).data;
  const N = w * h, A = new Float32Array(N), comp = new Int32Array(N).fill(-1), dist = new Float32Array(N);
  for (let i = 0; i < N; i++) A[i] = px[i * 4 + 3] / 255;
  const comps = [], q = new Int32Array(N);
  for (let i = 0; i < N; i++) {
    if (A[i] < 0.08 || comp[i] >= 0) continue;
    const id = comps.length;
    let qh = 0, qt = 0, sx = 0, sy = 0, cnt = 0, best = i, bestK = Infinity;
    q[qt++] = i; comp[i] = id;
    while (qh < qt) {
      const p = q[qh++], x = p % w, y = (p / w) | 0;
      sx += x; sy += y; cnt++;
      const key = x + 0.85 * y;
      if (key < bestK) { bestK = key; best = p; }
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const qq = yy * w + xx;
        if (comp[qq] < 0 && A[qq] >= 0.08) { comp[qq] = id; q[qt++] = qq; }
      }
    }
    comps.push({ id, start: best, cx: sx / cnt, cy: sy / cnt, cnt, len: 0 });
  }
  // distance along the ink from each component's top-left pixel (8-connected BFS)
  dist.fill(-1);
  for (const cp of comps) {
    let qh = 0, qt = 0;
    q[qt++] = cp.start; dist[cp.start] = 0;
    while (qh < qt) {
      const p = q[qh++], x = p % w, y = (p / w) | 0, d = dist[p];
      cp.len = Math.max(cp.len, d);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const qq = yy * w + xx;
        if (comp[qq] === cp.id && dist[qq] < 0) { dist[qq] = d + 1; q[qt++] = qq; }
      }
    }
  }
  // faint anti-aliased fringe pixels (below the threshold) join the neighbouring stroke, one step further along it
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < N; i++) {
      if (comp[i] >= 0 || A[i] <= 0) continue;
      const x = i % w, y = (i / w) | 0;
      let bc = -1, bd = Infinity;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const qq = yy * w + xx;
        if (comp[qq] >= 0 && dist[qq] >= 0 && dist[qq] < bd) { bd = dist[qq]; bc = comp[qq]; }
      }
      if (bc >= 0) { comp[i] = bc; dist[i] = bd + 1; }
    }
  }
  // writing order: initial consonant, vowel, final consonant ≈ left before right, top before bottom
  const order = comps.slice().sort((a, b) => (a.cx + 1.5 * a.cy) - (b.cx + 1.5 * b.cy));
  const LIFT = 16;   // pen-lift between strokes, in px of travel
  let tot = 0;
  for (const cp of order) { cp.o = tot; tot += cp.len + 6 + LIFT; }
  const scratch = mkc(w, h), img = scratch.g.createImageData(w, h);
  for (let i = 0; i < N; i++) { img.data[i * 4] = PEN[0]; img.data[i * 4 + 1] = PEN[1]; img.data[i * 4 + 2] = PEN[2]; }
  return { ch, w, h, ox: pad + l, oy: pad + asc, adv: mm.width / S, S, A, comp, dist, comps, order, tot, full: full.cv, scratch, img };
}
/** reveal a glyph to progress p ∈ [0, 1] (time-normalised over the glyph's window) into its scratch canvas */
function writeGlyph(g, p) {
  const prog = new Float32Array(g.comps.length).fill(-1e9);
  const T0 = p * g.tot;
  for (const cp of g.order) {
    const span = cp.len + 6;
    const u = clamp((T0 - cp.o) / span);
    prog[cp.id] = minjerk(u) * span;
  }
  const { A, comp, dist, img } = g, d = img.data, N = g.w * g.h;
  for (let i = 0; i < N; i++) {
    const id = comp[i];
    let a = 0;
    if (id >= 0) a = A[i] * clamp((prog[id] - dist[i]) / 5);
    d[i * 4 + 3] = a * 242;
  }
  g.scratch.g.putImageData(img, 0, 0);
  return g.scratch.cv;
}

// ---------------------------------------------------------------- props (baked sprites at 2×)
function cylinder(g, x0, x1, r, stops) {
  const gr = g.createLinearGradient(0, -r, 0, r);
  for (const [k, col] of stops) gr.addColorStop(k, col);
  g.fillStyle = gr;
}
function sprite(mkc, len, rad, draw) {
  const S = 2, pad = 40, w = Math.ceil((len + 2 * pad) * S), h = Math.ceil((2 * rad + 2 * pad) * S);
  const a = mkc(w, h);
  a.g.setTransform(S, 0, 0, S, (pad + len / 2) * S, (pad + rad) * S);
  draw(a.g, false);
  const sil = mkc(w, h);
  sil.g.setTransform(S, 0, 0, S, (pad + len / 2) * S, (pad + rad) * S);
  draw(sil.g, true);
  const sh = mkc(w, h);
  sh.g.filter = `blur(${7 * S}px)`;
  sh.g.drawImage(sil.cv, 0, 0);
  return { cv: a.cv, sh: sh.cv, w, h, cx: (pad + len / 2) * S, cy: (pad + rad) * S, S };
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
// highlighter (tip at −x), body yellow plastic, chisel felt tip
function drawMarker(g, sil) {
  const L = 330, R = 23, x0 = -L / 2;
  const fill = (col) => { g.fillStyle = sil ? '#000' : col; };
  // chisel felt
  g.beginPath(); g.moveTo(x0 - 4, -6); g.lineTo(x0 + 12, -13); g.lineTo(x0 + 22, -13); g.lineTo(x0 + 22, 12); g.lineTo(x0 + 6, 12); g.closePath();
  fill('#f7de3e'); g.fill();
  if (!sil) { g.fillStyle = 'rgba(210,160,10,0.55)'; g.fillRect(x0 + 2, 4, 20, 8); }
  // nose cone
  g.beginPath(); g.moveTo(x0 + 22, -14); g.lineTo(x0 + 60, -21); g.lineTo(x0 + 60, 21); g.lineTo(x0 + 22, 14); g.closePath();
  if (sil) fill(); else cylinder(g, 0, 0, 21, [[0, '#8f8770'], [0.22, '#e9e2c6'], [0.55, '#b8ae8c'], [1, '#6f6650']]);
  g.fill();
  // barrel
  rr(g, x0 + 58, -R, 262, 2 * R, 7);
  if (sil) fill(); else cylinder(g, 0, 0, R, [[0, '#a8760c'], [0.16, '#ffe47c'], [0.32, '#f6c935'], [0.78, '#d29b14'], [1, '#8a5f08']]);
  g.fill();
  if (!sil) {
    // label band and grip lines (no marks, no brand)
    rr(g, x0 + 140, -R, 96, 2 * R, 2);
    cylinder(g, 0, 0, R, [[0, '#a99c86'], [0.18, '#fffaf0'], [0.5, '#ece4d4'], [1, '#8e816c']]);
    g.fill();
    g.fillStyle = 'rgba(60,45,20,0.35)';
    g.fillRect(x0 + 150, -3, 76, 2); g.fillRect(x0 + 150, 4, 54, 2);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x0 + 64, -R + 6, 250, 3);
  }
  rr(g, x0 + 316, -R + 2, 18, 2 * R - 4, 8);
  if (sil) fill(); else cylinder(g, 0, 0, R, [[0, '#7c5608'], [0.2, '#e8b52a'], [1, '#6e4a06']]);
  g.fill();
}
function drawCap(g, sil) {
  const L = 92, R = 26, x0 = -L / 2;
  rr(g, x0, -R, L, 2 * R, [5, 24, 24, 5]);
  if (sil) g.fillStyle = '#000'; else cylinder(g, 0, 0, R, [[0, '#a8760c'], [0.16, '#ffe47c'], [0.34, '#f6c935'], [0.8, '#d29b14'], [1, '#8a5f08']]);
  g.fill();
  rr(g, x0 + 8, -R - 7, 72, 10, 5);
  if (sil) g.fillStyle = '#000'; else cylinder(g, 0, 0, 5, [[0, '#ffe680'], [1, '#b8860e']]);
  g.fill();
  if (!sil) { g.fillStyle = 'rgba(80,50,0,0.35)'; g.fillRect(x0, -R, 4, 2 * R); }
}
// red felt-tip pen (tip at −x)
function drawRedPen(g, sil) {
  const L = 300, R = 12, x0 = -L / 2;
  const f = (stops) => { if (sil) g.fillStyle = '#000'; else cylinder(g, 0, 0, R, stops); };
  g.beginPath(); g.moveTo(x0, -1.6); g.lineTo(x0 + 14, -3.2); g.lineTo(x0 + 14, 3.2); g.lineTo(x0, 1.6); g.closePath();
  g.fillStyle = sil ? '#000' : '#b3241b'; g.fill();
  g.beginPath(); g.moveTo(x0 + 14, -4); g.lineTo(x0 + 40, -R + 1); g.lineTo(x0 + 40, R - 1); g.lineTo(x0 + 14, 4); g.closePath();
  f([[0, '#2a2a2c'], [0.25, '#8c8c90'], [1, '#18181a']]); g.fill();
  rr(g, x0 + 38, -R, 60, 2 * R, 3);
  f([[0, '#1d1d20'], [0.22, '#6d6d72'], [0.5, '#38383c'], [1, '#121214']]); g.fill();
  if (!sil) { g.fillStyle = 'rgba(255,255,255,0.12)'; for (let k = 0; k < 9; k++) g.fillRect(x0 + 44 + k * 6, -R, 2, 2 * R); }
  rr(g, x0 + 96, -R, 166, 2 * R, 4);
  f([[0, '#a39d92'], [0.2, '#fffdf8'], [0.55, '#e9e3d8'], [1, '#8a8378']]); g.fill();
  rr(g, x0 + 258, -R - 1, 44, 2 * R + 2, [4, 12, 12, 4]);
  f([[0, '#7e140e'], [0.2, '#ef5a48'], [0.5, '#c8342a'], [1, '#6a100b']]); g.fill();
}

// ---------------------------------------------------------------- world bake: desk, paper shadow, paper
function bakeWorld(mkc) {
  const [wx, wy, ww, wh] = WB;
  const o = mkc(Math.round(ww * WS), Math.round(wh * WS)), g = o.g;
  g.setTransform(WS, 0, 0, WS, -wx * WS, -wy * WS);
  const r = rand(4101);
  const gr = g.createLinearGradient(0, wy, 300, wy + wh);
  gr.addColorStop(0, '#4d3526'); gr.addColorStop(1, '#2a1c13');
  g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
  // walnut grain running across the desk
  for (let i = 0; i < 300; i++) {
    const y0 = wy + r() * wh, amp = 3 + r() * 12, fr = 0.002 + r() * 0.005, ph = r() * TAU;
    g.strokeStyle = r() < 0.55 ? `rgba(18,9,3,${0.08 + r() * 0.16})` : `rgba(140,98,64,${0.05 + r() * 0.1})`;
    g.lineWidth = 0.6 + r() * 2.4;
    g.beginPath();
    for (let x = wx; x <= wx + ww; x += 10) {
      const y = y0 + amp * Math.sin(x * fr + ph) + 2.5 * Math.sin(x * fr * 3.3 + ph * 2);
      if (x === wx) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }
  g.fillStyle = 'rgba(10,5,2,0.35)';
  for (const sy of [260, 1250]) g.fillRect(wx, sy, ww, 3);
  const paperXf = () => { g.translate(PC[0], PC[1]); g.rotate(PAPER.rot); g.translate(-PC[0], -PC[1]); };
  // soft drop shadow (lamp at the top left) and a tight contact shadow
  g.save(); paperXf(); g.filter = `blur(${26 * WS}px)`; g.fillStyle = 'rgba(8,4,0,0.62)';
  g.fillRect(PAPER.x + 20, PAPER.y + 30, PAPER.w, PAPER.h); g.restore();
  g.save(); paperXf(); g.filter = `blur(${3 * WS}px)`; g.fillStyle = 'rgba(8,4,0,0.45)';
  g.fillRect(PAPER.x + 2, PAPER.y + 3, PAPER.w, PAPER.h); g.restore();
  // the sheet
  g.save(); paperXf();
  g.fillStyle = '#f7f0e3'; g.fillRect(PAPER.x, PAPER.y, PAPER.w, PAPER.h);
  g.beginPath(); g.rect(PAPER.x, PAPER.y, PAPER.w, PAPER.h); g.clip();
  for (let i = 0; i < 90; i++) {   // mottling
    const x = PAPER.x + r() * PAPER.w, y = PAPER.y + r() * PAPER.h, rad = 60 + r() * 260;
    const rg = g.createRadialGradient(x, y, 0, x, y, rad);
    const col = r() < 0.55 ? [196, 170, 132] : [255, 253, 246];
    rg.addColorStop(0, rgba(col, 0.045 + r() * 0.04)); rg.addColorStop(1, rgba(col, 0));
    g.fillStyle = rg; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
  }
  // edges age a little darker
  const edge = (x0, y0, x1, y1, a) => {
    const lg = g.createLinearGradient(x0, y0, x1, y1);
    lg.addColorStop(0, `rgba(150,118,76,${a})`); lg.addColorStop(1, 'rgba(150,118,76,0)');
    g.fillStyle = lg; g.fillRect(PAPER.x, PAPER.y, PAPER.w, PAPER.h);
  };
  edge(PAPER.x, 0, PAPER.x + 46, 0, 0.16); edge(PAPER.x + PAPER.w, 0, PAPER.x + PAPER.w - 46, 0, 0.16);
  edge(0, PAPER.y, 0, PAPER.y + 46, 0.14); edge(0, PAPER.y + PAPER.h, 0, PAPER.y + PAPER.h - 46, 0.16);
  // a soft fold across the middle (the sheet was kept folded in a drawer)
  const fy = 598, fl = g.createLinearGradient(0, fy - 26, 0, fy + 26);
  fl.addColorStop(0, 'rgba(120,96,64,0)'); fl.addColorStop(0.46, 'rgba(120,96,64,0.08)'); fl.addColorStop(0.5, 'rgba(255,255,250,0.35)');
  fl.addColorStop(0.56, 'rgba(120,96,64,0.05)'); fl.addColorStop(1, 'rgba(120,96,64,0)');
  g.fillStyle = fl; g.fillRect(PAPER.x, fy - 26, PAPER.w, 52);
  g.restore();
  return o.cv;
}
/** paper grain + fibres (paper-local, 1×), laid over print and ink with multiply */
function bakeGrain(mkc) {
  const w = PAPER.w, h = PAPER.h, o = mkc(w, h), g = o.g, r = rand(4102);
  const img = g.createImageData(w, h), d = img.data;
  for (let i = 0; i < w * h; i++) {
    const v = 255 - Math.pow(r(), 3) * 20 - r() * 4;
    d[i * 4] = v; d[i * 4 + 1] = v - 1; d[i * 4 + 2] = v - 3; d[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  for (let i = 0; i < 1400; i++) {
    const x = r() * w, y = r() * h, a = r() * TAU, l = 5 + r() * 26, bend = (r() - 0.5) * 8;
    g.strokeStyle = `rgba(150,128,96,${0.06 + r() * 0.1})`;
    g.lineWidth = 0.5 + r() * 0.9;
    g.beginPath(); g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * l / 2 - Math.sin(a) * bend, y + Math.sin(a) * l / 2 + Math.cos(a) * bend, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  return o.cv;
}
/** the shadow of the writing hand: pen shaft + fingers + palm, blurred; anchor = pen tip */
function bakeHand(mkc) {
  const w = 720, h = 720, a = mkc(w, h), g = a.g, ax = 60, ay = 60;
  // the hand is high above the paper: wide, soft, displaced; the pen shaft meets its own tip: narrow and crisp near it
  g.fillStyle = '#000';
  g.translate(ax, ay); g.rotate(0.86);
  const ell = (x, y, rx, ry, rot) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.fill(); };
  ell(205, 16, 52, 24, 0.22); ell(240, -20, 56, 22, -0.25); ell(330, 22, 125, 90, 0.15); ell(480, 64, 150, 108, 0.1);
  const b = mkc(w, h);
  b.g.filter = 'blur(22px)'; b.g.globalAlpha = 0.8;
  b.g.drawImage(a.cv, 0, 0);
  const pen = mkc(w, h);
  pen.g.fillStyle = '#000'; pen.g.translate(ax, ay); pen.g.rotate(0.86);
  pen.g.beginPath(); pen.g.moveTo(2, -1.5); pen.g.lineTo(210, -9); pen.g.lineTo(210, 9); pen.g.lineTo(2, 1.5); pen.g.fill();
  b.g.globalAlpha = 1; b.g.filter = 'blur(2.5px)';
  b.g.drawImage(pen.cv, 0, 0);
  return { cv: b.cv, ax, ay };
}

// ---------------------------------------------------------------- print layout
function layoutPrint(m) {
  const items = [], rules = [], dots = [], at = {};
  const F = {
    kick: `600 23px "${SANS}"`, head: `900 104px "${SERIF}"`, meta: `500 27px "${SANS}"`, lede: `400 31px "${SERIF}"`,
    head: `700 23px "${SANS}"`, body: `400 32px "${SERIF}"`, step: `400 34px "${SERIF}"`, num: `700 26px "${SANS}"`, foot: `500 21px "${SANS}"`,
  };
  const put = (text, x, y, font, color, ls = 0, align = 'left') => {
    m.font = font; m.letterSpacing = `${ls}px`;
    const w = m.measureText(text).width;
    items.push({ text, x: align === 'right' ? x - w : align === 'center' ? x - w / 2 : x, y, font, color, ls });
    m.letterSpacing = '0px';
    return w;
  };
  const width = (text, font) => { m.font = font; m.letterSpacing = '0px'; return m.measureText(text).width; };
  put('주말 부엌 노트', X0, 204, F.kick, MUTE, 5.5);
  put('No. 12', XR, 204, F.kick, MUTE, 3, 'right');
  rules.push([X0, 228, XR - X0, 2, 'rgba(43,37,32,0.72)']);
  put('토마토 달걀볶음', X0 - 6, 352, F.head, INK, -3.6);
  put('2인분 · 15분 · 쉬움', X0, 420, F.meta, MUTE, 0.5);
  put('새콤한 토마토에 보드라운 달걀.', X0, 494, F.lede, SOFT);
  put('밥 위에 얹으면 한 그릇으로 충분하다.', X0, 544, F.lede, SOFT);
  // ingredients — three columns
  let hw = put('재료', X0, 642, F.head, INK, 6);
  rules.push([X0 + hw + 16, 633, XR - X0 - hw - 16, 1.5, 'rgba(43,37,32,0.32)']);
  const ING = [['토마토', '2개'], ['달걀', '3개'], ['대파', '반 대'], ['소금', '한 꼬집'], ['설탕', '1작은술'], ['식용유', '2큰술']];
  const sp = width(' ', F.body);
  ING.forEach(([a, b], i) => {
    const x = X0 + (i % 3) * 292, y = 714 + Math.floor(i / 3) * 56;
    const wa = put(a, x, y, F.body, INK);
    const wb = put(b, x + wa + sp, y, F.body, SOFT);
    if (b === '한 꼬집') at.pinch = { x: x + wa + sp, w: wb, y };
  });
  // method — numbered steps, a ragged-right column, and a printed memo column beside it
  hw = put('만드는 법', X0, 872, F.head, INK, 6);
  rules.push([X0 + hw + 16, 863, COL - X0 - hw - 16, 1.5, 'rgba(43,37,32,0.32)']);
  const mw = put('메모', XM, 872, F.head, MUTE, 6);
  rules.push([XM + mw + 14, 863, XR - XM - mw - 14, 1.5, 'rgba(43,37,32,0.22)']);
  for (let k = 0; k < 6; k++) for (let x = XM; x < XR; x += 9) dots.push([x, 1012 + 80 * k]);
  const STEPS = [
    ['토마토는 한입 크기로 썰고,', '달걀은 소금을 넣어 곱게 푼다.'],
    ['센 불에 달걀을 반만 익혀', '접시에 따로 덜어 둔다.'],
    ['같은 팬에 토마토를 볶다가', '즙이 나오면 설탕을 넣는다.'],
    ['달걀을 다시 넣고', '크게 두 번만 섞으면 끝.'],
  ];
  const sw = width(' ', F.step);
  STEPS.forEach(([l1, l2], k) => {
    const y = 952 + 142 * k;
    put(String(k + 1), X0, y - 1, F.num, MUTE);
    put(l1, XS, y, F.step, INK);
    put(l2, XS, y + 56, F.step, INK);
    if (k === 1) {
      m.font = F.step;
      const mm = m.measureText('반만');
      at.key = { x: XS + width('센 불에 달걀을', F.step) + sw, w: mm.width, y, asc: mm.actualBoundingBoxAscent, desc: mm.actualBoundingBoxDescent };
      at.step2 = { top: y - 30, bot: y + 56 + 9 };
    }
    if (k === 2) at.juice = { x: XS, w: width('즙이 나오면 설탕을 넣는다', F.step), y: y + 56 };
  });
  rules.push([X0, 1500, XR - X0, 1.5, 'rgba(43,37,32,0.4)']);
  put('— 12 —', (X0 + XR) / 2, 1546, F.foot, MUTE, 2, 'center');
  return { items, rules, dots, at };
}
/** a small printed line illustration beside the title: a tomato in front of an egg, cookbook engraving style */
function drawSpot(c) {
  c.save();
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = 'rgba(52,44,38,0.85)'; c.fillStyle = '#f7f0e3';
  const hatch = (clip, lines, lw) => {   // short parallel strokes, clipped to the shape (shadow side)
    c.save(); clip(); c.clip();
    c.lineWidth = lw; c.beginPath();
    for (const [x0, y0, x1, y1] of lines) { c.moveTo(x0, y0); c.lineTo(x1, y1); }
    c.stroke(); c.restore();
  };
  // egg (behind)
  const egg = () => { c.beginPath(); c.ellipse(954, 302, 25, 33, 0.3, 0, TAU); };
  c.lineWidth = 2.4; egg(); c.fill(); c.stroke();
  hatch(egg, Array.from({ length: 7 }, (_, k) => [950 + k * 5, 340, 972 + k * 5, 296]), 1.2);
  // tomato: a lobed body with a dimple at the top
  const tom = () => {
    c.beginPath();
    for (let k = 0; k <= 90; k++) {
      const a = (k / 90) * TAU;
      const r = 1 - 0.04 * Math.pow(Math.max(0, Math.cos(a * 5 + 0.6)), 4) - 0.1 * Math.pow(Math.max(0, -Math.sin(a)), 14);
      const x = 905 + 49 * r * Math.cos(a), y = 320 + 39 * r * Math.sin(a);
      if (k) c.lineTo(x, y); else c.moveTo(x, y);
    }
  };
  c.lineWidth = 2.6; tom(); c.fill(); c.stroke();
  hatch(tom, Array.from({ length: 9 }, (_, k) => [900 + k * 6, 362, 936 + k * 6, 318]), 1.2);
  c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(872, 300); c.quadraticCurveTo(866, 310, 868, 322); c.stroke();   // highlight edge
  // calyx: five pointed leaves seen from the side (flattened), and a stem
  c.lineWidth = 1.8;
  const cx = 905, cy = 285;
  for (let k = 0; k < 5; k++) {
    const a = 0.3 + (k * TAU) / 5, l = 21 + (k % 2) * 4;
    const tx = cx + Math.cos(a) * l, ty = cy + Math.sin(a) * l * 0.42 + 2;
    const nx = -Math.sin(a) * 4, ny = Math.cos(a) * 4 * 0.42;
    c.beginPath(); c.moveTo(cx, cy);
    c.quadraticCurveTo((cx + tx) / 2 + nx, (cy + ty) / 2 + ny, tx, ty);
    c.quadraticCurveTo((cx + tx) / 2 - nx, (cy + ty) / 2 - ny, cx, cy);
    c.fill(); c.stroke();
  }
  c.lineWidth = 2.6;
  c.beginPath(); c.moveTo(cx, cy); c.quadraticCurveTo(cx + 1, cy - 11, cx + 7, cy - 16); c.stroke();
  c.restore();
}
function drawPrint(c, pr) {
  drawSpot(c);
  for (const [x, y, w, h, col] of pr.rules) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  c.beginPath();
  for (const [x, y] of pr.dots) c.rect(x, y, 2.2, 2.2);
  c.fillStyle = 'rgba(143,129,112,0.45)'; c.fill();
  let font = '', ls = null;
  for (const it of pr.items) {
    if (it.font !== font) { c.font = font = it.font; }
    if (it.ls !== ls) { c.letterSpacing = `${it.ls}px`; ls = it.ls; }
    c.fillStyle = it.color;
    c.fillText(it.text, it.x, it.y);
  }
  c.letterSpacing = '0px';
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '101-marker-annotate',
  title: '여백에 남긴 비법',
  tech: '형광펜과 손 주석 · 손으로 긋는 강조의 문법',
  duration: D,
  background: '#20150e',

  async setup(api) {
    const headless = api.headless;
    const mkc = (w, h) => {
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      return { cv, g: cv.getContext('2d', headless ? { willReadFrequently: true } : undefined) };
    };
    const ALL = '주말부엌노트토마토달걀볶음인분분쉬움새콤한에보드라운밥위얹으면그릇으로충분하다재료대파반소금꼬집설탕작은술식용유큰술만드는법메모는입크기로썰고은을넣어곱게푼센불익혀접시따로덜둔같은팬볶다가즙이나오면넣는다시크두번만섞끝';
    await fontReady(`900 104px "${SERIF}"`, '토마토 달걀볶음');
    await fontReady(`400 34px "${SERIF}"`, ALL + '.,');
    await fontReady(`600 23px "${SANS}"`, ALL + 'No.12—·');
    await fontReady(`106px "${HAND}"`, '이게비법!');

    const { ctx } = api.canvas({ type: '2d', attrs: headless ? { willReadFrequently: true } : undefined });
    this.c = ctx;
    this.world = bakeWorld(mkc);
    this.grain = bakeGrain(mkc);
    this.hand = bakeHand(mkc);
    this.props = { marker: sprite(mkc, 330, 23, drawMarker), cap: sprite(mkc, 92, 33, drawCap), pen: sprite(mkc, 300, 13, drawRedPen) };
    const pr = layoutPrint(mkc(8, 8).g);
    this.print = pr;
    const at = pr.at;
    const R = rand(1010);

    // 1 · squiggle under 한 꼬집 (quick, light hand)
    const sq = [], sx0 = at.pinch.x - 6, sx1 = at.pinch.x + at.pinch.w + 10;
    let ph = -0.9;
    for (let x = sx0; x <= sx1; x += 0.6) {
      const u = (x - sx0) / (sx1 - sx0), lam = 21 + 3 * Math.sin(u * 5 + 1.3);
      ph += (TAU * 0.6) / lam;
      const A = (5.2 + 1.2 * Math.sin(u * 4.3 + 0.4)) * (0.35 + 0.65 * smooth(u / 0.12));
      sq.push([x, at.pinch.y + 14 - 2.5 * u + A * Math.sin(ph)]);
    }
    const squig = penStroke(sq, { t0: T.squig[0], t1: T.squig[1], w0: 2.8, seed: 11, k0: 1 / 120, tout: 0.1 });

    // 2 · highlighter swipe over step 3, then a lighter back-pass
    const jy = at.juice.y - 11, jx0 = at.juice.x, jx1 = at.juice.x + at.juice.w;
    const hl1 = hlStroke({ x0: jx0 - 22, x1: jx1 + 28, y: jy + 2, slope: -0.012, bow: 3, a: 25, ang: -1.19, seed: 21,
      t0: T.hl1[0], t1: T.hl1[1], alpha: 0.74, edgeA: 0.26, pool: 0.5, streaks: 5, pressIn: true });
    const hl2 = hlStroke({ x0: jx1 + 16, x1: jx0 + 74, y: jy + 6, slope: 0.006, bow: -2, a: 21, ang: -1.22, seed: 22,
      t0: T.hl2[0], t1: T.hl2[1], alpha: 0.36, edgeA: 0.16, pool: 0.3, streaks: 3 });

    // 3 · bracket in the left margin beside step 2
    const bx = X0 - 26, by0 = at.step2.top - 6, by1 = at.step2.bot + 6;
    const bracket = penStroke(chaikin([[bx + 20, by0 + 3], [bx + 1, by0], [bx - 3, (by0 + by1) / 2], [bx, by1], [bx + 22, by1 + 2]], 4),
      { t0: T.bracket[0], t1: T.bracket[1], w0: 3.1, seed: 31, tout: 0.18 });

    // 4 · the margin note, syllable by syllable on the printed memo lines
    const NOTE = { size: 106, rot: -0.05, ox: XM + 6, oy: 1012 };
    const rot = (x, y) => [NOTE.ox + x * Math.cos(NOTE.rot) - y * Math.sin(NOTE.rot), NOTE.oy + x * Math.sin(NOTE.rot) + y * Math.cos(NOTE.rot)];
    const glyphs = [];
    const lines = [['이게', 0, 0], ['비법!', 16, 80]];
    for (const [txt, lx, ly] of lines) {
      let x = lx;
      for (const ch of Array.from(txt)) {
        const g = bakeGlyph(ch, NOTE.size, mkc);
        const jr = (R() - 0.5) * 0.09, js = 1 + (R() - 0.5) * 0.07, jy = (R() - 0.5) * 6;
        const [ax, ay] = rot(x, ly + jy);
        glyphs.push(Object.assign(g, { ax, ay, gr: NOTE.rot + jr, gs: js, line: ly, lx: x }));
        x += g.adv * 0.97;
      }
    }
    // the note's time window: glyphs share it by how much ink they carry, with pen lifts between them
    {
      const GAP = 0.05, LINE = 0.13, wsum = glyphs.reduce((a, g) => a + g.tot, 0);
      const gaps = glyphs.reduce((a, g, i) => a + (i ? (g.line !== glyphs[i - 1].line ? LINE : GAP) : 0), 0);
      const k = (T.note[1] - T.note[0] - gaps) / wsum;
      let t = T.note[0];
      glyphs.forEach((g, i) => {
        if (i) t += g.line !== glyphs[i - 1].line ? LINE : GAP;
        g.t0 = t; g.t1 = t + g.tot * k; t = g.t1;
      });
    }
    const line2 = glyphs.filter((g) => g.line > 0);
    const l2w = line2[line2.length - 1].lx + line2[line2.length - 1].adv - 16;

    // 5 · the loose circle around 반만: a noisy ellipse that spirals out a little and overruns its start
    const kc = [at.key.x + at.key.w / 2 + 2, at.key.y - (at.key.asc - at.key.desc) / 2 - 1];
    const ca = at.key.w / 2 + 13, cb = (at.key.asc + at.key.desc) / 2 + 22, tilt = -0.07;
    const span = TAU + 0.62, th0 = 0.18;   // start right of centre, run counter-clockwise, end up-right past the start
    const cr = [], q1 = R() * TAU, q2 = R() * TAU, q3 = R() * TAU;
    for (let k = 0; k <= 900; k++) {
      const u = k / 900, f = span * u, th = th0 - f;
      const rr = (0.92 + 0.15 * u) * (1 + 0.035 * Math.sin(2 * f + q1) + 0.022 * Math.sin(3 * f + q2) + 0.012 * Math.sin(5 * f + q3));
      const lx = ca * rr * Math.cos(th), ly = cb * rr * Math.sin(th);
      cr.push([kc[0] + lx * Math.cos(tilt) - ly * Math.sin(tilt), kc[1] + lx * Math.sin(tilt) + ly * Math.cos(tilt)]);
    }
    const circle = penStroke(cr, { t0: T.circle[0], t1: T.circle[1], w0: 3.4, seed: 51, tout: 0.1, endW: 0.3, k0: 1 / 300 });

    // 6 · arrow: the shaft leaves the circle's end and arcs through the gutter to the note; then two flicks
    const ce = cr[cr.length - 1];
    const p0 = [ce[0] + 7, ce[1] - 3], p3 = rot(-24, -26);
    const shaftRaw = cubic(p0, [p0[0] + 70, p0[1] - 12], [p3[0] - 45, p3[1] + 40], p3).map(([x, y], i, a) => {
      const u = i / (a.length - 1);
      return [x, y + 1.2 * Math.sin(u * 9 + 0.7) * Math.sin(Math.PI * u)];
    });
    const shaft = penStroke(shaftRaw, { t0: T.shaft[0], t1: T.shaft[1], w0: 3.0, seed: 61, tout: 0.08, endW: 0.75, k0: 1 / 200 });
    const pe = shaftRaw[shaftRaw.length - 1], pb = shaftRaw[shaftRaw.length - 12];
    let dx = pe[0] - pb[0], dy = pe[1] - pb[1];
    const dl = Math.hypot(dx, dy); dx /= dl; dy /= dl;
    const barb = (sgn, len, ang, t01, seed) => {
      const ca2 = Math.cos(Math.PI - ang), sa2 = Math.sin(Math.PI - ang) * sgn;
      const vx = dx * ca2 - dy * sa2, vy = dx * sa2 + dy * ca2;
      const raw = [];
      for (let k = 0; k <= 30; k++) {
        const u = k / 30, bend = 2.2 * Math.sin(Math.PI * u) * sgn;
        raw.push([pe[0] + 1.5 * dx + vx * len * u - vy * bend, pe[1] + 1.5 * dy + vy * len * u + vx * bend]);
      }
      return penStroke(raw, { t0: t01[0], t1: t01[1], w0: 3.0, seed, tin: 1.5, land: 0.9, tout: 0.75, endW: 0.12, dot: false });
    };
    const barb1 = barb(1, 38, 0.5, T.barb1, 71), barb2 = barb(-1, 33, 0.46, T.barb2, 72);

    // 7 · double underline under 비법!
    const u1 = [rot(10, 80 + 18), rot(16 + l2w + 14, 80 + 13)], u2 = [rot(24, 80 + 32), rot(16 + l2w - 8, 80 + 29)];
    const line = (a, b, bow) => cubic(a, [lerp(a[0], b[0], 0.33), lerp(a[1], b[1], 0.33) + bow], [lerp(a[0], b[0], 0.66), lerp(a[1], b[1], 0.66) + bow], b, 60);
    const ul1 = penStroke(line(u1[0], u1[1], 3), { t0: T.ul1[0], t1: T.ul1[1], w0: 3.0, seed: 81, tout: 0.3, endW: 0.15 });
    const ul2 = penStroke(line(u2[0], u2[1], 2), { t0: T.ul2[0], t1: T.ul2[1], w0: 2.8, seed: 82, tout: 0.35, endW: 0.12 });

    this.hl = [hl1, hl2];
    this.pens = [squig, bracket, circle, shaft, barb1, barb2, ul1, ul2];
    this.glyphs = glyphs;

    // where the hand is: on the active mark's tip, gliding (and lifting) between marks
    const ev = [squig, hl1, hl2, bracket].map((st) => ({ t0: st.t0, t1: st.t1, tip: (t) => tipOf(st, t) }));
    for (const g of glyphs) ev.push({ t0: g.t0, t1: g.t1, tip: (t) => {
      const p = clamp((t - g.t0) / (g.t1 - g.t0));
      return [g.ax + Math.cos(g.gr) * g.adv * p + 6, g.ay + Math.sin(g.gr) * g.adv * p - NOTE.size * 0.28];
    } });
    for (const st of [circle, shaft, barb1, barb2, ul1, ul2]) ev.push({ t0: st.t0, t1: st.t1, tip: (t) => tipOf(st, t) });
    this.ev = ev;
  },

  frame(t) {
    const c = this.c;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
    c.lineCap = 'butt'; c.lineJoin = 'miter'; c.setLineDash([]); c.letterSpacing = '0px';
    c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';

    // camera: keyed path + slow handheld drift + a small push when the arrow lands
    let [z, cx, cy] = CAM(t);
    cx += 2.2 * Math.sin(t * 0.61 + 0.4) + 1.0 * Math.sin(t * 1.37);
    cy += 1.8 * Math.sin(t * 0.47 + 1.9) + 0.8 * Math.sin(t * 1.13 + 0.3);
    const kk = t - T.impact;
    if (kk > 0) z *= 1 + 0.022 * Math.exp(-kk * 4.2) * (1 - Math.exp(-kk * 36));
    const V = [z, 0, 0, z, W / 2 - z * cx, H / 2 - z * cy];

    c.setTransform(...V);
    c.drawImage(this.world, WB[0], WB[1], WB[2], WB[3]);
    c.translate(PC[0], PC[1]); c.rotate(PAPER.rot); c.translate(-PC[0], -PC[1]);
    const Pm = c.getTransform();
    drawPrint(c, this.print);

    // ink: everything multiplies into the paper, so marks sit behind the toner and darken where they overlap
    c.globalCompositeOperation = 'multiply';
    for (const st of this.hl) drawHL(c, st, t);
    for (const st of this.pens) drawPen(c, st, t);
    for (const g of this.glyphs) {
      if (t <= g.t0) continue;
      const src = t >= g.t1 ? g.full : writeGlyph(g, (t - g.t0) / (g.t1 - g.t0));
      c.setTransform(Pm);
      c.translate(g.ax, g.ay); c.rotate(g.gr); c.scale(g.gs / g.S, g.gs / g.S);
      c.globalAlpha = t >= g.t1 ? 0.95 : 1;
      c.drawImage(src, -g.ox, -g.oy);
    }
    c.globalAlpha = 1;
    c.setTransform(Pm);
    c.drawImage(this.grain, PAPER.x, PAPER.y, PAPER.w, PAPER.h);
    c.globalCompositeOperation = 'source-over';

    // the writing hand's shadow (the lamp is behind the left shoulder)
    const hd = handAt(this.ev, t);
    if (hd.a > 0.001) {
      c.globalAlpha = 0.17 * hd.a * (1 - 0.3 * hd.lift);
      c.drawImage(this.hand.cv, hd.p[0] + 26 * hd.lift - this.hand.ax, hd.p[1] + 34 * hd.lift - this.hand.ay);
      c.globalAlpha = 1;
    }

    // props on the desk
    c.setTransform(...V);
    const P = this.props;
    drawProp(c, P.cap, 978, 132, -0.62, 0);
    if (t > T.hlDown[0]) {
      const u = clamp((t - T.hlDown[0]) / (T.hlDown[1] - T.hlDown[0])), e = 1 - Math.pow(1 - u, 3);
      const hgt = (1 - u) * (1 - u) + 0.05 * Math.sin(Math.PI * clamp((u - 0.75) / 0.25));
      drawProp(c, P.marker, lerp(1290, 866, e), lerp(1420, 1598, e), lerp(0.05, 0.36, e), hgt);
    }
    if (t > T.penDown[0]) {
      const u = clamp((t - T.penDown[0]) / (T.penDown[1] - T.penDown[0])), e = 1 - Math.pow(1 - u, 3);
      const hgt = (1 - u) * (1 - u) + 0.04 * Math.sin(Math.PI * clamp((u - 0.78) / 0.22));
      drawProp(c, P.pen, lerp(-180, 360, e), lerp(1790, 1626, e), lerp(2.75, 3.04, e), hgt, 1.2);
    }

    // warm desk lamp from the top left: falloff (multiply) + a warm bloom (screen) that swells as the arrow lands
    const warm = 0.88 + 0.12 * ramp(t, 5.7, 6.8) + 0.12 * Math.exp(-(((t - 6.05) / 0.32) ** 2));
    c.globalCompositeOperation = 'multiply';
    const lg = c.createRadialGradient(260, 420, 60, 260, 420, 2250);
    lg.addColorStop(0, '#fffdf8'); lg.addColorStop(0.42, '#faf1e2'); lg.addColorStop(0.72, '#d9bf9e'); lg.addColorStop(1, '#86684f');
    c.fillStyle = lg; c.fillRect(WB[0], WB[1], WB[2], WB[3]);
    c.globalCompositeOperation = 'screen';
    const lg2 = c.createRadialGradient(150, 220, 0, 150, 220, 1350);
    lg2.addColorStop(0, `rgba(255,200,130,${0.2 * warm})`); lg2.addColorStop(0.55, `rgba(255,184,112,${0.08 * warm})`); lg2.addColorStop(1, 'rgba(255,170,100,0)');
    c.fillStyle = lg2; c.fillRect(WB[0], WB[1], WB[2], WB[3]);
    c.globalCompositeOperation = 'source-over';

    // screen space: a dark foot for the caption
    c.setTransform(1, 0, 0, 1, 0, 0);
    const fg = c.createLinearGradient(0, 1560, 0, H);
    fg.addColorStop(0, 'rgba(20,11,6,0)'); fg.addColorStop(1, 'rgba(20,11,6,0.74)');
    c.fillStyle = fg; c.fillRect(0, 1560, W, H - 1560);
  },
});

function drawProp(c, P, x, y, rot, hgt, k = 1) {
  const sc = k / P.S;
  c.save();
  c.translate(x + 7 + 34 * hgt, y + 10 + 46 * hgt); c.rotate(rot); c.scale(sc, sc);
  c.globalAlpha = 0.6 * (1 - 0.5 * clamp(hgt));
  c.drawImage(P.sh, -P.cx, -P.cy);
  c.restore();
  c.save();
  c.translate(x, y); c.rotate(rot); c.scale(sc * (1 + 0.05 * hgt), sc * (1 + 0.05 * hgt));
  c.drawImage(P.cv, -P.cx, -P.cy);
  c.restore();
}

/** hand position (paper coords), lift (0 on the paper … 1 mid-air between marks) and presence */
function handAt(ev, t) {
  const first = ev[0], last = ev[ev.length - 1];
  const OFF_IN = [1220, 1900], OFF_OUT = [1260, 2050];
  const mix = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  if (t < first.t0) {
    const u = smooth((t - (first.t0 - 0.75)) / 0.75);
    return { p: mix(OFF_IN, first.tip(first.t0), u), lift: 1 - u, a: u };
  }
  for (let i = 0; i < ev.length; i++) {
    const e = ev[i];
    if (t <= e.t1) {
      if (t >= e.t0) return { p: e.tip(t), lift: 0, a: 1 };
      const pv = ev[i - 1], u = (t - pv.t1) / (e.t0 - pv.t1);
      const a = pv.tip(pv.t1), b = e.tip(e.t0), dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
      return { p: mix(a, b, smooth(u)), lift: Math.sin(Math.PI * clamp(u)) * Math.min(1, dist / 160), a: 1 };
    }
  }
  const u = smooth((t - last.t1) / 0.8);
  return { p: mix(last.tip(last.t1), OFF_OUT, u), lift: u, a: 1 - u };
}
