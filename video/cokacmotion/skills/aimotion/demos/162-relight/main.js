/*
 * 162 · 성냥 하나의 방 — 평면 그림 재조명 · 높이맵 노멀 + 화면 공간 그림자 + 빛 색온도
 *
 * One flat illustration of an attic room is painted once in setup, with a height field under every shape
 * (room.js). From then on nothing is repainted: light tells the story. A struck match, a candle and the dawn sun
 * through the window relight the same picture every frame —
 *   normals from height (Sobel), wrapped Lambert + Blinn specular + rim, point lights with 1/(1 + (d/r)²) falloff,
 *   screen-space height-field shadows (shaders.js), light colours from a blackbody fit, flame flicker from seeded
 *   noise octaves (light.js), exposure + ACES.
 * A small chip names the light and its colour temperature, and a Kelvin bar shows where it sits (1900 K → 6500 K).
 *
 *   room.js     the painting: albedo + height relief, mattes, the sprite atlas (hand with a match, the cat's head)
 *   shaders.js  height composite → shadows (half resolution) → relight (full resolution)
 *   light.js    blackbody colour, flicker noise
 */
import * as THREE from 'three';
import { defineDemo, rand, clamp, lerp, ramp, ease, track } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { paintRoom, paintSprites, WICK, ATLAS } from './room.js';
import { VERT, HEIGHT_FRAG, SHADOW_FRAG, LIGHT_FRAG } from './shaders.js';
import { kelvinLinear, kelvinCss, flicker } from './light.js';

const D = 10;
const KR = '"Pretendard Variable"';
const AMBER = '#ffb24a';                  // the one accent: flame amber

// ---------------------------------------------------------------- the story (s)
const T_STRIKE = 1.45;                    // the match is struck: flash, sparks
const T_WICK = 2.7;                       // the candle catches
const T_MOUT = 3.18;                      // the match is shaken out
const T_WAKE = 3.45;                      // the cat lifts its head
const T_DAWN = [4.3, 5.6];                // the window sky turns from night to morning
const T_SUN = [4.95, 5.6];                // the sun beam comes in
const T_GUST = 7.42, T_OUT = 7.8;         // the candle wavers and goes out
const K_MATCH = 1900, K_CANDLE = 1850, K_DAWN = 6500, K_MOON = 9500;
const SKY_DAWN = kelvinLinear(10000), SKY_MORN = kelvinLinear(5600);

// ---------------------------------------------------------------- the hand with the match: match-head path (stage px)
const handKeys = track([
  [0.85, [1190, 1210]],
  [1.32, [708, 1026], ease.outCubic],
  [1.40, [700, 1030]],
  [1.50, [640, 1002], (p) => p * p],
  [1.98, [560, 888], ease.outCubic],
  [2.42, [690, 836]],
  [2.62, [786, 876], ease.outCubic],
  [2.88, [786, 876]],
  [3.10, [880, 906], ease.inOutCubic],
  [3.32, [900, 902]],
  [3.72, [1270, 1190], ease.inCubic],
]);
const handAngle = track([[0.85, 0.14], [1.40, 0.06], [1.50, -0.14], [1.98, -0.04], [2.62, 0.2], [2.88, 0.2], [3.32, 0.02], [3.72, 0.12]]);
function handAt(t) {
  const p = handKeys(t);
  const sk = 1 - Math.abs(clamp((t - 3.02) / 0.3) * 2 - 1);                 // the shake that puts the match out
  return [p[0] + 16 * sk * Math.sin((t - 3.02) * Math.PI * 2 * 6.5), p[1] + 5 * sk * Math.sin((t - 3.02) * Math.PI * 2 * 13)];
}
const HAND_Z = 150;

// ---------------------------------------------------------------- the cat's head
const headC = track([[T_WAKE, [560, 1004]], [T_WAKE + 0.55, [566, 962], (p) => ease.outBack(p, 1.3)], [5.3, [566, 962]], [5.85, [556, 956]]]);
const headA = track([[T_WAKE, 0.3], [T_WAKE + 0.6, -0.04, (p) => ease.outBack(p, 1.2)], [5.3, -0.04], [5.85, -0.22]]);
function eyeOpen(t) {
  const lid = (a, b, c, d) => 1 - ramp(t, a, b) * (1 - ramp(t, c, d));     // closed between b and c
  return ramp(t, 3.86, 4.16) * lid(4.72, 4.8, 4.8, 4.96) * lid(6.55, 6.63, 6.63, 6.79) * (1 - 0.82 * ramp(t, 8.62, 8.9) * (1 - ramp(t, 9.2, 9.55)));
}
const gaze = track([[3.9, [3, -1]], [5.3, [3, -1]], [5.75, [-4, -3]]]);

// ---------------------------------------------------------------- the window light: moon, then the sun
const WIN_Z = 500;                         // height of the gobo plane the window light is projected from
const sunOff = track([[T_SUN[0], [20, 190]], [6.0, [180, 400]], [7.7, [310, 432]], [D, [360, 446]]]);
const dirFromOffset = ([ox, oy]) => { const v = [-ox / WIN_Z, -oy / WIN_Z, 1], l = Math.hypot(...v); return v.map((x) => x / l); };
const MOON_DIR = dirFromOffset([60, 500]);

// ---------------------------------------------------------------- exposure, camera
const expoBase = track([[0, 1.45], [T_STRIKE, 1.45], [1.9, 1.0, ease.outCubic], [5.0, 1.0], [6.6, 0.92], [8.2, 1.04], [D, 1.1]]);
const zoom = track([[0, 1.0], [4.6, 1.045], [D, 1.03]]);

// strike sparks (seeded): velocity, life
const SPARKS = (() => {
  const r = rand(1450);
  return Array.from({ length: 8 }, () => {
    const a = (-150 - r() * 120) * Math.PI / 180, s = 260 + r() * 520;
    return { vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.12 + r() * 0.24 };
  });
})();

const CHIP = { x: 52, y: 92, w: 600, h: 230 };

defineDemo({
  id: '162-relight',
  title: '성냥 하나의 방',
  tech: '평면 그림 재조명 · 높이맵 노멀 + 화면 공간 그림자 + 빛 색온도',
  duration: D,
  background: '#07070f',

  async setup(api) {
    const GLYPHS = '빛의 색온도성냥촛불새벽0123456789K+';
    await fontReady(`600 22px ${KR}`, GLYPHS);
    await fontReady(`700 27px ${KR}`, GLYPHS);
    await fontReady(`800 30px ${KR}`, GLYPHS);

    // ---- paint the room and the sprites (CPU, once)
    const room = paintRoom();
    const spr = paintSprites();
    const half = (f32) => { const h = new Uint16Array(f32.length); for (let i = 0; i < f32.length; i++) h[i] = THREE.DataUtils.toHalfFloat(f32[i]); return h; };
    const tex = (data, w, h, type) => {
      const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, type);
      t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.unpackAlignment = 1; t.needsUpdate = true;
      return t;
    };
    const tAlb = tex(room.alb, 1080, 1920, THREE.UnsignedByteType);
    const tGeo = tex(half(room.geo), 1080, 1920, THREE.HalfFloatType);
    const tMat = tex(room.mat, 1080, 1920, THREE.UnsignedByteType);
    const tSpA = tex(spr.alb, ATLAS, ATLAS, THREE.UnsignedByteType);
    const tSpG = tex(half(spr.geo), ATLAS, ATLAS, THREE.HalfFloatType);

    // ---- renderer and the three passes
    const el = api.layer('canvas', { z: 0 });
    el.width = 1080; el.height = 1920;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(1080, 1920, false);
    const rt = (type, filter) => new THREE.WebGLRenderTarget(540, 960, { type, format: THREE.RGBAFormat, minFilter: filter, magFilter: filter, depthBuffer: false, generateMipmaps: false });
    const rtH = rt(THREE.HalfFloatType, THREE.LinearFilter), rtS = rt(THREE.UnsignedByteType, THREE.NearestFilter);

    const sprite = { uHand: { value: new THREE.Vector4() }, uHandZ: { value: HAND_Z }, uHead: { value: new THREE.Vector4() }, uHeadZ: { value: 70 } };
    const UH = { uGeo: { value: tGeo }, uSpA: { value: tSpA }, uSpG: { value: tSpG }, ...sprite };
    const US = {
      uHgt: { value: rtH.texture }, uL0: { value: new THREE.Vector4() }, uL1: { value: new THREE.Vector4() }, uWD: { value: new THREE.Vector4() },
      uMaxH: { value: room.maxH }, uK: { value: new THREE.Vector3(5, 5.5, 4.5) },
    };
    // chip: a small canvas drawn every frame, blended in the last pass
    const chipC = document.createElement('canvas');
    chipC.width = CHIP.w; chipC.height = CHIP.h;
    const chipG = chipC.getContext('2d', api.headless ? { willReadFrequently: true } : undefined);
    const tChip = new THREE.CanvasTexture(chipC);
    tChip.flipY = false; tChip.minFilter = tChip.magFilter = THREE.LinearFilter; tChip.generateMipmaps = false;
    const UL = {
      uAlb: { value: tAlb }, uGeo: { value: tGeo }, uMat: { value: tMat }, uSpA: { value: tSpA }, uSpG: { value: tSpG },
      uShadow: { value: rtS.texture }, uChip: { value: tChip }, ...sprite,
      uCam: { value: new THREE.Vector3(1, 600, 960) }, uShake: { value: new THREE.Vector2() },
      uL0: US.uL0, uL1: US.uL1, uWD: US.uWD,
      uC0: { value: new THREE.Vector3(...kelvinLinear(K_MATCH)) }, uC1: { value: new THREE.Vector3(...kelvinLinear(K_CANDLE)) },
      uR: { value: new THREE.Vector2(230, 270) }, uWC: { value: new THREE.Vector3() }, uWinZ: { value: WIN_Z },
      uAmb: { value: new THREE.Vector3() }, uSkyC: { value: new THREE.Vector3() }, uDawn: { value: 0 }, uExpo: { value: 1 },
      uEye: { value: new THREE.Vector2() }, uGaze: { value: new THREE.Vector2() },
      uF0: { value: new THREE.Vector4() }, uF1: { value: new THREE.Vector4() }, uFW: { value: new THREE.Vector2(11, 13) },
      uGlow: { value: new THREE.Vector4() },
      uSpk: { value: Array.from({ length: 8 }, () => new THREE.Vector4(-999, -999, -999, -999)) }, uSpkI: { value: 0 },
      uSmoke: { value: new THREE.Vector4() }, uSmokeP: { value: new THREE.Vector4(WICK[0], WICK[1] + 2, 0, 0) },
      uT: { value: 0 }, uChipR: { value: new THREE.Vector4(CHIP.x, CHIP.y, CHIP.w, CHIP.h) }, uVig: { value: 0.5 },
    };
    const pass = (frag, uniforms) => {
      const m = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: frag, depthTest: false, depthWrite: false });
      const s = new THREE.Scene(); s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m));
      return s;
    };
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    Object.assign(this, { renderer, cam, rtH, rtS, sH: pass(HEIGHT_FRAG, UH), sS: pass(SHADOW_FRAG, US), sL: pass(LIGHT_FRAG, UL), US, UL, sprite, chipG, tChip, maxH: room.maxH });

    // warm-up: draw the two busiest moments so every program and texture is built in setup (frame() is pure)
    this.frame(2.75);
    this.frame(6.0);
    const gl = renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  },

  frame(t) {
    const S = this, U = S.UL, SP = S.sprite;
    U.uT.value = t;

    // ---- the match: path, flare, flicker, lean from its velocity, out after the shake
    const m = handAt(t), handOn = t > 0.85 && t < 3.72;
    SP.uHand.value.set(m[0], m[1], handAngle(t), handOn ? 1 : 0);
    const lit = t >= T_STRIKE && t < T_MOUT + 0.12;
    const age = t - T_STRIKE;
    const flare = lit ? Math.exp(-age / 0.11) : 0;
    const dying = 1 - ramp(t, T_MOUT - 0.05, T_MOUT + 0.1);
    const fl0 = flicker(t, 11, 0.09);
    const mI = lit ? 3.0 * (1 + 1.3 * flare) * fl0 * dying * ramp(t, T_STRIKE - 0.01, T_STRIKE + 0.02) : 0;
    const m1 = handAt(t + 1 / 60), m0 = handAt(t - 1 / 60);
    const vx = (m1[0] - m0[0]) * 30, vy = (m1[1] - m0[1]) * 30;
    const mH = lit ? 44 * (1 + 0.7 * flare) * (0.9 + 0.1 * fl0) * dying * (1 + clamp(-vy / 2500, -0.3, 0.3)) : 0;
    U.uL0.value.set(m[0], m[1] - 20, HAND_Z + 74, mI);   // above the match head, or the head would shadow its own flame
    U.uF0.value.set(m[0], m[1] + 5, mH, clamp(-vx / 1100, -0.7, 0.7) + 0.08 * Math.sin(t * 9.1));
    U.uGlow.value.x = mI * 0.35;
    U.uGlow.value.z = age >= 0 ? 0.9 * Math.exp(-age / 0.06) : 0;
    // sparks
    const sa = t - T_STRIKE;
    U.uSpkI.value = sa >= 0 && sa < 0.4 ? 1 : 0;
    const s0 = handAt(T_STRIKE);
    SPARKS.forEach((k, i) => {
      const v = U.uSpk.value[i];
      if (sa < 0 || sa > k.life) { v.set(-999, -999, -999, -999); return; }
      const p = (tt) => [s0[0] + k.vx * tt, s0[1] - 6 + k.vy * tt + 900 * tt * tt];
      const a = p(Math.max(0, sa - 0.03)), b = p(sa), f = 1 - sa / k.life;
      v.set(a[0] + (b[0] - a[0]) * (1 - f), a[1] + (b[1] - a[1]) * (1 - f), b[0], b[1]);
    });

    // ---- the candle: catches, grows, flickers gently; wavers in a gust and goes out
    const grow = ease.outBack(ramp(t, T_WICK, T_WICK + 0.45), 1.6);
    const gust = ramp(t, T_GUST, T_GUST + 0.15);
    const out = 1 - ramp(t, T_OUT - 0.08, T_OUT + 0.04);
    const fl1 = flicker(t, 23, 0.035 + 0.05 * (1 - ramp(t, T_WICK + 0.3, T_WICK + 1.2)) + 0.25 * gust);
    const cOn = t >= T_WICK && t < T_OUT + 0.05;
    const cI = cOn ? 3.0 * grow * fl1 * out : 0;
    const cH = cOn ? 60 * grow * (0.94 + 0.06 * fl1) * out * (1 - 0.35 * gust) : 0;
    U.uL1.value.set(WICK[0], WICK[1] - 26, 118, cI);
    U.uF1.value.set(WICK[0], WICK[1], cH, 0.05 * Math.sin(t * 3.1) + gust * (0.55 * Math.sin((t - T_GUST) * 21) + 0.45));
    U.uGlow.value.y = cI * 0.35;
    U.uGlow.value.w = cI * 0.6;
    U.uSmoke.value.set(t - T_OUT, 1, t - T_MOUT, 0.6);
    U.uSmokeP.value.set(WICK[0], WICK[1] + 2, handAt(T_MOUT)[0], handAt(T_MOUT)[1] - 10);

    // ---- window light: moonlight through the glass, then the sun beam sliding and turning
    const dawnK = ramp(t, T_DAWN[0], T_DAWN[1]);
    U.uDawn.value = dawnK;
    if (t < T_SUN[0]) {
      const mo = 0.24 * (1 - ramp(t, 4.3, T_SUN[0] - 0.02));
      U.uWD.value.set(...MOON_DIR, mo);
      U.uWC.value.set(...kelvinLinear(K_MOON));
    } else {
      U.uWD.value.set(...dirFromOffset(sunOff(t)), 2.3 * ease.inOutCubic(ramp(t, T_SUN[0], T_SUN[1])));
      U.uWC.value.set(...kelvinLinear(K_DAWN));
    }
    // sky fill: a deep-blue dawn sky, then a paler morning one
    const dawnF = 0.11 * ramp(t, 4.5, 6.3) * (1 - 0.75 * ramp(t, 7.5, 9.6)), mornF = 0.14 * ramp(t, 7.5, 9.6);
    U.uSkyC.value.set(SKY_DAWN[0] * dawnF + SKY_MORN[0] * mornF, SKY_DAWN[1] * dawnF + SKY_MORN[1] * mornF, SKY_DAWN[2] * dawnF + SKY_MORN[2] * mornF);
    U.uAmb.value.set(0.007, 0.009, 0.022);

    // ---- the cat's head
    const hc = headC(t), breathe = t < T_WAKE ? 1.6 * Math.sin(t * 2.4) : 0;
    SP.uHead.value.set(hc[0], hc[1] + breathe, headA(t), 1);
    U.uEye.value.set(eyeOpen(t), 0);
    const gz = gaze(t);
    U.uGaze.value.set(gz[0], gz[1]);

    // ---- shadows only look at what can block light now
    S.US.uMaxH.value = Math.max(S.maxH, handOn ? HAND_Z + 62 : 0) + 2;

    // ---- exposure, camera
    U.uExpo.value = expoBase(t) * (1 + (age >= 0 ? 0.3 * Math.exp(-age / 0.09) : 0));
    U.uCam.value.set(zoom(t), 600, 960);
    const shk = age >= 0 ? 4 * Math.exp(-age / 0.05) : 0;
    U.uShake.value.set(shk * Math.sin(t * 97), shk * Math.cos(t * 71));

    drawChip(S.chipG, t);
    S.tChip.needsUpdate = true;

    const r = S.renderer;
    r.setRenderTarget(S.rtH); r.render(S.sH, S.cam);
    r.setRenderTarget(S.rtS); r.render(S.sS, S.cam);
    r.setRenderTarget(null); r.render(S.sL, S.cam);
  },
});

// ---------------------------------------------------------------- the chip: light name, colour temperature, Kelvin bar
// bar positions on the mired scale (10⁶/T), which spaces colour temperature the way the eye sees it
const MIRED = [1e6 / 1500, 1e6 / 10000];
const barX = (T) => (MIRED[0] - 1e6 / T) / (MIRED[0] - MIRED[1]);
let BAR = null;
function drawChip(g, t) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.lineCap = 'butt'; g.lineJoin = 'miter'; g.setLineDash([]);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.clearRect(0, 0, CHIP.w, CHIP.h);

  // entries: [name, kelvin, alpha, pop]
  const inA = ease.outCubic(ramp(t, T_STRIKE, T_STRIKE + 0.3));
  const e0out = ramp(t, T_OUT, T_OUT + 0.18);
  const e0K = lerp(K_MATCH, K_CANDLE, ease.inOutCubic(ramp(t, T_WICK + 0.05, T_WICK + 0.4)));
  const e0name = t < T_WICK + 0.15 ? '성냥' : '촛불';
  const e1A = ease.outCubic(ramp(t, 4.7, 5.0));
  const e1K = lerp(K_CANDLE, K_DAWN, ease.inOutCubic(ramp(t, 4.75, 5.65)));
  const entries = [];
  if (inA > 0 && e0out < 1) entries.push({ name: e0name, K: e0K, a: inA * (1 - e0out), w: 1 - ease.inCubic(e0out) });
  if (e1A > 0) entries.push({ name: '새벽빛', K: e1K, a: e1A, w: e1A });
  const vis = entries.reduce((m, e) => Math.max(m, e.a), 0);
  if (vis <= 0) return;

  // caption
  g.globalAlpha = vis;
  g.fillStyle = AMBER; g.beginPath(); g.arc(20, 24, 5, 0, 7); g.fill();
  g.fillStyle = 'rgba(240,232,218,0.78)'; g.font = `600 22px ${KR}`;
  g.fillText('빛의 색온도', 34, 32);

  // pill
  g.font = `800 30px ${KR}`;
  const dw = Math.ceil(g.measureText('0').width), kw = Math.ceil(g.measureText('K').width);
  g.font = `700 27px ${KR}`;
  const widths = entries.map((e) => 60 + Math.ceil(g.measureText(e.name).width) + 10 + dw * 4 + kw + 18);
  const plus = 30;
  let total = 0;
  entries.forEach((e, i) => { total += widths[i] * e.w + (i ? plus * Math.min(e.w, entries[0].w) : 0); });
  const pw = Math.round(total + 8), py = 50, ph = 62;
  g.globalAlpha = vis;
  g.fillStyle = 'rgba(12,12,28,0.58)';
  g.beginPath(); g.roundRect(10, py, pw, ph, 31); g.fill();
  g.strokeStyle = 'rgba(255,178,74,0.55)'; g.lineWidth = 1.5;
  g.beginPath(); g.roundRect(10.75, py + 0.75, pw - 1.5, ph - 1.5, 30.25); g.stroke();
  g.save();
  g.beginPath(); g.roundRect(10, py, pw, ph, 31); g.clip();
  let x = 14;
  entries.forEach((e, i) => {
    if (i) {
      g.globalAlpha = e.a * entries[0].a;
      g.fillStyle = 'rgba(240,232,218,0.6)'; g.font = `700 27px ${KR}`;
      g.fillText('+', Math.round(x + 6), py + 41);
      x += plus * Math.min(e.w, entries[0].w);
    }
    g.globalAlpha = e.a;
    const cx = Math.round(x + 30), cy = py + 31;
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.arc(cx, cy, 20, 0, 7); g.fill();
    g.fillStyle = kelvinCss(e.K); g.beginPath(); g.arc(cx, cy, 16, 0, 7); g.fill();
    g.fillStyle = '#f2ebde'; g.font = `700 27px ${KR}`;
    const nx = Math.round(x + 60), nw = Math.ceil(g.measureText(e.name).width);
    g.fillText(e.name, nx, py + 41);
    // the number in fixed digit cells (no width jitter while it counts)
    g.font = `800 30px ${KR}`; g.fillStyle = '#ffffff';
    const s = String(Math.round(e.K / 10) * 10);
    let dx = nx + nw + 10;
    for (const ch of s.padStart(4, ' ')) { if (ch !== ' ') g.fillText(ch, dx + Math.round((dw - g.measureText(ch).width) / 2), py + 42); dx += dw; }
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillText('K', dx + 1, py + 42);
    x += widths[i] * e.w;
  });
  g.restore();

  // Kelvin bar on the mired scale, with a marker per light
  const bx = 14, by = 140, bw = 340, bh = 10;
  if (!BAR) {
    BAR = [];
    for (let k = 0; k <= 16; k++) { const u = k / 16, T = 1e6 / lerp(MIRED[0], MIRED[1], u); BAR.push([u, kelvinCss(T)]); }
  }
  g.globalAlpha = vis * 0.9;
  const gr = g.createLinearGradient(bx, 0, bx + bw, 0);
  for (const [u, c] of BAR) gr.addColorStop(u, c);
  g.fillStyle = gr; g.beginPath(); g.roundRect(bx, by, bw, bh, 5); g.fill();
  g.globalAlpha = vis * 0.55; g.fillStyle = '#f0e8da'; g.font = `600 22px ${KR}`;
  g.fillText('1500K', bx, by + 38);
  g.textAlign = 'right'; g.fillText('10000K', bx + bw, by + 38); g.textAlign = 'left';
  for (const e of entries) {
    const mx = bx + bw * barX(e.K);
    g.globalAlpha = e.a;
    g.fillStyle = 'rgba(12,12,28,0.7)'; g.beginPath(); g.arc(mx, by + bh / 2, 11, 0, 7); g.fill();
    g.fillStyle = '#f6efe2'; g.beginPath(); g.arc(mx, by + bh / 2, 9, 0, 7); g.fill();
    g.fillStyle = kelvinCss(e.K); g.beginPath(); g.arc(mx, by + bh / 2, 6.5, 0, 7); g.fill();
  }
  g.globalAlpha = 1;
}
