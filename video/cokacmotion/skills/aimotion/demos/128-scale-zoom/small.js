/*
 * 128 · small.js — the three small levels, each in its own local units:
 *   L0 drop    1 unit = 1 µm     (contact radius 500)
 *   L1 leaf    1 unit = 0.1 mm   (blade 1100 long)
 *   L2 garden  1 unit = 1 cm     (four raised beds, ~9 m across)
 * A level draws only its objects; the surface they sit on is its parent's (see main.js "ground").
 */
import { rand, clamp, smooth } from '../_lib/stage.js';
import { Af, jitterVoronoi, cellEdges, hash2, taper, addPoly, addCircle, addEllipse, roundRect, inPoly } from './geo.js';

const TAU = Math.PI * 2, DEG = Math.PI / 180;
export const SC = { // small-level colours (greens; the soil is a green-ink)
  lit: '#5FAE55', shade: '#478F48', vein: '#8CCB6A', veinlet: '#86C96A', rib: '#9AD47A', edge: '#2F6B3F',
  soil: '#33412F', soilHi: '#46553F', frame: '#B6CFA2', frameD: '#7E9E76', stone: '#DCE8D3', stoneD: '#B8CDB0',
  hedge: '#2E6A3E', hedgeHi: '#4C8C4F', water: '#4A9BC9', waterHi: '#9ED3EE', ink: '#16303A', teal: '#3E8B87',
  shadow: 'rgba(16,40,26,', lawn: '#6FAE5C',
};

// ================================================================ the leaf (L1 units, 0.1 mm)
export const LL = 1100, LEAF_ROT = -38 * DEG;
const DIR = [Math.cos(LEAF_ROT), Math.sin(LEAF_ROT)], NRM = [-DIR[1], DIR[0]];
const O = [-0.47 * LL * DIR[0], -0.47 * LL * DIR[1]];        // midrib point u = 0.47 sits at the level origin
const vmid = (u) => 26 * Math.sin(Math.PI * clamp(u)) * (1 - 0.4 * u);
export const hw = (u, s = 1) => u <= 0 || u >= 1 ? 0 :
  285 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.72)), 0.88) * (1 - 0.2 * u) * (1 + 0.014 * Math.sin(u * 53 + s * 1.7));
/** leaf frame (u along the midrib 0 base → 1 tip, v across, + = lower-right side) → L1 units */
export const leafPt = (u, v) => [O[0] + u * LL * DIR[0] + (v + vmid(u)) * NRM[0], O[1] + u * LL * DIR[1] + (v + vmid(u)) * NRM[1]];
export const toLeaf = (x, y) => { const dx = x - O[0], dy = y - O[1], u = (dx * DIR[0] + dy * DIR[1]) / LL; return [u, dx * NRM[0] + dy * NRM[1] - vmid(u)]; };

export function buildLeaf() {
  const N = 140, upper = [], lower = [], rib = [];
  for (let i = 0; i <= N; i++) { const u = i / N; upper.push(leafPt(u, -hw(u, -1))); lower.push(leafPt(u, hw(u, 1))); rib.push(leafPt(u, 0)); }
  const outline = upper.concat(lower.slice().reverse());
  const halfLit = addPoly(new Path2D(), upper.concat(rib.slice().reverse()));     // v < 0: faces the light (upper left)
  const halfShade = addPoly(new Path2D(), lower.concat(rib.slice().reverse()));
  const blade = addPoly(new Path2D(), outline);
  // midrib + petiole as one tapered polygon (u −0.15 … 0.98)
  const ribPts = []; for (let i = 0; i <= 60; i++) { const u = -0.15 + (1.13 * i) / 60; ribPts.push(leafPt(u, 0)); }
  const ribPoly = taper(ribPts, (q) => (q < 0.13 ? 15 : 20 - 18 * Math.pow((q - 0.13) / 0.87, 0.8)));
  const stem = leafPt(-0.15, 0);
  // secondary veins: 8 per side, curving towards the tip, tapering
  const veins = [];
  for (const s of [-1, 1]) for (let i = 0; i < 8; i++) {
    const us = 0.07 + i * 0.106, pts = [];
    for (let j = 0; j <= 28; j++) { const tau = j / 28, u = us + 0.2 * Math.pow(tau, 0.85) * (1 - 0.25 * us); pts.push(leafPt(u, s * hw(u, s) * 0.9 * Math.pow(tau, 0.8))); }
    veins.push({ s, i, pts, poly: taper(pts, (q) => (7.5 - 2.5 * i / 7) * (1 - 0.78 * q)) });
  }
  const veinPath = new Path2D();
  for (const v of veins) addPoly(veinPath, v.poly);
  const ribPath = addPoly(new Path2D(), ribPoly);
  return { outline, blade, halfLit, halfShade, ribPoly, ribPath, veins, veinPath, stem };
}

/** the network of minor veins (areoles ~0.9 mm) + freely ending veinlets, as quadratic segments [x0,y0,cx,cy,x1,y1] */
export function buildVeinlets(leaf) {
  const xs = leaf.outline.map((p) => p[0]), ys = leaf.outline.map((p) => p[1]);
  const keep = (x, y) => { const [u, v] = toLeaf(x, y); return u > 0.015 && u < 0.985 && Math.abs(v) < hw(u, Math.sign(v) || 1) - 4; };
  const cells = jitterVoronoi({ x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys), g: 9, jitter: 0.42, seed: 128, keep });
  const segs = [];
  for (const [a, b] of cellEdges(cells)) {
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
    if (len < 0.4) continue;
    const o = (hash2((a[0] + b[0]) / 2, (a[1] + b[1]) / 2) - 0.5) * 0.32 * len;
    segs.push([a[0], a[1], (a[0] + b[0]) / 2 - (dy / len) * o, (a[1] + b[1]) / 2 + (dx / len) * o, b[0], b[1]]);
  }
  const free = [];
  for (const c of cells) {
    if (c.r > 0.62 || c.poly.length < 3) continue;
    const i = Math.floor(c.r * 97) % c.poly.length, a = c.poly[i], b = c.poly[(i + 1) % c.poly.length];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ex = mx + (c.x - mx) * 0.6, ey = my + (c.y - my) * 0.6;
    free.push([mx, my, (mx + ex) / 2 + (ey - my) * 0.18, (my + ey) / 2 - (ex - mx) * 0.18, ex, ey]);
  }
  const path = new Path2D(), freePath = new Path2D();
  for (const q of segs) { path.moveTo(q[0], q[1]); path.quadraticCurveTo(q[2], q[3], q[4], q[5]); }
  for (const q of free) { freePath.moveTo(q[0], q[1]); freePath.quadraticCurveTo(q[2], q[3], q[4], q[5]); }
  return { segs, free, path, freePath, n: cells.length };
}

/** the hero drop's place on the leaf: beside the 4th vein of the lit side, so the vein runs under one flank of the drop */
export function dropSite(leaf) {
  const v = leaf.veins.find((w) => w.s === -1 && w.i === 3), k = Math.round(0.42 * (v.pts.length - 1));
  const a = v.pts[k - 1], b = v.pts[k + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [v.pts[k][0] + ((b[1] - a[1]) / l) * 3.0, v.pts[k][1] - ((b[0] - a[0]) / l) * 3.0];
}

// small dew drops on the leaf (L1 stand-ins; the hero drop's stand-in is the first)
export function buildDew(leaf, P0) {
  const R = rand(77), drops = [{ x: P0[0], y: P0[1], r: 5, hero: true }, { x: P0[0] - 6.5, y: P0[1] + 7.5, r: 0.9 }, { x: P0[0] + 5.5, y: P0[1] - 9, r: 0.6 }];
  let tries = 0;
  while (drops.length < 26 && tries++ < 4000) {
    const u = 0.08 + R() * 0.84, s = R() < 0.5 ? -1 : 1, v = s * hw(u, s) * (0.08 + R() * 0.8);
    const [x, y] = leafPt(u, v), r = 0.8 + Math.pow(R(), 2.2) * 6.5;
    if (drops.some((d) => Math.hypot(d.x - x, d.y - y) < d.r + r + (d.hero ? 26 : 8))) continue;
    drops.push({ x, y, r });
  }
  return drops;
}
/** a dew drop as a simple glossy disc (any size ≥ a few px) — local units, k = px per unit */
export function drawDew(ctx, x, y, r, k, a = 1) {
  ctx.globalAlpha = a * 0.3; ctx.fillStyle = '#123A20';
  ctx.beginPath(); ctx.arc(x + r * 0.26, y + r * 0.34, r * 1.02, 0, TAU); ctx.fill();
  const g = ctx.createRadialGradient(x + r * 0.28, y + r * 0.34, r * 0.05, x, y, r);
  g.addColorStop(0, '#CFF2A8'); g.addColorStop(0.45, '#73BE5E'); g.addColorStop(0.85, '#4C9B4C'); g.addColorStop(1, '#2C6B39');
  ctx.globalAlpha = a; ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (r * k > 3) {
    ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = a * 0.92;
    ctx.beginPath(); ctx.ellipse(x - r * 0.38, y - r * 0.42, r * 0.24, r * 0.14, -40 * DEG, 0, TAU); ctx.fill();
    ctx.globalAlpha = a * 0.45;
    ctx.beginPath(); ctx.ellipse(x + r * 0.42, y + r * 0.5, r * 0.08, r * 0.05, -40 * DEG, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** L1: the leaf. M = level → screen, k = px per unit */
export function drawLeaf(ctx, M, k, t, L, fa = 1) {
  ctx.globalAlpha = fa;
  ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
  const g1 = ctx.createLinearGradient(O[0] + 0.45 * LL * DIR[0], O[1] + 0.45 * LL * DIR[1], O[0] + 0.45 * LL * DIR[0] - 300 * NRM[0], O[1] + 0.45 * LL * DIR[1] - 300 * NRM[1]);
  g1.addColorStop(0, '#68B85C'); g1.addColorStop(0.55, SC.lit); g1.addColorStop(1, '#4F9A4C');
  const g2 = ctx.createLinearGradient(O[0] + 0.45 * LL * DIR[0], O[1] + 0.45 * LL * DIR[1], O[0] + 0.45 * LL * DIR[0] + 300 * NRM[0], O[1] + 0.45 * LL * DIR[1] + 300 * NRM[1]);
  g2.addColorStop(0, '#53A04F'); g2.addColorStop(0.6, SC.shade); g2.addColorStop(1, '#3B7E40');
  ctx.fillStyle = g1; ctx.fill(L.leaf.halfLit);
  ctx.fillStyle = g2; ctx.fill(L.leaf.halfShade);
  // minor veins: visible while an areole (≈9 units) is a few px or more
  const av = smooth((9 * k - 2.5) / 6);
  if (av > 0) {
    ctx.save(); ctx.clip(L.leaf.blade);
    ctx.strokeStyle = SC.veinlet; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalAlpha = fa * 0.55 * av; ctx.lineWidth = Math.max(0.55, 0.9 / k); ctx.stroke(L.vl.path);
    ctx.globalAlpha = fa * 0.4 * av; ctx.lineWidth = Math.max(0.4, 0.7 / k); ctx.stroke(L.vl.freePath);
    ctx.restore(); ctx.globalAlpha = fa * 1;
  }
  ctx.fillStyle = SC.vein; ctx.fill(L.leaf.veinPath);
  ctx.fillStyle = SC.rib; ctx.fill(L.leaf.ribPath);
  ctx.strokeStyle = SC.edge; ctx.globalAlpha = fa * 0.55; ctx.lineWidth = Math.max(1.2, 1.3 / k); ctx.stroke(L.leaf.blade); ctx.globalAlpha = fa * 1;
  for (const d of L.dew) if (d.r * k > 0.6) drawDew(ctx, d.x, d.y, d.r, k, fa);
}

// ================================================================ the drop (L0 units, µm) and its lens
export const DROP_A = 500;
/** spherical-cap drop, contact angle 90°: a vertical ray at radius ρ refracts at the surface and lands on the leaf at
 *  ρ_leaf = ρ − z(ρ)·tan(θ − θt), sinθ = ρ/a, sinθt = sinθ/n. Returns the inverse (leaf radius → apparent radius). */
export function lensTable(a = DROP_A, n = 1.333, N = 600) {
  const rl = new Float64Array(N + 1);
  for (let i = 0; i <= N; i++) {
    const r = (a * i) / N, th = Math.asin(Math.min(1, r / a)), tt = Math.asin(Math.sin(th) / n), z = Math.sqrt(Math.max(0, a * a - r * r));
    rl[i] = r - z * Math.tan(th - tt);
  }
  for (let i = 1; i <= N; i++) if (rl[i] < rl[i - 1]) rl[i] = rl[i - 1];   // guard (it is monotonic for 90°)
  const inv = (q) => {                     // leaf radius → apparent radius
    if (q >= a) return q;
    let lo = 0, hi = N;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (rl[m] <= q) lo = m; else hi = m; }
    const f = (q - rl[lo]) / Math.max(1e-9, rl[hi] - rl[lo]);
    return (a * (lo + f)) / N;
  };
  return { rl, inv, mag0: (a / N) / (rl[1] - rl[0]) };
}

/** L0 geometry: epidermal cells around the drop and the lensed copies of everything under it */
export function buildDrop(leaf, vl, P0) {
  const a = DROP_A, lens = lensTable(), R0 = 2400;
  const cells = jitterVoronoi({ x0: -R0, y0: -R0, x1: R0, y1: R0, g: 60, jitter: 0.4, seed: 9, keep: (x, y) => x * x + y * y < R0 * R0 });
  const BANDS = 3, cellPaths = Array.from({ length: BANDS + 1 }, () => new Path2D()), cellLit = new Path2D();
  for (const c of cells) {
    const d = Math.hypot(c.x, c.y), b = d <= 1300 ? 0 : 1 + Math.min(BANDS - 1, Math.floor(((d - 1300) / 1100) * BANDS));
    addPoly(cellPaths[b], c.poly, true);
    if (c.r < 0.3) addPoly(cellLit, c.poly);
  }
  // the lens: leaf point (µm, drop-centred) → apparent point
  const map = (x, y) => { const r = Math.hypot(x, y); if (r < 1e-9 || r >= a) return [x, y]; const k = lens.inv(r) / r; return [x * k, y * k]; };
  const toUm = (p) => [(p[0] - P0[0]) * 100, (p[1] - P0[1]) * 100];
  const lensPoly = (path, P, step) => {
    const out = [];
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[(i + 1) % P.length], n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / step));
      for (let j = 0; j < n; j++) out.push(map(p[0] + ((q[0] - p[0]) * j) / n, p[1] + ((q[1] - p[1]) * j) / n));
    }
    addPoly(path, out);
  };
  const near = (P, r) => P.some((p) => p[0] * p[0] + p[1] * p[1] < r * r);
  const lVein = new Path2D(), lVeinlet = new Path2D(), lCells = new Path2D();
  for (const v of leaf.veins) { const P = v.poly.map(toUm); if (near(P, a * 2.5)) lensPoly(lVein, P, 10); }
  for (const q of vl.segs.concat(vl.free)) {
    const p0 = toUm([q[0], q[1]]), pc = toUm([q[2], q[3]]), p1 = toUm([q[4], q[5]]);
    if (Math.min(Math.hypot(...p0), Math.hypot(...p1)) > a + 1200) continue;
    const pts = [];
    for (let j = 0; j <= 24; j++) { const s = j / 24, m = 1 - s; pts.push(map(m * m * p0[0] + 2 * m * s * pc[0] + s * s * p1[0], m * m * p0[1] + 2 * m * s * pc[1] + s * s * p1[1])); }
    addPoly(lVeinlet, pts);
  }
  for (const c of cells) if (Math.hypot(c.x, c.y) < a + 90) lensPoly(lCells, c.poly, 8);
  return { cellPaths, cellLit, BANDS, lVein, lVeinlet, lCells, mag0: lens.mag0, nCells: cells.length };
}

/** L0: the drop. Light from the upper left: shadow + focused light to the lower right, window highlight upper left */
export function drawDrop(ctx, M, k, t, D, alpha) {
  const a = DROP_A;
  ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // epidermis: pavement cells, while a cell (60 µm) is ≥ ~5 px; outer bands fade so the patch has no edge
  const ac = smooth((60 * k - 4) / 10) * alpha;
  if (ac > 0) {
    ctx.fillStyle = '#7CC466'; ctx.globalAlpha = 0.07 * ac; ctx.fill(D.cellLit);
    ctx.strokeStyle = '#8ACF6C'; ctx.lineWidth = Math.max(4, 1.1 / k);
    for (let b = 0; b <= D.BANDS; b++) { ctx.globalAlpha = 0.34 * ac * (b === 0 ? 1 : 1 - b / (D.BANDS + 1)); ctx.stroke(D.cellPaths[b]); }
  }
  // cast shadow and the outer caustic
  ctx.globalAlpha = alpha;
  let g = ctx.createRadialGradient(a * 0.26, a * 0.34, a * 0.2, a * 0.22, a * 0.3, a * 1.12);
  g.addColorStop(0, 'rgba(18,58,30,0.55)'); g.addColorStop(0.75, 'rgba(18,58,30,0.32)'); g.addColorStop(1, 'rgba(18,58,30,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(a * 0.22, a * 0.3, a * 1.12, 0, TAU); ctx.fill();
  // light focused through the drop: crescents just outside the lower-right rim (circle offset minus the drop)
  ctx.fillStyle = '#E8FFCC';
  for (const [o, al] of [[0.16, 0.1], [0.1, 0.16], [0.05, 0.26]]) {
    ctx.globalAlpha = al * alpha; ctx.beginPath();
    ctx.arc(a * o * 0.62, a * o * 0.8, a, 0, TAU); ctx.arc(0, 0, a, TAU, 0, true); ctx.fill();
  }
  // the body: what lies under it, seen through the lens
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, a, 0, TAU); ctx.clip();
  ctx.globalAlpha = alpha; ctx.fillStyle = '#66B65A'; ctx.fillRect(-a, -a, 2 * a, 2 * a);
  ctx.fillStyle = '#A4DB84'; ctx.fill(D.lVein);
  ctx.strokeStyle = '#93D476'; ctx.globalAlpha = 0.7 * alpha; ctx.lineWidth = 72; ctx.stroke(D.lVeinlet);
  ctx.strokeStyle = '#9CDA7C'; ctx.globalAlpha = 0.4 * alpha; ctx.lineWidth = Math.max(5, 1.1 / k); ctx.stroke(D.lCells);
  ctx.globalAlpha = alpha;
  g = ctx.createRadialGradient(a * 0.34, a * 0.42, 0, a * 0.34, a * 0.42, a * 0.62);   // light focused on the far side
  g.addColorStop(0, 'rgba(240,255,214,0.62)'); g.addColorStop(1, 'rgba(240,255,214,0)');
  ctx.fillStyle = g; ctx.fillRect(-a, -a, 2 * a, 2 * a);
  g = ctx.createRadialGradient(-a * 0.08, -a * 0.1, a * 0.55, 0, 0, a);                   // dark rim (total internal reflection)
  g.addColorStop(0, 'rgba(20,60,34,0)'); g.addColorStop(0.7, 'rgba(20,60,34,0.28)'); g.addColorStop(1, 'rgba(14,44,26,0.78)');
  ctx.fillStyle = g; ctx.fillRect(-a, -a, 2 * a, 2 * a);
  g = ctx.createRadialGradient(a * 0.1, a * 0.12, a * 0.78, a * 0.1, a * 0.12, a * 0.98);     // bright inner rim, far side
  g.addColorStop(0, 'rgba(226,255,200,0)'); g.addColorStop(0.75, 'rgba(226,255,200,0.34)'); g.addColorStop(1, 'rgba(226,255,200,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, a, -20 * DEG, 115 * DEG); ctx.arc(0, 0, a * 0.6, 115 * DEG, -20 * DEG, true); ctx.fill();
  ctx.restore();
  // highlights: a window reflection, the sky along the upper rim, a small back reflection
  const sh = 1 + 0.035 * Math.sin(t * 2.6);
  ctx.globalAlpha = alpha; ctx.strokeStyle = '#1B4A2C'; ctx.globalAlpha = 0.5 * alpha; ctx.lineWidth = Math.max(6, 1.2 / k);
  ctx.beginPath(); ctx.arc(0, 0, a, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#FFFFFF'; ctx.globalAlpha = 0.22 * alpha; ctx.lineWidth = a * 0.04;
  ctx.beginPath(); ctx.arc(0, 0, a * 0.87, 200 * DEG, 262 * DEG); ctx.stroke();
  ctx.save(); ctx.translate(-a * 0.4, -a * 0.44); ctx.rotate(-40 * DEG); ctx.scale(sh, sh);
  ctx.fillStyle = '#FFFFFF';
  for (const [w, h, al] of [[0.42, 0.29, 0.14], [0.36, 0.24, 0.3], [0.3, 0.19, 0.92]]) {
    ctx.globalAlpha = al * alpha; ctx.beginPath(); ctx.roundRect(-a * w / 2, -a * h / 2, a * w, a * h, a * h * 0.42); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = 0.5 * alpha;
  ctx.beginPath(); ctx.ellipse(a * 0.46, a * 0.52, a * 0.07, a * 0.04, -40 * DEG, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
}
/** where the glint sits on the drop (the window highlight), L0 units */
export const GLINT_AT = [-0.29 * DROP_A, -0.53 * DROP_A];      // the upper-right tip of the window highlight

// ================================================================ L2: the garden (units cm)
export const BEDS = [
  { x: -105, y: -200, kind: 'kale' }, { x: 105, y: -200, kind: 'hero' },
  { x: -105, y: 200, kind: 'butter' }, { x: 105, y: 200, kind: 'chard' },
];
export const BED_W = 130, BED_H = 330;
const KINDS = {
  hero: { lit: SC.lit, shade: SC.shade, vein: SC.vein, rib: SC.rib, s: [1.25, 1.65], n: [7, 9] },
  kale: { lit: '#5E9F8A', shade: '#447F70', vein: '#9DCDBD', rib: '#A9D6C6', s: [1.45, 1.85], n: [7, 9] },
  butter: { lit: '#93CF68', shade: '#71B252', vein: '#BCE592', rib: '#C8EBA2', s: [1.05, 1.35], n: [9, 11] },
  chard: { lit: '#4E9C5A', shade: '#377B46', vein: '#A4D9A9', rib: '#B4E3B4', s: [1.55, 1.95], n: [6, 8] },
};
export const HERO_PLANT = [105 + 33, -200 - 66];      // the plant that holds the hero leaf (garden cm)

export function buildGarden(leaf) {
  const R = rand(2024), plants = [], shadow = new Path2D();
  const leafM = (cx, cy, phi, s) => Af.mul(Af.of(0.01 * s, cx, cy, phi - LEAF_ROT), Af.of(1, -leaf.stem[0], -leaf.stem[1]));
  for (const b of BEDS) for (const dx of [-33, 33]) for (const dy of [-132, -66, 0, 66, 132]) {
    const K = KINDS[b.kind], cx = b.x + dx + (R() - 0.5) * 6, cy = b.y + dy + (R() - 0.5) * 6;
    const hero = b.kind === 'hero' && dx === 33 && dy === -66;
    const pcx = hero ? HERO_PLANT[0] : cx, pcy = hero ? HERO_PLANT[1] : cy;
    const n = K.n[0] + Math.floor(R() * (K.n[1] - K.n[0] + 1)), phi0 = R() * TAU, leaves = [];
    for (let i = 0; i < n; i++) {
      let phi = phi0 + (i / n) * TAU + (R() - 0.5) * 0.4;
      const s = (K.s[0] + R() * (K.s[1] - K.s[0])) * (0.82 + 0.18 * ((i * 5) % n) / n);
      if (hero) { const d = Math.atan2(Math.sin(phi - LEAF_ROT), Math.cos(phi - LEAF_ROT)); if (Math.abs(d) < 0.55) phi += Math.sign(d || 1) * 0.6; }
      leaves.push({ M: leafM(pcx, pcy, phi, s), phi, s });
    }
    leaves.sort((p, q) => q.s - p.s);
    if (hero) leaves.push({ M: leafM(pcx, pcy, LEAF_ROT, 1), phi: LEAF_ROT, s: 1, hero: true });
    for (const l of leaves) {
      const nx = -NRM[0], ny = -NRM[1], r = l.phi - LEAF_ROT;   // the v < 0 half faces the light if its normal points up-left
      l.litA = (nx * Math.cos(r) - ny * Math.sin(r)) * -1 + (nx * Math.sin(r) + ny * Math.cos(r)) * -1 > 0;
      shadow.addPath(leaf.blade, Af.dom(Af.mul(Af.of(1, 1.4, 1.9), l.M)));
    }
    plants.push({ x: pcx, y: pcy, K, leaves, hero, r: 16 * K.s[1] });
  }
  plants.sort((p, q) => (p.hero ? 1 : 0) - (q.hero ? 1 : 0));     // the hero plant last, so nothing covers its leaf
  // static garden objects
  const P = (f) => { const p = new Path2D(); f(p); return p; };
  const frames = P((p) => { for (const b of BEDS) roundRect(p, b.x - BED_W / 2 - 8, b.y - BED_H / 2 - 8, BED_W + 16, BED_H + 16, 10); });
  const bedShadow = P((p) => { for (const b of BEDS) roundRect(p, b.x - BED_W / 2 - 2, b.y - BED_H / 2 + 2, BED_W + 16, BED_H + 16, 10); });
  const soil = P((p) => { for (const b of BEDS) roundRect(p, b.x - BED_W / 2, b.y - BED_H / 2, BED_W, BED_H, 5); });
  const rows = P((p) => { for (const b of BEDS) for (const dx of [-33, 33]) roundRect(p, b.x + dx - 13, b.y - BED_H / 2 + 12, 26, BED_H - 24, 13); });
  const stones = [], RS = rand(5);
  for (let y = -370; y <= 400; y += 56) stones.push([(RS() - 0.5) * 8, y, 19 + RS() * 4, 15 + RS() * 3, (RS() - 0.5) * 0.5]);
  for (let x = -60; x >= -420; x -= 58) stones.push([x, 455 + (RS() - 0.5) * 10, 19 + RS() * 4, 15 + RS() * 3, (RS() - 0.5) * 0.5]);
  const stonePath = P((p) => { for (const s of stones) addEllipse(p, s[0], s[1], s[2], s[3], s[4]); });
  const stoneShadow = P((p) => { for (const s of stones) addEllipse(p, s[0] + 3, s[1] + 4, s[2], s[3], s[4]); });
  const hedges = [], RH = rand(11);
  for (let x = -400; x <= 420; x += 34) hedges.push([x, -500 + (RH() - 0.5) * 14, 26 + RH() * 16]);
  for (let y = -470; y <= 360; y += 34) hedges.push([440 + (RH() - 0.5) * 14, y, 26 + RH() * 16]);
  const hedgePath = P((p) => { for (const h of hedges) addCircle(p, h[0], h[1], h[2]); });
  const hedgeShadow = P((p) => { for (const h of hedges) addCircle(p, h[0] + 9, h[1] + 13, h[2]); });
  const hedgeHi = P((p) => { for (const h of hedges) addCircle(p, h[0] - h[2] * 0.25, h[1] - h[2] * 0.3, h[2] * 0.55); });
  // flower clumps along the left edge: a green mound with a few blooms
  const clumps = [], flowers = [[], []], RF = rand(31);
  for (let i = 0; i < 13; i++) {
    const cx = -300 + (RF() - 0.5) * 30, cy = -330 + i * 56 + (RF() - 0.5) * 16, r = 19 + RF() * 8;
    clumps.push([cx, cy, r]);
    for (let j = 0; j < 7; j++) { const a = RF() * TAU, d = Math.sqrt(RF()) * r * 0.75; flowers[i % 2].push([cx + Math.cos(a) * d, cy + Math.sin(a) * d, 3.2 + RF() * 1.6]); }
  }
  const clumpPath = P((p) => { for (const c of clumps) addCircle(p, c[0], c[1], c[2]); });
  const clumpShadow = P((p) => { for (const c of clumps) addCircle(p, c[0] + 5, c[1] + 7, c[2]); });
  const flowerPaths = flowers.map((f) => P((p) => { for (const q of f) addCircle(p, q[0], q[1], q[2]); }));
  const tuftPath = P((p) => {                  // lawn tufts around the garden (they fade with size)
    const RT = rand(41);
    for (let i = 0; i < 900; i++) {
      const x = -520 + RT() * 1060, y = -620 + RT() * 1240;
      if (Math.abs(x) < 245 && Math.abs(y) < 395) continue;
      for (let j = -1; j <= 1; j++) { p.moveTo(x + j * 2.2, y); p.quadraticCurveTo(x + j * 3.5, y - 5, x + j * 4.5 + 1.5, y - 9); }
    }
  });
  return { plants, shadow, frames, bedShadow, soil, rows, stonePath, stoneShadow, hedgePath, hedgeShadow, hedgeHi, flowerPaths, clumpPath, clumpShadow, tuftPath, hedges };
}

export function drawGarden(ctx, M, k, t, G, leaf, fa = 1) {
  ctx.globalAlpha = fa;
  const set = (N) => ctx.setTransform(N[0], N[1], N[2], N[3], N[4], N[5]);
  set(M);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const at = smooth((9 * k - 3) / 8);          // tufts while ≥ a few px
  if (at > 0) { ctx.strokeStyle = '#5E9D50'; ctx.globalAlpha = fa * 0.55 * at; ctx.lineWidth = 1.2; ctx.stroke(G.tuftPath); ctx.globalAlpha = fa * 1; }
  ctx.fillStyle = SC.shadow + '0.3)'; ctx.fill(G.bedShadow); ctx.fill(G.stoneShadow);
  ctx.fillStyle = SC.frame; ctx.fill(G.frames);
  ctx.fillStyle = SC.soil; ctx.fill(G.soil);
  ctx.fillStyle = SC.soilHi; ctx.fill(G.rows);
  ctx.strokeStyle = SC.frameD; ctx.lineWidth = 2.5; ctx.stroke(G.soil);
  ctx.fillStyle = SC.stone; ctx.fill(G.stonePath);
  // rain barrel, watering can, coiled hose
  ctx.fillStyle = SC.shadow + '0.3)'; ctx.beginPath(); ctx.arc(302, -318, 34, 0, TAU); ctx.fill();
  ctx.fillStyle = SC.ink; ctx.beginPath(); ctx.arc(292, -330, 34, 0, TAU); ctx.fill();
  ctx.fillStyle = SC.water; ctx.beginPath(); ctx.arc(292, -330, 28, 0, TAU); ctx.fill();
  ctx.strokeStyle = SC.waterHi; ctx.globalAlpha = fa * 0.7; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(292, -330, 20 + 3 * Math.sin(t * 1.4), 200 * DEG, 260 * DEG); ctx.stroke(); ctx.globalAlpha = fa * 1;
  ctx.fillStyle = SC.teal; ctx.beginPath(); ctx.ellipse(-262, 64, 17, 13, 0.3, 0, TAU); ctx.fill();
  ctx.strokeStyle = SC.teal; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-250, 70); ctx.lineTo(-222, 84); ctx.stroke();
  ctx.strokeStyle = '#2C6E6A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-264, 62, 9, 200 * DEG, 340 * DEG); ctx.stroke();
  ctx.strokeStyle = SC.teal; ctx.lineWidth = 3.4; ctx.beginPath();
  for (let i = 0; i <= 90; i++) { const a = i * 0.21, r = 6 + i * 0.26; i ? ctx.lineTo(300 + Math.cos(a) * r, 330 + Math.sin(a) * r) : ctx.moveTo(300 + r, 330); }
  ctx.stroke();
  ctx.fillStyle = SC.shadow + '0.3)'; ctx.fill(G.clumpShadow);
  ctx.fillStyle = '#4C9A52'; ctx.fill(G.clumpPath);
  ctx.fillStyle = '#EEF5EA'; ctx.fill(G.flowerPaths[0]); ctx.fillStyle = '#A9D3E8'; ctx.fill(G.flowerPaths[1]);
  // plants: leaf shadows, then each leaf (largest first, the hero leaf last)
  ctx.fillStyle = SC.shadow + '0.34)'; ctx.fill(G.shadow);
  const vis = (x, y, r) => { const sx = M[0] * x + M[2] * y + M[4], sy = M[1] * x + M[3] * y + M[5], rr = r * k; return sx > -rr && sx < 1080 + rr && sy > -rr && sy < 1920 + rr; };
  for (const p of G.plants) {
    if (!vis(p.x, p.y, p.r + 4)) continue;
    for (const l of p.leaves) {
      const N = Af.mul(M, l.M), kk = k * 0.01 * l.s;
      set(N);
      ctx.fillStyle = l.litA ? p.K.lit : p.K.shade; ctx.fill(leaf.halfLit);
      ctx.fillStyle = l.litA ? p.K.shade : p.K.lit; ctx.fill(leaf.halfShade);
      if (kk * LL > 40) { ctx.fillStyle = p.K.vein; ctx.globalAlpha = fa * smooth((kk * LL - 40) / 80); ctx.fill(leaf.veinPath); ctx.globalAlpha = fa * 1; }
      ctx.fillStyle = p.K.rib; ctx.fill(leaf.ribPath);
      if (kk * LL > 24) { ctx.strokeStyle = SC.edge; ctx.globalAlpha = fa * 0.4; ctx.lineWidth = 1.1 / kk; ctx.stroke(leaf.blade); ctx.globalAlpha = fa * 1; }
    }
  }
  set(M);
  ctx.fillStyle = SC.shadow + '0.32)'; ctx.fill(G.hedgeShadow);
  ctx.fillStyle = SC.hedge; ctx.fill(G.hedgePath);
  ctx.fillStyle = SC.hedgeHi; ctx.globalAlpha = fa * 0.55; ctx.fill(G.hedgeHi); ctx.globalAlpha = fa * 1;
}
