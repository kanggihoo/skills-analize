/*
 * 27 · the marbling engine — Lu, Jaffer et al., "Mathematical Marbling" (IEEE CG&A 2012).
 *
 * Every ink film is a closed polygon. Every action on the bath is a closed-form, invertible map of the plane
 * that is applied to every vertex of every film:
 *   drop    p → c + (p − c)·sqrt(1 + r²/|p − c|²)          (area-preserving: the ring outside grows by πr²)
 *   tine    p → p + z·u·λ^d,  λ^d = exp(−d/L)              (a shear: d = distance to the tine line, u its direction)
 *   comb    the same with d = distance to the nearest of many parallel tines (spacing S)
 *   vortex  p → c + R(θ)(p − c),  θ = z·exp(−||p − c| − R|/L)/|p − c|   (Jaffer's circular stroke: rotation per radius)
 * After each map the polygons are adaptively refined: an edge whose image is longer than MAXLEN is split at
 * the image of its pre-image midpoint (recursively), so curves stay smooth however far they are stretched;
 * points closer than MINLEN are dropped so compressed parts don't pile up vertices.
 */

export const MAXLEN = 2.4, MINLEN = 0.7;

// the map being applied: (x, y) → (FX, FY). One shared output pair, no allocation per vertex.
let FX = 0, FY = 0;

/** a map factory for an operation at progress k ∈ [0, 1] (k = 1: the exact closed form) */
export function makeMap(op, k) {
  if (op.type === 'drop') {
    const [cx, cy] = op.c, r2 = op.r * op.r * k;
    return (x, y) => {
      let dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
      if (d2 < 1e-12) { dx = 1e-6; d2 = 1e-12; }
      const s = Math.sqrt(1 + r2 / d2);
      FX = cx + dx * s; FY = cy + dy * s;
    };
  }
  if (op.type === 'tine') {
    // a stylus (S = Infinity) or comb moving along u. While moving, its tip is at sTip along u: material
    // behind the tip is fully displaced, material ahead not yet; the ramp is ≥ 2z long so the map stays
    // one-to-one (ds'/ds ≥ 1 − 1.5/2 > 0). At k = 1 the tip is past everything: the exact closed form.
    const [bx, by] = op.B, [ux, uy] = op.u, nx = -uy, ny = ux, z = op.z, L = op.L, S = op.S;
    const sTip = op.sStart + (op.sEnd - op.sStart) * k, full = k >= 1, inv2z = 1 / (2 * z);
    return (x, y) => {
      const px = x - bx, py = y - by;
      let d = px * nx + py * ny;
      if (S !== Infinity) d -= S * Math.round(d / S);
      d = Math.abs(d);
      let m = z * Math.exp(-d / L);
      if (!full) {
        let q = (sTip - (px * ux + py * uy)) * inv2z;
        q = q < 0 ? 0 : q > 1 ? 1 : q;
        m *= q * q * (3 - 2 * q);
      }
      FX = x + ux * m; FY = y + uy * m;
    };
  }
  if (op.type === 'vortex') {
    const [cx, cy] = op.c, R = op.R, z = op.z * k, L = op.L;
    return (x, y) => {
      const dx = x - cx, dy = y - cy, r = Math.sqrt(dx * dx + dy * dy);
      const th = z * Math.exp(-Math.abs(r - R) / L) / Math.max(r, 1);
      const c = Math.cos(th), s = Math.sin(th);
      FX = cx + dx * c - dy * s; FY = cy + dx * s + dy * c;
    };
  }
  throw new Error('unknown op ' + op.type);
}

// growable output buffer reused across calls
let OUT = new Float64Array(1 << 16), N = 0;
function push(x, y) {
  if (N + 2 > OUT.length) { const b = new Float64Array(OUT.length * 2); b.set(OUT); OUT = b; }
  OUT[N++] = x; OUT[N++] = y;
}
const MAX2 = MAXLEN * MAXLEN, MIN2 = MINLEN * MINLEN;
function split(f, ax, ay, bx, by, Ax, Ay, Bx, By, depth) {
  const dx = Bx - Ax, dy = By - Ay;
  if (dx * dx + dy * dy <= MAX2 || depth > 11) return;
  const mx = (ax + bx) * 0.5, my = (ay + by) * 0.5;
  f(mx, my);
  const Mx = FX, My = FY;
  split(f, ax, ay, mx, my, Ax, Ay, Mx, My, depth + 1);
  push(Mx, My);
  split(f, mx, my, bx, by, Mx, My, Bx, By, depth + 1);
}

/** map one closed polygon (Float32Array x,y,…) through f, refine long image edges, thin out crowded points */
export function mapPoly(src, f) {
  const n = src.length >> 1;
  const img = new Float64Array(n * 2);
  for (let i = 0; i < n; i++) { f(src[2 * i], src[2 * i + 1]); img[2 * i] = FX; img[2 * i + 1] = FY; }
  N = 0;
  for (let i = 0; i < n; i++) {
    const j = i + 1 === n ? 0 : i + 1;
    push(img[2 * i], img[2 * i + 1]);
    split(f, src[2 * i], src[2 * i + 1], src[2 * j], src[2 * j + 1], img[2 * i], img[2 * i + 1], img[2 * j], img[2 * j + 1], 0);
  }
  // thin: keep a point only if it is at least MINLEN from the last kept one
  const out = new Float32Array(N);
  let m = 0, lx = OUT[0], ly = OUT[1];
  out[m++] = lx; out[m++] = ly;
  for (let i = 2; i < N; i += 2) {
    const dx = OUT[i] - lx, dy = OUT[i + 1] - ly;
    if (dx * dx + dy * dy >= MIN2) { lx = OUT[i]; ly = OUT[i + 1]; out[m++] = lx; out[m++] = ly; }
  }
  return m === N ? out : out.slice(0, m);
}

export function circle(cx, cy, r) {
  const n = Math.max(48, Math.ceil(2 * Math.PI * r / (MAXLEN * 0.8)));
  const a = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; a[2 * i] = cx + r * Math.cos(t); a[2 * i + 1] = cy + r * Math.sin(t); }
  return a;
}

/** films after applying op (at progress k) to the films `prev` ({ pts, col }[]) */
export function applyOp(prev, op, k) {
  const f = makeMap(op, k);
  const next = prev.map((p) => ({ pts: mapPoly(p.pts, f), col: p.col }));
  if (op.type === 'drop' && k > 0) next.push({ pts: circle(op.c[0], op.c[1], op.r * Math.sqrt(k)), col: op.col });
  return next;
}
