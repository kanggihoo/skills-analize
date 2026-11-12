/*
 * 125 · 바람섬 사흘 걷기 — 지도 경로 모션 · 가상의 섬 위의 여정
 *
 * The travel-map sequence of explainer videos, on an island that does not exist. Canvas 2D only, no library.
 *   setup  · a height field (designed massifs + domain-warped value noise) → marching squares → Chaikin-smoothed
 *            coast, hypsometric bands and contour rings; a signed distance field of the coast → the sea's echo rings
 *          · a walking route (centripetal Catmull–Rom through hand-placed waypoints), resampled by arc length;
 *            dashes cut by arc length so they never crawl
 *          · forest dots, hills and wave marks scattered by rejection sampling away from the route
 *          · stop labels placed by scoring candidate positions (never on the route, never on each other,
 *            inside the frame) at the close-up, middle and final zoom
 *          · the camera: a target (head position LA seconds ahead, zoom by leg length) run through a critically
 *            damped spring at 240 Hz and stored as a table
 *   frame  · everything is read from those tables as a closed form of t
 */
import { defineDemo, rand, clamp, lerp, ease } from '../_lib/stage.js';
import { FONTS, fontReady, signedDistance } from '../_lib/type.js';

const D = 10;
const W = 1080, H = 1920;
const FX = 540, FY = 890;                 // screen point the camera centres on (middle of the map window)
const DEBUG = false;

const HAH = `"${FONTS.hahmlet.family}"`, FRA = `"${FONTS.fraunces.family}"`, PRE = `"${FONTS.pretendard.family}"`;

// ---------------------------------------------------------------- palette (tokens + one accent)
const INK = '#2A2620', PAPER = '#FBF5E6', MUTED = '#857A6A';
const ACC = '#E2472B', ACC_D = '#B5331C', NIGHT = '#3A4A86';
const SEA0 = '#5BA0A7', SEA1 = '#3C8090', SHALLOW = '#8DC6BE';
const BANDS = [[0.0, '#EEDFB6'], [0.035, '#DFE1AB'], [0.12, '#CFD89D'], [0.22, '#BECD90'], [0.33, '#C7C594'], [0.45, '#D5C8A3'], [0.57, '#E4D9BF'], [0.67, '#F2EBDB']];
const CONTOURS = [0.06, 0.12, 0.18, 0.24, 0.30, 0.36, 0.42, 0.48, 0.54, 0.60, 0.66, 0.72];

// ---------------------------------------------------------------- the trip
const STOPS = [
  { name: '갈매포구', note: '출발' },
  { name: '하얀등대', note: '' },
  { name: '솔숲마을', note: '첫날 밤', night: true },
  { name: '바람봉', note: '해발 412 m' },
  { name: '거울못', note: '둘째 날 밤', night: true },
  { name: '노을곶', note: '도착' },
];
// waypoints (world units); a third value marks a stop index. The summit waypoint is replaced by the height maximum.
const WAY = [
  [700, 655, 0],
  [745, 560], [810, 455], [870, 365],
  [905, 300, 1],
  [840, 220], [745, 185],
  [632, 200, 2],
  [628, 290], [490, 268], [527, 405], [400, 390],
  [382, 484, 3],
  [455, 560], [520, 700], [565, 830],
  [600, 965, 4],
  [640, 1080], [612, 1182], [510, 1215], [380, 1236], [240, 1250], [140, 1236],
  [82, 1214, 5],
];
const SUMMIT_WAY = 12;
const KM = 70;                            // world units per km
const PACE = 4.0;                         // km/h on the clock
const LAT0 = 22 * 60 + 41, LON0 = 138 * 60 + 17;   // the island centre, in arc minutes (open ocean, no real land)
const LATU = 1.852 * KM, LONU = 1.852 * Math.cos((22.68 * Math.PI) / 180) * KM;
const DAYS = ['첫째 날', '둘째 날', '셋째 날'];
// region names: world anchor, rotation (deg), size (px at zoom 1, shown at size·√zoom), tracking (em)
const REGIONS = [
  { text: '바람등성이', x: 215, y: 455, rot: -74, size: 24, track: 0.62, sea: false },
  { text: '솔숲골', x: 735, y: 420, rot: -8, size: 26, track: 0.7, sea: false },
  { text: '억새벌', x: 330, y: 1120, rot: 6, size: 26, track: 0.7, sea: false },
  { text: '갈매만', x: 925, y: 585, rot: 64, size: 26, track: 0.72, sea: true },
  { text: '고래바위', x: 1150, y: 1072, rot: 0, size: 17, track: 0.35, sea: true },
];

// timeline (s)
const T_DIVE = 0.95, T_PIN0 = 1.08, T_HEAD = 1.28, T_GO = 1.5, T_END = 8.28;
const PAUSE = [0.26, 0.70, 0.34, 0.70];   // waits at stops 2–5 (the two nights are longer)
const T_PULL = 8.54, T_SWEEP0 = 8.68, T_SWEEP1 = 9.44, T_STAMP = 9.24;
const LA = 0.46;                          // camera look-ahead (s)
const Z_STOP = 1.62;
const PIN_H = 40, PIN_R = 17;             // pin head centre height, head radius (screen px)

// ---------------------------------------------------------------- noise + height
function makeNoise(seed) {
  const r = rand(seed);
  const perm = new Uint8Array(512), val = new Float32Array(256);
  for (let i = 0; i < 256; i++) { perm[i] = i; val[i] = r() * 2 - 1; }
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const k = perm[i]; perm[i] = perm[j]; perm[j] = k; }
  for (let i = 0; i < 256; i++) perm[256 + i] = perm[i];
  const at = (ix, iy) => val[perm[(perm[ix & 255] + iy) & 255]];
  return (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10), v = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    const a = at(ix, iy), b = at(ix + 1, iy), c = at(ix, iy + 1), d = at(ix + 1, iy + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}
function fbm(n, x, y, oct) {
  let s = 0, a = 0.5, f = 1, norm = 0;
  for (let o = 0; o < oct; o++) { s += a * n(x * f + o * 17.1, y * f - o * 9.7); norm += a; a *= 0.5; f *= 2.03; }
  return s / norm;
}
const NA = makeNoise(11), NB = makeNoise(23), NC = makeNoise(37), ND = makeNoise(41);
const BUMPS = [
  { x: 540, y: 720, sx: 540, sy: 720, a: 0.80 },   // main body
  { x: 380, y: 430, sx: 230, sy: 210, a: 0.44 },   // north-west massif (the summit)
  { x: 800, y: 1170, sx: 230, sy: 220, a: 0.30 },  // south-east lobe
  { x: 180, y: 1200, sx: 190, sy: 120, a: 0.26 },  // south-west cape
  { x: 880, y: 300, sx: 150, sy: 110, a: 0.22 },   // north-east cape (lighthouse)
  { x: 1060, y: 700, sx: 240, sy: 170, a: -0.80 }, // east bay (the harbour)
  { x: 500, y: 1440, sx: 150, sy: 120, a: -0.45 }, // south cove
  { x: -60, y: 760, sx: 120, sy: 160, a: -0.30 },  // west bight
  { x: 1150, y: 1010, sx: 34, sy: 30, a: 0.62 },   // islet (east)
  { x: 70, y: 1470, sx: 40, sy: 32, a: 0.55 },     // islet (south-west)
];
function height(x, y) {
  const wx = x + 110 * fbm(NA, x / 320, y / 320, 3);
  const wy = y + 110 * fbm(NB, x / 320 + 7.3, y / 320 - 3.1, 3);
  let h = -0.42;
  for (const g of BUMPS) { const dx = (wx - g.x) / g.sx, dy = (wy - g.y) / g.sy; h += g.a * Math.exp(-(dx * dx + dy * dy)); }
  return h + 0.19 * fbm(NC, x / 200, y / 200, 5);
}

// ---------------------------------------------------------------- grid + isolines
const G = 6, GX0 = -500, GY0 = -500, NX = 350, NY = 400;   // world [-500,1600] × [-500,1900]
const GW = NX + 1;
function sampleGrid(F, x, y) {
  const gx = clamp((x - GX0) / G, 0, NX - 1e-3), gy = clamp((y - GY0) / G, 0, NY - 1e-3);
  const i = Math.floor(gx), j = Math.floor(gy), u = gx - i, v = gy - j, k = j * GW + i;
  return (F[k] * (1 - u) + F[k + 1] * u) * (1 - v) + (F[k + GW] * (1 - u) + F[k + GW + 1] * u) * v;
}
/** marching squares → closed loops (undirected walk: every crossing edge is shared by exactly two cells) */
function isolines(F, L) {
  const pts = new Map();
  const ex = (i, j) => {
    const id = 2 * (j * GW + i);
    if (!pts.has(id)) { const a = F[j * GW + i], b = F[j * GW + i + 1]; pts.set(id, [GX0 + (i + (L - a) / (b - a)) * G, GY0 + j * G]); }
    return id;
  };
  const ey = (i, j) => {
    const id = 2 * (j * GW + i) + 1;
    if (!pts.has(id)) { const a = F[j * GW + i], b = F[(j + 1) * GW + i]; pts.set(id, [GX0 + i * G, GY0 + (j + (L - a) / (b - a)) * G]); }
    return id;
  };
  const segs = [];
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const a = F[j * GW + i], b = F[j * GW + i + 1], c = F[(j + 1) * GW + i + 1], d = F[(j + 1) * GW + i];
    const k = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
    if (k === 0 || k === 15) continue;
    const T = () => ex(i, j), R = () => ey(i + 1, j), B = () => ex(i, j + 1), Lf = () => ey(i, j);
    const ctr = (a + b + c + d) / 4 > L;
    switch (k) {
      case 1: case 14: segs.push([Lf(), B()]); break;
      case 2: case 13: segs.push([B(), R()]); break;
      case 3: case 12: segs.push([Lf(), R()]); break;
      case 4: case 11: segs.push([T(), R()]); break;
      case 6: case 9: segs.push([T(), B()]); break;
      case 7: case 8: segs.push([Lf(), T()]); break;
      case 5: if (ctr) segs.push([Lf(), T()], [B(), R()]); else segs.push([Lf(), B()], [T(), R()]); break;
      case 10: if (ctr) segs.push([T(), R()], [Lf(), B()]); else segs.push([Lf(), T()], [B(), R()]); break;
    }
  }
  const at = new Map();
  segs.forEach((s, n) => { for (const e of s) { const l = at.get(e); if (l) l.push(n); else at.set(e, [n]); } });
  const used = new Uint8Array(segs.length), loops = [];
  for (let n0 = 0; n0 < segs.length; n0++) {
    if (used[n0]) continue;
    const loop = [];
    let n = n0, e = segs[n0][0];
    while (n !== undefined && !used[n]) {
      used[n] = 1;
      loop.push(pts.get(e));
      const s = segs[n];
      e = s[0] === e ? s[1] : s[0];
      const nb = at.get(e);
      n = nb[0] === n ? nb[1] : nb[0];
    }
    if (loop.length > 3) loops.push(loop);
  }
  return loops;
}
function chaikin(loop, it = 2) {
  let p = loop;
  for (let k = 0; k < it; k++) {
    const q = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    p = q;
  }
  return p;
}
function loopArea(p) { let A = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; A += a[0] * b[1] - b[0] * a[1]; } return A / 2; }
function pathOf(loops) {
  const P = new Path2D();
  for (const l of loops) { P.moveTo(l[0][0], l[0][1]); for (let i = 1; i < l.length; i++) P.lineTo(l[i][0], l[i][1]); P.closePath(); }
  return P;
}

// ---------------------------------------------------------------- route geometry
function catmull(pts, steps = 24) {
  // centripetal Catmull–Rom through every point; returns the polyline + the index of each input point in it
  const out = [], at = [];
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const d = (a, b) => Math.max(1e-3, Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]), 0.5));
    const t0 = 0, t1 = t0 + d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3);
    at.push(out.length);
    for (let s = 0; s < steps; s++) {
      const t = t1 + (t2 - t1) * (s / steps);
      const L = (a, b, ta, tb) => [(a[0] * (tb - t) + b[0] * (t - ta)) / (tb - ta), (a[1] * (tb - t) + b[1] * (t - ta)) / (tb - ta)];
      const A1 = L(p0, p1, t0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3);
      const B1 = L(A1, A2, t0, t2), B2 = L(A2, A3, t1, t3);
      out.push(L(B1, B2, t1, t2));
    }
  }
  at.push(out.length);
  out.push(pts[pts.length - 1]);
  return { out, at };
}

// smooth trapezoid speed profile (ease in, cruise, ease out) → progress table
const PROF = (() => {
  const N = 512, a = 0.32, v = new Float64Array(N + 1), p = new Float64Array(N + 1);
  const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  for (let i = 0; i <= N; i++) { const u = i / N; v[i] = sm(u / a) * sm((1 - u) / a); }
  for (let i = 1; i <= N; i++) p[i] = p[i - 1] + (v[i] + v[i - 1]) / 2;
  for (let i = 0; i <= N; i++) p[i] /= p[N];
  return (u) => { u = clamp(u) * N; const i = Math.min(N - 1, Math.floor(u)); return lerp(p[i], p[i + 1], u - i); };
})();

// ---------------------------------------------------------------- small helpers
const outBack = (p, c = 1.7) => (p <= 0 ? 0 : p >= 1 ? 1 : ease.outBack(p, c));
const outCubic = (p) => ease.outCubic(clamp(p));
const outExpo = (p) => ease.outExpo(clamp(p));
const bump = (x) => (x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x));
const win = (t, a, b, r) => clamp((t - a) / r) * clamp((b - t) / r);     // 0→1→0 window with ramps r
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const mix = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
const WCACHE = new Map();
function cw(ctx, ch) {
  const k = ctx.font + '|' + ch;
  let w = WCACHE.get(k);
  if (w === undefined) { w = ctx.measureText(ch).width; WCACHE.set(k, w); }
  return w;
}
function trackedWidth(ctx, s, tr) { let w = 0, n = 0; for (const ch of s) { w += cw(ctx, ch); n++; } return w + tr * Math.max(0, n - 1); }
function tracked(ctx, s, x, y, tr, align = 'left') {
  const w = trackedWidth(ctx, s, tr);
  let px = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  for (const ch of s) { ctx.fillText(ch, px, y); px += cw(ctx, ch) + tr; }
  return w;
}
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r); ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
/** a card with concave (notched) corners, the cartographer's cartouche shape */
function notched(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arc(x + w, y, r, Math.PI, Math.PI / 2, true);
  ctx.lineTo(x + w, y + h - r); ctx.arc(x + w, y + h, r, -Math.PI / 2, Math.PI, true);
  ctx.lineTo(x + r, y + h); ctx.arc(x, y + h, r, 0, -Math.PI / 2, true);
  ctx.lineTo(x, y + r); ctx.arc(x, y, r, Math.PI / 2, 0, true);
  ctx.closePath();
}
const rectsHit = (a, b, m = 0) => a[0] - m < b[0] + b[2] && b[0] - m < a[0] + a[2] && a[1] - m < b[1] + b[3] && b[1] - m < a[1] + a[3];
function segPointDist(ax, ay, bx, by, px, py) {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1;
  const u = clamp(((px - ax) * dx + (py - ay) * dy) / L);
  return Math.hypot(ax + u * dx - px, ay + u * dy - py);
}
/** a short text that changes over time rolls: the old line slides up out of a mask, the new one rises in */
function rollText(ctx, items, t, x, y, lineH, drawOne) {
  let i = 0;
  while (i + 1 < items.length && t >= items[i + 1][0]) i++;
  const p = i > 0 ? outCubic((t - items[i][0]) / 0.28) : 1;
  ctx.save();
  ctx.beginPath(); ctx.rect(x - 4, y - lineH * 0.82, 900, lineH * 1.08); ctx.clip();
  if (p < 1) { ctx.globalAlpha = 1 - p; drawOne(items[i - 1][1], x, y - p * lineH * 0.9); }
  ctx.globalAlpha = p; drawOne(items[i][1], x, y + (1 - p) * lineH * 0.9);
  ctx.restore();
  ctx.globalAlpha = 1;
}

// cloud: flat puffs (unit radius ≈ 1) — [dx, dy, r]
const PUFFS = [[-1.25, 0.05, 0.62], [-0.55, -0.32, 0.86], [0.3, -0.48, 0.98], [1.08, -0.12, 0.72], [1.62, 0.12, 0.45]];
const CLOUDS = [ // low clouds over the island (world anchor, strong parallax): the camera descends through them …
  { x: 330, y: 650, s: 70, k: 2.3, zmax: 0.86 }, { x: 760, y: 990, s: 80, k: 2.5, zmax: 0.86 }, { x: 560, y: 280, s: 60, k: 2.2, zmax: 0.84 },
  { x: 180, y: 1130, s: 58, k: 2.4, zmax: 0.84 }, { x: 900, y: 520, s: 52, k: 2.1, zmax: 0.84 },
];
const RIM = [ // … and a few high ones at the edges, given by where they sit in the final wide frame (screen px)
  { sx: 1130, sy: 1230, s: 66, k: 1.3 }, { sx: -40, sy: 1350, s: 60, k: 1.32 }, { sx: 1110, sy: 640, s: 52, k: 1.36 }, { sx: -30, sy: 520, s: 50, k: 1.3 },
];

defineDemo({
  id: '125-route-map',
  title: '바람섬 사흘 걷기',
  tech: '지도 경로 모션 · 가상의 섬 위의 여정',
  duration: D,
  background: SEA1,
  async setup(api) {
    const t0 = performance.now();
    const { ctx } = api.canvas({ attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = ctx;
    const KR = STOPS.map((s) => s.name + s.note).join('') + DAYS.join('') + REGIONS.map((r) => r.text).join('') +
      '바람섬사흘걷기걸은거리시간완주도착에서하룻밤출발→·사흘완주';
    await Promise.all([
      fontReady(`800 78px ${HAH}`, KR), fontReady(`700 30px ${HAH}`, KR), fontReady(`500 26px ${HAH}`, KR), fontReady(`800 40px ${HAH}`, KR),
      fontReady(`600 17px ${PRE}`, KR + '0123456789.km'), fontReady(`800 54px ${PRE}`, '0123456789.:'), fontReady(`800 16px ${PRE}`, '0123456789'),
      fontReady(`600 16px ${FRA}`, 'WINDSLE·ATHRYWKOFUPMBCGJQVXZ0123456789°′ :km'), fontReady(`800 44px ${FRA}`, 'NDAY0123456789'),
      fontReady(`500 15px ${FRA}`, 'NE0123456789°′ :'),
    ]);

    // ---- height grid and contours
    const F = new Float32Array(GW * (NY + 1));
    let hmax = -9, hx = 0, hy = 0;
    for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) {
      const x = GX0 + i * G, y = GY0 + j * G, h = height(x, y);
      F[j * GW + i] = h;
      if (h > hmax) { hmax = h; hx = x; hy = y; }
    }
    this.F = F;
    const level = (Fld, L, minArea = 400, it = 2) => isolines(Fld, L).map((l) => chaikin(l, it)).filter((l) => Math.abs(loopArea(l)) > minArea);
    const coastLoops = level(F, 0, 900);
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
    for (const l of coastLoops) for (const [x, y] of l) { bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); }
    this.box = { x0: bx0, y0: by0, x1: bx1, y1: by1 };
    this.coast = pathOf(coastLoops);
    this.bands = BANDS.slice(1).map(([L, c]) => ({ path: pathOf(level(F, L)), c }));
    this.contours = CONTOURS.map((L, i) => ({ path: pathOf(level(F, L, 200)), idx: i % 3 === 2 }));
    // sea echo rings from the coast's signed distance field (grid cells; > 0 in the sea)
    const cov = new Float32Array(F.length);
    for (let i = 0; i < F.length; i++) cov[i] = clamp(0.5 + F[i] / 0.03);
    const SD = signedDistance(cov, GW, NY + 1);
    const Q = new Float32Array(SD.length);
    for (let i = 0; i < SD.length; i++) Q[i] = -SD[i];
    this.shallow = pathOf(level(Q, -2.6, 300, 3));
    this.rings = [-5.5, -9.5, -15, -23].map((L) => pathOf(level(Q, L, 300, 3)));

    // ---- route
    WAY[SUMMIT_WAY] = [hx, hy, 3];
    const { out: poly, at } = catmull(WAY.map((p) => [p[0], p[1]]));
    const RX = [], RY = [];
    const cum = [0];
    for (let i = 1; i < poly.length; i++) cum.push(cum[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
    const total = cum[cum.length - 1];
    { // resample every 3 units
      let k = 1;
      for (let s = 0; s < total; s += 3) {
        while (cum[k] < s) k++;
        const u = (s - cum[k - 1]) / (cum[k] - cum[k - 1] || 1);
        RX.push(lerp(poly[k - 1][0], poly[k][0], u)); RY.push(lerp(poly[k - 1][1], poly[k][1], u));
      }
      RX.push(poly[poly.length - 1][0]); RY.push(poly[poly.length - 1][1]);
    }
    this.RX = RX; this.RY = RY; this.total = total;
    const stopWay = WAY.map((p, i) => (p.length > 2 ? i : -1)).filter((i) => i >= 0);
    this.stopS = stopWay.map((wi) => cum[at[wi]]);
    this.stops = STOPS.map((s, i) => ({ ...s, i, x: WAY[stopWay[i]][0], y: WAY[stopWay[i]][1], s: this.stopS[i], km: this.stopS[i] / KM }));
    let minH = 9;
    for (let i = 0; i < RX.length; i++) minH = Math.min(minH, sampleGrid(F, RX[i], RY[i]));
    this.minH = minH;
    this.dashes = [];
    for (let s = 0; s < total; s += 24) this.dashes.push([s, Math.min(total, s + 13)]);
    const routeDist = (x, y) => {
      let m = 1e9;
      for (let i = 0; i < RX.length; i += 2) { const dx = RX[i] - x, dy = RY[i] - y; if (Math.abs(dx) < m && Math.abs(dy) < m) m = Math.min(m, Math.hypot(dx, dy)); }
      return m;
    };
    const stopDist = (x, y) => Math.min(...this.stops.map((s) => Math.hypot(s.x - x, s.y - y)));

    // ---- timeline
    const legL = this.stopS.slice(1).map((s, i) => s - this.stopS[i]);
    const wts = legL.map((L) => Math.pow(L, 0.65));
    const moveT = T_END - T_GO - PAUSE.reduce((a, b) => a + b, 0);
    const dur = wts.map((w) => (w / wts.reduce((a, b) => a + b, 0)) * moveT);
    const go = [T_GO], arr = [T_HEAD];
    for (let i = 0; i < 5; i++) { arr.push(go[i] + dur[i]); if (i < 4) go.push(arr[i + 1] + PAUSE[i]); }
    this.legL = legL; this.dur = dur; this.go = go; this.arr = arr;
    this.land = this.stops.map((s, i) => (i === 0 ? T_PIN0 + 0.2 : arr[i] + 0.04));
    this.zLeg = legL.map((L) => clamp(Z_STOP * Math.pow(380 / L, 0.55), 0.92, 1.36));
    // the closing sweep passes each stop at …
    const sweepS = (t) => total * ease.inOutCubic(clamp((t - T_SWEEP0) / (T_SWEEP1 - T_SWEEP0)));
    this.sweepS = sweepS;
    this.sweepPass = this.stopS.map((s) => { let a = T_SWEEP0, b = T_SWEEP1; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (sweepS(m) < s) a = m; else b = m; } return a; });
    // nights
    this.nights = [2, 4].map((k) => [arr[k] + 0.06, go[k] - 0.02]);
    // HUD texts
    this.dayItems = [[0, DAYS[0]], [go[2], DAYS[1]], [go[4], DAYS[2]], [T_STAMP, '사흘 완주']];
    this.dayNum = [[0, '1'], [go[2], '2'], [go[4], '3']];
    const legTxt = [[0, '갈매포구에서 출발']];
    for (let i = 0; i < 5; i++) {
      legTxt.push([go[i], `${STOPS[i].name} → ${STOPS[i + 1].name}`]);
      if (STOPS[i + 1].night) legTxt.push([arr[i + 1] + 0.06, `${STOPS[i + 1].name}에서 하룻밤`]);
    }
    legTxt.push([arr[5] + 0.1, `${STOPS[5].name} 도착`], [T_STAMP, `${STOPS[0].name} → ${STOPS[5].name}`]);
    this.legItems = legTxt;

    // ---- camera bake: target → critically damped spring (240 Hz) → table
    const pad = 70;
    this.zWide = Math.min(1000 / (bx1 - bx0 + pad), 1120 / (by1 - by0 + pad));
    this.wide = [(bx0 + bx1) / 2, (by0 + by1) / 2];
    const zEst = this.zWide * 1.05;
    const target = (t) => {
      if (t < T_DIVE) return [this.wide[0], this.wide[1] + 30, Math.log(zEst)];
      if (t < T_PULL) { const p = this.headAt(t + LA); return [p.x, p.y, Math.log(this.zoomAt(t + LA * 0.6))]; }
      return [this.wide[0], this.wide[1], Math.log(this.zWide)];
    };
    const DT = 1 / 240, NS = Math.ceil(D / DT) + 2;
    const cam = new Float32Array(NS * 3);
    let x = this.wide[0], y = this.wide[1] + 60, lz = Math.log(this.zWide * 0.6), vx = 0, vy = 0, vz = 0;
    const WP = 5.0, WZ = 4.3;
    for (let n = 0; n < NS; n++) {
      cam[n * 3] = x; cam[n * 3 + 1] = y; cam[n * 3 + 2] = lz;
      const [tx, ty, tz] = target(n * DT);
      vx += (WP * WP * (tx - x) - 2 * WP * vx) * DT; x += vx * DT;
      vy += (WP * WP * (ty - y) - 2 * WP * vy) * DT; y += vy * DT;
      vz += (WZ * WZ * (tz - lz) - 2 * WZ * vz) * DT; lz += vz * DT;
    }
    this.cam = cam; this.camDT = DT;
    this.clouds = CLOUDS.concat(RIM.map((c) => ({ x: this.wide[0] + (c.sx - FX) / (this.zWide * c.k), y: this.wide[1] + (c.sy - FY) / (this.zWide * c.k), s: c.s, k: c.k, zmax: 1.04 })));

    // ---- terrain dressing (world units)
    const r = rand(77);
    const st = this.stops;
    this.lake = (() => {
      const cx = 668, cy = 950, pts = [];
      for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2; const rr = 40 * (1 + 0.22 * fbm(ND, Math.cos(a) * 1.3 + 5, Math.sin(a) * 1.3 + 5, 3)) * (1 + 0.18 * Math.cos(a)); pts.push([cx + Math.cos(a) * rr * 1.25, cy + Math.sin(a) * rr * 0.85]); }
      return { path: pathOf([chaikin(pts, 2)]), cx, cy };
    })();
    const houses = [];
    const village = (cx, cy, n, spread, seed) => { const rv = rand(seed); for (let i = 0; i < n; i++) { const a = rv() * 6.283, d = spread * Math.sqrt(rv()); houses.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.8, s: 0.8 + rv() * 0.4, night: -1 }); } };
    village(668, 622, 5, 24, 5);   // harbour
    village(612, 168, 6, 30, 6); houses.slice(-6).forEach((h) => (h.night = 0));   // 솔숲마을
    village(575, 940, 4, 20, 7); houses.slice(-4).forEach((h) => (h.night = 1));   // 거울못 inn
    this.houses = houses.filter((h) => routeDist(h.x, h.y) > 16 && stopDist(h.x, h.y) > 24 && sampleGrid(F, h.x, h.y) > 0.02);
    this.light = { x: 937, y: 288 };
    this.pier = [[714, 668], [768, 680]];
    this.boats = [{ x: 812, y: 712, s: 1, ph: 0.3 }, { x: 858, y: 590, s: 0.85, ph: 1.9 }, { x: 1085, y: 1130, s: 0.8, ph: 3.1 }];
    const feat = [this.light, ...this.houses, { x: this.lake.cx, y: this.lake.cy }];
    const featDist = (x, y) => Math.min(...feat.map((f) => Math.hypot(f.x - x, f.y - y)));
    const zr = Math.sqrt(this.zWide);
    const inRegion = (x, y, m = 0) => REGIONS.some((g) => {
      const a = (g.rot * Math.PI) / 180, dx = x - g.x, dy = y - g.y, u = dx * Math.cos(a) + dy * Math.sin(a), v = -dx * Math.sin(a) + dy * Math.cos(a);
      const hl = (Array.from(g.text).length * g.size * (1 + g.track)) / 2 / zr, ht = (g.size * 0.8) / zr;
      return Math.abs(u) < hl + 10 + m && Math.abs(v) < ht + 6 + m;
    });
    // forests: jittered grid, a noise mask, kept off the route, stops, lake and houses
    const can = new Path2D(), can2 = new Path2D(), sh = new Path2D();
    let nf = 0;
    for (let gy = by0; gy < by1; gy += 13) for (let gx = bx0; gx < bx1; gx += 13) {
      const x = gx + (r() - 0.5) * 10, y = gy + (r() - 0.5) * 10;
      const h = sampleGrid(F, x, y);
      if (h < 0.035 || h > 0.34) continue;
      const m = fbm(ND, x / 170, y / 170, 3) + 0.32 * Math.exp(-((x - 650) ** 2 + (y - 300) ** 2) / (150 * 150)) + 0.2 * Math.exp(-((x - 300) ** 2 + (y - 820) ** 2) / (130 * 130));
      if (m < 0.13) continue;
      if (routeDist(x, y) < 17 || stopDist(x, y) < 40 || featDist(x, y) < 26 || inRegion(x, y)) continue;
      const rr = 4.2 + r() * 2.4;
      sh.moveTo(x + 1.6 + rr, y + 2.2); sh.arc(x + 1.6, y + 2.2, rr, 0, Math.PI * 2);
      const P = r() < 0.45 ? can2 : can; P.moveTo(x + rr, y); P.arc(x, y, rr, 0, Math.PI * 2);
      nf++;
    }
    this.forest = { can, can2, sh, n: nf };
    // hills
    const hills = [];
    for (let k = 0; k < 900 && hills.length < 22; k++) {
      const x = lerp(bx0, bx1, r()), y = lerp(by0, by1, r()), h = sampleGrid(F, x, y);
      if (h < 0.22 || h > 0.56) continue;
      if (routeDist(x, y) < 34 || stopDist(x, y) < 70 || featDist(x, y) < 40 || inRegion(x, y, 14)) continue;
      if (hills.some((q) => Math.hypot(q.x - x, q.y - y) < 58)) continue;
      hills.push({ x, y, w: 15 + r() * 7, h: 11 + r() * 8 + h * 14 });
    }
    const hl = new Path2D(), hd = new Path2D(), ho = new Path2D();
    for (const q of hills) {
      const { x, y, w, h } = q;
      hl.moveTo(x - w, y); hl.bezierCurveTo(x - w * 0.55, y - h * 0.15, x - w * 0.35, y - h, x, y - h); hl.bezierCurveTo(x + w * 0.35, y - h, x + w * 0.55, y - h * 0.15, x + w, y); hl.closePath();
      hd.moveTo(x, y - h); hd.bezierCurveTo(x + w * 0.35, y - h, x + w * 0.55, y - h * 0.15, x + w, y); hd.quadraticCurveTo(x + w * 0.3, y - h * 0.08, x - w * 0.1, y - h * 0.35); hd.quadraticCurveTo(x + w * 0.12, y - h * 0.7, x, y - h);
      ho.moveTo(x - w, y); ho.bezierCurveTo(x - w * 0.55, y - h * 0.15, x - w * 0.35, y - h, x, y - h); ho.bezierCurveTo(x + w * 0.35, y - h, x + w * 0.55, y - h * 0.15, x + w, y);
    }
    this.hills = { hl, hd, ho, n: hills.length };
    // wave marks on the open water (distance from the coast 6–70 cells), spaced ≥ 80
    const waves = [];
    for (let k = 0; k < 6000 && waves.length < 170; k++) {
      const x = lerp(-420, 1520, r()), y = lerp(-420, 1820, r());
      const d = sampleGrid(SD, x, y);
      if (d < 7 || d > 80) continue;
      if (waves.some((q) => Math.abs(q.x - x) < 90 && Math.abs(q.y - y) < 60)) continue;
      waves.push({ x, y, ph: r() * 6.283, w: 11 + r() * 6, two: r() < 0.4 });
    }
    this.waves = waves;
    // wind streaks (바람): a few long faint curves blowing across, each on its own loop
    this.wind = Array.from({ length: 7 }, (_, i) => ({ x: lerp(-200, 1100, r()), y: lerp(0, 1500, r()), len: 140 + r() * 120, per: 2.6 + r() * 1.2, ph: r() }));

    // ---- labels: measure, then place
    ctx.font = `700 30px ${HAH}`;
    for (const s of this.stops) {
      s.sub = (s.i === 0 ? '' : `${(Math.floor(s.km * 10) / 10).toFixed(1)} km`) + (s.note ? (s.i === 0 ? '' : ' · ') + s.note : '');
      ctx.font = `700 30px ${HAH}`; const nw = trackedWidth(ctx, s.name, 1);
      ctx.font = `600 17px ${PRE}`; const sw = ctx.measureText(s.sub).width;
      s.cw = Math.max(nw, sw) + 36; s.ch = 74;
    }
    const wideScreen = (x, y) => [FX + (x - this.wide[0]) * this.zWide, FY + (y - this.wide[1]) * this.zWide];
    const SAFE = [34, 318, 1046, 1468];          // final frame: between the cartouche and the HUD
    const BLOCK = [[44, 60, 660, 250], [890, 96, 150, 220]];
    const regionRects = REGIONS.map((g) => { const [sx, sy] = wideScreen(g.x, g.y); const L = g.text.length * g.size * (1 + g.track) * Math.pow(this.zWide, 0.5); const c = Math.abs(Math.cos(g.rot * Math.PI / 180)), sn = Math.abs(Math.sin(g.rot * Math.PI / 180)); const w = L * c + 30 * sn, h = L * sn + 30 * c; return [sx - w / 2, sy - h / 2, w, h]; });
    const featRects = (zz, ox, oy) => feat.map((f) => [(f.x - ox) * zz - 14, (f.y - oy) * zz - 30, 28, 36]);
    const placed = [];
    for (const s of this.stops) {
      let best = null;
      for (let a = 0; a < 12; a++) for (const len of [40, 66, 96, 130]) {
        const th = (a / 12) * Math.PI * 2, ux = Math.cos(th), uy = Math.sin(th);
        const l0 = [ux * (PIN_R + 3), -PIN_H + uy * (PIN_R + 3)], l1 = [ux * (PIN_R + 3 + len), -PIN_H + uy * (PIN_R + 3 + len)];
        const ext = Math.min(Math.abs(ux) > 1e-6 ? s.cw / 2 / Math.abs(ux) : 1e9, Math.abs(uy) > 1e-6 ? s.ch / 2 / Math.abs(uy) : 1e9) + 1;
        const c = [l1[0] + ux * ext, l1[1] + uy * ext];
        const R = [c[0] - s.cw / 2, c[1] - s.ch / 2, s.cw, s.ch];
        let bad = 0;
        for (const zz of [this.zWide, 1.15, Z_STOP]) {
          for (let i = 0; i < RX.length; i += 2) {
            const px = (RX[i] - s.x) * zz, py = (RY[i] - s.y) * zz;
            if (px > R[0] - 14 && px < R[0] + R[2] + 14 && py > R[1] - 14 && py < R[1] + R[3] + 14) bad += 3;
            if (px * px + py * py > 34 * 34 && segPointDist(l0[0], l0[1], l1[0], l1[1], px, py) < 10) bad += 3;
          }
          for (const o of this.stops) {
            if (o === s) continue;
            const ox = (o.x - s.x) * zz, oy = (o.y - s.y) * zz;
            if (rectsHit(R, [ox - 22, oy - PIN_H - 24, 44, PIN_H + 30], 6)) bad += 5;
            if (o.L && o.i < s.i && rectsHit(R, [ox + o.L.R[0], oy + o.L.R[1], o.L.R[2], o.L.R[3]], 10)) bad += 5;
          }
          for (const fr of featRects(zz, s.x, s.y)) if (rectsHit(R, fr, 4)) bad += 1;
        }
        const [sx, sy] = wideScreen(s.x, s.y);
        const A = [sx + R[0], sy + R[1], R[2], R[3]];
        if (A[0] < SAFE[0] || A[1] < SAFE[1] || A[0] + A[2] > SAFE[2] || A[1] + A[3] > SAFE[3]) bad += 4;
        for (const b of BLOCK) if (rectsHit(A, b, 6)) bad += 4;
        for (const g of regionRects) if (rectsHit(A, g, 4)) bad += 2;
        const score = bad * 1000 + len + 18 * Math.abs(uy) + (uy < -0.3 ? 12 : 0);
        if (!best || score < best.score) best = { score, bad, R, c, l0, l1, ux, uy };
      }
      s.L = best;
      placed.push(best);
      if (best.bad) console.warn('label', s.name, 'could not avoid everything', best.bad);
    }
    this.labelBad = this.stops.map((s) => s.L.bad);

    this.setupMs = performance.now() - t0;
    console.log('setup', this.setupMs | 0, 'ms total', total | 0, 'minH', minH.toFixed(3), 'legs', legL.map((l) => l | 0), 'forest', nf, 'hills', hills.length, 'waves', waves.length, 'labels', this.labelBad);
  },

  // ---------------------------------------------------------------- route state as a function of t
  sAt(t) {
    const { go, dur, stopS } = this;
    if (t < go[0]) return 0;
    for (let i = 0; i < 5; i++) {
      if (t < go[i] + dur[i]) return lerp(stopS[i], stopS[i + 1], PROF((t - go[i]) / dur[i]));
      if (i === 4 || t < go[i + 1]) return stopS[i + 1];
    }
    return stopS[5];
  },
  pointAt(s) {
    const { RX, RY } = this;
    const f = clamp(s / 3, 0, RX.length - 1.001), i = Math.floor(f), u = f - i;
    return { x: lerp(RX[i], RX[i + 1], u), y: lerp(RY[i], RY[i + 1], u) };
  },
  headAt(t) { return this.pointAt(this.sAt(t)); },
  zoomAt(t) {
    const { go, dur } = this;
    for (let i = 0; i < 5; i++) {
      if (t >= go[i] && t < go[i] + dur[i]) {
        const u = (t - go[i]) / dur[i];
        return Z_STOP * Math.exp(-Math.log(Z_STOP / this.zLeg[i]) * Math.pow(Math.sin(Math.PI * u), 1.1));
      }
    }
    return Z_STOP;
  },
  camAt(t) {
    const f = clamp(t / this.camDT, 0, this.cam.length / 3 - 1.001), n = Math.floor(f), u = f - n, c = this.cam;
    return { x: lerp(c[n * 3], c[n * 3 + 3], u), y: lerp(c[n * 3 + 1], c[n * 3 + 4], u), z: Math.exp(lerp(c[n * 3 + 2], c[n * 3 + 5], u)) };
  },
  night(t) { let n = 0; for (const [a, b] of this.nights) n = Math.max(n, win(t, a, b, 0.16)); return n; },

  // ---------------------------------------------------------------- drawing
  frame(t) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.setLineDash([]); ctx.lineDashOffset = 0;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.imageSmoothingEnabled = true;
    const cam = this.camAt(t), z = cam.z;
    const T = (ox = 0, oy = 0) => ctx.setTransform(z, 0, 0, z, FX - cam.x * z + ox, FY - cam.y * z + oy);
    const toS = (x, y) => [FX + (x - cam.x) * z, FY + (y - cam.y) * z];
    const nightK = this.night(t);

    // ---- sea
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, SEA0); g.addColorStop(1, SEA1);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    T();
    ctx.fillStyle = SHALLOW; ctx.globalAlpha = 0.5; ctx.fill(this.shallow, 'evenodd'); ctx.globalAlpha = 1;
    ctx.lineWidth = 1.6 / z;
    this.rings.forEach((p, i) => { ctx.strokeStyle = `rgba(255,255,255,${0.26 - i * 0.05})`; ctx.stroke(p); });
    // wave marks: a slow sway and breathing
    ctx.beginPath();
    for (const w of this.waves) {
      const dx = 4 * Math.sin(t * 1.3 + w.ph), x = w.x + dx, y = w.y + 1.5 * Math.sin(t * 1.7 + w.ph * 1.3);
      ctx.moveTo(x - w.w, y); ctx.quadraticCurveTo(x - w.w / 2, y - 5, x, y); ctx.quadraticCurveTo(x + w.w / 2, y + 5, x + w.w, y);
      if (w.two) { ctx.moveTo(x - w.w * 0.4, y + 9); ctx.quadraticCurveTo(x + w.w * 0.1, y + 4, x + w.w * 0.6, y + 9); }
    }
    ctx.lineWidth = 2.2 / z; ctx.strokeStyle = 'rgba(255,255,255,0.42)'; ctx.stroke();
    // boats
    for (const b of this.boats) {
      const bob = Math.sin(t * 2.2 + b.ph) * 1.4, s = b.s * 9;
      ctx.save(); ctx.translate(b.x + 3 * Math.sin(t * 0.6 + b.ph), b.y + bob); ctx.rotate(0.06 * Math.sin(t * 2.2 + b.ph + 1));
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.6 / z;
      ctx.beginPath(); ctx.moveTo(-s * 2.6, s * 0.55); ctx.lineTo(-s * 1.4, s * 0.45); ctx.moveTo(-s * 2.4, s * 0.95); ctx.lineTo(-s * 1.3, s * 0.8); ctx.stroke();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.lineTo(s * 0.7, s * 0.45); ctx.lineTo(-s * 0.7, s * 0.45); ctx.closePath(); ctx.fill();
      ctx.fillStyle = PAPER; ctx.beginPath(); ctx.moveTo(-s * 0.1, -s * 1.7); ctx.lineTo(-s * 0.1, -s * 0.15); ctx.lineTo(-s * 0.95, -s * 0.15); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s * 0.05, -s * 1.4); ctx.lineTo(s * 0.05, -s * 0.15); ctx.lineTo(s * 0.7, -s * 0.15); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    const cloudA = (c) => clamp((c.zmax - z) / 0.2) * (c.zmax < 0.9 ? clamp((1.5 - t) / 0.3) : 0.95);   // low clouds belong to the opening only

    // ---- land
    T(5, 9); ctx.fillStyle = 'rgba(16,52,62,0.32)'; ctx.fill(this.coast, 'evenodd');
    T();
    ctx.lineWidth = 8 / z; ctx.strokeStyle = 'rgba(255,255,255,0.62)'; ctx.stroke(this.coast);
    ctx.fillStyle = BANDS[0][1]; ctx.fill(this.coast, 'evenodd');
    for (const bd of this.bands) { ctx.fillStyle = bd.c; ctx.fill(bd.path, 'evenodd'); }
    for (const c of this.contours) { ctx.lineWidth = (c.idx ? 1.5 : 0.95) / z; ctx.strokeStyle = c.idx ? 'rgba(82,78,44,0.4)' : 'rgba(82,78,44,0.22)'; ctx.stroke(c.path); }
    // inner shadow: the coast stroked wide inside a clip, five passes = a soft ramp
    ctx.save(); ctx.clip(this.coast, 'evenodd');
    for (const w of [84, 56, 36, 20, 9]) { ctx.lineWidth = w; ctx.strokeStyle = 'rgba(112,84,38,0.075)'; ctx.stroke(this.coast); }
    ctx.restore();
    ctx.lineWidth = 2 / z; ctx.strokeStyle = 'rgba(42,38,32,0.78)'; ctx.stroke(this.coast);
    // lake
    ctx.fillStyle = SHALLOW; ctx.fill(this.lake.path);
    ctx.save(); ctx.clip(this.lake.path); ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(40,110,120,0.25)'; ctx.stroke(this.lake.path); ctx.restore();
    ctx.lineWidth = 1.6 / z; ctx.strokeStyle = 'rgba(42,38,32,0.7)'; ctx.stroke(this.lake.path);
    ctx.beginPath(); ctx.moveTo(this.lake.cx - 18, this.lake.cy - 4); ctx.lineTo(this.lake.cx + 6, this.lake.cy - 4); ctx.moveTo(this.lake.cx - 4, this.lake.cy + 7); ctx.lineTo(this.lake.cx + 20, this.lake.cy + 7);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.8 / z; ctx.stroke();
    // forests and hills
    ctx.fillStyle = 'rgba(70,98,58,0.42)'; ctx.fill(this.forest.sh);
    ctx.fillStyle = '#8DB073'; ctx.fill(this.forest.can);
    ctx.fillStyle = '#76A065'; ctx.fill(this.forest.can2);
    ctx.fillStyle = 'rgba(255,250,235,0.55)'; ctx.fill(this.hills.hl);
    ctx.fillStyle = 'rgba(120,96,58,0.32)'; ctx.fill(this.hills.hd);
    ctx.lineWidth = 1.4 / z; ctx.strokeStyle = 'rgba(60,50,32,0.6)'; ctx.stroke(this.hills.ho);
    // pier, houses, lighthouse
    ctx.lineCap = 'butt'; ctx.lineWidth = 5; ctx.strokeStyle = '#8C6E4E';
    ctx.beginPath(); ctx.moveTo(...this.pier[0]); ctx.lineTo(...this.pier[1]); ctx.stroke(); ctx.lineCap = 'round';
    for (const h of this.houses) {
      const s = 7 * h.s;
      ctx.fillStyle = 'rgba(40,50,40,0.3)'; ctx.fillRect(h.x - s + 1.5, h.y - s * 0.4 + 2, s * 2, s * 1.3);
      ctx.fillStyle = PAPER; ctx.fillRect(h.x - s, h.y - s * 0.4, s * 2, s * 1.3);
      ctx.fillStyle = '#56698A'; ctx.beginPath(); ctx.moveTo(h.x - s * 1.25, h.y - s * 0.35); ctx.lineTo(h.x, h.y - s * 1.35); ctx.lineTo(h.x + s * 1.25, h.y - s * 0.35); ctx.closePath(); ctx.fill();
    }
    {
      const { x, y } = this.light;
      ctx.fillStyle = 'rgba(40,50,40,0.3)'; ctx.beginPath(); ctx.ellipse(x + 3, y + 2, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PAPER; ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x - 4.5, y - 30); ctx.lineTo(x + 4.5, y - 30); ctx.lineTo(x + 7, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = ACC; ctx.fillRect(x - 6.2, y - 10, 12.4, 5); ctx.fillRect(x - 5.3, y - 21, 10.6, 5);
      ctx.fillStyle = INK; ctx.fillRect(x - 6, y - 36, 12, 6); ctx.beginPath(); ctx.moveTo(x - 6.5, y - 36); ctx.lineTo(x, y - 42); ctx.lineTo(x + 6.5, y - 36); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FFE08A'; ctx.fillRect(x - 3.5, y - 35, 7, 4);
    }
    // region names: world-anchored, tracked wide, letters spread in at the start
    for (let gi = 0; gi < REGIONS.length; gi++) this.drawRegion(ctx, REGIONS[gi], gi, t, cam);
    // wind streaks
    T();
    for (const w of this.wind) {
      const q = ((t / w.per + w.ph) % 1 + 1) % 1, a = bump(q) * 0.5;
      if (a < 0.02) continue;
      const x0 = w.x + q * 260, y0 = w.y;
      ctx.beginPath();
      for (let k = 0; k <= 16; k++) { const u = k / 16, xx = x0 + u * w.len, yy = y0 + 7 * Math.sin(u * 5 + q * 4 + w.ph * 9); if (k) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
      ctx.lineWidth = 2 / z; ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.stroke();
    }
    // graticule
    this.drawGraticule(ctx, cam, false);

    // ---- night: multiply the map toward blue; inn windows light up
    if (nightK > 0) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = mix('#FFFFFF', '#4B5A9C', 0.74 * nightK); ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      const which = t < (this.nights[0][1] + this.nights[1][0]) / 2 ? 0 : 1;
      for (const h of this.houses) {
        if (h.night !== which) continue;
        const [sx, sy] = toS(h.x, h.y), rr = 40 * Math.sqrt(z);
        const gl = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr); gl.addColorStop(0, `rgba(255,214,120,${0.9 * nightK})`); gl.addColorStop(0.25, `rgba(255,200,110,${0.45 * nightK})`); gl.addColorStop(1, 'rgba(255,200,110,0)');
        ctx.fillStyle = gl; ctx.fillRect(sx - rr, sy - rr, rr * 2, rr * 2);
      }
      ctx.globalAlpha = 1;
    }
    { // the lighthouse sweeps its beam (faint by day, bright at night)
      const [lx, ly] = toS(this.light.x, this.light.y - 33), Lb = 300 * Math.sqrt(z), a0 = t * 1.5 + 0.6;
      if (lx > -Lb && lx < W + Lb && ly > -Lb && ly < H + Lb) {
        const gb = ctx.createRadialGradient(lx, ly, 0, lx, ly, Lb);
        gb.addColorStop(0, `rgba(255,232,160,${0.12 + 0.5 * nightK})`); gb.addColorStop(1, 'rgba(255,232,160,0)');
        ctx.fillStyle = gb;
        for (const a of [a0, a0 + Math.PI]) { ctx.beginPath(); ctx.moveTo(lx, ly); ctx.arc(lx, ly, Lb, a - 0.14, a + 0.14); ctx.closePath(); ctx.fill(); }
      }
    }

    // ---- route: cream casing + accent dashes, both cut by arc length
    T();
    const s = this.sAt(t), wk = Math.sqrt(z / Z_STOP);
    if (s > 0.5) {
      ctx.lineWidth = (12 * wk) / z; ctx.strokeStyle = PAPER; ctx.beginPath();
      const n = Math.floor(s / 3);
      ctx.moveTo(this.RX[0], this.RY[0]);
      for (let i = 1; i <= n; i++) ctx.lineTo(this.RX[i], this.RY[i]);
      const hp = this.pointAt(s); ctx.lineTo(hp.x, hp.y); ctx.stroke();
      ctx.lineWidth = (6.2 * wk) / z; ctx.strokeStyle = ACC; ctx.beginPath();
      for (const [a, b] of this.dashes) {
        if (a >= s) break;
        const e = Math.min(b, s), p0 = this.pointAt(a); ctx.moveTo(p0.x, p0.y);
        for (let q = Math.ceil(a / 3) * 3; q < e; q += 3) { const p = this.pointAt(q); ctx.lineTo(p.x, p.y); }
        const p1 = this.pointAt(e); ctx.lineTo(p1.x, p1.y);
      }
      ctx.stroke();
    }
    // closing sweep: a warm light runs the whole walk once
    if (t > T_SWEEP0 && t < T_SWEEP1 + 0.3) {
      const sh = this.sweepS(t), fade = clamp((T_SWEEP1 + 0.3 - t) / 0.3);
      for (let k = 0; k < 8; k++) {
        const a = sh - (k + 1) * 34, b = sh - k * 34;
        if (b <= 0) continue;
        ctx.beginPath();
        const p0 = this.pointAt(Math.max(0, a)); ctx.moveTo(p0.x, p0.y);
        for (let q = Math.max(0, a); q <= b; q += 6) { const p = this.pointAt(q); ctx.lineTo(p.x, p.y); }
        ctx.lineWidth = (16 * wk) / z; ctx.strokeStyle = `rgba(255,236,170,${0.55 * (1 - k / 8) * fade})`; ctx.stroke();
      }
      const hp = this.pointAt(sh), [hx, hy] = [hp.x, hp.y];
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const [sx, sy] = toS(hx, hy);
      const gl = ctx.createRadialGradient(sx, sy, 0, sx, sy, 34); gl.addColorStop(0, `rgba(255,246,210,${0.95 * fade})`); gl.addColorStop(1, 'rgba(255,236,170,0)');
      ctx.fillStyle = gl; ctx.fillRect(sx - 34, sy - 34, 68, 68);
    }

    // ---- pins, leaders, cards
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const st of this.stops) this.drawLeader(ctx, st, t, toS);
    for (const st of this.stops) this.drawPin(ctx, st, t, toS);
    for (const st of this.stops) this.drawCard(ctx, st, t, toS);
    // ---- the walker
    this.drawHead(ctx, t, s, toS);
    // ---- clouds (above the map, faster parallax)
    for (const c of this.cloudsOn(t)) {
      const a = cloudA(c); if (a <= 0.01) continue;
      const sx = FX + (c.x - cam.x) * z * c.k, sy = FY + (c.y - cam.y) * z * c.k, sc = c.s * z * c.k;
      ctx.globalAlpha = a;
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath();
      for (const [dx, dy, rr] of PUFFS) { ctx.moveTo(sx + (dx + rr) * sc, sy + dy * sc); ctx.arc(sx + dx * sc, sy + dy * sc, rr * sc, 0, Math.PI * 2); }
      ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.rect(sx - 3 * sc, sy + 0.12 * sc, 6 * sc, 2 * sc); ctx.clip();
      ctx.fillStyle = '#DCE9EA'; ctx.beginPath();
      for (const [dx, dy, rr] of PUFFS) { ctx.moveTo(sx + (dx + rr) * sc, sy + dy * sc); ctx.arc(sx + dx * sc, sy + dy * sc, rr * sc, 0, Math.PI * 2); }
      ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha = 1;
    // ---- vignette
    const vg = ctx.createRadialGradient(W / 2, H * 0.47, H * 0.28, W / 2, H * 0.47, H * 0.72);
    vg.addColorStop(0, 'rgba(12,40,50,0)'); vg.addColorStop(1, 'rgba(12,40,50,0.42)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    const cb = ctx.createLinearGradient(0, 1590, 0, 1720); cb.addColorStop(0, 'rgba(18,52,62,0)'); cb.addColorStop(1, 'rgba(18,52,62,0.9)');
    ctx.fillStyle = cb; ctx.fillRect(0, 1590, W, H - 1590);

    // ---- map furniture (screen space)
    this.drawGraticule(ctx, cam, true, t);
    this.drawCartouche(ctx, t);
    this.drawCompass(ctx, t);
    this.drawScale(ctx, t, z);
    this.drawHUD(ctx, t, s, nightK);
    this.drawStamp(ctx, t);

    if (DEBUG) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      ctx.font = '22px sans-serif'; ctx.fillStyle = '#ff0';
      ctx.fillText(`t=${t} z=${z.toFixed(2)} minH=${this.minH.toFixed(3)} total=${this.total | 0} setup=${this.setupMs | 0} bad=${this.labelBad}`, 20, 1660);
      ctx.fillText(`legs ${this.legL.map((l) => l | 0)} dur ${this.dur.map((d) => d.toFixed(2))} forest ${this.forest.n}`, 20, 1690);
    }
  },

  cloudsOn() { return this.clouds; },

  drawRegion(ctx, g, gi, t, cam) {
    const z = cam.z, [sx, sy] = [FX + (g.x - cam.x) * z, FY + (g.y - cam.y) * z];
    if (sx < -300 || sx > W + 300 || sy < -300 || sy > H + 300) return;
    const size = g.size * Math.pow(z, 0.5);
    const t0 = 0.42 + gi * 0.09, p = outCubic((t - t0) / 0.75);
    if (p <= 0) return;
    ctx.setTransform(1, 0, 0, 1, sx, sy); ctx.rotate((g.rot * Math.PI) / 180);
    ctx.font = `${g.sea ? 500 : 600} ${size.toFixed(2)}px ${HAH}`;
    const tr = size * lerp(g.track - 0.35, g.track, p);
    const chars = Array.from(g.text);
    const wsum = trackedWidth(ctx, g.text, tr);
    let px = -wsum / 2;
    for (let i = 0; i < chars.length; i++) {
      const q = clamp((t - t0 - i * 0.05) / 0.35);
      ctx.globalAlpha = q * (g.sea ? 0.85 : 0.62);
      ctx.fillStyle = g.sea ? '#EAF6F3' : '#4A4232';
      ctx.fillText(chars[i], px, size * 0.36 + (1 - q) * 6);
      px += cw(ctx, chars[i]) + tr;
    }
    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  },

  drawGraticule(ctx, cam, labels, t = 0) {
    const z = cam.z;
    const x0 = cam.x - FX / z, x1 = cam.x + (W - FX) / z, y0 = cam.y - FY / z, y1 = cam.y + (H - FY) / z;
    const cx = this.wide[0], cy = this.wide[1];
    const lat = (y) => LAT0 - (y - cy) / LATU, lon = (x) => LON0 + (x - cx) / LONU;
    const yOf = (m) => cy - (m - LAT0) * LATU, xOf = (m) => cx + (m - LON0) * LONU;
    const fmt = (m, h) => `${Math.floor(m / 60)}°${String(Math.round(m % 60)).padStart(2, '0')}′${h}`;
    const mLat0 = Math.floor(lat(y1) / 2) * 2, mLat1 = Math.ceil(lat(y0) / 2) * 2, mLon0 = Math.floor(lon(x0) / 2) * 2, mLon1 = Math.ceil(lon(x1) / 2) * 2;
    if (!labels) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath();
      for (let m = mLat0; m <= mLat1; m += 2) { const sy = FY + (yOf(m) - cam.y) * z; ctx.moveTo(0, sy); ctx.lineTo(W, sy); }
      for (let m = mLon0; m <= mLon1; m += 2) { const sx = FX + (xOf(m) - cam.x) * z; ctx.moveTo(sx, 0); ctx.lineTo(sx, H); }
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.stroke();
      return;
    }
    const a = clamp(t / 0.5);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a;
    // map margin: a dark band inside the neatline carries the coordinates
    ctx.fillStyle = 'rgba(14,44,54,0.62)';
    ctx.fillRect(20, 20, W - 40, 34); ctx.fillRect(20, 54, 34, H - 74); ctx.fillRect(W - 54, 54, 34, H - 74);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2; ctx.strokeRect(20.5, 20.5, W - 41, H - 41);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(54.5, 54.5, W - 109, H - 74);
    ctx.font = `500 14px ${FRA}`; ctx.fillStyle = 'rgba(255,255,255,0.88)';
    for (let m = mLat0; m <= mLat1; m += 2) {
      const sy = FY + (yOf(m) - cam.y) * z;
      if (sy < 80 || sy > 1600) continue;
      ctx.fillRect(46, sy - 0.6, 8, 1.2); ctx.fillRect(W - 54, sy - 0.6, 8, 1.2);
      if (sy < 360 || sy > 1440) continue;
      ctx.save(); ctx.translate(42, sy); ctx.rotate(-Math.PI / 2); tracked(ctx, fmt(m, 'N'), 0, 0, 1.8, 'center'); ctx.restore();
    }
    for (let m = mLon0; m <= mLon1; m += 2) {
      const sx = FX + (xOf(m) - cam.x) * z;
      if (sx < 80 || sx > W - 80) continue;
      ctx.fillRect(sx - 0.6, 46, 1.2, 8);
      tracked(ctx, fmt(m, 'E'), sx, 42, 1.8, 'center');
    }
    ctx.globalAlpha = 1;
  },

  drawPin(ctx, st, t, toS) {
    const land = this.land[st.i], tau = t - (land - 0.2);
    if (tau < 0) return;
    const [sx, sy] = toS(st.x, st.y);
    let y = 0, sqx = 1, sqy = 1, alpha = clamp(tau / 0.05);
    if (tau < 0.2) y = -120 * (1 - (tau / 0.2) ** 2);
    else {
      const u = tau - 0.2;
      y = -15 * Math.exp(-7 * u) * Math.abs(Math.sin((Math.PI * u) / 0.13));
      const sq = 0.2 * Math.exp(-16 * u) * Math.cos(u * 40);
      sqy = 1 - sq; sqx = 1 + sq * 0.6;
      // ripple on landing
      if (u < 0.65) {
        const k = u / 0.65;
        ctx.beginPath(); ctx.ellipse(sx, sy, 8 + 50 * outCubic(k), (8 + 50 * outCubic(k)) * 0.5, 0, 0, Math.PI * 2);
        ctx.lineWidth = 3 * (1 - k) + 0.5; ctx.strokeStyle = `rgba(226,71,43,${0.7 * (1 - k)})`; ctx.stroke();
      }
    }
    // closing hop as the sweep passes
    y -= 14 * bump((t - this.sweepPass[st.i] + 0.04) / 0.3);
    // ground shadow
    const hgt = clamp(-y / 120);
    ctx.fillStyle = `rgba(20,40,40,${0.32 * alpha * (1 - 0.6 * hgt)})`;
    ctx.beginPath(); ctx.ellipse(sx, sy, 9 * (1 - 0.4 * hgt), 3.6 * (1 - 0.4 * hgt), 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(sx, sy + y); ctx.scale(sqx, sqy);
    const L = PIN_H, R = PIN_R;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-R * 0.35, -L * 0.42, -R, -L + R * 0.62, -R, -L);
    ctx.arc(0, -L, R, Math.PI, 0);
    ctx.bezierCurveTo(R, -L + R * 0.62, R * 0.35, -L * 0.42, 0, 0);
    ctx.closePath();
    ctx.fillStyle = ACC; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = ACC_D; ctx.stroke();
    ctx.fillStyle = PAPER; ctx.beginPath(); ctx.arc(0, -L, R * 0.64, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ACC_D; ctx.font = `800 16px ${PRE}`; ctx.textAlign = 'center'; ctx.fillText(String(st.i + 1), 0, -L + 5.8); ctx.textAlign = 'left';
    ctx.restore();
  },

  drawLeader(ctx, st, t, toS) {
    const tl = t - (this.land[st.i] + 0.02);
    if (tl <= 0) return;
    const [sx, sy] = toS(st.x, st.y), L = st.L, p = outCubic(tl / 0.18);
    ctx.beginPath(); ctx.moveTo(sx + L.l0[0], sy + L.l0[1]); ctx.lineTo(sx + lerp(L.l0[0], L.l1[0], p), sy + lerp(L.l0[1], L.l1[1], p));
    ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(sx + lerp(L.l0[0], L.l1[0], p), sy + lerp(L.l0[1], L.l1[1], p), 3, 0, Math.PI * 2); ctx.fill();
  },

  drawCard(ctx, st, t, toS) {
    const tl = t - (this.land[st.i] + 0.12);
    if (tl <= 0) return;
    const [sx, sy] = toS(st.x, st.y), L = st.L;
    const cs = outBack(tl / 0.32, 1.6), a = clamp(tl / 0.1);
    const px = sx + L.l1[0], py = sy + L.l1[1];
    ctx.save();
    ctx.translate(px, py); ctx.scale(cs, cs); ctx.translate(-px, -py);
    ctx.globalAlpha = a;
    const x = sx + L.R[0], y = sy + L.R[1], w = L.R[2], h = L.R[3];
    ctx.fillStyle = 'rgba(16,44,50,0.26)'; rrect(ctx, x, y + 5, w, h, 10); ctx.fill();
    ctx.fillStyle = PAPER; rrect(ctx, x, y, w, h, 10); ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(x + 12, y + 14, 3, h - 28);
    ctx.font = `700 30px ${HAH}`; ctx.fillStyle = INK;
    const chars = Array.from(st.name);
    let cx = x + 24;
    for (let i = 0; i < chars.length; i++) {
      const q = clamp((tl - 0.06 - i * 0.035) / 0.18);
      ctx.globalAlpha = a * q; ctx.fillText(chars[i], cx, y + 38 + (1 - outCubic(q)) * 8);
      cx += cw(ctx, chars[i]) + 1;
    }
    ctx.globalAlpha = a * clamp((tl - 0.2) / 0.2);
    ctx.font = `600 17px ${PRE}`; ctx.fillStyle = MUTED; ctx.fillText(st.sub, x + 24, y + 61);
    ctx.restore();
  },

  drawHead(ctx, t, s, toS) {
    const appear = outBack((t - T_HEAD) / 0.32, 2.2);
    if (appear <= 0) return;
    const p = this.pointAt(s), [sx, sy] = toS(p.x, p.y);
    const a = this.pointAt(Math.max(0, s - 7)), b = this.pointAt(Math.min(this.total, s + 7));
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    // pulses
    for (let k = 0; k < 2; k++) {
      const q = (((t - T_HEAD) / 1.1 + k * 0.5) % 1 + 1) % 1;
      ctx.beginPath(); ctx.arc(sx, sy, 15 + 40 * q, 0, Math.PI * 2);
      ctx.lineWidth = 2.5; ctx.strokeStyle = `rgba(226,71,43,${0.55 * (1 - q) ** 1.5 * clamp(appear)})`; ctx.stroke();
    }
    ctx.save(); ctx.translate(sx, sy); ctx.scale(appear, appear);
    ctx.fillStyle = 'rgba(16,40,44,0.3)'; ctx.beginPath(); ctx.arc(2, 5, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PAPER; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(ang);
    ctx.fillStyle = PAPER; ctx.beginPath(); ctx.moveTo(9.5, 0); ctx.lineTo(-6.5, -6.8); ctx.lineTo(-2.6, 0); ctx.lineTo(-6.5, 6.8); ctx.closePath(); ctx.fill();
    ctx.restore();
  },

  drawCartouche(ctx, t) {
    const p = outBack((t - 0.16) / 0.42, 1.3);
    if (p <= 0) return;
    const x = 48, y = 66, w = 640, h = 232;
    ctx.save();
    ctx.translate(x, y); ctx.scale(1, p); ctx.translate(-x, -y);
    ctx.fillStyle = 'rgba(14,42,50,0.3)'; notched(ctx, x, y + 7, w, h, 16); ctx.fill();
    ctx.fillStyle = PAPER; notched(ctx, x, y, w, h, 16); ctx.fill();
    ctx.lineWidth = 2.4; ctx.strokeStyle = INK; notched(ctx, x + 1.2, y + 1.2, w - 2.4, h - 2.4, 15); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(42,38,32,0.6)'; notched(ctx, x + 9, y + 9, w - 18, h - 18, 10); ctx.stroke();
    ctx.restore();
    const line = (t0, yy, hh, draw) => {
      const q = outExpo((t - t0) / 0.55);
      if (q <= 0) return;
      ctx.save(); ctx.beginPath(); ctx.rect(x + 12, yy - hh, w - 24, hh * 1.3); ctx.clip();
      ctx.translate(0, (1 - q) * hh); ctx.globalAlpha = clamp((t - t0) / 0.2); draw(); ctx.restore();
    };
    line(0.36, y + 52, 22, () => { ctx.font = `600 16px ${FRA}`; ctx.fillStyle = MUTED; tracked(ctx, 'WIND ISLE  ·  A THREE-DAY WALK', x + 36, y + 52, 4.2); });
    // title: per-syllable rise, 사흘 in the accent
    const title = '바람섬 사흘 걷기', hi = [4, 5];
    ctx.font = `800 78px ${HAH}`;
    ctx.save(); ctx.beginPath(); ctx.rect(x + 12, y + 70, w - 24, 96); ctx.clip();
    let px = x + 32;
    Array.from(title).forEach((ch, i) => {
      const q = outExpo((t - 0.42 - i * 0.04) / 0.6);
      if (q > 0) { ctx.globalAlpha = clamp((t - 0.42 - i * 0.04) / 0.15); ctx.fillStyle = hi.includes(i) ? ACC : INK; ctx.fillText(ch, px, y + 146 + (1 - q) * 90); }
      px += cw(ctx, ch) - 78 * 0.03;
    });
    ctx.restore(); ctx.globalAlpha = 1;
    // rule with a diamond
    const rp = outCubic((t - 0.62) / 0.5);
    if (rp > 0) {
      const cx = x + w / 2, half = (w / 2 - 36) * rp;
      ctx.fillStyle = INK; ctx.fillRect(cx - half, y + 172, half * 2, 1.4);
      ctx.save(); ctx.translate(cx, y + 172.7); ctx.rotate(Math.PI / 4); ctx.fillStyle = PAPER; ctx.fillRect(-6, -6, 12, 12); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.strokeRect(-6, -6, 12, 12); ctx.restore();
    }
    line(0.72, y + 206, 20, () => { ctx.font = `500 15px ${FRA}`; ctx.fillStyle = MUTED; tracked(ctx, 'N 22°41′  ·  E 138°17′  ·  1 : 50 000', x + w / 2, y + 206, 3.6, 'center'); });
  },

  drawCompass(ctx, t) {
    const u = t - 0.3;
    if (u <= 0) return;
    const sc = outBack(u / 0.4, 1.6), rot = -2.4 * Math.exp(-4.2 * u) * Math.cos(6.5 * u);
    const cx = 964, cy = 186;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
    ctx.globalAlpha = clamp(u / 0.15);
    ctx.fillStyle = 'rgba(14,42,50,0.25)'; ctx.beginPath(); ctx.arc(2, 5, 58, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(251,245,230,0.92)'; ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.stroke();
    ctx.rotate(rot);
    for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2, r0 = k % 6 === 0 ? 43 : 47; ctx.beginPath(); ctx.moveTo(Math.sin(a) * r0, -Math.cos(a) * r0); ctx.lineTo(Math.sin(a) * 52, -Math.cos(a) * 52); ctx.lineWidth = k % 6 === 0 ? 1.8 : 1; ctx.stroke(); }
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4, Lp = k % 2 ? 24 : 44, wp = k % 2 ? 6 : 9;
      const tip = [Math.sin(a) * Lp, -Math.cos(a) * Lp], sd = [Math.sin(a + Math.PI / 2) * wp, -Math.cos(a + Math.PI / 2) * wp];
      ctx.fillStyle = k === 0 ? ACC : INK; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sd[0], sd[1]); ctx.lineTo(tip[0], tip[1]); ctx.closePath(); ctx.fill();
      ctx.fillStyle = k === 0 ? ACC_D : '#CFC4AE'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-sd[0], -sd[1]); ctx.lineTo(tip[0], tip[1]); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = PAPER; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = clamp((u - 0.25) / 0.2);
    ctx.font = `700 22px ${FRA}`; ctx.fillStyle = PAPER; ctx.textAlign = 'center'; ctx.fillText('N', cx, cy - 66); ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  },

  drawScale(ctx, t, z) {
    const a = clamp((t - 0.6) / 0.3);
    if (a <= 0) return;
    const right = 1004, y = 286;
    ctx.globalAlpha = a;
    for (const [unit, w] of [[1, clamp((z - 1.06) / 0.14)], [2, 1 - clamp((z - 1.06) / 0.14)]]) {
      if (w <= 0.01) continue;
      ctx.globalAlpha = a * w;
      const len = unit * KM * z, x0 = right - len;
      ctx.fillStyle = 'rgba(14,42,50,0.25)'; rrect(ctx, x0 - 16, y - 14 + 4, len + 32, 50, 8); ctx.fill();
      ctx.fillStyle = 'rgba(251,245,230,0.94)'; rrect(ctx, x0 - 16, y - 14, len + 32, 50, 8); ctx.fill();
      ctx.fillStyle = INK; ctx.fillRect(x0, y, len / 2, 7); ctx.fillStyle = PAPER; ctx.fillRect(x0 + len / 2, y, len / 2, 7);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(x0, y, len, 7);
      ctx.font = `600 13px ${FRA}`; ctx.fillStyle = INK;
      tracked(ctx, '0', x0, y + 26, 1, 'center'); tracked(ctx, `${unit} KM`, right + 6, y + 26, 1.6, 'right');
    }
    ctx.globalAlpha = 1;
  },

  drawHUD(ctx, t, s, nightK) {
    const p = outBack((t - 0.5) / 0.5, 1.2);
    if (p <= 0) return;
    const x = 44, y = 1488, w = 992, h = 136;
    ctx.save();
    ctx.translate(0, (1 - p) * 180); ctx.globalAlpha = clamp((t - 0.5) / 0.2);
    ctx.fillStyle = 'rgba(14,42,50,0.32)'; notched(ctx, x, y + 7, w, h, 16); ctx.fill();
    ctx.fillStyle = PAPER; notched(ctx, x, y, w, h, 16); ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(42,38,32,0.55)'; notched(ctx, x + 8, y + 8, w - 16, h - 16, 10); ctx.stroke();
    // day badge (turns to night blue, the numeral gives way to a moon)
    const bx = x + 74, by = y + h / 2;
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(bx, by, 48, 0, Math.PI * 2); ctx.fill();
    if (nightK > 0) { ctx.save(); ctx.beginPath(); ctx.arc(bx, by, 48, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = NIGHT; ctx.beginPath(); ctx.arc(bx + (1 - ease.inOutCubic(nightK)) * 100, by, 50, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    ctx.font = `700 13px ${FRA}`; ctx.fillStyle = PAPER; ctx.globalAlpha = 1 - nightK; tracked(ctx, 'DAY', bx + 1, by - 18, 3, 'center');
    ctx.globalAlpha = 1;
    ctx.save(); ctx.beginPath(); ctx.arc(bx, by, 46, 0, Math.PI * 2); ctx.clip();
    ctx.globalAlpha = 1 - nightK;
    rollText(ctx, this.dayNum, t, bx, by + 26, 46, (str, xx, yy) => { ctx.font = `800 44px ${FRA}`; ctx.fillStyle = PAPER; ctx.textAlign = 'center'; ctx.fillText(str, xx, yy); ctx.textAlign = 'left'; });
    ctx.restore();
    if (nightK > 0) {
      ctx.globalAlpha = nightK; ctx.fillStyle = '#FFE08A';
      ctx.beginPath(); ctx.arc(bx, by, 22, 0, Math.PI * 2); ctx.arc(bx + 10, by - 7, 19, 0, Math.PI * 2, true); ctx.fill('evenodd');
      ctx.globalAlpha = 1;
    }
    // day name + leg
    rollText(ctx, this.dayItems, t, x + 146, y + 58, 40, (str, xx, yy) => { ctx.font = `700 34px ${HAH}`; ctx.fillStyle = INK; tracked(ctx, str, xx, yy, 0); });
    rollText(ctx, this.legItems, t, x + 147, y + 89, 24, (str, xx, yy) => { ctx.font = `600 18px ${PRE}`; ctx.fillStyle = MUTED; ctx.fillText(str, xx, yy); });
    { // the whole walk as a line: six stops, filled as far as we have come
      const px0 = x + 150, px1 = x + 520, py = y + 110, f = s / this.total;
      ctx.fillStyle = 'rgba(42,38,32,0.16)'; ctx.fillRect(px0, py - 1.5, px1 - px0, 3);
      ctx.fillStyle = ACC; ctx.fillRect(px0, py - 1.5, (px1 - px0) * f, 3);
      for (const st of this.stops) {
        const qx = lerp(px0, px1, st.s / this.total), on = s >= st.s - 0.5;
        ctx.beginPath(); ctx.arc(qx, py, 4.5, 0, Math.PI * 2); ctx.fillStyle = on ? ACC : PAPER; ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = on ? ACC : 'rgba(42,38,32,0.45)'; ctx.stroke();
      }
    }
    // divider
    ctx.fillStyle = 'rgba(42,38,32,0.25)'; ctx.fillRect(x + 556, y + 26, 1.2, h - 52);
    // distance odometer
    const km = s / KM;
    ctx.font = `600 15px ${PRE}`; ctx.fillStyle = MUTED; tracked(ctx, '걸은 거리', x + 590, y + 44, 1.5);
    this.odometer(ctx, km, x + 588, y + 104);
    ctx.font = `600 22px ${FRA}`; ctx.fillStyle = MUTED; ctx.fillText('km', x + 588 + this.odoW + 8, y + 104);
    // walking time
    const mins = Math.round((km / PACE) * 60);
    ctx.font = `600 15px ${PRE}`; ctx.fillStyle = MUTED; tracked(ctx, '걸은 시간', x + 822, y + 44, 1.5);
    this.tabular(ctx, `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`, x + 820, y + 104, `800 40px ${PRE}`, INK);
    ctx.restore();
  },

  /** digits in fixed cells; the ones and tens roll like a mechanical counter when the tenths wrap */
  odometer(ctx, v, x, y) {
    const font = `800 54px ${PRE}`;
    ctx.font = font;
    if (!this.cell) { let m = 0; for (const d of '0123456789') m = Math.max(m, ctx.measureText(d).width); this.cell = m; this.dotW = ctx.measureText('.').width; }
    const cell = this.cell, x10 = Math.floor(v * 1000 + 1e-6) / 100;
    const cells = [{ k: 2 }, { k: 1 }, { dot: true }, { k: 0 }];
    let px = x;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 4, y - 46, 300, 58); ctx.clip();
    ctx.textAlign = 'center';
    for (const c of cells) {
      if (c.dot) { ctx.fillStyle = INK; ctx.fillText('.', px + this.dotW / 2, y); px += this.dotW + 2; continue; }
      const pw = Math.pow(10, c.k), q = x10 / pw;
      const d = Math.floor(q) % 10;
      let f = 0;
      if (c.k > 0) { const lower = x10 - Math.floor(x10 / pw) * pw; if (lower > pw - 1) f = lower - (pw - 1); }
      const lead = c.k === 2 && v < 9.95;
      ctx.fillStyle = lead ? 'rgba(42,38,32,0.18)' : INK;
      ctx.fillText(String(d), px + cell / 2, y - f * 56);
      if (f > 0) ctx.fillText(String((d + 1) % 10), px + cell / 2, y + (1 - f) * 56);
      px += cell + 1;
    }
    ctx.restore();
    this.odoW = px - x;
  },
  tabular(ctx, str, x, y, font, color) {
    ctx.font = font; ctx.fillStyle = color;
    if (!this.cell40) { let m = 0; for (const d of '0123456789') m = Math.max(m, ctx.measureText(d).width); this.cell40 = m; }
    let px = x;
    ctx.textAlign = 'center';
    for (const ch of str) { const wch = /\d/.test(ch) ? this.cell40 : ctx.measureText(ch).width; ctx.fillText(ch, px + wch / 2, y); px += wch + 1; }
    ctx.textAlign = 'left';
  },

  drawStamp(ctx, t) {
    const u = t - T_STAMP;
    if (u <= 0) return;
    const cx = 790, cy = 236, k = u < 0.16 ? lerp(2.4, 1, ease.inCubic(u / 0.16)) : 1 + 0.06 * Math.exp(-9 * (u - 0.16)) * Math.sin((u - 0.16) * 30);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.22); ctx.scale(k, k);
    ctx.globalAlpha = clamp(u / 0.08) * 0.94;
    ctx.strokeStyle = ACC; ctx.fillStyle = ACC;
    ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.stroke();
    ctx.font = `800 40px ${HAH}`; ctx.textAlign = 'center'; ctx.fillText('완주', 0, 13);
    ctx.font = `600 11px ${FRA}`;
    tracked(ctx, '3 DAYS', 0, -26, 2.2, 'center');
    tracked(ctx, `${(Math.floor((this.total / KM) * 10) / 10).toFixed(1)} KM`, 0, 38, 2, 'center');
    ctx.textAlign = 'left';
    ctx.restore();
    // impact ring
    if (u > 0.16 && u < 0.56) {
      const q = (u - 0.16) / 0.4;
      ctx.beginPath(); ctx.arc(cx, cy, 64 + 60 * outCubic(q), 0, Math.PI * 2);
      ctx.lineWidth = 3 * (1 - q); ctx.strokeStyle = `rgba(226,71,43,${0.6 * (1 - q)})`; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
});
