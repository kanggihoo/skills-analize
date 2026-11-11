/*
 * 38 · sim.js — a starling murmuration, baked (pure JS, typed arrays, no DOM: also runs in node).
 *
 * Boids (Reynolds 1987) with TOPOLOGICAL neighbours: every bird reacts to its 7 nearest flockmates, whatever their
 * distance — what Ballerini et al. (2008, PNAS) measured in real starling flocks (6–7 neighbours). Nearest
 * neighbours come from a uniform spatial hash (cell 2 m, counting sort) searched shell by shell every 0.2 s, and in
 * between from the neighbours' neighbours (the graph changes slowly; ≤ 56 candidates instead of hundreds).
 *   separation    push away from neighbours closer than r_sep
 *   alignment     match the neighbours' mean velocity
 *   cohesion      steer toward the neighbours' centroid (topological: holds even when the flock thins)
 *   roost         a few 'informed' birds (Couzin et al. 2005) steer to wheel round the roost; the rest only follow
 *                 their neighbours — so every turn starts somewhere and sweeps through the flock. At dusk the circle
 *                 tightens and sinks and the whole flock spirals down into the reeds
 *   speed         relax toward cruising speed (11 m/s), bounded acceleration
 *   predator      a falcon (pursuit steering toward the flock with limited turn rate) — birds within 9 m panic and
 *                 dart away; birds within 16 m are pushed away (the "vacuole" that opens around it)
 *   alarm wave    an excitable medium on the neighbour graph (Procaccini et al. 2011, agitation waves): a panicking
 *                 bird alarms its 7 neighbours after a reaction delay; each alarmed bird swerves along the inherited
 *                 escape direction and banks hard, then is refractory (4 s); the alarm weakens 1.5 % per hop, so
 *                 each wave crosses the flock once and fades instead of circling forever
 *   banking       roll follows the lateral acceleration (a coordinated turn), plus the alarm's sharp bank
 * Fixed dt = 1/60 s; recorded every second step (30 fps): position, roll, alarm.
 */

export const N_BIRDS = 6600;
export const REC = 5;            // floats per bird per frame: x, y, z, roll, alarm
export const FALCON_ON = [2.3, 6.1];      // pursuit window (s); it leaves afterwards

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

// the roost: the flock wheels round a point above the reed bed (world: camera near the origin looking toward −z, y up).
// returns [cx, cy, cz, radius, dusk]; at dusk the circle tightens and sinks — the flock spirals down into the reeds
export function roost(t) {
  const d = smooth(4.9, 6.7, t);
  const R = 34 + 6 * Math.sin(0.7 * t) - 26 * d;
  const cx = 4 + 6 * Math.sin(0.4 * t) - 10 * d, cz = -158 + 18 * d;
  const cy = 50 + 8 * Math.sin(0.55 * t + 0.8) - 64 * d;
  return [cx, cy, cz, Math.max(R, 6), d];
}

export function bakeMurmuration({ fps = 30, duration = 9.5, sub = 2, preroll = 2.5, seed = 38, n = N_BIRDS, log = null } = {}) {
  const r = mulberry32(seed);
  const px = new Float32Array(n), py = new Float32Array(n), pz = new Float32Array(n);
  const vx = new Float32Array(n), vy = new Float32Array(n), vz = new Float32Array(n);
  const ax = new Float32Array(n), ay = new Float32Array(n), az = new Float32Array(n);
  const roll = new Float32Array(n), alarmAge = new Float32Array(n).fill(99), ex = new Float32Array(n), ey = new Float32Array(n), ez = new Float32Array(n);
  const landed = new Uint8Array(n), ph = new Float32Array(n * 3), informed = new Uint8Array(n), alarmK = new Float32Array(n);
  // a loose sheet already wheeling round the roost point
  const O0 = roost(-preroll);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, w = r() * 2 - 1, v = r() * 2 - 1;
    px[i] = O0[0] + u * 38; py[i] = O0[1] + v * 8 + u * 6; pz[i] = O0[2] + O0[3] + w * 16;
    vx[i] = 10 + r(); vy[i] = (r() - 0.5); vz[i] = -1 + r();
    ph[i * 3] = r() * 6.283; ph[i * 3 + 1] = r() * 6.283; ph[i * 3 + 2] = r() * 6.283;
    informed[i] = r() < 0.12 ? 1 : 0;              // the few that know where to go (Couzin et al. 2005): turns start with them
  }
  const K = 7;
  const CS = 2.0, TAB = 1 << 17;
  const cellStart = new Int32Array(TAB + 1), cellPart = new Int32Array(n), hs = new Int32Array(n);
  const cx = new Int32Array(n), cy = new Int32Array(n), cz = new Int32Array(n);
  const hashOf = (a, b, c) => (Math.imul(a, 92837111) ^ Math.imul(b, 689287499) ^ Math.imul(c, 283923481)) & (TAB - 1);
  const nb = new Int32Array(n * K), nbCount = new Uint8Array(n);
  const bd = new Float32Array(K), bj = new Int32Array(K);

  const build = () => {
    cellStart.fill(0);
    for (let i = 0; i < n; i++) {
      const a = Math.floor(px[i] / CS), b = Math.floor(py[i] / CS), c = Math.floor(pz[i] / CS);
      cx[i] = a; cy[i] = b; cz[i] = c;
      const h = landed[i] ? TAB - 1 : hashOf(a, b, c);
      hs[i] = h; cellStart[h]++;
    }
    let s = 0;
    for (let h = 0; h < TAB; h++) { s += cellStart[h]; cellStart[h] = s; }
    cellStart[TAB] = s;
    for (let i = 0; i < n; i++) cellPart[--cellStart[hs[i]]] = i;
  };
  // k nearest: search the 3×3×3 block, widen to 5×5×5 (then 7×7×7) only if the 7th distance is not yet certain
  const knn = (i) => {
    let m = 0;
    const X = px[i], Y = py[i], Z = pz[i];
    for (let R = 1; R <= 3; R++) {
      m = 0;
      for (let a = cx[i] - R; a <= cx[i] + R; a++) for (let b = cy[i] - R; b <= cy[i] + R; b++) for (let c = cz[i] - R; c <= cz[i] + R; c++) {
        const h = hashOf(a, b, c);
        for (let e = cellStart[h]; e < cellStart[h + 1]; e++) {
          const j = cellPart[e];
          if (j === i || landed[j]) continue;
          const dx = px[j] - X, dy = py[j] - Y, dz = pz[j] - Z, d2 = dx * dx + dy * dy + dz * dz;
          if (m === K && d2 >= bd[K - 1]) continue;
          let dup = false;
          for (let q = 0; q < m; q++) if (bj[q] === j) { dup = true; break; }
          if (dup) continue;
          let q = m < K ? m++ : K - 1;
          while (q > 0 && bd[q - 1] > d2) { bd[q] = bd[q - 1]; bj[q] = bj[q - 1]; q--; }
          bd[q] = d2; bj[q] = j;
        }
      }
      if (m === K && bd[K - 1] <= (R * CS) * (R * CS)) break;
    }
    for (let q = 0; q < m; q++) nb[i * K + q] = bj[q];
    nbCount[i] = m;
  };
  // between full searches: refine each list from the neighbours' neighbours (≤ 56 candidates, the graph moves slowly)
  const refine = (i) => {
    let m = 0;
    const X = px[i], Y = py[i], Z = pz[i], c0 = nbCount[i];
    for (let a = -1; a < c0; a++) {
      const src = a < 0 ? i : nb[i * K + a];
      const cn = nbCount[src];
      for (let b = 0; b < cn; b++) {
        const j = nb[src * K + b];
        if (j === i || landed[j]) continue;
        const dx = px[j] - X, dy = py[j] - Y, dz = pz[j] - Z, d2 = dx * dx + dy * dy + dz * dz;
        if (m === K && d2 >= bd[K - 1]) continue;
        let dup = false;
        for (let q = 0; q < m; q++) if (bj[q] === j) { dup = true; break; }
        if (dup) continue;
        let q = m < K ? m++ : K - 1;
        while (q > 0 && bd[q - 1] > d2) { bd[q] = bd[q - 1]; bj[q] = bj[q - 1]; q--; }
        bd[q] = d2; bj[q] = j;
      }
    }
    for (let q = 0; q < m; q++) nb[i * K + q] = bj[q];
    nbCount[i] = m;
  };

  // falcon
  let fx = 0, fy = 0, fz = 0, fvx = 0, fvy = 0, fvz = 0, falconOn = false;
  const dt = 1 / (fps * sub);
  const total = Math.round(duration * fps) + 1;
  const out = new Float32Array(total * n * REC);
  const falconOut = new Float32Array(total * 4);
  const steps0 = Math.round(preroll * fps * sub);
  const V0 = 11, RSEP = 1.5;
  const ALARM_T = 0.45, ALARM_DELAY = 0.07, REFRACT = 4.0, HOP = 0.985;

  let step = -steps0;
  const totalSteps = (total - 1) * sub;
  for (; step <= totalSteps; step++) {
    const t = step * dt;
    if (step >= 0 && step % sub === 0) {
      const f = step / sub, o = f * n * REC;
      for (let i = 0; i < n; i++) {
        const k = o + i * REC;
        out[k] = px[i]; out[k + 1] = py[i]; out[k + 2] = pz[i]; out[k + 3] = roll[i];
        out[k + 4] = alarmAge[i] < ALARM_T ? (1 - alarmAge[i] / ALARM_T) * alarmK[i] : 0;
      }
      falconOut[f * 4] = fx; falconOut[f * 4 + 1] = fy; falconOut[f * 4 + 2] = fz; falconOut[f * 4 + 3] = falconOn ? 1 : 0;
      if (log && f % 30 === 0) log(f, { px, py, pz, vx, vy, vz, nb, nbCount, alarmAge, landed, falcon: [fx, fy, fz, falconOn] });
    }
    if (step === totalSteps) break;
    // flock centroid (for the falcon) and the roost point
    let mx = 0, my = 0, mz = 0, live = 0;
    for (let i = 0; i < n; i++) if (!landed[i]) { mx += px[i]; my += py[i]; mz += pz[i]; live++; }
    mx /= Math.max(live, 1); my /= Math.max(live, 1); mz /= Math.max(live, 1);
    const RO = roost(t), dusk = RO[4];

    // --- falcon: appears high on the right, pursues the flock with a limited turn rate, then leaves ---
    const wasOn = falconOn;
    falconOn = t >= FALCON_ON[0] && t < FALCON_ON[1] + 1.5;
    if (falconOn && !wasOn) { fx = mx + 75; fy = my + 48; fz = mz + 25; const l = Math.hypot(mx - fx, my - fy, mz - fz); fvx = (mx - fx) / l * 26; fvy = (my - fy) / l * 26; fvz = (mz - fz) / l * 26; }
    if (falconOn) {
      let tx, ty, tz;
      if (t < FALCON_ON[1]) { tx = mx + 6 * Math.sin(t * 2.1); ty = my - 3; tz = mz + 6 * Math.cos(t * 1.7); }
      else { tx = fx - 200; ty = fy + 120; tz = fz - 60; }
      let dx = tx - fx, dy = ty - fy, dz = tz - fz; const dl = Math.hypot(dx, dy, dz) || 1;
      const sp = Math.hypot(fvx, fvy, fvz) || 1;
      // desired velocity toward the target; steering limited (it overshoots and has to come round again)
      const want = 30;
      let sx = dx / dl * want - fvx, sy = dy / dl * want - fvy, sz = dz / dl * want - fvz;
      const sl = Math.hypot(sx, sy, sz), amax = 38;
      if (sl > amax) { sx *= amax / sl; sy *= amax / sl; sz *= amax / sl; }
      fvx += sx * dt; fvy += (sy - 2) * dt; fvz += sz * dt;
      void sp;
      fx += fvx * dt; fy += fvy * dt; fz += fvz * dt;
    }

    // exact k-nearest from the grid every 0.2 s, graph refinement in between (every 1/30 s)
    if ((step + steps0) % 12 === 0) { build(); for (let i = 0; i < n; i++) if (!landed[i]) knn(i); }
    else if ((step & 1) === 0) for (let i = 0; i < n; i++) if (!landed[i]) refine(i);
    // --- alarm wave (excitable medium on the neighbour graph) ---
    for (let i = 0; i < n; i++) {
      if (landed[i]) continue;
      if (alarmAge[i] < 90) alarmAge[i] += dt;
      if (alarmAge[i] < ALARM_T + REFRACT) continue;       // alarmed or refractory
      let src = -1;
      if (falconOn) {
        const dx = px[i] - fx, dy = py[i] - fy, dz = pz[i] - fz;
        if (dx * dx + dy * dy + dz * dz < 81) { const l = Math.hypot(dx, dy, dz) || 1; ex[i] = dx / l; ey[i] = dy / l * 0.5; ez[i] = dz / l; alarmAge[i] = 0; alarmK[i] = 1; continue; }
      }
      for (let q = 0; q < nbCount[i]; q++) {
        const j = nb[i * K + q];
        if (alarmAge[j] >= ALARM_DELAY && alarmAge[j] < ALARM_T && alarmK[j] > 0.2) { src = j; break; }
      }
      // the alarm weakens a little with every hop, so a wave crosses the flock once and then dies away
      if (src >= 0) { alarmAge[i] = 0; alarmK[i] = alarmK[src] * HOP; ex[i] = ex[src]; ey[i] = ey[src]; ez[i] = ez[src]; }
    }
    // --- steering ---
    for (let i = 0; i < n; i++) {
      if (landed[i]) continue;
      const X = px[i], Y = py[i], Z = pz[i], VX = vx[i], VY = vy[i], VZ = vz[i];
      let fxs = 0, fys = 0, fzs = 0;
      let avx = 0, avy = 0, avz = 0, ccx = 0, ccy = 0, ccz = 0;
      const m = nbCount[i];
      for (let q = 0; q < m; q++) {
        const j = nb[i * K + q];
        const dx = X - px[j], dy = Y - py[j], dz = Z - pz[j];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
        if (d < RSEP) { const s = (RSEP - d) / RSEP / d * 26; fxs += dx * s; fys += dy * s; fzs += dz * s; }
        avx += vx[j]; avy += vy[j]; avz += vz[j];
        ccx += px[j]; ccy += py[j]; ccz += pz[j];
      }
      let Ax = fxs, Ay = fys, Az = fzs;
      if (m > 0) {
        Ax += 2.1 * (avx / m - VX); Ay += 2.1 * (avy / m - VY); Az += 2.1 * (avz / m - VZ);
        Ax += 0.9 * (ccx / m - X); Ay += 1.4 * (ccy / m - Y); Az += 0.9 * (ccz / m - Z);   // a little stiffer in height: a sheet more than a ball
      }
      // roost: the informed few steer to wheel round the roost (tangent + radial correction + altitude);
      // the rest feel only a faint pull, so turns start with the informed and spread through the neighbours.
      // At dusk everyone follows the tightening, sinking circle down into the reeds.
      {
        const rx = X - RO[0], rz = Z - RO[2], rr = Math.hypot(rx, rz) || 1;
        const rl = 1 + 1.6 * dusk, rad = Math.max(-rl, Math.min(rl, (RO[3] - rr) / RO[3] * 1.4));
        const dxv = rz / rr + rx / rr * rad, dzv = -rx / rr + rz / rr * rad;
        const dl = Math.hypot(dxv, dzv) || 1;
        const sp = V0 + 2 * dusk;
        // the circle is tilted: the flock climbs on one side and dives on the other, so the sheet keeps
        // turning its face to us and away (the folding, thickening and thinning seen from the ground)
        const tilt = 17 * (1 - dusk) * Math.sin(Math.atan2(rz, rx) + 0.6 * t);
        const dvx = dxv / dl * sp, dvz = dzv / dl * sp, dvy = Math.max(-8 - 14 * dusk, Math.min(6, (RO[1] + tilt - Y) * (0.16 + 0.5 * dusk)));
        const w = (informed[i] ? 1.6 : 0.16) * (1 - dusk) + 1.6 * dusk;
        Ax += (dvx - VX) * w; Ay += (dvy - VY) * w * (0.8 + 1.2 * dusk); Az += (dvz - VZ) * w;
      }
      // altitude band (relaxed at dusk so they can drop into the reeds)
      if (dusk < 0.5) { if (Y < 22) Ay += (22 - Y) * 0.6; if (Y > 95) Ay -= (Y - 95) * 0.6; }
      // individual wander (smooth, seeded)
      const p0 = ph[i * 3], p1 = ph[i * 3 + 1], p2 = ph[i * 3 + 2];
      Ax += 1.6 * Math.sin(t * 1.3 + p0); Ay += 0.8 * Math.sin(t * 1.1 + p1); Az += 1.6 * Math.sin(t * 1.7 + p2);
      // predator: push away (opens a hole), alarmed birds dart along the inherited escape direction
      if (falconOn) {
        const dx = X - fx, dy = Y - fy, dz = Z - fz, d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 256) { const d = Math.sqrt(d2) + 1e-3, k = (1 - d / 16); const s = 48 * k * k / d; Ax += dx * s; Ay += dy * s * 0.6; Az += dz * s; }
      }
      const aa = alarmAge[i];
      if (aa < ALARM_T) { const e = Math.sin(Math.PI * aa / ALARM_T) * 15 * (0.4 + 0.6 * alarmK[i]); Ax += ex[i] * e; Ay += ey[i] * e; Az += ez[i] * e; }
      // cruise speed
      const sp = Math.sqrt(VX * VX + VY * VY + VZ * VZ) + 1e-6;
      const ks = (V0 + 9 * dusk - sp) * 1.6 / sp;
      Ax += VX * ks; Ay += VY * ks; Az += VZ * ks;
      const al = Math.sqrt(Ax * Ax + Ay * Ay + Az * Az), AM = 42;
      if (al > AM) { Ax *= AM / al; Ay *= AM / al; Az *= AM / al; }
      ax[i] = Ax; ay[i] = Ay; az[i] = Az;
    }
    // --- integrate, bank, land ---
    for (let i = 0; i < n; i++) {
      if (landed[i]) continue;
      let VX = vx[i] + ax[i] * dt, VY = vy[i] + ay[i] * dt, VZ = vz[i] + az[i] * dt;
      const sp = Math.sqrt(VX * VX + VY * VY + VZ * VZ);
      const lo = 6, hi = 21 + 7 * dusk;
      if (sp > hi) { VX *= hi / sp; VY *= hi / sp; VZ *= hi / sp; } else if (sp < lo) { VX *= lo / sp; VY *= lo / sp; VZ *= lo / sp; }
      vx[i] = VX; vy[i] = VY; vz[i] = VZ;
      px[i] += VX * dt; py[i] += VY * dt; pz[i] += VZ * dt;
      // coordinated turn: bank angle from the horizontal lateral acceleration
      const hl = Math.hypot(VX, VZ) || 1;
      const rx = -VZ / hl, rz = VX / hl;                            // right-hand side, horizontal
      const lat = ax[i] * rx + az[i] * rz;
      let target = Math.atan2(lat, 9.81);
      const aa = alarmAge[i];
      if (aa < ALARM_T) target += Math.sign((ex[i] * rx + ez[i] * rz) || 1) * 1.15 * (0.5 + 0.5 * alarmK[i]) * Math.sin(Math.PI * aa / ALARM_T);
      roll[i] += (Math.max(-1.45, Math.min(1.45, target)) - roll[i]) * Math.min(1, dt * 9);
      if (dusk > 0.2 && py[i] < 2.5) landed[i] = 1;                 // into the reeds
    }
  }
  return { out, falcon: falconOut, total, n };
}
