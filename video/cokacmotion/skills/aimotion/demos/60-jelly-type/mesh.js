/*
 * 60 · mesh.js — one glyph outline → one soft-body mesh. Pure JS (no DOM), so the same code runs in node.
 *
 *   boundary   every contour is resampled at an even spacing `sb`, keeping the outline's real corners
 *              (turning angle > 35°) as samples so stroke ends stay square; loops are re-oriented so that for
 *              every boundary edge a→b the outward normal of the solid is (dy, −dx) (outer loops area > 0, holes < 0)
 *   interior   a jittered hexagonal grid at spacing `si`, kept where the even-odd rule says "ink" and at least
 *              0.6·si from the boundary (no slivers against the outline)
 *   triangles  Delaunay (d3-delaunay) of all points. A triangle is solid jelly when its centroid is ink and every
 *              edge that is not an outline edge stays in ink at ¼, ½ and ¾ of its length (so nothing bridges a
 *              counter or the gap between two jamo). The non-ink triangles with edges ≤ Lg become "ghost" tissue:
 *              invisible, softer springs that hold a syllable's separate jamo (ㅁ, ㅏ, ㄹ …) in their layout.
 *              Lg grows until the whole syllable is one connected piece.
 */
import { Delaunay } from 'd3-delaunay';

/** even-odd rule over all contours (flat [x0, y0, x1, y1, …] arrays) */
export function insideInk(contours, x, y) {
  let c = false;
  for (const p of contours) {
    const n = p.length;
    for (let i = 0, j = n - 2; i < n; j = i, i += 2) {
      const yi = p[i + 1], yj = p[j + 1];
      if ((yi > y) !== (yj > y) && x < ((p[j] - p[i]) * (y - yi)) / (yj - yi) + p[i]) c = !c;
    }
  }
  return c;
}

const hyp = (x, y) => Math.sqrt(x * x + y * y);   // exact in every engine (Math.hypot is not)

function signedArea(P) {
  let A = 0;
  for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; A += a[0] * b[1] - b[0] * a[1]; }
  return A / 2;
}

/** resample a closed polyline at ≈ `spacing`, keeping sharp corners as samples */
function resampleLoop(flat, spacing) {
  // drop near-duplicate points
  const P = [];
  for (let i = 0; i < flat.length; i += 2) {
    const q = [flat[i], flat[i + 1]];
    if (!P.length || hyp(q[0] - P[P.length - 1][0], q[1] - P[P.length - 1][1]) > 0.4) P.push(q);
  }
  while (P.length > 3 && hyp(P[0][0] - P[P.length - 1][0], P[0][1] - P[P.length - 1][1]) < 0.4) P.pop();
  const n = P.length;
  const cum = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; cum[i + 1] = cum[i] + hyp(b[0] - a[0], b[1] - a[1]); }
  const L = cum[n];
  // corners: turning angle at a vertex
  const cand = [];
  for (let i = 0; i < n; i++) {
    const a = P[(i - 1 + n) % n], b = P[i], c = P[(i + 1) % n];
    const ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - b[0], vy = c[1] - b[1];
    const cs = (ux * vx + uy * vy) / (hyp(ux, uy) * hyp(vx, vy) || 1);
    if (cs < 0.8196) cand.push([i, 1 - cs]);           // turning angle > 35° (cos 35° ≈ 0.8196); 1 − cos ranks sharpness
  }
  // corners closer than 0.6·spacing along the outline collapse into the sharpest one
  const kept = [];
  for (const c of cand) {
    const last = kept[kept.length - 1];
    if (last && cum[c[0]] - cum[last[0]] < 0.6 * spacing) { if (c[1] > last[1]) kept[kept.length - 1] = c; }
    else kept.push(c);
  }
  if (kept.length > 1 && cum[kept[0][0]] + L - cum[kept[kept.length - 1][0]] < 0.6 * spacing) {
    if (kept[kept.length - 1][1] > kept[0][1]) kept[0] = kept[kept.length - 1];
    kept.pop();
  }
  const S = [];
  if (!kept.length) {
    const m = Math.max(8, Math.round(L / spacing));
    for (let k = 0; k < m; k++) S.push((k * L) / m);
  } else {
    for (let k = 0; k < kept.length; k++) {
      const a = cum[kept[k][0]];
      let b = cum[kept[(k + 1) % kept.length][0]];
      if (b <= a) b += L;
      const m = Math.max(1, Math.round((b - a) / spacing));
      for (let j = 0; j < m; j++) S.push((a + ((b - a) * j) / m) % L);
    }
  }
  // arc length → point
  const out = [];
  let seg = 0;
  const sorted = S.slice().sort((x, y) => x - y);
  for (const s of sorted) {
    while (seg < n - 1 && cum[seg + 1] < s) seg++;
    const a = P[seg], b = P[(seg + 1) % n], len = cum[seg + 1] - cum[seg] || 1, k = (s - cum[seg]) / len;
    out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
  }
  return out;
}

function segDist2(px, py, ax, ay, bx, by) {
  const ex = bx - ax, ey = by - ay, l2 = ex * ex + ey * ey || 1;
  const u = Math.max(0, Math.min(1, ((px - ax) * ex + (py - ay) * ey) / l2));
  const dx = px - ax - ex * u, dy = py - ay - ey * u;
  return dx * dx + dy * dy;
}

/**
 * contours: [{ pts: Float32Array, area }] in stage pixels (one glyph). rnd: seeded () → [0, 1).
 * Returns { pts: Float64Array (x, y, …), nb (boundary count; boundary first, in loop order),
 *   loops: [{ start, len }], tris: Int32Array (solid), triA0: Float64Array (signed rest areas),
 *   edges: [i, j, rest, ghost], comp: Int32Array (connected jamo per particle), ncomp }
 */
export function buildMesh(contours, { sb = 12, si = 18, rnd }) {
  const raw = contours.map((c) => c.pts);
  // ---- boundary loops ----
  const loops = [];
  for (let k = 0; k < raw.length; k++) {
    let L = resampleLoop(raw[k], sb);
    if (L.length < 6) continue;
    // a hole lies inside an odd number of the other contours
    let depth = 0;
    for (let j = 0; j < raw.length; j++) if (j !== k && insideInk([raw[j]], raw[k][0], raw[k][1])) depth++;
    const hole = depth % 2 === 1;
    const A = signedArea(L);
    if ((hole && A > 0) || (!hole && A < 0)) L = L.reverse();
    loops.push(L);
  }
  const P = [];
  const loopInfo = [];
  for (const L of loops) { loopInfo.push({ start: P.length, len: L.length }); for (const q of L) P.push(q); }
  const nb = P.length;
  // ---- interior: jittered hex grid ----
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const q of P) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
  const rowH = si * 0.866, margin2 = (0.6 * si) ** 2;
  for (let r = 0, y = y0 + rowH * 0.5; y < y1; r++, y += rowH) {
    for (let x = x0 + (r % 2 ? si * 0.5 : 0); x < x1; x += si) {
      const px = x + (rnd() - 0.5) * 0.4 * si, py = y + (rnd() - 0.5) * 0.4 * si;
      if (!insideInk(raw, px, py)) continue;
      let ok = true;
      for (const li of loopInfo) {
        for (let i = 0; i < li.len && ok; i++) {
          const a = P[li.start + i], b = P[li.start + ((i + 1) % li.len)];
          if (segDist2(px, py, a[0], a[1], b[0], b[1]) < margin2) ok = false;
        }
        if (!ok) break;
      }
      if (ok) P.push([px, py]);
    }
  }
  const N = P.length;
  const pts = new Float64Array(N * 2);
  P.forEach((q, i) => { pts[i * 2] = q[0]; pts[i * 2 + 1] = q[1]; });
  const loopOf = new Int32Array(N).fill(-1), idxIn = new Int32Array(N).fill(-1);
  loopInfo.forEach((li, l) => { for (let i = 0; i < li.len; i++) { loopOf[li.start + i] = l; idxIn[li.start + i] = i; } });
  const outlineEdge = (a, b) => {
    if (loopOf[a] < 0 || loopOf[a] !== loopOf[b]) return false;
    const len = loopInfo[loopOf[a]].len, d = Math.abs(idxIn[a] - idxIn[b]);
    return d === 1 || d === len - 1;
  };
  const inkAt = (x, y) => insideInk(raw, x, y);
  const edgeInInk = (a, b) => {
    if (outlineEdge(a, b)) return true;
    const ax = pts[a * 2], ay = pts[a * 2 + 1], bx = pts[b * 2], by = pts[b * 2 + 1];
    return inkAt(ax + (bx - ax) * 0.25, ay + (by - ay) * 0.25) && inkAt((ax + bx) / 2, (ay + by) / 2) && inkAt(ax + (bx - ax) * 0.75, ay + (by - ay) * 0.75);
  };

  // ---- Delaunay → solid / ghost ----
  const T = new Delaunay(pts).triangles;
  const solid = [], ghostCand = [];
  const minA2 = 0.06 * sb * sb;
  for (let t = 0; t < T.length; t += 3) {
    const a = T[t], b = T[t + 1], c = T[t + 2];
    const ax = pts[a * 2], ay = pts[a * 2 + 1], bx = pts[b * 2], by = pts[b * 2 + 1], cx = pts[c * 2], cy = pts[c * 2 + 1];
    const A2 = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (Math.abs(A2) < minA2) continue;
    const isSolid = inkAt((ax + bx + cx) / 3, (ay + by + cy) / 3) && edgeInInk(a, b) && edgeInInk(b, c) && edgeInInk(c, a);
    if (isSolid) solid.push(a, b, c);
    else ghostCand.push([a, b, c, Math.max(hyp(bx - ax, by - ay), hyp(cx - bx, cy - by), hyp(ax - cx, ay - cy))]);
  }
  // ---- edges ----
  const key = (i, j) => (i < j ? i * N + j : j * N + i);
  const mat = new Map();
  const addMat = (i, j) => { const k = key(i, j); if (!mat.has(k)) mat.set(k, [Math.min(i, j), Math.max(i, j)]); };
  for (let t = 0; t < solid.length; t += 3) { addMat(solid[t], solid[t + 1]); addMat(solid[t + 1], solid[t + 2]); addMat(solid[t + 2], solid[t]); }
  for (const li of loopInfo) for (let i = 0; i < li.len; i++) addMat(li.start + i, li.start + ((i + 1) % li.len));
  // connected jamo (material only)
  const uf = (n) => { const p = Int32Array.from({ length: n }, (_, i) => i); const f = (x) => { while (p[x] !== x) { p[x] = p[p[x]]; x = p[x]; } return x; }; return { f, u: (a, b) => { a = f(a); b = f(b); if (a !== b) p[Math.max(a, b)] = Math.min(a, b); } }; };
  const U = uf(N);
  for (const [i, j] of mat.values()) U.u(i, j);
  const compRoot = new Map(), comp = new Int32Array(N);
  for (let i = 0; i < N; i++) { const r = U.f(i); if (!compRoot.has(r)) compRoot.set(r, compRoot.size); comp[i] = compRoot.get(r); }
  // ghost tissue: grow the allowed edge length until the syllable is one piece
  let Lg = 2.4 * si, ghost = null;
  for (let tries = 0; tries < 12; tries++, Lg *= 1.2) {
    const G = uf(N);
    for (const [i, j] of mat.values()) G.u(i, j);
    const sel = ghostCand.filter((g) => g[3] <= Lg);
    for (const g of sel) { G.u(g[0], g[1]); G.u(g[1], g[2]); }
    const r0 = G.f(0);
    let one = true;
    for (let i = 1; i < N && one; i++) if (G.f(i) !== r0) one = false;
    ghost = sel;
    if (one) break;
  }
  const gh = new Map();
  for (const g of ghost) for (const [i, j] of [[g[0], g[1]], [g[1], g[2]], [g[2], g[0]]]) { const k = key(i, j); if (!mat.has(k) && !gh.has(k)) gh.set(k, [Math.min(i, j), Math.max(i, j)]); }
  const edges = [];
  const len = (i, j) => hyp(pts[i * 2] - pts[j * 2], pts[i * 2 + 1] - pts[j * 2 + 1]);
  for (const [i, j] of mat.values()) edges.push([i, j, len(i, j), 0]);
  for (const [i, j] of gh.values()) edges.push([i, j, len(i, j), 1]);
  const tris = Int32Array.from(solid);
  const triA0 = new Float64Array(tris.length / 3);
  for (let t = 0; t < triA0.length; t++) {
    const a = tris[t * 3], b = tris[t * 3 + 1], c = tris[t * 3 + 2];
    triA0[t] = 0.5 * ((pts[b * 2] - pts[a * 2]) * (pts[c * 2 + 1] - pts[a * 2 + 1]) - (pts[c * 2] - pts[a * 2]) * (pts[b * 2 + 1] - pts[a * 2 + 1]));
  }
  return { pts, nb, loops: loopInfo, tris, triA0, edges, comp, ncomp: compRoot.size, ghostLen: Lg };
}
