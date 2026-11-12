/*
 * motion.js — everything that moves the rig, as functions of t.
 *
 *   path      x(z) in the ground plane, re-sampled by arc length s; the character walks toward +z (the camera).
 *   plants    the footstep schedule: plant k = { side, landing time τ_k, arc length a_k }. Steady steps, then
 *             shorter and slower ones, then a closing step that brings the feet together at T_STOP.
 *   root      s(t): a monotone cubic through (mid-stance time, plant arc length) — the hips pass over each planted
 *             foot exactly at its mid-stance, so stance feet never have to slide.
 *   feet      stance = locked on the plant with heel-strike / toe-off roll about heel or toe pivot; swing = an eased
 *             arc between consecutive plants of the same foot. Each foot gives an ankle target + a foot rotation.
 *   IK        analytic two-bone IK per leg: law of cosines for the hip angle, a pole vector for the knee.
 *   pose      root → hips (bob, sway, waddle, pelvic yaw) → spine (counter-rotation, lean, squash) → head → arms,
 *             then the legs by IK. Secondary motion (lean overshoot, head follow-through, arm drag) arrives
 *             pre-baked in `sec` (see main.js bake).
 */
import * as THREE from 'three';
import { clamp, lerp, smooth, ramp } from '../_lib/stage.js';
import { L } from './rig.js';

// ---------------------------------------------------------------- the park path, by arc length
export function pathX(z) {
  if (z >= 0) return 0;
  if (z >= -4) { const s = Math.sin((Math.PI * z) / 8); return 0.42 * s * s; }
  return 0.42 + 0.00274 * (z + 4) * (z + 4);            // far away it bends off toward the sunrise
}
const Z0 = -130, Z1 = 30, DZ = 0.005, DS = 0.01;
export const PATH = (() => {
  const n = Math.round((Z1 - Z0) / DZ) + 1;
  const sz = new Float64Array(n), sx = new Float64Array(n), ss = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    sz[i] = Z0 + i * DZ; sx[i] = pathX(sz[i]);
    if (i) ss[i] = ss[i - 1] + Math.hypot(sx[i] - sx[i - 1], sz[i] - sz[i - 1]);
  }
  const len = ss[n - 1], m = Math.floor(len / DS) + 1;
  const X = new Float64Array(m), Z = new Float64Array(m);
  for (let k = 0, j = 0; k < m; k++) {
    const s = k * DS;
    while (j < n - 2 && ss[j + 1] < s) j++;
    const f = (s - ss[j]) / (ss[j + 1] - ss[j]);
    X[k] = lerp(sx[j], sx[j + 1], f); Z[k] = lerp(sz[j], sz[j + 1], f);
  }
  let end = 0;
  for (let k = 0; k < m; k++) if (Z[k] <= 0) end = k * DS + (-Z[k]) / Math.max(1e-9, (Z[k + 1] - Z[k]) / DS);
  return { X, Z, len, end };
})();
/** point + heading (ψ: forward = (sin ψ, 0, cos ψ)) at arc length s */
export function pathAt(s, out = {}) {
  const f = clamp(s / DS, 0, PATH.X.length - 2), k = Math.floor(f), u = f - k;
  out.x = lerp(PATH.X[k], PATH.X[k + 1], u);
  out.z = lerp(PATH.Z[k], PATH.Z[k + 1], u);
  const k0 = Math.max(0, k - 2), k1 = Math.min(PATH.X.length - 1, k + 3);
  out.psi = Math.atan2(PATH.X[k1] - PATH.X[k0], PATH.Z[k1] - PATH.Z[k0]);
  return out;
}

// ---------------------------------------------------------------- gait constants
export const GAIT = {
  h: 0.40,        // land-to-land interval of the steady walk (half a cycle)
  Tsw: 0.30,      // swing duration
  step: 0.24,     // steady step length (arc length between consecutive plants)
  w: L.hip[0],    // lateral offset of a footprint from the path = hip joint offset
  toeOut: 0.09,   // feet point outward a little (rad)
  lift: 0.075,    // swing height
  rhoToe: 0.5, rhoHeel: 0.3,       // toe-off heel lift / heel-strike toe lift (rad)
  toeZ: 0.10, heelZ: -0.07,        // roll pivots in front of / behind the ankle
  ankleH: L.ankle,
  T_STOP: 5.0,    // the closing step lands
};
// the stop: the last steps get shorter and slower; the final one only closes the feet (length 0 = beside)
const TAIL = [[0.23, 0.41], [0.19, 0.42], [0.0, 0.44]];
const N_STEADY = 20;

export const PLANTS = (() => {
  const lens = [], durs = [];
  for (let i = 0; i < N_STEADY; i++) { lens.push(GAIT.step); durs.push(GAIT.h); }
  for (const [l, d] of TAIL) { lens.push(l); durs.push(d); }
  const N = lens.length;
  const tau = new Float64Array(N), arc = new Float64Array(N), side = new Int8Array(N);
  tau[N - 1] = GAIT.T_STOP; arc[N - 1] = PATH.end;
  for (let k = N - 1; k > 0; k--) { tau[k - 1] = tau[k] - durs[k]; arc[k - 1] = arc[k] - lens[k]; }
  for (let k = 0; k < N; k++) side[k] = (N - 1 - k) % 2 === 0 ? 1 : -1;   // the closing foot is the left
  const plants = [];
  const P = {};
  for (let k = 0; k < N; k++) {
    pathAt(arc[k], P);
    const lx = Math.cos(P.psi), lz = -Math.sin(P.psi);                      // the character's left
    plants.push({ k, side: side[k], tau: tau[k], arc: arc[k], x: P.x + lx * side[k] * GAIT.w, z: P.z + lz * side[k] * GAIT.w,
      psi: P.psi + side[k] * GAIT.toeOut });
  }
  for (const p of plants) {
    p.prev = plants[p.k - 2] || null;                                       // same foot, one plant back
    p.next = plants[p.k + 2] || null;
    p.lift = p.next ? p.next.tau - GAIT.Tsw : Infinity;                     // when this plant is left
    p.dist = p.prev ? Math.hypot(p.x - p.prev.x, p.z - p.prev.z) : GAIT.step * 2;
  }
  return plants;
})();

// ---------------------------------------------------------------- root trajectory: monotone cubic through mid-stances
function monotone(xs, ys, m0, mEnd) {
  const n = xs.length, d = new Float64Array(n - 1), m = new Float64Array(n);
  for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
  m[0] = m0; m[n - 1] = mEnd;
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {                                        // Fritsch–Carlson: no overshoot
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], r = a * a + b * b;
    if (r > 9) { const k = 3 / Math.sqrt(r); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return (x) => {
    if (x <= xs[0]) return ys[0] + m0 * (x - xs[0]);
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (xs[i + 1] < x) i++;
    const h = xs[i + 1] - xs[i], u = (x - xs[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
  };
}
export const ROOT_KEYS = (() => {
  const xs = [], ys = [];
  for (const p of PLANTS) if (p.next) { xs.push((p.tau + p.lift) / 2); ys.push(p.arc); }   // mid-stance
  xs.push(GAIT.T_STOP + 0.16); ys.push(PATH.end);                                          // at rest over both feet
  return { xs, ys };
})();
export const rootS = monotone(ROOT_KEYS.xs, ROOT_KEYS.ys, GAIT.step / GAIT.h, 0);

/** continuous step count Φ (integer at each landing) and the plant that carries the weight */
export function stepPhase(t) {
  let k = 0;
  while (k < PLANTS.length - 1 && PLANTS[k + 1].tau <= t) k++;
  const p = PLANTS[k], nx = PLANTS[k + 1];
  const frac = nx ? clamp((t - p.tau) / (nx.tau - p.tau)) : clamp((t - p.tau) / 0.46);
  return { k, frac, side: p.side };
}
/** walk amplitude: 1 while walking, fading through the stop */
export const walkAmp = (t) => 1 - ramp(t, GAIT.T_STOP - 0.75, GAIT.T_STOP + 0.15);

// ---------------------------------------------------------------- feet
const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
/** one foot at time t: footprint point F (ground, under the ankle when flat), heading, pitch α (+ heel up), height h */
export function footState(t, side, out = {}) {
  // the latest plant of this foot that has landed
  let p = null;
  for (const q of PLANTS) if (q.side === side && q.tau <= t) p = q;
  if (!p) p = PLANTS.find((q) => q.side === side);
  const nx = p.next;
  const rollK = (q) => Math.min(1, q.dist / 0.4);
  if (nx && t >= p.lift) {
    // swing toward nx
    const u = clamp((t - p.lift) / GAIT.Tsw), e = u * u * (3 - 2 * u);
    const lx = Math.cos(p.psi - side * GAIT.toeOut), lz = -Math.sin(p.psi - side * GAIT.toeOut);
    const arcOut = 0.022 * Math.sin(Math.PI * u) * side;                     // a little outward arc: the waddle
    out.x = lerp(p.x, nx.x, e) + lx * arcOut;
    out.z = lerp(p.z, nx.z, e) + lz * arcOut;
    out.psi = lerpAng(p.psi, nx.psi, e);
    const lift = GAIT.lift * (0.3 + 0.7 * Math.min(1, nx.dist / 0.45));
    out.h = lift * 4 * u * (1 - u) * (1 + 0.4 * (0.5 - u));                 // peak a little before mid-swing
    out.alpha = lerp(GAIT.rhoToe * rollK(nx), -GAIT.rhoHeel * rollK(nx), smooth(u));
    out.swing = u;
  } else {
    out.x = p.x; out.z = p.z; out.psi = p.psi; out.h = 0; out.swing = -1;
    let a = -GAIT.rhoHeel * rollK(p) * (1 - smooth((t - p.tau) / 0.09));   // heel strike → foot flat
    if (nx) a += GAIT.rhoToe * rollK(nx) * smooth((t - (p.lift - 0.13)) / 0.13);   // heel rises before toe-off
    out.alpha = a;
  }
  return out;
}
/** ankle position + foot world rotation from a foot state: the foot rolls about the toe pivot (α ≥ 0) or heel pivot */
const _qy = new THREE.Quaternion(), _qx = new THREE.Quaternion(), X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0);
export function footPose(f, ankle, quat) {
  const piv = f.alpha >= 0 ? GAIT.toeZ : GAIT.heelZ, ca = Math.cos(f.alpha), sa = Math.sin(f.alpha);
  const ly = GAIT.ankleH * ca + piv * sa;                // (0, ankleH, −piv) rotated by Rx(α), + (0, 0, piv)
  const lz = GAIT.ankleH * sa - piv * ca + piv;
  ankle.set(f.x + Math.sin(f.psi) * lz, ly + f.h, f.z + Math.cos(f.psi) * lz);
  quat.multiplyQuaternions(_qy.setFromAxisAngle(Y, f.psi), _qx.setFromAxisAngle(X, f.alpha));
}

// ---------------------------------------------------------------- analytic two-bone IK
const _a = new THREE.Vector3(), _pp = new THREE.Vector3(), _bx = new THREE.Vector3(), _by = new THREE.Vector3(), _bz = new THREE.Vector3();
const _mb = new THREE.Matrix4();
/** world rotation whose +y is `up` (bone points along −up) and whose +z is the pole direction made orthogonal */
function basisQuat(up, pole, out) {
  _by.copy(up).normalize();
  _bz.copy(pole).addScaledVector(_by, -pole.dot(_by)).normalize();
  _bx.crossVectors(_by, _bz);
  return out.setFromRotationMatrix(_mb.makeBasis(_bx, _by, _bz));
}
/**
 * Hip H, ankle target A, pole direction P (where the knee should point), lengths l1 (thigh), l2 (shin).
 *   d = |A − H| clamped to [|l1 − l2|, l1 + l2]
 *   cos θ = (l1² + d² − l2²) / (2 l1 d)               (law of cosines: angle at the hip between H→A and the thigh)
 *   K = H + l1 (cos θ · â + sin θ · p̂),   p̂ = P minus its component along â, normalised
 * Returns the knee K and the world rotations of thigh and shin (bones point along their local −y).
 */
export function twoBoneIK(H, A, P, l1, l2, out) {
  _a.subVectors(A, H);
  const dRaw = _a.length();
  const d = clamp(dRaw, Math.abs(l1 - l2) + 1e-4, (l1 + l2) * 0.9995);
  _a.multiplyScalar(1 / dRaw);
  const c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), s = Math.sqrt(1 - c * c);
  _pp.copy(P).addScaledVector(_a, -P.dot(_a)).normalize();
  out.knee.copy(H).addScaledVector(_a, l1 * c).addScaledVector(_pp, l1 * s);
  out.end.copy(H).addScaledVector(_a, d);
  basisQuat(_by.subVectors(H, out.knee), _pp, out.qThigh);
  basisQuat(_by.subVectors(out.knee, out.end), _pp, out.qShin);
  out.stretch = dRaw / (l1 + l2);
  return out;
}

// ---------------------------------------------------------------- the pose at t
const qTmp = new THREE.Quaternion(), qParent = new THREE.Quaternion(), qFoot = new THREE.Quaternion();
const vH = new THREE.Vector3(), vA = new THREE.Vector3(), vPole = new THREE.Vector3();
const eul = new THREE.Euler(0, 0, 0, 'YXZ');
const qx = (a) => new THREE.Quaternion().setFromAxisAngle(X, a);
const qz = (a) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), a);
const IKO = { knee: new THREE.Vector3(), end: new THREE.Vector3(), qThigh: new THREE.Quaternion(), qShin: new THREE.Quaternion(), stretch: 0 };
const FS = {}, PP = {};

/**
 * Pose the rig at t. `ch` = closed-form channels for t (from main.js: wave, look, squash, tilts…),
 * `sec` = baked secondary motion at t (lean, headPitch, hipsFwd, arm springs).
 */
export function poseRig(rig, t, ch, sec) {
  const B = rig.B;
  // root on the path
  const s = rootS(t);
  pathAt(s, PP);
  B.root.position.set(PP.x, 0, PP.z);
  B.root.rotation.set(0, PP.psi, 0);

  // gait channels from the step phase
  const amp = walkAmp(t), ph = stepPhase(t), sd = ph.side, fr = ph.frac;
  const bob = -0.012 * Math.cos(2 * Math.PI * (fr - 0.12)) * amp;            // lowest just after each landing
  const sway = 0.028 * sd * Math.sin(Math.PI * fr) * amp;                    // over the stance foot
  const roll = -0.065 * sd * Math.sin(Math.PI * fr) * amp;                   // the waddle: tilt over the stance foot
  const yaw = -0.09 * sd * Math.cos(Math.PI * fr) * amp;                     // pelvic rotation: the swing hip leads

  // hips
  const hipsY = lerp(0.452, 0.468, 1 - amp) + bob + ch.dip;
  B.hips.position.set(sway + ch.hipsSide, hipsY, sec.hipsFwd);
  B.hips.quaternion.setFromEuler(eul.set(0.03 * amp, yaw, roll, 'YXZ'));
  // spine: counter-rotates the pelvis, leans, squashes (volume kept: sx = sz = 1/√sy)
  B.spine.quaternion.setFromEuler(eul.set(sec.lean + ch.leanAdd, -0.75 * yaw, -0.7 * roll + ch.spineRoll, 'YXZ'));
  const sy = 1 - ch.squash;
  B.spine.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy));
  // head: follow-through pitch, look toward the camera, tilts
  B.head.quaternion.setFromEuler(eul.set(sec.headPitch + ch.headPitch, ch.headYaw, -0.4 * roll + ch.headRoll, 'YXZ'));

  // arms: upper arm = closed form (swing about x, raise about z); forearm + hand = baked springs (overlap)
  for (const [k, sgn] of [['L', 1], ['R', -1]]) {
    const A = ch.arm[k], S = sec.arm[k];
    B['upperArm' + k].quaternion.multiplyQuaternions(qx(-A.fwd), qz(sgn * A.raise));
    B['lowerArm' + k].quaternion.multiplyQuaternions(qx(-S.fx), qz(sgn * S.fz));
    B['hand' + k].quaternion.multiplyQuaternions(qx(-S.hx), qz(sgn * S.hz));
  }

  // legs: world-space ankle targets from the footstep schedule → two-bone IK → local rotations
  rig.mesh.updateMatrixWorld(true);
  B.hips.getWorldQuaternion(qParent);
  const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(qParent), left = new THREE.Vector3(1, 0, 0).applyQuaternion(qParent);
  rig.ik = rig.ik || {};
  for (const [k, sgn] of [['L', 1], ['R', -1]]) {
    footState(t, sgn, FS);
    footPose(FS, vA, qFoot);
    B['thigh' + k].getWorldPosition(vH);
    vPole.copy(fwd).addScaledVector(left, sgn * 0.22);                       // knees forward and a little outward
    twoBoneIK(vH, vA, vPole, L.thigh, L.shin, IKO);
    B['thigh' + k].quaternion.copy(qTmp.copy(qParent).invert().multiply(IKO.qThigh));
    B['shin' + k].quaternion.copy(qTmp.copy(IKO.qThigh).invert().multiply(IKO.qShin));
    B['foot' + k].quaternion.copy(qTmp.copy(IKO.qShin).invert().multiply(qFoot));
    rig.ik[k] = { stretch: IKO.stretch, h: FS.h, x: FS.x, z: FS.z, psi: FS.psi, swing: FS.swing };
  }
  rig.mesh.updateMatrixWorld(true);
  return PP;
}
