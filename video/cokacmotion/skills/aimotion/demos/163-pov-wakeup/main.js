/*
 * 163 · 눈 뜨는 아침 — a first-person wake-up. The camera is the viewer's head: eyelids, focus, a head turn with
 * lag, the viewer's own hand, sitting up, a walk with head bob, and the eye adapting when the curtains open.
 *
 *   body.js   eyelid curves and aperture a(t), wake blur R(t), spring bake, gait (bob phase-locked to footfalls), IK
 *   room.js   the bedroom (near scene: shadows from the sun through the window) and the town (far scene)
 *   post.js   the eye as passes: Vogel defocus gather at half resolution, bloom from absolute luminance,
 *             lids in linear light, exposure E(t), ACES, grade, overlay
 *   main.js   story, camera pose from the body rig, the arms, the eye-adaptation bake, the device chip, frame(t)
 */
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { defineDemo, rand, clamp, lerp, smooth, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { D, T, aperture, lidShape, lidVisible, wakeBlur, bakeSpring, gait, bob, hipAt, twoBoneIK, HIP_UP, HIP_WIN } from './body.js';
import { buildRoom, buildTown, CURT, WIN, CLOCK, PAL, ROOM, canvasTex } from './room.js';
import { createPost } from './post.js';

const SW = 1080, SH = 1920;
const DEG = Math.PI / 180;
const FOV = 74;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const io = (p) => ease.inOutCubic(clamp(p));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const SUN_AZ = 60 * DEG, SUN_EL = 27 * DEG;                    // left of the window's axis: it enters obliquely and side-lights the town
const SUN_DIR = V3(-Math.sin(SUN_AZ) * Math.cos(SUN_EL), Math.sin(SUN_EL), -Math.cos(SUN_AZ) * Math.cos(SUN_EL));

// ---------------------------------------------------------------- the eye's light model (scene units, before exposure)
const OUT = 5;                 // outdoor gain: the sunny town is about ten times the curtained room
// log-average luminances measured from the render: curtained room, curtains, sunlit room, the town; the eye adapts
// incompletely (E = K·L_a^(−p), p < 1), so a dim room stays a little dim and a sunny view a little bright
const LUM = { room0: 0.065, curt: 0.2, room1: 0.25, out: 1.75, skin: 0.04, floor: 0.036, K: 0.333, p: 0.86, tauUp: 0.45, tauDown: 1.6 };

// ---------------------------------------------------------------- curtains: lead edges follow the grabbing hands
const PULL_MID = { L: -0.12, R: 0.33 }, PULL_END = { L: -0.84, R: 1.04 };
function leadAt(t, side) {
  const x0 = side < 0 ? CURT.LEAD_L : CURT.LEAD_R, xm = side < 0 ? PULL_MID.L : PULL_MID.R, x1 = side < 0 ? PULL_END.L : PULL_END.R;
  if (t < T.tug) return lerp(x0, xm, io(seg(t, T.grab, T.tug)));          // a slow parting: the light streams in
  return lerp(xm, x1, 1 - (1 - seg(t, T.tug, T.pull1)) ** 2);             // then the sweep, easing out as the cloth bunches
}
const openK = (t) => clamp((leadAt(t, 1) - leadAt(t, -1) - (CURT.LEAD_R - CURT.LEAD_L)) / (WIN.X1 - WIN.X0));

// ---------------------------------------------------------------- the device chip (the minimal caption)
const DEVICES = [
  [0.25, 1.62, '눈꺼풀 마스크'], [1.62, 2.7, '초점 맞춤'], [2.7, 3.26, '고개 돌림'], [3.26, 4.34, '내 손'],
  [4.34, 5.86, '일어나기'], [5.86, 7.32, '걸음 흔들림'], [7.32, 9.05, '노출 순응'],
];
const CHIP = { x: 48, y: 104, w: 560, h: 120 };
const CEIL_T = 3.25;
const TITLE = { x: 0, y: 300, w: 1080, h: 380 };

defineDemo({
  id: '163-pov-wakeup',
  title: '눈 뜨는 아침',
  tech: '1인칭 시점 · 눈꺼풀 마스크 + 초점 맞춤 + 걸음 흔들림 + 노출 순응',
  duration: D,
  background: '#000',

  async setup(api) {
    const HL = api.headless;
    await fontReady('700 34px "Pretendard Variable"', DEVICES.map((d) => d[2]).join(''));
    await fontReady('800 132px "Pretendard Variable"', '좋은 아침');
    await fontReady('700 44px "Pretendard Variable"', '오전 7:00');

    // ---- renderer
    const el = api.layer('canvas', { z: 0 });
    el.width = SW; el.height = SH;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(SW, SH, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 1);
    RectAreaLightUniformsLib.init();

    // ---- the room (near) and the town (far)
    const near = buildRoom(HL);
    const far = buildTown(rand(1630));
    const nearCam = new THREE.PerspectiveCamera(FOV, SW / SH, 0.03, 30);
    const farCam = new THREE.PerspectiveCamera(FOV, SW / SH, 1.5, 1600);
    // room light: sky/curtain glow through the window (area light), a dim fill, and the sun (the only shadow caster)
    const hemi = new THREE.HemisphereLight('#fff0dc', '#c9a27c', 0.3);
    const rect = new THREE.RectAreaLight('#ffcf9a', 2, 1.85, 1.75);
    rect.position.set(0.1, 1.52, CURT.Z + 0.07);
    rect.lookAt(0.1, 1.52, 3);
    const sun = new THREE.DirectionalLight('#ffe2b8', 4.2 * OUT);
    sun.target.position.set(0.2, 0.6, 0.4);
    sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -3.4, right: 3.4, top: 3.4, bottom: -3.4, near: 1, far: 20 });
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.015; sun.shadow.radius = 3.5;
    // sunlight off the sill and the gap, thrown up onto the ceiling: a cookie of soft light and leaf shadows
    const cookie = canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
      g.filter = 'blur(10px)';
      const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.48);
      gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.filter = 'blur(4px)';
      g.fillStyle = 'rgba(255,255,255,0.9)';                                     // the window, its four panes
      for (const [x, y] of [[0.3, 0.22], [0.52, 0.22], [0.3, 0.5], [0.52, 0.5]]) g.fillRect(w * x, h * y, w * 0.19, h * 0.25);
      g.fillStyle = 'rgba(255,255,255,1)';
      g.beginPath(); g.moveTo(w * 0.47, 0); g.lineTo(w * 0.53, 0); g.lineTo(w * 0.58, h); g.lineTo(w * 0.44, h); g.fill();   // the curtain gap's band
      g.filter = 'blur(2.5px)';
      g.fillStyle = 'rgba(0,0,0,0.78)';
      const RC = rand(512);
      for (let i = 0; i < 34; i++) {                                              // leaves of a tree outside
        const x = w * (0.2 + RC() * 0.6), y = h * (0.15 + RC() * 0.65);
        g.beginPath(); g.ellipse(x, y, 5 + RC() * 9, 2.5 + RC() * 4, RC() * 3, 0, Math.PI * 2); g.fill();
      }
      g.filter = 'none';
    }, HL);
    const bounce = new THREE.SpotLight('#ffd5a0', 9, 9, 0.62, 0.6, 1.2);
    bounce.position.set(0.15, WIN.Y0 + 0.05, ROOM.Z0 + 0.3);
    bounce.target.position.set(0.25, ROOM.H, 0.75);
    bounce.map = cookie;
    bounce.castShadow = true;
    bounce.shadow.mapSize.set(512, 512); bounce.shadow.bias = -0.001; bounce.shadow.radius = 3;
    Object.assign(bounce.shadow.camera, { near: 0.3, far: 9 });
    near.scene.add(hemi, rect, sun, sun.target, bounce, bounce.target);
    // town light: the same sun, a sky fill, aerial haze, and the sky dome
    const sun2 = new THREE.DirectionalLight('#fff0dc', 4.2 * OUT);
    sun2.position.copy(SUN_DIR).multiplyScalar(100);
    const hemi2 = new THREE.HemisphereLight('#cfe2f6', '#a9b48c', 1.5 * OUT);
    far.scene.add(sun2, hemi2);
    far.scene.fog = new THREE.Fog(new THREE.Color().setRGB(1.05 * OUT, 1.2 * OUT, 1.38 * OUT), 160, 1500);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 48, 24), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { uSun: { value: SUN_DIR }, uGain: { value: OUT } },
      vertexShader: 'varying vec3 vD; void main() { vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `varying vec3 vD; uniform vec3 uSun; uniform float uGain;
        void main() {
          vec3 d = normalize(vD);
          float e = d.y;
          vec3 hor = vec3(1.05, 1.2, 1.38), mid = vec3(0.48, 0.74, 1.18), zen = vec3(0.2, 0.42, 0.92);
          vec3 c = mix(hor, mid, smoothstep(0.0, 0.2, e));
          c = mix(c, zen, smoothstep(0.18, 0.75, e));
          float mu = max(dot(d, uSun), 0.0), m2 = mu * mu, m4 = m2 * m2, m8 = m4 * m4, m32 = m8 * m8 * m8 * m8;
          c += vec3(1.0, 0.8, 0.55) * (0.45 * m8 + 1.6 * m32 * m32) + vec3(40.0, 34.0, 26.0) * smoothstep(0.9993, 0.9996, mu);
          gl_FragColor = vec4(c * uGain, 1.0);
        }`,
    }));
    sky.renderOrder = -10;
    sky.frustumCulled = false;
    far.scene.add(sky);

    // ---- springs: torso pitch, then the head angles (their targets read the baked torso)
    const BETA_LIE = 90 * DEG;
    const beta = bakeSpring((t) => {
      if (t < T.sit) return BETA_LIE;
      if (t < T.stand) return lerp(BETA_LIE, -6 * DEG, io(seg(t, T.sit, T.sit + 0.42)));
      if (t < T.walk0) return t < T.stand + 0.3 ? lerp(-6 * DEG, -24 * DEG, io(seg(t, T.stand, T.stand + 0.3))) : lerp(-24 * DEG, 0, io(seg(t, T.stand + 0.3, T.walk0)));
      return -4 * DEG * gait(t).k - 9 * DEG * io(seg(t, T.grab0, T.grab)) * (1 - io(seg(t, T.tug, T.pull1 + 0.25)));   // lean in to reach
    }, { w: 9, z: 0.74 });
    // fixation: the head turns to aim at a point (the angles of that aim, in the torso frame, are the spring targets)
    const tmpHip = new THREE.Vector3(), tmpNeck = new THREE.Vector3(), qb = new THREE.Quaternion(), qi = new THREE.Quaternion(), X = V3(1, 0, 0);
    const clockC = CLOCK.clone().add(V3(0, 0.08, 0));
    const aimAt = (t, P) => {
      hipAt(t, tmpHip);
      qb.setFromAxisAngle(X, beta(t));
      tmpNeck.set(0, 0.56, 0).applyQuaternion(qb).add(tmpHip);
      const v = P.clone().sub(tmpNeck).applyQuaternion(qi.copy(qb).invert());
      const yaw = Math.atan2(v.x, -v.z);
      return { yaw, pitch: Math.atan2(-v.y, Math.hypot(v.x, v.z)) };
    };
    const WIN_AIM = V3(0.1, 1.5, ROOM.Z0), TOWN_AIM = V3(-4, -13, -80), TOWN_AIM2 = V3(9, -12, -80);
    const target = (t) => {
      const lie = { yaw: 0, pitch: 26 * DEG };
      const k1 = io(seg(t, T.turn, T.turn + 0.2));
      if (t < T.look) { const a = aimAt(t, clockC); return { yaw: lerp(lie.yaw, a.yaw, k1), pitch: lerp(lie.pitch, a.pitch, k1) }; }
      const c = aimAt(t, clockC), w = aimAt(t, WIN_AIM), k2 = io(seg(t, T.look, T.look + 0.24));
      if (t < T.grab) return { yaw: lerp(c.yaw, w.yaw, k2), pitch: lerp(c.pitch, w.pitch, k2) };
      const o = aimAt(t, TOWN_AIM), o2 = aimAt(t, TOWN_AIM2), k3 = io(seg(t, 7.8, 8.1)), k4 = io(seg(t, 8.8, 9.95));
      return { yaw: lerp(w.yaw, lerp(o.yaw, o2.yaw, k4), k3), pitch: lerp(w.pitch, lerp(o.pitch, o2.pitch, k4), k3) };
    };
    const psi = bakeSpring((t) => target(t).yaw, { w: 13, z: 0.68 });
    const theta = bakeSpring((t) => target(t).pitch, { w: 14, z: 0.62, ff: 0.8 });
    // the hems follow the lead edges with their own (lightly damped) spring: the cloth swings after the tug
    const hemL = bakeSpring((t) => leadAt(t, -1), { w: 10, z: 0.32 }), hemR = bakeSpring((t) => leadAt(t, 1), { w: 10, z: 0.32 });

    // ---- the camera pose (pure function of t)
    const walkDir = V3(HIP_WIN.x - HIP_UP.x, 0, HIP_WIN.z - HIP_UP.z).normalize();
    const walkRight = V3(-walkDir.z, 0, walkDir.x);
    const P = { hip: new THREE.Vector3(), neck: new THREE.Vector3(), eye: new THREE.Vector3(), qBody: new THREE.Quaternion(), qHead: new THREE.Quaternion() };
    const qy = new THREE.Quaternion(), qx = new THREE.Quaternion(), qz = new THREE.Quaternion(), Y = V3(0, 1, 0), Z = V3(0, 0, 1);
    const pose = (t) => {
      const b = bob(t);
      hipAt(t, P.hip);
      P.qBody.setFromAxisAngle(X, beta(t));
      P.neck.set(0, 0.56, 0).applyQuaternion(P.qBody).add(P.hip).addScaledVector(walkRight, b.x);
      P.neck.y += b.y;
      P.qHead.copy(P.qBody).multiply(qy.setFromAxisAngle(Y, -psi(t))).multiply(qx.setFromAxisAngle(X, -theta(t) + b.pitch)).multiply(qz.setFromAxisAngle(Z, b.roll));
      P.eye.set(0, 0.1, -0.09).applyQuaternion(P.qHead).add(P.neck);
      return P;
    };

    // ---- eye adaptation, baked: the target is the log-average luminance on the retina,
    //      ln L = f·ln L_out + (1 − f)·ln L_room, times what the lids let through; f = the frame share of the window
    //      opening (projected and clipped to the frame). The adapted level follows in log space with τ↑ / τ↓.
    const bakeCam = nearCam.clone();
    const corner = new THREE.Vector3();
    const ty = Math.tan((FOV / 2) * DEG), tx = ty * (SW / SH);
    /** share of the frame covered by the rectangle [x0, x1]×[y0, y1] on the plane z (clipped to the near plane and the frame) */
    const share = (x0, x1, y0, y1, z) => {
      if (x1 <= x0) return 0;
      let poly = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => corner.set(x, y, z).applyMatrix4(bakeCam.matrixWorldInverse).toArray());
      const nz = -0.05, clipped = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length], ina = a[2] < nz, inb = b[2] < nz;
        if (ina) clipped.push(a);
        if (ina !== inb) { const k = (nz - a[2]) / (b[2] - a[2]); clipped.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, nz]); }
      }
      if (clipped.length < 3) return 0;
      poly = clipped.map(([x, y, zz]) => [x / (-zz * tx), y / (-zz * ty)]);
      for (const [ax, sgn] of [[0, 1], [0, -1], [1, 1], [1, -1]]) {
        const out = [];
        for (let i = 0; i < poly.length; i++) {
          const a = poly[i], b = poly[(i + 1) % poly.length], ina = sgn * a[ax] <= 1, inb = sgn * b[ax] <= 1;
          if (ina) out.push(a);
          if (ina !== inb) { const k = (sgn - a[ax]) / (b[ax] - a[ax]); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
        }
        poly = out;
        if (poly.length < 3) return 0;
      }
      let A = 0;
      for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; A += a[0] * b[1] - b[0] * a[1]; }
      return Math.abs(A) / 2 / 4;
    };
    /** ln of the log-average luminance on the retina at t: regions weighted by their frame share, times the lids */
    const retina = (t) => {
      const p = pose(t);
      bakeCam.position.copy(p.eye); bakeCam.quaternion.copy(p.qHead); bakeCam.updateMatrixWorld(true);
      const lL = leadAt(t, -1), lR = leadAt(t, 1);
      const fo = share(Math.max(WIN.X0, lL), Math.min(WIN.X1, lR), WIN.Y0, WIN.Y1, ROOM.Z0);
      const fc = share(CURT.OUT_L, lL, CURT.BOT, CURT.TOP, CURT.Z) + share(lR, CURT.OUT_R, CURT.BOT, CURT.TOP, CURT.Z);
      const fr = Math.max(0, 1 - fo - fc), vis = lidVisible(aperture(t));
      const lnL = fo * Math.log(LUM.out) + fc * Math.log(LUM.curt) + fr * Math.log(lerp(LUM.room0, LUM.room1, openK(t)));
      return lnL + Math.log(vis + (1 - vis) * LUM.skin);
    };
    // the adapted level L_a follows the retina in log space: Δln L_a = (ln L − ln L_a)·(1 − e^(−Δt/τ)), τ↑ fast, τ↓ slow
    const HZ = 120, NB = Math.ceil(D * HZ) + 2, lnA = new Float32Array(NB), lnFloor = Math.log(LUM.floor);
    let la = lnFloor;
    for (let i = 0; i < NB; i++) {
      const lt = Math.max(retina(i / HZ), lnFloor);
      lnA[i] = la;
      la += (lt - la) * (1 - Math.exp(-(1 / HZ) / (lt > la ? LUM.tauUp : LUM.tauDown)));
    }
    const exposure = (t) => { const q = clamp(t, 0, D) * HZ, i = Math.min(NB - 2, Math.floor(q)), k = q - i; return LUM.K * Math.exp(-LUM.p * (lnA[i] + (lnA[i + 1] - lnA[i]) * k)); };

    // ---- overlay: the device chip (redrawn per frame, small) and the title (baked)
    const chipC = document.createElement('canvas');
    chipC.width = CHIP.w; chipC.height = CHIP.h;
    const chipG = chipC.getContext('2d', HL ? { willReadFrequently: true } : undefined);
    const chipTex = new THREE.CanvasTexture(chipC);
    chipTex.colorSpace = THREE.SRGBColorSpace;
    chipTex.minFilter = chipTex.magFilter = THREE.NearestFilter;
    chipTex.generateMipmaps = false;
    const pills = DEVICES.map(([, , label]) => {
      const c = document.createElement('canvas');
      c.width = CHIP.w; c.height = CHIP.h;
      const g = c.getContext('2d', HL ? { willReadFrequently: true } : undefined);
      g.font = '700 34px "Pretendard Variable"';
      const w = 96 + g.measureText(label).width + 34;
      g.shadowColor = 'rgba(30, 20, 15, 0.28)'; g.shadowBlur = 22; g.shadowOffsetY = 6;
      g.fillStyle = 'rgba(255, 249, 240, 0.94)';
      g.beginPath(); g.roundRect(14, 24, w, 68, 34); g.fill();
      g.shadowColor = 'transparent';
      g.fillStyle = '#3a302b'; g.textBaseline = 'middle';
      g.fillText(label, 14 + 92, 24 + 35);
      return c;
    });
    const titleTex = canvasTex(TITLE.w, TITLE.h, (g, w) => {
      g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.shadowColor = 'rgba(30, 50, 80, 0.32)'; g.shadowBlur = 30; g.shadowOffsetY = 6;
      g.fillStyle = '#ffffff';
      g.font = '800 132px "Pretendard Variable"';
      g.fillText('좋은 아침', w / 2, 260);
      g.font = '700 44px "Pretendard Variable"';
      g.shadowColor = 'rgba(30, 50, 80, 0.22)'; g.shadowBlur = 16;
      g.fillStyle = PAL.accent;
      g.fillText('오전 7:00', w / 2, 104);
    }, HL);
    titleTex.minFilter = THREE.LinearFilter; titleTex.generateMipmaps = false;
    const post = createPost(renderer, SW, SH, { chipTex, chipRect: [CHIP.x, CHIP.y, CHIP.w, CHIP.h], titleTex, titleRect: [TITLE.x, TITLE.y, TITLE.w, TITLE.h] });

    // ---- the clock's button in the world (the right hand aims at it)
    near.clock.root.updateMatrixWorld(true);
    const button = near.clock.button.getWorldPosition(new THREE.Vector3());

    Object.assign(this, { renderer, near, far, nearCam, farCam, hemi, rect, sun, bounce, post, pose, exposure, chipG, chipTex, pills, button, hemL, hemR });

    // warm-up: the busiest moments (blur passes, arms, the flood) so every program is built during setup
    // (renderer.compile also builds what those views leave out of the frustum, e.g. the clock)
    this.frame(1.2);
    renderer.compile(near.scene, nearCam);
    this.frame(7.6);
    renderer.compile(far.scene, farCam);
    if (HL) { const gl = renderer.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); }
  },

  frame(t) {
    const S = this, N = S.near;
    const P = S.pose(t);
    for (const cam of [S.nearCam, S.farCam]) { cam.position.copy(P.eye); cam.quaternion.copy(P.qHead); cam.updateMatrixWorld(true); }

    // ---------------------------------------------------------------- the ringing clock
    const ring = t < T.press ? 1 : Math.exp(-(t - T.press) / 0.06);
    const ck = N.clock, w = 2 * Math.PI * 12.5;
    ck.rock.rotation.z = 0.07 * ring * Math.sin(w * t);
    ck.rock.position.y = 0.0025 * ring * Math.abs(Math.sin(w * t));
    ck.hammer.rotation.z = 0.55 * ring * Math.sin(2 * Math.PI * 16 * t);
    ck.button.position.y = ck.buttonY - 0.005 * clamp((t - T.touch) / (T.press - T.touch)) * (1 - clamp((t - T.lift) / 0.08));
    ck.arcs.forEach((m) => {
      const k = (t * 2.4 + m.userData.i / 3) % 1;
      m.scale.setScalar(0.07 + 0.05 * k);
      m.material.opacity = ring * (1 - k) * smooth(k / 0.15) * 0.9;
      m.visible = m.material.opacity > 0.003;
    });

    // ---------------------------------------------------------------- curtains
    const lL = leadAt(t, -1), lR = leadAt(t, 1);
    const pv = Math.sin(Math.PI * seg(t, T.tug, T.pull1));
    N.curtL.userData.update(lL, S.hemL(t), -0.05 * pv);
    N.curtR.userData.update(lR, S.hemR(t), -0.05 * pv);
    const ok = openK(t);

    // ---------------------------------------------------------------- arms
    armClock(t, P, N.armR, S.button);
    if (t >= T.grab0 && t <= T.release + 0.12) { armCurtain(t, P, N.armR, 1); armCurtain(t, P, N.armL, -1); }
    else { N.armL.group.visible = false; if (t < T.reach || t > T.retract + 0.7) N.armR.group.visible = false; }

    // ---------------------------------------------------------------- light: curtain glow → open window
    S.rect.color.set('#ffcf9a').lerp(new THREE.Color('#eef4ff'), ok);
    S.rect.intensity = lerp(1.1, 9.0, ok);
    S.hemi.intensity = lerp(0.16, 0.7, ok);
    // the ceiling light only while the ceiling is in view; its shadow map stops re-rendering then (at zero intensity it is unused)
    S.bounce.intensity = t < CEIL_T ? 9 : 0;
    S.bounce.shadow.autoUpdate = t < CEIL_T;
    N.curtM.emissiveIntensity = lerp(0.18, 0.26, ok);

    // ---------------------------------------------------------------- the eye
    const F = S.post.F;
    const a = aperture(t), L = lidShape(a);
    F.uLid.value.set(L.c, L.hu, L.hl, L.w);
    F.uLashK.value = 1;
    F.uExposure.value = S.exposure(t);
    F.uBloomK.value = 0.9;
    S.post.bright.uT.value = 1.4 / F.uExposure.value;          // glow only where light is bright to the adapted eye
    F.uVig.value = 0.34;
    F.uSat.value = 1.1;
    F.uTitleA.value = smooth(seg(t, T.title, T.title + 0.5));
    F.uTitleRect.value.y = TITLE.y + 26 * (1 - ease.outCubic(seg(t, T.title, T.title + 0.6)));
    drawChip(S, t, ring);

    // the town is only ever seen through the open part of the window: draw it inside that portal's screen rectangle
    const portal = portalRect(S.nearCam, Math.max(WIN.X0, lL), Math.min(WIN.X1, lR));
    const rt = S.post.sceneRT, R3 = S.renderer;
    S.post.render(() => {
      if (portal) {
        rt.scissorTest = true; rt.scissor.set(...portal);
        R3.setRenderTarget(rt);
        R3.render(S.far.scene, S.farCam);
        rt.scissorTest = false;
        R3.setRenderTarget(rt);
      }
      R3.clearDepth();
      R3.render(N.scene, S.nearCam);
    }, a > 0 ? wakeBlur(t) : 0);
  },
});

// ---------------------------------------------------------------- the portal: the open window's screen rectangle
const _pv = new THREE.Vector3();
function portalRect(cam, x0, x1) {
  if (x1 <= x0 + 1e-4) return null;
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const [x, y] of [[x0, WIN.Y0], [x1, WIN.Y0], [x1, WIN.Y1], [x0, WIN.Y1]]) {
    _pv.set(x, y, ROOM.Z0).applyMatrix4(cam.matrixWorldInverse);
    if (_pv.z > -0.02) return [0, 0, SW, SH];                         // a corner behind the eye: keep the whole frame
    _pv.applyMatrix4(cam.projectionMatrix);
    const px = (_pv.x * 0.5 + 0.5) * SW, py = (_pv.y * 0.5 + 0.5) * SH;
    a = Math.min(a, px); b = Math.min(b, py); c = Math.max(c, px); d = Math.max(d, py);
  }
  a = Math.max(0, Math.floor(a) - 4); b = Math.max(0, Math.floor(b) - 4); c = Math.min(SW, Math.ceil(c) + 4); d = Math.min(SH, Math.ceil(d) + 4);
  return c > a && d > b ? [a, b, c - a, d - b] : null;
}

// ---------------------------------------------------------------- the right hand: reach, tap the clock, withdraw
const _S = new THREE.Vector3(), _E = new THREE.Vector3(), _W = new THREE.Vector3(), _Wt = new THREE.Vector3(), _rest = new THREE.Vector3(), _pole = new THREE.Vector3();
const _hf = new THREE.Vector3(), _pn = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _fa = new THREE.Vector3();
const HF_TAP = V3(0.9, -0.32, 0.05).normalize(), PN_TAP = V3(-0.33, -0.94, 0).normalize();   // a slap: palm down, fingers away
function bezier3(out, p0, p1, p2, p3, s) {
  const u = 1 - s;
  return out.copy(p0).multiplyScalar(u * u * u).addScaledVector(p1, 3 * u * u * s).addScaledVector(p2, 3 * u * s * s).addScaledVector(p3, s * s * s);
}
function armClock(t, P, arm, button) {
  if (t < T.reach || t > T.retract + 0.7) return;
  _S.set(0.18, -0.2, 0.06).applyQuaternion(P.qBody).add(P.neck);
  _rest.set(0.05, -0.5, 0.07).applyQuaternion(P.qBody).add(_S);
  const contact = _a.copy(button).addScaledVector(HF_TAP, -0.05).addScaledVector(PN_TAP, -0.026);   // the palm over the button
  const up = 0.02 * clamp((t - T.press) / (T.lift - T.press)) - 0.014 * clamp((t - T.touch) / (T.press - T.touch));
  let reachK, alignK;
  if (t < T.touch) {
    const p = seg(t, T.reach, T.touch), s = 1 - (1 - p) ** 2.2;
    const c1 = _b.set(0, 0.06, -0.08).applyQuaternion(P.qBody).add(_rest);
    const c2 = _fa.copy(contact).add(V3(-0.05, 0.1, -0.02));
    bezier3(_Wt, _rest, c1, c2, contact, s);
    reachK = smooth(p); alignK = smooth(seg(p, 0.35, 1));
  } else if (t < T.retract) {
    _Wt.copy(contact); _Wt.y += up;
    reachK = 1; alignK = 1;
  } else {
    const p = io(seg(t, T.retract, T.retract + 0.6));
    _Wt.copy(contact); _Wt.y += 0.02;
    _Wt.lerp(_rest, p);
    reachK = 1 - p; alignK = 1 - p;
  }
  _S.addScaledVector(_b.subVectors(contact, _S).normalize(), 0.05 * reachK);   // the shoulder follows the reach
  _pole.set(0.15, -1, -0.35).applyQuaternion(P.qBody);                        // elbow toward the feet: the forearm rises from the frame edge
  twoBoneIK(_S, _Wt, 0.31, 0.28, _pole, _E, _W);
  _fa.subVectors(_W, _E).normalize();
  _hf.copy(_fa).lerp(HF_TAP, 0.7 * alignK).normalize();
  _pn.copy(PN_TAP).lerp(_b.set(0, 0, 1).applyQuaternion(P.qBody), 1 - alignK).normalize();
  const press = clamp((t - T.touch) / (T.press - T.touch)) * (1 - clamp((t - T.lift) / 0.1));
  arm.pose(_S, _E, _W, _hf, _pn, 0.22 + 0.2 * press);
}

// ---------------------------------------------------------------- both hands: grab the curtain edges and pull them apart
function armCurtain(t, P, arm, side) {
  _S.set(side * 0.17, -0.14, 0.03).applyQuaternion(P.qBody).add(P.neck);
  _rest.set(side * 0.08, -0.52, -0.1).applyQuaternion(P.qBody).add(_S);
  const lead = leadAt(t, side);
  const pull = seg(t, T.grab, T.pull1);
  const grip = _a.set(lead + side * 0.015, 1.4 - 0.04 * pull, CURT.Z + 0.03 + 0.05 * pull);
  _S.addScaledVector(_fa.subVectors(grip, _S).normalize(), 0.06 * smooth(seg(t, T.grab0, T.grab)));   // the shoulder follows the reach
  // parting: fingers point into the gap, palms face outward and hook the edges
  const hfG = _hf.set(-side * 0.12, 0.28, -1).normalize(), pnG = _pn.set(side, -0.1, -0.05).normalize();
  const wristAt = _b.copy(grip).addScaledVector(hfG, -0.12);
  if (t < T.grab) {
    const p = seg(t, T.grab0, T.grab), s = 1 - (1 - p) ** 2.2;
    const c1 = _fa.set(0, 0.12, -0.1).applyQuaternion(P.qBody).add(_rest);
    const c2 = new THREE.Vector3().copy(wristAt).add(V3(side * 0.05, -0.1, 0.12));
    bezier3(_Wt, _rest, c1, c2, wristAt, s);
  } else _Wt.copy(wristAt);
  _pole.set(side * 0.9, -0.6, 0.2).applyQuaternion(P.qBody);
  twoBoneIK(_S, _Wt, 0.31, 0.28, _pole, _E, _W);
  _fa.subVectors(_W, _E).normalize();
  const hf = _hf.lerp(_fa, 0.3).normalize();
  const curl = 0.3 + 0.4 * smooth(seg(t, T.grab - 0.08, T.grab + 0.04)) * (1 - smooth(seg(t, T.pull1, T.release)));
  arm.pose(_S, _E, _W, hf, _pn, curl);
}

// ---------------------------------------------------------------- the chip: device name + a tiny ringing clock
function drawChip(S, t, ring) {
  const g = S.chipG;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.clearRect(0, 0, CHIP.w, CHIP.h);
  let iconA = 0;
  DEVICES.forEach(([t0, t1], i) => {
    const kin = ease.outCubic(seg(t, t0 - 0.08, t0 + 0.24)), kout = seg(t, t1 - 0.1, t1 + 0.02);   // overlapping; exits are faster
    const alpha = kin * (1 - kout);
    if (alpha <= 0.001) return;
    g.globalAlpha = alpha;
    g.drawImage(S.pills[i], -14 * (1 - kin) - 10 * kout, 0);
    iconA = Math.max(iconA, alpha);
  });
  if (iconA > 0.001) {
    // the returning device in miniature: the tomato clock at 7:00, shaking while the real one rings
    g.globalAlpha = iconA;
    g.setTransform(1, 0, 0, 1, 14 + 46, 24 + 36);
    g.rotate(0.14 * ring * Math.sin(2 * Math.PI * 12.5 * t));
    g.fillStyle = PAL.accent;
    for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 12, -16, 9, Math.PI, 0); g.fill(); }
    g.beginPath(); g.arc(0, 0, 19, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff4e2';
    g.beginPath(); g.arc(0, 0, 13.5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#3a302b'; g.lineCap = 'round';
    g.lineWidth = 3.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(-Math.sin(Math.PI / 6) * 7.5, Math.cos(Math.PI / 6) * 7.5); g.stroke();   // 7
    g.lineWidth = 2.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -10.5); g.stroke();                                                      // :00
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  S.chipTex.needsUpdate = true;
}
