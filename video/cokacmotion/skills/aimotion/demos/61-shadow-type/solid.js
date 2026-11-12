/*
 * solid.js — the projection sculpture of 61 · 그림자로 읽는 글자, built exactly from two glyph outlines.
 *
 *   S = { (x, y, z) : A(z, y) ∧ B(z, x) }      A = the wall glyph (seen along x), B = the table glyph (seen along y)
 *
 * Both glyphs share the horizontal axis z (font x → −z, so both read left-to-right from a camera looking along −x).
 * In every column z the slice of S is (B's intervals in x) × (A's intervals in y), so S is exactly a union of cells of a
 * non-uniform grid: z-levels at every glyph vertex (slanted spans subdivided), y-levels at every end of A's column
 * intervals, x-levels at every end of B's. That is an adaptive voxel grid with no stair-steps on axis-aligned strokes.
 * Exposed cell faces become the mesh; each face also learns how far its edges are from a convex (bevel) or concave
 * (occlusion) edge of the solid, walking across coplanar neighbours, so thin cells never cut a bevel short.
 *
 * Fidelity: the shadow along x is { (z, y) : A(z, y) ∧ (column z of B is not empty) }. With both ink widths mapped to
 * the same z range and every column of both glyphs inked (불/물 share a full-width ㅜ bar), it equals A; likewise along y.
 * shadowFidelity() rasterises both projections and the glyphs and reports the IoU.
 */
import * as THREE from 'three';

export const BEVEL = 0.011;                    // bevel width of the convex edges (sculpture height ≈ 1)
const NONE = 99;

// even-odd intervals of a glyph along the vertical line font-x = fx (font units, y down)
function columnIntervals(contours, fx) {
  const ys = [];
  for (const P of contours) {
    const n = P.length / 2;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = P[2 * i], yi = P[2 * i + 1], xj = P[2 * j], yj = P[2 * j + 1];
      if ((xi <= fx) !== (xj <= fx)) ys.push(yj + ((fx - xj) / (xi - xj)) * (yi - yj));
    }
  }
  ys.sort((a, b) => a - b);
  const out = [];
  for (let k = 0; k + 1 < ys.length; k += 2) if (ys[k + 1] - ys[k] > 1e-9) out.push([ys[k], ys[k + 1]]);
  return out;
}
function inkBox(contours) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const P of contours) for (let i = 0; i < P.length; i += 2) { x0 = Math.min(x0, P[i]); x1 = Math.max(x1, P[i]); y0 = Math.min(y0, P[i + 1]); y1 = Math.max(y1, P[i + 1]); }
  return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };
}
// sorted unique levels, merging values closer than eps into one representative
function levels(values, eps) {
  const v = values.slice().sort((a, b) => a - b), out = [];
  for (const x of v) if (!out.length || x - out[out.length - 1] > eps) out.push(x);
  return out;
}
const snap = (L, x) => { let lo = 0, hi = L.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] <= x) lo = m; else hi = m; } return Math.abs(L[lo] - x) <= Math.abs(L[hi] - x) ? lo : hi; };

/**
 * A, B: glyph contours (flat arrays, font units of size 1, y down). width: the common z extent.
 * Returns the grid, the cell occupancy and the glyph mappings.
 */
export function buildSolid(A, B, width = 1) {
  const bA = inkBox(A), bB = inkBox(B);
  const sA = width / bA.w, sB = width / bB.w;           // both ink widths → [−width/2, width/2] in z
  const mapA = { zOf: (fx) => -(fx - bA.cx) * sA, fxOf: (z) => bA.cx - z / sA, yOf: (fy) => -(fy - bA.cy) * sA };
  const mapB = { zOf: (fx) => -(fx - bB.cx) * sB, fxOf: (z) => bB.cx - z / sB, xOf: (fy) => (fy - bB.cy) * sB };
  // z-levels: every vertex of both outlines; spans crossed by a slanted edge are subdivided (≤ 0.004)
  const zs = [];
  for (const P of A) for (let i = 0; i < P.length; i += 2) zs.push(mapA.zOf(P[i]));
  for (const P of B) for (let i = 0; i < P.length; i += 2) zs.push(mapB.zOf(P[i]));
  const zl0 = levels(zs, 1e-7), Z = [zl0[0]];
  const slanted = (glyph, map, za, zb) => glyph.some((P) => {
    const n = P.length / 2;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const a = map.zOf(P[2 * j]), b = map.zOf(P[2 * i]);
      if (Math.abs(a - b) > 1e-9 && Math.abs(P[2 * j + 1] - P[2 * i + 1]) > 1e-9 && Math.min(a, b) < zb - 1e-9 && Math.max(a, b) > za + 1e-9) return true;
    }
    return false;
  });
  for (let k = 0; k + 1 < zl0.length; k++) {
    const za = zl0[k], zb = zl0[k + 1];
    const n = slanted(A, mapA, za, zb) || slanted(B, mapB, za, zb) ? Math.ceil((zb - za) / 0.004) : 1;
    for (let q = 1; q <= n; q++) Z.push(za + ((zb - za) * q) / n);
  }
  const nz = Z.length - 1;
  // per band: A's intervals in y, B's intervals in x
  const bandA = [], bandB = [], ys = [], xs = [];
  for (let k = 0; k < nz; k++) {
    const zm = (Z[k] + Z[k + 1]) / 2;
    const ia = columnIntervals(A, mapA.fxOf(zm)).map(([f0, f1]) => [mapA.yOf(f1), mapA.yOf(f0)]);
    const ib = columnIntervals(B, mapB.fxOf(zm)).map(([f0, f1]) => [mapB.xOf(f0), mapB.xOf(f1)]);
    bandA.push(ia); bandB.push(ib);
    for (const [a, b] of ia) ys.push(a, b);
    for (const [a, b] of ib) xs.push(a, b);
  }
  const Y = levels(ys, 0.0015), X = levels(xs, 0.0015);
  const nx = X.length - 1, ny = Y.length - 1;
  const occ = new Uint8Array(nx * ny * nz);
  const id = (i, j, k) => i + nx * (j + ny * k);
  for (let k = 0; k < nz; k++) {
    const colX = new Uint8Array(nx), colY = new Uint8Array(ny);
    for (const [a, b] of bandB[k]) for (let i = snap(X, a); i < snap(X, b); i++) colX[i] = 1;
    for (const [a, b] of bandA[k]) for (let j = snap(Y, a); j < snap(Y, b); j++) colY[j] = 1;
    for (let j = 0; j < ny; j++) if (colY[j]) for (let i = 0; i < nx; i++) if (colX[i]) occ[id(i, j, k)] = 1;
  }
  return { X, Y, Z, nx, ny, nz, occ, id, mapA, mapB, bA, bB, sA, sB };
}

/** count 6-connected pieces (a levitating sculpture may be several pieces that hold their places) */
export function components(S) {
  const { nx, ny, nz, occ } = S, lab = new Int32Array(occ.length).fill(-1), sizes = [];
  const stack = [];
  for (let s = 0; s < occ.length; s++) {
    if (!occ[s] || lab[s] >= 0) continue;
    const c = sizes.length; let size = 0;
    lab[s] = c; stack.push(s);
    while (stack.length) {
      const q = stack.pop(); size++;
      const i = q % nx, j = Math.floor(q / nx) % ny, k = Math.floor(q / (nx * ny));
      const nb = [i > 0 ? q - 1 : -1, i < nx - 1 ? q + 1 : -1, j > 0 ? q - nx : -1, j < ny - 1 ? q + nx : -1, k > 0 ? q - nx * ny : -1, k < nz - 1 ? q + nx * ny : -1];
      for (const r of nb) if (r >= 0 && occ[r] && lab[r] < 0) { lab[r] = c; stack.push(r); }
    }
    sizes.push(size);
  }
  return sizes;
}

/**
 * Exposed faces → BufferGeometry (sculpture-local coordinates, centred on the origin).
 * Attributes: position, normal, aUV (in-face u, w from the face's min corner, face size su, sw),
 * aCvx / aCcv (extra distance from each face edge +u, −u, +w, −w to the nearest convex / concave solid edge, 99 = none).
 * In-face axes per normal axis a: u = axis (a+1)%3, w = axis (a+2)%3 (so e_u × e_w = e_a).
 */
export function solidGeometry(S) {
  const { X, Y, Z, nx, ny, nz, occ, id } = S;
  const L = [X, Y, Z], N = [nx, ny, nz];
  const filled = (c) => c[0] >= 0 && c[1] >= 0 && c[2] >= 0 && c[0] < nx && c[1] < ny && c[2] < nz && occ[id(c[0], c[1], c[2])] === 1;
  const size = (axis, c) => L[axis][c[axis] + 1] - L[axis][c[axis]];
  // walk from cell c (face normal axis a, sign sg) in direction (axis d, step st) while the face stays flat
  const walk = (c, a, sg, d, st) => {
    const cur = c.slice();
    let acc = 0;
    for (let guard = 0; guard < 64; guard++) {
      const nb = cur.slice(); nb[d] += st;
      if (!filled(nb)) return [acc, NONE];                              // the solid ends: convex edge
      const up = nb.slice(); up[a] += sg;
      if (filled(up)) return [NONE, acc];                               // the surface turns toward us: concave edge
      acc += size(d, nb);
      if (acc > 0.06) return [NONE, NONE];
      cur[d] = nb[d];
    }
    return [NONE, NONE];
  };
  const P = [], Nn = [], UV = [], CV = [], CC = [], idx = [];
  const c = [0, 0, 0];
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    if (!occ[id(i, j, k)]) continue;
    c[0] = i; c[1] = j; c[2] = k;
    for (let a = 0; a < 3; a++) for (const sg of [1, -1]) {
      const nb = c.slice(); nb[a] += sg;
      if (filled(nb)) continue;
      const u = (a + 1) % 3, w = (a + 2) % 3;
      const u0 = L[u][c[u]], u1 = L[u][c[u] + 1], w0 = L[w][c[w]], w1 = L[w][c[w] + 1];
      const pa = sg > 0 ? L[a][c[a] + 1] : L[a][c[a]];
      const [cu1, ku1] = walk(c, a, sg, u, 1), [cu0, ku0] = walk(c, a, sg, u, -1);
      const [cw1, kw1] = walk(c, a, sg, w, 1), [cw0, kw0] = walk(c, a, sg, w, -1);
      const base = P.length / 3;
      // corners in (u, w): (0,0) (1,0) (1,1) (0,1) — counter-clockwise seen from +a; reversed for −a
      const corners = sg > 0 ? [[0, 0], [1, 0], [1, 1], [0, 1]] : [[0, 0], [0, 1], [1, 1], [1, 0]];
      for (const [cu, cw] of corners) {
        const p = [0, 0, 0];
        p[a] = pa; p[u] = cu ? u1 : u0; p[w] = cw ? w1 : w0;
        P.push(p[0], p[1], p[2]);
        const n = [0, 0, 0]; n[a] = sg; Nn.push(n[0], n[1], n[2]);
        UV.push(cu ? u1 - u0 : 0, cw ? w1 - w0 : 0, u1 - u0, w1 - w0);
        CV.push(cu1, cu0, cw1, cw0);
        CC.push(ku1, ku0, kw1, kw0);
      }
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3));
  g.setAttribute('aUV', new THREE.Float32BufferAttribute(UV, 4));
  g.setAttribute('aCvx', new THREE.Float32BufferAttribute(CV, 4));
  g.setAttribute('aCcv', new THREE.Float32BufferAttribute(CC, 4));
  g.setIndex(idx);
  g.userData.faces = idx.length / 6;
  return g;
}

// even-odd coverage test of a point (font units) against a glyph
function inside(contours, x, y) {
  let c = false;
  for (const P of contours) {
    const n = P.length / 2;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = P[2 * i], yi = P[2 * i + 1], xj = P[2 * j], yj = P[2 * j + 1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
  }
  return c;
}
/**
 * IoU of each shadow (projection of the cells along x and along y) against its glyph, sampled on a res×res grid over
 * the glyph's ink box (pixel centres). 1 = the shadow is the glyph.
 */
export function shadowFidelity(S, A, B, res = 400) {
  const { X, Y, Z, nx, ny, nz, occ, id, bA, bB, mapA, mapB } = S;
  const projX = new Uint8Array(ny * nz), projY = new Uint8Array(nx * nz);       // (y, z) and (x, z)
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) if (occ[id(i, j, k)]) { projX[j + ny * k] = 1; projY[i + nx * k] = 1; }
  const cellOf = (L, v) => { if (v < L[0] || v >= L[L.length - 1]) return -1; let lo = 0, hi = L.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] <= v) lo = m; else hi = m; } return lo; };
  const iou = (glyph, box, test) => {
    let I = 0, U = 0;
    const pad = 0.04 * box.w;
    for (let q = 0; q < res; q++) for (let p = 0; p < res; p++) {
      const fx = box.x0 - pad + ((p + 0.5) / res) * (box.w + 2 * pad), fy = box.y0 - pad + ((q + 0.5) / res) * (box.h + 2 * pad);
      const g = inside(glyph, fx, fy), s = test(fx, fy);
      if (g && s) I++;
      if (g || s) U++;
    }
    return I / U;
  };
  const wall = iou(A, bA, (fx, fy) => { const k = cellOf(Z, mapA.zOf(fx)), j = cellOf(Y, mapA.yOf(fy)); return k >= 0 && j >= 0 && projX[j + ny * k] === 1; });
  const table = iou(B, bB, (fx, fy) => { const k = cellOf(Z, mapB.zOf(fx)), i = cellOf(X, mapB.xOf(fy)); return k >= 0 && i >= 0 && projY[i + nx * k] === 1; });
  return { wall, table };
}
