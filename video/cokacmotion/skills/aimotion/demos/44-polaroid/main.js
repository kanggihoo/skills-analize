/*
 * 44 · 폴라로이드가 떠오르기까지 — an integral instant print developing in summer light (WebGL2, closed form in t).
 *
 * setup: the summer seaside (sky gradient and sun haze, lit cumulus, gulls, an island with a lighthouse, sea with
 *   wave bands and glitter, foam line, wet and dry sand, footprints, a striped parasol and its shadow, a towel,
 *   beach grass) is drawn once by a shader twice: the square photograph through a Polaroid grade (lifted blacks,
 *   warm highlights, cyan shadows, vignette) and the wider world behind it, then blurred (out of focus).
 * frame(t): one fullscreen pass.
 *   ejection   the camera's motor pushes the print out of the slot pod-first (the wide bottom border leads);
 *              the rollers burst the pod and spread the reagent toward the top: each row's spreading time comes
 *              from the ejection, plus a front that lags unevenly (more at the side edges) and two corner spots the
 *              reagent never reaches.
 *   chemistry  per pixel, age a = (t − spread time) / (local reagent thickness): the opacifier (dark blue-green)
 *              decolorises, and the three dye layers transfer at different rates — cyan first, magenta, yellow last —
 *              toward the target densities D = −log10(colour); dyes have side absorptions; reflectance =
 *              (white pigment ↔ opacifier) · 10^−D. Murky teal → cold ghost → warm, contrast and saturation building.
 *   the print  a 3D plane (ray–plane intersection under a perspective camera) held in the hand: slow sway, and
 *              during the time-lapse the pose and the sunlight jump a little from frame to frame; a glossy window
 *              (Fresnel, sky, sun glint) in a semi-matte frame with the pod ridge; at the end it is tilted into the sun.
 */
import { defineDemo, track, ease, clamp, lerp, smooth } from '../_lib/stage.js';

const D = 10;
const HEADLESS = new URLSearchParams(location.search).has('render');
const F = 1800;                 // focal length (px)
const SLOT_Y = 787;             // lower lip of the ejection slot (screen px)
const PS = 1024;                // photograph texture
const BW = 270, BH = 480;       // background texture (blurred)

// ---------------------------------------------------------------- the story
const eject = (t) => clamp((t - 0.4) / 1.35);
const take = (t) => smooth((t - 1.95) / 0.85);
const camLift = (t) => { const u = clamp((t - 1.9) / 0.75); return u * u * (3 - 2 * u); };
const lapse = (t) => smooth((t - 2.7) / 0.4) * (1 - smooth((t - 8.0) / 0.4));    // time-lapse stepping on/off
const hsh = (k) => { const v = Math.sin(k * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const endPitch = track([[8.25, 0], [9.75, -14.5, ease.inOutCubic]]);
const endYaw = track([[8.25, 0], [9.75, 10.5, ease.inOutCubic]]);
// sunlight: a cloud drifts over the sun during the time-lapse, the light steps with the frames
const sunK = (t) => {
  const base = 1 - 0.28 * smooth((t - 4.2) / 0.9) * (1 - smooth((t - 6.0) / 0.9));
  const k = Math.floor(t * 7);
  return base * (1 + lapse(t) * 0.05 * (hsh(k + 40) - 0.5));
};
const fade = track([[0, 0.0], [0.35, 1.0, ease.outCubic]]);
function pose(t) {
  const e = eject(t), tk = take(t);
  const jud = e > 0 && e < 1 ? Math.sin(t * 97) * 0.9 + Math.sin(t * 61) * 0.5 : 0;     // motor judder
  // during ejection: in the camera's front plane, sliding down out of the slot
  const ex = 540 + 0.6 * jud, ey = SLOT_Y - 486.5 + e * 973 + 0.5 * jud;
  // held: brought to the centre, closer to the eye
  const sw = (a, f, p) => a * Math.sin(f * t + p);
  let hx = 540 + sw(9, 0.9, 0.4) + sw(4, 2.1, 1.0), hy = 905 + sw(7, 0.75, 2.0) + sw(3, 1.9, 0.3);
  let roll = sw(1.3, 0.8, 0.5) + sw(0.5, 1.7, 2.0), yaw = sw(3.2, 0.62, 1.1), pitch = sw(2.6, 0.71, 2.4);
  // time-lapse: between frames the hand settles somewhere a little different
  const L = lapse(t);
  if (L > 0) {
    const k = Math.floor(t * 7), f = t * 7 - k, b = smooth((f - 0.7) / 0.3);
    const j = (s) => lerp(hsh(k + s) - 0.5, hsh(k + 1 + s) - 0.5, b);
    hx += L * 16 * j(1); hy += L * 12 * j(2); roll += L * 1.6 * j(3); yaw += L * 3 * j(4); pitch += L * 3 * j(5);
  }
  pitch += endPitch(t); yaw += endYaw(t);
  const cx = lerp(ex, hx, tk), cy = lerp(ey, hy, tk) - 60 * Math.sin(Math.PI * tk);
  const dz = lerp(0, -170, tk);
  const r = Math.PI / 180;
  return { cx, cy, dz, roll: roll * r * tk, yaw: yaw * r * tk, pitch: pitch * r * tk, clip: tk < 0.02 ? 1 : 0 };
}
function rotMat(roll, yaw, pitch) {
  // R = Rz(roll) · Ry(yaw) · Rx(pitch); returned column-major (columns = the print's x, y, z axes in camera space)
  const cz = Math.cos(roll), sz = Math.sin(roll), cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
  const Rz = [[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]], Ry = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]], Rx = [[1, 0, 0], [0, cx, -sx], [0, sx, cx]];
  const mul = (A, B) => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
  const M = mul(mul(Rz, Ry), Rx);
  return new Float32Array([M[0][0], M[1][0], M[2][0], M[0][1], M[1][1], M[2][1], M[0][2], M[1][2], M[2][2]]);
}

// ---------------------------------------------------------------- shaders
const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;
const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
out vec4 o;
float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
float sdRound(vec2 p, vec2 b, float r) { vec2 d = abs(p) - b + r; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r; }
`;

// ---- the summer seaside (scene units: x right, y up, the horizon at y = 0)
const SCENE = HEAD + `
uniform vec2 res;
uniform int mode;
uniform float ssN;
const vec3 HOR = vec3(0.52, 0.75, 0.92);
float cloud(vec2 P) {
  vec2 cp = vec2(P.x * 2.6, P.y * 3.6);
  float n = fbm(cp + vec2(3.1, 1.7)) * 0.7 + fbm(cp * 2.3 + 9.0) * 0.3;
  float e1 = smoothstep(0.06, 0.15, P.y) * (1.0 - smoothstep(0.28, 0.6, P.y + 0.1 * sin(P.x * 6.0 + 1.0))) * smoothstep(-0.15, 0.25, P.x);
  float e2 = smoothstep(0.52, 0.6, P.y) * (1.0 - smoothstep(0.66, 0.8, P.y)) * smoothstep(-0.95, -0.5, P.x) * (1.0 - smoothstep(-0.25, 0.05, P.x));
  return n * max(e1, 0.85 * e2) * 1.25;
}
float gull(vec2 P, vec2 c, float s) {
  vec2 q = (P - c) / s;
  float ax = abs(q.x);
  float y = 0.55 * ax * (1.15 - ax) - 0.14 * ax;           // two arched wings
  return (1.0 - smoothstep(0.06, 0.12, abs(q.y - y))) * step(ax, 1.0);
}
float islandH(float X) { float a = (X + 0.36) / 0.11, b = (X + 0.2) / 0.06; return 0.042 * exp(-a * a) + 0.02 * exp(-b * b) + 0.003 * vnoise(vec2(X * 90.0, 0.0)); }
float shoreY(float X) { return -0.28 + 0.01 * sin(X * 9.0 + 1.0) + 0.005 * sin(X * 23.0 + 2.0); }
vec3 summer(vec2 P) {
  float X = P.x, Y = P.y;
  vec3 col;
  if (Y > 0.0) {
    // sky, the sun's haze from the upper left, cumulus lit from the sun's side, two gulls
    vec3 zen = vec3(0.04, 0.2, 0.6);
    col = mix(HOR, zen, smoothstep(0.0, 0.62, Y) * 0.9 + 0.1 * smoothstep(0.6, 1.4, Y));
    float sd = length(P - vec2(-0.82, 0.98));
    col += vec3(1.0, 0.86, 0.62) * (0.55 * exp(-sd * 2.6) + 0.22 * exp(-sd * 0.9));
    float cd = cloud(P);
    float cm = smoothstep(0.5, 0.62, cd);
    if (cm > 0.0) {
      float sh = clamp((cd - cloud(P + vec2(-0.022, 0.028))) * 7.0 + 0.55, 0.0, 1.0);
      vec3 cc = mix(vec3(0.6, 0.66, 0.8), vec3(1.0, 0.98, 0.94), sh);
      cc = mix(cc, vec3(0.68, 0.72, 0.82), (1.0 - smoothstep(0.08, 0.2, Y)) * 0.6);
      col = mix(col, cc, cm);
    }
    col = mix(col, vec3(0.15, 0.17, 0.2), max(gull(P, vec2(-0.14, 0.3), 0.016), gull(P, vec2(-0.04, 0.255), 0.012)));
    // the island and its lighthouse in the haze
    float ih = islandH(X);
    if (X > -0.56 && X < -0.1 && Y < ih) col = mix(vec3(0.1, 0.22, 0.16), HOR, 0.42);
    float lb = islandH(-0.31), lx = X + 0.31;
    if (Y > lb - 0.004 && Y < lb + 0.058 && abs(lx) < 0.0055 - (Y - lb) * 0.025) {
      col = Y > lb + 0.044 ? vec3(0.75, 0.15, 0.12) : vec3(0.95, 0.93, 0.88) * (0.85 + 0.15 * step(0.0, -lx));
      col = mix(col, HOR, 0.25);
    }
    if (Y > lb + 0.058 && Y < lb + 0.066 && abs(lx) < 0.003) col = vec3(0.3, 0.3, 0.32);
    return col;
  }
  float ys = shoreY(X);
  if (Y > ys) {
    // the sea: deep at the horizon, turquoise near the shore, wave bands compressing with distance, glitter
    float s = clamp(-Y / 0.28, 0.0, 1.0);
    col = mix(vec3(0.03, 0.2, 0.45), vec3(0.06, 0.52, 0.6), pow(s, 1.4));
    float ws = sin(Y * (34.0 / (s + 0.06)) + 3.0 * vnoise(vec2(X * 7.0, Y * 60.0)));
    col *= 0.9 + 0.14 * smoothstep(0.5, 1.0, ws);
    col = mix(col, HOR * 0.92, (1.0 - s) * (1.0 - s) * 0.4);
    vec2 g = vec2(X * 260.0, Y * 900.0 / (s + 0.12));
    float gx = (X + 0.55) / 0.4;
    float glit = step(0.93, hash(floor(g))) * exp(-gx * gx) * (1.0 - 0.5 * s);
    col += vec3(1.0, 0.95, 0.85) * glit * 1.6;
    return col;
  }
  // the foam line, wet sand mirroring the sky, dry sand
  float dy = ys - Y;
  float sand = 0.9 + 0.1 * vnoise(P * vec2(140.0, 420.0)) + 0.05 * (vnoise(P * vec2(25.0, 90.0)) - 0.5);
  col = vec3(0.93, 0.8, 0.6) * sand;
  col *= 1.0 - 0.04 * smoothstep(0.4, 1.0, sin(Y * 260.0 + X * 30.0 + 4.0 * vnoise(P * 20.0)));    // wind ripples
  float wetS = 1.0 - smoothstep(0.02, 0.06, dy);
  col = mix(col, vec3(0.55, 0.52, 0.47) + HOR * 0.12, wetS * 0.75);
  float foam = (1.0 - smoothstep(0.0, 0.012, dy)) * (0.6 + 0.4 * vnoise(vec2(X * 120.0, dy * 400.0)));
  foam = max(foam, (1.0 - smoothstep(0.0, 0.004, abs(dy - 0.026 - 0.004 * sin(X * 31.0)))) * 0.7);
  col = mix(col, vec3(0.97, 0.98, 0.97), clamp(foam, 0.0, 1.0));
  // footprints walking toward the water
  for (int k = 0; k < 9; k++) {
    float fk = float(k);
    vec2 c = vec2(-0.08 + 0.022 * fk + 0.012 * mod(fk, 2.0) - 0.006, -0.34 - 0.05 * fk - 0.004 * fk * fk);
    vec2 q = (P - c) / vec2(0.008 + 0.0012 * fk, 0.004 + 0.0008 * fk);
    float d = dot(q, q);
    col *= 1.0 - 0.22 * (1.0 - smoothstep(0.6, 1.0, d)) + 0.08 * smoothstep(0.6, 1.0, d) * (1.0 - smoothstep(1.0, 1.5, d)) * step(0.0, q.y);
  }
  // the parasol's shadow (bluish: lit by the sky only)
  vec2 sq = (P - vec2(0.33, -0.49)) / vec2(0.23, 0.04);
  float shd = 1.0 - smoothstep(0.75, 1.05, length(sq) + 0.08 * sin(atan(sq.y, sq.x + 1e-6) * 8.0) * step(0.0, sq.y));
  col = mix(col, col * vec3(0.55, 0.6, 0.78), shd);
  // the towel (blue and white stripes, in perspective)
  vec2 tq = P - vec2(0.15, -0.5);
  tq.x += tq.y * 0.4;
  if (abs(tq.x) < 0.17 && abs(tq.y) < 0.035) {
    float st = step(0.5, fract(tq.x * 22.0));
    col = mix(vec3(0.12, 0.3, 0.68), vec3(0.95, 0.93, 0.88), st) * (shd > 0.5 ? 0.62 : 1.0) * (0.92 + 0.08 * vnoise(P * 300.0));
  }
  // beach grass in the near left corner
  float gb = -0.62 + 0.2 * pow(vnoise(vec2(X * 55.0, 0.0)), 2.0) + 0.08 * vnoise(vec2(X * 13.0, 3.0));
  if (X < -0.05 && Y < gb - 0.25 * smoothstep(-0.25, -0.05, X)) {
    float tip = smoothstep(0.06, 0.0, gb - Y);
    col = mix(vec3(0.08, 0.18, 0.05), vec3(0.5, 0.58, 0.25), tip * 0.7 + 0.15 * vnoise(vec2(X * 300.0, Y * 20.0)));
  }
  return col;
}
// the parasol stands in front of the sea and the sand: a pole, a striped dome lit from the left, a scalloped hem
vec3 parasol(vec2 P, vec3 col) {
  vec2 a = vec2(0.205, 0.075);                       // apex
  float px = P.x - 0.205 - (P.y + 0.06) * 0.03;
  if (abs(px) < 0.0045 && P.y < 0.08 && P.y > -0.47)
    col = vec3(0.92, 0.9, 0.86) * (0.62 + 0.38 * smoothstep(-0.004, 0.003, -px));
  if (length((P - a - vec2(0.0, 0.008)) * vec2(1.0, 1.3)) < 0.008) col = vec3(0.85, 0.82, 0.76);   // finial
  vec2 q = P - a;
  float w = 0.27, u = q.x / w;
  float ang = atan(q.x, -q.y + 1e-6);
  float scal = 0.011 * abs(sin(ang * 9.0 * 0.5 * 2.0));
  float top = -0.125 * u * u, bot = -0.135 - 0.012 * u * u - scal;
  if (abs(u) < 1.0 && q.y < top && q.y > bot) {
    float st = step(0.5, fract(ang * 9.0 / 6.2832 + 0.25));
    vec3 cc = mix(vec3(0.85, 0.13, 0.1), vec3(0.97, 0.95, 0.9), st);
    float lit = 0.8 - 0.32 * u + 0.12 * smoothstep(bot, top, q.y);
    lit *= 1.0 - 0.35 * (1.0 - smoothstep(0.0, 0.012, q.y - bot));     // the shaded hem
    cc *= clamp(lit, 0.4, 1.15);
    col = cc;
  }
  return col;
}
vec3 grade(vec3 c, vec2 uv) {
  float l = dot(c, vec3(0.3, 0.55, 0.15));
  c = mix(vec3(l), c, 0.86);
  c *= vec3(1.05, 1.0, 0.9);
  c = c / (1.0 + 0.4 * c) * 1.32;
  c = 0.045 + 0.9 * c;
  c += vec3(-0.012, 0.006, 0.024) * (1.0 - smoothstep(0.0, 0.35, l));
  vec2 q = uv - 0.5;
  c *= 1.0 - 0.6 * dot(q, q);
  return clamp(c, 0.0, 1.0);
}
void main() {
  vec2 fc = gl_FragCoord.xy;
  vec3 c = vec3(0.0);
  for (float j = 0.0; j < 2.0; j++) for (float i = 0.0; i < 2.0; i++) {
    if (i >= ssN || j >= ssN) continue;
    vec2 off = ssN > 1.0 ? (vec2(i, j) + 0.5) / ssN : vec2(0.5);
    vec2 uv = vec2((fc.x - 0.5 + off.x) / res.x, 1.0 - (fc.y - 0.5 + off.y) / res.y);
    vec2 P = mode == 0 ? vec2(uv.x - 0.5, 0.4 - uv.y) : vec2((uv.x - 0.5) * 1.8, (0.31 - uv.y) * 3.2);
    c += parasol(P, summer(P));
  }
  c /= ssN * ssN;
  vec2 uv = vec2(fc.x / res.x, 1.0 - fc.y / res.y);
  c = mode == 0 ? grade(c, uv) : c * 1.06;
  o = vec4(sqrt(max(c, vec3(0.0))), 1.0);
}`;

const BLUR = HEAD + `
uniform sampler2D T; uniform vec2 dir;
void main() {
  vec2 res = vec2(textureSize(T, 0));
  vec2 uv = gl_FragCoord.xy / res;
  vec3 acc = vec3(0.0); float ws = 0.0;
  for (int k = -6; k <= 6; k++) {
    float w = exp(-float(k * k) / 14.0);
    vec3 c = texture(T, uv + dir * float(k) * 2.2 / res).rgb;
    acc += c * c * w; ws += w;                      // blur in linear light
  }
  o = vec4(sqrt(acc / ws), 1.0);
}`;

const DISPLAY = HEAD + `
uniform sampler2D Scn, Bg;
uniform vec2 res;
uniform float time, slotY, clipOn, camY, sunK, fade, jud;
uniform vec3 pc;
uniform mat3 R;
const float F = ${F.toFixed(1)};
const vec2 HALF = vec2(400.0, 486.5);
const vec2 IMGC = vec2(0.0, -72.5), IMGH = vec2(359.0, 359.0);
const vec3 SUN = vec3(-0.2506, -0.3509, -0.9022);   // toward the sun, camera space (x right, y down, z away)

// ---- the world behind: out-of-focus seaside, glitter bokeh at the sea's edge, the sun's flare
vec3 background(vec2 s) {
  vec3 c = texture(Bg, vec2(s.x / res.x, 1.0 - s.y / res.y)).rgb;
  c *= c;
  c *= 0.85 + 0.15 * sunK;
  vec2 cell = floor(vec2(s.x / 64.0, (s.y - 590.0) / 44.0));
  if (s.y > 560.0 && s.y < 800.0) {
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 cc = cell + vec2(x, y);
      if (hash(cc + 2.0) < 0.55) continue;
      vec2 ctr = vec2((cc.x + hash(cc)) * 64.0, 590.0 + (cc.y + hash(cc + 4.0)) * 44.0);
      float r = 12.0 + 18.0 * hash(cc + 7.0);
      float d = length(s - ctr) / r;
      float tw = 0.5 + 0.5 * sin(time * (2.0 + 3.0 * hash(cc + 9.0)) + hash(cc + 1.0) * 6.28);
      c += vec3(1.0, 0.93, 0.8) * (1.0 - smoothstep(0.85, 1.0, d)) * (0.25 + 0.15 * smoothstep(0.6, 0.95, d)) * tw;
    }
  }
  vec2 fq = s - vec2(-60.0, -80.0);
  c += vec3(1.0, 0.85, 0.6) * (0.55 * exp(-length(fq) / 260.0) + 0.12 * exp(-length(fq) / 900.0)) * sunK;
  for (int k = 1; k <= 3; k++) {              // flare ghosts along the diagonal
    vec2 gc = vec2(-60.0, -80.0) + vec2(600.0, 1050.0) * (0.35 * float(k));
    float d = length(s - gc) / (40.0 + 30.0 * float(k));
    c += vec3(0.6, 0.8, 1.0) * 0.05 * (1.0 - smoothstep(0.8, 1.0, d)) * sunK;
  }
  return c;
}

// ---- the camera (mint plastic body, lens, viewfinder, flash, shutter button, the slot)
vec4 cameraBody(vec2 s) {
  vec2 q = s - vec2(540.0, 380.0);
  float d = sdRound(q, vec2(470.0, 440.0), 92.0);
  if (d > 30.0) return vec4(0.0);
  float shadowOut = (1.0 - smoothstep(0.0, 30.0, d)) * 0.35;     // contact darkness around the body
  if (d > 0.0) return vec4(vec3(0.0), shadowOut);
  // body: lit from the upper left, rounded edges
  vec2 e = vec2(1.0, 0.0);
  vec2 gr = vec2(sdRound(q + e.xy, vec2(470.0, 440.0), 92.0) - sdRound(q - e.xy, vec2(470.0, 440.0), 92.0),
                 sdRound(q + e.yx, vec2(470.0, 440.0), 92.0) - sdRound(q - e.yx, vec2(470.0, 440.0), 92.0)) * 0.5;
  float edge = 1.0 - smoothstep(-34.0, 0.0, d);
  vec3 n = normalize(vec3(gr * (1.0 - edge) * 1.8, -1.0));
  float dif = 0.55 + 0.5 * max(dot(n, SUN), 0.0);
  vec3 body = vec3(0.6, 0.8, 0.73) * (0.97 + 0.03 * vnoise(s * 0.9)) * dif;
  body *= 0.9 + 0.12 * smoothstep(400.0, -400.0, q.x + q.y);
  body += vec3(0.9, 0.95, 1.0) * 0.18 * pow(max(dot(reflect(vec3(0.0, 0.0, 1.0), n), SUN), 0.0), 20.0);
  // a seam around the front plate
  body *= 1.0 - 0.25 * (1.0 - smoothstep(0.5, 2.0, abs(d + 40.0)));
  vec3 col = body;
  // the lens: ribbed barrel, rings, deep glass with the sky in it
  vec2 lq = q - vec2(0.0, -60.0);
  float lr = length(lq);
  col *= 1.0 - 0.45 * (1.0 - smoothstep(205.0, 245.0, length(lq - vec2(16.0, 22.0)))) * step(205.0, lr);    // the barrel's shadow
  if (lr < 210.0) {
    float ang = atan(lq.y, lq.x + 1e-6);
    vec3 c2 = vec3(0.055, 0.058, 0.062) * (0.85 + 0.3 * step(0.5, fract(ang * 60.0 / 6.2832)) * step(178.0, lr));
    c2 += 0.12 * (1.0 - smoothstep(2.0, 5.0, abs(lr - 205.0))) * (0.5 + 0.5 * cos(ang + 2.4));
    c2 += 0.08 * (1.0 - smoothstep(1.0, 3.0, abs(lr - 176.0)));
    if (lr < 152.0) {
      // glass: dark blue-black, a sky reflection crescent, concentric element reflections, a sun glint
      vec2 gq = lq / 152.0;
      c2 = vec3(0.01, 0.015, 0.03) + vec3(0.02, 0.03, 0.06) * (1.0 - dot(gq, gq));
      float cres = smoothstep(0.55, 0.85, length(gq - vec2(0.18, 0.22))) * (1.0 - smoothstep(0.9, 1.0, length(gq)));
      c2 += vec3(0.35, 0.5, 0.7) * cres * smoothstep(0.2, -0.6, gq.x + gq.y) * 0.8;
      c2 += vec3(0.4, 0.3, 0.5) * 0.25 * (1.0 - smoothstep(0.0, 0.02, abs(length(gq + vec2(0.05, 0.05)) - 0.55)));
      c2 += vec3(0.25, 0.45, 0.35) * 0.18 * (1.0 - smoothstep(0.0, 0.015, abs(length(gq - vec2(0.03, 0.04)) - 0.32)));
      c2 += vec3(1.0) * 1.4 * exp(-dot(gq + vec2(0.42, 0.45), gq + vec2(0.42, 0.45)) * 220.0);
    }
    col = c2;
  }
  // viewfinder window and flash
  vec2 vq = q - vec2(-320.0, -300.0);
  float dv = sdRound(vq, vec2(72.0, 50.0), 14.0);
  if (dv < 6.0) col = mix(vec3(0.05), col, smoothstep(0.0, 6.0, dv));
  if (dv < 0.0) col = vec3(0.02, 0.025, 0.035) + vec3(0.3, 0.4, 0.5) * 0.5 * smoothstep(0.3, 1.0, -vq.x / 72.0 - vq.y / 50.0 + 0.4);
  vec2 fq = q - vec2(300.0, -300.0);
  float df = sdRound(fq, vec2(132.0, 62.0), 12.0);
  if (df < 7.0) col = mix(vec3(0.75, 0.76, 0.78) * dif, col, smoothstep(0.0, 7.0, df));
  if (df < 0.0) col = vec3(0.88, 0.89, 0.9) * (0.82 + 0.18 * step(0.5, fract(fq.y / 7.0))) * (0.9 + 0.1 * smoothstep(-132.0, 132.0, -fq.x));
  // shutter button
  vec2 bq = q - vec2(-360.0, 210.0);
  float db = length(bq) - 40.0;
  if (db < 4.0) col = mix(col * 0.6, col, smoothstep(0.0, 4.0, db));
  if (db < 0.0) col = vec3(0.92, 0.3, 0.18) * (0.75 + 0.35 * smoothstep(30.0, -30.0, bq.x + bq.y)) + 0.4 * exp(-dot(bq + vec2(14.0, 14.0), bq + vec2(14.0, 14.0)) / 60.0);
  // the ejection slot
  vec2 sq = q - vec2(0.0, 400.0);
  float ds = sdRound(sq, vec2(400.0, 7.0), 7.0);
  if (ds < 3.0) col *= mix(0.4, 1.0, smoothstep(0.0, 3.0, ds));
  if (ds < 0.0) col = vec3(0.02);
  return vec4(col, 1.0);
}

// ---- integral film chemistry
vec3 chemistry(vec2 lp, vec2 uv) {
  float tsp = 0.4 + 1.35 * (486.5 - lp.y) / 973.0;
  // the reagent front trails the rollers a little and runs unevenly; it is slowest near the side edges
  tsp += 0.09 + 0.06 * (fbm(vec2(lp.x * 0.012, 3.0)) - 0.5) + 0.08 * smoothstep(300.0, 359.0, abs(lp.x)) + 0.02 * sin(lp.x * 0.05);
  // two spots at the top corners the reagent never reaches
  vec2 c1 = lp - vec2(-347.0, -421.0), c2 = lp - vec2(344.0, -424.0);
  float miss = max(1.0 - smoothstep(9.0, 12.0, length(c1 * vec2(1.0, 1.4)) + 5.0 * vnoise(lp * 0.15)),
                   1.0 - smoothstep(6.0, 9.0, length(c2 * vec2(1.2, 1.0)) + 4.0 * vnoise(lp * 0.17 + 3.0)));
  float age = time - tsp;
  vec3 neg = vec3(0.028, 0.034, 0.03) * (1.0 + 0.4 * vnoise(lp * 0.05));      // the negative through the clear window
  if (age <= 0.0) return neg;
  // reagent thickness: thicker near the pod (bottom), streaks along the spreading direction, a roller line
  float th = 1.0 + 0.12 * (lp.y + 72.5) / 359.0 + 0.1 * (vnoise(vec2(lp.x * 0.035, lp.y * 0.004)) - 0.5) + 0.06 * smoothstep(320.0, 359.0, abs(lp.x));
  th += 0.05 * (1.0 - smoothstep(0.0, 2.5, abs(lp.y - 58.0)));
  float a = age / th;
  float O = 1.0 - smoothstep(0.7, 4.3, a);                                  // the opacifier decolorises
  float Pc = smoothstep(0.25, 3.4, a), Pm = smoothstep(0.9, 4.7, a), Py = smoothstep(1.9, 6.3, a);   // cyan, magenta, yellow
  vec3 tc = texture(Scn, vec2(uv.x, 1.0 - uv.y)).rgb;
  tc *= tc;
  vec3 Dt = -log(max(tc, vec3(0.02))) * 0.4343;
  float Dc = Dt.r * Pc, Dm = Dt.g * Pm, Dy = Dt.b * Py;
  vec3 Dd = vec3(Dc + 0.08 * Dm, Dm + 0.12 * Dc + 0.08 * Dy, Dy + 0.1 * Dm + 0.05 * Dc);   // side absorptions of the dyes
  vec3 base = mix(vec3(0.9, 0.89, 0.86), vec3(0.045, 0.12, 0.125), O);    // white pigment ↔ dark teal opacifier
  base *= 1.0 - 0.35 * exp(-age * 9.0);                                     // the fresh front is darker, wetter
  vec3 r = base * pow(vec3(10.0), -Dd);
  return mix(r, neg, miss);
}

vec3 shadePhoto(vec2 lp, vec3 hit, vec3 nF) {
  vec2 iq = lp - IMGC;
  float dimg = sdRound(iq, IMGH, 2.0);
  float inImg = 1.0 - smoothstep(-0.6, 0.6, dimg);
  vec3 frame = vec3(0.93, 0.925, 0.905) * (0.985 + 0.03 * vnoise(lp * 0.8));
  frame *= 1.0 + 0.035 * (smoothstep(310.0, 340.0, lp.y) - smoothstep(430.0, 460.0, lp.y)) * sign(-nF.y + 0.001);   // the pod ridge
  frame *= 1.0 - 0.18 * (1.0 - smoothstep(0.0, 3.0, dimg)) * step(0.0, dimg) * smoothstep(-1.0, 1.0, -(iq.x + iq.y));    // the window's recessed edge
  vec3 alb = frame;
  if (inImg > 0.0) alb = mix(frame, chemistry(lp, (iq + IMGH) / (2.0 * IMGH)), inImg);
  float dif = max(dot(nF, SUN), 0.0);
  vec3 lit = alb * (vec3(1.0, 0.96, 0.88) * (0.15 + 0.75 * dif) * sunK + vec3(0.2, 0.23, 0.28));
  // gloss: the window is glossy polyester (slightly wavy), the frame a soft sheen
  vec2 wv = vec2(vnoise(lp * 0.006 + 1.0), vnoise(lp * 0.006 + 7.0)) - 0.5;
  vec3 n = normalize(nF + vec3(wv * 0.02 * inImg, 0.0));
  vec3 V = normalize(-hit);
  vec3 Rr = reflect(-V, n);
  float cosi = clamp(dot(n, V), 0.0, 1.0);
  float Fw = mix(0.012, 0.04 + 0.96 * pow(1.0 - cosi, 5.0), inImg);
  vec3 env = mix(vec3(0.5, 0.46, 0.38), vec3(0.85, 0.92, 1.05), smoothstep(0.25, -0.35, Rr.y));
  float g = pow(max(dot(Rr, SUN), 0.0), mix(40.0, 1400.0, inImg));
  lit += Fw * env * 1.2 + g * mix(0.18, 40.0, inImg) * sunK * vec3(1.0, 0.95, 0.85);
  return lit;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 s = vec2(fc.x, res.y - fc.y);
  vec3 col = background(s);
  vec4 cb = cameraBody(s - vec2(0.0, camY) - vec2(jud * 0.4, 0.0));
  col = mix(col, cb.rgb, cb.a);
  // the print: ray–plane intersection under the perspective camera
  vec3 d = vec3(s.x - 540.0, s.y - 960.0, F);
  vec3 c = vec3(pc.x - 540.0, pc.y - 960.0, F + pc.z);
  vec3 nz = R[2];
  float den = dot(d, nz);
  if (abs(den) > 1e-4) {
    vec3 hit = d * (dot(c, nz) / den);
    vec2 lp = vec2(dot(hit - c, R[0]), dot(hit - c, R[1]));
    float inF = 1.0 - smoothstep(-0.7, 0.7, sdRound(lp, HALF, 7.0));
    if (clipOn > 0.5) inF *= smoothstep(slotY - 0.5, slotY + 0.5, s.y);
    if (inF > 0.0) {
      vec3 pcol = shadePhoto(lp, hit, -nz);
      if (clipOn > 0.5) pcol *= 1.0 - 0.45 * (1.0 - smoothstep(0.0, 22.0, s.y - slotY));   // in the slot's shadow
      col = mix(col, pcol, inF);
    }
    // a soft contact shadow under the edges of the held print (on nothing but air: only a faint darkening halo)
  }
  col *= fade;
  col = col / (1.0 + 0.18 * col) * 1.08;
  vec2 vq = (fc / res - 0.5) * vec2(1.0, 0.7) * 2.0;
  col *= 1.0 - 0.25 * clamp(dot(vq, vq) * 0.5, 0.0, 1.0);
  col = pow(max(col, vec3(0.0)), vec3(1.0 / 2.2));
  col += (hash(fc + fract(time * 7.0) * 37.0) - 0.5) * 0.018;
  o = vec4(col, 1.0);
}`;

defineDemo({
  id: '44-polaroid',
  title: '폴라로이드가 떠오르기까지',
  tech: 'WebGL2 · 즉석 필름 시약 확산 + 색 현상 단계',
  duration: D,
  background: '#000',
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2' });
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n'));
      return s;
    };
    const program = (fsrc) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fsrc));
      gl.bindAttribLocation(p, 0, 'p');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const target = (w, h, mips = false) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texStorage2D(gl.TEXTURE_2D, mips ? Math.floor(Math.log2(Math.max(w, h))) + 1 : 1, gl.RGBA8, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { tex, fb, w, h };
    };
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const pass = (P, dst, tex = {}, set = () => {}) => {
      gl.useProgram(P.p);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null);
      gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H);
      let unit = 0;
      for (const [name, t] of Object.entries(tex)) {
        gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t.tex);
        if (P.u[name]) gl.uniform1i(P.u[name], unit);
        unit++;
      }
      set(P.u);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);

    const Psc = program(SCENE), Pbl = program(BLUR), Pd = program(DISPLAY);
    // the photograph (graded) with mipmaps, and the world behind it, blurred out of focus
    const photo = target(PS, PS, true);
    pass(Psc, photo, {}, (u) => { gl.uniform2f(u.res, PS, PS); gl.uniform1i(u.mode, 0); gl.uniform1f(u.ssN, HEADLESS ? 1 : 2); });
    gl.bindTexture(gl.TEXTURE_2D, photo.tex);
    gl.generateMipmap(gl.TEXTURE_2D);
    const bgA = target(BW, BH), bgB = target(BW, BH);
    pass(Psc, bgA, {}, (u) => { gl.uniform2f(u.res, BW, BH); gl.uniform1i(u.mode, 1); gl.uniform1f(u.ssN, 2); });
    for (let i = 0; i < 2; i++) {
      pass(Pbl, bgB, { T: bgA }, (u) => gl.uniform2f(u.dir, 1, 0));
      pass(Pbl, bgA, { T: bgB }, (u) => gl.uniform2f(u.dir, 0, 1));
    }

    this.render = (t) => {
      const p = pose(t);
      const e = eject(t);
      pass(Pd, null, { Scn: photo, Bg: bgA }, (u) => {
        gl.uniform2f(u.res, W, H);
        gl.uniform1f(u.time, t); gl.uniform1f(u.slotY, SLOT_Y); gl.uniform1f(u.clipOn, p.clip);
        gl.uniform1f(u.camY, -1400 * camLift(t)); gl.uniform1f(u.sunK, sunK(t)); gl.uniform1f(u.fade, fade(t));
        gl.uniform1f(u.jud, e > 0 && e < 1 ? Math.sin(t * 97) : 0);
        gl.uniform3f(u.pc, p.cx, p.cy, p.dz);
        gl.uniformMatrix3fv(u.R, false, rotMat(p.roll, p.yaw, p.pitch));
      });
    };
  },
  frame(t) {
    this.render(t);
  },
});
