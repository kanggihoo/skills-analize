/*
 * 116 · 동틀녘 러닝 클럽 — a logo reveal for an invented dawn running club, 10 s, 1080×1920.
 *
 * One motion idea, taken from the brand ("해보다 먼저 한 바퀴" — one lap before the sun): the lap.
 *   0.3–2.1  two dots (coral, gold) spiral in from the screen edges onto a stadium lane, 180° apart, and each
 *            draws half of the track behind it — the ring closes when both have run half a lap
 *   2.1–2.5  the orbit decays: both spiral into the infield and collide → they merge into the sun (impact)
 *   2.7–3.6  the horizon shoots out of the collision and slices the sun; lane stripes pop in; the sun rises
 *   3.6–5.4  the symbol slides to its lock-up place; the wordmark runs out from behind it along "rails"
 *            (the track's flat edges = the glyphs' flat top/bottom, the horizon = the ㅡ bar of 틀)
 *   5.4–7.85 hold on the lock-up; secondary details only now (shadow settle, sun glint, sparkle, word glint)
 *   7.85–10  variation: the wordmark runs back in, the symbol becomes an app icon (a cream tile grows behind
 *            it and inverts it), with its home-screen label
 *
 * Easing family: GSAP expo (out = enter/settle, inOut = move, in = run-up), power2.in for exits, back.out(1.7)
 * only for small pops. Everything is a closed form of t (gsap.parseEase gives the curves; no timeline state).
 */
import { defineDemo, rand, clamp, lerp } from '../_lib/stage.js';
import { FONTS, fontReady, textAlpha } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';

const D = 10;
const W = 1080, H = 1920;
const TAU = Math.PI * 2;
const KR = `"${FONTS.pretendard.family}"`;

const COL = {
  top: '#13173d', mid: '#1c2156', low: '#2b2461',
  ink: '#1d2154',          // indigo used for the symbol on the cream app tile
  shade: '#060821',
  cream: '#fff1dc', coral: '#ff6a3d', gold: '#ffb63e', lav: '#a8acde',
};

const NAME = '동틀녘';
const TAG = ['해보다', '먼저', '한 바퀴'];
const HEAD_L = '로고 모션 가이드';
const HEAD_R = ['01  기본 락업', '02  앱 아이콘'];

// ------------------------------------------------------------------ easing family
const ez = {
  out: gsap.parseEase('expo.out'),
  inOut: gsap.parseEase('expo.inOut'),
  exit: gsap.parseEase('power2.in'),
  pop: gsap.parseEase('back.out(1.7)'),
};
/** eased progress of t over [a, b] */
const k = (t, a, b, e = ez.out) => e(clamp((t - a) / (b - a)));

// ------------------------------------------------------------------ timing
const T = {
  enter: 0.3, lane: 1.35, close: 2.1, hit: 2.5,
  horizon: 2.72, stripes: 2.98, rise: 3.0,
  move: [3.6, 4.45], rails: [4.0, 4.45], railsOut: [5.0, 5.35],
  letters: 4.0, rule: [4.62, 5.12], tag: 4.82,
  shadow: [5.3, 6.1], sunGlint: [5.75, 6.35], sparkle: [5.95, 6.8], wordGlint: [6.3, 7.15],
  exit: 7.85, icon: [8.0, 8.62], tile: [8.26, 8.76], corner: [8.4, 8.92], head: 8.3,
  label: [8.72, 9.15], tileGlint: [9.2, 9.8], tileSpark: [9.35, 10.0],
};

// ------------------------------------------------------------------ symbol geometry (local units)
const S = {
  B: 78,        // outer half-height: the flat top/bottom edges sit on the glyphs' flat top/bottom
  L: 52,        // straight half-length of the stadium
  RW: 26, R: 65, Ri: 52,   // ring width, centre-line radius, infield radius (RW set from the wordmark stroke)
  yh: 8,        // horizon y (set from the ㅡ bar of 틀)
  HT: 9,        // horizon thickness
  SR: 40,       // sun radius
  GAP: 4,       // air between sun and horizon
  stripes: [],  // [{ y, hl }]
  HL: 90,       // horizon half-length
};
const DR = 15;                 // running dot radius
const A_SCALE = 1.75;          // px per unit while the symbol is built at the centre
const CX = 540, CY = 850;      // composition centre

/** point on a stadium path at lap fraction u (0 = bottom centre, counter-clockwise on screen) */
function stad(u, L, r) {
  const P = 4 * L + 2 * Math.PI * r;
  let s = (((u % 1) + 1) % 1) * P;
  if (s < L) return [s, r];
  s -= L;
  if (s < Math.PI * r) { const a = Math.PI / 2 - s / r; return [L + r * Math.cos(a), r * Math.sin(a)]; }
  s -= Math.PI * r;
  if (s < 2 * L) return [L - s, -r];
  s -= 2 * L;
  if (s < Math.PI * r) { const a = -Math.PI / 2 - s / r; return [-L + r * Math.cos(a), r * Math.sin(a)]; }
  s -= Math.PI * r;
  return [-L + s, r];
}
function stadiumPath(c, L, r, x = 0, y = 0) {
  c.moveTo(x - L, y - r); c.lineTo(x + L, y - r);
  c.arc(x + L, y, r, -Math.PI / 2, Math.PI / 2);
  c.lineTo(x - L, y + r);
  c.arc(x - L, y, r, Math.PI / 2, Math.PI * 1.5);
}
function arcPoly(c, q0, q1, L, r) {
  const P = 4 * L + 2 * Math.PI * r;
  const n = Math.max(2, Math.ceil(Math.abs(q1 - q0) * P / 2));
  for (let i = 0; i <= n; i++) {
    const [x, y] = stad(q0 + (q1 - q0) * i / n, L, r);
    if (i) c.lineTo(x, y); else c.moveTo(x, y);
  }
}
/** horizontal pill from x0 to x1 (centres of the caps) */
function pill(c, x0, x1, y, th) {
  const r = th / 2;
  c.moveTo(x0, y - r); c.lineTo(x1, y - r);
  c.arc(x1, y, r, -Math.PI / 2, Math.PI / 2);
  c.lineTo(x0, y + r);
  c.arc(x0, y, r, Math.PI / 2, Math.PI * 1.5);
}
function roundRect(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
  c.lineTo(x + w, y + h - r); c.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  c.lineTo(x + r, y + h); c.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  c.lineTo(x, y + r); c.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
}
function star4(c, x, y, r, rot) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath();
  c.moveTo(0, -r); c.quadraticCurveTo(0, 0, r, 0); c.quadraticCurveTo(0, 0, 0, r);
  c.quadraticCurveTo(0, 0, -r, 0); c.quadraticCurveTo(0, 0, 0, -r);
  c.fill(); c.restore();
}
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a.toFixed(4)})`; };

// ------------------------------------------------------------------ the lap: two dots, closed form
/** lap fraction of the coral dot (gold = +0.5); C¹ across the three phases */
function qOf(t) {
  if (t <= T.lane) { const d = T.lane - t; return 0.25 - (2 / 3) * d - 0.25 * d * d; }
  if (t <= T.close) return 0.25 + (2 / 3) * (t - T.lane);
  const d = t - T.close; return 0.75 + (2 / 3) * d + 4.86 * d * d * d;   // spins up as the orbit decays
}
/** size of the orbit relative to the lane: 7 → 1 (spiral in), 1 (on the lane), 1 → 0 (decay into the merge) */
function sigOf(t) {
  if (t < T.lane) return lerp(7, 1, k(t, T.enter, T.lane, ez.out));
  if (t < T.close) return 1;
  return 1 - k(t, T.close, T.hit, ez.exit);
}
/** local position of dot j (0 coral, 1 gold) at time t */
function dotPos(t, j) {
  const s = sigOf(t), q = qOf(t) + j * 0.5;
  const [x, y] = stad(q, S.L * s, S.R * s);
  return [x, y + S.sunY0 * (1 - Math.min(1, s))];
}

// ------------------------------------------------------------------ measuring the wordmark
/** rasterise one syllable and find its flat top/bottom and its widest horizontal bar (in em, y down from the baseline) */
function measureGlyph(ch) {
  const PX = 400, w = 600, h = 600, bx = 100, by = 470;
  const a = textAlpha(w, h, (c) => { c.font = `800 ${PX}px ${KR}`; c.textBaseline = 'alphabetic'; c.fillText(ch, bx, by); });
  const runs = new Float32Array(h);
  let top = -1, bot = -1, maxRun = 0;
  for (let y = 0; y < h; y++) {
    let run = 0, best = 0, sum = 0;
    for (let x = 0; x < w; x++) {
      const v = a[y * w + x]; sum += v;
      if (v > 0.5) { run++; if (run > best) best = run; } else run = 0;
    }
    runs[y] = best; if (best > maxRun) maxRun = best;
    if (sum > 1) { if (top < 0) top = y; bot = y; }
  }
  // edge rows: sub-pixel position from the row's peak coverage
  const peak = (y) => { let m = 0; for (let x = 0; x < w; x++) m = Math.max(m, a[y * w + x]); return m; };
  const topY = top + 1 - peak(top), botY = bot + peak(bot);
  const clusters = [];
  let cur = null;
  for (let y = top; y <= bot; y++) {
    if (runs[y] >= 0.86 * maxRun) { if (!cur) { cur = { y0: y, y1: y }; clusters.push(cur); } else cur.y1 = y; } else cur = null;
  }
  const mid = (topY + botY) / 2;
  clusters.sort((p, q) => Math.abs((p.y0 + p.y1) / 2 - mid) - Math.abs((q.y0 + q.y1) / 2 - mid));
  const bar = clusters[0];
  return {
    top: (topY - by) / PX, bottom: (botY - by) / PX,
    bar: ((bar.y0 + bar.y1 + 1) / 2 - by) / PX, barT: (bar.y1 - bar.y0 + 1) / PX,
    clusters: clusters.map((c) => [(c.y0 - by) / PX, (c.y1 + 1 - by) / PX]),
  };
}

defineDemo({
  id: '116-logo-reveal',
  title: '동틀녘 러닝 클럽',
  tech: '로고 리빌 · 도형이 모여 심벌과 워드마크로',
  duration: D,
  background: COL.mid,

  async setup(api) {
    const ALL = NAME + TAG.join('') + HEAD_L + HEAD_R.join('') + '0123456789 ';
    await Promise.all([
      fontReady(`800 200px ${KR}`, ALL),
      fontReady(`600 44px ${KR}`, ALL),
    ]);
    const cv = api.canvas({ attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = cv.ctx;
    const off = (w, h) => {
      const e = document.createElement('canvas'); e.width = w; e.height = h;
      return { e, c: e.getContext('2d', api.headless ? { willReadFrequently: true } : undefined) };
    };

    // ---------- wordmark metrics → lock-up layout
    const m = measureGlyph('틀');
    this.metric = m;
    const mc = off(8, 8).c;
    mc.font = `800 100px ${KR}`;
    const TRACK = -0.03;                       // final tracking of the wordmark (em)
    const g = Array.from(NAME).map((ch) => {
      const mm = mc.measureText(ch);
      return { ch, adv: mm.width / 100, inkL: mm.actualBoundingBoxLeft / 100, inkR: mm.actualBoundingBoxRight / 100 };
    });
    let pen = 0;
    for (const gl of g) { gl.pen = pen; pen += gl.adv + TRACK; }
    const inkLeft = g[0].pen - g[0].inkL, inkRight = g[g.length - 1].pen + g[g.length - 1].inkR;
    const Hg = m.bottom - m.top;                          // flat glyph height (em)
    // the ring is as heavy as the wordmark's horizontal strokes (×1.1 for the ring's curves)
    const sPerF = Hg / (2 * S.B);                         // px per symbol unit, per px of font size
    S.RW = Math.min(30, Math.max(20, (m.barT * 1.1) / sPerF));
    S.R = S.B - S.RW / 2; S.Ri = S.B - S.RW;
    const symW = 2 * (S.L + S.B) * sPerF;                // symbol width (em)
    const gap = 0.27 * Hg;                                // optical gap: round end → flat stem of 동
    const total = symW + gap + (inkRight - inkLeft);
    const F = 860 / total;
    const sL = sPerF * F;
    const x0 = (W - 860) / 2;
    const L = {
      F, sL, track: TRACK,
      symX: x0 + (S.L + S.B) * sL, symY: CY,
      top: CY - (Hg * F) / 2, bottom: CY + (Hg * F) / 2,
    };
    L.base = L.top - m.top * F;
    L.barY = L.base + m.bar * F;
    L.inkL = x0; L.inkR = x0 + 860;
    const wx = x0 + symW * F + gap * F - inkLeft * F;   // pen x of the first glyph
    L.glyphs = g.map((gl) => ({ ch: gl.ch, x: wx + gl.pen * F, w: gl.adv * F, inkL: gl.inkL * F, inkR: gl.inkR * F }));
    L.wordL = wx + inkLeft * F;
    this.L = L;

    // horizon on the ㅡ bar of 틀, sun, stripes
    S.yh = (L.barY - L.symY) / sL;
    S.HT = Math.max(7, Math.min(11, (m.barT * F * 0.55) / sL));
    S.sunY0 = S.yh + 10;                   // where the dots merge (slightly below the horizon)
    S.sunY1 = S.yh - 5;                    // where the sun ends after rising
    const half = (y) => S.L + Math.sqrt(Math.max(0, S.Ri * S.Ri - y * y));   // infield half-width at y
    S.HL = half(S.yh) - S.HT / 2 - 11;
    {
      const top = S.yh + S.HT / 2, room = S.Ri - top, th = 7;
      const gp = (room - 2 * th) / 3;
      const y1 = top + gp + th / 2, y2 = y1 + th + gp;
      S.stripes = [{ y: y1, hl: Math.min(62, half(y1 + th / 2) - 22), th }, { y: y2, hl: Math.min(34, half(y2 + th / 2) - 30), th }];
    }

    // tagline layout (centred under the lock-up)
    mc.font = `600 44px ${KR}`;
    const sp = mc.measureText(' ').width;
    const wds = TAG.map((w) => ({ w, wd: mc.measureText(w).width }));
    const tw = wds.reduce((s, x) => s + x.wd, 0) + sp * (wds.length - 1);
    let tx = CX - tw / 2;
    for (const x of wds) { x.x = tx; tx += x.wd + sp; }
    this.tag = { words: wds, base: L.bottom + 150, rule: L.bottom + 76 };

    // icon geometry (variation)
    this.icon = { x: CX, y: CY - 30, half: 190, rad: 0.2237 * 380, s: (0.74 * 380) / (2 * (S.L + S.B)) };

    // ---------- baked sprites: grain tile, lock-up shadow, tile shadow
    const r = rand(116);
    const gr = off(256, 256);
    {
      const id = gr.c.createImageData(256, 256);
      for (let i = 0; i < 256 * 256; i++) {
        const v = r(), light = v > 0.5;
        const a = Math.abs(v - 0.5) * 2;
        id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = light ? 255 : 0;
        id.data[i * 4 + 3] = Math.round(a * a * (light ? 16 : 26));
      }
      gr.c.putImageData(id, 0, 0);
    }
    this.grain = this.ctx.createPattern(gr.e, 'repeat');

    const SH_Y0 = CY - 260, SH_H = 520;
    const sh = off(W, SH_H);
    sh.c.filter = 'blur(16px)';
    sh.c.translate(0, -SH_Y0);
    this.drawLockupFlat(sh.c, COL.shade);
    sh.c.filter = 'none';
    this.shadow = { img: sh.e, y0: SH_Y0 };

    const ts = off(560, 560);
    ts.c.filter = 'blur(26px)';
    ts.c.fillStyle = COL.shade;
    ts.c.beginPath(); roundRect(ts.c, 90, 90, 380, 380, this.icon.rad); ts.c.fill();
    ts.c.filter = 'none';
    this.tileShadow = ts.e;

    // spark primitives for the merge
    const sr = rand(2501);
    this.sparks = Array.from({ length: 16 }, (_, i) => ({
      a: (i / 16) * TAU + (sr() - 0.5) * 0.3,
      d: 120 + sr() * 110,
      kind: i % 3,                               // 0 triangle · 1 pill · 2 dot
      col: [COL.coral, COL.gold, COL.cream][(i * 7) % 3],
      size: 5 + sr() * 4,
      spin: (sr() - 0.5) * 6,
    }));

    // warm up: composite each baked image once (first composite may differ by ±1/255 otherwise)
    const c = this.ctx;
    c.globalAlpha = 0.01;
    c.drawImage(this.shadow.img, 0, 0); c.drawImage(this.tileShadow, 0, 0);
    c.fillStyle = this.grain; c.fillRect(0, 0, 8, 8);
    c.globalAlpha = 1;
    c.clearRect(0, 0, W, H);
  },

  // ---------------------------------------------------------------- the final lock-up as flat silhouettes (shadow bake)
  drawLockupFlat(c, col) {
    const L = this.L;
    c.save();
    c.translate(L.symX, L.symY); c.scale(L.sL, L.sL);
    this.drawSymbol(c, this.finalSymbol(), { ring: col, hor: col, sunTop: col, sunBot: col });
    c.restore();
    c.fillStyle = col;
    c.font = `800 ${L.F}px ${KR}`;
    for (const gl of L.glyphs) c.fillText(gl.ch, gl.x, L.base);
  },

  finalSymbol() {
    return { ringFull: true, ringW: S.RW, sunR: S.SR, sunY: S.sunY1, hl: S.HL, stripes: [1, 1] };
  },

  /** the symbol in local units around (0,0). st: ring (full | arcs), sun, horizon, stripes, glint */
  drawSymbol(c, st, pal) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = pal.ring;
    if (st.ringFull) {
      c.lineWidth = st.ringW;
      c.beginPath(); stadiumPath(c, S.L, S.R); c.stroke();
    } else if (st.arcs) {
      c.lineWidth = st.ringW;
      for (const [q0, q1] of st.arcs) if (q1 - q0 > 1e-4) { c.beginPath(); arcPoly(c, q0, q1, S.L, S.R); c.stroke(); }
    }
    if (st.sunR > 0) {
      c.save();
      c.beginPath(); stadiumPath(c, S.L, S.Ri); c.clip();          // the infield is a window
      if (st.hl > 0) {                                               // the horizon hides what is below it
        c.beginPath();
        c.rect(-400, -400, 800, 800);
        c.rect(-st.hl - S.HT, S.yh - S.HT / 2 - S.GAP, 2 * (st.hl + S.HT), 400);
        c.clip('evenodd');
      }
      const gsun = c.createLinearGradient(0, st.sunY - st.sunR, 0, S.yh);
      gsun.addColorStop(0, pal.sunTop); gsun.addColorStop(1, pal.sunBot);
      c.fillStyle = gsun;
      c.beginPath(); c.arc(0, st.sunY, st.sunR, 0, TAU); c.fill();
      if (st.glint != null) {                                        // a light band across the sun
        c.beginPath(); c.arc(0, st.sunY, st.sunR, 0, TAU); c.clip();
        c.translate(st.glint, st.sunY); c.rotate(0.6);
        const gb = c.createLinearGradient(-16, 0, 16, 0);
        gb.addColorStop(0, 'rgba(255,248,230,0)'); gb.addColorStop(0.5, 'rgba(255,248,230,0.7)'); gb.addColorStop(1, 'rgba(255,248,230,0)');
        c.fillStyle = gb; c.fillRect(-16, -80, 32, 160);
      }
      c.restore();
    }
    if (st.hl > 0) {
      c.fillStyle = pal.hor;
      c.beginPath(); pill(c, -st.hl, st.hl, S.yh, S.HT * Math.min(1, 0.4 + st.hl / 30)); c.fill();
    }
    S.stripes.forEach((sp, i) => {
      const p = st.stripes[i];
      if (p <= 0) return;
      const hl = sp.hl * p;
      c.fillStyle = pal.hor;
      c.beginPath(); pill(c, -hl, hl, sp.y, sp.th * Math.min(1, 0.3 + p)); c.fill();
    });
  },

  /** symbol state at time t */
  symbolAt(t) {
    if (t >= T.close + 0.6) {
      const st = this.finalSymbol();
      st.sunY = lerp(S.sunY0, S.sunY1, k(t, T.rise, T.rise + 0.7, ez.out));
      st.hl = S.HL * k(t, T.horizon, T.horizon + 0.45, ez.out);
      st.stripes = S.stripes.map((_, i) => k(t, T.stripes + i * 0.09, T.stripes + i * 0.09 + 0.5, ez.pop));
      st.sunR = t < T.hit ? 0 : S.SR * lerp(0.45, 1, k(t, T.hit, T.hit + 0.5, ez.pop));
      st.ringW = lerp(9, S.RW, k(t, T.close, T.close + 0.5, ez.pop));
      if (t > T.sunGlint[0] && t < T.sunGlint[1]) st.glint = lerp(-70, 70, k(t, T.sunGlint[0], T.sunGlint[1], ez.inOut));
      return st;
    }
    const st = { ringFull: false, ringW: 9, sunR: 0, sunY: S.sunY0, hl: 0, stripes: [0, 0] };
    if (t > T.lane) {
      const q = qOf(Math.min(t, T.close));
      st.arcs = [[0.25, q], [0.75, q + 0.5]];
    }
    if (t >= T.close) {
      st.ringFull = true; st.arcs = null;
      st.ringW = lerp(9, S.RW, k(t, T.close, T.close + 0.5, ez.pop));
    }
    if (t >= T.hit) st.sunR = S.SR * lerp(0.45, 1, k(t, T.hit, T.hit + 0.5, ez.pop));
    return st;
  },

  // ---------------------------------------------------------------- frame
  frame(t) {
    const c = this.ctx, L = this.L;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
    c.lineCap = 'butt'; c.lineJoin = 'miter'; c.setLineDash([]);
    c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)'; c.shadowOffsetX = 0; c.shadowOffsetY = 0;
    c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.imageSmoothingEnabled = true;

    // where the symbol is: built at the centre, then the lock-up, then the app icon
    const mv = k(t, T.move[0], T.move[1], ez.inOut);
    const iv = k(t, T.icon[0], T.icon[1], ez.inOut);
    let sx = lerp(CX, L.symX, mv), sy = lerp(CY, L.symY, mv), ss = lerp(A_SCALE, L.sL, mv);
    sx = lerp(sx, this.icon.x, iv); sy = lerp(sy, this.icon.y, iv); ss = lerp(ss, this.icon.s, iv);
    const sunOn = k(t, T.hit, T.hit + 1.2, ez.inOut);

    this.drawBackground(c, t, sunOn, sx, sy, ss);

    // camera: a slow push while the lap runs, a punch on the merge, back to rest for the lock-up, then a slow drift
    const punch = t > T.hit && t < T.hit + 0.35 ? 0.03 * Math.sin(Math.PI * (t - T.hit) / 0.35) * (1 - (t - T.hit) / 0.35) : 0;
    const cam = 1 + 0.035 * k(t, T.enter, T.hit, ez.inOut) * (1 - mv) + punch + 0.012 * k(t, 5.4, 7.85, (p) => p) * (1 - k(t, T.exit, T.exit + 0.5, ez.inOut));
    c.save();
    c.translate(CX, CY); c.scale(cam, cam); c.translate(-CX, -CY);

    // shadow settle (after the lock-up)
    const shA = k(t, T.shadow[0], T.shadow[1], ez.out) * (1 - k(t, T.exit, T.exit + 0.2, ez.exit));
    if (shA > 0) {
      const dy = lerp(2, 16, k(t, T.shadow[0], T.shadow[1], ez.out));
      c.globalAlpha = 0.6 * shA;
      c.drawImage(this.shadow.img, 0, this.shadow.y0 + dy);
      c.globalAlpha = 1;
    }

    // app tile (variation): grows behind the symbol and inverts it
    const tg = k(t, T.tile[0], T.tile[1], ez.out);
    const tm = k(t, T.corner[0], T.corner[1], ez.inOut);
    const ic = this.icon;
    const tHalf = ic.half * tg, tRad = lerp(tHalf, ic.rad * tg, tm);
    if (tg > 0) {
      c.globalAlpha = 0.55 * tm;
      const sc = tHalf / ic.half;
      c.drawImage(this.tileShadow, sx - 280 * sc, sy - 280 * sc + 26, 560 * sc, 560 * sc);
      c.globalAlpha = 1;
      const tgrd = c.createLinearGradient(0, sy - tHalf, 0, sy + tHalf);
      tgrd.addColorStop(0, '#fff6e8'); tgrd.addColorStop(1, '#ffe4c8');
      c.fillStyle = tgrd;
      c.beginPath(); roundRect(c, sx - tHalf, sy - tHalf, 2 * tHalf, 2 * tHalf, tRad); c.fill();
    }

    // the symbol
    const st = this.symbolAt(t);
    const PAL = { ring: COL.cream, hor: COL.cream, sunTop: COL.gold, sunBot: COL.coral };
    const INV = { ring: COL.ink, hor: COL.ink, sunTop: COL.gold, sunBot: COL.coral };
    if (sunOn > 0) {                                     // warm glow behind the sun
      const gx = sx, gy = sy + S.yh * ss, gr = 300 * ss / A_SCALE;
      const glow = c.createRadialGradient(gx, gy, 0, gx, gy, gr * 1.6);
      glow.addColorStop(0, rgba(COL.gold, 0.16 * sunOn * (1 - tg)));
      glow.addColorStop(1, rgba(COL.gold, 0));
      c.fillStyle = glow; c.fillRect(gx - gr * 1.6, gy - gr * 1.6, gr * 3.2, gr * 3.2);
    }
    c.save();
    c.translate(sx, sy); c.scale(ss, ss);
    if (t > T.enter && t < T.hit + 0.25) this.drawTails(c, t);
    if (tg > 0) {
      c.save();
      c.beginPath(); c.rect(-2000, -2000, 4000, 4000); roundRect(c, -tHalf / ss, -tHalf / ss, 2 * tHalf / ss, 2 * tHalf / ss, tRad / ss); c.clip('evenodd');
      this.drawSymbol(c, st, PAL);
      c.restore();
      c.save();
      c.beginPath(); roundRect(c, -tHalf / ss, -tHalf / ss, 2 * tHalf / ss, 2 * tHalf / ss, tRad / ss); c.clip();
      this.drawSymbol(c, st, INV);
      c.restore();
    } else {
      this.drawSymbol(c, st, PAL);
    }
    if (t < T.hit) this.drawDots(c, t);
    if (t >= T.hit && t < T.hit + 0.9) this.drawImpact(c, t);
    c.restore();

    this.drawWordmark(c, t, sx, sy, ss);
    this.drawSecondary(c, t, sx, sy, ss, tHalf, tRad);
    c.restore();   // camera

    this.drawFrameUI(c, t);
  },

  // ---------------------------------------------------------------- background: brand field, lanes, dawn glow, grain
  drawBackground(c, t, sunOn) {
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, COL.top); bg.addColorStop(0.55, COL.mid); bg.addColorStop(1, COL.low);
    c.fillStyle = bg; c.fillRect(0, 0, W, H);

    // dawn glow from below — warms as the sun forms
    const g = 0.45 + 0.55 * sunOn;
    const dg = c.createRadialGradient(CX, 2050, 0, CX, 2050, 1300);
    dg.addColorStop(0, `rgba(255,122,72,${(0.5 * g).toFixed(4)})`);
    dg.addColorStop(0.42, `rgba(196,70,112,${(0.24 * g).toFixed(4)})`);
    dg.addColorStop(1, 'rgba(70,40,120,0)');
    c.fillStyle = dg; c.fillRect(0, 0, W, H);
    // the far sun: a huge soft disc that rises behind the field's horizon with the logo's sun
    const fy = lerp(1900, 1700, k(t, T.hit, T.hit + 2.2, ez.inOut));
    const fd = c.createRadialGradient(CX, fy, 300, CX, fy, 620);
    fd.addColorStop(0, `rgba(255,150,90,${(0.16 * g).toFixed(4)})`);
    fd.addColorStop(0.7, `rgba(255,120,90,${(0.07 * g).toFixed(4)})`);
    fd.addColorStop(1, 'rgba(255,120,90,0)');
    c.fillStyle = fd; c.fillRect(0, fy - 620, W, 1240);
    // supergraphic from the mark: a big sliced sun rising behind a far horizon (low contrast)
    const rs = k(t, T.hit - 0.2, T.hit + 2.6, ez.inOut);
    const HZ = 1560, SRb = 400, scy = lerp(HZ + SRb + 40, HZ + 40, rs);
    if (scy - SRb < HZ) {
      c.save();
      c.beginPath(); c.rect(0, 0, W, HZ);
      let y = HZ - 14;                     // slices widen toward the horizon
      for (let i = 0; i < 5; i++) { const th = 13 - i * 2.2; c.rect(0, y - th, W, th); y -= th + 26 + i * 9; }
      c.clip('evenodd');
      const sg = c.createLinearGradient(0, scy - SRb, 0, HZ);
      sg.addColorStop(0, 'rgba(255,182,62,0.15)'); sg.addColorStop(1, 'rgba(255,106,61,0.10)');
      c.fillStyle = sg;
      c.beginPath(); c.arc(CX, scy, SRb, 0, TAU); c.fill();
      c.restore();
      c.fillStyle = 'rgba(255,214,170,0.10)';
      c.fillRect(CX - 470, HZ, 940, 2);
    }

    // the track's lanes as the brand pattern: concentric stadiums drifting outward, one lane every ~6 s
    const camP = 1 + 0.017 * k(t, T.enter, T.hit, ez.inOut);
    const drift = (t * 0.17) % 1;
    c.save();
    c.translate(CX, CY); c.scale(camP, camP);
    c.lineWidth = 2;
    for (let i = 0; i < 17; i++) {
      const f = i + drift;
      const r = 200 + 62 * f;
      let a = 0.075 * clamp(f / 1.2) * (1 - clamp((f - 11) / 6));
      if (i % 4 === 3) a *= 1.6;
      c.strokeStyle = rgba(COL.lav, a);
      c.beginPath(); stadiumPath(c, 91, r); c.stroke();
    }
    c.restore();
  },

  // ---------------------------------------------------------------- the two runners (local units)
  drawTails(c, t) {
    const cols = [COL.coral, COL.gold];
    const th = Math.min(t, T.hit);
    for (let j = 0; j < 2; j++) {
      // comet tail: the dot's own past positions over 0.2 s, as one tapered ribbon (no overlapping alpha beads)
      const N = 24, span = 0.2;
      const tEnd = Math.max(T.enter, t - span);
      if (th - tEnd > 0.004) {
        const pts = [];
        for (let i = 0; i <= N; i++) pts.push(dotPos(lerp(th, tEnd, i / N), j));
        const Lp = [], Rp = [];
        for (let i = 0; i <= N; i++) {
          const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)];
          let tx = a[0] - b[0], ty = a[1] - b[1];
          const len = Math.hypot(tx, ty) || 1; tx /= len; ty /= len;
          const w = DR * 0.82 * Math.pow(1 - i / N, 0.85) * clamp((th - tEnd) / 0.05);
          Lp.push([pts[i][0] - ty * w, pts[i][1] + tx * w]);
          Rp.push([pts[i][0] + ty * w, pts[i][1] - tx * w]);
        }
        const gr = c.createLinearGradient(pts[0][0], pts[0][1], pts[N][0], pts[N][1]);
        gr.addColorStop(0, rgba(cols[j], 0.85)); gr.addColorStop(1, rgba(cols[j], 0));
        c.fillStyle = gr;
        c.beginPath();
        c.moveTo(Lp[0][0], Lp[0][1]);
        for (let i = 1; i <= N; i++) c.lineTo(Lp[i][0], Lp[i][1]);
        for (let i = N; i >= 0; i--) c.lineTo(Rp[i][0], Rp[i][1]);
        c.fill();
      }
    }
  },
  drawDots(c, t) {
    if (t < T.enter) return;
    const cols = [COL.coral, COL.gold];
    for (let j = 0; j < 2; j++) {
      // the dot, stretched along its velocity
      const p = dotPos(t, j), p0 = dotPos(t - 1 / 240, j), p1 = dotPos(t + 1 / 240, j);
      const vx = (p1[0] - p0[0]) * 120, vy = (p1[1] - p0[1]) * 120;
      const v = Math.hypot(vx, vy) * A_SCALE;
      const str = 1 + Math.min(0.5, v / 3000);
      c.save();
      c.translate(p[0], p[1]); c.rotate(Math.atan2(vy, vx));
      c.fillStyle = cols[j];
      c.beginPath(); c.ellipse(0, 0, DR * str, DR / Math.sqrt(str), 0, 0, TAU); c.fill();
      c.restore();
    }
  },

  // ---------------------------------------------------------------- the merge: flash, shock ring, primitive sparks
  drawImpact(c, t) {
    const u = t - T.hit;
    const y0 = S.sunY0;
    const pf = clamp(u / 0.35);
    if (pf < 1) {
      const fl = c.createRadialGradient(0, y0, 0, 0, y0, 170);
      fl.addColorStop(0, `rgba(255,244,214,${(0.35 * (1 - pf) * (1 - pf)).toFixed(4)})`);
      fl.addColorStop(1, 'rgba(255,244,214,0)');
      c.fillStyle = fl; c.fillRect(-170, y0 - 170, 340, 340);
    }
    const pr = k(t, T.hit, T.hit + 0.7, ez.out);
    if (pr < 1) {
      c.strokeStyle = rgba(COL.cream, 0.75 * (1 - pr));
      c.lineWidth = 7 * (1 - pr) + 0.8;
      c.beginPath(); c.arc(0, y0, lerp(30, 175, pr), 0, TAU); c.stroke();
    }
    for (const s of this.sparks) {
      const p = clamp(u / 0.8);
      if (p >= 1) continue;
      const d = s.d * ez.out(p);
      const x = Math.cos(s.a) * d, y = y0 + Math.sin(s.a) * d * 0.8;
      const sz = s.size * (1 - p * p);
      c.save();
      c.translate(x, y); c.rotate(s.a + s.spin * p);
      c.fillStyle = s.col;
      c.beginPath();
      if (s.kind === 0) { c.moveTo(sz, 0); c.lineTo(-sz * 0.6, sz * 0.85); c.lineTo(-sz * 0.6, -sz * 0.85); }
      else if (s.kind === 1) pill(c, -sz * 0.9, sz * 0.9, 0, sz * 0.75);
      else c.arc(0, 0, sz * 0.6, 0, TAU);
      c.fill();
      c.restore();
    }
  },

  // ---------------------------------------------------------------- wordmark, rails, rule, tagline (screen px)
  drawWordmark(c, t, sx, sy, ss) {
    const L = this.L;
    if (t < T.rails[0] || t > T.exit + 0.45) return;

    // rails: the track's flat edges and the horizon, extended to where the glyphs will sit
    const rIn = k(t, T.rails[0], T.rails[1], ez.out), rOut = k(t, T.railsOut[0], T.railsOut[1], ez.inOut);
    if (rIn > 0 && rOut < 1) {
      const xm = sx + (S.L + Math.sqrt(S.B * S.B - S.yh * S.yh)) * ss + 8;
      const lines = [[sy - S.B * ss, sx + S.L * ss, COL.cream, 0.42], [sy + S.yh * ss, xm, COL.coral, 0.75], [sy + S.B * ss, sx + S.L * ss, COL.cream, 0.42]];
      for (const [y, x0, col, a] of lines) {
        const xEnd = lerp(x0, L.inkR + 36, rIn), xStart = lerp(x0, L.inkR + 36, rOut);
        c.fillStyle = rgba(col, a);
        c.fillRect(xStart, Math.round(y) - 1, Math.max(0, xEnd - xStart), 2);
      }
    }

    // glyphs: run out from behind the symbol (clip = everything right of the symbol's centre, minus its right half)
    c.save();
    c.beginPath();
    const KO = S.B * ss + 9;                     // knockout: a sliver of field between ring and glyph
    c.rect(sx, 0, W - sx + 10, H);
    c.moveTo(sx, sy - KO); c.lineTo(sx + S.L * ss, sy - KO);
    c.arc(sx + S.L * ss, sy, KO, -Math.PI / 2, Math.PI / 2);
    c.lineTo(sx, sy + KO); c.closePath();
    c.clip('evenodd');
    c.font = `800 ${L.F}px ${KR}`;
    c.fillStyle = COL.cream;
    const n = L.glyphs.length;
    const glint = t > T.wordGlint[0] && t < T.wordGlint[1] ? lerp(L.wordL - 140, L.inkR + 140, k(t, T.wordGlint[0], T.wordGlint[1], ez.inOut)) : null;
    const letterX = (tt, i, g) => {
      const t0 = T.letters + (n - 1 - i) * 0.085;
      const hid = sx - g.w / 2;                   // behind the symbol
      return lerp(lerp(hid, g.x, k(tt, t0, t0 + 0.95, ez.out)), hid, k(tt, T.exit + i * 0.04, T.exit + i * 0.04 + 0.32, ez.exit));
    };
    L.glyphs.forEach((g, i) => {
      if (t >= T.exit + i * 0.04 + 0.32) return;    // fully back behind the symbol
      const x = letterX(t, i, g);
      // speed stretch: letters lengthen while they run, relax as they lock
      const v = Math.abs(letterX(t + 1 / 120, i, g) - x) * 120;
      const str = 1 + Math.min(0.22, v / 5200);
      c.save();
      c.translate(x + g.w / 2, L.base); c.scale(str, 1); c.translate(-g.w / 2, 0);
      c.fillText(g.ch, 0, 0);
      if (glint != null) {
        const gg = c.createLinearGradient(glint - x - 70, 0, glint - x + 70, 0);
        gg.addColorStop(0, 'rgba(255,182,62,0)'); gg.addColorStop(0.5, 'rgba(255,182,62,0.9)'); gg.addColorStop(1, 'rgba(255,182,62,0)');
        c.fillStyle = gg; c.fillText(g.ch, 0, 0); c.fillStyle = COL.cream;
      }
      c.restore();
    });
    c.restore();

    // finish-line rule and tagline
    const tg = this.tag;
    const out = k(t, T.exit, T.exit + 0.3, ez.exit);
    const rr = k(t, T.rule[0], T.rule[1], ez.inOut);
    if (rr > 0 && out < 1) {
      const rw = 120;
      c.fillStyle = rgba(COL.cream, 0.45 * (1 - out));
      c.fillRect(CX - rw / 2 * rr, tg.rule + 26 * out, rw * rr, 2);
    }
    c.font = `600 44px ${KR}`;
    tg.words.forEach((w, i) => {
      const p = k(t, T.tag + i * 0.08, T.tag + i * 0.08 + 0.65, ez.out);
      if (p <= 0) return;
      c.save();
      c.beginPath(); c.rect(0, tg.base - 52, W, 70); c.clip();
      c.globalAlpha = 1 - out;
      c.fillStyle = i === 2 ? COL.coral : rgba(COL.cream, 0.88);
      c.fillText(w.w, w.x, tg.base + 64 * (1 - p) + 30 * out);
      c.restore();
    });
  },

  // ---------------------------------------------------------------- secondary details after each lock-up
  drawSecondary(c, t, sx, sy, ss, tHalf, tRad) {
    // sparkle at the ring's upper right
    const sp = clamp((t - T.sparkle[0]) / (T.sparkle[1] - T.sparkle[0]));
    if (sp > 0 && sp < 1) {
      const a = Math.sin(Math.PI * sp);
      c.fillStyle = rgba(COL.cream, 0.95 * a);
      star4(c, sx + 128 * ss, sy - 84 * ss, 23 * ss * ez.pop(Math.min(1, sp * 2)) * (1 - 0.3 * sp), sp * 1.2);
      c.fillStyle = rgba(COL.gold, 0.9 * a);
      const d1 = k(t, T.sparkle[0] + 0.08, T.sparkle[0] + 0.5, ez.out);
      c.beginPath(); c.arc(sx + (146 + 14 * d1) * ss, sy - (52 - 10 * d1) * ss, 3.4 * ss * a, 0, TAU); c.fill();
      c.beginPath(); c.arc(sx + (104 - 8 * d1) * ss, sy - (108 + 12 * d1) * ss, 2.6 * ss * a, 0, TAU); c.fill();
    }
    // app tile: glint band + a sparkle on its corner
    if (tHalf > 0) {
      const gp = k(t, T.tileGlint[0], T.tileGlint[1], ez.inOut);
      if (gp > 0 && gp < 1) {
        c.save();
        c.beginPath(); roundRect(c, sx - tHalf, sy - tHalf, 2 * tHalf, 2 * tHalf, tRad); c.clip();
        c.translate(lerp(sx - tHalf - 120, sx + tHalf + 120, gp), sy); c.rotate(0.45);
        const gb = c.createLinearGradient(-40, 0, 40, 0);
        gb.addColorStop(0, 'rgba(255,255,255,0)'); gb.addColorStop(0.5, 'rgba(255,255,255,0.55)'); gb.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = gb; c.fillRect(-40, -400, 80, 800);
        c.restore();
      }
      const ts = clamp((t - T.tileSpark[0]) / (T.tileSpark[1] - T.tileSpark[0]));
      if (ts > 0 && ts < 1) {
        c.fillStyle = rgba(COL.cream, Math.sin(Math.PI * ts));
        star4(c, sx + tHalf - 8, sy - tHalf + 8, 26 * ez.pop(Math.min(1, ts * 2.2)) * (1 - 0.35 * ts), ts);
      }
      // the same badge at small sizes: the mark has to survive 64 px
      const sizes = [140, 100, 64], gapI = 44;
      let ix = CX - (sizes.reduce((a, b) => a + b, 0) + gapI * (sizes.length - 1)) / 2;
      sizes.forEach((sz, i) => {
        const p = k(t, T.label[0] + 0.22 + i * 0.09, T.label[0] + 0.67 + i * 0.09, ez.pop);
        const cxI = ix + sz / 2, cyI = 1330 - sz / 2;
        ix += sz + gapI;
        if (p <= 0) return;
        const h2 = (sz / 2) * p;
        c.globalAlpha = 0.5 * clamp(p);
        c.drawImage(this.tileShadow, cxI - 280 * h2 / 190, cyI - 280 * h2 / 190 + 10 * p, 560 * h2 / 190, 560 * h2 / 190);
        c.globalAlpha = 1;
        c.fillStyle = '#fff3e3';
        c.beginPath(); roundRect(c, cxI - h2, cyI - h2, 2 * h2, 2 * h2, 0.2237 * 2 * h2); c.fill();
        c.save();
        c.translate(cxI, cyI); const s2 = (0.74 * 2 * h2) / (2 * (S.L + S.B)); c.scale(s2, s2);
        this.drawSymbol(c, this.finalSymbol(), { ring: COL.ink, hor: COL.ink, sunTop: COL.gold, sunBot: COL.coral });
        c.restore();
      });
      // home-screen label
      const lp = k(t, T.label[0], T.label[1], ez.out);
      if (lp > 0) {
        c.save();
        c.beginPath(); c.rect(0, sy + tHalf + 26, W, 80); c.clip();
        c.font = `600 42px ${KR}`; c.textAlign = 'center';
        c.fillStyle = COL.cream;
        c.fillText(NAME, sx, sy + tHalf + 84 + 50 * (1 - lp));
        c.restore();
      }
    }
  },

  // ---------------------------------------------------------------- header, grain, vignette
  drawFrameUI(c, t) {
    const hp = k(t, 0.1, 0.8, ez.out);
    c.save();
    c.globalAlpha = hp;
    c.font = `600 28px ${KR}`;
    c.fillStyle = rgba(COL.lav, 0.85);
    c.fillText(HEAD_L, 72, 124);
    c.fillStyle = rgba(COL.lav, 0.22);
    c.fillRect(72, 150, (W - 144) * k(t, 0.15, 1.1, ez.out), 2);
    // right label swaps 01 → 02 inside a line mask
    c.beginPath(); c.rect(500, 84, W - 500, 52); c.clip();
    c.textAlign = 'right';
    const sw = k(t, T.head, T.head + 0.45, ez.inOut);
    c.fillStyle = rgba(COL.cream, 0.9);
    if (sw < 1) c.fillText(HEAD_R[0], W - 72, 124 - 50 * sw);
    if (sw > 0) c.fillText(HEAD_R[1], W - 72, 124 + 50 * (1 - sw));
    c.restore();

    // grain (shifts 12× a second) and a soft vignette
    const fr = Math.floor(t * 12);
    const ox = (fr * 73) % 256, oy = (fr * 151) % 256;
    c.save();
    c.translate(-ox, -oy);
    c.fillStyle = this.grain; c.fillRect(0, 0, W + 256, H + 256);
    c.restore();
    const vg = c.createRadialGradient(CX, 860, 420, CX, 860, 1250);
    vg.addColorStop(0, 'rgba(6,8,30,0)'); vg.addColorStop(1, 'rgba(6,8,30,0.5)');
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
  },
});
