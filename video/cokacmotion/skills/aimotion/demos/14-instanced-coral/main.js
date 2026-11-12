/*
 * 14 · 피어나는 산호초 — three.js instancing: thousands of coral polyps in a handful of draw calls.
 * Each polyp is one InstancedMesh instance placed on Fibonacci points over a coral head (or helically along
 * a branch), oriented along the surface normal. The polyp geometry stores only parameters (part, along,
 * around, tentacle index); the vertex shader builds the stalk, oral disc and curling tentacles from them and
 * from the instance's bloom time — so the travelling bloom wave is one uniform (uTime) for every instance.
 * Sand caustics, coral caustics and the fish school's tail beat are functions of t as well.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { defineDemo, rand, track, ease, clamp, lerp, ramp } from '../_lib/stage.js';

const D = 10;
const FOG_COL = new THREE.Color(0.006, 0.042, 0.064);
const FOG_D = 0.085;

// ---------- story ----------
// bloom wave: starts on top of the main head and accelerates outward (delay ∝ √distance) — a chain reaction
const WAVE_O = new THREE.Vector3(-0.1, 0.78, 0.35);
const waveDelay = (d) => 1.3 + 2.15 * Math.sqrt(d);
// a slow crane: from a low side view of the sleeping reef to looking down onto the open crowns
const camPos = track([[0, [-0.08, 1.0, 6.8]], [0.8, [-0.07, 1.0, 6.7]], [9.7, [0.32, 1.42, 3.65], ease.inOutCubic], [D, [0.33, 1.42, 3.6]]]);
const camTgt = track([[0, [0, 0.66, -1.5]], [9.7, [0.0, 0.62, -0.4], ease.inOutCubic], [D, [0.0, 0.62, -0.4]]]);
const reveal = track([[0, 0.25], [2.0, 1, ease.outCubic]]);
const edge = (t) => ramp(t, 0, 0.8) * (1 - ramp(t, D - 0.9, D));   // fade from / to black: the live loop D → 0 is seamless
const bloomK = track([[0, 0.35], [3.0, 0.45], [6.5, 0.7], [D, 0.55]]);

// ---------- shared GLSL ----------
const CAUSTIC = `
uniform float uTime, uCaus;
// tileable water caustic (iterated warp), one tile per unit of p
float caustic(vec2 p, float t) {
  vec2 q = mod(p * 6.2831853, 6.2831853) - 250.0;
  vec2 i = q; float c = 1.0;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = q + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(q.x / (sin(i.x + tt) / 0.005), q.y / (cos(i.y + tt) / 0.005)));
  }
  c /= 4.0; c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 7.0);
}
float causticW(vec3 w) {
  vec2 p = w.xz * 0.55 + vec2(0.0, w.y * 0.12);
  return caustic(p, uTime * 0.55 + 23.0) * 0.75 + caustic(p * 1.9 + 0.37, uTime * 0.7 + 11.0) * 0.3;
}
float causticW1(vec3 w) { return caustic(w.xz * 0.55 + vec2(0.0, w.y * 0.12), uTime * 0.55 + 23.0) * 0.9; }   // one layer: coral, pebbles`;

// the polyp: everything is computed from aP = (part, along, around, tentacle) and the instance's bloom time
const POLYP_PARS = `
attribute vec4 aP;
attribute vec4 aI;          // bloom delay, seed, tentacle count, size
varying vec3 vW; varying vec2 vPart; varying float vOpen; varying float vFlash;
float outBack(float x) { float c1 = 1.5; float c3 = c1 + 1.0; float y = x - 1.0; return 1.0 + c3 * y * y * y + c1 * y * y; }
void polyp(out vec3 pos, out vec3 nrm, out float open, out float flash) {
  float d = aI.x, seed = aI.y;
  float x = clamp((uTime - d) / 1.15, 0.0, 1.0);
  open = outBack(x);
  // after opening: a slow breathing that travels across the reef
  vec3 ip = instanceMatrix[3].xyz;
  float sway = sin(uTime * 1.25 - dot(ip.xz, vec2(1.6, 0.9)) + seed * 0.8);
  open *= 1.0 + 0.07 * x * sin(uTime * 2.1 - dot(ip, vec3(2.2, 1.0, 1.4)) + seed * 3.0);
  float fq = (uTime - d - 0.5) * 2.6; flash = exp(-fq * fq);   // not pow(x, 2.0): NaN for x < 0 on real GPUs
  // flowerpot polyp: a column that extends (the whole head swells) under a short crown of tentacles
  float h = mix(0.25, 1.3, open);
  // the column leans with the current and curves toward the light (world up, seen in the polyp's frame)
  vec3 upL = normalize(transpose(mat3(instanceMatrix)) * vec3(0.0, 1.0, 0.0));
  vec2 bend = (vec2(0.4, 0.22) * sway + upL.xz * 1.1) * open;
  float part = aP.x, v = aP.y, th = aP.z;
  vec3 top = vec3(bend.x * h * 0.5, h, bend.y * h * 0.5);
  if (part < 0.5) {                                     // column
    float r = mix(0.15, 0.11, v) * mix(1.5, 1.0, open);
    pos = vec3(r * cos(th) + bend.x * v * v * h * 0.5, v * h, r * sin(th) + bend.y * v * v * h * 0.5);
    nrm = vec3(cos(th), 0.0, sin(th));
  } else if (part < 1.5) {                              // oral disc, slightly domed
    float r = 0.21 * v * mix(0.75, 1.0, open);
    pos = top + vec3(r * cos(th), 0.05 * (1.0 - v * v) * open, r * sin(th));
    nrm = normalize(vec3(cos(th) * v * 0.4, 1.0, sin(th) * v * 0.4));
  } else {                                              // tentacle: a circular arc that unfurls and curls outward
    float nT = aI.z;
    float phi = aP.w * 6.2831853 / nT + seed * 2.0;
    vec3 rad = vec3(cos(phi), 0.0, sin(phi)), B = vec3(-sin(phi), 0.0, cos(phi)), up = vec3(0.0, 1.0, 0.0);
    float L = mix(0.14, 0.5, open) * (0.85 + 0.3 * fract(seed * 7.7 + aP.w * 0.37));
    float wig = 0.2 * sin(uTime * 1.9 + phi * 2.0 + seed * 9.0) * open;
    float a0 = mix(0.12, 1.0, open) + wig, k = mix(0.3, 1.1, open);
    float a = a0 + k * v;
    vec3 c = rad * 0.18 + L * (rad * (cos(a0) - cos(a)) + up * (sin(a) - sin(a0))) / k;
    vec3 T = sin(a) * rad + cos(a) * up;
    vec3 N = cross(B, T);
    float r = 0.055 * (1.0 - 0.6 * v) + 0.03 * exp(-((v - 0.86) / 0.1) * ((v - 0.86) / 0.1)) * open;
    r *= step(v, 0.999);
    nrm = cos(th) * B + sin(th) * N;
    pos = top + c + r * nrm;
  }
}`;

// ---------- helpers ----------
/** polyp parameter geometry: column (6 around × 3 rings), disc fan, nT tentacles (around × rings) */
function polypGeometry(nT, around, rings) {
  const aP = [], idx = [];
  const tube = (part, k, vs, nA) => {
    const s = aP.length / 4;
    for (const v of vs) for (let a = 0; a < nA; a++) aP.push(part, v, (a / nA) * Math.PI * 2, k);
    for (let r = 0; r < vs.length - 1; r++) for (let a = 0; a < nA; a++) {
      const a1 = (a + 1) % nA, i0 = s + r * nA;
      idx.push(i0 + a, i0 + nA + a, i0 + a1, i0 + a1, i0 + nA + a, i0 + nA + a1);
    }
  };
  tube(0, 0, [0, 0.5, 1], 6);
  const c = aP.length / 4;
  aP.push(1, 0, 0, 0);
  for (let a = 0; a < 6; a++) aP.push(1, 1, (a / 6) * Math.PI * 2, 0);
  for (let a = 0; a < 6; a++) idx.push(c, c + 1 + ((a + 1) % 6), c + 1 + a);
  for (let k = 0; k < nT; k++) tube(2, k, rings, around);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(aP.length / 4 * 3), 3));
  g.setAttribute('aP', new THREE.Float32BufferAttribute(aP, 4));
  g.setIndex(idx);
  return g;
}

/** a lumpy coral head: radius as a smooth function of direction */
function makeHead(cx, cz, R, squash, seed) {
  const r = rand(seed);
  const ph = Array.from({ length: 9 }, () => r() * 6.28);
  const radius = (x, y, z) => R * (1 + 0.07 * Math.sin(3.1 * x + ph[0]) * Math.sin(2.7 * y + ph[1]) * Math.sin(3.3 * z + ph[2])
    + 0.045 * Math.sin(6.3 * x + ph[3]) * Math.sin(5.9 * z + ph[4]) + 0.035 * Math.sin(7.1 * y + ph[5]) * Math.cos(6.7 * x + ph[6]));
  const cy = -0.12 * R;
  const at = (dx, dy, dz, out) => {
    const l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l;
    const rr = radius(dx, dy, dz);
    out.set(cx + dx * rr, cy + dy * rr * squash, cz + dz * rr);
    return out;
  };
  return { cx, cz, R, squash, cy, at };
}

/** Fibonacci points over the visible part of a head → position, normal */
function fibOnHead(head, n, yMin, out) {
  const jr = rand(head.R * 1000 + head.cx * 77 + 5), js = 0.9 / Math.sqrt(n);
  const jit = () => (jr() - 0.5) * js;
  const ga = Math.PI * (3 - Math.sqrt(5));
  const p = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), d = new THREE.Vector3();
  const total = Math.round(n / ((1 - yMin) / 2));
  for (let i = 0; i < total; i++) {
    const y = 1 - (2 * (i + 0.5)) / total;
    if (y < yMin) break;
    const rr = Math.sqrt(1 - y * y), th = i * ga;
    d.set(Math.cos(th) * rr + jit() , y + jit(), Math.sin(th) * rr + jit()).normalize();
    head.at(d.x, d.y, d.z, p);
    // normal from two nearby surface points
    const e = 0.01;
    const t1 = new THREE.Vector3(-d.z, 0, d.x); if (t1.lengthSq() < 1e-6) t1.set(1, 0, 0); t1.normalize();
    const t2 = new THREE.Vector3().crossVectors(d, t1).normalize();
    head.at(d.x + t1.x * e, d.y + t1.y * e, d.z + t1.z * e, a);
    head.at(d.x + t2.x * e, d.y + t2.y * e, d.z + t2.z * e, b);
    const nrm = new THREE.Vector3().crossVectors(a.sub(p), b.sub(p)).normalize();
    if (nrm.dot(d) < 0) nrm.negate();
    out.push({ p: p.clone(), n: nrm });
  }
  return out;
}

defineDemo({
  id: '14-instanced-coral',
  title: '피어나는 산호초',
  tech: 'three.js 인스턴싱 · 수천 개의 폴립',
  duration: D,
  background: '#020b10',
  async setup({ canvas, W, H }) {
    const { el } = canvas({ type: 'webgl2' });
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(FOG_COL, FOG_D);
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 60);
    const G = { uTime: { value: 0 }, uCaus: { value: 1 } };   // shared uniforms
    // environment light (PMREM of a water-coloured gradient sphere, once): silver fish need something to reflect
    const envScene = new THREE.Scene();
    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 48, 24), new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `varying vec3 vD; void main(){ float y = vD.y;
        vec3 c = mix(vec3(0.03, 0.05, 0.05), vec3(0.05, 0.3, 0.4), smoothstep(-0.3, 0.4, y)) + vec3(0.7, 0.95, 1.0) * pow(max(y, 0.0), 4.0) * 1.5;
        gl_FragColor = vec4(c, 1.0); }`,
    })));
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(envScene, 0.04).texture;   // only the fish use it: image-based light on every
                                                              // polyp and on the full-screen sand is costly in CPU WebGL
    pmrem.dispose();

    // ---- water: gradient + god rays (full-screen, behind everything) ----
    const BU = { uTime: G.uTime, uRev: { value: 1 }, uFog: { value: FOG_COL }, uHor: { value: 0.5 } };
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    const bg = new THREE.Mesh(bgGeo, new THREE.ShaderMaterial({
      uniforms: BU, depthWrite: false, depthTest: false,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 1.0, 1.0); }',
      fragmentShader: `uniform float uTime, uRev, uHor; uniform vec3 uFog; varying vec2 vUv;
        float h1(float x) { return fract(sin(x * 127.1) * 43758.5453); }
        float n1(float x) { float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
        void main() {
          float y = vUv.y;
          vec3 col = mix(uFog, vec3(0.018, 0.13, 0.17), pow(smoothstep(uHor, 1.08, y), 1.3));
          vec2 p = (vUv - vec2(0.5, 0.5)) * vec2(0.5625, 1.0);
          vec2 sun = vec2(-0.12, 0.85); vec2 dv = p - sun; float ang = atan(dv.x, -dv.y), dist = length(dv);
          float r = n1(ang * 15.0 + uTime * 0.11) * 0.55 + n1(ang * 33.0 - uTime * 0.16 + 3.0) * 0.32 + n1(ang * 64.0 + uTime * 0.23) * 0.18;
          r = pow(clamp((r - 0.4) * 1.8, 0.0, 1.0), 2.0);
          col += vec3(0.08, 0.27, 0.3) * r * exp(-dist * 1.6) * smoothstep(uHor, uHor + 0.4, y);
          col *= uRev;
          gl_FragColor = vec4(col, 1.0);
        }`,
    }));
    bg.frustumCulled = false; bg.renderOrder = -100;
    scene.add(bg);

    // ---- light ----
    scene.add(new THREE.HemisphereLight(0x7cc6e6, 0x2a2418, 0.62));
    const sun = new THREE.DirectionalLight(0xd2f0ea, 2.7);
    sun.position.set(-2, 10, 3);
    scene.add(sun);
    const back = new THREE.DirectionalLight(0x5fc8ff, 1.3);   // cool rim from behind, separates silhouettes from the water
    back.position.set(1.5, 3, -6);
    scene.add(back);

    // ---- sand: standard material + ripples, caustics and contact shadows injected ----
    const heads = [
      makeHead(0.0, 0.0, 1.0, 0.86, 11),     // main
      makeHead(-1.55, -2.0, 0.82, 0.86, 12),
      makeHead(1.7, -2.9, 1.05, 0.72, 13),
      makeHead(-0.6, -5.6, 1.1, 0.7, 14),
      makeHead(3.2, -7.2, 1.3, 0.6, 15),
      makeHead(-3.3, -6.8, 1.0, 0.75, 16),
    ];
    const blobs = heads.map((h) => new THREE.Vector4(h.cx, h.cz, h.R * 1.05, 0.55));
    blobs.push(new THREE.Vector4(1.05, -1.25, 0.65, 0.4));   // the branching coral
    const sandMat = new THREE.MeshStandardMaterial({ color: 0x5c574b, roughness: 0.95, envMapIntensity: 0.2 });
    sandMat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = G.uTime; sh.uniforms.uCaus = G.uCaus;
      sh.uniforms.uBlobs = { value: blobs };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vW;\nuniform vec4 uBlobs[7];\n${CAUSTIC}
        float ripple(vec2 p) { return sin(dot(p, vec2(4.6, 1.3)) + 1.4 * sin(p.x * 1.3 + p.y * 0.8)) + 0.35 * sin(dot(p, vec2(-2.1, 7.3)) + 2.0 * sin(p.y * 0.9)); }`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          float ao = 1.0;
          for (int i = 0; i < 7; i++) { float dd = length(vW.xz - uBlobs[i].xy) / uBlobs[i].z; ao *= 1.0 - uBlobs[i].w * exp(-max(dd - 0.75, 0.0) * 3.2) * smoothstep(0.4, 0.95, dd); }
          float grain = fract(sin(dot(floor(vW.xz * 140.0), vec2(12.9898, 78.233))) * 43758.5453);
          diffuseColor.rgb *= (0.86 + 0.1 * ripple(vW.xz * 2.0) + 0.08 * grain) * ao;`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
          { vec2 pp = vW.xz * 2.0; float e = 0.02; float r0 = ripple(pp);
            vec2 gr = vec2(ripple(pp + vec2(e, 0.0)) - r0, ripple(pp + vec2(0.0, e)) - r0) / e;
            normal = normalize(normal - (viewMatrix * vec4(gr.x, 0.0, gr.y, 0.0)).xyz * 0.035); }`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          totalEmissiveRadiance += diffuseColor.rgb * vec3(0.7, 0.95, 1.0) * causticW(vW) * 6.0 * uCaus;`);
    };
    const sand = new THREE.Mesh(new THREE.PlaneGeometry(70, 70, 1, 1), sandMat);
    sand.rotation.x = -Math.PI / 2;
    sand.renderOrder = -9;
    scene.add(sand);

    // ---- coral heads (the stone under the polyps) ----
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.85, envMapIntensity: 0.3 });
    headMat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = G.uTime; sh.uniforms.uCaus = G.uCaus;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vW;\n${CAUSTIC}`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          float groove = sin(vW.x * 23.0 + 3.0 * sin(vW.z * 7.0 + vW.y * 5.0)) * sin(vW.z * 21.0 + 3.0 * sin(vW.x * 6.0));
          diffuseColor.rgb *= (0.7 + 0.3 * smoothstep(-0.6, 0.8, groove)) * mix(0.45, 1.0, smoothstep(0.0, 0.35, vW.y));`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          totalEmissiveRadiance += diffuseColor.rgb * vec3(0.75, 0.95, 1.0) * causticW1(vW) * 1.3 * uCaus * smoothstep(-0.2, 0.9, normalize(vNormal).y + 0.4);`);
    };
    const headGeos = [];
    const paint = (g, r, gg, b) => { const n = g.attributes.position.count, c = new Float32Array(n * 3); for (let i = 0; i < n; i++) { c[i * 3] = r; c[i * 3 + 1] = gg; c[i * 3 + 2] = b; } g.setAttribute('color', new THREE.BufferAttribute(c, 3)); };
    for (const h of heads) {
      const g = new THREE.SphereGeometry(1, 96, 48, 0, Math.PI * 2, 0, Math.PI * 0.62);
      const pa = g.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < pa.count; i++) { h.at(pa.getX(i), pa.getY(i), pa.getZ(i), v); pa.setXYZ(i, v.x, v.y, v.z); }
      g.computeVertexNormals();
      const tc = [[0.2, 0.03, 0.06], [0.07, 0.03, 0.16], [0.02, 0.1, 0.08], [0.05, 0.05, 0.06], [0.07, 0.03, 0.12], [0.02, 0.08, 0.07]][headGeos.length];
      paint(g, tc[0], tc[1], tc[2]);
      headGeos.push(g);
    }

    // the branching coral: tapered cylinders grown recursively (seeded)
    const segs = [], rb = rand(404);
    const grow = (p, dir, len, rad, depth) => {
      const end = p.clone().addScaledVector(dir, len);
      segs.push({ a: p.clone(), b: end, r0: rad, r1: rad * 0.72, depth });
      if (depth === 0) return;
      const n = depth >= 2 ? 3 : 2;
      for (let k = 0; k < n; k++) {
        const ax = new THREE.Vector3(rb() - 0.5, 0, rb() - 0.5).normalize();
        const nd = dir.clone().applyAxisAngle(ax, 0.42 + 0.35 * rb()).add(new THREE.Vector3(0, 0.25, 0)).normalize();
        grow(end, nd, len * (0.72 + 0.12 * rb()), rad * 0.72, depth - 1);
      }
    };
    const BR = new THREE.Vector3(1.05, -0.05, -1.25);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + 0.4;
      grow(BR.clone().add(new THREE.Vector3(Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1)), new THREE.Vector3(Math.cos(a) * 0.45, 1, Math.sin(a) * 0.45).normalize(), 0.4, 0.055, 3);
    }
    for (const s of segs) {
      const len = s.a.distanceTo(s.b);
      const g = new THREE.CylinderGeometry(s.r1, s.r0, len, 10, 1, true);
      g.translate(0, len / 2, 0);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), s.b.clone().sub(s.a).normalize());
      g.applyQuaternion(q); g.translate(s.a.x, s.a.y, s.a.z);
      paint(g, 0.62, 0.15, 0.04);
      headGeos.push(g);
      const cap = new THREE.SphereGeometry(s.r1, 10, 6);
      cap.translate(s.b.x, s.b.y, s.b.z);
      paint(cap, 0.75, 0.3, 0.08);
      headGeos.push(cap);
    }
    const stripped = headGeos.map((g) => { for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'color') g.deleteAttribute(k); return g; });
    const reef = new THREE.Mesh(mergeGeometries(stripped), headMat);
    reef.renderOrder = -10;
    scene.add(reef);

    // ---- rubble on the sand (instanced too) ----
    const NR = 420, rr = rand(31);
    const pebMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, envMapIntensity: 0.2 });
    pebMat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = G.uTime; sh.uniforms.uCaus = G.uCaus;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vW;\n${CAUSTIC}`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          totalEmissiveRadiance += diffuseColor.rgb * vec3(0.7, 0.95, 1.0) * causticW1(vW) * 3.0 * uCaus;`);
    };
    const peb = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), pebMat, NR);
    {
      const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
      let n = 0;
      while (n < NR) {
        const a = rr() * 6.283, d = 0.9 + Math.pow(rr(), 0.7) * 7.5;
        p.set(Math.cos(a) * d * 0.8, 0, Math.sin(a) * d - 1.6);
        if (heads.some((h) => Math.hypot(p.x - h.cx, p.z - h.cz) < h.R * 0.98)) continue;
        const s0 = 0.01 + 0.04 * Math.pow(rr(), 3);
        sc.set(s0 * (0.8 + 0.5 * rr()), s0 * (0.35 + 0.3 * rr()), s0 * (0.8 + 0.5 * rr()));
        p.y = sc.y * 0.3;
        q.setFromEuler(e.set(rr() * 0.4, rr() * 6.28, rr() * 0.4));
        m.compose(p, q, sc);
        peb.setMatrixAt(n, m);
        const g = 0.07 + 0.08 * rr();
        peb.setColorAt(n, c.setRGB(g * 1.05, g, g * 0.85));
        n++;
      }
    }
    scene.add(peb);

    // ---- polyps ----
    const placements = [];   // { p, n, size, pal, far, branch }
    const PAL = [
      { body: [0.95, 0.17, 0.32], tip: [1.0, 0.8, 0.5] },    // main: rose, gold crowns
      { body: [0.5, 0.3, 1.0], tip: [1.0, 0.55, 0.9] },      // violet, pink crowns
      { body: [0.18, 0.85, 0.62], tip: [0.75, 1.0, 0.85] },  // mint, pale crowns
      { body: [1.0, 0.42, 0.12], tip: [1.0, 0.8, 0.45] },    // orange (branching coral)
    ];
    const rp = rand(2024);
    const counts = [2200, 650, 900, 420, 480, 300];    // farther heads: fewer, slightly larger polyps — same look
    heads.forEach((h, hi) => {
      const pts = fibOnHead(h, counts[hi], -0.12, []);
      const pal = PAL[hi === 0 ? 0 : hi === 1 || hi === 4 ? 1 : 2];
      for (const q of pts) placements.push({ ...q, size: (0.043 + 0.014 * rp()) * Math.sqrt(h.R) * (hi >= 3 ? 1.3 : hi > 0 ? 1.1 : 1), pal, far: hi >= 3 });
    });
    for (const s of segs) {
      const axis = s.b.clone().sub(s.a); const len = axis.length(); axis.normalize();
      const t1 = new THREE.Vector3(0, 1, 0).cross(axis); if (t1.lengthSq() < 1e-6) t1.set(1, 0, 0); t1.normalize();
      const t2 = axis.clone().cross(t1);
      const n = Math.round(len * (s.r0 + s.r1) * 0.5 * 2 * Math.PI / (0.05 * 0.05));
      for (let i = 0; i < n; i++) {
        const v = (i + 0.5) / n, th = i * 2.39996, r = lerp(s.r0, s.r1, v);
        const radial = t1.clone().multiplyScalar(Math.cos(th)).addScaledVector(t2, Math.sin(th));
        const p = s.a.clone().addScaledVector(axis, v * len).addScaledVector(radial, r);
        placements.push({ p, n: radial.addScaledVector(axis, 0.45).normalize(), size: 0.042 + 0.012 * rp(), pal: PAL[3], far: false, branch: true });
      }
    }

    const polypMat = () => {
      const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0 });
      m.onBeforeCompile = (sh) => {
        sh.uniforms.uTime = G.uTime; sh.uniforms.uCaus = G.uCaus;
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', `#include <common>\nuniform float uTime;\nattribute vec3 aTip;\nvarying vec3 vTip;\n${POLYP_PARS}`)
          .replace('#include <beginnormal_vertex>', 'vec3 pPos, objectNormal; float pOpen, pFlash; polyp(pPos, objectNormal, pOpen, pFlash);')
          .replace('#include <begin_vertex>', 'vec3 transformed = pPos;')
          .replace('#include <project_vertex>', `#include <project_vertex>
            vW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz; vPart = aP.xy; vOpen = pOpen; vFlash = pFlash; vTip = aTip;`);
        sh.fragmentShader = sh.fragmentShader
          .replace('#include <common>', `#include <common>\nvarying vec3 vW; varying vec2 vPart; varying float vOpen; varying float vFlash; varying vec3 vTip;`)
          .replace('#include <color_fragment>', `#include <color_fragment>
            float tipm = vPart.x > 1.5 ? smoothstep(0.55, 0.92, vPart.y) : vPart.x > 0.5 ? 0.55 * (1.0 - smoothstep(0.0, 0.45, vPart.y)) : 0.0;
            float shade = vPart.x < 0.5 ? mix(0.3, 0.85, vPart.y * vPart.y) : vPart.x < 1.5 ? 0.9 : mix(0.95, 1.15, vPart.y);
            diffuseColor.rgb *= shade * mix(0.45, 1.0, clamp(vOpen, 0.0, 1.0));
            diffuseColor.rgb = mix(diffuseColor.rgb, vTip, tipm * 0.7);`)
          .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
            float o = clamp(vOpen, 0.0, 1.0);
            totalEmissiveRadiance += vTip * (tipm * o * (0.3 + 1.1 * vFlash) + (vPart.x > 0.5 ? 0.12 * vFlash * o : 0.0));
            // soft tissue: light passing through at grazing angles
            float fr = 1.0 - abs(dot(normalize(normal), normalize(vViewPosition)));
            totalEmissiveRadiance += diffuseColor.rgb * (0.05 + 0.3 * fr * fr) * o;
`);
      };
      return m;
    };

    // keep only polyps the camera can ever see: facing some camera position on the path and inside the frame
    const probe = new THREE.PerspectiveCamera(40, W / H, 0.05, 60), pv = new THREE.Vector3(), dv = new THREE.Vector3();
    const views = [];
    for (let k = 0; k <= 20; k++) {
      const tt = (k / 20) * D;
      probe.position.fromArray(camPos(tt)); probe.lookAt(new THREE.Vector3().fromArray(camTgt(tt))); probe.updateMatrixWorld();
      views.push({ pos: probe.position.clone(), vp: new THREE.Matrix4().multiplyMatrices(probe.projectionMatrix, probe.matrixWorldInverse) });
    }
    const seen = (q) => views.some((v) => {
      dv.subVectors(v.pos, q.p).normalize();
      if (q.n.dot(dv) < -0.3) return false;
      pv.copy(q.p).applyMatrix4(v.vp);
      return Math.abs(pv.x) < 1.12 && Math.abs(pv.y) < 1.06;
    });
    const visible = placements.filter(seen);
    this.polypTotal = placements.length;
    const near = visible.filter((q) => !q.far && !q.branch), far = visible.filter((q) => q.far || q.branch);
    const makePolyps = (list, nT, around, rings) => {
      const geo = polypGeometry(nT, around, rings);
      const mesh = new THREE.InstancedMesh(geo, polypMat(), list.length);
      const aI = new Float32Array(list.length * 4), aTip = new Float32Array(list.length * 3);
      const m = new THREE.Matrix4(), q = new THREE.Quaternion(), tw = new THREE.Quaternion(), s = new THREE.Vector3(), col = new THREE.Color();
      const Y = new THREE.Vector3(0, 1, 0);
      list.forEach((L, i) => {
        q.setFromUnitVectors(Y, L.n);
        tw.setFromAxisAngle(Y, rp() * 6.283);
        q.multiply(tw);
        s.setScalar(L.size);
        m.compose(L.p, q, s);
        mesh.setMatrixAt(i, m);
        const b = L.pal.body, v = 0.8 + 0.32 * rp();
        col.setRGB(b[0] * v, b[1] * v, b[2] * v).offsetHSL((rp() - 0.5) * 0.07, (rp() - 0.5) * 0.15, 0);
        mesh.setColorAt(i, col);
        const dist = L.p.distanceTo(WAVE_O);
        aI[i * 4] = waveDelay(dist) + (rp() - 0.5) * 0.3;
        aI[i * 4 + 1] = rp(); aI[i * 4 + 2] = nT; aI[i * 4 + 3] = L.size;
        aTip[i * 3] = L.pal.tip[0]; aTip[i * 3 + 1] = L.pal.tip[1]; aTip[i * 3 + 2] = L.pal.tip[2];
      });
      geo.setAttribute('aI', new THREE.InstancedBufferAttribute(aI, 4));
      geo.setAttribute('aTip', new THREE.InstancedBufferAttribute(aTip, 3));
      mesh.instanceMatrix.needsUpdate = true;
      mesh.frustumCulled = false;
      scene.add(mesh);
      return mesh;
    };
    makePolyps(near, 8, 3, [0, 0.45, 0.85, 1]);   // ~120 vertices per polyp
    makePolyps(far, 6, 3, [0, 0.6, 1]);           // lighter LOD for far heads and the small branch polyps
    this.polypCount = visible.length;

    // ---- fish school: instanced, closed-form paths, tail beat in the vertex shader ----
    const NF = 110;
    const body = new THREE.SphereGeometry(0.5, 12, 8);
    body.scale(0.17, 0.34, 1.0);
    const tail = new THREE.BufferGeometry();
    tail.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.42, 0, 0.2, -0.72, 0, -0.2, -0.72, 0, 0.0, -0.42, 0, -0.2, -0.72, 0, 0.2, -0.72], 3));
    tail.computeVertexNormals();
    body.deleteAttribute('uv');
    const fishGeo = mergeGeometries([body.toNonIndexed(), tail]);
    const ph = new Float32Array(NF), rf = rand(99);
    const fishData = Array.from({ length: NF }, (_, i) => {
      ph[i] = rf();
      return { r: 0.12 + 0.55 * Math.sqrt(rf()), a0: rf() * 6.283, w: 0.55 + 0.25 * rf(), hy: (rf() - 0.5) * 0.45, lag: rf() * 0.5, sz: 0.05 + 0.02 * rf() };
    });
    fishGeo.setAttribute('aPh', new THREE.InstancedBufferAttribute(ph, 1));
    const fishMat = new THREE.MeshStandardMaterial({ color: 0xd8e8ee, metalness: 0.8, roughness: 0.28, envMap: envTex, envMapIntensity: 1.6, side: THREE.DoubleSide });
    fishMat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = G.uTime;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;\nattribute float aPh;\nvarying float vY;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          float wag = sin(uTime * 13.0 + aPh * 6.2831 - transformed.z * 5.0);
          transformed.x += wag * 0.13 * smoothstep(0.2, -0.75, transformed.z);
          vY = position.y;`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vY;')
        .replace('#include <color_fragment>', `#include <color_fragment>
          diffuseColor.rgb *= mix(vec3(1.0), vec3(0.25, 0.38, 0.5), smoothstep(-0.02, 0.12, vY));`);
    };
    const fish = new THREE.InstancedMesh(fishGeo, fishMat, NF);
    fish.frustumCulled = false;
    scene.add(fish);
    const school = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.3, 2.6, -2.6), new THREE.Vector3(-1.3, 2.15, -2.3), new THREE.Vector3(-0.2, 1.75, -1.7),
      new THREE.Vector3(1.0, 1.55, -1.2), new THREE.Vector3(1.3, 1.6, -2.2), new THREE.Vector3(0.3, 1.65, -2.8),
      new THREE.Vector3(-0.8, 1.55, -1.9), new THREE.Vector3(-1.1, 1.5, -0.6),
    ], false, 'centripetal');
    const fishAt = (i, t, out) => {
      const F = fishData[i];
      const u = clamp((t - F.lag * 0.4) / (D + 0.6));
      school.getPointAt(u, out);
      const a = F.a0 + F.w * t;
      out.x += F.r * Math.cos(a); out.z += F.r * Math.sin(a) * 0.8;
      out.y += F.hy + 0.06 * Math.sin(t * 1.3 + F.a0);
      return out;
    };
    const fp = new THREE.Vector3(), fq = new THREE.Vector3(), fm = new THREE.Matrix4(), fUp = new THREE.Vector3(0, 1, 0), fs = new THREE.Vector3();

    // ---- drifting particles ----
    const NSNOW = 1200, seeds = new Float32Array(NSNOW * 4), rs = rand(7);
    for (let i = 0; i < seeds.length; i++) seeds[i] = rs();
    const snowGeo = new THREE.BufferGeometry();
    snowGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NSNOW * 3), 3));
    snowGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    const snow = new THREE.Points(snowGeo, new THREE.ShaderMaterial({
      uniforms: { uTime: G.uTime, uRev: BU.uRev },
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
      vertexShader: `attribute vec4 aSeed; uniform float uTime, uRev; varying float vA; varying float vHard;
        void main() {
          vec3 p = vec3((aSeed.x - 0.5) * 9.0, mod(aSeed.y * 5.0 - uTime * (0.03 + 0.04 * aSeed.w), 5.0) - 0.2, 4.0 - aSeed.z * 12.0);
          p.x += 0.1 * sin(uTime * 0.5 + aSeed.w * 30.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0); float d = -mv.z;
          float sz = 0.012 * projectionMatrix[1][1] * 960.0 / max(d, 0.1);
          float coc = abs(d - 4.5) * 2.2; float ps = clamp(sz + coc, 1.5, 34.0);
          gl_PointSize = ps; vHard = clamp(1.0 - coc / 5.0, 0.0, 1.0);
          vA = 0.4 * uRev * clamp(sz * sz / (ps * ps) * 1.8, 0.05, 1.0) * exp(-d * 0.12) * smoothstep(0.3, 1.0, d);
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying float vA; varying float vHard;
        void main() { float r = length(gl_PointCoord - 0.5) * 2.0; float a = mix(smoothstep(1.0, 0.75, r) * 0.7, exp(-r * r * 4.0), vHard);
          gl_FragColor = vec4(vec3(0.6, 0.85, 0.9) * vA * a, 1.0); }`,
    }));
    snow.frustumCulled = false;
    scene.add(snow);

    // ---- post: bloom on the fluorescent tips ----
    const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 2 });   // 2× MSAA (4× doubled the polyp cost in CPU WebGL)
    const composer = new EffectComposer(renderer, rt);
    composer.setPixelRatio(1);
    composer.setSize(W, H);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.4, 0.5, 0.82);
    const bloomSize = bloom.setSize.bind(bloom);
    bloom.setSize = (w, h) => bloomSize(w / 2, h / 2);   // bloom mips from 270×480: it is a soft glow anyway
    composer.addPass(bloom);
    // final pass = vignette + the renderer's ACES tone mapping + sRGB (one full-screen pass instead of two)
    composer.addPass(new ShaderPass({
      uniforms: { tDiffuse: { value: null } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
        void main(){ vec4 c = texture2D(tDiffuse, vUv); float v = length((vUv - 0.5) * vec2(0.8, 1.0)) * 1.35;
          gl_FragColor = vec4(c.rgb * (1.0 - 0.5 * pow(clamp(v, 0.0, 1.0), 2.6)), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));

    this.draw = (t) => {
      G.uTime.value = t;
      const rv = reveal(t);
      BU.uRev.value = rv;
      scene.fog.color.copy(FOG_COL).multiplyScalar(rv);   // the fogged horizon always matches the water behind it
      camera.position.fromArray(camPos(t));
      camera.lookAt(new THREE.Vector3().fromArray(camTgt(t)));
      camera.updateMatrixWorld();
      // screen height of the (fully fogged) horizon, so the water gradient starts exactly where the sand vanishes
      const hv = new THREE.Vector3(camera.position.x, 0, camera.position.z - 40).project(camera);
      BU.uHor.value = hv.y * 0.5 + 0.5;
      renderer.toneMappingExposure = (0.55 + 0.5 * rv) * edge(t);
      for (let i = 0; i < NF; i++) {
        fishAt(i, t, fp); fishAt(i, t + 0.05, fq);
        fm.lookAt(fq, fp, fUp);
        fs.setScalar(fishData[i].sz);
        fm.scale(fs);
        fm.setPosition(fp);
        fish.setMatrixAt(i, fm);
      }
      fish.instanceMatrix.needsUpdate = true;
      bloom.strength = bloomK(t);
      composer.render(0);
    };
  },
  frame(t) { this.draw(t); },
});
