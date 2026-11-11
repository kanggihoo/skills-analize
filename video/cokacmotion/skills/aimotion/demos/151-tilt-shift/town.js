/*
 * The toy town, built in code. Every repeated thing is one InstancedMesh: house bodies come from four rounded-box
 * variants (cottage, house, townhouse, block), each with its own roof variant, windows and doors are generated per
 * facade, trees are a faceted canopy on a trunk. Vehicles (three body types) and pedestrians are instanced too; their
 * matrices are written per frame from the baked traffic (bakeTraffic) and the walker paths.
 *
 * World: y up, metres, the ground at y = 0. The middle street runs along x at z = 0, the cross street along z at
 * x = CROSS_X, the tram street along x at z = TRAM_Z (nearer the camera, which looks from +z toward −z), the river
 * along x at z ≈ −48. Nothing here depends on time: buildTown() returns the scene graph and handles.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries as mergeRaw } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------------------------------------------------------------- colour tokens (one accent: the tram)
export const PAL = {
  grass: 0x8fd457, park: 0x7fca4f, bed: 0x72bd4c, asphalt: 0x6c7a90, mark: 0xfaf4e6, walk: 0xeee4d2, plaza: 0xe8dcc6,
  stone: 0xe4d6bf, water: 0x2f9ec4, trunk: 0x96694a, hedge: 0x4f9e4c, dark: 0x2a3242, pole: 0x465266,
  walls: [0xfff3dc, 0xffdf98, 0xc9e6f5, 0xd5edbd, 0xf6e0c6, 0xfde9b8, 0xe6f1fa],
  roofs: [0x4a7fc8, 0x2da39a, 0x6f86ad, 0x3f6fb4, 0x86a2d6, 0x3c9fb8, 0x5d79a8],
  greens: [0x4fae4a, 0x6fc64f, 0x3f9a52, 0x86d158],
  cars: [0xfbf7ee, 0xc9d4e3, 0x4a76bc, 0x7fd3c2, 0xf5d36e, 0x36435a, 0xe6eef7, 0x97c3ef],
  coats: [0x33528f, 0xfbf3e3, 0x5b6a84, 0x7fd3c2, 0xf5d36e, 0x4fae4a, 0x36435a, 0x97c3ef],
  flowers: [0xfff1a6, 0xffffff, 0xe6dcff, 0xffe08a],
  accent: 0xff5843, cream: 0xfff4e4,
};

// ---------------------------------------------------------------- layout (metres)
export const LAY = {
  MID_HALF: 3.6, MID_WALK: 6.0,               // carriageway |z| < 3.6, sidewalks to |z| = 6
  CROSS_X: 8, CROSS_HALF: 3.0, CROSS_WALK: 5.4, // carriageway x ∈ [5, 11], sidewalks to [2.6, 13.4]
  TRAM_Z: 23.5, BED: [21.4, 25.6], NWALK: [18.8, 21.4],
  PLAT: { z0: 24.95, z1: 27.9, x0: -13, x1: 3.2 },
  SWALK: [27.9, 30.6],
  RIVER: [-54, -42], WATER_Y: -1.3,
};
const { CROSS_X } = LAY;

const Y = new THREE.Vector3(0, 1, 0);
// RoundedBoxGeometry is non-indexed, the built-in primitives are indexed: merge them all non-indexed
const mergeGeometries = (list) => mergeRaw(list.map((g) => (g.index ? g.toNonIndexed() : g)));
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();

export const matte = (o = {}) => { const { roughness, metalness, ...rest } = o; return new THREE.MeshLambertMaterial({ color: 0xffffff, ...rest }); };

/** one InstancedMesh from a list of { x, y, z, ry, sx, sy, sz, color } */
function instanced(group, geo, mat, list, { cast = true, receive = true } = {}) {
  const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length));
  list.forEach((it, i) => {
    _q.setFromAxisAngle(Y, it.ry || 0);
    _m.compose(_p.set(it.x, it.y || 0, it.z), _q, _s.set(it.sx ?? it.s ?? 1, it.sy ?? it.s ?? 1, it.sz ?? it.s ?? 1));
    m.setMatrixAt(i, _m);
    if (it.color !== undefined) m.setColorAt(i, _c.set(it.color));
  });
  m.count = list.length;
  m.castShadow = cast; m.receiveShadow = receive;
  group.add(m);
  return m;
}
const box = (w, h, d, x = 0, y = 0, z = 0) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
const rbox = (w, h, d, r, x = 0, y = 0, z = 0, seg = 2) => new RoundedBoxGeometry(w, h, d, seg, r).translate(x, y, z);
/** a plain mesh (static scenery), shadows on */
function solid(group, geo, color, o = {}) {
  const m = new THREE.Mesh(geo, color instanceof THREE.Material ? color : matte({ color, ...o }));
  m.castShadow = true; m.receiveShadow = true;
  group.add(m);
  return m;
}

// ---------------------------------------------------------------- house variants: rounded body + its roof
const VARIANTS = [
  { name: 'cottage', w: 7.0, h: 3.6, d: 6.4, floors: 1, rise: 2.7 },
  { name: 'house', w: 6.4, h: 6.2, d: 7.0, floors: 2, rise: 2.9 },
  { name: 'town', w: 5.6, h: 9.2, d: 6.8, floors: 3, rise: 2.5 },
  { name: 'block', w: 10.4, h: 12.4, d: 9.2, floors: 4, rise: 0 },
];
function gableRoof(v, rows = 4) {
  const o = 0.5, half = v.d / 2 + o, sh = new THREE.Shape();
  sh.moveTo(-half, 0); sh.lineTo(half, 0); sh.lineTo(0, v.rise); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: v.w + 0.5, bevelEnabled: true, bevelSize: 0.14, bevelThickness: 0.14, bevelSegments: 2, curveSegments: 1 });
  g.translate(0, 0, -(v.w + 0.5) / 2);
  g.rotateY(Math.PI / 2);                    // extrusion axis z → x: the ridge runs along the facade
  // shingle rows: each slab is tilted a little steeper than the slope, so its lower edge steps out and throws a
  // thin shadow line — the slope reads as a tiled roof, not a lid
  const parts = [g];
  const a = Math.atan2(v.rise, half), L = Math.hypot(half, v.rise), rl = L / rows, tilt = 0.07;
  for (const side of [1, -1]) for (let k = 0; k < rows; k++) {
    const sMid = (k + 0.5) * rl;                                   // distance up the slope from the eave
    const nY = Math.cos(a), nZ = Math.sin(a) * side;
    const slab = new THREE.BoxGeometry(v.w + 0.62, 0.09, rl + 0.08);
    slab.rotateX(side * (a + tilt));
    const lift = 0.1 + Math.sin(tilt) * rl * 0.5;
    slab.translate(0, sMid * Math.sin(a) + nY * lift, side * (half - sMid * Math.cos(a)) + nZ * lift);
    parts.push(slab.toNonIndexed());
  }
  parts.push(new THREE.CylinderGeometry(0.2, 0.2, v.w + 0.7, 8).rotateZ(Math.PI / 2).translate(0, v.rise + 0.12, 0).toNonIndexed());
  const out = mergeRaw(parts.map((p) => { const q = p.index ? p.toNonIndexed() : p; q.deleteAttribute('uv'); return q; }));
  out.translate(0, v.h - 0.05, 0);
  return out;
}
function flatRoof(v) {
  return mergeGeometries([
    rbox(v.w + 0.3, 0.55, v.d + 0.3, 0.2, 0, v.h + 0.15, 0),
    rbox(2.6, 1.8, 2.6, 0.3, v.w * 0.18, v.h + 1.1, -v.d * 0.12),
    rbox(1.4, 0.8, 1.0, 0.2, -v.w * 0.25, v.h + 0.75, v.d * 0.2),
  ]);
}

// ---------------------------------------------------------------- vehicles (built along +x, ground at y = 0)
export const VTYPES = [
  { name: 'car', len: 4.3, w: 1.8 },
  { name: 'van', len: 5.0, w: 1.95 },
  { name: 'bus', len: 10.6, w: 2.5 },
];
function vehicleGeos(type) {
  if (type === 'bus') {
    return {
      paint: mergeGeometries([rbox(10.6, 2.0, 2.5, 0.35, 0, 1.45), rbox(10.2, 0.25, 2.2, 0.12, 0, 3.32)]),
      glass: rbox(10.2, 0.85, 2.56, 0.25, 0.05, 2.75),
      dark: mergeGeometries([box(9.6, 0.4, 2.2, 0, 0.35), ...[-3.6, 3.4].flatMap((x) => [-1, 1].map((s) => new THREE.CylinderGeometry(0.5, 0.5, 0.3, 10).rotateX(Math.PI / 2).translate(x, 0.5, s * 1.05)))]),
      lights: [[5.32, 1.0, 0.85], [5.32, 1.0, -0.85], [-5.32, 1.1, 0.9], [-5.32, 1.1, -0.9]],
    };
  }
  const v = type === 'van';
  const L = v ? 5.0 : 4.3, Wd = v ? 1.95 : 1.8, cab = v ? 3.6 : 2.3, cx = v ? -0.45 : -0.2;
  const bodyH = v ? 1.0 : 0.82, cabH = v ? 0.95 : 0.66;
  const y0 = 0.32 + bodyH / 2, y1 = 0.32 + bodyH + cabH / 2 - 0.04;
  return {
    paint: mergeGeometries([rbox(L, bodyH, Wd, 0.28, 0, y0), rbox(cab - 0.25, 0.16, Wd - 0.22, 0.07, cx, y1 + cabH / 2 + 0.02)]),
    glass: rbox(cab, cabH, Wd - 0.14, 0.22, cx, y1),
    dark: mergeGeometries([box(L - 0.5, 0.3, Wd - 0.2, 0, 0.3), ...[-1, 1].flatMap((sx) => [-1, 1].map((s) => new THREE.CylinderGeometry(0.33, 0.33, 0.24, 10).rotateX(Math.PI / 2).translate(sx * L * 0.31, 0.33, s * (Wd / 2 - 0.08))))]),
    lights: [[L / 2 + 0.02, y0, Wd / 2 - 0.3], [L / 2 + 0.02, y0, -(Wd / 2 - 0.3)], [-L / 2 - 0.02, y0 + 0.05, Wd / 2 - 0.25], [-L / 2 - 0.02, y0 + 0.05, -(Wd / 2 - 0.25)]],
  };
}

// ---------------------------------------------------------------- the tram (one group; doors and lights are handles)
function buildTram(envMap) {
  const g = new THREE.Group();
  const red = matte({ color: PAL.accent, roughness: 0.5 });
  const cream = matte({ color: PAL.cream, roughness: 0.6 });
  const roofM = matte({ color: 0xe9ebee, roughness: 0.7 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x1b2430, roughness: 0.12, metalness: 0.2, envMap, envMapIntensity: 1, emissive: 0xffc98c, emissiveIntensity: 0.0 });
  const doorM = new THREE.MeshStandardMaterial({ color: 0x2e3a4a, roughness: 0.35, metalness: 0.1 });
  const darkM = matte({ color: PAL.dark });
  const SEC = [[-3.55, 6.7], [3.55, 6.7]];      // [centre x, length]
  for (const [cx, len] of SEC) {
    solid(g, rbox(len, 2.75, 2.5, 0.5, cx, 0.42 + 1.375, 0, 3), red);
    solid(g, rbox(len + 0.04, 0.42, 2.54, 0.2, cx, 0.62, 0), cream);
    solid(g, rbox(len - 0.5, 1.02, 2.56, 0.18, cx, 2.12, 0), glass);
    solid(g, rbox(len - 0.6, 0.22, 2.2, 0.1, cx, 3.22, 0), red);
    solid(g, rbox(1.6, 0.36, 1.4, 0.14, cx - 0.8, 3.48, 0), roofM);
    solid(g, box(len - 1.2, 0.4, 2.2, cx, 0.28, 0), darkM);              // bogie skirt
  }
  solid(g, box(0.5, 2.45, 2.2, 0, 1.7, 0), darkM);                         // the articulation bellows
  solid(g, rbox(0.16, 1.15, 2.04, 0.08, 6.85, 2.1, 0), glass);             // windscreen (front = +x)
  solid(g, rbox(0.16, 0.95, 1.9, 0.08, -6.85, 2.15, 0), glass);
  solid(g, rbox(0.12, 0.32, 1.3, 0.06, 6.88, 2.95, 0), cream);            // destination board
  // pantograph on the front section: two folded arms up to the contact wire (y 5.8)
  const pant = new THREE.Group();
  pant.position.set(3.0, 3.38, 0);
  const arm = (x0, y0, x1, y1) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const m = solid(pant, new THREE.CylinderGeometry(0.035, 0.035, len, 6), PAL.dark);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0);
    m.rotation.z = Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2;
  };
  arm(-0.5, 0.05, 0.55, 1.15); arm(0.55, 1.15, -0.1, 2.38);
  solid(pant, box(0.18, 0.06, 1.5, -0.1, 2.4, 0), PAL.dark);
  solid(pant, box(0.9, 0.1, 0.9, -0.3, 0.02, 0), PAL.dark);
  g.add(pant);
  // doors on the platform side (+z): a dark glass leaf pair per door, slid open in frame()
  const doors = [];
  for (const x of [-5.0, -1.8, 1.8, 5.0]) {
    const pair = [];
    for (const s of [-1, 1]) {
      const leaf = solid(g, rbox(0.62, 2.1, 0.06, 0.03, 0, 1.62, 1.265), doorM);
      leaf.position.x = x + s * 0.34;
      pair.push({ leaf, x0: x + s * 0.34, s });
    }
    doors.push(pair);
  }
  // head / tail lamps
  const lampM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const tailM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (const z of [-0.8, 0.8]) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), lampM); h.position.set(6.9, 0.95, z); g.add(h);
    const tl = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), tailM); tl.position.set(-6.9, 0.95, z); g.add(tl);
  }
  return { g, glass, doors, lampM, tailM };
}

// ---------------------------------------------------------------- the whole town
export function buildTown(R, envMap) {
  const scene = new THREE.Group();
  const H = {};
  const M = {
    grass: matte({ color: PAL.grass }), road: matte({ color: PAL.asphalt, roughness: 0.92 }), mark: matte({ color: PAL.mark }),
    walk: matte({ color: PAL.walk }), stone: matte({ color: PAL.stone }), inst: matte(), dark: matte({ color: PAL.dark, roughness: 0.7 }),
    pole: matte({ color: PAL.pole, roughness: 0.6 }),
    leaf: matte({ flatShading: true, roughness: 0.92 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x2a3644, roughness: 0.12, metalness: 0.25, envMap, envMapIntensity: 1 }),
    rail: new THREE.MeshStandardMaterial({ color: 0xb9c0c8, roughness: 0.28, metalness: 0.8, envMap, envMapIntensity: 1 }),
  };
  H.M = M;

  // ---- ground, streets, sidewalks
  // draw order (opaque): buildings, trees and vehicles first, then the street surfaces, the lawn last — the
  // software rasteriser then skips most hidden fragments instead of shading the whole ground under everything
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 700).rotateX(-Math.PI / 2), M.grass);
  ground.receiveShadow = true;
  ground.renderOrder = 3;
  scene.add(ground);
  const flat = (x0, x1, z0, z1, mat, y = 0.02, t = 0.04) => {
    const m = new THREE.Mesh(box(x1 - x0, t, z1 - z0, (x0 + x1) / 2, y - t / 2, (z0 + z1) / 2), mat);
    m.receiveShadow = true; m.renderOrder = 2; scene.add(m); return m;
  };
  const curb = (x0, x1, z0, z1, mat = M.walk) => {
    const m = new THREE.Mesh(rbox(x1 - x0, 0.22, z1 - z0, 0.08, (x0 + x1) / 2, 0.11, (z0 + z1) / 2), mat);
    m.receiveShadow = true; m.castShadow = false; m.renderOrder = 1; scene.add(m); return m;
  };
  const XL = -260, XR = 260;
  flat(XL, XR, -LAY.MID_HALF, LAY.MID_HALF, M.road);                                   // middle street
  flat(CROSS_X - 3, CROSS_X + 3, -300, 120, M.road, 0.021);                            // cross street (and the bridge deck)
  // sidewalks (left and right of the cross street, both sides of the middle street)
  for (const [z0, z1] of [[LAY.MID_HALF, LAY.MID_WALK], [-LAY.MID_WALK, -LAY.MID_HALF]]) {
    curb(XL, CROSS_X - 3, z0, z1); curb(CROSS_X + 3, XR, z0, z1);
  }
  for (const [x0, x1] of [[CROSS_X - LAY.CROSS_WALK, CROSS_X - 3], [CROSS_X + 3, CROSS_X + LAY.CROSS_WALK]]) {
    curb(x0, x1, -260, -LAY.MID_WALK);            // from beyond the river (over the bridge) to the middle street
    curb(x0, x1, LAY.MID_WALK, LAY.NWALK[0]);
    curb(x0, x1, LAY.SWALK[1], 120);
  }
  // tram street: north sidewalk, grass track bed, south plaza, platform island
  curb(XL, CROSS_X - 3, LAY.NWALK[0], LAY.NWALK[1]); curb(CROSS_X + 3, XR, LAY.NWALK[0], LAY.NWALK[1]);
  flat(XL, XR, LAY.BED[0], LAY.BED[1], matte({ color: PAL.bed }), 0.03, 0.06);
  flat(CROSS_X - 3, CROSS_X + 3, LAY.BED[0] - 0.01, LAY.BED[1] + 0.01, M.road, 0.045, 0.06);   // level crossing
  curb(XL, CROSS_X - 3, LAY.SWALK[0], LAY.SWALK[1], matte({ color: PAL.plaza })); curb(CROSS_X + 3, XR, LAY.SWALK[0], LAY.SWALK[1], matte({ color: PAL.plaza }));
  flat(XL, XR, LAY.BED[1], LAY.SWALK[0], M.walk, 0.05, 0.08);
  // rails (two, polished), along the whole street
  for (const dz of [-0.72, 0.72]) {
    const r = new THREE.Mesh(box(XR - XL, 0.12, 0.14, 0, 0.1, LAY.TRAM_Z + dz), M.rail);
    r.receiveShadow = true; scene.add(r);
  }
  // the platform island with a shelter, a sign and a bench
  const P = LAY.PLAT;
  solid(scene, rbox(P.x1 - P.x0, 0.42, P.z1 - P.z0, 0.12, (P.x0 + P.x1) / 2, 0.21, (P.z0 + P.z1) / 2), 0xe9e4da);
  solid(scene, box(P.x1 - P.x0 - 0.4, 0.02, 0.3, (P.x0 + P.x1) / 2, 0.43, P.z0 + 0.3), PAL.mark);
  const sx = -7.4;
  for (const dx of [-2.4, 2.4]) solid(scene, new THREE.CylinderGeometry(0.06, 0.06, 2.7, 8).translate(sx + dx, 0.42 + 1.35, P.z1 - 0.35), PAL.pole);
  solid(scene, rbox(5.8, 0.14, 1.9, 0.06, sx, 3.18, P.z1 - 0.9), new THREE.MeshStandardMaterial({ color: 0xd9e6ee, roughness: 0.25, metalness: 0.1, envMap }));
  solid(scene, rbox(5.2, 1.7, 0.06, 0.03, sx, 1.55, P.z1 - 0.3), new THREE.MeshStandardMaterial({ color: 0xc9dbe6, roughness: 0.2, metalness: 0.1, envMap, transparent: true, opacity: 0.55 }));
  solid(scene, rbox(2.4, 0.12, 0.5, 0.05, sx, 0.92, P.z1 - 0.62), PAL.trunk);
  const sgx = P.x1 - 0.6, sgz = P.z1 - 0.7;          // the stop sign at the platform's end, clear of the tram
  solid(scene, new THREE.CylinderGeometry(0.06, 0.06, 3.0, 8).translate(sgx, 0.42 + 1.5, sgz), PAL.pole);
  solid(scene, new THREE.CylinderGeometry(0.42, 0.42, 0.1, 20).rotateX(Math.PI / 2).translate(sgx, 3.4, sgz), matte({ color: PAL.accent }));
  solid(scene, rbox(0.8, 0.6, 0.08, 0.04, sgx, 2.6, sgz), PAL.cream);

  // catenary: poles on the north sidewalk with arms, one contact wire over the track
  const cat = [];
  for (let x = -96; x <= 96; x += 24) cat.push({ x, z: LAY.NWALK[0] + 1.3 });
  instanced(scene, new THREE.CylinderGeometry(0.1, 0.12, 6.4, 8).translate(0, 3.2, 0), M.pole, cat);
  instanced(scene, box(0.08, 0.08, 4.6, 0, 6.1, 2.3), M.pole, cat);
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, XR - XL, 6).rotateZ(Math.PI / 2).translate(0, 5.8, LAY.TRAM_Z), M.dark);
  scene.add(wire);

  // ---- markings: centre dashes, crosswalk stripes, stop lines
  const marks = [];
  for (let x = -150; x < 150; x += 6) if (x + 1.5 < CROSS_X - 6 || x - 1.5 > CROSS_X + 6) marks.push({ x, y: 0.045, z: 0, sx: 3, sz: 0.16 });
  for (let z = -200; z < 100; z += 6) {
    const inJ = z + 1.5 > -7 && z - 1.5 < 7, inTram = z + 1.5 > LAY.BED[0] - 1 && z - 1.5 < LAY.BED[1] + 1, onBridge = z > -60 && z < -36;
    if (!inJ && !inTram && !onBridge) marks.push({ x: CROSS_X, y: 0.046, z, sx: 0.16, sz: 3 });
  }
  for (const cx of [CROSS_X - 4.2, CROSS_X + 4.2]) for (let z = -3.0; z <= 3.01; z += 1.0) marks.push({ x: cx, y: 0.047, z, sx: 1.9, sz: 0.5 });
  for (const cz of [-4.8, 4.8]) for (let x = CROSS_X - 2.5; x <= CROSS_X + 2.51; x += 1.0) marks.push({ x, y: 0.047, z: cz, sx: 0.5, sz: 1.8 });
  marks.push({ x: CROSS_X - 5.9, y: 0.047, z: 1.8, sx: 0.35, sz: 3.2 }, { x: CROSS_X + 5.9, y: 0.047, z: -1.8, sx: 0.35, sz: 3.2 });
  marks.push({ x: CROSS_X - 1.5, y: 0.047, z: -6.6, sx: 3.0, sz: 0.35 }, { x: CROSS_X + 1.5, y: 0.047, z: 6.6, sx: 3.0, sz: 0.35 });
  instanced(scene, box(1, 0.02, 1), M.mark, marks, { cast: false });

  // ---- river: water, embankment walls, promenade, a stone bridge for the cross street
  const [rz0, rz1] = LAY.RIVER;
  const waterNormal = waterNormalTexture();
  const water = new THREE.Mesh(new THREE.PlaneGeometry(XR - XL, rz1 - rz0, 1, 1).rotateX(-Math.PI / 2).translate(0, LAY.WATER_Y, (rz0 + rz1) / 2),
    new THREE.MeshStandardMaterial({ color: PAL.water, roughness: 0.1, metalness: 0, envMap, envMapIntensity: 1, normalMap: waterNormal, normalScale: new THREE.Vector2(0.55, 0.55) }));
  water.receiveShadow = true;
  scene.add(water);
  H.water = water;
  const bank = new THREE.Mesh(new THREE.PlaneGeometry(XR - XL, rz1 - rz0).rotateX(-Math.PI / 2).translate(0, LAY.WATER_Y - 0.5, (rz0 + rz1) / 2), matte({ color: 0x2f6f86 }));
  scene.add(bank);
  const bx0 = CROSS_X - LAY.CROSS_WALK, bx1 = CROSS_X + LAY.CROSS_WALK;
  for (const [x0, x1] of [[XL, bx0], [bx1, XR]]) for (const z of [rz0, rz1]) {
    const out = z === rz0 ? -1 : 1;
    solid(scene, box(x1 - x0, 1.6, 0.8, (x0 + x1) / 2, -0.75, z + out * 0.4), PAL.stone);
    solid(scene, rbox(x1 - x0, 0.3, 1.2, 0.1, (x0 + x1) / 2, 0.12, z + out * 0.6), 0xf1e8da);
  }
  curb(XL, XR, rz1 + 1.2, rz1 + 4.4, M.walk);          // town-side promenade
  curb(XL, XR, rz0 - 4.0, rz0 - 1.2, M.walk);
  // bridge: a shallow stone arch under the road deck (shape x = −z, because rotateY(π/2) sends the shape's x to −z)
  const pts = [[-(rz1 + 1.5), LAY.WATER_Y - 0.6], [-(rz1 + 1.5), 0.0], [-(rz0 - 1.5), 0.0], [-(rz0 - 1.5), LAY.WATER_Y - 0.6]];
  const ac = -(rz0 + rz1) / 2, ar = (rz1 - rz0) / 2 - 0.4;
  for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI; pts.push([ac + ar * Math.cos(a), LAY.WATER_Y - 0.3 + 1.15 * Math.sin(a)]); }
  const arch = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const archG = new THREE.ExtrudeGeometry(arch, { depth: bx1 - bx0, bevelEnabled: false, curveSegments: 1 });
  archG.rotateY(Math.PI / 2).translate(bx0, 0, 0);
  solid(scene, archG, PAL.stone);
  for (const x of [bx0 + 0.25, bx1 - 0.25]) solid(scene, rbox(0.5, 1.0, rz1 - rz0 + 5, 0.15, x, 0.5, (rz0 + rz1) / 2), 0xf1e8da);

  // ---- houses: rows of lots along the streets
  const houses = VARIANTS.map(() => []);
  const winList = [], doorList = [], chimneys = [];
  const addHouse = (x, zFront, face, vi, opts = {}) => {
    const v = VARIANTS[vi];
    const sx = 0.9 + R() * 0.2, sy = 0.92 + R() * 0.16, sz = 0.9 + R() * 0.2;
    const w = v.w * sx, h = v.h * sy, d = v.d * sz;
    const ry = face > 0 ? 0 : Math.PI;                       // local +z = the street facade
    const z = zFront - face * d / 2;
    const wall = PAL.walls[Math.floor(R() * PAL.walls.length)], roof = PAL.roofs[Math.floor(R() * PAL.roofs.length)];
    houses[vi].push({ x, z, ry, sx, sy, sz, wall, roof, gable: v.rise > 0 && R() < (opts.gable ?? 0.5) });
    // windows: per floor, per facade; the street facade gets a door on the ground floor
    const fh = h / v.floors, cos = Math.cos(ry), sin = Math.sin(ry);
    const put = (lx, ly, lz, rot, kind) => {
      const wx = x + lx * cos + lz * sin, wz = z - lx * sin + lz * cos;
      (kind === 'door' ? doorList : winList).push({ x: wx, y: ly, z: wz, ry: ry + rot, near: opts.near || false });
    };
    const nf = Math.max(1, Math.floor((w - 1.2) / 2.1));
    for (let f = 0; f < v.floors; f++) {
      const y = f * fh + fh * 0.56;
      for (let i = 0; i < nf; i++) {
        const lx = -w / 2 + (w / (nf + 1)) * (i + 1);
        if (f === 0 && i === (nf > 2 ? 1 : 0)) put(lx, 1.15, d / 2 + 0.03, 0, 'door');
        else put(lx, y, d / 2 + 0.03, 0, 'win');
        put(lx, y, -d / 2 - 0.03, Math.PI, 'win');
      }
      const ns = Math.max(1, Math.floor((d - 1.6) / 2.8));
      for (let i = 0; i < ns; i++) {
        const lz = -d / 2 + (d / (ns + 1)) * (i + 1);
        put(w / 2 + 0.03, y, lz, Math.PI / 2, 'win');
        put(-w / 2 - 0.03, y, lz, -Math.PI / 2, 'win');
      }
    }
    if (v.rise > 0 && R() < 0.45) {
      const lx = (R() - 0.5) * w * 0.5, lz = -d * 0.18;
      chimneys.push({ x: x + lx * cos + lz * sin, y: h + v.rise * 0.55, z: z - lx * sin + lz * cos, color: 0xe6d9c8 });
    }
    return { w, d };
  };
  // a row of lots from x0 to x1 (skipping the cross-street corridor), facades at zFront facing `face` (+1 = +z)
  const corridor = [CROSS_X - LAY.CROSS_WALK - 0.8, CROSS_X + LAY.CROSS_WALK + 0.8];
  const fences = [], paths = [], beds = [], flowers = [], sheds = [], plots = [];
  H.parked = [];
  const row = (x0, x1, zFront, face, weights, opts = {}) => {
    let x = x0;
    while (x < x1) {
      let r = R() * weights.reduce((a, b) => a + b, 0), vi = 0;
      while (r > weights[vi]) { r -= weights[vi]; vi++; }
      const half = (VARIANTS[vi].w * 1.1) / 2;
      const cx = x + half;
      if (cx + half > corridor[0] && cx - half < corridor[1]) { x = corridor[1]; continue; }
      if (R() < (opts.gap ?? 0.12)) { x += 3 + R() * 5; continue; }
      const zf = zFront - face * (opts.setback ?? 0) * R();
      const { w, d } = addHouse(cx, zf, face, vi, opts);
      if (opts.garden) {
        // front garden: a low fence along the street with a gap at the path, a flower bed, a path to the door
        const fz = opts.garden, doorX = cx - w / 2 + (w / (Math.max(1, Math.floor((w - 1.2) / 2.1)) + 1)) * (Math.max(1, Math.floor((w - 1.2) / 2.1)) > 2 ? 2 : 1);
        const a0 = cx - w / 2 - 0.6, a1 = doorX - 0.8, b0 = doorX + 0.8, b1 = cx + w / 2 + 0.6;
        if (a1 > a0) fences.push({ x: (a0 + a1) / 2, z: fz, sx: a1 - a0 });
        if (b1 > b0) fences.push({ x: (b0 + b1) / 2, z: fz, sx: b1 - b0 });
        paths.push({ x: doorX, z: (fz + zf) / 2, sz: Math.abs(zf - fz) + 0.6 });
        const bx = doorX + (R() < 0.5 ? -1 : 1) * (1.6 + R() * 0.8), bz = fz - face * 0.75;
        beds.push({ x: bx, z: bz, sx: 1.8 + R(), color: 0x7a5a44 });
        for (let k = 0; k < 7; k++) flowers.push({ x: bx + (R() - 0.5) * 2.0, y: 0.32, z: bz + (R() - 0.5) * 0.5, s: 0.8 + R() * 0.5, color: PAL.flowers[Math.floor(R() * PAL.flowers.length)] });
        // back garden: a shed or a vegetable plot
        const gz = zf - face * (d + 3 + R() * 3);
        if (R() < 0.45) sheds.push({ x: cx + (R() - 0.5) * w * 0.6, z: gz, ry: R() < 0.5 ? 0 : Math.PI / 2, color: PAL.walls[Math.floor(R() * PAL.walls.length)], roof: PAL.roofs[Math.floor(R() * PAL.roofs.length)] });
        else plots.push({ x: cx + (R() - 0.5) * w * 0.5, z: gz, sx: 2.2 + R() * 1.6, color: 0x8a6448 });
      }
      x = cx + w / 2 + (opts.space ?? 1.2) + R() * (opts.spaceR ?? 2.2);
      if (opts.drive && R() < 0.4 && x + 3.6 < x1 && !(x + 3.6 > corridor[0] && x < corridor[1])) {
        // a driveway with a parked car, nose to the street
        H.parked.push({ type: R() < 0.75 ? 0 : 1, x: x + 1.5, z: zFront - face * 3.0, ry: face > 0 ? -Math.PI / 2 : Math.PI / 2, color: PAL.cars[Math.floor(R() * PAL.cars.length)] });
        paths.push({ x: x + 1.5, z: zFront - face * 2.2, sx: 2.6, sz: 5.4, color: 0xd7cdbd });
        x += 3.4;
      }
    }
  };
  row(-72, 74, -8.6, 1, [2, 3, 3, 1.0], { setback: 0.8, garden: -6.6, drive: true, gap: 0.05, space: 0.9, spaceR: 1.4, gable: 0.6 });   // north side of the middle street (facing the camera)
  row(-72, 74, -37.0, -1, [4, 3, 0, 0], { setback: 0.6, gap: 0.08, space: 1.0, spaceR: 1.8 });   // low houses backing onto it, facing the river
  row(-60, 64, 9.8, -1, [5, 2, 0, 0], { setback: 0.4, garden: 6.7, drive: true, gap: 0.06, space: 0.8, spaceR: 1.2, gable: 0.85 });  // south side: low cottages
  row(-90, 96, -60.5, 1, [2, 3, 3, 2], { setback: 1 });             // across the river
  row(-110, 116, -84, 1, [1, 3, 3, 3], { setback: 2, gap: 0.2 });
  row(-130, 136, -108, 1, [1, 3, 3, 3], { setback: 2, gap: 0.25 });
  row(-150, 156, -132, 1, [1, 3, 3, 3], { setback: 2, gap: 0.3 });
  // the near foreground: a few houses at the bottom corners
  addHouse(-21, 38, -1, 1); addHouse(-13.5, 37.5, -1, 0); addHouse(25, 38, -1, 1); addHouse(33, 38.5, -1, 2);

  VARIANTS.forEach((v, vi) => {
    const list = houses[vi];
    const body = rbox(v.w, v.h, v.d, 0.38, 0, v.h / 2, 0, 3);
    instanced(scene, body, M.inst, list.map((o) => ({ ...o, color: o.wall })));
    if (v.rise === 0) { instanced(scene, flatRoof(v), M.inst, list.map((o) => ({ ...o, color: o.roof }))); return; }
    // two roof variants: ridge along the street, or the gable end facing it (its two slopes take light and shade)
    instanced(scene, gableRoof(v), M.inst, list.filter((o) => !o.gable).map((o) => ({ ...o, color: o.roof })));
    const turned = gableRoof({ w: v.d, d: v.w, h: v.h, rise: v.rise * 1.1 }).rotateY(Math.PI / 2);
    instanced(scene, turned, M.inst, list.filter((o) => o.gable).map((o) => ({ ...o, color: o.roof })));
  });
  instanced(scene, rbox(0.7, 1.6, 0.7, 0.12), M.inst, chimneys);
  instanced(scene, rbox(1, 0.75, 0.12, 0.04, 0, 0.375, 0), matte({ color: 0xfffaf0 }), fences, { cast: true });
  instanced(scene, box(1.2, 0.05, 1, 0, 0.03, 0), M.inst, paths.map((o) => ({ ...o, color: o.color ?? 0xe4d8c4 })), { cast: false });
  instanced(scene, rbox(1, 0.3, 0.9, 0.12, 0, 0.15, 0), M.inst, beds, { cast: false });
  instanced(scene, new THREE.IcosahedronGeometry(0.2, 0), matte({ flatShading: true }), flowers, { cast: false });
  instanced(scene, rbox(2.6, 2.0, 2.2, 0.18, 0, 1.0, 0), M.inst, sheds.map((o) => ({ ...o, color: o.color })));
  instanced(scene, gableRoof({ w: 2.2, h: 2.0, d: 2.2, rise: 1.0 }, 2), M.inst, sheds.map((o) => ({ ...o, color: o.roof })));
  instanced(scene, mergeGeometries([0, 1, 2].map((k) => rbox(1, 0.22, 0.5, 0.1, 0, 0.11, (k - 1) * 0.75))), M.inst, plots, { cast: false });
  instanced(scene, mergeGeometries([0, 1, 2].map((k) => rbox(0.9, 0.3, 0.22, 0.1, 0, 0.3, (k - 1) * 0.75))), M.leaf, plots.map((o) => ({ ...o, color: 0x5fbf4a })), { cast: false });
  instanced(scene, rbox(1.05, 2.1, 0.14, 0.05), M.inst, doorList.map((o) => ({ ...o, color: 0x5d4a3f })), { cast: false });
  // windows: unlit material, colour per instance (dark glass, or warm HDR when the room light is on)
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const windows = instanced(scene, rbox(1.0, 1.25, 0.12, 0.05), winMat, winList.map((o) => ({ ...o, color: 0x334050 })), { cast: false, receive: false });
  H.windows = windows; H.winList = winList;

  // ---- trees: a faceted canopy on a trunk (two canopy variants), hedges
  const trees = [], pines = [];
  const tree = (x, z, s = 1, kind = 'round') => {
    const it = { x, z, s: s * (0.85 + R() * 0.3), ry: R() * 6.28, color: PAL.greens[Math.floor(R() * PAL.greens.length)] };
    (kind === 'pine' ? pines : trees).push(it);
  };
  for (let x = -66; x < 70; x += 11 + R() * 4) if (x < corridor[0] - 1 || x > corridor[1] + 1) tree(x, -4.3, 0.66);     // street trees, north sidewalk
  for (let x = -90; x < 96; x += 7 + R() * 3) tree(x, LAY.RIVER[1] + 2.8, 0.9);                                           // promenade
  for (let x = -90; x < 96; x += 8 + R() * 4) tree(x, LAY.RIVER[0] - 2.6, 0.9);
  for (let i = 0; i < 26; i++) { const x = -70 + R() * 142; if (x > corridor[0] - 2 && x < corridor[1] + 2) continue; tree(x, -20 - R() * 8, 0.95 + R() * 0.3, R() < 0.25 ? 'pine' : 'round'); }  // back gardens
  for (let i = 0; i < 16; i++) { const x = -60 + R() * 124; if (x > corridor[0] - 2 && x < corridor[1] + 2) continue; tree(x, 16.6 + R() * 1.4, 0.62); }  // behind the cottages
  for (let i = 0; i < 90; i++) { const x = -150 + R() * 300, z = -68 - R() * 90; if (Math.abs(x - CROSS_X) < 7) continue; tree(x, z, 1 + R() * 0.4, R() < 0.3 ? 'pine' : 'round'); }  // far town
  for (let i = 0; i < 26; i++) { const x = -40 + R() * 84, z = 34 + R() * 26; if (Math.abs(x - CROSS_X) < 7) continue; tree(x, z, 1.05 + R() * 0.3, R() < 0.2 ? 'pine' : 'round'); }  // the park in front
  instanced(scene, new THREE.CylinderGeometry(0.22, 0.32, 2.6, 6).translate(0, 1.3, 0), matte({ color: PAL.trunk }), [...trees, ...pines].map((t) => ({ ...t, color: undefined })));
  instanced(scene, new THREE.IcosahedronGeometry(2.5, 1).scale(1, 1.08, 1).translate(0, 4.6, 0), M.leaf, trees);
  instanced(scene, new THREE.ConeGeometry(2.1, 5.6, 7, 2).translate(0, 5.0, 0), M.leaf, pines);
  const hedges = [];
  for (let x = -70; x < 72; x += 9 + R() * 6) if (x < corridor[0] - 2 || x > corridor[1] + 2) hedges.push({ x, z: 17.7, sx: 3 + R() * 3, color: PAL.hedge });
  for (let x = -40; x < 44; x += 7 + R() * 5) if (Math.abs(x - CROSS_X) > 8) hedges.push({ x, z: 32.6, sx: 2.5 + R() * 2.5, color: PAL.hedge });
  instanced(scene, rbox(1, 1.1, 1.2, 0.35, 0, 0.55, 0), M.inst, hedges);

  // ---- street lamps (middle street, both sidewalks) and traffic signals at the crossroads
  const lamps = [];
  for (let x = -62; x < 66; x += 12) {
    if (x > corridor[0] - 1.5 && x < corridor[1] + 1.5) continue;
    lamps.push({ x, z: 4.15 }, { x: x + 6, z: -4.15 });
  }
  for (let z = -36; z < 18; z += 12) if (Math.abs(z) > 8) lamps.push({ x: CROSS_X - 3.4, z }, { x: CROSS_X + 3.4, z: z + 6 });
  instanced(scene, mergeGeometries([new THREE.CylinderGeometry(0.07, 0.11, 4.2, 8).translate(0, 2.1, 0), new THREE.CylinderGeometry(0.2, 0.14, 0.18, 10).translate(0, 4.22, 0)]), M.pole, lamps);
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  H.bulbs = instanced(scene, new THREE.SphereGeometry(0.34, 14, 10).translate(0, 4.6, 0), bulbMat, lamps.map((l) => ({ ...l, color: 0x666666 })), { cast: false, receive: false });
  H.lamps = lamps;
  // signal heads: [x, z, ry, phase] — each faces its approach
  const SIG = [
    [CROSS_X - 3.6, 4.6, -Math.PI / 2, 'EW'], [CROSS_X + 3.6, -4.6, Math.PI / 2, 'EW'],
    [CROSS_X - 4.0, -4.4, Math.PI, 'NS'], [CROSS_X + 4.0, 4.4, 0, 'NS'],
  ];
  const sigPoles = SIG.map(([x, z]) => ({ x, z }));
  instanced(scene, new THREE.CylinderGeometry(0.08, 0.08, 3.6, 8).translate(0, 1.8, 0), M.pole, sigPoles);
  instanced(scene, rbox(0.42, 1.2, 0.36, 0.08, 0, 3.4, 0), M.dark, SIG.map(([x, z, ry]) => ({ x, z, ry })));
  const sigLamps = [];
  SIG.forEach(([x, z, ry, ph]) => {
    ['R', 'Y', 'G'].forEach((col, k) => {
      const lz = 0.19;
      sigLamps.push({ x: x + lz * Math.sin(ry), y: 3.78 - k * 0.38, z: z + lz * Math.cos(ry), ry, ph, col, color: 0x222222 });
    });
  });
  H.sigLamps = sigLamps;
  H.sigMesh = instanced(scene, new THREE.SphereGeometry(0.13, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), sigLamps, { cast: false, receive: false });

  // ---- vehicles: capacity per type, matrices written per frame
  H.vehicles = {};
  for (const t of VTYPES) {
    const g = vehicleGeos(t.name);
    const N = t.name === 'bus' ? 4 : 60;
    const mk = (geo, mat, cast) => { const m = new THREE.InstancedMesh(geo, mat, N); m.count = 0; m.castShadow = cast; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); return m; };
    H.vehicles[t.name] = { paint: mk(g.paint, M.inst, true), glass: mk(g.glass, M.glass, true), dark: mk(g.dark, M.dark, false), lights: g.lights };
  }
  H.carLights = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), 300);
  H.carLights.count = 0; H.carLights.frustumCulled = false;
  scene.add(H.carLights);

  // ---- pedestrians: a body and a head
  H.peds = {
    body: new THREE.InstancedMesh(rbox(0.5, 1.2, 0.36, 0.16, 0, 0.62, 0), M.inst, 64),
    head: new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 10, 8).translate(0, 1.47, 0), matte({ color: 0xf1d2b6 }), 64),
  };
  for (const m of Object.values(H.peds)) { m.count = 0; m.castShadow = true; m.frustumCulled = false; scene.add(m); }

  // ---- the tram
  const tram = buildTram(envMap);
  tram.g.position.set(-60, 0.06, LAY.TRAM_Z);
  scene.add(tram.g);
  H.tram = tram;

  return { scene, H };
}

/** tileable wave normals for the river (sum of a few sines), drawn once */
function waterNormalTexture() {
  const N = 128, data = new Uint8Array(N * N * 4);
  const waves = [[1, 3, 0.6, 0.3], [4, -2, 0.35, 1.1], [-3, 5, 0.25, 2.2], [7, 1, 0.18, 0.7], [2, 9, 0.12, 4.0]];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let dx = 0, dy = 0;
    for (const [kx, ky, a, ph] of waves) {
      const s = Math.cos(((kx * i + ky * j) / N) * Math.PI * 2 + ph) * a;
      dx += s * kx; dy += s * ky;
    }
    const nx = -dx * 0.12, ny = -dy * 0.12, l = Math.hypot(nx, ny, 1);
    const q = (j * N + i) * 4;
    data[q] = Math.round((nx / l * 0.5 + 0.5) * 255); data[q + 1] = Math.round((ny / l * 0.5 + 0.5) * 255);
    data[q + 2] = Math.round((1 / l * 0.5 + 0.5) * 255); data[q + 3] = 255;
  }
  const tx = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  tx.repeat.set(36, 1.6);
  tx.magFilter = THREE.LinearFilter; tx.minFilter = THREE.LinearMipmapLinearFilter; tx.generateMipmaps = true;
  tx.needsUpdate = true;
  return tx;
}

// ---------------------------------------------------------------- traffic: car-following (IDM) with a signal, baked
/*
 * Four ring lanes through the crossroads. Along a lane, u grows in the driving direction (u = dir · axis coordinate),
 * the ring is [u0, u0 + L). Each step: IDM acceleration toward the leader (or toward the stop line while the lane's
 * light is red/amber and the car can still stop), semi-implicit Euler, no overtaking. The positions of every car are
 * stored for every step; frame() only reads them at its (quantised) world time.
 */
export const SIGNAL = { cycle: 23, offset: -5.2, EW: [0, 9.5, 11.5], NS: [12.0, 20.5, 22.5] };   // [green from, amber from, red from] in the cycle
export function signalState(phase, W) {
  const c = ((W + SIGNAL.offset) % SIGNAL.cycle + SIGNAL.cycle) % SIGNAL.cycle;
  const [g, a, r] = SIGNAL[phase];
  return c >= g && c < a ? 'G' : c >= a && c < r ? 'Y' : 'R';
}
export const LANES = [
  { axis: 'x', dir: 1, off: 1.8, u0: -140, L: 260, stop: CROSS_X - 5.9 - 0.2, phase: 'EW', n: 14 },
  { axis: 'x', dir: -1, off: -1.8, u0: -130, L: 260, stop: CROSS_X + 5.9 + 0.2, phase: 'EW', n: 13 },
  { axis: 'z', dir: 1, off: CROSS_X - 1.5, u0: -190, L: 270, stop: -6.6 - 0.2, phase: 'NS', n: 12 },
  { axis: 'z', dir: -1, off: CROSS_X + 1.5, u0: -80, L: 270, stop: 6.6 + 0.2, phase: 'NS', n: 12 },
];
export function bakeTraffic(R, { W0 = -60, W1 = 40, dt = 0.05 } = {}) {
  const steps = Math.round((W1 - W0) / dt) + 1;
  const lanes = LANES.map((ln) => {
    const cars = [];
    for (let i = 0; i < ln.n; i++) {
      const r = R();
      const type = r < 0.08 && ln.axis === 'x' ? 2 : r < 0.3 ? 1 : 0;
      cars.push({ type, len: VTYPES[type].len, v0: (type === 2 ? 10.5 : 11.5) + R() * 3, color: PAL.cars[Math.floor(R() * PAL.cars.length)] });
    }
    // evenly spread with jitter; car 0 is the furthest along
    const gap = ln.L / ln.n;
    cars.forEach((c, i) => { c.u = ln.u0 + ln.L - (i + 0.5) * gap + (R() - 0.5) * gap * 0.4; c.v = c.v0 * 0.6; });
    return { ln, cars, pos: new Float32Array(steps * ln.n) };
  });
  const A = 1.6, B = 2.4, T = 1.1, S0 = 2.2;
  const stopU = (ln) => ln.dir * ln.stop;
  const wrap = (d, L) => ((d % L) + L) % L;
  for (let k = 0; k < steps; k++) {
    const W = W0 + k * dt;
    for (const { ln, cars, pos } of lanes) {
      const n = cars.length, light = signalState(ln.phase, W), su = stopU(ln);
      const acc = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const c = cars[i], lead = cars[(i - 1 + n) % n];
        let gap = wrap(lead.u - lead.len / 2 - (c.u + c.len / 2), ln.L);
        let dv = c.v - lead.v;
        if (light !== 'G') {
          const ds = wrap(su - (c.u + c.len / 2), ln.L);
          const canStop = ds > (c.v * c.v) / (2 * 4.5) + 0.5;
          if (ds < 90 && ds < gap && canStop && (light === 'R' || ds > (c.v * c.v) / (2 * B))) { gap = Math.max(ds - 0.6, 0.01); dv = c.v; }
        }
        const sStar = S0 + Math.max(0, c.v * T + (c.v * dv) / (2 * Math.sqrt(A * B)));
        acc[i] = A * (1 - (c.v / c.v0) ** 4 - (sStar / Math.max(gap, 0.01)) ** 2);
      }
      for (let i = 0; i < n; i++) {
        const c = cars[i];
        c.v = Math.max(0, c.v + Math.max(acc[i], -9) * dt);
        c.u += c.v * dt;
        if (c.u >= ln.u0 + ln.L) c.u -= ln.L;
        pos[k * n + i] = c.u;
      }
    }
  }
  return { W0, dt, steps, lanes };
}
