/*
 * clock.js — the time-lapse camera's three clocks, all closed forms of the edit time t (seconds).
 *
 *   T(t)  scene clock (hours of the day): the integral of a speed curve s(t) (scene hours per edit second) that slows
 *         into dusk, so the blue hour gets the most frames.
 *   S(t)  shutter (scene hours one output frame integrates): a virtual shutter of K frames, S = K·s(t)/fps, built by
 *         blending a sliding window of exposures. Weighted by a Hann window w(u) = sin²(πu), u = (T − τ)/S ∈ [0, 1].
 *   EV    exposure: the camera follows the scene luminance smoothly (a closed form of the sun elevation), never in
 *         1/3-stop steps, and only partly (night stays darker than day).
 */
import { clamp } from '../_lib/stage.js';

export const FPS = 30;
export const K = 8;                 // the virtual shutter: one output frame blends K frame intervals of scene time
export const T0 = 4 + 55 / 60;      // the scene clock at t = 0 (04:55)

// speed knots [t, scene hours per second]; between two knots of different speed a smoothstep S(u) = 3u² − 2u³ blends
const KNOTS = [[0, 0.7], [0.5, 0.7], [1.5, 3.3], [4.25, 3.3], [5.55, 0.42], [7.35, 0.42], [8.35, 1.85], [10, 1.85]];
const ACC = [T0];
for (let i = 1; i < KNOTS.length; i++) {
  const [t0, a] = KNOTS[i - 1], [t1, b] = KNOTS[i];
  ACC.push(ACC[i - 1] + (t1 - t0) * (a + b) / 2);    // ∫ over one segment = d·(a + b)/2 (S is symmetric about ½)
}

/** s(t): scene hours per edit second */
export function speed(t) {
  if (t <= KNOTS[0][0]) return KNOTS[0][1];
  for (let i = 1; i < KNOTS.length; i++) {
    const [t0, a] = KNOTS[i - 1], [t1, b] = KNOTS[i];
    if (t <= t1) { const u = (t - t0) / (t1 - t0); return a + (b - a) * u * u * (3 - 2 * u); }
  }
  return KNOTS[KNOTS.length - 1][1];
}

/** T(t) = T0 + ∫₀ᵗ s: per segment T = Tᵢ + d·[a·u + (b − a)·(u³ − u⁴/2)], since ∫₀ᵘ (3v² − 2v³) dv = u³ − u⁴/2 */
export function sceneTime(t) {
  if (t <= 0) return T0 + t * KNOTS[0][1];
  for (let i = 1; i < KNOTS.length; i++) {
    const [t0, a] = KNOTS[i - 1], [t1, b] = KNOTS[i];
    if (t <= t1) {
      const d = t1 - t0, u = (t - t0) / d;
      return ACC[i - 1] + d * (a * u + (b - a) * (u * u * u - u * u * u * u / 2));
    }
  }
  const [tl, sl] = KNOTS[KNOTS.length - 1];
  return ACC[ACC.length - 1] + (t - tl) * sl;
}

/** the shutter in scene hours: K frame intervals, each interval = s/fps */
export const shutter = (t) => (K * speed(t)) / FPS;

// ---------------------------------------------------------------- the Hann shutter window
// w(u) = sin²(πu) on u ∈ [0, 1] (u = 0 is "now", u = 1 is the oldest edge of the window); ∫₀¹ w = ½.
// Normalised cumulative: Fn(u) = 2∫₀ᵘ w = u − sin(2πu)/(2π) ∈ [0, 1].
const TAU = Math.PI * 2;
export const hannCDF = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u - Math.sin(TAU * u) / TAU);
export const hann = (u) => (u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u) ** 2);

/**
 * Exposure fraction an event occupying scene times [a, b] leaves in the frame whose window is [T − S, T]:
 *   W = ∫ₐᵇ w((T − τ)/S) dτ / ∫ w  =  Fn((T − a)/S) − Fn((T − b)/S)
 * A person who waits through the whole window gets W = 1 (solid); half of it, a ghost at about ½.
 */
export function occupancy(a, b, T, S) {
  if (b <= T - S || a >= T) return 0;
  return hannCDF((T - a) / S) - hannCDF((T - b) / S);
}

/** a step that switches on at scene time a (a lamp, a window): the frame sees the fraction Fn((T − a)/S) of it */
export const switchedOn = (a, T, S) => hannCDF((T - a) / S);

// ---------------------------------------------------------------- exposure (deflicker)
const sig = (x) => 1 / (1 + Math.exp(-x));
/** scene luminance in EV100 as a smooth function of the sun elevation h (degrees): ≈15 noon, 12 sunset, 7 blue hour, 3 night */
export function sceneEV(h) {
  return 3 + 11 * sig((h + 4) / 2.4) + clamp(h / 30) * 1;
}
/** camera EV: follows only 80 % of the change (the "holy grail" ramp), so the image dims by a fifth of the stops */
export const cameraEV = (ev) => 0.8 * ev + 0.2 * 15;
/** image level of everything lit by sun and sky, relative to noon: 2^(EV_scene − EV_cam) = 2^(0.2·(EV − 15)) */
export const ambientGain = (ev) => Math.pow(2, ev - cameraEV(ev));
/** gain on light sources of fixed luminance (windows, lamps, headlights): 2^(15 − EV_cam) = 2^(0.8·(15 − EV)) */
export const emissiveGain = (ev) => Math.pow(2, 15 - cameraEV(ev));

/** "HH:MM" for a scene time in hours */
export function hhmm(T) {
  const m = Math.floor(((T % 24) + 24) % 24 * 60 + 1e-6);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
