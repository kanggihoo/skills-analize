/*
 * 164 · 마지막 한 조각 — shot grammar: one staged café table, eleven virtual cameras.
 *
 *   layout.js   the one scene every camera shares (positions, the axis line, the cheat toward the camera side)
 *   shots.js    the shot list as data (lens mm → fov, framing fraction → distance, aim, push-in) and the audits
 *               (180° half-plane, screen direction, eyelines)
 *   story.js    the action on one continuous clock (gaze, lids, reach, the cat); cuts only choose where to look
 *   cast.js     the two characters and the cat;  cafe.js  the set and props;  post.js  thin-lens depth of field
 *   overlay.js  the plan card (axis, half-plane, camera cone, shot size, cutting rhythm)
 *   main.js     (this file) renderer, assembly, the off-screen check for the cat, frame(t)
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { defineDemo, clamp, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { SHOTS, shotIndex, shotPose, applyPose, audit, pointsOffscreen, worldVertices, SENSOR_H, CLINK, DURATION } from './shots.js';
import { charAt, catAt, gazePoint, CAT_GO } from './story.js';
import { buildCharacter, buildCat, castShared } from './cast.js';
import { buildCafe } from './cafe.js';
import { createPost } from './post.js';
import { createOverlay, OVERLAY_GLYPHS } from './overlay.js';
import { CAT_TABLE, MEET } from './layout.js';

const SW = 1080, SH = 1920;

// three's PCF rotates its 5 shadow taps by interleaved-gradient noise of the screen pixel: the dither stays on the
// screen while the scene moves under it, so soft shadow edges crawl during every push-in. A fixed rotation keeps
// the same 5 bilinear taps (≈ 20 filtered texels) and makes the soft edge a pure function of the surface point.
THREE.ShaderChunk.shadowmap_pars_fragment = THREE.ShaderChunk.shadowmap_pars_fragment
  .replaceAll('interleavedGradientNoise( gl_FragCoord.xy ) * PI2', '0.61');
const OVERHEAD = SHOTS.findIndex((s) => s.label === '부감');
const REVEAL = SHOTS.length - 1;

function canvasTex(w, h, draw, headless) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

defineDemo({
  id: '164-shot-coverage',
  title: '마지막 한 조각',
  tech: '숏 문법 · 한 무대 여러 카메라 + 180도 규칙 + 동작에서 자르기',
  duration: DURATION,
  background: '#2a1d17',

  async setup(api) {
    const HL = api.headless;
    await fontReady('800 44px "Pretendard Variable"', OVERLAY_GLYPHS);
    await fontReady('600 22px "Pretendard Variable"', OVERLAY_GLYPHS);

    const el = api.layer('canvas', { z: 0 });
    el.width = SW; el.height = SH;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(SW, SH, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.autoClear = false;
    renderer.setClearColor(new THREE.Color('#2a1d17'), 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#e8cfae', 5.5, 18);
    {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 0.26;
      pmrem.dispose();
    }
    const cafe = buildCafe(scene, HL);
    const shared = castShared();
    const A = buildCharacter('A', shared), B = buildCharacter('B', shared);
    scene.add(A.root, A.world, B.root, B.world);
    const cat = buildCat(shared);
    scene.add(cat.root);

    // the clink: eight short rays, additive, facing the camera (only the big beat gets an impact)
    const sparkTex = canvasTex(256, 256, (g, w) => {
      g.translate(w / 2, w / 2);
      g.strokeStyle = '#fff8ec'; g.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.2;
        g.lineWidth = i % 2 ? 7 : 10;
        const r0 = i % 2 ? 62 : 52, r1 = i % 2 ? 98 : 118;
        g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); g.stroke();
      }
    }, HL);
    const spark = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: sparkTex, color: new THREE.Color(2.2, 2.0, 1.7), transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    spark.renderOrder = 10;
    scene.add(spark);

    const camera = new THREE.PerspectiveCamera(30, SW / SH, 0.05, 30);
    const post = createPost(renderer, SW, SH, SENSOR_H);
    const overlay = createOverlay(HL);

    // ---- audits (see shots.js): the 180° half-plane, screen direction, eyelines, and the cat kept off-screen
    const catHeadAt = (t) => { cat.pose(catAt(t)); return cat.headWorld.clone(); };
    const rows = audit((k, t) => gazePoint(k, t, catHeadAt(t)));
    let hidden = true, firstSeen = null;
    const P = { pos: new THREE.Vector3() };
    for (let t = CAT_GO; t < SHOTS[REVEAL].t0; t += 1 / 60) {
      const i = shotIndex(t);
      shotPose(i, (t - SHOTS[i].t0) / (SHOTS[i].t1 - SHOTS[i].t0), P);
      const cs = catAt(t);
      cat.pose(cs);
      const pts = worldVertices(cat.root, 3);
      // the stolen strawberry rides in the mouth: test a 3 cm shell around it too
      if (cs.hasBerry) for (const [x, y, z] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) pts.push(cat.mouthWorld.clone().add(new THREE.Vector3(x, y, z).multiplyScalar(0.03)));
      if (!pointsOffscreen(P, pts)) { hidden = false; firstSeen ??= t; }
    }
    this.audit = { shots: rows, catHidden: hidden, catFirstSeen: firstSeen };
    window.__audit = this.audit;
    const bad = rows.filter((r) => !(r.axis && r.screen && r.eyes));
    if (bad.length || !hidden) console.warn('coverage audit', JSON.stringify(this.audit));

    Object.assign(this, { renderer, scene, camera, cafe, A, B, cat, spark, post, overlay, P: { pos: new THREE.Vector3() }, PP: { pos: new THREE.Vector3() } });

    // pay shader compilation and texture upload in setup: compile with every object visible (some only appear late),
    // then draw the busiest moment once and wait for the GPU
    const hiddenObjs = [], culled = [];
    scene.traverse((o) => {
      if (!o.visible) { hiddenObjs.push(o); o.visible = true; }
      if (o.frustumCulled) { culled.push(o); o.frustumCulled = false; }
      if (o.material) for (const m of [].concat(o.material)) for (const k of ['map', 'emissiveMap']) if (m[k]) renderer.initTexture(m[k]);
    });
    renderer.setRenderTarget(post.sceneRT);
    renderer.compile(scene, camera);
    // the software GPU also compiles each draw state the first time it is really drawn: draw every object once into a
    // 16×16 corner (culling off), so no later frame pays for an object it shows for the first time
    shotPose(0, 0.5, this.P);
    applyPose(camera, this.P);
    post.sceneRT.viewport.set(0, 0, 16, 16);
    renderer.setRenderTarget(post.sceneRT);
    renderer.render(scene, camera);
    post.sceneRT.viewport.set(0, 0, SW, SH);
    renderer.setRenderTarget(null);
    for (const o of hiddenObjs) o.visible = false;
    for (const o of culled) o.frustumCulled = true;
    this.frame(6.55);
    const gl = renderer.getContext(), px = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
  },

  frame(t) {
    const S = this;
    const i = shotIndex(t), s = SHOTS[i];
    const u = clamp((t - s.t0) / (s.t1 - s.t0));
    shotPose(i, u, S.P);
    // a small decaying shake at the hit, in the overhead only
    const hk = t > CLINK ? Math.exp(-(t - CLINK) / 0.07) : 0;
    applyPose(S.camera, S.P, 0.006 * hk * Math.sin((t - CLINK) * 95), 0.004 * hk * Math.cos((t - CLINK) * 83));
    S.camera.near = Math.max(0.03, Math.min(0.4, S.P.focus * 0.12));
    S.camera.far = 30;
    S.camera.updateProjectionMatrix();

    // the cat and the strawberry
    const cs = catAt(t);
    S.cat.pose(cs);
    const berry = S.cafe.berry;
    if (cs.hasBerry) {
      berry.position.copy(S.cat.mouthWorld);
      const q = S.cat.head.getWorldQuaternion(new THREE.Quaternion());
      berry.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.25, 0.0, Math.PI / 2 + 0.3)));
      berry.rotateX(0.12 * cs.chew);
    } else {
      berry.position.copy(S.cafe.berryRest);
      berry.quaternion.copy(S.cafe.berryRestQ);
    }
    S.cafe.juice.visible = cs.hasBerry;

    // the two characters
    const cA = charAt('A', t, S.cat.headWorld), cB = charAt('B', t, S.cat.headWorld);
    S.A.pose(cA);
    S.B.pose(cB);

    // the clink
    const ks = (t - CLINK) / 0.3;
    S.spark.visible = ks >= 0 && ks < 1;
    if (S.spark.visible) {
      S.spark.position.copy(MEET).add(new THREE.Vector3(0, 0.012, 0));
      S.spark.quaternion.copy(S.camera.quaternion);
      S.spark.scale.setScalar(0.035 + 0.06 * ease.outCubic(ks));
      S.spark.material.opacity = (1 - ks) * (1 - ks);
    }

    // lens + plan card + render
    S.post.setLens({ f: s.f, N: s.N, focus: S.P.focus, near: S.camera.near, far: S.camera.far, ev: s.ev || 0 });
    const prevP = i > 0 ? shotPose(i - 1, 1, S.PP) : null;
    S.overlay.draw({ t, i, P: S.P, prevP, gaze: { A: cA.gaze, B: cB.gaze }, berry: i < OVERHEAD, cat: i >= REVEAL ? CAT_TABLE : null });
    S.renderer.setRenderTarget(null);
    S.renderer.clear();
    S.post.render(S.scene, S.camera, S.overlay.scene, S.overlay.ortho);
  },
});
