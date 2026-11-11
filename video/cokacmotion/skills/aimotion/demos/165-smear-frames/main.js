/*
 * 165 · 도토리 낚아채기 — hand-drawn speed: a squirrel on twos and threes, one smear drawing, one drawing of
 * multiples, a two-frame impact flash, and a timing chart that steps with the drawings.
 *
 *   0–0.8    3s   on a branch in an autumn forest the squirrel grooms; leaves fall on ones
 *   0.8–1.8  2s/3s  it notices the acorn hanging across the gap, stares, blinks
 *   1.8–3.5  2s/3s  crouch, a butt wiggle, then a held breath on threes (the long hold before the dash)
 *   3.5–3.9  2s   the dash: launch key · smear · multiples · impact (2 frames, palette swap) · fall · landing squash
 *   3.9–4.85 2s   overshoot and settle on the far branch, the acorn raised; the gust stirs the leaves
 *   4.85–9.05     afterglow: the chart zooms into the dash, its six drawings come back as onion skins on the arc
 *   9.07–10  2s   it bites the acorn
 *
 * The character's picture changes only when the exposure sheet (XS) says so; leaves, light and camera change every
 * frame. Everything is a function of the frame number n = floor(t·30).
 */
import { defineDemo, rand, clamp, lerp, smooth, ease, track } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import * as S from './squirrel.js';
import * as F from './forest.js';
import { drawChart, CH } from './chart.js';

const D = 10, FPS = 30, TAU = Math.PI * 2;
const { W, H } = F;
const KR = `"${FONTS.pretendard.family}"`;
const ACC = S.COL.acc, INK = S.COL.ink, CREAM = S.COL.cream;

// ---------------------------------------------------------------- stepped timing
/** t_k = floor(t·fps)/fps: the instant a layer's current drawing was made for (30 = ones, 15 = twos, 10 = threes) */
const stepT = (t, fps) => Math.floor(t * fps + 1e-6) / fps;
const frameOf = (t) => Math.floor(t * FPS + 1e-6);

// ---------------------------------------------------------------- the set
const FOOT0 = [184, F.branchTop(F.BR.left, 184)];
const LAND = [880, F.branchTop(F.BR.right, 880)];
const uOf = (b, x) => clamp((x - b.x0) / (b.x1 - b.x0));
const UL = uOf(F.BR.left, FOOT0[0]), UR = uOf(F.BR.right, LAND[0]);
const N_LAUNCH = 105, N_GRAB = 111, N_LAND = 115;
const T_GRAB = N_GRAB / FPS;
const sway = (tl) => 6 * Math.sin(TAU * 0.33 * tl) + 3 * Math.sin(TAU * 0.71 * tl + 1);
/** the acorn's twig whips up after the grab (on ones) */
const snapAt = (tl) => (tl < T_GRAB ? 0 : -46 * Math.exp(-(tl - T_GRAB) / 0.42) * Math.cos(TAU * 1.7 * (tl - T_GRAB)));
const acornOrigin = (tl) => { const p = F.twigPath(sway(tl), 0); return [p[p.length - 2] - 6.3, p[p.length - 1] + 24.3]; };
// branch bends follow the character's drawings (twos): the push of the launch, the weight of the landing
const bendL = (nk) => { const s = (nk - N_LAUNCH) / FPS; return s < 0 ? 0 : 24 * Math.exp(-s / 0.3) * Math.cos(TAU * 2.4 * s); };
const bendR = (nk) => { const s = (nk - N_LAND) / FPS; return s < 0 ? 0 : 30 * Math.exp(-s / 0.36) * Math.cos(TAU * 2.0 * s); };

// ---------------------------------------------------------------- the dash: two arcs and a pose for every point u ∈ [0, 2]
const bez2 = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
const bez2d = (a, c, b, u) => [2 * (1 - u) * (c[0] - a[0]) + 2 * u * (b[0] - c[0]), 2 * (1 - u) * (c[1] - a[1]) + 2 * u * (b[1] - c[1])];
const hipOf = (P) => { const m = S.matrixOf(P, S.shapeOf(P)); return [m[4], m[5]]; };
const PL = S.poseOf({ c: 0.3, l: 0.7, rot: -0.85, st: 1.32, sa: -0.85, foot: [FOOT0[0] + 30, FOOT0[1]], ear: 1, focus: 1 });
const PG = S.poseOf({ l: 1, rot: -0.12, st: 1.15, sa: -0.12, hip: [0, 0], ear: 1, eye: 1, acorn: 1, focus: 0.3 });
const PLD = S.poseOf({ g: 1, st: 1.36, sa: 0, rot: 0, foot: LAND, acorn: 1, hold: 1, ear: 0.5, eye: 1 });
const A0 = hipOf(PL), LH = hipOf(PLD);
const GH = (() => {                       // the hip that puts the held acorn exactly where it hangs at the grab
  const s = S.shapeOf(PG), m = S.matrixOf(PG, s), o = acornOrigin(T_GRAB);
  const px = s.paw[0] + 4, py = s.paw[1] - 14;
  return [o[0] - (m[0] * px + m[2] * py), o[1] - (m[1] * px + m[3] * py)];
})();
const C1 = [lerp(A0[0], GH[0], 0.3), GH[1] + 12], C2 = [lerp(GH[0], LH[0], 0.42), GH[1] - 64];
/** the dash pose at arc position u (0 launch key, 1 grab key, 2 landing key) */
function dashPose(u) {
  if (u <= 0) return S.poseOf(Object.assign({}, PL, { foot: null, hip: A0 }));
  if (u <= 1) {
    const rot = lerp(PL.rot, PG.rot, smooth(u));
    return S.poseOf({ c: 0.3 * (1 - u) * (1 - u), l: lerp(0.7, 1, smooth(Math.min(1, u * 1.6))), rot, sa: rot,
      st: lerp(1.32, 1.15, u) + 0.32 * Math.sin(Math.PI * u), hip: bez2(A0, C1, GH, u), ear: 1, eye: 1, focus: lerp(1, 0.3, u), acorn: u >= 1 ? 1 : 0 });
  }
  const v = Math.min(1, u - 1);
  return S.poseOf({ l: 1 - v * v, g: v * v, rot: lerp(PG.rot, 0, smooth(v)), sa: lerp(-0.12, 0, v) + 0.65 * Math.sin(Math.PI * v),
    st: 1.15 + 0.12 * Math.sin(Math.PI * v) + 0.21 * Math.pow(v, 4), hip: bez2(GH, C2, LH, v), ear: lerp(1, 0.5, v), eye: 1, acorn: 1, hold: smooth(v) });
}
const dashDir = (u) => { const d = u <= 1 ? bez2d(A0, C1, GH, Math.max(u, 0.02)) : bez2d(GH, C2, LH, Math.min(u - 1, 0.98)); const l = Math.hypot(d[0], d[1]); return [d[0] / l, d[1] / l]; };
const dashHip = (u) => (u <= 1 ? bez2(A0, C1, GH, Math.max(0, u)) : bez2(GH, C2, LH, Math.min(1, u - 1)));

// ---------------------------------------------------------------- the exposure sheet: every drawing, its frame, its kind
// kind: key (원화, circled) · bd (breakdown, triangle) · ib (inbetween, plain tick); fx: smear · multi · impact
const XS = [];
const put = (n, kind, P, x = {}) => XS.push(Object.assign({ n, kind, P: S.poseOf(P), fx: null }, x));
const breath = (n) => 0.014 * Math.sin((TAU * n) / FPS / 1.5);
const SIT0 = { foot: FOOT0, hA: 0.42, tailS: 0 };
const LOOK = { foot: FOOT0, hA: -0.46, ear: 1, pawY: 8, eye: 1 };
const CROUCH = { c: 1, foot: FOOT0, hA: -0.44, ear: 1, focus: 0.5, tailK: -0.1 };
const HELD = Object.assign({}, CROUCH, { st: 1.17, sa: 0, focus: 1, tailK: -0.2 });
const SETTLE = { foot: LAND, hold: 1, acorn: 1, hA: -0.1, ear: 0.8 };
const PROUD = { p: 1, foot: LAND, acorn: 1, hA: -0.36, ear: 1, eye: 1 };
const MUNCH = { p: 0.12, hold: 1, foot: LAND, acorn: 1, hA: 0.3, ear: 0.8, eye: 0.8 };
const mixO = (a, b, w) => S.mixPose(S.poseOf(a), S.poseOf(b), w);
// A · grooming, a moving hold on threes
[0, -10, -3, -12, 0, -9, -2, -11].forEach((py, i) => {
  const n = i * 3;
  put(n, i ? 'ib' : 'key', Object.assign({}, SIT0, { pawY: py, hA: 0.42 + (i % 2 ? 0.05 : 0), st: 1 + breath(n), sa: -Math.PI / 2, tailS: 0.05 * Math.sin(n * 0.15) }));
});
// B · it notices: a head turn on twos with an overshoot (spacing chart: 0 .1 .38 .74 1.07 1)
[0, 0.1, 0.38, 0.74, 1.07, 1].forEach((s, i) => {
  const P = mixO(SIT0, LOOK, s);
  P.tailK = -0.28 * Math.sin(Math.PI * clamp(s - 0.1, 0, 1));          // the tail follows a drawing late
  put(24 + i * 2, i === 0 || i === 5 ? 'key' : i === 2 ? 'bd' : 'ib', P);
});
// C · the stare, threes, one blink
[1, 1, 1, 0, 0.6, 1].forEach((e, i) => {
  const n = 36 + i * 3;
  put(n, i ? 'ib' : 'key', Object.assign({}, LOOK, { eye: e, st: 1 + breath(n), sa: -Math.PI / 2, tailS: 0.04 * Math.sin(n * 0.2) }));
});
// D · crouch on twos (slow out, slow in)
[0, 0.05, 0.16, 0.34, 0.56, 0.76, 0.9, 0.97, 1].forEach((s, i) => {
  put(54 + i * 2, i === 0 || i === 8 ? 'key' : i === 4 ? 'bd' : 'ib', mixO(LOOK, CROUCH, s));
});
// E · the butt wiggle, twos
[-8, 8, -10, 10, -6, 0].forEach((w, i) => put(72 + i * 2, i ? 'ib' : 'key', Object.assign({}, CROUCH, { wig: w, tailS: -w * 0.008 })));
// F · held breath on threes: the squash deepens (sx·sy = 1), a 1-px tremble
[0, 0.3, 0.52, 0.68, 0.8, 0.9, 1].forEach((s, i) => {
  const P = mixO(CROUCH, HELD, s);
  P.dy = i % 2 ? 1.2 : -0.6;
  put(84 + i * 3, i === 0 || i === 6 ? 'key' : 'ib', P);
});
// G · the dash on twos: spacing along the arc 0 → .6 → .9 → 1 (ease into the grab) → 1.45 → 2 (falling, spacing grows)
const DASH = [[0, 'key', null, '출발'], [0.6, 'ib', 'smear', '스미어'], [0.9, 'bd', 'multi', '다중상'], [1, 'key', 'impact', '임팩트'], [1.45, 'ib', 'multi', '동화'], [2, 'key', null, '착지']];
DASH.forEach(([u, kind, fx, name], i) => put(N_LAUNCH + i * 2, kind, i === 0 ? PL : i === 5 ? PLD : dashPose(u), { fx, u, name, dash: i + 1 }));
// H · overshoot and settle (twos), then the acorn goes up
[[0.84, 0.5, 'bd'], [1.1, 0.25, 'ib'], [1.03, 0.1, 'ib'], [1, 0, 'key']].forEach(([st, g, kind], i) => {
  put(117 + i * 2, kind, Object.assign({}, SETTLE, { st, sa: 0, g, tailK: i === 0 ? 0.35 : 0.12 * (1 - i / 3), ear: i === 0 ? 1 : 0.8 }));
});
[0, 0.1, 0.3, 0.55, 0.78, 0.93, 1].forEach((s, i) => put(125 + i * 2, i === 6 ? 'key' : i === 3 ? 'bd' : 'ib', mixO(SETTLE, PROUD, s)));
// I · proud moving hold on threes
for (let n = 139, i = 0; n < 272; n += 3, i++) {
  put(n, i ? 'ib' : 'key', Object.assign({}, PROUD, { st: 1 + breath(n), sa: -Math.PI / 2, tailS: 0.05 * Math.sin(n * 0.11), hA: -0.36 + 0.04 * Math.sin(n * 0.09) }));
}
// J · the bite, twos
for (let n = 272, i = 0; n < 300; n += 2, i++) {
  const s = Math.min(1, i / 3);
  const P = mixO(PROUD, MUNCH, ease.inOutCubic(s));
  if (i >= 3) { P.chew = i % 2 ? 1 : 0.25; P.eye = i % 2 ? 0.35 : 0.8; }
  put(n, i === 0 || i === 3 ? 'key' : 'ib', P);
}
// the branch carries the weight: the stance sinks with the branch's bend at the drawing's own (stepped) time
for (const d of XS) {
  if (d.n <= N_LAUNCH && d.P.foot) d.P.dy = (d.P.dy || 0) + bendL(d.n) * UL * UL;
  if (d.n >= N_LAND) d.P.dy = (d.P.dy || 0) + bendR(d.n) * UR * UR;
}
const SECTIONS = [[0, 24, '3프레임'], [24, 36, '2프레임'], [36, 54, '3프레임'], [54, 84, '2프레임'], [84, 105, '3프레임'], [105, 139, '2프레임'], [139, 272, '3프레임'], [272, 300, '2프레임']];
function drawingAt(n) {
  let lo = 0, hi = XS.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (XS[m].n <= n) lo = m; else hi = m - 1; }
  return lo;
}
const DASH_IDX = XS.map((d, i) => (d.dash ? i : -1)).filter((i) => i >= 0);
const DASH_LAB = new Map(DASH_IDX.map((i) => [i, { no: XS[i].dash, name: XS[i].name }]));

// ---------------------------------------------------------------- smear, multiples, speed lines (built once per drawing)
const taper = (s) => 0.06 + 0.94 * Math.pow(s, 1.25);
/**
 * The smear is the area swept by the body's circles between the previous drawing (u0) and this one (u1): M sub-poses
 * along the arc, each circle's radius tapering toward the trailing end, each consecutive pair joined by its convex hull
 * (outer tangents). The union of those hulls is one long streak that bends with the arc. Hind feet and tail are left
 * out: they swing about the hip while the body travels, so their sweeps fan out into lobes; in the smear they dissolve
 * into the streak, and the trailing end is not filled but breaks into dry-brush bristles in the tail's colour.
 */
function smearGeom(u0, u1, M = 16) {
  const subs = [];
  for (let j = 0; j <= M; j++) subs.push(S.build(dashPose(lerp(u0, u1, j / M))));
  const hulls = { tail: [], body: [], head: [], limb: [] };
  const j0 = Math.round(0.3 * M);
  for (let i = 0; i < 6; i++) {                           // body ×3, head ×2, front paw
    for (let j = j0; j < M; j++) {
      const a = subs[j].sweep[i], b = subs[j + 1].sweep[i];
      hulls[a.k].push(S.hull(a.x, a.y, a.r * taper(j / M), b.x, b.y, b.r * taper((j + 1) / M), 8));
    }
  }
  // dry brush: the trailing end splits into broken bristles along the arc, inside the tapering body width
  const r = rand(1650 + Math.round(u1 * 100));
  const brush = [];
  for (let k = 0; k < 17; k++) {
    const side = (r() - 0.5) * 2, s0a = r() * 0.07, s1a = 0.36 + r() * 0.14, w = 3 + r() * 5, tail = r() < 0.55;
    let s0 = s0a;
    while (s0 < s1a) {
      const s1 = Math.min(s1a, s0 + 0.08 + r() * 0.16), pts = [];
      for (let q = 0; q <= 6; q++) {
        const s = lerp(s0, s1, q / 6), u = lerp(u0, u1, s), p = dashHip(u), d = dashDir(u), off = side * 46 * (0.3 + 0.7 * s / 0.45);
        pts.push(p[0] - d[1] * off + d[0] * 30, p[1] + d[0] * off + d[1] * 30);
      }
      brush.push({ pts, w: w * (0.35 + 0.65 * s1 / s1a), tail });
      s0 = s1 + 0.02 + r() * 0.05;
    }
  }
  return { hulls, brush, lead: subs[M] };
}
/** multiples: outlined copies of the tail and paws at sub-frame positions between the previous drawing and this one */
function multiGeom(u0, u1, N) {
  const out = [];
  for (let j = 1; j <= N; j++) { const s = j / (N + 1); out.push({ s, B: S.build(dashPose(lerp(u0, u1, s))) }); }
  return out;
}
/** speed lines: parallel to the velocity, behind the body; a new set per drawing (they are drawn on twos too) */
function speedGeom(seed, c, d, n = 15) {
  const r = rand(seed), out = [];
  for (let k = 0; k < n; k++) {
    let side = (r() - 0.5) * 2;
    side = Math.sign(side) * (70 + 230 * Math.abs(side));          // keep the body's own line clear
    const back = -80 + r() * 420, len = 110 + r() * 280, w = 2.5 + r() * 4.5;
    const x = c.x - d[0] * back - d[1] * side, y = c.y - d[1] * back + d[0] * side;
    out.push({ x, y, dx: d[0], dy: d[1], len, w, cream: r() < 0.3 });
  }
  return out;
}
function drawSpeed(g, L, a = 1) {
  for (const s of L) {
    const nx = -s.dy * s.w * 0.5, ny = s.dx * s.w * 0.5, bx = s.x - s.dx * s.len, by = s.y - s.dy * s.len;
    g.globalAlpha = a * 0.28;
    g.fillStyle = INK;
    g.beginPath(); g.moveTo(s.x + nx + 2, s.y + ny + 3); g.lineTo(bx + 2, by + 3); g.lineTo(s.x - nx + 2, s.y - ny + 3); g.fill();
    g.globalAlpha = a;
    g.fillStyle = s.cream ? CREAM : ACC;
    g.beginPath(); g.moveTo(s.x + nx, s.y + ny); g.lineTo(bx, by); g.lineTo(s.x - nx, s.y - ny); g.arc(s.x, s.y, s.w * 0.5, Math.atan2(-ny, -nx), Math.atan2(ny, nx)); g.fill();
  }
  g.globalAlpha = 1;
}
function drawSmear(g, SM, look = 'full') {
  const all = [...SM.hulls.tail, ...SM.hulls.limb, ...SM.hulls.body, ...SM.hulls.head];
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (look === 'full') {
    S.group(g, all, null, ACC, S.O + 4);                 // the smear's edge glows in the accent
    for (const b of SM.brush) { g.beginPath(); S.poly(g, b.pts); g.lineWidth = b.w + 4; g.strokeStyle = INK; g.stroke(); }
    S.group(g, all, null, INK, S.O);
    for (const b of SM.brush) { g.beginPath(); S.poly(g, b.pts); g.lineWidth = b.w; g.strokeStyle = b.tail ? S.COL.tail : S.COL.fur; g.stroke(); }
    S.fillPolys(g, SM.hulls.tail, S.COL.tail);
    S.fillPolys(g, [...SM.hulls.limb, ...SM.hulls.body, ...SM.hulls.head], S.COL.fur);
    const L = SM.lead;                                   // the leading end is the new pose: head, eye, front paw
    S.group(g, L.head, S.COL.fur);
    S.fillPolys(g, [L.earIn], S.COL.pink);
    g.save(); g.beginPath(); for (const p of L.head) { S.poly(g, p); g.closePath(); } g.clip(); S.fillPolys(g, [L.muzzle], CREAM); g.restore();
    S.fillPolys(g, [L.ring], CREAM);
    g.save(); g.translate(L.eye.c[0], L.eye.c[1]); g.rotate(L.eye.hA);
    g.beginPath(); g.ellipse(0, 0, 8.2, 5.5, 0, 0, TAU); g.fillStyle = S.COL.eye; g.fill();
    g.beginPath(); g.arc(2.6, -1.8, 2.4, 0, TAU); g.fillStyle = '#fff8ec'; g.fill();
    g.restore();
    g.beginPath(); g.ellipse(L.nose[0], L.nose[1], 6.5, 5, L.eye.hA, 0, TAU); g.fillStyle = INK; g.fill();
    S.group(g, L.arm, S.COL.fur);
  }
}
function drawMultiples(g, MU, alpha = 1) {
  g.lineJoin = 'round';
  for (const { s, B } of MU) {
    g.beginPath(); S.poly(g, B.tail); g.closePath();
    for (const p of [...B.paws, ...B.feet]) { S.poly(g, p); g.closePath(); }
    g.globalAlpha = alpha * (0.08 + 0.14 * s);
    g.fillStyle = S.COL.tailL; g.fill();
    g.globalAlpha = alpha * (0.45 + 0.5 * s);
    g.lineWidth = 3.6; g.strokeStyle = INK; g.stroke();
  }
  g.globalAlpha = 1;
}

// ---------------------------------------------------------------- leaves on ones
const LEAVES = [], BRL = { left: [], right: [] }, MOTES = [];
function buildLeaves() {
  const r = rand(1652);
  const cols = [F.PAL.leafA, F.PAL.leafB, F.PAL.leafC, F.PAL.leafD, '#a4552d'];
  for (let i = 0; i < 22; i++) {
    const front = i < 7, hero = i === 0;
    const L = { x0: 40 + r() * 1000, y0: -150 + r() * 1900, vy: 38 + r() * 46, A: 30 + r() * 50, w: 0.6 + r() * 0.9, ph: r() * TAU,
      spin: 1.4 + r() * 2.6, s: front ? 20 + r() * 8 : 12 + r() * 9, col: cols[Math.floor(r() * cols.length)], front, drift: (r() - 0.5) * 14 };
    if (hero) { L.vy = 58; L.s = 26; L.x0 = 360; L.y0 = 1150 - 58 * 3.0; L.A = 46; L.ph = 0.4; L.col = F.PAL.leafC; }
    // the dash's gust: how close the leaf was to the path at the grab, and the push it gets
    const p = leafBase(L, T_GRAB);
    let best = 1e9;
    for (let u = 0; u <= 2; u += 0.05) { const h = dashHip(u); best = Math.min(best, Math.hypot(p[0] - h[0], p[1] - h[1])); }
    L.gust = 170 * Math.exp(-(best * best) / (2 * 190 * 190));
    LEAVES.push(L);
  }
  for (let i = 0; i < 7; i++) BRL.left.push({ u: 0.45 + r() * 0.5, dx: (r() - 0.5) * 30, dy: -16 - r() * 18, s: 15 + r() * 7, a: -0.8 + r() * 1.6, col: cols[Math.floor(r() * cols.length)] });
  for (let i = 0; i < 8; i++) BRL.right.push({ u: 0.4 + r() * 0.55, dx: (r() - 0.5) * 30, dy: -16 - r() * 20, s: 15 + r() * 7, a: -0.8 + r() * 1.6, col: cols[Math.floor(r() * cols.length)] });
  for (let i = 0; i < 26; i++) MOTES.push({ x: 60 + r() * 700, y: 500 + r() * 900, a: 0.3 + r() * 0.5, s: 10 + r() * 22, ph: r() * TAU, sp: 0.2 + r() * 0.4 });
}
function leafBase(L, tl) {
  const top = -160, span = 1960;
  const y = ((((L.y0 + L.vy * tl - top) % span) + span) % span) + top;
  return [L.x0 + L.drift * tl + L.A * Math.sin(L.w * tl + L.ph), y];
}
function leafAt(L, tl) {
  const p = leafBase(L, tl);
  let spinX = 0;
  if (tl > T_GRAB && L.gust > 1) {                       // pushed along the dash, a closed-form ease-out
    const k = 1 - Math.exp(-(tl - T_GRAB) / 0.35), dir = dashDir(1.2);
    p[0] += dir[0] * L.gust * k * 1.4; p[1] += (dir[1] - 0.6) * L.gust * k * 0.8;
    spinX = (L.gust / 170) * 7 * k;
  }
  return { x: p[0], y: p[1], a: 0.7 * Math.sin(L.w * tl + L.ph + 1) + spinX * 0.3, flip: Math.cos(L.spin * tl + L.ph + spinX) };
}

// ---------------------------------------------------------------- camera on ones
const CC = [540, 1040];
const zoomT = track([[0, 1.1], [3.3, 1.15], [3.62, 1.09, ease.outCubic], [5.2, 1.1], [6.0, 1.04], [10, 1.05]]);
const focT = track([[0, [460, 1090]], [3.3, [420, 1110]], [3.62, [560, 1070], ease.outCubic], [5.2, [620, 1060]], [6.0, [535, 1070]], [10, [540, 1066]]]);
function camShake(tl) {
  let x = 0, y = 0;
  for (const [n0, A] of [[N_GRAB, 15], [N_LAND, 9]]) {
    const s = tl - n0 / FPS;
    if (s < 0) continue;
    const e = A * Math.exp(-s / 0.11);
    x += e * Math.sin(TAU * 17 * s); y += e * Math.cos(TAU * 13 * s);
  }
  return [x, y];
}
/** the camera matrix for a layer with parallax factor f (1 = the character's plane) */
function camM(tl, f) {
  const z = zoomT(tl), Fp = focT(tl), sh = camShake(tl);
  const zf = 1 + f * (z - 1), fx = CC[0] + f * (Fp[0] - CC[0]), fy = CC[1] + f * (Fp[1] - CC[1]);
  return [zf, 0, 0, zf, CC[0] - zf * fx + sh[0] * f, CC[1] - zf * fy + sh[1] * f];
}

// ---------------------------------------------------------------- afterglow timing (real time)
const R = { dim: [4.85, 5.35], zoom: [4.85, 5.55], arc: [5.15, 5.75], skin: [5.3, 5.7], step0: 5.55, step: 0.4, all: [7.95, 8.55], out: [8.55, 9.05], head: 5.4, unzoom: [8.6, 9.2] };
const dimAt = (t) => smooth((t - R.dim[0]) / (R.dim[1] - R.dim[0])) * (1 - smooth((t - R.out[0]) / (R.out[1] - R.out[0])));
const replayIdx = (t) => (t < R.step0 || t >= R.all[0] ? -1 : Math.min(5, Math.floor((t - R.step0) / R.step + 1e-6)));

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '165-smear-frames',
  title: '도토리 낚아채기',
  tech: '작화 연출 · 스미어 · 다중상 · 2프레임 찍기 + 타이밍 차트',
  duration: D,
  fps: FPS,
  background: '#141e18',

  async setup(api) {
    const TEXT = '타이밍 차트다람쥐 그림 한 장 = 눈금 하나원화브레이크다운동화스미어다중상임팩트출발착지3프레임2프레임f0123456789 도토리까지 0.2초,그림 네 장으로 건넜다';
    await fontReady(`700 27px ${KR}`, TEXT);
    await fontReady(`500 19px ${KR}`, TEXT);
    await fontReady(`800 64px ${KR}`, TEXT);
    F.setCPU(api.headless);
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = ctx;
    const r = rand(165);
    this.far = F.bakeFar(r); this.mid = F.bakeMid(r); this.shafts = F.bakeShafts(r); this.near = F.bakeNear(r);
    this.fore = [F.bakeForeLeaf('#7a3a20', 7), F.bakeForeLeaf('#4f5f2e', 9), F.bakeForeLeaf('#9a4a24', 6)];
    this.vig = F.bakeVignette(); this.mote = F.bakeMote();
    this.scr = F.mk(W, H);
    buildLeaves();
    for (const d of XS) d.B = S.build(d.P);
    for (const i of DASH_IDX) {
      const d = XS[i], prev = XS[i - 1];
      const u0 = prev.u ?? 0;
      if (d.fx === 'smear') d.SM = smearGeom(u0, d.u);
      if (d.fx === 'multi') d.MU = multiGeom(u0, d.u, d.u > 1 ? 2 : 3);
      if (d.fx === 'smear' || d.fx === 'multi' || (d.u > 1 && d.u < 2)) d.SL = speedGeom(4000 + d.n, d.B.sweep[1], dashDir(d.u), d.fx === 'smear' ? 18 : 13);
    }
    // warm the scratch canvas once (first composite of a fresh canvas can rasterise differently)
    this.scr.g.fillRect(0, 0, 4, 4); ctx.drawImage(this.scr.c, 0, 0); this.scr.g.clearRect(0, 0, W, H);
  },

  frame(t) {
    const g = this.ctx;
    if (g.reset) g.reset();
    const n = frameOf(t), tl = stepT(t, FPS);          // ones: leaves, light, camera
    const di = drawingAt(n), d = XS[di], nk = d.n;     // the character: the drawing exposed at this frame
    const impact = d.fx === 'impact' && n < N_GRAB + 2;

    if (impact) this.drawImpact(g, d, n - N_GRAB, tl);
    else this.drawScene(g, t, tl, n, d, nk);

    // ---- the timing chart (screen space)
    // live: frames 0–160 · afterglow: zoomed into the dash (101–119) · ending: the whole film (0–300)
    const zp = ease.inOutCubic(clamp((t - R.zoom[0]) / (R.zoom[1] - R.zoom[0])));
    const zo = ease.inOutCubic(clamp((t - R.unzoom[0]) / (R.unzoom[1] - R.unzoom[0])));
    const A = lerp(lerp(0, 101, zp), 0, zo), B = lerp(lerp(160, 119, zp), 300, zo);
    const ri = replayIdx(t);
    const inv = impact && n === N_GRAB + 1;
    drawChart(g, {
      XS, n, A, B, fg: inv ? '#1c140e' : '#f6e5c9', fgInv: inv ? '#ffc21a' : '#1c140e', acc: inv ? '#1c140e' : ACC,
      appear: clamp((t - 0.25) / 0.7), legend: Math.max(1 - zp, zo), secA: Math.max(1 - smooth(zp * 2), smooth((zo - 0.5) * 2)),
      names: smooth((zp - 0.6) / 0.4) * (1 - smooth(zo * 2.5)),
      cur: ri >= 0 ? DASH_IDX[ri] : zp > 0 && zo < 0.5 && n > 160 ? -1 : di,
      hair: t < R.zoom[0] || zo > 0.5 ? 1 : 0, sections: SECTIONS, dash: DASH_LAB,
      counter: ri >= 0 ? `f ${XS[DASH_IDX[ri]].n}` : `f ${n}`,
    });
    if (t < 0.45) { g.globalAlpha = 1; g.fillStyle = `rgba(12,16,12,${(1 - ease.outCubic(t / 0.45)).toFixed(3)})`; g.fillRect(0, 0, W, H); }
  },

  drawScene(g, t, tl, n, d, nk) {
    const set = (m) => g.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    // far → mid → light → near
    set(camM(tl, 0.22)); g.drawImage(this.far, -F.MG, -F.MG);
    g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.85 + 0.15 * Math.sin(tl * 0.9);
    set(camM(tl, 0.4)); g.drawImage(this.shafts, -F.MG, -F.MG);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    set(camM(tl, 0.55)); g.drawImage(this.mid, -F.MG, -F.MG);
    set(camM(tl, 0.7));
    g.globalCompositeOperation = 'screen';
    for (const m of MOTES) {
      const x = m.x + 26 * Math.sin(m.sp * tl * 2 + m.ph), y = m.y - 14 * tl + 10 * Math.cos(m.sp * tl * 3 + m.ph);
      g.globalAlpha = m.a * (0.6 + 0.4 * Math.sin(tl * 2.1 + m.ph));
      g.drawImage(this.mote, x - m.s, y - m.s, m.s * 2, m.s * 2);
    }
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    const M1 = camM(tl, 1);
    set(M1); g.drawImage(this.near, -F.MG, -F.MG);
    // back leaves (ones)
    for (const L of LEAVES) if (!L.front) { const p = leafAt(L, tl); F.drawLeaf(g, p.x, p.y, L.s, p.a, p.flip, L.col); }
    // the branches bend with the character's drawings (twos)
    F.drawBranch(g, F.BR.left, bendL(nk), BRL.left);
    F.drawBranch(g, F.BR.right, bendR(nk), BRL.right);
    const tw = F.twigPath(sway(tl), snapAt(tl));
    F.drawTwig(g, tw);
    if (n < N_GRAB) { const o = acornOrigin(tl); S.drawAcorn(g, o[0], o[1], 0.04 * sway(tl) / 6, 0.9); }
    // ---- the character
    if (d.SL) drawSpeed(g, d.SL);
    if (d.fx === 'smear') drawSmear(g, d.SM);
    else {
      if (d.MU) drawMultiples(g, d.MU);
      const fade = 1 - 0.9 * dimAt(t);
      if (fade > 0.999) S.drawSquirrel(g, d.B);
      else {                                              // fades as one picture, through the scratch canvas
        const s = this.scr.g;
        s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, W, H); s.setTransform(M1[0], M1[1], M1[2], M1[3], M1[4], M1[5]);
        S.drawSquirrel(s, d.B);
        g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = fade; g.drawImage(this.scr.c, 0, 0); g.globalAlpha = 1;
        set(M1);
      }
    }
    // front leaves and the blurred foreground
    for (const L of LEAVES) if (L.front) { const p = leafAt(L, tl); F.drawLeaf(g, p.x, p.y, L.s, p.a, p.flip, L.col); }
    set(camM(tl, 1.4));
    for (const [img, x, y, s, a] of [[this.fore[0], -40, 1500, 1.4, -0.6], [this.fore[1], 980, 1380, 1.6, 2.4], [this.fore[2], 920, 260, 1.2, 0.9], [this.fore[1], -60, 380, 1.1, -2.2]]) {
      g.save(); g.translate(x + 8 * Math.sin(tl * 0.7 + x), y + 6 * Math.cos(tl * 0.6 + y)); g.rotate(a + 0.03 * Math.sin(tl * 0.8 + x)); g.scale(s, s);
      g.drawImage(img, -150, -150); g.restore();
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(this.vig, 0, 0);
    if (t >= R.dim[0]) this.drawAfterglow(g, t, tl, M1);
  },

  /** two frames of flat inverted silhouettes: ink ground / cream shapes, then accent ground / ink shapes */
  drawImpact(g, d, k, tl) {
    const bg = k === 0 ? '#1c140e' : ACC, fg = k === 0 ? CREAM : '#1c140e', ln = k === 0 ? ACC : '#1c140e';
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const M1 = camM(tl, 1);
    g.setTransform(M1[0], M1[1], M1[2], M1[3], M1[4], M1[5]);
    const o = acornOrigin(T_GRAB), r = rand(7000 + k);
    g.fillStyle = ln;
    for (let i = 0; i < 64; i++) {                     // concentration lines toward the grab
      const a = r() * TAU, w = 0.004 + r() * 0.014, r0 = 240 + r() * 220;
      g.beginPath(); g.moveTo(o[0] + Math.cos(a) * r0, o[1] + Math.sin(a) * r0);
      g.lineTo(o[0] + Math.cos(a - w) * 1800, o[1] + Math.sin(a - w) * 1800); g.lineTo(o[0] + Math.cos(a + w) * 1800, o[1] + Math.sin(a + w) * 1800); g.fill();
    }
    F.drawBranch(g, F.BR.left, bendL(d.n), BRL.left, fg);
    F.drawBranch(g, F.BR.right, 0, BRL.right, fg);
    g.lineJoin = 'round';
    S.group(g, S.allPolys(d.B), fg, fg);
    const a = d.B.acorn;
    g.save(); g.translate(a.c[0], a.c[1]); g.rotate(a.rot); g.scale(0.9, 0.9);
    g.beginPath(); g.ellipse(0, 8, 21, 25, 0, 0, TAU); g.ellipse(0, -6, 26, 16, 0, 0, TAU); g.fillStyle = fg; g.fill();
    g.restore();
    g.beginPath(); g.arc(d.B.eye.c[0], d.B.eye.c[1], 7, 0, TAU); g.fillStyle = bg; g.fill();
    g.setTransform(1, 0, 0, 1, 0, 0);
  },

  /** afterglow: the dash's six drawings come back as onion skins on their arc, one lit at a time */
  drawAfterglow(g, t, tl, M1) {
    const dim = dimAt(t);
    if (dim <= 0.001) return;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = `rgba(16,13,9,${(0.56 * dim).toFixed(3)})`; g.fillRect(0, 0, W, H);
    const set = () => g.setTransform(M1[0], M1[1], M1[2], M1[3], M1[4], M1[5]);
    set();
    // path of action, drawn on, with the spacing ticks where each drawing sits
    const ap = clamp((t - R.arc[0]) / (R.arc[1] - R.arc[0])) * dim;
    if (ap > 0) {
      const um = 2 * ease.inOutCubic(clamp((t - R.arc[0]) / (R.arc[1] - R.arc[0])));
      g.globalAlpha = ap; g.strokeStyle = 'rgba(246,229,201,0.75)'; g.lineWidth = 3; g.lineCap = 'round';
      for (let u = 0; u < um; u += 0.035) { const a = dashHip(u), b = dashHip(Math.min(um, u + 0.017)); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      for (const i of DASH_IDX) {
        const dd = XS[i]; if (dd.u > um + 1e-6) continue;
        const p = dashHip(dd.u), q = dashDir(dd.u), L = dd.kind === 'key' ? 20 : 13;
        g.lineWidth = dd.fx === 'smear' ? 5 : 3; g.strokeStyle = dd.fx === 'smear' ? ACC : 'rgba(246,229,201,0.9)';
        g.beginPath(); g.moveTo(p[0] - q[1] * L, p[1] + q[0] * L); g.lineTo(p[0] + q[1] * L, p[1] - q[0] * L); g.stroke();
      }
      g.globalAlpha = 1;
    }
    // onion skins
    const sp = clamp((t - R.skin[0]) / (R.skin[1] - R.skin[0])) * dim;
    const ri = replayIdx(t);
    if (sp > 0) {
      for (let k = 0; k < DASH_IDX.length; k++) {
        if (k === ri) continue;
        this.skin(g, XS[DASH_IDX[k]], sp * (ri >= 0 ? 0.75 : 1), M1);
      }
      if (ri >= 0) {
        const dd = XS[DASH_IDX[ri]];                       // the replay steps too: each drawing appears at once
        set();
        if (dd.SL) drawSpeed(g, dd.SL);
        if (dd.fx === 'smear') drawSmear(g, dd.SM);
        else if (dd.fx === 'impact') {
          g.lineJoin = 'round';
          S.group(g, S.allPolys(dd.B), INK, ACC, S.O + 2);
          g.beginPath(); g.arc(dd.B.eye.c[0], dd.B.eye.c[1], 7, 0, TAU); g.fillStyle = ACC; g.fill();
        } else { if (dd.MU) drawMultiples(g, dd.MU); S.drawSquirrel(g, dd.B); }
      }
      // numbers beside each drawing, alternating sides of the path of action
      set();
      g.font = `700 22px ${KR}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let k = 0; k < DASH_IDX.length; k++) {
        const dd = XS[DASH_IDX[k]], p = dashHip(dd.u), q = dashDir(dd.u), lit = k === ri, sd = k % 2 ? 1 : -1;
        const off = sd > 0 ? 88 : 62, bx = p[0] + q[1] * off * sd, by = p[1] - q[0] * off * sd;
        g.globalAlpha = sp * (lit ? 1 : 0.85);
        g.beginPath(); g.arc(bx, by, 17, 0, TAU);
        g.fillStyle = lit ? ACC : 'rgba(246,229,201,0.95)'; g.fill();
        g.fillStyle = INK; g.fillText(String(dd.dash), bx, by + 1);
      }
      g.globalAlpha = 1; g.textBaseline = 'alphabetic';
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    // headline
    const hp = clamp((t - R.head) / 0.5) * (1 - smooth((t - R.out[0]) / 0.4));
    if (hp > 0) {
      const e = ease.outCubic(hp);
      g.globalAlpha = hp; g.textAlign = 'left';
      g.font = `600 30px ${KR}`; g.fillStyle = 'rgba(246,229,201,0.78)';
      g.fillText('도토리까지 0.2초,', CH.x0, 432 + 18 * (1 - e));
      g.font = `800 64px ${KR}`; g.fillStyle = CREAM;
      g.fillText('그림 네 장으로 건넜다', CH.x0, 508 + 24 * (1 - e));
      g.globalAlpha = 1;
    }
  },

  /** an onion skin: the drawing's union silhouette as a faint fill and a thin outline (built on the scratch canvas) */
  skin(g, dd, a, M1) {
    const s = this.scr.g, polys = dd.SM ? [...dd.SM.hulls.tail, ...dd.SM.hulls.limb, ...dd.SM.hulls.body, ...dd.SM.hulls.head, ...dd.SM.lead.head] : S.allPolys(dd.B);
    s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'source-over'; s.clearRect(0, 0, W, H);
    s.setTransform(M1[0], M1[1], M1[2], M1[3], M1[4], M1[5]);
    s.lineJoin = 'round';
    S.group(s, polys, '#f6e5c9', '#f6e5c9', 2.2);
    s.globalCompositeOperation = 'destination-out';
    s.globalAlpha = 0.93;
    S.fillPolys(s, polys, '#000');
    s.globalAlpha = 1; s.globalCompositeOperation = 'source-over';
    s.setTransform(1, 0, 0, 1, 0, 0);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = a * 0.62;
    g.drawImage(this.scr.c, 0, 0);
    g.globalAlpha = 1;
  },
});
