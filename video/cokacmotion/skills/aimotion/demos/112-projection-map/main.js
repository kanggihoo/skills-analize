/*
 * 112 · 이 골목도 무대였다 — projection-mapping typography on the facades of a flat-illustrated night yard.
 *
 *   camera     one fixed pinhole (eye 3 m, level, principal point shifted down → verticals stay vertical).
 *   facades    two brick/plaster walls meeting in an inner corner. Each wall is a plane; its facade coordinates (u, v)
 *              in metres map to the screen by ONE homography H = K·[U | V | O − C] (built once in setup).
 *   type       Pretendard Black outlines (opentype.js, flattened once). Every frame each glyph polyline is pushed
 *              through a 3×3 matrix (content → wall → screen) and filled — exact perspective, no texture warping.
 *   architecture  the light is projected from two projectors hung on a truss, so every sub-surface shows the wall
 *              "texture" along the projector's rays: a ledge front (plane offset by d) shows the content scaled about
 *              the projector's foot point by (Dp − d)/Dp — a visible jump — and the band under it is in the ledge's
 *              shadow; window glass cuts the light out; a recessed blind shows a shifted slice, framed by reveal
 *              shadows (the intersection of the projector's and the viewer's views of the opening).
 *   light      drawn on its own layer, pre-tinted by the albedo of the surface it lands on, added to the night
 *              picture ('lighter'), then the brick/blind/shutter texture is multiplied back over it and a mip-chain
 *              bloom is added. Beams, shafts toward each lit word, dust that sparkles only inside those shafts,
 *              and the spill on the yard floor are all derived from the same per-frame list of lit pieces.
 *   story      「이 골목도」 slides round the inner corner (one strip coordinate across both walls) → 「누군가의」 falls
 *              down the brick wall through every ledge → 「무대였다」 lights up window by window → the climax:
 *              the sentence set in SCREEN space and pulled back onto both walls by H⁻¹ (anamorphic), arriving as
 *              shards that slide along each wall and click into one flat sentence only from this spot.
 *
 * Determinism: frame(t) is closed-form in t; every texture is baked in setup with rand(seed); 2D state is reset per pass.
 */
import { defineDemo, rand, clamp, lerp, ease } from '../_lib/stage.js';
import { loadOutlineFont, outlineContours } from '../_lib/type.js';

const D = 10;
const SW = 1080, SH = 1920;

// ---------------------------------------------------------------- camera (fixed)
const F = 1000, CX = 540, CY = 1080, EYE = 3.0;   // the viewer stands on the alley steps, eye 3 m above the yard
const C3 = [0, EYE, 0];

// ---------------------------------------------------------------- small vector / 3×3 algebra
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scl = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const proj = (p) => [CX + F * p[0] / p[2], CY - F * (p[1] - EYE) / p[2]];
const Kv = (v) => [F * v[0] + CX * v[2], -F * v[1] + CY * v[2], v[2]];
/** facade (u, v) → screen for the plane through O with horizontal axis U and vertical axis +y */
function planeH(O, U) {
  const a = Kv(U), b = Kv([0, 1, 0]), c = Kv([O[0], O[1] - EYE, O[2]]);
  return [a[0], b[0], c[0], a[1], b[1], c[1], a[2], b[2], c[2]];
}
const mul = (A, B) => [
  A[0] * B[0] + A[1] * B[3] + A[2] * B[6], A[0] * B[1] + A[1] * B[4] + A[2] * B[7], A[0] * B[2] + A[1] * B[5] + A[2] * B[8],
  A[3] * B[0] + A[4] * B[3] + A[5] * B[6], A[3] * B[1] + A[4] * B[4] + A[5] * B[7], A[3] * B[2] + A[4] * B[5] + A[5] * B[8],
  A[6] * B[0] + A[7] * B[3] + A[8] * B[6], A[6] * B[1] + A[7] * B[4] + A[8] * B[7], A[6] * B[2] + A[7] * B[5] + A[8] * B[8]];
function inv(m) {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C;
  return [A / det, -(b * i - c * h) / det, (b * f - c * e) / det,
    B / det, (a * i - c * g) / det, -(a * f - c * d) / det,
    C / det, -(a * h - b * g) / det, (a * e - b * d) / det];
}
const ap = (M, x, y) => { const w = M[6] * x + M[7] * y + M[8]; return [(M[0] * x + M[1] * y + M[2]) / w, (M[3] * x + M[4] * y + M[5]) / w]; };
const Tm = (x, y) => [1, 0, x, 0, 1, y, 0, 0, 1];
const Sm = (sx, sy) => [sx, 0, 0, 0, sy, 0, 0, 0, 1];
const I3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
const about = (k, px, py) => [k, 0, (1 - k) * px, 0, k, (1 - k) * py, 0, 0, 1];
const scaleRect = (r, k, px, py) => [px + k * (r[0] - px), py + k * (r[1] - py), px + k * (r[2] - px), py + k * (r[3] - py)];
const isect = (a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.min(a[2], b[2]), Math.min(a[3], b[3])];
const overlaps = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
const area = (pts) => { let s = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; s += p[0] * q[1] - q[0] * p[1]; } return s / 2; };
const rgb = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const tail = (x, k) => (x <= 0 ? 0 : Math.exp(-x / k));      // impulse decay

// ---------------------------------------------------------------- the yard: two walls meeting in an inner corner
const R2 = Math.SQRT1_2;
const CORNER = [0, 0, 15];
const WL = 12, WR = 12;
// two projectors hang from a truss over the yard and cross-fire: A (left) lights the right wall, B (right) the left wall
const PJ_A = [-2.0, 11.2, 8.5], PJ_B = [2.0, 11.2, 8.5];
const TRUSS_Z = 8.5, TRUSS_Y = 12.0;

const LIGHT_W = [1.0, 0.94, 0.82];          // warm white
const LIGHT_A = [1.0, 0.34, 0.48];          // the one accent: rose (only on 「무대」)

const BRICK = {
  id: 'L', O: sub(CORNER, scl([R2, 0, R2], WL)), U: [R2, 0, R2], W: WL, top: 16.5, P: PJ_B, gain: 0.95,
  wallTop: hex('#3b2230'), wallBot: hex('#5b3039'), tint: [1.0, 0.76, 0.68],
  ledge: { front: hex('#7a5560'), soffit: hex('#24141c'), tint: [1.0, 0.9, 0.84] },
  ledges: [{ v: 3.6, th: 0.2, d: 0.24 }, { v: 6.6, th: 0.18, d: 0.22 }, { v: 9.6, th: 0.18, d: 0.22 }, { v: 12.6, th: 0.18, d: 0.22 }, { v: 15.6, th: 0.3, d: 0.34 }],
  windows: [],
};
const PLASTER = {
  id: 'R', O: CORNER, U: [R2, 0, -R2], W: WR, top: 10.5, P: PJ_A, gain: 0.86,
  wallTop: hex('#2c3554'), wallBot: hex('#3e4a6a'), tint: [0.8, 0.88, 1.0],
  ledge: { front: hex('#53627f'), soffit: hex('#161c33'), tint: [0.9, 0.94, 1.0] },
  ledges: [{ v: 3.6, th: 0.18, d: 0.22 }, { v: 6.6, th: 0.17, d: 0.2 }, { v: 9.6, th: 0.32, d: 0.34 }],
  windows: [],
};
// brick wall: sliding windows with closed blinds (the blinds catch the light), a roll shutter on the ground floor
for (const fb of [3.6, 6.6, 9.6, 12.6]) for (const c of [6.0, 9.0]) {
  BRICK.windows.push({ r: [c - 0.8, fb + 0.8, c + 0.8, fb + 2.4], kind: 'blind', depth: 0.18, fb, c });
}
BRICK.windows.push({ r: [5.0, 0.0, 10.4, 2.85], kind: 'shutter', depth: 0.07 });
// plaster wall: clear glass (the light falls into the rooms and is lost), a door and a lit shop window
// (an irregular 다세대 house: the windows sit where the rooms are, not on one grid)
for (const [fb, c, hw] of [[3.6, 3.45, 0.42], [3.6, 6.5, 0.5], [6.6, 4.1, 0.32], [6.6, 6.9, 0.5]]) {
  PLASTER.windows.push({ r: [c - hw, fb + 0.95, c + hw, fb + 2.35], kind: 'glass', depth: 0.16, fb, c });
}
PLASTER.windows.push({ r: [0.85, 0.0, 2.05, 2.3], kind: 'door', depth: 0.2 });
PLASTER.windows.push({ r: [6.4, 0.85, 8.3, 2.35], kind: 'shop', depth: 0.14 });

// windows whose lamps come on (t = −1: on from the start). Index into the facade's window list.
const LAMPS = [
  ['L', 6, -1], ['R', 1, -1], ['R', 5, -1],
  ['L', 7, 7.5], ['R', 3, 7.85], ['L', 0, 8.3], ['L', 1, 8.8],
];

function makeFacade(s) {
  const f = { ...s };
  const U = s.U, O = s.O, n = [U[2], 0, -U[0]];   // n = V × U points into the yard
  f.n = n;
  const cache = new Map();
  f.Hw = (w = 0) => { if (!cache.has(w)) cache.set(w, planeH(add(O, scl(n, w)), U)); return cache.get(w); };
  f.H = f.Hw(0); f.Hi = inv(f.H);
  f.pt = (u, v, w = 0) => add(add(O, scl(U, u)), add([0, v, 0], scl(n, w)));
  f.scr = (u, v, w = 0) => ap(f.Hw(w), u, v);
  f.quad = (r, w = 0) => [f.scr(r[0], r[1], w), f.scr(r[2], r[1], w), f.scr(r[2], r[3], w), f.scr(r[0], r[3], w)];
  const P = s.P;
  f.pu = dot(U, sub(P, O)); f.pv = P[1]; f.Dp = dot(n, sub(P, O));                 // projector foot + distance
  f.cu = dot(U, sub(C3, O)); f.cv = EYE; f.Dc = dot(n, sub(C3, O));                // viewer foot + distance
  /** wall texture → plane w along the projector's rays (similarity about the projector's foot point) */
  f.Aw = (w) => about((f.Dp - w) / f.Dp, f.pu, f.pv);
  f.srcOf = (r, w) => scaleRect(r, f.Dp / (f.Dp - w), f.pu, f.pv);
  // the strip of this wall that the camera sees (u range), sampled at eye height
  let u0 = Infinity, u1 = -Infinity;
  for (let u = 0; u <= s.W; u += 0.02) { const x = f.scr(u, EYE)[0]; if (x >= -2 && x <= SW + 2) { u0 = Math.min(u0, u); u1 = Math.max(u1, u); } }
  f.vis = [u0, u1];
  return f;
}

// ---------------------------------------------------------------- the type
/** lay a phrase out once (em units, baseline y = 0, y down); every syllable keeps its contours relative to its ink centre */
function layoutPhrase(font, text, size = 220) {
  const gs = outlineContours(font, text, 0, 0, size, { tol: 0.3, letterSpacing: -0.03 * size });
  const syl = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const g of gs) {
    if (!g.contours.length) continue;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const c of g.contours) for (let i = 0; i < c.pts.length; i += 2) {
      const x = c.pts[i] / size, y = c.pts[i + 1] / size;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const contours = g.contours.map((c) => Float32Array.from(c.pts, (v, i) => (i % 2 ? v / size - cy : v / size - cx)));
    syl.push({ ch: g.ch, cx, cy, contours, bb: [x0 - cx, y0 - cy, x1 - cx, y1 - cy] });
    minX = Math.min(minX, x0); maxX = Math.max(maxX, x1); minY = Math.min(minY, y0); maxY = Math.max(maxY, y1);
  }
  return { syl, minX, maxX, minY, maxY };
}
const SQUARE = { contours: [Float32Array.from([-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5])], bb: [-0.5, -0.5, 0.5, 0.5] };

/** fill a glyph through a 3×3 matrix (em → screen); the homogeneous divide makes it perspective-exact */
function fillGlyph(ctx, g, M) {
  ctx.beginPath();
  for (const pts of g.contours) {
    for (let i = 0; i < pts.length; i += 2) {
      const x = pts[i], y = pts[i + 1], w = M[6] * x + M[7] * y + M[8];
      const X = (M[0] * x + M[1] * y + M[2]) / w, Y = (M[3] * x + M[4] * y + M[5]) / w;
      if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
    }
  }
  ctx.fill();
}
const bboxThrough = (bb, M) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of [[bb[0], bb[1]], [bb[2], bb[1]], [bb[2], bb[3]], [bb[0], bb[3]]]) {
    const p = ap(M, x, y);
    if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1];
  }
  return [x0, y0, x1, y1];
};

// ---------------------------------------------------------------- timeline (seconds)
const T_ON = 0.15;                     // lenses open
const T1 = 0.95, T1D = 1.3;           // 「이 골목도」 slides round the corner
const T2 = 2.45;                      // 「누군가의」 starts to fall
const T3 = 4.0, T3S = 0.22;           // 「무대였다」 window by window
const T_OUT = 5.55;                   // the three phrases leave
const T_IN = 5.7, T_LOCK = 7.05;      // the anamorphic sentence arrives / clicks into place
const T_GLINT = 7.55;

// hesitate-then-click: most of the way with a soft out-cubic, a beat of near-alignment, then the last 10 % snaps
const snap = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.8 ? 0.92 * (1 - (1 - p / 0.8) ** 2) : 0.92 + 0.08 * ease.inOutCubic((p - 0.8) / 0.2));

// ---------------------------------------------------------------- module state (filled in setup)
let font, PH = [], CL = [];
let FL, FR, FACES;
let main, lc, lctx, g1, g2, g3;
let base, detail, fgTop, crowd, rim, vignette;
let dust = [];
let festoon = [];
let lampPaths = [];

function canvas2d(w, h, headless) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, ctx: c.getContext('2d', headless ? { willReadFrequently: true } : undefined) };
}
function resetCtx(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); ctx.imageSmoothingEnabled = true;
  ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
}
const polyTo = (ctx, pts) => { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); };
const fillPoly = (ctx, pts, style) => { ctx.fillStyle = style; ctx.beginPath(); polyTo(ctx, pts); ctx.fill(); };
function orientedPath(polys) {
  const p = new Path2D();
  for (const pts of polys) { const q = area(pts) < 0 ? pts.slice().reverse() : pts; p.moveTo(q[0][0], q[0][1]); for (let i = 1; i < q.length; i++) p.lineTo(q[i][0], q[i][1]); }
  return p;
}

// ---------------------------------------------------------------- per-facade surfaces (built once)
function buildSurfaces(f) {
  f.wallRect = [0, 0, f.W, f.top];
  f.wallPoly = f.quad(f.wallRect);
  f.wallClip = orientedPath([f.wallPoly]);
  const cuts = [], subs = [], lines = [];
  const corner = f.id === 'L' ? f.W : 0;
  const dist = (u) => Math.abs(u - corner);
  // ledges: front face shows the content scaled about the projector foot; the band beside it is in its shadow
  for (const L of f.ledges) {
    const u0 = f.id === 'L' ? 0 : L.d, u1 = f.id === 'L' ? f.W - L.d : f.W;
    const front = [u0, L.v, u1, L.v + L.th];
    const foot = [f.scr(u0, L.v), f.scr(u1, L.v), f.scr(u1, L.v, L.d), f.scr(u1, L.v + L.th, L.d), f.scr(u0, L.v + L.th, L.d), f.scr(u0, L.v, L.d)];
    cuts.push(foot);
    const s = f.Dp / (f.Dp - L.d);
    let band = null;
    if (f.pv > L.v + L.th) band = [f.pv + s * (L.v - f.pv), L.v];
    else if (f.pv < L.v) band = [L.v + L.th, f.pv + s * (L.v + L.th - f.pv)];
    if (band) { L.band = band; cuts.push(f.quad([0, band[0], f.W, band[1]])); }
    subs.push({ kind: 'ledge', clip: orientedPath([f.quad(front, L.d)]), H: mul(f.Hw(L.d), f.Aw(L.d)), src: f.srcOf(front, L.d), tint: f.ledge.tint });
    L.front = front; L.foot = foot;
    lines.push({ w: L.d, a: [u0, L.v], b: [u1, L.v], d: 0 }, { w: L.d, a: [u0, L.v + L.th], b: [u1, L.v + L.th], d: 0 });
  }
  // windows: glass cuts the light out; blinds/shutters are recessed planes lit through the opening
  for (const win of f.windows) {
    const r = win.r, dep = win.depth;
    const opening = f.quad(r);
    win.opening = opening;
    const seen = isect(r, scaleRect(r, (f.Dc + dep) / f.Dc, f.cu, f.cv));      // part of the recessed plane the viewer sees
    const lit = isect(seen, scaleRect(r, (f.Dp + dep) / f.Dp, f.pu, f.pv));      // …that the projector also reaches
    win.seen = seen; win.lit = lit;
    win.seenPoly = f.quad(seen, -dep);
    if (win.kind === 'shutter' || win.kind === 'door') {
      cuts.push(opening);
      subs.push({ kind: win.kind, clip: orientedPath([f.quad(lit, -dep)]), H: mul(f.Hw(-dep), f.Aw(-dep)), src: f.srcOf(lit, -dep),
        tint: win.kind === 'door' ? [1.0, 0.84, 0.74] : [0.86, 0.9, 1.0] });
    } else {
      cuts.push(opening);
      if (win.kind === 'blind' && lit[2] > lit[0] && lit[3] > lit[1]) {
        subs.push({ kind: 'blind', clip: orientedPath([f.quad(lit, -dep)]), H: mul(f.Hw(-dep), f.Aw(-dep)), src: f.srcOf(lit, -dep), tint: [1.0, 0.92, 0.78], win });
        // the meeting rail of the sliding sash casts a thin line
        win.rail = f.quad([win.c - 0.035, r[1], win.c + 0.035, r[3]], -dep + 0.02);
      }
    }
    const dd = dist((r[0] + r[2]) / 2);
    lines.push({ w: 0, a: [r[0], r[1]], b: [r[2], r[1]], d: dd }, { w: 0, a: [r[2], r[1]], b: [r[2], r[3]], d: dd },
      { w: 0, a: [r[2], r[3]], b: [r[0], r[3]], d: dd }, { w: 0, a: [r[0], r[3]], b: [r[0], r[1]], d: dd });
  }
  lines.push({ w: 0, a: [corner, 0], b: [corner, f.top], d: 0 }, { w: 0, a: [0, f.top], b: [f.W, f.top], d: 0 });
  f.cutPath = orientedPath(cuts);
  f.subs = subs;
  f.lines = lines;
  f.rails = f.windows.filter((w) => w.rail).map((w) => w.rail);
  // where each projector's light is centred on its wall (for the hot-spot gradient)
  f.hot = f.scr((f.vis[0] + f.vis[1]) / 2 + (f.id === 'L' ? 0.8 : -0.8), 7.0);
}

// ---------------------------------------------------------------- the night picture (baked once)
function paintBase(ctx, R) {
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, 1150);
  sky.addColorStop(0, '#080b24'); sky.addColorStop(0.45, '#151a45'); sky.addColorStop(1, '#30295a');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, SW, SH);
  for (let i = 0; i < 170; i++) {
    const x = R() * SW, y = R() * 620, r = 0.6 + R() * 1.5;
    ctx.fillStyle = `rgba(255,244,220,${(0.25 + R() * 0.6).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  // moon
  const mx = 900, my = 214;
  const halo = ctx.createRadialGradient(mx, my, 30, mx, my, 210);
  halo.addColorStop(0, 'rgba(255,236,200,0.28)'); halo.addColorStop(1, 'rgba(255,236,200,0)');
  ctx.fillStyle = halo; ctx.fillRect(mx - 220, my - 220, 440, 440);
  ctx.fillStyle = '#f5ead0'; ctx.beginPath(); ctx.arc(mx, my, 44, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(214,200,176,0.55)';
  for (const [dx, dy, r] of [[-12, -8, 9], [14, 10, 7], [4, -20, 5], [-16, 16, 5]]) { ctx.beginPath(); ctx.arc(mx + dx, my + dy, r, 0, Math.PI * 2); ctx.fill(); }
  // far hillside of houses, visible above the plaster roof
  const hill = (x) => 430 - (x - 540) * 0.36 + 18 * Math.sin(x * 0.011);
  ctx.fillStyle = '#1b1d48';
  ctx.beginPath(); ctx.moveTo(380, 700);
  for (let x = 380; x <= SW + 10; x += 10) ctx.lineTo(x, hill(x));
  ctx.lineTo(SW + 10, 700); ctx.fill();
  for (let x = 400; x < SW; ) {
    const w = 26 + R() * 34, h = 18 + R() * 30, y = hill(x + w / 2) + 6;
    ctx.fillStyle = R() < 0.5 ? '#202352' : '#191c44';
    ctx.beginPath(); ctx.roundRect(x, y - h, w, h + 60, 3); ctx.fill();
    if (R() < 0.55) { ctx.fillStyle = `rgba(255,200,110,${(0.5 + R() * 0.4).toFixed(2)})`; ctx.fillRect(x + w * 0.3, y - h + 7, 5, 6); }
    if (R() < 0.3) { ctx.fillStyle = 'rgba(255,214,140,0.6)'; ctx.fillRect(x + w * 0.65, y - h + 9, 4, 5); }
    x += w + 3 + R() * 10;
  }
  // rooftop of the plaster house: a rooftop room (옥탑방) and a water tank, set back from the parapet
  const roof = FR;
  const room = [1.4, roof.top - 0.9, 4.2, roof.top + 1.7];
  fillPoly(ctx, roof.quad([room[0] - 0.1, room[3], room[2] + 0.1, room[3] + 0.18], -2.2), '#262c4a');
  fillPoly(ctx, roof.quad(room, -2.2), '#323b5e');
  fillPoly(ctx, roof.quad([2.2, roof.top + 0.1, 3.4, roof.top + 1.1], -2.2), '#ffcb73');
  fillPoly(ctx, roof.quad([2.78, roof.top + 0.1, 2.86, roof.top + 1.1], -2.18), '#7a5a3a');
  {
    const c = roof.scr(6.0, roof.top, -1.6), k = F / roof.pt(6.0, roof.top, -1.6)[2];
    const w = 1.5 * k, h = 1.25 * k;
    ctx.fillStyle = '#2f6a63'; ctx.beginPath(); ctx.roundRect(c[0] - w / 2, c[1] - h, w, h, 6); ctx.fill();
    ctx.fillStyle = '#3f8279'; ctx.beginPath(); ctx.ellipse(c[0], c[1] - h, w / 2, w * 0.16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(c[0] - w / 2, c[1] - h * 0.55, w, 3);
    ctx.strokeStyle = '#151a30'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(c[0] + w * 0.8, c[1]); ctx.lineTo(c[0] + w * 0.8, c[1] - 2.4 * k); ctx.lineTo(c[0] + w * 0.8 + 18, c[1] - 2.4 * k); ctx.stroke();
  }
  // yard floor: stone paving on the 45° grid of the walls (both families vanish at the two vanishing points)
  const floor = ctx.createLinearGradient(0, 1250, 0, SH);
  floor.addColorStop(0, '#24233f'); floor.addColorStop(1, '#0c0d1f');
  ctx.fillStyle = floor; ctx.fillRect(0, 1180, SW, SH - 1180);
  ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(8,8,22,0.55)';
  const gp = (a, b) => [a * R2 + b * R2, 0, 15 - a * R2 + b * R2];     // (along-left, along-right) → ground point
  for (let k = -24; k <= 2; k++) {
    for (const fam of [0, 1]) {
      ctx.beginPath(); let started = false;
      for (let s = -20; s <= 0; s += 0.25) {
        const p = fam ? gp(k * 0.9, s) : gp(s, k * 0.9);
        if (p[2] < 1.2) { started = false; continue; }
        const q = proj(p);
        if (started) ctx.lineTo(q[0], q[1]); else { ctx.moveTo(q[0], q[1]); started = true; }
      }
      ctx.stroke();
    }
  }
  // the two walls (far parts first does not matter: they do not overlap on screen)
  for (const f of FACES) paintWall(ctx, f, R);
  // occlusion in the inner corner
  for (const f of FACES) {
    const a = f.id === 'L' ? f.W - 1.6 : 1.6, b = f.id === 'L' ? f.W : 0;
    const poly = f.quad([Math.min(a, b), 0, Math.max(a, b), f.top]);
    const pa = f.scr(a, 6), pb = f.scr(b, 6);
    const g = ctx.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
    g.addColorStop(0, 'rgba(6,4,20,0)'); g.addColorStop(1, 'rgba(6,4,20,0.42)');
    fillPoly(ctx, poly, g);
  }
  // contact shadow at the foot of the walls
  for (const f of FACES) {
    const p0 = f.scr(0, 0), p1 = f.scr(f.W, 0);
    const g = ctx.createLinearGradient(0, Math.min(p0[1], p1[1]) - 30, 0, Math.max(p0[1], p1[1]) + 40);
    ctx.save(); ctx.beginPath(); polyTo(ctx, [p0, p1, [p1[0], p1[1] + 60], [p0[0], p0[1] + 60]]); ctx.clip();
    g.addColorStop(0, 'rgba(5,5,16,0.55)'); g.addColorStop(1, 'rgba(5,5,16,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 1100, SW, 500); ctx.restore();
  }
}

function paintWall(ctx, f, R) {
  const g = ctx.createLinearGradient(0, f.scr(f.vis[0], f.top)[1], 0, f.scr(f.vis[0], 0)[1]);
  g.addColorStop(0, rgb(f.wallTop)); g.addColorStop(1, rgb(f.wallBot));
  fillPoly(ctx, f.wallPoly, g);
  // windows: reveal, recessed panel, frame
  for (const win of f.windows) {
    const reveal = f.id === 'L' ? '#21121a' : '#141a30';
    fillPoly(ctx, win.opening, reveal);
    const panel = { blind: '#3d3546', glass: '#141a38', shutter: '#3a3f55', door: '#3a2730', shop: '#1a1e3a' }[win.kind];
    fillPoly(ctx, win.seenPoly, panel);
    if (win.kind === 'glass' || win.kind === 'shop') {
      // a diagonal reflection on the glass
      const s = win.seen, d = -win.depth;
      ctx.save(); ctx.beginPath(); polyTo(ctx, win.seenPoly); ctx.clip();
      const a0 = f.scr(s[0], s[3], d), a1 = f.scr(s[2], s[1], d);
      const rg = ctx.createLinearGradient(a0[0], a0[1], a1[0], a1[1]);
      rg.addColorStop(0.25, 'rgba(90,110,180,0)'); rg.addColorStop(0.4, 'rgba(90,110,180,0.32)'); rg.addColorStop(0.52, 'rgba(90,110,180,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, SW, SH); ctx.restore();
      if (win.kind === 'glass') fillPoly(ctx, f.quad([win.c - 0.03, win.r[1], win.c + 0.03, win.r[3]], d + 0.02), '#55627f');
    }
    if (win.rail) fillPoly(ctx, win.rail, '#7c6a74');
    if (win.kind === 'door') {
      fillPoly(ctx, f.quad([win.r[0] + 0.12, 0.2, win.r[2] - 0.12, 1.1], -win.depth), '#47323b');
      fillPoly(ctx, f.quad([win.r[0] + 0.12, 1.25, win.r[2] - 0.12, 2.15], -win.depth), '#47323b');
      fillPoly(ctx, f.quad([win.r[2] - 0.3, 1.0, win.r[2] - 0.2, 1.1], -win.depth + 0.04), '#c9a46a');
    }
    if (win.kind === 'shutter') {
      // sign board over the shutter (no lettering)
      fillPoly(ctx, f.quad([win.r[0] - 0.2, 2.95, win.r[2] + 0.2, 3.45], 0.08), '#1d3a44');
      fillPoly(ctx, f.quad([win.r[0] - 0.2, 2.95, win.r[2] + 0.2, 3.0], 0.08), '#2c5a63');
    }
    // frame (sill + jambs) on the wall plane
    if (win.kind === 'blind' || win.kind === 'glass') {
      const fr = f.id === 'L' ? '#7a6470' : '#56658a';
      fillPoly(ctx, f.quad([win.r[0] - 0.12, win.r[1] - 0.14, win.r[2] + 0.12, win.r[1]], 0.06), fr);
    }
  }
  // ledges: soffit (seen from below) and lit-colour front
  for (const L of f.ledges) {
    const [p0, p1, p2, p3, p4, p5] = L.foot;
    fillPoly(ctx, [p0, p1, p2, p5], rgb(f.ledge.soffit));
    fillPoly(ctx, [p5, p2, p3, p4], rgb(f.ledge.front));
    ctx.strokeStyle = 'rgba(255,240,230,0.14)'; ctx.lineWidth = 1.5; ctx.beginPath(); polyTo(ctx, [p4, p3]); ctx.stroke();
  }
  // parapet top
  const cap = f.quad([0, f.top - 0.06, f.W, f.top], 0.05);
  fillPoly(ctx, cap, f.id === 'L' ? '#6a4652' : '#4d5a7c');
  // a small lamp over the door, and flower pots along the plaster wall
  if (f.id === 'R') {
    const lp = f.scr(1.45, 2.6, 0.12);
    const lg = ctx.createRadialGradient(lp[0], lp[1], 2, lp[0], lp[1], 70);
    lg.addColorStop(0, 'rgba(255,214,140,0.55)'); lg.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = lg; ctx.fillRect(lp[0] - 80, lp[1] - 80, 160, 160);
    ctx.fillStyle = '#ffe2a8'; ctx.beginPath(); ctx.arc(lp[0], lp[1], 5, 0, Math.PI * 2); ctx.fill();
    for (const [u, s] of [[6.3, 1.0], [6.9, 0.8], [8.4, 1.15]]) {
      const b = f.scr(u, 0, 0.45), k = F / f.pt(u, 0, 0.45)[2];
      ctx.fillStyle = '#7a3f34'; ctx.beginPath(); ctx.roundRect(b[0] - 0.28 * s * k, b[1] - 0.42 * s * k, 0.56 * s * k, 0.42 * s * k, 4); ctx.fill();
      ctx.fillStyle = '#2f5a4a';
      for (const [dx, dy, rr] of [[-0.14, -0.62, 0.22], [0.12, -0.7, 0.24], [0, -0.86, 0.2]]) { ctx.beginPath(); ctx.arc(b[0] + dx * s * k, b[1] + dy * s * k, rr * s * k, 0, Math.PI * 2); ctx.fill(); }
    }
  }
}

/** texture that the light is multiplied by: mortar courses, plaster stains, shutter ribs, blind slats (white = 1) */
function paintDetail(ctx, R) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, SW, SH);
  for (const f of FACES) {
    ctx.save();
    ctx.beginPath(); polyTo(ctx, f.wallPoly);
    for (const win of f.windows) polyTo(ctx, win.opening);
    ctx.clip('evenodd');
    if (f.id === 'L') {
      ctx.strokeStyle = 'rgba(150,120,125,0.55)'; ctx.lineWidth = 1;
      for (let v = 0.075; v < f.top; v += 0.15) {
        const a = f.scr(0, v), b = f.scr(f.W, v);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        const off = (Math.round(v / 0.15) % 2) * 0.15;
        ctx.beginPath();
        for (let u = off; u < f.W; u += 0.3) { const p = f.scr(u, v), q = f.scr(u, v + 0.15); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
        ctx.stroke();
      }
      // a few darker bricks for life
      for (let i = 0; i < 260; i++) {
        const v = Math.floor(R() * f.top / 0.15) * 0.15 + 0.075, u = Math.floor(R() * f.W / 0.3) * 0.3 + ((Math.round(v / 0.15) % 2) * 0.15);
        fillPoly(ctx, f.quad([u, v, u + 0.3, v + 0.15]), `rgba(170,140,150,${(0.25 + R() * 0.35).toFixed(2)})`);
      }
    } else {
      for (let i = 0; i < 70; i++) {
        const u = R() * f.W, v = R() * f.top, rr = 0.2 + R() * 0.6;
        const p = f.scr(u, v), k = F / f.pt(u, v)[2];
        const sg = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr * k);
        sg.addColorStop(0, 'rgba(190,195,215,0.35)'); sg.addColorStop(1, 'rgba(190,195,215,0)');
        ctx.fillStyle = sg; ctx.fillRect(p[0] - rr * k, p[1] - rr * k, 2 * rr * k, 2 * rr * k);
      }
      // a rain stain under each cornice
      for (const L of f.ledges) {
        const a = f.scr(0, L.v), b = f.scr(0, L.v - 0.9);
        const sg = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
        sg.addColorStop(0, 'rgba(170,175,200,0.35)'); sg.addColorStop(1, 'rgba(170,175,200,0)');
        fillPoly(ctx, f.quad([0, L.v - 0.9, f.W, L.v]), sg);
      }
    }
    ctx.restore();
    for (const win of f.windows) {
      if (win.kind !== 'blind' && win.kind !== 'shutter') continue;
      ctx.save(); ctx.beginPath(); polyTo(ctx, win.seenPoly); ctx.clip();
      const step = win.kind === 'blind' ? 0.1 : 0.13;
      ctx.strokeStyle = win.kind === 'blind' ? 'rgba(150,140,140,0.6)' : 'rgba(120,125,140,0.7)';
      ctx.lineWidth = win.kind === 'blind' ? 1.2 : 1.6;
      for (let v = win.r[1] + step / 2; v < win.r[3]; v += step) {
        const a = f.scr(win.r[0], v, -win.depth), b = f.scr(win.r[2], v, -win.depth);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      ctx.restore();
    }
  }
}

// ---------------------------------------------------------------- foreground: truss, projectors, festoons, crowd
function festoonPath(a, b, sag, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, p = add(scl(a, 1 - s), scl(b, s));
    p[1] -= sag * 4 * s * (1 - s);
    pts.push(p);
  }
  return pts;
}
function lensOf(P, dir) { const p = proj(P); return [p[0] + dir * 30, p[1] + 6]; }

function paintTop(ctx) {
  // festoon cables (bulbs are drawn live)
  ctx.lineWidth = 2; ctx.strokeStyle = '#0d0f22';
  for (const s of festoon) { ctx.beginPath(); polyTo(ctx, s.pts.map(proj)); ctx.stroke(); }
  for (const s of festoon) for (const b of s.bulbs) {
    const q = proj(b), k = F / b[2];
    ctx.fillStyle = '#2a2420'; ctx.fillRect(q[0] - 0.03 * k, q[1] - 0.05 * k, 0.06 * k, 0.05 * k);
  }
  // truss across the yard (box truss seen side-on)
  const y0 = proj([0, TRUSS_Y + 0.25, TRUSS_Z])[1], y1 = proj([0, TRUSS_Y - 0.25, TRUSS_Z])[1];
  ctx.fillStyle = '#0c0e20';
  ctx.fillRect(0, y0 - 6, SW, 10); ctx.fillRect(0, y1 - 4, SW, 9);
  ctx.strokeStyle = '#0c0e20'; ctx.lineWidth = 5; ctx.beginPath();
  for (let x = -40, k = 0; x < SW + 60; x += 52, k++) { ctx.moveTo(x, k % 2 ? y0 : y1); ctx.lineTo(x + 52, k % 2 ? y1 : y0); }
  ctx.stroke();
  ctx.fillStyle = 'rgba(120,130,190,0.35)'; ctx.fillRect(0, y1 + 3, SW, 2);
  // the two projectors
  for (const [P, dir] of [[PJ_A, 1], [PJ_B, -1]]) {
    const c = proj(P);
    ctx.fillStyle = '#0c0e20'; ctx.fillRect(c[0] - 4, y1, 8, c[1] - y1 - 20);
    ctx.fillStyle = '#1b1f3a'; ctx.beginPath(); ctx.roundRect(c[0] - 46, c[1] - 30, 92, 58, 12); ctx.fill();
    ctx.fillStyle = '#272c50'; ctx.beginPath(); ctx.roundRect(c[0] - 46, c[1] - 30, 92, 14, [12, 12, 0, 0]); ctx.fill();
    ctx.fillStyle = '#12142a';
    for (let i = 0; i < 4; i++) ctx.fillRect(c[0] - dir * 30 - 2 + i * 6 * -dir, c[1] - 2, 3, 18);
    const L = lensOf(P, dir);
    ctx.fillStyle = '#3b4170'; ctx.beginPath(); ctx.arc(L[0], L[1], 19, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a0b18'; ctx.beginPath(); ctx.arc(L[0], L[1], 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff5a6e'; ctx.beginPath(); ctx.arc(c[0] - dir * 34, c[1] - 22, 2.5, 0, Math.PI * 2); ctx.fill();
  }
}

function person(ctx, x, top, s, o = {}) {
  const hr = 31 * s;
  ctx.beginPath();
  ctx.arc(x, top + hr, hr, 0, Math.PI * 2);
  if (o.bun) ctx.arc(x + o.bun * hr * 0.7, top + hr * 0.25, hr * 0.42, 0, Math.PI * 2);
  ctx.fill();
  if (o.cap) { ctx.beginPath(); ctx.ellipse(x + o.cap * hr * 0.5, top + hr * 0.62, hr * 1.25, hr * 0.32, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.roundRect(x - 13 * s, top + hr * 1.6, 26 * s, 30 * s, 6 * s); ctx.fill();
  ctx.beginPath(); ctx.roundRect(x - 82 * s * (o.wide || 1), top + hr * 2.25, 164 * s * (o.wide || 1), 600, [58 * s, 58 * s, 0, 0]); ctx.fill();
}
function paintCrowd(ctx, rimCtx) {
  const ink = '#090b1b';
  ctx.fillStyle = ink;
  const people = [
    [104, 1548, 1.34, { bun: -1 }], [318, 1512, 1.04, {}], [506, 1546, 1.2, { cap: 1 }],
    [712, 1500, 1.0, { bun: 1 }], [902, 1546, 1.26, {}], [1062, 1590, 1.4, { cap: -1 }],
  ];
  for (const [x, y, s, o] of people) person(ctx, x, y, s, o);
  person(ctx, 712, 1410, 0.58, {});                        // a child on shoulders
  // a raised phone, filming the wall
  ctx.save(); ctx.translate(902, 1640); ctx.rotate(0.36);
  ctx.beginPath(); ctx.roundRect(-13, -175, 26, 185, 13); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(PHONE[0], PHONE[1]); ctx.rotate(0.08);
  ctx.fillStyle = '#141830'; ctx.beginPath(); ctx.roundRect(-24, -40, 48, 80, 8); ctx.fill(); ctx.restore();
  rimCtx.lineCap = 'round';
  for (const [x, y, s] of [...people, [712, 1410, 0.58]]) {
    const hr = 31 * s;
    rimCtx.strokeStyle = 'rgba(255,214,170,0.95)'; rimCtx.lineWidth = 3.2 * s;
    rimCtx.beginPath(); rimCtx.arc(x, y + hr, hr - 1.5 * s, Math.PI * 1.12, Math.PI * 1.88); rimCtx.stroke();
    rimCtx.lineWidth = 2.6 * s; rimCtx.strokeStyle = 'rgba(255,214,170,0.6)';
    rimCtx.beginPath(); rimCtx.moveTo(x - 64 * s, y + hr * 2.25 + 4 * s); rimCtx.quadraticCurveTo(x, y + hr * 2.25 - 3 * s, x + 64 * s, y + hr * 2.25 + 4 * s); rimCtx.stroke();
  }
}
const PHONE = [968, 1448];

// ---------------------------------------------------------------- what is projected at time t
function facadeA(ox, oy, S, cx, cy, sx = 1, sy = 1) {
  return mul(Tm(ox + S * cx, oy - S * cy), Sm(S * sx, -S * sy));
}
function itemsAt(t) {
  const out = [];
  // ---- beat 1: 「이 골목도」 along the brick wall, round the inner corner, onto the plaster wall (one strip coordinate)
  {
    const ph = PH[0], S = 1.42, vC = 6.72;
    const oy = vC + S * (ph.minY + ph.maxY) / 2;
    const xRest = WL + 0.5 - S * ph.minX, xStart = 3.6 - S * ph.maxX;
    const n = ph.syl.length;
    ph.syl.forEach((g, i) => {
      const p = clamp((t - T1 - 0.06 * (n - 1 - i)) / T1D);
      if (p <= 0) return;
      const e = ease.outCubic(p);
      let x = lerp(xStart, xRest, e);
      const speed = 3 * (1 - p) * (1 - p);
      const q = clamp((t - T_OUT - 0.05 * (n - 1 - i)) / 0.42);
      let a = 1;
      if (q > 0) { x += 10 * q * q * q; a = 1 - clamp((q - 0.55) / 0.45); }
      if (a <= 0) return;
      out.push({ g, space: 'strip', A: facadeA(x, oy, S, g.cx, g.cy, 1 + 0.22 * speed + 0.3 * q, 1 - 0.05 * speed), L: LIGHT_W, a });
    });
  }
  // ---- beat 2: 「누군가의」 falls down the brick wall, through every ledge, and lands on the ground-floor cornice
  {
    const ph = PH[1], S = 1.36, uC = 8.15, bottom = 4.08;
    const ox = uC - S * (ph.minX + ph.maxX) / 2;
    ph.syl.forEach((g, i) => {
      const t0 = T2 + 0.085 * i, Hd = 12.4, gr = 30, tf = Math.sqrt(2 * Hd / gr);
      const tau = t - t0;
      if (tau <= 0) return;
      const hh = S * (g.bb[3] - g.bb[1]);            // ink height of this syllable
      let vb = bottom, sx = 1, sy = 1, a = 1;
      if (tau < tf) { vb = bottom + Hd - 0.5 * gr * tau * tau; sy = 1 + 0.16 * (tau / tf); sx = 1 - 0.05 * (tau / tf); }
      else {
        const k = tau - tf;
        vb = bottom + 0.42 * Math.exp(-5.5 * k) * Math.abs(Math.sin(9.5 * k));
        const sq = 0.24 * Math.exp(-8 * k) * Math.cos(13 * k);
        sy = 1 - sq; sx = 1 + 0.6 * sq;
      }
      const q = t - (T_OUT + 0.06 + 0.05 * i);
      if (q > 0) { vb -= 0.5 * 36 * q * q; a = clamp(1 - (q - 0.25) / 0.2); }
      if (a <= 0) return;
      const vc = vb + hh * sy / 2;
      out.push({ g, space: 'L', A: mul(Tm(ox + S * g.cx, vc), Sm(S * sx, -S * sy)), L: LIGHT_W, a });
    });
  }
  // ---- beat 3: 「무대였다」 window by window (2 × 2 grid of blinds), 무대 in the accent
  {
    const ph = PH[2], S = 1.22;
    const cells = [[6.0, 9.6], [9.0, 9.6], [6.0, 6.6], [9.0, 6.6]];
    ph.syl.forEach((g, k) => {
      const tk = T3 + T3S * k, tau = t - tk;
      if (tau <= 0) return;
      const [u, fb] = cells[k];
      const out0 = t - (T_OUT + 0.05 * (3 - k));
      let s = 0.5 + 0.5 * ease.outBack(clamp(tau / 0.34), 1.8), a = clamp(tau / 0.06);
      if (out0 > 0) { s *= 1 - 0.18 * clamp(out0 / 0.2); a *= 1 - clamp(out0 / 0.2); }
      if (a > 0) out.push({ g, space: 'L', A: mul(Tm(u, fb + 1.6), Sm(S * s, -S * s)), L: k < 2 ? LIGHT_A : LIGHT_W, a });
      const fl = 0.95 * tail(tau, 0.11);
      if (fl > 0.01) out.push({ g: SQUARE, space: 'L', A: mul(Tm(u, fb + 1.6), Sm(1.6, 1.6)), L: k < 2 ? LIGHT_A : LIGHT_W, a: fl });
    });
  }
  // ---- climax: one sentence set in SCREEN space, pulled onto every wall by H⁻¹; shards slide along each wall and click
  for (let l = 0; l < 3; l++) {
    const ln = CL[l], ts = T_IN + 0.11 * l;
    const p = clamp((t - ts) / (T_LOCK - ts));
    if (p <= 0) continue;
    const e = snap(p), k = 1 - e;
    const a = clamp((t - ts) / 0.22);
    const off = {
      L: [-(6.0 + 2.2 * l) * k, [1.6, -1.2, 1.0][l] * k],
      R: [(6.0 + 2.2 * l) * k, [-1.3, 1.4, -1.5][l] * k],
    };
    const ph = ln.ph, S = ln.size;
    const ox = ln.x - S * (ph.minX + ph.maxX) / 2, oy = ln.y - S * (ph.minY + ph.maxY) / 2;
    ph.syl.forEach((g, i) => {
      const accent = l === 2 && i < 2;
      out.push({ g, space: 'screen', off, A: mul(Tm(ox + S * g.cx, oy + S * g.cy), Sm(S, S)), L: accent ? LIGHT_A : LIGHT_W, a, glint: true });
    });
  }
  return out;
}
function contentToWall(it, f) {
  switch (it.space) {
    case 'L': return f.id === 'L' ? I3 : null;
    case 'R': return f.id === 'R' ? I3 : null;
    case 'strip': return f.id === 'L' ? I3 : Tm(-WL, 0);
    case 'screen': { const o = it.off ? it.off[f.id] : [0, 0]; return mul(Tm(o[0], o[1]), f.Hi); }
  }
  return null;
}

// global light level: lenses open, the lock flash, a gentle dim at the very end
function lightGain(t) {
  const on = clamp((t - T_ON) / 0.35);
  const flash = 0.55 * tail(t - T_LOCK, 0.22);
  const dim = 1 - 0.22 * clamp((t - 9.35) / 0.65);
  return on * (1 + flash) * dim;
}
function glintAt(t) { const p = (t - T_GLINT) / 1.0; return p < 0 || p > 1 ? null : lerp(-0.25, 1.25, ease.inOutCubic(p)); }

// ---------------------------------------------------------------- the light pass
function colorFor(tint, L, k, a) {
  const c = (v) => Math.round(255 * clamp(v));
  return `rgba(${c(tint[0] * L[0] * k)},${c(tint[1] * L[1] * k)},${c(tint[2] * L[2] * k)},${a.toFixed(4)})`;
}
function glintStyle(ctx, tint, L, k, a, g) {
  const gr = ctx.createLinearGradient(-200, 1300, 1280, 520);
  const base = colorFor(tint, L, k, a), hot = colorFor(mix(tint, [1, 1, 1], 0.7), mix(L, [1, 1, 1], 0.6), 1.25, a);
  const s = (x) => clamp(x);
  gr.addColorStop(0, base);
  gr.addColorStop(s(g - 0.045), base); gr.addColorStop(s(g), hot); gr.addColorStop(s(g + 0.045), base);
  gr.addColorStop(1, base);
  return gr;
}

function lightPass(t) {
  const ctx = lctx;
  resetCtx(ctx);
  ctx.clearRect(0, 0, SW, SH);
  const items = itemsAt(t);
  const gain = lightGain(t);
  const gl = glintAt(t);
  const pieces = { L: [], R: [] };
  for (const f of FACES) {
    const its = [];
    for (const it of items) {
      const C = contentToWall(it, f);
      if (!C) continue;
      const M0 = mul(C, it.A);
      const wb = bboxThrough(it.g.bb, M0);
      if (!overlaps(wb, f.wallRect)) continue;
      its.push({ it, M0, wb });
    }
    if (!its.length) continue;
    const k = gain * f.gain;
    const style = (tint, it) => (it.glint && gl !== null ? glintStyle(ctx, tint, it.L, k, it.a, gl) : colorFor(tint, it.L, k, it.a));
    // 1) the wall plane
    ctx.save(); ctx.clip(f.wallClip);
    for (const e of its) { ctx.fillStyle = style(f.tint, e.it); fillGlyph(ctx, e.it.g, mul(f.H, e.M0)); }
    ctx.restore();
    // 2) what the architecture removes: glass, ledge footprints, the shadow under each ledge, sash rails
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000'; ctx.fill(f.cutPath);
    ctx.globalCompositeOperation = 'source-over';
    // 3) the sub-surfaces, each with its own projector-ray mapping
    for (const s of f.subs) {
      let any = false;
      for (const e of its) if (overlaps(e.wb, s.src)) { any = true; break; }
      if (!any) continue;
      ctx.save(); ctx.clip(s.clip);
      for (const e of its) if (overlaps(e.wb, s.src)) { ctx.fillStyle = style(s.tint, e.it); fillGlyph(ctx, e.it.g, mul(s.H, e.M0)); }
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'destination-out';
    for (const r of f.rails) { ctx.beginPath(); polyTo(ctx, r); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    // pieces for beams, dust and spill
    for (const e of its) {
      if (e.it.g === SQUARE) continue;
      const wb = isect(e.wb, [f.vis[0] - 0.5, 0, f.vis[1] + 0.5, f.top]);
      if (!(wb[2] > wb[0] && wb[3] > wb[1])) continue;
      const q = [f.scr(wb[0], wb[1]), f.scr(wb[2], wb[1]), f.scr(wb[2], wb[3]), f.scr(wb[0], wb[3])];
      const sb = [Math.min(...q.map((p) => p[0])), Math.min(...q.map((p) => p[1])), Math.max(...q.map((p) => p[0])), Math.max(...q.map((p) => p[1]))];
      pieces[f.id].push({ wb, sb, q, a: e.it.a * gain, L: e.it.L });
    }
  }
  // mapping trace: the projector "finds" the architecture first — outlines sweep out from the corner
  const tr = clamp((t - 0.3) / 0.25) * (1 - clamp((t - 1.25) / 0.45));
  if (tr > 0) {
    ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    for (const f of FACES) {
      for (const ln of f.lines) {
        const p = clamp((t - 0.32 - 0.075 * ln.d) / 0.32);
        if (p <= 0) continue;
        const a = f.scr(ln.a[0], ln.a[1], ln.w), b0 = f.scr(ln.b[0], ln.b[1], ln.w);
        const e = ease.outCubic(p), b = [lerp(a[0], b0[0], e), lerp(a[1], b0[1], e)];
        ctx.strokeStyle = colorFor(f.tint, [0.85, 0.95, 1.0], 0.9, 0.85 * tr);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
    }
  }
  // the seam flash: at the lock the inner corner line glows for a moment
  const seam = tail(t - T_LOCK, 0.28);
  if (seam > 0.01) {
    const a = FL.scr(WL, 0.4), b = FL.scr(WL, 9.8);
    const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
    g.addColorStop(0, 'rgba(255,240,220,0)'); g.addColorStop(0.5, `rgba(255,240,220,${(0.9 * seam).toFixed(3)})`); g.addColorStop(1, 'rgba(255,240,220,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 3 + 6 * seam; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
  return pieces;
}

// ---------------------------------------------------------------- beams, shafts, dust, spill
function convexHull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function drawBeams(ctx, t, pieces) {
  const g = lightGain(t);
  if (g <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  for (const f of FACES) {
    const L = lensOf(f.P, f.id === 'R' ? 1 : -1);
    // the whole beam, faint
    const wv = f.quad([f.vis[0], 0, f.vis[1], f.top]);
    const hull = convexHull([L, ...wv]);
    const rg = ctx.createRadialGradient(L[0], L[1], 0, L[0], L[1], 1500);
    rg.addColorStop(0, `rgba(255,236,205,${(0.17 * g).toFixed(3)})`);
    rg.addColorStop(0.3, `rgba(255,236,205,${(0.055 * g).toFixed(3)})`);
    rg.addColorStop(1, 'rgba(255,236,205,0)');
    fillPoly(ctx, hull, rg);
    // a shaft toward every lit piece: the image travelling through the haze
    const nP = pieces[f.id].length, kP = Math.min(1, 3.5 / Math.max(1, nP));
    for (const pc of pieces[f.id]) {
      let amin = Infinity, amax = -Infinity, pmin, pmax;
      for (const q of pc.q) { const an = Math.atan2(q[1] - L[1], q[0] - L[0]); if (an < amin) { amin = an; pmin = q; } if (an > amax) { amax = an; pmax = q; } }
      const cxy = [(pc.sb[0] + pc.sb[2]) / 2, (pc.sb[1] + pc.sb[3]) / 2];
      const sg = ctx.createLinearGradient(L[0], L[1], cxy[0], cxy[1]);
      const col = mix([255, 240, 215], [255, 120, 150], pc.L === LIGHT_A ? 0.7 : 0);
      sg.addColorStop(0, rgb(col, 0.0)); sg.addColorStop(0.3, rgb(col, 0.035 * pc.a * kP)); sg.addColorStop(1, rgb(col, 0.07 * pc.a * kP));
      fillPoly(ctx, [L, pmin, pmax], sg);
    }
  }
  ctx.globalCompositeOperation = 'source-over';
}
function drawDust(ctx, t, pieces) {
  const g = lightGain(t);
  if (g <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  const flash = tail(t - T_LOCK, 0.4);
  for (const d of dust) {
    const f = d.f;
    const X = [d.p[0] + d.v[0] * t + d.amp * Math.sin(d.w * t + d.ph), d.p[1] + d.v[1] * t + d.amp * 0.6 * Math.cos(d.w * 0.8 * t + d.ph), d.p[2] + d.v[2] * t];
    // which wall point the projector ray through this grain lands on
    const rel = sub(X, f.O), w = dot(f.n, rel), u = dot(f.U, rel), v = X[1];
    if (w <= 0.2 || w >= f.Dp) continue;
    const s = f.Dp / (f.Dp - w);
    const tu = f.pu + s * (u - f.pu), tv = f.pv + s * (v - f.pv);
    let lit = 0;
    for (const pc of pieces[f.id]) if (tu > pc.wb[0] && tu < pc.wb[2] && tv > pc.wb[1] && tv < pc.wb[3]) { lit = Math.max(lit, pc.a); }
    const inBeam = tu > f.vis[0] - 1 && tu < f.vis[1] + 1 && tv > 0 && tv < f.top;
    if (!inBeam) continue;
    const tw = 0.55 + 0.45 * Math.sin(d.tw * t + d.ph * 3);
    const b = g * (0.16 + 0.84 * lit + 0.5 * flash) * tw;
    if (b < 0.03) continue;
    const q = proj(X), r = clamp(11 / X[2], 0.7, 2.4) * d.size;
    ctx.fillStyle = `rgba(255,236,206,${clamp(b * 0.9).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, Math.PI * 2); ctx.fill();
    if (b > 0.5) { ctx.fillStyle = `rgba(255,226,190,${(0.12 * b).toFixed(3)})`; ctx.beginPath(); ctx.arc(q[0], q[1], r * 3.2, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.globalCompositeOperation = 'source-over';
}
function drawSpill(ctx, t, pieces) {
  ctx.globalCompositeOperation = 'lighter';
  for (const f of FACES) {
    for (const pc of pieces[f.id]) {
      const uc = clamp((pc.wb[0] + pc.wb[2]) / 2, f.vis[0], f.vis[1]);
      const vlow = pc.wb[1], hgt = Math.max(0.1, Math.min(pc.wb[3], f.top) - Math.max(pc.wb[1], 0));
      const amt = pc.a * clamp(hgt * Math.min(pc.wb[2] - pc.wb[0], 7) / 6) / (1 + Math.max(0, vlow) / 3.5);
      if (amt < 0.02) continue;
      const B = f.pt(uc, 0, 0.9), P0 = f.scr(uc, 0, 0), q = proj(B);
      const halfW = Math.abs(f.scr(pc.wb[2], 0)[0] - f.scr(pc.wb[0], 0)[0]) * 0.6 + 40;
      const ry = Math.max(30, (q[1] - P0[1]) * 2.4);
      const col = [255 * f.tint[0] * pc.L[0], 255 * f.tint[1] * pc.L[1], 255 * f.tint[2] * pc.L[2]];
      ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(1, ry / halfW);
      const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, halfW);
      rg.addColorStop(0, rgb(col, 0.2 * amt)); rg.addColorStop(1, rgb(col, 0));
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, halfW, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- lamps in windows
function lampLevel(on, t) {
  if (on < 0) return 1;
  const k = t - on;
  if (k <= 0) return 0;
  if (k < 0.05) return 0.8; if (k < 0.1) return 0.15;           // a filament stutter
  return clamp(0.6 + (k - 0.1) / 0.25);
}
function drawLamps(ctx, t) {
  for (const lp of lampPaths) {
    const a = lp.grid ? (t >= lp.grid ? 0.22 * clamp((t - lp.grid) / 0.12) : 0) : lampLevel(lp.on, t);
    if (a <= 0) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = lp.style; ctx.fill(lp.path);
    if (lp.curtain) { ctx.fillStyle = 'rgba(120,60,40,0.55)'; ctx.fill(lp.curtain); }
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- demo
defineDemo({
  id: '112-projection-map',
  title: '이 골목도 무대였다',
  tech: '프로젝션 매핑 타이포그래피 · 건물 면의 호모그래피와 아나모픽',
  duration: D,
  background: '#080b24',
  async setup(api) {
    const H = api.headless;
    font = await loadOutlineFont('Pretendard-Black');
    PH = ['이 골목도', '누군가의', '무대였다'].map((s) => layoutPhrase(font, s));
    CL = [
      { ph: PH[0], size: 162, x: 546, y: 716 },
      { ph: PH[1], size: 172, x: 514, y: 940 },
      { ph: PH[2], size: 206, x: 540, y: 1174 },
    ];
    FL = makeFacade(BRICK); FR = makeFacade(PLASTER);
    FACES = [FL, FR];
    for (const f of FACES) buildSurfaces(f);

    // festoon strings across the yard (3D catenaries; bulbs every ~0.55 m)
    festoon = [
      { a: FL.pt(WL - 6.6, 11.2), b: FR.pt(5.8, 10.1), sag: 1.3 },
      { a: FL.pt(WL - 3.4, 13.0), b: FR.pt(2.4, 10.3), sag: 0.9 },
    ].map((s, i) => {
      const pts = festoonPath(s.a, s.b, s.sag, 40);
      const len = Math.hypot(...sub(s.b, s.a)), nb = Math.round(len / 0.55);
      const bulbs = festoonPath(s.a, s.b, s.sag, nb).slice(1, -1).map((p) => [p[0], p[1] - 0.09, p[2]]);
      return { pts, bulbs, i };
    });

    // lamp layers (warm rooms behind blinds / glass)
    lampPaths = [];
    for (const [id, idx, on] of LAMPS) {
      const f = id === 'L' ? FL : FR, win = f.windows[idx];
      const p = orientedPath([win.seenPoly]);
      const top = f.scr(win.c ?? (win.r[0] + win.r[2]) / 2, win.r[3], -win.depth), bot = f.scr(win.c ?? (win.r[0] + win.r[2]) / 2, win.r[1], -win.depth);
      lampPaths.push({ path: p, on, win, f, top, bot });
    }
    // the four grid windows: their rooms light up with the letters
    for (let k = 0; k < 4; k++) {
      const [u, fb] = [[6.0, 9.6], [9.0, 9.6], [6.0, 6.6], [9.0, 6.6]][k];
      const win = FL.windows.find((w) => w.kind === 'blind' && w.c === u && w.fb === fb);
      lampPaths.push({ path: orientedPath([win.seenPoly]), grid: T3 + T3S * k + 0.04, win, f: FL,
        top: FL.scr(u, win.r[3], -win.depth), bot: FL.scr(u, win.r[1], -win.depth) });
    }

    // canvases
    const attrs = H ? { willReadFrequently: true } : undefined;
    main = api.canvas({ z: 1, attrs }).ctx;
    ({ c: lc, ctx: lctx } = canvas2d(SW, SH, H));
    g1 = canvas2d(540, 960, H); g2 = canvas2d(270, 480, H); g3 = canvas2d(135, 240, H);
    for (const lp of lampPaths) {
      const gr = main.createLinearGradient(lp.top[0], lp.top[1], lp.bot[0], lp.bot[1]);
      const k = lp.win.kind;
      gr.addColorStop(0, k === 'blind' ? '#f0b765' : k === 'shop' ? '#c98a4e' : '#ffcf7e');
      gr.addColorStop(1, k === 'blind' ? '#c98a4c' : k === 'shop' ? '#7e4a36' : '#f39a4f');
      lp.style = gr;
      if (lp.win.kind === 'glass') {
        const r = lp.win.r, d = -lp.win.depth;
        const wdt = r[2] - r[0];
        lp.curtain = orientedPath([lp.f.quad([r[0], r[1], r[0] + 0.28 * wdt, r[3]], d), lp.f.quad([r[2] - 0.18 * wdt, r[1], r[2], r[3]], d)]);
      }
    }

    const R = rand(11206);
    ({ ctx: base } = canvas2d(SW, SH, H)); paintBase(base, R);
    ({ ctx: detail } = canvas2d(SW, SH, H)); paintDetail(detail, rand(11207));
    ({ ctx: fgTop } = canvas2d(SW, SH, H)); paintTop(fgTop);
    ({ ctx: crowd } = canvas2d(SW, SH, H)); ({ ctx: rim } = canvas2d(SW, SH, H)); paintCrowd(crowd, rim);
    ({ ctx: vignette } = canvas2d(SW, SH, H));
    {
      const v = vignette, vg = v.createRadialGradient(540, 860, 420, 540, 900, 1250);
      vg.addColorStop(0, 'rgba(4,4,16,0)'); vg.addColorStop(1, 'rgba(4,4,16,0.5)');
      v.fillStyle = vg; v.fillRect(0, 0, SW, SH);
      const bg = v.createLinearGradient(0, 1600, 0, SH);
      bg.addColorStop(0, 'rgba(4,4,14,0)'); bg.addColorStop(1, 'rgba(4,4,14,0.6)');
      v.fillStyle = bg; v.fillRect(0, 1600, SW, SH - 1600);
    }

    // dust: grains placed along the projector rays toward each wall, drifting slowly (closed form in t)
    const RD = rand(11208);
    dust = [];
    for (let i = 0; i < 700; i++) {
      const f = i % 2 ? FL : FR;
      const T3d = f.pt(lerp(f.vis[0], f.vis[1], RD()), 0.3 + RD() * 11.5);
      const s = 0.12 + 0.82 * Math.pow(RD(), 0.8);
      const p = add(f.P, scl(sub(T3d, f.P), s));
      dust.push({ f, p, v: [(RD() - 0.5) * 0.16, 0.02 + RD() * 0.06, (RD() - 0.5) * 0.1], amp: 0.04 + RD() * 0.1, w: 0.6 + RD() * 1.6,
        ph: RD() * 6.283, tw: 2 + RD() * 7, size: 0.7 + RD() * 0.7 });
    }

    // warm the offscreen canvases once (README: first composite of an offscreen canvas can change its AA)
    this.frame(0); this.frame(T_LOCK);
  },
  frame(t) {
    const ctx = main;
    resetCtx(ctx);
    ctx.drawImage(base.canvas, 0, 0);
    drawLamps(ctx, t);
    // projected light: added onto the wall colour, then the wall texture is multiplied back in
    const pieces = lightPass(t);
    resetCtx(ctx);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(lc, 0, 0);
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(detail.canvas, 0, 0);
    // bloom: a 2× mip chain of the light layer
    for (const [dst, src, w, h] of [[g1, lc, 540, 960], [g2, g1.c, 270, 480], [g3, g2.c, 135, 240]]) {
      resetCtx(dst.ctx); dst.ctx.clearRect(0, 0, w, h); dst.ctx.drawImage(src, 0, 0, w, h);
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.42; ctx.drawImage(g2.c, 0, 0, SW, SH);
    ctx.globalAlpha = 0.5; ctx.drawImage(g3.c, 0, 0, SW, SH);
    ctx.globalAlpha = 1;
    drawSpill(ctx, t, pieces);
    drawBeams(ctx, t, pieces);
    drawDust(ctx, t, pieces);
    // festoon bulbs
    ctx.globalCompositeOperation = 'lighter';
    for (const s of festoon) s.bulbs.forEach((b, j) => {
      const q = proj(b), k = F / b[2];
      const tw = 0.78 + 0.22 * Math.sin(t * (1.3 + (j % 5) * 0.37) + j * 1.9 + s.i);
      const rg = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], 0.42 * k);
      rg.addColorStop(0, `rgba(255,210,130,${(0.55 * tw).toFixed(3)})`); rg.addColorStop(1, 'rgba(255,190,110,0)');
      ctx.fillStyle = rg; ctx.fillRect(q[0] - 0.42 * k, q[1] - 0.42 * k, 0.84 * k, 0.84 * k);
    });
    ctx.globalCompositeOperation = 'source-over';
    for (const s of festoon) s.bulbs.forEach((b, j) => {
      const q = proj(b), k = F / b[2];
      ctx.fillStyle = (j + s.i) % 4 === 0 ? '#ff9aa8' : '#ffe1a0';
      ctx.beginPath(); ctx.arc(q[0], q[1], Math.max(2.2, 0.065 * k), 0, Math.PI * 2); ctx.fill();
    });
    ctx.drawImage(fgTop.canvas, 0, 0);
    // lens glow
    const g = lightGain(t);
    if (g > 0) {
      ctx.globalCompositeOperation = 'lighter';
      for (const [P, dir] of [[PJ_A, 1], [PJ_B, -1]]) {
        const L = lensOf(P, dir), r = 46 + 40 * tail(t - T_LOCK, 0.3);
        const rg = ctx.createRadialGradient(L[0], L[1], 0, L[0], L[1], r);
        rg.addColorStop(0, `rgba(255,248,232,${clamp(0.95 * g).toFixed(3)})`); rg.addColorStop(0.25, `rgba(255,232,200,${(0.45 * g).toFixed(3)})`); rg.addColorStop(1, 'rgba(255,220,180,0)');
        ctx.fillStyle = rg; ctx.fillRect(L[0] - r, L[1] - r, 2 * r, 2 * r);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    // the crowd, rim-lit by the walls
    ctx.drawImage(crowd.canvas, 0, 0);
    let lum = 0;
    for (const id of ['L', 'R']) for (const pc of pieces[id]) lum += pc.a * clamp((pc.sb[2] - pc.sb[0]) * (pc.sb[3] - pc.sb[1]) / 60000);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(0.12 + 0.35 * clamp(lum) + 0.4 * tail(t - T_LOCK, 0.35));
    ctx.drawImage(rim.canvas, 0, 0);
    ctx.globalAlpha = 1;
    // the phone screen shows a tiny bright copy of the wall
    ctx.save(); ctx.translate(PHONE[0], PHONE[1]); ctx.rotate(0.08);
    ctx.fillStyle = `rgba(255,228,200,${(0.22 + 0.4 * clamp(lum)).toFixed(3)})`;
    ctx.beginPath(); ctx.roundRect(-19, -34, 38, 68, 5); ctx.fill(); ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(vignette.canvas, 0, 0);
  },
});
