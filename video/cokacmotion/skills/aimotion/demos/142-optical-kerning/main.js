/*
 * 142 · 글자 사이의 공기 — optical kerning: equal white AREA between letter pairs, not equal distance.
 *
 * TRAVEL is set in DM Serif Display from its real outlines (opentype.js reads the font file; every glyph is a Path2D).
 * In setup each glyph is cut by 228 scanlines across the measured band (cap height + overshoot): L(y) is the leftmost
 * ink, R(y) the rightmost. For a pair (a, b) at pen distance P = advance(a) + Δ the white on scanline y is
 *   gap(y)  = P + L_b(y) − R_a(y)
 * and what the eye counts of it is limited twice:
 *   depth cap  — each side only counts DEPTH units into its own open side (under T's arm, inside E, A's slope):
 *                R̃_a(y) = max(R_a(y), maxR_a − DEPTH),  L̃_b(y) = min(L_b(y), minL_b + DEPTH)
 *   reach cap  — no scanline counts more than REACH beyond the pair's closest approach:
 *                gap_eff(y) = clamp(P + L̃_b(y) − R̃_a(y), 0, gap_min + REACH)
 *   area       — A(Δ) = Σ w(y)·gap_eff(y)·dy,  w = 0.35 + 0.65·sin(π·u)   (middle rows weigh most)
 * The target A* is the same measure for HH (two straight stems at the font's own spacing). Each pair is solved for
 * A(Δ) = A* by a doubling search for a bracket and then bisection; every trial Δ is one visible step. Shifts add up
 * along the word. The browser's own shaping of the font (its GPOS kern table) is measured too, for comparison.
 *
 * Story: proof sheet, letters land in their boxes (0–1.5) · a scan beam measures the air between pairs and the areas
 * count up (1.5–3.4) · the solver pushes and pulls every pair until all read 100 (3.55–5.8, climax) · before/after
 * rows and the kerning table (6.45–8.4) · the word settles with the lesson (8.6–10).
 */
import { defineDemo, clamp, lerp, ease, rand } from '../_lib/stage.js';
import { FONTS, fontReady, loadOutlineFont, flattenPath } from '../_lib/type.js';

const D = 10;
const SERIF_URL = '../node_modules/@fontsource/dm-serif-display/files/dm-serif-display-latin-400-normal.woff';
const KR = `"${FONTS.pretendard.family}"`, MONO = `"${FONTS.jetbrainsMono.family}"`, SERIF = `"${FONTS.dmSerifDisplay.family}"`;

// ---------------------------------------------------------------- palette: warm paper, ink, one accent (tomato)
const DESK = '#2b2622', PAPER = '#f4eee4', CARD = '#fbf8f2', INK = '#221d19', SOFT = '#73695f', GHOST = '#a1968a';
const ink = (a) => `rgba(34,29,25,${clamp(a).toFixed(3)})`;
const tom = (a) => `rgba(226,84,58,${clamp(a).toFixed(3)})`;
const soft = (a) => `rgba(115,105,95,${clamp(a).toFixed(3)})`;
const TOM = '#e2543a';

// ---------------------------------------------------------------- sheet layout (stage px)
const SHEET = { x: 22, y: 24, w: 1036, h: 1630 };
const TRIM = { x: 72, y: 84, w: 936, h: 1520 };
const HEAD_Y = 126, RULE_Y = 150;
const HL_Y = [252, 322];                 // headline baselines
const BASE = 700;                         // main word baseline
const BEFORE_BASE = 452;                  // the "before" row in the comparison
const BAR_BASE = 1222, BAR_PX = 2.0;      // bar chart: 2 px per % of the target
const TAB_Y = 858, TAB_H = 300;           // kerning table card
const CARD_Y = 1316, CARD_H = 248;

// ---------------------------------------------------------------- the word and the measurement (font units, 1000/em)
const WORD = 'TRAVEL';
const SIZE = 256, K = SIZE / 1000;        // stage px per font unit
const X0 = 74;
const BAND = [-12, 672];                  // baseline overshoot … cap height (660) + overshoot
const NY = 228, DY = (BAND[1] - BAND[0]) / NY;
const DEPTH = 140;                        // depth cap per side (0.14 em)
const REACH = 120;                        // reach cap beyond the closest approach (0.12 em)
const CLEAR = 10;                         // the solver never brings two glyphs closer than this
const WK = new Float64Array(NY);
for (let k = 0; k < NY; k++) WK[k] = 0.35 + 0.65 * Math.sin(Math.PI * (k + 0.5) / NY);
const rowY = (k) => BAND[1] - (k + 0.5) * DY;     // font y (up) of scanline k, top → bottom

// ---------------------------------------------------------------- timeline
const T_LAND = 0.32, LAND_GAP = 0.085;
const T_SCAN = [1.5, 2.35];
const T_SOLVE = 3.55, STEP = 0.19, MOVE = 0.15;
const T_CMP = 6.45, T_END = 8.28;

const k01 = (t, a, b) => clamp((t - a) / (b - a));
const oc = (t, a, b) => ease.outCubic(k01(t, a, b));
const io = (t, a, b) => ease.inOutCubic(k01(t, a, b));
/** visibility: fades in over [a, b], out over [c, d] */
const win = (t, a, b, c, d) => Math.min(oc(t, a, b), 1 - k01(t, c, d));

// ---------------------------------------------------------------- glyphs from the font file
function buildGlyph(font, ch) {
  const g = font.charToGlyph(ch);
  const cmds = g.getPath(0, 0, 1000).commands;     // font units, y down, baseline at 0
  const path = new Path2D();
  for (const c of cmds) {
    if (c.type === 'M') path.moveTo(c.x, c.y);
    else if (c.type === 'L') path.lineTo(c.x, c.y);
    else if (c.type === 'Q') path.quadraticCurveTo(c.x1, c.y1, c.x, c.y);
    else if (c.type === 'C') path.bezierCurveTo(c.x1, c.y1, c.x2, c.y2, c.x, c.y);
    else if (c.type === 'Z') path.closePath();
  }
  // profiles: the outermost crossing on a scanline is always an ink edge, so min/max of all crossings is enough
  const contours = flattenPath(cmds, 0.35);
  const L = new Float64Array(NY).fill(Infinity), R = new Float64Array(NY).fill(-Infinity);
  for (let k = 0; k < NY; k++) {
    const y = -rowY(k);
    for (const c of contours) {
      const p = c.pts, n = p.length;
      for (let i = 0; i < n; i += 2) {
        const j = (i + 2) % n, ya = p[i + 1], yb = p[j + 1];
        if ((ya <= y) !== (yb <= y)) {
          const x = p[i] + ((y - ya) / (yb - ya)) * (p[j] - p[i]);
          if (x < L[k]) L[k] = x;
          if (x > R[k]) R[k] = x;
        }
      }
    }
  }
  let minL = Infinity, maxR = -Infinity;
  for (let k = 0; k < NY; k++) { if (L[k] < minL) minL = L[k]; if (R[k] > maxR) maxR = R[k]; }
  return { ch, adv: g.advanceWidth, path, L, R, minL, maxR };
}

const span = () => ({ xl: new Float64Array(NY), xr: new Float64Array(NY), cl: new Uint8Array(NY), cr: new Uint8Array(NY), cx: 0 });

/**
 * The air between glyph a and glyph b at pen distance adv(a) + d (font units). Returns the weighted area over the
 * first kEnd scanlines and the closest approach. With `out`, also each scanline's counted span [xl, xr] in a's frame,
 * whether each end touches ink (cl/cr = 1) or is a cap (0), and the weighted centre of the shape (cx).
 */
function measure(a, b, d, out = null, kEnd = NY) {
  const P = a.adv + d;
  let gmin = Infinity;
  for (let k = 0; k < NY; k++) { const g = P + b.L[k] - a.R[k]; if (g < gmin) gmin = g; }
  const lim = gmin + REACH;
  let A = 0, mx = 0, mw = 0;
  for (let k = 0; k < NY; k++) {
    const ra = Math.max(a.R[k], a.maxR - DEPTH), lb = Math.min(b.L[k], b.minL + DEPTH);
    const gt = P + lb - ra;
    const e = clamp(gt, 0, lim);
    if (k < kEnd) A += WK[k] * e * DY;
    if (out) {
      // where the reach cap trims a scanline, the trim comes off the side that is already cut deeper into its glyph
      let xl = ra, xr = P + lb;
      const ex = gt - e;
      if (ex > 0) { if (a.maxR - ra >= lb - b.minL) xl += ex; else xr -= ex; }
      if (xr < xl) xr = xl;
      out.xl[k] = xl; out.xr[k] = xr;
      out.cl[k] = xl - a.R[k] < 0.5 ? 1 : 0;
      out.cr[k] = P + b.L[k] - xr < 0.5 ? 1 : 0;
      mx += WK[k] * (xr - xl) * (xl + xr) / 2; mw += WK[k] * (xr - xl);
    }
  }
  if (out) out.cx = mw > 0 ? mx / mw : P / 2;
  return { A, gmin };
}

/** A(Δ) = A*: double the step until the sign flips (bracket), then bisect. Every trial is one animation step. */
function solvePair(a, b, ref, steps) {
  const f = (d) => measure(a, b, d).A - ref;
  const f0 = f(0), dir = f0 > 0 ? -1 : 1;
  const dClear = CLEAR - measure(a, b, 0).gmin;           // the closest the pair may come (negative)
  const seq = [0];
  let lo = 0, hi = 0, step = 8;
  for (;;) {
    let d = dir * step;
    if (d < dClear) d = dClear;
    seq.push(d);
    if (Math.sign(f(d)) !== Math.sign(f0) || d === dClear) { hi = d; break; }
    lo = d; step *= 2;
  }
  while (seq.length < steps) {
    const m = (lo + hi) / 2;
    seq.push(m);
    if (Math.sign(f(m)) === Math.sign(f(lo))) lo = m; else hi = m;
  }
  for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (Math.sign(f(m)) === Math.sign(f(lo))) lo = m; else hi = m; }
  const root = Math.sign(f(lo)) === Math.sign(f(hi)) ? hi : (lo + hi) / 2;   // clearance-limited: stay at the limit
  seq.push(root);
  return { seq, root, A0: f0 + ref };
}

/** the solver's Δ at time t: each trial is reached with a quick ease, one trial every STEP seconds */
function deltaAt(seq, t) {
  const n = seq.length - 1, u = (t - T_SOLVE) / STEP;
  if (u <= 0) return 0;
  if (u >= n) return seq[n];
  const j = Math.floor(u), p = ease.outCubic(clamp(((u - j) * STEP) / MOVE));
  return lerp(seq[j], seq[j + 1], p);
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '142-optical-kerning',
  title: '글자 사이의 공기',
  tech: '광학 자간 · 글자 사이 면적을 고르게 맞추기',
  duration: D,
  background: DESK,
  async setup(api) {
    const headless = api.headless;
    const KTEXT = '자간교정기준쌍곧은기둥둘사이간격은다똑같은데왜만휑할까공기를재보면의배면적이같아질때까지쌍마다밀고당긴다전후상자그대로맞춤거리보다'
      + '줄사이폭을잰깊은곳한계만센가운데에무게더준탐색두씩넓히반좁힌글자로가아니라넓이단위조정값계산글꼴든커닝원래거의같다파일·=×?,.%';
    for (const w of [500, 600, 700, 800]) await fontReady(`${w} 40px ${KR}`, KTEXT);
    await fontReady(`600 28px ${MONO}`, '0123456789.+−/emHTRAVEL ×=');
    await fontReady(`400 100px ${SERIF}`, 'TRAVELH');
    const font = await loadOutlineFont(SERIF_URL);

    const G = {};
    for (const ch of 'TRAVELH') G[ch] = buildGlyph(font, ch);
    const glyphs = Array.from(WORD, (ch) => G[ch]);
    const REF = measure(G.H, G.H, 0).A;                  // A*: two straight stems at the font's own spacing
    // the font's own kerning, as the browser shapes it (GPOS kern): width(ab) − width(a) − width(b) at 1000 px = units
    const mc = document.createElement('canvas').getContext('2d');
    mc.font = `400 1000px ${SERIF}`;
    if ('fontKerning' in mc) mc.fontKerning = 'normal';
    const fontKern = (s) => Math.round(mc.measureText(s).width - mc.measureText(s[0]).width - mc.measureText(s[1]).width);
    const pairs = [];
    for (let i = 0; i < glyphs.length - 1; i++) {
      const a = glyphs[i], b = glyphs[i + 1];
      const s = solvePair(a, b, REF, 12);
      pairs.push({ i, a, b, name: a.ch + b.ch, ...s, ...span(), kern: fontKern(a.ch + b.ch) });
    }
    const refOut = span();
    measure(G.H, G.H, 0, refOut);
    const cmpOut = pairs.map(() => span());

    // ------------------------------------------------------------ canvases
    const attrs = headless ? { willReadFrequently: true } : undefined;
    const { ctx } = api.canvas({ type: '2d', attrs });
    const mk = (w, h) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return { cv, g: cv.getContext('2d', attrs) }; };
    const bg = bakeBackground(mk);
    ctx.drawImage(bg, 0, 0);                              // warm the offscreen → main path once (headless raster)
    ctx.clearRect(0, 0, 1080, 1920);

    const fmt1 = (v) => v.toFixed(1);
    const sgn = (v) => { const r = Math.round(v); return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r); };

    // ------------------------------------------------------------ drawing helpers
    const c = ctx;
    const reset = () => {
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      c.lineCap = 'butt'; c.lineJoin = 'miter'; c.setLineDash([]); c.filter = 'none';
      c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    };
    const text = (s, x, y, f, color, align = 'left') => { c.font = f; c.fillStyle = color; c.textAlign = align; c.fillText(s, x, y); };
    /** one line of [text, colour] segments starting at x */
    const rich = (segs, x, y, f, alpha) => {
      c.font = f; c.textAlign = 'left'; c.globalAlpha = alpha;
      let px = x;
      for (const [s, col] of segs) { c.fillStyle = col; c.fillText(s, px, y); px += c.measureText(s).width; }
      c.globalAlpha = 1;
    };
    const drawGlyph = (g, x, base, scale, color) => {
      c.setTransform(K * scale, 0, 0, K * scale, x, base);
      c.fillStyle = color; c.fill(g.path);
      c.setTransform(1, 0, 0, 1, 0, 0);
    };
    /** a short DM Serif label (pair names) centred on x */
    const serifLabel = (str, cx, base, size, color) => {
      const s = size / 1000;
      let w = 0; for (const ch of str) w += G[ch].adv * s;
      let x = cx - w / 2;
      for (const ch of str) { c.setTransform(s, 0, 0, s, x, base); c.fillStyle = color; c.fill(G[ch].path); x += G[ch].adv * s; }
      c.setTransform(1, 0, 0, 1, 0, 0);
    };
    /** dashed rules drawn as rects (no setLineDash) */
    const dashV = (x, y0, y1, color, on = 5, off = 4, w = 1.4) => {
      c.fillStyle = color;
      for (let y = y0; y < y1; y += on + off) c.fillRect(x - w / 2, y, w, Math.min(on, y1 - y));
    };
    const dashH = (x0, x1, y, color, on = 7, off = 6, w = 1.4) => {
      c.fillStyle = color;
      for (let x = x0; x < x1; x += on + off) c.fillRect(x, y - w / 2, Math.min(on, x1 - x), w);
    };
    /** stroke a polyline [x0, y0, x1, y1, …] solid or dashed by arc length */
    const poly = (pts, dash) => {
      c.beginPath();
      if (!dash) { c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); return; }
      const [on, off] = dash;
      let acc = 0, draw = true;
      for (let i = 0; i + 3 < pts.length; i += 2) {
        const x0 = pts[i], y0 = pts[i + 1], x1 = pts[i + 2], y1 = pts[i + 3], L = Math.hypot(x1 - x0, y1 - y0);
        let pos = 0;
        while (pos < L - 1e-9) {
          const st = Math.min((draw ? on : off) - acc, L - pos);
          if (draw) { c.moveTo(x0 + (x1 - x0) * pos / L, y0 + (y1 - y0) * pos / L); c.lineTo(x0 + (x1 - x0) * (pos + st) / L, y0 + (y1 - y0) * (pos + st) / L); }
          pos += st; acc += st;
          if (acc >= (draw ? on : off) - 1e-9) { draw = !draw; acc = 0; }
        }
      }
      c.stroke();
    };
    /**
     * The counted air of one pair: a fill whose opacity follows the row weight, a sparse scanline hatch, and edges —
     * solid where the shape touches a glyph (the profile), dashed where a cap cuts it.
     */
    const airShape = (o, xa, base, scale, alpha, { clipY = 1e9, edgeA = 0, hatch = 1 } = {}) => {
      if (alpha <= 0.002 && edgeA <= 0.002) return;
      const s = K * scale, top = base - BAND[1] * s, bot = base - BAND[0] * s;
      const Y = (k) => base - rowY(k) * s;
      c.save();
      if (clipY < 1e8) { c.beginPath(); c.rect(0, 0, 1080, clipY); c.clip(); }
      if (alpha > 0.002) {
        const gr = c.createLinearGradient(0, top, 0, bot);
        for (let q = 0; q <= 8; q++) gr.addColorStop(q / 8, tom(alpha * (0.07 + 0.27 * (0.35 + 0.65 * Math.sin(Math.PI * q / 8)))));
        c.fillStyle = gr;
        c.beginPath();
        c.moveTo(xa + o.xl[0] * s, top);
        for (let k = 0; k < NY; k++) c.lineTo(xa + o.xl[k] * s, Y(k));
        c.lineTo(xa + o.xl[NY - 1] * s, bot);
        c.lineTo(xa + o.xr[NY - 1] * s, bot);
        for (let k = NY - 1; k >= 0; k--) c.lineTo(xa + o.xr[k] * s, Y(k));
        c.lineTo(xa + o.xr[0] * s, top);
        c.fill();
        if (hatch > 0) {
          for (let k = 4; k < NY; k += 9) {
            const x0 = xa + o.xl[k] * s, x1 = xa + o.xr[k] * s;
            if (x1 - x0 < 1) continue;
            c.fillStyle = tom(alpha * hatch * (0.16 + 0.3 * WK[k]));
            c.fillRect(x0, Y(k) - 0.5, x1 - x0, 1);
          }
        }
      }
      if (edgeA > 0.002) {
        c.strokeStyle = tom(edgeA); c.lineJoin = 'round'; c.lineCap = 'round';
        for (const [X, C] of [[o.xl, o.cl], [o.xr, o.cr]]) {
          let k = 0;
          while (k < NY) {
            const type = C[k];
            let e = k;
            while (e + 1 < NY && C[e + 1] === type) e++;
            const pts = [];
            for (let q = Math.max(0, k - 1); q <= e; q++) {
              if (o.xr[q] - o.xl[q] < 0.5) continue;
              pts.push(xa + X[q] * s, Y(q));
            }
            if (pts.length >= 4) { c.lineWidth = type ? 1.7 * Math.max(0.7, scale) : 1.4 * Math.max(0.7, scale); poly(pts, type ? null : [4.5, 4]); }
            k = e + 1;
          }
        }
        c.lineCap = 'butt'; c.lineJoin = 'miter';
      }
      c.restore();
    };
    // cards are baked once with a soft shadow (no shadowBlur per frame) and stamped with drawImage
    const CPAD = 40, cardCache = new Map();
    const card = (x, y, w, h) => {
      const key = `${w}x${h}`;
      if (!cardCache.has(key)) {
        const { cv, g } = mk(w + 2 * CPAD, h + 2 * CPAD);
        g.save(); g.shadowColor = 'rgba(70,48,28,0.13)'; g.shadowBlur = 26; g.shadowOffsetY = 8;
        g.fillStyle = CARD; g.beginPath(); g.roundRect(CPAD, CPAD, w, h, 16); g.fill(); g.restore();
        g.strokeStyle = 'rgba(34,29,25,0.13)'; g.lineWidth = 1; g.beginPath(); g.roundRect(CPAD + 0.5, CPAD + 0.5, w - 1, h - 1, 16); g.stroke();
        cardCache.set(key, cv);
      }
      c.drawImage(cardCache.get(key), x - CPAD, y - CPAD);
    };
    for (const [w, h] of [[446, CARD_H], [TRIM.w, TAB_H]]) { card(0, 0, w, h); }   // bake + warm both now
    ctx.clearRect(0, 0, 1080, 1920);
    const check = (x, y, s, color) => {
      c.strokeStyle = color; c.lineWidth = 3 * s; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(x - 9 * s, y); c.lineTo(x - 3 * s, y + 6 * s); c.lineTo(x + 9 * s, y - 8 * s); c.stroke();
      c.lineCap = 'butt'; c.lineJoin = 'miter';
    };

    // glyph pen positions (font units from X0) for the deltas d[]
    const pens = (d) => { const p = [0]; for (let i = 0; i < glyphs.length - 1; i++) p.push(p[i] + glyphs[i].adv + d[i]); return p; };
    const inkW = (p) => p[glyphs.length - 1] + glyphs[glyphs.length - 1].maxR - glyphs[0].minL;
    const p0 = pens(pairs.map(() => 0));
    // after the solve the word is narrower: at the end it re-centres in the trim (half the change)
    const shiftFinal = (inkW(p0) - inkW(pens(pairs.map((p) => p.root)))) * K / 2;
    const yTop = BASE - BAND[1] * K, yBot = BASE - BAND[0] * K;

    // ------------------------------------------------------------ per frame
    this.render = (t) => {
      reset();
      c.drawImage(bg, 0, 0);

      // ======== sheet furniture: crop marks, registration, baseline grid, header
      const cm = oc(t, 0.0, 0.45);
      c.fillStyle = ink(0.55);
      const cl = 30 * cm, co = 10;
      for (const [x, y, sx, sy] of [[TRIM.x, TRIM.y, -1, -1], [TRIM.x + TRIM.w, TRIM.y, 1, -1], [TRIM.x, TRIM.y + TRIM.h, -1, 1], [TRIM.x + TRIM.w, TRIM.y + TRIM.h, 1, 1]]) {
        c.fillRect(sx < 0 ? x - co - cl : x + co, y - 0.5, cl, 1);
        c.fillRect(x - 0.5, sy < 0 ? y - co - cl : y + co, 1, cl);
      }
      if (cm > 0) {
        c.strokeStyle = ink(0.5 * cm); c.lineWidth = 1;
        for (const [x, y] of [[540, 52], [540, 1632]]) {
          c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.stroke();
          c.fillStyle = ink(0.5 * cm); c.fillRect(x - 13, y - 0.5, 26, 1); c.fillRect(x - 0.5, y - 13, 1, 26);
        }
      }
      const gridA = 0.05 * oc(t, 0.1, 0.8);
      if (gridA > 0) {
        c.fillStyle = ink(gridA);
        for (let y = TRIM.y + 24; y < TRIM.y + TRIM.h; y += 24) c.fillRect(TRIM.x, y - 0.5, TRIM.w, 1);
      }
      const ha = oc(t, 0.12, 0.55);
      if (ha > 0) {
        c.globalAlpha = ha;
        text('자간 교정', TRIM.x, HEAD_Y, `700 23px ${KR}`, INK);
        text('TRAVEL · DM Serif Display', 540, HEAD_Y, `500 18px ${MONO}`, SOFT, 'center');
        text('단위 1/1000 em', TRIM.x + TRIM.w, HEAD_Y, `600 20px ${KR}`, SOFT, 'right');
        c.globalAlpha = 1;
        c.fillStyle = INK; c.fillRect(TRIM.x, RULE_Y, TRIM.w * oc(t, 0.15, 0.7), 2);
      }

      // ======== headlines (the narration of the sheet)
      const HL = [
        { a: 0.3, b: 1.42, l1: [['간격은 다 똑같은데', INK]], l2: [['왜 ', INK], ['AV', TOM], ['만 휑할까?', INK]] },
        { a: 1.5, b: 3.42, l1: [['사이의 ', INK], ['공기', TOM], ['를 재 보면', INK]], l2: [['AV', TOM], [`만 기준의 ${(pairs[2].A0 / REF).toFixed(1)}배`, INK]] },
        { a: 3.5, b: 6.25, l1: [['면적', TOM], ['이 같아질 때까지', INK]], l2: [['쌍마다 밀고 당긴다', INK]] },
        { a: 8.58, b: 99, l1: [['같은 거리보다', INK]], l2: [['같은 면적', TOM]], big: true },
      ];
      for (const h of HL) {
        for (let li = 0; li < 2; li++) {
          const ta = h.a + 0.07 * li;
          const pin = oc(t, ta, ta + 0.42), pout = k01(t, h.b, h.b + 0.2);
          const a = pin * (1 - pout);
          if (a <= 0.003) continue;
          const y = HL_Y[li] + 26 * (1 - pin) - 14 * ease.inCubic(pout);
          c.save(); c.beginPath(); c.rect(TRIM.x, HL_Y[li] - 70, TRIM.w, 88); c.clip();
          rich(li ? h.l2 : h.l1, TRIM.x, y, h.big ? `800 66px ${KR}` : `800 56px ${KR}`, a);
          c.restore();
        }
      }
      {
        const a = oc(t, 8.78, 9.2);
        if (a > 0) text('글자 사이는 자가 아니라 넓이로 잰다', TRIM.x, HL_Y[1] + 58 - 8 * (1 - a), `500 25px ${KR}`, soft(a));
      }
      // solver HUD (right of the headline while the solver runs)
      const hudA = win(t, T_SOLVE - 0.1, T_SOLVE + 0.25, 6.1, 6.35);
      if (hudA > 0) {
        const n = pairs[0].seq.length - 1, it = clamp(Math.floor((t - T_SOLVE) / STEP) + 1, 1, n);
        const R = TRIM.x + TRIM.w;
        c.globalAlpha = hudA;
        text('탐색', R, 212, `700 20px ${KR}`, SOFT, 'right');
        text(`${String(it).padStart(2, '0')} / ${n}`, R, 266, `700 46px ${MONO}`, INK, 'right');
        text('두 배씩 넓히고, 반씩 좁힌다', R, 304, `500 19px ${KR}`, SOFT, 'right');
        c.globalAlpha = 1;
      }

      // ======== the word: positions now
      const d = pairs.map((p) => deltaAt(p.seq, t));
      const pn = pens(d);
      const settle = io(t, 8.6, 9.5) * shiftFinal;
      const xs = pn.map((u) => X0 + settle + u * K);
      for (const P of pairs) measure(P.a, P.b, d[P.i], P);
      const colX = (P) => xs[P.i] + P.cx * K;

      // advance boxes: the mechanical spacing (each glyph in its own box, boxes touching)
      const boxA = win(t, 0.45, 0.8, 1.9, 2.4);
      if (boxA > 0) {
        const top = BASE - 760 * K, bot = BASE + 70 * K;
        glyphs.forEach((g, j) => {
          const la = oc(t, T_LAND + j * LAND_GAP + 0.08, T_LAND + j * LAND_GAP + 0.4) * boxA;
          if (la <= 0) return;
          const x0 = xs[j], x1 = xs[j] + g.adv * K;
          c.strokeStyle = ink(0.38 * la); c.lineWidth = 1;
          c.strokeRect(Math.round(x0) + 0.5, Math.round(top) + 0.5, Math.round(x1) - Math.round(x0), Math.round(bot - top));
          text(String(g.adv), (x0 + x1) / 2, top - 10, `500 17px ${MONO}`, soft(la), 'center');
        });
      }

      // band guides: cap line and baseline with overshoot
      const guideA = win(t, 1.35, 1.7, 6.2, 6.5);
      if (guideA > 0) {
        dashH(TRIM.x, TRIM.x + TRIM.w, yTop, ink(0.3 * guideA));
        dashH(TRIM.x, TRIM.x + TRIM.w, yBot, ink(0.3 * guideA));
        c.globalAlpha = guideA;
        text('측정 구간', TRIM.x + TRIM.w, yTop - 10, `600 18px ${KR}`, SOFT, 'right');
        c.globalAlpha = 1;
      }

      // scan beam (measures the band top → bottom)
      const scanP = io(t, T_SCAN[0], T_SCAN[1]);
      const beamY = lerp(yTop - 4, yBot + 4, scanP);
      const scanning = t < T_SCAN[1] + 0.001;
      const kEnd = scanning ? clamp(Math.floor((beamY - yTop) / (DY * K)), 0, NY) : NY;

      // air shapes on the main row
      if (t >= T_SCAN[0]) {
        const fillA = (t < T_CMP ? 1 : lerp(1, 0.6, oc(t, T_CMP, T_CMP + 0.3))) * (1 - k01(t, T_END, T_END + 0.35));
        const edgeA = 0.95 * win(t, 1.6, 2.1, 6.15, 6.45);
        const hatch = 1 - k01(t, 6.15, 6.45);
        for (const P of pairs) airShape(P, xs[P.i], BASE, 1, fillA, { clipY: scanning ? beamY : 1e9, edgeA, hatch });
      }
      // one label for the depth cap under T's arm
      const capLab = win(t, 2.2, 2.6, 3.3, 3.55);
      if (capLab > 0) {
        const x = xs[0] + (G.T.maxR - DEPTH) * K;
        c.globalAlpha = capLab;
        c.fillStyle = TOM; c.fillRect(x - 0.7, yBot + 4, 1.4, 16);
        text('깊이 한계', x - 6, yBot + 36, `700 19px ${KR}`, TOM, 'right');
        c.globalAlpha = 1;
      }

      // glyphs land one by one
      glyphs.forEach((g, j) => {
        const pl = clamp((t - (T_LAND + j * LAND_GAP)) / 0.42);
        if (pl <= 0) return;
        c.globalAlpha = clamp(pl / 0.25);
        drawGlyph(g, xs[j], BASE - 54 * (1 - ease.outBack(pl, 1.5)), 1, INK);
        c.globalAlpha = 1;
      });

      // the scan beam
      if (t > T_SCAN[0] - 0.05 && t < T_SCAN[1] + 0.25) {
        const ba = Math.min(oc(t, T_SCAN[0] - 0.05, T_SCAN[0] + 0.1), 1 - k01(t, T_SCAN[1], T_SCAN[1] + 0.25));
        const gr = c.createLinearGradient(0, beamY - 28, 0, beamY);
        gr.addColorStop(0, tom(0)); gr.addColorStop(1, tom(0.18 * ba));
        c.fillStyle = gr; c.fillRect(TRIM.x, beamY - 28, TRIM.w, 28);
        c.fillStyle = tom(0.9 * ba); c.fillRect(TRIM.x, beamY - 1, TRIM.w, 2);
      }

      // ======== bars: the counted air of each pair, against the target (HH = 100)
      const barIn = oc(t, T_SCAN[0], T_SCAN[0] + 0.3), barOut = ease.inCubic(k01(t, 6.2, 6.5));
      const barA = barIn * (1 - k01(t, 6.3, 6.5));
      const yT = BAR_BASE - 100 * BAR_PX;
      if (barA > 0) {
        c.fillStyle = ink(0.6 * barA); c.fillRect(TRIM.x + 24, BAR_BASE, TRIM.w - 48, 1.5);
        const tl = oc(t, 2.45, 2.95) * barA;
        if (tl > 0) {
          dashH(TRIM.x + 24, TRIM.x + 24 + (TRIM.w - 48) * oc(t, 2.45, 2.95), yT, ink(0.75 * tl), 9, 6, 1.6);
          c.globalAlpha = tl;
          text('기준', TRIM.x + 24, yT + 30, `700 19px ${KR}`, INK);
          text('HH 100', TRIM.x + 24, yT + 54, `600 17px ${MONO}`, SOFT);
          c.globalAlpha = 1;
        }
        for (const P of pairs) {
          const pct = 100 * measure(P.a, P.b, d[P.i], null, kEnd).A / REF;
          const done = t > T_SOLVE && Math.abs(pct - 100) < 0.35;
          const x = colX(P), w = 54;
          const h = pct * BAR_PX * (1 - barOut);
          const top = BAR_BASE - h;
          const gr = c.createLinearGradient(0, top, 0, BAR_BASE);
          gr.addColorStop(0, tom(0.42 * barA)); gr.addColorStop(1, tom(0.18 * barA));
          c.fillStyle = gr;
          c.beginPath(); c.roundRect(x - w / 2, top, w, h, [9, 9, 0, 0]); c.fill();
          c.fillStyle = tom(0.95 * barA); c.fillRect(x - w / 2, top, w, Math.min(2.5, h));
          for (let y = BAR_BASE - 7; y > top + 4; y -= 8) { c.fillStyle = tom(0.2 * barA); c.fillRect(x - w / 2 + 6, y, w - 12, 1); }
          const ly0 = yBot + 22, ly1 = top - 50;
          if (ly1 > ly0 + 8) dashV(x, ly0, ly1, ink(0.2 * barA), 3, 5, 1);
          c.globalAlpha = barA;
          text(fmt1(pct), x, top - 14, `700 27px ${MONO}`, done ? INK : TOM, 'center');
          if (done) check(x, top - 60, 1, INK);
          serifLabel(P.name, x, BAR_BASE + 44, 40, INK);
          c.globalAlpha = 1;
        }
      }

      // ======== the kerning table: what the solver found vs what the font itself carries
      const tabA = win(t, 6.42, 6.92, 99, 100);
      if (tabA > 0) {
        const ty = TAB_Y + 22 * (1 - tabA);
        c.globalAlpha = tabA;
        card(TRIM.x, ty, TRIM.w, TAB_H);
        text('자간 조정값', TRIM.x + 28, ty + 50, `700 24px ${KR}`, INK);
        text('1/1000 em', TRIM.x + 28 + 132, ty + 50, `500 17px ${MONO}`, SOFT);
        text('글꼴 커닝 = 글꼴 파일에 원래 든 값', TRIM.x + TRIM.w - 28, ty + 50, `500 18px ${KR}`, SOFT, 'right');
        c.fillStyle = ink(0.12); c.fillRect(TRIM.x + 28, ty + 72, TRIM.w - 56, 1);
        const AV = pairs[2];
        c.fillStyle = tom(0.1); c.beginPath(); c.roundRect(colX(AV) - 66, ty + 86, 132, TAB_H - 104, 12); c.fill();
        text('면적 계산', TRIM.x + 28, ty + 194, `700 20px ${KR}`, INK);
        text('글꼴 커닝', TRIM.x + 28, ty + 254, `600 20px ${KR}`, SOFT);
        for (const P of pairs) {
          const x = colX(P);
          serifLabel(P.name, x, ty + 136, 46, INK);
          const big = Math.abs(P.root) > 50;
          text(sgn(P.root), x, ty + 196, `700 ${big ? 40 : 34}px ${MONO}`, big ? TOM : INK, 'center');
          text(sgn(P.kern), x, ty + 254, `500 28px ${MONO}`, SOFT, 'center');
        }
        c.globalAlpha = 1;
      }

      // ======== reference card (HH = 100) and the method card
      const cardA = oc(t, 2.6, 3.1);
      if (cardA > 0) {
        const cy = CARD_Y + 18 * (1 - cardA);
        c.globalAlpha = cardA;
        card(TRIM.x, cy, 446, CARD_H);
        card(TRIM.x + 490, cy, 446, CARD_H);
        const s = 0.56, xh = TRIM.x + 34, bh = cy + 172;
        airShape(refOut, xh, bh, s, 1, { edgeA: 0.95, hatch: 1 });
        drawGlyph(G.H, xh, bh, s, INK);
        drawGlyph(G.H, xh + G.H.adv * K * s, bh, s, INK);
        text('기준 쌍', TRIM.x + 290, cy + 66, `700 24px ${KR}`, INK);
        text('곧은 기둥 둘 사이', TRIM.x + 290, cy + 98, `500 19px ${KR}`, SOFT);
        text('= 100', TRIM.x + 290, cy + 160, `700 40px ${MONO}`, TOM);
        const mx = TRIM.x + 490 + 34;
        [['줄마다 사이 폭을 잰다', 0], ['깊은 곳은 한계까지만 센다', 1], ['가운데 줄에 무게를 더 준다', 2]].forEach(([s2, kind], r) => {
          const ry = cy + 62 + r * 66;
          c.globalAlpha = cardA * oc(t, 2.75 + 0.12 * r, 3.15 + 0.12 * r);
          if (kind === 0) { for (let q = 0; q < 4; q++) { c.fillStyle = tom(0.85); c.fillRect(mx, ry - 26 + q * 7, 34 - (q % 2) * 10, 2); } }
          if (kind === 1) { c.fillStyle = tom(0.3); c.fillRect(mx, ry - 28, 22, 26); dashV(mx + 23, ry - 30, ry, TOM, 4, 3, 1.6); c.fillStyle = INK; c.fillRect(mx + 30, ry - 30, 5, 30); }
          if (kind === 2) {
            c.fillStyle = tom(0.3); c.strokeStyle = TOM; c.lineWidth = 2;
            c.beginPath(); c.moveTo(mx + 2, ry - 31);
            for (let q = 0; q <= 20; q++) { const u = q / 20; c.lineTo(mx + 2 + 30 * (0.35 + 0.65 * Math.sin(Math.PI * u)), ry - 31 + u * 31); }
            c.lineTo(mx + 2, ry); c.fill();
            c.beginPath();
            for (let q = 0; q <= 20; q++) { const u = q / 20, xx = mx + 2 + 30 * (0.35 + 0.65 * Math.sin(Math.PI * u)), yy = ry - 31 + u * 31; if (q) c.lineTo(xx, yy); else c.moveTo(xx, yy); }
            c.stroke();
            c.fillStyle = INK; c.fillRect(mx, ry - 31, 2, 31);
          }
          text(s2, mx + 54, ry - 6, `600 23px ${KR}`, INK);
        });
        c.globalAlpha = 1;
      }

      // ======== comparison: the box-spaced row above the area-spaced word
      const cmpA = win(t, T_CMP, T_CMP + 0.45, T_END, T_END + 0.22);
      if (cmpA > 0) {
        const yOff = -16 * (1 - oc(t, T_CMP, T_CMP + 0.45)) - 20 * ease.inCubic(k01(t, T_END, T_END + 0.22));
        const xs0 = p0.map((u) => X0 + u * K);
        pairs.forEach((P, i) => { measure(P.a, P.b, 0, cmpOut[i]); airShape(cmpOut[i], xs0[i], BEFORE_BASE + yOff, 1, 0.6 * cmpA, { hatch: 0 }); });
        c.globalAlpha = cmpA;
        glyphs.forEach((g, j) => drawGlyph(g, xs0[j], BEFORE_BASE + yOff, 1, GHOST));
        const lab = (s1, s2, y, col) => {
          c.font = `700 21px ${KR}`; const w1 = c.measureText(s1).width;
          c.fillStyle = col; c.beginPath(); c.roundRect(TRIM.x, y - 24, w1 + 24, 34, 17); c.fill();
          text(s1, TRIM.x + 12, y - 1, `700 21px ${KR}`, CARD);
          text(s2, TRIM.x + w1 + 36, y - 1, `600 21px ${KR}`, SOFT);
        };
        lab('전', '글자 상자를 그대로 붙인 자간', BEFORE_BASE - 190 + yOff, GHOST);
        lab('후', '사이 면적을 맞춘 자간', BASE - 196, TOM);
        c.globalAlpha = 1;
      }
    };
  },
  frame(t) {
    this.render(t);
  },
});

// ---------------------------------------------------------------- baked once: desk, sheet, shadow, paper grain
function bakeBackground(mk) {
  const { cv, g } = mk(1080, 1920);
  const r = rand(142);
  g.fillStyle = DESK; g.fillRect(0, 0, 1080, 1920);
  const lamp = g.createRadialGradient(540, 700, 80, 540, 900, 1300);
  lamp.addColorStop(0, 'rgba(255,236,210,0.07)'); lamp.addColorStop(1, 'rgba(0,0,0,0.25)');
  g.fillStyle = lamp; g.fillRect(0, 0, 1080, 1920);
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 46; g.shadowOffsetY = 16;
  g.fillStyle = PAPER; g.fillRect(SHEET.x, SHEET.y, SHEET.w, SHEET.h);
  g.restore();
  const pl = g.createLinearGradient(SHEET.x, SHEET.y, SHEET.x + SHEET.w * 0.4, SHEET.y + SHEET.h);
  pl.addColorStop(0, 'rgba(255,252,244,0.55)'); pl.addColorStop(0.55, 'rgba(255,250,240,0)'); pl.addColorStop(1, 'rgba(120,96,70,0.08)');
  g.fillStyle = pl; g.fillRect(SHEET.x, SHEET.y, SHEET.w, SHEET.h);
  const img = g.getImageData(SHEET.x, SHEET.y, SHEET.w, SHEET.h), px = img.data;
  for (let i = 0; i < px.length; i += 4) {
    const n = (r() - 0.5) * 7 - Math.pow(r(), 6) * 10;
    px[i] = clamp(px[i] + n, 0, 255); px[i + 1] = clamp(px[i + 1] + n, 0, 255); px[i + 2] = clamp(px[i + 2] + n - 1, 0, 255);
  }
  g.putImageData(img, SHEET.x, SHEET.y);
  for (let i = 0; i < 700; i++) {
    const x = SHEET.x + r() * SHEET.w, y = SHEET.y + r() * SHEET.h, a = r() * Math.PI * 2, l = 6 + r() * 22;
    g.strokeStyle = `rgba(140,118,90,${(0.05 + r() * 0.07).toFixed(3)})`; g.lineWidth = 0.6 + r() * 0.6;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l / 2 + (r() - 0.5) * 6, y + Math.sin(a) * l / 2 + (r() - 0.5) * 6, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // printer's colour bar in the foot margin (ink and accent tints)
  [[34, 29, 25, 1], [34, 29, 25, 0.6], [34, 29, 25, 0.3], [226, 84, 58, 1], [226, 84, 58, 0.6], [226, 84, 58, 0.3]]
    .forEach(([R, G2, B, a], i) => { g.fillStyle = `rgba(${R},${G2},${B},${a})`; g.fillRect(TRIM.x + TRIM.w - 6 * 22 + i * 22, 1622, 18, 12); });
  g.fillStyle = 'rgba(115,105,95,0.9)'; g.font = `500 14px ${MONO}`; g.fillText('PROOF 01 · 1:1', TRIM.x, 1633);
  return cv;
}
