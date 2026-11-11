/*
 * 03 · 자라는 산호 — Canvas 2D, everything procedural.
 * A coral is grown once in setup() by space colonization (attractor points in a lobed crown; every node
 * steps toward the attractors that chose it; attractors die when a node reaches them). Each node keeps the
 * iteration it was born in, so frame(t) only has to map t → growth G(t) and draw the nodes born before G.
 * Thickness follows the pipe model (radius from the number of descendants already born), so branches
 * thicken as the coral grows. Background reefs are grown the same way and baked into hazy layers.
 */
import { defineDemo, rand, track, ease, clamp, lerp, ramp } from '../_lib/stage.js';

const D = 9.5;
const TAU = Math.PI * 2;
const M = 110;                       // margin around baked layers so parallax never shows an edge

// ---------------------------------------------------------------- space colonization
function colonize({ roots, attractors, step, dI, dK, maxIter = 500, up = 0, inertia = 0.2, wobble = 0, rnd }) {
  const X = [], Y = [], P = [], K = [], DX = [], DY = [], kids = [];
  for (const [x, y] of roots) { X.push(x); Y.push(y); P.push(-1); K.push(0); DX.push(0); DY.push(-1); kids.push([]); }
  const n = attractors.length;
  const ax = new Float64Array(n), ay = new Float64Array(n);
  attractors.forEach(([x, y], i) => { ax[i] = x; ay[i] = y; });
  const alive = new Uint8Array(n).fill(1), best = new Int32Array(n).fill(-1), bestD = new Float64Array(n).fill(Infinity);
  const dI2 = dI * dI, dK2 = dK * dK;
  let from = 0, nAlive = n, front = roots.map((_, i) => i);
  for (let it = 1; it <= maxIter && nAlive > 0; it++) {
    // 1. only the nodes added last iteration can change an attractor's closest node or kill it
    for (let a = 0; a < n; a++) {
      if (!alive[a]) continue;
      for (let j = from; j < X.length; j++) {
        const dx = ax[a] - X[j], dy = ay[a] - Y[j], d2 = dx * dx + dy * dy;
        if (d2 < dK2) { alive[a] = 0; nAlive--; break; }
        if (d2 < dI2 && d2 < bestD[a]) { bestD[a] = d2; best[a] = j; }
      }
    }
    from = X.length;
    // 2. every attractor pulls on its closest node; a node grows along the mean pull
    const m = X.length, sx = new Float64Array(m), sy = new Float64Array(m), cnt = new Uint16Array(m);
    for (let a = 0; a < n; a++) {
      if (!alive[a] || best[a] < 0) continue;
      const j = best[a], l = Math.sqrt(bestD[a]) || 1;
      sx[j] += (ax[a] - X[j]) / l; sy[j] += (ay[a] - Y[j]) / l; cnt[j]++;
    }
    const grow = [];
    let pulled = false;
    for (let j = 0; j < m; j++) {
      if (!cnt[j]) continue;
      pulled = true;
      let l = Math.hypot(sx[j], sy[j]);
      let dx = l > 1e-6 ? sx[j] / l : DX[j], dy = l > 1e-6 ? sy[j] / l : DY[j];
      dx += DX[j] * inertia; dy += DY[j] * inertia - up;
      if (wobble) { const w = (rnd() - 0.5) * wobble, c = Math.cos(w), s = Math.sin(w); [dx, dy] = [dx * c - dy * s, dx * s + dy * c]; }
      l = Math.hypot(dx, dy); dx /= l; dy /= l;
      if (kids[j].some(([kx, ky]) => kx * dx + ky * dy > 0.96)) continue;   // never regrow the same twig
      grow.push([j, dx, dy]);
    }
    if (!pulled) for (const j of front) grow.push([j, DX[j], DY[j]]);   // trunk phase: nothing in reach yet
    if (!grow.length) break;
    front = [];
    for (const [j, dx, dy] of grow) {
      kids[j].push([dx, dy]);
      X.push(X[j] + dx * step); Y.push(Y[j] + dy * step); P.push(j); K.push(it); DX.push(dx); DY.push(dy); kids.push([]);
      front.push(X.length - 1);
    }
  }
  // relax the polyline a little (parents always precede children, roots stay put)
  const N = X.length, ch = Array.from({ length: N }, () => []);
  for (let i = 0; i < N; i++) if (P[i] >= 0) ch[P[i]].push(i);
  for (let pass = 0; pass < 2; pass++) {
    const nx = X.slice(), ny = Y.slice();
    for (let i = 0; i < N; i++) {
      if (P[i] < 0 || !ch[i].length) continue;
      let cx = 0, cy = 0;
      for (const c of ch[i]) { cx += X[c]; cy += Y[c]; }
      cx /= ch[i].length; cy /= ch[i].length;
      nx[i] = 0.5 * X[i] + 0.25 * X[P[i]] + 0.25 * cx; ny[i] = 0.5 * Y[i] + 0.25 * Y[P[i]] + 0.25 * cy;
    }
    for (let i = 0; i < N; i++) { X[i] = nx[i]; Y[i] = ny[i]; }
  }
  const desc = new Float64Array(N);
  for (let i = N - 1; i >= 0; i--) if (P[i] >= 0) desc[P[i]] += desc[i] + 1;
  // a node on a smooth run is covered by its two quads; only forks, tips, the root and bends need a disc
  const disc = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (P[i] < 0 || ch[i].length !== 1) { disc[i] = 1; continue; }
    const p = P[i], c = ch[i][0];
    const ax = X[i] - X[p], ay = Y[i] - Y[p], bx = X[c] - X[i], by = Y[c] - Y[i];
    disc[i] = (ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by) + 1e-9) < 0.985 ? 1 : 0;
  }
  return { N, X: Float64Array.from(X), Y: Float64Array.from(Y), P: Int32Array.from(P), K: Int32Array.from(K), ch, desc, disc, iters: K[N - 1] };
}

/** one filled outline of a coral: tapered quads between nodes + a disc wherever the outline needs one
 *  (forks, tips, bends, thick parts) — one path, one fill.
 *  No closePath: fill() closes every subpath by itself, and in Chrome closePath on a path that already holds
 *  thousands of subpaths gets slower as the path grows — it was ~90% of the frame time (≈11,000 calls a frame).
 *  Quads and arcs all wind clockwise on screen, so the nonzero union is unchanged. */
function coralPath(c, C, ex, ey, rr, m, rs, add, ox, oy, minR = 0.05) {
  const { X, Y, P, disc } = C;
  c.beginPath();
  for (let i = 0; i < m; i++) {
    const R1 = rr[i], r1 = R1 * rs + add;
    if (r1 <= minR) continue;
    const x1 = ex[i] + ox * R1, y1 = ey[i] + oy * R1, p = P[i];
    if (p >= 0) {
      const R0 = rr[p], r0 = R0 * rs + add, x0 = X[p] + ox * R0, y0 = Y[p] + oy * R0;
      const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
      if (L > 0.01) {
        const nx = -dy / L, ny = dx / L;
        c.moveTo(x0 - nx * r0, y0 - ny * r0); c.lineTo(x1 - nx * r1, y1 - ny * r1);
        c.lineTo(x1 + nx * r1, y1 + ny * r1); c.lineTo(x0 + nx * r0, y0 + ny * r0);
      }
    }
    if (disc[i] || r1 > 5) { c.moveTo(x1 + r1, y1); c.arc(x1, y1, r1, 0, TAU); }
  }
}

function staticCoral(c, C, rTip, kR, fill, { rs = 1, add = 0, ox = 0, oy = 0 } = {}) {
  const rr = new Float64Array(C.N);
  for (let i = 0; i < C.N; i++) rr[i] = rTip + kR * Math.sqrt(C.desc[i]);
  c.fillStyle = fill;
  coralPath(c, C, C.X, C.Y, rr, C.N, rs, add, ox, oy);
  c.fill();
}

// willReadFrequently keeps a canvas on Skia's CPU rasterizer. Only for the headless check (?render), where the
// "GPU" is SwiftShader and CPU raster of thousands of small paths is much cheaper than emulated GPU path
// rendering; in a real browser the GPU-accelerated canvas is the fast path for live playback.
const SOFT = new URLSearchParams(location.search).has('render') ? { willReadFrequently: true } : undefined;
function off(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d', SOFT)]; }

// tileable caustics: Worley F2−F1 is ~0 on cell borders → a net of lines; a periodic warp bends them
function causticTile(rnd, S, cells) {
  const pts = [];
  for (let j = 0; j < cells; j++) for (let i = 0; i < cells; i++) pts.push([(i + rnd()) / cells, (j + rnd()) / cells]);
  const [cv, c] = off(S, S), img = c.createImageData(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const u0 = x / S, v0 = y / S;
    const u = u0 + 0.045 * Math.sin(TAU * (2 * v0 + 0.3)) + 0.025 * Math.sin(TAU * (3 * u0 + v0));
    const v = v0 + 0.045 * Math.sin(TAU * (2 * u0 + 0.7)) + 0.025 * Math.sin(TAU * (3 * v0 - u0));
    const gi = Math.floor(u * cells), gj = Math.floor(v * cells);
    let f1 = 9, f2 = 9;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const ci = gi + di, cj = gj + dj, wi = ((ci % cells) + cells) % cells, wj = ((cj % cells) + cells) % cells;
      const p = pts[wj * cells + wi];
      const px = p[0] + (ci - wi) / cells, py = p[1] + (cj - wj) / cells;
      const d = Math.hypot(px - u, py - v);
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
    }
    const e = (f2 - f1) * cells, line = clamp(1 - e / 0.13), halo = clamp(1 - e / 0.5);
    const k = (y * S + x) * 4;
    img.data[k] = 205; img.data[k + 1] = 245; img.data[k + 2] = 255;
    img.data[k + 3] = 255 * Math.min(1, line * line * 0.9 + halo * halo * 0.22);
  }
  c.putImageData(img, 0, 0);
  return cv;
}

/** lumpy half-ellipse (a rock, a coral head), lit from above */
function mound(c, cx, cy, rx, ry, cols, seed = 0) {
  c.beginPath();
  for (let i = 0; i <= 48; i++) {
    const a = Math.PI + (i / 48) * Math.PI, wob = 1 + 0.07 * Math.sin(a * 5 + seed) + 0.04 * Math.sin(a * 13 + 2 * seed);
    c.lineTo(cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob);
  }
  c.closePath();
  const g = c.createLinearGradient(0, cy - ry, 0, cy);
  cols.forEach((col, i) => g.addColorStop(i / (cols.length - 1), col));
  c.fillStyle = g; c.fill();
}

/** a background colony grown by the same algorithm: a squat, antler-like clump from three roots */
function bush(r, x, y, h) {
  const w = h * (1.0 + r() * 0.7), att = [];
  while (att.length < 60 + h * 0.55) { const u = r() * 2 - 1, v = -r(); if (u * u + v * v <= 1) att.push([x + u * w / 2, y - 12 + v * h]); }
  const roots = [[x - w * 0.14, y], [x, y + 2], [x + w * 0.13, y]];
  return colonize({ roots, attractors: att, step: 5, dI: 40 + h * 0.15, dK: 12 + h * 0.035, up: 0.25, wobble: 0.5, rnd: r });
}

// ---------------------------------------------------------------- timeline
// growth arrives in four ease-out bursts (fast start, slow settle) — the coral "breathes" as it grows
const BURSTS = [[0.5, 1.7, 0.17], [1.55, 1.7, 0.23], [2.95, 1.7, 0.27], [4.3, 1.9, 0.33]];
const growF = (t) => BURSTS.reduce((s, [a, d, w]) => s + w * ease.outCubic(clamp((t - a) / d)), 0);
const camS = track([[0, 1.9], [0.7, 1.86], [6.3, 1.0, ease.inOutCubic], [D, 0.975, (p) => p]]);
const camC = track([[0, [540, 1340]], [0.7, [540, 1330]], [6.3, [540, 985], ease.inOutCubic], [D, [540, 965], (p) => p]]);
const fadeIn = (t) => ramp(t, 0, 1.3);

defineDemo({
  id: '03-coral-growth',
  title: '자라는 산호',
  tech: 'Canvas 2D 절차적 생성 · Space Colonization',
  duration: D,
  background: '#03101c',
  async setup({ canvas, W, H }) {
    const { ctx } = canvas({ type: '2d', attrs: SOFT });
    const LW = W + 2 * M, LH = H + 2 * M;

    // ---------- the hero coral: attractors in a lobed, fan-shaped crown ----------
    const R = rand(7);
    const base = [540, 1528];
    // crown: a broad fan narrowing to the foot, its rim broken into lobes, with a few gaps inside
    const crown = (x, y) => {
      const dx = (x - 540) / 455, dy = (y - 905) / 470, th = Math.atan2(dy, dx);
      const rim = 1 + 0.1 * Math.sin(5 * th + 1.2) + 0.06 * Math.sin(9 * th + 0.4) + 0.04 * Math.sin(14 * th + 2.0);
      if (dx * dx + dy * dy > rim * rim) return false;
      const h = base[1] - y;
      if (h < 110 || Math.abs(x - 540) > (h - 60) * 1.05) return false;   // the fan narrows toward its foot
      const hole = Math.sin(x * 0.013 + 1.7) * Math.sin(y * 0.011 + 0.3) + 0.5 * Math.sin(x * 0.029 - y * 0.017);
      return hole < 0.95;
    };
    const attr = [];
    while (attr.length < 2600) {
      const x = 60 + R() * 960, y = 380 + R() * 1100;
      if (crown(x, y)) attr.push([x, y]);
    }
    const C = colonize({ roots: [base], attractors: attr, step: 7, dI: 115, dK: 14, up: 0.1, inertia: 0.3, wobble: 0.3, rnd: rand(11) });
        this.C = C;
    const n = C.N;
    this.desc = new Float64Array(n); this.rr = new Float64Array(n);
    this.flare = Float64Array.from(C.Y, (y) => 1 + 0.7 * clamp(1 - (base[1] - y) / 70) ** 2);   // the foot spreads onto the rock
    { const r = rand(41); this.speck = Float64Array.from({ length: 2 * n }, (_, k) => (k % 2 ? r() : r() * 2 - 1)); }
    this.ex = new Float64Array(n); this.ey = new Float64Array(n);
    this.K = C.iters + 1;                                 // G runs 0 → K
    const G = (t) => this.K * growF(t);
    this.G = G;
    // the time each node finishes growing (first t with G ≥ K[i]) — for the polyps
    const born = new Float64Array(n);
    {
      let i = 0;
      for (let s = 0; s <= D && i < n; s += 1 / 480) { const g = G(s); while (i < n && C.K[i] <= g) born[i++] = s; }
      while (i < n) born[i++] = D;
    }
    // polyps: one at every tip, and some along the thin branches; they open in a wave from foot to crown
    const RP = rand(23);
    const tips = [];
    let top = 1e9;
    for (let i = 0; i < n; i++) top = Math.min(top, C.Y[i]);
    let side = 1;
    for (let i = 1; i < n; i++) {
      const tip = !C.ch[i].length;
      if (!tip && !(C.desc[i] < 70 && C.desc[i] > 2 && RP() < 0.2)) continue;
      const p = C.P[i], dx = C.X[i] - C.X[p], dy = C.Y[i] - C.Y[p];
      const h = clamp((base[1] - C.Y[i]) / (base[1] - top));
      const tb = Math.max(born[i] + 0.35, 5.3 + 1.8 * h + RP() * 0.4);
      side = -side;
      const L = Math.hypot(dx, dy) || 1;
      tips.push({ i, tip, side, nx: -dy / L, ny: dx / L, ang: Math.atan2(dy, dx) + Math.PI / 2 + (tip ? 0 : side * 1.15), tb, ph: RP() * TAU,
        sz: (tip ? 0.85 : 0.6) + RP() * 0.35, egg: tip && RP() < 0.6 ? tb + 0.5 + RP() * 1.7 : 99, ev: 55 + RP() * 60, ew: 6 + RP() * 10, es: 2.2 + RP() * 1.8 });
    }
    this.tips = tips;

    // ---------- sprites ----------
    const [glow, g1] = off(64, 64);
    { const g = g1.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,236,206,1)'); g.addColorStop(0.18, 'rgba(255,200,160,0.55)'); g.addColorStop(0.5, 'rgba(255,150,130,0.12)'); g.addColorStop(1, 'rgba(255,140,120,0)');
      g1.fillStyle = g; g1.fillRect(0, 0, 64, 64); }
    const [blue, b1] = off(64, 64);
    { const g = b1.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(200,245,255,1)'); g.addColorStop(0.3, 'rgba(140,215,240,0.3)'); g.addColorStop(1, 'rgba(120,200,230,0)');
      b1.fillStyle = g; b1.fillRect(0, 0, 64, 64); }
    const [bokeh, k1] = off(128, 128);
    { const g = k1.createRadialGradient(64, 64, 0, 64, 64, 62);
      g.addColorStop(0, 'rgba(190,235,250,0.55)'); g.addColorStop(0.78, 'rgba(190,235,250,0.7)'); g.addColorStop(0.9, 'rgba(210,245,255,0.95)'); g.addColorStop(1, 'rgba(210,245,255,0)');
      k1.fillStyle = g; k1.fillRect(0, 0, 128, 128); }
    // a polyp seen from the side: eight translucent tentacles with bright beads around a soft mouth
    const [polyp, q] = off(96, 96);
    q.translate(48, 70); q.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const u = (i - 3.5) / 3.5, a = -Math.PI / 2 + u * 1.25, L = 44 - Math.abs(u) * 12;
      const ex = Math.cos(a) * L, ey = Math.sin(a) * L, bx = Math.cos(a + u * 0.45) * L * 0.55, by = Math.sin(a + u * 0.45) * L * 0.55;
      for (const [w, col] of [[6, 'rgba(255,170,150,0.28)'], [2.6, 'rgba(255,226,200,0.8)']]) {
        q.strokeStyle = col; q.lineWidth = w;
        q.beginPath(); q.moveTo(0, 0); q.quadraticCurveTo(bx, by, ex, ey); q.stroke();
      }
      q.fillStyle = '#fff0cc'; q.beginPath(); q.arc(ex, ey, 3, 0, TAU); q.fill();
    }
    { const g = q.createRadialGradient(0, -3, 0, 0, -3, 13);
      g.addColorStop(0, '#fff2d6'); g.addColorStop(0.55, '#ffa27e'); g.addColorStop(1, 'rgba(230,100,100,0)');
      q.fillStyle = g; q.beginPath(); q.ellipse(0, -2, 13, 10, 0, 0, TAU); q.fill(); }
    // light shaft: soft across, fading with depth
    const [shaft, s1] = off(128, 1024);
    { const g = s1.createLinearGradient(0, 0, 128, 0);
      g.addColorStop(0, 'rgba(200,240,255,0)'); g.addColorStop(0.5, 'rgba(200,240,255,1)'); g.addColorStop(1, 'rgba(200,240,255,0)');
      s1.fillStyle = g; s1.fillRect(0, 0, 128, 1024);
      s1.globalCompositeOperation = 'destination-in';
      const v = s1.createLinearGradient(0, 0, 0, 1024);
      v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.45, 'rgba(0,0,0,0.5)'); v.addColorStop(1, 'rgba(0,0,0,0)');
      s1.fillStyle = v; s1.fillRect(0, 0, 128, 1024); }
    const caust = causticTile(rand(5), 256, 5);
    this.patA = ctx.createPattern(caust, 'repeat'); this.patB = ctx.createPattern(caust, 'repeat');

    // ---------- baked layers (stage coords + margin M) ----------
    // water: bright under the surface, deepening, with a pale scattering band low on the horizon
    const [water, w] = off(LW, LH);
    w.translate(M, M);
    { const g = w.createLinearGradient(0, -M, 0, H + M);
      g.addColorStop(0, '#62c4d4'); g.addColorStop(0.16, '#2b8aa8'); g.addColorStop(0.42, '#135679'); g.addColorStop(0.62, '#0c3f63'); g.addColorStop(0.74, '#114c6c'); g.addColorStop(1, '#061c30');
      w.fillStyle = g; w.fillRect(-M, -M, LW, LH);
      const r = w.createRadialGradient(620, -260, 0, 620, -260, 1300);
      r.addColorStop(0, 'rgba(215,250,255,0.6)'); r.addColorStop(0.5, 'rgba(160,225,240,0.12)'); r.addColorStop(1, 'rgba(160,225,240,0)');
      w.fillStyle = r; w.fillRect(-M, -M, LW, LH); }

    // a reef row: bushy and table colonies grown by the same algorithm, coral heads, sea whips
    const reefRow = (c, seed, n, xs, y0, y1, hMin, hMax, fill, rim) => {
      const r = rand(seed);
      for (let i = 0; i < n; i++) {
        const x = xs(i, r), y = lerp(y0, y1, r()), h = lerp(hMin, hMax, r()), kind = r();
        if (kind < 0.22) {        // a rounded coral head
          mound(c, x, y + 4, h * (0.55 + r() * 0.3), h * (0.38 + r() * 0.15), [rim || fill, fill, fill], i);
        } else if (kind < 0.34) { // sea whips
          c.strokeStyle = fill; c.lineCap = 'round';
          for (let k = 0; k < 4; k++) {
            const hh = h * (0.9 + r() * 0.8), lean = (r() - 0.5) * hh * 0.5, xx = x + (r() - 0.5) * 30;
            c.lineWidth = 2 + h * 0.012;
            c.beginPath(); c.moveTo(xx, y); c.quadraticCurveTo(xx + lean * 0.2, y - hh * 0.6, xx + lean, y - hh); c.stroke();
          }
        } else {
          const cl = bush(r, x, y, h), rTip = 2.6 + h * 0.014;
          staticCoral(c, cl, rTip, 0.4, fill);
          if (rim) staticCoral(c, cl, rTip, 0.4, rim, { rs: 0.5, ox: -0.2, oy: -0.45 });
        }
      }
    };
    // far reef: small colonies blurred and sunk into the haze
    const [far, f] = off(LW, LH);
    f.translate(M, M);
    {
      const [tmp, tc] = off(LW, LH); tc.translate(M, M);
      reefRow(tc, 101, 30, (i, r) => -80 + (i + r()) * (W + 160) / 30, 1405, 1445, 50, 150, '#0a3654', null);
      tc.fillStyle = '#0a3654'; tc.fillRect(-M, 1440, LW, H);
      f.filter = 'blur(4px)'; f.drawImage(tmp, -M, -M); f.filter = 'none';
      f.globalCompositeOperation = 'source-atop';
      const g = f.createLinearGradient(0, 1220, 0, 1460);
      g.addColorStop(0, 'rgba(34,116,146,0.6)'); g.addColorStop(1, 'rgba(14,72,104,0.25)');
      f.fillStyle = g; f.fillRect(-M, -M, LW, LH);
      f.globalCompositeOperation = 'source-over';
    }
    // mid reef: bigger colonies on both flanks, darker, top-lit
    const [mid, mc] = off(LW, LH);
    mc.translate(M, M);
    {
      const [tmp, tc] = off(LW, LH); tc.translate(M, M);
      reefRow(tc, 207, 14, (i, r) => (i < 7 ? -90 + i * 52 : 820 + (i - 7) * 52) + r() * 30, 1478, 1520, 110, 290, '#06233a', 'rgba(70,150,175,0.38)');
      mc.filter = 'blur(1.4px)'; mc.drawImage(tmp, -M, -M); mc.filter = 'none';
      mc.globalCompositeOperation = 'source-atop';
      const g = mc.createLinearGradient(0, 1150, 0, 1560);
      g.addColorStop(0, 'rgba(24,96,128,0.42)'); g.addColorStop(1, 'rgba(10,50,78,0.08)');
      mc.fillStyle = g; mc.fillRect(-M, -M, LW, LH);
      mc.globalCompositeOperation = 'source-over';
    }
    // sea floor + the rock the hero grows from
    const [floor, fl] = off(LW, LH);
    fl.translate(M, M);
    const ROCK = ['#6cb4c6', '#236580', '#0f384e', '#0b2c3f'];
    const boulder = (c, x, y, rx, ry, seed) => {
      c.save(); c.translate(x, y + 2); c.scale(1, 0.28);
      const sh = c.createRadialGradient(0, 0, 0, 0, 0, rx * 1.45);
      sh.addColorStop(0, 'rgba(2,10,18,0.7)'); sh.addColorStop(1, 'rgba(2,10,18,0)');
      c.fillStyle = sh; c.beginPath(); c.arc(0, 0, rx * 1.45, 0, TAU); c.fill(); c.restore();
      mound(c, x, y, rx, ry, ROCK, seed);
      // a little texture: pale encrusting spots on the lit top
      const r = rand(900 + seed);
      c.fillStyle = 'rgba(150,215,225,0.16)';
      for (let i = 0; i < rx * 0.5; i++) {
        const a = Math.PI * (1.15 + r() * 0.7), d = Math.sqrt(r()) * 0.85;
        c.beginPath(); c.arc(x + Math.cos(a) * rx * d, y + Math.sin(a) * ry * d, 1 + r() * rx * 0.03, 0, TAU); c.fill();
      }
    };
    {
      const g = fl.createLinearGradient(0, 1440, 0, H + M);
      g.addColorStop(0, '#1f6580'); g.addColorStop(0.2, '#174d64'); g.addColorStop(0.55, '#0c3045'); g.addColorStop(1, '#051624');
      fl.fillStyle = g;
      fl.beginPath(); fl.moveTo(-M, 1468);
      for (let x = -M; x <= W + M; x += 20) fl.lineTo(x, 1462 + 10 * Math.sin(x * 0.006 + 1.3) + 6 * Math.sin(x * 0.017));
      fl.lineTo(W + M, H + M); fl.lineTo(-M, H + M); fl.closePath(); fl.fill();
      const r = rand(301);
      for (let i = 0; i < 30; i++) {
        const x = r() * W, y = 1490 + r() * 260, sz = 4 + r() * 9 * (y - 1400) / 300;
        if (Math.abs(x - 540) < 220 && y < 1600) continue;
        boulder(fl, x, y, sz * 1.5, sz, 10 + i);
      }
      boulder(fl, 390, 1572, 70, 44, 2);
      boulder(fl, 700, 1568, 84, 50, 3);
      boulder(fl, 540, 1556, 175, 118, 1);
    }
    // rocks in front of the coral's foot (drawn after the coral)
    const [rockF, rf] = off(LW, LH);
    rf.translate(M, M);
    boulder(rf, 490, 1566, 66, 46, 4);
    boulder(rf, 598, 1570, 60, 42, 5);
    boulder(rf, 546, 1584, 44, 34, 6);
    // foreground: out-of-focus dark colonies framing the bottom corners
    const [fg, fc] = off(LW, LH);
    fc.translate(M, M);
    {
      const [tmp, tc] = off(LW, LH); tc.translate(M, M);
      const r = rand(401);
      staticCoral(tc, bush(r, -60, 1900, 430), 6, 0.6, '#020b14');
      staticCoral(tc, bush(r, 1150, 1910, 380), 6, 0.6, '#020b14');
      tc.fillStyle = '#020b14';
      tc.beginPath(); tc.ellipse(-40, 1950, 330, 150, 0, 0, TAU); tc.fill();
      tc.beginPath(); tc.ellipse(1140, 1960, 300, 160, 0, 0, TAU); tc.fill();
      fc.filter = 'blur(9px)'; fc.drawImage(tmp, -M, -M); fc.filter = 'none';
    }
    // grade: vignette + darker bottom for the caption
    const [vig, v] = off(W, H);
    {
      const g = v.createRadialGradient(540, 820, 300, 540, 900, 1250);
      g.addColorStop(0, 'rgba(0,6,14,0)'); g.addColorStop(1, 'rgba(0,6,14,0.62)');
      v.fillStyle = g; v.fillRect(0, 0, W, H);
      const b = v.createLinearGradient(0, 1540, 0, H);
      b.addColorStop(0, 'rgba(1,8,16,0)'); b.addColorStop(1, 'rgba(1,8,16,0.72)');
      v.fillStyle = b; v.fillRect(0, 0, W, H);
    }

    // keep only the part of each baked layer that has content: less to composite every frame
    const crop = (img, x0, y0, x1, y1) => {
      const [c, k] = off(x1 - x0, y1 - y0);
      k.drawImage(img, -(x0 + M), -(y0 + M));
      return { img: c, x: x0, y: y0 };
    };
    const L = {
      water: { img: water, x: -M, y: -M },
      far: crop(far, -M, 1100, W + M, 1520),
      mid: crop(mid, -M, 950, W + M, 1600),
      floor: crop(floor, -M, 1430, W + M, H + M),
      rockF: crop(rockF, 400, 1500, 680, 1640),
      fg: crop(fg, -M, 1380, W + M, H + M),
    };

    // ---------- per-frame scratch ----------
    const [coralL, cl] = off(W, H);
    const [small, sm] = off(270, 480);
    const [soft, so] = off(270, 480);
    const [floorC, fcx] = off((W + 2 * M) / 2, 320);   // caustic scratch at half resolution
    Object.assign(this, { ctx, W, H, L, vig, glow, blue, bokeh, polyp, shaft, coralL, cl, small, sm, soft, so, floorC, fcx });

    // drifting things (all closed-form in t)
    const RS = rand(77);
    this.snow = Array.from({ length: 280 }, () => ({ x: RS() * W, y: RS() * H, z: RS(), ph: RS() * TAU, w: 0.4 + RS() }));
    this.bok = Array.from({ length: 13 }, () => ({ x: RS() * W, y: RS() * H, r: 40 + RS() * 110, a: 0.03 + RS() * 0.06, ph: RS() * TAU }));
    this.shafts = Array.from({ length: 7 }, (_, i) => ({ x: 80 + i * 150 + RS() * 80, a: -0.2 + RS() * 0.12 + i * 0.02, w: 110 + RS() * 230, al: 0.1 + RS() * 0.12, ph: RS() * TAU, f: 0.4 + RS() * 0.8 }));
    this.school = Array.from({ length: 13 }, (_, i) => ({ ox: (RS() - 0.5) * 300, oy: (RS() - 0.5) * 140, len: 22 + RS() * 12, ph: RS() * TAU, lag: RS() * 0.5 }));
  },

  frame(t) {
    const { ctx, W, H, C } = this;
    const s = camS(t), [ccx, ccy] = camC(t);
    const cam = (f) => {
      const k = 1 + (s - 1) * f, cx = 540 + (ccx - 540) * f, cy = 960 + (ccy - 960) * f;
      return [k, 0, 0, k, 540 - cx * k, 960 - cy * k];
    };
    const layer = (l, f, alpha = 1) => { ctx.setTransform(...cam(f)); ctx.globalAlpha = alpha; ctx.drawImage(l.img, l.x, l.y); };
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    // ---------------- background: water, shafts, far reef, fish, mid reef ----------------
    layer(this.L.water, 0.15);
    const shafts = (gain) => {
      ctx.globalCompositeOperation = 'lighter';
      for (const sh of this.shafts) {
        const a = sh.a + 0.035 * Math.sin(t * 0.33 + sh.ph);
        const flick = 0.55 + 0.45 * Math.sin(t * sh.f + sh.ph) * Math.sin(t * sh.f * 0.53 + 1.7 * sh.ph);
        ctx.setTransform(...cam(0.2));
        ctx.translate(sh.x, -140); ctx.rotate(a);
        ctx.globalAlpha = sh.al * flick * gain;
        ctx.drawImage(this.shaft, -sh.w / 2, 0, sh.w, 1800);
      }
      ctx.globalCompositeOperation = 'source-over';
    };
    shafts(1);
    // the surface seen from below: a rippling sheet of light at the top of the frame
    {
      const fc = this.fcx, fw = W + 2 * M;
      fc.setTransform(0.5, 0, 0, 0.5, 0, 0);
      fc.globalCompositeOperation = 'source-over'; fc.globalAlpha = 1;
      fc.clearRect(0, 0, fw, 640);
      this.patA.setTransform(new DOMMatrix([2.6, 0, 0, 0.36, 30 * t, 14 * t]));
      fc.fillStyle = this.patA; fc.fillRect(0, 0, fw, 640);
      fc.globalCompositeOperation = 'lighter'; fc.globalAlpha = 0.7;
      this.patB.setTransform(new DOMMatrix([-2.0, 0, 0.4, 0.3, 200 - 24 * t, 9 * t]));
      fc.fillStyle = this.patB; fc.fillRect(0, 0, fw, 640);
      fc.globalAlpha = 1; fc.globalCompositeOperation = 'destination-in';
      const g = fc.createLinearGradient(0, 0, 0, 640);
      g.addColorStop(0, 'rgba(0,0,0,0.9)'); g.addColorStop(0.22, 'rgba(0,0,0,0.3)'); g.addColorStop(0.5, 'rgba(0,0,0,0)');
      fc.fillStyle = g; fc.fillRect(0, 0, fw, 640);
      ctx.setTransform(...cam(0.15));
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28 * (0.4 + 0.6 * fadeIn(t));
      ctx.drawImage(this.floorC, -M, -M, W + 2 * M, 640);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    layer(this.L.far, 0.4);

    // a school of small fish crossing the middle distance, hazed
    ctx.setTransform(...cam(0.55));
    ctx.globalAlpha = 1;
    for (const fsh of this.school) {
      const tt = t - fsh.lag;
      const x = 1240 - 150 * tt + fsh.ox + 14 * Math.sin(tt * 1.3 + fsh.ph), y = 720 + 50 * Math.sin(tt * 0.5) + fsh.oy + 8 * Math.sin(tt * 2.1 + fsh.ph);
      if (x < -80 || x > W + 80) continue;
      fish(ctx, x, y, fsh.len, -1, 0.35 * Math.sin(t * 13 + fsh.ph), 'rgba(9,44,68,0.85)', 'rgba(120,190,210,0.35)');
    }
    layer(this.L.mid, 0.7);

    // ---------------- sea floor with caustics ----------------
    layer(this.L.floor, 1);
    {
      const fc = this.fcx, fw = W + 2 * M;
      fc.setTransform(0.5, 0, 0, 0.5, 0, 0);
      fc.globalCompositeOperation = 'source-over';
      fc.clearRect(0, 0, fw, 640);
      fc.globalAlpha = 1;
      this.patA.setTransform(new DOMMatrix([1.15, 0, 0, 0.42, 26 * t, 7 * t]));
      fc.fillStyle = this.patA; fc.fillRect(0, 0, fw, 640);
      fc.globalCompositeOperation = 'lighter';
      fc.globalAlpha = 0.8;
      this.patB.setTransform(new DOMMatrix([-0.9, 0, 0.25, 0.36, 300 - 21 * t, 50 - 5 * t]));
      fc.fillStyle = this.patB; fc.fillRect(0, 0, fw, 640);
      fc.globalAlpha = 1;
      fc.globalCompositeOperation = 'destination-in';
      const g = fc.createLinearGradient(0, 0, 0, 640);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.1, 'rgba(0,0,0,0.5)'); g.addColorStop(0.35, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0.12)');
      fc.fillStyle = g; fc.fillRect(0, 0, fw, 640);
      ctx.setTransform(...cam(1));
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.42;
      ctx.drawImage(this.floorC, -M, 1455, W + 2 * M, 640);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    // ---------------- the coral ----------------
    // as the polyps open, a soft warm light swells behind the colony
    const back = 0.17 * ramp(t, 5.3, 7.2) - 0.06 * ramp(t, 7.6, 9.5);
    if (back > 0) {
      ctx.setTransform(...cam(1)); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = back;
      ctx.drawImage(this.glow, 540 - 700, 880 - 700, 1400, 1400);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    const G = this.G(t);
    const { X, Y, P, K, N } = C, desc = this.desc, rr = this.rr, ex = this.ex, ey = this.ey;
    let m = 0;
    while (m < N && K[m] < G + 1) m++;                     // visible prefix (nodes are stored in birth order)
    desc.fill(0, 0, m);
    for (let i = m - 1; i > 0; i--) { const p = P[i]; if (p >= 0) desc[p] += desc[i] + Math.min(1, G - K[i] + 1); }
    for (let i = 0; i < m; i++) {
      rr[i] = (1.25 + 0.42 * Math.pow(desc[i], 0.52)) * this.flare[i];   // pipe model: cross-section ∝ what the branch carries
      const f = G - K[i] + 1, p = P[i];
      if (f < 1 && p >= 0) { ex[i] = lerp(X[p], X[i], f); ey[i] = lerp(Y[p], Y[i], f); rr[i] *= 0.6 + 0.4 * f; }
      else { ex[i] = X[i]; ey[i] = Y[i]; }
    }
    const cl = this.cl;
    cl.setTransform(1, 0, 0, 1, 0, 0);
    cl.globalCompositeOperation = 'source-over';
    cl.globalAlpha = 1;
    cl.clearRect(0, 0, W, H);
    cl.setTransform(...cam(1));
    // dark cool rim (doubles as the outline) → warm body shifted toward the light → highlight
    cl.fillStyle = '#34345e'; coralPath(cl, C, ex, ey, rr, m, 1, 0.7, 0, 0); cl.fill();
    const body = cl.createLinearGradient(0, 1540, 0, 420);
    body.addColorStop(0, '#3e0b26'); body.addColorStop(0.12, '#7a1c40'); body.addColorStop(0.4, '#c23656'); body.addColorStop(0.7, '#ea5a60'); body.addColorStop(1, '#ff9a7a');
    cl.fillStyle = body; coralPath(cl, C, ex, ey, rr, m, 0.92, 0, -0.09, -0.06); cl.fill();
    // a soft highlight from stacked, shrinking passes toward the light
    for (const [rs, o, a] of [[0.56, -0.26, 0.17], [0.3, -0.42, 0.2]]) {
      cl.fillStyle = `rgba(255,216,192,${a})`; coralPath(cl, C, ex, ey, rr, m, rs, 0, o, o * 0.8, 0.7); cl.fill();
    }
    // polyp pits: small dark specks scattered over the thicker branches
    cl.fillStyle = 'rgba(70,8,36,0.4)';
    cl.beginPath();
    const SP = this.speck;
    for (let i = 1; i < m; i++) {
      const r0 = rr[i];
      if (r0 < 3.2 || G - K[i] < 1) continue;
      const p = P[i], u = SP[2 * i] * r0 * 0.75, v = SP[2 * i + 1];
      const dx = X[i] - X[p], dy = Y[i] - Y[p], L = Math.hypot(dx, dy) || 1;
      const x = lerp(X[p], X[i], v) - dy / L * u, y = lerp(Y[p], Y[i], v) + dx / L * u, rad = 0.9 + r0 * 0.07;
      cl.moveTo(x + rad, y); cl.arc(x, y, rad, 0, TAU);
    }
    cl.fill();
    // caustic light dancing on the coral
    cl.globalCompositeOperation = 'source-atop';
    cl.globalAlpha = 0.22;
    this.patA.setTransform(new DOMMatrix([1.1, 0.2, -0.2, 1.1, 30 * t, 14 * t]));
    cl.fillStyle = this.patA; cl.fillRect(-200, 200, W + 400, H);
    cl.globalAlpha = 1;
    cl.globalCompositeOperation = 'source-over';

    // polyps bloom at the tips (drawn into the coral layer so they also feed the glow)
    const bloomAll = [];
    for (const tp of this.tips) {
      if (tp.i >= m) continue;
      const open = clamp((t - tp.tb) / 0.7);
      const off = tp.tip ? 0 : tp.side * rr[tp.i] * 0.8;
      const x = X[tp.i] + tp.nx * off, y = Y[tp.i] + tp.ny * off;
      if (open <= 0) {
        if (tp.tip && G - K[tp.i] + 1 >= 1) { cl.fillStyle = 'rgba(255,220,196,0.9)'; cl.beginPath(); cl.arc(x, y, 2.4, 0, TAU); cl.fill(); }
        continue;
      }
      const sc = ease.outBack(open, 2.2) * tp.sz;
      const a = tp.ang + 0.16 * Math.sin(t * 1.7 + tp.ph) * open;
      cl.setTransform(...cam(1)); cl.translate(x, y); cl.rotate(a); cl.scale(sc * 0.3, sc * 0.3 * (0.5 + 0.5 * open));
      cl.drawImage(this.polyp, -48, -66);
      bloomAll.push([x, y, open, tp]);
    }
    cl.setTransform(1, 0, 0, 1, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.coralL, 0, 0);
    layer(this.L.rockF, 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // soft bloom of the whole coral (quarter resolution, blurred, added)
    const sm = this.sm, so = this.so;
    sm.clearRect(0, 0, 270, 480); sm.drawImage(this.coralL, 0, 0, 270, 480);
    so.clearRect(0, 0, 270, 480); so.filter = 'blur(7px)'; so.drawImage(this.small, 0, 0); so.filter = 'none';
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.2 + 0.25 * ramp(t, 5.6, 7.2) - 0.1 * ramp(t, 7.6, 9.5);
    ctx.drawImage(this.soft, 0, 0, W, H);

    // the growth front glows: nodes born in the last few iterations
    ctx.setTransform(...cam(1));
    for (let i = m - 1; i >= 0 && K[i] > G - 6; i--) {
      const age = (G - K[i] + 1) / 7, a = (1 - clamp(age)) ** 2;
      if (a <= 0.01) continue;
      ctx.globalAlpha = a * 0.55;
      const r = 13 + 10 * a;
      ctx.drawImage(this.glow, ex[i] - r, ey[i] - r, 2 * r, 2 * r);
    }
    // each polyp flashes as it opens, then keeps a faint glow
    for (const [x, y, open, tp] of bloomAll) {
      const fl = Math.exp(-Math.pow((t - tp.tb - 0.25) / 0.28, 2));
      ctx.globalAlpha = (0.14 + 0.75 * fl) * open;
      const r = (12 + 30 * fl) * tp.sz;
      ctx.drawImage(this.glow, x - r, y - r, 2 * r, 2 * r);
    }
    // afterglow: spawning — tiny egg bundles drift up from the opened polyps toward the light
    for (const tp of this.tips) {
      const dt = t - tp.egg;
      if (dt <= 0) continue;
      const x = X[tp.i] + tp.ew * Math.sin(dt * 1.9 + tp.ph) * Math.min(1, dt), y = Y[tp.i] - tp.ev * dt - 9 * dt * dt;
      const a = ramp(dt, 0, 0.3) * (1 - ramp(dt, 2.5, 4.2));
      if (a <= 0) continue;
      ctx.globalAlpha = 0.85 * a;
      const r = tp.es * 3.2;
      ctx.drawImage(this.glow, x - r, y - r, 2 * r, 2 * r);
    }
    ctx.globalCompositeOperation = 'source-over';

    // ---------------- foreground: shafts over everything, snow, bokeh, dark corners ----------------
    shafts(0.38);
    ctx.globalCompositeOperation = 'lighter';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const p of this.snow) {
      const z = 0.4 + p.z * 1.2;
      const x = ((p.x + 7 * t * z + 10 * Math.sin(t * 0.7 * p.w + p.ph)) % (W + 40) + W + 40) % (W + 40) - 20;
      const y = ((p.y + 13 * t * z - (s - 1) * (p.y - 960) * z * 0.6) % (H + 40) + H + 40) % (H + 40) - 20;
      const r = 1.6 + 3.2 * p.z * p.z;
      ctx.globalAlpha = (0.12 + 0.35 * p.z) * fadeIn(t);
      ctx.drawImage(this.blue, x - r, y - r, 2 * r, 2 * r);
    }
    for (const b of this.bok) {
      const x = b.x + 22 * Math.sin(t * 0.25 + b.ph), y = b.y - 18 * t - (s - 1) * 300 * (b.y > 960 ? 1 : -1);
      ctx.globalAlpha = b.a * fadeIn(t);
      ctx.drawImage(this.bokeh, x - b.r, y - b.r, 2 * b.r, 2 * b.r);
    }
    ctx.globalCompositeOperation = 'source-over';
    layer(this.L.fg, 1.3);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.drawImage(this.vig, 0, 0);
    const fade = 1 - fadeIn(t);
    if (fade > 0) { ctx.fillStyle = `rgba(2,10,18,${fade})`; ctx.fillRect(0, 0, W, H); }
  },
});

/** a small fish in profile: body of two curves, a wagging forked tail, a pale belly line */
function fish(c, x, y, len, dir, wag, fill, belly) {
  c.save();
  c.translate(x, y); c.scale(dir * len / 30, len / 30);
  c.fillStyle = fill;
  c.beginPath();
  c.moveTo(15, 0); c.bezierCurveTo(8, -7.5, -6, -6.5, -11, -0.5); c.bezierCurveTo(-6, 5.5, 8, 6.5, 15, 0); c.fill();
  c.save(); c.translate(-10, 0); c.rotate(wag);
  c.beginPath(); c.moveTo(1, 0); c.lineTo(-8, -6); c.quadraticCurveTo(-5, 0, -8, 6); c.closePath(); c.fill(); c.restore();
  c.strokeStyle = belly; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(12, 1.6); c.quadraticCurveTo(2, 4.6, -8, 1.2); c.stroke();
  c.restore();
}
