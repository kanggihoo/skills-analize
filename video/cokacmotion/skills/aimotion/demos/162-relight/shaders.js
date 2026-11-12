/*
 * shaders.js — the three full-screen passes (three.js ShaderMaterial, WebGL2 / GLSL ES 3.0).
 *
 *   HEIGHT  (540×960)   the height the shadows march over: the painted room + the cat's head sprite (R), and the
 *                       hand as a floating slab (G = top, B = bottom), so light can pass under it
 *   SHADOW  (540×960)   screen-space height-field shadows: from each pixel march toward the light and keep
 *                       min(k · (ray height − h) / distance) → a soft penumbra. R = match, G = candle, B = window
 *   LIGHT   (1080×1920) relight the flat picture: albedo × (ambient + Σ wrapped Lambert · falloff · shadow · colour)
 *                       + Blinn specular + rim; sky, flames, glow, sparks, smoke, the sunbeam haze; exposure, ACES;
 *                       the colour-temperature chip on top
 */
import { HAND, HEAD, ATLAS } from './room.js';

const f = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(v));
const v2 = (a) => `vec2(${f(a[0])}, ${f(a[1])})`;

export const VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// sprite transforms shared by the passes: world = pos + R(angle)·(local − anchor)
const SPRITE = /* glsl */`
const vec2 ST = vec2(1080.0, 1920.0);
const float ATL = ${f(ATLAS)};
const vec2 HAND_O = ${v2([HAND.x, HAND.y])}, HAND_S = ${v2([HAND.w, HAND.h])}, HAND_P = ${v2(HAND.pivot)};
const vec2 HEAD_A = ${v2(HEAD.a)}, HEAD_B = ${v2(HEAD.b)}, HEAD_S = ${v2([HEAD.w, HEAD.h])}, HEAD_C = ${v2(HEAD.c)};
const vec2 EYE0 = ${v2(HEAD.eyes[0])}, EYE1 = ${v2(HEAD.eyes[1])}, EYE_R = ${v2(HEAD.eye)};
uniform vec4 uHand;     // match-head position (stage px), angle, on
uniform float uHandZ;   // the hand's base height
uniform vec4 uHead;     // head centre (stage px), angle, on
uniform float uHeadZ;
vec2 toLocal(vec2 q, vec4 xf, vec2 anchor) {
  float c = cos(xf.z), s = sin(xf.z);
  vec2 d = q - xf.xy;
  return anchor + vec2(c * d.x + s * d.y, -s * d.x + c * d.y);
}
vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
bool inRect(vec2 l, vec2 size) { return l.x > 0.5 && l.y > 0.5 && l.x < size.x - 0.5 && l.y < size.y - 0.5; }
`;

// ------------------------------------------------------------------ pass 1: the height that shadows see
export const HEIGHT_FRAG = /* glsl */`
uniform sampler2D uGeo, uSpA, uSpG;
varying vec2 vUv;
${SPRITE}
void main() {
  vec2 q = vec2(vUv.x, 1.0 - vUv.y) * ST;
  float h = texture(uGeo, q / ST).b;
  if (uHead.w > 0.5) {
    vec2 l = toLocal(q, uHead, HEAD_C);
    if (inRect(l, HEAD_S)) {
      vec2 uv = (HEAD_A + l) / ATL;
      float a = texture(uSpA, uv).a;
      h = mix(h, uHeadZ + texture(uSpG, uv).b, a);
    }
  }
  vec2 hand = vec2(0.0);
  if (uHand.w > 0.5) {
    vec2 l = toLocal(q, uHand, HAND_P);
    if (inRect(l, HAND_S)) {
      vec2 uv = (HAND_O + l) / ATL;
      float a = texture(uSpA, uv).a;
      float lh = texture(uSpG, uv).b;
      if (a > 0.02) hand = mix(vec2(0.0), vec2(uHandZ + lh, uHandZ - 24.0 - 0.5 * lh), a);
    }
  }
  gl_FragColor = vec4(h, hand, 1.0);
}`;

// ------------------------------------------------------------------ pass 2: screen-space height-field shadows
export const SHADOW_FRAG = /* glsl */`
uniform sampler2D uHgt;
uniform vec4 uL0, uL1;    // point lights: position (stage px, z toward the viewer), on
uniform vec4 uWD;         // window light: unit direction toward the light, on
uniform float uMaxH;      // nothing stands higher: a ray above it is free
uniform vec3 uK;          // penumbra sharpness per light
varying vec2 vUv;
const vec2 ST = vec2(1080.0, 1920.0);
vec4 hAt(vec2 xy) { return texture(uHgt, vec2(xy.x / ST.x, 1.0 - xy.y / ST.y)); }
// clearance of point X above the relief (negative = inside): the painted relief is solid down to the wall,
// the hand is a slab [bottom, top] floating above it
float clearance(vec3 X) {
  vec4 c = hAt(X.xy);
  float dz = X.z - c.r;
  if (c.g - c.b > 1.0) dz = min(dz, max(X.z - c.g, c.b - X.z));
  return dz;
}
float pointShadow(vec3 P, vec3 L, float k) {
  vec3 V = L - P;
  float len = length(V), res = 1.0;
  for (int i = 1; i <= 32; i++) {
    float t = pow(float(i) / 32.0, 1.35) * 0.97;
    vec3 X = P + V * t;
    if (X.z > uMaxH) break;
    res = min(res, k * clearance(X) / (t * len));
    if (res < 0.0) break;
  }
  return smoothstep(0.0, 1.0, res);
}
float dirShadow(vec3 P, vec3 D, float k) {
  float smax = max(0.0, uMaxH - P.z) / D.z, res = 1.0;
  for (int i = 1; i <= 24; i++) {
    float s = pow(float(i) / 24.0, 1.4) * smax;
    res = min(res, k * clearance(P + D * s) / s);
    if (res < 0.0) break;
  }
  return smoothstep(0.0, 1.0, res);
}
void main() {
  vec2 q = vec2(vUv.x, 1.0 - vUv.y) * ST;
  vec4 c = hAt(q);
  float h = c.g - c.b > 1.0 ? c.g : c.r;
  vec3 P = vec3(q, h + 1.5);
  float s0 = uL0.w > 0.0 ? pointShadow(P, uL0.xyz, uK.x) : 1.0;
  float s1 = uL1.w > 0.0 ? pointShadow(P, uL1.xyz, uK.y) : 1.0;
  float s2 = uWD.w > 0.0 ? dirShadow(P, uWD.xyz, uK.z) : 1.0;
  gl_FragColor = vec4(s0, s1, s2, clamp((h + 40.0) / 300.0, 0.0, 1.0));
}`;

// ------------------------------------------------------------------ pass 3: relight + effects + grade
export const LIGHT_FRAG = /* glsl */`
uniform sampler2D uAlb, uGeo, uMat, uSpA, uSpG, uShadow, uChip;
uniform vec3 uCam;                 // zoom, zoom centre (stage px)
uniform vec2 uShake;
uniform vec4 uL0, uL1;             // match, candle: position, intensity
uniform vec3 uC0, uC1;             // their colours (linear, white-balanced blackbody)
uniform vec2 uR;                   // falloff radii
uniform vec4 uWD;                  // window light: direction toward it, intensity
uniform vec3 uWC;                  // its colour
uniform float uWinZ;               // the gobo plane: the window's light is projected from this height
uniform vec3 uAmb;                 // night ambient
uniform vec3 uSkyC;                // dawn sky fill colour × intensity
uniform float uDawn;               // 0 night sky → 1 morning sky
uniform float uExpo;
uniform vec2 uEye;                 // eyelid opening, -
uniform vec2 uGaze;                // iris slide (head-local px)
uniform vec4 uF0, uF1;             // flames: base (stage px), height, lean
uniform vec2 uFW;                  // flame widths
uniform vec4 uGlow;                // match glow, candle glow, strike flash, wax glow
uniform vec4 uSpk[8];              // spark streaks (stage px)
uniform float uSpkI;
uniform vec4 uSmoke;               // candle smoke: age, strength; match smoke: age, strength
uniform vec4 uSmokeP;              // their sources (stage px)
uniform float uT;
uniform vec4 uChipR;               // chip rectangle on screen
uniform float uVig;
varying vec2 vUv;
${SPRITE}
vec3 toLin(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
vec3 toEnc(vec3 c) { c = clamp(c, 0.0, 1.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
vec3 aces(vec3 x) { return clamp(x * (2.51 * x + 0.03) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

// joint-bilateral upsampling of the half-resolution shadows: bilinear weights × height similarity
vec4 shadowAt(vec2 q, float h) {
  vec2 fq = vec2(q.x, ST.y - q.y) * 0.5 - 0.5, i0 = floor(fq), fr = fq - i0;
  vec4 acc = vec4(0.0);
  float ws = 0.0;
  for (int k = 0; k < 4; k++) {
    vec2 o = vec2(float(k - 2 * (k / 2)), float(k / 2));
    ivec2 ij = clamp(ivec2(i0 + o), ivec2(0), ivec2(539, 959));
    vec4 s = texelFetch(uShadow, ij, 0);
    float wb = mix(1.0 - fr.x, fr.x, o.x) * mix(1.0 - fr.y, fr.y, o.y);
    float w = wb * (exp(-abs(s.a * 300.0 - 40.0 - h) / 6.0) + 1e-3);
    acc += s * w; ws += w;
  }
  return acc / ws;
}

const float WRAP = 0.3;
void pointLight(vec3 P, vec3 N, float gloss, vec4 L, vec3 C, float r, float sh, inout vec3 E, inout vec3 Sp) {
  vec3 V = L.xyz - P;
  float d = length(V);
  vec3 l = V / d;
  float att = L.w / (1.0 + (d / r) * (d / r));          // 1 / (1 + (d/r)²): finite at the flame, inverse-square far away
  float ndl = dot(N, l);
  E += C * att * sh * (max(0.0, (ndl + WRAP) / (1.0 + WRAP))
       + 0.55 * pow(1.0 - N.z, 2.0) * max(0.0, dot(normalize(N.xy + 1e-5), normalize(l.xy + 1e-5))));   // rim
  vec3 Hv = normalize(l + vec3(0.0, 0.0, 1.0));
  float n = mix(10.0, 120.0, gloss * gloss);
  Sp += C * att * sh * gloss * pow(max(dot(N, Hv), 0.0), n) * (n + 8.0) / 25.13 * 0.22 * step(0.0, ndl);
}

// a flame in its own frame: y up from the wick, a teardrop whose half-width is W·√(y+0.2)·(1−y)^0.9
vec3 flame(vec2 q, vec4 F, float Wd, vec3 C) {
  if (F.z < 0.5) return vec3(0.0);
  vec2 p = q - F.xy; p.y = -p.y;
  float y = p.y / F.z;
  p.x -= F.w * y * y * F.z;
  float hw = Wd * sqrt(max(0.0, y + 0.2)) * pow(max(0.0, 1.0 - y), 0.9) * 1.2;
  float ex = abs(p.x) / max(hw, 0.4);
  float inY = smoothstep(-0.2, -0.08, y) * (1.0 - smoothstep(0.92, 1.0, y));
  float body = (1.0 - smoothstep(0.45, 1.0, ex)) * inY;
  float core = (1.0 - smoothstep(0.0, 0.62, ex)) * smoothstep(-0.1, 0.06, y) * (1.0 - smoothstep(0.08, 0.6, y));
  float root = (1.0 - smoothstep(0.3, 1.0, ex)) * smoothstep(-0.22, -0.1, y) * (1.0 - smoothstep(-0.06, 0.1, y));
  return C * body * 3.2 + vec3(1.0, 0.86, 0.62) * core * 6.0 + vec3(0.08, 0.16, 0.6) * root * 1.2;
}
vec3 glow(vec2 q, vec2 c, float I, vec3 C) {
  float d = length(q - c);
  return C * I * (0.55 * exp(-d * d / 1100.0) + 0.16 * exp(-d / 95.0) + 0.04 * exp(-d / 320.0));
}
// a rising smoke wisp: a thread whose sway grows with height, thinning and fading as it climbs
float smoke(vec2 q, vec2 src, float age, float seed) {
  if (age <= 0.0 || age > 3.0) return 0.0;
  float u = src.y - q.y;
  float top = 330.0 * (1.0 - exp(-age / 1.1));
  if (u < 0.0 || u > top + 40.0) return 0.0;
  float x = src.x + (3.0 + 0.1 * u) * sin(u * 0.034 - age * 2.4 + seed)
                  + 0.12 * u * sin(u * 0.012 - age * 0.9 + 1.3 + seed) - 0.08 * u;
  float w = 2.2 + 0.055 * u;
  float d = (q.x - x) / w;
  return exp(-d * d) * smoothstep(top + 40.0, top - 20.0, u) * (1.0 - smoothstep(0.0, 1.0, u / 340.0)) * smoothstep(0.0, 0.25, age) * (1.0 - smoothstep(1.6, 3.0, age));
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, ST.y - gl_FragCoord.y);
  vec2 q = uCam.yz + (frag - uCam.yz) / uCam.x + uShake;
  vec2 uv = q / ST;
  vec4 A = texture(uAlb, uv), G = texture(uGeo, uv), M = texture(uMat, uv);
  vec3 alb = toLin(A.rgb);
  float gloss = A.a, h = G.z, ao = G.w, sky = M.r, wax = M.b;
  vec2 nxy = G.xy;

  // ---- the cat's head (eyelids: the open-eyed copy shows inside two ellipses that open with uEye.x)
  if (uHead.w > 0.5) {
    vec2 l = toLocal(q, uHead, HEAD_C);
    if (inRect(l, HEAD_S)) {
      vec4 sa = texture(uSpA, (HEAD_A + l) / ATL), sg = texture(uSpG, (HEAD_A + l) / ATL);
      if (uEye.x > 0.001) {
        float op = 0.0;
        for (int k = 0; k < 2; k++) {
          vec2 e = (l - (k == 0 ? EYE0 : EYE1)) / vec2(EYE_R.x, EYE_R.y * uEye.x);
          op = max(op, 1.0 - smoothstep(0.8, 1.0, length(e)));
        }
        if (op > 0.0) {
          vec4 sb = texture(uSpA, (HEAD_B + l - uGaze) / ATL), gb = texture(uSpG, (HEAD_B + l) / ATL);
          sa = vec4(mix(sa.rgb, sb.rgb, op), sa.a); sg = mix(sg, gb, op);
        }
      }
      if (sa.a > 0.0) {
        alb = mix(alb, toLin(sa.rgb), sa.a);
        nxy = mix(nxy, rot(sg.xy, uHead.z), sa.a);
        h = mix(h, uHeadZ + sg.z, sa.a);
        gloss = mix(gloss, sg.w, sa.a); ao = mix(ao, 1.0, sa.a); wax *= 1.0 - sa.a;
      }
    }
  }
  // ---- the hand with the match
  if (uHand.w > 0.5) {
    vec2 l = toLocal(q, uHand, HAND_P);
    if (inRect(l, HAND_S)) {
      vec4 sa = texture(uSpA, (HAND_O + l) / ATL), sg = texture(uSpG, (HAND_O + l) / ATL);
      if (sa.a > 0.0) {
        alb = mix(alb, toLin(sa.rgb), sa.a);
        nxy = mix(nxy, rot(sg.xy, uHand.z), sa.a);
        h = mix(h, uHandZ + sg.z, sa.a);
        gloss = mix(gloss, sg.w, sa.a); ao = mix(ao, 1.0, sa.a); sky *= 1.0 - sa.a; wax *= 1.0 - sa.a;
      }
    }
  }

  vec3 N = vec3(nxy, sqrt(max(0.0, 1.0 - dot(nxy, nxy))));
  vec3 P = vec3(q, h);
  vec4 sh = shadowAt(q, h);
  vec3 E = uAmb * ao * (0.55 + 0.45 * N.z);
  // dawn sky fill: soft light from the window side, wrapped
  vec3 skyDir = normalize(vec3(-0.5, -0.45, 0.75));
  E += uSkyC * ao * (0.45 + 0.55 * max(0.0, (dot(N, skyDir) + 0.5) / 1.5));
  vec3 Sp = vec3(0.0);
  if (uL0.w > 0.0) pointLight(P, N, gloss, uL0, uC0, uR.x, sh.r, E, Sp);
  if (uL1.w > 0.0) pointLight(P, N, gloss, uL1, uC1, uR.y, sh.g, E, Sp);
  // window light: a directional light projected through the window (a gobo at height uWinZ)
  float beam = 0.0;
  if (uWD.w > 0.0) {
    vec2 S = q + uWD.xy * (uWinZ - h) / uWD.z;
    float ck = texture(uMat, S / ST).g;
    float ndl = dot(N, uWD.xyz);
    float lit = uWD.w * ck * sh.b;
    E += uWC * lit * (max(0.0, (ndl + 0.2) / 1.2) + 0.5 * pow(1.0 - N.z, 2.0) * max(0.0, dot(normalize(N.xy + 1e-5), normalize(uWD.xy + 1e-5))));
    vec3 Hv = normalize(uWD.xyz + vec3(0.0, 0.0, 1.0));
    float n = mix(10.0, 120.0, gloss * gloss);
    Sp += uWC * lit * gloss * pow(max(dot(N, Hv), 0.0), n) * (n + 8.0) / 25.13 * 0.18 * step(0.0, ndl);
    // haze: the shaft between the window and its patch (the gobo swept back toward the window)
    vec2 O = -uWD.xy * uWinZ / uWD.z;
    for (int i = 0; i < 16; i++) beam += texture(uMat, (q - O * ((float(i) + 0.5) / 16.0)) / ST).g;
    beam *= 0.0625 * uWD.w;
  }

  vec3 col = alb * E;
  // wax glows near the flame (light scattered inside the candle)
  float dw = length(q - uF1.xy - vec2(0.0, 10.0));
  col += wax * uC1 * uGlow.w * (0.9 * exp(-dw / 34.0) + 0.25 * exp(-dw / 110.0));
  // the sky through the glass: night gradient + stars/moon → morning
  float yy = clamp((q.y - 380.0) / 390.0, 0.0, 1.0);
  vec3 night = mix(vec3(0.010, 0.014, 0.045), vec3(0.020, 0.032, 0.090), yy) + vec3(0.55, 0.62, 0.85) * M.a * 0.9;
  vec3 morning = mix(vec3(0.42, 0.62, 0.95), vec3(1.35, 1.12, 1.0), yy * yy) * 1.6;
  vec3 skyc = mix(night, morning, uDawn);
  col = mix(col, skyc, sky) + Sp;
  // haze in the shaft + dust motes drifting in it
  if (beam > 0.0) {
    vec2 cell = floor(q / 46.0), cq = q - cell * 46.0;
    float r1 = hash(cell), r2 = hash(cell + 17.3), r3 = hash(cell + 41.9);
    vec2 mp = vec2(23.0) + 14.0 * vec2(sin(uT * (0.3 + 0.4 * r1) + 6.3 * r2), sin(uT * (0.25 + 0.35 * r2) + 6.3 * r3));
    float mote = step(0.55, r3) * exp(-dot(cq - mp, cq - mp) / 2.2) * (0.6 + 0.4 * sin(uT * 1.3 + 9.0 * r1));
    col += uWC * beam * (0.07 + 0.5 * mote);
  }
  // smoke: lit by the window light and the remaining ambient
  float sm = uSmoke.y * smoke(q, uSmokeP.xy, uSmoke.x, 0.0) + uSmoke.w * smoke(q, uSmokeP.zw, uSmoke.z, 2.1) * 0.7;
  col = mix(col, (uWC * uWD.w * 0.5 + uSkyC * 0.9 + uAmb * 6.0 + uC0 * uL0.w * 0.04) * vec3(0.92, 0.94, 1.0), clamp(sm * 0.55, 0.0, 0.8));
  // flames and their glow (additive light in the lens)
  col += flame(q, uF0, uFW.x, uC0) + flame(q, uF1, uFW.y, uC1);
  col += glow(q, uF0.xy - vec2(0.0, uF0.z * 0.35), uGlow.x, uC0) + glow(q, uF1.xy - vec2(0.0, uF1.z * 0.35), uGlow.y, uC1);
  col += uGlow.z * vec3(1.0, 0.85, 0.65) * (2.5 * exp(-dot(q - uHand.xy, q - uHand.xy) / 900.0) + 0.6 * exp(-length(q - uHand.xy) / 160.0));
  // sparks of the strike: short hot streaks
  if (uSpkI > 0.0) {
    for (int i = 0; i < 8; i++) {
      vec2 a = uSpk[i].xy, b = uSpk[i].zw, ab = b - a;
      float k = clamp(dot(q - a, ab) / max(dot(ab, ab), 1e-3), 0.0, 1.0);
      vec2 dd = q - a - ab * k;
      col += vec3(1.0, 0.78, 0.45) * uSpkI * (1.6 * exp(-dot(dd, dd) / 2.4) + 0.1 * exp(-dot(dd, dd) / 60.0));
    }
  }
  // exposure → ACES (Narkowicz fit) → sRGB, a soft vignette
  vec3 c = aces(col * uExpo);
  c = mix(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))), c, 0.9);   // a touch of desaturation: ACES pushes mid-tone chroma
  vec2 vq = (frag - vec2(540.0, 900.0)) / vec2(760.0, 1180.0);
  c *= 1.0 - uVig * smoothstep(0.35, 1.2, dot(vq, vq));
  c = toEnc(c);
  // the chip (drawn on a small canvas each frame)
  vec2 cl = (frag - uChipR.xy) / uChipR.zw;
  if (cl.x >= 0.0 && cl.y >= 0.0 && cl.x <= 1.0 && cl.y <= 1.0) {
    vec4 ch = texture(uChip, cl);
    c = mix(c, ch.rgb, ch.a);
  }
  gl_FragColor = vec4(c, 1.0);
}`;
