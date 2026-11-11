/*
 * pavilion.js — an invented small stone pavilion (a square jeongja: two-tier plinth, front steps, base stones,
 * four columns with a slight entasis, two rings of beams, low railings, a concave pyramidal tiled roof with lifted
 * corners, hip ridges and a finial), built entirely in code as ONE non-indexed BufferGeometry.
 *
 * Every part is a parametric grid f(u, v) → triangles. Each triangle carries a barycentric attribute `aBary` whose
 * components double as an edge mask: the component that is 0 along an edge is forced to 1 on all three vertices when
 * that edge must not be drawn (quad diagonals, bevel sub-lines). The wire band in main.js then shows a clean quad
 * grid at a chosen density while the surface itself stays finely tessellated.
 * `aW` is the surface-sampling weight: 0 for faces that no scanner position can see (bottoms, faces buried in
 * another block, beam tops under the roof), so the point cloud never shows hidden surfaces.
 */
import * as THREE from 'three';

// ---------------------------------------------------------------- dimensions (world units ≈ metres)
export const DIM = {
  PL_LO: [2.75, 0.19], PL_HI: [2.35, 0.17],      // plinth tiers: half size, half height (stacked from y = 0)
  COL: 1.7, COL_Y0: 0.9, COL_Y1: 3.38,           // column centres at (±COL, ±COL), shaft height
  R0: 2.68, BUL: 0.07, YE: 4.1, HR: 2.1,          // roof: eave half-width, plan bulge, eave height, rise
  SAG: 0.55, LIFT: 0.34, PITCH: 0.2, TAMP: 0.034, // concave profile, corner lift, tile pitch and height
  FIN: 0.8,                                       // finial height
};
export const TOP_Y = DIM.YE + DIM.HR + DIM.FIN;   // highest point of the model

const tones = {
  plinth: '#8b857c', stone: '#a39c91', base: '#958f86', beam: '#9c958a', rail: '#9a9388',
  tile: '#5c5f65', ridge: '#4e5157', finial: '#56595f',
};
const COL = Object.fromEntries(Object.entries(tones).map(([k, v]) => { const c = new THREE.Color(v); return [k, [c.r, c.g, c.b]]; }));

class Builder {
  constructor() { this.P = []; this.N = []; this.C = []; this.B = []; }

  // one triangle; d = [drawAB, drawBC, drawCA]; winding follows the vertex normals (outward)
  tri(a, b, c, na, nb, nc, d, col) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const gx = uy * vz - uz * vy, gy = uz * vx - ux * vz, gz = ux * vy - uy * vx;
    if (gx * gx + gy * gy + gz * gz < 1e-14) return;                 // degenerate (apex, tips)
    let [dAB, dBC, dCA] = d;
    if (gx * (na[0] + nb[0] + nc[0]) + gy * (na[1] + nb[1] + nc[1]) + gz * (na[2] + nb[2] + nc[2]) < 0) {
      [b, c] = [c, b]; [nb, nc] = [nc, nb]; [dAB, dCA] = [dCA, dAB];
    }
    // barycentric x is 0 on BC, y on CA, z on AB; a hidden edge keeps its component at 1 everywhere
    const hx = dBC ? 0 : 1, hy = dCA ? 0 : 1, hz = dAB ? 0 : 1;
    this.P.push(...a, ...b, ...c);
    this.N.push(...na, ...nb, ...nc);
    this.C.push(...col, ...col, ...col);
    this.B.push(1, hy, hz, hx, 1, hz, hx, hy, 1);
  }

  /* Parametric grid over us × vs. f(u, v) → [x, y, z]; nf(u, v, p) → normal (optional, else central differences
     oriented by out(p) → a rough outward vector). drawU(i) / drawV(j): is the line u = us[i] / v = vs[j] drawn. */
  grid(us, vs, f, { nf = null, out = null, drawU = () => true, drawV = () => true, col }) {
    const nu = us.length, nv = vs.length;
    const P = [], N = [];
    const eu = 1e-4 * (us[nu - 1] - us[0]), ev = 1e-4 * (vs[nv - 1] - vs[0]);
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const u = us[i], v = vs[j], p = f(u, v);
      let n;
      if (nf) n = nf(u, v, p);
      else {
        const a = f(u + eu, v), b = f(u - eu, v), c = f(u, v + ev), d = f(u, v - ev);
        const du = [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dv = [c[0] - d[0], c[1] - d[1], c[2] - d[2]];
        n = [du[1] * dv[2] - du[2] * dv[1], du[2] * dv[0] - du[0] * dv[2], du[0] * dv[1] - du[1] * dv[0]];
      }
      let l = Math.hypot(n[0], n[1], n[2]);
      const o = out ? out(p, u, v) : null;
      if (l < 1e-12) { n = o ? o.slice() : [0, 1, 0]; l = Math.hypot(n[0], n[1], n[2]); }
      n = [n[0] / l, n[1] / l, n[2] / l];
      if (o && n[0] * o[0] + n[1] * o[1] + n[2] * o[2] < 0) n = [-n[0], -n[1], -n[2]];
      P.push(p); N.push(n);
    }
    const at = (i, j) => i * nv + j;
    for (let i = 0; i < nu - 1; i++) for (let j = 0; j < nv - 1; j++) {
      const p00 = at(i, j), p10 = at(i + 1, j), p11 = at(i + 1, j + 1), p01 = at(i, j + 1);
      // T1 (00, 10, 11): AB = line v_j, BC = line u_{i+1}, CA = diagonal (hidden)
      this.tri(P[p00], P[p10], P[p11], N[p00], N[p10], N[p11], [drawV(j), drawU(i + 1), false], col);
      // T2 (00, 11, 01): AB = diagonal (hidden), BC = line v_{j+1}, CA = line u_i
      this.tri(P[p00], P[p11], P[p01], N[p00], N[p11], N[p01], [false, drawV(j + 1), drawU(i)], col);
    }
  }

  /* Rounded box: each face is a grid whose points are pushed onto the rounded surface (inner box + r · unit offset);
     the bevel quarter-circle is split at 45° between the two faces, sampled by tan(θ) so the arc steps are even. */
  rbox(c, h, r, { cell = 0.45, m = 2, faces = 'xXyYzZ', col }) {
    const lists = h.map((H) => {
      const inner = H - r, n = Math.max(1, Math.round((2 * inner) / cell));
      const vals = [], draw = [];
      for (let j = m; j >= 1; j--) { vals.push(-inner - r * Math.tan((Math.PI / 4) * (j / m))); draw.push(false); }
      for (let j = 0; j <= n; j++) { vals.push(-inner + (2 * inner * j) / n); draw.push(true); }
      for (let j = 1; j <= m; j++) { vals.push(inner + r * Math.tan((Math.PI / 4) * (j / m))); draw.push(false); }
      return { vals, draw };
    });
    const map = (p) => {
      const q = [0, 0, 0], d = [0, 0, 0];
      for (let k = 0; k < 3; k++) { const L = h[k] - r; q[k] = Math.max(-L, Math.min(L, p[k])); d[k] = p[k] - q[k]; }
      const l = Math.hypot(d[0], d[1], d[2]) || 1;
      return { p: [c[0] + q[0] + (r * d[0]) / l, c[1] + q[1] + (r * d[1]) / l, c[2] + q[2] + (r * d[2]) / l], n: [d[0] / l, d[1] / l, d[2] / l] };
    };
    const AX = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
    for (let a = 0; a < 3; a++) for (const s of [1, -1]) {
      const key = 'xyz'[a];
      if (!faces.includes(s > 0 ? key.toUpperCase() : key)) continue;
      const [, b, cc] = AX[a];
      const L1 = lists[b], L2 = lists[cc];
      const pt = (u, v) => { const p = [0, 0, 0]; p[a] = s * h[a]; p[b] = u; p[cc] = v; return p; };
      this.grid(L1.vals, L2.vals, (u, v) => map(pt(u, v)).p, {
        nf: (u, v) => map(pt(u, v)).n, drawU: (i) => L1.draw[i], drawV: (j) => L2.draw[j], col,
      });
    }
  }

  /* Surface of revolution about the vertical axis through (cx, cz); prof = [[r, y], …] bottom → top. */
  lathe(cx, cz, prof, segs, { everyU = 2, everyV = 2, col }) {
    const us = Array.from({ length: segs + 1 }, (_, i) => (i / segs) * Math.PI * 2);
    const vs = prof.map((_, j) => j);
    const nrm2 = prof.map((_, j) => {
      const a = prof[Math.max(0, j - 1)], b = prof[Math.min(prof.length - 1, j + 1)];
      const dr = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dr, dy) || 1;
      return [dy / l, -dr / l];                       // outward (+r) for a profile that runs upward
    });
    this.grid(us, vs, (u, j) => { const [r, y] = prof[Math.round(j)]; return [cx + r * Math.cos(u), y, cz + r * Math.sin(u)]; }, {
      nf: (u, j) => { const [nr, ny] = nrm2[Math.round(j)]; return [nr * Math.cos(u), ny, nr * Math.sin(u)]; },
      drawU: (i) => i % everyU === 0, drawV: (j) => j % everyV === 0 || j === prof.length - 1, col,
    });
  }
}

// ---------------------------------------------------------------- the roof (one face in local coordinates, then rotated)
const g = (q) => q * (1 + DIM.SAG) - DIM.SAG * q * q;                 // concave rise profile (0 at apex … 1 at eave)
const rz = (u) => DIM.R0 * (1 + DIM.BUL * u * u);                      // eave line bows outward toward the corners
const roofBase = (u, q) => DIM.YE + DIM.HR * (1 - g(q)) + DIM.LIFT * q * q * q * Math.abs(u) ** 3;
const tile = (x, q) => {
  const c = 0.5 + 0.5 * Math.cos((2 * Math.PI * x) / DIM.PITCH);      // convex tile rows along the slope
  const k = Math.min(1, Math.max(0, (q - 0.04) / 0.12));
  return DIM.TAMP * c * c * k * k * (3 - 2 * k);
};
const rot = (f, p) => {                                                // face f: rotate local (x', y, z') by f · 90° about y
  const a = (f * Math.PI) / 2, c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
};

export function buildPavilion() {
  const B = new Builder();
  const D = DIM;
  const [loH, loY] = D.PL_LO, [hiH, hiY] = D.PL_HI;
  const floorY = 2 * loY + 2 * hiY;                                   // top of the plinth (0.72)

  // ---- plinth, two tiers (bottoms are never seen)
  B.rbox([0, loY, 0], [loH, loY, loH], 0.05, { cell: 0.5, faces: 'xXYzZ', col: COL.plinth });
  B.rbox([0, 2 * loY + hiY, 0], [hiH, hiY, hiH], 0.05, { cell: 0.5, faces: 'xXYzZ', col: COL.plinth });
  // ---- front steps
  B.rbox([0, 0.12, 3.235], [0.8, 0.12, 0.185], 0.035, { cell: 0.4, faces: 'xXYZ', col: COL.base });
  B.rbox([0, 0.24, 2.9], [0.8, 0.24, 0.15], 0.035, { cell: 0.4, faces: 'xXYZ', col: COL.base });
  B.rbox([0, 2 * loY + hiY, 2.55], [0.8, hiY, 0.2], 0.035, { cell: 0.4, faces: 'xXYZ', col: COL.base });

  // ---- base stones, columns, capitals
  const corners = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([a, b]) => [a * D.COL, b * D.COL]);
  for (const [x, z] of corners) {
    B.rbox([x, floorY + 0.09, z], [0.3, 0.09, 0.3], 0.045, { cell: 0.6, faces: 'xXYzZ', col: COL.base });
    const prof = [];
    for (let j = 0; j <= 12; j++) {
      const v = j / 12;
      prof.push([0.205 + 0.014 * Math.sin(Math.PI * v * 0.85) - 0.035 * v, D.COL_Y0 + (D.COL_Y1 - D.COL_Y0) * v]);
    }
    B.lathe(x, z, prof, 20, { everyU: 2, everyV: 2, col: COL.stone });
    B.rbox([x, D.COL_Y1 + 0.08, z], [0.2, 0.08, 0.2], 0.03, { cell: 0.6, faces: 'xXYyzZ', col: COL.beam });
  }

  // ---- beams: lower ring (ends run past the columns), upper ring under the roof
  const yb0 = D.COL_Y1 + 0.16, hb0 = 0.15, yb1 = yb0 + 2 * hb0, hb1 = 0.18;
  for (const s of [1, -1]) {
    B.rbox([0, yb0 + hb0, s * D.COL], [1.98, hb0, 0.12], 0.03, { cell: 0.55, col: COL.beam });
    B.rbox([s * D.COL, yb0 + hb0, 0], [0.12, hb0, D.COL - 0.12], 0.03, { cell: 0.55, faces: 'xXyY', col: COL.beam });
    B.rbox([0, yb1 + hb1, s * 1.78], [2.16, hb1, 0.11], 0.03, { cell: 0.55, faces: 'xXyzZ', col: COL.beam });
    B.rbox([s * 1.78, yb1 + hb1, 0], [0.11, hb1, 1.78 - 0.11], 0.03, { cell: 0.55, faces: 'xXy', col: COL.beam });
  }

  // ---- railings between the columns on the left, right and back
  const railY = floorY + 0.58;
  const sides = [[1, 0], [-1, 0], [0, -1]];
  for (const [sx, sz] of sides) {
    const along = sx !== 0 ? 'z' : 'x';
    const cx = sx * D.COL, cz = sz * D.COL;
    const half = D.COL - 0.2;
    const hb = along === 'z' ? [0.045, 0.035, half] : [half, 0.035, 0.045];
    B.rbox([cx, railY, cz], hb, 0.02, { cell: 0.7, col: COL.rail });
    const lo = along === 'z' ? [0.035, 0.03, half] : [half, 0.03, 0.035];
    B.rbox([cx, floorY + 0.14, cz], lo, 0.018, { cell: 0.7, col: COL.rail });
    for (let k = 0; k < 7; k++) {
      const a = -half + ((k + 0.5) * 2 * half) / 7;
      const px = along === 'z' ? cx : a, pz = along === 'z' ? a : cz;
      B.rbox([px, floorY + 0.17 + 0.205, pz], [0.03, 0.205, 0.03], 0.012, { cell: 0.6, m: 1, faces: 'xXzZ', col: COL.rail });
    }
  }

  // ---- roof: top surface with tile rows, fascia and a short soffit, per face
  const NU = 108, NQ = 18;
  const us = Array.from({ length: NU + 1 }, (_, i) => -1 + (2 * i) / NU);
  const qs = Array.from({ length: NQ + 1 }, (_, j) => 0.004 + (0.996 * j) / NQ);
  for (let f = 0; f < 4; f++) {
    const top = (u, q) => { const r = rz(u), x = u * q * r; return rot(f, [x, roofBase(u, q) + tile(x, q), q * r]); };
    B.grid(us, qs, top, { out: () => [0, 1, 0], drawU: (i) => i % 4 === 0, drawV: (j) => j % 2 === 0, col: COL.tile });
    const ws = [0, 0.5, 1];
    const fascia = (u, w) => {
      const r = rz(u), x = u * r, yT = roofBase(u, 1) + tile(x, 1), yB = roofBase(u, 1) - 0.14;
      return rot(f, [x, yT + (yB - yT) * w, r]);
    };
    B.grid(us, ws, fascia, { out: (p) => [p[0], 0, p[2]], drawU: (i) => i % 4 === 0, drawV: (j) => j !== 1, col: COL.tile });
    const ss = Array.from({ length: 7 }, (_, j) => 0.62 + (0.38 * j) / 6);
    const soffit = (u, q) => { const r = rz(u); return rot(f, [u * q * r, roofBase(u, q) - 0.14 - 0.45 * (1 - q), q * r]); };
    B.grid(us.filter((_, i) => i % 4 === 0), ss, soffit, { out: () => [0, -1, 0], drawV: (j) => j % 2 === 0, col: COL.tile });

    // hip ridge along this face's u = +1 edge: a tube that closes with a rounded, upturned end past the eave
    const hip = (q) => { const r = rz(1); return rot(f, [q * r, roofBase(1, q) + 0.05, q * r]); };
    const ph = Array.from({ length: 11 }, (_, i) => (i / 10) * Math.PI * 2);
    const hq = [];
    for (let j = 0; j <= 30; j++) hq.push(0.03 + (1.0 - 0.03) * (j / 30));
    for (let j = 1; j <= 5; j++) hq.push(1.0 + 0.055 * (1 - Math.cos((Math.PI / 2) * (j / 5))));
    const rad = (q) => 0.085 * Math.sqrt(Math.max(0, Math.min(1, (1.055 - q) / 0.055)));
    const frame = (q) => {
      const a = hip(q - 1e-3), b = hip(q + 1e-3);
      let T = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const lt = Math.hypot(...T); T = T.map((x) => x / lt);
      let N = [-T[1] * T[0], 1 - T[1] * T[1], -T[1] * T[2]];       // world up, made perpendicular to T
      const ln = Math.hypot(...N); N = N.map((x) => x / ln);
      const Bn = [T[1] * N[2] - T[2] * N[1], T[2] * N[0] - T[0] * N[2], T[0] * N[1] - T[1] * N[0]];
      return { N, Bn };
    };
    B.grid(ph, hq, (a, q) => {
      const c = hip(q), { N, Bn } = frame(q), r = rad(q);
      return [0, 1, 2].map((k) => c[k] + r * (Math.cos(a) * N[k] + Math.sin(a) * Bn[k]));
    }, {
      nf: (a, q) => { const { N, Bn } = frame(q); return [0, 1, 2].map((k) => Math.cos(a) * N[k] + Math.sin(a) * Bn[k]); },
      drawU: (i) => i % 2 === 0, drawV: (j) => j % 3 === 0, col: COL.ridge,
    });
  }

  // ---- finial on the apex
  const apex = DIM.YE + DIM.HR;
  const fp = [[0.3, -0.06], [0.31, 0.02], [0.27, 0.07], [0.15, 0.1], [0.13, 0.14], [0.17, 0.2], [0.21, 0.28], [0.2, 0.36],
    [0.15, 0.42], [0.08, 0.46], [0.065, 0.5], [0.1, 0.55], [0.11, 0.6], [0.085, 0.66], [0.05, 0.71], [0.025, 0.76], [0.0, 0.8]];
  B.lathe(0, 0, fp.map(([r, y]) => [r, apex + y]), 20, { everyU: 2, everyV: 2, col: COL.finial });

  // ---- assemble
  const n = B.P.length / 3;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(B.P, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(B.N, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(B.C, 3));
  geo.setAttribute('aBary', new THREE.Float32BufferAttribute(B.B, 3));

  // sampling weights: 0 where no scan position sees the surface
  const solids = [
    [[0, loY, 0], [loH, loY, loH]], [[0, 2 * loY + hiY, 0], [hiH, hiY, hiH]],
    [[0, 0.12, 3.235], [0.8, 0.12, 0.185]], [[0, 0.24, 2.9], [0.8, 0.24, 0.15]], [[0, 2 * loY + hiY, 2.55], [0.8, hiY, 0.2]],
  ];
  const inside = (x, y, z) => solids.some(([c, h]) => Math.abs(x - c[0]) < h[0] - 0.01 && Math.abs(y - c[1]) < h[1] - 0.01 && Math.abs(z - c[2]) < h[2] - 0.01);
  const W = new Float32Array(n);
  for (let t = 0; t < n; t += 3) {
    let cx = 0, cy = 0, cz = 0, ny = 0;
    for (let k = 0; k < 3; k++) { cx += B.P[(t + k) * 3] / 3; cy += B.P[(t + k) * 3 + 1] / 3; cz += B.P[(t + k) * 3 + 2] / 3; ny += B.N[(t + k) * 3 + 1] / 3; }
    let w = 1;
    if (ny < -0.6 && cy < 3) w = 0;                                    // undersides near the ground
    if (inside(cx, cy, cz)) w = 0;                                     // buried in another block
    if (cy > 3.3 && cy < 4.4 && Math.abs(cx) < 2.2 && Math.abs(cz) < 2.2 && ny > 0.5) w = 0;   // beam tops under the roof
    if (ny < -0.6 && cy >= 3) w = 0.25;                                // soffit: seen only from below
    W[t] = W[t + 1] = W[t + 2] = w;
  }
  geo.setAttribute('aW', new THREE.BufferAttribute(W, 1));
  geo.computeBoundingSphere();
  return geo;
}
