/*
 * clock.js — two clocks. Camera time t is the edit (0…10 s, always 1:1). Scene time τ is what the physics reads.
 *
 * The rate dτ/dt is a list of knots. Between knots with the same rate the scene runs at that rate; between knots with
 * different rates it changes along a smoothstep S(u) = 3u² − 2u³. Scene time is the integral of the rate, and since
 * ∫₀ᵘ S = u³ − u⁴/2, every segment integrates to a polynomial:
 *   T(t) = T(tᵢ) + d·[a·u + (b − a)·(u³ − u⁴/2)],  u = (t − tᵢ)/d,  d = tᵢ₊₁ − tᵢ
 * T counts scene seconds from the start of the film (the chip shows it). The physics uses τ = T − T(T_RIP), so τ = 0 is
 * the instant the skin rips and everything physical is a closed form of τ.
 */

export const DRIFT = 0.0008;            // dτ/dt while "frozen": the scene still crawls, 0.8 ms per camera second
export const KNOTS = [
  [0.0, 1],        // the balloon falls at normal speed
  [0.7, 1],
  [1.3, 0.2],      // ramp down as it nears the tip
  [1.85, 0.035],   // slow motion: the touch, the dimple
  [2.05, 0.035],
  [2.45, DRIFT],   // brake into the freeze (the rip has started at T_RIP = 2.0)
  [6.85, DRIFT],   // bullet time: the camera orbits a moment that hardly moves
  [7.35, 0.06],    // time comes back, slowly: the skin finishes peeling, the water hits the sprinkler head
  [7.9, 0.06],
  [8.5, 1],        // back to normal speed: the splash reaches the grass
  [10.0, 1],
];
export const T_RIP = 2.0;               // camera time of the rip (inside the 0.035× stretch)
export const FREEZE = [2.45, 6.85];

const S = (u) => u * u * (3 - 2 * u);
const SI = (u) => u * u * u - 0.5 * u * u * u * u;   // ∫₀ᵘ S

const T0 = [0];
for (let i = 0; i + 1 < KNOTS.length; i++) {
  const [t0, a] = KNOTS[i], [t1, b] = KNOTS[i + 1];
  T0.push(T0[i] + (t1 - t0) * (a + b) / 2);
}
const T_END = KNOTS[KNOTS.length - 1][0];
function seg(t) {
  let i = 0;
  while (i + 2 < KNOTS.length && t >= KNOTS[i + 1][0]) i++;
  return i;
}

/** dτ/dt at camera time t (1 outside the edit) */
export function rate(t) {
  if (t <= 0 || t >= T_END) return 1;
  const i = seg(t), [t0, a] = KNOTS[i], [t1, b] = KNOTS[i + 1];
  return a === b ? a : a + (b - a) * S((t - t0) / (t1 - t0));
}

/** scene seconds since the film began, exact */
export function sceneClock(t) {
  if (t <= 0) return t;
  if (t >= T_END) return T0[T0.length - 1] + (t - T_END);
  const i = seg(t), [t0, a] = KNOTS[i], [t1, b] = KNOTS[i + 1], d = t1 - t0, u = (t - t0) / d;
  return T0[i] + d * (a * u + (b - a) * SI(u));
}

const T_AT_RIP = sceneClock(T_RIP);
/** physics time: 0 at the rip */
export const tau = (t) => sceneClock(t) - T_AT_RIP;

/*
 * Exposure. Each frame is open for half a frame (a 180° shutter, 1/60 s of camera time), centred on t. The scene time it
 * covers is span = τ(t + h) − τ(t − h) ≈ 2h·dτ/dt; a moving thing smears over v·span. While frozen the span is
 * 1/60 × 0.0008 s = 13 µs, so a droplet at 3 m/s moves 0.04 mm: the frozen moment is razor sharp even though the
 * camera itself is moving (every view along the rail is a still, as in a real camera array — the camera's own motion
 * does not blur).
 */
export const SHUTTER = 1 / 60;
export function span(t) {
  const h = SHUTTER / 2;
  return tau(t + h) - tau(t - h);
}
