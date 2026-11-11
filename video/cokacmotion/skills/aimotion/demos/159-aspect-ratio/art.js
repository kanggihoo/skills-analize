/*
 * art.js — the three painted worlds and the two characters of 159.
 *
 *   paintA  the train window before dawn (a child in profile, the land sliding by in parallax)
 *   paintB  the same small station in a remembered summer (grandmother waving, the train leaving)
 *   paintC  the same station on a spring morning (the train arrives, the doors open, a huge sky above)
 *
 * Every painter draws in WORLD coordinates through L(d, ex, ey), a function the caller builds from the solved camera:
 * it sets the canvas transform for a layer at parallax depth d (1 = the subject's plane, < 1 = farther away) plus an
 * optional screen offset. For each shot, world = screen at that shot's reference camera. The painters always paint
 * the whole 9:16 view (and more): the frame's mattes only hide, they never decide what exists. No clock is read here.
 */
import { clamp, lerp, smooth, ease, rand } from '../_lib/stage.js';

const TAU = Math.PI * 2;

// colour tokens: night navy, morning blues, warm paper whites; ONE accent — the grandmother's mustard scarf
export const C = {
  matte: '#0a0f1a',
  scarf: '#e2a52b', scarfSh: '#c08617',
  skin: '#f1c8a7', skinSh: '#deaa88', blush: 'rgba(232,140,122,0.42)',
  hairK: '#272c3b', hairG: '#dde1e8', hairGSh: '#b8bfcc',
  card: '#7586ad', cardSh: '#62729a', blouse: '#ece7de', skirt: '#3b4767', legs: '#4a5574', shoe: '#283042',
  jacket: '#f0eadf', jacketSh: '#d6cdbd', pants: '#2c3a59', bag: '#3e679b', bagSh: '#2f5384',
  ink: '#262b3b',
};

// ---------------------------------------------------------------- small helpers
const circ = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
const ell = (g, x, y, rx, ry, a = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, TAU); g.fill(); };
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
function line(g, pts, w, col) {
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.stroke();
}
function vgrad(g, stops) {          // [[y, colour], …] in the current (world) space
  const gr = g.createLinearGradient(0, stops[0][0], 0, stops[stops.length - 1][0]);
  const y0 = stops[0][0], y1 = stops[stops.length - 1][0];
  for (const [y, c] of stops) gr.addColorStop((y - y0) / (y1 - y0), c);
  return gr;
}
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export function mix(a, b, k) {
  const A = hex(a), B = hex(b);
  return `rgb(${Math.round(lerp(A[0], B[0], k))},${Math.round(lerp(A[1], B[1], k))},${Math.round(lerp(A[2], B[2], k))})`;
}
const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

/** a flat rounded cloud: a row of circles on a flat base, a soft blue underside */
function cloud(g, x, y, s, top = '#f5f7fa', under = '#d6e2ef') {
  const bumps = [[-70, 0, 34], [-30, -22, 46], [18, -30, 52], [62, -10, 38], [92, 4, 26]];
  g.fillStyle = under;
  g.beginPath();
  for (const [bx, by, r] of bumps) { g.moveTo(x + (bx + r) * s, y + (by + 8) * s); g.arc(x + bx * s, y + (by + 8) * s, r * s, 0, TAU); }
  g.fill();
  g.fillStyle = top;
  g.beginPath();
  for (const [bx, by, r] of bumps) { g.moveTo(x + (bx + r) * s, y + by * s); g.arc(x + bx * s, y + by * s, r * s, 0, TAU); }
  g.fill();
  g.fillStyle = under;
  rr(g, x - 104 * s, y + 18 * s, 222 * s, 16 * s, 8 * s);
}

/** catenary-ish sag between two points (parabola: y = linear + sag·4u(1−u)) */
const sagY = (x, xa, ya, xb, yb, sag) => { const u = (x - xa) / (xb - xa); return ya + (yb - ya) * u + sag * 4 * u * (1 - u); };

function ribbon(g, x, y, ang, len, w0, w1, t, amp, freq, speed, ph, col) {
  const N = 12, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N, along = s * len;
    const off = amp * s * Math.sin(freq * s * TAU - speed * t + ph);
    const dx = Math.cos(ang), dy = Math.sin(ang);
    const px = x + dx * along - dy * off, py = y + dy * along + dx * off;
    const w = lerp(w0, w1, s) / 2;
    L.push([px - dy * w, py + dx * w]); R.push([px + dy * w, py - dx * w]);
  }
  g.fillStyle = col; g.beginPath(); g.moveTo(L[0][0], L[0][1]);
  for (const p of L) g.lineTo(p[0], p[1]);
  for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]);
  g.fill();
}

// ---------------------------------------------------------------- birds
function birdPerched(g, x, y, s, look) {
  g.fillStyle = '#2b3550';
  ell(g, x, y - 7 * s, 9 * s, 6.5 * s, -0.2);
  circ(g, x + 6 * look * s, y - 14 * s, 4.6 * s);
  g.beginPath(); g.moveTo(x - 7 * look * s, y - 6 * s); g.lineTo(x - 17 * look * s, y - 1 * s); g.lineTo(x - 8 * look * s, y - 2 * s); g.fill();
  g.fillStyle = '#3d4968'; ell(g, x - 2 * look * s, y - 8 * s, 5 * s, 3.5 * s, -0.3);
}
function birdFlying(g, x, y, s, flap, dir) {
  const up = Math.sin(flap);
  g.fillStyle = '#2b3550'; g.strokeStyle = '#2b3550'; g.lineCap = 'round'; g.lineJoin = 'round';
  ell(g, x, y, 8 * s, 4.5 * s, 0.15 * dir);
  circ(g, x + 7 * dir * s, y - 2 * s, 3.6 * s);
  g.lineWidth = 3.4 * s;
  g.beginPath();
  g.moveTo(x - 1 * s, y - 1 * s); g.quadraticCurveTo(x - 9 * s, y - 13 * up * s - 4 * s, x - 20 * s, y - 16 * up * s);
  g.moveTo(x + 1 * s, y - 1 * s); g.quadraticCurveTo(x + 7 * s, y - 13 * up * s - 4 * s, x + 17 * s, y - 15 * up * s);
  g.stroke();
}

// ---------------------------------------------------------------- the grandmother (feet at 0, facing left)
const GP = {
  rest: { f: [-34, -170, -16, -136], b: [30, -172, -2, -138] },
  wave: { f: [-60, -236, -68, -290], b: [30, -172, -2, -138] },
  open: { f: [-72, -194, -110, -220], b: [-10, -198, -64, -232] },
  hug:  { f: [-62, -170, -36, -146], b: [-30, -196, -62, -168] },
};
const lerpA = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
function granArm(g, sx, sy, A, col, wave, t) {
  let [ex, ey, hx, hy] = A;
  if (wave > 0) {                                  // the forearm swings about the elbow
    const [rx, ry] = rot(hx - ex, hy - ey, wave * 0.42 * Math.sin(TAU * 2.2 * t));
    hx = ex + rx; hy = ey + ry;
  }
  line(g, [sx, sy, ex, ey, hx, hy], 16, col);
  g.fillStyle = C.skin; circ(g, hx, hy, 8);
}
/**
 * st: { wave, open, hug (0..1 pose weights), bend (lean toward the child), sway, happy (closed eyes), wind }
 * between(): draws what stands between her body and her front arm (the child in the hug), in world space
 */
export function grandma(g, x, y, k, st, t, between) {
  const world = g.getTransform();
  g.translate(x, y); g.scale(k, k);
  let f = GP.rest.f, b = GP.rest.b;
  f = lerpA(f, GP.wave.f, st.wave || 0);
  f = lerpA(f, GP.open.f, st.open || 0); b = lerpA(b, GP.open.b, st.open || 0);
  f = lerpA(f, GP.hug.f, st.hug || 0); b = lerpA(b, GP.hug.b, st.hug || 0);
  const wind = st.wind ?? 1;

  // long morning shadow (sun from the upper right)
  g.fillStyle = 'rgba(28,38,66,0.20)'; ell(g, -40, 0, 64, 8.5);
  // legs, shoes, skirt
  line(g, [-12, -62, -15, -10], 13, C.legs); line(g, [8, -62, 6, -10], 13, C.legs);
  g.fillStyle = C.shoe; ell(g, -24, -6, 15, 7); ell(g, -2, -6, 15, 7);
  g.fillStyle = C.skirt;
  g.beginPath(); g.moveTo(-36, -128); g.lineTo(36, -128); g.lineTo(46, -62); g.quadraticCurveTo(47, -54, 38, -54);
  g.lineTo(-40, -54); g.quadraticCurveTo(-49, -54, -48, -62); g.closePath(); g.fill();

  // upper body leans about the hip
  g.translate(0, -118); g.rotate(-(st.bend || 0) * 0.3 + (st.sway || 0)); g.translate(0, 118);
  granArm(g, 26, -214, b, C.cardSh, 0, t);
  // cardigan
  g.save();
  g.beginPath();
  g.moveTo(-28, -228); g.quadraticCurveTo(-42, -226, -43, -206);
  g.lineTo(-53, -114); g.quadraticCurveTo(-53, -104, -44, -104);
  g.lineTo(46, -104); g.quadraticCurveTo(55, -104, 53, -114);
  g.lineTo(41, -206); g.quadraticCurveTo(39, -226, 26, -228); g.closePath();
  g.fillStyle = C.card; g.fill(); g.clip();
  g.fillStyle = C.cardSh; g.fillRect(16, -240, 50, 140);
  g.fillStyle = C.blouse; g.beginPath(); g.moveTo(-20, -230); g.lineTo(-2, -230); g.lineTo(-13, -150); g.fill();
  g.strokeStyle = 'rgba(40,52,84,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-13, -150); g.lineTo(-17, -104); g.stroke();
  g.fillStyle = '#e8ecf3'; circ(g, -15, -186, 3); circ(g, -16, -164, 3); circ(g, -17, -142, 3);
  g.strokeStyle = 'rgba(40,52,84,0.3)'; g.beginPath(); g.moveTo(-42, -132); g.lineTo(-24, -132); g.moveTo(14, -132); g.lineTo(32, -132); g.stroke();
  g.restore();
  // scarf: the tail blown back, the wrap, the knot, the hanging tail
  ribbon(g, -10, -224, 0.32, 66, 15, 10, t, 7 * wind, 1.1, 9, 0.5, C.scarfSh);
  g.fillStyle = C.scarf; ell(g, -4, -229, 30, 11);
  g.fillStyle = C.scarfSh; ell(g, -4, -224, 28, 5);
  ribbon(g, -20, -222, 1.78, 48, 15, 11, t, 4 * wind, 0.8, 7, 2.1, C.scarf);
  g.fillStyle = C.scarf; circ(g, -20, -223, 9);
  // head
  g.fillStyle = C.skinSh; rr(g, -9, -248, 15, 16, 5);
  g.fillStyle = C.hairGSh; circ(g, 17, -300, 15);
  g.fillStyle = C.hairG; circ(g, 4, -271, 32); circ(g, 15, -303, 12);
  g.fillStyle = C.skin; ell(g, 15, -261, 5, 7); circ(g, -6, -262, 28.5);
  g.fillStyle = C.hairG; ell(g, -10, -289, 27, 11, -0.12);
  g.fillStyle = C.hairGSh; ell(g, 6, -290, 12, 5, 0.3);
  g.fillStyle = C.blush; ell(g, -28, -253, 6, 4); ell(g, 1, -253, 6, 4);
  g.fillStyle = C.skinSh; ell(g, -29, -259, 3, 2.6);
  g.strokeStyle = C.ink; g.lineWidth = 2.4; g.lineCap = 'round';
  if ((st.happy || 0) > 0.5) {
    g.beginPath(); g.arc(-21, -264, 3.6, Math.PI * 1.1, Math.PI * 1.9); g.moveTo(-1.5, -264); g.arc(-5, -264, 3.6, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  } else { g.fillStyle = C.ink; circ(g, -21, -265, 2.7); circ(g, -5, -265, 2.7); }
  g.strokeStyle = '#4b5470'; g.lineWidth = 1.8;
  g.beginPath(); g.arc(-21, -265, 7.5, 0, TAU); g.moveTo(2.5, -265); g.arc(-5, -265, 7.5, 0, TAU);
  g.moveTo(-13.5, -266); g.lineTo(-12.5, -266); g.moveTo(2.5, -266); g.lineTo(13, -268); g.stroke();
  g.strokeStyle = '#a2564a'; g.lineWidth = 2.2;
  g.beginPath(); g.arc(-15, -253, 5, Math.PI * 0.18, Math.PI * 0.82); g.stroke();

  if (between) { const mine = g.getTransform(); g.setTransform(world); between(); g.setTransform(mine); }
  granArm(g, -26, -214, f, C.card, st.wave || 0, t);
  g.setTransform(world);
}

// ---------------------------------------------------------------- the child (feet at 0, facing right)
/** st: { run (0..1), ph (run phase, rad), hug (0..1), happy, lean } */
export function kid(g, x, y, k, st, t) {
  const world = g.getTransform();
  g.translate(x, y); g.scale(k, k);
  const run = st.run || 0, ph = st.ph || 0, hug = st.hug || 0;
  const bob = -5 * run * Math.abs(Math.cos(ph));
  g.fillStyle = 'rgba(28,38,66,0.20)'; ell(g, -30, 0, 44, 7);
  g.translate(0, bob);

  // legs: thigh swings ±0.6 rad, the knee folds on the recovery half
  const legs = [];
  for (let i = 0; i < 2; i++) {
    const a = Math.sin(ph + i * Math.PI) * run;
    const th = 0.62 * a + (i ? 0.05 : -0.05) * (1 - run);
    const bend = run * (0.15 + 1.05 * Math.max(0, Math.cos(ph + i * Math.PI)));
    const hx = i ? 6 : -6, hy = -76;
    const kx = hx + 37 * Math.sin(th), ky = hy + 37 * Math.cos(th);
    const fx = kx + 37 * Math.sin(th - bend), fy = Math.min(ky + 37 * Math.cos(th - bend), -bob - 5);
    legs.push([hx, hy, kx, ky, fx, fy]);
  }
  for (const i of [1, 0]) {
    const [hx, hy, kx, ky, fx, fy] = legs[i];
    line(g, [hx, hy, kx, ky, fx, fy], 15, i ? '#25324f' : C.pants);
    g.fillStyle = '#f4f6f9'; ell(g, fx + 5, fy + 1, 10.5, 6);
    g.fillStyle = '#b9c2cf'; rr(g, fx - 5, fy + 4, 21, 3, 1.5);
  }
  // lean (run forward, hug toward her)
  g.translate(0, -76); g.rotate(0.12 * run + 0.16 * hug + (st.lean || 0)); g.translate(0, 76);
  // back arm, backpack
  const sw = Math.sin(ph) * run;
  if (hug < 0.5) {                                 // the back arm swings opposite the front one (hidden in the hug)
    const a = -0.9 * sw, ex = -4 + 25 * Math.sin(a), ey = -136 + 25 * Math.cos(a);
    const hx = ex + 21 * Math.sin(a + 1.2), hy = ey + 21 * Math.cos(a + 1.2);
    line(g, [-4, -136, ex, ey, hx, hy], 12, C.jacketSh); g.fillStyle = C.skinSh; circ(g, hx, hy, 6);
  }
  g.fillStyle = C.bag; rr(g, -38, -150, 25, 58, 9);
  g.fillStyle = C.bagSh; rr(g, -38, -118, 25, 6, 3);
  // jacket
  g.save();
  g.beginPath();
  g.moveTo(-15, -153); g.quadraticCurveTo(-26, -150, -24, -128); g.lineTo(-24, -82); g.quadraticCurveTo(-24, -72, -14, -72);
  g.lineTo(18, -72); g.quadraticCurveTo(27, -72, 26, -82); g.lineTo(23, -134); g.quadraticCurveTo(20, -153, 8, -153); g.closePath();
  g.fillStyle = C.jacket; g.fill(); g.clip();
  g.fillStyle = C.jacketSh; g.fillRect(-30, -160, 18, 90);
  g.strokeStyle = 'rgba(120,108,90,0.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(11, -150); g.lineTo(13, -74); g.stroke();
  g.restore();
  g.fillStyle = C.jacketSh; circ(g, -15, -152, 9);
  line(g, [-10, -150, -3, -102], 5, C.bagSh);
  // head
  g.fillStyle = C.hairK; circ(g, -3, -180, 29); rr(g, -31, -184, 30, 30, 10);
  g.fillStyle = C.skin; circ(g, 5, -176, 25);
  g.fillStyle = C.hairK;
  g.beginPath(); g.moveTo(-24, -186); g.quadraticCurveTo(-14, -212, 10, -208); g.quadraticCurveTo(28, -205, 31, -186);
  g.lineTo(24, -190); g.lineTo(19, -184); g.lineTo(14, -191); g.lineTo(6, -186); g.lineTo(0, -192); g.lineTo(-8, -188); g.closePath(); g.fill();
  g.fillStyle = C.blush; ell(g, 10, -166, 5.5, 3.6); ell(g, 28, -166, 4.5, 3.4);
  g.strokeStyle = C.ink; g.fillStyle = C.ink; g.lineWidth = 2.4; g.lineCap = 'round';
  if ((st.happy || 0) > 0.5) {
    g.beginPath(); g.arc(14, -174, 3.4, Math.PI * 1.1, Math.PI * 1.9); g.moveTo(29.4, -174); g.arc(26, -174, 3.4, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  } else { circ(g, 14, -176, 2.7); circ(g, 26, -176, 2.7); }
  g.strokeStyle = '#a2564a'; g.lineWidth = 2.2;
  g.beginPath(); g.arc(21, -166, 4, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
  // front arm: swings while running, reaches around her in the hug
  let ex, ey, hx, hy;
  {
    const a = 0.9 * sw;
    const rx = 6 + 25 * Math.sin(a), ry = -136 + 25 * Math.cos(a);
    const rhx = rx + 21 * Math.sin(a + 1.2), rhy = ry + 21 * Math.cos(a + 1.2);
    ex = lerp(rx, 30, hug); ey = lerp(ry, -126, hug); hx = lerp(rhx, 50, hug); hy = lerp(rhy, -138, hug);
  }
  line(g, [6, -136, ex, ey, hx, hy], 12, C.jacket);
  g.fillStyle = C.skin; circ(g, hx, hy, 6);
  g.setTransform(world);
}

/** the child in profile at the train window (head centre at 0,0, facing right) */
export function kidProfile(g, x, y, k, t) {
  const world = g.getTransform();
  g.translate(x, y); g.scale(k, k);
  // torso in a cream jacket, lit from the window on the right; the hood bunched behind the neck
  const jg = g.createLinearGradient(-110, 0, 90, 0);
  jg.addColorStop(0, '#6c6b74'); jg.addColorStop(0.55, '#b9b2a6'); jg.addColorStop(1, '#ddd5c6');
  g.fillStyle = jg;
  g.beginPath(); g.moveTo(-22, 60); g.quadraticCurveTo(-92, 80, -104, 200); g.lineTo(-112, 400); g.lineTo(76, 400);
  g.lineTo(66, 210); g.quadraticCurveTo(58, 104, 22, 70); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(80,72,64,0.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(44, 120); g.lineTo(58, 400); g.stroke();
  g.fillStyle = '#6f6d70'; ell(g, -46, 70, 26, 18, -0.5);
  g.fillStyle = '#827f7c'; ell(g, -40, 64, 18, 11, -0.5);
  // hair (back of the bob)
  g.fillStyle = C.hairK;
  g.beginPath(); g.arc(-10, -8, 88, Math.PI * 0.62, Math.PI * 2.02); g.lineTo(-30, 64); g.quadraticCurveTo(-60, 82, -88, 62); g.closePath(); g.fill();
  // face in profile
  const fg = g.createLinearGradient(-20, 0, 96, 0);
  fg.addColorStop(0, '#d9a787'); fg.addColorStop(1, '#f6d4b8');
  g.fillStyle = fg;
  g.beginPath();
  g.moveTo(2, -78); g.quadraticCurveTo(64, -76, 76, -26); g.quadraticCurveTo(80, -10, 90, 6); g.quadraticCurveTo(95, 16, 82, 22);
  g.quadraticCurveTo(84, 30, 80, 36); g.quadraticCurveTo(82, 46, 72, 52); g.quadraticCurveTo(60, 74, 30, 76);
  g.quadraticCurveTo(-2, 76, -12, 40); g.lineTo(-14, -30); g.closePath(); g.fill();
  // window light on the profile
  g.strokeStyle = 'rgba(220,232,255,0.35)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(66, -50); g.quadraticCurveTo(80, -10, 90, 6); g.quadraticCurveTo(95, 16, 82, 22); g.stroke();
  // fringe
  g.fillStyle = C.hairK;
  g.beginPath(); g.moveTo(-60, -40); g.quadraticCurveTo(-50, -98, 10, -96); g.quadraticCurveTo(66, -94, 78, -34);
  g.lineTo(68, -28); g.lineTo(62, -38); g.lineTo(52, -26); g.lineTo(40, -40); g.lineTo(28, -30); g.lineTo(10, -48);
  g.quadraticCurveTo(-20, -40, -30, 6); g.lineTo(-58, 10); g.closePath(); g.fill();
  g.fillStyle = 'rgba(150,170,210,0.12)'; ell(g, 14, -80, 34, 7, -0.1);
  // ear peeking under the bob
  g.fillStyle = '#d29f80'; ell(g, -8, 14, 9, 13);
  // eye (blinks once), lashes, brow
  const blink = 1 - 0.92 * Math.exp(-(((t - 1.32) / 0.06) ** 2));
  g.fillStyle = C.ink; ell(g, 58, -4, 4.6, 6.4 * blink);
  g.strokeStyle = C.ink; g.lineWidth = 2.4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(54, -10 * blink - 1); g.lineTo(64, -12 * blink - 2); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.8)'; circ(g, 60, -6, 1.5);
  g.fillStyle = C.blush; ell(g, 46, 26, 14, 8);
  g.strokeStyle = '#a2564a'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(74, 40); g.quadraticCurveTo(78, 42, 80, 40); g.stroke();
  // the near arm: upper arm forward to the elbow on the sill, forearm straight up, fist under the chin
  line(g, [6, 128, 58, 206], 40, '#c4bcae');
  line(g, [58, 206, 70, 114], 36, '#d9d2c4');
  g.fillStyle = '#bfb7a8'; ell(g, 70, 122, 20, 8, -0.1);
  g.fillStyle = '#efc6a5'; ell(g, 68, 90, 22, 19, -0.3);
  g.fillStyle = '#dcae8e'; ell(g, 78, 96, 9, 6, -0.4);
  g.setTransform(world);
}

/** the little child at a train window in the memory: head, shoulders, a waving hand */
function kidSmall(g, x, y, k, t) {
  const world = g.getTransform();
  g.translate(x, y); g.scale(k, k);
  g.fillStyle = '#f7f5f0'; rr(g, -30, 18, 60, 50, 22);
  g.fillStyle = C.hairK; circ(g, 0, -4, 25); rr(g, -26, -4, 52, 22, 8);
  g.fillStyle = C.skin; circ(g, 2, 0, 21);
  g.fillStyle = C.hairK; g.beginPath(); g.moveTo(-22, -6); g.quadraticCurveTo(-8, -32, 16, -26); g.quadraticCurveTo(26, -20, 24, -8);
  g.lineTo(12, -12); g.lineTo(4, -6); g.lineTo(-6, -12); g.closePath(); g.fill();
  g.fillStyle = C.ink; circ(g, -6, 1, 2.4); circ(g, 9, 1, 2.4);
  g.fillStyle = C.blush; ell(g, -10, 9, 5, 3); ell(g, 13, 9, 5, 3);
  g.strokeStyle = '#a2564a'; g.lineWidth = 2; g.beginPath(); g.arc(2, 8, 5, 0.2, Math.PI - 0.2); g.stroke();
  const a = -0.5 + 0.45 * Math.sin(TAU * 2.4 * t);
  const [hx, hy] = rot(0, -40, a);
  line(g, [26, 30, 34 + hx * 0.5, 30 + hy * 0.5, 34 + hx, 30 + hy], 11, '#f7f5f0');
  g.fillStyle = C.skin; circ(g, 34 + hx, 30 + hy, 7.5);
  g.setTransform(world);
}

// ---------------------------------------------------------------- the station sign (baked, it carries text)
export function bakeSign(mk, font) {
  const S = 2, w = 172, h = 78;
  const { c, g } = mk(w * S, h * S);
  g.scale(S, S);
  g.fillStyle = '#f7f8fa'; rr(g, 0, 0, w, h, 10);
  g.fillStyle = '#3e5f95'; g.beginPath(); g.roundRect(0, 0, w, 14, [10, 10, 0, 0]); g.fill();
  g.fillStyle = '#27324a'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = `800 30px ${font}`; g.fillText('꽃마을', w / 2, 50);
  g.font = `600 12px ${font}`; g.fillStyle = '#5c6880';
  g.textAlign = 'left'; g.fillText('← 솔밭', 10, 70); g.textAlign = 'right'; g.fillText('은빛내 →', w - 10, 70);
  return { c, w, h };
}
function sign(g, SIGN, x, yBase, k = 1) {
  g.fillStyle = '#5d6a84'; g.fillRect(x - 64 * k, yBase - 200 * k, 7 * k, 200 * k); g.fillRect(x + 57 * k, yBase - 200 * k, 7 * k, 200 * k);
  g.drawImage(SIGN.c, x - (SIGN.w / 2) * k, yBase - 250 * k, SIGN.w * k, SIGN.h * k);
}

// ---------------------------------------------------------------- the blossom tree / the summer tree
const CROWN = (() => {
  const r = rand(1590), out = [];
  for (let i = 0; i < 26; i++) {
    const a = r() * TAU, d = Math.sqrt(r()) * 1;
    out.push({ x: Math.cos(a) * d * 175, y: Math.sin(a) * d * 150 - 10, r: 42 + 46 * r(), s: r() });
  }
  out.sort((p, q) => p.y - q.y);
  return out;
})();
function tree(g, x, yBase, k, summer, t) {
  g.fillStyle = summer ? '#5d5a63' : '#5a5e71';
  g.beginPath(); g.moveTo(x - 14 * k, yBase); g.lineTo(x - 8 * k, yBase - 230 * k); g.lineTo(x + 8 * k, yBase - 230 * k); g.lineTo(x + 14 * k, yBase); g.fill();
  line(g, [x, yBase - 170 * k, x - 70 * k, yBase - 260 * k], 12 * k, summer ? '#5d5a63' : '#5a5e71');
  line(g, [x, yBase - 190 * k, x + 80 * k, yBase - 280 * k], 11 * k, summer ? '#5d5a63' : '#5a5e71');
  const cy = yBase - 380 * k, sway = 3 * Math.sin(t * 1.3);
  const cols = summer ? ['#4f8a55', '#64a063', '#7cb673'] : ['#dccbd3', '#ece0e6', '#f9f3f5'];
  for (let layer = 0; layer < 3; layer++) {
    g.fillStyle = cols[layer];
    g.beginPath();
    for (const p of CROWN) {
      const px = x + (p.x + sway * (p.y < 0 ? 1 : 0.5)) * k - layer * 6 * k, py = cy + p.y * k - layer * 10 * k, pr = p.r * k * (1 - layer * 0.2);
      g.moveTo(px + pr, py); g.arc(px, py, pr, 0, TAU);
    }
    g.fill();
  }
  if (!summer) {
    g.fillStyle = '#fffafc';
    for (const p of CROWN) if (p.s > 0.45) circ(g, x + (p.x + sway) * k - 20 * k, cy + p.y * k - 22 * k, 6 * k);
  }
}

// ================================================================ shot A — the train window before dawn
const WIN = { x: 336, y: 762, w: 900, h: 372, r: 46 };
function farProfile(x) { const u = (x / 1600) * TAU; return 980 - 46 * (0.6 * Math.sin(2 * u + 0.4) + 0.3 * Math.sin(5 * u + 1.9) + 0.14 * Math.sin(11 * u + 0.7)); }
function midProfile(x) { const u = (x / 1300) * TAU; return 1042 - 24 * (0.6 * Math.sin(3 * u + 2.2) + 0.35 * Math.sin(7 * u + 0.3)); }
const NEAR = (() => { const r = rand(77), a = []; for (let i = 0; i < 9; i++) a.push({ x: (i / 9) * 1100 + r() * 70, r: 32 + 26 * r(), h: 1092 - 20 * r() }); return a; })();
const LIGHTS = (() => { const r = rand(78), a = []; for (let i = 0; i < 11; i++) a.push({ x: r() * 1300, dy: 4 + 16 * r(), a: 0.6 + 0.4 * r() }); return a; })();
const STARS = (() => { const r = rand(79), a = []; for (let i = 0; i < 22; i++) a.push({ x: 360 + r() * 820, y: 780 + r() * 150, r: 0.8 + 1.4 * r(), p: r() * TAU }); return a; })();

export function paintA(g, t, L) {
  const dawn = smooth(t / 2.8);
  // the train rocks (a slow sway plus a knock at every rail joint); the land outside does not
  const jt = (t + 0.2) % 0.56;
  const rock = 1.4 * Math.sin(TAU * 1.7 * t) + 2.6 * Math.exp(-(((jt - 0.04) / 0.035) ** 2)) - 1.4 * Math.exp(-(((jt - 0.12) / 0.05) ** 2));

  L(1, 0, rock);
  g.fillStyle = vgrad(g, [[-200, '#121a2e'], [700, '#1a2440'], [1300, '#1b2541'], [2200, '#111827']]);
  g.fillRect(-300, -300, 1700, 2600);
  // ceiling, luggage rack, hanging straps (only the taller frames ever see them)
  g.fillStyle = '#26324f'; g.fillRect(-300, 640, 1700, 14);
  g.fillStyle = '#2f3c5c'; for (let x = -280; x < 1400; x += 34) g.fillRect(x, 600, 4, 44);
  g.fillStyle = '#34425f'; g.fillRect(-300, 596, 1700, 8);
  for (const [sx, ph] of [[560, 0], [860, 1.3], [1160, 2.1]]) {
    const a = 0.08 * Math.sin(TAU * 0.9 * t + ph);
    const [dx, dy] = rot(0, 110, a);
    line(g, [sx, 520, sx + dx, 520 + dy], 6, '#3a4868');
    g.strokeStyle = '#4a5878'; g.lineWidth = 6; g.beginPath(); g.arc(sx + dx * 1.18, 520 + dy * 1.18, 16, 0, TAU); g.stroke();
  }
  // window frame
  g.fillStyle = '#34415f'; rr(g, WIN.x - 22, WIN.y - 22, WIN.w + 44, WIN.h + 44, WIN.r + 16);

  // ---- outside, clipped to the glass (the clip moves with the carriage, the land does not)
  g.save();
  g.beginPath(); g.roundRect(WIN.x, WIN.y, WIN.w, WIN.h, WIN.r); g.clip();
  L(0.15);
  g.fillStyle = vgrad(g, [[740, mix('#121d3c', '#1e3366', dawn)], [880, mix('#22386a', '#3f5f98', dawn)], [960, mix('#4d5f93', '#8296c4', dawn)],
    [1010, mix('#8a8fb0', '#c7c3d0', dawn)], [1140, '#2a3a62']]);
  g.fillRect(200, 700, 1200, 500);
  const glow = g.createRadialGradient(1060, 1010, 0, 1060, 1010, 420);
  glow.addColorStop(0, `rgba(236,226,222,${0.18 + 0.32 * dawn})`); glow.addColorStop(1, 'rgba(236,226,222,0)');
  g.fillStyle = glow; g.fillRect(200, 700, 1200, 500);
  for (const s of STARS) { g.fillStyle = `rgba(236,240,250,${(1 - dawn) * (0.55 + 0.35 * Math.sin(t * 3 + s.p))})`; circ(g, s.x, s.y, s.r); }
  // a thin moon
  g.save(); g.beginPath(); g.arc(1000, 830, 15, 0, TAU); g.clip();
  g.fillStyle = 'rgba(238,242,250,0.9)';
  g.beginPath(); g.rect(980, 810, 40, 40); g.moveTo(1021, 825); g.arc(1007, 825, 14, 0, TAU); g.fill('evenodd');
  g.restore();
  // far mountains (22 px/s), mid hills with lit windows (130 px/s), near trees (560 px/s)
  const lay = (prof, speed, tw, col, base) => {
    const off = -((speed * t) % tw);
    g.fillStyle = col; g.beginPath(); g.moveTo(200, base);
    for (let x = 200; x <= 1400; x += 12) g.lineTo(x, prof(x - off));
    g.lineTo(1400, base); g.fill();
  };
  lay(farProfile, 22, 1600, mix('#2e4170', '#3c5384', dawn), 1200);
  lay(midProfile, 130, 1300, mix('#1f2d52', '#2a3c66', dawn), 1200);
  {
    const off = -((130 * t) % 1300);
    for (const l of LIGHTS) for (const k of [0, 1]) {
      const x = l.x + off + k * 1300;
      if (x < 300 || x > 1260) continue;
      const y = midProfile(l.x) + l.dy;
      g.fillStyle = '#26365e'; rr(g, x - 13, y - 9, 26, 20, 3);
      g.fillStyle = `rgba(244,236,214,${l.a})`; g.fillRect(x - 4, y - 3, 8, 7);
    }
  }
  {
    const off = -((560 * t) % 1100);
    g.fillStyle = mix('#141e3b', '#1a2749', dawn);
    g.beginPath();
    for (const n of NEAR) for (const k of [0, 1]) { const x = n.x + off + k * 1100; g.moveTo(x + n.r * 1.4, n.h); g.ellipse(x, n.h, n.r * 1.4, n.r, 0, 0, TAU); }
    g.rect(200, 1092, 1200, 120);
    g.fill();
  }
  // poles and the wires that dip and rise between them (1500 px/s; each pole smeared over a 1/60 s exposure)
  {
    const sp = 1500, gap = 760, off = -((sp * t + 300) % gap);
    const xs = [];
    for (let j = -1; j < 4; j++) xs.push(off + j * gap + 260);
    g.strokeStyle = 'rgba(14,20,38,0.85)'; g.lineWidth = 2.2;
    for (let j = 0; j < xs.length - 1; j++) {
      g.beginPath(); g.moveTo(xs[j], 846); g.quadraticCurveTo((xs[j] + xs[j + 1]) / 2, 846 + 120, xs[j + 1], 846); g.stroke();
      g.beginPath(); g.moveTo(xs[j], 872); g.quadraticCurveTo((xs[j] + xs[j + 1]) / 2, 872 + 110, xs[j + 1], 872); g.stroke();
    }
    const smear = sp / 60;
    for (const x of xs) {
      const pg = g.createLinearGradient(x - smear, 0, x + smear, 0);
      pg.addColorStop(0, 'rgba(12,18,34,0)'); pg.addColorStop(0.5, 'rgba(12,18,34,0.9)'); pg.addColorStop(1, 'rgba(12,18,34,0)');
      g.fillStyle = pg; g.fillRect(x - smear, 820, smear * 2, 400);
    }
  }
  // the glass: a cool tint, a soft diagonal sheen, and her breath on it
  L(1, 0, rock);
  g.fillStyle = 'rgba(30,44,80,0.16)'; g.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
  g.fillStyle = 'rgba(220,232,255,0.05)';
  g.beginPath(); g.moveTo(WIN.x + 420, WIN.y); g.lineTo(WIN.x + 560, WIN.y); g.lineTo(WIN.x + 380, WIN.y + WIN.h); g.lineTo(WIN.x + 240, WIN.y + WIN.h); g.fill();
  const br = 0.5 + 0.5 * Math.sin(TAU * 0.7 * t - 1);
  const fog = g.createRadialGradient(408, 924, 0, 408, 924, 46);
  fog.addColorStop(0, `rgba(225,232,246,${0.08 + 0.1 * br})`); fog.addColorStop(1, 'rgba(225,232,246,0)');
  g.fillStyle = fog; g.fillRect(340, 870, 140, 110);
  g.restore();

  // window rim, the ledge, the seat behind her
  L(1, 0, rock);
  g.strokeStyle = '#4c5a7a'; g.lineWidth = 4;
  g.beginPath(); g.roundRect(WIN.x - 2, WIN.y - 2, WIN.w + 4, WIN.h + 4, WIN.r + 2); g.stroke();
  g.fillStyle = '#4a5878'; g.fillRect(-300, 1134, 1700, 14);
  g.fillStyle = '#2e3a58'; g.fillRect(-300, 1148, 1700, 34);
  g.fillStyle = '#1d2741'; g.fillRect(-300, 1182, 1700, 900);
  g.fillStyle = '#2a3858'; rr(g, 40, 790, 200, 640, 40);
  g.fillStyle = '#33436a'; rr(g, 52, 800, 176, 120, 32);
  kidProfile(g, 293, 887 + rock * 0.6, 1.15, t);
}

// ================================================================ shot B — the remembered summer
export function paintB(g, t, L, SIGN) {
  L(0.4);
  g.fillStyle = vgrad(g, [[300, '#4583c8'], [640, '#78b0e2'], [880, '#c6e2f2'], [990, '#eaf4f4']]);
  g.fillRect(-500, -400, 2100, 1500);
  const sun = g.createRadialGradient(930, 640, 0, 930, 640, 460);
  sun.addColorStop(0, 'rgba(255,250,232,0.75)'); sun.addColorStop(1, 'rgba(255,250,232,0)');
  g.fillStyle = sun; g.fillRect(300, 100, 1200, 1000);
  cloud(g, 300 + 6 * t, 720, 1.7, '#fbfbfa', '#d8e3ee');
  cloud(g, 760 + 4 * t, 790, 0.8, '#fbfbfa', '#d8e3ee');
  L(0.6);
  g.fillStyle = '#88b2a6';
  g.beginPath(); g.moveTo(-300, 1040);
  for (let x = -300; x <= 1500; x += 20) g.lineTo(x, 958 - 26 * Math.sin(x / 210 + 1) - 12 * Math.sin(x / 90));
  g.lineTo(1500, 1040); g.fill();
  L(0.8);
  g.fillStyle = vgrad(g, [[980, '#a3c98e'], [1110, '#86b27b']]); g.fillRect(-300, 985, 1800, 140);
  tree(g, 985, 1090, 0.95, true, t);
  g.fillStyle = '#c9d6c6'; for (let x = 640; x < 1400; x += 56) g.fillRect(x, 1040, 5, 50);
  g.fillRect(620, 1050, 800, 4);
  L(0.9);
  g.fillStyle = '#5d6a84'; g.fillRect(1176, 610, 12, 500); g.fillRect(1120, 626, 120, 8);
  g.strokeStyle = '#4a5670'; g.lineWidth = 2.4;
  g.beginPath(); for (let x = -400; x <= 1180; x += 20) { const y = sagY(x, -400, 646, 1182, 630, 70); x === -400 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
  for (const bx of [880, 922, 1010]) birdPerched(g, bx, sagY(bx, -400, 646, 1182, 630, 70) + 1, 1.15, bx < 960 ? 1 : -1);

  L(1);
  // the track on the right of the leaving train
  g.fillStyle = '#a7a79f'; g.fillRect(-300, 1076, 1800, 32);
  g.fillStyle = '#7f8590'; g.fillRect(-300, 1082, 1800, 4); g.fillRect(-300, 1096, 1800, 4);
  // the train pulls away to the left with the small child at the last window
  const dt = Math.max(0, t - 2.2), xr = 610 - 0.5 * 120 * dt * dt;
  const TK = 1.08;
  drawTrain(g, xr, 690, TK, 0, t, null);
  // the last window (same geometry as drawTrain's): the small child behind the glass
  const wx = xr - 95 * TK, wy = 690 + 26 * TK + 58 * TK, ww = 144 * TK, wh = 132 * TK;
  g.save(); g.beginPath(); g.roundRect(wx - ww / 2, wy, ww, wh, 16 * TK); g.clip();
  g.fillStyle = '#3a4c6a'; g.fillRect(wx - ww / 2, wy, ww, wh);
  kidSmall(g, wx - 8, wy + 78, 1.15, t);
  g.fillStyle = 'rgba(210,228,250,0.14)'; g.beginPath(); g.moveTo(wx - 10, wy); g.lineTo(wx + 26, wy); g.lineTo(wx - 24, wy + wh); g.lineTo(wx - 60, wy + wh); g.fill();
  g.restore();
  // platform
  g.fillStyle = '#e3e1d8'; g.fillRect(-300, 1104, 1800, 8);
  g.fillStyle = '#8f98a6'; g.fillRect(-300, 1112, 1800, 18);
  g.fillStyle = vgrad(g, [[1130, '#c8cbc8'], [1700, '#a9b0b4'], [2300, '#99a1a8']]); g.fillRect(-300, 1130, 1800, 1300);
  g.strokeStyle = 'rgba(80,90,104,0.18)'; g.lineWidth = 2;
  for (let i = 1; i < 12; i++) { const y = 1130 + 26 * i ** 1.45; g.beginPath(); g.moveTo(-300, y); g.lineTo(1500, y); g.stroke(); }
  sign(g, SIGN, 930, 1146, 1.05);
  grandma(g, 708, 1158, 1.2, { wave: smooth((t - 2.2) / 0.35), wind: 1.5 }, t);
  // warm dust in the summer air
  const r = rand(4040);
  g.fillStyle = 'rgba(255,248,226,0.55)';
  for (let i = 0; i < 26; i++) {
    const x = 60 + r() * 960, y = 620 + r() * 680, ph = r() * TAU;
    circ(g, x + 14 * Math.sin(t * 0.7 + ph), y - 10 * t + 8 * Math.sin(t * 1.1 + ph * 2), 1.4 + 1.6 * r());
  }
}

// ================================================================ the train (shared by B and C)
/** a carriage set whose rear end is at world x = xr; top of the roof at y0; doors: { x (door centre), open 0..1, inside() } */
function drawTrain(g, xr, y0, k, settle, t, door) {
  const top = y0 + settle, bodyTop = top + 26 * k, bot = top + 420 * k;
  const x0 = xr - 2600;
  g.fillStyle = '#bcc5d2'; g.beginPath(); g.roundRect(x0, top, xr - x0 - 8, 40 * k, [18 * k, 26 * k, 0, 0]); g.fill();
  g.fillStyle = '#a9b4c4'; for (let x = xr - 300; x > x0; x -= 520) rr(g, x - 120, top - 14 * k, 150, 22 * k, 6);
  g.fillStyle = '#edf0f4'; g.beginPath(); g.roundRect(x0, bodyTop, xr - x0, bot - bodyTop, [0, 34 * k, 10, 0]); g.fill();
  g.fillStyle = '#dde3ea'; g.fillRect(x0, bot - 70 * k, xr - x0 - 6, 70 * k);
  g.fillStyle = '#3e6199'; g.fillRect(x0, bot - 92 * k, xr - x0 - 2, 20 * k);
  g.fillStyle = '#2f4c7b'; g.fillRect(x0, bot - 68 * k, xr - x0 - 4, 4 * k);
  // windows (every 230 px from the rear), skipping the door slots
  for (let i = 0; i < 12; i++) {
    const cx = xr - 95 * k - i * 230 * k;
    if (cx < x0) break;
    if (door && Math.abs(cx - door.x) < 120 * k) continue;
    const wy = bodyTop + 58 * k, wh = 132 * k;
    g.fillStyle = '#2c3f5f'; rr(g, cx - 72 * k, wy, 144 * k, wh, 16 * k);
    g.fillStyle = 'rgba(150,184,226,0.28)'; g.beginPath(); g.moveTo(cx - 10 * k, wy); g.lineTo(cx + 26 * k, wy); g.lineTo(cx - 24 * k, wy + wh); g.lineTo(cx - 60 * k, wy + wh); g.fill();
  }
  if (door) {
    const dw = 118 * k, dt = bodyTop + 40 * k, db = bot - 4;
    g.fillStyle = '#d3d9e1'; rr(g, door.x - dw / 2 - 8, dt - 8, dw + 16, db - dt + 8, 10);
    g.save();
    g.beginPath(); g.rect(door.x - dw / 2, dt, dw, db - dt); g.clip();
    g.fillStyle = '#31435f'; g.fillRect(door.x - dw / 2, dt, dw, db - dt);
    g.fillStyle = '#26364f'; g.fillRect(door.x - dw / 2, db - 26, dw, 26);
    g.fillStyle = '#93a2b8'; g.fillRect(door.x + dw * 0.32, dt + 30, 5, db - dt - 60);
    if (door.inside) door.inside(door.x - dw / 2 * door.open, door.x + dw / 2 * door.open);
    const sl = (dw / 2) * door.open;
    for (const s of [-1, 1]) {
      const lx = s < 0 ? door.x - dw / 2 - sl : door.x + sl;
      g.fillStyle = '#e6eaf0'; g.fillRect(lx, dt, dw / 2, db - dt);
      g.fillStyle = '#2c3f5f'; rr(g, lx + 12, dt + 22 * k, dw / 2 - 24, 120 * k, 10);
      g.fillStyle = 'rgba(150,184,226,0.25)'; g.fillRect(lx + 14, dt + 26 * k, 8, 110 * k);
      g.fillStyle = '#c3cbd6'; g.fillRect(s < 0 ? lx + dw / 2 - 3 : lx, dt, 3, db - dt);
    }
    g.restore();
  }
  g.fillStyle = '#c9d1dc'; g.fillRect(xr - 10, bodyTop + 30 * k, 6, bot - bodyTop - 60 * k);
}

// ================================================================ shot C — the spring morning
const FLOCK = (() => {
  const r = rand(5150), a = [];
  for (let i = 0; i < 9; i++) {
    const x = 470 + i * 52 + r() * 18;
    a.push({ x, tb: 5.42 + 0.075 * i + 0.05 * r(), vx: (r() < 0.35 ? -1 : 1) * (70 + 120 * r()), vy: 230 + 120 * r(), ay: 60 + 80 * r(),
      ph: r() * TAU, look: r() < 0.5 ? 1 : -1, s: 1.05 + 0.25 * r() });
  }
  return a;
})();
const FAR_FLOCK = (() => { const r = rand(5151), a = []; for (let i = 0; i < 6; i++) a.push({ x: 180 + r() * 160, y: 360 + r() * 70, ph: r() * TAU, s: 0.45 + 0.2 * r() }); return a; })();
const PETALS = (() => {
  const r = rand(5152), a = [];
  for (let i = 0; i < 64; i++) {
    const ang = r() * TAU, d = Math.sqrt(r());
    a.push({ tb: -6 + 16 * (i / 64) + 0.2 * r(), x: 930 + Math.cos(ang) * d * 170, y: 980 + Math.sin(ang) * d * 130,
      vx: -(60 + 90 * r()), vy: 28 + 40 * r(), A: 10 + 22 * r(), w: 1.1 + 1.3 * r(), ph: r() * TAU, sp: 2 + 4 * r(),
      s: 0.7 + 0.7 * r(), near: r() < 0.3, c: r() < 0.5 ? '#fbf3f5' : '#eedde4' });
  }
  return a;
})();
const FALLEN = (() => {
  const r = rand(5153), a = [];
  for (let i = 0; i < 46; i++) {
    const y = 1516 + 480 * r() ** 1.8, x = 1250 - 900 * r() ** 1.3, sc = 0.7 + (y - 1500) / 600;
    a.push({ x, y, rx: (4 + 3 * r()) * sc, ry: (2.2 + 1.4 * r()) * sc, a: r() * 3, c: r() < 0.5 ? 'rgba(250,240,244,0.85)' : 'rgba(236,218,226,0.8)' });
  }
  return a;
})();
// the wind gust that comes with the opening: a displacement that grows smoothly from 0 to GUST over [5.25, 6.9]
const GUST = -230;
const gustAt = (t) => { const u = clamp((t - 5.25) / 1.65); return GUST * (u * u * u * (u * (6 * u - 15) + 10)); };

export const WIRE = { xa: -500, ya: 902, xb: 1186, yb: 872, sag: 80 };
export const C_LAYOUT = { xStop: 620, doorX: 380, sill: 1478, granX: 750, granY: 1508, k: 0.77 };

/** the train's rear-end x: constant deceleration from 1500 px/s to a stop at T_STOP */
export function trainX(t) { const T = 1.0, v0 = 1500, a = v0 / T, s = Math.max(0, T_STOP - t); return C_LAYOUT.xStop - 0.5 * a * s * s; }
export const T_STOP = 5.0;

export function paintC(g, t, L, SIGN, beat) {
  // ---- sky (far), sun haze, clouds, a distant flock
  L(0.35);
  g.fillStyle = vgrad(g, [[-500, '#244a86'], [150, '#3c6aae'], [620, '#7ea6d6'], [980, '#c3d8ec'], [1190, '#eef1ee']]);
  g.fillRect(-800, -900, 2700, 2300);
  const sun = g.createRadialGradient(900, 420, 0, 900, 420, 640);
  sun.addColorStop(0, 'rgba(255,251,240,0.62)'); sun.addColorStop(0.5, 'rgba(255,251,240,0.16)'); sun.addColorStop(1, 'rgba(255,251,240,0)');
  g.fillStyle = sun; g.fillRect(200, -300, 1500, 1500);
  // a far bank of cumulus resting on the horizon, pale with haze
  L(0.45);
  g.fillStyle = '#e4ecf5';
  g.beginPath();
  for (const [bx, by, br] of [[-120, 1120, 90], [10, 1090, 120], [170, 1110, 95], [330, 1080, 130], [500, 1105, 100], [640, 1070, 140], [820, 1100, 110], [980, 1080, 125], [1140, 1105, 100], [1300, 1090, 120]]) {
    g.moveTo(bx + br, by); g.arc(bx, by, br, 0, TAU);
  }
  g.fill();
  g.fillStyle = 'rgba(214,226,240,0.9)'; g.fillRect(-500, 1120, 2200, 200);
  L(0.35);
  cloud(g, 170 + 7 * t, 600, 1.15);
  cloud(g, 820 + 5 * t, 760, 0.75);
  cloud(g, 1010 + 6 * t, 240, 0.95);
  cloud(g, 420 + 4 * t, 150, 0.6);
  for (const b of FAR_FLOCK) birdFlying(g, b.x + 22 * t, b.y + 4 * Math.sin(t + b.ph), b.s, t * 9 + b.ph, 1);
  // ---- hills and a far village (haze), the field, the fence, the blossom tree
  L(0.55);
  g.fillStyle = '#aebfd6';
  g.beginPath(); g.moveTo(-500, 1300); for (let x = -500; x <= 1700; x += 20) g.lineTo(x, 1158 - 34 * Math.sin(x / 260 + 0.6) - 14 * Math.sin(x / 97)); g.lineTo(1700, 1300); g.fill();
  L(0.65);
  g.fillStyle = '#93a9c6';
  g.beginPath(); g.moveTo(-500, 1320); for (let x = -500; x <= 1700; x += 20) g.lineTo(x, 1214 - 22 * Math.sin(x / 180 + 2) - 8 * Math.sin(x / 61)); g.lineTo(1700, 1320); g.fill();
  for (const [hx, hw] of [[620, 34], [664, 26], [1010, 30], [1046, 40], [1100, 24]]) {
    g.fillStyle = '#c0cfe0'; g.fillRect(hx, 1200, hw, 22);
    g.fillStyle = '#7d96b8'; g.beginPath(); g.moveTo(hx - 4, 1201); g.lineTo(hx + hw / 2, 1188); g.lineTo(hx + hw + 4, 1201); g.fill();
  }
  L(0.8);
  g.fillStyle = vgrad(g, [[1228, '#8fa99c'], [1440, '#7a978c']]); g.fillRect(-500, 1228, 2200, 230);
  g.fillStyle = '#6f8b82';
  g.beginPath(); for (const [tx, tr] of [[700, 26], [742, 20], [1110, 30], [1160, 22], [1220, 28]]) { g.moveTo(tx + tr, 1238); g.arc(tx, 1238, tr, 0, TAU); } g.fill();
  tree(g, 960, 1430, 1.08, false, t);
  g.fillStyle = '#cbd5e1'; for (let x = 640; x < 1500; x += 50) g.fillRect(x, 1384, 5, 44);
  g.fillRect(620, 1394, 900, 4);
  // ---- the overhead wire on its pole, and the birds that leave it when the frame opens
  L(0.9);
  g.fillStyle = '#5d6a84'; g.fillRect(1180, 850, 13, 600); g.fillRect(1120, 864, 130, 8);
  g.strokeStyle = '#46526c'; g.lineWidth = 2.6;
  g.beginPath(); for (let x = WIRE.xa; x <= WIRE.xb; x += 20) { const y = sagY(x, WIRE.xa, WIRE.ya, WIRE.xb, WIRE.yb, WIRE.sag); x === WIRE.xa ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
  for (const b of FLOCK) {
    const y0 = sagY(b.x, WIRE.xa, WIRE.ya, WIRE.xb, WIRE.yb, WIRE.sag) + 1;
    const tau = t - b.tb;
    if (tau <= 0) { birdPerched(g, b.x, y0, b.s, b.look); continue; }
    const x = b.x + b.vx * tau, y = y0 - 10 - (b.vy * tau + 0.5 * b.ay * tau * tau);
    const s = b.s * (1 - 0.18 * Math.min(tau, 2.5));
    const flap = tau < 1.4 ? tau * 46 + b.ph : (1.4 * 46 + b.ph + (tau - 1.4) * 22);
    birdFlying(g, x, y, s, flap, b.vx > 0 ? 1 : -1);
  }
  // ---- the track, the train, the platform, the people
  L(1);
  g.fillStyle = '#9ea7b4'; g.fillRect(-500, 1420, 2200, 56);
  g.fillStyle = '#7b8699'; g.fillRect(-500, 1432, 2200, 5); g.fillRect(-500, 1452, 2200, 5);
  const xr = trainX(t);
  const st = t - T_STOP, settle = st > 0 ? -3 * Math.exp(-st * 5) * Math.sin(st * 16) : 0;
  const open = ease.outCubic(clamp((t - 5.04) / 0.3));
  const cx = C_LAYOUT.doorX + (xr - C_LAYOUT.xStop);
  const K = C_LAYOUT.k;
  // the child: inside the doorway, then one hop down, then the run to her (all closed-form in t)
  const hop = clamp((t - 5.42) / 0.3), runU = clamp((t - 5.72) / 0.62);
  const hugK = smooth((t - 6.26) / 0.22);
  let kx, ky, kst;
  if (t < 5.42) { kx = cx; ky = C_LAYOUT.sill; kst = { run: 0 }; }
  else if (hop < 1) { kx = lerp(cx, cx + 40, hop); ky = lerp(C_LAYOUT.sill, 1512, hop) - 26 * Math.sin(Math.PI * hop); kst = { run: 0.3 * Math.sin(Math.PI * hop), ph: 1.2 }; }
  else {
    const e = runU * runU * (3 - 2 * runU) * 0.35 + runU * 0.65;
    kx = lerp(cx + 40, 668, e); ky = 1512; kst = { run: Math.sin(Math.PI * Math.min(1, runU * 1.05)) * (1 - hugK), ph: (t - 5.72) * TAU * 2.7 };
  }
  kst.hug = hugK; kst.happy = t > 6.2 ? 1 : 0;
  const drawKid = () => kid(g, kx, ky, K, kst, t);
  drawTrain(g, xr, 1060, 1, settle, t, { x: cx, open, inside: t < 5.42 ? (a, b) => {
    g.save(); g.beginPath(); g.rect(a, 900, b - a, 700); g.clip(); drawKid(); g.restore();
  } : null });
  // platform
  g.fillStyle = '#e1e6ed'; g.fillRect(-500, 1474, 2200, 8);
  g.fillStyle = '#8796ad'; g.fillRect(-500, 1482, 2200, 18);
  g.fillStyle = vgrad(g, [[1500, '#bdc8d7'], [1900, '#a5b2c5'], [2400, '#94a2b8']]); g.fillRect(-500, 1500, 2200, 1000);
  g.fillStyle = '#e8ecf1'; for (let x = -500; x < 1700; x += 36) g.fillRect(x, 1503, 24, 8);
  g.strokeStyle = 'rgba(70,84,110,0.16)'; g.lineWidth = 2;
  for (let i = 1; i < 12; i++) { const y = 1512 + 22 * i ** 1.5; g.beginPath(); g.moveTo(-500, y); g.lineTo(1700, y); g.stroke(); }
  // fallen petals on the platform, thicker toward the tree
  for (const f of FALLEN) { g.fillStyle = f.c; ell(g, f.x, f.y, f.rx, f.ry, f.a); }
  sign(g, SIGN, 950, 1496, 1);
  // she waves as the doors open (the same wave as that summer), opens her arms, leans in, holds on
  const gst = {
    wave: smooth((t - 5.05) / 0.25) * (1 - smooth((t - 5.68) / 0.22)),
    open: smooth((t - 5.7) / 0.32),
    hug: smooth((t - 6.22) / 0.26),
    bend: smooth((t - 5.95) / 0.4),
    happy: t > 6.3 ? 1 : 0,
    sway: t > 6.5 ? 0.05 * Math.sin((t - 6.5) * 2.1) * smooth((t - 6.5) / 0.6) : 0,
  };
  const gx = C_LAYOUT.granX - 14 * smooth((t - 6.0) / 0.4);
  if (t < 5.42) grandma(g, gx, C_LAYOUT.granY, K, gst, t);
  else if (gst.hug > 0) grandma(g, gx, C_LAYOUT.granY, K, gst, t, drawKid);
  else { grandma(g, gx, C_LAYOUT.granY, K, gst, t); drawKid(); }
  // ---- petals, blown by the gust that comes with the opening (near ones larger and in front)
  for (const near of [false, true]) {
    L(near ? 1.25 : 0.9);
    for (const p of PETALS) {
      if (p.near !== near) continue;
      const tau = t - p.tb;
      if (tau < 0 || tau > 7) continue;
      const a = Math.min(1, tau / 0.4) * Math.min(1, (7 - tau) / 0.8);
      const x = p.x + p.vx * tau + p.A * Math.sin(p.w * tau + p.ph) + (gustAt(t) - gustAt(p.tb)) * (near ? 1.3 : 1);
      const y = p.y + p.vy * tau + 0.4 * p.A * Math.sin(p.w * 1.7 * tau + p.ph);
      const s = p.s * (near ? 1.7 : 1), spin = Math.cos(p.sp * tau + p.ph);
      g.globalAlpha = a; g.fillStyle = p.c;
      ell(g, x, y, 7 * s * Math.max(0.25, Math.abs(spin)), 4.6 * s, p.ph + 0.3 * tau);
    }
    g.globalAlpha = 1;
  }
  // foreground shade on the near platform (keeps the captions on it legible)
  g.setTransform(1, 0, 0, 1, 0, 0);
  const fs = g.createLinearGradient(0, 1540, 0, 1920);
  fs.addColorStop(0, 'rgba(26,38,64,0)'); fs.addColorStop(1, 'rgba(26,38,64,0.34)');
  g.fillStyle = fs; g.fillRect(0, 1540, 1080, 380);
  // the beat: a soft wash of morning light from the top while the frame opens
  if (beat > 0) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    const wash = g.createLinearGradient(0, 0, 0, 1300);
    wash.addColorStop(0, `rgba(255,252,244,${0.22 * beat})`); wash.addColorStop(1, 'rgba(255,252,244,0)');
    g.fillStyle = wash; g.fillRect(0, 0, 1080, 1300);
  }
}
