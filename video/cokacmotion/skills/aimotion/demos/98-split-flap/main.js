/*
 * 98 · 집으로 가는 막차 — a split-flap (Solari) board as a pure function of t (10 s, 1080×1920).
 *
 * A night station board: seven departures clatter in row by row and hold; then the board flips back to blank,
 * top to bottom — except the middle row, which keeps turning until it reads 막차 · 23:58 · 집으로 · 1.
 * Its last syllable winds down flap by flap and lands with a bounce (the climax, 5.85 s). The clock catches up
 * to 23:58 and the last train's headlight sweeps across the glass.
 *
 * Mechanics: every cell is a drum of flaps (Hangul: blank + the 35 syllables this board needs, in 가나다 order;
 * digits: blank + 0–9). In setup each move "show X from time a" becomes the list of single flips the drum has to
 * make (start/end of each, with a hashed rate, a hashed start delay and hashed stutters). frame(t) binary-searches
 * that list: a flap rests, or one is falling with phase p, or the last one is still bouncing.
 * One flip: the upper half of the current flap falls over the hinge (θ 0 → π, gravity-like), drawn as perspective
 * strips (each strip widened by d / (d − z)) that darken as they turn away; past 90° its back shows the next
 * character's lower half and lands over the old lower half. Glyph cells are pre-rendered once into atlases;
 * per frame only halves and strips are blitted.
 * Light: the board is painted as albedo and multiplied by a baked light map (cool ambient + warm overhead bar lamp);
 * emissive things (lamp, indicator lamps, glow, glass reflections, dust) are added after the multiply.
 */
import { defineDemo, clamp, lerp, rand, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const W = 1080, H = 1920, D = 10, PI = Math.PI, TAU = 2 * PI, M = 48;
const PF = `"${FONTS.pretendard.family}"`, HF = `"${FONTS.doHyeon.family}"`, NF = `"${FONTS.bebasNeue.family}"`;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const bell = (t, a, b) => Math.sin(PI * seg(t, a, b));

// ------------------------------------------------------------------ story timing (seconds)
const T = {
  fill: 0.25,      // departures clatter in (row ripple top → bottom, cell ripple left → right)
  board: 2.35,     // full board, readable; row 1 is boarding (lamp blinks)
  out: 3.25,       // everything flips back to blank, top → bottom
  spot: 4.45,      // the overhead light narrows onto the middle row while it keeps turning
  land: 5.85,      // the last syllable lands (climax)
  clock: 6.5,      // the clock flips 23:57 → 23:58
  sweepA: 6.85, sweepB: 7.95,   // the last train's headlight sweeps across the glass
  fade: 8.4,       // the overhead lamp dims; the message row keeps its light
};
const PERIOD = 1 / 30;     // one flap every 33 ms (± 7 % per cell)
const STUTTER = 0.06;      // chance that the drum hesitates before a flap

// ------------------------------------------------------------------ what the board says (no real places)
const ROWS = [
  ['급행', '2304', '달빛항', '2'],
  ['완행', '2312', '별무리', '5'],
  ['심야', '2319', '바다끝', '3'],
  ['완행', '2326', '은하수', '4'],
  ['급행', '2333', '첫눈역', '1'],
  ['심야', '2341', '구름섬', '6'],
  ['급행', '2349', '새벽숲', '3'],
];
const MSG_ROW = 3, MSG = ['막차', '2358', '집으로', '1'];
// landing time of each message cell (columns: type ×2, time ×4, destination ×4, platform); null = stays blank
const MSG_LAND = [5.02, 5.10, 5.17, 5.23, 5.29, 5.35, 5.43, 5.51, T.land, null, 5.60];
const WIND_DOWN = [1.5, 2.2, 3.4, 5.2, 7.4];   // the last flaps of the last cell slow down (period ×)
const FILLER = '가나사자';
const SYL = [...new Set([...ROWS.map((r) => r[0] + r[2]).join(''), ...(MSG[0] + MSG[2]), ...FILLER])].sort();
const HDRUM = [' ', ...SYL];                   // 36 flaps
const DDRUM = [' ', ...'0123456789'];          // 11 flaps

// ------------------------------------------------------------------ layout (stage px)
const HW = 80, DW = 56, CH = 112, IG = 5, GG = 24, COLON = 18, PITCH = 128;
const ROW_TOKENS = ['h', 'h', '|', 'd', 'd', ':', 'd', 'd', '|', 'h', 'h', 'h', 'h', '|', 'd'];
const BX0 = 44, BX1 = 1036, BY0 = 290, BY1 = BY0 + 1126;      // board frame
const IX0 = 58, IX1 = 1022, IY0 = BY0 + 14, IY1 = BY1 - 14;   // glass / inner panel
const RY0 = BY0 + 208;                                        // top of row 0
const rowY = (r) => RY0 + r * PITCH;
const MSG_CY = rowY(MSG_ROW) + CH / 2;
const LAMP_X = 79;
const CLOCK_K = 0.72;

/** x positions of a token row: cells [{ kind, x, w }] + colon centres, total width */
function layoutRow(tokens) {
  let x = 0;
  const cells = [], colons = [];
  for (const k of tokens) {
    if (k === 'h' || k === 'd') { const w = k === 'h' ? HW : DW; cells.push({ kind: k, x, w }); x += w + IG; }
    else if (k === ':') { x -= IG; colons.push(x + COLON / 2); x += COLON; }
    else if (k === '|') x += GG - IG;
  }
  return { cells, colons, width: x - IG };
}
const ROWL = layoutRow(ROW_TOKENS);
const X0 = Math.round((W - ROWL.width) / 2);
const CLOCKL = layoutRow(['d', 'd', ':', 'd', 'd']);
const CLOCK_X = X0 + ROWL.width - CLOCKL.width * CLOCK_K, CLOCK_Y = BY0 + 34;

let HEADLESS = false, g;
const ATLAS = {}, BMP = {};
let CELLS = [], CLOCK = [], MSGCELLS = [], MOTES = [];

// ------------------------------------------------------------------ small kit
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  return { c, g: c.getContext('2d', HEADLESS ? { willReadFrequently: true } : undefined) };
}
const lin = (q, x0, y0, x1, y1, st) => { const r = q.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of st) r.addColorStop(o, c); return r; };
const radg = (q, x, y, r0, r1, st) => { const r = q.createRadialGradient(x, y, r0, x, y, r1); for (const [o, c] of st) r.addColorStop(o, c); return r; };
function glowSprite(rgb, mid = 0.35, size = 128) {
  const { c, g: q } = mk(size, size), h = size / 2;
  q.fillStyle = radg(q, h, h, 0, h, [[0, `rgba(${rgb},1)`], [mid, `rgba(${rgb},.3)`], [1, `rgba(${rgb},0)`]]);
  q.fillRect(0, 0, size, size);
  return c;
}

// ------------------------------------------------------------------ glyph atlases (one pre-rendered card per flap)
function buildAtlas(name, drum, w, font, cols) {
  const pad = 16, rows = Math.ceil(drum.length / cols), aw = cols * (w + pad) + pad, ah = rows * (CH + pad) + pad;
  const { c, g: q } = mk(aw, ah);
  const gl = mk(aw, ah), bl = mk(aw, ah);       // same layout: the bare glyphs, and their bloom (for the lit row)
  // shared baseline: centre the union of all glyph boxes on the hinge, so every glyph sits the same way
  q.font = font;
  let asc = 0, desc = 0;
  for (const ch of drum) if (ch !== ' ') { const m = q.measureText(ch); asc = Math.max(asc, m.actualBoundingBoxAscent); desc = Math.max(desc, m.actualBoundingBoxDescent); }
  const base = CH / 2 + (asc - desc) / 2;
  const pos = [];
  gl.g.font = font; gl.g.textAlign = 'center'; gl.g.textBaseline = 'alphabetic'; gl.g.fillStyle = '#fff0d8';
  drum.forEach((ch, i) => {
    const ox = pad + (i % cols) * (w + pad), oy = pad + Math.floor(i / cols) * (CH + pad);
    pos.push([ox, oy]);
    paintCard(q, ox, oy, w, ch, font, base);
    if (ch !== ' ') gl.g.fillText(ch, ox + w / 2, oy + base);
  });
  gl.g.globalCompositeOperation = 'destination-out';                                    // the split cuts the glyph here too
  for (const [ox, oy] of pos) gl.g.fillRect(ox - 2, oy + CH / 2 - 1.5, w + 4, 3);
  gl.g.globalCompositeOperation = 'source-over';
  bl.g.filter = 'blur(7px)';
  bl.g.drawImage(gl.c, 0, 0);
  bl.g.filter = 'none';
  bl.g.globalCompositeOperation = 'source-in';
  bl.g.fillStyle = '#ffb45e'; bl.g.fillRect(0, 0, aw, ah);
  ATLAS[name] = { img: c, glyph: gl.c, bloom: bl.c, pos, w };
}
function paintCard(q, ox, oy, w, ch, font, base) {
  const h = CH, ha = h / 2, r = 7;
  q.save();
  q.translate(ox, oy);
  q.beginPath(); q.roundRect(0, 0, w, ha, [r, r, 0, 0]);
  q.fillStyle = lin(q, 0, 0, 0, ha, [[0, '#303035'], [1, '#232327']]); q.fill();
  q.beginPath(); q.roundRect(0, ha, w, ha, [0, 0, r, r]);
  q.fillStyle = lin(q, 0, ha, 0, h, [[0, '#1b1b1f'], [1, '#29292e']]); q.fill();
  q.globalCompositeOperation = 'source-atop';
  if (ch !== ' ') {
    q.font = font; q.textAlign = 'center'; q.textBaseline = 'alphabetic';
    q.fillStyle = lin(q, 0, 8, 0, h - 8, [[0, '#f7f1e4'], [0.5, '#efe8da'], [1, '#ddd5c5']]);
    q.fillText(ch, w / 2, base);
  }
  q.fillStyle = 'rgba(0,0,0,.13)'; q.fillRect(0, ha, w, ha);                                  // the lower flap leans back
  q.fillStyle = lin(q, 0, ha, 0, ha + 14, [[0, 'rgba(0,0,0,.5)'], [1, 'rgba(0,0,0,0)']]);  // the upper flap overhangs it
  q.fillRect(0, ha, w, 14);
  q.fillStyle = lin(q, 0, 0, w * 0.9, ha, [[0, 'rgba(255,255,255,.07)'], [0.55, 'rgba(255,255,255,0)']]);   // plastic gloss
  q.fillRect(0, 0, w, ha);
  q.fillStyle = 'rgba(255,244,228,.2)'; q.fillRect(r * 0.6, 0, w - 1.2 * r, 1.2);            // top edge catches the lamp
  q.globalCompositeOperation = 'source-over';
  q.fillStyle = '#050506'; q.fillRect(0, ha - 1.5, w, 3);                                     // the split
  q.fillStyle = 'rgba(255,250,240,.13)'; q.fillRect(1, ha + 1.5, w - 2, 1);                   // glossy lip of the lower flap
  q.globalCompositeOperation = 'destination-out';                                             // hinge notches
  q.beginPath(); q.arc(0, ha, 3.5, 0, TAU); q.arc(w, ha, 3.5, 0, TAU); q.fill();
  q.restore();
}

// ------------------------------------------------------------------ flip schedules (baked in setup)
/** moves: [{ at, target, stutter, wind, amp }] in time order → per-flip arrays; returns the time the drum stops */
function schedule(c, moves, r) {
  const N = c.drum.length, t0 = [], t1 = [], from = [], to = [], amp = [];
  let cur = 0, free = -1e9;
  for (const m of moves) {
    const n = (m.target - cur + N) % N;
    if (!n) continue;
    let t = Math.max(m.at, free);
    for (let k = 0; k < n; k++) {
      let p = PERIOD * c.rate;
      const wk = m.wind ? m.wind[k - (n - m.wind.length)] : undefined;
      if (wk) p *= wk;
      if (m.stutter && k > 0 && r() < STUTTER) t += PERIOD * (0.8 + 1.8 * r());   // the drum hesitates
      t0.push(t); t1.push(t + p); from.push(cur);
      cur = (cur + 1) % N;
      to.push(cur); amp.push(k === n - 1 ? (m.amp ?? 0.42) : 0);
      t += p;
    }
    free = t + 0.05;
  }
  c.F = { t0: Float64Array.from(t0), t1: Float64Array.from(t1), from: Int16Array.from(from), to: Int16Array.from(to), amp: Float32Array.from(amp) };
  return t1.length ? t1[t1.length - 1] : 0;
}
/** total time of n flips at a cell's rate, with an optional wind-down on the last ones */
function runTime(c, n, wind) {
  let s = 0;
  for (let k = 0; k < n; k++) s += PERIOD * c.rate * ((wind && wind[k - (n - wind.length)]) || 1);
  return s;
}
const flapAngle = (p) => PI * (0.22 * p + 0.78 * p * p);   // released at the top, falls faster and faster
/** the cell at time t: { idx } at rest, or { from, to, th } while a flap is falling or bouncing */
function cellState(c, t) {
  const F = c.F, n = F.t0.length;
  let lo = 0, hi = n;                       // last flip with t0 <= t
  while (lo < hi) { const mid = (lo + hi) >> 1; if (F.t0[mid] <= t) lo = mid + 1; else hi = mid; }
  const i = lo - 1;
  if (i < 0) return { idx: 0 };
  if (t < F.t1[i]) return { from: F.from[i], to: F.to[i], th: flapAngle((t - F.t0[i]) / (F.t1[i] - F.t0[i])) };
  const a = F.amp[i], tau = t - F.t1[i];
  if (a > 0 && tau < 0.32) {                // the landed flap bounces off the stack
    const d = a * Math.exp(-tau / 0.065) * Math.abs(Math.sin(PI * tau / 0.085));
    if (d > 0.004) return { from: F.from[i], to: F.to[i], th: PI - d };
  }
  return { idx: F.to[i] };
}

// ------------------------------------------------------------------ drawing one cell (local coords: cell top-left = 0,0)
const PD = CH * 3.5;        // eye distance for the falling flap's perspective
/** img: the card atlas, or (bare = true) the same layout with bare glyphs / bloom — then no shading is drawn */
function drawCell(q, c, st, img = c.atlas.img, bare = false) {
  const A = c.atlas, w = A.w, h = CH, ha = h / 2;
  if (st.idx !== undefined) { const [sx, sy] = A.pos[st.idx]; q.drawImage(img, sx, sy, w, h, 0, 0, w, h); return; }
  const [ax, ay] = A.pos[st.from], [bx, by] = A.pos[st.to];
  const th = st.th, cs = Math.cos(th), sn = Math.sin(th), cx = w / 2;
  const f = (v) => PD / (PD - v * ha * sn);
  const Y = (v) => ha - v * ha * cs * f(v);
  const ytip = Y(1), ftip = f(1);
  // behind the falling flap: the next character's upper half is revealed, the old lower half still lies below.
  // Only the parts the flap does not cover are drawn (the bare-glyph passes have no opaque card to hide them).
  if (cs > 0) {
    if (ytip > 0.5) q.drawImage(img, bx, by, w, ytip, 0, 0, w, ytip);
    q.drawImage(img, ax, ay + ha, w, ha, 0, ha, w, ha);
  } else {
    q.drawImage(img, bx, by, w, ha, 0, 0, w, ha);
    if (h - ytip > 0.5) q.drawImage(img, ax, ay + ytip, w, h - ytip, 0, ytip, w, h - ytip);
  }
  // gap shadows: the falling flap shades the revealed upper half near the hinge, then the lower half below its tip
  if (!bare) {
    if (cs > 0) { q.globalAlpha = 0.62 * cs; q.drawImage(BMP.shadeUp, 0, 0, w, ha); }
    const sb = cs > 0 ? 0.3 * sn : 0.55 * sn;
    if (sb > 0.01) { const y0 = Math.max(ha, ytip); q.globalAlpha = sb; q.drawImage(BMP.shadeDown, 0, y0, w, Math.max(1, h - y0)); }
    q.globalAlpha = 1;
  }
  // the flap itself: perspective strips (front = old upper half, back = new lower half)
  const S = c.slow ? 12 : 7, ga = q.globalAlpha;
  if (bare) q.globalAlpha = ga * (1 - 0.6 * sn);
  for (let i = 0; i < S; i++) {
    const v0 = i / S, v1 = (i + 1) / S, y0 = Y(v0), y1 = Y(v1);
    const top = Math.min(y0, y1), hh = Math.abs(y1 - y0);
    if (hh < 0.2) continue;
    const dw = w * f((v0 + v1) / 2), dx = cx - dw / 2;
    const o = bare ? 0 : 0.3;     // opaque strips overlap a hair to hide seams; added (bare) strips must not double up
    if (cs > 0) q.drawImage(img, ax, ay + ha - v1 * ha, w, ha / S, dx, top - o, dw, hh + 2 * o);
    else q.drawImage(img, bx, by + ha + v0 * ha, w, ha / S, dx, top - o, dw, hh + 2 * o);
  }
  q.globalAlpha = ga;
  if (bare) return;
  // turning away from the lamp darkens the flap; its back brightens again as it lands
  const shade = cs > 0 ? 0.7 * sn : 0.5 * sn * sn;
  q.beginPath();
  q.moveTo(0, ha); q.lineTo(w, ha); q.lineTo(cx + (w / 2) * ftip, ytip); q.lineTo(cx - (w / 2) * ftip, ytip); q.closePath();
  q.fillStyle = `rgba(4,4,6,${shade.toFixed(3)})`; q.fill();
  // the flap's edge catches the light when it is nearly edge-on
  const e = Math.pow(sn, 6);
  if (e > 0.02) {
    q.fillStyle = `rgba(226,218,204,${(0.75 * e).toFixed(3)})`;
    q.fillRect(cx - (w / 2) * ftip, ytip - 1, w * ftip, 2);
  }
}
/** axle pins left and right of the split (they never move) */
function drawPins(q, w) {
  q.fillStyle = '#3e3c3a';
  q.fillRect(-2, CH / 2 - 2, 3, 4); q.fillRect(w - 1, CH / 2 - 2, 3, 4);
}

// ------------------------------------------------------------------ the light (cool ambient + warm bar lamp)
const LAMP = { x0: 200, x1: 880, y: 150 };
function lampTerm(x, y) {
  const dy = y - (LAMP.y + 12);
  const hx = Math.abs(x - 540);
  if (dy < 0) return 0.3 * Math.exp(dy / 46) * (1 - sm((hx - 300) / 160));
  const spread = 330 + 0.42 * dy;
  const wx = 1 - sm((hx - spread + 150) / 380);
  return wx / (1 + (dy / 980) ** 2);
}
const AMB = [0.19, 0.22, 0.3], LAMPC = [1.0, 0.86, 0.68];

// ------------------------------------------------------------------ static bitmaps
function bakeWall() {
  const { c, g: q } = mk(W + 2 * M, H + 2 * M);
  q.translate(M, M);
  q.fillStyle = lin(q, 0, 0, 0, H, [[0, '#0f141d'], [0.45, '#18202c'], [1, '#0b0e14']]);
  q.fillRect(-M, -M, W + 2 * M, H + 2 * M);
  const r = rand(9801);
  // concrete mottling + speckle
  for (let i = 0; i < 70; i++) {
    const x = r() * W, y = r() * H, rr = 80 + r() * 260;
    q.fillStyle = radg(q, x, y, 0, rr, [[0, `rgba(${r() < 0.5 ? '255,255,255' : '0,0,0'},${(0.018 + 0.02 * r()).toFixed(3)})`], [1, 'rgba(0,0,0,0)']]);
    q.fillRect(x - rr, y - rr, 2 * rr, 2 * rr);
  }
  for (let i = 0; i < 9000; i++) {
    q.fillStyle = r() < 0.5 ? `rgba(255,255,255,${(0.02 + 0.03 * r()).toFixed(3)})` : `rgba(0,0,0,${(0.05 + 0.05 * r()).toFixed(3)})`;
    q.fillRect(-M + r() * (W + 2 * M), -M + r() * (H + 2 * M), 1 + r() * 1.5, 1 + r() * 1.5);
  }
  // wall panels: vertical seams + a rail below the board
  for (const x of [0, 270, 810, 1080]) {
    q.fillStyle = 'rgba(0,0,0,.35)'; q.fillRect(x - 1.5, 0, 3, H);
    q.fillStyle = 'rgba(255,255,255,.035)'; q.fillRect(x + 1.5, 0, 1, H);
  }
  q.fillStyle = 'rgba(0,0,0,.4)'; q.fillRect(-M, 1574, W + 2 * M, 30);
  q.fillStyle = lin(q, 0, 1560, 0, 1576, [[0, 'rgba(255,255,255,0)'], [1, 'rgba(255,240,220,.09)']]); q.fillRect(-M, 1560, W + 2 * M, 16);
  // ceiling beam
  q.fillStyle = lin(q, 0, -M, 0, 70, [[0, '#07090d'], [1, '#0d1118']]); q.fillRect(-M, -M, W + 2 * M, 70 + M);
  q.fillStyle = 'rgba(255,226,190,.08)'; q.fillRect(-M, 69, W + 2 * M, 2);
  // the board's shadow on the wall
  q.save();
  q.filter = 'blur(26px)';
  q.fillStyle = 'rgba(0,0,0,.75)';
  q.beginPath(); q.roundRect(BX0 + 6, BY0 + 30, BX1 - BX0 - 12, BY1 - BY0, 30); q.fill();
  q.restore();
  // bar lamp: cables + housing (its glowing underside is drawn live)
  q.fillStyle = '#2a2c31';
  for (const x of [LAMP.x0 + 70, LAMP.x1 - 70]) q.fillRect(x - 1.5, -M, 3, LAMP.y - 6 + M);
  q.beginPath(); q.roundRect(LAMP.x0, LAMP.y - 12, LAMP.x1 - LAMP.x0, 24, 12);
  q.fillStyle = lin(q, 0, LAMP.y - 12, 0, LAMP.y + 12, [[0, '#33353b'], [0.5, '#1d1f24'], [1, '#141519']]); q.fill();
  q.fillStyle = 'rgba(255,255,255,.12)'; q.fillRect(LAMP.x0 + 12, LAMP.y - 11, LAMP.x1 - LAMP.x0 - 24, 1.5);
  BMP.wall = c;
}

function bakeBoard() {
  const { c, g: q } = mk(W, H);
  // frame
  q.beginPath(); q.roundRect(BX0, BY0, BX1 - BX0, BY1 - BY0, 20);
  q.fillStyle = lin(q, 0, BY0, 0, BY1, [[0, '#24252a'], [0.08, '#1a1b1f'], [1, '#131418']]); q.fill();
  q.save(); q.clip();
  q.fillStyle = lin(q, 0, BY0, 0, BY0 + 8, [[0, 'rgba(255,232,200,.45)'], [1, 'rgba(255,232,200,0)']]); q.fillRect(BX0, BY0, BX1 - BX0, 8);
  q.fillStyle = 'rgba(0,0,0,.5)'; q.fillRect(BX0, BY1 - 4, BX1 - BX0, 4);
  q.restore();
  // bolts
  for (const [x, y] of [[BX0 + 14, BY0 + 14], [BX1 - 14, BY0 + 14], [BX0 + 14, BY1 - 14], [BX1 - 14, BY1 - 14]]) {
    q.fillStyle = radg(q, x - 1.5, y - 1.5, 0, 6, [[0, '#8a8680'], [1, '#2b2a2a']]);
    q.beginPath(); q.arc(x, y, 4.5, 0, TAU); q.fill();
  }
  // inner panel (behind the glass)
  q.beginPath(); q.roundRect(IX0, IY0, IX1 - IX0, IY1 - IY0, 10);
  q.fillStyle = lin(q, 0, IY0, 0, IY1, [[0, '#0e0f12'], [1, '#09090b']]); q.fill();
  q.save(); q.clip();
  q.fillStyle = lin(q, 0, IY0, 0, IY0 + 30, [[0, 'rgba(0,0,0,.6)'], [1, 'rgba(0,0,0,0)']]); q.fillRect(IX0, IY0, IX1 - IX0, 30);
  q.restore();
  // header: title, subtitle, clock label
  q.textBaseline = 'alphabetic';
  q.fillStyle = '#efe7d8';
  q.font = `800 70px ${PF}`; q.letterSpacing = '-2px';
  q.fillText('출발', X0 - 2, BY0 + 104);
  const tw = q.measureText('출발').width;
  q.letterSpacing = '0px';
  q.font = `600 26px ${PF}`; q.fillStyle = 'rgba(239,231,216,.5)';
  q.fillText('밤 열차 안내', X0 + tw + 18, BY0 + 102);
  q.font = `600 22px ${PF}`; q.textAlign = 'right';
  q.fillText('지금', CLOCK_X - 16, CLOCK_Y + 50);
  q.textAlign = 'left';
  // clock slots + colon
  slots(q, CLOCK_X, CLOCK_Y, CLOCKL, CLOCK_K);
  // divider + column labels
  q.fillStyle = 'rgba(255,255,255,.07)'; q.fillRect(IX0 + 16, BY0 + 148, IX1 - IX0 - 32, 1.5);
  q.fillStyle = 'rgba(0,0,0,.5)'; q.fillRect(IX0 + 16, BY0 + 146, IX1 - IX0 - 32, 1.5);
  const C = ROWL.cells, mid = (a, b) => X0 + (C[a].x + C[b].x + C[b].w) / 2;
  q.font = `600 23px ${PF}`; q.fillStyle = 'rgba(239,231,216,.55)'; q.textAlign = 'center'; q.letterSpacing = '1px';
  q.fillText('열차', mid(0, 1), BY0 + 188);
  q.fillText('시각', mid(2, 5), BY0 + 188);
  q.fillText('행선지', mid(6, 9), BY0 + 188);
  q.fillText('타는 곳', mid(10, 10), BY0 + 188);
  q.letterSpacing = '0px'; q.textAlign = 'left';
  // rows: rails, slots, indicator lamps (off)
  for (let r = 0; r < ROWS.length; r++) {
    const y = rowY(r);
    if (r) { q.fillStyle = 'rgba(0,0,0,.6)'; q.fillRect(IX0 + 10, y - 9, IX1 - IX0 - 20, 2); q.fillStyle = 'rgba(255,255,255,.04)'; q.fillRect(IX0 + 10, y - 7, IX1 - IX0 - 20, 1); }
    slots(q, X0, y, ROWL, 1);
    q.fillStyle = '#1c130d'; q.beginPath(); q.arc(LAMP_X, y + CH / 2, 7.5, 0, TAU); q.fill();
    q.fillStyle = 'rgba(255,220,180,.18)'; q.beginPath(); q.arc(LAMP_X - 2, y + CH / 2 - 2.5, 2.2, 0, TAU); q.fill();
  }
  BMP.board = c;
}
/** dark recesses behind a row of cells + the printed colon */
function slots(q, x0, y0, L, k) {
  for (const s of L.cells) {
    q.fillStyle = '#040405';
    q.beginPath(); q.roundRect(x0 + (s.x - 3) * k, y0 - 3 * k, (s.w + 6) * k, (CH + 6) * k, 9 * k); q.fill();
    q.fillStyle = 'rgba(255,255,255,.05)'; q.fillRect(x0 + (s.x + 4) * k, y0 + (CH + 3) * k, (s.w - 8) * k, 1);
  }
  q.fillStyle = '#d8d0c0';
  for (const cxp of L.colons) for (const dy of [-19, 19]) {
    q.beginPath(); q.roundRect(x0 + (cxp - 4) * k, y0 + (CH / 2 + dy - 4) * k, 8 * k, 8 * k, 2 * k); q.fill();
  }
}

/** quarter-resolution light maps: LIGHT (multiply) and LAMPSHARE (alpha = the lamp's share of the light) + haze */
function bakeLight() {
  const S = 4, w = Math.ceil((W + 2 * M) / S), h = Math.ceil((H + 2 * M) / S);
  const L = mk(w, h), Sh = mk(w, h), Hz = mk(w, h);
  const il = L.g.createImageData(w, h), is = Sh.g.createImageData(w, h), ih = Hz.g.createImageData(w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const x = i * S + S / 2 - M, y = j * S + S / 2 - M, o = (j * w + i) * 4;
    const lt = lampTerm(x, y);
    const amb = 1 + 0.25 * (1 - seg(y, 0, 1500));
    let lum = 0, lamp = 0;
    for (let k = 0; k < 3; k++) {
      const a = AMB[k] * amb, b = LAMPC[k] * lt * 1.02;
      il.data[o + k] = Math.round(255 * Math.min(1, a + b));
      lum += a + b; lamp += b;
    }
    il.data[o + 3] = 255;
    is.data[o + 3] = Math.round(255 * (lum > 0 ? lamp / lum : 0));
    // light hanging in the air between the lamp and the board (screen)
    const dy = y - LAMP.y;
    const hz = dy > 0 ? 0.16 * lampTerm(x, y) * Math.exp(-dy / 420) : 0;
    ih.data[o] = 255; ih.data[o + 1] = 205; ih.data[o + 2] = 150; ih.data[o + 3] = Math.round(255 * hz);
  }
  L.g.putImageData(il, 0, 0); Sh.g.putImageData(is, 0, 0); Hz.g.putImageData(ih, 0, 0);
  BMP.light = L.c; BMP.lampShare = Sh.c; BMP.haze = Hz.c; BMP.lightS = S;
}

function bakeGlass() {
  const { c, g: q } = mk(W, H);
  q.save();
  q.beginPath(); q.roundRect(IX0, IY0, IX1 - IX0, IY1 - IY0, 10); q.clip();
  // broad diagonal sheen bands
  const band = (x, wd, a) => {
    q.save(); q.translate(x, (IY0 + IY1) / 2); q.rotate(0.42);
    q.fillStyle = lin(q, -wd / 2, 0, wd / 2, 0, [[0, 'rgba(200,215,240,0)'], [0.5, `rgba(200,215,240,${a})`], [1, 'rgba(200,215,240,0)']]);
    q.fillRect(-wd / 2, -1400, wd, 2800);
    q.restore();
  };
  band(250, 340, 0.06); band(470, 90, 0.07); band(840, 220, 0.04);
  // the lamp mirrored in the top of the glass
  q.fillStyle = radg(q, 540, IY0 + 34, 0, 360, [[0, 'rgba(255,214,160,.28)'], [0.4, 'rgba(255,214,160,.08)'], [1, 'rgba(255,214,160,0)']]);
  q.save(); q.translate(540, IY0 + 34); q.scale(1, 0.12); q.translate(-540, -(IY0 + 34)); q.fillRect(IX0, IY0 - 400, IX1 - IX0, 800); q.restore();
  q.fillStyle = lin(q, 0, IY0, 0, IY0 + 220, [[0, 'rgba(255,230,200,.07)'], [1, 'rgba(255,230,200,0)']]); q.fillRect(IX0, IY0, IX1 - IX0, 220);
  q.fillStyle = lin(q, 0, IY1 - 160, 0, IY1, [[0, 'rgba(150,180,220,0)'], [1, 'rgba(150,180,220,.05)']]); q.fillRect(IX0, IY1 - 160, IX1 - IX0, 160);
  q.restore();
  // glass edge
  q.strokeStyle = 'rgba(255,240,220,.10)'; q.lineWidth = 1.5;
  q.beginPath(); q.roundRect(IX0 + 0.75, IY0 + 0.75, IX1 - IX0 - 1.5, IY1 - IY0 - 1.5, 10); q.stroke();
  BMP.glass = c;
}

function bakeSprites() {
  BMP.glowWarm = glowSprite('255,190,110', 0.3);
  BMP.glowHot = glowSprite('255,236,200', 0.25);
  BMP.dust = glowSprite('255,226,190', 0.4, 32);
  // vertical shade ramps for the gap shadows
  const up = mk(4, 64), dn = mk(4, 64);
  up.g.fillStyle = lin(up.g, 0, 0, 0, 64, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]); up.g.fillRect(0, 0, 4, 64);
  dn.g.fillStyle = lin(dn.g, 0, 0, 0, 64, [[0, 'rgba(0,0,0,1)'], [0.6, 'rgba(0,0,0,.25)'], [1, 'rgba(0,0,0,0)']]); dn.g.fillRect(0, 0, 4, 64);
  BMP.shadeUp = up.c; BMP.shadeDown = dn.c;
  // headlight sweep: a soft band with a hot core
  const sw = mk(640, 8);
  sw.g.fillStyle = lin(sw.g, 0, 0, 640, 0, [[0, 'rgba(210,228,255,0)'], [0.32, 'rgba(210,228,255,.18)'], [0.47, 'rgba(235,244,255,.7)'],
    [0.5, 'rgba(255,255,255,1)'], [0.53, 'rgba(235,244,255,.7)'], [0.6, 'rgba(210,228,255,.2)'], [0.72, 'rgba(210,228,255,.06)'], [1, 'rgba(210,228,255,0)']]);
  sw.g.fillRect(0, 0, 640, 8);
  BMP.sweep = sw.c;
  // the lamp's glowing underside + bloom
  const lg = mk(W, 420);
  const q = lg.g;
  q.fillStyle = radg(q, 540, LAMP.y + 10, 0, 520, [[0, 'rgba(255,200,130,.35)'], [0.5, 'rgba(255,180,110,.1)'], [1, 'rgba(255,170,100,0)']]);
  q.save(); q.translate(540, LAMP.y + 10); q.scale(1, 0.3); q.translate(-540, -(LAMP.y + 10)); q.fillRect(0, 0, W, 420); q.restore();
  q.beginPath(); q.roundRect(LAMP.x0 + 10, LAMP.y + 4, LAMP.x1 - LAMP.x0 - 20, 7, 3.5);
  q.fillStyle = lin(q, LAMP.x0, 0, LAMP.x1, 0, [[0, '#ffd59a'], [0.5, '#fff3dc'], [1, '#ffd59a']]); q.fill();
  BMP.lampGlow = lg.c;
  // vignette (screen space)
  const vg = mk(W, H);
  vg.g.fillStyle = radg(vg.g, 540, 880, 420, 1320, [[0, 'rgba(0,0,0,0)'], [0.6, 'rgba(0,0,0,.28)'], [1, 'rgba(0,0,0,.72)']]);
  vg.g.fillRect(0, 0, W, H);
  BMP.vig = vg.c;
  const ul = mk(W, H);
  ul.g.fillStyle = radg(ul.g, 760, 1980, 0, 820, [[0, 'rgba(96,136,188,.34)'], [0.45, 'rgba(70,104,150,.14)'], [1, 'rgba(60,90,130,0)']]);
  ul.g.fillRect(0, 0, W, H);
  BMP.uplight = ul.c;
}

/** someone waiting under the board, seen from behind (foreground, out of focus) */
function bakeFigure() {
  const ox = 480, oy = 1340;          // canvas origin in stage coords
  const silhouette = (q) => {
    q.beginPath();
    q.moveTo(560, 1990);
    q.bezierCurveTo(560, 1790, 600, 1700, 700, 1668);       // left shoulder
    q.bezierCurveTo(745, 1652, 780, 1640, 802, 1606);       // to the neck
    q.lineTo(806, 1572);
    q.bezierCurveTo(770, 1556, 752, 1520, 754, 1480);       // back of the head (left)
    q.bezierCurveTo(756, 1418, 802, 1384, 852, 1384);
    q.bezierCurveTo(904, 1384, 948, 1420, 950, 1480);
    q.bezierCurveTo(952, 1522, 934, 1556, 900, 1572);       // (right)
    q.lineTo(904, 1606);
    q.bezierCurveTo(930, 1640, 980, 1654, 1030, 1672);      // right shoulder
    q.bezierCurveTo(1120, 1704, 1160, 1790, 1170, 1990);
    q.closePath();
  };
  // sharp: warm rim colour inside the shape, then the shape again 7 px lower in near-black — a rim stays only where
  // the lamp grazes the top of the head and the shoulders. Then the whole figure is drawn out of focus.
  const sh = mk(720, 640), p = sh.g;
  p.translate(-ox, -oy);
  silhouette(p); p.clip();
  p.fillStyle = 'rgba(255,190,125,.42)'; p.fillRect(ox, oy, 720, 640);
  p.translate(0, 6); silhouette(p); p.fillStyle = '#06080c'; p.fill();
  const { c, g: q } = mk(720, 640);
  q.filter = 'blur(5px)';
  q.drawImage(sh.c, 0, 0);
  q.filter = 'none';
  BMP.figure = c; BMP.figureAt = [ox, oy];
}

// ------------------------------------------------------------------ the story as functions of t
/** overhead lamp: flickers on, dims while the board empties, settles when the row lands */
function lampLevel(t) {
  const fl = [[0, 0], [0.07, 0], [0.09, 0.55], [0.13, 0.08], [0.19, 0.72], [0.235, 0.3], [0.33, 1]];
  let L = 1;
  if (t < 0.33) for (let i = 1; i < fl.length; i++) if (t <= fl[i][0]) { const [a, va] = fl[i - 1], [b, vb] = fl[i]; L = lerp(va, vb, sm((t - a) / (b - a) * 3)); break; }
  L *= 1 - 0.3 * sm(seg(t, T.spot - 0.2, T.land - 0.3)) + 0.12 * sm(seg(t, T.land, T.land + 0.6));
  L *= 1 - 0.42 * sm(seg(t, T.fade, D - 0.1));    // the station winds down: only the lit row stays
  return L;
}
/** the light gathered on the message row */
function spotLevel(t) {
  if (t < T.land) return 0.42 * sm(seg(t, T.spot, T.land - 0.15));
  const k = t - T.land;
  return lerp(0.42, 1, ease.outExpo(clamp(k / 0.14))) - 0.2 * sm(seg(t, T.land + 0.15, T.land + 1.2)) + 0.04 * Math.sin(TAU * Math.max(0, t - T.land - 1.2) / 2.4);
}
function camera(t) {
  const k = t - T.land;
  const punch = k > 0 ? 0.013 * Math.exp(-k / 0.09) : 0;
  const s = 1 + 0.02 * sm(t / 6) + 0.075 * ease.inOutCubic(seg(t, T.land + 0.1, D)) + punch;
  const fk = sm(seg(t, T.spot, 8.5));
  const fx = 540, fy = lerp((BY0 + BY1) / 2, MSG_CY, fk);
  const shake = k > 0 ? 2.4 * Math.exp(-k / 0.06) * Math.sin(k * 95) : 0;
  const dx = 1.3 * Math.sin(0.7 * t + 1) + 0.6 * Math.sin(1.9 * t);
  const dy = 1.1 * Math.sin(0.9 * t + 2) + 0.5 * Math.sin(2.3 * t + 0.5) + shake;
  return { s, fx, fy, dx, dy };
}

defineDemo({
  id: '98-split-flap',
  title: '집으로 가는 막차',
  tech: '플랩 전광판 · 반쪽 판이 넘어가는 기계식 글자',
  duration: D,
  background: '#07090d',

  async setup(api) {
    HEADLESS = api.headless;
    await fontReady(`400 86px ${HF}`, HDRUM.join(''));
    await fontReady(`400 104px ${NF}`, '0123456789');
    await fontReady(`800 70px ${PF}`, '출발밤열차안내지금시각행선지타는곳');
    g = api.canvas({ type: '2d', attrs: HEADLESS ? { willReadFrequently: true } : undefined }).ctx;

    buildAtlas('h', HDRUM, HW, `400 86px ${HF}`, 12);
    buildAtlas('d', DDRUM, DW, `400 104px ${NF}`, 11);
    bakeWall(); bakeBoard(); bakeLight(); bakeGlass(); bakeSprites(); bakeFigure();

    // cells + their flip schedules
    const idxOf = (kind, ch) => (kind === 'h' ? HDRUM : DDRUM).indexOf(ch);
    const rowChars = (row) => { const s = [...row[0], ...row[1], ...(row[2] + '    ').slice(0, 4), ...row[3]]; return s.length === 11 ? s : null; };
    CELLS = []; MSGCELLS = [];
    ROWS.forEach((row, r) => {
      const chars = rowChars(row);
      ROWL.cells.forEach((s, col) => {
        const id = r * 11 + col, rr = rand(4100 + id * 7919);
        const c = { kind: s.kind, x: X0 + s.x, y: rowY(r), k: 1, row: r, col, atlas: ATLAS[s.kind], drum: s.kind === 'h' ? HDRUM : DDRUM, rate: 0.93 + 0.14 * rr() };
        const moves = [
          { at: T.fill + 0.085 * r + 0.03 * col + 0.05 * rr(), target: idxOf(s.kind, chars[col]), stutter: true },
          { at: T.out + 0.06 * r + 0.022 * col + 0.03 * rr(), target: 0, stutter: true },
        ];
        if (r === MSG_ROW && MSG_LAND[col] != null) {
          const mch = [...MSG[0], ...MSG[1], ...(MSG[2] + '    ').slice(0, 4), ...MSG[3]][col];
          c.rate = 1;
          const target = idxOf(s.kind, mch), wind = col === 8 ? WIND_DOWN : null;
          moves.push({ at: MSG_LAND[col] - runTime(c, target, wind), target, wind, amp: col === 8 ? 0.95 : 0.5 });
          c.slow = !!wind;
        }
        c.end = schedule(c, moves, rr);
        CELLS.push(c);
        if (r === MSG_ROW) MSGCELLS.push(c);
      });
    });
    // the clock: 23:57 during the first clatter, 23:58 after the last train lands
    CLOCK = CLOCKL.cells.map((s, i) => {
      const rr = rand(733 + i * 31);
      const c = { kind: 'd', x: CLOCK_X + s.x * CLOCK_K, y: CLOCK_Y, k: CLOCK_K, atlas: ATLAS.d, drum: DDRUM, rate: 0.95 + 0.1 * rr() };
      const moves = [{ at: 0.55 + 0.05 * i + 0.03 * rr(), target: idxOf('d', '2357'[i]), stutter: true }];
      if (i === 3) moves.push({ at: T.clock, target: idxOf('d', '8'), amp: 0.7 });
      schedule(c, moves, rr);
      return c;
    });
    // dust in the lamp light
    const rd = rand(2207);
    MOTES = Array.from({ length: 80 }, () => ({ x: 170 + 740 * rd(), y: 170 + 1000 * rd(), r: 1.2 + 3.2 * rd() ** 2, ph: TAU * rd(), sp: 0.4 + rd(), up: 4 + 10 * rd() }));
    // warm every offscreen bitmap through the compositor once (first-composite AA must not differ later)
    for (const t of [0.2, 1.2, 4.0, 5.9, 7.3]) this.frame(t);
  },

  frame(t) {
    const q = g;
    q.setTransform(1, 0, 0, 1, 0, 0);
    q.globalAlpha = 1; q.globalCompositeOperation = 'source-over'; q.filter = 'none';
    q.lineCap = 'butt'; q.lineJoin = 'miter'; q.setLineDash([]); q.imageSmoothingEnabled = true; q.imageSmoothingQuality = 'low';
    q.fillStyle = '#07090d'; q.fillRect(0, 0, W, H);

    const cam = camera(t), s = cam.s;
    const X = (x) => (x - cam.fx) * s + cam.fx + cam.dx, Yc = (y) => (y - cam.fy) * s + cam.fy + cam.dy;
    const world = () => q.setTransform(s, 0, 0, s, X(0), Yc(0));
    const at = (c) => q.setTransform(s * c.k, 0, 0, s * c.k, X(c.x), Yc(c.y));
    const L = lampLevel(t), SP = spotLevel(t);

    // albedo: wall, board, cells
    world();
    q.drawImage(BMP.wall, -M, -M);
    q.drawImage(BMP.board, 0, 0);
    const states = new Array(CELLS.length);
    for (let i = 0; i < CELLS.length; i++) { const c = CELLS[i]; at(c); states[i] = cellState(c, t); drawCell(q, c, states[i]); drawPins(q, c.atlas.w); }
    for (const c of CLOCK) { at(c); drawCell(q, c, cellState(c, t)); drawPins(q, c.atlas.w); }

    // light: multiply by the baked map, then take back the lamp's share while it is dim
    world();
    q.globalCompositeOperation = 'multiply';
    q.drawImage(BMP.light, -M, -M, W + 2 * M, H + 2 * M);
    q.globalCompositeOperation = 'source-over';
    if (L < 0.999) { q.globalAlpha = 1 - L; q.drawImage(BMP.lampShare, -M, -M, W + 2 * M, H + 2 * M); q.globalAlpha = 1; }

    // the message row gathers more light
    if (SP > 0.004) {
      // a warm pool on the row (screen), then its letters light up: bare glyphs + their bloom, added
      world();
      q.globalCompositeOperation = 'screen';
      q.globalAlpha = Math.min(1, 0.3 * SP);
      q.drawImage(BMP.glowWarm, 20, MSG_CY - 230, 1040, 460);
      q.globalCompositeOperation = 'lighter';
      for (const c of MSGCELLS) {
        const st = cellState(c, t);
        at(c);
        q.globalAlpha = 0.34 * SP; drawCell(q, c, st, c.atlas.glyph, true);
        q.globalAlpha = 0.75 * SP; drawCell(q, c, st, c.atlas.bloom, true);
      }
      // the landing flash (≤ 0.35)
      const k = t - T.land;
      if (k > 0 && k < 0.6) {
        world();
        q.globalCompositeOperation = 'screen';
        q.globalAlpha = 0.34 * Math.exp(-k / 0.11);
        q.drawImage(BMP.glowHot, X0 + ROWL.cells[8].x + HW / 2 - 150, MSG_CY - 110, 300, 220);
        q.drawImage(BMP.glowWarm, 40, MSG_CY - 70, 1000, 140);
      }
      q.globalAlpha = 1;
      q.globalCompositeOperation = 'source-over';
    }

    // indicator lamps: row 1 boards (blinks), the message row lights up when it lands
    world();
    q.globalCompositeOperation = 'screen';
    const lamps = [];
    if (t > T.board - 0.1 && t < T.out + 0.15) lamps.push([0, (0.5 - 0.5 * Math.cos(TAU * 2.2 * (t - T.board + 0.1))) * (1 - seg(t, T.out, T.out + 0.15))]);
    if (t > T.land) lamps.push([MSG_ROW, Math.min(1, (t - T.land) / 0.05) * (0.85 + 0.15 * Math.cos(TAU * (t - T.land) / 1.6))]);
    for (const [r, a] of lamps) {
      if (a < 0.01) continue;
      const y = rowY(r) + CH / 2;
      q.globalAlpha = 0.75 * a; q.drawImage(BMP.glowWarm, LAMP_X - 40, y - 40, 80, 80);
      q.globalAlpha = a; q.fillStyle = '#ffd08a'; q.beginPath(); q.arc(LAMP_X, y, 6.5, 0, TAU); q.fill();
      q.globalAlpha = 0.9 * a; q.drawImage(BMP.glowHot, LAMP_X - 9, y - 9, 18, 18);
    }
    q.globalAlpha = 1;

    // air: light haze under the lamp, the lamp itself, dust
    q.globalCompositeOperation = 'screen';
    q.globalAlpha = L;
    q.drawImage(BMP.haze, -M, -M, W + 2 * M, H + 2 * M);
    q.drawImage(BMP.lampGlow, 0, 0);
    for (const m of MOTES) {
      const y = m.y - m.up * t + 7 * Math.sin(0.5 * m.sp * t + m.ph);
      const x = m.x + 16 * Math.sin(0.33 * m.sp * t + 2 * m.ph);
      const a = lampTerm(x, y) * L * (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(1.4 * m.sp * t + 3 * m.ph))) * (1 - seg(y, 1000, 1250));
      if (a < 0.03) continue;
      q.globalAlpha = Math.min(1, a);
      q.drawImage(BMP.dust, x - m.r * 2.5, y - m.r * 2.5, m.r * 5, m.r * 5);
    }
    q.globalAlpha = 1;

    // glass: static reflections, then the headlight passing over it
    q.globalAlpha = 0.55 + 0.45 * L;
    q.drawImage(BMP.glass, 0, 0);
    q.globalAlpha = 1;
    const sw = seg(t, T.sweepA, T.sweepB);
    if (sw > 0 && sw < 1) {
      q.save();
      q.beginPath(); q.roundRect(IX0, IY0, IX1 - IX0, IY1 - IY0, 10); q.clip();
      const px = lerp(-420, 1500, ease.inOutCubic(sw));
      q.globalAlpha = 0.5 * Math.pow(Math.sin(PI * sw), 0.7);
      q.translate(px, (IY0 + IY1) / 2); q.rotate(0.36);
      q.drawImage(BMP.sweep, -320, -1500, 640, 3000);
      q.globalAlpha = 0.22 * Math.sin(PI * sw);
      q.drawImage(BMP.sweep, -900, -1500, 300, 3000);
      q.restore();
    }
    q.globalCompositeOperation = 'source-over';

    // cool light spilling up from the platform below (so the figure reads against it)
    q.globalCompositeOperation = 'screen';
    q.setTransform(1, 0, 0, 1, 0, 0);
    q.drawImage(BMP.uplight, 0, 0);
    q.globalCompositeOperation = 'source-over';

    // foreground figure (parallax 1.5×), vignette
    const sp = 1 + (s - 1) * 1.5, [fx0, fy0] = BMP.figureAt;
    q.setTransform(sp, 0, 0, sp, (fx0 - cam.fx) * sp + cam.fx + cam.dx * 1.6 + 6 * Math.sin(0.4 * t), (fy0 - cam.fy) * sp + cam.fy + cam.dy * 1.6);
    q.drawImage(BMP.figure, 0, 0);
    q.setTransform(1, 0, 0, 1, 0, 0);
    q.drawImage(BMP.vig, 0, 0);
  },
});
