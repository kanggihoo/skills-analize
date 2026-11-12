/*
 * parts.js — the invented compact flashlight, every part built in code (no model files).
 *
 * World units are roughly centimetres. Every part is built around its OWN origin (its centre on the long axis, y up),
 * so a part can spin and tilt in place; main.js places those origins with the part table.
 *
 *   profile()   a lathe profile with rounded corners: each corner of the polyline gets a fillet (quadratic arc),
 *               so every rim and edge is a soft bevel and LatheGeometry's averaged normals shade it smoothly
 *   offsetProfile()  the same profile pushed out along its 2D normals (the highlight hull)
 *   knurlNormalMap() a tileable diamond-knurl height field → tangent-space normal map (drawn once, putImageData)
 *   build*()    one function per part: Lathe (tail cap, boot, body, pill, reflector, lens, battery ends),
 *               Cylinder (knurl band, battery wrap, PCB), Extrude (bezel), Tube along a helix (spring, two lengths
 *               blended on the CPU), RoundedBox (emitter)
 * Nothing here moves or reads the time.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

export const COL = {
  cream: '#e9e0d0', graphite: '#2c313b', rubber: '#24282f', steel: '#c9ced6', alu: '#eef1f5',
  teal: '#4f8f8b', ceramic: '#f1ece2', amber: '#ffb547', navy: '#1b2230',
};

const SEG = 64;   // lathe segments around the axis

/** canvas for textures drawn once in setup (CPU raster in the headless check) */
export function makeCanvas(w, h, cpu) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d', cpu ? { willReadFrequently: true } : undefined)];
}

/**
 * [[r, y, fillet], …] → Vector2[]. Corner i is replaced by a quadratic arc from (P − d·a) to (P + d·b), control point
 * P, where a/b are the unit directions in and out of the corner and d = fillet · tan(θ/2) (θ = turn angle), clamped
 * to 48 % of either neighbouring segment. First and last points are kept as they are (start a closed loop mid-edge).
 */
export function profile(pts) {
  const out = [new THREE.Vector2(pts[0][0], pts[0][1])];
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [cx, cy, f = 0] = pts[i], [nx, ny] = pts[i + 1];
    if (!f) { out.push(new THREE.Vector2(cx, cy)); continue; }
    let ax = cx - px, ay = cy - py, bx = nx - cx, by = ny - cy;
    const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
    ax /= la; ay /= la; bx /= lb; by /= lb;
    const th = Math.acos(Math.max(-1, Math.min(1, ax * bx + ay * by)));
    const d = Math.min(f * Math.tan(th / 2), 0.48 * la, 0.48 * lb);
    const sx = cx - ax * d, sy = cy - ay * d, ex = cx + bx * d, ey = cy + by * d;
    const n = Math.max(2, Math.min(9, Math.ceil(th / 0.19)));
    for (let k = 0; k <= n; k++) {
      const u = k / n, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
      out.push(new THREE.Vector2(a * sx + b * cx + c * ex, a * sy + b * cy + c * ey));
    }
  }
  const L = pts[pts.length - 1];
  out.push(new THREE.Vector2(L[0], L[1]));
  return out;
}

/** push a profile out by w along its outward 2D normal (n = (dy, −dx) of the neighbouring segments, as LatheGeometry) */
export function offsetProfile(v, w) {
  return v.map((p, i) => {
    const a = v[Math.max(0, i - 1)], b = v[Math.min(v.length - 1, i + 1)];
    let nx = b.y - a.y, ny = -(b.x - a.x);
    const l = Math.hypot(nx, ny) || 1;
    nx /= l; ny /= l;
    return new THREE.Vector2(Math.max(0, p.x + nx * w), p.y + ny * w);
  });
}

const lathe = (pts, seg = SEG) => new THREE.LatheGeometry(profile(pts), seg);

/** lathe UVs run by point index; re-map v to height so a texture wraps the part evenly */
function remapV(geo, y0, y1) {
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setY(i, (p.getY(i) - y0) / (y1 - y0));
  uv.needsUpdate = true;
  return geo;
}

function mesh(geo, mat, cast = true) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = false;
  return m;
}

// ---------------------------------------------------------------- textures (setup only)

/**
 * Diamond knurl: two families of V-grooves along the diagonals, a = frac(u+v), b = frac(u−v), ridge tri(x) = 1 − |2x − 1|.
 * Height h = min(1, 1.3 · min(tri(a), tri(b))) gives pyramids with small flat tops. Normals come from central differences
 * with wrap-around (so the tile repeats seamlessly): n = normalize(−s·∂h/∂u, −s·∂h/∂v, 1), stored as rgb = n·½ + ½.
 * Canvas rows run down while texture v runs up (flipY), hence the sign on the y difference.
 */
export function knurlNormalMap(size, cells, slope, cpu) {
  const H = new Float32Array(size * size);
  const tri = (x) => 1 - Math.abs(2 * (x - Math.floor(x)) - 1);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = ((x + 0.5) / size) * cells, v = ((y + 0.5) / size) * cells;
    const h = Math.min(1, 1.3 * Math.min(tri(u + v), tri(u - v)));
    H[y * size + x] = h * h * (3 - 2 * h);          // softened shoulders
  }
  const [c, g] = makeCanvas(size, size, cpu);
  const img = g.createImageData(size, size);
  const at = (x, y) => H[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * 0.5 * slope;
    const dy = (at(x, y + 1) - at(x, y - 1)) * 0.5 * slope;
    let nx = -dx, ny = dy, nz = 1;
    const l = Math.hypot(nx, ny, nz);
    nx /= l; ny /= l; nz /= l;
    const i = (y * size + x) * 4;
    img.data[i] = Math.round((nx * 0.5 + 0.5) * 255);
    img.data[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
    img.data[i + 2] = Math.round((nz * 0.5 + 0.5) * 255);
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const tx = new THREE.CanvasTexture(c);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  tx.colorSpace = THREE.NoColorSpace;
  return tx;
}

/** battery wrap: u around, v along (canvas top = the + end) */
function wrapTexture(cpu) {
  const [c, g] = makeCanvas(512, 256, cpu);
  g.fillStyle = COL.teal; g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#e9e0d0'; g.fillRect(0, 22, 512, 26);
  g.fillRect(0, 58, 512, 3);
  g.fillStyle = '#3d7370'; g.fillRect(0, 226, 512, 18);
  g.fillStyle = 'rgba(233,224,208,0.92)';
  for (let k = 0; k < 4; k++) {                       // "+" marks around the + end
    const x = 64 + k * 128, y = 92;
    g.fillRect(x - 13, y - 3.5, 26, 7); g.fillRect(x - 3.5, y - 13, 7, 26);
  }
  g.fillStyle = 'rgba(233,224,208,0.35)';
  for (let k = 0; k < 4; k++) g.fillRect(48 + k * 128, 140, 32, 4);   // faint dashes
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.wrapS = THREE.RepeatWrapping;
  return tx;
}

/** LED board top: graphite with a pale ring trace and two pads (cylinder top-cap UVs are planar, centred) */
function pcbTexture(cpu) {
  const [c, g] = makeCanvas(256, 256, cpu);
  g.fillStyle = COL.graphite; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(233,224,208,0.30)'; g.lineWidth = 3;
  g.beginPath(); g.arc(128, 128, 98, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 6;
  g.beginPath(); g.moveTo(128, 30); g.lineTo(128, 70); g.stroke();
  g.beginPath(); g.moveTo(128, 186); g.lineTo(128, 226); g.stroke();
  g.fillStyle = 'rgba(201,206,214,0.65)';
  g.fillRect(104, 14, 48, 22); g.fillRect(104, 220, 48, 22);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

// ---------------------------------------------------------------- materials

export function makeMaterials(cpu) {
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const knurl = knurlNormalMap(256, 8, 9, cpu);
  knurl.repeat.set(5, 2.56);
  return {
    knurlTex: knurl,
    cream: std({ color: COL.cream, roughness: 0.5, metalness: 0 }),
    knurl: std({ color: COL.cream, roughness: 0.56, metalness: 0, normalMap: knurl, normalScale: new THREE.Vector2(1, 1) }),
    graphite: std({ color: COL.graphite, roughness: 0.4, metalness: 0.3 }),
    rubber: std({ color: COL.rubber, roughness: 0.82, metalness: 0 }),
    steel: std({ color: COL.steel, roughness: 0.3, metalness: 1 }),
    alu: std({ color: COL.alu, roughness: 0.07, metalness: 1 }),
    wrap: std({ map: wrapTexture(cpu), roughness: 0.32, metalness: 0 }),
    pcb: std({ map: pcbTexture(cpu), roughness: 0.5, metalness: 0.1 }),
    ceramic: std({ color: COL.ceramic, roughness: 0.42, metalness: 0 }),
    die: std({ color: '#ffd277', roughness: 0.35, metalness: 0, emissive: new THREE.Color(COL.amber), emissiveIntensity: 0 }),
    // glass: near-black diffuse drawn additively — only its reflections (and a faint cool tint) land on what is behind
    glass: std({ color: '#1a2a33', roughness: 0.03, metalness: 0.4, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
    hull: new THREE.MeshBasicMaterial({ color: COL.amber, side: THREE.BackSide, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }),
  };
}

// ---------------------------------------------------------------- parts (each centred on its own origin)

/** tail cap: a cup with a rounded heel and two rings, plus the rubber switch boot in its floor. Spans y −0.80…0.80 (boot to −0.92). */
export function buildTail(M) {
  const g = new THREE.Group();
  g.add(mesh(lathe([
    [0.76, -0.55], [0.52, -0.55, 0.03], [0.52, -0.80, 0.03], [1.20, -0.80, 0.30], [1.20, -0.32, 0.02],
    [1.15, -0.28, 0.012], [1.15, -0.20, 0.012], [1.20, -0.16, 0.02], [1.20, 0.02, 0.02], [1.15, 0.06, 0.012],
    [1.15, 0.14, 0.012], [1.20, 0.18, 0.02], [1.20, 0.80, 0.05], [1.00, 0.80, 0.03], [1.00, -0.55, 0.06], [0.76, -0.55],
  ]), M.cream));
  g.add(mesh(lathe([[0, -0.92], [0.30, -0.905, 0.12], [0.47, -0.83, 0.06], [0.47, -0.56, 0.02], [0, -0.56]]), M.rubber));
  return g;
}

/**
 * Spring: a tube along a helix with closed (flat) end coils. The pitch density is 1 on the active coils and 0.08 on the
 * end coils; y(s) is its normalised integral, so both lengths share one parameterisation → identical topology, and
 * setLength(k) blends the vertex positions and normals of the compressed (0.9) and relaxed (1.5) tubes on the CPU
 * (about 1,800 vertices — no morph-target shader variant to compile). Centred on its origin.
 */
export function buildSpring(M) {
  const R = 0.6, WIRE = 0.065, TURNS = 5.2, ENDS = 0.8;
  const dens = (q) => { const k = Math.min(1, Math.max(0, Math.min(q - ENDS, TURNS - ENDS - q) / 0.35 + 0.5)); return 0.08 + 0.92 * k * k * (3 - 2 * k); };
  const N = 600, cum = new Float64Array(N + 1);
  for (let i = 1; i <= N; i++) cum[i] = cum[i - 1] + dens(((i - 0.5) / N) * TURNS);
  class Helix extends THREE.Curve {
    constructor(L) { super(); this.L = L; }
    getPoint(s, out = new THREE.Vector3()) {
      const f = s * N, i = Math.min(N - 1, Math.floor(f));
      const c = (cum[i] + (cum[i + 1] - cum[i]) * (f - i)) / cum[N];
      const a = s * TURNS * Math.PI * 2;
      return out.set(R * Math.cos(a), -this.L / 2 + WIRE + c * (this.L - 2 * WIRE), R * Math.sin(a));
    }
  }
  const tube = (L) => new THREE.TubeGeometry(new Helix(L), 220, WIRE, 7, false);
  const geo = tube(0.9), relaxed = tube(1.5);
  const P = geo.attributes.position, Nn = geo.attributes.normal;
  const p0 = P.array.slice(), p1 = relaxed.attributes.position.array, n0 = Nn.array.slice(), n1 = relaxed.attributes.normal.array;
  const m = mesh(geo, M.steel);
  m.frustumCulled = false;
  const g = new THREE.Group();
  g.add(m);
  const setLength = (k) => {
    for (let i = 0; i < p0.length; i++) { P.array[i] = p0[i] + (p1[i] - p0[i]) * k; Nn.array[i] = n0[i] + (n1[i] - n0[i]) * k; }
    P.needsUpdate = true; Nn.needsUpdate = true;
  };
  return { group: g, mesh: m, setLength };
}

/** battery: printed wrap (lathe with rounded shoulders, v re-mapped to height) between two steel ends. Spans y −3…3. */
export function buildBattery(M) {
  const g = new THREE.Group();
  g.add(mesh(remapV(lathe([[0.70, -2.86], [0.855, -2.80, 0.05], [0.855, 2.80, 0.05], [0.70, 2.86]]), -2.86, 2.86), M.wrap));
  g.add(mesh(lathe([[0, -3.0], [0.80, -3.0, 0.05], [0.80, -2.82], [0, -2.82]]), M.steel));
  g.add(mesh(lathe([[0, 2.82], [0.80, 2.82], [0.80, 2.90, 0.04], [0.32, 2.90, 0.02], [0.32, 3.0, 0.06], [0, 3.0]]), M.steel));
  return g;
}

/**
 * body tube (origin = body centre): bottom rim, two machined grooves around the knurl band, a flared head with a
 * cavity and the ledge the LED module sits on; the knurl band is an open cylinder 0.005 proud of the lathe with the
 * normal map. Spans y −3.40…3.60.
 */
export function buildBody(M) {
  const g = new THREE.Group();
  g.add(mesh(lathe([
    [0.92, 0.0], [0.92, -3.40, 0.03], [1.12, -3.40, 0.05], [1.12, -2.86, 0.02], [1.065, -2.82, 0.015], [1.065, -2.72, 0.015],
    [1.12, -2.68, 0.02], [1.12, 1.02, 0.02], [1.065, 1.06, 0.015], [1.065, 1.16, 0.015], [1.12, 1.20, 0.02],
    [1.12, 1.45, 1.4], [1.48, 2.30, 1.4], [1.48, 3.60, 0.05], [1.33, 3.60, 0.03], [1.33, 2.20, 0.03], [0.92, 2.20, 0.03], [0.92, 0.0],
  ], 80), M.cream));
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1.125, 1.125, 3.62, 96, 1, true), M.knurl);
  band.position.y = -0.83;
  band.castShadow = true;
  g.add(band);
  return g;
}

/** LED module: steel pill, graphite board with traces, white emitter with the phosphor die. Centred (y −0.27…0.27). */
export const PILL_PROFILE = [[0, -0.27], [1.22, -0.27, 0.05], [1.22, 0.05, 0.05], [0, 0.05]];
export function buildLed(M) {
  const g = new THREE.Group();
  g.add(mesh(lathe(PILL_PROFILE), M.steel));
  const pcb = mesh(new THREE.CylinderGeometry(1.12, 1.12, 0.05, SEG), [M.graphite, M.pcb, M.graphite]);
  pcb.position.y = 0.075;
  g.add(pcb);
  const emitter = mesh(new RoundedBoxGeometry(0.5, 0.14, 0.5, 2, 0.035), M.ceramic);
  emitter.position.y = 0.17;
  g.add(emitter);
  const die = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 32), M.die, false);
  die.position.y = 0.25;
  g.add(die);
  // highlight hull: the pill + board outline pushed out along its normals, drawn back faces only (an outline)
  const hullPts = offsetProfile(profile([[0, -0.27], [1.22, -0.27, 0.05], [1.22, 0.10, 0.05], [0, 0.10]]), 0.075);
  const hull = new THREE.Mesh(new THREE.LatheGeometry(hullPts, SEG), M.hull);
  hull.renderOrder = 2;
  g.add(hull);
  return { group: g, die, hull, dieY: 0.265 };
}

/**
 * reflector: inner paraboloid y = (r² − r0²)/(4f) from the emitter hole r0 = 0.38 to the rim r1 = 1.24 (height 1.23),
 * a 0.07 shell behind it and a short straight lip. Polished aluminium, centred (y −0.635…0.635).
 */
export function buildReflector(M) {
  const r0 = 0.38, r1 = 1.24, Hh = 1.23, f = (r1 * r1 - r0 * r0) / (4 * Hh), y0 = -0.635, rb = r0 + 0.2;
  const inner = [];                                       // paraboloid, rim → hole (going down: normals face the axis)
  for (let i = 0; i <= 28; i++) { const r = r1 - ((r1 - r0) * i) / 28; inner.push([r, y0 + 0.02 + (r * r - r0 * r0) / (4 * f)]); }
  const outer = [];                                       // the back shell: a wider paraboloid with the same focal length
  for (let i = 1; i <= 16; i++) { const y = y0 + ((Hh - 0.12) * i) / 16; outer.push([Math.sqrt(rb * rb + 4 * f * (y - y0)), y]); }
  const pts = [[0.48, y0], [rb, y0, 0.03], ...outer, [1.30, -y0, 0.03], [r1, -y0, 0.01], ...inner, [r0, y0, 0.01], [0.48, y0]];
  return mesh(lathe(pts, 80), M.alu);
}

/** lens: a clear disc with softened edges, centred (y −0.05…0.05) */
export function buildLens(M) {
  const m = mesh(lathe([[0, -0.05], [1.36, -0.05, 0.03], [1.36, 0.05, 0.03], [0, 0.05]]), M.glass, false);
  m.renderOrder = 3;
  return m;
}

/**
 * bezel: an Extrude of a ring whose outer edge carries 12 soft grip scallops r(θ) = 1.54 + 0.045·cos 12θ around a
 * round window r = 1.17; three-segment round bevel; normals re-creased at 35° so the bevel is smooth and the
 * flat faces stay flat. Extruded along z, turned to y, centred (y −0.45…0.45).
 */
export function buildBezel(M) {
  const shape = new THREE.Shape();
  const N = 144;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2, r = 1.54 + 0.045 * Math.cos(12 * a);
    if (i === 0) shape.moveTo(r * Math.cos(a), r * Math.sin(a)); else shape.lineTo(r * Math.cos(a), r * Math.sin(a));
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, 1.17, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  let geo = new THREE.ExtrudeGeometry(shape, { depth: 0.76, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.06,
    bevelSegments: 3, curveSegments: 64, steps: 1 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -0.38, 0);
  geo = toCreasedNormals(geo, (35 * Math.PI) / 180);
  return mesh(geo, M.graphite);
}
