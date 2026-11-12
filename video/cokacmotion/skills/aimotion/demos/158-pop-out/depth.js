/*
 * depth.js — the per-pixel depth test of 158 and the shadow it casts on the bar plane.
 *
 *   rasterMax(buf, sv, att, tri, floor)  rasterise a triangle mesh (screen x, y in sv) into a low-resolution buffer,
 *                                        keeping the largest attribute per texel (a z-buffer where nearer = larger Z)
 *   dilate(buf, r)                       grow the filled region by r texels so the matte reaches past the silhouette
 *   mattes(buf, front, back)             front = clamp(½ + Z/fwidth Z), back = 1 − clamp(Z/fwidth Z − ½): two alpha masks
 *   pcss(cov, hmap, …)                   percentage-closer soft shadows on summed-area tables: blocker search,
 *                                        penumbra w = W_L·h/(H_L − h), box filter of that width
 * No canvas here: plain typed arrays, so every number is the same on every run.
 */
import { clamp } from '../_lib/stage.js';

export function makeBuf(w, h, k) {
  return { w, h, k, v: new Float32Array(w * h), bb: [0, 0, -1, -1] };
}
/** reset the region last written (and remember none) — callers always clear before rasterising */
export function clearBuf(buf) {
  const [x0, y0, x1, y1] = buf.bb, v = buf.v;
  for (let y = y0; y <= y1; y++) v.fill(-Infinity, y * buf.w + x0, y * buf.w + x1 + 1);
  buf.bb = [0, 0, -1, -1];
}
export function fillAll(buf) { buf.v.fill(-Infinity); buf.bb = [0, 0, -1, -1]; }

/**
 * Rasterise triangles (indices into sv/att) into buf at buf.k texels per stage px. Each covered texel centre gets the
 * barycentric interpolation of att; the buffer keeps the maximum (nearest). Texels whose value is ≤ floor are skipped.
 */
export function rasterMax(buf, sv, att, tri, floor = -Infinity) {
  const { w, h, k, v } = buf;
  let bx0 = w, by0 = h, bx1 = -1, by1 = -1;
  const S = sv;
  for (let t = 0; t < tri.length; t += 3) {
    const a = tri[t], b = tri[t + 1], c = tri[t + 2];
    const ax = S[a * 2] * k, ay = S[a * 2 + 1] * k, bx = S[b * 2] * k, by = S[b * 2 + 1] * k, cx = S[c * 2] * k, cy = S[c * 2 + 1] * k;
    const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area) < 1e-7) continue;
    const za = att[a], zb = att[b], zc = att[c];
    if (za <= floor && zb <= floor && zc <= floor) continue;
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx))), x1 = Math.min(w - 1, Math.ceil(Math.max(ax, bx, cx)));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy))), y1 = Math.min(h - 1, Math.ceil(Math.max(ay, by, cy)));
    if (x0 > x1 || y0 > y1) continue;
    const inv = 1 / area, eps = -1e-4;
    for (let y = y0; y <= y1; y++) {
      const py = y + 0.5;
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5;
        const w0 = ((bx - px) * (cy - py) - (by - py) * (cx - px)) * inv;
        if (w0 < eps) continue;
        const w1 = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) * inv;
        if (w1 < eps) continue;
        const w2 = 1 - w0 - w1;
        if (w2 < eps) continue;
        const z = w0 * za + w1 * zb + w2 * zc;
        if (z <= floor) continue;
        const i = y * w + x;
        if (z > v[i]) v[i] = z;
      }
    }
    if (x0 < bx0) bx0 = x0; if (y0 < by0) by0 = y0; if (x1 > bx1) bx1 = x1; if (y1 > by1) by1 = y1;
  }
  const [ox0, oy0, ox1, oy1] = buf.bb;
  if (bx1 >= bx0) buf.bb = ox1 < ox0 ? [bx0, by0, bx1, by1] : [Math.min(ox0, bx0), Math.min(oy0, by0), Math.max(ox1, bx1), Math.max(oy1, by1)];
}

/** grow the filled texels by r steps (4-neighbour max), so the matte is defined a little past the drawn edge */
export function dilate(buf, r, tmp) {
  const { w, h, v } = buf;
  let [x0, y0, x1, y1] = buf.bb;
  if (x1 < x0) return;
  for (let s = 0; s < r; s++) {
    x0 = Math.max(0, x0 - 1); y0 = Math.max(0, y0 - 1); x1 = Math.min(w - 1, x1 + 1); y1 = Math.min(h - 1, y1 + 1);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tmp[y * w + x] = v[y * w + x];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = y * w + x;
      if (tmp[i] !== -Infinity) continue;
      let m = -Infinity;
      if (x > 0 && tmp[i - 1] > m) m = tmp[i - 1];
      if (x < w - 1 && tmp[i + 1] > m) m = tmp[i + 1];
      if (y > 0 && tmp[i - w] > m) m = tmp[i - w];
      if (y < h - 1 && tmp[i + w] > m) m = tmp[i + w];
      v[i] = m;
    }
  }
  buf.bb = [x0, y0, x1, y1];
}

/**
 * The depth test against the bar plane Z = 0, per texel, written as alpha into two ImageData (same size as buf).
 * The edge is anti-aliased like an isoline in a shader: q = Z / fwidth(Z), fwidth = |∂Z/∂x| + |∂Z/∂y| from central
 * differences, so the transition is one texel wide however slowly Z changes across the body.
 *   front = clamp(½ + q)        — drawn over bars, mat and page, never clipped
 *   back  = 1 − clamp(q − ½)    — clipped to the picture, under the bars; still opaque wherever front is partial,
 *                                 so the two layers meet without a see-through seam
 * Texels without depth are 0 (front) and 1 (back) — nothing of the whale is drawn there anyway.
 */
export function mattes(buf, front, back) {
  const { w, h, v } = buf, F = front.data, B = back.data;
  const [x0, y0, x1, y1] = buf.bb;
  const at = (i, fb) => (v[i] === -Infinity ? fb : v[i]);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * w + x, z = v[i];
    let f = 0, b = 255;
    if (z !== -Infinity) {
      const gx = (at(x < w - 1 ? i + 1 : i, z) - at(x > 0 ? i - 1 : i, z)) * 0.5;
      const gy = (at(y < h - 1 ? i + w : i, z) - at(y > 0 ? i - w : i, z)) * 0.5;
      const q = z / Math.max(1e-3, Math.abs(gx) + Math.abs(gy));
      f = Math.round(255 * clamp(0.5 + q));
      b = Math.round(255 * (1 - clamp(q - 0.5)));
    }
    F[i * 4 + 3] = f; B[i * 4 + 3] = b;
  }
}

/** summed-area table of a (w+1)×(h+1) */
function sat(src, w, h, out) {
  for (let x = 0; x <= w; x++) out[x] = 0;
  for (let y = 0; y < h; y++) {
    let row = 0;
    const o = (y + 1) * (w + 1), p = y * (w + 1);
    out[o] = 0;
    for (let x = 0; x < w; x++) { row += src[y * w + x]; out[o + x + 1] = out[p + x + 1] + row; }
  }
}
const boxSum = (S, W1, x0, y0, x1, y1) => S[(y1 + 1) * W1 + x1 + 1] - S[y0 * W1 + x1 + 1] - S[(y1 + 1) * W1 + x0] + S[y0 * W1 + x0];

/**
 * Percentage-closer soft shadows on the bar plane. cov (0/1) and hcov (= cov·h) are the occluders already projected
 * onto the plane from the light, h their height above it. For every texel:
 *   1. blocker search: mean h over a (2·rs+1)² window,  h̄ = Σ cov·h / Σ cov
 *   2. penumbra:       w = W_L · h̄ / (H_L − h̄)   (similar triangles: light of width W_L at height H_L)
 *   3. filter:         visibility loss = mean of cov over a box of half-width w/2 (fractional widths interpolate)
 * Writes alpha = opacity(h̄) · loss into img (RGBA, w×h).
 */
export function pcss(P, img) {
  const { w, h, cov, hcov, satC, satH, rs, k, WL, HL, alpha } = P;
  sat(cov, w, h, satC); sat(hcov, w, h, satH);
  const W1 = w + 1, D = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    const xa = Math.max(0, x - rs), xb = Math.min(w - 1, x + rs), ya = Math.max(0, y - rs), yb = Math.min(h - 1, y + rs);
    const n = boxSum(satC, W1, xa, ya, xb, yb);
    if (n < 0.5) { D[i * 4 + 3] = 0; continue; }
    const hb = boxSum(satH, W1, xa, ya, xb, yb) / n;
    const wpx = WL * hb / Math.max(1, HL - hb);                       // penumbra width on the plane, stage px
    const r = clamp(wpx * 0.5 * k, 0.5, rs), r0 = Math.floor(r), f = r - r0;
    const avg = (rr) => {
      const x0 = Math.max(0, x - rr), x1 = Math.min(w - 1, x + rr), y0 = Math.max(0, y - rr), y1 = Math.min(h - 1, y + rr);
      return boxSum(satC, W1, x0, y0, x1, y1) / ((x1 - x0 + 1) * (y1 - y0 + 1));
    };
    let s = avg(r0) * (1 - f) + (f > 0 ? avg(r0 + 1) * f : 0);
    s = s * s * (3 - 2 * s);
    D[i * 4 + 3] = Math.round(255 * clamp(alpha(hb) * s));
  }
}
