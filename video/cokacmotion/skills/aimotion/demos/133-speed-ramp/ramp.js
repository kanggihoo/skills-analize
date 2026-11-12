/*
 * ramp.js — the speed ramp: real time t (the edit) → story time τ (the footage).
 *
 * The speed curve s(t) is a list of knots. Between two knots with the same speed the footage plays at that speed;
 * between two knots with different speeds the speed changes along a smoothstep S(u) = 3u² − 2u³.
 * Story time is the integral τ(t) = ∫₀ᵗ s dt′, and because ∫₀ᵘ S = u³ − u⁴/2 every segment integrates to a polynomial:
 *   τ(t) = τ(tᵢ) + d·[ a·u + (b − a)·(u³ − u⁴/2) ],  u = (t − tᵢ)/d,  d = tᵢ₊₁ − tᵢ
 * So any frame — and any instant inside a frame's exposure — knows its exact story time, with no stepping.
 */

export const KNOTS = [
  [0.0, 1],     // approach at 1×
  [2.5, 1],
  [3.2, 0.1],   // ramp down to 0.1× through the take-off
  [4.3, 0.1],   // slow-motion float
  [4.4, 0],     // the frame stops (a 0.1 s smoothstep: a brake, not a cut)
  [6.5, 0],     // freeze frame
  [7.1, 2],     // unfreeze, ramp up to 2×
  [8.1, 2],     // fast forward: landing and roll-away
  [8.6, 1],     // back to 1×
  [10.0, 1],    // afterglow
];

const S = (u) => u * u * (3 - 2 * u);
const SI = (u) => u * u * u - 0.5 * u * u * u * u;          // ∫₀ᵘ S

// τ at every knot (prefix sums of the closed-form segment integrals)
const TAU0 = [0];
for (let i = 0; i + 1 < KNOTS.length; i++) {
  const [t0, a] = KNOTS[i], [t1, b] = KNOTS[i + 1], d = t1 - t0;
  TAU0.push(TAU0[i] + d * (a + b) / 2);                     // = d·[a + (b − a)·SI(1)]
}
const T_END = KNOTS[KNOTS.length - 1][0];

function seg(t) {
  let i = 0;
  while (i + 2 < KNOTS.length && t >= KNOTS[i + 1][0]) i++;
  return i;
}

/** playback speed at real time t (1 outside the edit) */
export function speed(t) {
  if (t <= 0 || t >= T_END) return 1;
  const i = seg(t), [t0, a] = KNOTS[i], [t1, b] = KNOTS[i + 1];
  return a === b ? a : a + (b - a) * S((t - t0) / (t1 - t0));
}

/** story time τ(t) = ∫ s dt, exact */
export function tau(t) {
  if (t <= 0) return t;                                     // speed 1 before the cut …
  if (t >= T_END) return TAU0[TAU0.length - 1] + (t - T_END); // … and after it
  const i = seg(t), [t0, a] = KNOTS[i], [t1, b] = KNOTS[i + 1], d = t1 - t0, u = (t - t0) / d;
  return TAU0[i] + d * (a * u + (b - a) * SI(u));
}

/** the story time the frame stands still at (τ over the whole 4.4–6.5 hold) */
export const TAU_FREEZE = TAU0[5];
export const FREEZE = [KNOTS[4][0], KNOTS[5][0]];

/*
 * Exposure. A frame at t is open from t − h to t + h (h = half a 30 fps frame: a 360° shutter). Its picture is the
 * average of the scene at the story times τ(tᵢ) of N stratified instants tᵢ in that window, so the blur covers
 * [τ(t − h), τ(t + h)] — long at 2×, a tenth of that at 0.1×, nothing while the frame is frozen. Because the instants
 * are spaced evenly in real time and mapped through τ, a ramp inside one exposure is sampled correctly too.
 * N is the smallest count that keeps the fastest on-screen motion (vmax px per story second) under `step` px between
 * neighbouring samples, capped by the frame budget (NMAX).
 */
export const SHUTTER = 1 / 30;
export const NMAX = 10;
export function exposure(t, vmax, step = 5) {
  const h = SHUTTER / 2;
  const span = tau(t + h) - tau(t - h);
  const n = Math.max(1, Math.min(NMAX, Math.ceil((span * vmax) / step)));
  if (n === 1) return { taus: [tau(t)], span, n };
  const taus = [];
  for (let i = 0; i < n; i++) taus.push(tau(t - h + ((i + 0.5) / n) * SHUTTER));
  return { taus, span, n };
}
