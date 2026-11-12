/*
 * 151 · 장난감 마을의 아침 — a real town read as a toy: high camera, a thin-lens depth of field exaggerated to model
 * scale, saturated colour and a world that moves in sped-up, held steps.
 *
 *   town.js   the diorama in code (instanced rounded-box houses, faceted trees, vehicles, people, the tram) and the
 *             baked traffic (car-following with a signal)
 *   dof.js    the depth-of-field pass chain (CoC from depth, half-res Vogel gather with near/far fields kept apart)
 *   main.js   time (hold frames + timelapse clock), camera, focus pulls, sunrise, everything placed from t
 *
 * Two clocks: the WORLD (traffic, people, sun, windows) is quantised to STEP_HZ and runs through a timelapse speed
 * curve; the LENS (camera, focus) is continuous — the viewer's eye glides over a world that ticks.
 */
import * as THREE from 'three';
import { defineDemo, rand, clamp, lerp, smooth, ease, track } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { buildTown, bakeTraffic, VTYPES, signalState, PAL, LAY } from './town.js';
import { createDof } from './dof.js';

const D = 9;
const SW = 1080, SH = 1920;
const DEG = Math.PI / 180;

// ---------------------------------------------------------------- time: hold frames + timelapse
const STEP_HZ = 15;                                        // the world advances 15×/s: every state is held for 2 frames at 30 fps
const tq = (t) => Math.floor(t * STEP_HZ + 1e-6) / STEP_HZ;
// timelapse speed: world seconds per screen second (piecewise linear), integrated in closed form → world clock W(t)
const SPEED = [[0, 4.0], [2.0, 4.0], [4.5, 3.0], [6.0, 1.4], [D, 1.4]];
function worldClock(t) {
  let W = 0;
  for (let i = 1; i < SPEED.length; i++) {
    const [ta, va] = SPEED[i - 1], [tb, vb] = SPEED[i];
    if (t <= ta) break;
    const x = Math.min(t, tb) - ta, k = (vb - va) / (tb - ta);
    W += va * x + 0.5 * k * x * x;
  }
  return W;
}

// ---------------------------------------------------------------- story (screen seconds)
const T_RACK0 = 5.0, T_RACK1 = 6.6;                      // the rack focus: middle street → tram stop
const T_IN = 4.3, T_STOP = 6.55, X_STOP = -5.0, BRAKE = 30;   // tram: braking run of BRAKE m ending at X_STOP
const T_DOORS = 6.95, T_BOARD = 7.15;
const linear = (p) => p;
const OV = { x: 40, y: 80, w: 480, h: 300 };                 // the overlay canvas on the stage

// sky: sun elevation (deg) and the wall clock, read at the quantised time
const sunEl = track([[0, 3.2], [1.6, 4.2, linear], [5.3, 30, ease.inOutCubic], [D, 36, linear]]);
const clockMin = track([[0, 6 * 60 + 9], [1.6, 6 * 60 + 21, linear], [5.3, 7 * 60 + 31, linear], [D, 7 * 60 + 47, linear]]);
const SUN_AZ = 50 * DEG;                                   // from the back left: shadows fall toward the lower right

// camera rig (continuous t): target, distance, elevation, azimuth
const camTgt = track([[0, [-1.2, 0, 6.0]], [5.0, [0.2, 0, 8.0], linear], [6.8, [-2.8, 0, 13.6]], [D, [-3.9, 0, 16.0], ease.inOutCubic]]);
const camDist = track([[0, 96], [5.0, 91, linear], [6.8, 80], [D, 88, ease.inOutCubic]]);
const camEl = track([[0, 41.0], [5.0, 42.0, linear], [6.8, 43.0], [D, 53.0, ease.inOutCubic]]);
const camAz = track([[0, -3.0], [5.0, 1.5, linear], [D, 3.5, ease.inOutCubic]]);
const FOV = 42;

// lens: a 1:K model shot with a full-frame camera (36 mm tall in portrait) at f/N
const LENS = { K: 160, N: 1.6, SENSOR_H: 36, MAX_COC: 72 };
const P_MID = new THREE.Vector3(1.0, 0.6, 0.0);            // focus target 1: the middle street
const P_STOP = new THREE.Vector3(X_STOP, 1.6, LAY.TRAM_Z + 0.4);   // focus target 2: the tram at the stop
// focus as a multiple of the target's diopters: a short hunt at the start (1.72 = focused at 0.58 of the distance)
const hunt = track([[0, 1.72], [0.22, 1.66, linear], [0.78, 0.93, ease.inOutCubic], [1.1, 1.0, ease.inOutCubic]]);

// pedestrian paths (polylines on the sidewalks, both ends off screen)
const PATHS = [
  { pts: [[-70, -5.2], [3.4, -5.2], [3.4, -150]], n: 5 },
  { pts: [[4.3, -150], [4.3, -5.6], [-70, -5.6]], n: 4 },
  { pts: [[80, 5.2], [12.6, 5.2], [12.6, 90]], n: 5 },
  { pts: [[-70, 19.9], [3.4, 19.9], [3.4, 5.4], [-70, 5.4]], n: 5 },
  { pts: [[11.8, 90], [11.8, 5.8], [80, 5.8]], n: 4 },
];
const STOP_PEOPLE = [[-12.2, 26.0], [-3.9, 25.9], [-2.5, 26.4], [-0.7, 25.8], [1.7, 26.2]];

const C = (hex) => new THREE.Color(hex);
const SKY = {
  sunDawn: C(0xff9a58), sunDay: C(0xfff1de),
  hemiSkyDawn: C(0x6a8ed8), hemiSkyDay: C(0xcfe2f6), hemiGndDawn: C(0x6b5f78), hemiGndDay: C(0xc2ae8c),
  hazeDawn: C(0xa3b0d9), hazeDay: C(0xd6e3ef), glowDawn: C(0xffa266), glowDay: C(0xffe0b8),
  glassDawn: new THREE.Color(0.06, 0.075, 0.1), glassDay: new THREE.Color(0.26, 0.34, 0.42),
};

defineDemo({
  id: '151-tilt-shift',
  title: '장난감 마을의 아침',
  tech: '틸트시프트 미니어처 · 로우폴리 디오라마 + 피사계 심도 + 끊는 시간',
  duration: D,
  background: '#cfd6e2',

  async setup(api) {
    await fontReady('700 46px "Pretendard Variable"', '오전 0123456789:');
    await fontReady('600 30px "Pretendard Variable"', '첫 트램 도착');

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
    renderer.setClearColor(0xc3bfd8, 1);

    // ---- a painted morning sky, only for reflections (glass, rails, water) through PMREM
    const envScene = new THREE.Scene();
    const sd = new THREE.Vector3(-Math.sin(SUN_AZ) * Math.cos(16 * DEG), Math.sin(16 * DEG), -Math.cos(SUN_AZ) * Math.cos(16 * DEG));
    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), new THREE.ShaderMaterial({
      side: THREE.BackSide, uniforms: { uSun: { value: sd } },
      vertexShader: 'varying vec3 vD; void main() { vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `varying vec3 vD; uniform vec3 uSun;
        void main() {
          float h = vD.y;
          vec3 top = vec3(0.13, 0.22, 0.42), hor = vec3(0.55, 0.44, 0.36), gnd = vec3(0.12, 0.14, 0.12);
          vec3 c = h > 0.0 ? mix(hor, top, pow(clamp(h, 0.0, 1.0), 0.55)) : mix(hor * 0.55, gnd, clamp(-h * 5.0, 0.0, 1.0));
          float mu = max(dot(vD, uSun), 0.0);
          c += vec3(5.0, 3.6, 2.2) * pow(mu, 90.0) + vec3(0.7, 0.45, 0.25) * pow(mu, 6.0);
          gl_FragColor = vec4(c, 1.0);
        }`,
    })));
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(envScene, 0, 0.1, 100).texture;

    // ---- the town
    const R = rand(1510);
    const scene = new THREE.Scene();
    const { scene: town, H } = buildTown(R, envMap);
    scene.add(town);
    const camera = new THREE.PerspectiveCamera(FOV, SW / SH, 4, 800);

    // ---- light: sun (shadows) + sky
    const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.2);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -72, right: 72, top: 72, bottom: -72, near: 40, far: 420 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.05;
    sun.shadow.radius = 1.6;
    sun.target.position.set(-2, 0, -12);
    scene.add(sun, sun.target);

    // ---- traffic: bake once, then index by world time
    const traffic = bakeTraffic(rand(77));
    const counts = VTYPES.map(() => 0);
    const cars = [];
    traffic.lanes.forEach(({ ln, cars: cs }, li) => cs.forEach((c, ci) => {
      const tname = VTYPES[c.type].name, inst = counts[c.type]++;
      H.vehicles[tname].paint.setColorAt(inst, new THREE.Color(c.color));
      cars.push({ li, ci, tname, inst });
    }));
    // parked cars: placed once, after the moving ones (frame() only rewrites the moving ones)
    const pm = new THREE.Matrix4(), pq = new THREE.Quaternion();
    for (const pk of H.parked) {
      const V = H.vehicles[VTYPES[pk.type].name], inst = counts[pk.type]++;
      pm.compose(new THREE.Vector3(pk.x, 0, pk.z), pq.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, pk.ry), new THREE.Vector3(1, 1, 1));
      V.paint.setMatrixAt(inst, pm); V.glass.setMatrixAt(inst, pm); V.dark.setMatrixAt(inst, pm);
      V.paint.setColorAt(inst, new THREE.Color(pk.color));
    }
    for (const v of Object.values(H.vehicles)) if (v.paint.instanceColor) v.paint.instanceColor.needsUpdate = true;
    VTYPES.forEach((t, i) => { const v = H.vehicles[t.name]; v.paint.count = v.glass.count = v.dark.count = counts[i]; });
    H.carLights.count = cars.length * 4;

    // ---- windows: which rooms are lit at dawn, and when each goes dark (one by one)
    const RW = rand(4040);
    const wins = H.winList.map(() => {
      const lit = RW() < 0.5;
      return { lit, off: 1.9 + Math.pow(RW(), 0.9) * 3.4 };
    });
    const lampOff = H.lamps.map((l) => 2.6 + 0.012 * (l.x + 70) + RW() * 0.25);   // street lamps go out west → east

    // ---- pedestrians
    const walkers = [];
    PATHS.forEach((p) => {
      const seg = [];
      let L = 0;
      for (let i = 1; i < p.pts.length; i++) {
        const [x0, z0] = p.pts[i - 1], [x1, z1] = p.pts[i], l = Math.hypot(x1 - x0, z1 - z0);
        seg.push({ x0, z0, dx: (x1 - x0) / l, dz: (z1 - z0) / l, s0: L, l });
        L += l;
      }
      for (let k = 0; k < p.n; k++) walkers.push({ seg, L, s0: R() * L, v: 1.15 + R() * 0.4, color: PAL.coats[Math.floor(R() * PAL.coats.length)] });
    });
    STOP_PEOPLE.forEach(() => walkers.push({ stop: true, color: PAL.coats[Math.floor(R() * PAL.coats.length)] }));
    walkers.forEach((w, i) => H.peds.body.setColorAt(i, new THREE.Color(w.color)));
    H.peds.body.instanceColor.needsUpdate = true;
    H.peds.body.count = H.peds.head.count = walkers.length;
    const doorsX = H.tram.doors.map((pair) => (pair[0].x0 + pair[1].x0) / 2);

    // ---- overlay: the clock chip, drawn per frame into a small canvas that the final pass blends in
    //      (the whole picture stays one WebGL canvas; the chip's soft shadow is baked once)
    const ovC = document.createElement('canvas');
    ovC.width = OV.w; ovC.height = OV.h;
    const ovG = ovC.getContext('2d', api.headless ? { willReadFrequently: true } : undefined);
    const ovTex = new THREE.CanvasTexture(ovC);
    ovTex.colorSpace = THREE.SRGBColorSpace;
    ovTex.minFilter = ovTex.magFilter = THREE.NearestFilter;
    ovTex.generateMipmaps = false;
    const chip = document.createElement('canvas');
    chip.width = 420; chip.height = 150;
    {
      const g = chip.getContext('2d', api.headless ? { willReadFrequently: true } : undefined);
      g.shadowColor = 'rgba(40, 50, 70, 0.22)'; g.shadowBlur = 26; g.shadowOffsetY = 8;
      g.fillStyle = 'rgba(255, 250, 242, 0.94)';
      g.beginPath(); g.roundRect(30, 22, 330, 92, 46); g.fill();
    }

    // ---- depth of field + grade
    const dof = createDof(renderer, SW, SH, { texture: ovTex, ...OV });

    Object.assign(this, { renderer, scene, camera, hemi, sun, H, dof, traffic, cars, wins, lampOff, walkers, doorsX, ovG, ovTex, chip });

    // warm-up: draw two frames that use every program (dawn lights, open doors, the tag) so shaders and the software
    // GPU's pipelines are built during setup, not in the first frame anyone watches; frame() is pure, so this leaves no trace
    this.frame(7.6);
    this.frame(0.6);
    if (api.headless) { const gl = renderer.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); }
  },

  frame(t) {
    const S = this, { H, camera } = S;
    const q = tq(t), W = worldClock(q);
    const dayK = smooth((q - 1.6) / (5.4 - 1.6));

    // ---------------------------------------------------------------- camera (continuous)
    const tg = camTgt(t), dist = camDist(t), el = camEl(t) * DEG, az = camAz(t) * DEG;
    camera.position.set(tg[0] + dist * Math.cos(el) * Math.sin(az), tg[1] + dist * Math.sin(el), tg[2] + dist * Math.cos(el) * Math.cos(az));
    camera.up.set(0, 1, 0);
    camera.lookAt(tg[0], tg[1], tg[2]);
    camera.updateMatrixWorld(true);

    // ---------------------------------------------------------------- sun and sky (quantised: the shadows creep in steps)
    const e = sunEl(q) * DEG;
    const sunDir = new THREE.Vector3(-Math.sin(SUN_AZ) * Math.cos(e), Math.sin(e), -Math.cos(SUN_AZ) * Math.cos(e));
    S.sun.position.copy(S.sun.target.position).addScaledVector(sunDir, 220);
    S.sun.color.lerpColors(SKY.sunDawn, SKY.sunDay, dayK);
    S.sun.intensity = lerp(0.85, 3.7, smooth((q - 1.4) / 4.0));
    S.hemi.color.lerpColors(SKY.hemiSkyDawn, SKY.hemiSkyDay, dayK);
    S.hemi.groundColor.lerpColors(SKY.hemiGndDawn, SKY.hemiGndDay, dayK);
    S.hemi.intensity = lerp(1.25, 1.22, dayK);
    const envK = lerp(0.45, 1.0, dayK);
    H.M.glass.envMapIntensity = 0.8 * envK; H.tram.glass.envMapIntensity = 0.5 * envK;
    H.M.rail.envMapIntensity = envK; H.water.material.envMapIntensity = 1.4 * envK;
    H.water.material.normalMap.offset.set(0.012 * W, 0.03 * W);

    // windows: lit rooms switch off one by one; the dark glass brightens with the day
    const glass = new THREE.Color().lerpColors(SKY.glassDawn, SKY.glassDay, dayK);
    const warm = new THREE.Color(2.5, 1.5, 0.6), col = new THREE.Color();
    S.wins.forEach((w, i) => H.windows.setColorAt(i, w.lit && q < w.off ? warm : glass));
    H.windows.instanceColor.needsUpdate = true;
    S.lampOff.forEach((off, i) => H.bulbs.setColorAt(i, q < off ? col.setRGB(7, 4.6, 2.2) : col.setRGB(0.5, 0.5, 0.48)));
    H.bulbs.instanceColor.needsUpdate = true;
    H.sigLamps.forEach((L, i) => {
      const s = signalState(L.ph, W);
      const on = s === L.col;
      H.sigMesh.setColorAt(i, !on ? col.setRGB(0.04, 0.04, 0.045) : L.col === 'R' ? col.setRGB(7, 0.5, 0.25) : L.col === 'Y' ? col.setRGB(7, 4, 0.4) : col.setRGB(0.4, 6, 2.6));
    });
    H.sigMesh.instanceColor.needsUpdate = true;

    // ---------------------------------------------------------------- traffic from the bake (world time, held)
    const tr = S.traffic, kf = (W - tr.W0) / tr.dt, k0 = Math.min(tr.steps - 2, Math.floor(kf)), fk = kf - k0;
    const m4 = new THREE.Matrix4(), L4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), p = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), lp = new THREE.Vector3();
    const dark = 1 - smooth((q - 2.5) / 3);
    S.cars.forEach((c, gi) => {
      const { pos, ln } = tr.lanes[c.li], n = ln.n;
      const u0 = pos[k0 * n + c.ci];
      let u1 = pos[(k0 + 1) * n + c.ci];
      if (u1 - u0 < -ln.L / 2) u1 += ln.L;
      let u = u0 + (u1 - u0) * fk;
      if (u >= ln.u0 + ln.L) u -= ln.L;
      const v = (u1 - u0) / tr.dt;
      const a = ln.dir * u;
      if (ln.axis === 'x') p.set(a, 0, ln.off); else p.set(ln.off, 0, a);
      const ry = ln.axis === 'x' ? (ln.dir > 0 ? 0 : Math.PI) : (ln.dir > 0 ? -Math.PI / 2 : Math.PI / 2);
      qt.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, ry);
      m4.compose(p, qt, one);
      const V = H.vehicles[c.tname];
      V.paint.setMatrixAt(c.inst, m4); V.glass.setMatrixAt(c.inst, m4); V.dark.setMatrixAt(c.inst, m4);
      const brake = v < 3 ? 1 : 0;
      V.lights.forEach((o, k) => {
        lp.set(o[0], o[1], o[2]).applyMatrix4(m4);
        H.carLights.setMatrixAt(gi * 4 + k, L4.makeTranslation(lp.x, lp.y, lp.z));
        H.carLights.setColorAt(gi * 4 + k, k < 2 ? col.setRGB(3.4, 3.1, 2.6).multiplyScalar(0.35 + 0.65 * dark) : col.setRGB(2.4, 0.1, 0.06).multiplyScalar(0.35 + 0.45 * dark + 1.4 * brake));
      });
    });
    for (const V of Object.values(H.vehicles)) { V.paint.instanceMatrix.needsUpdate = V.glass.instanceMatrix.needsUpdate = V.dark.instanceMatrix.needsUpdate = true; }
    H.carLights.instanceMatrix.needsUpdate = true; H.carLights.instanceColor.needsUpdate = true;

    // ---------------------------------------------------------------- tram (held steps too): a braking run into the stop
    const tram = H.tram;
    let tx;
    if (q < T_IN) tx = X_STOP - BRAKE - ((3 * BRAKE) / (T_STOP - T_IN)) * (T_IN - q);
    else { const pp = clamp((q - T_IN) / (T_STOP - T_IN)); tx = X_STOP - BRAKE * (1 - pp) ** 3; }
    tram.g.position.x = tx;
    const dp = ease.inOutCubic(clamp((q - T_DOORS) / 0.4));
    for (const pair of tram.doors) for (const d of pair) { d.leaf.position.x = d.x0 + d.s * 0.6 * dp; d.leaf.position.z = 0.05 * dp; }
    tram.glass.emissiveIntensity = lerp(0.22, 0.08, dayK);   // the interior lights, faint against the day
    tram.lampM.color.setRGB(5, 4.6, 3.8);
    tram.tailM.color.setRGB(3, 0.15, 0.08);

    // ---------------------------------------------------------------- people (world time, held)
    S.walkers.forEach((w, i) => {
      let x, z, ry = 0, y = 0, s = 1;
      if (w.stop) {
        const [sx, sz] = STOP_PEOPLE[i - (S.walkers.length - STOP_PEOPLE.length)];
        const k = i - (S.walkers.length - STOP_PEOPLE.length);
        const dx = S.doorsX.reduce((a, d) => (Math.abs(d + X_STOP - sx) < Math.abs(a - sx) ? d + X_STOP : a), 1e9);
        const go = clamp((q - T_BOARD - k * 0.17) / 0.9);
        x = lerp(sx, dx, smooth(go)); z = lerp(sz, LAY.TRAM_Z + 1.35, smooth(go));
        y = 0.42; ry = go > 0 ? Math.atan2(dx - sx, LAY.TRAM_Z + 1.35 - sz) : Math.PI;
        s = go >= 1 ? 0.0001 : 1;
        if (go > 0 && go < 1) y += 0.05 * Math.abs(Math.sin(go * 9));
      } else {
        const sd = (((w.s0 + w.v * W) % w.L) + w.L) % w.L;
        let sg = w.seg[0];
        for (const g of w.seg) if (sd >= g.s0) sg = g;
        const l = sd - sg.s0;
        x = sg.x0 + sg.dx * l; z = sg.z0 + sg.dz * l;
        ry = Math.atan2(sg.dx, sg.dz);
        y = 0.22 + 0.06 * Math.abs(Math.sin((sd / 0.75) * Math.PI));
      }
      qt.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, ry);
      m4.compose(p.set(x, y, z), qt, one.set(s, s, s));
      H.peds.body.setMatrixAt(i, m4); H.peds.head.setMatrixAt(i, m4);
      one.set(1, 1, 1);
    });
    H.peds.body.instanceMatrix.needsUpdate = H.peds.head.instanceMatrix.needsUpdate = true;

    // ---------------------------------------------------------------- the lens: focus pulls in diopters, thin-lens CoC
    const viewDepth = (P) => -p.copy(P).applyMatrix4(camera.matrixWorldInverse).z;
    const dMid = 1 / viewDepth(P_MID), dStop = 1 / viewDepth(P_STOP);
    let dio = dMid * hunt(t);
    if (t > T_RACK0) dio = lerp(dMid, dStop, ease.inOutCubic(clamp((t - T_RACK0) / (T_RACK1 - T_RACK0))));
    const Sf = 1 / dio;
    const fmm = (LENS.SENSOR_H / 2) / Math.tan((FOV / 2) * DEG);              // focal length for this field of view
    const A = fmm / LENS.N;                                                   // aperture diameter (mm)
    const U = S.dof.U;
    U.uFocus.value = Sf;
    U.uLens.value = (SH / LENS.SENSOR_H) * A * fmm / ((Sf * 1000) / LENS.K - fmm);
    U.uMaxCoc.value = LENS.MAX_COC;
    U.uNear.value = camera.near; U.uFar.value = camera.far;
    U.uCamWorld.value.copy(camera.matrixWorld);
    const th = Math.tan((FOV / 2) * DEG);
    U.uTanHalf.value.set(th * camera.aspect, th);
    U.uSunDir.value.copy(sunDir);
    U.uHazeCol.value.lerpColors(SKY.hazeDawn, SKY.hazeDay, dayK);
    U.uSunCol.value.lerpColors(SKY.glowDawn, SKY.glowDay, dayK);
    // the haze glows toward the sun, most while it clears the horizon
    U.uSunGlow.value = lerp(1.1, 0.6, dayK) + 1.6 * smooth((q - 1.2) / 1.6) * (1 - smooth((q - 4.0) / 1.8));
    U.uHazeStart.value = 72; U.uHazeDen.value = 0.0034;
    S.dof.F.uExposure.value = lerp(1.02, 1.04, dayK);
    S.dof.F.uSat.value = 1.32;
    S.dof.F.uVig.value = 0.32;

    // ---------------------------------------------------------------- overlay: the clock chip, ticking with the world
    const g = S.ovG;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.clearRect(0, 0, OV.w, OV.h);
    const cx = 64 - OV.x, cy = 104 - OV.y;                                   // chip top-left in overlay pixels
    const inK = ease.outBack(clamp((t - 0.35) / 0.6), 1.4), inA = clamp((t - 0.35) / 0.3);
    if (inA > 0) {
      const dy = (1 - inK) * -26;
      g.globalAlpha = inA;
      g.drawImage(S.chip, cx - 30, cy - 22 + dy);
      g.setTransform(1, 0, 0, 1, cx, cy + dy);
      // icon: the sun rising over a horizon line
      const rise = clamp(sunEl(q) / 30);
      g.save();
      g.beginPath(); g.rect(22, 10, 64, 46); g.clip();
      g.fillStyle = '#ff5843';                                                // the accent: a red morning sun, like the tram
      g.beginPath(); g.arc(54, 58 - 26 * rise, 15, 0, Math.PI * 2); g.fill();
      g.restore();
      g.strokeStyle = '#2f3a4a'; g.lineWidth = 4; g.lineCap = 'round';
      g.beginPath(); g.moveTo(26, 58); g.lineTo(82, 58); g.stroke();
      const m = Math.floor(clockMin(q)), hh = Math.floor(m / 60), mm = m % 60;
      g.fillStyle = '#2f3a4a';
      g.font = '700 46px "Pretendard Variable"';
      g.textBaseline = 'middle';
      g.fillText(`오전 ${hh}:${String(mm).padStart(2, '0')}`, 104, 47);
    }
    // the climax tag: a second pill slides in under the clock as the tram arrives
    const tagK = ease.outCubic(clamp((t - 6.45) / 0.5)), tagA = clamp((t - 6.45) / 0.25);
    if (tagA > 0) {
      g.setTransform(1, 0, 0, 1, cx, cy + 110 + (1 - tagK) * 18);
      g.globalAlpha = tagA;
      g.fillStyle = 'rgba(255, 250, 242, 0.94)';
      g.beginPath(); g.roundRect(0, 0, 252, 60, 30); g.fill();
      g.fillStyle = '#ff5843';
      g.beginPath(); g.arc(34, 30, 10, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#2f3a4a';
      g.font = '600 30px "Pretendard Variable"';
      g.textBaseline = 'middle';
      g.fillText('첫 트램 도착', 58, 31);
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    S.ovTex.needsUpdate = true;

    S.dof.render(S.scene, camera);
  },
});
