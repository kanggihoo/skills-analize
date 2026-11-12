/*
 * 35 · terrain.js — the untouched mountain the rain will carve (pure JS, seeded, no DOM: also runs in node).
 * A ridged multifractal (Musgrave) on a domain-warped plane, shaped by an asymmetric massif mask: a long gentle
 * south face toward the camera, a steep north face, foothills, and a plain that tilts gently south so the
 * rivers have somewhere to go. Heights are in grid cells (the simulation's unit of length).
 * Also returns the initial regolith (soft, erodible layer): thick on gentle low ground, absent on crags.
 */

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** 2D gradient noise (Perlin, quintic fade), seeded permutation and gradients; range ≈ [-0.7, 0.7] */
function gradientNoise(seed) {
  const r = mulberry32(seed);
  const perm = new Uint16Array(512), gx = new Float32Array(256), gy = new Float32Array(256);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  for (let i = 0; i < 256; i++) { const a = r() * Math.PI * 2; gx[i] = Math.cos(a); gy[i] = Math.sin(a); }
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const h00 = perm[X + perm[Y]], h10 = perm[X + 1 + perm[Y]], h01 = perm[X + perm[Y + 1]], h11 = perm[X + 1 + perm[Y + 1]];
    const n00 = gx[h00] * xf + gy[h00] * yf;
    const n10 = gx[h10] * (xf - 1) + gy[h10] * yf;
    const n01 = gx[h01] * xf + gy[h01] * (yf - 1);
    const n11 = gx[h11] * (xf - 1) + gy[h11] * (yf - 1);
    const u = fade(xf), v = fade(yf);
    const a = n00 + (n10 - n00) * u, b = n01 + (n11 - n01) * u;
    return a + (b - a) * v;
  };
}

const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/**
 * makeTerrain(N, seed) → { rock: Float32Array(N*N), soft: Float32Array(N*N), hmax }
 * index = j * N + i, i east, j north (j = 0 is the edge nearest the camera)
 */
export function makeTerrain(N, seed = 35) {
  const nz = gradientNoise(seed), nw = gradientNoise(seed + 1), nf = gradientNoise(seed + 2);
  const HMAX = 0.2 * N;
  const fbm = (n, x, y, oct) => { let s = 0, a = 0.5, f = 1; for (let o = 0; o < oct; o++) { s += a * n(x * f + o * 17.3, y * f - o * 9.1); f *= 2.02; a *= 0.5; } return s; };
  const rock = new Float32Array(N * N), soft = new Float32Array(N * N);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const u = (i + 0.5) / N, v = (j + 0.5) / N;
      // domain warp: the ridges meander instead of following the noise lattice
      const qx = u + 0.085 * fbm(nw, u * 2.6, v * 2.6, 4), qy = v + 0.085 * fbm(nw, u * 2.6 + 7.3, v * 2.6 + 1.7, 4);
      // ridged multifractal: each octave sharpened (1-|n|)², weighted by the octave above (ridges stay on ridges)
      let sum = 0, freq = 2.4, amp = 0.55, w = 1;
      for (let o = 0; o < 8; o++) {
        let n = 1 - Math.abs(nz(qx * freq + o * 31.7, qy * freq - o * 12.9)) * 1.45;
        n = Math.max(n, 0); n *= n; n *= w;
        w = Math.min(1, Math.max(0, n * 1.7));
        sum += n * amp;
        freq *= 2.04; amp *= 0.5;
      }
      // massif: a crest running roughly east–west at v ≈ 0.64, long gentle south face, short steep north face
      const crest = 0.64 + 0.05 * Math.sin(qx * 5.1 + 0.7) - 0.03 * Math.cos(qx * 9.3);
      const dv = qy - crest;
      const sv = dv < 0 ? dv / 0.36 : dv / 0.2;
      const su = (qx - 0.5) / 0.44;
      const r = Math.sqrt(sv * sv + su * su * su * su * 0.9 + su * su * 0.35);
      const mask = Math.pow(1 - sstep(0.0, 1.0, r), 1.15);
      // a lesser spur toward the south-west for depth and a second drainage basin
      const sx = (qx - 0.27) / 0.16, sy = (qy - 0.43) / 0.13;
      const spur = 0.55 * Math.exp(-(sx * sx + sy * sy) * 1.3);
      const m = Math.max(mask, spur);
      const foot = 0.5 + 0.5 * fbm(nf, u * 5, v * 5, 4);
      let h = HMAX * (Math.pow(m, 1.25) * (0.22 + 1.05 * sum) + 0.035 * foot * (1 - m) + 0.05 * v * (1 - m));
      const e = sstep(0.0, 0.07, Math.min(u, 1 - u, v, 1 - v));
      h = h * e + 0.3;
      rock[j * N + i] = h;
    }
  }
  // regolith from local slope and altitude
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const at = (x, y) => rock[Math.min(N - 1, Math.max(0, y)) * N + Math.min(N - 1, Math.max(0, x))];
      const gx = (at(i + 1, j) - at(i - 1, j)) * 0.5, gy = (at(i, j + 1) - at(i, j - 1)) * 0.5;
      const slope = Math.hypot(gx, gy), h = rock[j * N + i] / HMAX;
      soft[j * N + i] = 1.6 * (1 - sstep(0.12, 0.7, slope)) * (1 - sstep(0.35, 0.7, h));
    }
  }
  return { rock, soft, hmax: HMAX };
}
