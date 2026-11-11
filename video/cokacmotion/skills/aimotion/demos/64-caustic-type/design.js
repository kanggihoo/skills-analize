/*
 * design.js — inverse caustic design ("magic window", after Matt Ferraro's write-up). Pure JS, no DOM, no randomness:
 * the same target always gives the same lens, so it runs in setup() and is unit-tested in node.
 *
 * Convention (Ferraro's): the TARGET plane carries a regular grid of NX × NY unit cells; the LENS carries a mesh of the
 * same topology whose vertices start on that grid and move. Sunlight falls evenly on the lens, so lens cell (i, j)
 * collects light ∝ its area and the lens sends it to target cell (i, j): the picture is right when
 *   area(lens cell i,j) = I(i,j)        (I = wanted brightness, normalised to mean 1).
 * The lens vertices are p = q + ∇v (q = the regular grid, v a cell-centred potential): a gradient map, so the lens is
 * a real refracting surface (its height ∝ the potential) and, when v is convex enough, it never folds.
 *
 * Iteration (Ferraro's loop, with the loss in its exact Monge–Ampère form):
 *   1. every lens cell's current area: for a quad it is exactly det(J), J = I + H the cell's mean Jacobian, where H is
 *      the 3×3-stencil Hessian of v that the vertex gradient implies (hessian() below);
 *   2. loss = √((tr J)² − 4·det J + 4·I) − tr J  ≈  −2·(area − I) / tr J — Ferraro's (area − target), scaled by the
 *      cell's own stretch, so a cell already squeezed thin across a bright stroke is not pushed through itself
 *      (the plain loss stalls on high-contrast type: one near-fold throttles the global step to nothing);
 *   3. solve ∇²δ = loss (DCT + tridiagonal, Neumann: border vertices slide along the border);
 *   4. v += δ, i.e. every vertex moves by ∇δ. The fixed point is exactly det J = I in every cell
 *      (Benamou–Froese–Oberman's fixed point for det D²u = f, on the mesh's own discrete Hessian).
 * Measured (node, 256 × 384): Hangul glyph targets with 0.15…8× contrast reach 0.2 % rms / 5–7 % worst-cell area error
 * in 160 iterations (≈ 0.55 s; one Poisson solve ≈ 3.5 ms); the plain (area − I) loss stalled at ~30 % rms.
 */

// ---------------------------------------------------------------- radix-2 complex FFT (in place)
function makeFFT(N) {
  const bits = Math.round(Math.log2(N));
  if (1 << bits !== N) throw new Error('FFT size must be a power of two');
  const rev = new Uint32Array(N);
  for (let i = 0; i < N; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
  const c = new Float64Array(N / 2), s = new Float64Array(N / 2);
  for (let i = 0; i < N / 2; i++) { c[i] = Math.cos(2 * Math.PI * i / N); s[i] = Math.sin(2 * Math.PI * i / N); }
  return (re, im, inverse) => {
    for (let i = 0; i < N; i++) {
      const j = rev[i];
      if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    const sg = inverse ? 1 : -1;
    for (let size = 2; size <= N; size <<= 1) {
      const half = size >> 1, step = N / size;
      for (let i = 0; i < N; i += size) {
        for (let j = i, k = 0; j < i + half; j++, k += step) {
          const wr = c[k], wi = sg * s[k], l = j + half;
          const tr = re[l] * wr - im[l] * wi, ti = re[l] * wi + im[l] * wr;
          re[l] = re[j] - tr; im[l] = im[j] - ti;
          re[j] += tr; im[j] += ti;
        }
      }
    }
  };
}

/**
 * Unnormalised DCT-II, X[k] = Σ x[n]·cos(πk(2n+1)/2N), and its exact inverse, via one length-N FFT (Makhoul 1980).
 * The cosines cos(πk(n+½)/N) are the eigenvectors of the 1-D cell-centred Neumann second difference (eigenvalue 2cos(πk/N) − 2).
 */
export function makeDCT(N) {
  const fft = makeFFT(N);
  const re = new Float64Array(N), im = new Float64Array(N);
  const cw = new Float64Array(N), sw = new Float64Array(N);
  for (let k = 0; k < N; k++) { cw[k] = Math.cos(Math.PI * k / (2 * N)); sw[k] = Math.sin(Math.PI * k / (2 * N)); }
  const H = N >> 1;
  return {
    forward(x, xo, xs, X, Xo, Xs) {           // strided in/out: x[xo + n·xs] → X[Xo + k·Xs]
      for (let n = 0; n < H; n++) { re[n] = x[xo + 2 * n * xs]; re[N - 1 - n] = x[xo + (2 * n + 1) * xs]; }
      im.fill(0);
      fft(re, im, false);
      for (let k = 0; k < N; k++) X[Xo + k * Xs] = re[k] * cw[k] + im[k] * sw[k];
    },
    inverse(X, Xo, Xs, x, xo, xs) {
      for (let k = 0; k < N; k++) {
        const a = X[Xo + k * Xs], b = k ? X[Xo + (N - k) * Xs] : 0;
        re[k] = a * cw[k] + b * sw[k]; im[k] = a * sw[k] - b * cw[k];
      }
      fft(re, im, true);
      for (let n = 0; n < H; n++) { x[xo + 2 * n * xs] = re[n] / N; x[xo + (2 * n + 1) * xs] = re[N - 1 - n] / N; }
    },
  };
}

/**
 * Fast Poisson solver on an NX × NY cell-centred grid with Neumann (mirror) boundaries:
 *   φ(i+1,j) + φ(i−1,j) + φ(i,j+1) + φ(i,j−1) − 4φ(i,j) = rhs(i,j),   rhs must sum to 0 (it is re-centred here).
 * DCT along x (NX a power of two) diagonalises the x part; each x-mode is then a tridiagonal system along y (any NY),
 * solved exactly by the Thomas algorithm (mode 0 is the singular pure-Neumann one: integrated directly as a flux).
 * Row-major arrays, index j·NX + i. Returns φ with an arbitrary constant offset.
 */
export function makePoisson(NX, NY) {
  const dct = makeDCT(NX);
  const hat = new Float64Array(NX * NY), cp = new Float64Array(NY), dp = new Float64Array(NY);
  const lam = new Float64Array(NX);
  for (let k = 0; k < NX; k++) lam[k] = 2 * Math.cos(Math.PI * k / NX) - 2;
  return (rhs, phi) => {
    let mean = 0;
    for (let i = 0; i < NX * NY; i++) mean += rhs[i];
    mean /= NX * NY;
    for (let j = 0; j < NY; j++) {
      const o = j * NX;
      for (let i = 0; i < NX; i++) phi[o + i] = rhs[o + i] - mean;   // phi doubles as scratch for the centred rhs
      dct.forward(phi, o, 1, hat, o, 1);
    }
    // mode 0: f(j+½) = Σ_{m≤j} r(m), φ(j+1) = φ(j) + f
    {
      let f = 0, p = 0;
      const r0 = hat[0];
      hat[0] = 0;
      let prev = r0;
      for (let j = 0; j < NY - 1; j++) {
        f += prev;
        prev = hat[(j + 1) * NX];
        p += f;
        hat[(j + 1) * NX] = p;
      }
    }
    // modes k ≥ 1: a(j)φ(j−1) + b(j)φ(j) + c(j)φ(j+1) = r(j), a = c = 1, b = λ−2 (λ−1 at both ends)
    for (let k = 1; k < NX; k++) {
      const L = lam[k];
      if (NY === 1) { hat[k] = hat[k] / L; continue; }
      let b = L - 1;
      cp[0] = 1 / b; dp[0] = hat[k] / b;
      for (let j = 1; j < NY; j++) {
        b = (j === NY - 1 ? L - 1 : L - 2) - cp[j - 1];
        cp[j] = 1 / b;
        dp[j] = (hat[j * NX + k] - dp[j - 1]) / b;
      }
      let x = dp[NY - 1];
      hat[(NY - 1) * NX + k] = x;
      for (let j = NY - 2; j >= 0; j--) { x = dp[j] - cp[j] * x; hat[j * NX + k] = x; }
    }
    for (let j = 0; j < NY; j++) dct.inverse(hat, j * NX, 1, phi, j * NX, 1);
    return phi;
  };
}

/** apply the same 5-point Neumann Laplacian (for tests) */
export function laplacian(phi, NX, NY, out) {
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const c = phi[j * NX + i];
    const l = phi[j * NX + Math.max(i - 1, 0)], r = phi[j * NX + Math.min(i + 1, NX - 1)];
    const d = phi[Math.max(j - 1, 0) * NX + i], u = phi[Math.min(j + 1, NY - 1) * NX + i];
    out[j * NX + i] = l + r + d + u - 4 * c;
  }
  return out;
}

// the 3×3-stencil Hessian of v at every cell (mirror borders): exactly what the quads of p = q + Gv see
// (G = cell → vertex gradient, averaged over the four cells around a vertex; a quad's area is det of its mean Jacobian)
function hessian(v, NX, NY, ext, out) {
  const W2 = NX + 2;
  for (let j = -1; j <= NY; j++) {
    const sj = j < 0 ? 0 : j >= NY ? NY - 1 : j;
    for (let i = -1; i <= NX; i++) ext[(j + 1) * W2 + i + 1] = v[sj * NX + (i < 0 ? 0 : i >= NX ? NX - 1 : i)];
  }
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const o = (j + 1) * W2 + i + 1, k = 3 * (j * NX + i);
    const a = ext[o - W2 - 1], b = ext[o - W2], c = ext[o - W2 + 1], d = ext[o - 1], e = ext[o], f = ext[o + 1];
    const g = ext[o + W2 - 1], h = ext[o + W2], m = ext[o + W2 + 1];
    out[k] = ((a - 2 * b + c) + 2 * (d - 2 * e + f) + (g - 2 * h + m)) / 4;      // ∂²/∂x², smoothed [1 2 1] in y
    out[k + 1] = ((a - 2 * d + g) + 2 * (b - 2 * e + h) + (c - 2 * f + m)) / 4;  // ∂²/∂y², smoothed in x
    out[k + 2] = (m - c - g + a) / 4;                                            // ∂²/∂x∂y
  }
}

/** lens vertex positions p = q + G v ((NX+1)·(NY+1), index j·(NX+1) + i, cell units) */
export function lensVertices(v, NX, NY) {
  const VX = NX + 1, px = new Float64Array(VX * (NY + 1)), py = new Float64Array(VX * (NY + 1));
  for (let j = 0; j <= NY; j++) {
    const j0 = Math.max(j - 1, 0) * NX, j1 = Math.min(j, NY - 1) * NX;
    for (let i = 0; i <= NX; i++) {
      const i0 = Math.max(i - 1, 0), i1 = Math.min(i, NX - 1);
      const p00 = v[j0 + i0], p10 = v[j0 + i1], p01 = v[j1 + i0], p11 = v[j1 + i1];
      px[j * VX + i] = i + 0.5 * ((p10 - p00) + (p11 - p01));
      py[j * VX + i] = j + 0.5 * ((p01 - p00) + (p11 - p10));
    }
  }
  return { px, py };
}

/** per-cell quad areas of a lens mesh → { rms, max } of (area − I)/I */
export function areaError(px, py, I, NX, NY) {
  const VX = NX + 1;
  let rms = 0, mx = 0;
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const a = j * VX + i, b = a + 1, c = a + VX + 1, d = a + VX;
    const A = 0.5 * ((px[c] - px[a]) * (py[d] - py[b]) - (py[c] - py[a]) * (px[d] - px[b]));
    const rel = (A - I[j * NX + i]) / I[j * NX + i];
    rms += rel * rel; if (Math.abs(rel) > mx) mx = Math.abs(rel);
  }
  return { rms: Math.sqrt(rms / (NX * NY)), max: mx };
}

/** normalise a positive brightness field to mean 1 (Float64Array copy) */
export function normalise(Iraw) {
  const I = new Float64Array(Iraw.length);
  let s = 0;
  for (let i = 0; i < Iraw.length; i++) s += Iraw[i];
  for (let i = 0; i < Iraw.length; i++) I[i] = Iraw[i] * Iraw.length / s;
  return I;
}

/**
 * Design the lens for target brightness Iraw (NX·NY, > 0, any scale; row-major j·NX + i, j = target y).
 * Returns { px, py } lens vertex positions, the potential v, and the per-iteration rms relative area error.
 */
export function designLens(Iraw, NX, NY, { iters = 160, tol = 0.0015, onIter } = {}) {
  const N = NX * NY, I = normalise(Iraw);
  const v = new Float64Array(N), loss = new Float64Array(N), dv = new Float64Array(N), H = new Float64Array(3 * N);
  const ext = new Float64Array((NX + 2) * (NY + 2)), solve = makePoisson(NX, NY);
  const history = [];
  for (let it = 0; it < iters; it++) {
    hessian(v, NX, NY, ext, H);
    let rms = 0;
    for (let k = 0; k < N; k++) {
      const xx = H[3 * k], yy = H[3 * k + 1], xy = H[3 * k + 2], f = I[k];
      const tr = 2 + xx + yy, det = (1 + xx) * (1 + yy) - xy * xy;     // the cell's mean Jacobian J = I + H; det = its area
      const rel = (det - f) / f;
      rms += rel * rel;
      loss[k] = Math.sqrt(Math.max(tr * tr - 4 * det + 4 * f, 0)) - tr;
    }
    rms = Math.sqrt(rms / N);
    history.push(rms);
    if (onIter) onIter(it, rms);
    if (rms < tol) break;
    solve(loss, dv);
    for (let k = 0; k < N; k++) v[k] += dv[k];
  }
  const { px, py } = lensVertices(v, NX, NY);
  return { px, py, v, I, history };
}

/**
 * Invert the design for rendering: a regular RX × RY grid over the lens → where each grid point's light lands
 * (target position, in cell units). Each deformed lens quad is split along the diagonal that keeps both triangles
 * positive (a strongly squeezed quad can go non-convex while its area is right), each triangle is rasterised once over
 * the grid points it covers, and its regular target triangle is interpolated barycentrically — exact for the
 * piecewise-affine map. Returns { tgt: Float32Array(RX·RY·2), missed, bowties } (both expected 0; a missed point
 * copies its left/lower neighbour).
 */
export function invertMesh(px, py, NX, NY, RX, RY) {
  const VX = NX + 1;
  const tgt = new Float32Array(RX * RY * 2);
  const done = new Uint8Array(RX * RY);
  const sx = (RX - 1) / NX, sy = (RY - 1) / NY;
  const EPS = 1e-9;
  const cross = (a, b, c) => (px[b] - px[a]) * (py[c] - py[a]) - (py[b] - py[a]) * (px[c] - px[a]);
  const tri = (a, b, c, qax, qay, qbx, qby, qcx, qcy) => {
    const ax = px[a], ay = py[a], bx = px[b], by = py[b], cx = px[c], cy = py[c];
    const den = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (!(den > 0)) return;
    const k0 = Math.max(0, Math.ceil(Math.min(ax, bx, cx) * sx - 1e-7)), k1 = Math.min(RX - 1, Math.floor(Math.max(ax, bx, cx) * sx + 1e-7));
    const l0 = Math.max(0, Math.ceil(Math.min(ay, by, cy) * sy - 1e-7)), l1 = Math.min(RY - 1, Math.floor(Math.max(ay, by, cy) * sy + 1e-7));
    for (let l = l0; l <= l1; l++) {
      const y = l / sy;
      for (let k = k0; k <= k1; k++) {
        const x = k / sx;
        const wb = ((x - ax) * (cy - ay) - (y - ay) * (cx - ax)) / den;
        const wc = ((bx - ax) * (y - ay) - (by - ay) * (x - ax)) / den;
        const wa = 1 - wb - wc;
        if (wa < -EPS || wb < -EPS || wc < -EPS) continue;
        const g = l * RX + k;
        tgt[2 * g] = wa * qax + wb * qbx + wc * qcx;
        tgt[2 * g + 1] = wa * qay + wb * qby + wc * qcy;
        done[g] = 1;
      }
    }
  };
  let bowties = 0;
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const a = j * VX + i, b = a + 1, c = a + VX + 1, d = a + VX;
    if (Math.min(cross(a, b, c), cross(a, c, d)) > 0 || Math.min(cross(a, b, d), cross(b, c, d)) <= 0) {
      if (Math.min(cross(a, b, d), cross(b, c, d)) <= 0 && Math.min(cross(a, b, c), cross(a, c, d)) <= 0) bowties++;
      tri(a, b, c, i, j, i + 1, j, i + 1, j + 1);
      tri(a, c, d, i, j, i + 1, j + 1, i, j + 1);
    } else {
      tri(a, b, d, i, j, i + 1, j, i, j + 1);
      tri(b, c, d, i + 1, j, i + 1, j + 1, i, j + 1);
    }
  }
  let missed = 0;
  for (let g = 0; g < RX * RY; g++) if (!done[g]) {
    missed++;
    const n = g % RX > 0 ? g - 1 : g >= RX ? g - RX : -1;
    if (n >= 0) { tgt[2 * g] = tgt[2 * n]; tgt[2 * g + 1] = tgt[2 * n + 1]; }
    else { tgt[2 * g] = (g % RX) / sx; tgt[2 * g + 1] = Math.floor(g / RX) / sy; }
  }
  return { tgt, missed, bowties };
}
