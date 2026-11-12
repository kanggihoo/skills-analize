/*
 * spray.js — the hand, the nozzle and the paint that lands.
 *
 * The aim point A(t) sweeps in arcs (a wrist/elbow pivot: the arc bows up in the middle of a pass and the nozzle is
 * farther from the wall at the ends). The spray leaves the nozzle as a cone of half-angle θ, so at nozzle distance h
 * its footprint on the wall is a Gaussian of σ = h·tanθ. Mass is conserved: the footprint's peak is rate/(2πσ²), so a
 * can held farther away paints wider and thinner.
 *
 *   D(x, t) = Σ_{s_j ≤ t} a_j · [ 0.92·G(x − A_j; σ_j) + 0.08·G(x − A_j; 2.6σ_j)/2.6² ],   a_j = K·rate_j·Δt/(2πσ_j²)
 *
 * The path is sampled at 120 Hz. Setup bakes the cumulative D (two channels: cream coat, coral coat) every 12 samples
 * (0.1 s) on a 5 px grid into a texture array; frame(t) looks up slice k = ⌊J/12⌋ and the shader adds the ≤ 11 core
 * Gaussians of the samples since that slice exactly, so the paint grows continuously under the moving nozzle.
 */
import { clamp, lerp, ramp } from '../_lib/stage.js';

export const SP = { T0: 1.5, T1: 6.0, HZ: 120, PER: 12, TAN: 0.27, HALO: 2.6, HALO_W: 0.08 };
export const NS = Math.round((SP.T1 - SP.T0) * SP.HZ);          // 540 samples
export const NSLICE = NS / SP.PER;                               // 45 → layers 0..45
export const DEP = { x0: -48, y0: 160, cell: 5, w: 236, h: 320 }; // grid: texel i centred at x0 + i·cell

export const COAT1 = [1.5, 4.42], COAT2 = [4.62, 6.0];
const P1 = (COAT1[1] - COAT1[0]) / 6, P2 = (COAT2[1] - COAT2[0]) / 3;
const K97 = Math.asin(0.97);
// near-constant speed across a pass, rounded turn at each end (a triangle wave with soft corners)
const sweep = (u) => Math.asin(0.97 * Math.cos(Math.PI * u)) / K97;

/** where the can aims, how far the nozzle is, how hard the trigger is pressed, which paint */
export function aimAt(t) {
  if (t < (COAT1[1] + COAT2[0]) / 2) {
    const u = clamp((t - COAT1[0]) / P1, 0, 6), s2 = Math.sin(Math.PI * u) ** 2;
    return {
      x: 540 + 322 * sweep(u),
      y: 628 + 470 * (u / 6) - 26 * s2,                 // rows drift down, each pass bows up
      h: 256 - 60 * s2,                                 // the arc brings the nozzle closer mid-pass
      r: ramp(t, COAT1[0], COAT1[0] + 0.07) * (1 - ramp(t, COAT1[1] - 0.07, COAT1[1])),
      coat: 0,
    };
  }
  const u = clamp((t - COAT2[0]) / P2, 0, 3), s2 = Math.sin(Math.PI * u) ** 2;
  return {
    x: 540 - 300 * sweep(u),
    y: 1178 - 28 * u - 20 * s2,                          // below the bottom line, a little higher each pass: a fade from below
    h: 362 - 50 * s2,
    r: ramp(t, COAT2[0], COAT2[0] + 0.07) * (1 - ramp(t, COAT2[1] - 0.08, COAT2[1])) * lerp(1, 0.6, u / 3),
    coat: 1,
  };
}

/** the 540 samples: time, aim, σ and the raw amount (K = 1) */
export function buildSamples() {
  const S = [];
  for (let j = 0; j < NS; j++) {
    const t = SP.T0 + (j + 0.5) / SP.HZ, A = aimAt(t), sig = A.h * SP.TAN;
    S.push({ t, x: A.x, y: A.y, h: A.h, sig, coat: A.coat, raw: (A.r / SP.HZ) / (2 * Math.PI * sig * sig), amt: 0 });
  }
  return S;
}

/** direct evaluation (calibration, drip seeds): D at a point from all samples with s_j ≤ t */
export function depositAt(S, x, y, t = 99) {
  const d = [0, 0];
  for (const s of S) {
    if (s.t > t) break;
    const q = (x - s.x) ** 2 + (y - s.y) ** 2, s2 = s.sig * s.sig;
    d[s.coat] += s.amt * ((1 - SP.HALO_W) * Math.exp(-q / (2 * s2)) + SP.HALO_W * Math.exp(-q / (2 * s2 * SP.HALO * SP.HALO)) / (SP.HALO * SP.HALO));
  }
  return d;
}

// float → IEEE half (round to nearest), for the HalfFloat texture array
const f32 = new Float32Array(1), u32 = new Uint32Array(f32.buffer);
function toHalf(v) {
  f32[0] = v;
  const x = u32[0], sign = (x >>> 16) & 0x8000;
  let e = ((x >>> 23) & 0xff) - 127 + 15, m = x & 0x7fffff;
  if (e <= 0) return sign;
  if (e >= 31) return sign | 0x7c00;
  m += 0x1000;
  if (m & 0x800000) { m = 0; e++; if (e >= 31) return sign | 0x7c00; }
  return sign | (e << 10) | (m >>> 13);
}

/** cumulative deposition every PER samples → Uint16Array (RG half floats), NSLICE + 1 layers */
export function bakeSlices(S) {
  const { x0, y0, cell, w, h } = DEP, N = w * h;
  const acc = new Float32Array(N * 2), out = new Uint16Array(N * 2 * (NSLICE + 1));
  const gx = new Float32Array(w), gy = new Float32Array(h);
  const add = (s, sig, amp) => {
    const R = sig * 3.3, i0 = Math.max(0, Math.floor((s.x - R - x0) / cell)), i1 = Math.min(w - 1, Math.ceil((s.x + R - x0) / cell));
    const j0 = Math.max(0, Math.floor((s.y - R - y0) / cell)), j1 = Math.min(h - 1, Math.ceil((s.y + R - y0) / cell));
    const k = 1 / (2 * sig * sig);
    for (let i = i0; i <= i1; i++) { const d = x0 + i * cell - s.x; gx[i] = Math.exp(-d * d * k); }
    for (let j = j0; j <= j1; j++) { const d = y0 + j * cell - s.y; gy[j] = amp * Math.exp(-d * d * k); }
    for (let j = j0; j <= j1; j++) {
      const row = j * w, g = gy[j];
      for (let i = i0; i <= i1; i++) acc[(row + i) * 2 + s.coat] += g * gx[i];
    }
  };
  for (let j = 0; j < NS; j++) {
    if (j % SP.PER === 0) { const o = (j / SP.PER) * N * 2; for (let i = 0; i < N * 2; i++) out[o + i] = toHalf(acc[i]); }
    const s = S[j];
    if (s.amt <= 0) continue;
    add(s, s.sig, s.amt * (1 - SP.HALO_W));
    add(s, s.sig * SP.HALO, (s.amt * SP.HALO_W) / (SP.HALO * SP.HALO));
  }
  const o = NSLICE * N * 2;
  for (let i = 0; i < N * 2; i++) out[o + i] = toHalf(acc[i]);
  return out;
}

/** slice index and the samples since that slice (core Gaussians the shader adds exactly) */
export function remainder(S, t, out /* Float32Array(48) */) {
  const J = clamp(Math.floor((t - SP.T0) * SP.HZ + 0.5), 0, NS);
  const k = Math.floor(J / SP.PER);
  let n = 0;
  for (let j = k * SP.PER; j < J && n < 12; j++) {
    const s = S[j];
    if (s.amt <= 0) continue;
    out[n * 4] = s.x; out[n * 4 + 1] = s.y; out[n * 4 + 2] = 1 / (2 * s.sig * s.sig);
    out[n * 4 + 3] = (s.coat ? -1 : 1) * s.amt * (1 - SP.HALO_W);
    n++;
  }
  return { slice: k, n };
}
