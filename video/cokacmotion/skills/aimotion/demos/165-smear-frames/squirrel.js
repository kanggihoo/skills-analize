/*
 * squirrel.js — an original squirrel built only from circles, capsules and one tapered tube, so that every
 * drawing can also be swept: a pose is a set of numbers, build(pose) turns it into world-space polygons, and the
 * same circles feed the smear (the convex sweep between two drawings) and the multiples.
 *
 * Local frame: hip (haunch centre) at the origin, x forward (the squirrel faces right), y down.
 */
import { clamp, lerp } from '../_lib/stage.js';

export const COL = {
  ink: '#2a1a10', fur: '#c95f2c', furD: '#93401f', tail: '#b24f26', tailL: '#dd8a52',
  cream: '#f6e5c9', pink: '#e59a86', eye: '#1b100a', acc: '#ffc21a',
};
export const O = 4.5;            // ink outline width outside every shape (px)
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- base drawings (the keys the poses blend)
// hip/chest/head: [x, y, r]; sh → paw: the near arm; heel → toe: the near hind foot; t: the tail spine (cubic Bézier)
const SH = {
  sit: { hip: [0, 0, 46], chest: [24, -56, 33], head: [32, -110, 34], hA: 0, sh: [28, -50], paw: [52, -66], heel: [-4, 34], toe: [52, 42],
    t: [[-40, 8], [-122, 22], [-166, -150], [-70, -214]] },
  crouch: { hip: [0, 0, 47], chest: [62, 8, 33], head: [110, -24, 34], hA: -0.22, sh: [68, 16], paw: [96, 44], heel: [-10, 34], toe: [46, 44],
    t: [[-42, 4], [-126, 6], [-180, -74], [-166, -158]] },
  leap: { hip: [0, 0, 43], chest: [80, -4, 31], head: [130, -18, 33], hA: 0.12, sh: [92, 6], paw: [160, 6], heel: [-28, 22], toe: [-90, 32],
    t: [[-40, 0], [-122, -8], [-198, -26], [-266, -2]] },
  land: { hip: [0, 0, 48], chest: [56, 14, 35], head: [96, -14, 35], hA: 0.12, sh: [64, 20], paw: [92, 50], heel: [-8, 40], toe: [48, 48],
    t: [[-44, 0], [-114, -22], [-124, -162], [-44, -206]] },
  proud: { hip: [0, 0, 46], chest: [22, -58, 33], head: [26, -112, 34], hA: -0.18, sh: [32, -62], paw: [72, -128], heel: [-4, 34], toe: [52, 42],
    t: [[-40, 8], [-128, 14], [-182, -140], [-94, -224]] },
};
const mixv = (a, b, w) => (Array.isArray(a) ? a.map((v, i) => mixv(v, b[i], w)) : a + (b - a) * w);
function mixShape(a, b, w) {
  if (!w) return a;
  const o = {};
  for (const k in a) o[k] = mixv(a[k], b[k], w);
  return o;
}
export const POSE0 = { c: 0, l: 0, g: 0, p: 0, hA: 0, st: 1, sa: 0, rot: 0, foot: null, hip: null, wig: 0, tailS: 0, tailK: 0,
  ear: 0, eye: 1, focus: 0, acorn: 0, hold: 0, pawY: 0, chew: 0, dy: 0 };
export const poseOf = (o) => Object.assign({}, POSE0, o);
/** blend two pose specs (numbers lerp, points lerp) — what an inbetweener does between two keys */
export function mixPose(A, B, w) {
  const o = {};
  for (const k in POSE0) {
    const a = A[k], b = B[k];
    if (a === null || b === null || a === undefined || b === undefined) o[k] = w < 0.5 ? a ?? null : b ?? null;
    else o[k] = Array.isArray(a) ? [lerp(a[0], b[0], w), lerp(a[1], b[1], w)] : lerp(a, b, w);
  }
  return o;
}

export function shapeOf(P) {
  let s = SH.sit;
  s = mixShape(s, SH.crouch, P.c);
  s = mixShape(s, SH.leap, P.l);
  s = mixShape(s, SH.land, P.g);
  s = mixShape(s, SH.proud, P.p);
  if (P.hold) {                                      // paws pulled in to the chest, holding something
    const hp = [s.chest[0] + 26, s.chest[1] - 6];
    s = Object.assign({}, s, { paw: mixv(s.paw, hp, P.hold * (1 - P.p)) });
  }
  return s;
}

/**
 * local → world: M = T(root) · [stretch st along the world angle sa, area-preserving: st · 1/st = 1] · R(rot).
 * Grounded poses give the foot (the contact point under the hind foot); airborne poses give the hip.
 */
export function matrixOf(P, s) {
  const cr = Math.cos(P.rot), sr = Math.sin(P.rot);
  const ca = Math.cos(P.sa), sa = Math.sin(P.sa), k = P.st, ik = 1 / k;
  const k11 = ca * ca * k + sa * sa * ik, k12 = ca * sa * (k - ik), k22 = sa * sa * k + ca * ca * ik;
  const a = k11 * cr + k12 * sr, b = k12 * cr + k22 * sr, c = -k11 * sr + k12 * cr, d = -k12 * sr + k22 * cr;
  let e, f;
  if (P.foot) {
    const lx = (s.heel[0] + s.toe[0]) / 2 + P.wig * 0.2, ly = (s.heel[1] + s.toe[1]) / 2 + 10;
    e = P.foot[0] - (a * lx + c * ly); f = P.foot[1] - (b * lx + d * ly);
  } else { e = P.hip[0]; f = P.hip[1]; }
  return [a, b, c, d, e, f + (P.dy || 0)];
}

// ---------------------------------------------------------------- primitive geometry
function circ(out, x, y, r, n = 26) {
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU; out.push(x + r * Math.cos(a), y + r * Math.sin(a)); }
  return out;
}
/**
 * Convex hull of two circles (a capsule that tapers when r1 ≠ r2): the arc of circle 1 behind, the outer tangent,
 * the arc of circle 2 in front. The tangents touch where n·u = (r1 − r2)/d, i.e. at the angles φ ± acos((r1 − r2)/d).
 */
export function hull(x1, y1, r1, x2, y2, r2, n = 9) {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
  if (d <= Math.abs(r1 - r2) + 1e-6) return r1 >= r2 ? circ([], x1, y1, r1) : circ([], x2, y2, r2);
  const phi = Math.atan2(dy, dx), beta = Math.acos(clamp((r1 - r2) / d, -1, 1));
  const out = [];
  const a0 = phi + beta, a1 = phi + TAU - beta, n1 = Math.max(2, Math.ceil((n * (a1 - a0)) / Math.PI));
  for (let i = 0; i <= n1; i++) { const a = a0 + ((a1 - a0) * i) / n1; out.push(x1 + r1 * Math.cos(a), y1 + r1 * Math.sin(a)); }
  const b0 = phi - beta, b1 = phi + beta, n2 = Math.max(2, Math.ceil((n * (b1 - b0)) / Math.PI));
  for (let i = 0; i <= n2; i++) { const a = b0 + ((b1 - b0) * i) / n2; out.push(x2 + r2 * Math.cos(a), y2 + r2 * Math.sin(a)); }
  return out;
}
function area(p) { let A = 0; for (let i = 0, n = p.length; i < n; i += 2) { const j = (i + 2) % n; A += p[i] * p[j + 1] - p[j] * p[i + 1]; } return A; }
function reverse(p) { const o = []; for (let i = p.length - 2; i >= 0; i -= 2) o.push(p[i], p[i + 1]); return o; }
/** a tube of varying radius along a spine: envelope p ± r·(−r′·T ± √(1 − r′²)·N) plus round caps (one polygon) */
export function tube(sp, rr) {
  const n = rr.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
    const tx = sp[2 * i1] - sp[2 * i0], ty = sp[2 * i1 + 1] - sp[2 * i0 + 1], tl = Math.hypot(tx, ty) || 1;
    const ux = tx / tl, uy = ty / tl, nx = -uy, ny = ux;
    const dr = clamp((rr[i1] - rr[i0]) / tl, -0.9, 0.9), q = Math.sqrt(1 - dr * dr), x = sp[2 * i], y = sp[2 * i + 1], r = rr[i];
    L.push(x + r * (-dr * ux + q * nx), y + r * (-dr * uy + q * ny));
    R.push(x + r * (-dr * ux - q * nx), y + r * (-dr * uy - q * ny));
  }
  const cap = (out, cx, cy, r, from, to, dirx, diry) => {
    const a0 = Math.atan2(from[1] - cy, from[0] - cx), a1 = Math.atan2(to[1] - cy, to[0] - cx), af = Math.atan2(diry, dirx);
    let d = (((a1 - a0) % TAU) + TAU) % TAU;
    const mid = a0 + d / 2, dd = Math.abs(((((mid - af) % TAU) + TAU + Math.PI) % TAU) - Math.PI);
    if (dd > Math.PI / 2) d -= TAU;
    const m = Math.max(3, Math.ceil(Math.abs(d) / 0.25));
    for (let i = 1; i < m; i++) { const a = a0 + (d * i) / m; out.push(cx + r * Math.cos(a), cy + r * Math.sin(a)); }
  };
  const out = [];
  for (let i = 0; i < n; i++) out.push(L[2 * i], L[2 * i + 1]);
  const e = n - 1;
  cap(out, sp[2 * e], sp[2 * e + 1], rr[e], [L[2 * e], L[2 * e + 1]], [R[2 * e], R[2 * e + 1]], sp[2 * e] - sp[2 * e - 2], sp[2 * e + 1] - sp[2 * e - 1]);
  for (let i = n - 1; i >= 0; i--) out.push(R[2 * i], R[2 * i + 1]);
  cap(out, sp[0], sp[1], rr[0], [R[0], R[1]], [L[0], L[1]], sp[0] - sp[2], sp[1] - sp[3]);
  return area(out) < 0 ? reverse(out) : out;
}
const bez = (P, u) => {
  const v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
  return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]];
};
const rotAbout = (p, o, a) => { const c = Math.cos(a), s = Math.sin(a), x = p[0] - o[0], y = p[1] - o[1]; return [o[0] + c * x - s * y, o[1] + s * x + c * y]; };
export const tailR = (u) => 12 + 33 * (1 - (1 - u) * (1 - u)) * (1 - 0.22 * u * u * u);
const NT = 24;

/** pose → world-space polygons and the circles the smear sweeps */
export function build(P) {
  const s = shapeOf(P);
  const m = matrixOf(P, s);
  const T = (pts) => { const o = new Array(pts.length); for (let i = 0; i < pts.length; i += 2) { const x = pts[i], y = pts[i + 1]; o[i] = m[0] * x + m[2] * y + m[4]; o[i + 1] = m[1] * x + m[3] * y + m[5]; } return o; };
  const tp = (x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  const hip = [s.hip[0] + P.wig, s.hip[1]], hr = s.hip[2];
  const chest = s.chest, cr = chest[2];
  const hc = [s.head[0], s.head[1] + P.chew * 1.5], rh = s.head[2];
  const hA = s.hA + P.hA, hcos = Math.cos(hA), hsin = Math.sin(hA);
  const hp = (x, y) => [hc[0] + hcos * x - hsin * y, hc[1] + hsin * x + hcos * y];
  const paw = [s.paw[0], s.paw[1] + P.pawY];

  // tail: spine (with the hip wiggle at its root, sway about the 2nd point, curl of the tip)
  let t = s.t.map((p, i) => [p[0] + P.wig * [1, 0.8, 0.5, 0.3][i], p[1]]);
  if (P.tailS) { t[2] = rotAbout(t[2], t[1], P.tailS); t[3] = rotAbout(t[3], t[1], P.tailS); }
  if (P.tailK) t[3] = rotAbout(t[3], t[2], P.tailK);
  const sp = [], rr = [], spi = [], rri = [];
  for (let i = 0; i < NT; i++) {
    const u = i / (NT - 1), q = bez(t, u);
    sp.push(q[0], q[1]); rr.push(tailR(u));
    if (u > 0.18) { spi.push(q[0] - 3, q[1] - 3); rri.push(tailR(u) * 0.42); }
  }
  const earB = hp(-8, -26), earT = hp(-2 + 8 * P.ear, -60 - 4 * P.ear);
  const fe = [-12, 3];                                // the far side sits a little behind and above
  const B = {
    m, P,
    farEar: T(hull(earB[0] + fe[0], earB[1] + fe[1], 11, earT[0] + fe[0] - 4, earT[1] + fe[1] + 2, 5)),
    farArm: [T(hull(s.sh[0] - 9, s.sh[1] - 2, 10, paw[0] - 10, paw[1] - 3, 8.5)), T(circ([], paw[0] - 10, paw[1] - 3, 10, 18))],
    farFoot: T(hull(s.heel[0] - 10, s.heel[1] - 3, 10, s.toe[0] - 12, s.toe[1] - 3, 8.5)),
    tail: T(tube(sp, rr)),
    tailIn: T(tube(spi, rri)),
    body: [T(circ([], hip[0], hip[1], hr)), T(circ([], chest[0], chest[1], cr)), T(hull(hip[0], hip[1], hr, chest[0], chest[1], cr))],
    belly: T(hull(hip[0] + 22, hip[1] + 18, hr * 0.62, chest[0] + 14, chest[1] + 12, cr * 0.66)),
    thigh: T((() => { const o = []; for (let i = 0; i <= 10; i++) { const a = -0.55 + (i / 10) * 1.9; o.push(hip[0] + 6 + 30 * Math.cos(a), hip[1] + 4 + 30 * Math.sin(a)); } return o; })()),
    foot: T(hull(s.heel[0], s.heel[1], 11, s.toe[0], s.toe[1], 9.5)),
    head: [T(circ([], hc[0], hc[1], rh, 30)), T(circ([], ...hp(27, 9), 17 + P.chew * 3)), T(hull(earB[0], earB[1], 12.5, earT[0], earT[1], 5.5))],
    earIn: T(hull(...hp(-7, -30), 6, ...hp(-3 + 6 * P.ear, -54 - 3 * P.ear), 2.5)),
    muzzle: T(circ([], ...hp(24, 12), 15 + P.chew * 3)),
    ring: T(circ([], ...hp(11, -6), 11.5, 20)),
    eye: { c: tp(...hp(11, -6)), r: 8.2, open: P.eye, focus: P.focus, hA, m },
    nose: tp(...hp(43, 4)),
    mouth: T([...hp(36, 15), ...hp(40, 19), ...hp(44, 16)]),
    arm: [T(hull(s.sh[0], s.sh[1], 11, paw[0], paw[1], 9)), T(circ([], paw[0], paw[1], 11, 20))],
    acorn: P.acorn ? { c: tp(paw[0] + 4, paw[1] - 14), rot: Math.atan2(m[1], m[0]) } : null,
  };
  // the circles the smear and the multiples sweep (world centres, radii scale by √det = 1 under area-preserving stretch)
  const W = (x, y, r, k) => { const q = tp(x, y); return { x: q[0], y: q[1], r, k }; };
  B.sweep = [
    W(hip[0], hip[1], hr, 'body'), W((hip[0] + chest[0]) / 2, (hip[1] + chest[1]) / 2, (hr + cr) / 2, 'body'), W(chest[0], chest[1], cr, 'body'),
    W(hc[0], hc[1], rh, 'head'), W(...hp(27, 9), 17, 'head'),
    W(paw[0], paw[1], 11, 'limb'), W(s.toe[0], s.toe[1], 10, 'limb'),
  ];
  for (const u of [0.22, 0.42, 0.62, 0.8, 0.96]) { const q = bez(t, u); B.sweep.push(W(q[0], q[1], tailR(u), 'tail')); }
  B.tailSpine = { sp: T(sp), rr };
  B.paws = [B.arm[1], B.farArm[1]];
  B.feet = [B.foot, B.farFoot];
  return B;
}

// ---------------------------------------------------------------- drawing
export function poly(g, p) {
  g.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]);
}
/** one group = one silhouette: ink stroke (2·O wide) under the fill, so overlapping parts share one outer outline */
export function group(g, polys, fill, ink = COL.ink, o = O) {
  g.beginPath();
  for (const p of polys) { poly(g, p); g.closePath(); }
  if (ink) { g.lineWidth = 2 * o; g.strokeStyle = ink; g.lineJoin = 'round'; g.stroke(); }
  if (fill) { g.fillStyle = fill; g.fill(); }
}
export function fillPolys(g, polys, fill) {
  g.beginPath();
  for (const p of polys) { poly(g, p); g.closePath(); }
  g.fillStyle = fill; g.fill();
}
export function drawAcorn(g, x, y, rot, sc = 1, ink = COL.ink) {
  g.save();
  g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  g.lineJoin = 'round';
  // nut
  g.beginPath(); g.ellipse(0, 8, 17, 21, 0, 0, TAU);
  g.lineWidth = 8; g.strokeStyle = ink; g.stroke();
  g.fillStyle = '#c98a4b'; g.fill();
  g.beginPath(); g.ellipse(-6, 8, 6, 13, 0, 0, TAU); g.fillStyle = 'rgba(255,238,205,0.35)'; g.fill();
  g.beginPath(); g.moveTo(-2, 26); g.lineTo(0, 31); g.lineTo(2, 26); g.fillStyle = ink; g.fill();
  // cap
  g.beginPath(); g.ellipse(0, -6, 22, 12, 0, Math.PI, TAU); g.lineTo(22, -3); g.quadraticCurveTo(0, 6, -22, -3); g.closePath();
  g.lineWidth = 8; g.stroke(); g.fillStyle = '#6f4a2b'; g.fill();
  g.fillStyle = 'rgba(40,24,14,0.45)';
  for (const [a, b] of [[-12, -6], [-3, -9], [6, -8], [14, -4], [-8, -1], [2, -2], [10, 0]]) { g.beginPath(); g.arc(a, b, 2.2, 0, TAU); g.fill(); }
  g.beginPath(); g.moveTo(0, -16); g.quadraticCurveTo(2, -24, 7, -27); g.lineWidth = 5; g.lineCap = 'round'; g.stroke();
  g.restore();
}

/** the full-colour drawing of one pose */
export function drawSquirrel(g, B, opt = {}) {
  const ink = opt.ink || COL.ink;
  g.lineCap = 'round'; g.lineJoin = 'round';
  group(g, [B.farEar], COL.furD, ink);
  group(g, [B.farFoot], COL.furD, ink);
  group(g, B.farArm, COL.furD, ink);
  group(g, [B.tail], COL.tail, ink);
  fillPolys(g, [B.tailIn], 'rgba(232,146,88,0.55)');
  group(g, B.body, COL.fur, ink);
  g.save();
  g.beginPath(); for (const p of B.body) { poly(g, p); g.closePath(); } g.clip();
  fillPolys(g, [B.belly], COL.cream);
  g.restore();
  g.beginPath(); poly(g, B.thigh); g.lineWidth = 3.2; g.strokeStyle = 'rgba(42,26,16,0.55)'; g.stroke();
  group(g, [B.foot], COL.fur, ink);
  if (B.acorn) drawAcorn(g, B.acorn.c[0], B.acorn.c[1], B.acorn.rot, 0.9, ink);
  group(g, B.head, COL.fur, ink);
  fillPolys(g, [B.earIn], COL.pink);
  g.save();
  g.beginPath(); for (const p of B.head) { poly(g, p); g.closePath(); } g.clip();
  fillPolys(g, [B.muzzle], COL.cream);
  g.restore();
  fillPolys(g, [B.ring], COL.cream);
  drawEye(g, B.eye, ink);
  g.beginPath(); g.ellipse(B.nose[0], B.nose[1], 6.5, 5, B.eye.hA, 0, TAU); g.fillStyle = ink; g.fill();
  g.beginPath(); poly(g, B.mouth); g.lineWidth = 2.6; g.strokeStyle = ink; g.stroke();
  group(g, B.arm, COL.fur, ink);
}
function drawEye(g, E, ink) {
  const [x, y] = E.c;
  g.save();
  g.translate(x, y); g.rotate(E.hA);
  if (E.open < 0.15) {
    g.beginPath(); g.arc(0, -3, 7, 0.25, Math.PI - 0.25); g.lineWidth = 3.4; g.strokeStyle = ink; g.stroke();
  } else {
    const ry = E.r * (0.35 + 0.65 * E.open);
    g.beginPath(); g.ellipse(0, 0, E.r, ry, 0, 0, TAU); g.fillStyle = COL.eye; g.fill();
    if (E.focus > 0) {                                   // a flat upper lid: the stare
      g.beginPath(); g.rect(-E.r - 3, -E.r - 6, 2 * E.r + 6, E.r + 6 - E.r * (0.9 - 0.75 * E.focus));
      g.fillStyle = COL.fur; g.fill();
      g.beginPath(); g.moveTo(-E.r - 2, -E.r * (0.9 - 0.75 * E.focus) - 0.5); g.lineTo(E.r + 2, -E.r * (0.9 - 0.75 * E.focus) - 2.5);
      g.lineWidth = 3; g.strokeStyle = ink; g.stroke();
    }
    g.beginPath(); g.arc(2.6, -2.8, 2.7, 0, TAU); g.fillStyle = '#fff8ec'; g.fill();
  }
  g.restore();
}

/** every polygon of the drawing, for one-colour silhouettes (impact frames, onion skins) */
export function allPolys(B) {
  return [B.farEar, B.farFoot, ...B.farArm, B.tail, ...B.body, B.foot, ...B.head, ...B.arm];
}
