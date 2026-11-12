/*
 * whale.js — the humpback of 158: a pose in world space for every t, its perspective projection, one triangle mesh
 * (the depth buffer and the shadow both read it) and the flat illustration drawn from the same projected outline.
 *
 * World: X right, Y down (px on the bar plane), Z toward the viewer (px). Bars, frame, mat and page lie on Z = 0.
 * The eye sits V px in front of that plane, above the point (ex, ey); a world point projects to
 *     x = ex + (X − ex)·s,   y = ey + (Y − ey)·s,   s = V / (V − Z) = 1 / (1 − Z/V)
 * so Z = 0 stays where it is, Z < 0 shrinks toward the eye point and Z > 0 grows away from it.
 */
import { clamp, lerp, smooth, ease, track, rand } from '../_lib/stage.js';

export const V = 1700, EX = 540, HZ = 950;     // eye distance; the eye point is the horizon centre (and the sun)
export const SEA_Y = 1286;                     // world Y of the sea surface, a horizontal plane in the picture
export const LEN = 1150;                       // body length, tail stock to snout
export const NS = 40;                          // spine segments
const D2R = Math.PI / 180;
export const sOf = (Z) => V / (V - Z);

// story beats (seconds)
export const TB = { surf: 0.85, blow: 1.5, dive: 2.3, gone: 2.95, rise0: 3.0, rise: 3.45, apex: 5.45, fall: 5.95, impact: 6.6, sunk: 7.75 };

// ---------------------------------------------------------------- body shape
function hermite(keys) {
  const n = keys.length;
  const m = keys.map((k, i) => {
    const a = keys[Math.max(0, i - 1)], b = keys[Math.min(n - 1, i + 1)];
    return (b[1] - a[1]) / (b[0] - a[0]);
  });
  return (u) => {
    if (u <= keys[0][0]) return keys[0][1];
    if (u >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0;
    while (u > keys[i + 1][0]) i++;
    const [u0, v0] = keys[i], [u1, v1] = keys[i + 1], h = u1 - u0, p = (u - u0) / h, p2 = p * p, p3 = p2 * p;
    return (2 * p3 - 3 * p2 + 1) * v0 + (p3 - 2 * p2 + p) * h * m[i] + (-2 * p3 + 3 * p2) * v1 + (p3 - p2) * h * m[i + 1];
  };
}
// radius along u (0 = tail stock at the flukes, 1 = snout), as a fraction of LEN
const radius = hermite([[0, 0.011], [0.07, 0.019], [0.17, 0.03], [0.3, 0.056], [0.45, 0.09], [0.6, 0.108], [0.72, 0.11],
  [0.83, 0.1], [0.92, 0.079], [0.975, 0.055], [1, 0.034]]);
export const RADIUS = Array.from({ length: NS + 1 }, (_, i) => radius(i / NS) * LEN);

// ---------------------------------------------------------------- pose
// The spine is integrated from its direction field, so the body never stretches:
//   d(u) = (sin α cos β, −cos α cos β, sin β),  α(u) = a0 + a1(u − ½) + a2(u − ½)²,  β(u) = b0 + b1(u − ½)
//   P(u) = A + LEN·∫_{uA}^{u} d   (α leans the body right of straight up, β leans it toward the viewer)
const lin = (p) => p;
const K = (keys) => track(keys);
// A — far out: the back breaks the surface, a blow, then a fluke-up dive above the sun's path
const A_POS = K([[0.85, [-90, SEA_Y + 0.2 * LEN, -2 * V]], [1.45, [70, SEA_Y + 0.012 * LEN, -2 * V], ease.outCubic],
  [2.1, [300, SEA_Y + 0.004 * LEN, -2 * V], lin], [2.62, [450, SEA_Y + 0.15 * LEN, -2 * V]], [2.95, [520, SEA_Y + 0.55 * LEN, -2 * V], ease.inCubic]]);
const A_ANG = K([[0.85, [80, 34, 0, 0, 0]], [1.45, [88, 40, 0, 0, 0]], [2.1, [98, 46, 0, 0, 0], lin],
  [2.62, [160, -36, 0, 0, 0]], [2.95, [172, -20, 0, 0, 0]]]);
// C — the breach: the body slides up through a fixed point of the surface Q (anchor u = uw), leaning ever more
// toward the viewer; the head crosses the bar plane, clears the frame, hangs
export const Q = [330, SEA_Y, -190];
// … and the fall continues on the same anchor: the body slides back down through Q while it tips right, the head
// still in front of the plane until it is over the window, then it turns away (β < 0) and lands far out in the picture
const C_UW = K([[TB.rise0, 1.42], [TB.rise, 1.0, lin], [TB.apex, 0.17, ease.outCubic], [TB.fall, 0.14, lin],
  [6.35, 0.37, ease.inCubic], [TB.impact, 0.45, lin], [TB.sunk, 0.5, lin]]);
const C_ANG = K([[TB.rise0, [34, 8, 0, 2, 12]], [TB.rise, [34, 10, 0, 6, 16]], [4.25, [30, 6, 0, 15, 30], lin],
  [TB.apex, [20, 20, -10, 20, 44]], [TB.fall, [22, 24, -12, 22, 48], lin],
  [6.35, [36, 18, -8, 12, 30], ease.inCubic], [TB.impact, [80, 4, 0, -28, -8], lin], [TB.sunk, [88, 0, 0, -30, -8], ease.outCubic]]);
// the anchor itself moves back during the fall (so the submerged tail never swings out in front) and sinks after
const C_Q = K([[6.3, Q], [TB.impact, [360, SEA_Y, -520]], [TB.sunk, [390, SEA_Y + 340, -640], ease.inOutCubic]]);
// art parameters
const BELLY = K([[0, -0.7], [2.1, -0.7], [2.45, -1], [2.95, -1], [3.2, -0.3], [TB.apex, -0.22], [TB.impact, 0.15]]);
const FLUKE = K([[0, 0.14], [2.2, 0.14], [2.55, 1], [2.95, 1], [3.1, 0.22], [TB.sunk, 0.3]]);
const SPREAD = K([[0, 0.12], [3.3, 0.18], [4.3, 0.55], [TB.apex, 0.95, ease.outCubic], [TB.fall, 1], [TB.impact, 0.55], [TB.sunk, 0.3]]);

function dirAt(u, a, out, o) {
  const v = u - 0.5, al = (a[0] + a[1] * v + a[2] * v * v) * D2R, be = (a[3] + a[4] * v) * D2R;
  out[o] = Math.sin(al) * Math.cos(be); out[o + 1] = -Math.cos(al) * Math.cos(be); out[o + 2] = Math.sin(be);
}
function spine(a, uA, A) {
  const P = new Float64Array((NS + 1) * 3), Tg = new Float64Array((NS + 1) * 3), d = new Float64Array(3);
  for (let i = 0; i <= NS; i++) dirAt(i / NS, a, Tg, i * 3);
  for (let i = 1; i <= NS; i++) {
    dirAt((i - 0.5) / NS, a, d, 0);
    for (let k = 0; k < 3; k++) P[i * 3 + k] = P[(i - 1) * 3 + k] + (LEN / NS) * d[k];
  }
  // the anchor parameter may lie past the snout (the head still under water): extend along the head direction
  const at = new Float64Array(3);
  if (uA >= 1) for (let k = 0; k < 3; k++) at[k] = P[NS * 3 + k] + (uA - 1) * LEN * Tg[NS * 3 + k];
  else {
    const f = clamp(uA) * NS, i0 = Math.min(NS - 1, Math.floor(f)), w = f - i0;
    for (let k = 0; k < 3; k++) at[k] = lerp(P[i0 * 3 + k], P[(i0 + 1) * 3 + k], w);
  }
  for (let i = 0; i <= NS; i++) for (let k = 0; k < 3; k++) P[i * 3 + k] += A[k] - at[k];
  return { P, Tg };
}
/** the whole pose at t: spine (world), tangents, art parameters, visibility */
export function pose(t) {
  let sp, vis;
  if (t < TB.gone) {
    sp = spine(A_ANG(t), 0.5, A_POS(t));
    vis = smooth((t - TB.surf) / 0.3) * (1 - smooth((t - 2.8) / 0.15));
  } else {
    sp = spine(C_ANG(t), C_UW(t), C_Q(t));
    vis = smooth((t - TB.rise0) / 0.3) * (1 - smooth((t - 7.1) / (TB.sunk - 7.1)));
  }
  return { ...sp, vis, belly: BELLY(t), fluke: FLUKE(t), spread: SPREAD(t), under: t < TB.gone ? 0.75 * smooth((t - 2.3) / 0.25) : 0.4 };
}
export const nose = (ps) => [ps.P[NS * 3], ps.P[NS * 3 + 1], ps.P[NS * 3 + 2]];

// ---------------------------------------------------------------- projection, outline, mesh
const ALPHA = [-90, -60, -30, 0, 30, 60, 90].map((a) => a * D2R);
const FLIP_U = 0.69, FLIP_N = 16;
const flipWidth = hermite([[0, 0.042], [0.18, 0.058], [0.45, 0.052], [0.75, 0.036], [0.92, 0.022], [1, 0.008]]);

/**
 * Project a pose for the eye point (ex, ey). Returns the screen spine (x, y, s, R, normal), world Z per sample,
 * the flipper and fluke outlines (screen) and one triangle mesh in world space (wv) with its projection (sv).
 */
export function project(ps, ex, ey) {
  const N1 = NS + 1, x = new Float64Array(N1), y = new Float64Array(N1), s = new Float64Array(N1), R = new Float64Array(N1);
  const nx = new Float64Array(N1), ny = new Float64Array(N1), Z = new Float64Array(N1);
  const P = ps.P;
  for (let i = 0; i < N1; i++) {
    const X = P[i * 3], Y = P[i * 3 + 1];
    Z[i] = P[i * 3 + 2]; s[i] = sOf(Z[i]);
    x[i] = ex + (X - ex) * s[i]; y[i] = ey + (Y - ey) * s[i]; R[i] = RADIUS[i] * s[i];
  }
  for (let i = 0; i < N1; i++) {
    const a = Math.max(0, i - 1), b = Math.min(NS, i + 1);
    let tx = x[b] - x[a], ty = y[b] - y[a];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l; ty /= l;
    nx[i] = ty; ny[i] = -tx;                                       // the dorsal side: left of the screen heading
  }
  const proj = (X, Y, Zw, out, o) => { const k = sOf(Zw); out[o] = ex + (X - ex) * k; out[o + 1] = ey + (Y - ey) * k; };

  // ---- mesh (world): body front half-tube, two flippers, flukes
  const wv = [], tri = [];
  const add = (X, Y, Zw) => { wv.push(X, Y, Zw); return wv.length / 3 - 1; };
  const ring0 = [];
  for (let i = 0; i < N1; i++) {
    const tz = ps.Tg[i * 3 + 2], cl = Math.sqrt(Math.max(0, 1 - tz * tz)), r = RADIUS[i] * 1.05;
    const row = [];
    for (const al of ALPHA) row.push(add(P[i * 3] + nx[i] * r * Math.sin(al), P[i * 3 + 1] + ny[i] * r * Math.sin(al), Z[i] + r * Math.cos(al) * cl));
    ring0.push(row);
  }
  for (let i = 0; i < NS; i++) for (let j = 0; j < ALPHA.length - 1; j++) {
    const a = ring0[i][j], b = ring0[i + 1][j], c = ring0[i + 1][j + 1], d = ring0[i][j + 1];
    tri.push(a, b, c, a, c, d);
  }
  // snout cap: the same half-ellipse the outline draws (lower jaw a little longer), fanned from the front-most point
  {
    const i = NS, tx = ps.Tg[i * 3], ty = ps.Tg[i * 3 + 1], tz = ps.Tg[i * 3 + 2], r = RADIUS[i] * 1.08;
    const cl = Math.sqrt(Math.max(0, 1 - tz * tz)), cap = [];
    for (let k = 0; k <= 10; k++) {
      const a = -Math.PI / 2 + (k / 10) * Math.PI, along = Math.cos(a) * r * (1.6 + 0.28 * Math.max(0, Math.sin(a))), across = -Math.sin(a) * r;
      cap.push(add(P[i * 3] + tx * along + nx[i] * across, P[i * 3 + 1] + ty * along + ny[i] * across, Z[i] + tz * along + 0.35 * r * Math.cos(a) * cl));
    }
    const c = add(P[i * 3] + tx * r * 0.3, P[i * 3 + 1] + ty * r * 0.3, Z[i] + r * cl);
    for (let k = 0; k < cap.length - 1; k++) tri.push(c, cap[k], cap[k + 1]);
  }

  // ---- flippers: blades rooted on the lower flank, swept back when folded, spread out from the belly side
  const fi = Math.round(FLIP_U * NS), fr = RADIUS[fi];
  const T3 = [ps.Tg[fi * 3], ps.Tg[fi * 3 + 1], ps.Tg[fi * 3 + 2]], Nw = [nx[fi], ny[fi], 0];
  const flips = [];
  for (const side of [1, -1]) {                                   // +1 near (toward the viewer), −1 far
    const sp = side > 0 ? ps.spread : ps.spread * 0.45, th = lerp(18, 102, sp) * D2R;
    const root = [P[fi * 3] - Nw[0] * fr * 0.5, P[fi * 3 + 1] - Nw[1] * fr * 0.5, Z[fi] + side * fr * 0.72];
    let dir = [Math.cos(th) * -T3[0] + Math.sin(th) * -Nw[0], Math.cos(th) * -T3[1] + Math.sin(th) * -Nw[1],
      Math.cos(th) * -T3[2] + side * lerp(0.25, 0.75, sp)];
    let l = Math.hypot(...dir); dir = dir.map((v) => v / l);
    let ch = [T3[0] - dir[0] * (T3[0] * dir[0] + T3[1] * dir[1] + T3[2] * dir[2]), T3[1] - dir[1] * (T3[0] * dir[0] + T3[1] * dir[1] + T3[2] * dir[2]),
      T3[2] - dir[2] * (T3[0] * dir[0] + T3[1] * dir[1] + T3[2] * dir[2])];
    l = Math.hypot(...ch) || 1; ch = ch.map((v) => v / l);
    const Lf = 0.32 * LEN, lead = [], trail = [];
    for (let k = 0; k <= FLIP_N; k++) {
      const v = k / FLIP_N, w = flipWidth(v) * LEN, knob = 0.0065 * LEN * Math.max(0, Math.sin(v * Math.PI * 9)) * (1 - v * 0.6);
      const c = [root[0] + dir[0] * Lf * v, root[1] + dir[1] * Lf * v, root[2] + dir[2] * Lf * v];
      lead.push([c[0] + ch[0] * (w * 0.55 + knob), c[1] + ch[1] * (w * 0.55 + knob), c[2] + ch[2] * (w * 0.55 + knob)]);
      trail.push([c[0] - ch[0] * w * 0.45, c[1] - ch[1] * w * 0.45, c[2] - ch[2] * w * 0.45]);
    }
    const tip = [root[0] + dir[0] * Lf * 1.04, root[1] + dir[1] * Lf * 1.04, root[2] + dir[2] * Lf * 1.04];
    const li = lead.map((p) => add(...p)), ti = trail.map((p) => add(...p)), tp = add(...tip);
    for (let k = 0; k < FLIP_N; k++) tri.push(li[k], li[k + 1], ti[k + 1], li[k], ti[k + 1], ti[k]);
    tri.push(li[FLIP_N], tp, ti[FLIP_N]);
    const sl = new Float64Array(lead.length * 2), st = new Float64Array(trail.length * 2), stp = new Float64Array(2);
    lead.forEach((p, k) => proj(p[0], p[1], p[2], sl, k * 2));
    trail.forEach((p, k) => proj(p[0], p[1], p[2], st, k * 2));
    proj(tip[0], tip[1], tip[2], stp, 0);
    flips.push({ side, lead: sl, trail: st, tip: stp, zTip: tip[2], zRoot: root[2], world: { root, dir, Lf } });
  }

  // ---- flukes: two lobes spanning the lateral axis (edge-on in profile) or the screen normal (face-on, open = 1)
  const T0 = [ps.Tg[0], ps.Tg[1], ps.Tg[2]];
  const span = [nx[0] * ps.fluke, ny[0] * ps.fluke, (1 - ps.fluke) * 0.3];   // edge-on flukes keep a shallow depth
  const FL = [[0, 0], [0.03, 0.05], [0.07, 0.11], [0.11, 0.165], [0.15, 0.205], [0.178, 0.228], [0.172, 0.2], [0.18, 0.17],
    [0.168, 0.135], [0.175, 0.1], [0.162, 0.066], [0.165, 0.036], [0.138, 0.01], [0.148, 0]];
  const fl = [];
  for (const sg of [1, -1]) {
    const pts = (sg > 0 ? FL : [...FL].reverse()).map(([b, a]) => [P[0] - T0[0] * b * LEN + span[0] * a * sg * LEN,
      P[1] - T0[1] * b * LEN + span[1] * a * sg * LEN, Z[0] - T0[2] * b * LEN + span[2] * a * sg * LEN]);
    fl.push(...pts);
  }
  const flS = new Float64Array(fl.length * 2);
  fl.forEach((p, k) => proj(p[0], p[1], p[2], flS, k * 2));
  {
    const c = add(P[0], P[1], Z[0]), ids = fl.map((p) => add(...p));
    for (let k = 0; k < ids.length - 1; k++) tri.push(c, ids[k], ids[k + 1]);
  }

  const wvA = Float64Array.from(wv), sv = new Float64Array((wv.length / 3) * 2);
  for (let k = 0; k < wv.length / 3; k++) proj(wvA[k * 3], wvA[k * 3 + 1], wvA[k * 3 + 2], sv, k * 2);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let k = 0; k < sv.length; k += 2) { x0 = Math.min(x0, sv[k]); x1 = Math.max(x1, sv[k]); y0 = Math.min(y0, sv[k + 1]); y1 = Math.max(y1, sv[k + 1]); }
  return { x, y, s, R, nx, ny, Z, flips, fluke: flS, mesh: { wv: wvA, sv, tri: Uint32Array.from(tri) }, bbox: [x0, y0, x1, y1], ps };
}

// ---------------------------------------------------------------- the illustration
export const WC = {
  body: '#1f3651', bodyHi: '#2f4f70', bodyLo: '#152940', belly: '#e4ecea', bellyLo: '#bdd0d0', pleat: 'rgba(28,52,78,0.42)',
  flip: '#e6eeec', flipLo: '#b7cccd', knob: '#38597b', eye: '#0b1726', fluke: '#1b304a',
};
const mid = (a, b) => (a + b) / 2;
function smoothPath(ctx, pts, closed) {
  const n = pts.length / 2;
  if (closed) {
    ctx.moveTo(mid(pts[0], pts[2]), mid(pts[1], pts[3]));
    for (let i = 1; i <= n; i++) {
      const a = i % n, b = (i + 1) % n;
      ctx.quadraticCurveTo(pts[a * 2], pts[a * 2 + 1], mid(pts[a * 2], pts[b * 2]), mid(pts[a * 2 + 1], pts[b * 2 + 1]));
    }
  } else {
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 1; i < n - 1; i++) ctx.quadraticCurveTo(pts[i * 2], pts[i * 2 + 1], mid(pts[i * 2], pts[i * 2 + 2]), mid(pts[i * 2 + 1], pts[i * 2 + 3]));
    ctx.lineTo(pts[(n - 1) * 2], pts[(n - 1) * 2 + 1]);
  }
}
/** a point on the body at spine parameter u (0..1) and signed offset f (in radii, + = dorsal) */
function at(g, u, f) {
  const fi = clamp(u) * NS, i = Math.min(NS - 1, Math.floor(fi)), w = fi - i;
  const x = lerp(g.x[i], g.x[i + 1], w), y = lerp(g.y[i], g.y[i + 1], w), R = lerp(g.R[i], g.R[i + 1], w);
  const nx = lerp(g.nx[i], g.nx[i + 1], w), ny = lerp(g.ny[i], g.ny[i + 1], w);
  return [x + nx * R * f, y + ny * R * f, R];
}
function bodyOutline(g) {
  const pts = [];
  for (let i = 0; i <= NS; i++) pts.push(g.x[i] + g.nx[i] * g.R[i], g.y[i] + g.ny[i] * g.R[i]);
  // snout: half an ellipse ahead of the last ring (the lower jaw a little longer)
  const tx = -g.ny[NS], ty = g.nx[NS], Rn = g.R[NS];
  for (let k = 1; k < 10; k++) {
    const a = -Math.PI / 2 + (k / 10) * Math.PI, along = Math.cos(a) * Rn * (1.55 + 0.25 * Math.max(0, Math.sin(a))), across = -Math.sin(a) * Rn;
    pts.push(g.x[NS] + tx * along + g.nx[NS] * across, g.y[NS] + ty * along + g.ny[NS] * across);
  }
  for (let i = NS; i >= 0; i--) pts.push(g.x[i] - g.nx[i] * g.R[i], g.y[i] - g.ny[i] * g.R[i]);
  return pts;
}
const SPOTS = (() => { const r = rand(4401); return Array.from({ length: 7 }, () => [0.03 + r() * 0.15, (r() - 0.5) * 0.36, 0.008 + r() * 0.016, r() * 3]); })();

/** draw the whale in screen space; light: { rim: [r, g, b] per sample alpha fn } */
export function drawWhale(ctx, g, opt = {}) {
  const ps = g.ps, sb = g.s[NS * 0.7 | 0];
  const flipPath = (f) => {
    ctx.beginPath();
    const pts = [];
    for (let k = 0; k < f.lead.length / 2; k++) pts.push(f.lead[k * 2], f.lead[k * 2 + 1]);
    pts.push(f.tip[0], f.tip[1]);
    for (let k = f.trail.length / 2 - 1; k >= 0; k--) pts.push(f.trail[k * 2], f.trail[k * 2 + 1]);
    smoothPath(ctx, pts, true);
  };
  const drawFlip = (f, far) => {
    flipPath(f);
    ctx.fillStyle = far ? '#7f9aa6' : WC.flip; ctx.fill();
    if (!far) {
      ctx.save(); ctx.clip();
      const n = f.lead.length / 2;
      // the dark upper surface shows as mottling near the root and along the leading edge
      ctx.fillStyle = 'rgba(31,54,81,0.42)';
      for (let k = 1; k < n * 0.4; k += 2) {
        const w = 0.18 + 0.12 * Math.sin(k * 1.7), x = lerp(f.lead[k * 2], f.trail[k * 2], w), y = lerp(f.lead[k * 2 + 1], f.trail[k * 2 + 1], w);
        const rad = Math.hypot(f.lead[k * 2] - f.trail[k * 2], f.lead[k * 2 + 1] - f.trail[k * 2 + 1]) * (0.13 - 0.008 * k);
        if (rad > 0.5) { ctx.beginPath(); ctx.ellipse(x, y, rad * 1.5, rad, Math.atan2(f.tip[1] - f.lead[1], f.tip[0] - f.lead[0]), 0, Math.PI * 2); ctx.fill(); }
      }
      // trailing half in soft shade gives the blade its camber
      ctx.beginPath();
      for (let k = 0; k < n; k++) { const x = lerp(f.lead[k * 2], f.trail[k * 2], 0.62), y = lerp(f.lead[k * 2 + 1], f.trail[k * 2 + 1], 0.62); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.lineTo(f.tip[0], f.tip[1]);
      for (let k = n - 1; k >= 0; k--) ctx.lineTo(f.trail[k * 2] * 1.0 + (f.trail[k * 2] - f.lead[k * 2]) * 0.3, f.trail[k * 2 + 1] + (f.trail[k * 2 + 1] - f.lead[k * 2 + 1]) * 0.3);
      ctx.fillStyle = 'rgba(150,178,186,0.45)'; ctx.fill();
      ctx.restore();
      // barnacles at the tip
      ctx.fillStyle = 'rgba(250,250,246,0.9)';
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(f.tip[0] + (k - 1.5) * 4 * sb, f.tip[1] + ((k * 7) % 5 - 2) * 2.4 * sb, (2.4 - 0.3 * k) * sb, 0, Math.PI * 2); ctx.fill(); }
    }
  };
  const flukePath = () => { ctx.beginPath(); smoothPath(ctx, g.fluke, true); };

  // far flipper and flukes behind the body
  drawFlip(g.flips[1], true);
  flukePath(); ctx.fillStyle = WC.fluke; ctx.fill();
  if (ps.under > 0.01 && ps.fluke > 0.3) {
    ctx.save(); flukePath(); ctx.clip();
    ctx.globalAlpha = ps.under * smooth((ps.fluke - 0.3) / 0.5);
    ctx.fillStyle = WC.belly; ctx.fill();
    // the underside pattern that identifies a humpback: a dark trailing edge, a dark centre, a few streaks
    const T0x = -g.ny[0], T0y = g.nx[0], k = g.s[0] * LEN, f = ps.fluke;
    const P2 = (b, a2) => [g.x[0] - T0x * b * k + g.nx[0] * a2 * k * f, g.y[0] - T0y * b * k + g.ny[0] * a2 * k * f];
    ctx.strokeStyle = WC.fluke; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.lineWidth = 0.022 * k; ctx.beginPath(); smoothPath(ctx, g.fluke.slice(10, 46), false); ctx.stroke();
    ctx.fillStyle = WC.fluke;
    { const c0 = P2(0.02, 0), c1 = P2(0.15, 0.04), c2 = P2(0.15, -0.04);
      ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.quadraticCurveTo(c1[0], c1[1], ...P2(0.14, 0)); ctx.quadraticCurveTo(c2[0], c2[1], c0[0], c0[1]); ctx.fill(); }
    ctx.lineWidth = 0.008 * k;
    for (const sg of [1, -1]) for (const [b0, a0, b1, a1] of [[0.07, 0.07, 0.12, 0.12], [0.1, 0.04, 0.14, 0.09], [0.12, 0.15, 0.15, 0.19]]) {
      const p0 = P2(b0, a0 * sg), p1 = P2(b1, a1 * sg);
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
    }
    ctx.restore();
  }

  // body
  const outline = bodyOutline(g);
  ctx.beginPath(); smoothPath(ctx, outline, true);
  ctx.fillStyle = WC.body; ctx.fill();
  ctx.save(); ctx.clip();
  // upper-flank light
  const band = (u0, u1, f0, f1, col) => {
    ctx.beginPath();
    const pts = [];
    for (let k = 0; k <= 24; k++) { const u = lerp(u0, u1, k / 24); const p = at(g, u, typeof f0 === 'function' ? f0(u) : f0); pts.push(p[0], p[1]); }
    for (let k = 24; k >= 0; k--) { const u = lerp(u0, u1, k / 24); const p = at(g, u, typeof f1 === 'function' ? f1(u) : f1); pts.push(p[0], p[1]); }
    smoothPath(ctx, pts, true); ctx.fillStyle = col; ctx.fill();
  };
  band(0.02, 1.02, (u) => 0.42 - 0.1 * Math.sin(u * 9), 1.4, WC.bodyHi);
  // belly band with throat pleats, its edge mottled
  const bel = ps.belly;
  const bnd = (u) => lerp(-1.05, bel, smooth((u - 0.38) / 0.24)) + 0.07 * Math.sin(u * 53) * smooth((u - 0.45) / 0.2);
  if (bel > -0.98) {
    band(0.36, 1.06, -1.5, bnd, WC.belly);
    band(0.36, 1.06, -1.5, (u) => lerp(-1.05, -0.78, smooth((u - 0.4) / 0.3)), WC.bellyLo);
    // pleats from the chin back toward the navel
    ctx.strokeStyle = WC.pleat; ctx.lineWidth = Math.max(1.2, 2.4 * sb); ctx.lineCap = 'round';
    for (let k = 1; k <= 6; k++) {
      const f = k / 7.2;
      ctx.beginPath();
      const pts = [];
      for (let j = 0; j <= 16; j++) {
        const u = lerp(0.5 + 0.03 * k, 1.0, j / 16), b = bnd(u);
        if (b <= -0.98) continue;
        const p = at(g, u, lerp(-1, b, f)); pts.push(p[0], p[1]);
      }
      if (pts.length >= 6) { smoothPath(ctx, pts, false); ctx.stroke(); }
    }
    // dark rim just above the belly gives the body its roundness
    band(0.4, 1.04, bnd, (u) => bnd(u) + 0.2, 'rgba(18,35,55,0.45)');
  }
  // tubercles on the rostrum, a blowhole, scratches
  ctx.fillStyle = WC.knob;
  for (let k = 0; k < 8; k++) {
    const u = 0.86 + k * 0.019, p = at(g, u, 0.25 + 0.4 * ((k * 5) % 3) / 2);
    ctx.beginPath(); ctx.arc(p[0], p[1], p[2] * 0.075, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(160,186,200,0.28)';
  for (const [u, f, r, a] of SPOTS) {
    const p = at(g, 0.25 + u * 2.4, f + 0.3);
    ctx.beginPath(); ctx.ellipse(p[0], p[1], p[2] * r * 4, p[2] * r * 1.6, a, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // dorsal fin: a small hump two thirds back
  if (bel < 0.4) {
    const a = at(g, 0.27, 0.92), b = at(g, 0.35, 0.95), tip = at(g, 0.285, 1.0 + 0.32 * (1 - Math.max(0, bel)));
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(tip[0], tip[1], tip[0] + (a[0] - b[0]) * 0.15, tip[1] + (a[1] - b[1]) * 0.15);
    ctx.quadraticCurveTo(b[0] + (tip[0] - b[0]) * 0.3, b[1] + (tip[1] - b[1]) * 0.3, b[0], b[1]); ctx.closePath();
    ctx.fillStyle = WC.body; ctx.fill();
  }

  // eye and mouth
  if (bel > -0.9) {
    const R = at(g, 0.8, 0)[2];
    const m0 = at(g, 0.775, -0.28), m1 = at(g, 0.93, -0.36);
    const tx = -g.ny[NS], ty = g.nx[NS], Rn = g.R[NS];
    const m2 = [g.x[NS] + tx * Rn * 1.5 - g.nx[NS] * Rn * 0.3, g.y[NS] + ty * Rn * 1.5 - g.ny[NS] * Rn * 0.3];
    ctx.beginPath(); ctx.moveTo(m0[0], m0[1]); ctx.quadraticCurveTo(m1[0], m1[1], m2[0], m2[1]);
    ctx.strokeStyle = 'rgba(11,23,38,0.8)'; ctx.lineWidth = Math.max(1.5, R * 0.05); ctx.lineCap = 'round'; ctx.stroke();
    const e = at(g, 0.765, -0.1);
    ctx.fillStyle = WC.eye; ctx.beginPath(); ctx.ellipse(e[0], e[1], R * 0.075, R * 0.06, Math.atan2(-g.nx[30], g.ny[30]), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(e[0] + R * 0.025, e[1] - R * 0.022, R * 0.022, 0, Math.PI * 2); ctx.fill();
    // barnacles on the chin
    const c = at(g, 0.975, -0.8);
    ctx.fillStyle = 'rgba(248,248,242,0.85)';
    for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(c[0] + Math.cos(k * 2.4) * R * 0.09, c[1] + Math.sin(k * 2.4) * R * 0.09, R * (0.035 - k * 0.004), 0, Math.PI * 2); ctx.fill(); }
  }

  // near flipper over the body
  drawFlip(g.flips[0], false);

  // rim light along the back: warm coral-peach while backlit inside the picture, cream when it is out in the room
  if (opt.rim) {
    const pts = [];
    for (let i = 2; i <= NS; i++) pts.push(g.x[i] + g.nx[i] * g.R[i] * 0.97, g.y[i] + g.ny[i] * g.R[i] * 0.97);
    const gr = ctx.createLinearGradient(g.x[0], g.y[0], g.x[NS], g.y[NS]);
    for (let k = 0; k <= 4; k++) {
      const i = Math.round((k / 4) * NS);
      gr.addColorStop(k / 4, opt.rim(g.Z[i]));
    }
    ctx.beginPath(); smoothPath(ctx, pts, false);
    ctx.strokeStyle = gr; ctx.lineWidth = Math.max(2, 5 * sb); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  }
}

/** spine parameter where the body crosses the sea surface (or null) — the waterline for the foam collar */
export function waterline(ps) {
  const P = ps.P;
  for (let i = NS; i > 0; i--) {
    const a = P[i * 3 + 1] - SEA_Y, b = P[(i - 1) * 3 + 1] - SEA_Y;
    if ((a <= 0) !== (b <= 0)) {
      const w = a / (a - b);
      return { u: (i - w) / NS, X: lerp(P[i * 3], P[(i - 1) * 3], w), Z: lerp(P[i * 3 + 2], P[(i - 1) * 3 + 2], w), i };
    }
  }
  return null;
}
