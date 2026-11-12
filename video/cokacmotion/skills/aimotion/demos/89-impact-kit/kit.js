/*
 * kit.js — the impact kit as closed-form envelopes.
 *
 * Every effect is a pure function of the time since its beat, so a seek to any t draws the same frame:
 *   u   = t − hit            (contact; u < 0 is the wind-up and the slam)
 *   rel = t − (hit + stop)   (release after the hit-stop; every "reaction" layer starts at rel = 0)
 * Nothing here keeps state between calls. Particle tables are built once with rand(seed) (setup) and read here.
 */
import { rand } from '../_lib/stage.js';

export const TAU = Math.PI * 2;
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const E = {
  outQuad: (p) => 1 - (1 - p) * (1 - p),
  outCubic: (p) => 1 - (1 - p) * (1 - p) * (1 - p),
  inCubic: (p) => p * p * p,
  inOutCubic: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  outExpo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  smooth: (p) => p * p * (3 - 2 * p),
  /** back.out(c): overshoots past 1 and settles (GSAP's back.out uses the same curve) */
  backOut: (p, c = 1.7) => 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2),
};

/** hit-stop as a time warp: the ambient world (camera, timeline, motes) freezes for `stop` seconds at each hit */
export function warp(t, beats) {
  let w = t;
  for (const b of beats) w -= Math.min(Math.max(t - b.hit, 0), b.stop);
  return w;
}

/** full-frame flash: jumps to `peak` on contact, holds through the hit-stop, decays with power2.out */
export function flash(b, t, { peak = 0.32, dur = 0.42 } = {}) {
  const u = t - b.hit;
  if (u < 0) return 0;
  if (u < b.stop) return peak;
  const k = clamp01((u - b.stop) / dur);
  return peak * (1 - E.outQuad(k));
}

/** camera punch: scale 1 → 1 + amt in 0.07 s, back to 1 in 0.5 s (power3.out) */
export function punch(rel, amt = 0.035) {
  if (rel < 0) return 0;
  if (rel < 0.07) return amt * E.outQuad(rel / 0.07);
  return amt * (1 - E.outCubic(clamp01((rel - 0.07) / 0.5)));
}

/** decaying shake for the CSS translate property: (1 − p)² envelope on two detuned sines */
export function shake(rel, { amp = 10, dur = 0.55, wiggles = 7, ratio = 0.6, ph1 = 0, ph2 = 0 } = {}) {
  const p = rel / dur;
  if (p <= 0 || p >= 1) return [0, 0];
  const env = (1 - p) * (1 - p);
  return [amp * env * Math.sin(TAU * wiggles * p + ph1), amp * ratio * env * Math.sin(TAU * wiggles * 1.13 * p + ph2)];
}

/** ring shockwave: radius expo.out from r0 to r1, stroke thins, alpha fades — null when not visible */
export function ring(rel, { r0, r1, dur = 0.7, w0 = 10, w1 = 1, a0 = 0.9, delay = 0 } = {}) {
  const s = rel - delay;
  if (s < 0 || s > dur) return null;
  const k = s / dur, e = E.outExpo(k);
  return { r: r0 + (r1 - r0) * e, w: w0 + (w1 - w0) * e, a: a0 * Math.pow(1 - k, 1.3) };
}

/** comic sound word: pop 0.3 → peak (0.12 s), back.out(3) to 1, hold, then rise and fade */
export function sfx(rel, { hold = 0.8, peak = 1.18, out = 0.3 } = {}) {
  if (rel < 0) return null;
  let s, a = clamp01(rel / 0.04), dy = 0;
  if (rel < 0.12) s = 0.3 + (peak - 0.3) * E.outQuad(rel / 0.12);
  else s = peak + (1 - peak) * E.backOut(clamp01((rel - 0.12) / 0.3), 3);
  if (rel > hold) {                      // exit: a small swell, then shrink away (back.in) — no muddy half-fade
    const k = clamp01((rel - hold) / out);
    if (k >= 1) return null;
    s *= 1 - k * k * (2.7 * k - 1.7); a *= 1 - k * k * k * k; dy = -30 * k;
  }
  return { s, a, dy };
}

/**
 * A burst table: n particles leaving the rim of a disc (radius rim) — direction, plane speed, upward speed,
 * size, spin, delay. Built once from rand(seed); positions are then closed-form in the time since release.
 */
export function makeBurst(seed, n, { rim = 100, speed = [300, 900], up = [200, 600], size = [2, 8], delay = 0.03, sizePow = 2 } = {}) {
  const r = rand(seed), ps = [];
  for (let i = 0; i < n; i++) {
    const a = (i + r() * 0.8) / n * TAU;          // spread round the rim, jittered
    const dx = Math.cos(a), dy = Math.sin(a);
    ps.push({
      dx, dy, ax: dx * rim * (0.85 + r() * 0.15), ay: dy * rim * (0.85 + r() * 0.15),
      v: speed[0] + r() * (speed[1] - speed[0]), vz: up[0] + r() * (up[1] - up[0]),
      sz: size[0] + Math.pow(r(), sizePow) * (size[1] - size[0]), ph: r() * TAU, spin: (r() - 0.5) * 30, d: r() * delay,
    });
  }
  return ps;
}

/**
 * Closed-form ballistic flight with drag on the paper plane and gravity on the height axis:
 *   plane  p(s) = p0 + v·(1 − e^(−k s))/k         (drag k)
 *   height z(s) = vz·s − ½ g s²,  lands at s_L = 2·vz / g and stays there
 * Returns plane position, height, velocity (screen space: height is drawn as "up") and the landing state.
 */
export function fly(p, s, k, g) {
  const sL = g > 0 ? (2 * p.vz) / g : Infinity;
  const sf = Math.min(s, sL);
  const f = k ? (1 - Math.exp(-k * sf)) / k : sf, e = Math.exp(-k * sf);
  const x = p.ax + p.dx * p.v * f, y = p.ay + p.dy * p.v * f;
  const z = s < sL ? p.vz * s - 0.5 * g * s * s : 0;
  const vx = p.dx * p.v * e, vy = p.dy * p.v * e - (s < sL ? p.vz - g * s : 0);
  return { x, y, z, vx, vy, landed: s >= sL, sL };
}
