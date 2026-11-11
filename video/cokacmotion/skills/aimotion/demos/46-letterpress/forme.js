/*
 * 46-letterpress/forme.js — the compositor's work, done once in setup().
 *
 * The forme is set in PRINT orientation in sheet coordinates (x right, y down from the top of the sheet,
 * world px; 1 mm ≈ 8.7 px): every Hangul glyph is one metal sort — a body (em-box × advance) standing at
 * shoulder height with the glyph's face raised on it to type-high, a bevelled "beard" between them —
 * centred lines padded with quads, leads between lines, a brass Oxford rule with a diamond, wooden
 * furniture filling the chase. Glyphs come from Pretendard rasterised with Canvas 2D; an exact Euclidean
 * distance transform (Felzenszwalb–Huttenlocher) gives each texel its signed distance to the face edge.
 * The shader mirrors this map across the platen hinge, so the forme on the bed reads mirrored and the print
 * on the platen reads right.
 *
 * Textures (TW × TH, S texels per world px):
 *   F  R height (1 = type-high face, shoulder, quads/leads, furniture)  G face mask (antialiased)
 *      B signed distance to the face edge (0.5 + d/12 px)  A per-sort / per-block random
 *   P  R paper fibres  G impression profile, sharp (paper wrapped tight round the face)
 *      B impression profile, soft (the paper's broad sink)  A ambient occlusion of the forme
 */
import { rand } from '../_lib/stage.js';

export const S = 3;
export const SW = 880, SH = 800;
export const TW = SW * S, TH = SH * S;
export const LV = { face: 1.0, shoulder: 0.962, quad: 0.8, furn: 0.72 };
const FONT = '"Pretendard Variable", Pretendard, sans-serif';

// ---------------------------------------------------------------- exact EDT
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
/** distance (texels) from every texel to the nearest texel where src is true */
function edt(src, w, h) {
  const g = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) g[i] = src[i] ? 0 : INF;
  const n = Math.max(w, h);
  const f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = g[y * w + x];
    dt1(f, h, d, v, z);
    for (let y = 0; y < h; y++) g[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    const o = y * w;
    for (let x = 0; x < w; x++) f[x] = g[o + x];
    dt1(f, w, d, v, z);
    for (let x = 0; x < w; x++) g[o + x] = Math.sqrt(d[x]);
  }
  return g;
}
function boxBlur(src, w, h, r) {
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h), k = 1 / (2 * r + 1);
  for (let y = 0; y < h; y++) {
    const o = y * w; let s = 0;
    for (let x = -r; x <= r; x++) s += src[o + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) { tmp[o + x] = s * k; s += src[o + Math.min(w - 1, x + r + 1)] - src[o + Math.max(0, x - r)]; }
  }
  for (let x = 0; x < w; x++) {
    let s = 0;
    for (let y = -r; y <= r; y++) s += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) { out[y * w + x] = s * k; s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]; }
  }
  return out;
}
const gauss = (a, w, h, r) => boxBlur(boxBlur(boxBlur(a, w, h, r), w, h, r), w, h, r);

// ---------------------------------------------------------------- the composition (print orientation)
const LINES = [
  { text: '꾹꾹', weight: 820, size: 250, base: 318, track: 0.02 },
  { text: '눌러 담은 마음', weight: 700, size: 80, base: 452, track: 0.04 },
  { text: '납 활자 · 면 종이 · 2026', weight: 520, size: 29, base: 600, track: 0.14 },
];
const RULE = { y: 512, w: 400, thick: 4.2, thin: 1.4, gap: 3.2 };
const MEASURE = [120, 760];          // the type block between the furniture, x (world px)

// texel-space painters on typed arrays (fast and exact; Canvas 2D is only used for the glyphs)
function fillRectA(a, x, y, w, h, v) {
  const x0 = Math.max(0, Math.round(x * S)), x1 = Math.min(TW, Math.round((x + w) * S));
  const y0 = Math.max(0, Math.round(y * S)), y1 = Math.min(TH, Math.round((y + h) * S));
  for (let yy = y0; yy < y1; yy++) a.fill(v, yy * TW + x0, yy * TW + x1);
}
function frameRectA(a, x, y, w, h, lw, v) {
  fillRectA(a, x, y, w, lw, v); fillRectA(a, x, y + h - lw, w, lw, v);
  fillRectA(a, x, y, lw, h, v); fillRectA(a, x + w - lw, y, lw, h, v);
}

export async function setForme() {
  for (const L of LINES) { try { await document.fonts.load(`${L.weight} ${L.size}px "Pretendard Variable"`, L.text); } catch (e) { /* fallback font */ } }
  const r = rand(4646);
  const N0 = TW * TH;
  const Hb = new Float32Array(N0).fill(LV.furn);      // height levels
  const Rb = new Uint8Array(N0);                       // per-piece random
  const c = document.createElement('canvas'); c.width = TW; c.height = TH;
  const gM = c.getContext('2d');
  gM.setTransform(S, 0, 0, S, 0, 0);
  gM.fillStyle = '#000'; gM.fillRect(0, 0, SW, SH);
  const rnd = () => 1 + Math.floor(r() * 254);

  // furniture: wooden blocks of mixed sizes tiling the chase
  const block = (x, y, w, h) => { fillRectA(Rb, x, y, w, h, rnd()); frameRectA(Hb, x, y, w, h, 0.8, LV.furn - 0.12); };
  let x = 0;
  for (const wd of [230, 180, 260, 210]) { block(x, 0, wd, 92); x += wd; }
  x = 0;
  for (const wd of [300, 160, 240, 180]) { block(x, 652, wd, 148); x += wd; }
  block(0, 92, MEASURE[0], 280); block(0, 372, MEASURE[0], 280);
  block(MEASURE[1], 92, SW - MEASURE[1], 200); block(MEASURE[1], 292, SW - MEASURE[1], 360);

  // the type block: quads and leads at quad height, with their joints
  fillRectA(Hb, MEASURE[0], 92, MEASURE[1] - MEASURE[0], 560, LV.quad);
  for (let y = 92; y < 652; y += 18) fillRectA(Hb, MEASURE[0], y - 0.4, MEASURE[1] - MEASURE[0], 0.8, LV.quad - 0.05);
  for (let y = 92; y < 652; y += 36) for (let qx = MEASURE[0] + ((y / 36) % 2 ? 40 : 0); qx < MEASURE[1]; qx += 80) fillRectA(Hb, qx - 0.4, y, 0.8, 36, LV.quad - 0.05);

  // the sorts
  for (const L of LINES) {
    const font = `${L.weight} ${L.size}px ${FONT}`;
    gM.font = font; gM.textBaseline = 'alphabetic';
    const chars = [...L.text];
    const adv = chars.map((ch) => gM.measureText(ch).width + L.track * L.size);
    const total = adv.reduce((a, b) => a + b, 0) - L.track * L.size;
    let pen = (SW - total) / 2;
    const m = gM.measureText('한');
    const asc = m.fontBoundingBoxAscent || L.size * 0.92, desc = m.fontBoundingBoxDescent || L.size * 0.24;
    chars.forEach((ch, i) => {
      const bx = pen, bw = adv[i], by = L.base - asc * 0.94, bh = (asc + desc) * 0.94;
      if (ch !== ' ') {
        fillRectA(Hb, bx, by, bw, bh, LV.shoulder);
        frameRectA(Hb, bx, by, bw, bh, 0.5, LV.quad);
        fillRectA(Rb, bx, by, bw, bh, rnd());
        gM.fillStyle = '#fff'; gM.fillText(ch, bx + (L.track * L.size) / 2, L.base);
      }
      pen += bw;
    });
  }
  // brass Oxford rule with a diamond, on its own body
  {
    const x0 = (SW - RULE.w) / 2, y0 = RULE.y;
    fillRectA(Hb, x0 - 4, y0 - 8, RULE.w + 8, 22, LV.shoulder);
    fillRectA(Rb, x0 - 4, y0 - 8, RULE.w + 8, 22, rnd());
    gM.fillStyle = '#fff';
    const mid = x0 + RULE.w / 2;
    gM.fillRect(x0, y0, RULE.w / 2 - 16, RULE.thick); gM.fillRect(mid + 16, y0, RULE.w / 2 - 16, RULE.thick);
    gM.fillRect(x0, y0 + RULE.thick + RULE.gap, RULE.w / 2 - 16, RULE.thin); gM.fillRect(mid + 16, y0 + RULE.thick + RULE.gap, RULE.w / 2 - 16, RULE.thin);
    gM.beginPath(); gM.moveTo(mid, y0 - 4); gM.lineTo(mid + 9, y0 + 3.3); gM.lineTo(mid, y0 + 10.6); gM.lineTo(mid - 9, y0 + 3.3); gM.fill();
  }

  const N = TW * TH;
  const M = gM.getImageData(0, 0, TW, TH).data;
  const mask = new Float32Array(N), inside = new Uint8Array(N), outside = new Uint8Array(N);
  for (let i = 0; i < N; i++) { mask[i] = M[i * 4] / 255; inside[i] = mask[i] >= 0.5 ? 1 : 0; outside[i] = 1 - inside[i]; }
  const dOut = edt(inside, TW, TH);        // for outside texels: distance to the face
  const dIn = edt(outside, TW, TH);        // for inside texels: distance to the outside
  const height = new Float32Array(N);
  const BEV = 2.6 * S;                     // the beard: face → shoulder over ~0.3 mm
  for (let i = 0; i < N; i++) {
    const base = Hb[i];
    const sd = inside[i] ? dIn[i] - 0.5 : 0.5 - dOut[i];
    let h = base;
    if (base > LV.shoulder - 0.01) {
      const k = Math.min(1, Math.max(0, (sd + BEV) / (BEV + 0.5)));
      h = Math.max(base, LV.shoulder + (LV.face - LV.shoulder) * k * k * (3 - 2 * k));
    }
    height[i] = h;
    dOut[i] = sd / S;                      // reuse: signed distance in world px
  }
  // the paper's impression: a tight wrap round the face plus a broad sink; occlusion of the forme
  const sharp = gauss(mask, TW, TH, 2);
  const soft = gauss(mask, TW, TH, 10);
  const hb = gauss(height, TW, TH, 8);
  // cotton fibres: short curly fibres, felted — splatted along quadratic curves straight into an array
  const fibA = new Float32Array(N);
  const rf = rand(461);
  for (let i = 0; i < 26000; i++) {
    const fx = rf() * TW, fy = rf() * TH, L = (5 + 26 * rf() * rf()) * S, a = rf() * Math.PI * 2, b = (rf() - 0.5) * 2.4;
    const al = 0.05 + 0.12 * rf(), wd = (0.35 + 0.6 * rf()) * S;
    const cx = fx + Math.cos(a + b) * L * 0.5, cy = fy + Math.sin(a + b) * L * 0.5, ex = fx + Math.cos(a) * L, ey = fy + Math.sin(a) * L;
    const steps = Math.ceil(L / 0.7), rad = Math.max(0.6, wd / 2), ri = Math.ceil(rad);
    for (let k = 0; k <= steps; k++) {
      const q = k / steps, m1 = 1 - q;
      const px = m1 * m1 * fx + 2 * m1 * q * cx + q * q * ex, py = m1 * m1 * fy + 2 * m1 * q * cy + q * q * ey;
      const ix = Math.round(px), iy = Math.round(py);
      for (let dy = -ri; dy <= ri; dy++) {
        const yy = iy + dy; if (yy < 0 || yy >= TH) continue;
        for (let dx = -ri; dx <= ri; dx++) {
          const xx = ix + dx; if (xx < 0 || xx >= TW) continue;
          const d = Math.hypot(xx - px, yy - py);
          if (d < rad + 0.5) { const j = yy * TW + xx; fibA[j] = Math.min(1, fibA[j] + al * 0.45 * Math.min(1, rad + 0.5 - d)); }
        }
      }
    }
  }

  const F = new Uint8Array(N * 4), P = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) {
    F[i * 4] = Math.round(height[i] * 255);
    F[i * 4 + 1] = M[i * 4];
    F[i * 4 + 2] = Math.round(Math.min(1, Math.max(0, 0.5 + dOut[i] / 12)) * 255);
    F[i * 4 + 3] = Rb[i];
    P[i * 4] = Math.round(fibA[i] * 255);
    P[i * 4 + 1] = Math.round(Math.min(1, sharp[i]) * 255);
    P[i * 4 + 2] = Math.round(Math.min(1, soft[i]) * 255);
    P[i * 4 + 3] = Math.round(Math.min(1, Math.max(0, 1 - 4.5 * Math.max(0, hb[i] - height[i]))) * 255);
  }
  // dust on the type: three hickeys in the solids of the big glyphs (white dot, dark ring on the print)
  const hick = [];
  for (let tries = 0; tries < 4000 && hick.length < 3; tries++) {
    const hx = 150 + r() * 600, hy = 90 + r() * 240;
    const i = Math.round(hy * S) * TW + Math.round(hx * S);
    if (inside[i] && dIn[i] > 7 * S) hick.push(hx, hy, 1.6 + r() * 1.4, 0);
  }
  while (hick.length < 12) hick.push(-1000, -1000, 1, 0);
  return { F, P, hick };
}
