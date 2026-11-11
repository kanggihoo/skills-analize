/*
 * story.js — the timeline of the film as functions of t, and the bake of everything stateful.
 *
 *   camPose(t)     the camera: overlapping smoothsteps on distance, azimuth, height, aim (never a linear dolly)
 *   channels(t)    closed-form pose channels on top of the gait: stop (brace, absorb, squash ring-out), the wave
 *                  (tuck → overshooting raise → oscillation → lower), the body's counter-motion, look-at, tilts
 *   blink / happy / mouth   the face curves
 *   bakeSecondary  integrates, at 240 Hz in setup, the springs that make overlap and follow-through
 *                  (lean overshoot from the root's deceleration, head lag, hips drift, forearm and hand drag) and the
 *                  Verlet scarf tails, while posing the rig at every step. frame(t) only interpolates the arrays.
 */
import * as THREE from 'three';
import { clamp, lerp, smooth, ramp, ease } from '../_lib/stage.js';
import { bodyR } from './rig.js';
import { pathAt, rootS, stepPhase, walkAmp, GAIT, poseRig } from './motion.js';

// ---------------------------------------------------------------- timeline (s)
export const T_STOP = GAIT.T_STOP;                       // the closing step lands
export const T_TUCK = 5.98, T_UP0 = 6.12, T_UP1 = 6.5;   // wave: anticipation tuck, raise
export const T_OSC0 = 6.42, T_OSC1 = 8.05, F_WAVE = 2.4; // the wave oscillation
export const T_DN0 = 8.08, T_DN1 = 8.55;                 // arm comes down
export const T_BUB0 = 6.46, T_BUB1 = 8.04;               // speech bubble in / out
export const BLINKS = [1.3, 3.55, 5.68, 9.0];

// ---------------------------------------------------------------- small helpers
export const sw = (t, a, b) => smooth((t - a) / (b - a));
export const imp = (x, w) => (x <= 0 ? 0 : (x / w) * Math.exp(1 - x / w));          // 0 → 1 at x = w → 0
export const outBack = (p, c = 1.5) => (p <= 0 ? 0 : p >= 1 ? 1 : ease.outBack(p, c));

// ---------------------------------------------------------------- camera (closed form, overlapping smoothsteps)
const P0 = {};
export function camPose(t, out) {
  pathAt(rootS(t), P0);
  const dist = 9.3 - 2.15 * sw(t, -0.3, 5.6) - 0.9 * sw(t, 5.7, 8.4) - 0.15 * sw(t, 8.2, 9.9);
  const az = -0.21 + 0.12 * sw(t, -0.2, 5.8) + 0.035 * sw(t, 5.6, 9.7);
  const y = 1.16 - 0.14 * sw(t, 0, 5.6) - 0.03 * sw(t, 6, 9.5);
  const ly = 0.9 + 0.05 * sw(t, 6, 9.2);
  out.pos.set(P0.x + dist * Math.sin(az), y, P0.z + dist * Math.cos(az));
  out.look.set(P0.x, ly, P0.z);
  out.fov = 30;
  return out;
}

// ---------------------------------------------------------------- closed-form channels at t
const WAVE_W = 2 * Math.PI * F_WAVE;
const waveEnv = (t) => ramp(t, T_OSC0, T_OSC0 + 0.2) * (1 - ramp(t, T_OSC1 - 0.2, T_OSC1));
const waveUp = (t) => ramp(t, T_UP0, T_UP1) * (1 - ramp(t, T_DN0, T_DN1));
export function channels(t, camPos, rootP, out) {
  const amp = walkAmp(t), ph = stepPhase(t), land = t - T_STOP;
  const env = waveEnv(t), up = waveUp(t);
  const osc = 0.3 * Math.sin(WAVE_W * (t - T_OSC0)) * env;
  const oscLag = Math.sin(WAVE_W * (t - T_OSC0) - 0.7) * env;
  // stop: brace + knee absorb + squash/stretch ring-out; wave: a little crouch before the raise
  out.dip = -0.014 * (ramp(t, 4.5, 4.85) - ramp(t, 4.95, 5.25)) - 0.03 * imp(land, 0.1) - 0.012 * imp(t - T_TUCK, 0.1);
  out.squash = 0.016 * Math.exp(-ph.frac * 7) * amp
    + (land > 0 ? 0.075 * Math.exp(-land * 5.5) * Math.sin(2 * Math.PI * 3.1 * land + 0.35) : 0)
    + 0.03 * imp(t - T_TUCK, 0.1) - 0.02 * imp(t - T_UP0 - 0.12, 0.12);
  out.leanAdd = -0.03 * up;
  // the body counters the waving (right) arm: leans away from it, sways against each swing (lagged)
  out.spineRoll = -(0.07 * up + 0.07 * oscLag) - 0.05 * sw(t, 8.5, 9.1);
  out.hipsSide = -0.012 * up;
  // look at the camera (a share of the bearing), the happy head bob, the afterglow tilt
  const bearing = Math.atan2(camPos.x - rootP.x, camPos.z - rootP.z) - rootP.psi;
  out.headYaw = clamp(0.55 * bearing, -0.3, 0.3);
  out.headRoll = -0.5 * out.spineRoll + 0.07 * Math.sin(WAVE_W * (t - T_OSC0) - 1.6) * env - 0.24 * sw(t, 8.5, 9.1);
  out.headPitch = 0.07 * imp(t - 6.52, 0.12) + 0.05 * imp(t - 6.8, 0.12) - 0.04 * sw(t, 8.55, 9.05) - 0.03 * imp(land, 0.25);
  // arms: walk swing (opposite to the legs), a flare on the stop, the right arm's wave
  const swing = 0.42 * ph.side * Math.cos(Math.PI * ph.frac) * amp;
  const flare = 0.2 * imp(land, 0.13);
  const raiseR = -0.1 * (ramp(t, T_TUCK, T_UP0) - ramp(t, T_UP0, T_UP0 + 0.12))
    + 1.58 * outBack((t - T_UP0) / (T_UP1 - T_UP0), 1.3) * (1 - ease.inOutCubic(clamp((t - T_DN0) / (T_DN1 - T_DN0)))) + osc;
  out.arm.L.fwd = -swing + 0.05 * imp(land, 0.2);
  out.arm.L.raise = 0.06 + 0.05 * amp + flare + 0.1 * up;
  out.arm.R.fwd = swing + 0.05 * imp(land, 0.2) + 0.28 * up;
  out.arm.R.raise = 0.06 + 0.05 * amp + flare + raiseR;
  // spring rest targets (the pose the forearm/hand settle into)
  out.tgt.fzL = 0.06; out.tgt.fxL = lerp(0.12, 0.24, amp);
  out.tgt.fzR = lerp(0.06, 0.3, up); out.tgt.fxR = lerp(lerp(0.12, 0.24, amp), 0.05, up);
  out.tgt.lean = 0.05 * amp - 0.1 * (ramp(t, 4.55, 4.88) - ramp(t, 4.92, 5.05));
  return out;
}
export const newCh = () => ({ arm: { L: {}, R: {} }, tgt: {} });

// ---------------------------------------------------------------- the face (closed form)
const pulse = (t, a, close = 0.06, hold = 0.05, open = 0.11) => ramp(t, a, a + close) * (1 - ramp(t, a + close + hold, a + close + hold + open));
export const blinkAt = (t) => Math.max(...BLINKS.map((b, i) => (i === 3 ? pulse(t, b, 0.1, 0.12, 0.2) : pulse(t, b))));   // the last: slow, content
export const happyAt = (t) => ramp(t, 6.44, 6.58) * (1 - ramp(t, 7.92, 8.1));
export function mouthAt(t) {
  // "어?" on the stop, then "안-녕!" and a held open smile while waving
  const oh = 0.32 * ramp(t, 5.05, 5.18) * (1 - ramp(t, 5.42, 5.6));
  const an = 0.95 * ramp(t, 6.46, 6.56) * (1 - ramp(t, 6.62, 6.7));
  const nyeong = 0.8 * ramp(t, 6.7, 6.8) * (1 - ramp(t, 6.95, 7.05));
  const hold = 0.42 * ramp(t, 6.9, 7.05) * (1 - ramp(t, 7.95, 8.15));
  return Math.max(oh, an, nyeong, hold);
}

/**
 * Bake secondary motion + scarf tails from t = BT0 to D at 240 Hz. `tails` = [{ n, seg }] (filled with .bake).
 * Returns { BAKE, BT0, BDT, NB, secAt(t) } — secAt interpolates the springs into the `sec` shape poseRig wants.
 */
export function bakeSecondary(rig, TAILS, D) {
  const BT0 = -1.6, BDT = 1 / 240, NB = Math.ceil((D + 0.1 - BT0) / BDT) + 1;
  const SPR = {
    lean: { w: 2 * Math.PI * 1.7, z: 0.26, k: 16 },          // spine pitch, driven by the root's deceleration
    head: { w: 2 * Math.PI * 2.2, z: 0.3, k: 0.9 },          // head pitch lagging the lean
    hipsF: { w: 2 * Math.PI * 1.7, z: 0.35, k: 3.0 },        // hips forward offset (feet stay planted: IK)
    fore: { w: 2 * Math.PI * 2.0, z: 0.32, k: 0.8 },         // forearm vs upper arm
    hand: { w: 2 * Math.PI * 2.6, z: 0.3, k: 0.8 },          // hand vs forearm
  };
  const KICK = 15;                                              // landing kick gain (see below)
  const KEYS = ['lean', 'headPitch', 'hipsFwd', 'fzL', 'fxL', 'hzL', 'hxL', 'fzR', 'fxR', 'hzR', 'hxR'];
  const BAKE = Object.fromEntries(KEYS.map((k) => [k, new Float32Array(NB)]));
  const st = Object.fromEntries(KEYS.map((k) => [k, { q: 0, v: 0 }]));
  const camTmp = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 30 };
  const chA = newCh(), chB = newCh(), chC = newCh(), PR = {};
  const chAt = (t, out) => { camPose(t, camTmp); pathAt(rootS(t), PR); return channels(t, camTmp.pos, PR, out); };
  const sec = { lean: 0, headPitch: 0, hipsFwd: 0, arm: { L: { fz: 0, fx: 0, hz: 0, hx: 0 }, R: { fz: 0, fx: 0, hz: 0, hx: 0 } } };
  const secFrom = (get) => {
    sec.lean = get('lean'); sec.headPitch = get('headPitch'); sec.hipsFwd = get('hipsFwd');
    for (const k of ['L', 'R']) { const a = sec.arm[k]; a.fz = get('fz' + k); a.fx = get('fx' + k); a.hz = get('hz' + k); a.hx = get('hx' + k); }
    return sec;
  };
  // one semi-implicit Euler step of q̈ = −ω²(q − q*) − 2ζω q̇ − κ·drive ; returns q̈
  const step = (s, P, target, drive) => {
    const acc = -P.w * P.w * (s.q - target) - 2 * P.z * P.w * s.v - P.k * drive;
    s.v += acc * BDT; s.q += s.v * BDT;
    return acc;
  };
  // scarf chains
  const tailAnchor = [new THREE.Vector3(), new THREE.Vector3()];
  for (const T of TAILS) { T.p = []; T.o = []; T.bake = new Float32Array(NB * T.n * 3); }
  const skinBody = (p, out) => rig.skinPoint(p, rig.knot.w, out);
  const GRAV = new THREE.Vector3(0, -7, 0), wind = new THREE.Vector3();     // a light, toy-scaled scarf
  const mInv = new THREE.Matrix4(), mSk = new THREE.Matrix4(), vb = new THREE.Vector3();
  const iSpine = rig.boneIndex.spine, iHips = rig.boneIndex.hips;
  function collide(p) {
    // push a node out of the body: into bind space through the spine (or hips) skin matrix, radially out, back
    for (const bi of [iSpine, iHips]) {
      mSk.multiplyMatrices(rig.bones[bi].matrixWorld, rig.skeleton.boneInverses[bi]);
      vb.copy(p).applyMatrix4(mInv.copy(mSk).invert());
      if ((bi === iSpine && vb.y < 0.74) || (bi === iHips && vb.y >= 0.74)) continue;
      const r = bodyR(vb.y) + 0.016;
      if (r <= 0.02) return;
      const rho = Math.hypot(vb.x, vb.z / 0.88);
      if (rho < r) {
        const k = r / Math.max(rho, 1e-4);
        vb.x *= k; vb.z *= k;
        p.copy(vb.applyMatrix4(mSk));
      }
      return;
    }
  }
  const dirTmp = new THREE.Vector3();
  for (let i = 0; i < NB; i++) {
    const t = BT0 + i * BDT;
    // drives: root acceleration along the path (central difference), arm angle accelerations
    const aF = (rootS(t + BDT) - 2 * rootS(t) + rootS(t - BDT)) / (BDT * BDT);
    chAt(t - BDT, chA); chAt(t + BDT, chC); const ch = chAt(t, chB);
    const acc2 = (f) => (f(chC) - 2 * f(ch) + f(chA)) / (BDT * BDT);
    // store the state at t, pose with it, advance the tails to t
    for (const k of KEYS) BAKE[k][i] = st[k].q;
    secFrom((k) => st[k].q);
    poseRig(rig, t, ch, sec);
    for (let n = 0; n < 2; n++) skinBody(rig.knot.anchor[n], tailAnchor[n]);
    wind.set(0.55, 0, -0.35).multiplyScalar(0.5 + 0.35 * Math.sin(t * 1.3) + 0.2 * Math.sin(t * 3.3 + 1.0));
    TAILS.forEach((T, n) => {
      if (i === 0) {
        for (let j = 0; j < T.n; j++) { const p = tailAnchor[n].clone().add(new THREE.Vector3(0.01 * j, -T.seg * j, 0.012 * j)); T.p.push(p); T.o.push(p.clone()); }
      }
      T.p[0].copy(tailAnchor[n]); T.o[0].copy(tailAnchor[n]);
      for (let j = 1; j < T.n; j++) {
        const p = T.p[j], o = T.o[j];
        dirTmp.subVectors(p, o).multiplyScalar(1 - 1.5 * BDT);
        o.copy(p);
        p.add(dirTmp).addScaledVector(GRAV, BDT * BDT).addScaledVector(wind, BDT * BDT);
      }
      for (let it = 0; it < 10; it++) {
        for (let j = 1; j < T.n; j++) {
          const a = T.p[j - 1], b = T.p[j];
          dirTmp.subVectors(b, a);
          const d = dirTmp.length() || 1e-6, e = (d - T.seg) / d;
          if (j === 1) b.addScaledVector(dirTmp, -e);
          else { a.addScaledVector(dirTmp, 0.5 * e); b.addScaledVector(dirTmp, -0.5 * e); }
        }
        for (let j = 2; j < T.n; j++) {                                    // weak bending: no sharp folds
          const a = T.p[j - 2], b = T.p[j];
          dirTmp.subVectors(b, a);
          const d = dirTmp.length() || 1e-6, min = 1.75 * T.seg;
          if (d < min) { const e = (d - min) / d; if (j === 2) b.addScaledVector(dirTmp, -0.5 * e); else { a.addScaledVector(dirTmp, 0.25 * e); b.addScaledVector(dirTmp, -0.25 * e); } }
        }
        if (it % 5 === 4) for (let j = 1; j < T.n; j++) { collide(T.p[j]); if (T.p[j].y < 0.02) T.p[j].y = 0.02; }
      }
      for (let j = 0; j < T.n; j++) T.bake.set([T.p[j].x, T.p[j].y, T.p[j].z], (i * T.n + j) * 3);
    });
    // integrate the springs from t to t + dt
    // braking leans the body only half as much until the feet close; the closing step then arrests the remaining
    // forward speed v at once, which the mass above the ankles keeps as an angular kick Δω = KICK · v
    if (t < T_STOP && t + BDT >= T_STOP) st.lean.v += KICK * (rootS(t + BDT) - rootS(t - BDT)) / (2 * BDT);
    const aLean = step(st.lean, SPR.lean, ch.tgt.lean, aF * (0.5 + 0.5 * ramp(t, T_STOP - 0.1, T_STOP)));
    step(st.headPitch, SPR.head, 0, aLean);
    step(st.hipsFwd, SPR.hipsF, 0, aF);
    for (const k of ['L', 'R']) {
      const dz = acc2((c) => c.arm[k].raise), dx = acc2((c) => c.arm[k].fwd);
      const fz = step(st['fz' + k], SPR.fore, ch.tgt['fz' + k], dz);
      const fx = step(st['fx' + k], SPR.fore, ch.tgt['fx' + k], dx);
      step(st['hz' + k], SPR.hand, 0, dz + fz);
      step(st['hx' + k], SPR.hand, 0, dx + fx);
    }
  }
  const sample = (arr, f) => { const i = Math.floor(f), u = f - i; return lerp(arr[i], arr[i + 1], u); };
  const secAt = (t) => { const f = clamp((t - BT0) / BDT, 0, NB - 2); return secFrom((k) => sample(BAKE[k], f)); };
  return { BAKE, BT0, BDT, NB, secAt };
}
