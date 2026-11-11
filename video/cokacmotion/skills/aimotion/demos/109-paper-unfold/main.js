/*
 * 109 · 접힌 쪽지 — fold-line kinematics carrying a typographic layout.
 *
 * A note on lined paper is printed flat (front: the question, back: the answer), then folded the way notes are passed in
 * class: an accordion of four strips, then a cross fold. The sheet is 8 rigid panels (4 strips × 2 halves). Every strip
 * hangs off its neighbour by a hinge on the fold line (a rotation about that line, the axis lifted half a sheet thickness
 * so folded layers stack instead of interpenetrating); the cross fold turns the whole right block about the centre line.
 * Unfolding one hinge therefore carries everything further down the chain.
 *
 * Each frame: forward kinematics → world quads → perspective camera → panels sorted by plane tests (Newell) → every panel
 * drawn as a grid of affine triangles of the pre-rendered front or back texture (whichever side faces the camera), then
 * Lambert shading against the window light, crease occlusion inside folds, paper thickness on the edges, shadows of other
 * panels on it, and union shadows on the desk (light-projected cast shadow + footprint contact shadow, blurred at ¼ res).
 * Act 3 re-roots the chain at the second strip and folds the same creases into a tent card that shows the back.
 *
 * Canvas 2D, one canvas. Nothing is stepped: every angle is a closed form of t.
 */
import { defineDemo, rand, clamp, lerp, smooth, ease, track } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';

const D = 10;
const W = 1080, H = 1920;
const DEG = Math.PI / 180;
const KR = '"Pretendard Variable", sans-serif';
const HAND = '"Gaegu", sans-serif';

// ------------------------------------------------------------------------------------------------ paper
const PW = 840, PH = 1160, NS = 4, SH = PH / NS;   // 4 accordion strips (290 high) × 2 halves (cross fold at PW/2)
const EPS = 1.7;      // layer spacing in the folded stack (world px)
const THK = 1.7;      // paper thickness drawn on the edges
const TS = 1.5;       // texture px per paper unit
const PIV = [PW / 4, SH / 2];   // act 1–2 root pivot: centre of the folded packet (left half of strip 0)

// palette: warm afternoon classroom; ink navy + one accent (coral)
const INK = '#26325a', ACC = '#ff5a4c';
const PAPER = '#fbf8f0', PAPER_B = '#f4f0e5', EDGE = [214, 204, 184];
const SHADE = [50, 36, 68];       // shading tint (cool violet-brown)

// light: low sun through a window on the left, slightly in front (unit, world: x east, y toward camera, z up)
const L = (() => { const v = [-0.56, 0.3, 0.77], n = Math.hypot(...v); return v.map((x) => x / n); })();

// ------------------------------------------------------------------------------------------------ story times
const ARRIVE0 = 0.0, ARRIVE1 = 0.9;    // the packet is flicked in and slides to a stop
const X0 = 1.6, X1 = 2.45;                 // cross fold opens
const ACC_W = [[2.55, 4.0], [2.85, 4.35], [3.15, 4.7]];   // accordion hinges 1..3 open (fan, overlapping)
const SWITCH = 6.15;                       // re-root at strip 1, start folding the tent
const TENT_W = [[6.15, 7.15], [6.3, 7.45], [6.55, 7.7]];
const CHECK0 = 7.95, CHECK1 = 8.28;        // the answer: a check mark is written on
const GLINT0 = 4.7, GLINT1 = 5.5;
const RES = 7 * DEG;                       // creases never lie quite flat again
const TENT = [120 * DEG, 120 * DEG, 117.5 * DEG];

// ------------------------------------------------------------------------------------------------ 3×4 affine matrices (row-major)
const MI = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
function mmul(A, B) {
  return [
    A[0] * B[0] + A[1] * B[4] + A[2] * B[8], A[0] * B[1] + A[1] * B[5] + A[2] * B[9], A[0] * B[2] + A[1] * B[6] + A[2] * B[10], A[0] * B[3] + A[1] * B[7] + A[2] * B[11] + A[3],
    A[4] * B[0] + A[5] * B[4] + A[6] * B[8], A[4] * B[1] + A[5] * B[5] + A[6] * B[9], A[4] * B[2] + A[5] * B[6] + A[6] * B[10], A[4] * B[3] + A[5] * B[7] + A[6] * B[11] + A[7],
    A[8] * B[0] + A[9] * B[4] + A[10] * B[8], A[8] * B[1] + A[9] * B[5] + A[10] * B[9], A[8] * B[2] + A[9] * B[6] + A[10] * B[10], A[8] * B[3] + A[9] * B[7] + A[10] * B[11] + A[11],
  ];
}
const chain = (...ms) => ms.reduce(mmul);
const mT = (x, y, z) => [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z];
const mRx = (a) => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0]; };
const mRy = (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0]; };
const mRz = (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0]; };
function minv(M) {   // rigid
  const t0 = M[3], t1 = M[7], t2 = M[11];
  return [M[0], M[4], M[8], -(M[0] * t0 + M[4] * t1 + M[8] * t2),
    M[1], M[5], M[9], -(M[1] * t0 + M[5] * t1 + M[9] * t2),
    M[2], M[6], M[10], -(M[2] * t0 + M[6] * t1 + M[10] * t2)];
}
const ap = (M, x, y, z = 0) => [M[0] * x + M[1] * y + M[2] * z + M[3], M[4] * x + M[5] * y + M[6] * z + M[7], M[8] * x + M[9] * y + M[10] * z + M[11]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

/** hinge i (1..3) on the fold line v = i·SH: rotation of strip i relative to strip i−1. θ > 0 lifts strip i (valley,
 *  fronts meet). The axis sits half a thickness on the side the paper folds to, so a 180° fold lands one layer up. */
function hinge(i, th) {
  const v = i * SH, z = (th >= 0 ? 1 : -1) * EPS / 2;
  return chain(mT(0, v, z), mRx(th), mT(0, -v, -z));
}
/** cross fold: the right half of the whole (folded) stack turns about the centre line, just above the top layer */
function cross(phi) {
  const z = 3.5 * EPS;
  return chain(mT(PW / 2, 0, z), mRy(-phi), mT(-PW / 2, 0, -z));
}

// ------------------------------------------------------------------------------------------------ closed-form angles
const prog = (t, w) => clamp((t - w[0]) / (w[1] - w[0]));
// damped flutter after a hinge lands, forced to exactly 0 one second later
function flutter(t, t0, amp, k = 6.5, om = 15) {
  const s = t - t0;
  if (s <= 0 || s >= 1.05) return 0;
  const win = (1 - s / 1.05) ** 2;
  return amp * Math.exp(-k * s) * Math.sin(om * s) * win;
}
const arrivePos = (t) => {
  const p = clamp((t - ARRIVE0) / (ARRIVE1 - ARRIVE0));
  const e = 1 - (1 - p) ** 3.2;   // sliding friction
  return [lerp(-640, -210, e), lerp(300, -435, e)];
};
const rootYaw = track([[ARRIVE0, -58 * DEG], [ARRIVE1, -7 * DEG, (p) => 1 - (1 - p) ** 3], [X0, -7 * DEG], [4.6, -2.2 * DEG]]);
// toss: in the air until 0.44 s, one small rebound, then sliding
function hop(t) {
  if (t < 0.36) { const s = clamp((t - ARRIVE0) / (0.36 - ARRIVE0)); return 170 * (1 - s * s); }
  if (t < 0.54) { const s = (t - 0.36) / 0.18; return 24 * 4 * s * (1 - s); }
  return 0;
}

function act2(t) {
  const e = ease.inOutCubic;
  const th1 = lerp(Math.PI, RES, e(prog(t, ACC_W[0]))) + flutter(t, ACC_W[0][1], 5 * DEG);
  const th2 = lerp(-Math.PI, -RES, e(prog(t, ACC_W[1]))) + flutter(t, ACC_W[1][1], -5 * DEG);
  const th3 = lerp(Math.PI, RES, e(prog(t, ACC_W[2]))) + flutter(t, ACC_W[2][1], 6 * DEG);
  // the flap lands and bounces off the desk (never below it)
  const sx = t - X1;
  const bounce = sx > 0 && sx < 0.32 ? 7 * DEG * Math.abs(Math.sin(sx * Math.PI / 0.32 * 2)) * (1 - sx / 0.32) ** 2 : 0;
  const phi = Math.PI * (1 - e(prog(t, [X0, X1]))) + bounce;
  const pos = t < ARRIVE1 ? arrivePos(t) : [-210, -435];
  const yaw = rootYaw(t);
  const tilt = -RES / 2 * smooth((t - (ACC_W[2][1] - 0.5)) / 0.7);   // the relaxed zigzag rests on its valleys
  const root = chain(mT(pos[0], pos[1], 0), mRz(yaw), mRx(tilt), mT(-PIV[0], -PIV[1], 0));
  const H1 = hinge(1, th1), H2 = hinge(2, th2), H3 = hinge(3, th3);
  const A2 = mmul(H1, H2);
  const As = [MI, H1, A2, mmul(A2, H3)];
  const Lm = As.map((a) => mmul(root, a));
  const C = phi > 1e-7 ? cross(phi) : null;
  const Rm = C ? As.map((a) => chain(root, C, a)) : Lm;
  return { L: Lm, R: Rm, th: [th1, th2, th3], phi, yaw, tilt };
}

let SW = null;   // strip-1 pose at the switch (solved in setup)
function act3(t) {
  const e = ease.inOutCubic;
  const k = smooth((t - SWITCH) / 0.9);
  const root = chain(mT(SW.c[0], SW.c[1], SW.c[2]), mRz(SW.yaw * (1 - k)), mRx(SW.tau * (1 - k)), mT(-PW / 2, -1.5 * SH, 0));
  const th1 = lerp(RES, TENT[0], e(prog(t, TENT_W[0])));
  const th2 = lerp(-RES, TENT[1], e(prog(t, TENT_W[1])));
  const th3 = lerp(RES, TENT[2], e(prog(t, TENT_W[2])));
  const S1 = root, S0 = mmul(S1, minv(hinge(1, th1))), S2 = mmul(S1, hinge(2, th2)), S3 = mmul(S2, hinge(3, th3));
  const Lm = [S0, S1, S2, S3];
  return { L: Lm, R: Lm, th: [th1, th2, th3], phi: 0 };
}

/** full pose: 8 panels in world space, resting on the desk (lowest point at z = 0, plus the toss) */
function pose(t) {
  const p = t < SWITCH ? act2(t) : act3(t);
  const panels = [];
  let minZ = Infinity;
  for (let k = 0; k < NS; k++) {
    for (let c = 0; c < 2; c++) {
      const M = c ? p.R[k] : p.L[k];
      const u0 = c * PW / 2, u1 = u0 + PW / 2, v0 = k * SH, v1 = v0 + SH;
      const vw = [ap(M, u0, v0), ap(M, u1, v0), ap(M, u1, v1), ap(M, u0, v1)];
      for (const q of vw) minZ = Math.min(minZ, q[2]);
      panels.push({ k, c, M, u0, u1, v0, v1, vw });
    }
  }
  const dz = -minZ + hop(t);
  for (const P of panels) {
    P.M = mmul(mT(0, 0, dz), P.M);
    for (const q of P.vw) q[2] += dz;
    P.n = [P.M[2], P.M[6], P.M[10]];   // front normal (local +z)
    P.ctr = [(P.vw[0][0] + P.vw[2][0]) / 2, (P.vw[0][1] + P.vw[2][1]) / 2, (P.vw[0][2] + P.vw[2][2]) / 2];
  }
  return { ...p, panels, dz };
}

// ------------------------------------------------------------------------------------------------ camera
const FOC = 1900, CX = 540, CY = 930;
const camEl = track([[0, 63], [1.4, 63], [4.75, 60.5], [6.05, 59.5], [7.85, 37], [D, 35.5, (p) => p]]);
const camYaw = track([[0, 0], [6.05, 0], [7.85, -22], [D, -28, (p) => p]]);
const camDist = track([[0, 1460], [1.4, 1500], [4.75, 2060], [6.05, 1995, (p) => p], [7.85, 1820], [D, 1720, (p) => p]]);
let camTarget = null;   // built in setup from the solved poses
function punch(t) { const s = t - CHECK1; return s > 0 && s < 0.5 ? 0.014 * Math.exp(-9 * s) * Math.cos(26 * s) : 0; }

function makeCam(t) {
  const el = camEl(t) * DEG, ya = camYaw(t) * DEG, d = camDist(t), tg = camTarget(t);
  // handheld: a breath of drift
  const hx = 3.2 * Math.sin(t * 0.83 + 0.4), hy = 2.6 * Math.sin(t * 0.61 + 1.9);
  const ce = Math.cos(el), se = Math.sin(el), cy = Math.cos(ya), sy = Math.sin(ya);
  const f = [sy * ce, -cy * ce, -se], r = [cy, sy, 0], u = [sy * se, -cy * se, ce];
  const T = [tg[0] + hx, tg[1] + hy, tg[2]];
  const C = [T[0] - d * f[0], T[1] - d * f[1], T[2] - d * f[2]];
  return { C, f, r, u, F: FOC * (1 + punch(t)) };
}
function proj(cam, P) {
  const px = P[0] - cam.C[0], py = P[1] - cam.C[1], pz = P[2] - cam.C[2];
  const z = px * cam.f[0] + py * cam.f[1] + pz * cam.f[2];
  const x = px * cam.r[0] + py * cam.r[1] + pz * cam.r[2];
  const y = px * cam.u[0] + py * cam.u[1] + pz * cam.u[2];
  return [CX + cam.F * x / z, CY - cam.F * y / z, z];
}

// ------------------------------------------------------------------------------------------------ canvas helpers
function makeCanvas(w, h, hl) {
  const c = document.createElement('canvas');
  c.width = Math.round(w); c.height = Math.round(h);
  return { c, g: c.getContext('2d', hl ? { willReadFrequently: true } : undefined) };
}
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

/** one affine triangle of a texture cell: texture (s,t)…(s+ds,t+dt) → three screen points, clip grown by 0.7 px */
function texTri(ctx, img, A, B, C, s, t, ds, dt, which) {
  let a, b, c, d;
  if (which === 0) { a = (B[0] - A[0]) / ds; b = (B[1] - A[1]) / ds; c = (C[0] - B[0]) / dt; d = (C[1] - B[1]) / dt; }
  else { a = (B[0] - C[0]) / ds; b = (B[1] - C[1]) / ds; c = (C[0] - A[0]) / dt; d = (C[1] - A[1]) / dt; }
  const e = A[0] - a * s - c * t, f = A[1] - b * s - d * t;
  const gx = (A[0] + B[0] + C[0]) / 3, gy = (A[1] + B[1] + C[1]) / 3;
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const V = i === 0 ? A : i === 1 ? B : C;
    const dx = V[0] - gx, dy = V[1] - gy, l = Math.hypot(dx, dy) || 1, g = (l + 0.7) / l;
    if (i === 0) ctx.moveTo(gx + dx * g, gy + dy * g); else ctx.lineTo(gx + dx * g, gy + dy * g);
  }
  ctx.clip();
  ctx.setTransform(a, b, c, d, e, f);
  const m = 2;
  const sx = Math.max(0, s - m), sy = Math.max(0, t - m);
  const sw = Math.min(img.width, s + ds + m) - sx, sh = Math.min(img.height, t + dt + m) - sy;
  if (sw > 0 && sh > 0) ctx.drawImage(img, sx, sy, sw, sh, sx, sy, sw, sh);
  ctx.restore();
}
/** a planar quad textured with img[s0..s1]×[t0..t1], subdivided nu×nv (affine per triangle ≈ perspective) */
function texQuad(ctx, img, cam, Q, s0, t0, s1, t1, nu, nv) {
  const pts = [];
  for (let j = 0; j <= nv; j++) {
    const b = j / nv;
    const l = [lerp(Q[0][0], Q[3][0], b), lerp(Q[0][1], Q[3][1], b), lerp(Q[0][2], Q[3][2], b)];
    const r = [lerp(Q[1][0], Q[2][0], b), lerp(Q[1][1], Q[2][1], b), lerp(Q[1][2], Q[2][2], b)];
    for (let i = 0; i <= nu; i++) {
      const a = i / nu;
      pts.push(proj(cam, [lerp(l[0], r[0], a), lerp(l[1], r[1], a), lerp(l[2], r[2], a)]));
    }
  }
  const ds = (s1 - s0) / nu, dt = (t1 - t0) / nv;
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) {
      const P00 = pts[j * (nu + 1) + i], P10 = pts[j * (nu + 1) + i + 1], P01 = pts[(j + 1) * (nu + 1) + i], P11 = pts[(j + 1) * (nu + 1) + i + 1];
      if (P00[2] < 5 || P10[2] < 5 || P01[2] < 5 || P11[2] < 5) continue;   // behind the lens (never in view: the camera looks down)
      const x0 = Math.min(P00[0], P10[0], P01[0], P11[0]), x1 = Math.max(P00[0], P10[0], P01[0], P11[0]);
      const y0 = Math.min(P00[1], P10[1], P01[1], P11[1]), y1 = Math.max(P00[1], P10[1], P01[1], P11[1]);
      if (x1 < -4 || x0 > W + 4 || y1 < -4 || y0 > H + 4) continue;
      const s = s0 + i * ds, t = t0 + j * dt;
      texTri(ctx, img, P00, P10, P11, s, t, ds, dt, 0);
      texTri(ctx, img, P00, P11, P01, s, t, ds, dt, 1);
    }
  }
}
function polyPath(ctx, pts) {
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
}
const area2 = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a; };
const ccw = (pts) => (area2(pts) < 0 ? pts.slice().reverse() : pts);

// ------------------------------------------------------------------------------------------------ the note (front / back textures)
// front: the question, three lines split by the three accordion folds and the centre fold
const LINES = [
  { s: '나랑', u: 112, v: 238, rot: -2.4, col: INK },
  { s: '같이', u: 236, v: 560, rot: 1.6, col: ACC },
  { s: '갈래?', u: 128, v: 884, rot: -1.4, col: INK },
];
const FS = 252;
// back, face-local frames (x right, y down as the face is seen in its pose):
//   To. label on the back of strip 0's right half, read on top of the folded packet: u = PW − x, v = y
//   the answer on the back of strip 2, read on the tent's front slope: u = x, v = 3·SH − y
const BOX2 = [404, 118, 108];   // second check box (x, y, size) in the answer face — "좋아"
const CHECK_PTS = [[422, 170], [452, 212], [530, 94]];

function heart(g, x, y, s, col, lw = 0) {
  g.beginPath();
  g.moveTo(x, y + s * 0.32);
  g.bezierCurveTo(x - s * 0.62, y - s * 0.18, x - s * 0.34, y - s * 0.72, x, y - s * 0.32);
  g.bezierCurveTo(x + s * 0.34, y - s * 0.72, x + s * 0.62, y - s * 0.18, x, y + s * 0.32);
  if (lw) { g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } else { g.fillStyle = col; g.fill(); }
}
function markerBox(g, x, y, s, R) {
  // a hand-drawn square: four slightly wobbly strokes that overshoot at the corners
  g.strokeStyle = INK; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round';
  const j = () => (R() - 0.5) * 6;
  const c = [[x, y], [x + s, y], [x + s, y + s], [x, y + s]];
  for (let i = 0; i < 4; i++) {
    const a = c[i], b = c[(i + 1) % 4];
    g.beginPath();
    g.moveTo(a[0] + j() - (b[0] - a[0]) * 0.04, a[1] + j() - (b[1] - a[1]) * 0.04);
    g.quadraticCurveTo((a[0] + b[0]) / 2 + j(), (a[1] + b[1]) / 2 + j(), b[0] + j() + (b[0] - a[0]) * 0.05, b[1] + j() + (b[1] - a[1]) * 0.05);
    g.stroke();
  }
}
function textAt(g, s, x, vc, size, col, weight = 700, rot = 0) {
  g.save();
  g.font = `${weight} ${size}px ${HAND}`;
  const m = g.measureText(s);
  const base = vc + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  g.translate(x, base); g.rotate(rot * DEG);
  g.fillStyle = col; g.fillText(s, 0, 0);
  g.restore();
  return m.width;
}
function inkFront(g) {
  g.textBaseline = 'alphabetic';
  for (const l of LINES) {
    const w = textAt(g, l.s, l.u, l.v, FS, l.col, 700, l.rot);
    l.w = w;
  }
  // a little coral heart after the question, and the plan in small writing
  const q = LINES[2];
  heart(g, q.u + q.w + 52, q.v - 70, 74, ACC);
  textAt(g, '토요일 저녁, 불꽃놀이', 150, 1074, 60, INK, 400, -0.8);
  // a doodled swoosh under 같이
  const l = LINES[1];
  g.strokeStyle = ACC; g.lineWidth = 10; g.lineCap = 'round';
  g.beginPath(); g.moveTo(l.u - 6, l.v + 128); g.quadraticCurveTo(l.u + l.w * 0.5, l.v + 150, l.u + l.w + 18, l.v + 112); g.stroke();
}
function inkBack(g) {
  const R = rand(10931);
  g.textBaseline = 'alphabetic';
  // To. 짝꿍 — on top of the folded packet
  g.save(); g.transform(-1, 0, 0, 1, PW, 0);
  textAt(g, 'To.', 64, 92, 66, INK, 700, -4);
  textAt(g, '짝꿍', 104, 196, 118, INK, 700, -3);
  heart(g, 336, 196, 64, ACC);
  g.restore();
  // the answer, on the tent's front slope
  g.save(); g.transform(1, 0, 0, -1, 0, 3 * SH);
  textAt(g, '둘 중 하나만!', 74, 58, 50, INK, 400, -1.5);
  markerBox(g, 86, 118, 108, R);
  textAt(g, '응', 222, 176, 140, INK, 700, -1);
  markerBox(g, BOX2[0], BOX2[1], BOX2[2], R);
  textAt(g, '좋아', 540, 176, 140, INK, 700, 1);
  g.restore();
}
function paintSheet(hl, side) {
  const { c, g } = makeCanvas(PW * TS, PH * TS, hl);
  g.setTransform(TS, 0, 0, TS, 0, 0);
  g.fillStyle = side === 0 ? PAPER : PAPER_B;
  g.fillRect(0, 0, PW, PH);
  // fibres
  const R = rand(side ? 2207 : 1103);
  for (let i = 0; i < 2600; i++) {
    const x = R() * PW, y = R() * PH, l = 2 + R() * 7, a = R() * Math.PI;
    g.strokeStyle = R() < 0.5 ? 'rgba(150,130,100,0.06)' : 'rgba(255,255,255,0.35)';
    g.lineWidth = 0.6;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // rules and margin (notebook paper, both sides)
  g.fillStyle = 'rgba(110,160,214,0.36)';
  for (let v = 122; v < PH - 24; v += 56) g.fillRect(0, v, PW, 1.7);
  g.fillStyle = 'rgba(232,112,124,0.42)';
  g.fillRect(side === 0 ? 92 : PW - 94, 0, 2, PH);
  // show-through of the other side (same paper point, blurred, faint)
  g.save();
  g.filter = 'blur(1.2px)';
  g.globalAlpha = side === 0 ? 0.022 : 0.05;
  if (side === 0) inkBack(g); else inkFront(g);
  g.restore();
  // ink
  g.save();
  if (side === 0) inkFront(g); else inkBack(g);
  g.restore();
  // marker ink is not perfectly even: let a few fibres through
  for (let i = 0; i < 900; i++) {
    const x = R() * PW, y = R() * PH;
    g.fillStyle = 'rgba(255,255,255,0.05)';
    g.fillRect(x, y, 1 + R() * 2, 0.8);
  }
  // creases remembered by the paper: dark line + light lip, soft band around
  const creaseH = (v) => {
    const gr = g.createLinearGradient(0, v - 12, 0, v + 12);
    gr.addColorStop(0, 'rgba(120,96,70,0)'); gr.addColorStop(0.5, 'rgba(120,96,70,0.07)'); gr.addColorStop(1, 'rgba(120,96,70,0)');
    g.fillStyle = gr; g.fillRect(0, v - 12, PW, 24);
    g.fillStyle = 'rgba(105,84,62,0.26)'; g.fillRect(0, v - 0.7, PW, 1.4);
    g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(0, v + 1.0, PW, 1.1);
  };
  for (let i = 1; i < NS; i++) creaseH(i * SH);
  {
    const u = PW / 2;
    const gr = g.createLinearGradient(u - 12, 0, u + 12, 0);
    gr.addColorStop(0, 'rgba(120,96,70,0)'); gr.addColorStop(0.5, 'rgba(120,96,70,0.07)'); gr.addColorStop(1, 'rgba(120,96,70,0)');
    g.fillStyle = gr; g.fillRect(u - 12, 0, 24, PH);
    g.fillStyle = 'rgba(105,84,62,0.24)'; g.fillRect(u - 0.7, 0, 1.4, PH);
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(u + 1.0, 0, 1.1, PH);
  }
  // a touch of handling at the edges
  const ev = g.createRadialGradient(PW / 2, PH / 2, PH * 0.38, PW / 2, PH / 2, PH * 0.78);
  ev.addColorStop(0, 'rgba(160,130,90,0)'); ev.addColorStop(1, 'rgba(160,130,90,0.10)');
  g.fillStyle = ev; g.fillRect(0, 0, PW, PH);
  return c;
}

// ------------------------------------------------------------------------------------------------ the desk
const DX0 = -1900, DX1 = 1900, DY0 = -2250, DY1 = 1500, DS = 0.56;
const PROPS = [
  { name: 'notebook', c: [-1060, 760], rot: 9, w: 1040, h: 1280, blur: 26, off: [22, -16], sa: 0.32, dim: 0 },
  { name: 'pencil', c: [540, -330], rot: -82, w: 1080, h: 44, blur: 16, off: [26, -10], sa: 0.38, dim: 0.1 },
  { name: 'eraser', c: [-640, -760], rot: -18, w: 220, h: 96, blur: 18, off: [20, -12], sa: 0.34, dim: 0 },
];
const PM = 4;   // transparent margin around a prop texture
function paintProp(hl, pr) {
  const { c, g } = makeCanvas(pr.w + 2 * PM, pr.h + 2 * PM, hl);
  const R = rand(4500 + pr.w);
  g.translate(pr.w / 2 + PM, pr.h / 2 + PM);
  if (pr.name === 'notebook') {
    g.fillStyle = '#f7f4ec'; g.beginPath(); g.roundRect(-520, -640, 1040, 1280, 6); g.fill();
    g.fillStyle = 'rgba(110,160,214,0.35)'; for (let y = -560; y < 620; y += 56) g.fillRect(-500, y, 1000, 2);
    g.fillStyle = 'rgba(232,112,124,0.4)'; g.fillRect(380, -640, 2.5, 1280);
    g.strokeStyle = 'rgba(60,62,80,0.5)'; g.lineWidth = 4; g.lineCap = 'round';
    for (let row = 0; row < 14; row++) {   // scribbled maths, as squiggles
      let x = -460 + R() * 40; const y = -548 + row * 56 + 40;
      if (y > 600) break;
      const n = 4 + Math.floor(R() * 8);
      for (let i = 0; i < n; i++) {
        const ww = 22 + R() * 60;
        g.beginPath(); g.moveTo(x, y);
        for (let s = 0; s <= 8; s++) g.lineTo(x + ww * s / 8, y - 10 - 12 * Math.abs(Math.sin(s * 1.7 + i + row)));
        g.stroke(); x += ww + 14 + R() * 20;
        if (x > 340) break;
      }
    }
  } else if (pr.name === 'pencil') {
    const PL = pr.w, PR = pr.h / 2;
    g.fillStyle = '#f0bd2c'; g.fillRect(-PL / 2 + 150, -PR, PL - 330, PR * 2);
    g.fillStyle = '#f7d35c'; g.fillRect(-PL / 2 + 150, -PR, PL - 330, PR * 0.62);
    g.fillStyle = '#d99a1c'; g.fillRect(-PL / 2 + 150, PR * 0.36, PL - 330, PR * 0.64);
    g.fillStyle = '#ff8f8f'; g.beginPath(); g.roundRect(-PL / 2, -PR, 90, PR * 2, 8); g.fill();          // eraser
    g.fillStyle = '#c9c4bd'; g.fillRect(-PL / 2 + 80, -PR, 70, PR * 2);                                  // ferrule
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(-PL / 2 + 80, -PR, 70, 7);
    g.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 4; i++) g.fillRect(-PL / 2 + 92 + i * 15, -PR, 3, PR * 2);
    g.fillStyle = '#e9c9a0';                                                                            // sharpened wood
    g.beginPath(); g.moveTo(PL / 2 - 180, -PR); g.lineTo(PL / 2 - 30, -5); g.lineTo(PL / 2 - 30, 5); g.lineTo(PL / 2 - 180, PR); g.fill();
    g.fillStyle = '#3d3b40';
    g.beginPath(); g.moveTo(PL / 2 - 62, -8); g.lineTo(PL / 2 + 6, 0); g.lineTo(PL / 2 - 62, 8); g.fill();
  } else {
    g.fillStyle = '#f4f2ee'; g.beginPath(); g.roundRect(-110, -48, 220, 96, 14); g.fill();
    g.fillStyle = '#3d6fd0'; g.fillRect(-30, -48, 140, 96);
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(-14, -12, 96, 10); g.fillRect(-14, 8, 66, 8);
  }
  if (pr.dim) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(70,45,30,${pr.dim})`; g.fillRect(-pr.w, -pr.h, pr.w * 2, pr.h * 2); }
  return c;
}
function propQuad(pr) {
  const a = pr.rot * DEG, ca = Math.cos(a), sa = Math.sin(a), hw = pr.w / 2 + PM, hh = pr.h / 2 + PM;
  return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => [pr.c[0] + x * ca - y * sa, pr.c[1] + x * sa + y * ca, 0.2]);
}
function paintDesk(hl) {
  const w = (DX1 - DX0) * DS, h = (DY1 - DY0) * DS;
  const { c, g } = makeCanvas(w, h, hl);
  const R = rand(4409);
  g.setTransform(DS, 0, 0, DS, -DX0 * DS, -DY0 * DS);   // world units from here on
  // laminate wood: honey base, long grain along x
  const base = g.createLinearGradient(DX0, 0, DX1, 0);
  base.addColorStop(0, '#d8a46c'); base.addColorStop(0.5, '#cf9a61'); base.addColorStop(1, '#c08955');
  g.fillStyle = base; g.fillRect(DX0, DY0, DX1 - DX0, DY1 - DY0);
  for (let i = 0; i < 26; i++) {   // broad colour bands
    const y = DY0 + R() * (DY1 - DY0), hh = 60 + R() * 220;
    g.fillStyle = R() < 0.5 ? `rgba(150,90,40,${0.04 + R() * 0.06})` : `rgba(255,214,160,${0.03 + R() * 0.05})`;
    g.fillRect(DX0, y, DX1 - DX0, hh);
  }
  for (let i = 0; i < 520; i++) {  // grain lines
    const y0 = DY0 + R() * (DY1 - DY0), A1 = 4 + R() * 26, f1 = 0.0015 + R() * 0.003, p1 = R() * 6.28, A2 = 1 + R() * 5, f2 = 0.01 + R() * 0.02, p2 = R() * 6.28;
    const xs = DX0 + R() * 400 - 400, xe = xs + 900 + R() * 3600;
    g.strokeStyle = `rgba(${110 + R() * 30},${60 + R() * 20},${25 + R() * 15},${0.05 + R() * 0.13})`;
    g.lineWidth = 0.8 + R() * 3.2;
    g.beginPath();
    for (let x = xs; x <= xe; x += 24) {
      const y = y0 + A1 * Math.sin(x * f1 + p1) + A2 * Math.sin(x * f2 + p2);
      if (x === xs) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }
  for (let i = 0; i < 3000; i++) {   // pores
    const x = DX0 + R() * (DX1 - DX0), y = DY0 + R() * (DY1 - DY0);
    g.fillStyle = `rgba(90,50,20,${0.05 + R() * 0.12})`;
    g.fillRect(x, y, 4 + R() * 14, 1.6);
  }
  // pencil graffiti on the desk (a star and a small smiley), light graphite
  g.strokeStyle = 'rgba(70,64,70,0.22)'; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath();
  for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 4 / 5; const x = 760 + 70 * Math.cos(a), y = -900 + 70 * Math.sin(a); if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
  g.stroke();
  g.beginPath(); g.arc(-700, -1180, 58, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(-700, -1170, 32, 0.3, Math.PI - 0.3); g.stroke();
  g.fillStyle = 'rgba(70,64,70,0.22)'; g.fillRect(-722, -1200, 8, 12); g.fillRect(-686, -1200, 8, 12);

  // props are separate textured quads (their straight edges stay straight under perspective); the desk only
  // carries their soft shadows, toward the north-east (away from the window light)
  for (const pr of PROPS) {
    g.save();
    g.filter = `blur(${(pr.blur * DS).toFixed(2)}px)`;
    g.fillStyle = `rgba(60,30,10,${pr.sa})`;
    g.translate(pr.c[0] + pr.off[0], pr.c[1] + pr.off[1]); g.rotate(pr.rot * DEG);
    g.beginPath(); g.roundRect(-pr.w / 2, -pr.h / 2, pr.w, pr.h, pr.name === 'eraser' ? 14 : 4); g.fill();
    g.restore();
  }
  for (let i = 0; i < 26; i++) {
    const x = -560 + R() * 260, y = -700 + R() * 200, l = 10 + R() * 22, a = R() * Math.PI;
    g.strokeStyle = 'rgba(230,214,214,0.95)'; g.lineWidth = 5 + R() * 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 4, y + Math.sin(a) * l * 0.5 - 4, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // window light: warm from the left, falling off to the right and into the distance
  g.globalCompositeOperation = 'multiply';
  const fall = g.createLinearGradient(DX0, 0, DX1, 0);
  fall.addColorStop(0, '#ffffff'); fall.addColorStop(0.55, '#f1e6dc'); fall.addColorStop(1, '#cdbdb6');
  g.fillStyle = fall; g.fillRect(DX0, DY0, DX1 - DX0, DY1 - DY0);
  g.globalCompositeOperation = 'screen';
  const sun = g.createRadialGradient(-1300, -200, 100, -1300, -200, 2100);
  sun.addColorStop(0, 'rgba(255,200,130,0.34)'); sun.addColorStop(1, 'rgba(255,200,130,0)');
  g.fillStyle = sun; g.fillRect(DX0, DY0, DX1 - DX0, DY1 - DY0);
  g.globalCompositeOperation = 'source-over';
  // the far edge of the desk: a rounded lip catching light
  g.fillStyle = 'rgba(255,236,200,0.5)'; g.fillRect(DX0, DY0, DX1 - DX0, 10);
  g.fillStyle = 'rgba(120,70,30,0.35)'; g.fillRect(DX0, DY0 + 10, DX1 - DX0, 8);
  return c;
}
/** what lies beyond the desk's far edge (seen once the camera lowers): the classroom floor, out of focus */
function paintBeyond(hl) {
  const { c, g } = makeCanvas(W + 320, 1100, hl);
  g.translate(160, 0);
  const gr = g.createLinearGradient(0, 0, 0, 1100);
  gr.addColorStop(0, '#2a2120'); gr.addColorStop(0.6, '#4a3a33'); gr.addColorStop(1, '#5d4a3e');
  g.fillStyle = gr; g.fillRect(-160, 0, W + 320, 1100);
  g.filter = 'blur(26px)';
  g.fillStyle = '#2f3550'; g.beginPath(); g.roundRect(90, 560, 520, 300, 40); g.fill();     // a chair back (navy)
  g.fillStyle = '#6f4a33'; g.beginPath(); g.roundRect(-60, 820, 1200, 160, 30); g.fill(); // the next desk's edge
  g.fillStyle = '#8f5446'; g.beginPath(); g.roundRect(720, 600, 260, 280, 60); g.fill();   // a bag
  g.fillStyle = 'rgba(255,214,150,0.55)';
  g.beginPath(); g.ellipse(250, 420, 260, 90, -0.2, 0, Math.PI * 2); g.fill();             // sun on the floor
  g.filter = 'none';
  const R = rand(5501);
  for (let i = 0; i < 14; i++) {   // bokeh
    const x = R() * W, y = 300 + R() * 650, r = 14 + R() * 30;
    const b = g.createRadialGradient(x, y, 0, x, y, r);
    b.addColorStop(0, 'rgba(255,224,170,0.32)'); b.addColorStop(0.75, 'rgba(255,224,170,0.18)'); b.addColorStop(1, 'rgba(255,224,170,0)');
    g.fillStyle = b; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  return c;
}

// ------------------------------------------------------------------------------------------------ screen-space dressing
function bakeKicker(hl, text, size, color, shadowA) {
  const probe = makeCanvas(8, 8, hl).g;
  probe.font = `800 ${size}px ${KR}`;
  probe.letterSpacing = `${-0.03 * size}px`;
  const w = Math.ceil(probe.measureText(text).width) + 80, h = Math.ceil(size * 1.6);
  const { c, g } = makeCanvas(w, h, hl);
  g.font = `800 ${size}px ${KR}`;
  g.letterSpacing = `${-0.03 * size}px`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = `rgba(40,20,8,${shadowA})`; g.shadowBlur = 22; g.shadowOffsetY = 4;
  g.fillStyle = color; g.fillText(text, w / 2, h / 2 + size * 0.04);
  return c;
}
function bakeChip(hl, text) {
  const size = 34;
  const probe = makeCanvas(8, 8, hl).g;
  probe.font = `800 ${size}px ${KR}`;
  const tw = probe.measureText(text).width;
  const w = Math.ceil(tw + 64 + 40), h = 64 + 40;
  const { c, g } = makeCanvas(w, h, hl);
  g.shadowColor = 'rgba(60,20,8,0.35)'; g.shadowBlur = 16; g.shadowOffsetY = 4;
  g.fillStyle = ACC; g.beginPath(); g.roundRect(20, 20, w - 40, 64, 32); g.fill();
  g.shadowColor = 'transparent';
  g.font = `800 ${size}px ${KR}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#fff8ef'; g.fillText(text, w / 2, 20 + 33);
  return c;
}
function bakeBeam(hl) {
  const { c, g } = makeCanvas(W, H, hl);
  g.save();
  g.translate(-120, -80); g.rotate(28 * DEG);
  const gr = g.createLinearGradient(-300, 0, 520, 0);
  gr.addColorStop(0, 'rgba(255,214,150,0)'); gr.addColorStop(0.35, 'rgba(255,214,150,0.11)'); gr.addColorStop(0.6, 'rgba(255,214,150,0.07)'); gr.addColorStop(1, 'rgba(255,214,150,0)');
  g.fillStyle = gr; g.fillRect(-300, -200, 820, 2600);
  g.restore();
  const v = g.createLinearGradient(0, 0, 0, H);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.75, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = v; g.fillRect(0, 0, W, H);
  return c;
}
function bakeVignette(hl) {
  const { c, g } = makeCanvas(W, H, hl);
  const gr = g.createRadialGradient(W * 0.46, H * 0.44, H * 0.26, W * 0.5, H * 0.5, H * 0.72);
  gr.addColorStop(0, 'rgba(30,14,6,0)'); gr.addColorStop(1, 'rgba(30,14,6,0.52)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const b = g.createLinearGradient(0, H - 420, 0, H);   // under the caption
  b.addColorStop(0, 'rgba(20,10,6,0)'); b.addColorStop(1, 'rgba(20,10,6,0.55)');
  g.fillStyle = b; g.fillRect(0, H - 420, W, 420);
  return c;
}
function bakeGrain(hl) {
  const { c, g } = makeCanvas(256, 256, hl);
  const id = g.createImageData(256, 256), R = rand(777);
  for (let i = 0; i < 256 * 256; i++) { const v = R() * 255; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
  g.putImageData(id, 0, 0);
  return c;
}
function bakeDot(hl) {
  const { c, g } = makeCanvas(32, 32, hl);
  const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(255,236,200,1)'); gr.addColorStop(0.35, 'rgba(255,226,180,0.55)'); gr.addColorStop(1, 'rgba(255,226,180,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
  return c;
}

// ------------------------------------------------------------------------------------------------ painter's order (Newell plane tests)
function planeSide(P, Q, cam) {   // where P's corners lie relative to Q's plane: −1 all behind, +1 all in front (camera side), 0 mixed/coplanar
  const n = Q.n, o = Q.vw[0];
  const cs = Math.sign(dot(n, sub(cam.C, o))) || 1;
  let pos = false, neg = false;
  for (const v of P.vw) {
    const d = dot(n, sub(v, o)) * cs;
    if (d > 0.25) pos = true; else if (d < -0.25) neg = true;
  }
  if (pos && !neg) return 1;
  if (neg && !pos) return -1;
  return 0;
}
function sortPanels(panels, cam) {
  const n = panels.length;
  for (const P of panels) {
    P.sv = P.vw.map((v) => proj(cam, v));
    P.depth = proj(cam, P.ctr)[2];
    P.bb = [Math.min(...P.sv.map((p) => p[0])), Math.min(...P.sv.map((p) => p[1])), Math.max(...P.sv.map((p) => p[0])), Math.max(...P.sv.map((p) => p[1]))];
  }
  const before = panels.map(() => []);   // before[j] = panels that must be drawn before j
  const indeg = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const A = panels[i], B = panels[j];
      if (A.bb[2] < B.bb[0] || B.bb[2] < A.bb[0] || A.bb[3] < B.bb[1] || B.bb[3] < A.bb[1]) continue;
      const ab = planeSide(A, B, cam), ba = planeSide(B, A, cam);
      let aFirst = null;
      if (ab === -1 || ba === 1) aFirst = true;
      else if (ab === 1 || ba === -1) aFirst = false;
      if (aFirst === null) continue;
      if (aFirst) { before[j].push(i); indeg[j]++; } else { before[i].push(j); indeg[i]++; }
    }
  }
  const after = panels.map(() => []);
  before.forEach((list, j) => list.forEach((i) => after[i].push(j)));
  const done = new Array(n).fill(false), order = [];
  for (let step = 0; step < n; step++) {
    let pick = -1;
    for (let i = 0; i < n; i++) if (!done[i] && indeg[i] === 0 && (pick < 0 || panels[i].depth > panels[pick].depth + 1e-6 || (Math.abs(panels[i].depth - panels[pick].depth) <= 1e-6 && i < pick))) pick = i;
    if (pick < 0) for (let i = 0; i < n; i++) if (!done[i] && (pick < 0 || panels[i].depth > panels[pick].depth)) pick = i;   // cycle: farthest
    done[pick] = true; order.push(panels[pick]);
    for (const j of after[pick]) indeg[j]--;
  }
  return order;
}

// clip a world polygon to the half-space dist(v) ≥ 0 (Sutherland–Hodgman, one plane)
function clipHalf(poly, dist) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], da = dist(a), db = dist(b);
    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)) { const k = da / (da - db); out.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]); }
  }
  return out;
}

// ------------------------------------------------------------------------------------------------ demo
defineDemo({
  id: '109-paper-unfold',
  title: '접힌 쪽지',
  tech: '펼쳐지는 종이 글자 · 접힘선 따라 열리는 타이포그래피',
  duration: D,
  background: '#2a1d14',

  async setup(api) {
    const hl = api.headless;
    const { ctx } = api.canvas({ type: '2d', attrs: hl ? { willReadFrequently: true } : undefined });
    this.ctx = ctx;
    await fontReady(`700 120px ${HAND}`, '나랑같이갈래?To.짝꿍둘중하나만!응좋아');
    await fontReady(`400 60px ${HAND}`, '토요일 저녁, 불꽃놀이둘중하나만!');
    await fontReady(`800 58px ${KR}`, '뒷자리에서 날아온 쪽지대답은 뒷면에5교시');

    this.texF = paintSheet(hl, 0);
    this.texB = paintSheet(hl, 1);
    this.desk = paintDesk(hl);
    this.props = PROPS.map((pr) => paintProp(hl, pr));
    this.beyond = paintBeyond(hl);
    this.k1 = bakeKicker(hl, '뒷자리에서 날아온 쪽지', 58, '#fff6e8', 0.6);
    this.k2 = bakeKicker(hl, '대답은 뒷면에', 58, '#fff6e8', 0.6);
    this.chip = bakeChip(hl, '5교시');
    this.beam = bakeBeam(hl);
    this.vig = bakeVignette(hl);
    this.grain = bakeGrain(hl);
    this.dot = bakeDot(hl);
    // ¼-res shadow buffers
    this.sh = [0, 1, 2, 3].map(() => makeCanvas(W / 4, H / 4, hl));

    // solve the switch pose: strip 1 at the end of act 2 becomes the root of act 3
    {
      const p = act2(SWITCH);
      let minZ = Infinity;
      for (let k = 0; k < NS; k++) for (const c of [0, 1]) {
        const M = c ? p.R[k] : p.L[k];
        for (const [u, v] of [[c * PW / 2, k * SH], [(c + 1) * PW / 2, k * SH], [(c + 1) * PW / 2, (k + 1) * SH], [c * PW / 2, (k + 1) * SH]]) minZ = Math.min(minZ, ap(M, u, v)[2]);
      }
      const M1 = mmul(mT(0, 0, -minZ), p.L[1]);
      SW = { c: ap(M1, PW / 2, 1.5 * SH, 0), yaw: p.yaw, tau: p.tilt + p.th[0] };
      const sheetC = ap(mmul(mT(0, 0, -minZ), p.L[0]), PW / 2, PH / 2 - 0, 0);
      // where the camera looks: the packet → the open sheet → the tent
      const packet = [-210, -435, 0];
      const tentC = [SW.c[0] - 40, SW.c[1] - 10, 165];
      this.sheetC = sheetC;
      camTarget = track([
        [0, [packet[0] - 10, packet[1] + 40, 0]],
        [1.4, [packet[0], packet[1] + 30, 0]],
        [2.5, [packet[0] + 150, packet[1] + 60, 0]],
        [4.75, [sheetC[0], sheetC[1] + 30, 0]],
        [6.05, [sheetC[0], sheetC[1] + 10, 0], (q) => q],
        [7.85, tentC],
        [D, [tentC[0], tentC[1] - 6, tentC[2]], (q) => q],
      ]);
    }
    // the main canvas sees every offscreen image once before the first real frame (first-composite AA, README)
    ctx.save();
    for (const im of [...this.props, this.texF, this.texB, this.desk, this.beyond, this.k1, this.k2, this.chip, this.beam, this.vig, this.grain, this.dot, ...this.sh.map((s) => s.c)]) ctx.drawImage(im, 0, 0, 4, 4);
    ctx.restore();
    ctx.clearRect(0, 0, W, H);
  },

  frame(t) {
    const ctx = this.ctx;
    if (ctx.reset) ctx.reset(); else { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; }
    const cam = makeCam(t);
    const P = pose(t);

    // ---- beyond the desk, then the desk
    const edgeL = proj(cam, [DX0, DY0, 0]), edgeR = proj(cam, [DX1, DY0, 0]);
    const edgeY = Math.min(edgeL[1], edgeR[1]);
    if (edgeY > -40) ctx.drawImage(this.beyond, -160 - camYaw(t) * 4, edgeY - 1100 + 140);
    {
      const s = DS;
      texQuad(ctx, this.desk, cam, [[DX0, DY0, 0], [DX1, DY0, 0], [DX1, DY1, 0], [DX0, DY1, 0]], 0, 0, (DX1 - DX0) * s, (DY1 - DY0) * s, 10, 14);
    }
    PROPS.forEach((pr, i) => { const im = this.props[i]; texQuad(ctx, im, cam, propQuad(pr), 0, 0, im.width, im.height, pr.name === 'pencil' ? 10 : 4, pr.name === 'pencil' ? 1 : 4); });

    // ---- shadows on the desk: light-projected cast shadow + contact footprint, unions blurred at ¼ res
    this.deskShadows(ctx, cam, P.panels, t);

    // ---- the paper
    const order = sortPanels(P.panels, cam);
    for (const Q of order) this.drawPanel(ctx, cam, Q, P, order, t);

    // a glint sweeps the sheet as it settles flat
    if (t > GLINT0 && t < GLINT1) this.glint(ctx, order, t);

    // ---- screen-space dressing
    this.motes(ctx, t);
    this.ring(ctx, cam, P, t);
    this.copy(ctx, t);
    ctx.globalAlpha = 1;
    ctx.drawImage(this.vig, 0, 0);
    // warm late light in the coda
    const warm = smooth((t - 7.6) / 2.2);
    if (warm > 0) { ctx.fillStyle = `rgba(255,140,60,${0.07 * warm})`; ctx.globalCompositeOperation = 'soft-light'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
    // grain
    const gi = Math.floor(t * 24) % 7;
    ctx.globalAlpha = 0.045; ctx.globalCompositeOperation = 'overlay';
    const pat = ctx.createPattern(this.grain, 'repeat');
    ctx.setTransform(1, 0, 0, 1, (gi * 97) % 256, (gi * 57) % 256);
    ctx.fillStyle = pat; ctx.fillRect(-256, -256, W + 512, H + 512);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },

  deskShadows(ctx, cam, panels, t) {
    const [cast, castB, cont, contB] = this.sh;
    const q = 0.25;
    // cast: every panel projected along the light onto z = 0
    cast.g.setTransform(1, 0, 0, 1, 0, 0); cast.g.clearRect(0, 0, W * q, H * q);
    cast.g.setTransform(q, 0, 0, q, 0, 0);
    cast.g.fillStyle = '#3a2112';
    cast.g.beginPath();
    for (const Pn of panels) {
      const pts = Pn.vw.map((v) => proj(cam, [v[0] - L[0] * v[2] / L[2], v[1] - L[1] * v[2] / L[2], 0]));
      polyPath(cast.g, ccw(pts));
    }
    cast.g.fill();
    // contact: the parts of panels within 16 px of the desk, straight down
    cont.g.setTransform(1, 0, 0, 1, 0, 0); cont.g.clearRect(0, 0, W * q, H * q);
    cont.g.setTransform(q, 0, 0, q, 0, 0);
    cont.g.fillStyle = '#2a160a';
    cont.g.beginPath();
    for (const Pn of panels) {
      const low = clipHalf(Pn.vw, (v) => 26 - v[2]);
      if (low.length < 3) continue;
      polyPath(cont.g, ccw(low.map((v) => proj(cam, [v[0], v[1], 0]))));
    }
    cont.g.fill();
    for (const [src, dst, b] of [[cast, castB, 3.2], [cont, contB, 1.4]]) {
      dst.g.setTransform(1, 0, 0, 1, 0, 0); dst.g.clearRect(0, 0, W * q, H * q);
      dst.g.filter = `blur(${b}px)`; dst.g.drawImage(src.c, 0, 0); dst.g.filter = 'none';
    }
    ctx.globalAlpha = 0.4; ctx.drawImage(castB.c, 0, 0, W, H);
    ctx.globalAlpha = 0.5; ctx.drawImage(contB.c, 0, 0, W, H);
    ctx.globalAlpha = 1;
  },

  drawPanel(ctx, cam, Q, P, order, t) {
    const front = dot(Q.n, sub(cam.C, Q.ctr)) > 0;
    const nv = front ? Q.n : [-Q.n[0], -Q.n[1], -Q.n[2]];
    const sv = Q.sv;
    // which edges are folds (and how far folded); a fold's inside is where the faces meet
    const th = P.th;
    const edges = [
      { a: 0, b: 1, ang: Q.k > 0 ? th[Q.k - 1] : null, valleyFront: true },          // top (v0)
      { a: 1, b: 2, ang: Q.c === 0 ? P.phi : null, cross: true },                     // right (u1)
      { a: 2, b: 3, ang: Q.k < 3 ? th[Q.k] : null, valleyFront: true },               // bottom (v1)
      { a: 3, b: 0, ang: Q.c === 1 ? P.phi : null, cross: true },                     // left (u0)
    ];
    // 1. thickness: side faces of the free edges (and of folds that are closed past 90°)
    for (const e of edges) {
      let alpha = 1;
      if (e.ang !== null) { const s = Math.abs(e.ang); if (s < Math.PI / 2) continue; alpha = smooth((s - Math.PI / 2) / 0.6); }
      const A = Q.vw[e.a], B = Q.vw[e.b];
      const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
      const out = sub(mid, Q.ctr), ol = Math.hypot(...out);
      const o = out.map((x) => x / ol);
      if (dot(o, sub(cam.C, mid)) <= 0) continue;
      const A2 = A.map((x, i) => x - nv[i] * THK), B2 = B.map((x, i) => x - nv[i] * THK);
      const lam = 0.62 + 0.42 * Math.max(0, dot(o, L));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = rgba(EDGE.map((x) => x * lam), 1);
      ctx.beginPath(); polyPath(ctx, [A, B, B2, A2].map((v) => proj(cam, v))); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // 2. the printed face
    const img = front ? this.texF : this.texB;
    texQuad(ctx, img, cam, Q.vw, Q.u0 * TS, Q.v0 * TS, Q.u1 * TS, Q.v1 * TS, 4, 3);
    // 3. Lambert against the window light (+ a little light through the paper)
    const nl = dot(nv, L);
    const b = 0.6 + 0.5 * Math.max(0, nl) + 0.16 * Math.max(0, -nl);
    ctx.beginPath(); polyPath(ctx, sv);
    if (b < 1) { ctx.fillStyle = rgba(SHADE, Math.min(0.75, (1 - b) * 0.95)); ctx.fill(); }
    else if (b > 1) { ctx.fillStyle = `rgba(255,240,214,${(b - 1) * 0.9})`; ctx.fill(); }
    // 4. other panels' shadows on this one
    if (nl > 0.04) {
      const o = Q.vw[0];
      const polys = [];
      for (const O of P.panels) {
        if (O === Q) continue;
        const dist = (v) => dot(nv, sub(v, o));
        let mx = -Infinity; for (const v of O.vw) mx = Math.max(mx, dist(v));
        if (mx < 3) continue;
        const part = clipHalf(O.vw, dist);
        if (part.length < 3) continue;
        polys.push(ccw(part.map((v) => { const d = dist(v) / nl; return proj(cam, [v[0] - L[0] * d, v[1] - L[1] * d, v[2] - L[2] * d]); })));
      }
      if (polys.length) {
        ctx.save();
        ctx.beginPath(); polyPath(ctx, sv); ctx.clip();
        ctx.beginPath(); for (const pp of polys) polyPath(ctx, pp);
        ctx.fillStyle = 'rgba(58,40,70,0.2)'; ctx.fill();
        ctx.restore();
      }
    }
    // 5. creases: occlusion inside a fold, a light lip on its outside
    for (const e of edges) {
      if (e.ang === null || Math.abs(e.ang) < 0.01) continue;
      const s = Math.min(1, Math.abs(e.ang) / Math.PI);
      const valley = e.cross ? (Q.k % 2 === 0) : true;   // cross fold: valley for upright strips, mountain for flipped ones
      const inside = ((e.ang > 0) === valley) === front;
      const A = Q.vw[e.a], B = Q.vw[e.b];
      const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
      const inw = sub(Q.ctr, mid), il = Math.hypot(...inw);
      const reach = Math.min(110, il);
      const p0 = proj(cam, mid), p1 = proj(cam, mid.map((x, i) => x + inw[i] / il * reach));
      const gr = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
      if (inside) { gr.addColorStop(0, rgba(SHADE, 0.62 * s)); gr.addColorStop(0.35, rgba(SHADE, 0.2 * s)); gr.addColorStop(1, rgba(SHADE, 0)); }
      else { gr.addColorStop(0, `rgba(255,248,236,${0.5 * s})`); gr.addColorStop(0.12, 'rgba(255,248,236,0)'); gr.addColorStop(1, 'rgba(255,248,236,0)'); }
      ctx.fillStyle = gr;
      ctx.beginPath(); polyPath(ctx, sv); ctx.fill();
    }
    // 6. the reply is written on while the tent stands
    if (Q.k === 2 && Q.c === 1 && !front && t > CHECK0) this.checkMark(ctx, cam, Q, nv, t);
  },

  checkMark(ctx, cam, Q, nv, t) {
    const p = ease.outCubic(clamp((t - CHECK0) / (CHECK1 - CHECK0)));
    const pts = CHECK_PTS.map(([x, y]) => { const w = ap(Q.M, x, 3 * SH - y, 0); return proj(cam, [w[0] + nv[0] * 0.6, w[1] + nv[1] * 0.6, w[2] + nv[2] * 0.6]); });
    const segs = [Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1])];
    const tot = segs[0] + segs[1];
    let left = p * tot;
    const scale = cam.F / pts[1][2];
    ctx.strokeStyle = ACC; ctx.lineWidth = 17 * scale; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < 2 && left > 0; i++) {
      const k = Math.min(1, left / segs[i]);
      ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k));
      left -= segs[i];
    }
    ctx.stroke();
  },

  glint(ctx, order, t) {
    const k = (t - GLINT0) / (GLINT1 - GLINT0);
    const x = lerp(-300, 1400, ease.inOutCubic(k));
    ctx.save();
    ctx.beginPath();
    for (const Q of order) polyPath(ctx, Q.sv);
    ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(x, 900); ctx.rotate(-24 * DEG);
    const gr = ctx.createLinearGradient(-140, 0, 140, 0);
    const a = 0.16 * Math.sin(Math.PI * k);
    gr.addColorStop(0, 'rgba(255,240,210,0)'); gr.addColorStop(0.5, `rgba(255,240,210,${a})`); gr.addColorStop(1, 'rgba(255,240,210,0)');
    ctx.fillStyle = gr; ctx.fillRect(-140, -1400, 280, 2800);
    ctx.restore();
  },

  motes(ctx, t) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 1;
    ctx.drawImage(this.beam, 0, 0);
    const R = rand(9041);
    for (let i = 0; i < 46; i++) {
      const x0 = R() * 760 - 60, y0 = R() * 1500 + 120, vx = 4 + R() * 10, vy = -6 + R() * 12, ph = R() * 6.28, sz = 4 + R() * 10, tw = 0.6 + R() * 1.4;
      const x = x0 + vx * t + 14 * Math.sin(t * 0.7 + ph), y = y0 + vy * t + 10 * Math.sin(t * 0.9 + ph * 1.3);
      const inBeam = clamp(1 - Math.abs((x - (y * 0.53 + 40)) - 120) / 320);
      const a = inBeam * (0.35 + 0.35 * Math.sin(t * tw * 3 + ph));
      if (a <= 0.01) continue;
      ctx.globalAlpha = a;
      ctx.drawImage(this.dot, x - sz / 2, y - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  },

  ring(ctx, cam, P, t) {
    const s = t - CHECK1 + 0.04;
    if (s < 0 || s > 0.6) return;
    const S2 = P.panels.find((q) => q.k === 2 && q.c === 1);
    const w = ap(S2.M, CHECK_PTS[1][0] + 10, 3 * SH - CHECK_PTS[1][1] + 30, 0);
    const c = proj(cam, w);
    const k = ease.outCubic(s / 0.6);
    ctx.strokeStyle = `rgba(255,248,232,${0.9 * (1 - k)})`;
    ctx.lineWidth = 8 * (1 - k) + 1;
    ctx.beginPath(); ctx.arc(c[0], c[1], 40 + 150 * k, 0, Math.PI * 2); ctx.stroke();
    // little marker sparks
    ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.36;
      const r0 = 70 + 120 * k, r1 = r0 + 46 * (1 - k);
      ctx.strokeStyle = i % 2 ? `rgba(255,90,76,${1 - k})` : `rgba(255,236,190,${1 - k})`;
      ctx.lineWidth = 9 * (1 - k) + 1;
      ctx.beginPath(); ctx.moveTo(c[0] + Math.cos(a) * r0, c[1] + Math.sin(a) * r0); ctx.lineTo(c[0] + Math.cos(a) * r1, c[1] + Math.sin(a) * r1); ctx.stroke();
    }
  },

  copy(ctx, t) {
    // chip pops, kicker lines rise inside a line mask; exits are quicker than entrances
    const chipIn = clamp((t - 0.25) / 0.5);
    if (chipIn > 0) {
      const sc = ease.outBack(chipIn, 1.6);
      ctx.save(); ctx.translate(W / 2, 148); ctx.scale(sc, sc); ctx.globalAlpha = clamp(chipIn * 3);
      ctx.drawImage(this.chip, -this.chip.width / 2, -this.chip.height / 2);
      ctx.restore();
    }
    const line = (img, tin, tout) => {
      const pin = ease.outExpo(clamp((t - tin) / 0.75));
      const pout = tout ? ease.inCubic(clamp((t - tout) / 0.32)) : 0;
      if (pin <= 0 || pout >= 1) return;
      const y = 240, h = img.height;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, y - h / 2 + 6, W, h - 12); ctx.clip();
      ctx.drawImage(img, W / 2 - img.width / 2, y - h / 2 + (1 - pin) * h * 0.95 - pout * h * 0.95);
      ctx.restore();
    };
    line(this.k1, 0.45, 6.0);
    line(this.k2, 6.55, null);
  },
});
