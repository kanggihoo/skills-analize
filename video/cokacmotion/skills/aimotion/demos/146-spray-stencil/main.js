/*
 * 146 · 벽에 뿌린 한마디 — 스프레이 스텐실 · 가우스 분사 + 다리 있는 스텐실 + 흘러내림
 *
 * A weathered concrete wall at dusk. A kraft stencil card with the cut phrase 「오늘도 / 무사히」 drops onto the wall and is
 * taped at its corners; a label-free can rattles in and sweeps arcs over it: a cream coat, then a coral pass that fades
 * up from below. The card is peeled away from the left (it bends round a cylinder and folds over toward the camera,
 * then is pulled off); the letters come out crisp, with the gaps of the stencil bridges and a soft underspray where the
 * board stood off the wall. Where the paint is thick, drips run and stop with a bead at the tip.
 *
 * Files: stencil.js (glyph mask, islands, bridges, SDF), spray.js (aim path, Gaussian deposition, baked slices),
 * art.js (wall, board, tape, cans painted once), shaders.js (all GLSL). One three.js scene + a shadow buffer.
 */
import * as THREE from 'three';
import { defineDemo, rand, clamp, lerp, ease, track } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { buildStencil, bottomEdges } from './stencil.js';
import { SP, NS, NSLICE, DEP, COAT1, COAT2, aimAt, buildSamples, depositAt, bakeSlices, remainder } from './spray.js';
import { bakeWall, bakeKraft, bakeTape, bakeCan, bakeCanShadow, bakeMistNoise, bakeDrops, drawVignette, CAN } from './art.js';
import * as SH from './shaders.js';

const D = 10;
const ZC = 2800;                                                   // camera distance (stage px): fov = 2·atan(960/2800)
const WALL_R = { x0: -48, y0: -48, w: 1176, h: 2016 };
const CARD = { x: 80, y: 430, w: 920, h: 1000, r: 10 };
const CARD_R = { x0: 20, y0: 370, w: 1040, h: 1120 };
const LINES = [{ text: '오늘도', cy: 720 }, { text: '무사히', cy: 1010 }];
const TEXT_W = 640;                                               // the wider line, px
const CS = 0.72;                                                  // can design px → stage px
const FONT = '"Black Han Sans"';
const LV = (() => { const v = [-0.55, -0.38, 0.75], l = Math.hypot(...v); return v.map((a) => a / l); })();   // toward the sun
const KSH = [-LV[0] / LV[2], -LV[1] / LV[2]];                     // shadow shift per px of height
const CREAM = [0.961, 0.925, 0.816], CORAL = [1.0, 0.353, 0.298]; // #f5ecd0, #ff5a4c (the one accent)
const seg = (t, a, b) => clamp((t - a) / (b - a));
const sineIO = (p) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(p));
const lin = (p) => p;

// ---------------------------------------------------------------------------------------------- timeline (s)
const T = {
  land: 0.42,                       // the card slaps onto the wall
  can1In: [0.72, 1.02], rattle: [0.98, 1.3], can1Go: [1.28, 1.5], can1Out: [4.42, 4.7],
  can2In: [4.28, 4.62], can2Out: [5.98, 6.24],
  lift: 6.0,                        // the top-left corner and its tape come up
  peel: [6.22, 7.25],               // the bend runs left → right
  pull: [7.15, 7.75],               // the card is taken away
};
const TAPES = [
  { cx: CARD.x + 8, cy: CARD.y + 10, ang: -0.78, len: 188, wid: 52, t0: 0.54 },
  { cx: CARD.x + CARD.w - 10, cy: CARD.y + 8, ang: 0.7, len: 196, wid: 54, t0: 0.66 },
  { cx: CARD.x + CARD.w - 8, cy: CARD.y + CARD.h - 10, ang: -0.72, len: 184, wid: 52, t0: 0.78 },
  { cx: CARD.x + 10, cy: CARD.y + CARD.h - 8, ang: 0.8, len: 192, wid: 53, t0: 0.9 },
];

// ---------------------------------------------------------------------------------------------- peel
// every point that can lift: card corners and tape corners
const HULL = [];
for (const [x, y] of [[CARD.x, CARD.y], [CARD.x + CARD.w, CARD.y], [CARD.x + CARD.w, CARD.y + CARD.h], [CARD.x, CARD.y + CARD.h]]) HULL.push([x, y]);
for (const tp of TAPES) for (const [a, b] of [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]]) {
  const c = Math.cos(tp.ang), s = Math.sin(tp.ang), lx = a * tp.len, ly = b * tp.wid;
  HULL.push([tp.cx + c * lx - s * ly, tp.cy + s * lx + c * ly]);
}
const ext = (nx, ny) => Math.max(...HULL.map(([x, y]) => nx * x + ny * y));
const A0 = Math.atan2(-0.62, -1), A1 = Math.atan2(-0.08, -1);
const peelR = track([[T.lift, 16], [T.peel[0], 44], [6.85, 150, lin], [T.peel[1], 175]]);
const peelPhi = track([[T.lift, 0.42], [T.peel[0], 0.55], [6.85, 0.62], [T.peel[1], 0.66]]);

function dropE(t) {
  const p = clamp(t / T.land), u = t - T.land;
  let h = 560 * (1 - p * p);                                       // accelerates into the wall: a slap
  if (u > 0) h = 6 * Math.exp(-u * 15) * Math.abs(Math.sin(u * 30));
  const rot = 0.06 * (1 - p) ** 2, dy = -50 * (1 - p) ** 2, cx = CARD.x + CARD.w / 2, cy = CARD.y + CARD.h / 2;
  return new THREE.Matrix4().makeTranslation(cx, cy + dy, h).multiply(new THREE.Matrix4().makeRotationZ(rot)).multiply(new THREE.Matrix4().makeTranslation(-cx, -cy, 0));
}
function pullE(t) {
  const q = seg(t, T.pull[0], T.pull[1]), qe = q * q * (0.4 + 0.6 * q);
  const px = CARD.x + CARD.w, py = CARD.y + CARD.h / 2;
  return new THREE.Matrix4().makeTranslation(px + 640 * qe, py - 300 * qe, 620 * qe)
    .multiply(new THREE.Matrix4().makeRotationZ(0.3 * qe)).multiply(new THREE.Matrix4().makeTranslation(-px, -py, 0));
}
/** n (toward the lifted side), fold line n·p = s, radius R, flap angle φ, rigid move E — a closed form of t */
function peelState(t) {
  let ang = A0, d = 0;
  if (t >= T.lift && t < T.peel[0]) d = 64 * ease.outCubic(seg(t, T.lift, T.peel[0]));
  else if (t >= T.peel[0]) {
    ang = lerp(A0, A1, sineIO(seg(t, T.peel[0], T.peel[0] + 0.8)));
    const p = seg(t, T.peel[0], T.peel[1]), q = 0.25 * p + 0.75 * Math.pow(p, 1.6);
    const nx = Math.cos(ang), ny = Math.sin(ang);
    d = lerp(64, ext(nx, ny) + ext(-nx, -ny) + 80, q);
  }
  const nx = Math.cos(ang), ny = Math.sin(ang);
  const E = t < 1 ? dropE(t) : t > T.pull[0] ? pullE(t) : new THREE.Matrix4();
  return { nx, ny, s: d > 0 ? ext(nx, ny) - d : ext(nx, ny) + 60, R: peelR(t), phi: peelPhi(t) * Math.PI, E, lifting: d > 0 ? 1 : 0 };
}

// ---------------------------------------------------------------------------------------------- the two cans
const offN = (h) => [56 * (h / 240), 64 * (h / 240)];            // nozzle sits below-right of where it aims
function nozzleOf(t) { const a = aimAt(t), o = offN(a.h); return [a.x + o[0], a.y + o[1], a.h]; }
const leanAt = (t) => clamp((aimAt(t + 0.01).x - aimAt(t - 0.01).x) / 0.02 / 3200, -1, 1) * 0.1;
function canPose(t, which) {
  const [tin, t0, t1, tout] = which === 0 ? [T.can1In, COAT1[0], COAT1[1], T.can1Out] : [T.can2In, COAT2[0], COAT2[1], T.can2Out];
  const from = which === 0 ? [1300, 1240, 640] : [-280, 1460, 660], to = which === 0 ? [1340, 720, 560] : [1380, 1560, 600];
  if (t < tin[0] || t > tout[1]) return null;
  let P, rot = -0.32, lean = 0;
  if (t < t0 && which === 0) {
    // in from the lower right to a spot over the card, a rattle (the mixing ball), then up to the first row
    const p = ease.outCubic(seg(t, tin[0], tin[1])), q = ease.inOutCubic(seg(t, T.can1Go[0], T.can1Go[1])), N0 = nozzleOf(t0);
    P = from.map((v, i) => lerp(lerp(v, SHAKE[i], p), N0[i], q));
    rot += 0.35 * (1 - p) - 0.12 * Math.sin(Math.PI * q);
    const e = Math.sin(Math.PI * seg(t, T.rattle[0], T.rattle[1])), k = 22 * e * Math.sin(TAUt(t - T.rattle[0]) * 8);
    P[0] += -Math.sin(rot) * k; P[1] += Math.cos(rot) * k; rot += 0.025 * e * Math.sin(TAUt(t) * 8 + 1);
  } else if (t < t0) {
    const p = ease.outCubic(seg(t, tin[0], tin[1])), N0 = nozzleOf(t0);
    P = from.map((v, i) => lerp(v, N0[i], p));
    rot -= 0.35 * (1 - p);
  } else if (t <= t1) { P = nozzleOf(t); lean = leanAt(t); }
  else {
    const p = ease.inCubic(seg(t, tout[0], tout[1])), N1 = nozzleOf(t1);
    P = N1.map((v, i) => lerp(v, to[i], p));
    rot += 0.3 * p;
  }
  return { x: P[0], y: P[1], h: P[2], rot: rot + lean };
}
const TAUt = (t) => t * Math.PI * 2;
const SHAKE = [760, 1150, 320];

// ---------------------------------------------------------------------------------------------- camera
const zoomT = track([[0, 1.0], [1.5, 1.012], [6.0, 1.04, lin], [7.05, 1.085], [7.7, 1.095], [D, 1.17, (p) => 1 - (1 - p) * (1 - p)]]);
const camXT = track([[0, 540], [6.1, 540], [7.05, 548], [D, 540]]);
const camYT = track([[0, 952], [1.5, 948], [6.0, 935, lin], [7.05, 952], [7.7, 950], [D, 918]]);
function cameraAt(t) {
  const z = zoomT(t);
  let cx = camXT(t), cy = camYT(t);
  const u = t - T.land;
  if (u > 0) cy += 5 * Math.exp(-u * 11) * Math.sin(u * 52);       // the slap of the card
  const half = 960 / z, halfW = 540 / z;
  cy = clamp(cy, half - 40, 1920 - half + 40); cx = clamp(cx, halfW - 40, 1080 - halfW + 40);
  return { x: cx, y: cy, z: ZC / z };
}

// ---------------------------------------------------------------------------------------------- helpers
function dataTex(data, w, h, format, type, { mip = false, repeat = false } = {}) {
  const t = new THREE.DataTexture(data, w, h, format, type);
  t.magFilter = THREE.LinearFilter;
  t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  t.generateMipmaps = mip;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.unpackAlignment = 1;
  t.needsUpdate = true;
  return t;
}
function quadGeo() {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  return g;
}
function instGeo(attrs, max) {
  const g = new THREE.InstancedBufferGeometry();
  const q = quadGeo();
  g.setAttribute('position', q.getAttribute('position'));
  g.setIndex(q.getIndex());
  const arrs = {};
  for (const [name, size] of attrs) { const a = new THREE.InstancedBufferAttribute(new Float32Array(max * size), size); a.setUsage(THREE.DynamicDrawUsage); g.setAttribute(name, a); arrs[name] = a; }
  g.instanceCount = 0;
  return { g, arrs };
}
function gridGeo(x0, y0, x1, y1, step) {
  const nx = Math.ceil((x1 - x0) / step), ny = Math.ceil((y1 - y0) / step), pos = [], idx = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) pos.push(lerp(x0, x1, i / nx), lerp(y0, y1, j / ny), 0);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, b, d, a, d, c); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  return g;
}
const mixC = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));

defineDemo({
  id: '146-spray-stencil',
  title: '벽에 뿌린 한마디',
  tech: '스프레이 스텐실 · 가우스 분사 + 다리 있는 스텐실 + 흘러내림',
  duration: D,
  background: '#16121f',

  async setup(api) {
    await fontReady(`400 200px ${FONT}`, '오늘도무사히');

    // ---- stencil: letters → islands → bridges → SDF
    const meas = document.createElement('canvas').getContext('2d');
    meas.font = `400 200px ${FONT}`; meas.letterSpacing = '6px';
    const wMax = Math.max(...LINES.map((L) => meas.measureText(L.text).width));
    const size = Math.round((200 * TEXT_W) / wMax);
    meas.font = `400 ${size}px ${FONT}`; meas.letterSpacing = `${Math.round(size * 0.03)}px`;
    const lines = LINES.map((L) => {
      const m = meas.measureText(L.text);
      return { text: L.text, x: 540 + size * 0.015, base: L.cy + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2, top: L.cy - (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / 2, bot: L.cy + (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / 2 };
    });
    const st = buildStencil({ REG: CARD_R, CARD, lines, font: `400 ${size}px ${FONT}`, letterSpacing: `${Math.round(size * 0.03)}px`, BW: 10 });

    // ---- spray path, calibration, baked deposition slices
    const S = buildSamples();
    const probes = [[], []];
    for (let y = 0; y < CARD_R.h; y += 6) for (let x = 0; x < CARD_R.w; x += 6) {
      if (st.open[y * CARD_R.w + x] < 0.5) continue;
      const sy = y + CARD_R.y0, sx = x + CARD_R.x0, li = sy < (LINES[0].cy + LINES[1].cy) / 2 ? 0 : 1;
      probes[li].push([sx, sy]);
    }
    for (const s of S) s.amt = s.raw;
    const med = (a) => { const b = [...a].sort((p, q) => p - q); return b[b.length >> 1]; };
    const all = [...probes[0], ...probes[1]];
    const k1 = 1.5 / med(all.map(([x, y]) => depositAt(S, x, y)[0]));
    const L2 = lines[1], low2 = probes[1].filter(([, y]) => y > L2.bot - 0.25 * (L2.bot - L2.top));
    const k2 = 1.7 / med(low2.map(([x, y]) => depositAt(S, x, y)[1]));
    for (const s of S) s.amt = s.raw * (s.coat ? k2 : k1);
    this.S = S;
    const slices = bakeSlices(S);

    // ---- drips: where the paint pooled against the bottom edges of the holes
    const edges = bottomEdges({ REG: CARD_R, open: st.open, rect: st.rect }).filter((_, i) => i % 2 === 0);
    const rd = rand(4242), cand = [];
    for (const e of edges) {
      const [d1, d2] = depositAt(S, e.x, e.y - 2), ex = d1 + d2 - 2.15;
      if (ex > 0) cand.push({ ...e, ex, d2, key: ex * (0.35 + rd()) });
    }
    cand.sort((a, b) => b.key - a.key);
    const seeds = [];
    for (const c of cand) {
      if (seeds.length >= 18) break;
      if (seeds.some((s) => Math.abs(s.x - c.x) < 34 && Math.abs(s.y - c.y) < 90)) continue;
      seeds.push(c);
    }
    const revealT = (x, y) => {
      for (let t = T.lift; t < 8.2; t += 1 / 120) {
        const P = peelState(t);
        if (t > T.pull[0] + 0.15 || P.nx * x + P.ny * y > P.s + P.R * (P.phi > Math.PI / 2 ? 1 : Math.sin(P.phi)) + 8) return t;
      }
      return 8.2;
    };
    this.drips = seeds.map((s) => {
      const t0 = revealT(s.x, s.y) + 0.04 + rd() * 0.24, ex = s.ex;
      return {
        x: s.x, y: s.y - 3, w: clamp(2.2 + 1.6 * Math.sqrt(ex), 2, 4.4), L: clamp(34 + 130 * Math.pow(ex, 1.1), 24, 210),
        t0, tau: 0.5 + 0.55 * rd(), amp: 0.6 + 1.6 * rd(), ph: rd() * 6.283, col: mixC(CREAM, CORAL, clamp((s.d2 - 0.25) / 0.85, 0, 1)),
      };
    });

    // ---- painted textures
    const wall = bakeWall(WALL_R);
    const kraft = bakeKraft(CARD_R, CARD, lines.flatMap((L) => [L.top - 4, L.bot + 4]));
    const tape = bakeTape();
    const PAINT = [['#fbf4e4', '#efe3c9', '#b9ab8e'], ['#ff8a7c', '#ff5a4c', '#c23a33']];
    const cans = PAINT.map((p) => bakeCan(p));
    const canSh = bakeCanShadow();
    const mist = bakeMistNoise();
    const drops = bakeDrops(WALL_R);
    const sdfHalf = new Uint16Array(st.sdf.length);
    for (let i = 0; i < st.sdf.length; i++) sdfHalf[i] = THREE.DataUtils.toHalfFloat(clamp(st.sdf[i], -60, 60));

    const tex = {
      wall: dataTex(wall, WALL_R.w, WALL_R.h, THREE.RGBAFormat, THREE.UnsignedByteType),
      thr: dataTex(drops, WALL_R.w, WALL_R.h, THREE.RGFormat, THREE.UnsignedByteType),
      sdf: dataTex(sdfHalf, CARD_R.w, CARD_R.h, THREE.RedFormat, THREE.HalfFloatType),
      kraft: dataTex(kraft, CARD_R.w, CARD_R.h, THREE.RGBAFormat, THREE.UnsignedByteType),
      tape: dataTex(tape.data, tape.w, tape.h, THREE.RGBAFormat, THREE.UnsignedByteType, { mip: true }),
      cans: cans.map((c) => dataTex(c.data, c.w, c.h, THREE.RGBAFormat, THREE.UnsignedByteType, { mip: true })),
      canSh: dataTex(canSh.data, canSh.w, canSh.h, THREE.RGBAFormat, THREE.UnsignedByteType),
      mist: dataTex(mist, 256, 256, THREE.RGBAFormat, THREE.UnsignedByteType, { repeat: true }),
    };
    const dep = new THREE.DataArrayTexture(slices, DEP.w, DEP.h, NSLICE + 1);
    dep.format = THREE.RGFormat; dep.type = THREE.HalfFloatType;
    dep.minFilter = dep.magFilter = THREE.LinearFilter; dep.generateMipmaps = false; dep.unpackAlignment = 1; dep.needsUpdate = true;

    // ---- renderer, camera, shadow buffer
    const el = api.layer('canvas', { z: 0 });
    el.width = 1080; el.height = 1920;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(1080, 1920, false);
    const cam = new THREE.PerspectiveCamera((2 * Math.atan(960 / ZC) * 180) / Math.PI, 1080 / 1920, 50, 8000);
    const rt = new THREE.WebGLRenderTarget(1080, 1920, { depthBuffer: false, type: THREE.UnsignedByteType });

    const U = {
      uWallR: { value: new THREE.Vector4(WALL_R.x0, WALL_R.y0, WALL_R.w, WALL_R.h) },
      uCardR: { value: new THREE.Vector4(CARD_R.x0, CARD_R.y0, CARD_R.w, CARD_R.h) },
      uDepR: { value: new THREE.Vector4(DEP.x0, DEP.y0, DEP.cell, 0) },
      uDepN: { value: new THREE.Vector2(DEP.w, DEP.h) },
      uWall: { value: tex.wall }, uThr: { value: tex.thr }, uSdf: { value: tex.sdf }, uKraft: { value: tex.kraft }, uShadow: { value: rt.texture },
      uDep: { value: dep }, uSlice: { value: 0 }, uRem: { value: new Float32Array(48) }, uRemN: { value: 0 },
      uL: { value: new THREE.Vector3(...LV) }, uAmb: { value: new THREE.Vector3(0.46, 0.45, 0.56) }, uSun: { value: new THREE.Vector3(0.57, 0.5, 0.41) },
      uShadeLine: { value: new THREE.Vector4(1080, 1240, -0.58, -0.81) }, uSunK: { value: 1 },
      uCream: { value: new THREE.Vector3(...CREAM) }, uCoral: { value: new THREE.Vector3(...CORAL) },
      uRes: { value: new THREE.Vector2(1080, 1920) },
      uN: { value: new THREE.Vector2(-1, 0) }, uS: { value: 0 }, uR: { value: 40 }, uPhi: { value: 1 }, uE: { value: new THREE.Matrix4() }, uThick: { value: 3 },
      uCam: { value: new THREE.Vector3() }, uLifting: { value: 0 }, uR2: { value: 40 }, uFrame: { value: 0 }, uTime: { value: 0 },
    };
    const mat = (vs, fs, extra = {}, opts = {}) => new THREE.ShaderMaterial({
      uniforms: { ...U, ...extra }, vertexShader: vs, fragmentShader: fs, depthTest: false, depthWrite: false,
      transparent: true, side: THREE.DoubleSide, ...opts,
    });
    const maxOpts = { blending: THREE.CustomBlending, blendEquation: THREE.MaxEquation, blendEquationAlpha: THREE.MaxEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor };
    const scene = new THREE.Scene(), shScene = new THREE.Scene();
    const add = (sc, geo, m, order) => { const o = new THREE.Mesh(geo, m); o.frustumCulled = false; o.renderOrder = order; sc.add(o); return o; };

    // wall
    const wg = new THREE.BufferGeometry();
    const { x0, y0, w, h } = WALL_R;
    wg.setAttribute('position', new THREE.Float32BufferAttribute([x0, -y0, 0, x0 + w, -y0, 0, x0 + w, -(y0 + h), 0, x0, -(y0 + h), 0], 3));
    wg.setIndex([0, 1, 2, 0, 2, 3]);
    add(scene, wg, mat(SH.WALL_VS, SH.WALL_FS, {}, { transparent: false }), 0);
    // drips
    const drip = instGeo([['iA', 4], ['iB', 4], ['iC', 3]], this.drips.length);
    this.drips.forEach((d, i) => { drip.arrs.iA.setXYZW(i, d.x, d.y, d.w, d.L); drip.arrs.iB.setXYZW(i, d.t0, d.tau, d.amp, d.ph); drip.arrs.iC.setXYZ(i, ...d.col); });
    drip.g.instanceCount = this.drips.length;
    add(scene, drip.g, mat(SH.DRIP_VS, SH.DRIP_FS), 1);
    // card: attached part, tapes on it, lifted part, tapes on it
    const cardGeo = gridGeo(CARD.x - 40, CARD.y - 40, CARD.x + CARD.w + 40, CARD.y + CARD.h + 40, 8);
    const cardMeshes = [add(scene, cardGeo, mat(SH.CARD_VS, SH.CARD_FS, { uPart: { value: 0 } }), 3),
      add(scene, cardGeo, mat(SH.CARD_VS, SH.CARD_FS, { uPart: { value: 1 } }), 5)];
    const tapeGeo = (() => {
      const pos = [], idx = [], ids = [], NX = 24, NY = 3;
      for (let k = 0; k < 4; k++) {
        const b = pos.length / 3;
        for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) { pos.push(i / NX - 0.5, j / NY - 0.5, 0); ids.push(k); }
        for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const a = b + j * (NX + 1) + i, c = a + NX + 1; idx.push(a, a + 1, c + 1, a, c + 1, c); }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aIdx', new THREE.Float32BufferAttribute(ids, 1)); g.setIndex(idx);
      return g;
    })();
    const tapeU = { uTape: { value: tex.tape }, uTapeA: { value: new Float32Array(16) }, uTapeB: { value: new Float32Array(16) } };
    cardMeshes.push(add(scene, tapeGeo, mat(SH.TAPE_VS, SH.TAPE_FS, { ...tapeU, uPart: { value: 0 } }), 4),
      add(scene, tapeGeo, mat(SH.TAPE_VS, SH.TAPE_FS, { ...tapeU, uPart: { value: 1 } }), 6));
    // airborne: mist, cone, can, specks
    const mistI = instGeo([['iA', 4], ['iB', 4]], 48);
    add(scene, mistI.g, mat(SH.MIST_VS, SH.MIST_FS, { uNoise: { value: tex.mist } }), 7);
    const coneGeo = quadGeo();
    const coneU = { uApex: { value: new THREE.Vector2() }, uImpact: { value: new THREE.Vector2() }, uSig: { value: 60 }, uAlpha: { value: 0 }, uCol: { value: new THREE.Vector3() } };
    const coneMesh = add(scene, coneGeo, mat(SH.CONE_VS, SH.CONE_FS, coneU), 8);
    const canMeshes = [0, 1].map((i) => {
      const g = quadGeo(), m = add(scene, g, mat(SH.SPRITE_VS, SH.SPRITE_FS, { uTex: { value: tex.cans[i] }, uAlpha: { value: 1 } }), 9);
      const gs = quadGeo(), ms = add(shScene, gs, mat(SH.SPRITE_VS, SH.SPRITE_SH_FS, { uTex: { value: tex.canSh }, uAlpha: { value: 0.6 } }, maxOpts), 0);
      return { m, g, ms, gs };
    });
    const speckI = instGeo([['iA', 4]], 160);
    add(scene, speckI.g, mat(SH.SPECK_VS, SH.SPECK_FS, { uCol: { value: new THREE.Vector3(1.0, 0.93, 0.8) } }), 10);
    // shadow buffer: card (r: contact, g: lifted) and tapes
    cardMeshes.push(add(shScene, cardGeo, mat(SH.CARD_SH_VS, SH.CARD_SH_FS, {}, maxOpts), 0),
      add(shScene, tapeGeo, mat(SH.TAPE_SH_VS, SH.TAPE_SH_FS, tapeU, maxOpts), 0));

    // specks of mist that drift in the low sun long after the spray
    const rs = rand(515);
    this.specks = Array.from({ length: 150 }, () => {
      const j = Math.floor(lerp(120, NS - 1, Math.sqrt(rs()))), s = S[j];   // more of them late, so they hang in the afterglow
      return { tb: s.t, x: s.x + (rs() - 0.5) * s.sig * 5, y: s.y + (rs() - 0.5) * s.sig * 4, vx: -5 + rs() * 16, vy: 3 + rs() * 11, sz: 2.6 + rs() * rs() * 4, a: 0.6 + rs() * 0.4, ph: rs() * 6.28, life: 5.5 + rs() * 2.5 };
    });

    // static vignette over the picture
    const ov = api.canvas({ type: '2d', z: 2 }).ctx;
    drawVignette(ov, 1080, 1920);

    Object.assign(this, { renderer, cam, rt, scene, shScene, cardMeshes, U, tapeU, coneU, coneMesh, canMeshes, mistI, speckI });
    this.mistCol = [mixC(CREAM, [1, 0.95, 0.86], 0.4), mixC(CORAL, [1, 0.82, 0.72], 0.32)];
  },

  frame(t) {
    const S = this, U = S.U;
    // ---- camera
    const C = cameraAt(t);
    S.cam.position.set(C.x, -C.y, C.z); S.cam.up.set(0, 1, 0); S.cam.lookAt(C.x, -C.y, 0); S.cam.updateMatrixWorld(true);
    U.uCam.value.set(C.x, C.y, C.z);
    U.uFrame.value = Math.floor(t * 30);
    U.uTime.value = t;
    U.uSunK.value = 1 - 0.07 * (t / D);
    const shX = 1080 - 16 * (t / D), shY = 1240 - 30 * (t / D);
    U.uShadeLine.value.set(shX, shY, -0.58, -0.81);

    // ---- paint: baked slice + exact remainder
    const R = remainder(S.S, t, U.uRem.value);
    U.uSlice.value = R.slice; U.uRemN.value = R.n;

    // ---- card and tapes
    const P = peelState(t);
    for (const o of S.cardMeshes) o.visible = t < T.pull[1] + 0.05;
    U.uN.value.set(P.nx, P.ny); U.uS.value = P.s; U.uR.value = P.R; U.uR2.value = P.R; U.uPhi.value = P.phi; U.uE.value.copy(P.E); U.uLifting.value = P.lifting;
    const A = S.tapeU.uTapeA.value, B = S.tapeU.uTapeB.value;
    TAPES.forEach((tp, i) => {
      const p = seg(t, tp.t0 - 0.15, tp.t0), hgt = 70 * (1 - p * p), u = t - tp.t0;
      const sq = u > 0 ? 0.03 * Math.exp(-u * 18) * Math.sin(u * 50) : 0;
      A.set([tp.cx, tp.cy, tp.ang, tp.len], i * 4);
      B.set([tp.wid, t < tp.t0 ? hgt : 0, 1 + 0.12 * (1 - p * p) + sq, seg(t, tp.t0 - 0.15, tp.t0 - 0.09)], i * 4);
    });

    // ---- cans, their shadows, the cone of spray
    let spray = null;
    for (const which of [0, 1]) {
      const cp = canPose(t, which), M = S.canMeshes[which];
      M.m.visible = M.ms.visible = !!cp;
      if (!cp) continue;
      const c = Math.cos(cp.rot), s = Math.sin(cp.rot), pos = M.g.getAttribute('position'), sp = M.gs.getAttribute('position');
      [[0, 0], [CAN.w, 0], [CAN.w, CAN.h], [0, CAN.h]].forEach(([dx, dy], k) => {
        const lx = (dx - CAN.noz[0]) * CS, ly = (dy - CAN.noz[1]) * CS, x = cp.x + c * lx - s * ly, y = cp.y + s * lx + c * ly;
        pos.setXYZ(k, x, -y, cp.h);
        sp.setXYZ(k, x + KSH[0] * cp.h, -(y + KSH[1] * cp.h), 0);
      });
      pos.needsUpdate = sp.needsUpdate = true;
      M.ms.material.uniforms.uAlpha.value = 0.62 * Math.exp(-cp.h / 1400);
      const a = aimAt(t);
      if (a.coat === which && a.r > 0.01 && t >= SP.T0 && t <= SP.T1) spray = { a, cp };
    }
    S.coneMesh.visible = !!spray;
    if (spray) {
      const { a, cp } = spray, k = C.z / (C.z - cp.h);
      const ax = C.x + (cp.x - C.x) * k, ay = C.y + (cp.y - C.y) * k, sig = a.h * SP.TAN;
      S.coneU.uApex.value.set(ax, ay); S.coneU.uImpact.value.set(a.x, a.y); S.coneU.uSig.value = sig; S.coneU.uAlpha.value = a.r;
      S.coneU.uCol.value.set(...S.mistCol[a.coat]);
      const x0 = Math.min(ax, a.x) - 2.6 * sig, x1 = Math.max(ax, a.x) + 2.6 * sig, y0 = Math.min(ay, a.y) - 2.6 * sig, y1 = Math.max(ay, a.y) + 2.6 * sig;
      const pos = S.coneMesh.geometry.getAttribute('position');
      pos.setXYZ(0, x0, -y0, 1); pos.setXYZ(1, x1, -y0, 1); pos.setXYZ(2, x1, -y1, 1); pos.setXYZ(3, x0, -y1, 1); pos.needsUpdate = true;
    }

    // ---- mist puffs: every 6th sample in the last 1.5 s, plus a slow haze after the last press
    const mi = S.mistI.arrs, smp = S.S;
    let n = 0;
    for (let j = 0; j < NS && n < 48; j += 6) {
      const s = smp[j], age = t - s.t;
      if (age < 0) break;
      const a0 = aimAt(s.t).r;
      if (a0 <= 0.01) continue;
      const late = j >= NS - 90 || (j >= 330 && j < 350);
      const life = late ? 4.2 : 1.5;
      if (age > life) continue;
      const rad = s.sig * (1.3 + (late ? 3.2 : 2.3) * Math.pow(age, 0.6));
      const al = a0 * (late ? 0.13 * Math.exp(-age / 1.8) : 0.34 * Math.exp(-age / 0.5)) * clamp(age / 0.05);
      const col = S.mistCol[s.coat];
      mi.iA.setXYZW(n, s.x + 26 * age, s.y - 8 * age + 9 * age * age * (late ? 0.5 : 1), rad, al);
      mi.iB.setXYZW(n, col[0], col[1], col[2], (j * 0.137) % 1);
      n++;
    }
    S.mistI.g.instanceCount = n; mi.iA.needsUpdate = mi.iB.needsUpdate = true;

    // ---- specks settling in the low sun
    const si = S.speckI.arrs.iA;
    let m = 0;
    for (const p of S.specks) {
      const age = t - p.tb;
      if (age <= 0) continue;
      const x = p.x + p.vx * age + 5 * Math.sin(age * 1.3 + p.ph), y = p.y + p.vy * age;
      const sun = clamp(0.5 + ((x - shX) * -0.58 + (y - shY) * -0.81) / 300);      // they glint only in the low sun
      const a = p.a * clamp(age / 0.3) * (1 - seg(age, p.life - 1.5, p.life)) * (0.55 + 0.45 * Math.sin(t * 4.3 + p.ph)) * (0.25 + 0.75 * sun);
      if (a <= 0.01) continue;
      si.setXYZW(m++, x, y, p.sz, a);
    }
    S.speckI.g.instanceCount = m; si.needsUpdate = true;

    // ---- render: shadow buffer, then the picture
    const r = S.renderer;
    r.setRenderTarget(S.rt); r.setClearColor(0x000000, 0); r.clear(); r.render(S.shScene, S.cam);
    r.setRenderTarget(null); r.setClearColor(0x16121f, 1); r.render(S.scene, S.cam);
  },
});
