/*
 * 145 · 나무에 새긴 이름 — a laser engraver burns "늘 고마워" into a birch board.
 *
 *   setup()   the text mask at board resolution → the job plan (raster.js): boustrophedon rows, a trapezoidal velocity
 *             profile per row, so the head position p(t) and the pass time t_pass(x, y) of every pixel are closed forms
 *             → baked maps (art.js): t_pass (R32F), energy E = P/(v·d), beam-softened ink, depth h ∝ E, soot halo,
 *             relief gradients (RGBA16F) on top of a procedural birch veneer; sprites for the head and a brush,
 *             a smoke atlas; smoke and spark particles get their birth time and place from p(t).
 *   frame(t)  only uniforms change. 1 · emission at ½ res: every burnt pixel glows with T = T0·e^(−(t − t_pass)/τ)
 *             (blackbody colour, T⁴ radiance, averaged over the shutter) + sparks → four blur levels (glow and the
 *             fire's light) · 2 · the scene in linear HDR: bed, board (char, soot, wipe, top light, raking light with
 *             normals from the depth map), sparks, gantry, motion-blurred head, smoke, brush · 3 · bloom + tone map.
 */
import * as THREE from 'three';
import { defineDemo, rand, clamp, lerp, ramp, ease, track } from '../_lib/stage.js';
import { FONTS, fontReady, textAlpha } from '../_lib/type.js';
import { planJob } from './raster.js';
import { paintWood, bakeBurn, paintHead, paintBrush, paintSmoke } from './art.js';

const D = 10, W = 1080, H = 1920;
const BX = 90, BY = 330, BW = 900, BH = 1000, BRAD = 22, EDGE = 16;   // the board (stage px at rest), its front edge
const PITCH = 11, OVERSCAN = 24, SA = 110;                               // row pitch, overscan, acceleration distance (px)
const T_FIRE = 1.0, T_END = 6.45;                                       // the job
const SHUTTER = 0.25 / 30;                                              // 90° shutter at 30 fps
const TAU = 0.16, T_PEAK = 3000;                                        // flash: cooling time constant (s), peak temperature (K)
const EMBER = [1250, 0.9];                                              // ember: start temperature (K), time constant (s)
const EXHAUST = [800, 48];
const SERIF = `"${FONTS.gowunBatang.family}"`;
const PHRASE = '늘 고마워', DATE = '2026. 11. 01';
// the brush: three sweeps that start and end off screen (stage y of the bristle line, direction)
const STROKES = [{ t0: 6.66, t1: 7.46, y: 650, dir: 1 }, { t0: 7.52, t1: 8.32, y: 885, dir: -1 }];

const zoomOf = track([[0, 1.09], [1.4, 1.04, ease.outCubic], [3.4, 1.04], [5.6, 1.09], [6.8, 1.06], [8.2, 1.06], [D, 1.13]]);
const camYOf = track([[0, 900], [1.4, 880], [3.4, 880], [5.6, 830], [6.8, 860], [8.2, 860], [D, 820]]);
const ambOf = track([[0, 0.9], [1.0, 0.72], [6.5, 0.72], [7.1, 0.86], [8.2, 0.86], [9.3, 0.24]]);
const fadeOf = (t) => ramp(t, 0, 0.6) * (1 - ramp(t, D - 0.3, D));

// ---------------------------------------------------------------- GLSL shared by every pass
const COMMON = /* glsl */`
const vec2 STAGE = vec2(1080.0, 1920.0);
uniform vec4 uCam;                          // camera centre (stage px), zoom
vec2 toWorld(vec2 s) { return uCam.xy + (s - 0.5 * STAGE) / uCam.z; }
vec2 toScreen(vec2 w) { return (w - uCam.xy) * uCam.z + 0.5 * STAGE; }
vec4 toClip(vec2 w) { vec2 s = toScreen(w); return vec4(s.x / STAGE.x * 2.0 - 1.0, 1.0 - s.y / STAGE.y * 2.0, 0.0, 1.0); }
vec2 screenUv(vec2 w) { vec2 s = toScreen(w); return vec2(s.x / STAGE.x, 1.0 - s.y / STAGE.y); }
vec3 lin(vec3 c) { return pow(max(c, 0.0), vec3(2.2)); }
// blackbody colour (normalised, sRGB) — Tanner Helland's fit, valid 1000–40000 K, continued smoothly below
vec3 blackbody(float T) {
  float t = T / 100.0;
  float r = t <= 66.0 ? 1.0 : clamp(1.29293618606 * pow(max(t - 60.0, 1e-3), -0.1332047592), 0.0, 1.0);
  float g = t <= 66.0 ? clamp(0.39008157876 * log(max(t, 1.0)) - 0.63184144378, 0.0, 1.0)
                      : clamp(1.12989086089 * pow(max(t - 60.0, 1e-3), -0.0755148492), 0.0, 1.0);
  float b = t >= 66.0 ? 1.0 : (t <= 19.0 ? 0.0 : clamp(0.54320678911 * log(t - 10.0) - 1.19625408914, 0.0, 1.0));
  return vec3(r, g, b);
}
uniform float uT, uS, uTau, uTpeak;
// mean of (T/T0)^4 = exp(-4Δ/τ) over the shutter [t − S, t], Δ = t − t_pass (closed form)
float heatAvg(float d) {
  if (d <= 0.0) return 0.0;
  float k = 4.0 / uTau;
  float a = d < uS ? 1.0 - exp(-k * d) : exp(-k * (d - uS)) - exp(-k * d);
  return a / (k * uS);
}
uniform vec2 uEmber;                       // the char's slower afterglow: start temperature (K), time constant (s)
// radiance of a burnt pixel, two cooling terms T = T0·e^(−Δ/τ):
//   flash  (τ short, T0 3000 K): shutter-averaged radiance I, its temperature T = T0·I^¼ → white-hot spot, short tail
//   ember  (τ longer, T0 1250 K): radiance (T/T_peak)^4 → the orange-red rows that fade behind the head
vec3 glowOf(float d, float e) {
  if (d <= 0.0) return vec3(0.0);
  float hot = 0.9 + 0.05 * min(e, 2.5);                     // slower head, more energy, hotter
  float I = heatAvg(d);
  vec3 c = I > 1e-4 ? lin(blackbody(uTpeak * hot * sqrt(sqrt(I)))) * I : vec3(0.0);
  float Te = uEmber.x * hot * exp(-d / uEmber.y);
  float q = Te / uTpeak, Ie = q * q * q * q;
  if (Ie > 1e-5) c += lin(blackbody(Te)) * Ie;
  return c;
}
float sdRoundBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise1(float x) { float i = floor(x), f = fract(x); float u = f * f * (3.0 - 2.0 * f); return mix(hash12(vec2(i, 7.1)), hash12(vec2(i + 1.0, 7.1)), u); }
`;

const QUAD_VERT = /* glsl */`
varying vec2 vS;
void main() { vS = vec2(uv.x * 1080.0, (1.0 - uv.y) * 1920.0); gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// ---------------------------------------------------------------- 1 · emission (½ res)
const EMIT_FRAG = /* glsl */`
${COMMON}
uniform sampler2D tPass, tA;
uniform vec4 uBoard;
uniform vec3 uSpot;                        // nozzle spot (stage px) and laser-on fraction during the shutter
varying vec2 vS;
void main() {
  vec2 p = toWorld(vS);
  vec2 uv = (p - uBoard.xy) / uBoard.zw;
  vec3 e = vec3(0.0);
  if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
    vec4 A = texture2D(tA, uv);
    if (A.y > 0.003) e = glowOf(uT - texture2D(tPass, uv).r, A.x) * A.y * 9.0;
  }
  vec2 dv = p - uSpot.xy;
  e += vec3(1.0, 0.62, 0.32) * uSpot.z * 7.0 * exp(-dot(dv, dv) / (2.0 * 6.0 * 6.0));
  gl_FragColor = vec4(e, 1.0);
}`;

const BLUR_FRAG = /* glsl */`
uniform sampler2D tSrc;
uniform vec2 uDir;
varying vec2 vS;
void main() {
  vec2 uv = vec2(vS.x / 1080.0, 1.0 - vS.y / 1920.0);
  vec3 s = vec3(0.0); float ws = 0.0;
  for (int i = -6; i <= 6; i++) {
    float w = exp(-float(i * i) / 18.0);
    s += texture2D(tSrc, uv + uDir * float(i)).rgb * w; ws += w;
  }
  gl_FragColor = vec4(s / ws, 1.0);
}`;

// ---------------------------------------------------------------- 2 · the scene: bed + board
const BOARD_FRAG = /* glsl */`
${COMMON}
uniform sampler2D tWood, tA, tG, tPass, tL2, tL3, tL4;
uniform vec4 uBoard;
uniform float uBrad, uEdge, uAmb, uRake;
uniform vec3 uRakeDir;
uniform vec4 uHead;                        // shadow centre of the head (stage px), half-width, visibility
uniform float uBeamY;                      // nozzle row (stage px) the gantry follows
uniform vec4 uStroke[2];                   // y of the bristle line, bristle front x (at that y), direction, active
uniform float uTilt[2];                    // tan of the brush lean
uniform vec4 uBrush;                       // brush centre, angle, visibility
varying vec2 vS;

float hexD(vec2 p) { p = abs(p); return max(dot(p, vec2(0.5, 0.8660254)), p.x); }
vec2 hexLocal(vec2 uv) {
  const vec2 r = vec2(1.0, 1.7320508); vec2 h = r * 0.5;
  vec2 a = mod(uv, r) - h, b = mod(uv - h, r) - h;
  return dot(a, a) < dot(b, b) ? a : b;
}
float wipedAt(vec2 p) {
  float keep = 1.0;
  for (int k = 0; k < 2; k++) {
    vec4 s = uStroke[k];
    if (s.w < 0.5) continue;
    float bow = 14.0 * sin(3.14159265 * clamp((p.x + 220.0) / 1520.0, 0.0, 1.0));
    float band = 1.0 - smoothstep(124.0, 160.0, abs(p.y - s.x - bow));
    float fx = s.y - (p.y - s.x - bow) * uTilt[k];          // the bristle line leans with the brush
    float behind = s.z > 0.0 ? smoothstep(fx + 10.0, fx - 30.0, p.x) : smoothstep(fx - 10.0, fx + 30.0, p.x);
    float eff = 0.84 + 0.16 * vnoise1(p.y * 0.11 + float(k) * 17.0);
    keep *= 1.0 - band * behind * eff;
  }
  return 1.0 - keep;
}
vec3 bed(vec2 p) {
  float px = 1.0 / (21.0 * uCam.z);
  vec2 gv = hexLocal(p / 21.0);
  float e = hexD(gv);
  float rim = smoothstep(0.5 - 2.6 * px, 0.5 - 1.2 * px, e);
  float inner = smoothstep(0.5 - px, 0.5 + px, hexD(gv + vec2(0.0, -0.34)));
  vec3 floorC = lin(vec3(0.045, 0.043, 0.041));
  vec3 wallC = mix(lin(vec3(0.26, 0.255, 0.245)), lin(vec3(0.10, 0.098, 0.094)), smoothstep(-0.5, -0.1, gv.y));
  vec3 c = mix(floorC, wallC, inner);
  return mix(c, lin(vec3(0.42, 0.415, 0.40)), rim);
}
vec3 backWall(vec2 p) {
  vec3 c = mix(lin(vec3(0.085, 0.082, 0.08)), lin(vec3(0.12, 0.116, 0.11)), smoothstep(-60.0, 120.0, p.y));
  // exhaust vent: a rounded opening with louvres
  float dv = sdRoundBox(p - vec2(800.0, 48.0), vec2(178.0, 40.0), 16.0);
  if (dv < 0.0) {
    float f = fract((p.y - 8.0) / 16.0);
    vec3 slat = mix(lin(vec3(0.20, 0.195, 0.19)), lin(vec3(0.03)), smoothstep(0.35, 0.55, f));
    c = slat;
  }
  c = mix(c, lin(vec3(0.24, 0.235, 0.225)), smoothstep(3.0, 0.5, abs(dv)) * 0.8);
  // lip of the bed frame
  c = mix(c, lin(vec3(0.30, 0.295, 0.285)), smoothstep(112.0, 114.0, p.y) * (1.0 - smoothstep(118.0, 120.0, p.y)));
  return c;
}
vec3 rail(vec2 p, float x0) {
  float u = (p.x - x0) / 50.0;
  vec3 c = mix(lin(vec3(0.20, 0.205, 0.215)), lin(vec3(0.30, 0.305, 0.315)), smoothstep(0.0, 0.3, u) * (1.0 - smoothstep(0.55, 1.0, u)));
  c = mix(c, lin(vec3(0.06)), smoothstep(0.08, 0.02, abs(u - 0.5)));
  c = mix(c, lin(vec3(0.46, 0.465, 0.475)), smoothstep(0.03, 0.0, abs(u - 0.12)) * 0.7);
  return c;
}
void main() {
  vec2 p = toWorld(vS);
  vec2 suv = vS / STAGE; suv.y = 1.0 - suv.y;
  vec3 fire = texture2D(tL2, suv).rgb * 0.8 + texture2D(tL3, suv).rgb * 1.3 + texture2D(tL4, suv).rgb * 1.6;
  vec2 bc = uBoard.xy + 0.5 * uBoard.zw;
  float sdB = sdRoundBox(p - bc, 0.5 * uBoard.zw, uBrad);
  float led = mix(1.08, 0.84, smoothstep(150.0, 1650.0, p.y));
  // a soft pool of light on the work, the machine around it falls off into the dark
  vec2 pq = (p - vec2(540.0, 800.0)) / vec2(560.0, 680.0);
  float pool = mix(0.5, 1.14, exp(-dot(pq, pq) * 1.3));
  vec3 col;
  // shadows of the gantry, the head and the brush (soft, on whatever lies below)
  float shade = 1.0;
  shade *= 1.0 - 0.24 * exp(-pow((p.y - (uBeamY - 18.0)) / 46.0, 2.0)) * uHead.w;
  float hs = sdRoundBox(p - uHead.xy, vec2(uHead.z, 56.0), 30.0);
  shade *= 1.0 - 0.42 * (1.0 - smoothstep(-34.0, 40.0, hs)) * uHead.w;
  if (uBrush.w > 0.0) {
    vec2 q = p - (uBrush.xy + vec2(10.0, 30.0));
    float ca = cos(uBrush.z), sa = sin(uBrush.z);
    q = vec2(ca * q.x + sa * q.y, -sa * q.x + ca * q.y);
    float bs = min(sdRoundBox(q, vec2(70.0, 176.0), 46.0), sdRoundBox(q - vec2(0.0, 290.0), vec2(20.0, 122.0), 18.0));
    shade *= 1.0 - 0.36 * (1.0 - smoothstep(-26.0, 30.0, bs)) * uBrush.w;
  }
  if (sdB < 0.0) {
    vec2 uv = (p - uBoard.xy) / uBoard.zw;
    vec4 wood = texture2D(tWood, uv);
    vec4 A = texture2D(tA, uv);
    vec4 G = texture2D(tG, uv);
    float d = uT - texture2D(tPass, uv).r;
    float early = wood.a;
    vec3 alb = lin(wood.rgb);
    // soot halo: settles as the head passes, wiped off by the brush (streaky)
    float soot = A.w * smoothstep(0.0, 0.7, d) * (1.0 - wipedAt(p));
    alb *= mix(vec3(1.0), vec3(0.50, 0.37, 0.25), clamp(soot * 0.85, 0.0, 1.0));
    // char: darkness 1 − e^(−αE), earlywood darker; it sets in right behind the beam
    float burnt = smoothstep(0.0, 0.05, d);
    float dk = (1.0 - exp(-1.75 * A.x * (0.8 + 0.4 * early))) * burnt;
    vec3 caramel = lin(vec3(0.64, 0.42, 0.23)), brown = lin(vec3(0.27, 0.15, 0.075)), charC = lin(vec3(0.095, 0.055, 0.035));
    vec3 bc2 = mix(alb, caramel, smoothstep(0.0, 0.3, dk));
    bc2 = mix(bc2, brown, smoothstep(0.25, 0.8, dk));
    bc2 = mix(bc2, charC, smoothstep(0.82, 1.0, dk));
    alb = bc2;
    // relief: wood (always) + engraving (once burnt)
    vec2 g = G.zw + burnt * G.xy;
    vec3 n = normalize(vec3(-g, 1.0));
    vec3 Lt = normalize(vec3(0.0, -0.5, 1.0));
    float top = max(dot(n, Lt), 0.0) / Lt.z;
    vec3 light = vec3(0.93, 0.96, 1.0) * uAmb * led * pool * (0.35 + 0.65 * top) * shade;
    if (uRake > 0.001) {
      float ndl = max(dot(n, uRakeDir), 0.0);
      // cast shadow: does the surface between here and the light rise above the light ray?
      vec2 ld = normalize(uRakeDir.xy); float tanEl = uRakeDir.z / length(uRakeDir.xy);
      float occ = 0.0;
      for (int k = 1; k <= 4; k++) {
        float s = float(k * k) * 1.6 + 1.0;
        float dq = texture2D(tA, uv + ld * s / uBoard.zw).z;
        occ = max(occ, (A.z - dq) - s * tanEl);
      }
      float sh = 1.0 - smoothstep(0.0, 0.7, occ);
      float fall = mix(1.3, 0.5, smoothstep(0.0, 1080.0, p.x));
      light += vec3(1.0, 0.80, 0.58) * uRake * 3.6 * ndl * sh * fall;
    }
    col = alb * (light + fire * 1.15);
    col += glowOf(d, A.x) * A.y * 9.0;
    // a hairline of light along the board's top edges
    col += lin(vec3(1.0, 0.95, 0.85)) * 0.10 * uAmb * smoothstep(-2.5, -0.5, sdB) * smoothstep(0.0, 1.0, (bc.y - p.y) / uBoard.w + 0.5);
  } else {
    // the board's front edge (plywood layers), seen thanks to the slight forward tilt
    float sdF = sdRoundBox(p - bc - vec2(0.0, uEdge), 0.5 * uBoard.zw, uBrad);
    if (sdF < 0.0 && p.y > bc.y) {
      float k = clamp(sdB / uEdge, 0.0, 1.0);              // 0 at the top edge … 1 at the bed
      float lay = fract(k * 5.0);
      vec3 c = mix(lin(vec3(0.82, 0.71, 0.53)), lin(vec3(0.70, 0.57, 0.40)), step(0.5, fract(k * 2.5)));
      c = mix(c, lin(vec3(0.42, 0.33, 0.22)), smoothstep(0.14, 0.0, min(lay, 1.0 - lay)) * 0.55);
      col = c * (0.55 * uAmb * pool * shade + fire * 0.8);
      col *= 1.0 - 0.35 * smoothstep(0.6, 1.0, k);
    } else {
      vec3 c = p.y < 120.0 ? backWall(p) : bed(p);
      // the board's contact shadow on the honeycomb (falls toward the viewer)
      float sd2 = sdRoundBox(p - bc - vec2(0.0, uEdge + 6.0), 0.5 * uBoard.zw, uBrad);
      c *= mix(0.35, 1.0, smoothstep(0.0, 34.0, sd2));
      // the front frame
      if (p.y > 1640.0) c = mix(lin(vec3(0.19, 0.19, 0.195)), lin(vec3(0.02)), smoothstep(1650.0, 1760.0, p.y))
                           + lin(vec3(0.45)) * smoothstep(2.0, 0.0, abs(p.y - 1642.0)) * 0.5;
      col = c * (uAmb * led * pool * shade + fire * 0.9);
    }
  }
  if (p.x < 50.0) col = rail(p, 0.0) * (uAmb * led * pool + fire * 0.6);
  if (p.x > 1030.0) col = rail(p, 1030.0) * (uAmb * led * pool + fire * 0.6);
  gl_FragColor = vec4(col, 1.0);
}`;

// ---------------------------------------------------------------- the gantry beam (full width, follows the head row)
const BEAM_VERT = /* glsl */`
${COMMON}
uniform float uBeamY;
varying vec2 vW;
void main() {
  vW = vec2((position.x + 0.5) * 1180.0 - 50.0, uBeamY - 232.0 + (0.5 - position.y) * 110.0);
  gl_Position = toClip(vW);
}`;
const BEAM_FRAG = /* glsl */`
${COMMON}
uniform float uBeamY, uAmb;
uniform sampler2D tL3, tL4;
varying vec2 vW;
void main() {
  float y = vW.y - (uBeamY - 232.0);        // 0 at the quad's top edge … 110
  float x = vW.x;
  // the extrusion: top face 14..40, front face 40..80 (V-slots, the belt)
  float aBeam = smoothstep(13.5, 14.5, y) * (1.0 - smoothstep(79.5, 80.5, y));
  vec3 c = mix(lin(vec3(0.42, 0.43, 0.45)), lin(vec3(0.33, 0.34, 0.355)), clamp((y - 14.0) / 26.0, 0.0, 1.0));
  vec3 fr = mix(lin(vec3(0.17, 0.175, 0.185)), lin(vec3(0.12, 0.125, 0.13)), clamp((y - 40.0) / 40.0, 0.0, 1.0));
  fr = mix(fr, lin(vec3(0.05)), clamp(smoothstep(1.6, 0.4, abs(y - 48.0)) + smoothstep(1.6, 0.4, abs(y - 74.0)), 0.0, 1.0));
  float belt = smoothstep(56.5, 57.5, y) * (1.0 - smoothstep(65.5, 66.5, y));
  fr = mix(fr, lin(vec3(0.035)) * (0.85 + 0.3 * step(0.5, fract(x / 7.0))), belt);
  c = mix(c, fr, smoothstep(39.5, 40.5, y));
  c = mix(c, lin(vec3(0.62, 0.63, 0.65)), smoothstep(1.4, 0.0, abs(y - 15.0)) * 0.7);
  // carriages riding the side rails
  vec2 q = vec2(x, y);
  float car = min(sdRoundBox(q - vec2(36.0, 52.0), vec2(36.0, 48.0), 10.0), sdRoundBox(q - vec2(1044.0, 52.0), vec2(36.0, 48.0), 10.0));
  float aCar = 1.0 - smoothstep(-0.5, 0.5, car);
  vec3 cc = mix(lin(vec3(0.25, 0.255, 0.265)), lin(vec3(0.16, 0.165, 0.17)), clamp((y - 6.0) / 90.0, 0.0, 1.0));
  vec2 w1 = vec2(x < 540.0 ? 36.0 : 1044.0, 28.0), w2 = vec2(w1.x, 78.0);
  float wh = min(length(q - w1), length(q - w2));
  cc = mix(cc, lin(vec3(0.05)), smoothstep(10.0, 9.0, wh));
  cc = mix(cc, lin(vec3(0.38)), smoothstep(3.5, 2.5, wh));
  c = mix(c, cc, aCar);
  float a = max(aBeam, aCar);
  if (a < 0.001) discard;
  vec2 suv = screenUv(vW);
  vec3 fire = texture2D(tL3, suv).rgb * 1.2 + texture2D(tL4, suv).rgb * 1.8;
  gl_FragColor = vec4(c * (uAmb * 1.05 + fire) * a, a);
}`;

// ---------------------------------------------------------------- motion-blurred sprite (head, brush)
const SPRITE_VERT = /* glsl */`
${COMMON}
uniform vec4 uBox;
varying vec2 vW;
void main() { vW = mix(uBox.xy, uBox.zw, vec2(position.x + 0.5, 0.5 - position.y)); gl_Position = toClip(vW); }`;
const SPRITE_FRAG = /* glsl */`
${COMMON}
uniform sampler2D tSpr, tL3, tL4;
uniform vec2 uSize, uAnchor;
uniform vec3 uTaps[16];
uniform float uN, uAmb;
uniform vec4 uWarm;                        // underglow colour × strength, falloff radius (px from the anchor)
varying vec2 vW;
void main() {
  vec4 acc = vec4(0.0);
  for (int k = 0; k < 16; k++) {
    if (float(k) >= uN) break;
    vec2 q = vW - uTaps[k].xy;
    float c = cos(uTaps[k].z), s = sin(uTaps[k].z);
    q = vec2(c * q.x + s * q.y, -s * q.x + c * q.y);
    vec2 uv = (q + uAnchor) / uSize;
    if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) acc += texture2D(tSpr, uv);
  }
  acc /= uN;
  if (acc.a < 0.002) discard;
  vec3 c = lin(acc.rgb / acc.a);
  vec2 suv = screenUv(vW);
  vec3 fire = texture2D(tL3, suv).rgb * 1.0 + texture2D(tL4, suv).rgb * 1.6;
  float dn = length(vW - uTaps[0].xy);
  vec3 warm = uWarm.rgb * exp(-dn / uWarm.w);
  gl_FragColor = vec4(c * (uAmb * 1.1 + fire + warm) * acc.a, acc.a);
}`;

// ---------------------------------------------------------------- smoke (instanced, closed-form drift)
const SMOKE_VERT = /* glsl */`
${COMMON}
attribute float aBirth, aLife, aW;
attribute vec2 aOrigin;
attribute vec4 aSeed;
uniform vec2 uExhaust;
uniform float uAmb;
uniform sampler2D tL3, tL4;
varying vec2 vL;
varying float vA;
varying vec3 vCol;
varying vec2 vCell;
void main() {
  float age = uT - aBirth;
  if (age < 0.0 || age > aLife) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  // drift: an exponential approach to the exhaust, a rise toward the camera (seen as a lift up the frame), a curl
  float pull = 1.0 - exp(-age / 2.4);
  vec2 p = aOrigin + (uExhaust - aOrigin) * pull;
  p.y -= 40.0 * (1.0 - exp(-age / 0.5));
  p += vec2(sin(aSeed.x * 6.283 + 2.3 * age), cos(aSeed.y * 6.283 + 1.7 * age)) * (18.0 * age + 3.0);
  float size = 20.0 + 105.0 * age * (0.7 + 0.6 * aSeed.z);
  vec2 dir = normalize(uExhaust - aOrigin + vec2(0.0, -120.0));
  vec2 side = vec2(-dir.y, dir.x);
  vec2 corner = position.xy * 2.0;
  vec2 w = p + (dir * corner.y * 1.45 + side * corner.x) * size;
  float ang = aSeed.w * 6.283 + age * (aSeed.x - 0.5) * 1.2;
  float c = cos(ang), s = sin(ang);
  vL = vec2(c * corner.x - s * corner.y, s * corner.x + c * corner.y);
  float cell = floor(aSeed.z * 3.999);
  vCell = vec2(mod(cell, 2.0), floor(cell / 2.0)) * 0.5;
  vA = aW * smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(0.35 * aLife, aLife, age)) * 0.62;
  vec2 suv = screenUv(p);
  vec3 fire = texture2D(tL3, suv).rgb * 1.4 + texture2D(tL4, suv).rgb * 2.2;
  vCol = lin(vec3(0.86, 0.86, 0.88)) * (0.62 * uAmb) + fire * 0.9;
  gl_Position = toClip(w);
}`;
const SMOKE_FRAG = /* glsl */`
uniform sampler2D tSmoke;
varying vec2 vL;
varying float vA;
varying vec3 vCol;
varying vec2 vCell;
void main() {
  float r2 = dot(vL, vL);
  if (r2 > 1.0) discard;
  float a = texture2D(tSmoke, vCell + (vL * 0.5 + 0.5) * 0.5).a * vA;
  gl_FragColor = vec4(vCol * a, a);
}`;

// ---------------------------------------------------------------- sparks (instanced streaks, additive)
const SPARK_VERT = /* glsl */`
${COMMON}
attribute float aBirth, aLife, aSeed;
attribute vec2 aOrigin, aVel;
uniform float uGain;
varying float vY;
varying vec3 vCol;
vec2 at(float a) { const float k = 7.0; return aOrigin + aVel * (1.0 - exp(-k * a)) / k + vec2(0.0, -46.0 * a); }
void main() {
  float age = uT - aBirth;
  float a1 = min(age, aLife), a0 = max(age - 0.03, 0.0);
  if (age < 0.0 || a0 >= aLife) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  vec2 p0 = at(a0), p1 = at(a1);
  vec2 dv = p1 - p0; float len = length(dv);
  vec2 u = len > 1e-3 ? dv / len : vec2(1.0, 0.0), n = vec2(-u.y, u.x);
  float w = 2.0;
  float sx = position.x * 2.0, sy = position.y * 2.0;
  vec2 c = mix(p0, p1, sx * 0.5 + 0.5) + u * sx * w + n * sy * w;
  vY = sy;
  float T = uTpeak * 1.05 * exp(-a1 / (0.6 * aLife + 0.05));
  float I = pow(T / uTpeak, 4.0);
  vCol = lin(blackbody(T)) * I * uGain * (0.6 + 0.8 * aSeed) / (1.0 + len / (8.0 * w));
  gl_Position = toClip(c);
}`;
const SPARK_FRAG = /* glsl */`
varying float vY;
varying vec3 vCol;
void main() { float k = 1.0 - abs(vY); gl_FragColor = vec4(vCol * k * k, 1.0); }`;

// ---------------------------------------------------------------- 3 · bloom + tone map
const FINAL_FRAG = /* glsl */`
uniform sampler2D tScene, tL1, tL2, tL3, tL4;
uniform float uExpo, uFade, uFrame;
varying vec2 vS;
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main() {
  vec2 uv = vec2(vS.x / 1080.0, 1.0 - vS.y / 1920.0);
  vec3 c = texture2D(tScene, uv).rgb;
  c += texture2D(tL1, uv).rgb * 0.45 + texture2D(tL2, uv).rgb * 0.4 + texture2D(tL3, uv).rgb * 0.32 + texture2D(tL4, uv).rgb * 0.28;
  c = aces(c * uExpo);
  c = pow(c, vec3(1.0 / 2.2));
  vec2 q = (uv - 0.5) * vec2(1.0, 1.15);
  c *= 1.0 - 0.38 * dot(q, q) * 1.6;
  c += (hash12(vS + uFrame * 17.0) - 0.5) * (2.0 / 255.0);
  gl_FragColor = vec4(c * uFade, 1.0);
}`;

// ---------------------------------------------------------------- textures
function halfRGBA(arrs, w, h) {
  const n = w * h, u = new Uint16Array(n * 4), toH = THREE.DataUtils.toHalfFloat;
  for (let i = 0; i < n; i++) for (let c = 0; c < 4; c++) u[i * 4 + c] = toH(arrs[c][i]);
  const t = new THREE.DataTexture(u, w, h, THREE.RGBAFormat, THREE.HalfFloatType);
  t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
}
function floatR(f32, w, h) {
  const t = new THREE.DataTexture(f32, w, h, THREE.RedFormat, THREE.FloatType);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
}
function rgba8(u8, w, h, filter = THREE.LinearFilter) {
  const t = new THREE.DataTexture(u8, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
  t.minFilter = t.magFilter = filter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
}
function spriteTex(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.flipY = false; t.premultiplyAlpha = true; t.colorSpace = THREE.NoColorSpace;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  return t;
}
const rt = (w, h) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false });
const quadMesh = (mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); m.frustumCulled = false; return m; };
const shader = (vertexShader, fragmentShader, uniforms, blend) => {
  const m = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false });
  if (blend === 'add') Object.assign(m, { blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation });
  if (blend === 'over') Object.assign(m, { blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendEquation: THREE.AddEquation });
  return m;
};

// ---------------------------------------------------------------- the brush path
const sineIO = (u) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(u));
function strokeX(s, t) {
  const xs = s.dir > 0 ? -220 : 1300, xe = s.dir > 0 ? 1300 : -220;
  return lerp(xs, xe, sineIO((t - s.t0) / (s.t1 - s.t0)));
}
function brushAt(t) {
  for (const s of STROKES) {
    if (t >= s.t0 && t <= s.t1) {
      const x = strokeX(s, t), u = (t - s.t0) / (s.t1 - s.t0);
      const y = s.y + 14 * Math.sin(Math.PI * clamp((x + 220) / 1520));
      return { x, y, a: -0.3 + s.dir * 0.05 + 0.04 * Math.sin(Math.PI * u), vis: 1, dir: s.dir };
    }
  }
  return { x: -600, y: 0, a: 0, vis: 0, dir: 1 };
}

export default defineDemo({
  id: '145-laser-engrave',
  title: '나무에 새긴 이름',
  tech: '레이저 각인 · 래스터 주사 + 머문 시간에 따른 탄 깊이 + 흑체 열 자국',
  duration: D,
  background: '#0d0c0b',

  async setup(api) {
    await fontReady(`700 200px ${SERIF}`, PHRASE);
    await fontReady(`400 54px ${SERIF}`, DATE);

    // ---- the text mask at board resolution
    const cover = textAlpha(BW, BH, (ctx) => {
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.font = `700 100px ${SERIF}`;
      const size = Math.min(232, (770 / ctx.measureText(PHRASE).width) * 100);
      ctx.font = `700 ${size.toFixed(1)}px ${SERIF}`;
      ctx.fillText(PHRASE, BW / 2, 455);
      // a rule with a small heart
      ctx.lineCap = 'round'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.6;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(BW / 2 + s * 44, 532); ctx.lineTo(BW / 2 + s * 236, 532); ctx.stroke(); }
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(BW / 2 + s * 252, 532, 4.2, 0, Math.PI * 2); ctx.fill(); }
      const cx = BW / 2, cy = 533, k = 38;
      ctx.beginPath();
      ctx.moveTo(cx, cy + k * 0.42);
      ctx.bezierCurveTo(cx - k * 0.1, cy + k * 0.3, cx - k * 0.56, cy + k * 0.02, cx - k * 0.52, cy - k * 0.22);
      ctx.bezierCurveTo(cx - k * 0.48, cy - k * 0.5, cx - k * 0.12, cy - k * 0.54, cx, cy - k * 0.26);
      ctx.bezierCurveTo(cx + k * 0.12, cy - k * 0.54, cx + k * 0.48, cy - k * 0.5, cx + k * 0.52, cy - k * 0.22);
      ctx.bezierCurveTo(cx + k * 0.56, cy + k * 0.02, cx + k * 0.1, cy + k * 0.3, cx, cy + k * 0.42);
      ctx.fill();
      ctx.font = `400 54px ${SERIF}`;
      ctx.letterSpacing = '6px';
      ctx.fillText(DATE, BW / 2 + 3, 620);
    });

    // ---- the job: rows, profile, head path, pass times (board px; stage = + BX, BY)
    const job = planJob({
      cover, MW: BW, MH: BH, pitch: PITCH, overscan: OVERSCAN, sa: SA, tFire: T_FIRE, tEnd: T_END, stepT: 0.012,
      blocks: [{ y0: 560, y1: 680 }, { y0: 500, y1: 560 }, { y0: 200, y1: 500 }],   // burn order: date, rule, phrase
      park0: { x: 200 - BX, y: 60 - BY }, park1: { x: 220 - BX, y: -40 - BY }, tArrive: [0.12, 0.9], tPark: [T_END + 0.04, T_END + 0.62],
    });
    this.job = job;
    console.log(`raster: ${job.rows.length} rows, pitch ${PITCH}px, cruise ${job.V.toFixed(0)} px/s, accel ${(job.A / 1000).toFixed(0)}k px/s²`);

    const wood = paintWood(BW, BH, 145);
    const burn = bakeBurn({ cover, MW: BW, MH: BH, job, early: wood.early, relief: wood.relief, seed: 146 });
    // wood relief gradient (separate from the engraving: the letters must not show before they are burnt)
    const N = BW * BH, wgx = new Float32Array(N), wgy = new Float32Array(N);
    const R = wood.relief;
    for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
      const i = y * BW + x;
      wgx[i] = 0.5 * (R[y * BW + Math.min(BW - 1, x + 1)] - R[y * BW + Math.max(0, x - 1)]);
      wgy[i] = 0.5 * (R[Math.min(BH - 1, y + 1) * BW + x] - R[Math.max(0, y - 1) * BW + x]);
    }
    const egx = new Float32Array(N), egy = new Float32Array(N);
    for (let i = 0; i < N; i++) { egx[i] = burn.gx[i] - wgx[i]; egy[i] = burn.gy[i] - wgy[i]; }

    const smokeArt = paintSmoke(147);
    const head = paintHead(), brush = paintBrush(148);

    // ---- particles: born where and when the head fires (closed-form p(t))
    const r = rand(145);
    const smoke = { birth: [], life: [], w: [], origin: [], seed: [] };
    const onNear = (te) => { let s = 0; for (let k = -2; k <= 2; k++) s += job.head(te + k * 0.008).on; return s / 5; };
    for (let te = T_FIRE + 0.01; te < T_END; te += 0.017) {
      const w = onNear(te);
      if (w < 0.05) continue;
      const h = job.head(te);
      smoke.birth.push(te); smoke.life.push(1.5 + r() * 1.1); smoke.w.push(w);
      smoke.origin.push(h.x + BX + (r() - 0.5) * 10, h.y + BY + (r() - 0.5) * 6);
      smoke.seed.push(r(), r(), r(), r());
    }
    // the last rows keep smouldering for a moment after the head leaves
    const lastY = job.rows[job.rows.length - 1].yc;
    for (let i = 0; i < 16; i++) {
      const te = T_END + 0.02 + i * 0.04, x = 140 + r() * 620;
      if (job.cov(x, lastY + 6) + job.cov(x + 20, lastY + 10) < 0.3) continue;
      smoke.birth.push(te); smoke.life.push(1.3 + r() * 0.8); smoke.w.push(0.55 * Math.exp(-i / 8));
      smoke.origin.push(x + BX, lastY + BY + 4); smoke.seed.push(r(), r(), r(), r());
    }
    const sparks = { birth: [], life: [], seed: [], origin: [], vel: [] };
    for (let i = 0; i < 2600; i++) {
      const te = T_FIRE + r() * (T_END - T_FIRE), h = job.head(te);
      if (h.on < 0.6) continue;
      const a = r() * Math.PI * 2, sp = 220 + 780 * r() * r();
      sparks.birth.push(te); sparks.life.push(0.1 + 0.36 * r() * r()); sparks.seed.push(r());
      sparks.origin.push(h.x + BX, h.y + BY); sparks.vel.push(Math.cos(a) * sp, Math.sin(a) * sp * 0.8 - 60);
    }

    // ---- three.js
    const el = api.layer('canvas', { z: 0 });
    el.width = W; el.height = H;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    this.renderer = renderer;
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const tex = {
      wood: rgba8(wood.rgba, BW, BH),
      A: halfRGBA([burn.E, burn.Mb, burn.depth, burn.soot], BW, BH),
      G: halfRGBA([egx, egy, wgx, wgy], BW, BH),
      pass: floatR(burn.tPass, BW, BH),
      smoke: rgba8(smokeArt.data, smokeArt.size, smokeArt.size),
      head: spriteTex(head.canvas), brush: spriteTex(brush.canvas),
    };
    tex.smoke.generateMipmaps = true; tex.smoke.minFilter = THREE.LinearMipmapLinearFilter;

    this.rtE = rt(540, 960);
    this.lv = [[540, 960], [270, 480], [135, 240], [68, 120]].map(([w, h]) => ({ a: rt(w, h), b: rt(w, h), w, h }));
    this.rtScene = rt(W, H);
    const L = this.lv.map((l) => l.b.texture);

    // shared uniforms (the same objects are referenced by every material)
    const C = {
      uCam: { value: new THREE.Vector4(540, 900, 1, 0) }, uT: { value: 0 }, uS: { value: SHUTTER },
      uTau: { value: TAU }, uTpeak: { value: T_PEAK }, uEmber: { value: new THREE.Vector2(...EMBER) }, uAmb: { value: 1 },
    };
    const boardV = new THREE.Vector4(BX, BY, BW, BH);
    this.C = C;

    // 1 · emission
    this.uE = { ...C, tPass: { value: tex.pass }, tA: { value: tex.A }, uBoard: { value: boardV }, uSpot: { value: new THREE.Vector3() } };
    this.sceneE = new THREE.Scene();
    this.sceneE.add(quadMesh(shader(QUAD_VERT, EMIT_FRAG, this.uE)));
    const sparkGeo = new THREE.InstancedBufferGeometry();
    sparkGeo.setAttribute('position', new THREE.PlaneGeometry(1, 1).getAttribute('position'));
    sparkGeo.setIndex(new THREE.PlaneGeometry(1, 1).getIndex());
    const ia = (arr, n) => new THREE.InstancedBufferAttribute(new Float32Array(arr), n);
    sparkGeo.setAttribute('aBirth', ia(sparks.birth, 1)); sparkGeo.setAttribute('aLife', ia(sparks.life, 1));
    sparkGeo.setAttribute('aSeed', ia(sparks.seed, 1)); sparkGeo.setAttribute('aOrigin', ia(sparks.origin, 2));
    sparkGeo.setAttribute('aVel', ia(sparks.vel, 2));
    sparkGeo.instanceCount = sparks.birth.length;
    const sparkMat = shader(SPARK_VERT, SPARK_FRAG, { ...C, uGain: { value: 16 } }, 'add');
    sparkMat.side = THREE.DoubleSide;   // the streak quad's winding follows the spark's direction
    const sparkE = new THREE.Mesh(sparkGeo, sparkMat); sparkE.frustumCulled = false; sparkE.renderOrder = 1;
    this.sceneE.add(sparkE);

    // blur
    this.uBlur = { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } };
    this.sceneBlur = new THREE.Scene();
    this.sceneBlur.add(quadMesh(shader(QUAD_VERT, BLUR_FRAG, this.uBlur)));

    // 2 · the scene
    this.sceneMain = new THREE.Scene();
    let order = 0;
    const add = (mesh) => { mesh.frustumCulled = false; mesh.renderOrder = order++; this.sceneMain.add(mesh); return mesh; };
    this.uB = {
      ...C, tWood: { value: tex.wood }, tA: { value: tex.A }, tG: { value: tex.G }, tPass: { value: tex.pass },
      tL2: { value: L[1] }, tL3: { value: L[2] }, tL4: { value: L[3] },
      uBoard: { value: boardV }, uBrad: { value: BRAD }, uEdge: { value: EDGE }, uRake: { value: 0 }, uRakeDir: { value: new THREE.Vector3(-1, 0, 0.2) },
      uHead: { value: new THREE.Vector4() }, uBeamY: { value: 0 },
      uStroke: { value: [0, 1].map(() => new THREE.Vector4()) }, uTilt: { value: [0, 0] }, uBrush: { value: new THREE.Vector4() },
    };
    add(quadMesh(shader(QUAD_VERT, BOARD_FRAG, this.uB)));
    add(new THREE.Mesh(sparkGeo, sparkMat));
    const smokeGeo = new THREE.InstancedBufferGeometry();
    smokeGeo.setAttribute('position', new THREE.PlaneGeometry(1, 1).getAttribute('position'));
    smokeGeo.setIndex(new THREE.PlaneGeometry(1, 1).getIndex());
    smokeGeo.setAttribute('aBirth', ia(smoke.birth, 1)); smokeGeo.setAttribute('aLife', ia(smoke.life, 1));
    smokeGeo.setAttribute('aW', ia(smoke.w, 1)); smokeGeo.setAttribute('aOrigin', ia(smoke.origin, 2));
    smokeGeo.setAttribute('aSeed', ia(smoke.seed, 4));
    smokeGeo.instanceCount = smoke.birth.length;
    this.uSmoke = { ...C, tSmoke: { value: tex.smoke }, tL3: { value: L[2] }, tL4: { value: L[3] }, uExhaust: { value: new THREE.Vector2(...EXHAUST) } };
    add(new THREE.Mesh(smokeGeo, shader(SMOKE_VERT, SMOKE_FRAG, this.uSmoke, 'over')));
    this.uBeam = { ...C, uBeamY: { value: 0 }, tL3: { value: L[2] }, tL4: { value: L[3] } };
    add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shader(BEAM_VERT, BEAM_FRAG, this.uBeam, 'over')));
    const spriteU = (t, art, n) => ({
      ...C, tSpr: { value: t }, tL3: { value: L[2] }, tL4: { value: L[3] },
      uSize: { value: new THREE.Vector2(...art.size) }, uAnchor: { value: new THREE.Vector2(...art.anchor) },
      uTaps: { value: Array.from({ length: 16 }, () => new THREE.Vector3()) }, uN: { value: n },
      uBox: { value: new THREE.Vector4() }, uWarm: { value: new THREE.Vector4(0, 0, 0, 60) },
    });
    this.uHeadS = spriteU(tex.head, head, 16);
    add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shader(SPRITE_VERT, SPRITE_FRAG, this.uHeadS, 'over')));
    this.uBrushS = spriteU(tex.brush, brush, 8);
    add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shader(SPRITE_VERT, SPRITE_FRAG, this.uBrushS, 'over')));
    this.head = head; this.brush = brush;

    // 3 · final
    this.uF = { tScene: { value: this.rtScene.texture }, tL1: { value: L[0] }, tL2: { value: L[1] }, tL3: { value: L[2] }, tL4: { value: L[3] },
      uExpo: { value: 1 }, uFade: { value: 1 }, uFrame: { value: 0 } };
    this.sceneF = new THREE.Scene();
    this.sceneF.add(quadMesh(shader(QUAD_VERT, FINAL_FRAG, this.uF)));

    for (const s of [this.sceneE, this.sceneBlur, this.sceneMain, this.sceneF]) renderer.compile(s, this.cam);
  },

  frame(t) {
    const { renderer, cam, C, job } = this;
    C.uT.value = t;
    C.uCam.value.set(540, camYOf(t), zoomOf(t), 0);
    C.uAmb.value = ambOf(t);

    // ---- the head over the shutter: 16 taps on the closed-form path
    const taps = this.uHeadS.uTaps.value;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, on = 0;
    for (let k = 0; k < 16; k++) {
      const h = job.head(t - (SHUTTER * k) / 15);
      const x = h.x + BX, y = h.y + BY;
      taps[k].set(x, y, 0);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      on += h.on / 16;
    }
    const [aw, ah] = this.head.anchor, [sw, sh] = this.head.size;
    this.uHeadS.uBox.value.set(x0 - aw - 2, y0 - ah - 2, x1 + (sw - aw) + 2, y1 + (sh - ah) + 2);
    const hx = 0.5 * (x0 + x1), hy = taps[0].y;
    // the nozzle's underside catches the burn: the laser itself plus the still-hot rows just behind it
    const warmK = 3.2 * on + 0.6 * clamp((t - T_FIRE) / 0.3) * (1 - ramp(t, T_END, T_END + 0.6));
    this.uHeadS.uWarm.value.set(1.0 * warmK, 0.36 * warmK, 0.08 * warmK, 70);
    this.uE.uSpot.value.set(taps[0].x, taps[0].y, on);
    this.uB.uHead.value.set(hx, hy + 4, 74 + 0.5 * (x1 - x0), 1);
    this.uB.uBeamY.value = hy;
    this.uBeam.uBeamY.value = hy;

    // ---- the brush and the wipe
    const b = brushAt(t);
    const btaps = this.uBrushS.uTaps.value;
    let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity;
    for (let k = 0; k < 8; k++) {
      const q = brushAt(t - (SHUTTER * k) / 7);
      const qq = q.vis ? q : b;
      btaps[k].set(qq.x, qq.y, qq.a);
      bx0 = Math.min(bx0, qq.x); bx1 = Math.max(bx1, qq.x); by0 = Math.min(by0, qq.y); by1 = Math.max(by1, qq.y);
    }
    this.uBrushS.uBox.value.set(bx0 - 330, by0 - 280, bx1 + 330, by1 + 480);
    this.uB.uBrush.value.set(b.x, b.y, b.a, b.vis);
    STROKES.forEach((s, k) => {
      const front = t < s.t0 ? (s.dir > 0 ? -400 : 1500) : t > s.t1 ? (s.dir > 0 ? 1500 : -400) : strokeX(s, t) + s.dir * 34;
      this.uB.uStroke.value[k].set(s.y, front, s.dir, t >= s.t0 ? 1 : 0);
      this.uB.uTilt.value[k] = Math.tan(t >= s.t0 && t <= s.t1 ? b.a : -0.3 + s.dir * 0.05);
    });

    // ---- light
    const rake = ramp(t, 8.2, 9.3);
    this.uB.uRake.value = rake;
    const phi = lerp(0.42, -0.05, ease.inOutCubic(clamp((t - 8.2) / (D - 8.2)))), el = 0.16;
    this.uB.uRakeDir.value.set(-Math.cos(phi) * Math.cos(el), -Math.sin(phi) * Math.cos(el), Math.sin(el));
    this.uF.uExpo.value = 1.0 + 0.22 * Math.exp(-(((t - 1.03) / 0.1) ** 2));
    this.uF.uFade.value = fadeOf(t);
    this.uF.uFrame.value = Math.round(t * 30);

    // ---- passes
    renderer.setRenderTarget(this.rtE);
    renderer.render(this.sceneE, cam);
    let src = this.rtE.texture;
    for (const l of this.lv) {
      this.uBlur.tSrc.value = src; this.uBlur.uDir.value.set(1 / l.w, 0);
      renderer.setRenderTarget(l.a); renderer.render(this.sceneBlur, cam);
      this.uBlur.tSrc.value = l.a.texture; this.uBlur.uDir.value.set(0, 1 / l.h);
      renderer.setRenderTarget(l.b); renderer.render(this.sceneBlur, cam);
      src = l.b.texture;
    }
    renderer.setRenderTarget(this.rtScene);
    renderer.render(this.sceneMain, cam);
    renderer.setRenderTarget(null);
    renderer.render(this.sceneF, cam);
  },
});
