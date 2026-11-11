/*
 * cast.js — two round characters and a cat, built from primitives (no models).
 *
 *   character  one sphere body (the head IS the body) on a stool; face parts sit on the body surface, each oriented
 *              to the surface normal: eyes (sclera + flattened iris that turns toward the gaze target + catch-light),
 *              upper/lower lids (hemispheres in the body colour, rotated about the eye's x axis), brows (capsules
 *              rotated about the normal), cheeks, a mouth. A noodle arm (cylinder between shoulder and hand) holds a
 *              fork extruded from a 2D outline with bevelled tines.
 *   cat        sphere parts that blend between a loaf (asleep) and sitting, a tube tail, open / closed eyes.
 */
import * as THREE from 'three';
import { lerp, clamp, smooth } from '../_lib/stage.js';
import { CH, BODY, EYE, MEET, FORK_LEN, TABLE_Y } from './layout.js';

export const PAL = {
  cream: '#f6ead8', latte: '#dfc29c', caramel: '#b57b4c', cocoa: '#4a3329',
  butter: '#f2c766', butterDeep: '#e3a94a', sage: '#9fbf8f', sageDeep: '#6f9563',
  ash: '#8d8489', ashDark: '#3a3337', apricot: '#efae86', sclera: '#fbf6ee', metal: '#d8d2c8',
  berry: '#d01f35',                                                    // the one accent
};

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const sphere = (r, w = 32, h = 24) => new THREE.SphereGeometry(r, w, h);
const std = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });

/** orient obj so its local +z is n and its local +y leans toward world up */
function orient(obj, n, up = UP) {
  const x = new THREE.Vector3().crossVectors(up, n);
  if (x.lengthSq() < 1e-8) x.set(1, 0, 0);
  x.normalize();
  const y = new THREE.Vector3().crossVectors(n, x);
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, n));
}
/** unit cylinder (axis y, length 1) stretched between a and b */
const _m = new THREE.Vector3(), _ax = new THREE.Vector3();
export function limb(mesh, a, b) {
  _m.copy(a).add(b).multiplyScalar(0.5);
  _ax.copy(b).sub(a);
  const len = Math.max(1e-4, _ax.length());
  mesh.position.copy(_m);
  mesh.quaternion.setFromUnitVectors(UP, _ax.multiplyScalar(1 / len));
  mesh.scale.set(1, len, 1);
}

// ---------------------------------------------------------------- the fork: a 2D outline (handle, neck, 4 tines), extruded with a bevel
function forkGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-0.0068, 0.008);
  s.absarc(0, 0.008, 0.0068, Math.PI, Math.PI * 2, false);
  s.lineTo(0.0076, 0.1);
  s.quadraticCurveTo(0.0068, 0.116, 0.0043, 0.126);
  s.quadraticCurveTo(0.0128, 0.134, 0.0128, 0.15);
  const W = 0.0128, wt = 0.0047, g = (2 * W - 4 * wt) / 3, top = 0.191, gapY = 0.168;
  for (let k = 3; k >= 0; k--) {
    const xl = -W + k * (wt + g), xr = xl + wt;
    s.lineTo(xr, top - wt / 2);
    s.absarc(xl + wt / 2, top - wt / 2, wt / 2, 0, Math.PI, false);
    if (k > 0) {
      s.lineTo(xl, gapY + g / 2);
      s.absarc(xl - g / 2, gapY + g / 2, g / 2, 0, Math.PI, true);
    }
  }
  s.lineTo(-W, 0.15);
  s.quadraticCurveTo(-W, 0.134, -0.0043, 0.126);
  s.quadraticCurveTo(-0.0068, 0.116, -0.0076, 0.1);
  s.lineTo(-0.0068, 0.008);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.0022, bevelEnabled: true, bevelThickness: 0.0008, bevelSize: 0.0007, bevelSegments: 2, curveSegments: 6 });
  geo.translate(0, -0.022, -0.0011);                      // the grip point to the origin, thickness centred
  geo.rotateX(Math.PI / 2);                               // length → +z, flat face up
  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------- stool
function stoolGeometry() {
  const seat = new THREE.LatheGeometry([V(0, 0.62, 0), V(0.16, 0.62, 0), V(0.175, 0.632, 0), V(0.178, 0.66, 0), V(0.168, 0.674, 0), V(0, 0.676, 0)].map((p) => new THREE.Vector2(p.x, p.y)), 40);
  return seat;
}

export function buildCharacter(key, shared) {
  const ch = CH[key];
  const bodyCol = key === 'A' ? PAL.butter : PAL.sage, deep = key === 'A' ? PAL.butterDeep : PAL.sageDeep;
  const bodyMat = std(bodyCol, 0.68);
  const deepMat = std(deep, 0.7);
  const root = new THREE.Group();
  root.position.set(ch.x, 0, 0);
  root.rotation.y = ch.yaw;

  // stool: wooden seat + three legs (mostly seen in the wides)
  const stool = new THREE.Group();
  const seat = new THREE.Mesh(shared.stoolGeo, shared.wood);
  seat.castShadow = seat.receiveShadow = true;
  stool.add(seat);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const leg = new THREE.Mesh(shared.unitCyl, shared.wood);
    limb(leg, V(Math.cos(a) * 0.12, 0.62, Math.sin(a) * 0.12), V(Math.cos(a) * 0.16, 0, Math.sin(a) * 0.16));
    leg.scale.x = leg.scale.z = 0.018;
    leg.castShadow = true;
    stool.add(leg);
  }
  root.add(stool);

  const pivot = new THREE.Group();
  pivot.position.y = BODY.pivot;
  pivot.rotation.order = 'YXZ';
  root.add(pivot);
  const bodyG = new THREE.Group();
  pivot.add(bodyG);
  const body = new THREE.Mesh(sphere(BODY.r, 64, 48), bodyMat);
  body.position.y = BODY.cy - BODY.pivot;
  body.scale.set(1, BODY.sy, 1);
  body.castShadow = body.receiveShadow = true;
  bodyG.add(body);
  const face = new THREE.Group();
  face.position.y = BODY.cy - BODY.pivot;
  bodyG.add(face);

  // a point on the (scaled) body surface in face coordinates, and its normal
  const surf = (ex, ey, out = 0) => {
    const dx = Math.sin(ex) * Math.cos(ey), dy = Math.sin(ey), dz = Math.cos(ex) * Math.cos(ey);
    const n = V(dx, dy / BODY.sy, dz).normalize();
    return { p: V(BODY.r * dx, BODY.r * dy * BODY.sy, BODY.r * dz).addScaledVector(n, out), n };
  };

  // eyes, lids, brows
  const capGeo = new THREE.SphereGeometry(EYE.r + 0.0026, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  const eyes = [];
  for (const s of [-1, 1]) {
    const g = new THREE.Group();
    const { p, n } = surf(s * EYE.ex, EYE.ey, -0.013);
    g.position.copy(p); orient(g, n);
    face.add(g);
    g.add(new THREE.Mesh(sphere(EYE.r, 36, 28), shared.sclera));
    const irisPivot = new THREE.Group();
    g.add(irisPivot);
    const iris = new THREE.Mesh(sphere(0.0215, 32, 24), shared.iris);
    iris.scale.set(1, 1, 0.42);
    iris.position.z = EYE.r - 0.0046;
    irisPivot.add(iris);
    const catchL = new THREE.Mesh(sphere(0.0056, 16, 12), shared.catchMat);
    g.add(catchL);
    const lidU = new THREE.Group(), lidL = new THREE.Group();
    const mu = new THREE.Mesh(capGeo, bodyMat), ml = new THREE.Mesh(capGeo, bodyMat);
    ml.rotation.z = Math.PI;
    lidU.add(mu); lidL.add(ml);
    g.add(lidU, lidL);
    const bp = surf(s * (EYE.ex + 0.03), EYE.ey + 0.245, -0.003);
    const brow = new THREE.Group();
    brow.position.copy(bp.p); orient(brow, bp.n);
    const browM = new THREE.Mesh(shared.browGeo, deepMat);
    browM.rotation.z = Math.PI / 2;
    const browR = new THREE.Group();
    browR.add(browM);
    brow.add(browR);
    face.add(brow);
    eyes.push({ s, g, irisPivot, catchL, lidU, lidL, brow, browR, base: bp.p.clone(), nrm: bp.n.clone() });
  }
  // cheeks + mouth
  for (const s of [-1, 1]) {
    const { p, n } = surf(s * 0.5, -0.04, -0.007);
    const c = new THREE.Mesh(sphere(0.03, 32, 20), shared.cheek);
    c.position.copy(p); orient(c, n); c.scale.set(1, 0.72, 0.3);
    face.add(c);
  }
  const mouth = new THREE.Group();
  { const { p, n } = surf(0, -0.075, -0.004); mouth.position.copy(p); orient(mouth, n); }
  const mouthM = new THREE.Mesh(sphere(0.016, 32, 20), shared.mouth);
  mouth.add(mouthM);
  face.add(mouth);

  // A: two round ears; B: a two-leaf sprout
  if (key === 'A') {
    for (const s of [-1, 1]) {
      const { p } = surf(s * 0.62, 0.9, -0.028);
      const ear = new THREE.Group();
      ear.position.copy(p); orient(ear, V(s * 0.28, 0.12, 1).normalize());
      const outer = new THREE.Mesh(sphere(0.06, 40, 30), bodyMat);
      outer.scale.set(1, 0.94, 0.44); outer.castShadow = true;
      const inner = new THREE.Mesh(sphere(0.036, 32, 20), deepMat);
      inner.scale.set(1, 0.9, 0.2); inner.position.set(0, -0.004, 0.022);
      ear.add(outer, inner);
      face.add(ear);
    }
  } else {
    const top = V(0, BODY.r * BODY.sy - 0.01, 0);
    const curve = new THREE.CatmullRomCurve3([top, top.clone().add(V(0.004, 0.03, 0.004)), top.clone().add(V(0.016, 0.056, 0.01))]);
    const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.0065, 10), deepMat);
    stem.castShadow = true;
    face.add(stem);
    for (const [ang, len] of [[0.7, 1], [-2.2, 0.82]]) {
      const leaf = new THREE.Mesh(sphere(0.036, 32, 16), shared.leaf);
      const tip = top.clone().add(V(0.016, 0.056, 0.01));
      leaf.position.copy(tip).add(V(Math.cos(ang) * 0.03 * len, 0.008, Math.sin(ang) * 0.03 * len));
      leaf.rotation.set(0, -ang, 0.35);
      leaf.scale.set(len, 0.2, 0.52 * len);
      leaf.castShadow = true;
      face.add(leaf);
    }
  }

  // the far arm rests on the table edge (pivot space); the fork arm lives in world space (set per frame)
  const farA = V(-ch.cam * 0.17, BODY.cy - BODY.pivot - 0.04, 0.02), farH = V(-ch.cam * 0.14, TABLE_Y - BODY.pivot + 0.03, 0.2);
  const farArm = new THREE.Mesh(shared.unitCyl, bodyMat);
  limb(farArm, farA, farH); farArm.scale.x = farArm.scale.z = 0.026;
  const farHand = new THREE.Mesh(sphere(0.033, 24, 18), bodyMat);
  farHand.position.copy(farH);
  farArm.castShadow = farHand.castShadow = true;
  pivot.add(farArm, farHand);

  const arm = new THREE.Mesh(shared.unitCyl, bodyMat);
  const hand = new THREE.Mesh(sphere(0.034, 28, 20), bodyMat);
  const fork = new THREE.Mesh(shared.forkGeo, shared.metal);
  arm.castShadow = hand.castShadow = fork.castShadow = true;
  arm.receiveShadow = hand.receiveShadow = true;
  const world = new THREE.Group();
  world.add(arm, hand, fork);

  const shoulderL = V(ch.cam * 0.165, BODY.cy - BODY.pivot - 0.035, 0.04);
  const restHandL = V(ch.cam * 0.19, BODY.cy - BODY.pivot - 0.07, 0.205);
  const restDirL = V(-ch.cam * 0.12, 0.82, 0.56).normalize();
  const meetDir = V(key === 'A' ? 1 : -1, -0.42, -0.3).normalize();
  const meetTip = MEET.clone().add(V(key === 'A' ? -0.0035 : 0.0035, 0, 0));       // the tips touch side by side
  const meetHand = meetTip.clone().addScaledVector(meetDir, -FORK_LEN);

  const tmp = { a: V(0, 0, 0), b: V(0, 0, 0), d: V(0, 0, 0), q: new THREE.Quaternion(), g: V(0, 0, 0) };
  return {
    key, root, world, pivot, eyes, mouthM,
    tip: V(0, 0, 0),
    /** pose from the story channels (see story.js charAt) */
    pose(c) {
      pivot.rotation.set(c.lean, c.turn, 0);
      const br = c.breath - c.squash;
      bodyG.scale.set(1 - br * 0.5, 1 + br, 1 - br * 0.5);
      root.updateMatrixWorld(true);
      // eyes: iris toward the gaze target (clamped to 0.62 rad off the eye axis), catch-light on the iris, lids, brows
      for (const e of eyes) {
        const L = e.g.worldToLocal(tmp.g.copy(c.gaze));
        L.normalize();
        const lim = 0.62, ang = Math.acos(clamp(L.z, -1, 1));
        if (ang > lim) { const h = Math.hypot(L.x, L.y) || 1; L.set((L.x / h) * Math.sin(lim), (L.y / h) * Math.sin(lim), Math.cos(lim)); }
        e.irisPivot.quaternion.setFromUnitVectors(V(0, 0, 1), L);
        const front = EYE.r - 0.0046 + 0.0215 * 0.42;
        e.catchL.position.copy(L).multiplyScalar(front - 0.0012).add(V(-0.0068, 0.0076, 0));
        e.lidU.rotation.x = c.lid;
        e.lidL.rotation.x = -c.low;
        e.browR.rotation.z = e.s * c.tilt;
        e.brow.position.copy(e.base).addScaledVector(UP, c.raise);
      }
      const o = c.mouth;
      mouthM.scale.set(lerp(1.05, 0.62, o), lerp(0.26, 0.82, o), 0.42);
      // fork arm: shoulder and rest hand ride the body; the reach blends to the meeting pose in world space
      pivot.localToWorld(tmp.a.copy(shoulderL));
      const restH = pivot.localToWorld(tmp.b.copy(restHandL));
      pivot.getWorldQuaternion(tmp.q);
      const restD = restDirL.clone().applyQuaternion(tmp.q);
      const p = c.reach;
      const k = clamp(p);
      const handP = restH.clone().lerp(meetHand, k);
      if (p < 0) handP.addScaledVector(restD, p * 0.35).add(V(0, -p * 0.05, 0));
      const dir = restD.clone().lerp(meetDir, smooth(clamp(p * 2.4))).normalize();   // the fork swings down early: the motion reads on both sides of the cut
      if (p > 1 - 1e-6) dir.copy(meetDir);
      limb(arm, tmp.a, handP);
      arm.scale.x = arm.scale.z = 0.027;
      hand.position.copy(handP);
      // fork basis: z = dir, x horizontal, y = z × x (flat face up)
      const x = new THREE.Vector3().crossVectors(UP, dir).normalize(), y = new THREE.Vector3().crossVectors(dir, x);
      fork.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, dir));
      fork.position.copy(handP);
      this.tip.copy(handP).addScaledVector(dir, FORK_LEN);
    },
  };
}

// ---------------------------------------------------------------- the cat
export function buildCat(shared) {
  const ash = std(PAL.ash, 0.8), cream = std('#efe2cf', 0.8), dark = std(PAL.ashDark, 0.6);
  const eyeM = std('#f0c252', 0.3), pupil = std('#2a2024', 0.25);
  const root = new THREE.Group();
  const lean = new THREE.Group();
  root.add(lean);
  const mk = (geo, m) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; return o; };
  const body = mk(sphere(0.072, 48, 36), ash);
  const chest = mk(sphere(0.05, 32, 24), cream);
  const head = new THREE.Group();
  const skull = mk(sphere(0.06, 48, 36), ash);
  skull.scale.set(1.1, 0.93, 0.96);
  head.add(skull);
  const earGeo = new THREE.LatheGeometry([[0.0001, 0], [0.024, 0], [0.024, 0.004], [0.016, 0.026], [0.006, 0.043], [0.0001, 0.046]].map(([r, y]) => new THREE.Vector2(r, y)), 24);
  for (const s of [-1, 1]) {
    const e = mk(earGeo, ash);
    e.position.set(s * 0.036, 0.034, -0.004);
    e.rotation.set(-0.12, 0, -s * 0.38);
    e.scale.set(1, 1, 0.6);
    const ei = mk(earGeo, cream);
    ei.scale.set(0.6, 0.72, 0.3);
    ei.position.set(0, 0.002, 0.008);
    e.add(ei);
    head.add(e);
  }
  for (const s of [-1, 1]) {
    const m = mk(sphere(0.02, 24, 18), cream);
    m.position.set(s * 0.0135, -0.02, 0.046);
    m.scale.set(1, 0.8, 0.8);
    head.add(m);
  }
  const chin = mk(sphere(0.014, 20, 14), cream);
  chin.position.set(0, -0.033, 0.04);
  head.add(chin);
  const nose = mk(sphere(0.0062, 16, 12), dark);
  nose.position.set(0, -0.006, 0.0605);
  nose.scale.set(1.25, 0.8, 0.8);
  head.add(nose);
  const openEyes = new THREE.Group(), shutEyes = new THREE.Group();
  const arcGeo = new THREE.TorusGeometry(0.0105, 0.0026, 8, 20, Math.PI);
  for (const s of [-1, 1]) {
    const e = new THREE.Group();
    e.position.set(s * 0.027, 0.01, 0.049);
    e.rotation.y = s * 0.42;
    const ball = mk(sphere(0.0128, 24, 18), eyeM);
    ball.scale.set(1, 1, 0.55);
    const pu = mk(sphere(0.0128, 16, 12), pupil);
    pu.scale.set(0.34, 0.92, 0.3);
    pu.position.z = 0.0052;
    e.add(ball, pu);
    openEyes.add(e);
    const a = mk(arcGeo, dark);
    a.position.set(s * 0.027, 0.004, 0.053);
    a.rotation.y = s * 0.42;
    shutEyes.add(a);
  }
  head.add(openEyes, shutEyes);
  const paws = [-1, 1].map((s) => { const p = mk(sphere(0.019, 20, 14), cream); p.scale.set(1, 0.8, 1.2); lean.add(p); return { s, p }; });
  const tail = mk(new THREE.BufferGeometry(), ash);
  lean.add(body, chest, head, tail);
  const mouthL = V(0, -0.032, 0.06);

  const LOAF = { body: [V(0, 0.05, 0), V(1.02, 0.7, 1.55)], chest: [V(0, 0.04, 0.06), V(0.6, 0.5, 0.5)], head: V(0, 0.07, 0.112), paw: V(0.03, 0.016, 0.118) };
  const SIT = { body: [V(0, 0.084, -0.012), V(1, 1.28, 1)], chest: [V(0, 0.098, 0.042), V(0.86, 1.12, 0.6)], head: V(0, 0.2, 0.026), paw: V(0.028, 0.016, 0.072) };
  const lv = (a, b, k) => a.clone().lerp(b, k);

  return {
    root, head,
    mouthWorld: V(0, 0, 0), headWorld: V(0, 0, 0),
    pose(c) {
      root.position.copy(c.pos);
      root.rotation.y = c.yaw;
      root.scale.set(1 + c.crouch * 0.4, 1 - c.crouch + c.breath, 1 + c.crouch * 0.4);
      const k = c.sit;
      body.position.copy(lv(LOAF.body[0], SIT.body[0], k)); body.scale.copy(lv(LOAF.body[1], SIT.body[1], k));
      chest.position.copy(lv(LOAF.chest[0], SIT.chest[0], k)); chest.scale.copy(lv(LOAF.chest[1], SIT.chest[1], k));
      head.position.copy(lv(LOAF.head, SIT.head, k)).add(V(0, -0.045 * c.lean, 0.17 * c.lean));
      head.rotation.set(0.32 * c.headDown + 0.25 * c.lean, 0, c.tilt);
      lean.rotation.x = 0.22 * c.lean;
      for (const { s, p } of paws) p.position.copy(lv(LOAF.paw, SIT.paw, k)).setX(s * lerp(LOAF.paw.x, SIT.paw.x, k));
      const o = c.eyes;
      openEyes.visible = o > 0.08;
      openEyes.scale.set(1, Math.max(0.08, o), 1);
      shutEyes.visible = o <= 0.08;
      // tail: a tube along a curve that wraps the body (loaf) or curls round the front paws (sitting), tip swishing
      const sw = 0.018 * c.tail;
      const pts = [
        lv(V(0, 0.03, -0.11), V(0, 0.03, -0.074), k),
        lv(V(0.07, 0.022, -0.075), V(0.072, 0.014, -0.062), k),
        lv(V(0.09, 0.02, 0.03), V(0.096, 0.012, 0.018), k),
        lv(V(0.045, 0.02 + sw * 0.4, 0.105), V(0.085, 0.014 + sw, 0.07), k),
        lv(V(0.005, 0.022 + sw * 0.5, 0.12), V(0.05, 0.02 + sw * 1.4, 0.098), k),
      ];
      tail.geometry.dispose();
      tail.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 32, 0.0125, 10);
      root.updateMatrixWorld(true);
      head.localToWorld(this.mouthWorld.copy(mouthL).add(V(0, -0.004 * c.chew, 0)));
      head.getWorldPosition(this.headWorld);
    },
  };
}

/** shared materials and geometries */
export function castShared() {
  const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 20, 1, true);
  const browGeo = new THREE.CapsuleGeometry(0.0058, 0.024, 6, 12);
  return {
    unitCyl, browGeo,
    stoolGeo: stoolGeometry(),
    forkGeo: forkGeometry(),
    wood: std(PAL.caramel, 0.62),
    sclera: std(PAL.sclera, 0.32),
    iris: std('#2b1d19', 0.18),
    catchMat: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.55, 1.45) }),
    cheek: std(PAL.apricot, 0.8),
    mouth: std('#3a2420', 0.5),
    leaf: std(PAL.sageDeep, 0.6),
    metal: new THREE.MeshStandardMaterial({ color: PAL.metal, metalness: 1, roughness: 0.26 }),
  };
}
