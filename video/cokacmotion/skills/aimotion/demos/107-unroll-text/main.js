/*
 * 107 · 돌고 돌아 제자리 — text set on a path whose shape keeps changing.
 *
 * One tape of type (two phrases, one accent star between them) is wound into a rotating badge. It unrolls into a
 * straight line, bends into a wave, curls into a fiddlehead spiral and winds back into the badge. A small snail walks
 * on top of the tape at a fixed point of the path (the reading head): the tape flows under its feet like a treadmill,
 * so it walks a lap and a half and ends where it began — but the words under it have changed.
 *
 * The path is not stored as points. Every shape is a turning function θ(u) (tangent angle against arc length u,
 * u = 0 at the head) plus the position of the head. A morph blends θ at the same u and integrates the blended tangent
 * from the head outwards, so the tape keeps its exact length in every in-between shape and the letters keep their
 * spacing (blending raw positions would shorten the curve and crowd the type). Each glyph sits at u = σ − F(t)
 * (σ: its place on the tape, F: how far the tape has flowed), rotated to the tangent, squeezed by the mean
 * curvature under it, and casts a soft shadow on the paper.
 */
import { defineDemo, rand, track, ease, clamp, lerp, smooth } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 10;
const W = 1080, H = 1920;
const PAPER = '#f2ece0', INK = '#1f1c18', ACC = '#e4462a', MUTE = '#a59a88', CREAM = '#fcf8ef';
const INK_RGB = [31, 28, 24], ACC_RGB = [228, 70, 42];
const KR = `"${FONTS.pretendard.family}"`;
const FS = 104;                                  // tape type size
const TRACK = -0.02 * FS;                        // tracking for a large title
const FONT = `800 ${FS}px ${KR}`;
const P1 = '돌고 돌아 결국 제자리', P2 = '그래도 한 바퀴만큼 자랐다';
const SEP = 132;                                 // advance of the star between the phrases
const CX = 540, CY = 980;                        // badge centre
const BAND = 1636;                               // ink band under the harness caption
const NS = 640;                                  // path samples
const TAU = Math.PI * 2;

const outBack = (p, c = 1.7) => ease.outBack(clamp(p), c);
const io = ease.inOutCubic;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const mix = (a, b, k) => `rgb(${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(lerp(a[2], b[2], k))})`;

// ---------------------------------------------------------------- the tape
function buildTape(ctx) {
  ctx.font = FONT;
  const glyphs = [], words = [];
  let x = 0;
  const space = ctx.measureText(' ').width + TRACK;
  for (const [pi, phrase] of [P1, P2].entries()) {
    for (const [wi, word] of phrase.split(' ').entries()) {
      if (wi) x += space;
      const wd = { a: x, b: x, phrase: pi, n: words.length };
      for (const ch of word) {
        const adv = ctx.measureText(ch).width + TRACK;
        glyphs.push({ ch, adv, s: x + adv / 2, w: wd.n, sep: false });
        x += adv;
      }
      wd.b = x;
      words.push(wd);
    }
    glyphs.push({ ch: '', adv: SEP, s: x + SEP / 2, w: -1, sep: true });
    x += SEP;
  }
  return { glyphs, words, L: x };
}

// ---------------------------------------------------------------- shapes as turning functions θ(u)
function makeShapes(L) {
  const R = L / TAU, half = L / 2;
  // fiddlehead curl at the far end: radius shrinks as √(r0² + b·sc/π) toward the end (an Archimedean coil),
  // so θ has the closed form (2π/b)(r(start) − r(sc)); the trail behind the head waves like a hand-drawn line
  const U1 = -50, r0 = 92, b = 124;
  const rc = (sc) => Math.sqrt(r0 * r0 + (b * sc) / Math.PI);
  const rStart = rc(half - U1);
  const hand = (u) => 0.035 * Math.sin(u / 61 + 0.7) + 0.025 * Math.sin(u / 23 + 2.1);
  return {
    R,
    ring: { th: (u) => u / R, ax: CX, ay: CY - R, open: 0 },
    line: { th: () => 0, ax: 720, ay: 990, open: 1 },
    wave: { th: (u) => 0.82 * Math.sin((TAU * u) / 800), ax: 540, ay: 960, open: 1 },
    curl: {
      th: (u) => {
        if (u < U1) return 0.3 * Math.sin((TAU * (u - U1)) / 900) + hand(u) * smooth((U1 - u) / 80);   // 0 at U1: no kink
        return ((TAU / b) * (rStart - rc(half - u)));
      },
      ax: 539, ay: 767, open: 1,
    },
  };
}

// morph schedule: [t0, t1, from, to, lag] — lag > 0: the part near the head changes first (unrolls outward),
// lag < 0: the far ends change first (the tape rolls up from its ends)
const MORPHS = [
  [2.05, 3.15, 'ring', 'line', 0.6],
  [4.25, 5.15, 'line', 'wave', 0.35],
  [5.15, 6.25, 'wave', 'curl', -0.6],
  [7.0, 8.25, 'curl', 'ring', -0.45],
];
function morphAt(t) {
  let cur = null;
  for (const m of MORPHS) if (t >= m[0]) cur = m;
  if (!cur) return { a: 'ring', b: 'ring', p: 1, lag: 0, act: 0 };
  const p = seg(t, cur[0], cur[1]);
  return { a: cur[2], b: cur[3], p, lag: cur[4], act: Math.sin(Math.PI * p) };
}

// ---------------------------------------------------------------- bakes (setup, once)
function offscreen(w, h, headless) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d', headless ? { willReadFrequently: true } : undefined) };
}

async function bakePaper(headless) {
  const { c, g } = offscreen(W, H, headless);
  const bg = g.createRadialGradient(CX, CY - 60, 80, CX, CY, 1250);
  bg.addColorStop(0, '#f7f2e8'); bg.addColorStop(0.55, PAPER); bg.addColorStop(1, '#e3d9c6');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // faint concentric rings around the badge (the echo of "돌고 돌아")
  g.strokeStyle = 'rgba(80,60,40,0.07)'; g.lineWidth = 1.5;
  for (let r = 470; r < 1300; r += 58) { g.beginPath(); g.arc(CX, CY, r, 0, TAU); g.stroke(); }
  // grain: speckles + fibres
  const r = rand(107);
  const img = g.getImageData(0, 0, W, H), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 10;
    d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.9;
  }
  g.putImageData(img, 0, 0);
  g.globalAlpha = 0.05; g.strokeStyle = '#6b5a44'; g.lineWidth = 1;
  for (let i = 0; i < 260; i++) {
    const x = r() * W, y = r() * H, a = r() * TAU, l = 6 + r() * 22;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  g.globalAlpha = 1;
  // header: eyebrow, rule
  g.fillStyle = INK; g.font = `800 34px ${KR}`; g.textBaseline = 'alphabetic';
  g.fillText('한 문장의 산책', 72, 176);
  g.fillStyle = 'rgba(31,28,24,0.55)'; g.font = `600 26px ${KR}`;
  g.fillText('글자는 테이프처럼 흐르고, 달팽이는 걷는다', 72, 222);
  g.fillStyle = INK; g.fillRect(72, 252, W - 144, 3);
  // ink band for the caption
  g.fillStyle = INK; g.fillRect(0, BAND, W, H - BAND);
  g.fillStyle = ACC; g.fillRect(72, BAND + 26, 64, 6);
  return createImageBitmap(c);
}

async function bakeShadows(chars, headless) {
  const out = new Map();
  for (const ch of chars) {
    const { c, g } = offscreen(200, 200, headless);
    g.font = FONT; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.filter = 'blur(7px)'; g.fillStyle = 'rgb(70,48,28)';
    g.fillText(ch, 100, 150);
    out.set(ch, await createImageBitmap(c));
  }
  return out;
}

async function bakeBlob(w, h, blur, headless) {
  const { c, g } = offscreen(w + blur * 6, h + blur * 6, headless);
  g.filter = `blur(${blur}px)`; g.fillStyle = 'rgb(70,48,28)';
  g.beginPath(); g.ellipse(c.width / 2, c.height / 2, w / 2, h / 2, 0, 0, TAU); g.fill();
  return createImageBitmap(c);
}

// ---------------------------------------------------------------- drawing helpers
function star4(g, x, y, r, rot = 0) {
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = rot + (i * Math.PI) / 4, rr = i % 2 ? r * 0.3 : r;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    i ? g.lineTo(px, py) : g.moveTo(px, py);
  }
  g.fill();
}

/** the snail, local frame: facing +x, foot on y = 0, up is −y */
function drawSnail(g, o) {
  const { phase, speed, grow, blink } = o;
  const lean = -clamp(speed / 700) * 16;
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = 5;
  // body
  const stretch = 1 + 0.035 * Math.sin(phase * 2);
  g.beginPath();
  g.moveTo(-118 * stretch, -3);
  g.bezierCurveTo(-90 * stretch, -18, -50, -30, 0, -32);
  g.bezierCurveTo(30, -33, 48, -36, 56, -52);
  g.bezierCurveTo(62, -76, 82, -86, 96, -72);
  g.bezierCurveTo(106, -60, 108, -34, 104, -12);
  // foot with a travelling ripple
  for (let x = 104; x >= -118 * stretch; x -= 6) {
    const k = smooth((x + 118 * stretch) / 40) * smooth((104 - x) / 30);
    g.lineTo(x, -1.5 - 2.6 * k * (0.5 + 0.5 * Math.sin(x * 0.11 + phase * 3)));
  }
  g.closePath();
  g.fillStyle = CREAM; g.fill(); g.stroke();
  // eye stalks + eyes
  const ty = 1 - 0.85 * blink;
  const stalks = [[70, -70, 68 + lean, -116], [86, -76, 96 + lean, -120]];
  for (const [x0, y0, x1, y1] of stalks) {
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + 2, (y0 + y1) / 2, x1, y1); g.stroke();
  }
  for (const [, , x1, y1] of stalks) {
    g.fillStyle = INK; g.beginPath(); g.ellipse(x1, y1, 9, 9 * ty, 0, 0, TAU); g.fill();
    if (ty > 0.5) { g.fillStyle = CREAM; g.beginPath(); g.arc(x1 + 2.5, y1 - 3, 2.6, 0, TAU); g.fill(); }
  }
  // smile + cheek
  g.lineWidth = 3.6; g.beginPath(); g.arc(96, -52, 7, 0.2, 1.6); g.stroke();
  g.fillStyle = 'rgba(228,70,42,0.35)'; g.beginPath(); g.ellipse(84, -46, 7, 4.5, 0, 0, TAU); g.fill();
  // shell
  const sr = 56 * grow, sx = -22, sy = -26 - sr;
  g.lineWidth = 5;
  g.fillStyle = ACC; g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.fill(); g.stroke();
  g.save(); g.beginPath(); g.arc(sx, sy, sr - 2.5, 0, TAU); g.clip();
  g.fillStyle = 'rgba(120,20,10,0.22)'; g.beginPath(); g.arc(sx + sr * 0.35, sy + sr * 0.4, sr * 0.95, 0, TAU); g.fill();
  g.restore();
  const turns = 2.1 + 0.6 * clamp((grow - 1) / 0.22);
  g.lineWidth = 4.5; g.beginPath();
  for (let i = 0; i <= 90; i++) {
    const k = i / 90, a = -Math.PI / 2 + k * turns * TAU, rr = 5 + k * (sr - 13);
    const px = sx + Math.cos(a) * rr, py = sy + Math.sin(a) * rr;
    i ? g.lineTo(px, py) : g.moveTo(px, py);
  }
  g.stroke();
  g.strokeStyle = 'rgba(252,248,239,0.75)'; g.lineWidth = 6;
  g.beginPath(); g.arc(sx, sy, sr - 12, Math.PI * 1.08, Math.PI * 1.38); g.stroke();
  // speed lines behind the tail
  const sl = clamp((speed - 250) / 450);
  if (sl > 0) {
    g.strokeStyle = `rgba(31,28,24,${0.55 * sl})`; g.lineWidth = 4;
    for (const [y, l] of [[-12, 46], [-34, 62], [-56, 38]]) {
      g.beginPath(); g.moveTo(-136 * stretch - 4, y); g.lineTo(-136 * stretch - 4 - l * sl, y); g.stroke();
    }
  }
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '107-unroll-text',
  title: '돌고 돌아 제자리',
  tech: '경로 위 조판 · 호 길이로 맞춘 경로 모핑',
  duration: D,
  background: PAPER,

  async setup(api) {
    await fontReady(FONT, P1 + P2);
    await fontReady(`800 34px ${KR}`, '한 문장의 산책 0123456789.,바퀴');
    await fontReady(`600 26px ${KR}`, '글자는 테이프처럼 흐르고, 달팽이는 걷는다');
    await fontReady(`700 24px ${KR}`, '원직선물결고리제자리');
    this.ctx = api.canvas({ z: 0, attrs: api.headless ? { willReadFrequently: true } : undefined }).ctx;
    const tape = buildTape(this.ctx);
    Object.assign(this, tape);
    this.S = makeShapes(tape.L);
    this.paper = await bakePaper(api.headless);
    this.shadows = await bakeShadows(new Set(tape.glyphs.filter((g) => !g.sep).map((g) => g.ch)), api.headless);
    this.blob = await bakeBlob(240, 40, 10, api.headless);
    const m = this.ctx.measureText('돌');
    this.ASC = m.actualBoundingBoxAscent;
    // path sample arrays
    this.X = new Float64Array(NS + 1); this.Y = new Float64Array(NS + 1); this.TH = new Float64Array(NS + 1);
    // flow F(t): how far the tape has moved past the head (px). The head reads "돌아" at 0 and lands on
    // "그래도 …" a lap and a half later; slow on the badge, a ticker on the line, a rush through the curl.
    const L = tape.L, w = tape.words;
    const c1 = (w[0].a + w[3].b) / 2, c2 = (w[4].a + w[w.length - 1].b) / 2;
    const F0 = c1 - 150, FT = c2 - 150 + L;
    const tot = FT - F0;
    this.F0 = F0;
    this.cam = track([[0, 1], [5.3, 1], [6.5, 1.14, ease.outCubic], [7.05, 1.14], [8.2, 1]]);
    // speed-matched segments: v0 → v1 over T covers (v0 + v1)/2·T with F = d·(a·p + (1 − a)·p²), a = v0·T/d
    const accel = (v0, v1, T) => { const d = ((v0 + v1) / 2) * T, a = (v0 * T) / d; return [d, (p) => a * p + (1 - a) * p * p]; };
    const lin = (p) => p;
    const vRush = (tot - 970 - 0.45 * 182) / 2.3;            // constant speed through the curl so the segments meet
    const [dA, eA] = accel(182, vRush, 0.9);                 // the wave speeds up into the rush
    this.flow = track([
      [0, F0],
      [0.9, F0 + 25, ease.inCubic],
      [2.05, F0 + 150, lin],
      [3.15, F0 + 320, lin],
      [4.25, F0 + 520, lin],
      [5.15, F0 + 520 + dA, eA],
      [7.0, FT - 450, lin],
      [8.3, FT, ease.outCubic],
      [10, FT + 125, ease.inOutCubic],
    ]);
  },

  /** θ(u) blended between two shapes at the same arc length; positions integrated from the head */
  buildPath(t) {
    const { S, L, X, Y, TH } = this;
    const mo = morphAt(t);
    const A = S[mo.a], B = S[mo.b];
    const half = L / 2, ds = L / NS, k0 = NS / 2;
    for (let k = 0; k <= NS; k++) {
      const u = -half + k * ds;
      const d = mo.lag >= 0 ? Math.abs(u) / half : 1 - Math.abs(u) / half;
      const lag = Math.abs(mo.lag);
      const m = io(clamp(mo.p * (1 + lag) - lag * d));
      TH[k] = lerp(A.th(u), B.th(u), m);
    }
    const pg = io(mo.p);
    X[k0] = lerp(A.ax, B.ax, pg); Y[k0] = lerp(A.ay, B.ay, pg);
    for (let k = k0 + 1; k <= NS; k++) {
      const a = (TH[k] + TH[k - 1]) / 2;
      X[k] = X[k - 1] + Math.cos(a) * ds; Y[k] = Y[k - 1] + Math.sin(a) * ds;
    }
    for (let k = k0 - 1; k >= 0; k--) {
      const a = (TH[k] + TH[k + 1]) / 2;
      X[k] = X[k + 1] - Math.cos(a) * ds; Y[k] = Y[k + 1] - Math.sin(a) * ds;
    }
    this.open = lerp(A.open, B.open, pg);
    this.act = mo.act;
  },

  /** position/angle at arc length u (linear between samples) */
  at(u) {
    const { L, X, Y, TH } = this;
    const f = clamp((u + L / 2) / (L / NS), 0, NS - 1e-9), k = Math.floor(f), a = f - k;
    return { x: lerp(X[k], X[k + 1], a), y: lerp(Y[k], Y[k + 1], a), th: lerp(TH[k], TH[k + 1], a) };
  },
  wrap(v) { const L = this.L; return ((((v + L / 2) % L) + L) % L) - L / 2; },

  frame(t) {
    const g = this.ctx, L = this.L;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.lineCap = 'butt'; g.lineJoin = 'miter'; g.setLineDash([]);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.drawImage(this.paper, 0, 0);

    this.buildPath(t);
    const F = this.flow(t);
    const speed = (this.flow(Math.min(D, t + 1 / 60)) - this.flow(Math.max(0, t - 1 / 60))) * 30;
    const open = this.open;
    const endFade = (u) => 1 - open * (1 - smooth((L / 2 - Math.abs(u)) / 120));
    // entrance: the tape prints itself around the badge in reading order (σ = place on the tape)
    const printT = (sig) => 0.12 + 0.85 * ((((sig - this.F0 + 300) % L) + L) % L) / L;
    // camera: a slow push into the curl at the peak (zoom about the stage centre)
    const Z = this.cam(t), OX = (1 - Z) * 540, OY = (1 - Z) * 960;
    const M = (a, b, c, d, e, f) => g.setTransform(Z * a, Z * b, Z * c, Z * d, Z * e + OX, Z * f + OY);

    // head word (under the snail)
    const sh = ((F % L) + L) % L;
    const wordHL = this.words.map((wd) => {
      const dist = sh < wd.a ? wd.a - sh : sh > wd.b ? sh - wd.b : 0;
      return 1 - smooth(dist / 34);
    });
    const intro = smooth(seg(t, 0.0, 0.5));

    // the tape lives between the header rule and the ink band
    g.save();
    g.beginPath(); g.rect(0, 262, W, BAND - 262); g.clip();

    // ---- badge core (visible while the tape is a ring)
    M(1, 0, 0, 1, 0, 0);
    const closed = 1 - open;
    if (closed > 0.01) {
      const R = this.S.R;
      const sc = 0.7 + 0.3 * closed + (t > 8.25 ? 0.04 * Math.sin(Math.PI * seg(t, 8.25, 8.6)) : 0);
      g.globalAlpha = closed * intro;
      g.fillStyle = '#f3d6c6';
      g.beginPath(); g.arc(CX, CY, (R - 50) * sc, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(228,70,42,0.32)'; g.lineWidth = 2;
      for (const rr of [R - 80, R - 106, R - 132]) { g.beginPath(); g.arc(CX, CY, rr * sc, 0, TAU); g.stroke(); }
      const pulse = seg(t, 8.25, 9.0);
      if (t > 8.25 && pulse < 1) {
        g.globalAlpha = (1 - pulse) * 0.75; g.strokeStyle = ACC; g.lineWidth = 7 * (1 - pulse) + 1;
        g.beginPath(); g.arc(CX, CY, R + 110 + 170 * ease.outCubic(pulse), 0, TAU); g.stroke();
      }
      g.globalAlpha = 1;
    }

    // ---- glyph states
    const items = [];
    for (const gl of this.glyphs) {
      const u = this.wrap(gl.s - F);
      const p = this.at(u);
      const w = Math.max(gl.adv, 70);
      const kap = (this.at(u + w / 2).th - this.at(u - w / 2).th) / w;   // mean curvature under the glyph (> 0: letters on the outside)
      const kh = kap * this.ASC;
      const sx = clamp(1 - 0.9 * Math.max(0, -kh) - 0.55 * Math.max(0, Math.abs(kh) - 0.18), 0.5, 1);
      const sy = 1 + 0.32 * (1 - sx);
      const hl = gl.sep ? 0 : wordHL[gl.w];
      const pt = printT(gl.s);
      const pop = t < 1.5 ? outBack(seg(t, pt, pt + 0.38), 2.2) : 1;
      const alpha = endFade(u) * (t < 1.5 ? seg(t, pt, pt + 0.1) : 1);
      if (alpha <= 0.003 || pop <= 0.001) continue;
      const nx = Math.sin(p.th), ny = -Math.cos(p.th);
      const rise = 9 * hl + (1 - pop) * 40;
      const big = pop * (1 + 0.06 * hl);
      items.push({ gl, u, x: p.x + nx * rise, y: p.y + ny * rise, th: p.th, sx: sx * big, sy: sy * big, hl, alpha,
        lift: 10 + 16 * this.act + 8 * hl + Math.min(14, speed / 50) });
    }

    // ---- ruler (the tape's edge): hairline + ticks every 32 px of tape, below the baseline
    const BELOW = 16;
    g.lineCap = 'round'; g.lineJoin = 'round';
    M(1, 0, 0, 1, 0, 0);
    const ds = L / NS, CH = 8;
    for (let k = 0; k < NS; k += CH) {
      const uM = -L / 2 + (k + CH / 2) * ds;
      let a = endFade(uM) * 0.9;
      if (t < 1.5) { const q = printT(uM + F); a *= seg(t, q, q + 0.2); }
      if (a <= 0.003) continue;
      g.globalAlpha = a; g.strokeStyle = MUTE; g.lineWidth = 2.5;
      g.beginPath();
      for (let j = k; j <= Math.min(NS, k + CH); j++) {
        const th = this.TH[j], x = this.X[j] - Math.sin(th) * BELOW, y = this.Y[j] + Math.cos(th) * BELOW;
        j === k ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
    const TICK = 32;
    for (let i = 0; i < Math.floor(L / TICK); i++) {
      const u = this.wrap(i * TICK - F);
      let a = endFade(u) * 0.85;
      if (t < 1.5) { const q = printT(i * TICK); a *= seg(t, q, q + 0.2); }
      if (a <= 0.003) continue;
      const p = this.at(u), nx = Math.sin(p.th), ny = -Math.cos(p.th);
      const len = i % 5 === 0 ? 16 : 8;
      g.globalAlpha = a; g.strokeStyle = MUTE; g.lineWidth = i % 5 === 0 ? 2.5 : 2;
      g.beginPath(); g.moveTo(p.x - nx * BELOW, p.y - ny * BELOW); g.lineTo(p.x - nx * (BELOW + len), p.y - ny * (BELOW + len)); g.stroke();
    }
    // the two ends of the tape get an accent dot once the ring is open (where the type fades in and out)
    if (open > 0.02) {
      g.globalAlpha = smooth(open * 3); g.fillStyle = ACC;
      for (const sgn of [-1, 1]) {
        const p = this.at(sgn * L / 2);
        g.beginPath(); g.arc(p.x - Math.sin(p.th) * BELOW, p.y + Math.cos(p.th) * BELOW, 7.5, 0, TAU); g.fill();
      }
    }
    // accent underline under the word being read
    for (const wd of this.words) {
      const hl = wordHL[wd.n];
      if (hl < 0.02) continue;
      const ua = this.wrap(wd.a - F), ub = ua + (wd.b - wd.a);
      const q = printT(wd.a);
      g.globalAlpha = hl * endFade(ua) * (t < 1.5 ? seg(t, q + 0.1, q + 0.3) : 1); g.strokeStyle = ACC; g.lineWidth = 7;
      g.beginPath();
      for (let u = ua, i = 0; u <= ub + 0.01; u += 8, i++) {
        const p = this.at(this.wrap(u));
        const x = p.x - Math.sin(p.th) * BELOW, y = p.y + Math.cos(p.th) * BELOW;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
    g.globalAlpha = 1;

    // ---- soft shadows on the paper, then the glyphs
    for (const it of items) {
      if (it.gl.sep) continue;
      const c = Math.cos(it.th), s = Math.sin(it.th), k = 1 + it.lift * 0.004;
      g.globalAlpha = it.alpha * (0.2 - it.lift * 0.002);
      M(c * it.sx * k, s * it.sx * k, -s * it.sy * k, c * it.sy * k, it.x + it.lift * 0.55, it.y + it.lift * 0.9);
      g.drawImage(this.shadows.get(it.gl.ch), -100, -150);
    }
    g.font = FONT;
    for (const it of items) {
      const c = Math.cos(it.th), s = Math.sin(it.th);
      M(c * it.sx, s * it.sx, -s * it.sy, c * it.sy, it.x, it.y);
      g.globalAlpha = it.alpha;
      if (it.gl.sep) {
        g.fillStyle = ACC;
        star4(g, 0, -this.ASC * 0.45, 26, it.u / 40);
      } else {
        g.fillStyle = it.hl > 0.01 ? mix(INK_RGB, ACC_RGB, it.hl) : INK;
        g.fillText(it.gl.ch, 0, 0);
      }
    }
    g.globalAlpha = 1;

    // ---- the snail on the head (u = 0): it walks as fast as the tape flows, so it stays in place
    const hp = this.at(0), hnx = Math.sin(hp.th), hny = -Math.cos(hp.th);
    const sIn = seg(t, 0.75, 0.85);
    if (sIn > 0) {
      const drop = outBack(seg(t, 0.75, 1.2), 1.8);
      // it stands on the letter tops; over the star between the phrases it steps down a little
      const sepD = Math.min(...this.glyphs.filter((q) => q.sep).map((q) => Math.abs(this.wrap(q.s - F))));
      const up = this.ASC + 10 - 18 * (1 - smooth(sepD / 90)) + (1 - drop) * 220;
      const bx = hp.x + hnx * up, by = hp.y + hny * up;
      const sl = 26 + this.act * 14;
      const grow = 1 + 0.2 * outBack(seg(t, 8.55, 9.0), 2.4);
      M(1, 0, 0, 1, 0, 0);
      g.globalAlpha = 0.16 * sIn;
      g.drawImage(this.blob, bx + sl * 0.55 - this.blob.width / 2, by + sl * 0.9 - this.blob.height / 2 - 6);
      g.globalAlpha = sIn;
      const lt = t - 1.02;
      const land = lt > 0 ? Math.exp(-9 * lt) * Math.sin(lt * 26) : 0;
      const c = Math.cos(hp.th), s = Math.sin(hp.th), kx = 0.86 * (1 + 0.08 * land), ky = 0.86 * (1 - 0.1 * land);
      M(c * kx, s * kx, -s * ky, c * ky, bx, by);
      let blink = 0;
      for (const b of [3.7, 9.4]) blink = Math.max(blink, 1 - Math.abs(t - b) / 0.07);
      drawSnail(g, { phase: (F - this.F0) * 0.045, speed, grow, blink: clamp(blink) });
      const sp = seg(t, 8.6, 9.3);   // sparkles when the shell grows
      if (sp > 0 && sp < 1) {
        g.fillStyle = ACC; g.globalAlpha = sIn * (1 - sp);
        for (let i = 0; i < 4; i++) {
          const a = -Math.PI / 2 + (i - 1.5) * 0.7, r = 92 + 50 * ease.outCubic(sp);
          star4(g, -22 + Math.cos(a) * r, -95 + Math.sin(a) * r, 14 * (1 - sp * 0.5));
        }
      }
    }
    g.restore();
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;

    // ---- footer: the route of the walk (one pictogram per shape), the dot is where the tape is now
    this.drawRoute(g, t, smooth(seg(t, 0.3, 0.9)));

    // ---- header lap counter (tabular digits: every digit in the same cell)
    const laps = Math.max(0, (F - this.F0) / L);
    const txt = laps.toFixed(2);
    g.globalAlpha = intro;
    g.font = `800 34px ${KR}`; g.textAlign = 'center'; g.fillStyle = INK;
    const cw = 21;
    let x = W - 72 - 70 - txt.length * cw;
    for (const ch of txt) { g.fillText(ch, x + (ch === '.' ? cw * 0.28 : cw / 2), 176); x += ch === '.' ? cw * 0.55 : cw; }
    g.textAlign = 'right'; g.fillStyle = ACC; g.fillText('바퀴', W - 72, 176);
    g.globalAlpha = 1; g.textAlign = 'center';
  },

  drawRoute(g, t, a) {
    if (a <= 0) return;
    const Y = 1520, xs = [156, 348, 540, 732, 924];
    const names = ['원', '직선', '물결', '고리', '제자리'];
    // where the walk is: stop index as a float (morph windows move it from one stop to the next)
    let pos = 0;
    MORPHS.forEach((m, i) => { pos += io(seg(t, m[0], m[1])); });
    const dotX = lerp(xs[Math.floor(Math.min(pos, 3.999))], xs[Math.min(4, Math.floor(Math.min(pos, 3.999)) + 1)], pos - Math.floor(Math.min(pos, 3.999)));
    g.globalAlpha = a; g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(31,28,24,0.28)'; g.lineWidth = 2;
    for (let x = xs[0] + 44; x < xs[4] - 44; x += 14) { g.beginPath(); g.moveTo(x, Y + 52); g.lineTo(x + 5, Y + 52); g.stroke(); }
    xs.forEach((x, i) => {
      const on = 1 - smooth(Math.abs(pos - i) / 0.5);
      g.strokeStyle = on > 0.5 ? ACC : 'rgba(31,28,24,0.5)'; g.lineWidth = 4;
      g.beginPath();
      if (i === 0 || i === 4) g.arc(x, Y, 20, 0, TAU);
      else if (i === 1) { g.moveTo(x - 30, Y); g.lineTo(x + 30, Y); }
      else if (i === 2) { for (let k = 0; k <= 24; k++) { const px = x - 30 + k * 2.5, py = Y - 11 * Math.sin((k / 24) * TAU); k ? g.lineTo(px, py) : g.moveTo(px, py); } }
      else { for (let k = 0; k <= 40; k++) { const q = k / 40, ang = -Math.PI * 0.95 + q * 1.6 * TAU, r = 22 - q * 15; const px = x - 4 + Math.cos(ang) * r, py = Y + Math.sin(ang) * r; k ? g.lineTo(px, py) : g.moveTo(px, py); } }
      g.stroke();
      g.fillStyle = on > 0.5 ? ACC : 'rgba(31,28,24,0.6)';
      g.font = `700 24px ${KR}`; g.textAlign = 'center';
      g.fillText(names[i], x, Y + 92);
    });
    g.fillStyle = ACC; g.beginPath(); g.arc(dotX, Y + 52, 8, 0, TAU); g.fill();
    g.globalAlpha = 1;
  },
});
