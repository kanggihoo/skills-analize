/*
 * 78 · 작은 행성 — a tiny planet in Zdog's flat pseudo-3D, from an afternoon village to a lit-up night.
 *
 * Zdog builds the scene graph (Anchor / Group / Shape / Rect / Cylinder / Cone) and projects and z-sorts it;
 * nothing in Zdog runs on its own clock. frame(t) sets every rotation, translation, scale and colour from t,
 * then calls illo.updateGraph() (transform + sort) and illo.renderGraph() — updateRenderGraph() split in two so the
 * day/night colours can be toned by each face's freshly transformed normal before it is drawn.
 *
 * Draw order: the planet is one big Zdog dot (sort value 0). Ground things (road, ponds, grass) sort just above it
 * when they face the camera and far below it when they do not; each standing object is a Group that sorts as a unit
 * by its base point — in front of the planet when the base faces the camera, behind it (and hidden by the disc,
 * except what sticks out past the horizon) when it does not. Inside an object the order is fixed and culled
 * (see models.js), so nothing pops through.
 *
 * Canvas layers: 2D sky (gradient, sun/moon glow, atmosphere, stars) · Zdog · 2D clock.
 */
import { defineDemo, rand, clamp, lerp, smooth, ease, track } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { paintsAt, rgb, hex, lerp3 } from './palette.js';
import { FX, makeKit, ballRender } from './models.js';

const D = 10;
const R = 300;                 // planet radius (Zdog units = stage px at zoom 1)
const LIFT = -60;              // planet centre 60 px above the stage centre
const TAU = Math.PI * 2;

// ---------------- timeline ----------------
// camera: a slow turn, then a swing of ~143° to the far side; the look-down pitch lifts during the swing
const SWING0 = 3.3, SWING1 = 6.4;
const yawAt = (t) => -0.58 + 0.12 * t + 2.5 * ease.inOutCubic(clamp((t - SWING0) / (SWING1 - SWING0)));
const pitchAt = track([[0, -0.42], [SWING0, -0.4], [4.9, -0.17], [6.7, -0.4], [D, -0.34]]);
const dollyAt = track([[0, 1], [SWING0, 1], [4.9, 0.92], [6.9, 1.0], [D, 1.05]]);
// night-ness: 0 day · 0.5 dusk · 1 night
const nightAt = track([[0, 0], [4.2, 0], [5.3, 0.5, (p) => p], [6.5, 1, ease.outCubic]]);
// sun on a tilted orbit (camera space); the moon trails 60° behind it on the same ring
const DEG = Math.PI / 180;
const sunPhiAt = track([[0, -170 * DEG], [SWING0, -152 * DEG, (p) => p * (1.4 - 0.4 * p)], [6.2, -106 * DEG], [D, -96 * DEG, ease.outCubic]]);
const ORBIT = { r: 470, c: 0.45 };
ORBIT.s = Math.sqrt(1 - ORBIT.c * ORBIT.c);
const orbitPos = (phi) => ({ x: ORBIT.r * Math.cos(phi), y: ORBIT.r * ORBIT.c * Math.sin(phi), z: ORBIT.r * ORBIT.s * Math.sin(phi) });
const WIN_ON = 5.45;           // windows switch on from here (each at its own moment over ~1.5 s)
const beamAt = (t) => smooth((t - 6.0) / 0.7);
const headAt = (t) => smooth((t - 5.5) / 0.6);
const starsAt = (t) => smooth((t - 5.4) / 1.8);

/** damped spring step 0 → 1 (overshoot ≈ 25 %) and a squash-and-stretch term that rides on it */
function spring(tau, z = 0.4, w = 16) {
  if (tau <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
}
const squash = (tau, w = 16) => (tau <= 0 ? 0 : 0.28 * Math.exp(-7 * tau) * Math.sin(w * Math.sqrt(1 - 0.16) * tau));

// ---------------- the camera as plain math (mirrors Zdog: rotate Z, then Y, then X) ----------------
const rotY = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[2] * s, v[1], v[2] * c + v[0] * s]; };
const rotX = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[2] * c + v[1] * s]; };
/** surface normal for (θ from the north pole, φ azimuth) as the azimuth/tilt anchors place it */
const normalOf = (th, ph) => [Math.sin(th) * Math.sin(ph), -Math.cos(th), -Math.sin(th) * Math.cos(ph)];
const toCam = (n, t) => rotX(rotY(n, yawAt(t)), pitchAt(t));

// ---------------- what stands where: [kind, θ, φ, spin, options] (placement checked against the road) ----------------
const HOUSE = (w, d, h, roofH, wallKey, roofKey, chimney = false) => ({ w, d, h, roofH, wallKey, roofKey, chimney });
const OBJECTS = [
  ['windmill', 0.42, 3.30, 0.35],
  ['house', 0.80, 2.65, 0.45, HOUSE(42, 32, 26, 18, 'wallCream', 'roofCoral', true)],
  ['house', 0.95, 3.55, -0.3, HOUSE(36, 30, 38, 16, 'wallPeach', 'roofBlue')],
  ['house', 1.30, 2.30, 1.2, HOUSE(40, 30, 24, 16, 'wallMint', 'roofViolet')],
  ['house', 1.40, 3.95, -0.8, HOUSE(34, 28, 24, 15, 'wallButter', 'roofOrange', true)],
  ['lighthouse', 0.85, 0.10, 0],
  ['house', 0.65, 5.90, 0.6, HOUSE(40, 30, 26, 17, 'wallSky', 'roofTeal', true)],
  ['house', 1.15, 5.55, -0.4, HOUSE(36, 30, 36, 15, 'wallLilac', 'roofBerry')],
  ['house', 1.05, 0.95, 0.9, HOUSE(40, 30, 25, 17, 'wallCream', 'roofBlue')],
  ['house', 1.95, 1.60, 0.2, HOUSE(38, 30, 24, 16, 'wallPeach', 'roofTeal')],
  ['house', 2.00, 4.70, -0.5, HOUSE(38, 30, 25, 16, 'wallMint', 'roofCoral', true)],
  ['tree', 0.62, 2.85, 0, { h: 16, d: 34, key: 'leaf1', twin: true }],
  ['tree', 0.70, 3.85, 0, { h: 18, d: 30, key: 'leaf2' }],
  ['tree', 1.05, 2.15, 0, { h: 14, d: 34, key: 'leaf1' }],
  ['tree', 1.00, 3.15, 0, { h: 12, d: 28, key: 'leaf3' }],
  ['tree', 2.00, 2.45, 0, { h: 16, d: 32, key: 'leaf2', twin: true }],
  ['tree', 0.28, 2.20, 0, { h: 20, d: 32, key: 'leaf1' }],
  ['tree', 1.00, 5.25, 0, { h: 16, d: 34, key: 'leaf2', twin: true }],
  ['tree', 0.40, 5.55, 0, { h: 18, d: 30, key: 'leaf1' }],
  ['tree', 2.10, 3.10, 0, { h: 14, d: 30, key: 'leaf3' }],
  ['tree', 2.15, 0.30, 0, { h: 16, d: 32, key: 'leaf1' }],
  ['tree', 1.30, 1.55, 0, { h: 18, d: 34, key: 'leaf2', twin: true }],
  ['tree', 1.35, 4.60, 0, { h: 15, d: 30, key: 'leaf1' }],
  ['pine', 0.55, 0.60, 0, { s: 1.1 }], ['pine', 0.66, 0.80, 0, { s: 0.9 }], ['pine', 0.45, 0.38, 0, { s: 1.0 }],
  ['pine', 1.65, 0.25, 0, { s: 1.0 }], ['pine', 1.62, 0.55, 0, { s: 0.85 }], ['pine', 0.95, 1.25, 0, { s: 1.05 }],
  ['bush', 1.12, 2.62, 0, { d: 18 }], ['bush', 0.52, 3.62, 0, { d: 16 }], ['bush', 1.48, 3.30, 0, { d: 18 }],
  ['bush', 0.75, 0.35, 0, { d: 16 }], ['bush', 1.25, 5.90, 0, { d: 18 }],
  ['flowers', 0.74, 3.18, 0], ['flowers', 1.05, 3.95, 0], ['flowers', 0.75, 5.60, 0], ['flowers', 1.25, 0.75, 0],
];
const PONDS = [[1.20, 3.05, 40], [1.02, 0.45, 50]];
const ROAD = { tilt: 0.2, halfW: 22, segs: 72, dashes: 36 };   // a ring 11.5° off the equator, low on the village side

defineDemo({
  id: '78-zdog-planet',
  title: '작은 행성',
  tech: 'Zdog · 평면 의사 3D 일러스트 · 팔레트 낮/밤 전환',
  duration: D,
  background: '#bfe6f8',

  async setup({ W, H, canvas, layer, headless }) {
    const Z = window.Zdog;
    await fontReady('700 34px "Pretendard Variable"', '오전오후 0123456789:');

    // ---------------- layers ----------------
    const fast = headless ? { willReadFrequently: true } : undefined;
    const sky = canvas({ type: '2d', z: 0, attrs: fast }).ctx;
    const el = layer('canvas', { z: 1 });
    el.width = W; el.height = H;
    if (headless) el.getContext('2d', { willReadFrequently: true });   // Zdog then gets this same context
    const hud = canvas({ type: '2d', z: 2 }).ctx;

    const illo = new Z.Illustration({ element: el, centered: true, zoom: 1, resize: false });
    // 1:1 stage pixels whatever the display's devicePixelRatio (the stage itself is scaled to fit the window)
    illo.pixelRatio = 1;
    el.width = illo.canvasWidth = W; el.height = illo.canvasHeight = H;
    el.style.width = `${W}px`; el.style.height = `${H}px`;

    // ---------------- paint registry ----------------
    const paint = [];
    let bucket = null;                         // the object being built: its shapes scale with its pop
    const reg = (s, key, mode, extra = {}) => {
      const e = { s, key, mode, st: s.stroke, ...extra };
      paint.push(e);
      if (bucket) bucket.push(e);
      return s;
    };
    const kit = makeKit(Z, reg);

    // ---------------- scene graph ----------------
    const scene = new Z.Anchor({ addTo: illo, translate: { y: LIFT } });
    const world = new Z.Anchor({ addTo: scene });            // turned by the camera
    const skyA = new Z.Anchor({ addTo: scene });             // sun, moon, clouds: camera space

    // the planet: one dot, cel-shaded in screen space
    const planet = new Z.Shape({ addTo: scene, stroke: 2 * R, color: '#7bd06b' });
    planet.render = ballRender; planet.noHi = true;
    planet.updateSortValue = function () { this.sortValue = 0; };
    reg(planet, 'grass', 'ball');

    // sort rules
    const objSort = function () {
      Z.Group.prototype.updateSortValue.call(this);
      const z = this.renderOrigin.z;
      this.sortValue = z >= 0 ? 2 + z : z;
    };
    const groundSort = function () {
      Z.Shape.prototype.updateSortValue.call(this);
      this.sortValue = this.sortValue > -2 ? 1 + this.layer : -1e5;
    };
    const surface = (th, ph) => new Z.Anchor({ addTo: new Z.Anchor({ addTo: world, rotate: { y: ph } }), rotate: { x: th } });

    // ---- ground: grass patches, ponds, the road ----
    const rg = rand(78);
    for (let i = 0; i < 18; i++) {
      const th = Math.acos(1 - 2 * rg()), ph = rg() * TAU, d = 60 + rg() * 80;
      const e = new Z.Ellipse({ addTo: surface(th, ph), width: d, height: d * (0.6 + rg() * 0.35), translate: { y: -(R + 0.6) }, rotate: { x: Math.PI / 2, z: rg() * 3 },
        fill: true, stroke: 2, color: '#fff' });
      e.layer = 0; e.updateSortValue = groundSort;
      reg(e, 'grass2', 'face');
    }
    for (const [th, ph, r] of PONDS) {
      const a = surface(th, ph);
      const parts = [[2 * r + 10, 'waterRim', 0.03, 0, 0], [2 * r, 'water', 0.04, 0, 0], [r * 0.5, 'waterRim', 0.05, -r * 0.3, -r * 0.25]];
      for (const [d, key, layerV, x, z] of parts) {
        const e = new Z.Ellipse({ addTo: a, width: d, height: d * 0.8, translate: { x, z, y: -(R + 0.8 + layerV * 10) }, rotate: { x: Math.PI / 2 }, fill: true, stroke: 2, color: '#fff' });
        e.layer = layerV; e.updateSortValue = groundSort;
        reg(e, key, 'face');
      }
    }
    const roadA = new Z.Anchor({ addTo: world, rotate: { x: Math.PI / 2 - ROAD.tilt } });   // its local z = the ring's axis
    {
      const Rr = R + 0.6, hw = ROAD.halfW;
      const P = (s, z, rr = Rr) => ({ x: rr * Math.sin(s), y: -rr * Math.cos(s), z });
      for (let i = 0; i < ROAD.segs; i++) {
        const s0 = (i / ROAD.segs) * TAU, s1 = ((i + 1) / ROAD.segs) * TAU;
        const q = new Z.Shape({ addTo: roadA, path: [P(s0, -hw), P(s1, -hw), P(s1, hw), P(s0, hw)], fill: true, stroke: 2, color: '#fff' });
        q.layer = 0.02; q.updateSortValue = groundSort;
        reg(q, 'road', 'flat');
      }
      for (let i = 0; i < ROAD.dashes; i++) {
        const s0 = ((i + 0.3) / ROAD.dashes) * TAU, s1 = ((i + 0.7) / ROAD.dashes) * TAU;
        const q = new Z.Shape({ addTo: roadA, path: [P(s0, 0, R + 1.4), P((s0 + s1) / 2, 0, R + 1.4), P(s1, 0, R + 1.4)], closed: false, stroke: 3.5, color: '#fff' });
        q.layer = 0.025; q.updateSortValue = groundSort;
        reg(q, 'dash', 'flat');
      }
    }

    // ---- standing objects ----
    const objs = [];                            // { g, shapes, t0, n? }
    const rw = rand(7);
    let windmill = null, lighthouse = null;
    for (const [kind, th, ph, spin, opt = {}] of OBJECTS) {
      const g = new Z.Group({ addTo: surface(th, ph), translate: { y: -(R - 1.5) }, rotate: { y: spin }, updateSort: kind === 'windmill', visible: false });
      g.updateSortValue = objSort;
      bucket = [];
      if (kind === 'house') kit.house(g, { ...opt, rnd: rw, winOn: WIN_ON });
      else if (kind === 'tree') kit.tree(g, opt);
      else if (kind === 'pine') kit.pine(g, opt);
      else if (kind === 'bush') kit.bush(g, opt);
      else if (kind === 'flowers') kit.flowers(g, { rnd: rw });
      else if (kind === 'windmill') windmill = kit.windmill(g);
      else if (kind === 'lighthouse') lighthouse = kit.lighthouse(g);
      objs.push({ g, shapes: bucket, t0: 0, n: normalOf(th, ph), kind });
      bucket = null;
    }
    // pop schedule: what faces the camera pops first, in a wave around the disc; the rest springs up as it
    // comes over the horizon during the swing
    {
      const front = [], back = [];
      for (const o of objs) (toCam(o.n, 1.0)[2] > -0.05 ? front : back).push(o);
      const key = (o) => { const v = toCam(o.n, 1.0); return (Math.atan2(v[0], -v[1]) + 1.9 + 2 * TAU) % TAU; };
      front.sort((a, b) => key(a) - key(b));
      const step = Math.min(0.1, 2.2 / Math.max(1, front.length));
      front.forEach((o, i) => { o.t0 = 0.45 + i * step; });
      for (const o of back) {
        o.t0 = 3.0;
        for (let t = 0.45; t <= D; t += 1 / 60) if (toCam(o.n, t)[2] > -0.22) { o.t0 = t; break; }
      }
    }

    // ---- cars on the road ----
    const cars = [];
    for (const [key, s0, w, t0] of [['carRed', -0.7, 0.42, 1.45], ['carYellow', 2.2, -0.36, 1.75]]) {
      const spinA = new Z.Anchor({ addTo: roadA, rotate: { z: s0 } });
      const g = new Z.Group({ addTo: spinA, translate: { y: -(R + 0.6) }, rotate: { y: w < 0 ? Math.PI : 0 }, visible: false });
      g.updateSortValue = objSort;
      bucket = [];
      kit.car(g, { key });
      objs.push({ g, shapes: bucket, t0 });
      bucket = null;
      cars.push({ spinA, s0, w });
    }

    // ---- clouds: rings around the planet in camera space (they hug the silhouette, never cross the face) ----
    const clouds = [];
    const CLOUDS = [[R + 92, 0.25, -2.35, 0.05, 1.05], [R + 140, -0.2, -0.95, 0.04, 0.9], [R + 110, 0.3, 0.55, 0.035, 1.15], [R + 150, -0.25, 1.85, 0.045, 0.85], [R + 84, 0.18, 2.9, 0.05, 0.95]];
    CLOUDS.forEach(([alt, tilt, a0, w, sc], i) => {
      const ring = new Z.Anchor({ addTo: skyA, rotate: { x: tilt } });
      const spinA = new Z.Anchor({ addTo: ring, rotate: { z: a0 } });
      const g = new Z.Group({ addTo: spinA, translate: { y: -alt }, visible: false });
      g.updateSortValue = objSort;
      bucket = [];
      for (const [x, y, d] of [[-27 * sc, 7 * sc, 32 * sc], [25 * sc, 6 * sc, 36 * sc], [-9 * sc, -14 * sc, 30 * sc], [4 * sc, 0, 46 * sc]]) {
        kit.ball(g, { x, y, d, key: 'cloud', noHi: true, offK: 0.7 });
      }
      objs.push({ g, shapes: bucket, t0: 0.85 + i * 0.2 });
      bucket = null;
      clouds.push({ spinA, a0, w });
    });

    // ---- sun and moon ----
    const sunG = new Z.Group({ addTo: skyA, visible: false });
    sunG.updateSortValue = objSort;
    const sun = new Z.Shape({ addTo: sunG, stroke: 1 });
    sun.k = 1;
    sun.render = function (ctx) {
      if (!this.visible || this.k < 0.01) return;
      const p = this.pathCommands[0].endRenderPoint, r = 44 * this.k, dusk = FX.dusk;
      const warm = lerp3(hex('#ffd23f'), hex('#ff8d3a'), dusk);
      for (const [rr, a] of [[2.5, 0.08], [1.9, 0.12], [1.45, 0.2]]) {
        ctx.fillStyle = rgb(warm, a); ctx.beginPath(); ctx.arc(p.x, p.y, r * rr, 0, TAU); ctx.fill();
      }
      ctx.strokeStyle = rgb(lerp3(hex('#ffc12e'), hex('#ff7a2e'), dusk)); ctx.lineWidth = 6 * this.k; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = FX.sunSpin + (i / 12) * TAU, r1 = r * 1.2, r2 = r * (i % 2 ? 1.42 : 1.6);
        ctx.moveTo(p.x + Math.cos(a) * r1, p.y + Math.sin(a) * r1); ctx.lineTo(p.x + Math.cos(a) * r2, p.y + Math.sin(a) * r2);
      }
      ctx.stroke();
      ctx.fillStyle = rgb(warm); ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,248,200,0.55)'; ctx.beginPath(); ctx.arc(p.x - r * 0.22, p.y - r * 0.24, r * 0.55, 0, TAU); ctx.fill();
    };
    objs.push({ g: sunG, shapes: [{ s: sun, prop: 'k' }], t0: 0.25 });
    const moonG = new Z.Group({ addTo: skyA });
    moonG.updateSortValue = objSort;
    const moon = new Z.Shape({ addTo: moonG, stroke: 1 });
    moon.render = function (ctx) {
      if (!this.visible) return;
      const p = this.pathCommands[0].endRenderPoint, r = 36;
      for (const [rr, a] of [[2.6, 0.06], [1.8, 0.1], [1.35, 0.16]]) {
        ctx.fillStyle = `rgba(214,226,255,${(a * (0.4 + 0.6 * FX.night)).toFixed(3)})`; ctx.beginPath(); ctx.arc(p.x, p.y, r * rr, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = '#e6d79e'; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = '#fff6cf'; ctx.beginPath(); ctx.arc(p.x + r * 0.22, p.y - r * 0.12, r, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(214,196,140,0.75)';
      for (const [x, y, rr] of [[-0.3, -0.25, 0.2], [0.28, 0.3, 0.15], [0.12, -0.42, 0.1], [-0.05, 0.45, 0.09]]) {
        ctx.beginPath(); ctx.arc(p.x + x * r, p.y + y * r, rr * r, 0, TAU); ctx.fill();
      }
      ctx.restore();
    };

    // ---------------- sky: stars (fixed, seeded) ----------------
    const rs = rand(1978);
    const stars = Array.from({ length: 150 }, () => ({ x: rs() * W, y: rs() * 1560, r: 0.8 + rs() * rs() * 2.4, w: 1.5 + rs() * 3, p: rs() * TAU }));
    const SKY = {
      top: [hex('#74c4ef'), hex('#5b5aa6'), hex('#0b1636')],
      mid: [hex('#bfe6f8'), hex('#ee8fa0'), hex('#1b2a5a')],
      bot: [hex('#fff0d4'), hex('#ffc187'), hex('#33407a')],
    };
    const r3 = (s, k) => (k < 0.5 ? lerp3(s[0], s[1], k * 2) : lerp3(s[1], s[2], (k - 0.5) * 2));
    const winOff = [hex('#a9dcff'), hex('#8d8fb8'), hex('#2e3966')], winLit = hex('#ffd76a');
    const box = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

    this.render = (t) => {
      // ---- camera, light, time of day ----
      const yaw = yawAt(t), pitch = pitchAt(t);
      const zoom = Math.max(1e-3, spring(t, 0.5, 9) * dollyAt(t));
      world.rotate.y = yaw; world.rotate.x = pitch;
      illo.zoom = zoom;
      const k = nightAt(t);
      const ps = sunPhiAt(t), pm = ps + 60 * DEG;
      const S = orbitPos(ps), M = orbitPos(pm);
      sunG.translate.set(S); moonG.translate.set(M);
      // how much of each disc clears the planet (both orbit behind it): 0 hidden … 1 clear
      const vis = (P, rr) => smooth((Math.hypot(P.x, P.y) - (R - rr)) / (2 * rr));
      const vS = vis(S, 44), vM = vis(M, 36);
      let lx = 0, ly = 0;
      const add = (P, wgt) => { const l = Math.hypot(P.x, P.y) || 1; lx += (P.x / l) * wgt; ly += (P.y / l) * wgt; };
      add(S, vS * (1 - 0.6 * k)); add(M, vM * 0.8 * k);
      ly -= 0.35;                                                    // light from above, always a little
      const ll = Math.hypot(lx, ly) || 1;
      FX.lx = lx / ll; FX.ly = ly / ll;
      FX.off = lerp(0.26, 0.17, k);
      FX.hiA = lerp(0.36, 0.1, k);
      FX.beam = beamAt(t); FX.head = headAt(t);
      FX.dusk = clamp(k * 2) * (1 - smooth((k - 0.6) / 0.4));
      FX.night = k;
      FX.sunSpin = t * 0.35;
      const L3 = box([FX.lx, FX.ly, 0.95]);

      // ---- motion ----
      if (windmill) windmill.rotor.rotate.z = -2.1 * t;
      if (lighthouse) lighthouse.beam.rotate.y = 2.3 * t;
      for (const c of cars) c.spinA.rotate.z = c.s0 + c.w * t;
      for (const c of clouds) c.spinA.rotate.z = c.a0 + c.w * t;

      // ---- pops: springy scale (strokes scale too — Zdog strokes are screen-space) ----
      for (const o of objs) {
        const tau = t - o.t0;
        const p = spring(tau);
        if (p < 0.003) { o.g.visible = false; continue; }
        o.g.visible = true;
        const a = squash(tau);
        o.g.scale.x = o.g.scale.z = p * (1 - 0.5 * a);
        o.g.scale.y = p * (1 + a);
        for (const e of o.shapes) {
          if (e.prop) e.s[e.prop] = p;
          else if (e.st) e.s.stroke = e.st * p;
        }
      }

      illo.updateGraph();

      // ---- colour every shape for this moment ----
      const P = paintsAt(k);
      const wOff = r3(winOff, k);
      for (const e of paint) {
        const s = e.s;
        if (e.mode === 'flat') s.color = P[e.key].base;
        else if (e.mode === 'ball') s.pal = P[e.key];
        else if (e.mode === 'face') {
          const f = s.renderFront, o = s.renderOrigin;
          const nx = f.x - o.x, ny = f.y - o.y, nz = f.z - o.z, nl = Math.hypot(nx, ny, nz) || 1;
          const d = (nx * L3[0] + ny * L3[1] + nz * L3[2]) / nl;
          const c = P[e.key];
          s.color = rgb(lerp3(c.s, c.c, clamp(0.5 + 0.62 * d)));
        } else if (e.mode === 'win') {
          const on = clamp((t - e.t0) / 0.16);
          s.on = on;
          s.color = rgb(lerp3(wOff, winLit, on));
        }
      }
      illo.renderGraph();

      // ---- sky (behind the Zdog canvas) ----
      const cx = W / 2, cy = H / 2 + LIFT * zoom, pr = R * zoom;
      const gr = sky.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, rgb(r3(SKY.top, k))); gr.addColorStop(0.5, rgb(r3(SKY.mid, k))); gr.addColorStop(0.86, rgb(r3(SKY.bot, k)));
      sky.globalCompositeOperation = 'source-over';
      sky.fillStyle = gr; sky.fillRect(0, 0, W, H);
      const sa = starsAt(t);
      if (sa > 0) {
        for (const s of stars) {
          const a = sa * (0.55 + 0.45 * Math.sin(t * s.w + s.p));
          sky.fillStyle = `rgba(255,250,230,${a.toFixed(3)})`;
          sky.beginPath(); sky.arc(s.x, s.y, s.r, 0, TAU); sky.fill();
        }
        // a shooting star near the end
        const sp = clamp((t - 8.25) / 0.7);
        if (sp > 0 && sp < 1) {
          const x0 = 860, y0 = 250, x1 = 560, y1 = 470, e = ease.outCubic(sp);
          const hx = lerp(x0, x1, e), hy = lerp(y0, y1, e), tx = lerp(x0, x1, Math.max(0, e - 0.28)), ty = lerp(y0, y1, Math.max(0, e - 0.28));
          const sg = sky.createLinearGradient(tx, ty, hx, hy);
          sg.addColorStop(0, 'rgba(255,250,230,0)'); sg.addColorStop(1, `rgba(255,250,230,${(0.9 * Math.sin(Math.PI * sp)).toFixed(3)})`);
          sky.strokeStyle = sg; sky.lineWidth = 3; sky.lineCap = 'round';
          sky.beginPath(); sky.moveTo(tx, ty); sky.lineTo(hx, hy); sky.stroke();
        }
      }
      // sun / moon glow, then the planet's atmosphere
      const glow = (P3, rr, col, a) => {
        if (a <= 0.005) return;
        const x = cx + P3.x * zoom, y = cy + P3.y * zoom, r = rr * zoom;
        const g = sky.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgb(col, a)); g.addColorStop(1, rgb(col, 0));
        sky.fillStyle = g; sky.fillRect(x - r, y - r, 2 * r, 2 * r);
      };
      glow(S, 380 + 120 * FX.dusk, lerp3(hex('#fff2b0'), hex('#ff9a5c'), FX.dusk), 0.55 * (1 - k * 0.85) * (0.35 + 0.65 * Math.max(vS, FX.dusk)));
      glow(M, 260, hex('#c9d6ff'), 0.32 * k * vM);
      {
        const g = sky.createRadialGradient(cx, cy, pr * 0.97, cx, cy, pr + 95 * zoom);
        const ac = lerp3(hex('#ffffff'), hex('#9fb4ff'), k);
        g.addColorStop(0, rgb(ac, lerp(0.55, 0.3, k))); g.addColorStop(1, rgb(ac, 0));
        sky.fillStyle = g; sky.beginPath(); sky.arc(cx, cy, pr + 95 * zoom, 0, TAU); sky.fill();
      }
      // a soft dusky floor so the white caption always reads
      {
        const g = sky.createLinearGradient(0, 1520, 0, H);
        g.addColorStop(0, 'rgba(20,26,58,0)'); g.addColorStop(0.45, 'rgba(20,26,58,0.42)'); g.addColorStop(1, 'rgba(20,26,58,0.7)');
        sky.fillStyle = g; sky.fillRect(0, 1520, W, H - 1520);
      }

      // ---- the clock (top): afternoon 3:00 → evening 9:30 ----
      hud.clearRect(0, 0, W, 260);
      const ha = smooth((t - 0.7) / 0.6);
      if (ha > 0) {
        const mins = 15 * 60 + Math.floor(((t / D) * 390) / 10) * 10;
        const h24 = Math.floor(mins / 60), mm = mins % 60;
        const label = `${h24 < 12 ? '오전' : '오후'} ${((h24 + 11) % 12) + 1}:${String(mm).padStart(2, '0')}`;
        hud.font = '700 34px "Pretendard Variable", sans-serif';
        const tw = hud.measureText(label).width, pw = tw + 102, px = W / 2 - pw / 2, py = 104 - 12 * (1 - ha), ph = 64;
        hud.globalAlpha = ha;
        hud.fillStyle = rgb(lerp3(hex('#ffffff'), hex('#1a2550'), k), lerp(0.62, 0.55, k));
        hud.beginPath(); hud.roundRect(px, py, pw, ph, 32); hud.fill();
        // icon: the sun turns into a crescent moon
        const ix = px + 40, iy = py + ph / 2;
        hud.fillStyle = rgb(lerp3(hex('#ffb326'), hex('#ffe9a8'), k));
        hud.beginPath(); hud.arc(ix, iy, 13, 0, TAU); hud.fill();
        if (k > 0) {
          hud.fillStyle = rgb(lerp3(hex('#ffffff'), hex('#1a2550'), k), lerp(0.62, 1, k) * smooth(k * 1.5));
          hud.beginPath(); hud.arc(ix + 7 * k, iy - 5 * k, 11.5, 0, TAU); hud.fill();
        }
        hud.fillStyle = rgb(lerp3(hex('#24314f'), hex('#eef2ff'), k));
        hud.textAlign = 'left'; hud.textBaseline = 'middle';
        hud.fillText(label, px + 70, iy + 1);
        hud.globalAlpha = 1;
      }
    };
  },

  frame(t) { this.render(t); },
});
