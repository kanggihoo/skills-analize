/*
 * 137 · 펜으로 쓴 안부 — a broad-nib fountain pen writes 잘 지내? on a dotted notebook page, stroke by stroke.
 *
 * The strokes are not drawn by hand: each syllable of a registered Korean font is rasterised in setup, thinned to a
 * 1-pixel skeleton (Zhang–Suen), turned into a graph (endpoints, junctions, edges), pruned of spurs, split at
 * junctions and merged straight through them, split at corners and re-joined the way Hangul is written, and ordered
 * by the Hangul stroke-order rules. The pen then runs each centreline with a minimum-jerk profile, and the ink is the
 * sweep of a rotated broad nib: w = w_min + (W − w_min)·|sin(θ_dir − θ_nib)|. Fresh ink is wet and glossy and dries
 * matte about a second behind the pen. Everything is baked in setup; frame(t) draws the prefix reached at t.
 */
import { defineDemo, clamp, lerp, smooth, track, rand, ease } from '../_lib/stage.js';
import { fontReady, textAlpha, signedDistance } from '../_lib/type.js';

const W = 1080, H = 1920, D = 10, TAU = Math.PI * 2;
const FONT = 'Pretendard Variable', WEIGHT = 430;
const TEXT = '잘 지내?';
const RF = 560;                     // raster em (px) — the skeleton is found at this size
const EM = 272;                     // display em (px)
const BASE_Y = 958;                 // baseline of the line (world px)
const DEEP = [18, 24, 58];                // ink shading: where the bead drains

// the broad nib: its edge is held at a fixed angle, rising to the right
const NIB_ANG = (-35 * Math.PI) / 180;
const NU = [Math.cos(NIB_ANG), Math.sin(NIB_ANG)];     // nib edge
const NV = [-NU[1], NU[0]];                            // across the nib = the pen's axis on the page (down-right)
const NIB_W = 23, NIB_MIN = 4.2;                       // W and w_min (px)
const LIGHT = norm2([-0.55, -0.84]);                    // toward the window (upper left)

// palette: paper, wood, navy (ink and pen), brass — and one accent
const INK = [44, 54, 102];
const WET = [92, 102, 150];              // wet ink multiplies darker and bluer
const WET_CORAL = [222, 150, 140];
const CORAL = [238, 104, 86];
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// ---------------------------------------------------------------- timeline (s)
const T = {
  penIn: [0, 0.86],
  write: [0.92, 6.9],
  hold: 0.4,                       // the nib rests on the dot before it lifts: the drop under it grows
  penOut: 0.46,
  pull: [6.15, 7.75],              // the camera lets go of the pen and shows the whole line
  under: [7.66, 8.12],
  heart: [8.16, 8.74],
};
// camera while writing: close on the nib (zoom), following the pen's smoothed x
const ZW = track([[0, 1.64], [1.25, 1.5], [6.15, 1.4]]);

function norm2(v) { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
// minimum-jerk position profile (Flash & Hogan): s(τ) = 10τ³ − 15τ⁴ + 6τ⁵
const minjerk = (u) => { u = clamp(u); return u * u * u * (10 - 15 * u + 6 * u * u); };
function minjerkInv(h) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (minjerk(m) < h) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
function plen(P) { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; }
function resample(P, step) {
  const n = P.length, cum = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const L = cum[n - 1], m = Math.max(2, Math.round(L / step) + 1), out = [];
  let j = 0;
  for (let k = 0; k < m; k++) {
    const s = (L * k) / (m - 1);
    while (j < n - 2 && cum[j + 1] < s) j++;
    const f = (s - cum[j]) / Math.max(1e-9, cum[j + 1] - cum[j]);
    out.push([lerp(P[j][0], P[j + 1][0], f), lerp(P[j][1], P[j + 1][1], f)]);
  }
  return out;
}
function smoothPts(P, r, passes) {
  for (let p = 0; p < passes; p++) {
    const out = P.map((q) => q.slice());
    for (let i = 1; i < P.length - 1; i++) {
      let sx = 0, sy = 0, m = 0;
      for (let j = Math.max(0, i - r); j <= Math.min(P.length - 1, i + r); j++) { sx += P[j][0]; sy += P[j][1]; m++; }
      out[i] = [sx / m, sy / m];
    }
    P = out;
  }
  return P;
}
function pointAtLen(P, s) {
  let acc = 0;
  for (let i = 1; i < P.length; i++) {
    const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (acc + l >= s) { const f = (s - acc) / Math.max(1e-9, l); return [lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f)]; }
    acc += l;
  }
  return P[P.length - 1].slice();
}

// ================================================================ 1 · skeleton of a glyph
/** Zhang–Suen thinning, in place on a 0/1 image (border pixels must be 0) */
function zhangSuen(S, w, h) {
  let list = [];
  for (let i = 0; i < w * h; i++) if (S[i]) list.push(i);
  const del = [];
  for (let iter = 0; iter < 400; iter++) {
    let any = false;
    for (let sub = 0; sub < 2; sub++) {
      del.length = 0;
      for (const i of list) {
        if (!S[i]) continue;
        const p2 = S[i - w], p3 = S[i - w + 1], p4 = S[i + 1], p5 = S[i + w + 1];
        const p6 = S[i + w], p7 = S[i + w - 1], p8 = S[i - 1], p9 = S[i - w - 1];
        const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (b < 2 || b > 6) continue;
        const a = (p2 < p3) + (p3 < p4) + (p4 < p5) + (p5 < p6) + (p6 < p7) + (p7 < p8) + (p8 < p9) + (p9 < p2);
        if (a !== 1) continue;
        if (sub === 0 ? (p2 & p4 & p6) | (p4 & p6 & p8) : (p2 & p4 & p8) | (p2 & p6 & p8)) continue;
        del.push(i);
      }
      for (const i of del) S[i] = 0;
      if (del.length) any = true;
    }
    if (!any) break;
    list = list.filter((i) => S[i]);
  }
}
/** remove the staircase pixels Zhang–Suen leaves: simple points (Yokoi 8-connectivity number 1) that are not endpoints */
function thinClean(S, w, h) {
  const R = [1, 1 - w, -w, -w - 1, -1, w - 1, w, w + 1];   // E NE N NW W SW S SE (a closed ring)
  const x = new Uint8Array(8);
  for (let pass = 0; pass < 10; pass++) {
    let n = 0;
    for (let i = w + 1; i < w * h - w - 1; i++) {
      if (!S[i]) continue;
      let cnt = 0;
      for (let k = 0; k < 8; k++) { x[k] = S[i + R[k]]; cnt += x[k]; }
      if (cnt < 2) continue;
      let c8 = 0;
      for (let k = 0; k < 8; k += 2) { const a = 1 - x[k], b = 1 - x[k + 1], c = 1 - x[(k + 2) & 7]; c8 += a - a * b * c; }
      if (c8 === 1) { S[i] = 0; n++; }
    }
    if (!n) break;
  }
}
/** 8-connected components of the ink */
function components(B, w, h) {
  const lab = new Int32Array(w * h).fill(-1), list = [], q = new Int32Array(w * h);
  const R = [1, -1, w, -w, w + 1, w - 1, -w + 1, -w - 1];
  for (let i = 0; i < w * h; i++) {
    if (!B[i] || lab[i] >= 0) continue;
    const id = list.length;
    let qh = 0, qt = 0, sx = 0, sy = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    q[qt++] = i; lab[i] = id;
    while (qh < qt) {
      const p = q[qh++], px = p % w, py = (p / w) | 0;
      sx += px; sy += py; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
      for (const d of R) { const r = p + d; if (B[r] && lab[r] < 0) { lab[r] = id; q[qt++] = r; } }
    }
    list.push({ id, n: qt, cx: sx / qt, cy: sy / qt, x0, y0, x1, y1 });
  }
  return { lab, list };
}
/** skeleton pixels → graph: nodes (endpoints, junction clusters) and edges (pixel chains between them) */
function buildGraph(S, w, h) {
  const R = [1, -w, -1, w, 1 - w, -w - 1, w - 1, w + 1];  // 4-neighbours first
  const N = w * h, deg = new Uint8Array(N), node = new Int32Array(N).fill(-1), pix = [];
  for (let i = 0; i < N; i++) if (S[i]) { let c = 0; for (const d of R) c += S[i + d]; deg[i] = c; pix.push(i); }
  const P = (i) => [(i % w) + 0.5, ((i / w) | 0) + 0.5];
  const nodes = [], edges = [];
  const addNode = (px, end) => {
    const id = nodes.length;
    let sx = 0, sy = 0;
    for (const p of px) { node[p] = id; const [x, y] = P(p); sx += x; sy += y; }
    nodes.push({ id, x: sx / px.length, y: sy / px.length, px, end, E: [], alive: true });
    return id;
  };
  const addEdge = (a, b, pts) => {
    const e = { id: edges.length, a, b, pts, alive: true, len: plen(pts) };
    edges.push(e); nodes[a].E.push(e.id); if (b !== a) nodes[b].E.push(e.id); else nodes[a].E.push(e.id);
    return e;
  };
  for (const i of pix) {
    if (deg[i] === 2 || node[i] >= 0) continue;
    const px = [i];
    if (deg[i] >= 3) {
      node[i] = -2;
      for (let k = 0; k < px.length; k++) for (const d of R) {
        const r = px[k] + d;
        if (S[r] && deg[r] >= 3 && node[r] === -1) { node[r] = -2; px.push(r); }
      }
    }
    addNode(px, deg[i] <= 1);
  }
  const vis = new Uint8Array(N);
  for (let ni = 0; ni < nodes.length; ni++) {
    const nd = nodes[ni];
    for (const p of nd.px) for (const d of R) {
      const q = p + d;
      if (!S[q] || node[q] === nd.id) continue;
      if (node[q] >= 0) {
        const o = node[q];
        if (nd.id < o && !edges.some((e) => (e.a === nd.id && e.b === o) || (e.a === o && e.b === nd.id))) addEdge(nd.id, o, [[nd.x, nd.y], [nodes[o].x, nodes[o].y]]);
        continue;
      }
      if (vis[q]) continue;
      const path = [[nd.x, nd.y], P(q)];
      vis[q] = 1;
      let prev = p, cur = q, endNode = -1;
      for (let guard = 0; guard < N; guard++) {
        let nxt = -1;
        for (const d2 of R) {
          const r = cur + d2;
          if (!S[r] || r === prev) continue;
          if (node[r] >= 0) { if (node[r] !== nd.id || path.length > 3) { endNode = node[r]; break; } continue; }
          if (!vis[r]) { nxt = r; break; }
        }
        if (endNode >= 0 || nxt < 0) break;
        vis[nxt] = 1; path.push(P(nxt)); prev = cur; cur = nxt;
      }
      if (endNode < 0) endNode = addNode([cur], true);
      else path.push([nodes[endNode].x, nodes[endNode].y]);
      addEdge(nd.id, endNode, path);
    }
  }
  // closed loops with no node on them (ㅇ): one node at the loop's top pixel
  for (const i of pix) {
    if (deg[i] !== 2 || vis[i] || node[i] >= 0) continue;
    const id = addNode([i], false);
    const path = [[nodes[id].x, nodes[id].y]];
    let prev = -1, cur = i;
    vis[i] = 1;
    for (let guard = 0; guard < N; guard++) {
      let nxt = -1;
      for (const d of R) { const r = cur + d; if (S[r] && r !== prev && !vis[r]) { nxt = r; break; } }
      if (nxt < 0) break;
      vis[nxt] = 1; path.push(P(nxt)); prev = cur; cur = nxt;
    }
    path.push([nodes[id].x, nodes[id].y]);
    addEdge(id, id, path);
  }
  return { nodes, edges };
}
const aliveE = (G, n) => n.E.filter((id) => G.edges[id].alive);
const degree = (G, n) => aliveE(G, n).length;
/** pts of edge e oriented to start at node id */
const fromNode = (e, id) => (e.a === id ? e.pts : e.pts.slice().reverse());

/** prune spurs, contract tiny junction–junction links, dissolve degree-2 nodes — until nothing changes */
function simplify(G, spur, link) {
  for (let round = 0; round < 50; round++) {
    let changed = false;
    for (const e of G.edges) {
      if (!e.alive || e.a === e.b) continue;
      const A = G.nodes[e.a], B = G.nodes[e.b], da = degree(G, A), db = degree(G, B);
      if (e.len < spur && ((da === 1 && db >= 3) || (db === 1 && da >= 3))) {
        e.alive = false; (da === 1 ? A : B).alive = false; changed = true;
      }
    }
    for (const e of G.edges) {
      if (!e.alive || e.a === e.b) continue;
      const A = G.nodes[e.a], B = G.nodes[e.b];
      if (e.len < link && degree(G, A) >= 3 && degree(G, B) >= 3) {
        e.alive = false;
        const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
        for (const id of aliveE(G, B)) { const f = G.edges[id]; if (f.a === B.id) { f.a = A.id; f.pts.unshift([mx, my]); } if (f.b === B.id) { f.b = A.id; f.pts.push([mx, my]); } A.E.push(id); }
        for (const id of aliveE(G, A)) { const f = G.edges[id]; if (B.E.includes(id)) continue; if (f.a === A.id) f.pts.unshift([mx, my]); if (f.b === A.id) f.pts.push([mx, my]); }
        A.x = mx; A.y = my; B.alive = false; B.E = [];
        changed = true;
      }
    }
    for (const n of G.nodes) {
      if (!n.alive) continue;
      const E = aliveE(G, n);
      if (E.length !== 2 || E[0] === E[1]) continue;
      const e1 = G.edges[E[0]], e2 = G.edges[E[1]];
      const p1 = fromNode(e1, n.id).slice().reverse(), p2 = fromNode(e2, n.id);
      const a = e1.a === n.id ? e1.b : e1.a, b = e2.a === n.id ? e2.b : e2.a;
      e1.alive = e2.alive = false; n.alive = false;
      const pts = p1.concat(p2.slice(1));
      const e = { id: G.edges.length, a, b, pts, alive: true, len: plen(pts) };
      G.edges.push(e); G.nodes[a].E.push(e.id); G.nodes[b].E.push(e.id);
      changed = true;
    }
    if (!changed) break;
  }
}
/** the direction an edge leaves node id, measured past the junction's distortion */
function leaveDir(e, id, sw) {
  const P = fromNode(e, id), L = e.len;
  const a = pointAtLen(P, Math.min(0.35 * sw, 0.25 * L)), b = pointAtLen(P, Math.min(1.5 * sw, 0.75 * L));
  return norm2([b[0] - a[0], b[1] - a[1]]);
}
/** at each junction, pair the branches that continue straight through it (direction continuity) */
function pairJunctions(G, sw, maxDev) {
  const partner = new Map();
  for (const n of G.nodes) {
    if (!n.alive) continue;
    const E = aliveE(G, n).filter((id) => G.edges[id].a !== G.edges[id].b);
    if (E.length < 3) continue;
    const dirs = E.map((id) => leaveDir(G.edges[id], n.id, sw));
    const cand = [];
    for (let i = 0; i < E.length; i++) for (let j = i + 1; j < E.length; j++) {
      const dev = Math.acos(clamp(-(dirs[i][0] * dirs[j][0] + dirs[i][1] * dirs[j][1]), -1, 1));
      if (dev < maxDev) cand.push([dev, i, j]);
    }
    cand.sort((p, q) => p[0] - q[0]);
    const used = new Set();
    for (const [, i, j] of cand) {
      if (used.has(i) || used.has(j)) continue;
      used.add(i); used.add(j);
      const ki = `${E[i]}:${G.edges[E[i]].a === n.id ? 0 : 1}`, kj = `${E[j]}:${G.edges[E[j]].a === n.id ? 0 : 1}`;
      partner.set(ki, kj); partner.set(kj, ki);
    }
  }
  return partner;
}
/** chains of edges joined through paired junctions; each chain knows whether its ends are free (true endpoints) */
function chainEdges(G, partner) {
  const used = new Set(), chains = [];
  const walk = (e0, end0) => {
    let pts = [], e = e0, end = end0;
    const first = G.nodes[end0 === 0 ? e0.a : e0.b];
    let last = null;
    for (let guard = 0; guard < 200; guard++) {
      used.add(e.id);
      const P = end === 0 ? e.pts : e.pts.slice().reverse();
      pts = pts.length ? pts.concat(P.slice(1)) : P.slice();
      const other = 1 - end;
      last = G.nodes[other === 0 ? e.a : e.b];
      const nx = partner.get(`${e.id}:${other}`);
      if (!nx) break;
      const [id, side] = nx.split(':').map(Number);
      if (used.has(id)) break;
      e = G.edges[id]; end = side;
    }
    chains.push({ pts, freeStart: degree(G, first) === 1, freeEnd: degree(G, last) === 1 });
  };
  for (const e of G.edges) {
    if (!e.alive || used.has(e.id)) continue;
    if (!partner.has(`${e.id}:0`)) walk(e, 0);
    else if (!partner.has(`${e.id}:1`)) walk(e, 1);
  }
  for (const e of G.edges) if (e.alive && !used.has(e.id)) walk(e, 0);
  return chains;
}
/**
 * Split a chain at sharp corners, orient every piece (a horizontal runs left → right, anything steeper runs down),
 * and re-join neighbouring pieces whose orientation agrees with the chain: ㄱ and ㄴ stay one stroke, ㄹ becomes ㄱ, ㅡ, ㄴ.
 */
function splitOrient(chain, sw) {
  let P = smoothPts(resample(chain.pts, 2), 1, 2);
  const n = P.length, k = Math.max(2, Math.round((0.75 * sw) / 2));
  const turn = new Float32Array(n);
  for (let i = k; i < n - k; i++) {
    const a = norm2([P[i][0] - P[i - k][0], P[i][1] - P[i - k][1]]), b = norm2([P[i + k][0] - P[i][0], P[i + k][1] - P[i][1]]);
    turn[i] = Math.acos(clamp(a[0] * b[0] + a[1] * b[1], -1, 1));
  }
  const cuts = [];
  for (let i = k; i < n - k; i++) {
    if (turn[i] < 0.9) continue;
    let best = true;
    for (let j = Math.max(0, i - k); j <= Math.min(n - 1, i + k); j++) if (turn[j] > turn[i] || (turn[j] === turn[i] && j < i)) { best = false; break; }
    if (best) cuts.push(i);
  }
  const pieces = [];
  let s = 0;
  for (const c of [...cuts, n - 1]) { pieces.push(P.slice(s, c + 1)); s = c; }
  const fwd = pieces.map((q) => {
    const dx = q[q.length - 1][0] - q[0][0], dy = q[q.length - 1][1] - q[0][1];
    return Math.abs(dy) <= 0.36 * Math.abs(dx) ? dx > 0 : dy > 0;
  });
  const out = [];
  for (let i = 0; i < pieces.length;) {
    let j = i, pts = pieces[i].slice();
    while (j + 1 < pieces.length && fwd[j + 1] === fwd[i]) { j++; pts = pts.concat(pieces[j].slice(1)); }
    const fs = i === 0 ? chain.freeStart : false, fe = j === pieces.length - 1 ? chain.freeEnd : false;
    out.push(fwd[i] ? { pts, freeStart: fs, freeEnd: fe, corners: j - i } : { pts: pts.reverse(), freeStart: fe, freeEnd: fs, corners: j - i });
    i = j + 1;
  }
  return out;
}
/** does polyline A cross polyline B (proper segment intersection)? */
function crosses(A, B) {
  const sA = resample(A, 6), sB = resample(B, 6);
  for (let i = 1; i < sA.length; i++) for (let j = 1; j < sB.length; j++) {
    const [p, q] = [sA[i - 1], sA[i]], [r, s] = [sB[j - 1], sB[j]];
    const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
    if (Math.abs(d) < 1e-9) continue;
    const u = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d;
    const v = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
    if (u > 0.05 && u < 0.95 && v > 0.05 && v < 0.95 && i > 1 && j > 1 && i < sA.length - 1 && j < sB.length - 1) return true;
  }
  return false;
}
const isHoriz = (s) => { const q = pointAtLen(s.pts, Math.min(40, plen(s.pts))); const dx = q[0] - s.pts[0][0], dy = q[1] - s.pts[0][1]; return Math.abs(dy) <= 0.5 * Math.abs(dx); };
/**
 * Hangul stroke order inside one jamo: a horizontal before the vertical it crosses; strokes that share columns (their
 * x-extents overlap) go top to bottom, strokes side by side go left to right; strokes that start at the same point: the
 * horizontal first; side-by-side strokes that start in the same column: the upper first.
 */
function before(A, B, sw) {
  if (A.hz !== B.hz && crosses(A.pts, B.pts)) return A.hz;
  const a = A.pts[0], b = B.pts[0], dx = b[0] - a[0], dy = b[1] - a[1];
  if (Math.hypot(dx, dy) < 0.45 * sw) return A.hz !== B.hz ? A.hz : dx > 0;
  const ov = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0);
  if (ov > 0.3 * sw) return Math.abs(dy) > 0.2 * sw ? dy > 0 : dx > 0;
  return Math.abs(dx) > 0.3 * sw ? dx > 0 : dy > 0;
}
function orderJamo(strokes, sw) {
  const rest = strokes.slice(), out = [];
  while (rest.length) {
    let pick = rest.find((s) => !rest.some((o) => o !== s && before(o, s, sw)));
    if (!pick) pick = rest.slice().sort((p, q) => p.pts[0][1] + 0.5 * p.pts[0][0] - (q.pts[0][1] + 0.5 * q.pts[0][0]))[0];
    out.push(pick); rest.splice(rest.indexOf(pick), 1);
  }
  return out;
}
/** jamo slot of an ink component inside a Hangul syllable: 0 initial, 1 vowel, 2 final — by position */
function jamoSlot(ch, c, box) {
  const code = ch.codePointAt(0) - 0xac00;
  if (code < 0 || code > 11171) return 0;
  const V = Math.floor((code % 588) / 28), Tn = code % 28;
  const u = (c.cx - box.x0) / Math.max(1, box.x1 - box.x0), v = (c.cy - box.y0) / Math.max(1, box.y1 - box.y0);
  if (Tn > 0 && v > 0.62) return 2;
  const vertical = [0, 1, 2, 3, 4, 5, 6, 7, 20].includes(V), horizontal = [8, 12, 13, 17, 18].includes(V);
  if (vertical) return u > 0.6 ? 1 : 0;
  if (horizontal) return v > 0.45 ? 1 : 0;
  return u > 0.6 || v > 0.45 ? 1 : 0;
}

/** one syllable: raster → skeleton → strokes in writing order, in raster px with the baseline origin at (ox, oy) */
function glyphStrokes(ch, mkc) {
  const font = `${WEIGHT} ${RF}px "${FONT}"`;
  const m = mkc(8, 8).g;
  m.font = font;
  const mm = m.measureText(ch), pad = 16;
  const l = Math.ceil(mm.actualBoundingBoxLeft), asc = Math.ceil(mm.actualBoundingBoxAscent);
  const w = l + Math.ceil(mm.actualBoundingBoxRight) + 2 * pad, h = asc + Math.ceil(mm.actualBoundingBoxDescent) + 2 * pad;
  const ox = pad + l, oy = pad + asc;
  const alpha = textAlpha(w, h, (g) => { g.font = font; g.fillText(ch, ox, oy); });
  const N = w * h, B = new Uint8Array(N);
  for (let i = 0; i < N; i++) B[i] = alpha[i] >= 0.5 ? 1 : 0;
  const comp = components(B, w, h);
  const sd = signedDistance(alpha, w, h);
  const S = B.slice();
  zhangSuen(S, w, h);
  thinClean(S, w, h);
  // stem width: twice the median inside-distance on the skeleton
  const ds = [];
  for (let i = 0; i < N; i++) if (S[i]) ds.push(-sd[i]);
  ds.sort((a, b) => a - b);
  const sw = 2 * (ds[ds.length >> 1] || 10);
  const G = buildGraph(S, w, h);
  simplify(G, 1.15 * sw, 0.9 * sw);
  const partner = pairJunctions(G, sw, (38 * Math.PI) / 180);
  const chains = chainEdges(G, partner);
  // pieces → strokes, each with its ink component
  const box = { x0: 1e9, y0: 1e9, x1: -1, y1: -1 };
  for (const c of comp.list) if (c.n > 20) { box.x0 = Math.min(box.x0, c.x0); box.y0 = Math.min(box.y0, c.y0); box.x1 = Math.max(box.x1, c.x1); box.y1 = Math.max(box.y1, c.y1); }
  const labelAt = (p) => {
    const x = Math.round(p[0] - 0.5), y = Math.round(p[1] - 0.5);
    for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const L = comp.lab[(y + dy) * w + x + dx]; if (L >= 0) return L; }
    return -1;
  };
  const byComp = new Map();
  for (const ch2 of chains) {
    for (const s of splitOrient(ch2, sw)) {
      if (plen(s.pts) < 0.5 * sw) continue;
      s.comp = labelAt(s.pts[s.pts.length >> 1]);
      s.hz = isHoriz(s);
      s.x0 = Math.min(...s.pts.map((p) => p[0])); s.x1 = Math.max(...s.pts.map((p) => p[0]));
      if (!byComp.has(s.comp)) byComp.set(s.comp, []);
      byComp.get(s.comp).push(s);
    }
  }
  // free ends reach out to the end of the font's stroke: march along the end tangent until the ink ends
  const inside = (x, y) => { const i = Math.round(y - 0.5) * w + Math.round(x - 0.5); return alpha[i] >= 0.5; };
  const extend = (pts, atEnd) => {
    const P = atEnd ? pts : pts.slice().reverse();
    const e = P[P.length - 1], q = pointAtLen(P.slice().reverse(), Math.min(0.9 * sw, plen(P) * 0.4));
    const d = norm2([e[0] - q[0], e[1] - q[1]]);
    let s = 0;
    while (s < 2 * sw && inside(e[0] + d[0] * (s + 1), e[1] + d[1] * (s + 1))) s++;
    const ext = Math.max(0, s - 0.3 * sw);
    if (ext > 0.5) P.push([e[0] + d[0] * ext, e[1] + d[1] * ext]);
    return atEnd ? P : P.reverse();
  };
  for (const list of byComp.values()) for (const s of list) {
    if (s.freeStart) s.pts = extend(s.pts, false);
    if (s.freeEnd) s.pts = extend(s.pts, true);
  }
  // dots: a component whose skeleton is (almost) nothing is written as one dab
  for (const c of comp.list) {
    if (c.n < 20) continue;
    const list = byComp.get(c.id) || [];
    const total = list.reduce((a, s) => a + plen(s.pts), 0);
    if (total < 1.2 * sw) byComp.set(c.id, [{ dot: true, c: [c.cx + 0.5, c.cy + 0.5], r: Math.sqrt(c.n / Math.PI), pts: [[c.cx, c.cy]], comp: c.id }]);
  }
  // components in jamo order (initial → vowel → final), strokes inside each by the Hangul rules
  const comps = comp.list.filter((c) => c.n >= 20 && byComp.has(c.id));
  comps.forEach((c) => { c.slot = jamoSlot(ch, c, box); });
  comps.sort((a, b) => a.slot - b.slot || (Math.abs(a.cy - b.cy) > 0.25 * (box.y1 - box.y0) ? a.cy - b.cy : a.cx - b.cx));
  const strokes = [];
  for (const c of comps) strokes.push(...orderJamo(byComp.get(c.id), sw));
  return { ch, ox, oy, sw, adv: mm.width, strokes };
}

// ================================================================ 2 · the pen's path and the nib's ink
/**
 * A written stroke, resampled to 1.5 px. Every sample carries the nib rectangle that sweeps the ink: half-length A along
 * the nib edge and half-thickness B across it, chosen so the swept width is exactly w = w_min + (W − w_min)|sin Δ|
 * (Δ = θ_dir − θ_nib): a W × t rectangle sweeps W|sin Δ| + t|cos Δ|, so t = w_min (1 − |sin Δ|)/|cos Δ| = w_min tan(45° − |Δ|/2).
 */
function makeStroke(raw, o) {
  const P = smoothPts(resample(raw, 1.5), 3, 2), n = P.length;
  const X = new Float32Array(n), Y = new Float32Array(n), S = new Float32Array(n);
  for (let i = 0; i < n; i++) { X[i] = P[i][0]; Y[i] = P[i][1]; if (i) S[i] = S[i - 1] + Math.hypot(X[i] - X[i - 1], Y[i] - Y[i - 1]); }
  const L = S[n - 1];
  const DX = new Float32Array(n), DY = new Float32Array(n), K = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 2), b = Math.min(n - 1, i + 2);
    const d = norm2([X[b] - X[a], Y[b] - Y[a]]);
    DX[i] = d[0]; DY[i] = d[1];
  }
  if (o.dir) for (let i = 0; i < n; i++) { DX[i] = o.dir[0]; DY[i] = o.dir[1]; }
  for (let i = 1; i < n - 1; i++) {
    let d = Math.atan2(DY[i + 1], DX[i + 1]) - Math.atan2(DY[i - 1], DX[i - 1]);
    d = Math.atan2(Math.sin(d), Math.cos(d));
    K[i] = Math.abs(d) / Math.max(1e-6, S[i + 1] - S[i - 1]);
  }
  // hand time: dt/ds ∝ (κ + κ0)^(1/3) — the pen slows into tight turns (2/3 power law); straight strokes stay uniform
  const Hh = new Float32Array(n), dh = new Float32Array(n);
  let acc = 0;
  for (let i = 1; i < n; i++) {
    let ks = 0, m = 0;
    for (let j = Math.max(0, i - 5); j <= Math.min(n - 1, i + 5); j++) { ks += K[j]; m++; }
    dh[i] = Math.cbrt(ks / m + 1 / 150);
    acc += (S[i] - S[i - 1]) * dh[i]; Hh[i] = acc;
  }
  dh[0] = dh[1] || 1;
  for (let i = 0; i < n; i++) Hh[i] = acc > 0 ? Hh[i] / acc : i / Math.max(1, n - 1);
  // speed along the stroke (for the slow-pen swell)
  const V = new Float32Array(n);
  let vmax = 1e-6;
  for (let i = 0; i < n; i++) { const u = minjerkInv(Hh[i]); V[i] = (30 * u * u * (1 - u) * (1 - u)) / dh[i]; vmax = Math.max(vmax, V[i]); }
  const r = rand(o.seed), ph = r() * TAU, load = 0.95 + 0.1 * r();
  const nibW = o.W ?? NIB_W, nibMin = o.wmin ?? NIB_MIN, ang = o.nib ?? NIB_ANG;
  const nu = [Math.cos(ang), Math.sin(ang)], nv = [-nu[1], nu[0]];
  const flick = o.end === 'flick', Lf = clamp(0.32 * L, 12, 56);
  const A = new Float32Array(n), Bt = new Float32Array(n), Wp = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const s = S[i];
    const sinD = Math.abs(DX[i] * nu[1] - DY[i] * nu[0]);
    const t = nibMin * Math.tan(Math.PI / 4 - Math.asin(clamp(sinD)) / 2);
    let p = load * (1 + 0.15 * Math.exp(-s / 8)) * (1 + 0.05 * (1 - V[i] / vmax)) * (1 + 0.035 * Math.sin(s / 23 + ph));
    if (flick) p *= 1 - 0.86 * smooth((s - (L - Lf)) / Lf);
    else if (!o.dot) p *= 1 - 0.24 * smooth((s - (L - 11)) / 11);
    A[i] = (p * nibW) / 2; Bt[i] = (p * t) / 2;
    Wp[i] = p * (nibMin + (nibW - nibMin) * sinD);
  }
  // the specular streak of the wet ink: a thin ribbon on the side of the bead that faces the window
  const GX = new Float32Array(n), GY = new Float32Array(n), GH = new Float32Array(n), GA = new Float32Array(n), NX = new Float32Array(n), NY = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const nx = -DY[i], ny = DX[i], nl = nx * LIGHT[0] + ny * LIGHT[1];
    NX[i] = nx; NY[i] = ny;
    const off = nl * (Wp[i] / 2) * 0.42;
    GX[i] = X[i] + nx * off; GY[i] = Y[i] + ny * off;
    GH[i] = 0.075 * Wp[i] + 0.5;
    GA[i] = smooth((Wp[i] - 6) / 8) * (0.5 + 0.5 * Math.abs(nl)) * (0.62 + 0.38 * Math.sin(S[i] / 17 + ph * 2));
  }
  return { nu, nv, ang, X, Y, S, Hh, A, B: Bt, Wp, GX, GY, GH, GA, NX, NY, n, L, rgb: o.rgb || INK, wet: o.rgb === CORAL ? WET_CORAL : WET, end: o.end, dot: !!o.dot, freeStart: o.freeStart !== false, t0: 0, t1: 0, TW: new Float32Array(n) };
}
/** time stamps: the stroke runs [t0, t1] with a minimum-jerk profile over hand time */
function timeStroke(st, t0, t1) {
  st.t0 = t0; st.t1 = t1;
  for (let i = 0; i < st.n; i++) st.TW[i] = t0 + minjerkInv(st.Hh[i]) * (t1 - t0);
}
/** fractional sample index the pen has reached at t (−1 before the stroke) */
function reach(st, t) {
  if (t <= st.t0) return -1;
  if (t >= st.t1) return st.n - 1;
  const e = minjerk((t - st.t0) / (st.t1 - st.t0)), Hh = st.Hh;
  let lo = 0, hi = st.n - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (Hh[m] <= e) lo = m; else hi = m; }
  return lo + clamp((e - Hh[lo]) / Math.max(1e-9, Hh[hi] - Hh[lo]));
}
function sampleAt(st, fi) {
  const i = Math.max(0, Math.min(st.n - 2, Math.floor(fi))), f = clamp(fi - i);
  return [lerp(st.X[i], st.X[i + 1], f), lerp(st.Y[i], st.Y[i + 1], f)];
}

/** one quad sub-path, always wound the same way, so a single nonzero fill unions the whole sweep */
function quad(c, ax, ay, bx, by, cx, cy, dx, dy) {
  const s = (ax * by - bx * ay) + (bx * cy - cx * by) + (cx * dy - dx * cy) + (dx * ay - ax * dy);
  c.moveTo(ax, ay);
  if (s >= 0) { c.lineTo(bx, by); c.lineTo(cx, cy); c.lineTo(dx, dy); } else { c.lineTo(dx, dy); c.lineTo(cx, cy); c.lineTo(bx, by); }
}
function nibRect(c, x, y, a, b, u, v) {
  const ux = u[0] * a, uy = u[1] * a, vx = v[0] * b, vy = v[1] * b;
  quad(c, x + ux + vx, y + uy + vy, x - ux + vx, y - uy + vy, x - ux - vx, y - uy - vy, x + ux - vx, y + uy - vy);
}
/** the band a nib rectangle sweeps between two samples: the parallelogram through its extreme diagonal */
function nibBand(c, x0, y0, a0, b0, x1, y1, a1, b1, u, v) {
  const nx = y0 - y1, ny = x1 - x0;
  const su = u[0] * nx + u[1] * ny >= 0 ? 1 : -1, sv = v[0] * nx + v[1] * ny >= 0 ? 1 : -1;
  const p0x = su * a0 * u[0] + sv * b0 * v[0], p0y = su * a0 * u[1] + sv * b0 * v[1];
  const p1x = su * a1 * u[0] + sv * b1 * v[0], p1y = su * a1 * u[1] + sv * b1 * v[1];
  quad(c, x0 + p0x, y0 + p0y, x1 + p1x, y1 + p1y, x1 - p1x, y1 - p1y, x0 - p0x, y0 - p0y);
}
/** the sweep of samples [i0, fi] (fi fractional): nib rectangles at the samples + bands between them */
function sweep(c, st, i0, fi, rects) {
  const { X, Y, A, B, nu, nv } = st;
  const k = Math.min(st.n - 1, Math.floor(fi)), f = fi - k;
  let px = X[i0], py = Y[i0], pa = A[i0], pb = B[i0];
  if (rects) nibRect(c, px, py, pa, pb, nu, nv);
  const last = f > 1e-4 && k < st.n - 1 ? k + 1 : k;
  for (let i = i0 + 1; i <= last; i++) {
    let x = X[i], y = Y[i], a = A[i], b = B[i];
    if (i === k + 1) { x = lerp(X[k], x, f); y = lerp(Y[k], y, f); a = lerp(A[k], a, f); b = lerp(B[k], b, f); }
    nibBand(c, px, py, pa, pb, x, y, a, b, nu, nv);
    if (rects) nibRect(c, x, y, a, b, nu, nv);
    px = x; py = y; pa = a; pb = b;
  }
}
function glossRibbon(c, st, i0, i1, k) {
  const { GX, GY, GH, NX, NY } = st;
  for (let i = i0; i < i1; i++) {
    const j = i + 1, hi = GH[i] * k, hj = GH[j] * k;
    quad(c, GX[i] + NX[i] * hi, GY[i] + NY[i] * hi, GX[i] - NX[i] * hi, GY[i] - NY[i] * hi,
      GX[j] - NX[j] * hj, GY[j] - NY[j] * hj, GX[j] + NX[j] * hj, GY[j] + NY[j] * hj);
  }
}
// wet → matte: the gloss is gone about a second behind the pen
const wetness = (age) => (age < 0 ? 0 : 1 - smooth((age - 0.1) / 1.0));

/** pools: a resting nib leaves a darker drop at the start, and at the end of a stroke that stops */
function pools(st) {
  const out = [];
  const at = (i, k, kb, a) => ({ x: st.X[i], y: st.Y[i], ra: st.A[i] * k, rb: Math.max(st.B[i] * 1.5, st.A[i] * kb), a, t: st.TW[i] });
  if (st.dot) { out.push(at(st.n >> 1, 0.8, 0.5, 0.42)); return out; }
  out.push(at(Math.min(2, st.n - 1), 0.9, 0.36, st.freeStart ? 0.3 : 0.14));
  if (st.end !== 'flick') out.push(at(Math.max(0, st.n - 3), 0.78, 0.32, 0.24));
  return out;
}

function drawStroke(c, st, t) {
  const fi = reach(st, t);
  if (fi < 0) return;
  c.beginPath();
  sweep(c, st, 0, fi, true);
  c.fillStyle = rgba(st.rgb, 1);
  c.fill();
  if (st.shade) { c.fillStyle = st.shade; c.fill(); }   // ink shading: the bead drains toward where the nib stops
  for (const p of st.pools) {
    if (t < p.t + 0.02) continue;
    const g = smooth((t - p.t - 0.02) / 0.12), gr = 1 + (st.rest || 0) * smooth((t - st.t1) / 0.4);
    c.beginPath(); c.ellipse(p.x, p.y, p.ra * gr, p.rb * gr, st.ang, 0, TAU);
    c.fillStyle = rgba(st.rgb, p.a * g); c.fill();
  }
}
/** the still-wet part of a stroke: a deeper, bluer bead (multiply) and its specular streak (drawn later, on top) */
function drawWet(c, st, t, pass) {
  const fi = reach(st, t);
  if (fi < 1) return;
  const k = Math.floor(fi), CH = 3;
  let i0 = k;
  while (i0 > 0 && wetness(t - st.TW[i0 - 1]) > 0.004) i0--;
  for (let i = i0; i < k; i += CH) {
    const j = Math.min(k, i + CH), wv = wetness(t - st.TW[(i + j) >> 1]);
    if (wv < 0.004) continue;
    if (pass === 0) { c.beginPath(); sweep(c, st, i, j, false); c.fillStyle = rgba(st.wet, 0.62 * wv); c.fill(); continue; }
    const ga = wv * st.GA[(i + j) >> 1];
    c.beginPath(); glossRibbon(c, st, i, j, 2.4); c.fillStyle = `rgba(214,226,255,${0.13 * ga})`; c.fill();
    c.beginPath(); glossRibbon(c, st, i, j, 0.75); c.fillStyle = `rgba(255,255,255,${0.34 * ga})`; c.fill();
  }
  if (pass === 1) for (const p of st.pools) {
    const wv = wetness((t - p.t) / 1.6);
    if (wv < 0.004 || t < p.t) continue;
    c.beginPath(); c.ellipse(p.x + LIGHT[0] * p.rb * 0.45, p.y + LIGHT[1] * p.rb * 0.45, p.ra * 0.42, p.rb * 0.3, st.ang, 0, TAU);
    c.fillStyle = `rgba(255,255,255,${0.32 * wv})`; c.fill();
  }
}

// ================================================================ 3 · props, page, light (baked)
function mkCanvas(headless) {
  return (w, h) => {
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(w)); cv.height = Math.max(1, Math.round(h));
    return { cv, g: cv.getContext('2d', headless ? { willReadFrequently: true } : undefined) };
  };
}
const WB = [-80, -80, 1240, 2080];   // world bounds of the baked desk
const WS = 1.3;                      // its bake scale
const PAGE = { x: 58, y: 166, w: 970, h: 1398 };
const DOT = 36;                      // dot grid pitch (px)

/** the pen seen from above, nib tip at (0,0), axis +x (toward the hand) — flat illustration, rounded */
function drawPenArt(g, sil) {
  const fillGrad = (r, stops) => {
    if (sil) { g.fillStyle = '#000'; return; }
    const gr = g.createLinearGradient(0, -r, 0, r);
    for (const [k, col] of stops) gr.addColorStop(k, col);
    g.fillStyle = gr;
  };
  // barrel (widens a little toward the camera end: the pen leans back toward the viewer)
  g.beginPath();
  g.moveTo(262, -26); g.lineTo(706, -30);
  g.bezierCurveTo(734, -30, 748, -17, 748, 0); g.bezierCurveTo(748, 17, 734, 30, 706, 30);
  g.lineTo(262, 26); g.closePath();
  fillGrad(30, [[0, '#18203d'], [0.16, '#4d64a0'], [0.3, '#6a80bb'], [0.44, '#3a4f88'], [0.78, '#25325c'], [1, '#121831']]);
  g.fill();
  if (!sil) {
    g.fillStyle = 'rgba(255,255,255,0.22)';
    g.beginPath(); g.moveTo(300, -16); g.lineTo(690, -19); g.lineTo(690, -14); g.lineTo(300, -12); g.fill();
  }
  // brass trims
  const band = (x0, x1, r0, r1) => {
    g.beginPath(); g.moveTo(x0, -r0); g.lineTo(x1, -r1); g.lineTo(x1, r1); g.lineTo(x0, r0); g.closePath();
    fillGrad(r1, [[0, '#7a5a22'], [0.18, '#f4dc98'], [0.36, '#cfa54e'], [0.75, '#9b7430'], [1, '#5e4418']]);
    g.fill();
  };
  band(686, 700, 29.5, 29.8);
  band(244, 264, 25, 27);
  // grip section: dark resin, slightly waisted
  g.beginPath();
  g.moveTo(84, -15); g.bezierCurveTo(140, -17, 190, -21, 248, -24); g.lineTo(248, 24); g.bezierCurveTo(190, 21, 140, 17, 84, 15); g.closePath();
  fillGrad(24, [[0, '#0d0e12'], [0.2, '#4c505d'], [0.36, '#2b2e38'], [1, '#0b0c10']]);
  g.fill();
  // steel nib: a flat chisel tip as wide as the ink it makes
  g.beginPath();
  g.moveTo(0, -11.5); g.lineTo(6, -12.5); g.bezierCurveTo(30, -15, 52, -20, 74, -22); g.bezierCurveTo(88, -23, 98, -19, 104, -12);
  g.lineTo(104, 12); g.bezierCurveTo(98, 19, 88, 23, 74, 22); g.bezierCurveTo(52, 20, 30, 15, 6, 12.5); g.lineTo(0, 11.5); g.closePath();
  fillGrad(22, [[0, '#6d737d'], [0.2, '#eef1f5'], [0.38, '#cfd4db'], [0.7, '#99a0aa'], [1, '#5f646d']]);
  g.fill();
  if (!sil) {
    g.fillStyle = 'rgba(30,38,72,0.9)';
    g.fillRect(0, -11.5, 3, 23);                                  // inked tip
    g.strokeStyle = 'rgba(40,44,54,0.85)'; g.lineWidth = 1.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(2, 0); g.lineTo(45, 0); g.stroke();   // slit
    g.fillStyle = '#2a2d36'; g.beginPath(); g.arc(48.5, 0, 3.4, 0, TAU); g.fill();   // breather hole
    g.strokeStyle = 'rgba(70,74,84,0.45)'; g.lineWidth = 1.1;      // shoulder lines
    g.beginPath(); g.moveTo(62, -15); g.quadraticCurveTo(80, -11, 96, -14); g.moveTo(62, 15); g.quadraticCurveTo(80, 11, 96, 14); g.stroke();
    g.lineCap = 'butt';
  }
}
function bakePen(mkc) {
  const S = 2, pad = 40, len = 748, rad = 32;
  const w = (len + 2 * pad) * S, h = (2 * rad + 2 * pad) * S;
  const mk = () => { const a = mkc(w, h); a.g.setTransform(S, 0, 0, S, pad * S, (pad + rad) * S); return a; };
  const art = mk(); drawPenArt(art.g, false);
  const sil = mk(); drawPenArt(sil.g, true);
  // shadow: crisp where the nib touches the paper, softer and softer toward the raised end
  const near = mkc(w, h), far = mkc(w, h), soft = mkc(w, h), sh = mkc(w, h);
  near.g.filter = `blur(${2 * S}px)`; near.g.drawImage(sil.cv, 0, 0);
  far.g.filter = `blur(${11 * S}px)`; far.g.drawImage(sil.cv, 0, 0);
  soft.g.filter = `blur(${20 * S}px)`; soft.g.drawImage(sil.cv, 0, 0);
  const grad = (cv, inv) => {
    const g = cv.getContext('2d');
    const gr = g.createLinearGradient(pad * S, 0, (pad + 420) * S, 0);
    gr.addColorStop(0, inv ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0)'); gr.addColorStop(1, inv ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-in'; g.fillStyle = gr; g.fillRect(0, 0, w, h);
  };
  grad(near.cv, true); grad(far.cv, false);
  sh.g.drawImage(near.cv, 0, 0); sh.g.drawImage(far.cv, 0, 0);
  return { art: art.cv, sh: sh.cv, soft: soft.cv, S, ax: pad * S, ay: (pad + rad) * S };
}

function bakeDesk(mkc) {
  const [wx, wy, ww, wh] = WB;
  const o = mkc(ww * WS, wh * WS), g = o.g, r = rand(13701);
  g.setTransform(WS, 0, 0, WS, -wx * WS, -wy * WS);
  // light oak, planks running across
  const gr = g.createLinearGradient(wx, wy, wx + 400, wy + wh);
  gr.addColorStop(0, '#c99b6b'); gr.addColorStop(1, '#a87a4f');
  g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
  for (let i = 0; i < 260; i++) {
    const y0 = wy + r() * wh, amp = 2 + r() * 9, fr = 0.002 + r() * 0.006, ph = r() * TAU;
    g.strokeStyle = r() < 0.6 ? `rgba(110,70,38,${0.07 + r() * 0.13})` : `rgba(236,200,156,${0.05 + r() * 0.1})`;
    g.lineWidth = 0.6 + r() * 2.2;
    g.beginPath();
    for (let x = wx; x <= wx + ww; x += 12) {
      const y = y0 + amp * Math.sin(x * fr + ph) + 2 * Math.sin(x * fr * 3.1 + ph * 1.7);
      if (x === wx) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }
  g.fillStyle = 'rgba(70,40,18,0.32)';
  for (const sy of [-12, 1838]) g.fillRect(wx, sy, ww, 3);
  // the mug (top right, on the desk): shadow, body, rim, tea with the window in it
  const mx = 905, my = 30;
  g.save(); g.filter = `blur(${16 * WS}px)`; g.fillStyle = 'rgba(60,34,14,0.5)';
  g.beginPath(); g.arc(mx + 26, my + 34, 120, 0, TAU); g.fill(); g.restore();
  g.save();
  g.fillStyle = '#e9e1d3'; g.beginPath(); g.roundRect(mx + 96, my - 26, 80, 52, 24); g.fill();   // handle
  g.fillStyle = '#c9bfae'; g.beginPath(); g.roundRect(mx + 112, my - 12, 46, 24, 12); g.fill();
  const body = g.createRadialGradient(mx - 40, my - 40, 10, mx, my, 120);
  body.addColorStop(0, '#fbf7ef'); body.addColorStop(0.7, '#e8dfcf'); body.addColorStop(1, '#cbbfa9');
  g.fillStyle = body; g.beginPath(); g.arc(mx, my, 116, 0, TAU); g.fill();
  g.fillStyle = '#d6cbb8'; g.beginPath(); g.arc(mx, my, 100, 0, TAU); g.fill();
  const tea = g.createRadialGradient(mx - 30, my - 30, 4, mx, my, 92);
  tea.addColorStop(0, '#a8693a'); tea.addColorStop(0.6, '#7d4521'); tea.addColorStop(1, '#4e2810');
  g.fillStyle = tea; g.beginPath(); g.arc(mx, my, 91, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,240,220,0.42)';
  g.beginPath(); g.ellipse(mx - 34, my - 30, 30, 14, -0.7, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,240,220,0.18)';
  g.beginPath(); g.ellipse(mx - 6, my - 2, 52, 30, -0.7, 0, TAU); g.fill();
  g.restore();
  // the open notebook: cover, the page block's shadow, page edges
  const P = PAGE;
  g.save(); g.filter = `blur(${22 * WS}px)`; g.fillStyle = 'rgba(70,38,14,0.55)';
  g.fillRect(P.x - 600 + 24, P.y + 30, P.w + 600, P.h + 20); g.restore();
  g.save(); g.filter = `blur(${4 * WS}px)`; g.fillStyle = 'rgba(60,30,10,0.45)';
  g.fillRect(P.x - 600 + 4, P.y + 6, P.w + 600 + 10, P.h + 14); g.restore();
  g.fillStyle = '#2f3a5c';
  g.beginPath(); g.roundRect(P.x - 640, P.y - 12, P.w + 640 + 16, P.h + 26, 14); g.fill();
  for (let k = 4; k >= 1; k--) {   // the page block's edges
    g.fillStyle = k % 2 ? '#e2d8c4' : '#efe6d4';
    g.fillRect(P.x - 600, P.y + k * 1.6, P.w + 600 + k * 2.2, P.h + k * 2.4);
  }
  // the page
  g.fillStyle = '#f6efe1';
  g.fillRect(P.x - 600, P.y, P.w + 600, P.h);
  g.save();
  g.beginPath(); g.rect(P.x - 600, P.y, P.w + 600, P.h); g.clip();
  for (let i = 0; i < 70; i++) {   // mottling
    const x = P.x + r() * P.w, y = P.y + r() * P.h, rad = 80 + r() * 260;
    const rg = g.createRadialGradient(x, y, 0, x, y, rad);
    const col = r() < 0.5 ? [200, 176, 140] : [255, 252, 244];
    rg.addColorStop(0, rgba(col, 0.04 + r() * 0.035)); rg.addColorStop(1, rgba(col, 0));
    g.fillStyle = rg; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
  }
  // dot grid (5 mm), one row on the baseline
  g.fillStyle = 'rgba(122,104,86,0.4)';
  const gx0 = P.x + 30 + ((540 - P.x - 30) % DOT), gy0 = P.y + ((BASE_Y - P.y) % DOT);
  g.beginPath();
  for (let y = gy0; y < P.y + P.h - 12; y += DOT) for (let x = gx0 - DOT * 30; x < P.x + P.w - 12; x += DOT) {
    if (y < P.y + 12) continue;
    g.moveTo(x + 1.8, y); g.arc(x, y, 1.8, 0, TAU);
  }
  g.fill();
  // gutter: the pages curve down into the binding
  const gut = g.createLinearGradient(P.x - 70, 0, P.x + 120, 0);
  gut.addColorStop(0, 'rgba(120,92,60,0)'); gut.addColorStop(0.32, 'rgba(110,84,56,0.34)'); gut.addColorStop(0.37, 'rgba(90,66,42,0.5)');
  gut.addColorStop(0.42, 'rgba(255,250,238,0.2)'); gut.addColorStop(0.6, 'rgba(120,92,60,0.12)'); gut.addColorStop(1, 'rgba(120,92,60,0)');
  g.fillStyle = gut; g.fillRect(P.x - 70, P.y, 190, P.h);
  // edges age a little darker; the bottom-right curls very slightly
  const edge = (x0, y0, x1, y1, a) => {
    const lg = g.createLinearGradient(x0, y0, x1, y1);
    lg.addColorStop(0, `rgba(160,128,88,${a})`); lg.addColorStop(1, 'rgba(160,128,88,0)');
    g.fillStyle = lg; g.fillRect(P.x - 600, P.y, P.w + 600, P.h);
  };
  edge(P.x + P.w, 0, P.x + P.w - 40, 0, 0.14); edge(0, P.y, 0, P.y + 34, 0.12); edge(0, P.y + P.h, 0, P.y + P.h - 40, 0.14);
  g.restore();
  // paper grain (multiply)
  const gw = Math.round((P.w + 120) * WS), gh = Math.round(P.h * WS), gn = mkc(gw, gh);
  const img = gn.g.createImageData(gw, gh), d = img.data;
  for (let i = 0; i < gw * gh; i++) {
    const v = 255 - Math.pow(r(), 3) * 18 - r() * 5;
    d[i * 4] = v; d[i * 4 + 1] = v - 1; d[i * 4 + 2] = v - 3; d[i * 4 + 3] = 255;
  }
  gn.g.putImageData(img, 0, 0);
  g.save(); g.globalCompositeOperation = 'multiply';
  g.drawImage(gn.cv, P.x - 120, P.y, P.w + 120, P.h); g.restore();
  return o.cv;
}
/** window light, baked at half resolution: a multiply layer (falloff, frame shadows) and a warm screen layer */
function bakeLight(mkc) {
  const [wx, wy, ww, wh] = WB, LS = 0.5;
  const mul = mkc(ww * LS, wh * LS), scr = mkc(ww * LS, wh * LS);
  const g = mul.g;
  g.setTransform(LS, 0, 0, LS, -wx * LS, -wy * LS);
  // falloff away from the window
  const amb = g.createLinearGradient(-200, -300, 1300, 2300);
  amb.addColorStop(0, '#ffffff'); amb.addColorStop(0.45, '#fbf6ef'); amb.addColorStop(0.8, '#e8dbcd'); amb.addColorStop(1, '#cdb8a4');
  g.fillStyle = amb; g.fillRect(wx, wy, ww, wh);
  // the window frame's shadow: the top of the frame, a transom above the line, a mullion down the gutter, and the far
  // edge of the window's light near the bottom of the page — soft, warm grey
  g.save(); g.filter = `blur(${15 * LS}px)`;
  const band = (x0, y0, x1, y1, wd, col) => {
    const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), nx = (-dy / l) * wd / 2, ny = (dx / l) * wd / 2;
    g.fillStyle = col; g.beginPath(); g.moveTo(x0 + nx, y0 + ny); g.lineTo(x1 + nx, y1 + ny); g.lineTo(x1 - nx, y1 - ny); g.lineTo(x0 - nx, y0 - ny); g.closePath(); g.fill();
  };
  band(-300, 690, 1400, 160, 46, '#e3d7cd');
  g.fillStyle = '#e9dfd6';
  g.beginPath(); g.moveTo(-300, 290); g.lineTo(1400, -240); g.lineTo(1400, -400); g.lineTo(-300, -400); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(1400, 1270); g.lineTo(-300, 2050); g.lineTo(-300, 2300); g.lineTo(1400, 2300); g.closePath(); g.fill();
  g.restore();
  const s = scr.g;
  s.setTransform(LS, 0, 0, LS, -wx * LS, -wy * LS);
  const glow = s.createRadialGradient(220, 420, 0, 220, 420, 1250);
  glow.addColorStop(0, 'rgba(255,214,166,0.17)'); glow.addColorStop(0.55, 'rgba(255,200,150,0.06)'); glow.addColorStop(1, 'rgba(255,190,130,0)');
  s.fillStyle = glow; s.fillRect(wx, wy, ww, wh);
  return { mul: mul.cv, scr: scr.cv, LS };
}
/** soft shadows of a potted plant's leaves on the sill (upper left), swaying a little */
function bakeLeaves(mkc) {
  const w = 760, h = 760, a = mkc(w, h), g = a.g, r = rand(13702);
  g.fillStyle = '#000';
  const leaf = (x, y, len, wid, ang) => {
    g.save(); g.translate(x, y); g.rotate(ang);
    g.beginPath(); g.moveTo(0, 0);
    g.bezierCurveTo(len * 0.3, -wid, len * 0.75, -wid * 0.8, len, 0);
    g.bezierCurveTo(len * 0.75, wid * 0.8, len * 0.3, wid, 0, 0);
    g.fill(); g.restore();
  };
  g.lineCap = 'round'; g.strokeStyle = '#000';
  // three stems leaning out from the pot (off frame, upper left), alternate leaves along each
  for (const [x0, y0, ang, n, len] of [[30, 30, 0.7, 6, 64], [10, 110, 1.05, 5, 60], [110, 10, 0.4, 5, 62]]) {
    let x = x0, y = y0, a = ang;
    g.lineWidth = 5;
    g.beginPath(); g.moveTo(x, y);
    const pts = [];
    for (let k = 0; k < n; k++) { a += 0.08 * Math.sin(k * 1.7 + x0); x += Math.cos(a) * len; y += Math.sin(a) * len; g.lineTo(x, y); pts.push([x, y, a]); }
    g.stroke();
    g.lineWidth = 3;
    pts.forEach(([px, py, pa], k) => {
      const side = k % 2 ? 1 : -1, la = pa + side * (0.7 + r() * 0.35), ll = 92 + r() * 58;
      g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(la) * 14, py + Math.sin(la) * 14); g.stroke();
      leaf(px + Math.cos(la) * 12, py + Math.sin(la) * 12, ll, 24 + r() * 12, la + side * 0.12);
    });
    leaf(x, y, 80, 22, a);
  }
  const b = mkc(w, h);
  b.g.filter = 'blur(4px)'; b.g.drawImage(a.cv, 0, 0);
  return b.cv;
}

// ================================================================ 4 · the demo
defineDemo({
  id: '137-pen-write-on',
  title: '펜으로 쓴 안부',
  tech: '손글씨 쓰기 · 글리프 골격화 + 획 순서 + 납작펜 굵기',
  duration: D,
  background: '#2a1d14',

  async setup(api) {
    const headless = api.headless;
    const mkc = mkCanvas(headless);
    await fontReady(`${WEIGHT} ${RF}px "${FONT}"`, TEXT);

    const { ctx } = api.canvas({ type: '2d', attrs: headless ? { willReadFrequently: true } : undefined });
    this.c = ctx;
    this.desk = bakeDesk(mkc);
    this.light = bakeLight(mkc);
    this.leaves = bakeLeaves(mkc);
    this.pen = bakePen(mkc);

    // ---- strokes from the font, placed as handwriting
    const k = EM / RF, R = rand(1370);
    const syl = [];
    let x = 0;
    for (const ch of Array.from(TEXT)) {
      if (ch === ' ') { x += EM * 0.26; continue; }
      const gs = glyphStrokes(ch, mkc);
      const j = { rot: (R() - 0.5) * 0.05, sc: 0.95 + R() * 0.08, dy: (R() - 0.5) * 10 };
      if (ch === '?') { j.sc *= 1.12; x += EM * 0.07; }
      syl.push({ gs, x, j });
      x += gs.adv * k * j.sc * 0.9;
    }
    const x0 = 540 - x / 2 + 6;
    const SLANT = 0.1;
    const wob = rand(1371), w1 = wob() * TAU, w2 = wob() * TAU, w3 = wob() * TAU;
    const place = (s, p) => {
      let lx = (p[0] - s.gs.ox) * k, ly = (p[1] - s.gs.oy) * k;
      lx -= SLANT * ly;
      const c = Math.cos(s.j.rot), sn = Math.sin(s.j.rot);
      let X = x0 + s.x + (lx * c - ly * sn) * s.j.sc, Y = BASE_Y + s.j.dy + (lx * sn + ly * c) * s.j.sc;
      X += 1.7 * Math.sin(X * 0.023 + Y * 0.011 + w1) + 0.8 * Math.sin(Y * 0.051 + w2);
      Y += 1.5 * Math.sin(Y * 0.019 - X * 0.014 + w3) + 0.7 * Math.sin(X * 0.047 + w1);
      return [X, Y];
    };
    const strokes = [];
    let seed = 50;
    syl.forEach((s, si) => {
      for (const g of s.gs.strokes) {
        let st;
        if (g.dot) {
          const c = place(s, g.c), rr = g.r * k * s.j.sc * 0.62, d = [Math.cos(1.25), Math.sin(1.25)];
          st = makeStroke([[c[0] - d[0] * rr, c[1] - d[1] * rr], [c[0] + d[0] * rr, c[1] + d[1] * rr]], { seed: seed++, dot: true, dir: d, end: 'stop' });
        } else {
          const pts = g.pts.map((p) => place(s, p));
          const e0 = pts[Math.max(0, pts.length - 8)], e1 = pts[pts.length - 1];
          const flick = g.freeEnd && e1[0] - e0[0] < -0.35 * Math.abs(e1[1] - e0[1]);
          st = makeStroke(pts, { seed: seed++, end: flick ? 'flick' : 'stop', freeStart: g.freeStart });
        }
        st.syl = si;
        st.pools = pools(st);
        strokes.push(st);
      }
    });
    // ---- timing: stroke time grows sub-linearly with length, lifts with distance; scaled to the writing window
    const dur = strokes.map((st) => (st.dot ? 0.1 : 0.05 + 0.0105 * Math.pow(st.L, 0.62)));
    const air = [];
    for (let i = 0; i + 1 < strokes.length; i++) {
      const a = strokes[i], b = strokes[i + 1];
      const d = Math.hypot(b.X[0] - a.X[a.n - 1], b.Y[0] - a.Y[a.n - 1]);
      air.push(0.04 + 0.0062 * Math.pow(d, 0.62) + (a.syl !== b.syl ? 0.07 : 0));
    }
    const tot = dur.reduce((p, q) => p + q, 0) + air.reduce((p, q) => p + q, 0);
    const f = (T.write[1] - T.write[0]) / tot;
    let tt = T.write[0];
    strokes.forEach((st, i) => {
      timeStroke(st, tt, tt + dur[i] * f);
      st.pools = pools(st);
      tt = st.t1 + (i < air.length ? air[i] * f : 0);
    });
    strokes[strokes.length - 1].rest = 0.28;
    this.strokes = strokes;

    // ---- the coral flourish: an underline swash under the line, then a small one-stroke heart at its end
    let mnx = 1e9, mxx = -1e9;
    for (const st of strokes) for (let i = 0; i < st.n; i++) { mnx = Math.min(mnx, st.X[i]); mxx = Math.max(mxx, st.X[i]); }
    const uy = BASE_Y + 80, ur = [];
    for (let i = 0; i <= 200; i++) {   // a swash: a little entry hook, a slow sag, a lift into the flick
      const u = i / 200;
      ur.push([lerp(mnx - 4, mxx - 118, u) + 10 * Math.pow(1 - u, 8), uy + 6 - 16 * u + 10 * Math.sin(Math.PI * u) - 26 * Math.pow(u, 7) - 8 * Math.pow(1 - u, 10)]);
    }
    const under = makeStroke(ur, { seed: 91, rgb: CORAL, W: 15, wmin: 3, nib: -1.3, end: 'flick' });
    timeStroke(under, T.under[0], T.under[1]);
    const hc = [mxx - 40, uy - 26], hs = 2.55, hr = -0.2, heartRaw = [];
    for (let i = 0; i <= 260; i++) {
      const u = Math.PI + (i / 260) * (TAU + 0.32);   // from the tip up the left lobe, round, and a little past the tip
      const hx = 16 * Math.pow(Math.sin(u), 3), hy = -(13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u));
      const sx = hx * hs * (1 + 0.05 * Math.sin(u * 2 + 0.4)), sy = hy * hs;
      heartRaw.push([hc[0] + sx * Math.cos(hr) - sy * Math.sin(hr), hc[1] + sx * Math.sin(hr) + sy * Math.cos(hr)]);
    }
    const heart = makeStroke(heartRaw, { seed: 92, rgb: CORAL, W: 14, wmin: 3, nib: -1.3, end: 'flick' });
    timeStroke(heart, T.heart[0], T.heart[1]);
    this.coral = [under, heart];
    // the closing frame fits the written line and its flourish
    let hx1 = -1e9;
    for (let i = 0; i < heart.n; i++) hx1 = Math.max(hx1, heart.X[i] + heart.A[i]);
    this.fitZ = Math.min(1.12, 1080 / ((Math.max(mxx, hx1) - mnx) * 1.035 + 150));
    this.fitX = (mnx + Math.max(mxx, hx1)) / 2;
    for (const st of this.coral) st.pools = pools(st);
    // ink shading gradients (world space, made once)
    for (const st of [...strokes, ...this.coral]) {
      if (st.dot || st.L < 14) continue;
      const gr = ctx.createLinearGradient(st.X[0], st.Y[0], st.X[st.n - 1], st.Y[st.n - 1]);
      const deep = st.rgb === CORAL ? [150, 40, 30] : DEEP;
      gr.addColorStop(0, rgba(deep, 0.2)); gr.addColorStop(0.16, rgba(deep, 0)); gr.addColorStop(0.6, rgba(deep, 0.04)); gr.addColorStop(1, rgba(deep, 0.32));
      st.shade = gr;
    }

    // ---- the pen's path: in, strokes and lifts, out
    const ev = [];
    const OFF_IN = [640, 1330], OFF_OUT = [1380, 2250];
    const first = strokes[0], lastSt = strokes[strokes.length - 1];
    ev.push({ kind: 'in', t0: T.penIn[0], t1: T.penIn[1], a: OFF_IN, b: [first.X[0], first.Y[0]] });
    ev.push({ kind: 'wait', t0: T.penIn[1], t1: first.t0, a: [first.X[0], first.Y[0]] });
    strokes.forEach((st, i) => {
      ev.push({ kind: 'ink', t0: st.t0, t1: st.t1, st });
      if (i + 1 < strokes.length) {
        const nx = strokes[i + 1], a = [st.X[st.n - 1], st.Y[st.n - 1]], b = [nx.X[0], nx.Y[0]];
        ev.push({ kind: 'air', t0: st.t1, t1: nx.t0, a, b, h: 10 + 30 * Math.min(1, Math.hypot(b[0] - a[0], b[1] - a[1]) / 170) });
      }
    });
    const endP = [lastSt.X[lastSt.n - 1], lastSt.Y[lastSt.n - 1]];
    ev.push({ kind: 'wait', t0: lastSt.t1, t1: lastSt.t1 + T.hold, a: endP });
    ev.push({ kind: 'out', t0: lastSt.t1 + T.hold, t1: lastSt.t1 + T.hold + T.penOut, a: endP, b: OFF_OUT });
    this.ev = ev;
    this.tEnd = lastSt.t1;
    // camera x: the write head (pen x, held at the first and last stroke) smoothed with a Gaussian, σ = 0.42 s
    const FPS = 60, NC = Math.round(D * FPS), raw = new Float32Array(NC + 1), camX = new Float32Array(NC + 1);
    for (let i = 0; i <= NC; i++) raw[i] = penAt(ev, clamp(i / FPS, first.t0, lastSt.t1)).p[0];
    const sig = 0.42 * FPS, R3 = Math.ceil(3 * sig);
    for (let i = 0; i <= NC; i++) {
      let a = 0, ws = 0;
      for (let j = -R3; j <= R3; j++) { const wg = Math.exp(-(j * j) / (2 * sig * sig)); a += raw[clamp(i + j, 0, NC)] * wg; ws += wg; }
      camX[i] = a / ws;
    }
    this.camX = camX; this.camFps = FPS;

    // warm up every offscreen once (first composite of a canvas can rasterise differently)
    ctx.drawImage(this.desk, 0, 0, 4, 4); ctx.drawImage(this.light.mul, 0, 0, 4, 4); ctx.drawImage(this.light.scr, 0, 0, 4, 4);
    ctx.drawImage(this.leaves, 0, 0, 4, 4); ctx.drawImage(this.pen.art, 0, 0, 4, 4); ctx.drawImage(this.pen.sh, 0, 0, 4, 4); ctx.drawImage(this.pen.soft, 0, 0, 4, 4);
  },

  frame(t) {
    const c = this.c;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
    c.lineCap = 'butt'; c.lineJoin = 'miter'; c.setLineDash([]);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.fillStyle = '#2a1d14'; c.fillRect(0, 0, W, H);

    // camera: close on the nib and following it, then a pull-back to the whole line; a slow handheld drift on top
    const ci = clamp(t * this.camFps, 0, this.camX.length - 1), i0 = Math.floor(ci);
    const fx = lerp(this.camX[i0], this.camX[Math.min(this.camX.length - 1, i0 + 1)], ci - i0);
    const pull = ease.inOutCubic(clamp((t - T.pull[0]) / (T.pull[1] - T.pull[0])));
    const after = smooth((t - T.pull[1]) / (D - T.pull[1]));
    let z = lerp(ZW(t), this.fitZ * (1 + 0.035 * after), pull);
    const kd = t - this.tEnd;   // the "?" dot lands: one small push
    if (kd > 0) z *= 1 + 0.016 * Math.exp(-kd * 5) * (1 - Math.exp(-kd * 40));
    let cx = lerp(clamp(fx - 30, 330, 720), this.fitX + 6 * after, pull);
    let cy = lerp(960, 912 - 10 * after, pull);
    const roll = lerp(-0.009 + 0.004 * smooth(t / 7), 0.002 + 0.004 * after, pull);
    cx += 1.6 * Math.sin(t * 0.53 + 0.4) + 0.7 * Math.sin(t * 1.31);
    cy += 1.3 * Math.sin(t * 0.41 + 1.9) + 0.6 * Math.sin(t * 1.07 + 0.3);
    const cr = Math.cos(roll) * z, sr = Math.sin(roll) * z;
    const V = [cr, sr, -sr, cr, W / 2 - (cr * cx - sr * cy), H / 2 - (sr * cx + cr * cy)];
    c.setTransform(...V);
    c.drawImage(this.desk, WB[0], WB[1], WB[2], WB[3]);

    // ink: multiplied into the paper, so the grain shows through and crossings darken
    c.globalCompositeOperation = 'multiply';
    for (const st of this.strokes) drawStroke(c, st, t);
    for (const st of this.coral) drawStroke(c, st, t);
    for (const st of this.strokes) drawWet(c, st, t, 0);
    for (const st of this.coral) drawWet(c, st, t, 0);
    c.globalCompositeOperation = 'source-over';
    for (const st of this.strokes) drawWet(c, st, t, 1);
    for (const st of this.coral) drawWet(c, st, t, 1);

    // the pen
    const pp = penAt(this.ev, t);
    if (pp) drawPen(c, this.pen, pp, t);

    // window light over everything: falloff and frame shadows (multiply), leaves, warm glow (screen)
    const L = this.light;
    c.globalCompositeOperation = 'multiply';
    c.drawImage(L.mul, WB[0], WB[1], WB[2], WB[3]);
    c.save();
    c.translate(-120, -20); c.rotate(0.012 * Math.sin(t * 1.1 + 0.6) + 0.006 * Math.sin(t * 2.3));
    c.globalAlpha = 0.22;
    c.drawImage(this.leaves, 0, 0);
    c.restore();
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'screen';
    c.drawImage(L.scr, WB[0], WB[1], WB[2], WB[3]);
    c.globalCompositeOperation = 'source-over';

    // a dark foot for the caption
    c.setTransform(1, 0, 0, 1, 0, 0);
    const fg = c.createLinearGradient(0, 1580, 0, H);
    fg.addColorStop(0, 'rgba(26,16,9,0)'); fg.addColorStop(1, 'rgba(26,16,9,0.72)');
    c.fillStyle = fg; c.fillRect(0, 1580, W, H - 1580);
  },
});

/** where the nib is and how high the pen is lifted (px) — null while it is out of the scene */
function penAt(ev, t) {
  if (t < ev[0].t0 || t > ev[ev.length - 1].t1) return null;
  for (const e of ev) {
    if (t > e.t1) continue;
    const u = clamp((t - e.t0) / Math.max(1e-6, e.t1 - e.t0));
    if (e.kind === 'ink') return { p: sampleAt(e.st, Math.max(0, reach(e.st, t))), lift: 0 };
    if (e.kind === 'wait') return { p: e.a, lift: 0 };
    if (e.kind === 'air') {
      const m = minjerk(u), dx = e.b[0] - e.a[0], dy = e.b[1] - e.a[1], bow = 0.06 * Math.sin(Math.PI * m);
      return { p: [e.a[0] + dx * m - dy * bow, e.a[1] + dy * m + dx * bow], lift: e.h * Math.sin(Math.PI * u) };
    }
    if (e.kind === 'in') {
      const m = 1 - Math.pow(1 - u, 3);
      return { p: [lerp(e.a[0], e.b[0], m), lerp(e.a[1], e.b[1], m)], lift: 70 * Math.pow(1 - u, 2) };
    }
    if (e.kind === 'out') {
      const m = u * u * u;
      return { p: [lerp(e.a[0], e.b[0], m), lerp(e.a[1], e.b[1], m)], lift: 70 * smooth(u / 0.4) };
    }
  }
  return null;
}
function drawPen(c, P, pp, t) {
  const [x, y] = pp.p, lift = pp.lift, lk = clamp(lift / 60);
  const ang = Math.atan2(NV[1], NV[0]) + 0.012 * Math.sin(t * 2.1);
  const ax = Math.cos(ang), ay = Math.sin(ang), bx = -ay, by = ax;
  const sd = [0.78, 0.62], tau = 0.55, sc = 1 / P.S;
  // shadow: the nib touches its own shadow; the barrel's shadow falls away from it (sheared), and a lifted pen's shadow
  // slides off toward the lower right and softens
  const ox = x + sd[0] * lift * 0.95, oy = y + sd[1] * lift * 0.95;
  c.save();
  c.transform((ax + tau * sd[0]) * sc, (ay + tau * sd[1]) * sc, bx * sc, by * sc, ox, oy);
  c.globalAlpha = 0.46 * (1 - lk);
  if (lk < 0.999) c.drawImage(P.sh, -P.ax, -P.ay);
  c.globalAlpha = 0.36 * lk;
  if (lk > 0.001) c.drawImage(P.soft, -P.ax, -P.ay);
  c.restore();
  // the pen itself: a lifted pen comes a little closer to the camera
  const s = (1 + 0.05 * lk) * sc;
  c.save();
  c.transform(ax * s, ay * s, bx * s, by * s, x, y);
  c.drawImage(P.art, -P.ax, -P.ay);
  c.restore();
}
