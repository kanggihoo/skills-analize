/*
 * 28 · the galaxy-encounter model, shared by main.js (browser) and a Node check of the orbit and framing.
 * Units: G = 1. Two galaxies, each = a softened core (bulge + dark halo, mass MC, felt analytically) and a
 * particle disc + bulge (total mass MD, felt through the particle-mesh field on the GPU).
 * The two cores move on a softened two-body orbit integrated here in JS (leapfrog, many sub-steps): it is cheap,
 * exact to replay, and gives the GPU the core positions at every particle half step.
 */

export const N = 1 << 20;                 // 1,048,576 particles
export const FPS = 30, SUB = 3;           // particle sub-steps per video frame
export const DTF = 1.5;                   // simulation time per video frame
export const H = DTF / SUB;               // particle step
export const MC = 1.0, MD = 0.3;          // core mass, particle mass per galaxy
export const EPS_C = 1.15;                // core softening felt by particles
export const EPS_CC = 2.2;                // core–core softening (extended halos)
export const RD = 2.6, RMAX = 13.5;       // disc scale length, truncation
export const BULGE_B = 0.75;              // Plummer scale of the particle bulge
export const PERI = 13;                   // pericentre distance (≈ the disc radius: a deep, prograde passage)
export const ECC = 0.6;                   // a bound orbit: after the passage they recede slowly (apocentre 52)
export const T_PERI = 2.8 * FPS * DTF;    // simulation time from t = 0 to pericentre (video 2.8 s)

// PM grid (cell centres): GX × GY × GZ cells of size CELL, centred on the origin; the orbit lies in the xz plane
export const GX = 32, GY = 12, GZ = 32, CELL = 6.0;
export const GRID_MIN = [-GX * CELL / 2, -GY * CELL / 2, -GZ * CELL / 2];
export const EPS_PM = 1.0 * CELL;         // softening of the mesh Green's function (≈ one cell)

export function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => mul(a, 1 / Math.hypot(a[0], a[1], a[2]));
export const vec = { sub, add, mul, dot, cross, norm };

/** Plummer acceleration at p from mass m at c, softening eps */
export function plummer(p, c, m, eps) {
  const d = sub(c, p), r2 = dot(d, d) + eps * eps;
  return mul(d, m / (r2 * Math.sqrt(r2)));
}

/**
 * The two-body orbit of the galaxies (each of mass MC + MD), softened by EPS_CC.
 * Start at pericentre (relative position along +x, relative velocity along +z), integrate backwards T_PERI, then
 * forwards over the whole clip. Returns core positions and velocities at every half particle step (time s·H/2).
 */
export function coreOrbit(frames) {
  const Mt = 2 * (MC + MD);
  const vp = Math.sqrt(Mt * (1 + ECC) / PERI);
  // relative coordinates r = x1 − x0 (equal masses: x0 = −r/2, x1 = +r/2)
  let r = [PERI, 0, 0], v = [0, 0, vp];
  const acc = (r) => { const r2 = dot(r, r) + EPS_CC * EPS_CC; return mul(r, -Mt / (r2 * Math.sqrt(r2))); };
  const leap = (h) => {
    v = add(v, mul(acc(r), h / 2)); r = add(r, mul(v, h)); v = add(v, mul(acc(r), h / 2));
  };
  const k = 40, h = H / 2 / k;             // 40 leapfrog steps per half particle step
  const nBack = Math.round(T_PERI / (H / 2)) * k;
  for (let i = 0; i < nBack; i++) leap(-h);
  const halfSteps = frames * SUB * 2 + 4;
  const out = new Float64Array(halfSteps * 12);  // x0, x1, v0, v1
  for (let s = 0; s < halfSteps; s++) {
    out.set([...mul(r, -0.5), ...mul(r, 0.5), ...mul(v, -0.5), ...mul(v, 0.5)], s * 12);
    for (let i = 0; i < k; i++) leap(h);
  }
  const v3 = (o) => [out[o], out[o + 1], out[o + 2]];
  return {
    halfSteps,
    at(s) { const o = s * 12; return { x0: v3(o), x1: v3(o + 3), v0: v3(o + 6), v1: v3(o + 9) }; },
    sep(s) { const o = s * 12; return Math.hypot(out[o + 3] - out[o], out[o + 4] - out[o + 1], out[o + 5] - out[o + 2]); },
  };
}

/** disc orientation of galaxy g: unit spin axis (the disc rotates counter-clockwise about it) */
export function discAxis(g) {
  // the orbital angular momentum points along -y (r = +x, v = +z at pericentre). Both discs are prograde-ish:
  // galaxy 0 almost in the orbital plane (long, sweeping tail), galaxy 1 steeply inclined (a tail that
  // rises out of the plane and a bridge that crosses it)
  const tilt = [18, 58][g] * Math.PI / 180, az = [25, 200][g] * Math.PI / 180;
  return norm([Math.sin(tilt) * Math.cos(az), -Math.cos(tilt), Math.sin(tilt) * Math.sin(az)]);
}

/** a basis (u, w) spanning the disc plane of axis n */
export function discBasis(n) {
  const ref = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 0, 1];
  const u = norm(cross(n, ref));
  const w = cross(n, u);
  return [u, w];
}

/*
 * Particles. Galaxy g = (i < N/2 ? 0 : 1). Populations (attr bits 1–3):
 *   0 bulge (old, warm) · 1 old disc · 2 young disc (blue, star-forming gas tracer) · 3 HII knots (rose) · 4 blue giants
 * pos.xyz relative to the galaxy centre in the disc frame is turned into world space; velocities are set on the
 * GPU from the actual force field (so the discs start in equilibrium with the forces the simulation applies).
 * Here we only fill the random part of each velocity: vel.xyz = a unit random vector, vel.w = dispersion fraction.
 * attr: bit 0 galaxy · bits 1–3 population · bits 4–11 brightness · bits 12–19 colour jitter · bits 20–27 size
 */
export function makeParticles(rand, n = N) {
  const R = rand(28028);
  const pos = new Float32Array(n * 4), vel = new Float32Array(n * 4), attr = new Uint32Array(n);
  const gauss = () => { const u = Math.max(R(), 1e-9), v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const bases = [0, 1].map((g) => { const ax = discAxis(g); return [ax, ...discBasis(ax)]; });
  const knots = [0, 1].map(() => Array.from({ length: 260 }, () => {
    let r; do { r = -RD * 1.1 * Math.log(Math.max(R() * R(), 1e-12)); } while (r > RMAX * 0.9 || r < 1.6);
    const ph = Math.floor(R() * 2) * Math.PI + Math.log(r / 1.2) / 0.38 + gauss() * 0.15;
    return [r * Math.cos(ph), r * Math.sin(ph)];
  }));
  for (let i = 0; i < n; i++) {
    const g = i < n / 2 ? 0 : 1;
    const [ax, u, w] = bases[g];
    const roll = R();
    let pop = roll < 0.13 ? 0 : roll < 0.62 ? 1 : roll < 0.955 ? 2 : roll < 0.985 ? 3 : 4;
    let p, sigma;
    if (pop === 0) {
      // Plummer sphere, slightly flattened along the axis, truncated
      let r;
      do { r = BULGE_B / Math.sqrt(Math.pow(Math.max(R(), 1e-6), -2 / 3) - 1); } while (r > 4.5);
      const z = 2 * R() - 1, ph = 2 * Math.PI * R(), s = Math.sqrt(1 - z * z);
      p = [r * s * Math.cos(ph), r * s * Math.sin(ph) * 0.8, r * z];        // disc frame (x, y in plane, z along axis)
      sigma = 0.55;
    } else {
      // exponential disc (radius ~ Gamma(2, RD)), young stars and knots concentrated toward two spiral arms
      let r;
      do { r = -RD * Math.log(Math.max(R() * R(), 1e-12)); } while (r > RMAX || r < 0.6);
      let ph = 2 * Math.PI * R();
      if (pop >= 2) {
        const arm = Math.floor(R() * 2) * Math.PI + Math.log(r / 1.2) / 0.38;   // log spiral, pitch ~21°
        const spread = pop === 3 ? 0.18 : pop === 4 ? 0.3 : 0.55;
        if (R() < 0.75) ph = arm + gauss() * spread;
      }
      const thick = (pop === 1 ? 0.22 : 0.1) * (1 + r / RMAX);
      p = [r * Math.cos(ph), r * Math.sin(ph), gauss() * thick];
      sigma = pop === 1 ? 0.12 : 0.06;
    }
    // HII knots come in clusters: a knot sits near one of a few hundred cluster centres on the arms
    if (pop === 3) {
      const c = knots[g][Math.floor(R() * knots[g].length)];
      p = [c[0] + gauss() * 0.22, c[1] + gauss() * 0.22, gauss() * 0.06];
    }
    const wp = add(add(mul(u, p[0]), mul(w, p[1])), mul(ax, p[2]));
    pos.set([wp[0], wp[1], wp[2], g], i * 4);
    const d = norm([gauss(), gauss(), gauss()]);
    vel.set([d[0], d[1], d[2], sigma * Math.abs(gauss())], i * 4);
    // brightness: heavy-tailed, a few bright stars
    const b = Math.min(255, Math.floor(255 * Math.pow(R(), 3.2) + (pop === 4 ? 160 : pop === 3 ? 90 : 20)));
    const cj = Math.floor(R() * 256);
    const sz = Math.floor(R() * 256);
    attr[i] = g | (pop << 1) | (b << 4) | (cj << 12) | (sz << 20);
  }
  return { pos, vel, attr };
}
