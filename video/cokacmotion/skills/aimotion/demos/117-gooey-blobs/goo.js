/*
 * goo.js — the liquid: a scalar field on a half-resolution grid (540×960 cells for the 1080×1920 stage),
 * thresholded with a one-cell smoothstep edge and lit as a soft glossy pillow.
 *
 *   field   F(p) = Σ kernels of balls (ellipses) and capsules  +  glyph coverage  +  wipe / drain terms
 *           kernel k(d) = (1 − d²/S²)³ for d < S (Wyvill, compact support), iso-surface at F = T
 *   colour  Σ k²·c / Σ k²  — every primitive carries a colour, so colours blend wherever fields overlap
 *   edge    d ≈ (F − T) / |∇F|   (cells, + inside) → alpha = clamp(d + ½)  — anti-aliased at any field shape
 *   light   pillow normal from the edge distance (steep at the rim, flat inside), Lambert + a thresholded
 *           specular → a crisp highlight crescent offset inward along the edge normal; drop shadow from an
 *           offset field sample
 * Nothing here knows about time: main.js decides every primitive for t and calls these in order.
 */
export const GW = 540, GH = 960, GN = GW * GH;
export const T = 0.3;                                   // iso level
export const KS = 1 / Math.sqrt(1 - Math.cbrt(T));     // support radius / visible radius of a lone ball (1.74)

const F = new Float32Array(GN), CW = new Float32Array(GN), CR = new Float32Array(GN), CG = new Float32Array(GN), CB = new Float32Array(GN);

export function clear() { F.fill(0); CW.fill(0); CR.fill(0); CG.fill(0); CB.fill(0); }

/** an elliptic metaball: centre, visible radius r (stage px), stretch sx/sy along angle ang */
export function ball(x, y, r, col, sx = 1, sy = 1, ang = 0) {
  if (!(r > 0.8)) return;
  const cx = x * 0.5, cy = y * 0.5;
  const Sx = r * sx * 0.5 * KS, Sy = r * sy * 0.5 * KS, R = Math.max(Sx, Sy);
  const xa = Math.max(0, Math.floor(cx - R)), xb = Math.min(GW - 1, Math.ceil(cx + R));
  const ya = Math.max(0, Math.floor(cy - R)), yb = Math.min(GH - 1, Math.ceil(cy + R));
  if (xa > xb || ya > yb) return;
  const c = Math.cos(ang), s = Math.sin(ang), cx_ = c / Sx, sx_ = s / Sx, cy_ = c / Sy, sy_ = s / Sy;
  const r0 = col[0], g0 = col[1], b0 = col[2];
  for (let py = ya; py <= yb; py++) {
    const dy = py + 0.5 - cy, uy = dy * sx_, vy = dy * cy_;
    let i = py * GW + xa;
    for (let px = xa; px <= xb; px++, i++) {
      const dx = px + 0.5 - cx;
      const u = dx * cx_ + uy, v = vy - dx * sy_;
      const q = 1 - u * u - v * v;
      if (q > 0) {
        const k = q * q * q, w = k * k;
        F[i] += k; CW[i] += w; CR[i] += w * r0; CG[i] += w * g0; CB[i] += w * b0;
      }
    }
  }
}

/** a capsule (segment with radius r); colour runs from c1 at the first end to c2 at the second */
export function capsule(x1, y1, x2, y2, r, c1, c2 = c1) {
  if (!(r > 0.8)) return;
  const ax = x1 * 0.5, ay = y1 * 0.5, bx = x2 * 0.5, by = y2 * 0.5, S = r * 0.5 * KS, iS2 = 1 / (S * S);
  const xa = Math.max(0, Math.floor(Math.min(ax, bx) - S)), xb = Math.min(GW - 1, Math.ceil(Math.max(ax, bx) + S));
  const ya = Math.max(0, Math.floor(Math.min(ay, by) - S)), yb = Math.min(GH - 1, Math.ceil(Math.max(ay, by) + S));
  if (xa > xb || ya > yb) return;
  const vx = bx - ax, vy = by - ay, iL2 = 1 / (vx * vx + vy * vy || 1e-9);
  const dr = c2[0] - c1[0], dg = c2[1] - c1[1], db = c2[2] - c1[2];
  for (let py = ya; py <= yb; py++) {
    const wy = py + 0.5 - ay;
    let i = py * GW + xa;
    for (let px = xa; px <= xb; px++, i++) {
      const wx = px + 0.5 - ax;
      let h = (wx * vx + wy * vy) * iL2; h = h < 0 ? 0 : h > 1 ? 1 : h;
      const dx = wx - vx * h, dy = wy - vy * h;
      const q = 1 - (dx * dx + dy * dy) * iS2;
      if (q > 0) {
        const k = q * q * q, w = k * k;
        F[i] += k; CW[i] += w; CR[i] += w * (c1[0] + dr * h); CG[i] += w * (c1[1] + dg * h); CB[i] += w * (c1[2] + db * h);
      }
    }
  }
}

// ---------------------------------------------------------------- glyphs in the field
function boxH(src, dst, w, h, r) {
  const n = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    const o = y * w;
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[o + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      dst[o + x] = acc / n;
      acc += src[o + Math.min(w - 1, x + r + 1)] - src[o + Math.max(0, x - r)];
    }
  }
}
function boxV(src, dst, w, h, r) {
  const n = 2 * r + 1;
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += src[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      dst[y * w + x] = acc / n;
      acc += src[Math.min(h - 1, y + r + 1) * w + x] - src[Math.max(0, y - r) * w + x];
    }
  }
}
/** three box passes ≈ a gaussian of σ ≈ r (cells) */
function blur(src, w, h, r) {
  const a = Float32Array.from(src), b = new Float32Array(src.length);
  for (let k = 0; k < 3; k++) { boxH(a, b, w, h, r); boxV(b, a, w, h, r); }
  return a;
}

/**
 * Rasterise text at stage resolution (draw(ctx) fills white glyphs), average 2×2 → coverage per cell, crop to the ink
 * box + margin and keep five blur levels (σ ≈ 0, 1.4, 3.5, 6.5, 11 cells): melting walks up these levels.
 * cn = a smooth 0..1 value per column (where the melted letters sag furthest).
 */
export function textField(draw, seed = 7, margin = 46) {
  const c = document.createElement('canvas');
  c.width = GW * 2; c.height = GH * 2;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.fillStyle = '#fff';
  draw(x);
  const px = x.getImageData(0, 0, c.width, c.height).data, SW = c.width;
  let x0 = GW, y0 = GH, x1 = -1, y1 = -1;
  const cov = new Float32Array(GN);
  for (let y = 0; y < GH; y++) {
    for (let xx = 0; xx < GW; xx++) {
      const j = ((y * 2) * SW + xx * 2) * 4 + 3;
      const v = (px[j] + px[j + 4] + px[j + SW * 4] + px[j + SW * 4 + 4]) / 1020;
      if (v > 0) {
        cov[y * GW + xx] = v;
        if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  const bx0 = Math.max(0, x0 - margin), by0 = Math.max(0, y0 - margin);
  const w = Math.min(GW - 1, x1 + margin) - bx0 + 1, h = Math.min(GH - 1, y1 + margin) - by0 + 1;
  const lv0 = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) lv0[y * w + xx] = cov[(by0 + y) * GW + bx0 + xx];
  const lv = [lv0, blur(lv0, w, h, 1), blur(lv0, w, h, 3), blur(lv0, w, h, 6), blur(lv0, w, h, 10)];
  // smooth column noise (value noise, 3 octaves)
  let s = seed >>> 0;
  const rnd = () => { s = (s + 0x6d2b79f5) >>> 0; let r = Math.imul(s ^ (s >>> 15), 1 | s); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  const cn = new Float32Array(w);
  for (const [cell, amp] of [[34, 0.6], [13, 0.3], [6, 0.1]]) {
    const n = Math.ceil(w / cell) + 2, knots = Array.from({ length: n }, rnd);
    for (let xx = 0; xx < w; xx++) {
      const u = xx / cell, k = Math.floor(u), f = u - k, e = f * f * (3 - 2 * f);
      cn[xx] += amp * (knots[k] + (knots[k + 1] - knots[k]) * e);
    }
  }
  return { bx0, by0, w, h, lv, cn, top: y0 - by0, bot: y1 - by0,
    box: [x0 * 2, y0 * 2, (x1 + 1) * 2, (y1 + 1) * 2] };   // ink box in stage px
}

/** push the existing field away from the letters: F *= 1 − amt·smooth(dilated glyphs) (a gap the goo flows around) */
export function carve(tx, amt) {
  if (amt <= 0) return;
  const { bx0, by0, w, h } = tx, L = tx.lv[4];
  for (let y = 0; y < h; y++) {
    let i = (by0 + y) * GW + bx0, j = y * w;
    for (let x = 0; x < w; x++, i++, j++) {
      let u = (L[j] - 0.03) / 0.17;
      if (u <= 0) continue;
      u = u > 1 ? 1 : u * u * (3 - 2 * u);
      F[i] *= 1 - amt * u;
    }
  }
}

/**
 * add glyph coverage to the field: F += 2T·gain·c, so a sharp glyph's iso-line sits on its 50 % coverage edge.
 * m ∈ [0,3] walks up the blur levels (letters swell, round off and bridge to nearby goo); slump stretches each
 * column downward by up to ~16 cells (more where cn is high), most at the bottom of the line — the letters sag.
 */
export function text(tx, gain, m, slump, col) {
  if (gain <= 0) return;
  const { bx0, by0, w, h, lv, cn, top, bot } = tx;
  const l = Math.min(3, Math.floor(m)), fm = m - l, A = lv[l], B = lv[l + 1];
  const g2 = 2 * T * gain * (1 + 0.42 * m), span = Math.max(1, bot - top);
  const r0 = col[0], g0 = col[1], b0 = col[2];
  for (let y = 0; y < h; y++) {
    let ramp = (y - top) / span; ramp = ramp < 0 ? 0 : ramp > 1.25 ? 1.25 : ramp;
    let i = (by0 + y) * GW + bx0;
    for (let x = 0; x < w; x++, i++) {
      const sy = y - slump * ramp * (3 + 15 * cn[x]);
      const y0 = Math.floor(sy);
      if (y0 < 0 || y0 >= h - 1) continue;
      const fy = sy - y0, j0 = y0 * w + x, j1 = j0 + w;
      const c0 = A[j0] + (B[j0] - A[j0]) * fm, c1 = A[j1] + (B[j1] - A[j1]) * fm;
      const c = c0 + (c1 - c0) * fy;
      if (c <= 0.003) continue;
      const v = g2 * c, ww = v * v;
      F[i] += v; CW[i] += ww; CR[i] += ww * r0; CG[i] += ww * g0; CB[i] += ww * b0;
    }
  }
}

/** per-cell angle around a fixed centre (stage px) — the wipe's lumpy rim is a function of this angle */
export function angleField(cx, cy) {
  const a = new Float32Array(GN);
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) a[y * GW + x] = Math.atan2(y + 0.5 - cy * 0.5, x + 0.5 - cx * 0.5);
  return a;
}

/** liquid wipe: a disc of radius R (stage px) whose rim wobbles with angle; a linear ramp 2T·(½ + (R − r)/w), clamped */
export function wipe(cx, cy, R, t, col, TH) {
  const X = cx * 0.5, Y = cy * 0.5, Rh = R * 0.5, wr = 24, amp = Rh * 0.11 + 4, top = 2 * T * 1.5;
  const r0 = col[0], g0 = col[1], b0 = col[2];
  const out = Rh + amp + wr, inn = Rh - amp - wr * 1.5;
  const p1 = 3.1 * t, p2 = -4.3 * t + 1.0, p3 = 6.0 * t + 2.2;
  for (let y = 0; y < GH; y++) {
    const dy = y + 0.5 - Y;
    if (Math.abs(dy) > out) continue;
    let i = y * GW;
    for (let x = 0; x < GW; x++, i++) {
      const dx = x + 0.5 - X, r = Math.sqrt(dx * dx + dy * dy);
      if (r > out) continue;
      let v;
      if (r < inn) v = top;
      else {
        const a = TH[i];
        const wob = Rh * (0.05 * Math.sin(5 * a + p1) + 0.035 * Math.sin(9 * a + p2) + 0.02 * Math.sin(14 * a + p3));
        let u = 0.5 + (Rh + wob - r) / wr; u = u < 0 ? 0 : u > 1.5 ? 1.5 : u;
        if (u <= 0) continue;
        v = 2 * T * u;
      }
      const ww = v * v;
      F[i] += v; CW[i] += ww; CR[i] += ww * r0; CG[i] += ww * g0; CB[i] += ww * b0;
    }
  }
}

/** drain: a frame-filling term that recedes as s falls — holes open first where NZ (noise) and DN (distance from the title) are high */
export function drain(s, DN, NZ, col, lift = 0) {
  const base = s * 2.4 + 0.15 + lift;
  if (base <= 0) return;
  const r0 = col[0], g0 = col[1], b0 = col[2];
  for (let i = 0; i < GN; i++) {
    let a = base - 0.7 * DN[i] - 1.3 * NZ[i];
    if (a <= 0) continue;
    if (a > 1.4) a = 1.4;
    const v = 2 * T * a, ww = v * v;
    F[i] += v; CW[i] += ww; CR[i] += ww * r0; CG[i] += ww * g0; CB[i] += ww * b0;
  }
}

// ---------------------------------------------------------------- shading
const LX = -0.48, LY = -0.62, LZ = 0.62;                          // light from the upper left, toward the viewer
const hn = Math.hypot(LX, LY, LZ + 1), HX = LX / hn, HY = LY / hn, HZ = (LZ + 1) / hn;   // half vector
const DEP = 22;          // cells over which the pillow rises from the rim to its flat top
const SOX = 7, SOY = 11; // drop-shadow offset (cells)

/**
 * Write the goo into an RGBA buffer (GW×GH): colour, inner gradient, gloss crescent, AA edge, drop shadow.
 * sh = shadow colour, shA = shadow opacity, hi = highlight colour.
 */
export function shade(data, { sh, shA, hi }) {
  const T0 = T * 0.42, T1 = T * 1.2;
  for (let y = 0; y < GH; y++) {
    const up = y > 0 ? GW : 0, dn = y < GH - 1 ? GW : 0;
    const sdy = Math.min(y, SOY) * GW;
    const vg = 1.035 - 0.07 * (y / GH);
    let i = y * GW;
    for (let x = 0; x < GW; x++, i++) {
      const o = i << 2;
      const f = F[i], fs = F[i - sdy - Math.min(x, SOX)];
      if (f < T0 && fs < T0) { data[o + 3] = 0; continue; }
      const gx = (F[x < GW - 1 ? i + 1 : i] - F[x > 0 ? i - 1 : i]) * 0.5;
      const gy = (F[i + dn] - F[i - up]) * 0.5;
      const g = Math.sqrt(gx * gx + gy * gy) + 1e-9;
      const d = (f - T) / g;
      let a = d + 0.5; a = a < 0 ? 0 : a > 1 ? 1 : a;
      let sa = 0;
      if (fs > T0) { let u = (fs - T0) / (T1 - T0); u = u > 1 ? 1 : u; sa = u * u * (3 - 2 * u) * shA; }
      if (a <= 0) {
        data[o] = sh[0]; data[o + 1] = sh[1]; data[o + 2] = sh[2]; data[o + 3] = sa * 255;
        continue;
      }
      const w = CW[i] + 1e-30;
      let cr = CR[i] / w, cg = CG[i] / w, cb = CB[i] / w;
      const nx = -gx / g, ny = -gy / g;                 // outward normal
      // depth below the rim: the distance estimate, but never shallower than the field value says — small
      // primitives inside the goo make steep local gradients that would otherwise read as creases
      let dep = Math.max(d / DEP, (f - T) / (1.8 * T)); dep = dep < 0 ? 0 : dep > 1 ? 1 : dep;
      const e = 1 - dep, sl = e * e * 1.7;              // pillow slope: steep at the rim, flat on top
      const Nx = nx * sl, Ny = ny * sl, inv = 1 / Math.sqrt(Nx * Nx + Ny * Ny + 1);
      const diff = (Nx * LX + Ny * LY + LZ) * inv;
      const spec = (Nx * HX + Ny * HY + HZ) * inv;
      let core = (f - T) / (2 * T); core = core > 1 ? 1 : core < 0 ? 0 : core;
      const s = (1 + 0.55 * (diff - LZ)) * vg * (0.965 + 0.06 * core);
      cr *= s; cg *= s; cb *= s;
      let hl = (spec - 0.935) / 0.03;
      if (hl > 0) {
        hl = hl > 1 ? 1 : hl * hl * (3 - 2 * hl);
        hl *= 0.9;
        cr += (hi[0] - cr) * hl; cg += (hi[1] - cg) * hl; cb += (hi[2] - cb) * hl;
      }
      const oa = a + sa * (1 - a), k = sa * (1 - a);
      data[o] = (cr * a + sh[0] * k) / oa;
      data[o + 1] = (cg * a + sh[1] * k) / oa;
      data[o + 2] = (cb * a + sh[2] * k) / oa;
      data[o + 3] = oa * 255;
    }
  }
}
