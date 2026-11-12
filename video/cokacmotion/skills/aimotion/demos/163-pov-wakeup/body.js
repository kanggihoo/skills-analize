/*
 * body.js — the first-person body: everything the viewer's own eyes, head, legs and arms do, as functions of t.
 *
 *   eyelids   aperture a(t) → two Bezier lid curves (shared by the shader and the visible-area integral here)
 *   defocus   wake blur radius R(t): exponential decay, each blink clears it by a factor (tear film)
 *   springs   head yaw / pitch and torso pitch follow their targets through a damped spring (baked at 600 Hz)
 *   gait      walking distance s(t) with a trapezoid speed profile; step phase φ = s / step length locks
 *             the vertical bob (|sin πφ|, twice per stride), the sway and roll (sin πφ, once per stride)
 *   arms      two-bone analytic IK from a shoulder below the frame edge to a world-space wrist target
 * Nothing here keeps state between calls: the springs are integrated once in setup and read by interpolation.
 */
import * as THREE from 'three';
import { clamp, lerp, smooth } from '../_lib/stage.js';

export const D = 10;
const DEG = Math.PI / 180;
const easeIn2 = (p) => p * p;
const easeOut3 = (p) => 1 - (1 - p) ** 3;
const io = (p) => { p = clamp(p); return p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2; };
const seg = (t, a, b) => clamp((t - a) / (b - a));

// ---------------------------------------------------------------- story beats (seconds)
export const T = {
  crack: 0.3,                                   // the lids first part
  b1: [1.80, 1.90, 1.93, 2.13],                 // blink: close start, closed, open start, open end
  b2: [2.30, 2.40, 2.42, 2.64],
  turn: 2.72,                                   // head turns to the ringing clock
  reach: 3.28, touch: 3.92, press: 3.98, lift: 4.08, retract: 4.3,
  sit: 4.36, look: 5.02, stand: 5.22, walk0: 5.88, walk1: 7.3,
  grab0: 7.2, grab: 7.44, tug: 7.72, pull1: 7.98, release: 8.04,   // grab, a slow tug (light streams in), then the sweep
  flood: 7.54,                                  // the gap is wide enough for the room to flood
  title: 8.75,
};

// ---------------------------------------------------------------- 1. eyelids
// Lid curves in eye-space units: u ∈ [−1, 1] across the frame width, v up, |v| ≤ ASPECT at the top/bottom edge.
// Each lid is a cubic Bezier whose control x are evenly spaced, so x(s) is linear and y(s) is a closed form:
//   s = (u − X0)/(X1 − X0),  B(s) = 3(1−s)²s·k₁ + 3(1−s)s²·k₂
//   upper y_u = c − ε + h_u·B_u(s),  lower y_l = c + ε − h_l·B_l(s)
// ε = edge width, so the closed lids overlap by 2ε and no light line shows at a = 0.
export const ASPECT = 1920 / 1080;
export const LID = { X0: -1.35, X1: 1.35, KU: [1.12, 0.88], KL: [0.9, 1.1], H: 7.0 };
export function lidShape(a) {
  const w = 0.05 + 0.05 * (1 - a);            // the lid edge is millimetres from the cornea: always out of focus
  return {
    c: -0.06 + 0.1 * a,                         // the slit opens slightly upward
    hu: LID.H * a ** 1.25,                      // the upper lid does most of the travel …
    hl: LID.H * a ** 1.7,                       // … the lower lid only follows late
    w,
  };
}
const bez = (s, k) => 3 * (1 - s) * (1 - s) * s * k[0] + 3 * (1 - s) * s * s * k[1];
/** fraction of the frame the eye sees through the slit (the light that reaches the retina) */
export function lidVisible(a) {
  if (a <= 0) return 0;
  const L = lidShape(a);
  let sum = 0;
  const N = 48;
  for (let i = 0; i < N; i++) {
    const u = -1 + (2 * (i + 0.5)) / N, s = (u - LID.X0) / (LID.X1 - LID.X0);
    const yu = L.c - L.w + L.hu * bez(s, LID.KU), yl = L.c + L.w - L.hl * bez(s, LID.KL);
    sum += clamp(Math.min(yu, ASPECT) - Math.max(yl, -ASPECT), 0, 2 * ASPECT);
  }
  return sum / N / (2 * ASPECT);
}

/** eyelid aperture a(t): heavy first opening, two blinks (close 0.1 s ease-in, open 0.2 s ease-out), a squint at the light */
export function aperture(t) {
  const [c0, c1, o0, o1] = T.b1, [d0, d1, p0, p1] = T.b2;
  if (t < T.crack) return 0;
  if (t < 1.0) return 0.24 * io(seg(t, T.crack, 1.0));
  if (t < 1.28) return lerp(0.24, 0.1, io(seg(t, 1.0, 1.28)));         // heavy lids sag back
  if (t < c0) return lerp(0.1, 0.46, io(seg(t, 1.28, 1.7)));
  if (t < c1) return 0.46 * (1 - easeIn2(seg(t, c0, c1)));              // close: ballistic, accelerating
  if (t < o0) return 0;
  if (t < o1) return 0.66 * easeOut3(seg(t, o0, o1));                  // open: twice as long, decelerating
  if (t < d0) return 0.66;
  if (t < d1) return 0.66 * (1 - easeIn2(seg(t, d0, d1)));
  if (t < p0) return 0;
  if (t < p1) return easeOut3(seg(t, p0, p1));
  // squint: the reflex narrows the lids as the light floods in, then lets go as the eye adapts
  const sq = smooth(seg(t, T.flood + 0.02, T.flood + 0.16)) * (1 - smooth(seg(t, 8.05, 8.95)));
  return 1 - 0.4 * sq;
}

// ---------------------------------------------------------------- 2. defocus
// R(t) = R₀·e^(−(t − t₀)/τ)·Π βᵢ, each blink multiplying the remaining blur by β (smoothly over its opening),
// then the last half pixel pulled to exactly zero. R in full-resolution pixels (disc radius).
export function wakeBlur(t) {
  if (t >= 2.95) return 0;
  const decay = Math.exp(-Math.max(0, t - T.crack) / 0.9);
  const k1 = lerp(1, 0.5, smooth(seg(t, T.b1[2], T.b1[3]))), k2 = lerp(1, 0.5, smooth(seg(t, T.b2[2], T.b2[3])));
  return 64 * decay * k1 * k2 * (1 - smooth(seg(t, 2.5, 2.95)));
}

// ---------------------------------------------------------------- 3. springs
/** x'' = ω²(g − x) + 2ζω(ff·g' − x'), semi-implicit Euler at hz, read back by linear interpolation.
 *  ff = 0: a plain damped spring (lag and overshoot on every move); ff = 1: velocity feed-forward, so a moving target
 *  (gaze held on an object while the body moves) is tracked without lag, and only sudden changes overshoot. */
export function bakeSpring(target, { w, z, ff = 0, hz = 600 }) {
  const n = Math.ceil(D * hz) + 2, out = new Float32Array(n), dt = 1 / hz;
  let x = target(0), v = 0;
  for (let i = 0; i < n; i++) {
    out[i] = x;
    const g = target(i * dt), gv = ff ? (target(i * dt + dt) - target(i * dt - dt)) / (2 * dt) : 0;
    const acc = w * w * (g - x) + 2 * z * w * (ff * gv - v);
    v += acc * dt; x += v * dt;
  }
  const f = (t) => { const q = clamp(t, 0, D) * hz, i = Math.min(n - 2, Math.floor(q)), k = q - i; return out[i] + (out[i + 1] - out[i]) * k; };
  f.vel = (t) => (f(t + 0.004) - f(t - 0.004)) / 0.008;
  return f;
}

// ---------------------------------------------------------------- 4. the hips (closed form) and the gait
export const HIP_LIE = new THREE.Vector3(0.2, 0.64, 0.86);     // lying: the head turns about the skull centre, ~9 cm above the pillow
export const HIP_UP = new THREE.Vector3(0.7, 0.98, -0.15);    // standing beside the bed
export const HIP_WIN = new THREE.Vector3(0.13, 0.98, -1.4);    // an arm's length from the curtains
const WALK_D = Math.hypot(HIP_WIN.x - HIP_UP.x, HIP_WIN.z - HIP_UP.z);
export const STEPS = 3;                                         // footfalls on the way
const STEP_L = WALK_D / STEPS;
const RAMP = 0.3;                                               // fraction of the walk spent speeding up (and slowing down)
/** trapezoid speed profile → normalised distance and speed factor (1 at cruise) */
function walkProfile(p) {
  p = clamp(p);
  const n = 1 / (1 - RAMP);                                     // cruise speed in units of distance/duration
  if (p < RAMP) return { s: (n * p * p) / (2 * RAMP), k: p / RAMP };
  if (p > 1 - RAMP) { const q = 1 - p; return { s: 1 - (n * q * q) / (2 * RAMP), k: q / RAMP }; }
  return { s: n * (p - RAMP / 2), k: 1 };
}
/** walking: distance along the path, step phase φ, speed factor k */
export function gait(t) {
  const { s, k } = walkProfile(seg(t, T.walk0, T.walk1));
  return { s: s * WALK_D, phi: (s * WALK_D) / STEP_L, k: t > T.walk0 && t < T.walk1 ? k : 0 };
}
/** head bob in body space (metres, radians), phase-locked to the footfalls at integer φ */
export function bob(t) {
  const { phi, k } = gait(t);
  const sp = Math.sin(Math.PI * phi);
  return {
    y: 0.034 * k * (Math.abs(sp) - 2 / Math.PI),               // twice per stride, lowest (a cusp) at heel strike
    x: 0.02 * k * sp,                                           // over the standing foot: once per stride
    roll: 1.3 * DEG * k * Math.sin(Math.PI * phi - 0.35),       // rolls a little after the sway
    pitch: -0.5 * DEG * k * Math.cos(2 * Math.PI * phi),        // a nod at each heel strike
  };
}
/** hip position: lying → (sit up in place) → rise beside the bed → walk to the window; plus a breath */
export function hipAt(t, out) {
  const r = smooth(seg(t, T.stand, T.walk0));
  out.copy(HIP_LIE).lerp(HIP_UP, r);
  out.y = lerp(HIP_LIE.y, HIP_UP.y, io(seg(t, T.stand + 0.12, T.walk0)));
  const { s } = gait(t);
  const k = s / WALK_D;
  out.x += (HIP_WIN.x - HIP_UP.x) * k; out.z += (HIP_WIN.z - HIP_UP.z) * k;
  out.y += 0.006 * Math.sin(t * 1.7) * smooth(seg(t, T.walk1, T.walk1 + 0.6));   // breathing at the window
  return out;
}

// ---------------------------------------------------------------- 5. two-bone IK
const _u = new THREE.Vector3(), _v = new THREE.Vector3();
/** shoulder S, wrist target Tg, bone lengths a (upper) b (fore), pole direction P → elbow E, reached wrist W */
export function twoBoneIK(S, Tg, a, b, P, E, W) {
  _u.subVectors(Tg, S);
  const d = clamp(_u.length(), Math.abs(a - b) + 1e-3, a + b - 1e-3);
  _u.normalize();
  const cosA = (a * a + d * d - b * b) / (2 * a * d), sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  _v.copy(P).addScaledVector(_u, -P.dot(_u)).normalize();       // the pole, made perpendicular to the reach
  E.copy(S).addScaledVector(_u, a * cosA).addScaledVector(_v, a * sinA);
  W.copy(S).addScaledVector(_u, d);
  return { E, W };
}
