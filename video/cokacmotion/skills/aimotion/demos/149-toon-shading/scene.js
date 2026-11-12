/*
 * scene.js — the bus stop, built from primitives and merged into a few meshes.
 *
 * Every part carries its own material in vertex attributes, so the whole set of static props is ONE toon mesh plus
 * ONE hull mesh (and the same geometry is the shadow caster):
 *   aCol  albedo (linear)     aMat  gloss, rim, hatch (-1 = window), line width in px
 *   aEmit self-lit amount (-1 = foliage normals, -2 = printed sign from the atlas)
 *   aOutN the smoothed normal used only by the outline hull (see outlineNormals)
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------------------------------------------------------------- layout (metres; y up, the camera looks toward -z)
export const SX = -0.2;                         // shelter centre x
export const ROOF = { x0: SX - 1.9, x1: SX + 1.9, z0: -1.52, z1: 0.72, y: 2.62 };
export const LAMP = { x: 2.4, z: 1.2, head: new THREE.Vector3(1.32, 4.82, 1.2) };
export const WALK_Y = 0.15;
export const CURB_Z = 1.62;
export const PUD = { x0: -6, z0: 1.4, w: 16, d: 10, W: 512, H: 320 };

// colour tokens: a cool blue night and ONE warm accent (lamp + headlights + a few windows)
export const C = {
  ink: '#0a0f24',
  accent: '#ffc24d',
  // albedos stay near-neutral: the blue of the night and the warm of the lamp come from the LIGHTS,
  // so a warm light can still turn a surface warm (a blue albedo would swallow it)
  frame: '#b3b9c8', roof: '#7b8296', panel: '#a6aebf', slat: '#9ba2b4', iron: '#4c5163',
  umbrella: '#3f86b8', handle: '#dfe3ec',
  pole: '#5b6174', lampHead: '#6e7488',
  tree: '#5a8a7c', trunk: '#5c5a68',
  curb: '#a9afbd', fascia: '#3a4259',
  build: ['#6c7181', '#5d6273', '#767b8b', '#575c6c', '#666b7b'],
  far: '#4a4f62', glass: '#2b3042', cool: '#a9c6ee',
};

// ---------------------------------------------------------------- part → attributed, non-indexed geometry
const tmpC = new THREE.Color();
function prep(geo, { p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1], col = '#ffffff', gloss = 0, rim = 1, hatch = 0, line = 2.6, emit = 0 }) {
  let g = geo.index ? geo.toNonIndexed() : geo.clone();
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s));
  g.applyMatrix4(m);
  for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
  const n = g.attributes.position.count;
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
  tmpC.set(col);                                   // sRGB token → linear working space
  const aCol = new Float32Array(n * 3), aMat = new Float32Array(n * 4), aEmit = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    aCol[i * 3] = tmpC.r; aCol[i * 3 + 1] = tmpC.g; aCol[i * 3 + 2] = tmpC.b;
    aMat[i * 4] = gloss; aMat[i * 4 + 1] = rim; aMat[i * 4 + 2] = hatch; aMat[i * 4 + 3] = line;
    aEmit[i] = emit;
  }
  g.setAttribute('aCol', new THREE.BufferAttribute(aCol, 3));
  g.setAttribute('aMat', new THREE.BufferAttribute(aMat, 4));
  g.setAttribute('aEmit', new THREE.BufferAttribute(aEmit, 1));
  g.setAttribute('aOutN', new THREE.BufferAttribute(outlineNormals(g), 3));
  return g;
}

/**
 * Outline normals: every vertex gets the normalised sum of the DISTINCT face normals that meet at its position.
 * A box corner then pushes out diagonally, so the inflated hull stays closed; with the split normals of a hard
 * edge the three faces would drift apart and the line would break at every corner.
 */
export function outlineNormals(g) {
  const p = g.attributes.position, nrm = g.attributes.normal, n = p.count;
  const groups = new Map(), keys = new Array(n);
  for (let i = 0; i < n; i++) {
    const k = `${Math.round(p.getX(i) * 4000)},${Math.round(p.getY(i) * 4000)},${Math.round(p.getZ(i) * 4000)}`;
    keys[i] = k;
    let list = groups.get(k);
    if (!list) groups.set(k, (list = []));
    const nx = nrm.getX(i), ny = nrm.getY(i), nz = nrm.getZ(i);
    if (!list.some((q) => q[0] * nx + q[1] * ny + q[2] * nz > 0.999)) list.push([nx, ny, nz]);
  }
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let x = 0, y = 0, z = 0;
    for (const q of groups.get(keys[i])) { x += q[0]; y += q[1]; z += q[2]; }
    const l = Math.hypot(x, y, z);
    if (l < 1e-3) { x = nrm.getX(i); y = nrm.getY(i); z = nrm.getZ(i); } else { x /= l; y /= l; z /= l; }
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
  }
  return out;
}

const rbox = (w, h, d, rad = 0.03, seg = 2) => new RoundedBoxGeometry(w, h, d, seg, Math.min(rad, w / 2.01, h / 2.01, d / 2.01));
const curveTube = (pts, r, seg = 24, rad = 8) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))), seg, r, rad, false);

// ---------------------------------------------------------------- the near props (casters + receivers)
export function buildProps(R) {
  const parts = [];
  const add = (geo, o) => parts.push(prep(geo, o));

  // --- shelter
  const frame = { col: C.frame, gloss: 0.7, rim: 1, line: 2.6 };
  for (const x of [ROOF.x0 + 0.12, ROOF.x1 - 0.12]) {
    for (const z of [0.5, -1.32]) add(new THREE.CylinderGeometry(0.05, 0.05, ROOF.y - WALK_Y, 14), { ...frame, p: [x, (ROOF.y + WALK_Y) / 2, z] });
  }
  add(rbox(3.86, 0.12, 2.26, 0.05), { col: C.roof, gloss: 0.6, p: [SX, ROOF.y + 0.05, (ROOF.z0 + ROOF.z1) / 2 - 0.02], r: [-0.035, 0, 0] });
  add(rbox(3.9, 0.34, 0.1, 0.035), { col: C.fascia, gloss: 0.4, p: [SX, ROOF.y - 0.08, ROOF.z1 - 0.02] });
  add(rbox(3.9, 0.2, 0.08, 0.03), { col: C.roof, p: [SX, ROOF.y - 0.05, ROOF.z0 + 0.06] });
  // back wall: rails, mullion, two frosted panels; left side panel
  const zb = -1.36;
  add(rbox(3.56, 0.06, 0.07, 0.025), { ...frame, p: [SX, 0.44, zb] });
  add(rbox(3.56, 0.06, 0.07, 0.025), { ...frame, p: [SX, 2.33, zb] });
  add(rbox(0.06, 1.9, 0.07, 0.025), { ...frame, p: [SX, 1.385, zb] });
  for (const dx of [-0.88, 0.88]) add(rbox(1.7, 1.83, 0.03, 0.012, 1), { col: C.panel, gloss: 0.55, rim: 0.6, hatch: 0, line: 1.8, p: [SX + dx, 1.385, zb - 0.01] });
  add(rbox(0.03, 2.06, 1.7, 0.012, 1), { col: C.panel, gloss: 0.55, rim: 0.6, line: 1.8, p: [ROOF.x0 + 0.12, 1.5, -0.41] });
  add(rbox(0.07, 0.06, 1.78, 0.025), { ...frame, p: [ROOF.x0 + 0.12, 0.44, -0.41] });
  add(rbox(0.07, 0.06, 1.78, 0.025), { ...frame, p: [ROOF.x0 + 0.12, 2.54, -0.41] });

  // --- bench (seat 0.45 m above the pavement)
  const benchZ = -0.98;
  for (const dz of [-0.14, 0, 0.14]) add(rbox(2.34, 0.045, 0.12, 0.018), { col: C.slat, gloss: 0.75, line: 2.2, p: [SX, WALK_Y + 0.45, benchZ + dz] });
  for (const [dy, dz] of [[0.66, -0.235], [0.82, -0.255]]) add(rbox(2.34, 0.11, 0.04, 0.016), { col: C.slat, gloss: 0.75, line: 2.2, p: [SX, WALK_Y + dy, benchZ + dz], r: [-0.12, 0, 0] });
  for (const dx of [-1.1, 1.1]) {
    add(rbox(0.06, 0.62, 0.07, 0.025), { col: C.iron, gloss: 0.5, line: 2.2, p: [SX + dx, WALK_Y + 0.31, benchZ + 0.17] });
    add(rbox(0.06, 0.95, 0.07, 0.025), { col: C.iron, gloss: 0.5, line: 2.2, p: [SX + dx, WALK_Y + 0.475, benchZ - 0.22], r: [-0.12, 0, 0] });
    add(rbox(0.07, 0.05, 0.5, 0.02), { col: C.iron, gloss: 0.5, line: 2.2, p: [SX + dx, WALK_Y + 0.66, benchZ - 0.02] });
    add(rbox(0.06, 0.05, 0.46, 0.02), { col: C.iron, gloss: 0.5, line: 2.2, p: [SX + dx, WALK_Y + 0.42, benchZ - 0.02] });
  }

  // --- folded umbrella leaning on the bench's right arm: a creased lathe, a strap, a J handle
  {
    const prof = [[0, 0], [0.006, 0], [0.007, 0.07], [0.016, 0.095], [0.04, 0.2], [0.052, 0.32], [0.047, 0.46], [0.032, 0.58], [0.013, 0.645], [0.009, 0.66], [0.009, 0.8], [0, 0.8]]
      .map(([r, y]) => new THREE.Vector2(r, y));
    const lathe = new THREE.LatheGeometry(prof, 40);
    const pos = lathe.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      if (y < 0.09 || y > 0.65) continue;
      const a = Math.atan2(z, x), k = 0.84 + 0.26 * Math.abs(Math.cos(4 * a));   // eight soft folds
      pos.setX(i, x * k); pos.setZ(i, z * k);
    }
    lathe.computeVertexNormals();
    const strap = new THREE.TorusGeometry(0.05, 0.009, 6, 28).rotateX(Math.PI / 2).translate(0, 0.36, 0);
    const handle = curveTube([[0, 0.79, 0], [0, 0.86, 0], [0.012, 0.92, 0], [0.045, 0.945, 0], [0.074, 0.925, 0], [0.08, 0.885, 0]], 0.013, 24, 8);
    const ferrule = new THREE.CylinderGeometry(0.008, 0.008, 0.05, 8).translate(0, 0.66, 0);
    const place = { p: [SX + 1.27, WALK_Y, benchZ + 0.17], r: [-0.3, 0.6, 0.3] };
    add(lathe, { col: C.umbrella, gloss: 0.9, rim: 1, line: 2.2, ...place });
    add(strap, { col: C.umbrella, gloss: 0.6, line: 1.6, ...place });
    add(handle, { col: C.handle, gloss: 0.8, line: 2.0, ...place });
    add(ferrule, { col: C.iron, line: 1.6, ...place });
  }

  // --- street lamp: base, tapered pole, crook arm, cobra head, glowing lens
  {
    const { x, z } = LAMP;
    add(new THREE.CylinderGeometry(0.11, 0.14, 0.42, 18), { col: C.pole, gloss: 0.5, p: [x, WALK_Y + 0.21, z] });
    add(new THREE.CylinderGeometry(0.048, 0.072, 4.66, 16), { col: C.pole, gloss: 0.6, p: [x, WALK_Y + 2.33, z] });
    add(curveTube([[x, 4.64, z], [x, 4.92, z], [x - 0.12, 5.08, z], [x - 0.45, 5.12, z], [x - 0.8, 5.02, z], [x - 0.95, 4.94, z]], 0.034, 28, 8), { col: C.pole, gloss: 0.6, line: 2.4 });
    add(rbox(0.66, 0.15, 0.3, 0.06, 3), { col: C.lampHead, gloss: 0.6, p: [LAMP.head.x, LAMP.head.y + 0.1, z], r: [0, 0, 0.1] });
    add(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { col: C.accent, emit: 4.0, rim: 0, line: 1.4, p: [LAMP.head.x, LAMP.head.y + 0.05, z], s: [0.25, 0.07, 0.12], r: [0, 0, 0.1] });
  }

  // --- the zelkova behind the shelter: trunk, two limbs, a cluster of round crowns
  {
    const tx = -3.75, tz = -2.9;
    add(new THREE.CylinderGeometry(0.13, 0.22, 3.9, 12), { col: C.trunk, line: 2.4, hatch: 1, p: [tx, WALK_Y + 1.95, tz], r: [0, 0, 0.04] });
    add(new THREE.CylinderGeometry(0.06, 0.11, 2.0, 10), { col: C.trunk, line: 2.0, hatch: 1, p: [tx + 0.55, 4.1, tz + 0.1], r: [0.1, 0, -0.62] });
    add(new THREE.CylinderGeometry(0.05, 0.1, 1.8, 10), { col: C.trunk, line: 2.0, hatch: 1, p: [tx - 0.5, 4.2, tz - 0.1], r: [-0.1, 0, 0.55] });
    const crowns = [[0, 5.6, 0, 1.55], [1.25, 5.05, 0.3, 1.15], [-1.2, 5.15, -0.2, 1.2], [0.55, 6.55, -0.2, 1.15], [-0.7, 6.35, 0.25, 1.05], [0.3, 4.75, 0.9, 0.95], [1.85, 5.9, -0.4, 0.85], [-1.9, 5.85, 0.1, 0.8]];
    for (const [dx, y, dz, rad] of crowns) {
      const s = 0.92 + 0.16 * R();
      add(new THREE.IcosahedronGeometry(rad, 3), { col: C.tree, rim: 1, hatch: 1, line: 2.6, emit: -1, p: [tx + dx, y, tz + dz], s: [s, 0.86, s * 0.95] });
    }
  }

  // --- kerb stones (1 m blocks: their hulls draw the joints)
  for (let i = -14; i < 14; i++) add(rbox(0.985, 0.17, 0.26, 0.045), { col: C.curb, gloss: 0.4, rim: 0.7, line: 1.6, p: [i + 0.5, 0.065, CURB_Z - 0.13] });

  return mergeGeometries(parts, false);
}

// ---------------------------------------------------------------- the background: blocks with windows, a far skyline, wires
export function buildCity(R) {
  const parts = [];
  const add = (geo, o) => parts.push(prep(geo, o));
  const blocks = [
    // x0, x1, front z, height, depth, colour index
    [-14, -7.8, -7.6, 12.5, 7, 0], [-7.6, -4.3, -8.6, 7.2, 6, 1], [-4.1, 0.5, -9.8, 15.5, 7, 2],
    [0.7, 4.7, -7.1, 9.6, 6, 3], [4.9, 9.4, -8.2, 13.2, 7, 4], [9.6, 14, -7.4, 10.4, 6, 1],
  ];
  for (const [x0, x1, zf, h, d, ci] of blocks) {
    const w = x1 - x0, cx = (x0 + x1) / 2;
    add(rbox(w, h, d, 0.08), { col: C.build[ci], gloss: 0.15, rim: 1, hatch: 1, line: 1.5, p: [cx, h / 2, zf - d / 2] });
    add(rbox(w + 0.16, 0.22, d + 0.16, 0.05), { col: C.build[(ci + 2) % 5], gloss: 0.2, rim: 1, line: 1.3, p: [cx, h + 0.11, zf - d / 2] });   // parapet cap
    for (let f = 1; f * 2.9 + 0.9 < h - 0.6; f++) add(rbox(w + 0.12, 0.13, 0.3, 0.04), { col: C.build[(ci + 1) % 5], gloss: 0.2, rim: 1, line: 1.3, p: [cx, f * 2.9 + 0.95, zf + 0.1] });
    // windows on the front face (floors every 2.9 m)
    const cols = Math.max(1, Math.floor((w - 0.8) / 1.45));
    const gap = (w - cols * 1.45) / 2;
    for (let f = 0; f * 2.9 + 1.4 + 1.3 < h - 0.4; f++) {
      for (let c = 0; c < cols; c++) {
        const u = R();
        const lit = u < 0.16 ? 'warm' : u < 0.46 ? 'cool' : null;
        const wx = x0 + gap + 1.45 * (c + 0.5), wy = 1.4 + f * 2.9 + 0.65;
        const geo = new THREE.PlaneGeometry(0.86, 1.25);
        if (lit === 'warm') add(geo, { col: C.accent, emit: 0.8 + 0.5 * R(), rim: 0, hatch: -1, line: 0, p: [wx, wy, zf + 0.012] });
        else if (lit === 'cool') add(geo, { col: C.cool, emit: 0.22 + 0.16 * R(), rim: 0, hatch: -1, line: 0, p: [wx, wy, zf + 0.012] });
        else add(geo, { col: C.glass, gloss: 0.6, rim: 0, hatch: -1, line: 0, p: [wx, wy, zf + 0.012] });
      }
    }
  }
  // roof clutter: a water tank, units, a mast
  add(new THREE.CylinderGeometry(0.75, 0.75, 1.3, 20), { col: C.build[2], gloss: 0.3, line: 1.4, p: [2.4, 9.6 + 0.87, -9.6] });
  add(new THREE.CylinderGeometry(0.8, 0.8, 0.12, 20), { col: C.build[4], line: 1.2, p: [2.4, 9.6 + 1.58, -9.6] });
  add(rbox(1.4, 0.8, 1.0, 0.08), { col: C.build[1], line: 1.3, p: [-1.4, 15.5 + 0.62, -12.5] });
  add(new THREE.CylinderGeometry(0.03, 0.05, 3.2, 6), { col: C.iron, line: 1.2, p: [-2.6, 15.5 + 1.82, -13.4] });
  add(rbox(1.0, 0.6, 0.8, 0.06), { col: C.build[0], line: 1.3, p: [6.4, 13.2 + 0.52, -10] });
  // far skyline (fog does most of the work)
  const far = [[-24, -16, 22], [-16, -9, 28], [-9, -3, 19], [-3, 3, 31], [3, 8, 24], [8, 15, 27], [15, 22, 20]];
  for (const [x0, x1, h] of far) add(rbox(x1 - x0, h, 6, 0.1), { col: C.far, rim: 0.6, line: 1.0, p: [(x0 + x1) / 2, h / 2, -30 - (x0 % 3)] });
  // overhead wires, off-frame pole to off-frame pole, with a catenary sag
  for (const [y, dz, sag] of [[7.0, 0, 0.5], [7.32, 0.25, 0.55], [7.64, -0.2, 0.45], [6.6, 0.5, 0.62]]) {
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16, x = -12 + 22 * u;
      pts.push([x, y - sag * 4 * u * (1 - u) * 1.0, -3.6 + dz]);
    }
    add(curveTube(pts, 0.012, 64, 4), { col: C.iron, rim: 0, line: 1.3 });
  }
  return mergeGeometries(parts, false);
}

// ---------------------------------------------------------------- signs: one canvas atlas for the fascia and the route poster
export function signAtlas() {
  const cv = document.createElement('canvas');
  cv.width = 2048; cv.height = 1024;
  const g = cv.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 2048, 1024);
  // fascia band (2048 × 176): dark plate, a drawn bus pictogram, the stop name
  g.fillStyle = '#2a3961'; g.fillRect(0, 0, 2048, 176);
  g.fillStyle = '#d9e3f4';
  const bus = (x, y, s) => {
    g.beginPath(); g.roundRect(x, y, 1.6 * s, 1.0 * s, 0.18 * s); g.fill();
    g.fillStyle = '#2a3961';
    g.beginPath(); g.roundRect(x + 0.12 * s, y + 0.14 * s, 1.36 * s, 0.38 * s, 0.06 * s); g.fill();
    g.beginPath(); g.arc(x + 0.36 * s, y + 1.0 * s, 0.16 * s, 0, Math.PI * 2); g.arc(x + 1.24 * s, y + 1.0 * s, 0.16 * s, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d9e3f4';
    g.beginPath(); g.arc(x + 0.36 * s, y + 1.0 * s, 0.09 * s, 0, Math.PI * 2); g.arc(x + 1.24 * s, y + 1.0 * s, 0.09 * s, 0, Math.PI * 2); g.fill();
  };
  bus(150, 40, 70);
  g.font = '700 92px "Pretendard Variable"';
  g.textBaseline = 'middle';
  g.fillText('느티나무 앞', 330, 92);
  g.font = '600 60px "Pretendard Variable"';
  g.textAlign = 'right';
  g.fillStyle = '#9fb0d0';
  g.fillText('정류장', 1890, 94);
  g.textAlign = 'left';
  // route poster (region 0..600 × 240..1024): a pale sheet with one line and its stops
  g.fillStyle = '#c9d7ee'; g.fillRect(0, 240, 600, 784);
  g.fillStyle = '#2a3961'; g.fillRect(0, 240, 600, 120);
  g.fillStyle = '#d9e3f4';
  g.font = '700 58px "Pretendard Variable"';
  g.fillText('노선 안내', 44, 302);
  g.strokeStyle = '#4b6194'; g.lineWidth = 16; g.lineCap = 'round';
  g.beginPath(); g.moveTo(130, 420); g.lineTo(130, 960); g.stroke();
  g.font = '600 38px "Pretendard Variable"'; g.fillStyle = '#3a4c78';
  const stops = ['시장 입구', '도서관', '느티나무 앞', '강변 공원', '종점'];
  stops.forEach((s, i) => {
    const y = 430 + i * 130;
    g.fillStyle = i === 2 ? '#2a3961' : '#f2f6fc';
    g.strokeStyle = '#4b6194'; g.lineWidth = 8;
    g.beginPath(); g.arc(130, y, i === 2 ? 30 : 20, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = '#3a4c78';
    g.font = `${i === 2 ? 800 : 600} 40px "Pretendard Variable"`;
    g.fillText(s, 190, y + 2);
  });
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;

  // the two planes, uv remapped into their atlas regions, as one attributed geometry (no outline: line = 0)
  const plane = (w, h, u0, v0, u1, v1, o) => {
    const geo = new THREE.PlaneGeometry(w, h);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0));
    return prep(geo, { col: '#ffffff', rim: 0.4, line: 0, gloss: 0.3, emit: -2, ...o });
  };
  // canvas y grows downward, texture v grows upward (flipY): region rows r0..r1 → v = 1 - r/1024
  const sign = plane(3.74, 0.3, 0, 1 - 176 / 1024, 1, 1, { p: [SX, ROOF.y - 0.08, ROOF.z1 + 0.032] });
  const poster = plane(0.62, 0.81, 0, 0, 600 / 2048, 1 - 240 / 1024, { p: [SX + 0.95, 1.5, -1.338], gloss: 0.5 });
  return { tex, geo: mergeGeometries([sign, poster], false) };
}

// ---------------------------------------------------------------- puddles: a smooth field (0.5 = the water's edge) over the road
export function puddleField(R) {
  const { x0, z0, w, d, W, H } = PUD;
  // seeded value noise
  const N = 64, grid = new Float32Array(N * N);
  for (let i = 0; i < grid.length; i++) grid[i] = R();
  const vn = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const at = (a, b) => grid[(((b % N) + N) % N) * N + (((a % N) + N) % N)];
    return (at(xi, yi) * (1 - sx) + at(xi + 1, yi) * sx) * (1 - sy) + (at(xi, yi + 1) * (1 - sx) + at(xi + 1, yi + 1) * sx) * sy;
  };
  const pools = [
    // x, z, rx, rz, rotation
    [1.25, 5.3, 2.5, 1.55, 0.18], [-0.5, 1.98, 3.4, 0.34, 0], [3.7, 3.25, 0.85, 0.36, -0.2],
    [-2.5, 6.9, 1.25, 0.52, 0.1], [4.0, 8.4, 1.1, 0.55, 0.3], [-1.3, 4.0, 0.55, 0.26, 0.4],
  ];
  const data = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const x = x0 + ((i + 0.5) / W) * w, z = z0 + ((j + 0.5) / H) * d;
      const wob = (vn(x * 1.1, z * 1.1) - 0.5) * 0.5 + (vn(x * 3.3 + 9, z * 3.3) - 0.5) * 0.22;
      let v = 0;
      for (const [px, pz, rx, rz, a] of pools) {
        const dx = x - px, dz = z - pz, c = Math.cos(a), s = Math.sin(a);
        const ex = (dx * c - dz * s) / rx, ez = (dx * s + dz * c) / rz;
        v = Math.max(v, 1.5 - Math.hypot(ex, ez) + wob);
      }
      data[j * W + i] = Math.round(Math.max(0, Math.min(1, v)) * 255);
    }
  }
  const tex = new THREE.DataTexture(data, W, H, THREE.RedFormat, THREE.UnsignedByteType);
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

// ---------------------------------------------------------------- an open cone (apex at origin, opening toward +z) for light shafts
export function coneGeometry(len, radius) {
  const g = new THREE.CylinderGeometry(0, radius, len, 40, 10, true);
  g.translate(0, -len / 2, 0);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, along = new Float32Array(p.count);
  for (let i = 0; i < p.count; i++) along[i] = p.getZ(i) / len;
  g.setAttribute('aAlong', new THREE.BufferAttribute(along, 1));
  return g;
}
