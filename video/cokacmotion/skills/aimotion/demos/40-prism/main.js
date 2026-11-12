/*
 * 40 · 빛을 나누는 프리즘 — Newton's experiment, traced spectrally.
 *
 * A slit lets a sheet of white light (CIE D65) into a dark room. In JS, every frame, 60 wavelengths × 5
 * sub-rays across the slit are traced in the plane of the sheet through two dense-flint (Schott SF11) prisms:
 * the index n(λ) comes from SF11's Sellmeier equation, every face splits a ray by the unpolarised Fresnel
 * equations into a refracted and a reflected child (total internal reflection when Snell has no solution),
 * so the faint ghost beams are real too. Each ray segment is drawn on the GPU as an exact Gaussian-convolved
 * line (erf along, Gaussian across) carrying its wavelength's CIE 1931 XYZ, additively into a float texture
 * of the sheet; the floor collects the same rays as an irradiance profile. A final shader looks at the 3-D
 * room: single scattering in the dusty air is the integral of that texture along each view ray through the
 * slab the sheet occupies (prefiltered by mip level), refracted through the prisms' glass; the floor (the
 * screen) shows the irradiance; XYZ → linear sRGB with luminance-preserving gamut mapping, bloom from mips.
 * Story: the beam arrives → the spectrum fans out onto the floor → a second, inverted prism (faces parallel
 * to the first) slides in along the fan and the colours recombine into a white beam. Pure function of t.
 */
import { defineDemo, track, ease, clamp } from '../_lib/stage.js';

const D = 9.5;
// world units ≈ stage px on the sheet plane z = 0; x right, y DOWN, z toward the camera
const APEX = (55 * Math.PI) / 180, SIDE = 330, BASE_X = 560, CY = 520;
const HT = SIDE * Math.cos(APEX / 2), HB = SIDE * Math.sin(APEX / 2);
const PR1 = [[BASE_X, CY - HB], [BASE_X + HT, CY], [BASE_X, CY + HB]];    // base (vertical) on the left, apex right
const YF = 1400, ZW = -700;        // floor (the screen) and back wall
const LB = 120, LP = 230;          // half-height of the light sheet (slit) and of the prisms, along z
const NL = 60, NSUB = 5, SUB_OFF = 3.0, SIGMA = 2.6;   // wavelengths, sub-rays across the slit, line width
const BT = { x0: -160, y0: -250, w: 800, h: 960, texel: 1.75 };   // beam texture: world rect, resolution
const FB = { x0: -160, n: 1024, bin: 1.4 };                         // floor irradiance bins along x
const MAXSEG = 16000;
const SCAT = 0.08, FLOOR_GAIN = 640, GLASS_SCAT = 0.45;

// ---------------------------------------------------------------- optics
function nSF11(lnm) {   // Schott SF11 dense flint, Sellmeier (λ in µm)
  const l2 = (lnm / 1000) ** 2;
  return Math.sqrt(1 + (1.73759695 * l2) / (l2 - 0.013188707) + (0.313747346 * l2) / (l2 - 0.0623068142) + (1.89878101 * l2) / (l2 - 155.23629));
}
function cmf(l) {   // CIE 1931 2° observer, Wyman–Sloan–Shirley multi-lobe fit
  const g = (x, mu, s1, s2) => { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
  return [
    1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
    0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
    1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8),
  ];
}
const D65 = [49.98, 54.65, 82.75, 91.49, 93.43, 86.68, 104.86, 117.01, 117.81, 114.86, 115.92, 108.81, 109.35, 107.80,
  104.79, 107.69, 104.41, 104.05, 100.00, 96.33, 95.79, 88.69, 90.01, 89.60, 87.70, 83.29, 83.70, 80.03, 80.21, 82.28,
  78.28, 69.72, 71.61, 74.35, 61.60, 69.89, 75.09, 63.59, 46.42, 66.81, 63.38];
const d65 = (l) => { const x = clamp((l - 380) / 10, 0, 40), i = Math.min(39, Math.floor(x)); return D65[i] + (D65[i + 1] - D65[i]) * (x - i); };
// the spectrum of the beam: per wavelength sample, its XYZ (sum of Y over all samples = 1) and glass index
const LAMBDA = Array.from({ length: NL }, (_, i) => 380 + (400 * (i + 0.5)) / NL);
const XYZ = LAMBDA.map((l) => cmf(l).map((v) => v * d65(l)));
{ const sY = XYZ.reduce((s, c) => s + c[1], 0); for (const c of XYZ) for (let k = 0; k < 3; k++) c[k] /= sY; }
const NIDX = LAMBDA.map(nSF11);

// ---------------------------------------------------------------- the two prisms
const v2 = { sub: (a, b) => [a[0] - b[0], a[1] - b[1]], add: (a, b) => [a[0] + b[0], a[1] + b[1]], mul: (a, k) => [a[0] * k, a[1] * k],
  norm: (a) => { const l = Math.hypot(a[0], a[1]); return [a[0] / l, a[1] / l]; } };
const eUp = v2.norm(v2.sub(PR1[1], PR1[0]));            // upper face B→A (entry)
const eLo = v2.norm(v2.sub(PR1[1], PR1[2]));            // lower face C→A (exit)
const nUpOut = [eUp[1], -eUp[0]], nLoOut = [-eLo[1], eLo[0]];
// incidence for minimum deviation at 550 nm: inside, the ray runs parallel to the base (straight down)
const TH1 = Math.asin(nSF11(550) * Math.sin(APEX / 2));
const DIN = (() => { const n = [-nUpOut[0], -nUpOut[1]], a = -TH1; return [n[0] * Math.cos(a) - n[1] * Math.sin(a), n[0] * Math.sin(a) + n[1] * Math.cos(a)]; })();
const ENTRY = v2.add(PR1[0], v2.mul(eUp, 100 / eUp[0]));
const SRC = v2.sub(ENTRY, v2.mul(DIN, (ENTRY[1] + 600) / DIN[1]));
const PERP = [-DIN[1], DIN[0]];
// prism 2 = prism 1 turned 180° about a point just beyond its exit face: all its faces are parallel to prism 1's,
// so for every wavelength the pair acts as a tilted plate and the colours leave parallel again
const EXITP = v2.add(PR1[2], v2.mul(eLo, 100 / eLo[0]));
const PIVOT = v2.add(EXITP, v2.mul(nLoOut, 30));
const PR2 = PR1.map((v) => v2.sub(v2.mul(PIVOT, 2), v));
const slide = track([[4.2, 1150], [6.6, 0, ease.inOutCubic]]);     // it slides in along its own face: the gap stays 60
const prism2At = (t) => { const s = slide(t); return PR2.map((v) => v2.sub(v, v2.mul(eLo, s))); };

function edgesOf(V) {
  const c = [(V[0][0] + V[1][0] + V[2][0]) / 3, (V[0][1] + V[1][1] + V[2][1]) / 3];
  return [0, 1, 2].map((i) => {
    const a = V[i], b = V[(i + 1) % 3], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ex = (b[0] - a[0]) / L, ey = (b[1] - a[1]) / L;
    let nx = ey, ny = -ex;
    if (nx * (c[0] - a[0]) + ny * (c[1] - a[1]) > 0) { nx = -nx; ny = -ny; }
    return { ax: a[0], ay: a[1], ex, ey, L, nx, ny };
  });
}

// ---------------------------------------------------------------- the spectral ray tracer (2-D, in the sheet)
const segs = new Float32Array(MAXSEG * 12);
const floorE = new Float32Array(FB.n * 4);
const floorTexData = new Float32Array(FB.n * 2 * 4);
function traceAll(t, front, prisms) {
  const P = prisms.map(edgesOf);
  let ns = 0;
  floorE.fill(0);
  const emit = (x0, y0, x1, y1, c, p, sigma, kind) => {
    if (ns >= MAXSEG) return;
    segs.set([x0, y0, x1, y1, c[0] * p, c[1] * p, c[2] * p, sigma, kind, 0, 0, 0], ns * 12);
    ns++;
  };
  const stack = [];
  for (let li = 0; li < NL; li++) {
    for (let k = 0; k < NSUB; k++) {
      const off = (k - (NSUB - 1) / 2) * SUB_OFF;
      stack.push([SRC[0] + PERP[0] * off, SRC[1] + PERP[1] * off, DIN[0], DIN[1], 1 / NSUB, -1, 0, 0]);
    }
    const nG = NIDX[li], col = XYZ[li];
    while (stack.length) {
      const [ox, oy, dx, dy, pw, inside, L, depth] = stack.pop();
      if (L >= front) continue;
      // nearest hit: the faces of the prism we are in, or any prism face from outside, the floor, the room
      let tBest = 1e9, hitP = -1, hitE = null;
      for (let pi = 0; pi < P.length; pi++) {
        if (inside >= 0 && pi !== inside) continue;
        for (const e of P[pi]) {
          const dn = dx * e.nx + dy * e.ny;
          if (inside >= 0 ? dn <= 1e-9 : dn >= -1e-9) continue;
          const tt = ((e.ax - ox) * e.nx + (e.ay - oy) * e.ny) / dn;
          if (tt < 1e-4 || tt >= tBest) continue;
          const s = (ox + dx * tt - e.ax) * e.ex + (oy + dy * tt - e.ay) * e.ey;
          if (s < -1e-6 || s > e.L + 1e-6) continue;
          tBest = tt; hitP = pi; hitE = e;
        }
      }
      let floorHit = false;
      if (hitP < 0) {
        const tf = dy > 1e-6 ? (YF - oy) / dy : 1e9;
        const tx = dx > 0 ? (1500 - ox) / dx : dx < 0 ? (-400 - ox) / dx : 1e9;
        const ty = dy < 0 ? (-650 - oy) / dy : 1e9;
        tBest = Math.min(tf, tx, ty);
        floorHit = tf <= tx && tf <= ty && tf < 1e9;
        if (tBest >= 1e9) continue;
      }
      const tDraw = Math.min(tBest, front - L);
      const hx = ox + dx * tBest, hy = oy + dy * tBest;
      emit(ox, oy, ox + dx * tDraw, oy + dy * tDraw, col, pw * (inside >= 0 ? GLASS_SCAT : 1), SIGMA, 0);
      if (tDraw < tBest) continue;                       // the light front has not got further yet
      const Lh = L + tBest;
      if (floorHit) {                                    // irradiance on the floor: Gaussian footprint 1/|cos|
        const sx = SIGMA / Math.max(Math.abs(dy), 0.05), w = pw * clamp((front - Lh) / 60);
        const c0 = (hx - FB.x0) / FB.bin, r = Math.ceil((3 * sx) / FB.bin);
        for (let b = Math.max(0, Math.floor(c0) - r); b <= Math.min(FB.n - 1, Math.floor(c0) + r); b++) {
          const u = ((b + 0.5) * FB.bin + FB.x0 - hx) / sx;
          const g = (w * Math.exp(-0.5 * u * u)) / (2.5066283 * sx);
          floorE[b * 4] += col[0] * g; floorE[b * 4 + 1] += col[1] * g; floorE[b * 4 + 2] += col[2] * g;
        }
        continue;
      }
      if (hitP < 0) continue;
      // a glass face: Fresnel split (unpolarised), Snell, or total internal reflection
      const n1 = inside >= 0 ? nG : 1, n2 = inside >= 0 ? 1 : nG;
      let Nx = hitE.nx, Ny = hitE.ny;
      if (dx * Nx + dy * Ny > 0) { Nx = -Nx; Ny = -Ny; }  // normal against the ray
      const ci = -(dx * Nx + dy * Ny), eta = n1 / n2, kk = 1 - eta * eta * (1 - ci * ci);
      let R = 1, tx = 0, ty = 0;
      if (kk > 0) {
        const ct = Math.sqrt(kk);
        const rs = (n1 * ci - n2 * ct) / (n1 * ci + n2 * ct), rp = (n2 * ci - n1 * ct) / (n2 * ci + n1 * ct);
        R = 0.5 * (rs * rs + rp * rp);
        tx = eta * dx + (eta * ci - ct) * Nx; ty = eta * dy + (eta * ci - ct) * Ny;
      }
      emit(hx, hy, hx, hy, col, pw * 1.5, 6.0, 1);        // a little light scattered by the glass surface
      if (depth >= 7) continue;
      if (R < 1) stack.push([hx, hy, tx, ty, pw * (1 - R), inside >= 0 ? -1 : hitP, Lh, depth + 1]);
      if (pw * R > 0.004) stack.push([hx, hy, dx + 2 * ci * Nx, dy + 2 * ci * Ny, pw * R, inside, Lh, depth + 1]);
    }
  }
  // the floor texture: row 0 sharp irradiance, row 1 a wide blur of it (light spilled around the spot)
  const blur = new Float32Array(floorE);
  const tmp = new Float32Array(FB.n * 4);
  for (let pass = 0; pass < 3; pass++) {                 // three box passes ≈ Gaussian, radius 24 bins
    const R = 24;
    for (let ch = 0; ch < 3; ch++) {
      let acc = 0;
      for (let i = -R; i <= R; i++) acc += blur[clamp(i, 0, FB.n - 1) * 4 + ch];
      for (let i = 0; i < FB.n; i++) {
        tmp[i * 4 + ch] = acc / (2 * R + 1);
        acc += blur[Math.min(FB.n - 1, i + R + 1) * 4 + ch] - blur[Math.max(0, i - R) * 4 + ch];
      }
    }
    blur.set(tmp);
  }
  floorTexData.set(floorE, 0);
  floorTexData.set(blur, FB.n * 4);
  return ns;
}

// ---------------------------------------------------------------- shaders
const SEG_VERT = `#version 300 es
layout(location = 0) in vec4 seg;      // x0 y0 x1 y1 (world)
layout(location = 1) in vec4 pw;       // X Y Z (power-weighted), sigma
layout(location = 2) in float kind;    // 0 line, 1 point splat
uniform vec4 bmap;                     // world x0, y0, 1/width, 1/height of the beam texture
out vec2 vP;
flat out vec4 vSeg, vPw;
flat out float vKind;
void main() {
  vec2 a = seg.xy, b = seg.zw, dir = b - a;
  float L = length(dir);
  vec2 t = L > 1e-4 ? dir / L : vec2(1.0, 0.0), n = vec2(-t.y, t.x);
  float e = 3.2 * pw.w;
  int id = gl_VertexID;
  vec2 c = id == 0 ? vec2(0.0, 0.0) : id == 1 ? vec2(1.0, 0.0) : id == 2 ? vec2(1.0, 1.0) : id == 3 ? vec2(0.0, 0.0) : id == 4 ? vec2(1.0, 1.0) : vec2(0.0, 1.0);
  vec2 p = a + t * mix(-e, L + e, c.x) + n * mix(-e, e, c.y);
  vP = p; vSeg = seg; vPw = pw; vKind = kind;
  gl_Position = vec4((p - bmap.xy) * bmap.zw * 2.0 - 1.0, 0.0, 1.0);
}`;
const SEG_FRAG = `#version 300 es
precision highp float;
in vec2 vP;
flat in vec4 vSeg, vPw;
flat in float vKind;
out vec4 o;
float erfa(float x) {      // erf, Winitzki's approximation (|error| < 1.3e-4)
  float x2 = x * x;
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + 0.147 * x2) / (1.0 + 0.147 * x2)));
}
void main() {
  float s = vPw.w, I;
  vec2 a = vSeg.xy;
  if (vKind > 0.5) {
    vec2 d = vP - a;
    I = exp(-dot(d, d) / (2.0 * s * s)) / (6.2831853 * s * s);
  } else {
    vec2 dir = vSeg.zw - a;
    float L = length(dir);
    vec2 t = dir / max(L, 1e-6), d = vP - a;
    float u = dot(d, t), v = d.x * t.y - d.y * t.x, k = 0.70710678 / s;
    // a segment convolved with a 2-D Gaussian: exact across, erf-integrated along — joints add up seamlessly
    I = exp(-v * v / (2.0 * s * s)) / (2.5066283 * s) * 0.5 * (erfa((L - u) * k) - erfa(-u * k));
  }
  o = vec4(vPw.xyz * I, 1.0);
}`;

const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 stage;
uniform vec3 cam, cF, cR, cD;
uniform float focal, tt, fade, frameNo;
uniform vec4 bmap;
uniform vec2 fmap;
uniform vec2 pv[6];
uniform sampler2D beamTex, floorTex;
out vec4 o;
const float YF = ${YF.toFixed(1)}, ZW = ${ZW.toFixed(1)}, LB = ${LB.toFixed(1)}, LP = ${LP.toFixed(1)};
const float SCAT = ${SCAT}, FLOOR_GAIN = ${FLOOR_GAIN.toFixed(1)}, TEXEL = ${BT.texel}, NGLASS = 1.79;

float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = mat2(0.8, 0.6, -0.6, 0.8) * p * 2.03 + 7.1; a *= 0.5; } return s; }

// XYZ → linear sRGB; out-of-gamut spectral colours are desaturated toward their own luminance
vec3 xyz2rgb(vec3 c) {
  vec3 r = mat3(3.2406, -0.9689, 0.0557, -1.5372, 1.8758, -0.2040, -0.4986, 0.0415, 1.0570) * c;
  float mn = min(r.r, min(r.g, r.b));
  if (mn < 0.0) r = mix(r, vec3(c.y), -mn / max(c.y - mn, 1e-7));
  return r;
}
vec3 beamAt(vec2 xy, float lod) { return xyz2rgb(textureLod(beamTex, (xy - bmap.xy) * bmap.zw, lod).rgb); }

// single scattering in the light sheet: ∫ density along the ray through the slab |z| < LB, in front of the floor.
// N samples, each read from the mip level that matches the ray's footprint between samples (prefiltered)
vec3 slab(vec3 o, vec3 d, int N, float lodBias, float tMax) {
  float ta = max((LB - o.z) / d.z, 0.0), tb = min((-LB - o.z) / d.z, tMax);
  if (tb <= ta) return vec3(0.0);
  float dt = (tb - ta) / float(N);
  vec3 pa = o + d * ta, pb = o + d * tb;
  float lod = log2(max(length(pb.xy - pa.xy) / float(N) / TEXEL, 1.0)) + lodBias;
  vec3 acc = vec3(0.0);
  for (int i = 0; i < N; i++) {
    vec3 p = o + d * (ta + (float(i) + 0.5) * dt);
    if (p.y > YF) continue;
    acc += beamAt(p.xy, lod) * (1.0 - smoothstep(LB - 30.0, LB, abs(p.z)));
  }
  return acc * dt;
}
// the room seen in glass: dark, with one soft light high behind the camera (y is down)
vec3 roomEnv(vec3 d) {
  vec3 c = vec3(0.010, 0.011, 0.016) + vec3(0.022, 0.024, 0.034) * smoothstep(-0.2, 0.8, -d.y);
  float k = max(dot(d, normalize(vec3(-0.45, -0.55, 0.70))), 0.0);
  return c + vec3(0.9, 0.93, 1.0) * (0.55 * pow(k, 40.0) + 0.06 * pow(k, 4.0));
}
float fresnel(float c, float n) {
  float s2 = max(1.0 - c * c, 0.0), ct = sqrt(max(1.0 - s2 / (n * n), 0.0));
  float rs = (c - n * ct) / (c + n * ct), rp = (n * c - ct) / (n * c + ct);
  return 0.5 * (rs * rs + rp * rp);
}
// floor (the screen) or back wall
vec3 background(vec3 o, vec3 d, out float tHit) {
  float tf = d.y > 1e-5 ? (YF - o.y) / d.y : 1e9;
  float tw = (ZW - o.z) / d.z;
  tHit = min(tf, tw);
  if (tf < tw) {
    vec3 p = o + d * tf;
    float u = (p.x - fmap.x) * fmap.y;
    vec3 E = xyz2rgb(texture(floorTex, vec2(u, 0.25)).rgb);
    vec3 Eb = xyz2rgb(texture(floorTex, vec2(u, 0.75)).rgb);
    float zp = 1.0 - smoothstep(LB - 30.0, LB, abs(p.z));          // the sheet's footprint across the floor
    float halo = exp(-abs(p.z) / 260.0);
    float grain = 0.88 + 0.24 * fbm(p.xz * vec2(0.02, 0.03));
    vec3 alb = vec3(0.56, 0.55, 0.53) * grain;
    vec3 c = alb / 3.14159 * FLOOR_GAIN * (E * zp + Eb * halo * 0.22);
    c += alb * 0.004 + alb * beamAt(vec2(p.x, YF - 60.0), 6.0) * 6.0;   // faint light from the glowing air
    // polished: a soft mirror image of the sheet (Fresnel at the grazing view angle)
    vec3 r = vec3(d.x, -d.y, d.z);
    float F = 0.03 + 0.6 * pow(clamp(1.0 - d.y, 0.0, 1.0), 5.0);
    c += F * slab(p, r, 5, 1.5, 1e9) * SCAT * 0.8;
    return c;
  }
  vec3 p = o + d * tw;
  vec3 c = vec3(0.004, 0.0045, 0.006) + vec3(0.30) * beamAt(p.xy, 7.0) * 9.0;
  return c * (0.85 + 0.3 * fbm(p.xy * 0.01));
}
// a triangular glass prism: the triangle a, b, c in xy, extruded over |z| < LP (slab test over its 5 planes)
bool prism(vec3 o, vec3 d, vec2 a, vec2 b, vec2 c, out float tin, out vec3 nin) {
  tin = -1e9; nin = vec3(0.0);
  float tout = 1e9;
  float t1 = (LP - o.z) / d.z, t2 = (-LP - o.z) / d.z;
  if (min(t1, t2) > tin) { tin = min(t1, t2); nin = vec3(0.0, 0.0, 1.0); }
  tout = min(tout, max(t1, t2));
  vec2 cen = (a + b + c) / 3.0;
  for (int i = 0; i < 3; i++) {
    vec2 p0 = i == 0 ? a : i == 1 ? b : c, p1 = i == 0 ? b : i == 1 ? c : a;
    vec2 e = p1 - p0, n = normalize(vec2(e.y, -e.x));
    if (dot(n, cen - p0) > 0.0) n = -n;
    float dn = dot(d.xy, n), dist = dot(o.xy - p0, n);
    if (abs(dn) < 1e-9) { if (dist > 0.0) return false; continue; }
    float t = -dist / dn;
    if (dn < 0.0) { if (t > tin) { tin = t; nin = vec3(n, 0.0); } } else tout = min(tout, t);
  }
  return tin < tout && tin > 0.0;
}
float edgeDist(vec2 p, vec2 a, vec2 b, vec2 c) {
  float m = 1e9;
  for (int i = 0; i < 3; i++) {
    vec2 p0 = i == 0 ? a : i == 1 ? b : c, p1 = i == 0 ? b : i == 1 ? c : a;
    vec2 e = normalize(p1 - p0);
    m = min(m, abs((p.x - p0.x) * e.y - (p.y - p0.y) * e.x));
  }
  return m;
}
// dust motes drifting through the room: they only show where the sheet lights them
float motes(vec2 sp, float t) {
  vec2 p = sp + vec2(6.0 * t, -11.0 * t);
  vec2 g = p / 22.0, id0 = floor(g);
  float m = 0.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = id0 + vec2(i, j);
    float h = h21(id);
    if (h > 0.2) continue;
    vec2 c = id + 0.5 + 0.3 * vec2(sin(t * 0.9 + h * 61.0), cos(t * 0.7 + h * 37.0));
    float d = length(g - c) * 22.0;
    m += exp(-d * d / 0.8) * (0.4 + 0.6 * h21(id + 4.0));
  }
  return m;
}

void main() {
  vec2 sp = vec2(gl_FragCoord.x, stage.y - gl_FragCoord.y);
  vec3 d = normalize(cF * focal + cR * (sp.x - 0.5 * stage.x) + cD * (sp.y - 0.5 * stage.y));
  float tb;
  vec3 bg = background(cam, d, tb);
  float t1, t2; vec3 n1, n2;
  bool h1 = prism(cam, d, pv[0], pv[1], pv[2], t1, n1);
  bool h2 = prism(cam, d, pv[3], pv[4], pv[5], t2, n2);
  // dust density (slow turbulent wisps) where the ray crosses the sheet's mid-plane
  vec3 p0 = cam + d * (-cam.z / d.z);
  float rho = 0.45 + 0.75 * fbm(p0.xy / 260.0 + vec2(0.03 * tt, -0.05 * tt));
  vec3 col, inScat;
  if (h1 || h2) {
    bool one = h1 && (!h2 || t1 < t2);
    float tin = one ? t1 : t2;
    vec3 nin = one ? n1 : n2;
    vec2 a = one ? pv[0] : pv[3], b = one ? pv[1] : pv[4], c = one ? pv[2] : pv[5];
    vec3 P = cam + d * tin;
    float ci = clamp(-dot(d, nin), 0.0, 1.0);
    float F = fresnel(max(ci, 1e-3), NGLASS);
    vec3 dr = refract(d, nin, 1.0 / NGLASS);               // the beam inside is seen through the glass
    inScat = slab(P, dr, 12, 0.0, 1e9) * SCAT;
    col = bg * (1.0 - F) * (1.0 - F) * vec3(0.90, 0.93, 0.96) + inScat * (1.0 - F) + F * roomEnv(reflect(d, nin));
    // polished edges: the cap's rim and the long edges catch the room light and the beam's glow
    float de = nin.z > 0.5 ? edgeDist(P.xy, a, b, c) : LP - abs(P.z);
    vec3 glow = beamAt(P.xy, 4.5) * SCAT * 260.0;
    col += (vec3(0.10, 0.11, 0.13) + glow) * (exp(-de / 1.3) + 0.25 * exp(-de / 7.0));
    col += roomEnv(reflect(d, nin)) * 0.04 * (nin.z > 0.5 ? 0.0 : 1.0);
  } else {
    inScat = slab(cam, d, 12, 0.0, tb) * SCAT;
    col = bg + inScat * rho;
  }
  // bloom: the sheet's own light spread by lens and air (mip levels of the beam texture)
  vec3 bl = beamAt(p0.xy, 3.0) * 0.55 + beamAt(p0.xy, 5.0) * 0.45 + beamAt(p0.xy, 7.0) * 0.4;
  col += bl * SCAT * 2.0 * LB * 0.22;
  col += motes(sp, tt) * dot(inScat, vec3(0.2126, 0.7152, 0.0722)) * vec3(1.0, 0.97, 0.92) * 5.0;
  // tone map, vignette, grain
  col *= 1.4;
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
  vec2 uv = sp / stage - 0.5;
  col *= 1.0 - 0.5 * dot(uv * vec2(1.0, 0.75), uv * vec2(1.0, 0.75));
  col *= fade;
  col += (h21(sp + frameNo * 7.13) - 0.5) / 255.0 * 1.5;
  o = vec4(col, 1.0);
}`;

// ---------------------------------------------------------------- timeline
const fade = track([[0, 0], [0.6, 1, ease.outCubic], [9.0, 1], [D, 0, ease.inCubic]]);
const lightFront = track([[0.2, 400], [2.4, 2400, (p) => p]]);           // the light arrives at a steady pace
const camDolly = track([[0, 0], [D, 1, ease.inOutCubic]]);

defineDemo({
  id: '40-prism',
  title: '빛을 나누는 프리즘',
  tech: '스펙트럼 광선 추적 · 파장별 굴절 (분산)',
  duration: D,
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float is required (float render targets)');
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const program = (vs, fs, attrs = {}) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      for (const [n, i] of Object.entries(attrs)) gl.bindAttribLocation(p, i, n);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      return p;
    };
    const segProg = program(SEG_VERT, SEG_FRAG);
    const comp = program(VERT, FRAG, { p: 0 });
    const U = {};
    for (const n of ['stage', 'cam', 'cF', 'cR', 'cD', 'focal', 'tt', 'fade', 'frameNo', 'bmap', 'fmap', 'pv', 'beamTex', 'floorTex']) U[n] = gl.getUniformLocation(comp, n);
    const uSegMap = gl.getUniformLocation(segProg, 'bmap');

    // instanced segments
    const segVao = gl.createVertexArray();
    gl.bindVertexArray(segVao);
    const segBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, segBuf);
    gl.bufferData(gl.ARRAY_BUFFER, segs.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 48, 0); gl.vertexAttribDivisor(0, 1);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 48, 16); gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 48, 32); gl.vertexAttribDivisor(2, 1);
    // full-screen triangle
    const quad = gl.createVertexArray();
    gl.bindVertexArray(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // the sheet's light: a mipmapped half-float texture in world coordinates
    const beamTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, beamTex);
    const levels = Math.floor(Math.log2(Math.max(BT.w, BT.h))) + 1;
    gl.texStorage2D(gl.TEXTURE_2D, levels, gl.RGBA16F, BT.w, BT.h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, beamTex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('beam framebuffer incomplete');
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // the floor's irradiance profile (row 0) and its blur (row 1)
    const floorTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, floorTex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA16F, FB.n, 2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const bmap = [BT.x0, BT.y0, 1 / (BT.w * BT.texel), 1 / (BT.h * BT.texel)];
    gl.useProgram(segProg);
    gl.uniform4fv(uSegMap, bmap);
    gl.useProgram(comp);
    gl.uniform2f(U.stage, W, H);
    gl.uniform4fv(U.bmap, bmap);
    gl.uniform2f(U.fmap, FB.x0, 1 / (FB.n * FB.bin));
    gl.uniform1i(U.beamTex, 0);
    gl.uniform1i(U.floorTex, 1);
    const target = [540, 820, 0];
    const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const focal = Math.hypot(0, 520, 3600);

    this.draw = (t) => {
      const front = t >= 2.4 ? 1e9 : lightFront(t);
      const p2 = prism2At(t);
      const prisms = t >= 4.2 ? [PR1, p2] : [PR1];
      const ns = traceAll(t, front, prisms);

      // 1) the sheet: additive Gaussian lines in XYZ, then mips (prefilter + bloom)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, BT.w, BT.h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(segProg);
      gl.bindVertexArray(segVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, segBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, segs, 0, ns * 12);
      if (ns) gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, ns);
      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, beamTex);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, floorTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, FB.n, 2, gl.RGBA, gl.FLOAT, floorTexData);

      // 2) the room
      const k = camDolly(t);
      const cam = [540 - 18 * k, 300 + 30 * k, 3600 - 260 * k];
      const F = norm(target.map((v, i) => v - cam[i]));
      const R = norm(cross(F, [0, 1, 0]));
      const Dn = cross(R, F);
      gl.viewport(0, 0, W, H);
      gl.useProgram(comp);
      gl.bindVertexArray(quad);
      gl.uniform3fv(U.cam, cam); gl.uniform3fv(U.cF, F); gl.uniform3fv(U.cR, R); gl.uniform3fv(U.cD, Dn);
      gl.uniform1f(U.focal, focal);
      gl.uniform1f(U.tt, t);
      gl.uniform1f(U.fade, fade(t));
      gl.uniform1f(U.frameNo, Math.round(t * 30));
      gl.uniform2fv(U.pv, [...PR1.flat(), ...p2.flat()]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  },
  frame(t) { this.draw(t); },
});
