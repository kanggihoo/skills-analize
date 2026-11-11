/*
 * 33 · 노을 진 바다 — a Tessendorf FFT ocean under a physically based sunset sky, raw WebGL2.
 *
 * Setup: Gaussian random amplitudes ξ(k) for three cascades (tiles of 600, 97 and 17 m, 256² modes each),
 *   seeded; the atmosphere's transmittance LUT and multiple-scattering LUT (Hillaire 2020); a tiling foam
 *   lace texture; the projected-grid mesh.
 * Every frame, all from t:
 *   1. sky-view LUT — single Rayleigh + Mie scattering (+ ozone, + the multiple-scattering LUT) marched
 *      from the camera for every (azimuth from the sun, elevation); an environment map of sky + high clouds
 *      for the reflections (mipmapped = pre-blurred for rough water).
 *   2. spectrum — h̃(k,t) = h0(k)e^{-iωt} + conj(h0(-k))e^{iωt}, ω = √(g|k|), with h0 from a JONSWAP
 *      wind sea (Donelan–Banner spreading) plus a narrow swell, both growing with t; from it the spectra of
 *      height, choppy displacement, slopes and displacement derivatives, packed two real fields per complex.
 *      Two extra strip segments hold the derivatives of the 97 m cascade at five earlier instants (foam memory).
 *   3. inverse FFT — 8 horizontal + 8 vertical Stockham radix-2 passes over a 1280×256 RGBA32F strip (MRT).
 *   4. resolve — per cascade: displacement, slopes, Jacobian terms, slope second moments (LEAN) and the
 *      past Jacobians into a mipmapped RGBA16F texture array.
 *   5. scene — sky + sun disk + clouds, then a screen-space projected grid displaced by the FFT; per pixel:
 *      normal of the displaced surface, Fresnel sky reflection, sun glitter from the filtered slope
 *      distribution (Bruneton 2010), subsurface light through backlit crests, Jacobian foam, aerial perspective.
 *   6. bloom from the mip chain, ACES tone map, grain seeded by the frame index.
 */
import { defineDemo, track, ease } from '../_lib/stage.js';

// ---------------------------------------------------------------- the sea (SI units)
const N = 256;                                   // FFT size per cascade
const SEGS = 5;                                  // strip: 3 cascades + 2 segments of past foam fields
const CASCADE_L = [600.0, 97.0, 17.0];           // tile sizes (m), mutually incommensurate
const BAND = [[0.0, 0.30], [0.30, 2.6], [2.6, 1e4]];   // wavenumber band each cascade owns (rad/m)
const PAST = [0.3, 0.65, 1.1, 1.65, 2.35];       // foam memory: Jacobian of the 97 m cascade this long ago (s)
const FOAM_LIFE = 1.5;                           // e-folding time of that memory (s)
const G = 9.81;
const FETCH = 50e3;                              // wind fetch for JONSWAP (m); capped at full development
const GAMMA_W = 3.3;                             // JONSWAP peak enhancement, wind sea
const SWELL_WP = 0.717, GAMMA_S = 2.0, SPREAD_S = 12;   // swell: ωp → λp = 2πg/ωp² ≈ 120 m, cos^2s spreading
const DIR_W = norm2(-0.24, -1), DIR_S = norm2(0.34, -1);   // where the waves travel: toward the camera
const CAM_H = 3.6;                               // camera height above mean sea level (m)
const DMAX = 12000;                              // projected grid reaches this far (m)
const GX = 300, GY = 700;                        // projected grid vertices
const K_RES = 50, K_CAP = 2 * Math.PI / 0.03;    // slopes finer than the last cascade: up to 3 cm ripples
const FOCAL = 960 / Math.tan((44 / 2) * Math.PI / 180);   // 44° vertical field of view

// ---------------------------------------------------------------- the atmosphere (km, 1/km)
const TURB = 2.5;                                // aerosol (sea haze) relative to the standard Mie density
const RG = 6360, RT = 6460;
const BR = [5.802e-3, 13.558e-3, 33.1e-3];
const BMS = 3.996e-3 * TURB, BME = 4.44e-3 * TURB;
const BO = [0.650e-3, 1.881e-3, 0.085e-3];
const HR = 8, HM = 1.2;
const HC = 6.5;                                  // altitude of the high cloud layer (km)
const SUN_R = 0.30 * Math.PI / 180;              // angular radius of the sun disk
const f = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));
const v3 = (a) => `vec3(${a.map(f).join(', ')})`;

function norm2(x, y) { const l = Math.hypot(x, y); return [x / l, y / l]; }

const ATMO = `
const float PI = 3.14159265359;
const float Rg = ${f(RG)}, Rt = ${f(RT)};
const float HH = ${f(Math.sqrt(RT * RT - RG * RG))};
const vec3 BR = ${v3(BR)};
const float BMS = ${f(BMS)}, BME = ${f(BME)};
const vec3 BO = ${v3(BO)};
const float HR = ${f(HR)}, HM = ${f(HM)}, GM = 0.8;
// smoothstep that also accepts a > b (GLSL leaves smoothstep undefined for edge0 >= edge1)
float sstep(float a, float b, float x) { float q = clamp((x - a) / (b - a), 0.0, 1.0); return q * q * (3.0 - 2.0 * q); }
vec3 dens(float h) { return vec3(exp(-h / HR), exp(-h / HM), max(0.0, 1.0 - abs(h - 25.0) / 15.0)); }
vec3 extinction(vec3 d) { return BR * d.x + BME * d.y + BO * d.z; }
float distTop(float r, float mu) { return max(0.0, -r * mu + sqrt(max(r * r * (mu * mu - 1.0) + Rt * Rt, 0.0))); }
float distGround(float r, float mu) {
  float disc = r * r * (mu * mu - 1.0) + Rg * Rg;
  return (mu < 0.0 && disc >= 0.0) ? -r * mu - sqrt(disc) : -1.0;
}
// Bruneton's (x_mu, x_r) parametrisation of the transmittance LUT (256 × 64)
vec2 transUV(float r, float mu) {
  float rho = sqrt(max(r * r - Rg * Rg, 0.0));
  float d = distTop(r, mu), dmin = Rt - r, dmax = rho + HH;
  float xm = clamp((d - dmin) / max(dmax - dmin, 1e-6), 0.0, 1.0), xr = clamp(rho / HH, 0.0, 1.0);
  return vec2(0.5 / 256.0 + xm * (255.0 / 256.0), 0.5 / 64.0 + xr * (63.0 / 64.0));
}
// the sun as seen from radius r: soft cut where it sets behind the planet (disk-sized)
float horizonVis(float r, float mu) { float s = Rg / r; return smoothstep(-0.0047, 0.0047, mu + sqrt(max(0.0, 1.0 - s * s))); }
float phaseR(float c) { return 0.0596831 * (1.0 + c * c); }
float phaseM(float c) { const float g = GM; float k = 0.1193662 * (1.0 - g * g) / (2.0 + g * g); return k * (1.0 + c * c) / pow(max(1.0 + g * g - 2.0 * g * c, 1e-4), 1.5); }
float hg(float c, float g) { return 0.0795775 * (1.0 - g * g) / pow(max(1.0 + g * g - 2.0 * g * c, 1e-4), 1.5); }
`;

// ---------------------------------------------------------------- setup passes: atmosphere LUTs, foam texture
const VERT = `#version 300 es
layout(location = 0) in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const TRANS_FRAG = `#version 300 es
precision highp float;
${ATMO}
out vec4 o;
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5) / vec2(255.0, 63.0);
  float rho = HH * uv.y, r = sqrt(rho * rho + Rg * Rg);
  float dmin = Rt - r, dmax = rho + HH, d = dmin + uv.x * (dmax - dmin);
  float mu = d < 1e-4 ? 1.0 : clamp((HH * HH - rho * rho - d * d) / (2.0 * r * d), -1.0, 1.0);
  vec3 od = vec3(0.0);
  const int S = 96;
  for (int i = 0; i < S; i++) {
    float s = (float(i) + 0.5) / float(S) * d;
    float ri = sqrt(max(r * r + s * s + 2.0 * r * mu * s, 0.0));
    od += extinction(dens(ri - Rg)) * (d / float(S));
  }
  o = vec4(exp(-od), 1.0);
}`;

// Hillaire 2020: 2nd-order isotropic scattering and its transfer factor f_ms per (r, μs); Ψ = L2 / (1 − f_ms)
const MS_FRAG = `#version 300 es
precision highp float;
${ATMO}
uniform sampler2D transT;
out vec4 o;
vec3 sunT(float r, float mu) { return texture(transT, transUV(r, mu)).rgb * horizonVis(r, mu); }
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5) / 31.0;
  float muS = uv.x * 2.0 - 1.0;
  float r = Rg + 0.01 + uv.y * (Rt - Rg - 0.02);
  vec3 P = vec3(0.0, r, 0.0), S = vec3(sqrt(max(0.0, 1.0 - muS * muS)), muS, 0.0);
  vec3 L2 = vec3(0.0), F = vec3(0.0);
  for (int i = 0; i < 8; i++) for (int j = 0; j < 8; j++) {
    float ct = 1.0 - 2.0 * (float(i) + 0.5) / 8.0, st = sqrt(max(0.0, 1.0 - ct * ct));
    float ph = 6.2831853 * (float(j) + 0.5) / 8.0;
    vec3 dir = vec3(st * cos(ph), ct, st * sin(ph));
    float dg = distGround(r, ct), tmax = dg > 0.0 ? dg : distTop(r, ct);
    float dt = tmax / 20.0;
    vec3 T = vec3(1.0), Lr = vec3(0.0), Fr = vec3(0.0);
    for (int k = 0; k < 20; k++) {
      vec3 Q = P + dir * ((float(k) + 0.5) * dt);
      float rq = length(Q);
      vec3 dd = dens(rq - Rg);
      vec3 sS = BR * dd.x + BMS * dd.y, sT = max(extinction(dd), vec3(1e-7));
      vec3 Ts = exp(-sT * dt);
      vec3 src = sS * sunT(rq, dot(Q / rq, S)) * 0.0795775;
      Lr += T * (src - src * Ts) / sT;
      Fr += T * (sS - sS * Ts) / sT;
      T *= Ts;
    }
    if (dg > 0.0) {   // the sea below reflects a little sunlight back up (albedo 0.06)
      vec3 Q = P + dir * dg; float mus = dot(normalize(Q), S);
      Lr += T * sunT(Rg, mus) * max(mus, 0.0) * 0.06 / PI;
    }
    L2 += Lr; F += Fr;
  }
  L2 /= 64.0; F /= 64.0;
  o = vec4(L2 / max(1.0 - F, vec3(1e-3)), 1.0);
}`;

// tiling foam lace: bright along the borders of periodic Worley cells, pocked by small bubbles
const FOAM_FRAG = `#version 300 es
precision highp float;
out vec4 o;
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
vec2 worley(vec2 p, float P) {
  vec2 i = floor(p), fr = fract(p);
  float F1 = 8.0, F2 = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 c = vec2(float(x), float(y));
    vec2 h = hash22(mod(i + c, P) + 17.0);
    float d = length(c + 0.15 + 0.7 * h - fr);
    if (d < F1) { F2 = F1; F1 = d; } else if (d < F2) { F2 = d; }
  }
  return vec2(F1, F2);
}
void main() {
  vec2 uv = gl_FragCoord.xy / 512.0;
  vec2 w1 = worley(uv * 9.0, 9.0), w2 = worley(uv * 23.0 + 0.37, 23.0), w3 = worley(uv * 61.0, 61.0);
  float lace = 1.0 - smoothstep(0.0, 0.17, w1.y - w1.x);
  float lace2 = 1.0 - smoothstep(0.0, 0.11, w2.y - w2.x);
  float bub = smoothstep(0.12, 0.42, w3.x);
  float pat = clamp(0.18 + 0.62 * lace + 0.32 * lace2 + 0.12 * w1.x, 0.0, 1.0) * mix(0.72, 1.0, bub);
  o = vec4(pat, pat, pat, 1.0);
}`;

// ---------------------------------------------------------------- per frame: sky-view LUT and environment
const SKYVIEW_FRAG = `#version 300 es
precision highp float;
${ATMO}
uniform sampler2D transT, msT;
uniform float camR, sunMu;
out vec4 o;
vec3 sunT(float r, float mu) { return texture(transT, transUV(r, mu)).rgb * horizonVis(r, mu); }
vec3 msAt(float r, float mu) {
  vec2 uv = vec2(mu * 0.5 + 0.5, (r - Rg - 0.01) / (Rt - Rg - 0.02));
  return texture(msT, 0.5 / 32.0 + clamp(uv, 0.0, 1.0) * (31.0 / 32.0)).rgb;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5) / vec2(255.0, 191.0);
  float phi = uv.x * PI, e = uv.y * uv.y * 0.5 * PI;          // azimuth from the sun, elevation (dense at the horizon)
  vec3 d = vec3(sin(phi) * cos(e), sin(e), cos(phi) * cos(e));
  vec3 S = vec3(0.0, sunMu, sqrt(max(0.0, 1.0 - sunMu * sunMu)));
  float c = dot(d, S), pR = phaseR(c), pM = phaseM(c);
  vec3 P = vec3(0.0, camR, 0.0);
  float dg = distGround(camR, d.y), tmax = dg > 0.0 ? dg : distTop(camR, d.y);
  vec3 L = vec3(0.0), T = vec3(1.0);
  float tPrev = 0.0;
  const int NS = 40;
  for (int i = 0; i < NS; i++) {
    float q = (float(i) + 1.0) / float(NS);
    float tc = tmax * q * q, dt = tc - tPrev;
    vec3 Q = P + d * (tPrev + 0.5 * dt);
    tPrev = tc;
    float rq = length(Q), mus = dot(Q / rq, S);
    vec3 dd = dens(rq - Rg);
    vec3 sR = BR * dd.x, sT = max(extinction(dd), vec3(1e-7));
    float sM = BMS * dd.y;
    vec3 Ts = sunT(rq, mus), ms = msAt(rq, mus);
    vec3 src = sR * (pR * Ts + ms) + sM * (pM * Ts + ms);
    vec3 Tst = exp(-sT * dt);
    L += T * (src - src * Tst) / sT;
    T *= Tst;
  }
  o = vec4(L, 1.0);
}`;

// shared by the sky background, the environment map and the water: LUT lookups and the high cloud layer
const SKYLIB = `
uniform sampler2D skyT, transT;
uniform vec3 sunDir;
uniform float sunAz, camR, t;
uniform vec2 cloudOff;
vec3 skyRad(vec3 d) {
  float e = asin(clamp(d.y, 0.0, 1.0));
  float a = atan(d.x, d.z) - sunAz;
  a = mod(a + PI, 2.0 * PI) - PI;
  vec2 uv = vec2(abs(a) / PI, sqrt(e / (0.5 * PI)));
  return texture(skyT, vec2(0.5 + uv.x * 255.0, 0.5 + uv.y * 191.0) / vec2(256.0, 192.0)).rgb;
}
vec3 transmittance(float r, float mu) { return texture(transT, transUV(r, mu)).rgb; }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float gnoise(vec2 p) {
  vec2 i = floor(p), q = fract(p);
  vec2 u = q * q * q * (q * (q * 6.0 - 15.0) + 10.0);
  float a = dot(hash22(i) * 2.0 - 1.0, q);
  float b = dot(hash22(i + vec2(1.0, 0.0)) * 2.0 - 1.0, q - vec2(1.0, 0.0));
  float c = dot(hash22(i + vec2(0.0, 1.0)) * 2.0 - 1.0, q - vec2(0.0, 1.0));
  float d = dot(hash22(i + vec2(1.0, 1.0)) * 2.0 - 1.0, q - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// band-limited fBm: octaves finer than the footprint fp (in p units) fade out instead of aliasing
float fbm(vec2 p, float fp, int oct) {
  float s = 0.0, a = 0.5, fq = 1.0;
  for (int i = 0; i < 7; i++) {
    if (i >= oct) break;
    s += a * gnoise(p) * clamp(1.6 - fp * fq * 1.4, 0.0, 1.0);
    p = mat2(1.62, 1.18, -1.18, 1.62) * p + 3.7;
    a *= 0.5; fq *= 2.0;
  }
  return s;
}
// altocumulus / cirrus streaks on a shell 6.5 km up; returns (radiance to add, transmittance of what lies behind)
vec4 clouds(vec3 d, float pixAng, vec3 sky) {
  if (d.y < 0.008) return vec4(0.0, 0.0, 0.0, 1.0);
  const float Rc = Rg + ${f(HC)};
  float mu = d.y;
  float s = -camR * mu + sqrt(max(camR * camR * (mu * mu - 1.0) + Rc * Rc, 0.0));   // km to the shell
  vec2 p = d.xz * s + cloudOff;
  const vec2 CW = vec2(0.94, 0.34);
  vec2 q = vec2(dot(p, CW), dot(p, vec2(-CW.y, CW.x))) * vec2(0.075, 0.21);
  float fp = s * pixAng / max(mu, 0.02) * 0.21;     // footprint along the view, in q units
  vec2 w = vec2(fbm(q * 0.6 + 1.7, fp * 0.6, 4), fbm(q * 0.6 + 9.2, fp * 0.6, 4));
  float n = fbm(q + 1.4 * w, fp, 6);
  float cov = smoothstep(0.02, 0.30, n + 0.10 * sin(q.x * 0.9 + 1.3));
  float fine = fbm(p * 0.55 + w * 2.0, s * pixAng / max(mu, 0.02) * 0.55, 5);
  float tau = cov * max(0.0, 0.7 + 1.6 * fine) * 1.6;
  tau *= sstep(230.0, 110.0, s);               // the shell melts into the horizon haze
  tau *= sstep(0.04, 0.12, acos(clamp(dot(d, sunDir), -1.0, 1.0)));   // a clear slot the sun sets through
  if (tau < 1e-4) return vec4(0.0, 0.0, 0.0, 1.0);
  // sunlight reaching that point of the shell (it sees the sun higher than we do: the Earth curves)
  vec3 Q = vec3(0.0, camR, 0.0) + d * s;
  float rq = length(Q), mus = dot(Q / rq, sunDir);
  vec3 Ts = transmittance(rq, mus) * horizonVis(rq, mus);
  float c = dot(d, sunDir);
  float ph = mix(hg(c, 0.62), hg(c, -0.2), 0.3);
  float al = 1.0 - exp(-tau);
  vec3 amb = skyRad(vec3(0.0, 0.9998, 0.02)) * 0.9 + skyRad(normalize(vec3(0.7, 0.3, 0.6))) * 0.6;
  vec3 Lc = Ts * (0.95 * ph * exp(-0.35 * tau) + 0.11 * al) + amb;
  // camera → cloud transmittance: ratio of the two LUT values along the same line
  vec3 Tp = transmittance(camR, mu) / max(transmittance(rq, dot(Q, d) / rq), vec3(1e-4));
  Tp = clamp(Tp, 0.0, 1.0);
  return vec4(al * Tp * (Lc - 0.3 * sky), exp(-tau));
}
`;

const ENV_FRAG = `#version 300 es
precision highp float;
${ATMO}
${SKYLIB}
out vec4 o;
void main() {
  float a = (gl_FragCoord.x / 1024.0 - 0.5) * 2.0 * PI;
  float v = (gl_FragCoord.y - 0.5) / 255.0, e = v * v * 0.5 * PI;
  vec3 d = vec3(sin(a) * cos(e), sin(e), cos(a) * cos(e));
  vec3 s = skyRad(d);
  vec4 c = clouds(d, 0.006, s);
  o = vec4(max(s + c.rgb, 0.0), 1.0);
}`;

// ---------------------------------------------------------------- per frame: spectrum and inverse FFT
const SPEC_FRAG = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D xiT;              // 3N × N: ξ(k).xy, ξ(-k).zw (complex unit Gaussians)
uniform vec3 Lc;
uniform vec4 spec[6];               // per time sample: wind α, wind ωp, swell α, swell ωp
uniform float tS[6], lam[6];        // time of each sample, choppiness at that time
uniform vec2 dirW, dirS;
uniform float normS;
layout(location = 0) out vec4 o0;
layout(location = 1) out vec4 o1;
const int NN = ${N};
const float G = ${f(G)}, PI = 3.14159265359;
vec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }
vec2 mi(vec2 z) { return vec2(-z.y, z.x); }    // × i
float jonswap(float w, float alpha, float wp, float gamma) {
  float sg = w <= wp ? 0.07 : 0.09;
  float r = exp(-(w - wp) * (w - wp) / (2.0 * sg * sg * wp * wp));
  float x = wp / w, x2 = x * x;
  float w2 = w * w;
  return alpha * G * G / (w2 * w2 * w) * exp(-1.25 * x2 * x2) * pow(gamma, r);
}
// Donelan–Banner directional spreading, normalised over θ ∈ [-π, π]
float donelan(float w, float wp, float th) {
  float r = w / wp, b;
  if (r < 0.95) b = 2.61 * pow(max(r, 0.56), 1.3);
  else if (r < 1.6) b = 2.28 * pow(r, -1.3);
  else b = pow(10.0, -0.4 + 0.8393 * exp(-0.567 * log(r * r)));
  float ch = cosh(b * th);
  return b / (2.0 * tanh(b * PI)) / (ch * ch);
}
float angleTo(vec2 k, vec2 dir) { return atan(k.x * dir.y - k.y * dir.x, dot(k, dir)); }
// |h0(k)| = sqrt(S(kx,kz) Δk² / 2), S(kx,kz) = S(ω) dω/dk / k · D(θ)
float amp(int c, vec2 k, int j) {
  float kk = length(k);
  vec2 band = c == 0 ? vec2(${f(BAND[0][0])}, ${f(BAND[0][1])}) : (c == 1 ? vec2(${f(BAND[1][0])}, ${f(BAND[1][1])}) : vec2(${f(BAND[2][0])}, ${f(BAND[2][1])}));
  if (kk <= max(band.x, 1e-6) || kk > band.y) return 0.0;
  float w = sqrt(G * kk);
  vec4 p = spec[j];
  float Sw = jonswap(w, p.x, p.y, ${f(GAMMA_W)}) * donelan(w, p.y, angleTo(k, dirW));
  float cs = max(cos(0.5 * angleTo(k, dirS)), 0.0);
  float Ss = jonswap(w, p.z, p.w, ${f(GAMMA_S)}) * normS * pow(cs, ${f(2 * SPREAD_S)});
  float S2 = (Sw + Ss) * (G / (2.0 * w)) / kk;
  float L = c == 0 ? Lc.x : (c == 1 ? Lc.y : Lc.z);
  float dk = 2.0 * PI / L;
  return sqrt(max(S2, 0.0) * dk * dk * 0.5);
}
vec2 htilde(int c, ivec2 n, vec2 k, int j) {
  vec4 xi = texelFetch(xiT, ivec2(c * NN + n.x, n.y), 0);
  vec2 h1 = xi.xy * amp(c, k, j), h2 = xi.zw * amp(c, -k, j);
  float ph = sqrt(G * length(k)) * tS[j];
  vec2 e = vec2(cos(ph), sin(ph));
  return cmul(h1, vec2(e.x, -e.y)) + cmul(vec2(h2.x, -h2.y), e);   // h0(k)e^{-iωt} + conj(h0(-k))e^{iωt}
}
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  int seg = p.x / NN;
  ivec2 n = ivec2(p.x - seg * NN, p.y);
  ivec2 m = ivec2(n.x < NN / 2 ? n.x : n.x - NN, n.y < NN / 2 ? n.y : n.y - NN);
  int c = seg < 3 ? seg : 1;
  float L = c == 0 ? Lc.x : (c == 1 ? Lc.y : Lc.z);
  vec2 k = vec2(m) * (2.0 * PI / L);
  float kk = length(k);
  if (kk < 1e-6 || m.x == -NN / 2 || m.y == -NN / 2) { o0 = vec4(0.0); o1 = vec4(0.0); return; }
  float kx = k.x, kz = k.y;
  if (seg < 3) {
    vec2 h = htilde(c, n, k, 0);
    float l = lam[0];
    vec2 Dx = mi(h) * (kx / kk) * l, Dz = mi(h) * (kz / kk) * l;    // choppy displacement, Gerstner sign
    vec2 hx = mi(h) * kx, hz = mi(h) * kz;                          // slopes
    vec2 Dxx = -h * (kx * kx / kk) * l, Dzz = -h * (kz * kz / kk) * l, Dxz = -h * (kx * kz / kk) * l;
    o0 = vec4(h + mi(Dx), Dz + mi(hx));       // two real fields per complex signal
    o1 = vec4(hz + mi(Dxx), Dzz + mi(Dxz));
  } else {
    vec2 F[15];
    for (int j = 0; j < 5; j++) {
      vec2 h = htilde(1, n, k, j + 1);
      float l = lam[j + 1];
      F[3 * j] = -h * (kx * kx / kk) * l;
      F[3 * j + 1] = -h * (kz * kz / kk) * l;
      F[3 * j + 2] = -h * (kx * kz / kk) * l;
    }
    if (seg == 3) { o0 = vec4(F[0] + mi(F[1]), F[2] + mi(F[3])); o1 = vec4(F[4] + mi(F[5]), F[6] + mi(F[7])); }
    else { o0 = vec4(F[8] + mi(F[9]), F[10] + mi(F[11])); o1 = vec4(F[12] + mi(F[13]), F[14]); }
  }
}`;

// one Stockham radix-2 pass (inverse sign) along x (within each 256-wide segment) or y; two textures at once
const FFT_FRAG = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D in0, in1;
uniform int msz, horiz;
layout(location = 0) out vec4 o0;
layout(location = 1) out vec4 o1;
const int NN = ${N};
vec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  int idx = horiz == 1 ? p.x % NN : p.y;
  int base = horiz == 1 ? p.x - idx : 0;
  int hs = msz / 2;
  int ev = (idx / msz) * hs + idx % hs;
  ivec2 pe = horiz == 1 ? ivec2(base + ev, p.y) : ivec2(p.x, ev);
  ivec2 po = horiz == 1 ? ivec2(base + ev + NN / 2, p.y) : ivec2(p.x, ev + NN / 2);
  float ang = 6.28318530718 * float(idx % msz) / float(msz);
  vec2 w = vec2(cos(ang), sin(ang));
  vec4 a = texelFetch(in0, pe, 0), b = texelFetch(in0, po, 0);
  vec4 c = texelFetch(in1, pe, 0), d = texelFetch(in1, po, 0);
  o0 = vec4(a.xy + cmul(w, b.xy), a.zw + cmul(w, b.zw));
  o1 = vec4(c.xy + cmul(w, d.xy), c.zw + cmul(w, d.zw));
}`;

// unpack one cascade into 4 layers: A (Dx, h, Dz, Dxz), B (hx, hz, Dxx, Dzz), C (hx², hz², hx·hz, J5−1), P (J1..J4 − 1)
const RESOLVE_FRAG = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D f0, f1;
uniform int seg, past;
layout(location = 0) out vec4 oA;
layout(location = 1) out vec4 oB;
layout(location = 2) out vec4 oC;
layout(location = 3) out vec4 oP;
const int NN = ${N};
float jm1(float xx, float zz, float xz) { return xx + zz + xx * zz - xz * xz; }
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec4 a = texelFetch(f0, ivec2(p.x + seg * NN, p.y), 0);    // h, λDx, λDz, hx
  vec4 b = texelFetch(f1, ivec2(p.x + seg * NN, p.y), 0);    // hz, λDxx, λDzz, λDxz
  oA = vec4(a.y, a.x, a.z, b.w);
  oB = vec4(a.w, b.x, b.y, b.z);
  oC = vec4(a.w * a.w, b.x * b.x, a.w * b.x, 0.0);
  oP = vec4(0.0);
  if (past == 1) {
    vec4 p0 = texelFetch(f0, ivec2(p.x + 3 * NN, p.y), 0), p1 = texelFetch(f1, ivec2(p.x + 3 * NN, p.y), 0);
    vec4 q0 = texelFetch(f0, ivec2(p.x + 4 * NN, p.y), 0), q1 = texelFetch(f1, ivec2(p.x + 4 * NN, p.y), 0);
    oP = vec4(jm1(p0.x, p0.y, p0.z), jm1(p0.w, p1.x, p1.y), jm1(p1.z, p1.w, q0.x), jm1(q0.y, q0.z, q0.w));
    oC.w = jm1(q1.x, q1.y, q1.z);
  }
}`;

// ---------------------------------------------------------------- per frame: the scene
const CAMLIB = `
uniform vec2 stage;
uniform float focal;
uniform vec3 camPos, camF, camRi, camU;
vec3 dirOf(vec2 px) { return normalize(camF * focal + camRi * (px.x - 0.5 * stage.x) + camU * (px.y - 0.5 * stage.y)); }
`;

const SKYBG_FRAG = `#version 300 es
precision highp float;
${ATMO}
${SKYLIB}
${CAMLIB}
uniform float sunRad, sunFlat, sunElev;
out vec4 o;
void main() {
  vec3 d = dirOf(gl_FragCoord.xy);
  vec3 dd = vec3(d.x, max(d.y, 0.0005), d.z);
  vec3 s = skyRad(normalize(dd));
  vec4 c = clouds(d, 1.0 / focal, s);
  vec3 col = s + c.rgb;
  // the sun disk: flattened by refraction near the horizon, limb-darkened, reddened per pixel through the LUT
  float de = asin(clamp(d.y, -1.0, 1.0)) - sunElev;
  float da = atan(d.x, d.z) - sunAz;
  da = (mod(da + PI, 2.0 * PI) - PI) * cos(sunElev);
  float rr = length(vec2(da, de / sunFlat)) / sunRad;
  float px = 1.0 / (focal * sunRad);
  float disk = sstep(1.0 + px, 1.0 - px, rr);
  if (disk > 0.0) {
    float limb = 1.0 - 0.6 * (1.0 - sqrt(max(0.0, 1.0 - min(rr * rr, 1.0))));
    vec3 Ts = transmittance(camR, max(d.y, -0.002));
    col += Ts * limb / (PI * sunRad * sunRad * sunFlat * 0.8) * disk * c.a;
  }
  o = vec4(min(max(col, 0.0), 40.0), 1.0);
}`;

const WATER_VERT = `#version 300 es
precision highp float;
precision highp sampler2DArray;
layout(location = 0) in vec2 g;
${CAMLIB}
uniform sampler2DArray fft;
uniform vec3 Lc;
uniform vec2 gx, gy, cell;
out vec2 vX0;
out vec3 vP;
vec4 project(vec3 P) {
  vec3 r = P - camPos;
  float z = dot(r, camF);
  const float n = 0.3, fa = 20000.0;
  return vec4(dot(r, camRi) * focal / (0.5 * stage.x), dot(r, camU) * focal / (0.5 * stage.y), z * (fa + n) / (fa - n) - 2.0 * fa * n / (fa - n), z);
}
vec3 dispAt(vec2 x0, float L, float layer, float fp) {
  float lod = log2(max(fp / (L / ${f(N)}), 1.0));
  return textureLod(fft, vec3(x0 / L, layer), lod).xyz;
}
void main() {
  vec2 px = vec2(mix(gx.x, gx.y, g.x), mix(gy.x, gy.y, g.y));
  vec3 d = dirOf(px);
  float lh = length(d.xz);
  vec2 dh = d.xz / max(lh, 1e-6);
  float hd = d.y < -1e-6 ? min(camPos.y * lh / -d.y, ${f(DMAX)}) : ${f(DMAX)};
  vec2 x0 = camPos.xz + dh * hd;
  // footprint of one grid cell on the sea (m): across × along the view (stretched at grazing angles)
  float sl = sqrt(hd * hd + camPos.y * camPos.y);
  float fp = sqrt((sl * cell.x / focal) * (sl * cell.y / focal * sl / camPos.y));
  vec3 a = dispAt(x0, Lc.x, 0.0, fp) + dispAt(x0, Lc.y, 4.0, fp) + dispAt(x0, Lc.z, 8.0, fp);
  vec3 P = vec3(x0.x + a.x, a.y, x0.y + a.z);
  vX0 = x0;
  vP = P;
  gl_Position = project(P);
}`;

const WATER_FRAG = `#version 300 es
precision highp float;
precision highp sampler2DArray;
${ATMO}
${SKYLIB}
uniform sampler2DArray fft;
uniform sampler2D envT, foamT;
uniform vec3 camPos, sunE;          // sunE: sunlight at sea level (transmittance × visible part of the disk)
uniform vec3 Lc;
uniform float Hs, unres;
uniform vec2 thr0;                  // foam now: Jacobian threshold, width
uniform vec2 thrP[5];               // foam memory: thresholds, widths for each past instant
uniform float decP[5];              // and its weight exp(-τ/life)
in vec2 vX0;
in vec3 vP;
out vec4 o;
float erfc_(float x) { return 2.0 * exp(-x * x) / (2.319 * x + sqrt(4.0 + 1.52 * x * x)); }
// Smith shadowing for a Gaussian slope distribution (Bruneton 2010)
float smithL(float c, float s2) {
  float v = max(c / sqrt(max((1.0 - c * c) * 2.0 * s2, 1e-9)), 1e-4);
  return max(0.0, (exp(-v * v) - v * 1.7724539 * erfc_(v)) / (2.0 * v * 1.7724539));
}
vec3 envAt(vec3 R, float lod) {
  float e = asin(clamp(R.y, 0.0, 1.0));
  float u = atan(R.x, R.z) * 0.1591549 + 0.5;
  float v = 0.5 / 256.0 + sqrt(e / (0.5 * PI)) * (255.0 / 256.0);
  return textureLod(envT, vec2(u, v), lod).rgb;
}
void main() {
  vec2 x0 = vX0;
  vec2 u0 = x0 / Lc.x, u1 = x0 / Lc.y, u2 = x0 / Lc.z;
  vec4 A0 = texture(fft, vec3(u0, 0.0)), B0 = texture(fft, vec3(u0, 1.0)), C0 = texture(fft, vec3(u0, 2.0));
  vec4 A1 = texture(fft, vec3(u1, 4.0)), B1 = texture(fft, vec3(u1, 5.0)), C1 = texture(fft, vec3(u1, 6.0));
  vec4 P1 = texture(fft, vec3(u1, 7.0));
  vec4 A2 = texture(fft, vec3(u2, 8.0)), B2 = texture(fft, vec3(u2, 9.0)), C2 = texture(fft, vec3(u2, 10.0));
  vec4 A = A0 + A1 + A2, B = B0 + B1 + B2;
  // slope covariance hidden inside this pixel (LEAN: E[s sᵀ] − E[s]E[s]ᵀ per cascade) + ripples below 13 cm
  vec3 cv = vec3(0.5 * unres, 0.5 * unres, 0.0);
  cv += vec3(max(C0.x - B0.x * B0.x, 0.0), max(C0.y - B0.y * B0.y, 0.0), C0.z - B0.x * B0.y);
  cv += vec3(max(C1.x - B1.x * B1.x, 0.0), max(C1.y - B1.y * B1.y, 0.0), C1.z - B1.x * B1.y);
  cv += vec3(max(C2.x - B2.x * B2.x, 0.0), max(C2.y - B2.y * B2.y, 0.0), C2.z - B2.x * B2.y);
  cv.xy += 2e-5;
  float cmax = 0.95 * sqrt(cv.x * cv.y);
  cv.z = clamp(cv.z, -cmax, cmax);               // keep the filtered covariance positive definite
  // normal of the displaced surface from its Lagrangian tangents; nu.y is the Jacobian
  vec3 tx = vec3(1.0 + B.z, B.x, A.w), tz = vec3(A.w, B.y, 1.0 + B.w);
  vec3 nu = cross(tz, tx);
  float J = nu.y;
  nu.y = max(nu.y, 0.12);
  vec3 n = normalize(nu);

  vec3 V = normalize(camPos - vP), L = sunDir;
  float dist = length(camPos - vP);
  vec3 Tx = normalize(vec3(n.y, -n.x, 0.0)), Tz = cross(Tx, n);
  float zV = max(dot(V, n), 0.01), zL = dot(L, n);
  vec2 vt = vec2(dot(V, Tx), dot(V, Tz)), lt = vec2(dot(L, Tx), dot(L, Tz));
  float sV = dot(vt * vt, cv.xy) / max(dot(vt, vt), 1e-6);
  float sL = dot(lt * lt, cv.xy) / max(dot(lt, lt), 1e-6);

  // sky reflection: mean Fresnel over the slope distribution, environment pre-blurred by the roughness
  vec3 R = reflect(-V, n);
  float rough = sqrt(cv.x + cv.y);
  float lod = log2(max(2.0 * rough / 0.00614, 1.0));
  vec3 Lsky = envAt(R, lod);
  if (R.y < 0.0) Lsky *= 0.55;   // reflected down into the next wave: it sees the sea's own reflection
  float oc = max(1.0 - zV, 1e-6), sgV = sqrt(sV);
  float Fm = 0.02 + 0.98 * pow(oc, 5.0 * exp(-2.69 * sgV)) / (1.0 + 22.7 * sgV * sqrt(sgV));

  // sun glitter: Gaussian slope pdf (full covariance) / cos⁴θh, Fresnel, height-correlated Smith masking
  vec3 H = normalize(L + V);
  float zH = max(dot(H, n), 1e-3);
  vec2 ze = vec2(dot(H, Tx), dot(H, Tz)) / zH;
  float det = max(cv.x * cv.y - cv.z * cv.z, 1e-10);
  float qf = (cv.y * ze.x * ze.x - 2.0 * cv.z * ze.x * ze.y + cv.x * ze.y * ze.y) / det;
  float pdf = exp(-0.5 * qf) / (6.2831853 * sqrt(det));
  float lV = smithL(zV, sV), lL = smithL(max(zL, 1e-3), sL);
  float Gm = 1.0 / (1.0 + max(lV, lL) + 0.3 * min(lV, lL));
  float vh = clamp(1.0 - dot(V, H), 0.0, 1.0), vh2 = vh * vh;
  float FH = 0.02 + 0.98 * vh2 * vh2 * vh;
  vec3 glint = sunE * FH * pdf * Gm / (4.0 * zV * zH * zH * zH * zH) * smoothstep(-0.004, 0.01, zL);

  // light inside the water: deep-water upwelling and sunlight through thin backlit crests
  vec3 amb = skyRad(vec3(0.0, 0.9998, 0.02)) * 0.6 + skyRad(normalize(vec3(-L.x, 0.25, -L.z))) * 0.4;
  float crest = clamp(A.y / max(0.55 * Hs, 0.05), 0.0, 1.6);
  crest *= crest;
  float away = clamp(0.5 - 0.5 * dot(n, L), 0.0, 1.0);
  vec3 tint = vec3(0.21, 0.80, 0.92);            // e^{-a·3.5 m}, a = pure-water absorption (R, G, B)
  vec3 sss = (sunE * hg(dot(-L, V), 0.45) * 1.7 * away * away + amb * 0.25) * tint * crest;
  vec3 body = amb * vec3(0.004, 0.018, 0.024);
  vec3 col = Fm * Lsky + glint + (1.0 - Fm) * (body + sss);

  // foam where the choppy displacement folds (Jacobian below a threshold set by the whitecap coverage),
  // and the memory of folds a few seconds ago at the same water particle
  float fNow = sstep(thr0.x, thr0.x - thr0.y, J);
  float div0 = B0.z + B0.w;
  float fPast = sstep(thrP[0].x, thrP[0].x - thrP[0].y, 1.0 + P1.x + div0) * decP[0];
  fPast = max(fPast, sstep(thrP[1].x, thrP[1].x - thrP[1].y, 1.0 + P1.y + div0) * decP[1]);
  fPast = max(fPast, sstep(thrP[2].x, thrP[2].x - thrP[2].y, 1.0 + P1.z + div0) * decP[2]);
  fPast = max(fPast, sstep(thrP[3].x, thrP[3].x - thrP[3].y, 1.0 + P1.w + div0) * decP[3]);
  fPast = max(fPast, sstep(thrP[4].x, thrP[4].x - thrP[4].y, 1.0 + C1.w + div0) * decP[4]);
  float foam = max(fNow, fPast);
  float pat = texture(foamT, x0 / 6.3).r * 0.62 + texture(foamT, x0 / 2.15 + 0.37).r * 0.38;
  float fa = smoothstep(1.0 - foam * 1.15, 1.0 - foam * 1.15 + 0.3, pat) * smoothstep(0.0, 0.08, foam);
  vec3 foamC = 0.8 / PI * (sunE * max(dot(n, L) * 0.75 + 0.25, 0.0) + amb * PI * 0.8);
  col = mix(col, foamC, fa * 0.93);

  // aerial perspective over the sea-level path (uniform air near the surface)
  vec3 Tap = exp(-(BR + BME) * (dist * 0.001));
  vec3 hor = skyRad(normalize(vec3(-V.x, 0.0016, -V.z)));
  col = col * Tap + hor * (1.0 - Tap);
  o = vec4(min(max(col, 0.0), 40.0), 1.0);
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
  vec3 b = textureLod(hdr, uv, 3.0).rgb * 0.045 + textureLod(hdr, uv, 5.0).rgb * 0.04 + textureLod(hdr, uv, 7.0).rgb * 0.035;
  c = (c + b) * expo;
  c = aces(c);
  vec2 q = uv - 0.5;
  c *= 1.0 - 0.5 * pow(clamp(length(q * vec2(1.15, 0.85)), 0.0, 1.0), 2.4);
  c = pow(max(c, 0.0), vec3(1.0 / 2.2));
  c *= fade;
  c += (h21(gl_FragCoord.xy + frameNo * 7.13) - 0.5) / 255.0 * 1.5;
  o = vec4(c, 1.0);
}`;

// ---------------------------------------------------------------- CPU side: spectra, statistics, sun (pure functions)
function jonswapJS(w, alpha, wp, gamma) {
  if (w <= 0) return 0;
  const sg = w <= wp ? 0.07 : 0.09;
  const r = Math.exp(-((w - wp) ** 2) / (2 * sg * sg * wp * wp));
  return alpha * G * G / w ** 5 * Math.exp(-1.25 * (wp / w) ** 4) * gamma ** r;
}
function integrate(fn, a, b, n = 400) {
  let s = 0; const h = (b - a) / n;
  for (let i = 0; i < n; i++) s += fn(a + (i + 0.5) * h) * h;
  return s;
}
const M0_SWELL = integrate((w) => jonswapJS(w, 1, SWELL_WP, GAMMA_S), 0.05, 8, 2000);
const NORM_S = 1 / integrate((th) => Math.max(Math.cos(th / 2), 0) ** (2 * SPREAD_S), -Math.PI, Math.PI, 2000);
// fetch-limited JONSWAP (Hasselmann 1973); dimensionless fetch capped where the sea is fully developed
const windSea = (U) => { const x = Math.min(G * FETCH / (U * U), 1.6e4); return { alpha: 0.076 * Math.pow(x, -0.22), wp: 22 * Math.pow(x, -1 / 3) * G / U }; };
// mean square slope of the omnidirectional spectrum between k0 and k1: ∫ k² S(k) dk = ∫ ω⁴/g² S(ω) dω
function mss(st, k0, k1) {
  const w0 = Math.sqrt(G * Math.max(k0, 1e-4)), w1 = Math.sqrt(G * k1);
  const n = 160, r = Math.log(w1 / w0);
  let s = 0;
  for (let i = 0; i < n; i++) {
    const w = w0 * Math.exp(r * (i + 0.5) / n), dw = w * r / n;
    s += (w ** 4 / (G * G)) * (jonswapJS(w, st.aW, st.wpW, GAMMA_W) + jonswapJS(w, st.aS, SWELL_WP, GAMMA_S)) * dw;
  }
  return s;
}
// upper-tail normal quantile (Abramowitz–Stegun 26.2.23)
function zTail(p) {
  const tt = Math.sqrt(-2 * Math.log(Math.max(p, 1e-9)));
  return tt - (2.515517 + 0.802853 * tt + 0.010328 * tt * tt) / (1 + 1.432788 * tt + 0.189269 * tt * tt + 0.001308 * tt ** 3);
}
// foam threshold on J: the fraction of sea below it matches a whitecap coverage that follows Monahan's
// W = 3.84e-6 U^3.41 (×2 for the screen); σ_J ≈ λ·√mss since J − 1 ≈ λ(∂Dx/∂x + ∂Dz/∂z) = −λ Σ k h̃
function foamThreshold(U, lam, m) {
  const cov = Math.min(Math.max(2 * 3.84e-6 * Math.pow(U, 3.41), 1e-6), 0.08);
  const sJ = lam * Math.sqrt(m);
  return [1 - zTail(cov) * sJ, 0.9 * sJ];
}

// transmittance through the atmosphere from radius r along μ (same model as the LUT)
function transJS(r, mu) {
  const dTop = -r * mu + Math.sqrt(Math.max(r * r * (mu * mu - 1) + RT * RT, 0));
  const n = 160, od = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    const s = (i + 0.5) / n * dTop;
    const h = Math.sqrt(Math.max(r * r + s * s + 2 * r * mu * s, 0)) - RG;
    const dR = Math.exp(-h / HR), dM = Math.exp(-h / HM), dO = Math.max(0, 1 - Math.abs(h - 25) / 15);
    for (let c = 0; c < 3; c++) od[c] += (BR[c] * dR + BME * dM + BO[c] * dO) * dTop / n;
  }
  return od.map((x) => Math.exp(-x));
}
// fraction of a disk above a line, centre x radii above it
function diskAbove(x) { x = Math.max(-1, Math.min(1, x)); return 1 - (Math.acos(x) - x * Math.sqrt(1 - x * x)) / Math.PI; }

// ---------------------------------------------------------------- timeline (pure functions of t)
const D = 9.5;
const DEG = Math.PI / 180;
const sunElevDeg = track([[0, 2.2], [D, -0.12, (p) => p]]);          // the sun's real motion is uniform
const swellHs = track([[0, 0.25], [0.8, 0.3], [6.2, 1.4, ease.inOutCubic], [D, 1.45]]);
const windU = track([[0, 2.6], [0.8, 3.0], [6.0, 10.0, ease.inOutCubic], [D, 10.5]]);
const chop = track([[0, 0.8], [6.0, 1.25], [D, 1.3]]);
const camZ = track([[0, 0], [D, 14, (p) => p]]);
const yawDeg = track([[0, -2.0], [D, 0.9, ease.inOutCubic]]);
const pitchDeg = track([[0, -3.3], [D, -2.9, ease.inOutCubic]]);
const exposure = track([[0, 5.2], [4.0, 6.0], [7.5, 8.0], [D, 9.5]]);
const fade = track([[0, 0], [1.0, 1, ease.outCubic], [D - 0.45, 1], [D, 0, ease.inCubic]]);
const SUN_AZ = 1.6 * DEG;

function seaState(tt) {
  const U = windU(tt), w = windSea(U), Hs = swellHs(tt);
  return { t: tt, U, aW: w.alpha, wpW: w.wp, aS: (Hs / 4) ** 2 / M0_SWELL, Hs, lam: chop(tt) };
}

defineDemo({
  id: '33-ocean',
  title: '노을 진 바다',
  tech: 'WebGL2 · FFT 해양 파도 (Tessendorf) + 대기 산란',
  duration: D,
  async setup({ canvas, W, H, rand }) {
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false, depth: false } });
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float missing');
    gl.getExtension('OES_texture_float_linear');
    const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
    const maxAniso = aniso ? Math.min(16, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) : 0;

    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').slice(0, 4).join('\n'));
      return s;
    };
    const program = (vs, fs) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
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
    const fbo = (texs, layered) => {
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      texs.forEach((tx, i) => {
        if (layered) gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, tx[0], 0, tx[1]);
        else gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, tx, 0);
      });
      gl.drawBuffers(texs.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('framebuffer incomplete');
      return fb;
    };

    // geometry: full-screen triangle and the projected grid
    const triVao = gl.createVertexArray();
    gl.bindVertexArray(triVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const gridVao = gl.createVertexArray();
    gl.bindVertexArray(gridVao);
    const gv = new Float32Array(GX * GY * 2);
    for (let j = 0, k = 0; j < GY; j++) for (let i = 0; i < GX; i++) { gv[k++] = i / (GX - 1); gv[k++] = j / (GY - 1); }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, gv, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const gi = new Uint32Array((GX - 1) * (GY - 1) * 6);
    for (let j = 0, k = 0; j < GY - 1; j++) for (let i = 0; i < GX - 1; i++) {
      const a = j * GX + i;
      gi[k++] = a; gi[k++] = a + 1; gi[k++] = a + GX; gi[k++] = a + 1; gi[k++] = a + GX + 1; gi[k++] = a + GX;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, gi, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    const drawTri = () => { gl.bindVertexArray(triVao); gl.drawArrays(gl.TRIANGLES, 0, 3); };

    // programs
    const Ptrans = program(VERT, TRANS_FRAG), Pms = program(VERT, MS_FRAG), Pfoam = program(VERT, FOAM_FRAG);
    const Psky = program(VERT, SKYVIEW_FRAG), Penv = program(VERT, ENV_FRAG);
    const Pspec = program(VERT, SPEC_FRAG), Pfft = program(VERT, FFT_FRAG), Pres = program(VERT, RESOLVE_FRAG);
    const Pbg = program(VERT, SKYBG_FRAG), Pwater = program(WATER_VERT, WATER_FRAG), Pfin = program(VERT, FINAL_FRAG);

    // ---- atmosphere LUTs (once)
    const transT = tex2D(256, 64, gl.RGBA32F);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo([transT]));
    gl.viewport(0, 0, 256, 64);
    gl.useProgram(Ptrans.p); drawTri();
    const msT = tex2D(32, 32, gl.RGBA32F);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo([msT]));
    gl.viewport(0, 0, 32, 32);
    gl.useProgram(Pms.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, transT);
    gl.uniform1i(Pms.U.transT, 0);
    drawTri();
    // ---- foam lace (once)
    const foamT = tex2D(512, 512, gl.RGBA8, { wrap: gl.REPEAT, mips: true });
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo([foamT]));
    gl.viewport(0, 0, 512, 512);
    gl.useProgram(Pfoam.p); drawTri();
    gl.bindTexture(gl.TEXTURE_2D, foamT);
    if (maxAniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, maxAniso);
    gl.generateMipmap(gl.TEXTURE_2D);

    // ---- seeded Gaussian amplitudes ξ(k) for the three cascades; ξ(-k) stored alongside
    const R = rand(330033);
    const gauss = () => Math.sqrt(-2 * Math.log(Math.max(R(), 1e-12))) * Math.cos(2 * Math.PI * R());
    const xr = new Float32Array(3 * N * N * 2);
    for (let i = 0; i < xr.length; i++) xr[i] = gauss() * Math.SQRT1_2;
    const xi = new Float32Array(3 * N * N * 4);
    for (let c = 0; c < 3; c++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const o = (y * 3 * N + c * N + x) * 4, a = ((c * N + y) * N + x) * 2, b = ((c * N + (N - y) % N) * N + (N - x) % N) * 2;
      xi[o] = xr[a]; xi[o + 1] = xr[a + 1]; xi[o + 2] = xr[b]; xi[o + 3] = xr[b + 1];
    }
    const xiT = tex2D(3 * N, N, gl.RGBA32F, { filter: gl.NEAREST });
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 3 * N, N, gl.RGBA, gl.FLOAT, xi);

    // ---- per-frame targets
    const skyT = tex2D(256, 192, gl.RGBA16F);
    const skyFb = fbo([skyT]);
    const envT = tex2D(1024, 256, gl.RGBA16F, { mips: true });
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    const envFb = fbo([envT]);
    const SW = SEGS * N;
    const strip = [0, 1, 2, 3].map(() => tex2D(SW, N, gl.RGBA32F, { filter: gl.NEAREST }));
    const stripFb = [fbo([strip[0], strip[1]]), fbo([strip[2], strip[3]])];
    // FFT results: 3 cascades × 4 layers, RGBA16F, mipmapped and tiling
    const fftA = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, fftA);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1 + Math.log2(N), gl.RGBA16F, N, N, 12);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
    if (maxAniso) gl.texParameterf(gl.TEXTURE_2D_ARRAY, aniso.TEXTURE_MAX_ANISOTROPY_EXT, maxAniso);
    const resFb = [0, 1, 2].map((c) => fbo([0, 1, 2, 3].map((i) => [fftA, c * 4 + i]), true));
    // HDR scene: 4× MSAA colour + depth, resolved into a mipmapped texture (bloom reads its mips)
    const hdrT = tex2D(W, H, gl.RGBA16F, { mips: true });
    const hdrFb = fbo([hdrT]);
    let sceneFb = hdrFb, msaa = false;
    try {
      const samples = Math.min(4, gl.getParameter(gl.MAX_SAMPLES));
      if (samples >= 2) {
        const crb = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, crb);
        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.RGBA16F, W, H);
        const drb = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, drb);
        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH_COMPONENT24, W, H);
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, crb);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, drb);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) { sceneFb = fb; msaa = true; }
      }
    } catch (e) { /* fall back to the single-sample target */ }
    gl.getError();
    if (!msaa) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, hdrFb);
      const drb = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, drb);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, W, H);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, drb);
    }

    const bindTex = (unit, target, tex) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(target, tex); };
    const camR = RG + CAM_H / 1000;

    this.draw = (t) => {
      // ---- the shot
      const yaw = yawDeg(t) * DEG, pit = pitchDeg(t) * DEG;
      const F = [Math.sin(yaw) * Math.cos(pit), Math.sin(pit), Math.cos(yaw) * Math.cos(pit)];
      const Rt = [Math.cos(yaw), 0, -Math.sin(yaw)];
      const Up = [F[1] * Rt[2] - F[2] * Rt[1], F[2] * Rt[0] - F[0] * Rt[2], F[0] * Rt[1] - F[1] * Rt[0]];
      const cam = [0, CAM_H, camZ(t)];
      const es = sunElevDeg(t) * DEG;
      const sun = [Math.cos(es) * Math.sin(SUN_AZ), Math.sin(es), Math.cos(es) * Math.cos(SUN_AZ)];
      const flat = 1 - 0.17 * Math.max(0, Math.min(1, 1 - (sunElevDeg(t) - 0) / 3));   // refraction squashes the low sun
      // sunlight on the sea: transmittance at the disk centre × the part of the disk above the sea horizon
      const dip = Math.sqrt(2 * CAM_H / (RG * 1000));
      const Tsun = transJS(camR, Math.sin(es));
      const vis = diskAbove((es + dip) / (SUN_R * flat));
      const sunE = Tsun.map((x) => x * vis);

      // ---- sea state now and at the five earlier instants (foam memory)
      const st = [seaState(t), ...PAST.map((tau) => seaState(t - tau))];
      const specU = new Float32Array(24), tS = new Float32Array(6), lamU = new Float32Array(6);
      st.forEach((s, j) => { specU.set([s.aW, s.wpW, s.aS, SWELL_WP], j * 4); tS[j] = s.t; lamU[j] = s.lam; });
      const thr0 = foamThreshold(st[0].U, st[0].lam, mss(st[0], 0, K_RES));
      const thrP = new Float32Array(10), decP = new Float32Array(5);
      for (let j = 0; j < 5; j++) {
        const s = st[j + 1];
        // memory uses the 97 m cascade at that instant plus the 600 m cascade now: bands 0–1
        thrP.set(foamThreshold(s.U, s.lam, mss(s, 0, BAND[1][1])), j * 2);
        decP[j] = Math.exp(-PAST[j] / FOAM_LIFE);
      }
      const unres = mss(st[0], K_RES, K_CAP);
      const cloudOff = [0.42 * t + 3.0, 0.12 * t - 6.0];

      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      // ---- 1. sky-view LUT and environment map
      gl.bindFramebuffer(gl.FRAMEBUFFER, skyFb);
      gl.viewport(0, 0, 256, 192);
      gl.useProgram(Psky.p);
      bindTex(0, gl.TEXTURE_2D, transT); bindTex(1, gl.TEXTURE_2D, msT);
      gl.uniform1i(Psky.U.transT, 0); gl.uniform1i(Psky.U.msT, 1);
      gl.uniform1f(Psky.U.camR, camR); gl.uniform1f(Psky.U.sunMu, Math.sin(es));
      drawTri();
      const setSky = (P) => {
        gl.uniform1i(P.U.skyT, 2); gl.uniform1i(P.U.transT, 0);
        gl.uniform3fv(P.U.sunDir, sun); gl.uniform1f(P.U.sunAz, SUN_AZ); gl.uniform1f(P.U.camR, camR);
        if (P.U.t) gl.uniform1f(P.U.t, t);
        gl.uniform2fv(P.U.cloudOff, cloudOff);
      };
      bindTex(2, gl.TEXTURE_2D, skyT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, envFb);
      gl.viewport(0, 0, 1024, 256);
      gl.useProgram(Penv.p);
      setSky(Penv);
      drawTri();
      bindTex(3, gl.TEXTURE_2D, envT);
      gl.generateMipmap(gl.TEXTURE_2D);

      // ---- 2. spectrum → strip A
      gl.bindFramebuffer(gl.FRAMEBUFFER, stripFb[0]);
      gl.viewport(0, 0, SW, N);
      gl.useProgram(Pspec.p);
      bindTex(4, gl.TEXTURE_2D, xiT);
      gl.uniform1i(Pspec.U.xiT, 4);
      gl.uniform3fv(Pspec.U.Lc, CASCADE_L);
      gl.uniform4fv(Pspec.U.spec, specU);
      gl.uniform1fv(Pspec.U.tS, tS);
      gl.uniform1fv(Pspec.U.lam, lamU);
      gl.uniform2fv(Pspec.U.dirW, DIR_W); gl.uniform2fv(Pspec.U.dirS, DIR_S);
      gl.uniform1f(Pspec.U.normS, NORM_S);
      drawTri();
      // ---- 3. inverse FFT: 8 passes along x, 8 along y (ping-pong; 16 passes end back in strip A)
      gl.useProgram(Pfft.p);
      gl.uniform1i(Pfft.U.in0, 4); gl.uniform1i(Pfft.U.in1, 5);
      let src = 0;
      for (let pass = 0; pass < 16; pass++) {
        const dst = 1 - src;
        gl.bindFramebuffer(gl.FRAMEBUFFER, stripFb[dst]);
        bindTex(4, gl.TEXTURE_2D, strip[src * 2]); bindTex(5, gl.TEXTURE_2D, strip[src * 2 + 1]);
        gl.uniform1i(Pfft.U.horiz, pass < 8 ? 1 : 0);
        gl.uniform1i(Pfft.U.msz, 2 << (pass % 8));
        drawTri();
        src = dst;
      }
      // ---- 4. resolve into the texture array (+ mips)
      gl.viewport(0, 0, N, N);
      gl.useProgram(Pres.p);
      bindTex(4, gl.TEXTURE_2D, strip[src * 2]); bindTex(5, gl.TEXTURE_2D, strip[src * 2 + 1]);
      gl.uniform1i(Pres.U.f0, 4); gl.uniform1i(Pres.U.f1, 5);
      for (let c = 0; c < 3; c++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, resFb[c]);
        gl.uniform1i(Pres.U.seg, c);
        gl.uniform1i(Pres.U.past, c === 1 ? 1 : 0);
        drawTri();
      }
      bindTex(6, gl.TEXTURE_2D_ARRAY, fftA);
      gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
      bindTex(4, gl.TEXTURE_2D, null); bindTex(5, gl.TEXTURE_2D, null);

      // ---- 5. scene: sky, then the projected-grid sea
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFb);
      gl.viewport(0, 0, W, H);
      gl.clearDepth(1); gl.clear(gl.DEPTH_BUFFER_BIT);
      const setCam = (P) => {
        gl.uniform2f(P.U.stage, W, H); gl.uniform1f(P.U.focal, FOCAL);
        gl.uniform3fv(P.U.camPos, cam); gl.uniform3fv(P.U.camF, F); gl.uniform3fv(P.U.camRi, Rt); gl.uniform3fv(P.U.camU, Up);
      };
      gl.useProgram(Pbg.p);
      setSky(Pbg); setCam(Pbg);
      gl.uniform1f(Pbg.U.sunRad, SUN_R); gl.uniform1f(Pbg.U.sunFlat, flat); gl.uniform1f(Pbg.U.sunElev, es);
      drawTri();

      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.useProgram(Pwater.p);
      setSky(Pwater); setCam(Pwater);
      gl.uniform1i(Pwater.U.fft, 6); gl.uniform1i(Pwater.U.envT, 3); gl.uniform1i(Pwater.U.foamT, 7);
      bindTex(7, gl.TEXTURE_2D, foamT);
      gl.uniform3fv(Pwater.U.Lc, CASCADE_L);
      gl.uniform3fv(Pwater.U.sunE, sunE);
      gl.uniform1f(Pwater.U.Hs, Math.sqrt(st[0].Hs ** 2 + 16 * integrate((w) => jonswapJS(w, st[0].aW, st[0].wpW, GAMMA_W), 0.1, 12, 300)));
      gl.uniform1f(Pwater.U.unres, unres);
      gl.uniform2fv(Pwater.U.thr0, thr0);
      gl.uniform2fv(Pwater.U.thrP, thrP);
      gl.uniform1fv(Pwater.U.decP, decP);
      // grid rows from below the screen up to just above the horizon line, columns a little past the edges
      const yHor = H / 2 - FOCAL * Math.tan(pit);
      gl.uniform2f(Pwater.U.gx, -0.07 * W, 1.07 * W);
      gl.uniform2f(Pwater.U.gy, -0.07 * H, yHor + 3);
      gl.uniform2f(Pwater.U.cell, 1.14 * W / (GX - 1), (yHor + 3 + 0.07 * H) / (GY - 1));
      gl.bindVertexArray(gridVao);
      gl.drawElements(gl.TRIANGLES, gi.length, gl.UNSIGNED_INT, 0);
      gl.disable(gl.DEPTH_TEST);

      if (msaa) {
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, sceneFb);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, hdrFb);
        gl.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl.COLOR_BUFFER_BIT, gl.NEAREST);
      }
      bindTex(0, gl.TEXTURE_2D, hdrT);
      gl.generateMipmap(gl.TEXTURE_2D);

      // ---- 6. bloom, tone map, grain
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(Pfin.p);
      gl.uniform1i(Pfin.U.hdr, 0);
      gl.uniform2f(Pfin.U.stage, W, H);
      gl.uniform1f(Pfin.U.expo, exposure(t));
      gl.uniform1f(Pfin.U.fade, fade(t));
      gl.uniform1f(Pfin.U.frameNo, Math.round(t * 30));
      drawTri();
    };
  },
  frame(t) { this.draw(t); },
});
