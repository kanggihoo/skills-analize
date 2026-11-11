/*
 * 19 · 두껍게 바른 유화 — stroke-based painterly rendering with real paint thickness (WebGL2, instancing, MRT).
 *
 * setup: a procedural night scene (swirling sky from a stream function ψ with vortices around the swirls, the moon
 * and the stars; hills along contour lines; a village; a flame-shaped cypress) is sampled on a 3 px grid
 * (colour, flow direction, region). ~8000 brush strokes are traced along that flow field (Hertzmann-style curved
 * strokes that stop where the colour changes or the region ends) in four passes: block-in, main strokes, detail,
 * impasto accents. Each stroke = 8 spine points, width, length, two paints (the brush carries two colours in lanes),
 * thickness, gloss, dryness, a birth time and a duration — packed once into an instance buffer sorted by birth.
 * frame(t): clear, then ONE instanced draw of every stroke born by t (a triangle strip of 38 vertices each). The vertex
 * shader walks the Catmull–Rom spine only up to the stroke's progress (it draws itself on); the fragment shader makes
 * the bristle grooves, ragged edges, rounded caps, dry-brush breaks on the canvas weave, ridges where paint is pushed
 * aside and piled at the tip, and writes premultiplied colour + height into two float targets (MRT). The blend keeps
 * 35% of the relief under a new stroke (wet paint pushes old paint down rather than erasing it).
 * Lighting: normals from the height field (+ the linen weave where paint is thin), height-field cast shadows,
 * blurred-height occlusion, Blinn–Phong oil gloss. At the end a low lamp travels across the canvas (raking light).
 * Pure function of t: everything is redrawn from the stroke list every frame.
 */
import { defineDemo, track, ease, rand, clamp, lerp, smooth } from '../_lib/stage.js';

const D = 10;
const W0 = 1080, H0 = 1920;
const GROUND = [0.45, 0.26, 0.15];        // burnt-sienna imprimatura on the canvas

// ---------- deterministic value noise (JS) ----------
const hh = (i, j) => { let h = (i * 374761393 + j * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const vn = (x, y) => {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hh(i, j), hh(i + 1, j), u), lerp(hh(i, j + 1), hh(i + 1, j + 1), u), v);
};
const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const ramp3 = (stops, x) => {
  if (x <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) if (x <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], smooth((x - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])));
  return stops[stops.length - 1][1];
};

// ---------- the scene (stage px, y down) ----------
const SKY = 0, MOONC = 1, STARC = 2, FAR = 3, MID = 4, NEAR = 5, VILL = 6, CYP = 7;
const hillF = (x) => 1135 + 38 * Math.sin(x / 170 + 0.5) + 22 * Math.sin(x / 63 + 2) - 70 * Math.exp(-(((x - 860) / 170) ** 2));
const hillM = (x) => 1340 + 45 * Math.sin(x / 240 + 1.3) + 18 * Math.sin(x / 90);
const hillN = (x) => 1580 + 45 * Math.sin(x / 300 + 2.2) + 14 * Math.sin(x / 70 + 1);
const slope = (f, x) => (f(x + 1) - f(x - 1)) / 2;
const CY_TOP = 300, CY_BASE = 1960;
const cyX = (y) => 215 + 28 * Math.sin(y / 150 + 0.6) + 12 * Math.sin(y / 53);
const cyHW = (y) => { const s = clamp((y - CY_TOP) / (CY_BASE - CY_TOP)); return 105 * Math.pow(s, 0.6) * (1 + 0.16 * Math.sin(y / 38 + 1.2) + 0.09 * Math.sin(y / 17)); };
const MOON = { x: 850, y: 300, r: 58, halo: 165 };
const STARS = [[120, 170, 46], [335, 105, 36], [585, 175, 42], [470, 390, 30], [985, 560, 48], [690, 395, 26],
  [905, 880, 42], [625, 950, 30], [370, 960, 36], [1030, 130, 28], [80, 560, 34]];
// vortices of the stream function: x, y, radius, strength, x-stretch
const VORT = [[470, 690, 230, 2.6, 1.3], [745, 600, 140, -2.2, 1.1], [250, 330, 100, 1.5, 1.0], [MOON.x, MOON.y, MOON.halo, 2.0, 1.0],
  ...STARS.map(([x, y, r]) => [x, y, r * 1.1, 1.8, 1.0])];
const psiAt = (x, y) => {
  let p = y + 55 * Math.sin(x / 200 + 0.8) * Math.exp(-(((y - 950) / 150) ** 2)) + 30 * Math.sin(x / 150 + 2.0) * Math.exp(-(((y - 230) / 140) ** 2));
  for (const [vx, vy, R, G, ax] of VORT) { const dx = (x - vx) / ax, dy = y - vy; p += G * R * Math.exp(-(dx * dx + dy * dy) / (R * R)); }
  return p;
};

// village: two rows of little houses on the slope, a church with a spire
const HOUSES = [];
{
  const r = rand(77);
  const WALLS = [[0.38, 0.44, 0.58], [0.66, 0.52, 0.30], [0.70, 0.68, 0.58], [0.30, 0.36, 0.50]];
  const ROOFS = [[0.16, 0.18, 0.30], [0.50, 0.28, 0.16], [0.22, 0.26, 0.36]];
  for (const row of [0, 1]) {
    let x = row ? 470 : 445;
    while (x < 1010) {
      const k = row ? 0.75 : 1;
      const w = (26 + r() * 18) * k, h = (20 + r() * 16) * k, roof = (9 + r() * 8) * k;
      const base = hillM(x + w / 2) - (row ? 40 + r() * 12 : 4 + r() * 12);
      const church = !row && x > 660 && x < 720 && !HOUSES.some((q) => q.church);
      const ww = church ? 36 : w, hh2 = church ? 50 : h;
      const hs = { x0: x, x1: x + ww, yb: base, yt: base - hh2, roof: church ? 18 : roof, church, row,
        wall: WALLS[Math.floor(r() * WALLS.length)], roofC: ROOFS[Math.floor(r() * ROOFS.length)], win: [] };
      const nw = church ? 2 : 1 + (r() < 0.5 ? 1 : 0);
      for (let i = 0; i < nw; i++) hs.win.push([x + ww * (nw === 1 ? 0.3 + 0.35 * r() : 0.22 + 0.42 * i), base - hh2 * (0.42 + 0.12 * r()), 7 * k, 9 * k]);
      HOUSES.push(hs);
      x += ww + (row ? 10 : 4) + r() * 16;
    }
  }
}
const inTri = (x, y, ax, ay, bx, by, cx, cy) => {
  const d1 = (x - bx) * (ay - by) - (ax - bx) * (y - by), d2 = (x - cx) * (by - cy) - (bx - cx) * (y - cy), d3 = (x - ax) * (cy - ay) - (cx - ax) * (y - ay);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};
function house(x, y) {
  // front row wins over back row; returns the colour or null
  for (let pass = 0; pass < 2; pass++) for (const h of HOUSES) {
    if (h.row !== pass) continue;
    const m = (h.x0 + h.x1) / 2;
    if (h.church && inTri(x, y, m - 8, h.yt - h.roof + 2, m + 8, h.yt - h.roof + 2, m, h.yt - h.roof - 170)) return [0.20, 0.24, 0.40];
    if (x >= h.x0 && x <= h.x1 && y >= h.yt && y <= h.yb) {
      for (const [wx, wy, ww, wh] of h.win) if (x >= wx && x <= wx + ww && y >= wy && y <= wy + wh) return [1.0, 0.86, 0.36];
      return h.wall;
    }
    if (inTri(x, y, h.x0 - 3, h.yt, h.x1 + 3, h.yt, m, h.yt - h.roof)) return h.roofC;
  }
  return null;
}

const TOP = [0.09, 0.15, 0.42], MIDC = [0.15, 0.29, 0.60], HOR = [0.32, 0.50, 0.64];
const LIGHT = [0.55, 0.72, 0.86], PALE = [0.80, 0.88, 0.90], WARM = [0.86, 0.86, 0.55];
const HALO = [[0, [1.0, 0.97, 0.82]], [0.25, [1.0, 0.90, 0.46]], [0.5, [0.96, 0.80, 0.30]], [0.72, [0.80, 0.84, 0.55]], [0.97, [0.56, 0.72, 0.84]]];
const MHALO = [[0.35, [1.0, 0.86, 0.38]], [0.55, [0.98, 0.90, 0.55]], [0.76, [0.90, 0.88, 0.62]], [1.0, [0.60, 0.74, 0.84]]];

// exact scene: { r: region, c: colour (sRGB-ish), f: flow direction (unnormalised; sky flow comes from the ψ grid) }
function sceneExact(x, y, p) {
  // the cypress: a dark flame, rising and curling outward
  const cx = cyX(y), hw = cyHW(y);
  if (y > CY_TOP - 6 && Math.abs(x - cx) < hw + 12 * (vn(x / 18, y / 26) - 0.5)) {
    const lat = (x - cx) / Math.max(hw, 1);
    const b = 0.5 + 0.5 * Math.sin(y / 23 + lat * 3.2 + 4 * vn(x / 60, y / 90));
    let c = mix([0.04, 0.09, 0.06], [0.15, 0.23, 0.10], smooth(b));
    c = mix(c, [0.22, 0.15, 0.07], smooth((vn(x / 30, y / 70) - 0.62) / 0.15) * 0.8);
    c = mix(c, [0.20, 0.30, 0.33], smooth((lat - 0.35) / 0.5) * 0.55 * b);     // moonlit right flank
    return { r: CYP, c, f: [0.45 * Math.sin(y / 45 + lat * 2.5) + 0.4 * lat, -1] };
  }
  const hc = house(x, y);
  if (hc) return { r: VILL, c: hc, f: [1, 0.12 * Math.sin(x / 9)] };
  const yF = hillF(x), yM = hillM(x), yN = hillN(x);
  if (y > yN) {
    const b = 0.5 + 0.5 * Math.sin((y - yN) * 0.11 + 3 * vn(x / 90, y / 60));
    const c = ramp3([[0, [0.05, 0.08, 0.10]], [0.6, [0.10, 0.15, 0.12]], [1, [0.17, 0.19, 0.10]]], b);
    return { r: NEAR, c, f: [1, slope(hillN, x) + 0.25 * Math.sin(x / 50 + y / 35)] };
  }
  if (y > yM) {
    const b = 0.5 + 0.5 * Math.sin((y - yM) * 0.13 + 3 * vn(x / 80, y / 50));
    const c = ramp3([[0, [0.10, 0.18, 0.25]], [0.55, [0.17, 0.27, 0.30]], [1, [0.25, 0.30, 0.20]]], b);
    const k = clamp((y - yM) / Math.max(yN - yM, 1));
    return { r: MID, c, f: [1, lerp(slope(hillM, x), slope(hillN, x), k) + 0.22 * Math.sin(x / 55 + y / 30)] };
  }
  if (y > yF) {
    const b = 0.5 + 0.5 * Math.sin((y - yF) * 0.12 + 3 * vn(x / 80, y / 50));
    const c = ramp3([[0, [0.18, 0.24, 0.42]], [0.5, [0.24, 0.30, 0.52]], [0.8, [0.31, 0.38, 0.56]], [1, [0.24, 0.34, 0.37]]], b);
    const k = clamp((y - yF) / Math.max(yM - yF, 1));
    return { r: FAR, c, f: [1, lerp(slope(hillF, x), slope(hillM, x), k) + 0.2 * Math.sin(x / 60 + y / 40)] };
  }
  // sky: banded along the streamlines of ψ, glowing swirl cores, warm streaks, halos
  const k = clamp(y / 1150);
  const base = k < 0.55 ? mix(TOP, MIDC, smooth(k / 0.55)) : mix(MIDC, HOR, smooth((k - 0.55) / 0.45));
  const b = smooth(0.5 + 0.5 * Math.sin(p * 0.16 + 5 * vn(x / 260, y / 260)));
  let c = mix(mul(base, 0.68), mix(base, LIGHT, 0.5), b);
  for (const v of [VORT[0], VORT[1]]) {
    const dx = (x - v[0]) / v[4], dy = y - v[1];
    c = mix(c, mix(LIGHT, PALE, b), Math.exp(-(dx * dx + dy * dy) / ((0.62 * v[2]) ** 2)) * 0.75);
  }
  {
    const v = VORT[0], dx = (x - v[0]) / v[4], dy = y - v[1];
    const w2 = 0.5 + 0.5 * Math.sin(p * 0.055 + 1.0);
    c = mix(c, WARM, smooth((w2 - 0.8) / 0.14) * Math.exp(-(dx * dx + dy * dy) / ((1.25 * v[2]) ** 2)) * 0.7);
  }
  let r = SKY;
  for (const [sx, sy, R] of STARS) {
    const rn = Math.hypot(x - sx, y - sy) / R;
    if (rn < 1.25) c = mix(c, ramp3(HALO, rn), 1 - smooth((rn - 0.85) / 0.4));
    if (rn < 0.42) r = STARC;
  }
  const mr = Math.hypot(x - MOON.x, y - MOON.y);
  if (mr < MOON.halo * 1.25) c = mix(c, ramp3(MHALO, mr / MOON.halo), 1 - smooth((mr / MOON.halo - 0.85) / 0.4));
  if (mr < MOON.r) {
    r = MOONC;
    c = Math.hypot(x - MOON.x + 22, y - MOON.y + 14) > MOON.r * 0.9 ? [1.0, 0.72, 0.18] : [0.99, 0.92, 0.62];
  }
  return { r, c, f: null };
}

// ---------- the scene sampled on a 3 px grid ----------
const GS = 3, GW = W0 / GS + 1, GH = H0 / GS + 1;
const GR = new Uint8Array(GW * GH), GC = new Float32Array(GW * GH * 3), GF = new Float32Array(GW * GH * 2), GP = new Float32Array(GW * GH);
function bakeGrid() {
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) GP[j * GW + i] = psiAt(i * GS, j * GS);
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const k = j * GW + i, x = i * GS, y = j * GS;
    const s = sceneExact(x, y, GP[k]);
    GR[k] = s.r; GC.set(s.c, k * 3);
    let f = s.f;
    if (!f) {   // sky: v = (∂ψ/∂y, −∂ψ/∂x)
      const i0 = Math.max(i - 1, 0), i1 = Math.min(i + 1, GW - 1), j0 = Math.max(j - 1, 0), j1 = Math.min(j + 1, GH - 1);
      f = [(GP[j1 * GW + i] - GP[j0 * GW + i]) / ((j1 - j0) * GS), -(GP[j * GW + i1] - GP[j * GW + i0]) / ((i1 - i0) * GS)];
    }
    const l = Math.hypot(f[0], f[1]) || 1;
    GF[k * 2] = f[0] / l; GF[k * 2 + 1] = f[1] / l;
  }
}
function sample(x, y) {
  const gx = clamp(x / GS, 0, GW - 1.001), gy = clamp(y / GS, 0, GH - 1.001);
  const i = Math.floor(gx), j = Math.floor(gy), fx = gx - i, fy = gy - j;
  const k00 = j * GW + i, k10 = k00 + 1, k01 = k00 + GW, k11 = k01 + 1;
  const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
  const c = [0, 1, 2].map((q) => GC[k00 * 3 + q] * w00 + GC[k10 * 3 + q] * w10 + GC[k01 * 3 + q] * w01 + GC[k11 * 3 + q] * w11);
  let fxv = GF[k00 * 2] * w00 + GF[k10 * 2] * w10 + GF[k01 * 2] * w01 + GF[k11 * 2] * w11;
  let fyv = GF[k00 * 2 + 1] * w00 + GF[k10 * 2 + 1] * w10 + GF[k01 * 2 + 1] * w01 + GF[k11 * 2 + 1] * w11;
  const l = Math.hypot(fxv, fyv) || 1;
  return { r: GR[Math.round(gy) * GW + Math.round(gx)], c, f: [fxv / l, fyv / l] };
}
const cdist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// trace a curved stroke along the flow from (x, y): both ways, stop at a region edge or a colour change
function trace(x0, y0, len, w, dev) {
  const s0 = sample(x0, y0);
  const step = Math.max(1.5, w * 0.3);
  const halves = [];
  for (const dir of [1, -1]) {
    const pts = [];
    let x = x0, y = y0, L = 0, px = s0.f[0] * dir, py = s0.f[1] * dir;
    while (L < len * 0.5) {
      const s = sample(x, y);
      if (s.r !== s0.r || cdist(s.c, s0.c) > dev) break;
      let vx = s.f[0] * dir, vy = s.f[1] * dir;
      if (vx * px + vy * py < 0) { vx = -vx; vy = -vy; }            // keep going the same way
      vx = lerp(px, vx, 0.55); vy = lerp(py, vy, 0.55);               // a brush cannot turn on the spot
      const l = Math.hypot(vx, vy) || 1; vx /= l; vy /= l;
      x += vx * step; y += vy * step; L += step; px = vx; py = vy;
      pts.push([x, y]);
    }
    halves.push(pts);
  }
  let poly = [...halves[1].reverse(), [x0, y0], ...halves[0]];
  if (poly.length < 2) poly = [[x0 - s0.f[0] * w * 0.3, y0 - s0.f[1] * w * 0.3], [x0 + s0.f[0] * w * 0.3, y0 + s0.f[1] * w * 0.3]];
  return { poly, s0 };
}
// resample a polyline to 8 points evenly spaced by arc length
function resample8(poly) {
  const cum = [0];
  for (let i = 1; i < poly.length; i++) cum.push(cum[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  const L = cum[cum.length - 1], out = [];
  let i = 1;
  for (let k = 0; k < 8; k++) {
    const target = (L * k) / 7;
    while (i < poly.length - 1 && cum[i] < target) i++;
    const a = cum[i - 1], b = cum[i], f = b > a ? clamp((target - a) / (b - a)) : 0;
    out.push([lerp(poly[i - 1][0], poly[i][0], f), lerp(poly[i - 1][1], poly[i][1], f)]);
  }
  return { pts: out, L: Math.max(L, 1) };
}

// ---------- the painter: four passes of strokes ----------
const STROKES = [];
const SCALE = { [SKY]: [1, 1], [MOONC]: [0.6, 0.5], [STARC]: [0.6, 0.55], [FAR]: [0.9, 1], [MID]: [0.9, 1], [NEAR]: [1, 1.1], [VILL]: [0.45, 0.35], [CYP]: [0.8, 0.9] };
const v1 = VORT[0];
function birthOf(layer, r, x, y, q) {
  const win = (a, b, k) => a + (b - a) * clamp(k);
  const isSky = r === SKY || r === MOONC || r === STARC, isHill = r === FAR || r === MID || r === NEAR;
  const up = 1 - clamp((y - CY_TOP) / (H0 - CY_TOP));
  if (layer === 0) return win(0.25, 2.7, 0.78 * (y / H0) + 0.22 * q);
  if (layer === 1) {
    if (isSky) return win(1.4, 4.6, 0.7 * clamp(Math.hypot((x - v1[0]) / 1.2, y - v1[1]) / 950) + 0.3 * q);
    if (isHill) return win(3.3, 5.2, 0.7 * (x / W0) + 0.3 * q);
    if (r === VILL) return win(4.3, 5.4, q);
    return win(4.5, 6.0, 0.75 * up + 0.25 * q);
  }
  if (isSky) {   // detail: a sweep around the big swirl, like a clock hand
    const ang = ((Math.atan2(y - v1[1], x - v1[0]) + Math.PI) / (2 * Math.PI) + 0.3) % 1;
    return win(3.1, 6.3, 0.55 * ang + 0.45 * q);
  }
  if (isHill) return win(4.8, 6.3, 0.6 * (x / W0) + 0.4 * q);
  if (r === VILL) return win(5.4, 6.4, q);
  return win(5.3, 6.6, 0.75 * up + 0.25 * q);
}
function paintLayer(layer, { sp, w, len, dev, thick, dry, prob, speed }, R) {
  for (let gy = -1; gy * sp < H0 + sp; gy++) for (let gx = -1; gx * sp < W0 + sp; gx++) {
    const x = (gx + R()) * sp, y = (gy + R()) * sp, q = R(), q2 = R(), q3 = R(), q4 = R(), q5 = R();
    if (x < -8 || x > W0 + 8 || y < -8 || y > H0 + 8) continue;
    const s = sample(x, y);
    if (q > prob[s.r]) continue;
    const [kw, kl] = SCALE[s.r];
    const ww = lerp(w[0], w[1], q2) * kw, ll = lerp(len[0], len[1], q3) * kl;
    const { poly, s0 } = trace(x, y, ll, ww, dev);
    const { pts, L } = resample8(poly);
    // colours: the paint at the seed and the neighbouring band (two paints side by side on the brush)
    const nx = -s0.f[1], ny = s0.f[0];
    let c1 = s0.c, c2s = sample(x + nx * ww * 1.1 * (q4 < 0.5 ? 1 : -1), y + ny * ww * 1.1 * (q4 < 0.5 ? 1 : -1));
    let c2 = c2s.r === s0.r ? c2s.c : mix(c1, [1, 1, 1], 0.12);
    if (layer === 0) {     // block-in: muted local average
      const avg = [0, 1, 2].map((k) => [[0, 0], [28, 0], [-28, 0], [0, 28], [0, -28]].reduce((acc, [dx, dy]) => acc + sample(x + dx, y + dy).c[k], 0) / 5);
      c1 = mul(avg, 0.88); c2 = mul(mix(avg, s0.c, 0.5), 0.8);
    }
    const jit = (c, k) => c.map((v) => clamp(v * (1 + (R() - 0.5) * k) + (R() - 0.5) * k * 0.15));
    c1 = jit(c1, 0.12); c2 = jit(c2, 0.14);
    const luma = 0.3 * c1[0] + 0.6 * c1[1] + 0.1 * c1[2];
    STROKES.push({
      pts, L, w: ww, birth: birthOf(layer, s0.r, x, y, q5), dur: clamp(L / speed, 0.07, 0.4), seed: R() * 97,
      thick: thick * (0.8 + 0.6 * luma) * (0.85 + 0.3 * R()), gloss: 0.55 + 0.4 * R(), dry: dry * (0.5 + R()), c1, c2,
    });
  }
}
// impasto accents: thick dabs circling the star cores and the moon, the windows lighting up
function accents(R) {
  const dab = (x, y, ang, len, w, c1, c2, birth, thick) => {
    const dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
    const poly = [[x - dx, y - dy], [x - dx * 0.3 + dy * 0.12, y - dy * 0.3 - dx * 0.12], [x + dx * 0.3 + dy * 0.12, y + dy * 0.3 - dx * 0.12], [x + dx, y + dy]];
    const { pts, L } = resample8(poly);
    STROKES.push({ pts, L, w, birth, dur: 0.1 + 0.08 * R(), seed: R() * 97, thick, gloss: 0.85 + 0.1 * R(), dry: 0.15 * R(), c1, c2 });
  };
  // the moon: a thick orange crescent laid along its arc, then a ring of yellow
  for (let i = 0; i < 22; i++) {
    const a = -0.95 + (i / 21) * 3.0 + (R() - 0.5) * 0.15, rr = MOON.r * (0.74 + 0.14 * R());   // the lit side, away from the cut
    dab(MOON.x + Math.cos(a) * rr, MOON.y + Math.sin(a) * rr, a + Math.PI / 2, 22 + 10 * R(), 13 + 5 * R(), [1.0, 0.70, 0.16], [1.0, 0.84, 0.36], 6.0 + i * 0.022, 2.6);
  }
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + R() * 0.2, rr = MOON.r * (1.35 + 0.25 * R());
    dab(MOON.x + Math.cos(a) * rr, MOON.y + Math.sin(a) * rr, a + Math.PI / 2, 26 + 10 * R(), 11 + 4 * R(), [0.99, 0.88, 0.45], [0.95, 0.92, 0.66], 6.3 + i * 0.016, 1.9);
  }
  // stars: concentric dabs, one star after another
  STARS.forEach(([sx, sy, Rr], si) => {
    const t0 = 6.2 + si * 0.085;
    for (const [rf, n, col, col2, th, wd] of [[0.42, 12, [0.98, 0.86, 0.36], [1.0, 0.94, 0.62], 1.9, 9], [0.25, 8, [1.0, 0.93, 0.55], [1.0, 0.98, 0.85], 2.3, 9], [0.09, 3, [1.0, 0.99, 0.92], [1.0, 0.96, 0.75], 2.8, 10]]) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + R() * 0.4, rr = Rr * rf;
        dab(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr, a + Math.PI / 2, Math.max(9, rr * 0.9 + 6), wd * (0.8 + 0.4 * R()) * Math.min(1, Rr / 40 + 0.3), col, col2, t0 + (1 - rf) * 0.14 + i * 0.008, th);
      }
    }
  });
  // windows: little thick yellow dabs, lit one by one
  const wins = [];
  for (const h of HOUSES) for (const [wx, wy, ww, wh] of h.win) wins.push([wx + ww / 2, wy + wh / 2, ww, wh]);
  const order = wins.map((w, i) => [R(), i]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
  order.forEach((wi, k) => {
    const [x, y, ww, wh] = wins[wi];
    dab(x, y, Math.PI / 2 + (R() - 0.5) * 0.3, wh * 1.15, ww * 1.15, [1.0, 0.84, 0.30], [1.0, 0.95, 0.62], 6.7 + (k / Math.max(order.length - 1, 1)) * 0.6, 2.2);
  });
}
function buildStrokes() {
  bakeGrid();
  const R = rand(1919);
  const all = { [SKY]: 1, [MOONC]: 1, [STARC]: 1, [FAR]: 1, [MID]: 1, [NEAR]: 1, [VILL]: 1, [CYP]: 1 };
  paintLayer(0, { sp: 66, w: [40, 56], len: [120, 240], dev: 0.4, thick: 0.5, dry: 0.55, prob: all, speed: 900 }, R);
  paintLayer(1, { sp: 31, w: [18, 28], len: [60, 150], dev: 0.2, thick: 0.95, dry: 0.25, prob: all, speed: 950 }, R);
  paintLayer(2, { sp: 15, w: [8, 13], len: [30, 80], dev: 0.13, thick: 1.15, dry: 0.3, speed: 700,
    prob: { [SKY]: 0.75, [MOONC]: 1, [STARC]: 1, [FAR]: 0.45, [MID]: 0.45, [NEAR]: 0.35, [VILL]: 1, [CYP]: 0.85 } }, R);
  accents(R);
  STROKES.forEach((s, i) => { s.i = i; });
  STROKES.sort((a, b) => a.birth - b.birth || a.i - b.i);
}

// ---------- shaders ----------
const NOISE = `
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
// plain-weave linen at 4.5 px: warp and weft threads alternating over / under, slightly irregular
float weave(vec2 p) {
  p /= 4.5;
  vec2 c = floor(p), f = fract(p);
  float ch = mod(c.x + c.y, 2.0);
  float ax = 2.0 * f.y - 1.0, ay = 2.0 * f.x - 1.0;
  float hx = (1.0 - ax * ax) * (0.62 + 0.38 * sin(3.14159 * f.x));
  float hy = (1.0 - ay * ay) * (0.62 + 0.38 * sin(3.14159 * f.y));
  float h = ch > 0.5 ? max(hx, hy * 0.55) : max(hy, hx * 0.55);
  return h * (0.82 + 0.36 * vnoise(p * 0.7 + 3.0));
}
`;
const STROKE_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_v;      // cross-section index, side
layout(location = 1) in vec4 a_p0;
layout(location = 2) in vec4 a_p1;
layout(location = 3) in vec4 a_p2;
layout(location = 4) in vec4 a_p3;
layout(location = 5) in vec4 a_par;    // width, birth, duration, seed
layout(location = 6) in vec4 a_par2;   // length, thickness, gloss, dryness
layout(location = 7) in vec4 a_c1;
layout(location = 8) in vec4 a_c2;
uniform float u_t, u_zoom;
uniform vec2 u_cam, u_res;
out vec2 v_uv;
out vec2 v_pos;
flat out vec4 v_par;
flat out vec4 v_par2;
flat out vec3 v_c1;
flat out vec3 v_c2;
flat out float v_now;
vec2 pts[8];
vec2 spine(float s, out vec2 tng) {
  float u = clamp(s, 0.0, 1.0) * 7.0;
  int i = min(int(floor(u)), 6);
  float f = u - float(i);
  vec2 p0 = pts[max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[min(i + 2, 7)];
  vec2 b = p2 - p0, c = 2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3, d = -p0 + 3.0 * p1 - 3.0 * p2 + p3;
  tng = b + 2.0 * c * f + 3.0 * d * f * f;
  float tl = length(tng);
  vec2 ch = p2 - p1;
  tng = tl > 1e-4 ? tng / tl : (length(ch) > 1e-4 ? normalize(ch) : vec2(1.0, 0.0));
  return p1 + 0.5 * (b * f + c * f * f + d * f * f * f);
}
void main() {
  pts = vec2[8](a_p0.xy, a_p0.zw, a_p1.xy, a_p1.zw, a_p2.xy, a_p2.zw, a_p3.xy, a_p3.zw);
  float W = a_par.x, L = a_par2.x;
  float x = clamp((u_t - a_par.y) / max(a_par.z, 1e-3), 0.0, 1.0);
  float pr = 1.0 - (1.0 - x) * (1.0 - x);          // the brush slows as it lifts
  int j = int(a_v.x + 0.5);
  float hw = 0.5 * W * 1.5;                          // room for the pressure swell (up to 1.45× the nominal width)
  vec2 tng, pos;
  float along;
  if (j == 0) { pos = spine(0.0, tng) - tng * hw; along = -hw; }
  else if (j == 18) { pos = spine(pr, tng); pos += tng * hw; along = pr * L + hw; }
  else { float s = min(float(j - 1) / 16.0, pr); pos = spine(s, tng); along = s * L; }
  pos += vec2(-tng.y, tng.x) * a_v.y * hw;
  v_uv = vec2(along, a_v.y * 1.5);
  v_pos = pos;
  v_par = a_par; v_par2 = a_par2; v_c1 = a_c1.rgb; v_c2 = a_c2.rgb; v_now = pr * L;
  vec2 sc = (pos - u_cam) * u_zoom + 0.5 * u_res;   // screen px, y down
  gl_Position = vec4(sc.x / u_res.x * 2.0 - 1.0, 1.0 - sc.y / u_res.y * 2.0, 0.0, 1.0);
}`;
const STROKE_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
in vec2 v_pos;
flat in vec4 v_par;
flat in vec4 v_par2;
flat in vec3 v_c1;
flat in vec3 v_c2;
flat in float v_now;
uniform float u_zoom, u_hs;
layout(location = 0) out vec4 oC;
layout(location = 1) out vec4 oH;
${NOISE}
float h11(float x) { return fract(sin(x * 12.9898) * 43758.5453); }
// Brush pressure along the stroke, one curve per stroke from its seed: the tip lands narrow and spreads as it is
// pressed (attack), the stroke swells in its belly, the pressure wanders as the hand moves, and the brush lifts at
// the end — a slow lift tapers, a flick runs almost to a point. Width ∝ pressure (≈ 0.3 … 1.45 of nominal).
float pressure(float s, float seed) {
  float h1 = h11(seed + 1.7), h2 = h11(seed + 5.3), h3 = h11(seed + 9.1), h4 = h11(seed + 13.9);
  float attack = mix(0.06, 0.3, h1), land = mix(0.28, 0.75, h2);
  float lift = mix(0.12, 0.5, h3), tipW = h4 < 0.35 ? mix(0.08, 0.2, h4 / 0.35) : mix(0.35, 0.8, h4);
  float a = mix(land, 1.0, smoothstep(0.0, attack, s));
  float r = mix(1.0, tipW, smoothstep(1.0 - lift, 1.0, s));
  float belly = 1.0 + mix(0.04, 0.32, h2) * sin(3.14159265 * clamp(s / max(1.0 - 0.5 * lift, 0.3), 0.0, 1.0));
  float wander = 1.0 + 0.36 * (vnoise(vec2(s * 2.6 + seed, seed * 0.37)) - 0.5) + 0.14 * (vnoise(vec2(s * 8.0, seed + 4.0)) - 0.5);
  return clamp(a * r * belly * wander, 0.06, 1.45);
}
void main() {
  float W = v_par.x, seed = v_par.w, L = max(v_par2.x, 1.0), thick = v_par2.y, gloss = v_par2.z, dry = v_par2.w;
  float along = v_uv.x, ac = v_uv.y, now = v_now, hw = 0.5 * W;
  float s = clamp(along / L, 0.0, 1.0);
  float P = pressure(s, seed);
  // outline: the pressure sets the width; a dry tail thins it further; ragged hairs at the edge; round caps
  float prof = P * (1.0 - 0.32 * dry * smoothstep(0.6, 1.0, s));
  prof += ((vnoise(vec2(along / 7.0, seed)) - 0.5) * 0.16 + (vnoise(vec2(along / 2.3, seed + 3.0)) - 0.5) * 0.07) * max(P, 0.4);
  prof = max(prof, 0.05);
  float cap = along < 0.0 ? -along / hw : (along > now ? (along - now) / hw : 0.0);
  float d = sqrt(ac * ac + cap * cap) / prof;
  float aa = max(fwidth(d), 1e-3);
  float cov = 1.0 - smoothstep(1.0 - aa, 1.0 + 0.5 * aa, d);
  if (cov < 0.004) discard;
  float acn = ac / prof;                                // position across the stroke's own width, −1 … 1
  // bristle grooves: lanes that spread apart where the brush is pressed and bunch up where it lifts
  float lane = acn * W / 6.4;
  float b1 = vnoise(vec2(lane + seed * 3.1, along / 45.0 + seed));
  float b2 = vnoise(vec2(lane * 2.3 + seed * 1.7, along / 16.0 + seed * 0.3));
  float groove = 0.6 * b1 + 0.4 * b2;
  // dry brush: the paint breaks where the bristles run dry and skips the hollows of the weave
  float wv = weave(v_pos);
  if (dry > 0.01) {
    float th = dry * (0.25 + 0.75 * smoothstep(0.35, 1.0, s));
    cov *= smoothstep(th - 0.08, th + 0.08, 0.7 * groove + 0.45 * wv - 0.05);
    if (cov < 0.004) discard;
  }
  // thickness: paint pushed aside piles at both edges, more paint where the stroke starts, a ridge at the tip
  // pressing harder squeezes paint out from under the brush to its edges; a lifting brush leaves a thin film
  float rim = 0.72 + (0.3 + 0.35 * clamp(P, 0.0, 1.45)) * acn * acn;
  float load = (1.0 + 0.4 * exp(-s * 5.0)) * mix(0.45, 1.05, smoothstep(0.1, 1.0, P));
  float tq = (along - now) / (0.32 * W * max(P, 0.3));
  float tip = 0.5 * exp(-tq * tq);
  float h = thick * (rim * (0.5 + 0.7 * groove) * load + tip) * (1.0 - smoothstep(0.8, 1.02, d));
  // colour: two paints in lanes, blending as the brush empties; ridges hold a little more pigment
  float pick = smoothstep(0.38, 0.62, vnoise(vec2(lane * 0.45 + seed * 7.0, along / 90.0 + seed)));
  vec3 col = mix(v_c1, v_c2, pick * 0.85);
  col = mix(col, 0.5 * (v_c1 + v_c2), 0.45 * smoothstep(0.55, 1.0, s));
  col *= 0.93 + 0.14 * groove;
  oC = vec4(col * cov, cov);
  oH = vec4(h * u_zoom * u_hs * cov, gloss * cov, 0.0, cov * 0.65);   // alpha 0.65: 35% of the old relief survives
}`;

const QUAD_VS = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;
const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
out vec4 o;
`;
const DOWN = HEAD + `
uniform sampler2D Hm; uniform float hs;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy) * 4;
  float a = 0.0;
  for (int j = 0; j < 4; j++) for (int i = 0; i < 4; i++) a += texelFetch(Hm, q + ivec2(i, j), 0).x;
  o = vec4(a / 16.0 / hs, 0.0, 0.0, 0.0);
}`;
const BLUR = HEAD + `
uniform sampler2D B; uniform ivec2 dir;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(B, 0) - 1;
  const float w[5] = float[](0.2270, 0.1945, 0.1216, 0.0540, 0.0162);
  vec4 acc = texelFetch(B, q, 0) * w[0];
  for (int i = 1; i < 5; i++) acc += (texelFetch(B, clamp(q + dir * i, ivec2(0), m), 0) + texelFetch(B, clamp(q - dir * i, ivec2(0), m), 0)) * w[i];
  o = acc;
}`;
const LIGHT_FS = HEAD + NOISE + `
uniform sampler2D C, Hm, Hb;
uniform vec2 res, cam;
uniform float zoom, hs, bump, fade, keyI, lampI, sweepK;
uniform vec3 Ldir, Lp;
vec2 stageOf(vec2 f) { return cam + (vec2(f.x, res.y - f.y) - 0.5 * res) / zoom; }
float paintH(vec2 f) { return texture(Hm, f / res).x / hs; }
float totalH(vec2 f) { float h = paintH(f); return h + weave(stageOf(f)) * 0.5 * zoom * exp(-h * 1.3); }
// height-field shadow: march toward the light; slope = rise of the ray per px (in exaggerated height)
float shadowMarch(vec2 f, float h0, vec2 dir, float slope) {
  float occ = 0.0;
  for (int i = 1; i <= 12; i++) {
    float d = float(i) * 1.7;
    occ = max(occ, (paintH(f + dir * d) * bump - h0 * bump - d * slope) / (0.6 + 0.12 * d));
  }
  return 1.0 - 0.75 * clamp(occ, 0.0, 1.0);
}
void main() {
  vec2 f = gl_FragCoord.xy;
  vec4 c = texture(C, f / res);
  float gloss = texture(Hm, f / res).y;
  float h0 = totalH(f);
  float hx = totalH(f + vec2(1, 0)) - totalH(f - vec2(1, 0));
  float hy = totalH(f + vec2(0, 1)) - totalH(f - vec2(0, 1));
  vec3 n = normalize(vec3(-0.5 * hx * bump, -0.5 * hy * bump, 1.0));
  vec3 alb = pow(clamp(c.rgb, 0.0, 1.0), vec3(2.2));
  vec3 V = normalize(vec3(0.5 * res, 2600.0) - vec3(f, 0.0));
  float hb = texture(Hb, f / res).x;
  float ao = clamp(1.0 - (hb - paintH(f)) * bump * 0.16, 0.55, 1.0);
  vec3 amb = vec3(0.30, 0.34, 0.42) * 0.22;
  vec3 col = vec3(0.0);
  // gallery light: a warm key from the upper left
  if (sweepK < 0.999) {
    vec3 L = Ldir;
    float sh = shadowMarch(f, paintH(f), normalize(L.xy), L.z / max(length(L.xy), 1e-3));
    float dif = clamp(dot(n, L) / max(L.z, 0.3), 0.0, 2.2) * sh;
    vec3 Hh = normalize(L + V);
    float nh = max(dot(n, Hh), 0.0);
    float sp = gloss * (pow(nh, 80.0) * 0.5 + pow(nh, 14.0) * 0.035) * sh;
    col += (1.0 - sweepK) * keyI * (alb * (vec3(1.0, 0.93, 0.82) * dif + amb) * ao + vec3(1.0, 0.95, 0.86) * sp);
  }
  // the raking lamp: a low point light travelling across the canvas
  if (sweepK > 0.001) {
    vec3 Lv = Lp - vec3(f, h0 * bump);
    float dist = length(Lv);
    vec3 L = Lv / dist;
    float att = lampI / (1.0 + (dist / 700.0) * (dist / 700.0));
    float sh = shadowMarch(f, paintH(f), normalize(Lv.xy + 1e-4), L.z / max(length(L.xy), 1e-3));
    float dif = max(dot(n, L), 0.0) * sh;
    vec3 Hh = normalize(L + V);
    float nh = max(dot(n, Hh), 0.0);
    float sp = gloss * (pow(nh, 70.0) * 0.9 + pow(nh, 12.0) * 0.05) * sh;
    col += sweepK * (alb * (vec3(1.0, 0.90, 0.76) * dif * att + amb * 0.7) * ao + vec3(1.0, 0.92, 0.80) * sp * att);
  }
  col *= fade;
  col = col / (1.0 + 0.12 * col);
  vec2 vq = (f / res - 0.5) * vec2(1.0, 0.62) * 2.0;
  col *= 1.0 - 0.4 * clamp(dot(vq, vq) * 0.55, 0.0, 1.0);
  col = pow(max(col, vec3(0.0)), vec3(1.0 / 2.2));
  col += (hash(f) - 0.5) / 255.0;
  o = vec4(col, 1.0);
}`;

// ---------- the story ----------
const zoom = track([[0, 1.08], [3.6, 1.0], [7.4, 1.0], [D, 1.07]]);
const camX = track([[0, 540], [3.6, 540], [7.4, 540], [D, 510]]);
const camY = track([[0, 900], [3.6, 960], [7.4, 960], [D, 1000]]);
const fade = track([[0, 0.3], [0.8, 1.0, ease.outCubic], [D - 0.4, 1.0], [D, 0.9]]);
const keyEl = track([[0, 0.78], [D, 0.74]]);
const keyAz = track([[0, 2.3], [D, 2.4]]);
const sweepK = track([[0, 0], [7.3, 0], [7.9, 1], [9.5, 1], [D, 0.55]]);
const lampX = track([[0, -320], [7.3, -320], [9.6, 1360, ease.inOutCubic], [D, 1420]]);

defineDemo({
  id: '19-impasto',
  title: '두껍게 바른 유화',
  tech: 'WebGL2 · 붓질 기반 렌더링 + 높이맵 조명',
  duration: D,
  background: '#0a0706',
  async setup({ canvas, W, H }) {
    buildStrokes();
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    const fl = gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float');
    const FMT = fl ? gl.RGBA16F : gl.RGBA8;
    const HS = fl ? 1 : 1 / 6;         // height scale (an 8-bit fallback stores height / 6 px)

    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n'));
      return s;
    };
    const program = (vsrc, fsrc) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vsrc)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fsrc));
      gl.bindAttribLocation(p, 0, 'p');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < nu; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const texture = (w, h, fmt, filter = gl.LINEAR) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, fmt, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return tex;
    };
    const fbo = (texs) => {
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      texs.forEach((t, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0));
      gl.drawBuffers(texs.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('incomplete framebuffer');
      return fb;
    };
    const target = (w, h, fmt) => { const tex = texture(w, h, fmt); return { tex, fb: fbo([tex]), w, h }; };

    // canvas accumulation: colour + height (MRT), and a blurred quarter-res height for occlusion
    const colT = texture(W, H, FMT), hgtT = texture(W, H, FMT);
    const paintFB = fbo([colT, hgtT]);
    const QW = W / 4, QH = H / 4;
    const HFMT = fl ? gl.RGBA16F : gl.RGBA8;
    const hq1 = target(QW, QH, HFMT), hq2 = target(QW, QH, HFMT);

    // stroke instances
    const N = STROKES.length;
    const inst = new Float32Array(N * 32);
    STROKES.forEach((s, i) => {
      const o = i * 32;
      s.pts.forEach(([x, y], k) => { inst[o + k * 2] = x; inst[o + k * 2 + 1] = y; });
      inst.set([s.w, s.birth, s.dur, s.seed], o + 16);
      inst.set([s.L, s.thick, s.gloss, s.dry], o + 20);
      inst.set([...s.c1, 0], o + 24);
      inst.set([...s.c2, 0], o + 28);
    });
    const births = new Float32Array(STROKES.map((s) => s.birth));
    const strokeP = program(STROKE_VS, STROKE_FS);
    const svao = gl.createVertexArray();
    gl.bindVertexArray(svao);
    const sec = new Float32Array(19 * 2 * 2);
    for (let j = 0; j < 19; j++) { sec.set([j, -1], j * 4); sec.set([j, 1], j * 4 + 2); }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, sec, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, inst, gl.STATIC_DRAW);
    for (let a = 0; a < 8; a++) {
      gl.enableVertexAttribArray(1 + a);
      gl.vertexAttribPointer(1 + a, 4, gl.FLOAT, false, 128, a * 16);
      gl.vertexAttribDivisor(1 + a, 1);
    }
    gl.bindVertexArray(null);

    // full-screen passes
    const qvao = gl.createVertexArray();
    gl.bindVertexArray(qvao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    const P = { down: program(QUAD_VS, DOWN), blur: program(QUAD_VS, BLUR), light: program(QUAD_VS, LIGHT_FS) };
    const pass = (Pr, dst, tex = {}, set = () => {}) => {
      gl.useProgram(Pr.p);
      gl.bindVertexArray(qvao);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null);
      gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H);
      let unit = 0;
      for (const [name, t] of Object.entries(tex)) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        if (Pr.u[name]) gl.uniform1i(Pr.u[name], unit);
        unit++;
      }
      set(Pr.u);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const bornBy = (t) => { let lo = 0, hi = N; while (lo < hi) { const m = (lo + hi) >> 1; if (births[m] <= t) lo = m + 1; else hi = m; } return lo; };

    this.render = (t) => {
      const z = zoom(t), cx = camX(t), cy = camY(t);
      // 1. paint: every stroke born by t, in birth order, drawn on up to its progress
      gl.bindFramebuffer(gl.FRAMEBUFFER, paintFB);
      gl.viewport(0, 0, W, H);
      gl.clearBufferfv(gl.COLOR, 0, [...GROUND, 1]);
      gl.clearBufferfv(gl.COLOR, 1, [0, 0.12, 0, 1]);
      const n = bornBy(t);
      if (n > 0) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(strokeP.p);
        gl.bindVertexArray(svao);
        const u = strokeP.u;
        gl.uniform1f(u.u_t, t); gl.uniform1f(u.u_zoom, z); gl.uniform2f(u.u_cam, cx, cy); gl.uniform2f(u.u_res, W, H);
        gl.uniform1f(u.u_hs, HS);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 38, n);
        gl.disable(gl.BLEND);
        gl.bindVertexArray(null);
      }
      // 2. blurred relief for occlusion
      pass(P.down, hq1, { Hm: hgtT }, (u) => gl.uniform1f(u.hs, HS));
      pass(P.blur, hq2, { B: hq1.tex }, (u) => gl.uniform2i(u.dir, 1, 0));
      pass(P.blur, hq1, { B: hq2.tex }, (u) => gl.uniform2i(u.dir, 0, 1));
      // 3. light the relief
      const el = keyEl(t), az = keyAz(t);
      pass(P.light, null, { C: colT, Hm: hgtT, Hb: hq1.tex }, (u) => {
        gl.uniform2f(u.res, W, H); gl.uniform2f(u.cam, cx, cy); gl.uniform1f(u.zoom, z); gl.uniform1f(u.hs, HS);
        gl.uniform1f(u.bump, 2.2); gl.uniform1f(u.fade, fade(t)); gl.uniform1f(u.keyI, 1.0);
        gl.uniform3f(u.Ldir, Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el));
        const sx = (lampX(t) - cx) * z + W / 2;
        gl.uniform3f(u.Lp, sx, H - ((820 - cy) * z + H / 2), 200);
        gl.uniform1f(u.lampI, 1.9); gl.uniform1f(u.sweepK, sweepK(t));
      });
    };
  },
  frame(t) {
    this.render(t);
  },
});
