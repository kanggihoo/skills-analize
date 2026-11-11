/*
 * shaders.js — 62 · 김 서린 창
 *   BOKEH  (setup) the night city behind the glass, defocused: hash-grid layers of polygonal-aperture discs
 *          (each pixel sums the 3×3 neighbouring cells), sodium / warm / cool LED lights; `focus` shrinks the
 *          discs for the image a drop forms (a drop is a strong lens: its tiny image of the city is nearly sharp)
 *   DOWN / BLUR (setup) the blur pyramid the fog mixes through: half res σ≈14 px, quarter res σ≈50 px
 *   WIPE   (per frame) instanced capsules for every finger segment and drop trail drawn by time t, MAX-blended:
 *          R = clearness now (after refog), G = ever wiped (wet film), B = water ridge at the stroke edge, A = trail
 *   DROP   (per frame) instanced droplets → height field (MAX-blended), G = radius
 *   COMP   fog density × blur pyramid, fog veil and grain, the moving lights, droplets refracting the city
 *          (inverted image from the height-field normal, dark rim, lamp highlight)
 *   FINISH bloom from the mip chain, tone map, vignette, grain, fade
 * Stage px, y down. Render targets are addressed with gl_FragCoord (y up): rtUV() converts.
 */

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
float hash12(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vnoise(vec2 x) {
  vec2 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), f.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), f.x), f.y);
}
float pw(float x, float k) { return exp2(k * log2(max(x, 1e-6))); }
`;

// 7-blade aperture with slightly curved blades: boundary radius factor at the angle of q (≤ 1)
const APERTURE = `
float apertureR(vec2 q) {
  float a = atan(q.y, q.x) + 0.35;
  const float seg = 6.2831853 / 7.0;
  float k = cos(seg * 0.5) / cos(mod(a, seg) - seg * 0.5);
  return mix(1.0, k, 0.6);
}`;

export const BOKEH = HEAD + APERTURE + `
out vec4 o;
uniform vec2 stage;
uniform float focus, scale;      // scale: stage px per texel of the target (1 = full res)
vec3 lightCol(float h) {
  if (h < 0.44) return vec3(1.0, 0.50, 0.15);    // sodium street lights
  if (h < 0.68) return vec3(1.0, 0.77, 0.50);    // warm windows
  if (h < 0.93) return vec3(0.58, 0.74, 1.0);    // cool LED
  if (h < 0.968) return vec3(1.0, 0.16, 0.10);   // tail lights, signals
  return vec3(0.35, 1.0, 0.78);
}
// sky above the horizon (few lights), the city below with streets as denser bands
float g2(float x) { return exp(-x * x); }
float cityDensity(float y) {
  float city = smoothstep(430.0, 660.0, y);
  float streets = 0.7 + 0.3 * sin(y * 0.0105 + 1.3) + 0.25 * g2((y - 1380.0) / 90.0) + 0.2 * g2((y - 980.0) / 70.0);
  return 0.05 + city * streets;
}
// band > 0: the layer lives only along the horizon (decided per cell, never per pixel — a disc is never cut)
vec3 layer(vec2 p, float cell, float prob, float r0, float r1, float I, float sd, float band) {
  vec2 b = floor(p / cell);
  vec3 sum = vec3(0.0);
  // a disc sits ≤ 0.4 cell from its cell centre with radius ≤ cell, so it can reach into the neighbouring
  // cells: every pixel sums the 3×3 cells around its own
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = b + vec2(float(i), float(j));
    vec2 c = (id + 0.5 + (vec2(hash12(id + sd + 3.1), hash12(id + sd + 7.9)) - 0.5) * 0.8) * cell;
    float pr = prob * cityDensity(c.y) * (band > 0.0 ? 2.0 * g2((c.y - 640.0) / 70.0) : 1.0);
    if (hash12(id + sd) > pr) continue;
    float r = mix(r0, r1, hash12(id + sd + 1.7)) * focus;
    vec2 q = p - c;
    float L = length(q);
    if (L > r + 3.0) continue;
    float sdv = L - r * apertureR(q);
    float aa = 0.9 * scale;
    float inside = smoothstep(aa, -aa, sdv);
    float rim = 1.0 + 0.32 * smoothstep(-0.2 * r, 0.0, sdv) * smoothstep(0.5, -0.5, sdv);
    float onion = 1.0 + 0.035 * sin(L / max(r, 1.0) * 29.0 + hash12(id + sd) * 6.0);
    float e = I * (0.3 + 0.7 * hash12(id + sd + 5.3)) / max(focus, 0.4);
    sum += lightCol(hash12(id + sd + 9.1)) * e * inside * rim * onion;
  }
  return sum;
}
void main() {
  vec2 p = vec2(gl_FragCoord.x, stage.y / scale - gl_FragCoord.y) * scale;
  // night sky → light-polluted horizon haze → the dark mass of the city
  float y = p.y;
  vec3 col = mix(vec3(0.004, 0.007, 0.018), vec3(0.030, 0.026, 0.040), smoothstep(0.0, 520.0, y));
  col += vec3(0.060, 0.034, 0.022) * g2((y - 590.0) / 120.0);
  col = mix(col, vec3(0.012, 0.011, 0.016) + vec3(0.02, 0.012, 0.008) * vnoise(p * 0.004), smoothstep(600.0, 760.0, y));
  col += layer(p, 18.0, 0.5, 3.5, 6.5, 2.2, 11.0, 1.0);    // a carpet of far lights on the horizon
  col += layer(p, 38.0, 0.42, 9.0, 16.0, 1.35, 23.0, 0.0);
  col += layer(p, 92.0, 0.42, 22.0, 40.0, 1.0, 47.0, 0.0);
  col += layer(p, 220.0, 0.36, 52.0, 92.0, 0.5, 71.0, 0.0);
  o = vec4(col, 1.0);
}`;

export const DOWN = HEAD + `
out vec4 o;
uniform sampler2D src;
void main() {
  vec2 px = 1.0 / vec2(textureSize(src, 0));
  vec2 uv = gl_FragCoord.xy / vec2(textureSize(src, 0)) * 2.0;    // this target is half the source size
  o = 0.25 * (texture(src, uv + px * vec2(-0.5, -0.5)) + texture(src, uv + px * vec2(0.5, -0.5)) + texture(src, uv + px * vec2(-0.5, 0.5)) + texture(src, uv + px * vec2(0.5, 0.5)));
}`;

export const BLUR = HEAD + `
out vec4 o;
uniform sampler2D src;
uniform vec2 dir;          // one texel along x or y
uniform float sigma;       // texels
void main() {
  vec2 uv = gl_FragCoord.xy / vec2(textureSize(src, 0));
  vec4 acc = vec4(0.0);
  float wsum = 0.0;
  for (int i = -20; i <= 20; i++) {
    float x = float(i) * sigma / 7.0;           // 41 taps over ±2.9σ
    float w = exp(-0.5 * (x / sigma) * (x / sigma));
    acc += texture(src, uv + dir * x) * w;
    wsum += w;
  }
  o = acc / wsum;
}`;

// ------------------------------------------------------------------ per frame: finger strokes and drop trails
export const WIPE_VS = `#version 300 es
layout(location = 0) in vec2 corner;
layout(location = 1) in vec4 seg;     // x0, y0, x1, y1 (stage px)
layout(location = 2) in vec4 info;    // t0, t1, radius, kind (0: first word, 1: second word, 2: drop trail)
uniform vec2 stage;
uniform float t;
out vec2 vP;
flat out vec4 vSeg;
flat out vec4 vInfo;
void main() {
  vInfo = info; vSeg = vec4(0.0); vP = vec2(0.0);
  if (t < info.x) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }        // not drawn yet
  float f = clamp((t - info.x) / max(info.y - info.x, 1e-4), 0.0, 1.0);      // the finger is part-way along
  vec2 a = seg.xy, b = mix(seg.xy, seg.zw, f);
  float ext = info.z + 14.0;
  vec2 d = b - a;
  float L = length(d);
  vec2 u = L > 1e-3 ? d / L : vec2(1.0, 0.0), n = vec2(-u.y, u.x);
  vec2 p = (corner.x < 0.0 ? a - u * ext : b + u * ext) + n * corner.y * ext;
  vP = p; vSeg = vec4(a, b);
  gl_Position = vec4(p.x / stage.x * 2.0 - 1.0, 1.0 - p.y / stage.y * 2.0, 0.0, 1.0);
}`;

export const WIPE_FS = HEAD + `
in vec2 vP;
flat in vec4 vSeg;
flat in vec4 vInfo;
uniform float t, rf0, rfSpan, rfLag;
uniform vec3 keep;         // how far each kind fogs over at the end (first word, second word, trails)
out vec4 o;
float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}
float refog(float kind, float tw) {
  if (kind < 1.5) {
    float s = rf0 + rfLag * (tw - 2.0);          // what was written first fogs over first
    return smoothstep(s, s + rfSpan, t) * (kind < 0.5 ? keep.x : keep.y);
  }
  // trails mist over within a few seconds, and with everything else at the end
  return max(smoothstep(tw + 1.2, tw + 4.2, t) * 0.85, smoothstep(rf0, rf0 + rfSpan, t) * keep.z);
}
void main() {
  float d = segDist(vP, vSeg.xy, vSeg.zw);
  float r = vInfo.z, kind = vInfo.w;
  bool trail = kind > 1.5;
  float soft = trail ? 1.6 : 4.5;
  float fall = 1.0 - smoothstep(r - soft, r + soft * 0.6, d);
  float x = (d - r - 4.0) / 3.6;
  float rim = trail ? 0.0 : exp(-x * x);
  float rf = refog(kind, vInfo.x);
  o = vec4(fall * (1.0 - rf), fall, rim * (1.0 - rf), trail ? fall * (1.0 - rf) : 0.0);
}`;

// ------------------------------------------------------------------ per frame: droplets → height field
export const DROP_VS = `#version 300 es
layout(location = 0) in vec2 corner;
layout(location = 1) in vec4 drop;    // x, y, radius, stretch (sliding drops are longer)
uniform vec2 stage;
out vec2 vQ;
flat out vec4 vD;
void main() {
  vD = drop;
  vec2 ext = vec2(drop.z, drop.z * drop.w) + 1.5;
  vQ = corner * ext;
  if (drop.z < 0.35) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  vec2 p = drop.xy + vQ;
  gl_Position = vec4(p.x / stage.x * 2.0 - 1.0, 1.0 - p.y / stage.y * 2.0, 0.0, 1.0);
}`;

export const DROP_FS = `#version 300 es
precision highp float;
in vec2 vQ;
flat in vec4 vD;
out vec4 o;
void main() {
  float r = vD.z, s = vD.w;
  vec2 q = vQ / vec2(r, r * s);
  q.x /= max(1.0 + min(q.y, 0.0) * (s - 1.0) * 0.9, 0.3);    // a sliding drop narrows above its centre: a teardrop
  float d2 = dot(q, q);
  if (d2 >= 1.0) discard;
  o = vec4(r * 0.62 * sqrt(1.0 - d2), r, 0.0, 1.0);          // a flattened spherical cap, its radius for the lens
}`;

// ------------------------------------------------------------------ the frame
export const NLIGHT = 5;
export const COMP = HEAD + APERTURE + `
out vec4 o;
uniform sampler2D bgC, bgM, bgF, bgD, wipeT, dropT, fogMap;
uniform vec2 stage, par, lamp;
uniform float t, onsetT, onsetRise, lensK, fogK;
uniform vec4 al[${NLIGHT}];      // moving lights: x, y, radius, intensity
uniform vec3 alc[${NLIGHT}];
vec2 rtUV(vec2 p) { return vec2(p.x / stage.x, 1.0 - p.y / stage.y); }
void main() {
  vec2 p = vec2(gl_FragCoord.x, stage.y - gl_FragCoord.y);
  vec2 bp = p + par;                                   // the city sits far behind the glass: parallax

  // ---- condensation: onset map (edges and bottom first), thickness variation, a fine static grain
  vec4 fm = texture(fogMap, p / stage);
  float onset = fm.r * onsetT;
  float fog = smoothstep(onset, onset + onsetRise, t) * fogK;
  fog *= 0.80 + 0.32 * fm.g;
  float grain = 0.55 * vnoise(p * 0.75) + 0.3 * vnoise(p * 0.23 + 9.0) + 0.15 * vnoise(p * 0.07 + 3.0);

  // ---- what the finger and the running drops cleared (refog already applied per stroke)
  vec4 w = texture(wipeT, rtUV(p));
  float clear = w.r, film = w.g, trail = w.a;
  // fog grows back in patches, not as a uniform veil: half-refogged strokes are modulated by the film noise
  clear = clamp(clear * (1.0 + 1.4 * (fm.b - 0.5) * (1.0 - clear)) + 0.25 * (grain - 0.5) * clear * (1.0 - clear), 0.0, 1.0);
  float rim = clamp(w.b - w.g * 0.95, 0.0, 1.0);       // the water ridge just outside the stroke
  float f = fog * (1.0 - clear * (0.97 - 0.12 * fm.b));
  f = clamp(f + rim * 0.4 * fog, 0.0, 1.0);
  // a cleared stroke is a wet film, not dry glass: it wobbles the view a little and keeps a faint streaky haze
  float streak = vnoise(vec2(p.x * 0.35, p.y * 0.02) + 4.0);
  f = max(f, film * fog * 0.07 * streak * (1.0 - trail));
  vec2 wob = (vec2(vnoise(p * 0.035), vnoise(p * 0.035 + 17.0)) - 0.5) * 5.0 * film;

  // ---- the city through the glass: sharp where clear, the blur pyramid through the fog
  vec3 cC = texture(bgC, rtUV(bp + wob)).rgb;
  vec3 cM = texture(bgM, rtUV(bp)).rgb;
  vec3 cF = texture(bgF, rtUV(bp)).rgb;
  vec3 bg = mix(mix(cC, cM, smoothstep(0.0, 0.42, f)), cF, smoothstep(0.32, 0.95, f));
  // moving lights (cars on the streets below, a blinking mast light): their discs spread with the fog
  for (int i = 0; i < ${NLIGHT}; i++) {
    vec4 L = al[i];
    if (L.w <= 0.0) continue;
    float re = L.z + 80.0 * f;
    vec2 q = bp - L.xy;
    if (dot(q, q) > (re + 4.0) * (re + 4.0)) continue;
    float sdv = length(q) - re * mix(apertureR(q), 1.0, f);
    float soft = mix(0.9, re * 0.6, f);
    bg += alc[i] * L.w * (L.z * L.z) / (re * re) * smoothstep(soft, -soft, sdv);
  }

  // ---- the fog itself: absorbs a little, scatters the city glow (veil) and the warm room lamp, grainy
  vec2 lq = (p - lamp) / vec2(560.0, 640.0);
  float lampI = exp(-dot(lq, lq) * 1.6);
  vec3 veil = cF * 0.6 + vec3(0.024, 0.024, 0.028) + vec3(0.085, 0.060, 0.036) * lampI;
  vec3 col = bg * (1.0 - 0.42 * f) + veil * f * (0.8 + 0.3 * grain);
  // faint sparkle of the larger micro-droplets in thick fog
  col += cF * f * f * smoothstep(0.78, 0.98, vnoise(p * 0.9 + 31.0)) * 0.6;
  // the room's lamp reflected in the clear glass
  col += vec3(0.030, 0.022, 0.014) * lampI * (1.0 - f);

  // ---- droplets: refraction from the height-field normal (an inverted, wide image of the city), dark rim, highlight
  ivec2 qq = ivec2(gl_FragCoord.xy), mx = textureSize(dropT, 0) - 1;
  vec4 dc = texelFetch(dropT, qq, 0);
  if (dc.r > 0.0) {
    float hx = texelFetch(dropT, min(qq + ivec2(1, 0), mx), 0).r - texelFetch(dropT, max(qq - ivec2(1, 0), ivec2(0)), 0).r;
    float hy = texelFetch(dropT, max(qq - ivec2(0, 1), ivec2(0)), 0).r - texelFetch(dropT, min(qq + ivec2(0, 1), mx), 0).r;
    vec3 n = normalize(vec3(-0.5 * hx, -0.5 * hy, 1.0));
    float r = dc.g;
    vec3 inside = texture(bgD, rtUV(bp - n.xy * r * lensK)).rgb;
    float nl = length(n.xy);
    vec3 dcol = inside * (1.0 - 0.85 * smoothstep(0.5, 0.96, nl));
    dcol += cF * 0.5 * smoothstep(0.45, 0.9, nl) * clamp(n.y * 1.4, 0.0, 1.0);          // city glow gathered in the lower rim
    vec3 H = normalize(normalize(vec3(-0.45, -0.6, 0.66)) + vec3(0.0, 0.0, 1.0));
    dcol += vec3(1.0, 0.85, 0.66) * pw(max(dot(n, H), 0.0), 120.0) * (0.9 + 1.4 * lampI);   // the lamp behind the viewer
    float a = smoothstep(0.0, 0.42, dc.r);
    col = mix(col, dcol, a);
  }
  o = vec4(min(col, vec3(12.0)), 1.0);
}`;

export const FINISH = HEAD + `
out vec4 o;
uniform sampler2D img;
uniform vec2 stage;
uniform float frameNo, fade;
void main() {
  vec2 px = gl_FragCoord.xy, uv = px / stage;
  vec3 c = textureLod(img, uv, 0.0).rgb;
  vec3 b = textureLod(img, uv, 2.0).rgb * 0.3 + textureLod(img, uv, 3.5).rgb * 0.35 + textureLod(img, uv, 5.0).rgb * 0.35;
  c += max(b - 0.5, 0.0) * 0.5 + b * 0.05;
  c = 1.0 - exp(-c * 1.15);
  c = pow(max(c, 0.0), vec3(1.0 / 2.2));
  vec2 q = uv - 0.5;
  float vg = clamp(length(q * vec2(1.1, 0.8)) * 1.3, 0.0, 1.0);
  c *= 1.0 - 0.5 * vg * vg * vg;
  c *= fade;
  c += (hash12(px + frameNo * 7.13) - 0.5) / 255.0 * 2.0;
  o = vec4(max(c, 0.0), 1.0);
}`;
