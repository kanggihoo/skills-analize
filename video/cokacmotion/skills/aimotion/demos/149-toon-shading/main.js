/*
 * 149 · 비 오는 정류장 — toon shading in three.js: stepped light ramp, inverted-hull outlines, stepped rim light.
 *
 * A rainy night bus stop drawn like a frame of hand-painted animation. Three lights reach every surface — a cool sky
 * key (with a shadow map), a warm street lamp (spot + shadow map) and the headlights of a bus turning the corner
 * off-frame (two spots + one shadow map rendered every frame). Each light's arriving amount x is cut by ONE ramp into
 * flat bands; shadows multiply x before the cut, so they snap to the same bands. When the headlights sweep, nothing
 * fades smoothly: band edges slide across every object.
 *
 * Passes per frame: headlight shadow map (1024²) → puddle reflection (mirror camera, 432×768) → the frame → vignette.
 * The key-light and lamp shadow maps never change and are rendered once in setup.
 */
import * as THREE from 'three';
import { defineDemo, rand, clamp, lerp, ease, track } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import * as S from './shaders.js';
import { buildProps, buildCity, signAtlas, puddleField, coneGeometry, ROOF, LAMP, WALK_Y, PUD, C } from './scene.js';

const D = 9;
const W = 1080, H = 1920;
const FOV = 42;

// ---------------------------------------------------------------- timeline (s)
const T = {
  head0: 1.3,      // the bus's lights appear round the corner (off-frame right)
  flood0: 5.0,     // the beams reach the shelter …
  peak: 5.45,      // … full flood, rim flare (poster = 0.6 · D)
  flood1: 7.0,     // the bus pulls away: the beams swing across the road and past the lens
  head1: 7.9,      // headlights gone
  flick: 8.12,     // the lamp flickers once
};

const sine = (p) => 0.5 - 0.5 * Math.cos(Math.PI * p);
const inQuad = (p) => p * p;
const lin = (p) => p;
const box = (t, a, b) => (t >= a && t < b ? 1 : 0);

// cubic Hermite keys [t, value, slope]: continuous speed through every key (no stop at the keys like a per-segment ease)
function hermite(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, m1] = keys[i];
      if (t <= t1) {
        const [t0, v0, m0] = keys[i - 1], h = t1 - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * h * m1;
      }
    }
    const [tl, vl, ml] = keys[keys.length - 1];
    return vl + ml * (t - tl);
  };
}

// ---------------------------------------------------------------- camera: one long decelerating push-in + a small push on the flood
const CAM0 = [3.6, 1.52, 14.4], CAM1 = [2.72, 1.3, 11.2];
const TGT0 = [-0.05, 2.12, -0.6], TGT1 = [-0.3, 1.98, -0.6];
const push = (t) => 1 - Math.pow(1 - clamp(t / D), 2.4);
const nudge = track([[0, 0], [T.flood0, 0], [6.3, 0.32, sine], [D, 0.32]]);

// ---------------------------------------------------------------- headlights
// The aim point travels a curve across the scene (right buildings → lamp → shelter → road → past the lens);
// the lamps travel a turning arc off-frame right. Both read the same arc-length progress.
const AIM = [[6.6, 3.8, -11.5], [3.7, 2.7, -7.2], [1.7, 1.7, -3.0], [0.45, 1.3, -1.15], [-0.95, 1.15, -0.8], [-3.0, 1.1, 3.4], [0.2, 1.25, 9.4], [2.6, 1.4, 14.8]];
const SRC = [[10.9, 0.95, 8.7], [9.6, 0.95, 7.5], [8.4, 0.95, 6.3], [7.5, 0.95, 5.6], [6.8, 0.95, 5.15], [6.2, 0.95, 5.0], [5.6, 0.95, 5.4], [5.2, 0.95, 6.2]];
const headK = track([[T.head0, 0], [2.5, 2.3, ease.outCubic], [4.7, 3.0, lin], [T.peak, 4.3, ease.outCubic], [6.7, 3.9], [7.35, 3.3], [T.head1, 0, inQuad]]);
const rimHead = track([[4.6, 0.6], [T.peak, 1.5, ease.outCubic], [6.8, 1.1], [7.6, 0.6]]);
const LAMP_K = 1.9;
const lampK = (t) => {
  // one flicker: off, a weak stutter, back on
  const off = box(t, T.flick, T.flick + 0.1) + 0.55 * box(t, T.flick + 0.14, T.flick + 0.19);
  return LAMP_K * (1 - 0.95 * clamp(off));
};

defineDemo({
  id: '149-toon-shading',
  title: '비 오는 정류장',
  tech: '툰 셰이딩 · 계단 명암 + 뒤집은 껍질 외곽선 + 림 라이트',
  duration: D,
  background: '#070b1d',

  async setup(api) {
    await fontReady('700 92px "Pretendard Variable"', '느티나무 앞정류장노선 안내시장 입구도서관강변 공원종점');
    const R = rand(14949);

    // ---- renderer
    const el = api.layer('canvas', { z: 0 });
    el.width = W; el.height = H;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearColor(0x000000, 1);

    const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 230);
    const focal = (H / 2) / Math.tan((FOV / 2) * Math.PI / 180);

    // ---- shared uniforms (every material holds the same objects, so one write updates all)
    const col = (hex) => new THREE.Color(hex);   // sRGB token → linear
    const U = {
      uAmbSky: { value: new THREE.Color(0.06, 0.092, 0.2) },
      uAmbGround: { value: new THREE.Color(0.03, 0.038, 0.085) },
      uMoonDir: { value: new THREE.Vector3(-0.58, 0.68, 0.42).normalize() },
      uMoonCol: { value: new THREE.Color(0.15, 0.25, 0.55) },
      uMoonMap: { value: null }, uMoonVP: { value: new THREE.Matrix4() },
      uLampPos: { value: new THREE.Vector3(LAMP.head.x, LAMP.head.y - 0.1, LAMP.z) },
      uLampDir: { value: new THREE.Vector3(0.04, -1, -0.16).normalize() },
      uLampCol: { value: new THREE.Color(2.3, 1.25, 0.32) },
      uLampCone: { value: new THREE.Vector3(Math.cos(62 * Math.PI / 180), Math.cos(26 * Math.PI / 180), 3.3) },
      uLampK: { value: LAMP_K }, uLampMap: { value: null }, uLampVP: { value: new THREE.Matrix4() },
      uHeadA: { value: new THREE.Vector3() }, uHeadB: { value: new THREE.Vector3() }, uHeadDir: { value: new THREE.Vector3(0, 0, -1) },
      uHeadCol: { value: new THREE.Color(1.65, 0.98, 0.32) },
      uHeadCone: { value: new THREE.Vector3(Math.cos(17 * Math.PI / 180), Math.cos(8 * Math.PI / 180), 7.5) },
      uHeadK: { value: 0 }, uHeadMap: { value: null }, uHeadVP: { value: new THREE.Matrix4() },
      uBand: { value: new THREE.Vector4(0.12, 0.5, 0.45, 0.75) },
      uRim: { value: new THREE.Vector4(0.7, 0.75, 0.6, 0.7) },
      uFogCol: { value: col('#22325e') },
      uFog: { value: new THREE.Vector2(0.026, 0.02) },
      uTexel: { value: new THREE.Vector3(1 / 2048, 1 / 2048, 1 / 1024) },
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(W, H) },
      uCanopy: { value: new THREE.Vector3(-3.75, 5.5, -2.9) },
    };

    // ---- shadow maps (depth textures read as plain samplers; the comparison happens in shadowAt)
    const depthRT = (n) => new THREE.WebGLRenderTarget(n, n, { depthTexture: new THREE.DepthTexture(n, n, THREE.FloatType), minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const moonRT = depthRT(2048), lampRT = depthRT(2048), headRT = depthRT(1024);
    U.uMoonMap.value = moonRT.depthTexture; U.uLampMap.value = lampRT.depthTexture; U.uHeadMap.value = headRT.depthTexture;
    const depthMat = new THREE.ShaderMaterial({
      vertexShader: 'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'void main() { gl_FragColor = vec4(1.0); }',
      side: THREE.DoubleSide,
    });

    // ---- geometry
    const propsGeo = buildProps(R);
    const cityGeo = buildCity(R);
    const atlas = signAtlas();
    const pudTex = puddleField(R);

    // ---- materials
    const toonMat = new THREE.ShaderMaterial({ uniforms: { ...U, uMap: { value: atlas.tex }, uHatchPx: { value: 7.0 } }, vertexShader: S.TOON_VS, fragmentShader: S.TOON_FS });
    const lineMat = new THREE.ShaderMaterial({
      uniforms: { uRes: U.uRes, uLineScale: { value: 1.0 }, uInk: { value: col(C.ink) }, uFogCol: U.uFogCol, uFog: U.uFog },
      vertexShader: S.LINE_VS, fragmentShader: S.LINE_FS, side: THREE.BackSide,
    });
    const roadMat = new THREE.ShaderMaterial({
      uniforms: {
        ...U, uPuddle: { value: pudTex }, uPudRect: { value: new THREE.Vector4(PUD.x0, PUD.z0, PUD.w, PUD.d) },
        uRefl: { value: null }, uReflVP: { value: new THREE.Matrix4() },
        uAsphalt: { value: col('#2c303d') }, uPaint: { value: col('#c3c8d4') }, uSkyRefl: { value: new THREE.Color(0.1, 0.13, 0.22) },
      },
      vertexShader: S.GROUND_VS, fragmentShader: S.ROAD_FS,
    });
    const walkMat = new THREE.ShaderMaterial({
      uniforms: { ...U, uTileA: { value: col('#757a89') }, uTileB: { value: col('#82879a') } },
      vertexShader: S.GROUND_VS, fragmentShader: S.WALK_FS,
    });

    // ---- scene
    const scene = new THREE.Scene();
    // layer 1 = seen by the puddle mirror. Left out: the road itself (it is the mirror), the pavement (only its underside
    // would face the mirror camera), rain, shafts and the sky (the mirror pass clears to the horizon colour instead)
    const both = (o) => { o.layers.enable(1); return o; };
    const sky = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), new THREE.ShaderMaterial({
      uniforms: { uZenith: { value: col('#050a1f') }, uHorizon: { value: col('#2a3c6c') }, uCloudA: { value: col('#16224a') }, uCloudB: { value: col('#22325f') }, uTime: U.uTime },
      vertexShader: S.SKY_VS, fragmentShader: S.SKY_FS, side: THREE.BackSide, depthWrite: false,
    }));
    sky.renderOrder = 2;                                             // last of the opaques: only uncovered pixels pay for it
    scene.add(sky);
    const props = both(new THREE.Mesh(propsGeo, toonMat));
    const propsLine = both(new THREE.Mesh(propsGeo, lineMat));
    const city = both(new THREE.Mesh(cityGeo, toonMat));
    const cityLine = both(new THREE.Mesh(cityGeo, lineMat));
    const sign = both(new THREE.Mesh(atlas.geo, toonMat));
    const walk = new THREE.Mesh(new THREE.PlaneGeometry(44, 13.4).rotateX(-Math.PI / 2).translate(0, WALK_Y, -5.33), walkMat);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(90, 46).rotateX(-Math.PI / 2).translate(0, 0, 22), roadMat);
    scene.add(props, propsLine, city, cityLine, sign, walk, road);
    propsLine.renderOrder = cityLine.renderOrder = 1;                 // hulls after the fills: hidden back faces fail early
    for (const m of [props, propsLine, city, cityLine, sign, walk, road]) m.frustumCulled = false;

    // ---- rain: instanced streaks
    const NR = 2300;
    const rg = new THREE.InstancedBufferGeometry();
    rg.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3));
    rg.setAttribute('aCorner', new THREE.Float32BufferAttribute([0, -1, 1, -1, 1, 1, 0, 1], 2));
    rg.setIndex([0, 1, 2, 0, 2, 3]);
    const seeds = new Float32Array(NR * 4);
    for (let i = 0; i < seeds.length; i++) seeds[i] = R();
    rg.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
    rg.instanceCount = NR;
    const rainU = {
      ...U, uRainCol: { value: new THREE.Color(0.05, 0.068, 0.12) }, uShutter: { value: 0.05 }, uFocal: { value: focal },
      uBoxMin: { value: new THREE.Vector3(-6, -0.4, -5) }, uBoxSize: { value: new THREE.Vector3(14.5, 12, 16.5) },
      uVel: { value: new THREE.Vector3(-1.0, -10.5, 0.45) },
      uRoof: { value: new THREE.Vector4(ROOF.x0 - 0.05, ROOF.x1 + 0.05, ROOF.z0 - 0.05, ROOF.z1 + 0.05) }, uRoofY: { value: ROOF.y + 0.15 },
    };
    const rain = new THREE.Mesh(rg, new THREE.ShaderMaterial({
      uniforms: rainU, vertexShader: S.RAIN_VS, fragmentShader: S.RAIN_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    rain.frustumCulled = false;
    rain.renderOrder = 5;
    scene.add(rain);

    // ---- splashes: rings on the road and the pavement (never under the roof)
    const NS = 300;
    const sg = new THREE.InstancedBufferGeometry();
    sg.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3));
    sg.setAttribute('aCorner', new THREE.Float32BufferAttribute([-1, -1, 1, -1, 1, 1, -1, 1], 2));
    sg.setIndex([0, 1, 2, 0, 2, 3]);
    const spl = new Float32Array(NS * 4);
    for (let i = 0; i < NS; i++) {
      let x, z, y;
      do {
        x = -4.5 + 10.5 * R(); z = -4.5 + 14 * R();
      } while ((x > ROOF.x0 - 0.1 && x < ROOF.x1 + 0.1 && z > ROOF.z0 - 0.1 && z < ROOF.z1 + 0.1) || (z > 1.3 && z < 1.7));
      y = z < 1.4 ? WALK_Y : 0;
      spl.set([x, y, z, R()], i * 4);
    }
    sg.setAttribute('aSpl', new THREE.InstancedBufferAttribute(spl, 4));
    sg.instanceCount = NS;
    const splash = new THREE.Mesh(sg, new THREE.ShaderMaterial({
      uniforms: rainU, vertexShader: S.SPLASH_VS, fragmentShader: S.SPLASH_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    splash.frustumCulled = false;
    splash.renderOrder = 4;
    scene.add(splash);

    // ---- light shafts (lamp cone, two headlight beams) and halos
    const quad = new THREE.BufferGeometry();
    quad.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3));
    quad.setAttribute('aCorner', new THREE.Float32BufferAttribute([-1, -1, 1, -1, 1, 1, -1, 1], 2));
    quad.setIndex([0, 1, 2, 0, 2, 3]);
    const shaft = (geo, c, levels) => {
      const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({
        uniforms: { uCol: { value: c }, uK: { value: 1 }, uLevels: { value: new THREE.Vector2(...levels) } },
        vertexShader: S.BEAM_VS, fragmentShader: S.BEAM_FS,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      }));
      m.frustumCulled = false;
      m.renderOrder = 3;
      scene.add(m);
      return m;
    };
    const lampCone = shaft(coneGeometry(4.7, 1.9), new THREE.Color(0.05, 0.03, 0.009), [0.6, 0.4]);
    const beamGeo = coneGeometry(19, 19 * Math.tan(11 * Math.PI / 180));
    const beams = [0, 1].map(() => shaft(beamGeo, new THREE.Color(0.042, 0.028, 0.01), [0.55, 0.45]));
    const halo = (size, rings, depthTest, streak = 0) => {
      const m = new THREE.Mesh(quad, new THREE.ShaderMaterial({
        uniforms: { uCenter: { value: new THREE.Vector3() }, uSize: { value: new THREE.Vector2(size, size) }, uCol: { value: new THREE.Color(1.0, 0.62, 0.2) }, uK: { value: 1 }, uRings: { value: new THREE.Vector4(...rings) }, uStreak: { value: streak } },
        vertexShader: S.HALO_VS, fragmentShader: S.HALO_FS,
        transparent: true, depthWrite: false, depthTest, blending: THREE.AdditiveBlending,
      }));
      m.frustumCulled = false;
      m.renderOrder = 6;
      scene.add(m);
      return m;
    };
    const lampHalo = both(halo(1.1, [0.05, 0.11, 0.2, 0.32], true));
    lampHalo.material.uniforms.uCenter.value.set(LAMP.head.x, LAMP.head.y - 0.03, LAMP.z);
    const glare = [0, 1].map(() => halo(7.0, [0.012, 0.035, 0.08, 0.32], false, 0.55));
    for (const g of glare) g.material.uniforms.uCol.value.set(1.0, 0.78, 0.4);

    // ---- vignette overlay
    const vigScene = new THREE.Scene();
    const vig = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      vertexShader: S.VIG_VS, fragmentShader: S.VIG_FS, transparent: true, depthTest: false, depthWrite: false,
    }));
    vig.frustumCulled = false;
    vigScene.add(vig);
    const vigCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // ---- static shadow maps: the sky key (orthographic) and the lamp (perspective), rendered once
    const casters = new THREE.Scene();
    casters.add(new THREE.Mesh(propsGeo, depthMat));
    casters.children[0].frustumCulled = false;
    const vp = (cam, out) => { cam.updateMatrixWorld(); out.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); };
    const moonCam = new THREE.OrthographicCamera(-8.5, 8.5, 8.5, -8.5, 1, 70);
    const mc = new THREE.Vector3(-0.8, 2.0, -1.0);
    moonCam.position.copy(mc).addScaledVector(U.uMoonDir.value, 32);
    moonCam.lookAt(mc);
    vp(moonCam, U.uMoonVP.value);
    const lampCam = new THREE.PerspectiveCamera(128, 1, 0.05, 9);
    lampCam.position.copy(U.uLampPos.value);
    lampCam.up.set(0, 0, -1);
    lampCam.lookAt(U.uLampPos.value.clone().add(U.uLampDir.value));
    vp(lampCam, U.uLampVP.value);
    renderer.setRenderTarget(moonRT); renderer.clear(); renderer.render(casters, moonCam);
    renderer.setRenderTarget(lampRT); renderer.clear(); renderer.render(casters, lampCam);
    renderer.setRenderTarget(null);

    // ---- headlight paths: aim curve + source arc, driven by one arc-length progress with continuous speed
    const aimCurve = new THREE.CatmullRomCurve3(AIM.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
    const srcCurve = new THREE.CatmullRomCurve3(SRC.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
    const M = 40, lens = aimCurve.getLengths((AIM.length - 1) * M), LA = lens[lens.length - 1];
    const arcAt = (k) => lens[k * M];                                   // arc length at control point k
    const sOf = hermite([[T.head0, 0, 0], [T.flood0, arcAt(3), 0.9], [T.flood1, arcAt(4), 1.2], [T.head1 - 0.1, LA, 30]]);
    const headCam = new THREE.PerspectiveCamera(66, 1, 0.4, 40);
    const reflRT = new THREE.WebGLRenderTarget(432, 768, { type: THREE.HalfFloatType });
    roadMat.uniforms.uRefl.value = reflRT.texture;
    const reflCam = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 230);
    reflCam.layers.set(1);

    const P = new THREE.Vector3(), A = new THREE.Vector3(), dir = new THREE.Vector3(), lat = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    const tgt = new THREE.Vector3(), toCam = new THREE.Vector3();

    this.draw = (t) => {
      U.uTime.value = t;

      // camera
      const k = push(t), n = nudge(t);
      camera.position.set(lerp(CAM0[0], CAM1[0], k), lerp(CAM0[1], CAM1[1], k), lerp(CAM0[2], CAM1[2], k) - n);
      tgt.set(lerp(TGT0[0], TGT1[0], k), lerp(TGT0[1], TGT1[1], k), TGT0[2]);
      camera.up.set(0, 1, 0);
      camera.lookAt(tgt);
      camera.updateMatrixWorld();

      // headlights
      const f = clamp(sOf(t) / LA, 0, 1);
      aimCurve.getPointAt(f, A);
      srcCurve.getPointAt(f, P);
      dir.subVectors(A, P).normalize();
      lat.crossVectors(dir, up).normalize();
      U.uHeadA.value.copy(P).addScaledVector(lat, 0.8);
      U.uHeadB.value.copy(P).addScaledVector(lat, -0.8);
      U.uHeadDir.value.copy(dir);
      const hk = t < T.head0 ? 0 : headK(t);
      U.uHeadK.value = hk;
      headCam.position.copy(P);
      headCam.lookAt(A);
      vp(headCam, U.uHeadVP.value);
      U.uRim.value.set(0.7, 0.75, rimHead(t), 0.7);
      U.uLampK.value = lampK(t);

      // shafts and halos
      [U.uHeadA.value, U.uHeadB.value].forEach((p, i) => {
        beams[i].position.copy(p);
        beams[i].lookAt(toCam.copy(p).add(dir));
        // glare: how directly this lamp looks into the lens; the shaft volume fades as it turns toward us
        toCam.subVectors(camera.position, p).normalize();
        const look = Math.max(0, toCam.dot(dir)), face = Math.pow(look, 10);
        beams[i].material.uniforms.uK.value = (hk / 3.0) * (1 - Math.pow(look, 3));
        beams[i].visible = hk > 0.01;
        glare[i].material.uniforms.uCenter.value.copy(p);
        glare[i].material.uniforms.uK.value = hk * (0.03 + 0.9 * face) / 3.0;
        glare[i].visible = hk > 0.01;
      });
      const lk = U.uLampK.value / LAMP_K;
      lampCone.position.copy(U.uLampPos.value);
      lampCone.lookAt(toCam.copy(U.uLampPos.value).add(U.uLampDir.value));
      lampCone.material.uniforms.uK.value = lk;
      lampHalo.material.uniforms.uK.value = lk;

      // 1 · headlight shadow map
      if (hk > 0) { renderer.setRenderTarget(headRT); renderer.clear(); renderer.render(casters, headCam); }
      // 2 · the puddle mirror: a camera reflected through y = 0 (only layer 1: no road, no rain)
      reflCam.position.set(camera.position.x, -camera.position.y, camera.position.z);
      reflCam.up.set(0, -1, 0);
      reflCam.lookAt(tgt.x, -tgt.y, tgt.z);
      vp(reflCam, roadMat.uniforms.uReflVP.value);
      renderer.setClearColor(U.uFogCol.value, 1);
      renderer.setRenderTarget(reflRT); renderer.clear(); renderer.render(scene, reflCam);
      renderer.setClearColor(0x000000, 1);
      // 3 · the frame, 4 · vignette
      renderer.setRenderTarget(null); renderer.clear(); renderer.render(scene, camera);
      renderer.autoClear = false; renderer.render(vigScene, vigCam); renderer.autoClear = true;
    };
    // warm-up: draw the busiest moment once (beams, glare, both passes) and wait for the GPU to finish it, so every
    // program is compiled — and, on a software GPU, JIT-translated — inside setup instead of on a later frame
    this.draw(T.peak);
    const gl = renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  },

  frame(t) {
    this.draw(t);
  },
});
