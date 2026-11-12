/*
 * 55-truchet-type/shaders.js — every tile is one instanced quad; its look is computed per pixel.
 *
 * Tile vocabulary ("marching squares with arcs", 5 bits): corners A B C D (TL, TR, BR, BL) + the centre.
 * Each corner owns the quarter disc of radius s/2 around it; the four discs touch at the edge midpoints and
 * leave a concave star in the middle that takes the centre bit. So the ink set is
 *   centre 0: the union of the ink corners' discs           → sdf = min |u − c| − ½
 *   centre 1: everything but the paper corners' discs       → sdf = −min |u − c| + ½
 * Every boundary is a quarter arc meeting the tile edge at its midpoint at a right angle, and an edge's colours
 * depend only on its two corner bits — so any two tiles that share corners match, whatever their centre bits.
 * Threads are a Smith tile (two arcs about opposite corners, orientation o) drawn as hairlines / 3-line ribbons.
 *
 * Modes: 0 = settled tiles → an offscreen layer (R ink, G thread, B accent; MAX blend, no seams),
 *        1 = soft shadows of the tiles that are turning, 2 = the turning tiles themselves (lifted, depth-sorted).
 */
const COMMON = `
const vec2 RES = vec2(1080.0, 1920.0);
const vec3 PAPER  = vec3(0.938, 0.906, 0.848);
const vec3 INK    = vec3(0.112, 0.153, 0.247);   // ink navy
const vec3 NAVY_T = vec3(0.180, 0.235, 0.350);   // thread on paper
const vec3 ACCENT = vec3(0.776, 0.349, 0.231);   // rust
const vec3 DEEP   = vec3(0.055, 0.067, 0.102);
uniform float uFade;
float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), u = fract(p);
  u = u * u * (3.0 - 2.0 * u);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
// warm laid paper: mottling and faint chain lines
vec3 paperTex(vec2 q) {
  vec3 c = PAPER * (0.975 + 0.04 * vnoise(q * 0.009 + 3.0) + 0.025 * (vnoise(q * 0.5) - 0.5));
  c *= 1.0 - 0.012 * smoothstep(0.6, 1.0, sin(q.x * 0.21 + vnoise(q * 0.02) * 2.0));
  return c;
}
// light on the sheet, the vignette, the darkening floor under the caption, the fade from / to the dark
vec3 finish(vec3 col, vec2 q) {
  vec2 v = (q - vec2(540.0, 820.0)) / vec2(820.0, 1250.0);
  col *= 1.04 - 0.2 * dot(v, v);
  col *= 1.0 + 0.03 * (1.0 - q.y / RES.y);
  col = mix(col, DEEP, 0.9 * smoothstep(1590.0, 1870.0, q.y));
  return mix(DEEP, col, uFade);
}
`;

export const TILE_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aQ;   // quad corner, −½..½
layout(location=1) in vec4 aT;   // centre x, y, size, level
layout(location=2) in vec4 aK;   // bits for 이음, bits for 매듭, start thread orientation, keep-A flag
layout(location=3) in vec4 aE1;  // sweep 1: start, duration, quarter turns; sweep 2 start
layout(location=4) in vec4 aE2;  // sweep 2: duration, quarter turns; shimmer start, duration
layout(location=5) in vec4 aE3;  // shimmer quarter turns; rest angle after sweep 1, after sweep 2 (quarter turns); random
uniform float uT;
uniform highp int uMode;
out vec2 vL, vA, vB, vW;
out vec2 vG;
out float vS, vLift, vAcc;
flat out vec4 vK;

const float QT = 1.5707963267948966, PI = 3.141592653589793;
// overshoot ease: passes the target by ~10 % and settles back
float outBack(float p) { float x = p - 1.0; return 1.0 + 2.6 * x * x * x + 1.6 * x * x; }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
float turning(float p, float q) { return step(0.5, abs(q)) * step(1e-4, p) * step(p, 0.9999); }

void main() {
  float p1 = clamp((uT - aE1.x) / aE1.y, 0.0, 1.0);
  float p2 = clamp((uT - aE1.w) / aE2.x, 0.0, 1.0);
  float ps = clamp((uT - aE2.z) / max(aE2.w, 1e-3), 0.0, 1.0);
  float m1 = turning(p1, aE1.z), m2 = turning(p2, aE2.y), ms = turning(ps, aE3.x);
  float moving = max(m1, max(m2, ms));
  float th = (aE1.z * outBack(p1) + aE2.y * outBack(p2) + aE3.x * outBack(ps)) * QT;
  float lift = max(m1 * sin(PI * p1), max(m2 * sin(PI * p2), ms * sin(PI * ps)));
  float S = aT.z * (1.0 + 0.07 * lift);
  vec2 c = aT.xy;

  vec2 off = vec2(0.0), w;
  if (uMode == 0) {
    w = c + aQ * (aT.z + 1.0);                         // half a pixel of overlap on every side; MAX blend hides it
  } else if (uMode == 1) {
    off = vec2(3.0, 6.0) * (0.4 + 1.6 * lift);         // the higher the tile, the further and softer its shadow
    w = c + off + rot(th) * (aQ * (S + 2.0 * (4.0 + 14.0 * lift)));
  } else {
    w = c + rot(th) * (aQ * (S + 3.0));
  }
  vec2 rel = w - c - off;
  vL = rot(-th) * rel / S;                             // the tile's own frame (threads, its square)
  vA = rot(aE3.y * QT - th) * rel / S;                 // the frame in which the 이음 pattern is upright
  vB = rot(aE3.z * QT - th) * rel / S;                 // … and the 매듭 pattern
  vW = w;
  vS = S;
  vLift = lift;
  vK = vec4(aK.xyz, aT.w);

  // ink: 이음 grows in during the second half of sweep 1; it gives way to 매듭 during sweep 2
  bool keep = aK.w > 0.5;
  float gA = smoothstep(0.35, 0.95, p1) * (keep ? 1.0 : 1.0 - smoothstep(0.05, 0.5, p2));
  float gB = keep ? 0.0 : smoothstep(0.5, 0.95, p2);
  vG = vec2(gA, gB);

  // accent: rust threads while a tile turns, and a wake that fades after it lands
  float wake = 0.0;
  float e1 = aE1.x + aE1.y, e2 = aE1.w + aE2.x, es = aE2.z + aE2.w;
  if (abs(aE1.z) > 0.5 && uT > e1) wake = max(wake, exp(-(uT - e1) / 0.45));
  if (abs(aE2.y) > 0.5 && uT > e2) wake = max(wake, exp(-(uT - e2) / 0.45));
  if (abs(aE3.x) > 0.5 && uT > es) wake = max(wake, exp(-(uT - es) / 0.6));
  vAcc = moving > 0.5 ? 0.55 + 0.45 * lift : wake;

  bool show = uMode == 0 ? moving < 0.5 : moving > 0.5;
  float z = uMode == 2 ? 0.5 - 0.4 * lift : 0.0;
  gl_Position = show ? vec4(w.x / 540.0 - 1.0, 1.0 - w.y / 960.0, z, 1.0) : vec4(-2.0, -2.0, 0.0, 1.0);
}`;

export const TILE_FS = `#version 300 es
precision highp float;
in vec2 vL, vA, vB, vW;
in vec2 vG;
in float vS, vLift, vAcc;
flat in vec4 vK;
uniform highp int uMode;
out vec4 o;
${COMMON}
float bitOf(float bits, float k) { return mod(floor(bits / exp2(k)), 2.0); }
float sdBox(vec2 p, float h) { vec2 d = abs(p) - h; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
// exact coverage of a line of width w (px) by a 1-px box filter, d = distance (px) from its centre line
float lineCov(float d, float w) { return clamp(min(d + 0.5 * w, 0.5) - max(d - 0.5 * w, -0.5), 0.0, 1.0); }

float inkSdf(vec2 u, float bits) {
  float e = bitOf(bits, 4.0);
  float d = 1e3;
  vec2 cs[4] = vec2[4](vec2(-0.5, -0.5), vec2(0.5, -0.5), vec2(0.5, 0.5), vec2(-0.5, 0.5));
  for (int k = 0; k < 4; k++) if (abs(bitOf(bits, float(k)) - e) > 0.5) d = min(d, length(u - cs[k]) - 0.5);
  return e > 0.5 ? -d : d;
}
// g = how far the ink has grown in (0 none … 1 settled): eroded and clipped to the tile while it grows, so the
// ink swells out of the corners it belongs to; once settled the clip sits 2.5 px outside the tile (no seam)
float inkCov(vec2 u, float bits, float g) {
  if (g <= 0.001 || bits < 0.5) return 0.0;
  float sd = max(inkSdf(u, bits), sdBox(u, 0.5) - g * 2.5 / vS) + (1.0 - g) * 0.62;
  return clamp(0.5 - sd * vS, 0.0, 1.0);
}
// Smith tile threads: big tiles carry a 3-line ribbon (outer lines finer), small ones a single hairline
float threads(vec2 u, float o, float lev) {
  vec2 c1 = o < 0.5 ? vec2(-0.5, -0.5) : vec2(0.5, -0.5);
  float r1 = length(u - c1), r2 = length(u + c1);
  float w = lev < 0.5 ? 1.25 : lev < 1.5 ? 1.05 : lev < 2.5 ? 1.0 : 0.85;
  float cv = max(lineCov(abs(r1 - 0.5) * vS, w), lineCov(abs(r2 - 0.5) * vS, w));
  if (lev < 1.5) {
    for (int k = 0; k < 2; k++) {
      float R = k == 0 ? 1.0 / 3.0 : 2.0 / 3.0;
      cv = max(cv, 0.7 * max(lineCov(abs(r1 - R) * vS, 0.8 * w), lineCov(abs(r2 - R) * vS, 0.8 * w)));
    }
  }
  return cv;
}

void main() {
  float lev = vK.w;
  if (uMode == 0) {
    float ink = max(inkCov(vA, vK.x, vG.x), inkCov(vB, vK.y, vG.y));
    o = vec4(ink, threads(vL, vK.z, lev), vAcc, 1.0);
  } else if (uMode == 1) {
    float pad = 4.0 + 14.0 * vLift;
    float a = (0.14 + 0.26 * vLift) * (1.0 - smoothstep(-pad, pad, sdBox(vL, 0.5) * vS));
    a *= 1.0 - 0.9 * smoothstep(1590.0, 1870.0, vW.y);
    o = vec4(vec3(0.10, 0.09, 0.12) * a * uFade, a * uFade);
  } else {
    float edge = (0.5 - max(abs(vL.x), abs(vL.y))) * vS;
    float a = clamp(edge + 0.5, 0.0, 1.0);
    float ink = max(inkCov(vA, vK.x, vG.x), inkCov(vB, vK.y, vG.y));
    float thr = threads(vL, vK.z, lev);
    // a card lifted toward the light: a touch brighter, its cut edge catching a little shade
    vec3 pc = paperTex(vL * vS + vK.xy * 37.0) * (1.0 + 0.05 * vLift) * (1.0 - 0.1 * smoothstep(3.0, 0.0, edge));
    vec3 col = mix(pc, INK * (1.0 + 0.12 * vLift), ink);
    vec3 tc = mix(mix(NAVY_T, PAPER, ink), ACCENT, vAcc);
    col = mix(col, tc, thr * (mix(0.34, 0.5, ink) + 0.4 * vAcc));
    col = finish(col, vW);
    o = vec4(col * a, a);
  }
}`;

export const QUAD_VS = `#version 300 es
layout(location=0) in vec2 p;
out vec2 uv;
void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

// 4 bilinear taps: half resolution without aliasing (ink channel only)
export const DOWN_FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D src;
uniform vec2 px;
out vec4 o;
void main() {
  float v = 0.25 * (texture(src, uv + px * vec2(-0.5, -0.5)).r + texture(src, uv + px * vec2(0.5, -0.5)).r
                  + texture(src, uv + px * vec2(-0.5, 0.5)).r + texture(src, uv + px * vec2(0.5, 0.5)).r);
  o = vec4(v, 0.0, 0.0, 1.0);
}`;

// 9-tap gaussian with linear sampling
export const BLUR_FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D src;
uniform vec2 dir;
out vec4 o;
void main() {
  float c = texture(src, uv).r * 0.2270270270;
  c += (texture(src, uv + dir * 1.3846153846).r + texture(src, uv - dir * 1.3846153846).r) * 0.3162162162;
  c += (texture(src, uv + dir * 3.2307692308).r + texture(src, uv - dir * 3.2307692308).r) * 0.0702702703;
  o = vec4(c, 0.0, 0.0, 1.0);
}`;

// the settled layer on paper: ink shadow (blurred ink, offset down-right), a faint bevel on the ink, threads
export const COMP_FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D uLayer, uBlur;
uniform float uFrame;
out vec4 o;
${COMMON}
void main() {
  vec2 q = vec2(gl_FragCoord.x, RES.y - gl_FragCoord.y);
  vec2 px = 1.0 / RES;
  vec4 L = texture(uLayer, uv);
  float sh = texture(uBlur, uv + vec2(-4.0, 7.0) * px).r;
  float bx = texture(uBlur, uv + vec2(3.0, 0.0) * px).r - texture(uBlur, uv - vec2(3.0, 0.0) * px).r;
  float by = texture(uBlur, uv + vec2(0.0, 3.0) * px).r - texture(uBlur, uv - vec2(0.0, 3.0) * px).r;
  float bev = clamp((bx - by) * 1.3, -1.0, 1.0);       // + on edges that face the light (top-left)
  vec3 col = paperTex(q);
  col *= 1.0 - 0.3 * sh * (1.0 - L.r);
  col = mix(col, INK * (1.0 + 0.16 * bev), L.r);
  vec3 tc = mix(mix(NAVY_T, PAPER, L.r), ACCENT, L.b);
  col = mix(col, tc, L.g * (mix(0.34, 0.5, L.r) + 0.4 * L.b));
  col = finish(col, q);
  col += (hash(q + uFrame * 7.31) - 0.5) * 0.012;
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
