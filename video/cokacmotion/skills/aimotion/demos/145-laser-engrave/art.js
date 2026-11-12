/*
 * art.js — everything painted once in setup: the birch veneer (colour, earlywood share, relief), the burn maps baked
 * from the job plan, and three flat illustrations as sprites (laser head, dusting brush, smoke wisps).
 * Pure functions of their seeds; nothing here reads the clock.
 */
import { rand } from '../_lib/stage.js';

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

/** value noise 0..1 on an integer lattice (smooth Hermite blend), seeded */
export function makeNoise(seed) {
  const r = rand(seed), P = new Uint8Array(512), G = new Float32Array(256);
  for (let i = 0; i < 256; i++) { P[i] = i; G[i] = r(); }
  for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0; const k = P[i]; P[i] = P[j]; P[j] = k; }
  for (let i = 0; i < 256; i++) P[i + 256] = P[i];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = G[P[P[X] + Y]], b = G[P[P[X + 1] + Y]], c = G[P[P[X] + Y + 1]], d = G[P[P[X + 1] + Y + 1]];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}
const fbm = (n, x, y, oct) => { let s = 0, a = 0.5, f = 1, w = 0; for (let i = 0; i < oct; i++) { s += a * n(x * f, y * f); w += a; a *= 0.5; f *= 2.03; } return s / w; };

/** three box blurs ≈ a Gaussian of σ ≈ r·0.58·√3 (running sums, O(N) per pass); edges clamp */
export function boxBlur3(src, w, h, r) {
  let a = Float32Array.from(src), b = new Float32Array(w * h);
  const inv = 1 / (2 * r + 1);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++) {
      const o = y * w;
      let s = 0;
      for (let k = -r; k <= r; k++) s += a[o + clamp(k, 0, w - 1)];
      for (let x = 0; x < w; x++) {
        b[o + x] = s * inv;
        s += a[o + Math.min(w - 1, x + r + 1)] - a[o + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += b[clamp(k, 0, h - 1) * w + x];
      for (let y = 0; y < h; y++) {
        a[y * w + x] = s * inv;
        s += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x];
      }
    }
  }
  return a;
}

/**
 * Birch veneer, grain running along y. Growth rings are the level sets of the distance to a log axis that runs along the
 * board but leans away from its face: r(x, y) = √((x − x_c)² + (z0 + k·(H − y))²) — cutting a cone of rings at a slant
 * gives the nested "cathedral" arches of flat-sawn wood. A slow fbm warps the rings; within each ring the phase
 * f = fract(r / ringW) goes from pale, soft earlywood to a denser latewood band that ends sharply at the next ring.
 * Returns sRGB albedo (RGBA8, A = earlywood share), earlywood 0..1 and relief (px, earlywood sanded slightly lower).
 */
export function paintWood(W, H, seed) {
  const n1 = makeNoise(seed), n2 = makeNoise(seed + 1), n3 = makeNoise(seed + 2), r = rand(seed + 3);
  const rgba = new Uint8ClampedArray(W * H * 4), early = new Float32Array(W * H), relief = new Float32Array(W * H);
  const xc = W * 0.38, z0 = 210, k = 0.34, ringW = 25;
  const E = [238, 219, 184], L = [212, 176, 124];
  // a few dark pin knots / mineral flecks
  const flecks = [];
  for (let i = 0; i < 14; i++) flecks.push([r() * W, r() * H, 0.8 + r() * 1.6, 2 + r() * 6]);
  for (let y = 0; y < H; y++) {
    const zz = z0 + k * (H - y);
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const wx = x + 46 * (fbm(n1, x * 0.0035, y * 0.0011, 3) - 0.5) + 10 * (n2(x * 0.02, y * 0.004) - 0.5);
      const dx = wx - xc;
      const rr = Math.sqrt(dx * dx + zz * zz) + 9 * (fbm(n2, x * 0.006, y * 0.002, 2) - 0.5);
      const ph = rr / ringW + 0.9 * (fbm(n3, x * 0.0021 + 3, y * 0.0013, 2) - 0.5);   // ring widths vary year to year
      const f = ph - Math.floor(ph);
      // latewood ramps in over the ring and ends at a crisp boundary (1 px anti-aliased)
      let late = sstep(0.5, 0.93, f);
      late *= 1 - sstep(0.95, 1.0, f);
      const fib = n3(x * 0.42, y * 0.016) - 0.5;            // fibre streaks along the grain
      const fib2 = n1(x * 1.3 + 40, y * 0.05) - 0.5;
      const tint = fbm(n3, x * 0.0016 + 7, y * 0.0007, 2) - 0.5;
      let m = late * 0.42;
      let c0 = E[0] + (L[0] - E[0]) * m, c1 = E[1] + (L[1] - E[1]) * m, c2 = E[2] + (L[2] - E[2]) * m;
      const s = 1 + fib * 0.07 + fib2 * 0.035 + tint * 0.07;
      c0 *= s; c1 *= s; c2 *= s * 0.99;
      for (const [fx, fy, fr, fl] of flecks) {
        const ex = (x - fx) / fr, ey = (y - fy) / (fr * fl);
        const q = ex * ex + ey * ey;
        if (q < 1) { const d = (1 - q) * 0.22; c0 *= 1 - d; c1 *= 1 - d * 1.15; c2 *= 1 - d * 1.35; }
      }
      rgba[i * 4] = c0; rgba[i * 4 + 1] = c1; rgba[i * 4 + 2] = c2;
      early[i] = 1 - late;
      rgba[i * 4 + 3] = early[i] * 255;
      relief[i] = -0.16 * early[i] - 0.16 * fib;
    }
  }
  return { rgba: new Uint8Array(rgba.buffer), early, relief };
}

/**
 * The burn maps. For every board pixel: the energy the beam left there
 *   E = Mb · min(V / v, Emax) · (1 + 0.1·cos(2π (y − y_j) / d))
 * (Mb: ink coverage softened by the beam profile; V / v: slower head ⇒ more energy per area, 1 at cruise; the cosine is
 * the overlap ripple of neighbouring passes of a Gaussian spot), the engraving depth h ∝ E (earlywood burns deeper),
 * the soot that drifts downwind of the ink, and the gradient of the total relief (wood − depth) for the normals.
 */
export function bakeBurn({ cover, MW, MH, job, early, relief, seed, eMax = 2.6, depthK = 3.2 }) {
  const N = MW * MH;
  // beam profile: a [1 2 1]/4 binomial in both directions (σ ≈ 0.7 px)
  const t1 = new Float32Array(N), Mb = new Float32Array(N);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const i = y * MW + x, l = cover[i - (x > 0 ? 1 : 0)], rr = cover[i + (x < MW - 1 ? 1 : 0)];
    t1[i] = 0.25 * l + 0.5 * cover[i] + 0.25 * rr;
  }
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const i = y * MW + x, u = t1[i - (y > 0 ? MW : 0)], d = t1[i + (y < MH - 1 ? MW : 0)];
    Mb[i] = 0.25 * u + 0.5 * t1[i] + 0.25 * d;
  }
  // the crater is wider than the char: heat spreads ~1 px into the wall (σ ≈ 1 px)
  const Ms = boxBlur3(cover, MW, MH, 2);
  const n = makeNoise(seed);
  const tPass = new Float32Array(N), E = new Float32Array(N), depth = new Float32Array(N);
  const V = job.V, d = job.pitch;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const i = y * MW + x, p = job.passAt(x, y);
    tPass[i] = p.t;
    if (Ms[i] < 1e-3) continue;
    const ratio = Math.min(eMax, V / Math.max(p.v, 1e-3));
    const ripple = 1 + 0.1 * Math.cos((2 * Math.PI * (y + 0.5 - p.yc)) / d);
    E[i] = Mb[i] * ratio * ripple;
    const g = 0.8 + 0.4 * early[i];
    depth[i] = depthK * Ms[i] * ratio * ripple * g + Ms[i] * (0.45 * (n(x * 0.38, y * 0.38) - 0.5) + 0.2 * (n(x * 1.1 + 9, y * 1.1) - 0.5));
  }
  // soot: two blur scales of the burnt shape, carried 10 px downwind (toward the exhaust at the top)
  const s1 = boxBlur3(Mb, MW, MH, 6), s2 = boxBlur3(Mb, MW, MH, 16);
  const soot = new Float32Array(N);
  for (let y = 0; y < MH; y++) {
    const ys = Math.min(MH - 1, y + 10);
    for (let x = 0; x < MW; x++) soot[y * MW + x] = Math.min(1, 2.1 * s1[ys * MW + x] + 2.4 * s2[ys * MW + x]);
  }
  // gradient of the total relief (wood relief − engraving depth), central differences
  const gx = new Float32Array(N), gy = new Float32Array(N);
  const hgt = (x, y) => { x = clamp(x, 0, MW - 1); y = clamp(y, 0, MH - 1); const i = y * MW + x; return relief[i] - depth[i]; };
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const i = y * MW + x;
    gx[i] = 0.5 * (hgt(x + 1, y) - hgt(x - 1, y));
    gy[i] = 0.5 * (hgt(x, y + 1) - hgt(x, y - 1));
  }
  return { tPass, E, Mb, depth, soot, gx, gy };
}

// ---------------------------------------------------------------- flat illustrations (Canvas 2D, baked once)
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function lg(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }

/**
 * The laser head seen from above and a little in front: top face with the cooling fan, front face with heat-sink fins,
 * the lens housing and a nozzle whose tip sits right over the burning spot. 240×320 sprite units (canvas ×2),
 * anchor (120, 304) = the nozzle tip.
 */
export function paintHead() {
  const S = 2, c = document.createElement('canvas');
  c.width = 240 * S; c.height = 320 * S;
  const ctx = c.getContext('2d');
  ctx.scale(S, S);
  // mount plate behind (meets the beam)
  ctx.fillStyle = '#1b1d20'; rr(ctx, 70, 8, 100, 70, 10); ctx.fill();
  // front face
  ctx.fillStyle = lg(ctx, 0, 96, 0, 252, [[0, '#43474d'], [0.5, '#33363b'], [1, '#26282c']]);
  rr(ctx, 38, 92, 164, 160, 20); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1.5; rr(ctx, 39.5, 93.5, 161, 157, 19); ctx.stroke();
  // fins
  for (let i = 0; i < 9; i++) {
    const x = 56 + i * 15.2;
    ctx.fillStyle = '#1c1d20'; rr(ctx, x, 114, 7, 92, 3.5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.09)'; ctx.fillRect(x + 7.2, 117, 1.3, 86);
  }
  // lens housing band
  ctx.fillStyle = lg(ctx, 0, 214, 0, 250, [[0, '#35383d'], [1, '#202225']]);
  rr(ctx, 70, 214, 100, 36, 12); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(80, 216, 80, 1.5);
  // nozzle cone (brushed metal)
  ctx.fillStyle = lg(ctx, 96, 0, 144, 0, [[0, '#4a4e55'], [0.32, '#a8adb4'], [0.5, '#7d8289'], [1, '#33363b']]);
  ctx.beginPath(); ctx.moveTo(97, 246); ctx.lineTo(143, 246); ctx.lineTo(131, 292); ctx.lineTo(109, 292); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(99, 262, 42, 2);
  ctx.fillStyle = '#121315'; rr(ctx, 108, 289, 24, 13, 5); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; rr(ctx, 111, 291, 7, 3, 1.5); ctx.fill();
  // top face (on top of the front face's upper edge)
  ctx.fillStyle = lg(ctx, 0, 20, 0, 104, [[0, '#7a7f87'], [1, '#575b62']]);
  rr(ctx, 38, 18, 164, 86, 22); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 2; rr(ctx, 41, 21, 158, 80, 20); ctx.stroke();
  // fan
  const fx = 120, fy = 61;
  ctx.fillStyle = '#131416'; ctx.beginPath(); ctx.arc(fx, fy, 31, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#62666d'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(fx, fy, 32, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#2c2e33';
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(6, -3); ctx.quadraticCurveTo(18, -12, 28, -5); ctx.quadraticCurveTo(20, 2, 7, 4); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = lg(ctx, fx - 9, fy - 9, fx + 9, fy + 9, [[0, '#6a6e75'], [1, '#3c3f45']]);
  ctx.beginPath(); ctx.arc(fx, fy, 9, 0, Math.PI * 2); ctx.fill();
  // four screws
  for (const [sx, sy] of [[54, 34], [186, 34], [54, 88], [186, 88]]) {
    ctx.fillStyle = '#2a2c30'; ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.arc(sx - 1, sy - 1, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  return { canvas: c, size: [240, 320], anchor: [120, 304] };
}

/**
 * A bench brush from above: a rounded beech back, thick fringes of bristles on its two long sides (tips grey with the
 * soot they pick up), the handle toward the viewer. 240×640 sprite units (canvas ×2), anchor (120, 200) = the middle
 * of the bristle block.
 */
export function paintBrush(seed) {
  const S = 2, c = document.createElement('canvas');
  c.width = 240 * S; c.height = 640 * S;
  const ctx = c.getContext('2d');
  ctx.scale(S, S);
  const r = rand(seed);
  ctx.lineCap = 'round';
  // bristle fringes (long sides, then short ends)
  for (let side = -1; side <= 1; side += 2) {
    ctx.fillStyle = '#2e2620';
    rr(ctx, side < 0 ? 48 : 158, 34, 34, 332, 14); ctx.fill();
    for (let i = 0; i < 520; i++) {
      const y = 36 + r() * 328, x0 = side < 0 ? 72 : 168, len = 18 + r() * 12;
      const x1 = x0 + side * len, y1 = y + (r() - 0.5) * 6;
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      const sh = 52 + r() * 40 | 0;
      g.addColorStop(0, `rgba(${sh},${sh - 8},${sh - 14},1)`); g.addColorStop(0.7, `rgba(${sh + 22},${sh + 12},${sh},1)`); g.addColorStop(1, `rgba(${108 + r() * 40 | 0},${94 + r() * 30 | 0},${78 + r() * 22 | 0},0.9)`);
      ctx.strokeStyle = g; ctx.lineWidth = 0.9 + r() * 1.3;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y1); ctx.stroke();
    }
  }
  for (let end = -1; end <= 1; end += 2) {
    for (let i = 0; i < 90; i++) {
      const x = 76 + r() * 88, y0 = end < 0 ? 40 : 360, len = 8 + r() * 8;
      ctx.strokeStyle = `rgba(${50 + r() * 40 | 0},${42 + r() * 30 | 0},${34 + r() * 24 | 0},0.95)`; ctx.lineWidth = 1 + r();
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + (r() - 0.5) * 4, y0 + end * len); ctx.stroke();
    }
  }
  // handle
  ctx.fillStyle = lg(ctx, 100, 0, 140, 0, [[0, '#a87547'], [0.35, '#d19e6c'], [1, '#86592f']]);
  rr(ctx, 101, 350, 38, 270, 19); ctx.fill();
  ctx.fillStyle = '#3a2618'; ctx.beginPath(); ctx.arc(120, 592, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,240,220,0.35)'; ctx.lineWidth = 1.5; rr(ctx, 103.5, 353, 33, 264, 16); ctx.stroke();
  // back block with a bevel
  ctx.fillStyle = '#7d5532'; rr(ctx, 70, 26, 100, 348, 42); ctx.fill();
  ctx.fillStyle = lg(ctx, 74, 0, 166, 0, [[0, '#b98551'], [0.3, '#dcaa76'], [0.7, '#c99561'], [1, '#a06f42']]);
  rr(ctx, 75, 31, 90, 338, 37); ctx.fill();
  ctx.save(); rr(ctx, 75, 31, 90, 338, 37); ctx.clip();
  for (let i = 0; i < 18; i++) {
    const x = 79 + r() * 82, a = 0.05 + r() * 0.08;
    ctx.strokeStyle = `rgba(96,58,26,${a})`; ctx.lineWidth = 1 + r() * 2.2;
    ctx.beginPath(); ctx.moveTo(x, 28);
    ctx.bezierCurveTo(x + (r() - 0.5) * 14, 140, x + (r() - 0.5) * 14, 260, x + (r() - 0.5) * 10, 372); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,244,228,0.45)'; ctx.lineWidth = 2; rr(ctx, 78, 34, 84, 332, 34); ctx.stroke();
  return { canvas: c, size: [240, 640], anchor: [120, 200] };
}

/**
 * Smoke atlas 2×2: curling ribbons. Each ribbon is a Gaussian across a centre line that wanders with domain-warped
 * fbm, tapering at both ends and broken up by a second noise — wood smoke reads as filaments, not balls.
 */
export function paintSmoke(seed, size = 512) {
  const n = makeNoise(seed), m = makeNoise(seed + 5), r = rand(seed + 9);
  const px = new Uint8ClampedArray(size * size * 4), half = size / 2;
  const cells = [];
  for (let c = 0; c < 4; c++) {
    const rib = [];
    const k = 2 + (c % 2);
    for (let j = 0; j < k; j++) rib.push({ off: (r() - 0.5) * 0.5, amp: 0.15 + r() * 0.25, fr: 1.5 + r() * 2.5, ph: r() * 6.28, w: 0.05 + r() * 0.07, a: 0.55 + r() * 0.45 });
    cells.push(rib);
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const c = (x >= half ? 1 : 0) + (y >= half ? 2 : 0);
    const u = ((x % half) + 0.5) / half * 2 - 1, v = ((y % half) + 0.5) / half * 2 - 1;
    const wu = u + 0.35 * (fbm(n, u * 2 + c * 7, v * 2, 3) - 0.5), wv = v + 0.45 * (fbm(m, u * 2.2, v * 2.2 + c * 5, 3) - 0.5);
    let a = 0;
    for (const b of cells[c]) {
      const cl = b.off + b.amp * Math.sin(b.fr * wu + b.ph);
      const ww = b.w * (0.7 + 0.8 * (1 - Math.abs(wu)));
      const dd = (wv - cl) / ww;
      a += b.a * Math.exp(-dd * dd) * (0.55 + 0.45 * fbm(m, wu * 5 + 3, wv * 5, 2));
    }
    const rad = Math.max(0, 1 - (u * u + v * v));
    a = Math.min(1, a * rad * rad * 1.15 + 0.10 * rad * rad * rad * fbm(n, u * 3, v * 3, 2));
    const i = (y * size + x) * 4;
    px[i] = px[i + 1] = px[i + 2] = 255; px[i + 3] = a * 255;
  }
  return { data: new Uint8Array(px.buffer), size };
}
