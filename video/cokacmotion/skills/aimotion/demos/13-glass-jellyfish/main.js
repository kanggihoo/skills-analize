/*
 * 13 · 유리 해파리 — three.js physically based glass + bloom post-processing.
 * The bell is a closed glass shell (MeshPhysicalMaterial: transmission, thickness, ior, iridescence) whose
 * vertices are rebuilt every frame from a closed-form pulse c(t); tentacles, oral arms, gonads, canals and the
 * nerve ring are camera-facing additive ribbons whose centrelines are closed-form waves with a time lag down
 * their length (follow-the-leader). Everything that glows is drawn in the opaque list with additive blending,
 * so it also lands in the transmission buffer and is seen *refracted* through the glass.
 * EffectComposer: RenderPass → UnrealBloomPass → OutputPass (ACES tone mapping + sRGB).
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { defineDemo, rand, track, ease, clamp, lerp, ramp } from '../_lib/stage.js';

const D = 10;

// ---------- the story, as pure functions of t ----------
const PERIOD = 1.6, T0 = 0.5, CONTRACT = 0.36;
/** bell contraction 0 (relaxed) … 1 (contracted): fast squeeze, slower elastic release */
function contraction(t) {
  const x = (t - T0) / PERIOD;
  if (x < 0) return 0;
  const ph = x - Math.floor(x);
  return ph < CONTRACT ? ease.inOutCubic(ph / CONTRACT) : 1 - ease.inOutCubic((ph - CONTRACT) / (1 - CONTRACT));
}
/** body height: a slow drift plus one thrust per pulse (closed form, continuous) */
function bodyY(t) {
  let y = -1.25 + 0.11 * t;
  const x = (t - T0) / PERIOD;
  if (x > 0) { const n = Math.floor(x); y += 0.32 * (n + ease.inOutCubic(Math.pow(clamp((x - n) / 0.9), 0.6))); }
  return y;
}
const bodyX = (t) => 0.10 * Math.sin(0.31 * t + 0.5);
const bodyZ = (t) => 0.08 * Math.sin(0.23 * t + 2.0);
const tiltX = (t) => 0.09 * Math.sin(0.55 * t + 0.3);
const tiltZ = (t) => 0.07 * Math.sin(0.42 * t + 1.9);

// light level: emerges from the dark, and dims again at the end so the loop (D → 0) passes through black
const revealIn = track([[0, 0.06], [2.5, 1.0, ease.inOutCubic]]);
const revealOut = track([[D - 1.7, 1.0], [D, 0.06, ease.inOutCubic]]);
const reveal = (t) => Math.min(revealIn(t), revealOut(t));
const edge = (t) => ramp(t, 0, 0.7) * (1 - ramp(t, D - 0.8, D));   // 0 exactly at both ends
const glow = track([[4.7, 0], [5.3, 0.22], [5.95, 1.0, ease.outCubic], [6.7, 0.82], [D, 0.34]]);
const front = track([[5.15, -0.35], [6.05, 1.3, ease.inOutCubic]]);
const gonad = track([[0, 0.35], [3.8, 0.45], [5.3, 1.0], [6.0, 1.6, ease.outCubic], [D, 0.75]]);
const ringFlare = track([[5.7, 0], [6.05, 1, ease.outExpo], [7.4, 0.35], [D, 0.22]]);
const bloomK = track([[0, 0.5], [5.1, 0.55], [6.0, 0.9, ease.outCubic], [7.6, 0.7], [D, 0.62]]);
const coreK = track([[4.9, 0], [6.0, 1, ease.outCubic], [7.0, 0.7], [D, 0.3]]);
const camDist = track([[0, 9.6], [D, 8.1, (p) => ease.inOutCubic(p)]]);
const camAz = track([[0, -0.32], [D, 0.26, (p) => p]]);

const GLOW = new THREE.Color(0.18, 0.95, 0.85);  // bioluminescent aqua
const GONAD = new THREE.Color(0.85, 0.45, 1.0);  // the one warm accent: violet-pink

// ---------- bell profile ----------
const NS = 44, NP = 96;
const lobe = new Float32Array(NP), cosP = new Float32Array(NP), sinP = new Float32Array(NP);
for (let j = 0; j < NP; j++) {
  const ph = (j / NP) * Math.PI * 2;
  cosP[j] = Math.cos(ph); sinP[j] = Math.sin(ph);
  lobe[j] = Math.pow(Math.abs(Math.cos(4 * ph)), 0.6) - 0.7;   // 8 scalloped lobes, notches between
}
const bellShape = (c) => ({ R: lerp(0.98, 0.83, c), H: lerp(0.66, 0.84, c), th: lerp(1.52, 1.86, c), fl: lerp(0.08, -0.03, c) });
const thick = (s) => 0.17 * (1 - Math.pow(s, 1.6)) + 0.017;
/** outer profile point (rho, y) at s for a contraction value: a dome whose margin flares when relaxed, curls in when contracted */
function outerAt(s, c, out) {
  const { R, H, th, fl } = bellShape(c), a = s * th, s5 = Math.pow(s, 5);
  out[0] = R * Math.sin(a) * (1 + 0.05 * Math.sin(Math.PI * s) * (1 - c)) + fl * s5;
  out[1] = H * (Math.cos(a) - 1) - 0.05 * s5 * (1 - c);
  return out;
}
const _a = [0, 0], _b = [0, 0];
/** outer + inner profile (rho, y) for s = i/NS → Float32Array(4*(NS+1)); inner = outer pushed in along the normal */
function profile(c, out) {
  for (let i = 0; i <= NS; i++) {
    const s = i / NS;
    outerAt(Math.max(0, s - 0.004), c, _a); outerAt(Math.min(1, s + 0.004), c, _b);
    const tr = _b[0] - _a[0], ty = _b[1] - _a[1], l = Math.hypot(tr, ty) || 1;
    const nr = -ty / l, ny = tr / l, d = thick(s);
    outerAt(s, c, _a);
    out[i * 4] = _a[0]; out[i * 4 + 1] = _a[1]; out[i * 4 + 2] = Math.max(0, _a[0] - nr * d); out[i * 4 + 3] = _a[1] - ny * d;
  }
  return out;
}
/** rim point (outer, s = 1) for a contraction value — used by the tentacles at lagged times */
const rimAt = (c) => outerAt(1, c, [0, 0]);
const lobeAt = (ph) => Math.pow(Math.abs(Math.cos(4 * ph)), 0.6) - 0.7;

// local → world for the body at time tp (Euler XYZ: z first, then x — same as the mesh)
function xform(x, y, z, tp, out, o = 0) {
  const rz = tiltZ(tp), rx = tiltX(tp);
  const cz = Math.cos(rz), sz = Math.sin(rz), cx = Math.cos(rx), sx = Math.sin(rx);
  const x1 = x * cz - y * sz, y1 = x * sz + y * cz;
  out[o] = x1 + bodyX(tp);
  out[o + 1] = y1 * cx - z * sx + bodyY(tp);
  out[o + 2] = y1 * sx + z * cx + bodyZ(tp);
}

// ---------- shaders ----------
// uv comes from the triangle, not gl_FragCoord: the same mesh is also drawn into the half-size transmission buffer
const BG_VERT = `varying vec2 vUv; void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 1.0, 1.0); }`;
const BG_FRAG = `
uniform vec2 uRes; uniform float uTime, uCamY, uReveal, uGlow; uniform vec2 uJelly; uniform vec3 uGlowCol;
varying vec2 vUv;
float h1(float x) { return fract(sin(x * 127.1) * 43758.5453); }
float n1(float x) { float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
float h2(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main() {
  vec2 uv = vUv, px = vUv * uRes;
  vec2 p = (px - 0.5 * uRes) / uRes.y;
  float y = uv.y + uCamY * 0.012;
  vec3 col = mix(vec3(0.0012, 0.0045, 0.014), vec3(0.004, 0.028, 0.062), smoothstep(-0.15, 0.8, y));
  col = mix(col, vec3(0.022, 0.13, 0.20), pow(smoothstep(0.5, 1.12, y), 1.6));
  // Snell's window far above and the god rays fanning down from it
  vec2 sun = vec2(0.12, 0.80);
  vec2 dv = p - sun; float dist = length(dv);
  float ang = atan(dv.x, -dv.y);
  float r = n1(ang * 16.0 + uTime * 0.10) * 0.55 + n1(ang * 34.0 - uTime * 0.17 + 3.0) * 0.33 + n1(ang * 69.0 + uTime * 0.26 + 7.0) * 0.18;
  r = pow(clamp((r - 0.38) * 1.7, 0.0, 1.0), 2.0);
  float fall = exp(-dist * 2.1) * smoothstep(0.05, 0.6, dist);
  col += vec3(0.18, 0.50, 0.58) * r * fall * 1.25;
  col += vec3(0.30, 0.70, 0.80) * exp(-dist * 4.2) * 0.55;
  // the jelly's own light, scattered by the water around it
  float jd = length((px - uJelly) / uRes.y);
  col += uGlowCol * uGlow * (0.045 * exp(-jd * 6.0) + 0.02 * exp(-jd * 2.2));
  col *= uReveal;
  col *= 1.0 - 0.55 * pow(clamp(length((uv - 0.5) * vec2(1.0, 0.78)) * 1.3, 0.0, 1.0), 2.4);
  col += (h2(floor(px) + uTime * 37.0) - 0.5) * 0.0025;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}`;

const RIB_VERT = `
attribute float aV; attribute vec4 aCol;
uniform float uFog;
varying float vV; varying vec4 vCol;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float d = length(mv.xyz);
  vCol = vec4(aCol.rgb * exp(-uFog * uFog * d * d), aCol.a);
  vV = aV;
  gl_Position = projectionMatrix * mv;
}`;
const RIB_FRAG = `
varying float vV; varying vec4 vCol;
void main() {
  float v = abs(vV);
  float core = exp(-v * v * 5.0);
  float rim = exp(-(1.0 - v) * (1.0 - v) * 40.0) * vCol.a;
  gl_FragColor = vec4(vCol.rgb * (core + rim) * smoothstep(1.0, 0.85, v), 1.0);
}`;

const SNOW_VERT = `
attribute vec4 aSeed;
uniform float uTime, uCamY, uGlow, uReveal; uniform vec3 uJelly;
varying float vA; varying float vHard; varying vec3 vC;
void main() {
  float H = 18.0;
  vec3 p = vec3((aSeed.x - 0.5) * 15.0, 0.0, (aSeed.z - 0.5) * 16.0 - 3.0);
  float y = aSeed.y * H - uTime * (0.03 + 0.05 * aSeed.w);
  p.y = uCamY + mod(y - uCamY + H * 0.5, H) - H * 0.5;
  p.x += 0.12 * sin(uTime * 0.37 + aSeed.w * 31.0);
  p.z += 0.12 * cos(uTime * 0.29 + aSeed.w * 17.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float d = -mv.z;
  float pxPerUnit = projectionMatrix[1][1] * 960.0 / max(d, 0.1);
  float sz = (0.010 + 0.014 * fract(aSeed.w * 7.31)) * pxPerUnit;
  float coc = abs(d - 8.6) * 2.4;                       // depth of field: out-of-focus flecks grow and dim
  float ps = clamp(sz + coc, 1.4, 44.0);
  gl_PointSize = ps;
  vHard = clamp(1.0 - coc / 6.0, 0.0, 1.0);
  float e = (sz * sz) / (ps * ps);
  float lit = uGlow * 3.0 * exp(-distance(p, uJelly) * 0.9);
  float tw = 0.75 + 0.25 * sin(uTime * (1.3 + 2.0 * fract(aSeed.w * 13.7)) + aSeed.w * 50.0);
  vA = (0.55 * uReveal * tw + lit) * clamp(e * 1.6, 0.04, 1.0) * exp(-d * 0.035) * smoothstep(0.6, 2.0, d);
  vC = mix(vec3(0.55, 0.85, 0.95), vec3(0.45, 1.0, 0.9), clamp(lit, 0.0, 1.0));
  gl_Position = projectionMatrix * mv;
}`;
const SNOW_FRAG = `
varying float vA; varying float vHard; varying vec3 vC;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float soft = exp(-r * r * 3.5);
  float disc = smoothstep(1.0, 0.7, r) * (0.6 + 0.4 * r * r);
  float a = mix(disc, soft, vHard);
  gl_FragColor = vec4(vC * vA * a, 1.0);
}`;

// ---------- ribbons: camera-facing additive strands rebuilt on the CPU each frame ----------
class Ribbons {
  constructor(counts, material) {
    this.counts = counts;
    this.offs = [];
    let n = 0;
    for (const c of counts) { this.offs.push(n); n += c; }
    this.n = n;
    this.P = new Float32Array(n * 3);      // centreline
    this.Wd = new Float32Array(n);         // half width
    this.C = new Float32Array(n * 4);      // colour (premultiplied intensity) + rim
    const g = new THREE.BufferGeometry();
    this.pos = new THREE.BufferAttribute(new Float32Array(n * 6), 3).setUsage(THREE.DynamicDrawUsage);
    this.col = new THREE.BufferAttribute(new Float32Array(n * 8), 4).setUsage(THREE.DynamicDrawUsage);
    const v = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) { v[i * 2] = -1; v[i * 2 + 1] = 1; }
    const idx = [];
    counts.forEach((c, k) => {
      const o = this.offs[k];
      for (let i = 0; i < c - 1; i++) {
        const a = (o + i) * 2, b = (o + i + 1) * 2;
        idx.push(a, a + 1, b, a + 1, b + 1, b);
      }
    });
    g.setAttribute('position', this.pos);
    g.setAttribute('aCol', this.col);
    g.setAttribute('aV', new THREE.BufferAttribute(v, 1));
    g.setIndex(n * 2 > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1));
    this.mesh = new THREE.Mesh(g, material);
    this.mesh.frustumCulled = false;
  }
  build(cam) {
    const { P, Wd, C } = this, pa = this.pos.array, ca = this.col.array;
    const cx = cam.x, cy = cam.y, cz = cam.z;
    this.counts.forEach((c, k) => {
      const o = this.offs[k];
      for (let i = 0; i < c; i++) {
        const q = o + i;
        const a = o + Math.max(0, i - 1), b = o + Math.min(c - 1, i + 1);
        const tx = P[b * 3] - P[a * 3], ty = P[b * 3 + 1] - P[a * 3 + 1], tz = P[b * 3 + 2] - P[a * 3 + 2];
        const vx = cx - P[q * 3], vy = cy - P[q * 3 + 1], vz = cz - P[q * 3 + 2];
        let nx = ty * vz - tz * vy, ny = tz * vx - tx * vz, nz = tx * vy - ty * vx;
        const l = Math.hypot(nx, ny, nz) || 1, w = Wd[q] / l;
        nx *= w; ny *= w; nz *= w;
        pa[q * 6] = P[q * 3] - nx; pa[q * 6 + 1] = P[q * 3 + 1] - ny; pa[q * 6 + 2] = P[q * 3 + 2] - nz;
        pa[q * 6 + 3] = P[q * 3] + nx; pa[q * 6 + 4] = P[q * 3 + 1] + ny; pa[q * 6 + 5] = P[q * 3 + 2] + nz;
        for (let j = 0; j < 4; j++) { ca[q * 8 + j] = C[q * 4 + j]; ca[q * 8 + 4 + j] = C[q * 4 + j]; }
      }
    });
    this.pos.needsUpdate = true;
    this.col.needsUpdate = true;
  }
}

defineDemo({
  id: '13-glass-jellyfish',
  title: '유리 해파리',
  tech: 'three.js 물리 기반 재질 · 투과 + 블룸 후처리',
  duration: D,
  background: '#01040b',
  async setup({ canvas, W, H }) {
    const { el } = canvas({ type: 'webgl2' });
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.transmissionResolutionScale = 0.5;   // the refraction buffer at half resolution (CPU WebGL)

    const scene = new THREE.Scene();
    const FOG = 0.045;
    scene.fog = new THREE.FogExp2(0x03101c, FOG);
    const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 80);

    // environment for the glass reflections: a gradient sky of water with a bright window above (PMREM, once)
    const envScene = new THREE.Scene();
    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 64, 32), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `varying vec3 vD; void main(){
        float y = vD.y; float a = atan(vD.z, vD.x);
        vec3 c = mix(vec3(0.004, 0.02, 0.04), vec3(0.05, 0.26, 0.36), smoothstep(-0.5, 0.5, y));
        c += vec3(0.5, 0.85, 0.95) * pow(max(y, 0.0), 3.0) * 1.1;
        c += vec3(0.25, 0.6, 0.7) * pow(0.5 + 0.5 * sin(a * 9.0), 6.0) * smoothstep(-0.1, 0.7, y) * 0.8;
        gl_FragColor = vec4(c, 1.0); }`,
    })));
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(envScene, 0.015).texture;
    pmrem.dispose();

    // background: full-screen gradient + god rays, opaque so it is also refracted by the glass
    const U = {
      uRes: { value: new THREE.Vector2(W, H) }, uTime: { value: 0 }, uCamY: { value: 0 }, uReveal: { value: 1 },
      uGlow: { value: 0 }, uJelly: { value: new THREE.Vector2() }, uGlowCol: { value: GLOW.clone() },
    };
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    const bg = new THREE.Mesh(bgGeo, new THREE.ShaderMaterial({ uniforms: U, vertexShader: BG_VERT, fragmentShader: BG_FRAG, depthWrite: false, depthTest: false }));
    bg.frustumCulled = false; bg.renderOrder = -100;
    scene.add(bg);

    // lights
    scene.add(new THREE.HemisphereLight(0x8fdcff, 0x020a14, 0.9));

    // ---- the bell: closed glass shell, vertices rebuilt from profile(c(t)) ----
    const nV = 2 + 2 * NS * NP;
    const bellGeo = new THREE.BufferGeometry();
    const bellPos = new THREE.BufferAttribute(new Float32Array(nV * 3), 3).setUsage(THREE.DynamicDrawUsage);
    const aS = new Float32Array(nV);
    const outerRing = (i) => 1 + (i - 1) * NP;               // i = 1..NS
    const innerBase = 1 + NS * NP;
    const innerRing = (i) => innerBase + (NS - i) * NP;       // i = NS..1
    const innerApex = innerBase + NS * NP;
    for (let i = 1; i <= NS; i++) for (let j = 0; j < NP; j++) { aS[outerRing(i) + j] = i / NS; aS[innerRing(i) + j] = i / NS; }
    const idx = [];
    for (let j = 0; j < NP; j++) idx.push(0, outerRing(1) + (j + 1) % NP, outerRing(1) + j);
    const rings = [];
    for (let i = 1; i <= NS; i++) rings.push(outerRing(i));
    for (let i = NS; i >= 1; i--) rings.push(innerRing(i));
    for (let r = 0; r < rings.length - 1; r++) {
      const u = rings[r], l = rings[r + 1];
      for (let j = 0; j < NP; j++) {
        const j1 = (j + 1) % NP;
        idx.push(u + j, u + j1, l + j, u + j1, l + j1, l + j);
      }
    }
    for (let j = 0; j < NP; j++) idx.push(innerRing(1) + j, innerRing(1) + (j + 1) % NP, innerApex);
    bellGeo.setAttribute('position', bellPos);
    bellGeo.setAttribute('aS', new THREE.BufferAttribute(aS, 1));
    bellGeo.setIndex(idx);

    const bellU = { uGlow: { value: 0 }, uFront: { value: -1 }, uRim: { value: 0 } };
    const bellMat = new THREE.MeshPhysicalMaterial({
      color: 0xf2fdff, metalness: 0, roughness: 0.12,
      transmission: 1, thickness: 0.5, ior: 1.36,
      attenuationColor: new THREE.Color(0.7, 0.95, 1.0), attenuationDistance: 3.0,
      iridescence: 0.6, iridescenceIOR: 1.4, iridescenceThicknessRange: [180, 460],
      specularIntensity: 1, envMap: envTex, envMapIntensity: 1.6,
      emissive: GLOW.clone(), emissiveIntensity: 1,
    });
    bellMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, bellU);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aS;\nvarying float vS;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvS = aS;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uGlow, uFront, uRim;\nvarying float vS;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        {
          // NaN guards: on real GPUs pow(x, y) is exp2(y·log2(x)), so a negative base gives NaN, and the bloom blur
          // then smears that NaN into flickering blocks. |dot| of two normalized vectors can exceed 1 by rounding.
          float fr = clamp(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0);
          float lit = smoothstep(uFront + 0.06, uFront - 0.28, vS);
          float de = (vS - uFront) * 6.0;
          float edge = exp(-de * de);
          // light scattered inside the mesoglea: strongest where the view grazes the shell (longest path)
          totalEmissiveRadiance *= uGlow * (lit * (0.05 + 0.75 * fr * fr * fr) + edge * 0.35) + uRim * pow(fr, 3.5);
        }`);
    };
    const bell = new THREE.Mesh(bellGeo, bellMat);
    bell.frustumCulled = false;
    scene.add(bell);

    // ---- the light inside: a soft additive billboard in the bell cavity (seen through, and refracted by, the glass)
    const CU = { uK: { value: 0 }, uCol: { value: GLOW.clone() } };
    const core = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.ShaderMaterial({
      uniforms: CU, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: false,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uK; uniform vec3 uCol; varying vec2 vUv;
        void main(){ vec2 d = (vUv - 0.5) * vec2(1.0, 1.35); float r = length(d) * 2.0;
          gl_FragColor = vec4(uCol * uK * (0.32 * exp(-r * r * 10.0) + 0.06 * exp(-r * 3.5)), 1.0); }`,
    }));
    core.frustumCulled = false;
    scene.add(core);

    // ---- strands ----
    const R = rand(1313);
    const LONG = 36, FRINGE = 64, ARMS = 4, GON = 4, CANALS = 16;
    const nLong = 90, nFr = 14, nArm = 80, nGon = 44, nCan = 22, nRing = NP + 1;
    const longT = Array.from({ length: LONG }, (_, k) => ({ ph: (k + 0.5 + (R() - 0.5) * 0.6) / LONG * Math.PI * 2, L: 2.7 + 1.6 * R(), s1: R() * 6.28, s2: R() * 6.28, s3: R() * 6.28, b: 0.6 + 0.4 * R() }));
    const fringeT = Array.from({ length: FRINGE }, (_, k) => ({ ph: (k + R() * 0.8) / FRINGE * Math.PI * 2, L: 0.35 + 0.45 * R(), s1: R() * 6.28 }));
    const counts = [
      ...longT.map(() => nLong), ...fringeT.map(() => nFr), ...Array(ARMS * 3).fill(nArm),
      ...Array(GON).fill(nGon), ...Array(CANALS).fill(nCan), nRing,
    ];
    const ribMat = new THREE.ShaderMaterial({
      uniforms: { uFog: { value: FOG } }, vertexShader: RIB_VERT, fragmentShader: RIB_FRAG,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: false,
    });
    const rib = new Ribbons(counts, ribMat);
    scene.add(rib.mesh);

    // ---- marine snow ----
    const NSNOW = 1600, seeds = new Float32Array(NSNOW * 4), Rs = rand(77);
    for (let i = 0; i < NSNOW * 4; i++) seeds[i] = Rs();
    const snowGeo = new THREE.BufferGeometry();
    snowGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NSNOW * 3), 3));
    snowGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    const SU = { uTime: { value: 0 }, uCamY: { value: 0 }, uGlow: { value: 0 }, uReveal: { value: 1 }, uJelly: { value: new THREE.Vector3() } };
    const snow = new THREE.Points(snowGeo, new THREE.ShaderMaterial({
      uniforms: SU, vertexShader: SNOW_VERT, fragmentShader: SNOW_FRAG,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: false,
    }));
    snow.frustumCulled = false;
    scene.add(snow);

    // ---- post ----
    const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(renderer, rt);
    composer.setPixelRatio(1);
    composer.setSize(W, H);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.6, 0.6, 0.55);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    const prof = new Float32Array(4 * (NS + 1)), wob = new Float32Array(NP);
    const tmp = new Float32Array(3);
    const camPos = new THREE.Vector3();
    const v3 = new THREE.Vector3();

    this.draw = (t) => {
      const c = contraction(t);
      const G = glow(t), F = front(t), GN = gonad(t), RF = ringFlare(t), rv = reveal(t);

      // camera: follows the average rise, slow orbit + dolly; the jelly rises into frame at the start
      const avgY = -1.3 + 0.31 * t;
      const target = new THREE.Vector3(0.02, avgY - 1.05 + 1.1 * (1 - ease.inOutCubic(clamp(t / 4.2))), 0);
      const az = camAz(t), dist = camDist(t);
      camPos.set(target.x + Math.sin(az) * dist, target.y - 1.0, target.z + Math.cos(az) * dist);
      camera.position.copy(camPos);
      camera.lookAt(target);
      camera.updateMatrixWorld();

      // bell vertices
      profile(c, prof);
      const pa = bellPos.array;
      const sq = 0.03 * Math.sin(t * 2.3);
      for (let j = 0; j < NP; j++) wob[j] = 0.016 * Math.sin(3 * j / NP * Math.PI * 2 - 1.7 * t) + 0.01 * Math.sin(5 * j / NP * Math.PI * 2 + 1.1 * t);
      const writeRing = (base, rho, y, s) => {
        const sm = ramp(s, 0.78, 1.0);
        for (let j = 0; j < NP; j++) {
          const k = 1 + (0.022 + sq * 0.15) * sm * lobe[j] + wob[j] * s, o = (base + j) * 3;
          pa[o] = rho * k * cosP[j]; pa[o + 1] = y + 0.028 * sm * lobe[j]; pa[o + 2] = rho * k * sinP[j];
        }
      };
      pa[0] = 0; pa[1] = prof[1]; pa[2] = 0;
      for (let i = 1; i <= NS; i++) {
        writeRing(outerRing(i), prof[i * 4], prof[i * 4 + 1], i / NS);
        writeRing(innerRing(i), prof[i * 4 + 2], prof[i * 4 + 3], i / NS);
      }
      pa[innerApex * 3] = 0; pa[innerApex * 3 + 1] = prof[3]; pa[innerApex * 3 + 2] = 0;
      bellPos.needsUpdate = true;
      bellGeo.computeVertexNormals();
      bell.position.set(bodyX(t), bodyY(t), bodyZ(t));
      bell.rotation.set(tiltX(t), 0, tiltZ(t));
      bellU.uGlow.value = G;
      bellU.uFront.value = F;
      bellU.uRim.value = 0.1 + 0.1 * rv + 0.25 * G;   // the glass edge glows faintly even in the dark opening
      core.position.set(bodyX(t), bodyY(t) - 0.3, bodyZ(t));
      core.quaternion.copy(camera.quaternion);
      CU.uK.value = coreK(t) * rv;

      // ---- strands ----
      const { P, Wd, C } = rib;
      let q = 0;
      const put = (x, y, z, w, r, g, b, e) => { P[q * 3] = x; P[q * 3 + 1] = y; P[q * 3 + 2] = z; Wd[q] = w; C[q * 4] = r; C[q * 4 + 1] = g; C[q * 4 + 2] = b; C[q * 4 + 3] = e; q++; };
      const pulseA = (a) => G * (1.6 * Math.exp(-Math.pow((a - (t - 5.85) / 1.5) / 0.05, 2)) + 1.0 * Math.exp(-Math.pow((a - (t - 6.5) / 1.9) / 0.06, 2)));

      // long tentacles: follow-the-leader — the point at arclength u sits where the rim was at t - λu
      for (const T of longT) {
        for (let i = 0; i < nLong; i++) {
          const a = i / (nLong - 1), u = a * T.L, tp = t - 0.34 * u;
          const cp = contraction(tp);
          const [rr, ry] = rimAt(cp);
          const rho = rr * (1 + 0.022 * lobeAt(T.ph)) * 0.97 * (1 - 0.18 * a) + 0.05 * Math.sin(2.2 * u - 1.4 * t + T.s1) * a;
          xform(rho * Math.cos(T.ph), ry + 0.02, rho * Math.sin(T.ph), tp, tmp);
          const amp = 0.04 + 0.2 * Math.pow(a, 1.3);
          const x = tmp[0] + amp * Math.sin(2.1 * u - 1.8 * t + T.s2) + 0.03 * a * Math.sin(5.3 * u - 3.1 * t + T.s3);
          const z = tmp[2] + amp * Math.cos(1.8 * u - 1.4 * t + T.s3);
          const y = tmp[1] - u * 0.9;
          const fade = (1 - Math.pow(a, 2.5)) * T.b * rv;
          const pl = pulseA(a);
          const br = 0.26 * fade + G * 0.12 * fade * (1 - a);
          const pw = pl * fade * 0.6;
          put(x, y, z, 0.0085 * (1 - 0.55 * a) + 0.004 * pl, br * 0.62 + pw * 0.2, br * 0.95 + pw * 0.95, br + pw * 0.9, 0.6);
        }
      }
      // fringe of short tentacles around the margin
      for (const T of fringeT) {
        for (let i = 0; i < nFr; i++) {
          const a = i / (nFr - 1), u = a * T.L, tp = t - 0.3 * u;
          const [rr, ry] = rimAt(contraction(tp));
          const rho = rr * (1 + 0.022 * lobeAt(T.ph)) + 0.06 * a * (1 - contraction(tp));
          xform(rho * Math.cos(T.ph), ry + 0.01, rho * Math.sin(T.ph), tp, tmp);
          const sw = 0.05 * a * Math.sin(3.0 * u - 2.2 * t + T.s1);
          const br = (0.2 + 0.3 * G + 0.4 * RF) * (1 - a * 0.7) * rv;
          put(tmp[0] + sw * Math.cos(T.ph + 1.6), tmp[1] - u * 0.85, tmp[2] + sw * Math.sin(T.ph + 1.6), 0.006 * (1 - 0.5 * a), br * 0.6, br * 0.95, br, 0.5);
        }
      }
      // oral arms: a translucent membrane per arm plus two wavy frilled edges along its sides (a curtain)
      const innerApexY = prof[3];
      for (let k = 0; k < ARMS; k++) {
        const ps = k * Math.PI / 2 + Math.PI / 4, L = 1.7 + 0.18 * Math.sin(k * 2.1);
        for (let e = 0; e < 3; e++) {
          for (let i = 0; i < nArm; i++) {
            const a = i / (nArm - 1), u = a * L, tp = t - 0.42 * u;
            xform(0.07 * Math.cos(ps), innerApexY - 0.03, 0.07 * Math.sin(ps), tp, tmp);
            const amp = 0.05 + 0.15 * a;
            const out = 0.07 + 0.2 * a * (0.7 + 0.3 * Math.sin(1.3 * t + k));
            let x = tmp[0] + out * Math.cos(ps) + amp * Math.sin(3.0 * u - 1.3 * t + ps * 2.0);
            let z = tmp[2] + out * Math.sin(ps) + amp * Math.cos(2.6 * u - 1.1 * t + ps);
            const taper = Math.pow(1 - a, 0.6);
            const fade = (1 - Math.pow(a, 3)) * rv;
            if (e === 0) {
              const br = (0.06 + 0.08 * G) * fade;
              put(x, tmp[1] - u * 0.92, z, 0.06 * taper + 0.01, br * 0.9, br * 0.75, br, 2.2);
            } else {
              const sg = e === 1 ? 1 : -1, be = 21 * u - 2.8 * t + e * 1.9 + k;
              const r0 = 0.05 * taper * (1 + 0.4 * Math.sin(be)), rr0 = 0.025 * taper * Math.cos(be * 1.3);
              x += -Math.sin(ps) * r0 * sg + Math.cos(ps) * rr0; z += Math.cos(ps) * r0 * sg + Math.sin(ps) * rr0;
              const br = (0.12 + 0.22 * G) * fade * (0.7 + 0.3 * Math.sin(be));
              put(x, tmp[1] - u * 0.92, z, 0.008 * taper + 0.003, br * 0.95, br * 0.72, br, 0.6);
            }
          }
        }
      }
      // inside the bell: 4 horseshoe gonads, 16 radial canals and the nerve ring along the margin
      const inner = (s, ph, o, out) => {
        const f = clamp(s) * NS, i0 = Math.min(NS - 1, Math.floor(f)), w = f - i0;
        const rho = lerp(prof[i0 * 4 + 2], prof[(i0 + 1) * 4 + 2], w), y = lerp(prof[i0 * 4 + 3], prof[(i0 + 1) * 4 + 3], w);
        const sm = ramp(s, 0.78, 1.0), kk = 1 + (0.022 + sq * 0.15) * sm * lobeAt(ph);
        xform(rho * kk * Math.cos(ph) * (1 - o), y - o * 0.2 + 0.028 * sm * lobeAt(ph), rho * kk * Math.sin(ph) * (1 - o), t, out);
      };
      for (let k = 0; k < GON; k++) {
        const ps = k * Math.PI / 2 + Math.PI / 4;
        for (let i = 0; i < nGon; i++) {
          const al = -0.82 * Math.PI + (i / (nGon - 1)) * 1.64 * Math.PI;
          inner(0.34 + 0.11 * Math.cos(al), ps + 0.36 * Math.sin(al), 0.05, tmp);
          const br = 0.3 * GN * rv * (0.8 + 0.2 * Math.sin(al * 3 + t * 2));
          put(tmp[0], tmp[1], tmp[2], 0.022, br * GONAD.r, br * GONAD.g, br * GONAD.b, 0.8);
        }
      }
      for (let k = 0; k < CANALS; k++) {
        const ps = (k + 0.5) / CANALS * Math.PI * 2;
        for (let i = 0; i < nCan; i++) {
          const s = 0.2 + 0.78 * i / (nCan - 1);
          inner(s, ps + 0.025 * Math.sin(s * 9 + k), 0.025, tmp);
          const lit = clamp((F - s) * 4 + 1) * G;
          const br = (0.08 + 0.8 * lit + 1.3 * G * Math.exp(-Math.pow((s - F) * 8, 2))) * rv;
          put(tmp[0], tmp[1], tmp[2], 0.006, br * GLOW.r, br * GLOW.g, br * GLOW.b, 0.3);
        }
      }
      for (let j = 0; j <= NP; j++) {
        const ph = (j % NP) / NP * Math.PI * 2;
        inner(0.985, ph, 0.02, tmp);
        const hot = Math.pow(Math.abs(Math.cos(4 * ph + Math.PI / 2)), 40);   // rhopalia in the notches
        const br = (0.3 + 0.3 * G + 1.3 * RF + 1.0 * hot * (0.3 + G + RF)) * rv;
        put(tmp[0], tmp[1], tmp[2], 0.012 + 0.012 * hot, br * GLOW.r, br * GLOW.g, br * GLOW.b, 0.5);
      }
      rib.build(camPos);

      // ---- uniforms ----
      // when the jelly lights up, the water around it seems to darken (its light takes over the frame)
      const dim = 1 - 0.38 * coreK(t);
      U.uTime.value = t; U.uCamY.value = target.y; U.uReveal.value = (0.12 + 0.88 * rv) * dim; U.uGlow.value = G;
      v3.set(bodyX(t), bodyY(t) - 0.4, bodyZ(t)).project(camera);
      U.uJelly.value.set((v3.x * 0.5 + 0.5) * W, (v3.y * 0.5 + 0.5) * H);
      SU.uTime.value = t; SU.uCamY.value = target.y; SU.uGlow.value = G; SU.uReveal.value = rv;
      SU.uJelly.value.set(bodyX(t), bodyY(t) - 0.4, bodyZ(t));
      bloom.strength = bloomK(t);
      renderer.toneMappingExposure = (0.25 + 0.85 * rv) * edge(t);
      composer.render(0);
    };
  },
  frame(t) { this.draw(t); },
});
