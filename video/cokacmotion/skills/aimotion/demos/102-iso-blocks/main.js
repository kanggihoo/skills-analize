/*
 * 102 · 쌓으면, 꿈 — isometric voxel lettering.
 *
 * A word is rasterised to a coarse grid in setup (canvas text → coverage per cell → threshold), and every filled cell
 * becomes a toy brick (a cube with one stud) on a round play table. Bricks drop in with a closed-form bounce, in an
 * order that follows the strokes (connected parts in reading order, geodesic distance inside each part), and are drawn
 * back to front by their depth along the view direction (x + y + z in true iso). Faces get flat three-tone shading from
 * a light direction; each brick has a soft contact shadow that darkens and tightens as it nears the floor, and the
 * whole word casts one union shadow along the light. Then every brick lifts, the camera orbits a quarter turn with a
 * proper orthographic projection, and the same bricks fly (ballistic arcs with a somersault) to spell a second word
 * that reads from the new side; the bricks left over stack on the word's spine, so it grows in height.
 *
 * Canvas 2D, one canvas. Nothing is stepped: every brick is a small pure function of t built from times solved in setup.
 */
import { defineDemo, rand, clamp, lerp, smooth, ease, track } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';

const D = 10;
const TAU = Math.PI * 2, DEG = Math.PI / 180;
const W = 1080, H = 1920;
const KR = '"Pretendard Variable", sans-serif';
const INK = '#3B3460', ACCENT = '#FF5A4A';

// toy pastels (bricks); the copy uses ink + one accent
const PAL = [
  [126, 190, 246],  // sky
  [255, 208, 90],   // butter
  [255, 146, 176],  // pink
  [118, 212, 176],  // mint
  [176, 154, 240],  // lilac
  [255, 168, 124],  // peach
];

// ------------------------------------------------------------------------------------------------ story times
const BUILD0 = 0.5, BUILD1 = 2.8;       // first-word landings
const LIFT0 = 3.78, LIFT_SPREAD = 0.3, LIFT_DUR = 0.55, CROUCH = 0.16;
const TURN0 = 4.1, TURN1 = 5.5;          // quarter orbit
const LAND0 = 5.0, LAND1 = 6.2;          // second word, floor layer (from the centre out)
const STACK0 = 6.32, STACK1 = 6.72;      // second word, stacked layers
let tBeat = 6.8;                          // last brick seated: ring + punch (solved in setup)
const GLINT0 = 7.7, GLINT1 = 8.7;

// physics (units = one brick)
const H0 = 8.5, T_FALL = 0.4, G1 = (2 * H0) / (T_FALL * T_FALL), E1 = 0.33;
const G2 = 74, E2 = 0.3;
const PUFF_LIFE = 0.6;

// ------------------------------------------------------------------------------------------------ small helpers
const rgb = (c, k = 1, add = 0) => `rgb(${Math.round(clamp(c[0] * k + add, 0, 255))},${Math.round(clamp(c[1] * k + add, 0, 255))},${Math.round(clamp(c[2] * k + add, 0, 255))})`;
const mixC = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const sqImpulse = (s) => (s < 0 ? 0 : Math.exp(-11 * s) * Math.sin(27 * s));   // squash response to one impact

/** closed-form bounce train: lands at tL with speed vin, restitution e. Arcs: z = v·s − g/2·s², s = t − t0 */
function bounces(tL, vin, g, e) {
  const seg = [], imp = [[tL, 1]];
  let t = tL, v = vin * e;
  while ((v * v) / (2 * g) > 0.004) {
    seg.push([t, v]);
    t += (2 * v) / g;
    imp.push([t, v / vin]);
    v *= e;
  }
  return { seg, imp, g, end: t };
}
function bounceZ(b, t) {
  for (const [t0, v] of b.seg) {
    const s = t - t0;
    if (s >= 0 && s < (2 * v) / b.g) return v * s - 0.5 * b.g * s * s;
  }
  return 0;
}
function squash(imps, t) {
  let q = 0;
  for (const [t0, w] of imps) if (t >= t0 && t < t0 + 0.6) q += w * sqImpulse(t - t0);
  return q;
}

/** Rodrigues rotation matrix (row-major 3×3) about unit axis (ax, ay, az) */
function rotM(ax, ay, az, a) {
  const c = Math.cos(a), s = Math.sin(a), k = 1 - c;
  return [
    c + ax * ax * k, ax * ay * k - az * s, ax * az * k + ay * s,
    ay * ax * k + az * s, c + ay * ay * k, ay * az * k - ax * s,
    az * ax * k - ay * s, az * ay * k + ax * s, c + az * az * k,
  ];
}

// ------------------------------------------------------------------------------------------------ glyph raster
/** Rasterise syllables with one shared size into N×N cells (coverage ≥ thr). Returns [{ N, on: Uint8Array }]. */
function rasterSyllables(chars, N, thr, family) {
  const cs = 20, S = N * cs;
  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.font = `400px ${family}`;
  let ext = 0;
  for (const ch of chars) {
    const m = g.measureText(ch);
    ext = Math.max(ext, m.actualBoundingBoxLeft + m.actualBoundingBoxRight, m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);
  }
  const size = (400 * S * 0.985) / ext;
  return chars.map((ch) => {
    g.clearRect(0, 0, S, S);
    g.font = `${size}px ${family}`;
    const m = g.measureText(ch);
    const x = S / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
    const y = S / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
    g.fillStyle = '#fff';
    g.fillText(ch, x, y);
    const px = g.getImageData(0, 0, S, S).data;
    const on = new Uint8Array(N * N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      let a = 0;
      for (let yy = 0; yy < cs; yy++) for (let xx = 0; xx < cs; xx++) a += px[((j * cs + yy) * S + i * cs + xx) * 4 + 3];
      on[j * N + i] = a / (cs * cs * 255) >= thr ? 1 : 0;
    }
    return { N, on };
  });
}

/** connected parts (4-neighbour) of a mask, each with its cells and centroid */
function components(on, N) {
  const lab = new Int32Array(N * N).fill(-1), comps = [];
  for (let s = 0; s < N * N; s++) {
    if (!on[s] || lab[s] >= 0) continue;
    const cells = [s];
    lab[s] = comps.length;
    for (let k = 0; k < cells.length; k++) {
      const c = cells[k], i = c % N, j = (c / N) | 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const a = i + di, b = j + dj;
        if (a < 0 || b < 0 || a >= N || b >= N) continue;
        const n = b * N + a;
        if (on[n] && lab[n] < 0) { lab[n] = comps.length; cells.push(n); }
      }
    }
    let cx = 0, cy = 0;
    for (const c of cells) { cx += c % N; cy += (c / N) | 0; }
    comps.push({ cells, cx: cx / cells.length, cy: cy / cells.length });
  }
  return { comps, lab };
}

/** geodesic BFS distance inside one part, from its top-left-most cell (a stand-in for the pen's path) */
function strokeDistance(cells, on, N) {
  let start = cells[0], best = Infinity;
  for (const c of cells) { const k = ((c / N) | 0) + 0.55 * (c % N); if (k < best) { best = k; start = c; } }
  const dist = new Map([[start, 0]]), q = [start];
  for (let k = 0; k < q.length; k++) {
    const c = q[k], i = c % N, j = (c / N) | 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = i + di, b = j + dj;
      if (a < 0 || b < 0 || a >= N || b >= N) continue;
      const n = b * N + a;
      if (on[n] && !dist.has(n)) { dist.set(n, dist.get(c) + 1); q.push(n); }
    }
  }
  return dist;
}

/** depth of each filled cell inside the glyph (4-neighbour distance to the nearest empty cell) */
function insideDepth(on, N) {
  const d = new Int32Array(N * N).fill(-1), q = [];
  for (let s = 0; s < N * N; s++) {
    const i = s % N, j = (s / N) | 0;
    if (!on[s]) continue;
    let edge = i === 0 || j === 0 || i === N - 1 || j === N - 1;
    if (!edge) edge = !on[s - 1] || !on[s + 1] || !on[s - N] || !on[s + N];
    if (edge) { d[s] = 1; q.push(s); }
  }
  for (let k = 0; k < q.length; k++) {
    const c = q[k], i = c % N, j = (c / N) | 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = (j + dj) * N + (i + di);
      if (on[n] && d[n] < 0) { d[n] = d[c] + 1; q.push(n); }
    }
  }
  return d;
}

/** Hungarian algorithm (square, min cost). cost: Float64Array n×n row-major. Returns col → row. */
function hungarian(n, cost) {
  const INF = 1e18, u = new Float64Array(n + 1), v = new Float64Array(n + 1), p = new Int32Array(n + 1), way = new Int32Array(n + 1);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Float64Array(n + 1).fill(INF), used = new Uint8Array(n + 1);
    do {
      used[j0] = 1;
      const i0 = p[j0];
      let delta = INF, j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cur = cost[(i0 - 1) * n + j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
  }
  const rowOfCol = new Int32Array(n);
  for (let j = 1; j <= n; j++) rowOfCol[j - 1] = p[j] - 1;
  return rowOfCol;
}

/** convex hull (monotone chain) of pts [x0,y0,x1,y1,…] → same orientation every time */
function hull(pts, n) {
  const idx = [];
  for (let i = 0; i < n; i++) idx.push(i);
  idx.sort((a, b) => pts[2 * a] - pts[2 * b] || pts[2 * a + 1] - pts[2 * b + 1]);
  const cr = (o, a, b) => (pts[2 * a] - pts[2 * o]) * (pts[2 * b + 1] - pts[2 * o + 1]) - (pts[2 * a + 1] - pts[2 * o + 1]) * (pts[2 * b] - pts[2 * o]);
  const lo = [], up = [];
  for (const i of idx) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], i) <= 0) lo.pop(); lo.push(i); }
  for (let k = idx.length - 1; k >= 0; k--) { const i = idx[k]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], i) <= 0) up.pop(); up.push(i); }
  lo.pop(); up.pop();
  return lo.concat(up);
}

// ------------------------------------------------------------------------------------------------ baked art
function makeCanvas(w, h, headless) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d', headless ? { willReadFrequently: true } : undefined) };
}

function softSprite(headless, size, stops) {
  const { c, g } = makeCanvas(size, size, headless);
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [k, col] of stops) gr.addColorStop(k, col);
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  return c;
}

/** studio backdrop: sky gradient above, a soft floor sweep below, a softbox glow, film grain (two moods) */
function bakeBackdrop(headless, warm) {
  const BW = W + 200;
  const { c, g } = makeCanvas(BW, H, headless);
  const gr = g.createLinearGradient(0, 0, 0, H);
  if (!warm) {
    gr.addColorStop(0, '#B9D6F6'); gr.addColorStop(0.3, '#DCE6FA'); gr.addColorStop(0.5, '#F8E4DA');
    gr.addColorStop(0.66, '#E9D8EE'); gr.addColorStop(0.84, '#B9A6DA'); gr.addColorStop(1, '#8F7CBE');
  } else {
    gr.addColorStop(0, '#F5C3BE'); gr.addColorStop(0.3, '#FBDCCB'); gr.addColorStop(0.5, '#FFE7C8');
    gr.addColorStop(0.66, '#F1D4DC'); gr.addColorStop(0.84, '#C3A0CC'); gr.addColorStop(1, '#957AB8');
  }
  g.fillStyle = gr;
  g.fillRect(0, 0, BW, H);
  // softbox glow, upper left
  let rg = g.createRadialGradient(230, 260, 0, 230, 260, 760);
  rg.addColorStop(0, warm ? 'rgba(255,244,214,0.85)' : 'rgba(255,255,255,0.8)');
  rg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rg; g.fillRect(0, 0, BW, H);
  // far soft shapes: out-of-focus toy blocks on a shelf (rounded squares, very soft)
  const r = rand(10201);
  for (let k = 0; k < 9; k++) {
    const x = 60 + r() * (BW - 120), y = 520 + r() * 260, s = 60 + r() * 90, col = PAL[(r() * PAL.length) | 0];
    const sg = g.createRadialGradient(x, y, 0, x, y, s);
    sg.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},0.32)`);
    sg.addColorStop(0.6, `rgba(${col[0]},${col[1]},${col[2]},0.14)`);
    sg.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
    g.fillStyle = sg; g.fillRect(x - s, y - s, 2 * s, 2 * s);
  }
  // grain
  const tile = makeCanvas(256, 256, headless);
  const id = tile.g.createImageData(256, 256);
  const rn = rand(warm ? 10203 : 10202);
  for (let i = 0; i < 256 * 256; i++) {
    const v = rn() < 0.5 ? 0 : 255;
    id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v;
    id.data[i * 4 + 3] = 7 + rn() * 9;
  }
  tile.g.putImageData(id, 0, 0);
  g.fillStyle = g.createPattern(tile.c, 'repeat');
  g.fillRect(0, 0, BW, H);
  return c;
}

// ------------------------------------------------------------------------------------------------ camera
const azDeg = (t) => 16 + 4 * smooth(t / 3.8) + 90 * ease.inOutCubic(clamp((t - TURN0) / (TURN1 - TURN0))) + 6 * smooth((t - 6.4) / 3.6);
const elDeg = track([[0, 47], [3.8, 43], [4.85, 31], [5.95, 44], [10, 41]]);
const scaleT = track([[0, 30.5], [3.8, 31.5], [4.85, 28.5], [6.1, 34], [10, 36.5]]);
const oyT = track([[0, 975], [4.85, 985], [6.1, 960], [10, 985]]);

function camera(t) {
  const th = azDeg(t) * DEG, ph = elDeg(t) * DEG;
  const s = t - tBeat;
  const punch = s >= 0 ? 1 + 0.03 * Math.exp(-9 * s) : 1;
  const cam = { th, ph, ct: Math.cos(th), st: Math.sin(th), cp: Math.cos(ph), sp: Math.sin(ph), S: scaleT(t) * punch, ox: 540, oy: oyT(t) };
  // light: half world-fixed (it swings half as far as the camera), elevation 55°
  const beta = (140 - 0.5 * (azDeg(t) - 20)) * DEG, eps = 55 * DEG;
  const lx = Math.cos(eps) * Math.cos(beta), ly = Math.cos(eps) * Math.sin(beta);
  cam.L = [lx * cam.ct + ly * cam.st, -lx * cam.st + ly * cam.ct, Math.sin(eps)];
  cam.tc = [cam.st * cam.cp, cam.ct * cam.cp, cam.sp];   // toward the camera (world)
  return cam;
}
// world → screen (orthographic, azimuth th about z, elevation ph)
const PX = (c, x, y) => c.ox + c.S * (x * c.ct - y * c.st);
const PY = (c, x, y, z) => c.oy + c.S * ((x * c.st + y * c.ct) * c.sp - z * c.cp);
const DEPTH = (c, x, y, z) => (x * c.st + y * c.ct) * c.cp + z * c.sp;

// ------------------------------------------------------------------------------------------------ the demo
const DISC_R = 22, DISC_TH = 1.25;
const STUD_R = 0.3, STUD_H = 0.17;
const FACES = [  // corner bit order: x=1, y=2, z=4 (bit set = +)
  { n: [1, 0, 0], v: [1, 3, 7, 5] }, { n: [-1, 0, 0], v: [0, 4, 6, 2] },
  { n: [0, 1, 0], v: [2, 6, 7, 3] }, { n: [0, -1, 0], v: [0, 1, 5, 4] },
  { n: [0, 0, 1], v: [4, 5, 7, 6] }, { n: [0, 0, -1], v: [0, 2, 3, 1] },
];

defineDemo({
  id: '102-iso-blocks',
  title: '쌓으면, 꿈',
  tech: '아이소메트릭 복셀 글자 · 블록 조립과 재조립',
  duration: D,
  background: '#B9D6F6',

  async setup(api) {
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = ctx;
    await fontReady('400 120px "Do Hyeon"', '쌓다꿈');
    await fontReady(`900 90px ${KR}`, '한 칸, 또 쌓은 블록 그대로꿈이 된다0123456789개');

    // ---------------- words → cells (world lattice: cell centres at (i + .5, j + .5))
    const N1 = 18, N2 = 21;
    const [g1a, g1b] = rasterSyllables(['쌓', '다'], N1, 0.5, '"Do Hyeon"');
    const [g2] = rasterSyllables(['꿈'], N2, 0.5, '"Do Hyeon"');

    // word 1: the two syllables stacked in depth (read top → bottom), 1 empty row between
    const src = [];   // { x, y, comp, d, syl }
    const rows1 = 2 * N1 + 1;
    let compBase = 0;
    const compList = [];
    [g1a, g1b].forEach((gl, s) => {
      const { comps } = components(gl.on, N1);
      comps.sort((a, b) => (a.cy + 0.6 * a.cx) - (b.cy + 0.6 * b.cx));
      comps.forEach((cp, k) => {
        const dist = strokeDistance(cp.cells, gl.on, N1);
        let maxd = 0;
        for (const c of cp.cells) {
          const i = c % N1, j = (c / N1) | 0, d = dist.get(c);
          maxd = Math.max(maxd, d);
          src.push({ x: i - Math.floor(N1 / 2) + 0.5, y: j + s * (N1 + 1) - Math.floor(rows1 / 2) + 0.5, comp: compBase + k, d, syl: s });
        }
        compList.push({ maxd, n: cp.cells.length, syl: s });
      });
      compBase += comps.length;
    });
    // stroke-order schedule: parts start while the previous one is half written; then fit into [BUILD0, BUILD1]
    const compStart = [];
    let tcur = 0;
    compList.forEach((c, k) => {
      compStart.push(tcur);
      const dur = c.maxd + 1;
      const next = compList[k + 1];
      tcur += next && next.syl !== c.syl ? 0.62 * dur + 2 : 0.5 * dur + 1;
    });
    let rawMax = 0;
    for (const p of src) { p.raw = compStart[p.comp] + p.d; rawMax = Math.max(rawMax, p.raw); }
    // colours: one pastel per part, never the same as the previous part
    const compCol = compList.map((_, k) => [0, 1, 2, 3, 4, 5, 1, 0, 3][k % 9]);

    // word 2: one syllable laid out to read from the far side of the quarter turn: world = (v, −u)
    const dst = [];
    const on2 = g2.on, dep2 = insideDepth(on2, N2);
    let cx2 = 0, cy2 = 0, n2 = 0;
    for (let s = 0; s < N2 * N2; s++) if (on2[s]) { cx2 += s % N2; cy2 += (s / N2) | 0; n2++; }
    cx2 /= n2; cy2 /= n2;
    const floor2 = [];
    for (let s = 0; s < N2 * N2; s++) {
      if (!on2[s]) continue;
      const u = (s % N2) - Math.floor(N2 / 2) + 0.5, v = ((s / N2) | 0) - Math.floor(N2 / 2) + 0.5;
      floor2.push({ x: v, y: -u, layer: 0, depth: dep2[s], rc: Math.hypot((s % N2) - cx2, ((s / N2) | 0) - cy2) });
    }
    // bricks left over stack on the spine: the centre lines of the strokes (cells ≥ 2 inside), whole connected runs
    // first (largest run first, centre outwards inside a run), so a stroke rises rather than scattered bricks
    const extra = src.length - floor2.length;
    const coreMask = new Uint8Array(N2 * N2);
    for (let s = 0; s < N2 * N2; s++) coreMask[s] = on2[s] && dep2[s] >= 2 ? 1 : 0;
    const { comps: runs, lab: runLab } = components(coreMask, N2);
    const runSize = runs.map((r) => r.cells.length);
    const cellOf = new Map(floor2.map((f) => [`${f.x},${f.y}`, f]));
    const spine = [];
    for (let s = 0; s < N2 * N2; s++) {
      if (!on2[s]) continue;
      const u = (s % N2) - Math.floor(N2 / 2) + 0.5, v = ((s / N2) | 0) - Math.floor(N2 / 2) + 0.5;
      const f = cellOf.get(`${v},${-u}`);
      f.run = runLab[s] >= 0 ? runLab[s] : -1;
      spine.push(f);
    }
    spine.sort((a, b) => (b.run >= 0) - (a.run >= 0) || (b.run >= 0 ? runSize[b.run] - runSize[a.run] || a.run - b.run : b.depth - a.depth) || a.rc - b.rc);
    dst.push(...floor2);
    for (let k = 0; k < extra; k++) {
      const base = spine[k % spine.length], layer = 1 + Math.floor(k / spine.length);
      dst.push({ x: base.x, y: base.y, layer, depth: base.depth, rc: base.rc });
    }
    this.counts = { word1: src.length, floor2: floor2.length, stacked: extra };

    // ---------------- assignment: each brick flies to the nearest free spot overall (min Σ d²)
    const n = src.length;
    const cost = new Float64Array(n * n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const dx = src[i].x - dst[j].x, dy = src[i].y - dst[j].y;
      cost[i * n + j] = dx * dx + dy * dy;
    }
    const rowOfCol = hungarian(n, cost);
    const target = new Int32Array(n);
    for (let j = 0; j < n; j++) target[rowOfCol[j]] = j;

    // landing order for word 2: floor from the centre out, then the stacked layers (also centre out)
    const order2 = dst.map((d, j) => j);
    const fl = order2.filter((j) => dst[j].layer === 0).sort((a, b) => dst[a].rc - dst[b].rc || a - b);
    const st = order2.filter((j) => dst[j].layer > 0).sort((a, b) => dst[a].layer - dst[b].layer || dst[a].rc - dst[b].rc || a - b);
    const tLand2 = new Float64Array(n);
    fl.forEach((j, k) => { tLand2[j] = LAND0 + (LAND1 - LAND0) * (k / Math.max(1, fl.length - 1)); });
    st.forEach((j, k) => {
      // never before the brick underneath has finished bouncing
      const below = dst.findIndex((d) => d.x === dst[j].x && d.y === dst[j].y && d.layer === dst[j].layer - 1);
      tLand2[j] = Math.max(STACK0 + (STACK1 - STACK0) * (k / Math.max(1, st.length - 1)), tLand2[below] + 0.42);
    });
    tBeat = Math.max(...tLand2);

    // ---------------- per-brick closed-form plan
    const R = rand(10204);
    let rmax1 = 0;
    for (const p of src) rmax1 = Math.max(rmax1, Math.hypot(p.x, p.y));
    const cubes = [];
    const hitsOn = new Map();   // dst index → impacts from the brick landing on top of it
    const events = [];          // dust puffs: { t, x, y, z, w, a0 }
    // dust only kicks out where the floor next to a brick is open (the side of a stroke, never inside it)
    const occ1 = new Set(src.map((p) => `${p.x},${p.y}`)), occ2 = new Set(floor2.map((q) => `${q.x},${q.y}`));
    const openDirs = (occ, x, y, top) => [[1, 0], [0, 1], [-1, 0], [0, -1]].filter(([dx, dy]) => top || !occ.has(`${x + dx},${y + dy}`)).map(([dx, dy]) => Math.atan2(dy, dx));
    for (let i = 0; i < n; i++) {
      const p = src[i], j = target[i], q = dst[j];
      const c = { col: PAL[compCol[p.comp]], px: p.x, py: p.y, qx: q.x, qy: q.y, layer: q.layer, j };
      c.tL1 = BUILD0 + (BUILD1 - BUILD0) * (p.raw / rawMax);
      c.b1 = bounces(c.tL1, G1 * T_FALL, G1, E1);
      const rr = Math.hypot(p.x, p.y) / rmax1;
      c.lift = LIFT0 + LIFT_SPREAD * rr + 0.04 * R();
      c.Hh = 3.3 + 1.7 * (1 - rr) + 0.6 * R();
      c.ph = R() * TAU;
      c.tL2 = tLand2[j];
      const dist = Math.hypot(q.x - p.x, q.y - p.y);
      let Tb = clamp(0.5 + 0.03 * dist, 0.5, 0.95);
      const liftDone = c.lift + 0.32;
      if (c.tL2 - Tb < liftDone) Tb = Math.max(0.38, c.tL2 - liftDone);
      c.launch = c.tL2 - Tb;
      c.Tb = Tb;
      c.z0 = this.hoverZ(c, c.launch);
      c.vz0 = (q.layer - c.z0 + 0.5 * G2 * Tb * Tb) / Tb;
      const vin = Math.abs(c.vz0 - G2 * Tb);
      c.b2 = bounces(c.tL2, vin, G2, E2);
      // in-flight spin: a somersault across the direction of travel, or a quarter yaw for short hops
      if (dist > 2.5 && R() < 0.75) {
        const dx = (q.x - p.x) / dist, dy = (q.y - p.y) / dist;
        c.spin = { ax: -dy, ay: dx, az: 0, ang: TAU * (R() < 0.2 ? -1 : 1) };
      } else c.spin = { ax: 0, ay: 0, az: 1, ang: (R() < 0.5 ? -1 : 1) * Math.PI / 2 };
      if (q.layer > 0) {
        // the brick beneath gets knocked when this one lands on it
        const below = dst.findIndex((d) => d.x === q.x && d.y === q.y && d.layer === q.layer - 1);
        if (!hitsOn.has(below)) hitsOn.set(below, []);
        hitsOn.get(below).push([c.tL2, 0.55]);
      }
      const d1 = openDirs(occ1, p.x, p.y, false), d2 = openDirs(occ2, q.x, q.y, q.layer > 0);
      if (d1.length) events.push({ t: c.tL1, x: p.x, y: p.y, z: 0, w: 1, dirs: d1, j0: (R() * 7) | 0 });
      if (d2.length) events.push({ t: c.tL2, x: q.x, y: q.y, z: q.layer, w: Math.min(1.2, vin / 40), dirs: d2, j0: (R() * 7) | 0 });
      cubes.push(c);
    }
    for (const c of cubes) c.hits = hitsOn.get(c.j) || [];
    events.sort((a, b) => a.t - b.t);
    this.cubes = cubes;
    this.events = events;
    this.landTimes = cubes.map((c) => c.tL1).sort((a, b) => a - b);
    // centre of word 2 for the ring
    this.c2 = { x: 0, y: 0 };
    for (const q of floor2) { this.c2.x += q.x / floor2.length; this.c2.y += q.y / floor2.length; }

    // ---------------- baked art
    const hl = api.headless;
    this.bgCool = bakeBackdrop(hl, false);
    this.bgWarm = bakeBackdrop(hl, true);
    this.blob = softSprite(hl, 128, [[0, 'rgba(58,40,100,0.9)'], [0.45, 'rgba(58,40,100,0.45)'], [1, 'rgba(58,40,100,0)']]);
    // dust: a cartoon puff — white with a soft lilac underside, so it shows on the cream table and on bricks alike
    {
      const { c, g } = makeCanvas(96, 96, hl);
      const blobAt = (x, y, r, col, a) => {
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.55, `rgba(${col},${a * 0.75})`); gr.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = gr; g.fillRect(0, 0, 96, 96);
      };
      blobAt(53, 58, 40, '146,122,188', 0.7);
      blobAt(45, 43, 38, '255,253,250', 1);
      this.puff = c;
    }
    this.glow = softSprite(hl, 128, [[0, 'rgba(255,255,255,0.9)'], [0.4, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']]);
    this.bokeh = PAL.map((col) => softSprite(hl, 128, [[0, `rgba(${col[0]},${col[1]},${col[2]},0.55)`], [0.55, `rgba(${col[0]},${col[1]},${col[2]},0.4)`], [0.8, `rgba(${col[0]},${col[1]},${col[2]},0.12)`], [1, `rgba(${col[0]},${col[1]},${col[2]},0)`]]));
    // first composite of every offscreen canvas happens here, not in the first measured frame
    for (const im of [this.bgCool, this.bgWarm, this.blob, this.glow, this.puff, ...this.bokeh]) ctx.drawImage(im, 0, 0, 4, 4);

    // disc studs (lattice centres inside the rim)
    const studs = [];
    for (let i = -DISC_R; i < DISC_R; i++) for (let j = -DISC_R; j < DISC_R; j++) {
      const x = i + 0.5, y = j + 0.5;
      if (Math.hypot(x, y) < DISC_R - 0.75) studs.push(x, y);
    }
    this.studs = new Float32Array(studs);

    // floating motes and foreground bokeh
    const rm = rand(10205);
    this.motes = Array.from({ length: 34 }, () => ({ x: rm() * 1300 - 110, y: 380 + rm() * 1250, r: 1.5 + rm() * 3.2, sp: 0.4 + rm() * 0.9, ph: rm() * TAU, k: 0.3 + rm() * 0.7 }));
    this.fg = [
      { x: 90, y: 1520, r: 150, c: 4, k: 2.2 }, { x: 1010, y: 1440, r: 120, c: 1, k: 2.6 },
      { x: 1120, y: 560, r: 80, c: 0, k: 1.9 },
    ];
  },

  /** hover height during crouch → lift → bob (also used in setup for the launch height) */
  hoverZ(c, t) {
    const s = t - c.lift;
    if (s <= 0) return 0;
    const bob = 0.16 * Math.sin(TAU * 0.85 * s + c.ph) * smooth(s / 0.5);
    return c.Hh * ease.outCubic(clamp(s / LIFT_DUR)) + bob;
  },

  /** brick state at t: position (bottom centre), scale, rotation, visibility */
  state(c, t, o) {
    o.rot = null; o.pop = 1; o.sxy = 1; o.sz = 1; o.vis = true; o.layer = 0;
    if (t < c.tL1 - T_FALL) { o.vis = false; return o; }
    if (t < c.tL1) {                       // falling into word 1
      const s = c.tL1 - t, sp = 1 - s / T_FALL;
      o.x = c.px; o.y = c.py; o.z = 0.5 * G1 * s * s;
      o.pop = ease.outBack(clamp((T_FALL - s) / 0.16), 2.2);
      o.sz = 1 + 0.16 * sp; o.sxy = 1 - 0.07 * sp;
      return o;
    }
    if (t < c.launch) {
      o.x = c.px; o.y = c.py;
      if (t < c.lift - CROUCH) {             // landed: bounce train + squash
        o.z = bounceZ(c.b1, t);
        const q = squash(c.b1.imp, t);
        o.sz = 1 - 0.36 * q; o.sxy = 1 + 0.18 * q;
      } else if (t < c.lift) {               // crouch before the lift
        const k = smooth((t - (c.lift - CROUCH)) / CROUCH);
        o.z = 0; o.sz = 1 - 0.2 * k; o.sxy = 1 + 0.1 * k;
      } else {                               // spring up and hover
        const s = t - c.lift, rel = Math.exp(-7 * s) * Math.cos(16 * s);
        o.z = this.hoverZ(c, t);
        o.sz = 1 + 0.2 * rel; o.sxy = 1 - 0.1 * rel;
      }
      return o;
    }
    if (t < c.tL2) {                         // ballistic flight to word 2, with a spin
      const s = t - c.launch, u = s / c.Tb;
      o.x = lerp(c.px, c.qx, u); o.y = lerp(c.py, c.qy, u);
      o.z = c.z0 + c.vz0 * s - 0.5 * G2 * s * s;
      const sp = c.spin, a = sp.ang * ease.inOutCubic(u);
      o.rot = rotM(sp.ax, sp.ay, sp.az, a);
      const vz = Math.abs(c.vz0 - G2 * s) / 40;
      o.sz = 1 + 0.12 * Math.min(1, vz); o.sxy = 1 - 0.05 * Math.min(1, vz);
      return o;
    }
    o.x = c.qx; o.y = c.qy; o.layer = c.layer;   // seated in word 2
    o.z = c.layer + bounceZ(c.b2, t);
    const q = squash(c.b2.imp, t) + squash(c.hits, t);
    o.sz = 1 - 0.36 * q; o.sxy = 1 + 0.18 * q;
    return o;
  },

  frame(t) {
    const ctx = this.ctx;
    if (ctx.reset) ctx.reset();
    const cam = camera(t);
    const { S, cp, sp } = cam;
    const turn = (azDeg(t) - 20) / 90;   // 0 → 1 over the quarter turn

    // ------------------------------------------------ backdrop (parallax with the orbit), warmer at the end
    const bx = -100 - 70 * turn + 14 * Math.sin(t * 0.35);
    ctx.drawImage(this.bgCool, bx, 0);
    const warm = smooth((t - 6.6) / 3.0);
    if (warm > 0) { ctx.globalAlpha = warm; ctx.drawImage(this.bgWarm, bx, 0); ctx.globalAlpha = 1; }
    // far bokeh
    for (let k = 0; k < 7; k++) {
      const x = ((k * 197 + 80 - turn * 260 + t * 9) % 1300 + 1300) % 1300 - 110, y = 470 + ((k * 89) % 300), r = 26 + (k * 13) % 30;
      ctx.globalAlpha = 0.45;
      ctx.drawImage(this.bokeh[k % PAL.length], x - r, y - r, 2 * r, 2 * r);
    }
    ctx.globalAlpha = 1;

    // ------------------------------------------------ the play table
    const rx = DISC_R * S, ry = DISC_R * S * sp, drop = DISC_TH * S * cp;
    // its soft shadow on the studio floor
    ctx.globalAlpha = 0.5;
    ctx.drawImage(this.blob, cam.ox - rx * 1.08, cam.oy + drop - ry * 0.7, rx * 2.16, ry * 2.1);
    ctx.globalAlpha = 1;
    // rim: candy stripes that slide round with the orbit
    const K = 40;
    for (let k = 0; k < K; k++) {
      const a0 = (k / K) * TAU, a1 = ((k + 1) / K) * TAU;   // world angles
      // view angle = world angle + th; visible half is view angle in (0, π)
      let v0 = a0 + cam.th, v1 = a1 + cam.th;
      const wrap = Math.floor(v0 / TAU) * TAU;
      v0 -= wrap; v1 -= wrap;
      let lo = Math.max(v0, 0), hi = Math.min(v1, Math.PI);
      if (hi <= lo) { lo = Math.max(v0 - TAU, 0); hi = Math.min(v1 - TAU, Math.PI); }
      if (hi <= lo) continue;
      const mid = (lo + hi) / 2;
      const nx = Math.cos(mid - cam.th), ny = Math.sin(mid - cam.th);
      const sh = 0.72 + 0.32 * Math.max(0, nx * cam.L[0] + ny * cam.L[1]);
      const col = k % 2 ? [255, 246, 236] : [176, 154, 240];
      ctx.fillStyle = rgb(col, sh);
      ctx.beginPath();
      for (let m = 0; m <= 4; m++) { const a = lerp(lo, hi, m / 4); ctx.lineTo(cam.ox + rx * Math.cos(a), cam.oy + ry * Math.sin(a)); }
      for (let m = 4; m >= 0; m--) { const a = lerp(lo, hi, m / 4); ctx.lineTo(cam.ox + rx * Math.cos(a), cam.oy + ry * Math.sin(a) + drop); }
      ctx.fill();
    }
    // top
    const tg = ctx.createLinearGradient(0, cam.oy - ry, 0, cam.oy + ry);
    tg.addColorStop(0, '#FFF9F1'); tg.addColorStop(1, '#F6EADF');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.ellipse(cam.ox, cam.oy, rx, ry, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(cam.ox, cam.oy, rx - 1.5, ry - 1.5, 0, 0.05, Math.PI - 0.05); ctx.stroke();
    // baseplate studs
    const srx = STUD_R * S, sry = STUD_R * S * sp, sh = STUD_H * S * cp, st = this.studs;
    ctx.fillStyle = '#EBDDD0';
    ctx.beginPath();
    for (let k = 0; k < st.length; k += 2) {
      const X = PX(cam, st[k], st[k + 1]), Y = PY(cam, st[k], st[k + 1], 0);
      ctx.moveTo(X + srx, Y); ctx.ellipse(X, Y, srx, sry, 0, 0, Math.PI);
      ctx.lineTo(X - srx, Y - sh); ctx.lineTo(X + srx, Y - sh);
    }
    ctx.fill();
    ctx.fillStyle = '#FFFCF7';
    ctx.beginPath();
    for (let k = 0; k < st.length; k += 2) {
      const X = PX(cam, st[k], st[k + 1]), Y = PY(cam, st[k], st[k + 1], 0) - sh;
      ctx.moveTo(X + srx, Y); ctx.ellipse(X, Y, srx, sry, 0, 0, TAU);
    }
    ctx.fill();

    // ------------------------------------------------ brick states
    const cubes = this.cubes, N = cubes.length;
    if (!this.st) this.st = cubes.map(() => ({}));
    const sts = this.st;
    for (let i = 0; i < N; i++) this.state(cubes[i], t, sts[i]);

    // ground: contact shadows (darker and tighter as a brick nears the floor), then one union cast shadow
    ctx.save();
    ctx.beginPath(); ctx.ellipse(cam.ox, cam.oy, rx, ry, 0, 0, TAU); ctx.clip();
    for (let i = 0; i < N; i++) {
      const o = sts[i];
      if (!o.vis) continue;
      const h = o.z;
      if (h > 7) continue;
      const a = 0.42 * Math.pow(1 - h / 7, 2) * Math.min(1, o.pop);
      const r = (0.78 + 0.16 * h) * S * o.sxy;
      ctx.globalAlpha = a;
      ctx.drawImage(this.blob, PX(cam, o.x, o.y) - r, PY(cam, o.x, o.y, 0) - r * sp, 2 * r, 2 * r * sp);
    }
    ctx.globalAlpha = 1;
    const Lx = cam.L[0] / cam.L[2], Ly = cam.L[1] / cam.L[2];
    const pts = new Float64Array(16);
    ctx.fillStyle = 'rgba(92,64,150,0.17)';
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const o = sts[i];
      if (!o.vis) continue;
      const corners = this.corners(o);
      for (let k = 0; k < 8; k++) {
        const x = corners[3 * k], y = corners[3 * k + 1], z = corners[3 * k + 2];
        const gx = x - Lx * z, gy = y - Ly * z;
        pts[2 * k] = PX(cam, gx, gy); pts[2 * k + 1] = PY(cam, gx, gy, 0);
      }
      const hl = hull(pts, 8);
      ctx.moveTo(pts[2 * hl[0]], pts[2 * hl[0] + 1]);
      for (let m = 1; m < hl.length; m++) ctx.lineTo(pts[2 * hl[m]], pts[2 * hl[m] + 1]);
    }
    ctx.fill();
    // impact ring on the table when the last brick is seated
    const rs = t - tBeat;
    if (rs >= 0 && rs < 1.1) {
      const u = rs / 1.1, rr = (4 + 20 * ease.outCubic(u)) * S;
      ctx.strokeStyle = `rgba(255,255,255,${(0.85 * (1 - u) * (1 - u)).toFixed(3)})`;
      ctx.lineWidth = 9 * (1 - u) + 1.5;
      ctx.beginPath(); ctx.ellipse(PX(cam, this.c2.x, this.c2.y), PY(cam, this.c2.x, this.c2.y, 0), rr, rr * sp, 0, 0, TAU); ctx.stroke();
    }
    ctx.restore();

    // ------------------------------------------------ draw list: bricks + dust puffs, back to front
    const items = [];
    for (let i = 0; i < N; i++) {
      const o = sts[i];
      if (!o.vis) continue;
      items.push({ d: DEPTH(cam, o.x, o.y, o.z + 0.5), i, k: 0 });
    }
    const ev = this.events;
    for (let e = 0; e < ev.length; e++) {
      const E = ev[e], s = t - E.t;
      if (s < 0 || s >= PUFF_LIFE) continue;
      const f = (1 - Math.exp(-5 * s)) / 5, rise = E.z + 0.12 + 0.75 * (1 - Math.exp(-2.5 * s));
      for (let m = 0; m < E.dirs.length * 2; m++) {
        const a = E.dirs[m >> 1] + (m & 1 ? 0.42 : -0.42) + 0.12 * (((E.j0 + m) % 3) - 1);
        const sp2 = (2.6 + 0.8 * ((E.j0 + m * 5) % 4) / 3) * E.w;
        const x = E.x + Math.cos(a) * (0.5 + sp2 * f), y = E.y + Math.sin(a) * (0.5 + sp2 * f);
        items.push({ d: DEPTH(cam, x, y, rise) + 0.35, k: 1, x, y, z: rise, s, w: E.w, sz: 0.85 + 0.3 * (((E.j0 + m) * 3) % 4) / 3 });
      }
    }
    items.sort((a, b) => a.d - b.d || a.k - b.k || (a.i || 0) - (b.i || 0));

    const glintPos = lerp(-300, 2300, clamp((t - GLINT0) / (GLINT1 - GLINT0)));
    const glintOn = t > GLINT0 && t < GLINT1;
    for (const it of items) {
      if (it.k === 1) {
        const u = it.s / PUFF_LIFE, r = (0.3 + 0.62 * Math.sqrt(u)) * S * (0.55 + 0.45 * it.w) * it.sz;
        ctx.globalAlpha = 0.9 * Math.pow(1 - u, 1.6) * Math.min(1, u * 9);
        ctx.drawImage(this.puff, PX(cam, it.x, it.y) - r, PY(cam, it.x, it.y, it.z) - r, 2 * r, 2 * r);
        ctx.globalAlpha = 1;
        continue;
      }
      let gl = 0;
      if (glintOn) {
        const o = sts[it.i], X = PX(cam, o.x, o.y), Y = PY(cam, o.x, o.y, o.z);
        { const gq = ((X * 0.8 + Y * 0.6) - glintPos) / 120; gl = Math.exp(-gq * gq); }
      }
      this.drawBrick(ctx, cam, cubes[it.i], sts[it.i], gl);
    }

    // ------------------------------------------------ air: motes in the light, foreground bokeh (parallax)
    for (const m of this.motes) {
      const x = ((m.x + t * 14 * m.sp - turn * 420 * m.k) % 1300 + 1300) % 1300 - 110;
      const y = m.y - t * 10 * m.sp + 9 * Math.sin(t * m.sp + m.ph);
      const a = 0.35 + 0.35 * Math.sin(t * 1.3 * m.sp + m.ph);
      ctx.globalAlpha = a * (0.6 + 0.4 * warm);
      ctx.drawImage(this.glow, x - m.r * 2, y - m.r * 2, m.r * 4, m.r * 4);
    }
    for (const f of this.fg) {
      const x = f.x - turn * 300 * f.k + 10 * Math.sin(t * 0.4 + f.k);
      ctx.globalAlpha = 0.5;
      ctx.drawImage(this.bokeh[f.c], x - f.r, f.y - f.r, 2 * f.r, 2 * f.r);
    }
    ctx.globalAlpha = 1;

    this.drawCopy(ctx, t);

    // vignette
    const vg = ctx.createRadialGradient(540, 900, 520, 540, 900, 1250);
    vg.addColorStop(0, 'rgba(60,40,100,0)'); vg.addColorStop(1, 'rgba(60,40,100,0.22)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  },

  /** 8 world corners of a brick (bit order x=1, y=2, z=4) */
  corners(o) {
    const out = this._cr || (this._cr = new Float64Array(24));
    const hx = 0.5 * o.sxy * o.pop, hz = 0.5 * o.sz * o.pop;
    const cz = o.z + (o.rot ? 0.5 : hz);
    const M = o.rot;
    for (let k = 0; k < 8; k++) {
      const lx = k & 1 ? hx : -hx, ly = k & 2 ? hx : -hx, lz = k & 4 ? hz : -hz;
      if (M) {
        out[3 * k] = o.x + M[0] * lx + M[1] * ly + M[2] * lz;
        out[3 * k + 1] = o.y + M[3] * lx + M[4] * ly + M[5] * lz;
        out[3 * k + 2] = cz + M[6] * lx + M[7] * ly + M[8] * lz;
      } else { out[3 * k] = o.x + lx; out[3 * k + 1] = o.y + ly; out[3 * k + 2] = cz + lz; }
    }
    return out;
  },

  drawBrick(ctx, cam, c, o, glint) {
    const cr = this.corners(o);
    const sx = this._sx || (this._sx = new Float64Array(8)), sy = this._sy || (this._sy = new Float64Array(8));
    for (let k = 0; k < 8; k++) { sx[k] = PX(cam, cr[3 * k], cr[3 * k + 1]); sy[k] = PY(cam, cr[3 * k], cr[3 * k + 1], cr[3 * k + 2]); }
    const M = o.rot, L = cam.L, tc = cam.tc;
    const base = glint > 0.01 ? mixC(c.col, [255, 253, 240], 0.62 * glint) : c.col;
    let topN = null;
    const edge = rgb(base, 0.74);
    for (const f of FACES) {
      let nx = f.n[0], ny = f.n[1], nz = f.n[2];
      if (M) { const a = M[0] * nx + M[1] * ny + M[2] * nz, b = M[3] * nx + M[4] * ny + M[5] * nz, d = M[6] * nx + M[7] * ny + M[8] * nz; nx = a; ny = b; nz = d; }
      const vis = nx * tc[0] + ny * tc[1] + nz * tc[2];
      if (vis <= 1e-4) continue;
      const lam = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      const k = 0.6 + 0.44 * lam;
      ctx.fillStyle = `rgb(${Math.round(clamp(base[0] * k * 0.97 + 6, 0, 255))},${Math.round(clamp(base[1] * k + 4, 0, 255))},${Math.round(clamp(base[2] * Math.min(1.12, k * 1.07) + 8, 0, 255))})`;
      const v = f.v;
      ctx.beginPath();
      ctx.moveTo(sx[v[0]], sy[v[0]]); ctx.lineTo(sx[v[1]], sy[v[1]]); ctx.lineTo(sx[v[2]], sy[v[2]]); ctx.lineTo(sx[v[3]], sy[v[3]]);
      ctx.fill();
      ctx.strokeStyle = edge; ctx.lineWidth = 1;
      ctx.stroke();
      if (f.n[2] === 1) topN = [nx, ny, nz, k];
    }
    // stud on the top face (a short cylinder)
    if (!topN || topN[0] * tc[0] + topN[1] * tc[1] + topN[2] * tc[2] < 0.12) return;
    const sc = o.pop * Math.min(1.15, o.sxy);
    if (!M) {
      const X = (sx[4] + sx[7]) / 2, Y = (sy[4] + sy[7]) / 2;
      const rx = STUD_R * cam.S * sc, ry = rx * cam.sp, hh = STUD_H * cam.S * cam.cp * o.pop;
      ctx.fillStyle = rgb(base, 0.82, 4);
      ctx.beginPath(); ctx.moveTo(X + rx, Y); ctx.ellipse(X, Y, rx, ry, 0, 0, Math.PI); ctx.lineTo(X - rx, Y - hh); ctx.lineTo(X + rx, Y - hh); ctx.fill();
      ctx.fillStyle = rgb(base, topN[3] * 1.04, 14);
      ctx.beginPath(); ctx.ellipse(X, Y - hh, rx, ry, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath(); ctx.ellipse(X - rx * 0.28, Y - hh - ry * 0.3, rx * 0.36, ry * 0.3, 0, 0, TAU); ctx.fill();
      return;
    }
    // rotated: draw the stud in the face's own frame (unit circle → screen by an affine map)
    const cx = (sx[4] + sx[7]) / 2, cy = (sy[4] + sy[7]) / 2;
    const r = STUD_R * sc, S = cam.S;
    const lin = (x, y, z) => [S * (x * cam.ct - y * cam.st), S * ((x * cam.st + y * cam.ct) * cam.sp - z * cam.cp)];
    const a = lin(M[0] * r, M[3] * r, M[6] * r), b = lin(M[1] * r, M[4] * r, M[7] * r), h = lin(M[2] * STUD_H, M[5] * STUD_H, M[8] * STUD_H);
    const det = a[0] * b[1] - a[1] * b[0];
    if (Math.abs(det) < 1e-3) return;
    const ox = (b[1] * h[0] - b[0] * h[1]) / det, oy = (-a[1] * h[0] + a[0] * h[1]) / det;   // offset in unit-circle space
    const ol = Math.hypot(ox, oy) || 1, px = -oy / ol, py = ox / ol;
    ctx.save();
    ctx.setTransform(a[0], a[1], b[0], b[1], cx, cy);
    ctx.fillStyle = rgb(base, 0.82, 4);
    ctx.beginPath();
    ctx.moveTo(1, 0); ctx.arc(0, 0, 1, 0, TAU);
    // side band with the same winding as the arcs
    const q = [px, py, ox + px, oy + py, ox - px, oy - py, -px, -py];
    let area = 0;
    for (let m = 0; m < 4; m++) { const n2 = (m + 1) % 4; area += q[2 * m] * q[2 * n2 + 1] - q[2 * n2] * q[2 * m + 1]; }
    const ord = area > 0 ? [0, 1, 2, 3] : [3, 2, 1, 0];
    ctx.moveTo(q[2 * ord[0]], q[2 * ord[0] + 1]);
    for (let m = 1; m < 4; m++) ctx.lineTo(q[2 * ord[m]], q[2 * ord[m] + 1]);
    ctx.fill();
    ctx.fillStyle = rgb(base, topN[3] * 1.04, 14);
    ctx.beginPath(); ctx.arc(ox, oy, 1, 0, TAU); ctx.fill();
    ctx.restore();
  },

  /** copy: kicker, headline (one accent word), brick counter chip — line-mask entrances, quicker exits */
  drawCopy(ctx, t) {
    ctx.textBaseline = 'alphabetic';
    const line = (parts, y, size, weight, tIn, tOut, color) => {
      if (t < tIn || t > tOut + 0.3) return;
      ctx.font = `${weight} ${size}px ${KR}`;
      ctx.letterSpacing = `${(-0.03 * size).toFixed(1)}px`;
      const widths = parts.map((p) => ctx.measureText(p.s).width);
      const total = widths.reduce((a, b) => a + b, 0);
      let x = 540 - total / 2;
      const out = ease.inCubic(clamp((t - tOut) / 0.3));
      parts.forEach((p, k) => {
        const pin = ease.outExpo(clamp((t - tIn - 0.08 * k) / 0.6));
        const dy = (1 - pin) * size * 1.15 - out * size * 1.15;
        ctx.save();
        ctx.beginPath(); ctx.rect(x - 20, y - size * 1.02, widths[k] + 40, size * 1.32); ctx.clip();
        ctx.fillStyle = p.c || color;
        ctx.fillText(p.s, x, y + dy);
        ctx.restore();
        x += widths[k];
      });
      ctx.letterSpacing = '0px';
    };
    line([{ s: '한 칸, ' }, { s: '또 한 칸' }], 236, 46, 700, 0.25, 3.62, 'rgba(59,52,96,0.82)');
    line([{ s: '쌓은 블록 ' }, { s: '그대로' }], 236, 46, 700, 3.95, 99, 'rgba(59,52,96,0.82)');
    line([{ s: '꿈', c: ACCENT }, { s: '이 ' }, { s: '된다' }], 342, 96, 900, 6.62, 99, INK);

    // counter chip: bricks seated so far (tabular digits), then the same total all the way through
    const chipIn = ease.outBack(clamp((t - 0.45) / 0.45), 1.6);
    if (chipIn <= 0) return;
    let n = 0;
    const lt = this.landTimes;
    while (n < lt.length && lt[n] <= t) n++;
    const digits = String(n).padStart(3, '0');
    const label = t < LIFT0 ? '블록' : '같은 블록';
    ctx.font = `700 36px ${KR}`;
    const lw = ctx.measureText(label).width, cw = ctx.measureText('0').width + 2, uw = ctx.measureText('개').width;
    const w = 44 + lw + 14 + cw * 3 + 6 + uw + 34, h = 70, x0 = 540 - w / 2, y0 = 1490;
    ctx.save();
    ctx.translate(540, y0 + h / 2); ctx.scale(chipIn, chipIn); ctx.translate(-540, -(y0 + h / 2));
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.beginPath(); ctx.roundRect(x0, y0, w, h, h / 2); ctx.fill();
    // little brick icon
    const ix = x0 + 30, iy = y0 + h / 2;
    ctx.fillStyle = rgb(PAL[1], 0.95); ctx.fillRect(ix - 11, iy - 6, 22, 16);
    ctx.fillStyle = rgb(PAL[1], 1.05, 10); ctx.fillRect(ix - 11, iy - 10, 22, 6); ctx.fillRect(ix - 5, iy - 15, 10, 6);
    ctx.fillStyle = INK;
    let x = ix + 22;
    ctx.fillText(label, x, iy + 13); x += lw + 14;
    ctx.fillStyle = ACCENT;
    ctx.textAlign = 'center';
    for (const ch of digits) { ctx.fillText(ch, x + cw / 2, iy + 13); x += cw; }
    ctx.textAlign = 'left';
    ctx.fillStyle = INK;
    ctx.fillText('개', x + 6, iy + 13);
    ctx.restore();
  },
});
