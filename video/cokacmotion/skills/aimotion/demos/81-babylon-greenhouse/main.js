/*
 * 81 · 아침의 온실 — Babylon.js built-ins only (no custom shaders): PBR glass, painted-metal frames, a directional sun
 * with a PCF ShadowGenerator, a hemispheric fill, an image-based-lighting cube made in JS, GlowLayer dew sparkles,
 * volumetric light scattering (god rays) from the sun disc, and the DefaultRenderingPipeline's bloom + FXAA.
 *
 * Every state is set from t, then engine.beginFrame(); scene.render(); engine.endFrame() — never runRenderLoop.
 * scene.animationsEnabled = false and render(…, ignoreAnimations = true): nothing advances on Babylon's own clock.
 * Plants: the fern's fronds are rebuilt on the CPU from t (curvature integration), the pilea/seedling leaves are
 * thin instances whose matrices come from t, dew is two SolidParticleSystems placed from seeded data.
 */
import { defineDemo, clamp, lerp, smooth, ramp, track, ease } from '../_lib/stage.js';
import {
  V, lin, G, VENT_GEOM, makeMaterials, makeEnvironment, makeSky, makeSun, makeBackdrop, makeTable, makeGreenhouse,
  makePots, makeMoss, makeSpiderPlant, makeFern, makeOutdoorPlants, makeDew, makeButterfly,
} from './world.js';

const B = window.BABYLON;
const D = 9.5;
const DEG = Math.PI / 180;

// ---------------------------------------------------------------- the story as functions of t
// sun: rises behind the tree line (≈6–8° above the camera's horizon), climbs past the roof of the case
const sunEl = (t) => (2 + 12.5 * Math.pow(t / D, 1.1)) * DEG;  // elevation 2° → 14.5°
const sunAz = (t) => (-4 + 11 * (t / D)) * DEG;                           // drifts right (−z = east)
const sunVis = (t) => ramp(t, 2.4, 4.8);                                  // clears the tree tops
const dayK = (t) => smooth(t / D);                                        // dawn → morning colour blend
const ventAngle = (t) => 32 * DEG * ease.inOutCubic(clamp((t - 5.2) / 1.8));  // the pane swings open
const mist = (t) => 1 - ramp(t, 2.0, 7.0);                                // condensation on the glass clears
const vlsExposure = track([[0, 0.05], [2.5, 0.12], [5.0, 0.3], [6.6, 0.3], [D, 0.2]]);  // god-ray strength
const glowK = track([[0, 0.45], [4.6, 1.05], [6.5, 1.15], [D, 0.75]]);

// camera: Hermite spline through keys (starts from rest, ends at rest, velocity continuous at the inner keys)
const CAM = [  // [t, position, target]
  [0.0, [-0.55, 0.92, 2.55], [-0.15, 1.05, 0.0]],
  [3.4, [-0.18, 1.10, 4.25], [-0.05, 1.24, 0.0]],
  [5.8, [0.33, 1.30, 5.30], [0.05, 1.38, 0.0]],
  [D, [0.70, 1.55, 4.75], [0.20, 1.62, 0.15]],
];
function hermite(keys, idx, t) {
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0][idx].slice();
  if (t >= keys[n - 1][0]) return keys[n - 1][idx].slice();
  let i = 0;
  while (t > keys[i + 1][0]) i++;
  const t0 = keys[i][0], t1 = keys[i + 1][0], h = t1 - t0, u = (t - t0) / h;
  const p0 = keys[i][idx], p1 = keys[i + 1][idx];
  const tan = (j) => {
    if (j === 0 || j === n - 1) return p0.map(() => 0);
    const a = keys[j - 1], b = keys[j + 1];
    return a[idx].map((v, k) => (b[idx][k] - v) / (b[0] - a[0]));
  };
  const m0 = tan(i), m1 = tan(i + 1);
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  return p0.map((v, k) => h00 * v + h10 * h * m0[k] + h01 * p1[k] + h11 * h * m1[k]);
}

// butterfly: flies in from the left at 1.5 s, loops past the glass and over the roof, lands on the open vent at 7.6 s
const T_LAND = 7.6;
const rotX = (b, [x, y, z]) => [x, y * Math.cos(b) - z * Math.sin(b), y * Math.sin(b) + z * Math.cos(b)];
const LAND = (() => {
  const phi = 32 * DEG;
  const nrm = VENT_GEOM.nrm, dn = VENT_GEOM.dn;
  const local = [0.07, dn[1] + nrm[1] * 0.047, dn[2] + nrm[2] * 0.047];
  const p = rotX(-phi, local);
  return [(G.VENT[0] + G.VENT[1]) / 2 + p[0], G.YR + p[1], p[2]];
})();
const BF = [  // flight knots [t, x, y, z]
  [1.5, -2.7, 2.30, 2.50], [2.2, -1.5, 1.80, 2.05], [2.9, -0.65, 1.30, 1.80], [3.6, 0.25, 1.42, 2.00],
  [4.3, 1.0, 1.85, 1.75], [5.0, 1.15, 2.50, 1.05], [5.7, 0.5, 2.85, 0.95], [6.4, -0.25, 2.60, 1.30],
  [7.05, 0.05, 2.25, 1.35], [T_LAND, ...LAND],
].map(([t, x, y, z]) => [t, [x, y, z]]);
function bflyPos(t) {
  let p = hermite(BF, 1, t);
  // the first segment is straight and at speed (the butterfly is already flying when it enters the frame)
  if (t < BF[1][0]) {
    const [t0, a] = BF[0], [t1, b] = BF[1];
    const u = (t - t0) / (t1 - t0);
    p = a.map((v, k) => lerp(v, b[k], u));
  }
  // flutter, fading out on the approach to the landing
  const w = 1 - ramp(t, 6.9, T_LAND - 0.04);
  p[1] += w * (0.035 * Math.sin(2 * Math.PI * 2.3 * t + 1.0) + 0.012 * Math.sin(2 * Math.PI * 5.5 * t + Math.PI / 2));
  p[0] += w * 0.03 * Math.sin(2 * Math.PI * 1.7 * t);
  p[2] += w * 0.025 * Math.sin(2 * Math.PI * 1.3 * t + 2.0);
  return p;
}
const angLerp = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };

// colours (display space for the sky, linear for lights)
const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const SKY = {  // dawn → morning palette
  zen: [[0.40, 0.48, 0.66], [0.50, 0.68, 0.88]],
  hor: [[0.98, 0.73, 0.62], [0.99, 0.91, 0.80]],
  glow: [[0.95, 0.52, 0.22], [0.75, 0.62, 0.42]],
};
const toLin = (c) => c.map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));

defineDemo({
  id: '81-babylon-greenhouse',
  title: '아침의 온실',
  tech: 'Babylon.js · PBR 유리 · 그림자 생성기(PCF) · GlowLayer · 부피광 산란',
  duration: D,
  background: '#d9d4c4',
  async setup({ stage, layer }) {
    // ---------------- engine on a context-less canvas
    const canvas = layer('canvas', { z: 0 });
    canvas.width = 1080;
    canvas.height = 1920;
    canvas.style.pointerEvents = 'none';
    const engine = new B.Engine(canvas, true, {
      preserveDrawingBuffer: true, stencil: true, premultipliedAlpha: false, alpha: false,
      doNotHandleContextLost: true, powerPreference: 'high-performance', audioEngine: false,
    }, false);
    engine.setHardwareScalingLevel(1);
    engine.setSize(1080, 1920);
    const scene = new B.Scene(engine);
    scene.animationsEnabled = false;          // no Animatables on Babylon's delta time
    scene.useConstantAnimationDeltaTime = true;
    scene.skipPointerMovePicking = true;
    if (scene.detachControl) scene.detachControl();
    scene.clearColor = new B.Color4(0.95, 0.85, 0.75, 1);
    scene.fogMode = B.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.0085;  // morning haze on the tree line

    const cam = new B.TargetCamera('cam', V(0, 1.2, 5), scene);
    cam.fov = 0.95;                           // vertical, ≈54°
    cam.minZ = 0.03;
    cam.maxZ = 1500;

    // ---------------- image processing (in the materials; the post chain stays LDR)
    const ip = scene.imageProcessingConfiguration;
    ip.toneMappingEnabled = true;
    ip.toneMappingType = B.ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL;
    ip.exposure = 1.0;
    ip.contrast = 1.08;
    ip.vignetteEnabled = true;
    ip.vignetteWeight = 1.25;
    ip.vignetteStretch = 0.35;
    ip.vignetteCameraFov = cam.fov;
    ip.vignetteColor = new B.Color4(0.22, 0.17, 0.12, 0);

    // ---------------- lights
    const sun = new B.DirectionalLight('sun', V(0, -0.1, 1), scene);
    sun.autoUpdateExtends = false;
    sun.autoCalcShadowZBounds = false;
    sun.shadowFrustumSize = 6.4;              // fixed ortho box around the case → no shimmer as things move
    sun.shadowMinZ = 15;
    sun.shadowMaxZ = 45;
    const hemi = new B.HemisphericLight('hemi', V(0, 1, 0), scene);
    hemi.specular = B.Color3.Black();
    hemi.groundColor = lin('#8c7a63');

    // ---------------- world
    const M = makeMaterials(scene);
    makeEnvironment(scene);
    const sky = makeSky(scene);
    const sunMesh = makeSun(scene);
    const backdrop = makeBackdrop(scene, M);
    const table = makeTable(scene);
    const gh = makeGreenhouse(scene, M);
    const pots = makePots(scene, M);
    const moss = makeMoss(scene, M);
    const spider = makeSpiderPlant(scene, M, 0.52, pots.spider.soilY + 0.01, -0.2);
    const fern = makeFern(scene, M, -0.45, pots.fern.soilY + 0.005, 0.06);
    const outdoor = makeOutdoorPlants(scene, M, pots.pilea, pots.seed);
    const dew = makeDew(scene, M);
    const bfly = makeButterfly(scene, M);

    // ---------------- soft PCF shadows from the sun
    const sg = new B.ShadowGenerator(2048, sun);
    sg.usePercentageCloserFiltering = true;
    sg.filteringQuality = B.ShadowGenerator.QUALITY_HIGH;
    sg.bias = 0.0003;
    sg.normalBias = 0.015;
    sg.darkness = 0;
    const casters = [...gh.casters, ...pots.casters, moss, spider, fern.mesh, ...outdoor.casters, ...bfly.casters];
    for (const c of casters) sg.addShadowCaster(c, false);
    const receivers = [table.top, ...gh.receivers, ...pots.receivers, moss, spider, fern.mesh, ...outdoor.receivers];
    for (const r of receivers) r.receiveShadows = true;

    // ---------------- dew sparkle glow (only emissive things glow; glass and sky stay out of the glow map)
    const glow = new B.GlowLayer('glow', scene, { mainTextureRatio: 0.5, blurKernelSize: 40 });
    glow.intensity = 1.0;
    for (const m of [sky.sky, sunMesh.disc, sunMesh.halo, ...gh.glass]) glow.addExcludedMesh(m);

    // ---------------- god rays from the sun disc (frames, plants and trees occlude; glass lets light through)
    const vls = new B.VolumetricLightScatteringPostProcess('vls', { postProcessRatio: 1.0, passRatio: 0.5 }, cam, sunMesh.disc, 90,
      B.Texture.BILINEAR_SAMPLINGMODE, engine, false);
    vls.excludedMeshes = [sky.sky, sunMesh.halo, ...gh.glass];
    vls.decay = 0.968;
    vls.weight = 0.56;
    vls.density = 0.93;
    vls.samples = 4;                          // MSAA on the scene target (this pass is first in the chain)

    // ---------------- bloom + FXAA (image processing stays in the materials)
    const pipe = new B.DefaultRenderingPipeline('pipe', false, scene, [cam]);
    pipe.imageProcessingEnabled = false;
    pipe.fxaaEnabled = true;
    pipe.bloomEnabled = true;
    pipe.bloomThreshold = 0.86;
    pipe.bloomWeight = 0.28;
    pipe.bloomKernel = 64;
    pipe.bloomScale = 0.5;

    // ---------------- caption band (the white caption needs a darker ground on a bright picture)
    const band = document.createElement('div');
    band.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:420px;z-index:500;pointer-events:none;' +
      'background:linear-gradient(to bottom, rgba(36,30,22,0) 0%, rgba(36,30,22,0.38) 45%, rgba(30,25,18,0.62) 100%)';
    stage.appendChild(band);

    // ---------------- per-frame state from t
    const tgt = V(0, 0, 0), sdir = V(0, 0, 0), tmp = V(0, 0, 0);
    const glassAlbedo = lin('#e9f5f0'), mistAlbedo = lin('#f6f7f3');
    const draw = (t) => {
      const k = dayK(t), vis = sunVis(t);
      // sun direction (toward the sun)
      const el = sunEl(t), az = sunAz(t);
      sdir.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
      // camera
      const cp = hermite(CAM, 1, t), ct = hermite(CAM, 2, t);
      cam.position.set(cp[0], cp[1], cp[2]);
      tgt.set(ct[0], ct[1], ct[2]);
      cam.setTarget(tgt);
      // sun light + shadow frustum centred on the case
      sun.direction.set(-sdir.x, -sdir.y, -sdir.z);
      sun.position.set(0 + sdir.x * 30, 1.0 + sdir.y * 30, 0.8 + sdir.z * 30);
      sun.intensity = 0.45 + 3.3 * vis;
      const sc = mix3([1.0, 0.55, 0.30], [1.0, 0.88, 0.72], k);
      sun.diffuse.set(sc[0], sc[1], sc[2]);
      sun.specular.set(sc[0], sc[1], sc[2]);
      hemi.intensity = 0.55 + 0.35 * k;
      const hc = mix3([0.66, 0.72, 0.95], [0.80, 0.88, 1.0], k);
      hemi.diffuse.set(hc[0], hc[1], hc[2]);
      scene.environmentIntensity = 0.65 + 0.4 * k;
      ip.exposure = 1.04 + 0.1 * k;
      // sky, fog, sun disc and halo
      const zen = mix3(SKY.zen[0], SKY.zen[1], k), hor = mix3(SKY.hor[0], SKY.hor[1], k);
      const gl = mix3(SKY.glow[0], SKY.glow[1], k).map((v) => v * (0.55 + 0.45 * vis));
      sky.update({ zen, hor, low: hor.map((v) => v * 0.86), glow: gl, s: sdir });
      const fog = toLin(mix3(hor, zen, 0.3));
      scene.fogColor.set(fog[0], fog[1], fog[2]);
      tmp.copyFrom(sdir).scaleInPlace(420).addInPlace(cam.position);
      sunMesh.disc.position.copyFrom(tmp);
      const sr = 8.4 * (1 + 0.25 * (1 - k));
      sunMesh.disc.scaling.set(sr, sr, sr);
      const dc = mix3([1.0, 0.66, 0.36], [1.0, 0.96, 0.88], k);
      sunMesh.discMat.emissiveColor.set(dc[0], dc[1], dc[2]);
      tmp.copyFrom(sdir).scaleInPlace(440).addInPlace(cam.position);
      sunMesh.halo.position.copyFrom(tmp);
      sunMesh.halo.scaling.set(150, 150, 150);
      sunMesh.haloTex.level = 0.5 + 0.55 * vis;
      // glass condensation clears as the sun warms the case
      const m = mist(t);
      M.glass.roughness = 0.05 + 0.25 * m;
      M.glass.alpha = 0.13 + 0.17 * m;
      M.glass.albedoColor.set(lerp(glassAlbedo.r, mistAlbedo.r, m), lerp(glassAlbedo.g, mistAlbedo.g, m), lerp(glassAlbedo.b, mistAlbedo.b, m));
      // vent
      gh.pivot.rotation.x = -ventAngle(t);
      // plants
      fern.update(t);
      outdoor.update(t);
      // butterfly
      const on = t >= BF[0][0];
      bfly.root.setEnabled(on);
      if (on) {
        const p = bflyPos(t);
        bfly.root.position.set(p[0], p[1], p[2]);
        const tc = (u) => clamp(u, BF[0][0], T_LAND);
        const a = bflyPos(tc(t - 0.03)), b = bflyPos(tc(t + 0.03));
        const vx = b[0] - a[0], vy = b[1] - a[1], vz = b[2] - a[2];
        const moving = Math.abs(vx) + Math.abs(vz) > 1e-5;
        const land = ramp(t, 7.15, T_LAND);
        const yaw = angLerp(moving ? Math.atan2(vx, vz) : Math.PI / 2, Math.PI / 2, land);
        const pitch = (1 - land) * -Math.atan2(vy, Math.hypot(vx, vz) + 1e-6) * 0.6;
        const yawAt = (u) => { const c = bflyPos(tc(u - 0.03)), d = bflyPos(tc(u + 0.03)); return Math.atan2(d[0] - c[0], d[2] - c[2]); };
        const turn = angLerp(0, yawAt(t + 0.1) - yawAt(t - 0.1), 1);
        const roll = (1 - land) * clamp(-turn * 1.2, -0.5, 0.5);
        bfly.root.rotation.set(pitch, yaw, roll);
        // wings: fast flapping with glides in flight, slow basking once perched
        const glide = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.8 * t));
        const flap = 0.45 + 0.9 * glide * Math.sin(2 * Math.PI * 5.5 * t);
        const perch = 0.45 + 0.9 * (0.5 + 0.5 * Math.cos(2 * Math.PI * 0.4 * Math.max(0, t - T_LAND)));
        const wa = lerp(flap, perch, ramp(t, T_LAND - 0.25, T_LAND));
        bfly.wingR.rotation.z = wa;
        bfly.wingL.rotation.z = -wa;
      }
      // dew
      dew.update(t, { sunOn: vis * (1 - 0.3 * ramp(t, 8.0, D)), evap: ramp(t, 6.5, D), cam: cam.position, sun: sdir,
        warm: mix3([1.0, 0.78, 0.55], [1.0, 0.95, 0.86], k) });
      // post
      vls.exposure = vlsExposure(t);
      glow.intensity = glowK(t);
      pipe.bloomWeight = 0.2 + 0.14 * vis;
      engine.beginFrame();
      scene.render(true, true);
      engine.endFrame();
    };
    this.draw = draw;

    // compile everything (materials, shadow/glow/god-ray passes, post-processes) before the first real frame
    const times = [0, 4.6, 7.9, 2.0, 6.2, D];
    for (let i = 0, ok = 0; i < 14 && ok < 2; i++) {
      draw(times[i % times.length]);
      await scene.whenReadyAsync(true);
      ok = engine.areAllEffectsReady() && scene.isReady(true) ? ok + 1 : 0;
    }
  },
  frame(t) {
    this.draw(t);
  },
});
