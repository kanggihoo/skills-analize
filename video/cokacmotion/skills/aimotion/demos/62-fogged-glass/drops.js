/*
 * drops.js — the water on the glass, baked once at 60 Hz with a seeded generator (Lucas Bebber's rain-on-glass
 * model, adapted to condensation):
 *   • condensation beads nucleate where the fog has formed (fog onset map, shared with the shader) and grow;
 *   • the finger pushes the condensate aside: beads line both edges of every stroke (bigger on the lower edge,
 *     a few heavy "runner" blobs at bottom edges and stroke ends); the finger also wipes any drop it passes over;
 *   • a drop heavier than the critical radius breaks free and slides down — accelerating with its excess weight,
 *     hesitating (stick–slip), meandering, shedding small residual drops (volume is conserved: r³), swallowing
 *     every drop in its path (r = ∛(r₁³ + r₂³)) and leaving a clear trail; below a minimum size it sticks again.
 * Output: per drop a birth frame and x/y/r for every frame it lives, plus the trail segments with their times.
 * frame(t) reads these tables only, so the water is a pure function of t.
 */
import { rand } from '../_lib/stage.js';

export const SIM_FPS = 60;

/** seeded value noise (bilinear lattice, smoothstep), a few octaves */
export function makeNoise(seed) {
  const r = rand(seed), N = 256, perm = new Uint8Array(N * 2), val = new Float32Array(N);
  for (let i = 0; i < N; i++) { perm[i] = i; val[i] = r(); }
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < N; i++) perm[N + i] = perm[i];
  const lat = (x, y) => val[perm[(perm[x & 255] + y) & 511]];
  const v2 = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = lat(xi, yi), b = lat(xi + 1, yi), c = lat(xi, yi + 1), d = lat(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const fbm = (x, y, oct = 4) => { let s = 0, a = 0.5, n = 0; for (let i = 0; i < oct; i++) { s += a * v2(x, y); n += a; x = x * 2.03 + 17.1; y = y * 2.03 + 5.3; a *= 0.5; } return s / n; };
  return { v2, fbm, v1: (x) => v2(x, 0.37) };
}

/**
 * The fog onset map: 0..1 (× ONSET_T s = when condensation reaches this spot), earliest along the frame and
 * the bottom (cold air pools there), with noise. Packed with two more noise fields into an RGBA8 grid for the GPU.
 */
export const ONSET_T = 1.2, ONSET_RISE = 0.85;
export function fogMaps(W, H, seed) {
  const nz = makeNoise(seed);
  const gw = 135, gh = 240, sx = W / gw, sy = H / gh;
  const onset = new Float32Array(gw * gh), rgba = new Uint8Array(gw * gh * 4);
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
    const x = (i + 0.5) * sx, y = (j + 0.5) * sy;
    const ex = Math.min(x, W - x) / (W / 2), et = y / (H * 0.5) * 1.3, eb = (H - y) / (H * 0.5) * 0.8;
    const edge = Math.min(1, Math.max(0, Math.min(ex, et, eb)));
    const o = Math.min(1, Math.max(0, 0.08 + 0.78 * Math.pow(edge, 0.8) + 0.56 * (nz.fbm(x / 260, y / 260) - 0.5)));
    onset[j * gw + i] = o;
    const k = (j * gw + i) * 4;
    rgba[k] = Math.round(o * 255);
    rgba[k + 1] = Math.round(nz.fbm(x / 150 + 40, y / 150) * 255);      // fog thickness variation
    rgba[k + 2] = Math.round(nz.fbm(x / 70 + 90, y / 70 + 7) * 255);      // refog / film variation
    rgba[k + 3] = 255;
  }
  const onsetAt = (x, y) => {
    const fx = Math.min(gw - 1.001, Math.max(0, x / sx - 0.5)), fy = Math.min(gh - 1.001, Math.max(0, y / sy - 0.5));
    const i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j;
    const a = onset[j * gw + i], b = onset[j * gw + i + 1], c = onset[(j + 1) * gw + i], d = onset[(j + 1) * gw + i + 1];
    return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * ONSET_T;
  };
  return { gw, gh, rgba, onsetAt };
}

const sstep = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };

/**
 * samples: finger samples { x, y, t, r, stroke, word } (from timeStrokes); onsetAt(x, y) → s.
 * Returns { drops: [{ f0, n, xyr: Float32Array(3n), group }], trails: Float32Array(8 per segment), stats }.
 */
export function simulateDrops({ samples, onsetAt, W, H, D, seed = 6201, rCrit = 9 }) {
  const R = rand(seed), nz = makeNoise(seed + 7);
  const spawns = [];
  const add = (o) => spawns.push(Object.assign({ stick: 1 + 0.3 * R(), group: 2 }, o));

  // ---- beads along both edges of every stroke, and heavy blobs that will run
  const byStroke = new Map();
  for (const s of samples) { if (!byStroke.has(s.stroke)) byStroke.set(s.stroke, []); byStroke.get(s.stroke).push(s); }
  const runnerCand = [];
  for (const list of byStroke.values()) {
    let acc = 0, next = 4 + 6 * R();
    for (let i = 1; i < list.length; i++) {
      const a = list[i - 1], b = list[i];
      const L = Math.hypot(b.x - a.x, b.y - a.y);
      if (L < 1e-3) continue;
      const tx = (b.x - a.x) / L, ty = (b.y - a.y) / L;
      acc += L;
      while (acc >= next) {
        const f = 1 - (acc - next) / L;
        const x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f, t = a.t + (b.t - a.t) * f, rf = a.r + (b.r - a.r) * f;
        for (const sg of [-1, 1]) {
          if (R() > 0.8) continue;
          const nx = -ty * sg, ny = tx * sg, down = Math.max(0, ny);
          const rT = 1.0 + 2.2 * Math.pow(R(), 1.7) + 2.8 * down * R();
          const off = rf + 1.0 + rT * 0.7 + 2.5 * R();
          add({ t: t + 0.05 + 0.3 * R(), x: x + nx * off, y: y + ny * off, rT, tg: 0.5 + 1.3 * R(), group: b.word });
          if (down > 0.8) runnerCand.push({ x: x + nx * (rf + 4), y: y + ny * (rf + 4), t, word: b.word });
        }
        next += 8 + 8 * R();
      }
    }
    const e = list[list.length - 1], p = list[Math.max(0, list.length - 4)];
    const L = Math.hypot(e.x - p.x, e.y - p.y) || 1;
    runnerCand.push({ x: e.x + (e.x - p.x) / L * (e.r * 0.8), y: e.y + (e.y - p.y) / L * (e.r * 0.8) + e.r * 0.4, t: e.t, word: e.word, end: true });
  }
  // pick runner blobs: spread apart, both words, a few stroke ends
  const runners = [];
  for (let tries = 0; tries < 400 && runners.length < 15 && runnerCand.length; tries++) {
    const c = runnerCand[Math.floor(R() * runnerCand.length)];
    if (runners.some((q) => Math.hypot(q.x - c.x, q.y - c.y) < 75)) continue;
    runners.push(c);
  }
  for (const c of runners) {
    add({ t: c.t + 0.08, x: c.x, y: c.y + 3, rT: rCrit * (1.1 + 0.42 * R()), tg: 1.0 + 1.8 * R(), stick: 1.0, group: 2 });
  }

  // ---- condensation beads over the glass (none inside a stroke that was already wiped when they form)
  const fingerGrid = new Map(), FG = 40;
  for (const s of samples) {
    const k = `${Math.floor(s.x / FG)},${Math.floor(s.y / FG)}`;
    if (!fingerGrid.has(k)) fingerGrid.set(k, []);
    fingerGrid.get(k).push(s);
  }
  const wipedBefore = (x, y, t, pad) => {
    const gx = Math.floor(x / FG), gy = Math.floor(y / FG);
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const L = fingerGrid.get(`${gx + i},${gy + j}`);
      if (L) for (const s of L) if (s.t < t && Math.hypot(s.x - x, s.y - y) < s.r + pad) return true;
    }
    return false;
  };
  for (let i = 0; i < 1300; i++) {
    const x = R() * W, y = R() * H;
    const t = onsetAt(x, y) + 0.25 + 1.2 * R();
    const low = sstep(1450, 1900, y);
    const rT = 0.65 + 1.9 * Math.pow(R(), 2.4) + 2.6 * low * R();
    if (wipedBefore(x, y, t, rT + 1)) continue;
    add({ t, x, y, rT, tg: 0.8 + 1.8 * R(), stick: 1.2 + 0.3 * R() });
  }
  for (let i = 0; i < 7; i++) {      // a few heavier drops already sitting low on the glass
    const x = 60 + R() * (W - 120), y = 1350 + R() * 480;
    add({ t: onsetAt(x, y) + 0.3 + R(), x, y, rT: 4.5 + 3 * R(), tg: 1.5 + R(), stick: 1.4 });
  }
  spawns.sort((a, b) => a.t - b.t);

  // ---- the simulation
  const N = Math.round(D * SIM_FPS), dt = 1 / SIM_FPS;
  const drops = [], alive = [];
  const fingerByFrame = samples.slice().sort((a, b) => a.t - b.t);
  let si = 0, fi = 0, trailPts = [];
  const trails = [];
  const kill = (d, k) => { d.dead = true; d.f1 = k; };
  const CELL = 32;
  for (let k = 0; k <= N; k++) {
    const t = k * dt;
    while (si < spawns.length && spawns[si].t <= t) {
      const s = spawns[si++];
      const d = { ...s, id: drops.length, f0: k, r: 0, tb: s.t, sliding: false, v: 0, travel: 0, grow: true, xs: [], ys: [], rs: [] };
      drops.push(d); alive.push(d);
    }
    // the finger wipes what it passes over
    while (fi < fingerByFrame.length && fingerByFrame[fi].t <= t) {
      const s = fingerByFrame[fi++];
      for (const d of alive) if (!d.dead && d.tb < s.t && Math.hypot(d.x - s.x, d.y - s.y) < s.r + d.r * 0.3) kill(d, k);
    }
    // growth, break-away
    let sliders = 0;
    for (const d of alive) {
      if (d.dead) continue;
      if (d.grow) d.r = Math.max(d.r, d.rT * sstep(0, 1, (t - d.tb) / d.tg));
      if (!d.sliding && d.r > rCrit * d.stick) {
        d.sliding = true; d.grow = false; d.v = 20; d.nextRes = 6 + 10 * R(); d.trail = [[d.x, d.y, t, d.r * 0.85]]; d.tick = 0;
      }
      if (d.sliding) sliders++;
    }
    if (sliders) {
      const grid = new Map();
      for (const d of alive) {
        if (d.dead) continue;
        const key = `${Math.floor(d.x / CELL)},${Math.floor(d.y / CELL)}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(d);
      }
      for (const d of alive) {
        if (d.dead || !d.sliding) continue;
        const a = 1500 * (d.r / rCrit - 0.7);
        d.v = Math.min(560, Math.max(0, (d.v + a * dt) * 0.996));
        const hes = 0.28 + 0.72 * sstep(0.28, 0.6, nz.v1(d.travel * 0.017 + d.id * 3.7));
        const dy = d.v * hes * dt;
        d.x += (nz.v1(d.y * 0.009 + d.id * 1.31) - 0.5) * 0.5 * dy;
        d.y += dy; d.travel += dy;
        if (d.travel >= d.nextRes) {        // shed a residual drop behind it, out of its reach
          const rr = Math.max(0.9, d.r * (0.13 + 0.17 * R()));
          if (rr < d.r * 0.6) {
            const nd = { t, x: d.x + (R() - 0.5) * d.r * 0.5, y: d.y - (d.r + rr) * 0.95, rT: rr, tg: 1, stick: 9, group: 2, id: drops.length, f0: k, r: rr, tb: t, sliding: false, v: 0, travel: 0, grow: false, xs: [], ys: [], rs: [] };
            drops.push(nd); alive.push(nd);
            d.r = Math.cbrt(Math.max(0, d.r ** 3 - rr ** 3));
          }
          d.nextRes += 7 + 13 * R();
        }
        // swallow whatever lies in the path
        const gx = Math.floor(d.x / CELL), gy = Math.floor(d.y / CELL);
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
          const L = grid.get(`${gx + i},${gy + j}`);
          if (!L) continue;
          for (const o of L) {
            if (o === d || o.dead || o.f0 === k) continue;
            if (Math.hypot(o.x - d.x, o.y - d.y) < (d.r + o.r) * 0.8) {
              d.r = Math.cbrt(d.r ** 3 + o.r ** 3);
              kill(o, k);
            }
          }
        }
        if (++d.tick % 2 === 0) d.trail.push([d.x, d.y, t, d.r * 0.85]);
        if (d.r < rCrit * 0.62) { d.sliding = false; d.trail.push([d.x, d.y, t, d.r * 0.85]); trailPts.push(d.trail); d.trail = null; }
        if (d.y - d.r > H + 12) { kill(d, k); trailPts.push(d.trail); d.trail = null; }
      }
    }
    // record this frame
    for (const d of alive) {
      if (d.dead) continue;
      d.xs.push(d.x); d.ys.push(d.y); d.rs.push(d.r);
    }
    if (k % 30 === 0) for (let i = alive.length - 1; i >= 0; i--) if (alive[i].dead) alive.splice(i, 1);
  }
  for (const d of drops) if (d.trail) trailPts.push(d.trail);

  const segs = [];
  for (const tr of trailPts) for (let i = 1; i < tr.length; i++) {
    const [x0, y0, t0, w0] = tr[i - 1], [x1, y1, t1, w1] = tr[i];
    segs.push(x0, y0, x1, y1, t0, Math.max(t1, t0 + 1e-3), Math.min(w0, w1), 2);
  }
  const out = drops.filter((d) => d.rs.length).map((d) => {
    const n = d.rs.length, xyr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { xyr[i * 3] = d.xs[i]; xyr[i * 3 + 1] = d.ys[i]; xyr[i * 3 + 2] = d.rs[i]; }
    return { f0: d.f0, n, xyr, group: d.group };
  });
  return { drops: out, trails: Float32Array.from(segs), stats: { drops: out.length, trailSegs: segs.length / 8, runners: runners.length, slides: trailPts.length } };
}
