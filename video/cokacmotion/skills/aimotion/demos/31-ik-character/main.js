/*
 * 31 · 손을 뻗는 아이 — a paper-cut child walking over uneven ground at dusk, who stops and reaches up on tiptoe to
 * catch a falling star. Everything the child does is solved from t:
 *
 *  · skeleton    34 bones (rig.js): body, arms, legs, an eye and a brow, two scarf tails and a hair tuft.
 *  · skin        ~25 paper pieces cut from outlines, triangulated (Delaunator) and skinned to 1–2 bones each with
 *                linear-blend weights; the GPU does S·v per vertex (WebGL2), the CPU only builds 34 matrices.
 *  · walk        a procedural gait: footfalls are planned in setup at fixed places on the terrain; stance feet stay
 *                planted (heel strike → flat → heel-off rocker), swing feet arc between plants, the hips settle to
 *                where both legs can reach, and two-bone IK bends the knees.
 *  · reach       FABRIK on pelvis → spine → chest → upper arm → forearm → hand with a range per joint (the elbow only
 *                bends one way, the spine leans a little); the target slides from the hand's FK place to the star.
 *  · look-at     neck + head turn toward the star within limits; the eye blinks, the brow lifts, the mouth goes "o".
 *  · secondary   scarf tails and a hair tuft are Verlet chains hung from the neck/head, baked in setup at 240 Hz
 *                and skinned like any other bone chain.
 */
import { defineDemo, rand, clamp, lerp, ramp, ease } from '../_lib/stage.js';
import {
  makeSkeleton, makePose, place, carry, skinMatrices, fabrik, twoBone, bakeChain, chainAt, meshOutline, ellipse, polar, vstrip, sstep, wrapPi,
} from './rig.js';

const D = 9.6;
const UP = -Math.PI / 2, DN = Math.PI / 2;
const TAU = Math.PI * 2;

// ================================================================== the story clock
const V = 300, T1 = 3.2, T2 = 4.5, C0 = 2.3, L0 = V / C0;   // walk speed px/s, slow-down from T1 to a stop at T2, steps/s
const TC = 6.55;                                             // the star settles into the palm
const LOOK = (t) => ramp(t, 1.55, 2.6);
const REACH = (t) => ramp(t, 5.0, 6.15);
const TIP = (t) => ramp(t, 5.15, 6.05) * (1 - ramp(t, 7.0, 7.9));
const HOLD = (t) => ramp(t, 6.95, 8.2);
const OH = (t) => ramp(t, 4.2, 4.45) * (1 - ramp(t, 6.62, 6.9));   // mouth "o" (and brows up) while the star comes down
const BLINKS = [1.3, 3.75, 7.95];
const blink = (t) => { let b = 0; for (const s of BLINKS) b = Math.max(b, 1 - Math.abs(t - s - 0.075) / 0.075); return clamp(b, 0, 1); };
const bump = (x, w) => (x <= 0 ? 0 : (x / w) * Math.exp(1 - x / w));
const smax = (a, b, k) => 0.5 * (a + b + Math.sqrt((a - b) * (a - b) + k * k));

// ================================================================== the ground (world px, y down)
const ground = (x) => 7 * Math.sin(x / 61 + 1.7) + 19 * Math.sin(x / 170 + 0.4) + 12 * Math.sin(x / 410 + 2.0)
  - 72 * sstep(250, 1100, x) + 190 * sstep(1330, 2000, x);
const slope = (x) => (ground(x + 0.5) - ground(x - 0.5));

// ================================================================== pelvis travel and gait phase
function Xp(t) {
  if (t <= T1) return V * t;
  const Td = T2 - T1;
  if (t >= T2) return V * T1 + V * Td * 0.5;
  const u = (t - T1) / Td;
  return V * T1 + V * Td * (u - u * u * u + (u * u * u * u) / 2);   // ∫ V·(1 − smoothstep)
}
function vel(t) { if (t <= T1) return V; if (t >= T2) return 0; const u = (t - T1) / (T2 - T1); return V * (1 - u * u * (3 - 2 * u)); }
const cad = (t) => C0 * Math.sqrt(Math.max(0, vel(t) / V));       // steps get slower and shorter as the child stops

let G = null;   // gait tables, built once in setup
function buildGait() {
  const dt = 1 / 2000, n = Math.round((T2 - T1) / dt), tab = new Float64Array(n + 1);
  for (let i = 1; i <= n; i++) tab[i] = tab[i - 1] + 0.5 * dt * (cad(T1 + (i - 1) * dt) + cad(T1 + i * dt));
  const total = C0 * T1 + tab[n], N = Math.ceil(total), p0 = N - total;   // the last footfall lands exactly at the stop
  G = { dt, tab, N, p0, plants: new Map() };
  for (let k = -6; k <= N; k++) {
    const t = timeOfPhase(k);
    let x = Xp(t) + 0.5 * L0 * Math.sqrt(Math.max(0, vel(t) / V));
    if (k === N) x += 14;
    G.plants.set(k, { k, t, x, y: ground(x), sl: Math.atan(slope(x)) });
  }
}
function phase(t) {
  if (t <= T1) return G.p0 + C0 * t;
  if (t >= T2) return G.N;
  const f = (t - T1) / G.dt, i = Math.min(G.tab.length - 2, Math.floor(f));
  return G.p0 + C0 * T1 + lerp(G.tab[i], G.tab[i + 1], f - i);
}
function timeOfPhase(p) {
  const pT1 = G.p0 + C0 * T1;
  if (p <= pT1) return (p - G.p0) / C0;
  const q = p - pT1, tab = G.tab;
  if (q >= tab[tab.length - 1]) return T2;
  let lo = 0, hi = tab.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (tab[m] <= q) lo = m; else hi = m; }
  return T1 + (lo + (q - tab[lo]) / Math.max(1e-12, tab[hi] - tab[lo])) * G.dt;
}

// ================================================================== the foot: sole geometry relative to the ankle
const HEEL = [-20, 20], BALL = [38, 20], MID = [9, 20];
const FOOT_A = Math.atan2(20, 38);                      // bind angle of the foot bone (ankle → ball)
const TH_HEEL = 0.3, TH_TOE = 0.5, TH_TIP = 0.62;       // heel strike, toe-off and tiptoe pitch (rad)
/** ankle of a foot whose sole middle is planted at pl, pitched about the heel (pitch < 0) or the ball (pitch > 0) */
function ankleAt(pl, pitch, out) {
  const cs = Math.cos(pl.sl), ss = Math.sin(pl.sl), phi = pl.sl + pitch, cp = Math.cos(phi), sp = Math.sin(phi);
  const L = pitch < 0 ? HEEL : BALL, off = L[0] - MID[0];
  const px = pl.x + cs * off, py = pl.y + ss * off;
  out.ax = px - (cp * L[0] - sp * L[1]); out.ay = py - (sp * L[0] + cp * L[1]); out.phi = phi;
  return out;
}
const _a0 = {}, _a1 = {};
function footAt(F, f, t, p, tip) {
  let kl = Math.floor(p);
  if ((((kl % 2) + 2) % 2) !== f) kl -= 1;
  const A = G.plants.get(kl), lift = kl + 1.25;
  if (p < lift) {                                   // stance: planted; heel rocker after landing, heel-off before lift
    let pitch = -TH_HEEL * (1 - sstep(0, 0.14, t - A.t)) + TH_TOE * sstep(kl + 1, lift, p);
    if (tip > 0) pitch = Math.max(pitch, TH_TIP * ease.inOutCubic(tip));
    ankleAt(A, pitch, F);
    F.swing = 0;
  } else {                                          // swing: an arc from this plant to the next, clear of the ground
    const B = G.plants.get(kl + 2), u = clamp((p - lift) / 0.75, 0, 1), e = u * u * (3 - 2 * u);
    ankleAt(A, TH_TOE, _a0); ankleAt(B, -TH_HEEL, _a1);
    F.ax = lerp(_a0.ax, _a1.ax, e);
    const arc = Math.sin(Math.PI * u);
    F.ay = lerp(_a0.ay, _a1.ay, e) - (10 + 22 * Math.min(1, Math.abs(B.x - A.x) / (2 * L0))) * arc;
    F.ay = Math.min(F.ay, ground(F.ax + MID[0]) - 22 - 5 * arc);
    F.phi = lerp(_a0.phi, _a1.phi, sstep(0.05, 0.95, u));
    F.swing = arc;
  }
  const c = Math.cos(F.phi), s = Math.sin(F.phi);
  F.sx = F.ax + c * MID[0] - s * MID[1]; F.sy = F.ay + s * MID[0] + c * MID[1];   // sole middle
  F.h = ground(F.sx) - F.sy;
  return F;
}

// ================================================================== the skeleton (bind pose: standing, arms down)
const C = [-2, -224];                                     // head centre in bind space (pelvis at the origin)
const KNOT_A = [-40, -156], SEG_A = 19, NA = 8;           // scarf tails hang from a knot at the back of the neck
const KNOT_B = [-31, -151], SEG_B = 17, NB = 6;
const TUFT = [[C[0] - 6, C[1] - 57], [C[0] - 3, C[1] - 72], [C[0] + 6, C[1] - 83], [C[0] + 19, C[1] - 87]];
const tailNodes = (k, seg, n) => Array.from({ length: n }, (_, j) => [k[0], k[1] + seg * j]);
const DEFS = [
  ['pelvis', null, 0, 0, UP, 0],
  ['spine', 'pelvis', 0, 0, UP, 82],
  ['chest', 'spine', 0, -82, UP, 66],
  ['neck', 'chest', -2, -148, UP, 22],
  ['head', 'neck', -2, -170, UP, 54],
  ['eye', 'head', C[0] + 32, C[1] - 3, 0, 0],
  ['brow', 'head', C[0] + 31, C[1] - 20, 0, 0],
  ['upperF', 'chest', 0, -148, DN, 80], ['foreF', 'upperF', 0, -68, DN, 72], ['handF', 'foreF', 0, 4, DN, 22],
  ['upperN', 'chest', 0, -148, DN, 80], ['foreN', 'upperN', 0, -68, DN, 72], ['handN', 'foreN', 0, 4, DN, 22],
  ['thighF', 'pelvis', -3, 0, DN, 112], ['shinF', 'thighF', -3, 112, DN, 104], ['footF', 'shinF', -3, 216, FOOT_A, 43],
  ['thighN', 'pelvis', 3, 0, DN, 112], ['shinN', 'thighN', 3, 112, DN, 104], ['footN', 'shinN', 3, 216, FOOT_A, 43],
];
const chainDefs = (name, parent, nodes) => nodes.slice(0, -1).map((p, j) => {
  const q = nodes[j + 1];
  return [`${name}${j}`, j ? `${name}${j - 1}` : parent, p[0], p[1], Math.atan2(q[1] - p[1], q[0] - p[0]), Math.hypot(q[0] - p[0], q[1] - p[1])];
});
const NODES_A = tailNodes(KNOT_A, SEG_A, NA), NODES_B = tailNodes(KNOT_B, SEG_B, NB);
DEFS.push(...chainDefs('tailA', 'neck', NODES_A), ...chainDefs('tailB', 'neck', NODES_B), ...chainDefs('tuft', 'head', TUFT));
const sk = makeSkeleton(DEFS);
const I = sk.idx;
const ids = (name, n) => Array.from({ length: n }, (_, j) => I[`${name}${j}`]);
const IDS_A = ids('tailA', NA - 1), IDS_B = ids('tailB', NB - 1), IDS_T = ids('tuft', TUFT.length - 1);

// the reaching chain: pelvis → spine → chest(shoulder) → elbow → wrist → palm
const LENS = [82, 66, 80, 72, 20];
const LO = [-0.2, -0.25, -0.35, -2.45, -0.75];          // per-joint range relative to the parent bone (rad)
const HI = [0.22, 0.16, Math.PI + 0.7, 0.0, 0.5];        // elbow: flexion only; shoulder: from down-and-back to overhead

// ================================================================== the camera (world → stage px)
const Z0 = 1.15, SP = [500, 1180];
function camAt(t) {
  let sx = 0;
  for (let i = 0; i < 16; i++) sx += Xp(t - 0.42 + (0.84 * (i + 0.5)) / 16);   // box-filtered pelvis travel
  const cx = sx / 16;
  let gy = 0;
  for (let i = 0; i < 9; i++) gy += ground(cx - 140 + 35 * i);
  return { x: cx + 62, y: gy / 9 - 285, z: Z0 + 0.085 * ease.inOutCubic(clamp((t - 4.9) / 4.7)) };
}
const toScreen = (cam, x, y) => [(x - cam.x) * cam.z + SP[0], (y - cam.y) * cam.z + SP[1]];

// ================================================================== the star's path
let CATCH = [0, 0], START = [0, 0], CAMF = null;
function starBase(t) {
  const u = clamp((t - 0.95) / (TC - 0.95), 0, 1), e = u * u * (3 - 2 * u), env = Math.sin(Math.PI * u);
  return [lerp(START[0], CATCH[0], e) + 58 * Math.sin(TAU * 1.15 * u + 0.4) * env, lerp(START[1], CATCH[1], e) + 10 * Math.sin(TAU * 2 * u) * env];
}
/** world position while falling: fixed against the sky while the camera still pans */
function starFalling(t) {
  const b = starBase(t), cam = camAt(t);
  return [b[0] + cam.x - CAMF.x, b[1] + cam.y - CAMF.y];
}
const starLight = (t) => (0.5 + 0.5 * ramp(t, 0.25, 0.9) + 0.7 * bump(t - 0.92, 0.16)) * (t < TC ? 1 : 1.12 + 0.9 * bump(t - TC, 0.1) + 0.06 * Math.sin(5.2 * t));

// ================================================================== solving the whole body at time t
function newInfo() {
  return { feet: [{}, {}], J: new Float64Array(12), ghosts: [new Float64Array(12), new Float64Array(12), new Float64Array(12)], iters: 0, tx: 0, ty: 0, w: 0 };
}
function solve(t, P, info, o = {}) {
  const p = phase(t), vr = vel(t) / V, tip = TIP(t), rw = REACH(t);
  const F = info.feet;
  footAt(F[0], 0, t, p, tip);
  footAt(F[1], 1, t, p, tip);

  // hips: a little bob, up on tiptoe, never further from a foot than the leg can reach
  const px = Xp(t), gref = (ground(px - 50) + ground(px) + ground(px + 50)) / 3;
  let py = gref - 233.5 + 4 * vr * Math.cos(TAU * p) - 22 * ease.inOutCubic(tip);
  for (let f = 0; f < 2; f++) {
    const dx = F[f].ax - (px + (f ? 3 : -3)), Lm = 216 * 0.997;
    py = smax(py, F[f].ay - Math.sqrt(Math.max(0, Lm * Lm - dx * dx)), 5);
  }
  const PEL = I.pelvis;
  P.x[PEL] = px; P.y[PEL] = py; P.a[PEL] = UP + 0.02 * vr * Math.sin(TAU * p);

  // legs: analytic two-bone IK, knees forward
  for (let f = 0; f < 2; f++) {
    const [TH, SH, FT] = f ? [I.thighN, I.shinN, I.footN] : [I.thighF, I.shinF, I.footF];
    place(sk, P, TH, DN);
    const ik = twoBone(P.x[TH], P.y[TH], F[f].ax, F[f].ay, 112, 104, 1);
    P.a[TH] = ik.a1;
    place(sk, P, SH, ik.a2);
    place(sk, P, FT, F[f].phi + FOOT_A);
  }

  // torso and arms by FK (the walk), then FABRIK takes the near arm + spine to the target
  const sway = Math.sin(TAU * p), swing = Math.cos(Math.PI * p) * 0.36 * Math.pow(vr, 0.8);
  const aS0 = UP + 0.06 + 0.05 * vr + 0.012 * vr * sway + 0.01 * Math.sin(1.1 * t);
  const aC0 = aS0 - 0.01 + 0.012 * Math.sin(TAU * 0.3 * t);
  const uN = Math.PI - swing - 0.05, eN = -0.32 - 0.3 * Math.max(0, Math.cos(Math.PI * p)) * vr, hN = -0.12;
  const J = info.J;
  J[0] = px; J[1] = py;
  let a = aS0; J[2] = J[0] + Math.cos(a) * LENS[0]; J[3] = J[1] + Math.sin(a) * LENS[0];
  a = aC0; J[4] = J[2] + Math.cos(a) * LENS[1]; J[5] = J[3] + Math.sin(a) * LENS[1];
  a += uN; J[6] = J[4] + Math.cos(a) * LENS[2]; J[7] = J[5] + Math.sin(a) * LENS[2];
  a += eN; J[8] = J[6] + Math.cos(a) * LENS[3]; J[9] = J[7] + Math.sin(a) * LENS[3];
  a += hN; J[10] = J[8] + Math.cos(a) * LENS[4]; J[11] = J[9] + Math.sin(a) * LENS[4];
  let tx = J[10], ty = J[11], w = 0;
  if (o.reachDir) { tx = px + o.reachDir[0] * 2000; ty = py + o.reachDir[1] * 2000; w = 1; }
  else if (t < TC) { if (rw > 0) { const s = starFalling(t); tx = lerp(J[10], s[0], rw); ty = lerp(J[11], s[1], rw); w = rw; } }
  else {                                           // caught: a little give, then bring it in front of the face
    const k = ease.inOutCubic(HOLD(t));
    tx = lerp(CATCH[0], px + 104, k); ty = lerp(CATCH[1], py - 178, k) + 16 * bump(t - TC, 0.13); w = 1;
  }
  info.tx = tx; info.ty = ty; info.w = w;
  info.iters = w > 0 ? fabrik(J, LENS, LO, HI, P.a[PEL], tx, ty, { iters: 30, tol: 0.05, ghosts: info.ghosts }) : 0;
  if (!w) for (const g of info.ghosts) g.set(J);
  const ang = (i) => Math.atan2(J[2 * i + 3] - J[2 * i + 1], J[2 * i + 2] - J[2 * i]);
  const aS = ang(0), aC = ang(1);
  place(sk, P, I.spine, aS);
  place(sk, P, I.chest, aC);
  place(sk, P, I.upperN, ang(2));
  place(sk, P, I.foreN, ang(3));
  place(sk, P, I.handN, ang(4));
  // far arm: swings opposite, drifts back for balance during the reach
  const back = 0.3 * rw * (1 - HOLD(t));
  place(sk, P, I.upperF, aC + Math.PI + swing - 0.05 + back);
  place(sk, P, I.foreF, P.a[I.upperF] - 0.32 - 0.3 * Math.max(0, -Math.cos(Math.PI * p)) * vr - 0.3 * back);
  place(sk, P, I.handF, P.a[I.foreF] - 0.12);

  // look-at: neck and head share the turn toward the star, within limits
  const lw = o.reachDir ? 0 : LOOK(t);
  let r = 0;
  if (lw > 0) {
    const look = t < TC ? starFalling(t) : [J[10], J[11]];
    const ex = J[4] + Math.cos(aC) * 80 + Math.cos(aC + DN) * 30, ey = J[5] + Math.sin(aC) * 80 + Math.sin(aC + DN) * 30;
    r = clamp(wrapPi(Math.atan2(look[1] - ey, look[0] - ex) - DN - aC), -1.15, 0.45) * lw;
  }
  const nod = 0.025 * vr * Math.sin(TAU * p + 0.6);
  place(sk, P, I.neck, aC + 0.35 * r + nod * 0.4);
  place(sk, P, I.head, P.a[I.neck] + 0.65 * r + nod);
  place(sk, P, I.eye, P.a[I.head] + DN);
  P.sy[I.eye] = 1 - 0.92 * blink(t);
  place(sk, P, I.brow, P.a[I.head] + DN);
  const lift = 4 * OH(t);
  P.x[I.brow] += Math.cos(P.a[I.head]) * lift; P.y[I.brow] += Math.sin(P.a[I.head]) * lift;
  return info;
}
function setChain(P, idList, nodes) {
  for (let j = 0; j < idList.length; j++) {
    const i = idList[j];
    P.x[i] = nodes[2 * j]; P.y[i] = nodes[2 * j + 1];
    P.a[i] = Math.atan2(nodes[2 * j + 3] - nodes[2 * j + 1], nodes[2 * j + 2] - nodes[2 * j]);
  }
}

// ================================================================== the paper pieces (bind space)
const hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const FAR = [0.64, 0.66, 0.84];
const far = (c) => c.map((v, i) => v * FAR[i]);
const COL = {
  coat: hex('#e6a63c'), coatD: hex('#c4832a'), hood: hex('#d29230'), button: hex('#5c3322'),
  scarf: hex('#cc423a'), trousers: hex('#2e5466'), boot: hex('#a83d2e'), cuff: hex('#87302a'), sole: hex('#3a221f'),
  skin: hex('#f4c6a1'), cheek: hex('#f08880'), hair: hex('#3d2521'), ink: hex('#24152c'), white: [1, 0.98, 0.94], mouth: hex('#7a2a38'),
};
function chainW(nodes, idList) {
  return (x, y) => {
    let best = Infinity, s = 0;
    for (let j = 0; j < nodes.length - 1; j++) {
      const [ax, ay] = nodes[j], [bx, by] = nodes[j + 1], ex = bx - ax, ey = by - ay;
      const u = ((x - ax) * ex + (y - ay) * ey) / (ex * ex + ey * ey), uc = clamp(u, 0, 1);
      const d = Math.hypot(x - ax - ex * uc, y - ay - ey * uc);
      if (d < best - 1e-9) { best = d; s = j + (j === 0 ? Math.min(u, 1) : j === nodes.length - 2 ? Math.max(u, 0) : uc); }
    }
    const nb = idList.length, j0 = clamp(Math.floor(s - 0.5), 0, nb - 2);
    return [idList[j0], idList[j0 + 1], clamp(s - 0.5 - j0, 0, 1)];
  };
}
function strip(nodes, w0, w1) {          // a tapered ribbon along a polyline with a pointed tip
  const L = [], R = [], n = nodes.length;
  for (let i = 0; i < n; i++) {
    const p = nodes[Math.max(0, i - 1)], q = nodes[Math.min(n - 1, i + 1)];
    let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const w = lerp(w0, w1, i / (n - 1));
    L.push([nodes[i][0] + nx * w, nodes[i][1] + ny * w]); R.push([nodes[i][0] - nx * w, nodes[i][1] - ny * w]);
  }
  const tip = nodes[n - 1], prev = nodes[n - 2], dx = tip[0] - prev[0], dy = tip[1] - prev[1], dl = Math.hypot(dx, dy);
  return [...L, [tip[0] + (dx / dl) * 6, tip[1] + (dy / dl) * 6], ...R.reverse()];
}
const sleeve = () => vstrip(0, [[-146, 19], [-122, 18.5], [-96, 17.2], [-68, 15.8], [-40, 15.4], [-12, 15.6], [2, 17.2]]);
const handPoly = () => polar(0, 19, (a) => 1 / Math.hypot(Math.cos(a) / 12.5, Math.sin(a) / 15) + 5.5 * Math.exp(-((wrapPi(a + 0.55) / 0.34) ** 2)), 48);
const trousers = (hx) => vstrip(hx, [[-6, 25], [30, 24.5], [80, 22], [112, 20.5], [150, 19.5], [198, 18.5]]);
const boot = (hx) => [[hx - 21, 167], [hx + 21, 167], [hx + 22, 198], [hx + 28, 208], [hx + 44, 214], [hx + 56, 221], [hx + 61, 229],
  [hx + 58, 235.5], [hx + 40, 236.8], [hx - 14, 236.8], [hx - 23, 232.5], [hx - 25, 222], [hx - 23, 200]];
const cuff = (hx) => [[hx - 24, 162], [hx + 24, 162], [hx + 25, 170], [hx + 23, 177], [hx - 23, 177], [hx - 25, 170]];
const sole = (hx) => [[hx - 22, 231], [hx + 59.5, 231], [hx + 58.5, 235.5], [hx + 40, 237.6], [hx - 14, 237.6], [hx - 22.5, 233.5]];
const COAT = [[-30, -158], [-18, -166], [0, -168], [18, -166], [30, -158], [40, -140], [46, -112], [50, -76], [53, -36], [57, 4], [61, 38],
  [44, 45], [20, 48], [-6, 48], [-32, 46], [-56, 40], [-52, 4], [-46, -36], [-43, -80], [-41, -118], [-38, -146]];
const POCKET = [[17, -32], [46, -32], [47.5, -9], [44, -4], [20, -4], [16.5, -9]];
const WRAP = [[-46, -158], [-42, -172], [-24, -180], [0, -182], [24, -180], [40, -174], [48, -162], [46, -150], [32, -143], [8, -140], [-20, -141], [-40, -146]];
const at = (dx, dy) => [C[0] + dx, C[1] + dy];
const g = (x, c, w) => Math.exp(-((wrapPi(x - c) / w) ** 2));
const HEAD = polar(C[0], C[1], (a) => 1 / Math.hypot(Math.cos(a) / 62, Math.sin(a) / 58) + 7.5 * g(a, 0.1, 0.085) + 2.5 * g(a, 0.5, 0.2) - 4 * g(a, 0.95, 0.3), 96);
function hairPoly() {
  const out = [];
  for (let k = 0; k <= 30; k++) { const a = -0.32 - (k / 30) * (Math.PI + 0.7); out.push(at(Math.cos(a) * 64.5, Math.sin(a) * 63)); }
  out.push(at(-24, 50), at(-19, 34), at(-23, 14), at(-12, -6), at(4, -20), at(18, -30), at(26, -22), at(33, -37), at(42, -29), at(49, -39), at(57, -27), at(61.5, -21));
  return out;
}
const smileP = () => { const o = [], c = at(45, 16); for (let k = 0; k <= 12; k++) { const a = 0.35 + (k / 12) * 1.55; o.push([c[0] + Math.cos(a) * 9.5, c[1] + Math.sin(a) * 9.5]); } for (let k = 12; k >= 0; k--) { const a = 0.45 + (k / 12) * 1.35; o.push([c[0] + Math.cos(a) * 7, c[1] + Math.sin(a) * 7.4]); } return o; };
const browP = () => { const o = []; for (let k = 0; k <= 10; k++) { const u = k / 10; o.push(at(24 + 16 * u, -19.5 - 3.5 * Math.sin(Math.PI * u) - 1.5 * u)); } for (let k = 10; k >= 0; k--) { const u = k / 10; o.push(at(24.5 + 15 * u, -16.3 - 3 * Math.sin(Math.PI * u) - 1.5 * u)); } return o; };

function partList() {
  const head = () => [I.head, I.head, 0];
  const coatW = (x, y) => (y > -40 ? [I.spine, I.pelvis, sstep(-8, 22, y)] : [I.spine, I.chest, sstep(-56, -108, y)]);
  const leg = (s, hx) => {
    const [TH, SH, FT] = s === 'N' ? [I.thighN, I.shinN, I.footN] : [I.thighF, I.shinF, I.footF];
    const c = s === 'N' ? (x) => x : far;
    return [
      { id: 'trousers' + s, polys: [trousers(hx)], col: c(COL.trousers), w: (x, y) => [TH, SH, sstep(92, 132, y)] },
      { id: 'boot' + s, polys: [boot(hx)], col: c(COL.boot), w: (x, y) => [SH, FT, sstep(194, 214, y)] },
      { id: 'sole' + s, polys: [sole(hx)], col: c(COL.sole), w: () => [FT, FT, 0], out: 0, shadow: false, bevel: 3, step: 3, grid: 4 },
      { id: 'cuff' + s, polys: [cuff(hx)], col: c(COL.cuff), w: () => [SH, SH, 0], out: 2, bevel: 5, step: 4, grid: 6 },
    ];
  };
  const arm = (s) => {
    const [U, F, H] = s === 'N' ? [I.upperN, I.foreN, I.handN] : [I.upperF, I.foreF, I.handF];
    const c = s === 'N' ? (x) => x : far;
    return [
      { id: 'sleeve' + s, polys: [sleeve()], col: c(COL.coat), w: (x, y) => [U, F, sstep(-84, -52, y)] },
      { id: 'hand' + s, polys: [handPoly()], col: c(COL.skin), w: (x, y) => [F, H, sstep(1, 9, y)], out: 2.3, bevel: 9, step: 3.5, grid: 6 },
    ];
  };
  return [
    { id: 'tailB', polys: [vstrip(KNOT_B[0], [[KNOT_B[1], 10], [KNOT_B[1] + 40, 10.5], [KNOT_B[1] + SEG_B * (NB - 1), 11]], { fringe: 7, fringeN: 4 })], col: far(COL.scarf).map((v, i) => lerp(v, COL.scarf[i], 0.5)), mat: 1, w: chainW(NODES_B, IDS_B), bevel: 8 },
    { id: 'tailA', polys: [vstrip(KNOT_A[0], [[KNOT_A[1], 12], [KNOT_A[1] + 60, 12.5], [KNOT_A[1] + SEG_A * (NA - 1), 13]], { fringe: 8, fringeN: 5 })], col: COL.scarf, mat: 1, w: chainW(NODES_A, IDS_A), bevel: 9 },
    ...arm('F'),
    ...leg('F', -3),
    ...leg('N', 3),
    { id: 'coat', polys: [COAT], col: COL.coat, w: coatW, bevel: 17, grid: 14 },
    { id: 'pocket', polys: [POCKET], col: COL.coatD, w: coatW, out: 1.6, bevel: 5, step: 4, grid: 7 },
    { id: 'buttons', polys: [ellipse(36, -118, 4.6, 3.2, 16, 0.3), ellipse(40, -84, 4.6, 3.2, 16, 0.3), ellipse(43, -50, 4.6, 3.2, 16, 0.3)], col: COL.button, w: coatW, out: 0, bevel: 2.5, step: 2, grid: 4 },
    { id: 'neck', polys: [[[-13, -180], [11, -180], [11, -140], [-13, -140]]], col: COL.skin, w: (x, y) => [I.chest, I.neck, sstep(-142, -164, y)], bevel: 6, step: 4, grid: 8 },
    { id: 'hood', polys: [polar(-31, -160, (a) => 1 / Math.hypot(Math.cos(a + 0.35) / 25, Math.sin(a + 0.35) / 15.5) + 3 * g(a, 3.6, 0.4), 40)], col: COL.hood, w: (x, y) => [I.chest, I.neck, 0.25], bevel: 10, step: 4, grid: 8 },
    { id: 'wrap', polys: [WRAP], col: COL.scarf, mat: 2, w: (x, y) => [I.chest, I.neck, 0.75 * sstep(-146, -178, y)], bevel: 10, step: 4, grid: 9 },
    { id: 'tuft', polys: [strip(TUFT, 6, 1.2)], col: COL.hair, w: chainW(TUFT, IDS_T), out: 2.2, bevel: 4, step: 3, grid: 5 },
    { id: 'head', polys: [HEAD], col: COL.skin, w: head, bevel: 19, grid: 12 },
    { id: 'hair', polys: [hairPoly()], col: COL.hair, w: head, bevel: 13, grid: 11 },
    { id: 'ear', polys: [ellipse(C[0] - 10, C[1] + 8, 10, 13, 28, -0.15)], col: COL.skin, w: head, out: 2.0, bevel: 7, step: 3, grid: 6 },
    { id: 'cheek', polys: [ellipse(C[0] + 29, C[1] + 15, 12, 8.5, 28)], col: COL.cheek, mat: 3, w: head, out: 0, shadow: false, bevel: 8.5, step: 2.5, grid: 3 },
    { id: 'eye', polys: [ellipse(C[0] + 32, C[1] - 3, 5.3, 8.2, 24)], col: COL.ink, w: () => [I.eye, I.eye, 0], out: 0, shadow: false, bevel: 2, step: 2, grid: 3 },
    { id: 'glint', polys: [ellipse(C[0] + 33.8, C[1] - 6.6, 2.1, 2.3, 12)], col: COL.white, mat: 4, w: () => [I.eye, I.eye, 0], out: 0, shadow: false, bevel: 1, step: 1, grid: 2 },
    { id: 'brow', polys: [browP()], col: COL.hair, w: () => [I.brow, I.brow, 0], out: 0, shadow: false, bevel: 1, step: 2, grid: 3 },
    { id: 'smile', polys: [smileP()], col: COL.mouth, w: head, out: 0, shadow: false, bevel: 1, step: 1.5, grid: 3, alpha: (t) => 1 - OH(t) },
    { id: 'oh', polys: [ellipse(C[0] + 50, C[1] + 25, 4, 5.2, 18)], col: COL.mouth, w: head, out: 0, shadow: false, bevel: 2, step: 1.5, grid: 3, alpha: OH },
    ...arm('N'),
  ];
}

// ================================================================== GPU skinning
const VS = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aNrm;
layout(location = 2) in vec3 aBW;
layout(location = 3) in vec3 aCol;
layout(location = 4) in vec3 aBev;
uniform vec4 uB[72];
uniform vec3 uCam;
uniform vec2 uSp;
uniform float uOff;
uniform vec2 uShift;
out vec2 vWorld; out vec2 vBind; out vec3 vCol; out vec2 vN; out float vMat;
void main() {
  int i0 = int(aBW.x + 0.5), i1 = int(aBW.y + 0.5);
  // linear-blend skinning: blend the two bones' skin matrices, then transform the bind-pose vertex
  vec4 m = mix(uB[2 * i0], uB[2 * i1], aBW.z);
  vec2 tr = mix(uB[2 * i0 + 1].xy, uB[2 * i1 + 1].xy, aBW.z);
  mat2 M = mat2(m.x, m.y, m.z, m.w);
  vec2 p = M * aPos + tr;
  vec2 s = (p - uCam.xy) * uCam.z + uSp;
  vec2 n = M * aNrm;
  float nl = length(n);
  if (nl > 1e-4) s += n / nl * uOff;        // outline / shadow passes push the rim out by a constant screen width
  s += uShift;
  vWorld = p; vBind = aPos; vCol = aCol; vN = M * aBev.xy; vMat = aBev.z;
  gl_Position = vec4(s.x / 540.0 - 1.0, 1.0 - s.y / 960.0, 0.0, 1.0);
}`;
const FS = `#version 300 es
precision highp float;
in vec2 vWorld; in vec2 vBind; in vec3 vCol; in vec2 vN; in float vMat;
uniform float uMode;      // 0 fill · 1 outline · 2 paper shadow · 3 wire
uniform float uAlpha;
uniform vec4 uStar;       // star: world x, y, intensity, radius
uniform vec2 uSweep;      // reveal front (world y) and its glow
uniform float uWire;
out vec4 o;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main() {
  float shown = smoothstep(uSweep.x - 24.0, uSweep.x + 24.0, vWorld.y);
  if (uMode > 2.5) { float a = uWire * mix(1.0, 0.16, shown); o = vec4(vec3(1.0, 0.9, 0.74) * a, a); return; }
  float a = uAlpha * shown;
  if (a <= 0.001) discard;
  if (uMode > 1.5) { o = vec4(0.0, 0.0, 0.02, 0.2) * a; return; }
  if (uMode > 0.5) { o = vec4(vec3(0.13, 0.08, 0.17) * a, a); return; }
  vec3 base = vCol;
  if (vMat > 0.5 && vMat < 2.5) {                       // knitted stripes, fixed to the paper (bind space)
    float u = (vMat < 1.5 ? vBind.y : vBind.x) / 26.0, w = fwidth(u), s = fract(u);
    float st = smoothstep(0.6 - w, 0.6 + w, s) * (1.0 - smoothstep(0.84 - w, 0.84 + w, s));
    base = mix(base, vec3(0.95, 0.88, 0.76), st);
  }
  if (vMat > 3.5) { o = vec4(base * a, a); return; }    // unlit (eye glint)
  if (vMat > 2.5) {                                      // soft blush
    float r = clamp(length(vN) / 0.93, 0.0, 1.0);
    float b = a * 0.5 * (1.0 - r * r);
    o = vec4(base * b, b); return;
  }
  base *= 0.94 + 0.09 * vnoise(vBind * 0.11) + 0.05 * (vnoise(vBind * 0.95) - 0.5);   // paper grain
  vec2 n2 = vN; float l2 = dot(n2, n2);
  if (l2 > 0.9) n2 *= 0.949 * inversesqrt(l2);
  vec3 N = vec3(n2, sqrt(max(1.0 - dot(n2, n2), 0.0)));
  float key = dot(N, normalize(vec3(0.62, -0.40, 0.66)));       // warm afterglow from the horizon ahead
  float sky = clamp(dot(N, normalize(vec3(-0.2, -0.8, 0.56))), 0.0, 1.0);
  float cel = smoothstep(0.28, 0.40, key);
  vec3 col = base * (vec3(0.66, 0.67, 0.84) * (0.74 + 0.3 * sky) + vec3(0.47, 0.31, 0.21) * cel);
  float edge = smoothstep(0.45, 0.85, length(n2));
  col += vec3(1.0, 0.6, 0.42) * edge * max(dot(normalize(n2 + vec2(1e-5)), vec2(0.94, -0.34)), 0.0) * 0.16;
  vec2 d = uStar.xy - vWorld;                                     // the star: a warm point light in front of the paper
  float fall = uStar.z / (1.0 + dot(d, d) / (uStar.w * uStar.w));
  float lam = max(dot(N, normalize(vec3(d, 60.0))), 0.0);
  col += base * vec3(1.0, 0.8, 0.5) * fall * (0.3 + 0.9 * lam);
  float q = (vWorld.y - uSweep.x) / 8.0;
  col += vec3(1.0, 0.86, 0.62) * uSweep.y * exp(-q * q);
  o = vec4(col * a, a);
}`;

function buildGL(gl, parts) {
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(prog));

  // one interleaved buffer: pos2 nrm2 bones2+w1 col3 bevel2+mat1 = 13 floats
  const verts = [], idx = [], edges = new Set(), wire = [];
  let nv = 0;
  for (const part of parts) {
    part.start = idx.length;
    for (const poly of part.polys) {
      const m = meshOutline(poly, { step: part.step || 6, grid: part.grid || 13, bevel: part.bevel || 12 });
      for (let i = 0; i < m.pts.length; i++) {
        const [x, y] = m.pts[i], [b0, b1, w] = part.w(x, y);
        verts.push(x, y, m.nrm[i][0], m.nrm[i][1], b0, b1, w, ...part.col, m.bev[i][0], m.bev[i][1], part.mat || 0);
      }
      for (let k = 0; k < m.tris.length; k += 3) {
        const a = m.tris[k] + nv, b = m.tris[k + 1] + nv, c = m.tris[k + 2] + nv;
        idx.push(a, b, c);
        for (const [u, v] of [[a, b], [b, c], [c, a]]) {
          const key = Math.min(u, v) * 100000 + Math.max(u, v);
          if (!edges.has(key)) { edges.add(key); wire.push(u, v); }
        }
      }
      nv += m.pts.length;
    }
    part.count = idx.length - part.start;
    if (part.out === undefined) part.out = 2.6;
    if (part.shadow === undefined) part.shadow = true;
  }
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  const S = 13 * 4;
  [[0, 2, 0], [1, 2, 2], [2, 3, 4], [3, 3, 7], [4, 3, 10]].forEach(([loc, n, off]) => {
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, n, gl.FLOAT, false, S, off * 4);
  });
  const ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array([...idx, ...wire]), gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  const U = {};
  for (const n of ['uB', 'uCam', 'uSp', 'uOff', 'uShift', 'uMode', 'uAlpha', 'uStar', 'uSweep', 'uWire']) U[n] = gl.getUniformLocation(prog, n);
  return { prog, vao, U, wireStart: idx.length, wireCount: wire.length, nVerts: nv, nTris: idx.length / 3 };
}

// ================================================================== scenery (painted once)
function paintSky(c, r) {
  const g2 = c.getContext('2d');
  const gr = g2.createLinearGradient(0, 0, 0, 1660);
  [[0, '#090b23'], [0.22, '#141744'], [0.42, '#2b285c'], [0.57, '#523c70'], [0.69, '#8c5577'], [0.79, '#c57577'], [0.88, '#e99b7d'], [1, '#f5c08d']]
    .forEach(([o, col]) => gr.addColorStop(o, col));
  g2.fillStyle = gr; g2.fillRect(0, 0, 1080, 1920);
  const hg = g2.createRadialGradient(780, 1560, 0, 780, 1560, 1050);
  hg.addColorStop(0, 'rgba(255,205,150,0.5)'); hg.addColorStop(0.35, 'rgba(255,160,130,0.16)'); hg.addColorStop(1, 'rgba(255,150,130,0)');
  g2.globalCompositeOperation = 'screen'; g2.fillStyle = hg; g2.fillRect(0, 0, 1080, 1920);
  g2.globalCompositeOperation = 'source-over';
  // long thin clouds, lit from below by the afterglow
  g2.filter = 'blur(10px)';
  for (let i = 0; i < 9; i++) {
    const y = 930 + r() * 330, x = r() * 1080, w = 220 + r() * 380, h = 8 + r() * 14;
    g2.fillStyle = `rgba(48,34,88,${(0.18 + r() * 0.16).toFixed(3)})`;
    g2.beginPath(); g2.ellipse(x, y - 6, w, h, 0, 0, TAU); g2.fill();
    g2.fillStyle = `rgba(255,${150 + Math.floor(r() * 40)},150,${(0.12 + r() * 0.12).toFixed(3)})`;
    g2.beginPath(); g2.ellipse(x + 20, y + h * 0.6, w * 0.8, h * 0.45, 0, 0, TAU); g2.fill();
  }
  g2.filter = 'none';
  // a thin moon
  const mx = 205, my = 340;
  const halo = g2.createRadialGradient(mx, my, 0, mx, my, 150);
  halo.addColorStop(0, 'rgba(250,236,205,0.16)'); halo.addColorStop(1, 'rgba(250,236,205,0)');
  g2.fillStyle = halo; g2.fillRect(mx - 150, my - 150, 300, 300);
  const mc = document.createElement('canvas'); mc.width = mc.height = 90;
  const m = mc.getContext('2d');
  m.fillStyle = '#fbf0d4'; m.beginPath(); m.arc(45, 45, 27, 0, TAU); m.fill();
  m.globalCompositeOperation = 'destination-out'; m.beginPath(); m.arc(56, 38, 25, 0, TAU); m.fill();
  g2.drawImage(mc, mx - 45, my - 45);
}
function ridgeLayer({ w, top, ridge, fill, extra, haze }) {
  const c = document.createElement('canvas'); c.width = w; c.height = 1920 - top;
  const g2 = c.getContext('2d');
  g2.translate(0, -top);
  g2.beginPath(); g2.moveTo(0, 1920);
  for (let x = 0; x <= w; x += 3) g2.lineTo(x, ridge(x));
  g2.lineTo(w, 1920); g2.closePath();
  const gr = g2.createLinearGradient(0, top + 60, 0, 1700);
  fill.forEach(([o, col]) => gr.addColorStop(o, col));
  g2.fillStyle = gr; g2.fill();
  if (extra) extra(g2);
  if (haze) {
    const hz = g2.createLinearGradient(0, haze[0], 0, haze[1]);
    hz.addColorStop(0, 'rgba(236,150,140,0)'); hz.addColorStop(1, haze[2]);
    g2.globalCompositeOperation = 'source-atop'; g2.fillStyle = hz; g2.fillRect(0, haze[0], w, haze[1] - haze[0] + 400);
    g2.globalCompositeOperation = 'source-over';
  }
  return c;
}
function tree(g2, x, y, h, kind, col) {
  g2.fillStyle = col;
  if (kind === 0) {
    g2.fillRect(x - h * 0.035, y - h * 0.5, h * 0.07, h * 0.55);
    for (const [dx, dy, rr] of [[0, -0.66, 0.27], [-0.17, -0.52, 0.21], [0.18, -0.54, 0.22], [0.02, -0.82, 0.18]]) {
      g2.beginPath(); g2.arc(x + dx * h, y + dy * h, rr * h, 0, TAU); g2.fill();
    }
  } else {
    g2.fillRect(x - h * 0.03, y - h * 0.2, h * 0.06, h * 0.25);
    for (let k = 0; k < 4; k++) {
      const yb = y - h * (0.12 + 0.2 * k), w2 = h * (0.27 - 0.05 * k);
      g2.beginPath(); g2.moveTo(x - w2, yb); g2.lineTo(x + w2, yb); g2.lineTo(x, yb - h * 0.36); g2.closePath(); g2.fill();
    }
  }
}
function groundLayer(r, ZR, X0, X1, Y0, Y1) {
  const c = document.createElement('canvas');
  c.width = Math.ceil((X1 - X0) * ZR); c.height = Math.ceil((Y1 - Y0) * ZR);
  const g2 = c.getContext('2d');
  g2.scale(ZR, ZR); g2.translate(-X0, -Y0);
  // grass behind the edge first (the path line is the top of the ground)
  for (let x = X0; x < X1; x += 2.1) {
    const h = 5 + 15 * r() ** 2, lean = (r() - 0.62) * 0.7, by = ground(x) + 3;
    g2.strokeStyle = `rgba(${36 + Math.floor(r() * 14)},${30 + Math.floor(r() * 12)},${70 + Math.floor(r() * 18)},1)`;
    g2.lineWidth = 1.1 + r() * 1.1;
    g2.beginPath(); g2.moveTo(x, by); g2.quadraticCurveTo(x + lean * h * 0.3, by - h * 0.6, x + lean * h, by - h); g2.stroke();
  }
  g2.beginPath(); g2.moveTo(X0, Y1);
  for (let x = X0; x <= X1; x += 2) g2.lineTo(x, ground(x));
  g2.lineTo(X1, Y1); g2.closePath();
  const gr = g2.createLinearGradient(0, -100, 0, 420);
  gr.addColorStop(0, '#26214a'); gr.addColorStop(0.25, '#1b1838'); gr.addColorStop(1, '#0d0c20');
  g2.fillStyle = gr; g2.fill();
  // the afterglow catching the rim of the path
  g2.beginPath();
  for (let x = X0; x <= X1; x += 2) (x === X0 ? g2.moveTo(x, ground(x)) : g2.lineTo(x, ground(x)));
  g2.strokeStyle = 'rgba(255,170,140,0.13)'; g2.lineWidth = 6; g2.stroke();
  g2.strokeStyle = 'rgba(255,196,160,0.5)'; g2.lineWidth = 1.4; g2.stroke();
  // grass tips in front of the edge, flowers, pebbles, speckle
  for (let x = X0; x < X1; x += 6.5) {
    const h = 3 + 8 * r(), by = ground(x) + 7 + r() * 10, lean = (r() - 0.6) * 0.8;
    g2.strokeStyle = 'rgba(44,38,84,0.9)'; g2.lineWidth = 1.2;
    g2.beginPath(); g2.moveTo(x, by); g2.quadraticCurveTo(x + lean * h * 0.4, by - h * 0.6, x + lean * h, by - h); g2.stroke();
  }
  for (let i = 0; i < 70; i++) {
    const x = X0 + r() * (X1 - X0), front = r() < 0.4, by = ground(x) + (front ? 12 + r() * 60 : 2), h = (front ? 8 : 12) + r() * 16;
    const lean = (r() - 0.5) * 6;
    g2.strokeStyle = 'rgba(40,36,76,1)'; g2.lineWidth = 1;
    g2.beginPath(); g2.moveTo(x, by); g2.quadraticCurveTo(x + lean * 0.3, by - h * 0.6, x + lean, by - h); g2.stroke();
    const warm = r() < 0.3;
    g2.fillStyle = warm ? 'rgba(255,214,140,0.85)' : 'rgba(236,228,255,0.8)';
    for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; g2.beginPath(); g2.arc(x + lean + Math.cos(a) * 2.2, by - h + Math.sin(a) * 2.2, 1.5, 0, TAU); g2.fill(); }
    g2.fillStyle = warm ? '#c27a2c' : '#f6d27a'; g2.beginPath(); g2.arc(x + lean, by - h, 1.2, 0, TAU); g2.fill();
  }
  for (let i = 0; i < 90; i++) {
    const x = X0 + r() * (X1 - X0), y = ground(x) + 18 + r() * 300, rx = 3 + r() * 9;
    g2.fillStyle = 'rgba(8,6,20,0.45)'; g2.beginPath(); g2.ellipse(x, y, rx, rx * 0.5, 0, 0, TAU); g2.fill();
    g2.fillStyle = 'rgba(120,100,170,0.16)'; g2.beginPath(); g2.ellipse(x - rx * 0.2, y - rx * 0.18, rx * 0.7, rx * 0.25, 0, 0, TAU); g2.fill();
  }
  for (let i = 0; i < 2600; i++) {
    const x = X0 + r() * (X1 - X0), y = ground(x) + 6 + r() * 420;
    g2.fillStyle = `rgba(150,130,210,${(0.02 + r() * 0.05).toFixed(3)})`; g2.fillRect(x, y, 1.4, 1.4);
  }
  return c;
}
function sprite(size, draw) { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size / 2); return c; }

// ================================================================== the demo
defineDemo({
  id: '31-ik-character',
  title: '손을 뻗는 아이',
  tech: '2D 뼈대 · FABRIK 역기구학 + 스키닝',
  duration: D,
  background: '#0b0c22',

  async setup({ canvas, headless }) {
    buildGait();
    const fast = headless ? { willReadFrequently: true } : undefined;
    const bg = canvas({ type: '2d', z: 0, attrs: fast }).ctx;
    const { ctx: gl } = canvas({ type: 'webgl2', z: 1, attrs: { alpha: true, premultipliedAlpha: true, antialias: true, stencil: true, preserveDrawingBuffer: true } });
    const fx = canvas({ type: '2d', z: 2, attrs: fast }).ctx;
    const P = makePose(sk), info = newInfo();

    // ---- where the star lands: the palm of the fully stretched reach at TC, pointing up and forward
    CAMF = camAt(TC);
    const dir = [Math.cos(-1.15), Math.sin(-1.15)];
    solve(TC, P, info, { reachDir: dir });
    CATCH = [info.J[10] - dir[0] * 2.5, info.J[11] - dir[1] * 2.5];
    START = [CAMF.x + (722 - SP[0]) / Z0, CAMF.y + (236 - SP[1]) / Z0];

    // ---- secondary motion: scarf tails + hair tuft, Verlet at 240 Hz hung from the solved neck / head
    const DT = 1 / 240, T0 = -1.5, steps = Math.round((D - T0) / DT);
    const neckF = new Float64Array((steps + 1) * 3 * 2), headF = new Float64Array((steps + 1) * 3);
    for (let s = 0; s <= steps; s++) {
      solve(T0 + s * DT, P, info);
      const kA = carry(sk, P, I.neck, KNOT_A[0], KNOT_A[1]), kB = carry(sk, P, I.neck, KNOT_B[0], KNOT_B[1]), kT = carry(sk, P, I.head, TUFT[0][0], TUFT[0][1]);
      neckF.set([kA[0], kA[1], P.a[I.neck] - UP, kB[0], kB[1], P.a[I.neck] - UP], s * 6);
      headF.set([kT[0], kT[1], P.a[I.head] - UP], s * 3);
    }
    const frameOf = (arr, stride, off) => (t) => { const s = clamp(Math.round((t - T0) / DT), 0, steps), o = s * stride + off; return { x: arr[o], y: arr[o + 1], a: arr[o + 2] }; };
    const local = (nodes) => nodes.map(([x, y]) => [x - nodes[0][0], y - nodes[0][1]]);
    const wind = (t, i, vx, vy, k) => [k * (-70 - 45 * Math.sin(0.8 * t + 0.3) + 32 * Math.sin(4.3 * t - 0.9 * i) - vx), 2400 + k * (22 * Math.sin(6.1 * t - 0.7 * i) - vy)];
    const common = { t0: T0, t1: D, dt: DT, fps: 60, damp: 0.996, iters: 8, bend: 1.55 };
    const chA = bakeChain({ ...common, rest: local(NODES_A), frameAt: frameOf(neckF, 6, 0), root: 0.35, forces: (t, i, x, y, vx, vy) => wind(t, i, vx, vy, 3.0) });
    const chB = bakeChain({ ...common, rest: local(NODES_B), frameAt: frameOf(neckF, 6, 3), root: 0.35, forces: (t, i, x, y, vx, vy) => wind(t, i + 3, vx, vy, 3.4) });
    const chT = bakeChain({ ...common, rest: local(TUFT), frameAt: frameOf(headF, 3, 0), shape: 0.05, bend: 0, damp: 0.985, iters: 4, forces: (t, i, x, y, vx, vy) => [-0.6 * vx, 380 - 0.6 * vy] });
    const nA = new Float64Array(NA * 2), nB = new Float64Array(NB * 2), nT = new Float64Array(TUFT.length * 2);

    // ---- the star's track (for its trail of sparks), and the footfalls
    const STAR_HZ = 120, starTab = new Float64Array((Math.round(D * STAR_HZ) + 1) * 2);
    for (let i = 0; i * 2 < starTab.length; i++) {
      const t = i / STAR_HZ;
      let s;
      if (t < TC) s = starFalling(t); else { solve(t, P, info); s = [info.J[10], info.J[11]]; }
      starTab[2 * i] = s[0]; starTab[2 * i + 1] = s[1];
    }
    const starAt = (t) => { const f = clamp(t * STAR_HZ, 0, starTab.length / 2 - 1), i = Math.min(starTab.length / 2 - 2, Math.floor(f)), k = f - i; return [lerp(starTab[2 * i], starTab[2 * i + 2], k), lerp(starTab[2 * i + 1], starTab[2 * i + 3], k)]; };
    const prints = [...G.plants.values()].filter((pl) => pl.t > -1.2);

    // self-check of the plan (reported by the smoke test if it ever breaks)
    for (let t = 0; t <= D; t += 0.05) {
      solve(t, P, info);
      for (const F of info.feet) if (!(F.h > -3)) { console.error(`foot below ground at t=${t.toFixed(2)}: ${F.h}`); break; }
      if (!Number.isFinite(P.x[I.handN] + P.y[I.head])) { console.error('NaN pose at', t); break; }
    }

    // ---- paper pieces → GPU
    const parts = partList();
    const R = buildGL(gl, parts);
    const skin = new Float32Array(72 * 4);
    this.meshStats = { verts: R.nVerts, tris: R.nTris, bones: sk.n };

    // ---- scenery
    const rr = rand(31);
    const sky = document.createElement('canvas'); sky.width = 1080; sky.height = 1920; paintSky(sky, rr);
    const stars = Array.from({ length: 230 }, () => {
      const y = 1180 * rr() ** 1.5;
      return { x: rr() * 1080, y, s: 0.6 + rr() * 1.3 * (1 - y / 1500), a: (0.35 + rr() * 0.65) * (1 - y / 1300), f: 1 + rr() * 3, ph: rr() * TAU };
    });
    const CAM0 = camAt(0), PAN = (CAMF.x - CAM0.x) * Z0;
    const farW = Math.ceil(1240 + PAN * 0.06), midW = Math.ceil(1240 + PAN * 0.22), nearW = Math.ceil(1260 + PAN * 0.5);
    const G1 = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
    const layers = [
      { f: 0.06, x0: -80, y0: 1040, img: ridgeLayer({ w: farW, top: 1040,
        ridge: (x) => 1300 - 120 * G1(x, 140, 230) - 175 * G1(x, 560, 290) - 95 * G1(x, 960, 210) - 140 * G1(x, 1240, 250) + 6 * Math.sin(x / 23) + 9 * Math.sin(x / 57 + 1),
        fill: [[0, '#7c6292'], [0.5, '#6a5487'], [1, '#5a4a7e']], haze: [1260, 1500, 'rgba(236,150,140,0.38)'] }) },
      { f: 0.22, x0: -80, y0: 1230, img: ridgeLayer({ w: midW, top: 1230,
        ridge: (x) => 1400 + 26 * Math.sin(x / 190 + 0.7) + 14 * Math.sin(x / 77 + 2) - 44 * G1(x, 700, 260),
        fill: [[0, '#453a70'], [1, '#342d5f']], haze: [1380, 1560, 'rgba(210,130,140,0.22)'],
        extra: (g2) => {
          const ridge = (x) => 1400 + 26 * Math.sin(x / 190 + 0.7) + 14 * Math.sin(x / 77 + 2) - 44 * G1(x, 700, 260);
          for (let i = 0; i < 46; i++) { const x = rr() * midW; if (Math.abs(x - 1270) < 70) continue; tree(g2, x, ridge(x) + 6, 34 + rr() * 52, rr() < 0.45 ? 1 : 0, '#3c3367'); }
          const hx = 1270, hy = ridge(1270) + 4;     // a cottage with a lit window
          g2.fillStyle = '#382f62';
          g2.fillRect(hx - 30, hy - 34, 60, 36); g2.fillRect(hx + 12, hy - 62, 9, 20);
          g2.beginPath(); g2.moveTo(hx - 38, hy - 32); g2.lineTo(hx, hy - 62); g2.lineTo(hx + 38, hy - 32); g2.closePath(); g2.fill();
          const wg = g2.createRadialGradient(hx - 9, hy - 18, 0, hx - 9, hy - 18, 46);
          wg.addColorStop(0, 'rgba(255,200,110,0.55)'); wg.addColorStop(1, 'rgba(255,170,90,0)');
          g2.fillStyle = wg; g2.fillRect(hx - 60, hy - 70, 100, 100);
          g2.fillStyle = '#ffd27e'; g2.fillRect(hx - 15, hy - 24, 11, 11); g2.fillStyle = '#f2a65a'; g2.fillRect(hx + 6, hy - 24, 11, 11);
        } }) },
      { f: 0.5, x0: -80, y0: 1340, img: ridgeLayer({ w: nearW, top: 1340,
        ridge: (x) => 1478 + 22 * Math.sin(x / 150 + 2.4) + 10 * Math.sin(x / 53) - 40 * G1(x, 1420, 280),
        fill: [[0, '#2c2954'], [1, '#1f1d44']],
        extra: (g2) => {
          const ridge = (x) => 1478 + 22 * Math.sin(x / 150 + 2.4) + 10 * Math.sin(x / 53) - 40 * G1(x, 1420, 280);
          for (let i = 0; i < 30; i++) {
            const x = rr() * nearW, y = ridge(x) + 8, s2 = 14 + rr() * 26;
            g2.fillStyle = '#2a2752';
            for (let k = 0; k < 4; k++) { g2.beginPath(); g2.arc(x + (k - 1.5) * s2 * 0.5, y - s2 * (0.3 + 0.25 * Math.sin(k * 2.1)), s2 * 0.5, 0, TAU); g2.fill(); }
          }
          for (let i = 0; i < 9; i++) tree(g2, 120 + i * 260 + rr() * 120, ridge(120 + i * 260) + 10, 70 + rr() * 70, rr() < 0.5 ? 1 : 0, '#26234c');
          g2.strokeStyle = '#2a2650'; g2.lineWidth = 4; g2.lineCap = 'round';        // a fence along the near hill
          for (let x = 980; x < 1720; x += 46) { g2.beginPath(); g2.moveTo(x, ridge(x) + 6); g2.lineTo(x + 2, ridge(x) - 30); g2.stroke(); }
          g2.lineWidth = 3;
          for (const dy of [-24, -13]) { g2.beginPath(); for (let x = 980; x < 1720; x += 23) (x === 980 ? g2.moveTo(x, ridge(x) + dy) : g2.lineTo(x, ridge(x) + dy)); g2.stroke(); }
        } }) },
    ];
    const ZR = 1.24, GX0 = -480, GX1 = 1820, GY0 = -230, GY1 = 470;
    const groundImg = groundLayer(rr, ZR, GX0, GX1, GY0, GY1);
    // the nearest grass, out of focus, in front of everything
    const FGW = Math.ceil(1300 + PAN * 1.35);
    const fg = document.createElement('canvas'); fg.width = FGW; fg.height = 320;
    {
      const g2 = fg.getContext('2d');
      g2.filter = 'blur(3px)';
      for (let i = 0; i < 70; i++) {
        const cx = rr() * FGW, n = 4 + Math.floor(rr() * 6);
        if (rr() < 0.35) continue;
        for (let k = 0; k < n; k++) {
          const x = cx + (rr() - 0.5) * 60, h = 70 + rr() * 200, lean = (rr() - 0.5) * 120;
          g2.fillStyle = `rgba(${6 + Math.floor(rr() * 8)},${5 + Math.floor(rr() * 6)},${18 + Math.floor(rr() * 10)},1)`;
          g2.beginPath(); g2.moveTo(x - 7, 330); g2.quadraticCurveTo(x + lean * 0.3, 330 - h * 0.6, x + lean, 330 - h); g2.quadraticCurveTo(x + lean * 0.3 + 4, 330 - h * 0.55, x + 7, 330); g2.fill();
        }
      }
      g2.filter = 'none';
    }
    const vignette = document.createElement('canvas'); vignette.width = 540; vignette.height = 960;
    {
      const g2 = vignette.getContext('2d'), vg = g2.createRadialGradient(270, 430, 180, 270, 480, 640);
      vg.addColorStop(0, 'rgba(4,3,14,0)'); vg.addColorStop(1, 'rgba(4,3,14,0.6)');
      g2.fillStyle = vg; g2.fillRect(0, 0, 540, 960);
    }
    const glow = sprite(128, (g2, m) => { const gr = g2.createRadialGradient(m, m, 0, m, m, m); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 2 * m, 2 * m); });
    const tint = (src, rgb) => sprite(src.width, (g2) => { g2.drawImage(src, 0, 0); g2.globalCompositeOperation = 'source-in'; g2.fillStyle = rgb; g2.fillRect(0, 0, src.width, src.width); });
    const glowGold = tint(glow, 'rgb(255,196,118)'), glowWarm = tint(glow, 'rgb(255,226,170)'), glowSoft = tint(glow, 'rgb(255,170,110)');
    const spark = sprite(48, (g2, m) => {
      const gr = g2.createRadialGradient(m, m, 0, m, m, m * 0.5); gr.addColorStop(0, 'rgba(255,250,230,1)'); gr.addColorStop(1, 'rgba(255,210,140,0)');
      g2.fillStyle = gr; g2.fillRect(0, 0, 2 * m, 2 * m);
      g2.strokeStyle = 'rgba(255,240,200,0.8)'; g2.lineWidth = 1.2;
      g2.beginPath(); g2.moveTo(m, 2); g2.lineTo(m, 2 * m - 2); g2.moveTo(2, m); g2.lineTo(2 * m - 2, m); g2.stroke();
    });
    const streak = sprite(256, (g2, m) => { const gr = g2.createLinearGradient(0, 0, 2 * m, 0); gr.addColorStop(0, 'rgba(255,220,160,0)'); gr.addColorStop(0.5, 'rgba(255,236,200,0.9)'); gr.addColorStop(1, 'rgba(255,220,160,0)'); g2.fillStyle = gr; g2.fillRect(0, m - 2, 2 * m, 4); });
    const starPath = (g2, R0, R1) => { g2.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k / 10) * TAU, rad = k % 2 ? R1 : R0; k ? g2.lineTo(Math.cos(a) * rad, Math.sin(a) * rad) : g2.moveTo(Math.cos(a) * rad, Math.sin(a) * rad); } g2.closePath(); };
    const starCore = sprite(96, (g2, m) => {
      g2.translate(m, m);
      g2.lineJoin = 'round';
      starPath(g2, 30, 14);
      const gr = g2.createRadialGradient(0, -2, 0, 0, 0, 30); gr.addColorStop(0, '#fffdf2'); gr.addColorStop(0.45, '#ffe7a6'); gr.addColorStop(1, '#f6b24e');
      g2.fillStyle = gr; g2.fill();
      g2.strokeStyle = 'rgba(255,250,232,0.9)'; g2.lineWidth = 3; g2.stroke();
    });
    const rp = rand(3131);
    const trail = Array.from({ length: 400 }, () => ({ life: 0.9 + rp() * 1.0, vx: (rp() - 0.5) * 46, vy: 6 + rp() * 34, s: 0.22 + rp() * 0.35, f: 9 + rp() * 14, ph: rp() * TAU, ox: (rp() - 0.5) * 16, oy: (rp() - 0.5) * 16 }));
    const burst = Array.from({ length: 30 }, (_, i) => ({ a: (i / 30) * TAU + rp() * 0.2, v: 140 + rp() * 220, s: 0.25 + rp() * 0.35, life: 0.7 + rp() * 0.6 }));
    const printFx = prints.map(() => Array.from({ length: 4 }, () => ({ dx: (rp() - 0.5) * 60, v: 26 + rp() * 40, s: 0.18 + rp() * 0.2, life: 0.6 + rp() * 0.6 })));


    // ================================================================ per frame
    const drawLayer = (L, cam) => {
      const s = 1 + (cam.z / Z0 - 1) * L.f, sx = -(cam.x - CAM0.x) * Z0 * L.f, sy = -(cam.y - CAM0.y) * Z0 * L.f;
      bg.drawImage(L.img, SP[0] + (L.x0 - SP[0]) * s + sx, SP[1] + (L.y0 - SP[1]) * s + sy, L.img.width * s, L.img.height * s);
    };
    const boneGlyph = (cam, i, a) => {
      const L = sk.len[i];
      if (L < 1) return;
      const [x0, y0] = toScreen(cam, P.x[i], P.y[i]), c = Math.cos(P.a[i]), s = Math.sin(P.a[i]), l = L * cam.z, w = Math.min(9, l * 0.13);
      fx.globalAlpha = a;
      fx.beginPath(); fx.moveTo(x0, y0); fx.lineTo(x0 + c * l * 0.18 - s * w, y0 + s * l * 0.18 + c * w); fx.lineTo(x0 + c * l, y0 + s * l);
      fx.lineTo(x0 + c * l * 0.18 + s * w, y0 + s * l * 0.18 - c * w); fx.closePath(); fx.stroke();
      fx.beginPath(); fx.arc(x0, y0, 3, 0, TAU); fx.stroke();
    };

    this.render = (t) => {
      const cam = camAt(t);
      solve(t, P, info);
      setChain(P, IDS_A, chainAt(chA, t, nA));
      setChain(P, IDS_B, chainAt(chB, t, nB));
      setChain(P, IDS_T, chainAt(chT, t, nT));
      skinMatrices(sk, P, skin);
      const caught = t >= TC;
      const star = caught ? [info.J[10], info.J[11]] : starFalling(t);
      const SL = starLight(t);
      const [ssx, ssy] = toScreen(cam, star[0], star[1]);

      // ---------------- background
      bg.setTransform(1, 0, 0, 1, 0, 0);
      bg.globalCompositeOperation = 'source-over'; bg.globalAlpha = 1;
      bg.drawImage(sky, 0, 0);
      for (const s of stars) {
        bg.globalAlpha = clamp(s.a * (0.72 + 0.28 * Math.sin(s.f * t + s.ph)), 0, 1);
        bg.fillStyle = '#fff6e6';
        bg.fillRect(s.x - s.s / 2, s.y - s.s / 2, s.s, s.s);
      }
      bg.globalAlpha = 1;
      for (const L of layers) drawLayer(L, cam);
      {
        const [x0, y0] = toScreen(cam, GX0, GY0);
        bg.drawImage(groundImg, x0, y0, groundImg.width * cam.z / ZR, groundImg.height * cam.z / ZR);
      }
      // glowing footprints where the IK planted each foot
      bg.globalCompositeOperation = 'lighter';
      prints.forEach((pl, j) => {
        const age = t - pl.t;
        if (age < 0) return;
        const k = 0.85 * Math.exp(-age / 0.8) + 0.16 * Math.exp(-age / 7);
        const [x, y] = toScreen(cam, pl.x, pl.y);
        if (x < -100 || x > 1180) return;
        bg.globalAlpha = k;
        bg.drawImage(glowGold, x - 56 * cam.z, y - 11 * cam.z, 112 * cam.z, 22 * cam.z);
        for (const m of printFx[j]) {
          if (age > m.life) continue;
          bg.globalAlpha = 0.9 * (1 - age / m.life);
          const sz = 48 * m.s * cam.z;
          bg.drawImage(spark, x + m.dx * cam.z - sz / 2, y - m.v * age * cam.z - sz / 2, sz, sz);
        }
      });
      bg.globalCompositeOperation = 'source-over';
      for (const F of info.feet) {                   // contact shadows
        const [x, y] = toScreen(cam, F.sx + 4, ground(F.sx + 4) + 1);
        bg.globalAlpha = 0.6 * (1 - clamp(F.h / 45, 0, 1));
        bg.fillStyle = '#07051a';
        bg.beginPath(); bg.ellipse(x, y, 38 * cam.z, 5.5 * cam.z, 0, 0, TAU); bg.fill();
      }
      bg.globalAlpha = 1;
      const inA = 1 - ramp(t, 0, 0.85);              // the world fades in around the skeleton
      if (inA > 0) { bg.fillStyle = `rgba(6,5,18,${inA.toFixed(3)})`; bg.fillRect(0, 0, 1080, 1920); }

      // ---------------- the child (WebGL2)
      gl.viewport(0, 0, 1080, 1920);
      gl.clearColor(0, 0, 0, 0); gl.clearStencil(0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
      gl.useProgram(R.prog);
      gl.bindVertexArray(R.vao);
      const U = R.U;
      gl.uniform4fv(U.uB, skin);
      gl.uniform3f(U.uCam, cam.x, cam.y, cam.z);
      gl.uniform2f(U.uSp, SP[0], SP[1]);
      gl.uniform4f(U.uStar, star[0], star[1], 0.95 * SL, 150);
      const gpx = ground(Xp(t)), sweepK = ease.inOutCubic(ramp(t, 0.3, 1.45));
      gl.uniform2f(U.uSweep, t < 1.5 ? lerp(gpx + 40, gpx - 640, sweepK) : -1e5, t < 1.5 ? 0.9 * (1 - ramp(t, 1.2, 1.45)) : 0);
      gl.uniform1f(U.uWire, 0);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.STENCIL_TEST);
      for (const part of parts) {
        const a = part.alpha ? part.alpha(t) : 1;
        if (a <= 0.001) continue;
        gl.uniform1f(U.uAlpha, a);
        if (part.shadow) {       // paper drop shadow, only onto pieces already laid (stencil)
          gl.stencilFunc(gl.EQUAL, 1, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
          gl.uniform1f(U.uMode, 2); gl.uniform1f(U.uOff, part.out); gl.uniform2f(U.uShift, -2.4, 3.4);
          gl.drawElements(gl.TRIANGLES, part.count, gl.UNSIGNED_INT, part.start * 4);
        }
        gl.stencilFunc(gl.ALWAYS, 1, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        gl.uniform2f(U.uShift, 0, 0);
        if (part.out > 0) { gl.uniform1f(U.uMode, 1); gl.uniform1f(U.uOff, part.out); gl.drawElements(gl.TRIANGLES, part.count, gl.UNSIGNED_INT, part.start * 4); }
        gl.uniform1f(U.uMode, 0); gl.uniform1f(U.uOff, 0);
        gl.drawElements(gl.TRIANGLES, part.count, gl.UNSIGNED_INT, part.start * 4);
      }
      gl.disable(gl.STENCIL_TEST);
      const wireA = 0.55 * (1 - ramp(t, 1.15, 1.85));
      if (wireA > 0) {         // the triangle mesh itself, before the skin covers it
        gl.uniform1f(U.uMode, 3); gl.uniform1f(U.uWire, wireA); gl.uniform1f(U.uOff, 0);
        gl.drawElements(gl.LINES, R.wireCount, gl.UNSIGNED_INT, R.wireStart * 4);
      }
      gl.bindVertexArray(null);

      // ---------------- light, star, sparks, overlays
      fx.setTransform(1, 0, 0, 1, 0, 0);
      fx.clearRect(0, 0, 1080, 1920);
      fx.globalCompositeOperation = 'lighter';
      // the star lights the dusk around it
      fx.globalAlpha = clamp(0.2 * SL * (0.25 + 0.75 * ramp(t, 0.3, 1.2)), 0, 1);
      fx.drawImage(glowSoft, ssx - 430, ssy - 430, 860, 860);
      // trail of sparks while it falls, motes rising from the hands after
      const RATE = 46;
      for (let i = Math.max(0, Math.floor((t - 2.0) * RATE)); i <= Math.floor(t * RATE); i++) {
        const tau = i / RATE, m = trail[i % trail.length], age = t - tau;
        if (age < 0 || age > m.life || tau < 0.95) continue;
        const after = tau >= TC;
        if (after && i % 2) continue;
        const o = starAt(tau), cm = camAt(tau), [ox, oy] = toScreen(cm, o[0], o[1]);
        const vy = after ? -(18 + m.vy * 1.4) : m.vy, vx = after ? m.vx * 0.5 : m.vx;
        const x = ox + m.ox + vx * age, y = oy + m.oy + vy * age + (after ? 0 : 14 * age * age);
        fx.globalAlpha = clamp((1 - age / m.life) ** 1.4 * (0.55 + 0.45 * Math.sin(m.f * age + m.ph)), 0, 1);
        const sz = 48 * m.s * (after ? 0.8 : 1);
        fx.drawImage(spark, x - sz / 2, y - sz / 2, sz, sz);
      }
      // catch burst
      const ab = t - TC;
      if (ab >= 0 && ab < 1.4) {
        fx.globalAlpha = 0.75 * (1 - ab / 1.4) ** 2;
        fx.strokeStyle = 'rgba(255,230,180,1)'; fx.lineWidth = 2.2;
        fx.beginPath(); fx.arc(ssx, ssy, 16 + 230 * ease.outCubic(clamp(ab / 1.1)), 0, TAU); fx.stroke();
        for (const b of burst) {
          if (ab > b.life) continue;
          const d = (b.v * (1 - Math.exp(-3 * ab))) / 3;
          fx.globalAlpha = (1 - ab / b.life) ** 1.3;
          const sz = 48 * b.s;
          fx.drawImage(spark, ssx + Math.cos(b.a) * d - sz / 2, ssy + Math.sin(b.a) * d + 20 * ab * ab - sz / 2, sz, sz);
        }
      }
      // the star: halo, streak, core
      fx.globalAlpha = clamp(0.5 * SL, 0, 1);
      fx.drawImage(glowGold, ssx - 150, ssy - 150, 300, 300);
      fx.globalAlpha = clamp(0.85 * SL, 0, 1);
      fx.drawImage(glowWarm, ssx - 44, ssy - 44, 88, 88);
      fx.globalAlpha = clamp(0.55 * SL, 0, 1);
      const sl = 150 + 40 * Math.sin(3.1 * t);
      fx.drawImage(streak, ssx - sl, ssy - 6, sl * 2, 12);
      fx.globalCompositeOperation = 'source-over';
      fx.globalAlpha = clamp(0.4 + 0.6 * ramp(t, 0.2, 0.8), 0, 1);
      {
        const rot = 0.35 * Math.sin(1.3 * t) + 0.25 * t, sc = (caught ? 0.34 : 0.4) * (1 + 0.05 * Math.sin(7 * t)) * (1 + 0.3 * bump(t - 0.92, 0.16));
        fx.setTransform(sc * Math.cos(rot), sc * Math.sin(rot), -sc * Math.sin(rot), sc * Math.cos(rot), ssx, ssy);
        fx.drawImage(starCore, -48, -48);
        fx.setTransform(1, 0, 0, 1, 0, 0);
      }
      fx.globalCompositeOperation = 'lighter';
      fx.globalAlpha = clamp(0.6 * SL, 0, 1);
      fx.drawImage(glow, ssx - 14, ssy - 14, 28, 28);
      fx.globalCompositeOperation = 'source-over';

      // the rig made visible: every bone at the start, the FABRIK chain while it reaches
      const boneA = 0.9 * (1 - ramp(t, 0.95, 1.75));
      if (boneA > 0) {
        fx.strokeStyle = '#c6ecff'; fx.lineWidth = 1.6; fx.lineJoin = 'round';
        for (let i = 0; i < sk.n; i++) boneGlyph(cam, i, boneA * (i >= IDS_A[0] ? 0.6 : 1));
        fx.globalAlpha = 1;
      }
      const ikA = ramp(t, 5.0, 5.4) * (1 - ramp(t, 6.75, 7.35));
      if (ikA > 0) {
        const J = info.J, pts = (A) => Array.from({ length: 6 }, (_, k) => toScreen(cam, A[2 * k], A[2 * k + 1]));
        const chain = pts(J);
        fx.lineCap = 'round'; fx.lineJoin = 'round';
        // the solver's first passes, fading
        info.ghosts.forEach((gh, k) => {
          const q = pts(gh);
          fx.globalAlpha = ikA * (0.32 - 0.09 * k);
          fx.setLineDash([5, 6]); fx.strokeStyle = '#9fdcff'; fx.lineWidth = 1.4;
          fx.beginPath(); q.forEach(([x, y], j) => (j ? fx.lineTo(x, y) : fx.moveTo(x, y))); fx.stroke();
        });
        fx.setLineDash([]);
        // joint ranges: the elbow can only fold one way, the shoulder sweeps from beside the hip to overhead
        const wedge = (j, parentA, lo, hi, rad) => {
          const [x, y] = chain[j];
          fx.globalAlpha = ikA * 0.16; fx.fillStyle = '#9fdcff';
          fx.beginPath(); fx.moveTo(x, y); fx.arc(x, y, rad, parentA + lo, parentA + hi); fx.closePath(); fx.fill();
          fx.globalAlpha = ikA * 0.45; fx.strokeStyle = '#c6ecff'; fx.lineWidth = 1;
          fx.beginPath(); fx.arc(x, y, rad, parentA + lo, parentA + hi); fx.stroke();
        };
        const ang = (k) => Math.atan2(J[2 * k + 3] - J[2 * k + 1], J[2 * k + 2] - J[2 * k]);
        wedge(3, ang(2), LO[3], HI[3], 34);
        wedge(2, ang(1), LO[2], HI[2], 26);
        fx.globalAlpha = ikA * 0.95; fx.strokeStyle = '#e4f6ff'; fx.lineWidth = 2.2;
        fx.beginPath(); chain.forEach(([x, y], j) => (j ? fx.lineTo(x, y) : fx.moveTo(x, y))); fx.stroke();
        fx.fillStyle = '#0b0c22';
        chain.forEach(([x, y], j) => { fx.beginPath(); fx.arc(x, y, j ? 4.5 : 6, 0, TAU); fx.fill(); fx.stroke(); });
        const [tx, ty] = toScreen(cam, info.tx, info.ty);           // the target
        fx.globalAlpha = ikA * 0.8; fx.lineWidth = 1.5;
        fx.beginPath(); fx.arc(tx, ty, 21, 0, TAU); fx.stroke();
        for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.785; fx.beginPath(); fx.moveTo(tx + Math.cos(a) * 26, ty + Math.sin(a) * 26); fx.lineTo(tx + Math.cos(a) * 34, ty + Math.sin(a) * 34); fx.stroke(); }
        fx.globalAlpha = 1;
      }

      // the nearest grass, the frame, the loop seam
      fx.globalAlpha = 1;
      {
        const s = 1 + (cam.z / Z0 - 1) * 1.35;
        fx.drawImage(fg, -80 - (cam.x - CAM0.x) * Z0 * 1.35, 1920 - 300 * s - (cam.y - CAM0.y) * Z0 * 0.3, fg.width * s, fg.height * s);
      }
      fx.drawImage(vignette, 0, 0, 1080, 1920);
      const outA = 0.92 * ramp(t, 9.12, 9.6);
      if (outA > 0) { fx.fillStyle = `rgba(6,5,18,${outA.toFixed(3)})`; fx.fillRect(0, 0, 1080, 1920); }
    };
  },

  frame(t) { this.render(t); },
});
