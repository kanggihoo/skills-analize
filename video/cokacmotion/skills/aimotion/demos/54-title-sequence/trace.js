/*
 * 54 · trace.js — letters become paper: a font raster is traced into polygons once, in setup.
 * The fontsource faces (Black Han Sans, Do Hyeon, Bebas Neue) are WOFF2 subsets that opentype.js can't read, so the
 * outline comes from the browser's own rasteriser: marching squares on the coverage at iso 0.5 (edge points
 * interpolated, so sub-pixel), loops linked through shared cell edges, Ramer–Douglas–Peucker to straight runs,
 * sharp turns flagged as corners the scissors must keep. Loops are grouped into pieces: one outer + its holes.
 * Screen space, y down: outer loops have area < 0, holes > 0 (same convention as _lib/type.js outlineContours).
 */
import { textAlpha } from '../_lib/type.js';

/** marching squares → closed loops as flat [x0, y0, x1, y1, …] in grid units; inside is on the walker's left */
export function marchingLoops(a, w, h, iso = 0.5) {
  // edge ids: horizontal edge (x,y)–(x+1,y) = 2·(y·w+x), vertical edge (x,y)–(x,y+1) = 2·(y·w+x)+1
  const next = new Int32Array(w * h * 2).fill(-1);
  for (let y = 0; y < h - 1; y++) {
    const r0 = y * w, r1 = r0 + w;
    for (let x = 0; x < w - 1; x++) {
      const tl = a[r0 + x], tr = a[r0 + x + 1], br = a[r1 + x + 1], bl = a[r1 + x];
      const c = (tl >= iso ? 8 : 0) | (tr >= iso ? 4 : 0) | (br >= iso ? 2 : 0) | (bl >= iso ? 1 : 0);
      if (c === 0 || c === 15) continue;
      const T = (r0 + x) * 2, B = (r1 + x) * 2, L = (r0 + x) * 2 + 1, R = (r0 + x + 1) * 2 + 1;
      const mid = (tl + tr + br + bl) * 0.25 >= iso;
      switch (c) {
        case 1: next[B] = L; break;
        case 2: next[R] = B; break;
        case 3: next[R] = L; break;
        case 4: next[T] = R; break;
        case 5: if (mid) { next[T] = L; next[B] = R; } else { next[T] = R; next[B] = L; } break;
        case 6: next[T] = B; break;
        case 7: next[T] = L; break;
        case 8: next[L] = T; break;
        case 9: next[B] = T; break;
        case 10: if (mid) { next[R] = T; next[L] = B; } else { next[L] = T; next[R] = B; } break;
        case 11: next[R] = T; break;
        case 12: next[L] = R; break;
        case 13: next[B] = R; break;
        case 14: next[L] = B; break;
      }
    }
  }
  const point = (id, out) => {
    const cell = id >> 1, x = cell % w, y = (cell / w) | 0;
    if ((id & 1) === 0) { const a0 = a[cell], a1 = a[cell + 1]; out.push(x + (iso - a0) / (a1 - a0), y); }
    else { const a0 = a[cell], a1 = a[cell + w]; out.push(x, y + (iso - a0) / (a1 - a0)); }
  };
  const seen = new Uint8Array(next.length), loops = [];
  for (let e = 0; e < next.length; e++) {
    if (next[e] < 0 || seen[e]) continue;
    const pts = [];
    let cur = e;
    while (cur >= 0 && !seen[cur]) { seen[cur] = 1; point(cur, pts); cur = next[cur]; }
    if (pts.length >= 8) loops.push(pts);
  }
  return loops;
}

export function loopArea(P) {
  let A = 0;
  const n = P.length / 2;
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; A += P[2 * i] * P[2 * j + 1] - P[2 * j] * P[2 * i + 1]; }
  return A / 2;
}
export function loopBox(P) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < P.length; i += 2) { const x = P[i], y = P[i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return [x0, y0, x1, y1];
}
export function inside(x, y, P) {
  let c = false;
  const n = P.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = P[2 * i], yi = P[2 * i + 1], xj = P[2 * j], yj = P[2 * j + 1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}

// Ramer–Douglas–Peucker on Q[a..b] (flat), marking kept indices
function rdp(Q, a, b, eps2, keep) {
  const stack = [a, b];
  while (stack.length) {
    const j = stack.pop(), i = stack.pop();
    const ax = Q[2 * i], ay = Q[2 * i + 1], dx = Q[2 * j] - ax, dy = Q[2 * j + 1] - ay, l2 = dx * dx + dy * dy;
    let best = -1, bd = eps2;
    for (let k = i + 1; k < j; k++) {
      let px = Q[2 * k] - ax, py = Q[2 * k + 1] - ay;
      if (l2 > 1e-12) { const t = Math.max(0, Math.min(1, (px * dx + py * dy) / l2)); px -= t * dx; py -= t * dy; }
      const d2 = px * px + py * py;
      if (d2 > bd) { bd = d2; best = k; }
    }
    if (best >= 0) { keep[best] = 1; stack.push(i, best, best, j); }
  }
}
/** closed loop → straight runs within eps; returns { pts: Float64Array, corner: Uint8Array, n } */
export function simplifyLoop(P, eps = 0.6, cornerAngle = 0.62) {
  const n = P.length / 2;
  let far = 0, fd = -1;
  for (let i = 1; i < n; i++) { const dx = P[2 * i] - P[0], dy = P[2 * i + 1] - P[1], d = dx * dx + dy * dy; if (d > fd) { fd = d; far = i; } }
  const Q = new Float64Array(2 * n + 2);
  Q.set(P); Q[2 * n] = P[0]; Q[2 * n + 1] = P[1];
  const keep = new Uint8Array(n + 1);
  keep[0] = keep[far] = 1;
  rdp(Q, 0, far, eps * eps, keep);
  rdp(Q, far, n, eps * eps, keep);
  const idx = [];
  for (let i = 0; i < n; i++) if (keep[i]) idx.push(i);
  const m = idx.length;
  const pts = new Float64Array(2 * m), corner = new Uint8Array(m);
  idx.forEach((k, i) => { pts[2 * i] = P[2 * k]; pts[2 * i + 1] = P[2 * k + 1]; });
  for (let i = 0; i < m; i++) {
    const p = (i - 1 + m) % m, q = (i + 1) % m;
    const ax = pts[2 * i] - pts[2 * p], ay = pts[2 * i + 1] - pts[2 * p + 1], bx = pts[2 * q] - pts[2 * i], by = pts[2 * q + 1] - pts[2 * i + 1];
    const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
    if (la < 1e-9 || lb < 1e-9) continue;
    const c = Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb)));
    if (Math.acos(c) > cornerAngle) corner[i] = 1;
  }
  return { pts, corner, n: m };
}

/** loops ({ pts, corner, n }) → pieces: every outer loop (area < 0) with the holes it contains */
export function groupLoops(loops, minArea = 4) {
  const L = loops.map((l) => ({ ...l, area: loopArea(l.pts), box: loopBox(l.pts) })).filter((l) => Math.abs(l.area) >= minArea);
  const comps = L.filter((l) => l.area < 0).map((o) => ({ outer: o, holes: [] }));
  for (const h of L.filter((l) => l.area > 0)) {
    let best = null;
    for (const c of comps) {
      const b = c.outer.box;
      if (h.box[0] < b[0] || h.box[1] < b[1] || h.box[2] > b[2] || h.box[3] > b[3]) continue;
      if (!inside(h.pts[0], h.pts[1], c.outer.pts)) continue;
      if (!best || Math.abs(c.outer.area) < Math.abs(best.outer.area)) best = c;
    }
    if (best) best.holes.push(h);
  }
  return comps;
}

/**
 * Trace `text` set in fontAt(size) (a CSS font shorthand builder). The raster is drawn `scale`× larger for
 * precision and traced; coordinates come back in text space at `size`: x from the pen origin, y from the baseline.
 * Returns { comps: [{ loops: [{ pts, corner, n }] (outer first), box, cx, cy, ch, holes }], ink: { L, R, A, D }, size }.
 */
export function traceText(text, fontAt, size, { scale = 1, spacing = 0, eps = 0.55 } = {}) {
  const setup = (c, k) => { c.font = fontAt(size * k); if ('letterSpacing' in c) c.letterSpacing = `${spacing * k}px`; };
  const mc = document.createElement('canvas').getContext('2d');
  setup(mc, 1);
  const m = mc.measureText(text);
  const L = m.actualBoundingBoxLeft, R = m.actualBoundingBoxRight, A = m.actualBoundingBoxAscent, De = m.actualBoundingBoxDescent;
  const chars = Array.from(text), pre = [0];
  for (let i = 1; i <= chars.length; i++) pre.push(mc.measureText(chars.slice(0, i).join('')).width);
  const pad = 6;
  const w = Math.ceil((L + R) * scale) + 2 * pad, h = Math.ceil((A + De) * scale) + 2 * pad;
  const alpha = textAlpha(w, h, (c) => { setup(c, scale); c.fillText(text, pad + L * scale, pad + A * scale); });
  const loops = marchingLoops(alpha, w, h).map((P) => {
    const l = simplifyLoop(P, eps * scale);
    for (let i = 0; i < l.n; i++) { l.pts[2 * i] = (l.pts[2 * i] - pad) / scale - L; l.pts[2 * i + 1] = (l.pts[2 * i + 1] - pad) / scale - A; }
    return l;
  }).filter((l) => l.n >= 3);
  const comps = groupLoops(loops, 3).map(({ outer, holes }) => {
    const box = outer.box, cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
    let ch = 0;
    while (ch < chars.length - 1 && cx >= pre[ch + 1]) ch++;
    const strip = ({ pts, corner, n }) => ({ pts, corner, n });
    return { loops: [strip(outer), ...holes.map(strip)], box, cx, cy, ch, holes: holes.length };
  });
  comps.sort((p, q) => p.ch - q.ch || p.cx - q.cx);
  return { comps, ink: { L, R, A, D: De }, size, chars };
}

/** vertical coverage of a piece's outer loop at x (sum of inside runs along a vertical line) */
function coverAt(P, x) {
  const ys = [];
  const n = P.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = P[2 * i], yi = P[2 * i + 1], xj = P[2 * j], yj = P[2 * j + 1];
    if ((xi > x) !== (xj > x)) ys.push(yi + (x - xi) * (yj - yi) / (xj - xi));
  }
  ys.sort((a, b) => a - b);
  let s = 0, lo = Infinity, hi = -Infinity;
  for (let k = 0; k + 1 < ys.length; k += 2) { s += ys[k + 1] - ys[k]; lo = Math.min(lo, ys[k]); hi = Math.max(hi, ys[k + 1]); }
  return { s, lo, hi };
}
/** the stem of a vertical stroke (e.g. the ㅏ in 각): the run of columns covered over ≥ 90 % of the tallest column */
export function stemRect(pts) {
  const [x0, , x1] = loopBox(pts);
  const cols = [];
  for (let x = x0 + 0.25; x < x1; x += 0.5) cols.push({ x, ...coverAt(pts, x) });
  let best = cols[0];
  for (const c of cols) if (c.s > best.s) best = c;
  let i0 = cols.indexOf(best), i1 = i0;
  while (i0 > 0 && cols[i0 - 1].s >= 0.9 * best.s) i0--;
  while (i1 < cols.length - 1 && cols[i1 + 1].s >= 0.9 * best.s) i1++;
  return [cols[i0].x - 0.25, best.lo, cols[i1].x + 0.25, best.hi];
}
