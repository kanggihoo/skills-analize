/*
 * kid.js — the rider and the board as closed-form functions of story time τ.
 *
 * Kid space: origin on the ground under the board centre, x along the run (right), y up, 1 unit = 1 px at the
 * depth of the run. The scene places it at screen (X, Y) and flips y (or does not, for the mirror image).
 *
 *   cruise ── crouch ── stomp (the board pivots on its back axle until the tail tip meets the ground) ── flight
 *   ── landing ── tail-drag stop ── stands, turns to look back
 *
 * Flight (s = τ − τ_pop, 0 ≤ s ≤ T): rider's hip and board each follow a parabola that leaves and lands at the same
 * instants:  y(s) = y₀(1 − s/T) + y₁·s/T + 4H·(s/T)(1 − s/T)  — free fall with g = 8H/T². The rider rises H_R, the
 * board is lifted higher (H_B > H_R, the front foot drags it up): the difference is the knee tuck, and two-bone IK
 * bends the knees so both feet stay on the deck. The stop is constant deceleration: x = x_b + V·s − a·s²/2 up to
 * s = V/a. Wheel angle = distance rolled / radius, so the wheels stop when the kid does.
 */
import { clamp, lerp, smooth, track, ease } from '../_lib/stage.js';

export const V = 900;                 // run speed, px per story second
export const XK0 = -290;              // kid x (world) at τ = 0
export const T_AIR = 0.5;             // air time (story s)
export const H_RIDER = 150;           // rider hip rise
export const H_BOARD = 200;           // board rise
export const G = (8 * H_RIDER) / (T_AIR * T_AIR);   // 4800 px/s² — the same g drives every droplet

// board geometry (board-local, y up, origin on the ground under the centre when level)
export const WX = 56, WR = 12, AXLE = 12, DBOT = 26, DTOP = 33, KICK = 90, TIPX = 122, TIPR = 7;
const PIV = [-WX, AXLE];               // the stomp and the drag pivot on the back axle
// angle at which the tail tip's underside reaches the ground:  66 sinθ − 21 cosθ = 12
const TIPB = [-TIPX + WX, DBOT + TIPR - AXLE];
export const THETA_TOUCH = Math.asin(AXLE / Math.hypot(TIPB[0], TIPB[1])) + Math.atan2(TIPB[1], -TIPB[0]);

const HIP0 = 225;                     // hip height when the board leaves the ground (back leg pushed straight)
const HIP1 = DTOP + 175;              // hip height at touchdown (legs reaching for the board)
const E_STAND = 196, E_CROUCH = 122;  // hip above the deck while cruising / at the bottom of the crouch
export const THIGH = 108, SHIN = 106;

/** the story's beats; xStop: where the tail-drag stop ends (world x) */
export function makeStory(tauFreeze, xStop) {
  const pop = tauFreeze - T_AIR / 2;  // the apex of the ollie is the frozen frame
  const land = pop + T_AIR;
  const b0 = land + 0.06;             // the tail goes down
  const xb = XK0 + V * b0;
  const a = (V * V) / (2 * (xStop - xb));
  const Tb = V / a;
  return { pop, land, freeze: tauFreeze, b0, xb, a, Tb, stop: b0 + Tb, turn: 6.5, fist: 6.62 };
}
/** world x of the kid, and its speed */
export function xkOf(st, ta) {
  if (ta <= st.b0) return XK0 + V * ta;
  const s = Math.min(ta - st.b0, st.Tb);
  return st.xb + V * s - 0.5 * st.a * s * s;
}
export function vkOf(st, ta) { return ta <= st.b0 ? V : Math.max(0, V - st.a * (ta - st.b0)); }

const D2R = Math.PI / 180;
const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
function pivoted(a) { const [rx, ry] = rot(-PIV[0], -PIV[1], a); return { x: PIV[0] + rx, y: PIV[1] + ry, a }; }

/** deck top height at board-local x (flat middle, kicked tails) */
export function deckTop(x) {
  const k = Math.max(0, (Math.abs(x) - KICK) / (TIPX - KICK));
  return DTOP + TIPR * k * k;
}

// ---------------------------------------------------------------- the board
const BOARD_A = track([
  [0, THETA_TOUCH],
  [0.035, THETA_TOUCH + 3 * D2R, ease.outCubic],
  [0.2, 0, ease.inOutCubic],                          // the front foot slides up the deck and levels it
  [0.36, -3 * D2R],
  [T_AIR, 0],
]);
function boardPose(st, ta) {
  const s = ta - st.pop;
  if (ta >= st.land) {                                // tail drag: nose up on the back axle while braking
    const on = smooth((ta - st.b0) / 0.05), off = 1 - smooth((ta - st.stop) / 0.12);
    const a = THETA_TOUCH * 0.97 * on * off;
    return a > 1e-5 ? pivoted(a) : { x: 0, y: 0, a: 0 };
  }
  if (s < -0.07) return { x: 0, y: 0, a: 0 };
  if (s < 0) { const u = (s + 0.07) / 0.07; return pivoted(THETA_TOUCH * u * u); }   // stomp
  const p = pivoted(THETA_TOUCH), q = s / T_AIR;
  return {
    x: p.x * (1 - smooth(s / 0.25)),
    y: p.y * (1 - q) + 4 * H_BOARD * q * (1 - q),       // a parabola from the snapped pose to the ground
    a: BOARD_A(s),
  };
}

// ---------------------------------------------------------------- the rider
function hipY(st, ta) {
  const s = ta - st.pop;
  if (ta >= st.land) {                                 // absorb the landing: damped, velocity-matched at touchdown
    const o = ta - st.land, vy = (HIP1 - HIP0) / T_AIR - (4 * H_RIDER) / T_AIR;   // −1244 px/s
    const A = E_STAND - (HIP1 - DTOP), B = (A * 6 - vy) / 9;
    const brake = smooth((ta - st.b0) / 0.1) * (1 - smooth((ta - st.stop - 0.05) / 0.35));
    const breath = 3 * Math.sin(2 * Math.PI * 0.8 * (ta - st.stop)) * smooth((ta - st.stop) / 0.5);
    return DTOP + E_STAND - A * Math.exp(-6 * o) * Math.cos(9 * o) - B * Math.exp(-7 * o) * Math.sin(9 * o) - 40 * brake + breath;
  }
  if (s >= 0) {
    const q = s / T_AIR;
    return HIP0 * (1 - q) + HIP1 * q + 4 * H_RIDER * q * (1 - q);
  }
  if (s >= -0.07) {                                    // the push: cubic Hermite into the flight's take-off velocity
    const u = (s + 0.07) / 0.07, p0 = DTOP + E_CROUCH, p1 = HIP0;
    const m1 = ((HIP1 - HIP0) / T_AIR + (4 * H_RIDER) / T_AIR) * 0.07;
    return (2 * u ** 3 - 3 * u * u + 1) * p0 + (-2 * u ** 3 + 3 * u * u) * p1 + (u ** 3 - u * u) * m1;
  }
  const c = ease.inOutCubic(clamp((ta - (st.pop - 0.45)) / 0.38));   // crouch
  const bob = 4 * Math.sin(2 * Math.PI * 1.15 * ta) * (1 - c);
  return DTOP + lerp(E_STAND, E_CROUCH, c) + bob;
}

export function pose(st, ta) {
  const b = boardPose(st, ta);
  const s = ta - st.pop, o = ta - st.land;
  const hy = hipY(st, ta);
  const e = 1e-3, vy = (hipY(st, ta + e) - hipY(st, ta - e)) / (2 * e);   // derivative of the closed form
  const air = s > 0 && o < 0;
  const vk = vkOf(st, ta);

  // feet on the deck (board-local x)
  let fb = s < -0.45 ? -70 : s < -0.1 ? lerp(-70, -96, smooth((s + 0.45) / 0.3)) : -96;
  if (o > 0) fb = lerp(-96, -72, smooth((ta - st.stop - 0.1) / 0.4));
  const ff = s < 0 ? 30 : o < 0 ? (s < 0.12 ? lerp(30, 62, ease.outCubic(s / 0.12)) : lerp(62, 40, smooth((s - 0.12) / 0.3))) : lerp(40, 30, smooth((ta - st.stop) / 0.4));

  const arms = ARMS(ta);
  const sway = Math.sin(2 * Math.PI * 0.55 * ta) * (s < -0.5 ? 1 : 0);
  const turn = clamp((ta - st.turn) / 0.24);
  return {
    tau: ta, b, vy, air,
    feet: [fb, ff],
    hip: [-20 + 4 * sway + (air ? 4 : 0), hy],
    lean: LEAN(ta) + 0.02 * sway,
    arms: [arms[0] + 0.05 * sway, arms[1], arms[2] - 0.05 * sway, arms[3]],
    tilt: TILT(ta),
    look: Math.cos(Math.PI * ease.inOutCubic(turn)),   // 1 facing the run, −1 looking back
    mouth: MOUTH(ta),
    hem: [-15 * (vk / V) - (air ? 4 : 0) + 4 * (1 - vk / V) * Math.sin(5 * ta), clamp(-0.018 * vy, -26, 26)],
    hair: clamp(-0.011 * vy, -9, 12),
    wheel: xkOf(st, ta) / WR,
  };
}

// key poses on the story clock (built once the beats are known)
let ARMS, LEAN, TILT, MOUTH;
export function makeTracks(st) {
  const p = st.pop, l = st.land;
  ARMS = track([
    [0, [0.34, 0.32, 0.30, 0.36]],
    [p - 0.45, [0.36, 0.30, 0.30, 0.40]],
    [p - 0.08, [0.70, 0.10, 0.16, 0.70]],               // crouch: arms low, wound up
    [p + 0.07, [1.30, 0.62, 1.80, 0.28], ease.outCubic], // pop: arms fling up
    [p + 0.22, [1.52, 0.48, 1.62, 0.46]],                // apex: wide, balanced
    [p + 0.44, [1.22, 0.40, 1.30, 0.40]],
    [l + 0.07, [0.90, 0.30, 0.98, 0.34]],                // touchdown
    [st.b0 + 0.12, [1.20, 0.55, 0.85, 0.85]],            // dragging the tail: arms out front for balance
    [st.stop + 0.4, [0.40, 0.30, 0.42, 0.34]],           // stands
    [st.fist, [0.40, 0.30, 0.46, 0.34]],
    [st.fist + 0.3, [0.42, 0.28, 2.72, 0.22], ease.outBack],   // fist up, looking back at the puddle
    [st.fist + 2, [0.40, 0.30, 2.62, 0.30]],
  ]);
  LEAN = track([[0, 0.05], [p - 0.45, 0.05], [p - 0.08, 0.15], [p + 0.06, 0.0], [p + 0.3, 0.05], [l + 0.08, 0.13],
    [st.b0 + 0.12, -0.16], [st.stop + 0.12, -0.12], [st.stop + 0.5, 0.02], [st.turn, 0.02], [st.turn + 0.3, -0.05]]);
  TILT = track([[0, 0.03], [p - 0.8, 0.03], [p - 0.35, -0.17], [p + 0.1, -0.02], [p + 0.3, 0.06], [l + 0.12, 0.0],
    [st.stop + 0.3, 0.06], [st.turn, 0.04], [st.turn + 0.3, 0.13]]);
  MOUTH = track([[0, 0], [p - 0.3, 0], [p - 0.1, 1], [p + 0.12, 2], [l + 0.05, 2], [l + 0.3, 3]]);   // 0 calm · 1 set · 2 open · 3 grin
}

// ---------------------------------------------------------------- palettes
const BASE = {
  coat: '#ffc83d', coatSh: '#e9a321', coatHi: '#ffe08a', coatLine: '#c4840f',
  pants: '#2d3a52', pantsSh: '#222c40', cuff: '#3a4864',
  skin: '#f2c4a1', skinSh: '#dea482', blush: '#ee9b86',
  hair: '#1d2331', hairHi: '#3a4357',
  shoe: '#f2f0ea', shoeSh: '#c8cdd6', sole: '#283141',
  deck: '#2a3343', deckEdge: '#465268', grip: '#141922',
  truck: '#a3aebb', truckSh: '#6f7c8d',
  wheel: '#efe9d8', wheelSh: '#c8bfa6', core: '#8b97a6',
  ink: '#1b2230',
};
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const css = ([r, g, b]) => `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
function mapPal(f) { const o = {}; for (const k in BASE) o[k] = css(f(hex(BASE[k]))); return o; }
const lum = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;
const WATER = [40, 55, 70];
const inWater = (c) => c.map((v, i) => lerp(v * 0.8, WATER[i], 0.32));
export const PAL = {
  base: BASE,
  refl: mapPal(inWater),                                                     // seen in the water: darker, cooler
  gray: mapPal((c) => { const l = lum(c); return [l - 3, l, l + 5]; }),      // the frozen-frame treatment
  grayRefl: mapPal((c) => { const l = lum(inWater(c)); return [l - 3, l, l + 5]; }),
};

// ---------------------------------------------------------------- drawing (call with y-up kid space already set)
function ik(hx, hy, fx, fy, side) {
  const dx = fx - hx, dy = fy - hy, d = clamp(Math.hypot(dx, dy), 1, THIGH + SHIN - 0.5);
  const a = Math.atan2(dy, dx);
  const A = Math.acos(clamp((THIGH * THIGH + d * d - SHIN * SHIN) / (2 * THIGH * d), -1, 1));
  const k = a + side * A;
  return [hx + THIGH * Math.cos(k), hy + THIGH * Math.sin(k)];
}

function limb(g, pts, w, col) {
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.stroke();
}

function drawBoard(g, P, bp, wheel) {
  g.save();
  g.translate(bp.x, bp.y); g.rotate(bp.a);
  for (const sx of [-WX, WX]) {                         // trucks
    g.fillStyle = P.truckSh;
    g.beginPath(); g.moveTo(sx - 15, DBOT); g.lineTo(sx + 15, DBOT); g.lineTo(sx + 9, DBOT - 6); g.lineTo(sx - 9, DBOT - 6); g.fill();
    g.fillStyle = P.truck;
    g.beginPath(); g.moveTo(sx - 5, DBOT - 5); g.lineTo(sx + 5, DBOT - 5); g.lineTo(sx + 15, AXLE + 3); g.lineTo(sx + 13, AXLE - 2); g.lineTo(sx - 13, AXLE - 2); g.lineTo(sx - 15, AXLE + 3); g.fill();
  }
  for (const sx of [-WX, WX]) {                         // the near wheels (the far pair hides behind them)
    g.fillStyle = P.wheel; g.beginPath(); g.arc(sx, AXLE, WR, 0, Math.PI * 2); g.fill();
    g.fillStyle = P.wheelSh; g.beginPath(); g.arc(sx, AXLE, WR, Math.PI * 1.05, Math.PI * 1.95); g.arc(sx, AXLE + 3, WR - 2, Math.PI * 1.9, Math.PI * 1.1, true); g.fill();
    g.fillStyle = P.core; g.beginPath(); g.arc(sx, AXLE, 5, 0, Math.PI * 2); g.fill();
    const a = -wheel;                                   // printed marks show the spin (angle = distance / radius)
    g.fillStyle = P.wheelSh;
    g.beginPath(); g.arc(sx + 8.2 * Math.cos(a), AXLE + 8.2 * Math.sin(a), 2.4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(sx + 8.2 * Math.cos(a + 2.4), AXLE + 8.2 * Math.sin(a + 2.4), 1.6, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = P.deck;                                 // deck: flat middle, kicked tails
  g.beginPath();
  g.moveTo(-KICK, DBOT); g.lineTo(KICK, DBOT);
  g.quadraticCurveTo(KICK + 20, DBOT, TIPX, DBOT + TIPR);
  g.arc(TIPX - 1, DBOT + TIPR + 3.5, 3.6, -Math.PI / 2 - 0.9, Math.PI / 2 + 0.3, true);
  g.quadraticCurveTo(KICK + 18, DTOP, KICK, DTOP);
  g.lineTo(-KICK, DTOP);
  g.quadraticCurveTo(-KICK - 18, DTOP, -TIPX + 1, DTOP + TIPR);
  g.arc(-TIPX + 1, DBOT + TIPR + 3.5, 3.6, Math.PI / 2 - 0.3, -Math.PI / 2 + 0.9, true);
  g.quadraticCurveTo(-KICK - 20, DBOT, -KICK, DBOT);
  g.fill();
  g.strokeStyle = P.grip; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-TIPX + 3, DTOP + TIPR - 0.5); g.quadraticCurveTo(-KICK - 18, DTOP - 0.5, -KICK, DTOP - 0.5); g.lineTo(KICK, DTOP - 0.5); g.quadraticCurveTo(KICK + 18, DTOP - 0.5, TIPX - 3, DTOP + TIPR - 0.5); g.stroke();
  g.strokeStyle = P.deckEdge; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(-KICK + 6, DBOT + 2.2); g.lineTo(KICK - 6, DBOT + 2.2); g.stroke();
  g.restore();
}

/** board-local point → kid space */
function onBoard(bp, x, y) { const [rx, ry] = rot(x, y, bp.a); return [bp.x + rx, bp.y + ry]; }

function drawShoe(g, P, bp, fx) {
  const [cx, cy] = onBoard(bp, fx, deckTop(fx));
  const k = Math.max(0, (Math.abs(fx) - KICK) / (TIPX - KICK));
  const a = bp.a + Math.sign(fx) * Math.atan(2 * TIPR * k / (TIPX - KICK));
  g.save(); g.translate(cx, cy); g.rotate(a);
  g.fillStyle = P.sole;                                 // seen toe-first (feet across the board)
  g.beginPath(); g.roundRect(-25, 0, 50, 8, 4); g.fill();
  g.fillStyle = P.shoe;
  g.beginPath(); g.moveTo(-24, 6); g.lineTo(24, 6); g.bezierCurveTo(26, 22, 18, 30, 0, 31); g.bezierCurveTo(-18, 30, -26, 22, -24, 6); g.fill();
  g.fillStyle = P.shoeSh;
  g.beginPath(); g.moveTo(-24, 6); g.lineTo(-6, 6); g.bezierCurveTo(-8, 18, -6, 26, -2, 31); g.bezierCurveTo(-18, 30, -26, 22, -24, 6); g.fill();
  g.fillStyle = P.ink;
  for (const lx of [-6, 0, 6]) { g.beginPath(); g.arc(lx + 2, 22 - Math.abs(lx) * 0.3, 1.7, 0, Math.PI * 2); g.fill(); }
  g.restore();
  return onBoard(bp, fx, deckTop(fx) + 26);   // ankle
}

/** Draw the kid in kid space (y up). P: palette; the caller sets the transform (normal or mirrored). */
export function drawKid(g, P, k) {
  const bp = k.b;
  drawBoard(g, P, bp, k.wheel);
  const ankB = drawShoe(g, P, bp, k.feet[0]);
  const ankF = drawShoe(g, P, bp, k.feet[1]);

  const [hx, hy] = k.hip;
  const ux = Math.sin(k.lean), uy = Math.cos(k.lean);      // torso up
  const rx = uy, ry = -ux;                                  // torso right
  const T = (a, b) => [hx + a * rx + b * ux, hy + a * ry + b * uy];
  const hipB = T(-17, 4), hipF = T(17, 4);
  const kB = ik(hipB[0], hipB[1], ankB[0], ankB[1], -1);
  const kF = ik(hipF[0], hipF[1], ankF[0], ankF[1], 1);
  limb(g, [hipB[0], hipB[1], kB[0], kB[1], ankB[0], ankB[1]], 34, P.pantsSh);
  limb(g, [hipF[0], hipF[1], kF[0], kF[1], ankF[0], ankF[1]], 35, P.pants);
  g.strokeStyle = P.cuff; g.lineWidth = 4; g.lineCap = 'round';
  for (const [an, kn] of [[ankB, kB], [ankF, kF]]) {
    const dx = an[0] - kn[0], dy = an[1] - kn[1], d = Math.hypot(dx, dy) || 1;
    const px = (-dy / d) * 17, py = (dx / d) * 17, cx = an[0] - (dx / d) * 10, cy = an[1] - (dy / d) * 10;
    g.beginPath(); g.moveTo(cx - px, cy - py); g.lineTo(cx + px, cy + py); g.stroke();
  }

  // torso: a raincoat to mid-thigh; the hem trails the run and lags the vertical motion
  const crouch = clamp((E_STAND - (hy - bp.y - DTOP)) / 90, 0, 1);
  const Lt = 146 - 12 * crouch;
  const [hdx, hdy] = k.hem;
  const H = (a, b, w) => { const p = T(a, b); return [p[0] + hdx * w, p[1] + hdy * w]; };
  const fl = Math.sin(k.tau * 23) * 2.5 * (k.air ? 1 : 0.5);
  g.fillStyle = P.coatSh;                                   // hood, bunched behind the neck
  { const [ax, ay] = T(-24, Lt + 4); g.beginPath(); g.ellipse(ax, ay, 30, 22, k.lean + 0.5, 0, Math.PI * 2); g.fill(); }
  const shL = T(-46, Lt - 22), shR = T(46, Lt - 22), wL = T(-44, 30), wR = T(44, 30);
  const hemL = H(-58, -42, 1), hemC = H(-2, -48 + fl, 1.2), hemR = H(55, -40, 0.8);
  const nL = T(-17, Lt + 3), nR = T(17, Lt + 3);
  g.fillStyle = P.coat;
  g.beginPath();
  g.moveTo(nL[0], nL[1]);
  g.quadraticCurveTo(...T(-42, Lt + 2), ...shL);
  g.quadraticCurveTo(...T(-50, 70), ...wL);
  g.quadraticCurveTo(...T(-50, -10), ...hemL);
  g.quadraticCurveTo(...hemC, ...hemR);
  g.quadraticCurveTo(...T(48, -10), ...wR);
  g.quadraticCurveTo(...T(50, 70), ...shR);
  g.quadraticCurveTo(...T(42, Lt + 2), ...nR);
  g.quadraticCurveTo(...T(0, Lt - 8), nL[0], nL[1]);
  g.fill();
  g.fillStyle = P.coatSh;                                   // the far side, away from the light (upper right)
  g.beginPath();
  g.moveTo(...T(-20, Lt));
  g.quadraticCurveTo(...T(-42, Lt + 2), ...shL);
  g.quadraticCurveTo(...T(-50, 70), ...wL);
  g.quadraticCurveTo(...T(-50, -10), ...hemL);
  g.quadraticCurveTo(...H(-36, -46, 1), ...H(-24, -46, 1.1));
  g.quadraticCurveTo(...T(-32, 30), ...T(-30, 90));
  g.quadraticCurveTo(...T(-28, Lt - 20), ...T(-20, Lt));
  g.fill();
  g.strokeStyle = P.coatLine; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(...T(2, Lt - 6)); g.quadraticCurveTo(...T(3, 20), ...H(2, -46 + fl * 0.5, 1.15)); g.stroke();
  g.lineWidth = 3.4;
  for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(...T(sx * 16, 12)); g.lineTo(...T(sx * 36, 10)); g.stroke(); }
  g.fillStyle = P.coatLine;
  for (const b of [Lt - 34, Lt - 74, 48]) { const [x, y] = T(9, b); g.beginPath(); g.roundRect(x - 4, y - 7, 8, 14, 4); g.fill(); }
  g.fillStyle = P.coatHi;
  { const [x, y] = T(30, Lt - 30); g.beginPath(); g.ellipse(x, y, 9, 22, k.lean - 0.25, 0, Math.PI * 2); g.fill(); }

  // arms: upper angle from hanging straight down (outward +), elbow bend (up/in +)
  const arm = (side, a, bnd, col) => {
    const sh = side < 0 ? T(-40, Lt - 18) : T(40, Lt - 18);
    const base = -Math.PI / 2 + side * a - k.lean;
    const ex = sh[0] + 72 * Math.cos(base), ey = sh[1] + 72 * Math.sin(base);
    const b2 = base + side * bnd;
    const wx = ex + 66 * Math.cos(b2), wy = ey + 66 * Math.sin(b2);
    limb(g, [sh[0], sh[1], ex, ey, wx, wy], 28, col);
    g.fillStyle = P.coatLine;
    g.beginPath(); g.arc(wx, wy, 13.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = P.skin;
    const hx2 = wx + 13 * Math.cos(b2), hy2 = wy + 13 * Math.sin(b2);
    g.beginPath(); g.arc(hx2, hy2, 12.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = P.skinSh;
    g.beginPath(); g.arc(hx2, hy2, 12.5, Math.PI * 0.8, Math.PI * 1.6); g.lineTo(hx2, hy2); g.fill();
  };
  arm(-1, k.arms[0], k.arms[1], P.coatSh);
  arm(1, k.arms[2], k.arms[3], P.coat);

  // neck + head (profile; `look` slides the face across the round head to turn it)
  const nk = T(4, Lt - 6);
  g.fillStyle = P.skinSh;
  g.beginPath(); g.roundRect(nk[0] - 11, nk[1], 22, 26, 8); g.fill();
  const ha = -k.lean * 0.6 + k.tilt * k.look;
  const [hcx, hcy] = T(6, Lt + 50);
  g.save(); g.translate(hcx, hcy); g.rotate(ha);
  g.fillStyle = P.skin;
  g.beginPath(); g.arc(0, 0, 46, 0, Math.PI * 2); g.fill();
  if (Math.abs(k.look) < 0.6) drawFront(g, P, k);           // the turn passes through a front view
  else { g.scale(Math.sign(k.look), 1); drawProfile(g, P, k); }
  g.restore();
}

function mouthLine(g, P, m, x0, x1, y) {
  const set = clamp(m, 0, 1);
  if (m < 1.5) {
    g.strokeStyle = P.ink; g.lineWidth = 3.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y - 2 - (1 - set) * 3, x1, y + 1 + set); g.stroke();
  } else {
    const op = clamp(m - 1, 0, 1) * (m > 2 ? clamp(3 - m, 0.45, 1) : 1);
    g.fillStyle = P.ink;
    g.beginPath(); g.moveTo(x0, y + 5); g.quadraticCurveTo((x0 + x1) / 2 + 1, y + 4, x1, y + 7); g.quadraticCurveTo((x0 + x1) / 2 + 3, y + 5 - 13 * op, x0 + 1, y + 5 - 4 * op); g.closePath(); g.fill();
  }
}
function drawProfile(g, P, k) {
  g.fillStyle = P.skin;
  g.beginPath(); g.ellipse(42, -4, 9, 8, 0, 0, Math.PI * 2); g.fill();   // nose
  g.fillStyle = P.blush; g.globalAlpha *= 0.5;
  g.beginPath(); g.ellipse(22, -14, 9, 6, 0, 0, Math.PI * 2); g.fill();
  g.globalAlpha /= 0.5;
  const lift = k.hair;                                      // a cap of hair; the fringe lifts as he falls
  g.fillStyle = P.hair;
  g.beginPath();
  g.moveTo(40, 20 + lift * 0.4);
  g.bezierCurveTo(44, 46 + lift, 10, 62 + lift, -16, 56 + lift * 0.6);
  g.bezierCurveTo(-46, 50 + lift * 0.3, -60, 22, -54, -6);
  g.bezierCurveTo(-52, -24, -40, -36, -28, -38);
  g.bezierCurveTo(-30, -20, -24, -8, -10, 0);
  g.bezierCurveTo(-4, 12, 8, 20, 18, 22 + lift * 0.2);
  g.bezierCurveTo(26, 30 + lift * 0.4, 34, 22, 40, 20 + lift * 0.4);
  g.fill();
  g.fillStyle = P.hairHi;
  g.beginPath(); g.ellipse(-10, 40 + lift * 0.5, 16, 5, -0.25, 0, Math.PI * 2); g.fill();
  g.fillStyle = P.skin; g.beginPath(); g.ellipse(-8, 0, 9, 11, 0, 0, Math.PI * 2); g.fill();   // ear
  g.fillStyle = P.skinSh; g.beginPath(); g.ellipse(-7, 0, 4.5, 6.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = P.ink;                                      // eye, brow, mouth
  g.beginPath(); g.ellipse(24, 6, 4.6, 6.2, 0, 0, Math.PI * 2); g.fill();
  const set = clamp(k.mouth, 0, 1);
  g.strokeStyle = P.ink; g.lineCap = 'round'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(15, 19 - set * 2); g.lineTo(32, 20 - set * 4); g.stroke();
  mouthLine(g, P, k.mouth, 26, 38, -20);
}
function drawFront(g, P, k) {
  for (const sx of [-1, 1]) {                               // ears, blush
    g.fillStyle = P.skin; g.beginPath(); g.ellipse(sx * 45, -2, 8, 11, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = P.blush; g.globalAlpha *= 0.5; g.beginPath(); g.ellipse(sx * 25, -14, 8, 5.5, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha /= 0.5;
  }
  g.fillStyle = P.hair;                                     // bowl cap with a fringe
  g.beginPath();
  g.moveTo(-50, 4);
  g.bezierCurveTo(-56, 48, -24, 62, 0, 62);
  g.bezierCurveTo(24, 62, 56, 48, 50, 4);
  g.bezierCurveTo(44, 14, 34, 22, 22, 20);
  g.bezierCurveTo(12, 28, -8, 28, -16, 22);
  g.bezierCurveTo(-30, 24, -44, 16, -50, 4);
  g.fill();
  g.fillStyle = P.hairHi;
  g.beginPath(); g.ellipse(-14, 46, 15, 5, 0.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = P.ink;
  for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * 15, 4, 4.4, 6, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = P.skinSh; g.beginPath(); g.ellipse(0, -6, 4, 3, 0, 0, Math.PI * 2); g.fill();
  mouthLine(g, P, k.mouth, -8, 8, -20);
}
