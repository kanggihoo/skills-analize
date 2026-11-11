/*
 * product.js — the invented tumbler: one designed profile curve turned on a lathe, a steel band, a separate lid.
 *
 *   profile   (r, y) points in product units (1 unit ≈ 10 cm): base fillet arc → foot → waist → shoulder → seam groove
 *             (paint), then the steel band → rolled lip arc → inner wall (steel). Smooth runs are centripetal
 *             Catmull-Rom curves resampled at equal arc length, the round parts are exact arcs.
 *   lathe     LatheGeometry around y; v is re-written as arc length so textures keep their scale along the profile.
 *   materials MeshPhysicalMaterial: powder-coated paint (grain normal map + clear coat), brushed steel (anisotropy +
 *             a line texture used as roughness and bump); MeshStandardMaterial: satin lid plastic, silicone; a black slot.
 *   textures  generated in setup into DataTextures from seeded noise (no image files).
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rand } from '../_lib/stage.js';

export const SEG = 160;              // lathe segments around the axis

// ---------------------------------------------------------------- profile builders: points are [r, y]
function arc(out, cx, cy, R, a0, a1, n) {
  for (let i = 1; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; out.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
}
// a smooth run through control points, resampled at equal arc length (the first point is already in `out`)
function run(out, pts, n) {
  const c = new THREE.CatmullRomCurve3(pts.map(([r, y]) => new THREE.Vector3(r, y, 0)), false, 'centripetal');
  const sp = c.getSpacedPoints(n);
  for (let i = 1; i <= n; i++) out.push([sp[i].x, sp[i].y]);
}

export const LIP_Y = 1.8405;         // top of the rolled lip = the lid's seat
export const WAIST = { y: 0.6, r: 0.3535 };

/** the designed curve. paint: base → seam groove; steel: groove → band → lip → inner wall */
export function bodyProfile() {
  const paint = [[0, 0], [0.16, 0], [0.322, 0]];
  arc(paint, 0.322, 0.05, 0.05, -Math.PI / 2, 0, 10);                 // base fillet, R 0.05 → (0.372, 0.05)
  run(paint, [[0.372, 0.05], [0.3734, 0.15], [0.3646, 0.34], [WAIST.r, WAIST.y], [0.3625, 0.86], [0.388, 1.13],
    [0.4205, 1.385], [0.4402, 1.535], [0.4462, 1.598], [0.4463, 1.626]], 96);   // foot → waist → shoulder
  run(paint, [[0.4463, 1.626], [0.4428, 1.6345], [0.4390, 1.642]], 4);        // into the seam groove
  const steel = [[0.4390, 1.642]];
  run(steel, [[0.4390, 1.642], [0.4413, 1.6505], [0.4439, 1.659], [0.4442, 1.70], [0.4442, 1.828]], 24);
  arc(steel, 0.4317, 1.828, 0.0125, 0, Math.PI, 14);                  // rolled lip → (0.4192, 1.828)
  run(steel, [[0.4192, 1.828], [0.419, 1.74], [0.4182, 1.6], [0.4145, 1.45], [0.405, 1.25]], 14);
  return { paint, steel };
}

/** radius of the outer (painted) surface at height y, for anchors on the body */
export function radiusAt(profile, y) {
  for (let i = 1; i < profile.length; i++) {
    const [r0, y0] = profile[i - 1], [r1, y1] = profile[i];
    if ((y0 - y) * (y1 - y) <= 0 && y1 !== y0) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return profile[profile.length - 1][0];
}

/** the lid, seat at y = 0: plug + flange (sits on the lip) + recessed ring + low dome */
export function lidProfile() {
  const p = [[0, -0.062], [0.2, -0.062], [0.386, -0.062]];
  arc(p, 0.386, -0.05, 0.012, -Math.PI / 2, 0, 5);                    // plug corner → (0.398, -0.05)
  p.push([0.398, -0.012], [0.3995, -0.004], [0.4035, -0.0004], [0.41, 0]);
  p.push([0.44, 0]);
  arc(p, 0.44, 0.012, 0.012, -Math.PI / 2, 0, 6);                     // flange bottom edge → (0.452, 0.012)
  p.push([0.452, 0.046]);
  arc(p, 0.432, 0.046, 0.02, 0, Math.PI / 2, 8);                      // flange top edge → (0.432, 0.066)
  run(p, [[0.432, 0.066], [0.414, 0.0685], [0.405, 0.0655], [0.397, 0.0625], [0.389, 0.066]], 8);   // recessed ring
  run(p, [[0.389, 0.066], [0.33, 0.0875], [0.2, 0.1085], [0.08, 0.1175], [0, 0.119]], 20);        // dome
  return p;
}

/** LatheGeometry with arc-length v (three spaces v by point index) */
export function lathe(points, segments = SEG) {
  const v2 = points.map(([r, y]) => new THREE.Vector2(Math.max(r, 0), y));
  const g = new THREE.LatheGeometry(v2, segments);
  const s = [0];
  for (let j = 1; j < v2.length; j++) s.push(s[j - 1] + v2[j].distanceTo(v2[j - 1]));
  const L = s[s.length - 1], np = v2.length, uv = g.attributes.uv;
  for (let i = 0; i <= segments; i++) for (let j = 0; j < np; j++) uv.setY(i * np + j, s[j] / L);
  g.userData.length = L;
  return g;
}

// ---------------------------------------------------------------- procedural textures (setup only)
function tileNoise(N, cells, R) {
  // value noise on a cells×cells lattice that wraps, smoothstep-interpolated at N×N
  const lat = new Float32Array(cells * cells);
  for (let i = 0; i < lat.length; i++) lat[i] = R();
  const out = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const fx = (x / N) * cells, fy = (y / N) * cells;
    const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const a = lat[(y0 % cells) * cells + (x0 % cells)], b = lat[(y0 % cells) * cells + ((x0 + 1) % cells)];
    const c = lat[((y0 + 1) % cells) * cells + (x0 % cells)], d = lat[((y0 + 1) % cells) * cells + ((x0 + 1) % cells)];
    out[y * N + x] = (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
  }
  return out;
}

/** powder-coat "orange peel": tileable fBm height → tangent-space normal map */
export function powderNormalMap(seed = 147) {
  const N = 256, R = rand(seed);
  const h = new Float32Array(N * N);
  for (const [cells, amp] of [[24, 1], [48, 0.55], [96, 0.3]]) {
    const n = tileNoise(N, cells, R);
    for (let i = 0; i < h.length; i++) h[i] += n[i] * amp;
  }
  const data = new Uint8Array(N * N * 4), k = 2.2;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = h[y * N + ((x + 1) % N)] - h[y * N + ((x + N - 1) % N)];
    const dy = h[((y + 1) % N) * N + x] - h[((y + N - 1) % N) * N + x];
    let nx = -dx * k, ny = -dy * k, nz = 1;
    const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const i = (y * N + x) * 4;
    data[i] = Math.round((nx * 0.5 + 0.5) * 255); data[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
    data[i + 2] = Math.round((nz * 0.5 + 0.5) * 255); data[i + 3] = 255;
  }
  const tx = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  tx.magFilter = THREE.LinearFilter; tx.minFilter = THREE.LinearMipmapLinearFilter;
  tx.generateMipmaps = true; tx.colorSpace = THREE.NoColorSpace;
  tx.needsUpdate = true;
  return tx;
}

/** brushed (lathe-turned) grain: rows of varying value along v — used as roughness (G) and bump (R) */
export function brushedMap(seed = 1470) {
  const W = 4, N = 512, R = rand(seed);
  const row = new Float32Array(N);
  // 1D noise at three scales + sparse deeper scratches
  for (const [cells, amp] of [[32, 0.5], [128, 0.32], [512, 0.22]]) {
    const lat = Array.from({ length: cells }, () => R());
    for (let i = 0; i < N; i++) {
      const f = (i / N) * cells, i0 = Math.floor(f), t = f - i0, s = t * t * (3 - 2 * t);
      row[i] += (lat[i0 % cells] * (1 - s) + lat[(i0 + 1) % cells] * s) * amp;
    }
  }
  for (let k = 0; k < 40; k++) { const i = Math.floor(R() * N); row[i] -= 0.35 * R(); }
  let lo = Infinity, hi = -Infinity;
  for (const v of row) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  const data = new Uint8Array(W * N * 4);
  for (let y = 0; y < N; y++) {
    const v = Math.round(255 * (0.62 + 0.38 * (row[y] - lo) / (hi - lo)));
    for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; data[i] = data[i + 1] = data[i + 2] = v; data[i + 3] = 255; }
  }
  const tx = new THREE.DataTexture(data, W, N, THREE.RGBAFormat);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  tx.magFilter = THREE.LinearFilter; tx.minFilter = THREE.LinearMipmapLinearFilter;
  tx.generateMipmaps = true; tx.colorSpace = THREE.NoColorSpace;
  tx.needsUpdate = true;
  return tx;
}

// ---------------------------------------------------------------- materials
export function makeMaterials(env) {
  const powder = powderNormalMap();
  const brush = brushedMap();
  const paintN = powder.clone(); paintN.repeat.set(14, 11); paintN.needsUpdate = true;
  const bandBrush = brush.clone(); bandBrush.repeat.set(1, 0.55); bandBrush.needsUpdate = true;
  const bodyBrush = brush.clone(); bodyBrush.repeat.set(1, 2.4); bodyBrush.needsUpdate = true;

  // powder-coated paint: satin grainy base (normal map) under a smooth, slightly soft clear coat
  const paint = (hex, o = {}) => new THREE.MeshPhysicalMaterial({
    color: hex, roughness: o.roughness ?? 0.5, metalness: 0,
    normalMap: paintN, normalScale: new THREE.Vector2(0.07, 0.07),
    clearcoat: o.clearcoat ?? 1, clearcoatRoughness: o.ccRough ?? 0.08,
    envMap: env, envMapIntensity: 0,
  });
  // brushed stainless: metal, anisotropic GGX stretched along the axis, line texture as roughness + micro bump
  const steel = (map) => new THREE.MeshPhysicalMaterial({
    color: '#b9bdc2', metalness: 1, roughness: 0.26, roughnessMap: map, bumpMap: map, bumpScale: 0.12,
    anisotropy: 0.75, anisotropyRotation: Math.PI / 2,
    envMap: env, envMapIntensity: 0,
  });
  const M = {
    hero: paint('#c8522b'),
    porcelain: paint('#e4ded3', { roughness: 0.55, clearcoat: 0.6, ccRough: 0.16 }),
    ink: paint('#1f2023', { roughness: 0.48, clearcoat: 0.9, ccRough: 0.12 }),
    band: steel(bandBrush),
    steelBody: steel(bodyBrush),
    // soft-touch lid plastic: dark, satin (one shared standard program for lid, mouthpiece and gasket)
    lid: new THREE.MeshStandardMaterial({ color: '#1a1b1d', roughness: 0.62, metalness: 0, envMap: env, envMapIntensity: 0 }),
    spout: new THREE.MeshStandardMaterial({ color: '#2a292b', roughness: 0.34, metalness: 0, envMap: env, envMapIntensity: 0 }),
    gasket: new THREE.MeshStandardMaterial({ color: '#8f8780', roughness: 0.78, metalness: 0, envMap: env, envMapIntensity: 0 }),
    hole: new THREE.MeshBasicMaterial({ color: '#050505' }),
  };
  // how much of the room each material reflects at full light (frame() scales these by the rig's level)
  M.envGain = new Map([[M.hero, 0.12], [M.porcelain, 0.12], [M.ink, 0.22], [M.band, 0.5], [M.steelBody, 0.4],
    [M.lid, 0.16], [M.spout, 0.25], [M.gasket, 0.12]]);
  // the studio's haze is laid on the floor only (fog is a function of the camera distance, see frame())
  for (const m of Object.values(M)) if (m && m.isMaterial) m.fog = false;
  return M;
}

// ---------------------------------------------------------------- one tumbler
const G = {};   // geometries are shared by every tumbler (same object, swapped materials)
function geos() {
  if (G.body) return G;
  const prof = bodyProfile();
  G.prof = prof;
  G.body = lathe(prof.paint);
  G.band = lathe(prof.steel);
  G.lid = lathe(lidProfile());
  G.gasket = new THREE.TorusGeometry(0.4075, 0.0105, 12, 144);
  G.spout = new RoundedBoxGeometry(0.25, 0.046, 0.105, 4, 0.02);
  G.slot = new RoundedBoxGeometry(0.15, 0.02, 0.036, 2, 0.008);
  G.vent = new THREE.CylinderGeometry(0.017, 0.017, 0.016, 24);
  return G;
}

/** a tumbler group (origin on the floor, axis = y). paintMat is the body; the lid group pivots on its seat. */
export function buildTumbler(M, paintMat) {
  const g = geos();
  const root = new THREE.Group();
  const body = new THREE.Mesh(g.body, paintMat);
  const band = new THREE.Mesh(g.band, M.band);
  const lid = new THREE.Group();
  lid.position.y = LIP_Y;
  const cap = new THREE.Mesh(g.lid, M.lid);
  const gasket = new THREE.Mesh(g.gasket, M.gasket);
  gasket.rotation.x = Math.PI / 2;
  gasket.position.y = -0.028;
  // the mouthpiece rides the dome at the front (+z), tilted with the dome's slope
  const sp = new THREE.Group();
  sp.position.set(0, 0.1, 0.262);
  sp.rotation.x = 0.13;
  const spout = new THREE.Mesh(g.spout, M.spout);
  spout.position.y = 0.014;
  const slot = new THREE.Mesh(g.slot, M.hole);
  slot.position.set(0, 0.031, 0.018);
  sp.add(spout, slot);
  const vent = new THREE.Mesh(g.vent, M.hole);
  vent.position.set(0, 0.113, -0.2);
  lid.add(cap, gasket, sp, vent);
  root.add(body, band, lid);
  root.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  return { root, body, band, lid };
}

export { geos };
