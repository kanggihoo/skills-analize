/*
 * Generated imagery for the posters — all drawn once in setup on 2D canvases, no external images.
 *   studioPhoto()  a "studio shot" of an abstract object on a coloured cyclorama: backdrop gradient, coloured
 *                  gels (soft radial lights), contact shadow, the object (glossy blob / chrome drop / matte
 *                  sphere) with key, rim and specular light, a vignette and film grain.
 *   marblePhoto()  a liquid acrylic pour: domain-warped bands in the issue's palette, embossed by the slope of
 *                  the band field, with grain — the cover image.
 *   displacementMap()  a tileable smooth vector field (R = x push, G = y push) for PIXI.DisplacementFilter.
 * Every random value comes from rand(seed); nothing here depends on time.
 */
import { rand } from '../_lib/stage.js';

const TAU = Math.PI * 2;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
const rgba = (n, a) => `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
const rgbOf = (n) => [(n >> 16) & 255, (n >> 8) & 255, n & 255];

/** luminance film grain + optional vignette, in place */
function finish(ctx, w, h, seed, grain = 0.07, vignette = 0.28) {
  if (vignette > 0) {
    const g = ctx.createRadialGradient(w * 0.5, h * 0.46, Math.min(w, h) * 0.32, w * 0.5, h * 0.5, Math.hypot(w, h) * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(10,6,20,${vignette})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  const img = ctx.getImageData(0, 0, w, h), d = img.data, r = rand(seed * 7919 + 13);
  const k = grain * 255;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() + r() - 1) * k;          // triangular noise: finer than uniform
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

/** closed organic outline: radius modulated by a few low harmonics */
function blobPath(ctx, cx, cy, r, seed, wob = 0.11) {
  const R = rand(seed);
  const h = [2, 3, 5].map((n) => ({ n, a: wob * (0.35 + R() * 0.65) / (n * 0.55), p: R() * TAU }));
  ctx.beginPath();
  for (let i = 0; i <= 160; i++) {
    const th = (i / 160) * TAU;
    let rr = 1;
    for (const q of h) rr += q.a * Math.sin(q.n * th + q.p);
    const x = cx + Math.cos(th) * r * rr, y = cy + Math.sin(th) * r * rr * 0.96;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}

/** teardrop, tip up: x = r sin t sin(t/2), y = -r cos t */
function dropPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i <= 180; i++) {
    const t = (i / 180) * TAU;
    const x = cx + r * 0.92 * Math.sin(t) * Math.sin(t / 2), y = cy - r * 1.18 * Math.cos(t);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}

/**
 * Studio shot. p = {
 *   bg: [top, mid, floor] colours, gels: [{ c, x, y, r, a }] (fractions of w/h), object: 'blob' | 'drop' | 'sphere',
 *   ox, oy, or (fractions), body: [light, mid, dark], rim: colour, chrome: bool }
 */
export function studioPhoto(w, h, seed, p) {
  const c = makeCanvas(w, h), ctx = c.getContext('2d');
  const R = rand(seed);
  // cyclorama: wall → soft horizon → floor
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, hex(p.bg[0]));
  bg.addColorStop(0.58, hex(p.bg[1]));
  bg.addColorStop(0.7, hex(p.bg[2]));
  bg.addColorStop(1, hex(p.bg[2]));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  // coloured gels: soft radial lights thrown on the backdrop
  for (const gl of p.gels) {
    const x = gl.x * w, y = gl.y * h, r = gl.r * Math.max(w, h);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(gl.c, gl.a));
    g.addColorStop(0.45, rgba(gl.c, gl.a * 0.45));
    g.addColorStop(1, rgba(gl.c, 0));
    ctx.globalCompositeOperation = gl.mode || 'screen';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = 'source-over';

  const ox = p.ox * w, oy = p.oy * h, or = p.or * Math.min(w, h);
  // contact shadow on the floor, squashed ellipse, two layers (umbra + penumbra)
  for (const [sx, a] of [[1.25, 0.32], [0.75, 0.42]]) {
    ctx.save();
    ctx.translate(ox + or * 0.12, oy + or * 1.02);
    ctx.scale(1, 0.2);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, or * sx);
    g.addColorStop(0, `rgba(12,6,28,${a})`);
    g.addColorStop(1, 'rgba(12,6,28,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-or * 2, -or * 2, or * 4, or * 4);
    ctx.restore();
  }

  // the object
  ctx.save();
  if (p.object === 'drop') dropPath(ctx, ox, oy, or);
  else if (p.object === 'blob') blobPath(ctx, ox, oy, or, seed + 5);
  else { ctx.beginPath(); ctx.arc(ox, oy, or, 0, TAU); }
  ctx.clip();
  if (p.chrome) {
    // chrome: an environment of hard light bands, bent across the body
    const g = ctx.createLinearGradient(ox - or, oy - or * 1.2, ox + or * 0.7, oy + or * 1.2);
    const bands = [[0, p.body[2]], [0.18, p.body[1]], [0.3, 0xffffff], [0.36, p.body[2]], [0.52, p.body[1]],
      [0.62, p.body[0]], [0.66, 0xffffff], [0.74, p.body[2]], [0.9, p.rim], [1, p.body[2]]];
    for (const [s, col] of bands) g.addColorStop(s, hex(col));
    ctx.fillStyle = g;
    ctx.fillRect(ox - or * 2, oy - or * 2, or * 4, or * 4);
  } else {
    const g = ctx.createRadialGradient(ox - or * 0.38, oy - or * 0.45, or * 0.05, ox, oy, or * 1.15);
    g.addColorStop(0, hex(p.body[0]));
    g.addColorStop(0.5, hex(p.body[1]));
    g.addColorStop(1, hex(p.body[2]));
    ctx.fillStyle = g;
    ctx.fillRect(ox - or * 2, oy - or * 2, or * 4, or * 4);
  }
  // rim light from the back-right, bounce light from the floor
  let g = ctx.createRadialGradient(ox + or * 0.95, oy - or * 0.2, or * 0.2, ox + or * 0.95, oy - or * 0.2, or * 0.95);
  g.addColorStop(0, rgba(p.rim, 0.85));
  g.addColorStop(1, rgba(p.rim, 0));
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = g;
  ctx.fillRect(ox - or * 2, oy - or * 2, or * 4, or * 4);
  g = ctx.createLinearGradient(0, oy + or * 0.3, 0, oy + or * 1.2);
  g.addColorStop(0, rgba(p.bg[2], 0));
  g.addColorStop(1, rgba(p.bg[2], 0.55));
  ctx.fillStyle = g;
  ctx.fillRect(ox - or * 2, oy - or * 2, or * 4, or * 4);
  // specular: a hot spot and a soft window reflection
  ctx.globalCompositeOperation = 'source-over';
  const hx = ox - or * 0.36, hy = oy - or * 0.48;
  g = ctx.createRadialGradient(hx, hy, 0, hx, hy, or * 0.34);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(ox - or * 2, oy - or * 2, or * 4, or * 4);
  ctx.save();
  ctx.translate(ox + or * 0.18, oy - or * 0.62);
  ctx.rotate(-0.5);
  ctx.scale(1, 0.32);
  g = ctx.createRadialGradient(0, 0, 0, 0, 0, or * 0.42);
  g.addColorStop(0, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-or, -or, or * 2, or * 2);
  ctx.restore();
  ctx.restore();

  // a few out-of-focus specks in the air (dust in the key light)
  for (let i = 0; i < 14; i++) {
    const x = R() * w, y = R() * h * 0.7, r = (0.004 + R() * 0.012) * w;
    const gg = ctx.createRadialGradient(x, y, 0, x, y, r);
    gg.addColorStop(0, `rgba(255,255,255,${0.1 + R() * 0.18})`);
    gg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  finish(ctx, w, h, seed, p.grain ?? 0.075, p.vignette ?? 0.3);
  return c;
}

/** Liquid acrylic pour: warped bands in the palette, embossed. pal = colours (numbers), cycled. */
export function marblePhoto(w, h, seed, pal) {
  const c = makeCanvas(w, h), ctx = c.getContext('2d');
  const R = rand(seed);
  const ph = Array.from({ length: 6 }, () => R() * TAU);
  const cols = pal.map(rgbOf), n = cols.length;
  const S = 1 / 760;
  const field = (x, y) => {
    const u = x * S, v = y * S;
    const q = Math.sin(TAU * 0.55 * v + ph[0] + 1.6 * Math.sin(TAU * 0.42 * u + ph[1]));
    const q2 = Math.sin(TAU * 0.8 * u + ph[2] + 1.2 * Math.cos(TAU * 0.6 * v + ph[3]));
    return 1.65 * v + 0.35 * u + 0.42 * q + 0.22 * q2 + 0.07 * Math.sin(TAU * (2.3 * u - 1.7 * v) + ph[4]);
  };
  const img = ctx.createImageData(w, h), d = img.data;
  const NB = 4.2;   // bands per unit of the field
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = field(x, y);
      const sx = field(x + 1.5, y) - s, sy = field(x, y + 1.5) - s;
      const b = s * NB, i0 = Math.floor(b), f = b - i0;
      const A = cols[((i0 % n) + n) % n], B = cols[(((i0 + 1) % n) + n) % n];
      const m = smooth(0.84, 1, f);                       // mostly flat cells, quick soft edge into the next colour
      // the thin cream "cell" line acrylic pours leave at a colour boundary, and a darker lip just before it
      const line = Math.exp(-(((f - 0.93) / 0.012) ** 2)) * 0.55;
      const lip = Math.exp(-(((f - 0.86) / 0.03) ** 2)) * 0.18;
      // emboss: light from upper left on the band field's slope (the paint ridges)
      const slope = Math.sin(TAU * b) * (sx * 0.9 - sy * 0.6) * 520;
      const shade = 1 + Math.max(-0.22, Math.min(0.22, slope)) - lip;
      const k = (y * w + x) * 4;
      for (let ch = 0; ch < 3; ch++) {
        const base = A[ch] + (B[ch] - A[ch]) * m;
        d[k + ch] = (base * shade) * (1 - line) + 246 * line;
      }
      d[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  // gloss: a broad soft highlight like a light box reflected in wet paint
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, 'rgba(255,255,255,0.0)');
  g.addColorStop(0.38, 'rgba(255,255,255,0.16)');
  g.addColorStop(0.46, 'rgba(255,255,255,0.0)');
  g.addColorStop(1, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  finish(ctx, w, h, seed, 0.06, 0.22);
  return c;
}

/**
 * Tileable displacement field (N×N): every term has an integer frequency in u and v, so the texture repeats
 * seamlessly with addressMode 'repeat'. R and G average to 0.5 (no net shift), range ≈ 0.08..0.92.
 */
export function displacementMap(N = 512) {
  const c = makeCanvas(N, N), ctx = c.getContext('2d');
  const img = ctx.createImageData(N, N), d = img.data;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const u = x / N, v = y / N;
      const w1 = Math.sin(TAU * (3 * v + 0.15 * Math.sin(TAU * 2 * u)));
      const w2 = Math.sin(TAU * (3 * u + 0.15 * Math.sin(TAU * 2 * v)));
      const r = 0.5 + 0.3 * Math.sin(TAU * (2 * u + 0.35 * w1)) + 0.12 * Math.sin(TAU * (5 * u + 3 * v));
      const g = 0.5 + 0.3 * Math.sin(TAU * (2 * v + 0.35 * w2)) + 0.12 * Math.sin(TAU * (4 * v - 3 * u));
      const k = (y * N + x) * 4;
      d[k] = clamp01(r) * 255; d[k + 1] = clamp01(g) * 255; d[k + 2] = 128; d[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
