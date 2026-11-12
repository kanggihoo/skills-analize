/*
 * strokes.js — handwriting paths from a font: Nanum Pen Script glyphs are rasterised (half stage resolution),
 * thinned to a one-pixel skeleton (Zhang–Suen, then simple-point cleanup), traced into a graph (endpoints,
 * junction clusters, edges), pruned of spurs, joined through junctions where the ink runs straight on, ordered
 * the way Hangul is written (top → bottom, left → right per jamo; tall right vowels after their consonant) and
 * timed at a writing speed with a pressure profile. Everything here runs once in setup; nothing touches time.
 */

const N8 = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];   // N NE E SE S SW W NW

/** fill enclosed background specks smaller than maxArea (pen-texture holes would become fake skeleton loops) */
function fillSpecks(m, w, h, bb, maxArea) {
  const [x0, y0, x1, y1] = bb;
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * w + x;
    if (m[i] || seen[i]) continue;
    const comp = [];
    let open = false;
    stack.push(i); seen[i] = 1;
    while (stack.length) {
      const j = stack.pop();
      comp.push(j);
      const jx = j % w, jy = (j / w) | 0;
      if (jx <= x0 || jy <= y0 || jx >= x1 || jy >= y1) open = true;
      for (let k = 0; k < 8; k += 2) {
        const xx = jx + N8[k][0], yy = jy + N8[k][1];
        if (xx < x0 || yy < y0 || xx > x1 || yy > y1) continue;
        const q = yy * w + xx;
        if (!m[q] && !seen[q]) { seen[q] = 1; stack.push(q); }
      }
    }
    if (!open && comp.length <= maxArea) for (const j of comp) m[j] = 1;
  }
}

/** Zhang–Suen thinning, in place, inside the bounding box (1 = ink) */
function zhangSuen(m, w, bb) {
  const [x0, y0, x1, y1] = bb;
  const del = [];
  for (let changed = true; changed;) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      del.length = 0;
      for (let y = y0 + 1; y < y1; y++) for (let x = x0 + 1; x < x1; x++) {
        const i = y * w + x;
        if (!m[i]) continue;
        const p2 = m[i - w], p3 = m[i - w + 1], p4 = m[i + 1], p5 = m[i + w + 1], p6 = m[i + w], p7 = m[i + w - 1], p8 = m[i - 1], p9 = m[i - w - 1];
        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (B < 2 || B > 6) continue;
        const A = (!p2 && p3) + (!p3 && p4) + (!p4 && p5) + (!p5 && p6) + (!p6 && p7) + (!p7 && p8) + (!p8 && p9) + (!p9 && p2);
        if (A !== 1) continue;
        if (pass === 0 ? (p2 && p4 && p6) || (p4 && p6 && p8) : (p2 && p4 && p8) || (p2 && p6 && p8)) continue;
        del.push(i);
      }
      for (const i of del) m[i] = 0;
      if (del.length) changed = true;
    }
  }
}

// ring adjacency for the simple-point test: consecutive ring cells touch, and so do 4-neighbours two apart (N–E …)
const RING_LINKS = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [0, 2], [2, 4], [4, 6], [6, 0]];
/** remove 8-simple points that are not endpoints: staircases become clean diagonals, fake junctions vanish */
function simplePointCleanup(m, w, bb) {
  const [x0, y0, x1, y1] = bb;
  const ring = new Uint8Array(8), par = new Int8Array(8);
  const find = (a) => { while (par[a] !== a) a = par[a] = par[par[a]]; return a; };
  for (let it = 0, changed = true; changed && it < 6; it++) {
    changed = false;
    for (let y = y0 + 1; y < y1; y++) for (let x = x0 + 1; x < x1; x++) {
      const i = y * w + x;
      if (!m[i]) continue;
      let n = 0;
      for (let k = 0; k < 8; k++) { ring[k] = m[i + N8[k][1] * w + N8[k][0]]; n += ring[k]; par[k] = k; }
      if (n < 2) continue;
      for (const [a, b] of RING_LINKS) if (ring[a] && ring[b]) { const ra = find(a), rb = find(b); if (ra !== rb) par[ra] = rb; }
      let comps = 0;
      for (let k = 0; k < 8; k++) if (ring[k] && find(k) === k) comps++;
      if (comps === 1) { m[i] = 0; changed = true; }
    }
  }
}

/** skeleton → graph: nodes (endpoints, junction clusters) and edges (pixel polylines, node centroids at the ends) */
function traceGraph(m, w, bb) {
  const [x0, y0, x1, y1] = bb;
  const neighbours = (i) => {
    const out = [];
    for (const [dx, dy] of N8) { const j = i + dy * w + dx; if (m[j]) out.push(j); }
    return out;
  };
  const deg = new Map();
  for (let y = y0 + 1; y < y1; y++) for (let x = x0 + 1; x < x1; x++) { const i = y * w + x; if (m[i]) deg.set(i, neighbours(i).length); }
  const nodeOf = new Map(), nodes = [];
  for (const [i, d] of deg) {
    if (d === 2 || nodeOf.has(i)) continue;
    const id = nodes.length, pix = [i];
    nodeOf.set(i, id);
    if (d >= 3) {     // a junction cluster: all touching pixels of degree ≥ 3
      for (let k = 0; k < pix.length; k++) for (const j of neighbours(pix[k])) {
        if (!nodeOf.has(j) && deg.get(j) >= 3) { nodeOf.set(j, id); pix.push(j); }
      }
    }
    let sx = 0, sy = 0;
    for (const p of pix) { sx += p % w; sy += (p / w) | 0; }
    nodes.push({ id, pix, x: sx / pix.length, y: sy / pix.length, end: d <= 1 });
  }
  const pt = (i) => [i % w, (i / w) | 0];
  const edges = [], visited = new Set(), direct = new Set();
  for (const n of nodes) {
    for (const q of n.pix) for (const j of neighbours(q)) {
      if (nodeOf.get(j) === n.id) continue;
      if (nodeOf.has(j)) {
        const b = nodeOf.get(j), key = n.id < b ? `${n.id}:${b}` : `${b}:${n.id}`;
        if (!direct.has(key)) { direct.add(key); edges.push({ a: n.id, b, pts: [[n.x, n.y], [nodes[b].x, nodes[b].y]] }); }
        continue;
      }
      if (visited.has(j)) continue;
      const pts = [[n.x, n.y]];
      let prev = q, cur = j, endNode = -1;
      for (let guard = 0; guard < 100000; guard++) {
        visited.add(cur);
        pts.push(pt(cur));
        let next = -1;
        for (const k of neighbours(cur)) {
          if (k === prev) continue;
          if (nodeOf.has(k) && !(nodeOf.get(k) === n.id && pts.length < 3)) { endNode = nodeOf.get(k); next = -1; break; }
          if (!visited.has(k) && !nodeOf.has(k)) next = k;
        }
        if (endNode >= 0 || next < 0) break;
        prev = cur; cur = next;
      }
      if (endNode < 0) {          // ran out without meeting a node: make the last pixel an endpoint
        const id = nodes.length, last = pts[pts.length - 1];
        nodes.push({ id, pix: [], x: last[0], y: last[1], end: true });
        endNode = id;
      } else pts.push([nodes[endNode].x, nodes[endNode].y]);
      edges.push({ a: n.id, b: endNode, pts });
    }
  }
  // pure cycles (no nodes at all): every pixel has degree 2
  for (const [i, d] of deg) {
    if (d !== 2 || visited.has(i) || nodeOf.has(i)) continue;
    const pts = [];
    let prev = -1, cur = i;
    for (let guard = 0; guard < 100000; guard++) {
      visited.add(cur);
      pts.push(pt(cur));
      const nx = neighbours(cur).filter((k) => k !== prev && !visited.has(k));
      if (!nx.length) break;
      prev = cur; cur = nx[0];
    }
    if (pts.length > 6) edges.push({ a: -1, b: -1, pts, loop: true });
  }
  return { nodes, edges };
}

const plen = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };

/** prune spurs, join edges through junctions where the ink runs on, return polylines (chains) */
function assemble(graph, spurMin) {
  const { nodes, edges } = graph;
  let live = edges.slice();
  // spur pruning, repeated (removing one spur can turn a junction into a pass-through)
  for (let it = 0; it < 4; it++) {
    const count = new Map();
    for (const e of live) for (const v of [e.a, e.b]) if (v >= 0) count.set(v, (count.get(v) || 0) + 1);
    const before = live.length;
    live = live.filter((e) => {
      if (e.loop) return true;
      const ea = e.a >= 0 && count.get(e.a) === 1, eb = e.b >= 0 && count.get(e.b) === 1;
      const ja = e.a >= 0 && count.get(e.a) >= 3, jb = e.b >= 0 && count.get(e.b) >= 3;
      return !((ea && jb) || (eb && ja)) || plen(e.pts) >= spurMin;
    });
    if (live.length === before) break;
  }
  // incident edge ends per node, with the direction the edge leaves the node
  const ends = new Map();
  live.forEach((e, k) => {
    if (e.loop) return;
    for (const s of [0, 1]) {
      const v = s ? e.b : e.a;
      const pts = s ? e.pts.slice().reverse() : e.pts;
      let j = 1, L = 0;
      while (j < pts.length - 1 && L < 6) { L += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); j++; }
      const dx = pts[j][0] - pts[0][0], dy = pts[j][1] - pts[0][1], l = Math.hypot(dx, dy) || 1;
      if (!ends.has(v)) ends.set(v, []);
      ends.get(v).push({ k, s, d: [dx / l, dy / l] });
    }
  });
  const link = new Map();     // `${k}:${s}` → { k, s }
  for (const [, list] of ends) {
    if (list.length === 2 && !(list[0].k === list[1].k)) {
      link.set(`${list[0].k}:${list[0].s}`, list[1]); link.set(`${list[1].k}:${list[1].s}`, list[0]);
      continue;
    }
    if (list.length < 3) continue;
    // greedy: the most opposite pair of directions continues (ink running straight through the crossing)
    const free = list.slice();
    for (;;) {
      let best = null, bd = -0.5;
      for (let i = 0; i < free.length; i++) for (let j = i + 1; j < free.length; j++) {
        if (free[i].k === free[j].k) continue;
        const o = -(free[i].d[0] * free[j].d[0] + free[i].d[1] * free[j].d[1]);
        if (o > bd) { bd = o; best = [i, j]; }
      }
      if (!best) break;
      const [a, b] = [free[best[0]], free[best[1]]];
      link.set(`${a.k}:${a.s}`, b); link.set(`${b.k}:${b.s}`, a);
      free.splice(best[1], 1); free.splice(best[0], 1);
    }
  }
  // walk the chains
  const used = new Set(), chains = [];
  const walk = (k, s) => {
    const out = [];
    for (let guard = 0; guard < 1000 && !used.has(k); guard++) {
      used.add(k);
      const pts = s ? live[k].pts.slice().reverse() : live[k].pts;
      for (let i = out.length ? 1 : 0; i < pts.length; i++) out.push(pts[i]);
      const nx = link.get(`${k}:${1 - s}`);
      if (!nx) break;
      k = nx.k; s = nx.s;
    }
    return out;
  };
  live.forEach((e, k) => {
    if (used.has(k) || e.loop) return;
    if (!link.has(`${k}:0`)) chains.push(walk(k, 0));
    else if (!link.has(`${k}:1`)) chains.push(walk(k, 1));
  });
  live.forEach((e, k) => { if (!used.has(k)) { used.add(k); chains.push(e.loop ? e.pts.concat([e.pts[0]]) : walk(k, 0)); } });
  return chains.filter((c) => c.length >= 2);
}

function smoothPolyline(pts, passes = 2, win = 3) {
  let p = pts;
  const closed = p.length > 3 && Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]) < 1.5;
  for (let it = 0; it < passes; it++) {
    const q = p.map((v) => v.slice());
    for (let i = 0; i < p.length; i++) {
      if (!closed && (i === 0 || i === p.length - 1)) continue;
      let sx = 0, sy = 0, n = 0;
      for (let j = -win; j <= win; j++) {
        let k = i + j;
        if (closed) k = (k + p.length - 1) % (p.length - 1);
        else k = Math.max(0, Math.min(p.length - 1, k));
        sx += p[k][0]; sy += p[k][1]; n++;
      }
      q[i] = [sx / n, sy / n];
    }
    p = q;
  }
  return p;
}

function resample(pts, step) {
  const out = [pts[0].slice()];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const L = Math.hypot(bx - ax, by - ay);
    let s = step - carry;
    while (s <= L) { const u = s / L; out.push([ax + (bx - ax) * u, ay + (by - ay) * u]); s += step; }
    carry = L - (s - step);
  }
  const last = pts[pts.length - 1];
  if (Math.hypot(last[0] - out[out.length - 1][0], last[1] - out[out.length - 1][1]) > step * 0.3) out.push(last.slice());
  return out;
}

/**
 * Lines of text → ordered, timed finger strokes in stage px.
 *   lines: [{ text, cx, cy, word }] (centre of each line), size: font px on the stage, rot: radians
 * Returns strokes [{ pts: [[x, y]…] (stage px, 3 px apart), glyph, word, len, closed }] in writing order.
 */
export function extractStrokes({ lines, family, size, rot = 0, W, H }) {
  const S = 0.5, w = Math.round(W * S), h = Math.round(H * S);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#fff';
  g.font = `400 ${size * S}px "${family}"`;
  g.textBaseline = 'middle';
  const glyphs = [];
  for (const L of lines) {
    const chars = Array.from(L.text);
    const widths = chars.map((ch) => g.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0);
    let x = -total / 2;
    g.save();
    g.translate(L.cx * S, L.cy * S);
    g.rotate(rot);
    chars.forEach((ch, i) => {
      if (ch !== ' ') {
        g.fillText(ch, x, 0);
        const mx = x + widths[i] / 2;
        // glyph centre in stage px (rotated with the line)
        glyphs.push({ ch, word: L.word, x: (L.cx * S + Math.cos(rot) * mx) / S, y: (L.cy * S + Math.sin(rot) * mx) / S, w: widths[i] / S });
      }
      x += widths[i];
    });
    g.restore();
  }
  const px = g.getImageData(0, 0, w, h).data;
  const m = new Uint8Array(w * h);
  let bx0 = w, by0 = h, bx1 = 0, by1 = 0;
  for (let i = 0; i < w * h; i++) {
    if (px[i * 4 + 3] > 110) {
      m[i] = 1;
      const x = i % w, y = (i / w) | 0;
      if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y;
    }
  }
  if (bx1 <= bx0) throw new Error('stroke raster is empty (font not loaded?)');
  const bb = [Math.max(1, bx0 - 3), Math.max(1, by0 - 3), Math.min(w - 2, bx1 + 3), Math.min(h - 2, by1 + 3)];
  fillSpecks(m, w, h, bb, 28);
  zhangSuen(m, w, bb);
  simplePointCleanup(m, w, bb);
  const chains = assemble(traceGraph(m, w, bb), 7);

  // to stage px, smoothed and evenly spaced; drop crumbs
  let strokes = chains
    .map((ch) => resample(smoothPolyline(ch.map(([x, y]) => [(x + 0.5) / S, (y + 0.5) / S]), 2, 3), 3))
    .filter((p) => plen(p) > 22)
    .map((pts) => ({ pts, closed: Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 8 }));

  // orientation: horizontal-ish strokes go left → right, others top → bottom; loops start at the top, anticlockwise
  for (const s of strokes) {
    const p = s.pts;
    const xs = p.map((v) => v[0]), ys = p.map((v) => v[1]);
    const ex = Math.max(...xs) - Math.min(...xs), ey = Math.max(...ys) - Math.min(...ys);
    if (s.closed) {
      let A = 0;
      for (let i = 0; i < p.length - 1; i++) A += p[i][0] * p[i + 1][1] - p[i + 1][0] * p[i][1];
      let top = 0;
      for (let i = 1; i < p.length; i++) if (p[i][1] < p[top][1]) top = i;
      let q = p.slice(top).concat(p.slice(1, top + 1));
      if (A > 0) q = q.reverse();
      s.pts = q;
    } else {
      const a = p[0], b = p[p.length - 1];
      const flip = ex > 1.1 * ey ? b[0] < a[0] : b[1] < a[1];
      if (flip) s.pts = p.slice().reverse();
    }
    s.len = plen(s.pts);
    s.minX = Math.min(...xs); s.minY = Math.min(...ys); s.ex = ex; s.ey = ey;
    s.cx = xs.reduce((u, v) => u + v, 0) / xs.length; s.cy = ys.reduce((u, v) => u + v, 0) / ys.length;
  }
  // assign to glyphs (nearest centre), then order within each glyph by jamo bands
  for (const s of strokes) {
    let best = 0, bd = Infinity;
    glyphs.forEach((gl, i) => { const d = Math.hypot((s.cx - gl.x) / gl.w, (s.cy - gl.y) / (size * 0.9)); if (d < bd) { bd = d; best = i; } });
    s.glyph = best; s.word = glyphs[best].word;
  }
  const out = [];
  glyphs.forEach((gl, gi) => {
    const mine = strokes.filter((s) => s.glyph === gi);
    if (!mine.length) return;
    const gx0 = Math.min(...mine.map((s) => s.minX)), gy0 = Math.min(...mine.map((s) => s.minY));
    const gw = Math.max(...mine.map((s) => s.minX + s.ex)) - gx0 || 1, gh = Math.max(...mine.map((s) => s.minY + s.ey)) - gy0 || 1;
    for (const s of mine) {
      const tallRight = s.ey > 0.45 * gh && (s.cx - gx0) / gw > 0.55 && s.ey > 1.6 * s.ex;
      const bandY = tallRight ? gy0 + 0.42 * gh : s.minY;
      s.key = Math.floor((bandY - gy0) / (0.17 * gh)) * 10 + ((s.minX - gx0) / gw) * 4;
    }
    mine.sort((a, b) => a.key - b.key);
    out.push(...mine);
  });
  return { strokes: out, glyphs };
}

/**
 * Time the strokes: the finger moves at a steady speed with eased starts and stops, short pen-up gaps
 * (longer between glyphs and lines). Returns samples every 1/120 s: { x, y, t, r (finger radius), stroke }.
 */
export function timeStrokes(strokes, { t0, t1, radius }) {
  const gapIn = 0.055, gapGlyph = 0.15, gapWord = 0.3;
  let gaps = 0;
  strokes.forEach((s, i) => { if (i) gaps += s.word !== strokes[i - 1].word ? gapWord : s.glyph !== strokes[i - 1].glyph ? gapGlyph : gapIn; });
  const total = strokes.reduce((a, s) => a + s.len, 0);
  const speed = Math.min(2200, Math.max(650, total / Math.max(0.5, t1 - t0 - gaps)));
  const ease = (u) => 0.7 * u + 0.3 * (u * u * (3 - 2 * u));
  const samples = [];
  let t = t0;
  strokes.forEach((s, si) => {
    if (si) t += s.word !== strokes[si - 1].word ? gapWord : s.glyph !== strokes[si - 1].glyph ? gapGlyph : gapIn;
    const dur = Math.max(0.12, s.len / speed);
    const cum = [0];
    for (let i = 1; i < s.pts.length; i++) cum.push(cum[i - 1] + Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1]));
    const n = Math.max(2, Math.ceil(dur * 120));
    let j = 1;
    s.t0 = t; s.t1 = t + dur;
    for (let k = 0; k <= n; k++) {
      const u = k / n, a = ease(u) * s.len;
      while (j < cum.length - 1 && cum[j] < a) j++;
      const f = (a - cum[j - 1]) / Math.max(1e-6, cum[j] - cum[j - 1]);
      const x = s.pts[j - 1][0] + (s.pts[j][0] - s.pts[j - 1][0]) * f, y = s.pts[j - 1][1] + (s.pts[j][1] - s.pts[j - 1][1]) * f;
      const press = 0.74 + 0.26 * Math.sqrt(Math.sin(Math.PI * Math.min(1, Math.max(0, u * 1.15 - 0.05))));
      samples.push({ x, y, t: t + u * dur, r: radius * press, stroke: si, word: s.word, first: k === 0 });
    }
    t += dur;
  });
  return { samples, speed, end: t };
}
