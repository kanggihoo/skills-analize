/*
 * shaders.js — every GLSL program of 149 (three.js ShaderMaterial, GLSL ES 3.0 through three's prefix).
 *
 *   LIGHT    the toon lighting model shared by every lit surface: three lights (cool sky key, warm street lamp,
 *            warm headlight pair), each turned into a scalar "how much light arrives" x, and x is pushed through
 *            ONE stepped ramp (0 · mid · full). Received shadows multiply x before the ramp, so they are
 *            quantised into the same bands. Rim (fresnel) and wet specular are stepped the same way.
 *   TOON_*   the surface material (vertex-colour albedo; flags in aEmit/aMat: foliage, windows, printed signs)
 *   LINE_*   the inverted hull: back faces pushed out along a smoothed normal by a fixed number of PIXELS
 *            (the offset is scaled by clip.w, so the line keeps its screen thickness at any depth)
 *   ROAD_* / WALK_*  ground: wet asphalt with puddles (planar reflection, rippled and posterised), wet tiles
 *   SKY_*, RAIN_*, SPLASH_*, HALO_*, BEAM_*, VIG_*   the rest of the frame
 */

// --------------------------------------------------------------------------------------------- shared lighting
export const LIGHT = /* glsl */ `
uniform vec3 uAmbSky, uAmbGround;
uniform vec3 uMoonDir, uMoonCol;  uniform sampler2D uMoonMap; uniform mat4 uMoonVP;
uniform vec3 uLampPos, uLampDir, uLampCol, uLampCone; uniform float uLampK; uniform sampler2D uLampMap; uniform mat4 uLampVP;
uniform vec3 uHeadA, uHeadB, uHeadDir, uHeadCol, uHeadCone; uniform float uHeadK; uniform sampler2D uHeadMap; uniform mat4 uHeadVP;
uniform vec4 uBand;      // threshold 1, threshold 2, level of the middle band, edge half-width in pixels
uniform vec4 uRim;       // rim gain: sky key, lamp, headlights; fresnel threshold
uniform vec3 uFogCol;
uniform vec2 uFog;       // density, extra density near the ground
uniform vec3 uTexel;     // 1 / shadow-map size: key, lamp, headlights

// a step whose edge is one screen pixel wide: hard cel edge without stair-steps
float aaStep(float e, float x) {
  float w = max(fwidth(x) * uBand.w, 1e-5);
  return smoothstep(e - w, e + w, x);
}
// THE light ramp: x (light arriving) -> 0, mid or 1
float ramp(float x) {
  return uBand.z * aaStep(uBand.x, x) + (1.0 - uBand.z) * aaStep(uBand.y, x);
}
// shadow map test with a 2x2 bilinear compare (a smooth 1-texel penumbra the ramp then cuts into a clean line)
float shadowAt(sampler2D map, mat4 vp, vec3 wp, float texel, float bias) {
  vec4 c = vp * vec4(wp, 1.0);
  if (c.w <= 0.0) return 1.0;
  vec3 p = c.xyz / c.w * 0.5 + 0.5;
  if (p.x <= 0.0 || p.x >= 1.0 || p.y <= 0.0 || p.y >= 1.0 || p.z >= 1.0) return 1.0;
  vec2 st = p.xy / texel - 0.5;
  vec2 i = floor(st), f = st - i;
  vec2 uv = (i + 0.5) * texel;
  float z = p.z - bias;
  float a = step(z, texture2D(map, uv).r);
  float b = step(z, texture2D(map, uv + vec2(texel, 0.0)).r);
  float c2 = step(z, texture2D(map, uv + vec2(0.0, texel)).r);
  float d = step(z, texture2D(map, uv + vec2(texel)).r);
  return mix(mix(a, b, f.x), mix(c2, d, f.x), f.y);
}
// spot light: cone (cos outer -> cos inner) x inverse-square-ish falloff (range = cone.z)
float spotTerm(vec3 pos, vec3 dir, vec3 cone, vec3 wp, out vec3 L) {
  vec3 d = pos - wp;
  float dist = length(d);
  L = d / max(dist, 1e-4);
  float c = smoothstep(cone.x, cone.y, dot(-L, dir));
  return c / (1.0 + dist * dist / (cone.z * cone.z));
}
vec3 fogIt(vec3 c, vec3 wp) {
  float d = length(wp - cameraPosition);
  float f = 1.0 - exp(-d * (uFog.x + uFog.y * exp(-max(wp.y, 0.0) * 0.35)));
  return mix(c, uFogCol, clamp(f, 0.0, 1.0));
}

struct Toon { vec3 light; vec3 add; float dark; float lamp; float head; };

// N, V normalised world vectors. gloss 0..1 (wet highlight), rimK 0..1 (how much rim this surface takes)
Toon toon(vec3 wp, vec3 N, vec3 V, float gloss, float rimK) {
  Toon o;
  vec3 off = N * 0.035;                                  // normal-offset bias against shadow acne
  float fres = 1.0 - clamp(dot(N, V), 0.0, 1.0);
  float rimMask = aaStep(uRim.w, fres) * rimK;           // a stepped fresnel band along every silhouette

  // 1 · cool key (sky glow / moon), directional
  float nlM = dot(N, uMoonDir);
  float xM = max(nlM, 0.0) * shadowAt(uMoonMap, uMoonVP, wp + off, uTexel.x, 0.0007);
  float bM = ramp(xM);

  // 2 · street lamp, a downward spot
  vec3 Ll;
  float sl = spotTerm(uLampPos, uLampDir, uLampCone, wp, Ll);
  float xL = uLampK * max(dot(N, Ll), 0.0) * sl;
  if (xL > 0.002) xL *= shadowAt(uLampMap, uLampVP, wp + off, uTexel.y, 0.0004);
  float bL = ramp(xL);

  // 3 · headlights: two spots, one shadow map from their midpoint
  vec3 La, Lb;
  float sa = spotTerm(uHeadA, uHeadDir, uHeadCone, wp, La);
  float sb = spotTerm(uHeadB, uHeadDir, uHeadCone, wp, Lb);
  float xH = uHeadK * (max(dot(N, La), 0.0) * sa + max(dot(N, Lb), 0.0) * sb);
  if (xH > 0.002) xH *= shadowAt(uHeadMap, uHeadVP, wp + off, uTexel.z, 0.0004);
  float bH = ramp(xH);

  vec3 amb = mix(uAmbGround, uAmbSky, 0.5 + 0.5 * N.y);
  o.light = amb + uMoonCol * bM + uLampCol * bL + uHeadCol * bH;

  // stepped wet highlight (Blinn-Phong lobe x light arriving, cut at one threshold)
  vec3 Hl = normalize(Ll + V), Hh = normalize(normalize(La + Lb) + V), Hm = normalize(uMoonDir + V);
  float spL = pow(max(dot(N, Hl), 0.0), 60.0) * xL;
  float spH = pow(max(dot(N, Hh), 0.0), 60.0) * xH;
  float spM = pow(max(dot(N, Hm), 0.0), 90.0) * xM;
  o.add = gloss * (uLampCol * 0.9 * aaStep(0.3, spL) + uHeadCol * 0.9 * aaStep(0.3, spH) + uMoonCol * 0.8 * aaStep(0.5, spM));

  // stepped rim: the fresnel band, only where that light actually arrives
  o.add += rimMask * (uMoonCol * uRim.x * aaStep(0.05, xM)
                    + uLampCol * uRim.y * aaStep(0.08, xL)
                    + uHeadCol * uRim.z * aaStep(0.08, xH));

  o.dark = 1.0 - max(bM, max(bL, bH));
  o.lamp = bL;
  o.head = bH;
  return o;
}
`;

const OUT = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

// --------------------------------------------------------------------------------------------- toon surface
export const TOON_VS = /* glsl */ `
attribute vec3 aCol;
attribute vec4 aMat;     // gloss, rim, hatch, line width (px)
attribute float aEmit;
varying vec3 vWp; varying vec3 vN; varying vec3 vCol; varying vec4 vMat; varying float vEmit; varying vec2 vUv;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWp = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vCol = aCol; vMat = aMat; vEmit = aEmit; vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

export const TOON_FS = /* glsl */ `
${LIGHT}
uniform sampler2D uMap;
uniform float uHatchPx;
uniform vec3 uCanopy;
varying vec3 vWp; varying vec3 vN; varying vec3 vCol; varying vec4 vMat; varying float vEmit; varying vec2 vUv;
void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vWp);
  vec3 alb = vCol;
  float emit = max(vEmit, 0.0);
  if (vEmit < -1.5) alb *= texture2D(uMap, vUv).rgb;   // printed signs (aEmit = -2): albedo from the sign atlas
  else if (vEmit < -0.5) {
    // foliage: shade the clumps as one rounded mass (normal bent toward the canopy centre) with a leafy wobble,
    // so the band edges curl instead of cutting each ball with a straight terminator
    vec3 w = vec3(sin(vWp.y * 4.3 + vWp.x * 2.1), sin(vWp.z * 3.9 + vWp.y * 2.7 + 1.3), sin(vWp.x * 4.7 + vWp.z * 2.3 + 2.1));
    N = normalize(mix(N, normalize(vWp - uCanopy), 0.55) + 0.3 * w);
  }
  if (vMat.z < -0.5) {
    // window: frame + cross bar, a curtain gradient on the light
    float fx = abs(vUv.x - 0.5), fy = abs(vUv.y - 0.6);
    float bars = max(1.0 - aaStep(0.028, fx), 1.0 - aaStep(0.022, fy));
    bars = max(bars, 1.0 - aaStep(0.06, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y))));
    emit *= (1.0 - bars) * (0.7 + 0.3 * vUv.y);
    alb = mix(alb, vec3(0.05, 0.055, 0.07), bars);
  }
  Toon t = toon(vWp, N, V, vMat.x, vMat.y);
  vec3 col = alb * t.light + t.add;
  // hatching, only inside the darkest band: thin diagonal screen-space lines of reflected sky light
  if (vMat.z > 0.0) {
    float h = fract((gl_FragCoord.x + gl_FragCoord.y) / uHatchPx);
    float px = abs(h - 0.5) * uHatchPx * 0.7071;               // distance to the line centre in pixels
    float line = 1.0 - smoothstep(0.35, 0.95, px);
    col += alb * t.light * 0.85 * vMat.z * t.dark * line;
  }
  col += alb * emit;
  col = fogIt(col, vWp);
  gl_FragColor = vec4(col, 1.0);
  ${OUT}
}`;

// --------------------------------------------------------------------------------------------- inverted hull
// Back faces only. Each vertex moves along its SMOOTHED normal (aOutN: the average of every face normal meeting at
// that position, so hard-edged boxes do not split their hull at the corners). The move is done in clip space:
// the normal's screen direction, normalised in pixels, times width_px * 2 / resolution * clip.w — multiplying by w
// cancels the perspective divide, so the line is the same number of pixels wide near and far.
export const LINE_VS = /* glsl */ `
attribute vec3 aOutN; attribute vec4 aMat; attribute vec3 aCol;
uniform vec2 uRes; uniform float uLineScale;
varying vec3 vWp; varying vec3 vCol;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec4 clip = projectionMatrix * viewMatrix * wp;
  vec3 nW = normalize(mat3(modelMatrix) * aOutN);
  vec4 nc = projectionMatrix * viewMatrix * vec4(nW, 0.0);
  vec2 d = (nc.xy - clip.xy / clip.w * nc.w) * uRes;          // screen direction of the normal at this vertex
  float l = length(d);
  d = l > 1e-6 ? d / l : vec2(0.0);
  clip.xy += d * (2.0 * aMat.w * uLineScale / uRes) * clip.w;
  vWp = wp.xyz; vCol = aCol;
  gl_Position = clip;
}`;

export const LINE_FS = /* glsl */ `
uniform vec3 uInk; uniform vec3 uFogCol; uniform vec2 uFog;
varying vec3 vWp; varying vec3 vCol;
void main() {
  vec3 c = mix(uInk, vCol * 0.16, 0.35);                    // ink tinted by the fill it surrounds
  float d = length(vWp - cameraPosition);
  float f = 1.0 - exp(-d * (uFog.x + uFog.y * exp(-max(vWp.y, 0.0) * 0.35)));
  c = mix(c, uFogCol, clamp(f * 1.08, 0.0, 1.0));           // lines fade with distance like the fills do
  gl_FragColor = vec4(c, 1.0);
  ${OUT}
}`;

// --------------------------------------------------------------------------------------------- ground
export const GROUND_VS = /* glsl */ `
varying vec3 vWp;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWp = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const NOISE = /* glsl */ `
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = p - i; vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
`;

// wet road: asphalt + markings, puddles = planar reflection (rippled, posterised into flat steps)
export const ROAD_FS = /* glsl */ `
${LIGHT}
${NOISE}
uniform sampler2D uPuddle; uniform vec4 uPudRect;       // puddle field over x0, z0, width, depth
uniform sampler2D uRefl; uniform mat4 uReflVP;
uniform float uTime;
uniform vec3 uAsphalt, uPaint, uSkyRefl;
varying vec3 vWp;

// rain rings on the water: hash grid, every cell owns one ring; 3x3 neighbourhood so rings cross cell borders
vec3 ripples(vec2 p, float t) {
  vec2 g = p / 0.34;
  vec2 c0 = floor(g);
  vec2 grad = vec2(0.0); float crest = 0.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 c = c0 + vec2(i, j);
    vec2 h = hash22(c);
    float per = 0.75 + 0.6 * hash12(c + 7.1);
    float k = fract(t / per + h.x * 3.7);
    vec2 ctr = (c + 0.2 + 0.6 * h) * 0.34;
    vec2 d = p - ctr; float r = length(d);
    float R = 0.02 + 0.14 * k;                           // ring radius grows
    float amp = (1.0 - k) * (1.0 - k);
    float x = (r - R) / 0.016;
    float w = exp(-x * x);
    grad += d / max(r, 1e-4) * (-2.0 * x * w) * amp;
    crest = max(crest, w * amp);
  }
  return vec3(grad, crest);
}

void main() {
  vec3 wp = vWp;
  vec3 V = normalize(cameraPosition - wp);
  vec2 pu = (wp.xz - uPudRect.xy) / uPudRect.zw;
  float m = (pu.x > 0.0 && pu.x < 1.0 && pu.y > 0.0 && pu.y < 1.0) ? texture2D(uPuddle, pu).r : 0.0;
  float puddle = aaStep(0.5, m);
  float rim = aaStep(0.38, m) - puddle;                 // darker soaked rim round each puddle

  // asphalt albedo: grain + worn paint (edge line by the curb, dashed centre line)
  float grain = vnoise(wp.xz * 9.0) * 0.6 + vnoise(wp.xz * 31.0) * 0.4;
  vec3 alb = uAsphalt * (0.82 + 0.3 * grain);
  float wear = smoothstep(0.25, 0.6, vnoise(wp.xz * 5.0 + 3.0));
  float edge = aaStep(0.0, 0.075 - abs(wp.z - 2.25));
  float dash = aaStep(0.0, 0.07 - abs(wp.z - 6.9)) * aaStep(0.0, 1.3 - abs(mod(wp.x + 0.5, 4.0) - 2.0));
  alb = mix(alb, uPaint, max(edge, dash) * (0.55 + 0.45 * wear));
  alb *= 1.0 - 0.35 * rim;

  vec3 N = vec3(0.0, 1.0, 0.0);
  Toon t = toon(wp, N, V, 0.0, 0.0);
  vec3 col = alb * t.light;
  col += (uLampCol * t.lamp + uHeadCol * t.head) * 0.045 * (1.0 - puddle);   // the lit band of wet asphalt glows

  // wet asphalt: the lamp and the headlights stretched into long stepped streaks toward the viewer
  vec3 B = normalize(vec3(V.x, 0.0, V.z)), T = vec3(-B.z, 0.0, B.x);
  vec3 Ll; float sl = spotTerm(uLampPos, uLampDir, uLampCone, wp, Ll);
  vec3 Hl = normalize(Ll + V);
  float sx = dot(Hl, T) / 0.025, sz = dot(Hl, B) / 0.42;
  float streakL = exp(-sx * sx - sz * sz) * uLampK * (0.35 + sl * 3.0);
  vec3 Lh = normalize(0.5 * (uHeadA + uHeadB) - wp);
  vec3 Hh = normalize(Lh + V);
  float hx = dot(Hh, T) / 0.03, hz = dot(Hh, B) / 0.4;
  float streakH = exp(-hx * hx - hz * hz) * uHeadK * 1.4;
  vec3 wet = uLampCol * (0.45 * aaStep(0.16, streakL) + 0.55 * aaStep(0.5, streakL))
           + uHeadCol * (0.45 * aaStep(0.16, streakH) + 0.55 * aaStep(0.5, streakH));
  col += wet * (1.0 - puddle) * 0.55;

  // puddle: mirror image from the reflection pass, bent by the ripples, posterised to flat steps
  vec3 rp = vec3(0.0), refl = vec3(0.0);
  if (m > 0.3) {                                        // only water pays for rings and the mirror lookup
    rp = ripples(wp.xz, uTime);
    vec4 rc = uReflVP * vec4(wp, 1.0);
    vec2 ruv = rc.xy / rc.w * 0.5 + 0.5 + rp.xy * 0.0035;
    refl = texture2D(uRefl, clamp(ruv, 0.001, 0.999)).rgb;
  }
  float l = dot(refl, vec3(0.299, 0.587, 0.114));
  float s = sqrt(max(l, 0.0)) * 5.0;                    // equal steps in sqrt(luminance)
  float si = floor(s), sf = s - si;
  float w = max(fwidth(s) * 0.6, 1e-4);
  float sq = (si + smoothstep(0.55 - w, 0.55 + w, sf)) / 5.0;
  vec3 stepped = refl * (sq * sq) / max(l, 1e-4);
  float fr = 0.5 + 0.45 * pow(1.0 - clamp(V.y, 0.0, 1.0), 4.0);
  vec3 water = alb * 0.25 * t.light + stepped * fr;
  water += (uSkyRefl * 0.35 + uLampCol * uLampK * 0.02) * aaStep(0.55, rp.z);  // ring crests catch light
  col = mix(col, water, puddle);

  col = fogIt(col, wp);
  gl_FragColor = vec4(col, 1.0);
  ${OUT}
}`;

// wet pavement tiles under the shelter and lamp
export const WALK_FS = /* glsl */ `
${LIGHT}
${NOISE}
uniform vec3 uTileA, uTileB;
varying vec3 vWp;
void main() {
  vec3 wp = vWp;
  vec3 V = normalize(cameraPosition - wp);
  vec2 g = wp.xz / vec2(0.6, 0.3);
  vec2 row = vec2(g.x + 0.5 * mod(floor(g.y), 2.0), g.y);
  vec2 cell = floor(row), f = fract(row);
  float tone = hash12(cell);
  vec3 alb = mix(uTileA, uTileB, step(0.62, tone)) * (0.92 + 0.12 * vnoise(wp.xz * 14.0));
  float jx = min(f.x, 1.0 - f.x) * 0.6, jz = min(f.y, 1.0 - f.y) * 0.3;
  float joint = 1.0 - aaStep(0.012, min(jx, jz));
  alb *= 1.0 - 0.42 * joint;
  Toon t = toon(wp, vec3(0.0, 1.0, 0.0), V, 0.0, 0.0);
  vec3 col = alb * t.light;
  col += (uLampCol * t.lamp + uHeadCol * t.head) * 0.03;
  // wet sheen under the lamp: one stepped streak
  vec3 B = normalize(vec3(V.x, 0.0, V.z)), T = vec3(-B.z, 0.0, B.x);
  vec3 Ll; float sl = spotTerm(uLampPos, uLampDir, uLampCone, wp, Ll);
  vec3 Hl = normalize(Ll + V);
  float sx = dot(Hl, T) / 0.05, sz = dot(Hl, B) / 0.16;
  float st = exp(-sx * sx - sz * sz) * uLampK * (0.3 + sl * 3.0);
  col += uLampCol * 0.3 * aaStep(0.25, st);
  col = fogIt(col, wp);
  gl_FragColor = vec4(col, 1.0);
  ${OUT}
}`;

// --------------------------------------------------------------------------------------------- sky dome
export const SKY_VS = /* glsl */ `
varying vec3 vWp;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWp = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
  gl_Position.z = gl_Position.w * 0.99999;               // always the farthest thing
}`;
export const SKY_FS = /* glsl */ `
${NOISE}
uniform vec3 uZenith, uHorizon, uCloudA, uCloudB; uniform float uTime;
varying vec3 vWp;
float aa(float e, float x) { float w = max(fwidth(x) * 0.75, 1e-5); return smoothstep(e - w, e + w, x); }
void main() {
  vec3 d = normalize(vWp - cameraPosition);
  float h = max(d.y, 0.0);
  vec3 col = mix(uHorizon, uZenith, smoothstep(0.0, 0.55, h));
  // painted cloud deck: two flat tones cut from value noise on a plane above the street
  vec2 p = d.xz / (h + 0.12) * 1.1 + vec2(uTime * 0.035, 0.0);
  float n = vnoise(p * 0.9) * 0.6 + vnoise(p * 2.3 + 4.0) * 0.28 + vnoise(p * 5.1) * 0.12;
  float fade = smoothstep(0.02, 0.12, h) * (1.0 - smoothstep(0.45, 0.85, h));
  col = mix(col, uCloudA, aa(0.52, n) * fade);
  col = mix(col, uCloudB, aa(0.64, n) * fade);
  gl_FragColor = vec4(col, 1.0);
  ${OUT}
}`;

// --------------------------------------------------------------------------------------------- rain
// one instanced quad per streak: head and tail projected, then widened in pixels (width ~ 1.2 cm in the world,
// at least 0.8 px). Light per streak in the vertex shader (same spots, stepped) incl. the headlights' shadow map,
// so lit rain shows the beams and the shadow shafts behind the posts.
const RAIN_LIGHT = /* glsl */ `
uniform vec3 uLampPos, uLampDir, uLampCol, uLampCone; uniform float uLampK;
uniform vec3 uHeadA, uHeadB, uHeadDir, uHeadCol, uHeadCone; uniform float uHeadK; uniform sampler2D uHeadMap; uniform mat4 uHeadVP;
uniform vec3 uRainCol;
float spotV(vec3 pos, vec3 dir, vec3 cone, vec3 wp) {
  vec3 d = pos - wp; float dist = length(d);
  float c = smoothstep(cone.x, cone.y, dot(-d / max(dist, 1e-4), dir));
  return c / (1.0 + dist * dist / (cone.z * cone.z));
}
float headShadow(vec3 wp) {
  vec4 c = uHeadVP * vec4(wp, 1.0);
  if (c.w <= 0.0) return 1.0;
  vec3 p = c.xyz / c.w * 0.5 + 0.5;
  if (p.x <= 0.0 || p.x >= 1.0 || p.y <= 0.0 || p.y >= 1.0 || p.z >= 1.0) return 1.0;
  return step(p.z - 0.001, textureLod(uHeadMap, p.xy, 0.0).r);
}
vec3 rainLight(vec3 p) {
  float lamp = uLampK * spotV(uLampPos, uLampDir, uLampCone, p);
  float head = uHeadK * (spotV(uHeadA, uHeadDir, uHeadCone, p) + spotV(uHeadB, uHeadDir, uHeadCone, p));
  if (head > 0.02) head *= headShadow(p);
  return uRainCol
    + uLampCol * (0.55 * step(0.05, lamp) + 0.45 * step(0.22, lamp))
    + uHeadCol * (0.5 * step(0.04, head) + 0.5 * step(0.16, head));
}
`;

export const RAIN_VS = /* glsl */ `
${RAIN_LIGHT}
attribute vec2 aCorner;   // along (0 tail .. 1 head), side (-1 .. 1)
attribute vec4 aSeed;     // box position (0..1)^3, speed jitter
uniform float uTime, uShutter, uFocal;
uniform vec3 uBoxMin, uBoxSize, uVel;
uniform vec2 uRes;
uniform vec4 uRoof; uniform float uRoofY;
varying vec2 vC; varying vec3 vLight; varying float vA;
void main() {
  float sp = 0.82 + 0.36 * aSeed.w;
  vec3 v = uVel * sp;
  vec3 p = uBoxMin + mod(aSeed.xyz * uBoxSize + v * uTime, uBoxSize);
  vec3 tail = p - v * uShutter;
  float hide = 0.0;
  if (p.x > uRoof.x && p.x < uRoof.y && p.z > uRoof.z && p.z < uRoof.w && p.y < uRoofY) hide = 1.0;   // dry under the roof
  vec4 c0 = projectionMatrix * viewMatrix * vec4(tail, 1.0);
  vec4 c1 = projectionMatrix * viewMatrix * vec4(p, 1.0);
  if (c0.w < 0.3 || c1.w < 0.3) hide = 1.0;
  vec2 hr = uRes * 0.5;
  vec2 s0 = c0.xy / c0.w * hr, s1 = c1.xy / c1.w * hr;
  vec2 dir = s1 - s0; float len = length(dir);
  dir = len > 1e-3 ? dir / len : vec2(0.0, 1.0);
  vec2 perp = vec2(-dir.y, dir.x);
  float wpx = clamp(0.012 * uFocal / c1.w, 0.8, 7.0);
  vec4 c = mix(c0, c1, aCorner.x);
  vec2 s = mix(s0, s1, aCorner.x) + perp * aCorner.y * wpx * 0.5;
  gl_Position = hide > 0.5 ? vec4(0.0, 0.0, -2.0, 1.0) : vec4(s / hr * c.w, c.z, c.w);
  vC = aCorner;
  vLight = rainLight(mix(tail, p, 0.5));
  vA = (0.55 + 0.45 * fract(aSeed.w * 13.7)) * clamp(1.6 / wpx, 0.25, 1.0);  // big near drops are fainter
}`;
export const RAIN_FS = /* glsl */ `
varying vec2 vC; varying vec3 vLight; varying float vA;
void main() {
  float a = smoothstep(0.0, 0.35, vC.x) * (1.0 - smoothstep(0.8, 1.0, vC.x)) * (1.0 - abs(vC.y));
  gl_FragColor = vec4(vLight * a * vA, 1.0);
  ${OUT}
}`;

// splashes: a flat ring on the ground that opens and fades
export const SPLASH_VS = /* glsl */ `
${RAIN_LIGHT}
attribute vec2 aCorner;   // -1..1 square
attribute vec4 aSpl;      // x, y, z, phase
uniform float uTime;
varying vec2 vC; varying float vK; varying vec3 vLight;
void main() {
  float per = 0.55 + 0.5 * fract(aSpl.w * 7.31);
  float k = fract(uTime / per + aSpl.w);
  float on = step(k, 0.42);
  k = k / 0.42;
  float r = (0.02 + 0.08 * sqrt(k)) * on;
  vec3 p = aSpl.xyz + vec3(aCorner.x * r, 0.004, aCorner.y * r);
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  vC = aCorner; vK = k;
  vLight = rainLight(aSpl.xyz + vec3(0.0, 0.05, 0.0));
}`;
export const SPLASH_FS = /* glsl */ `
varying vec2 vC; varying float vK; varying vec3 vLight;
void main() {
  float r = length(vC);
  float ring = 1.0 - smoothstep(0.0, 0.16, abs(r - 0.82));
  float a = ring * (1.0 - vK) * (1.0 - vK) * 0.55;
  gl_FragColor = vec4(vLight * a, 1.0);
  ${OUT}
}`;

// --------------------------------------------------------------------------------------------- halos
// a camera-facing quad (view space), drawn as flat rings instead of a gaussian: a cel-painted glow
export const HALO_VS = /* glsl */ `
attribute vec2 aCorner;
uniform vec3 uCenter; uniform vec2 uSize;
varying vec2 vC;
void main() {
  vec4 mv = viewMatrix * vec4(uCenter, 1.0);
  mv.xy += aCorner * uSize;
  gl_Position = projectionMatrix * mv;
  vC = aCorner;
}`;
export const HALO_FS = /* glsl */ `
uniform vec3 uCol; uniform float uK; uniform vec4 uRings;   // ring radii (core, 1, 2) and soft glow weight
uniform float uStreak;
varying vec2 vC;
float aa(float e, float x) { float w = max(fwidth(x) * 0.75, 1e-5); return smoothstep(e - w, e + w, x); }
void main() {
  float r = length(vC);
  float a = 1.0 - aa(uRings.x, r);
  float b = 1.0 - aa(uRings.y, r);
  float c = 1.0 - aa(uRings.z, r);
  float glow = exp(-r * r * 7.0) * uRings.w;
  float streak = uStreak * exp(-vC.y * vC.y * 5000.0) * (1.0 - smoothstep(0.0, 1.0, abs(vC.x)));
  vec3 col = uCol * (0.38 * c + 0.45 * b + glow + streak) + vec3(1.0, 0.95, 0.85) * a * 1.6;
  gl_FragColor = vec4(col * uK, 1.0);
  ${OUT}
}`;

// --------------------------------------------------------------------------------------------- light shafts
// an open cone mesh (apex at the light). Brightness from |N.V| (the cone's middle is the thick part of the volume),
// falling off along its length, cut into two flat levels — a painted beam.
export const BEAM_VS = /* glsl */ `
attribute float aAlong;
varying vec3 vN; varying vec3 vWp; varying float vAlong;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWp = wp.xyz; vAlong = aAlong;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
export const BEAM_FS = /* glsl */ `
uniform vec3 uCol; uniform float uK; uniform vec2 uLevels;
varying vec3 vN; varying vec3 vWp; varying float vAlong;
float aa(float e, float x) { float w = max(fwidth(x) * 0.75, 1e-5); return smoothstep(e - w, e + w, x); }
void main() {
  vec3 V = normalize(cameraPosition - vWp);
  float facing = abs(dot(normalize(vN), V));
  float core = uLevels.x * aa(0.22, facing) + uLevels.y * aa(0.6, facing);   // crisp sides, a brighter core
  float fall = smoothstep(0.0, 0.08, vAlong) * pow(max(1.0 - vAlong, 0.0), 1.5);   // fades along its length (base clamped: no NaN)
  gl_FragColor = vec4(uCol * core * fall * uK, 1.0);
  ${OUT}
}`;

// --------------------------------------------------------------------------------------------- vignette
export const VIG_VS = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
export const VIG_FS = /* glsl */ `
varying vec2 vUv;
void main() {
  vec2 q = (vUv - 0.5) * vec2(1.0, 1.25);
  float v = smoothstep(0.32, 0.86, length(q));
  float bottom = smoothstep(0.24, 0.0, vUv.y) * 0.45;      // keeps the caption area calm
  gl_FragColor = vec4(0.012, 0.016, 0.045, clamp(v * 0.55 + bottom, 0.0, 0.85));
}`;
