/*
 * 156 · 철새의 길 — a stylised three.js globe that follows shorebirds from an Arctic breeding ground across the Pacific.
 *
 *   land       world-atlas land-110m TopoJSON, decoded here (quantised, delta-encoded arcs + transform → rings), filled
 *              into an equirectangular canvas, rounded, and turned into a signed distance field (px) that the globe shader
 *              thresholds per pixel: crisp coasts at any zoom, a shallow-water halo, a bevel and a drop shadow from the
 *              same texture.
 *   light      one sun direction; the terminator is smoothstep(dot(N, sun)); night lights are points on land that only
 *              show where that dot product is negative. The sun turns with the globe's spin (the camera and sun are fixed
 *              in space, the earth turns under them).
 *   air        clouds on a shell (baked 3D simplex fbm, thresholded in the shader), and the atmosphere as a back-side
 *              additive fresnel shell whose |N·V| maps exactly to the ray's distance from the planet.
 *   arcs       great circles by slerp between unit vectors, lifted by sin(πs)·h, drawn as screen-space ribbons whose
 *              fragment shader cuts at a `uProg` uniform: bright head, fading tail, a thin line left behind.
 *   camera     overview (inertial orbit) → chase (behind the flock on the long arc, look-ahead target, eased roll) →
 *              arrival pull-back; poses are blended by direction slerp + log-radius + quaternion slerp.
 * Everything is a closed-form function of t; textures, lights and clouds are baked in setup.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { defineDemo, rand, clamp, lerp, ramp, ease, track } from '../_lib/stage.js';
import { fontReady, signedDistance } from '../_lib/type.js';

const D = 10;
const W = 1080, H = 1920;
const DEG = Math.PI / 180;
const EARTH_KM = 6371;
const Y = new THREE.Vector3(0, 1, 0);

// ---------------------------------------------------------------- palette: a few tokens + ONE accent (the arcs)
const C = {
  space: '#04071a',
  oceanDeep: '#1c5084', ocean: '#2a6ea3', shallow: '#56a9c6',
  land: '#bccf93', landIn: '#9fb97c', ice: '#eef2ef',
  nightOcean: '#091433', nightLand: '#1f3160',
  atmo: '#78bdff', atmoDeep: '#2f68d8',
  light: '#ffe0a3', star: '#dfe8ff',
  accent: '#ff6f45',
  bird: '#f6f1e8', wingIn: '#bfb2a1', wingOut: '#6c635b', bill: '#3a332e',
};

// ---------------------------------------------------------------- the story (example data)
const SITES = {
  nest:    { name: '번식지', sub: '알래스카 서부', lat: 61.0, lon: -163.5, side: 1 },
  yellow:  { name: '서해 갯벌', sub: '중간 기착', lat: 37.0, lon: 126.4, side: 1 },
  hawaii:  { name: '하와이', sub: '월동', lat: 21.3, lon: -157.9, side: 1 },
  roebuck: { name: '호주 북서부', sub: '월동', lat: -18.0, lon: 122.3, side: -1 },
  moreton: { name: '호주 동부', sub: '월동', lat: -27.4, lon: 153.3, side: -1 },
  nz:      { name: '뉴질랜드', sub: '월동', lat: -37.2, lon: 175.3, side: 1 },
};
// from, to, launch (s), flight time (s), velocity profile (accel, decel fractions)
const ROUTES = [
  ['nest', 'yellow', 1.9, 0.95, 0.3, 0.4],
  ['nest', 'hawaii', 2.2, 0.8, 0.3, 0.4],
  ['nest', 'moreton', 2.5, 1.3, 0.3, 0.4],
  ['yellow', 'roebuck', 2.95, 1.0, 0.3, 0.4],   // chained: leaves the stopover right after the first landing
  ['nest', 'nz', 4.0, 3.5, 0.16, 0.2],           // the long nonstop flight the camera follows
];
const HERO = 4;
const LIFT = 0.075;                     // arc height = LIFT · central angle (rad), in globe radii

// the sun: subsolar point at T_SUN, and the globe's spin (deg) — a fast eased turn into view, then 2°/s
const SUN_AT = [20, -95], T_SUN = 6.2;
const rotDeg = (t) => -62 * (1 - ease.outCubic(clamp(t / 2.6))) + 2.0 * (t - T_SUN);

// camera
const LON_O = -186;                     // overview: inertial longitude the camera looks from (at spin 0)
const FOV_O = 30, R_O = 480;            // overview field of view, globe radius on screen (px)
const distFor = (rpx, fov) => 1 / Math.sin(Math.atan((rpx * Math.tan((fov / 2) * DEG)) / (H / 2)));
const D_O = distFor(R_O, FOV_O);
const W1 = [4.35, 5.5];                 // overview → chase blend
const W2 = [7.05, 8.35];                // chase → arrival blend
const CH_BACK = 0.12, CH_UP = 0.1, CH_SIDE = 0.028, CH_LOOK = 0.085;   // chase rig: offsets (globe radii), look-ahead (arc fraction)
const D_F = distFor(430, FOV_O);        // final pull-back distance

// text (all Pretendard)
const TXT = {
  kick: '도요새의 가을 이동 · 예시 데이터',
  head: '번식지를 떠나 남쪽 바다로',
  ckick: '알래스카 → 뉴질랜드 · 쉬지 않고',
  unit: 'km',
  cnote: '예시 데이터',
  arrive: '뉴질랜드 도착',
  arriveSub: '약 9일 동안 한 번도 내려앉지 않았다 · 예시',
};

// ================================================================ helpers
const sph = (lat, lon, r = 1) => new THREE.Vector3(r * Math.cos(lat * DEG) * Math.sin(lon * DEG), r * Math.sin(lat * DEG), r * Math.cos(lat * DEG) * Math.cos(lon * DEG));

/** trapezoid velocity: accelerate over a, cruise, decelerate over b — position 0..1 */
function trap(x, a, b) {
  x = clamp(x);
  const v = 1 / (1 - a / 2 - b / 2);
  if (x < a) return (v * x * x) / (2 * a);
  if (x <= 1 - b) return v * (a / 2 + x - a);
  const y = 1 - x;
  return 1 - (v * y * y) / (2 * b);
}

/** rotate unit vector a toward unit vector b by fraction w of the angle between them (spherical interpolation) */
function slerpDir(a, b, w, out = new THREE.Vector3()) {
  const d = clamp(a.dot(b), -1, 1), th = Math.acos(d);
  if (th < 1e-5) return out.copy(a).lerp(b, w).normalize();
  const s = Math.sin(th), ka = Math.sin((1 - w) * th) / s, kb = Math.sin(w * th) / s;
  return out.set(a.x * ka + b.x * kb, a.y * ka + b.y * kb, a.z * ka + b.z * kb);
}

/*
 * TopoJSON → polygons of [lon, lat] rings, without topojson-client:
 *   arcs are integer pairs, delta-encoded (each point is the previous one plus [dx, dy]) and quantised; the transform
 *   turns the running sum into degrees: lon = x·scale[0] + translate[0], lat = y·scale[1] + translate[1].
 *   A ring is a list of arc indices; a negative index ~i means arc i reversed. Consecutive arcs share their joint
 *   point, so every arc after the first drops its first point.
 */
function decodeTopo(topo, name) {
  const [kx, ky] = topo.transform.scale, [tx, ty] = topo.transform.translate;
  const arcs = topo.arcs.map((arc) => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * kx + tx, y * ky + ty]; });
  });
  const ring = (ids) => {
    const out = [];
    for (const i of ids) {
      const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
      for (let k = out.length ? 1 : 0; k < a.length; k++) out.push(a[k]);
    }
    return out;
  };
  const polys = [];
  const walk = (g) => {
    if (g.type === 'GeometryCollection') g.geometries.forEach(walk);
    else if (g.type === 'Polygon') polys.push(g.arcs.map(ring));
    else if (g.type === 'MultiPolygon') for (const p of g.arcs) polys.push(p.map(ring));
  };
  walk(topo.objects[name]);
  return polys;
}

/** separable box blur, radius r, in place (edges clamped) */
function boxBlur(a, w, h, r) {
  const tmp = new Float32Array(Math.max(w, h)), n = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    const o = y * w;
    let s = 0;
    for (let k = -r; k <= r; k++) s += a[o + clamp(k, 0, w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[x] = s / n;
      s += a[o + Math.min(x + r + 1, w - 1)] - a[o + Math.max(x - r, 0)];
    }
    a.set(tmp.subarray(0, w), o);
  }
  for (let x = 0; x < w; x++) {
    let s = 0;
    for (let k = -r; k <= r; k++) s += a[clamp(k, 0, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      tmp[y] = s / n;
      s += a[Math.min(y + r + 1, h - 1) * w + x] - a[Math.max(y - r, 0) * w + x];
    }
    for (let y = 0; y < h; y++) a[y * w + x] = tmp[y];
  }
}

// land texture: TW × TH equirectangular, row j = latitude −90 + (j + ½)·180/TH (v = 0 at the south pole)
const TW = 2048, TH = 1024, PAD = 64;
const SDF_F = 24, SDF_C = 128;          // R channel: ±12 px (coast), G channel: ±64 px (shallow-water halo)

function bakeLand(polys) {
  const WP = TW + 2 * PAD;              // padded on both sides with the wrapped-around map, so the SDF crosses ±180°
  const cv = document.createElement('canvas');
  cv.width = WP; cv.height = TH;
  const g = cv.getContext('2d', { willReadFrequently: true });
  // world-atlas rings are stitched across the antimeridian (a step from 179.9° to −179.9° is a short edge on the sphere).
  // On the flat map, unwrap each ring so no step exceeds 180°; a ring that then winds once around a pole is closed
  // through that pole. The three copies drawn below cover the overhang past ±180°.
  const path = new Path2D();
  for (const poly of polys) for (const r of poly) {
    const ring = [];
    let off = 0, prev = r[0][0], latSum = 0;
    for (const [lo, la] of r) {
      if (lo - prev > 180) off -= 360; else if (prev - lo > 180) off += 360;
      prev = lo; latSum += la;
      ring.push([lo + off, la]);
    }
    const wind = ring[ring.length - 1][0] - ring[0][0];
    if (Math.abs(wind) > 180) {
      const pole = latSum < 0 ? -90 : 90;
      ring.push([ring[ring.length - 1][0], pole], [ring[0][0], pole]);
    }
    ring.forEach(([lo, la], i) => {
      const x = ((lo + 180) / 360) * TW, y = ((90 - la) / 180) * TH;
      if (i) path.lineTo(x, y); else path.moveTo(x, y);
    });
  }
  g.fillStyle = '#fff';
  for (const k of [-1, 0, 1]) { g.setTransform(1, 0, 0, 1, PAD + k * TW, 0); g.fill(path, 'evenodd'); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  const px = g.getImageData(0, 0, WP, TH).data;
  const a = new Float32Array(WP * TH);
  for (let i = 0; i < a.length; i++) a[i] = px[i * 4 + 3] / 255;
  // round the coastline: blur (≈ Gaussian σ 1.8 px), then re-sharpen to a one-pixel ramp around the 0.5 level
  boxBlur(a, WP, TH, 2); boxBlur(a, WP, TH, 2);
  for (let i = 0; i < a.length; i++) a[i] = clamp((a[i] - 0.5) * 2.5 + 0.5);
  const sd = signedDistance(a, WP, TH);   // px: < 0 on land, > 0 at sea
  const data = new Uint8Array(TW * TH * 4);
  const sdf = new Float32Array(TW * TH);
  for (let j = 0; j < TH; j++) {
    const y = TH - 1 - j;
    for (let x = 0; x < TW; x++) {
      const d = sd[y * WP + x + PAD], o = (j * TW + x) * 4;
      sdf[j * TW + x] = d;
      data[o] = Math.round(clamp(0.5 + d / SDF_F) * 255);
      data[o + 1] = Math.round(clamp(0.5 + d / SDF_C) * 255);
      data[o + 2] = 0; data[o + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, TW, TH, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.magFilter = tex.minFilter = THREE.LinearFilter;   // no mipmaps: no seam line at ±180° from the atan() wrap
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return { tex, sdf };
}
const sdfAt = (sdf, lat, lon) => {
  const i = Math.min(TW - 1, Math.floor((((lon + 540) % 360) / 360) * TW)), j = Math.min(TH - 1, Math.floor(((lat + 90) / 180) * TH));
  return sdf[j * TW + i];
};

// clouds: rounded cartoon puffs. Clusters of overlapping discs (chains drifting roughly east–west, more of them in the
// tropics and the storm tracks) summed as metaballs Σ max(0, 1 − (d/r)²)² on the sphere (d = angular distance).
// The outline (field > CUT) is stored as a signed distance (R) so it stays round when the camera is right above a
// cloud; the raw field (G) keeps the lumps for shading.
const CW = 2048, CH = 1024, CLOUD_MAX = 1.3, CLOUD_CUT = 0.3, CLOUD_SDF = 32;
function bakeClouds(seed) {
  const R = rand(seed);
  const f = new Float32Array(CW * CH);
  const puffs = [];
  for (let c = 0; c < 175; c++) {
    const b = R();
    const lat = b < 0.28 ? 7 + (R() - 0.5) * 18 : b < 0.6 ? 48 + (R() - 0.5) * 28 : b < 0.92 ? -48 + (R() - 0.5) * 28 : (R() - 0.5) * 110;
    let la = lat, lo = -180 + 360 * R();
    const n = 3 + Math.floor(R() * 5), size = 1.1 + 1.5 * R(), head = (R() - 0.5) * 0.7;
    for (let i = 0; i < n; i++) {
      const mid = 1 - 0.45 * Math.abs(i - (n - 1) / 2) / Math.max(1, (n - 1) / 2);   // bigger in the middle of a chain
      puffs.push([la, lo, size * (0.7 + 0.5 * R()) * mid]);
      const step = size * (0.75 + 0.45 * R()), a = head + (R() - 0.5) * 1.1;
      lo += (step * Math.cos(a)) / Math.cos(la * DEG);
      la += step * Math.sin(a);
    }
  }
  for (const [la, lo, r] of puffs) {
    const c = sph(la, lo), cr = Math.cos(r * DEG);
    const j0 = Math.max(0, Math.floor(((la - r - 90 + 180) / 180) * CH)), j1 = Math.min(CH - 1, Math.ceil(((la + r + 90) / 180) * CH));
    const span = r / Math.max(0.15, Math.cos(Math.min(85, Math.abs(la) + r) * DEG));
    const i0 = Math.floor(((lo - span + 180) / 360) * CW), i1 = Math.ceil(((lo + span + 180) / 360) * CW);
    for (let j = j0; j <= j1; j++) {
      const tl = (-90 + ((j + 0.5) * 180) / CH) * DEG, cl = Math.cos(tl), y = Math.sin(tl);
      for (let ii = i0; ii <= i1; ii++) {
        const tn = (-180 + ((ii + 0.5) * 360) / CW) * DEG;
        const d = cl * Math.sin(tn) * c.x + y * c.y + cl * Math.cos(tn) * c.z;
        if (d <= cr) continue;
        const q = 1 - (Math.acos(Math.min(1, d)) / (r * DEG)) ** 2;
        f[j * CW + (((ii % CW) + CW) % CW)] += q * q;
      }
    }
  }
  // pad left/right with the wrapped-around field so the distance transform crosses ±180°
  const P = 48, WP = CW + 2 * P, a = new Float32Array(WP * CH);
  const F = (j, x) => f[clamp(j, 0, CH - 1) * CW + (((x % CW) + CW) % CW)];
  for (let j = 0; j < CH; j++) for (let x = 0; x < WP; x++) {
    const i = x - P, v = F(j, i);
    // coverage of the outline with a true one-texel ramp: (v − CUT) / |∇v| is the distance in texels to the level set
    const g = Math.hypot(F(j, i + 1) - F(j, i - 1), F(j + 1, i) - F(j - 1, i)) / 2;
    a[j * WP + x] = clamp((v - CLOUD_CUT) / Math.max(g, 1e-4) + 0.5);
  }
  const sd = signedDistance(a, WP, CH);
  const data = new Uint8Array(CW * CH * 2);
  for (let j = 0; j < CH; j++) for (let x = 0; x < CW; x++) {
    const k = j * CW + x;
    data[k * 2] = Math.round(clamp(0.5 - sd[j * WP + x + P] / CLOUD_SDF) * 255);   // stored inside-positive
    data[k * 2 + 1] = Math.round(clamp(f[k] / CLOUD_MAX) * 255);
  }
  const tex = new THREE.DataTexture(data, CW, CH, THREE.RGFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.unpackAlignment = 2;
  tex.needsUpdate = true;
  return { tex, cut: CLOUD_CUT / CLOUD_MAX };   // the G-channel level of the outline
}

// night lights: seeded points on land, denser near coasts and in noise clusters, none on the ice caps
function bakeLights(sdf, seed) {
  const R = rand(seed), nz = new SimplexNoise({ random: rand(seed + 1) });
  const pos = [], bri = [];
  for (let k = 0; k < 260000 && bri.length < 20000; k++) {
    const y = 2 * R() - 1, ph = 2 * Math.PI * R(), r = Math.sqrt(1 - y * y);
    const x = r * Math.sin(ph), z = r * Math.cos(ph);
    const lat = Math.asin(y) / DEG, lon = Math.atan2(x, z) / DEG;
    const d = sdfAt(sdf, lat, lon);
    if (d > -0.6) continue;
    const wLat = lat < -55 ? 0 : 1 - ramp(lat, 56, 70);
    const coast = Math.exp(Math.min(0, d) / 14);
    const cl = 0.25 + 0.75 * ramp(nz.noise3d(x * 7, y * 7, z * 7) + 0.35 * nz.noise3d(x * 19, y * 19, z * 19), -0.3, 0.55);
    if (R() > wLat * (0.1 + 0.9 * coast) * cl * 0.95) continue;
    const n = 1 + Math.floor(R() * 3);   // a town = a few points
    for (let m = 0; m < n; m++) {
      const j = 0.0035 * m;
      const v = new THREE.Vector3(x + j * (R() - 0.5), y + j * (R() - 0.5), z + j * (R() - 0.5)).normalize().multiplyScalar(1.0015);
      pos.push(v.x, v.y, v.z);
      bri.push(0.3 + 0.7 * R() ** 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aB', new THREE.Float32BufferAttribute(bri, 1));
  return g;
}

/** a great-circle arc a → b lifted by sin(πs)·h, sampled n times; at(u) is the point at arc-length fraction u */
class Arc {
  constructor(a, b, n = 480) {
    this.a = a; this.b = b;
    this.theta = Math.acos(clamp(a.dot(b), -1, 1));
    this.h = LIFT * this.theta;
    this.n = n;
    this.p = new Float32Array(n * 3);
    this.s = new Float32Array(n);
    this.u = new Float32Array(n);
    const v = new THREE.Vector3();
    let len = 0;
    for (let i = 0; i < n; i++) {
      const s = i / (n - 1);
      slerpDir(a, b, s, v).multiplyScalar(1.004 + this.h * Math.sin(Math.PI * s));
      this.p.set([v.x, v.y, v.z], i * 3);
      this.s[i] = s;
      if (i) len += Math.hypot(v.x - this.p[i * 3 - 3], v.y - this.p[i * 3 - 2], v.z - this.p[i * 3 - 1]);
      this.u[i] = len;
    }
    for (let i = 0; i < n; i++) this.u[i] /= len;
    this.km = this.theta * EARTH_KM;
  }
  _find(u) {
    u = clamp(u);
    let lo = 0, hi = this.n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (this.u[m] <= u) lo = m; else hi = m; }
    return [lo, (u - this.u[lo]) / Math.max(1e-9, this.u[hi] - this.u[lo])];
  }
  at(u, out = new THREE.Vector3()) {
    const [i, f] = this._find(u), p = this.p, j = Math.min(i + 1, this.n - 1);
    return out.set(lerp(p[i * 3], p[j * 3], f), lerp(p[i * 3 + 1], p[j * 3 + 1], f), lerp(p[i * 3 + 2], p[j * 3 + 2], f));
  }
  /** ground fraction s (slerp parameter) at arc-length fraction u — for the distance counter */
  sAt(u) { const [i, f] = this._find(u); return lerp(this.s[i], this.s[Math.min(i + 1, this.n - 1)], f); }
}

/** screen-space ribbon along an Arc: two vertices per sample, each knowing its neighbours */
function ribbonGeometry(arc) {
  const n = arc.n, P = arc.p;
  const pos = new Float32Array(n * 6), prev = new Float32Array(n * 6), next = new Float32Array(n * 6);
  const side = new Float32Array(n * 2), au = new Float32Array(n * 2), idx = [];
  for (let i = 0; i < n; i++) {
    const ip = Math.max(i - 1, 0), inx = Math.min(i + 1, n - 1);
    for (let k = 0; k < 2; k++) {
      const v = i * 2 + k;
      for (let c = 0; c < 3; c++) { pos[v * 3 + c] = P[i * 3 + c]; prev[v * 3 + c] = P[ip * 3 + c]; next[v * 3 + c] = P[inx * 3 + c]; }
      side[v] = k ? 1 : -1;
      au[v] = arc.u[i];
    }
    if (i < n - 1) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aPrev', new THREE.BufferAttribute(prev, 3));
  g.setAttribute('aNext', new THREE.BufferAttribute(next, 3));
  g.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
  g.setAttribute('aU', new THREE.BufferAttribute(au, 1));
  g.setIndex(idx);
  return g;
}

/** a small stylised shorebird: lathe body + head, upturned bill, two-segment swept wings (local +z forward, +x right) */
function buildBirdParts() {
  const prof = [[0, -0.5], [0.06, -0.47], [0.12, -0.34], [0.158, -0.14], [0.155, 0.06], [0.12, 0.24], [0.07, 0.36], [0, 0.4]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.LatheGeometry(prof, 18);
  body.rotateX(Math.PI / 2); body.scale(1, 0.84, 1);
  const head = new THREE.SphereGeometry(0.095, 14, 10); head.translate(0, 0.06, 0.4);
  const tailS = new THREE.Shape();
  tailS.moveTo(-0.075, -0.4); tailS.lineTo(0.075, -0.4); tailS.quadraticCurveTo(0.075, -0.62, 0, -0.66); tailS.quadraticCurveTo(-0.075, -0.62, -0.075, -0.4);
  const tail = new THREE.ShapeGeometry(tailS, 6); tail.rotateX(Math.PI / 2); tail.translate(0, 0.02, 0);
  const bodyG = mergeGeometries([body.toNonIndexed(), head.toNonIndexed(), tail.toNonIndexed()].map((g) => { g.deleteAttribute('uv'); return g; }));
  bodyG.computeVertexNormals();
  const bill = new THREE.CylinderGeometry(0.006, 0.02, 0.38, 6);
  bill.rotateX(Math.PI / 2 - 0.12); bill.translate(0, 0.085, 0.66);
  const wing = (pts) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [x, y, cx, cy] = pts[i];
      if (cx === undefined) s.lineTo(x, y); else s.quadraticCurveTo(cx, cy, x, y);
    }
    const g = new THREE.ShapeGeometry(s, 8);
    g.rotateX(Math.PI / 2);                // shape y → forward (+z)
    return g;
  };
  const inner = wing([[0, 0.17], [0.42, 0.12, 0.2, 0.2], [0.42, -0.14], [0, -0.2, 0.2, -0.2]]);
  const outer = wing([[0, 0.12], [0.6, -0.34, 0.4, 0.12], [0.34, -0.2, 0.46, -0.3], [0, -0.14, 0.16, -0.15]]);
  return { bodyG, bill, inner, outer };
}

// ================================================================ shaders
const GLOBE_VS = /* glsl */`
varying vec3 vW;
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;

const GLOBE_FS = /* glsl */`
uniform sampler2D tLand, tCloud;
uniform vec3 uSun;
uniform float uCloudLon, uCloudCut, uCloudFade, uCamAlt;
uniform vec3 cOceanDeep, cOcean, cShallow, cLand, cLandIn, cIce, cNightOcean, cNightLand, cAtmo;
varying vec3 vW;
const float PI = 3.14159265;
const float TEXR = PI / 1024.0;           // radians per texel (rows)
float sdfF(vec2 uv) { return (texture2D(tLand, uv).r - 0.5) * ${SDF_F.toFixed(1)}; }
void main() {
  vec3 N = normalize(vW);
  vec3 V = normalize(cameraPosition - vW);
  float lon = atan(N.x, N.z), lat = asin(clamp(N.y, -1.0, 1.0));
  vec2 uv = vec2(lon / (2.0 * PI) + 0.5, lat / PI + 0.5);
  vec4 L = texture2D(tLand, uv);
  float dF = (L.r - 0.5) * ${SDF_F.toFixed(1)};          // px to the coast, < 0 on land
  float dC = (L.g - 0.5) * ${SDF_C.toFixed(1)};
  float aa = max(fwidth(dF), 0.05) * 0.7;
  float land = 1.0 - smoothstep(-aa, aa, dF);

  // the sun seen from this point: elevation k and the direction toward it along the ground, in uv per radian
  float k = dot(N, uSun);
  vec3 east = vec3(cos(lon), 0.0, -sin(lon));
  vec3 north = vec3(-sin(lat) * sin(lon), cos(lat), -sin(lat) * cos(lon));
  vec3 Ts = uSun - N * k;
  float tl = length(Ts);
  Ts = tl > 1e-4 ? Ts / tl : east;
  vec2 duv = vec2(dot(Ts, east) / (2.0 * PI * max(cos(lat), 0.08)), dot(Ts, north) / PI);

  // bevel: the land is a plateau h = smoothstep(0, -5 px, d); its slope along the sun direction lights or shades the rim
  float h1 = smoothstep(0.0, -5.0, sdfF(uv + duv * 1.6 * TEXR));
  float h0 = smoothstep(0.0, -5.0, sdfF(uv - duv * 1.6 * TEXR));
  float bevel = h0 - h1;                  // > 0 where the rim faces the sun
  // drop shadow on the sea: land a little way toward the sun; longer as the sun gets low
  float zen = clamp(k, 0.18, 1.0);
  float sl = 0.0035 * sqrt(1.0 - zen * zen) / zen + 0.0018;
  float shadow = (1.0 - smoothstep(-1.5, 1.5, sdfF(uv + duv * sl))) * (1.0 - land);
  // cloud shadows (the cloud layer drifts in longitude)
  vec2 cuv = vec2((lon - uCloudLon) / (2.0 * PI) + 0.5, uv.y) + duv * (0.006 * sqrt(1.0 - zen * zen) / zen + 0.004);
  float cshadow = smoothstep(-1.0, 2.0, (texture2D(tCloud, cuv).r - 0.5) * ${CLOUD_SDF.toFixed(1)});
  cshadow *= mix(1.0, smoothstep(1.5, 2.3, length(cameraPosition - vW) / uCamAlt), uCloudFade);   // shadows go with their clouds

  vec3 ocean = mix(cOceanDeep, cOcean, smoothstep(70.0, 4.0, dC));
  ocean = mix(ocean, cShallow, smoothstep(6.0, 0.5, dC) * 0.75);
  vec3 landC = mix(cLand, cLandIn, smoothstep(-4.0, -40.0, dC) * 0.55);
  landC = mix(landC, cIce, smoothstep(64.0, 76.0, abs(lat) * 57.29578));
  vec3 dayC = mix(ocean, landC * (1.0 + 0.42 * bevel), land);
  dayC *= 1.0 - 0.3 * shadow - 0.22 * cshadow;
  dayC *= 0.6 + 0.4 * smoothstep(0.0, 0.6, k);
  dayC *= mix(vec3(1.0), vec3(1.1, 0.95, 0.82), exp(-(k - 0.04) * (k - 0.04) / 0.006) * 0.55);   // low sun: golden
  vec3 Hh = normalize(uSun + V);
  float sp = max(dot(N, Hh), 0.0);
  float s2 = sp * sp, s4 = s2 * s2, s8 = s4 * s4, s16 = s8 * s8, s32 = s16 * s16;
  float spec = s32 * s16;                 // ^48: a small soft glint on the water
  dayC += vec3(0.9, 0.95, 1.0) * spec * 0.16 * (1.0 - land) * (1.0 - cshadow);

  vec3 nightC = mix(cNightOcean, cNightLand, land);
  float day = smoothstep(-0.05, 0.06, k);
  vec3 col = mix(nightC, dayC, day);

  // the inner edge of the atmosphere: haze toward the limb, bright on the day side
  float fr = 1.0 - max(dot(N, V), 0.0);
  float rim = fr * fr * fr;
  col = mix(col, cAtmo * (0.08 + 1.1 * smoothstep(-0.04, 0.35, k)), clamp(rim * 0.8, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}`;

// cubic B-spline filtering from four bilinear taps: C²-smooth contours when a texel covers dozens of pixels
const BICUBIC = /* glsl */`
vec4 bsW(float v) {
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
  vec4 s = n * n * n;
  float x = s.x, y = s.y - 4.0 * s.x, z = s.z - 4.0 * s.y + 6.0 * s.x;
  return vec4(x, y, z, 6.0 - x - y - z) * (1.0 / 6.0);
}
vec4 bicubic(sampler2D tex, vec2 uv, vec2 size) {
  uv = uv * size - 0.5;
  vec2 f = fract(uv);
  uv -= f;
  vec4 xc = bsW(f.x), yc = bsW(f.y);
  vec4 c = uv.xxyy + vec2(-0.5, 1.5).xyxy;
  vec4 s = vec4(xc.xz + xc.yw, yc.xz + yc.yw);
  vec4 o = (c + vec4(xc.yw, yc.yw) / s) / size.xxyy;
  vec4 s0 = texture2D(tex, o.xz), s1 = texture2D(tex, o.yz), s2 = texture2D(tex, o.xw), s3 = texture2D(tex, o.yw);
  float sx = s.x / (s.x + s.y), sy = s.z / (s.z + s.w);
  return mix(mix(s3, s2, sx), mix(s1, s0, sx), sy);
}`;

const CLOUD_FS = /* glsl */`
uniform sampler2D tCloud;
uniform vec3 uSun, cAtmo;
uniform float uCloudLon, uCloudCut, uCloudFade, uCamAlt;
varying vec3 vW;
const float PI = 3.14159265;
const float TEXR = PI / ${CH}.0;
${BICUBIC}
void main() {
  vec3 N = normalize(vW);
  vec3 V = normalize(cameraPosition - vW);
  float lon = atan(N.x, N.z), lat = asin(clamp(N.y, -1.0, 1.0));
  vec2 uv = vec2((lon - uCloudLon) / (2.0 * PI) + 0.5, lat / PI + 0.5);
  vec2 cs = bicubic(tCloud, uv, vec2(${CW}.0, ${CH}.0)).rg;
  float d = (cs.r - 0.5) * ${CLOUD_SDF.toFixed(1)};       // px to the outline, > 0 inside
  float aa = max(fwidth(d), 0.05) * 0.75;
  float a = smoothstep(-aa, aa, d);
  if (a < 0.002) discard;
  float v = cs.g;
  float k = dot(N, uSun);
  // puff shading: the metaball field is a height; its slope toward the sun lights the sunny side and shades the far side
  vec3 east = vec3(cos(lon), 0.0, -sin(lon));
  vec3 north = vec3(-sin(lat) * sin(lon), cos(lat), -sin(lat) * cos(lon));
  vec3 Ts = uSun - N * k; float tl = length(Ts); Ts = tl > 1e-4 ? Ts / tl : east;
  vec2 duv = vec2(dot(Ts, east) / (2.0 * PI * max(cos(lat), 0.08)), dot(Ts, north) / PI) * 2.2 * TEXR;
  // each cloud is a dome h = smoothstep(0, 7 texels, d): flat on top, rounded at the rim. Its slope along the sun
  // direction, from a second (bicubic) sample a little way toward the sun, lights the sunny rim and shades the far one.
  float dT = (bicubic(tCloud, uv + duv, vec2(${CW}.0, ${CH}.0)).r - 0.5) * ${CLOUD_SDF.toFixed(1)};
  float face = clamp((smoothstep(0.0, 7.0, dT) - smoothstep(0.0, 7.0, d)) * 3.0, -1.0, 1.0);   // + faces the sun
  float lump = smoothstep(0.25, 0.75, v);              // inner lumps from the metaball field, very soft
  float rim = 1.0 - smoothstep(0.0, 6.0, d);
  float day = smoothstep(-0.05, 0.08, k);
  float lit = (0.8 + 0.2 * smoothstep(0.0, 0.5, k)) * (0.93 + 0.12 * face + 0.05 * lump);
  vec3 dayC = mix(vec3(0.72, 0.8, 0.93), vec3(1.0, 0.99, 0.97), clamp(0.62 + 0.75 * face, 0.0, 1.0)) * lit;
  dayC *= mix(vec3(1.0), vec3(1.16, 0.9, 0.76), exp(-(k - 0.05) * (k - 0.05) / 0.008) * 0.85);   // low sun: peach
  vec3 nightC = vec3(0.05, 0.075, 0.14) * (0.85 + 0.3 * face);
  vec3 col = mix(nightC, dayC, day);
  float fr = 1.0 - max(dot(N, V), 0.0);
  col = mix(col, cAtmo * (0.08 + 1.05 * smoothstep(-0.04, 0.35, k)), clamp(fr * fr * fr * 0.75, 0.0, 1.0));
  a *= mix(0.55, 0.97, day) * (1.0 - 0.7 * smoothstep(0.6, 1.0, fr));
  // low camera: clouds closer than ~2× the camera's altitude (the lower part of the frame) thin away, so only small,
  // distant puffs toward the horizon remain instead of a few huge blobs right under the lens
  a *= mix(1.0, smoothstep(1.5, 2.3, length(cameraPosition - vW) / uCamAlt), uCloudFade);
  gl_FragColor = vec4(col * a, a);
}`;

// atmosphere: a back-side shell of radius RA. On it |N·V| = sqrt(1 − (b/RA)²), b = the view ray's distance from the
// centre, so x = |N·V| / sqrt(1 − 1/RA²) is 1 on the planet's limb and 0 at the shell's silhouette — a fresnel term
// that fades to nothing at the outer edge.
const RA = 1.075;
const ATMO_FS = /* glsl */`
uniform vec3 uSun, cAtmo, cAtmoDeep;
uniform float uI;
varying vec3 vW;
void main() {
  vec3 N = normalize(vW);
  vec3 V = normalize(cameraPosition - vW);
  float f = abs(dot(N, V));
  float x = clamp(f / ${Math.sqrt(1 - 1 / (RA * RA)).toFixed(6)}, 0.0, 1.0);
  float g = x * x * x * (0.3 + 0.7 * x * x);
  float sun = smoothstep(-0.45, 0.5, dot(N, uSun));
  vec3 col = mix(cAtmoDeep, cAtmo, x * x) * g * (0.12 + 1.25 * sun) * uI;
  gl_FragColor = vec4(col, 1.0);
}`;

const RIBBON_VS = /* glsl */`
uniform vec2 uRes;
uniform float uW, uMinPx, uMaxPx, uProg;
attribute vec3 aPrev, aNext;
attribute float aSide, aU;
varying float vU, vSide, vW;
vec2 scr(vec4 c) { return c.xy / c.w * 0.5 * uRes; }
void main() {
  mat4 pv = projectionMatrix * viewMatrix;
  vec4 c = pv * vec4(position, 1.0), cp = pv * vec4(aPrev, 1.0), cn = pv * vec4(aNext, 1.0);
  vU = aU; vSide = aSide;
  const float NEAR = 0.004;
  float w = 0.0;
  if (c.w > NEAR) {
    vec2 sc = scr(c), sp = cp.w > NEAR ? scr(cp) : sc, sn = cn.w > NEAR ? scr(cn) : sc;
    vec2 d = sn - sp;
    d = dot(d, d) > 1e-8 ? normalize(d) : vec2(1.0, 0.0);
    float pxu = projectionMatrix[1][1] * 0.5 * uRes.y / c.w;          // px per world unit at this depth
    float seg = uProg - aU;
    float head = seg >= 0.0 ? exp(-seg / 0.02) : 0.0;
    w = clamp(uW * pxu, uMinPx, uMaxPx) * (1.0 + 0.9 * head);
    c.xy += vec2(-d.y, d.x) * aSide * (w * 0.5 + 1.0) / (0.5 * uRes) * c.w;
  }
  vW = w;
  gl_Position = c;
}`;

const RIBBON_FS = /* glsl */`
uniform vec3 uCol;
uniform float uProg, uTail, uBody, uPulse, uPulseAmt, uFade, uHot, uNearFade;
varying float vU, vSide, vW;
void main() {
  float seg = uProg - vU;
  if (seg < 0.0 || vW <= 0.0) discard;
  float px = abs(vSide) * (vW * 0.5 + 1.0);              // px from the centre line
  float cov = clamp(vW * 0.5 + 0.5 - px, 0.0, 1.0);      // 1-px anti-aliased edge
  float q = px / max(vW * 0.5, 0.5);
  float core = exp(-q * q * 1.8);
  float tail = exp(-seg / uTail);
  float head = exp(-seg / 0.012);
  float dp = vU - uPulse;
  float pulse = uPulseAmt * exp(-dp * dp / 0.0018);
  float I = uBody + (1.0 - uBody) * tail;
  vec3 col = uCol * (0.8 + uHot * 1.5 * tail * core + 2.2 * pulse * core) + vec3(1.0, 0.9, 0.8) * head * core * 3.0 * uHot;
  float a = cov * clamp(I + pulse, 0.0, 1.0) * uFade;
  // low chase: the trail fades out above the caption band (bottom 270 px) instead of running through it
  a *= mix(1.0, smoothstep(300.0, 560.0, gl_FragCoord.y), uNearFade);
  gl_FragColor = vec4(col * a, a);
}`;

const MARK_VS = /* glsl */`
varying vec2 vQ;
void main() { vQ = position.xy * 2.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const MARK_FS = /* glsl */`
uniform vec3 uCol;
uniform float uPop, uAge, uAge2, uSize;
varying vec2 vQ;
float ring(float r, float age, float aa) {
  if (age < 0.0 || age > 1.25) return 0.0;
  float x = age / 1.25, y = 1.0 - x;
  float rr = 0.18 + 0.8 * (1.0 - y * y * y);
  float w = 0.05 * y + 0.012;
  return (1.0 - smoothstep(w - aa, w + aa, abs(r - rr))) * y * y;
}
void main() {
  float r = length(vQ);
  float aa = fwidth(r);
  float rd = 0.17 * uSize * uPop;
  float dotA = 1.0 - smoothstep(rd - aa, rd + aa, r);
  float core = 1.0 - smoothstep(rd * 0.42 - aa, rd * 0.42 + aa, r);
  float rings = ring(r, uAge, aa) + ring(r, uAge - 0.22, aa) + ring(r, uAge2, aa) + ring(r, uAge2 - 0.22, aa);
  float glow = exp(-r * r * 9.0) * 0.5 * uPop;
  vec3 col = uCol * (1.5 * dotA + 1.6 * rings + glow) + vec3(1.0, 0.95, 0.9) * core * 2.4;
  gl_FragColor = vec4(col, dotA * 0.95);                  // premultiplied: the dot covers, rings and glow add
}`;

const LIGHTS_VS = /* glsl */`
uniform vec3 uSun;
uniform float uRes, uOn;
attribute float aB;
varying float vA;
void main() {
  vec3 N = normalize(position);
  float night = smoothstep(0.03, -0.14, dot(N, uSun));
  float facing = smoothstep(0.03, 0.3, dot(N, normalize(cameraPosition - position)));
  vec4 mv = viewMatrix * vec4(position, 1.0);
  float pxu = projectionMatrix[1][1] * 0.5 * uRes / max(-mv.z, 1e-3);
  vA = aB * night * facing * uOn;
  gl_PointSize = vA > 0.003 ? clamp(0.0035 * pxu * (0.6 + 0.8 * aB), 1.6, 9.0) : 0.0;
  gl_Position = projectionMatrix * mv;
}`;
const LIGHTS_FS = /* glsl */`
uniform vec3 uCol;
varying float vA;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(q, q);
  float a = (exp(-r2 * 9.0) + 0.3 * exp(-r2 * 2.5)) * (1.0 - smoothstep(0.7, 1.0, r2));
  gl_FragColor = vec4(uCol * vA * a * 2.6, 1.0);
}`;

const STARS_VS = /* glsl */`
uniform float uT;
attribute vec2 aS;   // size, phase
varying float vA;
void main() {
  vA = 0.55 + 0.45 * sin(uT * (1.3 + aS.y * 0.4) + aS.y * 6.2831);
  gl_PointSize = aS.x;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const STARS_FS = /* glsl */`
uniform vec3 uCol;
uniform float uI;
varying float vA;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float a = exp(-dot(q, q) * 4.0);
  gl_FragColor = vec4(uCol * vA * a * uI, 1.0);
}`;

const FINAL_FS = /* glsl */`
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(tDiffuse, vUv);
  vec2 q = (vUv - 0.5) * vec2(0.85, 1.0);
  float v = clamp(length(q) * 1.3, 0.0, 1.0);
  vec3 col = c.rgb * (1.0 - 0.42 * v * v * v);
  col += mix(vec3(0.0016, 0.0024, 0.0085), vec3(0.0045, 0.0062, 0.02), 1.0 - vUv.y);   // space: deep indigo, a little lighter low
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// ================================================================ demo
defineDemo({
  id: '156-globe-arcs',
  title: '철새의 길',
  tech: '3D 지구본 · 대기 빛 번짐 + 낮밤 경계 + 대권 호',
  duration: D,
  background: C.space,

  async setup(api) {
    const glyphs = Object.values(TXT).join('') + Object.values(SITES).map((s) => s.name + s.sub).join('') + '0123456789,. km→·';
    await Promise.all([
      fontReady('800 64px "Pretendard Variable"', glyphs),
      fontReady('600 30px "Pretendard Variable"', glyphs),
    ]);
    const topoRes = await fetch('../node_modules/world-atlas/land-110m.json');
    if (!topoRes.ok) throw new Error(`land-110m.json ${topoRes.status}`);
    const polys = decodeTopo(await topoRes.json(), 'land');

    // ---- renderer + post
    const el = api.layer('canvas', { z: 0 });
    el.width = W; el.height = H;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 1);   // space is painted in the final pass (a clear colour lands in the HDR target unconverted)
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV_O, W / H, 0.002, 400);

    const col = (h) => new THREE.Color(h);
    const sun = new THREE.Vector3();
    const sun0 = sph(SUN_AT[0], SUN_AT[1]);
    const shared = { uSun: { value: sun } };

    // ---- globe
    const land = bakeLand(polys);
    const clouds = bakeClouds(1561);
    const CL = { uCloudLon: { value: 0 }, uCloudCut: { value: clouds.cut }, uCloudFade: { value: 0 }, uCamAlt: { value: 1 } };
    const globeMat = new THREE.ShaderMaterial({
      vertexShader: GLOBE_VS, fragmentShader: GLOBE_FS,
      uniforms: {
        ...shared, ...CL, tLand: { value: land.tex }, tCloud: { value: clouds.tex },
        cOceanDeep: { value: col(C.oceanDeep) }, cOcean: { value: col(C.ocean) }, cShallow: { value: col(C.shallow) },
        cLand: { value: col(C.land) }, cLandIn: { value: col(C.landIn) }, cIce: { value: col(C.ice) },
        cNightOcean: { value: col(C.nightOcean) }, cNightLand: { value: col(C.nightLand) },
        cAtmo: { value: col(C.atmo) },
      },
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1, 224, 140), globeMat));

    const lightsMat = new THREE.ShaderMaterial({
      vertexShader: LIGHTS_VS, fragmentShader: LIGHTS_FS,
      uniforms: { ...shared, uRes: { value: H }, uOn: { value: 1 }, uCol: { value: col(C.light) } },
      transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    });
    const lights = new THREE.Points(bakeLights(land.sdf, 1571), lightsMat);
    lights.frustumCulled = false;
    scene.add(lights);

    const cloudMat = new THREE.ShaderMaterial({
      vertexShader: GLOBE_VS, fragmentShader: CLOUD_FS,
      uniforms: { ...shared, ...CL, tCloud: { value: clouds.tex }, cAtmo: { value: col(C.atmo) } },
      transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    const cloudShell = new THREE.Mesh(new THREE.SphereGeometry(1.013, 192, 120), cloudMat);
    cloudShell.renderOrder = 2;
    scene.add(cloudShell);

    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: GLOBE_VS, fragmentShader: ATMO_FS,
      uniforms: { ...shared, cAtmo: { value: col(C.atmo) }, cAtmoDeep: { value: col(C.atmoDeep) }, uI: { value: 1 } },
      side: THREE.BackSide, transparent: true, depthWrite: false,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    });
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(RA, 160, 100), atmoMat);
    atmo.renderOrder = 3;
    scene.add(atmo);

    // ---- stars (inertial: they turn opposite to the spin, like the sun)
    const space = new THREE.Group();
    scene.add(space);
    {
      const R = rand(1581), p = [], s = [];
      for (let i = 0; i < 1100; i++) {
        const y = 2 * R() - 1, ph = 2 * Math.PI * R(), r = Math.sqrt(1 - y * y);
        p.push(90 * r * Math.sin(ph), 90 * y, 90 * r * Math.cos(ph));
        s.push(1.2 + 2.4 * R() ** 3, R());
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
      g.setAttribute('aS', new THREE.Float32BufferAttribute(s, 2));
      const m = new THREE.ShaderMaterial({
        vertexShader: STARS_VS, fragmentShader: STARS_FS,
        uniforms: { uT: { value: 0 }, uCol: { value: col(C.star) }, uI: { value: 0.75 } },
        transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
      });
      const stars = new THREE.Points(g, m);
      stars.frustumCulled = false;
      space.add(stars);
      this.starMat = m;
    }

    // ---- sites, arcs, markers
    const accent = col(C.accent);
    const P = Object.fromEntries(Object.entries(SITES).map(([k, s]) => [k, sph(s.lat, s.lon)]));
    const arcs = ROUTES.map(([from, to, L, T, a, b], i) => {
      const arc = new Arc(P[from], P[to]);
      const mat = new THREE.ShaderMaterial({
        vertexShader: RIBBON_VS, fragmentShader: RIBBON_FS,
        uniforms: {
          uRes: { value: new THREE.Vector2(W, H) }, uW: { value: 0.0055 }, uMinPx: { value: 3.0 }, uMaxPx: { value: 13 },
          uProg: { value: 0 }, uTail: { value: i === HERO ? 0.12 : 0.22 }, uBody: { value: 0.42 },
          uPulse: { value: -1 }, uPulseAmt: { value: 0 }, uFade: { value: 1 }, uHot: { value: 1 }, uNearFade: { value: 0 }, uCol: { value: accent.clone() },
        },
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
        blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      });
      const mesh = new THREE.Mesh(ribbonGeometry(arc), mat);
      mesh.frustumCulled = false;
      mesh.renderOrder = 5;
      scene.add(mesh);
      return { arc, mat, mesh, from, to, L, T, a, b };
    });
    // the site each arc lands on gets its arrival time; the nest pulses at every launch
    const arrive = {};
    for (const r of arcs) arrive[r.to] = r.L + r.T;
    const launches = arcs.filter((r) => r.from === 'nest').map((r) => r.L);

    const markGeo = new THREE.PlaneGeometry(1, 1);
    const marks = {};
    for (const [k, p] of Object.entries(P)) {
      const m = new THREE.ShaderMaterial({
        vertexShader: MARK_VS, fragmentShader: MARK_FS,
        uniforms: { uCol: { value: accent.clone() }, uPop: { value: 0 }, uAge: { value: -1 }, uAge2: { value: -1 }, uSize: { value: k === 'nest' ? 1.25 : 1 } },
        transparent: true, depthWrite: false,
        blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      });
      const mesh = new THREE.Mesh(markGeo, m);
      mesh.position.copy(p).multiplyScalar(1.0035);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), p);
      mesh.scale.setScalar(k === 'nest' ? 0.16 : 0.13);
      mesh.renderOrder = 4;
      scene.add(mesh);
      marks[k] = { mesh, mat: m, p };
    }

    // ---- the head glow (sprite) of each arc
    const glowC = document.createElement('canvas');
    glowC.width = glowC.height = 128;
    {
      const g = glowC.getContext('2d', { willReadFrequently: true });
      const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,255,255,0.75)');
      gr.addColorStop(0.45, 'rgba(255,255,255,0.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    }
    const glowTex = new THREE.CanvasTexture(glowC);
    const heads = arcs.map(() => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: accent.clone().multiplyScalar(2.6), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true }));
      s.renderOrder = 6;
      scene.add(s);
      return s;
    });

    // ---- the flock on the hero arc (lit by the sun and a sky fill; the only lit materials)
    const sunLight = new THREE.DirectionalLight(0xfff3e2, 2.6);
    const hemi = new THREE.HemisphereLight(0xa9cfff, 0x1a2440, 0.9);
    scene.add(sunLight, sunLight.target, hemi);
    const parts = buildBirdParts();
    const std = (c, side = THREE.FrontSide) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.82, metalness: 0, side, emissive: c, emissiveIntensity: 0.12 });
    // the trail lights the flock from below: a short-range accent point light at the head of the hero arc
    const trailLight = new THREE.PointLight(accent.clone(), 0, 0.05, 0);
    scene.add(trailLight);
    const mBody = std(C.bird), mBill = std(C.bill), mIn = std(C.wingIn, THREE.DoubleSide), mOut = std(C.wingOut, THREE.DoubleSide);
    const flock = new THREE.Group();
    scene.add(flock);
    const birds = [];
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Group();
      b.add(new THREE.Mesh(parts.bodyG, mBody), new THREE.Mesh(parts.bill, mBill));
      const wings = [1, -1].map((sx) => {
        const root = new THREE.Group();
        root.position.set(0.07 * sx, 0.045, 0.06);
        root.scale.x = sx;
        root.add(new THREE.Mesh(parts.inner, mIn));
        const tip = new THREE.Group();
        tip.position.x = 0.42;
        tip.add(new THREE.Mesh(parts.outer, mOut));
        root.add(tip);
        b.add(root);
        return { root, tip, sx };
      });
      flock.add(b);
      birds.push({ g: b, wings, phase: i * 1.37, off: [[0, 0], [1.2, -1.05], [-1.2, -1.05], [2.4, -2.1], [-2.4, -2.1]][i] });
    }

    // ---- post: HDR target (2× MSAA) → half-resolution bloom on the real light sources → vignette + ACES + sRGB
    const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 2 });
    const composer = new EffectComposer(renderer, rt);
    composer.setPixelRatio(1);
    composer.setSize(W, H);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.55, 0.55, 0.92);
    const bloomSize = bloom.setSize.bind(bloom);
    bloom.setSize = (w, h) => bloomSize(w / 2, h / 2);
    bloom.setSize(W, H);
    composer.addPass(bloom);
    composer.addPass(new ShaderPass({
      uniforms: { tDiffuse: { value: null } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: FINAL_FS,
    }));

    // ---- compile every program now (objects hidden at t = 0 would otherwise compile on their first visible frame)
    const hiddenNow = [];
    scene.traverse((o) => { if (!o.visible) { hiddenNow.push(o); o.visible = true; } });
    for (const m of Object.values(marks)) m.mesh.visible = true;
    renderer.setRenderTarget(rt);
    renderer.compile(scene, camera);
    renderer.setRenderTarget(null);
    for (const o of hiddenNow) o.visible = false;

    // ---- the text layer (2D, redrawn every frame from t)
    const { ctx } = api.canvas({ type: '2d', z: 5 });

    Object.assign(this, { renderer, scene, camera, composer, bloom, sun, sun0, space, trailLight, globeMat, CL, lightsMat, atmoMat, arcs, arrive, launches, marks, heads, P, sunLight, hemi, flock, birds, ctx });

    // warm-up: draw the busiest moment once and wait for the GPU, so shader compilation and texture upload (seconds on a
    // software GPU) are paid here in setup instead of on the first frame shown
    this.frame(5.6);
    const gl = renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  },

  // ---------------------------------------------------------------- camera rigs (earth frame)
  // A rig is { p: eye, tgt: look-at point, up, fov, shift (lens shift, px), roll }. Rigs blend by eye direction slerp +
  // log-radius, a straight lerp of the look-at point and a slerp of the up vector — the view never leaves the subject.
  rig(p, tgt, up, fov, shift, roll = 0) { return { p: p.clone(), tgt: tgt.clone(), up: up.clone().normalize(), fov, shift, roll }; },
  blend(A, B, w) {
    if (w <= 0) return A;
    if (w >= 1) return B;
    const ra = A.p.length(), rb = B.p.length();
    const p = slerpDir(A.p.clone().normalize(), B.p.clone().normalize(), w).multiplyScalar(Math.exp(lerp(Math.log(ra), Math.log(rb), w)));
    return { p, tgt: A.tgt.clone().lerp(B.tgt, w), up: slerpDir(A.up, B.up, w), fov: lerp(A.fov, B.fov, w), shift: lerp(A.shift, B.shift, w), roll: lerp(A.roll, B.roll, w) };
  },
  overviewRig(t, rot) {
    const lat = track([[0, 27], [2.6, 14, ease.outCubic], [4.6, 11]])(t);
    const k = track([[0, 1.75], [2.6, 1.0, ease.outCubic], [4.6, 0.95]])(t);
    const p = sph(lat, LON_O, D_O * k).applyAxisAngle(Y, -rot);   // inertial camera, seen from the spinning earth
    return this.rig(p, new THREE.Vector3(), Y, FOV_O, 40);
  },
  /** 1 when the globe hides point p from the camera (ray–sphere test) */
  hidden(p) {
    const c = this.camera.position, d = p.clone().sub(c), L = d.length();
    d.divideScalar(L);
    const b = c.dot(d), disc = b * b - (c.lengthSq() - 1);
    if (disc <= 0) return 0;
    const t0 = -b - Math.sqrt(disc);
    return t0 > 0 && t0 < L - 0.002 ? 1 : 0;
  },
  heroU(t) { const r = this.arcs[HERO]; return trap((t - r.L) / r.T, r.a, r.b); },
  /** behind and above the head of the hero arc, looking at a point further along it (look-ahead), with an eased bank */
  chaseRig(t) {
    const arc = this.arcs[HERO].arc, u = this.heroU(t);
    const Hd = arc.at(u), F = arc.at(u + 0.004).sub(arc.at(u - 0.004)).normalize();
    const U = Hd.clone().normalize(), X = new THREE.Vector3().crossVectors(F, U).normalize(), Ft = new THREE.Vector3().crossVectors(U, X);
    const p = Hd.clone().addScaledVector(Ft, -CH_BACK).addScaledVector(U, CH_UP).addScaledVector(X, CH_SIDE);
    const tgt = arc.at(Math.min(u + CH_LOOK, 1)).normalize();   // look-ahead: the ground track a little further on
    const roll = track([[4.35, -14 * DEG], [5.6, 3 * DEG], [6.6, -2.5 * DEG], [7.4, 0]])(t);
    return this.rig(p, tgt, p, 50, 0, roll);
  },
  /** from just north of New Zealand, rising and pulling back to the whole route */
  arrivalRig(t) {
    const k = track([[7.05, 0], [8.9, 0.86, ease.inOutCubic], [D, 1, ease.outCubic]])(t);
    const p = slerpDir(sph(-17, 179), sph(-6, -178), k).multiplyScalar(Math.exp(lerp(Math.log(1.4), Math.log(D_F), k)));
    const tgt = new THREE.Vector3().lerpVectors(this.P.nz, new THREE.Vector3(), ease.inOutCubic(clamp(k * 1.1)));
    return this.rig(p, tgt, Y, lerp(46, FOV_O, k), lerp(0, -40, k));
  },
  apply(r) {
    const cam = this.camera;
    cam.position.copy(r.p);
    cam.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(r.p, r.tgt, r.up));
    if (r.roll) cam.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), r.roll));
    cam.fov = r.fov;
    cam.setViewOffset(W, H, 0, r.shift, W, H);   // lens shift: positive moves the picture up
    cam.updateMatrixWorld();
  },

  frame(t) {
    const S = this;
    const rot = rotDeg(t) * DEG;
    S.sun.copy(S.sun0).applyAxisAngle(Y, -rot);
    S.space.rotation.y = -rot;
    S.CL.uCloudLon.value = (0.5 * t + 12) * DEG;
    S.starMat.uniforms.uT.value = t;

    // ---- camera: overview → chase → arrival
    const w1 = ease.inOutCubic(clamp((t - W1[0]) / (W1[1] - W1[0])));
    const w2 = ease.inOutCubic(clamp((t - W2[0]) / (W2[1] - W2[0])));
    let pose = S.overviewRig(t, rot);
    if (w1 > 0) pose = S.blend(pose, S.chaseRig(t), w1);
    if (w2 > 0) pose = S.blend(pose, S.arrivalRig(t), w2);
    S.apply(pose);
    const lowCam = ramp(t, 4.45, 5.0) * (1 - ramp(t, 7.0, 7.6));   // the low chase stretch
    S.CL.uCloudFade.value = lowCam;
    S.CL.uCamAlt.value = Math.max(0.01, S.camera.position.length() - 1);

    // ---- arcs: draw progress, tail, afterglow pulse
    const tPulse = 8.2;
    S.arcs.forEach((r, i) => {
      const x = (t - r.L) / r.T;
      const u = trap(x, r.a, r.b);
      const U = r.mat.uniforms;
      U.uProg.value = x <= 0 ? -1 : u;
      const near = i === HERO ? ramp(t, W1[0], W1[1]) * (1 - ramp(t, W2[0], W2[1])) : 0;   // 1 while the camera rides along
      U.uBody.value = 0.42 - 0.17 * near + 0.18 * ramp(t, 8.6, 9.6);
      U.uHot.value = 1 - 0.55 * near;
      U.uNearFade.value = ramp(t, 4.45, 5.0) * (1 - ramp(t, 7.7, 8.2));
      // afterglow: a pulse runs along every arc once, staggered
      const pu = (t - tPulse - i * 0.12) / 1.3;
      U.uPulse.value = pu * 1.15 - 0.08;
      U.uPulseAmt.value = pu > 0 && pu < 1 ? Math.sin(Math.PI * pu) * 0.8 : 0;
      const hd = S.heads[i];
      const live = x > 0 && x < 1.25;
      hd.visible = live;
      if (live) {
        r.arc.at(Math.min(u, 1), hd.position);
        const fade = (1 - ramp(x, 1, 1.25)) * ramp(x, 0, 0.05);
        const dist = hd.position.distanceTo(S.camera.position) || 1;
        hd.scale.setScalar(dist * 0.016 * fade * (1 - 0.7 * near) * (1 - S.hidden(hd.position)));
      }
    });

    // ---- markers: the nest pulses at each launch; every destination pops when its arc lands
    for (const [k, m] of Object.entries(S.marks)) {
      const U = m.mat.uniforms;
      if (k === 'nest') {
        U.uPop.value = ease.outBack(clamp((t - 1.25) / 0.45));
        let last = 1.25, prev = -9;
        for (const L of S.launches) if (t >= L) { prev = last; last = L; }
        U.uAge.value = t - last; U.uAge2.value = prev > 0 ? t - prev : -1;
      } else {
        const ta = S.arrive[k];
        U.uPop.value = t < ta ? 0 : ease.outBack(clamp((t - ta) / 0.4), 2.2);
        U.uAge.value = t - ta;
        U.uAge2.value = k === 'nz' ? t - ta - 0.55 : -1;
      }
      m.mesh.visible = U.uPop.value > 0 || U.uAge.value > 0;
    }

    // ---- flock: V formation at the head of the hero arc, wings flapping
    const hero = S.arcs[HERO];
    const hx = (t - hero.L) / hero.T;
    S.flock.visible = hx > 0 && t < 8.1;
    let dayAtFlock = 1;
    S.sunWarm = 1;
    if (S.flock.visible) {
      const u = S.heroU(t), arc = hero.arc;
      const Hd = arc.at(u), F = arc.at(u + 0.004).sub(arc.at(u - 0.004)).normalize();
      const Uv = Hd.clone().normalize();
      const X = new THREE.Vector3().crossVectors(Uv, F).normalize(), Yb = new THREE.Vector3().crossVectors(F, X);
      const basis = new THREE.Matrix4().makeBasis(X, Yb, F);
      const land = ramp(hx, 0.985, 1.06);                      // touch down: glide in, fold, shrink away
      const sc = 0.0066 * (1 - land) * ramp(hx, 0, 0.02);
      dayAtFlock = ramp(Uv.dot(S.sun), -0.06, 0.1);
      S.sunWarm = ramp(Uv.dot(S.sun), 0.05, 0.45);
      S.birds.forEach((b, i) => {
        const [ox, oz] = b.off;
        const bob = 0.1 * Math.sin(t * 5.1 + b.phase);
        b.g.position.copy(Hd).addScaledVector(X, ox * sc).addScaledVector(F, oz * sc).addScaledVector(Yb, (0.6 + bob) * sc);
        b.g.quaternion.setFromRotationMatrix(basis);
        b.g.scale.setScalar(sc);
        const ph = t * 2 * Math.PI * 3.1 + b.phase;
        const a1 = (0.18 + 0.62 * Math.sin(ph)) * (1 - land) + 0.9 * land;
        const a2 = 0.38 * Math.sin(ph - 0.9) * (1 - land);
        for (const w of b.wings) { w.root.rotation.z = a1 * w.sx; w.tip.rotation.z = a2; w.root.rotation.y = -0.25 * land * w.sx; }
      });
    }
    S.trailLight.intensity = S.flock.visible ? 1.3 * (1 - dayAtFlock * 0.6) : 0;
    if (S.flock.visible) S.heads[HERO].getWorldPosition(S.trailLight.position);
    S.sunLight.position.copy(S.sun).multiplyScalar(10);
    S.sunLight.intensity = 2.8 * dayAtFlock;
    S.sunLight.color.setRGB(1, lerp(0.72, 0.95, S.sunWarm), lerp(0.5, 0.88, S.sunWarm));   // low sun = golden light
    S.hemi.intensity = 0.35 + 0.6 * dayAtFlock;

    // ---- exposure, bloom
    S.renderer.toneMappingExposure = 1.05 * ramp(t, 0, 0.75);
    S.bloom.strength = 0.5 + 0.25 * ramp(t, 8.1, 8.9) * (1 - ramp(t, 9.4, D));
    S.composer.render();

    S.drawText(t);
  },

  // ---------------------------------------------------------------- text layer
  drawText(t) {
    const S = this, g = S.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.filter = 'none';
    g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)';
    g.letterSpacing = '0px';
    g.textBaseline = 'alphabetic';
    g.textAlign = 'left';
    g.clearRect(0, 0, W, H);
    const F = (w, s) => `${w} ${s}px "Pretendard Variable"`;

    // opening block: kicker + headline (in 0.45–1.2, out faster at 4.35–4.6)
    {
      const inA = ease.outCubic(clamp((t - 0.45) / 0.6)), inB = ease.outCubic(clamp((t - 0.6) / 0.65));
      const out = ease.inCubic(clamp((t - 4.35) / 0.28));
      if (inA > 0 && out < 1) {
        g.globalAlpha = inA * (1 - out);
        g.font = F(600, 30); g.fillStyle = '#a9b4cf';
        g.fillText(TXT.kick, 72, 170 - 24 * (1 - inA) - 40 * out);
        g.globalAlpha = inB * (1 - out);
        g.font = F(800, 66); g.fillStyle = '#f6f1e7';
        g.letterSpacing = '-1px';
        g.fillText(TXT.head, 72, 252 + 34 * (1 - inB) - 50 * out);
        g.letterSpacing = '0px';
        // the accent rule under the headline
        g.globalAlpha = 1 - out;
        g.fillStyle = C.accent;
        g.fillRect(72, 290, 120 * ease.outCubic(clamp((t - 0.9) / 0.6)), 6);
        g.globalAlpha = 1;
      }
    }

    // site tags beside the markers (projected), each after its landing, gone as the camera dives
    const v = new THREE.Vector3(), vc = new THREE.Vector3();
    const tagOut = 1 - ease.inCubic(clamp((t - 4.3) / 0.3));
    for (const [k, s] of Object.entries(SITES)) {
      if (k === 'nz') continue;
      const t0 = k === 'nest' ? 1.4 : S.arrive[k] + 0.05;
      const a = ease.outCubic(clamp((t - t0) / 0.35)) * tagOut;
      if (a <= 0) continue;
      const p = S.marks[k].p;
      vc.copy(S.camera.position).sub(p).normalize();
      const vis = ramp(p.dot(vc), 0.05, 0.25);
      if (vis <= 0) continue;
      v.copy(p).project(S.camera);
      const x = (v.x * 0.5 + 0.5) * W, y = (-v.y * 0.5 + 0.5) * H;
      this.tag(g, x, y, s.name, s.sub, s.side, a * vis, k === 'nest');
    }

    // counter block: distance flown on the hero arc (example data), over a soft top scrim
    const hero = S.arcs[HERO];
    const cin = ease.outCubic(clamp((t - 4.85) / 0.5));
    if (cin > 0) {
      const sg = g.createLinearGradient(0, 0, 0, 560);
      sg.addColorStop(0, 'rgba(3,6,20,0.78)'); sg.addColorStop(0.6, 'rgba(3,6,20,0.45)'); sg.addColorStop(1, 'rgba(3,6,20,0)');
      g.globalAlpha = ramp(t, 4.4, 5.1);
      g.fillStyle = sg;
      g.fillRect(0, 0, W, 560);
      const km = hero.arc.km * hero.arc.sAt(S.heroU(t));
      const shown = Math.round(km / 10) * 10;
      const landed = clamp((t - (hero.L + hero.T)) / 0.35);
      const pop = 1 + 0.06 * Math.sin(Math.PI * landed);
      g.globalAlpha = cin;
      g.font = F(600, 30); g.fillStyle = '#a9b4cf';
      g.fillText(TXT.ckick, 72, 170 - 20 * (1 - cin));
      const num = String(shown).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      g.save();
      g.translate(72, 300 - 30 * (1 - cin));
      g.scale(pop, pop);
      g.font = F(800, 132); g.fillStyle = '#f6f1e7';
      const nw = this.digits(g, num, 0, 0);
      g.font = F(700, 52); g.fillStyle = C.accent;
      g.fillText(TXT.unit, nw + 16, 0);
      g.restore();
      g.font = F(600, 26); g.fillStyle = '#7f8bab';
      g.fillText(TXT.cnote, 72, 352 - 20 * (1 - cin));
      // progress line: nest → nz
      const bw = 936;
      g.fillStyle = 'rgba(246,241,231,0.16)';
      g.fillRect(72, 384, bw, 4);
      g.fillStyle = C.accent;
      g.fillRect(72, 384, bw * hero.arc.sAt(S.heroU(t)) * cin, 4);
      g.globalAlpha = 1;
    }

    // arrival card beside New Zealand
    const ca = ease.outCubic(clamp((t - 7.75) / 0.45));
    if (ca > 0) {
      const p = S.marks.nz.p;
      v.copy(p).project(S.camera);
      const x = (v.x * 0.5 + 0.5) * W, y = (-v.y * 0.5 + 0.5) * H;
      this.card(g, x, y, ca);
    }
    g.globalAlpha = 1;
  },

  /** digits in fixed-width cells (canvas has no tabular figures), so the counter does not wobble as it runs */
  digits(g, str, x, y) {
    let cell = 0;
    for (let d = 0; d < 10; d++) cell = Math.max(cell, g.measureText(String(d)).width);
    cell *= 0.94;
    let cx = x;
    for (const ch of str) {
      const w = g.measureText(ch).width;
      if (ch >= '0' && ch <= '9') { g.fillText(ch, cx + (cell - w) / 2, y); cx += cell; }
      else { g.fillText(ch, cx - 4, y); cx += w - 8; }
    }
    return cx - x;
  },

  tag(g, x, y, name, sub, side, a, big) {
    g.save();
    g.globalAlpha = a;
    const F = (w, s) => `${w} ${s}px "Pretendard Variable"`;
    g.font = F(700, big ? 34 : 30);
    const nw = g.measureText(name).width;
    g.font = F(500, big ? 26 : 24);
    const sw = g.measureText(sub).width;
    const h = big ? 58 : 52, pw = nw + sw + 58;
    const gap = 30 + 10 * (1 - a);
    const bx = clamp(side > 0 ? x + gap : x - gap - pw, 40, W - 40 - pw), by = y - h / 2;
    // leader line
    g.strokeStyle = 'rgba(246,241,231,0.55)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x + side * 12, y); g.lineTo(side > 0 ? bx : bx + pw, y);
    g.stroke();
    g.fillStyle = 'rgba(8,14,36,0.78)';
    g.beginPath(); g.roundRect(bx, by, pw, h, h / 2); g.fill();
    g.fillStyle = C.accent;
    g.beginPath(); g.arc(bx + 24, y, 6, 0, Math.PI * 2); g.fill();
    g.font = F(700, big ? 34 : 30); g.fillStyle = '#f6f1e7';
    g.fillText(name, bx + 40, y + (big ? 12 : 10));
    g.font = F(500, big ? 26 : 24); g.fillStyle = '#a9b4cf';
    g.fillText(sub, bx + 40 + nw + 10, y + (big ? 10 : 9));
    g.restore();
  },

  card(g, x, y, a) {
    g.save();
    const F = (w, s) => `${w} ${s}px "Pretendard Variable"`;
    const bx = Math.min(x + 54, W - 72 - 520), by = y - 150 - 26 * (1 - a);
    g.globalAlpha = a;
    g.strokeStyle = 'rgba(246,241,231,0.6)';
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(x + 10, y - 8); g.lineTo(bx + 30, by + 118); g.stroke();
    g.fillStyle = 'rgba(8,14,36,0.82)';
    g.beginPath(); g.roundRect(bx, by, 520, 118, 30); g.fill();
    g.fillStyle = C.accent;
    g.fillRect(bx + 30, by + 30, 6, 58);
    g.font = F(800, 50); g.fillStyle = '#f6f1e7';
    g.fillText(TXT.arrive, bx + 56, by + 66);
    g.font = F(500, 24); g.fillStyle = '#a9b4cf';
    g.fillText(TXT.arriveSub, bx + 56, by + 100);
    g.restore();
  },
});
