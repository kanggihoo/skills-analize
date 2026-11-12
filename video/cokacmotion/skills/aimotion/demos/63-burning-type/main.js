/*
 * 63 · 타고 남은 글자 — a sheet of paper burns from two points near its foot. The words on it were written in
 * something that does not burn: the scorch browns the sheet around pale letters, the ember line flows around
 * them, the char crumbles into darkness, and in the end only the words are left — "기억은 / 타지 / 않는다" —
 * paper letters floating in the dark with smouldering, glowing edges.
 *
 *   setup()   Nanum Myeongjo 800 → full-res coverage → signed distance (sub-pixel EDT) → the fire-resistant
 *             mask on a 540×960 grid → arrival time T(x) by a 16-neighbour Dijkstra over an anisotropic,
 *             fibrous speed field (field.js) → T as a half-float texture (hi + lo split, so linear filtering
 *             keeps full precision); sparks, embers and smoke get seeded parameters, born where and when the
 *             front passes them (CPU lookup of T).
 *   frame(t)  every shade is a function of τ = t − T(x) (or of δ = τ·speed, px behind the front):
 *             1 · emission only (½ res) + embers → blurred twice → the fire's light on paper, smoke and air
 *             2 · the sheet at full res: paper, heat scorch ahead, a flickering blackbody ember line with
 *                 noise-broken edges, curling char with lingering ember specks, holes onto darkness; the letters
 *                 use the full-res distance field, so their edges stay crisp while the char creeps in slowly;
 *                 heat haze bends everything just above the active front
 *             3 · smoke (alpha) and embers / sparks (additive, motion-streaked) · 4 · bloom + filmic tone map
 */
import { defineDemo, rand, track, ease, clamp, ramp, lerp } from '../_lib/stage.js';
import { FONTS, fontReady, textAlpha, signedDistance } from '../_lib/type.js';
import { arrivalField, NEVER } from './field.js';

const D = 10;
const GW = 540, GH = 960, CELL = 2;                  // arrival-time grid (stage px per cell)
const DIL = 5;                                        // px: the treated paper reaches this far past the ink
const CREEP = [6.0, 2.6];                             // the char eats into the treated paper: depth (px) it slows to, time constant (s)
const LINES = [['기억은', 560], ['타지', 905], ['않는다', 1250]];
const FONT = `800 300px "${FONTS.nanumMyeongjo.family}"`;
const SOURCES = [{ x: 304, y: 1592, t0: 0.65, r: 9 }, { x: 806, y: 1648, t0: 1.55, r: 9 }];   // above the caption band
const PIVOT = [540, 905];
const zoomOf = track([[0, 1.0], [6.0, 1.02, ease.inOutCubic], [D, 1.075, ease.inOutCubic]]);
const lampOf = track([[0, 0.95], [4.5, 0.9], [8.0, 0.42, ease.inOutCubic], [D, 0.38]]);
const fadeOf = (t) => ramp(t, 0, 0.7) * (1 - ramp(t, D - 0.45, D));

// ---------- float → half (round to nearest even), for HALF_FLOAT uploads ----------
const f32 = new Float32Array(1), u32 = new Uint32Array(f32.buffer);
function toHalf(v) {
  f32[0] = v;
  const x = u32[0], sign = (x >>> 16) & 0x8000, e = ((x >>> 23) & 0xff) - 112, m = x & 0x7fffff;
  if (e <= 0) {
    if (e < -10) return sign;
    const mm = m | 0x800000, sh = 14 - e;
    let h = mm >>> sh;
    const rem = mm & ((1 << sh) - 1), half = 1 << (sh - 1);
    if (rem > half || (rem === half && (h & 1))) h++;
    return sign | h;
  }
  if (e >= 31) return sign | 0x7c00;
  let h = sign | (e << 10) | (m >>> 13);
  const rem = m & 0x1fff;
  if (rem > 0x1000 || (rem === 0x1000 && (h & 1))) h++;
  return h;
}
function fromHalf(h) {
  const s = h & 0x8000 ? -1 : 1, e = (h >>> 10) & 0x1f, m = h & 0x3ff;
  if (e === 0) return s * m * 2 ** -24;
  if (e === 31) return m ? NaN : s * Infinity;
  return s * (1 + m / 1024) * 2 ** (e - 15);
}

// ---------- GLSL ----------
const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
`;
const QUAD_VS = `#version 300 es
layout(location = 0) in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

// everything the sheet needs: arrival time, distance to the letters, noise, blackbody colour
const COMMON = `
uniform sampler2D tT, tS;
uniform float time, zoom;
uniform vec2 pivot;
const vec2 RES = vec2(1080.0, 1920.0);
const float DIL = ${DIL.toFixed(1)}, CREEP_D = ${CREEP[0].toFixed(2)}, CREEP_T = ${CREEP[1].toFixed(2)}, RING = 6.0;
vec2 uvS(vec2 s) { return vec2(s.x, RES.y - s.y) / RES; }
vec2 toWorld(vec2 screen) { return (screen - pivot) / zoom + pivot; }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 hash32(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yxz + 33.33); return fract((p3.xxy + p3.yzz) * p3.zyx); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float fbm3(vec2 p) { return 0.5333 * vnoise(p) + 0.2667 * vnoise(p * 2.03 + 17.1) + 0.1333 * vnoise(p * 4.07 + 41.7) + 0.0667 * vnoise(p * 8.13 + 7.3); }
float sdfAt(vec2 s) { return texture(tS, uvS(s)).r; }
vec2 TFat(vec2 s) { vec4 v = texture(tT, uvS(s)); return vec2(v.r + v.g, v.b * 1000.0); }
// blackbody colour (linear, max channel 1) for 800–2000 K (Tanner Helland's fit, then sRGB → linear)
vec3 blackbody(float K) {
  float t = K / 100.0;
  float g = clamp(0.3900816 * log(t) - 0.6318414, 0.0, 1.0);
  float b = t <= 19.0 ? 0.0 : clamp(0.5432068 * log(t - 10.0) - 1.1962541, 0.0, 1.0);
  return pow(vec3(1.0, g, b), vec3(2.2));
}
float radiance(float K) { float k = K / 1300.0; float k2 = k * k; return k2 * k2; }   // ∝ T⁴
// the outside front's arrival time and speed, the 'treated paper' amount and the depth into it, at world point s
// (the T grid is only read outside the letters, where it is pure paper: points on or in a letter look it up just
//  past the letter's dilated edge, along the full-res distance field — so the letters keep crisp outlines)
vec4 arrival(vec2 s) {
  float d = sdfAt(s);
  if (d >= DIL + RING) return vec4(TFat(s), 0.0, 0.0);
  vec2 g = vec2(sdfAt(s + vec2(1.0, 0.0)) - sdfAt(s - vec2(1.0, 0.0)), sdfAt(s + vec2(0.0, 1.0)) - sdfAt(s - vec2(0.0, 1.0)));
  vec2 n = g / max(length(g), 1e-4);
  vec2 tf = TFat(s + n * (DIL + RING - d));
  return vec4(tf, 1.0 - smoothstep(DIL - 0.6, DIL + 0.6, d), max(DIL - d, 0.0));
}
// how hard the fire is burning right now at s (for heat haze and flame light): freshly lit paper only
float burning(vec2 s) {
  float tau = time - TFat(s).x;
  return smoothstep(-0.05, 0.08, tau) * exp(-max(tau, 0.0) / 0.7);
}
vec2 haze(vec2 s) {
  float h = 0.5 * burning(s + vec2(0.0, 26.0)) + 0.35 * burning(s + vec2(0.0, 62.0)) + 0.22 * burning(s + vec2(0.0, 112.0));
  vec2 w = vec2(sin(0.051 * s.y - 9.0 * time + 3.0 * sin(0.031 * s.x)), cos(0.043 * s.x + 7.0 * time + 0.06 * s.y));
  return w * h * 3.2;
}
struct Burn { float delta; float dOut; float tau; float inL; float depth; float gate; float hole; float holeEdge; float speed; };
// δ: px behind the burning edge (noise-broken). On paper that is the front itself (τ·speed); in the treated letter
// paper it is the char creeping in from the edge (a few px, slowing down), starting only when the outside front gets there.
// Then the hole where the paper char has crumbled, and its still-burning rim.
Burn burnAt(vec2 s) {
  vec4 a = arrival(s);
  Burn b;
  b.tau = time - a.x; b.speed = a.y; b.inL = a.z; b.depth = a.w;
  b.dOut = b.tau * a.y;
  b.gate = smoothstep(-0.05, 0.15, b.tau);
  float dIn = CREEP_D * (1.0 - exp(-max(b.tau, 0.0) / CREEP_T)) - a.w;   // smoulder slows as it goes in
  float n = fbm3(s * 0.045 + vec2(0.0, time * 1.3));
  b.delta = mix(b.dOut + (n - 0.5) * 11.0, dIn + (n - 0.5) * 1.4, a.z);
  float tauHole = 0.26 + 0.42 * fbm3(s * 0.018 + 3.1) + 0.14 * vnoise(s * 0.09);
  float w = a.y * tauHole;
  b.hole = (1.0 - a.z) * smoothstep(w - 1.2, w + 1.2, b.delta);
  float hd = (b.delta - w) / 2.6;
  b.holeEdge = (1.0 - a.z) * exp(-hd * hd) * step(b.tau, tauHole + 0.45);
  return b;
}
// the light the burning sheet gives off at s (HDR, linear)
vec3 emission(vec2 s, Burn b, float lateDim) {
  float dl = b.delta;
  // the ember line: a thin, bright band right behind the front, flickering, with gaps
  float core = smoothstep(-2.6, 0.4, dl) * exp(-max(dl, 0.0) / mix(5.0, 1.4, b.inL));
  float flick = 0.78 + 0.44 * vnoise(s * 0.11 + vec2(time * 6.0, -time * 9.0));
  float broken = smoothstep(0.22, 0.55, fbm3(s * 0.05 + vec2(time * 0.7, time * 1.9)));
  float K = mix(930.0 + 560.0 * exp(-max(dl, 0.0) / 4.0) * flick, 880.0 + 260.0 * flick, b.inL);
  float gain = mix(3.4, 1.1 * lateDim * b.gate, b.inL);
  vec3 e = blackbody(K) * radiance(K) * core * mix(0.45, 1.0, broken) * gain;
  // embers lingering in the char: specks on a hash grid (3×3 neighbour cells), each with its own lifetime
  if (b.inL < 0.5 && dl > 3.0 && b.hole < 0.99) {
    vec3 bbS = blackbody(1080.0) * radiance(1080.0) * 2.4;
    vec2 cell = floor(s / 7.0);
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
      vec2 c = cell + vec2(float(i), float(j));
      vec3 h = hash32(c);
      if (h.x > 0.42) continue;
      vec2 ctr = (c + 0.15 + 0.7 * h.yz) * 7.0;
      float life = 0.12 + 0.75 * fract(h.y * 13.7 + h.z * 3.1);
      float age = b.tau - 0.03 * fract(h.z * 7.9);
      if (age < 0.0 || age > life) continue;
      float r = 0.55 + 1.1 * fract(h.x * 29.3);
      float k = exp(-dot(s - ctr, s - ctr) / (r * r));
      float fade = 1.0 - age / life;
      float fl = 0.75 + 0.5 * hash12(c + floor(time * 18.0));
      e += bbS * vec3(1.0, 0.75 + 0.45 * fade, 0.6 + 0.8 * fade) * k * fade * fade * fade * fl;
    }
  }
  // the rim of a fresh hole still burning away
  float Kh = 1000.0;
  e += blackbody(Kh) * radiance(Kh) * b.holeEdge * 0.9 * (1.0 - b.hole * 0.5);
  return e * (1.0 - b.hole * 0.85);
}
`;

// ½-res emission (+ flame licks above the active front): the fire's light for bloom and lighting
const EMIT_FS = HEAD + COMMON + `
uniform float lateDim;
out vec4 o;
void main() {
  vec2 sc = vec2(gl_FragCoord.x, 960.0 - gl_FragCoord.y) * 2.0;
  vec2 s = toWorld(sc);
  s += haze(s);
  Burn b = burnAt(s);
  vec3 e = emission(s, b, lateDim);
  // soft flame licks rising off the burning edge (only felt through the glow)
  float lick = 0.5 * burning(s + vec2(0.0, 14.0)) + 0.3 * burning(s + vec2(0.0, 34.0));
  lick *= smoothstep(0.35, 0.8, fbm3(vec2(s.x * 0.035, s.y * 0.014 + time * 3.2))) * (1.0 - b.hole);
  e += blackbody(1650.0) * lick * 0.55;
  o = vec4(e, 1.0);
}`;

const BLUR_FS = HEAD + `
uniform sampler2D src;
uniform vec2 dstSize, stepUV;
uniform float sigma;
uniform int radius;
out vec4 o;
void main() {
  vec2 uv = gl_FragCoord.xy / dstSize;
  vec4 acc = vec4(0.0); float ws = 0.0;
  for (int k = -radius; k <= radius; k++) {
    float w = exp(-0.5 * float(k * k) / (sigma * sigma));
    acc += texture(src, uv + stepUV * float(k)) * w; ws += w;
  }
  o = acc / ws;
}`;

// the sheet at full resolution (HDR)
const SHEET_FS = HEAD + COMMON + `
uniform sampler2D tG1, tG2;
uniform float lamp, lateDim;
out vec4 o;
vec3 fireLight(vec2 sc) { vec2 uv = vec2(sc.x, RES.y - sc.y) / RES; return texture(tG1, uv).rgb * 0.55 + texture(tG2, uv).rgb * 1.6; }
void main() {
  vec2 sc = vec2(gl_FragCoord.x, RES.y - gl_FragCoord.y);
  vec2 s = toWorld(sc);
  s += haze(s);
  Burn b = burnAt(s);
  vec3 L = fireLight(sc);
  // the dark behind the sheet: warm black, faintly lit where the fire's light hangs in the air
  vec3 dark = vec3(0.0032, 0.0024, 0.0022) + L * 0.035;
  // paper: cream, long fibres along ≈ 75°, soft mottling; the letters were written in a faint, cooler sheen
  vec2 fd = vec2(0.259, -0.966);
  vec2 q = vec2(dot(s, fd), dot(s, vec2(-fd.y, fd.x)));
  float fib = fbm3(vec2(q.x * 0.045, q.y * 0.55));
  float mott = fbm3(s * 0.006);
  vec3 paper = vec3(0.80, 0.70, 0.53) * (0.90 + 0.10 * fib) * (0.93 + 0.12 * mott);
  paper *= 1.0 - 0.06 * smoothstep(0.62, 0.9, vnoise(vec2(q.x * 0.02, q.y * 1.4)));    // the odd darker fibre
  float ink = 1.0 - smoothstep(-1.0, 1.0, sdfAt(s));
  paper = mix(paper, paper * vec3(0.985, 1.0, 1.03), ink * 0.6);
  // heat runs ahead of the front: the sheet toasts, then browns hard right before it catches
  // (on the letters only once the fire has reached them, and only their outer few px, following the creeping char)
  float scP = b.dOut < 0.0 ? exp(b.dOut / 46.0) : 1.0;
  float scL = b.gate * exp(min(b.delta, 0.0) / 5.0);
  float sc1 = mix(scP, scL, b.inL);
  paper = mix(paper, vec3(0.47, 0.27, 0.11), smoothstep(0.0, 1.0, sc1) * 0.85);
  paper = mix(paper, vec3(0.10, 0.045, 0.018), sc1 * sc1 * sc1);
  // char: near-black, grey ash streaks, the edge before the hole curls up and catches the fire's light
  float ash = fbm3(s * 0.07 + 5.0);
  vec3 charC = mix(vec3(0.016, 0.011, 0.009), vec3(0.055, 0.050, 0.048), smoothstep(0.55, 0.85, ash) * (1.0 - b.inL));
  float tauHole = 0.26 + 0.42 * fbm3(s * 0.018 + 3.1);
  float curl = (1.0 - b.inL) * smoothstep(b.speed * tauHole - 26.0, b.speed * tauHole - 3.0, b.delta);
  vec3 lit = lamp * vec3(1.0, 0.93, 0.82) + L * 1.4;
  vec3 col = mix(paper * lit, charC * (lit * 0.6 + curl * L * 3.0 + curl * 0.04), smoothstep(-0.5, 2.5, b.delta));
  col = mix(col, dark, b.hole);
  col += emission(s, b, lateDim);
  o = vec4(col, 1.0);
}`;

// embers and sparks: motion-streaked capsules, additive
const EMBER_VS = HEAD + `
layout(location = 0) in vec4 a0;   // x0, y0, birth, life
layout(location = 1) in vec4 a1;   // vx, vy, buoyancy, drag
layout(location = 2) in vec4 a2;   // size, temp0, seed, kind
uniform float time, zoom, pxScale, shutter;
uniform vec2 pivot, res;
out vec2 vL; out float vLen, vW; out vec3 vCol;
vec2 posAt(float tau) {
  float k = a1.w, e = exp(-k * tau), q = (1.0 - e) / k;
  vec2 p = vec2(a0.x + a1.x * q, a0.y + a1.y * q - a1.z * (tau - q) / k);
  float sw = min(tau * 1.4, 1.0);
  p.x += sw * (16.0 * sin(1.1 * tau + a2.z * 6.28 + 0.004 * a0.y) + 7.0 * sin(2.7 * tau + a2.z * 17.0));
  return p;
}
vec3 blackbody(float K) {
  float t = K / 100.0;
  float g = clamp(0.3900816 * log(t) - 0.6318414, 0.0, 1.0);
  float b = t <= 19.0 ? 0.0 : clamp(0.5432068 * log(t - 10.0) - 1.1962541, 0.0, 1.0);
  return pow(vec3(1.0, g, b), vec3(2.2));
}
void main() {
  float tau = time - a0.z;
  if (tau <= 0.0 || tau >= a0.w) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vL = vec2(0.0); vLen = 0.0; vW = 1.0; vCol = vec3(0.0); return; }
  float sh = a2.w > 0.5 && a2.w < 1.5 ? shutter * 1.8 : shutter;
  vec2 p1 = posAt(tau), p0 = posAt(max(tau - sh, 0.0));
  p1 = (p1 - pivot) * zoom + pivot; p0 = (p0 - pivot) * zoom + pivot;
  vec2 dv = p1 - p0; float len = length(dv);
  vec2 u = len > 1e-3 ? dv / len : vec2(0.0, -1.0), v = vec2(-u.y, u.x);
  float life = tau / a0.w;
  float w = a2.x * (1.0 - 0.45 * life) * zoom;
  // cooling: temperature falls over the life, with a flicker; it fades in fast and out softly
  float K = a2.y * (1.0 - 0.38 * life) * (0.9 + 0.2 * fract(sin(dot(vec2(floor(time * 24.0), a2.z * 97.0), vec2(12.9898, 78.233))) * 43758.5453));
  float kk = K / 1300.0; kk *= kk;
  float env = smoothstep(0.0, 0.05, tau) * (1.0 - smoothstep(0.55, 1.0, life));
  vCol = blackbody(K) * kk * kk * env * (a2.w > 0.5 && a2.w < 1.5 ? 3.2 : 1.6) / max(1.0, len / (w * 2.0) * 0.5);
  int id = gl_VertexID;
  vec2 c = id == 0 ? vec2(-1, -1) : id == 1 ? vec2(1, -1) : id == 2 ? vec2(1, 1) : id == 3 ? vec2(-1, -1) : id == 4 ? vec2(1, 1) : vec2(-1, 1);
  float ww = w * 2.2 + 1.0;
  vec2 pos = mix(p0 - u * ww, p1 + u * ww, c.x * 0.5 + 0.5) + v * ww * c.y;
  vL = vec2(mix(-ww, len + ww, c.x * 0.5 + 0.5), ww * c.y);
  vLen = len; vW = max(w, 0.35);
  vec2 sp = pos * pxScale;
  gl_Position = vec4(sp.x / (res.x * 0.5) - 1.0, 1.0 - sp.y / (res.y * 0.5), 0.0, 1.0);
}`;
const EMBER_FS = HEAD + `
in vec2 vL; in float vLen, vW; in vec3 vCol;
out vec4 o;
void main() {
  float x = clamp(vL.x, 0.0, vLen);
  float d = length(vec2(vL.x - x, vL.y));
  float a = exp(-d * d / (vW * vW) * 1.6);
  o = vec4(vCol * a, 0.0);
}`;

// smoke: soft, wispy sprites, lit by the fire below and the lamp, premultiplied alpha
const SMOKE_VS = HEAD + `
layout(location = 0) in vec4 a0;   // x0, y0, birth, life
layout(location = 1) in vec4 a1;   // rise, drift, r0, r1
layout(location = 2) in vec4 a2;   // alpha, seed, stretch, tone
uniform float time, zoom, lamp;
uniform vec2 pivot;
uniform sampler2D tG2;
out vec2 vQ; out float vA, vSeed, vTau; out vec3 vCol;
void main() {
  float tau = time - a0.z;
  if (tau <= 0.0 || tau >= a0.w) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vQ = vec2(0.0); vA = 0.0; vSeed = 0.0; vTau = 0.0; vCol = vec3(0.0); return; }
  float life = tau / a0.w;
  vec2 p = vec2(a0.x + a1.y * tau + 14.0 * sin(0.7 * tau + a2.y * 9.0), a0.y - a1.x * tau * (1.0 - 0.3 * life));
  p = (p - pivot) * zoom + pivot;
  float r = mix(a1.z, a1.w, sqrt(life)) * zoom;
  int id = gl_VertexID;
  vec2 c = id == 0 ? vec2(-1, -1) : id == 1 ? vec2(1, -1) : id == 2 ? vec2(1, 1) : id == 3 ? vec2(-1, -1) : id == 4 ? vec2(1, 1) : vec2(-1, 1);
  vec2 pos = p + c * vec2(r, r * a2.z);
  vQ = c; vSeed = a2.y; vTau = tau;
  vA = a2.x * smoothstep(0.0, 0.25, life) * (1.0 - smoothstep(0.45, 1.0, life));
  vec3 L = texture(tG2, vec2(p.x / 1080.0, 1.0 - p.y / 1920.0)).rgb;
  vCol = vec3(0.105, 0.095, 0.09) * a2.w * (0.25 + lamp * 0.45) + L * 0.9;
  gl_Position = vec4(pos.x / 540.0 - 1.0, 1.0 - pos.y / 960.0, 0.0, 1.0);
}`;
const SMOKE_FS = HEAD + `
in vec2 vQ; in float vA, vSeed, vTau; in vec3 vCol;
out vec4 o;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
void main() {
  float r2 = dot(vQ, vQ);
  if (r2 > 1.0) discard;
  vec2 p = vQ * vec2(1.6, 0.9) * 2.2 + vSeed * 31.0 + vec2(0.0, vTau * 0.55);
  float n = 0.55 * vnoise(p) + 0.3 * vnoise(p * 2.1 + 5.2) + 0.15 * vnoise(p * 4.3 + 1.7);
  float wisp = smoothstep(0.42, 0.78, n) * (1.0 - smoothstep(0.25, 1.0, r2));
  float a = clamp(wisp * vA, 0.0, 1.0);
  o = vec4(vCol * a, a);
}`;

// bloom + filmic tone map + grain, to the canvas
const TONE_FS = HEAD + `
uniform sampler2D tH, tG1, tG2;
uniform float fade, time;
out vec4 o;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main() {
  vec2 uv = gl_FragCoord.xy / vec2(1080.0, 1920.0);
  vec3 c = texture(tH, uv).rgb + texture(tG1, uv).rgb * 0.30 + texture(tG2, uv).rgb * 0.22;
  c = aces(max(c, 0.0) * 1.15);
  c = pow(c, vec3(1.0 / 2.2));
  vec2 q = uv - 0.5;
  c *= 1.0 - 0.32 * smoothstep(0.3, 0.95, length(q * vec2(1.0, 0.72)) * 1.35);
  c += (hash12(gl_FragCoord.xy + fract(time * 7.31) * 113.0) - 0.5) / 255.0 * 2.0;
  o = vec4(c * fade, 1.0);
}`;

defineDemo({
  id: '63-burning-type',
  title: '타고 남은 글자',
  tech: '도착 시간장(16방향 다익스트라) · 불꽃 전선 셰이딩(흑체 색) · 불씨 입자',
  duration: D,
  background: '#050302',

  async setup({ canvas }) {
    // ---- the words → full-res coverage → signed distance ----
    const t0 = performance.now();
    await fontReady(FONT, LINES.map((l) => l[0]).join(''));
    const alpha = textAlpha(1080, 1920, (ctx) => {
      ctx.font = FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const [line, y] of LINES) ctx.fillText(line, 540, y);
    });
    const sdf = signedDistance(alpha, 1080, 1920);
    const sdfAt = (x, y) => {
      const i = Math.max(0, Math.min(1079, Math.round(x))), j = Math.max(0, Math.min(1919, Math.round(y)));
      return sdf[j * 1080 + i];
    };
    // ---- arrival time ----
    const solid = (i, j) => sdf[(j * CELL + 1) * 1080 + i * CELL + 1] < DIL;
    const { T, F } = arrivalField(GW, GH, CELL, solid, SOURCES);
    let last = 0;
    for (const v of T) if (v < NEVER && v > last) last = v;
    console.log(`63-burning-type: glyph field + arrival time ${(performance.now() - t0).toFixed(0)} ms, sheet burnt by ${last.toFixed(2)} s`);
    const Tat = (x, y) => T[Math.max(0, Math.min(GH - 1, Math.floor(y / CELL))) * GW + Math.max(0, Math.min(GW - 1, Math.floor(x / CELL)))];
    // the arrival time just outside the letter, for points on or in it (as the shader does)
    const Tedge = (x, y) => {
      const d = sdfAt(x, y);
      if (d >= DIL + 6) return Tat(x, y);
      const gx = sdfAt(x + 1, y) - sdfAt(x - 1, y), gy = sdfAt(x, y + 1) - sdfAt(x, y - 1), gl = Math.hypot(gx, gy) || 1;
      const k = DIL + 6 - d;
      return Tat(x + gx / gl * k, y + gy / gl * k);
    };

    // ---- GL ----
    const { ctx: gl } = canvas({ type: 'webgl2' });
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float is required (float render targets)');
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(sh));
      return sh;
    };
    const program = (vs, fs) => {
      const p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const P = {
      emit: program(QUAD_VS, EMIT_FS), blur: program(QUAD_VS, BLUR_FS), sheet: program(QUAD_VS, SHEET_FS),
      ember: program(EMBER_VS, EMBER_FS), smoke: program(SMOKE_VS, SMOKE_FS), tone: program(QUAD_VS, TONE_FS),
    };
    const texture = (w, h, internal, format, type, data, linear = true) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linear ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linear ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const target = (w, h) => {
      const t = texture(w, h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, null);
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('framebuffer incomplete');
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { t, f, w, h };
    };

    // T as half floats: hi = T rounded to half, lo = the remainder (filters linearly, sums back to full precision)
    // rows flipped so texture v = 0 is the bottom of the stage
    const tdata = new Uint16Array(GW * GH * 4);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
      const k = j * GW + i, o = ((GH - 1 - j) * GW + i) * 4;
      const hi = toHalf(T[k]), lo = T[k] - fromHalf(hi);
      tdata[o] = hi; tdata[o + 1] = toHalf(lo); tdata[o + 2] = toHalf(F[k] / 1000); tdata[o + 3] = 0;
    }
    const tT = texture(GW, GH, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, tdata);
    const sdata = new Uint16Array(1080 * 1920);
    for (let j = 0; j < 1920; j++) for (let i = 0; i < 1080; i++) sdata[(1919 - j) * 1080 + i] = toHalf(Math.max(-60, Math.min(60, sdf[j * 1080 + i])));
    const tS = texture(1080, 1920, gl.R16F, gl.RED, gl.HALF_FLOAT, sdata);

    const E = target(540, 960), G1a = target(270, 480), G1 = target(270, 480), G2a = target(135, 240), G2 = target(135, 240), Hdr = target(1080, 1920);

    // ---- particles: seeded, born where and when the front passes ----
    const rnd = rand(63);
    const embers = [], smoke = [];
    const onPaper = () => {
      for (let tries = 0; tries < 200; tries++) {
        const x = 8 + rnd() * 1064, y = 8 + rnd() * 1904;
        if (sdfAt(x, y) > DIL + 3 && Tat(x, y) < D - 0.4) return [x, y, Tat(x, y)];
      }
      return null;
    };
    for (let n = 0; n < 760; n++) {          // embers: lifted off the front, drifting and cooling
      const p = onPaper(); if (!p) continue;
      const big = rnd() < 0.12;
      embers.push(p[0], p[1], p[2] + 0.04 + rnd() * 0.3, 0.9 + rnd() * 1.9,
        (rnd() - 0.5) * 80, -(40 + rnd() * 150), 120 + rnd() * 180, 0.9 + rnd() * 1.4,
        big ? 2.4 + rnd() * 1.4 : 1.0 + rnd() * 1.3, 1050 + rnd() * 380, rnd(), 0);
    }
    for (let n = 0; n < 170; n++) {          // sparks: fast, bright, short
      const p = onPaper(); if (!p) continue;
      const a = -Math.PI / 2 + (rnd() - 0.5) * 1.4, v = 260 + rnd() * 420;
      embers.push(p[0], p[1], p[2] + rnd() * 0.12, 0.25 + rnd() * 0.55,
        Math.cos(a) * v, Math.sin(a) * v, 60 + rnd() * 120, 1.2 + rnd(),
        0.7 + rnd() * 0.6, 1400 + rnd() * 450, rnd(), 1);
    }
    // the afterglow: a few embers keep leaving the smouldering edges of the letters
    const edgePts = [];
    for (let tries = 0; edgePts.length < 400 && tries < 400000; tries++) {
      const x = rnd() * 1080, y = 300 + rnd() * 1300, d = sdfAt(x, y);
      if (Math.abs(d - (DIL - 1)) < 1.2) edgePts.push([x, y]);
    }
    for (let n = 0; n < 46 && edgePts.length; n++) {
      const [x, y] = edgePts[Math.floor(rnd() * edgePts.length)], te = Tedge(x, y);
      if (te > D - 1.5) continue;
      embers.push(x, y, Math.max(te + 0.8, 5.2) + rnd() * (D - 1.0 - Math.max(te + 0.8, 5.2)), 2.2 + rnd() * 1.8,
        (rnd() - 0.5) * 30, -(20 + rnd() * 40), 40 + rnd() * 50, 0.8 + rnd() * 0.6,
        0.9 + rnd() * 0.9, 950 + rnd() * 250, rnd(), 2);
    }
    for (let n = 0; n < 230; n++) {          // smoke off the burning front
      const p = onPaper(); if (!p) continue;
      smoke.push(p[0], p[1] - 10, p[2] + 0.08 + rnd() * 0.35, 2.2 + rnd() * 2.6,
        55 + rnd() * 70, (rnd() - 0.5) * 30, 14 + rnd() * 20, 70 + rnd() * 110,
        0.05 + rnd() * 0.09, rnd(), 1.4 + rnd() * 1.4, 0.7 + rnd() * 0.6);
    }
    for (let n = 0; n < 40 && edgePts.length; n++) {   // thin wisps from the letters at the end
      const [x, y] = edgePts[Math.floor(rnd() * edgePts.length)], te = Tedge(x, y);
      if (te > D - 1.5) continue;
      smoke.push(x, y, te + 0.4 + rnd() * (D - te - 0.4), 2.5 + rnd() * 2.0,
        25 + rnd() * 30, (rnd() - 0.5) * 12, 6 + rnd() * 6, 26 + rnd() * 30,
        0.04 + rnd() * 0.05, rnd(), 2.2 + rnd() * 1.2, 0.8);
    }
    const instVAO = (data) => {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      for (let a = 0; a < 3; a++) {
        gl.enableVertexAttribArray(a);
        gl.vertexAttribPointer(a, 4, gl.FLOAT, false, 48, a * 16);
        gl.vertexAttribDivisor(a, 1);
      }
      gl.bindVertexArray(null);
      return { vao, count: data.length / 12 };
    };
    const emberV = instVAO(embers), smokeV = instVAO(smoke);
    const quad = gl.createVertexArray();
    gl.bindVertexArray(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const bind = (prog, name, tex, unit) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(prog.u[name], unit); };
    const common = (prog, t) => {
      bind(prog, 'tT', tT, 0); bind(prog, 'tS', tS, 1);
      gl.uniform1f(prog.u.time, t); gl.uniform1f(prog.u.zoom, zoomOf(t)); gl.uniform2f(prog.u.pivot, PIVOT[0], PIVOT[1]);
    };
    const full = (dst) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.f : null);
      gl.viewport(0, 0, dst ? dst.w : 1080, dst ? dst.h : 1920);
      gl.bindVertexArray(quad); gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const blur = (src, dst, step, sigma) => {
      gl.useProgram(P.blur.p);
      bind(P.blur, 'src', src.t, 0);
      gl.uniform2f(P.blur.u.dstSize, dst.w, dst.h);
      gl.uniform2f(P.blur.u.stepUV, step[0] / dst.w, step[1] / dst.h);
      gl.uniform1f(P.blur.u.sigma, sigma);
      gl.uniform1i(P.blur.u.radius, Math.ceil(sigma * 2.6));
      full(dst);
    };
    const drawEmbers = (dst, t, pxScale) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.f);
      gl.viewport(0, 0, dst.w, dst.h);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(P.ember.p);
      const u = P.ember.u;
      gl.uniform1f(u.time, t); gl.uniform1f(u.zoom, zoomOf(t)); gl.uniform1f(u.pxScale, pxScale); gl.uniform1f(u.shutter, 1 / 45);
      gl.uniform2f(u.pivot, PIVOT[0], PIVOT[1]); gl.uniform2f(u.res, dst.w, dst.h);
      gl.bindVertexArray(emberV.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, emberV.count);
      gl.disable(gl.BLEND);
    };

    this.render = (t) => {
      const lateDim = Math.exp(-Math.max(0, t - 6.5) / 5.0);
      gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
      // 1 · emission (½ res) + embers → the fire's light, blurred twice
      gl.useProgram(P.emit.p);
      common(P.emit, t);
      gl.uniform1f(P.emit.u.lateDim, lateDim);
      full(E);
      drawEmbers(E, t, 0.5);
      blur(E, G1a, [1, 0], 6); blur(G1a, G1, [0, 1], 6);
      blur(G1, G2a, [1, 0], 7); blur(G2a, G2, [0, 1], 7);
      // 2 · the sheet (HDR)
      gl.useProgram(P.sheet.p);
      common(P.sheet, t);
      bind(P.sheet, 'tG1', G1.t, 2); bind(P.sheet, 'tG2', G2.t, 3);
      gl.uniform1f(P.sheet.u.lamp, lampOf(t)); gl.uniform1f(P.sheet.u.lateDim, lateDim);
      full(Hdr);
      // 3 · smoke (premultiplied over), then embers and sparks (additive)
      gl.bindFramebuffer(gl.FRAMEBUFFER, Hdr.f); gl.viewport(0, 0, 1080, 1920);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(P.smoke.p);
      gl.uniform1f(P.smoke.u.time, t); gl.uniform1f(P.smoke.u.zoom, zoomOf(t)); gl.uniform1f(P.smoke.u.lamp, lampOf(t));
      gl.uniform2f(P.smoke.u.pivot, PIVOT[0], PIVOT[1]);
      bind(P.smoke, 'tG2', G2.t, 0);
      gl.bindVertexArray(smokeV.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, smokeV.count);
      gl.disable(gl.BLEND);
      drawEmbers(Hdr, t, 1.0);
      // 4 · bloom + tone map
      gl.useProgram(P.tone.p);
      bind(P.tone, 'tH', Hdr.t, 0); bind(P.tone, 'tG1', G1.t, 1); bind(P.tone, 'tG2', G2.t, 2);
      gl.uniform1f(P.tone.u.fade, fadeOf(t)); gl.uniform1f(P.tone.u.time, t);
      full(null);
      gl.bindVertexArray(null);
    };
  },
  frame(t) {
    this.render(t);
  },
});
