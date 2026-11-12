/*
 * 36 · sim.js — the silk, baked: XPBD cloth (Macklin, Müller & Chentanez 2016) in the "small steps" form
 * (Macklin et al. 2019: many substeps, one constraint iteration each). Pure JS + typed arrays, no DOM (runs in node).
 *
 *   80 × 120 particles, 1.0 × 1.5 m, light silk ≈ 45 g/m²; 10 substeps per video frame (h = 1/300 s).
 *   constraints: stretch (grid edges), shear (both diagonals), bending (distance to the particle two away) — each
 *   with its own compliance α; per substep Δλ = (−C − α̃λ) / (w₁ + w₂ + α̃), α̃ = α / h², λ reset every substep.
 *   long-range attachments (Kim, Tang & Müller 2012) while a pin holds: nothing hangs farther from a pin than in
 *   the flat cloth, so wind load cannot stretch the silk.
 *   forces: gravity + aerodynamic drag per triangle, F = ½ρ·Cd·A·(v_rel·n)|v_rel·n| n (+ small skin friction),
 *   v_rel = wind − cloth velocity; the wind is a mean flow with scripted gusts plus seeded divergence-free
 *   Fourier modes (turbulence) carried along with the mean flow, calmer near the floor.
 *   collisions: sphere, the column under it and the floor, with Coulomb friction applied to the substep
 *   displacement (static / kinetic); self-collision after the release (spatial hash → candidate pairs once per
 *   frame, minimum distance + inter-layer friction every substep).
 *   the two top corners are pinned (drawn slightly together so the top edge hangs in a swag), then released.
 * Output: positions per video frame (Float32Array, frames × particles × 3).
 * The drape is checked numerically in node (same code): with these settings the silk lands on the sphere for
 * seeds 36–39 (the film uses 36).
 */

export const NX = 80, NY = 120;
export const CW = 1.0, CL = 1.5;
export const SPHERE = { x: 0.0, y: 1.0, z: 0.65, r: 0.34 };
export const BLOCK = null;      // optional rounded-box collider { x, y, z, hx, hy, hz, r } (unused in the film)
export const PIN_Y = 2.5, PIN_X = 0.45, PIN_Z = 0.18;
export const COLUMN = { r: 0.15 };     // the column the sphere sits on (floor → sphere centre)
export const RELEASE = [4.6, 4.7];           // left pin, right pin (s)
export const WIND_DROP = [3.2, 3.8];        // the gusts die away here, so the silk swings back over the sphere

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// mean wind speed (m/s) over the story; t < 0 is the settling pre-roll
export function windSpeed(t) {
  const gust = (c, w, a) => a * Math.exp(-((t - c) / w) * ((t - c) / w));
  // a breeze that freshens into gusts, dies away just before the pins let go, and returns as a whisper
  const u = (0.4 + 0.6 * smooth(0.6, 2.2, t) + 0.35 * smooth(2.6, 3.3, t) + gust(1.9, 0.35, 0.45) + gust(2.8, 0.3, 0.5) + gust(3.4, 0.3, 0.4))
    * (1 - 0.92 * smooth(WIND_DROP[0], WIND_DROP[1], t)) + 0.08 * smooth(6.8, 8.5, t);
  return Math.max(u, 0.03);
}
export const WDIR = (() => { const d = [0.12, 0.22, 1.0]; const l = Math.hypot(...d); return d.map((x) => x / l); })();

export function bakeCloth({ fps = 30, duration = 9.5, sub = 10, preroll = 1.2, seed = 36, log = null, sphere = SPHERE, block = BLOCK, release = RELEASE, wind = windSpeed, rhoA = 0.045, pinY = PIN_Y, selfCollide = true, pinX = PIN_X, pinZ = PIN_Z, column = COLUMN, mu = [0.9, 0.75], logEvery = 30 } = {}) {
  const PINX = pinX;
  const SPH = sphere;
  const n = NX * NY;
  const dx = CW / (NX - 1), dy = CL / (NY - 1);
  const mP = rhoA * CW * CL / n;
  const x = new Float64Array(n * 3), p = new Float64Array(n * 3), v = new Float64Array(n * 3);
  const a = new Float64Array(n * 3), wv = new Float64Array(n * 3);
  const w = new Float64Array(n).fill(1);
  const r = mulberry32(seed);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const k = j * NX + i;
    x[k * 3] = -CW / 2 + i * dx;
    x[k * 3 + 1] = pinY - j * dy;
    x[k * 3 + 2] = (r() - 0.5) * 0.002 + 0.02 * Math.sin(i * 0.21 + j * 0.13);
  }
  const PL = 0, PR = NX - 1;
  w[PL] = 0; w[PR] = 0;
  const lraL = new Float64Array(n), lraR = new Float64Array(n);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    lraL[j * NX + i] = Math.hypot(i * dx, j * dy) * 1.01;
    lraR[j * NX + i] = Math.hypot((NX - 1 - i) * dx, j * dy) * 1.01;
  }

  // ---- constraints: [i, j, rest, compliance] in solve order ----
  const ci = [], cj = [], cr = [], ca = [];
  const add = (i1, j1, i2, j2, alpha) => {
    const A = j1 * NX + i1, B = j2 * NX + i2;
    ci.push(A); cj.push(B); ca.push(alpha);
    cr.push(Math.hypot((i2 - i1) * dx, (j2 - j1) * dy));
  };
  const STRETCH = 0, SHEAR = 2e-6, BEND = 6e-5;      // compliance (m/N with unit inverse mass): silk bends easily
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX - 1; i++) add(i, j, i + 1, j, STRETCH);
  for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX; i++) add(i, j, i, j + 1, STRETCH);
  for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) { add(i, j, i + 1, j + 1, SHEAR); add(i + 1, j, i, j + 1, SHEAR); }
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX - 2; i++) add(i, j, i + 2, j, BEND);
  for (let j = 0; j < NY - 2; j++) for (let i = 0; i < NX; i++) add(i, j, i, j + 2, BEND);
  const C_I = Int32Array.from(ci), C_J = Int32Array.from(cj), C_R = Float64Array.from(cr), C_A = Float64Array.from(ca);
  const NC = C_I.length;

  // ---- triangles (for aerodynamic forces) ----
  const tri = [];
  for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) {
    const A = j * NX + i, B = A + 1, C = A + NX, Dd = C + 1;
    tri.push(A, B, C, B, Dd, C);
  }
  const TRI = Int32Array.from(tri), NT = TRI.length / 3;

  // ---- turbulence: divergence-free Fourier modes (k ⊥ amplitude), advected by the mean wind ----
  const modes = [];
  for (let m = 0; m < 7; m++) {
    const kl = 2 * Math.PI / (0.35 + 0.9 * r());                 // wavelengths 0.35–1.25 m
    let k = [r() - 0.5, r() - 0.5, r() - 0.5]; const kn = Math.hypot(...k); k = k.map((c) => c / kn * kl);
    let e = [r() - 0.5, r() - 0.5, r() - 0.5];
    const kk = (e[0] * k[0] + e[1] * k[1] + e[2] * k[2]) / (kl * kl);
    e = [e[0] - kk * k[0], e[1] - kk * k[1], e[2] - kk * k[2]]; const en = Math.hypot(...e); e = e.map((c) => c / en);
    modes.push({ k, e, amp: 0.55 / Math.sqrt(m + 1.5), om: 1.5 + 4 * r(), ph: r() * 6.283 });
  }
  const NM = modes.length, MK = new Float64Array(NM * 3), ME = new Float64Array(NM * 3), MA = new Float64Array(NM), MP = new Float64Array(NM);
  modes.forEach((M, m) => { MK.set(M.k, m * 3); ME.set(M.e, m * 3); MA[m] = M.amp; });
  let travel = 0, lastT = -preroll;                  // the turbulence is carried along by the mean flow
  const windAt = (t) => {
    const U = wind(t);
    travel += U * (t - lastT) * 0.8; lastT = t;
    const sx = WDIR[0] * travel, sy = WDIR[1] * travel, sz = WDIR[2] * travel, gain = 0.35 + U;
    for (let m = 0; m < NM; m++) MP[m] = -modes[m].om * t + modes[m].ph - (MK[m * 3] * sx + MK[m * 3 + 1] * sy + MK[m * 3 + 2] * sz);
    for (let q = 0; q < n; q++) {
      const X = x[q * 3], Y = x[q * 3 + 1], Z = x[q * 3 + 2];
      let wx = WDIR[0] * U, wy = WDIR[1] * U, wz = WDIR[2] * U;
      for (let m = 0; m < NM; m++) {
        const m3 = m * 3;
        const s = Math.sin(MK[m3] * X + MK[m3 + 1] * Y + MK[m3 + 2] * Z + MP[m]) * MA[m] * gain;
        wx += ME[m3] * s; wy += ME[m3 + 1] * s; wz += ME[m3 + 2] * s;
      }
      // calm air near the floor: the fallen silk only breathes
      const calm = 0.15 + 0.85 * smooth(0.05, 0.75, x[q * 3 + 1]);
      wv[q * 3] = wx * calm; wv[q * 3 + 1] = wy * calm; wv[q * 3 + 2] = wz * calm;
    }
  };

  const h = 1 / (fps * sub);
  const G = -9.81, RHO = 1.2, CD = 1.25, CT = 0.03, THICK = 0.006;
  const SR = SPH.r + THICK;
  const MU_S = mu[0], MU_K = mu[1], MU_G = 0.65;
  const kAero = 0.5 * RHO / (3 * mP);                // per-vertex share of a triangle's force → acceleration

  // ---- self-collision (after release) ----
  const SC_D = 0.006, SC_Q = 0.014, SC_REST = 0.03;
  const TAB = 1 << 15;
  const cellStart = new Int32Array(TAB + 1), cellPart = new Int32Array(n), hs = new Int32Array(n);
  const hashOf = (xi, yi, zi) => (Math.imul(xi, 92837111) ^ Math.imul(yi, 689287499) ^ Math.imul(zi, 283923481)) & (TAB - 1);
  let pairI = new Int32Array(1 << 16), pairJ = new Int32Array(1 << 16), npair = 0;
  const gi = (q) => q % NX, gj = (q) => (q / NX) | 0;
  const buildPairs = () => {
    cellStart.fill(0);
    for (let q = 0; q < n; q++) {
      const hh = hashOf(Math.floor(x[q * 3] / SC_Q), Math.floor(x[q * 3 + 1] / SC_Q), Math.floor(x[q * 3 + 2] / SC_Q));
      hs[q] = hh; cellStart[hh]++;
    }
    let s = 0;
    for (let c = 0; c < TAB; c++) { s += cellStart[c]; cellStart[c] = s; }
    cellStart[TAB] = s;
    for (let q = 0; q < n; q++) cellPart[--cellStart[hs[q]]] = q;
    npair = 0;
    const q2 = SC_Q * SC_Q;
    for (let q = 0; q < n; q++) {
      const X = x[q * 3], Y = x[q * 3 + 1], Z = x[q * 3 + 2];
      const xi = Math.floor(X / SC_Q), yi = Math.floor(Y / SC_Q), zi = Math.floor(Z / SC_Q);
      const qi = gi(q), qj = gj(q);
      for (let ax = xi - 1; ax <= xi + 1; ax++) for (let ay = yi - 1; ay <= yi + 1; ay++) for (let az = zi - 1; az <= zi + 1; az++) {
        const hh = hashOf(ax, ay, az);
        for (let e = cellStart[hh]; e < cellStart[hh + 1]; e++) {
          const o = cellPart[e];
          if (o <= q) continue;
          const ddx = x[o * 3] - X, ddy = x[o * 3 + 1] - Y, ddz = x[o * 3 + 2] - Z;
          if (ddx * ddx + ddy * ddy + ddz * ddz > q2) continue;
          const rest = Math.hypot((gi(o) - qi) * dx, (gj(o) - qj) * dy);
          if (rest < SC_REST) continue;                    // neighbours in the weave: the constraints handle them
          if (npair >= pairI.length) { const a2 = new Int32Array(pairI.length * 2), b2 = new Int32Array(pairI.length * 2); a2.set(pairI); b2.set(pairJ); pairI = a2; pairJ = b2; }
          pairI[npair] = q; pairJ[npair] = o; npair++;
        }
      }
    }
  };

  const total = Math.round(duration * fps) + 1;
  const frames = new Float32Array(total * n * 3);
  const steps0 = Math.round(preroll * fps);
  let selfOn = false, stat = { maxStretch: 0, pairs: 0 };

  for (let f = -steps0; f < total; f++) {
    if (f >= 0) {
      const o = f * n * 3;
      for (let q = 0; q < n * 3; q++) frames[o + q] = x[q];
    }
    if (f === total - 1) break;
    for (let s = 0; s < sub; s++) {
      const t = (f + s / sub) / fps;
      // pins: drawn inward during the pre-roll (the swag), then released
      const pinX = PINX + (CW / 2 - PINX) * (1 - smooth(-preroll, -preroll * 0.4, t));
      if (t < release[0]) { x[PL * 3] = -pinX; x[PL * 3 + 1] = pinY; x[PL * 3 + 2] = pinZ; } else w[PL] = 1;
      if (t < release[1]) { x[PR * 3] = pinX; x[PR * 3 + 1] = pinY; x[PR * 3 + 2] = pinZ; } else w[PR] = 1;
      if (!selfOn && selfCollide && t >= release[0]) selfOn = true;
      if (s % 10 === 0) windAt(t);
      // forces → accelerations (aerodynamics refreshed every second substep)
      if (s % 2 === 0) {
      for (let q = 0; q < n; q++) { a[q * 3] = 0; a[q * 3 + 1] = G; a[q * 3 + 2] = 0; }
      for (let tI = 0; tI < NT; tI++) {
        const A = TRI[tI * 3], B = TRI[tI * 3 + 1], C = TRI[tI * 3 + 2];
        const e1x = x[B * 3] - x[A * 3], e1y = x[B * 3 + 1] - x[A * 3 + 1], e1z = x[B * 3 + 2] - x[A * 3 + 2];
        const e2x = x[C * 3] - x[A * 3], e2y = x[C * 3 + 1] - x[A * 3 + 1], e2z = x[C * 3 + 2] - x[A * 3 + 2];
        let nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
        const n2 = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (n2 < 1e-12) continue;
        const area = 0.5 * n2; nx /= n2; ny /= n2; nz /= n2;
        const rx = (wv[A * 3] + wv[B * 3] + wv[C * 3] - v[A * 3] - v[B * 3] - v[C * 3]) / 3;
        const ry = (wv[A * 3 + 1] + wv[B * 3 + 1] + wv[C * 3 + 1] - v[A * 3 + 1] - v[B * 3 + 1] - v[C * 3 + 1]) / 3;
        const rz = (wv[A * 3 + 2] + wv[B * 3 + 2] + wv[C * 3 + 2] - v[A * 3 + 2] - v[B * 3 + 2] - v[C * 3 + 2]) / 3;
        const vn = rx * nx + ry * ny + rz * nz;
        const fn = kAero * CD * area * vn * Math.abs(vn);
        const tx = rx - vn * nx, ty = ry - vn * ny, tz = rz - vn * nz;
        const ft = kAero * CT * area * Math.sqrt(tx * tx + ty * ty + tz * tz);
        const fx = fn * nx + ft * tx, fy = fn * ny + ft * ty, fz = fn * nz + ft * tz;
        a[A * 3] += fx; a[A * 3 + 1] += fy; a[A * 3 + 2] += fz;
        a[B * 3] += fx; a[B * 3 + 1] += fy; a[B * 3 + 2] += fz;
        a[C * 3] += fx; a[C * 3 + 1] += fy; a[C * 3 + 2] += fz;
      }
      }
      // predict
      for (let q = 0; q < n; q++) {
        const q3 = q * 3;
        p[q3] = x[q3]; p[q3 + 1] = x[q3 + 1]; p[q3 + 2] = x[q3 + 2];
        if (w[q] === 0) continue;
        v[q3] += a[q3] * h; v[q3 + 1] += a[q3 + 1] * h; v[q3 + 2] += a[q3 + 2] * h;
        x[q3] += v[q3] * h; x[q3 + 1] += v[q3 + 1] * h; x[q3 + 2] += v[q3 + 2] * h;
      }
      // self-collision: keep non-neighbouring particles at least SC_D apart
      if (selfOn) {
        if (s % 10 === 0) { buildPairs(); stat.pairs = Math.max(stat.pairs, npair); }
        for (let e = 0; e < npair; e++) {
          const A3 = pairI[e] * 3, B3 = pairJ[e] * 3;
          const ex = x[B3] - x[A3], ey = x[B3 + 1] - x[A3 + 1], ez = x[B3 + 2] - x[A3 + 2];
          const d2 = ex * ex + ey * ey + ez * ez;
          if (d2 >= SC_D * SC_D || d2 < 1e-14) continue;
          const d = Math.sqrt(d2), k = 0.5 * (SC_D - d) / d;
          const wa = w[pairI[e]], wb = w[pairJ[e]];
          if (wa + wb === 0) continue;
          x[A3] -= ex * k * wa; x[A3 + 1] -= ey * k * wa; x[A3 + 2] -= ez * k * wa;
          x[B3] += ex * k * wb; x[B3 + 1] += ey * k * wb; x[B3 + 2] += ez * k * wb;
          // friction between the layers: share the relative tangential motion of this substep
          const rvx = (x[B3] - p[B3]) - (x[A3] - p[A3]), rvy = (x[B3 + 1] - p[B3 + 1]) - (x[A3 + 1] - p[A3 + 1]), rvz = (x[B3 + 2] - p[B3 + 2]) - (x[A3 + 2] - p[A3 + 2]);
          const fx = rvx * 0.15, fy = rvy * 0.15, fz = rvz * 0.15;
          x[A3] += fx * wa; x[A3 + 1] += fy * wa; x[A3 + 2] += fz * wa;
          x[B3] -= fx * wb; x[B3 + 1] -= fy * wb; x[B3 + 2] -= fz * wb;
        }
      }
      // XPBD distance constraints (one Gauss–Seidel sweep, λ starts at 0 each substep)
      const ih2 = 1 / (h * h);
      for (let c = 0; c < NC; c++) {
        const A = C_I[c], B = C_J[c];
        const wa = w[A], wb = w[B], ws = wa + wb;
        if (ws === 0) continue;
        const A3 = A * 3, B3 = B * 3;
        const ex = x[B3] - x[A3], ey = x[B3 + 1] - x[A3 + 1], ez = x[B3 + 2] - x[A3 + 2];
        const len = Math.sqrt(ex * ex + ey * ey + ez * ez);
        if (len < 1e-12) continue;
        const Cv = len - C_R[c];
        const dl = -Cv / (ws + C_A[c] * ih2) / len;
        x[A3] -= wa * dl * ex; x[A3 + 1] -= wa * dl * ey; x[A3 + 2] -= wa * dl * ez;
        x[B3] += wb * dl * ex; x[B3 + 1] += wb * dl * ey; x[B3 + 2] += wb * dl * ez;
      }
      // long-range attachments (Kim, Tang & Müller 2012): while a pin holds, no particle may drift farther from it
      // than its distance in the flat cloth — stops the hanging silk from stretching under wind load
      for (let side = 0; side < 2; side++) {
        const P0 = side ? PR : PL;
        if (w[P0] !== 0) continue;
        const px = x[P0 * 3], py = x[P0 * 3 + 1], pz = x[P0 * 3 + 2], L = side ? lraR : lraL;
        for (let q = 0; q < n; q++) {
          if (w[q] === 0) continue;
          const q3 = q * 3;
          const ex = x[q3] - px, ey = x[q3 + 1] - py, ez = x[q3 + 2] - pz;
          const d2 = ex * ex + ey * ey + ez * ez, lim = L[q];
          if (d2 <= lim * lim) continue;
          const k = lim / Math.sqrt(d2);
          x[q3] = px + ex * k; x[q3 + 1] = py + ey * k; x[q3 + 2] = pz + ez * k;
        }
      }
      // sphere, column and floor, with Coulomb friction on this substep's displacement (static below μs·depth)
      for (let q = 0; q < n; q++) {
        if (w[q] === 0) continue;
        const q3 = q * 3;
        let ox = x[q3] - SPH.x, oy = x[q3 + 1] - SPH.y, oz = x[q3 + 2] - SPH.z;
        const dd = Math.sqrt(ox * ox + oy * oy + oz * oz);
        if (dd < SR && dd > 1e-9) {
          const pen = SR - dd; ox /= dd; oy /= dd; oz /= dd;
          x[q3] += ox * pen; x[q3 + 1] += oy * pen; x[q3 + 2] += oz * pen;
          const mx = x[q3] - p[q3], my = x[q3 + 1] - p[q3 + 1], mz = x[q3 + 2] - p[q3 + 2];
          const mn = mx * ox + my * oy + mz * oz;
          const tx = mx - mn * ox, ty = my - mn * oy, tz = mz - mn * oz, tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
          const k = tl < MU_S * pen ? 1 : Math.min(MU_K * pen / Math.max(tl, 1e-12), 1);
          x[q3] -= tx * k; x[q3 + 1] -= ty * k; x[q3 + 2] -= tz * k;
        }
        // the column under the sphere: a vertical cylinder from the floor to the sphere's centre
        if (column && x[q3 + 1] < SPH.y) {
          let cx = x[q3] - SPH.x, cz = x[q3 + 2] - SPH.z;
          const cd = Math.sqrt(cx * cx + cz * cz), CR = column.r + THICK;
          if (cd < CR && cd > 1e-9) {
            const pen = CR - cd; cx /= cd; cz /= cd;
            x[q3] += cx * pen; x[q3 + 2] += cz * pen;
            const uy = x[q3 + 1] - p[q3 + 1], ut = (x[q3] - p[q3]) * -cz + (x[q3 + 2] - p[q3 + 2]) * cx;
            const tl = Math.hypot(uy, ut), k = tl < MU_S * pen ? 1 : Math.min(MU_K * pen / Math.max(tl, 1e-12), 1);
            x[q3 + 1] -= uy * k; x[q3] -= ut * -cz * k; x[q3 + 2] -= ut * cx * k;
          }
        }
        // the block: rounded-box SDF, pushed out along its gradient, same friction model
        if (block) {
          const qx = Math.abs(x[q3] - block.x) - (block.hx - block.r), qy = Math.abs(x[q3 + 1] - block.y) - (block.hy - block.r), qz = Math.abs(x[q3 + 2] - block.z) - (block.hz - block.r);
          const mx = Math.max(qx, 0), my = Math.max(qy, 0), mz = Math.max(qz, 0), ml = Math.sqrt(mx * mx + my * my + mz * mz);
          const sd = ml + Math.min(Math.max(qx, qy, qz), 0) - block.r;
          if (sd < THICK) {
            let gx, gy, gz;
            if (ml > 1e-9) { gx = mx / ml; gy = my / ml; gz = mz / ml; }
            else if (qx >= qy && qx >= qz) { gx = 1; gy = 0; gz = 0; } else if (qy >= qz) { gx = 0; gy = 1; gz = 0; } else { gx = 0; gy = 0; gz = 1; }
            gx *= Math.sign(x[q3] - block.x) || 1; gy *= Math.sign(x[q3 + 1] - block.y) || 1; gz *= Math.sign(x[q3 + 2] - block.z) || 1;
            const pen = THICK - sd;
            x[q3] += gx * pen; x[q3 + 1] += gy * pen; x[q3 + 2] += gz * pen;
            const ux = x[q3] - p[q3], uy = x[q3 + 1] - p[q3 + 1], uz = x[q3 + 2] - p[q3 + 2];
            const un = ux * gx + uy * gy + uz * gz;
            const tx = ux - un * gx, ty = uy - un * gy, tz = uz - un * gz, tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
            const k = tl < MU_G * pen * 1.4 ? 1 : Math.min(MU_G * pen / Math.max(tl, 1e-12), 1);
            x[q3] -= tx * k; x[q3 + 1] -= ty * k; x[q3 + 2] -= tz * k;
          }
        }
        if (x[q3 + 1] < THICK) {
          const pen = THICK - x[q3 + 1];
          x[q3 + 1] = THICK;
          const tx = x[q3] - p[q3], tz = x[q3 + 2] - p[q3 + 2], tl = Math.sqrt(tx * tx + tz * tz);
          const k = tl < MU_G * pen * 1.4 ? 1 : Math.min(MU_G * pen / Math.max(tl, 1e-12), 1);
          x[q3] -= tx * k; x[q3 + 2] -= tz * k;
        }
      }
      // velocities from positions, a whisper of damping
      const damp = 1 - 0.4 * h;
      for (let q = 0; q < n * 3; q++) v[q] = (x[q] - p[q]) / h * damp;
    }
    if (log && f >= 0 && f % logEvery === 0) {
      let ms = 0;
      for (let c = 0; c < NC; c++) {
        if (C_A[c] !== 0) continue;
        const A3 = C_I[c] * 3, B3 = C_J[c] * 3;
        const l = Math.hypot(x[B3] - x[A3], x[B3 + 1] - x[A3 + 1], x[B3 + 2] - x[A3 + 2]) / C_R[c];
        if (l > ms) ms = l;
      }
      stat.maxStretch = Math.max(stat.maxStretch, ms);
      log(f, x, ms, npair);
    }
  }
  return { frames, total, n, stat };
}
