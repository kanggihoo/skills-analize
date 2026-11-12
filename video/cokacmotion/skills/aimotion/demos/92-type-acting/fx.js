/*
 * fx.js — channel-based type effects for Canvas 2D (the engine of demo 92).
 * Written for the stage.js contract:
 *
 *   units      text is split into units (Hangul syllables; or glyph outlines; or glass shards) with a rest place:
 *              box (bx, by, bw, bh), pivot (px, py), and per-unit hashes u.r(salt) from (group seed, index, salt)
 *   channels   every frame each unit starts from neutral —
 *                x y (px)  r (deg)  sx sy  kx (skew deg)  o (opacity ×)  blur (px)  w (font-weight delta)
 *                tint (→ accent colour)  light (→ highlight colour)  ripple (px of row shimmer)  melt (0…1)
 *   effects    fx(group | 'page', { from, to, fill }, (u, s, c) => { c.y += … }) add into the channels inside their
 *              window (s.t, s.lt = seconds since from, s.p, s.dur). 'page' effects reach every unit of every group,
 *              so effects on one word compose with effects that pass through the whole poem.
 *   write      one write per unit: write(ctx, u, c, t) turns the summed channels into one draw
 *              (fillText / strip-shifted raster / deformed outline / clipped shard), plus optional motion-blur ghosts.
 *
 * Everything is a pure function of t: no state carries between frames, physics is closed form.
 */

export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
const smoother = (k) => { k = clamp(k); return k * k * k * (k * (k * 6 - 15) + 10); };

/** integer hash of up to three ints → [0, 1) */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(a | 0, 0x9e3779b1) ^ Math.imul((b | 0) + 0x632be5ab, 0x85ebca6b) ^ Math.imul((c | 0) + 0x5bd1e995, 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** smooth value noise in 1–3D → [-1, 1] */
export function noise(x, y = 0, z = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const u = smoother(x - xi), v = smoother(y - yi), w = smoother(z - zi);
  const g = (i, j, k) => hash(xi + i, yi + j, zi + k) * 2 - 1;
  const x00 = lerp(g(0, 0, 0), g(1, 0, 0), u), x10 = lerp(g(0, 1, 0), g(1, 1, 0), u);
  const x01 = lerp(g(0, 0, 1), g(1, 0, 1), u), x11 = lerp(g(0, 1, 1), g(1, 1, 1), u);
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w);
}

// ---------- closed-form motion ----------
/** impulse response: 0 at t = 0, swings ±1 and dies out (a hit, a jiggle) */
export const wobble = (t, freq = 3, decay = 5) => (t <= 0 ? 0 : Math.exp(-decay * t) * Math.sin(TAU * freq * t));
/** step response: 0 → 1 with overshoot (a spring settling) */
export const spring = (t, freq = 1.6, decay = 6) => (t <= 0 ? 0 : 1 - Math.exp(-decay * t) * Math.cos(TAU * freq * t));
/** displacement after t seconds at speed v with drag k (1/s) — the exact integral, no stepping */
export const drift = (t, v, k = 0) => (t <= 0 ? 0 : k ? (v * (1 - Math.exp(-k * t))) / k : v * t);
/** one smooth swell 0 → 1 → 0 over [0, len] */
export const hump = (t, len) => (t <= 0 || t >= len ? 0 : Math.sin((Math.PI * t) / len) ** 2);
/** height above the floor of something dropped from h (gravity g, restitution e, at most n bounces) */
export function bounce(t, h, g = 2400, e = 0.42, n = 4) {
  if (t <= 0) return h;
  const t0 = Math.sqrt((2 * h) / g);
  if (t < t0) return h - 0.5 * g * t * t;
  let v = g * t0 * e, tt = t - t0;
  for (let i = 0; i < n; i++) {
    const d = (2 * v) / g;
    if (tt < d) return v * tt - 0.5 * g * tt * tt;
    tt -= d; v *= e;
  }
  return 0;
}
export const landTime = (h, g) => Math.sqrt((2 * h) / g);

// ---------- channels ----------
export function channels() {
  return { x: 0, y: 0, r: 0, sx: 1, sy: 1, kx: 0, o: 1, blur: 0, w: 0, tint: 0, light: 0, ripple: 0, melt: 0 };
}
function reset(c) {
  c.x = c.y = c.r = c.kx = c.blur = c.w = c.tint = c.light = c.ripple = c.melt = 0;
  c.sx = c.sy = c.o = 1;
}

// ---------- groups, effects, evaluation ----------
export function createFX() {
  const groups = [], page = [];
  let seedN = 101;

  /** finish a group: box, centre, per-unit index / hashes / offsets from the group centre */
  function group(name, units, o = {}) {
    const G = { name, units, effects: [], seed: o.seed ?? (seedN += 7919), ghosts: o.ghosts || null };
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const u of units) { x0 = Math.min(x0, u.bx); y0 = Math.min(y0, u.by); x1 = Math.max(x1, u.bx + u.bw); y1 = Math.max(y1, u.by + u.bh); }
    Object.assign(G, { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 });
    units.forEach((u, i) => {
      u.G = G; u.i = i; u.n = units.length; u.k = units.length > 1 ? i / (units.length - 1) : 0;
      u.gx = u.px - G.cx; u.gy = u.py - G.cy;
      u.r = (salt = 0) => hash(G.seed + i * 31, salt, 977);
    });
    groups.push(G);
    return G;
  }

  /**
   * add an effect. fill: 'none' (only inside [from, to]) | 'forwards' (hold the end) | 'backwards' (hold the start
   * before from) | 'both'. fn(u, s, c) adds into c. G = 'page' → every unit of every group.
   */
  function fx(G, o, fn) {
    const e = { fn, from: o.from ?? 0, to: o.to ?? o.from ?? 0, fill: o.fill || 'none', s: {} };
    e.back = e.fill === 'both' || e.fill === 'backwards';
    e.fwd = e.fill === 'both' || e.fill === 'forwards';
    (G === 'page' ? page : G.effects).push(e);
    return e;
  }
  function local(e, t) {
    let lt;
    if (t < e.from) { if (!e.back) return null; lt = 0; }
    else if (t > e.to) { if (!e.fwd) return null; lt = e.to - e.from; }
    else lt = t - e.from;
    const s = e.s, dur = e.to - e.from;
    s.t = t; s.lt = lt; s.dur = dur; s.p = dur > 0 ? lt / dur : 1;
    return s;
  }
  /** neutral channels, then every effect of the unit's group and of the page adds in */
  function evalUnit(u, t, c) {
    reset(c);
    for (const e of u.G.effects) { const s = local(e, t); if (s) e.fn(u, s, c); }
    for (const e of page) { const s = local(e, t); if (s) e.fn(u, s, c); }
    return c;
  }
  /** stagger orders 0…1 per unit: 'index' | 'reverse' | 'x' | 'y' | [x, y] (distance from a stage point) | fn(u) */
  function order(G, mode = 'index') {
    const U = G.units;
    let v;
    if (typeof mode === 'function') v = U.map(mode);
    else if (Array.isArray(mode)) v = U.map((u) => Math.hypot(u.px - mode[0], u.py - mode[1]));
    else if (mode === 'reverse') v = U.map((u) => -u.i);
    else if (mode === 'x') v = U.map((u) => u.px);
    else if (mode === 'y') v = U.map((u) => u.py);
    else v = U.map((u) => u.i);
    let lo = Infinity, hi = -Infinity;
    for (const x of v) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
    return v.map((x) => (hi > lo ? (x - lo) / (hi - lo) : 0));
  }
  return { groups, page, group, fx, evalUnit, order };
}

// ---------- writers: summed channels → one draw per unit ----------
/**
 * P = { accent: [r,g,b], light: [r,g,b] }. Units carry kind ('text' | 'outline' | 'shard'), colour [r,g,b],
 * and for text: ch, family, size, weight, ox/oy (glyph origin relative to the pivot).
 */
export function makeWriter(P, opts = {}) {
  const scratch = document.createElement('canvas');
  scratch.width = 640; scratch.height = 640;
  const sctx = scratch.getContext('2d', opts.attrs);
  const OUT = [0, 0];
  const rippleRow = opts.rippleRow || ((y, t) => Math.sin(TAU * (y / 34 - t * 1.7)) + 0.4 * noise(y * 0.045, t * 2.2, 5));

  function colorOf(u, c) {
    let [r, g, b] = u.color;
    const k = clamp(c.tint);
    if (k > 0) { r = lerp(r, P.accent[0], k); g = lerp(g, P.accent[1], k); b = lerp(b, P.accent[2], k); }
    const l = clamp(c.light);
    if (l > 0) { r = lerp(r, P.light[0], l); g = lerp(g, P.light[1], l); b = lerp(b, P.light[2], l); }
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }
  const fontOf = (u, c) => `${Math.round(clamp(u.weight + (c ? c.w : 0), 100, 900))} ${u.size}px "${u.family}"`;
  function place(ctx, u, c) {
    ctx.translate(u.px + c.x, u.py + c.y);
    if (c.r) ctx.rotate(c.r * DEG);
    if (c.kx) ctx.transform(1, 0, Math.tan(c.kx * DEG), 1, 0, 0);
    if (c.sx !== 1 || c.sy !== 1) ctx.scale(c.sx || 1e-4, c.sy || 1e-4);
  }

  function writeText(ctx, u, c) {
    ctx.save();
    place(ctx, u, c);
    ctx.font = fontOf(u, c);
    ctx.fillStyle = colorOf(u, c);
    if (c.blur > 0.35) ctx.filter = `blur(${c.blur.toFixed(1)}px)`;
    ctx.fillText(u.ch, u.ox, u.oy);
    ctx.restore();
  }
  // heat shimmer: the unit is drawn once into a scratch canvas, then copied in 2 px rows, each row shifted sideways
  function writeRipple(ctx, u, c, t) {
    const m = 30 + Math.abs(c.ripple);
    const sw = Math.min(640, Math.ceil(u.bw * Math.max(1, c.sx) * 1.25 + 2 * m)), sh = Math.min(640, Math.ceil(u.bh * Math.max(1, c.sy) * 1.25 + 2 * m));
    const hx = Math.round(sw / 2), hy = Math.round(sh / 2);
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.clearRect(0, 0, sw, sh);
    sctx.translate(hx, hy);
    if (c.r) sctx.rotate(c.r * DEG);
    if (c.kx) sctx.transform(1, 0, Math.tan(c.kx * DEG), 1, 0, 0);
    sctx.scale(c.sx, c.sy);
    sctx.font = fontOf(u, c);
    sctx.fillStyle = colorOf(u, c);
    sctx.fillText(u.ch, u.ox, u.oy);
    const dx = Math.round(u.px + c.x) - hx, dy = Math.round(u.py + c.y) - hy;
    for (let y = 0; y < sh; y += 2) {
      const off = c.ripple * rippleRow(dy + y, t);
      ctx.drawImage(scratch, 0, y, sw, 2, dx + off, dy + y, sw, 2);
    }
  }
  // glyph outline: points bent by the unit's deformer (melt), then the whole unit placed by its channels
  function writeOutline(ctx, u, c, t) {
    ctx.save();
    place(ctx, u, c);
    ctx.translate(-u.px, -u.py);
    ctx.fillStyle = colorOf(u, c);
    if (c.blur > 0.35) ctx.filter = `blur(${c.blur.toFixed(1)}px)`;
    const k = c.melt, def = k > 1e-4 ? u.deform : null;
    ctx.beginPath();
    for (const C of u.contours) {
      const P = C.pts, N = C.nrm;
      for (let i = 0; i < P.length; i += 2) {
        let x = P[i], y = P[i + 1];
        if (def) { def(x, y, N[i], N[i + 1], k, t, OUT); x += OUT[0]; y += OUT[1]; }
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
    }
    ctx.fill('nonzero');
    ctx.restore();
  }
  // glass shard: the parent syllable, clipped to a Voronoi cell, placed around the cell's centroid
  function writeShard(ctx, u, c) {
    const p = u.parent;
    ctx.save();
    place(ctx, u, c);
    ctx.translate(-u.px, -u.py);
    ctx.beginPath();
    const Q = u.poly;
    ctx.moveTo(Q[0], Q[1]);
    for (let i = 2; i < Q.length; i += 2) ctx.lineTo(Q[i], Q[i + 1]);
    ctx.clip();
    ctx.font = fontOf(p, null);
    ctx.fillStyle = colorOf(p, c);
    ctx.fillText(p.ch, p.px + p.ox, p.py + p.oy);
    ctx.restore();
  }

  function write(ctx, u, c, t) {
    const o = clamp(c.o);
    if (o < 0.004) return;
    const a0 = ctx.globalAlpha;
    ctx.globalAlpha = a0 * o;
    if (u.kind === 'shard') writeShard(ctx, u, c);
    else if (u.kind === 'outline') writeOutline(ctx, u, c, t);
    else if (Math.abs(c.ripple) > 0.05) writeRipple(ctx, u, c, t);
    else writeText(ctx, u, c);
    ctx.globalAlpha = a0;
  }
  return { write, colorOf, fontOf };
}

/**
 * Draw every unit of the given groups: evaluate, then one write. Groups with ghosts = { n, shutter, alpha, thr }
 * also draw n earlier samples (t − shutter·k/n) behind the unit — motion blur that only shows when the unit moves.
 */
export function drawGroups(ctx, FX, writer, groups, t) {
  const C = drawGroups.C || (drawGroups.C = channels()), C2 = drawGroups.C2 || (drawGroups.C2 = channels());
  for (const G of groups) {
    const gh = G.ghosts;
    for (const u of G.units) {
      FX.evalUnit(u, t, C);
      if (gh && C.o > 0.01) {
        for (let k = gh.n; k >= 1; k--) {
          FX.evalUnit(u, t - (gh.shutter * k) / gh.n, C2);
          const d = Math.hypot(C2.x - C.x, C2.y - C.y) + Math.abs(C2.r - C.r) * Math.max(u.bw, u.bh) * 0.01;
          C2.o *= gh.alpha * (1 - k / (gh.n + 1)) * clamp((d - gh.thr) / (gh.thr * 4 + 1));
          writer.write(ctx, u, C2, t);
        }
      }
      writer.write(ctx, u, C, t);
    }
  }
}

// ---------- geometry helpers ----------
/** Voronoi cells of pts inside [x0, y0, x1, y1] (half-plane clipping; fine for a few dozen cells) → [[x, y]…][] */
export function voronoi(pts, [x0, y0, x1, y1]) {
  return pts.map((p, i) => {
    let poly = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let j = 0; j < pts.length && poly.length; j++) {
      if (j === i) continue;
      const q = pts[j], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, nx = q[0] - p[0], ny = q[1] - p[1];
      const side = (v) => (v[0] - mx) * nx + (v[1] - my) * ny;
      const out = [];
      for (let k = 0; k < poly.length; k++) {
        const a = poly[k], b = poly[(k + 1) % poly.length], sa = side(a), sb = side(b);
        if (sa <= 0) out.push(a);
        if ((sa <= 0) !== (sb <= 0)) { const tt = sa / (sa - sb); out.push([a[0] + (b[0] - a[0]) * tt, a[1] + (b[1] - a[1]) * tt]); }
      }
      poly = out;
    }
    return poly;
  }).filter((P) => P.length >= 3);
}
export function centroid(P) {
  let a = 0, x = 0, y = 0;
  for (let i = 0; i < P.length; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[(i + 1) % P.length], k = x0 * y1 - x1 * y0;
    a += k; x += (x0 + x1) * k; y += (y0 + y1) * k;
  }
  if (Math.abs(a) < 1e-6) return [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  return [x / (3 * a), y / (3 * a)];
}
/**
 * closed polyline → evenly subdivided (≤ maxSeg px) points + the ink-outward normal at each point.
 * With nonzero winding the ink lies on the same side of travel for outer contours and holes alike,
 * so one rule (−ty, tx) gives "away from ink" everywhere; `flip` corrects a font with the opposite convention.
 */
export function resampleContour(src, maxSeg = 3, flip = 1) {
  const out = [];
  const n = src.length / 2;
  for (let i = 0; i < n; i++) {
    const ax = src[2 * i], ay = src[2 * i + 1], j = (i + 1) % n, bx = src[2 * j], by = src[2 * j + 1];
    const m = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / maxSeg));
    for (let k = 0; k < m; k++) out.push(ax + ((bx - ax) * k) / m, ay + ((by - ay) * k) / m);
  }
  const pts = Float32Array.from(out), N = pts.length / 2, nrm = new Float32Array(pts.length);
  for (let i = 0; i < N; i++) {
    const a = (i - 2 + N) % N, b = (i + 2) % N;
    const tx = pts[2 * b] - pts[2 * a], ty = pts[2 * b + 1] - pts[2 * a + 1], L = Math.hypot(tx, ty) || 1;
    nrm[2 * i] = (flip * -ty) / L; nrm[2 * i + 1] = (flip * tx) / L;
  }
  return { pts, nrm };
}
