/*
 * 108 · 가득 찬 아침 — glass letters as vessels that fill with liquid (10 s, 1080×1920, Canvas 2D only).
 *
 *   0–1.0   a kitchen counter in morning light; the word 「커피」 stands on it as four glass vessels (ㅋ ㅓ ㅍ ㅣ — every
 *           connected piece of a glyph is its own vessel) with a finger of espresso in each. A gooseneck kettle glides in.
 *   1.0–5.4 the kettle pours hot water into each vessel in writing order. The stream is ballistic (every drop of it left the
 *           spout at a known time), the level follows the vessel's own shape (volume → height table baked from the glyph),
 *           so the narrow stems shoot up and the wide bars slow down; the colour thins from espresso to americano.
 *           The surface is a sum of standing-wave modes kicked at known times, plus travelling ripples; bubbles rise.
 *   5.4–6.3 the last vessel (ㅣ) is topped up by two drips to a bulging brim; 커 and 피 lean in and clink like two cups —
 *           the liquid stays level while the glass tilts, the slosh throws one drop over the brim, the word glows.
 *   6.3–10  afterglow: steam, rocking that dies away, the drop runs down the outside and pools on the counter.
 *
 * Determinism: every value is a closed-form function of t (decaying modes A·e^(−ζτ)·sin(ωτ), ballistic streams and drops,
 * bubbles on hashed straight-up paths). Randomness only from rand(seed) in setup.
 */
import { defineDemo, rand, clamp, lerp, ease, track } from '../_lib/stage.js';
import { FONTS, fontReady, loadOutlineFont, flattenPath } from '../_lib/type.js';

const W = 1080, H = 1920, DUR = 10, TAU = Math.PI * 2, DEG = Math.PI / 180;
const GS = 560;                       // glyph size (Pretendard Black outlines)
const FLOOR = 1236;                   // bottom of the glyph boxes = where the glass stands on the counter
const WALL_END = 1204, LIP = 1268;    // counter: back edge (meets the wall) and front lip
const PF = `"${FONTS.pretendard.family}"`;
const G_FALL = 4200;                  // px/s² for the stream and drops (a big, slow-looking world)
const G_WAVE = 9000;                  // px/s² in the slosh dispersion ω² = g·k·tanh(k·depth)
const TIP_Y = 600;                    // spout tip height while pouring
const SHADOW = [40, 16];              // offset of the letters' shadow on the tiled wall (light from the upper left)

// ------------------------------------------------------------------ timing (seconds)
const T = {
  rise: [0.05, 0.7],                  // glass letters rise in (stagger 0.12 per syllable)
  kicker: 0.25, label: 0.45,
  glint: [0.55, 1.35],                // a light sweep across the glass
  kettleIn: [0.25, 0.92],
  pours: [                            // emission windows at the spout, vessel index (ㅋ ㅓ ㅍ ㅣ)
    { v: 0, e0: 0.98, e1: 2.02 },
    { v: 1, e0: 2.38, e1: 2.80 },
    { v: 2, e0: 3.16, e1: 4.10 },
    { v: 3, e0: 4.46, e1: 4.86 },
  ],
  drips: [5.05, 5.22],                // last drops shaken from the spout into ㅣ
  kettleOut: [5.38, 6.25],
  lean: [5.40, 5.53, 5.68],           // lean apart (anticipation) → lean in → clink
  flip: 5.72,                         // the label turns to 충전 완료 with the clink
  spill: 5.92,                        // a drop goes over ㅣ's brim
  run: [5.98, 6.78],                  // …and runs down the outside to the counter
  glint2: [5.70, 6.30],
  line2: 7.05,
};
const CLINK = T.lean[2];

// ------------------------------------------------------------------ palette (warm kitchen; one accent: tomato)
const INK = [43, 27, 18], CREAMC = [245, 236, 221];
const ESP = [38, 18, 9], AMER = [112, 54, 21], GOLD = [226, 146, 58], CREMA = [205, 142, 80];
const ACCENT = '#E2553A';
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mix = (A, B, k) => [lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k)];

// ------------------------------------------------------------------ small maths
const seg = (t, a, b) => clamp((t - a) / (b - a));
const sm = (t, a, b) => { const v = seg(t, a, b); return v * v * (3 - 2 * v); };
const outBack = (p) => (p >= 1 ? 1 : ease.outBack(clamp(p), 1.6));
/** progress 0..1 with constant-acceleration ramps (fractions a, d) and a linear middle (= a flow that ramps on and off) */
function trap(p, a, d) {
  p = clamp(p);
  const v = 1 / (1 - a / 2 - d / 2);
  if (p < a) return (0.5 * v * p * p) / a;
  if (p > 1 - d) { const q = 1 - p; return 1 - (0.5 * v * q * q) / d; }
  return v * (p - a / 2);
}
// 2×3 affine matrices [a b c d e f] as canvas setTransform takes them
const mmul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
  A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
const mapp = (M, x, y) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]];
const rotAbout = (th, px, py) => { const c = Math.cos(th), s = Math.sin(th); return [c, s, -s, c, px - c * px + s * py, py - s * px - c * py]; };
const transl = (x, y) => [1, 0, 0, 1, x, y];
const scaleAbout = (k, px, py) => [k, 0, 0, k, px - k * px, py - k * py];

// ------------------------------------------------------------------ state built in setup
let ctx, BG, HEADLESS = false;
const SYL = [];        // syllables: { vessels, x0, x1, y0, y1, dir }
const VES = [];        // vessels in writing order: ㅋ ㅓ ㅍ ㅣ
let KET;               // kettle Path2Ds
let tipX, tipY, tipTilt;
const MOTES = [];

// ------------------------------------------------------------------ glyph outlines → vessels
function splitContours(cmds) {
  const out = []; let cur = null;
  for (const c of cmds) { if (c.type === 'M') { cur = [c]; out.push(cur); } else if (cur) cur.push(c); }
  return out;
}
function addCmds(p, cmds) {
  for (const c of cmds) {
    if (c.type === 'M') p.moveTo(c.x, c.y);
    else if (c.type === 'L') p.lineTo(c.x, c.y);
    else if (c.type === 'Q') p.quadraticCurveTo(c.x1, c.y1, c.x, c.y);
    else if (c.type === 'C') p.bezierCurveTo(c.x1, c.y1, c.x2, c.y2, c.x, c.y);
    else if (c.type === 'Z') p.closePath();
  }
}
function bboxOf(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < pts.length; i += 2) { x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]); }
  return [x0, y0, x1, y1];
}
/** one glyph → its connected pieces (outer contour + the holes inside it), left to right */
function glyphVessels(path) {
  const cs = [];
  for (const cmds of splitContours(path.commands)) {
    const fl = flattenPath(cmds, 0.35)[0];
    if (fl) cs.push({ cmds, pts: fl.pts, area: fl.area, bb: bboxOf(fl.pts) });
  }
  const big = cs.reduce((a, b) => (Math.abs(b.area) > Math.abs(a.area) ? b : a));
  const sgn = Math.sign(big.area);
  const vs = cs.filter((c) => Math.sign(c.area) === sgn).map((o) => ({ parts: [o] }));
  for (const h of cs.filter((c) => Math.sign(c.area) !== sgn)) {
    const cx = (h.bb[0] + h.bb[2]) / 2, cy = (h.bb[1] + h.bb[3]) / 2;
    const host = vs.find((v) => { const b = v.parts[0].bb; return cx > b[0] && cx < b[2] && cy > b[1] && cy < b[3]; }) || vs[0];
    host.parts.push(h);
  }
  vs.sort((a, b) => a.parts[0].bb[0] - b.parts[0].bb[0]);
  return vs;
}

/**
 * Bake what the physics needs from the glyph raster: area per row (→ volume → level table), interior spans per row
 * (meniscus, tilt centre, the drop's outer wall), the straight-down column the stream can fall through, and the
 * highlight runs along the outline (segments whose outward normal faces the window).
 */
function prepVessel(v) {
  v.path = new Path2D();
  for (const p of v.parts) addCmds(v.path, p.cmds);
  const [bx0, by0, bx1, by1] = v.parts[0].bb;
  v.x0 = bx0; v.x1 = bx1; v.y0 = by0; v.yb = by1;
  const ox = Math.floor(bx0) - 2, oy = Math.floor(by0) - 2;
  const w = Math.ceil(bx1) - ox + 3, h = Math.ceil(by1) - oy + 3;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const c2 = cv.getContext('2d', { willReadFrequently: true });
  c2.translate(-ox, -oy); c2.fillStyle = '#fff'; c2.fill(v.path, 'evenodd');
  const px = c2.getImageData(0, 0, w, h).data;
  const area = new Float32Array(h), spans = [];
  const inside = (x, r) => px[(r * w + x) * 4 + 3] >= 128;
  for (let r = 0; r < h; r++) {
    let a = 0; const sp = []; let run = -1;
    for (let x = 0; x < w; x++) {
      a += px[(r * w + x) * 4 + 3] / 255;
      const inn = inside(x, r);
      if (inn && run < 0) run = x;
      if (!inn && run >= 0) { sp.push([ox + run, ox + x]); run = -1; }
    }
    if (run >= 0) sp.push([ox + run, ox + w]);
    area[r] = a; spans.push(sp);
  }
  const cum = new Float64Array(h + 1);
  for (let r = h - 1; r >= 0; r--) cum[r] = cum[r + 1] + area[r];
  v.oy = oy; v.rows = h; v.area = area; v.spans = spans; v.cum = cum; v.vol = cum[0];
  // level table: fraction f of the volume → y of a flat surface
  const N = 2000; v.lev = new Float32Array(N + 1);
  let r = h - 1;
  for (let i = 0; i <= N; i++) {
    const A = (i / N) * v.vol;
    while (r > 0 && cum[r] < A) r--;
    const ar = Math.max(area[r], 1e-3);
    v.lev[i] = oy + r + 1 - clamp((A - cum[r + 1]) / ar, 0, 1);
  }
  // the column the stream falls through: deepest straight run from the top opening
  let best = 0; const depth = new Int32Array(w);
  for (let x = 0; x < w; x++) {
    let r0 = 0; while (r0 < h && !inside(x, r0)) r0++;
    let r1 = r0; while (r1 < h && inside(x, r1)) r1++;
    depth[x] = r0 < 6 + (by0 - oy) + 4 ? r1 - r0 : 0;
    best = Math.max(best, depth[x]);
  }
  const runs = []; let s = -1;
  for (let x = 0; x <= w; x++) {
    const ok = x < w && depth[x] >= best * 0.9;
    if (ok && s < 0) s = x;
    if (!ok && s >= 0) { runs.push([s, x]); s = -1; }
  }
  const longest = Math.max(...runs.map((q) => q[1] - q[0]));
  const col = runs.find((q) => q[1] - q[0] >= longest * 0.6);
  v.colX = ox + (col[0] + col[1]) / 2; v.colHalf = (col[1] - col[0]) / 2;
  // highlight runs along the outline (in the vessel's own coordinates)
  const tmp = v.path;   // tested under the raster's translate: the point is given in device (raster) space
  v.runs = { left: [], top: [], right: [], left2: [] };
  for (const part of v.parts) {
    const P = part.pts, n = P.length / 2;
    // which side is the glass interior? test once on the longest segment
    let li = 0, ll = 0;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; const l = Math.hypot(P[2 * j] - P[2 * i], P[2 * j + 1] - P[2 * i + 1]); if (l > ll) { ll = l; li = i; } }
    const lj = (li + 1) % n, ldx = (P[2 * lj] - P[2 * li]) / ll, ldy = (P[2 * lj + 1] - P[2 * li + 1]) / ll;
    const mx = (P[2 * li] + P[2 * lj]) / 2, my = (P[2 * li + 1] + P[2 * lj + 1]) / 2;
    // canvas point test is in device space: shift by the raster origin
    const sgnIn = c2.isPointInPath(tmp, mx - ldy * 3 - ox, my + ldx * 3 - oy, 'evenodd') ? 1 : -1;
    // per segment: inward normal sgnIn·(−dy, dx)
    const nin = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, dx = P[2 * j] - P[2 * i], dy = P[2 * j + 1] - P[2 * i + 1], l = Math.hypot(dx, dy) || 1;
      nin.push([(-dy / l) * sgnIn, (dx / l) * sgnIn, l]);
    }
    const kinds = { left: (o) => o[0] < -0.78, top: (o) => o[1] < -0.8, right: (o) => o[0] > 0.8 };
    for (const k of Object.keys(kinds)) {
      const pred = (i) => kinds[k]([-nin[i][0], -nin[i][1]]);
      // start somewhere the predicate is false so runs do not wrap
      let st = 0; while (st < n && pred(st)) st++;
      if (st >= n) continue;
      let cur = null;
      for (let q = 1; q <= n; q++) {
        const i = (st + q) % n;
        if (pred(i)) { if (!cur) cur = [i]; else cur.push(i); }
        else if (cur) { addRun(v, k, P, nin, cur, n); cur = null; }
      }
      if (cur) addRun(v, k, P, nin, cur, n);
    }
  }
}
function addRun(v, kind, P, nin, segs, n) {
  let len = 0; for (const i of segs) len += nin[i][2];
  if (len < (kind === 'top' ? 26 : 40)) return;
  // vertices of the run, pushed inward along the (averaged) normal, then cut by arc length
  const make = (inset, trim) => {
    const vx = [];
    for (let q = 0; q <= segs.length; q++) {
      const i = q < segs.length ? segs[q] : (segs[segs.length - 1] + 1) % n;
      const a = nin[segs[Math.max(0, q - 1)]], b = nin[segs[Math.min(segs.length - 1, q)]];
      vx.push([P[2 * i] + ((a[0] + b[0]) / 2) * inset, P[2 * i + 1] + ((a[1] + b[1]) / 2) * inset]);
    }
    const cum = [0];
    for (let q = 1; q < vx.length; q++) cum.push(cum[q - 1] + Math.hypot(vx[q][0] - vx[q - 1][0], vx[q][1] - vx[q - 1][1]));
    const L = cum[cum.length - 1], s0 = trim, s1 = L - trim;
    if (s1 - s0 < 12) return null;
    const at = (sv) => {
      let q = 1; while (q < cum.length - 1 && cum[q] < sv) q++;
      const k = (sv - cum[q - 1]) / Math.max(1e-6, cum[q] - cum[q - 1]);
      return [lerp(vx[q - 1][0], vx[q][0], k), lerp(vx[q - 1][1], vx[q][1], k)];
    };
    const pts = [...at(s0)];
    for (let q = 0; q < vx.length; q++) if (cum[q] > s0 && cum[q] < s1) pts.push(vx[q][0], vx[q][1]);
    pts.push(...at(s1));
    return pts;
  };
  if (kind === 'left') {
    const a = make(12, 18), b = make(27, Math.max(34, len * 0.22));
    if (a) v.runs.left.push(a);
    if (b) v.runs.left2.push(b);
  } else if (kind === 'top') { const a = make(5, 10); if (a) v.runs.top.push(a); }
  else { const a = make(9, 24); if (a) v.runs.right.push(a); }
}
const levelY = (v, f) => { const x = clamp(f) * 2000, i = Math.min(1999, Math.floor(x)); return lerp(v.lev[i], v.lev[i + 1], x - i); };
const fracAtY = (v, y) => {
  const r = clamp(Math.floor(y - v.oy), 0, v.rows - 1);
  return clamp((v.cum[r + 1] + v.area[r] * (v.oy + r + 1 - y)) / v.vol);
};
const spansAt = (v, y) => v.spans[clamp(Math.round(y - v.oy), 0, v.rows - 1)];

// ------------------------------------------------------------------ fill, slosh and ripples (closed form in t)
function fillOf(v, t) {
  let f = v.fEsp;
  for (const p of v.pours) f += (p.f1 - p.f0) * trap(seg(t, p.tA, p.tB), 0.14, 0.22);
  for (const d of v.drips) f += d.df * sm(t, d.t, d.t + 0.08);
  return f;
}
/** syllable tilt (rad, clockwise +): anticipation apart, lean in, clink, damped rocking */
function leanOf(t) {
  const [a, b, c] = T.lean;
  if (t < a) return 0;
  if (t < b) return -0.8 * DEG * ease.outCubic(seg(t, a, b));
  if (t < c) { const p = seg(t, b, c); return lerp(-0.8 * DEG, SYL.thc, p * p); }
  // elastic: the cups bounce off each other, rock outward past upright, and settle
  const u = t - c;
  return SYL.thc * Math.exp(-2.4 * u) * (Math.cos(7 * u) - 2.2 * Math.sin(7 * u));
}
function sylMatrix(s, t) {
  const th = leanOf(t) * s.dir;
  if (Math.abs(th) < 1e-7) return [1, 0, 0, 1, 0, 0];
  const px = th > 0 ? s.x1 : s.x0;           // a cup rocks on the bottom edge it leans towards
  return rotAbout(th, px, FLOOR);
}

/**
 * The surface of vessel v at time t in the vessel's own (glass) frame: flat level from the volume table, tilted against
 * the glass by −θ (gravity stays down), three standing modes over the current surface width, travelling ripples from
 * the stream and the drips, an idle shimmer and the meniscus curling up at each wall.
 */
function surface(v, t, th) {
  const f = fillOf(v, t), h = levelY(v, f);
  const sp = spansAt(v, h);
  let xa = v.x0, xb = v.x1, xc = (v.x0 + v.x1) / 2;
  if (sp.length) {
    xa = sp[0][0]; xb = sp[sp.length - 1][1];
    let s0 = 0, s1 = 0; for (const [a, b] of sp) { s0 += (a + b) / 2 * (b - a); s1 += b - a; }
    xc = s0 / Math.max(1, s1);
  }
  const L = Math.max(30, xb - xa), depth = Math.max(8, v.yb - h);
  const A = [0, 0, 0], om = [0, 0, 0];
  for (let m = 0; m < 3; m++) { const k = ((m + 1) * Math.PI) / L; om[m] = Math.sqrt(G_WAVE * k * Math.tanh(k * depth)); }
  for (const kk of v.kicks) {
    if (t <= kk.t) continue;
    const u = t - kk.t;
    for (let m = 0; m < 3; m++) {
      const shape = kk.x == null ? kk.s[m] : kk.s[m] * Math.cos(((m + 1) * Math.PI * (kk.x - xa)) / L);
      A[m] += shape * Math.min(16, 0.055 * L) * Math.exp(-(1.4 + 0.6 * m) * u) * Math.sin(om[m] * u);
    }
  }
  const slope = -Math.tan(th);
  const Q = v.flow(t);
  const xs = [], ys = [];
  const step = 5, n = Math.ceil((v.x1 - v.x0 + 16) / step);
  for (let i = 0; i <= n; i++) {
    const x = v.x0 - 8 + i * step;
    const xx = clamp(x, xa, xb);
    let y = h + slope * (x - xc);
    for (let m = 0; m < 3; m++) y += A[m] * Math.cos(((m + 1) * Math.PI * (xx - xa)) / L);
    // idle shimmer
    y += 0.7 * Math.sin(0.05 * x - 1.9 * t + v.i * 1.7) + 0.45 * Math.sin(0.093 * x + 2.7 * t + v.i);
    // travelling ripples from the plunging stream
    if (Q > 0.01) {
      const d = Math.abs(x - v.colX);
      y += Q * 3.2 * Math.sin(0.16 * d - 19 * t) * Math.exp(-d / 110) + Q * 1.6 * Math.sin(0.27 * d - 27 * t + 1) * Math.exp(-d / 60);
      y -= Q * 6 * Math.exp(-(d * d) / 300);                       // the mound where the jet comes in
    }
    // rings from the drips: a wavefront running outward
    for (const r of v.rings) {
      const u = t - r.t; if (u <= 0 || u > 1.6) continue;
      const d = Math.abs(x - r.x), front = 260 * u;
      if (d < front) y += r.a * Math.exp(-2.6 * u) * Math.sin(0.2 * (d - front)) * Math.exp(-d / 220);
    }
    // meniscus: liquid climbs the glass a little at each wall
    for (const [a, b] of sp) if (x >= a - 2 && x <= b + 2) y -= 5.5 * (Math.exp(-(x - a) / 6) + Math.exp(-(b - x) / 6));
    xs.push(x); ys.push(y);
  }
  return { f, h, xs, ys, xa, xb };
}
const surfAt = (S, x) => {
  const i = clamp((x - S.xs[0]) / (S.xs[1] - S.xs[0]), 0, S.xs.length - 1.001), k = Math.floor(i);
  return lerp(S.ys[k], S.ys[k + 1], i - k);
};

// ------------------------------------------------------------------ the kettle and its stream
const TIP = [-312, -4], KS = 0.8;
const tipAt = (t) => [tipX(t), tipY(t)];
const tiltAt = (t) => tipTilt(t) * DEG;
function tipVel(t) { const a = tipAt(t - 0.008), b = tipAt(t + 0.008); return [(b[0] - a[0]) / 0.016, (b[1] - a[1]) / 0.016]; }
const EMIT = [-26, 170];   // water leaves the spout down and a little forward (px/s)
function particle(tau, t) {
  const p = tipAt(tau), kv = tipVel(tau), a = t - tau;
  const vx = EMIT[0] + kv[0] * 0.7, vy = EMIT[1] + kv[1] * 0.4;
  return [p[0] + vx * a, p[1] + vy * a + 0.5 * G_FALL * a * a, vx, vy + G_FALL * a];
}
function fallTime(y0, y1) { const dy = Math.max(1, y1 - y0); return (-EMIT[1] + Math.sqrt(EMIT[1] * EMIT[1] + 2 * G_FALL * dy)) / G_FALL; }

// ------------------------------------------------------------------ background (baked once)
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function bakeBackground() {
  const R = rand(108);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', HEADLESS ? { willReadFrequently: true } : undefined);
  // plaster wall
  let gr = g.createLinearGradient(0, 0, 0, 560);
  gr.addColorStop(0, '#E9D9C1'); gr.addColorStop(1, '#F1E4D1');
  g.fillStyle = gr; g.fillRect(0, 0, W, 560);
  // backsplash: brick-laid glazed tiles
  g.fillStyle = '#DCCBB4'; g.fillRect(0, 556, W, WALL_END - 556);
  const TW = 132, TH = 66;
  for (let row = 0, y = 562; y < WALL_END; row++, y += TH) {
    const off = row % 2 ? -TW / 2 : 0;
    for (let x = off; x < W; x += TW) {
      const k = 0.985 + R() * 0.03;
      const base = [248 * k, 240 * k, 228 * k];
      const tg = g.createLinearGradient(0, y, 0, y + TH);
      tg.addColorStop(0, rgba(mix(base, [255, 255, 255], 0.35))); tg.addColorStop(0.5, rgba(base)); tg.addColorStop(1, rgba(mix(base, [210, 190, 165], 0.35)));
      g.fillStyle = tg; roundRect(g, x + 2.5, y + 2.5, TW - 5, TH - 5, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.55)'; roundRect(g, x + 9, y + 6, TW * (0.3 + R() * 0.3), 3, 2); g.fill();
    }
  }
  // wooden rail between plaster and tiles
  g.fillStyle = '#C9A57A'; g.fillRect(0, 540, W, 20);
  g.fillStyle = '#E2C49B'; g.fillRect(0, 540, W, 5);
  g.fillStyle = 'rgba(90,55,30,0.18)'; g.fillRect(0, 560, W, 6);
  // shelf with soft, out-of-focus things on it (right)
  const sh = document.createElement('canvas'); sh.width = W; sh.height = 600;
  const s = sh.getContext('2d', HEADLESS ? { willReadFrequently: true } : undefined);
  s.fillStyle = '#B98D61'; roundRect(s, 560, 430, 560, 22, 6); s.fill();
  s.fillStyle = '#D9B489'; s.fillRect(560, 430, 560, 6);
  // jar of beans
  s.fillStyle = 'rgba(255,255,255,0.55)'; roundRect(s, 610, 300, 112, 130, 22); s.fill();
  s.fillStyle = '#6E4429'; roundRect(s, 618, 352, 96, 72, 16); s.fill();
  s.fillStyle = '#8A5A36'; for (let i = 0; i < 16; i++) { s.beginPath(); s.ellipse(628 + R() * 76, 362 + R() * 54, 8, 5.5, R() * 3, 0, TAU); s.fill(); }
  s.fillStyle = '#C24A30'; roundRect(s, 604, 286, 124, 22, 8); s.fill();
  // two stacked cups
  s.fillStyle = '#F7F1E8'; s.strokeStyle = 'rgba(43,27,18,0.5)'; s.lineWidth = 4;
  for (const [cy, w] of [[372, 104], [322, 96]]) { s.beginPath(); s.moveTo(780, cy); s.lineTo(780 + w, cy); s.lineTo(780 + w - 12, cy + 56); s.lineTo(792, cy + 56); s.closePath(); s.fill(); s.stroke(); }
  // small plant
  s.fillStyle = '#C98A4E'; s.beginPath(); s.moveTo(930, 360); s.lineTo(1010, 360); s.lineTo(998, 430); s.lineTo(942, 430); s.closePath(); s.fill();
  s.fillStyle = '#7E9B6A';
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.33; s.beginPath(); s.ellipse(970 + Math.cos(a) * 46, 350 + Math.sin(a) * 52, 15, 34, a + Math.PI / 2, 0, TAU); s.fill(); }
  g.filter = 'blur(6px)'; g.drawImage(sh, 0, 0); g.filter = 'none';
  g.fillStyle = 'rgba(90,55,30,0.10)'; g.fillRect(560, 452, W - 560, 26);
  // pendant lamp (soft)
  const lp = document.createElement('canvas'); lp.width = W; lp.height = 420;
  const l = lp.getContext('2d', HEADLESS ? { willReadFrequently: true } : undefined);
  const LX = 600;
  l.strokeStyle = '#4A3326'; l.lineWidth = 4; l.beginPath(); l.moveTo(LX, 0); l.lineTo(LX, 96); l.stroke();
  l.fillStyle = '#5C3B27'; l.beginPath(); l.moveTo(LX - 92, 186); l.quadraticCurveTo(LX - 84, 100, LX, 94); l.quadraticCurveTo(LX + 84, 100, LX + 92, 186); l.closePath(); l.fill();
  l.fillStyle = 'rgba(255,255,255,0.18)'; l.beginPath(); l.moveTo(LX - 60, 160); l.quadraticCurveTo(LX - 52, 112, LX - 14, 104); l.lineTo(LX - 30, 116); l.quadraticCurveTo(LX - 46, 130, LX - 48, 162); l.closePath(); l.fill();
  l.fillStyle = '#FFF1CF'; l.beginPath(); l.ellipse(LX, 186, 92, 13, 0, 0, TAU); l.fill();
  l.fillStyle = '#FFFBEF'; l.beginPath(); l.arc(LX, 192, 22, 0, Math.PI); l.fill();
  g.filter = 'blur(3px)'; g.drawImage(lp, 0, 0); g.filter = 'none';
  const lg = g.createRadialGradient(LX, 200, 10, LX, 240, 380);
  lg.addColorStop(0, 'rgba(255,236,190,0.55)'); lg.addColorStop(1, 'rgba(255,236,190,0)');
  g.fillStyle = lg; g.fillRect(0, 0, W, 700);
  // window light thrown across wall and tiles from the upper left, with the shadow of the window cross
  const wl = document.createElement('canvas'); wl.width = W; wl.height = H;
  const w = wl.getContext('2d', HEADLESS ? { willReadFrequently: true } : undefined);
  const quad = (pts) => { w.beginPath(); w.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) w.lineTo(pts[i], pts[i + 1]); w.closePath(); };
  w.fillStyle = 'rgba(255,248,226,1)';
  quad([-60, 250, 470, 360, 640, 1210, -60, 1210]); w.fill();
  w.globalCompositeOperation = 'destination-out';
  quad([170, 290, 205, 297, 345, 1210, 310, 1210]); w.fill();          // vertical mullion
  quad([-60, 640, 560, 760, 566, 792, -60, 672]); w.fill();             // transom
  w.globalCompositeOperation = 'source-over';
  g.filter = 'blur(16px)'; g.globalAlpha = 0.52; g.drawImage(wl, 0, 0); g.globalAlpha = 1; g.filter = 'none';
  // counter top (oak) and front (walnut cabinet)
  gr = g.createLinearGradient(0, WALL_END, 0, LIP);
  gr.addColorStop(0, '#CDA676'); gr.addColorStop(0.25, '#E1C094'); gr.addColorStop(1, '#D7B07D');
  g.fillStyle = gr; g.fillRect(0, WALL_END, W, LIP - WALL_END);
  g.fillStyle = 'rgba(70,40,20,0.20)'; g.fillRect(0, WALL_END - 3, W, 5);
  g.strokeStyle = 'rgba(120,80,45,0.16)'; g.lineWidth = 2;
  for (let i = 0; i < 5; i++) { const y = WALL_END + 10 + i * 12; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= W; x += 90) g.lineTo(x, y + Math.sin(x * 0.01 + i * 2) * 2.5); g.stroke(); }
  g.fillStyle = '#F0D9B5'; g.fillRect(0, LIP - 8, W, 8);
  gr = g.createLinearGradient(0, LIP, 0, H);
  gr.addColorStop(0, '#62422C'); gr.addColorStop(0.35, '#523523'); gr.addColorStop(1, '#2F1D12');
  g.fillStyle = gr; g.fillRect(0, LIP, W, H - LIP);
  g.fillStyle = 'rgba(0,0,0,0.30)'; g.fillRect(0, LIP, W, 14);
  g.strokeStyle = 'rgba(20,10,5,0.35)'; g.lineWidth = 3;
  for (const x of [360, 720]) { g.beginPath(); g.moveTo(x, LIP + 14); g.lineTo(x, H); g.stroke(); }
  g.strokeStyle = 'rgba(255,220,180,0.06)'; g.lineWidth = 2;
  for (const x of [363, 723]) { g.beginPath(); g.moveTo(x, LIP + 14); g.lineTo(x, H); g.stroke(); }
  g.strokeStyle = 'rgba(255,225,190,0.045)'; g.lineWidth = 2;
  for (let i = 0; i < 26; i++) { const x0 = R() * W, y0 = LIP + 30 + R() * (H - LIP); g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(x0 + 60, y0 + 8, x0 + 140, y0 - 6, x0 + 220, y0 + 4); g.stroke(); }
  // vignette
  const vg = g.createRadialGradient(540, 900, 300, 540, 960, 1250);
  vg.addColorStop(0, 'rgba(40,20,10,0)'); vg.addColorStop(1, 'rgba(40,20,10,0.30)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // grain
  const im = g.getImageData(0, 0, W, H), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const n = (R() - 0.5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(im, 0, 0);
  return c;
}

// ------------------------------------------------------------------ setup
async function setup(api) {
  HEADLESS = api.headless;
  await fontReady(`800 76px ${PF}`, '충전 중완료0123456789%');
  await fontReady(`700 40px ${PF}`, '월요일 오전 9:00오늘도, 한 잔 가득');
  const font = await loadOutlineFont('Pretendard-Black');
  ctx = api.canvas({ type: '2d', attrs: HEADLESS ? { willReadFrequently: true } : undefined }).ctx;

  // lay 「커피」 out on one line, centred, standing on the counter
  const text = '커피', glyphs = font.stringToGlyphs(text), sc = GS / font.unitsPerEm;
  let pen = 0; const items = [];
  for (let i = 0; i < glyphs.length; i++) {
    items.push({ g: glyphs[i], x: pen });
    pen += glyphs[i].advanceWidth * sc - 0.02 * GS;
    if (i + 1 < glyphs.length) pen += font.getKerningValue(glyphs[i], glyphs[i + 1]) * sc;
  }
  let bx0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  for (const it of items) { const b = it.g.getPath(it.x, 0, GS).getBoundingBox(); bx0 = Math.min(bx0, b.x1); bx1 = Math.max(bx1, b.x2); by1 = Math.max(by1, b.y2); }
  const ox = (W - (bx1 - bx0)) / 2 - bx0, oy = FLOOR - by1;
  items.forEach((it, si) => {
    const vs = glyphVessels(it.g.getPath(it.x + ox, oy, GS));
    vs.forEach(prepVessel);
    const s = { vessels: vs, x0: Math.min(...vs.map((v) => v.x0)), x1: Math.max(...vs.map((v) => v.x1)),
      y0: Math.min(...vs.map((v) => v.y0)), y1: FLOOR, dir: si === 0 ? 1 : -1 };
    s.path = new Path2D(); for (const v of vs) s.path.addPath(v.path);
    SYL.push(s);
    for (const v of vs) { v.syl = s; v.i = VES.length; VES.push(v); }
  });
  // the clink: both cups rock on their inner bottom edges until their top corners meet
  const gap = SYL[1].x0 - SYL[0].x1, hh = FLOOR - Math.min(SYL[0].y0, SYL[1].y0);
  SYL.thc = Math.asin(clamp((gap - 5) / (2 * hh), 0, 0.2));
  SYL.contact = [(SYL[0].x1 + SYL[1].x0) / 2, FLOOR - hh * Math.cos(SYL.thc) + 4];

  // fill plan: a finger of espresso, then hot water to a common fill line inside the top bars; ㅣ to the brim
  for (const v of VES) {
    v.fEsp = fracAtY(v, v.yb - 36);
    v.fTop = v.i === 3 ? 1 : fracAtY(v, v.y0 + 38);
    v.pours = []; v.drips = []; v.kicks = []; v.rings = []; v.bubbles = []; v.splash = [];
  }
  const RB = rand(4242);
  for (const p of T.pours) {
    const v = VES[p.v];
    p.x = v.colX - EMIT[0] * 0.33;                  // the stream drifts forward as it falls; aim so it lands mid-column
    const f1 = v.i === 3 ? 0.955 : v.fTop;
    p.tA = p.e0 + fallTime(TIP_Y, levelY(v, v.fEsp));
    p.tB = p.e1 + fallTime(TIP_Y, levelY(v, f1));
    v.pours.push({ f0: v.fEsp, f1, tA: p.tA, tB: p.tB, e0: p.e0, e1: p.e1 });
    v.kicks.push({ t: p.tA, x: v.colX, s: [1, 0.55, 0.35] });
    v.kicks.push({ t: p.tB, x: v.colX, s: [0.45, 0.3, 0.2] });
    // entrained bubbles: born under the plunging jet, rising straight up with a wobble
    for (let ts = p.tA; ts < p.tB + 0.05; ts += 0.022) {
      const lev = levelY(v, fillOf(v, ts));
      const r = 1.4 + RB() * 3.2;
      const y0 = Math.min(v.yb - r - 4, lev + 14 + RB() * 120);
      v.bubbles.push({ ts, x0: v.colX + (RB() - 0.5) * v.colHalf * 1.3, y0, vr: 70 + RB() * 110, r, A: 1.5 + RB() * 3.5, w: 7 + RB() * 7, ph: RB() * TAU, life: 2.6 });
    }
    // splash droplets thrown up where the jet meets the surface
    for (let ts = p.tA + 0.03; ts < p.tB; ts += 0.04) {
      const lev = levelY(v, fillOf(v, ts));
      for (let k = 0; k < 2; k++) {
        const sgn = k ? 1 : -1;
        v.splash.push({ ts, x0: v.colX + sgn * 4, y0: lev - 2, vx: sgn * (25 + RB() * 70) * Math.min(1, v.colHalf / 30), vy: -(140 + RB() * 220), r: 1.6 + RB() * 2.6 });
      }
    }
  }
  // ambient bubbles: a slow fizz from the bottom of each stream column for the rest of the film
  for (const v of VES) {
    for (let ts = 1.2 + RB() * 0.4; ts < DUR; ts += 0.16 + RB() * 0.22) {
      const r = 1.1 + RB() * 2.2;
      v.bubbles.push({ ts, x0: v.colX + (RB() - 0.5) * v.colHalf * 1.4, y0: v.yb - 10 - RB() * 30, vr: 35 + RB() * 45, r, A: 1 + RB() * 2.5, w: 4 + RB() * 5, ph: RB() * TAU, life: 9 });
    }
  }

  // the kettle's path: the spout tip is keyed, the body hangs from it
  const P = T.pours, px = P.map((p) => p.x);
  const IO = ease.inOutCubic, OE = ease.outExpo, IN = (p) => p * p;
  const kx = [[0, px[0] + 560], [T.kettleIn[0], px[0] + 560], [T.kettleIn[1], px[0], OE]];
  const ky = [[0, -260], [T.kettleIn[0], -260], [T.kettleIn[1], TIP_Y, OE]];
  const kt = [[0, 8], [T.kettleIn[0], 8], [T.kettleIn[1], -8, IO]];
  for (let j = 0; j < P.length; j++) {
    const p = P[j];
    kt.push([p.e0 - 0.1, -8], [p.e0 + 0.03, -22, IO], [p.e1 - 0.03, -24], [p.e1 + 0.1, -8, IO]);
    if (j + 1 < P.length) {
      const a = p.e1 + 0.06, b = P[j + 1].e0 - 0.08;
      kx.push([a, px[j]], [b, px[j + 1], IO]);
      ky.push([a, TIP_Y], [(a + b) / 2, TIP_Y - 26, IO], [b, TIP_Y, IO]);
    }
  }
  // shake off the last drops into ㅣ, then leave
  kt.push([4.98, -10], [5.04, -27, IO], [5.12, -14, IO], [5.20, -27, IO], [5.30, -10, IO]);
  kx.push([T.kettleOut[0], px[3]], [T.kettleOut[1], px[3] + 470, IN]);
  ky.push([T.kettleOut[0], TIP_Y], [T.kettleOut[1], -330, IN]);
  kt.push([T.kettleOut[0], -10], [T.kettleOut[1], 10, IO]);
  tipX = track(kx); tipY = track(ky); tipTilt = track(kt);

  // the two drips into ㅣ: fall from the spout, land on the rising surface → ring + mode kick + volume
  const v3 = VES[3];
  const dripDf = (1 - 0.955) / T.drips.length;
  T.dripHits = T.drips.map((td, k) => {
    const p0 = tipAt(td);
    let th = td;
    const level = levelY(v3, 0.955 + dripDf * k);
    for (let a = 0; a < 1.2; a += 0.002) { const y = p0[1] + 30 * a + 0.5 * G_FALL * a * a; if (y >= level) { th = td + a; break; } }
    v3.drips.push({ t: th, df: dripDf });
    v3.kicks.push({ t: th, x: p0[0], s: [0.35, 0.25, 0.15] });
    v3.rings.push({ t: th, x: p0[0], a: 3.2 });
    return { t: th, x: p0[0], y: level, t0: td, x0: p0[0], y0: p0[1] };
  });
  // the clink throws every liquid towards where its glass was going; 피's comes back over ㅣ's right brim
  for (const v of VES) v.kicks.push({ t: CLINK, x: null, s: [1.3 * v.syl.dir, 0.25, 0.1] });
  // stream flow seen by each vessel (for the ripples): on while water lands in it
  for (const v of VES) v.flow = (t) => { let q = 0; for (const p of v.pours) q += sm(t, p.tA, p.tA + 0.12) * (1 - sm(t, p.tB - 0.1, p.tB + 0.04)); return q; };
  // the spill: ㅣ's right outer wall, from the brim down to the counter (glass frame of 피)
  const rows = [];
  for (let y = v3.y0 + 2; y <= v3.yb; y += 6) { const sp = spansAt(v3, y); if (sp.length) rows.push([sp[sp.length - 1][1] + 1.5, y]); }
  T.wall = rows;
  // dust in the window light
  const RM = rand(77);
  for (let i = 0; i < 46; i++) MOTES.push({ x: RM() * 620 - 40, y: 260 + RM() * 900, r: 1 + RM() * 2.4, sp: 6 + RM() * 14, ph: RM() * TAU, a: 0.25 + RM() * 0.5 });

  KET = {
    handle: new Path2D('M70 -62 C175 -66 186 96 92 104'),
    spout: new Path2D('M-70 82 C-150 96 -200 42 -226 -28 C-242 -72 -292 -92 -306 -42 L-312 -6'),
    body: new Path2D('M-95 110 L-80 -40 Q-70 -98 0 -102 Q70 -98 80 -40 L95 110 Q95 126 79 126 L-79 126 Q-95 126 -95 110 Z'),
    band: new Path2D('M-88 52 L88 52'),
    shine: new Path2D('M-60 -40 Q-52 -80 -20 -86'),
  };
  BG = bakeBackground();
}

// ------------------------------------------------------------------ drawing helpers
const setM = (M) => ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
function polyPath(xs, ys, dy = 0) { ctx.beginPath(); ctx.moveTo(xs[0], ys[0] + dy); for (let i = 1; i < xs.length; i++) ctx.lineTo(xs[i], ys[i] + dy); }
function liquidPath(v, S) {
  ctx.beginPath();
  ctx.moveTo(S.xs[0], v.yb + 40);
  for (let i = 0; i < S.xs.length; i++) ctx.lineTo(S.xs[i], S.ys[i]);
  ctx.lineTo(S.xs[S.xs.length - 1], v.yb + 40);
}
function strokeRuns(runs) {
  ctx.beginPath();
  for (const r of runs) { ctx.moveTo(r[0], r[1]); for (let i = 2; i < r.length; i += 2) ctx.lineTo(r[i], r[i + 1]); }
  ctx.stroke();
}
function star(x, y, s, a) {
  if (a <= 0.01 || s <= 0.5) return;
  ctx.fillStyle = `rgba(255,252,240,${a})`;
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s * 0.28, y); ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s * 0.28, y); ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.moveTo(x - s * 0.7, y); ctx.quadraticCurveTo(x, y, x, y - s * 0.2); ctx.quadraticCurveTo(x, y, x + s * 0.7, y);
  ctx.quadraticCurveTo(x, y, x, y + s * 0.2); ctx.quadraticCurveTo(x, y, x - s * 0.7, y);
  ctx.fill();
  const g = ctx.createRadialGradient(x, y, 0, x, y, s * 0.9);
  g.addColorStop(0, `rgba(255,240,200,${a * 0.55})`); g.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = g; ctx.fillRect(x - s, y - s, 2 * s, 2 * s);
}
/** the background seen through a lens of glass or liquid: magnified about the vessel's centre and shifted */
function refracted(cam, wc, mag, dx, dy, bb) {
  setM(mmul(cam, mmul(scaleAbout(mag, wc[0], wc[1]), transl(dx, dy))));
  const x = Math.max(0, bb[0] - 60), y = Math.max(0, bb[1] - 60), w = Math.min(W, bb[2] + 60) - x, h = Math.min(H, bb[3] + 60) - y;
  ctx.drawImage(BG, x, y, w, h, x, y, w, h);
}
function liquidColour(v, f, glow) {
  const c = clamp(v.fEsp / Math.max(f, 1e-4));
  const k = Math.pow(clamp((c - 0.06) / 0.94), 0.55);
  let col = mix(AMER, ESP, k);
  col = mix(col, GOLD, 0.3 * glow);
  return { col, a: lerp(0.8, 0.97, k) - 0.08 * glow, k };
}
function glowOf(t) { return sm(t, CLINK, CLINK + 0.45) * (1 - 0.6 * sm(t, 6.4, 8.0)); }

// ------------------------------------------------------------------ frame
function frame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([]);

  // camera: slow push, handheld drift, a punch on the clink
  const u = t - CLINK;
  const punch = u > 0 ? 0.014 * Math.exp(-9 * u) : 0;
  const shx = u > 0 ? 5 * Math.exp(-7 * u) * Math.sin(46 * u) : 0, shy = u > 0 ? 3 * Math.exp(-7 * u) * Math.sin(39 * u + 1) : 0;
  const cs = 1.022 + 0.022 * sm(t, 0, DUR) + punch;
  const cdx = 4 * Math.sin(t * 0.55) + shx, cdy = 3 * Math.sin(t * 0.43 + 1) - 6 * sm(t, 0, DUR) + shy;
  const cam = [cs, 0, 0, cs, 540 + cdx - 540 * cs, 980 + cdy - 980 * cs];
  setM(cam);
  ctx.drawImage(BG, 0, 0);

  const glow = glowOf(t);
  // warm wash behind the word at the climax
  if (glow > 0.01) {
    const g = ctx.createRadialGradient(540, 980, 40, 540, 980, 700);
    g.addColorStop(0, `rgba(255,196,120,${0.5 * glow})`); g.addColorStop(1, 'rgba(255,196,120,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 300, W, WALL_END - 300);
  }
  // dust in the window light
  for (const m of MOTES) {
    const x = m.x + 14 * Math.sin(t * 0.35 + m.ph), y = m.y - m.sp * t + 9 * Math.sin(t * 0.5 + m.ph * 2);
    const tw = 0.6 + 0.4 * Math.sin(t * 1.7 + m.ph * 3);
    const inPatch = clamp(1 - Math.abs(x - (y - 250) * 0.19 - 250) / 300);
    ctx.fillStyle = `rgba(255,250,232,${m.a * tw * inPatch})`;
    ctx.beginPath(); ctx.arc(x, y, m.r, 0, TAU); ctx.fill();
  }

  // per-syllable transforms and every vessel's surface (in its own glass frame)
  const intro = SYL.map((s, i) => { const p = seg(t, T.rise[0] + i * 0.12, T.rise[1] + i * 0.12); return { a: ease.outCubic(p), dy: 70 * (1 - ease.outExpo(p)) }; });
  const MS = SYL.map((s, i) => mmul(transl(0, intro[i].dy), sylMatrix(s, t)));
  const th = SYL.map((s) => leanOf(t) * s.dir);
  const SURF = VES.map((v) => surface(v, t, th[SYL.indexOf(v.syl)]));

  // contact shadows on the counter
  for (let i = 0; i < SYL.length; i++) {
    const s = SYL[i], cx = (s.x0 + s.x1) / 2 + 18, w = (s.x1 - s.x0) / 2 + 26;
    setM(mmul(cam, [w / 40, 0, 0, 1, cx, FLOOR + 6]));
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
    g.addColorStop(0, `rgba(60,32,16,${0.32 * intro[i].a})`); g.addColorStop(1, 'rgba(60,32,16,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 40, 12, 0, 0, TAU); ctx.fill();
  }
  // the letters' shadow on the tiles: faint for the glass, amber where light came through the liquid, a bright caustic line
  ctx.save();
  setM(cam); ctx.beginPath(); ctx.rect(-50, 0, W + 100, WALL_END); ctx.clip();
  // three slightly spread copies make a soft penumbra (no blur filter per frame)
  for (const v of VES) {
    const si = SYL.indexOf(v.syl), S = SURF[v.i];
    for (const [ox, oy, k] of [[-5, -3, 0.3], [0, 0, 0.4], [6, 4, 0.3]]) {
      setM(mmul(cam, mmul(transl(SHADOW[0] + ox, SHADOW[1] + oy), MS[si])));
      ctx.globalAlpha = intro[si].a * k;
      ctx.fillStyle = 'rgba(80,50,25,0.2)'; ctx.fill(v.path, 'evenodd');
      ctx.save();
      ctx.clip(v.path, 'evenodd');
      liquidPath(v, S);
      ctx.fillStyle = `rgba(178,96,34,${0.42 + 0.3 * glow})`; ctx.fill();
      polyPath(S.xs, S.ys, 5);
      ctx.strokeStyle = `rgba(255,200,120,${0.9 + 0.1 * glow})`; ctx.lineWidth = 4; ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  // ---- pass 1: inside the glass (back face, refracted wall, liquid, bubbles, splashes)
  for (const v of VES) {
    const si = SYL.indexOf(v.syl), M = mmul(cam, MS[si]), Mw = MS[si], S = SURF[v.i];
    const wc = mapp(Mw, (v.x0 + v.x1) / 2, (v.y0 + v.yb) / 2);
    const bb = [Math.min(v.x0, v.x0) - 20, v.y0 - 40 + intro[si].dy, v.x1 + 20, v.yb + 20 + intro[si].dy];
    ctx.globalAlpha = intro[si].a;
    ctx.save();
    setM(M); ctx.clip(v.path, 'evenodd');
    refracted(cam, wc, 1.035, -3, 0, bb);
    setM(M);
    const vg = ctx.createLinearGradient(v.x0, 0, v.x1, 0);
    vg.addColorStop(0, 'rgba(255,253,246,0.26)'); vg.addColorStop(0.5, 'rgba(255,253,246,0.10)'); vg.addColorStop(1, 'rgba(255,253,246,0.20)');
    ctx.fillStyle = vg; ctx.fillRect(v.x0 - 10, v.y0 - 10, v.x1 - v.x0 + 20, v.yb - v.y0 + 20);
    // liquid
    ctx.save();
    liquidPath(v, S); ctx.clip();
    refracted(cam, mapp(Mw, (v.x0 + v.x1) / 2, (S.h + v.yb) / 2), 1.12, 6, -4, bb);
    setM(M);
    const { col, a } = liquidColour(v, S.f, glow);
    const lg = ctx.createLinearGradient(0, S.h, 0, v.yb);
    lg.addColorStop(0, rgba(mix(col, [255, 214, 160], 0.14), a * 0.74));
    lg.addColorStop(0.45, rgba(col, a * 0.94));
    lg.addColorStop(1, rgba(mix(col, [18, 8, 4], 0.4), Math.min(1, a + 0.04)));
    ctx.fillStyle = lg; ctx.fillRect(v.x0 - 10, S.h - 40, v.x1 - v.x0 + 20, v.yb - S.h + 60);
    if (glow > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      const gg = ctx.createLinearGradient(0, S.h, 0, v.yb);
      gg.addColorStop(0, `rgba(255,170,70,${0.26 * glow})`); gg.addColorStop(1, `rgba(255,120,40,${0.08 * glow})`);
      ctx.fillStyle = gg; ctx.fillRect(v.x0 - 10, S.h - 40, v.x1 - v.x0 + 20, v.yb - S.h + 60);
      ctx.globalCompositeOperation = 'source-over';
    }
    // aerated plume under the jet
    const Q = v.flow(t);
    if (Q > 0.01) {
      const pg = ctx.createRadialGradient(v.colX, S.h + 30, 2, v.colX, S.h + 60, 110);
      pg.addColorStop(0, `rgba(255,236,205,${0.42 * Q})`); pg.addColorStop(1, 'rgba(255,236,205,0)');
      ctx.fillStyle = pg; ctx.fillRect(v.colX - 120, S.h - 10, 240, 200);
    }
    // bubbles: straight up with a wobble from where they were born, gone when they reach the surface
    for (const b of v.bubbles) {
      const age = t - b.ts; if (age < 0 || age > b.life) continue;
      const y = b.y0 - b.vr * age;
      const x = b.x0 + b.A * Math.sin(b.w * age + b.ph);
      if (y - b.r < surfAt(S, x) + 2) continue;
      const fade = Math.min(1, age * 6);
      ctx.strokeStyle = `rgba(255,236,205,${0.75 * fade})`; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(x, y, b.r, 0, TAU); ctx.stroke();
      ctx.fillStyle = `rgba(255,248,232,${0.8 * fade})`;
      ctx.beginPath(); ctx.arc(x - b.r * 0.35, y - b.r * 0.35, Math.max(0.6, b.r * 0.3), 0, TAU); ctx.fill();
    }
    // darker band just under the surface, crema, and the meniscus highlight on top
    ctx.strokeStyle = rgba([22, 10, 5], 0.26); ctx.lineWidth = 30; polyPath(S.xs, S.ys, 20); ctx.stroke();
    ctx.strokeStyle = rgba([22, 10, 5], 0.22); ctx.lineWidth = 10; polyPath(S.xs, S.ys, 10); ctx.stroke();
    ctx.strokeStyle = rgba(mix(CREMA, GOLD, 0.5 * glow), 0.95); ctx.lineWidth = 8; polyPath(S.xs, S.ys, 2.5); ctx.stroke();
    ctx.strokeStyle = `rgba(255,244,222,0.95)`; ctx.lineWidth = 3; polyPath(S.xs, S.ys, 0.5); ctx.stroke();
    ctx.restore();
    // splash droplets above the surface (still inside the glass)
    for (const d of v.splash) {
      const age = t - d.ts; if (age < 0 || age > 0.6) continue;
      const x = d.x0 + d.vx * age, y = d.y0 + d.vy * age + 0.5 * G_FALL * age * age;
      if (y > surfAt(S, x) - 1) continue;
      ctx.fillStyle = rgba(mix(col, [255, 225, 185], 0.35), 0.95);
      ctx.beginPath(); ctx.arc(x, y, d.r, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,236,0.9)'; ctx.beginPath(); ctx.arc(x - d.r * 0.3, y - d.r * 0.3, d.r * 0.35, 0, TAU); ctx.fill();
    }
    // glass thickness: darker deep in the wall, a light band on the inside face
    ctx.strokeStyle = 'rgba(70,40,20,0.12)'; ctx.lineWidth = 34; ctx.stroke(v.path);
    ctx.strokeStyle = 'rgba(255,252,244,0.34)'; ctx.lineWidth = 13; ctx.stroke(v.path);
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // ---- the stream and the drips (inside the glass, behind its front face)
  setM(cam);
  drawStream(t, SURF);
  for (let k = 0; k < T.dripHits.length; k++) {
    const d = T.dripHits[k];
    if (t < d.t0 || t >= d.t) continue;
    const a = t - d.t0, x = d.x0 + EMIT[0] * 0.2 * a, y = d.y0 + 30 * a + 0.5 * G_FALL * a * a;
    const stretch = 1 + Math.min(0.7, a * 2.2);
    ctx.fillStyle = 'rgba(170,215,240,0.95)';
    ctx.beginPath(); ctx.ellipse(x, y, 6.5 / Math.sqrt(stretch), 6.5 * stretch, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(x - 2, y - 3, 1.8, 0, TAU); ctx.fill();
  }

  // ---- pass 2: the glass front — ink outline, highlights along the edges facing the window, the brim
  const sweeps = [[T.glint, -0.2, 1.2], [T.glint2, -0.2, 1.2]];
  let sw = null;
  for (const [win, a, b] of sweeps) if (t > win[0] && t < win[1]) sw = lerp(a, b, ease.inOutCubic(seg(t, win[0], win[1])));
  for (let si = 0; si < SYL.length; si++) {
    const s = SYL[si], M = mmul(cam, MS[si]);
    ctx.globalAlpha = intro[si].a;
    setM(M);
    ctx.strokeStyle = 'rgba(43,27,18,0.66)'; ctx.lineWidth = 4.2; ctx.stroke(s.path);
    let hl = 'rgba(255,255,255,0.82)';
    if (sw !== null) {
      const g = ctx.createLinearGradient(80, 650, 1000, 1150);
      const stops = [[0, 0.82], [sw - 0.12, 0.82], [sw, 1], [sw + 0.12, 0.82], [1, 0.82]].filter((q) => q[0] >= 0 && q[0] <= 1);
      for (const [p, al] of stops) g.addColorStop(p, al > 0.9 ? 'rgba(255,255,255,1)' : `rgba(255,255,255,${al})`);
      hl = g;
    }
    const wide = sw !== null ? 1.6 : 1;
    for (const v of s.vessels) {
      ctx.strokeStyle = hl; ctx.lineWidth = 7 * wide; strokeRuns(v.runs.left);
      ctx.strokeStyle = 'rgba(255,255,255,0.42)'; ctx.lineWidth = 3; strokeRuns(v.runs.left2);
      ctx.strokeStyle = hl; ctx.lineWidth = 3.6; strokeRuns(v.runs.top);
      ctx.strokeStyle = `rgba(255,226,180,${0.4 + 0.4 * glow})`; ctx.lineWidth = 4; strokeRuns(v.runs.right);
    }
  }
  ctx.globalAlpha = 1;
  // bloom: the glowing cups breathe light into the air around them (wide additive strokes, no blur filter)
  if (glow > 0.01) {
    ctx.globalCompositeOperation = 'lighter';
    for (let si = 0; si < SYL.length; si++) {
      setM(mmul(cam, MS[si]));
      for (const [w, a] of [[64, 0.035], [36, 0.045], [16, 0.06]]) {
        ctx.strokeStyle = `rgba(255,170,80,${a * glow})`; ctx.lineWidth = w; ctx.stroke(SYL[si].path);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // ---- ㅣ: bulging brim, the drop that goes over and runs down the outside
  drawSpill(t, cam, MS[1], SURF[3]);

  // ---- clink: a glint where the two cups touch, a thin ring, sparkles on the brims
  if (u > -0.02 && u < 0.9) {
    setM(cam);
    const [cx, cy] = SYL.contact;
    const k = Math.max(0, u);
    const fl = 0.32 * Math.exp(-11 * k);
    const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 260);
    fg.addColorStop(0, `rgba(255,250,235,${fl})`); fg.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = fg; ctx.fillRect(cx - 260, cy - 260, 520, 520);
    const rr = 16 + 140 * ease.outCubic(clamp(k / 0.4));
    ctx.strokeStyle = `rgba(255,246,225,${0.85 * (1 - clamp(k / 0.4))})`; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.stroke();
    star(cx, cy, 96 * Math.exp(-3 * k) * clamp(k * 30 + 0.3), Math.exp(-2.4 * k));
  }
  if (glow > 0.02) {
    for (let si = 0; si < SYL.length; si++) {
      setM(mmul(cam, MS[si]));
      SYL[si].vessels.forEach((v, j) => {
        const run = v.runs.top[0]; if (!run) return;
        const ph = 0.9 + 0.17 * (v.i * 3 % 5);
        const k = clamp((t - CLINK - 0.1 * v.i) / ph);
        const env = Math.sin(Math.PI * k);
        star(run[run.length - 2], run[run.length - 1], 30 * env, 0.9 * env);
      });
    }
  }

  // ---- kettle (in front of everything in the scene)
  drawKettle(t, cam);
  // ---- steam over the full cups
  drawSteam(t, cam, SURF);

  // ---- type (overlay, not moved by the camera)
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  drawType(t, SURF);
}

function drawStream(t, SURF) {
  for (const p of T.pours) {
    if (t < p.e0 || t > p.e1 + 1.0) continue;
    const v = VES[p.v], S = SURF[v.i];
    const hi = Math.min(t, p.e1), lo = Math.max(p.e0, t - 0.9);
    if (hi <= lo) continue;
    const N = 42, L = [], Rr = [], C = [];
    let cut = false;
    const flowAt = (tau) => sm(tau, p.e0, p.e0 + 0.08) * (1 - sm(tau, p.e1 - 0.1, p.e1));
    for (let i = 0; i <= N; i++) {
      const tau = lerp(hi, lo, i / N);                 // youngest (at the spout) first
      const q = particle(tau, t);
      let [x, y, vx, vy] = q;
      const ys = surfAt(S, x);
      if (y >= ys) {
        if (i === 0) { cut = true; break; }
        const pr = C[C.length - 1];
        const k = clamp((ys - pr[1]) / Math.max(1e-3, y - pr[1]));
        x = lerp(pr[0], x, k); y = ys + 3;
        cut = true;
      }
      const sp = Math.hypot(vx, vy);
      const w = 15 * Math.sqrt(Math.max(0.05, flowAt(tau))) * Math.sqrt(EMIT[1] / sp) + 1.2;
      const nx = -vy / sp, ny = vx / sp;
      L.push([x + nx * w / 2, y + ny * w / 2]); Rr.push([x - nx * w / 2, y - ny * w / 2]); C.push([x, y, w, tau]);
      if (cut) break;
    }
    if (C.length < 2) continue;
    ctx.beginPath();
    ctx.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < L.length; i++) ctx.lineTo(L[i][0], L[i][1]);
    for (let i = Rr.length - 1; i >= 0; i--) ctx.lineTo(Rr[i][0], Rr[i][1]);
    ctx.fillStyle = 'rgba(150,204,236,0.88)'; ctx.fill();
    // ends are round
    for (const e of [C[0], C[C.length - 1]]) { ctx.beginPath(); ctx.arc(e[0], e[1], e[2] / 2, 0, TAU); ctx.fill(); }
    // core highlight and travelling glints (attached to the water: each glint is a slice of emission time)
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let i = 0; i < C.length; i++) { const c = C[i]; const x = c[0] - c[2] * 0.22; if (i) ctx.lineTo(x, c[1]); else ctx.moveTo(x, c[1]); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 3;
    const end = C[C.length - 1][3];
    for (let k = Math.ceil((lo - p.e0) / 0.055); ; k++) {
      const t0 = p.e0 + k * 0.055; if (t0 > hi) break;
      const t1 = Math.min(hi, t0 + 0.016); if (t1 < end) continue;
      ctx.beginPath();
      for (let j = 0; j <= 3; j++) { const q = particle(lerp(t0, t1, j / 3), t); if (q[1] >= surfAt(S, q[0])) break; const ww = 15 * Math.sqrt(EMIT[1] / Math.hypot(q[2], q[3])); const x = q[0] + ww * 0.18; j ? ctx.lineTo(x, q[1]) : ctx.moveTo(x, q[1]); }
      ctx.stroke();
    }
  }
}

function drawSpill(t, cam, M1, S3) {
  const v = VES[3];
  const M = mmul(cam, M1);
  setM(M);
  // the brim bulge: surface tension holds a dome above the rim after the last drip
  const bulge = 11 * sm(t, T.dripHits[1].t - 0.05, T.dripHits[1].t + 0.12) * (1 - 0.7 * sm(t, T.spill - 0.04, T.spill + 0.12));
  const top = v.runs.top[0];
  if (bulge > 0.3 && top) {
    const sp = spansAt(v, v.y0 + 4); const a = sp[0][0] + 3, b = sp[sp.length - 1][1] - 3;
    const { col } = liquidColour(v, 1, glowOf(t));
    const wob = 1.5 * Math.sin((t - CLINK) * 18) * (t > CLINK ? Math.exp(-3 * (t - CLINK)) : 0);
    ctx.beginPath(); ctx.moveTo(a, v.y0 + 2);
    ctx.bezierCurveTo(a + 4, v.y0 - bulge * 1.2 + wob, b - 4, v.y0 - bulge * 1.2 - wob, b, v.y0 + 2);
    ctx.closePath();
    ctx.fillStyle = rgba(mix(col, CREMA, 0.6), 0.95); ctx.fill();
    ctx.strokeStyle = 'rgba(255,244,222,0.95)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(a + 6, v.y0 - bulge * 0.55); ctx.bezierCurveTo(a + 10, v.y0 - bulge * 0.95 + wob, b - 10, v.y0 - bulge * 0.95 - wob, b - 6, v.y0 - bulge * 0.55); ctx.stroke();
  }
  if (t < T.spill) return;
  const wall = T.wall;
  const y0 = wall[0][1], y1 = v.yb - 10;
  // the drop crests over the right brim, then slides down the outside (fast start, slows as it leaves its trail behind)
  const k = seg(t, T.run[0], T.run[1]);
  const pos = lerp(y0 - 4, y1, 1 - Math.pow(1 - k, 1.7) * (1 - k * 0.3));
  const over = sm(t, T.spill, T.run[0] + 0.04);
  const wx = (y) => { const i = clamp(Math.round((y - y0) / 6), 0, wall.length - 1); return wall[i][0]; };
  const { col } = liquidColour(v, 1, glowOf(t));
  const dcol = mix(col, [160, 92, 40], 0.3);
  if (k > 0) {
    // the trail: a film thinning behind the drop
    ctx.strokeStyle = rgba(dcol, 0.72); ctx.lineWidth = 5.5;
    ctx.beginPath(); ctx.moveTo(wx(y0) - 2, y0 - 2);
    for (let y = y0; y < pos - 8; y += 6) ctx.lineTo(wx(y) + 1.5, y);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,240,215,0.55)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(wx(y0) + 1, y0 + 4);
    for (let y = y0 + 4; y < pos - 12; y += 6) ctx.lineTo(wx(y) + 3, y);
    ctx.stroke();
  }
  if (k < 1) {
    const r = 12 * over;
    const x = wx(pos) + r * 0.55, y = pos;
    ctx.fillStyle = rgba(dcol, 0.96);
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.9, r * (1.15 + 0.25 * k), 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,246,228,0.95)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.28, 0, TAU); ctx.fill();
  }
  // a little pool on the counter
  const pk = sm(t, T.run[1] - 0.05, T.run[1] + 0.5);
  if (pk > 0) {
    setM(cam);
    const [px, py] = mapp(M1, wx(y1) + 6, FLOOR + 3);
    ctx.fillStyle = rgba(dcol, 0.85); ctx.beginPath(); ctx.ellipse(px + 8 * pk, py, 6 + 20 * pk, 2.5 + 3.5 * pk, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,215,0.6)'; ctx.beginPath(); ctx.ellipse(px + 3 + 8 * pk, py - 1.5, 3 + 8 * pk, 1.2, 0, 0, TAU); ctx.fill();
  }
}

function drawKettle(t, cam) {
  if (t < T.kettleIn[0] || t > T.kettleOut[1]) return;
  const tip = tipAt(t), th = tiltAt(t);
  const c = Math.cos(th), s = Math.sin(th);
  const lx = TIP[0] * KS, ly = TIP[1] * KS;
  const bx = tip[0] - (c * lx - s * ly), by = tip[1] - (s * lx + c * ly);
  setM(mmul(cam, [c * KS, s * KS, -s * KS, c * KS, bx, by]));
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#6B4A32'; ctx.lineWidth = 22; ctx.stroke(KET.handle);
  ctx.strokeStyle = '#2B1B12'; ctx.lineWidth = 24; ctx.stroke(KET.spout);
  ctx.strokeStyle = '#F4EEE4'; ctx.lineWidth = 13; ctx.stroke(KET.spout);
  ctx.fillStyle = '#F4EEE4'; ctx.fill(KET.body);
  ctx.strokeStyle = '#2B1B12'; ctx.lineWidth = 5; ctx.stroke(KET.body);
  ctx.strokeStyle = '#D9C9B4'; ctx.lineWidth = 16; ctx.stroke(KET.band);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 9; ctx.stroke(KET.shine);
  ctx.fillStyle = '#E9E1D5'; ctx.beginPath(); ctx.ellipse(0, -102, 56, 13, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#2B1B12'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#3A2215'; ctx.beginPath(); ctx.arc(0, -124, 15, 0, TAU); ctx.fill();
  // a wisp from the lid while it is hot
  for (let j = 0; j < 6; j++) {
    const y = -134 - j * 16, xa = 7 * Math.sin(j * 0.8 - t * 3), xb = 7 * Math.sin((j + 1) * 0.8 - t * 3);
    ctx.strokeStyle = `rgba(255,255,255,${0.32 * (1 - j / 6)})`; ctx.lineWidth = 10 - j;
    ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y - 16); ctx.stroke();
  }
}

function drawSteam(t, cam, SURF) {
  const st = sm(t, 6.1, 7.6);
  if (st <= 0.01) return;
  setM(cam);
  for (const v of VES) {
    for (let r = 0; r < 2; r++) {
      const x0 = v.colX + (r ? 16 : -16) * Math.min(1, v.colHalf / 25), y0 = v.y0 - 6;
      const ph = v.i * 1.9 + r * 2.4;
      for (let j = 0; j < 12; j++) {
        const lift = ((t * 0.55 + r * 0.37 + v.i * 0.21) % 1);
        const a0 = st * Math.sin(Math.PI * clamp((j / 12 + lift * 0.25))) * (1 - j / 12) * 0.5;
        const y = y0 - j * 22, xA = x0 + (6 + j * 2.2) * Math.sin(j * 0.7 - t * 2.1 + ph), xB = x0 + (6 + (j + 1) * 2.2) * Math.sin((j + 1) * 0.7 - t * 2.1 + ph);
        ctx.strokeStyle = `rgba(255,252,246,${a0})`; ctx.lineWidth = 12 - j * 0.6;
        ctx.beginPath(); ctx.moveTo(xA, y); ctx.lineTo(xB, y - 22); ctx.stroke();
      }
    }
  }
}

// ------------------------------------------------------------------ type: kicker, progress label, last line
function digits(str, x, y, cell) {
  // tabular: every digit centred in a fixed cell
  let cx = x;
  for (const ch of str) {
    const w = /[0-9]/.test(ch) ? cell : ctx.measureText(ch).width;
    ctx.textAlign = 'center'; ctx.fillText(ch, cx + w / 2, y);
    cx += w;
  }
  ctx.textAlign = 'left';
  return cx - x;
}
function drawType(t, SURF) {
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  // kicker
  const kp = seg(t, T.kicker, T.kicker + 0.5), ka = ease.outCubic(kp);
  if (ka > 0) {
    ctx.globalAlpha = ka;
    const dy = 24 * (1 - ease.outExpo(kp));
    ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.roundRect(64, 178 + dy, 34 * ka, 7, 3.5); ctx.fill();
    ctx.font = `700 40px ${PF}`; ctx.fillStyle = 'rgba(43,27,18,0.82)';
    ctx.fillText('월요일 오전 9:00', 114, 196 + dy);
  }
  // progress: how much of the planned water has landed (99 until the brim gives, then 100)
  let num = 0, den = 0;
  for (const v of VES) { num += SURF[v.i].f - v.fEsp; den += v.fTop - v.fEsp; }
  let pct = Math.floor(clamp(num / den) * 100);
  const full = T.dripHits[T.dripHits.length - 1].t + 0.08;
  pct = t < full ? Math.min(99, pct) : 100;
  const lp = seg(t, T.label, T.label + 0.55);
  if (lp > 0) {
    const la = ease.outCubic(lp), ldy = 30 * (1 - ease.outExpo(lp));
    const y = 1396 + ldy;
    ctx.font = `800 76px ${PF}`;
    const out = seg(t, T.flip, T.flip + 0.16), inn = seg(t, T.flip + 0.08, T.flip + 0.5);
    // "충전 중" leaves upward, "충전 완료" rises in
    if (out < 1) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 1300, W, 120); ctx.clip();
      ctx.globalAlpha = la * (1 - out); ctx.fillStyle = rgba(CREAMC);
      ctx.fillText('충전 중', 64, y - 70 * out * out);
      ctx.restore();
    }
    if (inn > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 1300, W, 120); ctx.clip();
      ctx.globalAlpha = 1;
      const yy = y + 86 * (1 - outBack(inn));
      ctx.fillStyle = rgba(CREAMC); ctx.fillText('충전 ', 64, yy);
      const w0 = ctx.measureText('충전 ').width;
      ctx.fillStyle = ACCENT; ctx.fillText('완료', 64 + w0, yy);
      ctx.restore();
    }
    // the number, right-aligned in fixed cells
    ctx.globalAlpha = la;
    const cell = ctx.measureText('0').width;
    const str = `${pct}%`;
    const wNum = (str.length - 1) * cell + ctx.measureText('%').width;
    const pop = t > T.flip ? 1 + 0.16 * Math.exp(-7 * (t - T.flip)) * Math.sin(Math.min(Math.PI, (t - T.flip) * 14)) : 1;
    ctx.save();
    ctx.translate(1016 - wNum / 2, y - 26); ctx.scale(pop, pop); ctx.translate(-(1016 - wNum / 2), -(y - 26));
    ctx.fillStyle = t > T.flip ? ACCENT : rgba(CREAMC, 0.92);
    digits(str, 1016 - wNum, y, cell);
    ctx.restore();
    // the bar: the glass letters' progress, echoed small
    const bw = 952, by = 1430 + ldy;
    ctx.fillStyle = 'rgba(245,236,221,0.16)'; ctx.beginPath(); ctx.roundRect(64, by, bw, 10, 5); ctx.fill();
    const fw = bw * (pct / 100);
    if (fw > 1) { ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.roundRect(64, by, Math.max(10, fw), 10, 5); ctx.fill(); }
  }
  // last line
  const l2 = seg(t, T.line2, T.line2 + 0.6);
  if (l2 > 0) {
    ctx.globalAlpha = ease.outCubic(l2);
    ctx.font = `600 44px ${PF}`; ctx.fillStyle = 'rgba(245,236,221,0.78)';
    ctx.fillText('오늘도, 한 잔 가득', 64, 1512 + 22 * (1 - ease.outExpo(l2)));
  }
  ctx.globalAlpha = 1;
}

defineDemo({
  id: '108-liquid-fill',
  title: '가득 찬 아침',
  tech: '차오르는 글자 · 글자를 그릇으로 쓰는 액체',
  duration: DUR,
  background: '#2f1d12',
  setup,
  frame,
});
