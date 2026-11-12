/*
 * 128 · large.js — the four large levels, each in its own local units:
 *   L3 neighbourhood  1 unit = 1 m      (street grid, ~1.3 km across)
 *   L4 city + river   1 unit = 100 m    (fields, suburbs, core, river, ~150 km across)
 *   L5 peninsula      1 unit = 1 km     (a continent's coast; origin = the city)
 *   L6 Earth          1 unit = 10 km    (orthographic globe, radius 637.1)
 * All geography is invented. One river and one city outline are shared by L4 and L5; one continent outline is shared
 * by L5 and L6 (L5 draws it re-expressed in its own km around the anchor, so both agree exactly).
 */
import { rand, clamp, smooth } from '../_lib/stage.js';
import { Af, makeNoise, jitterVoronoi, cellEdges, insetConvex, fractal, chaikin, resample, inPoly, blob, addPoly, addCircle, addEllipse, bandOf, bandAlpha, roundRect } from './geo.js';
import { BEDS, BED_W, BED_H } from './small.js';

const TAU = Math.PI * 2, DEG = Math.PI / 180;
export const LC = {
  road: '#4F6C76', lane: '#A7C0C6', blockBase: '#5A984E', lawns: ['#6FAE5C', '#78B565', '#67A657'], drive: '#CBD8D0',
  roofs: [['#7C97A6', '#5B7686'], ['#5E9C98', '#437C79'], ['#9DB4C0', '#7A93A1'], ['#4E6878', '#39505E'], ['#9CB59A', '#7C977B']],
  tree: ['#3F8A4A', '#4C9A52'], treeHi: '#6DB565', pond: '#4A9BC9', park: '#7DBB62', path: '#D7E4D2', field: '#86C46A', track: '#BFD6DA',
  suburb: '#6A9A5E', suburbGrid: '#A3C29C', core: '#6F8C99', coreGrid: '#A5BCC4', tower: '#4F6B78', towerHi: '#9DB6C0',
  fields: ['#7DB861', '#94C66B', '#6AA857', '#A9D07C', '#88BE68', '#5E9E5A'], forest: ['#3F7A4A', '#4A8650'],
  bank: '#8FC7B4', river: '#3F8FC0', riverHi: '#86C6E4', hw: '#E3ECE4',
  land: '#77AE60', shallow: ['#4F9DCB', '#66B2D8'], mtn: '#5A9361', mtnD: '#467A55', mtnHi: '#8CC17A', snow: '#F2F7F4', l5forest: '#5E9A57',
  ocean: '#2F78B2', oceanD: '#1C5A8E', oceanL: '#173F66', ice: '#E6F1F2', cloud: '#FFFFFF', cloudD: '#C9DCE6',
  shadow: 'rgba(16,40,26,',
};
const P = (f) => { const p = new Path2D(); f(p); return p; };

// ================================================================ shared geography (L5 km: x east, y south, origin = the city)
export const EARTH_KM = 6371;
export const ANCHOR = { lat: 28 * DEG, lon: 20 * DEG };   // the city; also the globe's view centre before it turns
export const P3 = [95, -60];                              // the neighbourhood's centre in L4 units (100 m)

export function buildGeo() {
  const coarse = [[-3000, -2600], [-2300, -3050], [-1500, -3350], [-900, -2850], [-300, -3000], [200, -3500], [1100, -3350], [1900, -3100],
    [2600, -2700], [3150, -2250], [2550, -1750], [3300, -1200], [2900, -700], [2300, -520], [1500, -420],
    [900, -330], [560, -200], [330, -150], [280, 40], [320, 300], [210, 540], [60, 700], [-80, 640], [-160, 420], [-190, 190], [-260, 0],
    [-360, -170], [-620, -280], [-1100, -240], [-1320, 60], [-1420, 520], [-1640, 600], [-1760, 140], [-1950, -460], [-2450, -760],
    [-3100, -1400], [-3300, -2100]];
  const continent = chaikin(fractal(coarse, 6, 0.13, 61), 1);
  const islands = [[130, 840, 42, 3], [-430, 300, 55, 4], [520, 150, 34, 5], [930, 320, 72, 6], [-760, 80, 30, 7], [1500, 160, 90, 8]]
    .map(([x, y, r, s]) => chaikin(fractal(blob(x, y, r, 12, 0.35, s), 4, 0.14, s + 20), 1));
  const isLand = (x, y) => inPoly(continent, x, y) || islands.some((I) => inPoly(I, x, y));
  // river: from the spine through the city to the west coast, cut where it leaves the land
  let rv = resample([[205, -262], [150, -185], [95, -120], [48, -58], [0, 0], [-52, 55], [-108, 108], [-160, 160], [-230, 215], [-300, 270], [-380, 330]], 4);
  const out = rv.findIndex((p, i) => i > 20 && !isLand(p[0], p[1]));
  if (out > 0) rv = rv.slice(0, out + 3);
  const river = chaikin(rv, 2, false);
  const suburb = blob(0, 0, 13.5, 64, 0.32, 3, 1.15, 0.9), core = blob(-2, 3, 6.2, 48, 0.3, 4, 1.1, 0.95);
  const R = rand(19), mtns = [];
  for (let i = 0; i < 16; i++) { const s = i / 15; mtns.push([190 - 30 * s + (R() - 0.5) * 50, -300 + 820 * s + (R() - 0.5) * 30, 34 + R() * 34, R()]); }
  for (let i = 0; i < 22; i++) { const s = i / 21; mtns.push([-1500 + 2500 * s + (R() - 0.5) * 120, -930 + 260 * Math.sin(s * 5) + (R() - 0.5) * 120, 45 + R() * 50, R()]); }
  const forests = [];
  for (const [cx, cy, n, r] of [[-60, -260, 40, 150], [60, 300, 30, 120], [-700, -600, 50, 260], [700, -800, 50, 300], [-1700, -1500, 60, 500], [1600, -1700, 60, 520]])
    for (let i = 0; i < n; i++) { const a = R() * TAU, d = Math.sqrt(R()) * r; forests.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d, 12 + R() * 26]); }
  const towns = [[-140, -150, 4], [120, 210, 3.5], [-60, 430, 3], [420, -300, 4.5], [-520, -420, 4], [260, -520, 3.5], [-900, -500, 5], [60, -700, 4]];
  const clouds = [];
  for (const [cx, cy, n] of [[-560, 430, 8], [-690, 130, 7], [470, 420, 7], [640, -40, 6], [-380, 760, 6], [350, 900, 8], [-900, -120, 7], [1100, 150, 8]]) {
    const parts = [];
    for (let i = 0; i < n; i++) parts.push([cx + (R() - 0.5) * 110, cy + (R() - 0.5) * 60, 14 + R() * 26]);
    clouds.push(parts);
  }
  return { continent, islands, isLand, river, suburb, core, mtns, forests, towns, clouds };
}

// ================================================================ L3: the neighbourhood (units m)
// Irregular blocks (Voronoi cells of a jittered 140 m grid, shrunk by half a street), three curving main roads,
// houses set along each block edge and turned with it, back gardens and trees inside, parks, a school yard.
export const P2 = [-43.75, 7.5];                         // the garden's centre in L3 (inside a block, among back gardens)
export const HOOD_ROADS = [
  [[-1300, -330], [-700, -260], [-200, -360], [300, -250], [800, -380], [1300, -300]],
  [[330, -1300], [250, -700], [380, -250], [260, 300], [420, 800], [350, 1300]],
  [[-1250, 900], [-800, 640], [-420, 480], [-80, 470], [300, 330]],
].map((r) => resample(chaikin(r, 3, false), 10));
const LIGHT = [-0.6, -0.8];

export function buildHood() {
  const R = rand(303), NB = 3, R0 = 760, R1 = 1150;
  const mk = () => Array.from({ length: NB + 1 }, () => new Path2D());
  const g = { roads: mk(), blocks: mk(), lawns: [mk(), mk(), mk()], drive: mk(), fence: mk(), roofL: LC.roofs.map(mk), roofS: LC.roofs.map(mk),
    flat: mk(), flatHi: mk(), hshadow: mk(), tshadow: mk(), crowns: [mk(), mk(), mk()], thi: mk(), park: mk(), pond: mk(), ppath: mk(),
    field: mk(), track: mk(), mainSide: mk(), mainRoad: mk(), lanes: mk(), stripes: new Path2D(), NB };
  const band = (x, y) => bandOf(Math.hypot(x, y), R0, R1, NB);
  const roadPts = HOOD_ROADS.flat();
  const roadDist = (x, y) => { let m = 1e9; for (const p of roadPts) { const d = Math.hypot(p[0] - x, p[1] - y); if (d < m) m = d; } return m; };
  const nearGarden = (x, y, r) => Math.abs(x - P2[0]) < 6 + r && Math.abs(y - P2[1]) < 7 + r;
  const tree = (x, y, r) => { const b = band(x, y); if (b < 0) return; addCircle(g.tshadow[b], x + r * 0.35, y + r * 0.5, r); addCircle(g.crowns[Math.floor(R() * 2.6)][b], x, y, r); addCircle(g.thi[b], x - r * 0.28, y - r * 0.32, r * 0.5); };
  const house = (cx, cy, ux, uy, w, d, pal, b) => {
    const vx = -uy, vy = ux, P = (a, c) => [cx + ux * a + vx * c, cy + uy * a + vy * c];
    addPoly(g.hshadow[b], [P(-w / 2, -d / 2), P(w / 2, -d / 2), P(w / 2, d / 2), P(-w / 2, d / 2)].map(([x, y]) => [x + 2.2, y + 3.2]));
    const F = [];
    if (w >= d) {   // hip roof, ridge along the street
      const e = d / 2;
      F.push([[P(-w / 2, -d / 2), P(w / 2, -d / 2), P(w / 2 - e, 0), P(-w / 2 + e, 0)], -vx, -vy], [[P(-w / 2, d / 2), P(-w / 2 + e, 0), P(w / 2 - e, 0), P(w / 2, d / 2)], vx, vy],
        [[P(-w / 2, -d / 2), P(-w / 2 + e, 0), P(-w / 2, d / 2)], -ux, -uy], [[P(w / 2, -d / 2), P(w / 2, d / 2), P(w / 2 - e, 0)], ux, uy]);
    } else {
      const e = w / 2;
      F.push([[P(-w / 2, -d / 2), P(0, -d / 2 + e), P(0, d / 2 - e), P(-w / 2, d / 2)], -ux, -uy], [[P(w / 2, -d / 2), P(w / 2, d / 2), P(0, d / 2 - e), P(0, -d / 2 + e)], ux, uy],
        [[P(-w / 2, -d / 2), P(w / 2, -d / 2), P(0, -d / 2 + e)], -vx, -vy], [[P(-w / 2, d / 2), P(0, d / 2 - e), P(w / 2, d / 2)], vx, vy]);
    }
    for (const [poly, nx, ny] of F) addPoly((nx * LIGHT[0] + ny * LIGHT[1] > 0 ? g.roofL : g.roofS)[pal][b], poly);
  };
  const flatRoof = (cx, cy, ux, uy, w, d, b) => {
    const vx = -uy, vy = ux, P = (a, c) => [cx + ux * a + vx * c, cy + uy * a + vy * c];
    addPoly(g.hshadow[b], [P(-w / 2, -d / 2), P(w / 2, -d / 2), P(w / 2, d / 2), P(-w / 2, d / 2)].map(([x, y]) => [x + 3.5, y + 5]));
    addPoly(g.flat[b], [P(-w / 2, -d / 2), P(w / 2, -d / 2), P(w / 2, d / 2), P(-w / 2, d / 2)]);
    addPoly(g.flatHi[b], [P(-w / 2 + 1.4, -d / 2 + 1.4), P(w / 2 - 1.4, -d / 2 + 1.4), P(w / 2 - 1.4, d / 2 - 1.4), P(-w / 2 + 1.4, d / 2 - 1.4)]);
  };
  // blocks: pin one site just south of the garden so the garden lies deep inside a block
  const cells = jitterVoronoi({ x0: -1500, y0: -1500, x1: 1500, y1: 1500, g: 140, jitter: 0.44, seed: 33, keep: (x, y) => x * x + y * y < 1260 * 1260,
    edit: (px, py) => { let best = 0; for (let i = 1; i < px.length; i++) if (Math.hypot(px[i] - P2[0], py[i] - P2[1]) < Math.hypot(px[best] - P2[0], py[best] - P2[1])) best = i; px[best] = P2[0] + 6; py[best] = P2[1] + 22; } });
  const near = (c, x, y) => Math.hypot(c.x - x, c.y - y) < 80;
  for (const [a, b] of cellEdges(cells)) { const bb = band((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); if (bb >= 0) { g.roads[bb].moveTo(a[0], a[1]); g.roads[bb].lineTo(b[0], b[1]); } }
  for (const c of cells) {
    const b = band(c.x, c.y); if (b < 0) continue;
    const Bp = insetConvex(c.poly, 7); if (Bp.length < 3) continue;
    addPoly(g.blocks[b], chaikin(Bp, 1));
    const inner = insetConvex(c.poly, 7.8); if (inner.length < 3) continue;
    const isOurs = inPoly(Bp, P2[0], P2[1]);
    if (isOurs) { g.ourBlock = addPoly(new Path2D(), chaikin(inner, 1)); for (let x = P2[0] - 40; x < P2[0] + 40; x += 3) g.stripes.rect(x, P2[1] - 34, 1.5, 68); }
    const xs = Bp.map((p) => p[0]), ys = Bp.map((p) => p[1]), bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
    const edgeDist = (x, y) => { let m = 1e9; for (let i = 0; i < Bp.length; i++) { const p = Bp[i], q = Bp[(i + 1) % Bp.length], l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1; m = Math.min(m, Math.abs((x - p[0]) * (q[1] - p[1]) - (y - p[1]) * (q[0] - p[0])) / l); } return m; };
    if ([[260, -560], [-560, 260], [640, 560], [-760, -160]].some(([x, y]) => near(c, x, y))) {        // parks
      addPoly(g.park[b], chaikin(inner, 2));
      const loop = insetConvex(c.poly, 26); if (loop.length >= 3) addPoly(g.ppath[b], chaikin(loop, 3), true);
      addPoly(g.pond[b], blob(c.x + 8, c.y + 4, 16, 40, 0.3, 9 + Math.round(c.x), 1.4, 0.8));
      for (let k = 0; k < 70; k++) { const x = bx0 + R() * (bx1 - bx0), y = by0 + R() * (by1 - by0); if (inPoly(Bp, x, y) && edgeDist(x, y) > 6 && Math.hypot((x - c.x - 8) / 1.4, (y - c.y - 4) / 0.8) > 24) tree(x, y, 3 + R() * 4); }
      continue;
    }
    if ([[-520, -620], [700, -60]].some(([x, y]) => near(c, x, y))) {                                // school yards
      const yard = insetConvex(c.poly, 12); if (yard.length >= 3) addPoly(g.field[b], chaikin(yard, 1));
      g.track[b].ellipse(c.x - 10, c.y + 6, 34, 22, 0.2, 0, TAU);
      flatRoof(c.x + 26, c.y - 34, 1, 0, 44, 16, b);
      continue;
    }
    const lawn = Math.floor(R() * 3), apart = !isOurs && R() < 0.1;
    addPoly(g.lawns[lawn][b], chaikin(inner, 1));
    const placed = [];
    for (let i = 0; i < Bp.length; i++) {                                       // houses along every street edge
      const a = Bp[i], q = Bp[(i + 1) % Bp.length], L = Math.hypot(q[0] - a[0], q[1] - a[1]);
      if (L < 26) continue;
      const ux = (q[0] - a[0]) / L, uy = (q[1] - a[1]) / L;
      let nx = -uy, ny = ux; if ((c.x - a[0]) * nx + (c.y - a[1]) * ny < 0) { nx = -nx; ny = -ny; }
      const step = apart ? 40 : 17 + R() * 6;
      for (let u = 11; u <= L - 11; u += step) {
        const w = apart ? 28 : 9 + R() * 4, d = apart ? 14 : 8.5 + R() * 3.5, set = apart ? 8 : 5 + R() * 2.5;
        const cx = a[0] + ux * u + nx * (set + d / 2), cy = a[1] + uy * u + ny * (set + d / 2);
        if (!inPoly(Bp, cx, cy) || edgeDist(cx, cy) < set + d / 2 - 0.5 || roadDist(cx, cy) < 21 || nearGarden(cx, cy, 8)) continue;
        if (placed.some((p) => Math.hypot(p[0] - cx, p[1] - cy) < (apart ? 30 : 13))) continue;
        placed.push([cx, cy]);
        // houses face the street they stand on: the roof ridge runs along it
        if (apart) flatRoof(cx, cy, ux, uy, w, d, b); else house(cx, cy, ux, uy, w, d, Math.floor(R() * LC.roofs.length), b);
        const dx = a[0] + ux * (u + w / 2 + 2.2), dy = a[1] + uy * (u + w / 2 + 2.2);
        addPoly(g.drive[b], [[dx, dy], [dx + ux * 3, dy + uy * 3], [dx + ux * 3 + nx * (set + 3), dy + uy * 3 + ny * (set + 3)], [dx + nx * (set + 3), dy + ny * (set + 3)]]);
        const fx = a[0] + ux * (u + step / 2), fy = a[1] + uy * (u + step / 2), fx1 = fx + nx * (set + d + 16), fy1 = fy + ny * (set + d + 16);
        if (!apart && u + step <= L - 11 && inPoly(Bp, fx1, fy1) && !nearGarden((fx + fx1) / 2, (fy + fy1) / 2, 10)) { g.fence[b].moveTo(fx + nx * 1.5, fy + ny * 1.5); g.fence[b].lineTo(fx1, fy1); }
      }
    }
    const nt = Math.round(((bx1 - bx0) * (by1 - by0) * 0.55) / 1100);       // trees in the back gardens
    for (let k = 0; k < nt; k++) {
      const x = bx0 + R() * (bx1 - bx0), y = by0 + R() * (by1 - by0), r = 2.4 + R() * 3.4;
      if (inPoly(Bp, x, y) && edgeDist(x, y) > 19 && roadDist(x, y) > 14 && !nearGarden(x, y, r + 2)) tree(x, y, r);
    }
  }
  tree(P2[0] + 10.5, P2[1] - 8, 3.4); tree(P2[0] - 11, P2[1] + 5, 2.8);
  // main roads: pavement, carriageway, centre dashes, a row of trees on each side
  for (const pts of HOOD_ROADS) {
    for (let i = 1; i < pts.length; i++) {
      const b = band(pts[i][0], pts[i][1]); if (b < 0) continue;
      for (const P of [g.mainSide[b], g.mainRoad[b]]) { P.moveTo(pts[i - 1][0], pts[i - 1][1]); P.lineTo(pts[i][0], pts[i][1]); }
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      g.lanes[b].moveTo(x0, y0); g.lanes[b].lineTo(x0 + (x1 - x0) * 0.45, y0 + (y1 - y0) * 0.45);
      if (i % 2 === 0) { const l = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / l, ny = (x1 - x0) / l; tree(x0 + nx * 15, y0 + ny * 15, 3.2 + R()); tree(x0 - nx * 15, y0 - ny * 15, 3.2 + R()); }
    }
  }
  // the garden seen from here (stand-ins of L2: beds, soil, plant dots, the hedge)
  g.beds = P((p) => { for (const b of BEDS) roundRect(p, P2[0] + (b.x - BED_W / 2 - 8) / 100, P2[1] + (b.y - BED_H / 2 - 8) / 100, (BED_W + 16) / 100, (BED_H + 16) / 100, 0.1); });
  g.bedSoil = P((p) => { for (const b of BEDS) roundRect(p, P2[0] + (b.x - BED_W / 2) / 100, P2[1] + (b.y - BED_H / 2) / 100, BED_W / 100, BED_H / 100, 0.05); });
  g.bedPlants = P((p) => { for (const b of BEDS) for (const dx of [-33, 33]) for (const dy of [-132, -66, 0, 66, 132]) addCircle(p, P2[0] + (b.x + dx) / 100, P2[1] + (b.y + dy) / 100, 0.19); });
  g.hedge = P((p) => { for (let x = -4; x <= 4.2; x += 0.34) addCircle(p, P2[0] + x, P2[1] - 5, 0.32); for (let y = -4.7; y <= 3.6; y += 0.34) addCircle(p, P2[0] + 4.4, P2[1] + y, 0.32); });
  return g;
}

export function drawHood(ctx, M, k, t, g, fa = 1) {
  ctx.globalAlpha = fa;
  ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const crowns = [LC.tree[0], LC.tree[1], '#3E7F6A'];
  for (let b = 0; b <= g.NB; b++) {
    const ba = fa * bandAlpha(b, g.NB);
    ctx.globalAlpha = ba;
    ctx.strokeStyle = LC.road; ctx.lineWidth = 14; ctx.stroke(g.roads[b]);
    ctx.fillStyle = LC.blockBase; ctx.fill(g.blocks[b]);
    for (let s = 0; s < 3; s++) { ctx.fillStyle = LC.lawns[s]; ctx.fill(g.lawns[s][b]); }
    ctx.fillStyle = LC.park; ctx.fill(g.park[b]); ctx.fillStyle = LC.field; ctx.fill(g.field[b]);
    ctx.strokeStyle = LC.path; ctx.lineWidth = 2.4; ctx.stroke(g.ppath[b]);
    ctx.strokeStyle = LC.track; ctx.lineWidth = 4; ctx.stroke(g.track[b]);
    ctx.fillStyle = LC.pond; ctx.fill(g.pond[b]);
    if (b === 0 && g.ourBlock) {
      const as = smooth((1.5 * k - 3) / 6);
      if (as > 0) { ctx.save(); ctx.clip(g.ourBlock); ctx.fillStyle = 'rgba(235,255,210,0.09)'; ctx.globalAlpha = ba * as; ctx.fill(g.stripes); ctx.restore(); ctx.globalAlpha = ba; }
    }
    ctx.fillStyle = LC.drive; ctx.fill(g.drive[b]);
    ctx.strokeStyle = 'rgba(40,84,52,0.55)'; ctx.lineWidth = 0.6; ctx.stroke(g.fence[b]);
    if (b === 0) {   // the garden, under everything that stands
      ctx.fillStyle = '#B6CFA2'; ctx.fill(g.beds); ctx.fillStyle = '#33412F'; ctx.fill(g.bedSoil);
      ctx.fillStyle = '#5FAE55'; ctx.fill(g.bedPlants); ctx.fillStyle = '#2E6A3E'; ctx.fill(g.hedge);
    }
    ctx.strokeStyle = LC.drive; ctx.lineWidth = 24; ctx.stroke(g.mainSide[b]);
    ctx.strokeStyle = '#587580'; ctx.lineWidth = 19; ctx.stroke(g.mainRoad[b]);
    ctx.strokeStyle = LC.lane; ctx.lineWidth = 0.7; ctx.stroke(g.lanes[b]);
    ctx.fillStyle = LC.shadow + '0.34)'; ctx.fill(g.hshadow[b]); ctx.fill(g.tshadow[b]);
    for (let p = 0; p < LC.roofs.length; p++) { ctx.fillStyle = LC.roofs[p][0]; ctx.fill(g.roofL[p][b]); ctx.fillStyle = LC.roofs[p][1]; ctx.fill(g.roofS[p][b]); }
    ctx.fillStyle = '#93A8AE'; ctx.fill(g.flat[b]); ctx.fillStyle = '#B4C6C9'; ctx.fill(g.flatHi[b]);
    for (let c = 0; c < 3; c++) { ctx.fillStyle = crowns[c]; ctx.fill(g.crowns[c][b]); }
    ctx.fillStyle = LC.treeHi; ctx.globalAlpha = ba * 0.6; ctx.fill(g.thi[b]);
  }
  ctx.globalAlpha = 1;
}

// ================================================================ L4: the city and its river (units 100 m, origin = city centre)
export function buildCity(geo) {
  const R = rand(404), N = makeNoise(44), NB = 3, R0 = 540, R1 = 780;
  const band = (x, y) => bandOf(Math.hypot(x, y), R0, R1, NB);
  const mk = () => Array.from({ length: NB + 1 }, () => new Path2D());
  const suburb = geo.suburb.map((p) => [p[0] * 10, p[1] * 10]), core = geo.core.map((p) => [p[0] * 10, p[1] * 10]);
  // the river: the L5 polyline ×10, plus meanders that die out before the faded rim (so it meets L5's river exactly)
  const base = resample(geo.river.map((p) => [p[0] * 10, p[1] * 10]), 4), river = [];
  for (let i = 0; i < base.length; i++) {
    const a = base[Math.max(0, i - 1)], b = base[Math.min(base.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const d = Math.hypot(base[i][0], base[i][1]), amp = 9 * (1 - smooth((d - 300) / 220));
    const o = amp * (N(i * 0.05, 3.3) + 0.5 * N(i * 0.13, 7.1));
    river.push([base[i][0] - ((b[1] - a[1]) / l) * o, base[i][1] + ((b[0] - a[0]) / l) * o]);
  }
  const riverS = chaikin(river, 2, false);
  const nearRiver = (x, y) => { for (let i = 0; i < riverS.length; i += 3) if (Math.abs(riverS[i][0] - x) < 12 && Math.abs(riverS[i][1] - y) < 12) return true; return false; };
  const cells = jitterVoronoi({ x0: -R1, y0: -R1, x1: R1, y1: R1, g: 22, jitter: 0.44, seed: 4, keep: (x, y) => x * x + y * y < R1 * R1 && !inPoly(suburb, x, y) });
  const fills = Array.from({ length: LC.fields.length + 2 }, mk);
  for (const c of cells) {
    const b = band(c.x, c.y); if (b < 0) continue;
    const f = N.fbm(c.x / 170, c.y / 170, 3), col = f > 0.12 ? LC.fields.length + (c.r < 0.5 ? 0 : 1) : Math.floor(c.r * LC.fields.length);
    addPoly(fills[col][b], c.poly.map(([x, y]) => { const dx = c.x - x, dy = c.y - y, l = Math.hypot(dx, dy) || 1, s = Math.min(0.8, l * 0.3) / l; return [x + dx * s, y + dy * s]; }));
  }
  // polylines split by falloff band
  const banded = (pts) => { const ps = mk(); for (let i = 1; i < pts.length; i++) { const b = band(pts[i][0], pts[i][1]); if (b < 0) continue; ps[b].moveTo(pts[i - 1][0], pts[i - 1][1]); ps[b].lineTo(pts[i][0], pts[i][1]); } return ps; };
  const riverP = banded(riverS);
  const roads = [];
  for (const a0 of [0.35, 1.45, 2.55, 3.55, 4.75, 5.22]) {
    const pts = [];
    for (let r = 55; r <= R1; r += 8) { const a = a0 + 0.25 * N(r / 160, a0 * 3); pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.95]); }
    roads.push(pts);
  }
  const roadP = mk(); for (const pts of roads) { const ps = banded(pts); for (let b = 0; b <= NB; b++) roadP[b].addPath(ps[b]); }
  const ring = []; for (let i = 0; i <= 64; i++) { const a = (i / 64) * TAU; ring.push([Math.cos(a) * 78, Math.sin(a) * 62]); }
  roadP[0].addPath(addPoly(new Path2D(), ring));
  const lakes = P((p) => { for (const [x, y, r, s] of [[-260, 330, 20, 1], [380, 250, 15, 2], [-430, -250, 22, 3], [250, -420, 12, 4]]) addPoly(p, blob(x, y, r, 30, 0.35, s, 1.3, 0.8)); });
  const grid = (poly, step) => P((p) => { const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
    for (let x = Math.floor(Math.min(...xs) / step) * step; x < Math.max(...xs); x += step) { p.moveTo(x, Math.min(...ys)); p.lineTo(x, Math.max(...ys)); }
    for (let y = Math.floor(Math.min(...ys) / step) * step; y < Math.max(...ys); y += step) { p.moveTo(Math.min(...xs), y); p.lineTo(Math.max(...xs), y); } });
  const tw = []; for (let i = 0; i < 70; i++) { const a = R() * TAU, d = Math.sqrt(R()) * 52; tw.push([-20 + Math.cos(a) * d * 1.1, 30 + Math.sin(a) * d, 1.6 + R() * 2.6, 1.6 + R() * 2.6]); }
  const towers = P((p) => { for (const [x, y, w, h] of tw) p.rect(x + 0.5, y + 0.7, w, h); });
  const towersHi = P((p) => { for (const [x, y, w, h] of tw) p.rect(x, y, w, h); });
  // the suburb seen from far away: a patchwork of neighbourhood tones crossed by straight main roads
  const sx = suburb.map((q) => q[0]), sy = suburb.map((q) => q[1]), major = new Path2D();
  const patch = [new Path2D(), new Path2D(), new Path2D()];
  for (let x = P3[0] - 1.26 - 7.6 * 30; x < Math.max(...sx); x += 7.6) for (let y = P3[1] - 0.5 - 7.36 * 30; y < Math.max(...sy); y += 7.36) {
    if (x + 7.6 < Math.min(...sx) || y + 7.36 < Math.min(...sy)) continue;
    patch[Math.floor(R() * 3)].rect(x, y, 7.6, 7.36);
  }
  for (let i = Math.ceil((Math.min(...sx) - P3[0] + 1.26) / 7.6); P3[0] - 1.26 + 7.6 * i < Math.max(...sx); i++) {
    const x = P3[0] - 1.26 + 7.6 * i; major.moveTo(x, Math.min(...sy)); major.lineTo(x, Math.max(...sy));
  }
  for (let j = Math.ceil((Math.min(...sy) - P3[1] + 0.5) / 7.36); P3[1] - 0.5 + 7.36 * j < Math.max(...sy); j++) {
    const y = P3[1] - 0.5 + 7.36 * j; major.moveTo(Math.min(...sx), y); major.lineTo(Math.max(...sx), y);
  }
  const parkStrip = P((p) => { for (let i = 0; i < riverS.length; i += 2) { const [x, y] = riverS[i]; if (inPoly(core, x, y) || inPoly(suburb, x, y)) addCircle(p, x, y, 9); } });
  return { NB, fills, riverP, roadP, lakes, suburbP: addPoly(new Path2D(), suburb), coreP: addPoly(new Path2D(), core),
    subMajor: major, patch, net: P((p) => {
      const cs = jitterVoronoi({ x0: P3[0] - 42, y0: P3[1] - 42, x1: P3[0] + 42, y1: P3[1] + 42, g: 1.4, jitter: 0.44, seed: 34, keep: (x, y) => Math.hypot(x - P3[0], y - P3[1]) < 40 && inPoly(suburb, x, y) });
      for (const [a, b] of cellEdges(cs)) { p.moveTo(a[0], a[1]); p.lineTo(b[0], b[1]); }
    }), hoodRoads: P((p) => { for (const r of HOOD_ROADS) addPoly(p, r.map(([x, y]) => [P3[0] + x / 100, P3[1] + y / 100])); }), coreGrid: grid(core, 2.5), towers, towersHi, parkStrip, n: cells.length };
}

export function drawCity(ctx, M, k, t, c, fa = 1) {
  ctx.globalAlpha = fa;
  ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const px = (v) => Math.max(v, 0) / k;
  for (let b = 0; b <= c.NB; b++) {
    ctx.globalAlpha = fa * bandAlpha(b, c.NB);
    for (let i = 0; i < c.fills.length; i++) { ctx.fillStyle = i < LC.fields.length ? LC.fields[i] : LC.forest[i - LC.fields.length]; ctx.fill(c.fills[i][b]); }
  }
  ctx.globalAlpha = fa * 1;
  ctx.fillStyle = LC.suburb; ctx.fill(c.suburbP);
  ctx.save(); ctx.clip(c.suburbP);
  ctx.globalAlpha = fa * 0.3; ['#72A066', '#62905A', '#6E9870'].forEach((col, i) => { ctx.fillStyle = col; ctx.fill(c.patch[i]); });
  const af = smooth((0.92 * k - 2.5) / 6);          // close up: the neighbourhood's own main roads carry on, fading out
  if (af > 0) {
    const rg = ctx.createRadialGradient(P3[0], P3[1], 9, P3[0], P3[1], 17);
    rg.addColorStop(0, 'rgba(88,117,128,0.95)'); rg.addColorStop(1, 'rgba(88,117,128,0)');
    ctx.strokeStyle = rg; ctx.globalAlpha = fa * af; ctx.lineWidth = 0.19; ctx.stroke(c.hoodRoads);
  }
  const an = smooth((1.4 * k - 3) / 8);               // mid-range: an irregular street net like the neighbourhood's, fading outwards
  if (an > 0) {
    const ng = ctx.createRadialGradient(P3[0], P3[1], 10, P3[0], P3[1], 38);
    ng.addColorStop(0, 'rgba(79,108,118,0.8)'); ng.addColorStop(1, 'rgba(79,108,118,0)');
    ctx.strokeStyle = ng; ctx.globalAlpha = fa * an; ctx.lineWidth = 0.14; ctx.stroke(c.net);
  }
  ctx.strokeStyle = LC.suburbGrid; ctx.globalAlpha = fa * 0.4 * (1 - af); ctx.lineWidth = Math.max(0.2, px(0.9)); ctx.stroke(c.subMajor);
  ctx.restore();
  ctx.globalAlpha = fa * 1; ctx.fillStyle = LC.core; ctx.fill(c.coreP);
  ctx.save(); ctx.clip(c.coreP); ctx.strokeStyle = LC.coreGrid; ctx.globalAlpha = fa * 0.8; ctx.lineWidth = Math.max(0.35, px(0.7)); ctx.stroke(c.coreGrid); ctx.restore();
  ctx.globalAlpha = fa * 1; ctx.fillStyle = LC.tower; ctx.fill(c.towers); ctx.fillStyle = LC.towerHi; ctx.fill(c.towersHi);
  ctx.fillStyle = LC.park; ctx.fill(c.parkStrip);
  for (let b = 0; b <= c.NB; b++) {
    ctx.globalAlpha = fa * bandAlpha(b, c.NB);
    ctx.strokeStyle = LC.road; ctx.lineWidth = Math.max(0.5, px(2.4)); ctx.globalAlpha *= 0.55; ctx.stroke(c.roadP[b]);
    ctx.globalAlpha = fa * bandAlpha(b, c.NB);
    ctx.strokeStyle = LC.hw; ctx.lineWidth = Math.max(0.3, px(1.3)); ctx.stroke(c.roadP[b]);
    ctx.strokeStyle = LC.bank; ctx.lineWidth = Math.max(4.4, px(5)); ctx.stroke(c.riverP[b]);
    ctx.strokeStyle = LC.river; ctx.lineWidth = Math.max(2.8, px(3)); ctx.stroke(c.riverP[b]);
  }
  ctx.globalAlpha = fa * 1;
  ctx.strokeStyle = LC.bank; ctx.lineWidth = Math.max(1.6, px(2)); ctx.stroke(c.lakes);
  ctx.fillStyle = LC.river; ctx.fill(c.lakes);
}

// ================================================================ the globe: orthographic view, unit vectors baked in setup
/** the inverse azimuthal-equidistant map: km (x east, y south) around (lat0, lon0) → unit vector (Earth-fixed) */
export function kmToUnit(x, y, lat0 = ANCHOR.lat, lon0 = ANCHOR.lon) {
  const n = -y, rho = Math.hypot(x, n), c = rho / EARTH_KM;
  let lat = lat0, lon = lon0;
  if (rho > 1e-9) {
    lat = Math.asin(Math.cos(c) * Math.sin(lat0) + (n * Math.sin(c) * Math.cos(lat0)) / rho);
    lon = lon0 + Math.atan2(x * Math.sin(c), rho * Math.cos(lat0) * Math.cos(c) - n * Math.sin(lat0) * Math.sin(c));
  }
  return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
}
const units = (pts, lat0, lon0) => { const U = new Float64Array(pts.length * 3); pts.forEach((p, i) => U.set(kmToUnit(p[0], p[1], lat0, lon0), i * 3)); return U; };
export const RE = 637.1;                                  // Earth radius in L6 units (10 km)
/** view: the globe turned so (lat0, lon0) faces the camera */
export function view(lon0, lat0) { return { cl: Math.cos(lon0), sl: Math.sin(lon0), cp: Math.cos(lat0), sp: Math.sin(lat0) }; }
export function proj(V, ux, uy, uz) {
  const x = ux * V.cl - uz * V.sl, z1 = ux * V.sl + uz * V.cl;
  return [x * RE, -(uy * V.cp - z1 * V.sp) * RE, uy * V.sp + z1 * V.cp];
}
/** project a polygon of unit vectors; hidden points slide to the limb. Returns null if wholly hidden. */
export function projPoly(V, U) {
  const out = []; let vis = false;
  for (let i = 0; i < U.length; i += 3) {
    let [x, y, z] = proj(V, U[i], U[i + 1], U[i + 2]);
    if (z > 0) vis = true; else { const l = Math.hypot(x, y) || 1; x *= RE / l; y *= RE / l; }
    out.push([x, y]);
  }
  return vis ? out : null;
}
/** the L5 → L6 anchor: position of the city on the globe + the local Jacobian (L6 units per km) */
export function anchorAffine(V) {
  const e = (x, y) => { const u = kmToUnit(x, y); return proj(V, u[0], u[1], u[2]); };
  const c = e(0, 0), ex0 = e(-1, 0), ex1 = e(1, 0), ey0 = e(0, -1), ey1 = e(0, 1);
  return [(ex1[0] - ex0[0]) / 2, (ex1[1] - ex0[1]) / 2, (ey1[0] - ey0[0]) / 2, (ey1[1] - ey0[1]) / 2, c[0], c[1]];
}

export function buildEarth(geo) {
  const R = rand(606);
  const others = [[[5, -45], 2300, 11], [[-24, 34], 2000, 12], [[4, 86], 1500, 13], [[-52, -20], 900, 14]].map(([[la, lo], r, s]) => {
    const poly = chaikin(fractal(blob(0, 0, r, 14, 0.45, s, 1.1, 0.85), 5, 0.14, s + 5), 1);
    return units(poly, la * DEG, lo * DEG);
  });
  const land = [units(geo.continent), ...geo.islands.map((I) => units(I)), ...others];
  const capPts = []; for (let i = 0; i < 160; i++) { const lo = (i / 160) * TAU, la = (73 + 3 * Math.sin(lo * 5 + 1) + 2 * Math.sin(lo * 11)) * DEG; capPts.push([Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)]); }
  const cap = Float64Array.from(capPts.flat());
  const mtns = geo.mtns.map(([x, y, r]) => [kmToUnit(x, y), r]);
  const clouds = [];
  for (const [la0, lo0, n, sp] of [[64, -5, 34, 30], [66, 52, 30, 26], [34, -48, 26, 22], [-38, -30, 46, 40], [-44, 50, 40, 36], [4, -15, 34, 30], [6, 58, 28, 26], [-14, 84, 18, 18], [18, 72, 16, 14]]) {
    for (let i = 0; i < n; i++) {
      const la = (la0 + (R() - 0.5) * 9 + Math.sin(i * 0.6) * 4) * DEG, lo = (lo0 + (i - n / 2) * sp / n * 2 + (R() - 0.5) * 6) * DEG;
      clouds.push([Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo), 70 + R() * 170]);
    }
  }
  const stars = []; const RS = rand(707);
  for (let i = 0; i < 140; i++) stars.push([RS() * 1080, RS() * 1920, 0.6 + RS() * 1.6, RS()]);
  return { land, cap, mtns, clouds, stars };
}

export function drawEarth(ctx, M, k, t, E, V, cloudSpin) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const sg = ctx.createLinearGradient(0, 0, 0, 1920); sg.addColorStop(0, '#0A1622'); sg.addColorStop(1, '#10273A');
  ctx.fillStyle = sg; ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = '#DCEBF5';
  for (const [x, y, r, a] of E.stars) { ctx.globalAlpha = 0.25 + 0.55 * a * (0.75 + 0.25 * Math.sin(t * 2 + a * 40)); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
  let g = ctx.createRadialGradient(0, 0, RE * 0.96, 0, 0, RE * 1.16);
  g.addColorStop(0, 'rgba(120,200,240,0.55)'); g.addColorStop(0.35, 'rgba(90,170,230,0.22)'); g.addColorStop(1, 'rgba(60,140,220,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, RE * 1.16, 0, TAU); ctx.fill();
  g = ctx.createRadialGradient(0, 0, 0, 0, 0, RE);
  g.addColorStop(0, LC.ocean); g.addColorStop(0.7, '#2A6EA6'); g.addColorStop(1, LC.oceanD);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, RE, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, RE, 0, TAU); ctx.clip();
  const lp = new Path2D();
  for (const U of E.land) { const pts = projPoly(V, U); if (pts) addPoly(lp, pts); }
  ctx.strokeStyle = LC.shallow[0]; ctx.globalAlpha = 0.8; ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.stroke(lp); ctx.globalAlpha = 1;
  ctx.fillStyle = LC.land; ctx.fill(lp);
  ctx.fillStyle = LC.mtn; ctx.globalAlpha = 0.85;
  ctx.beginPath();
  for (const [u, r] of E.mtns) { const [x, y, z] = proj(V, u[0], u[1], u[2]); if (z > 0.05) { ctx.moveTo(x + r / 10, y); ctx.ellipse(x, y, r / 10, (r / 10) * 0.72, 0, 0, TAU); } }
  ctx.fill(); ctx.globalAlpha = 1;
  const cp = projPoly(V, E.cap); if (cp) { ctx.fillStyle = LC.ice; ctx.beginPath(); cp.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.fill(); }
  // clouds turn a little faster than the ground
  const Vc = view(Math.atan2(V.sl, V.cl) - cloudSpin, Math.atan2(V.sp, V.cp));
  const cs = new Path2D(), cw = new Path2D();
  for (const [ux, uy, uz, r] of E.clouds) {
    const [x, y, z] = proj(Vc, ux, uy, uz); if (z < 0.02) continue;
    const rr = (r / 10) * (0.55 + 0.45 * z), sq = 0.35 + 0.65 * z;      // zonal streaks, foreshortened towards the limb
    addEllipse(cs, x + rr * 0.2, y + rr * 0.26, rr * 1.75, rr * 0.62 * sq, Math.atan2(y, x) * 0.15); addEllipse(cw, x, y, rr * 1.75, rr * 0.62 * sq, Math.atan2(y, x) * 0.15);
  }
  ctx.fillStyle = 'rgba(150,190,212,0.35)'; ctx.fill(cs);
  ctx.fillStyle = 'rgba(255,255,255,0.74)'; ctx.fill(cw);
  // night side and limb light (sun from the upper left)
  g = ctx.createRadialGradient(-RE * 0.42, -RE * 0.5, RE * 0.2, -RE * 0.3, -RE * 0.36, RE * 1.75);
  g.addColorStop(0, 'rgba(10,22,34,0)'); g.addColorStop(0.55, 'rgba(10,22,34,0.08)'); g.addColorStop(0.82, 'rgba(10,22,34,0.5)'); g.addColorStop(1, 'rgba(8,16,26,0.78)');
  ctx.fillStyle = g; ctx.fillRect(-RE, -RE, RE * 2, RE * 2);
  ctx.restore();
  ctx.strokeStyle = 'rgba(200,236,255,0.55)'; ctx.lineWidth = 2.2 / k * 1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, RE, 160 * DEG, 290 * DEG); ctx.stroke();
}

// ================================================================ L5: the peninsula (units km, origin = the city)
export function buildPeninsula(geo, E) {
  const landU = E.land.slice(0, 1 + geo.islands.length);       // the very same unit vectors the globe draws
  const m = geo.mtns, top = m.map((q) => q[2]).sort((a, b) => b - a)[5];
  // mountains as low cones seen from above: a lit north-west half and a shaded south-east half
  const half = (p, x, y, r, a0) => { p.moveTo(x + Math.cos(a0) * r, y + Math.sin(a0) * r * 0.72); p.ellipse(x, y, r, r * 0.72, 0, a0, a0 + Math.PI); };
  const mtShade = P((p) => { for (const [x, y, r] of m) half(p, x + r * 0.05, y + r * 0.07, r * 1.04, -0.55); });
  const mtBase = P((p) => { for (const [x, y, r] of m) addEllipse(p, x, y, r, r * 0.72); });
  const mtHi = P((p) => { for (const [x, y, r] of m) half(p, x, y, r * 0.97, Math.PI - 0.55); });
  const snow = P((p) => { for (const [x, y, r] of m) if (r >= top) { p.moveTo(x, y - r * 0.26); p.lineTo(x + r * 0.2, y + r * 0.04); p.lineTo(x - r * 0.24, y + r * 0.02); } });
  // farmland mottling around the city, so the land beyond the city's own fields is not bare
  const RM = rand(515), farm = Array.from({ length: LC.fields.length }, () => Array.from({ length: 4 }, () => new Path2D()));
  for (const c of jitterVoronoi({ x0: -470, y0: -470, x1: 470, y1: 470, g: 12, jitter: 0.44, seed: 52, keep: (x, y) => x * x + y * y < 470 * 470 })) {
    const b = bandOf(Math.hypot(c.x, c.y), 260, 470, 3); if (b < 0) continue;
    addPoly(farm[Math.floor(RM() * LC.fields.length)][b], c.poly);
  }
  const forest = P((p) => { for (const [x, y, r] of geo.forests) addCircle(p, x, y, r); });
  const river = addPoly(new Path2D(), geo.river);
  const towns = P((p) => { for (const [x, y, r] of geo.towns) addCircle(p, x, y, r); });
  const cw = new Path2D(), cs = new Path2D(), csh = new Path2D();
  for (const parts of geo.clouds) for (const [x, y, r] of parts) { addCircle(cw, x, y, r); addCircle(cs, x + r * 0.14, y + r * 0.2, r); addCircle(csh, x + 34, y + 48, r); }
  return { landU, mtShade, mtBase, mtHi, snow, forest, river, towns, cw, cs, csh, farm,
    suburb: addPoly(new Path2D(), geo.suburb), core: addPoly(new Path2D(), geo.core) };
}

/** A5inv: L6 → L5 (km). The coast is the globe's outline re-expressed in this level's km around the anchor, so the
 *  flat level and the curved globe share one outline at every zoom (the anchor carries only position + Jacobian). */
export function drawPeninsula(ctx, M, k, t, Pn, V, A5inv, fa) {
  ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
  ctx.globalAlpha = fa; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const lp = new Path2D();
  for (const U of Pn.landU) { const pts = projPoly(V, U); if (pts) addPoly(lp, pts.map(([x, y]) => Af.ap(A5inv, x, y))); }
  const px = (v) => v / k;
  ctx.strokeStyle = LC.shallow[0]; ctx.globalAlpha = fa * 0.75; ctx.lineWidth = Math.max(26, px(3)); ctx.stroke(lp);
  ctx.strokeStyle = LC.shallow[1]; ctx.globalAlpha = fa * 0.9; ctx.lineWidth = Math.max(11, px(1.5)); ctx.stroke(lp);
  ctx.globalAlpha = fa; ctx.fillStyle = LC.land; ctx.fill(lp);
  ctx.save(); ctx.clip(lp);
  for (let i = 0; i < Pn.farm.length; i++) for (let b = 0; b < 4; b++) { ctx.fillStyle = LC.fields[i]; ctx.globalAlpha = fa * 0.5 * bandAlpha(b, 3); ctx.fill(Pn.farm[i][b]); }
  ctx.fillStyle = LC.l5forest; ctx.globalAlpha = fa * 0.8; ctx.fill(Pn.forest);
  ctx.globalAlpha = fa;
  ctx.fillStyle = LC.mtn; ctx.fill(Pn.mtBase); ctx.fillStyle = LC.mtnD; ctx.fill(Pn.mtShade);
  ctx.fillStyle = LC.mtnHi; ctx.globalAlpha = fa * 0.8; ctx.fill(Pn.mtHi);
  ctx.globalAlpha = fa; ctx.fillStyle = LC.snow; ctx.fill(Pn.snow);
  ctx.restore();
  ctx.strokeStyle = 'rgba(232,247,250,0.55)'; ctx.lineWidth = px(1.2); ctx.stroke(lp);
  ctx.strokeStyle = LC.river; ctx.lineWidth = Math.max(2.4, px(1.6)); ctx.stroke(Pn.river);
  ctx.fillStyle = LC.suburb; ctx.fill(Pn.suburb); ctx.fillStyle = LC.core; ctx.fill(Pn.core);
  ctx.fillStyle = '#8EA6AC'; ctx.fill(Pn.towns);
  ctx.fillStyle = 'rgba(14,40,60,0.18)'; ctx.fill(Pn.csh);
  ctx.fillStyle = LC.cloudD; ctx.globalAlpha = fa * 0.9; ctx.fill(Pn.cs);
  ctx.fillStyle = LC.cloud; ctx.globalAlpha = fa * 0.95; ctx.fill(Pn.cw);
  ctx.globalAlpha = 1;
}

// ================================================================ clouds with altitude (L4 ground units + height in m)
export function buildAirClouds() {
  const R = rand(808), out = [];
  for (let i = 0; i < 64; i++) {
    const near = i < 30;
    const x = P3[0] + (near ? (R() - 0.5) * 170 : (R() - 0.5) * 1400), y = P3[1] + (near ? (R() - 0.5) * 280 : (R() - 0.5) * 1400);
    const h = 1800 + Math.pow(R(), 0.9) * 4200, n = 5 + Math.floor(R() * 5), s = 2.6 + R() * 5;
    const parts = [];
    for (let j = 0; j < n; j++) { const a = (j / n) * TAU + R(); parts.push([Math.cos(a) * s * (0.4 + R() * 0.8), Math.sin(a) * s * (0.25 + R() * 0.45), s * (0.45 + R() * 0.55)]); }
    parts.sort((p, q) => p[1] - q[1]);
    out.push({ x, y, h, parts, size: s * 1.6 });
  }
  return out;
}
/** perspective of a camera at height H looking straight down: a point at height h appears scaled by H / (H − h)
 *  about the image centre F. M4 maps ground (L4 units) to screen; k4 its px per unit. */
export function drawAirClouds(ctx, M4, k4, H, F, clouds, fa) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const sh = new Path2D();
  for (const c of clouds) {
    if (H < c.h * 1.15) continue;
    const kz = H / (H - c.h), a = fa * (1 - smooth((kz - 2.0) / 2.6)) * smooth((c.size * k4 * kz - 14) / 40);
    if (a <= 0.01) continue;
    for (const [dx, dy, r] of c.parts) { const [x, y] = Af.ap(M4, c.x + dx + c.h * 0.0042, c.y + dy + c.h * 0.006); addCircle(sh, x, y, r * k4); }
  }
  ctx.fillStyle = 'rgba(14,40,60,0.15)'; ctx.globalAlpha = 1; ctx.fill(sh);
  for (const c of clouds) {
    if (H < c.h * 1.15) continue;
    const kz = H / (H - c.h), a = fa * (1 - smooth((kz - 2.0) / 2.6)) * smooth((c.size * k4 * kz - 14) / 40);
    if (a <= 0.01) continue;
    const [sx, sy] = Af.ap(M4, c.x, c.y), cx = F[0] + (sx - F[0]) * kz, cy = F[1] + (sy - F[1]) * kz, s = k4 * kz;
    if (cx < -900 || cx > 1980 || cy < -900 || cy > 2820) continue;
    ctx.globalAlpha = a * 0.95; ctx.fillStyle = LC.cloudD; ctx.beginPath();
    for (const [dx, dy, r] of c.parts) { ctx.moveTo(cx + (dx + r * 0.12) * s + r * s, cy + (dy + r * 0.18) * s); ctx.arc(cx + (dx + r * 0.12) * s, cy + (dy + r * 0.18) * s, r * s, 0, TAU); }
    ctx.fill();
    ctx.fillStyle = LC.cloud; ctx.beginPath();
    for (const [dx, dy, r] of c.parts) { ctx.moveTo(cx + dx * s + r * s, cy + dy * s); ctx.arc(cx + dx * s, cy + dy * s, r * s, 0, TAU); }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
