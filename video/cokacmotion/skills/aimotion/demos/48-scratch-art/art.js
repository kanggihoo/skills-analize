/*
 * 48-scratch-art/art.js — the picture as stylus strokes (setup only; pure, seeded).
 * A stroke = a dense polyline (≈4 px steps), a width profile (pressure: lines swell and taper), a hand speed,
 * and after schedule() a drawing time τ for every point. Crumbs of wax are spawned along both edges and piled
 * at the end of every stroke, born at the τ the stylus passes them.
 */
import { rand, clamp, lerp } from '../_lib/stage.js';

export const BOARD = { x0: 46, y0: 64, x1: 1034, y1: 1646 };

let R = rand(4848);
const jit = (k) => (R() - 0.5) * 2 * k;
const vlen = (x, y) => Math.hypot(x, y);

// centripetal-ish Catmull–Rom through control points → dense points
function spline(ctrl, closed = false, step = 3) {
  const P = closed ? [ctrl[ctrl.length - 1], ...ctrl, ctrl[0], ctrl[1]] : [ctrl[0], ...ctrl, ctrl[ctrl.length - 1]];
  const out = [];
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const n = Math.max(2, Math.ceil(vlen(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(closed ? [...ctrl[0]] : [...ctrl[ctrl.length - 1]]);
  return out;
}
function resample(pts, step = 4) {
  const out = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], l = vlen(b[0] - a[0], b[1] - a[1]);
    let s = step - acc;
    while (s <= l) { out.push([lerp(a[0], b[0], s / l), lerp(a[1], b[1], s / l)]); s += step; }
    acc = l - (s - step);
  }
  const last = pts[pts.length - 1], q = out[out.length - 1];
  if (vlen(last[0] - q[0], last[1] - q[1]) > 0.8) out.push(last);
  return out;
}
// a hand never follows the guide exactly: slow lateral wander
function wobble(pts, amp = 0.8) {
  const ph = R() * 10, f = 0.02 + 0.02 * R();
  return pts.map((p, i) => {
    const a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, pts.length - 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = vlen(dx, dy) || 1;
    const o = amp * Math.sin(i * f * 4 + ph) * Math.sin(i * f * 1.3 + ph * 2);
    return [p[0] - (dy / l) * o, p[1] + (dx / l) * o];
  });
}

const STROKES = [];
function stroke(pts, { w = 5, taper = 0.25, speed = 900, pressure = 0.8, wob = 0.7, flick = false, kind = '' } = {}) {
  const P = resample(wobble(pts, wob), 4);
  if (P.length < 2) return;
  const wa = typeof w === 'function' ? w : (u) => {
    const tin = clamp(u / taper), tout = clamp((1 - u) / taper);
    return w * (flick ? 0.35 + 0.65 * Math.pow(clamp((1 - u) / 0.85), 0.7) : (0.55 + 0.45 * Math.sqrt(Math.min(tin, 1))) * (0.45 + 0.55 * Math.sqrt(Math.min(tout, 1))));
  };
  STROKES.push({ P, wa, speed, pressure, flick, kind });
}
const circle = (c, r, a0 = 0, turns = 1.08, n = 40) => Array.from({ length: Math.ceil(n * turns) + 1 }, (_, i) => { const a = a0 + (i / n) * Math.PI * 2; return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]; });

// ---------------------------------------------------------------- the picture
function whale() {
  const top = [[250, 1150], [262, 1096], [300, 1056], [370, 1031], [460, 1020], [560, 1022], [650, 1031], [730, 1043], [790, 1038], [834, 1008], [864, 972]];
  const fluke = [[864, 972], [898, 918], [930, 884], [946, 902], [932, 940], [905, 972], [952, 984], [978, 1004], [940, 1016], [884, 1012]];
  const low = [[884, 1012], [846, 1040], [780, 1078], [690, 1116], [590, 1150], [480, 1177], [380, 1190], [312, 1186], [268, 1172], [250, 1150]];
  stroke(spline(top, false, 3), { w: 6.5, speed: 1150, pressure: 0.95, kind: 'outline' });
  stroke(spline(fluke, false, 3), { w: 6, speed: 1000, pressure: 0.95, kind: 'outline' });
  stroke(spline(low, false, 3), { w: 6.5, speed: 1150, pressure: 0.95, kind: 'outline' });
  stroke(spline([[256, 1150], [300, 1160], [345, 1162], [392, 1150]]), { w: 4, speed: 900 });
  stroke(circle([362, 1112], 8, -1.2, 1.15, 26), { w: 3.6, speed: 500, wob: 0.2 });
  stroke(circle([362, 1112], 2.6, 0, 1.3, 10), { w: 3.4, speed: 300, wob: 0 });
  // blowhole spout: a fountain of curves, each ending in a drop
  const B = [392, 1026];
  for (let k = -3; k <= 3; k++) {
    const pts = [];
    for (let i = 0; i <= 24; i++) { const s = i / 24; pts.push([B[0] + k * 34 * s + k * 26 * s * s, B[1] - 178 * s + 70 * s * s * Math.abs(k) / 3 - 20 * s * (1 - Math.abs(k) / 3)]); }
    stroke(pts, { w: 4.2, flick: true, speed: 1500 });
    const e = pts[24];
    stroke(circle([e[0] + k * 6, e[1] + 14 + Math.abs(k) * 2], 2.2, 0, 1.2, 8), { w: 3.2, speed: 300, wob: 0 });
  }
  // belly pleats: lines following the throat
  const lowP = spline(low, false, 3).filter((p) => p[0] > 300 && p[0] < 700).reverse();
  for (let j = 1; j <= 7; j++) {
    const off = j * 9.5, cut0 = 0.06 * j, pts = [];
    lowP.forEach((p, i) => {
      const a = lowP[Math.max(i - 1, 0)], b = lowP[Math.min(i + 1, lowP.length - 1)], l = vlen(b[0] - a[0], b[1] - a[1]) || 1;
      pts.push([p[0] + ((b[1] - a[1]) / l) * off, p[1] - ((b[0] - a[0]) / l) * off]);
    });
    const n = pts.length;
    stroke(pts.slice(Math.floor(n * cut0), Math.floor(n * (0.92 - 0.04 * j))), { w: 3.2, speed: 1400 });
  }
  // back contour hatching, broken into dashes as the light falls off
  const topP = spline(top, false, 3).filter((p) => p[0] > 300 && p[0] < 830);
  for (let j = 1; j <= 5; j++) {
    const off = j * 13, pts = [];
    topP.forEach((p, i) => {
      const a = topP[Math.max(i - 1, 0)], b = topP[Math.min(i + 1, topP.length - 1)], l = vlen(b[0] - a[0], b[1] - a[1]) || 1;
      pts.push([p[0] - ((b[1] - a[1]) / l) * off, p[1] + ((b[0] - a[0]) / l) * off]);
    });
    const n = pts.length;
    let i = Math.floor(n * (0.05 + 0.03 * j + 0.03 * R()));
    while (i < n - 8) {
      const len = Math.floor(lerp(30, 70, R()) / (1 + j * 0.25));
      stroke(pts.slice(i, Math.min(i + len, n)), { w: 3.4 - j * 0.25, speed: 1500 });
      i += len + Math.floor(4 + j * 3 + R() * 8);
    }
  }
  // pectoral fin
  stroke(spline([[468, 1166], [500, 1196], [540, 1226], [572, 1244], [560, 1222], [530, 1190], [508, 1170]]), { w: 4.5, speed: 1000 });
  for (let j = 0; j < 4; j++) stroke([[488 + j * 9, 1176 + j * 4], [530 + j * 8, 1210 + j * 6]], { w: 2.6, speed: 1500 });
}

function sea() {
  // wave lines across, and spiral curls rolling off the crests
  const rows = [[1292, 0.0, 15], [1372, 1.7, 13], [1458, 3.1, 12], [1548, 4.4, 11]];
  rows.forEach(([y0, ph, amp], ri) => {
    const pts = [];
    for (let x = BOARD.x0 + 24; x <= BOARD.x1 - 24; x += 6) pts.push([x, y0 + amp * Math.sin(x / 68 + ph) + 5 * Math.sin(x / 23 + ph * 2)]);
    stroke(pts, { w: 4.4, speed: 1700, taper: 0.06 });
    for (let x0 = BOARD.x0 + 80 + ((ri * 47) % 90); x0 < BOARD.x1 - 70; x0 += 170 + R() * 50) {
      const crest = [x0, y0 + amp * Math.sin(x0 / 68 + ph) + 5 * Math.sin(x0 / 23 + ph * 2)];
      // the crest rolls over to the left: start on the wave line, up and over, spiralling inwards
      const r0 = 24 + R() * 8, C = [crest[0] - 0.2 * r0, crest[1] - 0.9 * r0], phi0 = Math.atan2(0.9, 0.2), rs = Math.hypot(0.2, 0.9) * r0, sp = [];
      for (let i = 0; i <= 44; i++) {
        const d = (i / 44) * Math.PI * 2.7, r = rs * Math.exp(-0.3 * d), th = phi0 - d;
        sp.push([C[0] + Math.cos(th) * r, C[1] + Math.sin(th) * r]);
      }
      stroke(sp, { w: 3.8, speed: 1300, wob: 0.3 });
    }
  });
  // reflections of the bursts on the water: short broken dashes
  for (const [cx, n] of [[640, 16], [300, 11], [860, 9]]) {
    for (let i = 0; i < n; i++) {
      const y = 1300 + R() * 330, half = (14 + R() * 26) * (1 - (y - 1300) / 600), x = cx + jit(60 + (y - 1300) * 0.15);
      stroke([[x - half, y], [x + half, y + jit(1.5)]], { w: 3, speed: 1600, wob: 0.2 });
    }
  }
}

function burst(c, Rr, n, { droop = 0.12, ring = true, dots = 0.5 } = {}) {
  const a0 = R() * 6.28;
  const order = Array.from({ length: n }, (_, i) => i);
  // the hand goes round, skipping across like a real flick sequence
  const seq = []; for (let i = 0; i < n; i += 2) seq.push(order[i]); for (let i = 1; i < n; i += 2) seq.push(order[i]);
  for (const i of seq) {
    const a = a0 + (i / n) * Math.PI * 2 + jit(0.04), r0 = Rr * (0.12 + 0.06 * R()), r1 = Rr * (0.8 + 0.25 * R());
    const pts = [];
    for (let k = 0; k <= 16; k++) { const s = k / 16, r = lerp(r0, r1, s); pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r + droop * Rr * s * s]); }
    stroke(pts, { w: 5.2, flick: true, speed: 2300, wob: 0.4 });
    if (R() < dots) {
      const e = pts[16], r2 = r1 + 14 + R() * 10;
      stroke(circle([c[0] + Math.cos(a) * r2, c[1] + Math.sin(a) * r2 + droop * Rr * 1.15], 2.4, 0, 1.2, 8), { w: 3.2, speed: 300, wob: 0 });
    }
  }
  if (ring) {
    for (let i = 0; i < Math.round(n / 2); i++) {
      const a = a0 + ((i + 0.5) / (n / 2)) * Math.PI * 2, r0 = Rr * 0.1, r1 = Rr * (0.38 + 0.1 * R()), pts = [];
      for (let k = 0; k <= 8; k++) { const s = k / 8, r = lerp(r0, r1, s); pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); }
      stroke(pts, { w: 3.2, flick: true, speed: 2000, wob: 0.2 });
    }
  }
  stroke(circle(c, Rr * 0.05 + 2, 0, 1.3, 14), { w: 4, speed: 400, wob: 0 });
}

function stars() {
  const S = [[120, 150], [470, 140], [930, 170], [980, 420], [150, 480], [420, 610], [560, 760], [990, 620], [110, 900], [380, 900], [700, 960], [940, 960], [520, 210], [780, 250]];
  for (const [x, y] of S) {
    const s = 9 + R() * 9, a = jit(0.3);
    stroke([[x - Math.cos(a) * s, y - Math.sin(a) * s], [x + Math.cos(a) * s, y + Math.sin(a) * s]], { w: 3.0, speed: 900, wob: 0 });
    stroke([[x + Math.sin(a) * s, y - Math.cos(a) * s], [x - Math.sin(a) * s, y + Math.cos(a) * s]], { w: 3.0, speed: 900, wob: 0 });
  }
}

/**
 * Build the strokes and schedule them in drawing time τ (the hand's own clock): each point gets τ, the stylus
 * lifts and travels between strokes. Returns { strokes, segs (instances), crumbs, tauEnd, stylusAt(τ) }.
 */
export function buildArt() {
  R = rand(4848); STROKES.length = 0;
  whale(); sea();
  burst([860, 742], 132, 22, { droop: 0.1 });
  burst([300, 334], 172, 26, { droop: 0.14 });
  burst([230, 690], 96, 18, { droop: 0.3, ring: false, dots: 0.8 });
  burst([640, 452], 255, 36, { droop: 0.12 });
  stars();

  let tau = 0;
  let prev = null;
  for (const S of STROKES) {
    const p0 = S.P[0];
    if (prev) tau += 0.035 + vlen(p0[0] - prev[0], p0[1] - prev[1]) / 3600;
    S.travelFrom = prev; S.tauStart = tau;
    S.tau = [tau];
    let L = 0;
    for (let i = 1; i < S.P.length; i++) {
      const a = S.P[i - 1], b = S.P[i], l = vlen(b[0] - a[0], b[1] - a[1]);
      L += l;
      // flicks accelerate away from the start; strokes start and end a little slower
      const u = i / (S.P.length - 1);
      const v = S.flick ? S.speed * (0.45 + 1.1 * u) : S.speed * (0.6 + 0.4 * Math.sin(Math.PI * clamp(u * 1.2 - 0.1)));
      tau += l / v;
      S.tau.push(tau);
    }
    S.L = L; S.tauEnd = tau;
    prev = S.P[S.P.length - 1];
  }
  const tauEnd = tau;

  // segment instances: p0, p1, w0, w1, τ0, τ1, seed, pressure
  const segs = [];
  STROKES.forEach((S, si) => {
    const n = S.P.length;
    for (let i = 0; i + 1 < n; i++) {
      segs.push([S.P[i][0], S.P[i][1], S.P[i + 1][0], S.P[i + 1][1], S.wa(i / (n - 1)), S.wa((i + 1) / (n - 1)), S.tau[i], S.tau[i + 1], si * 0.618 % 1, S.pressure]);
    }
  });

  // wax crumbs: flakes pushed out to both sides as the tip ploughs, a pile where the stylus lifts
  const crumbs = [];
  for (const S of STROKES) {
    const n = S.P.length;
    for (let i = 1; i < n; i++) {
      const a = S.P[i - 1], b = S.P[i], l = vlen(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l;
      const w = S.wa(i / (n - 1));
      const k = (l / 3.2) * (0.6 + 0.6 * S.pressure) * (w / 5);
      let cnt = Math.floor(k) + (R() < k % 1 ? 1 : 0);
      while (cnt-- > 0) {
        const side = R() < 0.5 ? -1 : 1, f = R();
        const x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f);
        const off = w * 0.5 + 0.8 + -Math.log(1 - R() * 0.97) * 2.6;
        const big = R() < 0.05;
        crumbs.push({ sx: x, sy: y, x: x + nx * side * off + jit(1), y: y + ny * side * off + jit(1), size: big ? 2.6 + R() * 2.6 : 0.7 + Math.pow(R(), 2) * 1.9, elong: big ? 1.6 + R() * 1.4 : 1 + R() * 0.7, rot: R() * 6.28, tau: lerp(S.tau[i - 1], S.tau[i], f), seed: R() });
      }
    }
    // the end pile
    const e = S.P[n - 1], d = S.P[n - 2], l = vlen(e[0] - d[0], e[1] - d[1]) || 1, ux = (e[0] - d[0]) / l, uy = (e[1] - d[1]) / l;
    const pile = Math.round(4 + 8 * S.pressure * (S.wa(1) / 4));
    for (let j = 0; j < pile; j++) {
      const f = R() * 7, s = jit(5);
      crumbs.push({ sx: e[0], sy: e[1], x: e[0] + ux * (3 + f) - uy * s, y: e[1] + uy * (3 + f) + ux * s, size: 0.9 + R() * 2.0, elong: 1 + R() * 1.2, rot: R() * 6.28, tau: S.tauEnd, seed: R() });
    }
  }

  // stylus position at τ: on a stroke, or lifted and travelling between strokes
  const stylusAt = (t) => {
    let lo = 0, hi = STROKES.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (STROKES[m].tauStart <= t) lo = m; else hi = m - 1; }
    const S = STROKES[lo];
    if (t < S.tauStart) {   // before the first stroke
      return { x: S.P[0][0], y: S.P[0][1], lift: 1, dx: 0, dy: -1 };
    }
    if (t <= S.tauEnd) {
      let a = 0, b = S.tau.length - 1;
      while (b - a > 1) { const m = (a + b) >> 1; if (S.tau[m] <= t) a = m; else b = m; }
      const f = clamp((t - S.tau[a]) / Math.max(S.tau[b] - S.tau[a], 1e-9));
      const p = S.P[a], q = S.P[b];
      return { x: lerp(p[0], q[0], f), y: lerp(p[1], q[1], f), lift: 0, dx: q[0] - p[0], dy: q[1] - p[1] };
    }
    const N = STROKES[lo + 1];
    const e = S.P[S.P.length - 1];
    if (!N) return { x: e[0], y: e[1], lift: clamp((t - S.tauEnd) / 0.15), dx: 0, dy: 0 };
    const s = N.P[0], u = clamp((t - S.tauEnd) / Math.max(N.tauStart - S.tauEnd, 1e-9));
    const k = u * u * (3 - 2 * u);
    return { x: lerp(e[0], s[0], k), y: lerp(e[1], s[1], k), lift: Math.sin(Math.PI * u), dx: s[0] - e[0], dy: s[1] - e[1] };
  };
  const kinds = STROKES.map((S) => ({ kind: S.kind, tauStart: S.tauStart, tauEnd: S.tauEnd }));
  return { segs, crumbs, tauEnd, stylusAt, kinds };
}
