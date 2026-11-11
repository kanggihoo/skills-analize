/*
 * 124 · 네모, 무게를 싣다 — a mascot made of four simple shapes (rounded-square body, circle eyes, pill limbs,
 * a two-segment antenna) acts out one short gag on a title lockup, and every move is one principle of animation.
 *
 *   0.35  drops onto "움" — stretch on the fall, squash on contact, sx·sy = 1 in the readout     찌그러짐과 늘어남
 *   1.36  cocks back before each hop, the letter under it dips and springs back               예비 동작
 *   2.20  two hops along "움직임엔", frame dots drawn on the arc (bunched at the apex)            호(아크)
 *   3.00  spotlight + silhouette card while it winds up on "엔"                                연출
 *   3.96  the big leap: the fastest frames are drawn as a swept smear, heavy landing on "무게"   스미어 프레임
 *   4.76  antenna (two springs, two rates) and the whole line keep moving after the body stops  따라가는 움직임
 *   5.55  blinks, shakes the dust off, hops down (multiples on the fast drop)                   부수 동작
 *   6.62  pushes the stray last word "있다" into the flush-right slot, spacing chart below      천천히 시작, 천천히 멈춤
 *   8.40  recap card
 *
 * Everything is a closed-form function of t: the body path is a list of segments (ballistic arcs, a warped
 * zip-hang-drop arc, ground spans), springs are summed impulse/step responses of event times decided in setup,
 * smears and multiples re-evaluate the same pose function at t − Δ, so a seek lands on the same picture.
 * Canvas 2D only, no library.
 */
import { defineDemo, clamp, lerp, ease, smooth, track, rand } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 10, FPS = 30, TAU = Math.PI * 2;
const SW = 1080, SH = 1920;

// palette: animation paper on a light table, ink, one accent (the mascot and the word it weighs down),
// non-photo-blue pencil for every guide drawn "by the animator"
const DESK = '#26211d', PAPER = '#f6f1e6', INK = '#201b27', SUB = '#6c6457', FAINT = '#d9cfbe';
const ACC = '#ff5a2c', ACC_L = '#ff8d60', ACC_D = '#d3401a';
const BLUE = '#3b70d0', SHADE = '#e3d8c4', FLOORC = '#ede5d5', PUFF = '#f3eadb', PUFF_E = '#c8b89d';
const KR = `"${FONTS.pretendard.family}"`, MONO = `"${FONTS.jetbrainsMono.family}"`;

// sheet and type grid
const MX = 92, MR = 988;                      // left / right type margins (the alignment guides)
const SHEET_L = 18, SHEET_R = 1062, SHEET_B = 1676;
const FLOOR = 1392;
const LINES = [
  { str: '움직임엔', size: 120, base: 712, align: 'left', acc: [] },
  { str: '무게가', size: 184, base: 1100, align: 'right', acc: [0, 1] },
  { str: '있다', size: 184, base: FLOOR, align: 'word', acc: [] },
];
const TRACK = -0.03;                          // em, big type tracked in a little

// mascot geometry (stage px)
const BW = 124, BH = 112, BR = 34, FEET = 13, OUTW = 3.6;
const ANT1 = 34, ANT2 = 34, BALL = 11;
const ARM_L = 44, ARM_W = 17, FOOT_W = 36, FOOT_H = 15;
const REACH = 30;                             // gap between body and word while pushing (the arm)
const SMEAR_V = 1900, MULTI_V = 2600;         // feet speed (px/s) above which a frame is drawn as a smear / multiples

// beats (s)
const T = {
  drop: 0.48, land0: 0.90,
  crA: 1.40, holdA: 1.76, upA: 1.84, landA: 2.24,
  crB: 2.36, holdB: 2.52, upB: 2.58, landB: 2.90,
  crBig: 3.30, holdBig: 3.78, upBig: 3.98, landBig: 4.40,
  shake: 5.62,
  crD: 6.00, holdD: 6.11, upD: 6.16, landD: 6.62,
  push0: 6.98, push1: 8.20,
  upE: 8.50, landE: 8.80,
};
const BLINKS = [1.22, 3.08, 5.58, 5.80, 9.30];
// principle cards: switch times (card i shows from CAP[i]); the last one is the recap
const CAP = [0.35, 1.36, 2.20, 3.00, 3.96, 4.76, 5.55, 6.62, 8.40];
const PR = [
  { en: 'SQUASH & STRETCH', ko: '찌그러짐과 늘어남', d: '모양이 바뀌어도 부피는 그대로', chip: '찌그러짐·늘어남' },
  { en: 'ANTICIPATION', ko: '예비 동작', d: '뛰기 전에 먼저 반대로 웅크린다', chip: '예비 동작' },
  { en: 'ARCS', ko: '호(아크)', d: '뛰는 몸은 곡선을 따라 움직인다', chip: '호(아크)' },
  { en: 'STAGING', ko: '연출', d: '실루엣만 봐도 다음 동작이 읽힌다', chip: '연출' },
  { en: 'SMEAR FRAME', ko: '스미어 프레임', d: '가장 빠른 프레임은 길게 늘려 그린다', chip: '스미어' },
  { en: 'FOLLOW-THROUGH', ko: '따라가는 움직임', d: '몸이 멈춰도 더듬이는 늦게 멈춘다', chip: '따라가는 움직임' },
  { en: 'SECONDARY ACTION', ko: '부수 동작', d: '깜빡임과 먼지가 연기를 거든다', chip: '부수 동작' },
  { en: 'SLOW IN · SLOW OUT', ko: '천천히 시작, 천천히 멈춤', d: '양 끝으로 갈수록 간격이 좁아진다', chip: '느린 시작·멈춤' },
];

// ---------------------------------------------------------------- closed-form springs
function spring(f, z) { const w = TAU * f, s = Math.sqrt(1 - z * z); return { zw: z * w, wd: w * s, k: z / s }; }
/** impulse response: 0 at the hit, first lobe positive, decays */
const imp = (x, S) => (x <= 0 ? 0 : Math.exp(-S.zw * x) * Math.sin(S.wd * x));
/** step response: 0 → 1 with overshoot */
const stp = (x, S) => (x <= 0 ? 0 : 1 - Math.exp(-S.zw * x) * (Math.cos(S.wd * x) + S.k * Math.sin(S.wd * x)));
/** a hit at full strength on its first frame that rings out (contact squash) */
const dcos = (x, f, lam) => (x < 0 ? 0 : Math.exp(-lam * x) * Math.cos(TAU * f * x));
const SP_LET = spring(2.7, 0.2), SP_LOAD = spring(2.7, 0.5);       // letters as sprung platforms
const SP_A1 = spring(1.7, 0.08), SP_A2 = spring(1.2, 0.07);       // antenna: stalk, then tip (slower → overlap)
const SP_LEAN = spring(2.2, 0.35), SP_ALEN = spring(3.2, 0.3);

// ---------------------------------------------------------------- state built in setup
let G = [];        // glyphs { i, ch, line, size, x, cx, l, r, top, base, acc }
let LC = [];       // letter contacts { g, on, off, ion, ioff, w }
let RP = [];       // ripples on neighbouring letters { g, t, a }
let SEG = [];      // body path segments
let AEV = [];      // antenna events { t, dvx, whip }
let DUST = [];     // puffs { t, x, y, ps: [{ vx, vy, r, life }] }
let GHOST = [];    // frame times at which the big leap was drawn as a smear
let WORD = null;   // the stray last word { w, x0, x1, top }
let RR = [];       // rounded-square outline (local, centred)

// ---------------------------------------------------------------- the stray last word ("있다")
const wordIn = track([[0.30, -720], [0.86, 0, (p) => ease.outBack(p, 1.25)]]);
function wordX(t) {
  if (t < T.push0) return WORD.x0 + wordIn(t);
  return lerp(WORD.x0, WORD.x1, ease.inOutCubic(clamp((t - T.push0) / (T.push1 - T.push0))));
}
function wordTilt(t) {     // radians about its bottom-right corner (left side lifted): it skidded in and tripped
  if (t < 0.86) return 0.16 * smooth((t - 0.62) / 0.24);
  const settle = 0.075 + 0.085 * dcos(t - 0.86, 2.4, 5.5);
  return settle * (1 - smooth((t - T.push0) / 0.45));
}
const pushX = (t) => wordX(t) - REACH - BW / 2;
const pushV = (t) => (pushX(t + 1 / 1200) - pushX(t - 1 / 1200)) * 600;

// ---------------------------------------------------------------- letters as sprung platforms
function dip(gi, t) {
  let y = 0;
  for (const c of LC) if (c.g === gi) {
    y += c.w * 10 * (stp(t - c.on, SP_LOAD) - stp(t - c.off, SP_LOAD)) + c.ion * imp(t - c.on, SP_LET) + c.ioff * imp(t - c.off, SP_LET);
  }
  for (const r of RP) if (r.g === gi) y += r.a * imp(t - r.t, SP_LET);
  return y;
}
/** letter deformation: sink dy and squash k about its baseline (top of the ink box follows both) */
function glyphState(g, t) {
  const dy = g.line === 2 ? 0 : dip(g.i, t);
  const k = clamp(dy / 380, -0.07, 0.2);
  return { dy, k, top: g.top + dy + k * (g.base - g.top) };
}
function supPt(sup, t) {
  if (sup === 'push') return { x: pushX(t), y: FLOOR };
  let x = 0, y = 0;
  for (const [gi, w] of sup) { x += w * G[gi].cx; y += w * glyphState(G[gi], t).top; }
  return { x, y };
}

// ---------------------------------------------------------------- body path
function airP(s, t) {
  const u = clamp((t - s.t0) / (s.t1 - s.t0));
  if (s.fall) return [lerp(s.x0, s.x1, u), s.y0 + (s.y1 - s.y0) * u * u];
  let p = u;
  if (s.warp) p = u + s.warp * Math.sin(TAU * u) / TAU;      // zip out, hang at the top, drop
  if (s.pw) p = Math.pow(u, s.pw);
  return [lerp(s.x0, s.x1, p), lerp(s.y0, s.y1, p) - 4 * s.h * p * (1 - p)];
}
function airV(s, t) {
  const h = 1 / 900, a = Math.max(s.t0, t - h), b = Math.min(s.t1, t + h);
  const A = airP(s, a), B = airP(s, b);
  return [(B[0] - A[0]) / (b - a), (B[1] - A[1]) / (b - a)];
}
function segAt(t) { for (const s of SEG) if (t < s.t1) return s; return SEG[SEG.length - 1]; }

const DIR = track([[0, 0], [0.98, 0], [1.2, 1], [4.55, 1], [4.8, 0], [5.92, 0], [6.02, -1], [6.62, -1], [6.74, 1], [8.3, 1], [8.48, 0]]);
const LOOKX = track([[0, 0], [1.05, 0], [1.3, 0.9], [3.05, 0.9], [3.2, 0.75], [4.4, 0.3], [4.62, 0], [5.92, 0], [6.04, -0.8], [6.62, -0.6], [6.76, 1], [8.3, 1], [8.48, 0]]);
const LOOKY = track([[0, 0], [1.05, 0], [1.3, 0.15], [3.05, 0.15], [3.2, 0.9], [4.4, 0.9], [4.62, -0.2], [5.4, 0], [5.92, 0], [6.04, 0.9], [6.62, 0.6], [6.76, 0.1], [8.3, 0.1], [8.48, 0]]);

/** everything about the mascot at time t (pure) */
function pose(t) {
  if (t < SEG[0].t0) return null;
  const s = segAt(t);
  const P = { t, s, air: s.k === 'a' };
  if (P.air) { [P.fx, P.fy] = airP(s, t); [P.vx, P.vy] = airV(s, t); }
  else { const q = supPt(s.sup, t); P.fx = q.x; P.fy = q.y; P.vx = s.sup === 'push' ? pushV(t) : 0; P.vy = 0; }
  P.sp = Math.hypot(P.vx, P.vy);
  const dir = DIR(t);
  let rot = 0, armL = 16, armR = 16, sx = 1, sy = 1, stretch = 1, phi = 0;
  let feetSpread = 25, feetLift = 0, feetSwing = 0, stepA = 0, stepB = 0;
  if (P.air) {
    stretch = 1 + 0.5 * clamp((P.sp - 260) / 2500);
    phi = Math.atan2(P.vy, P.vx);
    rot = clamp(P.vx / 2400, -1, 1) * 0.2;
    const up = clamp(-P.vy / 1400, -1, 1);
    armL = armR = 112 + 40 * up;
    feetSpread = 17; feetLift = 9; feetSwing = clamp(-P.vx / 2000, -1, 1) * 0.5;
  } else {
    const tl = t - s.t0;
    const land = s.land * dcos(tl, 3.1, 7.5);
    const c = s.cr ? s.cr[2] * smooth((t - s.cr[0]) / (s.cr[1] - s.cr[0])) : 0;
    const cf = s.cr ? c / s.cr[2] : 0;
    sy = 1 - land - c;
    rot = -s.go * 0.34 * c + s.come * 0.16 * imp(tl, SP_LEAN);
    const swing = (s.armIn - 16) * dcos(tl, 1.7, 6);
    armL = armR = 16 + swing;
    if (s.go) { const back = s.go > 0 ? 0 : 1; if (back === 0) { armL += 96 * cf; armR -= 40 * cf; } else { armR += 96 * cf; armL -= 40 * cf; } }
    feetSpread = 25 + 9 * cf;
    if (s.sup === 'push') {
      // wind-up (lean back), lean into the word, push, straighten after the click
      const into = smooth((t - 6.84) / 0.16), out = smooth((t - T.push1 - 0.04) / 0.22);
      const lean = -0.09 * smooth((t - 6.66) / 0.16) * (1 - into) + 0.21 * into * (1 - out) - 0.05 * imp(t - T.push1 - 0.04, SP_LEAN) * out;
      const tremble = 0.012 * Math.sin(TAU * 13 * t) * into * (1 - out);
      rot = lean + tremble + s.come * 0.14 * imp(tl, SP_LEAN) * (1 - into);
      sy *= 1 + 0.06 * into * (1 - out);
      const reach = into * (1 - out);
      armR = lerp(armR, 92, reach); armL = lerp(armL, 36, reach);
      const dist = pushX(t) - pushX(T.push0);
      const ph = TAU * dist / 58;
      stepA = Math.sin(ph) * reach; stepB = -stepA;
      feetLift = 0;
    }
    if (t > T.shake && t < T.shake + 0.6) rot += 0.15 * Math.exp(-3.4 * (t - T.shake)) * Math.sin(TAU * 5.5 * (t - T.shake)) * (1 - smooth((t - T.shake - 0.4) / 0.2));
    sy = clamp(sy, 0.5, 1.35);
    sx = 1 / sy;                                    // volume preserved: sx · sy = 1
  }
  P.rot = rot; P.dir = dir; P.sx = sx; P.sy = sy; P.stretch = stretch; P.phi = phi;
  // body matrix M (local → world, no translation) and centre C
  let M;
  if (P.air) {
    const A = mul(rotM(phi), mul(scaleM(stretch, 1 / stretch), rotM(-phi)));
    M = mul(A, rotM(rot));
    P.C = [P.fx, P.fy - FEET - BH / 2];
  } else {
    M = mul(rotM(rot), scaleM(sx, sy));
    const off = apply(rotM(rot), [0, -(FEET + BH * sy / 2)]);
    P.C = [P.fx + off[0], P.fy + off[1]];
  }
  P.M = M;
  // limbs
  P.arms = [armL, armR];
  P.feet = { spread: feetSpread, lift: feetLift, swing: feetSwing, a: stepA, b: stepB };
  // face
  let blink = 0;
  for (const b of BLINKS) { const u = (t - b) / 0.16; if (u > 0 && u < 1) blink = Math.max(blink, Math.sin(Math.PI * u)); }
  P.eye = { dx: dir * 10, lx: LOOKX(t), ly: LOOKY(t), open: 1 - blink };
  P.mouth = t > T.upBig - 0.02 && t < T.landBig + 0.55 ? 'o' : t > 6.86 && t < T.push1 + 0.05 ? 'flat' : t > 8.5 ? 'grin' : 'smile';
  // antenna (closed-form springs driven by the body's velocity changes)
  let a1 = 0.035 * Math.sin(TAU * 0.6 * t), a2 = 0.03 * Math.sin(TAU * 0.6 * t - 0.8), alen = 1;
  for (const e of AEV) {
    const x = t - e.t;
    if (x <= 0) continue;
    a1 += -6.2e-4 * e.dvx * stp(x, SP_A1) - 2.2e-4 * e.dvx * imp(x, SP_A1) + e.whip * imp(x, SP_A1);
    const x2 = x - 0.05;
    a2 += -3.2e-4 * e.dvx * stp(x2, SP_A2) - 1.6e-4 * e.dvx * imp(x2, SP_A2) + 0.8 * e.whip * imp(x2, SP_A2);
    if (e.sq) alen -= e.sq * imp(x, SP_ALEN);
  }
  if (t > T.shake) { const x = t - T.shake - 0.05; if (x > 0) { const w = Math.exp(-3 * x) * Math.sin(TAU * 5.5 * x); a1 -= 0.5 * w; a2 -= 0.4 * Math.exp(-3 * x) * Math.sin(TAU * 5.5 * x - 0.9); } }
  P.ant = { a1, a2, len: clamp(alen, 0.7, 1.15) };
  return P;
}

// ---------------------------------------------------------------- 2×2 matrices [a b c d]: x' = a x + c y, y' = b x + d y
const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3]];
const rotM = (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, s, -s, c]; };
const scaleM = (x, y) => [x, 0, 0, y];
const apply = (M, p) => [M[0] * p[0] + M[2] * p[1], M[1] * p[0] + M[3] * p[1]];

function bodyPts(P, q = 1) {
  const out = new Array(RR.length);
  for (let i = 0; i < RR.length; i++) {
    const w = apply(P.M, RR[i]);
    out[i] = [P.C[0] + w[0] * q, P.C[1] + w[1] * q];
  }
  return out;
}
function polyPath(ctx, pts) { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); }
function pill(ctx, x, y, len, w, a) {   // pill from (x, y) along angle a (radians, 0 = +x)
  const c = Math.cos(a), s = Math.sin(a), r = w / 2;
  ctx.moveTo(x - s * r, y + c * r);
  ctx.arc(x, y, r, a + Math.PI / 2, a + 1.5 * Math.PI);
  ctx.arc(x + c * len, y + s * len, r, a - Math.PI / 2, a + Math.PI / 2);
}

// ---------------------------------------------------------------- mascot drawing
function antennaPts(P) {
  const base = P.C.slice(); const top = apply(P.M, [0, -BH / 2 + 6]); base[0] += top[0]; base[1] += top[1];
  const a1 = P.rot + P.ant.a1, a2 = a1 + P.ant.a2, L = P.ant.len;
  const p1 = [base[0] + Math.sin(a1) * ANT1 * L, base[1] - Math.cos(a1) * ANT1 * L];
  const p2 = [p1[0] + Math.sin(a2) * ANT2 * L, p1[1] - Math.cos(a2) * ANT2 * L];
  return [base, p1, p2];
}
function drawLimbs(ctx, P, col) {
  ctx.fillStyle = col;
  // antenna stalk
  const [b, p1, p2] = antennaPts(P);
  ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(b[0], b[1]);
  ctx.quadraticCurveTo(2 * p1[0] - (b[0] + p2[0]) / 2, 2 * p1[1] - (b[1] + p2[1]) / 2, p2[0], p2[1]);
  ctx.stroke();
  ctx.lineCap = 'butt';
  // arms (behind the body): angle from straight down, outward positive
  ctx.beginPath();
  for (const side of [-1, 1]) {
    const sh = apply(P.M, [side * (BW / 2 - 12), 8]);
    const deg = (side < 0 ? P.arms[0] : P.arms[1]) * Math.PI / 180;
    const a = Math.atan2(Math.cos(deg), side * Math.sin(deg));
    pill(ctx, P.C[0] + sh[0], P.C[1] + sh[1], ARM_L, ARM_W, a);
  }
  ctx.fill();
  // feet: two pills under the body
  const f = P.feet, ob = apply(P.M, [0, BH / 2]), bot = P.air ? [P.C[0] + ob[0], P.C[1] + ob[1] + FEET] : [P.fx, P.fy];
  ctx.beginPath();
  for (const side of [-1, 1]) {
    const step = side < 0 ? f.a : f.b;
    const x = bot[0] + side * f.spread + step * 9, y = bot[1] - FOOT_H / 2 - f.lift - Math.max(0, step) * 4 + (P.air ? -2 : 0);
    const a = f.swing * side * 0.2 + f.swing;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.roundRect(-FOOT_W / 2 + side * 3, -FOOT_H / 2, FOOT_W, FOOT_H, FOOT_H / 2);
    ctx.restore();
  }
  ctx.fill();
}
function drawBall(ctx, P, col, fill) {
  const p2 = antennaPts(P)[2];
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p2[0], p2[1], BALL + OUTW, 0, TAU); ctx.fill();
  if (fill) {
    ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(p2[0], p2[1], BALL, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.arc(p2[0] - 4, p2[1] - 4, 3.2, 0, TAU); ctx.fill();
  }
}
function inkPass(ctx, pts, col) {
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = OUTW * 2; ctx.lineJoin = 'round';
  ctx.beginPath(); polyPath(ctx, pts); ctx.closePath(); ctx.stroke(); ctx.fill();
  ctx.lineJoin = 'miter';
}
function colorFace(ctx, P, face = true) {
  // body fill in local coordinates (the gradient and the face squash with the body)
  ctx.save();
  ctx.setTransform(...camM(P.M, P.C));
  const g = ctx.createLinearGradient(0, -BH / 2, 0, BH / 2);
  g.addColorStop(0, ACC_L); g.addColorStop(0.42, ACC); g.addColorStop(1, ACC_D);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(-BW / 2, -BH / 2, BW, BH, BR); ctx.fill();
  // highlight streak
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.beginPath(); ctx.roundRect(-BW / 2 + 14, -BH / 2 + 12, 30, 10, 5); ctx.fill();
  ctx.beginPath(); ctx.arc(-BW / 2 + 52, -BH / 2 + 17, 4.5, 0, TAU); ctx.fill();
  if (face) {
    const e = P.eye;
    for (const side of [-1, 1]) {
      const ex = side * 23 + e.dx, ey = -12;
      if (e.open > 0.18) {
        ctx.fillStyle = '#fffaf0';
        ctx.beginPath(); ctx.ellipse(ex, ey, 17, 17 * e.open, 0, 0, TAU); ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, 17, 17 * e.open, 0, 0, TAU); ctx.clip();
        ctx.fillStyle = INK;
        ctx.beginPath(); ctx.arc(ex + e.lx * 6, ey + e.ly * 6, 9.5, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + e.lx * 6 - 3, ey + e.ly * 6 - 3.5, 3, 0, TAU); ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(ex - 15, ey - 2.5, 30, 5, 2.5); ctx.fill();
      }
    }
    // mouth
    const mx = e.dx * 1.1, my = 18;
    ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    ctx.beginPath();
    if (P.mouth === 'o') { ctx.ellipse(mx, my + 3, 7, 9, 0, 0, TAU); ctx.fill(); }
    else if (P.mouth === 'flat') { ctx.moveTo(mx - 9, my + 2); ctx.lineTo(mx + 9, my + 1); ctx.stroke(); }
    else if (P.mouth === 'grin') { ctx.moveTo(mx - 12, my - 2); ctx.quadraticCurveTo(mx, my + 14, mx + 12, my - 2); ctx.closePath(); ctx.fill(); }
    else { ctx.moveTo(mx - 8, my); ctx.quadraticCurveTo(mx, my + 8, mx + 8, my); ctx.stroke(); }
    ctx.lineCap = 'butt';
    // cheeks
    ctx.fillStyle = 'rgba(255,200,170,0.55)';
    ctx.beginPath(); ctx.ellipse(-38 + e.dx, 10, 9, 5, 0, 0, TAU); ctx.ellipse(38 + e.dx, 10, 9, 5, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
// the world camera (set per frame) composed with a local body matrix
let CAM = [1, 0, 0, 1, 0, 0];
function camM(M, C) {
  const [a, b, c, d, e, f] = CAM;
  return [a * M[0] + c * M[1], b * M[0] + d * M[1], a * M[2] + c * M[3], b * M[2] + d * M[3], a * C[0] + c * C[1] + e, b * C[0] + d * C[1] + f];
}

function drawMascot(ctx, P, mode = 'full') {
  if (mode === 'sil') {
    drawLimbs(ctx, P, INK); drawBall(ctx, P, INK); inkPass(ctx, bodyPts(P), INK);
    return;
  }
  drawLimbs(ctx, P, INK);
  if (mode === 'sweep') {
    // smear frame: the body swept along its own path over the last frame interval, tapering toward the tail
    const S = sweepPolys(P);
    for (const pts of S) inkPass(ctx, pts, INK);
    ctx.fillStyle = ACC;
    for (const pts of S) { ctx.beginPath(); polyPath(ctx, pts); ctx.fill(); }
  } else if (mode === 'multi') {
    // multiples: whole copies at sub-frame times filling the gap since the last frame
    for (let k = 3; k >= 1; k--) {
      const Q = pose(P.t - k * (1 / FPS) / 3.2);
      if (!Q) continue;
      const pts = bodyPts(Q, 1 - 0.05 * k);
      inkPass(ctx, pts, INK);
      ctx.fillStyle = k === 1 ? ACC : k === 2 ? '#ff7a50' : '#ff9b78';
      ctx.beginPath(); polyPath(ctx, pts); ctx.fill();
    }
    inkPass(ctx, bodyPts(P), INK);
  } else {
    inkPass(ctx, bodyPts(P), INK);
  }
  colorFace(ctx, P);
  drawBall(ctx, P, INK, ACC);
}

// ---------------------------------------------------------------- effects (all closed form in t)
function addDust(t, x, y, n, seed, o = {}) {
  const r = rand(seed), ps = [];
  const spread = o.spread ?? 1, sp = o.sp ?? 260, size = o.size ?? 13, bias = o.bias ?? 0, life = o.life ?? 0.55;
  for (let i = 0; i < n; i++) {
    const side = n === 1 ? (bias || 1) : (i % 2 ? 1 : -1);
    const ang = (side > 0 ? 0 : Math.PI) + side * (-0.15 - r() * 0.55) * spread;
    const v = sp * (0.55 + 0.7 * r());
    ps.push({ vx: Math.cos(ang) * v + bias * sp * 0.6, vy: Math.sin(ang) * v * 0.55, r: size * (0.6 + 0.8 * r()), life: life * (0.7 + 0.6 * r()), dx: (r() - 0.5) * 14 });
  }
  DUST.push({ t, x, y, ps });
}
function drawDust(ctx, t) {
  ctx.lineWidth = 2.5;
  for (const d of DUST) {
    const tau = t - d.t;
    if (tau < 0 || tau > 1.2) continue;
    for (const p of d.ps) {
      if (tau > p.life) continue;
      const e = (1 - Math.exp(-5 * tau)) / 5;
      const x = d.x + p.dx + p.vx * e, y = d.y + p.vy * e - 16 * tau - 4;
      const rr = p.r * (0.45 + 0.85 * (1 - Math.exp(-7 * tau))) * (1 - 0.35 * tau / p.life);
      ctx.globalAlpha = Math.pow(1 - tau / p.life, 1.4);
      ctx.fillStyle = PUFF; ctx.strokeStyle = PUFF_E;
      ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.fill(); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- setup helpers
function buildBackground(api) {
  const c = document.createElement('canvas'); c.width = SW; c.height = SH;
  const b = c.getContext('2d', api.headless ? { willReadFrequently: true } : undefined);
  const r = rand(124);
  b.fillStyle = DESK; b.fillRect(0, 0, SW, SH);
  const lamp = b.createRadialGradient(540, 1720, 40, 540, 1720, 900);
  lamp.addColorStop(0, 'rgba(255,214,160,0.10)'); lamp.addColorStop(1, 'rgba(255,214,160,0)');
  b.fillStyle = lamp; b.fillRect(0, 0, SW, SH);
  // a stack of animation paper under the top sheet
  const sheet = (dx, dy, a, col) => {
    b.save(); b.translate(540 + dx, SHEET_B / 2 + dy); b.rotate(a);
    b.fillStyle = 'rgba(0,0,0,0.28)'; b.fillRect(-522 + 3, -SHEET_B / 2 - 20 + 8, 1044, SHEET_B + 20);
    b.fillStyle = col; b.fillRect(-522, -SHEET_B / 2 - 20, 1044, SHEET_B + 20);
    b.restore();
  };
  sheet(-5, 16, -0.0045, '#d9cfbf');
  sheet(4, 9, 0.003, '#e6dccb');
  // top sheet + light coming up through it
  b.fillStyle = 'rgba(0,0,0,0.35)'; b.fillRect(SHEET_L + 2, 0, SHEET_R - SHEET_L, SHEET_B + 6);
  b.fillStyle = PAPER; b.fillRect(SHEET_L, -4, SHEET_R - SHEET_L, SHEET_B + 4);
  const glow = b.createRadialGradient(560, 900, 80, 560, 900, 1150);
  glow.addColorStop(0, 'rgba(255,253,247,0.95)'); glow.addColorStop(0.55, 'rgba(255,251,242,0.35)'); glow.addColorStop(1, 'rgba(232,220,200,0.55)');
  b.fillStyle = glow; b.fillRect(SHEET_L, 0, SHEET_R - SHEET_L, SHEET_B);
  // paper tooth and fibres
  for (let i = 0; i < 26000; i++) {
    const x = SHEET_L + r() * (SHEET_R - SHEET_L), y = r() * SHEET_B, dark = r() < 0.6;
    b.fillStyle = dark ? `rgba(90,70,40,${0.03 + r() * 0.05})` : `rgba(255,255,255,${0.2 + r() * 0.3})`;
    b.fillRect(x, y, 1 + (r() < 0.2), 1);
  }
  b.lineWidth = 1;
  for (let i = 0; i < 140; i++) {
    const x = SHEET_L + r() * (SHEET_R - SHEET_L), y = r() * SHEET_B, a = r() * TAU, l = 6 + r() * 16;
    b.strokeStyle = `rgba(110,90,60,${0.05 + r() * 0.06})`;
    b.beginPath(); b.moveTo(x, y); b.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 3, y + Math.sin(a) * l * 0.5 - 3, x + Math.cos(a) * l, y + Math.sin(a) * l); b.stroke();
  }
  // field guide corners (non-photo blue, very faint)
  b.strokeStyle = 'rgba(59,112,208,0.30)'; b.lineWidth = 2;
  const fg = [60, 64, 1020, 1640], L = 34;
  b.beginPath();
  for (const [x, y, sx, sy] of [[fg[0], fg[1], 1, 1], [fg[2], fg[1], -1, 1], [fg[0], fg[3], 1, -1], [fg[2], fg[3], -1, -1]]) {
    b.moveTo(x + sx * L, y); b.lineTo(x, y); b.lineTo(x, y + sy * L);
  }
  b.stroke();
  // peg holes + peg bar at the top
  b.fillStyle = DESK;
  b.beginPath(); b.arc(540, 34, 15, 0, TAU); b.fill();
  b.beginPath(); b.roundRect(540 - 205, 26, 70, 16, 8); b.roundRect(540 + 135, 26, 70, 16, 8); b.fill();
  const bar = b.createLinearGradient(0, 0, 0, 22);
  bar.addColorStop(0, '#8d929b'); bar.addColorStop(1, '#5d626b');
  b.fillStyle = 'rgba(0,0,0,0.25)'; b.fillRect(300, 0, 480, 25);
  b.fillStyle = bar; b.fillRect(300, 0, 480, 21);
  b.fillStyle = '#a3a8b0';
  b.beginPath(); b.arc(540, 33, 12, 0, TAU); b.fill();
  b.beginPath(); b.roundRect(540 - 202, 28, 64, 12, 6); b.roundRect(540 + 138, 28, 64, 12, 6); b.fill();
  b.fillStyle = 'rgba(255,255,255,0.35)'; b.fillRect(300, 2, 480, 3);
  // shadow of the sheet's bottom edge on the desk
  const sh = b.createLinearGradient(0, SHEET_B, 0, SHEET_B + 40);
  sh.addColorStop(0, 'rgba(0,0,0,0.35)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  b.fillStyle = sh; b.fillRect(0, SHEET_B + 26, SW, 40);
  return c;
}

function layoutType(ctx) {
  G = [];
  for (let li = 0; li < LINES.length; li++) {
    const L = LINES[li];
    ctx.font = `900 ${L.size}px ${KR}`;
    const ms = Array.from(L.str).map((ch) => ({ ch, m: ctx.measureText(ch) }));
    const tr = TRACK * L.size;
    let w = 0;
    ms.forEach((o, i) => { w += o.m.width + (i < ms.length - 1 ? tr : 0); });
    const first = ms[0].m, last = ms[ms.length - 1].m;
    const inkL = -first.actualBoundingBoxLeft, inkR = w - last.width + last.actualBoundingBoxRight;   // ink box relative to the pen start
    let x = L.align === 'right' ? MR - inkR : MX - inkL;
    const lineInk = { l: x + inkL, r: x + inkR };
    ms.forEach((o, i) => {
      const m = o.m, l = x - m.actualBoundingBoxLeft, r = x + m.actualBoundingBoxRight;
      G.push({ i: G.length, ch: o.ch, line: li, size: L.size, x, l, r, cx: (l + r) / 2, top: L.base - m.actualBoundingBoxAscent, base: L.base, acc: L.acc.includes(i) });
      x += m.width + tr;
    });
    if (L.align === 'word') WORD = { w: lineInk.r - lineInk.l, penOff: G.filter((g) => g.line === 2)[0].x - lineInk.l, desc: Math.max(...ms.map((o) => o.m.actualBoundingBoxDescent)) };
  }
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '124-shape-mascot',
  title: '네모, 무게를 싣다',
  tech: '도형 마스코트 · 애니메이션 원칙과 스미어 프레임',
  duration: D,
  fps: FPS,
  background: DESK,

  async setup(api) {
    const all = LINES.map((l) => l.str).join('') + PR.map((p) => p.ko + p.d + p.chip).join('') + '여덟 원칙, 한 번의 점프실루엣스미어프레임간격정렬';
    await fontReady(`900 172px ${KR}`, all);
    await fontReady(`800 64px ${KR}`, all);
    await fontReady(`500 30px ${KR}`, all);
    await fontReady(`700 22px ${KR}`, all);
    await fontReady(`500 22px ${MONO}`, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&·/-—°N×. f');
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = ctx;
    this.bg = buildBackground(api);

    // rounded-square outline, local and centred (6 segments per corner)
    RR = [];
    {
      const hw = BW / 2, hh = BH / 2, r = BR, n = 6;
      for (const [cx, cy, a0] of [[hw - r, hh - r, 0], [-hw + r, hh - r, Math.PI / 2], [-hw + r, -hh + r, Math.PI], [hw - r, -hh + r, 1.5 * Math.PI]]) {
        for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * Math.PI / 2; RR.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
      }
    }

    layoutType(ctx);
    // the stray word: rests displaced to the left of its flush-right slot, then is pushed home
    WORD.x1 = MR - WORD.w;
    WORD.x0 = WORD.x1 - 336;

    // letters touched by the mascot (glyph indices: 0 움 1 직 2 임 3 엔 | 4 무 5 게 6 가 | 7 있 8 다)
    const sup = { um: [[0, 1]], im: [[2, 1]], en: [[3, 1]], muge: [[4, 0.5], [5, 0.5]] };
    LC = [
      { g: 0, on: T.land0, off: T.upA, ion: 34, ioff: 16, w: 1 },
      { g: 2, on: T.landA, off: T.upB, ion: 24, ioff: 12, w: 1 },
      { g: 3, on: T.landB, off: T.upBig, ion: 22, ioff: 30, w: 1 },
      { g: 4, on: T.landBig, off: T.upD, ion: 62, ioff: 14, w: 1 },
      { g: 5, on: T.landBig, off: T.upD, ion: 62, ioff: 14, w: 1 },
    ];
    // the hit travels along the line to the neighbours, later and weaker (overlapping action)
    RP = [];
    const landings = [[T.land0, [0], 34], [T.landA, [2], 24], [T.landB, [3], 22], [T.landBig, [4, 5], 62]];
    for (const [tl, gs, a] of landings) {
      const line = G[gs[0]].line;
      for (const g of G) {
        if (g.line !== line || gs.includes(g.i)) continue;
        const d = Math.min(...gs.map((j) => Math.abs(j - g.i)));
        RP.push({ g: g.i, t: tl + 0.06 * d, a: a * Math.pow(0.45, d) });
      }
    }

    // body path
    const P0 = supPt(sup.um, T.land0);
    SEG = [
      { k: 'a', t0: T.drop, t1: T.land0, fall: true, x0: P0.x + 26, y0: -230, x1: P0.x, y1: P0.y },
      { k: 'g', t0: T.land0, t1: T.upA, sup: sup.um, land: 0.36, cr: [T.crA, T.holdA, 0.28], go: 1, come: 0 },
      { k: 'a', t0: T.upA, t1: T.landA, from: sup.um, to: sup.im, h: 92, trail: 1 },
      { k: 'g', t0: T.landA, t1: T.upB, sup: sup.im, land: 0.26, cr: [T.crB, T.holdB, 0.18], go: 1, come: 1 },
      { k: 'a', t0: T.upB, t1: T.landB, from: sup.im, to: sup.en, h: 62, trail: 1 },
      { k: 'g', t0: T.landB, t1: T.upBig, sup: sup.en, land: 0.24, cr: [T.crBig, T.holdBig, 0.40], go: 1, come: 1 },
      { k: 'a', t0: T.upBig, t1: T.landBig, from: sup.en, to: sup.muge, h: 222, warp: 0.8, smear: 'sweep', trail: 2 },
      { k: 'g', t0: T.landBig, t1: T.upD, sup: sup.muge, land: 0.48, cr: [T.crD, T.holdD, 0.18], go: -1, come: 1 },
      { k: 'a', t0: T.upD, t1: T.landD, from: sup.muge, to: 'push', h: 262, pw: 1.3, smear: 'multi', trail: 3 },
      { k: 'g', t0: T.landD, t1: T.upE, sup: 'push', land: 0.30, go: 0, come: -1 },
      { k: 'a', t0: T.upE, t1: T.landE, from: 'push', to: 'push', h: 64 },
      { k: 'g', t0: T.landE, t1: D + 1, sup: 'push', land: 0.22, go: 0, come: 0 },
    ];
    for (const s of SEG) {
      if (s.k !== 'a' || s.fall) continue;
      const a = supPt(s.from, s.t0), b = supPt(s.to, s.t1);
      s.x0 = a.x; s.y0 = a.y; s.x1 = b.x; s.y1 = b.y;
    }
    // arm angle carried into each ground span (for the swing-down follow-through)
    for (let i = 1; i < SEG.length; i++) {
      const s = SEG[i];
      if (s.k !== 'g') continue;
      const v = airV(SEG[i - 1], SEG[i - 1].t1);
      s.armIn = 112 + 40 * clamp(-v[1] / 1400, -1, 1);
    }
    SEG[1].armIn = 152;
    // antenna events: every change of body velocity (take-off, landing) + the push, as a fine series of steps
    AEV = [];
    for (const s of SEG) {
      if (s.k !== 'a') continue;
      const v0 = airV(s, s.t0), v1 = airV(s, s.t1), sg = Math.sign(v1[0]) || 1;
      if (!s.fall) AEV.push({ t: s.t0, dvx: v0[0], whip: -sg * 0.12 * Math.hypot(...v0) / 2000 });
      AEV.push({ t: s.t1, dvx: -v1[0], whip: sg * 0.5 * Math.abs(v1[1]) / 3000, sq: 0.25 * Math.min(1, Math.abs(v1[1]) / 4000) });
    }
    const NP = 40, dtp = (T.push1 - T.push0) / NP;
    for (let i = 0; i < NP; i++) {
      const ta = T.push0 + i * dtp;
      AEV.push({ t: ta + dtp / 2, dvx: pushV(ta + dtp) - pushV(ta), whip: 0 });
    }

    // dust
    DUST = [];
    const sp = (s, t) => supPt(s, t);
    addDust(T.land0, P0.x, sp(sup.um, T.land0).y, 6, 11, { size: 12, sp: 240 });
    addDust(T.landA, G[2].cx, sp(sup.im, T.landA).y, 4, 12, { size: 10, sp: 200 });
    addDust(T.landB, G[3].cx, sp(sup.en, T.landB).y, 4, 13, { size: 10, sp: 200 });
    addDust(T.upBig, G[3].cx, sp(sup.en, T.upBig).y, 5, 14, { size: 11, sp: 220, bias: -0.6 });
    addDust(T.landBig, sp(sup.muge, T.landBig).x, sp(sup.muge, T.landBig).y, 14, 15, { size: 17, sp: 520, life: 0.8, spread: 1.2 });
    addDust(T.landD, pushX(T.landD), FLOOR, 8, 16, { size: 14, sp: 330, life: 0.7 });
    addDust(T.landE, pushX(T.landE), FLOOR, 4, 17, { size: 10, sp: 180 });
    // push: a puff from the back foot every step, and the word scraping the floor every 52 px
    {
      let lastStep = 0, lastScrape = 0, seed = 40;
      for (let t = T.push0; t <= T.push1; t += 1 / 1000) {
        const d = pushX(t) - pushX(T.push0);
        if (d - lastStep >= 58) { lastStep += 58; addDust(t, pushX(t) - 30, FLOOR, 2, seed++, { size: 8, sp: 120, bias: -1, life: 0.45 }); }
        if (d - lastScrape >= 52) { lastScrape += 52; addDust(t, wordX(t) + WORD.w * 0.25, FLOOR, 2, seed++, { size: 9, sp: 140, bias: -0.8, life: 0.5 }); }
      }
    }
    addDust(T.push1, MR + 6, FLOOR, 4, 30, { size: 9, sp: 160, bias: 1, life: 0.5 });

    // the smear frames of the big leap, found at the frame times they will be drawn (for the pencil ghost)
    GHOST = [];
    for (let k = Math.ceil(T.upBig * FPS); k / FPS < T.landBig; k++) {
      const P = pose(k / FPS);
      if (P && P.air && P.sp > SMEAR_V && k / FPS > (T.upBig + T.landBig) / 2) GHOST.push(k);
    }
    this.ghost = bakeGhost(api);
    ctx.drawImage(this.ghost.c, 0, 0);     // first composite in setup (see README: offscreen AA on first use)
  },

  frame(t) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.setLineDash([]); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.letterSpacing = '0px';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.drawImage(this.bg, 0, 0);

    const P = pose(t);

    // ---------------- camera (world = type, guides, mascot); the header and readouts stay put
    const stage = smooth((t - 3.04) / 0.7) * (1 - smooth((t - T.upBig) / 0.22));
    let z = 1 + 0.016 * t / D + 0.06 * stage, shx = 0, shy = 0;
    const cxz = lerp(540, G[3].cx, stage), cyz = lerp(900, G[3].top - 70, stage);
    for (const [t0, amp, punch] of [[T.land0, 4, 0.008], [T.landBig, 13, 0.03], [T.landD, 4, 0.006]]) {
      const x = t - t0;
      if (x < 0 || x > 1) continue;
      const e = Math.exp(-7 * x);
      shx += amp * e * Math.sin(TAU * 7.5 * x); shy += amp * 0.8 * e * Math.sin(TAU * 9.5 * x + 1.1); z += punch * Math.exp(-10 * x);
    }
    CAM = [z, 0, 0, z, cxz - z * cxz + shx, cyz - z * cyz + shy];

    ctx.save();
    ctx.beginPath(); ctx.rect(SHEET_L, 0, SHEET_R - SHEET_L, SHEET_B); ctx.clip();
    ctx.setTransform(...CAM);
    drawWorld(ctx, t, P);
    ctx.restore();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawHeader(ctx, t);
    drawRuler(ctx, t);
    drawReadout(ctx, t, P);
  },
});

// ---------------------------------------------------------------- world
function drawWorld(ctx, t, P) {
  // floor
  ctx.fillStyle = FLOORC; ctx.fillRect(-200, FLOOR, 1500, 600);
  ctx.fillStyle = INK; ctx.fillRect(-200, FLOOR - 1.5, 1500, 3);

  drawGuides(ctx, t);
  drawSpacingChart(ctx, t);
  drawTrails(ctx, t);
  drawType(ctx, t);

  // staging: everything but the mascot sinks into shadow
  const st = smooth((t - 3.05) / 0.28) * (1 - smooth((t - T.upBig) / 0.3));
  if (P && st > 0.001) {
    const g = ctx.createRadialGradient(P.C[0], P.C[1] - 10, 90, P.C[0], P.C[1] - 10, 560);
    g.addColorStop(0, 'rgba(32,27,39,0)'); g.addColorStop(1, `rgba(32,27,39,${0.34 * st})`);
    ctx.fillStyle = g; ctx.fillRect(-200, -200, 1500, 2300);
  }

  if (P) drawShadow(ctx, t, P);
  drawDust(ctx, t);
  drawImpact(ctx, t);
  if (P) {
    const s = P.s;
    const mode = P.air && s.smear === 'sweep' && P.sp > SMEAR_V ? 'sweep' : P.air && s.smear === 'multi' && P.sp > MULTI_V ? 'multi' : 'full';
    drawMascot(ctx, P, mode);
  }
  drawSilhouetteCard(ctx, t, P);
  drawSpecks(ctx, t, P);
  drawGhost(ctx, t);
  drawTipTrail(ctx, t);
}

function drawGuides(ctx, t) {
  const g = smooth(t / 0.6);
  ctx.strokeStyle = 'rgba(59,112,208,0.32)'; ctx.lineWidth = 2;
  ctx.beginPath();
  // margins (alignment guides)
  ctx.moveTo(MX, 470); ctx.lineTo(MX, 470 + 230 * g);
  const flash = t > T.push1 ? Math.exp(-4 * (t - T.push1)) : 0;
  ctx.moveTo(MR, 850); ctx.lineTo(MR, 850 + 590 * g);
  // baselines
  for (const L of LINES) {
    if (L.base === FLOOR) continue;
    const x0 = L.align === 'right' ? MR + 24 : MX - 24, dir = L.align === 'right' ? -1 : 1, len = L.align === 'right' ? 560 : 500;
    ctx.moveTo(x0, L.base + 0.5); ctx.lineTo(x0 + dir * len * g, L.base + 0.5);
  }
  ctx.stroke();
  if (flash > 0.01) {
    ctx.strokeStyle = ACC; ctx.globalAlpha = flash; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(MR, 850); ctx.lineTo(MR, FLOOR); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // tiny pencil labels on the guides
  ctx.font = `500 18px ${MONO}`; ctx.fillStyle = 'rgba(59,112,208,0.6)'; ctx.globalAlpha = g;
  ctx.fillText('L', MX - 20, 462); ctx.textAlign = 'right'; ctx.fillText('R', MR + 20, 842); ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

function drawType(ctx, t) {
  // floating lines: hard paper shadow, then the letters (each a sprung platform)
  for (const pass of [0, 1]) {
    for (const g of G) {
      if (g.line === 2) continue;
      const ap = g.line === 0 ? 0.06 + 0.07 * g.i : 0.22 + 0.08 * (g.i - 4);
      const p = clamp((t - ap) / 0.5);
      if (p <= 0) continue;
      const s = 0.55 + 0.45 * ease.outBack(p, 1.7), rise = 40 * (1 - ease.outExpo(p));
      const st = glyphState(g, t);
      ctx.save();
      ctx.globalAlpha = clamp(p * 4);
      ctx.translate(g.cx, g.base + st.dy + rise + (pass ? 0 : 9));
      ctx.scale(s * (1 + 0.6 * st.k), s * (1 - st.k));
      ctx.font = `900 ${g.size}px ${KR}`;
      ctx.fillStyle = pass ? (g.acc ? ACC : INK) : SHADE;
      ctx.fillText(g.ch, g.x - g.cx, 0);
      ctx.restore();
    }
  }
  // the stray last word, on the floor
  const wx = wordX(t), tilt = wordTilt(t);
  const jel = t > T.push1 ? dcos(t - T.push1, 3.2, 6.5) : 0;
  ctx.save();
  ctx.translate(wx + WORD.w, FLOOR);
  ctx.rotate(tilt);
  ctx.scale(1 - 0.07 * jel, 1 + 0.05 * jel);
  // contact shadow
  ctx.fillStyle = 'rgba(60,45,30,0.16)';
  ctx.beginPath(); ctx.ellipse(-WORD.w / 2, 2, WORD.w / 2 + 8, 7, 0, 0, TAU); ctx.fill();
  ctx.font = `900 ${LINES[2].size}px ${KR}`; ctx.fillStyle = INK;
  for (const g of G) if (g.line === 2) ctx.fillText(g.ch, -WORD.w + (g.x - G[7].x) + WORD.penOff, -WORD.desc);
  ctx.restore();
}

function drawShadow(ctx, t, P) {
  // the surface right under the feet: a letter top on the line below, the stray word, or the floor
  let ys = FLOOR;
  for (const g of G) {
    if (g.line === 2) continue;
    if (P.fx < g.l - 10 || P.fx > g.r + 10) continue;
    const top = glyphState(g, t).top;
    if (top >= P.fy - 2 && top < ys) ys = top;
  }
  const h = Math.max(0, ys - P.fy), k = clamp(h / 420);
  ctx.fillStyle = `rgba(55,40,28,${0.2 * (1 - 0.75 * k)})`;
  ctx.beginPath(); ctx.ellipse(P.fx, ys + 1, 60 * (1 - 0.5 * k) * (P.air ? 1 : P.sx), 8 * (1 - 0.4 * k), 0, 0, TAU); ctx.fill();
}

function drawImpact(ctx, t) {
  // heavy landing on "무게": ring on the letter tops + speed lines (the one big impact)
  const x = t - T.landBig;
  if (x >= 0 && x < 0.6) {
    const s = SEG.find((q) => q.t0 === T.landBig), q = supPt(s.sup, t);
    const p = x / 0.6, e = ease.outExpo(p);
    ctx.strokeStyle = ACC; ctx.globalAlpha = 1 - p; ctx.lineWidth = 10 * (1 - p) + 1;
    ctx.beginPath(); ctx.ellipse(q.x, q.y + 4, 50 + 270 * e, (50 + 270 * e) * 0.2, 0, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1;
    if (x < 0.26) {
      const u = x / 0.26;
      ctx.strokeStyle = INK; ctx.lineWidth = 7 * (1 - u) + 1; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + 0.22 + (i / 8) * (Math.PI - 0.44);
        const r0 = 92 + 90 * ease.outCubic(u), r1 = 130 + 170 * ease.outCubic(u);
        ctx.moveTo(q.x + Math.cos(a) * r0, q.y - 50 + Math.sin(a) * r0 * 0.8);
        ctx.lineTo(q.x + Math.cos(a) * r1, q.y - 50 + Math.sin(a) * r1 * 0.8);
      }
      ctx.stroke(); ctx.lineCap = 'butt';
    }
  }
  // the word clicks into its slot: three ticks off the right guide
  const y = t - T.push1;
  if (y >= 0 && y < 0.4) {
    const u = y / 0.4;
    ctx.strokeStyle = ACC; ctx.lineWidth = 5 * (1 - u) + 1; ctx.lineCap = 'round';
    ctx.beginPath();
    for (const a of [-0.7, 0, 0.7]) {
      const r0 = 20 + 30 * u, r1 = 44 + 40 * u, cx = MR + 8, cy = FLOOR - 120;
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    }
    ctx.stroke(); ctx.lineCap = 'butt';
  }
}

// arcs: the path and one dot per frame (spacing = speed) in blue pencil
function drawTrails(ctx, t) {
  let n = 0;
  for (const s of SEG) {
    if (s.k !== 'a' || t <= s.t0 || s.fall || s.x0 === s.x1) continue;
    const live = !s.trail || s.trail === 3 ? 0 : s.trail === 2 ? 1 - smooth((t - 5.35) / 0.6) : 1 - smooth((t - s.t1 - 0.45) / 0.55);
    // recap: the whole journey comes back as pencil, one arc after another
    const rp = clamp((t - CAP[8] - 0.35 - 0.16 * n) / 0.5); n++;
    const fade = Math.max(live, 0.55 * rp);
    if (fade <= 0.001) continue;
    const t1 = live > 0.001 ? Math.min(t, s.t1) : s.t0 + (s.t1 - s.t0) * ease.outCubic(rp), cy = -FEET - BH / 2;
    ctx.globalAlpha = 0.45 * fade; ctx.strokeStyle = BLUE; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const tt = s.t0 + (t1 - s.t0) * (i / 40), p = airP(s, tt);
      if (i) ctx.lineTo(p[0], p[1] + cy); else ctx.moveTo(p[0], p[1] + cy);
    }
    ctx.stroke();
    ctx.globalAlpha = fade; ctx.fillStyle = BLUE;
    ctx.beginPath();
    for (let k = Math.ceil(s.t0 * FPS); k / FPS <= t1; k++) {
      const p = airP(s, k / FPS);
      ctx.moveTo(p[0] + 5, p[1] + cy); ctx.arc(p[0], p[1] + cy, 5, 0, TAU);
    }
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function sweepPolys(P) {
  // the swept body of a smear frame: samples over the last frame interval (air part only), tapering toward the tail
  const N = 12, S = [];
  for (let j = 0; j <= N; j++) {
    const ts = Math.max(P.s.t0 + 1e-4, P.t - (1 / FPS) * (1 - j / N));
    const Q = j === N ? P : pose(ts);
    if (Q) S.push(bodyPts(Q, 0.5 + 0.5 * Math.pow(j / N, 0.8)));
  }
  return S;
}
let GHOSTC = null;
function bakeGhost(api) {
  // the smear drawings of the landing, as one clean blue-pencil outline (stroke the union, then cut its inside out)
  const c = document.createElement('canvas'); c.width = SW; c.height = SH;
  const g = c.getContext('2d', api.headless ? { willReadFrequently: true } : undefined);
  const all = [];
  for (const k of GHOST) all.push(...sweepPolys(pose(k / FPS)));
  g.strokeStyle = BLUE; g.lineWidth = 7; g.lineJoin = 'round';
  for (const pts of all) { g.beginPath(); polyPath(g, pts); g.closePath(); g.stroke(); }
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = '#000';
  for (const pts of all) { g.beginPath(); polyPath(g, pts); g.fill(); }
  g.globalCompositeOperation = 'source-over';
  let rx = -1e9, ry = 0;
  for (const pts of all) for (const [x, y] of pts) if (y < 700 && x > rx) { rx = x; ry = y; }
  GHOSTC = { c, x: rx, y: ry };
  return GHOSTC;
}
function drawGhost(ctx, t) {
  // the smear frames stay on the paper as blue pencil after they flash by, labelled with their frame numbers
  if (!GHOST.length || !GHOSTC) return;
  const last = GHOST[GHOST.length - 1] / FPS;
  const vis = smooth((t - last - 1 / FPS) / 0.04) * (1 - smooth((t - 5.4) / 0.55));
  if (vis <= 0.001) return;
  ctx.globalAlpha = 0.9 * vis;
  ctx.drawImage(GHOSTC.c, 0, 0);
  const lx = 748, ly = 560;
  ctx.strokeStyle = BLUE; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(lx - 12, ly - 9); ctx.lineTo(GHOSTC.x + 8, GHOSTC.y); ctx.stroke();
  ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(GHOSTC.x + 8, GHOSTC.y, 4, 0, TAU); ctx.fill();
  ctx.font = `700 26px ${KR}`; ctx.fillText('스미어', lx, ly);
  ctx.font = `500 21px ${MONO}`;
  const f = GHOST.length > 1 ? `f${GHOST[0]}–${GHOST[GHOST.length - 1]}` : `f${GHOST[0]}`;
  ctx.fillText(f, lx + 90, ly);
  ctx.font = `500 22px ${KR}`; ctx.fillStyle = 'rgba(59,112,208,0.85)';
  ctx.fillText('프레임 사이를 잇는 그림', lx, ly + 34);
  ctx.globalAlpha = 1;
}

function drawTipTrail(ctx, t) {
  // follow-through: the path the antenna tip has traced over the last 0.8 s, as a fading pencil line
  const a = smooth((t - T.landBig - 0.05) / 0.2) * (1 - smooth((t - 5.5) / 0.35));
  if (a <= 0.001) return;
  const pts = [];
  for (let j = 0; j <= 32; j++) {
    const tt = t - j / 40;
    if (tt < T.landBig) break;
    pts.push(antennaPts(pose(tt))[2]);
  }
  ctx.strokeStyle = BLUE; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  for (let j = 1; j < pts.length; j++) {
    ctx.globalAlpha = a * (1 - j / pts.length) * 0.9;
    ctx.beginPath(); ctx.moveTo(pts[j - 1][0], pts[j - 1][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  ctx.fillStyle = BLUE;
  for (let j = 4; j < pts.length; j += 4) {
    ctx.globalAlpha = a * (1 - j / pts.length);
    ctx.beginPath(); ctx.arc(pts[j][0], pts[j][1], 4, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSpecks(ctx, t, P) {
  // secondary action: shaking the landing dust off
  const x0 = t - T.shake;
  if (!P || x0 < 0 || x0 > 0.9) return;
  const r = rand(77);
  ctx.fillStyle = '#b9a88c';
  for (let i = 0; i < 10; i++) {
    const side = i % 2 ? 1 : -1, t0 = 0.05 + 0.035 * i, x = x0 - t0;
    const vx = side * (160 + 160 * r()), vy = -120 - 160 * r(), sz = 3 + 3 * r(), y0 = -30 - 50 * r();
    if (x < 0 || x > 0.6) continue;
    const s = SEG.find((q) => q.t0 === T.landBig), q = supPt(s.sup, T.shake);
    ctx.globalAlpha = 1 - x / 0.6;
    ctx.beginPath(); ctx.arc(q.x + side * 60 + vx * x, q.y + y0 + vy * x + 700 * x * x, sz, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSilhouetteCard(ctx, t, P) {
  // staging: the pose read as a pure silhouette, in a little card next to the mascot
  const a = clamp((t - 3.16) / 0.4), b = clamp((t - T.upBig + 0.06) / 0.14);
  if (a <= 0 || b >= 1 || !P) return;
  const s = ease.outBack(a, 1.6) * (1 - ease.inCubic(b));
  const x = 616, y = 360, w = 210, h = 196;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-(x + w / 2), -(y + h / 2));
  // leader to the mascot
  ctx.strokeStyle = BLUE; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y + h * 0.62); ctx.lineTo(P.C[0] + 78, P.C[1] - 6); ctx.stroke();
  ctx.fillStyle = 'rgba(32,27,39,0.18)'; ctx.beginPath(); ctx.roundRect(x + 5, y + 7, w, h, 18); ctx.fill();
  ctx.fillStyle = '#fffcf5'; ctx.strokeStyle = BLUE; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill(); ctx.stroke();
  ctx.fillStyle = BLUE; ctx.font = `700 22px ${KR}`; ctx.fillText('실루엣', x + 18, y + 36);
  ctx.font = `500 17px ${MONO}`; ctx.textAlign = 'right'; ctx.fillText('READS ✓', x + w - 16, y + 35); ctx.textAlign = 'left';
  // the same pose, solid ink, scaled into the card
  const k = 0.62, fx = x + w / 2, fy = y + h - 22;
  ctx.fillStyle = 'rgba(59,112,208,0.25)'; ctx.fillRect(x + 22, fy, w - 44, 2);
  ctx.save(); ctx.translate(fx, fy); ctx.scale(k, k); ctx.translate(-P.fx, -P.fy);
  drawMascot(ctx, P, 'sil');
  ctx.restore();
  ctx.restore();
}

function drawSpacingChart(ctx, t) {
  // slow in / slow out: one tick per frame of the push, measured at the word's left edge
  const a = smooth((t - 6.66) / 0.3) * (1 - smooth((t - 9.2) / 0.5));
  if (a <= 0.001) return;
  const y = FLOOR + 62, k0 = Math.ceil(T.push0 * FPS), k1 = Math.floor(T.push1 * FPS);
  const x0 = WORD.x0, x1 = WORD.x1;
  ctx.globalAlpha = a;
  ctx.fillStyle = INK; ctx.fillRect(x0, y - 1, x1 - x0, 2);
  for (let k = k0; k <= k1; k++) {
    const x = wordX(k / FPS), key = k === k0 || k === k1, past = k / FPS <= t + 1e-6;
    ctx.fillStyle = past ? INK : 'rgba(59,112,208,0.55)';
    const hh = key ? 30 : 16;
    ctx.fillRect(x - (key ? 1.5 : 1), y - hh / 2, key ? 3 : 2, hh);
  }
  // current marker
  if (t >= T.push0 - 0.3) {
    const x = wordX(t);
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x - 9, y - 28); ctx.lineTo(x + 9, y - 28); ctx.fill();
  }
  ctx.font = `500 20px ${MONO}`; ctx.fillStyle = SUB;
  ctx.textAlign = 'center'; ctx.fillText('1', x0, y + 40); ctx.fillText(String(k1 - k0 + 1), x1, y + 40);
  ctx.textAlign = 'left'; ctx.fillStyle = BLUE; ctx.font = `700 22px ${KR}`;
  ctx.fillText('프레임 간격', x1 + 40, y + 8);
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- header (principle card) + readouts
function cardLines(i) {
  if (i < PR.length) {
    const p = PR[i];
    return [
      { y: 178, h: 34, font: `500 23px ${MONO}`, ls: '2px', parts: [[String(i + 1).padStart(2, '0'), ACC], ['  ' + p.en, ACC]] },
      { y: 252, h: 78, font: `800 66px ${KR}`, ls: '-2px', parts: [[p.ko, INK]] },
      { y: 300, h: 40, font: `500 30px ${KR}`, ls: '-0.5px', parts: [[p.d, SUB]] },
    ];
  }
  return [
    { y: 178, h: 34, font: `500 23px ${MONO}`, ls: '2px', parts: [['08 / 08', ACC], ['  ALL PRINCIPLES', ACC]] },
    { y: 252, h: 78, font: `800 66px ${KR}`, ls: '-2px', parts: [['여덟 원칙, ', INK], ['한 번의 점프', ACC]] },
  ];
}
function drawCard(ctx, i, enterAt, exitAt, t) {
  const lines = cardLines(i);
  lines.forEach((L, j) => {
    const p = clamp((t - enterAt - 0.06 * j) / 0.55);
    if (p <= 0) return;
    let off = (1 - ease.outExpo(p)) * L.h, alpha = clamp(p * 5);
    if (exitAt != null) { const q = clamp((t - exitAt - 0.02 * j) / 0.13); if (q >= 1) return; off -= ease.inCubic(q) * L.h * 1.15; alpha *= 1 - q; }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.rect(MX - 10, L.y - L.h * 0.86, 920, L.h * 1.12); ctx.clip();
    ctx.font = L.font; ctx.letterSpacing = L.ls;
    let x = MX;
    for (const [s, col] of L.parts) { ctx.fillStyle = col; ctx.fillText(s, x, L.y + off); x += ctx.measureText(s).width; }
    ctx.restore();
  });
  ctx.letterSpacing = '0px';
}
function drawHeader(ctx, t) {
  // top rule
  const a = smooth((t - 0.05) / 0.4);
  ctx.globalAlpha = a;
  ctx.font = `500 21px ${MONO}`; ctx.letterSpacing = '3px'; ctx.fillStyle = SUB;
  ctx.fillText('PRINCIPLES OF ANIMATION', MX, 112);
  ctx.textAlign = 'right'; ctx.fillText('N°124', MR + 3, 112); ctx.textAlign = 'left';
  ctx.letterSpacing = '0px';
  ctx.fillStyle = INK; ctx.fillRect(MX, 128, (MR - MX) * smooth((t - 0.05) / 0.6), 2);
  ctx.globalAlpha = 1;
  // card: the current one enters, the previous one leaves upward first
  let i = -1;
  for (let k = 0; k < CAP.length; k++) if (t >= CAP[k]) i = k;
  if (i >= 0) {
    if (i > 0) drawCard(ctx, i - 1, CAP[i - 1], CAP[i], t);
    drawCard(ctx, i, CAP[i] + (i > 0 ? 0.13 : 0), null, t);
  }
  // progress pills (principles 1–8)
  const recap = t >= CAP[8];
  const pa = smooth((t - CAP[0]) / 0.4);
  if (pa > 0 && !recap) {
    for (let k = 0; k < 8; k++) {
      const x = MX + k * 58, done = k < i || recap, cur = k === i && !recap;
      ctx.globalAlpha = pa;
      ctx.fillStyle = cur ? ACC : done ? INK : FAINT;
      ctx.beginPath(); ctx.roundRect(x, 330, 48, 8, 4); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  // recap chips
  if (recap) {
    ctx.font = `700 22px ${KR}`;
    for (let k = 0; k < 8; k++) {
      const p = clamp((t - CAP[8] - 0.25 - 0.05 * k) / 0.4);
      if (p <= 0) continue;
      const col = k % 4, row = (k / 4) | 0, w = 212, h = 46, x = MX + col * 228, y = 304 + row * 58;
      const s = 0.6 + 0.4 * ease.outBack(p, 1.8);
      ctx.save(); ctx.globalAlpha = clamp(p * 3);
      ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s);
      ctx.fillStyle = '#fffaf1'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(-w / 2 + 22, 0, 7, 0, TAU); ctx.fill();
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(PR[k].chip, 10, 8); ctx.textAlign = 'left';
      ctx.restore();
    }
  }
}
function drawReadout(ctx, t, P) {
  const a = smooth((t - 0.2) / 0.4);
  if (a <= 0) return;
  ctx.globalAlpha = a;
  const y = 1626;
  ctx.fillStyle = 'rgba(32,27,39,0.12)'; ctx.fillRect(MX, y - 40, MR - MX, 1.5);
  let sx = 1, sy = 1;
  if (P) { if (P.air) { sx = 1 / P.stretch; sy = P.stretch; } else { sx = P.sx; sy = P.sy; } }
  ctx.font = `500 22px ${MONO}`; ctx.letterSpacing = '1px';
  const hot = t >= CAP[0] && t < CAP[1] ? 1 : Math.abs(sx - 1) > 0.12 ? 1 : 0;
  const parts = [['SX ', SUB], [sx.toFixed(2), INK], ['   SY ', SUB], [sy.toFixed(2), INK], ['   SX·SY ', SUB], [(sx * sy).toFixed(2), hot ? ACC : INK]];
  let x = MX;
  for (const [s, c] of parts) { ctx.fillStyle = c; ctx.fillText(s, x, y); x += ctx.measureText(s).width; }
  const f = Math.round(t * FPS);
  ctx.textAlign = 'right'; ctx.fillStyle = SUB;
  ctx.fillText(`F ${String(f).padStart(3, '0')} / ${D * FPS}`, MR, y);
  ctx.textAlign = 'left'; ctx.letterSpacing = '0px';
  ctx.globalAlpha = 1;
}

function drawRuler(ctx, t) {
  // the whole piece as a dope-sheet strip: frame ticks, the eight principle beats, the smear frames, a playhead
  const a = smooth((t - 0.15) / 0.5);
  if (a <= 0) return;
  const y = 1556, X = (tt) => MX + (MR - MX) * (tt / D);
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(32,27,39,0.55)'; ctx.fillRect(MX, y, (MR - MX) * smooth((t - 0.15) / 0.8), 2);
  for (let k = 0; k <= D * FPS; k += 5) {
    const sec = k % FPS === 0, x = X(k / FPS);
    if (x > MX + (MR - MX) * smooth((t - 0.15) / 0.8) + 1) break;
    ctx.fillRect(x - (sec ? 1 : 0.5), y + 2, sec ? 2 : 1, sec ? 12 : 5);
  }
  ctx.font = `500 15px ${MONO}`; ctx.fillStyle = SUB; ctx.textAlign = 'center';
  for (let k = 0; k <= D; k += 1) ctx.fillText(String(k), X(k), y + 32);
  // smear frames (and the multiples of the drop) as accent marks under the line
  ctx.fillStyle = ACC;
  for (const k of [Math.ceil(T.upBig * FPS), ...GHOST]) ctx.fillRect(X(k / FPS) - 1.5, y + 2, 3, 14);
  // principle beats
  ctx.font = `600 14px ${MONO}`;
  let cur = -1;
  for (let k = 0; k < 8; k++) if (t >= CAP[k]) cur = k;
  const recap = t >= CAP[8];
  for (let k = 0; k < 8; k++) {
    const x = X(CAP[k]), done = k < cur || recap, now = k === cur && !recap;
    ctx.fillStyle = now ? ACC : done ? INK : '#e4dccd';
    ctx.beginPath(); ctx.roundRect(x - 17, y - 34, 34, 22, 6); ctx.fill();
    ctx.fillRect(x - 1, y - 12, 2, 12);
    ctx.fillStyle = now || done ? '#fffaf1' : SUB;
    ctx.fillText(String(k + 1).padStart(2, '0'), x, y - 18);
  }
  ctx.textAlign = 'left';
  // playhead
  const x = X(t);
  ctx.fillStyle = ACC; ctx.fillRect(x - 1.5, y - 44, 3, 62);
  ctx.beginPath(); ctx.moveTo(x - 8, y - 50); ctx.lineTo(x + 8, y - 50); ctx.lineTo(x, y - 40); ctx.fill();
  ctx.globalAlpha = 1;
}
