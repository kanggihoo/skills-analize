/*
 * 150 · 안녕, 하고 손 흔들기 — a code-built 3D mascot rig walks out of a park sunrise toward the camera, stops and waves.
 *
 *   rig.js     one SkinnedMesh: merged body + limbs + scarf ring + face, distance-Gaussian skin weights, 16 bones,
 *              morph targets for blink / happy eyes / mouth.
 *   motion.js  arc-length path, footstep schedule, root trajectory through mid-stances, heel/toe roll, analytic
 *              two-bone IK, and poseRig(t).
 *   story.js   the timeline: camera, closed-form channels (stop, wave, counter-motion, look, tilts), face curves,
 *              and the 240 Hz bake of all secondary motion (lean overshoot, head lag, forearm/hand drag, scarf tails).
 *   main.js    (this file) the park at sunrise, the scarf-tail ribbons, the bubble, and frame(t), which only reads
 *              closed forms and baked arrays.
 */
import * as THREE from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { defineDemo, rand, clamp, lerp, smooth, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { buildCharacter, COL } from './rig.js';
import { pathAt, pathX, rootS, poseRig } from './motion.js';
import { camPose, channels, newCh, blinkAt, happyAt, mouthAt, bakeSecondary, outBack, T_BUB0, T_BUB1 } from './story.js';

const D = 9.5;
const SW = 1080, SH = 1920;

// ---------------------------------------------------------------- palette (sRGB); the one accent is COL.coral (scarf)
const PAL = {
  skyTop: '#8d9ad8', lilac: '#bdb3e2', rose: '#f2b2b8', peach: '#ffc9a6', horizon: '#ffd9b0', sun: '#fff0d4',
  fog: '#f5cdb0', grass: '#a9cf8d', grassD: '#86b47c', sand: '#f2dcbb', sandD: '#ddc29e',
  leaf: '#6f9f7e', leafL: '#9cc48e', bark: '#8b6b58', hill1: '#7f9e88', hill2: '#9d9cc2', hill3: '#bcb0cf',
};
const SUN_AZ = 0.172;                              // toward +x from −z, near the far end of the path
const SUN_EL_VIS = 0.04, SUN_EL_LIGHT = 0.56;     // the disc sits on the hills; the shadow light is higher
const sunDir = (el) => new THREE.Vector3(Math.sin(SUN_AZ) * Math.cos(el), Math.sin(el), -Math.cos(SUN_AZ) * Math.cos(el));

function canvasTex(w, h, draw, headless, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  draw(g, w, h);
  const tx = new THREE.CanvasTexture(c);
  if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}
const radialTex = (stops, headless, size = 256) => canvasTex(size, size, (g, s) => {
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  for (const [o, c] of stops) gr.addColorStop(o, c);
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
}, headless);


defineDemo({
  id: '150-character-rig',
  title: '안녕, 하고 손 흔들기',
  tech: '3D 캐릭터 리그 · 코드로 짠 스키닝 + 걷기 주기 + 두 마디 IK',
  duration: D,
  background: '#f3c9aa',

  async setup(api) {
    const HL = api.headless;
    await fontReady('800 132px "Pretendard Variable"', '안녕!');

    // ---- renderer
    const el = api.layer('canvas', { z: 0 });
    el.width = SW; el.height = SH;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(SW, SH, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.autoClear = false;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(PAL.fog, 9, 120);
    const camera = new THREE.PerspectiveCamera(30, SW / SH, 0.1, 500);

    // ---- sky: a vertex-coloured dome (elevation gradient + broad sun glow); also the source of the IBL
    const SUNV = sunDir(SUN_EL_VIS);
    const C = (h) => new THREE.Color(h);
    const SKY = [[-0.2, C(PAL.horizon)], [0.0, C(PAL.horizon)], [0.04, C(PAL.peach)], [0.11, C(PAL.rose)], [0.2, C(PAL.lilac)], [0.36, C(PAL.skyTop)], [1.6, C(PAL.skyTop)]];
    const skyColor = (d, out) => {
      const e = Math.asin(clamp(d.y, -1, 1));
      let i = 0;
      while (i < SKY.length - 2 && SKY[i + 1][0] < e) i++;
      out.copy(SKY[i][1]).lerp(SKY[i + 1][1], smooth((e - SKY[i][0]) / (SKY[i + 1][0] - SKY[i][0])));
      const g = Math.acos(clamp(d.dot(SUNV), -1, 1));
      const k = (0.2 * Math.exp(-(g * g) / 0.02) + 0.1 * Math.exp(-(g * g) / 0.25)) * (0.4 + 0.6 * Math.exp(-Math.max(0, e) * 4));
      out.r += k * 1.0; out.g += k * 0.74; out.b += k * 0.48;
      return out;
    };
    const domeGeo = new THREE.SphereGeometry(300, 128, 64);
    {
      const P = domeGeo.attributes.position, col = new Float32Array(P.count * 3), d = new THREE.Vector3(), c = new THREE.Color();
      for (let i = 0; i < P.count; i++) {
        d.fromBufferAttribute(P, i).normalize();
        skyColor(d, c);
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      domeGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    }
    const dome = new THREE.Mesh(domeGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    dome.renderOrder = -10;
    scene.add(dome);
    // environment: the same sky over a grass-coloured lower hemisphere, prefiltered once
    {
      const envScene = new THREE.Scene();
      const g = domeGeo.clone();
      const P = g.attributes.position, col = g.attributes.color, d = new THREE.Vector3();
      const ground = C('#7f8f5e');
      for (let i = 0; i < P.count; i++) {
        d.fromBufferAttribute(P, i).normalize();
        if (d.y < 0) { const k = smooth(-d.y / 0.08); col.setXYZ(i, lerp(col.getX(i), ground.r, k), lerp(col.getY(i), ground.g, k), lerp(col.getZ(i), ground.b, k)); }
      }
      envScene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(envScene, 0.04).texture;
      scene.environmentIntensity = 1.15;
      pmrem.dispose();
    }

    // ---- sun: disc behind the hills, a far glow (occluded by the hills), a near haze glow (in front of them)
    const discTex = radialTex([[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,1)'], [0.47, 'rgba(255,255,255,0.5)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,0)']], HL);
    const glowTex = radialTex([[0, 'rgba(255,255,255,1)'], [0.12, 'rgba(255,255,255,0.6)'], [0.35, 'rgba(255,255,255,0.18)'], [0.7, 'rgba(255,255,255,0.04)'], [1, 'rgba(255,255,255,0)']], HL);
    const softTex = radialTex([[0, 'rgba(255,255,255,1)'], [0.5, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']], HL, 128);
    const addMat = (map, rgb) => new THREE.MeshBasicMaterial({ map, color: new THREE.Color(...rgb), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const sunDisc = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), new THREE.MeshBasicMaterial({ map: discTex, color: new THREE.Color(1.9, 1.55, 1.05), transparent: true, depthWrite: false, fog: false }));
    const sunGlow = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), addMat(glowTex, [0.22, 0.11, 0.05]));
    const haze = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), addMat(glowTex, [0.07, 0.04, 0.02]));
    sunDisc.renderOrder = -9; sunGlow.renderOrder = -8;
    scene.add(sunDisc, sunGlow, haze);

    // ---- lights: the low sun (key + soft shadows, from behind), a warm front fill for the face, the sky IBL
    const sun = new THREE.DirectionalLight('#ffd3a2', 2.6);
    const SUNL = sunDir(SUN_EL_LIGHT);
    sun.target.position.set(0.2, 0, -2.6);
    sun.position.copy(sun.target.position).addScaledVector(SUNL, 34);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -6.5, right: 6.5, top: 6.5, bottom: -6.5, near: 10, far: 62 });
    sun.shadow.radius = 5;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    sun.shadow.intensity = 0.8;
    scene.add(sun, sun.target);
    const fill = new THREE.DirectionalLight('#fff0e4', 1.9);
    fill.position.set(-3.5, 4.0, 9);
    scene.add(fill);

    // ---- terrain: flat along the path, soft mounds further out (seeded simplex), vertex-coloured grass
    const noise = new SimplexNoise({ random: rand(1501) });
    const pathD = (x, z) => Math.abs(x - pathX(z));
    const heightAt = (x, z) => {
      const d = pathD(x, z);
      return sm(2.4, 7.5, d) * (0.5 + 0.38 * noise.noise(x * 0.11, z * 0.11)) * (1 + 0.6 * sm(10, 40, -z)) + sm(1.6, 4, d) * 0.06 * noise.noise(x * 0.7, z * 0.7);
    };
    function sm(a, b, x) { return smooth((x - a) / (b - a)); }
    {
      const g = new THREE.PlaneGeometry(180, 180, 180, 180);
      g.rotateX(-Math.PI / 2);
      g.translate(0, 0, -50);
      const P = g.attributes.position, col = new Float32Array(P.count * 3);
      const c = new THREE.Color(), g0 = C(PAL.grass), g1 = C(PAL.grassD), dry = C('#bccb8f');
      for (let i = 0; i < P.count; i++) {
        const x = P.getX(i), z = P.getZ(i);
        P.setY(i, heightAt(x, z));
        const n = noise.noise(x * 0.35, z * 0.35), d = pathD(x, z);
        c.copy(g0).lerp(g1, 0.45 + 0.4 * n).lerp(dry, 0.3 * (1 - sm(0.6, 1.5, d)));
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      g.computeVertexNormals();
      const ground = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
      ground.receiveShadow = true;
      scene.add(ground);
    }
    // the path: a ribbon along the arc-length table, sand in the middle, a soft darker edge
    {
      const OFF = [-0.63, -0.56, -0.44, -0.2, 0, 0.2, 0.44, 0.56, 0.63], NW = OFF.length;
      const s0 = 0, s1 = 160, ds = 0.12, NS = Math.ceil((s1 - s0) / ds);
      const pos = [], col = [], idx = [], Pp = {}, c = new THREE.Color(), sand = C(PAL.sand), sandD = C(PAL.sandD), edge = C('#c7c08f');
      for (let i = 0; i <= NS; i++) {
        pathAt(s0 + i * ds, Pp);
        const lx = Math.cos(Pp.psi), lz = -Math.sin(Pp.psi);
        for (let j = 0; j < NW; j++) {
          const o = OFF[j] * (1 + 0.04 * noise.noise(i * 0.05, j));
          const x = Pp.x + lx * o, z = Pp.z + lz * o, a = Math.abs(OFF[j]);
          pos.push(x, heightAt(x, z) + (a > 0.6 ? 0.002 : 0.007), z);
          const n = noise.noise(x * 2.2, z * 2.2);
          c.copy(sand).lerp(sandD, clamp(sm(0.3, 0.56, a) * 0.8 + 0.18 * n)).lerp(edge, a > 0.6 ? 0.8 : 0);
          col.push(c.r, c.g, c.b);
        }
      }
      for (let i = 0; i < NS; i++) for (let j = 0; j < NW - 1; j++) {
        const a = i * NW + j, b = a + NW;
        idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      const path = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 }));
      path.receiveShadow = true;
      scene.add(path);
    }
    // hills: three silhouette flats in the haze (the fog does the aerial perspective)
    [[-50, 1.4, 1.1, PAL.hill1, 11], [-72, 2.5, 1.7, PAL.hill2, 12], [-104, 3.9, 2.4, PAL.hill3, 13]].forEach(([z, base, amp, hex, seed]) => {
      const R = rand(seed), sh = new THREE.Shape();
      const ph = [R() * 6, R() * 6, R() * 6];
      sh.moveTo(-160, -3);
      for (let x = -160; x <= 160; x += 1.5) sh.lineTo(x, base + amp * (0.55 * Math.sin(x * 0.045 + ph[0]) + 0.3 * Math.sin(x * 0.11 + ph[1]) + 0.15 * Math.sin(x * 0.27 + ph[2])));
      sh.lineTo(160, -3);
      const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: hex }));
      m.position.set(pathX(z), 0, z);
      scene.add(m);
    });

    // ---- trees (an avenue receding to the sun) + bushes: merged-sphere canopies, instanced
    const leafA = C(PAL.leaf), leafB = C(PAL.leafL), barkC = C(PAL.bark);
    function treeGeo(canopy, { trunk = true, y0 = 1.1, y1 = 2.5, seg = [22, 14] } = {}) {
      const parts = [];
      if (trunk) {
        const tg = new THREE.CylinderGeometry(0.07, 0.11, 1.4, 10, 1);
        tg.translate(0, 0.7, 0);
        parts.push([tg, () => barkC]);
      }
      for (const [x, y, z, r] of canopy) {
        const s = new THREE.SphereGeometry(r, seg[0], seg[1]);
        s.translate(x, y, z);
        parts.push([s, (p) => leafA.clone().lerp(leafB, smooth((p.y - y0) / (y1 - y0)))]);
      }
      const geos = parts.map(([g, cf]) => {
        g.deleteAttribute('uv');
        const P = g.attributes.position, col = new Float32Array(P.count * 3), p = new THREE.Vector3();
        for (let i = 0; i < P.count; i++) { const c = cf(p.fromBufferAttribute(P, i)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        return g;
      });
      return mergeGeometries(geos);
    }
    const RT = rand(1503);
    const TREE_GEOS = [
      treeGeo([[0, 1.75, 0, 0.62], [0.36, 1.5, 0.1, 0.42], [-0.34, 1.55, -0.08, 0.45], [0.05, 2.15, 0, 0.42]]),
      treeGeo([[0, 1.6, 0, 0.55], [0.25, 1.95, 0.05, 0.4], [-0.3, 1.4, 0.1, 0.38]]),
    ];
    const treeMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88 });
    const trees = [[], []];
    // a tree may not cover the sun disc from anywhere along the camera move
    const camSamples = [0, 1.5, 3, 4.5, 6, 7.5, 9.5].map((t) => camPose(t, { pos: new THREE.Vector3(), look: new THREE.Vector3() }).pos.clone());
    const SUNV0 = sunDir(SUN_EL_VIS);
    const coversSun = (x, z, s) => camSamples.some((c) => {
      const top = new THREE.Vector3(x, heightAt(x, z) + 1.75 * s, z).sub(c);
      const ang = Math.acos(clamp(top.clone().normalize().dot(SUNV0), -1, 1));
      return ang < Math.atan((0.95 * s) / top.length()) + 0.05;
    });
    for (const sideX of [-1, 1]) {
      for (let z = sideX < 0 ? -3.2 : -5.4; z > -66; z -= 3.4 + RT() * 2.4) {
        const off = 2.0 + 0.045 * -z + RT() * 0.9;
        const x = pathX(z) + sideX * off, s = 0.85 + RT() * 0.5, r = RT() * 6.28, v = RT() < 0.5 ? 0 : 1;
        if (!coversSun(x, z, s)) trees[v].push([x, z, s, r]);
      }
    }
    trees[0].push([2.2, -1.4, 1.25, 1.0], [-2.4, 0.4, 1.3, 2.0]);       // two near ones whose shadows reach the path
    const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(), p4 = new THREE.Vector3(), e4 = new THREE.Euler();
    trees.forEach((list, vi) => {
      const im = new THREE.InstancedMesh(TREE_GEOS[vi], treeMat, list.length);
      list.forEach(([x, z, s, r], i) => {
        im.setMatrixAt(i, m4.compose(p4.set(x, heightAt(x, z) - 0.02, z), q4.setFromEuler(e4.set(0, r, 0)), s4.setScalar(s)));
        im.setColorAt(i, new THREE.Color().setHSL(0, 0, 0.9 + 0.2 * RT()));
      });
      im.castShadow = true; im.receiveShadow = true;
      scene.add(im);
    });
    {
      const bushGeo = treeGeo([[0, 0.16, 0, 0.3], [0.28, 0.1, 0.05, 0.22], [-0.26, 0.12, -0.03, 0.24]], { trunk: false, y0: -0.1, y1: 0.45, seg: [18, 12] });
      const list = [];
      for (let z = 1.5; z > -16; z -= 1.3 + RT() * 1.6) for (const sx of [-1, 1]) {
        if (RT() < 0.35) continue;
        list.push([pathX(z) + sx * (0.95 + RT() * 0.55), z, 0.6 + RT() * 0.55, RT() * 6.28]);
      }
      const im = new THREE.InstancedMesh(bushGeo, treeMat, list.length);
      list.forEach(([x, z, s, r], i) => {
        im.setMatrixAt(i, m4.compose(p4.set(x, heightAt(x, z) - 0.05, z), q4.setFromEuler(e4.set(0, r, 0)), s4.set(s, s * 0.8, s)));
        im.setColorAt(i, new THREE.Color().setHSL(0, 0, 0.88 + 0.22 * RT()));
      });
      im.castShadow = true; im.receiveShadow = true;
      scene.add(im);
    }
    // grass tufts along the path edges
    {
      const blades = [];
      for (let b = 0; b < 5; b++) {
        const a = (b / 5) * Math.PI * 2 + 0.3, lean = 0.25 + 0.15 * (b % 2), hgt = 0.12 + 0.05 * ((b * 7) % 3) / 2;
        const pos = [], col = [], nor = [];
        const N = 4, cb = C(PAL.grassD), ct = C('#d6e8a8');
        for (let i = 0; i <= N; i++) {
          const k = i / N, w = 0.017 * (1 - 0.85 * k);
          const r = lean * k * k * hgt, y = hgt * k;
          const cx = Math.cos(a) * r, cz = Math.sin(a) * r, px = -Math.sin(a) * w, pz = Math.cos(a) * w;
          pos.push(cx - px, y, cz - pz, cx + px, y, cz + pz);
          const c = cb.clone().lerp(ct, k);
          col.push(c.r, c.g, c.b, c.r, c.g, c.b);
          nor.push(0, 1, 0, 0, 1, 0);
        }
        const idx = [];
        // both windings with the same up-facing normal: lit like the lawn from either side (no back-face flip)
        for (let i = 0; i < N; i++) { const o = i * 2; idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2, o, o + 2, o + 1, o + 1, o + 2, o + 3); }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
        g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        g.setIndex(idx);
        blades.push(g);
      }
      const tuft = mergeGeometries(blades);
      const list = [];
      for (let i = 0; i < 320; i++) {
        const z = 2.6 - RT() * 22, sx = RT() < 0.5 ? -1 : 1;
        const d = 0.55 + Math.pow(RT(), 1.8) * 2.2;
        const x = pathX(z) + sx * d;
        list.push([x, z, 0.7 + RT() * 0.7, RT() * 6.28]);
      }
      const im = new THREE.InstancedMesh(tuft, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }), list.length);
      list.forEach(([x, z, s, r], i) => {
        im.setMatrixAt(i, m4.compose(p4.set(x, heightAt(x, z), z), q4.setFromEuler(e4.set(0, r, 0)), s4.setScalar(s)));
        im.setColorAt(i, new THREE.Color().setHSL(0, 0, 0.85 + 0.25 * RT()));
      });
      im.receiveShadow = true;
      scene.add(im);
    }
    // ---- the mascot
    const knitTex = canvasTex(64, 64, (g, s) => {
      g.fillStyle = '#d4493d'; g.fillRect(0, 0, s, s);
      for (const [cx, rot] of [[20, 0.42], [44, -0.42]]) {
        g.save(); g.translate(cx, 30); g.rotate(rot);
        const gr = g.createLinearGradient(0, -28, 0, 28);
        gr.addColorStop(0, '#ff9c84'); gr.addColorStop(0.45, '#ff6d58'); gr.addColorStop(1, '#e8564a');
        g.fillStyle = gr;
        g.beginPath(); g.ellipse(0, 0, 12.5, 27, 0, 0, Math.PI * 2); g.fill();
        g.restore();
      }
    }, HL);
    knitTex.wrapS = knitTex.wrapT = THREE.RepeatWrapping;
    const rig = buildCharacter(knitTex);
    scene.add(rig.mesh);
    const scarfMat = rig.mats[1];

    // ---- scarf tails: a Verlet chain each (baked below), drawn as a knitted ribbon rebuilt per frame
    const TAILS = [{ n: 8, seg: 0.044, w: 0.046, th: 0.014 }, { n: 7, seg: 0.04, w: 0.041, th: 0.013 }];
    const SUB = 3, RING = 12;
    for (const T of TAILS) {
      const nc = (T.n - 1) * SUB + 1;
      T.nc = nc;
      const vCount = nc * RING + 1;
      const g = new THREE.BufferGeometry();
      T.pos = new Float32Array(vCount * 3);
      const uv = new Float32Array(vCount * 2), idx = [];
      for (let i = 0; i < nc; i++) for (let j = 0; j < RING; j++) { uv[(i * RING + j) * 2] = (j / RING) * 4.5; uv[(i * RING + j) * 2 + 1] = (i / (nc - 1)) * T.seg * (T.n - 1) / 0.036; }
      for (let i = 0; i < nc - 1; i++) for (let j = 0; j < RING; j++) {
        const a = i * RING + j, b = i * RING + ((j + 1) % RING);
        idx.push(a, a + RING, b, b, a + RING, b + RING);
      }
      const tip = nc * RING;                                             // closed end: a fan to the tip centre
      for (let j = 0; j < RING; j++) idx.push((nc - 1) * RING + j, tip, (nc - 1) * RING + ((j + 1) % RING));
      g.setAttribute('position', new THREE.BufferAttribute(T.pos, 3).setUsage(THREE.DynamicDrawUsage));
      g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      g.setIndex(idx);
      T.geo = g;
      T.mesh = new THREE.Mesh(g, scarfMat);
      T.mesh.castShadow = true; T.mesh.receiveShadow = true; T.mesh.frustumCulled = false;
      scene.add(T.mesh);
    }

    // contact shadows: soft blobs under each shoe and under the body
    const blobTex = radialTex([[0, 'rgba(0,0,0,1)'], [0.45, 'rgba(0,0,0,0.55)'], [1, 'rgba(0,0,0,0)']], HL, 128);
    const blobMat = (o) => new THREE.MeshBasicMaterial({ map: blobTex, color: '#3b2a3a', transparent: true, opacity: o, depthWrite: false, fog: false });
    const blobs = { L: new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.42), blobMat(0.5)), R: new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.42), blobMat(0.5)), body: new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.8), blobMat(0.28)) };
    for (const b of Object.values(blobs)) { b.rotation.order = 'YXZ'; b.renderOrder = 2; scene.add(b); }

    // dust in the low sun
    const RD = rand(1504);
    const dust = [];
    for (let i = 0; i < 110; i++) dust.push([(RD() * 2 - 1) * 2.2, 0.2 + RD() * 1.1, -5 + RD() * 6.5, RD() * 6.28, 0.04 + RD() * 0.1, 0.5 + RD() * 0.5]);
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dust.length * 3), dustCol = new Float32Array(dust.length * 3);
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustCol, 3));
    const dustPts = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.028, map: softTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    dustPts.frustumCulled = false;
    scene.add(dustPts);

    // ---- overlay: the speech bubble (baked canvas) and a little veiling glare from the sun
    const overlay = new THREE.Scene();
    const ortho = new THREE.OrthographicCamera(0, SW, 0, -SH, -10, 10);
    const BW = 560, BHt = 380;
    const bubTex = canvasTex(BW, BHt, (g) => {
      g.save();
      g.shadowColor = 'rgba(120,70,70,0.22)'; g.shadowBlur = 26; g.shadowOffsetY = 10;
      g.fillStyle = '#fffaf2';
      g.beginPath();
      g.roundRect(44, 34, 470, 236, 118);
      g.moveTo(428, 250); g.quadraticCurveTo(450, 318, 508, 350); g.quadraticCurveTo(410, 330, 362, 262);
      g.fill();
      g.restore();
      g.fillStyle = COL.navy;
      g.font = '800 132px "Pretendard Variable"';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('안녕!', 279, 160);
    }, HL);
    const bubble = new THREE.Group();
    const bubMesh = new THREE.Mesh(new THREE.PlaneGeometry(BW, BHt), new THREE.MeshBasicMaterial({ map: bubTex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
    bubMesh.position.set(BW / 2 - 508, 350 - BHt / 2, 0);              // the tail tip (508, 350 in canvas px) at the group origin
    bubble.add(bubMesh);
    overlay.add(bubble);
    const glare = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial({ map: glowTex, color: new THREE.Color(0, 0, 0), transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    overlay.add(glare);

    const BK = bakeSecondary(rig, TAILS, D);


    // camera pose objects
    const cam = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 30 };

    Object.assign(this, {
      renderer, scene, camera, overlay, ortho, rig, TAILS, SUB, RING, BK, chB: newCh(), PR: {},
      sunDisc, sunGlow, haze, SUNV, blobs, dust, dustPos, dustCol, dustGeo, bubble, glare, cam,
    });
    this.warmUp();
  },

  // draw frames that use every material once and wait for the GPU, so shader compilation is paid in setup
  warmUp() {
    const gl = this.renderer.getContext(), px = new Uint8Array(4);
    this.frame(7.0);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
  },

  frame(t) {
    const S = this;
    const f = clamp((t - S.BK.BT0) / S.BK.BDT, 0, S.BK.NB - 2);
    const sec = S.BK.secAt(t);
    camPose(t, S.cam);
    pathAt(rootS(t), S.PR);
    const ch = channels(t, S.cam.pos, S.PR, S.chB);
    poseRig(S.rig, t, ch, sec);

    // face
    const infl = S.rig.mesh.morphTargetInfluences, M = S.rig.MORPH;
    const happy = happyAt(t);
    infl[M.blink] = blinkAt(t) * (1 - happy);
    infl[M.happy] = happy;
    infl[M.open] = mouthAt(t);

    // scarf tails: baked chain at t → Catmull-Rom centreline → parallel-transported ribbon frames
    const i0 = Math.floor(f), u = f - i0;
    const tan0 = new THREE.Vector3(), a0 = new THREE.Vector3();
    S.rig.skinPoint(S.rig.knot.anchor[0], S.rig.knot.w, a0);
    S.rig.skinPoint(S.rig.knot.anchor[0].clone().addScaledVector(S.rig.knot.tangent, 0.05), S.rig.knot.w, tan0);
    tan0.sub(a0).normalize();
    for (const T of S.TAILS) {
      const node = [];
      for (let j = 0; j < T.n; j++) {
        const o0 = (i0 * T.n + j) * 3, o1 = ((i0 + 1) * T.n + j) * 3;
        node.push(new THREE.Vector3(lerp(T.bake[o0], T.bake[o1], u), lerp(T.bake[o0 + 1], T.bake[o1 + 1], u), lerp(T.bake[o0 + 2], T.bake[o1 + 2], u)));
      }
      const curve = new THREE.CatmullRomCurve3(node, false, 'centripetal');
      const W = tan0.clone(), Tg = new THREE.Vector3(), N = new THREE.Vector3(), c = new THREE.Vector3();
      for (let i = 0; i < T.nc; i++) {
        const k = i / (T.nc - 1);
        curve.getPoint(k, c);
        curve.getTangent(k, Tg);
        W.addScaledVector(Tg, -W.dot(Tg)).normalize();                  // parallel transport of the width axis
        N.crossVectors(Tg, W);
        const w = T.w * (0.82 + 0.3 * k), th = T.th;
        for (let j = 0; j < S.RING; j++) {
          const a = (j / S.RING) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
          const x = w * Math.sign(ca) * Math.pow(Math.abs(ca), 0.35), y = th * Math.sign(sa) * Math.pow(Math.abs(sa), 0.35);
          const o = (i * S.RING + j) * 3;
          T.pos[o] = c.x + W.x * x + N.x * y; T.pos[o + 1] = c.y + W.y * x + N.y * y; T.pos[o + 2] = c.z + W.z * x + N.z * y;
        }
        if (i === T.nc - 1) { const o = T.nc * S.RING * 3; T.pos[o] = c.x + Tg.x * 0.004; T.pos[o + 1] = c.y + Tg.y * 0.004; T.pos[o + 2] = c.z + Tg.z * 0.004; }
      }
      T.geo.attributes.position.needsUpdate = true;
      T.geo.computeVertexNormals();
    }

    // contact blobs: fade as a foot lifts
    for (const k of ['L', 'R']) {
      const I = S.rig.ik[k], b = S.blobs[k];
      b.position.set(I.x + Math.sin(I.psi) * 0.03, 0.012, I.z + Math.cos(I.psi) * 0.03);
      b.rotation.set(-Math.PI / 2, 0, I.psi);
      b.material.opacity = 0.5 * (1 - smooth(I.h / 0.07));
    }
    S.blobs.body.position.set(S.PR.x, 0.011, S.PR.z + 0.02);
    S.blobs.body.rotation.set(-Math.PI / 2, 0, S.PR.psi);

    // camera
    const camera = S.camera;
    camera.position.copy(S.cam.pos);
    camera.lookAt(S.cam.look);
    camera.updateMatrixWorld(true);

    // sun billboards (face the camera), the haze glow in front of the hills, dust
    S.sunDisc.position.copy(camera.position).addScaledVector(S.SUNV, 260);
    S.sunGlow.position.copy(S.sunDisc.position);
    S.haze.position.copy(camera.position).addScaledVector(S.SUNV, 36);
    for (const m of [S.sunDisc, S.sunGlow, S.haze]) m.quaternion.copy(camera.quaternion);
    for (let i = 0; i < S.dust.length; i++) {
      const [x, y, z, ph, sp, b] = S.dust[i];
      S.dustPos[i * 3] = S.PR.x * 0.6 + x + 0.25 * Math.sin(ph + t * sp * 3);
      S.dustPos[i * 3 + 1] = y + 0.12 * Math.sin(ph * 1.7 + t * 0.5) + t * sp * 0.2;
      S.dustPos[i * 3 + 2] = z + S.PR.z * 0.6 + 0.2 * Math.cos(ph + t * sp * 2);
      // forward scattering: a mote only lights up when it sits between the camera and the sun
      const dx = S.dustPos[i * 3] - camera.position.x, dy = S.dustPos[i * 3 + 1] - camera.position.y, dz = S.dustPos[i * 3 + 2] - camera.position.z;
      const cs = Math.max(0, (dx * S.SUNV.x + dy * S.SUNV.y + dz * S.SUNV.z) / Math.hypot(dx, dy, dz));
      const k = b * (0.55 + 0.45 * Math.sin(ph * 3 + t * 1.6)) * 2.4 * Math.pow(cs, 60);
      S.dustCol[i * 3] = k * 1.0; S.dustCol[i * 3 + 1] = k * 0.8; S.dustCol[i * 3 + 2] = k * 0.55;
    }
    S.dustGeo.attributes.position.needsUpdate = true;
    S.dustGeo.attributes.color.needsUpdate = true;

    // overlay: bubble pinned beside the head (pops on "안", leaves fast), glare at the sun
    const head = S.rig.B.head.getWorldPosition(new THREE.Vector3());
    const left = new THREE.Vector3(Math.cos(S.PR.psi), 0, -Math.sin(S.PR.psi));
    const anchor = head.addScaledVector(left, -0.3).add(new THREE.Vector3(0, 0.36, 0)).project(camera);
    const ax = (anchor.x + 1) * 0.5 * SW, ay = (1 - anchor.y) * 0.5 * SH;
    const pin = outBack(clamp((t - T_BUB0) / 0.32), 2.2), pout = ease.inCubic(clamp((t - T_BUB1) / 0.16));
    const bs = pin * (1 - pout) * (1 + 0.025 * Math.sin((t - T_BUB0) * 5.2));
    S.bubble.visible = bs > 0.002;
    S.bubble.position.set(ax, -ay, 0);
    S.bubble.scale.setScalar(Math.max(bs, 0.001) * 0.62);
    S.bubble.rotation.z = -0.05 * (1 - pin) - 0.02 * Math.sin((t - T_BUB0) * 3.1);
    const sp = camera.position.clone().addScaledVector(S.SUNV, 200).project(camera);
    S.glare.position.set((sp.x + 1) * 0.5 * SW, -(1 - sp.y) * 0.5 * SH, 0);
    S.glare.material.color.setRGB(0.16, 0.11, 0.07);

    const r = S.renderer;
    r.clear();
    r.render(S.scene, camera);
    r.render(S.overlay, S.ortho);
  },
});
