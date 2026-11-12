/*
 * 148 · 손전등 속을 들여다보면 — an exploded view: an invented compact flashlight comes apart along its axis, every part
 * is called out, and it snaps back together and switches on.
 *
 *   part table  PARTS drives everything: parent (the part it rides with), rest offset, explode vector dir·dist in the
 *               PARENT frame, stagger rank + delay, extra spin/tilt, overshoot, leader anchor, label. The scene graph
 *               mirrors the table (one THREE.Group per part under its parent), so a child's explode vector turns with
 *               its parent and the whole assembly can swing as one.
 *   stagger     start = T_EXP + 0.55·sin(π/2 · rank/3) + delay, duration grows with √dist, back.out overshoot;
 *               reassembly runs the ranks backwards with back.in (a small wind-up, then a snap) and all land by T_CLICK.
 *   callouts    a 3D anchor per part (axis point + radius toward the camera's right, re-solved each frame) is projected
 *               to the screen; labels are sorted by screen y and placed by weighted isotonic regression (PAVA) under a
 *               minimum-gap constraint; leaders are anchor → bus line → diagonal → label, which never cross because both
 *               ends are in the same order. Drawn on a 2D overlay canvas.
 *   finale      click (camera kick + ring flash), then the beam: an additive view-dependent cone (ShaderMaterial) whose
 *               generators are cut exactly at the floor, a lit disc built from that same footprint, dust lit only inside it.
 * Every value is a closed form of t.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';
import { defineDemo, rand, clamp, lerp, smooth, ease, track } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { COL, makeMaterials, makeCanvas, buildTail, buildSpring, buildBattery, buildBody, buildLed, buildReflector, buildLens,
  buildBezel } from './parts.js';

const D = 9, SW = 1080, SH = 1920;
const PV = '"Pretendard Variable"', MONO = '"JetBrains Mono Variable"';

// ---------------------------------------------------------------- timeline (s)
const T_EXP = 2.0;      // the parts start to separate
const T_LBL = 3.72;     // first leader draws
const T_HI = 4.7;       // the LED module is highlighted
const T_OUT = 6.2;      // callouts leave
const T_RE = 6.38;      // reassembly + swing to aim
const T_CLICK = 7.28;   // the bezel seats: click
const T_ON = 7.6;       // beam on

// ---------------------------------------------------------------- the part table
// rest: origin in the parent frame when assembled (axis +y) · dir, dist: explode vector in the parent frame
// order: stagger rank (0 = outermost) · delay: fine offset (s) · spin: turn about its own axis at full explode (rad)
// tilt: [mid-flight bump, rest] (rad) about the horizontal axis at angle phi · over: back.out overshoot
// anchor: [local y, radius] of the 3D leader anchor
const PARTS = [
  { id: 'body', parent: null, rest: [0, 0, 0], dir: [0, 1, 0], dist: 0, order: 0, delay: 0, spin: 0.35, tilt: [0, 0], phi: 0, over: 0,
    anchor: [-0.6, 1.125], label: '몸통', sub: '미끄럼 방지 널링 가공' },
  { id: 'bezel', parent: null, rest: [0, 3.9, 0], dir: [0, 1, 0], dist: 5.76, order: 0, delay: 0, spin: -1.7, tilt: [0.16, 0.03], phi: 0.6, over: 1.5,
    anchor: [0.05, 1.56], label: '베젤', sub: '렌즈를 눌러 고정하는 고리' },
  { id: 'lens', parent: 'bezel', rest: [0, 0.01, 0], dir: [0, -1, 0], dist: 1.46, order: 1, delay: 0.05, spin: 0.5, tilt: [0.12, 0.02], phi: 2.2, over: 1.9,
    anchor: [0, 1.36], label: '렌즈', sub: '강화 유리 · 반사 방지 코팅' },
  { id: 'reflector', parent: null, rest: [0, 3.205, 0], dir: [0, 1, 0], dist: 3.47, order: 2, delay: 0, spin: -0.6, tilt: [0.14, 0.025], phi: 4.1, over: 1.6,
    anchor: [0.25, 1.28], label: '반사경', sub: '빛을 한 방향으로 모은다' },
  { id: 'led', parent: null, rest: [0, 2.47, 0], dir: [0, 1, 0], dist: 2.4, order: 3, delay: 0, spin: 0.7, tilt: [0.1, 0.02], phi: 5.3, over: 2.0,
    anchor: [-0.1, 1.22], label: 'LED 모듈', sub: '빛을 만드는 곳', key: true },
  { id: 'battery', parent: null, rest: [0, -0.85, 0], dir: [0, -1, 0], dist: 6.55, order: 2, delay: 0.04, spin: 0.4, tilt: [0.12, 0.03], phi: 1.3, over: 1.3,
    anchor: [1.1, 0.855], label: '배터리', sub: '충전식 리튬 이온 전지' },
  { id: 'tail', parent: null, rest: [0, -4.2, 0], dir: [0, -1, 0], dist: 10.2, order: 0, delay: 0.06, spin: 1.7, tilt: [0.15, 0.03], phi: 3.4, over: 1.4,
    anchor: [0.1, 1.2], label: '테일 캡', sub: '누름 스위치가 들어 있다' },
  { id: 'spring', parent: 'tail', rest: [0, -0.1, 0], dir: [0, 1, 0], dist: 2.5, order: 1, delay: 0.08, spin: -0.9, tilt: [0.1, 0.02], phi: 0.2, over: 1.8,
    anchor: [0, 0.62], label: '스프링', sub: '배터리를 밀어 접점을 지킨다' },
];
const MAX_DIST = Math.max(...PARTS.map((p) => p.dist));
const MAX_RANK = 3;

// explosion: rank → start (one gesture: the ranks crowd together toward the end, sin-shaped spread), √dist → duration
for (const p of PARTS) {
  p.t0 = T_EXP + 0.55 * Math.sin((Math.PI / 2) * (p.order / MAX_RANK)) + p.delay;
  p.dur = 0.95 + 0.45 * Math.sqrt(p.dist / MAX_DIST);
  // reassembly: inner ranks land first, the outermost (bezel) exactly on the click
  p.t1end = T_CLICK - 0.07 * (MAX_RANK - p.order) - p.delay;
  p.t1dur = 0.5 + 0.22 * Math.sqrt(p.dist / MAX_DIST);
}
const backIn = (q, c) => (c + 1) * q * q * q - c * q * q;
/** explode amount e(t): 0 assembled → 1 exploded (overshoots on the way out, winds up before the snap back) */
function explodeOf(p, t) {
  if (t < T_RE) {
    const u = clamp((t - p.t0) / p.dur);
    return { e: u <= 0 ? 0 : ease.outBack(u, p.over), u, back: 0 };
  }
  const q = clamp((t - (p.t1end - p.t1dur)) / p.t1dur);
  return { e: 1 - backIn(q, 1.1), u: 1, back: q };
}

// ---------------------------------------------------------------- callout layout
const LX = 610;                         // left edge of the label column (px)
const LW = 470, LH = 104, REFY = 30;    // label image size, y of the name row's centre inside it
const ABOVE = REFY + 4, BELOW = LH - REFY, GAP = 12;
const TOP = 150, BOT = 1585;

/** weighted pool-adjacent-violators: the non-decreasing sequence closest to z in weighted least squares */
function pava(z, w) {
  const v = [], wt = [], n = [];
  for (let i = 0; i < z.length; i++) {
    v.push(z[i]); wt.push(w[i]); n.push(1);
    while (v.length > 1 && v[v.length - 2] > v[v.length - 1]) {
      const v2 = v.pop(), w2 = wt.pop(), n2 = n.pop(), v1 = v.pop(), w1 = wt.pop(), n1 = n.pop();
      v.push((v1 * w1 + v2 * w2) / (w1 + w2)); wt.push(w1 + w2); n.push(n1 + n2);
    }
  }
  const out = [];
  for (let b = 0; b < v.length; b++) for (let k = 0; k < n[b]; k++) out.push(v[b]);
  return out;
}
/**
 * Labels sorted by anchor y (a_i) must keep y_{i+1} − y_i ≥ s_i (s_i = below_i + GAP + above_{i+1}) inside [TOP, BOT].
 * With G_i = Σ_{k<i} s_k and z_i = y_i − G_i the gap constraints become z non-decreasing, so the closest layout is the
 * isotonic regression of a_i − G_i (PAVA), clipped to [TOP + above_0, BOT − below_last − G_last], plus G_i back.
 */
function layoutLabels(items) {
  const G = [0];
  for (let i = 1; i < items.length; i++) G.push(G[i - 1] + BELOW + GAP + ABOVE);
  const z = pava(items.map((it, i) => it.ay - G[i]), items.map((it) => it.w));
  const lo = TOP + ABOVE, hi = BOT - BELOW - G[G.length - 1];
  items.forEach((it, i) => { it.y = clamp(z[i], lo, hi) + G[i]; });
}

// ---------------------------------------------------------------- camera (target, orbit az/el, distance, fov, lens shift)
const K_CAM = [
  // t      tx    ty    tz    az     el     dist  fov  sx   sy
  [0.0,   [0.3, 16.9, 0.0, -0.42, 0.04, 31.0, 30, 0, 30]],
  [1.3,   [0.0, 17.4, 0.0, -0.06, 0.10, 32.5, 30, 0, 10], ease.outCubic],
  [3.35,  [0.0, 15.4, 0.0, 0.52, 0.32, 63.5, 30, 225, 25], ease.inOutCubic],
  [6.3,   [0.0, 15.4, 0.0, 0.66, 0.35, 60.5, 30, 225, 25], (p) => p],
  [7.3,   [-0.4, 6.0, 1.6, 0.42, 0.36, 53.0, 30, -50, 110], ease.inOutCubic],
  [D,     [-0.4, 5.9, 1.6, 0.37, 0.35, 50.0, 30, -50, 110], (p) => p],
];
const camTrack = track(K_CAM.map(([t, v, e]) => [t, v, e]));
// the click: a fast push-in that decays, plus a damped roll
const bumpK = (u, w) => (u <= 0 ? 0 : (u / w) * Math.exp(1 - u / w));
const kick = (t) => { const u = t - T_CLICK; return u < 0 ? [0, 0] : [0.035 * bumpK(u, 0.045), 0.012 * Math.exp(-u / 0.16) * Math.sin(u * 2 * Math.PI * 6)]; };

// ---------------------------------------------------------------- root pose (the whole assembly)
const AZ_HOLD = 0.6;                     // the column faces the camera's climax azimuth
const rootYaw = track([[0, -1.75], [1.95, AZ_HOLD, ease.outCubic]]);
const rootLean = track([[0, -1.25], [1.25, -0.1, ease.outCubic], [1.75, -0.05], [2.2, 0.05], [T_RE, 0.05]]);
const rootPitch = track([[0, 0.0], [T_EXP, 0.0], [4.05, 0.24, ease.inOutCubic]]);
const rootSpin = track([[0, -1.3], [2.0, 0.0, ease.outCubic], [T_RE, 0.2, (p) => p]]);
const rootPos = track([[0, [1.1, 15.7, 0]], [1.95, [0, 17.6, 0], ease.outCubic], [T_RE, [0, 17.6, 0]],
  [T_CLICK, [0.9, 10.6, 0.4], ease.inOutCubic]]);
const swingK = (t) => ease.inOutCubic(clamp((t - T_RE) / (T_CLICK - T_RE)));

defineDemo({
  id: '148-exploded-view',
  title: '손전등 속을 들여다보면',
  tech: '분해도 · 부품 계층 + 분해 벡터 + 3D 설명선',
  duration: D,
  background: '#121825',

  async setup(api) {
    const HL = api.headless;
    const allText = PARTS.map((p) => p.label + p.sub).join('');
    await Promise.all([
      fontReady(`800 40px ${PV}`, allText),
      fontReady(`500 24px ${PV}`, allText),
      fontReady(`600 21px ${MONO}`, '012345678'),
    ]);

    // ---- renderer
    const el = api.layer('canvas', { z: 0 });
    el.width = SW; el.height = SH;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(SW, SH, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.autoClear = false;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envTex = pmrem.fromScene(room, 0, 0.1, 100, { size: 128 }).texture;   // reflections, shiny materials only
    // soft studio fill for everything: the same room projected onto 9 spherical-harmonic coefficients (a LightProbe)
    const cubeRT = new THREE.WebGLCubeRenderTarget(32, { type: THREE.HalfFloatType });
    new THREE.CubeCamera(0.1, 100, cubeRT).update(renderer, room);
    const probe = await LightProbeGenerator.fromCubeRenderTarget(renderer, cubeRT);
    cubeRT.dispose();
    const camera = new THREE.PerspectiveCamera(30, SW / SH, 0.5, 300);

    // ---- backdrop: screen-space navy sweep with a soft glow behind the subject (drawn once)
    const bgScene = new THREE.Scene(), ortho = new THREE.OrthographicCamera(0, SW, 0, -SH, -1, 1);
    const [bgC, bgG] = makeCanvas(540, 960, HL);
    {
      const lg = bgG.createLinearGradient(0, 0, 0, 960);
      lg.addColorStop(0, '#0f1420'); lg.addColorStop(0.45, '#1b2333'); lg.addColorStop(0.72, '#18202e'); lg.addColorStop(1, '#0b0f17');
      bgG.fillStyle = lg; bgG.fillRect(0, 0, 540, 960);
      const rg = bgG.createRadialGradient(230, 400, 0, 230, 400, 520);
      rg.addColorStop(0, 'rgba(92,112,150,0.34)'); rg.addColorStop(0.5, 'rgba(70,88,124,0.12)'); rg.addColorStop(1, 'rgba(70,88,124,0)');
      bgG.fillStyle = rg; bgG.fillRect(0, 0, 540, 960);
    }
    const bgTex = new THREE.CanvasTexture(bgC);
    bgTex.colorSpace = THREE.SRGBColorSpace;
    const bgMat = new THREE.MeshBasicMaterial({ map: bgTex, toneMapped: false, depthTest: false, depthWrite: false });
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), bgMat);
    bg.position.set(SW / 2, -SH / 2, 0);
    bgScene.add(bg);

    // ---- lights: warm key (the only shadow caster), cool rim from behind, a dim sky/ground fill
    const key = new THREE.DirectionalLight('#fff1e0', 2.4);
    key.position.set(-16, 40, 22);
    key.target.position.set(0, 8, 0);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    Object.assign(key.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 5, far: 110 });
    key.shadow.radius = 7;
    key.shadow.blurSamples = 8;
    key.shadow.bias = -0.0005;
    const rim = new THREE.DirectionalLight('#b8ccff', 1.6);
    rim.position.set(20, 16, -18);
    const hemi = new THREE.HemisphereLight('#a9b8d8', '#2a2f3a', 0.3);
    scene.add(key, key.target, rim, hemi, probe);

    // ---- floor: dark studio floor whose alpha dissolves outward (VSM soft shadows + the beam's disc land on it)
    const [flC, flG] = makeCanvas(256, 256, HL);
    {
      const rg = flG.createRadialGradient(128, 128, 0, 128, 128, 128);
      // alphaMap reads the green channel: a grey ramp on black (not white with alpha)
      rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.3, '#b8b8b8'); rg.addColorStop(0.62, '#333333'); rg.addColorStop(1, '#000000');
      flG.fillStyle = '#000'; flG.fillRect(0, 0, 256, 256);
      flG.fillStyle = rg; flG.fillRect(0, 0, 256, 256);
    }
    const flTex = new THREE.CanvasTexture(flC);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshLambertMaterial({ color: '#1f2737',
      alphaMap: flTex, transparent: true }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.renderOrder = -1;
    scene.add(floor);

    // ---- the parts, as a scene graph that mirrors the table
    const M = makeMaterials(HL);
    // the matte surfaces (most of the screen) take lights only; metal, glass and the graphite bezel
    // also reflect the studio — the cheap split that keeps a CPU-rendered frame in budget
    const envMats = [M.alu, M.steel, M.glass, M.graphite];
    for (const m of envMats) m.envMap = envTex;
    const root = new THREE.Group();
    scene.add(root);
    const spring = buildSpring(M), led = buildLed(M);
    const built = {
      body: buildBody(M), bezel: buildBezel(M), lens: buildLens(M), reflector: buildReflector(M), led: led.group,
      battery: buildBattery(M), tail: buildTail(M), spring: spring.group,
    };
    const byId = {};
    for (const p of PARTS) {
      const g = new THREE.Group();
      g.add(built[p.id]);
      p.g = g;
      p.rest = new THREE.Vector3(...p.rest);
      p.dirV = new THREE.Vector3(...p.dir).normalize();
      p.tiltAxis = new THREE.Vector3(Math.cos(p.phi), 0, Math.sin(p.phi));
      byId[p.id] = p;
    }
    for (const p of PARTS) (p.parent ? byId[p.parent].g : root).add(p.g);
    // column order (top → bottom when exploded) numbers the callouts 01…08
    const worldY = (p) => p.rest.y + p.dirV.y * p.dist + (p.parent ? worldY(byId[p.parent]) : 0);
    [...PARTS].sort((a, b) => worldY(b) - worldY(a)).forEach((p, i) => { p.rank = i; });

    // ---- glow sprites (additive, real light sources only): LED die, lens
    const [gwC, gwG] = makeCanvas(128, 128, HL);
    {
      const rg = gwG.createRadialGradient(64, 64, 0, 64, 64, 64);
      rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.25, 'rgba(255,255,255,0.5)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      gwG.fillStyle = rg; gwG.fillRect(0, 0, 128, 128);
    }
    const glowTex = new THREE.CanvasTexture(gwC);
    const glow = (color, depthTest) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, depthTest,
        depthWrite: false, transparent: true, toneMapped: false }));
      s.visible = false; s.renderOrder = 10; scene.add(s); return s;
    };
    const ledGlow = glow(new THREE.Color(COL.amber), true), lensGlow = glow(new THREE.Color('#ffe2b0'), false);

    // ---- the final pose (static from the click on): beam volume, its footprint on the floor and the beam dust are fitted to it once
    const Y = new THREE.Vector3(0, 1, 0), qa = new THREE.Quaternion();
    const azF = K_CAM[K_CAM.length - 1][1][3];
    const right = new THREE.Vector3(Math.cos(azF), 0, -Math.sin(azF)), toCam = new THREE.Vector3(Math.sin(azF), 0, Math.cos(azF));
    const aimDir = new THREE.Vector3().addScaledVector(right, -0.3).addScaledVector(Y, -0.8).addScaledVector(toCam, 0.46).normalize();
    const qAim = new THREE.Quaternion().setFromUnitVectors(Y, aimDir).multiply(qa.setFromAxisAngle(Y, 0.9));
    function rootQuat(t, out) {
      out.setFromAxisAngle(Y, rootYaw(t));
      out.multiply(qa.setFromAxisAngle(new THREE.Vector3(1, 0, 0), rootPitch(t)));
      out.multiply(qa.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rootLean(t)));
      out.multiply(qa.setFromAxisAngle(Y, rootSpin(t)));
      const s = swingK(t);
      if (s > 0) out.slerp(qAim, s);
      return out;
    }
    const finalPos = new THREE.Vector3(...rootPos(D));
    const apex = finalPos.clone().addScaledVector(aimDir, 3.97);               // the lens centre
    const ALPHA = 0.2, R0 = 1.1;                                               // beam half-angle, aperture radius
    const sHit = apex.y / -aimDir.y, hit = apex.clone().addScaledVector(aimDir, sHit);
    const LEN = sHit * 1.6;

    // the beam volume: an open cylinder from the lens (r = R0) widening at ALPHA, lens end at the origin. Each generator
    // line (top vertex → bottom vertex) is cut exactly where it meets the floor plane y = 0, so the cone ends on the lit
    // ellipse without any depth trick; aS = 0…1 along the generator, aD = the generator's world length. The cut points
    // (world) are the exact footprint of the beam on the floor — a conic section — kept for the lit disc below.
    const SEGS = 64, foot = [];
    const coneGeo = new THREE.CylinderGeometry(R0, R0 + LEN * Math.tan(ALPHA), LEN, SEGS, 1, true);
    coneGeo.translate(0, -LEN / 2, 0);
    const coneQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), aimDir), coneQi = coneQ.clone().invert();
    {
      const P = coneGeo.attributes.position, aS = new Float32Array(P.count), aD = new Float32Array(P.count);
      const T = new THREE.Vector3(), B = new THREE.Vector3();
      for (let c = 0; c <= SEGS; c++) {
        const it = c, ib = SEGS + 1 + c;                                   // row 0 = lens ring, row 1 = far ring
        T.fromBufferAttribute(P, it).applyQuaternion(coneQ).add(apex);
        B.fromBufferAttribute(P, ib).applyQuaternion(coneQ).add(apex);
        const u = T.y / (T.y - B.y);
        B.lerpVectors(T, B, u);
        foot.push(B.clone());
        aD[it] = aD[ib] = B.distanceTo(T);
        aS[ib] = 1;
        B.sub(apex).applyQuaternion(coneQi);
        P.setXYZ(ib, B.x, B.y, B.z);
      }
      coneGeo.setAttribute('aS', new THREE.BufferAttribute(aS, 1));
      coneGeo.setAttribute('aD', new THREE.BufferAttribute(aD, 1));
    }
    const coneU = { uI: { value: 0 }, uHit: { value: sHit }, uColor: { value: new THREE.Color('#ffd9a0') } };
    const cone = new THREE.Mesh(coneGeo, new THREE.ShaderMaterial({
      uniforms: coneU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: `attribute float aS; attribute float aD; varying vec3 vN; varying vec3 vV; varying float vS; varying float vD;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vN = normalize(mat3(modelMatrix) * normal);
          vV = normalize(cameraPosition - wp.xyz);
          vS = aS; vD = aS * aD;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      // brightness ~ path length through a soft cone: |n·v|² (0 on the silhouette), fading with distance from the lens,
      // a soft start at the glass, and gone over the last quarter so the lit disc (not the volume) carries the floor
      fragmentShader: `varying vec3 vN; varying vec3 vV; varying float vS; varying float vD; uniform float uI; uniform float uHit; uniform vec3 uColor;
        void main() {
          float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
          float d = clamp(vD / uHit, 0.0, 1.2);
          float along = (1.0 - 0.6 * d) * smoothstep(0.0, 0.06, d);
          float floorFade = 1.0 - smoothstep(0.72, 1.0, clamp(vS, 0.0, 1.0));
          gl_FragColor = vec4(uColor * uI * f * f * along * floorFade, 1.0);
        }`,
    }));
    cone.position.copy(apex);
    cone.quaternion.copy(coneQ);
    cone.renderOrder = 5;
    cone.visible = false;
    scene.add(cone);
    // the lit disc: 15 rings scaled from the axis hit point toward that exact footprint (f = 0 … 1.38) with brightness
    // b(f) = (0.55 + 0.45·e^−(f/0.45)²)·(1 − smooth((f − 0.82)/0.55)): hot centre, flat body, soft penumbra past f = 1
    const RINGS = [];
    for (let i = 0; i <= 14; i++) {
      const f = (i / 14) * 1.38;
      RINGS.push([f, (0.55 + 0.45 * Math.exp(-((f / 0.45) ** 2))) * (1 - smooth((f - 0.82) / 0.55))]);
    }
    const fp = [], fc = [], fi = [];
    for (const [f, b] of RINGS) for (let c = 0; c <= SEGS; c++) {
      const q = hit.clone().lerp(foot[c], f);
      fp.push(q.x, 0.02, q.z); fc.push(b, b, b);
    }
    for (let r = 0; r < RINGS.length - 1; r++) for (let c = 0; c < SEGS; c++) {
      const a = r * (SEGS + 1) + c, b2 = a + SEGS + 1;
      fi.push(a, b2, a + 1, a + 1, b2, b2 + 1);
    }
    const footGeo = new THREE.BufferGeometry();
    footGeo.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3));
    footGeo.setAttribute('color', new THREE.Float32BufferAttribute(fc, 3));
    footGeo.setIndex(fi);
    const decal = new THREE.Mesh(footGeo, new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(0, 0, 0),
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
    decal.renderOrder = 4;
    scene.add(decal);

    // ---- dust: ambient motes around the studio + motes inside the beam (lit only by it); closed-form drift
    const R = rand(14808);
    const motes = [];
    for (let i = 0; i < 150; i++) motes.push({ p: new THREE.Vector3((R() * 2 - 1) * 16, 1 + R() * 28, (R() * 2 - 1) * 12), beam: false });
    const perp1 = new THREE.Vector3().crossVectors(aimDir, Y).normalize(), perp2 = new THREE.Vector3().crossVectors(aimDir, perp1);
    for (let i = 0; i < 230; i++) {
      const s = 0.6 + R() * (sHit - 0.6), a = R() * Math.PI * 2, r = Math.sqrt(R()) * (R0 + s * Math.tan(ALPHA)) * 0.95;
      const p = apex.clone().addScaledVector(aimDir, s).addScaledVector(perp1, Math.cos(a) * r).addScaledVector(perp2, Math.sin(a) * r);
      motes.push({ p, beam: true, s });
    }
    for (const m of motes) { m.ph = R() * 6.283; m.sp = 0.15 + R() * 0.3; m.b = 0.3 + R() * 0.7; }
    const dGeo = new THREE.BufferGeometry();
    const dPos = new Float32Array(motes.length * 3), dCol = new Float32Array(motes.length * 3);
    dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
    dGeo.setAttribute('color', new THREE.BufferAttribute(dCol, 3));
    const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ size: 0.16, map: glowTex, vertexColors: true, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, sizeAttenuation: true }));
    dust.frustumCulled = false;
    dust.renderOrder = 6;
    scene.add(dust);

    // ---- overlay (callouts, ring flash): one 2D canvas; label images baked once
    const ov = api.layer('canvas', { z: 5 });
    ov.width = SW; ov.height = SH;
    const g = ov.getContext('2d', HL ? { willReadFrequently: true } : undefined);
    const CREAM = '#ece4d6', AMBER = COL.amber;
    const labelImage = (p, emph) => {
      const [c, x] = makeCanvas(LW, LH, HL);
      x.textBaseline = 'alphabetic';
      x.font = `600 21px ${MONO}`;
      x.fillStyle = emph ? AMBER : 'rgba(236,228,214,0.5)';
      x.fillText(String(p.rank + 1).padStart(2, '0'), 0, 43);
      x.font = `800 40px ${PV}`;
      x.fillStyle = emph ? AMBER : CREAM;
      x.fillText(p.label, 40, 45);
      const nw = x.measureText(p.label).width;
      x.font = `500 24px ${PV}`;
      x.fillStyle = emph ? 'rgba(255,222,170,0.95)' : 'rgba(236,228,214,0.6)';
      x.fillText(p.sub, 40, 86);
      if (emph) { x.fillStyle = AMBER; x.fillRect(40, 56, nw, 3); }
      return c;
    };
    for (const p of PARTS) {
      p.img = labelImage(p, false);
      if (p.key) p.imgHi = labelImage(p, true);
      g.drawImage(p.img, 0, 0);                    // warm-up: first composite of each offscreen happens in setup
      if (p.imgHi) g.drawImage(p.imgHi, 0, 0);
    }
    g.clearRect(0, 0, SW, SH);

    // caption scrim (static) so the harness caption reads over the floor glow
    const scrim = api.layer('div', { z: 999 });
    scrim.style.background = 'linear-gradient(to bottom, rgba(11,15,23,0) 80%, rgba(11,15,23,.45) 90%, rgba(11,15,23,.7) 100%)';
    scrim.style.pointerEvents = 'none';

    Object.assign(this, {
      renderer, scene, camera, bgScene, ortho, bgMat, key, rim, hemi, probe, envMats, root, M, spring, led, ledGlow, lensGlow, cone, coneU,
      decal, dust, motes, dPos, dCol, aimDir, apex, sHit, g, ov, CREAM, AMBER, rootQuat, byId,
    });
    // compile every program once so no timed frame does, hidden objects too (compile() skips invisible ones)
    this.frame(0);
    for (const o of [cone, ledGlow, lensGlow]) o.visible = true;     // the next frame(t) sets them again
    renderer.compile(scene, camera);
    renderer.render(scene, camera);
    // SwiftShader runs the queued GL work (and compiles each program's routines) in the GPU process later; a 1-pixel
    // read waits for it here, so it lands in setup instead of in the first captured frame (headless check only)
    if (HL) renderer.getContext().readPixels(0, 0, 1, 1, renderer.getContext().RGBA, renderer.getContext().UNSIGNED_BYTE, new Uint8Array(4));
  },

  frame(t) {
    const S = this, { camera } = S;

    // ---- light levels
    const up = smooth(t / 0.9);                                           // studio lights come up
    const on = ease.outCubic(clamp((t - T_ON) / 0.35));                   // beam
    const dim = smooth((t - T_ON + 0.05) / 0.45);                         // the studio dims for it
    S.renderer.toneMappingExposure = 0.45 + 0.55 * up;
    S.key.intensity = 2.4 * (0.35 + 0.65 * up) * (1 - 0.6 * dim);
    S.rim.intensity = 1.6 * (1 - 0.35 * dim);
    S.hemi.intensity = 0.3 * (1 - 0.4 * dim);
    S.probe.intensity = 0.7 * (0.5 + 0.5 * up) * (1 - 0.55 * dim);
    for (const m of S.envMats) m.envMapIntensity = 0.55 * (0.5 + 0.5 * up) * (1 - 0.55 * dim);
    S.bgMat.color.setScalar(0.55 + 0.45 * up - 0.35 * dim);

    // ---- root pose and every part from the table
    S.root.position.set(...rootPos(t));
    S.rootQuat(t, S.root.quaternion);
    const pop = (u, w) => (u <= 0 ? 0 : Math.exp(-u / w) * Math.sin(Math.min(u / w, Math.PI)));
    const hi = smooth((t - T_HI) / 0.35) * (1 - smooth((t - T_OUT) / 0.3));
    for (const p of PARTS) {
      const { e, u, back } = explodeOf(p, t);
      p.e = e;
      p.g.position.copy(p.rest).addScaledVector(p.dirV, p.dist * e);
      // extra rotation: a tilt that peaks mid-flight and settles to a small rest tilt, plus a spin about the own axis
      const tilt = p.tilt[0] * Math.sin(Math.PI * u) * (1 - back) + p.tilt[1] * e + p.tilt[0] * 0.6 * Math.sin(Math.PI * back);
      p.g.quaternion.setFromAxisAngle(p.tiltAxis, tilt);
      p.g.rotateY(p.spin * e + 0.08 * Math.sin(t * 0.7 + p.phi) * smooth((t - 3.6) / 0.8) * (1 - smooth((t - T_RE) / 0.3)));
      if (p.key) p.g.scale.setScalar(1 + 0.08 * pop(t - T_HI, 0.12));
    }
    S.spring.setLength(clamp(S.byId.spring.e));                          // the spring relaxes as it leaves the cap
    S.M.hull.opacity = 0.95 * hi;
    S.M.die.emissiveIntensity = 1.6 * hi + 9 * on;

    // ---- camera
    const [tx, ty, tz, az, elv, dist0, fov, sx, sy] = camTrack(t);
    const [kz, roll] = kick(t);
    const dist = dist0 * (1 - kz);
    camera.fov = fov;
    camera.position.set(tx + dist * Math.sin(az) * Math.cos(elv), ty + dist * Math.sin(elv), tz + dist * Math.cos(az) * Math.cos(elv));
    camera.up.set(0, 1, 0);
    camera.lookAt(tx, ty, tz);
    camera.rotateZ(roll);
    camera.setViewOffset(SW, SH, sx, sy, SW, SH);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    S.scene.updateMatrixWorld(true);

    // ---- light sources: LED highlight glow, beam (cone, lit disc, lens glow)
    const v = new THREE.Vector3();
    const dieW = S.led.die.getWorldPosition(new THREE.Vector3());
    S.ledGlow.visible = hi > 0.002;
    S.ledGlow.position.copy(dieW).addScaledVector(v.copy(camera.position).sub(dieW).normalize(), 0.7);
    S.ledGlow.scale.setScalar(1.7 * (1 + 0.2 * pop(t - T_HI, 0.15)));
    S.ledGlow.material.opacity = 0.55 * hi;
    S.cone.visible = on > 0.001;
    S.coneU.uI.value = 0.2 * on;
    S.decal.material.color.setRGB(0.74, 0.56, 0.36).multiplyScalar(on);
    const facing = Math.max(0, S.aimDir.dot(v.copy(camera.position).sub(S.apex).normalize()));
    S.lensGlow.visible = on > 0.001;
    S.lensGlow.position.copy(S.apex).addScaledVector(S.aimDir, 0.12);
    S.lensGlow.scale.setScalar(6.5 * (0.6 + 0.4 * on));
    S.lensGlow.material.opacity = on * (0.35 + 0.65 * facing);

    // ---- dust
    for (let i = 0; i < S.motes.length; i++) {
      const m = S.motes[i];
      const x = m.p.x + Math.sin(m.ph + t * m.sp) * 0.4, y = m.p.y + Math.sin(m.ph * 1.7 + t * 0.35) * 0.3 + t * 0.06,
        z = m.p.z + Math.cos(m.ph + t * m.sp * 0.8) * 0.35;
      S.dPos[i * 3] = x; S.dPos[i * 3 + 1] = y; S.dPos[i * 3 + 2] = z;
      const tw = 0.6 + 0.4 * Math.sin(m.ph * 3 + t * 1.6);
      let k;
      if (m.beam) k = on * m.b * tw * (1 - 0.6 * (m.s / S.sHit)) * 0.85;
      else k = 0.1 * m.b * tw * up * (1 - 0.5 * dim);
      if (m.beam) { S.dCol[i * 3] = k; S.dCol[i * 3 + 1] = k * 0.86; S.dCol[i * 3 + 2] = k * 0.62; }
      else { S.dCol[i * 3] = k * 0.8; S.dCol[i * 3 + 1] = k * 0.88; S.dCol[i * 3 + 2] = k; }
    }
    S.dust.geometry.attributes.position.needsUpdate = true;
    S.dust.geometry.attributes.color.needsUpdate = true;

    // ---- render
    const r = S.renderer;
    r.clear();
    r.render(S.bgScene, S.ortho);
    r.render(S.scene, camera);

    // ---- overlay: callouts and the click
    this.drawOverlay(t, hi);
  },

  /** project each part's anchor, lay the labels out, draw leaders, dots and labels; then the ring flash */
  drawOverlay(t, hi) {
    const S = this, g = S.g, camera = S.camera;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.setLineDash([]);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    const live = t > T_LBL - 0.05 && t < T_OUT + 0.6, click = t >= T_CLICK && t < T_CLICK + 0.55;
    // an untouched blank canvas is not re-uploaded by the compositor: clear only when the last frame left marks
    // (the pixels are the same either way — blank — so this does not make the picture depend on the previous frame)
    if (!live && !click) { if (S.ovDirty) { g.clearRect(0, 0, SW, SH); S.ovDirty = false; } return; }
    g.clearRect(0, 0, SW, SH);
    S.ovDirty = true;

    if (live) {
      const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      const items = [];
      for (const p of PARTS) {
        // 3D anchor: on the part's axis at its anchor height, pushed out by its radius toward the camera's right
        const c = p.g.localToWorld(new THREE.Vector3(0, p.anchor[0], 0));
        const ax = new THREE.Vector3(0, 1, 0).applyQuaternion(p.g.getWorldQuaternion(new THREE.Quaternion()));
        const side = camRight.clone().addScaledVector(ax, -camRight.dot(ax)).normalize();
        const tc = camera.position.clone().sub(c);
        const front = tc.addScaledVector(ax, -tc.dot(ax)).normalize();
        const w = c.addScaledVector(side, p.anchor[1] * Math.cos(0.6)).addScaledVector(front, p.anchor[1] * Math.sin(0.6));
        w.project(camera);
        items.push({ p, ax: (w.x + 1) * 0.5 * SW, ay: (1 - w.y) * 0.5 * SH, w: p.key ? 4 : 1 });
      }
      items.sort((a, b) => a.ay - b.ay);
      layoutLabels(items);
      const busX = Math.min(Math.max(...items.map((it) => it.ax)) + 34, LX - 120);
      const diagX = LX - 44;

      for (const it of items) {
        const k = it.p.rank, tin = T_LBL + 0.07 * k, tout = T_OUT + 0.025 * k;
        const dotIn = clamp((t - tin) / 0.24), lineIn = ease.outCubic(clamp((t - tin - 0.06) / 0.4));
        const labIn = ease.outCubic(clamp((t - tin - 0.3) / 0.32));
        const labOut = clamp((t - tout) / 0.14), lineOut = ease.inCubic(clamp((t - tout - 0.03) / 0.18));
        const dotOut = clamp((t - tout - 0.17) / 0.1);
        const isKey = !!it.p.key, dimK = isKey ? 1 : 1 - 0.35 * hi;
        // leader: anchor → bus (horizontal) → diagonal → into the label
        const pts = [[it.ax, it.ay], [busX, it.ay], [diagX, it.y], [LX - 14, it.y]];
        const seg = [];
        let L = 0;
        for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
        const shown = L * lineIn * (1 - lineOut);
        if (shown > 0.5) {
          g.globalAlpha = (isKey ? 0.95 : 0.78) * dimK;
          g.strokeStyle = isKey && hi > 0 ? mixHex(S.CREAM, S.AMBER, hi) : S.CREAM;
          g.lineWidth = isKey ? 2.4 + 0.8 * hi : 2.2;
          g.beginPath();
          g.moveTo(pts[0][0], pts[0][1]);
          let acc = 0;
          for (let i = 1; i < pts.length; i++) {
            const l = seg[i - 1];
            if (acc + l <= shown) { g.lineTo(pts[i][0], pts[i][1]); acc += l; continue; }
            const f = (shown - acc) / l;
            g.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f));
            break;
          }
          g.stroke();
        }
        // anchor dot: navy ring + cream (amber for the key part) core, popped in with back.out
        const ds = (dotIn > 0 ? ease.outBack(dotIn, 2.2) : 0) * (1 - dotOut);
        if (ds > 0.01) {
          g.globalAlpha = dimK;
          g.fillStyle = COL.navy;
          g.beginPath(); g.arc(it.ax, it.ay, 9 * ds, 0, Math.PI * 2); g.fill();
          g.fillStyle = isKey && hi > 0 ? mixHex(S.CREAM, S.AMBER, hi) : S.CREAM;
          g.beginPath(); g.arc(it.ax, it.ay, (isKey ? 5 + 1.5 * hi : 5) * ds, 0, Math.PI * 2); g.fill();
        }
        // label: slides in from the left under a widening clip; the key part crossfades to its accent version
        const la = labIn * (1 - labOut);
        if (la > 0.002) {
          const x = LX + (1 - labIn) * -22 - labOut * 12, y = it.y - REFY;
          g.save();
          g.beginPath(); g.rect(LX - 30, y - 10, (LW + 40) * Math.min(1, labIn * 1.25), LH + 20); g.clip();
          g.globalAlpha = la * dimK * (isKey ? 1 - hi : 1);
          g.drawImage(it.p.img, x, y);
          if (isKey && hi > 0) { g.globalAlpha = la * hi; g.drawImage(it.p.imgHi, x, y); }
          g.restore();
        }
      }
      g.globalAlpha = 1;
    }

    // ---- the click: one ring from the bezel seam + a short warm flash
    const u = t - T_CLICK;
    if (click) {
      const seam = S.byId.bezel.g.localToWorld(new THREE.Vector3(0, -0.45, 0)).project(camera);
      const cx = (seam.x + 1) * 0.5 * SW, cy = (1 - seam.y) * 0.5 * SH;
      const k = u / 0.55, e = ease.outExpo(k);
      g.globalAlpha = 0.9 * Math.pow(1 - k, 1.4);
      g.strokeStyle = S.CREAM;
      g.lineWidth = 9 * (1 - k) + 1;
      g.beginPath(); g.arc(cx, cy, 36 + 250 * e, 0, Math.PI * 2); g.stroke();
      const f = clamp(u / 0.22);
      if (f < 1) { g.globalAlpha = 0.16 * (1 - f) * (1 - f); g.fillStyle = '#fff3df'; g.fillRect(0, 0, SW, SH); }
      g.globalAlpha = 1;
    }
  },
});

function mixHex(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, clamp(k)));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
