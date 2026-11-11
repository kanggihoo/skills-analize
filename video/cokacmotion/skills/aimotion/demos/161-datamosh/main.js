/*
 * 161 · 녹아내리는 컷 — datamosh: drop the keyframe and the new shot's motion vectors drag the old picture.
 *
 * A video codec stores I-frames (a whole picture) and P-frames (one motion vector per 16×16 macroblock, half-pel,
 * plus a residual). Delete the I-frame at a cut and the decoder keeps applying the NEW shot's vectors to the OLD
 * picture: D_n(x) = D_{n−1}(x − mv_n(x)) (+ residual). The old picture melts along the new motion until the next
 * I-frame snaps the picture clean.
 *
 * Three illustrated shots are painted once (art.js). Their motion is analytic, so every shot's vector field is known
 * exactly: B's water turns faster near the centre (ω(r)), its koi swim faster than the water, its branch is still;
 * C's first P-frame is the camera's push-in plus the record's spin. The decoder runs as ONE closed-form pass per
 * frame, no feedback state: from the pixel x at frame n it marches back to the dropped keyframe, subtracting at each
 * frame the half-pel vector of the macroblock it is in (luma and chroma with their own rounding), multiplies the
 * residual's survival, and samples the last picture before the cut there.
 *
 *   0 – 2.57   shot A: still life (the strip explains I and P; A's own vectors are nearly zero)
 *   2.57       cut to B, its I-frame dropped (struck through): the flowers ride the koi's whirlpool, the koi bleed in
 *   3.87       the next I-frame: clean pond
 *   5.33       cut to C, its I-frame dropped and its first P-frame repeated ×42: the pond blooms outward
 *   6.73       I-frame: the turntable, clean; the title
 */
import * as THREE from 'three';
import { defineDemo, clamp, lerp, ramp, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import {
  W, H, TAU, PAL, mk, paintA, paintB, paintC, A_PIVOT, A_ZOOM_C, B_C, B_TEX, PADS, KOI, KOI_NOSE, KOI_TAIL, KOI_ROW,
  BRANCH, C_C, REC_R, LABEL_R, REC_TEX, ARM,
} from './art.js';

const D = 10, FPS = 30;
const KR = '"Pretendard Variable"';
// ---------------------------------------------------------------- the edit (frame numbers at 30 fps)
const CUT1 = 77;     // first frame of B — its I-frame is deleted
const KEY1 = 116;    // B's next I-frame
const CUT2 = 160;    // first frame of C — its I-frame is deleted, its first P-frame repeated
const KEY2 = 202;    // C's I-frame
const MB = 32;       // macroblock: 16 video px = 32 stage px (the clip is encoded at 540 × 960)
// ---------------------------------------------------------------- motion
const A_PUSH = 0.035;                              // A: push-in over the shot
const aZoom = (tf) => 1 + A_PUSH * tf / (CUT1 / FPS);
const aSway = (tf) => 0.014 * Math.sin(TAU * tf / 2.6 + 0.6);
const B_W0 = 1.7, B_R0 = 380, B_T0 = 4.1;         // ω(r) = W0 / (1 + (r/R0)²); texture phase origin
const omegaB = (r) => B_W0 / (1 + (r / B_R0) * (r / B_R0));
const C_S0 = 0.76, C_S1 = 1.065, C_TZ = 0.45, C_SPIN = TAU * (100 / 3) / 60;   // push-in, 33⅓ rpm
const cZoom = (tf) => C_S1 - (C_S1 - C_S0) * Math.exp(-Math.max(0, tf - CUT2 / FPS) / C_TZ);
const C_ZF = cZoom(CUT2 / FPS + 1 / FPS) / cZoom(CUT2 / FPS);   // the repeated P-frame's zoom per frame
// residual survival per frame: the old picture fades by (1 − β) wherever the new shot was not predicted by its vectors
const BETA_B = 0.004, BETA_KOI = 0.1, BETA_C = 0.0025, CHROMA_GAIN = 0.012;

// ---------------------------------------------------------------- GLSL
const f = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));
const v2 = (a) => `vec2(${f(a[0])}, ${f(a[1])})`;
const hexv = (h) => `vec3(${[1, 3, 5].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(4)).join(', ')})`;

const VERT = /* glsl */`void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const COMMON = /* glsl */`
precision highp float;
#define TAU 6.28318531
const vec2 SZ = vec2(${f(W)}, ${f(H)});
const vec2 BC = ${v2(B_C)};
const vec2 CC = ${v2(C_C)};
const float DT = ${(1 / FPS).toFixed(8)};
vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
vec2 stageRT(vec2 p) { return vec2(p.x / SZ.x, 1.0 - p.y / SZ.y); }   // render targets: row 0 at the bottom
vec2 blockC(vec2 p) { return (floor(p / ${f(MB)}) + 0.5) * ${f(MB)}; }
vec2 halfPel(vec2 mv) { return floor(mv + 0.5); }                       // 1 stage px = ½ video px
float roundAway(float x) { return sign(x) * floor(abs(x) + 0.5); }
float segD(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0); return length(pa - ba * h); }

// ---- B: the pond. Water turns about BC with ω(r); koi k swims a circle of radius R at Ω (> water), head angle φ0 + Ω t
float omegaB(float r) { float q = r / ${f(B_R0)}; return ${f(B_W0)} / (1.0 + q * q); }
const vec4 KOI0 = vec4(${KOI[0].slice(0, 4).map(f).join(', ')});   // R, φ0, Ω, scale
const vec4 KOI1 = vec4(${KOI[1].slice(0, 4).map(f).join(', ')});
const float KOI_LEN = ${f(KOI_NOSE - KOI_TAIL)};
// is a point (polar r, ph about BC) inside koi k's body at time t? (the body follows the arc behind the head)
bool inKoi(vec4 K, float r, float ph, float t) {
  float u = mod(K.y + K.z * t - ph, TAU) * K.x;
  float L = (KOI_LEN - 90.0) * K.w;
  if (u > L) return false;
  float hw = 66.0 * K.w * (u < 0.62 * L ? 0.35 + 0.65 * u / (0.62 * L) : 1.0);
  return abs(r - K.x) < hw;
}
const vec4 BRANCH = vec4(${BRANCH.map(f).join(', ')});
// B's P-frame at time t: the displacement (stage px) of the block centred at bc since the previous frame
vec2 mvB(vec2 bc, float t, out float beta) {
  beta = ${f(BETA_B)};
  vec2 e = (bc - BRANCH.xy) / BRANCH.zw;
  if (dot(e, e) < 1.0) return vec2(0.0);                       // the still branch: zero vectors
  vec2 d = bc - BC; float r = length(d), ph = atan(d.y, d.x);
  float w = omegaB(r);
  if (inKoi(KOI0, r, ph, t)) { w = KOI0.z; beta = ${f(BETA_KOI)}; }
  else if (inKoi(KOI1, r, ph, t)) { w = KOI1.z; beta = ${f(BETA_KOI)}; }
  vec2 prev = BC + r * vec2(cos(ph - w * DT), sin(ph - w * DT));
  vec2 mv = bc - prev;
  float l = length(mv);
  return l > 64.0 ? mv * 64.0 / l : mv;                        // search range ±32 video px
}
// ---- C: its first P-frame — the camera pushes in on the record (zoom ZF about CC), the record turns inside the disc
const float C_ZF = ${C_ZF.toFixed(6)}, C_S0 = ${f(C_S0)}, C_SPIN = ${C_SPIN.toFixed(6)};
const vec2 ARM0 = ${v2(ARM[0])}, ARM1 = ${v2(ARM[1])};
vec2 mvC(vec2 bc, out float beta) {
  beta = ${f(BETA_C)};
  vec2 d = bc - CC;
  vec2 prev = CC + d / C_ZF;
  vec2 q = CC + d / C_S0;                                      // the block's point on the turntable in that frame
  if (length(q - CC) < ${f(REC_R)} && segD(q, ARM0, ARM1) > 34.0) prev = CC + rot(d / C_ZF, -C_SPIN * DT);
  vec2 mv = bc - prev;
  float l = length(mv);
  return l > 64.0 ? mv * 64.0 / l : mv;
}
`;

// ---- shot A: wall, table, vase (bg) + bouquet (swaying layer); slow push-in
const FRAG_A = COMMON + /* glsl */`
uniform sampler2D uBg, uFl;
uniform float uZoom, uSway;
void main() {
  vec2 p = vec2(gl_FragCoord.x, SZ.y - gl_FragCoord.y);
  vec2 q = ${v2(A_ZOOM_C)} + (p - ${v2(A_ZOOM_C)}) / uZoom;
  vec3 col = textureLod(uBg, q / SZ, 0.0).rgb;
  vec2 qf = ${v2(A_PIVOT)} + rot(q - ${v2(A_PIVOT)}, -uSway);
  vec4 fl = textureLod(uFl, qf / SZ, 0.0);
  col = col * (1.0 - fl.a) + fl.rgb;
  gl_FragColor = vec4(col, 1.0);
}`;

// ---- shot B: water (rotated per radius), koi bent along their circles, pads orbiting, the still branch
const NP = PADS.length;
const FRAG_B = COMMON + /* glsl */`
uniform sampler2D uWater, uPads, uKoi, uTop;
uniform float uT;
uniform vec4 uPad[${NP}];       // centre x, y, rotation, scale
uniform vec2 uCell[${NP}];      // atlas cell origin (px)
vec4 koiAt(vec2 p, vec4 K, float row, float lod) {
  vec2 d = p - BC; float r = length(d), ph = atan(d.y, d.x);
  float u = mod(K.y + K.z * uT - ph, TAU) * K.x;               // arc length behind the nose
  float L = (KOI_LEN + 30.0) * K.w;
  if (u > L) return vec4(0.0);
  float wig = 15.0 * K.w * (u / L) * (u / L) * sin(TAU * u / (0.9 * L) - 7.0 * uT + row * 2.0);
  float sy = (r - K.x - wig) / K.w;
  if (abs(sy) > 126.0) return vec4(0.0);
  vec2 sp = vec2(${f(KOI_NOSE)} - u / K.w, row * ${f(KOI_ROW)} + 128.0 + sy);
  return textureLod(uKoi, sp / vec2(640.0, 512.0), lod);
}
vec4 padAt(vec2 p, int i, float lod) {
  vec4 P = uPad[i];
  vec2 v = p - P.xy;
  if (dot(v, v) > 140.0 * 140.0 * P.w * P.w) return vec4(0.0);
  vec2 l = rot(v, -P.z) / P.w + 128.0;
  return textureLod(uPads, (uCell[i] + clamp(l, 1.0, 255.0)) / vec2(1024.0, 512.0), lod);
}
void main() {
  vec2 p = vec2(gl_FragCoord.x, SZ.y - gl_FragCoord.y);
  vec2 d = p - BC; float r = length(d);
  vec4 wt = textureLod(uWater, rot(d, -omegaB(r) * (uT - ${f(B_T0)})) / ${f(B_TEX)} + 0.5, 0.0);
  vec3 col = wt.rgb * (1.0 - 0.1 * smoothstep(600.0, 1300.0, r));
  // koi: soft shadow on the deep water, then the fish, tinted a little by the water above them
  vec2 so = vec2(18.0, 30.0);
  float sh = koiAt(p - so, KOI0, 0.0, 3.5).a + koiAt(p - so, KOI1, 1.0, 3.5).a;
  col *= 1.0 - 0.3 * clamp(sh, 0.0, 1.0);
  vec4 k1 = koiAt(p, KOI1, 1.0, 0.0);
  col = col * (1.0 - k1.a) + mix(k1.rgb, wt.rgb * k1.a, 0.16);
  vec4 k0 = koiAt(p, KOI0, 0.0, 0.0);
  col = col * (1.0 - k0.a) + mix(k0.rgb, wt.rgb * k0.a, 0.12);
  // light on the surface passes over the fish
  col = mix(col, vec3(0.93, 1.0, 0.97), 0.5 * wt.a);
  // pads: shadows first, then the leaves and flowers
  float ps = 0.0;
  for (int i = 0; i < ${NP}; i++) ps = max(ps, padAt(p - vec2(10.0, 18.0), i, 2.5).a);
  col *= 1.0 - 0.22 * ps;
  for (int i = 0; i < ${NP}; i++) { vec4 c = padAt(p, i, 0.0); col = col * (1.0 - c.a) + c.rgb; }
  vec4 tb = textureLod(uTop, p / SZ, 0.0);
  col = col * (1.0 - tb.a) + tb.rgb;
  gl_FragColor = vec4(col, 1.0);
}`;

// ---- shot C: lilac table, plinth, spinning record with a fixed sheen, tonearm; camera push-in about the record
const FRAG_C = COMMON + /* glsl */`
uniform sampler2D uBase, uRec, uArm;
uniform float uS, uAng;
vec4 inside(sampler2D t, vec2 q, float lod) {
  if (q.x < 0.0 || q.y < 0.0 || q.x > SZ.x || q.y > SZ.y) return vec4(0.0);
  return textureLod(t, q / SZ, lod);
}
void main() {
  vec2 p = vec2(gl_FragCoord.x, SZ.y - gl_FragCoord.y);
  vec2 q = CC + (p - CC) / uS;
  float lod = max(0.0, -log2(uS));
  vec3 col = mix(${hexv('#d6caf4')}, ${hexv('#bfaeea')}, smoothstep(-300.0, 2400.0, q.y + 0.35 * q.x));
  float pl = abs(fract(q.x / 172.0) - 0.5) * 172.0;
  col *= 1.0 - 0.07 * (1.0 - smoothstep(1.0, 2.6, pl * uS));
  vec4 b = inside(uBase, q, lod);
  col = col * (1.0 - b.a) + b.rgb;
  vec2 d = q - CC; float rd = length(d);
  if (rd < ${f(REC_R + 3)}) {
    vec4 rc = textureLod(uRec, (rot(d, -uAng) + ${f(REC_TEX / 2)}) / ${f(REC_TEX)}, lod);
    col = col * (1.0 - rc.a) + rc.rgb;
    // the sheen stays with the light while the record turns under it
    float a = atan(d.y, d.x), s = sin(a - 0.95);
    float lobe = exp(-s * s / 0.012) * smoothstep(${f(LABEL_R + 10)}, ${f(LABEL_R + 60)}, rd) * (1.0 - smoothstep(${f(REC_R - 14)}, ${f(REC_R - 4)}, rd));
    col += vec3(0.42, 0.44, 0.62) * 0.3 * lobe;
  }
  vec4 am = inside(uArm, q, lod);
  col = col * (1.0 - am.a) + am.rgb;
  gl_FragColor = vec4(col, 1.0);
}`;

// ---- the decoder without the keyframe, in closed form (rendered at the clip's own 540 × 960)
const FRAG_MOSH = COMMON + /* glsl */`
uniform sampler2D uSrc;     // the last picture decoded before the cut (mipmapped)
uniform int uMode;          // 0: B's own P-frames, 1: C's first P-frame repeated
uniform int uN;             // frames decoded since the cut
uniform float uCutT;        // time of the first frame after the cut
uniform float uGain;        // chroma gain per repeat (the repeated residual)
vec3 toYCC(vec3 c) { float y = dot(c, vec3(0.299, 0.587, 0.114)); return vec3(y, (c.b - y) * 0.564, (c.r - y) * 0.713); }
vec3 toRGB(vec3 v) { return vec3(v.x + 1.403 * v.z, v.x - 0.344 * v.y - 0.714 * v.z, v.x + 1.773 * v.y); }
void main() {
  vec2 x = vec2(gl_FragCoord.x, 960.0 - gl_FragCoord.y) * 2.0;   // this video pixel's centre in stage px
  vec2 p = x, pc = x;          // luma and chroma sample points, marched back frame by frame
  float T = 1.0, h = 0.0;      // survival of the old picture; half-pel interpolations met on the way
  for (int j = 0; j < 48; j++) {
    if (j >= uN) break;
    float beta;
    vec2 bc = blockC(p);
    vec2 mv = uMode == 0 ? mvB(bc, uCutT + float(uN - 1 - j) * DT, beta) : mvC(bc, beta);
    vec2 q = halfPel(mv);                                        // luma: half-pel = whole stage px
    vec2 qc = 2.0 * vec2(roundAway(q.x * 0.5), roundAway(q.y * 0.5));   // chroma (4:2:0): its own half-pel rounding
    p -= q; pc -= qc;
    h += abs(q.x - 2.0 * floor(q.x * 0.5)) + abs(q.y - 2.0 * floor(q.y * 0.5));
    T *= 1.0 - beta;
  }
  // every half-pel step averages two pixels: the moved picture softens (σ² = h/8 video px²)
  float sig = 2.0 * sqrt(h / 8.0);
  float lod = min(1.1, 0.6 * log2(1.0 + sig));
  vec3 cy = textureLod(uSrc, stageRT(p), lod).rgb;
  vec3 cc = textureLod(uSrc, stageRT(pc), lod + 1.0).rgb;        // chroma is stored at half resolution
  vec3 v = vec3(toYCC(cy).x, toYCC(cc).yz);
  // codec texture where blocks have travelled: coarse quantiser, and the repeated residual pumps the chroma
  float m = smoothstep(2.0, 24.0, length(p - x));
  v.yz *= 1.0 + uGain * float(uN) * m;
  vec3 qv = vec3(floor(v.x * 34.0 + 0.5) / 34.0, floor(v.yz * 26.0 + 0.5) / 26.0);
  v = mix(v, qv, m);
  vec3 col = clamp(toRGB(v), 0.0, 1.0);
  gl_FragColor = vec4(col * T, T);                               // premultiplied by what is left of the old picture
}`;

// ---- final: picture (+ mosh), macroblock vectors, keyframe lift, vignette, the strip/titles overlay
const FRAG_OUT = COMMON + /* glsl */`
uniform sampler2D uScene, uMosh, uOver;
uniform float uMoshOn, uVec, uVecT, uAZ, uFlash, uFade;
uniform int uVecMode;
vec2 fieldNow(vec2 bc) {
  float b;
  if (uVecMode == 0) return (bc - ${v2(A_ZOOM_C)}) * uAZ;
  if (uVecMode == 1) return mvB(bc, uVecT, b);
  return mvC(bc, b);
}
void main() {
  vec2 p = vec2(gl_FragCoord.x, SZ.y - gl_FragCoord.y);
  vec3 col = texture(uScene, stageRT(p)).rgb;
  if (uMoshOn > 0.5) { vec4 m = texture(uMosh, stageRT(p)); col = col * (1.0 - m.a) + m.rgb; }
  if (uVec > 0.0) {
    // what the decoder reads for this frame: one half-pel vector per macroblock (every other one drawn, ×2.4)
    vec2 fm = mod(p, ${f(MB)});
    float gl = min(min(fm.x, ${f(MB)} - fm.x), min(fm.y, ${f(MB)} - fm.y));
    col = mix(col, vec3(1.0), (1.0 - smoothstep(0.0, 1.2, gl)) * 0.12 * uVec);
    vec2 gc = (floor(p / ${f(2 * MB)}) + 0.5) * ${f(2 * MB)};   // one arrow per 2 × 2 blocks: its upper-left block's vector
    vec2 q = halfPel(fieldNow(gc - ${f(MB / 2)})), bc = gc;
    float L = length(q), len = min(2.4 * L, 52.0);
    vec2 dir = L > 0.01 ? q / L : vec2(1.0, 0.0), n = vec2(-dir.y, dir.x);
    vec2 a = bc - dir * len * 0.5, e = bc + dir * len * 0.5;
    float dd = len < 4.0 ? length(p - bc) - 1.4
      : min(segD(p, a, e), min(segD(p, e, e - dir * 8.0 + n * 6.0), segD(p, e, e - dir * 8.0 - n * 6.0))) - 0.6;
    col = mix(col, ${hexv(PAL.ink)}, (1.0 - smoothstep(1.5, 3.6, dd)) * 0.4 * uVec);
    col = mix(col, vec3(1.0), (1.0 - smoothstep(0.4, 1.4, dd)) * 0.95 * uVec);
  }
  col += vec3(0.1, 0.09, 0.08) * uFlash;
  vec2 vq = (p - vec2(540.0, 900.0)) / SZ;
  col *= 1.0 - 0.2 * smoothstep(0.32, 0.8, length(vq * vec2(1.3, 1.0)));
  col = mix(${hexv(PAL.cream)}, col, uFade);
  vec4 o = texture(uOver, stageRT(p));
  col = mix(col, o.rgb, o.a);
  gl_FragColor = vec4(col, 1.0);
}`;

// ---------------------------------------------------------------- textures
function dataTex(img, w, h, { premult = false, mips = false } = {}) {
  const src = img.data || img.getContext('2d').getImageData(0, 0, w, h).data;
  const d = new Uint8Array(src.length);
  for (let i = 0; i < src.length; i += 4) {
    const a = premult ? src[i + 3] / 255 : 1;
    d[i] = Math.round(src[i] * a); d[i + 1] = Math.round(src[i + 1] * a); d[i + 2] = Math.round(src[i + 2] * a); d[i + 3] = src[i + 3];
  }
  const t = new THREE.DataTexture(d, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
  t.magFilter = THREE.LinearFilter;
  t.minFilter = mips ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  t.generateMipmaps = mips;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
  return t;
}

// ---------------------------------------------------------------- the strip: a codec timeline of the whole clip
const SX0 = 84, SX1 = 996;
const sx = (t) => SX0 + (SX1 - SX0) * t / D;
const ft = (n) => n / FPS;
const split = (a, b, k, type) => Array.from({ length: k }, (_, i) => [lerp(a, b, i / k), lerp(a, b, (i + 1) / k), type]);
const BOXES = [
  [0, 0.34, 'I'], ...split(0.34, ft(CUT1), 4, 'P'),
  [ft(CUT1), ft(CUT1) + 0.34, 'X'], ...split(ft(CUT1) + 0.34, ft(KEY1), 3, 'M'),
  [ft(KEY1), ft(KEY1) + 0.34, 'I'], ...split(ft(KEY1) + 0.34, ft(CUT2), 3, 'P'),
  [ft(CUT2), ft(CUT2) + 0.34, 'X'], [ft(CUT2) + 0.34, ft(KEY2), 'R'],
  [ft(KEY2), ft(KEY2) + 0.34, 'I'], ...split(ft(KEY2) + 0.34, D, 5, 'P'),
];
const STATUS = [
  [0.35, 'I는 그림 전체, P는 움직임만'],
  [ft(CUT1), 'I 프레임 삭제: 꽃이 물살을 탄다'],
  [ft(KEY1), '다음 I 프레임에서 깨끗하게'],
  [ft(CUT2), `같은 P 프레임 ×${KEY2 - CUT2}: 벡터가 쌓인다`],
  [ft(KEY2), 'I 프레임: 새 컷'],
];
const TITLE = '녹는 여름', KICK = 'B면 · 두 번째 곡';
const GLYPHS = '코덱 타임라인IPX×0123456789:·RPMB면' + STATUS.map((s) => s[1]).join('') + TITLE + KICK;

function bakePanel() {
  const [c, g] = mk(W, 320);
  g.shadowColor = 'rgba(44,47,78,0.16)'; g.shadowBlur = 30; g.shadowOffsetY = 10;
  g.fillStyle = 'rgba(255,250,242,0.93)';
  g.beginPath(); g.roundRect(48, 64, 984, 168, 34); g.fill();
  return c;
}
function bakeTitleCard() {
  const [c, g] = mk(W, 300);
  g.shadowColor = 'rgba(44,47,78,0.18)'; g.shadowBlur = 34; g.shadowOffsetY = 12;
  g.fillStyle = '#fff8ee';
  g.beginPath(); g.roundRect(150, 50, 780, 200, 40); g.fill();
  return c;
}

function drawOverlay(g, t, panel, card) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.lineCap = 'butt'; g.lineJoin = 'miter'; g.setLineDash([]); g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  g.clearRect(0, 0, W, H);
  // ---- panel slides down at the start
  const kin = ease.outCubic(ramp(t, 0.05, 0.55));
  const oy = -40 * (1 - kin);
  g.globalAlpha = kin;
  g.drawImage(panel, 0, oy);
  g.fillStyle = PAL.ink; g.globalAlpha = kin * 0.5;
  g.font = `700 22px ${KR}`; g.fillText('코덱 타임라인', 84, 114 + oy);
  // status: crossfade between beats
  g.textAlign = 'right'; g.font = `800 27px ${KR}`;
  for (let i = 0; i < STATUS.length; i++) {
    const [t0, s] = STATUS[i], t1 = i + 1 < STATUS.length ? STATUS[i + 1][0] : 99;
    const a = ease.outCubic(ramp(t, t0, t0 + 0.22)) * (1 - ramp(t, t1 - 0.12, t1));
    if (a <= 0) continue;
    g.globalAlpha = kin * a; g.fillStyle = PAL.ink;
    g.fillText(s, 996, 115 + oy + 10 * (1 - a));
  }
  g.textAlign = 'center';
  // ---- boxes
  const y0 = 142 + oy, bh = 58;
  for (const [a, b, type] of BOXES) {
    const x0 = sx(a) + 2.5, x1 = sx(b) - 2.5, w = x1 - x0, cx = (x0 + x1) / 2;
    const hit = t >= a;
    g.globalAlpha = kin;
    if (type === 'I') {
      g.fillStyle = PAL.ink; g.beginPath(); g.roundRect(x0, y0, w, bh, 10); g.fill();
      g.fillStyle = PAL.cream; g.font = `800 26px ${KR}`; g.fillText('I', cx, y0 + 38);
      if (hit && t < a + 0.4) {           // the keyframe lands: a ring opens around it
        const e = (t - a) / 0.4;
        g.globalAlpha = kin * (1 - e); g.strokeStyle = PAL.ink; g.lineWidth = 3;
        g.beginPath(); g.roundRect(x0 - 12 * e, y0 - 12 * e, w + 24 * e, bh + 24 * e, 10 + 12 * e); g.stroke();
      }
    } else if (type === 'X') {
      // a keyframe that will be deleted: whole until the playhead reaches it, then struck through
      const k = clamp((t - a) / 0.14);
      if (k <= 0) {
        g.fillStyle = PAL.ink; g.beginPath(); g.roundRect(x0, y0, w, bh, 10); g.fill();
        g.fillStyle = PAL.cream; g.font = `800 26px ${KR}`; g.fillText('I', cx, y0 + 38);
      } else {
        g.strokeStyle = 'rgba(44,47,78,0.3)'; g.lineWidth = 2;
        g.beginPath(); g.roundRect(x0 + 1, y0 + 1, w - 2, bh - 2, 9); g.stroke();
        g.fillStyle = 'rgba(44,47,78,0.3)'; g.font = `800 26px ${KR}`; g.fillText('I', cx, y0 + 38);
        g.strokeStyle = PAL.accent; g.lineWidth = 6; g.lineCap = 'round';
        const ax = x0 - 7, ay = y0 + bh + 6, bx = x1 + 7, by = y0 - 6;
        g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax + (bx - ax) * k, ay + (by - ay) * k); g.stroke();
        g.lineCap = 'butt';
      }
    } else {
      const melt = type === 'M' || type === 'R';
      g.fillStyle = melt ? '#e7ddfa' : '#ffffff';
      g.beginPath(); g.roundRect(x0, y0, w, bh, 10); g.fill();
      g.strokeStyle = melt ? 'rgba(120,96,190,0.35)' : 'rgba(44,47,78,0.16)'; g.lineWidth = 2;
      g.beginPath(); g.roundRect(x0 + 1, y0 + 1, w - 2, bh - 2, 9); g.stroke();
      g.fillStyle = PAL.ink; g.globalAlpha = kin * 0.62; g.font = `800 26px ${KR}`;
      if (type === 'R') {
        g.fillText(`P ×${KEY2 - CUT2}`, cx, y0 + 34);
        // one tick per repeat: the same P-frame decoded again and again
        g.fillStyle = 'rgba(120,96,190,0.6)';
        const n = KEY2 - CUT2, step = (w - 16) / n;
        for (let i = 0; i < n; i++) g.fillRect(Math.round(x0 + 8 + i * step), y0 + bh - 14, 1, 7);
      } else g.fillText('P', cx, y0 + 38);
    }
  }
  // ---- playhead
  g.globalAlpha = kin;
  const px = sx(t);
  g.fillStyle = PAL.accent;
  g.beginPath(); g.roundRect(px - 2.5, y0 - 8, 5, bh + 18, 2.5); g.fill();
  g.beginPath(); g.arc(px, y0 - 8, 7, 0, TAU); g.fill();

  // ---- title card on the clean last shot
  const tin = ft(KEY2) + 0.18;
  const tk = ease.outCubic(ramp(t, tin, tin + 0.45));
  if (tk > 0) {
    const cy = 1430 + 30 * (1 - tk);
    g.globalAlpha = tk;
    g.drawImage(card, 0, cy - 50);
    g.textAlign = 'center';
    g.fillStyle = PAL.ink; g.globalAlpha = tk * 0.6; g.font = `700 28px ${KR}`;
    g.fillText(KICK, 540, cy + 50);
    const chars = Array.from(TITLE);
    g.font = `900 104px ${KR}`;
    const widths = chars.map((c) => g.measureText(c).width), total = widths.reduce((s, w) => s + w, 0) - 4 * (chars.length - 1);
    let x = 540 - total / 2;
    g.textAlign = 'left';
    for (let i = 0; i < chars.length; i++) {
      const k = ease.outBack(clamp((t - tin - 0.06 * i) / 0.4), 1.4);
      if (k > 0) {
        g.globalAlpha = clamp(k * 1.5) * tk; g.fillStyle = PAL.accent;
        g.fillText(chars[i], x, cy + 164 + 34 * (1 - k));
      }
      x += widths[i] - 4;
    }
  }
  g.globalAlpha = 1;
}

// ---------------------------------------------------------------- demo
defineDemo({
  id: '161-datamosh',
  title: '녹아내리는 컷',
  tech: '데이터모시 · 키프레임을 빼면 움직임 벡터가 앞 장면을 끌고 간다',
  duration: D,
  fps: FPS,
  background: PAL.cream,

  async setup(api) {
    await fontReady(`900 104px ${KR}`, GLYPHS);
    await fontReady(`800 27px ${KR}`, GLYPHS);
    await fontReady(`700 22px ${KR}`, GLYPHS);

    const A = paintA(), B = paintB(), C = paintC(KR);
    const tex = {
      aBg: dataTex(A.bg, W, H), aFl: dataTex(A.fl, W, H, { premult: true }),
      water: dataTex(B.water, B.water.width, B.water.height, { mips: true }),
      pads: dataTex(B.pads, 1024, 512, { premult: true, mips: true }),
      koi: dataTex(B.koi, 640, 512, { premult: true, mips: true }),
      top: dataTex(B.top, W, H, { premult: true }),
      cBase: dataTex(C.base, W, H, { premult: true, mips: true }),
      rec: dataTex(C.rec, REC_TEX, REC_TEX, { premult: true, mips: true }),
      arm: dataTex(C.arm, W, H, { premult: true, mips: true }),
    };

    const el = api.layer('canvas', { z: 0 });
    el.width = W; el.height = H;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.autoClear = false;

    const mat = (frag, uniforms) => new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: frag, depthTest: false, depthWrite: false });
    const U = {
      A: { uBg: { value: tex.aBg }, uFl: { value: tex.aFl }, uZoom: { value: 1 }, uSway: { value: 0 } },
      B: {
        uWater: { value: tex.water }, uPads: { value: tex.pads }, uKoi: { value: tex.koi }, uTop: { value: tex.top }, uT: { value: 0 },
        uPad: { value: PADS.map(() => new THREE.Vector4()) },
        uCell: { value: PADS.map((q) => new THREE.Vector2((q[3] % 4) * 256, Math.floor(q[3] / 4) * 256)) },
      },
      C: { uBase: { value: tex.cBase }, uRec: { value: tex.rec }, uArm: { value: tex.arm }, uS: { value: 1 }, uAng: { value: 0 } },
      M: { uSrc: { value: null }, uMode: { value: 0 }, uN: { value: 1 }, uCutT: { value: 0 }, uGain: { value: 0 } },
      O: {
        uScene: { value: null }, uMosh: { value: null }, uOver: { value: null }, uMoshOn: { value: 0 }, uVec: { value: 0 },
        uVecT: { value: 0 }, uAZ: { value: 0 }, uVecMode: { value: 0 }, uFlash: { value: 0 }, uFade: { value: 1 },
      },
    };
    const M = { A: mat(FRAG_A, U.A), B: mat(FRAG_B, U.B), C: mat(FRAG_C, U.C), M: mat(FRAG_MOSH, U.M), O: mat(FRAG_OUT, U.O) };
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), M.A);
    quad.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(quad);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const rt = (w, h, mips = false) => new THREE.WebGLRenderTarget(w, h, {
      type: THREE.UnsignedByteType, depthBuffer: false, generateMipmaps: mips,
      minFilter: mips ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter, magFilter: THREE.LinearFilter,
    });
    const RT = { scene: rt(W, H), mosh: rt(540, 960), lastA: rt(W, H, true), lastB: rt(W, H, true) };

    const ovC = document.createElement('canvas');
    ovC.width = W; ovC.height = H;
    const ovG = ovC.getContext('2d', api.headless ? { willReadFrequently: true } : undefined);
    const ovTex = new THREE.CanvasTexture(ovC);
    ovTex.minFilter = ovTex.magFilter = THREE.NearestFilter;
    ovTex.generateMipmaps = false;
    U.O.uOver.value = ovTex;
    U.O.uScene.value = RT.scene.texture;
    U.O.uMosh.value = RT.mosh.texture;

    Object.assign(this, { renderer, scene, cam, quad, M, U, RT, ovG, ovTex, panel: bakePanel(), card: bakeTitleCard() });

    // the last pictures before each cut — what the decoder still holds when the keyframe is gone
    this.pass(M.A, RT.lastA, () => this.setA(ft(CUT1 - 1)));
    this.pass(M.B, RT.lastB, () => this.setB(ft(CUT2 - 1)));
    // warm-up: every program (both mosh modes, the vector overlay) once, then wait for the GPU with a 1-pixel read
    this.frame(ft(CUT1 + 20));
    this.frame(ft(CUT2 + 30));
    this.frame(1.8);
    const gl = renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  },

  pass(material, target, set) {
    if (set) set();
    this.quad.material = material;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.cam);
  },
  setA(tf) { this.U.A.uZoom.value = aZoom(tf); this.U.A.uSway.value = aSway(tf); },
  setB(tf) {
    const U = this.U.B;
    U.uT.value = tf;
    PADS.forEach(([r, a0, s, , rot0], i) => {
      const th = omegaB(r) * (tf - B_T0), a = a0 + th;
      U.uPad.value[i].set(B_C[0] + r * Math.cos(a), B_C[1] + r * Math.sin(a), rot0 + th, s);
    });
  },
  setC(tf) { this.U.C.uS.value = cZoom(tf); this.U.C.uAng.value = C_SPIN * tf; },

  frame(t) {
    const S = this, { M, U, RT } = S;
    const F = Math.round(t * FPS), tf = F / FPS;   // the clip is a 30 fps video: shots and decoder step per frame
    // ---- the shot at this frame
    if (F < CUT1) S.pass(M.A, RT.scene, () => S.setA(tf));
    else if (F < CUT2) S.pass(M.B, RT.scene, () => S.setB(tf));
    else S.pass(M.C, RT.scene, () => S.setC(tf));
    // ---- the decoder without the keyframe
    let mosh = 0;
    if (F >= CUT1 && F < KEY1) {
      U.M.uSrc.value = RT.lastA.texture; U.M.uMode.value = 0; U.M.uN.value = F - CUT1 + 1; U.M.uCutT.value = ft(CUT1); U.M.uGain.value = 0;
      mosh = 1;
    } else if (F >= CUT2 && F < KEY2) {
      U.M.uSrc.value = RT.lastB.texture; U.M.uMode.value = 1; U.M.uN.value = F - CUT2 + 1; U.M.uCutT.value = ft(CUT2); U.M.uGain.value = CHROMA_GAIN;
      mosh = 1;
    }
    if (mosh) S.pass(M.M, RT.mosh);
    // ---- macroblock vectors: A's (almost none) → B's whirlpool at the cut; B's → the repeated P-frame at the bloom
    let vis = 0, mode = 0;
    if (t < (ft(KEY1) + ft(CUT2)) / 2) {
      vis = ramp(t, 1.7, 1.95) * (1 - ramp(t, ft(CUT1) + 0.45, ft(CUT1) + 0.7));
      mode = F < CUT1 ? 0 : 1;
    } else {
      vis = ramp(t, ft(CUT2) - 0.45, ft(CUT2) - 0.25) * (1 - ramp(t, ft(CUT2) + 0.18, ft(CUT2) + 0.36));
      mode = F < CUT2 ? 1 : 2;
    }
    U.O.uVec.value = 0.62 * vis;
    U.O.uVecMode.value = mode;
    U.O.uVecT.value = tf;
    U.O.uAZ.value = 1 - aZoom(tf - 1 / FPS) / aZoom(tf);
    U.O.uMoshOn.value = mosh;
    const fl = (k) => (F >= k && F < k + 8 ? Math.exp(-(F - k) / 2.2) : 0);
    U.O.uFlash.value = fl(KEY1) + fl(KEY2);
    U.O.uFade.value = lerp(0.35, 1, ease.outCubic(ramp(t, 0, 0.5)));
    drawOverlay(S.ovG, t, S.panel, S.card);
    S.ovTex.needsUpdate = true;
    S.pass(M.O, null);
  },
});
