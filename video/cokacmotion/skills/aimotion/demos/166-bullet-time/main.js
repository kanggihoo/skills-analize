/*
 * 166 · 물풍선이 멈춘 순간 — bullet time: scene time and camera time are separate clocks.
 *
 *   clock.js  scene time τ(t): a rate curve dτ/dt (1 → 0.035 → 0.0008 → 0.06 → 1) integrated in closed form
 *   burst.js  the balloon, its water, the tearing rubber and every drop as closed forms of τ
 *   yard.js   the backyard (lawn, fence, trees, glints, hose, sprinkler)
 *   post.js   opaque pass → refraction copy → water pass → half-res depth of field → grade + chip
 *   main.js   the camera rail (camera time t), focus, light, the two-clock chip, frame(t)
 *
 * Everything physical (the fall, the rip, drops, grass, leaf glints) reads τ; the camera, focus and chip read t.
 * While τ crawls at 0.0008 s per second, the camera travels a spline through nine virtual camera positions at an
 * eased speed along its arc length — the camera-array look of a frozen moment.
 */
import * as THREE from 'three';
import { defineDemo, rand, clamp, lerp, smooth, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { tau, sceneClock, rate, span, FREEZE } from './clock.js';
import { buildYard, makeSky, updateGlints, SPR } from './yard.js';
import { createBurst, cy, vy, Y_B, TAU_GROUND, spreadAt } from './burst.js';
import { createPipeline, waterMaterial } from './post.js';

const D = 10, SW = 1080, SH = 1920, DEG = Math.PI / 180;
const ACCENT = '#ff7a2e', INK = '#33423a';
const SUN = new THREE.Vector3(-0.35, 0.62, -1.0).normalize();   // toward the sun: behind the burst at mid-orbit
const FOV = 40, FNUM = 2.0, SENSOR = 36;                         // a 49.5 mm lens on a 36 mm-tall frame, at f/2

// ---------------------------------------------------------------- the camera rail: nine virtual cameras on an arc
const NCAM = 9, A0 = -100, A1 = 95;
const RAIL_PTS = Array.from({ length: NCAM }, (_, i) => {
  const u = i / (NCAM - 1), a = lerp(A0, A1, u) * DEG;
  const r = lerp(1.08, 0.8, smooth(u)), y = 0.355 + 0.05 * Math.sin(Math.PI * u) - 0.012 * u;
  return new THREE.Vector3(r * Math.sin(a), y, r * Math.cos(a));
});
const LOOK_Y = 0.25;                                              // look-at (on the spike's axis, just under the burst)
const T_ORB = [2.2, 6.85], ORB_IN = 1.0, ORB_OUT = 1.25;          // orbit window and its ramp lengths (s)

// eased arc length: the speed ramps up and down along smoothsteps, so s(t) is a closed-form integral
const S_ = (u) => u * u * (3 - 2 * u), SI = (u) => u * u * u - 0.5 * u * u * u * u;
function orbitFrac(t) {
  const [t0, t1] = T_ORB, T = t1 - t0, V = 1 / (T - (ORB_IN + ORB_OUT) / 2);   // V·(T − ramps/2) = 1
  const x = clamp(t - t0, 0, T);
  if (x <= ORB_IN) return V * ORB_IN * SI(x / ORB_IN);
  const a = V * ORB_IN / 2;
  if (x <= T - ORB_OUT) return a + V * (x - ORB_IN);
  const y = T - x;                                                 // mirror: distance left to the end
  return 1 - V * ORB_OUT * SI(y / ORB_OUT);
}

// chip text: digits on a fixed advance (canvas has no tabular figures)
function drawNum(g, str, xRight, y, big, small) {
  const adv = big * 0.6;
  let x = xRight;
  g.font = `600 ${small}px "Pretendard Variable"`;
  const unit = '초';
  x -= g.measureText(unit).width;
  g.fillText(unit, x, y);
  x -= 4;
  g.font = `700 ${big}px "Pretendard Variable"`;
  for (let i = str.length - 1; i >= 0; i--) {
    const ch = str[i], w = ch === '.' ? big * 0.28 : adv;
    x -= w;
    g.fillText(ch, x + (w - g.measureText(ch).width) / 2, y);
  }
}

const OV = { x: 40, y: 64, w: 560, h: 420 };

defineDemo({
  id: '166-bullet-time',
  title: '물풍선이 멈춘 순간',
  tech: '불릿 타임 · 장면 시간 τ(t)와 카메라 시간 분리 + 카메라 레일',
  duration: D,
  background: '#e9efe4',

  async setup(api) {
    const HL = api.headless;
    await fontReady('700 40px "Pretendard Variable"', '0123456789.초');
    await fontReady('600 26px "Pretendard Variable"', '장면 시간카메라×0123456789.대순서로재생된한순간동안');

    // ---------------------------------------------------------------- renderer
    const el = api.layer('canvas', { z: 0 });
    el.width = SW; el.height = SH;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(SW, SH, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x000000, 1);

    // ---------------------------------------------------------------- scene: sky, yard, light
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(new THREE.Color('#e7ead9'), 7, 34);
    scene.add(makeSky(SUN));
    const R = rand(1660);
    const yard = buildYard(R, { headless: HL, envMap: null });
    scene.add(yard.group);
    const hemi = new THREE.HemisphereLight(0xdcebf7, 0x5f8a45, 1.25);
    const sun = new THREE.DirectionalLight(0xfff0d8, 3.1);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536);
    Object.assign(sun.shadow.camera, { left: -0.55, right: 0.55, top: 0.55, bottom: -0.55, near: 0.5, far: 9 });
    sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.004; sun.shadow.radius = 5;
    sun.target.position.set(0, 0.12, 0);
    sun.position.copy(sun.target.position).addScaledVector(SUN, 4.5);
    scene.add(hemi, sun, sun.target);

    // ---------------------------------------------------------------- the yard as seen from the burst: reflections
    // one prefiltered environment (PMREM) rendered from the burst point: the rough materials read its blurred mips,
    // the water reads its sharpest level
    yard.spr.visible = false;
    yard.blades.visible = false;                       // the lawn texture is enough in a reflection
    updateGlints(yard.glints, 0);
    renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(scene, 0, 0.05, 80, { size: 128, position: new THREE.Vector3(0, Y_B, 0) }).texture;
    pmrem.dispose();
    renderer.shadowMap.autoUpdate = true;
    yard.spr.visible = true;
    yard.blades.visible = true;
    renderer.autoClear = false;                        // from here on the pipeline clears what it needs
    yard.group.traverse((o) => { if (o.material && o.material.isMeshStandardMaterial) { o.material.envMap = envMap; o.material.needsUpdate = true; } });

    // ---------------------------------------------------------------- the balloon
    const burst = createBurst(rand(16601));
    const rubberMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#ff5a12'), roughness: 0.4, metalness: 0, side: THREE.DoubleSide, envMap, envMapIntensity: 0.9 });
    const rubU = { uSunView: { value: new THREE.Vector3() }, uGlow: { value: new THREE.Color('#ff7a2e').multiplyScalar(1.6) } };
    rubberMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, rubU);
      sh.fragmentShader = 'uniform vec3 uSunView; uniform vec3 uGlow;\n' + sh.fragmentShader
        .replace('#include <color_fragment>', `#include <color_fragment>
          if (!gl_FrontFacing) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.98, 0.62, 0.42), 0.5);   // the chalky inside of the skin`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          {   // thin rubber glows when the sun is behind it
            vec3 vv = normalize(vViewPosition);
            float bl = pow(clamp(dot(-vv, uSunView), 0.0, 1.0), 3.0);
            totalEmissiveRadiance += uGlow * bl * (0.35 + 0.65 * (1.0 - abs(dot(normalize(vNormal), vv))));
          }`);
    };
    const rubber = new THREE.Mesh(burst.rubberGeo, rubberMat);
    rubber.castShadow = true; rubber.receiveShadow = true; rubber.frustumCulled = false;
    const knotPts = [[0.0, -0.002], [0.0042, -0.001], [0.0036, 0.004], [0.0026, 0.007], [0.0052, 0.010], [0.0058, 0.0135], [0.0042, 0.0165], [0.0, 0.0175]].map(([r, y]) => new THREE.Vector2(r, y));
    const knot = new THREE.Mesh(new THREE.LatheGeometry(knotPts, 20), rubberMat);
    knot.matrixAutoUpdate = false; knot.castShadow = true;
    scene.add(rubber, knot);

    // the water's own shadow and the bright caustic it focuses on the lawn (soft decals; the shader water casts none)
    const decal = (inner, outer, blending) => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d', HL ? { willReadFrequently: true } : undefined);
      const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      rg.addColorStop(0, inner); rg.addColorStop(0.55, inner); rg.addColorStop(1, outer);
      g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
      const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, blending, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      m.rotation.x = -Math.PI / 2;
      scene.add(m);
      return m;
    };
    const wShadow = decal('rgba(30,60,30,0.34)', 'rgba(30,60,30,0)', THREE.NormalBlending);
    const wCaustic = decal('rgba(255,248,220,0.55)', 'rgba(255,248,220,0)', THREE.AdditiveBlending);

    // ---------------------------------------------------------------- post + the water scene
    const ovC = document.createElement('canvas');
    ovC.width = OV.w; ovC.height = OV.h;
    const ovG = ovC.getContext('2d', HL ? { willReadFrequently: true } : undefined);
    const ovTex = new THREE.CanvasTexture(ovC);
    ovTex.colorSpace = THREE.SRGBColorSpace;
    ovTex.minFilter = ovTex.magFilter = THREE.NearestFilter;
    ovTex.generateMipmaps = false;
    const post = createPipeline(renderer, SW, SH, { texture: ovTex, ...OV });
    const wMat = waterMaterial({ env: envMap, back: post.backTex, sunDir: SUN });
    const waterScene = new THREE.Scene();
    const wBody = wMat.clone();                        // the body's own lens strength: it thins to a film on the lawn
    for (const k of ['uEnv', 'uBack', 'uSun', 'uTint', 'uKey']) wBody.uniforms[k] = wMat.uniforms[k];
    const water = new THREE.Mesh(burst.waterGeo, wBody);
    water.frustumCulled = false;
    const wDrops = wMat.clone();                       // drops fade along their exposure streaks
    for (const k of ['uEnv', 'uBack', 'uSun', 'uTint', 'uKey', 'uGlow']) wDrops.uniforms[k] = wMat.uniforms[k];
    wDrops.uniforms.uStreak.value = 1;
    const dropsMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), wDrops, burst.nDrops);
    dropsMesh.frustumCulled = false; dropsMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const stalkG = new THREE.CylinderGeometry(0.5, 1, 1, 8, 1, true);
    stalkG.translate(0, 0.5, 0);
    const stalks = new THREE.InstancedMesh(stalkG, wMat, burst.nLigs);
    stalks.frustumCulled = false; stalks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const wStreak = wDrops.clone();
    for (const k of Object.keys(wDrops.uniforms)) wStreak.uniforms[k] = wDrops.uniforms[k];
    wStreak.depthWrite = false;
    const streaks = new THREE.InstancedMesh(dropsMesh.geometry, wStreak, burst.nDrops);
    streaks.frustumCulled = false; streaks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    streaks.renderOrder = 1;
    waterScene.add(water, dropsMesh, stalks, streaks);

    // ---------------------------------------------------------------- the chip: panels with soft shadows, baked once
    const panel = (w, h, r) => {
      const c = document.createElement('canvas'); c.width = w + 60; c.height = h + 60;
      const g = c.getContext('2d', HL ? { willReadFrequently: true } : undefined);
      g.shadowColor = 'rgba(40, 60, 40, 0.20)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
      g.fillStyle = 'rgba(255, 252, 245, 0.93)';
      g.beginPath(); g.roundRect(30, 26, w, h, r); g.fill();
      return c;
    };
    const chipP = panel(470, 176, 38), planP = panel(470, 132, 34);

    const camera = new THREE.PerspectiveCamera(FOV, SW / SH, 0.02, 120);
    const rail = new THREE.CatmullRomCurve3(RAIL_PTS, false, 'centripetal');
    rail.arcLengthDivisions = 2000;
    // plan view of the rail for the chip (top-down, baked to points)
    const planPts = [];
    for (let i = 0; i <= 80; i++) planPts.push(rail.getPointAt(i / 80));

    Object.assign(this, { renderer, scene, waterScene, camera, rail, yard, burst, rubber, knot, water, dropsMesh, stalks, streaks, wShadow, wCaustic,
      post, wMat, wBody, rubU, sun, ovG, ovTex, chipP, planP, planPts, HL });

    // warm-up: one frame where every program is in use (rubber, water, drops, threads, decals, all passes), then a
    // 1-pixel read waits for the software GPU — the first frame anyone watches pays no compile
    this.frame(2.6);
    const gl = renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  },

  frame(t) {
    const S = this;
    const ta = tau(t), sp = span(t), T = sceneClock(t);

    // ---------------------------------------------------------------- scene time: the yard and the burst
    S.yard.grassU.uTau.value = T;
    updateGlints(S.yard.glints, T);
    const smear = -vy(ta) * sp * 0.5;
    S.water.visible = ta >= 0;
    if (S.water.visible) S.burst.waterWorld(ta, smear);
    S.burst.rubberWorld(ta, smear);
    S.knot.matrix.copy(S.burst.knotMatrix(ta, smear));
    S.knot.matrixWorldNeedsUpdate = true;

    // decals under the bare water: projected along the sun onto the lawn
    {
      const k = ta < 0 ? 0 : smooth(ta / 0.004) * (1 - smooth((ta - TAU_GROUND + 0.01) / 0.03));
      const c = cy(ta), h = c / SUN.y;
      const sx = -SUN.x * h, sz = -SUN.z * h, el = 1 / Math.max(0.3, SUN.y);
      const yaw = Math.atan2(-SUN.x, -SUN.z);
      for (const [m, s, a] of [[S.wShadow, 0.17, 1], [S.wCaustic, 0.07, 1]]) {
        m.visible = k > 0.002;
        m.position.set(sx, 0.002, sz);
        m.rotation.set(-Math.PI / 2, 0, yaw);
        m.scale.set(s, s * el, 1);
        m.material.opacity = k * a;
      }
    }

    // ---------------------------------------------------------------- camera time: the rail
    const cam = S.camera;
    const u = orbitFrac(t);
    const P = S.rail.getPointAt(u);                     // arc-length parameterised: equal u steps = equal distances
    const Pend = RAIL_PTS[NCAM - 1];
    // before the orbit: a slow push in toward the first rail camera
    const pre = 1 - ease.inOutCubic(clamp(t / 2.75));
    P.x += P.x * 0.16 * pre; P.z += P.z * 0.16 * pre; P.y += 0.05 * pre;
    // afterglow: ease back and up to find the splash on the lawn
    const post = smooth((t - 7.1) / 2.6);
    P.x += Pend.x * 0.22 * post; P.z += Pend.z * 0.22 * post; P.y += 0.1 * post;
    // look-at: tilts down with the falling balloon, locked on the burst, then down to the lawn
    const ly = lerp(0.47, LOOK_Y, ease.inOutCubic(clamp((t - 0.6) / 1.3))) - 0.15 * smooth((t - 7.4) / 1.7);
    cam.position.copy(P);
    cam.up.set(0, 1, 0);
    cam.lookAt(0, ly, 0);
    cam.fov = FOV;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);

    S.burst.writeDrops(ta, sp, S.dropsMesh, S.stalks, cam.position, S.streaks);

    // ---------------------------------------------------------------- focus: the thin lens, on the balloon then the splash
    const fwd = new THREE.Vector3();
    cam.getWorldDirection(fwd);
    const fy = lerp(clamp(cy(ta), Y_B - 0.02, 0.62), 0.03, smooth((ta - TAU_GROUND) / 0.12));
    const fp = new THREE.Vector3(0, fy, 0);
    const Sf = Math.max(0.2, fp.sub(cam.position).dot(fwd));
    const f = (SENSOR / 2) / Math.tan((FOV / 2) * DEG), A = f / FNUM;
    const U = S.post.U;
    U.uFocus.value = Sf;
    U.uLens.value = (SH / SENSOR) * A * f / (Sf * 1000 - f);
    U.uMaxCoc.value = 84;
    U.uNear.value = cam.near; U.uFar.value = cam.far;

    // light on the rubber and through the water
    S.rubU.uSunView.value.copy(SUN).transformDirection(cam.matrixWorldInverse);
    S.wMat.uniforms.uGlow.value = 1.2;
    S.wBody.uniforms.uGlow.value = 1.2;
    S.wBody.uniforms.uRefr.value = 0.085 / spreadAt(ta - TAU_GROUND) ** 2;   // lens strength ∝ thickness
    S.wMat.uniforms.uKey.value.set(-0.55, 0.75, 0.45).applyQuaternion(cam.quaternion).normalize();   // a glint light beside the lens

    // a soft pulse on the pop
    S.post.F.uFlash.value = t > 2.0 ? 0.16 * Math.exp(-(t - 2.0) / 0.12) : 0;

    S.drawChip(t, T, u);
    S.post.render(S.scene, S.waterScene, cam);
  },

  // ---------------------------------------------------------------- the two-clock chip (+ the rail plan while orbiting)
  drawChip(t, T, u) {
    const g = this.ovG;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash([]);
    g.clearRect(0, 0, OV.w, OV.h);
    const inK = ease.outBack(clamp((t - 0.3) / 0.55), 1.3), inA = clamp((t - 0.3) / 0.3);
    if (inA <= 0) { this.ovTex.needsUpdate = true; return; }
    const frozen = smooth((t - FREEZE[0] + 0.3) / 0.3) * (1 - smooth((t - FREEZE[1]) / 0.3));
    g.globalAlpha = inA;
    g.translate(0, (1 - inK) * -24);
    g.drawImage(this.chipP, 0, 0);
    const X0 = 30, Y0 = 26;
    const row = (y, label, value, decimals, rateTxt, hot, hand, color) => {
      // dial: one turn per second of its own clock
      const cx = X0 + 48, cy2 = Y0 + y;
      g.lineWidth = 3.5; g.strokeStyle = 'rgba(51,66,58,0.28)';
      g.beginPath(); g.arc(cx, cy2, 23, 0, Math.PI * 2); g.stroke();
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        g.fillStyle = 'rgba(51,66,58,0.35)';
        g.beginPath(); g.arc(cx + Math.sin(a) * 17, cy2 - Math.cos(a) * 17, 1.4, 0, Math.PI * 2); g.fill();
      }
      const ang = hand * Math.PI * 2;
      g.strokeStyle = color; g.lineWidth = 4;
      g.beginPath(); g.moveTo(cx, cy2); g.lineTo(cx + Math.sin(ang) * 16, cy2 - Math.cos(ang) * 16); g.stroke();
      g.fillStyle = color; g.beginPath(); g.arc(cx, cy2, 4, 0, Math.PI * 2); g.fill();
      g.fillStyle = INK; g.textBaseline = 'alphabetic';
      g.font = '600 26px "Pretendard Variable"';
      g.fillText(label, X0 + 88, Y0 + y - 4);
      g.font = '600 21px "Pretendard Variable"';
      g.fillStyle = 'rgba(51,66,58,0.55)';
      g.fillText(rateTxt, X0 + 88, Y0 + y + 24);
      g.fillStyle = hot > 0.01 ? `rgba(${Math.round(lerp(51, 232, hot))},${Math.round(lerp(66, 98, hot))},${Math.round(lerp(58, 30, hot))},1)` : INK;
      drawNum(g, value.toFixed(decimals), X0 + 448, Y0 + y + 14, 40, 24);
    };
    const r = rate(t);
    const rateTxt = (x) => `속도 ×${x >= 0.995 ? '1' : x >= 0.1 ? x.toFixed(2) : x >= 0.01 ? x.toFixed(3) : x.toFixed(4)}`;
    row(48, '장면 시간', T, 4, rateTxt(r), frozen, T, ACCENT);
    row(126, '카메라 시간', t, 2, '속도 ×1', 0, t, INK);

    // the rail plan: nine still cameras around the burst, the one the film is looking through, and its view line
    const pk = smooth((t - 2.15) / 0.4) * (1 - smooth((t - 7.0) / 0.35));
    if (pk > 0.002) {
      g.setTransform(1, 0, 0, 1, 0, 214 + (1 - pk) * 14);
      g.globalAlpha = inA * pk;
      g.drawImage(this.planP, 0, 0);
      const cx = X0 + 96, cz = Y0 + 82, k = 66;
      const pt = (p) => [cx + p.x * k, cz - p.z * k * 0.62];       // top-down, slightly foreshortened
      g.strokeStyle = 'rgba(51,66,58,0.25)'; g.lineWidth = 3;
      g.beginPath();
      this.planPts.forEach((p, i) => { const [x, y] = pt(p); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
      g.stroke();
      for (const p of RAIL_PTS) { const [x, y] = pt(p); g.fillStyle = 'rgba(51,66,58,0.55)'; g.beginPath(); g.arc(x, y, 4.5, 0, Math.PI * 2); g.fill(); }
      const c = this.rail.getPointAt(clamp(u, 0, 1)), [mx, my] = pt(c);
      g.strokeStyle = 'rgba(51,66,58,0.6)'; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(mx, my); g.lineTo(cx, cz); g.stroke();
      g.fillStyle = ACCENT; g.beginPath(); g.arc(cx, cz, 7, 0, Math.PI * 2); g.fill();
      g.fillStyle = INK; g.beginPath(); g.arc(mx, my, 8, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(255,252,245,1)'; g.lineWidth = 3; g.beginPath(); g.arc(mx, my, 8, 0, Math.PI * 2); g.stroke();
      g.fillStyle = INK; g.font = '600 26px "Pretendard Variable"';
      g.fillText('카메라 9대 순서대로', X0 + 196, Y0 + 70);
      g.font = '600 21px "Pretendard Variable"'; g.fillStyle = 'rgba(51,66,58,0.55)';
      g.fillText(`레일 ${Math.round(clamp(u) * 100)}% · 같은 한 순간`, X0 + 196, Y0 + 102);
    }
    // afterglow: what the camera spent on how little scene time
    const sk = smooth((t - 8.75) / 0.45);
    if (sk > 0.002) {
      g.setTransform(1, 0, 0, 1, 0, 214 + (1 - sk) * 14);
      g.globalAlpha = inA * sk;
      g.drawImage(this.planP, 0, 0);
      const dT = sceneClock(FREEZE[1]) - sceneClock(FREEZE[0]);
      g.fillStyle = INK; g.font = '600 26px "Pretendard Variable"';
      g.fillText(`카메라 ${(FREEZE[1] - FREEZE[0]).toFixed(1)}초 동안`, X0 + 34, Y0 + 56);
      g.fillStyle = ACCENT; g.font = '700 34px "Pretendard Variable"';
      g.fillText(`장면은 ${dT.toFixed(4)}초`, X0 + 34, Y0 + 100);
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    this.ovTex.needsUpdate = true;
  },
});
