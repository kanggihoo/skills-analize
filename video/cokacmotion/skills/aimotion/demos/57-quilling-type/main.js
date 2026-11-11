/*
 * 57 · 종이 띠로 세운 글자 — paper quilling: "온기" set in strips of coloured paper standing on edge.
 *
 *  · strips     every contour of Pretendard Black (opentype outlines) → arc-length samples with rounded corners (quill.js).
 *               The ribbon mesh only stores rest positions; the vertex shader decides each vertex's place from the tip's
 *               arc length: behind the tip it lies on the contour (with a damped lean as it settles), ahead of it the
 *               remaining paper is an Archimedean coil at the tip, in closed form (radius shrinks as it pays out).
 *  · fill       even-odd raster → signed distance → largest-first circle packing with a fixed seed; every circle becomes a
 *               tight coil, loose coil, teardrop, marquise or S/C scroll that springs open (squash–settle) in the shader.
 *  · light      one low warm key with a 2048² shadow map filtered by PCSS (contact-hard, soft further away), light through
 *               the paper on the shadow side of every strip, a top-down occupancy map blurred into contact occlusion for
 *               the paper ground, and raking light over a tileable fibre texture.
 *  · post       depth of field from the view depth kept in the alpha channel, ACES, warm grade, vignette, grain.
 * frame(t) only sets uniforms from t: the schedule, the camera and the light are closed-form functions of time.
 */
import * as THREE from 'three';
import { defineDemo, rand, clamp, lerp, ramp } from '../_lib/stage.js';
import { loadOutlineFont, outlineContours } from '../_lib/type.js';
import { TH, H_OUT, H_FILL, PITCH_COIL, prepareStrip, stripAt, arcOfEffort, stripGeometry, packMotifs, motifCurve, motifGeometry, paperCanvas } from './quill.js';

const D = 10;
const WORD = ['온', '기'];
// strips in the order a hand would lay them: 온 = ㅇ+ㅗ outline, the ㅇ's counter, ㄴ · 기 = ㄱ, ㅣ   [start s, duration s]
const SCHED = [[0.45, 2.05], [1.6, 0.85], [2.05, 1.15], [2.9, 1.35], [3.5, 1.1]];
const FILL_WIN = [[2.55, 4.35], [4.25, 5.8]];          // fill motifs pop in over these windows, glyph by glyph

// ---------- palette (sRGB hex → linear) ----------
const lin = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }); };
const PAL = {
  ground: lin('#eee4d3'), outline: lin('#a9482b'),
  cream: lin('#f3e7d3'), wheat: lin('#e5c28c'), apricot: lin('#e79d69'), blush: lin('#dd9487'), rose: lin('#c47671'), sage: lin('#9aab87'), rust: lin('#c06642'),
};
// colour by motif type, per glyph (온 leans golden, 기 leans rosy)
const TONES = {
  tight: [['cream', 'wheat', 'cream'], ['cream', 'blush', 'cream']],
  loose: [['apricot', 'wheat'], ['blush', 'apricot']],
  tear: [['apricot', 'rust'], ['rose', 'blush']],
  eye: [['sage', 'sage', 'wheat'], ['sage', 'sage', 'blush']],
  sscroll: [['rust'], ['rose']],
  cscroll: [['rust'], ['rose']],
};

// ---------- smooth keyframes: cubic Hermite with Catmull-Rom slopes (velocity continuous through the keys) ----------
function spline(keys) {
  const n = keys.length, dim = Array.isArray(keys[0][1]) ? keys[0][1].length : 0;
  const val = (i, d) => (dim ? keys[i][1][d] : keys[i][1]);
  const slope = (i, d) => (i === 0 || i === n - 1 ? 0 : (val(i + 1, d) - val(i - 1, d)) / (keys[i + 1][0] - keys[i - 1][0]));
  const at = (t, d) => {
    if (t <= keys[0][0]) return val(0, d);
    if (t >= keys[n - 1][0]) return val(n - 1, d);
    let i = 0;
    while (t > keys[i + 1][0]) i++;
    const t0 = keys[i][0], t1 = keys[i + 1][0], h = t1 - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * val(i, d) + (u3 - 2 * u2 + u) * h * slope(i, d) + (-2 * u3 + 3 * u2) * val(i + 1, d) + (u3 - u2) * h * slope(i + 1, d);
  };
  return (t) => (dim ? Array.from({ length: dim }, (_, d) => at(t, d)) : at(t, 0));
}

// ---------- the story ----------
const camEl = spline([[0, 19], [1.7, 23], [3.7, 46], [5.9, 79], [D, 83.5]]);      // degrees above the paper
const camAz = spline([[0, -31], [2.0, -21], [4.0, -8], [6.0, -1], [D, 0]]);        // degrees, 0 = from the south (+z)
const camDist = spline([[0, 1.0], [1.8, 1.45], [3.8, 2.85], [5.9, 4.85], [D, 4.5]]);
const lookTrack = spline([[1.8, [0.0, 0.012, -0.5]], [3.8, [0.0, 0.006, -0.08]], [5.9, [0.0, 0.0, 0.065]], [D, [0.0, 0.0, 0.06]]]);
const aperture = spline([[0, 17], [2.4, 12], [4.4, 5], [6.0, 1.4], [D, 2.0]]);   // max circle of confusion (px)
const keyEl = spline([[0, 27], [5.2, 33], [7.3, 32], [D, 19.5]]);                  // the key light sinks in the afterglow
const keyAz = spline([[0, 33], [6.0, 37], [D, 53]]);                                // from the north toward the west
const keyI = spline([[0, 2.45], [6.0, 2.7], [D, 3.0]]);
const fadeOf = (t) => ramp(t, 0, 0.6) * (1 - ramp(t, D - 0.5, D));
const hand = (p) => 0.25 * p + 0.75 * p * p * (3 - 2 * p);                        // laying speed: eases in and out
const handInv = (y) => { let lo = 0, hi = 1; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (hand(m) < y) lo = m; else hi = m; } return (lo + hi) / 2; };
const popJS = (x) => (x <= 0 ? 0 : 1 - Math.exp(-10 * x) * (Math.cos(17 * x) + 0.588 * Math.sin(17 * x)));

// ---------- GLSL ----------
const SHADOW = `
uniform sampler2D uShadow;
uniform mat4 uLightVP;
uniform vec3 uL;
uniform vec4 uSh;          // depth span (em), shadow-map width (em), tan(light radius), depth bias
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
// PCSS: average blocker depth → penumbra ∝ receiver–blocker distance → Vogel-disc PCF (rotated per pixel)
float keyShadow(vec3 wp, vec3 n) {
  vec4 lp = uLightVP * vec4(wp + n * 0.0007, 1.0);
  vec3 s = lp.xyz / lp.w * 0.5 + 0.5;
  if (s.x <= 0.0 || s.y <= 0.0 || s.x >= 1.0 || s.y >= 1.0 || s.z >= 1.0) return 1.0;
  float zr = s.z - uSh.w;
  float rot = ign(gl_FragCoord.xy) * 6.2831853;
  float search = uSh.z * 0.17 / uSh.y;
  float bs = 0.0, bc = 0.0;
  for (int i = 0; i < 12; i++) {
    float r = sqrt((float(i) + 0.5) / 12.0), a = float(i) * 2.39996323 + rot;
    float d = texture2D(uShadow, s.xy + vec2(cos(a), sin(a)) * r * search).r;
    if (d < zr) { bs += d; bc += 1.0; }
  }
  if (bc < 0.5) return 1.0;
  float dist = (zr - bs / bc) * uSh.x;
  float pen = clamp(dist * uSh.z / uSh.y, 1.3 / 2048.0, search);
  float lit = 0.0;
  for (int i = 0; i < 20; i++) {
    float r = sqrt((float(i) + 0.5) / 20.0), a = float(i) * 2.39996323 + rot + 1.7;
    lit += step(zr, texture2D(uShadow, s.xy + vec2(cos(a), sin(a)) * r * pen).r);
  }
  return lit / 20.0;
}
uniform vec3 uKey, uSky, uBounce;
uniform vec3 uPool;        // light pool centre (x, z) and radius
float keyPool(vec2 xz) { vec2 d = (xz - uPool.xy) / uPool.z; return 0.16 + 0.84 * exp(-0.5 * dot(d, d)); }
`;

// shared ribbon cross-section: P/T in the paper plane (x, z), lean about the base line, scale k (0 → nothing)
const RIBBON = `
uniform float uTH, uFat;
attribute vec3 aCorner;    // side (−1 / +1), height (0 / 1), face (0 wall, 1 top edge, 2 start cap, 3 end cap)
varying vec3 vW; varying vec3 vN; varying vec3 vCol; varying vec2 vHE; varying float vDepth;
void ribbon(vec2 P, vec2 T, float lean, float k, float H, float encl) {
  float side = aCorner.x, vv = aCorner.y, face = aCorner.z;
  vec2 n2 = vec2(-T.y, T.x);
  float a = side * uTH * 0.5 * uFat * k, b = vv * H * k;
  float cl = cos(lean), sl = sin(lean);
  float a2 = a * cl + b * sl, b2 = b * cl - a * sl;
  vec3 W = vec3(P.x + n2.x * a2, b2, P.y + n2.y * a2);
  vec3 n3 = vec3(n2.x, 0.0, n2.y), T3 = vec3(T.x, 0.0, T.y);
  vec3 N = face < 0.5 ? n3 * (side * cl) - vec3(0.0, side * sl, 0.0)
         : face < 1.5 ? n3 * sl + vec3(0.0, cl, 0.0)
         : face < 2.5 ? -T3 : T3;
  vW = W; vN = N; vHE = vec2(vv, encl);
  vec4 mv = viewMatrix * vec4(W, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const STRIP_VS = RIBBON + `
uniform float uTime, uTip, uLen, uPitch, uRin, uCurl, uAppear, uH;
uniform vec2 uTipPos, uTipDir;
uniform vec3 uColor;
attribute vec4 aRest;      // contour position (x, z) and tangent
attribute vec2 aS;         // arc length, time this point is laid
void main() {
  vec2 P, T; float lean = 0.0, k = 1.0;
  float u = aS.x;
  if (u <= uTip) {
    P = aRest.xy; T = aRest.zw;
    float age = uTime - aS.y;     // freshly laid paper leans and springs upright
    lean = age > 0.0 ? 0.2 * sin(age * 20.0) * exp(-age * 6.0) : 0.0;
  } else {
    // the rest of the strip: an Archimedean coil leaving the tip along its tangent. Turning angle φ after arc v:
    // r(φ) = R − kφ, v = Rφ − kφ²/2, R² = rIn² + pitch·Lrest/π; position = ∫ r(cos φ, sin φ) dφ in closed form
    float v = u - uTip, Lr = max(uLen - uTip, 0.0), kk = uPitch / 6.2831853;
    float R = sqrt(uRin * uRin + uPitch * Lr / 3.14159265);
    float sq = sqrt(max(R * R - 2.0 * kk * v, uRin * uRin));
    float phi = 2.0 * v / (R + sq);
    float r = R - kk * phi;
    vec2 Nl = vec2(-uTipDir.y, uTipDir.x) * uCurl;
    vec2 loc = vec2(r * sin(phi) - kk * cos(phi) + kk, R - r * cos(phi) - kk * sin(phi));
    vec2 C = uTipPos + Nl * R;
    P = C + (uTipPos + uTipDir * loc.x + Nl * loc.y - C) * uAppear;
    T = uTipDir * cos(phi) + Nl * sin(phi);
    k = clamp(uAppear, 0.0, 1.0);
  }
  vCol = uColor;
  ribbon(P, T, lean, k, uH, 0.0);
}`;

const MOTIF_VS = RIBBON + `
uniform float uTime, uH;
attribute vec4 aLocal;     // centre-line point and tangent around the motif centre
attribute vec4 aMotif;     // centre (x, z), pop time, base angle
attribute vec3 aCol;
attribute float aEncl;
float pop(float x) { return x <= 0.0 ? 0.0 : 1.0 - exp(-10.0 * x) * (cos(17.0 * x) + 0.588 * sin(17.0 * x)); }
void main() {
  float tau = uTime - aMotif.z;
  vCol = aCol;
  if (tau <= 0.0) { vW = vec3(0.0); vN = vec3(0.0, 1.0, 0.0); vHE = vec2(0.0); vDepth = 0.0; gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  float a = pop(tau);                                   // springs open: overshoots ~16 %, settles in ~0.4 s
  float sy = (1.0 + 0.55 * (1.0 - a)) * smoothstep(0.0, 0.55, a);   // stretched while small, squashed at the overshoot
  float rot = aMotif.w + (1.0 - a) * 0.9;               // and unwinds a little as it opens
  float c = cos(rot), s = sin(rot);
  mat2 R = mat2(c, s, -s, c);
  vec2 P = aMotif.xy + R * aLocal.xy * a;
  vec2 T = normalize(R * aLocal.zw);
  float kk = clamp(a, 0.02, 1.0);                       // thickness follows the growth, height follows sy
  ribbon(P, T, 0.0, kk, uH * sy / kk, aEncl);
}`;

const PAPER_FS = SHADOW + `
uniform float uTH;
varying vec3 vW; varying vec3 vN; varying vec3 vCol; varying vec2 vHE; varying float vDepth;
void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  float NL = dot(N, uL);
  bool front = NL > 0.0;
  // the shadow side asks whether its other face is lit: that light comes through the paper
  float sh = keyShadow(front ? vW : vW - N * (uTH * 1.3), front ? N : -N);
  float pool = keyPool(vW.xz);
  vec3 key = uKey * pool, alb = vCol;
  vec3 col = alb * key * max(NL, 0.0) * sh;
  col += alb * alb * key * max(-NL, 0.0) * sh * 0.55;
  float hv = vHE.x, enc = vHE.y;
  float ao = mix(0.42, 1.0, smoothstep(0.0, 0.9, hv));
  ao *= mix(1.0, 0.2 + 0.8 * smoothstep(0.25, 1.0, hv), enc);           // walls inside a coil see a sliver of sky
  ao = mix(ao, 1.0, step(0.5, abs(N.y)));                               // the top edge sees all of it
  col += alb * mix(uBounce, uSky, N.y * 0.5 + 0.5) * ao * (0.55 + 0.45 * pool);
  vec3 Hh = normalize(uL + V);
  float nh = max(dot(N, Hh), 0.0), nh2 = nh * nh, nh4 = nh2 * nh2, nh8 = nh4 * nh4;
  col += key * nh8 * nh8 * 0.045 * sh * step(0.0, NL);
  gl_FragColor = vec4(col, vDepth);
}`;

const GROUND_VS = `
varying vec3 vW; varying float vDepth;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vec4 mv = viewMatrix * w;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const GROUND_FS = SHADOW + `
uniform sampler2D uPaper, uAO;
uniform vec4 uAOBox;       // x0, z1, 1/width, 1/depth of the occupancy map
uniform vec3 uPaperCol, uFog;
uniform float uTexel;
varying vec3 vW; varying float vDepth;
void main() {
  vec2 puv = vW.xz / 1.7;
  vec4 p = texture2D(uPaper, puv);
  float hx = texture2D(uPaper, puv + vec2(uTexel, 0.0)).r, hz = texture2D(uPaper, puv + vec2(0.0, uTexel)).r;
  vec3 N = normalize(vec3((p.r - hx) * 1.3, 1.0, (p.r - hz) * 1.3));     // fibres under raking light
  vec3 alb = uPaperCol * (0.93 + 0.14 * (p.g - 0.5)) * (0.965 + 0.07 * (p.r - 0.5));
  vec2 auv = vec2((vW.x - uAOBox.x) * uAOBox.z, (uAOBox.y - vW.z) * uAOBox.w);
  float inBox = step(0.0, auv.x) * step(auv.x, 1.0) * step(0.0, auv.y) * step(auv.y, 1.0);
  float occ = texture2D(uAO, auv).r * inBox;
  float ao = 1.0 - 0.62 * occ;
  float sh = keyShadow(vW, vec3(0.0, 1.0, 0.0));
  float pool = keyPool(vW.xz);
  vec3 col = alb * (uKey * pool * max(dot(N, uL), 0.0) * sh * (1.0 - 0.35 * occ) + uSky * ao * (0.45 + 0.55 * pool));
  col = mix(col, uFog, smoothstep(3.0, 13.0, length(vW.xz)));
  gl_FragColor = vec4(col, vDepth);
}`;

const FLAT_FS = `void main() { gl_FragColor = vec4(1.0); }`;

const QUAD_VS = `varying vec2 vUv; void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const BLUR_FS = `
uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
void main() {
  float s = 0.0, ws = 0.0;
  for (int i = -6; i <= 6; i++) { float w = exp(-float(i * i) / 18.0); s += texture2D(tSrc, vUv + uDir * float(i)).r * w; ws += w; }
  gl_FragColor = vec4(vec3(s / ws), 1.0);
}`;
// depth of field (scatter-as-gather on a golden-angle spiral, Gustafsson) → ACES → warm grade → vignette → grain
const POST_FS = `
uniform sampler2D tCol;
uniform vec2 uPx;
uniform float uFocus, uMaxCoc, uFade, uTime, uExposure, uWarm;
varying vec2 vUv;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float coc(float z) { return clamp(uMaxCoc * abs(1.0 - uFocus / max(z, 1e-3)), 0.0, uMaxCoc); }
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main() {
  vec4 c0 = texture2D(tCol, vUv);
  float cs = coc(c0.a);
  vec3 col = c0.rgb; float tot = 1.0;
  float radius = 0.6, ang = hash12(gl_FragCoord.xy) * 6.2831853;
  for (int i = 0; i < 96; i++) {
    if (radius >= uMaxCoc) break;
    vec4 s = texture2D(tCol, vUv + vec2(cos(ang), sin(ang)) * uPx * radius);
    float ss = coc(s.a);
    if (s.a > c0.a) ss = clamp(ss, 0.0, cs * 2.0);       // a sharp subject is not smeared by the blurred background
    float m = smoothstep(radius - 0.5, radius + 0.5, ss);
    col += mix(col / tot, s.rgb, m);
    tot += 1.0;
    radius += 2.1 / radius;
    ang += 2.39996323;
  }
  col /= tot;
  col = aces(col * uExposure);
  col = pow(col, vec3(1.0 / 2.2));
  col = mix(col, col * vec3(1.03, 1.0, 0.94), uWarm);                     // the afterglow warms the print
  vec2 q = vUv - 0.5;
  col *= 1.0 - 0.38 * smoothstep(0.25, 0.85, length(q * vec2(1.0, 0.62)) * 1.25);
  col += (hash12(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * (2.2 / 255.0);
  gl_FragColor = vec4(col * uFade, 1.0);
}`;

defineDemo({
  id: '57-quilling-type',
  title: '종이 띠로 세운 글자',
  tech: '글리프 윤곽 → 세운 종이 띠 · 말림이 풀리는 띠 · 부드러운 그림자',
  duration: D,
  background: '#140e0a',
  async setup({ canvas, W, H }) {
    // ---- outlines: 온 above 기, centred, 1 em = 1 unit; font y (down) → world +z ----
    const font = await loadOutlineFont('Pretendard-Black');
    const raw = WORD.map((ch) => outlineContours(font, ch, 0, 0, 1000)[0].contours.map((c) => ({ pts: Array.from(c.pts, (v) => v / 1000), area: c.area })));
    const boxes = raw.map((cs) => {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const c of cs) for (let i = 0; i < c.pts.length; i += 2) { x0 = Math.min(x0, c.pts[i]); x1 = Math.max(x1, c.pts[i]); y0 = Math.min(y0, c.pts[i + 1]); y1 = Math.max(y1, c.pts[i + 1]); }
      return { x0, y0, x1, y1 };
    });
    const GAPZ = 0.13, total = boxes.reduce((s, b) => s + (b.y1 - b.y0), 0) + GAPZ;
    let zTop = -total / 2;
    const glyphs = raw.map((cs, g) => {
      const b = boxes[g], cx = (b.x0 + b.x1) / 2, dz = zTop - b.y0;
      zTop += b.y1 - b.y0 + GAPZ;
      const contours = cs.map((c) => ({ pts: Float64Array.from(c.pts, (v, i) => (i % 2 ? v + dz : v - cx)), hole: c.area > 0 }));
      return { contours, all: contours.map((c) => c.pts) };
    });

    // ---- strips: outer contour, its holes, next outer… sorted top-left → bottom-right within a glyph ----
    const strips = [];
    for (const g of glyphs) {
      const cen = (P) => { let x = 0, z = 0; for (let i = 0; i < P.length; i += 2) { x += P[i]; z += P[i + 1]; } return [(2 * x) / P.length, (2 * z) / P.length]; };
      const outers = g.contours.filter((c) => !c.hole).sort((a, b) => { const A = cen(a.pts), B = cen(b.pts); return A[1] + 0.5 * A[0] - (B[1] + 0.5 * B[0]); });
      const holes = g.contours.filter((c) => c.hole);
      for (const o of outers) {
        strips.push(o);
        const [ox0, ox1] = [Math.min(...o.pts.filter((_, i) => i % 2 === 0)), Math.max(...o.pts.filter((_, i) => i % 2 === 0))];
        for (const h of holes) { const [hx] = cen(h.pts); if (hx > ox0 && hx < ox1 && !h.used) { h.used = true; strips.push(h); } }
      }
      for (const h of holes) if (!h.used) strips.push(h);
    }
    const S = strips.map((c, i) => {
      const glyph = glyphs.find((g) => g.contours.includes(c));
      const st = prepareStrip(c.pts, glyph.all);
      const [t0, dur] = SCHED[i] || [0.45 + i * 0.7, 1.2];
      st.t0 = t0; st.dur = dur; st.Etot = st.eff[st.N - 1];
      // the moment each point of the strip is laid (inverse of the hand's progress)
      st.laidOf = (u) => {
        let lo = 0, hi = st.N - 1;
        while (hi - lo > 1) { const m = (lo + hi) >> 1; if (st.s[m] <= u) lo = m; else hi = m; }
        const e = st.eff[lo] + (st.eff[hi] - st.eff[lo]) * clamp((u - st.s[lo]) / (st.s[hi] - st.s[lo] || 1));
        return t0 + dur * handInv(clamp(e / st.Etot));
      };
      return st;
    });

    // ---- fill motifs ----
    const rng = rand(5701);
    const motifs = [];
    glyphs.forEach((g, gi) => {
      const circles = packMotifs(g.all, 31 + gi * 17);
      const list = circles.map((c) => {
        let type = 'tight';
        if (c.r >= 0.032) {
          const x = rng();
          type = x < 0.32 ? 'loose' : x < 0.56 ? 'tear' : x < 0.7 ? 'tight' : x < 0.84 ? 'eye' : x < 0.94 ? 'sscroll' : 'cscroll';
        }
        const m = { ...c, type, hand: rng() < 0.5 ? 1 : -1, rot: 0, glyph: gi };
        if (type === 'tear' && rng() < 0.5) { m.ux = -m.ux; m.uz = -m.uz; }
        m.pts = motifCurve(m, rng);
        const opts = TONES[type][gi], base = PAL[opts[Math.floor(rng() * opts.length)]], v = 0.95 + 0.1 * rng();
        m.col = base.map((x) => x * v);
        m.key = c.z + 0.35 * c.x + (rng() - 0.5) * 0.08;
        return m;
      });
      list.sort((a, b) => a.key - b.key);
      const [w0, w1] = FILL_WIN[gi];
      list.forEach((m, i) => { m.pop = w0 + (list.length > 1 ? i / (list.length - 1) : 0) * (w1 - w0) + (rng() - 0.5) * 0.05; });
      motifs.push(...list);
    });
    this.motifCount = motifs.length;

    // ---- renderer and passes ----
    const { el } = canvas({ type: 'webgl2' });
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    const camera = new THREE.PerspectiveCamera(30, W / H, 0.02, 80);

    const SM = 2048;
    const shadowRT = new THREE.WebGLRenderTarget(SM, SM, { depthTexture: new THREE.DepthTexture(SM, SM, THREE.FloatType), minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const lightCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20);
    // contact-occlusion map: strips seen from straight above (thickened ×3), then blurred
    const AOB = { x0: -0.8, x1: 0.8, z0: -1.25, z1: 1.25 }, AW = 512, AH = 800;
    const rtOpt = { type: THREE.UnsignedByteType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
    const aoRT = new THREE.WebGLRenderTarget(AW, AH, rtOpt), aoTmp = new THREE.WebGLRenderTarget(AW, AH, rtOpt);
    const aoCam = new THREE.OrthographicCamera(AOB.x0, AOB.x1, -AOB.z0, -AOB.z1, 0.1, 10);
    aoCam.up.set(0, 0, -1); aoCam.position.set(0, 5, 0); aoCam.lookAt(0, 0, 0); aoCam.updateMatrixWorld();
    const mainRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });

    const paperTex = new THREE.CanvasTexture(paperCanvas(2048, 1957));
    paperTex.wrapS = paperTex.wrapT = THREE.RepeatWrapping;
    paperTex.colorSpace = THREE.NoColorSpace;
    paperTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    // shared uniforms (each material spreads these, so one update reaches all of them)
    const U = {
      uTime: { value: 0 }, uTH: { value: TH }, uFat: { value: 1 },
      uShadow: { value: shadowRT.depthTexture }, uLightVP: { value: new THREE.Matrix4() }, uL: { value: new THREE.Vector3(0, 1, 0) },
      uSh: { value: new THREE.Vector4(1, 1, 0.07, 0) }, uKey: { value: new THREE.Vector3() }, uSky: { value: new THREE.Vector3() },
      uBounce: { value: new THREE.Vector3() }, uPool: { value: new THREE.Vector3(0, 0.04, 1.75) },
    };
    const fatOne = { value: 1 }, fatAO = { value: 3 };
    const scenes = { main: new THREE.Scene(), shadow: new THREE.Scene(), ao: new THREE.Scene() };
    // one geometry, three meshes: the picture, the shadow map (back faces only), the occupancy map
    const addPasses = (geo, vs, own) => {
      const mk = (fs, side, fat) => new THREE.ShaderMaterial({ uniforms: { ...U, ...own, uFat: fat }, vertexShader: vs, fragmentShader: fs, side });
      for (const [name, mat] of [['main', mk(PAPER_FS, THREE.FrontSide, fatOne)], ['shadow', mk(FLAT_FS, THREE.BackSide, fatOne)], ['ao', mk(FLAT_FS, THREE.DoubleSide, fatAO)]]) {
        const m = new THREE.Mesh(geo, mat);
        m.frustumCulled = false;
        scenes[name].add(m);
      }
    };
    S.forEach((st, i) => {
      st.U = {
        uTip: { value: -1 }, uLen: { value: st.L }, uPitch: { value: PITCH_COIL }, uRin: { value: 0.0045 }, uCurl: { value: st.curl },
        uAppear: { value: 0 }, uH: { value: H_OUT }, uTipPos: { value: new THREE.Vector2() }, uTipDir: { value: new THREE.Vector2(1, 0) },
        uColor: { value: new THREE.Vector3(...PAL.outline.map((x) => x * (0.97 + 0.06 * ((i * 0.37) % 1)))) },
      };
      addPasses(stripGeometry(st, st.laidOf), STRIP_VS, st.U);
    });
    addPasses(motifGeometry(motifs), MOTIF_VS, { uH: { value: H_FILL } });

    // the paper ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
      uniforms: {
        ...U, uPaper: { value: paperTex }, uAO: { value: aoRT.texture }, uTexel: { value: 1 / 2048 },
        uAOBox: { value: new THREE.Vector4(AOB.x0, AOB.z1, 1 / (AOB.x1 - AOB.x0), 1 / (AOB.z1 - AOB.z0)) },
        uPaperCol: { value: new THREE.Vector3(...PAL.ground) }, uFog: { value: new THREE.Vector3(0.022, 0.016, 0.012) },
      },
      vertexShader: GROUND_VS, fragmentShader: GROUND_FS,
    }));
    ground.renderOrder = 1;                 // last: the paper under the strips is never shaded
    scenes.main.add(ground);

    // full-screen passes
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    const quadScene = (mat) => { const s = new THREE.Scene(), m = new THREE.Mesh(tri, mat); m.frustumCulled = false; s.add(m); return s; };
    const blurMat = new THREE.ShaderMaterial({ uniforms: { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } }, vertexShader: QUAD_VS, fragmentShader: BLUR_FS, depthTest: false, depthWrite: false });
    const blurScene = quadScene(blurMat);
    const PU = {
      tCol: { value: mainRT.texture }, uPx: { value: new THREE.Vector2(1 / W, 1 / H) }, uFocus: { value: 1 }, uMaxCoc: { value: 1 },
      uFade: { value: 1 }, uTime: { value: 0 }, uExposure: { value: 0.82 }, uWarm: { value: 0 },
    };
    const postScene = quadScene(new THREE.ShaderMaterial({ uniforms: PU, vertexShader: QUAD_VS, fragmentShader: POST_FS, depthTest: false, depthWrite: false }));
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // ---- per-frame state, all from t ----
    const tmp = { x: 0, z: 0, tx: 1, tz: 0 };
    const tipOf = (st, t, out) => {
      const p = clamp((t - st.t0) / st.dur);
      const u = p <= 0 ? 0 : arcOfEffort(st, st.Etot * hand(p));
      stripAt(st, u, out);
      return p <= 0 ? -1e-5 : u;
    };
    const first = S[0], start = stripAt(first, 0, { x: 0, z: 0, tx: 1, tz: 0 });
    const lookAt = (t) => {
      // early on the camera drifts after the hand (a lagged average of the first strip's tip), then takes its own path
      let fx = 0, fz = 0, ws = 0;
      for (let k = 0; k < 8; k++) { const w = 1 - k / 8; tipOf(first, t - 0.09 * k, tmp); fx += tmp.x * w; fz += tmp.z * w; ws += w; }
      const follow = [lerp(start.x, fx / ws, 0.55), 0.012, lerp(start.z, fz / ws, 0.55)];
      const path = lookTrack(t), k = ramp(t, 0.9, 3.4);
      return follow.map((v, i) => lerp(v, path[i], k));
    };
    const kL = new THREE.Vector3(), corner = new THREE.Vector3(), tgtV = new THREE.Vector3();
    const warmA = [1.0, 0.8, 0.58], warmB = [1.0, 0.66, 0.4];

    this.render = (t) => {
      U.uTime.value = t;
      // strips
      for (const st of S) {
        const u = tipOf(st, t, tmp);
        st.U.uTip.value = u;
        st.U.uTipPos.value.set(tmp.x, tmp.z);
        st.U.uTipDir.value.set(tmp.tx, tmp.tz);
        st.U.uAppear.value = popJS(t - (st.t0 - 0.38));
      }
      // key light: low, warm, from the north-west; sinks and warms in the afterglow
      const el = (keyEl(t) * Math.PI) / 180, az = (keyAz(t) * Math.PI) / 180;
      kL.set(-Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).normalize();
      U.uL.value.copy(kL);
      const wk = ramp(t, 6.6, 9.8), ki = keyI(t);
      U.uKey.value.set(...warmA.map((c, i) => lerp(c, warmB[i], wk) * ki));
      U.uSky.value.set(0.42, 0.47, 0.6).multiplyScalar(0.62);
      U.uBounce.value.set(0.55, 0.42, 0.32).multiplyScalar(0.42);
      // shadow camera fitted around the word (and the coils at the strip tips) in light space
      lightCam.position.copy(kL).multiplyScalar(6);
      lightCam.up.set(0, 1, 0);
      lightCam.lookAt(0, 0, 0);
      lightCam.updateMatrixWorld();
      const inv = lightCam.matrixWorldInverse;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (let q = 0; q < 8; q++) {
        corner.set(q & 1 ? 0.74 : -0.74, q & 2 ? 0.14 : 0, q & 4 ? 1.14 : -1.14).applyMatrix4(inv);
        x0 = Math.min(x0, corner.x); x1 = Math.max(x1, corner.x); y0 = Math.min(y0, corner.y); y1 = Math.max(y1, corner.y); z0 = Math.min(z0, corner.z); z1 = Math.max(z1, corner.z);
      }
      const side = Math.max(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;   // square texels
      lightCam.left = cx - side / 2; lightCam.right = cx + side / 2; lightCam.bottom = cy - side / 2; lightCam.top = cy + side / 2;
      lightCam.near = -z1 - 0.2; lightCam.far = -z0 + 0.2;
      lightCam.updateProjectionMatrix();
      U.uLightVP.value.multiplyMatrices(lightCam.projectionMatrix, lightCam.matrixWorldInverse);
      const span = lightCam.far - lightCam.near;
      U.uSh.value.set(span, side, 0.075, 0.0009 / span);
      // camera
      const ce = (camEl(t) * Math.PI) / 180, ca = (camAz(t) * Math.PI) / 180, cd = camDist(t), tg = lookAt(t);
      tgtV.set(tg[0], tg[1], tg[2]);
      camera.position.set(tg[0] + cd * Math.cos(ce) * Math.sin(ca), tg[1] + cd * Math.sin(ce), tg[2] + cd * Math.cos(ce) * Math.cos(ca));
      camera.up.set(0, 1, 0);
      camera.lookAt(tgtV);
      camera.updateMatrixWorld();

      // 1 · shadow map (key light, back faces)
      renderer.setRenderTarget(shadowRT);
      renderer.setClearColor(0xffffff, 1);
      renderer.render(scenes.shadow, lightCam);
      // 2 · contact occlusion: occupancy from above, blurred (≈ 0.02 em)
      renderer.setRenderTarget(aoRT);
      renderer.setClearColor(0x000000, 1);
      renderer.render(scenes.ao, aoCam);
      blurMat.uniforms.tSrc.value = aoRT.texture; blurMat.uniforms.uDir.value.set(1 / AW, 0);
      renderer.setRenderTarget(aoTmp); renderer.render(blurScene, quadCam);
      blurMat.uniforms.tSrc.value = aoTmp.texture; blurMat.uniforms.uDir.value.set(0, 1 / AH);
      renderer.setRenderTarget(aoRT); renderer.render(blurScene, quadCam);
      // 3 · the picture (HDR, view depth in alpha)
      renderer.setRenderTarget(mainRT);
      renderer.setClearColor(0x000000, 1);
      renderer.render(scenes.main, camera);
      // 4 · depth of field, tone, grade
      PU.uFocus.value = camera.position.distanceTo(tgtV);
      PU.uMaxCoc.value = aperture(t);
      PU.uFade.value = fadeOf(t);
      PU.uTime.value = t;
      PU.uWarm.value = ramp(t, 6.8, 9.8);
      renderer.setRenderTarget(null);
      renderer.render(postScene, quadCam);
    };
  },
  frame(t) {
    this.render(t);
  },
});
