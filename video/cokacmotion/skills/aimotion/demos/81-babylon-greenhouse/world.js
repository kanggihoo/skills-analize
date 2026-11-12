/*
 * 81 · world.js — everything that is built once: materials, environment cube, sky dome, sun, garden backdrop,
 * the table, the Wardian-case greenhouse, pots, the plants' static parts and their per-frame geometry updaters.
 * Nothing here reads the clock; the update functions take the values main.js computes from t.
 * Units: 1 ≈ 25 cm. Babylon is left-handed, y up; the camera looks toward −z, the sun rises behind the case (−z).
 */
import { rand, clamp, smooth } from '../_lib/stage.js';

const B = window.BABYLON;
export const V = (x, y, z) => new B.Vector3(x, y, z);
/** sRGB hex → linear Color3 (PBR colours are linear) */
export const lin = (hex) => B.Color3.FromHexString(hex).toLinearSpace();
const ss = (a, b, x) => smooth((x - a) / (b - a));

// ---------------------------------------------------------------- greenhouse dimensions
export const G = {
  X: 1.0, Z: 0.65,          // half width / half depth of the glass box
  Y0: 0.43, Y1: 1.55,       // wall bottom (top of the base) / eave
  YR: 2.15,                 // ridge
  TR: 1.28,                 // transom rail
  BAR: 0.032,               // frame bar section
  VENT: [0.0, 0.5],         // the front roof bay that opens (x range)
};
const SLOPE_LEN = Math.hypot(G.YR - G.Y1, G.Z);

// ---------------------------------------------------------------- materials
export function makeMaterials(scene) {
  const pbr = (name, o) => { const m = new B.PBRMaterial(name, scene); Object.assign(m, o); return m; };
  const M = {};
  // cream-painted cast iron: a little metallic under a lacquer coat
  M.frame = pbr('frame', { albedoColor: lin('#eee6d3'), metallic: 0.35, roughness: 0.34 });
  M.frame.clearCoat.isEnabled = true;
  M.frame.clearCoat.intensity = 0.55;
  M.frame.clearCoat.roughness = 0.12;
  M.base = pbr('base', { albedoColor: lin('#7d9a7f'), metallic: 0.0, roughness: 0.5 });
  M.panel = pbr('panel', { albedoColor: lin('#67876c'), metallic: 0.0, roughness: 0.46 });
  M.brass = pbr('brass', { albedoColor: lin('#dcb46a'), metallic: 1.0, roughness: 0.26 });
  // glass: alpha-blended PBR whose reflections stay at full strength (radiance/specular over alpha)
  M.glass = pbr('glass', { albedoColor: lin('#e9f5f0'), metallic: 0.0, roughness: 0.06, alpha: 0.16, indexOfRefraction: 1.5 });
  M.glass.transparencyMode = B.PBRMaterial.PBRMATERIAL_ALPHABLEND;
  M.glass.useRadianceOverAlpha = true;
  M.glass.useSpecularOverAlpha = true;
  M.glass.environmentIntensity = 1.2;
  M.terracotta = pbr('terracotta', { albedoColor: lin('#c97350'), metallic: 0.0, roughness: 0.86 });
  M.terracottaDark = pbr('terracottaDark', { albedoColor: lin('#a95b3d'), metallic: 0.0, roughness: 0.9 });
  M.soil = pbr('soil', { albedoColor: lin('#3a2a1e'), metallic: 0.0, roughness: 1.0 });
  M.moss = pbr('moss', { albedoColor: lin('#5d7f2c'), metallic: 0.0, roughness: 1.0 });
  M.moss.sheen.isEnabled = true;
  M.moss.sheen.color = lin('#d8f0a0');
  M.moss.sheen.intensity = 0.55;
  // leaves: colour comes from vertex / thin-instance colours; light shines through them when backlit
  M.leaf = pbr('leaf', { albedoColor: B.Color3.White(), metallic: 0.0, roughness: 0.42 });
  M.leaf.backFaceCulling = false;
  M.leaf.twoSidedLighting = true;
  M.leaf.subSurface.isTranslucencyEnabled = true;
  M.leaf.subSurface.translucencyIntensity = 0.85;
  M.leaf.subSurface.useAlbedoToTintTranslucency = true;
  M.leaf.subSurface.maximumThickness = 0.3;
  M.stem = pbr('stem', { albedoColor: lin('#6f8a3c'), metallic: 0.0, roughness: 0.6 });
  M.hedge = pbr('hedge', { albedoColor: lin('#2f4a26'), metallic: 0.0, roughness: 0.95 });
  M.tree = pbr('tree', { albedoColor: lin('#3d5a3a'), metallic: 0.0, roughness: 1.0 });
  // dew bead: dark water body + mirror-sharp highlight
  M.bead = pbr('bead', { albedoColor: lin('#22302f'), metallic: 0.0, roughness: 0.03 });
  M.bead.environmentIntensity = 1.6;
  // the sparkle cores picked up by the GlowLayer (emissive × per-particle colour)
  M.glint = new B.StandardMaterial('glint', scene);
  M.glint.disableLighting = true;
  M.glint.diffuseColor = B.Color3.Black();
  M.glint.specularColor = B.Color3.Black();
  M.glint.emissiveColor = new B.Color3(1, 1, 1);
  M.body = pbr('body', { albedoColor: lin('#2c2724'), metallic: 0.0, roughness: 0.75 });
  M.body.sheen.isEnabled = true;
  M.body.sheen.color = lin('#9a9088');
  return M;
}

// ---------------------------------------------------------------- helpers
/** a box of section w×d spanning p0 → p1 (baked into its vertices) */
function barMesh(scene, p0, p1, w, d = w) {
  const dir = p1.subtract(p0);
  const len = dir.length();
  const Y = dir.scale(1 / len);
  let X = Math.abs(Y.y) > 0.98 ? V(1, 0, 0) : B.Vector3.Cross(V(0, 1, 0), Y).normalize();
  if (Math.abs(Y.y) <= 0.98 && Math.abs(Y.x) > 0.98) X = V(0, 0, 1);
  X = X.subtract(Y.scale(B.Vector3.Dot(X, Y))).normalize();
  const Z = B.Vector3.Cross(X, Y).normalize();
  const mid = p0.add(p1).scale(0.5);
  const box = B.MeshBuilder.CreateBox('bar', { width: w, height: len, depth: d }, scene);
  box.bakeTransformIntoVertices(B.Matrix.FromValues(X.x, X.y, X.z, 0, Y.x, Y.y, Y.z, 0, Z.x, Z.y, Z.z, 0, mid.x, mid.y, mid.z, 1));
  return box;
}
function boxAt(scene, x0, x1, y0, y1, z0, z1) {
  const b = B.MeshBuilder.CreateBox('box', { width: x1 - x0, height: y1 - y0, depth: z1 - z0 }, scene);
  b.bakeTransformIntoVertices(B.Matrix.Translation((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2));
  return b;
}
function merge(list, name, material) {
  const m = B.Mesh.MergeMeshes(list, true, true);
  m.name = name;
  m.material = material;
  return m;
}
/** a flat polygon (fan from the first corner) as a mesh with both faces: the back copy has reversed winding and normals */
function panelMesh(scene, name, pts) {
  const n = pts.length;
  const pos = [], ind = [], uvs = [];
  for (let side = 0; side < 2; side++) for (const p of pts) pos.push(p.x, p.y, p.z);
  for (let i = 1; i < n - 1; i++) { ind.push(0, i, i + 1); ind.push(n, n + i + 1, n + i); }
  for (let side = 0; side < 2; side++) for (let i = 0; i < n; i++) uvs.push(i === 1 || i === 2 ? 1 : 0, i >= 2 ? 1 : 0);
  const nrm = [];
  B.VertexData.ComputeNormals(pos, ind, nrm);
  const mesh = new B.Mesh(name, scene);
  const vd = new B.VertexData();
  vd.positions = pos; vd.indices = ind; vd.normals = nrm; vd.uvs = uvs;
  vd.applyToMesh(mesh);
  return mesh;
}
const quadMesh = (scene, name, a, b, c, d) => panelMesh(scene, name, [a, b, c, d]);
const triMesh = (scene, name, a, b, c) => panelMesh(scene, name, [a, b, c]);
/** terracotta pot by lathe: rim lip, tapered body, inner wall; soil disc at `soil` below the rim */
function makePot(scene, M, name, x, z, h, rTop, rBot) {
  const lip = 0.055 * h / 0.3;
  const shape = [
    V(0, 0.0, 0), V(rBot, 0.0, 0), V(rBot + 0.004, 0.012, 0),
    V(rTop - 0.012, h - lip - 0.004, 0), V(rTop + 0.012, h - lip, 0), V(rTop + 0.016, h - lip * 0.5, 0),
    V(rTop + 0.012, h, 0), V(rTop - 0.018, h, 0), V(rTop - 0.03, h - lip * 1.2, 0), V(rTop - 0.04, h - lip * 2.2, 0),
  ];
  const pot = B.MeshBuilder.CreateLathe(name, { shape, tessellation: 40, cap: B.Mesh.NO_CAP, sideOrientation: B.Mesh.DOUBLESIDE }, scene);
  pot.position.set(x, 0, z);
  pot.material = M.terracotta;
  const soilY = h - lip * 1.9;
  const soil = B.MeshBuilder.CreateDisc(name + 'Soil', { radius: rTop - 0.035, tessellation: 32 }, scene);
  soil.rotation.x = Math.PI / 2;
  soil.position.set(x, soilY, z);
  soil.material = M.soil;
  return { pot, soil, soilY };
}

// ---------------------------------------------------------------- environment: IBL cube, sky dome, sun, halo
/** a small procedural sky cube for image-based lighting, with its spherical polynomial computed here (synchronously) */
export function makeEnvironment(scene) {
  const N = 64;
  const faceDir = [
    (u, v) => [1, -v, -u], (u, v) => [-1, -v, u], (u, v) => [u, 1, v],
    (u, v) => [u, -1, -v], (u, v) => [u, -v, 1], (u, v) => [-u, -v, -1],
  ];
  const sunD = B.Vector3.Normalize(V(0.12, 0.16, -1));
  const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
  const col = (dx, dy, dz) => {
    let r, g, b;
    if (dy >= 0) {
      const k = Math.pow(dy, 0.45);
      r = 0.95 * (1 - k) + 0.22 * k; g = 0.68 * (1 - k) + 0.38 * k; b = 0.50 * (1 - k) + 0.70 * k;
      const s = Math.pow(Math.max(0, dx * sunD.x + dy * sunD.y + dz * sunD.z), 8);
      r += 0.35 * s; g += 0.22 * s; b += 0.1 * s;
    } else {
      const k = Math.pow(-dy, 0.5);
      r = 0.48 * (1 - k) + 0.20 * k; g = 0.44 * (1 - k) + 0.17 * k; b = 0.34 * (1 - k) + 0.11 * k;
    }
    return [Math.min(1, r), Math.min(1, g), Math.min(1, b)];
  };
  const bytes = [], floats = [];
  for (let f = 0; f < 6; f++) {
    const u8 = new Uint8Array(N * N * 4), f32 = new Float32Array(N * N * 4);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const u = (2 * (i + 0.5)) / N - 1, v = (2 * (j + 0.5)) / N - 1;
      const [x, y, z] = faceDir[f](u, v);
      const l = Math.hypot(x, y, z);
      const c = col(x / l, y / l, z / l);
      const o = (j * N + i) * 4;
      for (let k = 0; k < 3; k++) { f32[o + k] = c[k]; u8[o + k] = Math.round(toSrgb(c[k]) * 255); }
      f32[o + 3] = 1; u8[o + 3] = 255;
    }
    bytes.push(u8); floats.push(f32);
  }
  const C = B.Constants;
  const tex = new B.RawCubeTexture(scene, bytes, N, C.TEXTUREFORMAT_RGBA, C.TEXTURETYPE_UNSIGNED_BYTE, true, false, B.Texture.TRILINEAR_SAMPLINGMODE);
  tex.gammaSpace = true;
  if (B.CubeMapToSphericalPolynomialTools) {
    tex.sphericalPolynomial = B.CubeMapToSphericalPolynomialTools.ConvertCubeMapToSphericalPolynomial({
      right: floats[0], left: floats[1], up: floats[2], down: floats[3], front: floats[4], back: floats[5],
      size: N, format: C.TEXTUREFORMAT_RGBA, type: C.TEXTURETYPE_FLOAT, gammaSpace: false,
    });
  }
  scene.environmentTexture = tex;
  return tex;
}

/** sky dome with per-vertex colours recomputed every frame (gradient + glow around the sun) */
export function makeSky(scene) {
  const sky = B.MeshBuilder.CreateSphere('sky', { segments: 56, diameter: 1000, sideOrientation: B.Mesh.BACKSIDE, updatable: false }, scene);
  sky.infiniteDistance = true;
  sky.isPickable = false;
  const pos = sky.getVerticesData(B.VertexBuffer.PositionKind);
  const n = pos.length / 3;
  const dirs = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const l = Math.hypot(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]) || 1;
    dirs[i * 3] = pos[i * 3] / l; dirs[i * 3 + 1] = pos[i * 3 + 1] / l; dirs[i * 3 + 2] = pos[i * 3 + 2] / l;
  }
  const colors = new Float32Array(n * 4).fill(1);
  sky.setVerticesData(B.VertexBuffer.ColorKind, colors, true, 4);
  const mat = new B.StandardMaterial('skyMat', scene);
  mat.disableLighting = true;
  mat.diffuseColor = B.Color3.Black();
  mat.specularColor = B.Color3.Black();
  mat.emissiveColor = B.Color3.White();
  mat.fogEnabled = false;
  mat.backFaceCulling = true;
  sky.material = mat;
  /** P = { zen, hor, low, glow:[r,g,b], s: sun dir, haze } — display-space colours */
  const update = (P) => {
    const { zen, hor, low, glow, s } = P;
    for (let i = 0; i < n; i++) {
      const x = dirs[i * 3], y = dirs[i * 3 + 1], z = dirs[i * 3 + 2];
      let r, g, b;
      if (y >= 0) {
        const k = ss(0, 1, Math.pow(y, 0.62) * 1.15);
        r = hor[0] + (zen[0] - hor[0]) * k; g = hor[1] + (zen[1] - hor[1]) * k; b = hor[2] + (zen[2] - hor[2]) * k;
      } else {
        const k = ss(0, 0.25, -y);
        r = hor[0] + (low[0] - hor[0]) * k; g = hor[1] + (low[1] - hor[1]) * k; b = hor[2] + (low[2] - hor[2]) * k;
      }
      const c = clamp(x * s.x + y * s.y + z * s.z, -1, 1);
      const ang = Math.acos(c);
      const w = 0.42 * Math.exp(-ang / 0.16) + 0.30 * Math.exp(-ang / 0.55) + 0.08 * Math.exp(-ang / 1.4);
      // the glow spreads sideways along the horizon more than upward (low sun through haze)
      const hz = Math.exp(-Math.abs(y - s.y) * 7) * 0.18 * Math.exp(-ang / 1.1);
      r += glow[0] * (w + hz); g += glow[1] * (w + hz); b += glow[2] * (w + hz);
      colors[i * 4] = Math.min(1, r); colors[i * 4 + 1] = Math.min(1, g); colors[i * 4 + 2] = Math.min(1, b);
    }
    sky.updateVerticesData(B.VertexBuffer.ColorKind, colors);
  };
  return { sky, update };
}

/** radial-gradient sprite used for the sun's halo */
function haloTexture(scene) {
  const t = new B.DynamicTexture('haloTex', { width: 256, height: 256 }, scene, true);
  const ctx = t.getContext();
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,246,226,1)');
  g.addColorStop(0.08, 'rgba(255,236,200,0.85)');
  g.addColorStop(0.25, 'rgba(255,214,160,0.32)');
  g.addColorStop(0.55, 'rgba(255,196,140,0.08)');
  g.addColorStop(1, 'rgba(255,190,130,0)');
  ctx.clearRect(0, 0, 256, 256);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  t.update();
  t.hasAlpha = true;
  return t;
}
export function makeSun(scene) {
  // the disc is the light source for the volumetric light-scattering pass (crisp edge → crisp shafts)
  const disc = B.MeshBuilder.CreateDisc('sunDisc', { radius: 1, tessellation: 48 }, scene);
  disc.billboardMode = B.Mesh.BILLBOARDMODE_ALL;
  const dm = new B.StandardMaterial('sunMat', scene);
  dm.disableLighting = true;
  dm.diffuseColor = B.Color3.Black();
  dm.specularColor = B.Color3.Black();
  dm.emissiveColor = new B.Color3(1, 0.9, 0.7);
  dm.fogEnabled = false;
  disc.material = dm;
  disc.isPickable = false;
  // the soft halo around it (additive sprite)
  const halo = B.MeshBuilder.CreatePlane('sunHalo', { size: 1 }, scene);
  halo.billboardMode = B.Mesh.BILLBOARDMODE_ALL;
  const hm = new B.StandardMaterial('haloMat', scene);
  const ht = haloTexture(scene);
  hm.disableLighting = true;
  hm.diffuseColor = B.Color3.Black();
  hm.specularColor = B.Color3.Black();
  hm.emissiveColor = B.Color3.Black();
  hm.emissiveTexture = ht;
  hm.opacityTexture = ht;
  hm.alphaMode = B.Constants.ALPHA_ADD;
  hm.fogEnabled = false;
  hm.disableDepthWrite = true;
  halo.material = hm;
  halo.isPickable = false;
  return { disc, halo, discMat: dm, haloTex: ht };
}

/** hedge behind the table and a tree line far away (soft in the morning fog) */
export function makeBackdrop(scene, M) {
  const R = rand(811);
  const hedge = [];
  for (let i = 0; i < 34; i++) {
    const x = -20 + i * 1.22 + (R() - 0.5) * 0.8;
    const r = 1.3 + R() * 1.1;
    const s = B.MeshBuilder.CreateIcoSphere('h', { radius: r, subdivisions: 2 }, scene);
    s.bakeTransformIntoVertices(B.Matrix.Scaling(1.15, 0.9 + R() * 0.3, 1).multiply(B.Matrix.Translation(x, -0.6 + R() * 0.9, -12.6 + (R() - 0.5) * 1.4)));
    hedge.push(s);
  }
  hedge.push(boxAt(scene, -22, 22, -4, 0.4, -13.6, -11.8));
  const hedgeMesh = merge(hedge, 'hedge', M.hedge);
  const trees = [];
  // clusters of crowns; their tops sit around 5–9° above the camera's horizon, with gaps the sun can shine through
  const xs = [-70, -52, -38, -24, -13, -3, 8, 19, 31, 45, 62, 78];
  xs.forEach((x0, k) => {
    const z0 = -98 - R() * 26;
    const top = 9 + R() * 7 + (k % 3 === 1 ? 3 : 0);
    const n = 5 + Math.floor(R() * 4);
    for (let i = 0; i < n; i++) {
      const r = 4 + R() * 4.5;
      const s = B.MeshBuilder.CreateIcoSphere('t', { radius: r, subdivisions: 2 }, scene);
      const y = top - r - R() * 5;
      s.bakeTransformIntoVertices(B.Matrix.Scaling(1, 1.1 + R() * 0.3, 1).multiply(B.Matrix.Translation(x0 + (R() - 0.5) * 12, y, z0 + (R() - 0.5) * 10)));
      trees.push(s);
    }
    trees.push(barMesh(scene, V(x0, -6, z0), V(x0, top - 6, z0), 1.2));
  });
  trees.push(boxAt(scene, -160, 160, -8, 2.5, -150, -95));
  const treeMesh = merge(trees, 'trees', M.tree);
  return { hedgeMesh, treeMesh };
}

// ---------------------------------------------------------------- table
function woodTexture(scene) {
  const S = 1024;
  const t = new B.DynamicTexture('wood', { width: S, height: S }, scene, true);
  const ctx = t.getContext();
  const R = rand(4242);
  const PW = S / 4;
  for (let p = 0; p < 4; p++) {
    const x0 = p * PW;
    const base = [182 + (R() - 0.5) * 22, 150 + (R() - 0.5) * 18, 114 + (R() - 0.5) * 16];
    ctx.fillStyle = `rgb(${base[0] | 0},${base[1] | 0},${base[2] | 0})`;
    ctx.fillRect(x0, 0, PW, S);
    // weathered silvering toward the plank edges
    const eg = ctx.createLinearGradient(x0, 0, x0 + PW, 0);
    eg.addColorStop(0, 'rgba(120,112,104,0.22)');
    eg.addColorStop(0.18, 'rgba(120,112,104,0)');
    eg.addColorStop(0.82, 'rgba(120,112,104,0)');
    eg.addColorStop(1, 'rgba(120,112,104,0.25)');
    ctx.fillStyle = eg;
    ctx.fillRect(x0, 0, PW, S);
    // grain: long wavy lines along the plank (canvas y = table z)
    for (let i = 0; i < 70; i++) {
      const gx = x0 + 6 + R() * (PW - 12);
      const amp = 2 + R() * 9, f = 0.004 + R() * 0.01, ph = R() * 6.28;
      ctx.strokeStyle = `rgba(${84 + R() * 30 | 0},${58 + R() * 20 | 0},${38 + R() * 14 | 0},${0.06 + R() * 0.16})`;
      ctx.lineWidth = 0.8 + R() * 2.2;
      ctx.beginPath();
      for (let y = 0; y <= S; y += 16) {
        const x = gx + Math.sin(y * f + ph) * amp + Math.sin(y * f * 3.1 + ph * 2) * amp * 0.25;
        if (y === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // a knot or two
    for (let k = 0; k < 1 + (R() < 0.5 ? 1 : 0); k++) {
      const kx = x0 + PW * (0.3 + R() * 0.4), ky = R() * S;
      for (let ring = 7; ring >= 1; ring--) {
        ctx.strokeStyle = `rgba(96,62,40,${0.12 + 0.05 * (7 - ring)})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(kx, ky, ring * 3.2, ring * 7.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(70,44,28,0.75)';
      ctx.beginPath(); ctx.ellipse(kx, ky, 4, 8, 0, 0, Math.PI * 2); ctx.fill();
    }
    // the gap between planks and a sunlit bevel next to it
    ctx.fillStyle = 'rgba(46,32,22,0.92)';
    ctx.fillRect(x0, 0, 5, S);
    ctx.fillStyle = 'rgba(236,214,180,0.28)';
    ctx.fillRect(x0 + 5, 0, 3, S);
  }
  // fine speckle (weathering)
  for (let i = 0; i < 5000; i++) {
    const a = R();
    ctx.fillStyle = a < 0.5 ? `rgba(70,50,36,${0.05 + R() * 0.1})` : `rgba(240,226,200,${0.04 + R() * 0.08})`;
    ctx.fillRect(R() * S, R() * S, 1 + R() * 2, 1 + R() * 3);
  }
  t.update();
  t.wrapU = t.wrapV = B.Texture.WRAP_ADDRESSMODE;
  t.anisotropicFilteringLevel = 8;
  return t;
}
export function makeTable(scene) {
  const top = B.MeshBuilder.CreateGround('table', { width: 12, height: 11.5, subdivisions: 1 }, scene);
  top.position.set(0, 0, 1.25);
  const tex = woodTexture(scene);
  tex.uScale = 12 / 2.4;
  tex.vScale = 11.5 / 2.4;
  const m = new B.PBRMaterial('woodMat', scene);
  m.albedoTexture = tex;
  m.metallic = 0;
  m.roughness = 0.74;
  top.material = m;
  const edge = boxAt(scene, -6, 6, -0.16, -0.002, -4.5, 7);
  edge.name = 'tableEdge';
  const em = new B.PBRMaterial('woodEdge', scene);
  em.albedoColor = lin('#6e5440');
  em.metallic = 0; em.roughness = 0.8;
  edge.material = em;
  return { top, edge };
}

// ---------------------------------------------------------------- the greenhouse (Wardian case)
export function makeGreenhouse(scene, M) {
  const { X, Z, Y0, Y1, YR, TR, BAR } = G;
  const b = BAR;
  const frames = [];
  const add = (p0, p1, w = b, d = w) => frames.push(barMesh(scene, p0, p1, w, d));
  // rings: sill, transom, eave
  for (const y of [Y0 + b / 2, TR, Y1]) {
    add(V(-X, y, Z), V(X, y, Z)); add(V(-X, y, -Z), V(X, y, -Z));
    add(V(-X, y, -Z), V(-X, y, Z)); add(V(X, y, -Z), V(X, y, Z));
  }
  // posts and mullions
  for (const x of [-X, -0.5, 0, 0.5, X]) { add(V(x, Y0, Z), V(x, Y1, Z)); add(V(x, Y0, -Z), V(x, Y1, -Z)); }
  for (const x of [-X, X]) add(V(x, Y0, 0), V(x, Y1, 0));
  // gable ends: rafters + king post + a small collar
  for (const x of [-X, X]) {
    add(V(x, Y1, Z), V(x, YR, 0)); add(V(x, Y1, -Z), V(x, YR, 0));
    add(V(x, Y1, 0), V(x, YR, 0));
  }
  // roof rafters (front and back slopes)
  for (const x of [-0.5, 0, 0.5]) { add(V(x, Y1, Z), V(x, YR, 0)); add(V(x, Y1, -Z), V(x, YR, 0)); }
  // purlins halfway up the slopes; the front one is cut at the vent bay
  const ym = (Y1 + YR) / 2;
  add(V(-X, ym, -Z / 2), V(X, ym, -Z / 2));
  add(V(-X, ym, Z / 2), V(G.VENT[0], ym, Z / 2));
  add(V(G.VENT[1], ym, Z / 2), V(X, ym, Z / 2));
  // ridge beam and cresting
  add(V(-X - 0.05, YR, 0), V(X + 0.05, YR, 0), 0.046);
  add(V(-X + 0.02, YR + 0.075, 0), V(X - 0.02, YR + 0.075, 0), 0.012);
  for (let i = 0; i <= 18; i++) {
    const x = -0.9 + i * 0.1;
    add(V(x, YR, 0), V(x, YR + 0.075, 0), 0.01);
    const s = B.MeshBuilder.CreateSphere('crest', { diameter: i % 2 ? 0.026 : 0.04, segments: 8 }, scene);
    s.bakeTransformIntoVertices(B.Matrix.Translation(x, YR + 0.082 + (i % 2 ? 0 : 0.008), 0));
    frames.push(s);
  }
  // Victorian spandrels: quarter-circle brackets in the top corners of every front and back bay
  for (const zz of [Z, -Z]) for (let i = 0; i < 4; i++) {
    const xa = -X + i * 0.5, xb = xa + 0.5;
    for (const [cx, sgn] of [[xa, 1], [xb, -1]]) {
      frames.push(B.MeshBuilder.CreateTube('spandrel', { path: arcPath(cx, sgn, Y1, zz), radius: 0.007, tessellation: 6, cap: B.Mesh.CAP_ALL }, scene));
    }
  }
  // finials at both ends of the ridge
  const finShape = [V(0, 0, 0), V(0.03, 0, 0), V(0.03, 0.03, 0), V(0.018, 0.05, 0), V(0.038, 0.09, 0), V(0.04, 0.12, 0),
    V(0.028, 0.15, 0), V(0.012, 0.17, 0), V(0.02, 0.19, 0), V(0.008, 0.24, 0), V(0.0, 0.3, 0)];
  for (const x of [-X - 0.05, X + 0.05]) {
    const f = B.MeshBuilder.CreateLathe('finial', { shape: finShape, tessellation: 18, sideOrientation: B.Mesh.DOUBLESIDE }, scene);
    f.bakeTransformIntoVertices(B.Matrix.Translation(x, YR + 0.02, 0));
    frames.push(f);
  }
  const frameMesh = merge(frames, 'frames', M.frame);

  // ---- base: painted box, mouldings, brass strip, raised panels, bun feet
  const base = merge([boxAt(scene, -1.08, 1.08, 0.08, 0.38, -0.74, 0.74)], 'base', M.base);
  const mould = merge([
    boxAt(scene, -1.12, 1.12, 0.08, 0.13, -0.78, 0.78),
    boxAt(scene, -1.12, 1.12, 0.38, Y0, -0.78, 0.78),
  ], 'moulding', M.frame);
  const brass = merge([boxAt(scene, -1.095, 1.095, 0.35, 0.365, -0.755, 0.755)], 'brassStrip', M.brass);
  const panels = [];
  for (const zz of [0.74, -0.74]) for (const xc of [-0.52, 0.52]) {
    const s = zz > 0 ? 1 : -1;
    panels.push(boxAt(scene, xc - 0.42, xc + 0.42, 0.165, 0.315, zz - (s > 0 ? 0 : 0.012), zz + (s > 0 ? 0.012 : 0)));
  }
  for (const xx of [1.08, -1.08]) {
    const s = xx > 0 ? 1 : -1;
    panels.push(boxAt(scene, xx - (s > 0 ? 0 : 0.012), xx + (s > 0 ? 0.012 : 0), 0.165, 0.315, -0.56, 0.56));
  }
  const panelMesh = merge(panels, 'panels', M.panel);
  const feet = [];
  for (const xx of [-0.98, 0.98]) for (const zz of [-0.64, 0.64]) {
    const s = B.MeshBuilder.CreateSphere('foot', { diameter: 0.17, segments: 12 }, scene);
    s.bakeTransformIntoVertices(B.Matrix.Scaling(1, 0.62, 1).multiply(B.Matrix.Translation(xx, 0.05, zz)));
    feet.push(s);
  }
  const feetMesh = merge(feet, 'feet', M.brass);

  // ---- glass: one double-sided pane per wall / roof section (sorted per mesh by Babylon)
  const glass = [];
  const e = 0.004;
  glass.push(quadMesh(scene, 'gFront', V(-X, Y0, Z + e), V(X, Y0, Z + e), V(X, Y1, Z + e), V(-X, Y1, Z + e)));
  glass.push(quadMesh(scene, 'gBack', V(X, Y0, -Z - e), V(-X, Y0, -Z - e), V(-X, Y1, -Z - e), V(X, Y1, -Z - e)));
  glass.push(quadMesh(scene, 'gLeft', V(-X - e, Y0, -Z), V(-X - e, Y0, Z), V(-X - e, Y1, Z), V(-X - e, Y1, -Z)));
  glass.push(quadMesh(scene, 'gRight', V(X + e, Y0, Z), V(X + e, Y0, -Z), V(X + e, Y1, -Z), V(X + e, Y1, Z)));
  glass.push(triMesh(scene, 'gGableL', V(-X - e, Y1, -Z), V(-X - e, Y1, Z), V(-X - e, YR, 0)));
  glass.push(triMesh(scene, 'gGableR', V(X + e, Y1, Z), V(X + e, Y1, -Z), V(X + e, YR, 0)));
  glass.push(quadMesh(scene, 'gRoofBack', V(X, Y1, -Z), V(-X, Y1, -Z), V(-X, YR, 0), V(X, YR, 0)));
  glass.push(quadMesh(scene, 'gRoofFrontL', V(-X, Y1, Z), V(G.VENT[0], Y1, Z), V(G.VENT[0], YR, 0), V(-X, YR, 0)));
  glass.push(quadMesh(scene, 'gRoofFrontR', V(G.VENT[1], Y1, Z), V(X, Y1, Z), V(X, YR, 0), V(G.VENT[1], YR, 0)));
  for (const g of glass) { g.material = M.glass; g.isPickable = false; }

  // ---- the vent: its own frame + pane, hinged at the ridge (rotation.x = −angle lifts the lower edge)
  const pivot = new B.TransformNode('ventPivot', scene);
  pivot.position.set((G.VENT[0] + G.VENT[1]) / 2, YR, 0);
  const hw = (G.VENT[1] - G.VENT[0]) / 2 - 0.004;
  const dn = V(0, -(YR - Y1), Z);                          // ridge → eave, in pivot space
  const nrm = V(0, Z, YR - Y1).normalize();               // outward slope normal
  const off = nrm.scale(0.022);
  const ventBars = [
    barMesh(scene, V(-hw, 0, 0).add(off), V(hw, 0, 0).add(off), 0.03),
    barMesh(scene, V(-hw, 0, 0).add(dn).add(off), V(hw, 0, 0).add(dn).add(off), 0.034),
    barMesh(scene, V(-hw, 0, 0).add(off), V(-hw, 0, 0).add(dn).add(off), 0.03),
    barMesh(scene, V(hw, 0, 0).add(off), V(hw, 0, 0).add(dn).add(off), 0.03),
  ];
  // a little brass stay arm along the lower bar
  ventBars.push(barMesh(scene, V(0, 0, 0).add(dn.scale(0.98)).add(off), V(0, 0, 0).add(dn.scale(0.98)).add(nrm.scale(-0.09)), 0.008));
  const ventFrame = merge(ventBars, 'ventFrame', M.frame);
  ventFrame.parent = pivot;
  const po = nrm.scale(0.014);
  const ventGlass = quadMesh(scene, 'gVent', V(-hw, 0, 0).add(dn).add(po), V(hw, 0, 0).add(dn).add(po), V(hw, 0, 0).add(po), V(-hw, 0, 0).add(po));
  ventGlass.material = M.glass;
  ventGlass.parent = pivot;
  glass.push(ventGlass);

  // ---- soil bed inside
  const bed = merge([boxAt(scene, -0.97, 0.97, Y0, Y0 + 0.04, -0.62, 0.62)], 'bed', M.soil);
  return { frameMesh, base, mould, brass, panelMesh, feetMesh, glass, pivot, ventFrame, ventGlass, bed,
    casters: [frameMesh, base, mould, brass, panelMesh, feetMesh, ventFrame],
    receivers: [frameMesh, base, mould, panelMesh, bed, ventFrame] };
}
/** quarter-circle bracket in the corner of a bay: from the mullion (cx, y1 − r) to the eave rail (cx ± r, y1), bowed toward the corner */
function arcPath(cx, sgn, y1, zz) {
  const r = 0.11, pts = [];
  for (let k = 0; k <= 10; k++) {
    const a = (k / 10) * Math.PI / 2;
    pts.push(V(cx + sgn * r * (1 - Math.cos(a)), y1 - r + r * Math.sin(a), zz));
  }
  return pts;
}
export const VENT_GEOM = { dn: [0, -(G.YR - G.Y1), G.Z], nrm: [0, G.Z / SLOPE_LEN, (G.YR - G.Y1) / SLOPE_LEN] };

// ---------------------------------------------------------------- pots and static plant parts
export function makePots(scene, M) {
  const fern = makePot(scene, M, 'potFern', -0.45, 0.06, 0.3, 0.19, 0.13);
  fern.pot.position.y = G.Y0 + 0.04;
  fern.soil.position.y += G.Y0 + 0.04;
  fern.soilY += G.Y0 + 0.04;
  const spider = makePot(scene, M, 'potSpider', 0.52, -0.2, 0.24, 0.155, 0.11);
  spider.pot.position.y = G.Y0 + 0.04;
  spider.soil.position.y += G.Y0 + 0.04;
  spider.soilY += G.Y0 + 0.04;
  spider.pot.material = M.terracottaDark;
  const pilea = makePot(scene, M, 'potPilea', 1.0, 1.7, 0.42, 0.24, 0.17);
  const saucer = B.MeshBuilder.CreateCylinder('saucer', { height: 0.035, diameterTop: 0.62, diameterBottom: 0.5, tessellation: 40 }, scene);
  saucer.position.set(1.0, 0.0175, 1.7);
  saucer.material = M.terracotta;
  pilea.pot.position.y = 0.035;
  pilea.soil.position.y += 0.035;
  pilea.soilY += 0.035;
  const seed = makePot(scene, M, 'potSeed', -0.5, 2.15, 0.26, 0.15, 0.105);
  const all = [fern, spider, pilea, seed];
  return {
    fern, spider, pilea, seed, saucer,
    casters: [...all.map((p) => p.pot), saucer],
    receivers: [...all.flatMap((p) => [p.pot, p.soil]), saucer],
  };
}

/** moss mounds on the bed (static) */
export function makeMoss(scene, M) {
  const R = rand(77);
  const parts = [];
  const spots = [[-0.8, 0.42], [-0.15, 0.45], [0.18, 0.3], [0.8, 0.35], [0.82, -0.35], [-0.78, -0.4], [0.05, -0.38], [0.3, 0.48]];
  for (const [x, z] of spots) {
    const r = 0.09 + R() * 0.08;
    const s = B.MeshBuilder.CreateIcoSphere('moss', { radius: r, subdivisions: 2 }, scene);
    s.bakeTransformIntoVertices(B.Matrix.Scaling(1.3, 0.42, 1).multiply(B.Matrix.Translation(x, G.Y0 + 0.04, z)));
    parts.push(s);
  }
  return merge(parts, 'moss', M.moss);
}

/** spider plant: arching variegated strap leaves (static), vertex-coloured green edges / cream centre */
export function makeSpiderPlant(scene, M, cx, cy, cz) {
  const R = rand(5150);
  const pos = [], col = [], idx = [];
  const NS = 14;
  for (let j = 0; j < 15; j++) {
    const psi = j * 2.39996 + R() * 0.3;
    const L = 0.3 + R() * 0.2;
    const th0 = (62 + R() * 22) * Math.PI / 180, th1 = (-48 + R() * 40) * Math.PI / 180;
    const o = V(Math.cos(psi), 0, Math.sin(psi)), la = V(-Math.sin(psi), 0, Math.cos(psi));
    const twist = (R() - 0.5) * 0.8;
    let th = th0, px = 0, py = 0;
    const ds = L / NS, k = (th1 - th0) / L;
    const v0 = pos.length / 3;
    for (let i = 0; i <= NS; i++) {
      const x = i / NS;
      const w = 0.026 * (1 - x * x) * (0.5 + 0.5 * Math.min(1, 6 * x)) + 0.002;
      const tw = twist * x;
      const side = la.scale(Math.cos(tw)).add(V(0, Math.sin(tw), 0));
      const c = V(cx + o.x * px, cy + py, cz + o.z * px);
      const up = V(-Math.sin(th) * o.x, Math.cos(th), -Math.sin(th) * o.z);   // blade normal (approx)
      const mid = c.add(up.scale(0.006));
      for (const p of [c.add(side.scale(w)), mid, c.subtract(side.scale(w))]) pos.push(p.x, p.y, p.z);
      col.push(0.10, 0.30, 0.05, 1, 0.70, 0.70, 0.42, 1, 0.10, 0.30, 0.05, 1);
      th += k * ds; px += Math.cos(th) * ds; py += Math.sin(th) * ds;
    }
    for (let i = 0; i < NS; i++) {
      const a = v0 + i * 3, n = a + 3;
      idx.push(a, a + 1, n, a + 1, n + 1, n, a + 1, a + 2, n + 1, a + 2, n + 2, n + 1);
    }
  }
  const mesh = new B.Mesh('spider', scene);
  const vd = new B.VertexData();
  vd.positions = pos; vd.indices = idx; vd.colors = col;
  const nr = []; B.VertexData.ComputeNormals(pos, idx, nr); vd.normals = nr;
  vd.applyToMesh(mesh);
  mesh.material = M.leaf;
  return mesh;
}

// ---------------------------------------------------------------- the fern: fronds that uncurl (CPU geometry per frame)
const FN = 30;                  // segments per frond
export function makeFern(scene, M, cx, cy, cz) {
  const R = rand(9001);
  const fronds = [];
  // mature fronds: already open, arching low over the rim
  for (let i = 0; i < 6; i++) {
    fronds.push({ phi: (i / 6) * Math.PI * 2 + R() * 0.5, L: 0.6 + R() * 0.2, th0: (48 + R() * 14) * Math.PI / 180,
      th1: (-58 + R() * 22) * Math.PI / 180, t0: -10, dur: 1, col: [0.07, 0.24, 0.035] });
  }
  // young fronds: fiddleheads in the middle that unroll one after another
  for (let i = 0; i < 6; i++) {
    fronds.push({ phi: i * 2.2 + 0.6 + R() * 0.4, L: 0.52 + R() * 0.2, th0: (72 + R() * 12) * Math.PI / 180,
      th1: (-12 + R() * 22) * Math.PI / 180, t0: 0.3 + i * 0.62 + R() * 0.3, dur: 3.3 + R() * 0.9, col: [0.25, 0.48, 0.07] });
  }
  const perFrond = (FN + 1) * 2 + (FN - 1) * 2 * 4;
  const nv = perFrond * fronds.length;
  const pos = new Float32Array(nv * 3), nrm = new Float32Array(nv * 3), col = new Float32Array(nv * 4);
  const idx = [];
  fronds.forEach((f, fi) => {
    const v0 = fi * perFrond;
    for (let k = 0; k < FN; k++) { const a = v0 + 2 * k; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const p0 = v0 + (FN + 1) * 2;
    for (let q = 0; q < (FN - 1) * 2; q++) { const a = p0 + q * 4; idx.push(a, a + 1, a + 2, a, a + 2, a + 3); }
    for (let v = 0; v < perFrond; v++) {
      const rachis = v < (FN + 1) * 2;
      const tipLight = !rachis && (v - (FN + 1) * 2) % 4 === 2 ? 1.25 : 1;
      col.set(rachis ? [f.col[0] * 1.3, f.col[1] * 0.85, f.col[2], 1] : [f.col[0] * tipLight, f.col[1] * tipLight, f.col[2], 1], (v0 + v) * 4);
    }
  });
  const mesh = new B.Mesh('fern', scene);
  const vd = new B.VertexData();
  vd.positions = pos; vd.indices = idx; vd.normals = nrm; vd.colors = col;
  vd.applyToMesh(mesh, true);
  mesh.material = M.leaf;
  mesh.alwaysSelectAsActiveMesh = true;
  const P = new Float32Array((FN + 1) * 3), T = new Float32Array((FN + 1) * 3);
  /** u(t) per frond → new positions/normals */
  const update = (t) => {
    let w = 0;
    fronds.forEach((f) => {
      const u = 0.07 + 0.93 * easeInOutSine(clamp((t - f.t0) / f.dur));
      const o = [Math.cos(f.phi), Math.sin(f.phi)], la = [-Math.sin(f.phi), 0, Math.cos(f.phi)];
      const L = f.L, ds = L / FN, s0 = u * L, K = 7.2 / L, kRest = (f.th1 - f.th0) / L;
      // integrate the centreline in the frond's vertical plane (outward, up)
      let th = f.th0, px = 0, py = 0;
      for (let k = 0; k <= FN; k++) {
        const s = k * ds;
        P[k * 3] = cx + o[0] * px; P[k * 3 + 1] = cy + py; P[k * 3 + 2] = cz + o[1] * px;
        T[k * 3] = Math.cos(th) * o[0]; T[k * 3 + 1] = Math.sin(th); T[k * 3 + 2] = Math.cos(th) * o[1];
        const sm = s + ds * 0.5;
        const curl = sm > s0 - 0.03 * L ? -K * (1 + 2.6 * (sm - s0) / L) * ss(s0 - 0.03 * L, s0 + 0.07 * L, sm) : 0;
        th += (kRest + curl) * ds;
        px += Math.cos(th) * ds; py += Math.sin(th) * ds;
      }
      // rachis ribbon
      const wr = 0.0055;
      for (let k = 0; k <= FN; k++) {
        const b = (w + 2 * k) * 3;
        pos[b] = P[k * 3] + la[0] * wr; pos[b + 1] = P[k * 3 + 1]; pos[b + 2] = P[k * 3 + 2] + la[2] * wr;
        pos[b + 3] = P[k * 3] - la[0] * wr; pos[b + 4] = P[k * 3 + 1]; pos[b + 5] = P[k * 3 + 2] - la[2] * wr;
      }
      // pinnae (leaflet pairs), long in the middle of the blade, folded small on the still-curled part
      let q = w + (FN + 1) * 2;
      const Lp = 0.15 * L;
      for (let k = 1; k < FN; k++) {
        const s = k * ds, x = s / L;
        const shape = Math.pow(Math.sin(Math.PI * clamp(x * 1.02 + 0.02)), 0.65) * (1 - 0.35 * x);
        const open = 0.16 + 0.84 * (1 - ss(s0 - 0.06 * L, s0 + 0.04 * L, s));
        const len = Lp * shape * open + 0.004;
        const tx = T[k * 3], ty = T[k * 3 + 1], tz = T[k * 3 + 2];
        // blade "up" normal = −(T × la)
        const nx = -(ty * la[2] - tz * 0), ny = -(tz * la[0] - tx * la[2]), nz = -(tx * 0 - ty * la[0]);
        const px0 = P[k * 3], py0 = P[k * 3 + 1], pz0 = P[k * 3 + 2];
        for (const sg of [1, -1]) {
          const ca = 0.93, sa = 0.36;                       // leaflets lean ~21° toward the tip
          let dx = la[0] * sg * ca + tx * sa, dy = ty * sa, dz = la[2] * sg * ca + tz * sa;
          // width axis: n × d
          const wx = ny * dz - nz * dy, wy = nz * dx - nx * dz, wz = nx * dy - ny * dx;
          const wl = Math.hypot(wx, wy, wz) || 1;
          const W = len * 0.22 / wl;
          const b0 = q * 3;
          // base, side 1, tip (drooping), side 2
          pos[b0] = px0 + dx * len * 0.03; pos[b0 + 1] = py0 + dy * len * 0.03; pos[b0 + 2] = pz0 + dz * len * 0.03;
          pos[b0 + 3] = px0 + dx * len * 0.42 + wx * W + nx * len * 0.05; pos[b0 + 4] = py0 + dy * len * 0.42 + wy * W + ny * len * 0.05; pos[b0 + 5] = pz0 + dz * len * 0.42 + wz * W + nz * len * 0.05;
          pos[b0 + 6] = px0 + dx * len - nx * len * 0.2; pos[b0 + 7] = py0 + dy * len - ny * len * 0.2; pos[b0 + 8] = pz0 + dz * len - nz * len * 0.2;
          pos[b0 + 9] = px0 + dx * len * 0.42 - wx * W + nx * len * 0.05; pos[b0 + 10] = py0 + dy * len * 0.42 - wy * W + ny * len * 0.05; pos[b0 + 11] = pz0 + dz * len * 0.42 - wz * W + nz * len * 0.05;
          q += 4;
        }
      }
      w += perFrond;
    });
    B.VertexData.ComputeNormals(pos, idx, nrm);
    mesh.updateVerticesData(B.VertexBuffer.PositionKind, pos, false, false);
    mesh.updateVerticesData(B.VertexBuffer.NormalKind, nrm, false, false);
  };
  update(0);
  return { mesh, update };
}
export function easeInOutSine(p) { return 0.5 - 0.5 * Math.cos(Math.PI * clamp(p)); }
const easeOutBack = (p, c = 1.6) => { p = clamp(p); return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };

// ---------------------------------------------------------------- outdoor plants: thin-instanced leaves + petioles
/** a cupped disc leaf lying in the xz plane, facing +y (peltate: attached at its centre) */
function leafDisc(scene) {
  const d = B.MeshBuilder.CreateDisc('leafDisc', { radius: 1, tessellation: 22 }, scene);
  d.bakeTransformIntoVertices(B.Matrix.RotationX(Math.PI / 2));
  const p = d.getVerticesData(B.VertexBuffer.PositionKind);
  for (let i = 0; i < p.length; i += 3) p[i + 1] += 0.2 * (p[i] * p[i] + p[i + 2] * p[i + 2]);
  const ind = d.getIndices(), n = [];
  B.VertexData.ComputeNormals(p, ind, n);
  d.updateVerticesData(B.VertexBuffer.PositionKind, p);
  d.updateVerticesData(B.VertexBuffer.NormalKind, n);
  return d;
}
export function makeOutdoorPlants(scene, M, pilea, seed) {
  const R = rand(3131);
  const leaves = [];   // { attach(t)->..., } computed in update
  // pilea: 13 round leaves on long petioles (golden-angle phyllotaxis); the youngest unfurl during the piece
  const pc = V(1.0, pilea.soilY + 0.03, 1.7);
  for (let k = 0; k < 13; k++) {
    const older = k < 5;
    leaves.push({
      kind: 'pilea', crown: pc, psi: k * 2.39996 + 0.4, el: (older ? 22 + R() * 12 : 40 + (k - 5) * 3.5 + R() * 8) * Math.PI / 180,
      len: older ? 0.2 + R() * 0.05 : 0.2 - (k - 5) * 0.012, rho: older ? 0.09 + R() * 0.015 : 0.085 - (k - 5) * 0.004,
      tilt: (22 + R() * 18) * Math.PI / 180, t0: older ? -9 : 0.8 + (k - 5) * 0.62 + R() * 0.3, dur: 1.7, sx: 1,
      col: older ? [0.06, 0.2, 0.04, 1] : [0.12, 0.33, 0.05, 1],
    });
  }
  // seedling: two cotyledons (open) and two true leaves that open and grow
  const sc = V(-0.5, seed.soilY + 0.17, 2.15);
  for (let k = 0; k < 4; k++) {
    const coty = k < 2;
    leaves.push({
      kind: 'seed', crown: sc, psi: (coty ? 0.3 : 0.3 + Math.PI / 2) + (k % 2) * Math.PI, el: coty ? 12 * Math.PI / 180 : 26 * Math.PI / 180,
      len: 0.01, rho: coty ? 0.045 : 0.075, tilt: 0, t0: coty ? -9 : 2.0 + (k - 2) * 0.5, dur: 3.0, sx: 0.5,
      col: coty ? [0.32, 0.5, 0.1, 1] : [0.2, 0.44, 0.07, 1], fold: !coty,
    });
  }
  const disc = leafDisc(scene);
  disc.material = M.leaf;
  disc.alwaysSelectAsActiveMesh = true;
  const nL = leaves.length;
  const lm = new Float32Array(nL * 16), lc = new Float32Array(nL * 4);
  leaves.forEach((l, i) => lc.set(l.col, i * 4));
  disc.thinInstanceSetBuffer('matrix', lm, 16, false);
  disc.thinInstanceSetBuffer('color', lc, 4, true);
  // petioles: unit cylinder from y = 0 to 1
  const pet = B.MeshBuilder.CreateCylinder('petiole', { height: 1, diameter: 1, tessellation: 6, cap: B.Mesh.NO_CAP }, scene);
  pet.bakeTransformIntoVertices(B.Matrix.Translation(0, 0.5, 0));
  pet.material = M.stem;
  pet.alwaysSelectAsActiveMesh = true;
  const pm = new Float32Array(nL * 16);
  pet.thinInstanceSetBuffer('matrix', pm, 16, false);
  // seedling stem (static)
  const stem = B.MeshBuilder.CreateTube('seedStem', { path: [V(-0.5, seed.soilY, 2.15), V(-0.505, seed.soilY + 0.09, 2.152), V(-0.5, sc.y, 2.15)], radius: 0.007, tessellation: 8 }, scene);
  stem.material = M.stem;
  const pilStem = B.MeshBuilder.CreateCylinder('pileaStem', { height: 0.06, diameter: 0.022, tessellation: 8 }, scene);
  pilStem.position.set(pc.x, pc.y - 0.02, pc.z);
  pilStem.material = M.stem;

  const put = (arr, i, X, Y, Z, p) => {
    const o = i * 16;
    arr[o] = X.x; arr[o + 1] = X.y; arr[o + 2] = X.z; arr[o + 3] = 0;
    arr[o + 4] = Y.x; arr[o + 5] = Y.y; arr[o + 6] = Y.z; arr[o + 7] = 0;
    arr[o + 8] = Z.x; arr[o + 9] = Z.y; arr[o + 10] = Z.z; arr[o + 11] = 0;
    arr[o + 12] = p.x; arr[o + 13] = p.y; arr[o + 14] = p.z; arr[o + 15] = 1;
  };
  const update = (t) => {
    leaves.forEach((l, i) => {
      const e = l.t0 < -5 ? 1 : easeOutBack((t - l.t0) / l.dur, 1.3);
      const g = clamp(e, 0, 1.2);
      const out = V(Math.cos(l.psi), 0, Math.sin(l.psi));
      // a young leaf rises steeply, then lowers to its resting angle as it opens
      const el = l.el + (1 - clamp(e)) * (l.fold ? 1.1 : 0.7);
      const dir = V(out.x * Math.cos(el), Math.sin(el), out.z * Math.cos(el));
      const len = l.len * (0.45 + 0.55 * clamp(e));
      const tip = l.crown.add(dir.scale(len));
      // petiole
      const a = B.Vector3.Cross(dir, Math.abs(dir.y) > 0.95 ? V(1, 0, 0) : V(0, 1, 0)).normalize();
      const b2 = B.Vector3.Cross(a, dir).normalize();
      const pw = l.kind === 'pilea' ? 0.009 : 0.006;
      put(pm, i, a.scale(pw), dir.scale(len), b2.scale(pw), l.crown);
      // leaf blade: normal tilted outward from vertical; while folded it stands up along the petiole
      const rho = l.rho * (0.12 + 0.88 * g);
      let n;
      if (l.kind === 'pilea') {
        const tilt = l.tilt + (1 - clamp(e)) * 0.9;
        n = V(out.x * Math.sin(tilt), Math.cos(tilt), out.z * Math.sin(tilt));
      } else {
        const tilt = l.fold ? 0.25 + (1 - clamp(e)) * 1.15 : 0.2;
        n = V(-out.x * Math.sin(tilt), Math.cos(tilt), -out.z * Math.sin(tilt));
      }
      n.normalize();
      // Z axis of the disc = the leaf's long axis (outward, in the blade plane)
      let Zv = out.subtract(n.scale(B.Vector3.Dot(out, n))).normalize();
      const Xv = B.Vector3.Cross(n, Zv).normalize();
      Zv = B.Vector3.Cross(Xv, n).normalize();
      const centre = l.kind === 'pilea' ? tip.add(n.scale(0.004)) : tip.add(Zv.scale(rho * 0.95));
      put(lm, i, Xv.scale(rho * l.sx), n.scale(rho), Zv.scale(rho), centre);
    });
    disc.thinInstanceBufferUpdated('matrix');
    pet.thinInstanceBufferUpdated('matrix');
  };
  update(0);
  return { disc, pet, stem, pilStem, update, casters: [disc, pet, stem, pilStem], receivers: [disc, pet, stem, pilStem] };
}

// ---------------------------------------------------------------- dew: beads (SPS, PBR) + glints (SPS, emissive → GlowLayer)
export function makeDew(scene, M) {
  const R = rand(2468);
  const drops = [];
  const { X, Z, Y0, Y1, YR } = G;
  const push = (x, y, z, nx, ny, nz, r, where) => drops.push({ x, y, z, nx, ny, nz, r, where, w: 1.6 + R() * 4.2, ph: R() * 6.283, k: R() });
  // front glass: more drops lower down, where condensation gathers
  for (let i = 0; i < 78; i++) { const v = R(); push(-X + 0.03 + R() * (2 * X - 0.06), Y0 + 0.03 + (Y1 - Y0 - 0.06) * v * v, Z + 0.004, 0, 0, 1, 0.006 + R() * 0.009, 'wall'); }
  for (let i = 0; i < 26; i++) { const v = R(); push(X + 0.004, Y0 + 0.03 + (Y1 - Y0 - 0.06) * v * v, -Z + 0.03 + R() * (2 * Z - 0.06), 1, 0, 0, 0.006 + R() * 0.008, 'wall'); }
  for (let i = 0; i < 18; i++) { const v = R(); push(-X - 0.004, Y0 + 0.03 + (Y1 - Y0 - 0.06) * v * v, -Z + 0.03 + R() * (2 * Z - 0.06), -1, 0, 0, 0.006 + R() * 0.008, 'wall'); }
  // front roof slope, outside the vent bay
  const nrm = VENT_GEOM.nrm;
  for (let i = 0; i < 40; i++) {
    let x = -X + 0.03 + R() * (2 * X - 0.06);
    if (x > G.VENT[0] - 0.02 && x < G.VENT[1] + 0.02) x = x < 0.25 ? G.VENT[0] - 0.05 - R() * 0.3 : G.VENT[1] + 0.05 + R() * 0.3;
    const v = 0.06 + R() * 0.9;
    push(x, YR - (YR - Y1) * v + nrm[1] * 0.004, Z * v + nrm[2] * 0.004, 0, nrm[1], nrm[2], 0.007 + R() * 0.008, 'roof');
  }
  // table: around the case and the pots
  for (let i = 0; i < 52; i++) {
    let x, z;
    do { x = -1.7 + R() * 3.4; z = 0.82 + R() * 2.6; } while (Math.hypot(x - 1.0, z - 1.7) < 0.36 || Math.hypot(x + 0.5, z - 2.15) < 0.22);
    push(x, 0.0, z, 0, 1, 0, 0.007 + R() * 0.012, 'table');
  }
  // pot rims
  for (let i = 0; i < 14; i++) { const a = R() * 6.283; push(1.0 + Math.cos(a) * 0.255, 0.035 + 0.42, 1.7 + Math.sin(a) * 0.255, 0, 1, 0, 0.006 + R() * 0.006, 'rim'); }
  const N = drops.length;
  const mk = (name, sub, mat, color) => {
    const sps = new B.SolidParticleSystem(name, scene, { updatable: true, isPickable: false });
    const ico = B.MeshBuilder.CreateIcoSphere('ico', { radius: 1, subdivisions: sub }, scene);
    sps.addShape(ico, N);
    ico.dispose();
    const mesh = sps.buildMesh();
    mesh.material = mat;
    mesh.alwaysSelectAsActiveMesh = true;
    sps.isAlwaysVisible = true;
    sps.computeParticleRotation = false;
    sps.computeParticleTexture = false;
    sps.computeParticleVertex = false;
    sps.computeParticleColor = color;
    sps.computeBoundingBox = false;
    return sps;
  };
  const beads = mk('beads', 2, M.bead, false);
  const glints = mk('glints', 1, M.glint, true);
  // state written by update() and read by the SPS callbacks
  const S = { t: 0, sunOn: 0, evap: 0, cam: V(0, 1, 5), sun: V(0, 0.1, -1), warm: [1, 0.9, 0.7] };
  beads.updateParticle = (p) => {
    const d = drops[p.idx];
    const f = d.where === 'roof' || d.where === 'table' ? 1 - 0.5 * S.evap * (0.5 + d.k) : 1;
    const r = d.r * Math.max(0.15, f);
    const lift = d.where === 'table' || d.where === 'rim' ? r * 0.45 : r * 0.35;
    p.position.set(d.x + d.nx * lift, d.y + d.ny * lift, d.z + d.nz * lift);
    p.scaling.set(r, d.where === 'table' || d.where === 'rim' ? r * 0.8 : r, r);
    return p;
  };
  const hv = V(0, 0, 0), tc = V(0, 0, 0);
  glints.updateParticle = (p) => {
    const d = drops[p.idx];
    const f = d.where === 'roof' || d.where === 'table' ? 1 - 0.5 * S.evap * (0.5 + d.k) : 1;
    const r = d.r * Math.max(0.15, f);
    const cx = d.x + d.nx * r * 0.4, cy = d.y + d.ny * r * 0.4, cz = d.z + d.nz * r * 0.4;
    // the glint sits where the bead mirrors the sun toward the camera: along the sun/view half vector
    tc.set(S.cam.x - cx, S.cam.y - cy, S.cam.z - cz).normalize();
    hv.set(tc.x + S.sun.x, tc.y + S.sun.y, tc.z + S.sun.z).normalize();
    const facing = clamp(hv.x * d.nx + hv.y * d.ny + hv.z * d.nz + 0.35, 0, 1);
    const tw = Math.pow(0.5 + 0.5 * Math.sin(d.w * S.t + d.ph), 7);
    const g = S.sunOn * facing * (0.22 + 0.78 * tw);
    const s = r * (0.06 + 0.62 * g);
    p.position.set(cx + hv.x * r * 0.8, cy + hv.y * r * 0.8, cz + hv.z * r * 0.8);
    p.scaling.set(s, s, s);
    const c = p.color;
    c.r = S.warm[0]; c.g = S.warm[1]; c.b = S.warm[2]; c.a = 1;
    return p;
  };
  const update = (t, P) => {
    S.t = t; S.sunOn = P.sunOn; S.evap = P.evap; S.cam.copyFrom(P.cam); S.sun.copyFrom(P.sun); S.warm = P.warm;
    beads.setParticles();
    glints.setParticles();
  };
  return { beads, glints, update };
}

// ---------------------------------------------------------------- butterfly: two textured planes on a body
function wingTexture(scene) {
  const S = 256;
  const t = new B.DynamicTexture('wingTex', { width: S, height: S }, scene, true);
  const c = t.getContext();
  c.clearRect(0, 0, S, S);
  // hinge along the left edge (body), forward = top. Forewing then hindwing.
  const fore = new Path2D('M4 104 C 40 70, 120 30, 236 34 C 246 60, 236 98, 214 128 C 160 146, 70 146, 6 142 Z');
  const hind = new Path2D('M6 140 C 60 140, 150 140, 196 156 C 204 196, 176 232, 132 240 C 80 238, 30 214, 6 186 Z');
  c.fillStyle = '#f7f2e6';
  c.fill(hind);
  // hindwing underside mottling showing through (grey-green dapples)
  c.save(); c.clip(hind);
  const R = rand(31);
  for (let i = 0; i < 26; i++) {
    c.fillStyle = `rgba(${130 + R() * 40 | 0},${150 + R() * 30 | 0},${110 + R() * 20 | 0},${0.18 + R() * 0.2})`;
    c.beginPath(); c.ellipse(20 + R() * 170, 150 + R() * 85, 6 + R() * 14, 4 + R() * 9, R() * 3, 0, Math.PI * 2); c.fill();
  }
  c.restore();
  c.fillStyle = '#f9f5ea';
  c.fill(fore);
  c.save(); c.clip(fore);
  // the orange tip and its charcoal edge
  const og = c.createRadialGradient(236, 40, 6, 230, 50, 120);
  og.addColorStop(0, '#f27a1a'); og.addColorStop(0.55, '#f39a35'); og.addColorStop(0.62, 'rgba(244,160,70,0)');
  c.fillStyle = og;
  c.fillRect(100, 0, 156, 160);
  c.fillStyle = 'rgba(52,44,40,0.85)';
  c.beginPath(); c.ellipse(238, 40, 22, 16, -0.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#2e2724';
  c.beginPath(); c.ellipse(118, 92, 7, 6, 0, 0, Math.PI * 2); c.fill();
  // body shading near the hinge
  const bg = c.createLinearGradient(0, 0, 40, 0);
  bg.addColorStop(0, 'rgba(90,86,80,0.6)'); bg.addColorStop(1, 'rgba(90,86,80,0)');
  c.fillStyle = bg; c.fillRect(0, 0, 40, S);
  c.restore();
  // veins
  c.strokeStyle = 'rgba(96,86,74,0.32)';
  c.lineWidth = 1.2;
  for (const [x, y] of [[230, 40], [226, 70], [214, 110], [180, 136], [190, 170], [170, 214], [130, 236], [70, 226]]) {
    c.beginPath(); c.moveTo(6, y < 140 ? 120 : 160); c.quadraticCurveTo((x + 6) * 0.45, (y + (y < 140 ? 120 : 160)) * 0.5 - 8, x, y); c.stroke();
  }
  c.strokeStyle = 'rgba(60,52,46,0.55)';
  c.lineWidth = 1.5;
  c.stroke(fore); c.stroke(hind);
  t.update();
  t.hasAlpha = true;
  return t;
}
export function makeButterfly(scene, M) {
  const S = 0.13;
  const root = new B.TransformNode('butterfly', scene);
  const tex = wingTexture(scene);
  const wm = new B.PBRMaterial('wingMat', scene);
  wm.albedoTexture = tex;
  wm.useAlphaFromAlbedoTexture = true;
  wm.transparencyMode = B.PBRMaterial.PBRMATERIAL_ALPHATEST;
  wm.alphaCutOff = 0.45;
  wm.metallic = 0; wm.roughness = 0.62;
  wm.backFaceCulling = false;
  wm.twoSidedLighting = true;
  wm.subSurface.isTranslucencyEnabled = true;
  wm.subSurface.translucencyIntensity = 0.6;
  wm.subSurface.useAlbedoToTintTranslucency = true;
  wm.subSurface.maximumThickness = 0.15;
  const mkWing = (mirror) => {
    const w = B.MeshBuilder.CreatePlane(mirror ? 'wingL' : 'wingR', { size: S }, scene);
    let m = B.Matrix.Translation(S / 2, 0.07 * S, 0).multiply(B.Matrix.RotationX(Math.PI / 2));
    if (mirror) m = m.multiply(B.Matrix.Scaling(-1, 1, 1));
    w.bakeTransformIntoVertices(m);
    w.material = wm;
    w.parent = root;
    return w;
  };
  const wingR = mkWing(false), wingL = mkWing(true);
  const body = B.MeshBuilder.CreateCapsule('bBody', { height: 0.1, radius: 0.0095, tessellation: 10, subdivisions: 2 }, scene);
  body.bakeTransformIntoVertices(B.Matrix.RotationX(Math.PI / 2).multiply(B.Matrix.Translation(0, -0.004, -0.012)));
  const head = B.MeshBuilder.CreateSphere('bHead', { diameter: 0.019, segments: 8 }, scene);
  head.bakeTransformIntoVertices(B.Matrix.Translation(0, -0.002, 0.042));
  const parts = [body, head];
  for (const sx of [-1, 1]) {
    parts.push(B.MeshBuilder.CreateTube('ant', { path: [V(sx * 0.003, 0.002, 0.048), V(sx * 0.012, 0.016, 0.075), V(sx * 0.02, 0.026, 0.1)], radius: 0.0013, tessellation: 5 }, scene));
    const club = B.MeshBuilder.CreateSphere('club', { diameter: 0.006, segments: 6 }, scene);
    club.bakeTransformIntoVertices(B.Matrix.Translation(sx * 0.02, 0.026, 0.1));
    parts.push(club);
  }
  const bodyMesh = merge(parts, 'bBodyAll', M.body);
  bodyMesh.parent = root;
  root.rotationQuaternion = null;
  return { root, wingL, wingR, body: bodyMesh, casters: [wingL, wingR, bodyMesh] };
}
