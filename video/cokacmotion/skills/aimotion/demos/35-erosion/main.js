/*
 * 35 · 빗물이 깎은 산 — GPGPU hydraulic erosion on a 512² heightfield (WebGL2, RGBA32F ping-pong textures).
 * State per cell: TER = (rock b, loose sediment layer m, water depth d, suspended sediment s),
 *                 FLX = virtual-pipe outflow to (left, right, down, up), VEL = (u, v, discharge memory, wetness memory).
 * One iteration = three full-grid passes (Mei, Decaudin & Hu 2007; Šťava et al. 2008):
 *   1. FLUX   — pipe model: outflow += dt·g·Δh to each neighbour, scaled so a cell never sends more water than it holds
 *   2. WATER  — new depth from net flux, velocity from the flux through the cell, transport capacity
 *               C = Kc·sinα·|v|·min(d, dmax); erode (sediment layer first, then rock, slower) or deposit toward C
 *   3. MOVE   — semi-Lagrangian advection of the suspended sediment, thermal erosion (material above the talus angle
 *               slides to lower neighbours; rock above its angle crumbles into scree), evaporation, orographic rain
 * Seek = replay(): one video frame = 8–28 iterations (time-lapse), checkpoints are GPU copies of the three textures.
 * Rendering: a 512×512 vertex grid displaced from the state texture (gl_VertexID, no attributes); per-pixel normals,
 * a per-frame shadow + ambient-occlusion pass marched through the heightfield toward the sun, strata-banded rock,
 * fresh alluvium, vegetation, snow, turbid/clear water with sky reflection, height fog, rain and lightning.
 */
import { defineDemo, replay, track, ease, ramp, clamp, lerp } from '../_lib/stage.js';
import { makeTerrain } from './terrain.js';

const HEADLESS = new URLSearchParams(location.search).has('render');
const D = 9, FPS = 30, NF = Math.round(D * FPS);
const N = 512;            // grid cells per side (the unit of length in the simulation)
const S = 10;             // world units per grid side (rendering)

// ---------- simulation constants (cell units; calibrated so valleys cut ~10–20 cells, fans ~2–5 cells) ----------
const SIM = {
  dt: 0.05, g: 9.81, damp: 0.97,                 // pipe flow (damp = per-iteration flux friction)
  Kc: 0.9, Ks: 0.6, Kd: 0.75, rockF: 0.35,       // capacity, dissolving, deposition, rock vs. sediment erodibility
  dCap: 1.0, vMax: 14,                           // capacity stops growing past this depth / speed
  Ke: 0.015,                                     // evaporation
  Kt: 0.05, tanR: 1.3, tanS: 0.75,               // thermal erosion: rate, talus slope of rock (52°) and of loose sediment (37°)
  rain: 0.009,
};
// iterations per video frame (a time-lapse that speeds up during the storm) and the storm itself, by frame number
const ipf = (n) => Math.round(lerp(8, 28, ramp(n, 26, 62)) - 10 * ramp(n, 200, 262));
const rainOf = (n) => ramp(n, 28, 56) * (1 - ramp(n, 168, 196));
const PRESETTLE = 220;    // thermal-only iterations in init(): the raw noise crags settle before the first frame

// ---------- the story (pure functions of t) ----------
const deg = Math.PI / 180;
const camAz = track([[0, -15], [D, 11, (p) => p]]);
const camR = track([[0, 8.4], [D, 7.4, ease.inOutCubic]]);
const camH = track([[0, 3.65], [D, 3.15, ease.inOutCubic]]);
const overcast = track([[0, 0.06], [0.9, 0.06], [2.1, 0.84, ease.inOutCubic], [5.5, 0.86], [7.0, 0.2, ease.inOutCubic], [D, 0.16]]);
const warmth = (t) => ramp(t, 5.8, 8.2);
const rainVis = (t) => ramp(t, 1.05, 1.9) * (1 - ramp(t, 5.55, 6.45));
const sunEl = track([[0, 22], [D, 8, (p) => p]]);
const sunAz = track([[0, 78], [D, 140, (p) => p]]);   // from +z (toward the camera) round to +x (east)
const pulse = (t, c, w) => Math.exp(-((t - c) / w) * ((t - c) / w));
const flashOf = (t) => 1.5 * (pulse(t, 3.3, 0.03) + 0.55 * pulse(t, 3.41, 0.025)) + 1.15 * (pulse(t, 4.88, 0.035) + 0.7 * pulse(t, 5.0, 0.03));
const mistOf = (t) => ramp(t, 5.9, 7.8);
const fadeOf = (t) => ramp(t, 0, 0.6) * (1 - ramp(t, D - 0.45, D));

// ---------- GLSL ----------
const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

const HEAD = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
#define N ${N}
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + vec2(1.7, -3.1); a *= 0.5; } return s / 0.97; }
`;

// 1 · pipe-model outflow flux
const FLUX = HEAD + `
uniform sampler2D TER, FLX;
uniform float dt, grav, damp;
out vec4 o;
float H(ivec2 q, float edge) {
  if (q.x < 0 || q.y < 0 || q.x >= N || q.y >= N) return edge;   // open boundary: water leaves the map
  vec4 t = texelFetch(TER, q, 0);
  return t.x + t.y + t.z;
}
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy);
  vec4 T = texelFetch(TER, q, 0);
  float g = T.x + T.y, h = g + T.z, edge = g - 1.0;
  vec4 nb = vec4(H(q + ivec2(-1, 0), edge), H(q + ivec2(1, 0), edge), H(q + ivec2(0, -1), edge), H(q + ivec2(0, 1), edge));
  vec4 f = max(vec4(0.0), texelFetch(FLX, q, 0) * damp + dt * grav * (h - nb));
  float sum = f.x + f.y + f.z + f.w;
  o = f * min(1.0, T.z / (sum * dt + 1e-6));
}`;

// 2 · water depth, velocity, erosion / deposition (MRT: state + velocity/memories)
const WATER = HEAD + `
uniform sampler2D TER, FLX, VEL;
uniform float dt, Kc, Ks, Kd, rockF, dCap, vMax;
layout(location = 0) out vec4 oT;
layout(location = 1) out vec4 oV;
float gnd(ivec2 q, float self) {
  if (q.x < 0 || q.y < 0 || q.x >= N || q.y >= N) return self;
  vec4 t = texelFetch(TER, q, 0);
  return t.x + t.y;
}
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy);
  vec4 T = texelFetch(TER, q, 0), f = texelFetch(FLX, q, 0), V = texelFetch(VEL, q, 0);
  float inL = q.x > 0 ? texelFetch(FLX, q + ivec2(-1, 0), 0).y : 0.0;       // right-going flux of the left cell
  float inR = q.x < N - 1 ? texelFetch(FLX, q + ivec2(1, 0), 0).x : 0.0;
  float inB = q.y > 0 ? texelFetch(FLX, q + ivec2(0, -1), 0).w : 0.0;
  float inT = q.y < N - 1 ? texelFetch(FLX, q + ivec2(0, 1), 0).z : 0.0;
  float d2 = max(0.0, T.z + dt * (inL + inR + inB + inT - (f.x + f.y + f.z + f.w)));
  vec2 w = 0.5 * vec2(inL - f.x + f.y - inR, inB - f.z + f.w - inT);   // water passing through the cell
  vec2 vel = w / max(0.5 * (T.z + d2), 0.05);
  float sp = length(vel);
  if (sp > vMax) { vel *= vMax / sp; sp = vMax; }
  float g = T.x + T.y;
  float gl = gnd(q + ivec2(-1, 0), g), gr = gnd(q + ivec2(1, 0), g), gb = gnd(q + ivec2(0, -1), g), gt = gnd(q + ivec2(0, 1), g);
  float sl = length(0.5 * vec2(gr - gl, gt - gb));
  float sinA = sl / sqrt(1.0 + sl * sl);
  float C = Kc * max(sinA, 0.03) * sp * min(d2, dCap);                   // sediment transport capacity
  float b = T.x, m = T.y, s = T.w;
  if (C > s) {
    float amt = Ks * dt * (C - s);
    float es = min(amt, m), er = (amt - es) * rockF;                   // loose sediment goes first, rock is harder
    float lim = max(0.0, g - min(min(gl, gr), min(gb, gt))) * 0.5;       // never dig below the lowest neighbour (no pits)
    float tot = es + er;
    if (tot > lim) { float k = lim / max(tot, 1e-9); es *= k; er *= k; }
    m -= es; b -= er; s += es + er;
  } else {
    float dep = Kd * dt * (s - C);
    s -= dep; m += dep;
  }
  oT = vec4(b, m, d2, s);
  oV = vec4(vel, mix(V.z, sp * min(d2, 2.0), 0.03), max(V.w * 0.9992, smoothstep(0.004, 0.06, d2)));
}`;

// 3 · sediment advection, thermal erosion, evaporation, rain
const MOVE = HEAD + `
uniform sampler2D TER, VEL;
uniform float dt, Ke, Kt, tanR, tanS, rain, tStorm, hmax;
out vec4 o;
float sAt(ivec2 q) { return texelFetch(TER, clamp(q, ivec2(0), ivec2(N - 1)), 0).w; }
float talus(float m) { return mix(tanR, tanS, smoothstep(0.05, 0.5, m)); }
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy);
  vec4 T = texelFetch(TER, q, 0);
  vec2 vel = texelFetch(VEL, q, 0).xy;
  // semi-Lagrangian: the sediment here came from upstream
  vec2 p = clamp(vec2(q) - vel * dt, vec2(0.0), vec2(float(N - 1)));
  ivec2 i0 = ivec2(floor(p));
  vec2 fr = p - vec2(i0);
  float s = mix(mix(sAt(i0), sAt(i0 + ivec2(1, 0)), fr.x), mix(sAt(i0 + ivec2(0, 1)), sAt(i0 + ivec2(1, 1)), fr.x), fr.y);
  // thermal erosion: pairwise exchange, symmetric in the two cells, so it conserves material exactly
  float g = T.x + T.y, ti = talus(T.y), net = 0.0;
  for (int dy = -1; dy <= 1; dy++) {
    for (int dx = -1; dx <= 1; dx++) {
      if (dx == 0 && dy == 0) continue;
      ivec2 r = q + ivec2(dx, dy);
      if (r.x < 0 || r.y < 0 || r.x >= N || r.y >= N) continue;
      vec4 Tn = texelFetch(TER, r, 0);
      float gn = Tn.x + Tn.y, dist = (dx != 0 && dy != 0) ? 1.41421356 : 1.0;
      net += Kt * (max(0.0, gn - g - talus(Tn.y) * dist) - max(0.0, g - gn - ti * dist));
    }
  }
  float b = T.x, m = T.y;
  if (net < 0.0) { float fm = min(m, -net); m -= fm; b -= -net - fm; } else m += net;
  // rain: drifting storm cells, more of it on the heights (orographic lift)
  vec2 uv = (vec2(q) + 0.5) / float(N);
  float storm = 0.5 + vnoise(uv * 3.2 + vec2(-0.5, 0.22) * tStorm);
  float oro = 0.55 + 0.9 * min(1.0, g / hmax * 1.4);
  float d = T.z * (1.0 - Ke * dt) + dt * rain * oro * storm;
  o = vec4(b, m, d, s);
}`;

const COPYG = HEAD + `
uniform sampler2D TER; out vec4 o;
void main() { vec4 t = texelFetch(TER, ivec2(gl_FragCoord.xy), 0); o = vec4(t.x + t.y, 0, 0, 1); }`;

// per frame: soft sun shadow marched through the heightfield + multi-radius ambient occlusion
const PREP = HEAD + `
uniform sampler2D TER; uniform vec3 sunDir;
out vec4 o;
float G(vec2 p) { vec4 t = texture(TER, (p + 0.5) / float(N)); return t.x + t.y; }
void main() {
  vec2 p = gl_FragCoord.xy - 0.5;
  float g0 = G(p);
  vec2 dir = normalize(vec2(sunDir.x, -sunDir.z));
  float tanE = sunDir.y / max(length(sunDir.xz), 1e-3);
  float sh = 1.0, dist = 1.0;
  for (int k = 0; k < 44; k++) {
    vec2 s = p + dir * dist;
    if (s.x < 0.0 || s.y < 0.0 || s.x > float(N - 1) || s.y > float(N - 1)) break;
    float clear = g0 + 0.3 + dist * tanE - G(s);
    sh = min(sh, clear / (dist * 0.07));
    if (sh < 0.0) break;
    dist += 0.7 + dist * 0.075;
  }
  sh = smoothstep(0.0, 1.0, clamp(sh, 0.0, 1.0));
  float occ = 0.0;
  for (int a = 0; a < 8; a++) {
    float an = float(a) * 0.7853982 + 0.39;
    vec2 d = vec2(cos(an), sin(an));
    occ += clamp((G(p + d * 3.0) - g0) / 3.0, 0.0, 1.5) * 0.5
         + clamp((G(p + d * 10.0) - g0) / 10.0, 0.0, 1.5) * 0.3
         + clamp((G(p + d * 30.0) - g0) / 30.0, 0.0, 1.5) * 0.2;
  }
  o = vec4(sh, clamp(1.0 - occ * 0.11, 0.0, 1.0), 0.0, 1.0);
}`;

// shared by the sky and the terrain: sky colour, fog, rain and the final grade
const SHADE = `
uniform vec3 sunDir, sunCol, camPos;
uniform float time, ov, warm, flash, rainV, fade, mist;
vec3 skyCol(vec3 rd) {
  float y = rd.y, yy = clamp(y, 0.0, 1.0);
  vec3 zen = mix(vec3(0.09, 0.20, 0.45), vec3(0.13, 0.15, 0.19), ov);
  vec3 hor = mix(vec3(0.66, 0.66, 0.66), vec3(0.33, 0.35, 0.38), ov);
  hor = mix(hor, vec3(0.98, 0.64, 0.40), warm * (1.0 - ov) * 0.8);
  zen = mix(zen, vec3(0.16, 0.20, 0.36), warm * 0.5);
  vec3 col = mix(hor, zen, sqrt(yy));
  float sd = clamp(dot(rd, sunDir), 0.0, 1.0);
  float sd2 = sd * sd, sd4 = sd2 * sd2, sd8 = sd4 * sd4, sd32 = sd8 * sd8; sd32 *= sd32;
  col += sunCol * (0.035 * sd4 + 0.09 * sd32) * (1.0 - 0.7 * ov);
  col += sunCol * smoothstep(0.99955, 0.9998, sd) * 6.0 * (1.0 - ov);
  if (y > 0.0) {
    vec2 cp = rd.xz / (y + 0.07) * 0.75 + vec2(time * 0.06, -time * 0.025);
    float c = fbm(cp);
    float c2 = fbm(cp + normalize(sunDir.xz + 1e-4) * 0.12);
    float cov = mix(0.40, 0.88, ov);
    float dens = smoothstep(1.0 - cov, 1.0 - cov + 0.3, c) * smoothstep(0.0, 0.1, y);
    float lit = clamp(0.5 + (c - c2) * 4.0, 0.0, 1.0);
    vec3 base = mix(vec3(0.42, 0.44, 0.48), vec3(0.16, 0.17, 0.2), ov);
    vec3 cc = mix(base, base * 0.6 + sunCol * 0.32, lit * (1.0 - 0.7 * ov));
    cc = mix(cc, vec3(0.95, 0.55, 0.42) * 0.9, warm * (1.0 - ov) * lit * 0.6);
    cc += flash * vec3(0.85, 0.9, 1.0) * (0.35 + 0.9 * c);
    col = mix(col, cc, dens * 0.95);
  }
  col += flash * vec3(0.5, 0.55, 0.7) * 0.25;
  return mix(col, hor * 0.86, smoothstep(0.0, -0.06, y));
}
vec3 fogCol(vec3 rd) {
  vec3 hor = mix(vec3(0.60, 0.63, 0.68), vec3(0.32, 0.34, 0.37), ov);
  hor = mix(hor, vec3(0.86, 0.60, 0.42), warm * (1.0 - ov) * 0.75);
  float sd = clamp(dot(rd, sunDir), 0.0, 1.0);
  float sd2 = sd * sd, sd4 = sd2 * sd2;
  return hor + sunCol * 0.06 * sd4 * sd4 * (1.0 - ov) + flash * vec3(0.3, 0.32, 0.4);
}
// exponential height fog integrated along the ray, then a low valley mist after the rain
vec3 fog(vec3 col, vec3 rd, float dist, vec3 wp) {
  float a = mix(0.085, 0.16, ov), b = 0.85;
  float ry = abs(rd.y) < 1e-3 ? 1e-3 : rd.y;
  float f = a * exp(-camPos.y * b) * (1.0 - exp(-dist * ry * b)) / (ry * b);
  col = mix(col, fogCol(rd), 1.0 - exp(-f));
  float mh = 0.32 + 0.12 * vnoise(wp.xz * 0.9 + vec2(time * 0.08, 0.0));
  float md = mist * clamp((mh - wp.y) / 0.3, 0.0, 1.0) * (1.0 - exp(-dist * 0.25)) * (0.6 + 0.4 * vnoise(wp.xz * 2.3 - time * 0.1));
  col = mix(col, fogCol(rd) * 1.05 + sunCol * 0.05, clamp(md, 0.0, 0.85));
  return col;
}
float rainLayer(vec2 fc, float sc, float speed, float seed, float dens) {
  vec2 p = fc / sc;
  p.x += p.y * 0.14;
  float colm = floor(p.x);
  float y = p.y / 7.0 + time * speed + hash12(vec2(colm, seed)) * 40.0;
  float cell = floor(y), f = fract(y);
  float on = step(1.0 - dens, hash12(vec2(colm * 1.7, cell + seed * 13.0)));
  float x = fract(p.x) - 0.5;
  return on * smoothstep(0.16, 0.0, abs(x)) * smoothstep(0.0, 0.3, f) * smoothstep(1.0, 0.6, f);
}
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
vec3 post(vec3 col, vec2 fc) {
  if (rainV > 0.001) {
    float r = rainLayer(fc, 3.0, 3.1, 1.0, 0.22) * 0.35 + rainLayer(fc, 5.0, 2.3, 2.0, 0.16) * 0.6 + rainLayer(fc, 9.0, 1.6, 3.0, 0.1);
    col = mix(col, col * 0.86 + vec3(0.16, 0.17, 0.19) * 0.4, rainV * 0.35);   // the rain curtain softens contrast
    col += vec3(0.55, 0.6, 0.68) * r * rainV * 0.16;
  }
  col = aces(col * 1.05);
  col = pow(col, vec3(1.0 / 2.2));
  vec2 q = fc / vec2(1080.0, 1920.0) - 0.5;
  col *= 1.0 - 0.32 * smoothstep(0.25, 0.85, length(q * vec2(1.0, 0.75)) * 1.25);
  col += (hash12(fc + fract(time * 7.13) * 91.0) - 0.5) / 255.0 * 1.5;
  return col * fade;
}
`;

const SKY_FS = HEAD + SHADE + `
uniform vec3 camF, camR, camU; uniform vec2 tanH;
out vec4 o;
void main() {
  vec2 ndc = gl_FragCoord.xy / vec2(1080.0, 1920.0) * 2.0 - 1.0;
  vec3 rd = normalize(camF + camR * ndc.x * tanH.x + camU * ndc.y * tanH.y);
  vec3 col = skyCol(rd);
  // distant ranges beyond the valley, flattened by haze
  float az = atan(rd.x, -rd.z);
  float aa = fwidth(rd.y) * 1.2;
  float r1 = 0.035 + 0.05 * fbm(vec2(az * 2.4 + 4.0, 1.3)) - 0.012;
  float r2 = 0.012 + 0.04 * fbm(vec2(az * 4.1 - 2.0, 7.7));
  vec3 fc = fogCol(rd);
  vec3 m1 = mix(fc, vec3(0.36, 0.42, 0.52) * (0.6 + 0.4 * (1.0 - ov)), 0.28);
  vec3 m2 = mix(fc, vec3(0.30, 0.34, 0.42) * (0.6 + 0.4 * (1.0 - ov)), 0.45);
  col = mix(col, m1, smoothstep(r1 + aa, r1 - aa, rd.y));
  col = mix(col, m2, smoothstep(r2 + aa, r2 - aa, rd.y));
  o = vec4(post(col, gl_FragCoord.xy), 1.0);
}`;

const TER_VS = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D TER; uniform mat4 VP;
out vec2 vUv; out vec3 vW;
void main() {
  int i = gl_VertexID % ${N}, j = gl_VertexID / ${N};
  vec4 T = texelFetch(TER, ivec2(i, j), 0);
  vUv = (vec2(i, j) + 0.5) / float(${N});
  vW = vec3((vUv.x - 0.5) * ${S}.0, (T.x + T.y + T.z) * ${S}.0 / float(${N}), -(vUv.y - 0.5) * ${S}.0);
  gl_Position = VP * vec4(vW, 1.0);
}`;

const TER_FS = HEAD + SHADE + `
uniform sampler2D TER, VEL, PRE, G0T;
uniform vec3 ambSky, ambGnd;
uniform float hmax;
in vec2 vUv; in vec3 vW;
out vec4 o;
void main() {
  const float px = 1.0 / float(N);
  vec4 T = texture(TER, vUv);
  vec4 Tl = texture(TER, vUv - vec2(px, 0.0)), Tr = texture(TER, vUv + vec2(px, 0.0));
  vec4 Tb = texture(TER, vUv - vec2(0.0, px)), Tt = texture(TER, vUv + vec2(0.0, px));
  float g = T.x + T.y;
  vec2 gg = 0.5 * vec2(Tr.x + Tr.y - Tl.x - Tl.y, Tt.x + Tt.y - Tb.x - Tb.y);
  vec2 gw = gg + 0.5 * vec2(Tr.z - Tl.z, Tt.z - Tb.z);
  vec3 nG = normalize(vec3(-gg.x, 1.0, gg.y));
  vec3 nW = normalize(vec3(-gw.x, 1.0, gw.y));
  float slope = length(gg);
  vec4 Vv = texture(VEL, vUv);
  vec2 pr = texture(PRE, vUv).xy;
  float dh = g - texture(G0T, vUv).x;          // + deposited since the start, − carved away
  float hr = g / hmax;
  vec3 rd = vW - camPos; float dist = length(rd); rd /= dist;

  float n1 = vnoise(vUv * 260.0), n2 = vnoise(vUv * 41.0 + 3.1), n3 = fbm(vUv * 7.0 + 11.0);
  // rock: sedimentary strata, revealed wherever the water cuts down through them
  float band = T.x * 0.17 + n3 * 2.4 + n2 * 0.4;
  float st = 0.5 + 0.5 * sin(band * 1.9) * sin(band * 0.61 + 1.3);
  vec3 rock = mix(vec3(0.25, 0.22, 0.20), vec3(0.52, 0.47, 0.40), st);
  rock = mix(rock, vec3(0.50, 0.32, 0.22), smoothstep(0.62, 0.92, fract(band * 0.29)) * 0.55);
  rock *= 0.82 + 0.36 * n1;
  rock = mix(rock, rock * 1.2 + 0.03, smoothstep(1.5, 8.0, -dh) * 0.7);   // freshly cut walls are cleaner
  // loose material: old regolith, fresh pale alluvium where the floods dropped their load
  vec3 regolith = vec3(0.38, 0.31, 0.22) * (0.85 + 0.3 * n1);
  vec3 alluv = mix(vec3(0.70, 0.60, 0.45), vec3(0.55, 0.50, 0.43), n2) * (0.88 + 0.24 * n1);
  vec3 soil = mix(regolith, alluv, smoothstep(0.15, 1.2, dh));
  float soilK = smoothstep(0.03, 0.4, T.y) * (1.0 - smoothstep(0.85, 1.5, slope));
  vec3 alb = mix(rock, soil, soilK);
  // vegetation on gentle, settled, low ground — stripped where water cut or buried it
  float veg = (1.0 - smoothstep(0.28, 0.72, slope)) * (1.0 - smoothstep(0.36, 0.56, hr + 0.08 * n2)) * smoothstep(0.1, 0.5, T.y);
  veg *= 1.0 - smoothstep(0.3, 1.8, abs(dh));
  veg *= smoothstep(0.3, 0.62, n3 + 0.25 * n2);
  vec3 vegC = mix(vec3(0.085, 0.15, 0.06), vec3(0.22, 0.28, 0.10), n2) * (0.75 + 0.5 * n1);
  alb = mix(alb, vegC, veg);
  // snow on the high, gentle ground
  float snow = smoothstep(0.66, 0.78, hr + 0.07 * n2 - 0.22 * slope) * (1.0 - smoothstep(0.95, 1.45, slope));
  alb = mix(alb, vec3(0.86, 0.89, 0.94), snow);
  float wet = Vv.w * (1.0 - snow);
  alb *= 1.0 - 0.42 * wet;

  float sh = pr.x, ao = pr.y;
  float cs = 1.0 - (0.25 + 0.6 * ov) * smoothstep(0.42, 0.72, fbm(vW.xz * 0.22 + vec2(time * 0.09, time * 0.035)));   // cloud shadows
  float lam = max(dot(nG, sunDir), 0.0);
  vec3 L = sunCol * lam * sh * cs + ambSky * (0.55 + 0.45 * nG.y) * ao + ambGnd * (0.5 - 0.5 * nG.y) * ao;
  L += flash * vec3(0.75, 0.8, 1.0) * (0.35 + 0.65 * nG.y) * ao;
  vec3 col = alb * L;
  vec3 hv = normalize(sunDir - rd);
  float nh = max(dot(nG, hv), 0.0), nh2 = nh * nh, nh4 = nh2 * nh2, nh16 = nh4 * nh4; nh16 *= nh16;
  col += sunCol * sh * cs * (wet * 0.5 + snow * 0.08) * nh16 * nh16;

  // water: turbid brown where it carries sediment, dark and mirror-like where it is clear and still
  float d = T.z;
  float wa = smoothstep(0.05, 0.42, d);
  if (wa > 0.001) {
    float conc = clamp(T.w / max(d, 0.03), 0.0, 1.0);
    float turb = smoothstep(0.0, 0.16, conc);
    vec2 vel = Vv.xy;
    float sp = length(vel);
    // flow-advected ripples: two phases of a noise dragged along the velocity, cross-faded
    float ph = fract(time * 0.6), ph2 = fract(time * 0.6 + 0.5);
    vec2 adv = vec2(vel.x, -vel.y) * 0.004;
    vec2 wq = vW.xz * 34.0;
    float wgt = abs(2.0 * ph - 1.0);
    float rip = mix(vnoise(wq - adv * ph * 60.0), vnoise(wq - adv * ph2 * 60.0 + 17.0), wgt);
    float rip2 = mix(vnoise(wq * 1.3 - adv * ph * 78.0 + 5.3), vnoise(wq * 1.3 - adv * ph2 * 78.0 + 29.0), wgt);
    vec3 n = normalize(nW + vec3(rip - 0.5, 0.0, rip2 - 0.5) * (0.08 + 0.02 * min(sp, 8.0)));
    vec3 body = mix(vec3(0.012, 0.04, 0.05), vec3(0.33, 0.24, 0.14), turb);
    vec3 bodyL = body * (sunCol * max(dot(n, sunDir), 0.0) * sh * cs * 0.7 + ambSky * 1.1 + flash * 0.5);
    vec3 R = reflect(rd, n); R.y = abs(R.y);
    float cv = clamp(dot(-rd, n), 0.0, 1.0), cv1 = 1.0 - cv, cv2 = cv1 * cv1;
    float fr = 0.02 + 0.98 * cv2 * cv2 * cv1;
    float rs = max(dot(R, sunDir), 0.0), rs2 = rs * rs, rs4 = rs2 * rs2, rs16 = rs4 * rs4; rs16 *= rs16;
    float rs256 = rs16 * rs16; rs256 *= rs256;
    vec3 water = mix(bodyL, skyCol(R), fr * (1.0 - 0.55 * turb)) + sunCol * sh * cs * (rs256 * 5.0 + rs16 * 0.12) * (1.0 - ov * 0.6);
    float foam = smoothstep(4.5, 11.0, sp) * smoothstep(0.45, 0.75, rip) * smoothstep(0.08, 0.4, d);
    water = mix(water, (sunCol * max(lam, 0.3) * sh + ambSky * 1.4) * 0.75, foam * 0.55);
    col = mix(col, water, wa);
  }
  col = fog(col, rd, dist, vW);
  o = vec4(post(col, gl_FragCoord.xy), 1.0);
}`;

// ---------- small matrix kit (column-major) ----------
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function perspective(fovy, asp, n, f) {
  const k = 1 / Math.tan(fovy / 2), nf = 1 / (n - f);
  return [k / asp, 0, 0, 0, 0, k, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0];
}
function viewOf(eye, fw, rt, up) {
  return [rt[0], up[0], -fw[0], 0, rt[1], up[1], -fw[1], 0, rt[2], up[2], -fw[2], 0, -dot(rt, eye), -dot(up, eye), dot(fw, eye), 1];
}
function mul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
    o[c * 4 + r] = s;
  }
  return o;
}

defineDemo({
  id: '35-erosion',
  title: '빗물이 깎은 산',
  tech: 'GPGPU 수력 침식 · 파이프 모델 + 퇴적',
  duration: D,
  background: '#0b0d10',
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2' });
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float missing');
    if (!gl.getExtension('OES_texture_float_linear')) throw new Error('OES_texture_float_linear missing');

    // --- GL kit ---
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n'));
      return s;
    };
    const quadVS = sh(gl.VERTEX_SHADER, VERT);
    const program = (fs, vs = quadVS) => {
      const p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, 'p');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < nu; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const tex = (w, h, fmt, filter, data = null) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texStorage2D(gl.TEXTURE_2D, 1, fmt, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (data) gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, h, gl.RGBA, gl.FLOAT, data);
      return t;
    };
    const fbo = (...texs) => {
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      texs.forEach((t, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0));
      gl.drawBuffers(texs.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('incomplete framebuffer');
      return fb;
    };
    const target = (fmt = gl.RGBA32F, filter = gl.NEAREST, w = N, h = N) => { const t = tex(w, h, fmt, filter); return { tex: t, fb: fbo(t), w, h }; };

    const quad = gl.createVertexArray();
    gl.bindVertexArray(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const bindTex = (P, map) => {
      let unit = 0;
      for (const [name, t] of Object.entries(map)) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        if (P.u[name]) gl.uniform1i(P.u[name], unit);
        unit++;
      }
    };
    const pass = (P, fb, w, h, texs, set) => {
      gl.useProgram(P.p);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.viewport(0, 0, w, h);
      bindTex(P, texs);
      if (set) set(P.u);
      gl.bindVertexArray(quad);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const blit = (srcTex, dstTex) => {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, blitR);
      gl.framebufferTexture2D(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, srcTex, 0);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, blitD);
      gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dstTex, 0);
      gl.blitFramebuffer(0, 0, N, N, 0, 0, N, N, gl.COLOR_BUFFER_BIT, gl.NEAREST);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    };
    const blitR = gl.createFramebuffer(), blitD = gl.createFramebuffer();

    const P = {
      flux: program(FLUX), water: program(WATER), move: program(MOVE), copyg: program(COPYG), prep: program(PREP),
      sky: program(SKY_FS), terrain: program(TER_FS, sh(gl.VERTEX_SHADER, TER_VS)),
    };

    // --- the untouched mountain (CPU, seeded) ---
    const terr = makeTerrain(N, 35);
    const init0 = new Float32Array(N * N * 4);
    for (let k = 0; k < N * N; k++) { init0[k * 4] = terr.rock[k]; init0[k * 4 + 1] = terr.soft[k]; }
    const zeros = new Float32Array(N * N * 4);

    // --- state: TER (+ the mid-iteration copy), FLX and VEL ping-pong ---
    const TER = tex(N, N, gl.RGBA32F, gl.LINEAR), TERm = tex(N, N, gl.RGBA32F, gl.LINEAR);
    let FLX = tex(N, N, gl.RGBA32F, gl.NEAREST), FLX2 = tex(N, N, gl.RGBA32F, gl.NEAREST);
    let VEL = tex(N, N, gl.RGBA32F, gl.LINEAR), VEL2 = tex(N, N, gl.RGBA32F, gl.LINEAR);
    const fbTER = fbo(TER);
    const fbFLX = new Map([[FLX, fbo(FLX)], [FLX2, fbo(FLX2)]]);
    const fbMid = new Map([[VEL, fbo(TERm, VEL)], [VEL2, fbo(TERm, VEL2)]]);
    const G0 = target(gl.R32F, gl.LINEAR);
    const PRE = target(gl.RGBA16F, gl.LINEAR);

    const iterate = (rain, tStorm) => {
      pass(P.flux, fbFLX.get(FLX2), N, N, { TER, FLX }, (u) => {
        gl.uniform1f(u.dt, SIM.dt); gl.uniform1f(u.grav, SIM.g); gl.uniform1f(u.damp, SIM.damp);
      });
      [FLX, FLX2] = [FLX2, FLX];
      pass(P.water, fbMid.get(VEL2), N, N, { TER, FLX, VEL }, (u) => {
        gl.uniform1f(u.dt, SIM.dt); gl.uniform1f(u.Kc, SIM.Kc); gl.uniform1f(u.Ks, SIM.Ks); gl.uniform1f(u.Kd, SIM.Kd);
        gl.uniform1f(u.rockF, SIM.rockF); gl.uniform1f(u.dCap, SIM.dCap); gl.uniform1f(u.vMax, SIM.vMax);
      });
      [VEL, VEL2] = [VEL2, VEL];
      pass(P.move, fbTER, N, N, { TER: TERm, VEL }, (u) => {
        gl.uniform1f(u.dt, SIM.dt); gl.uniform1f(u.Ke, SIM.Ke); gl.uniform1f(u.Kt, SIM.Kt);
        gl.uniform1f(u.tanR, SIM.tanR); gl.uniform1f(u.tanS, SIM.tanS);
        gl.uniform1f(u.rain, SIM.rain * rain); gl.uniform1f(u.tStorm, tStorm); gl.uniform1f(u.hmax, terr.hmax);
      });
    };

    const px = new Float32Array(4);
    const R = replay({
      dt: 1 / FPS,
      every: 30,
      init: () => {
        gl.bindTexture(gl.TEXTURE_2D, TER);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, N, N, gl.RGBA, gl.FLOAT, init0);
        for (const t of [FLX, FLX2, VEL, VEL2]) { gl.bindTexture(gl.TEXTURE_2D, t); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, N, N, gl.RGBA, gl.FLOAT, zeros); }
        for (let i = 0; i < PRESETTLE; i++) iterate(0, 0);
        // the reference surface for "carved" / "deposited" colouring
        pass(P.copyg, G0.fb, N, N, { TER });
      },
      step: (n) => {
        const k = ipf(n), r = rainOf(n);
        for (let i = 0; i < k; i++) iterate(r, (n + i / k) / FPS);
        if (HEADLESS) { gl.bindFramebuffer(gl.FRAMEBUFFER, fbTER); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, px); }
      },
      save: () => {
        const c = { TER: tex(N, N, gl.RGBA32F, gl.NEAREST), FLX: tex(N, N, gl.RGBA32F, gl.NEAREST), VEL: tex(N, N, gl.RGBA32F, gl.NEAREST) };
        blit(TER, c.TER); blit(FLX, c.FLX); blit(VEL, c.VEL);
        return c;
      },
      load: (c) => { blit(c.TER, TER); blit(c.FLX, FLX); blit(c.VEL, VEL); },
    });

    // --- terrain grid: one vertex per cell, indexed triangles (vertex positions come from gl_VertexID) ---
    const meshVao = gl.createVertexArray();
    gl.bindVertexArray(meshVao);
    const idx = new Uint32Array((N - 1) * (N - 1) * 6);
    let w = 0;
    for (let j = 0; j < N - 1; j++) for (let i = 0; i < N - 1; i++) {
      const a = j * N + i, b = a + 1, c = a + N, d = c + 1;
      idx[w++] = a; idx[w++] = b; idx[w++] = d; idx[w++] = a; idx[w++] = d; idx[w++] = c;
    }
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    const FOV = 50 * deg, ASP = W / H;
    const proj = perspective(FOV, ASP, 0.05, 80);
    const tanH = [Math.tan(FOV / 2) * ASP, Math.tan(FOV / 2)];

    this.render = (t) => {
      // camera: slow orbit around the massif
      const az = camAz(t) * deg, r = camR(t);
      const pivot = [0, 0, -0.7];
      const eye = [pivot[0] + Math.sin(az) * r, camH(t), pivot[2] + Math.cos(az) * r];
      const tgt = [0, 0.55, -0.8];
      const fw = norm(sub(tgt, eye)), rt = norm(cross(fw, [0, 1, 0])), up = cross(rt, fw);
      const VP = mul(proj, viewOf(eye, fw, rt, up));
      // light
      const ov = overcast(t), wm = warmth(t), fl = flashOf(t);
      const el = sunEl(t) * deg, sa = sunAz(t) * deg;
      const sun = [Math.cos(el) * Math.sin(sa), Math.sin(el), Math.cos(el) * Math.cos(sa)];
      const sc = [lerp(1.0, 1.0, wm), lerp(0.88, 0.62, wm), lerp(0.72, 0.36, wm)].map((c) => c * lerp(2.5, 3.1, wm) * (1 - 0.8 * ov));
      const amb = [lerp(0.17, 0.2, ov), lerp(0.23, 0.22, ov), lerp(0.36, 0.25, ov)].map((c, i) => c * lerp(1, [1.15, 0.95, 0.8][i], wm) * lerp(1, 0.85, ov));
      const gnd = [0.09, 0.075, 0.06].map((c) => c * (1 - 0.5 * ov));

      // shadows + AO for this frame's terrain and sun
      pass(P.prep, PRE.fb, N, N, { TER }, (u) => gl.uniform3fv(u.sunDir, sun));

      const shade = (u) => {
        gl.uniform3fv(u.sunDir, sun); gl.uniform3fv(u.sunCol, sc); gl.uniform3fv(u.camPos, eye);
        gl.uniform1f(u.time, t); gl.uniform1f(u.ov, ov); gl.uniform1f(u.warm, wm); gl.uniform1f(u.flash, fl);
        gl.uniform1f(u.rainV, rainVis(t)); gl.uniform1f(u.fade, fadeOf(t)); gl.uniform1f(u.mist, mistOf(t));
      };
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.disable(gl.DEPTH_TEST);
      gl.depthMask(true);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // sky
      gl.useProgram(P.sky.p);
      shade(P.sky.u);
      gl.uniform3fv(P.sky.u.camF, fw); gl.uniform3fv(P.sky.u.camR, rt); gl.uniform3fv(P.sky.u.camU, up);
      gl.uniform2fv(P.sky.u.tanH, tanH);
      gl.bindVertexArray(quad);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // terrain
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.useProgram(P.terrain.p);
      bindTex(P.terrain, { TER, VEL, PRE: PRE.tex, G0T: G0.tex });
      shade(P.terrain.u);
      gl.uniformMatrix4fv(P.terrain.u.VP, false, new Float32Array(VP));
      gl.uniform3fv(P.terrain.u.ambSky, amb); gl.uniform3fv(P.terrain.u.ambGnd, gnd);
      gl.uniform1f(P.terrain.u.hmax, terr.hmax);
      gl.bindVertexArray(meshVao);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_INT, 0);
      gl.bindVertexArray(null);
      gl.disable(gl.DEPTH_TEST);
    };
    this.R = R;
  },
  async frame(t) {
    await this.R.seek(t);
    this.render(t);
  },
});
