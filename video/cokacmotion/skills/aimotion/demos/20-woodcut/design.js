/*
 * 20-woodcut/design.js — the block is carved here, once, in setup().
 *
 * The picture (a great wave, a small boat, a far mountain under the curl) is designed in PRINT orientation
 * (u, v) and written into the block MIRRORED, as a carver does: the printed sheet is flipped off the block.
 * Every shape is filled with Canvas 2D into an antialiased mask; an exact Euclidean distance transform
 * turns each mask into "how far inside the shape am I". The carved lines are iso-lines of those distances
 * (contour-parallel cuts that follow the form) or of hand-built phase fields (horizontal sky cuts, fall lines
 * radiating from the summit). Line width = tone: a dark area keeps fat lines with thin white cuts between,
 * a light area keeps hairlines, and where the tone fades the line tapers to a point — the gouge termination.
 *
 * Output: one RGBA8 texture over the whole block
 *   R raised surface (1 = left standing = prints black)   G depth of the cut (V-cut walls, gouge scoops)
 *   B when the knife reaches this texel (0..1 of carving)  A raised surface blurred (soft emboss / contact)
 * and the baren's rubbing record, and the washi fibre sheet.
 */
import { rand } from '../_lib/stage.js';

export const S = 1.5;                                        // texels per world pixel
export const BLOCK = { x: 90, y: 210, w: 900, h: 1300 };     // the wood block on the table (world px)
export const IMG = { x: 160, y: 300, w: 760, h: 1120 };      // carved picture area on the block
export const PAPER = { x: 120, y: 250, w: 840, h: 1220 };    // the sheet, registered on the kento
export const TW = Math.round(BLOCK.w * S), TH = Math.round(BLOCK.h * S);
const N = TW * TH;
const TAU = Math.PI * 2;
// print coords (u, v) → block texel: mirrored in x
const E = (IMG.x + IMG.w - BLOCK.x) * S, F = (IMG.y - BLOCK.y) * S;

const c01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const sm = (a, b, x) => { const t = c01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
function h2(x, y, s) {
  let h = (Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(s | 0, 0x9e3779b1)) | 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vn(x, y, s = 0) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = h2(ix, iy, s), b = h2(ix + 1, iy, s), c = h2(ix, iy + 1, s), d = h2(ix + 1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

// ------------------------------------------------------------ exact EDT (Felzenszwalb–Huttenlocher)
const INF = 1e20;
function dt1(f, n, d, v, z) {
  let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
    k++; v[k] = q; z[k] = s; z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; const dq = q - v[k]; d[q] = dq * dq + f[v[k]]; }
}
function edtCore(g) {           // g: 0 at sources, INF elsewhere → Euclidean distance in texels (in place)
  const n = Math.max(TW, TH);
  const f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  for (let x = 0; x < TW; x++) {
    for (let y = 0; y < TH; y++) f[y] = g[y * TW + x];
    dt1(f, TH, d, v, z);
    for (let y = 0; y < TH; y++) g[y * TW + x] = d[y];
  }
  for (let y = 0; y < TH; y++) {
    const o = y * TW;
    for (let x = 0; x < TW; x++) f[x] = g[o + x];
    dt1(f, TW, d, v, z);
    for (let x = 0; x < TW; x++) g[o + x] = Math.sqrt(d[x]);
  }
  return g;
}
/** distance (texels) from each texel inside the mask to the nearest texel outside it */
function inside(m) {
  const g = new Float32Array(N);
  for (let i = 0; i < N; i++) g[i] = m[i] >= 128 ? INF : 0;
  return edtCore(g);
}

// ------------------------------------------------------------ paths (print coordinates)
function cubicPath(start, segs) {
  const out = []; let p0 = start;
  for (const s of segs) {
    const seg = s.length === 2 ? [p0, p0, [s[0], s[1]], [s[0], s[1]]] : [p0, [s[0], s[1]], [s[2], s[3]], [s[4], s[5]]];
    out.push(seg); p0 = seg[3];
  }
  return out;
}
function bez(seg, t) {
  const [a, b, c, d] = seg, m = 1 - t, k0 = m * m * m, k1 = 3 * m * m * t, k2 = 3 * m * t * t, k3 = t * t * t;
  return [k0 * a[0] + k1 * b[0] + k2 * c[0] + k3 * d[0], k0 * a[1] + k1 * b[1] + k2 * c[1] + k3 * d[1]];
}
const at = (P, s) => { const k = Math.min(P.length - 1, Math.max(0, Math.floor(s))); return bez(P[k], Math.min(1, s - k)); };
function trace(c, P) {
  c.beginPath(); c.moveTo(P[0][0][0], P[0][0][1]);
  for (const [, b, cc, d] of P) c.bezierCurveTo(b[0], b[1], cc[0], cc[1], d[0], d[1]);
}
// the great wave: back slope → crest → lip → claws side → tip → inside of the tube → hollow face → trough
export const BIG = cubicPath([-260, 1400], [
  [-260, 700],
  [-60, 690, 30, 560, 90, 440],
  [140, 340, 200, 250, 290, 215],
  [370, 185, 455, 200, 502, 258],
  [540, 305, 548, 372, 520, 410],
  [500, 436, 462, 430, 455, 405],
  [470, 372, 468, 312, 425, 284],
  [385, 258, 320, 268, 300, 330],
  [284, 380, 290, 520, 340, 640],
  [390, 740, 480, 805, 570, 845],
  [640, 875, 720, 882, 1000, 880],
  [1000, 1400],
]);
// the small wave in front, breaking the other way
const SMALL = cubicPath([1000, 1400], [
  [1000, 905],
  [900, 885, 790, 850, 700, 858],
  [640, 864, 590, 900, 575, 950],
  [568, 975, 580, 995, 600, 990],
  [585, 1010, 572, 1060, 560, 1130],
  [560, 1400],
]);
const HZ = 700, SUN = [625, 170, 66], CREST = [300, 240], APEX = [469, 578];
const CLOUDS = [[330, 560, 98, 22, 1], [-40, 170, 150, 20, 2], [640, 800, 330, 18, 3], [560, 800, 470, 26, 4], [600, 800, 560, 14, 5]];
const gun = (t) => { const m = 1 - t; return [m * m * 240 + 2 * m * t * 390 + t * t * 585, m * m * 930 + 2 * m * t * 958 + t * t * 985]; };

function finger(c, x, y, ang, L, w0, bend) {
  const n = 16, left = [], right = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, a = ang + bend * Math.pow(s, 1.3), w = w0 * Math.pow(1 - s, 0.85) + 0.35;
    const nx = -Math.sin(a), ny = Math.cos(a);
    left.push([x + nx * w, y + ny * w]); right.push([x - nx * w, y - ny * w]);
    x += Math.cos(a) * L / n; y += Math.sin(a) * L / n;
  }
  c.beginPath(); c.moveTo(left[0][0], left[0][1]);
  for (const p of left) c.lineTo(p[0], p[1]);
  for (let i = right.length - 1; i >= 0; i--) c.lineTo(right[i][0], right[i][1]);
  c.fill();
}
function claw(c, x, y, ang, L, w0, bend, r) {
  c.beginPath(); c.arc(x, y, w0 * 1.25, 0, TAU); c.fill();
  for (const k of [-1, 0, 1]) {
    finger(c, x, y, ang + k * 0.42 + (r() - 0.5) * 0.15, L * (k === 0 ? 1 : 0.7 + r() * 0.14), w0 * (k === 0 ? 1 : 0.78), bend * (1 + 0.18 * k));
  }
}
function cloud(c, u0, u1, v, h, seed) {
  const r = rand(seed * 101);
  c.beginPath();
  c.moveTo(u0, v - h * 0.3); c.lineTo(u1, v - h * 0.3); c.lineTo(u1, v + h * 0.38); c.lineTo(u0, v + h * 0.38);
  c.moveTo(u0 + h * 0.34, v + 0.04 * h); c.arc(u0, v + 0.04 * h, h * 0.34, 0, TAU);
  for (let x = u0 + h * 0.5; x < u1 - h * 0.3; x += h * (0.7 + 0.35 * r())) {
    const rr = h * (0.42 + 0.3 * r());
    c.moveTo(x + rr, v - h * 0.18); c.arc(x, v - h * 0.18, rr, 0, TAU);
  }
  c.fill();
}
function glyphs(c, x0, y0, w, h, n, r) {
  for (let k = 0; k < n; k++) {
    const cy = y0 + k * h, m = 3 + Math.floor(r() * 3);
    for (let j = 0; j < m; j++) {
      const t = r();
      c.beginPath();
      if (t < 0.45) { const y = cy + 5 + r() * (h - 10); c.moveTo(x0 + 4 + r() * w * 0.25, y); c.lineTo(x0 + w - 4 - r() * w * 0.25, y + (r() - 0.5) * 2); }
      else if (t < 0.8) { const x = x0 + 5 + r() * (w - 10); c.moveTo(x, cy + 4 + r() * h * 0.3); c.lineTo(x + (r() - 0.5) * 3, cy + h - 4 - r() * h * 0.3); }
      else { const x = x0 + 6 + r() * (w - 12), y = cy + 6 + r() * (h - 12); c.moveTo(x, y); c.lineTo(x + (r() < 0.5 ? -6 : 6), y + 6); }
      c.stroke();
    }
  }
}

// ------------------------------------------------------------ the carving
export function carveBlock() {
  const cv = document.createElement('canvas');
  cv.width = TW; cv.height = TH;
  const ctx = cv.getContext('2d', { willReadFrequently: true });   // setup-only readback canvas
  const mask = (draw) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, TW, TH);
    ctx.setTransform(-S, 0, 0, S, E, F);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    draw(ctx);
    const d = ctx.getImageData(0, 0, TW, TH).data, a = new Uint8Array(N);
    for (let i = 0; i < N; i++) a[i] = d[i * 4 + 3];
    return a;
  };
  const texOf = (u, v) => { const x = Math.round(E - S * u), y = Math.round(F + S * v); return x < 0 || y < 0 || x >= TW || y >= TH ? -1 : y * TW + x; };
  const insideOf = (m, u, v) => { const i = texOf(u, v); return i >= 0 && m[i] >= 128; };
  const outward = (P, m, s) => {          // outward unit normal of path P at s (tested against its mask m)
    const a = at(P, s - 0.01), b = at(P, s + 0.01), p = at(P, s);
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    let nx = -ty, ny = tx;
    if (insideOf(m, p[0] + nx * 5, p[1] + ny * 5)) { nx = -nx; ny = -ny; }
    return [p, nx, ny];
  };

  const big = mask((c) => { trace(c, BIG); c.fill(); });
  const small = mask((c) => { trace(c, SMALL); c.fill(); });

  // foam along the crest (clipped to the wave), a bubbly inner edge, and the claws of the breaking lip
  const foamOf = (P, m, s0, s1, wmax, clawS, clawDir, seed) => mask((c) => {
    const r = rand(seed);
    const fw = (s) => 3 + wmax * sm(s0, s0 + 1.1, s) * (1 - 0.45 * sm(s1 - 1, s1, s));
    c.save(); trace(c, P); c.clip();
    for (let i = 0; i <= 800; i++) {
      const s = s0 + (s1 - s0) * i / 800, p = at(P, s);
      c.beginPath(); c.arc(p[0], p[1], fw(s), 0, TAU); c.fill();
    }
    for (let i = 0; i < 240; i++) {
      const s = s0 + 0.2 + r() * (s1 - s0 - 0.3), [p, nx, ny] = outward(P, m, s), rad = 2.5 + r() * 6.5, d = fw(s) + rad * 0.15;
      c.beginPath(); c.arc(p[0] - nx * d, p[1] - ny * d, rad, 0, TAU); c.fill();
    }
    c.restore();
    for (const s of clawS) {
      const [p, nx, ny] = outward(P, m, s);
      const ang = Math.atan2(ny + 0.35, nx + 0.28 * clawDir);
      claw(c, p[0] - nx * 3, p[1] - ny * 3, ang, 26 + 24 * r(), 6 + 3 * r(), 1.45 * clawDir, r);
    }
  });
  const rc = rand(44);
  const bigClaws = Array.from({ length: 9 }, (_, i) => 3.32 + i * (4.92 - 3.32) / 8 + (rc() - 0.5) * 0.08);
  const smallClaws = Array.from({ length: 4 }, (_, i) => 2.12 + i * 0.27 + (rc() - 0.5) * 0.05);
  const foamB = foamOf(BIG, big, 1.45, 5.97, 24, bigClaws, 1, 31);
  const foamS = foamOf(SMALL, small, 0.55, 3.0, 17, smallClaws, -1, 32);

  // spray falling off the lip like snow
  const drops = [];
  const rs = rand(53);
  for (let i = 0; i < 130; i++) {
    const s = 3.3 + rs() * 2.5, [p, nx, ny] = outward(BIG, big, Math.min(5.9, s)), d = 14 + 95 * rs() * rs();
    drops.push([p[0] + nx * d + 10 * rs(), p[1] + ny * d + d * 0.5 * rs(), 1.6 + 3.6 * rs() * rs()]);
  }
  for (let i = 0; i < 40; i++) {
    const s = 1.8 + rs() * 1.2, [p, nx, ny] = outward(SMALL, small, s), d = 8 + 50 * rs() * rs();
    drops.push([p[0] + nx * d, p[1] + ny * d, 1.4 + 2.6 * rs() * rs()]);
  }
  const dots = (extra) => mask((c) => { for (const [x, y, r] of drops) { c.beginPath(); c.arc(x, y, r + extra, 0, TAU); c.fill(); } });
  const sprayIn = dots(0), sprayOut = dots(1.4);

  // the boat in the trough and its huddled rowers
  const hullPath = (c) => { c.beginPath(); c.moveTo(240, 930); c.quadraticCurveTo(390, 958, 585, 985); c.lineTo(580, 1007); c.quadraticCurveTo(400, 1003, 262, 953); c.lineTo(240, 930); };
  const rowers = Array.from({ length: 7 }, (_, j) => gun(0.17 + j * 0.095));
  const boatShape = (c) => { hullPath(c); c.fill(); for (const [x, y] of rowers) { c.beginPath(); c.ellipse(x, y - 3, 9, 9, 0, 0, TAU); c.fill(); } };
  const boatHalo = mask((c) => { boatShape(c); c.lineWidth = 9; hullPath(c); c.stroke(); for (const [x, y] of rowers) { c.beginPath(); c.arc(x, y - 13, 10, 0, TAU); c.fill(); } });
  const boatInk = mask(boatShape);
  const heads = mask((c) => { for (const [x, y] of rowers) { c.beginPath(); c.arc(x, y - 13, 5.2, 0, TAU); c.fill(); } });
  const headsO = mask((c) => { for (const [x, y] of rowers) { c.beginPath(); c.arc(x, y - 13, 7.2, 0, TAU); c.fill(); } });
  const gunV = new Float32Array(800);
  for (let k = 0; k <= 400; k++) { const [x, y] = gun(k / 400); const xi = Math.round(x); if (xi >= 0 && xi < 800) gunV[xi] = y; }

  // the far mountain and its snow cap
  const mountPath = (c) => { c.beginPath(); c.moveTo(326, 704); c.quadraticCurveTo(418, 652, 459, 579); c.lineTo(479, 579); c.quadraticCurveTo(520, 652, 614, 704); c.lineTo(326, 704); };
  const mount = mask((c) => { mountPath(c); c.fill(); });
  const snow = mask((c) => {
    const r = rand(61);
    c.save(); mountPath(c); c.clip();
    c.beginPath(); c.moveTo(300, 560); c.lineTo(640, 560);
    for (let i = 0, u = 640; u >= 300; u -= 7, i++) c.lineTo(u, 611 + 5 * Math.sin(u * 0.05) + (i % 2 ? 6 + 24 * r() : 0));
    c.fill(); c.restore();
  });
  const clouds = mask((c) => { for (const k of CLOUDS) cloud(c, ...k); });

  // cartouche with (pseudo) carved characters, and a square seal
  const rt = rand(71);
  const textBg = mask((c) => { c.fillRect(22, 22, 46, 150); c.fillRect(27, 182, 36, 36); });
  const textInk = mask((c) => {
    c.lineWidth = 2.6; c.strokeRect(23.5, 23.5, 43, 147); c.lineWidth = 1.2; c.strokeRect(28, 28, 34, 138);
    c.lineWidth = 2.5; glyphs(c, 30, 32, 30, 33, 4, rt);
    c.fillRect(27, 182, 36, 36);
    c.globalCompositeOperation = 'destination-out'; c.lineWidth = 2.6; glyphs(c, 30, 184, 30, 32, 1, rt);
    c.globalCompositeOperation = 'source-over';
  });

  const bigD = inside(big), smallD = inside(small), foamBD = inside(foamB), foamSD = inside(foamS);
  const mountD = inside(mount), snowD = inside(snow), cloudsD = inside(clouds);

  // ---------------------------------------------------------- compose: raised surface + carve schedule
  const R = new Float32Array(N), CT = new Float32Array(N);
  const hatch = (phi, T, sTex) => { const f = phi - Math.floor(phi); return c01(T * sTex * 0.5 - Math.min(f, 1 - f) * sTex + 0.5); };
  const band = (e, w) => c01(w * S - e + 0.5);                                   // outline: e = texels inside the edge
  const line = (e, d0, w) => c01(w * S * 0.5 - Math.abs(e - d0 * S) + 0.5);       // a contour line d0 px inside
  const kento = (x, y) => ((y > 1470 && y < 1477 && ((x > 896 && x < 967) || (x > 196 && x < 300))) || (x > 960 && x < 967 && y > 1418 && y < 1477)) ? 1 : 0;

  for (let ty = 0; ty < TH; ty++) {
    const y = BLOCK.y + (ty + 0.5) / S, v = y - IMG.y;
    for (let tx = 0; tx < TW; tx++) {
      const i = ty * TW + tx, x = BLOCK.x + (tx + 0.5) / S, u = IMG.x + IMG.w - x;
      if (u < 0 || u > IMG.w || v < 0 || v > IMG.h) {
        // the margin is cleared last, in big gouge chunks; only the registration marks stand
        R[i] = kento(x, y);
        CT[i] = 0.8 + 0.17 * h2(Math.floor(x / 34), Math.floor(y / 52), 9);
        continue;
      }
      const base = 0.02 + 0.7 * c01(Math.hypot(u - CREST[0], v - CREST[1]) / 950);
      const chunk = () => base + 0.08 * h2(Math.floor(u / 16), Math.floor(v / 16), 11);
      let val, ct, a;
      if (v < HZ) {          // sky: horizontal cuts, darker toward the top, broken into tapering dashes
        const phi = (v + 2.2 * Math.sin(u * 0.013 + v * 0.002) + 4 * (vn(u * 0.008, v * 0.008, 3) - 0.5)) / 12, k = Math.floor(phi);
        const T = (0.07 + 0.55 * Math.pow(1 - sm(20, 640, v), 1.2)) * sm(0.14, 0.42, vn(u * 0.018 + k * 7.31, k * 3.7, 5));
        val = hatch(phi, T, 12 * S);
        ct = base + 0.07 * h2(k, 1, 7) + 0.05 * ((k & 1) ? u : IMG.w - u) / IMG.w;
      } else {               // distant sea: finer cuts
        const phi = (v + 1.4 * Math.sin(u * 0.045 + v * 0.11)) / 7, k = Math.floor(phi);
        const T = (0.28 + 0.3 * sm(HZ, 880, v)) * (0.4 + 0.6 * sm(0.1, 0.45, vn(u * 0.03 + k * 5.1, k * 2.3, 6)));
        val = hatch(phi, T, 7 * S);
        ct = base + 0.06 * h2(k, 2, 7) + 0.04 * ((k & 1) ? u : IMG.w - u) / IMG.w;
      }
      if ((a = clouds[i] / 255) > 0) {
        const e = Math.max(0, cloudsD[i] - 0.5);
        val += (Math.max(band(e, 2.4), line(e, 7, 1.1)) - val) * a;
        if (a > 0.5) ct = chunk();
      }
      {                      // the sun: a cleared disc, a rim, and a thin halo ring
        const dr = Math.hypot(u - SUN[0], v - SUN[1]) - SUN[2];
        a = c01(0.5 - dr * S);
        if (a > 0) { val += (band(-dr * S, 3.2) - val) * a; if (a > 0.5) ct = chunk(); }
        val = Math.max(val, c01(1.1 * S - Math.abs(dr - 11) * S + 0.5));
      }
      if ((a = mount[i] / 255) > 0) {   // fall lines radiating from the summit
        const e = Math.max(0, mountD[i] - 0.5), du = u - APEX[0], dv = v - APEX[1], rr = Math.hypot(du, dv) + 1e-3;
        const phi = Math.atan2(du, dv) / 0.05 + 0.3 * (vn(u * 0.05, v * 0.05, 13) - 0.5), sTex = Math.max(1, rr * 0.05 * S);
        let ink = Math.max(hatch(phi, 0.42 + 0.38 * sm(10, 120, rr), sTex), band(e, 2.4));
        const as = snow[i] / 255;
        if (as > 0) {
          const es = Math.max(0, snowD[i] - 0.5);
          const streak = hatch(phi, 0.16 * sm(30, 60, rr) * sm(0.35, 0.6, vn(phi * 0.7, rr * 0.06, 14)), sTex);
          ink += (Math.max(band(es, 1.6), streak, band(e, 2.4)) - ink) * as;
        }
        val += (ink - val) * a;
        if (a > 0.5) ct = as > 0.5 ? chunk() : base + 0.05 * h2(Math.floor(phi), 4, 7);
      }
      const wave = (m, md, spacing, dark, salt) => {   // contour-parallel cuts following the water's surface
        const e = Math.max(0, md[i] - 0.5), ep = e / S, nz = vn(u * 0.012, v * 0.012, 21 + salt);
        const phi = ep / spacing + 0.35 * (nz - 0.5), k = Math.floor(phi);
        let T = (0.2 + 0.7 * sm(4, dark, ep)) * (0.8 + 0.2 * Math.sin(ep / 30 + 4 * nz));
        T = c01(T * (0.9 + 0.2 * vn(u * 0.04, v * 0.04, 22 + salt)));
        const am = m[i] / 255;
        val += (Math.max(hatch(phi, T, spacing * S), band(e, 3)) - val) * am;
        if (am > 0.5) ct = base + 0.05 * h2(k, 3 + salt, 7) + 0.05 * ((k & 1) ? u : IMG.w - u) / IMG.w;
      };
      const foam = (m, md) => {
        const am = m[i] / 255;
        if (am <= 0) return;
        const e = Math.max(0, md[i] - 0.5);
        val += (Math.max(band(e, 2.6), line(e, 6.5, 1.1)) - val) * am;
        if (am > 0.5) ct = chunk();
      };
      if (big[i]) wave(big, bigD, 8, 150, 0);
      foam(foamB, foamBD);
      if ((a = sprayOut[i] / 255) > 0) { val += (1 - val) * a; val *= 1 - sprayIn[i] / 255; }
      if ((a = boatHalo[i] / 255) > 0) { val *= 1 - a; if (a > 0.5) ct = chunk(); }
      if ((a = boatInk[i] / 255) > 0) {
        const ui = Math.round(u), gv = ui > 262 && ui < 575 ? gunV[ui] + 7.5 : -99;
        val += (c01(1 - c01(1.1 * S - Math.abs(v - gv) * S + 0.5)) - val) * a;
      }
      if ((a = headsO[i] / 255) > 0) { val += (1 - val) * a; val *= 1 - heads[i] / 255; }
      if (small[i]) wave(small, smallD, 7, 110, 5);
      foam(foamS, foamSD);
      if ((a = textBg[i] / 255) > 0) { val *= 1 - a; if (a > 0.5) ct = chunk(); }
      val = Math.max(val, textInk[i] / 255);
      // keyline round the picture
      const ef = Math.min(u, IMG.w - u, v, IMG.h - v);
      val = Math.max(val, c01((4 - ef) * S + 0.5));
      R[i] = val; CT[i] = ct;
    }
  }

  // ---------------------------------------------------------- depth: V-cut walls near lines, gouge scoops in clearings
  const g = new Float32Array(N);
  for (let i = 0; i < N; i++) g[i] = R[i] >= 0.5 ? 0 : INF;
  const dc = edtCore(g);
  const scoop = new Float32Array(N), rg = rand(77);
  for (let cy = 0; cy < TH; cy += 18) for (let cx = 0; cx < TW; cx += 18) {
    const px = cx + rg() * 18, py = cy + rg() * 18, ci = Math.min(TH - 1, py | 0) * TW + Math.min(TW - 1, px | 0);
    const ang = 3 * vn(px * 0.004, py * 0.004, 41) + (rg() - 0.5) * 0.5, len = 26 + rg() * 30, wid = 8 + rg() * 6;
    if (dc[ci] < 9) continue;
    const ca = Math.cos(ang), sa = Math.sin(ang), ext = Math.ceil(len);
    for (let yy = Math.max(0, Math.floor(py - ext)); yy < Math.min(TH, py + ext); yy++) {
      for (let xx = Math.max(0, Math.floor(px - ext)); xx < Math.min(TW, px + ext); xx++) {
        const dx = xx - px, dy = yy - py, qx = (dx * ca + dy * sa) / len, qy = (-dx * sa + dy * ca) / wid, w2 = qx * qx + qy * qy;
        if (w2 < 1) { const p = Math.sqrt(1 - w2), j = yy * TW + xx; if (p > scoop[j]) scoop[j] = p; }
      }
    }
  }
  // blurred raised surface (two box passes ≈ gaussian) for soft contact and emboss normals
  const blur = Float32Array.from(R), tmp = new Float32Array(N), BR = 4;
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < TH; y++) {
      const o = y * TW; let s = 0;
      for (let x = -BR; x <= BR; x++) s += blur[o + Math.min(TW - 1, Math.max(0, x))];
      for (let x = 0; x < TW; x++) {
        tmp[o + x] = s / (2 * BR + 1);
        s += blur[o + Math.min(TW - 1, x + BR + 1)] - blur[o + Math.max(0, x - BR)];
      }
    }
    for (let x = 0; x < TW; x++) {
      let s = 0;
      for (let y = -BR; y <= BR; y++) s += tmp[Math.min(TH - 1, Math.max(0, y)) * TW + x];
      for (let y = 0; y < TH; y++) {
        blur[y * TW + x] = s / (2 * BR + 1);
        s += tmp[Math.min(TH - 1, y + BR + 1) * TW + x] - tmp[Math.max(0, y - BR) * TW + x];
      }
    }
  }
  const out = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) {
    const d = dc[i], wide = sm(7, 18, d);
    const depth = R[i] >= 0.5 ? 0 : (1 - Math.exp(-d / 5)) * (1 - wide) + wide * (0.55 + 0.45 * scoop[i]);
    out[i * 4] = Math.round(c01(R[i]) * 255);
    out[i * 4 + 1] = Math.round(c01(depth) * 255);
    out[i * 4 + 2] = Math.round(c01(CT[i]) * 255);
    out[i * 4 + 3] = Math.round(c01(blur[i]) * 255);
  }
  return out;
}

// ------------------------------------------------------------ the baren: path and rubbing record
export const RB = 115;                          // baren radius (world px)
export const RUB = { t0: 5.15, t1: 6.85 };      // rubbing interval (s)
/** baren centre at rubbing progress s ∈ [0,1]: six zig-zag rows, four small circles per row */
export function barenAt(s) {
  const rows = 6, f0 = Math.min(rows - 1e-6, Math.max(0, s * rows)), i = Math.floor(f0), f = f0 - i;
  const yr = (k) => PAPER.y + 130 + Math.min(rows - 1, k) * (PAPER.h - 260) / (rows - 1);
  const xa = PAPER.x + 150, xb = PAPER.x + PAPER.w - 150, gq = Math.min(1, f / 0.86), dir = i % 2 ? -1 : 1;
  const x = dir > 0 ? xa + (xb - xa) * gq : xb - (xb - xa) * gq;
  const y = yr(i) + (yr(i + 1) - yr(i)) * sm(0.86, 1, f);
  const th = TAU * 4 * f * dir;
  return [x + 52 * Math.cos(th), y + 52 * Math.sin(th)];
}
/**
 * Pressure under the baren, accumulated along its path on a 2-px grid over the sheet. The baren's coil
 * (a flat spiral of twisted cord) presses in rings ~7.5 px apart and the hand presses unevenly, so the
 * record carries circular swirls. Returns the final pressure (relative to the mean, /2 → R8) and, per cell,
 * the moments (0..1 of rubbing) at which 10/35/65/95 % of that final pressure had been reached.
 */
export function bakeRub() {
  const C = 2, GW = PAPER.w / C, GH = PAPER.h / C, KR = Math.ceil(RB / C), KS = 2 * KR + 1;
  const K = new Float32Array(KS * KS);
  for (let dy = -KR; dy <= KR; dy++) for (let dx = -KR; dx <= KR; dx++) {
    const d = Math.hypot(dx, dy) * C;
    if (d < RB) { const r = d / RB; K[(dy + KR) * KS + dx + KR] = Math.sqrt(1 - r * r) * (0.6 + 0.4 * (0.5 + 0.5 * Math.cos(d * TAU / 7.5))); }
  }
  const NS = 1500, acc = new Float32Array(GW * GH);
  const run = (onCell) => {
    acc.fill(0);
    for (let k = 0; k <= NS; k++) {
      const s = k / NS, [bx, by] = barenAt(s), wk = 0.7 + 0.6 * vn(k * 0.045, 0.5, 91);
      const cx = Math.round((bx - PAPER.x) / C), cy = Math.round((by - PAPER.y) / C);
      for (let dy = -KR; dy <= KR; dy++) {
        const y = cy + dy; if (y < 0 || y >= GH) continue;
        for (let dx = -KR; dx <= KR; dx++) {
          const x = cx + dx; if (x < 0 || x >= GW) continue;
          const kv = K[(dy + KR) * KS + dx + KR]; if (kv <= 0) continue;
          const j = y * GW + x;
          acc[j] += kv * wk;
          if (onCell) onCell(j, s);
        }
      }
    }
  };
  run(null);
  const fin = Float32Array.from(acc);
  let mean = 0, cnt = 0;
  for (let y = 40; y < GH - 40; y++) for (let x = 40; x < GW - 40; x++) { mean += fin[y * GW + x]; cnt++; }
  mean /= cnt;
  const thr = new Uint8Array(GW * GH * 4).fill(255), L = [0.1, 0.35, 0.65, 0.95];
  run((j, s) => {
    for (let q = 0; q < 4; q++) if (thr[j * 4 + q] === 255 && acc[j] >= L[q] * fin[j]) thr[j * 4 + q] = Math.round(s * 254);
  });
  const fr = new Uint8Array(GW * GH * 4);
  for (let j = 0; j < GW * GH; j++) { fr[j * 4] = Math.round(c01(fin[j] / mean / 2) * 255); fr[j * 4 + 3] = 255; }
  return { GW, GH, thr, fin: fr };
}

/** washi: long kozo fibres (R) and a few bark specks (G), on the sheet plus a 12-px margin, 1.25 texel/px */
export function paperFibres() {
  const FW = Math.round((PAPER.w + 24) * 1.25), FH = Math.round((PAPER.h + 24) * 1.25);
  const c = document.createElement('canvas'); c.width = FW; c.height = FH;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, FW, FH);
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  const r = rand(5);
  for (let i = 0; i < 9000; i++) {
    const x = r() * FW, y = r() * FH, L = (12 + 80 * r() * r()) * 1.25, a = r() * TAU, bend = (r() - 0.5) * 1.2;
    g.strokeStyle = `rgba(255,0,0,${(0.04 + 0.14 * r()).toFixed(3)})`; g.lineWidth = 0.5 + r() * 1.1;
    g.beginPath(); g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 - Math.sin(a) * L * bend * 0.3, y + Math.sin(a) * L * 0.5 + Math.cos(a) * L * bend * 0.3,
      x + Math.cos(a + bend) * L, y + Math.sin(a + bend) * L);
    g.stroke();
  }
  for (let i = 0; i < 260; i++) {
    const x = r() * FW, y = r() * FH, L = 2 + 7 * r(), a = r() * TAU;
    g.strokeStyle = `rgba(0,255,0,${(0.4 + 0.6 * r()).toFixed(3)})`; g.lineWidth = 0.8 + 1.2 * r();
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
  }
  return c;
}
