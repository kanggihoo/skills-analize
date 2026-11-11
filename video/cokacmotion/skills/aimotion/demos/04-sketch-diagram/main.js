/*
 * 04 · 손으로 그린 설명 — the water cycle, drawn stroke by stroke on a sketchbook page.
 *
 * Every mark is a STROKE with a time window on one pen schedule:
 *   rough.js (fixed seed) → drawable op-sets (move / bcurveTo / lineTo) → sampled polylines with arc lengths
 *   perfect-freehand        → a point list with pressure; getStroke() of the prefix gives the inked outline
 *   handwriting (font)      → the label is pre-rendered once; the pen wipes it open along the baseline
 * A pen moves at a fixed speed through the strokes in order and lifts between them (travel time ∝ distance),
 * so the schedule — and therefore every frame — is a pure function of t. Per frame: paper → watercolour washes
 * (layered deformed polygons, baked once, blooming from a point) → finished groups from their cached bitmaps →
 * the group being drawn, stroke by stroke up to the pen's arc length → water drops travelling the cycle → pencil.
 */
import rough from 'roughjs';
import { getStroke } from 'perfect-freehand';
import { defineDemo, rand, track, ease, clamp, lerp, ramp } from '../_lib/stage.js';

const D = 10;
const RENDER = new URLSearchParams(location.search).has('render');
const INK = '#2b2c38', RED = '#d4593a', BLUE = '#3f73b8';
const FONT = '"Nanum Pen Script"';

// ---------- canvases ----------
/** an off-screen canvas painted once in setup (CPU raster; never redrawn) */
function offscreen(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  return { c, g: c.getContext('2d', { willReadFrequently: true }) };
}

// ---------- polyline helpers ----------
/** arc-length table of a polyline */
function measure(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, len: cum[cum.length - 1] };
}
/** the first L px of a measured polyline (last point interpolated), and the pen position there */
function prefix(m, L) {
  if (L >= m.len) return m.pts;
  let i = 1;
  while (i < m.cum.length && m.cum[i] < L) i++;
  const a = m.pts[i - 1], b = m.pts[i], k = (L - m.cum[i - 1]) / Math.max(1e-6, m.cum[i] - m.cum[i - 1]);
  const end = a.map((v, j) => v + (b[j] - v) * k);
  return m.pts.slice(0, i).concat([end]);
}
/** rough.js op-set → polylines (a 'move' starts a new one; cubic Béziers sampled) */
function opsToPolylines(ops) {
  const out = [];
  let cur = null, p = [0, 0];
  for (const { op, data } of ops) {
    if (op === 'move') { cur = [[data[0], data[1]]]; out.push(cur); p = [data[0], data[1]]; }
    else if (op === 'lineTo') { cur.push([data[0], data[1]]); p = [data[0], data[1]]; }
    else if (op === 'bcurveTo') {
      const [x1, y1, x2, y2, x, y] = data;
      for (let s = 1; s <= 8; s++) {
        const u = s / 8, v = 1 - u;
        cur.push([v * v * v * p[0] + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x,
          v * v * v * p[1] + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y]);
      }
      p = [x, y];
    }
  }
  return out.filter((l) => l.length > 1);
}
/** Catmull-Rom through control points (open), n samples per span */
function spline(cp, n = 12) {
  const out = [];
  for (let i = 0; i < cp.length - 1; i++) {
    const p0 = cp[Math.max(0, i - 1)], p1 = cp[i], p2 = cp[i + 1], p3 = cp[Math.min(cp.length - 1, i + 2)];
    for (let s = 0; s < n; s++) {
      const t = s / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  out.push(cp[cp.length - 1]);
  return out;
}

// ---------- watercolour: layered, recursively deformed polygons (baked once) ----------
function gauss(r) { const u = Math.max(1e-9, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function deform(poly, depth, amt, r) {
  let p = poly;
  for (let d = 0; d < depth; d++) {
    const q = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      q.push(a, [(a[0] + b[0]) / 2 + gauss(r) * amt * l * 0.25, (a[1] + b[1]) / 2 + gauss(r) * amt * l * 0.25]);
    }
    p = q;
  }
  return p;
}
function watercolor(poly, color, seed, { layers = 36, alpha = 0.045, spread = 0.9, origin }) {
  const r = rand(seed);
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
  const pad = 40, x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad;
  const { c, g } = offscreen(Math.max(...xs) - x0 + pad, Math.max(...ys) - y0 + pad);
  g.translate(-x0, -y0);
  const base = deform(poly, 2, spread * 0.6, r);
  g.fillStyle = color;
  for (let i = 0; i < layers; i++) {
    const layer = deform(base, 3, spread, r);
    g.globalAlpha = alpha;
    g.beginPath(); layer.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  }
  // pigment settles at the rim: a soft, slightly darker edge
  g.globalAlpha = 0.18; g.strokeStyle = color; g.lineWidth = 2.5; g.lineJoin = 'round';
  g.beginPath(); base.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke();
  const o = origin || [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  return { c, x: x0, y: y0, o, R: Math.hypot(Math.max(o[0] - x0, x0 + c.width - o[0]), Math.max(o[1] - y0, y0 + c.height - o[1])) };
}

// ---------- the drawing ----------
/** stroke kinds: 'line' (rough polyline), 'free' (perfect-freehand), 'text' (handwriting wipe) */
const GROUPS = [];
let group = null;
function begin(name) { group = { name, strokes: [], washes: [] }; GROUPS.push(group); return group; }
function lineStroke(pts, { color = INK, width = 2.6, alpha = 0.92, speed = 1700 } = {}) {
  group.strokes.push({ kind: 'line', m: measure(pts), color, width, alpha, speed });
}
function freeStroke(pts, { color = INK, size = 7, thinning = 0.6, speed = 1300, taper = [18, 26], alpha = 1 } = {}) {
  group.strokes.push({ kind: 'free', m: measure(pts), color, size, thinning, speed, taper, alpha });
}
function roughShape(drawable, { color = INK, width = 2.6, fillColor = null, fillWidth = 1.6, fillAlpha = 0.55, speed = 1700, fillSpeed = 3200 } = {}) {
  for (const set of drawable.sets) {
    const isFill = set.type === 'fillSketch';
    for (const pl of opsToPolylines(set.ops)) {
      if (isFill) lineStroke(pl, { color: fillColor, width: fillWidth, alpha: fillAlpha, speed: fillSpeed });
      else lineStroke(pl, { color, width, speed });
    }
  }
}
function text(str, x, y, size, { color = INK, speed = 620 } = {}) {
  const font = `400 ${size}px ${FONT}`;
  const meas = offscreen(4, 4).g; meas.font = font;
  const w = Math.ceil(meas.measureText(str).width) + 8, h = Math.ceil(size * 1.35);
  const { c, g } = offscreen(w, h);
  g.font = font; g.fillStyle = color; g.textBaseline = 'alphabetic';
  g.fillText(str, 4, size * 1.02);
  group.strokes.push({ kind: 'text', c, x: x - 4, y: y - size * 1.02, w, h, size, m: { len: w }, speed });
}
function arrowHead(tip, from, size = 26, color = RED) {
  const a = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
  for (const s of [-1, 1]) {
    const b = a + Math.PI + s * 0.5;
    freeStroke([[tip[0] + Math.cos(b) * size, tip[1] + Math.sin(b) * size], tip], { color, size: 7, speed: 900, taper: [10, 0] });
  }
}

function build(gen) {
  const seedOf = (() => { let s = 100; return () => ++s; })();
  const R = (o) => ({ roughness: 1.3, bowing: 1.2, seed: seedOf(), ...o });

  // 1 · title
  begin('title');
  text('물의 순환', 84, 250, 132, { speed: 560 });
  freeStroke(spline([[80, 292], [240, 284], [420, 290], [540, 280]], 10), { color: RED, size: 9, speed: 1500 });
  text('비 한 방울이 다시 바다로 돌아오기까지', 92, 352, 50, { color: '#5a5b66', speed: 1500 });

  // 2 · the sea
  begin('sea');
  const surf = [];
  for (let x = 30; x <= 1050; x += 40) surf.push([x, 1405 + 12 * Math.sin(x * 0.03) + 6 * Math.sin(x * 0.011 + 1)]);
  roughShape(gen.curve(surf, R({ roughness: 0.9 })), { speed: 2400 });
  for (const [x0, y0, n] of [[120, 1470, 5], [430, 1500, 6], [760, 1462, 5], [260, 1560, 4], [640, 1580, 5]]) {
    const w = [];
    for (let i = 0; i <= n * 4; i++) w.push([x0 + i * 11, y0 + 7 * Math.sin(i * Math.PI / 2)]);
    freeStroke(w, { color: BLUE, size: 4.5, speed: 1800, taper: [12, 12] });
  }
  group.washes.push({ ...watercolor([...surf, [1050, 1625], [30, 1625]], '#5f93cc', 11, { origin: [300, 1420] }), after: group.strokes.length });
  text('바다', 860, 1580, 72, { speed: 700 });

  // 3 · the sun
  begin('sun');
  roughShape(gen.circle(880, 330, 150, R({ roughness: 1.1 })));
  for (let k = 0; k < 11; k++) {
    const a = -Math.PI * 0.95 + k * (Math.PI * 1.15 / 10);
    freeStroke([[880 + Math.cos(a) * 98, 330 + Math.sin(a) * 98], [880 + Math.cos(a) * 138, 330 + Math.sin(a) * 138]], { color: '#e09a2c', size: 6.5, speed: 1600, taper: [4, 14] });
  }
  const sunPoly = []; for (let k = 0; k < 24; k++) sunPoly.push([880 + 74 * Math.cos(k / 24 * Math.PI * 2), 330 + 74 * Math.sin(k / 24 * Math.PI * 2)]);
  group.washes.push({ ...watercolor(sunPoly, '#f1b347', 21, { spread: 0.6 }), after: group.strokes.length });

  // 4 · evaporation: three rising squiggles from the sea
  begin('vapour');
  for (const [x, top, ph] of [[215, 930, 0], [295, 900, 1.7], [375, 940, 3.1]]) {
    const pts = [];
    for (let y = 1370; y >= top; y -= 10) pts.push([x + 13 * Math.sin((1370 - y) / 48 + ph), y]);
    freeStroke(pts, { color: '#7d8fa6', size: 5.5, speed: 1700, taper: [6, 4] });
    arrowHead(pts[pts.length - 1], pts[pts.length - 4], 20, '#7d8fa6');
  }
  text('① 증발', 410, 1000, 68, { color: RED, speed: 800 });
  text('바닷물이 데워져 하늘로', 412, 1050, 40, { color: '#5a5b66', speed: 1500 });

  // 5 · condensation: the cloud
  begin('cloud');
  const cloudD = 'M250 795 C200 795 190 720 250 705 C245 635 330 605 380 650 C410 575 540 575 560 650 C620 620 700 660 680 720 C730 740 715 800 655 798 Z';
  roughShape(gen.path(cloudD, R({ roughness: 1.0, bowing: 0.8 })));
  const cloudPoly = [[255, 788], [215, 750], [255, 712], [270, 660], [340, 640], [385, 660], [430, 608], [520, 608], [555, 658], [620, 645], [668, 685], [672, 725], [700, 760], [650, 790]];
  group.washes.push({ ...watercolor(cloudPoly, '#9fb1c6', 31, { spread: 0.8 }), after: group.strokes.length });
  text('② 응결', 745, 700, 68, { color: RED, speed: 800 });
  text('모여서 구름으로', 748, 748, 40, { color: '#5a5b66', speed: 1500 });

  // 6 · precipitation: rain on the mountains
  begin('mountain');
  const mtn = [[595, 1195], [690, 1020], [760, 948], [820, 1030], [880, 982], [965, 1070], [1045, 1195]];
  roughShape(gen.polygon(mtn, R({ fill: '#6e9a63', fillStyle: 'hachure', hachureAngle: 60, hachureGap: 13, fillWeight: 1.4 })), { fillColor: '#4f7c48', fillSpeed: 4200 });
  freeStroke([[722, 990], [742, 1004], [760, 988], [778, 1006], [800, 994]], { size: 5, speed: 1200 });
  group.washes.push({ ...watercolor(mtn, '#8db27c', 41, { spread: 0.5, origin: [760, 1000] }), after: group.strokes.length });
  for (let k = 0; k < 10; k++) {
    const x = 540 + k * 15 + (k % 3) * 6, y = 830 + (k % 4) * 28;
    freeStroke([[x, y], [x - 11, y + 46]], { color: BLUE, size: 5, speed: 1400, taper: [2, 10] });
  }
  text('③ 강수', 790, 880, 68, { color: RED, speed: 800 });
  text('비로 내려요', 792, 928, 40, { color: '#5a5b66', speed: 1500 });

  // 7 · runoff: the river back to the sea
  begin('river');
  const river = [[830, 1132], [760, 1200], [660, 1236], [575, 1300], [500, 1360], [440, 1404]];
  const bankL = river.map(([x, y], i) => [x - 14 + i * 1.5, y - 12 + i]), bankR = river.map(([x, y], i) => [x + 14 + i * 2, y + 12 + i * 2]);
  roughShape(gen.curve(bankL, R({ roughness: 0.8 })), { speed: 2000 });
  roughShape(gen.curve(bankR, R({ roughness: 0.8 })), { speed: 2000 });
  const rv = spline(river, 10);
  group.washes.push({ ...watercolor(bankL.concat(bankR.slice().reverse()), '#6ea6d6', 51, { spread: 0.35, layers: 26, alpha: 0.06, origin: river[0] }), after: group.strokes.length });
  text('④ 흐름', 440, 1250, 68, { color: RED, speed: 800 });
  text('강 따라 바다로', 442, 1298, 40, { color: '#5a5b66', speed: 1500 });

  // 8 · the cycle: four red arrows around the loop (the climax)
  begin('cycle');
  const loop = spline([[150, 1360], [105, 1100], [112, 860], [180, 640], [370, 470], [640, 440], [880, 520], [1000, 680], [1040, 900], [1025, 1120], [930, 1300], [700, 1425], [450, 1458], [250, 1432], [150, 1360]], 14);
  const lm = measure(loop);
  const arcs = [[0.02, 0.22], [0.27, 0.47], [0.52, 0.72], [0.77, 0.97]];
  for (const [a, b] of arcs) {
    const seg = prefix(lm, lm.len * b).filter((p, i) => lm.cum[Math.min(i, lm.cum.length - 1)] >= lm.len * a);
    freeStroke(seg, { color: RED, size: 9, speed: 2600, taper: [10, 0] });
    arrowHead(seg[seg.length - 1], seg[seg.length - 5], 30, RED);
  }
  return lm;
}

/**
 * lay every stroke on one pen timeline: each stroke takes length / speed, each lift costs a travel time that
 * grows with the jump, groups pause briefly between them. The whole timeline is then scaled so the pen finishes
 * at END — the relative rhythm (fast hachure, slow handwriting, quick lifts) is kept.
 */
function schedule(START, END) {
  const steps = [];                                     // [stroke | null (pause), duration]
  let pen = [540, 1900];
  for (const gr of GROUPS) {
    steps.push([null, 0.12]);
    for (const s of gr.strokes) {
      steps.push([null, Math.min(0.16, 0.025 + Math.hypot(penStart(s)[0] - pen[0], penStart(s)[1] - pen[1]) / 6500)]);
      steps.push([s, Math.max(0.04, s.m.len / s.speed)]);
      pen = penEnd(s);
    }
  }
  const k = (END - START) / steps.reduce((a, [, d]) => a + d, 0);
  let t = START;
  for (const [s, d] of steps) { if (s) { s.t0 = t; s.t1 = t + d * k; } t += d * k; }
  for (const gr of GROUPS) {
    gr.t0 = gr.strokes[0].t0;
    gr.t1 = gr.strokes[gr.strokes.length - 1].t1;
    for (const w of gr.washes) { w.t0 = gr.strokes[Math.max(0, w.after - 1)].t1; w.t1 = w.t0 + 0.75; }
  }
  return k;
}

/** draw stroke s up to arc length L (or entirely) */
function drawStroke(g, s, L = Infinity) {
  if (s.kind === 'text') {
    const w = Math.min(s.w, L);
    if (w > 0.5) g.drawImage(s.c, 0, 0, w, s.h, s.x, s.y, w, s.h);
    return;
  }
  const pts = prefix(s.m, L);
  if (s.kind === 'line') {
    g.globalAlpha = s.alpha; g.strokeStyle = s.color; g.lineWidth = s.width; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    g.globalAlpha = 1;
    return;
  }
  const done = L >= s.m.len;
  const outline = getStroke(pts, { size: s.size, thinning: s.thinning, smoothing: 0.5, streamline: 0.35, simulatePressure: true,
    start: { taper: s.taper[0] }, end: { taper: done ? s.taper[1] : 0 }, last: done });
  if (outline.length < 3) return;
  g.globalAlpha = s.alpha; g.fillStyle = s.color;
  g.beginPath(); outline.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  g.globalAlpha = 1;
}
/** where the pen is at time t (on a stroke, or travelling between two) */
function penAt(t) {
  let prev = null;
  for (const gr of GROUPS) for (const s of gr.strokes) {
    if (t < s.t0) {
      if (!prev) return null;
      const a = penEnd(prev), b = penStart(s), k = ease.inOutCubic(clamp((t - prev.t1) / (s.t0 - prev.t1)));
      return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k), lift: Math.sin(Math.PI * k) };
    }
    if (t <= s.t1) {
      const L = s.m.len * (t - s.t0) / (s.t1 - s.t0);
      if (s.kind === 'text') return { x: s.x + 4 + L, y: s.y + s.size * (0.75 + 0.12 * Math.sin(L / 9)), lift: 0 };
      const p = prefix(s.m, L), e = p[p.length - 1];
      return { x: e[0], y: e[1], lift: 0 };
    }
    prev = s;
  }
  if (!prev) return null;
  const e = penEnd(prev);
  return { x: e[0], y: e[1], lift: 0 };
}
const penStart = (s) => (s.kind === 'text' ? [s.x + 4, s.y + s.size * 0.8] : s.m.pts[0]);
const penEnd = (s) => (s.kind === 'text' ? [s.x + s.w, s.y + s.size * 0.8] : s.m.pts[s.m.pts.length - 1]);

defineDemo({
  id: '04-sketch-diagram',
  title: '손으로 그린 설명',
  tech: 'rough.js + perfect-freehand · 손그림 렌더링',
  duration: D,
  background: '#efe8da',
  async setup({ stage, W, H }) {
    // every glyph that will be written must be loaded before anything is pre-rendered
    const allText = '물의 순환 비 한 방울이 다시 바다로 돌아오기까지 바다 ① 증발 바닷물이 데워져 하늘로 ② 응결 모여서 구름으로 ③ 강수 비로 내려요 ④ 흐름 강 따라 바다로';
    await document.fonts.load(`400 64px ${FONT}`, allText);

    // the visible canvas: CPU raster only for the headless check (a GPU browser draws it faster on the GPU)
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    cv.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px`;
    stage.appendChild(cv);
    this.g = cv.getContext('2d', RENDER ? { willReadFrequently: true } : undefined);

    // paper: warm sketchbook stock with tooth, a faint dot grid and the desk lamp's falloff
    {
      const { c, g } = offscreen(W, H);
      g.fillStyle = '#f3ede0'; g.fillRect(0, 0, W, H);
      const img = g.getImageData(0, 0, W, H), r = rand(3);
      for (let i = 0; i < W * H; i++) { const n = (r() - 0.5) * 9; img.data[i * 4] += n; img.data[i * 4 + 1] += n; img.data[i * 4 + 2] += n - 1; }
      g.putImageData(img, 0, 0);
      g.fillStyle = 'rgba(120,140,170,.16)';
      for (let y = 60; y < 1680; y += 40) for (let x = 40; x < W; x += 40) g.fillRect(x - 1, y - 1, 2, 2);
      const lamp = g.createRadialGradient(300, 240, 50, 420, 700, 1500);
      lamp.addColorStop(0, 'rgba(255,248,230,.35)'); lamp.addColorStop(0.6, 'rgba(255,240,215,0)'); lamp.addColorStop(1, 'rgba(70,50,30,.22)');
      g.fillStyle = lamp; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(40,30,20,.85)'; g.fillRect(0, 1690, W, H - 1690);         // the desk below the page edge
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 1690, W, 10);
      this.paper = c;
    }

    this.loop = build(rough.generator());
    schedule(0.25, 8.3);

    // every finished group is cached once, cropped to its bounds: per frame it costs one small drawImage
    // instead of re-stroking all its marks
    for (const gr of GROUPS) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const s of gr.strokes) {
        const pts = s.kind === 'text' ? [[s.x, s.y], [s.x + s.w, s.y + s.h]] : s.m.pts;
        for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      }
      x0 = Math.floor(x0 - 24); y0 = Math.floor(y0 - 24);
      const { c, g } = offscreen(x1 - x0 + 48, y1 - y0 + 48);
      g.translate(-x0, -y0);
      for (const s of gr.strokes) drawStroke(g, s);
      Object.assign(gr, { cache: c, cx: x0, cy: y0 });
    }
    this.drops = Array.from({ length: 7 }, (_, i) => i / 7);
  },

  frame(t) {
    const g = this.g;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.drawImage(this.paper, 0, 0);

    // washes bloom outward from their origin, multiplied into the paper like pigment
    g.globalCompositeOperation = 'multiply';
    for (const gr of GROUPS) for (const w of gr.washes) {
      const k = ease.outCubic(clamp((t - w.t0) / (w.t1 - w.t0)));
      if (k <= 0) continue;
      if (k >= 1) { g.drawImage(w.c, w.x, w.y); continue; }
      g.save();
      g.beginPath(); g.arc(w.o[0], w.o[1], w.R * k, 0, Math.PI * 2); g.clip();
      g.globalAlpha = 0.35 + 0.65 * k;
      g.drawImage(w.c, w.x, w.y);
      g.restore();
    }
    g.globalCompositeOperation = 'source-over';

    // ink: finished groups from cache, the current one stroke by stroke
    for (const gr of GROUPS) {
      if (t < gr.t0) continue;
      if (t >= gr.t1) { g.drawImage(gr.cache, gr.cx, gr.cy); continue; }
      for (const s of gr.strokes) {
        if (t < s.t0) break;
        drawStroke(g, s, t >= s.t1 ? Infinity : s.m.len * (t - s.t0) / (s.t1 - s.t0));
      }
    }

    // afterglow: drops of water travel round the cycle
    const dA = ramp(t, 8.6, 9.1) * (1 - ramp(t, 9.55, 9.9));
    if (dA > 0) {
      for (const d of this.drops) {
        const u = (d + (t - 8.6) * 0.16) % 1, L = this.loop.len * u;
        const p = prefix(this.loop, L), e = p[p.length - 1], f = p[Math.max(0, p.length - 3)];
        const a = Math.atan2(e[1] - f[1], e[0] - f[0]);
        g.save(); g.translate(e[0], e[1]); g.rotate(a + Math.PI / 2); g.globalAlpha = dA;
        g.fillStyle = '#3d7cc9';
        g.beginPath(); g.moveTo(0, 13); g.bezierCurveTo(10, 3, 9, -9, 0, -9); g.bezierCurveTo(-9, -9, -10, 3, 0, 13); g.fill();
        g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(-2.5, -3, 2, 3, 0, 0, Math.PI * 2); g.fill();
        g.restore();
      }
    }

    // the pencil: follows the pen, lifts (bigger, softer shadow) between strokes, leaves at the end
    const p = penAt(t);
    if (p) {
      const away = ease.inOutCubic(ramp(t, 8.55, 9.3));
      const x = lerp(p.x, 1180, away), y = lerp(p.y, 1500, away), lift = p.lift + away * 2;
      this.pencil(g, x, y, lift);
    }

    // the loop: the page fades back to blank for the jump to t = 0
    const fade = ramp(t, D - 0.4, D);
    if (fade > 0) { g.globalAlpha = fade; g.drawImage(this.paper, 0, 0); g.globalAlpha = 1; }
  },

  pencil(g, x, y, lift) {
    const ang = -2.3, L = 300;
    g.save();
    // shadow on the paper, offset by the light and by how high the pencil is lifted
    g.translate(x + 14 + lift * 16, y + 10 + lift * 14);
    g.rotate(ang);
    g.fillStyle = `rgba(40,30,20,${(0.22 - lift * 0.06).toFixed(3)})`;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(34, -9); g.lineTo(L, -11); g.lineTo(L, 11); g.lineTo(34, 9); g.closePath(); g.fill();
    g.restore();
    g.save();
    g.translate(x, y - lift * 10);
    g.rotate(ang);
    // graphite tip, shaved wood cone, painted hexagonal body (three faces), ferrule and eraser
    g.fillStyle = '#2b2c38'; g.beginPath(); g.moveTo(0, 0); g.lineTo(12, -3.2); g.lineTo(12, 3.2); g.closePath(); g.fill();
    g.fillStyle = '#e8c79a'; g.beginPath(); g.moveTo(12, -3.2); g.lineTo(38, -10); g.lineTo(38, 10); g.lineTo(12, 3.2); g.closePath(); g.fill();
    g.fillStyle = '#e2b45a'; g.fillRect(38, -10, 210, 20);
    g.fillStyle = '#f0c96e'; g.fillRect(38, -10, 210, 6);
    g.fillStyle = '#c99a42'; g.fillRect(38, 4, 210, 6);
    g.fillStyle = '#b9bcc4'; g.fillRect(248, -10, 22, 20);
    g.fillStyle = '#9a9ca5'; g.fillRect(253, -10, 3, 20); g.fillRect(262, -10, 3, 20);
    g.fillStyle = '#d98a8a'; g.fillRect(270, -10, 26, 20);
    g.restore();
  },
});
