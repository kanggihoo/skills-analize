/*
 * 76 · tree.js — the tree as data, the wind as tables, the petals as closed-form paths.
 * Nothing in here draws (main.js does) and nothing reads a clock: every function takes t.
 *
 *   growTree(rnd)            → branches in DFS order (a parent always comes before its children)
 *   makeWind(noise)          → gust envelope, cumulative drift X(t), per-depth bend response x_d(t) (tables)
 *   computePose(B, t, wind)  → local angle / length / width + world base and angle of every branch at t
 *   petalAt(pt, t, …)        → where a released petal is at t (closed form, clamped at its landing time)
 */
import { track, ease, clamp } from '../_lib/stage.js';

export const W = 1080, H = 1920, D = 10;
export const SEED = 4417, NOISE_SEED = 2203;

// ---- ground ------------------------------------------------------------------------------------------
export const TX = 512;
/** crest of the meadow (y down); a gentle knoll under the tree */
export const groundY = (x) =>
  1548 + 15 * Math.sin(x / 205 + 0.4) + 8 * Math.sin(x / 83 + 2.3) - 20 * Math.exp(-(((x - TX) / 240) ** 2));
export const TY = groundY(TX) + 9;

// ---- wind --------------------------------------------------------------------------------------------
// calm → a breeze while the blossoms open → one strong gust (the peak) → it passes and the tree springs back
export const gust = track([
  [0, 0.1], [3.3, 0.14], [4.65, 0.34], [5.3, 1.0, ease.outCubic], [6.35, 0.92], [7.35, 0.22], [8.5, 0.12], [10.6, 0.1],
]);
const WT0 = -2, WT1 = 10.6, WR = 240;                       // table range (s) and resolution (samples/s)
const WN = Math.ceil((WT1 - WT0) * WR) + 1;
export const NDEPTH = 10;                                     // depth classes with their own spring
const freq = (d) => 0.38 + 0.11 * d;                         // Hz: the trunk sways slowly, twigs quickly
const damp = (d) => 0.2 + 0.012 * d;                         // damping ratio
const LAG = 0.035;                                           // s of delay per depth (the gust reaches the tips later)
const driftV = (f) => 20 + 400 * f;                          // px/s of air carrying a petal at force f

export function makeWind(noise) {
  const F = new Float32Array(WN), X = new Float32Array(WN);
  for (let i = 0; i < WN; i++) {
    const t = WT0 + i / WR;
    F[i] = gust(t) * (0.6 + 0.8 * noise(t * 0.85 + 31.7, 5.3) + 0.35 * (noise(t * 2.6 + 3.3, 8.8) - 0.5));
  }
  for (let i = 1; i < WN; i++) X[i] = X[i - 1] + (driftV(F[i - 1]) + driftV(F[i])) / (2 * WR);
  // each depth class is a damped spring driven by the (delayed) force — overshoot and spring-back come from here
  const resp = [];
  for (let d = 0; d < NDEPTH; d++) {
    const r = new Float32Array(WN), w = 2 * Math.PI * freq(d), z = damp(d), lag = Math.round(d * LAG * WR);
    let x = F[0], v = 0;
    const SUB = 4, h = 1 / (WR * SUB);
    for (let i = 0; i < WN; i++) {
      const f = F[Math.max(0, i - lag)];
      for (let k = 0; k < SUB; k++) { v += (w * w * (f - x) - 2 * z * w * v) * h; x += v * h; }
      r[i] = x;
    }
    resp.push(r);
  }
  const look = (a, t) => {
    const u = clamp((t - WT0) * WR, 0, WN - 1.001), i = Math.floor(u), f = u - i;
    return a[i] + (a[i + 1] - a[i]) * f;
  };
  return {
    env: gust,
    force: (t) => look(F, t),
    drift: (t) => look(X, t),
    bend: (d, t) => look(resp[d < NDEPTH ? d : NDEPTH - 1], t),
  };
}

// ---- the tree ----------------------------------------------------------------------------------------
const MAXD = 8, MINLEN = 15, BUDGET = 1300;
const durOf = (d) => 0.5 * Math.pow(0.86, d) + 0.2;          // s to grow one branch at depth d

/** Recursive branching with an umbrella bias (cherry crowns spread outward and level off with depth). */
export function growTree(rnd) {
  const B = [];
  const node = (parent, depth, len, ang, thick, at, birth) => {
    const b = {
      id: B.length, parent: parent ? parent.id : -1, depth, len, ang, A: (parent ? parent.A : 0) + ang,
      thick, at, birth, dur: durOf(depth), kids: [], twig: false,
    };
    B.push(b);
    if (parent) parent.kids.push(b);
    return b;
  };
  const grow = (b) => {
    const { depth, len, A, thick } = b;
    if (depth >= MAXD || len < MINLEN || B.length > BUDGET) { b.twig = true; return; }
    const born = (at) => b.birth + b.dur * (0.2 + 0.32 * at);
    const sgn = Math.abs(A) > 0.05 ? Math.sign(A) : rnd() < 0.5 ? -1 : 1;
    const target = sgn * Math.min(1.45, 0.3 + 0.17 * depth);  // world angle this depth leans toward
    const kids = [];
    kids.push(node(b, depth + 1, len * (0.68 + 0.12 * rnd()), (target - A) * 0.2 + (rnd() - 0.5) * 0.42,
      thick * (0.72 + 0.08 * rnd()), 1, born(1)));
    const n = (rnd() < (depth < 5 ? 0.88 : 0.62) ? 1 : 0) + (rnd() < (depth < 3 ? 0.38 : 0.1) ? 1 : 0);
    let s = rnd() < 0.5 ? -1 : 1;
    for (let k = 0; k < n; k++, s = -s) {
      const at = 0.42 + 0.5 * rnd();
      kids.push(node(b, depth + 1, len * (0.48 + 0.18 * rnd()), s * (0.36 + 0.46 * rnd()) + (target - A) * 0.1,
        thick * (0.5 + 0.12 * rnd()), at, born(at)));
    }
    for (const c of kids) grow(c);
  };
  // trunk → three limbs (and one low side shoot), then the generic rule
  const trunk = node(null, 0, 300, -0.035, 46, 0, -0.28);   // born before t = 0: a sprout at the first frame
  trunk.dur = 1.05;
  const limbs = [[-0.66, 0.8, 0.74], [0.07, 1, 0.8], [0.62, 0.93, 0.72]].map(([a, at, lf]) =>
    node(trunk, 1, 300 * lf * (0.92 + 0.16 * rnd()), a + (rnd() - 0.5) * 0.1, 27 + 4 * rnd(), at,
      trunk.birth + trunk.dur * (0.42 + 0.3 * at)));
  const shoot = node(trunk, 3, 92, 1.12, 6, 0.5, trunk.birth + trunk.dur * 0.62);
  for (const l of limbs) grow(l);
  grow(shoot);
  return B;
}

/** Scale lengths (and widths, gently) so the grown crown fits the box; returns the scale used. */
export function fitTree(B, box) {
  const P = makePose(B.length);
  computePose(B, 99, null, P);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity;
  for (const b of B) {
    const i = b.id, L = P.len[i];
    const x = P.x[i] + Math.sin(P.A[i]) * L, y = P.y[i] - Math.cos(P.A[i]) * L;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y);
  }
  const k = clamp(Math.min((TY - box.top) / (TY - y0), (TX - box.left) / (TX - x0), (box.right - TX) / (x1 - TX)), 0.6, 1.35);
  for (const b of B) { b.len *= k; b.thick *= Math.sqrt(k); }
  return k;
}

// ---- pose (forward kinematics) ------------------------------------------------------------------------
export function makePose(n) {
  return {
    a: new Float32Array(n), len: new Float32Array(n), w: new Float32Array(n), g: new Float32Array(n),
    x: new Float32Array(n), y: new Float32Array(n), A: new Float32Array(n),
  };
}

// length easing per depth: the trunk eases in and out, limbs ease out, twigs pop with a small overshoot
function growEase(d, u) {
  if (d === 0) return ease.inOutCubic(u);
  if (d < 4) return ease.outCubic(u);
  if (d < 6) return 1 - Math.pow(1 - u, 4);
  return ease.outBack(u, 1.25);
}

/** Wind-free if wind is null. flutter(b, t) adds the per-branch tremble (noise) when given. */
export function computePose(B, t, wind, P, flutter = null) {
  const env = wind ? wind.env(t) : 0;
  const bends = wind ? new Float32Array(NDEPTH) : null;
  if (wind) for (let d = 0; d < NDEPTH; d++) bends[d] = wind.bend(d, t);
  for (let i = 0; i < B.length; i++) {
    const b = B[i];
    const u = (t - b.birth) / b.dur;
    const g = u <= 0 ? 0 : u >= 1 ? 1 : growEase(b.depth, u);
    const L = b.len * g;
    // secondary growth: branches keep thickening for a while after they reach full length
    const wv = b.thick * (0.16 + 0.84 * ease.outCubic(clamp((t - b.birth) / (b.dur * 2.4))));
    let a = b.ang * (0.35 + 0.65 * ease.outCubic(clamp(u)));   // children unfurl from their parent's line
    if (wind) a += b.flex * b.cf * bends[b.depth < NDEPTH ? b.depth : NDEPTH - 1] + (flutter ? flutter(b, t, env) : 0);
    P.a[i] = a; P.len[i] = L; P.g[i] = g; P.w[i] = Math.min(wv, L * 0.4 + 0.8);
    if (b.parent < 0) { P.x[i] = TX; P.y[i] = TY; P.A[i] = a; }
    else {
      const q = b.parent, s = b.at * P.len[q], Aq = P.A[q];
      P.x[i] = P.x[q] + Math.sin(Aq) * s; P.y[i] = P.y[q] - Math.cos(Aq) * s; P.A[i] = Aq + a;
    }
  }
  return P;
}

/** Wind response constants per branch: thin branches bend more; the force acts across the branch (cos of its lean). */
export function prepareWind(B) {
  for (const b of B) {
    b.flex = 0.02 + 0.22 / (1 + b.thick / 2.5);
    b.cf = clamp(Math.cos(b.A), 0.25, 1);
    b.fr = 0.9 + 0.22 * b.depth;                              // tremble frequency
    b.fa = b.depth < 3 ? 0 : 0.008 * (b.depth - 2);           // tremble amplitude (rad); trunk and limbs do not tremble
  }
}

/** World position of a point on branch i: fraction s along it, offset `off` across it. */
export function onBranch(P, i, s, off) {
  const A = P.A[i], L = P.len[i] * s;
  return [P.x[i] + Math.sin(A) * L + Math.cos(A) * off, P.y[i] - Math.cos(A) * L + Math.sin(A) * off];
}

// ---- petals ------------------------------------------------------------------------------------------
/**
 * Closed-form flight from the release (x0, y0) at tr: a burst away from the flower, a lift, the wind's drift
 * (the precomputed integral of the air speed), a noise meander, a zig-zag flutter, and a fall speed that
 * eases in. After its landing time tl the petal lies still where it touched the grass.
 */
export function petalAt(pt, t, wind, noise, out) {
  if (t < pt.tr) return false;
  const tt = t < pt.tl ? t : pt.tl;
  const u = tt - pt.tr;
  const e1 = 1 - Math.exp(-u / 0.28), e2 = 1 - Math.exp(-u / 0.7), ramp = u < 0.9 ? u / 0.9 : 1;
  out.x = pt.x0 + pt.bx * e1 + pt.k * (wind.drift(tt) - pt.D0) + pt.ax * Math.sin(pt.wx * u + pt.px) * ramp
    + (noise(pt.ns, tt * 0.42) - 0.5) * pt.mz * ramp;
  out.y = pt.y0 + pt.by * e1 - pt.lift * e2 + pt.vf * (u - 0.45 * (1 - Math.exp(-u / 0.45)))
    + pt.ay * Math.sin(pt.wy * u + pt.py) * ramp;
  out.rot = pt.r0 + pt.spin * u + 0.6 * Math.sin(pt.wr * u + pt.pr);
  out.flip = Math.cos(pt.wf * u + pt.pf);
  out.landed = t >= pt.tl;
  return true;
}

/** Find the landing time by stepping then bisecting (setup only). Petals that leave the frame never land. */
export function landPetal(pt, wind, noise, tEnd = D + 0.5) {
  const o = {};
  pt.tl = Infinity;                                           // free flight while searching
  const below = (t) => { petalAt(pt, t, wind, noise, o); return o.y >= groundY(o.x) + pt.depth; };
  let prev = pt.tr;
  for (let i = 1; pt.tr + i / 60 <= tEnd; i++) {
    const t = pt.tr + i / 60;
    if (below(t)) {
      let a = prev, b = t;
      for (let k = 0; k < 14; k++) { const m = (a + b) / 2; if (below(m)) b = m; else a = m; }
      pt.tl = b;
      return;
    }
    if (o.x > W + 60 || o.x < -60) return;
    prev = t;
  }
}
