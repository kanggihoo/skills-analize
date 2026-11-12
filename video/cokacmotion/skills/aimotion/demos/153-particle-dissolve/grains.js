/*
 * grains.js — the surface grains, baked once in setup (pure: no DOM, no clock, seeded randomness only).
 *
 *   1. sample N points on the source's outer wall and N points on the target (MeshSurfaceSampler, seeded)
 *   2. birth  b = the time the dissolve field crosses its threshold at the source point (field.js crossing)
 *      arrive a = the time the reform field crosses its threshold at the target point
 *   3. pair the i-th grain to leave with the i-th point to close (both orders sorted, the target order jittered)
 *   4. integrate each grain from its birth through a flow (swirl + updraft + curl noise) with drag, and store
 *      KEYS positions, KEY_DT apart, in a float texture: the vertex shader reads them back (Catmull-Rom) at t − b
 *   5. in the last tc seconds before a, the shader eases the grain from its path onto the target point
 * grainPos() is the same position function in JS (the vertex shader's twin), for checks outside the browser.
 */
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { SRC, DST, crossing, vnoise } from './field.js';

export const N = 15000;
export const KEYS = 45, KEY_DT = 1 / 6, SUB = 6;    // 45 keys = 7.33 s of path per grain; 6 integration steps per key
export const PW = 2048;                              // path texture width (texels)
export const APPROACH = 0.34, SPIN = 5.0;            // landing: start this far out along the normal, swirl this much (rad)

/** mulberry32, same as the stage's rand (kept here so this file runs outside the page too) */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const smooth = (v) => { v = v < 0 ? 0 : v > 1 ? 1 : v; return v * v * (3 - 2 * v); };

// ---------------------------------------------------------------- the flow
export const FLOW = {
  centre: [-0.08, 1.95, -0.05], yaw: 0.35,   // swirl centre and the yaw of its plane (rad about y)
  a: 0.62, b: 0.78, depth: 0.9,            // swirl half-width, half-height, depth falloff
  omega: 0.95,                             // swirl strength (stream-function amplitude)
  updraft: 0.8, sigma: 0.6,                // rising column around the vase
  breeze: [0.03, 0, -0.03],
  curlFreq: 1.3, curlRms: 0.28,            // curl noise: frequency of the potential, RMS speed
  drag: [0.25, 0.45], sink: 0.2,           // relaxation time range (s) and settling acceleration
};
const G0 = [-2.4, -0.4, -1.8], GN = [49, 45, 45], GH = 0.1;   // curl grid: origin, node counts, spacing

/** curl noise: a vector potential ψ (three noise channels) on a grid, v = ∇ × ψ by central differences, scaled to an RMS */
export function buildCurlGrid() {
  const [nx, ny, nz] = GN, n = nx * ny * nz, f = FLOW.curlFreq;
  const psi = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
  const OFF = [[0, 0, 0], [31.4, 7.2, 13.9], [5.7, 23.1, 41.3]];
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = (G0[0] + i * GH) * f, y = (G0[1] + j * GH) * f, z = (G0[2] + k * GH) * f;
    const q = (k * ny + j) * nx + i;
    for (let c = 0; c < 3; c++) {
      const o = OFF[c];
      psi[c][q] = vnoise(x + o[0], y + o[1], z + o[2]) + 0.5 * vnoise(2 * x + o[1], 2 * y + o[2], 2 * z + o[0]);
    }
  }
  const at = (c, i, j, k) => psi[c][(Math.min(nz - 1, Math.max(0, k)) * ny + Math.min(ny - 1, Math.max(0, j))) * nx + Math.min(nx - 1, Math.max(0, i))];
  const vel = new Float32Array(n * 3);
  let ss = 0;
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const d = (c, di, dj, dk) => (at(c, i + di, j + dj, k + dk) - at(c, i - di, j - dj, k - dk)) / (2 * GH);
    const vx = d(2, 0, 1, 0) - d(1, 0, 0, 1), vy = d(0, 0, 0, 1) - d(2, 1, 0, 0), vz = d(1, 1, 0, 0) - d(0, 0, 1, 0);
    const q = ((k * ny + j) * nx + i) * 3;
    vel[q] = vx; vel[q + 1] = vy; vel[q + 2] = vz;
    ss += vx * vx + vy * vy + vz * vz;
  }
  const s = FLOW.curlRms / Math.sqrt(ss / n);
  for (let q = 0; q < vel.length; q++) vel[q] *= s;
  return vel;
}

/** the flow velocity at (x, y, z) and absolute time T → out */
export function makeFlow(curl) {
  const [nx, ny, nz] = GN, F = FLOW;
  const e1 = [Math.cos(F.yaw), 0, -Math.sin(F.yaw)], ax = [Math.sin(F.yaw), 0, Math.cos(F.yaw)];
  const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
  return (x, y, z, T, out, zFront = 1.4) => {
    // ① swirl from a stream function ψ = Ω·exp(−(d1/a)² − (d2/b)² − (d3/c)²) in a yawed plane: (∂ψ/∂d2, −∂ψ/∂d1)
    const cx = F.centre[0] + 0.06 * Math.sin(0.55 * T), cy = F.centre[1] + 0.07 * Math.sin(0.4 * T + 1.0);
    const dx = x - cx, dy = y - cy, dz = z - F.centre[2];
    const d1 = dx * e1[0] + dz * e1[2], d3 = dx * ax[0] + dz * ax[2];
    const E = 2 * F.omega * Math.exp(-((d1 / F.a) ** 2) - (dy / F.b) ** 2 - (d3 / F.depth) ** 2);
    const s1 = (-E * dy) / (F.b * F.b), s2 = (E * d1) / (F.a * F.a);
    let ux = s1 * e1[0], uy = s2, uz = s1 * e1[2];
    // ② a rising column around the vase
    uy += F.updraft * Math.exp(-(x * x + z * z) / (F.sigma * F.sigma)) * smooth((y + 0.35) / 0.55) * (1 - smooth((y - 1.5) / 0.8));
    // ③ breeze
    ux += F.breeze[0]; uy += F.breeze[1]; uz += F.breeze[2];
    // ④ curl noise, trilinear from the grid
    const gx = cl((x - G0[0]) / GH, 0, nx - 1.001), gy = cl((y - G0[1]) / GH, 0, ny - 1.001), gz = cl((z - G0[2]) / GH, 0, nz - 1.001);
    const i = Math.floor(gx), j = Math.floor(gy), k = Math.floor(gz), fx = gx - i, fy = gy - j, fz = gz - k;
    const q000 = ((k * ny + j) * nx + i) * 3, sx = 3, sy = nx * 3, sz = nx * ny * 3;
    for (let c = 0; c < 3; c++) {
      const q = q000 + c;
      const c00 = curl[q] + (curl[q + sx] - curl[q]) * fx, c10 = curl[q + sy] + (curl[q + sy + sx] - curl[q + sy]) * fx;
      const c01 = curl[q + sz] + (curl[q + sz + sx] - curl[q + sz]) * fx, c11 = curl[q + sz + sy] + (curl[q + sz + sy + sx] - curl[q + sz + sy]) * fx;
      const lo = c00 + (c10 - c00) * fy, hi = c01 + (c11 - c01) * fy;
      out[c] = lo + (hi - lo) * fz;
    }
    ux += out[0]; uy += out[1]; uz += out[2];
    // ⑤ soft walls: table, back wall, toward the lens, the frame's sides, the ceiling of the shot
    if (y < 0.14) uy += (0.14 - y) * 7;
    if (z < -1.0) uz += (-1.0 - z) * 6;
    if (z > zFront) uz -= (z - zFront) * 3;
    if (Math.abs(x) > 0.8) ux -= Math.sign(x) * (Math.abs(x) - 0.8) * 4;
    if (y > 3.1) uy -= (y - 3.1) * 4;
    out[0] = ux; out[1] = uy; out[2] = uz;
    return out;
  };
}

// ---------------------------------------------------------------- sampling
export function sampleSurface(geo, n, seed, weight) {
  const sm = new MeshSurfaceSampler(new THREE.Mesh(geo));
  if (weight) sm.setWeightAttribute(weight);
  sm.setRandomGenerator(rng(seed));     // the default is Math.random
  sm.build();
  const P = new Float32Array(n * 3), Nn = new Float32Array(n * 3);
  const p = new THREE.Vector3(), q = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    sm.sample(p, q);
    p.toArray(P, i * 3); q.normalize().toArray(Nn, i * 3);
  }
  return { P, N: Nn };
}

// ---------------------------------------------------------------- the bake
export function bakeGrains(srcGeo, dstGeo) {
  const src = sampleSurface(srcGeo, N, 15303);
  const dst = sampleSurface(dstGeo, N, 15304, 'weight');
  const birth = new Float32Array(N), arrive = new Float32Array(N);
  let back = 0;
  for (let i = 0; i < N; i++) {
    const [b, nb] = crossing(SRC, src.P[i * 3], src.P[i * 3 + 1], src.P[i * 3 + 2]);
    const [a, na] = crossing(DST, dst.P[i * 3], dst.P[i * 3 + 1], dst.P[i * 3 + 2]);
    birth[i] = b; arrive[i] = a; back += nb + na;
  }
  // first to leave ↔ first to land (the landing order jittered so neighbours on the vase spread over the flower)
  const RJ = rng(15305);
  const jit = Float32Array.from({ length: N }, () => (RJ() - 0.5) * 0.5);
  const bOrder = [...Array(N).keys()].sort((x, y) => birth[x] - birth[y]);
  const aOrder = [...Array(N).keys()].sort((x, y) => arrive[x] + jit[x] - (arrive[y] + jit[y]));

  const flow = makeFlow(buildCurlGrid());
  const PH = Math.ceil((N * KEYS) / PW);
  const path = new Float32Array(PW * PH * 4);
  const aT = new Float32Array(N * 4), aDst = new Float32Array(N * 3), aApp = new Float32Array(N * 3), aR = new Float32Array(N * 4);
  const R = rng(15306), U = [0, 0, 0], dt = KEY_DT / SUB;
  for (let g = 0; g < N; g++) {
    const si = bOrder[g], ti = aOrder[g], b = birth[si], a = arrive[ti];
    let x = src.P[si * 3], y = src.P[si * 3 + 1], z = src.P[si * 3 + 2];
    // released along the surface normal, a little upward
    const sp = 0.2 + 0.3 * R();
    let vx = src.N[si * 3] * sp + (R() - 0.5) * 0.1;
    let vy = src.N[si * 3 + 1] * sp + 0.22 + (R() - 0.5) * 0.1;
    let vz = src.N[si * 3 + 2] * sp + (R() - 0.5) * 0.1;
    // each grain has its own small bias and drag, so grains that leave together spread into a stream;
    // one in twelve drifts toward the lens (the out-of-focus foreground of the shot)
    const front = R() < 1 / 12;
    const jx = (R() - 0.5) * 0.14, jy = (R() - 0.5) * 0.1, jz = (R() - 0.5) * 0.14 + (front ? 0.5 + 0.3 * R() : 0);
    const zFront = front ? 3.0 : 1.4;
    const tau = FLOW.drag[0] + (FLOW.drag[1] - FLOW.drag[0]) * R();
    for (let k = 0; k < KEYS; k++) {
      const o = (g * KEYS + k) * 4;
      path[o] = x; path[o + 1] = y; path[o + 2] = z; path[o + 3] = 1;
      if (k === KEYS - 1) break;
      for (let s = 0; s < SUB; s++) {
        flow(x, y, z, b + (k * SUB + s) * dt, U, zFront);
        vx += ((U[0] + jx - vx) / tau) * dt;
        vy += ((U[1] + jy - vy) / tau - FLOW.sink) * dt;
        vz += ((U[2] + jz - vz) / tau) * dt;
        x += vx * dt; y += vy * dt; z += vz * dt;
      }
    }
    const tc = Math.max(0.7, Math.min(1.3 + 0.6 * R(), a - b - 0.6));
    aT.set([b, a, tc, g], g * 4);
    aDst.set([dst.P[ti * 3], dst.P[ti * 3 + 1], dst.P[ti * 3 + 2]], g * 3);
    const nx = dst.N[ti * 3], ny = dst.N[ti * 3 + 1] + 0.7, nz = dst.N[ti * 3 + 2], nl = Math.hypot(nx, ny, nz) || 1;
    aApp.set([nx / nl, ny / nl, nz / nl], g * 3);
    aR.set([0.6 + 0.8 * R() * R() + 0.2 * R(), R(), R(), 5 + 9 * R()], g * 4);
  }
  return { path, PH, aT, aDst, aApp, aR, back };
}

/** the vertex shader's grain position, in JS (Catmull-Rom over the keys, then the eased landing) */
export function grainPos(B, g, t, out) {
  const b = B.aT[g * 4], a = B.aT[g * 4 + 1], tc = B.aT[g * 4 + 2];
  const x = Math.min(Math.max((t - b) / KEY_DT, 0), KEYS - 1), k = Math.min(Math.floor(x), KEYS - 2), f = x - k;
  const key = (kk, c) => B.path[(g * KEYS + Math.min(Math.max(kk, 0), KEYS - 1)) * 4 + c];
  let c = Math.min(Math.max((t - (a - tc)) / tc, 0), 1);
  c = c * c * c * (c * (c * 6 - 15) + 10);
  for (let i = 0; i < 3; i++) {
    const p0 = key(k - 1, i), p1 = key(k, i), p2 = key(k + 1, i), p3 = key(k + 2, i);
    const p = 0.5 * (2 * p1 + (p2 - p0) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (3 * p1 - p0 - 3 * p2 + p3) * f * f * f);
    const tg = B.aDst[g * 3 + i] + B.aApp[g * 3 + i] * APPROACH * (1 - c) * (1 - c);
    out[i] = p + (tg - p) * c;
  }
  // the landing swirls about the lotus axis: zero turn at both ends, so it leaves the path and lands on the point
  const phi = SPIN * c * (1 - c), cs = Math.cos(phi), sn = Math.sin(phi), x0 = out[0];
  out[0] = cs * x0 - sn * out[2]; out[2] = sn * x0 + cs * out[2];
  return out;
}
