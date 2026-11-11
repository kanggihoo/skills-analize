/*
 * 52 · 코드로 짠 한글 — a Hangul typeface that exists only as code (face.js), set on a Bauhaus/Swiss sheet.
 * Every letter on the sheet — the hero "한글", the sentence, the tiny labels and figures — is generated each
 * frame from stroke skeletons by face.js; no font file draws the artwork (only the harness caption is Pretendard).
 *
 * Story (10 s):
 *   0.1  하늘 · 땅 · 사람 — a vermilion dot, a horizontal and a vertical hairline (the three primitives the
 *        Hangul vowels were built from) unfold into a blueprint: two em squares, a 10×10 grid, diagonals,
 *        compass circles, nodes and coordinates.
 *   1.15 ㅎ ㅏ ㄴ ㄱ ㅡ ㄹ fly in as hairline skeletons, morph from a neutral square into their slots
 *        (the final ㄹ squashes into its wide box) and snap into "한글"; the composition boxes 초·중·종 flash.
 *   3.0  the parameters sweep on six sliders: weight hairline → black, contrast, corners square → round,
 *        terminals flat → round → brush, width condensed → extended, stencil gaps.
 *   5.85 "한글" rises to the head of the sheet, the sliders fold into a readout, and the sentence
 *        "바람이 분다 / 살아야겠다" writes itself in stroke order.
 *   6.95 the wind: a parameter wave (weight, width, roundness, brush, lean) runs through all twelve syllables,
 *        plotted as a curve at the foot of the sheet; a softer echo follows.
 *   8.25 the dot becomes the sun, the header sets, everything settles into a still poster.
 */
import { defineDemo, track, ease, clamp, lerp, smooth, rand } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { syllable, descUnits, glyphUnits, renderUnits, newSink, layout, weightFor } from './face.js';

const D = 10;
const PAPER = [239, 233, 219];
const PAPER_CSS = 'rgb(239,233,219)';
const INK = '#181613', VERM = '#df432a';
const ink = (a) => `rgba(24,22,19,${clamp(a).toFixed(3)})`;
const verm = (a) => `rgba(223,67,42,${clamp(a).toFixed(3)})`;
const SQ = (x) => x * x;

// ---------------------------------------------------------------- the sheet
const M = 84, RIGHT = 1080 - 84;      // margins
const HERO = 430, SENT = 150;          // em sizes (px)
const Y_BUILD = 520, Y_POSTER = 190;   // hero em-box top while building / on the poster
const BAND = 1672;                     // black base band (the caption sits on it)
const DISC = [790, 1180, 215];         // the sun on the poster
const GRAPH_Y = 1556;
const LINES = [{ str: '바람이 분다', y: 770 }, { str: '살아야겠다', y: 940 }];
const ORDER = ['한', '글', ...'바람이분다살아야겠다'];   // reading order: the wind's path and the graph's nodes

// ---------------------------------------------------------------- time helpers
const k01 = (t, a, b) => clamp((t - a) / (b - a));
const sm = (t, a, b) => smooth(k01(t, a, b));
const oc = (t, a, b) => ease.outCubic(k01(t, a, b));
const ob = (t, a, b, c = 1.70158) => (t <= a ? 0 : t >= b ? 1 : ease.outBack((t - a) / (b - a), c));
const back = (c) => (p) => ease.outBack(p, c);
const inOutSine = (p) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(p));

// ---------------------------------------------------------------- the parameter sweep (the face's axes over time)
const T = {
  wt: track([[0, 0.06], [3.0, 0.06], [3.1, 0.02, ease.outCubic], [3.62, 1.0], [5.55, 1.0], [5.95, 0.70]]),
  ct: track([[0, 0], [3.62, 0], [3.98, 0.72], [5.55, 0.72], [5.95, 0.42]]),
  rd: track([[0, 0], [4.00, 0], [4.36, 1.0], [5.55, 1.0], [5.95, 0.50]]),
  tm: track([[0, 0], [4.40, 0], [4.60, 1.0], [4.86, 2.0], [5.55, 2.0], [5.95, 1.30]]),
  wd: track([[0, 1], [4.90, 1], [5.07, 0.76], [5.27, 1.16, back(1.2)], [5.44, 1.0]]),
  st: track([[0, 0], [5.40, 0], [5.52, 1, ease.outCubic], [5.70, 1], [5.84, 0]]),
};
const baseP = (t) => ({ wt: T.wt(t), ct: T.ct(t), rd: T.rd(t), tm: T.tm(t), wd: T.wd(t), st: T.st(t) });
const FINAL = baseP(D);
const SLIDERS = [
  { key: 'wt', name: '두께', norm: (v) => v },
  { key: 'ct', name: '대비', norm: (v) => v },
  { key: 'rd', name: '둥글기', norm: (v) => v },
  { key: 'tm', name: '맺음', norm: (v) => v / 2 },
  { key: 'wd', name: '너비', norm: (v) => (v - 0.7) / 0.6 },
  { key: 'st', name: '틈', norm: (v) => v },
];

// the wind: a gaussian crest travelling along the reading order, then a softer echo
function wind(t, i) {
  const c1 = lerp(-2, 13.5, k01(t, 6.95, 8.35)), c2 = lerp(-2.5, 13.5, k01(t, 7.55, 8.75));
  const e1 = sm(t, 6.9, 7.1) * (1 - sm(t, 8.15, 8.4)), e2 = 0.42 * sm(t, 7.5, 7.7) * (1 - sm(t, 8.55, 8.8));
  return e1 * Math.exp(-SQ((i - c1) / 1.25)) + e2 * Math.exp(-SQ((i - c2) / 1.6));
}
const windP = (P, a) => ({ wt: P.wt + 0.30 * a, ct: Math.max(0, P.ct - 0.12 * a), rd: clamp(P.rd + 0.45 * a), tm: Math.min(2, P.tm + 0.6 * a), wd: P.wd + 0.16 * a, st: P.st });

// the hero's place: centred on the vertical hairline while building, flush-left at the head of the poster after
const moveK = (t) => ease.inOutCubic(k01(t, 5.9, 6.6));
const heroY = track([[0, Y_BUILD], [5.85, Y_BUILD], [5.98, Y_BUILD + 12, ease.outCubic], [6.55, Y_POSTER - 10], [6.8, Y_POSTER]]);
const gridA = track([[0, 1], [5.85, 1], [6.65, 0.5], [8.6, 0.5], [9.2, 0.26]]);
const skelA = track([[0, 1], [3.0, 1], [3.6, 0.9], [5.4, 0.9], [5.9, 0]]);

// the jamo of "한글": slot, landing time, where they fly in from (em, relative to the slot), turn, scale
const FLIGHT = 0.5;
const FLY = [
  { s: 0, slot: 'cho', land: 1.65, off: [-0.55, -0.50], rot: -28, sc: 1.5 },
  { s: 0, slot: 'jung', land: 1.90, off: [0.95, -0.30], rot: 18, sc: 1.35 },
  { s: 0, slot: 'jong', land: 2.15, off: [-0.35, 0.80], rot: 12, sc: 1.4 },
  { s: 1, slot: 'cho', land: 2.40, off: [0.45, -0.80], rot: -20, sc: 1.45 },
  { s: 1, slot: 'jung', land: 2.65, off: [0.85, 0.45], rot: 24, sc: 1.3 },
  { s: 1, slot: 'jong', land: 2.90, off: [-0.30, 0.85], rot: -16, sc: 1.5 },
];
const SLOT_NAME = { cho: '초', jung: '중', jong: '종' };

/** em-space affine: about c, turned by rot (deg), scaled by sc, moved by off */
function animAffine(c, off, rot, sc) {
  const r = rot * Math.PI / 180, ca = Math.cos(r) * sc, sa = Math.sin(r) * sc;
  return [ca, sa, -sa, ca, c[0] + off[0] - (ca * c[0] - sa * c[1]), c[1] + off[1] - (sa * c[0] + ca * c[1])];
}

// ---------------------------------------------------------------- drawing helpers
function fillSink(g, sink, color, alpha = 1) {
  if (!sink.fill.length || alpha <= 0.002) return;
  g.beginPath();
  for (const c of sink.fill) { g.moveTo(c[0], c[1]); for (let i = 2; i < c.length; i += 2) g.lineTo(c[i], c[i + 1]); }
  g.globalAlpha = alpha; g.fillStyle = color; g.fill('nonzero'); g.globalAlpha = 1;
}
function cutBands(g, bands) {
  if (!bands.length) return;
  g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
  g.beginPath();
  for (const b of bands) { g.moveTo(b[0], b[1]); g.lineTo(b[2], b[3]); g.lineTo(b[4], b[5]); g.lineTo(b[6], b[7]); }
  g.fill(); g.restore();
}
function drawSkel(g, sink, alpha, { nodes = true, width = 1.3 } = {}) {
  if (alpha <= 0.003 || !sink.skel.length) return;
  g.save(); g.globalAlpha = alpha; g.strokeStyle = VERM; g.lineWidth = width; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath();
  for (const s of sink.skel) {
    const p = s.pts; g.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]);
    if (s.closed) g.lineTo(p[0][0], p[0][1]);
  }
  g.stroke();
  if (nodes) {
    g.lineWidth = 1.2;
    for (const [x, y, k] of sink.nodes) {
      if (k === 0) { g.fillStyle = VERM; g.fillRect(x - 3.5, y - 3.5, 7, 7); }
      else if (k === 1) { g.fillStyle = PAPER_CSS; g.fillRect(x - 4.5, y - 4.5, 9, 9); g.strokeRect(x - 4.5, y - 4.5, 9, 9); }
      else { g.beginPath(); g.moveTo(x - 7, y); g.lineTo(x + 7, y); g.moveTo(x, y - 7); g.lineTo(x, y + 7); g.stroke(); }
    }
  }
  g.restore();
}
function hline(g, x0, x1, y) { g.moveTo(x0, y); g.lineTo(x1, y); }
function vline(g, x, y0, y1) { g.moveTo(x, y0); g.lineTo(x, y1); }

// small text set in the generated face, cached as Path2D (static parameters tuned for ~1.9 px stems)
const labCache = new Map();
function label(str, em) {
  const key = `${str}|${em}`;
  let L = labCache.get(key);
  if (!L) {
    const P = { wt: weightFor(1.9, em), ct: 0.18, rd: 0.35, tm: 1, wd: 1, st: 0 };
    const lay = layout(str, P, 0.03);
    const sink = newSink();
    for (const it of lay.items) renderUnits(it.g.units, P, { x: it.x * em, y: 0, s: em }, sink);
    const path = new Path2D();
    for (const c of sink.fill) { path.moveTo(c[0], c[1]); for (let i = 2; i < c.length; i += 2) path.lineTo(c[i], c[i + 1]); }
    L = { path, w: lay.adv * em };
    labCache.set(key, L);
  }
  return L;
}
function drawLabel(g, str, em, x, y, color, alpha = 1, { scale = 1, align = 'left' } = {}) {
  if (alpha <= 0.003) return;
  const L = label(str, em), w = L.w * scale;
  const xx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  g.save(); g.translate(xx, y); if (scale !== 1) g.scale(scale, scale);
  g.globalAlpha = alpha; g.fillStyle = color; g.fill(L.path); g.restore();
}

defineDemo({
  id: '52-parametric-hangul',
  title: '코드로 짠 한글',
  tech: '파라메트릭 글꼴 · 한글 모아쓰기 규칙 · 획 골격 오프셋',
  duration: D,
  background: PAPER_CSS,
  async setup(api) {
    // the caption is the only text not drawn by face.js
    await fontReady('800 52px "Pretendard Variable"', '코드로 짠 한글 파라메트릭 글꼴 모아쓰기 규칙 획 골격 오프셋');
    const attrs = api.headless ? { willReadFrequently: true } : undefined;
    const g0 = api.canvas({ z: 0, attrs }).ctx;   // paper, blueprint, sun
    const g1 = api.canvas({ z: 1, attrs }).ctx;   // the type (stencil cuts erase only here)
    const g2 = api.canvas({ z: 2, attrs }).ctx;   // skeletons, diagram, sliders, labels, base band

    // paper: warm cream, a faint grain and a soft vignette, baked once
    const paper = document.createElement('canvas');
    paper.width = 1080; paper.height = 1920;
    {
      const pg = paper.getContext('2d');
      const img = pg.createImageData(1080, 1920), px = img.data, r = rand(52);
      for (let y = 0; y < 1920; y++) {
        const dy = (y - 860) / 1150;
        for (let x = 0; x < 1080; x++) {
          const dx = (x - 540) / 620, sh = 1 - 0.05 * (dx * dx + dy * dy), n = (r() + r() - 1) * 4.2;
          const i = (y * 1080 + x) * 4;
          px[i] = PAPER[0] * sh + n; px[i + 1] = PAPER[1] * sh + n; px[i + 2] = PAPER[2] * sh + n; px[i + 3] = 255;
        }
      }
      pg.putImageData(img, 0, 0);
    }

    // the hero's jamo: landed units, slot centres, the neutral square they fly in as
    const HS = ['한', '글'].map((ch) => syllable(ch));
    for (const f of FLY) {
      f.desc = HS[f.s].descs.find((d) => d.slot === f.slot);
      f.units = descUnits(f.desc);
      const b = f.desc.box;
      f.c = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
      f.free = [f.c[0] - 0.24, f.c[1] - 0.24, f.c[0] + 0.24, f.c[1] + 0.24];
      f.fade = track([[f.land, 1], [3.1, 0.55], [5.0, 0.55], [5.85, 0]]);
    }
    // optical flush-left: where the ink of the first glyph starts at the poster's parameters
    const inkLeft = (ch, em) => { const s = newSink(); renderUnits(glyphUnits(ch).units, FINAL, { x: 0, y: 0, s: em }, s); return s.ink[0]; };
    const X_POSTER = M - inkLeft('한', HERO);
    const lineX = LINES.map((L) => M - inkLeft(Array.from(L.str)[0], SENT));

    // ------------------------------------------------------------------ per frame
    this.render = (t) => {
      const P = baseP(t);
      const mk = moveK(t);
      const adv = HERO * P.wd;
      const x0 = lerp(540 - adv, X_POSTER, mk), y0 = heroY(t);
      const cx = x0 + adv, cy = y0 + HERO / 2;            // the 사람 line (shared edge) and the 땅 line (em centre)
      const gA = gridA(t);

      // ============ paper + blueprint
      g0.globalAlpha = 1; g0.globalCompositeOperation = 'source-over';
      g0.drawImage(paper, 0, 0);
      g0.lineWidth = 1;
      const q = (ts, dur = 0.32) => oc(t, ts, ts + dur);
      // 땅 and 사람: the first two hairlines, they become the em centre line and the shared edge
      {
        const h = oc(t, 0.25, 0.75), v = oc(t, 0.40, 0.90);
        g0.strokeStyle = ink(0.55 * gA); g0.beginPath();
        if (h > 0) hline(g0, cx - (cx - 40) * h, cx + (1040 - cx) * h, cy);
        if (v > 0) vline(g0, cx, cy - (HERO / 2 + 60) * v, cy + (HERO / 2 + 60) * v);
        g0.stroke();
      }
      // em guides across the sheet (em top and bottom), from the centre outwards
      {
        const p = q(0.62, 0.45);
        if (p > 0) {
          g0.strokeStyle = ink(0.16 * gA); g0.beginPath();
          for (const y of [y0, y0 + HERO]) hline(g0, cx - cx * p, cx + (1080 - cx) * p, y);
          g0.stroke();
        }
      }
      for (let bi = 0; bi < 2; bi++) {
        const bx = x0 + bi * adv, by = y0, w = adv, h = HERO, o = 0.08 * bi;
        // 10 × 10 design grid
        g0.strokeStyle = ink(0.12 * gA); g0.beginPath();
        for (let j = 1; j < 10; j++) {
          const pv = q(0.86 + 0.025 * Math.abs(j - 5) + o), ph = q(0.92 + 0.025 * Math.abs(j - 5) + o);
          if (pv > 0) vline(g0, bx + w * j / 10, by, by + h * pv);
          if (ph > 0) hline(g0, bx, bx + w * ph, by + h * j / 10);
        }
        g0.stroke();
        // diagonals
        const pd = q(1.12 + o, 0.4);
        if (pd > 0) {
          g0.strokeStyle = ink(0.10 * gA); g0.beginPath();
          g0.moveTo(bx, by); g0.lineTo(bx + w * pd, by + h * pd);
          g0.moveTo(bx + w, by); g0.lineTo(bx + w - w * pd, by + h * pd);
          g0.stroke();
        }
        // the em frame, drawn like a pen going round
        g0.strokeStyle = ink(0.55 * gA); g0.beginPath();
        const f1 = q(0.70 + o, 0.2), f2 = q(0.80 + o, 0.2), f3 = q(0.90 + o, 0.2), f4 = q(1.00 + o, 0.2);
        if (f1 > 0) hline(g0, bx, bx + w * f1, by);
        if (f2 > 0) vline(g0, bx + w, by, by + h * f2);
        if (f3 > 0) hline(g0, bx + w, bx + w - w * f3, by + h);
        if (f4 > 0) vline(g0, bx, by + h, by + h - h * f4);
        g0.stroke();
        // compass circles and the body frame (0.05 … 0.95)
        const pc = q(1.18 + o, 0.5), pc2 = q(1.30 + o, 0.45), pb = q(1.30 + o, 0.4);
        g0.strokeStyle = verm(0.42 * gA);
        if (pc > 0) { g0.beginPath(); g0.ellipse(bx + w / 2, by + h / 2, w / 2, h / 2, 0, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * pc); g0.stroke(); }
        if (pc2 > 0) { g0.beginPath(); g0.ellipse(bx + w / 2, by + h / 2, w / 4, h / 4, 0, Math.PI / 2, Math.PI / 2 + 2 * Math.PI * pc2); g0.stroke(); }
        if (pb > 0) {
          g0.save(); g0.setLineDash([3, 5]); g0.strokeStyle = verm(0.38 * gA); g0.beginPath();
          g0.rect(bx + w * 0.05, by + h * 0.05, w * 0.9 * pb, h * 0.9); g0.stroke(); g0.restore();
        }
        // nodes on the frame
        const NODES = [[0, 0], [0.5, 0], [1, 0], [1, 0.5], [1, 1], [0.5, 1], [0, 1], [0, 0.5], [0.5, 0.5]];
        NODES.forEach(([u, v], k) => {
          const s = ob(t, 1.02 + 0.03 * k + o, 1.24 + 0.03 * k + o, 2.4);
          if (s <= 0) return;
          const r = 4.5 * s, x = bx + w * u, y = by + h * v;
          g0.fillStyle = PAPER_CSS; g0.fillRect(x - r, y - r, 2 * r, 2 * r);
          g0.strokeStyle = ink(0.75 * gA); g0.strokeRect(x - r, y - r, 2 * r, 2 * r);
        });
        // coordinates in font units
        const pl = sm(t, 1.35 + o, 1.6 + o) * gA;
        drawLabel(g0, '0', 18, bx + 4, by - 26, INK, 0.6 * pl);
        drawLabel(g0, '1000', 18, bx + w - 4, by - 26, INK, 0.6 * pl, { align: 'right' });
      }
      // 하늘: the dot → (later) the sun
      {
        let r = 13 * ob(t, 0.10, 0.42, 2.2), x = cx, y = cy;
        const tr = ease.inOutCubic(k01(t, 5.85, 6.75));
        if (tr > 0) {
          // a quadratic arc from the cross (where it was while building) down to the sun's centre
          const ax = 540, ay = Y_BUILD + HERO / 2, bx = DISC[0], by = DISC[1], kx = 960, ky = 760, u = 1 - tr;
          x = u * u * ax + 2 * u * tr * kx + tr * tr * bx; y = u * u * ay + 2 * u * tr * ky + tr * tr * by;
        }
        if (t > 8.25) r = lerp(13, DISC[2], ob(t, 8.25, 8.95, 1.25));
        if (r > 0.05) { g0.fillStyle = VERM; g0.beginPath(); g0.arc(x, y, r, 0, Math.PI * 2); g0.fill(); }
      }

      // ============ type
      g1.clearRect(0, 0, 1080, 1920);
      g2.clearRect(0, 0, 1080, 1920);
      g2.lineWidth = 1;
      // composition boxes (behind the skeletons)
      const syllX = [x0, x0 + adv];
      if (t < 6.2) {
        for (const f of FLY) {
          const appear = oc(t, f.land - 0.42, f.land - 0.2);
          if (appear <= 0) continue;
          const fade = f.fade(t);
          const b = f.desc.box, X = syllX[f.s] + HERO * b[0] * P.wd, Y = y0 + HERO * b[1];
          const Wb = HERO * (b[2] - b[0]) * P.wd, Hb = HERO * (b[3] - b[1]);
          const a = appear * fade;
          g2.save(); g2.setLineDash([7, 5]); g2.lineWidth = 1.5; g2.strokeStyle = verm(0.85 * a);
          g2.strokeRect(X, Y, Wb * appear, Hb); g2.restore();
          drawLabel(g2, SLOT_NAME[f.slot], 22, X + 6, Y + 5, VERM, 0.9 * a);
          // the snap: an outline that springs out of the box as the jamo lands
          const lk = k01(t, f.land, f.land + 0.35);
          if (lk > 0 && lk < 1) {
            const e = 16 * ease.outCubic(lk);
            g2.strokeStyle = verm(0.8 * (1 - lk)); g2.lineWidth = 2;
            g2.strokeRect(X - e, Y - e, Wb + 2 * e, Hb + 2 * e);
          }
        }
      }
      // the hero: each jamo separately (fly-in transform, box morph), stencil cuts afterwards
      const heroBands = [];
      const skA = skelA(t);
      const heroP = [0, 1].map((s) => windP(P, wind(t, s)));
      const heroSk = [0, 1].map((s) => 0.15 * wind(t, s));
      syllX[1] = x0 + HERO * heroP[0].wd;
      for (const f of FLY) {
        const t0 = f.land - FLIGHT;
        if (t < t0) continue;
        const p = ob(t, t0, f.land, 1.3), m = sm(t, t0, f.land - 0.05);
        let units = f.units;
        if (!f.desc.strokes && m < 1) {
          const box = f.free.map((v, i) => lerp(v, f.desc.box[i], m));
          units = descUnits({ ...f.desc, box, slant: f.desc.slant * m });
        }
        const Pf = heroP[f.s];
        const A = p >= 1 ? null : animAffine([f.c[0] * Pf.wd, f.c[1]], [f.off[0] * (1 - p), f.off[1] * (1 - p)], f.rot * (1 - p), lerp(f.sc, 1, p));
        const sink = newSink();
        renderUnits(units, Pf, { x: syllX[f.s], y: y0, s: HERO, sk: heroSk[f.s], anim: units.map(() => A) }, sink, { skel: skA > 0 });
        fillSink(g1, sink, INK, sm(t, t0, t0 + 0.12));
        heroBands.push(...sink.bands);
        drawSkel(g2, sink, skA * sm(t, t0, t0 + 0.12));
      }
      cutBands(g1, heroBands);

      // the sentence: written in stroke order, then the wind runs through it
      if (t > 6.2) {
        let j = 0;
        LINES.forEach((L, li) => {
          let x = lineX[li];
          for (const ch of Array.from(L.str)) {
            if (ch === ' ') { x += 0.28 * SENT * FINAL.wd; continue; }
            const idx = 2 + j, a = wind(t, idx);
            const Pg = windP(P, a);
            const start = 6.3 + 0.075 * j + 0.1 * li;
            const rv = inOutSine(k01(t, start, start + 0.44));
            if (rv > 0) {
              const sink = newSink();
              const place = { x, y: L.y, s: SENT, sk: 0.15 * a, reveal: rv };
              renderUnits(glyphUnits(ch).units, Pg, place, sink);
              fillSink(g1, sink, INK);
              // the pen: the skeleton runs a little ahead of the ink, with a vermilion tip
              const pa = 1 - sm(t, start + 0.44, start + 0.7);
              if (pa > 0) {
                const sk = newSink();
                renderUnits(glyphUnits(ch).units, Pg, { ...place, reveal: Math.min(1, rv + 0.12) }, sk, { skel: true, skelOnly: true });
                drawSkel(g2, sk, 0.9 * pa, { nodes: false, width: 1.2 });
                if (sk.tip && rv < 1) { g2.fillStyle = verm(pa); g2.beginPath(); g2.arc(sk.tip[0], sk.tip[1], 4.5, 0, Math.PI * 2); g2.fill(); }
              }
            }
            x += SENT * Pg.wd - 0.01 * SENT;
            j++;
          }
        });
      }

      // ============ overlay: opening labels, sliders / readout, rules, graph, header, base band
      {
        const out = 1 - sm(t, 1.25, 1.55);
        drawLabel(g2, '하늘', 28, cx + 18, cy - 50, INK, 0.75 * sm(t, 0.30, 0.55) * out);
        drawLabel(g2, '땅', 28, 1040, cy - 44, INK, 0.75 * sm(t, 0.55, 0.80) * out, { align: 'right' });
        drawLabel(g2, '사람', 28, cx + 14, cy - HERO / 2 - 60, INK, 0.75 * sm(t, 0.70, 0.95) * out);
      }
      // sliders → readout
      {
        const c = ease.inOutCubic(k01(t, 5.85, 6.6));
        SLIDERS.forEach((S, i) => {
          const a = oc(t, 2.75 + 0.06 * i, 3.1 + 0.06 * i);
          if (a <= 0) return;
          const em = lerp(30, 24, c), top = lerp(1100 + 62 * i, 1186 + 40 * i, c);
          const shift = -30 * (1 - a);
          const tx0 = lerp(300, 232, c) + shift, tx1 = lerp(900, 336, c) + shift, vx = lerp(RIGHT, 412, c) + shift;
          const ty = top + em * 0.56;
          const v = P[S.key], u = clamp(S.norm(v));
          const dv = Math.abs(T[S.key](t + 0.04) - T[S.key](t - 0.04));
          const act = clamp(dv * 14) * (1 - c);
          drawLabel(g2, S.name, 30, M + shift, top, act > 0.5 ? VERM : INK, a, { scale: em / 30 });
          g2.strokeStyle = ink(0.4 * a); g2.lineWidth = 1; g2.beginPath(); hline(g2, tx0, tx1, ty);
          for (const k of [0, 0.5, 1]) vline(g2, tx0 + (tx1 - tx0) * k, ty - 5, ty + 5);
          g2.stroke();
          const kx = tx0 + (tx1 - tx0) * u;
          g2.strokeStyle = ink(0.92 * a); g2.lineWidth = lerp(3, 2, c); g2.beginPath(); hline(g2, tx0, kx, ty); g2.stroke();
          const kr = lerp(8, 5, c) * (1 + 0.35 * act);
          g2.fillStyle = act > 0.02 ? verm(a) : ink(a);
          g2.beginPath(); g2.arc(kx, ty, kr, 0, Math.PI * 2); g2.fill();
          drawLabel(g2, v.toFixed(2), 30, vx, top, act > 0.5 ? VERM : INK, a, { scale: em / 30, align: 'right' });
        });
      }
      // rules
      {
        const r1 = oc(t, 6.35, 6.85);
        g2.strokeStyle = ink(0.8); g2.lineWidth = 1;
        if (r1 > 0) { g2.beginPath(); hline(g2, M, M + (RIGHT - M) * r1, 700.5); g2.stroke(); }
        const r2 = oc(t, 8.45, 8.95);
        if (r2 > 0) { g2.lineWidth = 2; g2.beginPath(); hline(g2, M, M + (RIGHT - M) * r2, 146); g2.stroke(); }
      }
      // the wind, plotted: a curve over the reading order, one node per syllable
      {
        const a = sm(t, 6.4, 6.7);
        if (a > 0) {
          const grow = oc(t, 6.45, 6.95), xe = lerp(M, RIGHT, grow);
          const toI = (x) => -0.5 + 12 * (x - M) / (RIGHT - M), amp = 62;
          g2.strokeStyle = ink(0.35 * a); g2.lineWidth = 1; g2.beginPath(); hline(g2, M, xe, GRAPH_Y + 0.5); g2.stroke();
          g2.strokeStyle = verm(0.95 * a); g2.lineWidth = 2; g2.lineJoin = 'round'; g2.beginPath();
          for (let x = M; x <= xe + 0.1; x += 4) { const y = GRAPH_Y - amp * wind(t, toI(x)); if (x === M) g2.moveTo(x, y); else g2.lineTo(x, y); }
          g2.stroke();
          ORDER.forEach((ch, i) => {
            const x = M + (i + 0.5) / 12 * (RIGHT - M);
            if (x > xe) return;
            const w = wind(t, i), y = GRAPH_Y - amp * w;
            g2.fillStyle = w > 0.5 ? VERM : INK;
            g2.beginPath(); g2.arc(x, y, 3.5 + 2.5 * w, 0, Math.PI * 2); g2.fill();
            drawLabel(g2, ch, 22, x, GRAPH_Y + 14, INK, 0.8 * a, { align: 'center' });
          });
        }
      }
      // header
      {
        const a = sm(t, 8.5, 8.95), dy = 10 * (1 - ease.outCubic(a));
        drawLabel(g2, '획과 틀의 규칙', 30, M - 2, 92 + dy, INK, a);
        drawLabel(g2, '1443', 30, RIGHT + 2, 92 + dy, INK, a, { align: 'right' });
      }
      // the base band (the caption sits on it)
      g2.fillStyle = INK; g2.fillRect(0, BAND, 1080, 1920 - BAND);
    };
  },
  frame(t) {
    this.render(t);
  },
});
