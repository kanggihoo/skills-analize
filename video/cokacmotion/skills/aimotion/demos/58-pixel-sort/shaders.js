/*
 * 58 · 정렬된 소란 — GLSL. Every pass draws one full-screen triangle.
 * Working textures are "sort space": texel (s, r) = position s along the sort axis (0..1023), line r across it.
 * Screen-space textures (C, bloom) are stored y-down: row 0 is the top of the stage.
 */

export const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const HEAD = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
out vec4 o;
uint pcg(uint v) { uint s = v * 747796405u + 2891336453u; uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
float hu(uvec2 p) { return float(pcg(p.x + pcg(p.y))) * (1.0 / 4294967296.0); }
// hash of a non-negative integer-valued float
float hi(float x) { return float(pcg(uint(x + 0.5) * 2654435761u + 12345u)) * (1.0 / 4294967296.0); }
float hl(vec2 i) { uvec2 u = uvec2(ivec2(i) + 32768); return float(pcg(u.x + pcg(u.y + 977u))) * (1.0 / 4294967296.0); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hl(i), hl(i + vec2(1, 0)), u.x), mix(hl(i + vec2(0, 1)), hl(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { return 0.5 * vnoise(p) + 0.3 * vnoise(p * 2.07 + 5.3) + 0.2 * vnoise(p * 4.13 + 1.7); }
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
`;

// ------------------------------------------------------------------ the poster, a pure function of (pixel, t)
const POSTER = `
uniform sampler2D T;      // type layers (RGBA8, y-down): r = 소란, g = NOISE, b = small cream type, a = coral rules
uniform float uTime;
uniform vec2 uSo;         // 소란 glyph top / bottom (px) for its fill gradient

const float HZ = 1428.0;  // horizon
const vec3 INK = vec3(0.047, 0.031, 0.094);
const vec3 CREAM = vec3(1.0, 0.953, 0.875);
const vec3 PEACH = vec3(1.0, 0.74, 0.58);
const vec3 CORAL = vec3(1.0, 0.42, 0.38);

// dusk: ink → violet → magenta → coral → amber → apricot at the horizon; luma rises monotonically downward
vec3 sky(float y) {
  vec3 c = vec3(0.031, 0.027, 0.102);
  c = mix(c, vec3(0.106, 0.071, 0.251), clamp(y / 260.0, 0.0, 1.0));
  c = mix(c, vec3(0.204, 0.098, 0.416), clamp((y - 260.0) / 360.0, 0.0, 1.0));
  c = mix(c, vec3(0.369, 0.129, 0.471), clamp((y - 620.0) / 280.0, 0.0, 1.0));
  c = mix(c, vec3(0.690, 0.200, 0.427), clamp((y - 900.0) / 200.0, 0.0, 1.0));
  c = mix(c, vec3(0.918, 0.353, 0.408), clamp((y - 1100.0) / 150.0, 0.0, 1.0));
  c = mix(c, vec3(1.000, 0.553, 0.345), clamp((y - 1250.0) / 110.0, 0.0, 1.0));
  c = mix(c, vec3(1.000, 0.824, 0.604), clamp((y - 1360.0) / 68.0, 0.0, 1.0));
  return c;
}
vec3 sea(float y) {
  vec3 c = vec3(0.114, 0.047, 0.188);
  c = mix(c, vec3(0.071, 0.035, 0.133), clamp((y - HZ) / 212.0, 0.0, 1.0));
  c = mix(c, vec3(0.031, 0.027, 0.102), clamp((y - 1640.0) / 280.0, 0.0, 1.0));
  return c;
}

vec3 poster(vec2 q) {
  vec3 c;
  if (q.y < HZ) {
    c = sky(q.y);
    // thin drifting cloud bands (they are what the column sort combs into vertical streaks)
    float cm = smoothstep(240.0, 560.0, q.y) * (1.0 - smoothstep(1180.0, 1390.0, q.y));
    float n = fbm(vec2(q.x / 560.0 + uTime * 0.012, q.y / 30.0));
    c *= 1.0 - 0.22 * cm * smoothstep(0.5, 0.78, n);
    float n2 = vnoise(vec2(q.x / 300.0 - uTime * 0.02, q.y / 11.0 + 40.0));
    c += vec3(0.11, 0.045, 0.06) * cm * smoothstep(0.68, 0.95, n2);
    // the setting sun
    vec2 d = q - vec2(540.0, HZ);
    float r = length(d);
    float sunK = 1.0 - smoothstep(299.0, 301.0, r);
    float v = clamp(-d.y / 300.0, 0.0, 1.0);
    vec3 sun = mix(vec3(1.0, 0.91, 0.70), vec3(1.0, 0.48, 0.40), v);
    c = mix(c, sun, sunK);
    c += vec3(1.0, 0.45, 0.25) * 0.26 * exp(-max(r - 300.0, 0.0) / 110.0) * (1.0 - sunK);
    // the horizon glint
    c = mix(c, vec3(1.0, 0.95, 0.85), 0.85 * (1.0 - smoothstep(0.5, 2.5, HZ - q.y)));
  } else {
    c = sea(q.y);
    // broken reflections of the sun, one per 7-px lane, narrowing toward the viewer
    float ry = q.y - HZ;
    float lane = floor(ry / 7.0);
    float line = 1.0 - smoothstep(1.4, 2.8, ry - lane * 7.0);
    float w = 320.0 * max(1.0 - ry / 230.0, 0.0) + 24.0;
    float drift = (hi(lane + 300.0) - 0.5) * 2.0;
    float nb = vnoise(vec2(q.x / 34.0 + lane * 13.1 + uTime * 0.5 * drift, lane * 7.3));
    float on = smoothstep(0.42, 0.5, nb) * (1.0 - smoothstep(w - 30.0, w, abs(q.x - 540.0)));
    vec3 refl = mix(vec3(1.0, 0.86, 0.62), vec3(1.0, 0.45, 0.42), clamp(ry / 200.0, 0.0, 1.0));
    c = mix(c, refl, line * on * exp(-ry / 150.0) * 0.9);
  }
  // paper-like grain, fixed in poster space (an animated grain would make the sort shimmer)
  c *= 1.0 + 0.05 * (hu(uvec2(max(q, 0.0))) - 0.5);
  // type
  vec4 tx = texture(T, q / vec2(1080.0, 1920.0));
  c = mix(c, mix(CREAM, PEACH, smoothstep(uSo.x, uSo.y, q.y)), tx.r);
  c = mix(c, CREAM * 0.93, tx.b * 0.88);
  c = mix(c, CORAL, tx.a * 0.9);
  c = mix(c, INK, tx.g);
  return c;
}
`;

// ------------------------------------------------------------------ which pixels may move: luma window × choreographed gate
const GATE = `
uniform int uAxis;        // 0 = rows (sort along x), 1 = columns (sort along y, downward)
uniform float uM;         // lines across the sort axis
uniform vec2 uWin;        // luma window [lo, hi]
uniform float uDrip;      // columns: how far the melt front has run
uniform vec4 uRow;        // rows: active fraction, segment openness, full melt, fraction of bands sorted descending
uniform vec4 uSweep;      // rows: restore sweep (0..1 of height), afterglow band y0, y1, band-only flag

bool gate(float s, float r) {
  float u = (s + 0.5) / 1024.0;                 // position along the sort axis, 0..1
  if (uAxis == 1) {
    // columns: every column has its own melt front (jagged, a few long drips); spans end at the front
    float x = r / uM;
    float cn = 0.55 * vnoise(vec2(x * 11.0, 3.1)) + 0.3 * vnoise(vec2(x * 47.0, 8.7)) + 0.15 * hi(r);
    float front = 0.19 + 0.59 * clamp(uDrip * (0.45 + 0.9 * cn) - 0.12 * hi(r + 91.0), 0.0, 1.0);
    return u < front;
  }
  float yf = (r + 0.5) / uM;
  if (uSweep.w > 0.5) return yf > uSweep.y && yf < uSweep.z;          // afterglow: one band only
  if (yf < uSweep.x - 0.035 * hi(r + 5000.0)) return false;            // rows the sweep has restored
  float sb = floor(r / 48.0);
  float bh = hi(sb + 3.0) < 0.5 ? 3.0 : 10.0;                          // fine or coarse bands
  float band = floor(r / bh) + sb * 97.0;
  if (hi(band + 7000.0) > uRow.x) return false;
  float r0 = hi(band + 11.0), r1 = hi(band + 2300.0), r2 = hi(band + 4100.0);
  float L = mix(0.16 + 0.5 * r1, 1.2, uRow.y);
  float c = r0 + 0.14 * sin(uTime * (1.1 + 1.9 * r2) + 6.2832 * r2);  // segments drift
  float g0 = mix(c - 0.5 * L, -1.0, uRow.z), g1 = mix(c + 0.5 * L, 2.0, uRow.z);
  return u > g0 && u < g1;
}
bool lineDesc(float r) {
  if (uAxis == 1) return false;
  return hi(floor(r / 16.0) + 71.0) < uRow.w;
}
// stage px (y-down) of a working texel centre, and back
vec2 toScreen(vec2 sr) {
  return uAxis == 0 ? vec2(sr.x * (1080.0 / 1024.0), sr.y * (1920.0 / uM)) : vec2(sr.y * (1080.0 / uM), sr.x * (1920.0 / 1024.0));
}
vec2 toWork(vec2 q) {
  return uAxis == 0 ? vec2(q.x * (1024.0 / 1080.0), q.y * (uM / 1920.0)) : vec2(q.y * (1024.0 / 1920.0), q.x * (uM / 1080.0));
}
`;

// 1. the poster at working resolution; alpha = 1 where the pixel belongs to a span
export const BASE = HEAD + POSTER + GATE + `
void main() {
  vec2 sr = gl_FragCoord.xy;
  vec3 c = poster(toScreen(sr));
  float l = luma(c);
  bool inS = l >= uWin.x && l <= uWin.y && gate(floor(sr.x), floor(sr.y));
  o = vec4(c, inS ? 1.0 : 0.0);
}`;

// 2. span starts: m[x] = x where a span begins or the pixel stays put, else -1; first radix-4 prefix-max step fused in
export const MASK = HEAD + `
uniform sampler2D B;
float inAt(int x, int y) { return x < 0 ? 0.0 : texelFetch(B, ivec2(x, y), 0).a; }
float mAt(int x, int y) {
  if (x < 0) return -1.0;
  bool a = inAt(x, y) > 0.5, p = inAt(x - 1, y) > 0.5;
  return (!a || !p) ? float(x) : -1.0;
}
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  float m = max(max(mAt(p.x, p.y), mAt(p.x - 1, p.y)), max(mAt(p.x - 2, p.y), mAt(p.x - 3, p.y)));
  o = vec4(m, 0.0, 0.0, 1.0);
}`;

// 3. radix-4 prefix max: after the pass with stride d, x holds max over [x - 4d + 1, x]
export const SCAN = HEAD + `
uniform sampler2D P;
uniform int d;
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  float m = texelFetch(P, p, 0).x;
  for (int k = 1; k < 4; k++) { int x = p.x - k * d; if (x >= 0) m = max(m, texelFetch(P, ivec2(x, p.y), 0).x); }
  o = vec4(m, 0.0, 0.0, 1.0);
}`;

// 4. last prefix step (d = 256) fused with the key:
//    in a span:  key = spanStart·1024 + luma10   (luma10 = 1023 − luma10 for a descending line)
//    otherwise:  key = x·1024 + 1023
//    Every key < 2^20, exact in float32. Segment [s, e] owns keys [s·1024, s·1024 + 1023]; segments tile 0..1023 in
//    order, so exactly s keys are smaller than s·1024: a full-row sort puts each span back on [s, e], sorted inside,
//    and every pixel outside a span back on its own x.
export const KEY = HEAD + GATE.replace(/bool gate[\s\S]*?\n}\n/, '') + `
uniform sampler2D P, B;
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  float st = texelFetch(P, p, 0).x;
  for (int k = 1; k < 4; k++) { int x = p.x - k * 256; if (x >= 0) st = max(st, texelFetch(P, ivec2(x, p.y), 0).x); }
  vec4 b = texelFetch(B, p, 0);
  float lq = floor(clamp(luma(b.rgb), 0.0, 1.0) * 1023.0 + 0.5);
  if (lineDesc(float(p.y))) lq = 1023.0 - lq;
  float key = b.a > 0.5 ? st * 1024.0 + lq : float(p.x) * 1024.0 + 1023.0;
  o = vec4(key, b.rgb);
}`;

// 5a. one bitonic compare-exchange step (stage k, distance j ≥ 8). Ties keep their own element, so both
//     fragments of a pair make the same swap decision and the pass is always a permutation.
export const STEP = HEAD + `
uniform sampler2D S;
uniform int k, j;
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  int i = p.x, l = i ^ j;
  vec4 a = texelFetch(S, p, 0), b = texelFetch(S, ivec2(l, p.y), 0);
  bool up = (i & k) == 0;
  bool keepMin = up == (i < l);
  o = keepMin ? (b.x < a.x ? b : a) : (b.x > a.x ? b : a);
}`;

// 5b/5c. the last three steps of a stage (j = 4, 2, 1) stay inside an aligned group of 8: each fragment loads its
//        group, runs that part of the network in registers and keeps its own slot (3 passes → 1).
const LOCAL8 = `
uniform sampler2D S;
void ce(inout vec4 a, inout vec4 b, bool up) { if (up ? a.x > b.x : a.x < b.x) { vec4 t = a; a = b; b = t; } }
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  int base = p.x & ~7, m = p.x & 7;
  vec4 v0 = texelFetch(S, ivec2(base, p.y), 0), v1 = texelFetch(S, ivec2(base + 1, p.y), 0);
  vec4 v2 = texelFetch(S, ivec2(base + 2, p.y), 0), v3 = texelFetch(S, ivec2(base + 3, p.y), 0);
  vec4 v4 = texelFetch(S, ivec2(base + 4, p.y), 0), v5 = texelFetch(S, ivec2(base + 5, p.y), 0);
  vec4 v6 = texelFetch(S, ivec2(base + 6, p.y), 0), v7 = texelFetch(S, ivec2(base + 7, p.y), 0);
  PRE
  bool up = (base & KBIT) == 0;
  ce(v0, v4, up); ce(v1, v5, up); ce(v2, v6, up); ce(v3, v7, up);
  ce(v0, v2, up); ce(v1, v3, up); ce(v4, v6, up); ce(v5, v7, up);
  ce(v0, v1, up); ce(v2, v3, up); ce(v4, v5, up); ce(v6, v7, up);
  vec4 r = v0;
  if (m == 1) r = v1; else if (m == 2) r = v2; else if (m == 3) r = v3;
  else if (m == 4) r = v4; else if (m == 5) r = v5; else if (m == 6) r = v6; else if (m == 7) r = v7;
  o = r;
}`;
// stages k = 2, 4, 8 in one pass (directions inside the group follow bits 1 and 2 of the index)
export const PRE8 = HEAD + LOCAL8.replace('PRE', `
  ce(v0, v1, true); ce(v2, v3, false); ce(v4, v5, true); ce(v6, v7, false);
  ce(v0, v2, true); ce(v1, v3, true); ce(v4, v6, false); ce(v5, v7, false);
  ce(v0, v1, true); ce(v2, v3, true); ce(v4, v5, false); ce(v6, v7, false);`).replace('KBIT', '8');
export const MRG8 = HEAD + `uniform int k;\n` + LOCAL8.replace('PRE', '').replace('KBIT', 'k');

// 6. composite at full resolution: crisp poster where nothing moved, the sorted texture inside spans
export const COMP = HEAD + POSTER + GATE.replace(/bool gate[\s\S]*?\n}\n/, '') + `
uniform sampler2D S;
uniform int uUse;
void main() {
  vec2 q = gl_FragCoord.xy;                      // C is stored y-down: this is the stage pixel
  vec3 col = poster(q);
  float st = 0.0;
  if (uUse == 1) {
    vec2 w = toWork(q);
    int M = int(uM + 0.5);
    int r = clamp(int(w.y), 0, M - 1);
    float sf = w.x - 0.5, fl = floor(sf);
    int s0 = clamp(int(fl), 0, 1023), s1 = clamp(int(fl) + 1, 0, 1023);
    float f = clamp(sf - fl, 0.0, 1.0);
    vec4 A0 = texelFetch(S, ivec2(s0, r), 0), A1 = texelFetch(S, ivec2(s1, r), 0);
    int sn = f < 0.5 ? s0 : s1;
    vec4 An = f < 0.5 ? A0 : A1;
    // an unmoved pixel still carries its own key x·1024 + 1023
    if (An.x != float(sn) * 1024.0 + 1023.0) { col = mix(A0.yzw, A1.yzw, f); st = 1.0; }
  }
  o = vec4(col, st);
}`;

// 7. bloom: bright pass (streaks glow more) at quarter resolution, separable blur
export const DOWN = HEAD + `
uniform sampler2D C;
void main() {
  vec2 res = vec2(1080.0, 1920.0), c = gl_FragCoord.xy * 4.0;
  vec4 a = texture(C, (c + vec2(-1.0, -1.0)) / res) + texture(C, (c + vec2(1.0, -1.0)) / res)
         + texture(C, (c + vec2(-1.0, 1.0)) / res) + texture(C, (c + vec2(1.0, 1.0)) / res);
  a *= 0.25;
  float l = luma(a.rgb);
  o = vec4(a.rgb * smoothstep(0.6, 1.0, l) * (0.3 + 1.1 * a.a), 1.0);   // streaks glow, the clean poster barely
}`;
export const BLUR = HEAD + `
uniform sampler2D B;
uniform vec2 dir;
void main() {
  vec2 res = vec2(textureSize(B, 0));
  vec2 uv = gl_FragCoord.xy / res, dd = dir / res;
  vec3 s = texture(B, uv).rgb * 0.2270;
  s += (texture(B, uv + dd * 1.3846).rgb + texture(B, uv - dd * 1.3846).rgb) * 0.3162;
  s += (texture(B, uv + dd * 3.2308).rgb + texture(B, uv - dd * 3.2308).rgb) * 0.0703;
  o = vec4(s, 1.0);
}`;

// 8. to the screen: tearing, chromatic offset (stronger on streaks), bloom, restore beam, scanlines, grain, vignette
export const OUT = HEAD + `
uniform sampler2D C, Bl;
uniform float uChroma, uTear, uSeed, uScan, uGrain, uBloom, uExpo, uBeam, uBeamY, uFlash;
void main() {
  vec2 res = vec2(1080.0, 1920.0);
  vec2 q = vec2(gl_FragCoord.x, 1920.0 - gl_FragCoord.y);
  float band = floor(q.y / 22.0);
  float shift = uTear * step(0.64, hi(band + uSeed * 131.0)) * (hi(band + uSeed * 17.0 + 3.0) - 0.5) * 150.0;
  q.x += shift;
  vec2 uv = q / res;
  vec4 c0 = texture(C, uv);
  float d = (uChroma * (0.3 + 0.7 * c0.a) + abs(shift) * 0.12) / 1080.0;
  vec3 col = vec3(texture(C, uv + vec2(d, 0.0)).r, c0.g, texture(C, uv - vec2(d, 0.0)).b);
  col += texture(Bl, uv).rgb * uBloom;
  float by = abs(q.y - uBeamY);
  col += vec3(1.0, 0.93, 0.85) * uBeam * (0.5 * exp(-by / 1.6) + 0.13 * exp(-by / 34.0));
  col *= 1.0 - uScan * 0.16 * (0.5 + 0.5 * cos(q.y * 6.2831853 / 6.0));
  col += uFlash * vec3(1.0, 0.9, 0.85);
  vec2 v = (gl_FragCoord.xy / res - 0.5) * vec2(1.0, 1.15);
  col *= 1.0 - 0.34 * smoothstep(0.1, 0.42, dot(v, v));
  col += (hu(uvec2(gl_FragCoord.xy) + uvec2(uint(uSeed) * 7919u, uint(uSeed) * 104729u)) - 0.5) * uGrain;
  o = vec4(clamp(col * uExpo, 0.0, 1.0), 1.0);
}`;
