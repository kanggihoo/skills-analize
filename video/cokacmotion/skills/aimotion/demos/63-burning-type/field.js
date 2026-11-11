/*
 * 63 · field.js — when does the fire reach each point of the sheet? Pure JS (no DOM), runs once in setup.
 *
 *   speed    fibrous paper: value-noise fbm stretched along a slowly wandering fibre direction, times a few thick,
 *            slow patches. Fire on a hanging sheet climbs fast and creeps sideways and down: the speed of an
 *            edge depends on its direction (UP / SIDE / DOWN px/s) and burns ~25 % faster along the fibres.
 *            Inside the (dilated) letters the treated paper does not burn — heat only soaks through slowly
 *            (CONDUCT px/s), which is how fire reaches the counters inside ㅇ or ㅁ, a moment after it has
 *            flowed around the letter.
 *   arrival  Dijkstra on the W×H grid with a 16-neighbour stencil (8 compass + 8 knight moves), so the front
 *            is round instead of an octagon; the edge time is length / harmonic-mean speed of the cells it
 *            crosses. Sources ignite at their own times.
 * Output: T (s, Float32Array, unreached = NEVER) and the paper speed per cell (px/s, for the shading).
 */

export const NEVER = 60;

// integer hash → [0, 1)
function hash2(x, y, s) {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(s | 0, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, s, oct = 4) {
  let f = 0, amp = 0.5, norm = 0;
  for (let o = 0; o < oct; o++) { f += amp * vnoise(x, y, s + o * 101); norm += amp; x *= 2.03; y *= 2.03; amp *= 0.5; }
  return f / norm;
}

export const FIRE = {
  UP: 285, SIDE: 142, DOWN: 82,      // px/s on average paper, by direction (stage px)
  FIBRE: 0.25,                       // extra speed along the fibres
  CONDUCT: 42,                       // px/s through the treated (letter) paper — heat only, it never burns
};

/**
 * W, H: grid size; cell: stage px per cell; solid(i, j) → true inside the fire-resistant letters;
 * sources: [{ x, y, t0, r }] in stage px / s.
 */
export function arrivalField(W, H, cell, solid, sources, seed = 63) {
  const N = W * H;
  const sp = new Float32Array(N);        // isotropic paper speed factor (1 = average)
  const fx = new Float32Array(N), fy = new Float32Array(N);   // fibre direction
  const hard = new Uint8Array(N);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const k = j * W + i, X = (i + 0.5) * cell, Y = (j + 0.5) * cell;
    // fibres wander around ≈ 75° from horizontal
    const th = 1.31 + 0.55 * (fbm(X * 0.0016, Y * 0.0016, seed + 7, 2) - 0.5);
    const ux = Math.cos(th), uy = -Math.sin(th);
    fx[k] = ux; fy[k] = uy;
    const along = X * ux + Y * uy, across = -X * uy + Y * ux;
    const fib = fbm(along * 0.010, across * 0.055, seed, 4);                      // long streaks
    const blot = fbm(X * 0.0042, Y * 0.0042, seed + 31, 3);                       // thick, slow patches
    let f = (0.50 + 1.05 * fib * fib + 0.25 * fib) * (1 - 0.55 * smooth01((blot - 0.58) / 0.16));
    sp[k] = f;
    if (solid(i, j)) hard[k] = 1;
  }
  // 16-neighbour stencil: offsets, lengths (cells) and the two corridor cells a knight move passes
  const OFF = [];
  for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1],
    [1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]) {
    const len = Math.sqrt(di * di + dj * dj);
    let c1 = null, c2 = null;
    if (Math.abs(di) + Math.abs(dj) === 3) {
      if (Math.abs(dj) === 2) { c1 = [0, Math.sign(dj)]; c2 = [di, Math.sign(dj)]; }
      else { c1 = [Math.sign(di), 0]; c2 = [Math.sign(di), dj]; }
    }
    const ux = di / len, uy = dj / len;
    // direction factor: fast upward (−y), slower sideways, slowest down
    const up = Math.max(0, -uy), dn = Math.max(0, uy);
    const dir = FIRE.SIDE + (FIRE.UP - FIRE.SIDE) * Math.pow(up, 1.5) - (FIRE.SIDE - FIRE.DOWN) * Math.pow(dn, 1.5);
    OFF.push({ di, dj, len, ux, uy, dir, c1, c2 });
  }
  const cellSpeed = (k, o) => {
    if (hard[k]) return FIRE.CONDUCT;
    const al = Math.abs(o.ux * fx[k] + o.uy * fy[k]);
    return o.dir * sp[k] * (1 + FIRE.FIBRE * al * al);
  };

  const T = new Float64Array(N).fill(NEVER);   // Float64 like the heap keys (a rounded copy would fail the lazy check)
  // binary heap of (time, cell), lazy deletion
  let cap = 1 << 20, hk = new Float64Array(cap), hv = new Int32Array(cap), hn = 0;
  const push = (key, v) => {
    if (hn === cap) { cap *= 2; const nk = new Float64Array(cap); nk.set(hk); hk = nk; const nv = new Int32Array(cap); nv.set(hv); hv = nv; }
    let i = hn++;
    while (i > 0) { const p = (i - 1) >> 1; if (hk[p] <= key) break; hk[i] = hk[p]; hv[i] = hv[p]; i = p; }
    hk[i] = key; hv[i] = v;
  };
  const pop = () => {
    const v = hv[0]; hn--;
    if (hn > 0) {
      const key = hk[hn], val = hv[hn];
      let i = 0;
      for (;;) {
        let c = 2 * i + 1;
        if (c >= hn) break;
        if (c + 1 < hn && hk[c + 1] < hk[c]) c++;
        if (hk[c] >= key) break;
        hk[i] = hk[c]; hv[i] = hv[c]; i = c;
      }
      hk[i] = key; hv[i] = val;
    }
    return v;
  };
  for (const s of sources) {
    const r = Math.ceil(s.r / cell), ci = Math.floor(s.x / cell), cj = Math.floor(s.y / cell);
    for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
      const i = ci + di, j = cj + dj;
      if (i < 0 || j < 0 || i >= W || j >= H) continue;
      const d = Math.sqrt(di * di + dj * dj) * cell;
      if (d > s.r) continue;
      const t = s.t0 + d / 260;
      const k = j * W + i;
      if (t < T[k]) { T[k] = t; push(t, k); }
    }
  }
  while (hn > 0) {
    const key = hk[0], k = pop();
    if (key > T[k]) continue;
    const i = k % W, j = (k / W) | 0;
    for (const o of OFF) {
      const ni = i + o.di, nj = j + o.dj;
      if (ni < 0 || nj < 0 || ni >= W || nj >= H) continue;
      const nk = nj * W + ni;
      // harmonic mean of the speeds of the cells the edge crosses
      let inv = 1 / cellSpeed(k, o) + 1 / cellSpeed(nk, o), n = 2;
      if (o.c1) {
        const a = (j + o.c1[1]) * W + i + o.c1[0], b = (j + o.c2[1]) * W + i + o.c2[0];
        inv += 1 / cellSpeed(a, o) + 1 / cellSpeed(b, o); n = 4;
      }
      const t = key + o.len * cell * inv / n;
      if (t < T[nk]) { T[nk] = t; push(t, nk); }
    }
  }
  // the local front speed the shading uses to turn "seconds since the front" into "px behind the front":
  // eikonal |∇T| = 1/F, from central differences (one-sided at the border, clamped where fronts collide)
  const F = new Float32Array(N);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const k = j * W + i;
    if (T[k] >= NEVER) { F[k] = FIRE.SIDE; continue; }
    const g = (a, b, d) => (a < NEVER && b < NEVER ? (a - b) / (d * cell) : 0);
    const L = i > 0 ? T[k - 1] : T[k], R = i < W - 1 ? T[k + 1] : T[k], U = j > 0 ? T[k - W] : T[k], Dn = j < H - 1 ? T[k + W] : T[k];
    const gx = g(R, L, (i > 0) + (i < W - 1)), gy = g(Dn, U, (j > 0) + (j < H - 1));
    F[k] = 1 / Math.max(Math.sqrt(gx * gx + gy * gy), 1 / 900);
    if (F[k] < 20) F[k] = 20;
  }
  return { T: Float32Array.from(T), F, sp };
}

function smooth01(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }
