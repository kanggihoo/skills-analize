/*
 * 34 · 빛이 지나는 구름 — volumetric cumulus with crepuscular rays, raw WebGL2.
 *
 * Setup: a 128³ Perlin–Worley/Worley-fBm shape noise and a 32³ Worley-fBm detail noise baked on the GPU into
 *   tiling 3D textures (mipmapped); a weather map (coverage + cloud-top height per km², a designed cumulus
 *   congestus among a Poisson field of smaller cumuli); a 64×64 void-and-cluster blue-noise tile.
 * Every frame, all from t:
 *   1. cloud shadow map — from each point of the cloud-base plane, the optical depth toward the sun through
 *      the whole layer, and what remains of it 0.9 / 1.8 / 2.7 km higher up the same sun ray (RGBA16F).
 *   2. clouds (0.5× resolution) — the view ray is marched through the slab; density = Perlin–Worley shape
 *      carved by coverage and a cumulus height profile, eroded by detail noise. Each sample marches 6 steps
 *      toward the sun (self-shadowing), then lights with Beer–Lambert transmittance, a dual-lobe
 *      Henyey–Greenstein phase, Wrenninge's multiple-scattering octaves, Schneider's powder term and a
 *      height-graded sky ambient; energy-conserving integration (Hillaire 2016). The start of each ray is
 *      jittered by blue noise shifted per frame index (never accumulated across frames).
 *   3. air (0.25×) — haze + Rayleigh along the view ray up to the cloud or the ground, lit through the
 *      shadow map: the shafts between lit and shadowed air are the crepuscular rays.
 *   4. composite — sky gradient, sun, layered hills and a valley floor dappled by cloud shadows; clouds and
 *      air upsampled with a small Gaussian (it also melts the jitter).
 *   5. bloom from the mip chain, ACES tone map, grain seeded by the frame index.
 */
import { defineDemo, track, ease } from '../_lib/stage.js';

const DEG = Math.PI / 180;
const D = 9.5;
// ---------------------------------------------------------------- the scene (km)
const CAM = [0, 0.15, 0];
const BASE = 1.5, TOPMAX = 5.2;                     // cloud layer
const SUN_EL = 25 * DEG, SUN_AZ = 0;
const SUN = [Math.cos(SUN_EL) * Math.sin(SUN_AZ), Math.sin(SUN_EL), Math.cos(SUN_EL) * Math.cos(SUN_AZ)];
const WIND = [-0.42, -0.03];                        // cloud drift (km/s, time-lapse)
const WDOM = [-20, -6, 20, 34];                     // weather map domain, cloud-following coordinates
const SDOM = [-11, -2.5, 11, 30];                   // shadow map domain, world xz
const SW = 384, SH = 576, WM = 512;
const FOCAL = 960 / Math.tan(32 * DEG);             // 64° vertical field of view
const f = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));

const VERT = `#version 300 es
layout(location = 0) in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

// ---------------------------------------------------------------- setup: tiling 3D noises
const NOISE_FRAG = `#version 300 es
precision highp float;
uniform float layer, res;
uniform int mode;
out vec4 o;
vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}
// periodic Worley, inverted F1 (bright blobs) — P cells per tile
float worley(vec3 p, float P) {
  vec3 id = floor(p), fr = fract(p);
  float m = 9.0;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec3 c = vec3(float(x), float(y), float(z));
    vec3 dd = c + hash33(mod(id + c, P) + 0.37) - fr;
    m = min(m, dot(dd, dd));
  }
  return clamp(1.0 - sqrt(m), 0.0, 1.0);
}
// periodic gradient (Perlin) noise
float grad(vec3 i, vec3 f, vec3 c, float P) { return dot(hash33(mod(i + c, P) + 0.71) * 2.0 - 1.0, f - c); }
float perlin(vec3 p, float P) {
  vec3 i = floor(p), f = fract(p);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = mix(grad(i, f, vec3(0, 0, 0), P), grad(i, f, vec3(1, 0, 0), P), u.x);
  float b = mix(grad(i, f, vec3(0, 1, 0), P), grad(i, f, vec3(1, 1, 0), P), u.x);
  float c = mix(grad(i, f, vec3(0, 0, 1), P), grad(i, f, vec3(1, 0, 1), P), u.x);
  float d = mix(grad(i, f, vec3(0, 1, 1), P), grad(i, f, vec3(1, 1, 1), P), u.x);
  return mix(mix(a, b, u.y), mix(c, d, u.y), u.z);
}
void main() {
  vec3 p = vec3(gl_FragCoord.xy, layer + 0.5) / res;
  if (mode == 0) {
    float w4 = worley(p * 4.0, 4.0), w8 = worley(p * 8.0, 8.0), w16 = worley(p * 16.0, 16.0);
    float w32 = worley(p * 32.0, 32.0), w64 = worley(p * 64.0, 64.0);
    float g = w4 * 0.625 + w8 * 0.25 + w16 * 0.125;
    float pf = 0.0, a = 1.0, fq = 4.0, wsum = 0.0;
    for (int i = 0; i < 7; i++) { pf += a * perlin(p * fq, fq); wsum += a; a *= 0.5; fq *= 2.0; }
    pf = clamp(abs(pf / wsum) * 1.6, 0.0, 1.0);                 // billowy Perlin fBm
    float pw = g + pf * (1.0 - g);                                // Perlin–Worley
    o = vec4(pw, g, w8 * 0.625 + w16 * 0.25 + w32 * 0.125, w16 * 0.625 + w32 * 0.25 + w64 * 0.125);
  } else {
    float w2 = worley(p * 2.0, 2.0), w4 = worley(p * 4.0, 4.0), w8 = worley(p * 8.0, 8.0);
    float w16 = worley(p * 16.0, 16.0), w32 = worley(p * 32.0, 32.0);
    o = vec4(w2 * 0.625 + w4 * 0.25 + w8 * 0.125, w4 * 0.625 + w8 * 0.25 + w16 * 0.125, w8 * 0.625 + w16 * 0.25 + w32 * 0.125, 1.0);
  }
}`;

// ---------------------------------------------------------------- the cloud field (shared)
const COMMON = `
const float PI = 3.14159265359;
const float BASE = ${f(BASE)}, TOPMAX = ${f(TOPMAX)};
const float SHAPE_TILE = 3.4, DETAIL_TILE = 0.62, SIGMA = 85.0;   // km, km, extinction per unit density (1/km)
uniform sampler3D shapeT, detailT;
uniform sampler2D weatherT;
uniform vec3 sunDir, sunCol;
uniform vec2 windOff;          // world = cloud space + windOff
uniform vec3 shapeOff, detailOff;
uniform float t;
float sstep(float a, float b, float x) { float q = clamp((x - a) / (b - a), 0.0, 1.0); return q * q * (3.0 - 2.0 * q); }
float remap(float x, float a, float b, float c, float d) { return c + (x - a) * (d - c) / (b - a); }
float hg(float c, float g) { return 0.0795775 * (1.0 - g * g) / pow(max(1.0 + g * g - 2.0 * g * c, 1e-4), 1.5); }
// density at p (km); hf returns the height fraction inside this cloud; lod: noise mip
float density(vec3 p, bool detail, float lod, out float hf) {
  hf = 0.0;
  if (p.y < BASE || p.y > TOPMAX) return 0.0;
  vec2 cp = p.xz - windOff;
  vec2 w = textureLod(weatherT, (cp - vec2(${f(WDOM[0])}, ${f(WDOM[1])})) / vec2(${f(WDOM[2] - WDOM[0])}, ${f(WDOM[3] - WDOM[1])}), 0.0).rg;
  float cov = w.r;
  if (cov < 0.02) return 0.0;
  float top = BASE + 0.25 + w.g * (TOPMAX - BASE - 0.25);
  float h = (p.y - BASE) / (top - BASE);
  if (h >= 1.0) return 0.0;
  hf = h;
  float prof = sstep(0.0, 0.07, h) * (1.0 - sstep(0.6, 1.0, h));   // flat base, rounded dome
  float c = cov * (1.0 - 0.4 * h);                                   // towers narrow toward the top
  vec3 q = vec3(cp.x, p.y, cp.y);
  vec4 sn = textureLod(shapeT, q / SHAPE_TILE + shapeOff, lod);
  float lowF = sn.g * 0.625 + sn.b * 0.25 + sn.a * 0.125;
  float b = remap(sn.r, lowF - 1.0, 1.0, 0.0, 1.0) * prof;
  float d = remap(b, 1.0 - c, 1.0, 0.0, 1.0) * c;
  if (d <= 0.0) return 0.0;
  if (detail) {
    vec3 dn = textureLod(detailT, q / DETAIL_TILE + detailOff, lod).rgb;
    float hfn = dn.r * 0.625 + dn.g * 0.25 + dn.b * 0.125;
    hfn = mix(hfn, 1.0 - hfn, clamp(h * 6.0, 0.0, 1.0));              // wispy base, billowy above
    d = remap(d, hfn * 0.34, 1.0, 0.0, 1.0);
  }
  return max(d, 0.0);
}
`;

const CAMLIB = `
uniform vec2 stage;
uniform float focal;
uniform vec3 camPos, camF, camRi, camU;
vec3 dirOf(vec2 px) { return normalize(camF * focal + camRi * (px.x - 0.5 * stage.x) + camU * (px.y - 0.5 * stage.y)); }
`;

// ---------------------------------------------------------------- per frame: shadow map
const SHADOW_FRAG = `#version 300 es
precision highp float;
precision highp sampler3D;
${COMMON}
uniform vec2 sres;
out vec4 o;
void main() {
  vec2 xz = mix(vec2(${f(SDOM[0])}, ${f(SDOM[1])}), vec2(${f(SDOM[2])}, ${f(SDOM[3])}), gl_FragCoord.xy / sres);
  vec3 p = vec3(xz.x, BASE, xz.y);
  float len = (TOPMAX - BASE) / sunDir.y;
  const int NS = 36;
  float ds = len / float(NS);
  float tau = 0.0, c1 = -1.0, c2 = -1.0, c3 = -1.0, hf;
  for (int i = 0; i < NS; i++) {
    tau += density(p + sunDir * ((float(i) + 0.5) * ds), false, 1.0, hf) * ds;
    float y = float(i + 1) * ds * sunDir.y;          // height above the base at the end of this step
    if (c1 < 0.0 && y >= 0.9) c1 = tau;
    if (c2 < 0.0 && y >= 1.8) c2 = tau;
    if (c3 < 0.0 && y >= 2.7) c3 = tau;
  }
  o = vec4(tau, tau - max(c1, 0.0), tau - max(c2, 0.0), tau - max(c3, 0.0)) * SIGMA;
}`;

// transmittance of sunlight at p through the clouds above, read from the shadow map
const SUNVIS = `
uniform sampler2D shadowT;
float sunVis(vec3 p) {
  float dy = p.y - BASE;
  vec3 q = p - sunDir * (dy / sunDir.y);
  vec4 s = textureLod(shadowT, (q.xz - vec2(${f(SDOM[0])}, ${f(SDOM[1])})) / vec2(${f(SDOM[2] - SDOM[0])}, ${f(SDOM[3] - SDOM[1])}), 0.0);
  float hh = clamp(dy / 0.9, 0.0, 10.0), tau;
  if (hh < 1.0) tau = mix(s.x, s.y, hh);
  else if (hh < 2.0) tau = mix(s.y, s.z, hh - 1.0);
  else if (hh < 3.0) tau = mix(s.z, s.w, hh - 2.0);
  else tau = mix(s.w, 0.0, clamp((hh - 3.0) / ${f((TOPMAX - BASE - 2.7) / 0.9)}, 0.0, 1.0));
  return exp(-tau);
}
`;

// ---------------------------------------------------------------- per frame: the clouds
const CLOUD_FRAG = `#version 300 es
precision highp float;
precision highp sampler3D;
${COMMON}
${CAMLIB}
uniform sampler2D blueT;
uniform vec2 res, blueOff;
uniform float blueShift, maxSteps;
uniform vec3 ambTop, ambBot;
layout(location = 0) out vec4 oC;
layout(location = 1) out vec4 oD;
// optical depth toward the sun: 6 growing steps, detailed near the sample (self-shadowing)
float lightTau(vec3 p, float lod) {
  float tau = 0.0, s = 0.0, st = 0.045, hf;
  for (int i = 0; i < 6; i++) {
    tau += density(p + sunDir * (s + 0.5 * st), i < 2, lod + float(i) * 0.5, hf) * st;
    s += st; st *= 1.75;
  }
  return tau * SIGMA;
}
void main() {
  vec2 px = gl_FragCoord.xy / res * stage;
  vec3 d = dirOf(px);
  vec3 L = vec3(0.0);
  float T = 1.0, dW = 0.0, dS = 0.0;
  if (d.y > 0.01) {
    float t0 = (BASE - camPos.y) / d.y, t1 = min((TOPMAX - camPos.y) / d.y, 42.0);
    if (t0 < t1) {
      float jit = fract(texelFetch(blueT, ivec2(mod(gl_FragCoord.xy + blueOff, 64.0)), 0).r + blueShift);
      float cosT = dot(d, sunDir);
      // dual-lobe Henyey–Greenstein per scattering octave (eccentricity shrinks with each octave)
      float ph0 = mix(hg(cosT, -0.25), hg(cosT, 0.85), 0.78);
      float ph1 = mix(hg(cosT, -0.15), hg(cosT, 0.51), 0.78);
      float ph2 = mix(hg(cosT, -0.09), hg(cosT, 0.31), 0.78);
      float pk = clamp((1.0 - cosT) * 1.6, 0.0, 0.9);              // powder only where light is back-scattered
      float pixA = 1.0 / (focal * res.x / stage.x);            // angle of one buffer pixel
      float tt = t0 + (0.03 + 0.0065 * t0) * jit;
      for (int i = 0; i < 200; i++) {
        if (float(i) >= maxSteps || tt > t1 || T < 0.015) break;
        float ds = 0.03 + 0.0065 * tt;
        vec3 p = camPos + d * tt;
        float lod = max(0.0, log2(tt * pixA / 0.025));
        float hf;
        float den = density(p, true, lod, hf);
        if (den > 0.002) {
          float sT = den * SIGMA;
          float tauL = lightTau(p, lod);
          // multiple scattering octaves (Wrenninge): energy a^i, extinction b^i, eccentricity c^i
          float ms = ph0 * exp(-tauL) + 0.5 * ph1 * exp(-0.5 * tauL) + 0.25 * ph2 * exp(-0.25 * tauL);
          float powder = 1.0 - exp(-2.0 * tauL);
          ms *= mix(1.0, powder, pk);
          vec3 amb = mix(ambBot, ambTop, hf);
          vec3 S = 0.98 * sT * (sunCol * ms + amb);
          float Ts = exp(-sT * ds);
          L += T * (S - S * Ts) / sT;                                // energy-conserving step (Hillaire 2016)
          float a = T * (1.0 - Ts);
          dW += a; dS += a * tt;
          T *= Ts;
        }
        tt += hf <= 0.0 && den <= 0.0 ? ds * 1.6 : ds;
      }
    }
  }
  oC = vec4(L, T);
  oD = vec4(dW > 1e-3 ? dS / dW : 60.0, dW, 0.0, 1.0);
}`;

// ---------------------------------------------------------------- per frame: the air (crepuscular rays)
const TERRAIN = `
float h11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float n1(float x) { float i = floor(x), fr = fract(x); float u = fr * fr * (3.0 - 2.0 * fr); return mix(h11(i), h11(i + 1.0), u) * 2.0 - 1.0; }
float ridge(float x, float s) { float a = 0.5, r = 0.0; for (int i = 0; i < 6; i++) { r += a * n1(x + s); x *= 2.03; a *= 0.5; s += 7.1; } return r; }
// layered hills as vertical cards at fixed distances (km), heights in km
float hillH(int i, float x) {
  if (i == 0) return 0.052 + 0.022 * ridge(x / 0.2, 1.0) + 0.006 * n1(x / 0.014);           // our hill, at the bottom edge
  if (i == 1) return 0.10 + 0.075 * ridge(x / 0.9, 4.0) + 0.006 * n1(x / 0.03);
  if (i == 2) return 0.20 + 0.15 * ridge(x / 2.4, 9.0) + 0.008 * n1(x / 0.06);
  return 0.42 + 0.36 * ridge(x / 5.5, 17.0) + 0.01 * n1(x / 0.15);
}
const float HD0 = 0.42, HD1 = 2.6, HD2 = 6.8, HD3 = 17.0;
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vn(vec2 p) {
  vec2 i = floor(p), fr = fract(p), u = fr * fr * (3.0 - 2.0 * fr);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x), u.y);
}
// farmland and woods on the valley floor; fp = pixel footprint (km) so distant detail averages out
vec3 groundAlb(vec2 xz, float fp) {
  float wood = vn(xz * 1.1 + 3.0) * 0.6 + vn(xz * 3.3 + 7.0) * 0.3 + vn(xz * 9.0) * 0.1;
  wood = smoothstep(0.52, 0.6 + fp * 2.0, wood);
  vec2 g = mat2(0.83, 0.56, -0.56, 0.83) * xz / vec2(0.21, 0.13);
  vec2 id = floor(g + 0.3 * vn(xz * 4.0));
  float hs = h21(id), hs2 = h21(id + 31.0);
  vec3 field = mix(vec3(0.062, 0.085, 0.032), vec3(0.115, 0.105, 0.052), hs);
  field = mix(field, vec3(0.05, 0.07, 0.03), step(0.82, hs2));
  field = mix(field, vec3(0.08, 0.088, 0.04), smoothstep(0.02, 0.12, fp));
  return mix(field, vec3(0.022, 0.034, 0.019), wood);
}
// first terrain hit along d: x = distance (km), y = layer (0–3 hills, 4 valley floor, -1 none)
vec2 terrain(vec3 o, vec3 d) {
  float sg = d.y < -1e-4 ? (o.y / -d.y) : 1e9;                  // valley floor y = 0
  float dz = max(d.z, 1e-3);
  for (int i = 0; i < 4; i++) {
    float D = i == 0 ? HD0 : (i == 1 ? HD1 : (i == 2 ? HD2 : HD3));
    float s = D / dz;
    if (sg < s) return vec2(sg, 4.0);
    vec3 p = o + d * s;
    if (p.y < hillH(i, p.x)) return vec2(s, float(i));
  }
  return sg < 1e8 ? vec2(sg, 4.0) : vec2(1e9, -1.0);
}
`;

const AIR_FRAG = `#version 300 es
precision highp float;
precision highp sampler3D;
${COMMON}
${CAMLIB}
${SUNVIS}
${TERRAIN}
uniform sampler2D depthT, blueT;
uniform vec2 res, blueOff;
uniform float blueShift;
uniform vec3 ambAir;
layout(location = 0) out vec4 oL;
layout(location = 1) out vec4 oT;
const vec3 BR = vec3(5.8e-3, 13.6e-3, 33.1e-3);     // Rayleigh (1/km at sea level)
const float HAZE0 = 0.05, HAZE_H = 1.25;           // aerosol extinction at the ground (1/km), scale height (km)
void main() {
  vec2 px = gl_FragCoord.xy / res * stage;
  vec3 d = dirOf(px);
  float te = min(terrain(camPos, d).x, texture(depthT, gl_FragCoord.xy / res).r);
  if (d.y > 0.0) te = min(te, (6.0 - camPos.y) / d.y);
  te = min(te, 40.0);
  float cosT = dot(d, sunDir);
  float phM = mix(hg(cosT, 0.2), hg(cosT, 0.74), 0.85);
  float phR = 0.0596831 * (1.0 + cosT * cosT);
  float jit = fract(texelFetch(blueT, ivec2(mod(gl_FragCoord.xy * 1.0 + blueOff + 17.0, 64.0)), 0).r + blueShift);
  const int NS = 44;
  float ds = te / float(NS);
  vec3 L = vec3(0.0), T = vec3(1.0);
  for (int i = 0; i < NS; i++) {
    vec3 p = camPos + d * ((float(i) + jit) * ds);
    float hm = HAZE0 * exp(-max(p.y, 0.0) / HAZE_H);
    vec3 hr = BR * exp(-max(p.y, 0.0) / 8.0);
    float vis = sunVis(p);
    vec3 S = (hm * phM + hr * phR) * sunCol * vis + (hm + hr) * ambAir;
    vec3 sT = vec3(hm * 1.08) + hr;
    vec3 Ts = exp(-sT * ds);
    L += T * (S - S * Ts) / sT;
    T *= Ts;
  }
  oL = vec4(L, te);
  oT = vec4(T, 1.0);
}`;

// ---------------------------------------------------------------- per frame: composite (HDR)
const COMP_FRAG = `#version 300 es
precision highp float;
precision highp sampler3D;
${COMMON}
${CAMLIB}
${SUNVIS}
${TERRAIN}
uniform sampler2D cloudT, airL, airT, depthT;
uniform vec2 cres, ares;
uniform vec3 sunUV;              // sun position on the stage (px) and its angular radius
out vec4 o;
vec3 skyCol(vec3 d) {
  float e = max(d.y, 0.0);
  vec3 zen = vec3(0.020, 0.050, 0.152), hor = vec3(0.098, 0.128, 0.168);
  vec3 c = mix(hor, zen, 1.0 - exp(-e * 3.4));
  float cs = dot(d, sunDir);
  return c + sunCol * (0.010 * hg(cs, 0.76) + 0.006 * hg(cs, 0.3));   // the haze pass adds the rest of the aureole
}
// 3×3 Gaussian upsample of a low-resolution buffer (melts the per-frame blue-noise jitter)
vec4 up(sampler2D tx, vec2 r, float sg) {
  vec2 q = gl_FragCoord.xy / stage * r - 0.5;
  vec2 b = floor(q), fr = q - b;
  vec4 acc = vec4(0.0); float ws = 0.0;
  for (int y = -1; y <= 2; y++) for (int x = -1; x <= 2; x++) {
    vec2 o2 = vec2(float(x), float(y)) - fr;
    float w = exp(-dot(o2, o2) / (2.0 * sg * sg));
    acc += texelFetch(tx, ivec2(clamp(b + vec2(float(x), float(y)), vec2(0.0), r - 1.0)), 0) * w;
    ws += w;
  }
  return acc / ws;
}
void upAir(float te, out vec3 aL, out vec3 aT) {
  vec2 q = gl_FragCoord.xy / stage * ares - 0.5;
  vec2 b = floor(q), fr = q - b;
  vec3 sL = vec3(0.0), sT = vec3(0.0);
  float ws = 0.0;
  for (int y = -1; y <= 2; y++) for (int x = -1; x <= 2; x++) {
    ivec2 ip = ivec2(clamp(b + vec2(float(x), float(y)), vec2(0.0), ares - 1.0));
    vec4 l = texelFetch(airL, ip, 0), tr = texelFetch(airT, ip, 0);
    vec2 o2 = vec2(float(x), float(y)) - fr;
    float w = exp(-dot(o2, o2) / 1.62) * exp(-3.0 * abs(log(max(l.a, 1e-3) / max(te, 1e-3)))) + 1e-6;
    sL += l.rgb * w; sT += tr.rgb * w; ws += w;
  }
  aL = sL / ws; aT = sT / ws;
}
void main() {
  vec3 d = dirOf(gl_FragCoord.xy);
  vec3 col;
  vec2 th = terrain(camPos, d);
  vec4 cl = up(cloudT, cres, 0.8);
  if (th.y >= 0.0) {
    vec3 p = camPos + d * th.x;
    float vis = sunVis(p);
    vec3 skyIrr = vec3(0.13, 0.17, 0.24);
    if (th.y > 3.5) {   // valley floor: fields lit by the sun through the cloud shadows
      vec3 alb = groundAlb(p.xz, th.x / focal / max(-d.y, 0.02));
      col = alb / PI * (sunCol * sunDir.y * vis + skyIrr);
    } else {            // hills seen against the light: shaded faces, a rim where the crest catches the sun
      float hgt = hillH(int(th.y), p.x);
      float rim = sstep(-0.004 - 0.002 * th.x, 0.0, p.y - hgt);
      vec3 alb = vec3(0.035, 0.045, 0.03);
      col = alb / PI * (skyIrr * 0.55 + sunCol * vis * (0.06 + 0.5 * rim));
    }
  } else {
    col = cl.rgb + cl.a * skyCol(d);
    // the sun disk, limb-darkened; its direct beam is attenuated by its own fine march through the clouds
    // (the cloud buffer stops at T < 1.5 %, which is nothing for the sky but a lot for the sun)
    vec2 sd = gl_FragCoord.xy - sunUV.xy;
    float rr = length(sd) / (sunUV.z * focal);
    if (rr < 1.2) {
      float limb = 1.0 - 0.6 * (1.0 - sqrt(max(0.0, 1.0 - min(rr * rr, 1.0))));
      float t0 = (BASE - camPos.y) / sunDir.y, t1 = (TOPMAX - camPos.y) / sunDir.y, tau = 0.0, hf;
      for (int i = 0; i < 260; i++) {
        float tt = t0 + (float(i) + 0.5) * (t1 - t0) / 260.0;
        tau += density(camPos + sunDir * tt, true, 0.0, hf) * (t1 - t0) / 260.0;
      }
      col += sunCol * limb * sstep(1.0 + 0.1, 1.0 - 0.1, rr) / (PI * sunUV.z * sunUV.z * 0.8) * exp(-tau * SIGMA);
    }
  }
  // air: same march length as the air pass, upsampled with weights that respect silhouettes
  float te = th.y >= 0.0 ? th.x : texelFetch(depthT, ivec2(gl_FragCoord.xy / stage * cres), 0).r;
  if (d.y > 0.0) te = min(te, (6.0 - camPos.y) / d.y);
  te = min(te, 40.0);
  vec3 aL, aT;
  upAir(te, aL, aT);
  col = aL + aT * col;
  o = vec4(min(max(col, 0.0), 60.0), 1.0);
}`;

const FINAL_FRAG = `#version 300 es
precision highp float;
uniform sampler2D hdr;
uniform vec2 stage;
uniform float expo, fade, frameNo;
out vec4 o;
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec3 aces(vec3 x) { return clamp(x * (2.51 * x + 0.03) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main() {
  vec2 uv = gl_FragCoord.xy / stage;
  vec3 c = texture(hdr, uv).rgb;
  vec3 b = textureLod(hdr, uv, 2.0).rgb * 0.05 + textureLod(hdr, uv, 4.0).rgb * 0.05 + textureLod(hdr, uv, 6.0).rgb * 0.045;
  c = aces((c + b) * expo);
  vec2 q = uv - 0.5;
  c *= 1.0 - 0.42 * pow(clamp(length(q * vec2(1.1, 0.8)), 0.0, 1.0), 2.3);
  c = pow(max(c, 0.0), vec3(1.0 / 2.2));
  c *= fade;
  c += (h21(gl_FragCoord.xy + frameNo * 7.13) - 0.5) / 255.0 * 1.5;
  o = vec4(c, 1.0);
}`;

// ---------------------------------------------------------------- CPU: weather map, blue noise (setup)
const smooth = (a, b, x) => { const q = Math.max(0, Math.min(1, (x - a) / (b - a))); return q * q * (3 - 2 * q); };
function valueNoise2(seed) {
  const h = (x, y) => { let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ seed; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const n = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
  };
  return (x, y) => (n(x, y) * 0.55 + n(x * 2.1 + 5.3, y * 2.1 + 1.7) * 0.3 + n(x * 4.3 + 9.1, y * 4.3 + 3.3) * 0.15) * 2 - 1;
}
// coverage (R) and cloud-top height (G) in cloud-following coordinates
function buildWeather(rand) {
  const R = rand(3434);
  // the congestus the sun passes behind: its sun-facing edge reaches the sun line at ~1.7 s, its trailing
  // edge leaves it at ~8 s (the line sweeps cloud-space x = 0.42·t at z ≈ 5–7 km)
  const blobs = [
    { x: 1.45, z: 6.0, rx: 0.78, rz: 0.82, cov: 1.0, top: 4.95 },
    { x: 2.45, z: 6.3, rx: 0.74, rz: 0.75, cov: 1.0, top: 4.4 },
    { x: 1.95, z: 6.95, rx: 0.72, rz: 0.62, cov: 0.95, top: 4.75 },
    { x: 0.98, z: 6.5, rx: 0.42, rz: 0.5, cov: 0.78, top: 3.6 },
    { x: 3.05, z: 5.8, rx: 0.46, rz: 0.5, cov: 0.8, top: 3.35 },
    // companions that frame it and cast the ray-making shadows
    { x: -2.7, z: 7.8, rx: 0.85, rz: 0.7, cov: 0.92, top: 3.8 },
    { x: 6.4, z: 8.9, rx: 0.95, rz: 0.8, cov: 0.92, top: 4.1 },
    { x: 5.3, z: 4.0, rx: 0.5, rz: 0.45, cov: 0.82, top: 2.75 },
    { x: -1.7, z: 4.2, rx: 0.45, rz: 0.4, cov: 0.8, top: 2.6 },
    { x: 0.9, z: 13.4, rx: 1.2, rz: 0.9, cov: 0.95, top: 4.2 },
    { x: 3.6, z: 15.2, rx: 1.0, rz: 0.8, cov: 0.92, top: 3.9 },
    { x: -1.6, z: 17.5, rx: 1.1, rz: 0.9, cov: 0.9, top: 3.8 },
  ];
  // Poisson-disc field of smaller cumuli, kept out of the sun's corridor
  const pts = [];
  for (let tries = 0; tries < 12000 && pts.length < 230; tries++) {
    const x = WDOM[0] + R() * (WDOM[2] - WDOM[0]), z = WDOM[1] + R() * (WDOM[3] - WDOM[1]);
    if (z < 1.2) continue;
    if (x > -1.0 && x < 4.9 && z > 2.0 && z < 10.8) continue;
    if (blobs.some((b) => Math.hypot(b.x - x, b.z - z) < 1.6 + b.rx)) continue;
    if (pts.some((p) => Math.hypot(p.x - x, p.z - z) < 1.45)) continue;
    pts.push({ x, z });
  }
  for (const p of pts) {
    const r = 0.34 + 0.6 * R();
    blobs.push({ x: p.x, z: p.z, rx: r * (0.85 + 0.3 * R()), rz: r * (0.85 + 0.3 * R()), cov: 0.6 + 0.32 * R(), top: 2.25 + 1.3 * R() * R() + 0.6 * r });
  }
  const nz = valueNoise2(77);
  const data = new Uint8Array(WM * WM * 4);
  for (let j = 0; j < WM; j++) for (let i = 0; i < WM; i++) {
    const x = WDOM[0] + (i + 0.5) / WM * (WDOM[2] - WDOM[0]), z = WDOM[1] + (j + 0.5) / WM * (WDOM[3] - WDOM[1]);
    const wob = 1 + 0.24 * nz(x * 1.3, z * 1.3);
    let cov = 0, tw = 0, ts = 0;
    for (const b of blobs) {
      const dx = (x - b.x) / b.rx, dz = (z - b.z) / b.rz;
      if (dx * dx + dz * dz > 2.2) continue;
      const c = b.cov * (1 - smooth(0.3, 1.0, Math.sqrt(dx * dx + dz * dz) * wob));
      if (c <= 0) continue;
      cov = Math.max(cov, c);
      const w = c ** 4; tw += w; ts += w * b.top;
    }
    const top = tw > 0 ? ts / tw : BASE + 0.5;
    // nothing at the borders: beyond the map the edge texels would repeat
    cov *= smooth(0, 1.5, Math.min(x - WDOM[0], WDOM[2] - x, z - WDOM[1], WDOM[3] - z));
    const o = (j * WM + i) * 4;
    data[o] = Math.round(Math.min(1, cov) * 255);
    data[o + 1] = Math.round(Math.max(0, Math.min(1, (top - BASE - 0.25) / (TOPMAX - BASE - 0.25))) * 255);
    data[o + 2] = 0; data[o + 3] = 255;
  }
  return data;
}
// void-and-cluster blue noise (Ulichney 1993) on an n×n torus → ranks / n²
function blueNoise(n, rand) {
  const N2 = n * n, R = rand(9191), sg = 1.5;
  const k = new Float32Array(N2);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = Math.min(x, n - x), dy = Math.min(y, n - y);
    k[y * n + x] = Math.exp(-(dx * dx + dy * dy) / (2 * sg * sg));
  }
  const E = new Float32Array(N2), bits = new Uint8Array(N2);
  const toggle = (i, s) => {
    const ix = i % n, iy = (i / n) | 0;
    for (let y = 0; y < n; y++) {
      const ky = ((y - iy + n) % n) * n, ey = y * n;
      for (let x = 0; x < n; x++) E[ey + x] += s * k[ky + ((x - ix + n) % n)];
    }
  };
  const tight = () => { let b = -1, v = -Infinity; for (let i = 0; i < N2; i++) if (bits[i] && E[i] > v) { v = E[i]; b = i; } return b; };
  const loose = () => { let b = -1, v = Infinity; for (let i = 0; i < N2; i++) if (!bits[i] && E[i] < v) { v = E[i]; b = i; } return b; };
  const n0 = Math.floor(N2 * 0.1);
  for (let c = 0; c < n0;) { const i = Math.floor(R() * N2); if (!bits[i]) { bits[i] = 1; toggle(i, 1); c++; } }
  for (let it = 0; it < N2; it++) {        // relax the initial pattern
    const c = tight(); bits[c] = 0; toggle(c, -1);
    const v = loose(); bits[v] = 1; toggle(v, 1);
    if (v === c) break;
  }
  const rank = new Float32Array(N2), protoB = bits.slice(), protoE = E.slice();
  for (let r = n0 - 1; r >= 0; r--) { const c = tight(); bits[c] = 0; toggle(c, -1); rank[c] = r; }
  bits.set(protoB); E.set(protoE);
  for (let r = n0; r < N2; r++) { const v = loose(); bits[v] = 1; toggle(v, 1); rank[v] = r; }
  const out = new Uint8Array(N2);
  for (let i = 0; i < N2; i++) out[i] = Math.floor((rank[i] + 0.5) / N2 * 256);
  return out;
}

// ---------------------------------------------------------------- timeline (pure functions of t)
const yawDeg = track([[0, 1.2], [D, -2.2, ease.inOutCubic]]);
const pitchDeg = track([[0, 15.2], [D, 16.6, ease.inOutCubic]]);
const exposure = track([[0, 3.4], [1.6, 3.5], [3.4, 4.6], [6.6, 4.9], [8.3, 3.6], [D, 3.4]]);
const fade = track([[0, 0], [0.9, 1, ease.outCubic], [D - 0.45, 1], [D, 0, ease.inCubic]]);

defineDemo({
  id: '34-clouds',
  title: '빛이 지나는 구름',
  tech: 'WebGL2 볼류메트릭 레이마칭 · 다중 산란 근사 + 빛내림',
  duration: D,
  async setup({ canvas, W, H, rand, headless }) {
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false, depth: false } });
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float missing');
    gl.getExtension('OES_texture_float_linear');
    // headless (CPU) verification only: smaller noise and buffers so a frame stays cheap there
    const NR = headless ? 64 : 128, DR = headless ? 24 : 32;
    const CS = headless ? 0.3 : 0.5, AS = headless ? 0.2 : 0.25;
    const MAXSTEPS = headless ? 90 : 170;

    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const program = (fs) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const U = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, ''); U[name] = gl.getUniformLocation(p, name); }
      return { p, U };
    };
    const tex2D = (w, h, fmt, { filter = gl.LINEAR, wrap = gl.CLAMP_TO_EDGE, mips = false } = {}) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texStorage2D(gl.TEXTURE_2D, mips ? 1 + Math.floor(Math.log2(Math.max(w, h))) : 1, fmt, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      return tex;
    };
    const fbo = (texs) => {
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      texs.forEach((tx, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, tx, 0));
      gl.drawBuffers(texs.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('framebuffer incomplete');
      return fb;
    };
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const drawTri = () => gl.drawArrays(gl.TRIANGLES, 0, 3);
    const bindTex = (unit, target, tex) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(target, tex); };

    const Pnoise = program(NOISE_FRAG), Pshadow = program(SHADOW_FRAG), Pcloud = program(CLOUD_FRAG);
    const Pair = program(AIR_FRAG), Pcomp = program(COMP_FRAG), Pfin = program(FINAL_FRAG);

    // ---- tiling 3D noises, baked slice by slice
    const tex3D = (n) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_3D, tex);
      gl.texStorage3D(gl.TEXTURE_3D, 1 + Math.floor(Math.log2(n)), gl.RGBA8, n, n, n);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      for (const wr of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R]) gl.texParameteri(gl.TEXTURE_3D, wr, gl.REPEAT);
      return tex;
    };
    const shapeT = tex3D(NR), detailT = tex3D(DR);
    const bake = (tex, n, mode) => {
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.viewport(0, 0, n, n);
      gl.useProgram(Pnoise.p);
      gl.uniform1f(Pnoise.U.res, n);
      gl.uniform1i(Pnoise.U.mode, mode);
      for (let z = 0; z < n; z++) {
        gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, tex, 0, z);
        gl.uniform1f(Pnoise.U.layer, z);
        drawTri();
      }
      gl.bindTexture(gl.TEXTURE_3D, tex);
      gl.generateMipmap(gl.TEXTURE_3D);
    };
    bindTex(0, gl.TEXTURE_3D, null);
    bake(shapeT, NR, 0);
    bake(detailT, DR, 1);

    // ---- weather map and blue noise (CPU, seeded)
    const weatherT = tex2D(WM, WM, gl.RGBA8);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, WM, WM, gl.RGBA, gl.UNSIGNED_BYTE, buildWeather(rand));
    const blueT = tex2D(64, 64, gl.R8, { filter: gl.NEAREST, wrap: gl.REPEAT });
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 64, 64, gl.RED, gl.UNSIGNED_BYTE, blueNoise(64, rand));

    // ---- per-frame targets
    const shadowT = tex2D(SW, SH, gl.RGBA16F);
    const shadowFb = fbo([shadowT]);
    const cw = Math.round(W * CS), ch = Math.round(H * CS);
    const cloudT = tex2D(cw, ch, gl.RGBA16F, { filter: gl.NEAREST }), depthT = tex2D(cw, ch, gl.RGBA16F, { filter: gl.NEAREST });
    const cloudFb = fbo([cloudT, depthT]);
    const aw = Math.round(W * AS), ah = Math.round(H * AS);
    const airLT = tex2D(aw, ah, gl.RGBA16F, { filter: gl.NEAREST }), airTT = tex2D(aw, ah, gl.RGBA16F, { filter: gl.NEAREST });
    const airFb = fbo([airLT, airTT]);
    const hdrT = tex2D(W, H, gl.RGBA16F, { mips: true });
    const hdrFb = fbo([hdrT]);

    const SUNCOL = [1.0, 0.955, 0.875];
    const AMB_TOP = [0.052, 0.066, 0.094], AMB_BOT = [0.02, 0.024, 0.031], AMB_AIR = [0.03, 0.045, 0.072];

    this.draw = (t) => {
      const yaw = yawDeg(t) * DEG, pit = pitchDeg(t) * DEG;
      const F = [Math.sin(yaw) * Math.cos(pit), Math.sin(pit), Math.cos(yaw) * Math.cos(pit)];
      const Rt = [Math.cos(yaw), 0, -Math.sin(yaw)];
      const Up = [F[1] * Rt[2] - F[2] * Rt[1], F[2] * Rt[0] - F[0] * Rt[2], F[0] * Rt[1] - F[1] * Rt[0]];
      const windOff = [WIND[0] * t, WIND[1] * t];
      const frame = Math.round(t * 30);
      // blue noise: a new toroidal shift (R2 sequence) and value shift (golden ratio) every frame index
      const blueOff = [Math.floor(((frame * 0.7548776662) % 1) * 64), Math.floor(((frame * 0.5698402910) % 1) * 64)];
      const blueShift = (frame * 0.6180339887) % 1;
      // the sun on the stage (GL pixels, y up)
      const sz = SUN[0] * F[0] + SUN[1] * F[1] + SUN[2] * F[2];
      const sunPx = [W / 2 + FOCAL * (SUN[0] * Rt[0] + SUN[2] * Rt[2]) / sz, H / 2 + FOCAL * (SUN[0] * Up[0] + SUN[1] * Up[1] + SUN[2] * Up[2]) / sz];

      const setCommon = (P) => {
        gl.uniform1i(P.U.shapeT, 0); gl.uniform1i(P.U.detailT, 1); gl.uniform1i(P.U.weatherT, 2);
        gl.uniform3fv(P.U.sunDir, SUN); gl.uniform3fv(P.U.sunCol, SUNCOL);
        gl.uniform2fv(P.U.windOff, windOff);
        gl.uniform3f(P.U.shapeOff, 0.0, -0.0045 * t, 0.0016 * t);       // slow boiling of the shapes
        gl.uniform3f(P.U.detailOff, 0.004 * t, -0.03 * t, 0.0);          // billows rising
        if (P.U.t) gl.uniform1f(P.U.t, t);
      };
      const setCam = (P) => {
        gl.uniform2f(P.U.stage, W, H); gl.uniform1f(P.U.focal, FOCAL);
        gl.uniform3fv(P.U.camPos, CAM); gl.uniform3fv(P.U.camF, F); gl.uniform3fv(P.U.camRi, Rt); gl.uniform3fv(P.U.camU, Up);
      };
      bindTex(0, gl.TEXTURE_3D, shapeT); bindTex(1, gl.TEXTURE_3D, detailT); bindTex(2, gl.TEXTURE_2D, weatherT);
      bindTex(3, gl.TEXTURE_2D, blueT);

      // ---- 1. cloud shadow map
      bindTex(4, gl.TEXTURE_2D, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFb);
      gl.viewport(0, 0, SW, SH);
      gl.useProgram(Pshadow.p);
      setCommon(Pshadow);
      gl.uniform2f(Pshadow.U.sres, SW, SH);
      drawTri();

      // ---- 2. clouds
      gl.bindFramebuffer(gl.FRAMEBUFFER, cloudFb);
      gl.viewport(0, 0, cw, ch);
      gl.useProgram(Pcloud.p);
      setCommon(Pcloud); setCam(Pcloud);
      gl.uniform1i(Pcloud.U.blueT, 3);
      gl.uniform2f(Pcloud.U.res, cw, ch);
      gl.uniform2fv(Pcloud.U.blueOff, blueOff);
      gl.uniform1f(Pcloud.U.blueShift, blueShift);
      gl.uniform1f(Pcloud.U.maxSteps, MAXSTEPS);
      gl.uniform3fv(Pcloud.U.ambTop, AMB_TOP); gl.uniform3fv(Pcloud.U.ambBot, AMB_BOT);
      drawTri();

      // ---- 3. air: haze + Rayleigh through the cloud shadows
      bindTex(4, gl.TEXTURE_2D, shadowT); bindTex(5, gl.TEXTURE_2D, depthT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, airFb);
      gl.viewport(0, 0, aw, ah);
      gl.useProgram(Pair.p);
      setCommon(Pair); setCam(Pair);
      gl.uniform1i(Pair.U.shadowT, 4); gl.uniform1i(Pair.U.depthT, 5); gl.uniform1i(Pair.U.blueT, 3);
      gl.uniform2f(Pair.U.res, aw, ah);
      gl.uniform2fv(Pair.U.blueOff, blueOff);
      gl.uniform1f(Pair.U.blueShift, (blueShift + 0.37) % 1);
      gl.uniform3fv(Pair.U.ambAir, AMB_AIR);
      drawTri();

      // ---- 4. composite into HDR
      bindTex(5, gl.TEXTURE_2D, cloudT); bindTex(6, gl.TEXTURE_2D, airLT); bindTex(7, gl.TEXTURE_2D, airTT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, hdrFb);
      gl.viewport(0, 0, W, H);
      gl.useProgram(Pcomp.p);
      setCommon(Pcomp); setCam(Pcomp);
      bindTex(9, gl.TEXTURE_2D, depthT);
      gl.uniform1i(Pcomp.U.shadowT, 4); gl.uniform1i(Pcomp.U.cloudT, 5); gl.uniform1i(Pcomp.U.airL, 6); gl.uniform1i(Pcomp.U.airT, 7);
      gl.uniform1i(Pcomp.U.depthT, 9);
      gl.uniform2f(Pcomp.U.cres, cw, ch); gl.uniform2f(Pcomp.U.ares, aw, ah);
      gl.uniform3f(Pcomp.U.sunUV, sunPx[0], sunPx[1], 0.27 * DEG);
      drawTri();
      bindTex(8, gl.TEXTURE_2D, hdrT);
      gl.generateMipmap(gl.TEXTURE_2D);

      // ---- 5. bloom, tone map, grain
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(Pfin.p);
      gl.uniform1i(Pfin.U.hdr, 8);
      gl.uniform2f(Pfin.U.stage, W, H);
      gl.uniform1f(Pfin.U.expo, exposure(t));
      gl.uniform1f(Pfin.U.fade, fade(t));
      gl.uniform1f(Pfin.U.frameNo, frame);
      drawTri();
    };
  },
  frame(t) { this.draw(t); },
});
