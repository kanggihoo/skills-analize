/*
 * lottie-kit.js — a tiny builder that writes Lottie (bodymovin 5.x) JSON in code instead of exporting it from After Effects.
 * Every object it emits uses only fields that lottie-web 5.13's SVG renderer reads (checked in node_modules/lottie-web/player/js):
 *
 *   animation  { v, fr, ip, op, w, h, nm, ddd, assets:[{ id, w, h, layers }], layers }
 *   layer      { ddd, ind, ty (4 shape · 0 precomp · 3 null), nm, sr, ks, ao, ip, op, st, bm, parent?, tt?/tp?/td?, hasMask?, masksProperties?,
 *                shapes (ty 4) | refId,w,h (ty 0) }          ip/op are in the parent comp's frames; keyframes are in layer time (comp − st)
 *   ks         { a, p, s, r, o }                             (TransformProperty.js)
 *   property   { a: 0, k: value }  |  { a: 1, k: [{ t, s:[…], o:{x,y}, i:{x,y}, h? }, …, { t, s }] }   (PropertyFactory.js)
 *              the ease of segment k→k+1 is cubic-bezier(o.x, o.y, i.x, i.y) stored on key k; y outside 0..1 = overshoot.
 *              No spatial tangents (to/ti): lottie walks a bezier path for those and clamps perc > 1, which would eat the overshoot.
 *   shapes     'gr' groups whose "it" ends with a 'tr'; 'sh' paths (vertex tangents RELATIVE to the vertex — DataManager makes them
 *              absolute), 'el', 'rc', 'sr', 'fl', 'st', 'gf' (gradient), 'tm' (trim), 'rp' (repeater), 'rd' (round corners)
 *   shape keys { t, s:[path], o:{x:n}, i:{x:n} }  — path keyframes need the same vertex count to morph (ShapeProperty.js)
 * lottie-web mutates the data while completing it (relative → absolute tangents), so main.js loads a deep copy.
 */
export const FR = 60;
export const f = (sec) => Math.round(sec * FR * 1000) / 1000;          // seconds → frames (sub-frames allowed)

// eases as CSS cubic-bezier quadruples (out-tangent x,y of the start key, in-tangent x,y of the end key)
export const E = {
  lin: [0, 0, 1, 1],
  inOut: [0.65, 0, 0.35, 1],
  soft: [0.45, 0, 0.55, 1],
  out: [0.2, 0.9, 0.3, 1],
  in: [0.6, 0, 0.9, 0.5],
  back: [0.3, 1.6, 0.55, 1],         // overshoot ≈ 12 %
  backBig: [0.25, 2.1, 0.5, 1],      // overshoot ≈ 25 %
  backIn: [0.55, -0.5, 0.8, 0.4],    // anticipation
  hold: 'hold',
};

/** Keyframes: K([[sec, value, ease?], …], offsetSec). The ease on a key is the ease of the segment that ENDS there. */
export const K = (keys, off = 0) => ({ __kf: keys, off });
const isPath = (v) => v && typeof v === 'object' && !Array.isArray(v) && 'v' in v;

export function prop(v) {
  if (!(v && v.__kf)) return { a: 0, k: v };
  const keys = v.__kf, off = v.off;
  const k = keys.map(([t, val], n) => {
    const shape = isPath(val);
    const key = { t: f(t - off), s: shape ? [val] : Array.isArray(val) ? val : [val] };
    if (n < keys.length - 1) {
      const e = keys[n + 1][2] || E.inOut;
      if (e === 'hold') key.h = 1;
      else if (shape) { key.o = { x: e[0], y: e[1] }; key.i = { x: e[2], y: e[3] }; }
      else { key.o = { x: [e[0]], y: [e[1]] }; key.i = { x: [e[2]], y: [e[3]] }; }
    }
    return key;
  });
  return { a: 1, k };
}

// ---------- colours ----------
export function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1].map((x) => Math.round(x * 1000) / 1000);
}
/** gradient colour stops [[offset, '#hex'], …] → lottie's flat [o, r, g, b, o, r, g, b, …] */
export const stops = (list) => list.flatMap(([o, hex]) => [o, ...rgb(hex).slice(0, 3)]);

// ---------- shape items ----------
const T0 = { a: [0, 0], p: [0, 0], s: [100, 100], r: 0, o: 100 };
export function tr(o = {}) {
  const t = { ...T0, ...o };
  return { ty: 'tr', nm: 'Transform', a: prop(t.a), p: prop(t.p), s: prop(t.s), r: prop(t.r), o: prop(t.o), sk: prop(0), sa: prop(0) };
}
export const group = (nm, items, t = {}) => ({ ty: 'gr', nm, np: items.length, cix: 2, bm: 0, it: [...items, tr(t)] });
export const path = (ks, nm = 'Path') => ({ ty: 'sh', nm, d: 1, ks: prop(ks) });
export const ellipse = (s, p = [0, 0]) => ({ ty: 'el', nm: 'Ellipse', d: 1, p: prop(p), s: prop(s) });
export const rect = (s, r = 0, p = [0, 0]) => ({ ty: 'rc', nm: 'Rect', d: 1, p: prop(p), s: prop(s), r: prop(r) });
/** 'sr' star (sy 1) or polygon (sy 2) */
export const star = ({ pt = 4, or = 30, ir = 10, r = 0, p = [0, 0], sy = 1 }) => ({
  ty: 'sr', nm: 'Star', d: 1, sy, pt: prop(pt), p: prop(p), r: prop(r), or: prop(or), os: prop(0),
  ...(sy === 1 ? { ir: prop(ir), is: prop(0) } : {}),
});
export const fill = (c, o = 100) => ({ ty: 'fl', nm: 'Fill', c: prop(c), o: prop(o), r: 1, bm: 0 });
export const stroke = (c, w, o = 100) => ({ ty: 'st', nm: 'Stroke', c: prop(c), o: prop(o), w: prop(w), lc: 2, lj: 2, ml: 4, bm: 0 });
/** gradient fill: type 1 linear (s → e), 2 radial (centre s, radius to e) */
export const gfill = ({ t = 1, s, e, g, o = 100, n }) => ({
  ty: 'gf', nm: 'Gradient', t, s: prop(s), e: prop(e), o: prop(o), r: 1, bm: 0, h: prop(0), a: prop(0), g: { p: n, k: prop(g) },
});
export const trim = (s, e, o = 0) => ({ ty: 'tm', nm: 'Trim', s: prop(s), e: prop(e), o: prop(o), m: 1 });
export const roundCorners = (r) => ({ ty: 'rd', nm: 'Round', r: prop(r) });
/** repeater: copies everything above it in the same group; tr = per-copy transform */
export const repeater = ({ c, o = 0, p = [0, 0], a = [0, 0], s = [100, 100], r = 0, so = 100, eo = 100 }) => ({
  ty: 'rp', nm: 'Repeater', c: prop(c), o: prop(o), m: 1,
  tr: { ty: 'tr', a: prop(a), p: prop(p), s: prop(s), r: prop(r), so: prop(so), eo: prop(eo) },
});

// ---------- layers ----------
/** layer transform; for vectors pass 2-D values (lottie's Matrix treats a missing z as 0 / scale 1) */
export function ks({ a = [0, 0], p = [0, 0], s = [100, 100], r = 0, o = 100 } = {}) {
  return { a: prop(a), p: prop(p), s: prop(s), r: prop(r), o: prop(o) };
}
function base(ty, o) {
  const L = {
    ddd: 0, ind: o.ind, ty, nm: o.nm || `layer ${o.ind}`, sr: 1, ks: ks(o.ks), ao: 0,
    ip: f(o.ip ?? 0), op: f(o.op ?? 9999), st: f(o.st ?? 0), bm: 0,
  };
  if (o.parent != null) L.parent = o.parent;
  if (o.td) L.td = 1;
  if (o.tt) { L.tt = o.tt; if (o.tp != null) L.tp = o.tp; }
  if (o.masks) { L.hasMask = true; L.masksProperties = o.masks; }
  return L;
}
export const shapeLayer = (o) => ({ ...base(4, o), shapes: o.shapes });
export const nullLayer = (o) => base(3, o);
export const precompLayer = (o) => ({ ...base(0, o), refId: o.refId, w: o.w, h: o.h });
/** additive mask (mode 'a') with an animated path; opacity 100 and no expansion → lottie renders it as a clipPath */
export const mask = (pt, nm = 'Mask') => ({ nm, mode: 'a', inv: false, pt: prop(pt), o: prop(100), x: prop(0) });

export function animation({ w, h, seconds, layers, assets = [], nm = 'comp' }) {
  return { v: '5.12.0', fr: FR, ip: 0, op: f(seconds) + 1, w, h, nm, ddd: 0, assets, layers, markers: [] };
}
export const asset = (id, w, h, layers) => ({ id, w, h, nm: id, layers });

// ---------- geometry (paths with tangents relative to their vertex) ----------
const KAPPA = 0.5522847;
const tan = (a) => [-Math.sin(a), Math.cos(a)];
const r2 = (x) => Math.round(x * 100) / 100;

/** closed circle of radius R with vertices at the given ascending angles (radians, screen coords: +y down, clockwise) */
export function circleAt(R, angles, cx = 0, cy = 0) {
  const n = angles.length, v = [], i = [], o = [];
  for (let k = 0; k < n; k++) v.push([r2(cx + R * Math.cos(angles[k])), r2(cy + R * Math.sin(angles[k]))]);
  for (let k = 0; k < n; k++) {
    const a = angles[k], b = k + 1 < n ? angles[k + 1] : angles[0] + Math.PI * 2;
    const L = (4 / 3) * Math.tan((b - a) / 4) * R;
    const ta = tan(a), tb = tan(b);
    o[k] = [r2(L * ta[0]), r2(L * ta[1])];
    i[(k + 1) % n] = [r2(-L * tb[0]), r2(-L * tb[1])];
  }
  return { c: true, v, i, o };
}

/** rounded square (half size s, corner radius rc), 8 vertices at the corner-arc ends, clockwise from the top edge */
export function roundSquare(s, rc) {
  const k = r2(KAPPA * rc);
  return {
    c: true,
    v: [[s - rc, -s], [s, -s + rc], [s, s - rc], [s - rc, s], [-s + rc, s], [-s, s - rc], [-s, -s + rc], [-s + rc, -s]],
    o: [[k, 0], [0, 0], [0, k], [0, 0], [-k, 0], [0, 0], [0, -k], [0, 0]],
    i: [[0, 0], [0, -k], [0, 0], [k, 0], [0, 0], [0, k], [0, 0], [-k, 0]],
  };
}
/** the polar angles of roundSquare's vertices, ascending — a circle drawn at these angles morphs into it vertex for vertex */
export function roundSquareAngles(s, rc) {
  const out = [];
  for (const [x, y] of roundSquare(s, rc).v) {
    let a = Math.atan2(y, x);
    while (out.length && a <= out[out.length - 1]) a += Math.PI * 2;
    out.push(a);
  }
  return out;
}

/**
 * Cloud silhouette: the outline of a row of overlapping circles [[cx, cy, r], …] standing on a flat base y = base.
 * Always 2 bezier segments per arc → 2·n + 1 vertices, so any two clouds with the same circle count morph into each other.
 */
export function cloudPath(circles, base) {
  const n = circles.length;
  const upper = (A, B) => {             // the upper intersection of circles A and B
    const [x0, y0, r0] = A, [x1, y1, r1] = B, dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy);
    const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r0 * r0 - a * a));
    const mx = x0 + (a * dx) / d, my = y0 + (a * dy) / d;
    const p1 = [mx + (h * dy) / d, my - (h * dx) / d], p2 = [mx - (h * dy) / d, my + (h * dx) / d];
    return p1[1] < p2[1] ? p1 : p2;
  };
  const ang = (C, p) => Math.atan2(p[1] - C[1], p[0] - C[0]);
  const v = [], ii = [], oo = [];
  let firstIn = [0, 0];
  for (let c = 0; c < n; c++) {
    const C = circles[c];
    let a = c === 0 ? Math.PI / 2 : ang(C, upper(circles[c - 1], C));
    let b = c === n - 1 ? Math.PI / 2 : ang(C, upper(C, circles[c + 1]));
    while (b <= a) b += Math.PI * 2;
    const segs = 2, step = (b - a) / segs, L = (4 / 3) * Math.tan(step / 4) * C[2];
    for (let s = 0; s <= segs; s++) {
      const t = a + step * s, P = [r2(C[0] + C[2] * Math.cos(t)), r2(C[1] + C[2] * Math.sin(t))], T = tan(t);
      const inH = [r2(-L * T[0]), r2(-L * T[1])], outH = [r2(L * T[0]), r2(L * T[1])];
      if (s === 0 && c > 0) { oo[oo.length - 1] = outH; continue; }   // the joint between two arcs: keep the corner
      if (s === 0) { v.push(P); ii.push([0, 0]); oo.push(outH); firstIn = [0, 0]; continue; }
      v.push(P); ii.push(inH); oo.push(s === segs ? [0, 0] : outH);
    }
  }
  // the last vertex sits on the base; the closing segment back to the first is the flat bottom (straight: zero tangents)
  v[v.length - 1][1] = base; v[0][1] = base;
  ii[0] = firstIn;
  return { c: true, v, i: ii, o: oo };
}

/** open semicircle from the left foot over the top to the right foot (for rainbow bands) */
export function arcPath(cx, cy, R) {
  const k = r2(KAPPA * R);
  return { c: false, v: [[cx - R, cy], [cx, cy - R], [cx + R, cy]], i: [[0, 0], [-k, 0], [0, -k]], o: [[0, -k], [k, 0], [0, 0]] };
}

export const polyPath = (pts, closed = true) => ({ c: closed, v: pts.map((p) => [r2(p[0]), r2(p[1])]), i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]) });
export const line = (x0, y0, x1, y1) => polyPath([[x0, y0], [x1, y1]], false);
export const mapPath = (P, fn) => ({ ...P, v: P.v.map((q) => fn(q).map(r2)), i: P.i.map((q) => q.slice()), o: P.o.map((q) => q.slice()) });
export const scalePath = (P, sx, sy = sx, ox = 0, oy = 0) => ({
  c: P.c, v: P.v.map(([x, y]) => [r2(ox + (x - ox) * sx), r2(oy + (y - oy) * sy)]),
  i: P.i.map(([x, y]) => [r2(x * sx), r2(y * sy)]), o: P.o.map(([x, y]) => [r2(x * sx), r2(y * sy)]),
});
