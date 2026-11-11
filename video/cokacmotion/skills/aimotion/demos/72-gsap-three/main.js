/*
 * 72 · 카메라 안무 — a toy island diorama in three.js, choreographed by ONE paused GSAP timeline.
 *
 * GSAP does not know three.js; it tweens plain numbers and colours, and frame(t) turns them into the scene:
 *   rig    { tx, ty, tz, az, el, dist, fov, follow }  a spherical camera rig: tweening azimuth = orbit,
 *          elevation = crane, distance = dolly, target = pan; `follow` blends the target onto the boat
 *   env    sun angle on its wire arc, light colours/intensities, a three-stop sky (colour strings), beam, lamp
 *   boatP  { x, y, rotation }  driven by MotionPathPlugin along a curvy plan path, autoRotate = heading
 *   train  { s }   arc-length progress on the railway loop; cars are read off the same GSAP raw path
 *          with MotionPathPlugin.getPositionOnPath (wagons sit a fixed distance behind the engine)
 *   gullP  { u }   parameter on a closed CatmullRomCurve3
 *   puffs  { k }   per smoke puff, its age 0..1
 *   plus direct tweens on three.js objects (scale pop-ins with back/elastic, windmill, bobbing, flaps)
 *   and on the DOM title card (CSSPlugin).
 * frame(t): tl.time(t) → apply → renderer.render once. No clock, no mixer, no rAF.
 */
import * as THREE from 'three';
import { gsap } from '../node_modules/gsap/index.js';
import { MotionPathPlugin } from '../node_modules/gsap/MotionPathPlugin.js';
import { CustomEase } from '../node_modules/gsap/CustomEase.js';
import { defineDemo, rand } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { buildDiorama, polar } from './diorama.js';

gsap.registerPlugin(MotionPathPlugin, CustomEase);
CustomEase.create('pullAway', 'M0,0 C0.22,0 0.34,0.12 1,1');   // a train starting: eases in, then runs at speed

const D = 10;
const DEG = Math.PI / 180;
const GP = MotionPathPlugin;   // static path helpers: arrayToRawPath, cacheRawPathMeasurements, getPositionOnPath

// ---------------------------------------------------------------- the camera's shot list (tuning knob)
// rig at t = 0, then each move: [start, duration, ease, { values }]
const RIG0 = { tx: 0, ty: 0.2, tz: 0, az: -28, el: 80, dist: 30, fov: 38, follow: 0 };
const SHOTS = [
  // A  top-down unwinding into a 3/4 view while the island assembles
  [0.1, 2.6, 'power2.inOut', { az: 20, el: 36, dist: 25 }],
  // B  dolly down to the harbour at water level, picking up the boat
  [2.7, 1.45, 'power3.inOut', { tx: 4.4, ty: 0.75, tz: 1.3, az: 40, el: 9, dist: 8.6, fov: 36 }],
  [3.0, 1.4, 'power2.inOut', { follow: 0.45 }],
  [4.15, 1.1, 'sine.inOut', { az: 52, el: 12, dist: 7.8 }],
  // C  crane up and orbit the town (the sun keeps moving: shadows sweep)
  [5.25, 1.2, 'power3.inOut', { tx: 0.2, ty: 0.75, tz: 0.1, el: 24, dist: 12.5, fov: 38 }],
  [5.25, 1.0, 'power2.inOut', { follow: 0 }],
  [5.25, 2.5, 'sine.inOut', { az: -40 }],
  [6.45, 1.3, 'sine.inOut', { el: 29, dist: 13.4 }],
  // D  pull back and up to the hero wide at golden hour, then settle
  [7.75, 1.5, 'power3.inOut', { tx: 0, ty: -0.9, tz: 0, az: -80, el: 30, dist: 34, fov: 40 }],
  [9.25, 0.75, 'sine.out', { az: -86, el: 28 }],
];

// light & sky: morning → noon → afternoon → golden hour
const ENV0 = {
  sunA: 22, sunI: 2.2, sunC: '#ffe2c0', hemiI: 1.55, hemiSky: '#e3f4ff', hemiGround: '#f3d6b6',
  top: '#8fd3f7', mid: '#fff1dc', low: '#7fb9dd', beam: 0, lamp: 0.25, ball: '#ffd25a',
};

defineDemo({
  id: '72-gsap-three',
  title: '카메라 안무',
  tech: 'GSAP 타임라인 × three.js · 카메라 경로 · 장면 연출',
  duration: D,
  background: '#8fd3f7',

  async setup(api) {
    await Promise.all([
      fontReady('400 80px "Do Hyeon"', '작은 섬의 하루'),
      fontReady('700 30px "Pretendard Variable"', '오전 오후 0123456789:'),
    ]);

    // ---- renderer
    const el = api.layer('canvas', { z: 0 });
    el.width = api.W; el.height = api.H;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(api.W, api.H, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;    // (PCFSoftShadowMap is gone in r18x; PCF + radius is soft)
    renderer.toneMapping = THREE.NeutralToneMapping;  // keeps pastel hues saturated
    renderer.toneMappingExposure = 1.0;

    // ---- the railway loop as a GSAP raw path (plan coordinates ×100; plan y = world z), closed and smooth
    const loop = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * 360, r = 3.0 + 0.2 * Math.sin(3 * a * DEG + 0.5);
      const [x, z] = polar(a, r);
      loop.push({ x: x * 100, y: z * 100 });
    }
    loop.push({ ...loop[0] });
    const trackRaw = GP.cacheRawPathMeasurements(GP.arrayToRawPath(loop, { curviness: 1 }));
    const trackLen = trackRaw.totalLength / 100;

    const R = rand(7272);
    const { scene, P } = buildDiorama(R, GP, trackRaw);

    // chimney tops in world space, measured while the houses are still full size
    scene.updateMatrixWorld(true);
    const chimneyW = P.chimneys.map((o) => o.getWorldPosition(new THREE.Vector3()));

    // ---- lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
    scene.add(hemi);
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    const sc = sunLight.shadow.camera;
    sc.left = -11; sc.right = 11; sc.top = 11; sc.bottom = -11; sc.near = 1; sc.far = 60;
    sunLight.shadow.radius = 4;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight, sunLight.target);

    // ---- sky: a studio-sweep gradient on a tiny canvas, redrawn per frame — light sky on top, a glowing
    //      horizon band behind the island, a deeper tone at the bottom (where the white caption sits)
    const skyC = document.createElement('canvas');
    skyC.width = 4; skyC.height = 256;
    const skyX = skyC.getContext('2d');
    const skyTex = new THREE.CanvasTexture(skyC);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    scene.background = skyTex;

    const camera = new THREE.PerspectiveCamera(RIG0.fov, api.W / api.H, 0.1, 260);

    // ---- smoke puffs (houses' chimneys + the engine), one instanced mesh
    const puffs = [];
    chimneyW.forEach((c, ci) => { for (let e = 1.7 + ci * 0.27; e < 9.5; e += 0.55) puffs.push({ e, life: 2.4, kind: 'house', o: c, rise: 1.1, size: 0.12 }); });
    for (let e = 2.25; e < 9.65; e += 0.3) puffs.push({ e, life: 1.5, kind: 'train', o: null, rise: 0.75, size: 0.085 });
    const puffMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), P.puffMat, puffs.length);
    puffMesh.castShadow = true;
    puffMesh.frustumCulled = false;
    scene.add(puffMesh);

    // ---- title card overlay
    const ui = api.layer('div', { z: 5 });
    ui.className = 'isle-ui';
    ui.innerHTML = `<div class="isle-scrim"></div>
      <div class="isle-card"><div class="isle-title">작은 섬의 하루</div>
      <div class="isle-row"><span class="isle-dot"></span><span class="isle-clock">오전 7:00</span></div></div>`;
    const card = ui.querySelector('.isle-card'), dot = ui.querySelector('.isle-dot'), clockEl = ui.querySelector('.isle-clock');

    // ---- gull path
    const gullCurve = new THREE.CatmullRomCurve3(
      [[70, 6.1, 2.4], [100, 5.9, 2.9], [140, 4.0, 3.4], [190, 2.6, 3.0], [250, 3.8, 2.6], [300, 5.0, 3.1], [340, 5.6, 2.8], [20, 6.0, 2.5]]
        .map(([a, r, y]) => { const [x, z] = polar(a, r); return new THREE.Vector3(x, y, z); }),
      true, 'centripetal');

    // ---- boat route (plan a, r) from the pier, inside the lighthouse rocks, round the far side
    const route = [[42, 5.0], [55, 5.62], [70, 4.82], [85, 4.62], [100, 4.7], [120, 5.2], [145, 5.5], [170, 5.4], [192, 5.15]]
      .map(([a, r]) => { const [x, z] = polar(a, r); return { x, y: z }; });

    // ================================================================ state GSAP animates
    const rig = { ...RIG0 };
    const env = { ...ENV0 };
    const train = { s: 0.02 };
    const boatP = { x: route[0].x, y: route[0].y, rotation: Math.atan2(route[1].y - route[0].y, route[1].x - route[0].x) / DEG };
    const gullP = { u: 0 };
    const clock = { m: 420 };
    const track = { p: 0 };
    for (const p of puffs) p.k = 0;

    // initial (pre-entrance) states, assigned directly so that the timeline only ever uses .to()
    const tiny = 0.0001;
    for (const h of P.houses) h.scale.setScalar(tiny);
    const treeScale = P.trees.map((t) => t.scale.x);
    for (const t of P.trees) t.scale.setScalar(tiny);
    P.windmill.scale.setScalar(tiny);
    P.lighthouse.position.y = -2.9;
    P.boat.root.scale.setScalar(tiny);
    for (const c of P.cars) c.scale.setScalar(tiny);
    P.gull.root.scale.setScalar(tiny);
    const cloudScale = P.clouds.map((c) => c.cloud.scale.x);
    for (const c of P.clouds) { c.stick.scale.y = tiny; c.holder.position.y = 0; c.cloud.scale.setScalar(tiny); }
    gsap.set(card, { autoAlpha: 0, y: -46, scale: 0.62, rotation: -8, transformOrigin: '0% 50%' });
    gsap.set(dot, { backgroundColor: '#ffc94a' });
    const [wL, wR] = P.gull.wings;
    wL.rotation.x = 0.35; wR.rotation.x = -0.35;   // wings down (see the flap below)

    // ================================================================ the master timeline
    const tl = gsap.timeline({ paused: true, defaults: { lazy: false, overwrite: false } });

    // camera
    for (const [at, dur, ease, v] of SHOTS) tl.to(rig, { ...v, duration: dur, ease }, at);

    // sun, light, sky
    tl.to(env, { sunA: 158, duration: D, ease: 'sine.inOut' }, 0);
    tl.to(env, { sunI: 3.0, sunC: '#fff8ee', duration: 4.5, ease: 'sine.out' }, 0);
    tl.to(env, { sunI: 2.5, sunC: '#ffb26b', duration: D - 5.5, ease: 'power1.in' }, 5.5);
    tl.to(env, { hemiSky: '#ffdcbc', hemiGround: '#c99a7e', hemiI: 1.35, duration: D - 5.5, ease: 'power1.in' }, 5.5);
    tl.to(env, { top: '#79c4f2', mid: '#eef8ff', low: '#6aaee0', duration: 4.5, ease: 'sine.inOut' }, 0);
    tl.to(env, { top: '#93b8ee', mid: '#ffe1c2', low: '#8a9bd6', duration: 3.0, ease: 'sine.inOut' }, 4.5);
    tl.to(env, { top: '#ef9c7f', mid: '#ffd497', low: '#b9768f', duration: 2.5, ease: 'sine.inOut' }, 7.5);
    tl.to(env, { ball: '#ff9a4a', duration: D - 6, ease: 'power1.in' }, 6);
    tl.to(env, { beam: 0.3, lamp: 1.8, duration: 2.0, ease: 'power2.inOut' }, 6.8);
    tl.to(P.beamPivot.rotation, { y: -Math.PI * 2 * 3, duration: D, ease: 'none' }, 0);

    // the island assembles (pop-ins): houses from the middle out, trees as a wave around the ring
    const byDist = [...P.houses].sort((a, b) => a.position.length() - b.position.length());
    tl.to(byDist.map((h) => h.scale), { x: 1, y: 1, z: 1, duration: 1.2, ease: 'elastic.out(1, 0.5)', stagger: 0.1 }, 0.55);
    const byAngle = P.trees.map((t, i) => ({ t, i, a: Math.atan2(t.position.x, t.position.z) })).sort((a, b) => a.a - b.a);
    byAngle.forEach(({ t, i }, n) => {
      tl.to(t.scale, { x: treeScale[i], y: treeScale[i], z: treeScale[i], duration: 0.6, ease: 'back.out(2.6)' }, 0.85 + n * 0.045);
    });
    tl.to(P.windmill.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'elastic.out(1, 0.45)' }, 1.05);
    tl.to(P.lighthouse.position, { y: 0.3, duration: 1.1, ease: 'back.out(1.3)' }, 0.95);
    tl.to(track, { p: 1, duration: 1.2, ease: 'power2.inOut' }, 0.35);
    P.clouds.forEach((c, i) => {
      const at = 0.3 + i * 0.16;
      tl.to(c.stick.scale, { y: c.top, duration: 0.9, ease: 'power3.out' }, at);
      tl.to(c.holder.position, { y: c.top, duration: 0.9, ease: 'power3.out' }, at);
      tl.to(c.cloud.scale, { x: cloudScale[i], y: cloudScale[i], z: cloudScale[i], duration: 0.7, ease: 'back.out(2.2)' }, at + 0.45);
      tl.to(c.bob.position, { y: 0.16, duration: 1.5 + i * 0.2, ease: 'sine.inOut', yoyo: true, repeat: Math.floor((D - at - 1.2) / (1.5 + i * 0.2)) - 1 }, at + 1.2);
    });
    tl.to(P.cars.map((c) => c.scale), { x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(2.4)', stagger: 0.08 }, 1.5);
    tl.to(P.boat.root.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(2.2)' }, 1.55);
    tl.to(P.gull.root.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(2)' }, 1.8);
    tl.to(card, { autoAlpha: 1, y: 0, scale: 1, rotation: -2, duration: 0.9, ease: 'back.out(2.2)' }, 0.8);

    // secondary motion
    tl.to(P.blades.rotation, { z: -2, duration: 2, ease: 'power2.in' }, 1.2);
    tl.to(P.blades.rotation, { z: -2 - 2 * (D - 3.2), duration: D - 3.2, ease: 'none' }, 3.2);   // end speed of power2.in = 2·2/2 rad/s
    tl.to(P.foam.scale, { x: 1.014, y: 1.014, duration: 1.25, ease: 'sine.inOut', yoyo: true, repeat: 7 }, 0);
    tl.to(P.boat.bob.position, { y: 0.045, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: 13 }, 0);
    tl.to(P.boat.bob.rotation, { x: 0.07, duration: 0.95, ease: 'sine.inOut', yoyo: true, repeat: 9 }, 0.2);
    tl.to(P.boat.bob.rotation, { z: 0.05, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: 6 }, 0.4);
    tl.to(P.boat.wakeMat, { opacity: 0.55, duration: 0.8, ease: 'power1.out' }, 2.4);
    tl.to(boatP, { motionPath: { path: route, curviness: 1.3, autoRotate: true, fromCurrent: false }, duration: D - 2.4, ease: 'power1.inOut' }, 2.4);
    tl.to(train, { s: 0.97, duration: D - 2.0, ease: 'pullAway' }, 2.0);
    tl.to(gullP, { u: 1.1, duration: D - 1.8, ease: 'none' }, 1.8);
    const FLAP = 0.17, flaps = Math.floor((D - 1.8) / FLAP) - 1;
    tl.to(wL.rotation, { x: -0.75, duration: FLAP, ease: 'sine.inOut', yoyo: true, repeat: flaps }, 1.8);
    tl.to(wR.rotation, { x: 0.75, duration: FLAP, ease: 'sine.inOut', yoyo: true, repeat: flaps }, 1.8);
    for (const p of puffs) tl.to(p, { k: 1, duration: p.life, ease: 'none' }, p.e);

    // the overlay: the clock runs from 7:00 to 18:30, the sun dot warms
    tl.to(clock, { m: 1110, duration: D, ease: 'none' }, 0);
    tl.to(dot, { backgroundColor: '#ff8a3d', duration: D - 6, ease: 'power1.in' }, 6);

    // Prime: run forward once (every tween initialises in order, recording its start values), then back to 0.
    // After this, tl.time(t) gives the same state for a t from either direction.
    tl.progress(1, true).progress(0, true);

    // ---- engine pose on the loop at progress s (shared by frame and by the puff bake below)
    const pos = {};
    const carPose = (s, out) => {
      GP.getPositionOnPath(trackRaw, s, true, pos);
      out.x = pos.x / 100; out.z = pos.y / 100; out.a = pos.angle * DEG;
      return out;
    };
    const GAP = 0.6 / trackLen;   // car spacing as path progress
    // bake: where the engine's chimney was when each train puff left it (seek the timeline to that moment)
    const tmp = {};
    for (const p of puffs) {
      if (p.kind !== 'train') continue;
      tl.time(p.e, true);
      carPose(train.s, tmp);
      p.o = new THREE.Vector3(tmp.x + Math.cos(tmp.a) * P.locoChimney.x, P.cars[0].position.y + P.locoChimney.y, tmp.z + Math.sin(tmp.a) * P.locoChimney.x);
    }
    tl.time(0, true);

    Object.assign(this, {
      renderer, scene, camera, tl, rig, env, train, boatP, gullP, clock, track, puffs, puffMesh, P,
      hemi, sunLight, skyX, skyTex, gullCurve, carPose, GAP, clockEl,
    });
  },

  frame(t) {
    const S = this, { P, rig, env } = S;
    S.tl.time(t, true);

    // ---- camera rig
    const boat = P.boat.root;
    boat.position.set(S.boatP.x, 0, S.boatP.y);
    boat.rotation.y = -S.boatP.rotation * DEG;
    const f = rig.follow;
    const tx = rig.tx + (boat.position.x - rig.tx) * f, ty = rig.ty + (0.35 - rig.ty) * f, tz = rig.tz + (boat.position.z - rig.tz) * f;
    const ce = Math.cos(rig.el * DEG);
    S.camera.position.set(tx + rig.dist * ce * Math.sin(rig.az * DEG), ty + rig.dist * Math.sin(rig.el * DEG), tz + rig.dist * ce * Math.cos(rig.az * DEG));
    S.camera.lookAt(tx, ty, tz);
    if (S.camera.fov !== rig.fov) { S.camera.fov = rig.fov; S.camera.updateProjectionMatrix(); }

    // ---- train on the loop
    const pose = {};
    P.cars.forEach((c, k) => {
      S.carPose(S.train.s - k * S.GAP, pose);
      c.position.x = pose.x; c.position.z = pose.z;
      c.rotation.y = -pose.a;
    });
    // railway lays itself down (draw range on the rail tubes, instance count on the sleepers)
    const p = S.track.p;
    for (const r of P.rails) r.geometry.setDrawRange(0, Math.floor(p * P.railSegments) * 6 * 6);
    P.sleepers.count = Math.floor(p * 96);
    P.rails.forEach((r) => { r.visible = p > 0.001; });

    // ---- gull
    const gu = ((S.gullP.u % 1) + 1) % 1;
    const gp = S.gullCurve.getPointAt(gu), tg = S.gullCurve.getTangentAt(gu), tg2 = S.gullCurve.getTangentAt((gu + 0.02) % 1);
    const g = P.gull.root;
    g.position.copy(gp);
    g.rotation.order = 'YXZ';
    const h0 = Math.atan2(tg.z, tg.x), h1 = Math.atan2(tg2.z, tg2.x);
    let turn = h1 - h0;
    turn = Math.atan2(Math.sin(turn), Math.cos(turn));
    g.rotation.set(Math.max(-0.6, Math.min(0.6, -turn * 4)), -h0, Math.asin(Math.max(-1, Math.min(1, tg.y))));

    // ---- smoke puffs: rise, drift downwind, swell, then shrink away
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    S.puffs.forEach((pf, i) => {
      const k = pf.k;
      let s = 0;
      v.set(0, -20, 0);
      if (k > 0 && k < 1 && pf.o) {
        const grow = Math.min(1, k / 0.14), fade = 1 - Math.min(1, Math.max(0, (k - 0.55) / 0.45)) ** 2;
        s = pf.size * (0.55 + 1.3 * k) * grow * fade;
        const up = 1 - (1 - k) * (1 - k);
        v.set(pf.o.x - 0.4 * k, pf.o.y + pf.rise * up, pf.o.z + 0.28 * k);
      }
      m4.compose(v, q, sc.setScalar(s));
      S.puffMesh.setMatrixAt(i, m4);
    });
    S.puffMesh.instanceMatrix.needsUpdate = true;

    // ---- sun on its arc, the light it casts, the sky
    const a = env.sunA * DEG, { R: AR, C: AC } = P.ARC;
    const sx = AC.x, sy = AC.y + AR * Math.sin(a), sz = AC.z + AR * Math.cos(a);
    P.sun.position.set(sx, sy, sz);
    P.sunGlow.position.set(sx, sy, sz);
    P.sunMat.color.set(env.ball); P.sunMat.emissive.set(env.ball);
    const L = Math.hypot(sx, sy, sz);
    S.sunLight.position.set((sx / L) * 26, (sy / L) * 26, (sz / L) * 26);
    S.sunLight.intensity = env.sunI;
    S.sunLight.color.set(env.sunC);
    S.hemi.color.set(env.hemiSky); S.hemi.groundColor.set(env.hemiGround); S.hemi.intensity = env.hemiI;
    P.beamMat.opacity = env.beam;
    P.lanternMat.emissiveIntensity = env.lamp;
    const gr = S.skyX.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, env.top); gr.addColorStop(0.58, env.mid); gr.addColorStop(1, env.low);
    S.skyX.fillStyle = gr;
    S.skyX.fillRect(0, 0, 4, 256);
    S.skyTex.needsUpdate = true;

    // ---- overlay clock (10-minute steps)
    const m = Math.floor(S.clock.m / 10) * 10, hh = Math.floor(m / 60), mm = m % 60;
    const txt = `${hh < 12 ? '오전' : '오후'} ${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')}`;
    if (S.clockEl.textContent !== txt) S.clockEl.textContent = txt;

    S.renderer.render(S.scene, S.camera);
  },
});
