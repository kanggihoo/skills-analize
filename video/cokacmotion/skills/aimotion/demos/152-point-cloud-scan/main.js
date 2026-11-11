/*
 * 152 · 돌 정자를 읽는 빛 — a stone pavilion 3D-scanned out of darkness: points → wireframe → solid.
 *
 *   model     pavilion.js builds the whole pavilion as one non-indexed BufferGeometry with a barycentric/edge-mask
 *             attribute (aBary) and a sampling weight (aW). Nothing is loaded.
 *   cloud     MeshSurfaceSampler (seeded) draws 200,000 points with normals and colours from that surface. Each point
 *             stores its height and a noise value (aScan); the vertex shader turns them into an arrival time by
 *             inverting the scan plane's closed-form motion, so frame(t) only sets uniforms (no per-point CPU work).
 *   bands     the same surface material shows three bands keyed to the scan plane: nothing below the plane, only the
 *             laser contour on it, points just above it, a hidden-line wireframe band (barycentric edges with fwidth),
 *             and solid shaded stone above a noisy dissolve threshold with a narrow glowing edge. Both band fronts are
 *             the plane's own height delayed in time: yWire(t) = yScan(t − LAG_W), ySolid(t) = yScan(t − LAG_S).
 *   light     RoomEnvironment (PMREM) fill + one shadowed key light; the shadow pass uses a depth material with the
 *             same dissolve, so only the solid part casts shadows. UnrealBloom picks up the laser (the one accent).
 *   HUD       a 2D canvas: point count, scan %, and the share of the cloud in each band (example data, "예시").
 */
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAPass } from 'three/addons/postprocessing/FXAAPass.js';
import { defineDemo, rand, clamp, lerp, ramp, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { buildPavilion, TOP_Y } from './pavilion.js';

const D = 9;
const SW = 1080, SH = 1920;

// ---------------------------------------------------------------- palette: a few quiet tokens + ONE accent (the laser)
const C = {
  accent: '#3ff2d6',            // the laser — the only saturated colour on screen
  point: '#dce4ea', wire: '#b9c7d3', fill: '#0c1117',
  hud: '#e9eef1', hudDim: '#8e9aa4',
};
const lin = (hex) => new THREE.Color(hex);   // three converts sRGB hex to the linear working space

// ---------------------------------------------------------------- timeline (s)
const T_LASER = 0.55;                          // the laser sheet flickers on above the roof and spreads
const S0 = 1.5, S1 = 5.35, TA = 0.55;          // the sweep: trapezoidal speed profile, TA = ramp time
const Y_TOP = TOP_Y + 0.42, Y_BOT = -0.35;     // plane travel (starts above the finial, ends under the floor)
const LAG_W = 0.36, LAG_S = 0.95;              // wireframe / solid fronts = the plane, delayed by these times
const NOISE_AMP = 0.45;                        // dissolve noise (world units) on the solid front
const T_ORB0 = 4.7, T_ORB1 = 7.3;              // climax orbit
const T_MERGE0 = 5.75, T_MERGE1 = 6.9;         // the points sink into the surface
const T_GLINT0 = 7.35, T_GLINT1 = 8.3;         // the last sweep glint (upward)
const N_POINTS = 200000;

// ---------------------------------------------------------------- the scan plane: closed form and its inverse
const TSW = S1 - S0, HS = Y_TOP - Y_BOT;
const VEL = HS / (TSW - TA), ACC = VEL / TA, SA = 0.5 * ACC * TA * TA;
function sweepDist(tau) {                       // distance travelled tau seconds after S0
  if (tau <= 0) return 0;
  if (tau >= TSW) return HS;
  if (tau < TA) return 0.5 * ACC * tau * tau;
  if (tau < TSW - TA) return SA + VEL * (tau - TA);
  const r = TSW - tau;
  return HS - 0.5 * ACC * r * r;
}
function sweepInv(s) {                          // time after S0 at which the plane has travelled s
  if (s <= SA) return Math.sqrt((2 * s) / ACC);
  if (s <= HS - SA) return TA + (s - SA) / VEL;
  return TSW - Math.sqrt(Math.max(0, (2 * (HS - s)) / ACC));
}
const yScanAt = (t) => Y_TOP - sweepDist(t - S0);
const T_LAND = S0 + sweepInv(Y_TOP);            // the plane reaches the floor (y = 0)
const ARRIVE_JITTER = 0.09;                     // per-point arrival spread (s)
const arrival = (h, n) => S0 + sweepInv(clamp(Y_TOP - h, 0, HS)) + n * ARRIVE_JITTER;

// ---------------------------------------------------------------- GLSL shared by the surface, its shadow and the points
const NOISE_GLSL = /* glsl */`
float scanHash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float scanVNoise(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(scanHash(i), scanHash(i + vec3(1, 0, 0)), f.x), mix(scanHash(i + vec3(0, 1, 0)), scanHash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(scanHash(i + vec3(0, 0, 1)), scanHash(i + vec3(1, 0, 1)), f.x), mix(scanHash(i + vec3(0, 1, 1)), scanHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float scanNoise(vec3 p) { return 0.65 * scanVNoise(p * 2.1) + 0.35 * scanVNoise(p * 5.3 + 7.1); }
`;
const BG_GLSL = /* glsl */`
uniform vec2 uRes;
uniform float uBgK;
vec3 bgColor(vec2 fc) {
  vec2 uv = fc / uRes;
  vec3 c = mix(vec3(0.0025, 0.0032, 0.0046), vec3(0.011, 0.015, 0.022), smoothstep(0.08, 0.47, uv.y));
  c = mix(c, vec3(0.003, 0.0042, 0.0064), smoothstep(0.5, 1.0, uv.y));
  vec2 d = (uv - vec2(0.5, 0.56)) * vec2(1.0, 1.6);
  c += vec3(0.008, 0.011, 0.017) * exp(-dot(d, d) * 4.0);
  c += (fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.0005;
  return c * uBgK;
}
`;

defineDemo({
  id: '152-point-cloud-scan',
  title: '돌 정자를 읽는 빛',
  tech: '점구름 3D 스캔 · 표면 표본 + 스캔 평면 + 점→선→면 굳기',
  duration: D,
  background: '#020304',

  async setup(api) {
    const HL = api.headless;
    await Promise.all([
      fontReady('700 32px "Pretendard Variable"', '3D 스캔예시점선면대기중높이굳히는완료'),
      fontReady('600 76px "JetBrains Mono Variable"', '0123456789,.%m'),
    ]);

    // ---- renderer
    const el = api.layer('canvas', { z: 0 });
    el.width = SW; el.height = SH;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(SW, SH, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, SW / SH, 0.5, 200);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.32;
    pmrem.dispose();

    const ACC3 = lin(C.accent);
    const BGU = { uRes: { value: new THREE.Vector2(SW, SH) }, uBgK: { value: 1 } };

    // ---- backdrop: a full-screen triangle behind everything (the ground blends into the same function)
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    const bg = new THREE.Mesh(bgGeo, new THREE.ShaderMaterial({
      uniforms: BGU, depthTest: false, depthWrite: false,
      vertexShader: 'void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `${BG_GLSL}\nvoid main() { gl_FragColor = vec4(bgColor(gl_FragCoord.xy), 1.0); }`,
    }));
    bg.frustumCulled = false; bg.renderOrder = -1000;
    scene.add(bg);

    // ---- lights: a soft key (shadowed), a cool rim; the environment fills
    const key = new THREE.DirectionalLight(lin('#fff3e4'), 2.3);
    key.position.set(-9, 13, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -6.2, right: 6.2, top: 6.2, bottom: -6.2, near: 8, far: 34 });
    key.shadow.radius = 2.5;
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.025;
    const rim = new THREE.DirectionalLight(lin('#a9bfdc'), 0.9);
    rim.position.set(8, 6, -10);
    scene.add(key, key.target, rim);
    const keyDir = key.position.clone().normalize();

    // ================================================================ the pavilion surface (one mesh, three bands)
    const geo = buildPavilion();
    const U = {
      uYScan: { value: 99 }, uYWire: { value: 99 }, uYSolid: { value: 99 },
      uNoiseAmp: { value: NOISE_AMP }, uEdgeW: { value: 0.07 }, uEdgeI: { value: 2.4 }, uLaserI: { value: 0 },
      uGlintY: { value: -9 }, uGlintK: { value: 0 }, uWireK: { value: 1 },
      uAccent: { value: ACC3 }, uWireCol: { value: lin(C.wire).multiplyScalar(0.8) }, uFillCol: { value: lin(C.fill) },
    };
    const SCAN_PARS = `${NOISE_GLSL}
uniform float uYScan, uYWire, uYSolid, uNoiseAmp, uEdgeW, uEdgeI, uLaserI, uGlintY, uGlintK, uWireK;
uniform vec3 uAccent, uWireCol, uFillCol;
varying vec3 vBary;
varying vec3 vWP;`;
    // the band of a fragment: d* > 0 means "this front has passed it"; derivatives are taken before any discard
    const SCAN_CLIP = /* glsl */`
  vec3 sFw = max(fwidth(vBary), vec3(1e-5));
  float sLw = max(0.016, 1.3 * fwidth(vWP.y));
  float sN = scanNoise(vWP);
  float dPlane = vWP.y - uYScan;
  float laser = exp(-dPlane * dPlane / (sLw * sLw));
  float dWire = vWP.y + (sN - 0.5) * uNoiseAmp * 0.35 - uYWire;
  float dSolid = vWP.y + (sN - 0.5) * uNoiseAmp - uYSolid;
  if (dPlane < -2.5 * sLw) discard;                 // not reached by the plane yet: darkness
  if (dWire < 0.0 && laser * uLaserI < 0.02) discard; // only points live just above the plane
`;
    const STONE = /* glsl */`
  {
    float sv = 0.55 * sN + 0.45 * scanVNoise(vWP * vec3(9.0, 15.0, 9.0));   // reuses the dissolve noise
    diffuseColor.rgb *= (0.86 + 0.26 * sv) * mix(0.7, 1.0, smoothstep(0.0, 0.9, vWP.y));
  }
`;
    const SCAN_COMPOSE = /* glsl */`
  {
    vec3 e3 = smoothstep(sFw * 0.35, sFw * 1.35, vBary);
    float edge = 1.0 - min(min(e3.x, e3.y), e3.z);
    vec3 lit = outgoingLight;
    vec3 fill = uFillCol + lit * 0.09;
    vec3 wireC = mix(fill, uWireCol, edge * uWireK);
    float solid = step(0.0, dSolid);
    vec3 c = mix(wireC, lit, solid);
    if (dWire < 0.0) c = vec3(0.0);
    // the dissolve edge: a narrow glow on the freshly solid side, a faint pre-glow on the wire side
    // (exponents clamped: exp of a large distance overflows to Inf, and Inf · 0 is NaN, which bloom smears everywhere)
    float eg = solid * exp(-max(dSolid, 0.0) / uEdgeW) + (1.0 - solid) * step(0.0, dWire) * exp(min(dSolid, 0.0) / (uEdgeW * 0.7)) * 0.3;
    c += uAccent * eg * uEdgeI;
    c += uAccent * laser * uLaserI;
    float gy = vWP.y - uGlintY;
    c += uAccent * (exp(-gy * gy / 0.0022) + 0.1 * exp(-gy * gy / 0.2)) * uGlintK * solid;
    outgoingLight = c;
  }
`;
    const surfMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0 });
    surfMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute vec3 aBary;\nvarying vec3 vBary;\nvarying vec3 vWP;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvBary = aBary;\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>\n${SCAN_PARS}`)
        .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${SCAN_CLIP}`)
        .replace('#include <color_fragment>', `#include <color_fragment>\n${STONE}`)
        .replace('#include <opaque_fragment>', `${SCAN_COMPOSE}\n#include <opaque_fragment>`);
    };
    // the shadow pass: only what is already solid casts a shadow
    const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    depthMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>\n${NOISE_GLSL}\nuniform float uYSolid, uNoiseAmp;\nvarying vec3 vWP;`)
        .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
  if (vWP.y + (scanNoise(vWP) - 0.5) * uNoiseAmp - uYSolid < 0.0) discard;`);
    };
    const pav = new THREE.Mesh(geo, surfMat);
    pav.customDepthMaterial = depthMat;
    pav.castShadow = true; pav.receiveShadow = true;
    pav.frustumCulled = false;
    scene.add(pav);

    // ================================================================ the point cloud (sampled once, animated on the GPU)
    const sampler = new MeshSurfaceSampler(pav).setWeightAttribute('aW').setRandomGenerator(rand(152)).build();
    const R = rand(1521);
    const pPos = new Float32Array(N_POINTS * 3), pNor = new Float32Array(N_POINTS * 3), pCol = new Float32Array(N_POINTS * 3);
    const pScan = new Float32Array(N_POINTS * 2), pSeed = new Float32Array(N_POINTS * 4), pJit = new Float32Array(N_POINTS * 3);
    const arr = new Float32Array(N_POINTS);
    const _p = new THREE.Vector3(), _n = new THREE.Vector3(), _c = new THREE.Color();
    for (let i = 0; i < N_POINTS; i++) {
      sampler.sample(_p, _n, _c);
      pPos.set([_p.x, _p.y, _p.z], i * 3);
      pNor.set([_n.x, _n.y, _n.z], i * 3);
      pCol.set([_c.r, _c.g, _c.b], i * 3);
      const n = R();
      pScan[i * 2] = _p.y; pScan[i * 2 + 1] = n;                    // height + arrival noise → arrival time on the GPU
      pSeed.set([R(), R(), R(), R()], i * 4);
      const a = R() * Math.PI * 2, z = R() * 2 - 1, s = Math.sqrt(1 - z * z);
      pJit.set([s * Math.cos(a), z, s * Math.sin(a)], i * 3);
      arr[i] = arrival(_p.y, n);
    }
    arr.sort();                                                       // the HUD counts arrived points by binary search
    const cloudGeo = new THREE.BufferGeometry();
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    cloudGeo.setAttribute('normal', new THREE.BufferAttribute(pNor, 3));
    cloudGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    cloudGeo.setAttribute('aScan', new THREE.BufferAttribute(pScan, 2));
    cloudGeo.setAttribute('aSeed', new THREE.BufferAttribute(pSeed, 4));
    cloudGeo.setAttribute('aJit', new THREE.BufferAttribute(pJit, 3));
    const PU = {
      uT: { value: 0 }, uS0: { value: S0 }, uTsw: { value: TSW }, uTa: { value: TA }, uHs: { value: HS }, uYTop: { value: Y_TOP },
      uJ: { value: ARRIVE_JITTER }, uMerge: { value: 0 }, uPx: { value: 1 }, uSize: { value: 0.026 },
      uL: { value: keyDir }, uCam: { value: new THREE.Vector3() }, uAccent: { value: ACC3 }, uPale: { value: lin(C.point) },
      uYWire: U.uYWire, uYSolid: U.uYSolid, uNoiseAmp: U.uNoiseAmp,
    };
    const cloud = new THREE.Points(cloudGeo, new THREE.ShaderMaterial({
      uniforms: PU,
      vertexShader: /* glsl */`
${NOISE_GLSL}
attribute vec2 aScan;
attribute vec4 aSeed;
attribute vec3 aJit;
attribute vec3 color;
uniform float uT, uS0, uTsw, uTa, uHs, uYTop, uJ, uMerge, uPx, uSize, uYWire, uYSolid, uNoiseAmp;
uniform vec3 uL, uCam, uAccent, uPale;
varying vec3 vCol;
float h11(float x) { return fract(sin(x * 91.345 + 3.17) * 47453.5453); }
// time after the sweep start at which the plane has travelled s (inverse of the trapezoidal profile)
float sweepInv(float s) {
  float V = uHs / (uTsw - uTa), A = V / uTa, sa = 0.5 * A * uTa * uTa;
  if (s <= sa) return sqrt(2.0 * s / A);
  if (s <= uHs - sa) return uTa + (s - sa) / V;
  return uTsw - sqrt(max(0.0, 2.0 * (uHs - s) / A));
}
void main() {
  float tArr = uS0 + sweepInv(clamp(uYTop - aScan.x, 0.0, uHs)) + aScan.y * uJ;
  float age = uT - tArr;
  if (age < 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; vCol = vec3(0.0); return; }
  vec3 n = normalize(normal);
  // registration: fresh points carry a range error along the normal + a lateral error that decays,
  // a shimmer re-drawn 30 times a second while they settle, and each 0.45 s pass is offset until it snaps in
  float k1 = exp(-age / 0.16);
  vec3 off = (aJit * 0.05 + n * (aSeed.z - 0.5) * 0.12) * k1;
  float fr = floor(uT * 30.0);
  vec3 sh = vec3(h11(aSeed.x * 311.0 + fr), h11(aSeed.y * 173.0 + fr * 1.31), h11(aSeed.w * 251.0 + fr * 0.77)) - 0.5;
  off += sh * 0.045 * exp(-age / 0.28);
  float pk = floor((tArr - uS0) / 0.45);
  float pEnd = uS0 + (pk + 1.0) * 0.45;
  vec3 g = (vec3(h11(pk * 1.7), h11(pk * 2.9 + 1.0), h11(pk * 4.1 + 2.0)) - 0.5) * vec3(0.07, 0.02, 0.07);
  off += g * (1.0 - smoothstep(pEnd, pEnd + 0.2, uT));
  vec3 p = position + n * 0.012 + off;
  // band state from the same fronts and noise as the surface
  float sN = scanNoise(position);
  float wS = smoothstep(0.0, 0.25, position.y + (sN - 0.5) * uNoiseAmp * 0.35 - uYWire);
  float sS = smoothstep(0.0, 0.35, position.y + (sN - 0.5) * uNoiseAmp - uYSolid);
  // shading: lambert from the key light, dimmer when the normal faces away from the lens
  float lam = max(dot(n, uL), 0.0);
  float facing = dot(n, normalize(uCam - position));
  vec3 base = uPale * (0.28 + 0.72 * lam) * (facing < 0.0 ? 0.32 : 1.0);
  float hot = exp(-age / 0.15);
  vec3 c = mix(base, uAccent * 1.15, hot * 0.8) + uAccent * 0.7 * exp(-age / 0.05);
  c = mix(c, c * 0.42, wS);
  c = mix(c, color * (0.3 + 0.75 * lam), sS);                               // ≈ the lit stone: it merges
  float size = uSize * (0.7 + 0.6 * aSeed.y) * (1.0 + 0.9 * exp(-age / 0.1));
  size *= mix(1.0, 0.55, wS) * mix(1.0, 0.38, sS) * (1.0 - uMerge);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float px = size * uPx / -mv.z;
  // GL clamps a point size below 1 to one pixel, so a 'vanished' point must leave the clip volume instead
  if (px < 0.6) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; vCol = vec3(0.0); return; }
  gl_PointSize = max(px, 1.0);
  gl_Position = projectionMatrix * mv;
  vCol = c;
}`,
      fragmentShader: /* glsl */`
varying vec3 vCol;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(q, q);
  if (r2 > 1.0) discard;
  gl_FragColor = vec4(vCol, 1.0);
}`,
    }));
    cloud.frustumCulled = false;
    scene.add(cloud);

    // ================================================================ the ground: revealed by the landing ring
    const GU = { uRingR: { value: 0 }, uRingK: { value: 0 }, uGroundK: { value: 0 }, uAccent: { value: ACC3 }, ...BGU };
    const groundMat = new THREE.MeshStandardMaterial({ color: lin('#20252c'), roughness: 0.95, metalness: 0 });
    groundMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, GU);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vGW;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvGW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>\n${BG_GLSL}\nuniform float uRingR, uRingK, uGroundK;\nuniform vec3 uAccent;\nvarying vec3 vGW;`)
        .replace('#include <opaque_fragment>', `{
    float r = length(vGW.xz);
    float bx = max(abs(vGW.x), abs(vGW.z));
    float ao = mix(0.45, 1.0, smoothstep(2.7, 4.3, bx));
    float reveal = smoothstep(uRingR + 0.1, uRingR - 1.4, r) * uGroundK;
    float fade = 1.0 - smoothstep(4.0, 11.5, r);
    vec3 c = mix(bgColor(gl_FragCoord.xy), outgoingLight * ao, reveal * fade);
    float ring = (exp(-pow2((r - uRingR) / 0.045)) + 0.22 * exp(-pow2((r - uRingR) / 0.5))) * uRingK * (1.0 - smoothstep(4.5, 10.5, r));
    outgoingLight = c + uAccent * ring;
  }
#include <opaque_fragment>`);
    };
    const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 96), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ================================================================ the laser sheet and the dust it catches
    const SU = { uSheetR: { value: 0 }, uSheetK: { value: 0 }, uAccent: { value: ACC3 } };
    const sheet = new THREE.Mesh(new THREE.CircleGeometry(1, 96), new THREE.ShaderMaterial({
      uniforms: SU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: 'varying vec2 vQ; varying vec3 vW; void main() { vQ = position.xy; vW = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: /* glsl */`
uniform float uSheetK; uniform vec3 uAccent; varying vec2 vQ; varying vec3 vW;
void main() {
  float r = length(vQ);
  // a thin glowing slab: the path through it grows as 1/|n·v|, so seen edge-on the plane is a bright line
  float mu = abs(normalize(cameraPosition - vW).y);
  float slab = 0.35 + 0.1 / max(mu, 0.003);
  float a = (1.0 - smoothstep(0.86, 1.0, r)) * (0.015 + 0.03 * r * r * r * r) * slab;
  float e = (r - 0.986) / 0.0055;
  a += 0.45 * exp(-e * e);                                        // the rim: the plane's edge, a thin ring of light
  gl_FragColor = vec4(uAccent * a * uSheetK, 1.0);
}`,
    }));
    sheet.rotation.x = -Math.PI / 2;
    sheet.frustumCulled = false;
    sheet.renderOrder = 5;
    scene.add(sheet);

    const ND = 420, RD = rand(4521);
    const dPos = new Float32Array(ND * 3), dSeed = new Float32Array(ND * 4);
    for (let i = 0; i < ND; i++) {
      const a = RD() * Math.PI * 2, r = 1.2 + Math.sqrt(RD()) * 7.5;
      dPos.set([Math.cos(a) * r, RD() * 7.6 - 0.2, Math.sin(a) * r], i * 3);
      dSeed.set([RD(), 0.4 + RD() * 0.6, 0.025 + RD() * RD() * 0.07, 0.3 + RD() * 0.7], i * 4);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
    dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dSeed, 4));
    const DU = { uT: { value: 0 }, uYScan: { value: 99 }, uLaserK: { value: 0 }, uPx: { value: 1 }, uGlow: { value: 0 }, uAccent: { value: ACC3 } };
    const dust = new THREE.Points(dustGeo, new THREE.ShaderMaterial({
      uniforms: DU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */`
attribute vec4 aSeed;
uniform float uT, uYScan, uLaserK, uPx, uGlow; uniform vec3 uAccent;
varying vec3 vC;
void main() {
  vec3 p = position;
  float ph = aSeed.x * 6.2832;
  p.x += sin(uT * 0.31 * aSeed.y + ph) * 0.22;
  p.y += uT * 0.05 * aSeed.y + sin(uT * 0.47 + ph * 1.7) * 0.08;
  p.z += cos(uT * 0.27 * aSeed.y + ph * 0.6) * 0.22;
  float d = p.y - uYScan;
  float hit = exp(-d * d / 0.0035) * uLaserK;
  vC = vec3(0.62, 0.68, 0.76) * 0.10 * aSeed.w * uGlow + uAccent * 2.2 * hit;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSeed.z * (1.0 + 0.6 * hit) * uPx / -mv.z;
  gl_Position = projectionMatrix * mv;
}`,
      fragmentShader: /* glsl */`
varying vec3 vC;
void main() { vec2 q = gl_PointCoord * 2.0 - 1.0; float r2 = dot(q, q); if (r2 > 1.0) discard; gl_FragColor = vec4(vC * exp(-r2 * 3.0), 1.0); }`,
    }));
    dust.frustumCulled = false;
    dust.renderOrder = 6;
    scene.add(dust);

    // ================================================================ post: bloom on the laser only
    const rt = new THREE.WebGLRenderTarget(SW, SH, { type: THREE.HalfFloatType });
    const composer = new EffectComposer(renderer, rt);
    composer.setPixelRatio(1);
    composer.setSize(SW, SH);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(SW, SH), 0.55, 0.35, 1.05);
    composer.addPass(bloom);
    bloom.setSize(SW / 2, SH / 2);       // the glow is soft anyway: blur chain at quarter resolution
    composer.addPass(new OutputPass());
    // edge smoothing after tone mapping (a 4× MSAA target costs a third more on a software GPU; wire lines and point
    // discs are already anti-aliased in their own shaders)
    const fxaa = new FXAAPass();
    fxaa.setSize(SW, SH);
    composer.addPass(fxaa);

    // ================================================================ HUD (2D canvas over the 3D)
    const hud = api.canvas({ type: '2d', z: 5, attrs: HL ? { willReadFrequently: true } : undefined });

    Object.assign(this, { renderer, scene, camera, composer, bloom, key, U, PU, GU, SU, DU, sheet, ground, arr, hud: hud.ctx, ACC3 });

    // warm-up: draw two moments where every object, program and blend state is in use, and wait for the GPU, so no
    // pipeline is first built in the middle of playback (the harness then draws the requested time over it)
    const gl = renderer.getContext(), px = new Uint8Array(4);
    for (const w of [4.0]) { this.frame(w); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); }
  },

  frame(t) {
    const S = this;
    const { U, PU, GU, SU, DU } = S;

    // ---- the scan plane and its two delayed fronts
    const yScan = yScanAt(t);
    const laserOn = t < T_LASER ? 0 : flicker(t) * (1 - ramp(t, T_LAND - 0.12, T_LAND + 0.05));
    U.uYScan.value = t < T_LAND + 0.1 ? yScan : -50;
    U.uYWire.value = yScanAt(t - LAG_W);
    U.uYSolid.value = yScanAt(t - LAG_S);
    U.uLaserI.value = 3.2 * laserOn;
    U.uEdgeI.value = 2.4 * (1 - ramp(t, S1 + LAG_S - 0.35, S1 + LAG_S + 0.25));
    // the last glint climbs the finished model
    const gp = clamp((t - T_GLINT0) / (T_GLINT1 - T_GLINT0));
    U.uGlintY.value = lerp(-0.3, TOP_Y + 0.3, ease.inOutCubic(gp));
    U.uGlintK.value = 1.3 * Math.sin(Math.PI * gp);

    // ---- points
    const merge = ease.inOutCubic(clamp((t - T_MERGE0) / (T_MERGE1 - T_MERGE0)));
    PU.uT.value = t;
    PU.uMerge.value = merge;

    // ---- sheet: switches on above the roof, spreads, rides the plane, vanishes into the floor
    const spread = ease.outExpo(clamp((t - T_LASER) / 0.9));
    S.sheet.position.y = yScan;
    S.sheet.scale.setScalar(0.3 + 4.9 * spread);
    S.sheet.visible = laserOn > 0.001;
    SU.uSheetK.value = laserOn;
    DU.uT.value = t; DU.uYScan.value = yScan; DU.uLaserK.value = laserOn;
    DU.uGlow.value = 0.35 + 0.65 * ramp(t, 4.5, 7.0);

    // ---- landing: a ring runs out over the floor and leaves it lit
    const lp = clamp((t - T_LAND) / 1.6);
    GU.uRingR.value = 2.6 + 13 * ease.outCubic(lp);
    GU.uRingK.value = t < T_LAND ? 0 : 2.2 * Math.exp(-((t - T_LAND) / 0.6)) * ramp(t, T_LAND, T_LAND + 0.06);
    GU.uGroundK.value = t < T_LAND ? 0 : 1;
    S.ground.visible = t >= T_LAND;      // unrevealed, the floor would only repaint the backdrop's own colour

    // ---- light: the key warms a touch in the afterglow
    S.key.intensity = 2.3 + 0.35 * ramp(t, 6.4, 8.4);
    S.renderer.toneMappingExposure = 1.0 + 0.06 * ramp(t, 6.4, 8.4);
    S.bloom.strength = 0.55 - 0.15 * ramp(t, 6.5, 8.0);

    // ---- camera: slow drift during the sweep, an eased orbit at the climax, a settle
    const orb = ease.inOutCubic(clamp((t - T_ORB0) / (T_ORB1 - T_ORB0)));
    const az = THREE.MathUtils.degToRad(33 - 1.6 * t - 56 * orb);
    const crane = ease.inOutCubic(clamp((t - 1.0) / 3.9));
    const el = THREE.MathUtils.degToRad(6.5 + 9.5 * crane + 6 * orb);
    const dist = 38.5 - 0.25 * t - 1.0 * orb;
    const ty = 3.05 + 0.15 * orb;
    const cam = S.camera;
    cam.position.set(Math.sin(az) * Math.cos(el) * dist, ty + Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
    cam.up.set(0, 1, 0);
    cam.lookAt(0, ty, 0);
    cam.setViewOffset(SW, SH, 0, -40, SW, SH);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    const px = SH / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2));
    PU.uPx.value = px; DU.uPx.value = px;
    PU.uCam.value.copy(cam.position);

    S.composer.render(0);
    drawHud(S.hud, t, S.arr, yScan, laserOn);
  },
});

// the laser switching on: two quick stutters, then steady
function flicker(t) {
  const x = t - T_LASER;
  if (x < 0) return 0;
  if (x < 0.05) return 0.8;
  if (x < 0.1) return 0.1;
  if (x < 0.14) return 1.0;
  if (x < 0.19) return 0.35;
  return 1;
}

// ---------------------------------------------------------------- HUD
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
function countUpTo(arr, t) {                       // number of points arrived by t
  let lo = 0, hi = arr.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] <= t) lo = m + 1; else hi = m; }
  return lo;
}
function drawHud(g, t, arr, yScan, laserOn) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)'; g.setLineDash([]); g.lineCap = 'butt'; g.lineJoin = 'miter';
  g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  g.clearRect(0, 0, SW, SH);
  const inA = ease.outCubic(clamp((t - 0.75) / 0.6)), inB = ease.outCubic(clamp((t - 0.95) / 0.6));
  if (inA <= 0) return;
  const N = arr.length;
  const got = countUpTo(arr, t), wire = countUpTo(arr, t - LAG_W), solid = countUpTo(arr, t - LAG_S);
  const pct = clamp((TOP_Y - yScan) / TOP_Y);

  // ---- left block: title + example tag, point count, scan progress
  g.save();
  g.globalAlpha = inA;
  g.translate(-26 * (1 - inA), 0);
  const x0 = 72;
  // the laser lamp (the HUD's only accent)
  const lamp = laserOn > 0 && t < 5.6 ? 0.55 + 0.45 * laserOn : 0.0;
  g.fillStyle = 'rgba(233,238,241,0.22)';
  g.beginPath(); g.arc(x0 + 8, 122, 7, 0, Math.PI * 2); g.fill();
  if (lamp > 0) {
    g.fillStyle = C.accent; g.globalAlpha = inA * lamp;
    g.beginPath(); g.arc(x0 + 8, 122, 7, 0, Math.PI * 2); g.fill();
    g.globalAlpha = inA * lamp * 0.25;
    g.beginPath(); g.arc(x0 + 8, 122, 15, 0, Math.PI * 2); g.fill();
    g.globalAlpha = inA;
  }
  g.font = '700 32px "Pretendard Variable"';
  g.fillStyle = C.hud;
  g.fillText('3D 스캔', x0 + 30, 133);
  const tw = g.measureText('3D 스캔').width;
  g.font = '600 19px "Pretendard Variable"';
  const tag = '예시', tagW = g.measureText(tag).width + 22, tx = x0 + 30 + tw + 14;
  g.strokeStyle = 'rgba(233,238,241,0.45)'; g.lineWidth = 1.5;
  rr(g, tx, 107, tagW, 30, 15); g.stroke();
  g.fillStyle = 'rgba(233,238,241,0.8)';
  g.fillText(tag, tx + 11, 129);

  g.font = '600 76px "JetBrains Mono Variable"';
  g.fillStyle = '#f3f6f8';
  const nw = monoNum(g, fmt(got), x0 - 4, 228);
  g.font = '600 30px "Pretendard Variable"';
  g.fillStyle = C.hudDim;
  g.fillText('점', x0 + nw + 8, 226);

  const bw = 380, by = 262;
  g.fillStyle = 'rgba(233,238,241,0.14)';
  g.fillRect(x0, by, bw, 3);
  g.fillStyle = C.hud;
  g.fillRect(x0, by, bw * pct, 3);
  if (lamp > 0 && pct > 0 && pct < 1) { g.fillStyle = C.accent; g.globalAlpha = inA * lamp; g.fillRect(x0 + bw * pct - 1, by - 6, 3, 15); g.globalAlpha = inA; }
  g.font = '500 24px "JetBrains Mono Variable"';
  g.fillStyle = C.hud;
  g.fillText(`${Math.round(pct * 100)}%`, x0 + bw + 16, by + 9);
  g.font = '500 22px "Pretendard Variable"';
  g.fillStyle = C.hudDim;
  const status = t < S0 ? '대기 중' : t < T_LAND ? `스캔 중 · 높이 ${Math.max(0, yScan).toFixed(2)} m` : solid < N ? '면 굳히는 중' : '스캔 완료';
  g.fillText(status, x0, by + 46);
  g.restore();

  // ---- right block: the share of the cloud in each band — 점 / 선 / 면
  g.save();
  g.globalAlpha = inB;
  g.translate(26 * (1 - inB), 0);
  const rows = [['점', got / N, 0], ['선', wire / N, 1], ['면', solid / N, 2]];
  const rx = 820;
  rows.forEach(([label, v, k], i) => {
    const y = 122 + i * 50;
    const on = v > 0.001;
    g.globalAlpha = inB * (on ? 1 : 0.4);
    icon(g, k, rx + 12, y);
    g.font = '600 26px "Pretendard Variable"';
    g.fillStyle = C.hud;
    g.fillText(label, rx + 40, y + 9);
    g.font = '500 24px "JetBrains Mono Variable"';
    g.textAlign = 'right';
    g.fillStyle = on ? C.hud : C.hudDim;
    g.fillText(`${Math.round(v * 100)}%`, 1008, y + 9);
    g.textAlign = 'left';
  });
  g.restore();
}
// monospaced digits (they must not jitter while counting) with a narrow comma: returns the drawn width
function monoNum(g, str, x, y) {
  const dw = g.measureText('0').width, cw = g.measureText(',').width;
  let px = x;
  for (const ch of str) {
    if (ch === ',') { g.fillText(ch, px - cw * 0.3, y); px += dw * 0.42; } else { g.fillText(ch, px, y); px += dw; }
  }
  return px - x;
}
function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
  g.lineTo(x + w, y + h - r); g.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  g.lineTo(x + r, y + h); g.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  g.lineTo(x, y + r); g.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
}
// band icons drawn in code: a few dots, a wire triangle, a filled triangle
function icon(g, k, x, y) {
  g.fillStyle = C.hud; g.strokeStyle = C.hud; g.lineWidth = 2;
  if (k === 0) {
    for (const [dx, dy] of [[-8, 6], [0, -8], [8, 6], [-2, 2], [5, -2]]) { g.beginPath(); g.arc(x + dx, y + dy, 2.6, 0, Math.PI * 2); g.fill(); }
  } else {
    g.beginPath(); g.moveTo(x, y - 11); g.lineTo(x + 11, y + 8); g.lineTo(x - 11, y + 8); g.closePath();
    if (k === 1) { g.stroke(); g.beginPath(); g.moveTo(x, y - 11); g.lineTo(x, y + 8); g.stroke(); } else g.fill();
  }
}
