/*
 * rig.js — the generic part of the character: a 2D bone hierarchy, triangle meshes cut from outlines and
 * skinned to it (linear-blend skinning), two IK solvers and a baked secondary-motion chain.
 * Nothing here knows about the child or the story; main.js defines both.
 *
 *  · skeleton   bones with a bind pose (x, y, angle) in character space; place() builds a bone's world origin
 *               from its parent's world transform (forward kinematics), the angle comes from FK or IK.
 *  · skin       S_i = W_i(t) · W_i(bind)⁻¹ per bone; a vertex is (1−w)·S_a·v + w·S_b·v (two influences).
 *  · mesh       outline → boundary resampled + inset rings + hex grid → Delaunator → triangles inside the
 *               outline. Per vertex: outward normal (for the outline pass) and a bevel normal (paper relief).
 *  · fabrik()   FABRIK (Aristidou & Lasenby 2011) with per-joint angle limits applied in the backward pass.
 *  · twoBone()  analytic two-bone IK (law of cosines) for the legs.
 *  · bakeChain  Verlet rope with distance + bending constraints, pinned to a moving frame, stepped at fixed dt.
 */
import Delaunator from 'delaunator';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
export const wrapPi = (a) => a - 2 * Math.PI * Math.floor((a + Math.PI) / (2 * Math.PI));

// ------------------------------------------------------------------ skeleton
/** defs: [name, parentName|null, bindX, bindY, bindAngle, length] */
export function makeSkeleton(defs) {
  const n = defs.length, idx = {};
  defs.forEach((d, i) => { idx[d[0]] = i; });
  const parent = new Int16Array(n), bx = new Float64Array(n), by = new Float64Array(n), ba = new Float64Array(n);
  const len = new Float64Array(n), lox = new Float64Array(n), loy = new Float64Array(n);
  defs.forEach(([, par, x, y, a, l], i) => { parent[i] = par == null ? -1 : idx[par]; bx[i] = x; by[i] = y; ba[i] = a; len[i] = l; });
  for (let i = 0; i < n; i++) {           // each bone's origin in its parent's bind frame: R(−a_p)·(o − o_p)
    const p = parent[i];
    if (p < 0) continue;
    const dx = bx[i] - bx[p], dy = by[i] - by[p], c = Math.cos(ba[p]), s = Math.sin(ba[p]);
    lox[i] = dx * c + dy * s; loy[i] = -dx * s + dy * c;
  }
  return { n, idx, names: defs.map((d) => d[0]), parent, bx, by, ba, len, lox, loy };
}
export function makePose(sk) {
  return { x: new Float64Array(sk.n), y: new Float64Array(sk.n), a: new Float64Array(sk.n), sx: new Float64Array(sk.n).fill(1), sy: new Float64Array(sk.n).fill(1) };
}
/** forward kinematics for one bone: origin from the parent's world transform, world angle given */
export function place(sk, P, i, a) {
  const p = sk.parent[i], c = Math.cos(P.a[p]), s = Math.sin(P.a[p]);
  P.x[i] = P.x[p] + sk.lox[i] * c - sk.loy[i] * s;
  P.y[i] = P.y[p] + sk.lox[i] * s + sk.loy[i] * c;
  P.a[i] = a;
}
/** a point d along bone i (its end by default) */
export const along = (sk, P, i, d = sk.len[i]) => [P.x[i] + Math.cos(P.a[i]) * d, P.y[i] + Math.sin(P.a[i]) * d];
/** a point given in bone i's bind frame, carried to the current pose */
export function carry(sk, P, i, x, y) {
  const c0 = Math.cos(sk.ba[i]), s0 = Math.sin(sk.ba[i]);
  const lx = (x - sk.bx[i]) * c0 + (y - sk.by[i]) * s0, ly = -(x - sk.bx[i]) * s0 + (y - sk.by[i]) * c0;
  const c = Math.cos(P.a[i]), s = Math.sin(P.a[i]);
  return [P.x[i] + lx * P.sx[i] * c - ly * P.sy[i] * s, P.y[i] + lx * P.sx[i] * s + ly * P.sy[i] * c];
}

/** skin matrices S = W(t)·W(bind)⁻¹ packed as 2 vec4 per bone: (a, b, c, d) = columns of the 2×2, (tx, ty, 0, 0) */
export function skinMatrices(sk, P, out) {
  for (let i = 0; i < sk.n; i++) {
    const ca = Math.cos(P.a[i]), sa = Math.sin(P.a[i]), cb = Math.cos(-sk.ba[i]), sb = Math.sin(-sk.ba[i]);
    const m00 = ca * P.sx[i], m01 = -sa * P.sy[i], m10 = sa * P.sx[i], m11 = ca * P.sy[i];   // R(a)·S
    const a = m00 * cb + m01 * sb, c = -m00 * sb + m01 * cb;                                    // ·R(−a_bind)
    const b = m10 * cb + m11 * sb, d = -m10 * sb + m11 * cb;
    const o = i * 8;
    out[o] = a; out[o + 1] = b; out[o + 2] = c; out[o + 3] = d;
    out[o + 4] = P.x[i] - (a * sk.bx[i] + c * sk.by[i]);
    out[o + 5] = P.y[i] - (b * sk.bx[i] + d * sk.by[i]);
    out[o + 6] = 0; out[o + 7] = 0;
  }
}

// ------------------------------------------------------------------ IK
/**
 * FABRIK on a planar chain. J = joints [x0,y0, x1,y1, …, xn,yn] (n bones), root J0 stays put.
 * lo/hi: allowed angle of bone i relative to bone i−1 (bone 0 relative to `base`), enforced in the
 * backward (root → tip) pass, so every returned pose satisfies the limits. ghosts: arrays that receive
 * the chain after iterations 1, 2, … (for drawing the solver at work). Returns the iterations used.
 */
export function fabrik(J, lens, lo, hi, base, tx, ty, { iters = 24, tol = 0.05, ghosts = null } = {}) {
  const n = lens.length, rx = J[0], ry = J[1];
  const miss = () => Math.hypot(J[2 * n] - tx, J[2 * n + 1] - ty);
  if (ghosts) for (const g of ghosts) g.set(J);
  if (miss() < tol) return 0;
  let it = 0;
  while (it < iters) {
    // forward reaching: put the tip on the target and drag each joint back along its bone
    J[2 * n] = tx; J[2 * n + 1] = ty;
    for (let i = n - 1; i >= 0; i--) {
      const dx = J[2 * i] - J[2 * i + 2], dy = J[2 * i + 1] - J[2 * i + 3], d = Math.hypot(dx, dy) || 1e-9;
      J[2 * i] = J[2 * i + 2] + (dx / d) * lens[i];
      J[2 * i + 1] = J[2 * i + 3] + (dy / d) * lens[i];
    }
    // backward reaching: root back home, each bone re-laid from its parent, its angle clamped to the joint's range
    J[0] = rx; J[1] = ry;
    let pa = base;
    for (let i = 0; i < n; i++) {
      const a0 = Math.atan2(J[2 * i + 3] - J[2 * i + 1], J[2 * i + 2] - J[2 * i]);
      const mid = (lo[i] + hi[i]) / 2;
      const a = pa + clamp(mid + wrapPi(a0 - pa - mid), lo[i], hi[i]);   // the cut sits opposite the allowed arc
      J[2 * i + 2] = J[2 * i] + Math.cos(a) * lens[i];
      J[2 * i + 3] = J[2 * i + 1] + Math.sin(a) * lens[i];
      pa = a;
    }
    if (ghosts && it < ghosts.length) for (let g = it; g < ghosts.length; g++) ghosts[g].set(J);
    it++;
    if (miss() < tol) break;
  }
  return it;
}

/** analytic two-bone IK: hip (hx,hy) → ankle (ax,ay); side +1 bends the middle joint to the left of hip→ankle */
export function twoBone(hx, hy, ax, ay, l1, l2, side = 1) {
  const dx = ax - hx, dy = ay - hy, d0 = Math.hypot(dx, dy) || 1e-9;
  const d = clamp(d0, Math.abs(l1 - l2) + 1e-3, (l1 + l2) * 0.99995);
  const ux = dx / d0, uy = dy / d0;
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const kx = hx + ux * a + uy * h * side, ky = hy + uy * a - ux * h * side;
  return { kx, ky, a1: Math.atan2(ky - hy, kx - hx), a2: Math.atan2(ay - ky, ax - kx), reach: d0 / (l1 + l2) };
}

// ------------------------------------------------------------------ secondary motion
/**
 * A Verlet chain of n nodes hanging from a moving frame, baked at fixed dt from t0 to t1 and stored at `fps`
 * (frame f ↔ time f/fps, f ≥ 0). frameAt(t) → {x, y, a}: the world frame the chain hangs from; rest[i] = node i
 * in that frame. Node 0 is pinned; `root` pulls node 1 toward its rest place (the knot), `shape` pulls every node
 * toward its rest place (a springy tuft); `bend` keeps nodes i, i+2 at least bend·seg apart.
 * forces(t, i, x, y, vx, vy) → [ax, ay] (gravity, drag toward the wind…).
 */
export function bakeChain({ rest, frameAt, t0, t1, dt, fps, forces, root = 0, shape = 0, bend = 0, damp = 0.995, iters = 6 }) {
  const n = rest.length;
  const seg = [];
  for (let i = 0; i < n - 1; i++) seg.push(Math.hypot(rest[i + 1][0] - rest[i][0], rest[i + 1][1] - rest[i][1]));
  const X = new Float64Array(n), Y = new Float64Array(n), PX = new Float64Array(n), PY = new Float64Array(n);
  const RX = new Float64Array(n), RY = new Float64Array(n);
  const restAt = (t) => {
    const f = frameAt(t), c = Math.cos(f.a), s = Math.sin(f.a);
    for (let i = 0; i < n; i++) { RX[i] = f.x + rest[i][0] * c - rest[i][1] * s; RY[i] = f.y + rest[i][0] * s + rest[i][1] * c; }
  };
  restAt(t0);
  X.set(RX); Y.set(RY); PX.set(RX); PY.set(RY);
  const frames = Math.round(t1 * fps) + 1;
  const out = new Float32Array(frames * n * 2);
  const steps = Math.round((t1 - t0) / dt);
  const store = (t) => {
    const f = Math.round(t * fps);
    if (f < 0 || f >= frames || Math.abs(f / fps - t) > dt * 0.5) return;
    for (let i = 0; i < n; i++) { out[(f * n + i) * 2] = X[i]; out[(f * n + i) * 2 + 1] = Y[i]; }
  };
  store(t0);
  for (let s = 1; s <= steps; s++) {
    const t = t0 + s * dt;
    restAt(t);
    for (let i = 1; i < n; i++) {
      const vx = (X[i] - PX[i]) / dt, vy = (Y[i] - PY[i]) / dt;
      const [ax, ay] = forces(t, i, X[i], Y[i], vx, vy);
      const nx = X[i] + (X[i] - PX[i]) * damp + ax * dt * dt, ny = Y[i] + (Y[i] - PY[i]) * damp + ay * dt * dt;
      PX[i] = X[i]; PY[i] = Y[i]; X[i] = nx; Y[i] = ny;
    }
    X[0] = RX[0]; Y[0] = RY[0]; PX[0] = RX[0]; PY[0] = RY[0];
    if (root) { X[1] += (RX[1] - X[1]) * root; Y[1] += (RY[1] - Y[1]) * root; }
    if (shape) for (let i = 1; i < n; i++) { X[i] += (RX[i] - X[i]) * shape; Y[i] += (RY[i] - Y[i]) * shape; }
    for (let k = 0; k < iters; k++) {
      for (let i = 0; i < n - 1; i++) {
        const dx = X[i + 1] - X[i], dy = Y[i + 1] - Y[i], d = Math.hypot(dx, dy) || 1e-9, e = (d - seg[i]) / d;
        if (i === 0) { X[1] -= dx * e; Y[1] -= dy * e; }
        else { X[i] += dx * e * 0.5; Y[i] += dy * e * 0.5; X[i + 1] -= dx * e * 0.5; Y[i + 1] -= dy * e * 0.5; }
      }
      if (bend) for (let i = 0; i < n - 2; i++) {
        const dx = X[i + 2] - X[i], dy = Y[i + 2] - Y[i], d = Math.hypot(dx, dy) || 1e-9, m = bend * (seg[i] + seg[i + 1]) / 2;
        if (d >= m) continue;
        const e = (d - m) / d;
        if (i === 0) { X[2] -= dx * e; Y[2] -= dy * e; }
        else { X[i] += dx * e * 0.5; Y[i] += dy * e * 0.5; X[i + 2] -= dx * e * 0.5; Y[i + 2] -= dy * e * 0.5; }
      }
    }
    store(t);
  }
  return { n, fps, frames, data: out };
}
/** node positions of a baked chain at time t (linear between stored frames) → Float64Array 2n */
export function chainAt(ch, t, out) {
  const f = clamp(t * ch.fps, 0, ch.frames - 1), f0 = Math.floor(f), f1 = Math.min(ch.frames - 1, f0 + 1), k = f - f0;
  const o0 = f0 * ch.n * 2, o1 = f1 * ch.n * 2;
  for (let i = 0; i < ch.n * 2; i++) out[i] = ch.data[o0 + i] + (ch.data[o1 + i] - ch.data[o0 + i]) * k;
  return out;
}

// ------------------------------------------------------------------ meshing
const signedArea = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
function inside(P, x, y) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i], [xj, yj] = P[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function closest(P, x, y) {
  let best = Infinity, bx = 0, by = 0;
  for (let i = 0; i < P.length; i++) {
    const [ax, ay] = P[i], [cx, cy] = P[(i + 1) % P.length];
    const ex = cx - ax, ey = cy - ay, l2 = ex * ex + ey * ey || 1e-12;
    const u = clamp(((x - ax) * ex + (y - ay) * ey) / l2, 0, 1), px = ax + ex * u, py = ay + ey * u;
    const d = (x - px) * (x - px) + (y - py) * (y - py);
    if (d < best) { best = d; bx = px; by = py; }
  }
  return [Math.sqrt(best), bx, by];
}
/**
 * Triangulate one outline. step: boundary spacing, grid: interior spacing, bevel: relief radius (px).
 * Returns { pts: [x,y][], tris: index triples, onb: boundary flag, nrm: outward normal (boundary only), bev: relief normal xy }.
 */
export function meshOutline(poly, { step = 6, grid = 12, bevel = 12 } = {}) {
  let P = poly.slice();
  if (signedArea(P) < 0) P.reverse();     // positive area: outward normal of edge e is (e.y, −e.x)
  // boundary: keep every corner, split long edges
  const B = [];
  for (let i = 0; i < P.length; i++) {
    const [ax, ay] = P[i], [cx, cy] = P[(i + 1) % P.length];
    const m = Math.max(1, Math.ceil(Math.hypot(cx - ax, cy - ay) / step));
    for (let k = 0; k < m; k++) B.push([ax + ((cx - ax) * k) / m, ay + ((cy - ay) * k) / m]);
  }
  const nb = B.length;
  const nrm = [];
  for (let i = 0; i < nb; i++) {
    const p = B[(i - 1 + nb) % nb], q = B[(i + 1) % nb];
    const ex = q[0] - p[0], ey = q[1] - p[1], l = Math.hypot(ex, ey) || 1;
    nrm.push([ey / l, -ex / l]);
  }
  const pts = B.map((p) => p.slice()), onb = B.map(() => 1);
  // a coarse spatial hash keeps added points from crowding each other
  const cell = Math.max(2, Math.min(step, grid) * 0.5), hash = new Map();
  const key = (x, y) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`;
  const crowded = (x, y, r) => {
    const cx = Math.floor(x / cell), cy = Math.floor(y / cell), k = Math.ceil(r / cell);
    for (let i = -k; i <= k; i++) for (let j = -k; j <= k; j++) {
      const L = hash.get(`${cx + i},${cy + j}`);
      if (L) for (const q of L) if ((q[0] - x) ** 2 + (q[1] - y) ** 2 < r * r) return true;
    }
    return false;
  };
  const add = (x, y) => { pts.push([x, y]); onb.push(0); const k = key(x, y); if (!hash.has(k)) hash.set(k, []); hash.get(k).push([x, y]); };
  for (const p of B) { const k = key(p[0], p[1]); if (!hash.has(k)) hash.set(k, []); hash.get(k).push(p); }
  // inset rings carry the relief; then a hex grid fills the inside
  for (const f of [0.3, 0.65, 1.05]) {
    const d = Math.max(1.2, bevel * f);
    for (let i = 0; i < nb; i++) {
      const x = B[i][0] - nrm[i][0] * d, y = B[i][1] - nrm[i][1] * d;
      if (!inside(B, x, y)) continue;
      if (closest(B, x, y)[0] < d * 0.7) continue;
      if (crowded(x, y, Math.min(step, d) * 0.75)) continue;
      add(x, y);
    }
  }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of B) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const gh = grid * 0.866;
  for (let r = 0, y = y0 + gh * 0.5; y < y1; y += gh, r++) {
    for (let x = x0 + (r % 2 ? grid * 0.5 : 0); x < x1; x += grid) {
      if (!inside(B, x, y)) continue;
      if (closest(B, x, y)[0] < grid * 0.55) continue;
      if (crowded(x, y, grid * 0.6)) continue;
      add(x, y);
    }
  }
  // Delaunay, then keep only triangles that lie inside the outline (concave notches drop out)
  const del = Delaunator.from(pts);
  const tris = [];
  const ok = (i, j) => {
    if (onb[i] && onb[j] && i < nb && j < nb && (Math.abs(i - j) === 1 || Math.abs(i - j) === nb - 1)) return true;
    const mx = (pts[i][0] + pts[j][0]) / 2, my = (pts[i][1] + pts[j][1]) / 2;
    return inside(B, mx, my) || closest(B, mx, my)[0] < 0.25;
  };
  for (let t = 0; t < del.triangles.length; t += 3) {
    const a = del.triangles[t], b = del.triangles[t + 1], c = del.triangles[t + 2];
    const cx = (pts[a][0] + pts[b][0] + pts[c][0]) / 3, cy = (pts[a][1] + pts[b][1] + pts[c][1]) / 3;
    if (!inside(B, cx, cy)) continue;
    if (!ok(a, b) || !ok(b, c) || !ok(c, a)) continue;
    tris.push(a, b, c);
  }
  // relief: a rounded bevel of radius `bevel` along the edge, flat inside
  const bev = pts.map(([x, y], i) => {
    let ox, oy, d;
    if (onb[i]) { ox = nrm[i][0]; oy = nrm[i][1]; d = 0; }
    else { const [dd, cx, cy] = closest(B, x, y); d = dd; const l = dd || 1; ox = (cx - x) / l; oy = (cy - y) / l; }
    const m = d >= bevel ? 0 : 0.93 * (1 - d / bevel) ** 1.6;
    return [ox * m, oy * m];
  });
  return { pts, tris, onb, nrm: pts.map((_, i) => (i < nb ? nrm[i] : [0, 0])), bev };
}

// ------------------------------------------------------------------ outline helpers (bind space)
export function ellipse(cx, cy, rx, ry, n = 36, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot), out = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; out.push([cx + x * c - y * s, cy + x * s + y * c]); }
  return out;
}
export function polar(cx, cy, r, n = 64) {
  const out = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, rr = r(a); out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return out;
}
/** a vertical strip at x through rows [[y, halfWidth], …] (top → bottom), round cap on top, flat or round bottom */
export function vstrip(x, rows, { capTop = true, capBot = false, fringe = 0, fringeN = 5 } = {}) {
  const out = [], [y0, w0] = rows[0], [yn, wn] = rows[rows.length - 1];
  if (capTop) for (let k = 0; k <= 10; k++) { const a = Math.PI + (k / 10) * Math.PI; out.push([x + Math.cos(a) * w0, y0 + Math.sin(a) * w0]); }
  else { out.push([x - w0, y0]); out.push([x + w0, y0]); }
  for (let i = 1; i < rows.length - 1; i++) out.push([x + rows[i][1], rows[i][0]]);
  if (capBot) for (let k = 0; k <= 10; k++) { const a = (k / 10) * Math.PI; out.push([x + Math.cos(a) * wn, yn + Math.sin(a) * wn]); }
  else if (fringe) {
    for (let k = 0; k <= fringeN * 2; k++) out.push([x + wn - (2 * wn * k) / (fringeN * 2), yn + (k % 2 ? fringe : 0)]);
  } else { out.push([x + wn, yn]); out.push([x - wn, yn]); }
  for (let i = rows.length - 2; i >= 1; i--) out.push([x - rows[i][1], rows[i][0]]);
  return out;
}
