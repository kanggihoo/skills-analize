/*
 * 54 · paper.js — cut paper: grain tiles, the scissor cut and the per-pose draw of a piece.
 * A piece is a set of loops in its own coordinates (outer loop area < 0, holes > 0 → nonzero fill keeps the holes).
 * Each pose (12 per second) the loops are placed on the stage, then cut again with that pose's seed: points every
 * 6–16 px along the outline (corners always kept), each pushed off the line by a slow hand wander plus a jag.
 * Cutting after the transform keeps the facets the same size in stage pixels at any scale. The paper grain is a
 * pattern that moves and turns with the piece.
 */
import { rand, clamp, lerp } from '../_lib/stage.js';

export const TAU = Math.PI * 2;
export const hseed = (a, b) => (Math.imul(a + 1, 0x9e3779b1) ^ Math.imul(b + 7, 0x85ebca6b)) >>> 0;
export function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }

/** tileable paper: value-noise formation + tooth, curved fibres; grey around `base` (128 = neutral for overlay) */
export function paperTile(seed, S, octs, fibres, base = 128, contrast = 255) {
  const r = rand(seed), cv = mk(S, S), c = cv.getContext('2d', { willReadFrequently: true });
  const acc = new Float32Array(S * S);
  for (const [n, amp] of octs) {
    const g = new Float32Array(n * n);
    for (let i = 0; i < n * n; i++) g[i] = r() - 0.5;
    const k = n / S;
    for (let y = 0; y < S; y++) {
      const fy = y * k, iy = fy | 0, ty = fy - iy, sy = ty * ty * (3 - 2 * ty), y0 = (iy % n) * n, y1 = ((iy + 1) % n) * n;
      for (let x = 0; x < S; x++) {
        const fx = x * k, ix = fx | 0, tx = fx - ix, sx = tx * tx * (3 - 2 * tx), x0 = ix % n, x1 = (ix + 1) % n;
        const a = g[y0 + x0] + (g[y0 + x1] - g[y0 + x0]) * sx, b = g[y1 + x0] + (g[y1 + x1] - g[y1 + x0]) * sx;
        acc[y * S + x] += amp * (a + (b - a) * sy);
      }
    }
  }
  const img = c.createImageData(S, S), d = img.data;
  for (let i = 0; i < S * S; i++) {
    const v = clamp(base + (acc[i] + 0.06 * (r() - 0.5)) * contrast, 0, 255);
    d[4 * i] = d[4 * i + 1] = d[4 * i + 2] = v; d[4 * i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  for (let i = 0; i < fibres; i++) {
    const x = r() * S, y = r() * S, a = r() * TAU, len = 5 + r() * r() * 40, bend = (r() - 0.5) * 0.9, light = r() < 0.6;
    c.strokeStyle = light ? `rgba(255,255,255,${(0.07 + 0.12 * r()).toFixed(3)})` : `rgba(0,0,0,${(0.05 + 0.07 * r()).toFixed(3)})`;
    c.lineWidth = 0.35 + r() * 0.8;
    const ex = Math.cos(a) * len, ey = Math.sin(a) * len, mx = ex / 2 - ey * bend * 0.5, my = ey / 2 + ex * bend * 0.5;
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      if (x + ox > S + 50 || x + ox < -50 - len || y + oy > S + 50 || y + oy < -50 - len) continue;
      c.beginPath(); c.moveTo(x + ox, y + oy); c.quadraticCurveTo(x + ox + mx, y + oy + my, x + ox + ex, y + oy + ey); c.stroke();
    }
  }
  return cv;
}

/** a sheet of coloured paper: the dye, its fibres (overlay) and a soft cloudiness (soft-light) */
export function sheetTile(color, grain, cloudy, { grainK = 0.62, cloudK = 0.5 } = {}) {
  const S = grain.width, cv = mk(S, S), c = cv.getContext('2d');
  c.fillStyle = color; c.fillRect(0, 0, S, S);
  c.globalCompositeOperation = 'overlay'; c.globalAlpha = grainK; c.drawImage(grain, 0, 0);
  c.globalCompositeOperation = 'soft-light'; c.globalAlpha = cloudK; c.drawImage(cloudy, 0, 0, S, S);
  return cv;
}

/**
 * The scissors. S: flat stage-space loop (n points), C: corner flags. Returns the cut as a flat array.
 * Facet points every f0..f1 px of arc length; offsets along the edge normal = wander (smooth, loops around the
 * outline) + jag (per snip). Corners keep their place up to a small jitter.
 */
export function scissor(S, C, n, rnd, cut) {
  const { f0, f1, jag, wander } = cut;
  const seg = new Float64Array(n);
  let total = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, d = Math.hypot(S[2 * j] - S[2 * i], S[2 * j + 1] - S[2 * i + 1]);
    seg[i] = d; total += d;
  }
  if (total < 1) return Array.from(S.subarray(0, 2 * n));
  const K = Math.max(3, Math.round(total / 150)), knots = new Float64Array(K);
  for (let k = 0; k < K; k++) knots[k] = rnd() * 2 - 1;
  const wn = (u) => { const x = u * K, i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f), a = knots[((i % K) + K) % K]; return a + (knots[(((i + 1) % K) + K) % K] - a) * s; };
  let start = 0;
  for (let i = 0; i < n; i++) if (C[i]) { start = i; break; }
  const out = [];
  let s0 = 0, next = 0;
  for (let kk = 0; kk < n; kk++) {
    const i = (start + kk) % n, j = (i + 1) % n;
    const ax = S[2 * i], ay = S[2 * i + 1], len = seg[i];
    if (C[i] || kk === 0) {
      out.push(ax + (rnd() - 0.5) * jag * 0.7, ay + (rnd() - 0.5) * jag * 0.7);
      next = s0 + lerp(f0, f1, rnd());
    }
    if (len > 1e-6) {
      const tx = (S[2 * j] - ax) / len, ty = (S[2 * j + 1] - ay) / len;
      const guard = s0 + len - (C[j] || kk === n - 1 ? f0 * 0.5 : 0);
      while (next < guard) {
        const d = next - s0, off = wander * wn(next / total) + jag * (rnd() - 0.5) * 2;
        out.push(ax + tx * d - ty * off, ay + ty * d + tx * off);
        next += lerp(f0, f1, rnd());
      }
    }
    s0 += len;
  }
  return out;
}

const SHADOW = '#140a03';
let SEED = 1000;
/**
 * A piece. loops: [{ pts (Float64Array, local), corner (Uint8Array), n }], outer loops first.
 * Orientation is normalised (outer area < 0, holes > 0) so nonzero filling keeps holes open.
 */
export function piece(loops, o = {}) {
  const fixed = loops.map((L, k) => {
    let A = 0;
    for (let i = 0; i < L.n; i++) { const j = (i + 1) % L.n; A += L.pts[2 * i] * L.pts[2 * j + 1] - L.pts[2 * j] * L.pts[2 * i + 1]; }
    const hole = o.holes ? o.holes[k] : k > 0;
    if ((hole && A < 0) || (!hole && A > 0)) {
      const pts = new Float64Array(2 * L.n), corner = new Uint8Array(L.n);
      for (let i = 0; i < L.n; i++) { const s = L.n - 1 - i; pts[2 * i] = L.pts[2 * s]; pts[2 * i + 1] = L.pts[2 * s + 1]; corner[i] = L.corner[s]; }
      return { pts, corner, n: L.n };
    }
    return L;
  });
  const seed = o.seed ?? SEED++;
  const r = rand(seed * 7 + 3);
  return {
    loops: fixed, seed, color: o.color || 'black', home: o.home || [0, 0],
    cut: o.cut || { f0: 7, f1: 16, jag: 0.75, wander: 1.3 },
    rot0: o.rot0 ?? 0, hand: o.hand ?? 1, lift: o.lift ?? 1, rim: o.rim ?? true,
    tex: [r() * 512, r() * 512, r() * 360],
    ch: o.ch ?? 0, box: o.box,
  };
}

/** loops for primitives */
export function rectLoop(x0, y0, x1, y1) {
  return { pts: Float64Array.from([x0, y0, x0, y1, x1, y1, x1, y0]), corner: Uint8Array.from([1, 1, 1, 1]), n: 4 };
}
export function circleLoop(r, cx = 0, cy = 0, step = 4) {
  const n = Math.max(12, Math.ceil(TAU * r / step)), pts = new Float64Array(2 * n);
  for (let i = 0; i < n; i++) { const a = TAU * i / n; pts[2 * i] = cx + r * Math.cos(a); pts[2 * i + 1] = cy + r * Math.sin(a); }
  return { pts, corner: new Uint8Array(n), n };
}
export function polyLoop(P) {   // [[x, y, corner?], …]
  return { pts: Float64Array.from(P.flatMap((p) => [p[0], p[1]])), corner: Uint8Array.from(P.map((p) => (p[2] === 0 ? 0 : 1))), n: P.length };
}

/**
 * Draw piece P in pose { x, y, rot, sc } for stop-motion pose `step`. look: { pat(color) → CanvasPattern,
 * rim(color) → css, map(color) → color, shadow: 0..1 }. Every pose re-cuts the edge and re-places the piece by hand.
 */
export function drawPiece(c, P, pose, step, look) {
  const r = rand(hseed(P.seed, step));
  const hand = P.hand * (pose.hand ?? 1);
  const g = () => (r() + r() - 1);
  const hx = g() * 1.3 * hand, hy = g() * 1.3 * hand, ha = g() * 0.0065 * hand;
  const ang = P.rot0 + (pose.rot || 0) + ha, sc = pose.sc ?? 1;
  const ca = Math.cos(ang) * sc, sa = Math.sin(ang) * sc;
  const tx = pose.x + hx, ty = pose.y + hy;
  const path = new Path2D();
  for (const L of P.loops) {
    const n = L.n, S = new Float64Array(2 * n);
    for (let i = 0; i < n; i++) { const lx = L.pts[2 * i], ly = L.pts[2 * i + 1]; S[2 * i] = tx + ca * lx - sa * ly; S[2 * i + 1] = ty + sa * lx + ca * ly; }
    const F = scissor(S, L.corner, n, r, P.cut);
    path.moveTo(F[0], F[1]);
    for (let k = 2; k < F.length; k += 2) path.lineTo(F[k], F[k + 1]);
    path.closePath();
  }
  const color = look.map ? look.map(P.color) : P.color;
  const pat = look.pat(color);
  const ta = ang + P.tex[2] * Math.PI / 180, ct = Math.cos(ta), st = Math.sin(ta);
  pat.setTransform(new DOMMatrix([ct, st, -st, ct, tx + P.tex[0], ty + P.tex[1]]));
  // contact shadow: the same cut, offset down-right in two steps (a soft edge without a blur filter, which costs
  // a full raster pass per piece); the key light sits up-left of the table
  const lift = P.lift * (pose.lift ?? 1) * (look.shadow ?? 1);
  if (lift > 0) {
    const sx = 2.5 + 2.6 * lift, sy = 3.5 + 3.4 * lift;
    c.fillStyle = SHADOW;
    c.save(); c.translate(sx, sy); c.globalAlpha = 0.16; c.fill(path); c.restore();
    c.save(); c.translate(sx * 0.55, sy * 0.55); c.globalAlpha = 0.2; c.fill(path); c.restore();
  }
  c.fillStyle = pat;
  c.fill(path);
  if (P.rim && look.rim) { c.lineWidth = 1.1; c.strokeStyle = look.rim(color); c.stroke(path); }
}
