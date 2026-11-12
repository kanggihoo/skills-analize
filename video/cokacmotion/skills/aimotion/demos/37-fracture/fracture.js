/*
 * fracture.js — the crack pattern of a pane struck at one point, and the moment each crack opens.
 *
 * 1. Seeds on a jittered polar grid centred on the impact: ring radii grow geometrically (×1.26–1.36), so cells
 *    are tiny near the impact and long wedges far from it. Every ring reuses the same sector angles, so the
 *    Voronoi bisectors line up into long RADIAL cracks, and the bisectors between rings form CONCENTRIC cracks.
 *    Inside r ≈ 100 px the sectors are halved (more radials near the impact); further out some neighbouring
 *    sectors or rings are merged, so some radials stop at a ring — the staggered look of real breaks.
 *    A ring of tiny seeds inside r ≈ 20 px is the crushed cone under the ball.
 * 2. d3-delaunay → Voronoi clipped to the pane. Vertices are welded (0.7 px), so neighbouring shards share
 *    exactly the same corners, and every shared edge is bowed/jittered ONCE and inserted into both shards —
 *    the shards still tile the pane with no gap.
 * 3. Crack fronts: Dijkstra over the crack graph from the corners of the struck cell. Each Voronoi edge has a
 *    speed: radial cracks run at the terminal crack speed of soda-lime glass (≈1.5 km/s = 1500 px/ms at
 *    1 px = 1 mm), concentric ones at about half (they open later, from the radials). A point at fraction s of
 *    a segment a→b is reached at min(Ta + s·tr, Tb + (1 − s)·tr) — fronts may meet in the middle.
 *    A shard is free once every crack around it has fully opened: max over its segments of (Ta + Tb + tr)/2.
 * 4. Hairline branches: short crack feathers that leave a main crack at 20–50° in its running direction and
 *    die inside a shard (they never cut it). They open behind the parent front at ~0.45 × crack speed.
 */
import { Delaunay } from 'd3-delaunay';

const TAU = Math.PI * 2;

export function buildFracture({ rand, seed, impact, bounds, crackSpeed }) {
  const [ix, iy] = impact, [bx0, by0, bx1, by1] = bounds;
  const rnd = rand(seed);
  const V = crackSpeed;                                   // px per ms

  // ---------------- 1. seeds ----------------
  const seeds = [];
  const polar = (r, a) => seeds.push([ix + r * Math.cos(a), iy + r * Math.sin(a)]);
  seeds.push([ix + (rnd() - 0.5) * 2, iy + (rnd() - 0.5) * 2]);
  for (let j = 0; j < 7; j++) polar(6.5 + rnd() * 2.5, (j + rnd() * 0.7) * TAU / 7);      // crushed cone
  for (let j = 0; j < 12; j++) polar(14 + rnd() * 4, (j + rnd() * 0.7) * TAU / 12);
  const N = 15, rot = rnd() * TAU;
  const J = Array.from({ length: N }, () => (rnd() - 0.5) * 0.5);
  const th = (j) => rot + (j + J[((j % N) + N) % N]) * TAU / N;                              // sector boundaries
  const far = Math.max(...[[bx0, by0], [bx1, by0], [bx0, by1], [bx1, by1]].map(([x, y]) => Math.hypot(x - ix, y - iy))) + 90;
  const rings = [24];
  while (rings[rings.length - 1] < far) rings.push(rings[rings.length - 1] * (1.26 + rnd() * 0.1));
  const used = new Set();
  for (let k = 0; k < rings.length - 1; k++) {
    const r0 = rings[k], m = r0 < 100 ? 2 : 1;
    for (let j = 0; j < N; j++) {
      if (used.has(k * 100 + j)) continue;
      let a0 = th(j), a1 = th(j + 1), r1 = rings[k + 1];
      if (m === 1 && r0 > 140) {
        const u = rnd();
        if (u < 0.17 && j < N - 1 && !used.has(k * 100 + j + 1)) { a1 = th(j + 2); used.add(k * 100 + j + 1); }   // radial stops here
        else if (u > 0.86 && k + 2 < rings.length) { r1 = rings[k + 2]; used.add((k + 1) * 100 + j); }          // long sliver
      }
      for (let q = 0; q < m; q++) {
        const a = a0 + (a1 - a0) * (q + 0.5 + (rnd() - 0.5) * 0.36) / m;
        const r = r0 + (r1 - r0) * (0.5 + (rnd() - 0.5) * 0.34);
        polar(r, a);
      }
    }
  }

  // ---------------- 2. Voronoi cells, welded ----------------
  const del = Delaunay.from(seeds);
  const vor = del.voronoi([bx0, by0, bx1, by1]);
  const VX = [], VY = [], grid = new Map();
  const weld = (x, y) => {
    if (Math.abs(x - bx0) < 1e-3) x = bx0; else if (Math.abs(x - bx1) < 1e-3) x = bx1;
    if (Math.abs(y - by0) < 1e-3) y = by0; else if (Math.abs(y - by1) < 1e-3) y = by1;
    const gx = Math.floor(x), gy = Math.floor(y);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const list = grid.get((gx + dx) * 8192 + gy + dy);
      if (list) for (const v of list) if (Math.hypot(VX[v] - x, VY[v] - y) < 0.7) return v;
    }
    const v = VX.length;
    VX.push(x); VY.push(y);
    const key = gx * 8192 + gy;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(v);
    return v;
  };
  const cells = [];
  for (let i = 0; i < seeds.length; i++) {
    const poly = vor.cellPolygon(i);
    if (!poly) continue;
    const ring = [];
    for (let q = 0; q < poly.length - 1; q++) {
      const v = weld(poly[q][0], poly[q][1]);
      if (ring[ring.length - 1] !== v) ring.push(v);
    }
    while (ring.length > 1 && ring[0] === ring[ring.length - 1]) ring.pop();
    if (ring.length < 3) continue;
    let A = 0, cx = 0, cy = 0;
    for (let q = 0; q < ring.length; q++) {
      const a = ring[q], b = ring[(q + 1) % ring.length], cr = VX[a] * VY[b] - VX[b] * VY[a];
      A += cr; cx += (VX[a] + VX[b]) * cr; cy += (VY[a] + VY[b]) * cr;
    }
    A /= 2;
    if (Math.abs(A) < 2) continue;
    cx /= 6 * A; cy /= 6 * A;
    if (A < 0) { ring.reverse(); A = -A; }                 // positive area: outward normal of a→b is (dy, −dx)
    cells.push({ seed: i, ring, area: A, cx, cy, d: Math.hypot(cx - ix, cy - iy) });
  }

  // ---------------- edges: shared, bowed once, classified ----------------
  const ekey = (a, b) => (a < b ? a * 1e6 + b : b * 1e6 + a);
  const edges = new Map();
  cells.forEach((c, ci) => {
    for (let q = 0; q < c.ring.length; q++) {
      const a = c.ring[q], b = c.ring[(q + 1) % c.ring.length], k = ekey(a, b);
      if (!edges.has(k)) edges.set(k, { a: Math.min(a, b), b: Math.max(a, b), cells: [] });
      edges.get(k).cells.push(ci);
    }
  });
  const onFrame = (a, b) => (VX[a] === bx0 && VX[b] === bx0) || (VX[a] === bx1 && VX[b] === bx1) || (VY[a] === by0 && VY[b] === by0) || (VY[a] === by1 && VY[b] === by1);
  for (const e of edges.values()) {
    const ax = VX[e.a], ay = VY[e.a], bx = VX[e.b], by = VY[e.b];
    const L = Math.hypot(bx - ax, by - ay);
    e.L = L; e.sub = []; e.crack = !onFrame(e.a, e.b); e.speed = V; e.radial = false;
    if (!e.crack || L < 1e-6) continue;
    const mx = (ax + bx) / 2 - ix, my = (ay + by) / 2 - iy, ml = Math.hypot(mx, my) || 1;
    e.radial = Math.abs(((bx - ax) * mx + (by - ay) * my) / (L * ml)) > 0.8;
    e.speed = V * (e.radial ? 1 : 0.5) * (0.85 + rnd() * 0.3);
    const n = L > 14 ? Math.round(L / 18) : 1;
    if (n > 1) {
      const nx = -(by - ay) / L, ny = (bx - ax) / L;
      const bow = (rnd() - 0.5) * Math.min(5, 0.04 * L), amp = Math.min(1.3, 0.03 * L);
      for (let q = 1; q < n; q++) {
        const s = q / n, off = bow * Math.sin(Math.PI * s) + (rnd() - 0.5) * amp;
        e.sub.push(VX.length);
        VX.push(ax + (bx - ax) * s + nx * off); VY.push(ay + (by - ay) * s + ny * off);
      }
    }
  }
  // each shard's outline with the shared sub-points, and the parent edge of every outline segment
  for (const c of cells) {
    const full = [], segE = [];
    for (let q = 0; q < c.ring.length; q++) {
      const a = c.ring[q], b = c.ring[(q + 1) % c.ring.length], e = edges.get(ekey(a, b));
      const chain = a === e.a ? e.sub : e.sub.slice().reverse();
      full.push(a); segE.push(e);
      for (const v of chain) { full.push(v); segE.push(e); }
    }
    c.full = full; c.segE = segE;
    c.frameLen = 0; c.onBottom = false; c.onTop = false;
    for (let q = 0; q < c.ring.length; q++) {
      const a = c.ring[q], b = c.ring[(q + 1) % c.ring.length];
      if (!onFrame(a, b)) continue;
      c.frameLen += Math.hypot(VX[b] - VX[a], VY[b] - VY[a]);
      if (VY[a] === by1 && VY[b] === by1) c.onBottom = true;
      if (VY[a] === by0 && VY[b] === by0) c.onTop = true;
    }
  }

  // ---------------- 3. crack fronts (Dijkstra) ----------------
  const nV = VX.length, adj = Array.from({ length: nV }, () => []), segs = [];
  for (const e of edges.values()) {
    if (!e.crack) continue;
    const chain = [e.a, ...e.sub, e.b];
    for (let q = 0; q < chain.length - 1; q++) {
      const u = chain[q], w = chain[q + 1], tr = Math.hypot(VX[w] - VX[u], VY[w] - VY[u]) / e.speed;
      adj[u].push(w, tr); adj[w].push(u, tr);
      segs.push({ a: u, b: w, tr });
    }
  }
  const T = new Float64Array(nV).fill(Infinity);
  const hit = del.find(ix, iy);
  let hc = cells.find((c) => c.seed === hit);
  if (!hc) hc = cells.reduce((m, c) => (c.d < m.d ? c : m), cells[0]);
  const heap = [];                                   // binary heap of [time, vertex]
  const push = (t, v) => {
    heap.push([t, v]);
    let i = heap.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]]; i = m;
      }
    }
    return top;
  };
  for (const v of hc.full) { const t0 = Math.hypot(VX[v] - ix, VY[v] - iy) / V; if (t0 < T[v]) { T[v] = t0; push(t0, v); } }
  while (heap.length) {
    const [t, v] = pop();
    if (t > T[v]) continue;
    const ad = adj[v];
    for (let q = 0; q < ad.length; q += 2) {
      const w = ad[q], nt = t + ad[q + 1];
      if (nt < T[w]) { T[w] = nt; push(nt, w); }
    }
  }
  let Tmax = 0;
  for (const s of segs) {
    s.Ta = T[s.a]; s.Tb = T[s.b];
    const done = (s.Ta + s.Tb + s.tr) / 2;
    if (Number.isFinite(done)) Tmax = Math.max(Tmax, done);
  }
  for (let v = 0; v < nV; v++) if (!Number.isFinite(T[v])) T[v] = Tmax + 1;   // (frame corners: never cracked)
  for (const s of segs) { s.Ta = T[s.a]; s.Tb = T[s.b]; }
  for (const c of cells) {
    let rel = 0;
    for (let q = 0; q < c.full.length; q++) {
      const e = c.segE[q];
      if (!e.crack) continue;
      const a = c.full[q], b = c.full[(q + 1) % c.full.length];
      const tr = Math.hypot(VX[b] - VX[a], VY[b] - VY[a]) / e.speed;
      rel = Math.max(rel, (T[a] + T[b] + tr) / 2);
    }
    c.rel = Math.min(rel, Tmax);                     // ms
    c.crush = c.d < 22;
  }

  // ---------------- 4. hairline branches ----------------
  const inside = (c, x, y) => {
    let s = false;
    for (let q = 0, n = c.ring.length, p = n - 1; q < n; p = q++) {
      const ax = VX[c.ring[q]], ay = VY[c.ring[q]], bx = VX[c.ring[p]], by = VY[c.ring[p]];
      if ((ay > y) !== (by > y) && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) s = !s;
    }
    return s;
  };
  const branches = [];
  for (const e of edges.values()) {
    if (!e.crack || e.L < 22 || e.cells.length < 2 || rnd() > 0.55) continue;
    const nb = rnd() < 0.3 ? 2 : 1;
    for (let b = 0; b < nb; b++) {
      const chain = [e.a, ...e.sub, e.b];
      const qf = (0.15 + rnd() * 0.7) * (chain.length - 1), q = Math.min(chain.length - 2, Math.floor(qf)), f = qf - q;
      const u = chain[q], w = chain[q + 1];
      const rx = VX[u] + (VX[w] - VX[u]) * f, ry = VY[u] + (VY[w] - VY[u]) * f;
      const sl = Math.hypot(VX[w] - VX[u], VY[w] - VY[u]) || 1, tr = sl / e.speed;
      const Troot = Math.min(T[u] + f * tr, T[w] + (1 - f) * tr);
      let dx = (VX[w] - VX[u]) / sl, dy = (VY[w] - VY[u]) / sl;
      if (T[w] < T[u]) { dx = -dx; dy = -dy; }                    // the way the parent front was running
      const side = rnd() < 0.5 ? 1 : -1;
      let ang = Math.atan2(dy, dx) + side * (0.35 + rnd() * 0.5);
      const len = Math.min(e.L * 0.6, 10 + rnd() * 34), steps = 3;
      const ci = e.cells.find((k) => inside(cells[k], rx + Math.cos(ang) * 2.5, ry + Math.sin(ang) * 2.5));
      if (ci === undefined) continue;
      const pts = [[rx, ry, Troot]];
      let x = rx, y = ry, acc = 0;
      for (let s = 0; s < steps; s++) {
        ang += (rnd() - 0.5) * 0.5;
        const l = (len / steps) * (1 - s * 0.15);
        const nx = x + Math.cos(ang) * l, ny = y + Math.sin(ang) * l;
        if (!inside(cells[ci], nx, ny)) break;
        acc += l; x = nx; y = ny;
        pts.push([x, y, Troot + acc / (0.45 * V)]);
      }
      if (pts.length > 1) branches.push({ cell: ci, pts });
    }
  }

  return { cells, VX, VY, T, segs, Tmax, branches, rings, edgesCount: edges.size };
}
