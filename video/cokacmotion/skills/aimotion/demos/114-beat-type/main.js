/*
 * 114 · 하나 둘 셋 넷 — lyric typography on a beat grid.
 *
 * One score table (score.js: 120 bpm, 4/4, kick · snare · hats · toms · crash, nine words) drives everything:
 *   word      lands on its hit; anticipation (crop marks closing in) starts half a beat before, settle lasts one beat
 *   kick      scale pulse of the newest word
 *   snare     on a bar line → hard cut to the next composition; on beat 3 → colour inversion (an iris from the word)
 *   hat       a tick on the counter boxes and on the ruler below
 *   push      the one off-beat hit (bar 2, the "and" of 4): 다시 arrives half a beat early, no warning, with a shake;
 *             the downbeat it stole stays empty
 *   final     the poster becomes the score itself and replays it from the top (D.C. = 처음부터)
 * Compositions: centred stack → split left/right → one big word → rotated column → the score.
 *
 * One Canvas 2D, every value a closed-form function of t read from the score (no audio analysis).
 * Sound (synth.js) is the same score rendered with OfflineAudioContext in setup and played through onTransport.
 */
import { defineDemo, clamp, lerp, rand, W, H } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';
import { BEAT, T0, D, at, pos, events, WORDS, PATTERN, TOMS } from './score.js';
import { renderSound } from './synth.js';

// ---------------------------------------------------------------- palette, type, geometry
const C = { paper: '#efe6d3', ink: '#15130f', red: '#e2402a', desk: '#0c0b0a' };
const PF = `"${FONTS.pretendard.family}"`;
const MF = `"${FONTS.jetbrainsMono.family}"`;
const PH = 1450;                                  // poster height; below it the console (counter, ruler) and the caption
const GX0 = 64, GX1 = 1016, GCW = (GX1 - GX0) / 4; // beat columns of the poster grid
const GY0 = 196, GY1 = 1404, GRH = (GY1 - GY0) / 4;
const PIV = [540, 800];                           // camera pivot
const RX0 = 64, RX1 = 1016, RW = RX1 - RX0, CELL = RW / 32;   // console ruler: 4 bars × 8 eighths
const SX0 = 172, SX1 = 1016, SCW = (SX1 - SX0) / 4, SY0 = 338, SRH = 246;   // the final score poster
const SWEEP0 = 8.5, SWEEPD = BEAT;                // the replay: all 16 beats in one beat
const DC = at(5, 2);                              // 9.0 s: back to the top

const ez = (s) => gsap.parseEase(s);
const BACK = ez('back.out(1.7)'), BACK2 = ez('back.out(2.4)'), EXPO = ez('expo.out'), P2IN = ez('power2.in'), P3O = ez('power3.out');
const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const PI = Math.PI;

// ---------------------------------------------------------------- the score, as times
const EV = events();
const KICKS = EV.filter((e) => e.inst === 'K').map((e) => e.t);
const CUTS = EV.filter((e) => e.inst === 'S' && e.role === 'cut').map((e) => e.t);   // 2.5 4.25 6.5 8.5
const INVS = EV.filter((e) => e.inst === 'S' && e.role === 'inv').map((e) => e.t);   // 1.5 3.5 5.5 7.5
const CRASHES = EV.filter((e) => e.inst === 'C').map((e) => e.t);
const TOMT = EV.filter((e) => e.inst === 'T').map((e) => e.t);
const WT = WORDS.map((w) => at(w.bar, w.beat));
const PUSH = WT[4];
const LS = [0, ...CUTS], LE = [...CUTS, D];      // layout i is on screen in [LS[i], LE[i])
const LWORDS = [[0, 1], [2, 3], [4], [5, 6, 7, 8], []];
const layoutAt = (t) => { let i = 0; while (i < CUTS.length && t >= CUTS[i]) i++; return i; };
const BAR_EV = EV.filter((e) => e.bar >= 1 && e.bar <= 4);

let G, HEADLESS = false;
const WG = [];             // per word: { L, cx, cy, rot }
const T = {};              // small text layouts

// ---------------------------------------------------------------- helpers
function resetCtx(g) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.lineCap = 'butt'; g.lineJoin = 'miter'; g.lineWidth = 1; g.setLineDash([]);
  g.fillStyle = '#000'; g.strokeStyle = '#000'; g.filter = 'none';
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
}
/** per-syllable layout with tracking (em fraction) — Hangul is set syllable by syllable so tracking is exact */
function lay(text, size, weight = 900, track = -0.03, fam = PF) {
  const font = `${weight} ${size}px ${fam}`;
  G.font = font;
  const tr = track * size, chars = [];
  let x = 0;
  for (const ch of text) { const w = G.measureText(ch).width; chars.push({ ch, x, w }); x += w + tr; }
  const m = G.measureText(text);
  return { font, size, chars, w: x - tr, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent };
}
function drawLay(g, L, x, y, color, align = 'left') {
  g.font = L.font; g.fillStyle = color;
  const x0 = align === 'right' ? x - L.w : align === 'center' ? x - L.w / 2 : x;
  for (const c of L.chars) g.fillText(c.ch, x0 + c.x, y);
}
/** word centred on (cx, cy) by its ink box */
function drawWord(g, L, cx, cy, s, color, rot = 0) {
  if (s <= 0) return;
  g.save();
  g.translate(cx, cy); if (rot) g.rotate(rot); g.scale(s, s);
  drawLay(g, L, -L.w / 2, (L.asc - L.desc) / 2, color);
  g.restore();
}
const boxOf = (L, cx, cy, s = 1) => { const w = L.w * s, h = (L.asc + L.desc) * s; return { x: cx - w / 2, y: cy - h / 2, w, h }; };
function mono(g, text, x, y, size, color, align = 'left', weight = 700) {
  g.font = `${weight} ${size}px ${MF}`; g.fillStyle = color; g.textAlign = align; g.fillText(text, x, y); g.textAlign = 'left';
}
function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
}
function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r);
}
/** print crop marks around a box, d px outside it */
function crop(g, b, d, arm, color, a, lw = 5) {
  if (a <= 0.003) return;
  g.globalAlpha = a; g.strokeStyle = color; g.lineWidth = lw;
  const x0 = b.x - d, y0 = b.y - d, x1 = b.x + b.w + d, y1 = b.y + b.h + d;
  g.beginPath();
  g.moveTo(x0, y0 + arm); g.lineTo(x0, y0); g.lineTo(x0 + arm, y0);
  g.moveTo(x1 - arm, y0); g.lineTo(x1, y0); g.lineTo(x1, y0 + arm);
  g.moveTo(x1, y1 - arm); g.lineTo(x1, y1); g.lineTo(x1 - arm, y1);
  g.moveTo(x0 + arm, y1); g.lineTo(x0, y1); g.lineTo(x0, y1 - arm);
  g.stroke(); g.globalAlpha = 1;
}
/** halftone dots, size from f(x, y) ∈ 0..1 */
function halftone(g, x0, y0, x1, y1, step, rmax, f, color, a) {
  g.globalAlpha = a; g.fillStyle = color; g.beginPath();
  let row = 0;
  for (let y = y0; y <= y1; y += step, row++) {
    for (let x = x0 + (row & 1 ? step / 2 : 0); x <= x1; x += step) {
      const r = rmax * f(x, y);
      if (r < 0.7) continue;
      g.moveTo(x + r, y); g.arc(x, y, r, 0, 2 * PI);
    }
  }
  g.fill(); g.globalAlpha = 1;
}
function quarterNote(g, x, y, s, color) {   // ♩ drawn (the mono font has no music glyphs)
  g.fillStyle = color;
  g.save(); g.translate(x, y); g.rotate(-0.38); g.beginPath(); g.ellipse(0, 0, 9 * s, 6.4 * s, 0, 0, 2 * PI); g.fill(); g.restore();
  g.fillRect(x + 7.2 * s, y - 30 * s, 2.4 * s, 29 * s);
}

// ---------------------------------------------------------------- timing laws (all in beats)
/** scale of word i at t: 0 before its hit; 1.2 → 1 with back.out over one beat; + a pulse on every later kick while it is the newest */
function wordScale(i, t, big = 1.2) {
  const th = WT[i];
  if (t < th) return 0;
  let s = lerp(big, 1, BACK(clamp((t - th) / BEAT)));
  const lw = LWORDS.find((l) => l.includes(i));
  const nxt = lw[lw.indexOf(i) + 1];
  const until = nxt === undefined ? Infinity : WT[nxt];
  for (const k of KICKS) if (k > th + 1e-3 && k <= t && k < until) s += 0.075 * Math.exp(-(t - k) / (0.22 * BEAT));
  return s;
}
/** anticipation: crop marks close in on the slot over the half beat before the hit, hold, then fade */
function antic(g, i, t, b, color) {
  if (WORDS[i].synco) return;                      // the push comes without warning
  const th = WT[i], a0 = th - 0.5 * BEAT;
  if (t < a0 || t > th + 2 * BEAT) return;
  let d, a;
  if (t < th) { const k = P2IN((t - a0) / (0.5 * BEAT)); d = lerp(150, 22, k); a = 0.25 + 0.75 * k; }
  else { d = 22 + 10 * EXPO(clamp((t - th) / (0.25 * BEAT))); a = 1 - sm((t - th - 0.5 * BEAT) / (1.5 * BEAT)); }
  crop(g, b, d, 46, color, a);
}
/** camera: slow push-in through each composition, punch on crashes, decaying shake on the push */
function camera(t, li) {
  let s = 1 + 0.016 * clamp((t - LS[li]) / (LE[li] - LS[li]));
  for (const c of CRASHES) if (t >= c) s += 0.045 * Math.exp(-(t - c) / (0.3 * BEAT));
  let dx = 0, dy = 0, rot = 0;
  const u = t - PUSH;
  if (u >= 0 && u < 2.5 * BEAT) {
    const e = Math.exp(-u / (0.3 * BEAT));
    dx = 30 * e * Math.sin(2 * PI * 12 * u); dy = 14 * e * Math.sin(2 * PI * 9 * u + 1.3); rot = 0.016 * e * Math.sin(2 * PI * 7 * u + 0.4);
  }
  return { s, dx, dy, rot };
}
function applyCam(g, cam) {
  g.translate(PIV[0] + cam.dx, PIV[1] + cam.dy); g.rotate(cam.rot); g.scale(cam.s, cam.s); g.translate(-PIV[0], -PIV[1]);
}
/** score time shown by the console: the real time, except during the final replay (4 bars in 0.8 s) */
function scoreTime(t) {
  if (t < SWEEP0) return t;
  return T0 + 8 * clamp((t - SWEEP0) / SWEEPD);
}
/** real time at which a score time is revealed by the replay */
const replayAt = (te) => SWEEP0 + (te - T0) / 8 * SWEEPD;
const inv = (P) => ({ bg: P.fg, fg: P.bg, acc: P.acc });

// ---------------------------------------------------------------- poster chrome: header, crop marks, beat grid
function chrome(g, P, t, li, rows = false) {
  // header
  drawLay(g, T.head, GX0, 112, rgba(P.fg, 0.86));
  quarterNote(g, GX1 - 232, 108, 1, rgba(P.fg, 0.86));
  mono(g, '=120  4/4', GX1, 112, 28, rgba(P.fg, 0.86), 'right', 600);
  g.fillStyle = rgba(P.fg, 0.86); g.fillRect(GX0, 134, GX1 - GX0, 3);
  // corner registration marks
  g.strokeStyle = rgba(P.fg, 0.5); g.lineWidth = 2; g.beginPath();
  for (const [x, y, sx, sy] of [[34, 34, 1, 1], [1046, 34, -1, 1], [34, PH - 34, 1, -1], [1046, PH - 34, -1, -1]]) {
    g.moveTo(x, y + 26 * sy); g.lineTo(x, y); g.lineTo(x + 26 * sx, y);
  }
  g.stroke();
  if (li === 4) return;                          // the score sheet draws its own grid
  // the beat grid: columns (or rows for the rotated composition), the current beat lit
  const p = pos(scoreTime(t));
  const cur = t >= T0 && li < 4 ? Math.floor(p.beat - 1) : -1;
  g.fillStyle = rgba(P.fg, 0.13);
  for (let i = 0; i <= 4; i++) {
    if (rows) g.fillRect(GX0, GY0 + i * GRH - 1, GX1 - GX0, 2);
    else g.fillRect(GX0 + i * GCW - 1, GY0 - 18, 2, GY1 - GY0 + 18);
  }
  if (cur >= 0) {
    g.fillStyle = rgba(P.fg, 0.05);
    if (rows) g.fillRect(GX0, GY0 + cur * GRH, GX1 - GX0, GRH);
    else g.fillRect(GX0 + cur * GCW, GY0 - 18, GCW, GY1 - GY0 + 18);
  }
  for (let i = 0; i < 4; i++) {
    const on = i === cur;
    if (rows) mono(g, String(i + 1), GX1 - 8, GY0 + i * GRH + 40, 26, rgba(P.fg, on ? 0.95 : 0.34), 'right');
    else mono(g, String(i + 1), GX0 + i * GCW + 12, GY0 + 8, 26, rgba(P.fg, on ? 0.95 : 0.34));
    if (on) {
      g.fillStyle = P.acc;
      if (rows) g.fillRect(GX1 - 40, GY0 + i * GRH + 50, 32, 6);
      else g.fillRect(GX0 + i * GCW + 12, GY0 + 18, 32, 6);
    }
  }
}
function bigNumeral(g, ch, x, y, size, P, a = 0.15) {
  g.font = `900 ${size}px ${PF}`; g.strokeStyle = rgba(P.fg, a); g.lineWidth = 3; g.lineJoin = 'round';
  g.textAlign = 'right'; g.strokeText(ch, x, y); g.textAlign = 'left'; g.lineJoin = 'miter';
}
function tag(g, text, x, y, color, a = 1) {
  if (a <= 0) return;
  g.globalAlpha = a; mono(g, text, x, y, 26, color); g.globalAlpha = 1;
}

// ---------------------------------------------------------------- the five compositions
// each draws the whole poster (background included) with palette P; the inversion draws it again with inv(P) inside an iris

function stack(g, t, P) {                         // bar 1 · centred stack
  g.fillStyle = P.bg; g.fillRect(0, 0, W, PH);
  bigNumeral(g, '1', 1080 + 40, PH + 120, 1500, P);
  halftone(g, 40, 1180, 560, 1420, 22, 9, (x, y) => clamp((y - 1180) / 240) * clamp(1 - x / 560) * 1.2, P.acc, 0.9);
  chrome(g, P, t, 0);
  g.save(); applyCam(g, camera(t, 0));
  const [a, b] = [WG[0], WG[1]];
  // rules: wipe out from the centre on the first hit (one beat), then the second rule on the snare
  const r1 = P3O(clamp((t - WT[0]) / BEAT)), r2 = P3O(clamp((t - WT[1]) / BEAT));
  g.fillStyle = P.fg;
  if (r1 > 0) g.fillRect(540 - 476 * r1, 770, 952 * r1, 10);
  if (r2 > 0) g.fillRect(540 - 476 * r2, 1380, 952 * r2, 4);
  const sa = wordScale(0, t), sb = wordScale(1, t);
  antic(g, 0, t, boxOf(a.L, a.cx, a.cy, Math.max(1, sa)), P.acc);
  antic(g, 1, t, boxOf(b.L, b.cx, b.cy, Math.max(1, sb)), P.acc);
  drawWord(g, a.L, a.cx, a.cy, sa, P.fg);
  drawWord(g, b.L, b.cx, b.cy, sb, P.acc);
  const ba = boxOf(a.L, a.cx, a.cy), bb = boxOf(b.L, b.cx, b.cy);
  tag(g, '01.1', ba.x, ba.y - 30, P.fg, sa > 0 ? 1 : 0);
  tag(g, '01.3', bb.x + bb.w + 18, bb.y + 26, P.fg, sb > 0 ? 1 : 0);
  g.restore();
}

function split(g, t, P) {                         // bar 2 · split left / right: beats 1–2 | beats 3–4
  const L = P, R = inv(P);
  for (const [Q, x0] of [[L, 0], [R, 540]]) {
    g.save(); g.beginPath(); g.rect(x0, 0, 540, PH); g.clip();
    g.fillStyle = Q.bg; g.fillRect(x0, 0, 540, PH);
    if (x0 === 0) bigNumeral(g, '2', 600, PH + 150, 1450, Q);
    else halftone(g, 560, 180, 1060, 560, 22, 9, (x, y) => clamp((x - 560) / 500) * clamp(1 - (y - 180) / 380) * 1.15, Q.acc, 0.95);
    chrome(g, Q, t, 1);
    g.save(); applyCam(g, camera(t, 1));
    const i = x0 === 0 ? 2 : 3, w = WG[i], s = wordScale(i, t);
    antic(g, i, t, boxOf(w.L, w.cx, w.cy, Math.max(1, s)), Q.acc);
    drawWord(g, w.L, w.cx, w.cy, s, i === 3 ? Q.acc : Q.fg);
    const b = boxOf(w.L, w.cx, w.cy);
    tag(g, i === 2 ? '02.1' : '02.3', i === 2 ? b.x : b.x + b.w - 74, i === 2 ? b.y + b.h + 64 : b.y - 30, Q.fg, s > 0 ? 1 : 0);
    g.restore();
    g.restore();
  }
  g.fillStyle = rgba(P.fg, 0.5); g.fillRect(539, 150, 2, GY1 - 150);
}

function repeatSign(g, x, y, h, color, pulse) {   // ‖: drawn — the score's own word for "again"
  g.fillStyle = color;
  g.fillRect(x, y, 30, h); g.fillRect(x + 46, y, 9, h);
  const r = 15 * (1 + 0.35 * pulse);
  g.beginPath(); g.arc(x + 86, y + h * 0.36, r, 0, 2 * PI); g.moveTo(x + 86 + r, y + h * 0.64); g.arc(x + 86, y + h * 0.64, r, 0, 2 * PI); g.fill();
}

function bigWord(g, t, P) {                       // the push · one big word, half a beat early
  g.fillStyle = P.bg; g.fillRect(0, 0, W, PH);
  bigNumeral(g, '3', 1080 + 30, PH + 140, 1450, P, 0.17);
  halftone(g, 40, 1060, 1060, 1430, 24, 10, (x, y) => clamp((y - 1060) / 370) * (0.55 + 0.45 * Math.sin(x / 170)), P.fg, 0.16);
  chrome(g, P, t, 2);
  g.save(); applyCam(g, camera(t, 2));
  const w = WG[4], s = wordScale(4, t, 1.32);
  const rot = (-8 + 5 * BACK(clamp((t - PUSH) / BEAT))) * PI / 180;
  drawWord(g, w.L, w.cx, w.cy, s, P.fg, rot);
  // kicks in bar 3 also knock the repeat sign's dots
  let kp = 0;
  for (const k of KICKS) if (k > PUSH + 1e-3 && k <= t) kp += Math.exp(-(t - k) / (0.25 * BEAT));
  repeatSign(g, 96, 1110, 230, P.fg, kp);
  drawLay(g, T.again, 222, 1246, P.fg);
  mono(g, '02.4& → 03.1', 222, 1300, 26, rgba(P.fg, 0.8), 'left', 600);
  // the sticker: one sixteenth after the hit
  const k = clamp((t - PUSH - 0.25 * BEAT) / (0.5 * BEAT));
  if (k > 0) {
    const ks = BACK2(k);
    g.save(); g.translate(812, 1150); g.rotate(7 * PI / 180); g.scale(ks, ks);
    g.fillStyle = P.fg; rr(g, -150, -78, 300, 156, 22); g.fill();
    drawLay(g, T.off, 0, 14, P.bg, 'center');
    mono(g, '02.4&', 0, 56, 26, P.acc, 'center', 700);
    g.restore();
  }
  g.restore();
}

function column(g, t, P) {                        // bar 4 · rotated column, one syllable per beat (rows = beats)
  g.fillStyle = P.bg; g.fillRect(0, 0, W, PH);
  bigNumeral(g, '4', 1080 + 50, PH + 130, 1400, P, 0.15);
  halftone(g, 600, 900, 1060, 1430, 22, 9, (x, y) => clamp((x - 600) / 460) * clamp((y - 900) / 530) * 1.2, P.acc, 0.95);
  chrome(g, P, t, 3, true);
  // the setlist: the chant so far, this bar lit
  for (let r = 0; r < 4; r++) {
    const y = 300 + r * 74;
    mono(g, `0${r + 1}`, 640, y, 24, r === 3 ? P.acc : rgba(P.fg, 0.4), 'left', 700);
    drawLay(g, T.set[r], 700, y + 2, rgba(P.fg, r === 3 ? 0.95 : 0.4));
  }
  g.save(); applyCam(g, camera(t, 3));
  // the fill: each tom knocks the next syllable down the column; the last half beat pulls the column back (anticipation)
  const pull = 1 - 0.06 * P2IN(clamp((t - (CUTS[3] - 0.5 * BEAT)) / (0.5 * BEAT)));
  for (let j = 0; j < 4; j++) {
    const i = 5 + j, w = WG[i];
    let s = wordScale(i, t, 1.2) * pull, dx = 0;
    TOMT.forEach((tt, n) => { if (n + 1 === j && t >= tt) dx += 34 * Math.exp(-(t - tt) / (0.2 * BEAT)) * Math.sin(Math.min(PI, (t - tt) / (0.25 * BEAT) * PI) + 0.6); });
    const b = boxOf(w.L, w.cx, w.cy, Math.max(1, s));
    antic(g, i, t, { x: w.cx - b.h / 2, y: w.cy - b.w / 2, w: b.h, h: b.w }, P.acc);
    drawWord(g, w.L, w.cx + dx, w.cy, s, j === 3 ? P.acc : P.fg, PI / 2);
    tag(g, `04.${j + 1}`, 520, w.cy + 10, P.fg, s > 0 ? 1 : 0);
  }
  g.restore();
}

function scoreSheet(g, t, P) {                    // the end: the poster is the score, replayed from the top
  g.fillStyle = P.bg; g.fillRect(0, 0, W, PH);
  chrome(g, P, t, 4);
  g.save(); applyCam(g, camera(t, 4));
  const st = scoreTime(t);
  const pop = (te) => { const tr = replayAt(te); return t < tr ? 0 : lerp(1.35, 1, BACK(clamp((t - tr) / 0.22))); };
  // grid
  for (let i = 0; i <= 4; i++) {
    g.fillStyle = rgba(P.fg, i === 0 || i === 4 ? 0.7 : 0.16);
    g.fillRect(SX0 + i * SCW - 1, SY0 - 30, i === 0 || i === 4 ? 3 : 2, 4 * SRH + 30);
    g.fillStyle = rgba(P.fg, 0.7);
    g.fillRect(SX0 - 10, SY0 + i * SRH - 1, SX1 - SX0 + 10, i === 0 || i === 4 ? 3 : 2);
  }
  for (let c = 0; c < 4; c++) mono(g, String(c + 1), SX0 + c * SCW + 12, SY0 - 40, 26, rgba(P.fg, 0.6));
  for (let r = 0; r < 4; r++) mono(g, `0${r + 1}`, 64, SY0 + r * SRH + SRH - 22, 26, rgba(P.fg, 0.6));
  // drums of every bar, small
  for (const e of BAR_EV) {
    const k = pop(e.t);
    if (k <= 0) continue;
    const j = (e.beat - 1) * 2, x = SX0 + j * SCW / 2 + 16, y = SY0 + (e.bar - 1) * SRH + 190;
    g.fillStyle = e.synco ? P.acc : rgba(P.fg, 0.72);
    if (e.inst === 'H') g.fillRect(x - 1.5, y - 6 * k, 3, 12 * k);
    else if (e.inst === 'S') g.fillRect(x - 6 * k, y + 14 - 6 * k, 12 * k, 12 * k);
    else if (e.inst === 'K') { g.beginPath(); g.arc(x, y + 36, 7 * k, 0, 2 * PI); g.fill(); }
    else if (e.inst === 'T') { g.fillStyle = P.acc; g.save(); g.translate(x, y + 20); g.rotate(PI / 4); g.fillRect(-5 * k, -5 * k, 10 * k, 10 * k); g.restore(); }
  }
  // words at their beats; 다시 hangs half a beat outside the bar line it jumped
  WORDS.forEach((w, i) => {
    const k = pop(WT[i]);
    if (k <= 0) return;
    const L = T.score[i], col = (w.synco ? -0.5 : w.beat - 1), row = w.synco ? 2 : w.bar - 1;
    const x = SX0 + col * SCW + 12, y = SY0 + row * SRH + 158;
    g.save(); g.translate(x + L.w / 2, y - 60); g.scale(k, k);
    drawLay(g, L, -L.w / 2, 60, w.synco || i === 8 ? P.acc : P.fg);
    g.restore();
    if (w.synco) tag(g, '02.4&', x, y - 132, P.acc);
  });
  // playhead: sweeps the rows, then jumps back to the top on D.C.
  let px, py;
  if (t < SWEEP0 + SWEEPD) { const q = (st - T0) / 2, r = Math.min(3, Math.floor(q)); px = SX0 + (q - r) * 4 * SCW; py = SY0 + r * SRH; }
  else if (t < DC) { px = SX1; py = SY0 + 3 * SRH; }
  else { px = SX0; py = SY0; }
  g.fillStyle = P.acc; g.fillRect(px - 2.5, py, 5, SRH);
  g.beginPath(); g.moveTo(px - 12, py - 2); g.lineTo(px + 12, py - 2); g.lineTo(px, py + 14); g.fill();
  // D.C. — the return arrow draws itself over half a beat, the label pops on the beat
  const ka = P3O(clamp((t - DC) / (0.5 * BEAT)));
  if (ka > 0) {
    const pts = [[SX1 - 6, SY0 + 3 * SRH + SRH / 2], [SX1 + 26, SY0 + 3 * SRH + SRH / 2], [SX1 + 26, SY0 - 74], [SX0, SY0 - 74], [SX0, SY0 - 10]];
    let len = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); len += l; }
    let left = len * ka;
    g.strokeStyle = P.acc; g.lineWidth = 5; g.lineJoin = 'round'; g.beginPath(); g.moveTo(...pts[0]);
    let end = pts[0];
    for (let i = 1; i < pts.length && left > 0; i++) {
      const f = Math.min(1, left / seg[i - 1]);
      end = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
      g.lineTo(...end); left -= seg[i - 1];
    }
    g.stroke(); g.lineJoin = 'miter';
    if (ka > 0.98) { g.fillStyle = P.acc; g.beginPath(); g.moveTo(SX0 - 14, SY0 - 22); g.lineTo(SX0 + 14, SY0 - 22); g.lineTo(SX0, SY0); g.fill(); }
    const kl = BACK2(clamp((t - DC) / (0.5 * BEAT)));
    g.save(); g.translate(SX0 + 4 * SCW - 4, 1395); g.scale(kl, kl);
    drawLay(g, T.dc, 0, 0, P.acc, 'right');
    g.restore();
  }
  g.restore();
}

const LAYOUTS = [stack, split, bigWord, column, scoreSheet];
const PAL = [
  { bg: C.paper, fg: C.ink, acc: C.red },
  { bg: C.paper, fg: C.ink, acc: C.red },
  { bg: C.red, fg: C.ink, acc: C.paper },
  { bg: C.paper, fg: C.ink, acc: C.red },
  { bg: C.paper, fg: C.ink, acc: C.red },
];
/** where the inversion iris of composition li opens from */
function irisCentre(li) {
  if (li === 0) return [WG[1].cx, WG[1].cy];
  if (li === 1) return [WG[3].cx, WG[3].cy];
  if (li === 2) return [WG[4].cx, WG[4].cy];
  return [WG[7].cx, WG[7].cy];
}

// ---------------------------------------------------------------- the console: counter, hat ticks, the score ruler
function console_(g, t) {
  g.fillStyle = C.desk; g.fillRect(0, PH, W, H - PH);
  g.fillStyle = rgba(C.paper, 0.16); g.fillRect(0, PH, W, 2);
  const st = scoreTime(t);
  const outro = t >= SWEEP0;
  // counter: bar · beat (DAW style), then 8 hat boxes of the current bar
  let bar, beat;
  if (t < T0) { bar = 0; beat = 4; }
  else if (outro && t >= DC) { bar = 1; beat = 1; }
  else { const p = pos(Math.min(st, T0 + 8 - 1e-6)); bar = p.bar; beat = Math.floor(p.beat); }
  const beatT = t < T0 ? 0 : outro ? (t >= DC ? DC : SWEEP0) : t >= PUSH && t < at(3, 1) ? PUSH : at(bar, beat);
  const roll = t < T0 ? 1 : EXPO(clamp((t - beatT) / (0.2 * BEAT)));
  quarterNote(g, RX0 + 10, 1500, 0.9, rgba(C.paper, 0.6));
  mono(g, '=120  4/4', RX0 + 30, 1503, 26, rgba(C.paper, 0.6), 'left', 600);
  const synco = t >= PUSH && t < at(3, 1);
  drawLay(g, T.ma, 560, 1503, rgba(C.paper, 0.5));
  mono(g, String(bar).padStart(2, '0'), 620, 1504, 40, C.paper);
  drawLay(g, T.bak, 700, 1503, rgba(C.paper, 0.5));
  // odometer: the old beat rolls up and out while the new one rolls in from below
  const prev = t >= PUSH && t < PUSH + 0.5 * BEAT ? '4' : t >= at(3, 1) && t < at(3, 1) + 0.5 * BEAT ? '4&' : String(beat === 1 ? 4 : beat - 1);
  g.save(); g.beginPath(); g.rect(740, 1462, 110, 54); g.clip();
  if (roll < 1) mono(g, prev, 742, 1504 - 46 * roll, 40, prev.includes('&') ? C.red : C.paper);
  mono(g, String(beat) + (synco ? '&' : ''), 742, 1504 + 46 * (1 - roll), 40, synco ? C.red : C.paper);
  g.restore();
  // hat boxes: eighths of the current bar; a hat ticks its box, the toms fill red
  for (let j = 0; j < 8; j++) {
    const x = RX1 - (8 - j) * 22 + 6, y = 1480;
    const te = at(bar, 1 + j / 2);
    const row = PATTERN[bar];
    const hasHat = row ? row.H[j] === 'x' : bar === 0 && j >= 6;
    const tom = bar === 4 && TOMS.some(([, b]) => Math.floor((b - 1) * 2) === j);
    const done = !outro && t >= te;
    g.strokeStyle = rgba(C.paper, 0.35); g.lineWidth = 2; g.strokeRect(x + 1, y + 1, 14, 14);
    if (done && (hasHat || tom)) {
      const k = 1 + 0.5 * Math.exp(-(t - te) / 0.06);
      g.fillStyle = tom ? C.red : C.paper;
      g.fillRect(x + 8 - 6 * k, y + 8 - 6 * k, 12 * k, 12 * k);
    }
  }
  // ruler
  const reveal = RX0 + RW * EXPO(clamp(t / 0.45));
  g.save(); g.beginPath(); g.rect(0, PH, reveal + 40, H - PH); g.clip();
  for (let b = 0; b < 4; b++) {
    const x = RX0 + b * 8 * CELL;
    g.fillStyle = rgba(C.paper, 0.4); g.fillRect(x, 1522, 2, 112);
    mono(g, `0${b + 1}`, x + 8, 1538, 17, rgba(C.paper, 0.45), 'left', 600);
    for (let k = 1; k < 4; k++) { g.fillStyle = rgba(C.paper, 0.12); g.fillRect(x + k * 2 * CELL, 1568, 1, 66); }
  }
  g.fillStyle = rgba(C.paper, 0.4); g.fillRect(RX1, 1522, 2, 112);
  // current eighth cell
  if (t >= T0 && st < T0 + 8) {
    const c = Math.floor((st - T0) / (BEAT / 2));
    g.fillStyle = rgba(C.paper, 0.07); g.fillRect(RX0 + c * CELL, 1546, CELL, 88);
  }
  const lit = (te) => (outro ? te <= st : te <= t);
  for (const e of BAR_EV) {
    const c = ((e.bar - 1) * 4 + (e.beat - 1)) * 2, x = RX0 + c * CELL + CELL / 2;
    const on = lit(e.t), since = outro ? t - replayAt(e.t) : t - e.t;
    const k = on ? 1 + 0.9 * Math.exp(-Math.max(0, since) / 0.07) : 1;
    const col = e.synco || e.inst === 'T' ? C.red : C.paper;
    g.fillStyle = on ? col : rgba(col === C.red ? C.red : C.paper, 0.26);
    if (e.inst === 'H') g.fillRect(x - 1.5, 1578 - 6 * k, 3, 12 * k);
    else if (e.inst === 'S') g.fillRect(x - 5.5 * k, 1598 - 5.5 * k, 11 * k, 11 * k);
    else if (e.inst === 'K') { g.beginPath(); g.arc(x, 1620, 6.5 * k, 0, 2 * PI); g.fill(); }
    else if (e.inst === 'T') { g.save(); g.translate(x, 1598); g.rotate(PI / 4); g.fillRect(-4.5 * k, -4.5 * k, 9 * k, 9 * k); g.restore(); }
    else if (e.inst === 'C') { g.strokeStyle = g.fillStyle; g.lineWidth = 2; g.beginPath(); g.arc(x, 1620, 12 * k, 0, 2 * PI); g.stroke(); }
  }
  // lyric row
  WORDS.forEach((w, i) => {
    const c = ((w.bar - 1) * 4 + (w.beat - 1)) * 2, x = RX0 + c * CELL + 4;
    const on = lit(WT[i]);
    drawLay(g, T.small[i], x, 1561, on ? (w.synco ? C.red : C.paper) : rgba(C.paper, 0.3));
  });
  g.restore();
  // playhead
  if (t >= T0 - 0.5 * BEAT) {
    const ph = t >= DC ? RX0 : RX0 + clamp((st - T0) / 8) * RW;
    g.fillStyle = C.red; g.fillRect(ph - 1.5, 1516, 3, 120);
    g.beginPath(); g.moveTo(ph - 9, 1512); g.lineTo(ph + 9, 1512); g.lineTo(ph, 1524); g.fill();
  }
}

// ---------------------------------------------------------------- frame
function draw(t) {
  const g = G;
  resetCtx(g);
  const li = layoutAt(t), P = PAL[li], f = LAYOUTS[li];
  g.save(); g.beginPath(); g.rect(0, 0, W, PH); g.clip();
  const ti = INVS[li];
  const r = ti === undefined || t < ti ? 0 : 2000 * EXPO(clamp((t - ti) / (0.3 * BEAT)));
  if (r < 1990) f(g, t, P);
  if (r > 0) {
    const [cx, cy] = irisCentre(li);
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 2 * PI); g.clip();
    f(g, t, inv(P));
    g.restore();
  }
  g.restore();
  resetCtx(g);
  console_(g, t);
}

// ---------------------------------------------------------------- live sound (pattern of demos 29 / 82)
function audioTransport(buffer, hint) {
  let actx = null, src = null, tp = { playing: false, t: 0, at: 0 };
  const stop = () => { if (src) { try { src.stop(); } catch (e) { /* already stopped */ } src.disconnect(); src = null; } };
  const sync = () => {
    stop();
    const running = actx && actx.state === 'running';
    hint.style.display = running ? 'none' : 'flex';
    if (!running || !tp.playing) return;
    const now = (tp.t + (performance.now() - tp.at) / 1000) % D;
    const lat = (actx.baseLatency || 0) + (actx.outputLatency || 0);
    src = actx.createBufferSource();
    src.buffer = buffer;
    src.connect(actx.destination);
    src.start(0, Math.min(D - 0.02, now + lat));
  };
  const unlock = () => {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      actx = new AC({ latencyHint: 'interactive' });
      actx.addEventListener('statechange', sync);
    }
    if (actx.state !== 'running') actx.resume().catch(() => {});
    else if (!src) sync();
  };
  addEventListener('click', (e) => {
    const first = !actx || actx.state !== 'running';
    unlock();
    if (first && !(e.target && e.target.closest && e.target.closest('.dp-bar'))) e.stopPropagation();
  }, true);
  addEventListener('keydown', unlock, true);
  return (playing, t) => { tp = { playing, t, at: performance.now() }; sync(); };
}

defineDemo({
  id: '114-beat-type',
  title: '하나 둘 셋 넷',
  tech: '박자에 맞춘 글자 · 마디·박·엇박으로 짜는 타이포 레이아웃',
  duration: D,
  background: C.desk,
  async setup(api) {
    HEADLESS = api.headless;
    const KO = WORDS.map((w) => w.text).join('') + '네 마디 구령 엇박! 마디 박 도돌이표 다시 처음부터 D.C. 하나 둘 셋 넷';
    await Promise.all([
      fontReady(`900 300px ${PF}`, KO), fontReady(`800 40px ${PF}`, KO), fontReady(`700 22px ${PF}`, KO),
      fontReady(`700 40px ${MF}`, '0123456789.&=/'), fontReady(`600 26px ${MF}`, '0123456789.&=/'),
    ]);
    const c = api.canvas({ type: '2d', z: 0, attrs: HEADLESS ? { willReadFrequently: true } : undefined });
    G = c.ctx;

    // words: size, place
    const place = [
      [340, 540, 520], [560, 540, 1070],          // stack
      [420, 290, 560], [420, 790, 1080],          // split
      [500, 540, 770],                            // big word
    ];
    WORDS.forEach((w, i) => {
      if (i < 5) { const [s, cx, cy] = place[i]; WG[i] = { L: lay(w.text, s, 900, -0.035), cx, cy }; }
      else { const j = i - 5; WG[i] = { L: lay(w.text, 300, 900, 0), cx: 330, cy: GY0 + (j + 0.5) * GRH }; }
    });
    T.head = lay('네 마디 구령', 30, 800, -0.01);
    T.again = lay('도돌이표', 44, 800, -0.02);
    T.off = lay('엇박!', 64, 900, -0.03);
    T.dc = lay('D.C. 처음부터 다시', 52, 900, -0.02);
    T.ma = lay('마디', 22, 600, 0);
    T.bak = lay('박', 22, 600, 0);
    T.set = ['하나 둘', '셋 넷', '다시', '처음부터'].map((s) => lay(s, 40, 800, -0.02));
    T.small = WORDS.map((w) => lay(w.text, 22, 700, 0));
    T.score = WORDS.map((w) => lay(w.text, 140, 900, -0.035));

    // paper grain over the whole stage (moves in steps of 1/12 s)
    const gr = document.createElement('canvas'); gr.width = W + 64; gr.height = H + 64;
    gr.style.cssText = `position:absolute;left:0;top:0;width:${W + 64}px;height:${H + 64}px;z-index:4;pointer-events:none;opacity:.13;mix-blend-mode:overlay`;
    { const gg = gr.getContext('2d'), img = gg.createImageData(gr.width, gr.height), r = rand(11401);
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.floor(r() * 256); img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      gg.putImageData(img, 0, 0); }
    api.stage.appendChild(gr);
    this.grain = gr;

    // sound: the same score, synthesised once; played only in a live browser after a click
    if (!HEADLESS) {
      try {
        const buffer = await renderSound();
        const hint = document.createElement('div');
        hint.style.cssText = 'position:absolute;left:50%;top:160px;transform:translateX(-50%);display:flex;align-items:center;gap:14px;' +
          'padding:16px 30px 16px 26px;border-radius:999px;background:rgba(12,11,10,.88);color:#efe6d3;' +
          'font:600 30px/1 "Pretendard Variable",Pretendard,sans-serif;letter-spacing:-0.01em;z-index:900;pointer-events:none;white-space:nowrap';
        hint.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M6 4 L20 12 L6 20 Z" fill="currentColor"/></svg>소리를 들으려면 화면을 누르세요';
        api.stage.appendChild(hint);
        this.transport = audioTransport(buffer, hint);
      } catch (e) { console.warn('sound off:', e); }
    }

    // warm-up: every composition and both palettes once
    for (const x of [0.3, 1.2, 1.6, 3.0, 3.6, 4.3, 5.6, 7.0, 7.6, 8.7, 9.6]) draw(x);
  },
  onTransport({ playing, t }) {
    if (this.transport) this.transport(playing, t);
  },
  frame(t) {
    draw(t);
    const q = Math.floor(t * 12);
    this.grain.style.transform = `translate(${-((q * 37) % 64)}px, ${-((q * 23 + 11) % 64)}px)`;
  },
});
