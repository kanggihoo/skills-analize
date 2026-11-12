/*
 * 147 · 손안의 온도 — a product hero shot: an invented insulated tumbler on a turntable in a dark studio.
 *
 *   object   product.js: one designed profile curve (base fillet, foot, waist, shoulder, seam, band, rolled lip) turned
 *            by LatheGeometry; a brushed-steel band and a separate lid (plug, gasket, flange, dome, mouthpiece).
 *   material MeshPhysicalMaterial: powder-coated paint with a grain normal map under a clear coat; brushed stainless
 *            (anisotropy + line texture as roughness/bump); satin lid plastic. Room reflections: RoomEnvironment
 *            → PMREMGenerator, rotated with the key so the reflected room agrees with the lamps.
 *   light    classic three-point rig of RectAreaLights (real soft-box highlights, LTC): key 5600 K strip soft box,
 *            fill 8000 K large and low, rim 3300 K behind. Ratios are set as illuminance at the product
 *            (key 1 : fill 1/4 : rim 1.8); each lamp's intensity = E / form factor of its rectangle (Lambert polygon).
 *            The floor has its own small shader: the same three soft boxes, diffuse form factor only, fog, alpha fade.
 *   shadow   contact shadow: the product is drawn from below into small alpha targets (alpha = falloff of height),
 *            once straight down (tight contact) and once sheared away from the key (soft key shadow), blurred with a
 *            separable Gaussian and laid on planes on the floor; the variants reuse the same maps.
 *   story    0–1.5 rim only (edges first) · 1.5–4 key sweeps round, its highlight band travels over the body, fill comes
 *            up · 4–6.5 hero angle (low 3/4), lid lifts, three callouts with leader lines anchored to 3D points ·
 *            6.5–9 pull back, three colourways slide in beside it, the name. Every value is a closed form of t.
 *   render   straight to the antialiased canvas (no post chain); ACES tone mapping inside every material.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { defineDemo, clamp, lerp, smooth, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { makeMaterials, buildTumbler, geos, radiusAt, LIP_Y } from './product.js';

const D = 9, W = 1080, H = 1920;
const PV = '"Pretendard Variable"';
const AIM = new THREE.Vector3(0, 0.98, 0);          // where every lamp points (the product's middle)

// ---------------------------------------------------------------- palette: warm studio greys + ONE accent (the hero colour)
const C = { ink: '#f4ede4', mute: 'rgba(244,237,228,0.62)', line: 'rgba(244,237,228,0.88)', accent: '#ee6c3f' };
const HORIZON = new THREE.Color('#2a2421');         // backdrop at the horizon = fog colour (the floor melts into it)
const FLOOR = { x: 0.6, z: -1.0, R: 20, r0: 5.5, r1: 13 };      // floor square centre, half size, alpha fade radii

// ---------------------------------------------------------------- timeline (s)
const T = {
  rim: [0.12, 1.3], key: [1.35, 2.05], sweep: [1.35, 3.95], fill: [2.1, 3.7],
  lidOpen: [4.05, 4.6], lidClose: [6.42, 6.86],
  co: [4.38, 4.6, 4.82], coOut: 6.2,
  vIn: [6.5, 6.66, 6.82], vDur: 1.1,
  name: 7.2, tag: 7.42, labels: 7.62, glint: [7.95, 8.7],
};

// ---------------------------------------------------------------- the three-point rig (illuminance ratios, colour temperature)
const RIG = {
  key:  { K: 5600, E: 1.0,  w: 1.0, h: 3.4, dist: 2.8, el: 0.12, elWide: 0.5, aim: 1.0 },    // a standing strip box: the tapered body mirrors low
  fill: { K: 8000, E: 0.25, w: 3.2, h: 2.8, dist: 4.4, el: 0.1, az: 2.2, aim: 0.98 },   // on the shadow side: its broad reflection shapes the right edge
  rim:  { K: 3300, E: 1.8,  w: 2.4, h: 2.3, dist: 3.1, el: 0.1, az: Math.PI, aim: 1.2, keepH: true },   // aimed level: it grazes the edges, not the floor
};
const EXPOSE = 1.45;                                   // illuminance of the key at the product (scene units)
const KEY_AZ0 = -2.55, KEY_AZ1 = -0.52;               // the key travels from behind-left to front-left
const RIG_LINEUP = { x: 0.55, z: -0.85, k: 1.9 };      // afterglow: the rig re-centred toward the lineup, 1.9× larger

/** Tanner Helland's fit of the Planckian locus: colour temperature (K) → sRGB, returned as a linear THREE.Color */
function kelvin(K) {
  const t = K / 100;
  let r, g;
  if (t <= 66) { r = 255; g = 99.4708025861 * Math.log(t) - 161.1195681661; }
  else { r = 329.698727446 * Math.pow(t - 60, -0.1332047592); g = 288.1221695283 * Math.pow(t - 60, -0.0755148492); }
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  const c = (v) => clamp(v, 0, 255) / 255;
  return new THREE.Color().setRGB(c(r), c(g), c(b), THREE.SRGBColorSpace);
}

/** Lambert's polygon formula: the fraction of a full hemisphere a rectangular lamp delivers to point p with normal n */
function formFactor(light, p, n) {
  light.updateMatrixWorld(true);
  const hw = light.width / 2, hh = light.height / 2;
  const v = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => new THREE.Vector3(x, y, 0).applyMatrix4(light.matrixWorld).sub(p).normalize());
  let s = 0;
  for (let i = 0; i < 4; i++) {
    const a = v[i], b = v[(i + 1) % 4];
    s += Math.acos(clamp(a.dot(b), -1, 1)) * new THREE.Vector3().crossVectors(a, b).normalize().dot(n);
  }
  return Math.abs(s) / (2 * Math.PI);
}

// a lamp on a sphere around the rig centre (cx, cz); scaling distance AND size by k keeps its form factor, so the
// illuminance it gives at the centre does not change when the whole rig is moved out to light the lineup
function place(light, R, az, cx = 0, cz = 0, k = 1, el = R.el) {
  light.position.set(cx + k * R.dist * Math.sin(az) * Math.cos(el), AIM.y + k * R.dist * Math.sin(el), cz + k * R.dist * Math.cos(az) * Math.cos(el));
  light.width = R.w * k; light.height = R.h * (R.keepH ? 1 : k);
  light.lookAt(cx, R.aim, cz);
}

// ---------------------------------------------------------------- monotone cubic keys (Fritsch–Carlson): eased, no overshoot
function keys(list) {
  const n = list.length, dim = list[0][1].length;
  const m = list.map(() => new Array(dim).fill(0));
  for (let j = 0; j < dim; j++) {
    for (let k = 1; k < n - 1; k++) {
      const h0 = list[k][0] - list[k - 1][0], h1 = list[k + 1][0] - list[k][0];
      const d0 = (list[k][1][j] - list[k - 1][1][j]) / h0, d1 = (list[k + 1][1][j] - list[k][1][j]) / h1;
      m[k][j] = d0 * d1 <= 0 || list[k][2] === 'hold' ? 0 : (3 * (h0 + h1)) / ((2 * h1 + h0) / d0 + (h1 + 2 * h0) / d1);
    }
  }
  return (t) => {
    if (t <= list[0][0]) return list[0][1].slice();
    if (t >= list[n - 1][0]) return list[n - 1][1].slice();
    let i = 0;
    while (t > list[i + 1][0]) i++;
    const [ta, va] = list[i], [tb, vb] = list[i + 1], h = tb - ta, s = (t - ta) / h, s2 = s * s, s3 = s2 * s;
    return va.map((a, j) => (2 * s3 - 3 * s2 + 1) * a + (s3 - 2 * s2 + s) * h * m[i][j] + (-2 * s3 + 3 * s2) * vb[j] + (s3 - s2) * h * m[i + 1][j]);
  };
}

const HERO_AZ = 0.85;                                 // the hero angle: the key (−0.52) becomes a side light (78°)
// camera: azimuth (from +z toward +x), elevation, distance, look-at point, vertical fov, lens shift (px)
const CAM = keys([
  [0.0,  [0.0,  0.2,   7.5, 0, 1.0, 0, 26, 0]],
  [1.5,  [0.07, 0.15,  6.9, 0, 1.0, 0, 26, 0]],
  [3.55, [0.26, 0.09,  6.95, 0, 1.0, 0, 26, 0]],
  [4.8,  [HERO_AZ, -0.05, 9.1, 0, 1.03, 0, 26, 30]],
  [6.4,  [HERO_AZ + 0.08, -0.035, 8.85, 0, 1.03, 0, 26, 30]],
  [7.25, [0.5, 0.2, 12.2, 0.45, 1.0, -0.7, 26, 30]],
  [8.35, [-0.14, 0.3,  14.3, 1.05, 0.95, -1.6, 26, -55]],
  [9.0,  [-0.17, 0.305, 13.95, 1.05, 0.95, -1.6, 26, -55]],
]);

// the turntable: a slow constant drift plus one eased half-turn while the key sweeps
const spin = (t) => -0.35 + 0.08 * t + 1.0 * ease.inOutCubic(clamp((t - 1.2) / 3.6));
const keyAz = (t) => (t < 4 ? lerp(KEY_AZ0, KEY_AZ1, ease.inOutCubic(clamp((t - T.sweep[0]) / (T.sweep[1] - T.sweep[0]))))
  : lerp(KEY_AZ1, KEY_AZ1 - 0.14, smooth((t - 4) / 5)));
const lv = {
  rim: (t) => ease.inOutCubic(clamp((t - T.rim[0]) / (T.rim[1] - T.rim[0]))),
  key: (t) => ease.outCubic(clamp((t - T.key[0]) / (T.key[1] - T.key[0]))),
  fill: (t) => smooth((t - T.fill[0]) / (T.fill[1] - T.fill[0])),
  env: (t) => smooth((t - 1.5) / 2.2),
  bg: (t) => 0.14 + 0.86 * smooth((t - 1.4) / 2.5),
};

// ---------------------------------------------------------------- the colourways (same geometry, swapped material)
const WAYS = [
  { name: '노을', mat: 'hero', swatch: '#c8522b' },
  { name: '백자', mat: 'porcelain', swatch: '#e4ded3', at: [0.86, -1.22] },
  { name: '먹', mat: 'ink', swatch: '#26272a', at: [1.72, -2.44] },
  { name: '스틸', mat: 'steelBody', swatch: '#b9bcc1', at: [2.58, -3.66] },
];

// ---------------------------------------------------------------- callouts: 3D anchor + label side
const CALLOUTS = [
  { n: '01', title: '실리콘 패킹', sub: '뒤집어도 새지 않게', side: -1, part: 'gasket', az: -1.0, dy: -60 },
  { n: '02', title: '스틸 립', sub: '입술엔 맨 금속만', side: 1, part: 'band', az: 0.74, y: 1.745, dy: -70 },
  { n: '03', title: '파우더 코팅', sub: '젖은 손에도 단단히', side: -1, part: 'body', az: -0.74, y: 0.78, dy: -56 },
];

// ---------------------------------------------------------------- GLSL for the contact-shadow passes (through three.js)
const SHADOW_VS = /* glsl */`
  uniform vec2 uC, uShear; uniform float uHalf, uH;
  varying float vH;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vH = w.y;
    vec2 p = (w.xz + uShear * w.y - uC) / uHalf;          // project onto the floor (sheared away from the key)
    gl_Position = vec4(p.x, -p.y, clamp(w.y / uH, 0.0, 1.0) * 1.96 - 0.98, 1.0);   // lowest point wins the depth test
  }`;
const SHADOW_FS = /* glsl */`
  uniform float uH, uDark, uPow;
  varying float vH;
  void main() {
    float k = clamp(1.0 - vH / uH, 0.0, 1.0);
    gl_FragColor = vec4(0.0, 0.0, 0.0, uDark * pow(k, uPow));
  }`;
const QUAD_VS = /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
// 9-tap Gaussian folded into 5 bilinear fetches
const BLUR_FS = /* glsl */`
  uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv;
  void main() {
    vec4 s = texture2D(tMap, vUv) * 0.2270270270;
    s += (texture2D(tMap, vUv + uDir * 1.3846153846) + texture2D(tMap, vUv - uDir * 1.3846153846)) * 0.3162162162;
    s += (texture2D(tMap, vUv + uDir * 3.2307692308) + texture2D(tMap, vUv - uDir * 3.2307692308)) * 0.0702702703;
    gl_FragColor = s;
  }`;

// the floor: only the DIFFUSE light of each soft box (the same vector form factor three evaluates for a RectAreaLight,
// with an identity LTC), so the floor costs 3 form factors per pixel instead of 6, then fog and a radial alpha fade
const FLOOR_VS = /* glsl */`
  #include <fog_pars_vertex>
  varying vec3 vW;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vec4 mvPosition = viewMatrix * w;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;
const FLOOR_FS = /* glsl */`
  #include <fog_pars_fragment>
  uniform vec3 uAlbedo, uLampP[3], uLampW[3], uLampH[3], uLampC[3];
  uniform vec2 uFade, uCentre;
  varying vec3 vW;
  vec3 edgeFF(vec3 v1, vec3 v2) {
    float x = dot(v1, v2), y = abs(x);
    float a = 0.8543985 + (0.4965155 + 0.0145206 * y) * y;
    float b = 3.4175940 + (4.1616724 + y) * y;
    float v = a / b;
    float ts = (x > 0.0) ? v : 0.5 * inversesqrt(max(1.0 - x * x, 1e-7)) - v;
    return cross(v1, v2) * ts;
  }
  float rectDiffuse(vec3 P, vec3 c, vec3 hw, vec3 hh) {
    vec3 r0 = c + hw - hh, r1 = c - hw - hh, r2 = c - hw + hh, r3 = c + hw + hh;
    if (dot(cross(r1 - r0, r3 - r0), P - r0) < 0.0) return 0.0;      // behind the lamp
    vec3 a = normalize(r0 - P), b = normalize(r1 - P), d = normalize(r2 - P), e = normalize(r3 - P);
    vec3 f = edgeFF(a, b) + edgeFF(b, d) + edgeFF(d, e) + edgeFF(e, a);
    float l = length(f);
    // horizon-clipped sphere form factor; three's LTC frame (T1, -N×T1, N) is left-handed, so in world space the
    // normal component enters with a minus sign
    return max((l * l - f.y) / (l + 1.0), 0.0);
  }
  void main() {
    vec3 E = vec3(0.0);
    for (int i = 0; i < 3; i++) E += uLampC[i] * rectDiffuse(vW, uLampP[i], uLampW[i], uLampH[i]);
    float r = length(vW.xz - uCentre);
    gl_FragColor = vec4(uAlbedo * E, 1.0 - smoothstep(uFade.x, uFade.y, r));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }`;

// ---------------------------------------------------------------- backdrop: an inside-out sphere painted by elevation
function backdropTexture(headless) {
  const cw = 1024, ch = 512, cv = document.createElement('canvas');
  cv.width = cw; cv.height = ch;
  const c = cv.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  const g = c.createLinearGradient(0, 0, 0, ch);       // v: top (zenith) → bottom (nadir); the horizon is the middle
  g.addColorStop(0, '#0b0908'); g.addColorStop(0.22, '#120f0d'); g.addColorStop(0.38, '#1e1916'); g.addColorStop(0.46, '#272120');
  g.addColorStop(0.5, `#${HORIZON.getHexString(THREE.SRGBColorSpace)}`); g.addColorStop(1, `#${HORIZON.getHexString(THREE.SRGBColorSpace)}`);
  c.fillStyle = g; c.fillRect(0, 0, cw, ch);
  // a warm pool behind the product (the -z side of the sphere sits at u = 0.25 seen from inside)
  for (const u of [0.25]) {
    c.save();
    c.translate(u * cw, ch * 0.42); c.scale(2.2, 1);
    const r = c.createRadialGradient(0, 0, 0, 0, 0, ch * 0.3);
    r.addColorStop(0, 'rgba(96,74,58,0.9)'); r.addColorStop(0.5, 'rgba(72,55,44,0.42)'); r.addColorStop(1, 'rgba(60,46,38,0)');
    c.fillStyle = r; c.fillRect(-ch, -ch, 2 * ch, 2 * ch);
    c.restore();
  }
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

defineDemo({
  id: '147-product-turntable',
  title: '손안의 온도',
  tech: '제품 턴테이블 샷 · 3점 조명 + PBR 재질 + 접지 그림자',
  duration: D,
  background: '#0b0908',

  async setup(api) {
    const HL = api.headless;
    const glyphs = CALLOUTS.map((c) => c.n + c.title + c.sub).join('') + '머금온기를 오래 머금는 텀블러' + WAYS.map((w) => w.name).join('');
    await Promise.all([fontReady(`800 40px ${PV}`, glyphs), fontReady(`900 200px ${PV}`, '머금'), fontReady(`500 26px ${PV}`, glyphs)]);

    // ---- renderer: straight to the antialiased canvas, ACES tone mapping in every material
    const el = api.layer('canvas', { z: 1 });
    el.width = W; el.height = H;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    RectAreaLightUniformsLib.init();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, W / H, 0.1, 120);
    scene.fog = new THREE.Fog(HORIZON.clone(), 11, 36);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    room.dispose();

    const M = makeMaterials(env);
    const prof = geos().prof;

    // ---- the product and its colourways
    const ways = WAYS.map((w) => {
      const tb = buildTumbler(M, M[w.mat]);
      scene.add(tb.root);
      return { ...w, ...tb };
    });
    const hero = ways[0];

    // ---- floor + backdrop
    // the floor: a dark matte sweep lit by the same three soft boxes (diffuse only), fading (alpha) into the backdrop
    // around the set, so no lamp's cut-off (an area light lights only what is in front of it) reads as a horizon line
    const floorMat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
        uAlbedo: { value: new THREE.Color('#3e332b') }, uFade: { value: new THREE.Vector2(FLOOR.r0, FLOOR.r1) },
        uCentre: { value: new THREE.Vector2(FLOOR.x, FLOOR.z) },
        uLampP: { value: [0, 1, 2].map(() => new THREE.Vector3()) }, uLampW: { value: [0, 1, 2].map(() => new THREE.Vector3()) },
        uLampH: { value: [0, 1, 2].map(() => new THREE.Vector3()) }, uLampC: { value: [0, 1, 2].map(() => new THREE.Color()) },
      }]),
      vertexShader: FLOOR_VS, fragmentShader: FLOOR_FS, fog: true, transparent: true,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(2 * FLOOR.R, 2 * FLOOR.R), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(FLOOR.x, 0, FLOOR.z);
    scene.add(floor);
    const bgMat = new THREE.MeshBasicMaterial({ map: backdropTexture(HL), side: THREE.BackSide, fog: false, depthWrite: false });
    const backdrop = new THREE.Mesh(new THREE.SphereGeometry(60, 64, 32), bgMat);
    backdrop.renderOrder = -1;
    scene.add(backdrop);

    // ---- the rig
    const lamps = {};
    for (const [name, R] of Object.entries(RIG)) {
      const L = new THREE.RectAreaLight(kelvin(R.K), 1, R.w, R.h);
      place(L, R, name === 'key' ? KEY_AZ1 : R.az);
      // intensity from the target illuminance: a probe on the product's surface turned toward the lamp
      const dir = L.position.clone().sub(AIM).normalize();
      const probe = AIM.clone().addScaledVector(new THREE.Vector3(dir.x, 0, dir.z).normalize(), 0.4);
      const n = L.position.clone().sub(probe).normalize();
      const F = formFactor(L, probe, n);
      L.userData = { full: (EXPOSE * R.E) / F, F };
      scene.add(L);
      lamps[name] = L;
    }

    // ---- contact shadows: render the hero from below into alpha targets, blur, lay them on the floor
    const rtOpt = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
    const SH = {
      contact: { N: 512, half: 1.2, H: 0.085, pow: 1.4, dark: 0.95, blur: [1.6, 0.8], shear: 0 },
      soft: { N: 256, half: 2.4, H: 1.5, pow: 1.7, dark: 0.72, blur: [3.2, 1.6], shear: 0.48 },
    };
    for (const s of Object.values(SH)) {
      s.a = new THREE.WebGLRenderTarget(s.N, s.N, { ...rtOpt, depthBuffer: true });
      s.b = new THREE.WebGLRenderTarget(s.N, s.N, rtOpt);
      s.mat = new THREE.ShaderMaterial({
        uniforms: { uC: { value: new THREE.Vector2() }, uShear: { value: new THREE.Vector2() }, uHalf: { value: s.half }, uH: { value: s.H }, uDark: { value: s.dark }, uPow: { value: s.pow } },
        vertexShader: SHADOW_VS, fragmentShader: SHADOW_FS, side: THREE.DoubleSide,
      });
    }
    const blurMat = new THREE.ShaderMaterial({ uniforms: { tMap: { value: null }, uDir: { value: new THREE.Vector2() } }, vertexShader: QUAD_VS, fragmentShader: BLUR_FS, depthTest: false, depthWrite: false });
    const quadScene = new THREE.Scene();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blurMat);
    quad.frustumCulled = false;
    quadScene.add(quad);
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    // one pair of planes per tumbler, all sampling the hero's maps
    for (const w of ways) {
      w.shadows = ['soft', 'contact'].map((k, i) => {
        const s = SH[k];
        const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * s.half, 2 * s.half), new THREE.MeshBasicMaterial({
          map: s.a.texture, color: 0x000000, transparent: true, depthWrite: false, fog: false,
          polygonOffset: true, polygonOffsetFactor: -1 - i, polygonOffsetUnits: -1 - i,
        }));
        m.rotation.x = -Math.PI / 2;
        m.position.y = 0.001 * (i + 1);
        m.renderOrder = 1 + i;
        scene.add(m);
        return m;
      });
    }

    // ---- compile every program now (the colourways are hidden until the afterglow), not on the frame that needs it
    renderer.compile(scene, camera);

    // ---- 2D overlay: vignette, callouts, name, colour labels (redrawn whole every frame)
    const ctx = api.canvas({ z: 2 }).ctx;
    const vignette = ctx.createRadialGradient(W / 2, H * 0.47, H * 0.28, W / 2, H * 0.5, H * 0.75);
    vignette.addColorStop(0, 'rgba(6,5,4,0)'); vignette.addColorStop(1, 'rgba(6,5,4,0.55)');

    Object.assign(this, { renderer, scene, camera, M, ways, hero, lamps, floor, backdrop, bgMat, SH, blurMat, quadScene, quadCam, ctx, vignette, prof,
      _v: new THREE.Vector3(), _q: new THREE.Quaternion(), _ax: new THREE.Vector3() });
    // draw once and read one pixel back: the GPU process compiles and links lazily, so without this sync the first
    // shown frame would pay for every program and the PMREM bake
    this.frame(0);
    const gl = renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  },

  // ------------------------------------------------------------------------------------------------ frame(t)
  frame(t) {
    const S = this, { M, ways, hero, lamps, camera } = S;

    // ---- light levels, key position, room reflections
    const kAz = keyAz(t);
    const mv = smooth((t - 6.5) / 1.8), rc = RIG_LINEUP, rk = lerp(1, rc.k, mv);
    place(lamps.key, RIG.key, kAz, rc.x * mv, rc.z * mv, rk, lerp(RIG.key.el, RIG.key.elWide, mv));   // the key climbs for the wide shot
    place(lamps.fill, RIG.fill, RIG.fill.az, rc.x * mv, rc.z * mv, rk);
    place(lamps.rim, RIG.rim, RIG.rim.az, rc.x * mv, rc.z * mv, rk);
    lamps.key.intensity = lamps.key.userData.full * lv.key(t);
    lamps.fill.intensity = lamps.fill.userData.full * lv.fill(t);
    lamps.rim.intensity = lamps.rim.userData.full * lv.rim(t) * rk;   // its height is not scaled (it would light the floor): F ∝ 1/k
    const envK = lv.env(t);
    const rot = kAz + Math.PI / 2;                       // the room's bright wall (-x) turns with the key
    for (const [m, g] of M.envGain) { m.envMapIntensity = g * envK; m.envMapRotation.set(0, rot, 0); }
    const bgK = lv.bg(t);
    S.bgMat.color.setScalar(bgK);
    S.scene.fog.color.copy(HORIZON).multiplyScalar(bgK);

    // ---- the hero: turntable + lid
    const th = spin(t);
    hero.root.rotation.y = th;
    const open = ease.outBack(clamp((t - T.lidOpen[0]) / (T.lidOpen[1] - T.lidOpen[0])), 1.4) * (1 - ease.inOutCubic(clamp((t - T.lidClose[0]) / (T.lidClose[1] - T.lidClose[0]))));
    const camNow = CAM(t);
    const lidAz = camNow[0];                             // the lid tips toward the lens
    hero.lid.position.y = LIP_Y + 0.19 * open;
    S._ax.set(Math.cos(lidAz - th), 0, -Math.sin(lidAz - th));   // horizontal axis ⟂ to the view, in turntable space
    hero.lid.quaternion.setFromAxisAngle(S._ax, 0.12 * open);

    // ---- the colourways slide in beside it (afterglow)
    for (let i = 1; i < ways.length; i++) {
      const w = ways[i], p = clamp((t - T.vIn[i - 1]) / T.vDur), e = ease.outCubic(p);
      w.root.visible = p > 0;
      const off = 2.6 * (1 - e);
      w.root.position.set(w.at[0] + off, 0, w.at[1] + 0.25 * off);
      w.root.rotation.y = 0.5 + 0.06 * t + 1.6 * (1 - e);
      w.lid.position.y = LIP_Y;
    }

    // ---- camera
    const [az, elv, dist, tx, ty, tz, fov, shift] = camNow;
    camera.fov = fov;
    camera.position.set(tx + dist * Math.sin(az) * Math.cos(elv), ty + dist * Math.sin(elv), tz + dist * Math.cos(az) * Math.cos(elv));
    camera.lookAt(tx, ty, tz);
    camera.setViewOffset(W, H, 0, shift, W, H);
    S.backdrop.rotation.y = az;                          // the background light always sits behind the product
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    S.scene.fog.near = dist - 1.2; S.scene.fog.far = dist + 9;   // the floor fades into the backdrop just past the product

    // ---- contact shadows (from below, into alpha targets)
    const r = S.renderer;
    S.scene.updateMatrixWorld(true);
    const hide = [S.floor, S.backdrop, ...ways.slice(1).map((w) => w.root), ...ways.flatMap((w) => w.shadows)];
    const vis = hide.map((o) => o.visible);
    hide.forEach((o) => { o.visible = false; });
    const kd = new THREE.Vector2(Math.sin(kAz), Math.cos(kAz)).normalize();
    r.setClearColor(0x000000, 0);
    for (const [k, s] of Object.entries(S.SH)) {
      s.mat.uniforms.uC.value.set(hero.root.position.x, hero.root.position.z);
      const sh = s.shear * (1 - 0.55 * smooth((t - 6.5) / 1.8));      // a higher key throws a shorter shadow
      s.mat.uniforms.uShear.value.set(-kd.x * sh, -kd.y * sh);
      s.mat.uniforms.uDark.value = s.dark * (k === 'soft' ? lv.key(t) : 0.35 + 0.65 * Math.max(lv.key(t), lv.rim(t)));
      S.scene.overrideMaterial = s.mat;
      r.setRenderTarget(s.a);
      r.clear();
      r.render(S.scene, camera);
      S.scene.overrideMaterial = null;
      for (const amt of s.blur) {
        S.blurMat.uniforms.tMap.value = s.a.texture; S.blurMat.uniforms.uDir.value.set(amt / s.N, 0);
        r.setRenderTarget(s.b); r.render(S.quadScene, S.quadCam);
        S.blurMat.uniforms.tMap.value = s.b.texture; S.blurMat.uniforms.uDir.value.set(0, amt / s.N);
        r.setRenderTarget(s.a); r.render(S.quadScene, S.quadCam);
      }
    }
    r.setRenderTarget(null);
    hide.forEach((o, i) => { o.visible = vis[i]; });
    for (const w of ways) for (const m of w.shadows) { m.visible = w.root.visible; m.position.x = w.root.position.x; m.position.z = w.root.position.z; }

    // ---- floor lamps (world space: centre, half-width, half-height, colour × intensity)
    const fu = S.floor.material.uniforms;
    ['key', 'fill', 'rim'].forEach((k, i) => {
      const L = lamps[k], m = L.matrixWorld.elements;
      fu.uLampP.value[i].setFromMatrixPosition(L.matrixWorld);
      fu.uLampW.value[i].set(m[0], m[1], m[2]).multiplyScalar(L.width / 2);
      fu.uLampH.value[i].set(m[4], m[5], m[6]).multiplyScalar(L.height / 2);
      fu.uLampC.value[i].copy(L.color).multiplyScalar(L.intensity);
    });

    r.render(S.scene, camera);
    this.overlay(t);
  },

  // ------------------------------------------------------------------------------------------------ 2D overlay
  project(v) {
    const p = this._v.copy(v).project(this.camera);
    return { x: (p.x + 1) * 0.5 * W, y: (1 - p.y) * 0.5 * H };
  },

  anchor(co) {
    const { hero, prof } = this;
    const th = hero.root.rotation.y, a = HERO_AZ + co.az - th;   // world azimuth → turntable azimuth (the parts are round)
    if (co.part === 'gasket') {
      hero.lid.updateMatrixWorld(true);
      return new THREE.Vector3(0.418 * Math.sin(a), -0.028, 0.418 * Math.cos(a)).applyMatrix4(hero.lid.matrixWorld);
    }
    const r = co.part === 'band' ? 0.4442 : radiusAt(prof.paint, co.y);
    return new THREE.Vector3(r * Math.sin(a), co.y, r * Math.cos(a)).applyMatrix4(hero.root.matrixWorld);
  },

  overlay(t) {
    const c = this.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
    c.lineCap = 'round'; c.lineJoin = 'round'; c.setLineDash([]);
    c.clearRect(0, 0, W, H);
    // the vignette is drawn here every frame: a 2D layer that ends a frame fully transparent can keep showing its
    // previous picture in the capture (stale compositor layer), so this canvas is never left empty
    c.fillStyle = this.vignette; c.fillRect(0, 0, W, H);
    c.textBaseline = 'alphabetic';

    // callouts
    CALLOUTS.forEach((co, i) => {
      const t0 = T.co[i], tOut = T.coOut + i * 0.05;
      if (t < t0 || t > tOut + 0.35) return;
      const A = this.project(this.anchor(co));
      const pin = ease.outBack(clamp((t - t0) / 0.22), 2.2);
      const draw = ease.inOutCubic(clamp((t - t0 - 0.06) / 0.36));
      const txt = ease.outCubic(clamp((t - t0 - 0.22) / 0.36));
      const out = ease.inCubic(clamp((t - tOut) / 0.3));
      const s = co.side;
      const E = { x: A.x + s * 46, y: A.y + co.dy };
      const Q = { x: s < 0 ? 64 : W - 64, y: E.y };
      const l1 = Math.hypot(E.x - A.x, E.y - A.y), l2 = Math.abs(Q.x - E.x), Lt = l1 + l2;
      const head = draw * Lt, tail = out * Lt;            // the line draws out from the pin, and leaves the same way
      c.strokeStyle = C.line; c.lineWidth = 2.4;
      c.beginPath();
      const pt = (d) => (d <= l1 ? { x: A.x + ((E.x - A.x) * d) / l1, y: A.y + ((E.y - A.y) * d) / l1 } : { x: E.x + s * (d - l1), y: E.y });
      if (head > tail) {
        const p0 = pt(tail), p1 = pt(head);
        c.moveTo(p0.x, p0.y);
        if (tail < l1 && head > l1) c.lineTo(E.x, E.y);
        c.lineTo(p1.x, p1.y);
        c.stroke();
      }
      // the pin: an accent dot inside a light ring
      const pk = pin * (1 - out);
      if (pk > 0.001) {
        c.fillStyle = 'rgba(20,16,14,0.35)';
        c.beginPath(); c.arc(A.x, A.y, 15 * pk, 0, Math.PI * 2); c.fill();
        c.strokeStyle = C.ink; c.lineWidth = 2.4;
        c.beginPath(); c.arc(A.x, A.y, 13 * pk, 0, Math.PI * 2); c.stroke();
        c.fillStyle = C.accent;
        c.beginPath(); c.arc(A.x, A.y, 6.5 * pk, 0, Math.PI * 2); c.fill();
      }
      // the label: title rises above the rule, the line under it drops below
      const ta = txt * (1 - out);
      if (ta > 0.001) {
        c.textAlign = s < 0 ? 'left' : 'right';
        c.save();
        c.beginPath(); c.rect(0, Q.y - 120, W, 116); c.clip();
        c.globalAlpha = ta;
        c.fillStyle = C.accent; c.font = `800 24px ${PV}`;
        c.fillText(co.n, Q.x, Q.y - 66 + 30 * (1 - txt));
        c.fillStyle = C.ink; c.font = `800 42px ${PV}`;
        c.fillText(co.title, Q.x, Q.y - 18 + 40 * (1 - txt));
        c.restore();
        c.save();
        c.beginPath(); c.rect(0, Q.y + 4, W, 60); c.clip();
        c.globalAlpha = ta;
        c.fillStyle = C.mute; c.font = `500 27px ${PV}`;
        c.fillText(co.sub, Q.x, Q.y + 40 - 34 * (1 - txt));
        c.restore();
      }
    });

    // the name + colour labels (afterglow)
    if (t > T.name) {
      const pn = ease.outCubic(clamp((t - T.name) / 0.6));
      const NX = 72, NY = 400;
      c.textAlign = 'left';
      c.save();
      c.beginPath(); c.rect(0, NY - 190, W, 214); c.clip();
      c.font = `900 188px ${PV}`; c.letterSpacing = '-6px';
      const ny = NY + 170 * (1 - pn);
      const lit = c.createLinearGradient(0, ny - 150, 0, ny + 8);   // lettering lit from above, like the product
      lit.addColorStop(0, '#fbf5ee'); lit.addColorStop(0.55, '#e6ddd2'); lit.addColorStop(1, '#a3978c');
      c.fillStyle = lit;
      c.fillText('머금', NX, ny);
      // the light band again: a soft-box highlight sliding over the word (the word drawn twice, the second time
      // filled with a gradient that is transparent outside the band — so it lights only the glyphs)
      const g = clamp((t - T.glint[0]) / (T.glint[1] - T.glint[0]));
      if (g > 0 && g < 1) {
        const gx = lerp(NX - 200, NX + 560, ease.inOutCubic(g));
        const gr = c.createLinearGradient(gx - 90, 0, gx + 90, 0);
        gr.addColorStop(0, 'rgba(255,250,244,0)'); gr.addColorStop(0.5, 'rgba(255,252,248,1)'); gr.addColorStop(1, 'rgba(255,250,244,0)');
        c.fillStyle = gr;
        c.fillText('머금', NX, ny);
      }
      c.letterSpacing = '0px';
      c.restore();
      const pt = ease.outCubic(clamp((t - T.tag) / 0.5));
      if (pt > 0) {
        c.globalAlpha = pt;
        c.strokeStyle = C.accent; c.lineWidth = 3;
        c.beginPath(); c.moveTo(NX + 4, NY + 44); c.lineTo(NX + 4 + 120 * pt, NY + 44); c.stroke();
        c.fillStyle = C.mute; c.font = `500 34px ${PV}`;
        c.fillText('온기를 오래 머금는 텀블러', NX, NY + 104 + 16 * (1 - pt));
        c.globalAlpha = 1;
      }
      // colour labels, pinned under each tumbler's foot (projected each frame)
      this.ways.forEach((w, i) => {
        const pl = ease.outCubic(clamp((t - T.labels - i * 0.08) / 0.45));
        if (pl <= 0 || !w.root.visible) return;
        const P = this.project(new THREE.Vector3(w.root.position.x, 0, w.root.position.z + 0.5));
        c.globalAlpha = pl;
        c.textAlign = 'center';
        c.font = `700 28px ${PV}`;
        const tw = c.measureText(w.name).width;
        const x0 = P.x - (tw + 30) / 2, y = P.y + 54 + 14 * (1 - pl);
        c.fillStyle = w.swatch;
        c.beginPath(); c.arc(x0 + 9, y - 10, 9, 0, Math.PI * 2); c.fill();
        c.strokeStyle = i === 0 ? C.accent : 'rgba(244,237,228,0.5)'; c.lineWidth = 2;
        c.beginPath(); c.arc(x0 + 9, y - 10, 13, 0, Math.PI * 2); c.stroke();
        c.fillStyle = i === 0 ? C.ink : C.mute;
        c.textAlign = 'left';
        c.fillText(w.name, x0 + 30, y);
        c.globalAlpha = 1;
      });
    }
  },
});
