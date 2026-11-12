/*
 * room.js — the attic room painted once in setup as an albedo + height relief.
 *
 * Every shape is filled twice: its colour goes onto an albedo canvas, its coverage becomes a mask whose signed
 * distance field d (px inside the edge) is turned into height by a profile:
 *     h = z + zs · r · √(1 − (1 − min(d, r)/r)²)        (a quarter-circle bevel of radius r; r = inradius → a dome)
 * composited in painter's order (a later shape overwrites, blended by its anti-aliased coverage). Objects get their
 * own base z so they stand in front of the wall; horizontal surfaces (desk top, floor, ceiling) are tilted ramps.
 * finalize() adds a faint brush-stroke texture, derives normals from the height with a Sobel filter
 * N = normalize(−∂h/∂x, −∂h/∂y, 1) and bakes a cavity AO from blurred heights.
 *
 *   paintRoom()    → the 1080×1920 room: albedo (rgb + gloss), geometry (nx, ny, h, ao), mattes (sky, gobo, wax, stars)
 *   paintSprites() → a 1024² atlas: the hand holding a match, the cat's head with closed and with open eyes
 */
import { rand, clamp } from '../_lib/stage.js';
import { signedDistance } from '../_lib/type.js';

export const W = 1080, H = 1920;
export const CEIL = (x) => 196 + 0.19 * x;            // the attic's sloping ceiling line
export const WIN = { x0: 112, x1: 388, yc: 520, y1: 768 };   // window opening: arch of radius 138 over a rectangle
export const WICK = [773, 860];                        // candle flame base (wick tip)
export const STRIKE = [650, 1012];                      // where the match is struck (matchbox side)
// sprite atlas (1024²): regions and their anchors in atlas pixels
export const ATLAS = 1024;
export const HAND = { x: 0, y: 0, w: 1024, h: 780, pivot: [70, 70] };         // pivot = the match head
export const HEAD = { w: 240, h: 220, a: [0, 792], b: [262, 792], c: [120, 116], eyes: [[88, 112], [152, 112]], eye: [16, 14] };

// ================================================================ shapes (Path2D + bounding box)
const deg = Math.PI / 180;
export const S = {
  rr(x, y, w, h, r) { const p = new Path2D(); p.roundRect(x, y, w, h, r); return { p, bb: [x, y, x + w, y + h] }; },
  ell(cx, cy, rx, ry, rot = 0) { const p = new Path2D(); p.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2); const m = Math.max(rx, ry); return { p, bb: [cx - m, cy - m, cx + m, cy + m] }; },
  poly(pts) { const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return { p, bb: bbOf(pts, 0) }; },
  // closed Catmull–Rom spline through the points (uniform, tension 1/6 → cubic Béziers)
  blob(pts) {
    const p = new Path2D(), n = pts.length;
    p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < n; i++) {
      const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n], d = pts[(i + 2) % n];
      p.bezierCurveTo(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6, c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]);
    }
    return { p, bb: bbOf(pts, 0.12) };
  },
  // an open stroked curve with round caps: build(p) draws it, bb bounds the centre line
  line(build, bb, width) { const p = new Path2D(); build(p); return { p, bb: [bb[0] - width, bb[1] - width, bb[2] + width, bb[3] + width], stroke: width }; },
  ring(cx, cy, r, width, a0 = 0, a1 = Math.PI * 2) { const p = new Path2D(); p.arc(cx, cy, r, a0, a1); return { p, bb: [cx - r - width, cy - r - width, cx + r + width, cy + r + width], stroke: width }; },
  // a leaf: teardrop from base (0,0) to tip (0,−L), rotated by a (deg) and moved to (x, y)
  leaf(x, y, a, L, Wd) {
    const q = new Path2D();
    q.moveTo(0, 0);
    q.bezierCurveTo(Wd, -0.18 * L, 0.75 * Wd, -0.72 * L, 0, -L);
    q.bezierCurveTo(-0.75 * Wd, -0.72 * L, -Wd, -0.18 * L, 0, 0);
    return S.xf({ p: q, bb: [-Wd, -L, Wd, 0] }, new DOMMatrix().translate(x, y).rotate(a));
  },
  xf(s, m) {
    const p = new Path2D(); p.addPath(s.p, m);
    const c = [[s.bb[0], s.bb[1]], [s.bb[2], s.bb[1]], [s.bb[0], s.bb[3]], [s.bb[2], s.bb[3]]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
    return { ...s, p, bb: bbOf(c, 0) };
  },
};
function bbOf(pts, grow) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const gx = (x1 - x0) * grow + 2, gy = (y1 - y0) * grow + 2;
  return [x0 - gx, y0 - gy, x1 + gx, y1 + gy];
}

// ================================================================ the relief painter
export class Relief {
  constructor(w, h) {
    this.w = w; this.h = h;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    this.g = c.getContext('2d', { willReadFrequently: true });
    const N = w * h;
    this.H = new Float32Array(N);       // height (px toward the viewer)
    this.gl = new Float32Array(N);      // gloss 0..1
    this.sky = new Float32Array(N);     // window glass: the sky shows here
    this.wax = new Float32Array(N);     // candle wax (glows near the flame)
    this.em = new Float32Array(N);      // stars and moon (night emission)
    this.sc = document.createElement('canvas');
    this.sg = this.sc.getContext('2d', { willReadFrequently: true });
  }
  mask(s, x0, y0, w, h) {
    if (this.sc.width < w || this.sc.height < h) {
      this.sc.width = Math.max(this.sc.width, w); this.sc.height = Math.max(this.sc.height, h);
      this.sg = this.sc.getContext('2d', { willReadFrequently: true });
    }
    const g = this.sg;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, w, h);
    g.setTransform(1, 0, 0, 1, -x0, -y0);
    g.fillStyle = g.strokeStyle = '#fff';
    if (s.stroke) { g.lineWidth = s.stroke; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(s.p); }
    else g.fill(s.p, s.rule || 'nonzero');
    const d = g.getImageData(0, 0, w, h).data, a = new Float32Array(w * h);
    for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3] / 255;
    return a;
  }
  box(s) {
    const x0 = Math.floor(s.bb[0]) - 3, y0 = Math.floor(s.bb[1]) - 3;
    return [x0, y0, Math.ceil(s.bb[2]) + 3 - x0, Math.ceil(s.bb[3]) + 3 - y0];
  }
  /** a shape with height. o: { fill, z, r | dome, zs, rel, tilt:[ax, ay, x0, y0], gloss, sky, wax, paint(g), alb:false } */
  part(s, o = {}) {
    const [x0, y0, w, h] = this.box(s), cov = this.mask(s, x0, y0, w, h);
    const sd = signedDistance(cov, w, h);
    let r = o.r || 0;
    if (o.dome) { let m = 0; for (let i = 0; i < sd.length; i++) if (-sd[i] > m) m = -sd[i]; r = m * (o.dome === true ? 1 : o.dome); }
    const zs = o.zs ?? 1, z = o.z ?? 0, tl = o.tilt, gloss = o.gloss ?? 0.05, sky = o.sky ?? 0, wax = o.wax ?? 0;
    for (let j = 0; j < h; j++) {
      const Y = y0 + j;
      if (Y < 0 || Y >= this.h) continue;
      for (let i = 0; i < w; i++) {
        const X = x0 + i, k = j * w + i, a = cov[k];
        if (X < 0 || X >= this.w || a <= 0) continue;
        const d = Math.max(0, -sd[k]), q = r > 0 ? Math.min(1, d / r) : 1;
        const hp = r > 0 ? r * Math.sqrt(1 - (1 - q) * (1 - q)) : 0;
        const idx = Y * this.w + X;
        const base = o.rel ? this.H[idx] + z : z + (tl ? tl[0] * (X + 0.5 - tl[2]) + tl[1] * (Y + 0.5 - tl[3]) : 0);
        this.H[idx] += (base + hp * zs - this.H[idx]) * a;
        this.gl[idx] += (gloss - this.gl[idx]) * a;
        this.sky[idx] += (sky - this.sky[idx]) * a;
        this.wax[idx] += (wax - this.wax[idx]) * a;
        this.em[idx] *= 1 - a;
      }
    }
    if (o.alb !== false) this.paint(s, o.fill, o.paint);
  }
  /** colour only (a printed or painted detail, no height) */
  paint(s, fill, deco) {
    const g = this.g;
    g.save();
    if (s.stroke) { g.lineWidth = s.stroke; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = fill; g.stroke(s.p); }
    else { g.fillStyle = fill; g.fill(s.p, s.rule || 'nonzero'); }
    if (deco && !s.stroke) { g.clip(s.p, s.rule || 'nonzero'); deco(g); }
    g.restore();
  }
  /** carve (depth > 0) or raise (depth < 0) a stroked line into the height: grooves, seams, ribs */
  carve(s, depth, fill) {
    const [x0, y0, w, h] = this.box(s), cov = this.mask(s, x0, y0, w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const X = x0 + i, Y = y0 + j, a = cov[j * w + i];
      if (a > 0 && X >= 0 && Y >= 0 && X < this.w && Y < this.h) this.H[Y * this.w + X] -= depth * a;
    }
    if (fill) this.paint(s, fill);
  }
  /** night emission (stars, the moon): adds to the em matte where the shape covers */
  emit(s, v) {
    const [x0, y0, w, h] = this.box(s), cov = this.mask(s, x0, y0, w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const X = x0 + i, Y = y0 + j, a = cov[j * w + i];
      if (a > 0 && X >= 0 && Y >= 0 && X < this.w && Y < this.h) { const k = Y * this.w + X; this.em[k] = Math.max(this.em[k], v * a); }
    }
  }
  /**
   * Read back and derive: brush texture, Sobel normals, cavity AO.
   * Returns alb (RGBA8: rgb albedo, a = gloss or coverage), geo (Float32 RGBA: nx, ny, h, ao or gloss).
   */
  finalize({ seed = 7, brush = 0.4, aoK = 1, sprite = false } = {}) {
    const { w, h } = this, N = w * h, Hh = this.H;
    const img = this.g.getImageData(0, 0, w, h).data;
    // brush strokes: anisotropic value noise (long cells along a diagonal), a fraction of a pixel deep
    const R = rand(seed), GX = 14, GY = 4, gw = Math.ceil(w / GX) + 3, gh = Math.ceil(h / GY) + 3, grid = new Float32Array(gw * gh);
    for (let i = 0; i < grid.length; i++) grid[i] = R() - 0.5;
    const fine = new Float32Array(N);
    for (let i = 0; i < N; i++) fine[i] = R() - 0.5;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = (x + 0.45 * y) / GX, v = y / GY, iu = Math.floor(u), iv = Math.floor(v), fu = u - iu, fv = v - iv;
      const su = fu * fu * (3 - 2 * fu), sv = fv * fv * (3 - 2 * fv);
      const a = grid[iv * gw + iu], b = grid[iv * gw + iu + 1], c = grid[(iv + 1) * gw + iu], d = grid[(iv + 1) * gw + iu + 1];
      const n = a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
      const k = y * w + x;
      Hh[k] += brush * n;
      const m = 1 + 0.07 * n + 0.025 * fine[k];
      for (let c2 = 0; c2 < 3; c2++) img[k * 4 + c2] = clamp(Math.round(img[k * 4 + c2] * m), 0, 255);
    }
    // Sobel normals
    const geo = new Float32Array(N * 4);
    const at = (x, y) => Hh[clamp(y, 0, h - 1) * w + clamp(x, 0, w - 1)];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const gx = (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1)) / 8;
      const gy = (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1)) / 8;
      const l = Math.hypot(gx, gy, 1), o = (y * w + x) * 4;
      geo[o] = -gx / l; geo[o + 1] = -gy / l; geo[o + 2] = Hh[y * w + x];
    }
    // cavity AO: how far the neighbourhood (two radii) stands above this pixel
    if (!sprite) {
      const b1 = blur(Hh, w, h, 6), b2 = blur(Hh, w, h, 22);
      for (let i = 0; i < N; i++) {
        const occ = 0.55 * clamp((b1[i] - Hh[i]) / 10) + 0.45 * clamp((b2[i] - Hh[i]) / 34);
        geo[i * 4 + 3] = 1 - 0.8 * aoK * occ;
      }
    } else for (let i = 0; i < N; i++) geo[i * 4 + 3] = this.gl[i];
    const alb = new Uint8Array(N * 4);
    for (let i = 0; i < N; i++) {
      alb[i * 4] = img[i * 4]; alb[i * 4 + 1] = img[i * 4 + 1]; alb[i * 4 + 2] = img[i * 4 + 2];
      alb[i * 4 + 3] = sprite ? img[i * 4 + 3] : Math.round(clamp(this.gl[i]) * 255);
    }
    return { alb, geo };
  }
}

/** separable box blur, three passes ≈ Gaussian of σ ≈ r (running sums, clamped edges) */
export function blur(src, w, h, r) {
  let a = Float32Array.from(src), b = new Float32Array(src.length);
  const rr = Math.max(1, Math.round(r * 0.58));   // three boxes of half-width rr: σ² = 3·((2rr+1)²−1)/12
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++) {
      const o = y * w;
      let s = 0;
      for (let x = -rr - 1; x < rr; x++) s += a[o + clamp(x, 0, w - 1)];
      for (let x = 0; x < w; x++) { s += a[o + Math.min(w - 1, x + rr)] - a[o + Math.max(0, x - rr - 1)]; b[o + x] = s / (2 * rr + 1); }
    }
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let y = -rr - 1; y < rr; y++) s += b[clamp(y, 0, h - 1) * w + x];
      for (let y = 0; y < h; y++) { s += b[Math.min(h - 1, y + rr) * w + x] - b[Math.max(0, y - rr - 1) * w + x]; a[y * w + x] = s / (2 * rr + 1); }
    }
  }
  return a;
}

// ================================================================ the room
const P = {
  wall: '#606286', ceil: '#3e4069', beam: '#5e4637', cream: '#d3c9b2', wood: '#9c6d4e', woodD: '#83573e', woodF: '#4b3b34',
  teal: '#4f767c', ochre: '#a48c5c', rose: '#a3686a', slate: '#5b6788', sage: '#6f9a78', sageD: '#5a8467', sageL: '#86b08c',
  glaze: '#5c8f8c', bronze: '#8f7d5a', wax: '#ece3cf', cat: '#e3d9c7', catG: '#9d9aa8', catD: '#7f7c8c', blue: '#5a7096',
};

export function paintRoom() {
  const R = new Relief(W, H), g = R.g, rnd = rand(162);
  g.fillStyle = P.wall; g.fillRect(0, 0, W, H);

  // ---- wall: vertical boards with rounded edges (the grooves between them catch grazing light)
  for (let k = 0, x = -38; x < W; k++, x += 96) {
    const v = rnd(), col = mixHex(P.wall, v < 0.5 ? '#525478' : '#6b6c92', 0.25 + 0.3 * rnd());
    R.part(S.rr(x + 1, CEIL(x) - 60, 94, 1500 - CEIL(x), 3), { z: 0, r: 3, fill: col, paint: (gg) => {
      gg.globalAlpha = 0.18; gg.fillStyle = '#3d3f6a';
      for (let j = 0; j < 3; j++) { const yy = 500 + rnd() * 900; gg.beginPath(); gg.ellipse(x + 30 + rnd() * 40, yy, 3, 90 + rnd() * 120, 0, 0, 7); gg.fill(); }
    } });
    for (const yy of [CEIL(x + 48) + 90, 1380]) R.part(S.ell(x + 48, yy, 3.2, 3.2), { rel: true, z: 0, r: 2.2, fill: '#44466e' });   // nail heads
  }
  // ---- sloping ceiling (a ramp: its normal leans down), planks along the slope, a rafter on the edge
  R.part(S.poly([[-30, -30], [W + 30, -30], [W + 30, CEIL(W + 30)], [-30, CEIL(-30)]]), { z: 0, tilt: [-0.0475, 0.25, 0, 36], fill: P.ceil });
  for (let k = 1; k < 7; k++) R.carve(S.line((p) => { p.moveTo(-40, CEIL(-40) - 34 * k); p.lineTo(W + 40, CEIL(W + 40) - 34 * k); }, [-40, CEIL(-40) - 34 * k, W + 40, CEIL(W + 40) - 34 * k], 2.4), 2, 'rgba(32,33,58,0.6)');
  R.part(S.line((p) => { p.moveTo(-40, CEIL(-40) + 8); p.lineTo(W + 40, CEIL(W + 40) + 8); }, [-40, CEIL(-40) + 8, W + 40, CEIL(W + 40) + 8], 46), { z: 26, r: 23, zs: 0.9, fill: P.beam });
  for (let k = 0; k < 9; k++) {   // wood grain on the rafter
    const o = -14 + k * 3.6;
    R.paint(S.line((p) => { p.moveTo(-40, CEIL(-40) + 8 + o); p.lineTo(W + 40, CEIL(W + 40) + 8 + o + (rnd() - 0.5) * 6); }, [-40, 0, W + 40, 600], 1.2), `rgba(40,28,22,${0.12 + 0.12 * rnd()})`);
  }

  // ---- the window: casing ring, recessed glass (the sky), mullions, sill, a plant
  const arch = (x0, x1, yc, y1) => { const p = new Path2D(), r = (x1 - x0) / 2; p.moveTo(x0, y1); p.lineTo(x0, yc); p.arc((x0 + x1) / 2, yc, r, Math.PI, 0); p.lineTo(x1, y1); p.closePath(); return p; };
  {
    const ring = new Path2D(); ring.addPath(arch(WIN.x0 - 24, WIN.x1 + 24, WIN.yc, WIN.y1 + 10)); ring.addPath(arch(WIN.x0, WIN.x1, WIN.yc, WIN.y1));
    R.part({ p: ring, bb: [WIN.x0 - 26, WIN.yc - 166, WIN.x1 + 26, WIN.y1 + 12], rule: 'evenodd' }, { z: 0, r: 12, fill: P.cream, gloss: 0.15 });
    R.part({ p: arch(WIN.x0, WIN.x1, WIN.yc, WIN.y1), bb: [WIN.x0, WIN.yc - 140, WIN.x1, WIN.y1] }, { z: -24, r: 0, fill: '#1c2246', sky: 1, gloss: 0.9 });
    R.part(S.rr(243, 380, 14, 392, 4), { z: -24, r: 7, fill: P.cream, gloss: 0.15 });
    R.part(S.rr(WIN.x0, 588, WIN.x1 - WIN.x0, 14, 4), { z: -24, r: 7, fill: P.cream, gloss: 0.15 });
    // night sky details: a crescent moon and a few stars (emission only; the sky colour is the shader's)
    const moon = new Path2D(); moon.arc(320, 452, 21, 0, 7); moon.arc(311, 445, 19, 0, 7, true);
    R.emit({ p: moon, bb: [296, 428, 344, 476], rule: 'evenodd' }, 1);
    const rs = rand(31);
    for (let i = 0; i < 40; i++) {
      const x = WIN.x0 + 10 + rs() * (WIN.x1 - WIN.x0 - 20), y = 400 + rs() * 340;
      if (Math.abs(x - 250) < 14 || Math.abs(y - 595) < 14 || Math.hypot(x - 250, y - WIN.yc) > 130 && y < WIN.yc || Math.hypot(x - 316, y - 450) < 34) continue;
      R.emit(S.ell(x, y, 1.3 + rs() * 1.2, 1.3 + rs() * 1.2), 0.35 + 0.65 * rs());
    }
    R.part(S.rr(78, 758, 344, 30, 7), { z: 0, r: 15, fill: P.cream, gloss: 0.15 });
    R.part(S.rr(98, 788, 304, 16, 5), { z: 0, r: 6, fill: '#bdb29b' });
    // plant on the sill (its leaves stand in front of the glass: they will print into the sunbeam)
    const stems = [[-38, 70, 32], [-12, 92, 34], [20, 84, 31], [-62, 60, 26], [44, 64, 27], [4, 120, 30], [-30, 112, 28]];
    const base = [165, 704];
    for (const [a, L] of stems) {
      const bx = base[0] + Math.sin(a * deg) * L * 0.55, by = base[1] - Math.cos(a * deg) * L * 0.55;
      R.part(S.line((p) => { p.moveTo(base[0], base[1]); p.quadraticCurveTo(base[0] + (bx - base[0]) * 0.2, (base[1] + by) / 2, bx, by); }, [Math.min(base[0], bx), by, Math.max(base[0], bx), base[1]], 4), { z: 30, r: 2, fill: '#4f7556' });
    }
    stems.forEach(([a, L, Wd], i) => {
      const bx = base[0] + Math.sin(a * deg) * L * 0.55, by = base[1] - Math.cos(a * deg) * L * 0.55;
      const lf = S.leaf(bx, by, a, L, Wd);
      R.part(lf, { z: 34, dome: 0.8, zs: 0.55, fill: [P.sage, P.sageD, P.sageL][i % 3], gloss: 0.3 });
      R.carve(S.xf(S.line((p) => { p.moveTo(0, -4); p.lineTo(0, -L * 0.82); }, [0, -L, 0, 0], 2), new DOMMatrix().translate(bx, by).rotate(a)), 1.4, 'rgba(40,70,50,0.5)');
    });
    R.part(S.rr(138, 700, 52, 60, 12), { z: 16, dome: true, zs: 0.6, fill: '#c7baa2', gloss: 0.35, paint: (gg) => {
      gg.fillStyle = 'rgba(120,96,80,0.35)'; for (let i = 0; i < 18; i++) { gg.beginPath(); gg.arc(140 + rnd() * 48, 712 + rnd() * 44, 1.4, 0, 7); gg.fill(); }
    } });
    R.part(S.rr(132, 692, 64, 14, 6), { z: 22, r: 6, fill: '#b9ab92', gloss: 0.35 });
  }

  // ---- a small framed drawing
  R.part(S.rr(452, 468, 124, 156, 8), { z: 0, r: 10, fill: '#6c5243', gloss: 0.2 });
  R.part(S.rr(466, 482, 96, 128, 3), { z: 6, r: 1.5, fill: '#d6cdb9', paint: (gg) => {
    gg.fillStyle = '#8c8db4'; gg.fillRect(474, 490, 80, 112);
    gg.fillStyle = '#e9e2cf'; gg.beginPath(); gg.arc(530, 516, 9, 0, 7); gg.fill();
    gg.fillStyle = '#6d8a7a'; gg.beginPath(); gg.moveTo(474, 580); gg.quadraticCurveTo(500, 540, 520, 566); gg.quadraticCurveTo(540, 548, 554, 560); gg.lineTo(554, 602); gg.lineTo(474, 602); gg.fill();
    gg.fillStyle = '#4e6a5e'; gg.beginPath(); gg.moveTo(474, 594); gg.quadraticCurveTo(512, 572, 554, 590); gg.lineTo(554, 602); gg.lineTo(474, 602); gg.fill();
  } });

  // ---- shelf on the right wall: jar, books, a little clock
  R.part(S.rr(620, 598, 400, 26, 6), { z: 0, r: 18, zs: 0.9, fill: P.woodD, gloss: 0.2 });
  for (const bx of [664, 974]) R.part(S.blob([[bx - 12, 626], [bx + 14, 626], [bx + 6, 652], [bx - 10, 690]]), { z: 0, r: 9, fill: '#6f503d' });
  R.part(S.rr(646, 526, 58, 74, 15), { z: 22, dome: true, zs: 0.55, fill: '#9fb4a4', gloss: 0.75 });
  R.part(S.rr(650, 514, 50, 16, 5), { z: 30, r: 6, fill: '#86664c' });
  const books = [[724, 484, 30, 114, P.teal], [756, 470, 36, 128, P.cream], [794, 496, 28, 102, P.rose]];
  for (const [x, y, w, h, c] of books) {
    R.part(S.rr(x, y, w, h, 4), { z: 22, r: w / 2, zs: 0.45, fill: c, gloss: 0.12 });
    for (const yy of [y + 14, y + h - 22]) R.paint(S.rr(x + 2, yy, w - 4, 5, 1), 'rgba(235,225,200,0.55)');
  }
  {
    const lean = S.xf(S.rr(-30, -108, 30, 108, 4), new DOMMatrix().translate(858, 598).rotate(-16));
    R.part(lean, { z: 22, r: 15, zs: 0.45, fill: P.slate, gloss: 0.12 });
  }
  R.part(S.ell(918, 590, 9, 5), { z: 22, r: 4, fill: '#55576f' }); R.part(S.ell(950, 590, 9, 5), { z: 22, r: 4, fill: '#55576f' });
  R.part(S.ell(912, 510, 11, 11), { z: 26, dome: true, zs: 0.7, fill: '#8a9a8e', gloss: 0.6 }); R.part(S.ell(956, 510, 11, 11), { z: 26, dome: true, zs: 0.7, fill: '#8a9a8e', gloss: 0.6 });
  R.part(S.ell(934, 552, 40, 40), { z: 22, dome: true, zs: 0.55, fill: '#8fa597', gloss: 0.5 });
  R.part(S.ell(934, 552, 30, 30), { rel: true, z: 0, r: 0, fill: '#ece5d4', gloss: 0.85, paint: (gg) => {
    gg.fillStyle = '#4a4656';
    for (let i = 0; i < 12; i++) { const a = i * 30 * deg; gg.beginPath(); gg.arc(934 + 24 * Math.sin(a), 552 - 24 * Math.cos(a), i % 3 ? 1.3 : 2.2, 0, 7); gg.fill(); }
    gg.strokeStyle = '#3a3646'; gg.lineCap = 'round';
    gg.lineWidth = 4; gg.beginPath(); gg.moveTo(934, 552); gg.lineTo(934 + 13 * Math.sin(172 * deg), 552 - 13 * Math.cos(172 * deg)); gg.stroke();
    gg.lineWidth = 3; gg.beginPath(); gg.moveTo(934, 552); gg.lineTo(934 + 21 * Math.sin(300 * deg), 552 - 21 * Math.cos(300 * deg)); gg.stroke();
  } });

  // ---- floor, baseboard, rug (behind the desk)
  R.part(S.rr(-12, 1416, W + 24, 36, 4), { z: 0, r: 8, fill: '#46486f' });
  R.part(S.poly([[-30, 1450], [W + 30, 1450], [W + 30, H + 30], [-30, H + 30]]), { z: 0, tilt: [0, 0.28, 0, 1450], fill: P.woodF, gloss: 0.18 });
  for (let k = 1, y = 1450; k < 14; k++) {
    y += 24 + 7 * k;
    if (y > H) break;
    R.carve(S.line((p) => { p.moveTo(-20, y); p.lineTo(W + 20, y); }, [-20, y, W + 20, y], 2.5), 2.5, 'rgba(28,22,20,0.55)');
  }
  R.part(S.ell(540, 1735, 450, 112), { rel: true, z: 1, r: 5, fill: '#5a4964', paint: (gg) => {
    gg.strokeStyle = 'rgba(214,196,170,0.35)'; gg.lineWidth = 6; gg.beginPath(); gg.ellipse(540, 1735, 410, 92, 0, 0, 7); gg.stroke();
    gg.lineWidth = 3; gg.beginPath(); gg.ellipse(540, 1735, 380, 78, 0, 0, 7); gg.stroke();
  } });

  // ---- the desk: a tilted top (its normal leans up toward the lights), a rounded nose, an apron with a drawer, legs
  for (const lx of [70, 952]) R.part(S.rr(lx, 1222, 58, 352, 22), { z: 46, dome: true, zs: 0.8, fill: P.woodD, gloss: 0.2 });
  R.part(S.rr(52, 1102, 976, 124, 8), { z: 58, r: 8, fill: '#7f553c', gloss: 0.2 });
  for (const [x, w] of [[80, 272], [380, 320], [728, 272]]) R.part(S.rr(x, 1118, w, 92, 8), { z: 60, r: 6, fill: x === 380 ? '#8a5d42' : '#7a523a', gloss: 0.2 });
  R.part(S.ell(540, 1164, 13, 13), { z: 66, dome: true, fill: P.bronze, gloss: 0.8 });
  R.part(S.poly([[36, 1028], [W - 36, 1028], [W - 24, 1076], [24, 1076]]), { z: 22, tilt: [0, 1, 0, 1028], fill: P.wood, gloss: 0.3, paint: (gg) => {
    for (let i = 0; i < 16; i++) { gg.fillStyle = `rgba(80,48,30,${0.08 + 0.1 * rnd()})`; gg.fillRect(30, 1030 + rnd() * 44, W - 60, 1.2 + rnd()); }
  } });
  R.part(S.rr(18, 1072, W - 36, 32, 12), { z: 64, r: 13, fill: P.woodD, gloss: 0.3 });

  // ---- on the desk (resting line y ≈ 1058, base z 52): books + mug, the cat's body, matchbox, candle, teapot
  const Z = 52;
  for (const [x, y, w, h, c] of [[56, 1006, 206, 52, P.teal], [70, 966, 182, 42, P.ochre], [62, 930, 196, 38, P.rose]]) {
    R.part(S.rr(x, y, w, h, 7), { z: Z, r: 11, zs: 0.9, fill: c, gloss: 0.12 });
    R.paint(S.rr(x + 18, y + h * 0.3, 7, h * 0.4, 2), 'rgba(236,226,202,0.6)');
    R.paint(S.rr(x + w - 30, y + 5, 10, h - 10, 2), 'rgba(236,226,202,0.45)');
    R.carve(S.line((p) => { p.moveTo(x + 40, y + h / 2); p.lineTo(x + w - 46, y + h / 2); }, [x, y, x + w, y + h], 1.6), 1.2);
  }
  R.part(S.ring(196, 892, 15, 9, -1.4, 1.4), { z: 64, r: 4.5, fill: '#d6cbb8', gloss: 0.6 });
  R.part(S.rr(122, 858, 62, 74, 13), { z: 62, dome: true, zs: 0.6, fill: '#ddd3c2', gloss: 0.65, paint: (gg) => {
    gg.fillStyle = '#7d93a8'; gg.fillRect(122, 884, 62, 6); gg.fillRect(122, 896, 62, 3);
  } });

  // cat body (the head is a sprite): a curled loaf, a haunch, the tail around the front, paws
  const catBody = S.blob([[292, 1058], [284, 1000], [318, 946], [390, 912], [470, 904], [540, 922], [590, 972], [600, 1058]]);
  R.part(catBody, { z: Z, dome: true, zs: 0.85, fill: P.cat, gloss: 0.08, paint: (gg) => {
    gg.fillStyle = P.catG;
    gg.beginPath(); gg.ellipse(408, 936, 112, 52, -0.12, 0, 7); gg.fill();
    gg.beginPath(); gg.ellipse(318, 990, 40, 70, 0.3, 0, 7); gg.fill();
    gg.fillStyle = P.catD;
    for (const [x, y, a] of [[360, 920, -0.5], [400, 910, -0.2], [440, 908, 0.1], [478, 914, 0.4], [326, 952, -0.9], [306, 994, -1.3]]) {
      gg.beginPath(); gg.ellipse(x, y, 7, 26, a, 0, 7); gg.fill();
    }
    gg.strokeStyle = 'rgba(255,250,240,0.35)'; gg.lineWidth = 2; gg.lineCap = 'round';
    for (let i = 0; i < 26; i++) { const x = 330 + rnd() * 240, y = 960 + rnd() * 80; gg.beginPath(); gg.moveTo(x, y); gg.lineTo(x + 6, y - 9); gg.stroke(); }
  } });
  R.part(S.ell(372, 988, 74, 52, -0.2), { rel: true, z: 0, dome: true, zs: 0.25, alb: false });
  R.part(S.line((p) => { p.moveTo(304, 1030); p.bezierCurveTo(286, 1070, 420, 1072, 522, 1060); }, [286, 1030, 522, 1072], 28), { z: 64, r: 14, fill: P.catG, gloss: 0.08 });
  for (const x of [330, 372, 414, 456]) R.paint(S.ell(x, 1062 - (x - 330) * 0.02, 6, 13, 0.15), P.catD);
  R.paint(S.ell(512, 1060, 14, 12), P.cat);
  R.part(S.ell(548, 1053, 22, 11), { z: 64, dome: true, zs: 0.8, fill: P.cat });
  R.part(S.ell(582, 1056, 20, 10), { z: 64, dome: true, zs: 0.8, fill: P.cat });

  // matchbox
  R.part(S.rr(612, 1030, 76, 28, 5), { z: Z, r: 8, fill: P.blue, gloss: 0.15, paint: (gg) => {
    gg.fillStyle = '#d6ccb4'; gg.fillRect(622, 1036, 56, 14);
    gg.fillStyle = '#5a3a34'; gg.fillRect(612, 1030, 6, 28);
  } });
  // candle: bronze dish + cup + ring, wax stick with a melted top and a drip, wick
  // (dish and cup stand in FRONT of the candle's foot — higher z — or the stick would shadow them from its own flame)
  R.part(S.ell(772, 1056, 64, 13), { z: 66, r: 10, fill: P.bronze, gloss: 0.7 });
  R.part(S.ring(706, 1050, 12, 7), { z: 64, r: 3.5, fill: P.bronze, gloss: 0.7 });
  {
    const p = new Path2D();
    p.moveTo(749, 1036); p.lineTo(749, 892);
    p.bezierCurveTo(752, 880, 762, 888, 770, 882); p.bezierCurveTo(780, 877, 788, 886, 795, 880);
    p.lineTo(795, 1036); p.closePath();
    R.part({ p, bb: [749, 876, 795, 1036] }, { z: 58, dome: true, fill: P.wax, wax: 1, gloss: 0.3 });
    R.part(S.line((q) => { q.moveTo(757, 888); q.bezierCurveTo(756, 905, 758, 914, 756, 930); }, [756, 888, 758, 930], 8), { rel: true, z: 0, r: 3, fill: '#f2ead9', wax: 1, gloss: 0.3 });
    R.part(S.line((q) => { q.moveTo(772, 884); q.quadraticCurveTo(771, 872, 773, 862); }, [771, 862, 773, 884], 3.5), { z: 84, r: 1.5, fill: '#2d2622' });
  }
  R.part(S.rr(744, 1026, 58, 30, 10), { z: 74, dome: true, zs: 0.6, fill: '#9a875f', gloss: 0.7 });
  // teapot: glazed body with a band of dots, lid, knob, spout toward the candle, handle on the right
  R.part(S.ring(1004, 996, 28, 13, -1.5, 1.45), { z: 66, r: 6.5, fill: P.glaze, gloss: 0.85 });
  R.part(S.line((p) => { p.moveTo(878, 1016); p.quadraticCurveTo(846, 1004, 838, 958); }, [838, 958, 878, 1016], 18), { z: 66, r: 9, fill: P.glaze, gloss: 0.85 });
  R.part(S.ell(935, 1000, 74, 59), { z: Z, dome: true, zs: 0.95, fill: P.glaze, gloss: 0.9, paint: (gg) => {
    gg.fillStyle = 'rgba(230,222,200,0.85)';
    for (let i = 0; i < 11; i++) { const a = (-70 + i * 14) * deg; gg.beginPath(); gg.arc(935 + 70 * Math.sin(a), 992 + 4 * Math.cos(a * 2), 4, 0, 7); gg.fill(); }
    gg.fillRect(861, 1008, 150, 3);
  } });
  R.part(S.ell(935, 943, 40, 12), { z: 92, r: 8, fill: '#548481', gloss: 0.9 });
  R.part(S.ell(935, 929, 10, 9), { z: 98, dome: true, fill: '#d2c6ae', gloss: 0.6 });

  // ---- read back, derive
  const { alb, geo } = R.finalize({ seed: 11, brush: 0.45 });
  // mattes: R = sky (glass) coverage, G = the gobo (sky through the window, softened), B = wax, A = stars/moon
  const N = W * H, gobo = blur(R.sky, W, H, 3.5), mat = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) {
    mat[i * 4] = Math.round(clamp(R.sky[i]) * 255);
    mat[i * 4 + 1] = Math.round(clamp(gobo[i]) * 255);
    mat[i * 4 + 2] = Math.round(clamp(R.wax[i]) * 255);
    mat[i * 4 + 3] = Math.round(clamp(R.em[i]) * 255);
  }
  let maxH = 0;
  for (let i = 0; i < N; i++) maxH = Math.max(maxH, geo[i * 4 + 2]);
  return { alb, geo, mat, maxH };
}

// ================================================================ sprites: the hand with a match, the cat's head ×2
export function paintSprites() {
  const R = new Relief(ATLAS, ATLAS), rnd = rand(77);
  const skin = '#d8a886', skinD = '#c9926f', sleeve = '#55807f', sleeveD = '#4a7372';
  // hand (atlas region HAND, pivot = match head at (70, 70)); local heights 0..~55, the arm runs to the lower right
  R.part(S.blob([[236, 236], [262, 186], [334, 160], [700, 420], [1080, 690], [1080, 840], [900, 840], [560, 560]]), { z: 0, dome: true, zs: 0.7, fill: sleeve, gloss: 0.05, paint: (gg) => {
    gg.strokeStyle = 'rgba(30,50,52,0.45)'; gg.lineWidth = 3;
    for (let k = -6; k <= 6; k++) { gg.beginPath(); gg.moveTo(290 + k * 9, 200 + k * 11); gg.lineTo(1040 + k * 9, 760 + k * 11); gg.stroke(); }
  } });
  for (let k = -5; k <= 5; k++) R.carve(S.line((p) => { p.moveTo(300 + k * 9, 210 + k * 11); p.lineTo(1040 + k * 9, 760 + k * 11); }, [290, 150, 1060, 830], 2.5), 1.6);
  R.part(S.line((p) => { p.moveTo(232, 230); p.lineTo(318, 160); }, [232, 160, 318, 230], 44), { z: 6, r: 22, zs: 0.8, fill: sleeveD, gloss: 0.05 });
  for (let k = 0; k < 9; k++) {
    const u = k / 8, x = 232 + 86 * u, y = 230 - 70 * u;
    R.carve(S.line((p) => { p.moveTo(x - 11, y - 14); p.lineTo(x + 11, y + 14); }, [x - 12, y - 15, x + 12, y + 15], 3), 2.2, 'rgba(25,40,42,0.35)');
  }
  // matchstick and head (drawn before the fingers that hold it)
  R.part(S.line((p) => { p.moveTo(70, 70); p.lineTo(178, 168); }, [70, 70, 178, 168], 8), { z: 26, r: 4, fill: '#d9c19a', gloss: 0.1 });
  R.part(S.ell(68, 68, 9, 12, -48 * deg), { z: 28, dome: true, fill: '#5a2f2a', gloss: 0.25 });
  // index finger (behind the stick), back of the hand, curled fingers, thumb (over the stick), nails
  R.part(S.line((p) => { p.moveTo(214, 132); p.quadraticCurveTo(176, 112, 150, 138); }, [150, 112, 214, 138], 27), { z: 10, r: 13, fill: skin, gloss: 0.15 });
  R.part(S.blob([[160, 150], [204, 120], [246, 136], [268, 186], [242, 232], [192, 238], [156, 206]]), { z: 8, dome: true, zs: 0.6, fill: skin, gloss: 0.15, paint: (gg) => {
    gg.strokeStyle = 'rgba(150,95,70,0.35)'; gg.lineWidth = 2.5; gg.lineCap = 'round';
    for (const [x, y] of [[200, 150], [212, 170], [222, 190]]) { gg.beginPath(); gg.moveTo(x, y); gg.lineTo(x + 26, y + 10); gg.stroke(); }
  } });
  for (const [x, y] of [[156, 174], [158, 200], [172, 224]]) R.part(S.ell(x, y, 19, 14, 0.5), { z: 12, dome: true, zs: 0.8, fill: skinD, gloss: 0.15 });
  R.part(S.line((p) => { p.moveTo(232, 186); p.quadraticCurveTo(196, 184, 166, 160); }, [166, 160, 232, 190], 30), { z: 22, r: 15, fill: skin, gloss: 0.15 });
  R.paint(S.ell(170, 160, 8, 6, 0.6), 'rgba(245,215,200,0.85)');
  R.paint(S.ell(154, 137, 7, 5, 0.9), 'rgba(245,215,200,0.75)');

  // cat head ×2 (closed eyes / open eyes), local centre (120, 116)
  for (const [ox, oy, open] of [[...HEAD.a, false], [...HEAD.b, true]]) {
    const X = (x) => ox + x, Y = (y) => oy + y;
    for (const s of [-1, 1]) {   // ears
      const e = S.blob([[X(120 + s * 22), Y(70)], [X(120 + s * 58), Y(18)], [X(120 + s * 64), Y(82)]]);
      R.part(e, { z: 4, dome: true, zs: 0.5, fill: P.catG, gloss: 0.08 });
      R.paint(S.blob([[X(120 + s * 32), Y(68)], [X(120 + s * 55), Y(34)], [X(120 + s * 57), Y(76)]]), '#c3a1a2');
    }
    R.part(S.blob([[X(56), Y(118)], [X(70), Y(74)], [X(120), Y(58)], [X(170), Y(74)], [X(184), Y(118)], [X(166), Y(160)], [X(120), Y(174)], [X(74), Y(160)]]), {
      z: 6, dome: true, zs: 0.75, fill: P.cat, gloss: 0.08, paint: (gg) => {
        gg.fillStyle = P.catG;
        gg.beginPath(); gg.ellipse(X(120), Y(70), 50, 26, 0, 0, 7); gg.fill();
        gg.fillStyle = P.catD;
        for (const dx of [-16, 0, 16]) { gg.beginPath(); gg.ellipse(X(120 + dx), Y(64), 4.5, 15, dx * 0.02, 0, 7); gg.fill(); }
        gg.beginPath(); gg.ellipse(X(64), Y(120), 10, 3, 0.2, 0, 7); gg.fill(); gg.beginPath(); gg.ellipse(X(176), Y(120), 10, 3, -0.2, 0, 7); gg.fill();
      } });
    for (const s of [-1, 1]) R.part(S.ell(X(120 + s * 14), Y(142), 17, 14), { rel: true, z: 0, dome: true, zs: 0.5, fill: '#f0eadf', gloss: 0.08 });
    R.part(S.blob([[X(111), Y(128)], [X(129), Y(128)], [X(120), Y(139)]]), { rel: true, z: 0, r: 2, fill: '#b48586', gloss: 0.3 });
    R.paint(S.line((p) => { p.moveTo(X(120), Y(139)); p.lineTo(X(120), Y(146)); p.moveTo(X(106), Y(150)); p.quadraticCurveTo(X(113), Y(155), X(120), Y(146)); p.quadraticCurveTo(X(127), Y(155), X(134), Y(150)); }, [X(104), Y(138), X(136), Y(156)], 2.4), '#6e5a60');
    for (const s of [-1, 1]) for (const k of [0, 1]) {
      R.paint(S.line((p) => { p.moveTo(X(120 + s * 30), Y(144 + k * 7)); p.quadraticCurveTo(X(120 + s * 58), Y(140 + k * 9), X(120 + s * 84), Y(146 + k * 14)); }, [X(120 + s * 84), Y(130), X(120 + s * 30), Y(170)], 2.4), 'rgba(250,246,238,0.8)');
    }
    for (const [ex, ey] of HEAD.eyes) {
      if (open) {
        // the iris is painted past the lid ellipse so the shader can slide it (the cat's gaze) without showing fur
        R.part(S.ell(X(ex), Y(ey), HEAD.eye[0] + 5, HEAD.eye[1] + 5), { rel: true, z: 0, dome: true, zs: 0.5, fill: '#bccf9c', gloss: 0.95, paint: (gg) => {
          gg.fillStyle = '#9fb886'; gg.beginPath(); gg.arc(X(ex), Y(ey), 12, 0, 7); gg.fill();
          gg.fillStyle = '#1e1c26'; gg.beginPath(); gg.ellipse(X(ex), Y(ey), 4.5, 11, 0, 0, 7); gg.fill();
        } });
      } else {
        R.paint(S.line((p) => { p.moveTo(X(ex - 13), Y(ey - 1)); p.quadraticCurveTo(X(ex), Y(ey + 9), X(ex + 13), Y(ey - 1)); }, [X(ex - 13), Y(ey - 2), X(ex + 13), Y(ey + 8)], 3.6), '#3a3540');
      }
    }
  }
  const { alb, geo } = R.finalize({ seed: 21, brush: 0.25, sprite: true });
  return { alb, geo };
}

function mixHex(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = [16, 8, 0].map((s) => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k));
  return `rgb(${c.join(',')})`;
}
