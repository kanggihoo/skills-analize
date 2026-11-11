/*
 * 128 · geo.js — geometry helpers: affine maps, value noise, jittered Voronoi, fractal outlines, paths.
 * Nothing here reads the clock; randomness only through rand(seed).
 */
import { rand } from '../_lib/stage.js';

// ---- 2×3 affine maps in canvas order [a, b, c, d, e, f]: x' = a·x + c·y + e, y' = b·x + d·y + f
export const Af = {
  id: () => [1, 0, 0, 1, 0, 0],
  /** uniform scale s, rotation rot, then translation (x, y) */
  of: (s, x = 0, y = 0, rot = 0) => { const c = Math.cos(rot) * s, n = Math.sin(rot) * s; return [c, n, -n, c, x, y]; },
  /** M ∘ N (N applied first) */
  mul: (M, N) => [
    M[0] * N[0] + M[2] * N[1], M[1] * N[0] + M[3] * N[1],
    M[0] * N[2] + M[2] * N[3], M[1] * N[2] + M[3] * N[3],
    M[0] * N[4] + M[2] * N[5] + M[4], M[1] * N[4] + M[3] * N[5] + M[5],
  ],
  inv: (M) => {
    const det = M[0] * M[3] - M[1] * M[2];
    const a = M[3] / det, b = -M[1] / det, c = -M[2] / det, d = M[0] / det;
    return [a, b, c, d, -(a * M[4] + c * M[5]), -(b * M[4] + d * M[5])];
  },
  ap: (M, x, y) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]],
  /** linear part only (directions, offsets) */
  vec: (M, x, y) => [M[0] * x + M[2] * y, M[1] * x + M[3] * y],
  /** px per unit (geometric mean of the axes) */
  sc: (M) => Math.sqrt(Math.abs(M[0] * M[3] - M[1] * M[2])),
  dom: (M) => new DOMMatrix([M[0], M[1], M[2], M[3], M[4], M[5]]),
};

// ---- value noise (quintic), seeded permutation
export function makeNoise(seed) {
  const R = rand(seed), p = new Uint8Array(512), v = new Float32Array(256);
  for (let i = 0; i < 256; i++) { p[i] = i; v[i] = R() * 2 - 1; }
  for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const s = p[i]; p[i] = p[j]; p[j] = s; }
  for (let i = 0; i < 256; i++) p[i + 256] = p[i];
  const f = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const n2 = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, X = xi & 255, Y = yi & 255;
    const a = v[p[p[X] + Y]], b = v[p[p[X + 1] + Y]], c = v[p[p[X] + Y + 1]], d = v[p[p[X + 1] + Y + 1]];
    const u = f(fx), w = f(fy);
    return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
  };
  n2.fbm = (x, y, o = 4) => { let s = 0, a = 0.5, fr = 1; for (let i = 0; i < o; i++) { s += a * n2(x * fr + i * 17.3, y * fr - i * 9.1); a *= 0.5; fr *= 2.03; } return s; };
  return n2;
}

// ---- Voronoi of a jittered grid: each cell is its square clipped by the bisectors of its 24 grid neighbours
function clipHalf(poly, ax, ay, bx, by) {
  const nx = bx - ax, ny = by - ay, mx = (ax + bx) / 2, my = (ay + by) / 2, out = [], n = poly.length;
  for (let i = 0; i < n; i++) {
    const P = poly[i], Q = poly[(i + 1) % n];
    const dp = (P[0] - mx) * nx + (P[1] - my) * ny, dq = (Q[0] - mx) * nx + (Q[1] - my) * ny;
    if (dp <= 0) out.push(P);
    if ((dp <= 0) !== (dq <= 0)) { const s = dp / (dp - dq); out.push([P[0] + (Q[0] - P[0]) * s, P[1] + (Q[1] - P[1]) * s]); }
  }
  return out;
}
export function jitterVoronoi({ x0, y0, x1, y1, g, jitter = 0.45, seed = 1, keep = null, edit = null }) {
  const R = rand(seed), nx = Math.ceil((x1 - x0) / g), ny = Math.ceil((y1 - y0) / g);
  const px = new Float64Array(nx * ny), py = new Float64Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i;
    px[k] = x0 + (i + 0.5 + (R() - 0.5) * 2 * jitter) * g;
    py[k] = y0 + (j + 0.5 + (R() - 0.5) * 2 * jitter) * g;
  }
  if (edit) edit(px, py, nx, ny);                  // e.g. pin one site to a chosen point
  const cells = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i, x = px[k], y = py[k], r = R();
    if (keep && !keep(x, y)) continue;
    let poly = [[x - 2 * g, y - 2 * g], [x + 2 * g, y - 2 * g], [x + 2 * g, y + 2 * g], [x - 2 * g, y + 2 * g]];
    for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) {
      if (!di && !dj) continue;
      const ii = i + di, jj = j + dj;
      if (ii < 0 || jj < 0 || ii >= nx || jj >= ny) continue;
      const q = jj * nx + ii;
      poly = clipHalf(poly, x, y, px[q], py[q]);
    }
    cells.push({ x, y, poly, r });
  }
  return cells;
}

/** unique edges of a cell list (shared walls once), keyed on endpoints rounded to `q` */
export function cellEdges(cells, q = 1e-3) {
  const key = (p) => `${Math.round(p[0] / q)},${Math.round(p[1] / q)}`;
  const seen = new Set(), out = [];
  for (const c of cells) {
    const P = c.poly;
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], ka = key(a), kb = key(b);
      if (ka === kb) continue;
      const k = ka < kb ? ka + '|' + kb : kb + '|' + ka;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(ka < kb ? [a, b] : [b, a]);
    }
  }
  return out;
}

/** an integer hash of a point → 0..1 (stable under tiny float noise) */
export function hash2(x, y) {
  let h = (Math.round(x * 7.31) * 374761393 + Math.round(y * 7.31) * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ---- outlines
/** midpoint displacement of a closed polygon: each level splits every edge, offset ∝ edge length */
export function fractal(pts, levels, amp, seed) {
  const R = rand(seed);
  let P = pts;
  for (let l = 0; l < levels; l++) {
    const Q = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      const o = (R() - 0.5) * 2 * amp * L;
      Q.push(a, [(a[0] + b[0]) / 2 - (dy / L) * o, (a[1] + b[1]) / 2 + (dx / L) * o]);
    }
    P = Q;
  }
  return P;
}
export function chaikin(pts, it = 2, closed = true) {
  let P = pts;
  for (let k = 0; k < it; k++) {
    const Q = [], n = P.length, m = closed ? n : n - 1;
    if (!closed) Q.push(P[0]);
    for (let i = 0; i < m; i++) {
      const a = P[i], b = P[(i + 1) % n];
      Q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    if (!closed) Q.push(P[n - 1]);
    P = Q;
  }
  return P;
}
/** resample an open polyline to steps of at most `step` */
export function resample(pts, step) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 1; k <= n; k++) out.push([a[0] + (b[0] - a[0]) * (k / n), a[1] + (b[1] - a[1]) * (k / n)]);
  }
  return out;
}
export function inPoly(P, x, y) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const a = P[i], b = P[j];
    if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
/** a blob: n points on a noisy circle */
export function blob(cx, cy, r, n, wob, seed, sx = 1, sy = 1) {
  const R = rand(seed), ph = [R() * 6.3, R() * 6.3, R() * 6.3], out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + wob * (0.5 * Math.sin(2 * a + ph[0]) + 0.3 * Math.sin(3 * a + ph[1]) + 0.2 * Math.sin(5 * a + ph[2]));
    out.push([cx + Math.cos(a) * r * k * sx, cy + Math.sin(a) * r * k * sy]);
  }
  return out;
}

// ---- Path2D builders (fill() closes sub-paths itself, so no closePath on large paths)
export function addPoly(path, P, closed = false) {
  path.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length; i++) path.lineTo(P[i][0], P[i][1]);
  if (closed) path.lineTo(P[0][0], P[0][1]);
  return path;
}
export function addCircle(path, x, y, r) { path.moveTo(x + r, y); path.arc(x, y, r, 0, Math.PI * 2); return path; }
export function addEllipse(path, x, y, rx, ry, rot = 0) { path.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); path.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return path; }
export function roundRect(path, x, y, w, h, r) {
  path.moveTo(x + r, y); path.arcTo(x + w, y, x + w, y + h, r); path.arcTo(x + w, y + h, x, y + h, r);
  path.arcTo(x, y + h, x, y, r); path.arcTo(x, y, x + w, y, r);
  return path;
}
/** a stroke with varying width as a filled polygon: pts [[x, y]…], width(i/(n-1)) */
export function taper(pts, width) {
  const n = pts.length, L = [], Rr = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const w = width(i / (n - 1)) / 2;
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    Rr.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  return L.concat(Rr.reverse());
}

/** falloff band of distance d: 0 inside r0, 1..n across [r0, r1], −1 beyond r1 (not drawn) */
export function bandOf(d, r0, r1, n) { return d <= r0 ? 0 : d >= r1 ? -1 : 1 + Math.floor(((d - r0) / (r1 - r0)) * n); }
export function bandAlpha(b, n) { return b === 0 ? 1 : Math.max(0, 1 - (b - 0.5) / n); }

/** convex polygon shrunk by d: clipped by every edge's line moved inward by d */
export function insetConvex(P, d) {
  let cx = 0, cy = 0;
  for (const p of P) { cx += p[0]; cy += p[1]; }
  cx /= P.length; cy /= P.length;
  let Q = P;
  for (let i = 0; i < P.length && Q.length >= 3; i++) {
    const a = P[i], b = P[(i + 1) % P.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (l < 1e-6) continue;
    let nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l;
    if ((cx - a[0]) * nx + (cy - a[1]) * ny < 0) { nx = -nx; ny = -ny; }
    const px = a[0] + nx * d, py = a[1] + ny * d, out = [];
    for (let j = 0; j < Q.length; j++) {
      const p = Q[j], q = Q[(j + 1) % Q.length], dp = (p[0] - px) * nx + (p[1] - py) * ny, dq = (q[0] - px) * nx + (q[1] - py) * ny;
      if (dp >= 0) out.push(p);
      if ((dp >= 0) !== (dq >= 0)) { const s = dp / (dp - dq); out.push([p[0] + (q[0] - p[0]) * s, p[1] + (q[1] - p[1]) * s]); }
    }
    Q = out;
  }
  return Q;
}
