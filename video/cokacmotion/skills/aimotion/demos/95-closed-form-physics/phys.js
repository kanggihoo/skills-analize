/*
 * phys.js — closed-form motion for 95. Every function maps t → state directly: no stepping, no baked frames.
 * The builders run once in setup() and only solve for event times (contacts, stop times, decay rates) with
 * formulas; frame(t) then evaluates the pieces. Units: world px (x right, h up, z toward the viewer), seconds.
 *
 *   ground (x, z) → screen (x, z·SB − h·CB)     orthographic camera 40° above the table
 */
export const TAU = Math.PI * 2;
export const BETA = (40 * Math.PI) / 180;
export const SB = Math.sin(BETA), CB = Math.cos(BETA);
export const G = 3600;                       // gravity, px/s² (slow-motion kitchen)
export const EPS = 0.4;                      // "at rest" = every residual motion under 0.4 screen px

// light: shadows fall by (LX, LZ) per unit of height (lamp up, right, behind the table)
export const LX = -0.26, LZ = 0.5;
export const LIGHT = norm([-LX, 1, -LZ]);    // toward the lamp
export const VIEW = [0, SB, CB];             // toward the camera (x, h, z)

export function norm(v) { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** world (x, h, z) → screen [sx, sy] */
export const proj = (x, h, z) => [x, z * SB - h * CB];
/** a direction (dx, dh, dz) → screen vector */
export const projV = (dx, dh, dz) => [dx, dz * SB - dh * CB];

// ---------------------------------------------------------------------------------------------------------------
// damped second-order system x'' + 2σx' + ω²x = input. Both responses are exact.
const wdOf = (w, sig) => Math.sqrt(Math.max(1e-6, w * w - sig * sig));
/** displacement after a unit velocity kick at s = 0 (a hit): e^(−σs)·sin(ω_d s)/ω_d */
export function impulse(s, w, sig) {
  if (s <= 0) return 0;
  const wd = wdOf(w, sig);
  return (Math.exp(-sig * s) * Math.sin(wd * s)) / wd;
}
/** response to a unit step of the rest position at s = 0: overshoots, then settles on 1 */
export function step(s, w, sig) {
  if (s <= 0) return 0;
  const wd = wdOf(w, sig);
  return 1 - Math.exp(-sig * s) * (Math.cos(wd * s) + (sig / wd) * Math.sin(wd * s));
}

/**
 * A linear oscillator driven by kicks (velocity impulses J at t) and steps (rest position moves by D at t).
 * Superposition is exact for a linear system, so x(t) = Σ J·impulse + Σ D·step.
 * The decay σ is SOLVED so that the bound on the residual at time R is `eps` (in output units × scale):
 *   Σ |J|/ω_d·e^(−σ(R−t)) + Σ |D|·√(1+(σ/ω_d)²)·e^(−σ(R−t)) = eps
 * — the smallest σ (the liveliest motion) that is still sub-pixel at R. From R on, x is exactly Σ D.
 */
export function oscillator({ w, kicks = [], steps = [], R, eps, scale = 1 }) {
  const bound = (sig) => {
    const wd = wdOf(w, sig);
    let e = 0;
    for (const k of kicks) e += (Math.abs(k.J) / wd) * Math.exp(-sig * (R - k.t));
    for (const s of steps) e += Math.abs(s.D) * Math.sqrt(1 + (sig / wd) ** 2) * Math.exp(-sig * (R - s.t));
    return e * scale;
  };
  let lo = 0.02, hi = 0.9 * w;
  if (bound(hi) > eps) lo = hi;                       // cannot meet eps underdamped: take the strongest decay
  else for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (bound(m) > eps) lo = m; else hi = m; }
  const sig = hi;
  const rest = steps.reduce((a, s) => a + s.D, 0);
  const f = (t) => {
    if (t >= R) return rest;
    let x = 0;
    for (const k of kicks) x += k.J * impulse(t - k.t, w, sig);
    for (const s of steps) x += s.D * step(t - s.t, w, sig);
    return x;
  };
  f.sig = sig; f.w = w; f.zeta = sig / w; f.residual = bound(sig) / scale;
  return f;
}

// ---------------------------------------------------------------------------------------------------------------
/**
 * Euler's disk — a spinning coin that settles in finite time at R.
 *   σ = 1 − t/R,   sin α = S0·σ^(2/3)   (α: angle between coin and table)
 *   precession Ω = Ω0·σ^(−1/3)  → φ(t) = ∫Ω dt = (3/2)·Ω0·R·(1 − σ^(2/3))           (finite: the wobble rate
 *   diverges, the angle it sweeps does not — the "whirr" that speeds up and stops dead)
 *   rolling without slipping: the face turns in the precessing frame at −Ω·cos α, and with w = σ^(2/3)
 *   m(t) = −∫Ω cos α dt = −(3/2)·Ω0·R·[F(1) − F(w)],  F(w) = ½(w√(1−S0²w²) + asin(S0·w)/S0)
 */
export function eulerDisk({ R, S0 = Math.sin((84 * Math.PI) / 180), f0 = 1.8, phi0 = 0 }) {
  const W0 = TAU * f0;
  const F = (w) => 0.5 * (w * Math.sqrt(Math.max(0, 1 - S0 * S0 * w * w)) + Math.asin(S0 * w) / S0);
  const F1 = F(1);
  const f = (t) => {
    const s = Math.max(0, 1 - Math.max(0, t) / R);
    const w = Math.pow(s, 2 / 3);
    const sinA = S0 * w;
    return {
      alpha: Math.asin(sinA), sinA, cosA: Math.sqrt(1 - sinA * sinA),
      phi: phi0 + 1.5 * W0 * R * (1 - w),
      m: -1.5 * W0 * R * (F1 - F(w)),
      rate: s > 0 ? W0 / Math.cbrt(s) : Infinity,     // Ω (rad/s)
    };
  };
  // the contact point's distance from the centre (a·cos α) as a function of the precession angle itself:
  // φ is monotonic in w, so w = 1 − (φ − φ0)/((3/2)Ω0R) — the whole path is drawn without touching t
  f.phi0 = phi0; f.phiEnd = phi0 + 1.5 * W0 * R;
  f.cosAtPhi = (ph) => { const w = 1 - (ph - phi0) / (1.5 * W0 * R); return Math.sqrt(Math.max(0, 1 - (S0 * w) ** 2)); };
  return f;
}

// ---------------------------------------------------------------------------------------------------------------
/**
 * A pea popped from the pod: one parabola to the first contact, n bounces (restitution e, each contact keeps
 * mu of the horizontal speed), then a roll with linear drag k plus a little dry friction c, which stops it
 * EXACTLY at R:  v(s) = (v_r + c)e^(−ks) − c,  x(s) = (v_r + c)(1 − e^(−ks))/k − c·s,  c = v_r/(e^(k(R−t_r)) − 1).
 * Everything is linear in the launch speed, so the speed that lands the pea on `target` is a formula too.
 *   tl launch time · p0 [x, z] start · h0 start height (bottom of the pea) · target [x, z] where it comes to rest
 *   T1 flight time to the first contact (sets the arc) · into: { h } — land at height h and stop there (the spoon)
 */
export function pea({ tl, p0, h0, target, T1, e = 0.55, mu = 0.8, k = 1.6, R, into = null, apexMin = 0.45 }) {
  const dx = target[0] - p0[0], dz = target[1] - p0[1];
  const L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
  const hT = into ? into.h : 0;
  const vy0 = (0.5 * G * T1 * T1 + hT - h0) / T1;           // reach height hT at exactly T1
  const vImp = G * T1 - vy0;                                 // downward speed at the first contact
  // bounce durations (vertical only) — the contact times are a geometric series
  const bounces = [];
  if (!into) {
    let v = e * vImp;
    while ((v * v) / (2 * G) > apexMin) { bounces.push(v); v *= e; }
  }
  const tc = [tl + T1];
  for (const v of bounces) tc.push(tc[tc.length - 1] + (2 * v) / G);
  const tr = tc[tc.length - 1];                              // rolling starts here
  const Tr = R - tr;
  const rollK = Tr > 0 ? 1 / k - Tr / Math.expm1(k * Tr) : 0;   // distance per unit of v_r
  // K: distance per unit of launch speed
  let K = T1, m = 1;
  for (let i = 0; i < bounces.length; i++) { m *= mu; K += (m * 2 * bounces[i]) / G; }
  m *= mu;
  K += into ? 0 : m * rollK;
  const vh = L / K;                                          // launch speed that ends on target
  const vr = m * vh, c = Tr > 0 ? vr / Math.expm1(k * Tr) : 0;

  // segments: [t0, t1, d0 (path distance at t0), speed, h0, vy]
  const segs = [{ t0: tl, t1: tc[0], d0: 0, v: vh, h0, vy: vy0 }];
  let d = vh * T1, sp = vh;
  for (let i = 0; i < bounces.length; i++) {
    sp *= mu;
    segs.push({ t0: tc[i], t1: tc[i + 1], d0: d, v: sp, h0: 0, vy: bounces[i] });
    d += (sp * 2 * bounces[i]) / G;
  }
  const dRoll = d;
  const contacts = tc.map((t, i) => {
    const vimp = i === 0 ? vImp : bounces[i - 1];
    const dd = i === 0 ? vh * T1 : segs[i].d0 + segs[i].v * (2 * bounces[i - 1]) / G;
    return { t, x: p0[0] + ux * dd, z: p0[1] + uz * dd, v: vimp, first: i === 0 };
  });

  /** state at t: x, z, h (bottom above table/landing surface), d (path distance), vh, vy, phase */
  function at(t) {
    if (t < tl) return { phase: 'pod', x: p0[0], z: p0[1], h: h0, d: 0, vh: 0, vy: 0 };
    if (into && t >= tc[0]) {
      const D = vh * T1;
      return { phase: 'in', x: p0[0] + ux * D, z: p0[1] + uz * D, h: hT, d: D, vh: 0, vy: 0, s: t - tc[0] };
    }
    for (const g of segs) {
      if (t < g.t1) {
        const s = t - g.t0;
        const D = g.d0 + g.v * s;
        return { phase: 'fly', x: p0[0] + ux * D, z: p0[1] + uz * D, h: g.h0 + g.vy * s - 0.5 * G * s * s, d: D, vh: g.v, vy: g.vy - G * s };
      }
    }
    const s = Math.min(t, R) - tr;
    const D = dRoll + (Tr > 0 ? ((vr + c) * -Math.expm1(-k * s)) / k - c * s : 0);
    const v = Tr > 0 && t < R ? (vr + c) * Math.exp(-k * s) - c : 0;
    return { phase: t < R ? 'roll' : 'rest', x: p0[0] + ux * D, z: p0[1] + uz * D, h: 0, d: D, vh: v, vy: 0 };
  }
  return { at, contacts, tl, tr, tLand: tc[0], ux, uz, vh, vImp, k, c, vr, T1, p0, target, into };
}
