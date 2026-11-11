/*
 * 60 · sim.js — the jelly, baked: 2D XPBD soft bodies in the "small steps" form (Macklin et al. 2019:
 * many substeps, one Gauss–Seidel pass each, λ reset every substep → Δλ = −C / (Σ wᵢ|∇Cᵢ|² + α/h²)).
 * Pure JS + typed arrays, no DOM (runs in node). Units: stage pixels and seconds, y down.
 *
 *   material   edge distance constraints (compliance ALPHA_E) + signed triangle-area constraints (ALPHA_A,
 *              almost incompressible: a squashed letter bulges sideways like real gelatine)
 *   ghost      softer edges (ALPHA_G) through the gaps between a syllable's jamo — invisible, collision-free
 *   shape      per-letter rigid shape matching (Müller et al. 2005) as a weak compliant goal (ALPHA_S)
 *   damping    only the non-rigid part of each letter's velocity decays, at a rate 1/TAU_D + CQ·(rms deformation
 *              speed): a splat loses its energy at once, a small wobble lingers (viscoelastic gelatine)
 *   contacts   floor + side walls (Coulomb friction on the substep displacement); letter–letter and
 *              jamo–jamo: every outline particle against the nearest outline edge of another piece
 *              (uniform-grid hash of edge midpoints, rebuilt each substep), signed distance from the edge
 *              normal or the vertex pseudo-normal, two-way positional correction + friction; then a velocity
 *              pass removes the separating speed that the projection left behind (no contact "pop")
 *   guides     momentum-neutral floor friction + a soft damped spring on each letter's x and tilt (see PHYS)
 *   settle     after the climax the linear damping tightens (SETTLE) so the last seconds come to rest
 * Output: particle positions at `fps` (Float32Array frames × N × 2), and when/how hard each letter landed.
 *
 * Bit-exact everywhere: the loop uses only + − × ÷ and √ (IEEE-754 exact in every JS engine) — no Math.sin/cos/
 * atan2/exp/hypot, whose last bits differ between engines and which a chaotic pile-up would amplify.
 */

const hyp = (x, y) => Math.sqrt(x * x + y * y);
// cos / sin of the small initial tilts by their Taylor series (|x| < 0.3 rad → error < 1e-12)
const cosS = (x) => { const x2 = x * x; return 1 - x2 / 2 * (1 - x2 / 12 * (1 - x2 / 30 * (1 - x2 / 56))); };
const sinS = (x) => { const x2 = x * x; return x * (1 - x2 / 6 * (1 - x2 / 20 * (1 - x2 / 42 * (1 - x2 / 72)))); };
// 1 − e^(−x) for the per-substep damping factor (x ≤ 0.3 here; series error < 1e-7)
const oneMinusExp = (x) => x * (1 - x / 2 * (1 - x / 3 * (1 - x / 4 * (1 - x / 5 * (1 - x / 6)))));

export const PHYS = {
  g: 2400,              // px/s²: a slow-motion gummy
  sub: 10,              // substeps per recorded frame (60 fps → h = 1/600 s)
  ALPHA_E: 2.5e-6,      // material edge compliance: a letter landing at ≈ 2600 px/s squashes to ≈ 80 % of its height
  ALPHA_G: 1.2e-5,      // ghost tissue between jamo (5× softer)
  ALPHA_A: 2e-7,        // triangle area: nearly incompressible
  ALPHA_S: 1e-2,        // shape matching (weak memory)
  TAU_D: 0.9,           // s, decay of small wobbles (linear part of the deformation damping)
  CQ: 0.07,             // 1/px, quadratic part: rate += CQ·(rms deformation speed) — a splat loses its energy at once,
                        // a small wobble lingers (gelatine is viscoelastic; a linear damper either kills the wobble or
                        // lets the letter rebound like a rubber ball)
  MU_FLOOR: [1.2, 1.0],   // static, kinetic: gummy is grippy
  MU_PAIR: [1.2, 1.0],
  RC: 1.5,              // px, contact thickness
  KC: 1.0,              // fraction of a contact's penetration removed per substep
  RS: 12,               // px, contact search radius
  CELL: 28,             // px, hash cell (≥ RS + half the longest outline edge)
  KSKIP: 5,             // outline neighbours (each way) that never collide with each other
  // art direction (both invisible as forces, both documented in NOTES): floor friction is made momentum-neutral
  // per letter, so a lopsided squash cannot shove a letter sideways across the table; a soft damped guide keeps
  // each letter near its slot and upright (a roly-poly torque — 랑 stands on a rounded ㅇ and would roll over)
  GUIDE_X: [4.5, 0.9],  // ω (rad/s), ζ of the horizontal guide on the letter's centre of mass
  GUIDE_T: [3.0, 1.0],  // ω (rad/s), ζ of the upright guide (torque toward 0°)
  SETTLE: [7.2, 8.8, 0.12],   // from t0 to t1 the linear damping time constant eases down to this (s): the jiggle fades out
};

/**
 * letters: [{ mesh (mesh.js), x0: [dx, dy] initial offset from rest, theta0, release (s), v0: [vx, vy], omega0 }]
 * world: { floorY, wallL, wallR, floorAt(t)? } — floorAt moves the table (the tap), returning its y at time t
 */
export function bakeJelly(letters, world, { fps = 60, duration = 9.5, phys = PHYS } = {}) {
  const P = phys, h = 1 / (fps * P.sub), ih2 = 1 / (h * h);
  const NL = letters.length;
  // ---- global particle arrays ----
  let N = 0, NE = 0, NT = 0, NB = 0;
  for (const L of letters) { N += L.mesh.pts.length / 2; NE += L.mesh.edges.length; NT += L.mesh.tris.length / 3; NB += L.mesh.nb; }
  const X = new Float64Array(N), Y = new Float64Array(N), PX = new Float64Array(N), PY = new Float64Array(N);
  const VX = new Float64Array(N), VY = new Float64Array(N), RX = new Float64Array(N), RY = new Float64Array(N);
  const EI = new Int32Array(NE), EJ = new Int32Array(NE), ER = new Float64Array(NE), EA = new Float64Array(NE);
  const TI = new Int32Array(NT * 3), TA = new Float64Array(NT);
  // outline vertices; edge k runs from vertex k to vertex BNI[k]
  const BP = new Int32Array(NB), BNI = new Int32Array(NB), BPI = new Int32Array(NB), BLOOP = new Int32Array(NB), BLI = new Int32Array(NB), BLEN = new Int32Array(NB), BCOMP = new Int32Array(NB);
  const LP0 = new Int32Array(NL), LP1 = new Int32Array(NL), LE0 = new Int32Array(NL), LE1 = new Int32Array(NL), LT0 = new Int32Array(NL), LT1 = new Int32Array(NL), LB0 = new Int32Array(NL), LB1 = new Int32Array(NL);
  const restCX = new Float64Array(NL), restCY = new Float64Array(NL);
  let p0 = 0, e0 = 0, t0 = 0, b0 = 0, loopId = 0, compBase = 0;
  letters.forEach((L, l) => {
    const m = L.mesh, n = m.pts.length / 2;
    LP0[l] = p0; LP1[l] = p0 + n;
    let cx = 0, cy = 0;
    for (let i = 0; i < n; i++) { cx += m.pts[i * 2]; cy += m.pts[i * 2 + 1]; }
    cx /= n; cy /= n; restCX[l] = cx; restCY[l] = cy;
    const c = cosS(L.theta0 || 0), s = sinS(L.theta0 || 0);
    for (let i = 0; i < n; i++) {
      const rx = m.pts[i * 2] - cx, ry = m.pts[i * 2 + 1] - cy;
      RX[p0 + i] = rx; RY[p0 + i] = ry;
      X[p0 + i] = cx + c * rx - s * ry + L.x0[0];
      Y[p0 + i] = cy + s * rx + c * ry + L.x0[1];
    }
    LE0[l] = e0;
    for (const [i, j, r, g] of m.edges) { EI[e0] = p0 + i; EJ[e0] = p0 + j; ER[e0] = r; EA[e0] = (g ? P.ALPHA_G : P.ALPHA_E) * ih2; e0++; }
    LE1[l] = e0;
    LT0[l] = t0;
    for (let t = 0; t < m.tris.length / 3; t++) { TI[t0 * 3] = p0 + m.tris[t * 3]; TI[t0 * 3 + 1] = p0 + m.tris[t * 3 + 1]; TI[t0 * 3 + 2] = p0 + m.tris[t * 3 + 2]; TA[t0] = m.triA0[t]; t0++; }
    LT1[l] = t0;
    LB0[l] = b0;
    for (const lp of m.loops) {
      for (let i = 0; i < lp.len; i++) {
        const k = b0 + lp.start + i;
        BP[k] = p0 + lp.start + i;
        BNI[k] = b0 + lp.start + ((i + 1) % lp.len);
        BPI[k] = b0 + lp.start + ((i - 1 + lp.len) % lp.len);
        BLOOP[k] = loopId; BLI[k] = i; BLEN[k] = lp.len;
        BCOMP[k] = compBase + m.comp[lp.start + i];
      }
      loopId++;
    }
    b0 += m.nb; LB1[l] = b0;
    compBase += m.ncomp;
    p0 += n;
  });

  const active = new Uint8Array(NL), contact = new Uint8Array(NL);
  const goalX = Float64Array.from(letters, (L, l) => restCX[l]);
  const landed = letters.map(() => null);
  const lastVy = new Float64Array(NL);
  const kS = 1 / (1 + P.ALPHA_S * ih2);
  const aA = P.ALPHA_A * ih2;
  const { wallL, wallR } = world;
  const floorAt = world.floorAt || (() => world.floorY);
  let floorY = world.floorY;

  // ---- hash of outline edges ----
  const TS = 8192, MASK = TS - 1;
  const cellStart = new Int32Array(TS + 1), cellItems = new Int32Array(NB), cellOf = new Int32Array(NB);
  const hashOf = (cx, cy) => (Math.imul(cx, 73856093) ^ Math.imul(cy, 19349663)) & MASK;
  const buildHash = () => {
    cellStart.fill(0);
    for (let l = 0; l < NL; l++) {
      if (!active[l]) { for (let k = LB0[l]; k < LB1[l]; k++) cellOf[k] = -1; continue; }
      for (let k = LB0[l]; k < LB1[l]; k++) {
        const a = BP[k], b = BP[BNI[k]];
        const hh = hashOf(Math.floor((X[a] + X[b]) * 0.5 / P.CELL), Math.floor((Y[a] + Y[b]) * 0.5 / P.CELL));
        cellOf[k] = hh; cellStart[hh + 1]++;
      }
    }
    for (let i = 0; i < TS; i++) cellStart[i + 1] += cellStart[i];
    const fill = cellStart.slice(0, TS);
    for (let k = 0; k < NB; k++) if (cellOf[k] >= 0) cellItems[fill[cellOf[k]]++] = k;
  };
  const RS2 = P.RS * P.RS;
  const letterOfB = new Int32Array(NB);
  for (let l = 0; l < NL; l++) for (let k = LB0[l]; k < LB1[l]; k++) letterOfB[k] = l;

  // contacts found in the position pass, revisited in the velocity pass
  const KP = new Int32Array(NB), KE = new Int32Array(NB), KU = new Float64Array(NB), KNX = new Float64Array(NB), KNY = new Float64Array(NB);
  let nK = 0;
  const collide = () => {
    buildHash();
    nK = 0;
    for (let l = 0; l < NL; l++) {
      if (!active[l]) continue;
      for (let a = LB0[l]; a < LB1[l]; a++) {
        const p = BP[a], px = X[p], py = Y[p];
        const ccx = Math.floor(px / P.CELL), ccy = Math.floor(py / P.CELL);
        let best = -1, bestD2 = RS2, bestU = 0;
        for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
          const hh = hashOf(ccx + ox, ccy + oy);
          for (let q = cellStart[hh], qe = cellStart[hh + 1]; q < qe; q++) {
            const e = cellItems[q];
            const q0 = BP[e], q1 = BP[BNI[e]];
            if (q0 === p || q1 === p) continue;
            if (BLOOP[e] === BLOOP[a]) {
              const n = BLEN[a];
              let d = Math.abs(BLI[e] - BLI[a]); d = Math.min(d, n - d);
              let d2 = Math.abs(BLI[BNI[e]] - BLI[a]); d2 = Math.min(d2, n - d2);
              if (Math.min(d, d2) <= P.KSKIP) continue;
            } else if (BCOMP[e] === BCOMP[a]) continue;
            const ax = X[q0], ay = Y[q0], ex = X[q1] - ax, ey = Y[q1] - ay;
            const l2 = ex * ex + ey * ey;
            let u = l2 > 1e-12 ? ((px - ax) * ex + (py - ay) * ey) / l2 : 0;
            u = u < 0 ? 0 : u > 1 ? 1 : u;
            const dx = px - ax - ex * u, dy = py - ay - ey * u, d2 = dx * dx + dy * dy;
            if (d2 < bestD2) { bestD2 = d2; best = e; bestU = u; }
          }
        }
        if (best < 0) continue;
        const e = best, u = bestU, q0 = BP[e], q1 = BP[BNI[e]];
        const ax = X[q0], ay = Y[q0], ex = X[q1] - ax, ey = Y[q1] - ay;
        const cx = ax + ex * u, cy = ay + ey * u;
        let nx, ny, s;
        if (u > 1e-6 && u < 1 - 1e-6) {
          const el = hyp(ex, ey);
          nx = ey / el; ny = -ex / el;
          s = (px - cx) * nx + (py - cy) * ny;
        } else {
          // vertex pseudo-normal: perpendicular to (next − prev) around that outline vertex
          const v = u <= 1e-6 ? e : BNI[e];
          const pn = BP[BNI[v]], pp = BP[BPI[v]];
          const tx = X[pn] - X[pp], ty = Y[pn] - Y[pp], tl = hyp(tx, ty) || 1;
          nx = ty / tl; ny = -tx / tl;
          const dl = Math.sqrt(bestD2);
          s = (px - cx) * nx + (py - cy) * ny >= 0 ? dl : -dl;
        }
        const C = s - P.RC;
        if (C >= 0) continue;
        contact[l] = 1; contact[letterOfB[e]] = 1;
        KP[nK] = p; KE[nK] = e; KU[nK] = u; KNX[nK] = nx; KNY[nK] = ny; nK++;
        const b0w = 1 - u, b1w = u, W = 1 + b0w * b0w + b1w * b1w;
        const dl = -C * P.KC / W;
        X[p] += dl * nx; Y[p] += dl * ny;
        X[q0] -= b0w * dl * nx; Y[q0] -= b0w * dl * ny;
        X[q1] -= b1w * dl * nx; Y[q1] -= b1w * dl * ny;
        // Coulomb friction on the relative tangential displacement of this substep
        const rx = (X[p] - PX[p]) - (b0w * (X[q0] - PX[q0]) + b1w * (X[q1] - PX[q1]));
        const ry = (Y[p] - PY[p]) - (b0w * (Y[q0] - PY[q0]) + b1w * (Y[q1] - PY[q1]));
        const rn = rx * nx + ry * ny, tx = rx - rn * nx, ty = ry - rn * ny, tl = hyp(tx, ty);
        if (tl > 1e-9) {
          const depth = -C;
          const corr = tl < P.MU_PAIR[0] * depth ? tl : Math.min(tl, P.MU_PAIR[1] * depth);
          const dt = corr / W, ux = tx / tl, uy = ty / tl;
          X[p] -= dt * ux; Y[p] -= dt * uy;
          X[q0] += b0w * dt * ux; Y[q0] += b0w * dt * uy;
          X[q1] += b1w * dt * ux; Y[q1] += b1w * dt * uy;
        }
      }
    }
  };

  const nFrames = Math.round(duration * fps) + 1;
  const frames = new Float32Array(nFrames * N * 2);
  const record = (f) => { const o = f * N * 2; for (let i = 0; i < N; i++) { frames[o + i * 2] = X[i]; frames[o + i * 2 + 1] = Y[i]; } };
  record(0);
  const totalSub = (nFrames - 1) * P.sub;
  const [st0, st1, stTau] = P.SETTLE;
  for (let s = 0; s < totalSub; s++) {
    const t = s * h;
    floorY = floorAt(t + h);
    const ks = t <= st0 ? 0 : t >= st1 ? 1 : (t - st0) / (st1 - st0), ksm = ks * ks * (3 - 2 * ks);
    const invTau = (1 - ksm) / P.TAU_D + ksm / stTau;
    for (let l = 0; l < NL; l++) {
      if (active[l] || t < letters[l].release) continue;
      active[l] = 1;
      let cx = 0, cy = 0;
      for (let i = LP0[l]; i < LP1[l]; i++) { cx += X[i]; cy += Y[i]; }
      cx /= LP1[l] - LP0[l]; cy /= LP1[l] - LP0[l];
      const [vx, vy] = letters[l].v0 || [0, 0], om = letters[l].omega0 || 0;
      for (let i = LP0[l]; i < LP1[l]; i++) { VX[i] = vx - om * (Y[i] - cy); VY[i] = vy + om * (X[i] - cx); }
    }
    // predict
    for (let l = 0; l < NL; l++) {
      if (!active[l]) continue;
      for (let i = LP0[l]; i < LP1[l]; i++) {
        PX[i] = X[i]; PY[i] = Y[i];
        VY[i] += P.g * h;
        X[i] += VX[i] * h; Y[i] += VY[i] * h;
      }
    }
    for (let l = 0; l < NL; l++) {
      if (!active[l]) continue;
      // material + ghost edges
      for (let e = LE0[l]; e < LE1[l]; e++) {
        const i = EI[e], j = EJ[e];
        const dx = X[i] - X[j], dy = Y[i] - Y[j], len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1e-9) continue;
        const dl = -(len - ER[e]) / (2 + EA[e]) / len;
        X[i] += dl * dx; Y[i] += dl * dy; X[j] -= dl * dx; Y[j] -= dl * dy;
      }
      // triangle areas
      for (let t = LT0[l]; t < LT1[l]; t++) {
        const a = TI[t * 3], b = TI[t * 3 + 1], c = TI[t * 3 + 2];
        const xa = X[a], ya = Y[a], xb = X[b], yb = Y[b], xc = X[c], yc = Y[c];
        const C = 0.5 * ((xb - xa) * (yc - ya) - (xc - xa) * (yb - ya)) - TA[t];
        const gax = 0.5 * (yb - yc), gay = 0.5 * (xc - xb), gbx = 0.5 * (yc - ya), gby = 0.5 * (xa - xc), gcx = 0.5 * (ya - yb), gcy = 0.5 * (xb - xa);
        const S = gax * gax + gay * gay + gbx * gbx + gby * gby + gcx * gcx + gcy * gcy;
        if (S < 1e-12) continue;
        const dl = -C / (S + aA);
        X[a] += dl * gax; Y[a] += dl * gay; X[b] += dl * gbx; Y[b] += dl * gby; X[c] += dl * gcx; Y[c] += dl * gcy;
      }
      // shape matching: best rigid fit of the rest shape, then a weak pull toward it
      let cx = 0, cy = 0;
      const n = LP1[l] - LP0[l];
      for (let i = LP0[l]; i < LP1[l]; i++) { cx += X[i]; cy += Y[i]; }
      cx /= n; cy /= n;
      let sc = 0, sd = 0;
      for (let i = LP0[l]; i < LP1[l]; i++) { const qx = X[i] - cx, qy = Y[i] - cy; sc += RX[i] * qy - RY[i] * qx; sd += RX[i] * qx + RY[i] * qy; }
      // optimal rotation: angle θ = atan2(sc, sd) → (cos θ, sin θ) = (sd, sc) / |(sd, sc)|
      const rr = hyp(sc, sd) || 1, co = sd / rr, si = sc / rr;
      for (let i = LP0[l]; i < LP1[l]; i++) {
        X[i] += (cx + co * RX[i] - si * RY[i] - X[i]) * kS;
        Y[i] += (cy + si * RX[i] + co * RY[i] - Y[i]) * kS;
      }
    }
    collide();
    // floor and walls, with friction
    for (let l = 0; l < NL; l++) {
      if (!active[l]) continue;
      let fx = 0;
      for (let i = LP0[l]; i < LP1[l]; i++) {
        if (Y[i] > floorY) {
          const depth = Y[i] - floorY; Y[i] = floorY; contact[l] = 1;
          const dx = X[i] - PX[i], x0 = X[i];
          if (Math.abs(dx) < P.MU_FLOOR[0] * depth) X[i] = PX[i]; else X[i] -= Math.sign(dx) * P.MU_FLOOR[1] * depth;
          fx += X[i] - x0;
        }
        if (X[i] < wallL) { const depth = wallL - X[i]; X[i] = wallL; const dy = Y[i] - PY[i]; if (Math.abs(dy) < P.MU_FLOOR[0] * depth) Y[i] = PY[i]; else Y[i] -= Math.sign(dy) * P.MU_FLOOR[1] * depth; }
        if (X[i] > wallR) { const depth = X[i] - wallR; X[i] = wallR; const dy = Y[i] - PY[i]; if (Math.abs(dy) < P.MU_FLOOR[0] * depth) Y[i] = PY[i]; else Y[i] -= Math.sign(dy) * P.MU_FLOOR[1] * depth; }
      }
      // momentum-neutral floor friction: it still stops the sole from smearing, but its net sideways push is removed
      if (fx !== 0) { const sh = fx / (LP1[l] - LP0[l]); for (let i = LP0[l]; i < LP1[l]; i++) X[i] -= sh; }
    }
    // velocities
    for (let l = 0; l < NL; l++) {
      if (!active[l]) continue;
      for (let i = LP0[l]; i < LP1[l]; i++) { VX[i] = (X[i] - PX[i]) / h; VY[i] = (Y[i] - PY[i]) / h; }
    }
    // contact velocity pass: the projection that removed a penetration leaves a separating velocity of
    // depth / h — remove it (gummy contacts are inelastic), or a resting stack chatters and gains energy
    for (let k = 0; k < nK; k++) {
      const p = KP[k], e = KE[k], u = KU[k], nx = KNX[k], ny = KNY[k], q0 = BP[e], q1 = BP[BNI[e]];
      const b0w = 1 - u, b1w = u;
      const vn = (VX[p] - b0w * VX[q0] - b1w * VX[q1]) * nx + (VY[p] - b0w * VY[q0] - b1w * VY[q1]) * ny;
      if (vn <= 0) continue;
      const d = vn / (1 + b0w * b0w + b1w * b1w);
      VX[p] -= d * nx; VY[p] -= d * ny;
      VX[q0] += b0w * d * nx; VY[q0] += b0w * d * ny;
      VX[q1] += b1w * d * nx; VY[q1] += b1w * d * ny;
    }
    // damp only the deformation (the velocity field minus its rigid part), then the guides
    for (let l = 0; l < NL; l++) {
      if (!active[l]) continue;
      const n = LP1[l] - LP0[l];
      let cx = 0, cy = 0, vx = 0, vy = 0;
      for (let i = LP0[l]; i < LP1[l]; i++) { cx += X[i]; cy += Y[i]; vx += VX[i]; vy += VY[i]; }
      cx /= n; cy /= n; vx /= n; vy /= n;
      let L = 0, I = 0;
      for (let i = LP0[l]; i < LP1[l]; i++) { const rx = X[i] - cx, ry = Y[i] - cy; L += rx * (VY[i] - vy) - ry * (VX[i] - vx); I += rx * rx + ry * ry; }
      const om = I > 0 ? L / I : 0;
      let E = 0;
      for (let i = LP0[l]; i < LP1[l]; i++) {
        const rx = X[i] - cx, ry = Y[i] - cy, ux = VX[i] - (vx - om * ry), uy = VY[i] - (vy + om * rx);
        E += ux * ux + uy * uy;
      }
      const kD = oneMinusExp(h * (invTau + P.CQ * Math.sqrt(E / n)));
      // guides: a damped spring on the centre of mass (x only) and on the tilt of the best rigid fit
      let sc = 0, sd = 0;
      for (let i = LP0[l]; i < LP1[l]; i++) { const qx = X[i] - cx, qy = Y[i] - cy; sc += RX[i] * qy - RY[i] * qx; sd += RX[i] * qx + RY[i] * qy; }
      const rr = hyp(sc, sd) || 1, tilt = (2 * sc / rr) / (1 + sd / rr);        // 2·tan(θ/2) ≈ θ
      const [wx, zx] = P.GUIDE_X, [wt, zt] = P.GUIDE_T;
      const dvx = (-wx * wx * (cx - goalX[l]) - 2 * zx * wx * vx) * h;
      const dom = (-wt * wt * Math.max(-2, Math.min(2, tilt)) - 2 * zt * wt * om) * h;
      for (let i = LP0[l]; i < LP1[l]; i++) {
        const rx = X[i] - cx, ry = Y[i] - cy;
        VX[i] += (vx - om * ry - VX[i]) * kD + dvx - dom * ry;
        VY[i] += (vy + om * rx - VY[i]) * kD + dom * rx;
      }
      if (contact[l] && !landed[l]) landed[l] = { t: t + h, vy: lastVy[l], n };
      lastVy[l] = vy;
      contact[l] = 0;
    }
    if ((s + 1) % P.sub === 0) record((s + 1) / P.sub);
  }
  return { frames, nFrames, N, fps, LP0, LP1, landed, restCX, restCY };
}
