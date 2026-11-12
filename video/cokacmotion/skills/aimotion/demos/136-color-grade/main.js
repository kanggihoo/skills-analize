/*
 * 136 · 같은 골목, 세 개의 기억 — 컬러 그레이딩 · 3D LUT + 낮을 밤으로
 *
 * One illustrated alley is painted once in setup (Canvas 2D, every shape projected from a small 3D layout of walls,
 * ground and props) together with its mattes: an emissive mask with a light id per practical (windows, street lamps,
 * moon, stars, a far hillside), a sky matte, and the sun × ambient-occlusion factor the painting was lit with, so the
 * night pass can divide it out again and relight the albedo with the practicals.
 *
 * Three grades are built on the CPU as 33³ 3D LUTs from real grade parameters — exposure, white balance (Bradford
 * adaptation from a Kelvin/tint white point to D65), a scotopic (Purkinje) mix for night, ASC CDL slope/offset/power
 * from lift/gamma/gain + saturation, a monotone S curve, hue-vs-sat/hue/luma curves and split toning in OKLab — and
 * uploaded as Data3DTextures. One full-screen ShaderMaterial samples them with hardware trilinear filtering and blends
 * the outputs per pixel: the first transition is carried by a light leak, the second falls from the sky down, and the
 * climax splits the frame into three bands — the same frame three ways.
 * Spatial work stays in the shader (a LUT is a colour → colour function only): light leaks (closed-form gradients),
 * halation, gate weave, grain (hash of pixel and film frame), vignettes, the sky ND window, and the practicals of the
 * day-for-night recipe (pool × albedo + glow + emissive core).
 */
import * as THREE from 'three';
import { defineDemo, rand, clamp, lerp, ramp, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';

const D = 10;
const PS = 1.1, PW = Math.round(1080 * PS), PH = Math.round(1920 * PS);   // plate: 1.1 texels per stage px (room to push in)
const QS = 4, QW = 1080 / QS, QH = 1920 / QS;                             // light / halation maps: quarter of the stage
const N = 33;                                                             // LUT lattice: 33³
const KR = '"Pretendard Variable"';
const ACCENT = '#ffb15e';                                                 // the street lamp's light, the one accent

// ---------------------------------------------------------------- timeline (s)
const T_FADE = 0.45;               // the day fades up
const T1 = [1.4, 2.4];             // 오늘 → 그날의 기억: a light leak burns across, the memory grade lives behind it
const WEAVE = [1.9, 2.4, 3.6, 4.1];// gate weave fades in / out
const T2 = [3.45, 4.55];           // 그날의 기억 → 그날 밤: night falls from the sky down
const T_LAMP = 4.72;               // the street lamp flickers on (the big beat)
const T_SPLIT = [5.2, 5.9];        // two dividers land: the same frame three ways (the climax, poster 6.0 s)
const T_UNSPLIT = [7.85, 8.3];     // the dividers leave (faster), night again
const T_OFF = 9.15;                // the near window goes dark; the scene settles into the lamp's afterglow

// ---------------------------------------------------------------- small maths
const sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const hexRGB = (h) => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const toLin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const toEnc = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
const css = (e, a = 1) => `rgba(${Math.round(clamp(e[0]) * 255)},${Math.round(clamp(e[1]) * 255)},${Math.round(clamp(e[2]) * 255)},${a})`;
const mixHex = (a, b, k) => { const x = hexRGB(a), y = hexRGB(b); return css(x.map((v, i) => lerp(v, y[i], k))); };
const mul3 = (M, v) => [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]];
const mulM = (A, B) => { const o = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o.push(A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c]); return o; };
function inv3(m) {
  const [a, b, c, d, e, f, g, h, i] = m, A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C;
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map((v) => v / det);
}
// integer hash → [0,1) (weave), deterministic
const hash1 = (k) => { let x = Math.imul((k | 0) ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; };
const vnoise1 = (x, s) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash1(i * 7 + s * 1013), hash1((i + 1) * 7 + s * 1013), u); };

// =================================================================== colour science: grade parameters → 33³ LUT
const RGB2XYZ = [0.4124564, 0.3575761, 0.1804375, 0.2126729, 0.7151522, 0.072175, 0.0193339, 0.119192, 0.9503041];
const XYZ2RGB = inv3(RGB2XYZ);
const BRADFORD = [0.8951, 0.2664, -0.1614, -0.7502, 1.7135, 0.0367, 0.0389, -0.0685, 1.0296];
const D65 = [0.95047, 1, 1.08883];

// Planckian locus (Kim et al. cubic fit), xy chromaticity of a blackbody at T kelvin
function planckXY(T) {
  const t = 1e3 / T, x = T <= 4000 ? -0.2661239 * t ** 3 - 0.2343589 * t * t + 0.8776956 * t + 0.17991
    : -3.0258469 * t ** 3 + 2.1070379 * t * t + 0.2226347 * t + 0.24039;
  const y = T <= 2222 ? -1.1063814 * x ** 3 - 1.3481102 * x * x + 2.18555832 * x - 0.20219683
    : T <= 4000 ? -0.9549476 * x ** 3 - 1.37418593 * x * x + 2.09137015 * x - 0.16748867
      : 3.081758 * x ** 3 - 5.8733867 * x * x + 3.75112997 * x - 0.37001483;
  return [x, y];
}
const xy2uv = ([x, y]) => { const d = -2 * x + 12 * y + 3; return [4 * x / d, 6 * y / d]; };
const uv2xy = ([u, v]) => { const d = 2 * u - 8 * v + 4; return [3 * u / d, 2 * v / d]; };
// unit normal to the locus in CIE 1960 uv, pointing to the green side (+Duv)
function locusNormal(T) {
  const a = xy2uv(planckXY(T)), b = xy2uv(planckXY(T * 1.01)), tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty);
  let nx = -ty / l, ny = tx / l;
  if (ny < 0) { nx = -nx; ny = -ny; }
  return [nx, ny];
}
const DUV65 = (() => { const a = xy2uv(planckXY(6504)), d = xy2uv([0.3127, 0.329]), n = locusNormal(6504); return (d[0] - a[0]) * n[0] + (d[1] - a[1]) * n[1]; })();
// white point of a light at T kelvin, tint in "image" units (+ = the picture goes magenta)
function whiteXY(T, tint) {
  const a = xy2uv(planckXY(T)), n = locusNormal(T), duv = DUV65 + tint * 0.0015;
  return uv2xy([a[0] + n[0] * duv, a[1] + n[1] * duv]);
}
// camera white balance: the light the camera is balanced for (T, tint) is mapped to D65 (Bradford CAT), in linear sRGB.
// A daylight scene shot at 3300K turns blue (the classic day-for-night move); balanced for 9000K it turns warm.
function wbMatrix(T, tint) {
  const [x, y] = whiteXY(T, tint), src = [x / y, 1, (1 - x - y) / y];
  const ls = mul3(BRADFORD, src), ld = mul3(BRADFORD, D65);
  const Dg = [ld[0] / ls[0], 0, 0, 0, ld[1] / ls[1], 0, 0, 0, ld[2] / ls[2]];
  return mulM(XYZ2RGB, mulM(mulM(inv3(BRADFORD), mulM(Dg, BRADFORD)), RGB2XYZ));
}
// OKLab (Ottosson) ↔ linear sRGB
function oklab([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function fromOklab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3,
    s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
// monotone cubic (Fritsch–Carlson) through curve points: an S curve that never overshoots or inverts
function monotone(pts) {
  const n = pts.length, X = pts.map((p) => p[0]), Y = pts.map((p) => p[1]), d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d.push((Y[i + 1] - Y[i]) / (X[i + 1] - X[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return (x) => {
    if (x <= X[0]) return Y[0] + m[0] * (x - X[0]);
    if (x >= X[n - 1]) return Y[n - 1] + m[n - 1] * (x - X[n - 1]);
    let i = 0;
    while (x > X[i + 1]) i++;
    const h = X[i + 1] - X[i], t = (x - X[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * Y[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * Y[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

// The three grades. kelvin/tint = camera white balance; lift/gamma/gain are converted to ASC CDL (slope = gain − lift,
// offset = lift, power = 1/gamma); hue entries are bumps on the OKLCh hue circle (degrees): sat ×(1+sat), hue +shift°,
// lightness +lum (weighted by chroma); split = OKLab tint of shadows (sh/sa) and highlights (hh/ha).
const GRADES = [
  { num: '01', name: '오늘', sub: 'WB 6800K · S커브 대비', ev: 0, kelvin: 6800, tint: 0, rod: 0,
    lift: [0, 0, 0], gamma: [1, 1, 1], gain: [1, 1, 1], sat: 1.06,
    curve: [[0, 0], [0.22, 0.2], [0.5, 0.5], [0.78, 0.8], [1, 1]], hue: [], split: null },
  { num: '02', name: '그날의 기억', sub: 'WB 9000K · 바랜 검정 · 할레이션 · 입자', ev: 0.12, kelvin: 9000, tint: 3, rod: 0,
    lift: [0.05, 0.036, 0.022], gamma: [1.04, 1.0, 0.95], gain: [1.0, 0.97, 0.88], sat: 0.84,
    curve: [[0, 0.07], [0.22, 0.25], [0.5, 0.53], [0.8, 0.84], [1, 0.95]],
    hue: [{ h: 142, sat: -0.38, shift: -20 }, { h: 250, sat: -0.5, shift: -18 }, { h: 55, sat: 0.12 }],
    split: { sh: 195, sa: 0.018, hh: 78, ha: 0.03 } },
  { num: '03', name: '그날 밤', sub: 'WB 3300K · −2.4 EV · 하늘 −1.7 EV', ev: -2.4, kelvin: 3300, tint: -6, rod: 0.55,
    lift: [0, 0.008, 0.022], gamma: [0.96, 1.0, 1.06], gain: [0.86, 0.96, 1.08], sat: 0.62,
    curve: [[0, 0.012], [0.2, 0.15], [0.5, 0.43], [0.8, 0.65], [1, 0.74]],
    hue: [{ h: 250, lum: -0.22 }, { h: 142, sat: -0.5 }, { h: 45, sat: -0.35 }],
    split: { sh: 255, sa: 0.025, hh: 215, ha: 0.015 } },
];
const SKY_ND = Math.pow(2, -1.7);   // night: graduated ND on the sky matte (a power window, applied before the LUT)
const ROD_TINT = [0.85, 0.95, 1.1];

/** grade one encoded sRGB colour → encoded sRGB (the function the LUT tabulates) */
function makeGrade(G) {
  const M = wbMatrix(G.kelvin, G.tint), ex = Math.pow(2, G.ev);
  const slope = G.gain.map((g, i) => g - G.lift[i]), offset = G.lift, power = G.gamma.map((g) => 1 / g);
  const curve = monotone(G.curve);
  const bumps = G.hue.map((b) => ({ h: b.h, w: b.w || 34, sat: b.sat || 0, shift: b.shift || 0, lum: b.lum || 0 }));
  const sp = G.split;
  return (c) => {
    // 1. exposure + white balance (linear light)
    let lin = c.map((v) => toLin(v) * ex);
    lin = mul3(M, lin);
    // 2. night: rods take over (Larson's scotopic luminance V = Y·(1.33·(1 + (Y+Z)/X) − 1.68), normalised so D65 → 1)
    if (G.rod) {
      const [X, Y, Z] = mul3(RGB2XYZ, lin.map((v) => Math.max(v, 0)));
      const V = X > 1e-6 ? Math.max(0, Y * (1.33 * (1 + (Y + Z) / X) - 1.68)) / 2.5734 : 0;
      lin = lin.map((v, i) => lerp(v, V * ROD_TINT[i], G.rod));
    }
    // 3. ASC CDL in the encoded (display) domain: out = (in·slope + offset)^power, then saturation about Rec.709 luma
    let e = lin.map((v, i) => Math.pow(Math.max(0, toEnc(Math.max(v, 0)) * slope[i] + offset[i]), power[i]));
    const l = 0.2126 * e[0] + 0.7152 * e[1] + 0.0722 * e[2];
    e = e.map((v) => l + G.sat * (v - l));
    // 4. tone curve per channel (the S)
    e = e.map((v) => curve(Math.max(0, v)));
    // 5. hue curves + split toning in OKLab / OKLCh
    let [L, a, b] = oklab(e.map((v) => toLin(clamp(v, 0, 1.5))));
    let C = Math.hypot(a, b), h = Math.atan2(b, a) * 180 / Math.PI;
    let ks = 1, dh = 0, dl = 0;
    for (const u of bumps) {
      let dd = h - u.h; dd -= 360 * Math.round(dd / 360);
      const w = Math.exp(-(dd / u.w) * (dd / u.w));
      ks += u.sat * w; dh += u.shift * w; dl += u.lum * w;
    }
    C *= Math.max(0, ks); h += dh;
    L *= 1 + dl * Math.min(1, C / 0.09);
    a = C * Math.cos(h * Math.PI / 180); b = C * Math.sin(h * Math.PI / 180);
    if (sp) {
      const ws = 1 - sstep(0.12, 0.62, L), wh = sstep(0.45, 0.95, L);
      a += sp.sa * ws * Math.cos(sp.sh * Math.PI / 180) + sp.ha * wh * Math.cos(sp.hh * Math.PI / 180);
      b += sp.sa * ws * Math.sin(sp.sh * Math.PI / 180) + sp.ha * wh * Math.sin(sp.hh * Math.PI / 180);
    }
    return fromOklab([L, a, b]).map((v) => clamp(toEnc(Math.max(0, v))));
  };
}
/** tabulate a grade on the N³ lattice: index ((b·N + g)·N + r)·4 → texture(lut, vec3(r, g, b)) */
function buildLut(G) {
  const f = makeGrade(G), data = new Float32Array(N * N * N * 4);
  for (let bi = 0, o = 0; bi < N; bi++) for (let gi = 0; gi < N; gi++) for (let ri = 0; ri < N; ri++, o += 4) {
    const v = f([ri / (N - 1), gi / (N - 1), bi / (N - 1)]);
    data[o] = v[0]; data[o + 1] = v[1]; data[o + 2] = v[2]; data[o + 3] = 1;
  }
  return data;
}
/** the same trilinear lookup the GPU does (for the palette chips) */
function lutSample(L, c) {
  const p = c.map((v) => clamp(v) * (N - 1)), i0 = p.map((v) => Math.min(N - 2, Math.floor(v))), f = p.map((v, k) => v - i0[k]);
  const out = [0, 0, 0];
  for (let dz = 0; dz < 2; dz++) for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
    const w = (dx ? f[0] : 1 - f[0]) * (dy ? f[1] : 1 - f[1]) * (dz ? f[2] : 1 - f[2]);
    const o = (((i0[2] + dz) * N + i0[1] + dy) * N + i0[0] + dx) * 4;
    out[0] += w * L[o]; out[1] += w * L[o + 1]; out[2] += w * L[o + 2];
  }
  return out;
}

// =================================================================== the alley: a 3D layout (metres) → stage px
const F = 880, CX = 540, CY = 880, EYE = 1.55;            // pinhole: focal px, principal point (horizon), eye height
const XL = -1.65, XR = 1.65, ZEND = 26, HF = 4.6;         // alley walls, the far house at the end
const P = (X, Y, Z) => [CX + F * X / Z, CY - F * (Y - EYE) / Z];
const K_SUN = 0.4;                                         // sun from the right, high: shadow runs 0.4 m per metre of height
const EAVE = 0.38;                                         // tile eave overhang (its shadow band is EAVE / K_SUN tall)
const POLE = { X: 1.5, Z: 4.0, r: 0.14 };
const LAMP = { X: 1.05, Y: 4.08, Z: 4.0 };
const LAMP2 = { X: 1.02, Y: 3.85, Z: 14 };

const LEFT = [
  { z0: 1.0, z1: 6.2, h: 5.8, col: '#f1e0c1', roof: 'tile', items: [
    { t: 'win', z0: 3.0, z1: 4.1, y0: 1.25, y1: 2.35, light: 'L1a', curtain: 0.42, grille: true, pot: true },
    { t: 'win', z0: 4.6, z1: 5.7, y0: 3.3, y1: 4.25, light: 'L1b', blind: true },
    { t: 'door', z0: 4.75, z1: 5.6, col: '#3f8189' },
    { t: 'pipe', z: 6.1 }] },
  { z0: 6.2, z1: 11.0, h: 6.6, col: '#c06d50', roof: 'flat', brick: true, items: [
    { t: 'win', z0: 7.0, z1: 8.3, y0: 3.55, y1: 4.55, light: 'L2b', curtain: 0.35, grille: true },
    { t: 'win', z0: 7.0, z1: 8.3, y0: 1.2, y1: 2.2, grille: true },
    { t: 'ac', z0: 9.2, z1: 10.0, y0: 2.75, y1: 3.35 },
    { t: 'pipe', z: 10.9 }] },
  { z0: 11.0, z1: 16.5, h: 5.2, col: '#d3dcc1', roof: 'tile', items: [
    { t: 'win', z0: 12.0, z1: 13.2, y0: 2.6, y1: 3.45, light: 'L3a', curtain: 0.5 },
    { t: 'door', z0: 14.2, z1: 15.1, col: '#8a5b3d' }] },
  { z0: 16.5, z1: ZEND, h: 6.0, col: '#e9d6b4', roof: 'tile', items: [
    { t: 'win', z0: 18.5, z1: 19.8, y0: 1.5, y1: 2.4 }] },
];
const RIGHT = [
  { z0: 1.0, z1: 5.4, h: 5.0, col: '#c7d6dd', roof: 'tile', items: [
    { t: 'win', z0: 2.9, z1: 3.65, y0: 2.6, y1: 3.5, light: 'R1a', curtain: 0.5, grille: true }] },
  { z0: 5.4, z1: 10.0, h: 5.6, col: '#ddd0bc', roof: 'tile', items: [
    { t: 'win', z0: 5.9, z1: 7.0, y0: 3.2, y1: 4.05, light: 'R2a', blind: true },
    { t: 'shutter', z0: 7.4, z1: 9.5, y0: 0, y1: 2.45 },
    { t: 'pipe', z: 9.9 }] },
  { z0: 10.0, z1: 15.0, h: 6.4, col: '#c4d9cc', roof: 'rail', items: [
    { t: 'win', z0: 11.0, z1: 12.2, y0: 3.6, y1: 4.5, light: 'R3b', curtain: 0.4 },
    { t: 'win', z0: 11.0, z1: 12.2, y0: 1.45, y1: 2.35, grille: true },
    { t: 'door', z0: 13.3, z1: 14.2, col: '#5b709b' }] },
  { z0: 15.0, z1: ZEND, h: 5.2, col: '#eddcbe', roof: 'tile', items: [] },
];
const hAt = (list, z) => { for (const s of list) if (z >= s.z0 && z < s.z1) return s.h; return 0; };
const houseAt = (list, z) => { for (const s of list) if (z >= s.z0 && z < s.z1) return s; return null; };

/** which surface of the layout a stage pixel sees: [type, X, Y, Z] (1 ground, 2 left wall, 3 right wall, 4 far wall) */
function hit(x, y) {
  const dx = (x - CX) / F, dy = (CY - y) / F;
  let z = Infinity, type = 0;
  if (dy < 0) { const zz = -EYE / dy; if (zz <= ZEND && Math.abs(dx * zz) <= XR) { z = zz; type = 1; } }
  if (dx < 0) { const zz = XL / dx, Y = EYE + dy * zz; if (zz < z && zz <= ZEND && Y >= 0 && Y <= hAt(LEFT, zz)) { z = zz; type = 2; } }
  if (dx > 0) { const zz = XR / dx, Y = EYE + dy * zz; if (zz < z && zz <= ZEND && Y >= 0 && Y <= hAt(RIGHT, zz)) { z = zz; type = 3; } }
  if (!type) { const Y = EYE + dy * ZEND; if (Math.abs(dx * ZEND) <= XR && Y >= 0 && Y <= HF) { z = ZEND; type = 4; } }
  return type ? [type, dx * z, EYE + dy * z, z] : null;
}
const NRM = [null, [0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, -1]];
/** direct sun on a surface point: 1 lit, 0 in shadow (soft edge) */
function sunAt(type, X, Y, Z) {
  if (type === 1) {
    const xs = XR - K_SUN * hAt(RIGHT, Z);
    let f = 1 - sstep(xs - 0.05, xs + 0.05, X);
    if (X < POLE.X) f *= 1 - 0.9 * (1 - sstep(0.1, 0.17, Math.abs(Z - POLE.Z)));   // the pole's shadow
    return f;
  }
  if (type === 2) { const s = houseAt(LEFT, Z); if (s && s.roof === 'tile') { const yb = s.h - EAVE / K_SUN; return 1 - sstep(yb - 0.04, yb + 0.04, Y); } return 1; }
  if (type === 3) return 0;
  if (type === 4) return 0.55;
  return 1;
}
function aoAt(type, X, Y, Z) {
  if (type === 1) return (1 - 0.3 * Math.exp(-(XR - Math.abs(X)) / 0.28)) * (1 - 0.25 * Math.exp(-(ZEND - Z) / 0.6));
  if (type === 2 || type === 3) { const h = hAt(type === 2 ? LEFT : RIGHT, Z); return (1 - 0.32 * Math.exp(-Y / 0.42)) * (1 - 0.2 * Math.exp(-(h - Y) / 0.3)); }
  if (type === 4) return 1 - 0.3 * Math.exp(-Y / 0.4);
  return 1;
}
const SUN_COL = [1.0, 0.975, 0.93], SHADE_COL = [0.55, 0.61, 0.76];
const shadeRGB = (f) => SHADE_COL.map((s, i) => lerp(s, SUN_COL[i], f));

// =================================================================== painting helpers (stage coordinates)
const shp = (g, pts) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
const fill = (g, pts, c) => { shp(g, pts); g.fillStyle = c; g.fill(); };
const seg = (g, a, b, c, w) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.strokeStyle = c; g.lineWidth = w; g.stroke(); };
const wq = (X, z0, z1, y0, y1) => [P(X, y0, z0), P(X, y1, z0), P(X, y1, z1), P(X, y0, z1)];   // on a side wall
const gq = (x0, x1, z0, z1, Y = 0) => [P(x0, Y, z0), P(x1, Y, z0), P(x1, Y, z1), P(x0, Y, z1)]; // horizontal
const fq = (x0, x1, y0, y1, Z) => [P(x0, y0, Z), P(x1, y0, Z), P(x1, y1, Z), P(x0, y1, Z)];    // facing the camera
const bboxOf = (pts, pad = 2) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) + pad, Math.max(...ys) + pad];
};
/** a leaf / lens: base → tip with half-width w */
function leaf(g, bx, by, tx, ty, w, bend = 0) {
  const mx = (bx + tx) / 2, my = (by + ty) / 2, dx = tx - bx, dy = ty - by, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
  g.beginPath(); g.moveTo(bx, by);
  g.quadraticCurveTo(mx + nx * (w + bend), my + ny * (w + bend), tx, ty);
  g.quadraticCurveTo(mx - nx * (w - bend), my - ny * (w - bend), bx, by);
  g.fill();
}

// ---------------------------------------------------------------- sky + far hillside (behind everything, sky matte = 1)
function paintSky(g, town) {
  const gr = g.createLinearGradient(0, -150, 0, 880);
  gr.addColorStop(0, '#5ea6de'); gr.addColorStop(0.42, '#8ec4ea'); gr.addColorStop(0.8, '#cfe6f1'); gr.addColorStop(1, '#f2ecdb');
  g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
  const cloud = (x, y, s) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.beginPath();
    for (const [px, py, r] of [[-118, 4, 42], [-70, -24, 56], [-6, -50, 70], [62, -26, 58], [116, 2, 40]]) { g.moveTo(px + r, py); g.arc(px, py, r, 0, Math.PI * 2); }
    g.roundRect(-150, -8, 300, 50, 25);
    g.fillStyle = '#fbfdff'; g.fill();
    g.clip();
    const sh = g.createLinearGradient(-40, -120, 40, 44);
    sh.addColorStop(0, 'rgba(214,230,244,0)'); sh.addColorStop(0.62, 'rgba(214,230,244,0.05)'); sh.addColorStop(1, 'rgba(196,216,234,0.85)');
    g.fillStyle = sh; g.fillRect(-200, -160, 400, 220);
    g.restore();
  };
  cloud(560, 215, 1.15); cloud(745, 470, 0.5); cloud(395, 545, 0.46);
  // far hillside village beyond the end of the alley (atmospheric, pale)
  g.fillStyle = '#b9ccd6';
  g.beginPath(); g.moveTo(380, 900); g.lineTo(380, 720);
  g.bezierCurveTo(430, 676, 480, 650, 548, 646); g.bezierCurveTo(610, 642, 660, 668, 720, 700); g.lineTo(720, 900); g.fill();
  const r = rand(1360);
  for (let i = 0; i < 34; i++) {
    const x = 420 + r() * 280, top = 690 - 46 * Math.exp(-(((x - 548) / 120) ** 2)), y = top + 6 + r() * 90, w = 9 + r() * 10, h = 7 + r() * 6;
    g.fillStyle = r() < 0.5 ? '#cddae0' : '#c3d2da'; g.fillRect(x, y, w, h);
    g.fillStyle = '#9fb4c3'; g.fillRect(x - 1, y - 2.5, w + 2, 3);
    if (r() < 0.55) town.push([x + 2 + r() * (w - 5), y + 3 + r() * 2]);
  }
}

// ---------------------------------------------------------------- architecture: ground, far house, both walls
function paintArch(g, E, R) {
  // far house at the end of the alley, facing us
  fill(g, fq(XL - 0.2, XR + 0.2, 0, HF, ZEND), '#e8dbc3');
  fill(g, [P(XL - 0.55, HF - 0.05, ZEND - 0.3), P(XR + 0.55, HF - 0.05, ZEND - 0.3), P(XR - 0.2, HF + 1.3, ZEND + 2.4), P(XL + 0.2, HF + 1.3, ZEND + 2.4)], '#67737f');
  fill(g, fq(XL - 0.55, XR + 0.55, HF - 0.12, HF + 0.08, ZEND - 0.3), '#4f5a66');
  fill(g, fq(-1.05, -0.2, 0, 2.05, ZEND - 0.01), '#7a5b45');
  fill(g, fq(0.25, 1.2, 1.25, 2.15, ZEND - 0.01), '#f3eee4');
  const fwin = fq(0.33, 1.12, 1.33, 2.07, ZEND - 0.01);
  fill(g, fwin, '#61798a');
  fill(E, fwin, '#fff');
  R.light('F', { bbox: bboxOf(fwin, 3), pos: [0.7, 1.7, ZEND - 0.35], nrm: [0, 0, -1] });

  // ground: concrete slabs, a centre channel, a manhole, cracks, a few leaves
  fill(g, gq(XL, XR, 1.0, ZEND), '#d4cab8');
  fill(g, gq(-0.13, 0.13, 1.0, ZEND), '#c4b9a6');
  seg(g, P(0, 0, 1.2), P(0, 0, ZEND), 'rgba(110,100,86,0.35)', 2);
  for (let z = 1.9; z < ZEND; z += 1.45) seg(g, P(XL, 0, z), P(XR, 0, z), 'rgba(120,110,95,0.32)', Math.max(1, 5 / z));
  for (const s of [-1, 1]) fill(g, gq(s < 0 ? XL : XR - 0.16, s < 0 ? XL + 0.16 : XR, 1.0, ZEND), '#c9bfad');
  const mh = (rr) => Array.from({ length: 40 }, (_, i) => P(-0.62 + rr * Math.cos(i / 40 * 6.2832), 0, 2.55 + rr * Math.sin(i / 40 * 6.2832)));
  fill(g, mh(0.33), '#8e877b'); fill(g, mh(0.27), '#9d968a');
  g.save(); shp(g, mh(0.27)); g.clip();
  for (let k = -6; k <= 6; k++) seg(g, P(-0.62 + k * 0.045, 0, 2.2), P(-0.62 + k * 0.045, 0, 2.9), 'rgba(90,84,74,0.5)', 2);
  g.restore();
  const rr = rand(77);
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < 7; i++) {
    let x = -1.2 + rr() * 2.4, z = 1.6 + rr() * 9;
    g.beginPath(); g.moveTo(...P(x, 0, z));
    for (let k = 0; k < 4; k++) { x += (rr() - 0.5) * 0.25; z += 0.15 + rr() * 0.3; g.lineTo(...P(x, 0, z)); }
    g.strokeStyle = 'rgba(120,108,92,0.45)'; g.lineWidth = Math.max(1, 3 / z); g.stroke();
  }
  for (let i = 0; i < 16; i++) {
    const x = -1.4 + rr() * 2.8, z = 1.5 + rr() * 7, [px, py] = P(x, 0, z), s = F / z * 0.06;
    g.fillStyle = ['#c98a4b', '#b8743d', '#d9a35a'][i % 3];
    g.save(); g.translate(px, py); g.rotate(rr() * 6.28); g.scale(1, 0.45);
    g.beginPath(); g.ellipse(0, 0, s, s * 0.55, 0, 0, 6.2832); g.fill(); g.restore();
  }
  for (const [list, side] of [[LEFT, -1], [RIGHT, 1]]) for (let i = list.length - 1; i >= 0; i--) house(g, E, R, list, i, side);
}

function house(g, E, R, list, i, side) {
  const s = list[i], X = side < 0 ? XL : XR, n = -side, zm = (s.z0 + s.z1) / 2, px = (m) => F * m / zm;
  fill(g, wq(X, s.z0, s.z1, 0, s.h), s.col);
  fill(g, wq(X, s.z0, s.z1, 0, 0.42), mixHex(s.col, '#7d766b', 0.38));
  seg(g, P(X, 0.42, s.z0), P(X, 0.42, s.z1), 'rgba(255,255,255,0.35)', Math.max(1, px(0.02)));
  if (s.brick) {
    for (let y = 0.63, row = 0; y < s.h; y += 0.21, row++) {
      seg(g, P(X, y, s.z0), P(X, y, s.z1), 'rgba(110,46,30,0.30)', Math.max(1, px(0.018)));
      for (let z = s.z0 + (row % 2) * 0.22; z < s.z1; z += 0.44) seg(g, P(X, y - 0.21, z), P(X, y, z), 'rgba(110,46,30,0.24)', Math.max(0.8, F * 0.016 / z));
    }
    const rb = rand(611);
    for (let k = 0; k < 70; k++) {
      const row = Math.floor(rb() * (s.h - 0.7) / 0.21), y = 0.42 + row * 0.21, z = s.z0 + Math.floor(rb() * (s.z1 - s.z0) / 0.44) * 0.44 + (row % 2) * 0.22;
      if (z + 0.44 > s.z1) continue;
      fill(g, wq(X, z + 0.02, z + 0.42, y + 0.02, y + 0.19), rb() < 0.5 ? 'rgba(255,220,190,0.12)' : 'rgba(80,30,20,0.12)');
    }
  } else {
    // plaster mottling: a few soft stains
    const rs = rand(900 + i * 17 + side * 5);
    for (let k = 0; k < 5; k++) {
      const z = lerp(s.z0, s.z1, rs()), y = 0.6 + rs() * (s.h - 1), [qx, qy] = P(X, y, z), rr = F * (0.3 + rs() * 0.5) / z;
      const gg = g.createRadialGradient(qx, qy, 0, qx, qy, rr);
      gg.addColorStop(0, 'rgba(120,100,70,0.07)'); gg.addColorStop(1, 'rgba(120,100,70,0)');
      g.fillStyle = gg; g.fillRect(qx - rr, qy - rr, rr * 2, rr * 2);
    }
  }
  // a taller house shows the slice of its front side above a lower, nearer neighbour
  const near = list[i - 1];
  if (near && near.h < s.h) fill(g, fq(X, X + side * 4, near.h, s.h, s.z0), mixHex(s.col, '#55606e', 0.22));
  for (const it of s.items) {
    if (it.t === 'win') windowAt(g, E, R, X, n, it);
    else if (it.t === 'door') doorAt(g, X, n, it);
    else if (it.t === 'pipe') {
      const a = P(X + n * 0.07, 0, it.z), b = P(X + n * 0.07, s.h - 0.1, it.z);
      seg(g, a, b, '#9a958c', Math.max(2, F * 0.09 / it.z)); seg(g, a, b, 'rgba(255,255,255,0.35)', Math.max(1, F * 0.025 / it.z));
    } else if (it.t === 'ac') {
      const Xf = X + n * 0.32;
      fill(g, [P(X, it.y1, it.z0), P(Xf, it.y1, it.z0), P(Xf, it.y1, it.z1), P(X, it.y1, it.z1)], '#d9d6cf');
      fill(g, wq(Xf, it.z0, it.z1, it.y0, it.y1), '#ecebe6');
      fill(g, [P(X, it.y0, it.z0), P(Xf, it.y0, it.z0), P(Xf, it.y1, it.z0), P(X, it.y1, it.z0)], '#c9c5bd');
      const zc = it.z0 + 0.36, yc = (it.y0 + it.y1) / 2, ring = (r) => Array.from({ length: 28 }, (_, k) => P(Xf, yc + r * Math.sin(k / 28 * 6.2832), zc + r * Math.cos(k / 28 * 6.2832)));
      fill(g, ring(0.22), '#8f949a'); fill(g, ring(0.17), '#6f757c');
      seg(g, P(X, it.y0 + 0.1, it.z1 - 0.05), P(X + n * 0.05, 0.3, it.z1 + 0.2), '#bdb8ae', Math.max(1.5, F * 0.03 / it.z1));
    } else if (it.t === 'shutter') {
      fill(g, wq(X, it.z0 - 0.08, it.z1 + 0.08, 0, it.y1 + 0.25), '#8d9196');
      fill(g, wq(X, it.z0, it.z1, 0, it.y1), '#b4b8bb');
      for (let y = 0.08; y < it.y1; y += 0.09) seg(g, P(X, y, it.z0), P(X, y, it.z1), 'rgba(80,86,92,0.32)', Math.max(1, F * 0.012 / it.z0));
      fill(g, wq(X, (it.z0 + it.z1) / 2 - 0.15, (it.z0 + it.z1) / 2 + 0.15, 0.1, 0.18), '#5d6268');
    }
  }
  // roof edge
  if (s.roof === 'tile') {
    const Xe = X + n * EAVE, yb = s.h - 0.14;
    fill(g, [P(X, yb, s.z0), P(Xe, yb, s.z0), P(Xe, yb, s.z1), P(X, yb, s.z1)], '#5e5148');
    fill(g, [P(Xe, yb - 0.02, s.z0), P(Xe, s.h + 0.14, s.z0), P(Xe, s.h + 0.14, s.z1), P(Xe, yb - 0.02, s.z1)], '#58636f');
    // round tile ends hanging under the fascia: one scalloped strip
    g.beginPath(); g.moveTo(...P(Xe, yb - 0.01, s.z0));
    for (let z = s.z0; z < s.z1 - 0.01; z += 0.2) { const a = P(Xe, yb - 0.01, z), b = P(Xe, yb - 0.01, Math.min(s.z1, z + 0.2)), m = P(Xe, yb - 0.1, z + 0.1); g.lineTo(...a); g.quadraticCurveTo(m[0], m[1] + (m[1] - a[1]) * 0.6, b[0], b[1]); }
    g.lineTo(...P(Xe, yb + 0.05, s.z1)); g.lineTo(...P(Xe, yb + 0.05, s.z0)); g.closePath();
    g.fillStyle = '#4c5762'; g.fill();
    seg(g, P(Xe, s.h + 0.13, s.z0), P(Xe, s.h + 0.13, s.z1), 'rgba(255,255,255,0.22)', Math.max(1, px(0.02)));
  } else {
    fill(g, wq(X, s.z0, s.z1, s.h - 0.12, s.h + 0.1), mixHex(s.col, '#ffffff', 0.35));
    if (s.roof === 'rail') {
      const top = s.h + 0.95;
      for (let z = s.z0 + 0.1; z <= s.z1; z += 0.55) seg(g, P(X, s.h + 0.1, z), P(X, top, z), '#4f8a6e', Math.max(1.5, F * 0.035 / z));
      seg(g, P(X, top, s.z0), P(X, top, s.z1), '#4f8a6e', Math.max(2, F * 0.05 / zm));
      seg(g, P(X, s.h + 0.55, s.z0), P(X, s.h + 0.55, s.z1), '#4f8a6e', Math.max(1.5, F * 0.03 / zm));
    }
  }
}

function windowAt(g, E, R, X, n, w) {
  const { z0, z1, y0, y1 } = w, f = 0.075, zm = (z0 + z1) / 2, lw = (m) => Math.max(1.2, F * m / zm);
  fill(g, wq(X, z0 - f, z1 + f, y0 - f, y1 + f), '#f5f0e5');
  const glass = wq(X, z0, z1, y0, y1);
  fill(g, glass, '#536b7a');
  const a = P(X, y1, zm), b = P(X, y0, zm), gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
  gr.addColorStop(0, '#a9c2cf'); gr.addColorStop(0.5, '#7a95a4'); gr.addColorStop(1, '#4f6676');
  const gin = wq(X, z0 + 0.025, z1 - 0.025, y0 + 0.025, y1 - 0.025);
  fill(g, gin, gr);
  let curtain = null;
  if (w.curtain) {
    curtain = wq(X, z0 + 0.025, z0 + (z1 - z0) * w.curtain, y0 + 0.025, y1 - 0.025);
    fill(g, curtain, 'rgba(242,230,208,0.94)');
    for (let k = 1; k < 4; k++) { const z = lerp(z0, z0 + (z1 - z0) * w.curtain, k / 4); seg(g, P(X, y0 + 0.05, z), P(X, y1 - 0.05, z), 'rgba(180,160,130,0.35)', lw(0.02)); }
  }
  if (w.blind) {
    curtain = wq(X, z0 + 0.025, z1 - 0.025, y1 - (y1 - y0) * 0.38, y1 - 0.025);
    fill(g, curtain, 'rgba(236,226,206,0.95)');
    for (let y = y1 - 0.06; y > y1 - (y1 - y0) * 0.38; y -= 0.06) seg(g, P(X, y, z0 + 0.03), P(X, y, z1 - 0.03), 'rgba(170,150,120,0.4)', lw(0.012));
  }
  g.save(); shp(g, gin); g.clip();
  fill(g, [P(X, y1, lerp(z0, z1, 0.5)), P(X, y1, lerp(z0, z1, 0.68)), P(X, y0, lerp(z0, z1, 0.4)), P(X, y0, lerp(z0, z1, 0.22))], 'rgba(255,255,255,0.18)');
  g.restore();
  const bars = [];
  if (w.grille) {
    const Xg = X + n * 0.06;
    for (let k = 1; k < 5; k++) { const z = lerp(z0, z1, k / 5); bars.push([P(Xg, y0 - 0.02, z), P(Xg, y1 + 0.02, z), lw(0.03)]); }
    bars.push([P(Xg, (y0 + y1) / 2, z0 - 0.02), P(Xg, (y0 + y1) / 2, z1 + 0.02), lw(0.03)]);
    for (const [p, q, wd] of bars) seg(g, p, q, '#3b4149', wd);
  }
  // sill (seen from above below the eye line, from beneath above it)
  const ys = y0 - f, under = ys > EYE;
  fill(g, [P(X, ys, z0 - f - 0.04), P(X + n * 0.13, ys, z0 - f - 0.04), P(X + n * 0.13, ys, z1 + f + 0.04), P(X, ys, z1 + f + 0.04)], under ? '#b9b2a6' : '#ebe5d9');
  fill(g, wq(X + n * 0.13, z0 - f - 0.04, z1 + f + 0.04, ys - 0.05, ys), '#cdc5b7');
  let pot = null;
  if (w.pot) {
    const [qx, qy] = P(X + n * 0.07, ys, z0 + 0.32), sc = F / (z0 + 0.32);
    g.fillStyle = '#c4683f'; g.beginPath(); g.roundRect(qx - 0.1 * sc, qy - 0.16 * sc, 0.2 * sc, 0.16 * sc, 0.02 * sc); g.fill();
    g.fillStyle = '#5c9a50';
    for (const [dx, dy, r] of [[-0.06, -0.24, 0.08], [0.05, -0.26, 0.085], [0, -0.33, 0.08], [-0.1, -0.31, 0.06], [0.1, -0.33, 0.06]]) { g.beginPath(); g.arc(qx + dx * sc, qy + dy * sc, r * sc, 0, 6.2832); g.fill(); }
    g.fillStyle = '#e0574a';
    for (const [dx, dy] of [[-0.04, -0.36], [0.06, -0.39], [0.11, -0.3], [-0.11, -0.33]]) { g.beginPath(); g.arc(qx + dx * sc, qy + dy * sc, 0.028 * sc, 0, 6.2832); g.fill(); }
    pot = [qx, qy, sc];
  }
  if (!w.light) return;
  fill(E, gin, '#fff');
  if (curtain) fill(E, curtain, 'rgb(150,150,150)');
  for (const [p, q, wd] of bars) seg(E, p, q, '#000', wd);
  if (pot) {
    const [qx, qy, sc] = pot;
    E.fillStyle = '#000'; E.beginPath(); E.roundRect(qx - 0.1 * sc, qy - 0.16 * sc, 0.2 * sc, 0.16 * sc, 0.02 * sc); E.fill();
    for (const [dx, dy, r] of [[-0.06, -0.24, 0.08], [0.05, -0.26, 0.085], [0, -0.33, 0.08], [-0.1, -0.31, 0.06], [0.1, -0.33, 0.06]]) { E.beginPath(); E.arc(qx + dx * sc, qy + dy * sc, r * sc, 0, 6.2832); E.fill(); }
  }
  R.light(w.light, { bbox: bboxOf(gin, 3), pos: [X + n * 0.3, (y0 + y1) / 2, zm], nrm: [n, 0, 0] });
}

function doorAt(g, X, n, d) {
  fill(g, wq(X, d.z0 - 0.08, d.z1 + 0.08, 0, 2.2), '#6f675d');
  fill(g, wq(X, d.z0, d.z1, 0, 2.1), d.col);
  fill(g, wq(X, d.z0 + 0.08, d.z1 - 0.08, 1.15, 1.95), mixHex(d.col, '#000000', 0.12));
  fill(g, wq(X, d.z0 + 0.08, d.z1 - 0.08, 0.2, 1.0), mixHex(d.col, '#000000', 0.12));
  const [kx, ky] = P(X + n * 0.04, 1.05, d.z1 - 0.12);
  g.fillStyle = '#d8c48f'; g.beginPath(); g.arc(kx, ky, Math.max(2, F * 0.035 / d.z1), 0, 6.2832); g.fill();
  // a concrete step
  fill(g, [P(X, 0.16, d.z0 - 0.15), P(X + n * 0.4, 0.16, d.z0 - 0.15), P(X + n * 0.4, 0.16, d.z1 + 0.15), P(X, 0.16, d.z1 + 0.15)], '#d9d3c7');
  fill(g, wq(X + n * 0.4, d.z0 - 0.15, d.z1 + 0.15, 0, 0.16), '#b3ac9f');
  fill(g, [P(X, 0, d.z0 - 0.15), P(X + n * 0.4, 0, d.z0 - 0.15), P(X + n * 0.4, 0.16, d.z0 - 0.15), P(X, 0.16, d.z0 - 0.15)], '#c4bdb0');
}

// ---------------------------------------------------------------- props (drawn twice: colour, and their shade factor)
// Every prop colour goes through c(hex, a): in the colour pass it is the albedo × the sun/shade light at the prop,
// in the shade pass it is that light's luminance as grey, so the night pass can divide the light out again.
function paintProps(g, E, R, c, pass) {
  // far pole + its lamp
  pole(g, c, LAMP2.X + 0.43, LAMP2.Z, 7.6, 0.12);
  arm(g, c, LAMP2, 0.43, LAMP2.Z);
  head(g, E, R, c, LAMP2, 'LAMP2', pass);
  // laundry lines
  laundry(g, c, 12, 3.9, [
    { u: 0.12, k: 'sheet', w: 0.85, h: 0.75, col: '#f3e3b0' },
    { u: 0.38, k: 'pants', w: 0.42, h: 0.82, col: '#5d7fb8' },
    { u: 0.55, k: 'towel', w: 0.4, h: 0.55, col: '#f2f0ea', stripe: '#e07a62' },
  ]);
  laundry(g, c, 7.5, 3.5, [
    { u: 0.1, k: 'shirt', w: 0.56, h: 0.68, col: '#f7f5ef' },
    { u: 0.3, k: 'towel', w: 0.36, h: 0.62, col: '#9fd2c3', stripe: '#ffffff' },
    { u: 0.47, k: 'shirt', w: 0.5, h: 0.6, col: '#e8775f', stripe: '#f7efe2' },
    { u: 0.63, k: 'socks', w: 0.3, h: 0.3, col: '#f2cf6a' },
    { u: 0.8, k: 'towel', w: 0.42, h: 0.5, col: '#f6e7c6', stripe: '#6f9fd6' },
  ]);
  // wires (from the main pole across the alley, from the far pole to the left)
  const wire = (a, b, sag) => {
    g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag, b[0], b[1]);
    g.strokeStyle = c('#2e333a'); g.lineWidth = 2.6; g.stroke();
  };
  wire(P(POLE.X, 7.6, POLE.Z), P(XL, 6.25, 5.2), 70);
  wire(P(LAMP2.X + 0.43, 7.3, LAMP2.Z), P(XL, 5.0, 16.8), 14);
  // styrofoam box of green onions against the right wall, pots of geraniums by the left door
  {
    const x0 = 1.18, x1 = 1.62, z0 = 5.05, z1 = 5.75, h = 0.32;
    fill(g, [P(x0, h, z0), P(x1, h, z0), P(x1, h, z1), P(x0, h, z1)], c('#f4f3ee'));
    fill(g, [P(x0, 0, z0), P(x1, 0, z0), P(x1, h, z0), P(x0, h, z0)], c('#e4e2da'));
    fill(g, [P(x0, 0, z0), P(x0, h, z0), P(x0, h, z1), P(x0, 0, z1)], c('#d6d3ca'));
    fill(g, [P(x0 + 0.04, h, z0 + 0.04), P(x1 - 0.04, h, z0 + 0.04), P(x1 - 0.04, h, z1 - 0.04), P(x0 + 0.04, h, z1 - 0.04)], c('#6b5a48'));
    const ro = rand(55);
    g.lineCap = 'round';
    for (let k = 0; k < 26; k++) {
      const x = lerp(x0 + 0.06, x1 - 0.06, ro()), z = lerp(z0 + 0.08, z1 - 0.08, ro()), a = P(x, h, z), tipH = 0.28 + ro() * 0.25, b = P(x + (ro() - 0.5) * 0.18, h + tipH, z);
      g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(a[0], (a[1] + b[1]) / 2, b[0], b[1]);
      g.strokeStyle = c(ro() < 0.5 ? '#5aa04f' : '#77b85e'); g.lineWidth = F * 0.018 / z; g.stroke();
    }
  }
  // the main pole and its street lamp
  pole(g, c, POLE.X, POLE.Z, 9, POLE.r, true);
  arm(g, c, LAMP, POLE.X - LAMP.X - POLE.r, POLE.Z);
  head(g, E, R, c, LAMP, 'LAMP', pass);
  // concrete step block + the sleeping cat
  {
    const x0 = 1.12, x1 = 1.65, z0 = 3.15, z1 = 3.85, h = 0.32;
    const sh = (pts) => { const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
    const base = [P(x0 - 0.12, 0, z0 - 0.1), P(x1, 0, z0 - 0.1), P(x1, 0, z1 + 0.1), P(x0 - 0.12, 0, z1 + 0.1)];
    fill(g, base, c('#000000', 0.16));
    const top = [P(x0, h, z0), P(x1, h, z0), P(x1, h, z1), P(x0, h, z1)], side = [P(x0, 0, z0), P(x0, h, z0), P(x0, h, z1), P(x0, 0, z1)], front = [P(x0, 0, z0), P(x1, 0, z0), P(x1, h, z0), P(x0, h, z0)];
    let b = sh(top), gr = g.createLinearGradient(0, b[1], 0, b[3]); gr.addColorStop(0, c('#d8d1c4')); gr.addColorStop(1, c('#c9c1b3')); fill(g, top, gr);
    b = sh(side); gr = g.createLinearGradient(0, b[1], 0, b[3]); gr.addColorStop(0, c('#aea699')); gr.addColorStop(1, c('#948c80')); fill(g, side, gr);
    b = sh(front); gr = g.createLinearGradient(0, b[1], 0, b[3]); gr.addColorStop(0, c('#c2baad')); gr.addColorStop(1, c('#a39b8e')); fill(g, front, gr);
    seg(g, P(x0, h, z0), P(x1, h, z0), c('#ebe5da'), 2); seg(g, P(x0, h, z0), P(x0, h, z1), c('#e0d9cd'), 1.5);
    seg(g, P(x0 + 0.12, h * 0.75, z0), P(x0 + 0.2, h * 0.35, z0), c('#857d71', 0.6), 1.4);
    const [qx, qy] = P(1.4, h, 3.48);
    cat(g, c, qx, qy, F / 3.48);
  }
}

function pole(g, c, X, Z, top, r, main) {
  const [x, yb] = P(X, 0, Z), [, yt] = P(X, top, Z), w = F * r / Z;
  const gr = g.createLinearGradient(x - w, 0, x + w, 0);
  gr.addColorStop(0, c('#8e8a82')); gr.addColorStop(0.42, c('#d3cec4')); gr.addColorStop(0.7, c('#c2bdb3')); gr.addColorStop(1, c('#86827a'));
  g.fillStyle = gr; g.beginPath(); g.roundRect(x - w, yt, 2 * w, yb - yt, Math.min(w * 0.5, 6)); g.fill();
  if (!main) return;
  const s = F / Z;
  g.fillStyle = c('#f0c53b'); g.fillRect(x - w, P(X, 1.75, Z)[1], 2 * w, 0.22 * s);
  g.fillStyle = c('#2f343a');
  for (let k = 0; k < 4; k++) g.fillRect(x - w, P(X, 1.75 + 0.22 - (k + 1) * 0.055, Z)[1], 2 * w, 0.022 * s);
  g.fillStyle = c('#f3f1ea'); g.beginPath(); g.roundRect(x - w * 0.7, P(X, 2.55, Z)[1], w * 1.4, 0.2 * s, 3); g.fill();
  g.fillStyle = c('#5a5f66');
  for (let y = 3.0; y < 9; y += 0.45) { const yy = P(X, y, Z)[1], sd = (Math.round(y / 0.45) % 2) ? 1 : -1; g.fillRect(x + sd * w - (sd > 0 ? 0 : 0.09 * s), yy, 0.09 * s, 0.03 * s); }
}
function arm(g, c, L, len, Z) {
  const a = P(L.X + len, L.Y + 0.42, Z), b = P(L.X, L.Y + 0.14, Z), m = P(L.X + len * 0.35, L.Y + 0.55, Z);
  g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(m[0], m[1], b[0], b[1]);
  g.strokeStyle = c('#565d66'); g.lineWidth = F * 0.05 / Z; g.lineCap = 'round'; g.stroke();
}
function head(g, E, R, c, L, name, pass) {
  const [x, y] = P(L.X, L.Y, L.Z), s = F / L.Z;
  g.fillStyle = c('#4b525b');
  g.beginPath(); g.ellipse(x, y, 0.24 * s, 0.13 * s, 0, Math.PI, 0); g.fill();
  g.fillStyle = c('#6b737d'); g.beginPath(); g.ellipse(x - 0.06 * s, y - 0.07 * s, 0.1 * s, 0.03 * s, -0.15, 0, 6.2832); g.fill();
  g.fillStyle = c('#363c44'); g.beginPath(); g.ellipse(x, y, 0.245 * s, 0.035 * s, 0, 0, 6.2832); g.fill();
  const bowl = () => { g.beginPath(); g.ellipse(x, y + 0.01 * s, 0.17 * s, 0.07 * s, 0, 0, Math.PI); g.closePath(); };
  bowl(); g.fillStyle = c('#e9e3d2'); g.fill();
  if (pass !== 'color') return;
  E.fillStyle = '#fff'; E.beginPath(); E.ellipse(x, y + 0.01 * s, 0.17 * s, 0.07 * s, 0, 0, Math.PI); E.closePath(); E.fill();
  R.light(name, { bbox: [x - 0.26 * s, y - 0.16 * s, x + 0.26 * s, y + 0.1 * s], pos: [L.X, L.Y - 0.12, L.Z], nrm: null, cone: [x, y + 0.04 * s, 0.16 * s] });
}

function laundry(g, c, Z, Y, items) {
  const a = P(XL + 0.02, Y, Z), b = P(XR - 0.02, Y, Z), sag = F * 0.16 / Z, s = F / Z;
  const at = (u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + 4 * sag * u * (1 - u)];
  g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 2 * sag, b[0], b[1]);
  g.strokeStyle = c('#e9e4da'); g.lineWidth = Math.max(1.5, F * 0.012 / Z); g.stroke();
  for (const it of items) {
    const [x, y] = at(it.u), X = lerp(XL, XR, it.u), f = Y + (XR - X) / K_SUN < hAt(RIGHT, Z) ? 0.15 : 1;
    const cc = (h, al) => c(h, al, f);
    const w = it.w * s, h = it.h * s;
    g.save(); g.translate(x, y + 1);
    if (it.k === 'shirt') {
      g.fillStyle = cc(it.col);
      g.beginPath(); g.moveTo(-w * 0.32, 0); g.lineTo(-w * 0.5, w * 0.08); g.lineTo(-w * 0.62, h * 0.36); g.lineTo(-w * 0.42, h * 0.42); g.lineTo(-w * 0.36, h * 0.26);
      g.lineTo(-w * 0.36, h); g.lineTo(w * 0.36, h); g.lineTo(w * 0.36, h * 0.26); g.lineTo(w * 0.42, h * 0.42); g.lineTo(w * 0.62, h * 0.36); g.lineTo(w * 0.5, w * 0.08); g.lineTo(w * 0.32, 0);
      g.quadraticCurveTo(0, h * 0.14, -w * 0.32, 0); g.fill();
      if (it.stripe) { g.fillStyle = cc(it.stripe); for (let k = 0; k < 3; k++) g.fillRect(-w * 0.36, h * (0.45 + k * 0.17), w * 0.72, h * 0.06); }
      g.fillStyle = cc('#000000', 0.08); g.fillRect(w * 0.1, h * 0.25, w * 0.26, h * 0.75);
    } else if (it.k === 'towel' || it.k === 'sheet') {
      g.fillStyle = cc(it.col); g.beginPath(); g.roundRect(-w / 2, 0, w, h, Math.min(6, w * 0.08)); g.fill();
      if (it.stripe) { g.fillStyle = cc(it.stripe); g.fillRect(-w / 2, h * 0.72, w, h * 0.07); g.fillRect(-w / 2, h * 0.84, w, h * 0.04); }
      g.fillStyle = cc('#000000', 0.07);
      for (let k = 1; k < 3; k++) g.fillRect(-w / 2 + w * k / 3 - w * 0.03, 0, w * 0.06, h);
    } else if (it.k === 'pants') {
      g.fillStyle = cc(it.col);
      g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); g.lineTo(w * 0.48, h); g.lineTo(w * 0.06, h); g.lineTo(0, h * 0.3); g.lineTo(-w * 0.06, h); g.lineTo(-w * 0.48, h); g.closePath(); g.fill();
      g.fillStyle = cc('#000000', 0.12); g.fillRect(-w / 2, 0, w, h * 0.08);
    } else if (it.k === 'socks') {
      g.fillStyle = cc(it.col);
      for (const dx of [-w * 0.28, w * 0.18]) { g.beginPath(); g.roundRect(dx, 0, w * 0.2, h * 0.75, 3); g.fill(); g.beginPath(); g.roundRect(dx, h * 0.6, w * 0.34, h * 0.22, 4); g.fill(); }
    }
    g.fillStyle = cc('#d7c9a8');
    for (const dx of it.k === 'socks' ? [-w * 0.2, w * 0.27] : [-w * 0.36, w * 0.36]) g.fillRect(dx - 2, -4, 4, 9);
    g.restore();
  }
}

function cat(g, c, x, y, s) {
  const k = s / 255;
  g.save(); g.translate(x, y); g.scale(k, k);
  g.fillStyle = c('#000000', 0.22); g.beginPath(); g.ellipse(4, 1, 74, 8, 0, 0, 6.2832); g.fill();
  g.fillStyle = c('#e19a57');
  g.beginPath(); g.ellipse(10, -30, 64, 31, 0, 0, 6.2832); g.fill();
  g.beginPath(); g.ellipse(40, -37, 38, 30, -0.25, 0, 6.2832); g.fill();
  g.strokeStyle = c('#b96d33'); g.lineWidth = 7; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(30 + i * 12, -30, 30 - i * 2, -2.1 + i * 0.05, -1.35 + i * 0.05); g.stroke(); }
  // tail wrapped around the front
  g.strokeStyle = c('#d98c48'); g.lineWidth = 15;
  g.beginPath(); g.moveTo(70, -14); g.bezierCurveTo(70, 6, 10, 4, -40, -6); g.stroke();
  g.strokeStyle = c('#b96d33'); g.lineWidth = 15; g.beginPath(); g.moveTo(-28, -4); g.lineTo(-44, -7); g.stroke();
  // head resting on the paws, toward the alley
  g.fillStyle = c('#f4e9d8'); g.beginPath(); g.ellipse(-36, -10, 22, 9, 0, 0, 6.2832); g.fill();
  g.fillStyle = c('#e6a35f'); g.beginPath(); g.ellipse(-46, -32, 30, 25, 0.1, 0, 6.2832); g.fill();
  g.beginPath(); g.moveTo(-70, -44); g.quadraticCurveTo(-72, -72, -62, -66); g.quadraticCurveTo(-58, -56, -54, -52); g.fill();
  g.beginPath(); g.moveTo(-40, -54); g.quadraticCurveTo(-30, -76, -24, -64); g.quadraticCurveTo(-24, -54, -26, -48); g.fill();
  g.fillStyle = c('#e8a7a0'); g.beginPath(); g.moveTo(-64, -60); g.quadraticCurveTo(-66, -66, -61, -62); g.lineTo(-58, -54); g.fill();
  g.fillStyle = c('#f6ecdc'); g.beginPath(); g.ellipse(-52, -22, 15, 10, 0.1, 0, 6.2832); g.fill();
  g.strokeStyle = c('#7a4a26'); g.lineWidth = 3;
  for (const ex of [-62, -40]) { g.beginPath(); g.arc(ex, -34, 6, 0.3, 2.8); g.stroke(); }
  g.fillStyle = c('#d9867c'); g.beginPath(); g.ellipse(-51, -25, 3.5, 2.6, 0, 0, 6.2832); g.fill();
  g.strokeStyle = c('#b96d33'); g.lineWidth = 5;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-50 + i * 8, -55); g.lineTo(-48 + i * 8, -46); g.stroke(); }
  g.restore();
}

function bigPlant(g, c) {
  const Z = 1.9, [x, y] = P(-0.98, 0, Z), s = F / Z;
  g.fillStyle = c('#000000', 0.18); g.beginPath(); g.ellipse(x + 0.04 * s, y, 0.3 * s, 0.05 * s, 0, 0, 6.2832); g.fill();
  const top = y - 0.46 * s;
  const pg = g.createLinearGradient(x - 0.26 * s, 0, x + 0.26 * s, 0);
  pg.addColorStop(0, c('#9c4a2c')); pg.addColorStop(0.55, c('#c86c44')); pg.addColorStop(1, c('#d8805a'));
  g.fillStyle = pg; g.beginPath(); g.moveTo(x - 0.25 * s, top + 0.06 * s); g.lineTo(x + 0.25 * s, top + 0.06 * s); g.lineTo(x + 0.19 * s, y); g.lineTo(x - 0.19 * s, y); g.fill();
  g.fillStyle = c('#b25d39'); g.beginPath(); g.roundRect(x - 0.28 * s, top, 0.56 * s, 0.09 * s, 0.02 * s); g.fill();
  g.fillStyle = c('#5a4636'); g.beginPath(); g.ellipse(x, top + 0.01 * s, 0.24 * s, 0.03 * s, 0, 0, 6.2832); g.fill();
  const r = rand(4401), bx = x + 0.02 * s, by = top + 0.02 * s;
  const leaves = [];
  for (let i = 0; i < 17; i++) {
    const a = -Math.PI / 2 + (i / 16 - 0.5) * 2.5 + (r() - 0.5) * 0.25, L = (0.42 + r() * 0.36) * s * (1 - 0.35 * Math.abs(i / 16 - 0.5));
    leaves.push({ a, L, w: (0.09 + r() * 0.04) * s, col: ['#3f7a42', '#4f8f4c', '#64a85a', '#4a8848'][i % 4], d: r() });
  }
  leaves.sort((p, q) => p.d - q.d);
  for (const lf of leaves) {
    const sx = bx + Math.cos(lf.a) * lf.L * 0.35, sy = by + Math.sin(lf.a) * lf.L * 0.35;
    g.strokeStyle = c('#3c6b3a'); g.lineWidth = 0.014 * s; g.beginPath(); g.moveTo(bx, by); g.lineTo(sx, sy); g.stroke();
    const tx = bx + Math.cos(lf.a) * lf.L, ty = by + Math.sin(lf.a) * lf.L;
    g.fillStyle = c(lf.col); leaf(g, sx, sy, tx, ty, lf.w, lf.w * 0.25);
    g.strokeStyle = c('#a6d48f', 0.55); g.lineWidth = 0.008 * s; g.beginPath(); g.moveTo(sx, sy); g.lineTo(lerp(sx, tx, 0.85), lerp(sy, ty, 0.85)); g.stroke();
  }
}

// ---------------------------------------------------------------- bakes on the CPU (setup only)
function boxesForGauss(sigma, n = 3) {
  const wI = Math.sqrt(12 * sigma * sigma / n + 1);
  let wl = Math.floor(wI); if (wl % 2 === 0) wl--;
  const wu = wl + 2, m = Math.round((12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4));
  return Array.from({ length: n }, (_, i) => (i < m ? wl : wu));
}
// separable box blur with zero padding (light does not come from outside the frame)
function boxH(s, d, w, h, r) {
  const k = 1 / (2 * r + 1);
  for (let j = 0; j < h; j++) {
    const o = j * w; let acc = 0;
    for (let i = 0; i < Math.min(r, w); i++) acc += s[o + i];
    for (let i = 0; i < w; i++) { if (i + r < w) acc += s[o + i + r]; if (i - r - 1 >= 0) acc -= s[o + i - r - 1]; d[o + i] = acc * k; }
  }
}
function boxV(s, d, w, h, r) {
  const k = 1 / (2 * r + 1);
  for (let i = 0; i < w; i++) {
    let acc = 0;
    for (let j = 0; j < Math.min(r, h); j++) acc += s[j * w + i];
    for (let j = 0; j < h; j++) { if (j + r < h) acc += s[(j + r) * w + i]; if (j - r - 1 >= 0) acc -= s[(j - r - 1) * w + i]; d[j * w + i] = acc * k; }
  }
}
function gaussBlur(a, w, h, sigma) {
  let A = Float32Array.from(a), B = new Float32Array(a.length);
  for (const bx of boxesForGauss(sigma)) { const r = (bx - 1) / 2; boxH(A, B, w, h, r); boxV(B, A, w, h, r); }
  return A;
}

// =================================================================== shader
const VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const fragSrc = (NL, NLAYER, STAR) => /* glsl */`
precision highp float;
precision highp sampler3D;
precision highp sampler2DArray;
#define NL ${NL}
#define NLAYER ${NLAYER}
#define STAR_ID ${STAR}
uniform sampler2D uPlate;          // the painting (encoded sRGB)
uniform sampler2D uMask;           // R emissive coverage · G light id (texelFetch) · B sky matte · A sun×AO light it was painted with
uniform sampler3D uLut0, uLut1, uLut2;
uniform sampler2DArray uLights;    // layer 0: halation source · layer k: R tight glow, G pool, B wide glow of light k
uniform vec2 uMaskSize;
uniform float uOn[NL];
uniform vec3 uCol[NL];
uniform float uCore[NL];
uniform float uZoom, uMemF, uNightF, uSweep, uHold, uTime, uFrame, uFade, uNightBase, uSkyND, uBump;
uniform vec3 uWeave;
uniform vec2 uSplit, uLeakRect;
varying vec2 vUv;

const float LN = 33.0;
vec3 toLin(vec3 c) { c = max(c, 0.0); return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
vec3 toEnc(vec3 l) { l = max(l, 0.0); return mix(l * 12.92, 1.055 * pow(l, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, l)); }
// 33³ LUT, hardware trilinear: map [0,1] onto the centres of the first and last texels
vec3 lut(sampler3D L, vec3 c) { return textureLod(L, clamp(c, 0.0, 1.0) * ((LN - 1.0) / LN) + 0.5 / LN, 0.0).rgb; }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
// film grain: value noise at ~1.6 px plus a per-pixel hash, re-seeded every film frame (24 fps)
float grain(vec2 p, float fr) {
  vec2 o = vec2(fr * 17.31, fr * 41.97), q = p / 1.6 + o, i = floor(q), f = fract(q);
  f = f * f * (3.0 - 2.0 * f);
  float v = mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0)), f.x), f.y);
  return (v - 0.5) * 0.8 + (hash12(p + o * 1.7) - 0.5) * 0.45;
}
vec3 shoulder(vec3 x) { const float k = 0.8; vec3 e = max(x - k, 0.0); return min(x, vec3(k)) + (1.0 - k) * (1.0 - exp(-e / (1.0 - k))); }
// light leaks: anisotropic gaussians drifting in closed form, in the coordinates of the band they live in
vec3 leakHold(vec2 p) {
  float bw = max(uLeakRect.y - uLeakRect.x, 1.0);
  vec2 u = vec2((p.x - uLeakRect.x) / bw, p.y / 1920.0);
  vec2 c1 = vec2(-0.06 + 0.1 * sin(0.55 * uTime + 0.4), 0.17 + 0.05 * sin(0.43 * uTime + 1.3));
  vec2 d1 = (u - c1) * vec2(bw / 520.0, 1920.0 / 470.0);
  vec3 L = vec3(1.0, 0.34, 0.1) * 0.95 * exp(-dot(d1, d1)) * (0.8 + 0.2 * sin(2.3 * uTime));
  vec2 c2 = vec2(1.05, 0.63 + 0.06 * sin(0.37 * uTime + 2.0));
  vec2 d2 = (u - c2) * vec2(bw / 300.0, 1920.0 / 600.0);
  L += vec3(1.0, 0.62, 0.26) * 0.45 * exp(-dot(d2, d2)) * (0.75 + 0.25 * sin(1.7 * uTime + 1.0));
  float ex = u.x * bw / 60.0;
  L += vec3(1.0, 0.27, 0.09) * 0.32 * exp(-ex * ex) * smoothstep(0.05, 0.55, u.y) * (0.7 + 0.3 * sin(3.1 * uTime + u.y * 6.0));
  return L;
}

void main() {
  vec2 p = vec2(vUv.x * 1080.0, (1.0 - vUv.y) * 1920.0);                // stage px, y down
  // slow push-in + gate weave (one film frame's shift and tilt): stage px → painting px
  vec2 q = (p - vec2(540.0, 900.0)) / uZoom;
  float cw = cos(uWeave.z), sw = sin(uWeave.z);
  vec2 w = vec2(540.0, 900.0) + vec2(cw * q.x - sw * q.y, sw * q.x + cw * q.y) + uWeave.xy;
  vec2 uv = w / vec2(1080.0, 1920.0);
  vec3 src = textureLod(uPlate, uv, 0.0).rgb;
  vec4 mk = textureLod(uMask, uv, 0.0);
  int id = int(texelFetch(uMask, ivec2(clamp(uv, 0.0, 0.9999) * uMaskSize), 0).g * 255.0 + 0.5);

  // which grade each pixel shows: memory behind the leak front, night below the falling front, bands in the split
  float s = p.x + 0.35 * (p.y - 960.0);
  float m = 1.0 - smoothstep(uMemF - 220.0, uMemF + 220.0, s);
  float n = 1.0 - smoothstep(uNightF - 320.0, uNightF + 320.0, p.y);
  float inA = 1.0 - smoothstep(uSplit.x - 1.0, uSplit.x + 1.0, p.x);
  float inB = 1.0 - smoothstep(uSplit.y - 1.0, uSplit.y + 1.0, p.x);
  float seq = 1.0 - inB;
  float wD = inA + seq * (1.0 - m) * (1.0 - n);
  float wM = (inB - inA) + seq * m * (1.0 - n);
  float wN = seq * n;

  vec2 r2 = (p - vec2(540.0, 860.0)) / vec2(760.0, 1180.0);
  float vig = smoothstep(0.25, 1.3, dot(r2, r2));
  vec3 lin = vec3(0.0);
  float gAmt = 0.0;
  if (wD > 0.0) {
    lin += wD * toLin(lut(uLut0, src)) * (1.0 - 0.1 * vig);
    gAmt += wD * 0.012;
  }
  if (wM > 0.0) {
    vec3 g = toLin(lut(uLut1, src));
    g += textureLod(uLights, vec3(uv, 0.0), 0.0).r * vec3(1.0, 0.3, 0.13) * 0.9;   // halation: blurred highlights, red
    g += uHold * leakHold(p);
    g *= mix(vec3(1.0), vec3(0.5, 0.4, 0.33), vig * 0.85);
    lin += wM * g; gAmt += wM * 0.075;
  }
  if (wN > 0.0) {
    vec3 sl = toLin(src);
    vec3 g = toLin(lut(uLut2, toEnc(sl * mix(1.0, uSkyND, mk.b)))) * uNightBase * (1.0 + 0.3 * uBump);
    vec3 alb = sl / max(mk.a, 0.3);                       // de-lit albedo: the day's sun and AO divided out
    vec3 pool = vec3(0.0), glow = vec3(0.0);
    float hal = 0.0;
    for (int k = 1; k < NLAYER; k++) {
      float on = uOn[k];
      if (on <= 0.0) continue;
      vec3 L = textureLod(uLights, vec3(uv, float(k)), 0.0).rgb;
      vec3 c = uCol[k] * on;
      pool += c * L.g; glow += c * (L.r + L.b); hal += on * L.b;
    }
    g += alb * pool + glow + hal * vec3(0.5, 0.09, 0.03) * 0.5;
    if (id > 0 && id < NL) {
      float on = uOn[id];
      if (id == STAR_ID) on *= 0.55 + 0.45 * sin(uTime * 4.0 + hash12(floor(w / 6.0)) * 6.283);
      g += mk.r * on * uCol[id] * uCore[id];
    }
    g *= 1.0 - 0.55 * vig;
    lin += wN * g; gAmt += wN * 0.045;
  }
  // the light-leak burn that carries the first transition (on top of every grade)
  float ds = (s - uMemF) / 150.0, dr = (s - uMemF + 260.0) / 300.0;
  lin += uSweep * (vec3(1.0, 0.7, 0.34) * exp(-ds * ds) + vec3(1.0, 0.28, 0.09) * 0.85 * exp(-dr * dr)) * (0.7 + 0.3 * sin(p.y * 0.0042 + uTime * 1.4));
  vec3 e = toEnc(shoulder(lin * uFade));
  float l = dot(e, vec3(0.2126, 0.7152, 0.0722));
  float gr = grain(p, uFrame);
  vec3 gc = vec3(gr) + 0.3 * vec3(hash12(p + uFrame * 3.1) - 0.5, 0.0, hash12(p.yx + uFrame * 5.7) - 0.5);
  e += gc * gAmt * (0.35 + 2.6 * l * (1.0 - l));
  gl_FragColor = vec4(clamp(e, 0.0, 1.0), 1.0);
}`;

// =================================================================== timing helpers (closed forms of t)
const memFront = (t) => lerp(-600, 1680, sstep(T1[0], T1[1], t));
const nightFront = (t) => lerp(-340, 2260, sstep(T2[0], T2[1], t));
const sweepEnv = (t) => Math.sin(Math.PI * clamp((t - T1[0]) / (T1[1] - T1[0]))) ** 0.8;
function splitAB(t) {
  if (t < T_SPLIT[0] || t > T_UNSPLIT[1]) return [-10, -10];
  if (t >= T_UNSPLIT[0]) { const k = ease.inCubic(clamp((t - T_UNSPLIT[0]) / (T_UNSPLIT[1] - T_UNSPLIT[0]))); return [lerp(360, -10, k), lerp(720, -10, k)]; }
  const b = ease.outBack(clamp((t - T_SPLIT[0]) / 0.6), 1.1), a = ease.outBack(clamp((t - T_SPLIT[0] - 0.1) / 0.6), 1.1);
  return [lerp(-10, 360, a), lerp(-10, 720, b)];
}
function lampOn(t) {
  const u = t - T_LAMP;
  if (u < 0) return 0;
  if (u < 0.04) return 0.5;
  if (u < 0.08) return 0.06;
  if (u < 0.13) return 0.85;
  if (u < 0.17) return 0.2;
  return (1 + 0.32 * Math.exp(-(u - 0.17) / 0.22)) * (1 + 0.02 * Math.sin(t * 7.3) * ramp(t, T_LAMP + 1, T_LAMP + 2));
}
const WIN_COL = [1.0, 0.62, 0.28], WARM_COL = [1.0, 0.36, 0.08], LAMP_COL = [1.0, 0.5, 0.16], MOON_COL = [0.72, 0.84, 1.0];
const LIGHTS = [   // id = index + 1; the first NLAYER-1 own a glow/pool layer. pool = intensity I (irradiance I·cosθ/d²)
  { name: 'L1a', win: true, tOn: 4.27, core: 1.3, pool: 1.5, sig: [2.2, 9], glow: [0.07, 0.05] },
  { name: 'L1b', win: true, tOn: 4.0, core: 1.25, pool: 1.2, sig: [2.2, 9], glow: [0.07, 0.05] },
  { name: 'L2b', win: true, tOn: 4.05, core: 1.25, pool: 1.2, sig: [2, 8], glow: [0.07, 0.05] },
  { name: 'L3a', win: true, tOn: 4.15, core: 1.25, pool: 1.0, sig: [1.6, 6], glow: [0.08, 0.06] },
  { name: 'R1a', win: true, tOn: 3.95, core: 1.25, pool: 1.3, sig: [2.2, 9], glow: [0.07, 0.05] },
  { name: 'R2a', win: true, tOn: 4.08, core: 1.25, pool: 1.1, sig: [2, 8], glow: [0.07, 0.05] },
  { name: 'R3b', win: true, tOn: 4.12, core: 1.25, pool: 1.0, sig: [1.6, 6], glow: [0.08, 0.06] },
  { name: 'F', win: true, tOn: 4.2, core: 1.2, pool: 0.8, sig: [1.4, 5], glow: [0.1, 0.07] },
  { name: 'LAMP', tOn: T_LAMP, core: 3.6, pool: 4.6, sig: [3, 16], glow: [0.32, 0.3], cone: 0.4 },
  { name: 'LAMP2', tOn: 4.42, core: 3.0, pool: 2.4, sig: [1.8, 8], glow: [0.3, 0.25], cone: 0.12 },
  { name: 'MOON', tOn: 3.85, core: 1.25, sig: [3, 14], glow: [0.2, 0.22], sky: true },
  { name: 'STARS', tOn: 3.95, core: 0.9, sky: true },
  { name: 'TOWN', tOn: 4.0, core: 1.4, sky: true },
];
const NLAYER = 11 + 1, NL = LIGHTS.length + 1, STAR_ID = LIGHTS.findIndex((l) => l.name === 'STARS') + 1;
function lightState(L, t) {   // → [on, rgb]
  if (L.name === 'LAMP') return [lampOn(t), LAMP_COL];
  if (L.name === 'MOON') return [ramp(t, 3.85, 4.6), MOON_COL];
  if (L.name === 'STARS') return [ramp(t, 3.95, 4.7), [0.8, 0.88, 1.0]];
  if (L.name === 'TOWN') return [ramp(t, 4.0, 4.3), [1.0, 0.72, 0.42]];
  let on = ramp(t, L.tOn, L.tOn + (L.name === 'LAMP2' ? 0.1 : 0.14));
  if (L.name === 'L1a') on *= 1 - ramp(t, T_OFF, T_OFF + 0.12);
  if (L.name === 'LAMP2') return [on, LAMP_COL];
  const k = ramp(t, L.tOn, L.tOn + 0.6);
  return [on, WARM_COL.map((v, i) => lerp(v, WIN_COL[i], k))];
}

// =================================================================== the demo
defineDemo({
  id: '136-color-grade',
  title: '같은 골목, 세 개의 기억',
  tech: '컬러 그레이딩 · 3D LUT + 낮을 밤으로',
  duration: D,
  background: '#0c0e12',

  async setup(api) {
    const HL = api.headless;
    const TXT = GRADES.map((g) => g.num + g.name + g.sub).join('') + '0123456789';
    await fontReady(`800 64px ${KR}`, TXT);
    await fontReady(`500 28px ${KR}`, TXT);

    // ---- grades → LUTs (CPU), Data3DTextures (half float, trilinear)
    const LUTS = GRADES.map(buildLut);
    const lutTex = LUTS.map((L) => {
      const h = new Uint16Array(L.length);
      for (let i = 0; i < L.length; i++) h[i] = THREE.DataUtils.toHalfFloat(L[i]);
      const tx = new THREE.Data3DTexture(h, N, N, N);
      tx.format = THREE.RGBAFormat; tx.type = THREE.HalfFloatType;
      tx.minFilter = tx.magFilter = THREE.LinearFilter;
      tx.wrapS = tx.wrapT = tx.wrapR = THREE.ClampToEdgeWrapping;
      tx.unpackAlignment = 1; tx.needsUpdate = true;
      return tx;
    });

    // ---- paint: sky, architecture, props (+ their shade), emissive mask
    const mk = () => { const c = document.createElement('canvas'); c.width = PW; c.height = PH; const g = c.getContext('2d', { willReadFrequently: true }); g.setTransform(PS, 0, 0, PS, 0, 0); return g; };
    const gSky = mk(), gArch = mk(), gProps = mk(), gShade = mk(), gEmit = mk();
    gShade.fillStyle = '#fff'; gShade.fillRect(0, 0, 1080, 1920);
    gEmit.fillStyle = '#000'; gEmit.fillRect(0, 0, 1080, 1920);
    const lights = new Map();
    const R = { light: (name, o) => lights.set(name, { ...(lights.get(name) || {}), ...o }) };
    const town = [];
    paintSky(gSky, town);
    paintArch(gArch, gEmit, R);
    // props are drawn twice: in colour (albedo × the light at the prop) and as that light's luminance (grey), so the
    // night pass can divide the day's light out again. Right side (poles, lamps, cat, box) stands in shade, the left
    // geraniums and the foreground plant in sun; each garment carries its own sun factor.
    const colorMap = (f) => { const sh = shadeRGB(f); return (hex, a = 1) => css(hexRGB(hex).map((v, i) => toEnc(toLin(v) * sh[i])), a); };
    const greyMap = (f) => { const sh = shadeRGB(f), y = 0.2126 * sh[0] + 0.7152 * sh[1] + 0.0722 * sh[2]; return (hex, a = 1) => css([y, y, y], a); };
    for (const [g, mapFor, pass] of [[gProps, colorMap, 'color'], [gShade, greyMap, 'shade']]) {
      const c0 = mapFor(0), c1 = mapFor(1);
      paintProps(g, gEmit, R, (hex, a = 1, f2) => (f2 !== undefined ? mapFor(f2)(hex, a) : c0(hex, a)), pass);
      for (const [z, s] of [[5.95, 1], [6.3, 0.8]]) geranium(g, c1, z, s);
      bigPlant(g, c1);
    }

    // ---- read back the layers
    const rd = (g) => g.getImageData(0, 0, PW, PH).data;
    const sky = rd(gSky), arch = rd(gArch), props = rd(gProps), shadeP = rd(gShade);
    // stars: only where the sky shows
    {
      const r = rand(2024), [mx, my] = [772, 118];
      let nStars = 0;
      for (let i = 0; i < 400 && nStars < 34; i++) {
        const x = 250 + r() * 680, y = 8 + r() * 560, ix = Math.round(x * PS), iy = Math.round(y * PS), rr = 0.9 + r() * 1.3, al = 0.45 + r() * 0.55;
        if (Math.hypot(x - mx, y - my) < 64) continue;
        let ok = true;
        for (let dy = -6; dy <= 6 && ok; dy += 3) for (let dx = -6; dx <= 6; dx += 3) {
          const o2 = ((iy + dy) * PW + ix + dx) * 4;
          if (arch[o2 + 3] > 0 || props[o2 + 3] > 0) { ok = false; break; }
        }
        if (!ok) continue;
        gEmit.fillStyle = '#fff'; gEmit.globalAlpha = al;
        gEmit.beginPath(); gEmit.arc(x, y, rr, 0, 6.2832); gEmit.fill();
        nStars++;
      }
      gEmit.globalAlpha = 1;
      R.light('STARS', { bbox: [240, 0, 940, 580] });
      // the moon: a disc with soft maria (emissive only: it exists at night)
      gEmit.fillStyle = '#fff'; gEmit.beginPath(); gEmit.arc(mx, my, 27, 0, 6.2832); gEmit.fill();
      gEmit.fillStyle = 'rgba(0,0,0,0.16)';
      for (const [dx, dy, rr] of [[-8, -6, 9], [7, 4, 7], [-3, 11, 5], [10, -10, 4]]) { gEmit.beginPath(); gEmit.arc(mx + dx, my + dy, rr, 0, 6.2832); gEmit.fill(); }
      R.light('MOON', { bbox: [mx - 34, my - 34, mx + 34, my + 34], pos: null });
      // far hillside windows
      gEmit.fillStyle = '#fff';
      for (const [x, y] of town) gEmit.fillRect(x, y, 2.2, 2.8);
      R.light('TOWN', { bbox: [400, 600, 720, 800] });
    }
    const emit = rd(gEmit);

    // ---- light ids by bounding box (lights never overlap; later entries win: town < far lamp, stars < moon)
    const ids = new Uint8Array(PW * PH);
    const order = ['TOWN', 'STARS', ...LIGHTS.map((l) => l.name).filter((n) => n !== 'TOWN' && n !== 'STARS')];
    for (const name of order) {
      const L = lights.get(name), idx = LIGHTS.findIndex((l) => l.name === name) + 1;
      if (!L || !L.bbox) throw new Error('light not painted: ' + name);
      const [x0, y0, x1, y1] = L.bbox.map((v) => Math.round(v * PS));
      for (let y = Math.max(0, y0); y <= Math.min(PH - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(PW - 1, x1); x++) ids[y * PW + x] = idx;
    }

    // ---- composite the plate: sky → architecture × (sun × AO) → props; paper grain; masks
    const plate = new Uint8Array(PW * PH * 4), mask = new Uint8Array(PW * PH * 4);
    const qCov = LIGHTS.map(() => new Float32Array(QW * QH)), qCnt = new Float32Array(QW * QH), qLum = new Float32Array(QW * QH), qProp = new Float32Array(QW * QH);
    const rn = rand(99), GN = 4, gw = Math.ceil(PW / GN) + 2, gh = Math.ceil(PH / GN) + 2, grid = new Float32Array(gw * gh);
    for (let i = 0; i < grid.length; i++) grid[i] = rn();
    const skyIdx = new Set(['MOON', 'STARS', 'TOWN'].map((n) => LIGHTS.findIndex((l) => l.name === n) + 1));
    for (let py = 0; py < PH; py++) {
      const y = (py + 0.5) / PS, qy = Math.min(QH - 1, Math.floor(y / QS));
      for (let px = 0; px < PW; px++) {
        const o = (py * PW + px) * 4, x = (px + 0.5) / PS, qx = Math.min(QW - 1, Math.floor(x / QS)), q = qy * QW + qx;
        const aA = arch[o + 3] / 255, aP = props[o + 3] / 255;
        let sh = [1, 1, 1], shL = 1;
        if (aA > 0) {
          const h = hit(x, y);
          if (h) { const f = sunAt(h[0], h[1], h[2], h[3]), ao = aoAt(h[0], h[1], h[2], h[3]); sh = shadeRGB(f).map((v) => v * ao); shL = 0.2126 * sh[0] + 0.7152 * sh[1] + 0.0722 * sh[2]; }
        }
        // grain of the paper: smooth noise (4 px) + a little per-texel noise
        const gx = px / GN, gy = py / GN, ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
        const nv = lerp(lerp(grid[iy * gw + ix], grid[iy * gw + ix + 1], fx), lerp(grid[(iy + 1) * gw + ix], grid[(iy + 1) * gw + ix + 1], fx), fy);
        const tex = 1 + (aA + aP > 0 ? 0.045 : 0.015) * (nv - 0.5) + 0.02 * (rn() - 0.5) * (aA + aP > 0 ? 1 : 0.3);
        let lum = 0;
        for (let c = 0; c < 3; c++) {
          let v = toLin(sky[o + c] / 255);
          v = lerp(v, toLin(arch[o + c] / 255) * sh[c], aA);
          v = lerp(v, toLin(props[o + c] / 255), aP);
          v *= tex;
          plate[o + c] = Math.round(clamp(toEnc(v)) * 255);
          lum += [0.2126, 0.7152, 0.0722][c] * v;
        }
        plate[o + 3] = 255;
        const id = ids[py * PW + px];
        let cov = emit[o] / 255;
        if (id && skyIdx.has(id)) cov *= (1 - aA) * (1 - aP);
        else if (id && LIGHTS[id - 1].win) cov *= 1 - aP;   // windows: hidden by props in front
        const shadeProp = shadeP[o] / 255;
        mask[o] = Math.round(cov * 255);
        mask[o + 1] = id;
        mask[o + 2] = Math.round((1 - aA) * (1 - aP) * 255);
        mask[o + 3] = Math.round(clamp(lerp(shL, shadeProp, aP)) * 255);
        if (id && cov > 0) qCov[id - 1][q] += cov;
        qCnt[q]++; qLum[q] += lum; qProp[q] += aP;
      }
    }
    for (const a of qCov) for (let i = 0; i < a.length; i++) a[i] /= qCnt[i];

    // ---- light layers (quarter res): 0 = halation source; k = tight glow, pool on the surfaces, wide glow (+ lamp cone)
    const layers = new Float32Array(QW * QH * NLAYER * 4);
    {
      const hs = new Float32Array(QW * QH);
      for (let i = 0; i < hs.length; i++) { const Y = qLum[i] / qCnt[i]; hs[i] = Math.max(0, Y - 0.55) / 0.45; }
      const h1 = gaussBlur(hs, QW, QH, 2.5), h2 = gaussBlur(hs, QW, QH, 7);
      for (let i = 0; i < hs.length; i++) layers[i * 4] = 0.65 * h1[i] + 0.5 * h2[i];
    }
    const surf = [];
    for (let j = 0; j < QH; j++) for (let i = 0; i < QW; i++) surf.push(hit((i + 0.5) * QS, (j + 0.5) * QS));
    for (let k = 0; k < NLAYER - 1; k++) {
      const Ld = LIGHTS[k], L = lights.get(Ld.name), base = (k + 1) * QW * QH * 4;
      const t1 = gaussBlur(qCov[k], QW, QH, Ld.sig[0]), t2 = gaussBlur(qCov[k], QW, QH, Ld.sig[1]);
      let cone = null;
      if (Ld.cone) {
        const cc = document.createElement('canvas'); cc.width = QW; cc.height = QH;
        const g = cc.getContext('2d', { willReadFrequently: true });
        const [cx, cy, cr] = L.cone, gx = P(Ld.name === 'LAMP' ? LAMP.X : LAMP2.X, 0, Ld.name === 'LAMP' ? LAMP.Z : LAMP2.Z);
        const spread = (gx[1] - cy) * 0.55;
        const gr = g.createLinearGradient(0, cy / QS, 0, gx[1] / QS);
        gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.beginPath();
        g.moveTo((cx - cr) / QS, cy / QS); g.lineTo((cx + cr) / QS, cy / QS); g.lineTo((gx[0] + spread) / QS, gx[1] / QS); g.lineTo((gx[0] - spread) / QS, gx[1] / QS); g.fill();
        const d = g.getImageData(0, 0, QW, QH).data;
        cone = gaussBlur(Float32Array.from({ length: QW * QH }, (_, i) => d[i * 4 + 3] / 255), QW, QH, 5);
      }
      for (let i = 0; i < QW * QH; i++) {
        const o = base + i * 4;
        layers[o] = t1[i] * Ld.glow[0] * 6;
        layers[o + 2] = t2[i] * Ld.glow[1] * 14 + (cone ? cone[i] * Ld.cone : 0);
        const h = surf[i];
        if (h && L.pos) {
          // props (cat, plants, block) are mostly upward-facing: light them as if their normal points up
          const [type, X, Y, Z] = h, nr = qProp[i] > 0.4 * qCnt[i] ? NRM[1] : NRM[type];
          let dx = L.pos[0] - X, dy = L.pos[1] - Y, dz = L.pos[2] - Z;
          const dist = Math.hypot(dx, dy, dz) + 1e-6; dx /= dist; dy /= dist; dz /= dist;
          const lam = Math.max(0, nr[0] * dx + nr[1] * dy + nr[2] * dz);
          const dir = L.nrm ? Math.max(0, -(L.nrm[0] * dx + L.nrm[1] * dy + L.nrm[2] * dz)) : sstep(0.72, 0.97, dy);   // window: into the alley; lamp: a downward cone under the hood
          layers[o + 1] = Math.min(1.5, Ld.pool * lam * dir / (dist * dist + 0.8));   // irradiance I·cosθ / d² (softened)
        }
      }
    }
    const half = new Uint16Array(layers.length);
    for (let i = 0; i < layers.length; i++) half[i] = THREE.DataUtils.toHalfFloat(layers[i]);
    const lightTex = new THREE.DataArrayTexture(half, QW, QH, NLAYER);
    lightTex.format = THREE.RGBAFormat; lightTex.type = THREE.HalfFloatType;
    lightTex.minFilter = lightTex.magFilter = THREE.LinearFilter; lightTex.unpackAlignment = 1; lightTex.needsUpdate = true;

    const tex2 = (data) => {
      const t = new THREE.DataTexture(data, PW, PH, THREE.RGBAFormat, THREE.UnsignedByteType);
      t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true;
      return t;
    };

    // ---- renderer: one full-screen ShaderMaterial
    const el = api.layer('canvas', { z: 0 });
    el.width = 1080; el.height = 1920;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(1080, 1920, false);
    const U = {
      uPlate: { value: tex2(plate) }, uMask: { value: tex2(mask) }, uMaskSize: { value: new THREE.Vector2(PW, PH) },
      uLut0: { value: lutTex[0] }, uLut1: { value: lutTex[1] }, uLut2: { value: lutTex[2] }, uLights: { value: lightTex },
      uOn: { value: new Float32Array(NL) }, uCol: { value: Array.from({ length: NL }, () => new THREE.Vector3()) },
      uCore: { value: Float32Array.from({ length: NL }, (_, i) => (i ? LIGHTS[i - 1].core : 0)) },
      uZoom: { value: 1 }, uMemF: { value: -600 }, uNightF: { value: -340 }, uSweep: { value: 0 }, uHold: { value: 0 },
      uTime: { value: 0 }, uFrame: { value: 0 }, uFade: { value: 1 }, uNightBase: { value: 1 }, uSkyND: { value: SKY_ND },
      uBump: { value: 0 }, uWeave: { value: new THREE.Vector3() }, uSplit: { value: new THREE.Vector2(-10, -10) },
      uLeakRect: { value: new THREE.Vector2(0, 1080) },
    };
    const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: fragSrc(NL, NLAYER, STAR_ID), depthTest: false, depthWrite: false });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // ---- palette chips: five painted colours through each grade's LUT (sky through the ND window at night)
    const SRC = [['#8ec4ea', [1, 1, 1], true], ['#f1e0c1', SUN_COL, false], ['#c06d50', SUN_COL, false], ['#5d9a52', SUN_COL, false], ['#ddd0bc', SHADE_COL, false]];
    const chips = LUTS.map((L, gi) => SRC.map(([hx, light, isSky]) => {
      const lin = hexRGB(hx).map((v, i) => toLin(v) * light[i] * (gi === 2 && isSky ? SKY_ND : 1));
      return css(lutSample(L, lin.map(toEnc)));
    }));

    const overlay = api.canvas({ type: '2d', z: 2, attrs: HL ? { willReadFrequently: true } : undefined }).ctx;
    Object.assign(this, { renderer, scene, cam, U, overlay, chips });
  },

  frame(t) {
    const S = this, U = S.U;
    U.uTime.value = t;
    U.uFrame.value = Math.floor(t * 24);
    U.uZoom.value = 1.03 + 0.055 * (t / D);
    // gate weave: per film frame (24 fps) a smooth random shift (px) and tilt (rad)
    const fr = Math.floor(t * 24), wv = ramp(t, WEAVE[0], WEAVE[1]) * (1 - ramp(t, WEAVE[2], WEAVE[3]));
    U.uWeave.value.set(
      wv * (2.4 * (vnoise1(fr * 0.31, 1) - 0.5) * 2 + 0.7 * (hash1(fr * 3 + 1) - 0.5)),
      wv * (3.0 * (vnoise1(fr * 0.27, 2) - 0.5) * 2 + 0.9 * (hash1(fr * 5 + 2) - 0.5)),
      wv * 0.0011 * (vnoise1(fr * 0.23, 3) - 0.5) * 2);
    U.uMemF.value = memFront(t);
    U.uNightF.value = nightFront(t);
    U.uSweep.value = 1.05 * sweepEnv(t);
    U.uHold.value = ramp(t, 1.8, 2.6);
    const kb = ramp(t, T_SPLIT[0], T_SPLIT[1]);
    U.uLeakRect.value.set(lerp(0, 360, kb), lerp(1080, 720, kb));
    const [A, B] = splitAB(t);
    U.uSplit.value.set(A, B);
    U.uFade.value = lerp(0.2, 1, ease.outCubic(ramp(t, 0, T_FADE)));
    U.uNightBase.value = 1 - 0.5 * ramp(t, 9.2, 10);
    for (let i = 0; i < LIGHTS.length; i++) {
      const [on, col] = lightState(LIGHTS[i], t);
      U.uOn.value[i + 1] = on;
      U.uCol.value[i + 1].set(col[0], col[1], col[2]);
    }
    U.uBump.value = Math.max(0, lampOn(t) - 1) / 0.32;
    S.renderer.render(S.scene, S.cam);
    drawOverlay(S.overlay, t, S.chips, A, B);
  },
});

function geranium(g, c, z, s) {
  const [qx, qy] = P(XL + 0.22, 0, z), sc = F / z * s;
  g.fillStyle = c('#c2653f'); g.beginPath(); g.moveTo(qx - 0.14 * sc, qy - 0.26 * sc); g.lineTo(qx + 0.14 * sc, qy - 0.26 * sc); g.lineTo(qx + 0.1 * sc, qy); g.lineTo(qx - 0.1 * sc, qy); g.fill();
  g.fillStyle = c('#a9532f'); g.fillRect(qx - 0.15 * sc, qy - 0.29 * sc, 0.3 * sc, 0.05 * sc);
  for (const [dx, dy, r, col] of [[-0.1, -0.38, 0.11, '#4f8a48'], [0.09, -0.4, 0.12, '#5d9a52'], [0, -0.5, 0.12, '#6aa85a'], [-0.05, -0.6, 0.08, '#5d9a52']]) {
    g.fillStyle = c(col); g.beginPath(); g.arc(qx + dx * sc, qy + dy * sc, r * sc, 0, 6.2832); g.fill();
  }
  g.fillStyle = c('#e2493c');
  for (const [dx, dy] of [[-0.08, -0.6], [0.06, -0.66], [0.13, -0.52], [-0.14, -0.48], [0.0, -0.7]]) { g.beginPath(); g.arc(qx + dx * sc, qy + dy * sc, 0.045 * sc, 0, 6.2832); g.fill(); }
}

// =================================================================== overlay: chapter cards, palette chips, dividers
const CHAPTERS = [[0, 0.25, 1.45], [1, 1.95, 3.42], [2, 4.4, 5.1], [2, 8.4, 99]];
function drawOverlay(g, t, chips, A, B) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.lineCap = 'butt'; g.setLineDash([]);
  g.clearRect(0, 0, 1080, 1920);
  // backing for the type: a soft top-left pool under a chapter card, a full-width band under the split's labels
  const cardA = Math.max(...CHAPTERS.map(([, tin, tout]) => ramp(t, tin - 0.1, tin + 0.4) * (1 - ramp(t, tout, tout + 0.25))));
  const bandA = ramp(t, 5.2, 5.6) * (1 - ramp(t, T_UNSPLIT[0] - 0.1, T_UNSPLIT[0] + 0.15));
  let gr;
  if (cardA > 0) {
    gr = g.createRadialGradient(170, 200, 0, 170, 200, 560);
    gr.addColorStop(0, `rgba(6,8,14,${0.42 * cardA})`); gr.addColorStop(0.5, `rgba(6,8,14,${0.22 * cardA})`); gr.addColorStop(1, 'rgba(6,8,14,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 740, 760);
  }
  if (bandA > 0) {
    gr = g.createLinearGradient(0, 0, 0, 380);
    gr.addColorStop(0, `rgba(6,8,14,${0.4 * bandA})`); gr.addColorStop(1, 'rgba(6,8,14,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 1080, 380);
  }
  gr = g.createLinearGradient(0, 1460, 0, 1920);
  gr.addColorStop(0, 'rgba(6,8,14,0)'); gr.addColorStop(1, 'rgba(6,8,14,0.66)');
  g.fillStyle = gr; g.fillRect(0, 1460, 1080, 460);
  // dividers of the split
  for (const x of [A, B]) {
    if (x < 1 || x > 1079) continue;
    g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(x - 3.5, 0, 7, 1920);
    g.fillStyle = 'rgba(255,255,255,0.92)'; g.fillRect(x - 1.5, 0, 3, 1920);
  }
  // chapter card (top left)
  for (const [gi, tin, tout] of CHAPTERS) {
    const a = ease.outCubic(ramp(t, tin, tin + 0.42)), x = ramp(t, tout, tout + 0.18);
    if (a <= 0 || x >= 1) continue;
    card(g, gi, chips[gi], 64, 150 + 26 * (1 - a) - 14 * x, a * (1 - x), t - tin, false);
  }
  // band labels in the split
  const bandIn = [5.45, 5.38, 5.3];
  for (let gi = 0; gi < 3; gi++) {
    const a = ease.outCubic(ramp(t, bandIn[gi], bandIn[gi] + 0.36)), x = ramp(t, T_UNSPLIT[0] - 0.1, T_UNSPLIT[0] + 0.08);
    if (a <= 0 || x >= 1) continue;
    card(g, gi, chips[gi], 180 + 360 * gi, 142 + 22 * (1 - a) - 10 * x, a * (1 - x), t - bandIn[gi], true);
  }
  g.globalAlpha = 1;
}
function card(g, gi, chips, x, y, alpha, age, centred) {
  const G = GRADES[gi];
  g.globalAlpha = alpha;
  g.textAlign = centred ? 'center' : 'left';
  g.fillStyle = ACCENT; g.font = `700 ${centred ? 24 : 28}px ${KR}`;
  g.fillText(G.num, x, y);
  if (!centred) { g.fillStyle = ACCENT; g.fillRect(x + 44, y - 10, 46, 2.5); }
  g.fillStyle = '#ffffff'; g.font = `800 ${centred ? 40 : 62}px ${KR}`;
  g.fillText(G.name, x, y + (centred ? 50 : 72));
  let cy = y + (centred ? 76 : 98);
  if (!centred) {
    g.globalAlpha = alpha * 0.78; g.font = `500 27px ${KR}`;
    g.fillText(G.sub, x, y + 116);
    cy = y + 142;
  }
  const cs = centred ? 30 : 40, gap = centred ? 8 : 10, n = chips.length, w = n * cs + (n - 1) * gap;
  const x0 = centred ? x - w / 2 : x;
  for (let i = 0; i < n; i++) {
    const k = ease.outBack(clamp((age - 0.1 - i * 0.04) / 0.26), 1.6);
    if (k <= 0) continue;
    const cx = x0 + i * (cs + gap) + cs / 2, cyc = cy + cs / 2, s = cs * k;
    g.globalAlpha = alpha * clamp(k);
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.roundRect(cx - s / 2 - 1.5, cyc - s / 2 - 1.5, s + 3, s + 3, 10); g.fill();
    g.fillStyle = chips[i]; g.beginPath(); g.roundRect(cx - s / 2, cyc - s / 2, s, s, 9); g.fill();
  }
  g.globalAlpha = 1;
}
