/*
 * 87 · 밤 숲의 한 사람 — a search drone looks down on a night campsite. One top-down map keeps coming back
 * while its sensor channels switch on one at a time:
 *
 *   CH1 가시광   moonlight only — tents, trees, a creek, almost nothing to go on
 *   CH2 열       a scalar field (Gaussian heat sources + a smoke plume of advected noise) through an ironbow LUT:
 *                six warm bodies, and the brackets lock onto all of them
 *   CH3 소리     a second scalar field (creek hiss, wind in the crowns, a whistle's wave packets in retarded
 *                time) through a single-hue LUT: one source sings, the others drop away, the reticle springs
 *                onto it (the climax), its heat fuses into the sound map
 *   CH1 + 조명   back to visible light, a searchlight pool on the same spot shows who it is
 *
 * The signature transition is the scan band: a bright horizontal band in the next channel's colour sweeps
 * down the frame and the next channel is revealed behind it (scanlines, a bright leading edge, an RGB split
 * with row jitter just behind the edge).
 *
 * Everything is a pure function of t: the map is baked in setup (two palettes + an outline layer + field
 * masks), the fields are recomputed from scratch on a 1/3-resolution world grid each frame, every animation
 * is a closed form of t (eases, a closed-form damped spring, noise sampled at p − v·t).
 */
import { defineDemo, rand, clamp, lerp, smooth, ramp, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 10, W = 1080, H = 1920, TAU = Math.PI * 2;
const KR = `"${FONTS.pretendard.family}"`, MONO = `"${FONTS.jetbrainsMono.family}"`;

// ---------------------------------------------------------------- palette (tokens) and timeline
const COL = { fg: '#f4f1ea', muted: '#8e98b8', moon: '#bcd0ff', heat: '#ff9a4a', sound: '#7fe7ff', lock: '#ffcf5a', lit: '#ffe9c4' };
const RGB = { moon: '188,208,255', heat: '255,138,61', sound: '127,231,255', lock: '255,207,90', lit: '255,233,196' };
const CH = [   // channel look: chip label, colour token
  { name: '가시광', col: COL.moon, rgb: RGB.moon },
  { name: '열', col: COL.heat, rgb: RGB.heat },
  { name: '소리', col: COL.sound, rgb: RGB.sound },
  { name: '가시광', col: COL.lit, rgb: RGB.lit },
];
const SCANS = [
  { t: 1.75, from: 0, to: 1, tag: 'CH2', name: '열' },
  { t: 4.3, from: 1, to: 2, tag: 'CH3', name: '소리' },
  { t: 7.5, from: 2, to: 3, tag: 'CH1', name: '가시광 · 조명' },
];
const SCAN_DUR = 0.8, BAND = 280, STRIP = 150;
const T_LOCK = 5.62, T_LIGHT = 8.05;               // the lock lands so that 0.6·D = 6.0 s is the settled climax
const T_DROP = 5.12, T_TOAST = 8.3, T_PUSH = 6.2;

// ---------------------------------------------------------------- the place (world px; world ≈ screen at rest)
const X0 = -100, Y0 = 20, WW = 1340, WH = 2140, GS = 3;          // baked world rect, field grid = 1/3 res
const GW = Math.ceil(WW / GS), GH = Math.ceil(WH / GS);
const FIRE = [470, 1000];
const PERSON = { x: 850, y: 1446, a: -0.75 };                        // lying on the far bank, head up-left
const TENTS = [
  { x: 300, y: 878, w: 128, h: 116, rot: 0.12, night: '#30261f', lit: '#e3702e', occ: [[-24, 2, 0.08], [22, -2, -0.06]] },
  { x: 618, y: 858, w: 120, h: 112, rot: -0.2, night: '#1a2b33', lit: '#2c8c9c', occ: [[-20, 0, 0], [21, 4, 0.1]] },
  { x: 288, y: 1122, w: 112, h: 104, rot: -0.08, night: '#252b1e', lit: '#86973c', occ: [[0, 2, 0.05]] },
  { x: 642, y: 1150, w: 116, h: 108, rot: 0.18, night: '#2e2029', lit: '#b03c62', occ: [] },   // empty: the missing hiker's
];
const CREEK_PTS = [[1220, 1140], [1080, 1196], [940, 1284], [800, 1326], [664, 1334], [540, 1384], [420, 1450], [280, 1462], [150, 1520], [20, 1566], [-140, 1610]];
const TRAIL_PTS = [[556, 1104], [590, 1190], [624, 1280], [646, 1336], [690, 1414], [752, 1494], [826, 1580], [900, 1700], [960, 1830]];
const ROCKS = [[700, 1316, 16], [736, 1344, 10], [986, 1262, 22], [1030, 1226, 12], [420, 1474, 15], [206, 1450, 19], [176, 978, 24], [770, 1062, 17],
  [96, 1540, 14], [884, 1336, 9]];
const STEPS = [[630, 1312, 9], [642, 1334, 10], [654, 1356, 9]];
const WARM_ROCK = [394, 952, 22];
const LOGS = [[532, 1064, 84, 0.25], [404, 1046, 78, -0.95]];
const WIND = [0.16, -0.987], WN = [0.987, 0.16];                     // smoke drifts up, between tents A and B
const PLUME_LEN = 560;
const C_SND = 520, K_SND = TAU / 34;                                 // whistle wave speed (px/s) and wavenumber
const BLASTS = [[4.85, 0.2], [5.12, 0.2], [5.4, 0.75], [6.75, 0.22], [7.05, 0.65], [8.45, 0.22], [8.75, 0.75]];

function deer(k, t) {
  const B = k ? { x: 902, y: 872, h: 2.65, ph: 1.3 } : { x: 806, y: 790, h: 3.45, ph: 0 };
  return {
    x: B.x + 11 * Math.sin(t * 0.33 + B.ph), y: B.y + 6 * Math.sin(t * 0.27 + B.ph * 2),
    h: B.h + 0.16 * Math.sin(t * 0.5 + B.ph), nod: 0.5 + 0.5 * Math.sin(t * 1.7 + B.ph * 3),
  };
}
// heat candidates (the brackets in CH2): id, world position, bracket size, readout
const CANDS = [
  { id: 'A', at: () => [TENTS[0].x, TENTS[0].y], s: 150, temp: 34.8 },
  { id: 'B', at: () => [TENTS[1].x, TENTS[1].y], s: 146, temp: 35.1 },
  { id: 'C', at: () => [TENTS[2].x, TENTS[2].y], s: 136, temp: 34.6 },
  { id: 'D', at: (t) => { const d = deer(0, t); return [d.x, d.y]; }, s: 118, temp: 38.4 },
  { id: 'E', at: (t) => { const d = deer(1, t); return [d.x, d.y]; }, s: 118, temp: 38.1 },
  { id: 'F', at: () => [PERSON.x, PERSON.y], s: 128, temp: 33.9 },
];
const FIDX = 5;

// ---------------------------------------------------------------- small math
const hash = (i) => { i = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b); i ^= i >>> 13; i = Math.imul(i, 0xc2b2ae35); i ^= i >>> 16; return (i >>> 0) / 4294967296; };
/** closed-form damped spring 0 → 1 (overshoots), τ in seconds */
function spring(tau, w = 15, z = 0.42) {
  if (tau <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
}
const NV = new Float32Array(256), PERM = new Uint8Array(512);
{
  const r = rand(8701), p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
  for (let i = 0; i < 256; i++) NV[i] = r();
}
/** value noise in [0,1] */
function vn(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const X = xi & 255, Y = yi & 255, pa = PERM[X], pb = PERM[X + 1];
  const a = NV[PERM[pa + Y]], b = NV[PERM[pb + Y]], c = NV[PERM[pa + Y + 1]], d = NV[PERM[pb + Y + 1]];
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function catmull(pts, step = 6) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
function distPoly(poly, x, y) {
  let best = 1e9;
  for (let i = 0; i < poly.length - 1; i++) {
    const [ax, ay] = poly[i], [bx, by] = poly[i + 1], dx = bx - ax, dy = by - ay;
    const u = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1));
    const d = Math.hypot(ax + dx * u - x, ay + dy * u - y);
    if (d < best) best = d;
  }
  return best;
}
const pathOf = (poly) => { const p = new Path2D(); poly.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); return p; };
// the clearing (camp meadow) and the small meadow on the far bank, as wobbly ellipses
const CLEARS = [{ x: 520, y: 1060, rx: 430, ry: 392, ph: 1 }, { x: 818, y: 1478, rx: 250, ry: 150, ph: 4 }];
const wob = (c, th) => 1 + 0.06 * Math.sin(3 * th + c.ph) + 0.04 * Math.sin(5 * th + 2 * c.ph);
function inClear(x, y, f = 1) {
  for (const c of CLEARS) {
    const u = (x - c.x) / c.rx, v = (y - c.y) / c.ry;
    if (Math.hypot(u, v) < wob(c, Math.atan2(v, u)) * f) return true;
  }
  return false;
}

// ---------------------------------------------------------------- colour maps → 256-entry LUTs (packed for a Uint32 view)
function makeLUT(stops) {
  const hex = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
  const S = stops.map(([p, h]) => [p, hex(h)]);
  const lut = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    const v = i / 255;
    let k = 0;
    while (k < S.length - 2 && v > S[k + 1][0]) k++;
    const [p0, c0] = S[k], [p1, c1] = S[k + 1], u = clamp((v - p0) / (p1 - p0));
    const c = c0.map((a, j) => Math.round(lerp(a, c1[j], u)));
    lut[i] = ((255 << 24) | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0;
  }
  return { lut, stops };
}
const IRONBOW = makeLUT([[0, '#020109'], [0.14, '#120936'], [0.27, '#3a0d6a'], [0.4, '#7a1585'], [0.52, '#b52a62'], [0.63, '#e2512c'],
  [0.75, '#f98b1e'], [0.87, '#ffd148'], [1, '#fffbe8']]);
const CYAN = makeLUT([[0, '#010307'], [0.1, '#021018'], [0.24, '#052a36'], [0.4, '#09566a'], [0.56, '#1393ad'], [0.72, '#4fd8f0'],
  [0.86, '#aef4ff'], [1, '#ffffff']]);
const MOONRAMP = [[0, '#000000'], [0.5, '#2a3550'], [1, '#d6e0ff']];

// ---------------------------------------------------------------- palettes for the baked map
const NIGHT = {
  ground: '#0a1219', clear: '#0f1b23', tuft: 'rgba(130,170,205,0.085)', mottleD: 'rgba(0,0,0,0.13)', mottleL: 'rgba(120,150,210,0.04)',
  bank: '#0b141c', water: '#0e1f3a', deep: '#0a1730', ripple: 'rgba(150,185,245,0.24)', trail: '#141e27', trailHi: 'rgba(150,175,210,0.12)',
  rock: '#1d2530', rockHi: '#2b3542', dirt: 'rgba(42,42,50,0.6)', log: '#241e1c', logEnd: '#3b312b', ash: '#131317',
  pole: 'rgba(200,215,255,0.2)', panelD: 'rgba(0,0,0,0.2)', panelL: 'rgba(170,195,255,0.07)', shadow: 'rgba(0,0,0,0.42)',
  crown: ['#0c1d27', '#0f2430', '#0b1a26', '#112630'], crownHi: 'rgba(140,180,235,0.10)', speck: 'rgba(170,200,245,0.08)',
  pine: ['#0a1922', '#0c1f29', '#0b1c24'], pineHi: 'rgba(140,180,235,0.085)', trunk: '#05090d',
  pack: '#151c19', cooler: '#172433', lantern: '#2b2a24', guy: 'rgba(170,190,230,0.07)',
  jacket: '#1d1814', pants: '#0d1017', skin: '#33292a', hair: '#0b0a09', deer: '#181513', tail: '#2c2a28', key: 'night',
};
const LIT = {
  ground: '#2c381f', clear: '#4a6531', tuft: 'rgba(200,230,150,0.32)', mottleD: 'rgba(0,0,0,0.12)', mottleL: 'rgba(255,250,200,0.06)',
  bank: '#5b5440', water: '#3d7894', deep: '#2b5f7b', ripple: 'rgba(235,248,255,0.6)', trail: '#8f7d5c', trailHi: 'rgba(255,240,200,0.35)',
  rock: '#8d897e', rockHi: '#bab4a5', dirt: 'rgba(140,112,80,0.75)', log: '#6e4a2e', logEnd: '#c49a6a', ash: '#4b4845',
  pole: 'rgba(255,255,255,0.55)', panelD: 'rgba(0,0,0,0.16)', panelL: 'rgba(255,255,255,0.14)', shadow: 'rgba(0,0,0,0.34)',
  crown: ['#2f5c37', '#37683c', '#2b5233', '#3e7242'], crownHi: 'rgba(255,250,200,0.15)', speck: 'rgba(255,255,220,0.13)',
  pine: ['#24492f', '#2a5536', '#22432c'], pineHi: 'rgba(255,250,210,0.12)', trunk: '#1d1a12',
  pack: '#3f6a4a', cooler: '#3d7fc4', lantern: '#e8d25a', guy: 'rgba(255,255,255,0.35)',
  jacket: '#ff7a2f', pants: '#2c3a5a', skin: '#e2b48e', hair: '#3a2a20', deer: '#8f5d3a', tail: '#efe6da', key: 'lit',
};

// ================================================================= the map painter (world coords)
function capsule(g, x0, y0, x1, y1, w, col) {
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
}
function crownPath(T, k = 1, ox = 0, oy = 0) {
  const p = new Path2D();
  if (T.kind === 'pine') {
    const m = T.spikes;
    for (let i = 0; i <= 2 * m; i++) {
      const a = T.rot + (i / (2 * m)) * TAU, rr = (i % 2 ? 0.72 : 1) * T.r * k * (1 + 0.06 * Math.sin(i * 2.3 + T.rot));
      const x = T.x + ox + Math.cos(a) * rr, y = T.y + oy + Math.sin(a) * rr;
      i ? p.lineTo(x, y) : p.moveTo(x, y);
    }
  } else {
    p.moveTo(T.x + ox + T.r * 0.56 * k, T.y + oy);
    p.arc(T.x + ox, T.y + oy, T.r * 0.56 * k, 0, TAU);
    T.lobes.forEach(([a, d, lr]) => {
      const x = T.x + ox + Math.cos(a) * d * T.r * k, y = T.y + oy + Math.sin(a) * d * T.r * k;
      p.moveTo(x + lr * T.r * k, y);
      p.arc(x, y, lr * T.r * k, 0, TAU);
    });
  }
  return p;
}
function tentBody(g, T) {
  g.beginPath(); g.roundRect(-T.w / 2, -T.h / 2, T.w, T.h, 28);
}
function paintTent(g, T, P) {
  g.save(); g.translate(T.x, T.y); g.rotate(T.rot);
  const w = T.w, h = T.h;
  // guy lines + stakes
  g.strokeStyle = P.guy; g.lineWidth = 1.5; g.fillStyle = P.guy;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    g.beginPath(); g.moveTo(sx * w * 0.42, sy * h * 0.42); g.lineTo(sx * w * 0.74, sy * h * 0.7); g.stroke();
    g.beginPath(); g.arc(sx * w * 0.74, sy * h * 0.7, 2.5, 0, TAU); g.fill();
  }
  g.fillStyle = P.shadow; g.beginPath(); g.roundRect(-w / 2 + 9, -h / 2 + 13, w, h, 28); g.fill();
  // vestibule (door side +y)
  g.fillStyle = T[P.key]; g.beginPath(); g.moveTo(-w * 0.32, h / 2 - 10); g.quadraticCurveTo(0, h / 2 + 44, w * 0.32, h / 2 - 10); g.fill();
  g.fillStyle = P.panelD; g.fill();
  tentBody(g, T); g.fillStyle = T[P.key]; g.fill();
  // dome panels: two darker, one moonlit
  g.save(); tentBody(g, T); g.clip();
  g.fillStyle = P.panelD;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(w, -h); g.lineTo(w, h); g.fill();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(-w, h); g.lineTo(w, h); g.fill();
  g.fillStyle = P.panelL;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(-w, -h); g.lineTo(w, -h); g.fill();
  g.restore();
  // poles
  g.strokeStyle = P.pole; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-w / 2 + 8, -h / 2 + 8); g.quadraticCurveTo(0, 6, w / 2 - 8, h / 2 - 8);
  g.moveTo(w / 2 - 8, -h / 2 + 8); g.quadraticCurveTo(0, 6, -w / 2 + 8, h / 2 - 8); g.stroke();
  g.fillStyle = P.pole; g.beginPath(); g.arc(0, 2, 5, 0, TAU); g.fill();
  g.restore();
}
function paintTree(g, T, P, layer) {
  if (layer === 'shadow') { g.fillStyle = P.shadow; g.fill(crownPath(T, 1.02, T.r * 0.24, T.r * 0.3)); return; }
  const pine = T.kind === 'pine';
  g.fillStyle = (pine ? P.pine : P.crown)[T.tone % (pine ? 3 : 4)];
  g.fill(crownPath(T));
  g.fillStyle = pine ? P.pineHi : P.crownHi;
  g.fill(crownPath(T, 0.66, -T.r * 0.14, -T.r * 0.16));
  g.fill(crownPath(T, 0.36, -T.r * 0.24, -T.r * 0.26));
  if (pine) { g.fillStyle = P.trunk; g.beginPath(); g.arc(T.x, T.y, 3, 0, TAU); g.fill(); return; }
  g.fillStyle = P.speck;
  T.specks.forEach(([a, d, s]) => { g.beginPath(); g.arc(T.x + Math.cos(a) * d * T.r, T.y + Math.sin(a) * d * T.r, s, 0, TAU); g.fill(); });
}
function paintRock(g, x, y, r, P) {
  g.fillStyle = P.shadow; g.beginPath(); g.ellipse(x + r * 0.25, y + r * 0.32, r * 1.05, r * 0.9, 0.4, 0, TAU); g.fill();
  g.fillStyle = P.rock; g.beginPath(); g.ellipse(x, y, r * 1.06, r * 0.88, 0.5 + x * 0.01, 0, TAU); g.fill();
  g.fillStyle = P.rockHi; g.beginPath(); g.ellipse(x - r * 0.24, y - r * 0.22, r * 0.56, r * 0.42, 0.5, 0, TAU); g.fill();
}

function paintWorld(g, P, G) {
  const r = rand(4242);
  g.fillStyle = P.ground; g.fillRect(X0, Y0, WW, WH);
  for (let i = 0; i < 170; i++) {
    const x = X0 + r() * WW, y = Y0 + r() * WH, rad = 40 + r() * 150, c = r() < 0.55 ? P.mottleD : P.mottleL;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  g.save(); g.filter = 'blur(12px)'; g.fillStyle = P.clear; g.fill(G.clearPath); g.restore();
  // grass tufts in the meadows
  g.strokeStyle = P.tuft; g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath();
  for (let i = 0; i < 2600; i++) {
    const x = X0 + r() * WW, y = Y0 + r() * WH, a = -1.9 + r() * 0.6, l = 5 + r() * 6;
    if (!inClear(x, y, 0.97)) continue;
    for (let k = -1; k <= 1; k++) { g.moveTo(x, y); g.lineTo(x + Math.cos(a + k * 0.45) * l, y + Math.sin(a + k * 0.45) * l); }
  }
  g.stroke();
  // trail
  g.save(); g.lineCap = g.lineJoin = 'round';
  g.filter = 'blur(2px)'; g.strokeStyle = P.trail; g.lineWidth = 22; g.stroke(G.trailPath);
  g.filter = 'none'; g.setLineDash([9, 15]); g.strokeStyle = P.trailHi; g.lineWidth = 3; g.stroke(G.trailPath); g.setLineDash([]);
  // creek: bank, water, deep channel, ripples
  g.filter = 'blur(4px)'; g.strokeStyle = P.bank; g.lineWidth = 86; g.stroke(G.creekPath);
  g.filter = 'none'; g.strokeStyle = P.water; g.lineWidth = 54; g.stroke(G.creekPath);
  g.filter = 'blur(3px)'; g.strokeStyle = P.deep; g.lineWidth = 24; g.stroke(G.creekPath); g.filter = 'none';
  g.strokeStyle = P.ripple; g.lineWidth = 2; g.beginPath();
  const C = G.creek;
  for (let i = 2; i < C.length - 3; i += 2) {
    const [x0, y0] = C[i], [x1, y1] = C[i + 2], tx = x1 - x0, ty = y1 - y0, L = Math.hypot(tx, ty) || 1;
    const nx = -ty / L, ny = tx / L, o = (r() - 0.5) * 38, len = 6 + r() * 16;
    if (r() < 0.45) continue;
    g.moveTo(x0 + nx * o, y0 + ny * o); g.quadraticCurveTo(x0 + nx * (o + 2) + tx / L * len * 0.5, y0 + ny * (o + 2) + ty / L * len * 0.5, x0 + nx * o + tx / L * len, y0 + ny * o + ty / L * len);
  }
  g.stroke(); g.restore();
  ROCKS.forEach(([x, y, rr]) => paintRock(g, x, y, rr, P));
  STEPS.forEach(([x, y, rr]) => paintRock(g, x, y, rr, P));
  // the camp: packed dirt, logs, fire ring, warm seat rock, gear, tents
  const dg = g.createRadialGradient(FIRE[0], FIRE[1] + 30, 0, FIRE[0], FIRE[1] + 30, 260);
  dg.addColorStop(0, P.dirt); dg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = dg; g.fillRect(FIRE[0] - 260, FIRE[1] - 230, 520, 520);
  LOGS.forEach(([x, y, len, a]) => {
    const dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2;
    capsule(g, x - dx + 5, y - dy + 7, x + dx + 5, y + dy + 7, 20, P.shadow);
    capsule(g, x - dx, y - dy, x + dx, y + dy, 19, P.log);
    g.fillStyle = P.logEnd; g.beginPath(); g.arc(x + dx, y + dy, 8.5, 0, TAU); g.fill();
    g.strokeStyle = P.log; g.lineWidth = 1.5; g.beginPath(); g.arc(x + dx, y + dy, 4.5, 0, TAU); g.stroke();
  });
  paintRock(g, WARM_ROCK[0], WARM_ROCK[1], WARM_ROCK[2], P);
  for (let k = 0; k < 11; k++) {
    const a = (k / 11) * TAU + 0.2, x = FIRE[0] + Math.cos(a) * 29, y = FIRE[1] + Math.sin(a) * 27;
    paintRock(g, x, y, 7 + hash(k + 40) * 3, P);
  }
  g.fillStyle = P.ash; g.beginPath(); g.arc(FIRE[0], FIRE[1], 20, 0, TAU); g.fill();
  capsule(g, FIRE[0] - 14, FIRE[1] - 8, FIRE[0] + 14, FIRE[1] + 8, 7, P.log);
  capsule(g, FIRE[0] - 10, FIRE[1] + 12, FIRE[0] + 8, FIRE[1] - 12, 7, P.log);
  TENTS.forEach((T) => paintTent(g, T, P));
  // gear: a pack by tent A, a cooler by B, a lantern by C
  const box = (x, y, w, h, a, col, rr = 6) => {
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = P.shadow; g.beginPath(); g.roundRect(-w / 2 + 4, -h / 2 + 6, w, h, rr); g.fill();
    g.fillStyle = col; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, rr); g.fill();
    g.fillStyle = P.panelL; g.beginPath(); g.roundRect(-w / 2 + 3, -h / 2 + 3, w - 6, h * 0.35, rr * 0.6); g.fill();
    g.restore();
  };
  box(372, 952, 30, 40, 0.5, P.pack, 10);
  box(694, 906, 44, 30, -0.2, P.cooler);
  g.fillStyle = P.lantern; g.beginPath(); g.arc(352, 1196, 8, 0, TAU); g.fill();
  // trees: every shadow first, then the crowns top to bottom
  G.trees.forEach((T) => paintTree(g, T, P, 'shadow'));
  G.trees.forEach((T) => paintTree(g, T, P, 'crown'));
  if (P.key === 'night') {
    const mg = g.createLinearGradient(X0, Y0, X0 + WW * 0.7, Y0 + WH);
    mg.addColorStop(0, 'rgba(150,175,255,0.07)'); mg.addColorStop(0.55, 'rgba(0,0,0,0)'); mg.addColorStop(1, 'rgba(0,0,12,0.3)');
    g.fillStyle = mg; g.fillRect(X0, Y0, WW, WH);
    g.fillStyle = 'rgba(2,4,10,0.2)'; g.fillRect(X0, Y0, WW, WH);
  }
}
/** sensor-mode outlines of the same place (drawn over the false-colour fields) */
function paintOutline(g, G) {
  g.lineCap = g.lineJoin = 'round';
  g.strokeStyle = 'rgba(220,232,255,0.55)'; g.lineWidth = 2;
  g.stroke(G.bankL); g.stroke(G.bankR);
  g.setLineDash([8, 10]); g.stroke(G.trailPath); g.setLineDash([]);
  TENTS.forEach((T) => {
    g.save(); g.translate(T.x, T.y); g.rotate(T.rot);
    g.lineWidth = 2.2; tentBody(g, T); g.stroke();
    g.lineWidth = 1.2; g.beginPath(); g.moveTo(-T.w / 2 + 8, -T.h / 2 + 8); g.lineTo(T.w / 2 - 8, T.h / 2 - 8); g.moveTo(T.w / 2 - 8, -T.h / 2 + 8); g.lineTo(-T.w / 2 + 8, T.h / 2 - 8); g.stroke();
    g.restore();
  });
  g.lineWidth = 1.6;
  [...ROCKS, ...STEPS, WARM_ROCK].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y, r * 1.06, r * 0.88, 0.5 + x * 0.01, 0, TAU); g.stroke(); });
  g.beginPath(); g.arc(FIRE[0], FIRE[1], 30, 0, TAU); g.stroke();
  LOGS.forEach(([x, y, len, a]) => {
    const dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2, nx = -Math.sin(a) * 9.5, ny = Math.cos(a) * 9.5;
    g.beginPath(); g.moveTo(x - dx + nx, y - dy + ny); g.lineTo(x + dx + nx, y + dy + ny); g.moveTo(x - dx - nx, y - dy - ny); g.lineTo(x + dx - nx, y + dy - ny); g.stroke();
  });
  g.strokeStyle = 'rgba(220,232,255,0.22)'; g.lineWidth = 1.4;
  G.trees.forEach((T) => { g.beginPath(); g.arc(T.x, T.y, T.r * 0.82, 0, TAU); g.stroke(); });
}

// ================================================================= dynamic figures (world coords)
function drawPerson(g, P, wave, t) {
  const { x, y, a } = PERSON;
  g.save(); g.translate(x, y); g.rotate(a);
  g.fillStyle = P.shadow; g.beginPath(); g.ellipse(7, 12, 30, 62, 0, 0, TAU); g.fill();
  // pack beside them
  g.save(); g.translate(42, 20); g.rotate(0.35);
  g.fillStyle = P.pack; g.beginPath(); g.roundRect(-14, -19, 28, 38, 9); g.fill();
  g.fillStyle = P.panelL; g.beginPath(); g.roundRect(-11, -16, 22, 12, 6); g.fill();
  g.restore();
  capsule(g, -8, 8, -12, 52, 15, P.pants); capsule(g, 8, 8, 14, 50, 15, P.pants);
  g.fillStyle = P.hair; g.beginPath(); g.ellipse(-12, 58, 7, 9, 0, 0, TAU); g.ellipse(14, 56, 7, 9, 0, 0, TAU); g.fill();
  g.fillStyle = P.jacket; g.beginPath(); g.roundRect(-21, -28, 42, 46, 15); g.fill();
  g.fillStyle = P.panelL; g.beginPath(); g.roundRect(-17, -24, 16, 38, 8); g.fill();
  capsule(g, -20, -18, -30, 14, 12, P.jacket);
  g.fillStyle = P.skin; g.beginPath(); g.arc(-30, 16, 6, 0, TAU); g.fill();
  // the right arm: along the body, or raised and waving under the searchlight
  const al = wave > 0 ? lerp(1.25, -1.15 + 0.5 * Math.sin(t * TAU * 1.5), wave) : 1.25;
  const ex = 20 + Math.cos(al) * 34, ey = -18 + Math.sin(al) * 34;
  capsule(g, 20, -18, ex, ey, 12, P.jacket);
  g.fillStyle = P.skin; g.beginPath(); g.arc(ex + Math.cos(al) * 4, ey + Math.sin(al) * 4, 6, 0, TAU); g.fill();
  // hood + face
  g.fillStyle = P.jacket; g.beginPath(); g.arc(0, -40, 17, 0, TAU); g.fill();
  g.fillStyle = P.skin; g.beginPath(); g.arc(0, -42, 11.5, 0, TAU); g.fill();
  g.fillStyle = P.hair; g.beginPath(); g.arc(0, -46, 11.5, Math.PI, TAU); g.fill();
  g.restore();
}
function drawDeer(g, P, d) {
  g.save(); g.translate(d.x, d.y); g.rotate(d.h);
  g.fillStyle = P.shadow; g.beginPath(); g.ellipse(6, 9, 34, 17, 0, 0, TAU); g.fill();
  g.fillStyle = P.deer; g.beginPath(); g.ellipse(0, 0, 31, 14, 0, 0, TAU); g.fill();
  const hx = 34 + 6 * d.nod;
  capsule(g, 18, 0, hx - 4, 0, 10, P.deer);
  g.beginPath(); g.ellipse(hx + 4, 0, 10, 6.5, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(hx - 4, -7, 5, 2.5, -0.6, 0, TAU); g.ellipse(hx - 4, 7, 5, 2.5, 0.6, 0, TAU); g.fill();
  g.fillStyle = P.tail; g.beginPath(); g.arc(-30, 0, 3.5, 0, TAU); g.fill();
  g.restore();
}

// ================================================================= scalar fields on the world grid
let heatBase, soundBase, canopy, creekNear, heat, snd, plume, pbox;
let gridHeat, gridSound, smokeCv, imgH, imgS, imgSmoke, u32H, u32S, u32Smoke, WHIST;
const cx0 = (i) => X0 + (i + 0.5) * GS, cy0 = (j) => Y0 + (j + 0.5) * GS;
function cellBox(x, y, R) {
  return [Math.max(0, Math.floor((x - R - X0) / GS)), Math.min(GW - 1, Math.ceil((x + R - X0) / GS)),
    Math.max(0, Math.floor((y - R - Y0) / GS)), Math.min(GH - 1, Math.ceil((y + R - Y0) / GS))];
}
/** additive anisotropic Gaussian (sx along angle a) */
function splat(buf, x, y, sx, sy, a, amp) {
  const [i0, i1, j0, j1] = cellBox(x, y, 3 * Math.max(sx, sy));
  const ca = Math.cos(a), sa = Math.sin(a), ix = 1 / sx, iy = 1 / sy;
  for (let j = j0; j <= j1; j++) {
    const dy = cy0(j) - y;
    for (let i = i0; i <= i1; i++) {
      const dx = cx0(i) - x, u = (dx * ca + dy * sa) * ix, v = (dy * ca - dx * sa) * iy, q = u * u + v * v;
      if (q < 9) buf[j * GW + i] += amp * Math.exp(-0.5 * q);
    }
  }
}
/** paint toward a level with Gaussian coverage (overlapping parts never exceed lvl) */
function paint(buf, x, y, sx, sy, a, lvl) {
  const [i0, i1, j0, j1] = cellBox(x, y, 3 * Math.max(sx, sy));
  const ca = Math.cos(a), sa = Math.sin(a), ix = 1 / sx, iy = 1 / sy;
  for (let j = j0; j <= j1; j++) {
    const dy = cy0(j) - y;
    for (let i = i0; i <= i1; i++) {
      const dx = cx0(i) - x, u = (dx * ca + dy * sa) * ix, v = (dy * ca - dx * sa) * iy, q = u * u + v * v;
      if (q < 9) { const k = j * GW + i, b = buf[k]; if (lvl > b) buf[k] = b + (lvl - b) * Math.exp(-0.5 * q); }
    }
  }
}
/** a lying body: head along local −y, rotation a; blur > 1 = seen through tent fabric */
function bodyHeat(buf, x, y, a, lvl, blur = 1) {
  const L = (lx, ly) => [x + lx * Math.cos(a) - ly * Math.sin(a), y + lx * Math.sin(a) + ly * Math.cos(a)];
  paint(buf, ...L(0, -40), 10 * blur, 10 * blur, a, lvl);
  paint(buf, ...L(0, -8), 15 * blur, 21 * blur, a, lvl * 0.97);
  paint(buf, ...L(0, 30), 12 * blur, 22 * blur, a, lvl * 0.86);
}
function deerHeat(buf, d) {
  const ca = Math.cos(d.h), sa = Math.sin(d.h), hx = 38 + 6 * d.nod;
  paint(buf, d.x, d.y, 25, 14, d.h, 0.74);
  paint(buf, d.x + ca * 22, d.y + sa * 22, 9, 6.5, d.h, 0.7);
  paint(buf, d.x + ca * hx, d.y + sa * hx, 8.5, 6.5, d.h, 0.76);
}
function computePlume(t) {
  const [i0, i1, j0, j1] = pbox, PW = i1 - i0 + 1;
  const vx = WIND[0] * 62, vy = WIND[1] * 62;
  for (let j = j0; j <= j1; j++) {
    const wy = cy0(j), dy = wy - FIRE[1];
    for (let i = i0; i <= i1; i++) {
      const wx = cx0(i), dx = wx - FIRE[0], k = (j - j0) * PW + (i - i0);
      const s = dx * WIND[0] + dy * WIND[1];
      if (s < -24 || s > PLUME_LEN) { plume[k] = 0; continue; }
      const ss = s > 0 ? s : 0, c = dx * WN[0] + dy * WN[1];
      const mean = (26 * Math.sin(ss * 0.0105 - t * 0.9) + 9 * Math.sin(ss * 0.027 - t * 2.1)) * Math.min(1, ss / 140);
      const sig = 9 + 0.2 * ss, q = (c - mean) / sig;
      if (q * q > 7) { plume[k] = 0; continue; }
      const ax = wx - vx * t, ay = wy - vy * t;                      // advected domain: the pattern rides the wind
      const w = vn(ax * 0.011 + 7.3, ay * 0.011 + 1.9);
      const n = 0.62 * vn(ax * 0.021 + w * 1.7, ay * 0.021 - w * 1.7 + t * 0.12) + 0.38 * vn(ax * 0.05 + 3.3, ay * 0.05 + t * 0.5);
      plume[k] = Math.exp(-0.5 * q * q) * Math.exp(-ss / 340) * smooth((s + 24) / 64) * clamp(0.12 + 1.6 * (n - 0.3), 0, 1.4);
    }
  }
}
function computeHeat(t) {
  heat.set(heatBase);
  const [i0, i1, j0, j1] = pbox, PW = i1 - i0 + 1;
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const p = plume[(j - j0) * PW + (i - i0)];
    if (p > 0.002) heat[j * GW + i] += 0.62 * p;
  }
  const fl = 0.86 + 0.08 * Math.sin(t * 13.1) + 0.06 * Math.sin(t * 29.3 + 1.2);
  splat(heat, FIRE[0], FIRE[1], 12, 12, 0, 0.62 * fl);
  // flames: a noisy halo around the core
  const [a0, a1, b0, b1] = cellBox(FIRE[0], FIRE[1], 60);
  for (let j = b0; j <= b1; j++) for (let i = a0; i <= a1; i++) {
    const dx = cx0(i) - FIRE[0], dy = cy0(j) - FIRE[1], r2 = dx * dx + dy * dy;
    if (r2 > 3600) continue;
    const n = vn(cx0(i) * 0.09 - WIND[0] * t * 3, cy0(j) * 0.09 - WIND[1] * t * 3);
    heat[j * GW + i] += 0.42 * Math.exp(-r2 / (2 * 22 * 22)) * (0.45 + 0.9 * n) * fl;
  }
  deerHeat(heat, deer(0, t)); deerHeat(heat, deer(1, t));
  mapLUT(heat, u32H, IRONBOW.lut);
  gridHeat.getContext('2d').putImageData(imgH, 0, 0);
}
function computeSound(t) {
  snd.set(soundBase);
  // wind in the crowns + creek hiss (fast, shimmering noise)
  for (let j = 0; j < GH; j++) {
    const wy = cy0(j);
    for (let i = 0; i < GW; i++) {
      const k = j * GW + i, cn = canopy[k], cr = creekNear[k];
      if (cn > 0.04) snd[k] += cn * (0.03 + 0.07 * vn(cx0(i) * 0.016 - t * 0.55, wy * 0.016 + t * 0.32));
      if (cr > 0.03) snd[k] += cr * 0.15 * vn(cx0(i) * 0.075 + t * 2.2, wy * 0.075 - t * 4.6);
    }
  }
  // campfire crackle: tiny short pulses (other sounds exist, they just don't sing)
  for (let p = 0; p < 14; p++) {
    const tp = 4.2 + p * 0.39 + hash(p + 900) * 0.25, age = t - tp;
    if (age < 0 || age > 0.42) continue;
    const R = C_SND * age;
    const [i0, i1, j0, j1] = cellBox(FIRE[0], FIRE[1], R + 14);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const dr = Math.hypot(cx0(i) - FIRE[0], cy0(j) - FIRE[1]) - R;
      if (dr > -14 && dr < 14) snd[j * GW + i] += 0.2 * (1 - age / 0.42) * Math.exp(-dr * dr / 40) / (1 + R / 60);
    }
  }
  // the whistle: wave packets in retarded time, field(r, t) = W(t − r/c) · carrier · falloff
  const Rmax = C_SND * (t - BLASTS[0][0]) + 20;
  if (Rmax > 0) {
    const [i0, i1, j0, j1] = cellBox(PERSON.x, PERSON.y, Rmax);
    for (let j = j0; j <= j1; j++) {
      const dy = cy0(j) - PERSON.y;
      for (let i = i0; i <= i1; i++) {
        const dx = cx0(i) - PERSON.x, r = Math.sqrt(dx * dx + dy * dy);
        const tau = t - r / C_SND;
        if (tau < BLASTS[0][0] - 0.05) continue;
        const env = WHIST[Math.min(WHIST.length - 1, Math.round(tau * 1000))];
        if (env < 0.003) continue;
        const cr = 0.5 + 0.5 * Math.cos(K_SND * (r - C_SND * t));
        snd[j * GW + i] += env * (0.95 / (1 + r / 120) + 0.05) * (0.25 + 0.75 * cr * cr) + env * 0.7 * Math.exp(-r * r / 500);
      }
    }
  }
  mapLUT(snd, u32S, CYAN.lut);
  gridSound.getContext('2d').putImageData(imgS, 0, 0);
}
function mapLUT(buf, out, lut) {
  for (let i = 0, n = buf.length; i < n; i++) {
    // a 2×2 ordered dither keeps the upscaled ramp free of bands
    const d = ((i & 1) + ((((i / GW) | 0) & 1) << 1)) * 0.0008 - 0.0012;
    let k = ((buf[i] + d) * 255) | 0;
    out[i] = lut[k < 0 ? 0 : k > 255 ? 255 : k];
  }
}
function computeSmoke() {
  const n = plume.length;
  for (let k = 0; k < n; k++) {
    const a = Math.min(1, plume[k]) * 0.26;
    u32Smoke[k] = a < 0.004 ? 0 : ((((a * 255) | 0) << 24) | (214 << 16) | (192 << 8) | 170) >>> 0;
  }
  smokeCv.getContext('2d').putImageData(imgSmoke, 0, 0);
}

// ================================================================= camera (drone glide, push-in after the lock)
function camera(t) {
  let cx = 540 + 10 * Math.sin(t * 0.35), cy = 1030 + 9 * t, s = 1.06 - 0.004 * t, th = (-1.6 + 0.32 * t) * Math.PI / 180;
  const p = ease.inOutCubic(clamp((t - T_PUSH) / 2.8));
  const S1 = 1.36;
  cx = lerp(cx, PERSON.x - 60 / S1, p); cy = lerp(cy, PERSON.y - 220 / S1, p); s = lerp(s, S1, p); th = lerp(th, 0.004, p);
  let shx = 0, shy = 0;
  const u = t - T_LOCK;
  if (u > 0 && u < 1) {
    s *= 1 + 0.045 * Math.exp(-u * 7);                               // punch
    const e = Math.exp(-u * 6);
    shx = 9 * e * Math.sin(u * 47); shy = 7 * e * Math.sin(u * 39 + 1);
  }
  const a = s * Math.cos(th), b = s * Math.sin(th), c = -b, d = a;
  return { a, b, c, d, e: 540 + shx - (a * cx + c * cy), f: 960 + shy - (b * cx + d * cy), s, th };
}
const toS = (m, x, y) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
const setCam = (g, m, ox = 0, oy = 0) => g.setTransform(m.a, m.b, m.c, m.d, m.e - ox, m.f - oy);

// ================================================================= timeline helpers
const inOutQuad = (k) => (k < 0.5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k));
const edgeY = (k) => lerp(-20, H + BAND + 20, inOutQuad(k));
function scanAt(t) {
  for (const s of SCANS) { const k = (t - s.t) / SCAN_DUR; if (k >= 0 && k < 1) return { s, k, y: edgeY(k) }; }
  return null;
}
function chanAt(t) { let c = 0; for (const s of SCANS) if (t >= s.t) c = s.to; return c; }
/** the channel showing at screen row y (the band splits the frame while it passes) */
function chY(t, y) { const sc = scanAt(t); return sc ? (y < sc.y ? sc.s.to : sc.s.from) : chanAt(t); }
/** when the band edge passes screen row y during scan s */
function passTime(s, y) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (edgeY(m) < y) lo = m; else hi = m; }
  return s.t + lo * SCAN_DUR;
}
/** draw a channel-dependent HUD element split by the scan band (old below the edge, new above) */
function splitDraw(g, t, fn) {
  const sc = scanAt(t);
  if (!sc) { fn(chanAt(t)); return; }
  g.save(); g.beginPath(); g.rect(0, sc.y, W, H); g.clip(); fn(sc.s.from); g.restore();
  g.save(); g.beginPath(); g.rect(0, 0, W, sc.y); g.clip(); fn(sc.s.to); g.restore();
}
const whistleEnv = (tau) => {
  let v = 0;
  for (const [s, d] of BLASTS) v = Math.max(v, smooth((tau - s) / 0.04) * (1 - smooth((tau - s - d) / 0.09)));
  return v;
};

// main reticle path: hops (world targets), then a spring lock
const RET = [
  { t: 0.45, d: 0.01, p: [540, 1090], s: 250 },
  { t: 0.78, d: 0.38, p: [740, 930], s: 210 },
  { t: 1.18, d: 0.38, p: [392, 1330], s: 210 },
  { t: 1.56, d: 0.36, p: [660, 1250], s: 220 },
  { t: 2.05, d: 0.5, p: [520, 1100], s: 300 },
  { t: 2.95, d: 0.32, c: 0, s: 182 },
  { t: 3.3, d: 0.32, c: 3, s: 158 },
  { t: 3.65, d: 0.32, c: 5, s: 166 },
  { t: 3.98, d: 0.3, c: 1, s: 180 },
  { t: 4.4, d: 0.5, p: [580, 1190], s: 560 },
  { t: T_LOCK, spring: true, c: FIDX, s: 156 },
];
const retTarget = (R, t) => (R.p ? R.p : CANDS[R.c].at(t));
function reticle(t) {
  let i = 0;
  while (i + 1 < RET.length && t >= RET[i + 1].t) i++;
  const R = RET[i], P = RET[Math.max(0, i - 1)];
  const a = retTarget(P, t), b = retTarget(R, t);
  if (!R.spring) {
    const k = ease.inOutCubic(clamp((t - R.t) / R.d));
    return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k), s: lerp(P.s, R.s, k), lock: false, spin: 0 };
  }
  // the lock: position snaps with a small overshoot, the size springs (its undershoot is damped so the
  // brackets never collapse onto the target)
  const kp = spring(t - R.t, 20, 0.6), ks = spring(t - R.t, 16, 0.48);
  const s = ks <= 1 ? lerp(P.s, R.s, ks) : R.s - (ks - 1) * (P.s - R.s) * 0.35;
  return { x: lerp(a[0], b[0], kp), y: lerp(a[1], b[1], kp), s, lock: true, spin: (1 - clamp(ks)) * 0.6 };
}

// ================================================================= drawing helpers (screen)
function runs(g, x, y, parts, align = 'left') {
  let w = 0;
  for (const p of parts) { g.font = p[1]; w += g.measureText(p[0]).width; }
  let cx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  for (const p of parts) { g.font = p[1]; g.fillStyle = p[2]; g.fillText(p[0], cx, y); cx += g.measureText(p[0]).width; }
  return w;
}
function tagBox(g, x, y, parts, col, align = 'center') {
  let w = 0;
  for (const p of parts) { g.font = p[1]; w += g.measureText(p[0]).width; }
  const bw = w + 24, bh = 38, x0 = align === 'center' ? x - bw / 2 : align === 'right' ? x - bw : x;
  g.fillStyle = 'rgba(5,8,20,0.74)'; g.beginPath(); g.roundRect(x0, y - bh / 2, bw, bh, 9); g.fill();
  g.strokeStyle = col; g.lineWidth = 2; g.stroke();
  runs(g, x0 + 12, y + 9, parts);
}
function bracket(g, x, y, w, h, col, lw = 4, arm = 0.27, spin = 0) {
  const l = Math.min(w, h) * arm;
  g.save(); g.translate(x, y); if (spin) g.rotate(spin);
  g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'square';
  g.beginPath();
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const cx = sx * w / 2, cy = sy * h / 2;
    g.moveTo(cx, cy - sy * l); g.lineTo(cx, cy); g.lineTo(cx - sx * l, cy);
  }
  g.stroke(); g.restore();
}
const rgba = (rgb, a) => `rgba(${rgb},${a})`;
/** scramble digits until each one is revealed (pure function of t) */
function decode(str, t, t0, dur = 0.45) {
  let o = '';
  for (let k = 0; k < str.length; k++) {
    const ch = str[k];
    o += t < t0 + (dur * (k + 1)) / str.length && /\d/.test(ch) ? String(Math.floor(hash(k * 131 + Math.floor(t * 24)) * 10)) : ch;
  }
  return o;
}

// hero copy: kicker / big word / sub line, each with its own in/out
const KICK = [
  { tIn: 0.36, tOut: 1.42, ch: 0, tag: 'CH1', name: '가시광' },
  { tIn: 2.2, tOut: 4.08, ch: 1, tag: 'CH2', name: '열' },
  { tIn: 4.62, tOut: 7.36, ch: 2, tag: 'CH3', name: '소리' },
  { tIn: 7.9, tOut: 99, ch: 3, tag: 'CH1', name: '가시광 · 조명' },
];
const BIG = [
  { tIn: 0.42, tOut: 1.36, text: '안 보인다', col: COL.moon, rgb: RGB.moon },
  { tIn: 2.26, tOut: 4.0, text: '다 따뜻하다', col: COL.heat, rgb: RGB.heat },
  { tIn: 4.66, tOut: 5.24, text: '들린다', col: COL.sound, rgb: RGB.sound },
  { tIn: T_LOCK + 0.04, tOut: 99, text: '찾았다', col: COL.lock, rgb: RGB.lock, pop: true },
];
const SUB = [
  { tIn: 0.56, tOut: 1.36, text: '달빛뿐인 밤 숲' },
  { tIn: 2.38, tOut: 4.0, text: '사람 체온만 한 열이 여섯' },
  { tIn: 4.8, tOut: 7.36, text: '호루라기 소리, 단 하나' },
  { tIn: 8.0, tOut: 99, text: '구조대에 위치를 보낸다' },
];
const GLINTS = [6.25, 8.95];
const dropT = (i) => T_DROP + [2, 3, 4, 0, 1][i] * 0.07;   // the silent candidates fall away, top to bottom

// ================================================================= the demo
let main, chromaBuf, spotCv, heroCv, grainCvs, scanPat, G, worldNight, worldLit, worldLine, heatSprite;
const mk = (w, h, attrs) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.ctx = c.getContext('2d', attrs); return c; };

defineDemo({
  id: '87-sensor-vision',
  title: '밤 숲의 한 사람',
  tech: '센서 시점 · 스칼라장 + 거짓 색 + 스캔 전환',
  duration: D,
  background: '#03050b',
  async setup(api) {
    const ALL_KR = '실종자수색가시광열소리안보인다다따뜻하다들린다찾았다달빛뿐인밤숲사람체온만한이여섯호루라기단하나구조대에위치를보낸다탐색중판별청취신호고정후보무음전송완료조명거리방위 ·,';
    await Promise.all([
      fontReady(`900 150px ${KR}`, ALL_KR),
      fontReady(`700 30px ${KR}`, ALL_KR),
      fontReady(`600 36px ${KR}`, ALL_KR),
      fontReady(`700 28px ${MONO}`, 'SAR-07 REC ALT 120m CH123 ABCDEF 0123456789.:°%dB·NESW'),
      fontReady(`800 84px ${MONO}`, '0123456789—'),
    ]);
    const attrs = api.headless ? { willReadFrequently: true } : undefined;
    main = api.canvas({ type: '2d', z: 1, attrs }).ctx;
    chromaBuf = new ImageData(W, STRIP);
    spotCv = mk(820, 820, attrs); heroCv = mk(1000, 240, attrs);

    // ---- geometry
    const creek = catmull(CREEK_PTS), trail = catmull(TRAIL_PTS);
    const bank = (sgn) => creek.map(([x, y], i) => {
      const [ax, ay] = creek[Math.max(0, i - 1)], [bx, by] = creek[Math.min(creek.length - 1, i + 1)];
      const L = Math.hypot(bx - ax, by - ay) || 1;
      return [x - ((by - ay) / L) * 28 * sgn, y + ((bx - ax) / L) * 28 * sgn];
    });
    const clearPath = new Path2D();
    CLEARS.forEach((c) => {
      for (let i = 0; i <= 96; i++) {
        const th = (i / 96) * TAU, w = wob(c, th);
        const x = c.x + Math.cos(th) * c.rx * w, y = c.y + Math.sin(th) * c.ry * w;
        i ? clearPath.lineTo(x, y) : clearPath.moveTo(x, y);
      }
    });
    const rT = rand(1201), trees = [];
    const nearCamp = (x, y, r) => TENTS.some((T) => Math.hypot(T.x - x, T.y - y) < 80 + r) || Math.hypot(FIRE[0] - x, FIRE[1] - y) < 150 + r;
    for (let n = 0; n < 6000 && trees.length < 300; n++) {
      const x = X0 + 10 + rT() * (WW - 20), y = Y0 + 10 + rT() * (WH - 20), r = 30 + rT() * 50 * (0.35 + 0.65 * rT());
      if (inClear(x, y, 1.03)) continue;
      if (distPoly(creek, x, y) < 40 + r * 0.45 || distPoly(trail, x, y) < 22 + r * 0.45 || nearCamp(x, y, r)) continue;
      if (Math.hypot(x - PERSON.x, y - PERSON.y) < 120 + r) continue;
      if (trees.some((o) => Math.hypot(o.x - x, o.y - y) < (o.r + r) * 0.64)) continue;
      trees.push({ x, y, r });
    }
    trees.push({ x: 968, y: 1404, r: 58 }, { x: 150, y: 1262, r: 44 }, { x: 1010, y: 1530, r: 50 });
    trees.forEach((T, i) => {
      const q = rand(3000 + i);
      T.kind = q() < 0.42 ? 'pine' : 'leaf'; T.tone = Math.floor(q() * 12); T.rot = q() * TAU; T.spikes = 11 + Math.floor(q() * 6);
      const n = 5 + Math.floor(q() * 3);
      T.lobes = Array.from({ length: n }, (_, k) => [T.rot + (k / n) * TAU + q() * 0.3, 0.38 + q() * 0.08, 0.42 + q() * 0.14]);
      T.specks = Array.from({ length: 7 }, () => [q() * TAU, q() * 0.75, 1.5 + q() * 2]);
    });
    trees.sort((a, b) => a.y - b.y);
    G = { creek, trail, creekPath: pathOf(creek), trailPath: pathOf(trail), bankL: pathOf(bank(1)), bankR: pathOf(bank(-1)), clearPath, trees };

    // ---- baked map: night, lit (searchlight), sensor outlines
    const bake = (fn) => { const c = mk(WW, WH); c.ctx.setTransform(1, 0, 0, 1, -X0, -Y0); fn(c.ctx); return c; };
    worldNight = bake((g) => paintWorld(g, NIGHT, G));
    worldLit = bake((g) => paintWorld(g, LIT, G));
    worldLine = bake((g) => paintOutline(g, G));

    // ---- field masks at grid resolution
    const mask = (fn, blur = 0) => {
      const c = mk(GW, GH, { willReadFrequently: true }), g = c.ctx;
      g.setTransform(1 / GS, 0, 0, 1 / GS, -X0 / GS, -Y0 / GS);
      if (blur) g.filter = `blur(${blur}px)`;
      g.fillStyle = g.strokeStyle = '#fff'; g.lineCap = g.lineJoin = 'round';
      fn(g);
      const px = g.getImageData(0, 0, GW, GH).data, a = new Float32Array(GW * GH);
      for (let i = 0; i < a.length; i++) a[i] = px[i * 4 + 3] / 255;
      return a;
    };
    canopy = mask((g) => G.trees.forEach((T) => g.fill(crownPath(T))), 1);
    const creekCore = mask((g) => { g.lineWidth = 50; g.stroke(G.creekPath); }, 2);
    creekNear = mask((g) => { g.lineWidth = 120; g.stroke(G.creekPath); }, 6);
    const clearM = mask((g) => g.fill(G.clearPath), 4);
    const rockM = mask((g) => [...ROCKS, ...STEPS].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }), 1);
    const trailM = mask((g) => { g.lineWidth = 20; g.stroke(G.trailPath); }, 2);
    const tentM = mask((g) => TENTS.forEach((T) => { if (!T.occ.length) return; g.save(); g.translate(T.x, T.y); g.rotate(T.rot); tentBody(g, T); g.fill(); g.restore(); }), 2);

    const N = GW * GH;
    heatBase = new Float32Array(N); soundBase = new Float32Array(N); heat = new Float32Array(N); snd = new Float32Array(N);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
      const k = j * GW + i, x = cx0(i), y = cy0(j), n = vn(x * 0.006 + 11, y * 0.006 + 5) - 0.5, n2 = vn(x * 0.03, y * 0.03) - 0.5;
      heatBase[k] = 0.135 + 0.03 * clearM[k] - 0.075 * canopy[k] - 0.13 * creekCore[k] + 0.05 * rockM[k] + 0.03 * n + 0.012 * n2 + 0.02 * trailM[k] + 0.07 * tentM[k];
      soundBase[k] = 0.03 + 0.17 * creekNear[k] + 0.015 * n;
    }
    splat(heatBase, FIRE[0], FIRE[1], 80, 80, 0, 0.12);                 // ground warmed by the fire
    for (let k = 0; k < 11; k++) { const a = (k / 11) * TAU + 0.2; splat(heatBase, FIRE[0] + Math.cos(a) * 29, FIRE[1] + Math.sin(a) * 27, 6, 6, 0, 0.2); }
    paint(heatBase, WARM_ROCK[0], WARM_ROCK[1], 15, 13, 0.5, 0.44);    // the rock someone sat on, still warm
    LOGS.forEach(([x, y, len, a]) => paint(heatBase, x, y, len * 0.32, 8, a, 0.3));
    TENTS.forEach((T) => T.occ.forEach(([lx, ly, la]) => {
      const x = T.x + lx * Math.cos(T.rot) - ly * Math.sin(T.rot), y = T.y + lx * Math.sin(T.rot) + ly * Math.cos(T.rot);
      bodyHeat(heatBase, x, y, T.rot + la, 0.67, 1.45);
    }));
    bodyHeat(heatBase, PERSON.x, PERSON.y, PERSON.a, 0.71, 1);

    // plume bbox (cells) along the wind from the fire
    const ends = [[-30, -40], [-30, 40], [PLUME_LEN, -330], [PLUME_LEN, 330]].map(([s, c]) => [FIRE[0] + WIND[0] * s + WN[0] * c, FIRE[1] + WIND[1] * s + WN[1] * c]);
    const bx0 = Math.min(...ends.map((e) => e[0])), bx1 = Math.max(...ends.map((e) => e[0])), by0 = Math.min(...ends.map((e) => e[1])), by1 = Math.max(...ends.map((e) => e[1]));
    pbox = [Math.max(0, Math.floor((bx0 - X0) / GS)), Math.min(GW - 1, Math.ceil((bx1 - X0) / GS)), Math.max(0, Math.floor((by0 - Y0) / GS)), Math.min(GH - 1, Math.ceil((by1 - Y0) / GS))];
    const PW = pbox[1] - pbox[0] + 1, PH = pbox[3] - pbox[2] + 1;
    plume = new Float32Array(PW * PH);

    gridHeat = mk(GW, GH, attrs); gridSound = mk(GW, GH, attrs); smokeCv = mk(PW, PH, attrs);
    imgH = new ImageData(GW, GH); imgS = new ImageData(GW, GH); imgSmoke = new ImageData(PW, PH);
    u32H = new Uint32Array(imgH.data.buffer); u32S = new Uint32Array(imgS.data.buffer); u32Smoke = new Uint32Array(imgSmoke.data.buffer);
    WHIST = new Float32Array(10600);
    for (let i = 0; i < WHIST.length; i++) WHIST[i] = whistleEnv(i / 1000);

    // the person's heat, as a sprite to fuse into the sound map after the lock
    heatSprite = mk(200, 200);
    {
      const g = heatSprite.ctx, gr = g.createRadialGradient(100, 100, 0, 100, 100, 100);
      [[0, '#fffbe8'], [0.18, '#ffd148'], [0.42, '#f98b1e'], [0.7, 'rgba(226,81,44,0.45)'], [1, 'rgba(181,42,98,0)']].forEach(([p, c]) => gr.addColorStop(p, c));
      g.fillStyle = gr; g.fillRect(0, 0, 200, 200);
    }
    // film grain tiles and the band's scanline pattern
    grainCvs = [0, 1, 2, 3].map((s) => {
      const c = mk(256, 256), img = c.ctx.createImageData(256, 256), r = rand(500 + s);
      for (let i = 0; i < 65536; i++) { const v = r() * 255; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
      c.ctx.putImageData(img, 0, 0);
      return c;
    });
    const sp = mk(8, 6); sp.ctx.fillStyle = 'rgba(255,255,255,1)'; sp.ctx.fillRect(0, 0, 8, 2);
    scanPat = main.createPattern(sp, 'repeat');
    const lp = mk(8, 4); lp.ctx.fillStyle = 'rgba(0,0,0,1)'; lp.ctx.fillRect(0, 0, 8, 1);
    this.linePat = main.createPattern(lp, 'repeat');
    // each heat bracket springs on just after the band has uncovered its target (screen row at that moment)
    CANDS.forEach((c) => { const tc = SCANS[0].t + SCAN_DUR * 0.5; c.tIn = passTime(SCANS[0], toS(camera(tc), ...c.at(tc))[1]) + 0.12; });
  },

  frame(t) {
    const g = main, cam = camera(t), sc = scanAt(t);
    const needs = sc ? [sc.s.from, sc.s.to] : [chanAt(t)];
    if (needs.some((c) => c !== 2)) { computePlume(t); computeSmoke(); }

    // ---------------------------------------------------------------- the picture: one channel, or two split by the scan band
    if (!sc) renderChannel(g, needs[0], t, cam);
    else {
      // the old channel everywhere, the new one drawn over it above the band's edge (straight into the stage
      // canvas under a clip: no offscreen copy), then the rows just behind the edge get the RGB split
      renderChannel(g, sc.s.from, t, cam);
      const y = sc.y, ys = Math.max(0, y - STRIP), ye = Math.min(H, y);
      g.save(); g.beginPath(); g.rect(0, 0, W, ye); g.clip();
      renderChannel(g, sc.s.to, t, cam);
      g.restore();
      if (ye > ys) chroma(g, ys, ye, y, t);
    }
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';

    // ---------------------------------------------------------------- camera-feed texture: scanlines, scrims, vignette, grain
    g.globalAlpha = 0.16; g.fillStyle = this.linePat; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
    const top = g.createLinearGradient(0, 0, 0, 660);
    top.addColorStop(0, 'rgba(4,7,16,0.9)'); top.addColorStop(0.5, 'rgba(4,7,16,0.55)'); top.addColorStop(1, 'rgba(4,7,16,0)');
    g.fillStyle = top; g.fillRect(0, 0, W, 660);
    const bot = g.createLinearGradient(0, 1480, 0, H);
    bot.addColorStop(0, 'rgba(4,7,16,0)'); bot.addColorStop(1, 'rgba(4,7,16,0.85)');
    g.fillStyle = bot; g.fillRect(0, 1480, W, H - 1480);
    const vg = g.createRadialGradient(540, 1000, 520, 540, 1000, 1240);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    const gi = Math.floor(t * 12);
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = chanAt(t) === 0 ? 0.13 : 0.09;
    g.translate((gi * 97) % 256, (gi * 61) % 256);
    g.fillStyle = g.createPattern(grainCvs[gi & 3], 'repeat'); g.fillRect(-256, -256, W + 256, H + 256);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    if (sc) band(g, sc, t);

    // boot: the feed opens from a bright line
    if (t < 0.6) {
      const k = ease.inOutCubic(clamp((t - 0.03) / 0.55)), h = 962 * k;
      g.fillStyle = '#000'; g.fillRect(0, 0, W, 960 - h); g.fillRect(0, 960 + h, W, 960 - h + 2);
      g.fillStyle = `rgba(214,228,255,${0.9 * (1 - k * 0.8)})`; g.fillRect(0, 960 - h - 2, W, 3); g.fillRect(0, 960 + h - 1, W, 3);
    }
    hud(g, t, cam, sc);
  },
});

// ================================================================= channel renderers
/** context state persists between frames: every pass starts from the same state, whatever was drawn before */
function resetCtx(g) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.lineCap = 'butt'; g.lineJoin = 'miter'; g.lineWidth = 1; g.setLineDash([]); g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)';
  g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.imageSmoothingEnabled = true; g.filter = 'none';
}
function renderChannel(g, ch, t, cam) {
  resetCtx(g);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (ch === 0 || ch === 3) { renderVis(g, t, cam, ch === 3); return; }
  const grid = ch === 1 ? gridHeat : gridSound;
  if (ch === 1) computeHeat(t); else computeSound(t);
  setCam(g, cam); g.imageSmoothingEnabled = true;
  g.drawImage(grid, X0, Y0, GW * GS, GH * GS);
  g.globalAlpha = ch === 1 ? 0.3 : 0.24; g.globalCompositeOperation = 'screen';
  g.drawImage(worldLine, X0, Y0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  if (ch === 2) {
    // after the lock the found body's heat is fused into the sound map: the one place where both agree
    const f = ramp(t, T_LOCK, T_LOCK + 0.5);
    if (f > 0) {
      g.save(); g.translate(PERSON.x, PERSON.y); g.rotate(PERSON.a);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.85 * f * (0.92 + 0.08 * Math.sin(t * 7));
      g.drawImage(heatSprite, -44, -96, 88, 176);
      g.restore();
    }
  }
}
function renderVis(g, t, cam, lit) {
  setCam(g, cam); g.imageSmoothingEnabled = true;
  g.drawImage(worldNight, X0, Y0);
  // slow cloud shadows drifting over the canopy
  for (let k = 0; k < 4; k++) {
    const x = -200 + ((hash(k + 5) * 1500 + t * 26) % 1700), y = 200 + k * 520 + 60 * Math.sin(k * 2.1), r = 260 + hash(k + 9) * 160;
    const cg = g.createRadialGradient(x, y, 0, x, y, r);
    cg.addColorStop(0, 'rgba(0,2,8,0.3)'); cg.addColorStop(1, 'rgba(0,2,8,0)');
    g.fillStyle = cg; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  drawDeer(g, NIGHT, deer(0, t)); drawDeer(g, NIGHT, deer(1, t));
  drawPerson(g, NIGHT, 0, t);
  // smoke haze (the same advected plume the heat channel uses)
  const [i0, , j0] = pbox;
  g.drawImage(smokeCv, X0 + i0 * GS, Y0 + j0 * GS, smokeCv.width * GS, smokeCv.height * GS);
  // the fire: glow, flame, embers riding the wind
  const fl = 0.86 + 0.08 * Math.sin(t * 13.1) + 0.06 * Math.sin(t * 29.3 + 1.2);
  g.globalCompositeOperation = 'lighter';
  const fg = g.createRadialGradient(FIRE[0], FIRE[1], 0, FIRE[0], FIRE[1], 130);
  fg.addColorStop(0, `rgba(255,150,70,${0.42 * fl})`); fg.addColorStop(0.3, `rgba(255,110,40,${0.14 * fl})`); fg.addColorStop(1, 'rgba(255,90,30,0)');
  g.fillStyle = fg; g.fillRect(FIRE[0] - 130, FIRE[1] - 130, 260, 260);
  for (let k = 0; k < 4; k++) {
    const a = t * (3 + k) + k * 1.7, rr = 7 + 3 * Math.sin(t * 9 + k);
    g.fillStyle = `rgba(255,${170 + k * 20},90,${0.5 * fl})`;
    g.beginPath(); g.arc(FIRE[0] + Math.cos(a) * 5, FIRE[1] + Math.sin(a) * 5, rr, 0, TAU); g.fill();
  }
  for (let k = 0; k < 16; k++) {
    const life = 1.4 + hash(k) * 1.2, u = ((t + hash(k + 20) * 3) % life) / life;
    const d = u * 150, wob = Math.sin(u * 9 + k) * 14 * u;
    const x = FIRE[0] + WIND[0] * d + WN[0] * wob, y = FIRE[1] + WIND[1] * d + WN[1] * wob;
    g.fillStyle = `rgba(255,${150 + (k % 3) * 30},70,${(1 - u) * 0.8})`;
    g.fillRect(x - 1.5, y - 1.5, 3, 3);
  }
  // moon glints on the creek
  const C = G.creek;
  for (let k = 0; k < 44; k++) {
    const p = C[Math.floor(hash(k + 70) * (C.length - 1))], o = (hash(k + 170) - 0.5) * 34;
    const a = Math.pow(Math.max(0, Math.sin(t * (1.3 + hash(k + 300) * 2.2) + k * 2.1)), 6) * 0.75;
    if (a < 0.02) continue;
    g.fillStyle = `rgba(200,220,255,${a})`;
    g.fillRect(p[0] - 5 + o * 0.3, p[1] - 1 + o, 10, 2);
  }
  g.globalCompositeOperation = 'source-over';
  if (lit) searchlight(g, t, cam);
}
function searchlight(g, t, cam) {
  const u = t - T_LIGHT;
  if (u <= 0) return;
  const [sx, sy] = toS(cam, PERSON.x, PERSON.y);
  const flick = u < 0.16 ? (Math.floor(u * 40) % 2 ? 0.35 : 1) : 1;
  const R = 300 * ease.outExpo(clamp(u / 0.7)) + 6 * Math.sin(t * 3);
  const s = spotCv.ctx, h = 410;
  resetCtx(s); s.clearRect(0, 0, 820, 820);
  setCam(s, cam, sx - h, sy - h);
  s.drawImage(worldLit, X0, Y0);
  drawPerson(s, LIT, ramp(t, T_LIGHT + 0.3, T_LIGHT + 0.7), t);
  s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'destination-in';
  const m = s.createRadialGradient(h, h + 10, 0, h, h + 10, Math.max(1, R));
  m.addColorStop(0, `rgba(0,0,0,${flick})`); m.addColorStop(0.55, `rgba(0,0,0,${0.92 * flick})`); m.addColorStop(1, 'rgba(0,0,0,0)');
  s.fillStyle = m; s.fillRect(0, 0, 820, 820);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(spotCv, sx - h, sy - h);
  g.globalCompositeOperation = 'lighter';
  const wg = g.createRadialGradient(sx, sy + 10, 0, sx, sy + 10, R * 1.25 + 1);
  wg.addColorStop(0, `rgba(255,236,200,${0.1 * flick})`); wg.addColorStop(1, 'rgba(255,236,200,0)');
  g.fillStyle = wg; g.fillRect(sx - R * 1.3, sy - R * 1.3, R * 2.6, R * 2.6);
  g.globalCompositeOperation = 'source-over';
}

// ================================================================= the scan band
/**
 * RGB split + row jitter on the rows just behind the band's edge: red is pulled one way, green/blue the other,
 * growing toward the edge; rows shift in 10-px slices by a hashed amount that changes 30× a second.
 * Done on the pixels (getImageData → integer shifts → putImageData), so it is exact and needs no offscreen canvas.
 */
function chroma(g, ys, ye, edge, t) {
  const h = ye - ys, src = g.getImageData(0, ys, W, h).data, out = chromaBuf.data, fr = Math.floor(t * 30);
  for (let r = 0; r < h; r++) {
    const yy = ys + r, prox = clamp((yy - (edge - STRIP)) / STRIP);   // 0 far behind the edge → 1 at the edge
    const d = Math.round(9 * prox * prox), jit = Math.round((hash(fr * 97 + ((yy / 10) | 0)) - 0.5) * 22 * prox * prox * prox);
    const row = r * W * 4;
    for (let x = 0; x < W; x++) {
      let xr = x - jit - d, xc = x - jit + d;
      xr = xr < 0 ? 0 : xr >= W ? W - 1 : xr; xc = xc < 0 ? 0 : xc >= W ? W - 1 : xc;
      const o = row + x * 4;
      out[o] = src[row + xr * 4]; out[o + 1] = src[row + xc * 4 + 1]; out[o + 2] = src[row + xc * 4 + 2]; out[o + 3] = 255;
    }
  }
  g.putImageData(chromaBuf, 0, ys, 0, 0, W, h);
}
function band(g, sc, t) {
  const y = sc.y, c = CH[sc.s.to].rgb;
  resetCtx(g);
  g.globalCompositeOperation = 'lighter';
  const gr = g.createLinearGradient(0, y - BAND, 0, y);
  gr.addColorStop(0, rgba(c, 0)); gr.addColorStop(0.55, rgba(c, 0.08)); gr.addColorStop(0.9, rgba(c, 0.3)); gr.addColorStop(1, rgba(c, 0.62));
  g.fillStyle = gr; g.fillRect(0, y - BAND, W, BAND);
  g.save(); g.beginPath(); g.rect(0, y - BAND * 0.8, W, BAND * 0.8); g.clip();
  g.globalAlpha = 0.07; g.fillStyle = scanPat; g.fillRect(0, y - BAND, W, BAND); g.restore();
  g.globalAlpha = 1;
  const below = g.createLinearGradient(0, y, 0, y + 46);
  below.addColorStop(0, rgba(c, 0.32)); below.addColorStop(1, rgba(c, 0));
  g.fillStyle = below; g.fillRect(0, y, W, 46);
  g.globalCompositeOperation = 'source-over';
  g.shadowColor = rgba(c, 1); g.shadowBlur = 26;
  g.fillStyle = '#ffffff'; g.fillRect(0, y - 3, W, 5);
  g.shadowBlur = 0;
  g.fillStyle = 'rgba(255,255,255,0.6)';
  for (let x = 27; x < W; x += 54) g.fillRect(x, y - 20, 2, 14);
  g.font = `700 22px ${MONO}`;
  runs(g, 940, y - 30, [[`${sc.s.tag} `, `700 22px ${MONO}`, '#fff'], [sc.s.name, `700 24px ${KR}`, '#fff']], 'right');
}

// ================================================================= HUD
function hud(g, t, cam, sc) {
  resetCtx(g);
  const boot = (d) => clamp(spring(t - d, 13, 0.55));
  // viewfinder corners
  const vf = 1 - boot(0.25);
  g.strokeStyle = 'rgba(230,238,255,0.6)'; g.lineWidth = 3; g.beginPath();
  for (const [x, y, sx, sy] of [[44, 44, 1, 1], [1036, 44, -1, 1], [44, 1636, 1, -1], [1036, 1636, -1, -1]]) {
    const ox = -sx * vf * 70, oy = -sy * vf * 70;
    g.moveTo(x + ox, y + oy + sy * 56); g.lineTo(x + ox, y + oy); g.lineTo(x + ox + sx * 56, y + oy);
  }
  g.stroke();
  // centre mark
  g.strokeStyle = 'rgba(230,238,255,0.28)'; g.lineWidth = 2; g.beginPath();
  g.moveTo(520, 960); g.lineTo(532, 960); g.moveTo(548, 960); g.lineTo(560, 960); g.moveTo(540, 940); g.lineTo(540, 952); g.moveTo(540, 968); g.lineTo(540, 980); g.stroke();

  // top bar
  const tb = boot(0.18);
  g.globalAlpha = clamp(tb);
  g.save(); g.translate(0, (1 - tb) * -24);
  g.fillStyle = Math.floor(t * 1.6) % 2 ? 'rgba(255,80,90,0.35)' : '#ff505a';
  g.beginPath(); g.arc(84, 90, 7, 0, TAU); g.fill();
  runs(g, 100, 99, [['REC  ', `700 24px ${MONO}`, 'rgba(244,241,234,0.75)'], ['SAR-07', `800 28px ${MONO}`, COL.fg]]);
  tagBox(g, 312, 90, [['실종자 수색', `700 26px ${KR}`, COL.fg]], 'rgba(244,241,234,0.4)', 'left');
  const sec = 7 + Math.floor(t);
  runs(g, 1008, 99, [['ALT 120m   ', `600 24px ${MONO}`, COL.muted], [`23:41:${String(sec).padStart(2, '0')}`, `700 24px ${MONO}`, 'rgba(244,241,234,0.8)']], 'right');
  g.restore();
  // channel chips (switch where the band passes)
  splitDraw(g, t, (ch) => {
    const act = ch === 3 ? 0 : ch;
    let x = 72;
    for (let i = 0; i < 3; i++) {
      const on = i === act, done = i < act || (ch === 3 && i > 0), C = CH[i];
      const a = clamp(boot(0.3 + i * 0.08));
      const label = `${i + 1} ${C.name}`;
      g.font = `700 26px ${KR}`;
      const w = g.measureText(label).width + 32;
      let sc2 = 1;
      if (on) { const sTime = i === 0 ? (ch === 3 ? SCANS[2].t : 0.3) : SCANS[i - 1].t; sc2 = 1 + 0.18 * Math.max(0, 1 - spring(t - sTime - 0.1, 18, 0.35)) * (t > sTime ? 1 : 0); }
      g.save(); g.globalAlpha = a; g.translate(x + w / 2, 152); g.scale(sc2, sc2);
      g.beginPath(); g.roundRect(-w / 2, -22, w, 44, 10);
      g.fillStyle = on ? (ch === 3 ? COL.lit : C.col) : 'rgba(5,8,20,0.72)'; g.fill();
      g.strokeStyle = on || done ? C.col : 'rgba(160,180,230,0.35)'; g.lineWidth = 2; g.stroke();
      g.fillStyle = on ? '#071022' : done ? C.col : COL.muted;
      g.fillText(label, -w / 2 + 16, 9);
      g.restore();
      x += w + 12;
    }
  });
  // compass tape
  {
    const hd = 47 + (cam.th * 180) / Math.PI, a = clamp(boot(0.4));
    g.save(); g.globalAlpha = a * 0.75; g.beginPath(); g.rect(700, 128, 308, 50); g.clip();
    g.strokeStyle = 'rgba(230,238,255,0.6)'; g.lineWidth = 2; g.fillStyle = 'rgba(230,238,255,0.6)'; g.font = `600 18px ${MONO}`; g.textAlign = 'center';
    g.beginPath();
    for (let d = Math.floor(hd - 30); d <= hd + 30; d++) {
      if (d % 5) continue;
      const x = 854 + (d - hd) * 5.2, L = d % 15 ? 8 : 15;
      g.moveTo(x, 172 - L); g.lineTo(x, 172);
      if (!(d % 15) && x > 724 && x < 984) g.fillText(String((d + 360) % 360).padStart(3, '0'), x, 150);
    }
    g.stroke(); g.restore();
    g.globalAlpha = a; g.fillStyle = COL.fg; g.beginPath(); g.moveTo(854, 176); g.lineTo(847, 186); g.lineTo(861, 186); g.fill();
    g.textAlign = 'left'; g.globalAlpha = 1;
  }
  // colour-map legend on the right edge
  splitDraw(g, t, (ch) => {
    const a = clamp(boot(0.5));
    g.save(); g.globalAlpha = a;
    const x = 1010, y0 = 1000, y1 = 1330, lg = g.createLinearGradient(0, y1, 0, y0);
    const stops = ch === 1 ? IRONBOW.stops : ch === 2 ? CYAN.stops : MOONRAMP;
    stops.forEach(([p, c]) => lg.addColorStop(p, c));
    g.fillStyle = lg; g.fillRect(x, y0, 12, y1 - y0);
    g.strokeStyle = 'rgba(230,238,255,0.5)'; g.lineWidth = 1.5; g.strokeRect(x - 0.5, y0 - 0.5, 13, y1 - y0 + 1);
    const lab = ch === 1 ? ['40°', '0°'] : ch === 2 ? ['90dB', '20dB'] : ['', ''];
    g.font = `600 19px ${MONO}`; g.fillStyle = 'rgba(230,238,255,0.75)'; g.textAlign = 'right';
    g.fillText(lab[0], x - 8, y0 + 14); g.fillText(lab[1], x - 8, y1);
    g.font = `700 22px ${KR}`; g.fillStyle = CH[ch].col; g.fillText(CH[ch].name, x + 12, y0 - 16);
    g.textAlign = 'left'; g.restore();
  });

  // ---------------------------------------------------------------- target brackets
  const chNow = chanAt(t);
  CANDS.forEach((c, i) => {
    if (t < c.tIn) return;
    const isF = i === FIDX;
    const drop = isF ? T_LOCK + 0.02 : dropT(i);
    if (t > drop + 0.35 || t > 7.9) return;
    const [wx, wy] = c.at(t), [x, y] = toS(cam, wx, wy);
    const pin = spring(t - c.tIn, 17, 0.45), pout = isF ? clamp((t - drop) / 0.2) : ease.inCubic(clamp((t - drop) / 0.35));
    const sz = c.s * cam.s * (1.7 - 0.7 * pin) * (1 - 0.45 * pout);
    const al = clamp(pin * 1.6) * (1 - pout);
    const col = chNow === 2 && t > 4.95 ? (isF ? COL.sound : 'rgba(150,170,200,0.9)') : COL.heat;
    g.globalAlpha = al * 0.95;
    bracket(g, x, y, sz, sz, col, 3, 0.24);
    const jitter = (hash(i * 13 + Math.floor(t * 6)) - 0.5) * 0.2;
    const quiet = chNow === 2 && t > drop - 0.25 && !isF;
    const label = quiet ? [[`${c.id} `, `700 20px ${MONO}`, COL.muted], ['무음', `700 21px ${KR}`, COL.muted]]
      : chNow === 2 && t > 4.95 && isF ? [[`${c.id} `, `700 20px ${MONO}`, COL.sound], ['호루라기', `700 21px ${KR}`, COL.sound]]
        : [[`${c.id} ${(c.temp + jitter).toFixed(1)}°`, `700 20px ${MONO}`, COL.heat]];
    tagBox(g, x, y - sz / 2 - 26, label, quiet ? 'rgba(142,152,184,0.5)' : rgba(isF && chNow === 2 && t > 4.95 ? RGB.sound : RGB.heat, 0.55));
    g.globalAlpha = 1;
  });
  // main reticle
  if (t > 0.45) {
    const R = reticle(t), [x, y] = toS(cam, R.x, R.y), chR = chY(t, y);
    const col = R.lock ? COL.lock : CH[chR].col;
    const a = clamp((t - 0.45) / 0.25);
    const breathe = R.lock ? 1 + 0.035 * Math.sin((t - T_LOCK) * 5.5) : 1;
    const s = R.s * breathe * (R.lock ? cam.s / 1.05 : 1);
    g.globalAlpha = a;
    g.shadowColor = col; g.shadowBlur = R.lock ? 18 : 8;
    bracket(g, x, y, s, s, col, R.lock ? 6 : 4, 0.22, R.spin);
    g.shadowBlur = 0;
    if (R.lock) {
      // range ticks inside the lock
      g.strokeStyle = col; g.lineWidth = 2; g.beginPath();
      g.moveTo(x - s * 0.22, y); g.lineTo(x - s * 0.1, y); g.moveTo(x + s * 0.1, y); g.lineTo(x + s * 0.22, y);
      g.moveTo(x, y - s * 0.22); g.lineTo(x, y - s * 0.1); g.moveTo(x, y + s * 0.1); g.lineTo(x, y + s * 0.22); g.stroke();
    }
    const lbl = R.lock ? '신호 고정' : chR === 0 ? '탐색 중' : chR === 1 ? '판별 중' : '청취 중';
    if (t < 4.4 || t > 4.9) tagBox(g, x, y + s / 2 + 30, [[lbl, `700 24px ${KR}`, col]], R.lock ? rgba(RGB.lock, 0.8) : 'rgba(200,215,255,0.4)');
    g.globalAlpha = 1;
  }
  // lock impact: rings + sparks at the found body, a soft flash
  const u = t - T_LOCK;
  if (u > 0 && u < 1.2) {
    const [x, y] = toS(cam, PERSON.x, PERSON.y);
    for (const [d, w] of [[0, 5], [0.14, 2.5]]) {
      const v = (u - d) / 1.0;
      if (v <= 0 || v >= 1) continue;
      g.strokeStyle = rgba(RGB.lock, 0.9 * (1 - v)); g.lineWidth = w * (1 - v) + 0.5;
      g.beginPath(); g.arc(x, y, 24 + 300 * ease.outExpo(v), 0, TAU); g.stroke();
    }
    if (u < 0.8) {
      g.strokeStyle = rgba(RGB.lock, 1 - u / 0.8); g.lineWidth = 3; g.lineCap = 'round'; g.beginPath();
      for (let k = 0; k < 26; k++) {
        const a = (k / 26) * TAU + hash(k + 600) * 0.3, sp = 260 + hash(k + 700) * 320, d = (sp * (1 - Math.exp(-5 * u))) / 5;
        const r0 = 30 + d, len = 18 * (1 - u / 0.8);
        g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * (r0 + len), y + Math.sin(a) * (r0 + len));
      }
      g.stroke();
    }
  }
  // light-on ring
  const ul = t - T_LIGHT;
  if (ul > 0 && ul < 1) {
    const [x, y] = toS(cam, PERSON.x, PERSON.y);
    g.strokeStyle = rgba(RGB.lit, 0.7 * (1 - ul)); g.lineWidth = 3;
    g.beginPath(); g.arc(x, y + 10, 40 + 300 * ease.outExpo(ul), 0, TAU); g.stroke();
  }

  heroText(g, t);
  readouts(g, t, cam);

  // flashes
  if (u > 0 && u < 0.5) { g.fillStyle = `rgba(255,248,230,${0.26 * Math.exp(-u * 9)})`; g.fillRect(0, 0, W, H); }
  if (ul > 0 && ul < 0.5) { g.fillStyle = `rgba(255,236,200,${0.14 * Math.exp(-ul * 8)})`; g.fillRect(0, 0, W, H); }
}

function heroText(g, t) {
  const X = 72;
  // kicker
  for (const K of KICK) {
    const pin = clamp((t - K.tIn) / 0.5), pout = clamp((t - K.tOut) / 0.25);
    if (pin <= 0 || pout >= 1) continue;
    const C = CH[K.ch], e = ease.outExpo(pin);
    g.globalAlpha = clamp(pin * 3) * (1 - pout);
    const x = X - (1 - e) * 40, y = 300 - ease.inCubic(pout) * 20;
    g.fillStyle = C.col; g.fillRect(x, y - 20, 14, 14);
    runs(g, x + 26, y - 4, [[`${K.tag}  `, `700 26px ${MONO}`, C.col], [K.name, `700 30px ${KR}`, COL.fg]]);
  }
  g.globalAlpha = 1;
  // big word: per-syllable rise inside a line mask, faster exit up; "찾았다" pops and gets glints
  for (const B of BIG) {
    if (t < B.tIn || t > B.tOut + 0.6) continue;
    const size = 150, font = `900 ${size}px ${KR}`, base = 460;
    g.font = font;
    const chars = [...B.text];
    let x = X;
    const xs = chars.map((ch) => { const p = x; x += g.measureText(ch).width - size * 0.045; return p; });
    g.save();
    if (!B.pop) { g.beginPath(); g.rect(0, base - size * 0.98, W, size * 1.24); g.clip(); }
    g.shadowColor = rgba(B.rgb, 0.55); g.shadowBlur = 34; g.fillStyle = B.col;
    chars.forEach((ch, k) => {
      const pin = clamp((t - B.tIn - k * 0.05) / 0.62), pout = clamp((t - B.tOut - k * 0.03) / 0.28);
      if (pin <= 0 || pout >= 1 || ch === ' ') return;
      if (B.pop) {
        const sp = spring(t - B.tIn - k * 0.045, 22, 0.5), w = g.measureText(ch).width;
        const s = 1.55 - 0.55 * sp;
        g.save(); g.globalAlpha = clamp(sp * 2.5);
        g.translate(xs[k] + w / 2, base - size * 0.36); g.scale(s, s);
        g.fillText(ch, -w / 2, size * 0.36);
        g.restore();
      } else {
        const dy = (1 - ease.outExpo(pin)) * size * 1.02 - ease.inCubic(pout) * size * 1.05;
        g.fillText(ch, xs[k], base + dy);
      }
    });
    g.restore();
    if (B.pop) {
      for (const gt of GLINTS) {
        const v = (t - gt) / 0.9;
        if (v <= 0 || v >= 1) continue;
        const h = heroCv.ctx;
        resetCtx(h); h.clearRect(0, 0, 1000, 240);
        h.font = font; h.fillStyle = '#fff';
        chars.forEach((ch, k) => h.fillText(ch, xs[k] - X + 10, 180));
        h.globalCompositeOperation = 'source-in';
        const bx = lerp(-200, 900, ease.inOutCubic(v)), lg = h.createLinearGradient(bx - 90, 0, bx + 90, 60);
        lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,0.95)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
        h.fillStyle = lg; h.fillRect(0, 0, 1000, 240);
        g.globalCompositeOperation = 'lighter'; g.drawImage(heroCv, X - 10, base - 180); g.globalCompositeOperation = 'source-over';
      }
    }
  }
  // sub line
  for (const S of SUB) {
    const pin = clamp((t - S.tIn) / 0.55), pout = clamp((t - S.tOut) / 0.25);
    if (pin <= 0 || pout >= 1) continue;
    g.globalAlpha = clamp(pin * 2) * (1 - pout);
    runs(g, X + 4, 530 + (1 - ease.outExpo(pin)) * 18 - ease.inCubic(pout) * 14, [[S.text, `600 36px ${KR}`, 'rgba(244,241,234,0.86)']]);
  }
  g.globalAlpha = 1;
}

function readouts(g, t, cam) {
  const a = clamp((t - 0.6) / 0.4);
  if (a <= 0) return;
  g.globalAlpha = a;
  // candidate count: up as the heat brackets lock on, down as the silent ones drop away
  let n = 0;
  CANDS.forEach((c, i) => { if (t >= c.tIn) n++; if (i !== FIDX && t > dropT(i) + 0.2) n--; });
  const chNow = chY(t, 1560), col = t >= T_LOCK ? COL.lock : CH[chNow].col;
  runs(g, 72, 1520, [['후보', `700 28px ${KR}`, COL.muted]]);
  g.shadowColor = col; g.shadowBlur = n ? 16 : 0;
  runs(g, 70, 1606, [[String(n), `800 88px ${KR}`, n ? col : COL.muted]]);
  g.shadowBlur = 0;
  // status line beside it
  const st = t >= T_LOCK ? [['거리 ', `600 26px ${KR}`, COL.muted], [decode('212m', t, T_LOCK + 0.02, 0.3), `700 26px ${MONO}`, COL.fg],
    ['  방위 ', `600 26px ${KR}`, COL.muted], [decode('047°', t, T_LOCK + 0.06, 0.3), `700 26px ${MONO}`, COL.fg]]
    : chNow === 0 ? [['신호 없음', `600 26px ${KR}`, COL.muted]]
      : chNow === 1 ? (n ? [['열원 ', `600 26px ${KR}`, COL.muted], [String(n), `700 26px ${MONO}`, COL.fg], ['  판별 불가', `600 26px ${KR}`, COL.muted]] : [['열 감지 중', `600 26px ${KR}`, COL.muted]])
        : [['청취 중', `600 26px ${KR}`, COL.muted]];
  runs(g, 150, 1598, st);
  // the toast: position sent to the rescue team
  const ut = t - T_TOAST;
  if (ut > 0) {
    const pin = ease.outExpo(clamp(ut / 0.5)), prog = ease.inOutCubic(clamp((ut - 0.15) / 0.75)), done = ut > 0.95;
    g.globalAlpha = a * clamp(pin * 2);
    const x1 = 1008, w = 300, x0 = x1 - w + (1 - pin) * 40, y0 = 1478;
    g.fillStyle = 'rgba(5,8,20,0.78)'; g.beginPath(); g.roundRect(x0, y0, w, 112, 12); g.fill();
    g.strokeStyle = rgba(RGB.lock, 0.7); g.lineWidth = 2; g.stroke();
    runs(g, x0 + 20, y0 + 42, [['위치 전송', `700 28px ${KR}`, COL.fg]]);
    runs(g, x0 + w - 20, y0 + 42, [[done ? '완료' : `${Math.round(prog * 100)}%`, done ? `700 26px ${KR}` : `700 24px ${MONO}`, COL.lock]], 'right');
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x0 + 20, y0 + 70, w - 40, 8);
    g.fillStyle = COL.lock; g.fillRect(x0 + 20, y0 + 70, (w - 40) * prog, 8);
    if (done) {
      const c = clamp((ut - 0.95) / 0.3);
      g.strokeStyle = COL.lock; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath();
      const k1 = Math.min(1, c * 2.5), k2 = clamp((c - 0.4) / 0.6);
      g.moveTo(x0 + w - 112, y0 + 30); g.lineTo(x0 + w - 112 + 7 * k1, y0 + 30 + 7 * k1);
      if (k2 > 0) g.lineTo(x0 + w - 105 + 15 * k2, y0 + 37 - 19 * k2);
      g.stroke();
    }
  }
  g.globalAlpha = 1;
}
