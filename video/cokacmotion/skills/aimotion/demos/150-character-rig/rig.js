/*
 * rig.js — the mascot as ONE THREE.SkinnedMesh, built entirely in code.
 *
 *   skeleton  16 bones: root, hips, spine, head, upperArm/lowerArm/hand ×2, thigh/shin/foot ×2. Every bind rotation
 *             is the identity, so a bone's rest axis is just the offset to its child (legs point down −y, arms down-out).
 *   geometry  a superellipsoid body of revolution (the bean), capsule limbs (Lathe), mittens, flattened-ellipsoid shoes,
 *             a knitted scarf ring laid on the body surface + its knot, and the face (bead eyes, catch-lights, a mouth
 *             patch) — concatenated into one indexed BufferGeometry, one draw group per material.
 *   weights   per vertex, w_b ∝ exp(−d_b² / σ²) with d_b the distance to bone b's segment, among the bones the part
 *             may follow; the best 4 are kept and normalised. Accessories (scarf, face) take the weights of the skin
 *             point under them, so they ride the deformation instead of floating over it.
 *   morphs    blink, happy (∩ eyes) and mouthOpen: relative morph targets on the same mesh (applied before skinning).
 */
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

// ---------------------------------------------------------------- colour tokens (the accent is CORAL, the scarf only)
export const COL = {
  cream: '#fcf3e6', navy: '#2e3150', coral: '#ff5a48', blush: '#f7a596', shine: '#ffffff',
};

// ---------------------------------------------------------------- body: (ρ / rx(y))^n + |(y − yc) / ry|^n = 1
// ρ = √(x² + (z / zs)²): round in plan but a little flatter front-to-back; rx(y) narrows from belly to head (a bean).
export const BODY = { yc: 0.90, ry: 0.56, n: 2.5, zs: 0.88 };
const rxOf = (y) => 0.36 + 0.06 * (1 - sm(0.6, 1.3, y));
export function bodyR(y) {
  const u = Math.abs((y - BODY.yc) / BODY.ry);
  return u >= 1 ? 0 : rxOf(y) * Math.pow(1 - Math.pow(u, BODY.n), 1 / BODY.n);
}
const bodyF = (x, y, z) => Math.pow(Math.hypot(x, z / BODY.zs) / rxOf(y), BODY.n) + Math.pow(Math.abs((y - BODY.yc) / BODY.ry), BODY.n);
/** surface point at azimuth α (0 = front +z, + toward the character's left +x) and height y, with its outward normal */
export function surface(alpha, y) {
  const r = bodyR(y);
  const p = new THREE.Vector3(r * Math.sin(alpha), y, BODY.zs * r * Math.cos(alpha));
  const e = 1e-4;
  const n = new THREE.Vector3(
    bodyF(p.x + e, p.y, p.z) - bodyF(p.x - e, p.y, p.z),
    bodyF(p.x, p.y + e, p.z) - bodyF(p.x, p.y - e, p.z),
    bodyF(p.x, p.y, p.z + e) - bodyF(p.x, p.y, p.z - e)).normalize();
  return { p, n };
}

// ---------------------------------------------------------------- bind layout (character space: y up, facing +z, left = +x)
export const L = {
  hips: 0.50, spineUp: 0.24, headUp: 0.30, headTail: 1.36,
  shoulder: [0.35, 0.82], armTilt: 0.55, upper: 0.16, fore: 0.14, hand: 0.09,
  hip: [0.145, -0.04], thigh: 0.20, shin: 0.18, ankle: 0.08,
  scarfY: 0.915, knotA: 0.62,
};

export const BONE_NAMES = ['root', 'hips', 'spine', 'head',
  'upperArmL', 'lowerArmL', 'handL', 'upperArmR', 'lowerArmR', 'handR',
  'thighL', 'shinL', 'footL', 'thighR', 'shinR', 'footR'];

// ---------------------------------------------------------------- small geometry helpers
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
function distSegSq(p, a, b) {
  const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
  const l2 = abx * abx + aby * aby + abz * abz;
  let k = l2 > 0 ? ((p.x - a.x) * abx + (p.y - a.y) * aby + (p.z - a.z) * abz) / l2 : 0;
  k = Math.min(1, Math.max(0, k));
  const dx = p.x - a.x - abx * k, dy = p.y - a.y - aby * k, dz = p.z - a.z - abz * k;
  return dx * dx + dy * dy + dz * dz;
}
/** capsule from b (distal) to a (proximal), radii rb → ra, as a lathe around the segment */
function capsule(a, b, ra, rb, radial = 18) {
  const len = a.distanceTo(b), pts = [];
  const CR = 7, BR = 8;
  for (let i = 0; i <= CR; i++) { const th = -Math.PI / 2 + (Math.PI / 2) * (i / CR); pts.push(new THREE.Vector2(Math.max(1e-5, rb * Math.cos(th)), rb * Math.sin(th))); }
  for (let i = 1; i < BR; i++) { const k = i / BR; pts.push(new THREE.Vector2(rb + (ra - rb) * k, len * k)); }
  for (let i = 0; i <= CR; i++) { const th = (Math.PI / 2) * (i / CR); pts.push(new THREE.Vector2(Math.max(1e-5, ra * Math.cos(th)), len + ra * Math.sin(th))); }
  const g = new THREE.LatheGeometry(pts, radial);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(v3(0, 1, 0), a.clone().sub(b).normalize()));
  g.translate(b.x, b.y, b.z);
  return g;
}
/** unit sphere → ellipsoid in a local frame (x, y, z axes as columns), centred at c */
function ellipsoid(c, ax, ay, az, sx, sy, sz, ws = 24, hs = 16) {
  const g = new THREE.SphereGeometry(1, ws, hs);
  const P = g.attributes.position, N = g.attributes.normal;
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i) * sx, y = P.getY(i) * sy, z = P.getZ(i) * sz;
    const nx = N.getX(i) / sx, ny = N.getY(i) / sy, nz = N.getZ(i) / sz;
    P.setXYZ(i, c.x + ax.x * x + ay.x * y + az.x * z, c.y + ax.y * x + ay.y * y + az.y * z, c.z + ax.z * x + ay.z * y + az.z * z);
    const wx = ax.x * nx + ay.x * ny + az.x * nz, wy = ax.y * nx + ay.y * ny + az.y * nz, wz = ax.z * nx + ay.z * ny + az.z * nz;
    const l = Math.hypot(wx, wy, wz) || 1;
    N.setXYZ(i, wx / l, wy / l, wz / l);
  }
  return g;
}
/** an orthonormal frame on the body surface: z = outward normal, y = world-up projected into the tangent plane */
function surfFrame(alpha, y) {
  const { p, n } = surface(alpha, y);
  const up = v3(0, 1, 0).addScaledVector(n, -n.y).normalize();
  const x = new THREE.Vector3().crossVectors(up, n);
  return { p, n, x, y: up, z: n };
}

/**
 * Build the character. Returns { mesh, skeleton, bones, B (bones by name), boneIndex, skinPoint, knot, mats, MORPH }.
 * mats: [skin, scarf, face, shine] — the scarf material is shared with the (non-skinned) scarf tails.
 */
export function buildCharacter(knitTex) {
  // ---- skeleton (bind = rest; all rotations identity)
  const bones = [], B = {};
  const mk = (name, parent, x, y, z) => { const b = new THREE.Bone(); b.name = name; b.position.set(x, y, z); if (parent) parent.add(b); B[name] = b; bones.push(b); return b; };
  mk('root', null, 0, 0, 0);
  mk('hips', B.root, 0, L.hips, 0);
  mk('spine', B.hips, 0, L.spineUp, 0);
  mk('head', B.spine, 0, L.headUp, 0);
  const ARM_DIR = (s) => v3(s * Math.sin(L.armTilt), -Math.cos(L.armTilt), 0);
  for (const [s, k] of [[1, 'L'], [-1, 'R']]) {
    const d = ARM_DIR(s);
    mk('upperArm' + k, B.spine, s * L.shoulder[0], L.shoulder[1] - L.hips - L.spineUp, 0);
    mk('lowerArm' + k, B['upperArm' + k], d.x * L.upper, d.y * L.upper, 0);
    mk('hand' + k, B['lowerArm' + k], d.x * L.fore, d.y * L.fore, 0);
  }
  for (const [s, k] of [[1, 'L'], [-1, 'R']]) {
    mk('thigh' + k, B.hips, s * L.hip[0], L.hip[1], 0);
    mk('shin' + k, B['thigh' + k], 0, -L.thigh, 0);
    mk('foot' + k, B['shin' + k], 0, -L.shin, 0);
  }
  const boneIndex = Object.fromEntries(bones.map((b, i) => [b.name, i]));
  B.root.updateMatrixWorld(true);
  const W = (name) => B[name].getWorldPosition(new THREE.Vector3());

  // ---- bone segments (bind space) for the distance weights
  const seg = {
    hips: [W('hips'), W('spine')], spine: [W('spine'), W('head')], head: [W('head'), v3(0, L.headTail, 0)],
  };
  for (const [s, k] of [[1, 'L'], [-1, 'R']]) {
    const d = ARM_DIR(s);
    seg['upperArm' + k] = [W('upperArm' + k), W('lowerArm' + k)];
    seg['lowerArm' + k] = [W('lowerArm' + k), W('hand' + k)];
    seg['hand' + k] = [W('hand' + k), W('hand' + k).addScaledVector(d, L.hand)];
    seg['thigh' + k] = [W('thigh' + k), W('shin' + k)];
    seg['shin' + k] = [W('shin' + k), W('foot' + k)];
    seg['foot' + k] = [W('foot' + k), W('foot' + k).add(v3(0, -0.05, 0.11))];
  }
  /** the skinning weights at p: Gaussian of the segment distance among `names`, best 4, normalised */
  function weigh(p, names, sigma) {
    const ls = names.map((nm) => -distSegSq(p, seg[nm][0], seg[nm][1]) / (sigma * sigma));
    const m = Math.max(...ls);
    const list = names.map((nm, i) => [boneIndex[nm], Math.exp(ls[i] - m)]).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const s = list.reduce((a, x) => a + x[1], 0);
    return list.map(([i, w]) => [i, w / s]);
  }
  const BODY_BONES = ['hips', 'spine', 'head'], SIG_BODY = 0.16, SIG_LIMB = 0.05;

  // ---- parts → one geometry
  const parts = [];
  // add(geo, mat, colour(p) | hex, weights(p, i) → [[bone, w]…], morph(p, i) → { blink, happy, open } deltas)
  function add(geo, mat, colour, weights, morph = null) { parts.push({ geo, mat, colour, weights, morph }); }
  const cream = new THREE.Color(COL.cream), navy = new THREE.Color(COL.navy), blush = new THREE.Color(COL.blush);

  // body: a lathe of the superellipse profile, then flattened in z (normals by the inverse transpose)
  {
    const prof = [], NP = 84;
    for (let i = 0; i <= NP; i++) {
      const th = (i / NP) * Math.PI, c = Math.cos(th), s = Math.sin(th);
      const y = BODY.yc - BODY.ry * Math.sign(c) * Math.pow(Math.abs(c), 2 / BODY.n);
      prof.push(new THREE.Vector2(Math.max(1e-5, rxOf(y) * Math.pow(s, 2 / BODY.n)), y));
    }
    const g = new THREE.LatheGeometry(prof, 112);
    const P = g.attributes.position, N = g.attributes.normal;
    for (let i = 0; i < P.count; i++) {
      P.setZ(i, P.getZ(i) * BODY.zs);
      const nx = N.getX(i), ny = N.getY(i), nz = N.getZ(i) / BODY.zs, l = Math.hypot(nx, ny, nz);
      N.setXYZ(i, nx / l, ny / l, nz / l);
    }
    const cheeks = [surface(0.56, 1.075).p, surface(-0.56, 1.075).p];
    add(g, 0, (p) => {
      const c = cream.clone().multiplyScalar(0.84 + 0.16 * sm(0.34, 0.6, p.y));   // a little baked occlusion low down
      let b = 0;
      for (const q of cheeks) b = Math.max(b, 1 - sm(0.03, 0.082, p.distanceTo(q)));
      return c.lerp(blush, 0.62 * b);
    }, (p) => weigh(p, BODY_BONES, SIG_BODY));
  }
  // legs, shoes, arms, mittens
  for (const [s, k] of [[1, 'L'], [-1, 'R']]) {
    const LEG = ['thigh' + k, 'shin' + k, 'foot' + k], ARM = ['upperArm' + k, 'lowerArm' + k, 'hand' + k];
    add(capsule(W('thigh' + k), W('foot' + k), 0.084, 0.072, 18), 0, cream.clone().multiplyScalar(0.94), (p) => weigh(p, LEG, SIG_LIMB));
    // shoe: a flattened ellipsoid, sole on y = 0, toe forward
    {
      const g = new THREE.SphereGeometry(1, 28, 18);
      g.deleteAttribute('uv'); g.deleteAttribute('normal');
      const P = g.attributes.position;
      for (let i = 0; i < P.count; i++) {
        let y = P.getY(i);
        if (y < -0.6) y = -0.6 - (-0.6 - y) * 0.2;
        P.setXYZ(i, P.getX(i) * 0.078, y * 0.064, P.getZ(i) * 0.118);
      }
      const m = mergeVertices(g);
      m.translate(W('foot' + k).x, 0.0435, 0.032);
      m.computeVertexNormals();
      add(m, 0, navy.clone().lerp(cream, 0.08), () => [[boneIndex['foot' + k], 1]]);
    }
    add(capsule(W('upperArm' + k), W('hand' + k), 0.066, 0.057, 16), 0, cream, (p) => weigh(p, ARM, 0.045));
    {
      const d = ARM_DIR(s), z = v3(0, 0, 1), x = new THREE.Vector3().crossVectors(d, z);
      const c = W('hand' + k).addScaledVector(d, 0.045);
      add(ellipsoid(c, x, d, z, 0.074, 0.084, 0.06, 20, 14), 0, cream, (p) => weigh(p, ['lowerArm' + k, 'hand' + k], 0.04));
      const tc = c.clone().addScaledVector(z, 0.042).add(v3(-s * 0.034, 0.012, 0));
      add(ellipsoid(tc, x, d, z, 0.03, 0.033, 0.028, 12, 8), 0, cream, () => weigh(c, ['lowerArm' + k, 'hand' + k], 0.04));
    }
  }

  // scarf ring: a knitted roll lying on the body at y ≈ scarfY (a little lower in front), weights of the skin beneath
  const scarfY = (a) => L.scarfY - 0.022 * Math.cos(a);
  {
    const NA = 120, NS = 18, pos = [], nor = [], uv = [], idx = [], anchor = [];
    for (let i = 0; i <= NA; i++) {
      const a = (i / NA) * Math.PI * 2;
      const { p, n } = surface(a, scarfY(a));
      const nh = v3(n.x, 0, n.z).normalize();
      for (let j = 0; j <= NS; j++) {
        const ph = (j / NS) * Math.PI * 2, c = Math.cos(ph), s = Math.sin(ph);
        // superellipse cross-section (exponent 3): a soft rolled band
        const ex = Math.sign(c) * Math.pow(Math.abs(c), 2 / 3), ey = Math.sign(s) * Math.pow(Math.abs(s), 2 / 3);
        const o = nh.clone().multiplyScalar(0.014 + 0.04 * ex).add(v3(0, 0.058 * ey, 0));
        pos.push(p.x + o.x, p.y + o.y, p.z + o.z);
        const nn = nh.clone().multiplyScalar(Math.sign(c) * Math.pow(Math.abs(c), 4 / 3) / 0.04).add(v3(0, Math.sign(s) * Math.pow(Math.abs(s), 4 / 3) / 0.058, 0)).normalize();
        nor.push(nn.x, nn.y, nn.z);
        uv.push((j / NS) * 6, (i / NA) * 58);      // stitch columns across the band, rows along it
        anchor.push(p);
      }
    }
    for (let i = 0; i < NA; i++) for (let j = 0; j < NS; j++) {
      const a = i * (NS + 1) + j, b = a + NS + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    add(g, 1, '#ffffff', (p, i) => weigh(anchor[i], BODY_BONES, SIG_BODY));
  }
  // knot (the tails hang from under it; they are a separate, simulated mesh)
  const knotS = surface(L.knotA, scarfY(L.knotA));
  const knotH = v3(knotS.n.x, 0, knotS.n.z).normalize();
  const knotC = knotS.p.clone().addScaledVector(knotH, 0.055).add(v3(0, -0.006, 0));
  {
    const zz = knotH, yy = v3(0, 1, 0), xx = new THREE.Vector3().crossVectors(yy, zz);
    const g = ellipsoid(knotC, xx, yy, zz, 0.062, 0.058, 0.046, 20, 14);
    const U = new Float32Array(g.attributes.position.count * 2);
    for (let i = 0; i < U.length / 2; i++) { U[i * 2] = g.attributes.uv.getX(i) * 4; U[i * 2 + 1] = g.attributes.uv.getY(i) * 2; }
    g.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    const w = weigh(knotS.p, BODY_BONES, SIG_BODY);
    add(g, 1, '#ffffff', () => w);
  }

  // face: bead eyes + catch-lights + a mouth patch, all riding the skin point under them
  const MORPH = { blink: 0, happy: 1, open: 2 };
  for (const s of [1, -1]) {
    const F = surfFrame(s * 0.27, 1.19);
    const SX = 0.036, SY = 0.052, SZ = 0.024;
    const c = F.p.clone().addScaledVector(F.n, SZ - 0.013);
    const w = weigh(F.p, BODY_BONES, SIG_BODY);
    const eye = ellipsoid(c, F.x, F.y, F.z, SX, SY, SZ, 22, 16);
    // local coordinates of each vertex (for the morphs)
    const loc = (p) => { const d = p.clone().sub(c); return [d.dot(F.x), d.dot(F.y), d.dot(F.z)]; };
    const toW = (lx, ly, lz) => c.clone().addScaledVector(F.x, lx).addScaledVector(F.y, ly).addScaledVector(F.z, lz);
    add(eye, 2, COL.navy, () => w, (p) => {
      const [x, y, z] = loc(p);
      const blink = toW(x, -0.22 * SY + 0.1 * y, z * 0.55).sub(p);
      const arch = SY * 0.62 * (1 - (x / SX) * (x / SX)) - SY * 0.18;      // ∩: the closed eye bends upward
      const happy = toW(x * 1.06, arch + 0.16 * y, z * 0.6).sub(p);
      return { blink, happy };
    });
    // catch-light: upper outer quadrant, collapses into the lid line on blink / happy
    const hc = toW(-s * 0.011, 0.02, SZ * 0.7);
    const hl = ellipsoid(hc, F.x, F.y, F.z, 0.011, 0.013, 0.006, 12, 8);
    add(hl, 3, COL.shine, () => w, (p) => {
      const d = toW(-s * 0.011, -0.22 * SY, 0).sub(p);
      return { blink: d, happy: d.clone() };
    });
  }
  {
    // mouth: a patch u ∈ [−1, 1] across, v ∈ [0, 1] down; closed = a thin smile, open = a rounded "D"
    const YM = 1.062, HW = 0.05, NU = 26, NV = 7;
    const F = surfFrame(0, YM), w = weigh(F.p, BODY_BONES, SIG_BODY);
    const r = bodyR(YM);
    const place = (x, y) => {   // wrap the 2D patch onto the surface (x as arc length around, y as height)
      const q = surface(x / r, YM + y);
      return q.p.addScaledVector(q.n, 0.0025);
    };
    const top = (u) => 0.016 * u * u;                                            // corners up: a smile
    const thC = (u) => 0.0045 + 0.009 * Math.sqrt(Math.max(0, 1 - u * u));      // closed thickness
    const thO = (u) => 0.006 + 0.05 * Math.pow(Math.max(0, 1 - u * u), 0.55);    // open thickness
    const pos = [], open = [], idx = [];
    for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
      const u = -1 + (2 * i) / NU, v = j / NV;
      const pc = place(u * HW, top(u) - v * thC(u));
      const po = place(u * HW * 1.04, top(u) * 0.55 + 0.004 - v * thO(u));
      pos.push(pc.x, pc.y, pc.z);
      open.push(po.x - pc.x, po.y - pc.y, po.z - pc.z);
    }
    for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
      const a = j * (NU + 1) + i, b = a + NU + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const N = g.attributes.normal;
    for (let i = 0; i < N.count; i++) N.setXYZ(i, F.n.x, F.n.y, F.n.z);   // flat decal: the surface normal
    add(g, 2, COL.navy, () => w, (p, i) => ({ open: v3(open[i * 3], open[i * 3 + 1], open[i * 3 + 2]) }));
  }

  // ---- concatenate (sorted by material so each material is one contiguous group)
  parts.sort((a, b) => a.mat - b.mat);
  let nv = 0, ni = 0;
  for (const pt of parts) { nv += pt.geo.attributes.position.count; ni += pt.geo.index ? pt.geo.index.count : pt.geo.attributes.position.count; }
  const POS = new Float32Array(nv * 3), NOR = new Float32Array(nv * 3), UV = new Float32Array(nv * 2), CLR = new Float32Array(nv * 3);
  const SKI = new Uint16Array(nv * 4), SKW = new Float32Array(nv * 4);
  const MPH = [new Float32Array(nv * 3), new Float32Array(nv * 3), new Float32Array(nv * 3)];
  const IDX = new Uint32Array(ni);
  const geo = new THREE.BufferGeometry();
  let vo = 0, io = 0, gStart = 0, gMat = parts[0].mat;
  const p = new THREE.Vector3(), col = new THREE.Color();
  for (const pt of parts) {
    if (pt.mat !== gMat) { geo.addGroup(gStart, io - gStart, gMat); gStart = io; gMat = pt.mat; }
    const g = pt.geo, P = g.attributes.position, Nn = g.attributes.normal, U = g.attributes.uv;
    const fixed = typeof pt.colour === 'string' ? new THREE.Color(pt.colour) : (pt.colour.isColor ? pt.colour : null);
    for (let i = 0; i < P.count; i++) {
      p.fromBufferAttribute(P, i);
      const o = vo + i;
      POS.set([p.x, p.y, p.z], o * 3);
      NOR.set([Nn.getX(i), Nn.getY(i), Nn.getZ(i)], o * 3);
      if (U) UV.set([U.getX(i), U.getY(i)], o * 2);
      col.copy(fixed || pt.colour(p));
      CLR.set([col.r, col.g, col.b], o * 3);
      const w = pt.weights(p, i);
      for (let k = 0; k < 4; k++) { SKI[o * 4 + k] = w[k] ? w[k][0] : 0; SKW[o * 4 + k] = w[k] ? w[k][1] : 0; }
      if (pt.morph) {
        const m = pt.morph(p, i);
        for (const [name, k] of Object.entries(MORPH)) if (m[name]) MPH[k].set([m[name].x, m[name].y, m[name].z], o * 3);
      }
    }
    if (g.index) for (let i = 0; i < g.index.count; i++) IDX[io + i] = g.index.getX(i) + vo;
    else for (let i = 0; i < P.count; i++) IDX[io + i] = vo + i;
    io += g.index ? g.index.count : P.count;
    vo += P.count;
  }
  geo.addGroup(gStart, io - gStart, gMat);
  geo.setAttribute('position', new THREE.BufferAttribute(POS, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(NOR, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(UV, 2));
  geo.setAttribute('color', new THREE.BufferAttribute(CLR, 3));
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SKI, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(SKW, 4));
  geo.setIndex(new THREE.BufferAttribute(IDX, 1));
  geo.morphAttributes.position = MPH.map((a) => new THREE.BufferAttribute(a, 3));
  geo.morphTargetsRelative = true;

  // ---- materials: matte clay skin, bumped wool, glossy bead eyes
  // skin, eyes and catch-lights share one shader program (vertex colours; only uniforms differ)
  const mats = [
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62 }),
    new THREE.MeshStandardMaterial({ map: knitTex, bumpMap: knitTex, bumpScale: 1.5, roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.2 }),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, emissive: new THREE.Color(1, 1, 1), emissiveIntensity: 1.2 }),
  ];
  const mesh = new THREE.SkinnedMesh(geo, mats);
  mesh.add(B.root);
  mesh.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  mesh.bind(skeleton);
  mesh.frustumCulled = false;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // linear blend skinning of one bind-space point: v' = Σ w_i · M_i · B_i⁻¹ · v  (bones must be up to date)
  const _m = new THREE.Matrix4(), _t = new THREE.Vector3();
  function skinPoint(pBind, ws, out) {
    out.set(0, 0, 0);
    for (const [bi, w] of ws) {
      _m.multiplyMatrices(bones[bi].matrixWorld, skeleton.boneInverses[bi]);
      out.addScaledVector(_t.copy(pBind).applyMatrix4(_m), w);
    }
    return out;
  }
  const knot = {
    // where the two tails leave the knot (bind space), the ring tangent there (the ribbons' width direction), weights
    anchor: [knotC.clone().addScaledVector(knotH, -0.012).add(v3(0, -0.035, 0)), knotC.clone().addScaledVector(knotH, -0.004).add(v3(0, -0.04, 0))],
    tangent: new THREE.Vector3().crossVectors(v3(0, 1, 0), knotH).normalize(),
    out: knotH.clone(),
    w: weigh(knotS.p, BODY_BONES, SIG_BODY),
  };
  return { mesh, skeleton, bones, B, boneIndex, skinPoint, weigh, knot, mats, MORPH, nVerts: nv, nTris: ni / 3 };
}
