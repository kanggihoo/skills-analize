/*
 * 115 · 취급주의, 오늘의 주인공 — 흐르는 글자 띠 · 무한 마키 테이프
 *
 * Four printed tapes (a repeating phrase on a coloured band) cross the frame and touch a kraft parcel. Their print scrolls
 * forever (texture offset = Φ(t) mod period, Φ = ∫ speed dt baked once), they brake and surge together on the beats,
 * one of them carries a half-turn twist (its back side, mirrored print, flows through the turn). Then every tape wraps the
 * parcel by tangent winding: the part already laid on the box follows a rounded-rectangle belt, the rest leaves it as a
 * straight tangent line, so the free end swings around the box like a real tape being wound. The tails are pulled into a
 * knot, the coral tape's tails curl into bow loops, the knot pops, and the coral tape alone comes forward with the message.
 *
 * A tape is sampled as N strips along its centreline; each sample carries its own frame (T along, B across, N = T×B) for
 * position, shading and the twist, and the strip is built as a thin box section (printed face, back face, two edges)
 * so it has a thickness, an edge colour and casts a shadow on whatever lies beneath (the box, another tape, the wall).
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { defineDemo, rand, clamp, lerp, track, ease } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';

const D = 10;
const BW = 1.25, BH = 1.0, BD = 1.25, BR = 0.14;        // the parcel (box-local units), edge radius
const TW = 0.25, TH = 0.009;                             // tape width and thickness
const OFF0 = 0.6 * TH, RIDGE = 1.3 * TH;                 // lift of a tape over the box, extra lift over another tape
const N = 340, S = 4.4;                                  // samples per tape, half length of a tape (material units)
const PX = 1024;                                         // texture pixels per unit (256 px across 0.25)
const V0 = 0.55;                                         // base scroll speed (units / s)
const T_POP = 6.8;                                       // the knot pops
const PV = '"Pretendard Variable"';

const E = {
  io: ease.inOutCubic, oc: ease.outCubic, ic: ease.inCubic, ox: ease.outExpo,
  ob: (p) => ease.outBack(p, 1.5), sine: (p) => 0.5 - 0.5 * Math.cos(Math.PI * p),
  i2: (p) => p * p, o2: (p) => 1 - (1 - p) * (1 - p), lin: (p) => p,
};
const pr = (t, a, b, f = E.io) => f(clamp((t - a) / (b - a)));
const sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const gauss = (t, c, w) => Math.exp(-((t - c) / w) * ((t - c) / w));

// ------------------------------------------------------------------ scroll speed: one shared profile, Φ = ∫ v dt baked
function speedProfile(t) {
  let g = 1;
  g -= 0.93 * gauss(t, 1.62, 0.13);       // beat 1: every tape brakes …
  g += 2.3 * gauss(t, 1.98, 0.17);        // … and surges together
  g -= 0.93 * gauss(t, 5.42, 0.13);       // beat 2 (the tied parcel)
  g += 2.3 * gauss(t, 5.78, 0.17);
  g *= 1 - 0.97 * sstep(6.25, 6.62, t) * (1 - sstep(T_POP, T_POP + 0.12, t));   // held breath before the pop
  g += 1.6 * gauss(t, 7.0, 0.22);         // the release
  return g;
}
const PHI_DT = 1 / 1200;
const PHI = (() => {
  const n = Math.ceil(D / PHI_DT) + 2, a = new Float64Array(n);
  for (let i = 1; i < n; i++) {
    const t0 = (i - 1) * PHI_DT, t1 = i * PHI_DT;
    a[i] = a[i - 1] + 0.5 * (speedProfile(t0) + speedProfile(t1)) * PHI_DT * V0;   // trapezoid
  }
  return a;
})();
function phi(t) {
  const x = clamp(t, 0, D) / PHI_DT, i = Math.floor(x), f = x - i;
  return PHI[i] + (PHI[i + 1] - PHI[i]) * f;
}

// ------------------------------------------------------------------ belt rail: a rounded rectangle around one box axis
const R2 = new Float64Array(6);   // x, y, tx, ty, nx, ny in the belt plane (u1, u2)
function arc(cx, cy, f, R) {
  const c = Math.cos(f), s = Math.sin(f);
  R2[0] = cx + R * c; R2[1] = cy + R * s; R2[2] = -s; R2[3] = c; R2[4] = c; R2[5] = s;
}
function put(x, y, tx, ty, nx, ny) { R2[0] = x; R2[1] = y; R2[2] = tx; R2[3] = ty; R2[4] = nx; R2[5] = ny; }
// counter-clockwise from the middle of the +u1 side; perimeter P = 4·l1 + 4·l2 + 2π·R
function rr2d(u, a1, a2, P) {
  const R = BR + OFF0, l1 = a1 - BR, l2 = a2 - BR, q = R * Math.PI / 2, A1 = a1 + OFF0, A2 = a2 + OFF0;
  u = ((u % P) + P) % P;
  if (u < l2) return put(A1, u, 0, 1, 1, 0);
  u -= l2;
  if (u < q) return arc(l1, l2, u / R, R);
  u -= q;
  if (u < 2 * l1) return put(l1 - u, A2, -1, 0, 0, 1);
  u -= 2 * l1;
  if (u < q) return arc(-l1, l2, Math.PI / 2 + u / R, R);
  u -= q;
  if (u < 2 * l2) return put(-A1, l2 - u, 0, -1, -1, 0);
  u -= 2 * l2;
  if (u < q) return arc(-l1, -l2, Math.PI + u / R, R);
  u -= q;
  if (u < 2 * l1) return put(-l1 + u, -A2, 1, 0, 0, -1);
  u -= 2 * l1;
  if (u < q) return arc(l1, -l2, 1.5 * Math.PI + u / R, R);
  u -= q;
  return put(A1, -l2 + u, 0, 1, 1, 0);
}

const AXV = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
const PLANE = { x: ['y', 'z'], y: ['z', 'x'], z: ['x', 'y'] };   // u1 × u2 = axis
const HALF = { x: BW / 2, y: BH / 2, z: BD / 2 };

// the bow: each coral tail becomes a rose petal r = RP·sin(π φ / PHIMAX) leaning out of the knot
const RP = 0.56, PHIMAX = 1.25;
const PETAL = (() => {
  const n = 400, phis = new Float64Array(n + 1), arcs = new Float64Array(n + 1);
  let px = 0, py = 0;
  for (let i = 1; i <= n; i++) {
    const f = (i / n) * PHIMAX, r = RP * Math.sin(Math.PI * f / PHIMAX), x = r * Math.cos(f), y = r * Math.sin(f);
    phis[i] = f; arcs[i] = arcs[i - 1] + Math.hypot(x - px, y - py); px = x; py = y;
  }
  return { phis, arcs, L: arcs[n] };
})();
const LP = PETAL.L;
function phiOfArc(q) {
  const { phis, arcs } = PETAL;
  if (q <= 0) return 0;
  if (q >= LP) return PHIMAX;
  let lo = 0, hi = arcs.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (arcs[m] < q) lo = m; else hi = m; }
  const f = (q - arcs[lo]) / (arcs[hi] - arcs[lo]);
  return phis[lo] + (phis[hi] - phis[lo]) * f;
}

/*
 * The tapes. Each one is wound on a belt around one box axis (at height h along it). Material coordinate σ ∈ [−S, S];
 * σ = 0 is the contact point uc (on a visible face), the + side winds ub along the belt, the − side ua, and they meet
 * (the knot on top for the two over-the-top belts, the hidden back for the two side belts). s = ±1 picks the winding
 * direction so that the printed side (N = T × B) always faces out of the box.
 */
const BANDS = [
  { key: 'caution', axis: 'x', h: 0, cf: 0.25, s: -1, uaF: 0.75, ubF: 0.25, ridgeY: true, flow: 1.0,
    slide: [-0.2, 0.8, 9], wrap: [3.05, 3.95], pull: [3.95, 4.42], snap: [-1, 0, 0] },
  { key: 'navy', axis: 'y', h: 0.2, cf: 0, s: 1, uaF: 0.5, ubF: 0.5, flow: 1.12,
    slide: [-0.05, 0.92, -9], wrap: [2.55, 3.35], pull: [3.35, 3.8], snap: [0, 1, 0] },
  { key: 'mint', axis: 'y', h: -0.2, cf: 0.75, s: 1, uaF: 0.5, ubF: 0.5, flow: -0.9,
    slide: [0.1, 1.05, 9], wrap: [2.7, 3.5], pull: [3.5, 3.95], snap: [0, -1, 0] },
  { key: 'coral', axis: 'z', h: 0, cf: 0.5, s: -1, uaF: 0.75, ubF: 0.25, ridgeY: true, ridgeX: true, flow: 0.85,
    slide: [0.25, 1.2, -9], wrap: [3.45, 4.35], pull: [4.35, 4.8], twist: true, petal: true },
];
for (const b of BANDS) {
  const [k1, k2] = PLANE[b.axis];
  b.a1 = HALF[k1]; b.a2 = HALF[k2];
  b.u1 = AXV[k1]; b.u2 = AXV[k2]; b.av = AXV[b.axis];
  const R = BR + OFF0;
  b.P = 4 * (b.a1 - BR) + 4 * (b.a2 - BR) + 2 * Math.PI * R;
  b.uc = b.cf * b.P; b.ua = b.uaF * b.P; b.ub = b.ubF * b.P;
}

// a tape running under this one lifts it: Y belts (navy, mint) lie lowest, the caution belt crosses them, coral crosses both
function ridge(b, x, y, z) {
  if (Math.abs(x) > BW / 2 + 0.05 || Math.abs(y) > BH / 2 + 0.05 || Math.abs(z) > BD / 2 + 0.05) return 0;
  const bump = (d) => 1 - sstep(TW / 2 - 0.012, TW / 2 + 0.01, d);
  let r = 0;
  if (b.ridgeY) r += Math.max(bump(Math.abs(y - 0.2)), bump(Math.abs(y + 0.2)));
  if (b.ridgeX) r += bump(Math.abs(x));
  return r;
}

// rail point at σ → o = [p(3), T(3), B(3), n(3)] in box space (n: outward normal of the box under the tape)
function railAt(b, sig, o) {
  rr2d(b.uc + b.s * sig, b.a1, b.a2, b.P);
  const x = R2[0], y = R2[1], tx = R2[2], ty = R2[3], nx = R2[4], ny = R2[5], u1 = b.u1, u2 = b.u2, a = b.av, s = b.s;
  for (let k = 0; k < 3; k++) {
    o[k] = x * u1[k] + y * u2[k] + b.h * a[k];
    o[3 + k] = s * (tx * u1[k] + ty * u2[k]);
    o[6 + k] = s * a[k];
    o[9 + k] = nx * u1[k] + ny * u2[k];
  }
  // the + end rides over the − end where they meet; any tape below lifts it
  const spiral = sig > 0 ? 1.25 * TH * sstep(b.ub - 0.5, b.ub - 0.12, sig) : 0;
  const lift = spiral + RIDGE * ridge(b, o[0], o[1], o[2]);
  o[0] += lift * o[9]; o[1] += lift * o[10]; o[2] += lift * o[11];
}

const EA = new Float64Array(12), EB = new Float64Array(12), TMP = new Float64Array(3), TMP2 = new Float64Array(3);
// a curling tail: polar blend between the straight tail (k = 0) and the rose petal (k = 1), out of end frame Ef
function curlPos(Ef, sgn, q, k, out) {
  const qq = Math.min(Math.max(q, 0), LP);
  const f = phiOfArc(qq), r = RP * Math.sin(Math.PI * f / PHIMAX);
  const ang = k * f, rad = lerp(qq, r, k), c = Math.cos(ang), s = Math.sin(ang);
  for (let j = 0; j < 3; j++) out[j] = Ef[j] + rad * (c * sgn * Ef[3 + j] + s * Ef[9 + j]);
}

/*
 * Tangent winding. The wound span [σa, σb] lies on the rail; past either end the tape continues as the tangent line of
 * that end (a straight tape leaving a convex box never cuts into it). pull shortens the free tail into the end point
 * (the knot), curl rolls it into a petal.
 */
function bandPoint(b, st, sig, o) {
  const sa = -st.wa * b.ua, sb = st.wb * b.ub;
  if (sig >= sa && sig <= sb) { railAt(b, sig, o); return; }
  const plus = sig > sb, Ef = plus ? EB : EA, sgn = plus ? 1 : -1;
  const q = (plus ? sig - sb : sa - sig) - (plus ? st.pullB : st.pullA);
  for (let j = 0; j < 12; j++) o[j] = Ef[j];
  if (q <= 0) return;                                   // pulled into the end point (hidden by the knot / the box)
  if (b.petal && st.curl > 0) {
    const qe = Math.min(q, LP);
    curlPos(Ef, sgn, qe - 0.004, st.curl, TMP);
    curlPos(Ef, sgn, qe + 0.004, st.curl, TMP2);
    let tx = TMP2[0] - TMP[0], ty = TMP2[1] - TMP[1], tz = TMP2[2] - TMP[2];
    const l = Math.hypot(tx, ty, tz) || 1; tx /= l; ty /= l; tz /= l;
    curlPos(Ef, sgn, qe, st.curl, o);
    const extra = q - qe;
    o[0] += extra * tx; o[1] += extra * ty; o[2] += extra * tz;
    o[3] = sgn * tx; o[4] = sgn * ty; o[5] = sgn * tz;
    return;
  }
  for (let j = 0; j < 3; j++) o[j] = Ef[j] + sgn * q * Ef[3 + j];
  if (st.wa === 0 && st.wb === 0) {                      // the opening lines lie on a face: they ride over crossing tapes
    const lift = RIDGE * (ridge(b, o[0] - OFF0 * o[9], o[1] - OFF0 * o[10], o[2] - OFF0 * o[11]) - ridge(b, Ef[0], Ef[1], Ef[2]));
    o[0] += lift * o[9]; o[1] += lift * o[10]; o[2] += lift * o[11];
  }
}

// the state of every tape at time t (all closed-form in t)
function bandState(b, t) {
  const st = { e: 0, wa: 0, wb: 0, pullA: 0, pullB: 0, curl: 0, twistA: 0, ex: 1, dist: 0 };
  st.e = b.slide[2] * (1 - pr(t, b.slide[0], b.slide[1], E.ox));
  st.wa = st.wb = pr(t, b.wrap[0], b.wrap[1], E.io);
  const pl = pr(t, b.pull[0], b.pull[1], E.io), keep = b.petal ? LP : 0;
  st.pullA = pl * (S - b.ua - keep); st.pullB = pl * (S - b.ub - keep);
  if (b.petal) st.curl = pr(t, 4.72, 5.25, E.ob);
  if (b.twist) st.twistA = 1 - pr(t, 2.25, 2.85, E.io);
  if (b.key === 'coral') {                // the pop: the bow lets go, the tails spring out, the tape unwinds
    st.curl *= 1 - pr(t, T_POP, T_POP + 0.1, E.o2);
    const v = 1 - pr(t, T_POP + 0.05, T_POP + 0.2, E.o2);
    st.pullA *= v; st.pullB *= v;
    const r = 1 - pr(t, T_POP + 0.1, T_POP + 0.55, E.io);
    st.wa *= r; st.wb *= r;
  } else {                                // the other belts loosen and fly off along their axis
    st.ex = 1 + 0.2 * pr(t, T_POP, T_POP + 0.18, E.ob);
    st.dist = 7.5 * pr(t, T_POP + 0.08, T_POP + 0.75, E.ic);
  }
  return st;
}

// ------------------------------------------------------------------ the parcel and the camera (pure functions of t)
const boxPos = track([[0, [0, 0.16, 0]], [2.4, [0, 0.16, 0]], [4.4, [0, -0.02, 0]], [6.8, [0, -0.02, 0]], [8.3, [0, 0.4, -0.55]], [D, [0, 0.44, -0.6]]]);
const boxYaw = track([[0, 0.6], [2.4, 0.72, E.sine], [4.5, 1.02], [6.8, 1.22, E.lin], [D, 1.5, E.oc]]);
const boxPitch = track([[0, 0.26], [2.4, 0.24], [4.4, 0.03], [D, 0.03]]);
const boxRoll = track([[0, -0.36], [2.4, -0.31], [4.3, 0], [D, 0]]);
const camPos = track([[0, [0.0, 0.5, 10.6]], [2.4, [0.15, 0.7, 10.1], E.sine], [4.6, [0.45, 2.45, 7.8]], [6.7, [0.6, 2.6, 7.25], E.sine],
  [8.1, [0.05, 1.15, 8.9]], [D, [0.0, 1.1, 8.6], E.sine]]);
const camTgt = track([[0, [0, 0.0, 0]], [2.4, [0, 0.02, 0]], [4.6, [0, -0.08, 0]], [6.7, [0, -0.05, 0]], [8.1, [0, 0.32, 0]], [D, [0, 0.34, 0]]]);

function boxPose(t, pos, quat, eul) {
  const p = boxPos(t);
  let y = p[1] + 0.025 * Math.sin(1.4 * t);
  y -= 0.05 * gauss(t, 4.5, 0.09);                       // the knot cinches
  y -= 0.07 * (t > T_POP ? Math.exp(-(t - T_POP) / 0.12) * Math.cos((t - T_POP) * 22) : 0);   // recoil on the pop
  pos.set(p[0], y, p[2]);
  eul.set(boxPitch(t), boxYaw(t), boxRoll(t), 'ZXY');
  quat.setFromEuler(eul);
}

// ------------------------------------------------------------------ textures: one period of print per tape
const SPECS = {
  caution: { bg: '#ffcc2c', ink: '#1b1a22', edge: '#c99a12', border: 'solid', borderInk: '#1b1a22', segs: [
    { hazard: 190 }, { text: '취급주의', font: `900 138px ${PV}`, pad: 50, ls: -3 },
    { hazard: 190 }, { text: '오늘의 주인공', font: `900 138px ${PV}`, pad: 50, ls: -3 }] },
  navy: { bg: '#27336f', ink: '#fff2df', edge: '#161d44', border: 'line', borderInk: '#fff2df', segs: [
    { text: 'HAPPY BIRTHDAY', font: '400 196px "Bebas Neue"', pad: 60, ls: 6 }, { star: 120, color: '#ffcc2c' }] },
  mint: { bg: '#7ed8c1', ink: '#1e2a5e', edge: '#4ea58f', border: 'stitch', borderInk: '#1e2a5e', segs: [
    { text: '1년에 딱 한 번', font: `800 134px ${PV}`, pad: 46, ls: -2 }, { dot: 64 },
    { text: '오늘만', font: `800 134px ${PV}`, pad: 46, ls: -2 }, { dot: 64 },
    { text: '지금만', font: `800 134px ${PV}`, pad: 46, ls: -2 }, { dot: 64 }] },
  coral: { bg: '#ff5a4b', ink: '#fff4e4', edge: '#c23a2e', border: 'line', borderInk: '#fff4e4', segs: [
    { text: '생일 축하해', font: `900 150px ${PV}`, pad: 70, ls: -4 }, { heart: 120, color: '#ffd9cf' }] },
};

function mix(hex, to, k) {
  const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
  const ch = (s) => Math.round(((a >> s) & 255) * (1 - k) + ((b >> s) & 255) * k);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

function measureSegs(spec) {
  const c = document.createElement('canvas').getContext('2d');
  let x = 0;
  for (const g of spec.segs) {
    g.x = x;
    if (g.text) {
      c.font = g.font; c.letterSpacing = `${g.ls || 0}px`;
      const m = c.measureText(g.text);
      g.tw = m.width; g.asc = m.actualBoundingBoxAscent; g.desc = m.actualBoundingBoxDescent;
      g.w = Math.round(g.tw + 2 * g.pad);
    } else g.w = g.hazard || g.star || g.dot || g.heart;
    x += g.w;
  }
  spec.W = x;
  const ph = spec.segs.find((g) => g.text);
  spec.center = (ph.x + ph.w / 2) / x;          // where the first phrase sits in the period (for the final landing)
}

function drawTape(spec, back, seed) {
  const W = spec.W, H = 256, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  const R = rand(seed);
  c.fillStyle = back ? mix(spec.bg, '#ffffff', 0.16) : spec.bg;
  c.fillRect(0, 0, W, H);
  // satin grain along the tape
  for (let y = 0; y < H; y += 2) {
    c.fillStyle = R() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.035)';
    c.fillRect(0, y, W, 1);
  }
  const ink = spec.ink;
  c.globalAlpha = back ? 0.3 : 1;                // the back shows the print through the tape, mirrored and faint
  if (spec.border === 'solid') { c.fillStyle = spec.borderInk; c.fillRect(0, 0, W, 14); c.fillRect(0, H - 14, W, 14); }
  if (spec.border === 'line') { c.fillStyle = spec.borderInk; c.fillRect(0, 20, W, 5); c.fillRect(0, H - 25, W, 5); }
  if (spec.border === 'stitch') {
    c.fillStyle = spec.borderInk;
    for (let x = 6; x < W; x += 28) { c.fillRect(x, 18, 16, 4); c.fillRect(x, H - 22, 16, 4); }
  }
  for (const g of spec.segs) {
    if (g.text) {
      c.font = g.font; c.letterSpacing = `${g.ls || 0}px`; c.fillStyle = ink; c.textBaseline = 'alphabetic';
      c.fillText(g.text, g.x + g.pad, H / 2 + (g.asc - g.desc) / 2);
    } else if (g.hazard) {
      c.save(); c.beginPath(); c.rect(g.x, 14, g.w, H - 28); c.clip();
      c.fillStyle = ink;
      for (let k = -H; k < g.w + H; k += 56) {
        c.beginPath(); c.moveTo(g.x + k, H); c.lineTo(g.x + k + 28, H); c.lineTo(g.x + k + 28 + H, 0); c.lineTo(g.x + k + H, 0); c.fill();
      }
      c.restore();
    } else if (g.star) {
      const cx = g.x + g.w / 2, cy = H / 2, r = 40;
      c.fillStyle = g.color; c.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? r * 0.3 : r;
        c[k ? 'lineTo' : 'moveTo'](cx + rr * Math.cos(a), cy + rr * Math.sin(a));
      }
      c.fill();
    } else if (g.dot) {
      c.fillStyle = ink; c.beginPath(); c.arc(g.x + g.w / 2, H / 2, 10, 0, Math.PI * 2); c.fill();
    } else if (g.heart) {
      const cx = g.x + g.w / 2, cy = H / 2 + 4, s = 2.3;
      c.fillStyle = g.color; c.beginPath();
      c.moveTo(cx, cy + 16 * s);
      c.bezierCurveTo(cx - 22 * s, cy + 2 * s, cx - 18 * s, cy - 16 * s, cx, cy - 7 * s);
      c.bezierCurveTo(cx + 18 * s, cy - 16 * s, cx + 22 * s, cy + 2 * s, cx, cy + 16 * s);
      c.fill();
    }
  }
  c.globalAlpha = 1;
  return cv;
}

function canvasTex(cv, renderer, repeat) {
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = renderer.capabilities.getMaxAnisotropy();
  if (repeat) { tx.wrapS = THREE.RepeatWrapping; tx.wrapT = THREE.ClampToEdgeWrapping; }
  return tx;
}

// ------------------------------------------------------------------ tape mesh: N samples × thin box section
function makeTapeMesh(spec, renderer, seed) {
  const front = canvasTex(drawTape(spec, false, seed), renderer, true);
  const back = canvasTex(drawTape(spec, true, seed), renderer, true);
  const period = spec.W / PX;
  const geo = new THREE.BufferGeometry();
  const V = N * 8, pos = new Float32Array(V * 3), nor = new Float32Array(V * 3), uv = new Float32Array(V * 2);
  for (let i = 0; i < N; i++) {
    const u = (-S + (2 * S * i) / (N - 1)) / period;
    for (const base of [0, 2 * N]) {
      uv[(base + 2 * i) * 2] = u; uv[(base + 2 * i) * 2 + 1] = 1;       // +B edge of the print
      uv[(base + 2 * i + 1) * 2] = u; uv[(base + 2 * i + 1) * 2 + 1] = 0;
    }
  }
  const idx = [];
  for (let i = 0; i < N - 1; i++) {             // printed face (+N)
    const a = 2 * i, c = a + 1, a1 = a + 2, c1 = a + 3;
    idx.push(c, c1, a, a, c1, a1);
  }
  for (let i = 0; i < N - 1; i++) {             // back face (−N)
    const o = 2 * N, a = o + 2 * i, c = a + 1, a1 = a + 2, c1 = a + 3;
    idx.push(c, a, c1, a, a1, c1);
  }
  for (let i = 0; i < N - 1; i++) {             // edge +B
    const o = 4 * N, e1 = o + 2 * i, e2 = e1 + 1, f1 = e1 + 2, f2 = e1 + 3;
    idx.push(e1, f1, e2, e2, f1, f2);
  }
  for (let i = 0; i < N - 1; i++) {             // edge −B
    const o = 6 * N, e1 = o + 2 * i, e2 = e1 + 1, f1 = e1 + 2, f2 = e1 + 3;
    idx.push(e2, f2, e1, e1, f2, f1);
  }
  geo.setIndex(idx);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const q = 6 * (N - 1);
  geo.addGroup(0, q, 0); geo.addGroup(q, q, 1); geo.addGroup(2 * q, 2 * q, 2);
  const mats = [
    new THREE.MeshStandardMaterial({ map: front, roughness: 0.48, metalness: 0 }),
    new THREE.MeshStandardMaterial({ map: back, roughness: 0.6, metalness: 0 }),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(spec.edge), roughness: 0.7 }),
  ];
  const mesh = new THREE.Mesh(geo, mats);
  mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
  return { mesh, pos, nor, geo, front, back, period, center: spec.center };
}

// world-space samples → vertices
function fillTape(m, P, T, B, hw) {
  const pos = m.pos, nor = m.nor, ht = TH / 2;
  const put3 = (arr, v, x, y, z) => { arr[v * 3] = x; arr[v * 3 + 1] = y; arr[v * 3 + 2] = z; };
  for (let i = 0; i < N; i++) {
    const k = i * 3;
    let tx = T[k], ty = T[k + 1], tz = T[k + 2];
    let l = Math.hypot(tx, ty, tz) || 1; tx /= l; ty /= l; tz /= l;
    let bx = B[k], by = B[k + 1], bz = B[k + 2];
    const d = bx * tx + by * ty + bz * tz; bx -= d * tx; by -= d * ty; bz -= d * tz;
    l = Math.hypot(bx, by, bz) || 1; bx /= l; by /= l; bz /= l;
    const nx = ty * bz - tz * by, ny = tz * bx - tx * bz, nz = tx * by - ty * bx;
    const px = P[k], py = P[k + 1], pz = P[k + 2];
    const Atx = px + hw * bx + ht * nx, Aty = py + hw * by + ht * ny, Atz = pz + hw * bz + ht * nz;
    const Ctx = px - hw * bx + ht * nx, Cty = py - hw * by + ht * ny, Ctz = pz - hw * bz + ht * nz;
    const Abx = px + hw * bx - ht * nx, Aby = py + hw * by - ht * ny, Abz = pz + hw * bz - ht * nz;
    const Cbx = px - hw * bx - ht * nx, Cby = py - hw * by - ht * ny, Cbz = pz - hw * bz - ht * nz;
    const v = 2 * i;
    put3(pos, v, Atx, Aty, Atz); put3(pos, v + 1, Ctx, Cty, Ctz); put3(nor, v, nx, ny, nz); put3(nor, v + 1, nx, ny, nz);
    put3(pos, 2 * N + v, Abx, Aby, Abz); put3(pos, 2 * N + v + 1, Cbx, Cby, Cbz);
    put3(nor, 2 * N + v, -nx, -ny, -nz); put3(nor, 2 * N + v + 1, -nx, -ny, -nz);
    put3(pos, 4 * N + v, Atx, Aty, Atz); put3(pos, 4 * N + v + 1, Abx, Aby, Abz);
    put3(nor, 4 * N + v, bx, by, bz); put3(nor, 4 * N + v + 1, bx, by, bz);
    put3(pos, 6 * N + v, Ctx, Cty, Ctz); put3(pos, 6 * N + v + 1, Cbx, Cby, Cbz);
    put3(nor, 6 * N + v, -bx, -by, -bz); put3(nor, 6 * N + v + 1, -bx, -by, -bz);
  }
  m.geo.attributes.position.needsUpdate = true;
  m.geo.attributes.normal.needsUpdate = true;
}

// ------------------------------------------------------------------ backdrop and parcel textures (baked once)
function wallCanvas() {
  const W = 512, H = 1024, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), R = rand(11501);
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#e9e4ff'); g.addColorStop(0.55, '#d3caf8'); g.addColorStop(1, '#9d90de');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const r = c.createRadialGradient(W * 0.48, H * 0.44, 10, W * 0.48, H * 0.44, W * 0.75);
  r.addColorStop(0, 'rgba(255,246,236,0.55)'); r.addColorStop(1, 'rgba(255,246,236,0)');
  c.fillStyle = r; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 26000; i++) {             // paper grain
    const x = R() * W, y = R() * H, a = 0.03 + 0.05 * R();
    c.fillStyle = R() < 0.5 ? `rgba(255,255,255,${a})` : `rgba(40,30,80,${a})`;
    c.fillRect(x, y, 1 + R(), 1 + R());
  }
  return cv;
}
function kraftCanvas() {
  const W = 512, cv = document.createElement('canvas');
  cv.width = W; cv.height = W;
  const c = cv.getContext('2d'), R = rand(11502);
  c.fillStyle = '#d4a46c'; c.fillRect(0, 0, W, W);
  for (let i = 0; i < 2600; i++) {              // fibres
    const x = R() * W, y = R() * W, a = R() * Math.PI, l = 6 + 18 * R();
    c.strokeStyle = R() < 0.55 ? `rgba(255,236,200,${0.06 + 0.08 * R()})` : `rgba(90,55,25,${0.05 + 0.07 * R()})`;
    c.lineWidth = 0.6 + R(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + l * Math.cos(a), y + l * Math.sin(a)); c.stroke();
  }
  for (let i = 0; i < 9000; i++) {
    c.fillStyle = `rgba(70,40,15,${0.05 + 0.08 * R()})`;
    c.fillRect(R() * W, R() * W, 1.2, 1.2);
  }
  // printed handling marks (red ink, a little worn)
  c.save(); c.translate(W * 0.73, W * 0.2); c.rotate(-0.06);
  c.globalAlpha = 0.62; c.strokeStyle = '#c5402f'; c.fillStyle = '#c5402f'; c.lineWidth = 5;
  c.strokeRect(-92, -40, 184, 80);
  c.font = `800 34px ${PV}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('이쪽이 위', 0, 18);
  for (const dx of [-26, 26]) { c.beginPath(); c.moveTo(dx, -32); c.lineTo(dx - 14, -12); c.lineTo(dx + 14, -12); c.fill(); c.fillRect(dx - 4, -14, 8, 14); }
  c.restore();
  c.save(); c.translate(W * 0.24, W * 0.8); c.rotate(0.08); c.globalAlpha = 0.5; c.fillStyle = '#3a2a1c';
  c.font = `800 30px ${PV}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('마음 들어 있음', 0, 0);
  c.fillRect(-100, 24, 200, 3); c.restore();
  const v = c.createRadialGradient(W / 2, W / 2, W * 0.2, W / 2, W / 2, W * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(60,30,10,0.22)');
  c.fillStyle = v; c.fillRect(0, 0, W, W);
  return cv;
}

// ------------------------------------------------------------------ the demo
defineDemo({
  id: '115-marquee-tape',
  title: '취급주의, 오늘의 주인공',
  tech: '흐르는 글자 띠 · 무한 마키 테이프',
  duration: D,
  background: '#b9b2e6',

  async setup(api) {
    await Promise.all([
      fontReady(`900 150px ${PV}`, '취급주의 오늘의 주인공 생일 축하해'),
      fontReady(`800 60px ${PV}`, '이쪽이 위 ↑ 마음 들어 있음 오늘의 주인공에게'),
      fontReady(`800 134px ${PV}`, '1년에 딱 한 번 오늘만 지금만'),
      fontReady('400 196px "Bebas Neue"', 'HAPPY BIRTHDAY'),
    ]);

    const el = api.layer('canvas', { z: 1 });
    el.width = api.W; el.height = api.H;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(api.W, api.H, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.0;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#b9b2e6');
    this.scene = scene;
    const camera = new THREE.PerspectiveCamera(30, api.W / api.H, 0.5, 60);
    this.camera = camera;

    // light: a warm key from upper left (casts every shadow), a lilac sky fill, a cool rim from behind
    scene.add(new THREE.HemisphereLight(0xf3f0ff, 0xe6cbd6, 1.45));
    const key = new THREE.DirectionalLight(0xfff1e2, 2.4);
    key.position.set(1.4, 6.2, 7.6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    const sc = key.shadow.camera;
    sc.left = -6; sc.right = 6; sc.top = 6; sc.bottom = -6; sc.near = 1; sc.far = 26;
    key.shadow.radius = 3;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.012;
    key.shadow.intensity = 0.62;
    scene.add(key, key.target);
    const rim = new THREE.DirectionalLight(0xcfe0ff, 0.9);
    rim.position.set(-4, 3, -5);
    scene.add(rim);

    // backdrop wall (receives the tape shadows)
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 26), new THREE.MeshStandardMaterial({ map: canvasTex(wallCanvas(), renderer, false), roughness: 1 }));
    wall.position.set(0, -1, -3.8);
    wall.receiveShadow = true;
    scene.add(wall);

    // the parcel and its knot
    const group = new THREE.Group();
    const box = new THREE.Mesh(new RoundedBoxGeometry(BW, BH, BD, 5, BR),
      new THREE.MeshStandardMaterial({ map: canvasTex(kraftCanvas(), renderer, false), roughness: 0.92 }));
    box.castShadow = true; box.receiveShadow = true;
    group.add(box);
    const knot = new THREE.Mesh(new RoundedBoxGeometry(0.27, 0.16, 0.27, 4, 0.065),
      new THREE.MeshStandardMaterial({ color: '#ff5a4b', roughness: 0.45 }));
    knot.castShadow = true; knot.receiveShadow = true;
    knot.rotation.y = Math.PI / 4;
    group.add(knot);
    scene.add(group);
    this.group = group; this.knot = knot;

    // tapes
    this.tapes = BANDS.map((b, i) => {
      const spec = SPECS[b.key];
      measureSegs(spec);
      const m = makeTapeMesh(spec, renderer, 11510 + i);
      scene.add(m.mesh);
      return m;
    });
    this.L = { p: new Float64Array(N * 3), T: new Float64Array(N * 3), B: new Float64Array(N * 3) };
    this.W = { p: new Float32Array(N * 3), T: new Float32Array(N * 3), B: new Float32Array(N * 3) };

    // the coral landing: Φ eases from its running value to the nearest phase that centres "생일 축하해" on the final line
    // (cubic Hermite, end speed 0; the travel Δ is the first one past a minimum that lands on the phrase, and the
    //  duration stretches with Δ so the tape decelerates, or at most surges a little, never runs backwards)
    const coral = this.tapes[3], fl = BANDS[3].flow;
    const TL0 = 7.2, p0 = fl * phi(TL0), v0 = fl * V0 * speedProfile(TL0);
    const want = coral.center * coral.period;     // Φ ≡ centre·period puts the phrase centre at σ = 0
    const dmin = 0.55 * v0 * 1.1;
    const target = want + Math.ceil((p0 + dmin - want) / coral.period) * coral.period;
    const dur = clamp((target - p0) / (0.55 * v0), 1.1, 1.6), TL1 = TL0 + dur;
    this.landing = { TL0, TL1, p0, m0: v0 * dur, target };
    this.final = { C: [0, 0.1, 2.2], T: [0.9976, 0.069, 0], B: [-0.069, 0.9976, 0], hw: 1.38 * TW / 2 };   // where the coral tape ends up (world)

    // confetti: tape snippets from the knot, ballistic with linear drag (closed form)
    const CN = 230, R = rand(11520);
    const cols = ['#ffcc2c', '#ff5a4b', '#27336f', '#7ed8c1', '#fff2df', '#ff5a4b'];
    const conf = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.55 }), CN);
    conf.castShadow = true; conf.frustumCulled = false;
    this.conf = { mesh: conf, items: [] };
    const tmpC = new THREE.Color();
    for (let i = 0; i < CN; i++) {
      const az = R() * Math.PI * 2, el2 = 0.25 + R() * 1.1, sp = 2.0 + R() * 3.4;
      const v = [Math.cos(az) * Math.cos(el2) * sp * 1.15, Math.sin(el2) * sp + 0.6, Math.sin(az) * Math.cos(el2) * sp * 0.8];
      const ax = new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize();
      this.conf.items.push({ v, ax, w: 5 + 9 * R(), s: 0.7 + 0.6 * R(), ph: R() * 6.3, delay: R() * 0.05 });
      conf.setColorAt(i, tmpC.set(cols[i % cols.length]));
    }
    scene.add(conf);
    // where the knot is when it pops (box pose at T_POP)
    const q0 = new THREE.Quaternion(), p00 = new THREE.Vector3(), e0 = new THREE.Euler();
    boxPose(T_POP, p00, q0, e0);
    this.popAt = new THREE.Vector3(0, BH / 2 + 0.08, 0).applyQuaternion(q0).add(p00);

    // 2D overlay: flash, ring, vignette
    const ov = api.canvas({ z: 2 });
    this.ov = ov.ctx;
    this.tmp = { q: new THREE.Quaternion(), p: new THREE.Vector3(), e: new THREE.Euler(), m: new THREE.Matrix4(), v: new THREE.Vector3(),
      mi: new THREE.Matrix4(), qi: new THREE.Quaternion(), si: new THREE.Vector3() };
    this.o = new Float64Array(12);
  },

  frame(t) {
    const { renderer, scene, camera, group, knot, tapes, L, W, tmp, o } = this;

    // ---- parcel
    boxPose(t, tmp.p, tmp.q, tmp.e);
    group.position.copy(tmp.p); group.quaternion.copy(tmp.q);
    // the knot: pops in as the tails reach it, squashes before the pop, bursts
    const kIn = pr(t, 3.92, 4.22, E.ob), sq = pr(t, 6.5, 6.76, E.io) * (1 - pr(t, T_POP - 0.03, T_POP, E.lin));
    const burst = pr(t, T_POP - 0.03, T_POP + 0.02, E.lin), gone = t >= T_POP + 0.02 ? 0 : 1;
    const ks = kIn * gone * (1 + 0.5 * burst);
    knot.scale.set(ks * (1 + 0.18 * sq), ks * (1 - 0.3 * sq) + 1e-4, ks * (1 + 0.18 * sq));
    knot.position.set(0, BH / 2 + 0.065 - 0.02 * sq, 0);
    knot.visible = ks > 1e-3;
    group.updateMatrixWorld(true);
    const M = group.matrixWorld.elements;

    // ---- tapes
    const fin = pr(t, 7.15, 8.05, E.io);            // the coral tape comes forward
    for (let bi = 0; bi < BANDS.length; bi++) {
      const b = BANDS[bi], m = tapes[bi], st = bandState(b, t);
      const sa = -st.wa * b.ua, sb = st.wb * b.ub;
      railAt(b, sb, EB); railAt(b, sa, EA);
      for (let i = 0; i < N; i++) {
        const sig = -S + (2 * S * i) / (N - 1), sp = sig + st.e;
        bandPoint(b, st, sp, o);
        // the half-turn: B and N turn about T across [0.85, 1.45] of the opening line; the far side shows the back
        if (b.twist && st.twistA > 0) {
          const th = st.twistA * Math.PI * sstep(0.85, 1.45, sp);
          if (th > 0) {
            const c = Math.cos(th), s = Math.sin(th);
            const tx = o[3], ty = o[4], tz = o[5];
            const nx = ty * o[8] - tz * o[7], ny = tz * o[6] - tx * o[8], nz = tx * o[7] - ty * o[6];
            o[6] = o[6] * c + nx * s; o[7] = o[7] * c + ny * s; o[8] = o[8] * c + nz * s;
          }
        }
        const k = i * 3, sd = b.snap;
        L.p[k] = o[0] * st.ex + (sd ? sd[0] * st.dist : 0);
        L.p[k + 1] = o[1] * st.ex + (sd ? sd[1] * st.dist : 0);
        L.p[k + 2] = o[2] * st.ex + (sd ? sd[2] * st.dist : 0);
        L.T[k] = o[3]; L.T[k + 1] = o[4]; L.T[k + 2] = o[5];
        L.B[k] = o[6]; L.B[k + 1] = o[7]; L.B[k + 2] = o[8];
      }
      // box space → world
      for (let i = 0; i < N; i++) {
        const k = i * 3, x = L.p[k], y = L.p[k + 1], z = L.p[k + 2];
        W.p[k] = M[0] * x + M[4] * y + M[8] * z + M[12];
        W.p[k + 1] = M[1] * x + M[5] * y + M[9] * z + M[13];
        W.p[k + 2] = M[2] * x + M[6] * y + M[10] * z + M[14];
        for (const [src, dst] of [[L.T, W.T], [L.B, W.B]]) {
          const a = src[k], c = src[k + 1], d = src[k + 2];
          dst[k] = M[0] * a + M[4] * c + M[8] * d;
          dst[k + 1] = M[1] * a + M[5] * c + M[9] * d;
          dst[k + 2] = M[2] * a + M[6] * c + M[10] * d;
        }
      }
      let hw = TW / 2;
      if (b.key === 'coral' && fin > 0) {            // blend into the final line in front of everything
        const { C: Cf, T: Tf, B: Bf } = this.final;
        const bul = 0.7 * Math.sin(Math.PI * fin);
        for (let i = 0; i < N; i++) {
          const k = i * 3, sig = -S + (2 * S * i) / (N - 1);
          for (let j = 0; j < 3; j++) {
            W.p[k + j] = lerp(W.p[k + j], Cf[j] + sig * Tf[j], fin) + (j === 2 ? bul : 0);
            W.T[k + j] = lerp(W.T[k + j], Tf[j], fin);
            W.B[k + j] = lerp(W.B[k + j], Bf[j], fin);
          }
        }
        hw *= lerp(1, this.final.hw / hw, fin);
      }
      m.mesh.visible = !(b.snap && st.dist > 7.4);
      fillTape(m, W.p, W.T, W.B, hw);
      // scroll: offset = flow · Φ(t) (mod period through RepeatWrapping)
      let ph = b.flow * phi(t);
      if (b.key === 'coral' && t > this.landing.TL0) {
        const { TL0, TL1, p0, m0, target } = this.landing, x = clamp((t - TL0) / (TL1 - TL0));
        ph = (2 * x ** 3 - 3 * x * x + 1) * p0 + (x ** 3 - 2 * x * x + x) * m0 + (-2 * x ** 3 + 3 * x * x) * target;
      }
      const off = (ph / m.period) % 1;
      m.front.offset.x = off; m.back.offset.x = off;
    }

    // ---- confetti
    const cf = this.conf, im = cf.mesh;
    for (let i = 0; i < cf.items.length; i++) {
      const it = cf.items[i], tau = t - T_POP - it.delay;
      if (tau <= 0) { tmp.mi.makeScale(0, 0, 0); im.setMatrixAt(i, tmp.mi); continue; }
      const k = 1.7, g = -2.3, ek = (1 - Math.exp(-k * tau)) / k;
      const x = this.popAt.x + it.v[0] * ek + 0.08 * Math.sin(3 * tau + it.ph) * Math.min(1, tau);
      const y = this.popAt.y + (it.v[1] - g / k) * ek + (g / k) * tau;
      const z = this.popAt.z + it.v[2] * ek;
      tmp.qi.setFromAxisAngle(it.ax, it.w * tau + it.ph);
      const sIn = Math.min(1, tau / 0.06);
      tmp.si.set(0.085 * it.s * sIn, 0.034 * it.s * sIn, 0.004);
      tmp.v.set(x, y, z);
      tmp.mi.compose(tmp.v, tmp.qi, tmp.si);
      im.setMatrixAt(i, tmp.mi);
    }
    im.instanceMatrix.needsUpdate = true;

    // ---- camera: a slow drift, a dolly kick on each surge, a damped shake on the pop
    const cp = camPos(t), ct = camTgt(t);
    const kick = 0.32 * gauss(t, 2.02, 0.12) + 0.3 * gauss(t, 5.82, 0.12);
    const shake = t > T_POP ? 0.06 * Math.exp(-(t - T_POP) / 0.18) : 0;
    camera.position.set(cp[0] + 0.03 * Math.sin(0.9 * t) + shake * Math.sin(61 * t), cp[1] + 0.025 * Math.sin(1.3 * t + 1) + shake * Math.cos(53 * t), cp[2] - kick);
    camera.lookAt(ct[0], ct[1], ct[2]);
    camera.updateMatrixWorld(true);

    renderer.render(scene, camera);

    // ---- overlay
    const c = this.ov;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
    c.clearRect(0, 0, 1080, 1920);
    const vg = c.createRadialGradient(540, 860, 520, 540, 900, 1250);
    vg.addColorStop(0, 'rgba(40,24,80,0)'); vg.addColorStop(1, 'rgba(40,24,80,0.32)');
    c.fillStyle = vg; c.fillRect(0, 0, 1080, 1920);
    const lo = c.createLinearGradient(0, 1500, 0, 1920);
    lo.addColorStop(0, 'rgba(36,22,74,0)'); lo.addColorStop(1, 'rgba(36,22,74,0.38)');
    c.fillStyle = lo; c.fillRect(0, 1500, 1080, 420);
    // the landing: a glint runs over the final tape, then a small dedication settles under it
    if (t > this.landing.TL1) {
      const Cf = this.final.C, Tf = this.final.T, Bf = this.final.B, hw = this.final.hw;
      const pts = [[-S, -1], [S, -1], [S, 1], [-S, 1]].map(([u, v]) => {
        tmp.v.set(Cf[0] + u * Tf[0] + v * hw * Bf[0], Cf[1] + u * Tf[1] + v * hw * Bf[1], Cf[2] + u * Tf[2] + v * hw * Bf[2]).project(camera);
        return [(tmp.v.x * 0.5 + 0.5) * 1080, (-tmp.v.y * 0.5 + 0.5) * 1920];
      });
      const T1 = this.landing.TL1, gp = pr(t, T1 + 0.05, T1 + 0.7, E.io);
      if (gp > 0 && gp < 1) {
        c.save(); c.beginPath(); pts.forEach(([x, y], i) => c[i ? 'lineTo' : 'moveTo'](x, y)); c.clip();
        const gx = lerp(-260, 1340, gp), gg = c.createLinearGradient(gx - 140, 0, gx + 140, 0);
        gg.addColorStop(0, 'rgba(255,240,225,0)'); gg.addColorStop(0.5, 'rgba(255,240,225,0.42)'); gg.addColorStop(1, 'rgba(255,240,225,0)');
        c.globalCompositeOperation = 'lighter'; c.fillStyle = gg;
        c.setTransform(1, 0, -0.35, 1, 0, 0); c.fillRect(-400, 0, 2000, 1920);
        c.restore();
      }
      const kp = pr(t, T1 + 0.1, T1 + 0.6, E.oc);
      if (kp > 0) {
        const by = (pts[0][1] + pts[1][1]) / 2;   // lower edge of the tape at the centre
        c.save(); c.globalAlpha = kp; c.font = `800 48px ${PV}`; c.letterSpacing = '-1px';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.translate(540, by + 82 + 24 * (1 - kp)); c.rotate(Math.atan2(pts[1][1] - pts[0][1], pts[1][0] - pts[0][0]));
        const kw = c.measureText('오늘의 주인공에게').width / 2 + 34;
        const pill = (dx, dy) => { c.beginPath(); c.roundRect(-kw + dx, -40 + dy, 2 * kw, 80, 40); c.fill(); };
        c.fillStyle = 'rgba(39,51,111,0.28)'; pill(0, 7);            // a flat sticker shadow (no blur: stays deterministic)
        c.fillStyle = '#fff4e4'; pill(0, 0);
        c.fillStyle = '#27336f'; c.fillText('오늘의 주인공에게', 0, 2);
        c.restore();
      }
    }
    if (t >= T_POP - 0.02 && t < T_POP + 0.9) {
      tmp.v.copy(this.popAt).project(camera);
      const sx = (tmp.v.x * 0.5 + 0.5) * 1080, sy = (-tmp.v.y * 0.5 + 0.5) * 1920, tau = Math.max(0, t - T_POP);
      const fa = 0.34 * Math.exp(-tau / 0.09);
      const fg = c.createRadialGradient(sx, sy, 0, sx, sy, 900);
      fg.addColorStop(0, `rgba(255,250,236,${fa})`); fg.addColorStop(1, 'rgba(255,250,236,0)');
      c.fillStyle = fg; c.fillRect(0, 0, 1080, 1920);
      const p = clamp(tau / 0.55), rr = 30 + 520 * E.ox(p);
      c.globalAlpha = (1 - p) * 0.9; c.strokeStyle = '#fff4e4'; c.lineWidth = 16 * (1 - p) + 1;
      c.beginPath(); c.arc(sx, sy, rr, 0, Math.PI * 2); c.stroke();
      c.globalAlpha = (1 - p) * 0.7; c.strokeStyle = '#ffcc2c'; c.lineWidth = 6 * (1 - p) + 1;
      c.beginPath(); c.arc(sx, sy, rr * 0.72, 0, Math.PI * 2); c.stroke();
      c.globalAlpha = 1;
    }
  },
});
