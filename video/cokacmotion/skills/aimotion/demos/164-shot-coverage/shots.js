/*
 * shots.js — the coverage: one staged scene, eleven virtual set-ups, written as data.
 *
 *   A shot is { t0, label, f (mm), N (f-number), subject, size, k, placement, sx, sy, push }.
 *     lens      vertical field of view  fov = 2·atan(SENSOR_H / 2f)                      (fovOf)
 *     size      the subject's height `size` fills the fraction k of the frame height, so the frame height at the
 *               subject is size / k and the distance is  d = (size / k) · f / SENSOR_H     (distOf)
 *     placement 'frame': from the subject along azimuth az / elevation el;  'ots': from the subject through a
 *               pass point just outside the near character's shoulder (an over-the-shoulder set-up)
 *     aim       the camera pans/tilts (no roll) so the subject lands at NDC (sx, sy) — exact, see aim()
 *     push      slow eased push-in inside the shot: d(u) = d·(1 − push·(1 − (1 − u)²)), u = shot progress
 *
 *   The 180° rule: the axis line runs A → B. Every camera must stand in one half-plane of it, i.e. the 2D cross
 *   product (B − A) × (C − A) keeps one sign (positive = the +z side). audit() checks it for every shot, together
 *   with the screen-direction it protects (A left of B) and the eyelines (A looks screen-right, B screen-left).
 */
import * as THREE from 'three';
import { CH, SIZE_CH, EYE, facePoint, BERRY, MEET } from './layout.js';

export const SENSOR_H = 0.024;                 // m: long side of a 13.5 × 24 mm virtual sensor (the 9:16 frame)
export const ASPECT = 1080 / 1920;
export const fovOf = (fmm) => 2 * Math.atan(SENSOR_H / (2 * fmm / 1000));
export const distOf = (size, k, fmm) => (size / k) * (fmm / 1000) / SENSOR_H;

// subjects (rest pose)
const P = {
  table: new THREE.Vector3(0, 0.98, -0.25),
  two: new THREE.Vector3(0, 0.9, 0.0),
  faceA: facePoint(CH.A, 0, 0.05), faceB: facePoint(CH.B, 0, 0.05),
  eyeA: facePoint(CH.A, CH.A.cam * EYE.ex, EYE.ey), eyeB: facePoint(CH.B, CH.B.cam * EYE.ex, EYE.ey),
  eyesA: facePoint(CH.A, 0, EYE.ey), eyesB: facePoint(CH.B, 0, EYE.ey),      // between the two eyes
  // a point just outside the near character's silhouette as seen from the far one (camera side, a little up):
  // OTS cameras stand on the line from the subject through it, so the near shoulder fills one side of the frame
  passA: new THREE.Vector3(CH.A.x, 0.96, 0.2 + 0.04), passB: new THREE.Vector3(CH.B.x, 0.96, 0.2 + 0.04),
  berry: BERRY.clone(), meet: MEET.clone(),
  reveal: new THREE.Vector3(0, 0.9, -0.12),
};
export const SUBJECTS = P;

// azimuth of a character's face direction (the camera stands in front of the face, a bit off it)
const faceAz = (ch) => Math.atan2(Math.sin(ch.yaw), Math.cos(ch.yaw));

// cut times: shot lengths shrink toward the climax, then one long wide
//  1.6  1.0  0.8  0.7  0.5  0.36  0.32  0.28 | 0.47  0.97 (action across the cut) | 3.0
export const REACH0 = 5.80, REACH_LEN = 0.70, CLINK = REACH0 + REACH_LEN;   // forks meet at 6.5 s
export const CUT_ON_ACTION = REACH0 + REACH_LEN / 3;                          // 6.033: a third into the reach

export const SHOTS = [
  { t0: 0.00, label: '와이드', f: 24, N: 8, sub: P.table, size: SIZE_CH, k: 0.135, kind: 'frame', az: -0.2, el: 0.2, sx: 0, sy: -0.2, push: 0.1 },
  { t0: 1.60, label: '투 샷', f: 35, N: 4, sub: P.two, size: SIZE_CH, k: 0.25, kind: 'frame', az: 0.0, el: 0.13, sx: 0, sy: 0.05, push: 0.06 },
  { t0: 2.60, label: '어깨 너머', f: 40, N: 2.2, sub: P.faceB, size: SIZE_CH, k: 0.5, kind: 'ots', pass: P.passA, sx: 0.3, sy: 0.12, push: 0.06, who: 'B' },
  { t0: 3.40, label: '어깨 너머 (역)', f: 40, N: 2.2, sub: P.faceA, size: SIZE_CH, k: 0.5, kind: 'ots', pass: P.passB, sx: -0.3, sy: 0.12, push: 0.06, who: 'A' },
  { t0: 4.10, label: '인서트', f: 100, N: 2.8, sub: P.berry, size: 0.042, k: 0.2, kind: 'frame', az: 0.12, el: 0.3, sx: 0, sy: -0.08, push: 0.1 },
  { t0: 4.60, label: '익스트림 클로즈업', f: 135, N: 4, sub: P.eyesB, size: 2 * EYE.r, k: 0.2, kind: 'frame', az: faceAz(CH.B) + 0.1, el: 0.04, sx: 0.02, sy: 0.1, push: 0.07, who: 'B' },
  { t0: 4.96, label: '익스트림 클로즈업', f: 135, N: 4, sub: P.eyesA, size: 2 * EYE.r, k: 0.235, kind: 'frame', az: faceAz(CH.A) - 0.1, el: 0.04, sx: -0.02, sy: 0.1, push: 0.08, who: 'A' },
  { t0: 5.28, label: '익스트림 클로즈업', f: 135, N: 4, sub: P.eyesB, size: 2 * EYE.r, k: 0.275, kind: 'frame', az: faceAz(CH.B) + 0.1, el: 0.04, sx: 0.02, sy: 0.1, push: 0.09, who: 'B' },
  { t0: 5.56, label: '바스트', f: 50, N: 2.8, sub: P.faceA, size: SIZE_CH, k: 0.46, kind: 'frame', az: faceAz(CH.A) - 0.42, el: 0.12, sx: -0.1, sy: 0.18, push: 0.05, who: 'A' },
  { t0: CUT_ON_ACTION, label: '부감', f: 24, N: 4, sub: P.meet, size: 0.2, k: 0.3, kind: 'frame', az: 0.0, el: 1.5, sx: 0, sy: 0.42, push: 0.16, ev: -0.3 },
  { t0: 7.00, label: '와이드', f: 35, N: 8, sub: P.reveal, size: SIZE_CH, k: 0.3, kind: 'frame', az: 0.06, el: 0.17, sx: 0, sy: -0.02, push: -0.75 },
];
export const DURATION = 10;
SHOTS.forEach((s, i) => { s.i = i; s.t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].t0 : DURATION; s.fov = fovOf(s.f); s.d = distOf(s.size, s.k, s.f); });

export function shotIndex(t) {
  let i = 0;
  while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].t0) i++;
  return i;
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/**
 * Pan/tilt (no roll) that puts world point `sub` at NDC (sx, sy) for a camera at `pos`.
 * Camera-space ray to the subject ∝ (a, b, −1), a = sx·tan(hfov/2), b = sy·tan(vfov/2). With R = Ry(ψ)·Rx(φ):
 *   y:  b·cosφ + sinφ = U_y·n      → φ = asin(U_y·n / √(1 + b²)) − atan b
 *   xz: Ry adds ψ to atan2(x, z)    → ψ = atan2(U_x, U_z) − atan2(a, b·sinφ − cosφ)
 */
export function aim(pos, sub, sx, sy, fov) {
  const tv = Math.tan(fov / 2), th = tv * ASPECT;
  const a = sx * th, b = sy * tv, n = Math.hypot(a, b, 1);
  const U = sub.clone().sub(pos).normalize();
  const phi = Math.asin(clamp((U.y * n) / Math.hypot(1, b), -1, 1)) - Math.atan(b);
  const psi = Math.atan2(U.x, U.z) - Math.atan2(a, b * Math.sin(phi) - Math.cos(phi));
  return { yaw: psi, pitch: phi };
}

const _d = new THREE.Vector3();
/** camera pose of shot i at shot progress u ∈ [0, 1] → { pos, yaw, pitch, fov, focus, N, f } */
export function shotPose(i, u, out = { pos: new THREE.Vector3() }) {
  const s = SHOTS[i];
  const e = 1 - (1 - u) * (1 - u);                        // eased: the move is already running at the cut, settles late
  const d = s.d * (1 - s.push * e);
  if (s.kind === 'ots') _d.copy(s.pass).sub(s.sub).normalize();
  else _d.set(Math.sin(s.az) * Math.cos(s.el), Math.sin(s.el), Math.cos(s.az) * Math.cos(s.el));
  out.pos.copy(s.sub).addScaledVector(_d, d);
  const { yaw, pitch } = aim(out.pos, s.sub, s.sx, s.sy, s.fov);
  out.yaw = yaw; out.pitch = pitch; out.fov = s.fov; out.N = s.N; out.f = s.f;
  // focus distance along the optical axis (thin-lens S_f)
  const fwd = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
  out.focus = s.sub.clone().sub(out.pos).dot(fwd);
  return out;
}

/** apply a pose to a THREE.PerspectiveCamera (plus an optional small shake in radians) */
export function applyPose(cam, P, shakeYaw = 0, shakePitch = 0) {
  cam.position.copy(P.pos);
  cam.rotation.set(P.pitch + shakePitch, P.yaw + shakeYaw, 0, 'YXZ');
  cam.fov = THREE.MathUtils.radToDeg(P.fov);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
}

/** the 180° test: sign of (B − A) × (C − A) in the plan (x, z); > 0 = the camera side of the axis line */
export function sideOfAxis(C) {
  const ax = CH.A.x, az = 0, bx = CH.B.x, bz = 0;
  return (bx - ax) * (C.z - az) - (bz - az) * (C.x - ax);
}

/**
 * Audit every shot at u = 0, ½, 1:
 *   axis   camera in the +z half-plane (cross product > 0)
 *   screen A's face projects left of B's face (screen direction kept)
 *   eyes   for each character, the gaze target lands on the side it should: A → right, B → left
 * gazeAt(key, t) returns the world point that character looks at at time t.
 */
export function audit(gazeAt) {
  const cam = new THREE.PerspectiveCamera(30, ASPECT, 0.01, 50);
  const P = { pos: new THREE.Vector3() }, rows = [];
  const cx = (p) => { const q = p.clone().applyMatrix4(cam.matrixWorldInverse); return q.x / -q.z; };   // camera-space slope
  for (const s of SHOTS) {
    const r = { i: s.i, label: s.label, axis: true, screen: true, eyes: true, cross: Infinity };
    for (const u of [0, 0.5, 1]) {
      shotPose(s.i, u, P); applyPose(cam, P);
      const c = sideOfAxis(P.pos);
      r.cross = Math.min(r.cross, c);
      if (!(c > 0)) r.axis = false;
      if (!(cx(SUBJECTS.faceA) < cx(SUBJECTS.faceB))) r.screen = false;
      const t = s.t0 + u * (s.t1 - s.t0) - 1e-4 * (u === 1);
      for (const [k, eye, sign] of [['A', SUBJECTS.eyeA, 1], ['B', SUBJECTS.eyeB, -1]]) {
        const g = gazeAt(k, t);
        if (!(sign * (cx(g) - cx(eye)) > 0)) r.eyes = false;
      }
    }
    rows.push(r);
  }
  return rows;
}

/** are all the given world points outside the frame of shot pose P? (keeps the cat off-screen until the reveal) */
export function pointsOffscreen(P, pts) {
  const cam = new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(P.fov), ASPECT, 0.01, 50);
  applyPose(cam, P);
  const tv = Math.tan(P.fov / 2), th = tv * ASPECT, q = new THREE.Vector3();
  for (const p of pts) {
    q.copy(p).applyMatrix4(cam.matrixWorldInverse);
    if (q.z < 0 && Math.abs(q.x) < -q.z * th && Math.abs(q.y) < -q.z * tv) return false;
  }
  return true;
}

/** every vertex of an object tree in world space */
export function worldVertices(root, step = 1) {
  const out = [];
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    const P = o.geometry.attributes.position;
    for (let i = 0; i < P.count; i += step) out.push(new THREE.Vector3().fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld));
  });
  return out;
}
