/*
 * 90 · 구름 위의 아침 — 재는 연출 · 오도미터 + 계기 바늘 + 줄자
 *
 * A hot-air balloon lifts off a dark field before dawn and climbs through a cloud deck into sunrise. Three
 * instruments read ONE baked value (the altitude z(t)) and make it physical:
 *   · a yellow tape measure whose blade unrolls from a case on the field; its tip rides at basket level,
 *     so ticks and labels come out of the tip as it passes them (world-fixed: 1 m = 1.25 px)
 *   · a mechanical odometer in a pill chip on the level line: four drum wheels, a higher wheel turns only
 *     while every lower wheel passes 9, and each wheel gets vertical motion blur from its own speed over the shutter
 *   · a vertical-speed needle in a loupe wired to the basket: a damped spring chasing the true climb rate
 *     (overshoot on every burner blast and on the level-off), a tiny jitter at speed, ghost needles behind it
 * The last metre rolls in at 5.3 s, a glint crosses the number and the sun breaks over the cloud sea.
 *
 * Determinism: z(t), the climb rate and the needle spring are integrated once in setup at 600 Hz and read back
 * by linear interpolation. Everything else (puffs, stars, birds, wisps, grain) is a closed form of t or a table
 * made with rand(seed). No library: Canvas 2D only.
 */
import { defineDemo, rand, clamp, lerp, ease, track } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 10, W = 1080, H = 1920, TAU = Math.PI * 2;
const S = 1.25;                        // px per metre on the near plane (tape, deck, near clouds)
const GROUND = 1440;                   // screen y of z = 0 before the climb
const Z_END = 2460, T_LAND = 5.3;      // the number that lands, and when
const DECK_BOT = 1450, DECK_TOP = 2050;
const BX = 620;                        // balloon axis
const TX0 = 96, TX1 = 196;             // tape blade
const SHUT = 1 / 60;                   // 180° shutter at 30 fps — motion blur length
const YEL = '#ffc83d', INK = '#1d1606', TXT = '#f6f3ee', UNIT = '#b9c4de', CORAL = '#ff8a6b';
const KR = `"${FONTS.pretendard.family}"`, MONO = `"${FONTS.jetbrainsMono.family}"`;

// odometer
const CELL_W = 54, CELL_H = 100, WIN_H = 106, DIGIT_PX = 80, WIN_BG = '#0c1230';
const BLUR = [0, 0.08, 0.16, 0.3, 0.55, 1, 1.6, 2.4];   // box-blur lengths in digits, pre-rendered (capped: a spun wheel still shows streaked digits)
const CHIP_X = 210, CHIP_W = 332, CHIP_H = 132;
// vertical-speed loupe
const LX = 850, LY = 1408, LR = 150, GR = 104;
const VMIN = -5, VMAX = 10;
const ANG = (v) => ((150 + (240 * (clamp(v, VMIN, VMAX) - VMIN)) / (VMAX - VMIN)) * Math.PI) / 180;

// ------------------------------------------------------------------ small helpers
const E = {
  outBack: (p, c = 1.6) => 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2),
  outExpo: ease.outExpo, outCubic: ease.outCubic, inOutCubic: ease.inOutCubic,
  in2: (p) => p * p, out2: (p) => 1 - (1 - p) * (1 - p),
};
const seg = (t, t0, d) => clamp((t - t0) / d);
const sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const hash = (i) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const wrap = (v, m) => ((v % m) + m) % m;

// ------------------------------------------------------------------ the one value: altitude (baked)
const DT = 1 / 600, N = Math.round(D / DT);
let ZT, VS, ND;
function bake() {
  // climb rate in m/s (story time); burner blasts at 0.5, 1.72, 3.0 s push it, the vent at the top lets it fall to 0
  const vsF = track([[0, 0], [0.85, 0], [1.45, 3.6, E.outCubic], [1.85, 3.0, E.inOutCubic], [2.45, 7.2, E.outCubic],
    [3.45, 7.4, E.inOutCubic], [4.35, 3.4, E.inOutCubic], [T_LAND, 0, E.inOutCubic]]);
  VS = new Float64Array(N + 1); ZT = new Float64Array(N + 1); ND = new Float64Array(N + 1);
  for (let i = 0; i <= N; i++) VS[i] = vsF(i * DT);
  for (let i = 1; i <= N; i++) ZT[i] = ZT[i - 1] + 0.5 * (VS[i - 1] + VS[i]) * DT;
  const iL = Math.round(T_LAND / DT), k = Z_END / ZT[iL];        // time-lapse factor: lands exactly on Z_END
  for (let i = 0; i <= N; i++) ZT[i] = i >= iL ? Z_END : ZT[i] * k;
  // the needle: a damped spring chasing the climb rate (ζ 0.3 → overshoot on every change)
  let x = 0, v = 0;
  const w = 9.5, zeta = 0.3;
  for (let i = 0; i <= N; i++) { ND[i] = x; const a = w * w * (VS[i] - x) - 2 * zeta * w * v; v += a * DT; x += v * DT; }
  return k;
}
const at = (tab, t) => { const f = clamp(t, 0, D) / DT, i = Math.min(N - 1, Math.floor(f)), u = f - i; return tab[i] + (tab[i + 1] - tab[i]) * u; };
const zAt = (t) => at(ZT, t);
/** first time the altitude reaches z (z(t) never decreases) */
function tPass(z) {
  if (z <= 0) return 0;
  let lo = 0, hi = N;
  if (ZT[hi] < z) return Infinity;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ZT[m] >= z) hi = m; else lo = m; }
  return (lo + (z - ZT[lo]) / Math.max(1e-9, ZT[hi] - ZT[lo])) * DT;
}
// basket screen y: the balloon rises in frame first, then the camera catches it
const ybCam = track([[0, GROUND], [0.85, GROUND], [2.1, 1236, E.inOutCubic], [3.5, 1060, E.inOutCubic], [5.0, 1040, E.inOutCubic]]);
const camC = (t) => zAt(t) * S + ybCam(t) - GROUND;              // how far the near plane has slid down (px)

/** odometer wheel j at value q: unwrapped digit position; a higher wheel moves only while the lower ones pass 9 */
function wheelU(q, j) {
  if (j === 0) return q;
  const P = Math.pow(10, j), rem = q % P, k = rem > P - 1 ? Math.min(1, rem - (P - 1)) : 0;
  return Math.floor(q / P) + k * k * (3 - 2 * k);
}

// Offscreen canvases follow the main canvas: CPU raster (willReadFrequently) only in the headless check. A GPU-backed
// source drawn into the CPU main canvas for the first time switches its raster path mid-run (edge AA changes), so
// frames drawn before and after that first drawImage would differ — see also warmUp() in setup.
let SOFT = false;
function offscreen(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  return { c, x: c.getContext('2d', SOFT ? { willReadFrequently: true } : undefined) };
}

// ------------------------------------------------------------------ pre-rendered odometer strips
function boxBlurCyclic(id, L) {
  if (L <= 1) return id;
  const { width: w, height: h, data: s } = id, out = new ImageData(w, h), o = out.data, h0 = L >> 1;
  for (let x = 0; x < w; x++) for (let ch = 0; ch < 4; ch++) {
    let sum = 0;
    for (let k = -h0; k < L - h0; k++) sum += s[(wrap(k, h) * w + x) * 4 + ch];
    for (let y = 0; y < h; y++) {
      o[(y * w + x) * 4 + ch] = sum / L;
      sum += s[(wrap(y + L - h0, h) * w + x) * 4 + ch] - s[(wrap(y - h0, h) * w + x) * 4 + ch];
    }
  }
  return out;
}
let STR;
function buildStrips() {
  const cyc = CELL_H * 10;
  const draw = (bg, fg) => {
    const c = document.createElement('canvas'); c.width = CELL_W; c.height = cyc;
    const x = c.getContext('2d', { willReadFrequently: true });
    if (bg) { x.fillStyle = bg; x.fillRect(0, 0, CELL_W, cyc); }
    x.font = `800 ${DIGIT_PX}px ${KR}`; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = fg;
    const asc = x.measureText('0').actualBoundingBoxAscent;
    for (let d = 0; d < 10; d++) x.fillText(String(d), CELL_W / 2, d * CELL_H + CELL_H / 2 + asc / 2);
    return x.getImageData(0, 0, CELL_W, cyc);
  };
  // one cycle at rows 100..1100, wrapped copies above and below, so any window p ∈ [0, 10) is one drawImage
  const tile = (id) => {
    const { c, x } = offscreen(CELL_W, cyc + 300);
    for (const oy of [100 - cyc, 100, 100 + cyc]) x.putImageData(id, 0, oy);
    return c;
  };
  const base = draw(WIN_BG, TXT);
  STR = {
    levels: BLUR.map((b) => tile(boxBlurCyclic(base, Math.min(cyc, Math.max(1, Math.round(b * CELL_H)))))),
    yellow: tile(draw(WIN_BG, YEL)),
    mask: tile(draw(null, '#fff')),
  };
}
const stripY = (p) => 100 + p * CELL_H + CELL_H / 2 - WIN_H / 2;
function drawWheel(c, x, y, p, b, yk) {
  const sy = stripY(p);
  let i = 0;
  while (i < BLUR.length - 2 && b > BLUR[i + 1]) i++;
  const f = clamp((b - BLUR[i]) / (BLUR[i + 1] - BLUR[i]));
  c.drawImage(STR.levels[i], 0, sy, CELL_W, WIN_H, x, y, CELL_W, WIN_H);
  if (f > 0.004) { c.globalAlpha = f; c.drawImage(STR.levels[i + 1], 0, sy, CELL_W, WIN_H, x, y, CELL_W, WIN_H); }
  if (yk > 0.004) { c.globalAlpha = yk; c.drawImage(STR.yellow, 0, sy, CELL_W, WIN_H, x, y, CELL_W, WIN_H); }
  c.globalAlpha = 1;
}
// chip layout (x offsets from the chip's left edge): thousands , hundreds tens units  m
const WX = [20 + 54 + 20 + 54 + 6 + 54 + 6, 20 + 54 + 20 + 54 + 6, 20 + 54 + 20, 20];   // j = 0 (units) … 3 (thousands)
const COMMA_X = 20 + 54 + 10, UNIT_X = 20 + 54 + 20 + 54 + 6 + 54 + 6 + 54 + 10;

// ------------------------------------------------------------------ scene tables (setup)
let SCN, LENS, GLINT, GRAIN, TL;
function buildScene() {
  const r = rand(9001);
  const stars = Array.from({ length: 150 }, () => ({ x: r() * W, y: Math.pow(r(), 1.5) * 1150, s: 1 + r() * 1.8, ph: r() * TAU, f: 1 + r() * 3 }));
  const ridge = (seed, base, amp, step) => {
    const q = rand(seed), pts = [];
    let a = 0, b = 0;
    for (let x = -40; x <= W + 40; x += step) {
      a += (q() - 0.5) * 0.9; a *= 0.86; b = 0.7 * b + 0.3 * a;
      pts.push([x, base - amp * (0.45 + 0.55 * Math.abs(Math.sin(x * 0.004 + seed))) - b * amp * 0.5]);
    }
    return pts;
  };
  const ridgeA = ridge(3, 1190, 150, 26), ridgeB = ridge(7, 1290, 110, 22);
  const hills = ridge(11, 1408, 46, 30);
  const houses = [];
  for (let i = 0; i < 16; i++) {
    const x = 40 + i * 64 + r() * 30;
    houses.push({ x, w: 22 + r() * 18, h: 16 + r() * 14, lit: r() < 0.7, ph: r() * TAU });
  }
  // a flat-bottomed cumulus: overlapping puffs, tallest in the middle (always ≥ 0.8 × spacing so they merge)
  const puffs = (n, w, h, seed) => {
    const q = rand(seed), P = [], sp = w / Math.max(1, n - 1);
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0.5 : i / (n - 1), bul = Math.sin(u * Math.PI);
      const r = Math.max(0.8 * sp, (0.5 + 0.5 * bul) * h * (0.8 + 0.3 * q()));
      P.push([(u - 0.5) * w + (q() - 0.5) * sp * 0.3, -bul * h * (0.35 + 0.25 * q()), r]);
    }
    return { P, w, h };
  };
  // clouds on the near plane at their own altitudes (f = parallax; > 1 is in front of the balloon)
  const clouds = [
    { z: 430, x: 940, f: 0.9, c: puffs(6, 200, 46, 21) },
    { z: 1280, x: 230, f: 0.95, c: puffs(7, 320, 92, 22) },
    { z: 1330, x: 900, f: 1.0, c: puffs(7, 300, 84, 23) },
  ];
  const front = [
    { z: 1080, x: 520, f: 1.2, a: 0.92, c: puffs(8, 400, 110, 31) },
    { z: 1300, x: 120, f: 1.22, a: 0.85, c: puffs(7, 330, 96, 32) },
  ];
  const deckTop = [], deckBot = [];
  for (let x = -80; x < W + 160; x += 64 + r() * 20) deckTop.push([x, (r() - 0.5) * 30, 52 + r() * 46]);
  for (let x = -80; x < W + 160; x += 70 + r() * 24) deckBot.push([x, (r() - 0.5) * 16, 40 + r() * 34]);
  const birds = Array.from({ length: 5 }, (_, i) => ({ x: -120 - i * 70 + r() * 30, z: 520 + (i % 2) * 18 + r() * 14, ph: r() * TAU }));
  const wisps = Array.from({ length: 8 }, () => ({ x: r() * W, y: r() * 2400, w: 300 + r() * 360, a: 0.6 + r() * 0.4 }));
  const motes = Array.from({ length: 30 }, () => ({ x: r() * W, y: r() * H, s: 0.8 + r() * 1.6, ph: r() * TAU, sp: 6 + r() * 14 }));
  const rays = Array.from({ length: 15 }, (_, i) => ({ a: (i / 15) * TAU + r() * 0.25, len: 0.6 + r() * 0.6, w: 0.03 + r() * 0.05 }));
  const streaks = Array.from({ length: 22 }, () => ({ x: r() * W, y: r() * 2600, a: 0.3 + r() * 0.5 }));
  const peaks = [[130, 260, 0.34], [400, 200, 0.2], [700, 230, 0.27], [1030, 290, 0.4]].map(([x, w, h], i) => {
    const q = rand(70 + i), pts = [[-1, 0]];
    for (let k = 1; k < 8; k++) { const u = -1 + (2 * k) / 8; pts.push([u + (q() - 0.5) * 0.1, Math.pow(1 - Math.abs(u), 1.25) * (0.85 + 0.3 * q())]); }
    pts.push([1, 0]);
    return { x, w, h, pts };
  });
  return { peaks, stars, ridgeA, ridgeB, hills, houses, clouds, front, deckTop, deckBot, birds, wisps, motes, rays, streaks };
}

function buildLens() {
  const s = LR * 2 + 60, o = s / 2, { c, x } = offscreen(s, s);
  x.save(); x.shadowColor = 'rgba(2,6,22,0.55)'; x.shadowBlur = 28; x.shadowOffsetY = 12;
  x.fillStyle = '#1a2142'; x.beginPath(); x.arc(o, o, LR, 0, TAU); x.fill(); x.restore();
  const bz = x.createLinearGradient(0, o - LR, 0, o + LR);
  bz.addColorStop(0, '#f1f3f8'); bz.addColorStop(0.45, '#9aa2b4'); bz.addColorStop(0.55, '#7d8597'); bz.addColorStop(1, '#d9dde6');
  x.fillStyle = bz; x.beginPath(); x.arc(o, o, LR, 0, TAU); x.fill();
  x.fillStyle = '#20284d'; x.beginPath(); x.arc(o, o, LR - 9, 0, TAU); x.fill();
  const fc = x.createRadialGradient(o, o - 50, 10, o, o, LR - 13);
  fc.addColorStop(0, '#1b2452'); fc.addColorStop(1, '#0a0f2b');
  x.fillStyle = fc; x.beginPath(); x.arc(o, o, LR - 13, 0, TAU); x.fill();
  x.lineWidth = 12; x.strokeStyle = 'rgba(255,255,255,0.09)';
  x.beginPath(); x.arc(o, o, GR, ANG(VMIN), ANG(VMAX)); x.stroke();
  for (let v = VMIN; v <= VMAX; v++) {
    const a = ANG(v), major = v % 5 === 0, r0 = major ? GR - 30 : GR - 20, r1 = GR - 9;
    x.strokeStyle = v === 0 ? YEL : major ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)';
    x.lineWidth = major ? 4 : 2.5;
    x.beginPath(); x.moveTo(o + Math.cos(a) * r0, o + Math.sin(a) * r0); x.lineTo(o + Math.cos(a) * r1, o + Math.sin(a) * r1); x.stroke();
    if (major) {
      x.font = `700 23px ${KR}`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = v === 0 ? YEL : 'rgba(255,255,255,0.75)';
      x.fillText(v < 0 ? '−' + -v : String(v), o + Math.cos(a) * (GR - 50), o + Math.sin(a) * (GR - 50) + 1);
    }
  }
  return { c, o };
}

function buildGrain() {
  const { c, x } = offscreen(256, 256), id = x.createImageData(256, 256), q = rand(4242);
  for (let i = 0; i < 256 * 256; i++) { const v = q() < 0.5 ? 0 : 255; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = Math.floor(q() * 26); }
  x.putImageData(id, 0, 0);
  return c;
}

// ------------------------------------------------------------------ text layout
function layout(c, text, font) {
  c.font = font;
  const xs = [];
  for (let i = 0; i <= text.length; i++) xs.push(c.measureText(text.slice(0, i)).width);
  return { text, font, xs };
}
/** per-syllable pop in (rise + outBack scale), faster lift-out (power2.in) */
function popLine(c, L, x, y, t, tIn, tOut, color, accent, st = 0.045) {
  c.font = L.font; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  for (let i = 0; i < L.text.length; i++) {
    const ch = L.text[i];
    if (ch === ' ') continue;
    const pin = seg(t, tIn + i * st, 0.5);
    if (pin <= 0) continue;
    const pout = tOut == null ? 0 : seg(t, tOut + i * 0.022, 0.3);
    if (pout >= 1) continue;
    const a = Math.min(1, pin * 2.4) * (1 - pout);
    const sc = 0.5 + 0.5 * E.outBack(pin, 1.7);
    const dy = (1 - E.outExpo(pin)) * 50 - E.in2(pout) * 80;
    const cx = x + (L.xs[i] + L.xs[i + 1]) / 2;
    c.save(); c.translate(cx, y + dy); c.scale(sc, sc);
    c.globalAlpha = a * 0.4; c.fillStyle = '#060a1e'; c.fillText(ch, 0, 5);
    c.globalAlpha = a; c.fillStyle = accent && accent(i) ? YEL : color; c.fillText(ch, 0, 0);
    c.restore();
  }
}
function pill(c, x, y, w, h, fill = 'rgba(12,18,46,0.8)', stroke = 'rgba(255,255,255,0.22)') {
  c.beginPath(); c.roundRect(x, y, w, h, h / 2);
  c.fillStyle = fill; c.fill();
  if (stroke) { c.lineWidth = 2; c.strokeStyle = stroke; c.stroke(); }
}
/** tabular: every digit in a fixed cell, punctuation in narrower fixed cells */
function tab(c, s, x, y, cw, pw) {
  let cx = x;
  for (const ch of s) { const w = /\d/.test(ch) ? cw : pw; c.fillText(ch, cx + w / 2, y); cx += w; }
  return cx - x;
}

// ------------------------------------------------------------------ palette over time (night → dawn → sunrise)
const SKY = [
  { top: [6, 11, 34], mid: [16, 26, 70], low: [48, 50, 104], glow: [132, 88, 140], lit: [104, 116, 172], shade: [50, 58, 112], body: [80, 88, 146], land: [16, 22, 52] },
  { top: [22, 38, 98], mid: [74, 86, 158], low: [198, 146, 176], glow: [255, 168, 150], lit: [222, 214, 236], shade: [128, 120, 178], body: [178, 170, 210], land: [52, 56, 104] },
  { top: [44, 88, 170], mid: [124, 166, 224], low: [255, 210, 168], glow: [255, 226, 176], lit: [255, 244, 232], shade: [190, 156, 190], body: [236, 214, 226], land: [80, 80, 128] },
];
function pal(t) {
  const d1 = sstep(1.6, 3.8, t), d2 = sstep(3.9, 6.3, t), o = {};
  for (const k in SKY[0]) o[k] = mix3(mix3(SKY[0][k], SKY[1][k], d1), SKY[2][k], d2);
  o.d1 = d1; o.d2 = d2;
  return o;
}

// ------------------------------------------------------------------ drawing: clouds
function cloud(c, cl, x, y, sc, P, litFill, alpha = 1) {
  const { P: ps, w } = cl;
  c.globalAlpha = alpha;
  c.beginPath();
  for (const [dx, dy, r] of ps) { const X = x + dx * sc, Y = y + dy * sc, R = r * sc; c.moveTo(X + R, Y); c.arc(X, Y, R, 0, TAU); }
  c.roundRect(x - (w / 2) * sc, y - 26 * sc, w * sc, 26 * sc, 13 * sc);
  c.fillStyle = rgb(P.shade); c.fill();
  c.beginPath();
  for (const [dx, dy, r] of ps) { const X = x + dx * sc, Y = y + (dy - 0.14 * r) * sc, R = r * 0.86 * sc; c.moveTo(X + R, Y); c.arc(X, Y, R, 0, TAU); }
  c.fillStyle = litFill; c.fill();
  c.globalAlpha = 1;
}
/** one receding row of the cloud sea; fy flattens the puffs (seen at a grazing angle they are wide and low) */
function puffRow(c, y, r, fy, drift, fillShade, fillLit, seed) {
  const step = r * 1.15, k0 = Math.floor((-r - drift) / step) - 1, k1 = Math.ceil((W + r - drift) / step) + 1;
  c.beginPath();
  for (let k = k0; k <= k1; k++) {
    const hx = hash(k * 7.1 + seed), rr = r * (0.7 + 0.6 * hx), X = k * step + drift + (hash(k * 3.3 + seed) - 0.5) * r * 0.6, Y = y - rr * fy * 0.3;
    c.moveTo(X + rr, Y); c.ellipse(X, Y, rr, rr * fy, 0, 0, TAU);
  }
  c.fillStyle = fillShade; c.fill();
  c.beginPath();
  for (let k = k0; k <= k1; k++) {
    const hx = hash(k * 7.1 + seed), rr = r * (0.7 + 0.6 * hx), X = k * step + drift + (hash(k * 3.3 + seed) - 0.5) * r * 0.6, Y = y - rr * fy * 0.3 - rr * fy * 0.2;
    c.moveTo(X + rr * 0.84, Y); c.ellipse(X, Y, rr * 0.84, rr * fy * 0.8, 0, 0, TAU);
  }
  c.fillStyle = fillLit; c.fill();
}

// ------------------------------------------------------------------ drawing: the balloon
const ENV = { R: 172, yT: -182, hwT: 40 };
ENV.ec = ENV.yT - 1.25 * ENV.R;
ENV.top = ENV.ec - ENV.R;
function hw(y) {
  const { R, ec, yT, hwT } = ENV;
  if (y <= ec) return Math.sqrt(Math.max(0, R * R - (y - ec) * (y - ec)));
  const u = clamp((y - ec) / (yT - ec));
  return hwT + (R - hwT) * Math.pow(Math.cos((u * Math.PI) / 2), 1.15);
}
const ENV_Y = Array.from({ length: 41 }, (_, i) => ENV.top + ((ENV.yT - ENV.top) * Math.pow(i / 40, 1.1)));
function envPath(c) {
  c.beginPath();
  ENV_Y.forEach((y, i) => (i ? c.lineTo(-hw(y), y) : c.moveTo(-hw(y), y)));
  for (let i = ENV_Y.length - 1; i >= 0; i--) c.lineTo(hw(ENV_Y[i]), ENV_Y[i]);
}
function balloon(c, x, y, sc, o) {
  const { amb, sunK, burn, spin, colA, colB, trim, simple, t } = o;
  c.save(); c.translate(x, y); c.scale(sc, sc);
  const dark = (cl, k) => mix3(cl, [14, 18, 46], k);
  const night = 0.55 * (1 - amb);
  // ropes
  c.strokeStyle = rgb(dark([70, 58, 46], night)); c.lineWidth = 2.2;
  c.beginPath();
  for (const [a, b] of [[-38, -42], [38, 42], [-14, -16], [14, 16]]) { c.moveTo(a, ENV.yT + 30); c.lineTo(b, -76); }
  c.stroke();
  // burner frame + flame
  if (!simple) {
    c.fillStyle = rgb(dark([92, 96, 116], night)); c.fillRect(-24, -134, 48, 12);
    c.fillRect(-3, -124, 6, 46);
    const fl = burn * (0.86 + 0.14 * Math.sin(t * 61) * Math.sin(t * 37 + 1));
    const fh = 14 + 78 * fl, fw = 9 + 13 * fl;
    c.save(); c.globalCompositeOperation = 'lighter';
    if (fl > 0.02) {
      const gl = c.createRadialGradient(0, -150, 4, 0, -150, 70 + 60 * fl);
      gl.addColorStop(0, `rgba(255,170,80,${0.55 * fl})`); gl.addColorStop(1, 'rgba(255,120,40,0)');
      c.fillStyle = gl; c.fillRect(-140, -290, 280, 280);
    }
    c.restore();
    c.beginPath(); c.moveTo(-fw, -134); c.quadraticCurveTo(-fw * 0.9, -134 - fh * 0.5, 0, -134 - fh); c.quadraticCurveTo(fw * 0.9, -134 - fh * 0.5, fw, -134); c.closePath();
    c.fillStyle = fl > 0.05 ? `rgba(255,128,44,${0.5 + 0.45 * fl})` : 'rgba(110,170,255,0.85)'; c.fill();
    if (fl > 0.05) {
      c.beginPath(); c.moveTo(-fw * 0.45, -134); c.quadraticCurveTo(-fw * 0.4, -134 - fh * 0.4, 0, -134 - fh * 0.66); c.quadraticCurveTo(fw * 0.4, -134 - fh * 0.4, fw * 0.45, -134); c.closePath();
      c.fillStyle = `rgba(255,238,180,${0.9 * fl})`; c.fill();
    }
  }
  // skirt
  c.beginPath(); c.moveTo(-ENV.hwT, ENV.yT - 2); c.lineTo(ENV.hwT, ENV.yT - 2); c.lineTo(30, ENV.yT + 32); c.lineTo(-30, ENV.yT + 32); c.closePath();
  c.fillStyle = rgb(dark(trim, 0.25 + night)); c.fill();
  // envelope: gores that follow the curvature (meridians x = hw(y)·sin φ), slowly turning
  c.save(); envPath(c); c.clip();
  const G = 10, fs = spin - Math.floor(spin), base = Math.floor(spin);
  const ys = simple ? ENV_Y.filter((_, i) => i % 3 === 0 || i === ENV_Y.length - 1) : ENV_Y;
  for (let k = -1; k <= G; k++) {
    const p0 = clamp(-Math.PI / 2 + (Math.PI * (k + fs)) / G, -Math.PI / 2, Math.PI / 2);
    const p1 = clamp(-Math.PI / 2 + (Math.PI * (k + 1 + fs)) / G, -Math.PI / 2, Math.PI / 2);
    if (p1 - p0 < 1e-4) continue;
    c.beginPath();
    ys.forEach((yy, i) => (i ? c.lineTo(hw(yy) * Math.sin(p0) - 0.6, yy) : c.moveTo(hw(yy) * Math.sin(p0) - 0.6, yy)));
    for (let i = ys.length - 1; i >= 0; i--) c.lineTo(hw(ys[i]) * Math.sin(p1) + 0.6, ys[i]);
    c.fillStyle = rgb(((k - base) & 1) === 0 ? colA : colB); c.fill();
  }
  // crown and a band (latitudes are straight lines in a side view)
  c.fillStyle = rgb(trim);
  c.fillRect(-200, ENV.top - 4, 400, ENV.R * 0.2);
  c.fillRect(-200, ENV.ec + ENV.R * 0.3, 400, 22);
  // light: night dims it, the side light swings from the sky (left) to the sun (right)
  if (night > 0.004) { c.fillStyle = `rgba(10,14,42,${night})`; c.fillRect(-200, ENV.top - 10, 400, 600); }
  const sg = c.createLinearGradient(-ENV.R, 0, ENV.R, 0);
  sg.addColorStop(0, `rgba(255,255,255,${0.12 * (1 - sunK)})`); sg.addColorStop(0.45, 'rgba(0,0,0,0)');
  sg.addColorStop(1, `rgba(10,14,40,${0.42 * (1 - sunK)})`);
  c.fillStyle = sg; c.fillRect(-200, ENV.top - 10, 400, 600);
  if (sunK > 0.004) {
    const wg = c.createLinearGradient(-ENV.R, 0, ENV.R, 0);
    wg.addColorStop(0, `rgba(40,30,80,${0.35 * sunK})`); wg.addColorStop(0.55, 'rgba(0,0,0,0)'); wg.addColorStop(1, `rgba(255,196,120,${0.38 * sunK})`);
    c.fillStyle = wg; c.fillRect(-200, ENV.top - 10, 400, 600);
  }
  const vg = c.createLinearGradient(0, ENV.ec, 0, ENV.yT);
  vg.addColorStop(0, 'rgba(10,14,40,0)'); vg.addColorStop(1, 'rgba(10,14,40,0.32)');
  c.fillStyle = vg; c.fillRect(-200, ENV.ec, 400, ENV.yT - ENV.ec + 4);
  c.fillStyle = 'rgba(255,255,255,0.13)';
  c.beginPath(); c.ellipse(-ENV.R * 0.42, ENV.ec - ENV.R * 0.5, ENV.R * 0.16, ENV.R * 0.3, -0.5, 0, TAU); c.fill();
  if (!simple && burn > 0.01) {     // the burner lights the envelope from inside
    c.globalCompositeOperation = 'lighter';
    const bg = c.createRadialGradient(0, ENV.yT, 10, 0, ENV.yT, 330);
    bg.addColorStop(0, `rgba(255,150,60,${0.6 * burn})`); bg.addColorStop(0.5, `rgba(255,110,40,${0.22 * burn})`); bg.addColorStop(1, 'rgba(255,90,30,0)');
    c.fillStyle = bg; c.fillRect(-200, ENV.top - 10, 400, 600);
    c.globalCompositeOperation = 'source-over';
  }
  c.restore();
  // basket
  const wick = dark([136, 90, 52], night), wickD = dark([92, 58, 34], night);
  if (!simple) {
    // two heads peeking over the rim
    for (const [hx, hy, cap] of [[-17, -88, [48, 66, 128]], [15, -90, [214, 70, 66]]]) {
      c.fillStyle = rgb(dark([236, 190, 150], night)); c.beginPath(); c.arc(hx, hy, 13, 0, TAU); c.fill();
      c.fillStyle = rgb(dark(cap, night)); c.beginPath(); c.arc(hx, hy - 2, 13.5, Math.PI, TAU); c.fill();
      c.fillRect(hx - 14, hy - 3, 28, 4);
    }
  }
  c.beginPath(); c.roundRect(-44, -78, 88, 78, [6, 6, 12, 12]); c.fillStyle = rgb(wick); c.fill();
  c.strokeStyle = rgb(wickD); c.lineWidth = 2;
  c.beginPath();
  for (let yy = -62; yy < -4; yy += 11) { c.moveTo(-42, yy); c.lineTo(42, yy); }
  for (let xx = -30; xx <= 30; xx += 15) { c.moveTo(xx, -66); c.lineTo(xx, -4); }
  c.stroke();
  c.fillStyle = rgb(wickD); c.beginPath(); c.roundRect(-47, -82, 94, 14, 5); c.fill();
  c.restore();
}

// ------------------------------------------------------------------ the demo
defineDemo({
  id: '90-measure-hud',
  title: '구름 위의 아침',
  tech: '재는 연출 · 오도미터 + 계기 바늘 + 줄자',
  duration: D,
  background: '#0a1230',
  async setup(api) { captionScrim(api, '42,32,74');
    const KTEXT = '새벽 · 열기구해를 먼저 보려면몇 미터 올라갈까?구름 아래는 아직 새벽,여기는 벌써 아침고도상승 속도빨리 감기구름 꼭대기';
    await Promise.all([
      fontReady(`900 100px ${KR}`, KTEXT),
      fontReady(`800 80px ${KR}`, '0123456789,.+−m/s'),
      fontReady(`700 30px ${KR}`, KTEXT),
      fontReady(`700 24px ${MONO}`, '0123456789'),
    ]);
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.g = ctx;
    SOFT = api.headless;
    this.k = bake();
    buildStrips();
    SCN = buildScene();
    LENS = buildLens();
    GRAIN = ctx.createPattern(buildGrain(), 'repeat');
    GLINT = offscreen(CHIP_W, CHIP_H).c;
    this.labelT = new Map();
    for (let z = 100; z <= 2600; z += 100) this.labelT.set(z, tPass(z));
    this.tTop = tPass(DECK_TOP + 40);
    // warm-up: every offscreen source is drawn into the main canvas once before the first real frame
    for (const src of [...STR.levels, STR.yellow, STR.mask, LENS.c, GLINT]) ctx.drawImage(src, 0, 0, 1, 1, 0, 0, 1, 1);
    ctx.fillStyle = GRAIN; ctx.fillRect(0, 0, 2, 2);
    ctx.clearRect(0, 0, W, H);
    TL = {
      kick: layout(ctx, '새벽 · 열기구', `700 32px ${KR}`),
      a: layout(ctx, '해를 먼저 보려면', `900 100px ${KR}`),
      b: layout(ctx, '몇 미터 올라갈까?', `900 100px ${KR}`),
      c: layout(ctx, '구름 아래는 아직 새벽,', `800 64px ${KR}`),
      d: layout(ctx, '여기는 벌써 아침', `900 100px ${KR}`),
    };
  },

  frame(t) {
    const c = this.g;
    const P = pal(t);
    const Z = zAt(t), C = camC(t);
    const vC = (camC(t + 0.01) - camC(t - 0.01)) / 0.02;          // near-plane speed, px/s
    const blurPx = Math.abs(vC) * SHUT;
    const sunK = sstep(5.1, 6.6, t);
    const bob = 3.2 * Math.sin(t * 1.5) * sstep(5.2, 6.6, t);
    const Yb = ybCam(t) + bob;
    // burner: three blasts, fast attack, short decay
    let burn = 0;
    for (const [b0, bd] of [[0.5, 0.62], [1.72, 0.58], [3.0, 0.36]]) {
      const k = t < b0 ? 0 : t < b0 + 0.07 ? (t - b0) / 0.07 : t < b0 + bd ? 1 : Math.max(0, 1 - (t - b0 - bd) / 0.2);
      burn = Math.max(burn, k);
    }
    // handheld + liftoff shake (world only)
    const sh = seg(t, 0.55, 0.55), shA = sh > 0 && sh < 1 ? 4 * (1 - sh) * (1 - sh) : 0;
    const hx = 1.3 * Math.sin(t * 0.9) + 0.7 * Math.sin(t * 1.7 + 1) + shA * Math.sin(t * 71);
    const hy = 1.1 * Math.sin(t * 0.7 + 2) + shA * Math.sin(t * 53 + 1);

    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    // ---------------------------------------------------------------- sky
    const sk = c.createLinearGradient(0, 0, 0, 1260);
    sk.addColorStop(0, rgb(P.top)); sk.addColorStop(0.5, rgb(P.mid)); sk.addColorStop(1, rgb(P.low));
    c.fillStyle = sk; c.fillRect(0, 0, W, H);
    const hg = c.createRadialGradient(880, 1190, 20, 880, 1190, 900);
    hg.addColorStop(0, rgb(P.glow, 0.42 + 0.4 * P.d2)); hg.addColorStop(1, rgb(P.glow, 0));
    c.fillStyle = hg; c.fillRect(0, 0, W, H);
    c.translate(hx, hy);
    // stars fade with the dawn
    const starK = 1 - sstep(1.4, 4.2, t);
    if (starK > 0.01) {
      c.fillStyle = '#ffffff';
      for (const s of SCN.stars) {
        c.globalAlpha = starK * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.f + s.ph))) * (1 - s.y / 1300);
        c.fillRect(s.x, s.y + C * 0.03, s.s, s.s);
      }
      c.globalAlpha = 1;
    }
    const yTop = GROUND - DECK_TOP * S + C, yBot = GROUND - DECK_BOT * S + C;
    const open = Math.max(0, Z - DECK_TOP) * S;
    const yH = yTop - 0.72 * open;                                    // horizon over the sea
    // ---------------------------------------------------------------- the ground world (night)
    if (open < 700) {
      const ridgeFill = (pts, dy, col) => {
        c.beginPath(); c.moveTo(-40, H + 900);
        for (const [x, y] of pts) c.lineTo(x, y + dy);
        c.lineTo(W + 40, H + 900); c.fillStyle = col; c.fill();
      };
      {
        ridgeFill(SCN.ridgeA, C * 0.16, rgb(mix3([44, 56, 110], P.low, 0.25 + 0.3 * P.d1)));
        ridgeFill(SCN.ridgeB, C * 0.26, rgb(mix3([30, 40, 84], P.low, 0.15 + 0.25 * P.d1)));
        // two far balloons, already up
        for (const fb of [{ x: 345, f: 0.42, g: 1330, sc: 0.2, z: 140 + 70 * t, a: [64, 170, 172], b: [248, 236, 220], tr: [34, 54, 104] },
          { x: 940, f: 0.3, g: 1250, sc: 0.16, z: 360 + 55 * t, a: [168, 92, 160], b: [250, 238, 226], tr: [52, 38, 96] }]) {
          const y = fb.g - fb.z * S * fb.f + C * fb.f;
          if (y < H + 200) balloon(c, fb.x, y, fb.sc, { amb: 0.35 + 0.65 * P.d1, sunK: 0, burn: 0, spin: t * 0.15, colA: fb.a, colB: fb.b, trim: fb.tr, simple: true, t });
        }
        // village hills with lit windows
        const hy = C * 0.5;
        ridgeFill(SCN.hills, hy, rgb(P.land));
        if (1380 + hy < H + 50) {
          for (const h of SCN.houses) {
            let yy = 1408 + hy - 30;
            for (const [x, y] of SCN.hills) if (Math.abs(x - h.x) < 16) { yy = y + hy; break; }
            c.fillStyle = rgb(mix3(P.land, [10, 14, 34], 0.4));
            c.beginPath(); c.moveTo(h.x - h.w / 2, yy + 4); c.lineTo(h.x - h.w / 2, yy - h.h); c.lineTo(h.x, yy - h.h - 10); c.lineTo(h.x + h.w / 2, yy - h.h); c.lineTo(h.x + h.w / 2, yy + 4); c.fill();
            if (h.lit) { c.fillStyle = `rgba(255,186,104,${(0.65 + 0.35 * Math.sin(t * 2 + h.ph)) * (1 - 0.6 * P.d1)})`; c.fillRect(h.x - 4, yy - h.h + 6, 7, 7); }
          }
          const mg = c.createLinearGradient(0, 1350 + hy, 0, 1440 + hy);
          mg.addColorStop(0, 'rgba(200,210,255,0)'); mg.addColorStop(0.6, 'rgba(200,210,255,0.16)'); mg.addColorStop(1, 'rgba(200,210,255,0)');
          c.fillStyle = mg; c.fillRect(0, 1350 + hy, W, 90);
        }
      }
    }
    // ---------------------------------------------------------------- the cloud sea (only above the deck)
    const litGrad = c.createLinearGradient(0, 0, W, 0);
    litGrad.addColorStop(0, rgb(P.lit)); litGrad.addColorStop(0.8, rgb(mix3(P.lit, [255, 236, 200], 0.6 * sunK)));
    litGrad.addColorStop(1, rgb(mix3(P.lit, [255, 230, 190], 0.4 * sunK)));
    // sun (behind the sea), its glow and rays
    const sunCy = yH + track([[5.2, 95], [6.2, 10, E.outCubic], [10, -150, (p) => p]])(t), sunX = 880;
    if (open > 4 && t > 5.0) {
      c.fillStyle = 'rgba(255,246,222,1)'; c.beginPath(); c.arc(sunX, sunCy, 62, 0, TAU); c.fill();
    }
    if (open > 4) {
      // distant peaks poke through at the horizon (irregular ridgelines, the face toward the sun lit)
      const ph = yTop - yH;
      for (const pk of SCN.peaks) {
        const pts = pk.pts.map(([u, hgt]) => [pk.x + u * pk.w, yH + ph * 0.25 - hgt * pk.h * ph]);
        c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const q of pts) c.lineTo(q[0], q[1]);
        c.fillStyle = rgb(mix3(P.low, [84, 88, 146], 0.6)); c.fill();
        const top = pts.reduce((m, q) => (q[1] < m[1] ? q : m), pts[0]);
        c.beginPath(); c.moveTo(top[0], top[1]);
        for (const q of pts) if (q[0] > top[0]) c.lineTo(q[0], q[1]);
        c.lineTo(top[0] + pk.w * 0.15, yH + ph * 0.25);
        c.fillStyle = rgb(mix3(mix3(P.low, [150, 150, 200], 0.4), [255, 206, 160], 0.6 * sunK), 0.75); c.fill();
      }
      // sea body + receding rows of puffs (smaller toward the horizon)
      const sb = c.createLinearGradient(0, yH, 0, yTop);
      sb.addColorStop(0, rgb(mix3(P.low, P.lit, 0.5))); sb.addColorStop(1, rgb(P.body));
      c.fillStyle = sb; c.fillRect(0, yH, W, yTop - yH + 2);
      for (let i = 0; i < 7; i++) {
        const u = Math.pow((i + 1) / 8, 1.5), y = yH + (yTop - yH) * u, r = 10 + 80 * u;
        const haze = 0.75 * (1 - u);                                  // far rows melt into the horizon haze
        puffRow(c, y, r, 0.3 + 0.42 * u, t * (3 + 14 * u) + i * 37, rgb(mix3(mix3(P.shade, P.lit, 0.25), mix3(P.lit, P.low, 0.3), haze)), litGrad, i * 13.7);
        if (i === 2) {
          // another balloon climbs out of the sea behind us
          const fz = sstep(5.6, 9.8, t);
          if (fz > 0) balloon(c, 270, y - 6 - 70 * fz, 0.13, { amb: 1, sunK, burn: 0, spin: t * 0.2, colA: [70, 168, 170], colB: [250, 240, 226], trim: [36, 60, 110], simple: true, t });
        }
      }
    }
    if (sunK > 0.003) {
      c.save(); c.globalCompositeOperation = 'lighter';
      const sg = c.createRadialGradient(sunX, sunCy, 20, sunX, sunCy, 520);
      sg.addColorStop(0, `rgba(255,226,170,${0.42 * sunK})`); sg.addColorStop(0.35, `rgba(255,190,120,${0.14 * sunK})`); sg.addColorStop(1, 'rgba(255,170,100,0)');
      c.fillStyle = sg; c.fillRect(0, 0, W, H);
      const rl = E.outExpo(seg(t, 5.35, 1.3));
      if (rl > 0) {
        const rg = c.createRadialGradient(sunX, sunCy, 40, sunX, sunCy, 1100 * rl);
        rg.addColorStop(0, `rgba(255,232,190,${0.16 * sunK})`); rg.addColorStop(0.55, `rgba(255,232,190,${0.07 * sunK})`); rg.addColorStop(1, 'rgba(255,232,190,0)');
        c.fillStyle = rg;
        c.beginPath();
        for (const ry of SCN.rays) {
          const a = ry.a + t * 0.05, L = (360 + 700 * ry.len) * rl;
          c.moveTo(sunX, sunCy);
          c.lineTo(sunX + Math.cos(a - ry.w) * L, sunCy + Math.sin(a - ry.w) * L);
          c.lineTo(sunX + Math.cos(a + ry.w) * L, sunCy + Math.sin(a + ry.w) * L);
        }
        c.fill();
      }
      c.restore();
    }
    // ---------------------------------------------------------------- near plane: clouds behind, birds, field, tape
    const nearY = (z, f) => GROUND - z * S * f + C * f;
    const litN = rgb(P.lit);
    for (const cl of SCN.clouds) {
      const y = nearY(cl.z, cl.f);
      if (y > -150 && y < H + 150) cloud(c, cl.c, cl.x + Math.sin(t * 0.2 + cl.z) * 10, y, 1, P, litN);
    }
    // birds cross early in the climb
    c.strokeStyle = rgb(mix3([18, 24, 52], P.low, 0.2)); c.lineWidth = 3; c.lineCap = 'round';
    c.beginPath();
    for (const b of SCN.birds) {
      const x = b.x + 120 * t, y = nearY(b.z, 0.96) + Math.sin(t * 2 + b.ph) * 6;
      if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
      const fl = Math.sin(t * 10 + b.ph) * 9;
      c.moveTo(x - 14, y - fl); c.quadraticCurveTo(x - 6, y - 4, x, y); c.quadraticCurveTo(x + 6, y - 4, x + 14, y - fl);
    }
    c.stroke();
    // field, trees, burner light on the grass
    const gy = GROUND + C;
    if (gy < H + 40) {
      const fg = c.createLinearGradient(0, gy, 0, gy + 480);
      fg.addColorStop(0, rgb(mix3([24, 36, 70], P.land, 0.3))); fg.addColorStop(1, '#070b1e');
      c.fillStyle = fg; c.fillRect(0, gy, W, H - gy + 60);
      if (burn > 0.01) {
        c.save(); c.globalCompositeOperation = 'lighter';
        const bg = c.createRadialGradient(BX, gy, 10, BX, gy, 340);
        bg.addColorStop(0, `rgba(255,140,60,${0.3 * burn})`); bg.addColorStop(1, 'rgba(255,120,40,0)');
        c.fillStyle = bg; c.fillRect(BX - 360, gy - 200, 720, 560);
        c.restore();
      }
      c.fillStyle = '#0a1028';
      c.beginPath();
      for (const [tx, th] of [[30, 150], [78, 110], [980, 170], [1046, 130], [930, 90]]) {
        for (let k = 0; k < 3; k++) { const w = th * (0.34 - k * 0.08), yb = gy + 8 - k * th * 0.26; c.moveTo(tx - w, yb); c.lineTo(tx, yb - th * 0.5); c.lineTo(tx + w, yb); }
        c.rect(tx - 4, gy - 4, 8, 14);
      }
      c.fill();
      c.fillStyle = '#0d1430';
      c.beginPath();
      for (let x = 0; x < W; x += 26) { const hh = 6 + hash(x) * 10; c.moveTo(x, gy + 2); c.lineTo(x + 6, gy - hh); c.lineTo(x + 12, gy + 2); }
      c.fill();
    }
    // the tape blade: world-fixed ticks (0 m at the field), its tip rides at basket level
    const tipY = Yb;
    const bladeBot = Math.min(gy, H + 20);
    if (bladeBot > tipY) {
      c.fillStyle = YEL; c.fillRect(TX0, tipY, TX1 - TX0, bladeBot - tipY);
      c.fillStyle = '#d29a16'; c.fillRect(TX0, tipY, 4, bladeBot - tipY); c.fillRect(TX1 - 4, tipY, 4, bladeBot - tipY);
      const zLo = Math.max(0, (GROUND + C - H - 20) / S), zHi = Z;
      const th = 3 + blurPx, ta = Math.min(1, Math.pow(3 / th, 0.75));
      c.fillStyle = INK; c.globalAlpha = ta;
      for (let z = Math.ceil(zLo / 10) * 10; z <= zHi; z += 10) {
        const y = GROUND - z * S + C;
        if (y < tipY + 4) continue;
        const L = z % 100 === 0 ? 28 : z % 50 === 0 ? 20 : 11;
        c.fillRect(TX0 + 4, y - th / 2, L, th);
      }
      c.globalAlpha = 1;
      // labels pop out of the tip as it passes them
      c.textAlign = 'left'; c.textBaseline = 'middle';
      const nCopies = blurPx > 3 ? 4 : 1;
      for (let z = Math.max(100, Math.ceil(zLo / 100) * 100); z <= zHi; z += 100) {
        const y = GROUND - z * S + C;
        if (y < tipY + 8) continue;
        const p = seg(t, this.labelT.get(z) ?? 0, 0.34);
        if (p <= 0) continue;
        const big = z % 1000 === 0, sc = 0.45 + 0.55 * E.outBack(p, 2);
        c.font = `${big ? 800 : 700} ${big ? 27 : 23}px ${MONO}`;
        for (let k = 0; k < nCopies; k++) {
          const oy = nCopies > 1 ? (k / (nCopies - 1) - 0.5) * blurPx : 0;
          c.save(); c.translate(TX0 + 34, y + oy); c.scale(sc, sc);
          c.globalAlpha = Math.min(1, p * 2) * (nCopies > 1 ? 0.38 : 1);
          c.fillStyle = INK; c.fillText(String(z), 0, 1);
          c.restore();
        }
      }
      c.globalAlpha = 1;
      // the cloud-top mark across the blade
      if (Z > DECK_TOP) { c.fillStyle = 'rgba(29,22,6,0.85)'; c.fillRect(TX0, yTop - 3, TX1 - TX0, 6); }
      // tip cap and hook
      c.fillStyle = '#c7ced9'; c.beginPath(); c.roundRect(TX0 - 6, tipY - 12, TX1 - TX0 + 12, 14, 4); c.fill();
      c.fillStyle = '#7d8597'; c.fillRect(TX0 - 6, tipY - 2, TX1 - TX0 + 12, 4);
      c.fillStyle = '#c7ced9'; c.fillRect(TX1 + 2, tipY - 12, 8, 22);
    }
    // the tape case on the field
    if (gy < H + 10) {
      c.save(); c.translate(0, gy);
      c.fillStyle = '#262c46'; c.beginPath(); c.roundRect(56, 2, 180, 150, 34); c.fill();
      c.fillStyle = '#353c5c'; c.beginPath(); c.roundRect(56, 2, 180, 40, [34, 34, 6, 6]); c.fill();
      c.fillStyle = '#10142a'; c.fillRect(TX0 - 4, 0, TX1 - TX0 + 8, 10);
      c.strokeStyle = YEL; c.lineWidth = 9; c.beginPath(); c.arc(146, 92, 36, 0, TAU); c.stroke();
      c.fillStyle = '#c7ced9'; c.beginPath(); c.arc(146, 92, 12, 0, TAU); c.fill();
      c.fillStyle = YEL; c.beginPath(); c.roundRect(214, 40, 18, 46, 6); c.fill();
      c.restore();
    }
    // ---------------------------------------------------------------- the cloud deck (covers the tape inside it)
    if (yTop < H + 140 && yBot > -140) {
      const body = c.createLinearGradient(0, yTop, 0, yBot);
      body.addColorStop(0, rgb(P.body)); body.addColorStop(1, rgb(mix3(P.shade, [60, 60, 110], 0.25)));
      c.fillStyle = body; c.fillRect(0, yTop, W, Math.max(0, Math.min(H + 100, yBot) - yTop));
      if (yBot < H + 120) {
        c.beginPath();
        for (const [x, dy, r] of SCN.deckBot) { const X = wrap(x + t * 10, W + 240) - 120, Y = yBot + dy - r * 0.35; c.moveTo(X + r, Y); c.arc(X, Y, r, 0, TAU); }
        c.fillStyle = rgb(mix3(P.shade, [60, 60, 110], 0.25)); c.fill();
      }
      if (yTop > -120) {
        c.beginPath();
        for (const [x, dy, r] of SCN.deckTop) { const X = wrap(x + t * 16, W + 240) - 120, Y = yTop + dy + r * 0.3; c.moveTo(X + r, Y); c.arc(X, Y, r, 0, TAU); }
        c.fillStyle = rgb(P.shade); c.fill();
        c.beginPath();
        for (const [x, dy, r] of SCN.deckTop) { const X = wrap(x + t * 16, W + 240) - 120, Y = yTop + dy + r * 0.3 - r * 0.16; c.moveTo(X + r * 0.84, Y); c.arc(X, Y, r * 0.84, 0, TAU); }
        c.fillStyle = litGrad; c.fill();
      }
    }
    // ---------------------------------------------------------------- the balloon
    const nv = at(ND, t);
    const jit = clamp((Math.abs(nv) - 3) / 4) * (Math.sin(t * 47.1) * 0.6 + Math.sin(t * 73.3 + 1.3) * 0.4 + Math.sin(t * 113.7 + 0.4) * 0.3) * 0.22;
    const needleV = (tt) => at(ND, tt) + clamp((Math.abs(at(ND, tt)) - 3) / 4) * (Math.sin(tt * 47.1) * 0.6 + Math.sin(tt * 73.3 + 1.3) * 0.4 + Math.sin(tt * 113.7 + 0.4) * 0.3) * 0.22;
    balloon(c, BX + 3 * Math.sin(t * 0.8), Yb, 1, { amb: 0.3 + 0.7 * Math.max(P.d1 * 0.6, P.d2), sunK, burn, spin: t * 0.22, colA: [255, 111, 94], colB: [255, 241, 223], trim: [40, 56, 116], t });
    // the little dial on the basket (the loupe below magnifies it)
    const dX = BX + 3 * Math.sin(t * 0.8) + 24, dY = Yb - 40;
    c.fillStyle = '#e9edf5'; c.beginPath(); c.arc(dX, dY, 10, 0, TAU); c.fill();
    c.strokeStyle = '#1a2142'; c.lineWidth = 2; c.beginPath(); c.moveTo(dX, dY);
    c.lineTo(dX + Math.cos(ANG(nv + jit)) * 8, dY + Math.sin(ANG(nv + jit)) * 8); c.stroke();
    // ---------------------------------------------------------------- in front: near clouds, fog inside the deck, speed streaks
    for (const cl of SCN.front) {
      const y = nearY(cl.z, cl.f);
      if (y > -200 && y < H + 200) cloud(c, cl.c, cl.x, y, 1.15, P, litN, cl.a);
    }
    const fogK = sstep(DECK_BOT - 60, DECK_BOT + 160, Z) * (1 - sstep(DECK_TOP - 80, DECK_TOP + 90, Z));
    if (fogK > 0.004) {
      c.fillStyle = rgb(P.body, 0.5 * fogK); c.fillRect(-10, -10, W + 20, H + 20);
      for (const w of SCN.wisps) {
        const y = wrap(w.y + C * 1.35, 2600) - 300;
        const gr = c.createRadialGradient(w.x, y, 10, w.x, y, w.w);
        gr.addColorStop(0, rgb(P.lit, 0.55 * fogK * w.a)); gr.addColorStop(1, rgb(P.lit, 0));
        c.save(); c.translate(w.x, y); c.scale(1, 0.42); c.translate(-w.x, -y);
        c.fillStyle = gr; c.fillRect(w.x - w.w, y - w.w, w.w * 2, w.w * 2); c.restore();
      }
    }
    if (blurPx > 2) {
      c.strokeStyle = `rgba(235,240,255,${Math.min(0.35, blurPx / 60)})`; c.lineWidth = 2;
      c.beginPath();
      for (const s of SCN.streaks) {
        const y = wrap(s.y + C * 1.1, 2600) - 300, L = blurPx * 3.2 * s.a;
        if (Math.abs(s.x - BX) < 190 && y > Yb - 600 && y < Yb + 40) continue;
        c.moveTo(s.x, y); c.lineTo(s.x, y - L);
      }
      c.stroke();
    }
    // sunlit ice motes above the clouds
    if (sunK > 0.01) {
      c.save(); c.globalCompositeOperation = 'lighter';
      for (const m of SCN.motes) {
        const x = wrap(m.x + Math.sin(t * 0.6 + m.ph) * 20 - t * m.sp, W), y = 640 + wrap(m.y - t * m.sp * 0.6, 820);
        c.fillStyle = `rgba(255,236,200,${sunK * (0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 3 + m.ph)))})`;
        c.beginPath(); c.arc(x, y, m.s, 0, TAU); c.fill();
      }
      c.restore();
    }
    // ---------------------------------------------------------------- measuring marks: cloud-top tag, level line, rings
    if (Z > DECK_TOP) {
      const p = seg(t, this.tTop, 0.45);
      if (p > 0 && yTop < H) {
        const sc = 0.4 + 0.6 * E.outBack(p, 1.8);
        c.save(); c.translate(TX1 + 12, yTop); c.scale(sc, sc); c.globalAlpha = Math.min(1, p * 2);
        c.fillStyle = YEL; c.beginPath(); c.moveTo(0, 0); c.lineTo(14, -10); c.lineTo(14, 10); c.fill();
        pill(c, 14, -27, 286, 54);
        c.fillStyle = '#dfe6f5'; c.font = `700 26px ${KR}`; c.textAlign = 'left'; c.textBaseline = 'middle';
        c.fillText('구름 꼭대기', 34, 1);
        c.fillStyle = TXT; c.font = `800 28px ${KR}`; c.textAlign = 'center';
        const w = tab(c, '2,050', 176, 1, 18, 9);
        c.fillStyle = UNIT; c.font = `700 22px ${KR}`; c.fillText('m', 176 + w + 14, 3);
        c.restore();
      }
      const rp = seg(t, this.tTop, 0.8);
      if (rp > 0 && rp < 1) { c.strokeStyle = `rgba(255,200,61,${0.9 * (1 - rp)})`; c.lineWidth = 4; c.beginPath(); c.arc((TX0 + TX1) / 2, yTop, 12 + 90 * E.outExpo(rp), 0, TAU); c.stroke(); }
    }
    c.translate(-hx, -hy);
    // level line from the tape tip to the basket
    const lp = E.outExpo(seg(t, 0.3, 0.6));
    if (lp > 0) {
      const x0 = TX1 + 10, x1 = lerp(x0, BX - 52, lp), ly = tipY + hy;
      c.strokeStyle = YEL; c.lineWidth = 3; c.setLineDash([10, 8]);
      c.beginPath(); c.moveTo(x0, ly); c.lineTo(x1, ly); c.stroke(); c.setLineDash([]);
      c.fillStyle = YEL; c.beginPath(); c.arc(x1, ly, 5, 0, TAU); c.fill();
    }
    const ringP = seg(t, T_LAND, 0.9);
    if (ringP > 0 && ringP < 1) {
      c.strokeStyle = `rgba(255,200,61,${0.95 * (1 - ringP)})`; c.lineWidth = 5;
      c.beginPath(); c.arc((TX0 + TX1) / 2 + hx, tipY + hy, 14 + 120 * E.outExpo(ringP), 0, TAU); c.stroke();
    }
    // ---------------------------------------------------------------- the odometer chip
    const cp = E.outExpo(seg(t, 0.35, 0.7));
    if (cp > 0) {
      const punch = 1 + 0.07 * Math.sin(Math.PI * seg(t, T_LAND, 0.32)) ;
      const cy = tipY + hy - 18 - CHIP_H;
      c.save();
      c.translate(CHIP_X + hx * 0.6, cy + CHIP_H); c.scale(punch, punch); c.translate(0, -CHIP_H);
      // glow behind the landed number
      const gk = sstep(T_LAND - 0.05, T_LAND + 0.3, t) * (1 - 0.5 * sstep(6.5, 8.5, t));
      if (gk > 0.01) {
        const gg = c.createRadialGradient(CHIP_W / 2, CHIP_H / 2, 10, CHIP_W / 2, CHIP_H / 2, 260);
        gg.addColorStop(0, `rgba(255,200,61,${0.3 * gk})`); gg.addColorStop(1, 'rgba(255,200,61,0)');
        c.fillStyle = gg; c.fillRect(-120, -140, CHIP_W + 240, CHIP_H + 280);
      }
      c.beginPath(); c.rect(-20, -60, CHIP_W * cp + 20, CHIP_H + 80); c.clip();
      c.save(); c.shadowColor = 'rgba(2,6,22,0.5)'; c.shadowBlur = 22; c.shadowOffsetY = 8;
      pill(c, 0, 0, CHIP_W, CHIP_H, 'rgba(14,20,50,0.9)', null); c.restore();
      c.lineWidth = 2; c.strokeStyle = `rgba(255,255,255,${0.22 + 0.5 * gk})`; c.beginPath(); c.roundRect(0, 0, CHIP_W, CHIP_H, CHIP_H / 2); c.stroke();
      // wheels: position = mean over the shutter, blur = range over the shutter
      const wy = (CHIP_H - WIN_H) / 2, yk = sstep(T_LAND, T_LAND + 0.3, t);
      const qs = [0, 1, 2, 3, 4].map((s) => zAt(t + SHUT * (s / 4 - 0.5)));
      const qNow = zAt(t);
      c.save(); c.beginPath();
      for (let j = 0; j < 4; j++) c.roundRect(WX[j], wy, CELL_W, WIN_H, 10);
      c.clip();
      for (let j = 0; j < 4; j++) {
        let mn = Infinity, mx = -Infinity, sum = 0;
        for (const q of qs) { const u = wheelU(q, j); mn = Math.min(mn, u); mx = Math.max(mx, u); sum += u; }
        drawWheel(c, WX[j], wy, wrap(sum / 5, 10), mx - mn, yk);
        const dim = j > 0 ? clamp(1 - wheelU(qNow, j)) : 0;     // leading zeros stay dark until their wheel turns
        if (dim > 0.004) { c.fillStyle = `rgba(12,18,48,${0.68 * dim})`; c.fillRect(WX[j], wy, CELL_W, WIN_H); }
      }
      // drum shading: the digits curve away at the top and bottom of each window
      const dg = c.createLinearGradient(0, wy, 0, wy + WIN_H);
      dg.addColorStop(0, 'rgba(3,6,20,0.85)'); dg.addColorStop(0.24, 'rgba(3,6,20,0)'); dg.addColorStop(0.46, 'rgba(255,255,255,0.06)');
      dg.addColorStop(0.76, 'rgba(3,6,20,0)'); dg.addColorStop(1, 'rgba(3,6,20,0.85)');
      c.fillStyle = dg; c.fillRect(0, wy, CHIP_W, WIN_H);
      c.restore();
      c.textBaseline = 'alphabetic'; c.textAlign = 'center';
      c.fillStyle = `rgba(246,243,238,${1 - 0.68 * clamp(1 - wheelU(qNow, 3))})`; c.font = `800 60px ${KR}`;
      c.fillText(',', COMMA_X + 6, CHIP_H / 2 + 34);
      c.fillStyle = UNIT; c.font = `700 40px ${KR}`; c.fillText('m', UNIT_X + 17, CHIP_H / 2 + 22);
      // glint: a light band that only lights the glyphs (masked copy of the final digits, added on top)
      const gp = seg(t, T_LAND + 0.25, 0.8);
      if (gp > 0 && gp < 1) {
        const band = (cx, gx) => {
          const bg = cx.createLinearGradient(gx - 120, 0, gx + 120, 70);
          bg.addColorStop(0, 'rgba(255,255,255,0)'); bg.addColorStop(0.32, 'rgba(255,255,255,0)'); bg.addColorStop(0.45, 'rgba(255,250,225,0.55)');
          bg.addColorStop(0.5, 'rgba(255,255,255,1)'); bg.addColorStop(0.56, 'rgba(255,250,225,0.6)'); bg.addColorStop(0.7, 'rgba(255,255,255,0)');
          bg.addColorStop(1, 'rgba(255,255,255,0)');
          return bg;
        };
        const gx = lerp(-130, CHIP_W + 130, 0.5 - 0.5 * Math.cos(Math.PI * gp));
        const x = GLINT.getContext('2d');
        x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, CHIP_W, CHIP_H);
        for (let j = 0; j < 4; j++) x.drawImage(STR.mask, 0, stripY(wrap(wheelU(qNow, j), 10)), CELL_W, WIN_H, WX[j], wy, CELL_W, WIN_H);
        x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = `800 60px ${KR}`; x.fillText(',', COMMA_X + 6, CHIP_H / 2 + 34);
        x.font = `700 40px ${KR}`; x.fillText('m', UNIT_X + 17, CHIP_H / 2 + 22);
        x.globalCompositeOperation = 'source-in';
        x.fillStyle = band(x, gx); x.fillRect(0, 0, CHIP_W, CHIP_H);
        c.globalCompositeOperation = 'lighter';
        c.drawImage(GLINT, 0, 0);
        // and a faint sheen on the glass of the chip itself
        c.save(); c.beginPath(); c.roundRect(0, 0, CHIP_W, CHIP_H, CHIP_H / 2); c.clip();
        c.globalAlpha = 0.16; c.fillStyle = band(c, gx); c.fillRect(0, 0, CHIP_W, CHIP_H); c.restore();
        c.globalCompositeOperation = 'source-over';
      }
      c.restore();
      // kicker over the chip
      c.globalAlpha = cp;
      pill(c, CHIP_X + 30 + hx * 0.6, cy - 46, 84, 40, 'rgba(14,20,50,0.9)');
      c.fillStyle = '#dfe6f5'; c.font = `700 25px ${KR}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('고도', CHIP_X + 72 + hx * 0.6, cy - 25); c.globalAlpha = 1;
    }
    // ---------------------------------------------------------------- the vertical-speed loupe, wired to the basket dial
    const lpk = seg(t, 0.62, 0.55);
    if (lpk > 0) {
      const sc = 0.3 + 0.7 * E.outBack(lpk, 1.6), la = Math.min(1, lpk * 2.5);
      const ddx = dX + hx, ddy = dY + hy;
      const ang = Math.atan2(ddy - LY, ddx - LX), ex = LX + Math.cos(ang) * LR * sc, ey = LY + Math.sin(ang) * LR * sc;
      c.globalAlpha = la * 0.8; c.strokeStyle = 'rgba(233,237,245,0.9)'; c.lineWidth = 2.5; c.setLineDash([6, 7]);
      c.beginPath(); c.moveTo(ddx, ddy); c.lineTo(ex, ey); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#e9edf5'; c.beginPath(); c.arc(ddx, ddy, 4, 0, TAU); c.fill();
      c.globalAlpha = la;
      c.save(); c.translate(LX, LY); c.scale(sc, sc);
      c.drawImage(LENS.c, -LENS.o, -LENS.o);
      // climb arc from 0 to the needle
      const v = nv + jit;
      if (Math.abs(v) > 0.05) {
        c.lineWidth = 12; c.strokeStyle = v > 0 ? YEL : CORAL;
        c.beginPath(); c.arc(0, 0, GR, Math.min(ANG(0), ANG(v)), Math.max(ANG(0), ANG(v))); c.stroke();
      }
      // ghost needles (where the needle was 35, 70, 105 ms ago), then the needle
      const needle = (a, alpha, tipC) => {
        c.save(); c.rotate(a); c.globalAlpha = la * alpha;
        c.fillStyle = '#f6f3ee';
        c.beginPath(); c.moveTo(-22, -6); c.lineTo(GR - 14, -1.6); c.lineTo(GR - 14, 1.6); c.lineTo(-22, 6); c.closePath(); c.fill();
        if (tipC) { c.fillStyle = YEL; c.fillRect(GR - 40, -2.6, 26, 5.2); }
        c.restore();
      };
      for (const [dt, al] of [[0.105, 0.08], [0.07, 0.14], [0.035, 0.24]]) needle(ANG(needleV(t - dt)), al, false);
      needle(ANG(v), 1, true);
      c.globalAlpha = la;
      c.fillStyle = '#c7ced9'; c.beginPath(); c.arc(0, 0, 13, 0, TAU); c.fill();
      c.fillStyle = '#1a2142'; c.beginPath(); c.arc(0, 0, 5, 0, TAU); c.fill();
      // readout (tabular)
      const rv = Math.round(nv * 10) / 10;
      const rs = (rv > 0 ? '+' : rv < 0 ? '−' : ' ') + Math.abs(rv).toFixed(1);
      c.font = `800 42px ${KR}`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      c.fillStyle = rv < -0.05 ? CORAL : TXT;
      tab(c, rs, -54, 76, 27, 14);
      c.fillStyle = UNIT; c.font = `700 21px ${KR}`; c.fillText('m/s', 0, 104);
      // glass
      c.fillStyle = 'rgba(255,255,255,0.07)';
      c.beginPath(); c.arc(0, 0, LR - 14, Math.PI * 1.05, Math.PI * 1.62); c.arc(-14, -10, LR - 34, Math.PI * 1.6, Math.PI * 1.06, true); c.fill();
      c.restore();
      // label chip under the loupe
      c.font = `700 28px ${KR}`;
      pill(c, LX - 84, LY + LR + 6, 168, 48);
      c.fillStyle = '#dfe6f5'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('상승 속도', LX, LY + LR + 31);
      c.globalAlpha = 1;
    }
    // ---------------------------------------------------------------- fast-forward chip (honest about the time-lapse)
    const ffIn = E.outExpo(seg(t, 1.25, 0.5)), ffOut = E.in2(seg(t, 5.0, 0.3));
    if (ffIn > 0 && ffOut < 1) {
      c.save(); c.globalAlpha = ffIn * (1 - ffOut); c.translate((1 - ffIn) * 60 + ffOut * 40, 0);
      pill(c, 760, 186, 248, 56);
      for (let k = 0; k < 2; k++) {
        c.fillStyle = `rgba(255,200,61,${0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 12 - k * 1.6))})`;
        c.beginPath(); c.moveTo(788 + k * 20, 200); c.lineTo(806 + k * 20, 214); c.lineTo(788 + k * 20, 228); c.fill();
      }
      c.fillStyle = '#dfe6f5'; c.font = `700 28px ${KR}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('빨리 감기', 846, 215);
      c.restore();
    }
    // ---------------------------------------------------------------- words
    if (t < 2.8) {
      const kin = E.outExpo(seg(t, 0.1, 0.5)), kout = E.in2(seg(t, 2.0, 0.3));
      if (kin > 0 && kout < 1) {
        c.save(); c.globalAlpha = kin * (1 - kout); c.translate(0, (1 - kin) * 20 - kout * 50);
        pill(c, 72, 186, TL.kick.xs[TL.kick.text.length] + 48, 56);
        c.fillStyle = '#dfe6f5'; c.font = TL.kick.font; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(TL.kick.text, 96, 215);
        c.restore();
      }
      popLine(c, TL.a, 72, 368, t, 0.25, 2.05, TXT);
      popLine(c, TL.b, 72, 488, t, 0.55, 2.12, TXT, (i) => i < 4);
    }
    if (t > 6.4) {
      popLine(c, TL.c, 72, 300, t, 6.55, null, '#eef2fa', null, 0.03);
      popLine(c, TL.d, 72, 420, t, 6.95, null, TXT, (i) => i >= 7);
    }
    // ---------------------------------------------------------------- sun-break flash, grain, vignette
    const fl = t > 5.4 ? Math.exp(-Math.pow((t - 5.5) / 0.12, 2)) : 0;
    if (fl > 0.01) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,226,180,${0.3 * fl})`; c.fillRect(0, 0, W, H); c.restore(); }
    c.save();
    const gf = Math.floor(t * 12);
    c.translate(-Math.floor(hash(gf) * 256), -Math.floor(hash(gf + 0.5) * 256));
    c.fillStyle = GRAIN; c.fillRect(0, 0, W + 256, H + 256);
    c.restore();
    const vg = c.createRadialGradient(W / 2, H * 0.46, H * 0.32, W / 2, H * 0.46, H * 0.72);
    vg.addColorStop(0, 'rgba(4,8,26,0)'); vg.addColorStop(1, 'rgba(4,8,26,0.42)');
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
  },
});

/** a soft scrim under the harness caption (bottom 19 % of the stage) so the white caption reads on light scenes */
function captionScrim(api, rgb) {
  const el = api.layer('div', { z: 999 });
  el.style.background = `linear-gradient(to bottom, rgba(${rgb},0) 81%, rgba(${rgb},.34) 89%, rgba(${rgb},.58) 100%)`;
  el.style.pointerEvents = 'none';
}
