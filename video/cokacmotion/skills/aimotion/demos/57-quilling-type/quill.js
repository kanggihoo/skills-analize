/*
 * quill.js — geometry for 57 · 종이 띠로 세운 글자. Everything here is a pure function of the font outlines and fixed seeds.
 *
 *   prepareStrip(raw, contours)   glyph contour → arc-length samples, rounded corners, start corner, curl side, effort table
 *   stripGeometry(strip)          ribbon mesh (two walls + top edge + end caps) whose shape is decided in the vertex shader
 *   packMotifs(glyph, seed)       even-odd raster → signed distance → largest-first circle packing (Poisson-disc spacing)
 *   motifCurve(m)                 coil / loose coil / teardrop / marquise / S-scroll / C-scroll centre lines
 *   motifGeometry(list)           one merged ribbon mesh for every fill motif (pop-in happens in the vertex shader)
 *   paperCanvas(size, seed)       tileable paper: fibres (R) and cloudy formation (G)
 *
 * Units: 1 = one em of the glyphs. The paper is the xz plane (y up); font y (down) maps to world +z.
 */
import * as THREE from 'three';
import { rand, clamp } from '../_lib/stage.js';
import { signedDistance } from '../_lib/type.js';

export const TH = 0.0034;        // paper thickness
export const H_OUT = 0.052;      // outline strip height (paper width)
export const H_FILL = 0.043;     // fill motifs: a slightly narrower strip, so the outline stands proud
export const PITCH_COIL = 0.0058; // ring spacing of the coil riding at a strip's tip (and of tight fill coils)
const R_IN = 0.0045;             // the coil's empty centre (the quilling tool's slot)

/* ------------------------------------------------------------------ polylines (flat [x0, z0, x1, z1, …]) */
function resampleClosed(P, h) {
  const n0 = P.length / 2, cum = new Float64Array(n0 + 1);
  for (let i = 0; i < n0; i++) { const j = (i + 1) % n0; cum[i + 1] = cum[i] + Math.hypot(P[2 * j] - P[2 * i], P[2 * j + 1] - P[2 * i + 1]); }
  const L = cum[n0], n = Math.max(12, Math.round(L / h)), out = new Float64Array(2 * n);
  let k = 0;
  for (let i = 0; i < n; i++) {
    const s = (i / n) * L;
    while (k < n0 - 1 && cum[k + 1] < s) k++;
    const a = (s - cum[k]) / (cum[k + 1] - cum[k] || 1), j = (k + 1) % n0;
    out[2 * i] = P[2 * k] + (P[2 * j] - P[2 * k]) * a;
    out[2 * i + 1] = P[2 * k + 1] + (P[2 * j + 1] - P[2 * k + 1]) * a;
  }
  return out;
}
// Gaussian smoothing along a closed curve (sigma in samples): rounds sharp corners to a radius ≈ sigma, leaves straights alone
function smoothClosed(P, sigma) {
  const n = P.length / 2, R = Math.ceil(sigma * 3), w = [];
  let ws = 0;
  for (let k = -R; k <= R; k++) { const v = Math.exp(-(k * k) / (2 * sigma * sigma)); w.push(v); ws += v; }
  const out = new Float64Array(2 * n);
  for (let i = 0; i < n; i++) {
    let x = 0, z = 0;
    for (let k = -R; k <= R; k++) { const j = (((i + k) % n) + n) % n; x += w[k + R] * P[2 * j]; z += w[k + R] * P[2 * j + 1]; }
    out[2 * i] = x / ws; out[2 * i + 1] = z / ws;
  }
  return out;
}
/** even-odd point test against every contour of a glyph */
export function insideEvenOdd(x, z, contours) {
  let c = false;
  for (const P of contours) {
    const n = P.length / 2;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = P[2 * i], zi = P[2 * i + 1], xj = P[2 * j], zj = P[2 * j + 1];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
    }
  }
  return c;
}
const wrapA = (a) => a - Math.round(a / (Math.PI * 2)) * Math.PI * 2;

/* ------------------------------------------------------------------ outline strips */
/**
 * One glyph contour → the strip that will be laid along it.
 *   pos/tan  samples every ~2.5 thousandths of an em along the rounded contour (closed: last = first)
 *   tanSm    tangent averaged over ±0.025 em: the direction the coil leaves in (no snap at corners)
 *   eff      cumulative "effort": arc length + extra at bends, so the hand slows down around corners
 *   curl     which side the coil curls to: away from the letter's ink
 */
export function prepareStrip(raw, glyphContours) {
  // the start: the sharpest corner of the raw outline (top-left first); a contour without corners starts at its top
  const n0 = raw.length / 2;
  let best = -1, bestScore = -Infinity;
  for (let i = 0; i < n0; i++) {
    const a = (i + n0 - 1) % n0, b = (i + 1) % n0;
    const t0 = Math.atan2(raw[2 * i + 1] - raw[2 * a + 1], raw[2 * i] - raw[2 * a]);
    const t1 = Math.atan2(raw[2 * b + 1] - raw[2 * i + 1], raw[2 * b] - raw[2 * i]);
    const turn = Math.abs(wrapA(t1 - t0));
    const score = turn > 1.0 ? 10 - (raw[2 * i] + 1.4 * raw[2 * i + 1]) : -raw[2 * i + 1] - 20;
    if (score > bestScore) { bestScore = score; best = i; }
  }
  const sx = raw[2 * best], sz = raw[2 * best + 1];
  // round the corners: resample finely, Gaussian-smooth with σ ≈ 5.5 thousandths of an em (real paper bends, it does not crease)
  const H0 = 0.0015;
  let P = smoothClosed(resampleClosed(raw, H0), 0.0055 / H0);
  // rotate so the strip starts at the chosen corner
  let k0 = 0, dk = Infinity;
  for (let i = 0; i < P.length / 2; i++) { const d = Math.hypot(P[2 * i] - sx, P[2 * i + 1] - sz); if (d < dk) { dk = d; k0 = i; } }
  P = Float64Array.from({ length: P.length }, (_, q) => P[(q + 2 * k0) % P.length]);
  P = resampleClosed(P, 0.0025);
  const n = P.length / 2, N = n + 1;                     // N samples, the last one closes the loop
  const pos = new Float64Array(2 * N), tan = new Float64Array(2 * N), s = new Float64Array(N);
  let L = 0;
  for (let i = 0; i < N; i++) {
    const c = i % n, a = (c + n - 1) % n, b = (c + 1) % n;
    pos[2 * i] = P[2 * c]; pos[2 * i + 1] = P[2 * c + 1];
    const tx = P[2 * b] - P[2 * a], tz = P[2 * b + 1] - P[2 * a + 1], tl = Math.hypot(tx, tz) || 1;
    tan[2 * i] = tx / tl; tan[2 * i + 1] = tz / tl;
    if (i > 0) L += Math.hypot(pos[2 * i] - pos[2 * i - 2], pos[2 * i + 1] - pos[2 * i - 1]);
    s[i] = L;
  }
  // smoothed tangent for the coil (±10 samples ≈ ±0.025 em)
  const tanSm = new Float64Array(2 * N);
  for (let i = 0; i < N; i++) {
    let x = 0, z = 0;
    for (let k = -10; k <= 10; k++) {
      const j = Math.min(N - 1, Math.max(0, i + k)), w = 1 - Math.abs(k) / 11;
      x += tan[2 * j] * w; z += tan[2 * j + 1] * w;
    }
    const l = Math.hypot(x, z) || 1;
    tanSm[2 * i] = x / l; tanSm[2 * i + 1] = z / l;
  }
  // effort = ∫ (1 + 0.12·|κ|) ds: a right-angle bend costs as much as 0.19 em of straight strip
  const eff = new Float64Array(N);
  for (let i = 1; i < N; i++) {
    const a0 = Math.atan2(tan[2 * i - 1], tan[2 * i - 2]), a1 = Math.atan2(tan[2 * i + 1], tan[2 * i]);
    eff[i] = eff[i - 1] + (s[i] - s[i - 1]) + 0.12 * Math.abs(wrapA(a1 - a0));
  }
  // curl away from the ink: majority vote of "is the right-hand side inside?" along the strip
  let rightIn = 0;
  for (let i = 0; i < n; i += 3) {
    const nx = -tan[2 * i + 1], nz = tan[2 * i];
    if (insideEvenOdd(pos[2 * i] + nx * 0.012, pos[2 * i + 1] + nz * 0.012, glyphContours)) rightIn++; else rightIn--;
  }
  return { pos, tan, tanSm, s, eff, N, L, curl: rightIn > 0 ? -1 : 1 };
}

/** sample the strip at arc length u: position, coil tangent */
export function stripAt(st, u, out) {
  const { s, N } = st;
  let lo = 0, hi = N - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (s[m] <= u) lo = m; else hi = m; }
  const a = clamp((u - s[lo]) / (s[hi] - s[lo] || 1));
  out.x = st.pos[2 * lo] + (st.pos[2 * hi] - st.pos[2 * lo]) * a;
  out.z = st.pos[2 * lo + 1] + (st.pos[2 * hi + 1] - st.pos[2 * lo + 1]) * a;
  let tx = st.tanSm[2 * lo] + (st.tanSm[2 * hi] - st.tanSm[2 * lo]) * a, tz = st.tanSm[2 * lo + 1] + (st.tanSm[2 * hi + 1] - st.tanSm[2 * lo + 1]) * a;
  const l = Math.hypot(tx, tz) || 1;
  out.tx = tx / l; out.tz = tz / l;
  return out;
}
/** effort → arc length (the hand's progress) */
export function arcOfEffort(st, e) {
  const { eff, s, N } = st;
  if (e <= 0) return 0;
  if (e >= eff[N - 1]) return st.L;
  let lo = 0, hi = N - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (eff[m] <= e) lo = m; else hi = m; }
  return s[lo] + (s[hi] - s[lo]) * ((e - eff[lo]) / (eff[hi] - eff[lo] || 1));
}

// ribbon cross-section: 6 vertices per sample — wall A (side −1) bottom/top, wall B (side +1) bottom/top, top edge A/B.
// corner = (side, v, face): face 0 wall, 1 top edge, 2 start cap (normal −T), 3 end cap (normal +T).
// Windings are counter-clockwise seen from outside (checked against the frame: T, right normal n = (−Tz, Tx), up),
// so the shadow pass can draw back faces only.
function ribbonIndices(idx, base, count) {
  for (let i = 0; i < count - 1; i++) {
    const a = base + 6 * i, b = a + 6;
    idx.push(b + 0, a + 0, a + 1, b + 0, a + 1, b + 1);       // wall A: A0_j A0_i A1_i, A0_j A1_i A1_j
    idx.push(a + 2, b + 2, b + 3, a + 2, b + 3, a + 3);       // wall B: B0_i B0_j B1_j, B0_i B1_j B1_i
    idx.push(a + 4, a + 5, b + 5, a + 4, b + 5, b + 4);       // top:    TA_i TB_i TB_j, TA_i TB_j TA_j
  }
}
const CORNERS = [[-1, 0, 0], [-1, 1, 0], [1, 0, 0], [1, 1, 0], [-1, 1, 1], [1, 1, 1]];
const CAP0 = [[-1, 0, 2], [1, 0, 2], [1, 1, 2], [-1, 1, 2]];     // seen from −T: side −1 on the left
const CAP1 = [[1, 0, 3], [-1, 0, 3], [-1, 1, 3], [1, 1, 3]];     // seen from +T: side +1 on the left

export function stripGeometry(st, laidOf) {
  const nv = st.N * 6 + 8;
  const position = new Float32Array(nv * 3), rest = new Float32Array(nv * 4), sl = new Float32Array(nv * 2), corner = new Float32Array(nv * 3);
  const put = (v, i, c) => {
    position[3 * v] = st.pos[2 * i]; position[3 * v + 1] = c[1] * H_OUT; position[3 * v + 2] = st.pos[2 * i + 1];
    rest.set([st.pos[2 * i], st.pos[2 * i + 1], st.tan[2 * i], st.tan[2 * i + 1]], 4 * v);
    sl[2 * v] = st.s[i]; sl[2 * v + 1] = laidOf(st.s[i]);
    corner.set(c, 3 * v);
  };
  let v = 0;
  for (let i = 0; i < st.N; i++) for (const c of CORNERS) put(v++, i, c);
  const c0 = v; for (const c of CAP0) put(v++, 0, c);
  const c1 = v; for (const c of CAP1) put(v++, st.N - 1, c);
  const idx = [];
  ribbonIndices(idx, 0, st.N);
  idx.push(c0, c0 + 1, c0 + 2, c0, c0 + 2, c0 + 3, c1, c1 + 1, c1 + 2, c1, c1 + 2, c1 + 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(position, 3));
  g.setAttribute('aRest', new THREE.BufferAttribute(rest, 4));
  g.setAttribute('aS', new THREE.BufferAttribute(sl, 2));
  g.setAttribute('aCorner', new THREE.BufferAttribute(corner, 3));
  g.setIndex(idx);
  return g;
}

/* ------------------------------------------------------------------ fill: raster → distance → circle packing */
function rasterEvenOdd(contours, x0, z0, px, w, h) {
  const a = new Float32Array(w * h), SUB = 4, xs = [];
  for (let j = 0; j < h; j++) for (let sb = 0; sb < SUB; sb++) {
    const z = z0 + (j + (sb + 0.5) / SUB) * px;
    xs.length = 0;
    for (const P of contours) {
      const n = P.length / 2;
      for (let i = 0, k = n - 1; i < n; k = i++) {
        const ax = P[2 * k], az = P[2 * k + 1], bx = P[2 * i], bz = P[2 * i + 1];
        if ((az <= z) !== (bz <= z)) xs.push(ax + ((z - az) / (bz - az)) * (bx - ax));
      }
    }
    xs.sort((p, q) => p - q);
    for (let q = 0; q + 1 < xs.length; q += 2) {             // even-odd spans, exact horizontal coverage
      const xa = clamp((xs[q] - x0) / px, 0, w), xb = clamp((xs[q + 1] - x0) / px, 0, w);
      if (xb <= xa) continue;
      const ia = Math.floor(xa), ib = Math.floor(xb), row = j * w;
      if (ia === ib) { a[row + ia] += (xb - xa) / SUB; continue; }
      a[row + ia] += (ia + 1 - xa) / SUB;
      for (let i = ia + 1; i < ib; i++) a[row + i] += 1 / SUB;
      if (ib < w) a[row + ib] += (xb - ib) / SUB;
    }
  }
  for (let i = 0; i < a.length; i++) a[i] = Math.min(1, a[i]);
  return a;
}

// RMIN keeps the R/4 gap circles between two big neighbours empty (a field of crumbs reads as noise, not as quilling)
const RMIN = 0.026, RMAX = 0.074, MARGIN = TH * 0.5 + 0.0035, GAP = 0.0028;

/**
 * Circles inside one glyph (contours in world em). Largest first: candidates are every raster cell deep enough, sorted by
 * depth (−distance) with a seeded jitter, so ridge cells along a stroke are visited in random order; each takes the
 * largest radius that clears the outline strip and the circles already placed (and a random 90–100 % of it).
 */
export function packMotifs(contours, seed) {
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (const P of contours) for (let i = 0; i < P.length; i += 2) { x0 = Math.min(x0, P[i]); x1 = Math.max(x1, P[i]); z0 = Math.min(z0, P[i + 1]); z1 = Math.max(z1, P[i + 1]); }
  const px = 1 / 420, pad = 0.02;
  x0 -= pad; z0 -= pad;
  const w = Math.ceil((x1 - x0 + pad) / px), h = Math.ceil((z1 - z0 + pad) / px);
  const sd = signedDistance(rasterEvenOdd(contours, x0, z0, px, w, h), w, h);
  const depthAt = (x, z) => {                                  // bilinear inside depth (em), > 0 inside
    const fx = clamp((x - x0) / px - 0.5, 0, w - 1.001), fz = clamp((z - z0) / px - 0.5, 0, h - 1.001);
    const i = Math.floor(fx), j = Math.floor(fz), a = fx - i, b = fz - j, o = j * w + i;
    return -((sd[o] * (1 - a) + sd[o + 1] * a) * (1 - b) + (sd[o + w] * (1 - a) + sd[o + w + 1] * a) * b) * px;
  };
  const rng = rand(seed);
  const cand = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const d = -sd[j * w + i] * px;
    if (d >= RMIN + MARGIN) cand.push([x0 + (i + 0.5) * px, z0 + (j + 0.5) * px, d + rng() * 0.006]);
  }
  cand.sort((p, q) => q[2] - p[2]);
  const placed = [], CELL = 2 * RMAX + GAP, grid = new Map();
  const key = (i, j) => i * 73856093 ^ j * 19349663;
  for (const [x, z] of cand) {
    let r = Math.min(depthAt(x, z) - MARGIN, RMAX);
    if (r < RMIN) continue;
    const gi = Math.floor(x / CELL), gj = Math.floor(z / CELL);
    for (let di = -1; di <= 1 && r >= RMIN; di++) for (let dj = -1; dj <= 1; dj++) {
      const list = grid.get(key(gi + di, gj + dj));
      if (list) for (const c of list) r = Math.min(r, Math.hypot(x - c.x, z - c.z) - c.r - GAP);
    }
    if (r < RMIN) continue;
    r = Math.max(RMIN, r * (0.9 + 0.1 * rng()));
    const c = { x, z, r };
    placed.push(c);
    const k = key(gi, gj);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(c);
  }
  // the stroke direction at each circle: the direction in which the ink stays deepest
  for (const c of placed) {
    let bestA = 0, bestD = -Infinity;
    for (let q = 0; q < 16; q++) {
      const a = (q / 16) * Math.PI;
      const d = Math.min(depthAt(c.x + Math.cos(a) * c.r * 1.6, c.z + Math.sin(a) * c.r * 1.6), depthAt(c.x - Math.cos(a) * c.r * 1.6, c.z - Math.sin(a) * c.r * 1.6));
      if (d > bestD) { bestD = d; bestA = a; }
    }
    c.ux = Math.cos(bestA); c.uz = Math.sin(bestA);
  }
  return placed;
}

/* ------------------------------------------------------------------ motif centre lines (local, around 0) */
// adaptive sweep: about one sample per 4.5 thousandths of an em of arc, never fewer than ~14 per turn
function sweep(phiMax, radiusAt, pointAt) {
  const pts = [];
  let phi = 0;
  while (phi < phiMax) { pts.push(pointAt(phi)); phi += clamp(0.0045 / Math.max(radiusAt(phi), 0.004), 0.05, 0.45); }
  pts.push(pointAt(phiMax));
  return pts;
}
// teardrop / marquise: the convex hull of a circle (radius a) and tip point(s) at distance l, as a radius per direction;
// |ψ| softened by ε so the pinch is a tight bend rather than a crease
function hullRadius(a, l, psi, twoTips) {
  const beta = Math.acos(clamp(a / l, -1, 1));
  let p = Math.abs(wrapA(psi));
  if (twoTips) p = Math.min(p, Math.PI - p);
  const ps = Math.sqrt(p * p + 0.0036);
  return a / Math.cos(Math.max(beta - ps, 0));
}

/** centre line of motif m = { type, r, ux, uz, hand, rot } in local coordinates (before rotation by the motif angle) */
export function motifCurve(m, rng) {
  const rho = m.r - TH * 0.5;
  const ang0 = rng() * Math.PI * 2;
  const uA = Math.atan2(m.uz, m.ux);
  if (m.type === 'tight') {
    const p = PITCH_COIL, phiMax = (2 * Math.PI * (rho - R_IN)) / p;
    return sweep(phiMax, (f) => R_IN + (p * f) / (2 * Math.PI), (f) => {
      const r = R_IN + (p * f) / (2 * Math.PI);
      return [r * Math.cos(f + ang0) * m.hand, r * Math.sin(f + ang0)];
    });
  }
  if (m.type === 'loose' || m.type === 'tear' || m.type === 'eye') {
    // ring count from the absolute size, so neighbouring rings never come closer than ~2 paper thicknesses
    const turns = m.type === 'loose' ? clamp(rho / 0.0115, 2.2, 5.2) + 0.4 * rng()
      : clamp((m.type === 'tear' ? 0.6 : 0.5) * rho / 0.0085, 1.8, 4.6) + 0.3 * rng();
    const Phi = turns * Math.PI * 2;
    const off = m.type === 'eye' ? 0 : 0.3 * rho;
    const offA = m.type === 'tear' ? uA + Math.PI : rng() * Math.PI * 2;   // a teardrop's eye sits in its round end
    const a = m.type === 'tear' ? 0.6 * rho : 0.5 * rho, l = m.type === 'tear' ? 1.35 * rho : rho;
    const shift = m.type === 'tear' ? -(l - a) / 2 : 0;
    const sOf = (f) => Math.max(R_IN / rho, Math.pow(f / Phi, 0.86));
    return sweep(Phi, (f) => rho * sOf(f), (f) => {
      const s = sOf(f), th = f * m.hand + ang0;
      let r;
      if (m.type === 'loose') r = rho * s;
      else {
        const shape = hullRadius(a, l, th - uA, m.type === 'eye');
        r = s * (a + (shape - a) * Math.pow(s, 1.3));
      }
      const o = off * (1 - s), sh = shift * s;
      return [Math.cos(th) * r + Math.cos(offA) * o + m.ux * sh, Math.sin(th) * r + Math.sin(offA) * o + m.uz * sh];
    });
  }
  // scrolls: two open spirals joined by a Hermite bridge, laid along the stroke (e1 = u, e2 = u⊥·hand)
  const Rs = 0.42 * rho, d = rho - Rs, p = 0.0085, Om = Math.max(1.2, (Rs - 0.004) / p) * Math.PI * 2;
  const e1 = [m.ux, m.uz], e2 = [-m.uz * m.hand, m.ux * m.hand];
  const toW = (a, b) => [e1[0] * a + e2[0] * b, e1[1] * a + e2[1] * b];
  const S = m.type === 'sscroll';
  const cy = S ? 0 : -0.16 * rho, lift = S ? 0 : 0.55;
  const pts = [];
  // spiral 1: from its centre outward, clockwise, ending at angle π/2 + lift heading right
  const th1 = Math.PI / 2 + lift;
  for (const q of sweep(Om, (w) => 0.004 + ((Rs - 0.004) * w) / Om, (w) => {
    const r = 0.004 + ((Rs - 0.004) * w) / Om, th = th1 + Om - w;
    return [-d + r * Math.cos(th), cy + r * Math.sin(th)];
  })) pts.push(q);
  // spiral 2 entry: S → bottom (−π/2) turning counter-clockwise inward; C → π/2 − lift turning clockwise inward
  const th2 = S ? -Math.PI / 2 : Math.PI / 2 - lift, dir2 = S ? 1 : -1;
  const P1 = pts[pts.length - 1], T1 = [Math.sin(th1), -Math.cos(th1)];
  const P2 = [d + Rs * Math.cos(th2), cy + Rs * Math.sin(th2)], T2 = S ? [-Math.sin(th2), Math.cos(th2)] : [Math.sin(th2), -Math.cos(th2)];
  const len = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]), nb = Math.max(4, Math.ceil(len / 0.0045));
  for (let i = 1; i < nb; i++) {
    const t = i / nb, t2 = t * t, t3 = t2 * t;
    const h0 = 2 * t3 - 3 * t2 + 1, h1 = t3 - 2 * t2 + t, h2 = -2 * t3 + 3 * t2, h3 = t3 - t2;
    pts.push([h0 * P1[0] + h1 * T1[0] * len + h2 * P2[0] + h3 * T2[0] * len, h0 * P1[1] + h1 * T1[1] * len + h2 * P2[1] + h3 * T2[1] * len]);
  }
  for (const q of sweep(Om, (w) => Rs - ((Rs - 0.004) * w) / Om, (w) => {
    const r = Rs - ((Rs - 0.004) * w) / Om, th = th2 + dir2 * w;
    return [d + r * Math.cos(th), cy + r * Math.sin(th)];
  })) pts.push(q);
  return pts.map(([a, b]) => toW(a, b));
}

/** how enclosed each wall of a centre line is (0 open … 1 a paper wall within a hair's breadth), per sample and side */
function enclosure(pts) {
  const n = pts.length, out = new Float32Array(n * 2), arc = new Float64Array(n);
  for (let i = 1; i < n; i++) arc[i] = arc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], tz = b[1] - a[1]; const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
    for (let sIdx = 0; sIdx < 2; sIdx++) {
      const side = sIdx ? 1 : -1, qx = pts[i][0] - tz * side * TH, qz = pts[i][1] + tx * side * TH;
      let dmin = 1;
      for (let j = 0; j < n; j++) {
        if (Math.abs(arc[j] - arc[i]) < 0.02) continue;
        const dx = pts[j][0] - qx, dz = pts[j][1] - qz;
        if (dx * (-tz * side) + dz * (tx * side) <= 0) continue;   // only walls on this side
        dmin = Math.min(dmin, Math.hypot(dx, dz));
      }
      out[2 * i + sIdx] = clamp((0.022 - dmin) / 0.016);
    }
  }
  return out;
}

/**
 * One merged mesh for all fill motifs. Each vertex knows its motif centre, pop-in time and base rotation (aMotif),
 * its local centre-line point and tangent (aLocal), its corner (aCorner), colour (aCol) and wall enclosure (aEncl).
 */
export function motifGeometry(list) {
  let nv = 0;
  for (const m of list) nv += m.pts.length * 6 + 8;
  const position = new Float32Array(nv * 3), local = new Float32Array(nv * 4), motif = new Float32Array(nv * 4);
  const corner = new Float32Array(nv * 3), col = new Float32Array(nv * 3), encl = new Float32Array(nv);
  const idx = [];
  let v = 0;
  for (const m of list) {
    const P = m.pts, n = P.length, E = enclosure(P), base = v;
    const tanAt = (i) => {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
      const tx = b[0] - a[0], tz = b[1] - a[1], l = Math.hypot(tx, tz) || 1;
      return [tx / l, tz / l];
    };
    const put = (i, c, e) => {
      const [tx, tz] = tanAt(i);
      position.set([m.x + P[i][0], c[1] * H_FILL, m.z + P[i][1]], 3 * v);
      local.set([P[i][0], P[i][1], tx, tz], 4 * v);
      motif.set([m.x, m.z, m.pop, m.rot], 4 * v);
      corner.set(c, 3 * v);
      col.set(m.col, 3 * v);
      encl[v] = e;
      v++;
    };
    for (let i = 0; i < n; i++) for (const c of CORNERS) put(i, c, c[2] === 1 ? 0 : E[2 * i + (c[0] > 0 ? 1 : 0)]);
    const c0 = v; for (const c of CAP0) put(0, c, 0);
    const c1 = v; for (const c of CAP1) put(n - 1, c, 0);
    ribbonIndices(idx, base, n);
    idx.push(c0, c0 + 1, c0 + 2, c0, c0 + 2, c0 + 3, c1, c1 + 1, c1 + 2, c1, c1 + 2, c1 + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(position, 3));
  g.setAttribute('aLocal', new THREE.BufferAttribute(local, 4));
  g.setAttribute('aMotif', new THREE.BufferAttribute(motif, 4));
  g.setAttribute('aCorner', new THREE.BufferAttribute(corner, 3));
  g.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aEncl', new THREE.BufferAttribute(encl, 1));
  g.setIndex(nv > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1));
  return g;
}

/* ------------------------------------------------------------------ paper */
/**
 * Tileable cotton paper, size² pixels: R = fibres + grain (used as a height for raking-light bump), G = cloudy formation.
 * Fibres are short bent strokes drawn 9× with wrap-around offsets so the tile has no seams.
 */
export function paperCanvas(size, seed) {
  const rng = rand(seed);
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = size; return c; };
  const fib = mk(), fctx = fib.getContext('2d');
  fctx.fillStyle = '#808080'; fctx.fillRect(0, 0, size, size);
  fctx.lineCap = 'round';
  const wrapDraw = (ctx, x, y, r, fn) => {
    for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
      const X = x + ox * size, Y = y + oy * size;
      if (X + r < 0 || Y + r < 0 || X - r > size || Y - r > size) continue;
      fn(X, Y);
    }
  };
  const NF = Math.round(size * size / 380);
  for (let i = 0; i < NF; i++) {
    const x = rng() * size, y = rng() * size, len = (6 + 34 * rng() * rng()) * size / 2048, a = rng() * Math.PI * 2, bend = (rng() - 0.5) * 0.9;
    const light = rng() < 0.55, al = 0.05 + 0.13 * rng();
    fctx.strokeStyle = light ? `rgba(255,255,255,${al})` : `rgba(0,0,0,${al * 0.8})`;
    fctx.lineWidth = (0.5 + 1.2 * rng()) * size / 2048;
    const dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2, cx = -Math.sin(a) * len * bend * 0.5, cy = Math.cos(a) * len * bend * 0.5;
    wrapDraw(fctx, x, y, len, (X, Y) => { fctx.beginPath(); fctx.moveTo(X - dx, Y - dy); fctx.quadraticCurveTo(X + cx, Y + cy, X + dx, Y + dy); fctx.stroke(); });
  }
  const form = mk(), gctx = form.getContext('2d');
  gctx.fillStyle = '#808080'; gctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 260; i++) {
    const x = rng() * size, y = rng() * size, r = (40 + 220 * rng()) * size / 2048, light = rng() < 0.5, al = 0.03 + 0.06 * rng();
    wrapDraw(gctx, x, y, r, (X, Y) => {
      const g = gctx.createRadialGradient(X, Y, 0, X, Y, r);
      g.addColorStop(0, light ? `rgba(255,255,255,${al})` : `rgba(0,0,0,${al})`);
      g.addColorStop(1, 'rgba(128,128,128,0)');
      gctx.fillStyle = g; gctx.fillRect(X - r, Y - r, 2 * r, 2 * r);
    });
  }
  const a = fctx.getImageData(0, 0, size, size).data, b = gctx.getImageData(0, 0, size, size).data;
  const out = mk(), octx = out.getContext('2d'), img = octx.createImageData(size, size), o = img.data;
  for (let i = 0, p = 0; i < size * size; i++, p += 4) {
    const grain = (rng() - 0.5) * 13;
    o[p] = clamp(a[p] + grain, 0, 255); o[p + 1] = b[p]; o[p + 2] = 128; o[p + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  return out;
}
