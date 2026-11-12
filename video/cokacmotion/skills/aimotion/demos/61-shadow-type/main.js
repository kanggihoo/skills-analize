/*
 * 61 · 그림자로 읽는 글자 — a projection sculpture (after Hofstadter's G·E·B block) that reads 불 in a warm light from
 * the side and 물 in a cool light from above.
 *
 *  · solid.js   S = extrude(불 along x) ∩ extrude(물 along y), built exactly on an adaptive grid from the Pretendard Black
 *               outlines (both glyphs share the horizontal axis z, so every column of each glyph is inked in the other:
 *               both shadows are their glyphs, IoU 1.000). Exposed faces carry their distance to convex / concave edges.
 *  · story      the sculpture levitates and tumbles about a tilted axis, so both shadows are scrambled; it slows into
 *               alignment and both shadows lock (5.6 s). The camera pulls back to the stacked view — 불 on the wall,
 *               the sculpture, 물 on the table. In the afterglow the warm light flickers like a flame and the cool light
 *               ripples with water caustics.
 *  · light      two framed "projector" beams (parallel, along −x and −y), each a 2048² depth map filtered with PCSS;
 *               bevel normals and concave occlusion from the face attributes; bounce light from both lit pools.
 *  · haze       half-resolution ray march through the two beam volumes (Henyey–Greenstein phase, shadow-map visibility,
 *               drifting density), joint-bilateral upsampled; dust motes lit by the same beams.
 * frame(t) is a closed-form function of t: rotation, lights and camera are tracks; nothing accumulates.
 */
import * as THREE from 'three';
import { defineDemo, rand, clamp, lerp, ramp } from '../_lib/stage.js';
import { loadOutlineFont, outlineContours } from '../_lib/type.js';
import { BEVEL, buildSolid, solidGeometry, shadowFidelity, components } from './solid.js';

const D = 10;
const WALL_GLYPH = '불', TABLE_GLYPH = '물';
const YT = 0.9, GAP = 1.25, WD = 2.35;          // table top height, float gap under the sculpture, wall distance (x = −WD)
const T_LOCK = 5.6;
const AXIS = new THREE.Vector3(0.3, 0.75, 0.6).normalize();   // tumble axis: tilted, so both projections scramble

// ---------- smooth keyframes (cubic Hermite, Catmull-Rom slopes) ----------
function spline(keys) {
  const n = keys.length, dim = Array.isArray(keys[0][1]) ? keys[0][1].length : 0;
  const val = (i, d) => (dim ? keys[i][1][d] : keys[i][1]);
  const slope = (i, d) => (i === 0 || i === n - 1 ? 0 : (val(i + 1, d) - val(i - 1, d)) / (keys[i + 1][0] - keys[i - 1][0]));
  const at = (t, d) => {
    if (t <= keys[0][0]) return val(0, d);
    if (t >= keys[n - 1][0]) return val(n - 1, d);
    let i = 0;
    while (t > keys[i + 1][0]) i++;
    const t0 = keys[i][0], h = keys[i + 1][0] - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * val(i, d) + (u3 - 2 * u2 + u) * h * slope(i, d) + (-2 * u3 + 3 * u2) * val(i + 1, d) + (u3 - u2) * h * slope(i + 1, d);
  };
  return (t) => (dim ? Array.from({ length: dim }, (_, d) => at(t, d)) : at(t, 0));
}
const outCubic = (p) => 1 - (1 - p) * (1 - p) * (1 - p);

// ---------- GLSL ----------
const LIGHTS = `
uniform sampler2D uShA, uShB;
uniform mat4 uVPA, uVPB;
uniform vec4 uSh;            // depth span A, depth span B, shadow-map width, tan(light radius)
uniform vec3 uColA, uColB;   // warm (from +x) and cool (from +y), colour × intensity
uniform vec4 uFrA, uFrB;     // beam frames: A centre (y, z) + half size; B centre (x, z) + half size
uniform float uSoft, uTime, uCaus;
uniform vec3 uAmb, uBounceA, uBounceB;
uniform vec4 uPoolA, uPoolB; // lit pools as bounce sources: centre + area
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
// a framing-shutter beam: soft superellipse, slightly hotter in the middle
float frameMask(vec2 q, vec2 h) {
  if (h.x < 1e-4 || h.y < 1e-4) return 0.0;
  vec2 a = abs(q) / h, a2 = a * a, a6 = a2 * a2 * a2;
  float r = pow(max(a6.x + a6.y, 1e-12), 1.0 / 6.0);
  return smoothstep(1.0 + uSoft, 1.0 - uSoft, r) * (0.88 + 0.12 * (1.0 - min(r * r, 1.0)));
}
// tileable water caustic (iterated warp), period 1 in p
float caustic(vec2 p) {
  vec2 q = mod(p * 6.2831853, 6.2831853) - 250.0, i = q;
  float c = 1.0, t = uTime * 0.5 + 23.0;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = q + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(q.x / (sin(i.x + tt) / 0.005), q.y / (cos(i.y + tt) / 0.005)));
  }
  c = 1.17 - pow(clamp(c / 4.0, 0.0, 64.0), 1.4);
  return pow(abs(c), 7.0);
}
float maskA(vec3 p) { return frameMask(vec2(p.y - uFrA.x, p.z - uFrA.y), uFrA.zw); }
float maskB0(vec3 p) { return frameMask(vec2(p.x - uFrB.x, p.z - uFrB.y), uFrB.zw); }   // without the caustic cookie
float maskB(vec3 p) {
  float m = maskB0(p);
  if (uCaus > 0.0 && m > 0.0) m *= 1.0 + uCaus * (caustic(p.xz * 1.3) * 2.0 - 0.4);
  return m;
}
// PCSS on a parallel light: blocker search → penumbra ∝ receiver–blocker distance → Vogel-disc PCF
float pcss(sampler2D sm, mat4 vp, float span, vec3 wp, vec3 n, float rot) {
  vec4 lp = vp * vec4(wp + n * 0.002, 1.0);
  vec3 s = lp.xyz / lp.w * 0.5 + 0.5;
  if (s.x <= 0.0 || s.y <= 0.0 || s.x >= 1.0 || s.y >= 1.0 || s.z >= 1.0) return 1.0;
  float zr = s.z - 0.0015 / span;
  float search = uSh.w * 3.2 / uSh.z;
  float bs = 0.0, bc = 0.0;
  for (int i = 0; i < 12; i++) {
    float r = sqrt((float(i) + 0.5) / 12.0), a = float(i) * 2.39996323 + rot;
    float d = texture2D(sm, s.xy + vec2(cos(a), sin(a)) * r * search).r;
    if (d < zr) { bs += d; bc += 1.0; }
  }
  if (bc < 0.5) return 1.0;
  float pen = clamp((zr - bs / bc) * span * uSh.w / uSh.z, 1.2 / 2048.0, search);
  float lit = 0.0;
  for (int i = 0; i < 20; i++) {
    float r = sqrt((float(i) + 0.5) / 20.0), a = float(i) * 2.39996323 + rot + 1.7;
    lit += step(zr, texture2D(sm, s.xy + vec2(cos(a), sin(a)) * r * pen).r);
  }
  return lit / 20.0;
}
float shadowHard(sampler2D sm, mat4 vp, float span, vec3 wp) {
  vec4 lp = vp * vec4(wp, 1.0);
  vec3 s = lp.xyz / lp.w * 0.5 + 0.5;
  if (s.x <= 0.0 || s.y <= 0.0 || s.x >= 1.0 || s.y >= 1.0 || s.z >= 1.0) return 1.0;
  return step(s.z - 0.003 / span, texture2D(sm, s.xy).r);
}
// light bounced off the two lit pools (each a square area light: form factor A·cos·cos / (π d² + A))
vec3 bounce(vec3 p, vec3 n) {
  vec3 d = uPoolA.xyz - p; float l2 = max(dot(d, d), 1e-4); vec3 l = d * inversesqrt(l2);
  float fa = max(dot(n, l), 0.0) * max(-l.x, 0.0) * uPoolA.w / (3.14159 * l2 + uPoolA.w);
  vec3 e = uPoolB.xyz - p; float m2 = max(dot(e, e), 1e-4); vec3 m = e * inversesqrt(m2);
  float fb = max(dot(n, m), 0.0) * max(-m.y, 0.0) * uPoolB.w / (3.14159 * m2 + uPoolB.w);
  return uBounceA * fa + uBounceB * fb;
}
`;

const SCULPT_VS = `
attribute vec4 aUV, aCvx, aCcv;
varying vec3 vW, vN, vEu, vEw; varying vec4 vUV, vCvx, vCcv; varying vec3 vL; varying float vDepth;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  mat3 R = mat3(modelMatrix);
  // in-face axes: u = axis (a+1)%3, w = axis (a+2)%3 of the face normal's axis a
  vec3 n = normal, an = abs(n);
  vec3 eu = an.x > 0.5 ? vec3(0.0, 1.0, 0.0) : an.y > 0.5 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
  vec3 ew = an.x > 0.5 ? vec3(0.0, 0.0, 1.0) : an.y > 0.5 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vW = w.xyz; vN = R * n; vEu = R * eu; vEw = R * ew; vL = position;
  vUV = aUV; vCvx = aCvx; vCcv = aCcv;
  vec4 mv = viewMatrix * w;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const SCULPT_FS = LIGHTS + `
uniform vec3 uAlb;
varying vec3 vW, vN, vEu, vEw; varying vec4 vUV, vCvx, vCcv; varying vec3 vL; varying float vDepth;
float bev(float d) { float x = clamp(1.0 - d / ${BEVEL.toFixed(4)}, 0.0, 1.0); return x * x; }   // tan of the edge tilt
float cav(float d) { return 1.0 - 0.5 * exp(-d / 0.035); }
void main() {
  vec3 Ng = normalize(vN);
  float du1 = vUV.z - vUV.x + vCvx.x, du0 = vUV.x + vCvx.y, dw1 = vUV.w - vUV.y + vCvx.z, dw0 = vUV.y + vCvx.w;
  vec3 N = normalize(Ng + vEu * (bev(du1) - bev(du0)) + vEw * (bev(dw1) - bev(dw0)));   // rounded convex edges
  float ao = cav(vUV.z - vUV.x + vCcv.x) * cav(vUV.x + vCcv.y) * cav(vUV.w - vUV.y + vCcv.z) * cav(vUV.y + vCcv.w);
  float rot = ign(gl_FragCoord.xy) * 6.2831853;
  float mA = maskA(vW), mB = maskB(vW);
  float shA = (mA > 0.0 && N.x > 0.0) ? pcss(uShA, uVPA, uSh.x, vW, Ng, rot) : 1.0;   // only where the light can land
  float shB = (mB > 0.0 && N.y > 0.0) ? pcss(uShB, uVPB, uSh.y, vW, Ng, rot) : 1.0;
  // cast plaster: a faint grain that moves with the sculpture
  vec3 alb = uAlb * (0.95 + 0.05 * vnoise(vL.xy * 37.0 + vL.z * 19.0) + 0.03 * (vnoise(vL.zy * 140.0 + vL.x * 60.0) - 0.5));
  vec3 lit = uColA * mA * max(N.x, 0.0) * shA + uColB * mB * max(N.y, 0.0) * shB;
  vec3 fill = (uAmb * (0.55 + 0.45 * N.y) + bounce(vW, N)) * ao;
  vec3 col = alb * (lit + fill);
  vec3 V = normalize(cameraPosition - vW);
  vec3 HA = normalize(vec3(1.0, 0.0, 0.0) + V), HB = normalize(vec3(0.0, 1.0, 0.0) + V);
  float sa = max(dot(N, HA), 0.0), sb = max(dot(N, HB), 0.0);
  float sa2 = sa * sa, sa4 = sa2 * sa2, sa8 = sa4 * sa4, sb2 = sb * sb, sb4 = sb2 * sb2, sb8 = sb4 * sb4;
  col += (uColA * mA * shA * sa8 * sa8 + uColB * mB * shB * sb8 * sb8) * 0.05;
  gl_FragColor = vec4(col, vDepth);
}`;

const ROOM_VS = `
varying vec3 vW; varying float vDepth;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vec4 mv = viewMatrix * w;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const ROOM_FS = LIGHTS + `
uniform float uKind;         // 0 the wall (x = const, facing +x), 1 the table top (y = const)
uniform vec3 uWallAlb, uTableAlb;
uniform vec2 uCorner;        // wall x, table y
varying vec3 vW; varying float vDepth;
void main() {
  bool wall = uKind < 0.5;
  vec3 N = wall ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec2 tp = wall ? vW.zy : vW.zx;
  float rot = ign(gl_FragCoord.xy) * 6.2831853;
  vec3 alb;
  vec3 lit;
  if (wall) {
    // lime plaster: soft trowel clouds and a fine grain
    alb = uWallAlb * (0.9 + 0.1 * vnoise(tp * 2.3) + 0.06 * (vnoise(tp * 31.0) - 0.5) + 0.03 * (hash12(floor(tp * 700.0)) - 0.5));
    float m = maskA(vW);
    lit = m > 0.0 ? uColA * m * pcss(uShA, uVPA, uSh.x, vW, N, rot) : vec3(0.0);
  } else {
    // honed pale stone
    alb = uTableAlb * (0.93 + 0.07 * vnoise(tp * 3.1 + vnoise(tp * 0.7) * 2.0) + 0.04 * (vnoise(tp * 55.0) - 0.5));
    float m = maskB(vW);
    lit = m > 0.0 ? uColB * m * pcss(uShB, uVPB, uSh.y, vW, N, rot) : vec3(0.0);
  }
  float edge = wall ? vW.y - uCorner.y : vW.x - uCorner.x;          // distance to the wall–table corner
  float ao = 1.0 - 0.5 * exp(-edge * 5.0);
  float fall = exp(-max(length(vW - vec3(0.0, 2.4, 0.0)) - 1.2, 0.0) * 0.32);   // the gallery darkens away from the work
  vec3 col = alb * (lit + (uAmb * fall + bounce(vW, N)) * ao);
  gl_FragColor = vec4(col, vDepth);
}`;

const MOTE_VS = LIGHTS + `
attribute vec4 aSeed;
uniform vec3 uBoxMin, uBoxSize;
varying vec3 vC; varying float vA;
void main() {
  vec3 p = uBoxMin + aSeed.xyz * uBoxSize;
  p += vec3(0.05 * sin(uTime * 0.27 + aSeed.w * 17.0), 0.04 * sin(uTime * 0.21 + aSeed.w * 9.0) - uTime * 0.01, 0.05 * cos(uTime * 0.23 + aSeed.w * 13.0));
  float a = maskA(p) * shadowHard(uShA, uVPA, uSh.x, p), b = maskB(p) * shadowHard(uShB, uVPB, uSh.y, p);
  vC = uColA * a + uColB * b;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  float sz = (1.4 + 2.4 * fract(aSeed.w * 13.7)) * 5.0 / max(-mv.z, 0.1);
  gl_PointSize = max(sz, 1.0);
  vA = min(sz, 1.0) * (0.35 + 0.65 * fract(aSeed.w * 31.3)) * (0.6 + 0.4 * sin(uTime * 1.7 + aSeed.w * 40.0));
  gl_Position = projectionMatrix * mv;
}`;
const MOTE_FS = `
varying vec3 vC; varying float vA;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float a = exp(-dot(q, q) * 12.0) * vA;
  gl_FragColor = vec4(vC * a * 0.22, 0.0);
}`;

const QUAD_VS = `varying vec2 vUv; void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
// half-resolution in-scattering: march each beam's box between the camera and the first surface
const HAZE_FS = LIGHTS + `
uniform sampler2D tScene;
uniform mat4 uInvProj, uCamWorld;
uniform vec3 uCamPos;
uniform vec3 uBoxA0, uBoxA1, uBoxB0, uBoxB1;
uniform vec2 uHaze;          // density A, density B
uniform float uTableY, uHazeTop;
varying vec2 vUv;
vec2 hitBox(vec3 ro, vec3 rd, vec3 b0, vec3 b1) {
  vec3 r = vec3(rd.x >= 0.0 ? max(rd.x, 1e-5) : min(rd.x, -1e-5), rd.y >= 0.0 ? max(rd.y, 1e-5) : min(rd.y, -1e-5), rd.z >= 0.0 ? max(rd.z, 1e-5) : min(rd.z, -1e-5));
  vec3 t0 = (b0 - ro) / r, t1 = (b1 - ro) / r;
  vec3 tn = min(t0, t1), tf = max(t0, t1);
  return vec2(max(max(tn.x, tn.y), tn.z), min(min(tf.x, tf.y), tf.z));
}
float hg(float c) { float g = 0.35, k = 1.0 + g * g - 2.0 * g * c; return (1.0 - g * g) / (12.566371 * k * sqrt(k)); }
float dens(vec3 p) {
  float n = vnoise(p.xz * 2.1 + vec2(0.0, uTime * 0.06)) * 0.55 + vnoise(p.zy * 1.7 + vec2(uTime * 0.05, 0.0)) * 0.45;
  // stratified: thickest near the table, thinning above the sculpture (so the cool shaft does not veil the wall letter)
  return (0.45 + 1.1 * n) * (0.75 + 0.25 * exp(-(p.y - uTableY) * 0.5)) * exp(-max(p.y - uHazeTop, 0.0) * 1.3);
}
void main() {
  vec4 vp = uInvProj * vec4(vUv * 2.0 - 1.0, -1.0, 1.0);
  vec3 vd = normalize(vp.xyz / vp.w);
  vec3 rd = normalize((uCamWorld * vec4(vd, 0.0)).xyz);
  float depth = texture2D(tScene, vUv).a;
  float tMax = depth / max(-vd.z, 1e-3);
  float jit = ign(gl_FragCoord.xy);
  vec3 acc = vec3(0.0);
  vec2 h = hitBox(uCamPos, rd, uBoxA0, uBoxA1);
  float a0 = max(h.x, 0.0), a1 = min(h.y, tMax);
  if (a1 > a0) {
    float ds = (a1 - a0) / 28.0, s = 0.0;
    for (int i = 0; i < 28; i++) {
      vec3 p = uCamPos + rd * (a0 + (float(i) + jit) * ds);
      float m = maskA(p);
      if (m > 0.0) s += m * shadowHard(uShA, uVPA, uSh.x, p) * dens(p);
    }
    acc += uColA * s * ds * uHaze.x * hg(-rd.x);
  }
  h = hitBox(uCamPos, rd, uBoxB0, uBoxB1);
  float b0 = max(h.x, 0.0), b1 = min(h.y, tMax);
  if (b1 > b0) {
    float ds = (b1 - b0) / 28.0, s = 0.0;
    for (int i = 0; i < 28; i++) {
      vec3 p = uCamPos + rd * (b0 + (float(i) + jit) * ds);
      float m = maskB0(p);
      if (m > 0.0) s += m * shadowHard(uShB, uVPB, uSh.y, p) * dens(p);
    }
    acc += uColB * s * ds * uHaze.y * hg(-rd.y);
  }
  gl_FragColor = vec4(acc, depth);
}`;
// haze (joint-bilateral upsample) + scene → ACES → grade → vignette → grain → fade
const POST_FS = `
uniform sampler2D tScene, tHaze;
uniform vec2 uHalf;
uniform float uFade, uExposure, uTime;
varying vec2 vUv;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main() {
  vec4 c = texture2D(tScene, vUv);
  vec2 hp = vUv * uHalf - 0.5, f = fract(hp), b0 = floor(hp);
  vec3 hz = vec3(0.0); float ws = 0.0;
  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) {
    vec2 o = vec2(float(i), float(j));
    vec4 s = texture2D(tHaze, (b0 + o + 0.5) / uHalf);
    float w = (i == 0 ? 1.0 - f.x : f.x) * (j == 0 ? 1.0 - f.y : f.y);
    w *= exp(-abs(s.a - c.a) / (0.03 + 0.03 * c.a)) + 1e-4;
    hz += s.rgb * w; ws += w;
  }
  vec3 col = c.rgb + hz / ws;
  col = aces(col * uExposure);
  col = pow(col, vec3(1.0 / 2.2));
  vec2 q = vUv - 0.5;
  col *= 1.0 - 0.42 * smoothstep(0.2, 0.85, length(q * vec2(1.0, 0.6)) * 1.3);
  col += (hash12(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * (2.4 / 255.0);
  gl_FragColor = vec4(col * uFade, 1.0);
}`;

// ---------- the story ----------
const camAz = spline([[0, 30], [2.8, 21], [5.6, 5], [7.6, 0], [D, 0]]);           // degrees from +x toward +z
const camEl = spline([[0, 16], [2.8, 19.5], [5.6, 35], [7.6, 41.6], [D, 42.4]]);
const camDist = spline([[0, 3.3], [2.8, 3.6], [5.6, 6.4], [7.6, 7.3], [D, 7.2]]);
const fadeOf = (t) => ramp(t, 0, 0.7) * (1 - ramp(t, D - 0.5, D));
const tumble = (t) => (t >= T_LOCK ? 0 : 2.2 * (1 - t / T_LOCK) ** 2);              // rad, settles with zero velocity
const bob = (t) => 0.03 * Math.sin(1.1 * t + 0.5) * (1 - ramp(t, 3.0, T_LOCK));

defineDemo({
  id: '61-shadow-type',
  title: '그림자로 읽는 글자',
  tech: '두 글자 돌출의 교집합(투영 조형) · 다중 광원 그림자',
  duration: D,
  background: '#060506',
  async setup({ canvas, W, H }) {
    // ---- the sculpture, exactly from the outlines ----
    const font = await loadOutlineFont('Pretendard-Black');
    const glyph = (ch) => outlineContours(font, ch, 0, 0, 1000)[0].contours.map((c) => Float64Array.from(c.pts, (v) => v / 1000));
    const A = glyph(WALL_GLYPH), B = glyph(TABLE_GLYPH);
    const S = buildSolid(A, B, 1.0);
    const geo = solidGeometry(S);
    const fid = shadowFidelity(S, A, B, 240);
    this.fidelity = { ...fid, pieces: components(S).length, faces: geo.userData.faces, grid: [S.nx, S.ny, S.nz] };
    window.__shadowFidelity = this.fidelity;
    const HA = (S.Y[S.Y.length - 1] - S.Y[0]) / 2, HB = (S.X[S.X.length - 1] - S.X[0]) / 2;
    const YC = YT + GAP + HA;                                   // sculpture centre height at rest

    // ---- renderer, passes ----
    const { el } = canvas({ type: 'webgl2' });
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    const camera = new THREE.PerspectiveCamera(36, W / H, 0.05, 60);
    const SM = 2048, SMW = 0.95;                                  // shadow maps cover ±0.95 around the sculpture
    const mkShadow = () => new THREE.WebGLRenderTarget(SM, SM, { depthTexture: new THREE.DepthTexture(SM, SM, THREE.FloatType), minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const shA = mkShadow(), shB = mkShadow();
    const camA = new THREE.OrthographicCamera(-SMW, SMW, SMW, -SMW, 0.1, 4.5 + WD + 0.3);
    camA.position.set(4.5, YC, 0); camA.up.set(0, 1, 0); camA.lookAt(0, YC, 0); camA.updateMatrixWorld();
    const camB = new THREE.OrthographicCamera(-SMW, SMW, SMW, -SMW, 0.1, 4 + (YC - YT) + 0.3);
    camB.position.set(0, YC + 4, 0); camB.up.set(0, 0, -1); camB.lookAt(0, YC, 0); camB.updateMatrixWorld();
    const mainRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
    const HW = W / 2, HH = H / 2;
    const hazeRT = new THREE.WebGLRenderTarget(HW, HH, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false });

    const FR = 0.17;                                               // the beam frame clears the letter by this much
    const U = {
      uShA: { value: shA.depthTexture }, uShB: { value: shB.depthTexture },
      uVPA: { value: new THREE.Matrix4().multiplyMatrices(camA.projectionMatrix, camA.matrixWorldInverse) },
      uVPB: { value: new THREE.Matrix4().multiplyMatrices(camB.projectionMatrix, camB.matrixWorldInverse) },
      uSh: { value: new THREE.Vector4(camA.far - camA.near, camB.far - camB.near, 2 * SMW, 0.0055) },
      uColA: { value: new THREE.Vector3() }, uColB: { value: new THREE.Vector3() },
      uFrA: { value: new THREE.Vector4(YC, 0, HA + FR, 0.5 + FR) }, uFrB: { value: new THREE.Vector4(0, 0, HB + FR, 0.5 + FR) },
      uSoft: { value: 0.09 }, uTime: { value: 0 }, uCaus: { value: 0 },
      uAmb: { value: new THREE.Vector3(0.03, 0.033, 0.042) },
      uBounceA: { value: new THREE.Vector3() }, uBounceB: { value: new THREE.Vector3() },
      uPoolA: { value: new THREE.Vector4(-WD, YC, 0, 2.0) }, uPoolB: { value: new THREE.Vector4(0, YT, 0, 2.0) },
    };
    const WALL_ALB = [0.5, 0.48, 0.45], TABLE_ALB = [0.5, 0.5, 0.49];

    // ---- scene ----
    const scene = new THREE.Scene(), shadowScene = new THREE.Scene();
    const sculptMat = new THREE.ShaderMaterial({ uniforms: { ...U, uAlb: { value: new THREE.Vector3(0.78, 0.76, 0.72) } }, vertexShader: SCULPT_VS, fragmentShader: SCULPT_FS });
    const sculpt = new THREE.Mesh(geo, sculptMat);
    const depthMat = new THREE.ShaderMaterial({ vertexShader: 'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'void main() { gl_FragColor = vec4(1.0); }', side: THREE.BackSide });
    const sculptShadow = new THREE.Mesh(geo, depthMat);
    scene.add(sculpt); shadowScene.add(sculptShadow);
    for (const m of [sculpt, sculptShadow]) m.matrixAutoUpdate = false;
    const roomMat = (kind) => new THREE.ShaderMaterial({
      uniforms: { ...U, uKind: { value: kind }, uWallAlb: { value: new THREE.Vector3(...WALL_ALB) }, uTableAlb: { value: new THREE.Vector3(...TABLE_ALB) }, uCorner: { value: new THREE.Vector2(-WD, YT) } },
      vertexShader: ROOM_VS, fragmentShader: ROOM_FS,
    });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 11).rotateY(Math.PI / 2).translate(-WD, YT + 5.5, 0), roomMat(0));
    const table = new THREE.Mesh(new THREE.PlaneGeometry(WD + 7, 16).rotateX(-Math.PI / 2).translate((7 - WD) / 2, YT, 0), roomMat(1));
    wall.renderOrder = table.renderOrder = 1;                      // after the sculpture: hidden room pixels are skipped
    scene.add(wall, table);
    // dust motes
    const NM = 700, seeds = new Float32Array(NM * 4), rs = rand(6101);
    for (let i = 0; i < seeds.length; i++) seeds[i] = rs();
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NM * 3), 3));
    moteGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    const motes = new THREE.Points(moteGeo, new THREE.ShaderMaterial({
      uniforms: { ...U, uBoxMin: { value: new THREE.Vector3(-WD + 0.05, YT + 0.05, -0.95) }, uBoxSize: { value: new THREE.Vector3(WD + 2.6, YC + 1.4 - YT, 1.9) } },
      vertexShader: MOTE_VS, fragmentShader: MOTE_FS, transparent: true, depthWrite: false,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,       // keep the view depth stored in alpha
    }));
    motes.frustumCulled = false;
    motes.renderOrder = 5;
    scene.add(motes);

    // full-screen passes
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    const quadScene = (mat) => { const s = new THREE.Scene(), m = new THREE.Mesh(tri, mat); m.frustumCulled = false; s.add(m); return s; };
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const HU = {
      ...U, tScene: { value: mainRT.texture }, uInvProj: { value: new THREE.Matrix4() }, uCamWorld: { value: new THREE.Matrix4() }, uCamPos: { value: new THREE.Vector3() },
      uBoxA0: { value: new THREE.Vector3(-WD, YC - HA - FR - 0.1, -0.5 - FR - 0.1) }, uBoxA1: { value: new THREE.Vector3(7, YC + HA + FR + 0.1, 0.5 + FR + 0.1) },
      uBoxB0: { value: new THREE.Vector3(-HB - FR - 0.1, YT, -0.5 - FR - 0.1) }, uBoxB1: { value: new THREE.Vector3(HB + FR + 0.1, YC + 5, 0.5 + FR + 0.1) },
      uHaze: { value: new THREE.Vector2(0.3, 0.22) }, uTableY: { value: YT }, uHazeTop: { value: YC + HA + 0.1 },
    };
    const hazeScene = quadScene(new THREE.ShaderMaterial({ uniforms: HU, vertexShader: QUAD_VS, fragmentShader: HAZE_FS, depthTest: false, depthWrite: false }));
    const PU = { tScene: { value: mainRT.texture }, tHaze: { value: hazeRT.texture }, uHalf: { value: new THREE.Vector2(HW, HH) }, uFade: { value: 1 }, uExposure: { value: 0.92 }, uTime: { value: 0 } };
    const postScene = quadScene(new THREE.ShaderMaterial({ uniforms: PU, vertexShader: QUAD_VS, fragmentShader: POST_FS, depthTest: false, depthWrite: false }));

    // ---- per frame: everything from t ----
    const q = new THREE.Quaternion(), M = new THREE.Matrix4(), pos = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), tgt = new THREE.Vector3();
    const warm = [1.0, 0.56, 0.25], cool = [0.42, 0.66, 1.0];
    const tgtTrack = spline([[0, [0, YC, 0]], [2.8, [-0.05, YC - 0.05, 0]], [5.6, [-0.6, YC - 0.64, 0]], [7.6, [-0.75, YC - 0.79, 0]], [D, [-0.75, YC - 0.76, 0]]]);

    this.render = (t) => {
      U.uTime.value = t;
      // sculpture pose: tumbling about a tilted axis, settling into alignment at T_LOCK
      q.setFromAxisAngle(AXIS, tumble(t));
      pos.set(0, YC + bob(t), 0);
      M.compose(pos, q, one);
      sculpt.matrix.copy(M); sculptShadow.matrix.copy(M);
      sculpt.matrixWorld.copy(M); sculptShadow.matrixWorld.copy(M);
      // lights: the projectors iris open, swell when the letters lock, then breathe — a flame and water
      const irisA = outCubic(clamp((t - 0.1) / 1.2)), irisB = outCubic(clamp((t - 0.9) / 1.2));
      U.uFrA.value.set(YC, 0, (HA + FR) * irisA, (0.5 + FR) * irisA);
      U.uFrB.value.set(0, 0, (HB + FR) * irisB, (0.5 + FR) * irisB);
      const lock = Math.exp(-(((t - T_LOCK - 0.25) / 0.45) ** 2));
      const fl = ramp(t, 6.6, 7.8);
      const flicker = fl * (0.05 * Math.sin(t * 7.3) + 0.035 * Math.sin(t * 11.9 + 1.3) + 0.025 * Math.sin(t * 17.1 + 0.4) + 0.02 * Math.sin(t * 3.1 + 2.0));
      const IA = 2.3 * (0.3 + 0.7 * irisA) * (1 + 0.12 * lock + flicker);
      const IB = 2.05 * (0.3 + 0.7 * irisB) * (1 + 0.12 * lock + 0.03 * fl * Math.sin(t * 1.9));
      U.uColA.value.set(warm[0] * IA, warm[1] * IA, warm[2] * IA);
      U.uColB.value.set(cool[0] * IB, cool[1] * IB, cool[2] * IB);
      U.uCaus.value = 0.85 * ramp(t, 6.4, 8.0);
      U.uBounceA.value.set(...warm.map((c, i) => c * IA * WALL_ALB[i] * 0.55 * irisA * irisA));
      U.uBounceB.value.set(...cool.map((c, i) => c * IB * TABLE_ALB[i] * 0.6 * irisB * irisB));
      HU.uHaze.value.set(0.3 * (1 + 0.15 * lock), 0.22 * (1 + 0.15 * lock));
      // camera
      const az = (camAz(t) * Math.PI) / 180, elv = (camEl(t) * Math.PI) / 180, d = camDist(t), tg = tgtTrack(t);
      tgt.set(tg[0], tg[1], tg[2]);
      camera.position.set(tg[0] + d * Math.cos(elv) * Math.cos(az), tg[1] + d * Math.sin(elv), tg[2] + d * Math.cos(elv) * Math.sin(az));
      camera.up.set(0, 1, 0);
      camera.lookAt(tgt);
      camera.updateMatrixWorld();

      // 1 · shadow maps (the sculpture only; back faces)
      renderer.setClearColor(0xffffff, 1);
      renderer.setRenderTarget(shA); renderer.render(shadowScene, camA);
      renderer.setRenderTarget(shB); renderer.render(shadowScene, camB);
      // 2 · the picture (HDR, view depth in alpha)
      renderer.setClearColor(0x000000, 1);
      renderer.setRenderTarget(mainRT); renderer.render(scene, camera);
      // 3 · in-scattering at half resolution
      HU.uInvProj.value.copy(camera.projectionMatrixInverse);
      HU.uCamWorld.value.copy(camera.matrixWorld);
      HU.uCamPos.value.copy(camera.position);
      renderer.setRenderTarget(hazeRT); renderer.render(hazeScene, quadCam);
      // 4 · composite, tone, grade
      PU.uFade.value = fadeOf(t);
      PU.uTime.value = t;
      renderer.setRenderTarget(null); renderer.render(postScene, quadCam);
    };
  },
  frame(t) {
    this.render(t);
  },
});
