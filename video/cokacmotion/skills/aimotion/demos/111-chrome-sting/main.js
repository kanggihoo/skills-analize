/*
 * 111 · 오늘의 발견 — a broadcast opening-title sting: a bevelled metal word in a procedural studio.
 *
 *   type      Pretendard Black outlines (opentype.js via _lib/type.js) → THREE.Shape (+ holes) → ExtrudeGeometry with a
 *             three-segment round bevel; side normals re-smoothed with a crease angle, caps kept flat (chrome shows
 *             every normal error). One mesh per syllable, two lines: 「오늘의」 chrome, 「발견」 warm gold (the accent).
 *   light     no lamps at all: the metal only reflects an HDR studio drawn as an equirectangular half-float texture
 *             (softboxes, strips, a horizon cut) and run through PMREMGenerator. Light *bands* are added to that texture
 *             every frame and the PMREM is rebuilt, so the sweep is a real moving softbox in the environment.
 *   floor     a mirrored copy of the word under y = 0 whose vertex colours fade with height (metal × vertex colour =
 *             darker reflection), under a transparent floor whose alpha grows toward the camera and dissolves far away.
 *   flare     screen-space sprites (glow, star, anamorphic streak, ghosts) placed where the band crosses a known corner;
 *             the band's position on the letters is solved analytically from the camera and the band's azimuth.
 *   subtitle  DOM: gold rules draw out, the line wipes in, and the same light band glints over it.
 * Moves: ① macro glide on the ring of 「오」 (first light) ② pull-out while both lines swing into place
 * ③ lock-in ④ the light sweep + flare, then the held lock-up. Every value is a closed form of t.
 */
import * as THREE from '../node_modules/three/build/three.module.js';
import { defineDemo, rand, clamp, lerp, smooth, ramp, ease, track } from '../_lib/stage.js';
import { fontReady, loadOutlineFont, outlineContours } from '../_lib/type.js';

const D = 9;
const SW = 1080, SH = 1920;

// ---------------------------------------------------------------- timeline (s)
const T_GLINT = 0.62;                   // ① first light runs along the ring edge
const T_PULL0 = 1.55, T_PULL1 = 3.8;    // ② pull-out + swing-in
const T_LAND1 = 3.45, T_LAND2 = 3.82;   // ③ the lines lock in (chrome, then gold)
const T_RULE = 4.0, T_SUB0 = 4.12, T_SUB1 = 4.78;
const T_SW0 = 4.55, T_PEAK = 5.4, T_SW1 = 6.25;   // ④ the light sweep; flare peak = poster time (0.6 · D)
const T_TWINKLE = 7.55;

// ---------------------------------------------------------------- type + bevel (world units)
const LINES = [
  { text: '오늘의', size: 2.2, gold: false, spacing: -0.03 },
  { text: '발견', size: 3.8, gold: true, spacing: -0.025 },
];
const LINE_GAP = 0.5;
const REFL_H = 2.3;                      // height above the floor where the reflection has faded out
const DEPTH = 0.56, BEV_T = 0.1, BEV_S = 0.07, BEV_OFF = -0.025, BEV_SEG = 3;
const HALF = DEPTH / 2 + BEV_T;          // front cap at z = +HALF (line space)
const EXT = BEV_S + BEV_OFF;             // how far the side walls stand outside the outline
const SUB_HTML = '작은 질문에서 시작하는 <b>1분</b> 과학';
const SUB_TEXT = '작은 질문에서 시작하는 1분 과학';

// ---------------------------------------------------------------- camera
const D_HOLD = 26.5, FOV_HOLD = 30, FOV_MACRO = 44;
const VIEW_SHIFT = 70;                   // lens shift (px): the lock-up sits above centre, leaving room for floor + subtitle

// ---------------------------------------------------------------- environment (HDR equirect, then PMREM)
const EW = 512, EH = 256;
const BAND_TILT = 0.16;                  // the band is a slanted stripe: centre azimuth shifts with elevation
const HORIZON = -0.1;                    // elevation of the studio's horizon cut
const DOME = 0.13;                       // cap normals tilt ±DOME rad from the bottom to the top of each line

const inPoly = (pts, x, y) => {
  let c = false;
  for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
    const xi = pts[i], yi = pts[i + 1], xj = pts[j], yj = pts[j + 1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const wrapPi = (a) => a - Math.PI * 2 * Math.floor((a + Math.PI) / (Math.PI * 2));
const box = (x, a, b, s) => smooth((x - a + s) / (2 * s)) * (1 - smooth((x - b + s) / (2 * s)));
const bump = (x, w) => (x <= 0 ? 0 : (x / w) * Math.exp(1 - x / w));        // 0 → peak 1 at x = w → 0

// the static studio, seen from the word: az = atan2(x, z) (0 = toward the camera side), el = asin(y)
function studio(az, el) {
  let r, g, b;
  // base: cool dark sky, darker floor, a faint lift at the horizon
  const hz = Math.exp(-(((el - 0.02) / 0.22) ** 2));
  if (el > 0) { const k = 0.022 + 0.05 * hz; r = k * 0.82; g = k * 0.9; b = k * 1.12; }
  else { const k = 0.008 + 0.03 * hz; r = k * 1.05; g = k * 0.95; b = k * 0.9; }
  const A = Math.abs(az);
  // ① front fill behind the camera: bright "sky" over a crisp horizon cut, darker "ground" below — the chrome line.
  //    The caps are slightly domed (see domeCaps), so each line reflects el ≈ −0.45…+0.2 and the cut crosses both lines.
  {
    const w = box(az, -0.7, 0.7, 0.14) * box(el, -0.75, 0.75, 0.1);
    const sky = smooth((el - HORIZON) / 0.006);
    const gap = Math.exp(-(((el - HORIZON + 0.012) / 0.007) ** 2));
    const v = w * (sky * (1.3 + 1.5 * smooth((el - HORIZON) / 0.45)) + (1 - sky) * (0.055 + 0.2 * smooth((HORIZON - el - 0.03) / 0.4)) * (1 - 0.85 * gap));
    const warm = 1 - sky;
    r += v * (0.95 + 0.12 * warm); g += v * (0.99 - 0.01 * warm); b += v * (1.06 - 0.16 * warm);
    const lip = 3.0 * w * Math.exp(-(((el - HORIZON - 0.008) / 0.004) ** 2));   // a bright lip right on the cut
    r += lip; g += lip; b += lip;
  }
  // ② overhead softbox (top bevels)
  { const v = 2.6 * box(el, 0.92, 1.38, 0.06) * box(az, -1.2, 1.2, 0.2); r += v; g += v; b += v * 1.03; }
  // ③ key strip, left front (left-facing bevels)
  { const v = 4.2 * box(az, -1.22, -1.06, 0.025) * box(el, -0.12, 0.95, 0.05); r += v; g += v * 0.99; b += v * 0.97; }
  // ④ rim strip, right back
  { const v = 3.2 * box(az, 2.0, 2.14, 0.025) * box(el, 0.02, 0.85, 0.05); r += v * 0.92; g += v * 0.97; b += v * 1.08; }
  // ⑤ a thin bright line just above the horizon around the front (crisp glints on curved bevels)
  { const v = 2.4 * Math.exp(-(((el - 0.17) / 0.012) ** 2)) * box(A, -1, 1.35, 0.15); r += v; g += v; b += v; }
  // ⑥ warm floor bounce in front (the only warm light: it keeps the gold alive from below)
  { const v = 0.16 * box(el, -0.7, -0.06, 0.1) * box(az, -0.9, 0.9, 0.3); r += v * 1.2; g += v * 0.85; b += v * 0.55; }
  return [r, g, b];
}

// ---------------------------------------------------------------- glyph → extruded, bevelled mesh geometry
function buildGlyph(g, k) {
  const cs = g.contours.filter((c) => Math.abs(c.area) > 4);
  if (!cs.length) return null;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const c of cs) for (let i = 0; i < c.pts.length; i += 2) {
    const x = c.pts[i] * k, y = -c.pts[i + 1] * k;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const v2 = (pts) => { const a = []; for (let i = 0; i < pts.length; i += 2) a.push(new THREE.Vector2(pts[i] * k - cx, -pts[i + 1] * k - cy)); return a; };
  // outer contours share the sign of the largest one; the opposite winding is a hole, owned by the smallest outer around it
  const big = cs.reduce((a, c) => (Math.abs(c.area) > Math.abs(a.area) ? c : a));
  const so = Math.sign(big.area);
  const outers = cs.filter((c) => Math.sign(c.area) === so).map((c) => ({ c, shape: new THREE.Shape(v2(c.pts)), holes: 0 }));
  for (const h of cs.filter((c) => Math.sign(c.area) !== so)) {
    let best = null;
    for (const o of outers) if (inPoly(o.c.pts, h.pts[0], h.pts[1]) && (!best || Math.abs(o.c.area) < Math.abs(best.c.area))) best = o;
    best = best || outers[0];
    best.shape.holes.push(new THREE.Path(v2(h.pts)));
    best.holes++;
  }
  const geo = new THREE.ExtrudeGeometry(outers.map((o) => o.shape), {
    depth: DEPTH, bevelEnabled: true, bevelThickness: BEV_T, bevelSize: BEV_S, bevelOffset: BEV_OFF,
    bevelSegments: BEV_SEG, curveSegments: 1, steps: 1,
  });
  geo.translate(0, 0, -DEPTH / 2);       // z ∈ [−HALF, +HALF], the +z cap faces the camera
  smoothSides(geo, (40 * Math.PI) / 180);
  // sharp convex corners of the outer outlines (glint anchors), in glyph-local coordinates
  const corners = [];
  for (const o of outers) {
    const p = o.c.pts, n = p.length / 2;
    const ori = -Math.sign(o.c.area);    // orientation in y-up space
    for (let i = 0; i < n; i++) {
      const a = (i + n - 1) % n, b = (i + 1) % n;
      const ex = p[i * 2] - p[a * 2], ey = -(p[i * 2 + 1] - p[a * 2 + 1]);
      const fx = p[b * 2] - p[i * 2], fy = -(p[b * 2 + 1] - p[i * 2 + 1]);
      const cr = ex * fy - ey * fx, dt = ex * fx + ey * fy;
      const L = Math.hypot(ex, ey) * Math.hypot(fx, fy);
      if (L < 1e-6 || Math.sign(cr) !== ori) continue;
      if (Math.atan2(Math.abs(cr), dt) > 1.15) corners.push([p[i * 2] * k - cx, -p[i * 2 + 1] * k - cy]);
    }
  }
  // the ring (an outer contour with a hole) — the macro shot starts on its top edge
  const ring = outers.find((o) => o.holes > 0);
  let ringTop = null;
  if (ring) {
    const p = ring.c.pts;
    for (let i = 0; i < p.length; i += 2) {
      const x = p[i] * k - cx, y = -p[i + 1] * k - cy;
      if (!ringTop || y > ringTop[1]) ringTop = [x, y];
    }
    let rx0 = Infinity, rx1 = -Infinity, ry0 = Infinity;
    for (let i = 0; i < p.length; i += 2) { rx0 = Math.min(rx0, p[i] * k - cx); rx1 = Math.max(rx1, p[i] * k - cx); ry0 = Math.min(ry0, -p[i + 1] * k - cy); }
    ringTop.push((rx0 + rx1) / 2, (ringTop[1] + ry0) / 2, (rx1 - rx0) / 2);   // [xTop, yTop, cx, cy, radius]
  }
  return { geo, cx, cy, x0, x1, y0, y1, corners, ringTop };
}

/* ExtrudeGeometry returns flat normals. Caps (group 0) stay flat; side + bevel faces (group 1) are smoothed with every
   neighbour whose face normal is within `crease`, so the round bevel and the curves read smooth while corners stay sharp. */
function smoothSides(geo, crease) {
  const P = geo.attributes.position.array, N = geo.attributes.normal.array;
  const cosC = Math.cos(crease);
  const tris = [];
  for (const g of geo.groups) if (g.materialIndex === 1) for (let v = g.start; v < g.start + g.count; v += 3) tris.push(v);
  const fn = new Float64Array(tris.length * 3);
  const map = new Map();
  const key = (v) => `${Math.round(P[v * 3] * 4e4)},${Math.round(P[v * 3 + 1] * 4e4)},${Math.round(P[v * 3 + 2] * 4e4)}`;
  tris.forEach((v, i) => {
    const ax = P[v * 3], ay = P[v * 3 + 1], az = P[v * 3 + 2];
    const ux = P[v * 3 + 3] - ax, uy = P[v * 3 + 4] - ay, uz = P[v * 3 + 5] - az;
    const wx = P[v * 3 + 6] - ax, wy = P[v * 3 + 7] - ay, wz = P[v * 3 + 8] - az;
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    const l = Math.hypot(nx, ny, nz);
    if (l > 1e-12) { fn[i * 3] = nx / l; fn[i * 3 + 1] = ny / l; fn[i * 3 + 2] = nz / l; }
    for (let c = 0; c < 3; c++) {
      const kk = key(v + c);
      let list = map.get(kk);
      if (!list) map.set(kk, (list = []));
      list.push(i);
    }
  });
  tris.forEach((v, i) => {
    const nx = fn[i * 3], ny = fn[i * 3 + 1], nz = fn[i * 3 + 2];
    if (!nx && !ny && !nz) return;
    for (let c = 0; c < 3; c++) {
      let sx = 0, sy = 0, sz = 0;
      for (const j of map.get(key(v + c))) {
        const mx = fn[j * 3], my = fn[j * 3 + 1], mz = fn[j * 3 + 2];
        if (nx * mx + ny * my + nz * mz >= cosC) { sx += mx; sy += my; sz += mz; }
      }
      const s = Math.hypot(sx, sy, sz) || 1;
      N[(v + c) * 3] = sx / s; N[(v + c) * 3 + 1] = sy / s; N[(v + c) * 3 + 2] = sz / s;
    }
  });
  geo.attributes.normal.needsUpdate = true;
}

/* Domed caps: the front cap's normals lean up toward the top of the line and down toward its bottom (a cylinder about a
   horizontal axis, no change in shape). A flat cap far from the lens reflects only a sliver of the studio; the dome makes
   each line sweep about 0.5 rad of it, so the horizon cut runs across the whole word like a polished, slightly convex face. */
function domeCaps(geo, y0, y1, gy) {
  const P = geo.attributes.position.array, N = geo.attributes.normal.array;
  const yc = (y0 + y1) / 2, kk = (2 * DOME) / (y1 - y0);
  for (const g of geo.groups) {
    if (g.materialIndex !== 0) continue;
    for (let v = g.start; v < g.start + g.count; v++) {
      const sz = Math.sign(N[v * 3 + 2]);
      const ny = (gy + P[v * 3 + 1] - yc) * kk;
      const l = Math.hypot(ny, 1);
      N[v * 3] = 0; N[v * 3 + 1] = ny / l; N[v * 3 + 2] = sz / l;
    }
  }
  geo.attributes.normal.needsUpdate = true;
}

/* Split every edge longer than maxLen at its midpoint (longest first), for a non-indexed geometry with groups. Each long
   edge is cut at the same midpoints from both sides, so no cracks open. Keeps winding; normals are averaged.
   keep(a, b, c) may drop finished triangles. */
function splitLong(geo, maxLen, keep = null) {
  const P = geo.attributes.position.array, N = geo.attributes.normal.array;
  const op = [], on = [], groups = [], m2 = maxLen * maxLen;
  const V = (i) => [P[i * 3], P[i * 3 + 1], P[i * 3 + 2], N[i * 3], N[i * 3 + 1], N[i * 3 + 2]];
  const mid = (a, b) => {
    const nx = a[3] + b[3], ny = a[4] + b[4], nz = a[5] + b[5], l = Math.hypot(nx, ny, nz) || 1;
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, nx / l, ny / l, nz / l];
  };
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  const rec = (a, b, c, depth) => {
    const ab = d2(a, b), bc = d2(b, c), ca = d2(c, a), m = Math.max(ab, bc, ca);
    if (m <= m2 || depth > 14) {
      if (keep && !keep(a, b, c)) return;
      for (const v of [a, b, c]) { op.push(v[0], v[1], v[2]); on.push(v[3], v[4], v[5]); }
      return;
    }
    if (m === ab) { const d = mid(a, b); rec(a, d, c, depth + 1); rec(d, b, c, depth + 1); }
    else if (m === bc) { const d = mid(b, c); rec(a, b, d, depth + 1); rec(a, d, c, depth + 1); }
    else { const d = mid(c, a); rec(a, b, d, depth + 1); rec(d, b, c, depth + 1); }
  };
  for (const g of geo.groups) {
    const start = op.length / 3;
    for (let v = g.start; v < g.start + g.count; v += 3) rec(V(v), V(v + 1), V(v + 2), 0);
    groups.push([start, op.length / 3 - start, g.materialIndex]);
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(op, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(on, 3));
  for (const [a, b, c] of groups) out.addGroup(a, b, c);
  return out;
}

// ---------------------------------------------------------------- sprite textures (setup only)
function spriteTex(size, draw, headless) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  draw(g, size);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}
const radial = (g, s, stops) => {
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  for (const [o, c] of stops) gr.addColorStop(o, c);
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
};

defineDemo({
  id: '111-chrome-sting',
  title: '오늘의 발견',
  tech: '방송 타이틀 스팅 · 금속 입체 글자 + 반사 + 빛 쓸기',
  duration: D,
  background: '#05070b',

  async setup(api) {
    const HL = api.headless;
    await fontReady('600 40px "Pretendard Variable"', SUB_TEXT);
    const font = await loadOutlineFont('Pretendard-Black');

    // ---- renderer
    const el = api.layer('canvas', { z: 0 });
    el.width = SW; el.height = SH;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(SW, SH, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV_HOLD, SW / SH, 0.03, 400);

    // ---- environment: static studio baked once, bands added per frame
    const envStatic = new Float32Array(EW * EH * 3);
    const envHalf0 = new Uint16Array(EW * EH * 4);
    const AZ = new Float32Array(EW * EH), ELV = new Float32Array(EH);
    for (let j = 0; j < EH; j++) {
      const e = ((j + 0.5) / EH - 0.5) * Math.PI;
      ELV[j] = e;
      for (let i = 0; i < EW; i++) {
        const ph = ((i + 0.5) / EW - 0.5) * Math.PI * 2;          // three's equirectUv: u ↔ atan(z, x)
        const x = Math.cos(e) * Math.cos(ph), z = Math.cos(e) * Math.sin(ph);
        const a = Math.atan2(x, z);
        const q = j * EW + i;
        AZ[q] = a;
        const [r, g, b] = studio(a, e);
        envStatic[q * 3] = r; envStatic[q * 3 + 1] = g; envStatic[q * 3 + 2] = b;
        envHalf0[q * 4] = THREE.DataUtils.toHalfFloat(r);
        envHalf0[q * 4 + 1] = THREE.DataUtils.toHalfFloat(g);
        envHalf0[q * 4 + 2] = THREE.DataUtils.toHalfFloat(b);
        envHalf0[q * 4 + 3] = 0x3c00;
      }
    }
    const envHalf = new Uint16Array(EW * EH * 4);
    const envTex = new THREE.DataTexture(envHalf, EW, EH, THREE.RGBAFormat, THREE.HalfFloatType);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    envTex.colorSpace = THREE.LinearSRGBColorSpace;
    envTex.magFilter = THREE.LinearFilter; envTex.minFilter = THREE.LinearFilter;
    envTex.generateMipmaps = false;
    envHalf.set(envHalf0);
    envTex.needsUpdate = true;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromEquirectangular(envTex);

    // ---- materials: cap (front/back) and side/bevel per metal; mirror twins fade with vertex colours
    const mk = (hex, rough, vc = false) => new THREE.MeshStandardMaterial({ color: hex, metalness: 1, roughness: rough, vertexColors: vc });
    const MAT = {
      chrome: [mk('#e6ebf2', 0.07), mk('#dfe5ee', 0.06)],
      gold: [mk('#f9c47a', 0.09), mk('#f4b766', 0.07)],
    };
    const MIR = { chrome: [mk('#e6ebf2', 0.07, true), mk('#dfe5ee', 0.06, true)], gold: [mk('#f9c47a', 0.09, true), mk('#f4b766', 0.07, true)] };
    const allMats = [...MAT.chrome, ...MAT.gold], mirMats = [...MIR.chrome, ...MIR.gold];
    // the PMREM goes on each material (not scene.environment) so envMapIntensity per material is honoured
    for (const m of [...allMats, ...mirMats]) m.envMap = envRT.texture;

    // ---- the word
    const word = new THREE.Group(), mirror = new THREE.Group();
    mirror.matrixAutoUpdate = false;
    mirror.matrix.makeScale(1, -1, 1);       // the floor is y = 0
    scene.add(word, mirror);
    const lines = [];
    for (const L of LINES) {
      const k = L.size / 100;
      const laid = outlineContours(font, L.text, 0, 0, 100, { tol: 0.12, letterSpacing: L.spacing * 100 });
      const glyphs = laid.map((g) => buildGlyph(g, k)).filter(Boolean);
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const g of glyphs) { x0 = Math.min(x0, g.x0); x1 = Math.max(x1, g.x1); y0 = Math.min(y0, g.y0); y1 = Math.max(y1, g.y1); }
      lines.push({ L, glyphs, x0: x0 - EXT, x1: x1 + EXT, y0: y0 - EXT, y1: y1 + EXT });
    }
    // stack: 「발견」 stands on the floor, 「오늘의」 above it; both centred
    lines[1].yOff = -lines[1].y0;
    lines[0].yOff = lines[1].yOff + lines[1].y1 + LINE_GAP - lines[0].y0;
    for (const ln of lines) {
      ln.xOff = -(ln.x0 + ln.x1) / 2;
      ln.group = new THREE.Group(); ln.mgroup = new THREE.Group();
      ln.group.position.set(0, ln.yOff, 0);
      word.add(ln.group); mirror.add(ln.mgroup);
      const mats = ln.L.gold ? MAT.gold : MAT.chrome, mmats = ln.L.gold ? MIR.gold : MIR.chrome;
      ln.meshes = []; ln.mmeshes = [];
      for (const g of ln.glyphs) {
        domeCaps(g.geo, ln.y0, ln.y1, g.cy);
        const m = new THREE.Mesh(g.geo, mats);
        m.position.set(g.cx + ln.xOff, g.cy, 0);
        ln.group.add(m); ln.meshes.push(m);
        // reflection (the standing line only): long cap edges split so the height fade is not smeared across a glyph
        if (!ln.L.gold) continue;
        // the fade reaches exactly 0 at REFL_H (an HDR band would still show through a 1 % tint) and what lies above is dropped
        const base = ln.yOff + g.cy;
        const mg = splitLong(g.geo, 0.2, (a, b, c) => base + Math.min(a[1], b[1], c[1]) < REFL_H);
        const pos = mg.attributes.position.array, col = new Float32Array(pos.length);
        for (let i = 0; i < pos.length; i += 3) {
          const h = clamp((base + pos[i + 1]) / REFL_H);
          col[i] = col[i + 1] = col[i + 2] = 0.5 * (1 - h) * (1 - h) * (1 - h);
        }
        mg.setAttribute('color', new THREE.BufferAttribute(col, 3));
        const mm = new THREE.Mesh(mg, mmats);
        mm.position.copy(m.position);
        ln.mgroup.add(mm); ln.mmeshes.push(mm);
      }
    }
    const lockTop = lines[0].yOff + lines[0].y1;
    const lockMid = lockTop * 0.5;

    // anchors (line-local, z on the front cap)
    const anchor = (li, gi, xy) => {
      const ln = lines[li], g = ln.glyphs[gi];
      return new THREE.Vector3(g.cx + ln.xOff + xy[0], g.cy + xy[1], HALF);
    };
    const R0 = lines[0].glyphs[0].ringTop;                     // 「오」's ring
    const ring = { cx: R0[2], cy: R0[3], r: R0[4] };
    const ringPoint = (ang) => {                               // a point on the ring's outer bevel edge, line-1 local
      const g = lines[0].glyphs[0];
      return new THREE.Vector3(g.cx + lines[0].xOff + ring.cx + Math.cos(ang) * ring.r, g.cy + ring.cy + Math.sin(ang) * ring.r, HALF - BEV_T * 0.4);
    };

    const ringCentre = ringPoint(0).add(new THREE.Vector3(-ring.r, 0, 0));

    // ---- motion tracks
    const swing = (from, land, over) => track([[0, from], [T_PULL0, from * 0.86, (p) => p], [land - 0.02, over], [land + 0.42, 0]]);
    const Y1 = swing(-0.62, T_LAND1, 0.03), Y2 = swing(-1.05, T_LAND2, 0.04);
    const lnDist = track([[0, Math.log(1.7)], [T_PULL0, Math.log(1.2), (p) => p], [T_PULL1, Math.log(D_HOLD), ease.inOutCubic], [D, Math.log(D_HOLD * 0.955), (p) => p]]);
    const uPose = (t) => ease.inOutCubic(clamp((t - T_PULL0) / (T_PULL1 - 0.25 - T_PULL0)));
    const ringAng = track([[0, 2.45], [T_PULL0 + 0.6, 1.05, (p) => p]]);
    const fov = track([[0, FOV_MACRO], [T_PULL0, FOV_MACRO - 2, (p) => p], [T_PULL1, FOV_HOLD, ease.inOutCubic]]);
    const E = track([[0, 0.0], [0.45, 0.88, ease.outCubic], [T_PULL1, 0.9], [T_LAND2 + 0.12, 1.0], [D, 1.0]]);

    const _v = new THREE.Vector3(), _w = new THREE.Vector3();
    // camera pose at t → { pos, look, fov, roll }
    function pose(t, out) {
      const y1 = Y1(t);
      // macro: glued to the ring's top edge of 「오」 (line-1 local → world)
      const rp = ringPoint(ringAng(t)).lerp(ringCentre, 0.3);
      const lm = rp.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), y1).add(new THREE.Vector3(0, lines[0].yOff, 0));
      const azM = y1 + 0.62 - 0.14 * clamp(t / T_PULL0), elM = -0.1 + 0.04 * clamp(t / T_PULL0);
      const lh = new THREE.Vector3(0.0, lockMid + 0.05, HALF);
      const u = uPose(t);
      const hold = smooth((t - T_PULL1) / (D - T_PULL1));
      const azH = 0.0 + 0.022 * hold, elH = 0.12 + 0.008 * hold;
      const look = lm.lerp(lh, ease.inOutCubic(clamp(u * 1.08)));
      const az = lerp(azM, azH, u), elv = lerp(elM, elH, u);
      let dist = Math.exp(lnDist(t));
      dist *= 1 - 0.018 * bump(t - T_LAND2, 0.09) * Math.exp(-(t - T_LAND2) * 1.5);   // lock-in punch
      out.pos.set(look.x + dist * Math.sin(az) * Math.cos(elv), look.y + dist * Math.sin(elv), look.z + dist * Math.cos(az) * Math.cos(elv));
      out.look.copy(look);
      out.fov = fov(t);
      out.roll = lerp(lerp(-0.16, -0.08, clamp(t / T_PULL0)), 0, smooth((t - T_PULL0 - 0.3) / 1.6));
      out.shift = VIEW_SHIFT * smooth((t - T_PULL0 - 0.4) / 1.8);
      return out;
    }
    const P = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 0, roll: 0, shift: 0 };
    function applyCamera(t) {
      pose(t, P);
      camera.fov = P.fov;
      camera.position.copy(P.pos);
      camera.up.set(0, 1, 0);
      camera.lookAt(P.look);
      camera.rotateZ(P.roll);
      camera.setViewOffset(SW, SH, 0, P.shift, SW, SH);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
    }

    // ---- light bands: s = az + BAND_TILT · el; a band is { s0, w, I, elLo, elHi }
    // where the band crosses the front cap (normal +z, word at rest): the reflection of the eye ray off the cap
    const sOf = (p, cam) => {
      const rx = p.x - cam.x, ry = p.y - cam.y, rz = cam.z - p.z;
      return Math.atan2(rx, rz) + BAND_TILT * Math.atan2(ry, Math.hypot(rx, rz));
    };
    // flare anchor: the top-right corner of 「견」 (gold); sweep timed so the band crosses it at T_PEAK
    const gK = lines[1].glyphs[1];
    const fc = gK.corners.reduce((a, c) => (c[1] + 0.35 * c[0] > a[1] + 0.35 * a[0] ? c : a));
    const FLARE = anchor(1, 1, fc).add(new THREE.Vector3(0, lines[1].yOff, 0));
    pose(T_PEAK, P);
    const S_FLARE = sOf(FLARE, P.pos);
    const SWEEP = 0.32;
    const sweepS = (t) => S_FLARE + SWEEP * (2 * smooth((t - T_SW0) / (T_SW1 - T_SW0)) - 1);
    const sweepI = (t) => 20 * ramp(t, T_SW0 - 0.05, T_SW0 + 0.25) * (1 - ramp(t, T_SW1 - 0.3, T_SW1 + 0.05));
    function bands(t) {
      const out = [];
      // ① first light: a tall band drifting across the front while the camera hugs the ring
      const a = ramp(t, 0.05, 0.4) * (1 - ramp(t, 1.5, 2.2));
      if (a > 0) out.push({ s0: lerp(-1.1, 1.0, smooth((t - 0.05) / 1.9)), w: 0.07, I: 7 * a, elLo: -0.3, elHi: 1.3 });
      // ④ the sweep
      const b = sweepI(t);
      if (b > 0) out.push({ s0: sweepS(t), w: 0.024, I: b, elLo: -0.5, elHi: 0.62 });
      // the hold: a dim band idling back across (keeps the reflections alive)
      const c = ramp(t, 6.6, 7.4) * (1 - ramp(t, 8.6, 9.2));
      if (c > 0) out.push({ s0: lerp(0.45, -0.25, (t - 6.6) / 2.6), w: 0.06, I: 1.6 * c, elLo: -0.3, elHi: 0.5 });
      return out;
    }
    function updateEnv(t) {
      envHalf.set(envHalf0);
      const list = bands(t);
      for (let j = 0; j < EH; j++) {
        const e = ELV[j];
        let any = false;
        for (const B of list) if (e > B.elLo - 0.1 && e < B.elHi + 0.1) any = true;
        if (!any) continue;
        for (let i = 0; i < EW; i++) {
          const q = j * EW + i, a = AZ[q];
          let add = 0;
          for (const B of list) {
            if (e < B.elLo - 0.1 || e > B.elHi + 0.1) continue;
            const d = wrapPi(a + BAND_TILT * e - B.s0) / B.w;
            if (d > 4 || d < -4) continue;
            add += B.I * Math.exp(-d * d) * box(e, B.elLo, B.elHi, 0.08);
          }
          if (add < 1e-4) continue;
          envHalf[q * 4] = THREE.DataUtils.toHalfFloat(envStatic[q * 3] + add);
          envHalf[q * 4 + 1] = THREE.DataUtils.toHalfFloat(envStatic[q * 3 + 1] + add);
          envHalf[q * 4 + 2] = THREE.DataUtils.toHalfFloat(envStatic[q * 3 + 2] + add * 1.04);
        }
      }
      envTex.needsUpdate = true;
      pmrem.fromEquirectangular(envTex, envRT);
    }

    // ---- backdrop: a screen-space gradient (drawn once) + a glow plane far behind the word (parallax)
    const bgScene = new THREE.Scene();
    const ortho = new THREE.OrthographicCamera(0, SW, 0, -SH, -10, 10);
    const bgTex = spriteTex(512, (g, s) => {
      const lg = g.createLinearGradient(0, 0, 0, s);
      lg.addColorStop(0, '#020305'); lg.addColorStop(0.28, '#070a10'); lg.addColorStop(0.42, '#0b0f17');
      lg.addColorStop(0.58, '#06080c'); lg.addColorStop(1, '#020304');
      g.fillStyle = lg; g.fillRect(0, 0, s, s);
      const rg = g.createRadialGradient(s * 0.5, s * 0.34, 0, s * 0.5, s * 0.34, s * 0.42);
      rg.addColorStop(0, 'rgba(70,90,120,.2)'); rg.addColorStop(1, 'rgba(70,90,120,0)');
      g.fillStyle = rg; g.fillRect(0, 0, s, s);
      // a faint top-light beam falling on the word (the overhead softbox the bevels reflect)
      g.filter = 'blur(9px)';
      const bm = g.createLinearGradient(0, 0, 0, s * 0.55);
      bm.addColorStop(0, 'rgba(150,175,210,.10)'); bm.addColorStop(1, 'rgba(150,175,210,0)');
      g.fillStyle = bm;
      g.beginPath(); g.moveTo(s * 0.4, 0); g.lineTo(s * 0.6, 0); g.lineTo(s * 0.88, s * 0.55); g.lineTo(s * 0.12, s * 0.55); g.fill();
      g.filter = 'none';
    }, HL);
    const bgMat = new THREE.MeshBasicMaterial({ map: bgTex, toneMapped: false, depthTest: false, depthWrite: false });
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), bgMat);
    bg.position.set(SW / 2, -SH / 2, 0);
    bgScene.add(bg);

    const glowTex = spriteTex(256, (g, s) => radial(g, s, [[0, 'rgba(255,255,255,1)'], [0.22, 'rgba(255,255,255,.55)'], [0.5, 'rgba(255,255,255,.16)'], [1, 'rgba(255,255,255,0)']]), HL);
    const softTex = spriteTex(256, (g, s) => radial(g, s, [[0, 'rgba(255,255,255,1)'], [0.45, 'rgba(255,255,255,.45)'], [1, 'rgba(255,255,255,0)']]), HL);
    const addMat = (map, color, opacity = 1) => new THREE.MeshBasicMaterial({ map, color, opacity, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const backGlow = new THREE.Mesh(new THREE.PlaneGeometry(90, 46), addMat(softTex, new THREE.Color(0.16, 0.2, 0.27)));
    backGlow.position.set(0, 6.5, -42);
    scene.add(backGlow);

    // ---- floor: transparent dark plane (alpha grows toward the camera, dissolves far away) + a light pool
    const floorTex = (() => {
      const N = 512, c = document.createElement('canvas');
      c.width = c.height = N;
      const g = c.getContext('2d', HL ? { willReadFrequently: true } : undefined);
      const im = g.createImageData(N, N);
      for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) {
        const x = -80 + (160 * (px + 0.5)) / N, z = -80 + (160 * (py + 0.5)) / N;
        let a = 0.5 + 0.43 * smooth((z + 0.5) / 11) - 0.5 * smooth((-z - 2) / 26);   // darker toward the lens, open far away
        const far = smooth((Math.abs(x) - 16) / 30);
        a *= 1 - far;                                                     // and dissolves sideways into the backdrop
        const i = (py * N + px) * 4;
        im.data[i] = 5; im.data[i + 1] = 6; im.data[i + 2] = 9; im.data[i + 3] = Math.round(clamp(a) * 255);
      }
      g.putImageData(im, 0, 0);
      const tx = new THREE.CanvasTexture(c);
      tx.colorSpace = THREE.SRGBColorSpace;
      return tx;
    })();
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshBasicMaterial({ map: floorTex, transparent: true, depthWrite: false, toneMapped: false }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.0;
    floor.renderOrder = 1;
    scene.add(floor);
    const poolMat = addMat(softTex, new THREE.Color(0, 0, 0));
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(22, 9), poolMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, 0.004, 1.2);
    pool.renderOrder = 2;
    scene.add(pool);

    // ---- dust: world-fixed motes drifting slowly (closed form); a few big soft ones around the ring for the macro bokeh
    const R = rand(1111);
    const dust = [], bokeh = [];
    for (let i = 0; i < 150; i++) dust.push({ x: (R() * 2 - 1) * 15, y: R() * 13 - 0.5, z: -18 + R() * 30, ph: R() * 6.283, sp: 0.1 + R() * 0.25, b: 0.25 + R() * 0.75 });
    pose(0.8, P);
    const vf = P.look.clone().sub(P.pos).normalize(), vr = new THREE.Vector3().crossVectors(vf, new THREE.Vector3(0, 1, 0)).normalize();
    for (let i = 0; i < 18; i++) {
      const along = 0.5 + R() * 3.5, side = (R() * 2 - 1) * (0.4 + along * 0.45), up = (R() * 2 - 1) * (0.5 + along * 0.7);
      const q = P.pos.clone().addScaledVector(vf, along).addScaledVector(vr, side).add(new THREE.Vector3(0, up, 0));
      bokeh.push({ x: q.x, y: q.y, z: q.z, ph: R() * 6.283, sp: 0.04 + R() * 0.08, b: 0.3 + R() * 0.7 });
    }
    const pointsOf = (list, size, gain) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(list.length * 3), col = new Float32Array(list.length * 3);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size, map: softTex, vertexColors: true, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, toneMapped: false, sizeAttenuation: true }));
      pts.frustumCulled = false;
      pts.renderOrder = 3;
      scene.add(pts);
      return { list, geo, pos, col, gain };
    };
    const motes = [pointsOf(dust, 0.075, 0.5), pointsOf(bokeh, 0.3, 0.3)];

    // ---- flare + glints: screen-space sprites (ortho overlay, additive)
    const fx = new THREE.Scene();
    const starTex = spriteTex(512, (g, s) => {
      g.translate(s / 2, s / 2);
      const spike = (len, wid, rot, a) => {
        g.save(); g.rotate(rot);
        const lg = g.createLinearGradient(-len, 0, len, 0);
        lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, `rgba(255,255,255,${a})`); lg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = lg;
        g.beginPath(); g.moveTo(-len, 0); g.lineTo(0, -wid); g.lineTo(len, 0); g.lineTo(0, wid); g.fill();
        g.restore();
      };
      spike(s / 2, 7, 0, 1); spike(s / 2, 7, Math.PI / 2, 1);
      spike(s * 0.3, 4, Math.PI / 4, 0.55); spike(s * 0.3, 4, -Math.PI / 4, 0.55);
      const rg = g.createRadialGradient(0, 0, 0, 0, 0, s * 0.12);
      rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = rg; g.fillRect(-s / 2, -s / 2, s, s);
    }, HL);
    const streakTex = spriteTex(512, (g, s) => {
      const lg = g.createLinearGradient(0, 0, s, 0);
      lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,1)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = lg;
      g.fillRect(0, s / 2 - 3, s, 6);
      g.globalAlpha = 0.35; g.fillRect(0, s / 2 - 10, s, 20); g.globalAlpha = 1;
    }, HL);
    const ringTex = spriteTex(256, (g, s) => radial(g, s, [[0, 'rgba(255,255,255,.18)'], [0.72, 'rgba(255,255,255,.28)'], [0.86, 'rgba(255,255,255,.75)'], [0.94, 'rgba(255,255,255,.12)'], [1, 'rgba(255,255,255,0)']]), HL);
    const quad = new THREE.PlaneGeometry(1, 1);
    const sprite = (map) => { const m = new THREE.Mesh(quad, addMat(map, new THREE.Color(0, 0, 0))); m.visible = false; fx.add(m); return m; };
    const F = {
      halo: sprite(glowTex), core: sprite(glowTex), star: sprite(starTex), streak: sprite(streakTex), streak2: sprite(streakTex),
      ghosts: [0.55, 1.25, 1.55, 1.95, 2.35].map(() => sprite(ringTex)),
    };
    const GHOST = [[0.45, 54, [1.0, 0.62, 0.3], 0.13], [1.3, 120, [0.35, 0.7, 1.0], 0.05], [1.6, 36, [1.0, 0.85, 0.6], 0.12],
      [1.85, 170, [0.6, 0.45, 1.0], 0.03], [2.2, 70, [0.4, 1.0, 0.75], 0.05]];
    // corner glints: sharp convex corners on the top halves of the glyphs
    const RG = rand(4242);
    const glints = [];
    lines.forEach((ln, li) => ln.glyphs.forEach((g, gi) => {
      const cand = g.corners.filter((c) => c[1] > (g.y1 - g.y0) * 0.05);
      for (let n = 0; n < Math.min(3, cand.length); n++) {
        const c = cand.splice(Math.floor(RG() * cand.length), 1)[0];
        const p = anchor(li, gi, c).add(new THREE.Vector3(0, ln.yOff, 0));
        glints.push({ p, m: sprite(glowTex), s: sprite(starTex), size: 0.6 + RG() * 0.6, gold: ln.L.gold });
      }
    }));
    // the hold's twinkle: a top corner of 「늘」
    const gN = lines[0].glyphs[1];
    const tw = gN.corners.reduce((a, c) => (c[1] - 0.2 * c[0] > a[1] - 0.2 * a[0] ? c : a));
    const TWINKLE = anchor(0, 1, tw).add(new THREE.Vector3(0, lines[0].yOff, 0));
    const twStar = sprite(starTex), twGlow = sprite(glowTex);
    // first light: on the ring's top edge
    const fl = { star: sprite(starTex), glow: sprite(glowTex) };

    const toScreen = (p, out) => { _v.copy(p).project(camera); out.x = (_v.x + 1) * 0.5 * SW; out.y = (1 - _v.y) * 0.5 * SH; out.z = _v.z; return out; };
    const place = (m, x, y, w, h, rgb, k, rot = 0) => {
      if (k <= 0.002) { m.visible = false; return; }
      m.visible = true;
      m.position.set(x, -y, 0);
      m.scale.set(w, h, 1);
      m.rotation.z = rot;
      m.material.color.setRGB(rgb[0] * k, rgb[1] * k, rgb[2] * k);
    };

    // ---- subtitle (DOM)
    const ui = api.layer('div', { z: 5 });
    ui.style.pointerEvents = 'none';
    ui.innerHTML = `<div class="cs-sub"><div class="cs-rule l"></div><div class="cs-txt">${SUB_HTML}<span class="cs-glint">${SUB_HTML}</span></div><div class="cs-rule r"></div></div>`;
    const sub = ui.querySelector('.cs-sub'), txt = ui.querySelector('.cs-txt'), glintEl = ui.querySelector('.cs-glint');
    const ruleL = ui.querySelector('.cs-rule.l'), ruleR = ui.querySelector('.cs-rule.r');
    const txtW = txt.offsetWidth;

    Object.assign(this, {
      renderer, scene, camera, bgScene, ortho, fx, lines, mirror, word, allMats, mirMats, E, Y1, Y2, applyCamera, updateEnv, sOf, sweepS, sweepI,
      F, GHOST, glints, FLARE, S_FLARE, TWINKLE, twStar, twGlow, fl, toScreen, place, ringPoint, ringAng,
      bgMat, backGlow, poolMat, motes, sub, txt, glintEl, ruleL, ruleR, txtW, lockMid,
    });
  },

  frame(t) {
    const S = this;
    const e = S.E(t);

    // ---- light: env bands → PMREM; global level via envMapIntensity
    S.updateEnv(t);
    for (const m of S.allMats) m.envMapIntensity = e;
    for (const m of S.mirMats) m.envMapIntensity = e * 0.75;
    const lock = ramp(t, T_LAND2 - 0.15, T_LAND2 + 0.5);
    S.bgMat.color.setScalar(0.25 + 0.75 * e);
    S.backGlow.material.color.setRGB(0.012, 0.016, 0.024).multiplyScalar(e * (0.5 + 0.5 * lock));
    const swp = S.sweepI(t) / 20;
    S.poolMat.color.setRGB(0.1, 0.095, 0.085).multiplyScalar(e * (0.4 + 0.6 * lock) + 0.5 * swp);

    // ---- the word: each line swings into place (yaw only, so the floor contact holds)
    S.lines[0].group.rotation.y = S.Y1(t);
    S.lines[1].group.rotation.y = S.Y2(t);
    for (const ln of S.lines) { ln.mgroup.position.copy(ln.group.position); ln.mgroup.rotation.copy(ln.group.rotation); }

    S.applyCamera(t);
    const cam = S.camera;

    // ---- dust + bokeh
    for (const M of S.motes) {
      for (let i = 0; i < M.list.length; i++) {
        const m = M.list[i];
        M.pos[i * 3] = m.x + Math.sin(m.ph + t * m.sp) * 0.35;
        M.pos[i * 3 + 1] = m.y + t * m.sp * 0.25 + Math.sin(m.ph * 1.7 + t * 0.4) * 0.12;
        M.pos[i * 3 + 2] = m.z + Math.cos(m.ph + t * m.sp * 0.8) * 0.3;
        const k = m.b * e * (0.55 + 0.45 * Math.sin(m.ph * 3 + t * 1.3)) * M.gain;
        M.col[i * 3] = k * 0.85; M.col[i * 3 + 1] = k * 0.92; M.col[i * 3 + 2] = k;
      }
      M.geo.attributes.position.needsUpdate = true;
      M.geo.attributes.color.needsUpdate = true;
    }

    // ---- flare at the sweep's crossing of the 「견」 corner
    const scr = { x: 0, y: 0, z: 0 };
    const s0 = S.sweepS(t);
    const hit = swp > 0 ? Math.exp(-(((s0 - S.S_FLARE) / 0.1) ** 2)) * swp : 0;
    const tail = t > T_PEAK ? 0.3 * Math.exp(-(((t - T_PEAK) / 0.45) ** 2)) : 0;   // the flare lingers a moment after the peak
    const fk = Math.max(hit, tail);
    S.toScreen(S.FLARE, scr);
    const fxp = scr.x, fyp = scr.y;
    const spin = (t - T_PEAK) * 0.35;
    S.place(S.F.halo, fxp, fyp, 640, 640, [1.0, 0.78, 0.5], 0.32 * fk);
    S.place(S.F.core, fxp, fyp, 190, 190, [1.0, 0.95, 0.85], 1.2 * fk);
    S.place(S.F.star, fxp, fyp, 520 * (0.7 + 0.3 * hit), 520 * (0.7 + 0.3 * hit), [1.0, 0.96, 0.9], 1.1 * hit, spin);
    S.place(S.F.streak, fxp, fyp, 1500 * (0.6 + 0.4 * fk), 60, [0.55, 0.75, 1.0], 0.9 * fk);
    S.place(S.F.streak2, fxp, fyp, 700, 140, [1.0, 0.8, 0.55], 0.25 * fk);
    const cx = SW / 2, cy = SH * 0.5;
    S.F.ghosts.forEach((m, i) => {
      const [k, size, rgb, a] = S.GHOST[i];
      S.place(m, fxp + (cx - fxp) * k, fyp + (cy - fyp) * k, size, size, rgb, a * fk * 1.4);
    });
    // glints: each sharp corner flashes as the band passes over it
    for (const g of S.glints) {
      const k = swp > 0 ? Math.exp(-(((S.sOf(g.p, cam.position) - s0) / 0.05) ** 2)) * swp : 0;
      S.toScreen(g.p, scr);
      const rgb = g.gold ? [1.0, 0.82, 0.55] : [0.85, 0.92, 1.0];
      S.place(g.m, scr.x, scr.y, 120 * g.size, 120 * g.size, rgb, 0.55 * k);
      S.place(g.s, scr.x, scr.y, 170 * g.size, 170 * g.size, rgb, 0.5 * k, 0.2);
    }
    // the hold's twinkle
    {
      const k = Math.exp(-(((t - T_TWINKLE) / 0.2) ** 2));
      S.toScreen(S.TWINKLE, scr);
      S.place(S.twStar, scr.x, scr.y, 300, 300, [0.9, 0.95, 1.0], 0.85 * k, (t - T_TWINKLE) * 0.8);
      S.place(S.twGlow, scr.x, scr.y, 120, 120, [0.9, 0.95, 1.0], 0.6 * k);
    }
    // first light: a star on the ring edge where the opening band crosses it
    {
      const k = Math.exp(-(((t - T_GLINT) / 0.22) ** 2));
      const p = S.ringPoint(S.ringAng(t)).applyAxisAngle(new THREE.Vector3(0, 1, 0), S.Y1(t)).add(new THREE.Vector3(0, S.lines[0].yOff, 0));
      S.toScreen(p, scr);
      S.place(S.fl.star, scr.x, scr.y, 760, 760, [1.0, 0.97, 0.92], 0.9 * k, 0.15 + t * 0.3);
      S.place(S.fl.glow, scr.x, scr.y, 380, 380, [1.0, 0.9, 0.75], 0.5 * k);
    }

    // ---- render: backdrop, scene, flare
    const r = S.renderer;
    r.clear();
    r.render(S.bgScene, S.ortho);
    r.render(S.scene, cam);
    r.render(S.fx, S.ortho);

    // ---- subtitle: rules draw out, line wipes in, the band glints over it
    S.toScreen(new THREE.Vector3(0, 0, HALF), scr);
    const subY = scr.y + 118;
    S.sub.style.top = `${(subY - 30).toFixed(2)}px`;
    const rl = ease.outExpo(clamp((t - T_RULE) / 0.7));
    S.ruleL.style.transform = `scaleX(${rl.toFixed(4)})`;
    S.ruleR.style.transform = `scaleX(${rl.toFixed(4)})`;
    S.ruleL.style.opacity = S.ruleR.style.opacity = rl > 0 ? '1' : '0';
    const wp = ease.inOutCubic(clamp((t - T_SUB0) / (T_SUB1 - T_SUB0)));
    S.txt.style.clipPath = `inset(-30% ${((1 - wp) * 104 - 2).toFixed(3)}% -30% -2%)`;
    S.txt.style.transform = `translateX(${((1 - wp) * -18).toFixed(3)}px)`;
    // the band's screen x on the subtitle: where the band crosses the front plane at floor height
    let gx = -9999;
    if (swp > 0) {
      let lo = -30, hi = 30;
      const q = new THREE.Vector3(0, 0, HALF);
      for (let i = 0; i < 30; i++) { q.x = (lo + hi) / 2; if (S.sOf(q, cam.position) < s0) lo = q.x; else hi = q.x; }
      S.toScreen(q, scr);
      gx = scr.x - (SW - S.txtW) / 2;
    }
    S.glintEl.style.backgroundImage = `linear-gradient(100deg, rgba(255,240,210,0) ${(gx - 80).toFixed(1)}px, rgba(255,246,226,${swp.toFixed(3)}) ${gx.toFixed(1)}px, rgba(255,240,210,0) ${(gx + 80).toFixed(1)}px)`;
  },
});
