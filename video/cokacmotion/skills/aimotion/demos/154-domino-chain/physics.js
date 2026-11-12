/*
 * physics.js — the domino solver, baked once in setup (no DOM, no clock, no randomness).
 *
 * Every domino is a rigid box (height h, width w, thickness d, mass 1) that can only turn about its own front-bottom
 * edge: one angle θ (0 = standing, π/2 = lying on its face) and one angular velocity ω. Units are natural:
 * h = 1, g = 1, so time is measured in τ = √(h/g); the caller maps τ to seconds.
 *
 *   gravity     I·θ'' = h/2·sinθ − d/2·cosθ          (centre of mass about the edge; I = (h² + d²)/3)
 *   contact     C(θi, θj) = s·cosθj − d − h·sin(θi − θj) ≥ 0
 *               i's top edge against j's back face, s = distance from i's pivot line to j's pivot measured along i
 *   impact      first touch: impulse with restitution e   λ = −(1 + e)·vn / K,   vn = Ji·ωi + Jj·ωj,
 *               Ji = ∂C/∂θi = −h·cos(θi − θj),  Jj = ∂C/∂θj = h·cos(θi − θj) − s·sinθj,  K = (Ji² + Jj²)/I
 *   chain       afterwards the same contact stays a one-sided constraint (e = 0): projected Gauss–Seidel on velocities
 *               (accumulated λ ≥ 0) and a position projection, so the leaning dominoes ride on each other as one chain
 *   table       θ ≥ 0 (a standing domino is held by its base), θ ≤ π/2 with a small bounce
 *
 * Bodies are sorted by rank (the chain index, then the field ring); a domino is pushed only by the rank before it, but by
 * any of them whose top edge overlaps its back face. Only a window of ranks is stepped: from the tail (the lowest rank
 * that still holds a body turning faster than restOmega within the last restTau, and at least `back` ranks behind the
 * front) to one rank past the front. Behind the tail everything has come to rest and is frozen; ahead, all still stand.
 */

/**
 * Contacts between consecutive ranks. bodies: { n, x, z, fx, fz, rank } (pivot = front-bottom edge centre, f = fall
 * direction, unit). A pair counts when the pusher's top edge overlaps the pushee's back face laterally by more than
 * minOverlap·w and the gap between them is shorter than the domino is tall.
 */
export function findContacts(B, { h, w, d, minOverlap = 0.12 }) {
  const { n, x, z, fx, fz, rank } = B;
  const R = rank[n - 1] + 1;
  const start = new Int32Array(R + 1);
  for (let b = 0, r = 0; r <= R; r++) { while (b < n && rank[b] < r) b++; start[r] = b; }
  const ci = [], cj = [], cs = [];
  for (let i = 0; i < n; i++) {
    const r = rank[i];
    if (r + 1 >= R) continue;
    const lx = fz[i], lz = -fx[i];                          // i's lateral axis
    for (let j = start[r + 1]; j < start[r + 2]; j++) {
      // j's back face: centre B = Pj − d·fj, ends B ± w/2·lj, projected onto i's frame
      const bx = x[j] - d * fx[j] - x[i], bz = z[j] - d * fz[j] - z[i];
      const ljx = fz[j], ljz = -fx[j];
      const u0 = (bx - ljx * w / 2) * lx + (bz - ljz * w / 2) * lz;
      const u1 = (bx + ljx * w / 2) * lx + (bz + ljz * w / 2) * lz;
      const lo = Math.max(-w / 2, Math.min(u0, u1)), hi = Math.min(w / 2, Math.max(u0, u1));
      if (hi - lo < minOverlap * w) continue;
      // gap along fi from i's pivot line (at the overlap's middle) to j's back-face plane
      const uc = (lo + hi) / 2;
      const cx = x[i] + lx * uc, cz = z[i] + lz * uc;
      const cosij = fx[i] * fx[j] + fz[i] * fz[j];
      if (cosij < 0.5) continue;
      const gap = ((x[j] - d * fx[j] - cx) * fx[j] + (z[j] - d * fz[j] - cz) * fz[j]) / cosij;
      if (gap <= 0 || gap >= 0.95 * h) continue;
      ci.push(i); cj.push(j); cs.push(gap + d);
    }
  }
  return { n: ci.length, ci: Int32Array.from(ci), cj: Int32Array.from(cj), cs: Float64Array.from(cs), rankStart: start, R };
}

/**
 * Bake the fall. Body 0 starts with ω0 (the marble's kick). Returns per-body angle tracks sampled every dtRec τ:
 * θ_b(τ) = 0 before start[b], pool[off[b] + k] at τ = (start[b] + k)·dtRec, final[b] after the last sample.
 */
export function bake(B, C, P) {
  const { h, d, omega0, dt = 0.005, recEvery = 5, eHit = 0.15, eFloor = 0.25, velIters = 5, posIters = 2,
    back = 6, restOmega = 2e-3, restTau = 1.5, settle = 8, maxTau = 400, slop = 1e-4 } = P;
  const n = B.n, rank = B.rank, R = C.R, rs = C.rankStart;
  const I = (h * h + d * d) / 3, invI = 1 / I, kg = 1 / I;
  const th = new Float64Array(n), om = new Float64Array(n);
  const nc = C.n, ci = C.ci, cj = C.cj, cs = C.cs;
  // contacts sorted by the pusher's rank (they are generated in body order, which is rank order) → range per rank
  const cStart = new Int32Array(R + 1);
  for (let c = 0, r = 0; r <= R; r++) { while (c < nc && rank[ci[c]] < r) c++; cStart[r] = c; }
  const eng = new Uint8Array(nc), act = new Uint8Array(nc);
  const Ji = new Float64Array(nc), Jj = new Float64Array(nc), Kc = new Float64Array(nc), bias = new Float64Array(nc), acc = new Float64Array(nc);
  const wake = new Float64Array(n).fill(-1);              // τ when each body first moved
  const recStart = new Int32Array(n).fill(-1);
  const tracks = Array.from({ length: n }, () => []);
  om[0] = omega0;
  let F = rank[0];                                        // the front: highest rank that has moved
  let lo = 0;                                             // the tail: lowest rank that still has a moving body
  const still = new Int32Array(n);                        // steps each body has spent (nearly) still
  const restSteps = Math.round(restTau / dt);
  let tau = 0, step = 0, recIdx = 0, tauLast = -1;
  const HALF_PI = Math.PI / 2;

  for (;;) {
    // freeze whole ranks from the tail once every body in them has been still for restTau (and they trail the front)
    while (lo < F - back) {
      let done = true;
      for (let b = rs[lo]; b < rs[lo + 1]; b++) if (still[b] < restSteps) { done = false; break; }
      if (!done) break;
      lo++;
    }
    const hi = Math.min(R - 1, F + 1);
    const b0 = rs[lo], b1 = rs[hi + 1];
    const c0 = cStart[lo], c1 = cStart[Math.min(R, hi + 1)];

    // ---- gravity about the edge (a standing domino at rest is held by its base)
    for (let b = b0; b < b1; b++) {
      if (th[b] <= 0 && om[b] <= 0) continue;
      om[b] += kg * (0.5 * h * Math.sin(th[b]) - 0.5 * d * Math.cos(th[b])) * dt;
    }
    // ---- contacts: prepare (Jacobians, effective mass, restitution on first touch)
    for (let c = c0; c < c1; c++) {
      const i = ci[c], j = cj[c];
      const ti = th[i], tj = th[j];
      if (ti <= 0 && tj <= 0 && om[i] <= 0) { act[c] = 0; continue; }
      const cij = Math.cos(ti - tj);
      const Cv = cs[c] * Math.cos(tj) - d - h * Math.sin(ti - tj);
      if (Cv > slop) { act[c] = 0; acc[c] = 0; continue; }
      const a = -h * cij, bb = h * cij - cs[c] * Math.sin(tj);
      Ji[c] = a; Jj[c] = bb; Kc[c] = (a * a + bb * bb) * invI;
      const vn = a * om[i] + bb * om[j];
      bias[c] = 0;
      if (!eng[c]) {
        eng[c] = 1;
        if (vn < 0) bias[c] = -eHit * vn;
        if (rank[j] > F) F = rank[j];
      }
      act[c] = 1; acc[c] = 0;
    }
    // ---- velocity pass: projected Gauss–Seidel, alternating sweep direction
    for (let it = 0; it < velIters; it++) {
      const fwd = (it & 1) === 0;
      for (let k = c0; k < c1; k++) {
        const c = fwd ? k : c1 - 1 - k + c0;
        if (!act[c]) continue;
        const i = ci[c], j = cj[c];
        const vn = Ji[c] * om[i] + Jj[c] * om[j];
        let dl = (bias[c] - vn) / Kc[c];
        const na = Math.max(0, acc[c] + dl);
        dl = na - acc[c]; acc[c] = na;
        om[i] += Ji[c] * dl * invI; om[j] += Jj[c] * dl * invI;
      }
    }
    // ---- integrate, table limits
    for (let b = b0; b < b1; b++) {
      if (th[b] <= 0 && om[b] <= 0) { th[b] = 0; om[b] = 0; still[b]++; continue; }
      th[b] += om[b] * dt;
      if (th[b] < 0) { th[b] = 0; if (om[b] < 0) om[b] = 0; }
      if (th[b] > HALF_PI) { th[b] = HALF_PI; if (om[b] > 0) om[b] = om[b] < 0.05 ? 0 : -eFloor * om[b]; }
      if (wake[b] < 0 && th[b] > 0) wake[b] = tau;
      still[b] = Math.abs(om[b]) < restOmega ? still[b] + 1 : 0;
    }
    // ---- position projection (no drift into each other)
    for (let it = 0; it < posIters; it++) {
      for (let c = c0; c < c1; c++) {
        const i = ci[c], j = cj[c];
        const ti = th[i], tj = th[j];
        if (ti <= 0) continue;
        const Cv = cs[c] * Math.cos(tj) - d - h * Math.sin(ti - tj);
        if (Cv >= 0) continue;
        const cij = Math.cos(ti - tj);
        const a = -h * cij, bb = h * cij - cs[c] * Math.sin(tj);
        const K = (a * a + bb * bb) * invI;
        const dl = (-Cv / K) * 0.9;
        th[i] = Math.min(HALF_PI, Math.max(0, ti + a * dl * invI));
        th[j] = Math.min(HALF_PI, Math.max(0, tj + bb * dl * invI));
      }
    }
    step++; tau = step * dt;
    // ---- record (only the window: everything outside it is either standing or frozen)
    if (step % recEvery === 0) {
      recIdx++;
      for (let b = b0; b < b1; b++) {
        if (recStart[b] < 0) { if (th[b] <= 0) continue; recStart[b] = recIdx; }
        tracks[b].push(th[b]);
      }
    }
    if (F === R - 1 && tauLast < 0) tauLast = tau;
    if ((tauLast >= 0 && tau > tauLast + settle) || tau > maxTau) break;
  }

  // ---- pack: trim each track's tail once it stays within 1e-5 rad of its final angle
  const off = new Int32Array(n), len = new Int32Array(n), fin = new Float32Array(n);
  let total = 0;
  for (let b = 0; b < n; b++) {
    const tr = tracks[b];
    if (!tr.length) { fin[b] = th[b]; continue; }
    const f = tr[tr.length - 1];
    let L = tr.length;
    while (L > 1 && Math.abs(tr[L - 2] - f) < 1e-5) L--;
    len[b] = L; fin[b] = f; total += L;
  }
  const pool = new Float32Array(total);
  for (let b = 0, o = 0; b < n; b++) {
    off[b] = o;
    const tr = tracks[b];
    for (let k = 0; k < len[b]; k++) pool[o + k] = tr[k];
    o += len[b];
  }
  return { pool, off, len, start: recStart, fin, dtRec: dt * recEvery, wake, tauEnd: tau, steps: step };
}

/** θ of body b at natural time τ (linear between samples). */
export function angleAt(S, b, tau) {
  const st = S.start[b];
  if (st < 0) return S.fin[b];
  const k = tau / S.dtRec - st;
  if (k < 0) return k > -1 ? (1 + k) * S.pool[S.off[b]] : 0;   // the first sample ramps from 0 (the step before it)
  const L = S.len[b];
  if (k >= L - 1) return S.fin[b];
  const k0 = Math.floor(k), u = k - k0, o = S.off[b] + k0;
  return S.pool[o] + (S.pool[o + 1] - S.pool[o]) * u;
}
