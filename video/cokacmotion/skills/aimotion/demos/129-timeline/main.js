/*
 * 129 · 골목 빵집 40년 — 타임라인 · 비선형 시간 축 + 카메라 추적 + 연도 카운터
 *
 * Forty years of an invented corner bakery, told as a vertical timeline the camera travels down. Canvas 2D only.
 *   warp    · year → axis position. A piecewise-constant density (px per year: a wide "room" of ±1 year around
 *             each event, gaps squeezed so that every event sits STEP px after the previous one) is smoothed with
 *             a logistic kernel: the density becomes a sum of sigmoids and the position, its integral, a sum of
 *             softplus ramps — monotone, smooth and closed form. Inverse (position → year) by bisection.
 *   ticks   · at true integer years, so their spacing shows the local scale; labels by level of detail; a break
 *             mark wherever the compression against true proportion passes a threshold.
 *   camera  · the story is a ramp-and-hold target along the axis (plus a sideways sway and a zoom). The camera
 *             looks LA = 2/ω ahead on it and follows through a critically damped spring, written in closed form
 *             as a sum of ramp responses τ − 2/ω + (2/ω + τ)·e^(−ωτ): a pure function of t, nothing stepped.
 *   counter · the year under the camera centre = inverse warp of the camera's axis position; odometer digits.
 *   climax  · pull back to the whole axis, then y(Y) = lerp(warp, linear, m): the real gaps (7, 11, 13, 9 years) appear.
 */
import { defineDemo, rand, clamp, lerp, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 10;
const W = 1080, H = 1920;
const AX = 540;                 // the axis (world x)
const FY = 1010;                // screen y of the camera centre — the "now" line
const PRE = `"${FONTS.pretendard.family}"`, FRA = `"${FONTS.fraunces.family}"`;

// ---------------------------------------------------------------- palette: cream paper, warm brown ink, one accent
const INK = '#3B2A20', BROWN = '#7B5B44', TAN = '#B8936E', MUTED = '#977F6B', PAPER = '#FFFAF1', LINE = '#E9D9C1';
const ACC = '#E5484D';
const SAGE = '#A3A57F', SKIN = '#EDC9A6';
// era colour bands, one per decade (old-photo sepia → bright cream), interpolated along the axis by year
const ERA = [[225, 199, 156], [234, 212, 175], [240, 224, 196], [245, 234, 214], [250, 243, 231]];
const ERA_NAME = ['1980년대', '1990년대', '2000년대', '2010년대', '2020년대'];

// ---------------------------------------------------------------- the story
const EV = [
  { Y: 1985, title: '개업', sub: '골목 모퉁이, 작은 가게 한 칸', side: -1 },
  { Y: 1992, title: '단팥빵이 동네 명물이 되다', sub: '아침마다 골목에 줄이 섰다', side: 1 },
  { Y: 2003, title: '가게를 넓히다', sub: '옆 칸을 터서 두 칸으로', side: -1 },
  { Y: 2016, title: '딸이 가게를 물려받다', sub: '같은 반죽, 새 간판', side: 1 },
  { Y: 2025, title: '40주년', sub: '모퉁이를 지킨 사십 년', side: -1 },
];
const Y0 = 1983, Y1 = 2027;      // the axis runs a little past both ends
const RY = 1;                    // each event's room: ±1 year
const ROOM = 500, STEP = 760;    // px of one room, px from event to event (equal for every event)
const EDGE = 140;                // px per year before the first and after the last room
const SOFT = 0.2;                // logistic smoothing of the density (years)
const BREAK_K = 1.9;             // break mark where (true px/yr) / (warped px/yr) passes this

// timeline (s). The story departs/arrives; the camera looks LA ahead and lags 2/ω, so it lands on time.
const DEP = [1.25, 2.75, 4.25, 5.75];
const ARR = [2.2, 3.7, 5.2, 6.7];
const OMEGA = 8, LA = 2 / OMEGA, OMEGA_Z = 6.5;
const SWAY = 34;
const T_PULL = 7.45, PULL_LEN = 0.6;
const T_M0 = 8.3, T_M1 = 9.15;   // warp → linear
const T_PILL = 8.85, T_40 = 8.62, T_SWEEP0 = 9.2, T_SWEEP1 = 9.95;
const VIEW_TOP = 522, VIEW_BOT = 1560;   // the whole axis in the final frame

// ---------------------------------------------------------------- small helpers
const smooth = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
const outCubic = (p) => ease.outCubic(clamp(p));
const outBack = (p, c = 1.7) => (p <= 0 ? 0 : p >= 1 ? 1 : ease.outBack(p, c));
const inOut = (p) => ease.inOutCubic(clamp(p));
const mixC = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const rgb = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
const hexC = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const INKC = hexC(INK), BROWNC = hexC(BROWN), ACCC = hexC(ACC), PAPERC = hexC(PAPER);
const softplus = (x) => (x > 0 ? x + Math.log1p(Math.exp(-x)) : Math.log1p(Math.exp(x)));
const sigmoid = (x) => 1 / (1 + Math.exp(-x));

function eraColour(Y) {
  let c = ERA[0];
  for (let j = 1; j < ERA.length; j++) c = mixC(c, ERA[j], smooth((Y - (1980 + 10 * j) + 0.7) / 1.4));
  return c;
}
/** rounded rect path; r may be a number or [tl, tr, br, bl] */
function rr(ctx, x, y, w, h, r) {
  const [a, b, c, d] = (Array.isArray(r) ? r : [r, r, r, r]).map((v) => Math.max(0, Math.min(v, w / 2, h / 2)));
  ctx.beginPath();
  ctx.moveTo(x + a, y); ctx.lineTo(x + w - b, y); ctx.arcTo(x + w, y, x + w, y + b, b);
  ctx.lineTo(x + w, y + h - c); ctx.arcTo(x + w, y + h, x + w - c, y + h, c);
  ctx.lineTo(x + d, y + h); ctx.arcTo(x, y + h, x, y + h - d, d);
  ctx.lineTo(x, y + a); ctx.arcTo(x, y, x + a, y, a);
  ctx.closePath();
}
const dot = (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };

// ---------------------------------------------------------------- the warp (year → axis px), closed form
function buildWarp() {
  // piecewise-constant density: [start year, px per year]
  const pieces = [[Y0, EDGE]];
  EV.forEach((e, i) => {
    pieces.push([e.Y - RY, ROOM / (2 * RY)]);
    if (i + 1 < EV.length) pieces.push([e.Y + RY, (STEP - ROOM) / (EV[i + 1].Y - RY - (e.Y + RY))]);
    else pieces.push([e.Y + RY, EDGE]);
  });
  // each density step Δρ at year k, smoothed by a logistic of scale SOFT:
  //   ρ(Y) = ρ0 + Σ Δρ·σ((Y − k)/s)      y(Y) = ρ0·(Y − Y0) + Σ Δρ·s·softplus((Y − k)/s)   (y' = ρ > 0: monotone)
  const knots = [];
  for (let i = 1; i < pieces.length; i++) knots.push([pieces[i][0], pieces[i][1] - pieces[i - 1][1]]);
  const r0 = pieces[0][1];
  const raw = (Y) => { let v = r0 * (Y - Y0); for (const [k, d] of knots) v += d * SOFT * softplus((Y - k) / SOFT); return v; };
  const off = raw(Y0);
  const y = (Y) => raw(Y) - off;
  const rho = (Y) => { let v = r0; for (const [k, d] of knots) v += d * sigmoid((Y - k) / SOFT); return v; };
  return { y, rho, pieces };
}

// ---------------------------------------------------------------- critically damped follow, closed form
/**
 * keys: piecewise-linear target [[t, v], …] (constant before the first key and after the last).
 * The response of x'' = ω²(u − x) − 2ωx' (at rest on the first value) to a slope change Δb at t_k is
 * Δb·R(t − t_k), R(τ) = τ − 2/ω + (2/ω + τ)·e^(−ωτ) — so the camera is a short sum, exact at any t.
 */
function damped(keys, om) {
  const kinks = [];
  let prev = 0;
  for (let i = 0; i < keys.length; i++) {
    const slope = i + 1 < keys.length ? (keys[i + 1][1] - keys[i][1]) / (keys[i + 1][0] - keys[i][0]) : 0;
    kinks.push([keys[i][0], slope - prev]);
    prev = slope;
  }
  const v0 = keys[0][1], a = 2 / om;
  return (t) => {
    let v = v0;
    for (const [tk, db] of kinks) {
      const x = t - tk;
      if (x > 0 && db !== 0) v += db * (x - a + (a + x) * Math.exp(-om * x));
    }
    return v;
  };
}

// ---------------------------------------------------------------- the shop, in vignette units (412 × 270, ground at GY)
const VW = 412, VH = 270, GY = 232;
const SKY = [['#F0D9B4', '#E3C397'], ['#F2DEBC', '#E7CBA2'], ['#F4E5C9', '#EBD5B2'], ['#F6EBD8', '#EEDDC3'], ['#F9F0E2', '#F1E3CC']];
const SHOP = [
  { w: 150, cx: 190, floors: 1, wall: '#E3C49D', trim: '#8A6142', door: '#8A6142', frame: '#8A6142', sign: 0 },
  { w: 150, cx: 190, floors: 1, wall: '#DFBF97', trim: '#8A6142', door: '#8A6142', frame: '#8A6142', sign: 0 },
  { w: 262, cx: 200, floors: 2, wall: '#EED9B8', upper: '#E6CDA8', trim: '#7B5B44', door: '#7B5B44', frame: '#7B5B44', sign: 1 },
  { w: 262, cx: 200, floors: 2, wall: '#5E4535', upper: '#684C3B', trim: '#3B2A20', door: '#E8D2AE', frame: '#F3E3C8', sign: 2 },
  { w: 262, cx: 200, floors: 2, wall: '#5E4535', upper: '#684C3B', trim: '#3B2A20', door: '#E8D2AE', frame: '#F3E3C8', sign: 2 },
];
// the town behind the shop grows with the decades: [x, w, top, roof?]
const TOWN = [
  [[-8, 84, 152, 1], [96, 70, 170, 1], [318, 100, 146, 1]],
  [[-8, 84, 140, 1], [96, 70, 160, 1], [312, 108, 112, 0]],
  [[-8, 78, 96, 0], [300, 60, 120, 1], [348, 72, 74, 0]],
  [[-8, 64, 52, 0], [52, 50, 98, 0], [342, 78, 38, 0]],
  [[-8, 64, 40, 0], [52, 50, 86, 0], [342, 78, 26, 0]],
];

function wheat(ctx, x, y, s, col) {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.4 * s;
  ctx.beginPath(); ctx.moveTo(x, y + 9 * s); ctx.lineTo(x, y - 8 * s); ctx.stroke();
  for (let k = 0; k < 3; k++) {
    const yy = y - 6 * s + k * 4.5 * s;
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.translate(x + sd * 2.6 * s, yy); ctx.rotate(sd * 0.55);
      ctx.beginPath(); ctx.ellipse(0, 0, 1.6 * s, 3.2 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  ctx.beginPath(); ctx.ellipse(x, y - 9.5 * s, 1.5 * s, 3 * s, 0, 0, Math.PI * 2); ctx.fill();
}
function person(ctx, x, y, s, look, bob = 0, wave = null) {
  const b = bob, f = look.face || 1;
  ctx.fillStyle = INK;
  rr(ctx, x - 6.2 * s, y - 19 * s, 4.8 * s, 19 * s, 2.2 * s); ctx.fill();
  rr(ctx, x + 1.4 * s, y - 19 * s, 4.8 * s, 19 * s, 2.2 * s); ctx.fill();
  if (look.hand) {
    const [hx, hy] = look.hand;
    ctx.strokeStyle = look.coat; ctx.lineWidth = 4.6 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + f * 6 * s, y - 39 * s + b); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = SKIN; dot(ctx, hx, hy, 2.8 * s);
  }
  if (wave !== null) {
    ctx.strokeStyle = look.coat; ctx.lineWidth = 4.6 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + f * 6 * s, y - 39 * s + b);
    ctx.lineTo(x + f * (13 + 2 * Math.sin(wave)) * s, y - 55 * s + b + Math.cos(wave) * 1.5 * s); ctx.stroke();
    ctx.fillStyle = SKIN; dot(ctx, x + f * (13 + 2 * Math.sin(wave)) * s, y - 57 * s + b + Math.cos(wave) * 1.5 * s, 2.8 * s);
  }
  ctx.fillStyle = look.coat; rr(ctx, x - 9.6 * s, y - 45 * s + b, 19.2 * s, 29 * s, [8 * s, 8 * s, 4 * s, 4 * s]); ctx.fill();
  if (look.apron) { ctx.fillStyle = look.apron; rr(ctx, x - 6.4 * s, y - 35 * s + b, 12.8 * s, 19 * s, 3 * s); ctx.fill(); }
  if (look.bag) { ctx.fillStyle = PAPER; rr(ctx, x - f * 13 * s, y - 32 * s + b, 8 * s, 10 * s, 1.5 * s); ctx.fill(); }
  ctx.fillStyle = SKIN; dot(ctx, x, y - 53 * s + b, 8.2 * s);
  ctx.fillStyle = look.hair;
  ctx.beginPath(); ctx.arc(x + f * -0.8 * s, y - 54 * s + b, 8.8 * s, Math.PI * 1.0, Math.PI * 2.0); ctx.fill();
  if (look.bun) dot(ctx, x - f * 7 * s, y - 58 * s + b, 4.2 * s);
  if (look.tail) { ctx.beginPath(); ctx.ellipse(x - f * 9 * s, y - 50 * s + b, 3.4 * s, 6.5 * s, f * 0.35, 0, Math.PI * 2); ctx.fill(); }
  if (look.face !== undefined) { ctx.fillStyle = INK; dot(ctx, x + f * 4.2 * s, y - 53.5 * s + b, 1.05 * s); }
}
function awning(ctx, xa, xb, y, h) {
  const n = Math.max(5, Math.round((xb - xa) / 14)), sw = (xb - xa) / n, r = sw / 2;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.lineTo(xb, y + h);
  for (let k = n - 1; k >= 0; k--) ctx.arc(xa + (k + 0.5) * sw, y + h, r, 0, Math.PI);
  ctx.closePath();
  ctx.clip();
  for (let k = 0; k < n; k++) { ctx.fillStyle = k % 2 ? PAPER : ACC; ctx.fillRect(xa + k * sw, y - 1, sw + 0.6, h + r + 2); }
  ctx.fillStyle = 'rgba(59,42,32,0.18)'; ctx.fillRect(xa, y - 1, xb - xa, 5);
  ctx.restore();
}
function shopWindow(ctx, x, y, w, h, S, i, t) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#FFF1D0'); g.addColorStop(1, '#F3CB8C');
  ctx.fillStyle = g; rr(ctx, x, y, w, h, [7, 7, 1, 1]); ctx.fill();
  // shelf of loaves, row of buns
  ctx.fillStyle = 'rgba(123,91,68,0.4)'; ctx.fillRect(x + 4, y + h * 0.5, w - 8, 2.5);
  const nL = Math.max(2, Math.floor((w - 10) / 22));
  for (let k = 0; k < nL; k++) {
    const lx = x + 8 + (k + 0.5) * ((w - 16) / nL), ly = y + h * 0.5 - 5;
    ctx.fillStyle = '#C98A4C'; ctx.beginPath(); ctx.ellipse(lx, ly, 9, 5.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#A0652F'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(lx - 4, ly - 1); ctx.lineTo(lx - 2, ly - 3.5); ctx.moveTo(lx, ly - 0.5); ctx.lineTo(lx + 2, ly - 3.5); ctx.moveTo(lx + 4, ly); ctx.lineTo(lx + 5.5, ly - 2.5); ctx.stroke();
  }
  const nB = Math.max(3, Math.floor((w - 10) / 14));
  for (let k = 0; k < nB; k++) {
    const bx = x + 7 + (k + 0.5) * ((w - 14) / nB), by = y + h - 7;
    ctx.fillStyle = k % 2 ? '#B46F3C' : '#C17D47'; dot(ctx, bx, by, 5.4);
    ctx.fillStyle = 'rgba(255,240,215,0.75)'; dot(ctx, bx - 1.2, by - 2.2, 1.1);
  }
  if (i === 1 && w < 90) {   // 1992: a paper sign in the window
    ctx.fillStyle = PAPER; rr(ctx, x + 6, y + 5, 44, 16, 2); ctx.fill();
    ctx.fillStyle = ACC; ctx.font = `800 11px ${PRE}`; ctx.textAlign = 'center'; ctx.fillText('단팥빵', x + 28, y + 17); ctx.textAlign = 'left';
  }
  // glass sheen and frame
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.beginPath(); ctx.moveTo(x + w * 0.62, y + 2); ctx.lineTo(x + w * 0.78, y + 2); ctx.lineTo(x + w * 0.5, y + h - 2); ctx.lineTo(x + w * 0.34, y + h - 2); ctx.fill();
  ctx.strokeStyle = S.frame; ctx.lineWidth = 3; rr(ctx, x, y, w, h, [7, 7, 1, 1]); ctx.stroke();
}
function chimneySmoke(ctx, x, y, t) {
  for (let j = 0; j < 4; j++) {
    const ph = (t * 0.5 + j / 4) % 1;
    const a = 0.55 * (1 - ph) * smooth(ph * 5);
    ctx.fillStyle = `rgba(255,250,241,${a.toFixed(3)})`;
    dot(ctx, x + ph * 16 + Math.sin(ph * 6 + j) * 3, y - ph * 58, 4 + ph * 10);
  }
}
/** one era of the shop, in scene units. tb = seconds since the event's beat, par = parallax shift */
function drawScene(ctx, i, t, tb, par) {
  const A0 = ctx.globalAlpha;
  const S = SHOP[i], x0 = S.cx - S.w / 2, x1 = x0 + S.w, two = S.floors === 2;
  // sky and sun
  const g = ctx.createLinearGradient(0, 0, 0, GY);
  g.addColorStop(0, SKY[i][0]); g.addColorStop(1, SKY[i][1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  ctx.fillStyle = 'rgba(255,250,236,0.75)'; dot(ctx, 338, 58 + par * 0.6, 28);
  ctx.fillStyle = 'rgba(255,250,236,0.55)';
  for (const [cx, cy, s] of [[90, 52, 1], [262, 30, 0.8]]) {
    const xx = ((cx + t * 9 + 40) % (VW + 80)) - 40, yy = cy + par * 0.5;
    rr(ctx, xx - 22 * s, yy - 6 * s, 44 * s, 12 * s, 6 * s); ctx.fill(); dot(ctx, xx - 4 * s, yy - 6 * s, 9 * s); dot(ctx, xx + 9 * s, yy - 4 * s, 7 * s);
  }
  // the town behind (taller every decade)
  for (const [bx, bw, top, roof] of TOWN[i]) {
    const yy = top + par * 0.35;
    ctx.fillStyle = '#D8BE99';
    ctx.fillRect(bx, yy, bw, GY - yy);
    if (roof) { ctx.beginPath(); ctx.moveTo(bx - 4, yy + 1); ctx.lineTo(bx + bw / 2, yy - 20); ctx.lineTo(bx + bw + 4, yy + 1); ctx.fill(); }
    ctx.fillStyle = '#CCAE87';
    for (let wy = yy + 12; wy < GY - 22; wy += 22) for (let wx = bx + 9; wx < bx + bw - 12; wx += 18) ctx.fillRect(wx, wy, 8, 10);
  }
  // pavement and road
  ctx.fillStyle = '#D9C3A1'; ctx.fillRect(0, GY, VW, 24);
  ctx.fillStyle = '#C2A884'; ctx.fillRect(0, GY + 22, VW, 4);
  ctx.fillStyle = '#B79C79'; ctx.fillRect(0, GY + 26, VW, VH - GY - 26);
  ctx.fillStyle = 'rgba(255,248,232,0.5)';
  for (let k = 0; k < 6; k++) ctx.fillRect(k * 80 + 10, GY + 34, 40, 3);
  ctx.strokeStyle = 'rgba(160,130,98,0.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); for (let k = 0; k < 11; k++) { ctx.moveTo(k * 40 + 14, GY + 2); ctx.lineTo(k * 40 + 8, GY + 21); } ctx.stroke();
  // window light spilling on the pavement
  ctx.fillStyle = 'rgba(255,233,180,0.35)';
  ctx.beginPath(); ctx.moveTo(x0 + 8, GY); ctx.lineTo(x1 - 8, GY); ctx.lineTo(x1 + 14, GY + 21); ctx.lineTo(x0 - 14, GY + 21); ctx.fill();

  // lamp post
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(36, GY + 4); ctx.lineTo(36, 118); ctx.stroke();
  ctx.fillStyle = 'rgba(255,236,190,0.45)'; dot(ctx, 36, 110, 18);
  ctx.fillStyle = INK;
  if (i < 3) { rr(ctx, 29, 100, 14, 18, 3); ctx.fill(); ctx.fillStyle = '#FFE7B0'; ctx.fillRect(32, 104, 8, 10); ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(26, 101); ctx.lineTo(36, 92); ctx.lineTo(46, 101); ctx.fill(); }
  else { ctx.beginPath(); ctx.ellipse(36, 108, 12, 5, 0, Math.PI, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FFE7B0'; ctx.fillRect(28, 108, 16, 3); }

  // ---- the building
  ctx.fillStyle = 'rgba(59,42,32,0.16)'; ctx.fillRect(x1, two ? 30 : 100, 9, GY - (two ? 30 : 100));   // side shade
  let chX, chY;
  if (two) {
    ctx.fillStyle = S.upper; ctx.fillRect(x0 + 6, 26, S.w - 12, 72);
    const wins = i === 4 ? [x0 + 26, x1 - 66] : [x0 + 26, S.cx - 20, x1 - 66];
    for (const wx of wins) {
      ctx.fillStyle = '#F7E2BB'; rr(ctx, wx, 40, 40, 36, [14, 14, 2, 2]); ctx.fill();
      ctx.strokeStyle = S.frame; ctx.lineWidth = 2.5; rr(ctx, wx, 40, 40, 36, [14, 14, 2, 2]); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx + 20, 42); ctx.lineTo(wx + 20, 76); ctx.stroke();
      ctx.fillStyle = S.trim; ctx.fillRect(wx - 4, 76, 48, 6);
      ctx.fillStyle = SAGE; for (let k = 0; k < 5; k++) dot(ctx, wx + 2 + k * 9, 75, 4.2);
      ctx.fillStyle = ACC; dot(ctx, wx + 8, 72, 2); dot(ctx, wx + 27, 71, 2);
    }
    ctx.fillStyle = S.trim; rr(ctx, x0 - 3, 16, S.w + 6, 11, 3); ctx.fill();
    chX = x1 - 44; chY = 2;
    ctx.fillStyle = S.trim; ctx.fillRect(chX, chY, 14, 16);
  } else {
    chX = x1 - 34; chY = 70;
    ctx.fillStyle = S.trim; ctx.fillRect(chX, chY, 13, 18);
  }
  ctx.fillStyle = S.wall; ctx.fillRect(x0, 96, S.w, GY - 96);
  if (i === 2) {   // brick courses on the new, wider front
    ctx.strokeStyle = 'rgba(160,120,84,0.22)'; ctx.lineWidth = 1;
    ctx.beginPath(); for (let yy = 102; yy < GY - 10; yy += 9) { ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); } ctx.stroke();
  }
  if (!two) { ctx.fillStyle = S.trim; rr(ctx, x0 - 6, 86, S.w + 12, 11, 3); ctx.fill(); }
  ctx.fillStyle = 'rgba(59,42,32,0.22)'; ctx.fillRect(x0, GY - 10, S.w, 10);
  chimneySmoke(ctx, chX + 7, chY - 2, t);

  // sign
  ctx.textAlign = 'center';
  if (S.sign === 0) {
    ctx.fillStyle = S.trim; rr(ctx, S.cx - 58, 102, 116, 25, 4); ctx.fill();
    ctx.fillStyle = PAPER; ctx.font = `800 15px ${PRE}`; ctx.fillText('모퉁이 빵집', S.cx, 120);
  } else if (S.sign === 1) {
    ctx.fillStyle = S.trim; rr(ctx, S.cx - 92, 101, 184, 28, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(255,250,241,0.5)'; ctx.lineWidth = 1.2; rr(ctx, S.cx - 88, 104, 176, 22, 3); ctx.stroke();
    ctx.fillStyle = PAPER; ctx.font = `800 18px ${PRE}`; ctx.fillText('모퉁이 빵집', S.cx, 121.5);
  } else {
    ctx.fillStyle = '#F6E7CC'; rr(ctx, S.cx - 96, 100, 192, 30, 15); ctx.fill();
    wheat(ctx, S.cx - 72, 115, 1, ACC);
    ctx.fillStyle = INK; ctx.font = `800 17px ${PRE}`; ctx.fillText('모퉁이 빵집', S.cx + 8, 121);
  }
  ctx.textAlign = 'left';
  // awning, windows, door
  awning(ctx, x0 - 8, x1 + 8, 134, 14);
  ctx.fillStyle = 'rgba(59,42,32,0.2)'; ctx.fillRect(x0, 154, S.w, 5);
  const door = S.w < 200 ? [x0 + 104, 160] : [S.cx - 17, 160];
  if (S.w < 200) {
    shopWindow(ctx, x0 + 12, 166, 80, 48, S, i, t);
  } else {
    shopWindow(ctx, x0 + 14, 166, 92, 48, S, i, t);
    shopWindow(ctx, x0 + 156, 166, 92, 48, S, i, t);
    ctx.fillStyle = SAGE;
    for (const wx of [x0 + 14, x0 + 156]) for (let k = 0; k < 7; k++) dot(ctx, wx + 6 + k * 13.5, 219 - (k % 2) * 2, 5.5);
  }
  ctx.fillStyle = S.door; rr(ctx, door[0], door[1], 34, GY - door[1], [4, 4, 0, 0]); ctx.fill();
  ctx.fillStyle = 'rgba(255,236,196,0.75)'; rr(ctx, door[0] + 7, door[1] + 7, 20, 26, 3); ctx.fill();
  ctx.fillStyle = i >= 3 ? INK : '#E8C27A'; dot(ctx, door[0] + 27, door[1] + 44, 2.2);

  // ---- the era's moment
  if (i === 0) {          // opening-day flower wreath on a stand
    const wx = 300, wy = 164, sway = Math.sin(t * 2.2) * 0.04;
    ctx.strokeStyle = BROWN; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(wx - 15, GY); ctx.lineTo(wx, wy); ctx.lineTo(wx + 15, GY); ctx.moveTo(wx, wy); ctx.lineTo(wx, GY); ctx.stroke();
    ctx.fillStyle = SAGE; dot(ctx, wx, wy, 27);
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      ctx.fillStyle = k % 3 === 0 ? PAPER : k % 3 === 1 ? ACC : '#F2C9B8';
      dot(ctx, wx + Math.cos(a) * 21, wy + Math.sin(a) * 21, 7);
    }
    ctx.fillStyle = PAPER; dot(ctx, wx, wy, 12);
    ctx.fillStyle = ACC; ctx.font = `800 9px ${PRE}`; ctx.textAlign = 'center'; ctx.fillText('개업', wx, wy + 3.5); ctx.textAlign = 'left';
    ctx.save(); ctx.translate(wx, wy + 22); ctx.rotate(sway);
    ctx.fillStyle = PAPER; ctx.fillRect(-9, 0, 6, 40); ctx.fillRect(3, 0, 6, 34);
    ctx.restore();
    person(ctx, 356, GY, 1.22, { coat: BROWN, hair: INK, apron: PAPER, bun: true, face: -1 }, Math.sin(t * 3) * 0.6, t * 8);
  } else if (i === 1) {   // the morning queue for red-bean buns
    const Q = [[268, TAN, INK, 1], [292, SAGE, BROWN, 0], [316, BROWN, INK, 1], [340, '#C9A98B', '#5A4536', 0], [364, INK, '#8C7F74', 1], [388, TAN, BROWN, 0]];
    Q.forEach(([qx, coat, hair, bag], j) => person(ctx, qx, GY + (j % 2) * 2, 1.04 + (j % 3) * 0.06, { coat, hair, bag: !!bag, face: -1, tail: j === 3 }, Math.sin(t * 4 + j * 1.3) * 1.1));
    for (let j = 0; j < 3; j++) {   // steam from the door
      ctx.strokeStyle = `rgba(255,250,241,${(0.6 - j * 0.12).toFixed(2)})`; ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (let k = 0; k <= 10; k++) {
        const yy = 154 - k * 5, xx = door[0] + 10 + j * 8 + Math.sin(k * 0.7 - t * 5 + j) * 3;
        k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
      }
      ctx.stroke();
    }
  } else if (i === 2) {   // the wall knocked through: a ladder still leaning on the new half
    ctx.strokeStyle = BROWN; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(372, GY); ctx.lineTo(346, 110); ctx.moveTo(388, GY); ctx.lineTo(362, 110); ctx.stroke();
    ctx.lineWidth = 2.2; ctx.beginPath();
    for (let k = 1; k < 8; k++) { const u = k / 8; ctx.moveTo(lerp(372, 346, u), lerp(GY, 110, u)); ctx.lineTo(lerp(388, 362, u), lerp(GY, 110, u)); }
    ctx.stroke();
    ctx.fillStyle = PAPER; rr(ctx, 380, GY - 16, 18, 16, 2); ctx.fill(); ctx.fillStyle = ACC; ctx.fillRect(380, GY - 16, 18, 4);
  } else {                // 2016 / 2025: mother and daughter, a chalkboard; 2025 adds a party
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(366, GY); ctx.lineTo(378, 186); ctx.lineTo(390, GY); ctx.stroke();
    ctx.fillStyle = INK; rr(ctx, 362, 188, 32, 36, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(255,250,241,0.75)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(368, 197); ctx.lineTo(388, 197); ctx.moveTo(368, 205); ctx.lineTo(384, 205); ctx.stroke();
    ctx.fillStyle = 'rgba(255,250,241,0.8)'; dot(ctx, 378, 215, 4);
    const s0 = 1.2, mx = 282, dx = 330, py = GY - 37 * s0;
    if (i === 3) {         // the hand-over: one rolling pin between two pairs of hands
      const lift = Math.sin(t * 2.2) * 1.2;
      person(ctx, mx, GY, s0, { coat: BROWN, hair: '#B9B1A9', apron: PAPER, bun: true, face: 1, hand: [303, py + lift] });
      person(ctx, dx, GY, 1.26, { coat: TAN, hair: INK, apron: PAPER, tail: true, face: -1, hand: [311, py + lift] });
      ctx.fillStyle = '#D6A466'; rr(ctx, 293, py - 4 + lift, 28, 8, 4); ctx.fill();
      ctx.fillStyle = BROWN; rr(ctx, 286, py - 2 + lift, 8, 4, 2); ctx.fill(); rr(ctx, 320, py - 2 + lift, 8, 4, 2); ctx.fill();
    } else {
      person(ctx, mx, GY, s0, { coat: BROWN, hair: '#B9B1A9', apron: PAPER, bun: true, face: 1 }, Math.sin(t * 2.6) * 0.6);
      person(ctx, dx, GY, 1.26, { coat: TAN, hair: INK, apron: PAPER, tail: true, face: -1 }, Math.sin(t * 2.6 + 1) * 0.6, t * 9);
    }
    if (i === 4) {
      const pb = outBack((tb + 0.15) / 0.55, 1.4);
      // bunting along the cornice
      const drop = (1 - pb) * -46;
      ctx.strokeStyle = INK; ctx.lineWidth = 1.3;
      const P0 = [x0 - 2, 28 + drop], P1 = [x1 + 2, 28 + drop], sag = 15;
      ctx.beginPath(); ctx.moveTo(P0[0], P0[1]); ctx.quadraticCurveTo((P0[0] + P1[0]) / 2, P0[1] + sag * 2, P1[0], P1[1]); ctx.stroke();
      for (let k = 0; k < 11; k++) {
        const u = (k + 0.5) / 11, px = lerp(P0[0], P1[0], u), py = P0[1] + sag * 2 * 2 * u * (1 - u) * 1;
        ctx.save(); ctx.translate(px, py); ctx.rotate(Math.sin(t * 3.4 + k) * 0.12);
        ctx.fillStyle = k % 2 ? PAPER : ACC; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(0, 13); ctx.fill();
        ctx.restore();
      }
      // banner
      ctx.globalAlpha = A0 * clamp((tb + 0.1) / 0.3);
      ctx.fillStyle = ACC; rr(ctx, S.cx - 36, 40, 72, 30, 4); ctx.fill();
      ctx.fillStyle = PAPER; ctx.font = `800 15px ${PRE}`; ctx.textAlign = 'center'; ctx.fillText('40주년', S.cx, 60.5); ctx.textAlign = 'left';
      ctx.globalAlpha = A0;
      // two balloons rising from the chalkboard
      const pr = outBack((tb - 0.05) / 0.7, 1.2);
      [[356, 74, ACC, PAPER, '4'], [384, 90, PAPER, ACC, '0']].forEach(([bx, by, fill, ink, ch], j) => {
        const yy = lerp(GY - 30, by, pr) + Math.sin(t * 2.4 + j * 2) * 2.5, xx = bx + Math.sin(t * 1.7 + j) * 2;
        ctx.strokeStyle = 'rgba(59,42,32,0.6)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xx, yy + 15); ctx.quadraticCurveTo(xx - 6, (yy + 190) / 2, 378, 188); ctx.stroke();
        ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(xx, yy, 12, 14.5, 0, 0, Math.PI * 2); ctx.fill();
        if (fill === PAPER) { ctx.strokeStyle = ACC; ctx.lineWidth = 1.5; ctx.stroke(); }
        ctx.fillStyle = ink; ctx.font = `700 16px ${FRA}`; ctx.textAlign = 'center'; ctx.fillText(ch, xx, yy + 5.5); ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(xx - 4.5, yy - 5.5, 2.4, 4, 0.5, 0, Math.PI * 2); ctx.fill();
      });
    }
  }
}

// ---------------------------------------------------------------- the event card ↔ chip
const CARD_W = 440, CARD_H = 468, CHIP_H = 116, CHIP_D = 104;

// bread loaf mark (eyebrow)
function loafIcon(ctx, x, y, s) {
  ctx.fillStyle = TAN; ctx.beginPath(); ctx.ellipse(x, y, 17 * s, 10 * s, 0, Math.PI, Math.PI * 2); ctx.fill();
  rr(ctx, x - 17 * s, y - 1, 34 * s, 9 * s, 3 * s); ctx.fill();
  ctx.strokeStyle = PAPER; ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
  ctx.beginPath(); for (const dx of [-8, 0, 8]) { ctx.moveTo(x + dx * s - 2 * s, y - 2 * s); ctx.lineTo(x + dx * s + 2 * s, y - 7 * s); } ctx.stroke();
}

defineDemo({
  id: '129-timeline',
  title: '골목 빵집 40년',
  tech: '타임라인 · 비선형 시간 축 + 카메라 추적 + 연도 카운터',
  duration: D,
  background: '#F3E6CF',
  async setup(api) {
    const t0 = performance.now();
    const { ctx } = api.canvas({ attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = ctx;
    const KR = EV.map((e) => e.title + e.sub).join('') + ERA_NAME.join('') + '모퉁이빵집단팥빵개업40주년년';
    await Promise.all([
      fontReady(`800 34px ${PRE}`, KR), fontReady(`700 31px ${PRE}`, KR), fontReady(`500 24px ${PRE}`, KR), fontReady(`600 30px ${PRE}`, KR + '0123456789–'),
      fontReady(`700 214px ${FRA}`, '0123456789’'), fontReady(`500 21px ${FRA}`, '0123456789'), fontReady(`800 300px ${FRA}`, '0123456789’'),
    ]);

    // ---- warp
    const wp = buildWarp();
    this.warp = wp.y; this.dens = wp.rho;
    this.L = wp.y(Y1);
    this.linK = this.L / (Y1 - Y0);            // true proportion: px per year when the axis is linear
    this.c = EV.map((e) => wp.y(e.Y));         // event centres on the axis
    // where each gap's break mark sits: the middle of its longest stretch free of labelled decade ticks
    this.breakY = EV.slice(0, -1).map((e, j) => {
      const a = e.Y + RY + 0.6, b = EV[j + 1].Y - RY - 0.6, cuts = [a];
      for (let d = Math.ceil(a / 10) * 10; d < b; d += 10) cuts.push(d);
      cuts.push(b);
      let best = [a, b], len = -1;
      for (let q = 0; q + 1 < cuts.length; q++) if (cuts[q + 1] - cuts[q] > len) { len = cuts[q + 1] - cuts[q]; best = [cuts[q], cuts[q + 1]]; }
      return (best[0] + best[1]) / 2;
    });
    const ideal = EV.map((e, i) => EDGE + ROOM / 2 + i * STEP);
    this.warpErr = Math.max(...this.c.map((v, i) => Math.abs(v - ideal[i])));

    // ---- camera: piecewise-linear targets → closed-form critically damped follow
    const c = this.c, sideX = (i) => AX + EV[i].side * SWAY;
    this.zAll = (VIEW_BOT - VIEW_TOP) / this.L;
    const yAll = this.L / 2 - ((VIEW_TOP + VIEW_BOT) / 2 - FY) / this.zAll;
    const story = [[0, c[0]]];
    for (let i = 0; i < 4; i++) story.push([DEP[i], c[i]], [ARR[i], c[i + 1]]);
    const yKeys = story.map(([tt, v]) => [Math.max(0, tt - LA), v]);   // look ahead: aim where the story will be
    yKeys.push([T_PULL, c[4]], [T_PULL + PULL_LEN, yAll]);
    const xKeys = [[0, sideX(0)]];
    for (let i = 0; i < 4; i++) xKeys.push([DEP[i] - LA, sideX(i)], [ARR[i] - LA, sideX(i + 1)]);
    xKeys.push([T_PULL, sideX(4)], [T_PULL + PULL_LEN, AX]);
    this.camY = damped(yKeys, OMEGA); this.camX = damped(xKeys, OMEGA);

    // ---- event times: card entrances, node reached, the decade the counter is in
    this.tIn = [0.42, ...ARR.map((a) => a - 0.62)];
    // a node lights when the bead (the camera centre) touches its rim: solve camY(t) = c_i − 18 by bisection
    this.tReach = [0.36, ...ARR.map((_, i) => {
      let a = DEP[i], b = T_PULL;
      for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (this.camY(m) < c[i + 1] - 18) a = m; else b = m; }
      return (a + b) / 2;
    })];
    const zKeys = [[0.05, Math.log(1.12)], [0.95, 0]];
    for (let i = 0; i < 4; i++) zKeys.push([DEP[i] - LA, 0], [(DEP[i] + ARR[i]) / 2 - LA, Math.log(0.93)], [ARR[i] - LA, 0]);
    const tb4 = this.tReach[4];       // the 40th-anniversary beat: a short push-in, released by the same spring
    zKeys.push([tb4, 0], [tb4 + 0.08, Math.log(1.05)], [tb4 + 0.3, 0]);
    zKeys.push([T_PULL, 0], [T_PULL + PULL_LEN, Math.log(this.zAll)]);
    this.camLZ = damped(zKeys, OMEGA_Z);
    this.yFreeze = this.yearAt(this.camY(T_PULL), 0);
    const eraTimes = [[0, ERA_NAME[0]]];
    for (let d = 1; d < 5; d++) {          // when the counter crosses each decade (camY is monotone during travel)
      const target = wp.y(1980 + d * 10);
      let a = 0, b = T_PULL;
      for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (this.camY(m) < target) a = m; else b = m; }
      eraTimes.push([(a + b) / 2, ERA_NAME[d]]);
    }
    eraTimes.push([T_40 + 0.12, '1985 – 2025']);
    this.eraTimes = eraTimes;

    // ---- type metrics: card / chip layouts
    const meas = [];
    for (const e of EV) {
      ctx.font = `800 34px ${PRE}`; const tw34 = ctx.measureText(e.title).width;
      const titleSize = Math.min(34, (34 * (CARD_W - 56)) / tw34);
      ctx.font = `800 22px ${PRE}`; const tw22 = ctx.measureText(e.title).width;
      ctx.font = `700 30px ${FRA}`; const yw30 = ctx.measureText(String(e.Y)).width;
      ctx.font = `700 56px ${FRA}`; const yw56 = ctx.measureText(String(e.Y)).width;
      ctx.font = `800 ${titleSize}px ${PRE}`; const twC = ctx.measureText(e.title).width;
      const chipW = 6 + CHIP_D + 18 + Math.max(yw30, tw22) + 26;
      meas.push({ titleSize, tw22, twC, yw30, yw56, chipW });
    }
    this.meas = meas;
    ctx.font = `700 214px ${FRA}`;
    this.cellW = Math.max(...'0123456789'.split('').map((d) => ctx.measureText(d).width)) + 6;
    ctx.font = `700 31px ${PRE}`; this.eyebrowW = ctx.measureText('모퉁이 빵집').width;

    // ---- depth layers (seeded)
    const r = rand(129);
    this.bokeh = Array.from({ length: 22 }, () => ({ x: -200 + r() * 1480, y: -2000 + r() * 7600, r: 60 + r() * 120, a: 0.12 + r() * 0.16 }));
    this.flour = Array.from({ length: 64 }, () => ({ x: r() * W, y: -900 + r() * 5600, r: 1.4 + r() * 3.2, ph: r() * 6.28, a: 0.35 + r() * 0.45 }));
    this.confetti = Array.from({ length: 34 }, () => ({ a: -Math.PI * (0.04 + 0.92 * r()), v: 420 + r() * 640, s: 6 + r() * 6, w: (r() - 0.5) * 18, c: r() < 0.5 ? ACC : r() < 0.6 ? PAPER : TAN }));
    const grain = new Path2D(), grainL = new Path2D();
    for (let k = 0; k < 2600; k++) { const gx = r() * W, gy = r() * H; (k % 3 ? grain : grainL).rect(gx, gy, 1.6, 1.6); }
    this.grain = grain; this.grainL = grainL;

    this.setupMs = performance.now() - t0;
    console.log('setup', this.setupMs | 0, 'ms · L', this.L | 0, '· event error', this.warpErr.toFixed(3), 'px · zAll', this.zAll.toFixed(4),
      '· gaps px/yr', wp.pieces.map((p) => p[1].toFixed(1)).join(' '), '· freeze', this.yFreeze.toFixed(4));
  },

  // ---------------------------------------------------------------- axis maps (m = 0 warped … 1 true proportion)
  yOf(Y, m) { return lerp(this.warp(Y), (Y - Y0) * this.linK, m); },
  rhoOf(Y, m) { return lerp(this.dens(Y), this.linK, m); },
  yearAt(y, m) {
    let a = Y0 - 30, b = Y1 + 30;
    for (let k = 0; k < 44; k++) { const c = (a + b) / 2; if (this.yOf(c, m) < y) a = c; else b = c; }
    return (a + b) / 2;
  },
  camAt(t) { return { x: this.camX(t), y: this.camY(t), z: Math.exp(this.camLZ(t)) }; },
  /** the counter: the year at the camera centre (frozen once the camera leaves the story) */
  counterYear(t) { return t >= T_PULL ? this.yFreeze : this.yearAt(this.camY(t), 0); },

  // ---------------------------------------------------------------- drawing
  frame(t) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.setLineDash([]); ctx.lineDashOffset = 0;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.imageSmoothingEnabled = true;

    const cam = this.camAt(t), z = cam.z;
    const pull = t < T_PULL ? 0 : clamp(Math.log(z) / Math.log(this.zAll));
    const m = inOut((t - T_M0) / (T_M1 - T_M0));
    const sx = (X) => W / 2 + (X - cam.x) * z;
    const syw = (y) => FY + (y - cam.y) * z;
    const syY = (Y) => syw(this.yOf(Y, m));
    const zf = lerp(1, 0.78, pull);                 // screen-space marks shrink a little in the overview

    // ---- era bands: a gradient whose stops are the era colour of the year under each screen row
    const bandAt = (s) => eraColour(this.yearAt((s - FY) / z + cam.y, m));
    const g = ctx.createLinearGradient(0, 0, 0, H);
    for (let s = 0; s <= H; s += 24) g.addColorStop(s / H, rgb(bandAt(s)));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(123,91,68,0.055)'; ctx.fill(this.grain);
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fill(this.grainL);
    // decade lines across the page
    ctx.lineWidth = 2;
    for (let d = 1990; d <= 2020; d += 10) {
      const y = syY(d);
      if (y < -10 || y > H + 10) continue;
      ctx.strokeStyle = 'rgba(123,91,68,0.12)';
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // ---- background depth: soft light discs (parallax 0.45) and ghost years (parallax 0.72)
    const bgA = 1 - pull;
    for (const b of this.bokeh) {
      const bx = W / 2 + (b.x - cam.x) * z * 0.45, by = FY + (b.y - cam.y) * z * 0.45, br = b.r * lerp(1, 0.6, pull);
      if (by < -br || by > H + br) continue;
      const rg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      rg.addColorStop(0, `rgba(255,251,240,${(b.a * (0.5 + 0.5 * bgA)).toFixed(3)})`); rg.addColorStop(1, 'rgba(255,251,240,0)');
      ctx.fillStyle = rg; ctx.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    ctx.textAlign = 'center';
    for (let i = 0; i < EV.length; i++) {
      const a = clamp((t - this.tIn[i]) / 0.6) * bgA;
      if (a <= 0) continue;
      const gx = W / 2 + (AX - EV[i].side * 262 - cam.x) * z * 0.72, gy = FY + (this.c[i] - cam.y) * z * 0.72 + 120;
      if (gy < -200 || gy > H + 300) continue;
      ctx.font = `800 ${Math.round(300 * Math.sqrt(z))}px ${FRA}`;
      ctx.fillStyle = `rgba(123,91,68,${(0.085 * a).toFixed(3)})`;
      ctx.fillText('’' + String(EV[i].Y).slice(2), gx, gy);
    }
    ctx.textAlign = 'left';
    // window light from the upper left
    const lg = ctx.createRadialGradient(140, 380, 0, 140, 380, 1200);
    lg.addColorStop(0, 'rgba(255,249,234,0.42)'); lg.addColorStop(1, 'rgba(255,249,234,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);

    // ---- the axis
    const axX = sx(AX);
    const c0 = this.c[0];
    const qa = outCubic((t - 0.12) / 0.7), qb = outCubic((t - 0.12) / 0.85);
    const topW = lerp(c0, this.yOf(Y0, m), qa);
    const botW = t < 1.2 ? c0 + 1150 * qb : this.yOf(Y1, m);
    const yTop = syw(topW), yBot = syw(botW);
    const visibleW = (yw) => yw >= topW - 1 && yw <= botW + 1;
    // ticks at true years
    const nearestSide = (Y) => { let bi = 0; for (let i = 1; i < EV.length; i++) if (Math.abs(EV[i].Y - Y) < Math.abs(EV[bi].Y - Y)) bi = i; return EV[bi].side; };
    const labelA = 1 - smooth(pull * 2.2);
    for (let Y = Y0; Y <= Y1; Y++) {
      const yw = this.yOf(Y, m), y = syw(yw);
      if (y < -40 || y > H + 40 || !visibleW(yw)) continue;
      const dec = Y % 10 === 0, five = Y % 5 === 0, ev = EV.some((e) => e.Y === Y);
      const sp = this.rhoOf(Y, m) * z;                         // screen px per year here
      const tip = clamp((Math.min(yw - topW, botW - yw) * z) / 60);   // fade in behind the drawing tip
      const a = (dec ? 1 : smooth((sp - 2.5) / 4)) * tip;
      const len = (dec ? 24 : five ? 16 : 10) * zf;
      ctx.strokeStyle = rgb(INKC, (dec ? 0.62 : 0.42) * a); ctx.lineWidth = (dec ? 3 : 2.2) * zf;
      ctx.beginPath(); ctx.moveTo(axX - len, y); ctx.lineTo(axX + len, y); ctx.stroke();
      if (ev || labelA <= 0) continue;
      const la = (dec ? 1 : smooth((sp - 70) / 50)) * labelA * tip * (1 - smooth((y - 1540) / 110));
      if (la <= 0.01) continue;
      const sd = -nearestSide(Y);
      ctx.textAlign = sd > 0 ? 'left' : 'right';
      ctx.font = dec ? `700 26px ${FRA}` : `500 21px ${FRA}`;
      ctx.fillStyle = rgb(dec ? INKC : BROWNC, (dec ? 0.8 : 0.62) * la);
      ctx.fillText(String(Y), axX + sd * (len + 10), y + (dec ? 9 : 7));
    }
    ctx.textAlign = 'left';
    // the line itself; the travelled part in the accent, from the opening up to the bead
    ctx.strokeStyle = 'rgba(123,91,68,0.5)'; ctx.lineWidth = 6 * zf;
    ctx.beginPath(); ctx.moveTo(axX, yTop); ctx.lineTo(axX, yBot); ctx.stroke();
    const Yc = this.counterYear(t);
    const Yfill = t < T_PULL ? Yc : lerp(Yc, 2025, clamp((t - T_PULL) / 0.3));
    const yF0 = syY(1985), yF1 = syY(Math.max(1985, Yfill));
    if (yF1 > yF0 + 0.5) { ctx.strokeStyle = ACC; ctx.lineWidth = 8 * zf; ctx.beginPath(); ctx.moveTo(axX, yF0); ctx.lineTo(axX, yF1); ctx.stroke(); }
    // end caps
    if (qa > 0.98) { ctx.fillStyle = rgb(BROWNC, 0.7); dot(ctx, axX, yTop, 7 * zf); }
    if (t >= 1.2) {
      ctx.fillStyle = rgb(BROWNC, 0.7);
      ctx.beginPath(); ctx.moveTo(axX - 11 * zf, yBot - 4 * zf); ctx.lineTo(axX + 11 * zf, yBot - 4 * zf); ctx.lineTo(axX, yBot + 14 * zf); ctx.fill();
    }
    // break marks: where the warp squeezes time harder than BREAK_K against the true scale
    for (let j = 0; j < EV.length - 1; j++) {
      const Ym = this.breakY[j], kappa = this.linK / this.rhoOf(Ym, m);
      const st = smooth((kappa - BREAK_K) / 0.7) * clamp((t - 0.6) / 0.4);
      if (st <= 0.01) continue;
      const y = syY(Ym);
      if (y < -60 || y > H + 60) continue;
      const hw = 26 * zf * (0.6 + 0.4 * st), gap = 7 * zf * st, sl = 9 * zf;
      ctx.fillStyle = rgb(bandAt(y));
      ctx.beginPath(); ctx.moveTo(axX - hw, y - gap + sl); ctx.lineTo(axX + hw, y - gap - sl); ctx.lineTo(axX + hw, y + gap - sl); ctx.lineTo(axX - hw, y + gap + sl); ctx.fill();
      ctx.strokeStyle = rgb(INKC, 0.78 * st); ctx.lineWidth = 3.4 * zf;
      ctx.beginPath(); ctx.moveTo(axX - hw, y - gap + sl); ctx.lineTo(axX + hw, y - gap - sl); ctx.moveTo(axX - hw, y + gap + sl); ctx.lineTo(axX + hw, y + gap - sl); ctx.stroke();
    }
    // event nodes
    for (let i = 0; i < EV.length; i++) {
      const yw = this.yOf(EV[i].Y, m), y = syw(yw);
      if (y < -80 || y > H + 80 || !visibleW(yw)) continue;
      const pr = (t - this.tReach[i]);
      const r = 15 * zf;
      if (pr > 0) {
        const ring = clamp(pr / 0.55);
        if (ring < 1) { ctx.strokeStyle = rgb(ACCC, 0.55 * (1 - ring)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(axX, y, r + ring * 48, 0, Math.PI * 2); ctx.stroke(); }
      }
      let pop = pr > 0 ? outBack(pr / 0.35, 2.4) : 0;
      const ts = t - (T_SWEEP0 + ((EV[i].Y - 1985) / 40) * (T_SWEEP1 - T_SWEEP0));
      if (ts > 0 && ts < 0.6) {
        pop *= 1 + 0.35 * Math.sin(Math.PI * clamp(ts / 0.3));
        ctx.strokeStyle = rgb(ACCC, 0.5 * (1 - ts / 0.6)); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(axX, y, r + (ts / 0.6) * 34, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = PAPER; dot(ctx, axX, y, r + 1.5);
      ctx.strokeStyle = BROWN; ctx.lineWidth = 4 * zf; ctx.beginPath(); ctx.arc(axX, y, r - 1, 0, Math.PI * 2); ctx.stroke();
      if (pop > 0) {
        ctx.fillStyle = ACC; dot(ctx, axX, y, (r + 2) * pop);
        ctx.fillStyle = PAPER; dot(ctx, axX, y, 5 * zf * pop);
      }
    }
    // the bead (the camera centre on the axis) — the counter reads it
    let beadA = clamp((t - 1.0) / 0.2) * (1 - clamp((t - T_PULL) / 0.3));
    for (let i = 0; i < EV.length; i++) if (t > this.tReach[i]) beadA *= smooth((Math.abs(Yc - EV[i].Y) * this.dens(EV[i].Y) * z - 19) / 6);   // absorbed by the node it lit
    if (beadA > 0) {
      const y = syY(Yc);
      const hg = ctx.createRadialGradient(axX, y, 0, axX, y, 34);
      hg.addColorStop(0, rgb(ACCC, 0.35 * beadA)); hg.addColorStop(1, rgb(ACCC, 0));
      ctx.fillStyle = hg; ctx.fillRect(axX - 34, y - 34, 68, 68);
      ctx.fillStyle = rgb(PAPERC, beadA); dot(ctx, axX, y, 11);
      ctx.fillStyle = rgb(ACCC, beadA); dot(ctx, axX, y, 7.5);
    }
    // the travelling light of the afterglow: forty years at their true pace
    if (t > T_SWEEP0 && t < T_SWEEP1 + 0.3) {
      const ps = clamp((t - T_SWEEP0) / (T_SWEEP1 - T_SWEEP0)), Ys = 1985 + 40 * ps;
      const y = syY(Ys), fa = 1 - clamp((t - T_SWEEP1) / 0.3);
      const hg = ctx.createRadialGradient(axX, y, 0, axX, y, 46);
      hg.addColorStop(0, `rgba(255,248,226,${(0.95 * fa).toFixed(3)})`); hg.addColorStop(1, 'rgba(255,248,226,0)');
      ctx.fillStyle = hg; ctx.fillRect(axX - 46, y - 46, 92, 92);
    }

    // ---- cards (they become chips as the camera pulls back)
    const k = smooth((pull - 0.03) / 0.72);
    for (let i = 0; i < EV.length; i++) {
      const y = syY(EV[i].Y);
      if (y < -700 || y > H + 700) continue;
      this.drawCard(ctx, i, axX, y, k, t);
    }

    // ---- gap pills: the true lengths, at the middle of each gap
    for (let j = 0; j < EV.length - 1; j++) {
      const p = clamp((t - (T_PILL + 0.09 * j)) / 0.42);
      if (p <= 0) continue;
      const gap = EV[j + 1].Y - EV[j].Y, y = syY((EV[j].Y + EV[j + 1].Y) / 2);
      const s = outBack(p, 2.2);
      ctx.save(); ctx.translate(axX, y); ctx.scale(s, s);
      ctx.font = `800 25px ${PRE}`;
      const tw = ctx.measureText(`${gap}년`).width, pw = tw + 30;
      ctx.fillStyle = 'rgba(59,42,32,0.14)'; rr(ctx, -pw / 2, -19 + 4, pw, 38, 19); ctx.fill();
      ctx.fillStyle = PAPER; rr(ctx, -pw / 2, -19, pw, 38, 19); ctx.fill();
      ctx.strokeStyle = ACC; ctx.lineWidth = 2.5; rr(ctx, -pw / 2, -19, pw, 38, 19); ctx.stroke();
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(`${gap}년`, 0, 9);
      ctx.restore();
    }
    ctx.textAlign = 'left';

    // ---- era names in the margin of the overview
    const ea = smooth((t - 7.95) / 0.45);
    if (ea > 0) {
      ctx.font = `700 22px ${PRE}`;
      for (let d = 0; d < 5; d++) {
        const ya = syY(Math.max(Y0, 1980 + 10 * d)), yb = syY(Math.min(Y1, 1990 + 10 * d)), ym = (ya + yb) / 2;
        ctx.save(); ctx.translate(58, ym); ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = rgb(BROWNC, 0.75 * ea); ctx.textAlign = 'center'; ctx.fillText(ERA_NAME[d], 0, 0);
        ctx.restore();
        ctx.strokeStyle = rgb(BROWNC, 0.35 * ea); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(72, ya + 6); ctx.lineTo(72, yb - 6); ctx.stroke();
      }
      ctx.textAlign = 'left';
    }

    // ---- the 40th-anniversary burst from the last node
    const tb = t - this.tReach[4];
    if (tb > 0 && tb < 1.3) {
      const y0 = syY(2025);
      for (const p of this.confetti) {
        const x = axX + Math.cos(p.a) * p.v * tb * 0.9, y = y0 + Math.sin(p.a) * p.v * tb * 0.9 + 820 * tb * tb;
        ctx.save(); ctx.translate(x, y); ctx.rotate(p.w * tb);
        ctx.globalAlpha = 1 - clamp((tb - 0.8) / 0.5);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s * 0.3, p.s, p.s * 0.6);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    // ---- foreground flour dust (parallax 1.35)
    for (const f of this.flour) {
      const fx = W / 2 + (f.x - W / 2 + Math.sin(t * 0.8 + f.ph) * 14 - (cam.x - AX)) * z * 1.35;
      const fy = FY + (f.y - t * 26 - cam.y) * z * 1.35;
      if (fy < -10 || fy > H + 10) continue;
      ctx.fillStyle = `rgba(255,252,244,${(f.a * (0.4 + 0.6 * bgA)).toFixed(3)})`;
      dot(ctx, fx, fy, f.r * Math.sqrt(z));
    }

    // ---- header fade (the band colour itself, so the world melts into the page) and the caption scrim
    const hg = ctx.createLinearGradient(0, 0, 0, 540);
    for (const [s, a] of [[0, 1], [200, 1], [404, 1], [440, 0.86], [476, 0.5], [512, 0.16], [540, 0]]) hg.addColorStop(s / 540, rgb(bandAt(s), a));
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, 540);
    const sg = ctx.createLinearGradient(0, 1560, 0, H);
    sg.addColorStop(0, 'rgba(46,33,25,0)'); sg.addColorStop(0.38, 'rgba(46,33,25,0.5)'); sg.addColorStop(0.75, 'rgba(46,33,25,0.84)'); sg.addColorStop(1, 'rgba(46,33,25,0.92)');
    ctx.fillStyle = sg; ctx.fillRect(0, 1560, W, H - 1560);

    this.drawHeader(ctx, t, Yc);

    // soft vignette
    const vg = ctx.createRadialGradient(540, 980, 620, 540, 980, 1300);
    vg.addColorStop(0, 'rgba(90,60,40,0)'); vg.addColorStop(1, 'rgba(90,60,40,0.16)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  },

  drawCard(ctx, i, axX, sy, k, t) {
    const e = EV[i], M = this.meas[i], side = e.side;
    const p = clamp((t - this.tIn[i]) / 0.62);
    if (p <= 0) return;
    const exitF = clamp((700 - sy) / 230) * (1 - smooth(k * 2.5));
    if (exitF >= 1) return;
    // card → chip is one continuous layout, measured as u = distance from the axis-side edge (mirrored on the left):
    //   1. the picture shrinks into a circle on the axis side (kb), the text follows right under it, shrinking and
    //      shifting outward — it never crosses the picture; 2. once it clears the circle it rises beside it (vy).
    //   The box always wraps its content, so every in-between frame is a finished card.
    const kb = smooth(k / 0.45), vy = smooth((k - 0.4) / 0.45), ks = 1 - smooth(k / 0.3);
    const pu = lerp(14, 6, kb), pv = lerp(14, 6, kb), pw = lerp(CARD_W - 28, CHIP_D, kb), ph = lerp(270, CHIP_D, kb), prr = lerp(18, CHIP_D / 2, kb);
    const pad = lerp(14, 6, kb);
    const ySize = lerp(56, 30, kb), tSize = lerp(M.titleSize, 22, kb);
    const ut = lerp(28, 6 + CHIP_D + 18, kb);
    const yBelow = pv + ph + 26 + 0.72 * ySize, tBelow = yBelow + lerp(48, 37, kb);
    const vY = lerp(yBelow, 52, vy), vT = lerp(tBelow, 89, vy), vS = vT + 40;
    ctx.font = `700 ${ySize.toFixed(2)}px ${FRA}`; const yw = ctx.measureText(String(e.Y)).width;
    ctx.font = `800 ${tSize.toFixed(2)}px ${PRE}`; const tw = ctx.measureText(e.title).width;
    ctx.font = `500 24px ${PRE}`; const sw = ctx.measureText(e.sub).width;
    const w = Math.max(pu + pw + pad, ut + Math.max(yw, tw, sw * ks) + 26);
    const h = Math.max(pv + ph + pad, lerp(vT + 27, vS + 30, ks));
    const gapX = lerp(64, 44, kb);
    const bx = side > 0 ? axX + gapX : axX - gapX - w;
    const enter = outCubic(p) - ease.inCubic(exitF);
    const slide = side * (1 - enter) * 640;
    // connector from the node
    const ca = clamp((p - 0.35) / 0.4);
    if (ca > 0) {
      const xa = axX + side * 18, xb = side > 0 ? bx + slide : bx + w + slide;
      ctx.strokeStyle = rgb(BROWNC, 0.55); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(xa, sy); ctx.lineTo(lerp(xa, xb, ca), sy); ctx.stroke();
      ctx.fillStyle = BROWN; dot(ctx, lerp(xa, xb, ca), sy, 4);
    }
    ctx.save();
    ctx.translate(bx + w / 2 + slide, sy);
    ctx.rotate(side * (1 - enter) * 0.09);
    ctx.translate(-w / 2, -h / 2);
    ctx.globalAlpha = clamp(p * 3) * (1 - exitF);
    const A = ctx.globalAlpha;
    // card body
    const R = Math.min(h / 2, lerp(28, CHIP_H / 2, kb));
    ctx.fillStyle = 'rgba(59,42,32,0.09)'; rr(ctx, 0, 16, w, h, R); ctx.fill();
    ctx.fillStyle = 'rgba(59,42,32,0.07)'; rr(ctx, 0, 5, w, h, R); ctx.fill();
    ctx.fillStyle = PAPER; rr(ctx, 0, 0, w, h, R); ctx.fill();
    ctx.strokeStyle = LINE; ctx.lineWidth = 1.5; rr(ctx, 0.75, 0.75, w - 1.5, h - 1.5, R); ctx.stroke();
    // picture: a rounded rect in the card, a circle on the axis side of the chip; the shop stays in frame
    const px = side > 0 ? pu : w - pu - pw;
    ctx.save();
    rr(ctx, px, pv, pw, ph, prr); ctx.clip();
    const SC = 0.47, sc = lerp(1, SC, kb);
    const fx = SHOP[i].cx, fyy = SHOP[i].floors === 2 ? 132 : 160;
    const Fx = px + lerp(fx, pw / 2, kb), Fy = pv + lerp(fyy, ph / 2, kb);
    ctx.translate(Fx - fx * sc, Fy - fyy * sc); ctx.scale(sc, sc);
    drawScene(ctx, i, t, t - this.tReach[i], (sy - FY) * 0.04);
    ctx.restore();
    ctx.strokeStyle = 'rgba(59,42,32,0.12)'; ctx.lineWidth = 1.5; rr(ctx, px, pv, pw, ph, prr); ctx.stroke();
    // text: aligned to the axis side (left-aligned on the right, right-aligned on the left), present in every frame
    const rise = (d) => { const q = outCubic((p - d) / 0.5); return [q, (1 - q) * 22]; };
    const [qy, dy1] = rise(0.22), [qt, dy2] = rise(0.32), [qs, dy3] = rise(0.42);
    ctx.textAlign = side > 0 ? 'left' : 'right';
    const tx = side > 0 ? ut : w - ut;
    ctx.globalAlpha = qy * A;
    ctx.font = `700 ${ySize.toFixed(2)}px ${FRA}`; ctx.fillStyle = ACC; ctx.fillText(String(e.Y), tx, vY + dy1);
    ctx.globalAlpha = qt * A;
    ctx.font = `800 ${tSize.toFixed(2)}px ${PRE}`; ctx.fillStyle = INK; ctx.fillText(e.title, tx, vT + dy2);
    if (ks > 0) {
      ctx.globalAlpha = qs * A * ks;
      ctx.font = `500 24px ${PRE}`; ctx.fillStyle = MUTED; ctx.fillText(e.sub, tx, vS + dy3);
    }
    ctx.restore();
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  },

  drawHeader(ctx, t, Yc) {
    // eyebrow: loaf mark + shop name
    const ea = outCubic((t - 0.05) / 0.5);
    ctx.globalAlpha = ea;
    const ew = this.eyebrowW + 50, ex = W / 2 - ew / 2;
    loafIcon(ctx, ex + 17, 120 + (1 - ea) * 10, 1);
    ctx.font = `700 31px ${PRE}`; ctx.fillStyle = BROWN; ctx.textAlign = 'left';
    ctx.fillText('모퉁이 빵집', ex + 50, 130 + (1 - ea) * 10);
    ctx.globalAlpha = 1;

    // the counter: odometer columns; every column rolls by its own position p (continuous)
    const cw = this.cellW, x0 = W / 2 - (cw * 4) / 2, base = 336, step = 230;
    const pos = (Y) => {
      const out = [];
      for (let c = 0; c < 4; c++) {
        const u = Math.pow(10, 3 - c);           // column unit: 1000, 100, 10, 1
        const lower = ((Y % u) + u) % u;         // the part below this column
        out.push(c === 3 ? Y % 10 : Math.floor(Y / u) % 10 + clamp(lower - (u - 1)));
      }
      return out;
    };
    const P = pos(Yc);
    const eps = 1 / 120;
    const Pa = pos(this.counterYear(Math.max(0, t - eps))), Pb = pos(this.counterYear(Math.min(D, t + eps)));
    ctx.font = `700 214px ${FRA}`; ctx.textAlign = 'center'; ctx.fillStyle = INK;
    for (let c = 0; c < 4; c++) {
      const cx = x0 + cw * (c + 0.5);
      const intro = outBack((t - 0.1 - c * 0.07) / 0.6, 1.2);
      const exit = ease.inCubic(clamp((t - T_40 - c * 0.045) / 0.26));
      if (exit >= 1) continue;
      const shift = (1 - intro) * step * 0.9 - exit * step;
      let v = ((P[c] - Pa[c]) + (Pb[c] - P[c])) / 2;   // positions per (1/120 s)
      if (v < -5) v += 10; if (v > 5) v -= 10;           // wrapped 9 → 0
      const perFrame = Math.abs(v) * 4 * step;           // px per 1/30 s
      ctx.save();
      ctx.beginPath(); ctx.rect(cx - cw / 2, base - 182, cw, 214); ctx.clip();
      const d0 = Math.floor(P[c]), f = P[c] - d0;
      const len = Math.min(perFrame * 0.5, 150);           // a 180° shutter: blur over half a frame's travel
      const N = len > 4 ? Math.min(16, Math.ceil(len / 3)) : 1;
      const aS = N > 1 ? 1 - Math.pow(0.1, 1 / N) : 1;     // N overlapping copies add up to 90% where all overlap
      for (let j = 0; j < N; j++) {
        const back = N > 1 ? (j / (N - 1) - 0.5) * len * Math.sign(v) : 0;
        ctx.globalAlpha = aS * clamp(intro * 3);
        for (const [dd, off] of [[d0, -f], [d0 + 1, 1 - f]]) {
          const y = base + off * step + shift + back;
          if (y < base - 182 - 30 || y > base + 232 + 30) continue;
          ctx.fillText(String(((dd % 10) + 10) % 10), cx, y);
        }
      }
      ctx.restore();
    }
    // the climax: the year rolls away and the span rolls in
    const q = clamp((t - T_40 - 0.16) / 0.6);
    if (q > 0) {
      const qq = outBack(q, 1.5);
      ctx.save();
      ctx.beginPath(); ctx.rect(0, base - 200, W, 250); ctx.clip();
      ctx.font = `700 214px ${FRA}`; const w40 = ctx.measureText('40').width;
      ctx.font = `800 100px ${PRE}`; const wN = ctx.measureText('년').width;
      const tot = w40 + 14 + wN, lx = W / 2 - tot / 2, y = base + (1 - qq) * step;
      ctx.globalAlpha = clamp(q * 3);
      ctx.textAlign = 'left';
      ctx.font = `700 214px ${FRA}`; ctx.fillStyle = ACC; ctx.fillText('40', lx, y);
      ctx.font = `800 100px ${PRE}`; ctx.fillStyle = INK; ctx.fillText('년', lx + w40 + 14, y);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    // sub line: the decade the counter is in, rolling; then the span
    const items = this.eraTimes;
    let n = 0;
    while (n + 1 < items.length && t >= items[n + 1][0]) n++;
    const pr = n > 0 ? outCubic((t - items[n][0]) / 0.3) : 1;
    const sa = outCubic((t - 0.3) / 0.5);
    ctx.save();
    ctx.beginPath(); ctx.rect(200, 360, 680, 46); ctx.clip();
    ctx.font = `600 30px ${PRE}`; ctx.fillStyle = MUTED; ctx.textAlign = 'center';
    const lineY = 394;
    const drawSub = (s, y, a) => {
      ctx.globalAlpha = a * sa;
      ctx.fillText(s, W / 2, y);
      const tw = ctx.measureText(s).width;
      ctx.strokeStyle = rgb(BROWNC, 0.4); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W / 2 - tw / 2 - 18, y - 10); ctx.lineTo(W / 2 - tw / 2 - 52, y - 10);
      ctx.moveTo(W / 2 + tw / 2 + 18, y - 10); ctx.lineTo(W / 2 + tw / 2 + 52, y - 10); ctx.stroke();
    };
    if (pr < 1) drawSub(items[n - 1][1], lineY - pr * 40, 1 - pr);
    drawSub(items[n][1], lineY + (1 - pr) * 40, pr);
    ctx.restore();
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  },
});
