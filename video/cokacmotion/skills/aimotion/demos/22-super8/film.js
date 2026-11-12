/*
 * 22 · the film and the projector — the post chain that turns scene radiance into a projected Super 8 frame.
 * Per stage pixel:
 *   gate (fixed in the projector) → film coordinates (gate weave: per-frame shift + rotation) → strip position
 *   → which film frame k, where inside it (frame line, perforation, leader, tail)
 *   → exposure H per dye layer: scene × auto-iris × per-frame shutter flicker × lens vignette, + halation
 *     (red-layer glow from light bounced off the film base), + light-struck fog (head fog, end-of-roll burn)
 *   → reversal characteristic curve (more light = less dye) → dye densities C, M, Y
 *   → dye fading, unwanted dye absorptions, grain as dye clouds (re-seeded per film frame k), dust, scratches
 *   → transmittance 10^-D × lamp × hotspot × projector flicker, hair in the gate, screen texture.
 */
export const FILM_FS = (C) => `#version 300 es
precision highp float;
uniform sampler2D uScene, uHal;
uniform vec2 uRes;
uniform float uStrip, uBlur, uExpo, uLamp, uFlick, uHairA, uSEnd;
uniform vec3 uWeave, uLampCol;
uniform vec2 uHair[7];
out vec4 o;

const float PITCH = ${C.PITCH.toFixed(1)};
const vec2 IMG = vec2(${C.IMG_HW.toFixed(1)}, ${C.IMG_HH.toFixed(1)});
const vec2 GATE_C = vec2(${C.GATE_X.toFixed(1)}, ${C.GATE_Y.toFixed(1)});
const float K_IMG = ${C.K_IMG.toFixed(1)};
const float KB0 = ${C.KB0.toFixed(1)}, KB1 = ${C.KB1.toFixed(1)};
const float LN10 = 2.302585;

uint hu(uint x) { x ^= x >> 16; x *= 0x7feb352du; x ^= x >> 15; x *= 0x846ca68bu; x ^= x >> 16; return x; }
float h1(uint x) { return float(hu(x) & 0xffffffu) / 16777215.0; }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 5.3; a *= 0.5; }
  return s;
}
float sdBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }

// dye clouds: soft gaussian blobs of random size and sign on a jittered grid (3×3 neighbourhood),
// seeded by the film frame, so the grain is a property of each frame of film and moves with it
float blobs(vec2 p, float cell, uint seed) {
  vec2 g = p / cell, i = floor(g), f = g - i;
  float s = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 c = i + vec2(x, y);
    uint h = hu(uint(int(c.x) + 16384) * 0x8da6b343u ^ uint(int(c.y) + 16384) * 0xd8163841u ^ seed);
    vec4 r = vec4(uvec4(h, h >> 8, h >> 16, h >> 24) & 255u) / 255.0;
    vec2 d = vec2(x, y) + r.xy - f;
    float rad = 0.42 + 0.5 * r.z;
    s += (r.w * 2.0 - 1.0) * exp(-dot(d, d) / (rad * rad));
  }
  return s;
}

// dust and lint on frame k (dark: opaque on the film; bright: emulsion pin-holes)
vec2 dust(vec2 fl, float k, float rate) {
  float dark = 0.0, bright = 0.0;
  uint kk = uint(k + 64.0);
  for (int i = 0; i < 7; i++) {
    uint h = hu(kk * 747796405u + uint(i) * 2891336453u + 12345u);
    vec4 r = vec4(uvec4(h, h >> 8, h >> 16, h >> 24) & 255u) / 255.0;
    if (r.w > rate * (i < 3 ? 0.60 : 0.20)) continue;
    uint g = hu(h ^ 0x9e3779b9u);
    vec4 r2 = vec4(uvec4(g, g >> 8, g >> 16, g >> 24) & 255u) / 255.0;
    vec2 c = vec2(r.x * 1000.0 - 500.0, r.y * 1500.0 - 750.0);
    vec2 d = fl - c;
    if (dot(d, d) > 160.0 * 160.0) continue;
    if (r.z < 0.62) {
      float rad = 1.6 + 6.5 * r2.x * r2.x;
      float ang = atan(d.y, d.x);
      float wob = 1.0 + 0.35 * sin(ang * 3.0 + r2.y * 6.28) + 0.2 * sin(ang * 5.0 + r2.z * 6.28);
      float soft = 0.6 + 2.6 * r2.w;                    // dust on the base side is out of focus
      dark = max(dark, smoothstep(rad * wob + soft, rad * wob - soft * 0.5, length(d)) * (0.65 + 0.35 * (1.0 - r2.w)));
    } else if (r.z < 0.88) {
      float len = 25.0 + 120.0 * r2.x;
      float a0 = r2.y * 6.2832;
      vec2 dir = vec2(cos(a0), sin(a0));
      float al = dot(d, dir);
      float ac = dot(d, vec2(-dir.y, dir.x)) - (r2.z - 0.5) * 0.03 * al * al / max(len * 0.02, 1.0) - 3.0 * sin(al * 0.09 + r2.w * 6.0);
      float inside = smoothstep(len * 0.5, len * 0.5 - 4.0, abs(al));
      dark = max(dark, smoothstep(1.7, 0.5, abs(ac)) * inside * 0.92);
    } else {
      float rad = 1.0 + 3.0 * r2.x;
      bright = max(bright, smoothstep(rad + 1.0, rad - 0.6, length(d)));
    }
  }
  return vec2(dark, bright);
}

// light-struck fog (exposure units): the head of the roll fogged while loading, and the burn at the end of the roll.
// Its shape is a function of the continuous strip position s, so it flows from one frame into the next.
float fog(vec2 fl, float s) {
  float kk = s / PITCH;
  float f = 0.0;
  float hk = kk - K_IMG;
  if (hk > -0.5 && hk < 26.0) {
    float amp = 110.0 * exp(-max(hk - 1.5, 0.0) / 2.5);
    float w = 110.0 + 300.0 * vnoise(vec2(fl.y / 280.0, s / 900.0));
    float edge = exp(-max(IMG.x + 40.0 - fl.x, 0.0) / w) * (0.55 + 0.9 * fbm(vec2(fl.x / 260.0, s / 700.0)));
    f += amp * mix(1.0, edge, clamp((hk - 1.0) / 6.0, 0.0, 1.0));
  }
  if (kk > KB0 - 2.0) {
    float b = smoothstep(KB0, KB1, kk);
    float recede = 1.0 - 0.86 * smoothstep(KB1 + 1.0, KB1 + 9.0, kk);
    float wL = 60.0 + 1100.0 * b * b;
    float n = fbm(vec2(fl.x / 330.0 - s / 2600.0, s / 800.0));
    float core = exp(-max(fl.x + IMG.x + 70.0, 0.0) / wL) * (0.35 + 1.3 * n);
    // a hot spot that blooms out of the left edge, two thirds down
    vec2 hp = (fl - vec2(-IMG.x - 30.0, 260.0 - 120.0 * b)) / (80.0 + 900.0 * b);
    core += 1.3 * exp(-dot(hp, hp)) * b;
    f += 75.0 * b * b * recede * core;
  }
  return f;
}

// reversal characteristic curve: exposure → transmittance (S-curve in log exposure) → density
const vec3 H0 = vec3(0.26, 0.30, 0.35);      // the red-sensitive layer is a little faster: warm
const vec3 GAM = vec3(1.85, 2.0, 2.15);      // and the blue layer steeper: shadows go amber
const float TMIN = 0.0009, TMAX = 0.80;
vec3 curveD(vec3 H) {
  vec3 x = pow(max(H, 1e-6) / H0, GAM);
  vec3 T = mix(vec3(TMIN), vec3(TMAX), x / (1.0 + x));
  return -log(T) / LN10;
}

vec3 sceneAt(vec2 fl) {
  vec2 uv = vec2(fl.x / (2.0 * IMG.x) + 0.5, 0.5 - fl.y / (2.0 * IMG.y));
  vec2 c = uv - 0.5;
  vec3 s;
  if (uBlur < 1.0) {
    s = vec3(texture(uScene, 0.5 + c * 1.0016).r, texture(uScene, uv).g, texture(uScene, 0.5 + c * 0.9984).b);
  } else {
    // the film slips while the shutter is open: vertical smear
    s = vec3(0.0);
    for (int i = 0; i < 7; i++) {
      float o2 = (float(i) / 6.0 - 0.5) * uBlur / (2.0 * IMG.y);
      s += texture(uScene, uv + vec2(0.0, o2)).rgb;
    }
    s /= 7.0;
  }
  return s;
}

void main() {
  vec2 sp = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 rel = sp - GATE_C;
  // the projector gate: fixed, rounded, filed wide on the left so the perforation shows, slightly ragged
  float gd = sdBox(rel - vec2(-45.5, 0.0), vec2(503.5, 715.0), 30.0);
  gd += 1.6 * (vnoise(rel * 0.06) - 0.5) + 0.8 * (vnoise(rel * 0.4) - 0.5);
  float gate = smoothstep(2.2, -2.2, gd);

  vec3 trans = vec3(0.0);
  if (gate > 0.0) {
    // gate weave: the film sits in the gate at a slightly different place every projected frame
    float cw = cos(uWeave.z), sw = sin(uWeave.z);
    vec2 r0 = rel - uWeave.xy;
    vec2 f = vec2(cw * r0.x + sw * r0.y, -sw * r0.x + cw * r0.y);
    float s = f.y + uStrip;
    float k = floor(s / PITCH + 0.5);
    float ly = s - k * PITCH;
    vec2 fl = vec2(f.x, ly);
    float perf = smoothstep(1.2, -1.2, sdBox(fl - vec2(-512.0, 0.0), vec2(22.0, 30.0), 7.0));
    float tailCut = s - (uSEnd + 0.14 * f.x);

    vec3 D;
    if (k < K_IMG) {
      // clear leader, yellowed and scratched
      D = vec3(0.10, 0.13, 0.26) + 0.04 * (vnoise(fl * 0.02 + k) - 0.5);
    } else {
      float camFlick = exp2(0.20 * (h1(uint(k) * 7919u + 17u) - 0.5));
      float img = smoothstep(2.0, -2.0, sdBox(fl, IMG, 26.0));
      vec3 H = sceneAt(fl) * uExpo * camFlick;
      vec2 nrm = fl / IMG;
      H *= 1.0 - 0.32 * dot(nrm, nrm) * 0.5;                    // the camera lens vignettes the corners
      // interimage effects between layers: a reversal stock's saturation
      H = max(mat3(1.20, -0.08, -0.03, -0.13, 1.18, -0.15, -0.07, -0.10, 1.18) * H, 0.0);
      vec2 huv = vec2(fl.x / (2.0 * IMG.x) + 0.5, 0.5 - fl.y / (2.0 * IMG.y));
      vec3 hal = texture(uHal, huv).rgb;
      float hl = dot(hal, vec3(0.3, 0.5, 0.2));
      H += vec3(1.0, 0.30, 0.07) * hl * 0.16 + hal * 0.012;      // halation: red layer, bounced off the base
      H *= img;
      H += vec3(1.0, 0.42, 0.14) * fog(fl, s);                    // red layer fogs first: red → orange → white
      D = curveD(H);
      // dye fading (cyan and yellow go first: the familiar warm-magenta drift of old reversal film)
      D *= vec3(0.90, 0.97, 0.90);
      // dye clouds
      uint seed = uint(k) * 2654435761u;
      vec3 g = vec3(blobs(fl, 2.7, seed ^ 0x1234u), blobs(fl, 2.4, seed ^ 0x5678u), blobs(fl, 3.2, seed ^ 0x9abcu));
      float clump = blobs(fl, 7.0, seed ^ 0xdef0u);
      D += 0.16 * sqrt(max(D, 0.0)) * (g * 0.75 + clump * 0.45);
      D = max(D, 0.02);
    }
    // continuous scratches along the strip (a fine rain everywhere, one deep base scratch, one emulsion scratch)
    float leader = k < K_IMG ? 1.0 : 0.0;
    float col = floor(f.x / 9.0);
    float hcol = hash12(vec2(col, 3.7));
    if (hcol < 0.10 + 0.25 * leader) {
      float x0 = (col + 0.2 + 0.6 * hash12(vec2(col, 9.1))) * 9.0;
      float on = smoothstep(0.45, 0.75, vnoise(vec2(s / 380.0, col)));
      float sc = smoothstep(1.3, 0.3, abs(f.x - x0)) * on * (0.15 + 0.45 * hash12(vec2(col, 5.5)));
      D += sc * (0.25 * leader + 0.12);
    }
    if (k >= 34.0 && k < 122.0) {
      float x1 = -140.0 + 30.0 * sin(s / 21000.0) + (h1(uint(k) * 31u + 5u) - 0.5) * 1.8;
      float on = smoothstep(0.30, 0.55, vnoise(vec2(s / 650.0, 2.0))) * smoothstep(34.0, 38.0, k) * smoothstep(122.0, 116.0, k);
      D += 0.55 * on * smoothstep(1.6, 0.4, abs(f.x - x1));
    }
    if (k >= 84.0 && k < 114.0) {
      float x2 = 300.0 + 14.0 * sin(s / 9000.0) + (h1(uint(k) * 13u + 9u) - 0.5) * 1.2;
      float on = smoothstep(0.25, 0.5, vnoise(vec2(s / 500.0, 7.0)));
      float sc = on * smoothstep(1.4, 0.3, abs(f.x - x2));
      D *= 1.0 - sc * vec3(0.55, 0.62, 0.90);                      // yellow and magenta scraped off: a cyan-white line
    }
    vec2 du = dust(fl, k, k < K_IMG ? 1.6 : 1.0);
    D += 2.4 * du.x;
    D *= 1.0 - 0.85 * du.y;
    // unwanted absorptions of real dyes (cyan dye eats a little green, magenta a little blue)
    D = mat3(1.0, 0.10, 0.03, 0.04, 1.0, 0.13, 0.0, 0.05, 1.0) * D;
    trans = exp(-max(D, 0.0) * LN10);
    trans = mix(trans, vec3(1.0), perf);
    trans = mix(trans, vec3(1.0), smoothstep(-1.5, 1.5, tailCut));   // past the tail: open gate
    trans *= 1.0 - 0.7 * smoothstep(4.0, 0.0, abs(tailCut + 2.0));               // the cut edge of the tail
  }

  // the projector: lamp × hotspot × flicker, a hair caught in the gate, the screen
  vec2 rn = rel / vec2(560.0, 880.0);
  float illum = 1.0 - 0.26 * dot(rn, rn);
  vec3 scr = trans * uLampCol * (uLamp * uFlick * illum) * gate;
  if (uHairA > 0.0) {
    float dh = 1e9;
    for (int i = 1; i < 7; i++) {
      vec2 pa = rel - uHair[i - 1], ba = uHair[i] - uHair[i - 1];
      float hh = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      dh = min(dh, length(pa - ba * hh));
    }
    scr *= 1.0 - 0.94 * uHairA * smoothstep(1.7, 0.5, dh);
  }
  scr += uLampCol * uLamp * 0.008 * exp(-max(gd, 0.0) / 55.0) * (1.0 - gate);   // stray light around the gate
  scr *= 1.0 + 0.03 * (hash12(floor(sp * 0.5)) - 0.5);                          // matte screen texture (static)
  vec3 c = pow(clamp(scr, 0.0, 1.0), vec3(1.0 / 2.2));
  c += (hash12(sp + 0.37) - 0.5) / 255.0;
  o = vec4(c, 1.0);
}`;

// halation pyramid: 13-tap downsample (with an exposure threshold on the first level) and tent upsample
export const DOWN_FS = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o; uniform sampler2D src; uniform vec2 texel; uniform float uGain, uThr;
vec3 s(vec2 o2) { return texture(src, uv + o2 * texel).rgb; }
void main() {
  vec3 c = s(vec2(0)) * 0.125;
  c += (s(vec2(-1, -1)) + s(vec2(1, -1)) + s(vec2(-1, 1)) + s(vec2(1, 1))) * 0.125;
  c += (s(vec2(-2, -2)) + s(vec2(2, -2)) + s(vec2(-2, 2)) + s(vec2(2, 2))) * 0.03125;
  c += (s(vec2(0, -2)) + s(vec2(0, 2)) + s(vec2(-2, 0)) + s(vec2(2, 0))) * 0.0625;
  o = vec4(max(c * uGain - uThr, 0.0), 1.0);
}`;
export const UP_FS = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o; uniform sampler2D src; uniform vec2 texel;
vec3 s(vec2 o2) { return texture(src, uv + o2 * texel).rgb; }
void main() {
  vec3 c = s(vec2(0)) * 4.0;
  c += (s(vec2(-1, 0)) + s(vec2(1, 0)) + s(vec2(0, -1)) + s(vec2(0, 1))) * 2.0;
  c += s(vec2(-1, -1)) + s(vec2(1, -1)) + s(vec2(-1, 1)) + s(vec2(1, 1));
  o = vec4(c / 16.0, 1.0);
}`;
export const FS_VS = `#version 300 es
layout(location=0) in vec2 p; out vec2 uv;
void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0, 1); }`;
