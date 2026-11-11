/*
 * town.js — the invented crossroads seen from the window: ground plates, blocks with windows, props, and the shadow
 * casters. The camera never moves, so every screen polygon is projected once in setup; a frame only re-colours them
 * from the light of its scene time, switches lights by the shutter, and projects the moving shadows.
 *
 * Layout (metres; X right, Z away from the window):
 *   plaza Z < 13 · near sidewalk 13–16 · main street 16–32 (car lane, tram island, two tram tracks, island, car lane)
 *   far sidewalk 32–35 · blocks Z ≥ 35 · a cross street |X| < 6 runs away from the junction toward the mountains.
 */
import { clamp, rand } from '../_lib/stage.js';
import { DEG, HC, proj, hex, mix, mul, scale, add, css, shade, pxPerM } from './cam.js';
import { switchedOn, occupancy } from './clock.js';

export const ZS = { plaza: 13, nearWalk: 16, ebLane: 17.75, ebIsland: [19.5, 21], ebTrack: 22.4, wbTrack: 25.6, wbIsland: [27, 28.5], wbLane: 30.25, road1: 32, farWalk: 35 };
export const XS = { street: 6, walk: 9 };

const A = {
  asphalt: hex('#5b6273'), asphaltFar: hex('#6d7381'), walk: hex('#dacdb6'), plaza: hex('#e4d3b3'), plazaDark: hex('#d3bf9c'),
  stripe: hex('#f1ece2'), trackBed: hex('#a39b8e'), rail: hex('#4a4c55'), island: hex('#cfc0a7'), grass: hex('#93b571'),
  ground: hex('#a7ab8e'),
};

// ---------------------------------------------------------------- polygons
function poly(pts, alb, y = 0) { return { pts, alb, y, scr: pts.map(([x, z]) => proj(x, y, z)) }; }
const rect = (x0, x1, z0, z1, alb, y = 0) => poly([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], alb, y);

export function buildGround() {
  const G = [];
  const FAR = 900, WIDE = 900;
  G.push(poly([[-WIDE, ZS.farWalk], [WIDE, ZS.farWalk], [WIDE * 3, FAR * 3], [-WIDE * 3, FAR * 3]], A.ground));   // beyond: town ground
  G.push(rect(-WIDE, WIDE, -2, ZS.plaza, A.plaza));
  // plaza paving rings and two lawns
  G.push(rect(-60, -10.5, 5, 11.6, A.grass), rect(13.5, 60, 5, 11.6, A.grass));
  // paving: a ring of darker setts around the tree, a band along the street edge, joints every 2 m
  for (let x = -40; x <= 40; x += 2) G.push(rect(x - 0.035, x + 0.035, 4, 12.8, A.plazaDark, 0.005));
  for (let z = 4; z <= 12.8; z += 2) G.push(rect(-40, 40, z - 0.035, z + 0.035, A.plazaDark, 0.005));
  G.push(rect(-60, 60, 12.0, 12.9, A.plazaDark, 0.004));

  G.push(rect(-WIDE, WIDE, ZS.plaza, ZS.nearWalk, A.walk));
  G.push(rect(-WIDE, WIDE, ZS.nearWalk, ZS.road1, A.asphalt));
  G.push(rect(-WIDE, WIDE, ZS.road1, ZS.farWalk, A.walk));
  // cross street and its sidewalks, running to the far town
  G.push(rect(-XS.walk, XS.walk, ZS.farWalk, 640, A.walk));
  G.push(rect(-XS.street, XS.street, ZS.road1, 640, A.asphalt));
  // tram bed and islands
  G.push(rect(-WIDE, WIDE, ZS.ebTrack - 1.25, ZS.wbTrack + 1.25, A.trackBed));
  G.push(rect(-21, -2.5, ZS.ebIsland[0], ZS.ebIsland[1], A.island, 0.18));
  G.push(rect(2.5, 23, ZS.wbIsland[0], ZS.wbIsland[1], A.island, 0.18));
  // markings: crosswalks over the main street (both sides of the junction), over the cross street, stop lines, lane dashes
  const stripes = (xa, xb, za, zb, along) => {
    if (along === 'z') for (let z = za; z < zb - 0.3; z += 1.1) G.push(rect(xa, xb, z, z + 0.55, A.stripe, 0.01));
    else for (let x = xa; x < xb - 0.3; x += 1.1) G.push(rect(x, x + 0.55, za, zb, A.stripe, 0.01));
  };
  stripes(-11.2, -8.4, ZS.nearWalk, ZS.ebIsland[0], 'z'); stripes(-11.2, -8.4, ZS.wbIsland[1], ZS.road1, 'z');
  stripes(8.4, 11.2, ZS.nearWalk, ZS.ebIsland[0], 'z'); stripes(8.4, 11.2, ZS.wbIsland[1], ZS.road1, 'z');
  stripes(-XS.street, XS.street, 35.6, 38.4, 'x');
  G.push(rect(-12.2, -11.85, ZS.nearWalk, ZS.ebIsland[0], A.stripe, 0.01), rect(11.85, 12.2, ZS.wbIsland[1], ZS.road1, A.stripe, 0.01));
  G.push(rect(-XS.street, 0, 39.3, 39.65, A.stripe, 0.01));
  for (let x = -60; x < 60; x += 6) if (x > 12 || x < -16) G.push(rect(x, x + 3, 19.3, 19.45, A.stripe, 0.01), rect(x, x + 3, 28.55, 28.7, A.stripe, 0.01));
  for (let z = 44; z < 640; z += 7) G.push(rect(-0.08, 0.08, z, z + 3.5, A.stripe, 0.01));
  return G;
}
/** rails: thin dark lines, drawn as quads */
export function buildRails() {
  const R = [];
  for (const zc of [ZS.ebTrack, ZS.wbTrack]) for (const o of [-0.72, 0.72]) R.push(rect(-900, 900, zc + o - 0.06, zc + o + 0.06, A.rail, 0.02));
  return R;
}

// ---------------------------------------------------------------- blocks
const FACADES = ['#f0dcb8', '#e8bf92', '#b9cba3', '#a3c0c6', '#ecd395', '#c9bcd8', '#e8caa8'].map(hex);
const ROOFS = ['#5c6474', '#8a6552', '#6c7d7a', '#7a6f86'].map(hex);
const GLASS = hex('#5b6b80');
const WARM = ['#ffd9a0', '#ffe4bd', '#ffcd8a', '#fff0d6'].map(hex);

function face(pts, n, alb) { return { pts, n, alb, scr: pts.map((p) => proj(p[0], p[1], p[2])) }; }
/**
 * A box block: faces that look at the camera (n·(C − P) > 0), roof if below the camera, and a window grid on the
 * visible walls. Each window carries its own light schedule.
 */
function block(b, r, opts = {}) {
  const { x0, x1, z0, z1, h } = b;
  const alb = b.alb || FACADES[Math.floor(r() * FACADES.length)], roof = ROOFS[Math.floor(r() * ROOFS.length)];
  const faces = [], windows = [], shops = [];
  const C = [0, HC, 0];
  const walls = [
    { n: [0, 0, -1], P: [[x0, 0, z0], [x1, 0, z0]], at: [x0, 0, z0] },
    { n: [1, 0, 0], P: [[x1, 0, z0], [x1, 0, z1]], at: [x1, 0, z0] },
    { n: [-1, 0, 0], P: [[x0, 0, z1], [x0, 0, z0]], at: [x0, 0, z0] },
  ];
  for (const w of walls) {
    const vis = w.n[0] * (C[0] - w.at[0]) + w.n[2] * (C[2] - w.at[2]);
    if (vis <= 0) continue;
    const [a, c] = w.P;
    faces.push(face([[a[0], 0, a[2]], [c[0], 0, c[2]], [c[0], h, c[2]], [a[0], h, a[2]]], w.n, alb));
    // cornice band
    faces.push(face([[a[0], h - 0.7, a[2]], [c[0], h - 0.7, c[2]], [c[0], h, c[2]], [a[0], h, a[2]]], w.n, mul(alb, [0.82, 0.8, 0.8])));
    if (opts.windows === false) continue;
    const len = Math.hypot(c[0] - a[0], c[2] - a[2]), ux = (c[0] - a[0]) / len, uz = (c[2] - a[2]) / len;
    const gf = opts.ground ?? 4.2, fh = 3.2, ww = opts.ww ?? 1.25, wh = opts.wh ?? 1.6, pitch = opts.pitch ?? 3;
    const floors = Math.floor((h - gf - 0.8) / fh);
    const nW = Math.max(1, Math.floor((len - 1.5) / pitch)), off = (len - nW * pitch) / 2 + pitch / 2;
    const P = (s, y) => { const e = 0.02; return [a[0] + ux * s + w.n[0] * e, y, a[2] + uz * s + w.n[2] * e]; };
    for (let f = 0; f < floors; f++) for (let i = 0; i < nW; i++) {
      const s = off + i * pitch, y0 = gf + f * fh + 0.75;
      // the evening: most lights go on around sunset, a few early, a few never; most go off before midnight
      const on = r() < 0.86 ? 18.15 + 1.25 * Math.pow(r(), 1.3) : 99;
      const off2 = 21.2 + 3.1 * r();
      const morning = r() < 0.22 ? 5.05 + 1.0 * r() : -1;
      windows.push({
        q: [P(s - ww / 2, y0), P(s + ww / 2, y0), P(s + ww / 2, y0 + wh), P(s - ww / 2, y0 + wh)].map((p) => proj(p[0], p[1], p[2])),
        sill: [P(s - ww / 2 - 0.15, y0 - 0.18), P(s + ww / 2 + 0.15, y0 - 0.18), P(s + ww / 2 + 0.15, y0), P(s - ww / 2 - 0.15, y0)].map((p) => proj(p[0], p[1], p[2])),
        n: w.n, on, off: off2, morning, warm: WARM[Math.floor(r() * WARM.length)], k: 0.75 + 0.5 * r(),
      });
    }
    // shopfronts on the ground floor of the street walls
    if (opts.shops && w.n[2] === -1) {
      for (const sh of opts.shops) {
        const s0 = sh.s0, s1 = sh.s1;
        shops.push({
          q: [P(s0, 0.3), P(s1, 0.3), P(s1, 3.1), P(s0, 3.1)].map((p) => proj(p[0], p[1], p[2])),
          awn: [P(s0 - 0.2, 3.5), P(s1 + 0.2, 3.5), [a[0] + ux * (s1 + 0.2), 2.75, a[2] - 1.3], [a[0] + ux * (s0 - 0.2), 2.75, a[2] - 1.3]].map((p) => proj(p[0], p[1], p[2])),
          awnAlb: hex(sh.awn), open: sh.open, close: sh.close, warm: hex(sh.light || '#ffe0b0'),
        });
      }
    }
  }
  if (h < HC - 0.5) {
    faces.push(face([[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]], [0, 1, 0], roof));
    // rooftop clutter on the near blocks: stair houses, water tanks, vents (boxes drawn after the roof, far first)
    if (opts.roofBits) {
      const bits = [];
      for (let i = 0; i < opts.roofBits; i++) {
        const w = 1.2 + r() * 3.5, d = 1.2 + r() * 3, hh = 0.8 + r() * 2.2;
        const bx = x0 + 2 + r() * (x1 - x0 - 4 - w), bz = z0 + 2.5 + r() * (z1 - z0 - 4 - d);
        bits.push([bx, bz, w, d, hh, r() < 0.5 ? mul(alb, [0.92, 0.92, 0.92]) : hex('#c9ccd2')]);
      }
      bits.sort((a, b) => b[1] - a[1]);
      for (const [bx, bz, w, d, hh, ba] of bits) {
        faces.push(face([[bx, h, bz], [bx + w, h, bz], [bx + w, h + hh, bz], [bx, h + hh, bz]], [0, 0, -1], ba));
        if (bx + w < 0) faces.push(face([[bx + w, h, bz], [bx + w, h, bz + d], [bx + w, h + hh, bz + d], [bx + w, h + hh, bz]], [1, 0, 0], ba));
        if (bx > 0) faces.push(face([[bx, h, bz], [bx, h, bz + d], [bx, h + hh, bz + d], [bx, h + hh, bz]], [-1, 0, 0], ba));
        faces.push(face([[bx, h + hh, bz], [bx + w, h + hh, bz], [bx + w, h + hh, bz + d], [bx, h + hh, bz + d]], [0, 1, 0], ba));
      }
    }
  }
  return { ...b, faces, windows, shops, depth: Math.hypot((x0 + x1) / 2, (z0 + z1) / 2) };
}

export function buildBlocks(seed = 1604) {
  const r = rand(seed), B = [];
  // the two facades across the street — the windows that light up one by one
  B.push(block({ x0: -70, x1: -XS.walk, z0: ZS.farWalk, z1: 56, h: 15.2, alb: hex('#efcd9c') }, r,
    { roofBits: 6, shops: [{ s0: 41, s1: 55, awn: '#5f8d8b', open: 7, close: 21.6, light: '#ffdcaa' }, { s0: 26, s1: 36, awn: '#d7b46a', open: 8.5, close: 20.3 }] }));
  B.push(block({ x0: XS.walk, x1: 70, z0: ZS.farWalk, z1: 53, h: 12.4, alb: hex('#a9c6bf') }, r,
    { roofBits: 6, shops: [{ s0: 3, s1: 14, awn: '#8e8fb5', open: 6.2, close: 20.8, light: '#ffe8c4' }, { s0: 18, s1: 27, awn: '#5f8d8b', open: 9, close: 22.4 }] }));
  // rows behind, along the cross street
  const rows = [[60, 80], [85, 108], [113, 140], [146, 178], [184, 220], [226, 270]];
  for (const [z0, z1] of rows) {
    for (const side of [-1, 1]) {
      let x = XS.walk;
      while (x < 0.85 * z1 + 20) {
        const w = 12 + r() * 22, h = 9 + r() * 13 + (z0 > 140 ? r() * 10 : 0);
        const xa = side < 0 ? -(x + w) : x, xb = side < 0 ? -x : x + w;
        B.push(block({ x0: xa, x1: xb, z0, z1: z1 - r() * 6, h }, r, { pitch: 3.4, roofBits: z0 < 100 ? 2 : 0 }));
        x += w + (r() < 0.25 ? 5 : 0.4);
      }
    }
  }
  B.sort((a, b) => b.depth - a.depth);
  return B;
}

/** the far town: small boxes and a few towers, lights as dots */
export function buildFarTown(seed = 1605) {
  const r = rand(seed), T = [];
  for (let i = 0; i < 170; i++) {
    const z = 290 + Math.pow(r(), 1.3) * 900, half = 0.82 * z;
    let x = (r() * 2 - 1) * half;
    if (Math.abs(x) < 10 && z < 650) x += Math.sign(x || 1) * 14;
    const w = 14 + r() * 30, d = 12 + r() * 20, h = r() < 0.12 ? 18 + r() * 10 : 6 + r() * 12;
    const b = { x0: x - w / 2, x1: x + w / 2, z0: z, z1: z + d, h, alb: FACADES[Math.floor(r() * FACADES.length)], roof: ROOFS[Math.floor(r() * ROOFS.length)] };
    b.front = [[b.x0, 0, z], [b.x1, 0, z], [b.x1, h, z], [b.x0, h, z]].map((p) => proj(...p));
    b.side = x > 0 ? [[b.x0, 0, z], [b.x0, 0, z + d], [b.x0, h, z + d], [b.x0, h, z]].map((p) => proj(...p)) : [[b.x1, 0, z], [b.x1, 0, z + d], [b.x1, h, z + d], [b.x1, h, z]].map((p) => proj(...p));
    b.sideN = x > 0 ? [-1, 0, 0] : [1, 0, 0];
    b.top = h < HC ? [[b.x0, h, z], [b.x1, h, z], [b.x1, h, z + d], [b.x0, h, z + d]].map((p) => proj(...p)) : null;
    b.lights = [];
    const nl = Math.floor((w * h) / 70);
    for (let k = 0; k < nl; k++) {
      const p = proj(b.x0 + 1 + r() * (w - 2), 2 + r() * (h - 3), z - 0.05);
      b.lights.push({ x: p[0], y: p[1], on: 18.1 + 1.4 * Math.pow(r(), 1.2), off: r() < 0.3 ? 99 : 21 + 3.5 * r(), warm: WARM[Math.floor(r() * 4)] });
    }
    T.push(b);
  }
  T.sort((a, b) => b.z0 - a.z0);
  return T;
}

// ---------------------------------------------------------------- props and shadow casters
export const TREE = { x: 7.6, z: 9.4, trunk: 3.2, cy: 5.3, r: 3.1 };
export const TREE2 = { x: -13.5, z: 8.6, trunk: 2.6, cy: 4.4, r: 2.4 };
export const LAMPS = [[-4.2, 13.5], [12.4, 13.5], [-15, 33.6], [15.5, 33.6], [-7.7, 52], [7.7, 72], [-7.7, 96]].map(([x, z]) => ({ x, z, h: 5.6 }));
export const BENCHES = [{ x: 2.8, z: 10.6 }, { x: -6.8, z: 10.8 }];
export const KIOSK = { x0: -19.5, x1: -15.5, z0: 8.4, z1: 11, h: 2.7 };
export const SHELTERS = [{ x0: -16, x1: -8.5, z: 20.25 }, { x0: 8, x1: 15.5, z: 27.75 }];
export const SIGNALS = [{ x: -11.9, z: 15.4 }, { x: 11.9, z: 32.8 }, { x: -6.6, z: 39.6 }];
export const POLES = [-22, 17].map((x) => ({ x }));   // catenary poles on both sidewalks

export function casters() {
  const C = [];
  const box = (x0, x1, z0, z1, y0, y1) => C.push({ x0, x1, z0, z1, y0, y1 });
  box(KIOSK.x0, KIOSK.x1, KIOSK.z0, KIOSK.z1, 0, KIOSK.h);
  for (const x of [-27, -2.5, 15.5]) box(x - 0.9, x + 0.9, 12.1, 12.8, 0, 1.2);
  for (const L of LAMPS) { box(L.x - 0.09, L.x + 0.09, L.z - 0.09, L.z + 0.09, 0, L.h); box(L.x - 0.09, L.x + 0.9, L.z - 0.16, L.z + 0.16, L.h - 0.25, L.h); }
  for (const b of BENCHES) { box(b.x - 1.05, b.x + 1.05, b.z - 0.25, b.z + 0.25, 0.4, 0.48); box(b.x - 1.05, b.x + 1.05, b.z - 0.33, b.z - 0.26, 0.5, 0.95); }
  for (const s of SHELTERS) { box(s.x0, s.x1, s.z - 0.75, s.z + 0.75, 2.5, 2.65); box(s.x0 + 0.2, s.x0 + 0.3, s.z + 0.5, s.z + 0.6, 0, 2.5); box(s.x1 - 0.3, s.x1 - 0.2, s.z + 0.5, s.z + 0.6, 0, 2.5); }
  for (const s of SIGNALS) box(s.x - 0.08, s.x + 0.08, s.z - 0.08, s.z + 0.08, 0, 3.6);
  for (const p of POLES) for (const z of [ZS.nearWalk - 0.6, ZS.road1 + 0.6]) box(p.x - 0.1, p.x + 0.1, z - 0.1, z + 0.1, 0, 6.2);
  for (const t of [TREE, TREE2]) {
    box(t.x - 0.2, t.x + 0.2, t.z - 0.2, t.z + 0.2, 0, t.trunk);
    C.push({ sphere: true, x: t.x, y: t.cy, z: t.z, r: t.r });
  }
  return C;
}
export const blockCasters = (blocks) => blocks.filter((b) => b.z0 < 120).map((b) => ({ x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, y0: 0, y1: b.h }));

// convex hull (monotone chain) of [x, z] points
function hull(P) {
  P.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  up.pop(); lo.pop();
  return lo.concat(up);
}
// clip a ground polygon to Z ≥ zn (keeps every vertex in front of the camera)
function clipZ(P, zn) {
  const out = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], ia = a[1] >= zn, ib = b[1] >= zn;
    if (ia) out.push(a);
    if (ia !== ib) { const k = (zn - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * k, zn]); }
  }
  return out;
}
/**
 * Shadow of every caster on the ground for the sun direction s (pointing at the sun): each corner P goes along −s to
 * the plane y = 0, P − s·(P_y / s_y); a box's shadow is the convex hull of its 8 projected corners (length = height /
 * tan(elevation)); a sphere's is the ellipse of its outline. Adds one closed sub-path per caster to the current path.
 */
export function shadowPath(g, C, s) {
  const kx = -s[0] / s[1], kz = -s[2] / s[1];
  for (const c of C) {
    let P;
    if (c.sphere) {
      // outline circle of the sphere perpendicular to s, projected: sample 20 points
      const ux = [s[2], 0, -s[0]], ul = Math.hypot(ux[0], ux[2]);
      const u = [ux[0] / ul, 0, ux[2] / ul], v = [s[1] * u[2] - s[2] * u[1], s[2] * u[0] - s[0] * u[2], s[0] * u[1] - s[1] * u[0]];
      P = [];
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2, ca = Math.cos(a) * c.r, sa = Math.sin(a) * c.r;
        const x = c.x + u[0] * ca + v[0] * sa, y = c.y + u[1] * ca + v[1] * sa, z = c.z + u[2] * ca + v[2] * sa;
        P.push([x + kx * y, z + kz * y]);
      }
    } else {
      P = [];
      for (const x of [c.x0, c.x1]) for (const z of [c.z0, c.z1]) for (const y of [c.y0, c.y1]) P.push([x + kx * y, z + kz * y]);
      P = hull(P);
    }
    P = clipZ(P, 2);
    if (P.length < 3) continue;
    let p = proj(P[0][0], 0, P[0][1]);
    g.moveTo(p[0], p[1]);
    for (let i = 1; i < P.length; i++) { p = proj(P[i][0], 0, P[i][1]); g.lineTo(p[0], p[1]); }
    g.closePath();
  }
}

// ---------------------------------------------------------------- lights that switch (lamps, windows, shops)
/** street lamps switch on when the sun drops below −1° and off when it climbs past +1° (photocells) */
export const LAMP_ON = 18.47, LAMP_OFF = 5.62;
export const lampLevel = (T, S, j = 0) => (1 - switchedOn(LAMP_OFF + j, T, S)) + switchedOn(LAMP_ON + j, T, S);
/** lit fraction of a window over the frame's window: evening interval [on, off] (+ the end of a morning interval) */
export function windowLevel(w, T, S) {
  let v = 0;
  if (w.morning > 0) v += 1 - switchedOn(w.morning, T, S);
  if (w.on < 90) v += occupancy(w.on, w.off, T, S);
  return v;
}
export const quad = (g, q) => { g.beginPath(); g.moveTo(q[0][0], q[0][1]); for (let i = 1; i < q.length; i++) g.lineTo(q[i][0], q[i][1]); g.closePath(); };
