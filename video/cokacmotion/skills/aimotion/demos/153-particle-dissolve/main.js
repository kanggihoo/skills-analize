/*
 * 153 · 흩어졌다 다시 피어나는 — a celadon vase in window light is carried off by a wind, grain by grain, and the grains
 * settle again as a celadon lotus.
 *
 *   dissolve   the vase is a lit MeshStandardMaterial; onBeforeCompile adds a threshold field h(p, t) (gradient + fBm that
 *              drifts with t, field.js) and discards where h < k(t). A thin band above the threshold is emissive in the
 *              one accent colour. The shadow pass uses a MeshDepthMaterial with the same discard, so the shadow dissolves too.
 *   grains     15 000 points sampled on the vase's outer wall (grains.js). Each grain is born when the same field crosses k
 *              at its point, rides a baked path (drag toward swirl + updraft + curl noise), and lands on a point of the lotus
 *              at the time the lotus's inverse dissolve closes there. Drawn as screen-space capsules from the position at
 *              t − shutter to t (motion blur) with a depth-of-field disc.
 *   light      one directional "window" light whose colour is multiplied by an analytic window mask (soft edges that widen
 *              with distance from the window, two mullions) inside three's light loop; the grains, the dust and a
 *              half-resolution haze pass use the same mask, so all of them catch the same beam. A PMREM of a small
 *              procedural room (an equirect with one bright window) gives the glaze its reflections.
 * Everything is a function of t: uniforms, camera and the grains' positions are recomputed every frame.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { defineDemo, rand, smooth, ramp, track } from '../_lib/stage.js';
import { SRC, DST, NOISE_GLSL, fieldGLSL, fitField, threshold, vnoise } from './field.js';
import { buildVase, buildFlower } from './forms.js';
import { N, KEYS, KEY_DT, PW, APPROACH, SPIN, bakeGrains } from './grains.js';

const D = 9;
const SW = 1080, SH = 1920;
const GRAIN = 0.005;                             // grain radius (world units)
const WALL_Z = -1.3;

// ---------------------------------------------------------------- palette (one accent: the glowing edge)
const COL = {
  wall: '#e4d9c9', board: '#5b4839', glaze: '#86ab9a', grainA: '#6d9a87', grainB: '#9cc0ae', clay: '#c2ab8e',
  accent: '#ff9333', sun: [1.0, 0.86, 0.68], sunI: 2.75,
};

// ---------------------------------------------------------------- window light (analytic mask)
// A window plane perpendicular to the light: q = (p·U, p·V) is where the ray from p toward the light crosses it.
const LD = new THREE.Vector3(-0.5, 0.32, 0.8).normalize();                 // toward the window
const LU = new THREE.Vector3().crossVectors(LD, new THREE.Vector3(0, 1, 0)).normalize();
const LV = new THREE.Vector3().crossVectors(LU, LD).normalize();
const WIN = new THREE.Vector4(-1.9, 0.98, -0.75, 2.5);                     // opening: u0, u1, v0, v1
const MUL = new THREE.Vector3(-0.75, 2.12, 0.05);                            // mullions: u, v, half width
const PEN = new THREE.Vector3(0.006, 0.009, 6.0);                           // penumbra = x + y · (distance to the window, z − p·LD)

const WIN_GLSL = /* glsl */`
uniform vec3 uLD, uLU, uLV; uniform vec4 uWin; uniform vec3 uMul, uPen;
float winMask(vec3 p) {
  float s = max(uPen.z - dot(p, uLD), 0.0);
  float pen = uPen.x + uPen.y * s;
  vec2 q = vec2(dot(p, uLU), dot(p, uLV));
  float a = smoothstep(-pen, pen, q.x - uWin.x) * smoothstep(-pen, pen, uWin.y - q.x)
          * smoothstep(-pen, pen, q.y - uWin.z) * smoothstep(-pen, pen, uWin.w - q.y);
  float m = smoothstep(-pen, pen, abs(q.x - uMul.x) - uMul.z) * smoothstep(-pen, pen, abs(q.y - uMul.y) - uMul.z);
  return a * m;
}`;

// the directional light is multiplied by the window mask inside three's own light loop
const LIGHTS_CHUNK = THREE.ShaderChunk.lights_fragment_begin.replace(
  'getDirectionalLightInfo( directionalLight, directLight );',
  'getDirectionalLightInfo( directionalLight, directLight );\n\t\tdirectLight.color *= winMask( vWorldP );');
if (LIGHTS_CHUNK === THREE.ShaderChunk.lights_fragment_begin) throw new Error('light loop patch did not apply');

// ---------------------------------------------------------------- timeline
const T_WIND = 1.1;                               // the breeze arrives (the dust starts to drift)
const camTarget = track([[0, [0, 0.8, 0]], [1.6, [0, 0.82, 0]], [5.3, [0.1, 1.58, 0]], [8.7, [0, 0.27, 0]]]);
const camDist = track([[0, 5.95], [1.6, 5.5], [5.3, 7.1], [8.7, 4.15], [D, 4.1]]);
const camEl = track([[0, 0.07], [1.6, 0.075], [5.3, 0.03], [8.7, 0.42]]);
const camAz = track([[0, -0.11], [D, 0.1, (p) => 0.5 - 0.5 * Math.cos(Math.PI * p)]]);
const bloomK = track([[0, 0.3], [1.7, 0.42], [3.0, 0.6], [4.6, 0.48], [6.6, 0.45], [7.4, 0.62], [8.7, 0.36], [D, 0.32]]);

// ---------------------------------------------------------------- material patching
/**
 * Inject the window mask (and optionally the dissolve) into a built-in material.
 * opts.dissolve: GLSL with fieldSrc() and fieldDst(); the material's uniforms pick one (uWhich 0: keep h > k, the
 *   vase dissolving; 1: keep h < k, the lotus closing). Both pieces share one program this way.
 * opts.color: GLSL run after <color_fragment> (diffuseColor, vObjP, vWorldP in scope); opts.decl: extra declarations
 * opts.depth: a MeshDepthMaterial for the shadow pass (only the discard is added)
 */
function patch(mat, key, opts = {}) {
  const { dissolve, color = '', depth = false, U = {}, decl = '' } = opts;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObjP;\nvarying vec3 vWorldP;')
      .replace('#include <project_vertex>', '#include <project_vertex>\n\tvObjP = transformed;\n\tvWorldP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    let head = `varying vec3 vObjP;\nvarying vec3 vWorldP;\n${decl}\n`;
    if (!depth) head += WIN_GLSL;
    if (dissolve) head += `${NOISE_GLSL}\n${dissolve}\nuniform float uTime, uK, uGlow, uWhich, uEdge, uVase; uniform vec3 uAccent;\nfloat dEdge;\n`;
    let fs = sh.fragmentShader.replace('#include <common>', `#include <common>\n${head}`);
    if (dissolve) {
      // the dissolve: the signed distance to the threshold, in field units; below zero the fragment is gone
      fs = fs.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        dEdge = uWhich < 0.5 ? fieldSrc(vObjP, uTime) - uK : uK - fieldDst(vObjP, uTime);
        if (dEdge < 0.0) discard;`);
    }
    if (!depth) {
      fs = fs.replace('#include <color_fragment>', `#include <color_fragment>\n${color}`)
        .replace('#include <lights_fragment_begin>', LIGHTS_CHUNK);
      if (dissolve) {
        // the glowing edge: a soft band plus a thin hot core right at the threshold
        fs = fs.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { float band = 1.0 - smoothstep(0.0, uEdge, dEdge);
            float core = 1.0 - smoothstep(0.0, uEdge * 0.28, dEdge);
            totalEmissiveRadiance += uAccent * uGlow * (band * band * 1.3 + core * 7.0); }`);
      }
    }
    sh.fragmentShader = fs;
  };
  mat.customProgramCacheKey = () => key;
  return mat;
}

// ---------------------------------------------------------------- grain shaders
const GRAIN_VERT = /* glsl */`
uniform sampler2D uPath; uniform float uTime, uShutter, uGrain, uFocus, uAperture;
uniform vec2 uView; uniform vec3 uSun, uAmb, uAccent, uGlazeA, uGlazeB;
attribute vec4 aT;     // birth, arrival, landing time, id
attribute vec3 aDst;   // landing point on the lotus
attribute vec3 aApp;   // approach direction at the landing point
attribute vec4 aR;     // size, glint phase, tint, glint rate
varying vec2 vL; varying float vHalf, vR, vA; varying vec3 vCol;
${WIN_GLSL}
vec3 pkey(int k) {
  int i = int(aT.w) * ${KEYS} + clamp(k, 0, ${KEYS - 1});
  return texelFetch(uPath, ivec2(i % ${PW}, i / ${PW}), 0).xyz;
}
// the baked path at age s: Catmull-Rom through the keys
vec3 flowAt(float s) {
  float x = clamp(s / ${KEY_DT.toFixed(6)}, 0.0, ${(KEYS - 1).toFixed(1)});
  int k = int(min(floor(x), ${(KEYS - 2).toFixed(1)}));
  float f = x - float(k);
  vec3 p0 = pkey(k - 1), p1 = pkey(k), p2 = pkey(k + 1), p3 = pkey(k + 2);
  return 0.5 * (2.0 * p1 + (p2 - p0) * f + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * f * f + (3.0 * p1 - p0 - 3.0 * p2 + p3) * f * f * f);
}
// path → landing: a staggered quintic ease onto the target, coming in along its normal, swirling about the lotus axis
vec3 posAt(float t) {
  vec3 p = flowAt(t - aT.x);
  float c = clamp((t - (aT.y - aT.z)) / aT.z, 0.0, 1.0);
  c = c * c * c * (c * (c * 6.0 - 15.0) + 10.0);
  vec3 tgt = aDst + aApp * (${APPROACH.toFixed(3)} * (1.0 - c) * (1.0 - c));
  p = mix(p, tgt, c);
  float phi = ${SPIN.toFixed(3)} * c * (1.0 - c), cs = cos(phi), sn = sin(phi);
  return vec3(cs * p.x - sn * p.z, p.y, sn * p.x + cs * p.z);
}
void main() {
  float t = uTime, age = t - aT.x, after = t - aT.y;
  float alive = step(0.0, age) * (1.0 - smoothstep(-0.08, 0.14, after));
  if (alive <= 0.0) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
  vec3 P1 = posAt(t), P0 = posAt(max(t - uShutter, aT.x));
  mat4 vp = projectionMatrix * viewMatrix;
  vec4 c1 = vp * vec4(P1, 1.0), c0 = vp * vec4(P0, 1.0);
  if (c1.w < 0.2 || c0.w < 0.2) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
  vec2 s1 = c1.xy / c1.w * 0.5 * uView, s0 = c0.xy / c0.w * 0.5 * uView;
  vec2 d = s1 - s0;
  float len = min(length(d), 140.0);
  vec2 dir = len > 0.01 ? normalize(d) : vec2(1.0, 0.0), perp = vec2(-dir.y, dir.x);
  float ppu = projectionMatrix[1][1] * uView.y * 0.5;
  float land = clamp((t - (aT.y - aT.z)) / aT.z, 0.0, 1.0);
  float r0 = max(aR.x * uGrain * (1.0 - 0.4 * land * land) * ppu / c1.w, 0.75);   // a grain melts into the surface as it lands
  float coc = uAperture * abs(c1.w - uFocus) / c1.w;
  float r = r0 + coc;
  vec2 lc = vec2(position.x * (len * 0.5 + r + 1.0), position.y * (r + 1.0));
  vec2 sp = (s0 + s1) * 0.5 + dir * lc.x + perp * lc.y;
  gl_Position = vec4(sp / (0.5 * uView) * c1.w, c1.z, c1.w);
  vL = lc; vHalf = len * 0.5; vR = r;
  // the grain's light is spread over its blur streak and its defocus disc
  float spread = (r0 * r0) / (r * r) * (2.0 * r / (2.0 * r + len));
  vA = alive * clamp(spread * 1.15, 0.035, 1.0);
  // light: ambient + the window beam (the room's own mask), a glint when a facet turns to the window,
  // and heat: hot as it breaks off the edge, hot again as it lands on the closing edge
  float beam = winMask(P1);
  float glint = pow(max(sin(aR.y * 6.2832 + t * aR.w), 0.0), 40.0) * beam;
  float heat = exp(-age / 0.34) + smoothstep(-0.16, 0.0, after) * 0.35;
  vec3 base = mix(uGlazeA, uGlazeB, aR.z);
  vCol = base * (uAmb + uSun * beam) + uSun * glint * 8.0 + uAccent * heat * 3.0;
}`;
const GRAIN_FRAG = /* glsl */`
varying vec2 vL; varying float vHalf, vR, vA; varying vec3 vCol;
void main() {
  float d = length(vec2(max(abs(vL.x) - vHalf, 0.0), vL.y));
  float a = (1.0 - smoothstep(vR - 0.9, vR + 0.4, d)) * vA;
  if (a < 0.002) discard;
  gl_FragColor = vec4(vCol * a, a);
}`;

// dust motes: always in the room, visible only inside the beam
const DUST_VERT = /* glsl */`
uniform float uTime, uWind, uFocus, uAperture; uniform vec2 uView;
attribute vec4 aSeed;
varying float vA;
${WIN_GLSL}
void main() {
  vec3 p = position + vec3(0.07 * sin(uTime * 0.31 + aSeed.x * 6.28), 0.03 * uTime + 0.05 * sin(uTime * 0.23 + aSeed.y * 6.28), 0.06 * cos(uTime * 0.27 + aSeed.z * 6.28))
         + vec3(0.5, 0.36, -0.1) * uWind * (0.6 + 0.8 * aSeed.w);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float dd = -mv.z, ppu = projectionMatrix[1][1] * uView.y * 0.5;
  float r = max(0.006 * (0.5 + aSeed.w) * ppu / dd, 0.8), coc = uAperture * abs(dd - uFocus) / dd;
  gl_PointSize = 2.0 * (r + coc) + 2.0;
  float tw = 0.55 + 0.45 * sin(uTime * (0.8 + 1.6 * aSeed.w) + aSeed.x * 40.0);
  vA = winMask(p) * tw * clamp(r * r / ((r + coc) * (r + coc)) * 1.3, 0.015, 1.0) * step(0.2, dd);
}`;
const DUST_FRAG = /* glsl */`
uniform vec3 uSun;
varying float vA;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = (1.0 - smoothstep(0.55, 1.0, r)) * vA;
  gl_FragColor = vec4(uSun * 0.9, a);   // additive blending is (src·α, one)
}`;

// half-resolution beam haze: march each view ray to the wall or the table and sum the window mask
const HAZE_FRAG = /* glsl */`
uniform mat4 uInvVP; uniform vec3 uCam;
varying vec2 vUv;
${WIN_GLSL}
float h12(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
void main() {
  vec4 w = uInvVP * vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
  vec3 rd = normalize(w.xyz / w.w - uCam);
  float tEnd = 14.0;
  if (rd.z < 0.0) tEnd = min(tEnd, (${WALL_Z.toFixed(2)} - uCam.z) / rd.z);
  if (rd.y < 0.0) tEnd = min(tEnd, (0.0 - uCam.y) / rd.y);
  const int NS = 10;
  float dt = tEnd / float(NS), j = h12(gl_FragCoord.xy), s = 0.0;
  for (int i = 0; i < NS; i++) {
    vec3 p = uCam + rd * (dt * (float(i) + j));
    s += winMask(p) * smoothstep(-0.2, 0.6, p.y);
  }
  gl_FragColor = vec4(s * dt, 0.0, 0.0, 1.0);
}`;

// bloom: bright pass with a 4× box downsample, then separable 9-tap Gaussians at 1/4 and 1/8 resolution
const BRIGHT_FRAG = /* glsl */`
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr;
varying vec2 vUv;
void main() {
  vec3 c = 0.25 * (texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb
                 + texture2D(tSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb);
  float l = max(max(c.r, c.g), c.b);
  gl_FragColor = vec4(c * max(l - uThr, 0.0) / max(l, 1e-4), 1.0);
}`;
const BLUR_FRAG = /* glsl */`
uniform sampler2D tSrc; uniform vec2 uDir;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(tSrc, vUv).rgb * 0.2270;
  c += (texture2D(tSrc, vUv + uDir * 1.3846).rgb + texture2D(tSrc, vUv - uDir * 1.3846).rgb) * 0.3162;
  c += (texture2D(tSrc, vUv + uDir * 3.2308).rgb + texture2D(tSrc, vUv - uDir * 3.2308).rgb) * 0.0703;
  gl_FragColor = vec4(c, 1.0);
}`;

const FINAL_FRAG = /* glsl */`
uniform sampler2D tDiffuse, tHaze, tBloomA, tBloomB; uniform vec3 uHazeCol; uniform float uFrame, uBloom;
varying vec2 vUv;
float h12(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
void main() {
  vec3 col = texture2D(tDiffuse, vUv).rgb + uHazeCol * texture2D(tHaze, vUv).r;
  col += uBloom * (texture2D(tBloomA, vUv).rgb * 0.6 + texture2D(tBloomB, vUv).rgb * 0.9);
  float v = length((vUv - vec2(0.5, 0.54)) * vec2(0.9, 1.0)) * 1.3;
  col *= 1.0 - 0.3 * pow(clamp(v, 0.0, 1.0), 2.3);
  gl_FragColor = vec4(max(col, 0.0), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb += (h12(gl_FragCoord.xy + uFrame * 17.0) - 0.5) * 0.012;
}`;

const FS_VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

// ---------------------------------------------------------------- setup helpers
function woodTexture(headless) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  const R = rand(15301);
  g.fillStyle = '#b8916a'; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 220; i++) {
    const y0 = R() * 512, a = 0.04 + R() * 0.1, w = 0.6 + R() * 2.2, ph = R() * 6.28, amp = 2 + R() * 6, f = 0.004 + R() * 0.008;
    g.strokeStyle = R() < 0.6 ? `rgba(96,66,42,${a})` : `rgba(226,192,148,${a * 0.9})`;
    g.lineWidth = w;
    g.beginPath();
    for (let x = -10; x <= 1034; x += 16) {
      const y = y0 + amp * Math.sin(x * f + ph) + 0.6 * amp * Math.sin(x * f * 2.7 + ph * 1.7);
      if (x === -10) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  tx.anisotropy = 4;
  return tx;
}

/** a small procedural room as an HDR equirect (warm walls, a bright window toward LD, table below) → PMREM, once */
function roomEnvironment(renderer) {
  const EW = 128, EH = 64, data = new Uint16Array(EW * EH * 4), h = THREE.DataUtils.toHalfFloat;
  const d = new THREE.Vector3();
  for (let j = 0; j < EH; j++) for (let i = 0; i < EW; i++) {
    const el = ((j + 0.5) / EH - 0.5) * Math.PI, ph = ((i + 0.5) / EW - 0.5) * Math.PI * 2;
    d.set(Math.cos(el) * Math.cos(ph), Math.sin(el), Math.cos(el) * Math.sin(ph));     // three's equirect direction
    let c = el < -0.15 ? [0.42, 0.34, 0.26] : [0.3, 0.285, 0.265];                     // table / floor below, walls above
    if (d.z < -0.6 && el > -0.15 && el < 0.7) c = [0.56, 0.48, 0.39];                  // the sunlit wall behind
    const w = d.dot(LD), u = d.dot(LU), v = d.dot(LV);
    if (w > 0.8 && Math.abs(u) < 0.26 && Math.abs(v - 0.05) < 0.3) c = [9.0, 8.3, 7.4]; // the window
    const q = (j * EW + i) * 4;
    data[q] = h(c[0]); data[q + 1] = h(c[1]); data[q + 2] = h(c[2]); data[q + 3] = h(1);
  }
  const tex = new THREE.DataTexture(data, EW, EH, THREE.RGBAFormat, THREE.HalfFloatType);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromEquirectangular(tex);
  pmrem.dispose();
  return rt.texture;
}

/** plaster: two octaves of the field's value noise baked into a texture (no noise left in the wall's shader) */
function plasterTexture(headless) {
  const S = 512, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  const im = g.createImageData(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const k = 0.94 + 0.045 * vnoise((x / S) * 14, (y / S) * 10, 3.3) + 0.03 * vnoise((x / S) * 70, (y / S) * 50, 7.1);
    const q = (y * S + x) * 4;
    im.data[q] = im.data[q + 1] = im.data[q + 2] = Math.round(255 * Math.min(1, k)); im.data[q + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  return tx;
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '153-particle-dissolve',
  title: '흩어졌다 다시 피어나는',
  tech: '입자 디졸브 · 노이즈 임계값 + 발광 가장자리 + 표면 입자 흐름',
  duration: D,
  background: '#2a221c',

  async setup(api) {
    const HL = api.headless;

    // ---- renderer
    const el = api.layer('canvas', { z: 0 });
    el.width = SW; el.height = SH;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(SW, SH, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, SW / SH, 0.1, 40);
    scene.environment = roomEnvironment(renderer);
    scene.environmentIntensity = 0.55;

    // ---- shared uniforms
    const WU = { uLD: { value: LD }, uLU: { value: LU }, uLV: { value: LV }, uWin: { value: WIN }, uMul: { value: MUL }, uPen: { value: PEN } };
    const accent = new THREE.Color(COL.accent);
    const sunCol = new THREE.Vector3(...COL.sun);
    const uTime = { value: 0 };

    // ---- light: the window sun (masked in the shaders) + its shadow map for the two pieces
    const sun = new THREE.DirectionalLight(new THREE.Color(...COL.sun), COL.sunI);
    sun.position.copy(LD).multiplyScalar(9).add(new THREE.Vector3(0, 0.7, 0));
    sun.target.position.set(0, 0.7, 0);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -2.0; sc.right = 2.0; sc.top = 2.0; sc.bottom = -2.0; sc.near = 4; sc.far = 15;
    sun.shadow.radius = 3;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.018;
    scene.add(sun, sun.target);
    scene.add(new THREE.HemisphereLight(0xfff3e4, 0x7a6754, 0.2));

    // ---- room: plaster wall, oak top, dark oak sideboard — one Lambert program for all three (map + window mask +
    // contact darkening); their share of the room light is a constant emissive fill
    const AO = { uAOV: { value: 1 }, uAOF: { value: 0 } }, AO0 = { uAOV: { value: 0 }, uAOF: { value: 0 } };
    const room = (opts, ao) => patch(new THREE.MeshLambertMaterial(opts), 'room', {
      U: { ...WU, ...ao }, decl: 'uniform float uAOV, uAOF;',
      color: `{ float r = length(vWorldP.xz);
        float aoV = uAOV * 0.5 * exp(-max(r - 0.255, 0.0) / 0.05) * step(0.2, r);
        float aoF = uAOF * 0.32 * exp(-pow(r / 0.6, 4.0));
        diffuseColor.rgb *= (1.0 - aoV) * (1.0 - aoF); }`,
    });
    const fill = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
    const plaster = plasterTexture(HL), wood = woodTexture(HL);
    wood.repeat.set(2.2, 1);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), room({ color: COL.wall, map: plaster, emissive: fill(COL.wall, 0.1) }, AO0));
    wall.position.set(0, 3.2, WALL_Z);
    wall.receiveShadow = true;
    scene.add(wall);
    const top = new THREE.Mesh(new RoundedBoxGeometry(9, 0.16, 3.4, 4, 0.05), room({ color: '#ffffff', map: wood, emissive: fill('#a07c58', 0.1) }, AO));
    top.position.set(0, -0.08, WALL_Z + 1.7);
    top.receiveShadow = true;
    scene.add(top);
    const board = new THREE.Mesh(new RoundedBoxGeometry(8.6, 2.6, 3.1, 3, 0.03), room({ color: COL.board, map: wood, emissive: fill(COL.board, 0.06) }, AO0));
    board.position.set(0, -1.46, WALL_Z + 1.6);
    scene.add(board);

    // ---- the vase (source) and the lotus (target), each fitted with its own field
    const { geo: vaseGeo, outerGeo } = buildVase();
    fitField(SRC, vaseGeo.attributes.position.array);
    const { geo: flowerGeo } = buildFlower(rand(15302));
    fitField(DST, flowerGeo.attributes.position.array, 3);

    // one glaze program for both pieces: the uniforms say which field, which side of it, and whether the foot is bare
    const piece = (which, F) => ({ uTime, uK: { value: -9 }, uGlow: { value: 1 }, uWhich: { value: which }, uEdge: { value: F.edge }, uVase: { value: 1 - which }, uAccent: { value: accent } });
    const VU = piece(0, SRC), FU = piece(1, DST);
    const dissolve = fieldGLSL(SRC, 'fieldSrc') + fieldGLSL(DST, 'fieldDst');
    const glazeColor = `{
      float glazed = mix(1.0, smoothstep(0.05, 0.072, vObjP.y), uVase);
      diffuseColor.rgb *= mix(1.0, mix(0.86, 1.04, smoothstep(0.1, 1.35, vObjP.y)), uVase);
      diffuseColor.rgb *= 1.0 - 0.18 * smoothstep(0.87, 0.94, vnoise(vObjP * 150.0));
      diffuseColor.rgb = mix(vec3(${new THREE.Color(COL.clay).toArray().map((x) => x.toFixed(4)).join(', ')}), diffuseColor.rgb, glazed);
    }`;
    const glaze = (U) => patch(new THREE.MeshStandardMaterial({ color: COL.glaze, roughness: 0.2, envMapIntensity: 1.1, vertexColors: true }),
      'glaze', { U: { ...WU, ...U }, dissolve, color: glazeColor });
    const depthMat = (U) => patch(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), 'glaze-depth', { U, dissolve, depth: true });

    vaseGeo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(vaseGeo.attributes.position.count * 3).fill(1), 3));
    const vase = new THREE.Mesh(vaseGeo, glaze(VU));
    vase.castShadow = true; vase.receiveShadow = true;
    vase.customDepthMaterial = depthMat(VU);      // the shadow dissolves with the vase
    scene.add(vase);

    const flower = new THREE.Mesh(flowerGeo, glaze(FU));
    flower.castShadow = true; flower.receiveShadow = true;
    flower.customDepthMaterial = depthMat(FU);
    scene.add(flower);

    // ---- grains: sample, time, pair, bake (grains.js) → a float texture of path keys + per-grain attributes
    const t0 = performance.now();
    const B = bakeGrains(outerGeo, flowerGeo);
    const pathTex = new THREE.DataTexture(B.path, PW, B.PH, THREE.RGBAFormat, THREE.FloatType);
    pathTex.minFilter = pathTex.magFilter = THREE.NearestFilter;
    pathTex.generateMipmaps = false;
    pathTex.needsUpdate = true;
    window.__bake = { ms: Math.round(performance.now() - t0), backCrossings: B.back };

    const qg = new THREE.InstancedBufferGeometry();
    qg.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
    qg.setIndex([0, 1, 2, 0, 2, 3]);
    qg.setAttribute('aT', new THREE.InstancedBufferAttribute(B.aT, 4));
    qg.setAttribute('aDst', new THREE.InstancedBufferAttribute(B.aDst, 3));
    qg.setAttribute('aApp', new THREE.InstancedBufferAttribute(B.aApp, 3));
    qg.setAttribute('aR', new THREE.InstancedBufferAttribute(B.aR, 4));
    qg.instanceCount = N;
    const GU = {
      ...WU, uPath: { value: pathTex }, uTime, uShutter: { value: 0.4 / 30 }, uGrain: { value: GRAIN },
      uFocus: { value: 6 }, uAperture: { value: 18 }, uView: { value: new THREE.Vector2(SW, SH) },
      uSun: { value: sunCol.clone().multiplyScalar(0.62) }, uAmb: { value: new THREE.Vector3(0.3, 0.32, 0.34) },
      uAccent: { value: accent }, uGlazeA: { value: new THREE.Color(COL.grainA) }, uGlazeB: { value: new THREE.Color(COL.grainB) },
    };
    const grains = new THREE.Mesh(qg, new THREE.ShaderMaterial({
      uniforms: GU, vertexShader: GRAIN_VERT, fragmentShader: GRAIN_FRAG, transparent: true, depthWrite: false,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    }));
    grains.frustumCulled = false;
    grains.renderOrder = 2;
    scene.add(grains);

    // ---- dust in the beam
    const ND = 170, RD = rand(15307);
    const dPos = new Float32Array(ND * 3), dSeed = new Float32Array(ND * 4);
    for (let i = 0; i < ND; i++) {
      dPos.set([-1.6 + 3.2 * RD(), -0.1 + 3.6 * RD(), -1.0 + 3.8 * RD()], i * 3);
      dSeed.set([RD(), RD(), RD(), RD()], i * 4);
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
    dg.setAttribute('aSeed', new THREE.BufferAttribute(dSeed, 4));
    const DU = { ...WU, uTime, uWind: { value: 0 }, uFocus: GU.uFocus, uAperture: GU.uAperture, uView: GU.uView, uSun: { value: sunCol } };
    const dust = new THREE.Points(dg, new THREE.ShaderMaterial({
      uniforms: DU, vertexShader: DUST_VERT, fragmentShader: DUST_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    dust.frustumCulled = false;
    dust.renderOrder = 3;
    scene.add(dust);

    // ---- post, without a composer: scene (2× MSAA, HDR) → haze at 1/2 → bloom at 1/4 and 1/8 → one final pass
    // (haze + bloom + vignette + ACES + sRGB + film grain)
    const target = (w, h, o = {}) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: false, ...o });
    const rt = target(SW, SH, { depthBuffer: true, samples: 2 });
    const hazeRT = target(SW / 2, SH / 2);
    const bA = target(SW / 4, SH / 4), bA2 = target(SW / 4, SH / 4), bB = target(SW / 8, SH / 8), bB2 = target(SW / 8, SH / 8);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    quad.frustumCulled = false;
    const quadScene = new THREE.Scene();
    quadScene.add(quad);
    const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const fsMat = (frag, uniforms) => new THREE.ShaderMaterial({ uniforms, vertexShader: FS_VERT, fragmentShader: frag, depthTest: false, depthWrite: false });
    const HU = { ...WU, uInvVP: { value: new THREE.Matrix4() }, uCam: { value: new THREE.Vector3() } };
    const hazeMat = fsMat(HAZE_FRAG, HU);
    const brightMat = fsMat(BRIGHT_FRAG, { tSrc: { value: rt.texture }, uTexel: { value: new THREE.Vector2(1 / SW, 1 / SH) }, uThr: { value: 2.2 } });
    const blur = (src, dx, dy) => fsMat(BLUR_FRAG, { tSrc: { value: src.texture }, uDir: { value: new THREE.Vector2(dx / src.width, dy / src.height) } });
    const finalMat = fsMat(FINAL_FRAG, {
      tDiffuse: { value: rt.texture }, tHaze: { value: hazeRT.texture }, tBloomA: { value: bA.texture }, tBloomB: { value: bB.texture },
      uHazeCol: { value: sunCol.clone().multiplyScalar(0.012) }, uFrame: { value: 0 }, uBloom: { value: 0.4 },
    });
    const steps = [
      [brightMat, bA], [blur(bA, 1, 0), bA2], [blur(bA2, 0, 1), bA],      // bloom A (1/4)
      [blur(bA, 2, 0), bB], [blur(bB, 1, 0), bB2], [blur(bB2, 0, 1), bB], // bloom B (1/8, wider)
    ];
    const run = (mat, to) => { quad.material = mat; renderer.setRenderTarget(to); renderer.render(quadScene, fsCam); };
    const draw = () => {
      run(hazeMat, hazeRT);
      renderer.setRenderTarget(rt);
      renderer.render(scene, camera);
      for (const [m, to] of steps) run(m, to);
      run(finalMat, null);
    };

    // compile every program now (both pieces, their shadow-depth variants, grains, post) rather than on the first frame
    // that shows each of them, and wait until the GPU has built them
    VU.uK.value = 0.5; FU.uK.value = 0.5;
    camera.position.set(0, 1.2, 5.5); camera.lookAt(0, 0.8, 0); camera.updateMatrixWorld(true);
    draw();
    const gl = renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));

    Object.assign(this, { camera, draw, finalMat, vase, flower, VU, FU, AO, uTime, GU, DU, HU });
  },

  frame(t) {
    const S = this;
    S.uTime.value = t;

    // ---- the two thresholds; each piece is skipped when none of it can be visible
    S.VU.uK.value = threshold(SRC, t);
    S.FU.uK.value = threshold(DST, t);
    S.vase.visible = t < SRC.t1 + 0.1;
    S.flower.visible = t > DST.t0 - 0.1;
    S.FU.uGlow.value = 1 - 0.85 * ramp(t, DST.t1 - 0.2, D);
    S.AO.uAOV.value = 1 - ramp(t, 3.6, 4.4);
    S.AO.uAOF.value = ramp(t, 6.9, 8.3);
    S.DU.uWind.value = t < T_WIND ? 0 : (t - T_WIND) * smooth((t - T_WIND) / 1.6);

    // ---- camera: an orbit pose around an eased target
    const tg = camTarget(t), dist = camDist(t), el = camEl(t), az = camAz(t);
    const cam = S.camera;
    cam.position.set(tg[0] + dist * Math.sin(az) * Math.cos(el), tg[1] + dist * Math.sin(el), tg[2] + dist * Math.cos(az) * Math.cos(el));
    cam.lookAt(tg[0], tg[1], tg[2]);
    cam.updateMatrixWorld(true);
    S.GU.uFocus.value = dist;

    // ---- haze ray setup, bloom level, film-grain frame; then the passes
    S.HU.uCam.value.copy(cam.position);
    S.HU.uInvVP.value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).invert();
    S.finalMat.uniforms.uBloom.value = bloomK(t);
    S.finalMat.uniforms.uFrame.value = Math.round(t * 30) % 64;
    S.draw();
  },
});
