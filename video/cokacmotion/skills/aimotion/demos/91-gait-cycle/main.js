/*
 * 91 · 눈 위의 박자 — locomotion as a pure function of phase, planted feet, footprints that keep the beat.
 *
 * A first-snow morning. A rabbit (far lane) hops and a blue hen (near lane) waddles across fresh snow toward the
 * sunrise. Both gaits are closed-form functions of t built on ONE track coordinate path(t) (a trapezoid speed profile):
 *   · every contact (a rabbit landing, a hen step) sits on a shared beat grid (hen = every 0.3 s, rabbit = every 0.6 s),
 *     and its footprint lands at path(contact + MS) — so the prints of both lanes line up like a score;
 *   · during stance a foot is a fixed world point (the print under it); the body is the thing that moves.
 *     Legs are two-bone IK from the hip to that point (bird hock bends back, rabbit knee bends forward);
 *   · rabbit: parabolic flights between landings, take-off stretch, landing squash, heel peeling off the planted toe,
 *     ears on a damped spring; hen: alternating swings, a side-to-side rock as a sine of step phase, and a head that
 *     holds still in world space then thrusts forward to the next hold (head stabilisation).
 * Each contact stamps a soft dent in the snow (+ a snow puff) and a mark on the rhythm strip below: pairs for the
 * rabbit, alternating singles for the hen. Climax: the two crossers stop and look back while a warm band of light
 * sweeps the tracks left→right; every print and its mark light up on its beat and the creatures nod along.
 * Then they walk off and the lit tracks stay.
 *
 * Everything is Canvas 2D; backgrounds, print sprites and the strip panel are painted once in setup.
 */
import { defineDemo, rand, clamp, lerp, smooth, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 10;
const W = 1080, H = 1920;
const PI = Math.PI, TAU = PI * 2;
const KR = `"${FONTS.pretendard.family}"`;

// ---------------------------------------------------------------- palette (morning snow, one accent per gait)
const INK = '#2A2E48';
const AMB = '#E5822A', AMB_T = '#D86A17';      // rabbit · 깡충
const BLU = '#3E6DBA', BLU_T = '#2F5EAA';      // hen · 뒤뚱
const GOLD = '#FFC56E';

// ---------------------------------------------------------------- small math
const bump = (u) => (u <= 0 || u >= 1 ? 0 : Math.sin(PI * u));
const outBack = (p, c = 1.7) => ease.outBack(clamp(p), c);
const hermite = (a, b, ma, mb, u) => {
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * a + (u3 - 2 * u2 + u) * ma + (-2 * u3 + 3 * u2) * b + (u3 - u2) * mb;
};
/** two-bone IK: joint between hip (hx,hy) and foot (fx,fy); side +1 bends to the -x side of a downward leg (bird hock) */
function ik(hx, hy, fx, fy, l1, l2, side) {
  const dx = fx - hx, dy = fy - hy, d = Math.hypot(dx, dy) || 1e-6;
  if (d >= (l1 + l2) * 0.999) { const k = l1 / (l1 + l2); return [hx + dx * k, hy + dy * k]; }
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = dx / d, uy = dy / d;
  return [hx + ux * a - uy * hh * side, hy + uy * a + ux * hh * side];
}

// ================================================================ the track: one closed-form path for both crossers
// walk in from off-screen at cruising speed, slow to a stop at XS, rest, then set off again and leave the frame
const V = 272;                 // cruising speed, px/s
const BEAT = 0.3;              // hen step period; a rabbit hop takes two beats
const GRID0 = -1.8;            // the beat grid origin (contacts happen at GRID0 + k·BEAT)
const MS = 0.165;              // a print lands where the track is half a stance later (mid-stance)
const XS = 905;                // where the walk stops
const S1 = { t0: GRID0, t1: 3.85, rin: 0, rout: 0.55 };
S1.x1 = XS; S1.x0 = XS - V * (S1.t1 - S1.t0 - S1.rout / 2);
const S2 = { t0: 7.55, t1: 9.75, rin: 0.45, rout: 0, x0: XS };
S2.x1 = XS + V * (S2.t1 - S2.t0 - S2.rin / 2);
/** trapezoidal-velocity segment: constant speed between an accel ramp rin and a decel ramp rout */
function segPos(S, t) {
  const T = S.t1 - S.t0, vm = (S.x1 - S.x0) / (T - S.rin / 2 - S.rout / 2), u = t - S.t0;
  if (u <= 0) return S.x0 + (S.rin ? 0 : vm * u);
  if (u < S.rin) return S.x0 + (vm * u * u) / (2 * S.rin);
  if (u <= T - S.rout) return S.x0 + vm * (u - S.rin / 2);
  if (u <= T) return S.x1 - (vm * (T - u) ** 2) / (2 * S.rout);
  return S.x1 + (S.rout ? 0 : vm * (u - T));
}
const path = (t) => (t < S2.t0 ? segPos(S1, t) : segPos(S2, t));

// ================================================================ the sweep (climax): a band of light plays the tracks back
const SW0 = 4.5, SW1 = 6.9, SX0 = 40, SX1 = 1040;
const sweepX = (t) => SX0 + ((t - SW0) / (SW1 - SW0)) * (SX1 - SX0);
const fireAt = (x) => SW0 + ((x - SX0) / (SX1 - SX0)) * (SW1 - SW0);

// ================================================================ hen (near lane): alternating steps, rock, head stabilisation
const HEN = { lane: 1335, s: 1.0, ST: 0.33, SWING: 0.24, lift: 17, thrust: 0.11, depth: 7, hip: [0, -52], l1: 36, l2: 40,
  head: [46, -148], neck: [22, -112] };
const hen = { plants: [[], []], contacts: [] };
for (let k = 0; GRID0 + k * BEAT < D + 1.5; k++) {
  const c = GRID0 + k * BEAT, f = k % 2, x = path(c + MS) - 6;     // root sits 6 px behind the print centre
  const arr = hen.plants[f], last = arr[arr.length - 1];
  if (last && Math.abs(x - last.x) < 4) continue;                 // a foot that would not move does not step
  const p = { t: c, x, f, k };
  arr.push(p); hen.contacts.push(p);
}
hen.contacts.sort((a, b) => a.t - b.t);
for (const arr of hen.plants) arr.forEach((p, j) => {
  const n = arr[j + 1];
  p.next = n || null;
  p.up = n ? Math.max(p.t + 0.12, n.t - HEN.SWING) : Infinity;
});
hen.contacts.forEach((p, j) => {
  const prev = hen.contacts[j - 1];
  p.len = prev ? Math.abs(p.x - prev.x) : 82;
  p.amp = clamp(p.len / 82);
});
// head holds: the head reaches hold j at contact j and stays there (world space) until the next thrust
const henRoot = (t) => path(t) - 6;
hen.contacts.forEach((p, j) => {
  const n = hen.contacts[j + 1];
  const mid = n ? (p.t + n.t - HEN.thrust) / 2 : p.t + 0.3;
  p.hold = henRoot(mid) + HEN.head[0] * HEN.s;
});

function lastIndex(arr, t, key = 't') {   // last element with arr[i][key] <= t (arrays are short: linear scan)
  let j = -1;
  for (let i = 0; i < arr.length; i++) { if (arr[i][key] <= t) j = i; else break; }
  return j;
}
function henFoot(f, t) {
  const arr = hen.plants[f], j = lastIndex(arr, t);
  if (j < 0) return { x: arr[0].x - 120, y: 0, sw: 0 };
  const p = arr[j];
  if (t <= p.up || !p.next) return { x: p.x, y: 0, sw: 0 };
  const u = (t - p.up) / (p.next.t - p.up), d = Math.abs(p.next.x - p.x);
  return { x: lerp(p.x, p.next.x, smooth(u)), y: -HEN.lift * clamp(d / 50, 0.35, 1) * Math.sin(PI * u), sw: Math.sin(PI * u) };
}
function henBody(t) {
  const j = lastIndex(hen.contacts, t);
  let rock = 0, bob = 0;
  if (j >= 0) {
    const p = hen.contacts[j], u = (t - p.t) / BEAT;
    if (u < 1) { const s = Math.sin(PI * u) * p.amp; rock = (p.f ? -1 : 1) * 0.085 * s; bob = 4.5 * s; }
  }
  return { rock, bob };
}
/** world x of the head: holds still, then thrusts to the next hold, ending exactly on each contact */
function henHeadX(t) {
  const C = hen.contacts;
  for (let j = 0; j < C.length; j++) {
    const p = C[j], t0 = p.t - HEN.thrust;
    if (t < t0) return j === 0 ? henRoot(t) + HEN.head[0] : C[j - 1].hold;
    if (t <= p.t) {
      const from = j === 0 ? henRoot(t0) + HEN.head[0] : C[j - 1].hold;
      return lerp(from, p.hold, smooth((t - t0) / HEN.thrust));
    }
  }
  return C[C.length - 1].hold;
}

// ================================================================ rabbit (far lane): hops between planted landings
const RAB = { lane: 1045, s: 0.9, L: 46, depth: 9, hip: [-22, -42], l1: 34, l2: 40 };
const rL = RAB.L * RAB.s;
const hops = [];
for (let i = 0; GRID0 + i * 2 * BEAT < D + 1.5; i++) {
  const b = GRID0 + i * 2 * BEAT;
  const heel = path(b + MS) - rL / 2;                              // print centre on the same track as the hen's
  const prev = hops[hops.length - 1], d = prev ? heel - prev.heel : 164;
  if (prev && d < 12) continue;
  const e = clamp(d / 164, 0, 1.1);
  hops.push({ b, heel, d, e, fl: 0.22 + 0.18 * e, h: 14 + 64 * e });
}
hops.forEach((h) => { h.a = h.b - h.fl; });
const rTake = (e) => (44 + 30 * e) * RAB.s, rLand = (e) => (44 - 12 * e) * RAB.s, rMid = 44 * RAB.s;
const liftOf = (e) => 34 * e * RAB.s, phiMax = (e) => 1.05 * clamp(e);
const landCurve = (tau) => { const u = tau / 0.16; return u <= 0 || u >= 1 ? 0 : u < 0.25 ? smooth(u / 0.25) : 1 - smooth((u - 0.25) / 0.75); };
const takeCurve = (u) => (u <= 0 ? 0 : u < 0.5 ? -0.5 * smooth(u / 0.5) : lerp(-0.5, 0.7, smooth((u - 0.5) / 0.5)));

function flightRoot(n, p) {
  const h = hops[n], prev = hops[n - 1];
  const X0 = prev.heel + rTake(h.e), X1 = h.heel + rLand(h.e);
  return [lerp(X0, X1, p), lerp(-liftOf(h.e), 0, p) - 4 * h.h * RAB.s * p * (1 - p)];
}
/** the whole rabbit at time t: root (world x, height), squash, pitch, near-foot heel (world) + angle, paw lift */
function rabbitAt(t) {
  let n = lastIndex(hops, t, 'a');
  if (n < 0) n = 0;
  const h = hops[n];
  if (n > 0 && t < h.b) {                                          // ---- flight of hop n
    const p = (t - h.a) / h.fl, prev = hops[n - 1];
    const [x, y] = flightRoot(n, p);
    const sq = h.e * (0.7 * (1 - smooth(p / 0.45)) + 0.3 * smooth((p - 0.5) / 0.3) * (1 - smooth((p - 0.85) / 0.15)));
    const pitch = -0.2 * h.e * (1 - 2 * p);
    const toe0 = prev.heel + rL, ph0 = phiMax(h.e);
    const H0 = [toe0 - rL * Math.cos(ph0), -rL * Math.sin(ph0)];
    const [xm, ym] = flightRoot(n, 0.42);
    const HM = [xm - 58 * RAB.s, ym - 16 * RAB.s];
    const H1 = [h.heel, 0];
    const mt = [(H1[0] - H0[0]) * 1.0, (H1[1] - H0[1]) * 1.0];
    let hx, hy, phi;
    if (p < 0.42) {
      const u = p / 0.42;
      hx = hermite(H0[0], HM[0], 0, mt[0] * 0.42, u); hy = hermite(H0[1], HM[1], 0, mt[1] * 0.42, u);
      phi = lerp(ph0, 0.4, smooth(u));
    } else {
      const u = (p - 0.42) / 0.58;
      hx = hermite(HM[0], H1[0], mt[0] * 0.58, 0, u); hy = hermite(HM[1], H1[1], mt[1] * 0.58, 0, u);
      phi = lerp(0.4, 0, smooth(u));
    }
    return { x, y, sq, pitch, heel: [hx, hy], phi, air: Math.sin(PI * p), n, flying: true, height: -y };
  }
  // ---- stance after landing n (feet planted: the toe never moves; the heel peels up before take-off)
  const nx = hops[n + 1];
  const X0 = h.heel + rLand(h.e), tau = t - h.b;
  let x, y = 0, sq = -0.85 * h.e * landCurve(tau), pitch = 0.2 * h.e * (1 - smooth(tau / 0.12)), phi = 0;
  if (!nx) x = X0 + (h.heel + rMid - X0) * ease.outCubic(clamp(tau / 0.22));
  else {
    const X1 = h.heel + rTake(nx.e), Ds = nx.a - h.b, sg = nx.a - t;
    const uT = clamp(1 - sg / 0.2);
    if (Ds <= 0.35) {
      const prev = hops[n - 1];
      const vin = prev ? (X0 - (prev.heel + rTake(h.e))) / h.fl : V;
      const vout = (nx.heel + rLand(nx.e) - X1) / nx.fl;
      x = hermite(X0, X1, vin * Ds, vout * Ds, clamp(tau / Ds));
    } else {
      const Xr = h.heel + rMid;
      x = X0 + (Xr - X0) * ease.outCubic(clamp(tau / 0.22)) + (X1 - Xr) * ease.inCubic(clamp(1 - sg / 0.22));
    }
    y = -liftOf(nx.e) * smooth((uT - 0.4) / 0.6);
    sq += takeCurve(uT) * nx.e;
    pitch -= 0.2 * nx.e * smooth((uT - 0.6) / 0.4);
    phi = phiMax(nx.e) * smooth((uT - 0.5) / 0.5);
  }
  const toe = h.heel + rL;
  return { x, y, sq: clamp(sq, -1, 1), pitch, heel: [toe - rL * Math.cos(phi), -rL * Math.sin(phi)], phi, air: 0, n, flying: false, height: -y,
    rest: !nx || nx.a - h.b > 0.35 };
}

// ================================================================ contacts → prints, puffs, strip marks, beats
const PRINTS = [];     // { t, x, y, kind, fire }
const MARKS = [];      // { t, x, kind, side, fire }
const R_BEATS = [], H_BEATS = [];
const SX_LO = 152, SX_HI = 1012;      // strip window
for (const h of hops) {
  if (h === hops[0]) continue;
  const cx = h.heel + rL / 2;
  PRINTS.push({ t: h.b, x: h.heel, y: RAB.lane + RAB.depth, kind: 'r', cx });
  PRINTS.push({ t: h.b, x: h.heel + 6 * RAB.s, y: RAB.lane - RAB.depth, kind: 'r', cx });
  MARKS.push({ t: h.b, x: cx, kind: 'r' });
  if (cx < 1110) R_BEATS.push({ t: h.b, pre: h.fl });          // the words stop once the crosser is gone
}
for (const p of hen.contacts) {
  const cx = p.x + 6;
  PRINTS.push({ t: p.t, x: p.x, y: HEN.lane + (p.f ? HEN.depth : -HEN.depth), kind: 'h', cx, rot: p.f ? -0.14 : 0.14 });   // a little toe-in
  MARKS.push({ t: p.t, x: cx, kind: 'h', side: p.f ? 1 : -1 });
  if (cx < 1110) H_BEATS.push({ t: p.t });
}
for (const q of PRINTS) q.fire = Math.max(fireAt(q.cx), q.t);
for (const m of MARKS) m.fire = Math.max(fireAt(m.x), m.t);
// the playback is a beat too: creatures and words answer each mark as the light crosses it
const R_SWEEP = MARKS.filter((m) => m.kind === 'r' && m.fire > m.t + 0.01 && m.x > SX_LO && m.x < SX_HI).map((m) => m.fire);
const H_SWEEP = MARKS.filter((m) => m.kind === 'h' && m.fire > m.t + 0.01 && m.x > SX_LO && m.x < SX_HI).map((m) => m.fire);
for (const f of R_SWEEP) R_BEATS.push({ t: f, pre: 0.2, sweep: true });
for (const f of H_SWEEP) H_BEATS.push({ t: f, sweep: true });
R_BEATS.sort((a, b) => a.t - b.t); H_BEATS.sort((a, b) => a.t - b.t);
const ARRIVE = fireAt(XS + 10);     // the light reaches the two at the end of their tracks

// ================================================================ painters (setup)
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU); }

function paintLand(g) {
  const R = rand(9101);
  // far hills (two layers, snowy tops lit from the right)
  const hill = (base, amp, seed, top, bot, rim) => {
    const r = rand(seed), ph = [r() * TAU, r() * TAU, r() * TAU];
    const yAt = (x) => base - amp * (0.55 + 0.25 * Math.sin(x * 0.004 + ph[0]) + 0.15 * Math.sin(x * 0.011 + ph[1]) + 0.05 * Math.sin(x * 0.027 + ph[2]));
    g.beginPath(); g.moveTo(-20, 1000);
    for (let x = -20; x <= W + 20; x += 8) g.lineTo(x, yAt(x));
    g.lineTo(W + 20, 1000); g.closePath();
    const gr = g.createLinearGradient(0, base - amp, 0, base + 40);
    gr.addColorStop(0, top); gr.addColorStop(1, bot);
    g.fillStyle = gr; g.fill();
    g.strokeStyle = rim; g.lineWidth = 3; g.beginPath();
    for (let x = -20; x <= W + 20; x += 8) x === -20 ? g.moveTo(x, yAt(x) + 1) : g.lineTo(x, yAt(x) + 1);
    g.stroke();
  };
  hill(820, 150, 11, '#DCE1F1', '#C3CBE6', 'rgba(255,240,226,.7)');
  hill(872, 92, 12, '#D2D9EE', '#BAC4E2', 'rgba(255,244,232,.8)');
  // pines: two rows, stacked rounded tiers with snow on each tier
  const pine = (x, base, h, col, snow) => {
    const w = h * 0.46;
    g.fillStyle = col;
    g.fillRect(x - w * 0.06, base - h * 0.16, w * 0.12, h * 0.18);
    for (let k = 0; k < 3; k++) {
      const ty = base - h * (0.12 + k * 0.27), tw = w * (1 - k * 0.24), th = h * 0.42;
      g.beginPath();
      g.moveTo(x, ty - th);
      g.quadraticCurveTo(x + tw * 0.18, ty - th * 0.45, x + tw * 0.5, ty);
      g.quadraticCurveTo(x, ty + th * 0.1, x - tw * 0.5, ty);
      g.quadraticCurveTo(x - tw * 0.18, ty - th * 0.45, x, ty - th);
      g.fillStyle = col; g.fill();
      g.beginPath();     // snow cap on the tier
      g.moveTo(x - tw * 0.42, ty - th * 0.02);
      g.quadraticCurveTo(x, ty - th * 0.18, x + tw * 0.42, ty - th * 0.02);
      g.quadraticCurveTo(x, ty + th * 0.06, x - tw * 0.42, ty - th * 0.02);
      g.fillStyle = snow; g.fill();
      g.beginPath(); ell(g, x, ty - th * 0.82, tw * 0.09, th * 0.08); g.fill();
    }
  };
  for (let i = 0; i < 30; i++) { const x = -30 + i * 39 + R() * 20; pine(x, 884 + R() * 8, 60 + R() * 60, '#A5B2D6', '#EEF1FA'); }
  for (let i = 0; i < 16; i++) {
    const x = -20 + i * 74 + R() * 34;
    if (x > 690 && x < 980) continue;                // leave the sunrise open
    pine(x, 900 + R() * 10, 100 + R() * 70, '#7E91BE', '#F3F5FC');
  }
  // the snow field
  const gf = g.createLinearGradient(0, 880, 0, 1600);
  gf.addColorStop(0, '#E2E7F4'); gf.addColorStop(0.35, '#EEF1F8'); gf.addColorStop(1, '#F6F7FB');
  g.fillStyle = gf;
  g.beginPath(); g.moveTo(0, 892);
  for (let x = 0; x <= W; x += 10) g.lineTo(x, 892 + 6 * Math.sin(x * 0.012) + 4 * Math.sin(x * 0.031 + 1));
  g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  // soft drifts between the lanes: lit crest, blue lee
  const drift = (y0, amp, seed, sh) => {
    const r = rand(seed), a = r() * TAU, b = r() * TAU;
    const yAt = (x) => y0 + amp * Math.sin(x * 0.006 + a) + amp * 0.5 * Math.sin(x * 0.017 + b);
    g.beginPath(); g.moveTo(-10, yAt(-10));
    for (let x = -10; x <= W + 10; x += 10) g.lineTo(x, yAt(x));
    for (let x = W + 10; x >= -10; x -= 10) g.lineTo(x, yAt(x) + sh);
    g.closePath();
    const gr = g.createLinearGradient(0, y0 - amp, 0, y0 + amp + sh);
    gr.addColorStop(0, 'rgba(196,207,232,0.55)'); gr.addColorStop(1, 'rgba(196,207,232,0)');
    g.fillStyle = gr; g.fill();
    g.beginPath(); g.moveTo(-10, yAt(-10) - 1.5);
    for (let x = -10; x <= W + 10; x += 10) g.lineTo(x, yAt(x) - 1.5);
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 3; g.stroke();
  };
  drift(955, 9, 21, 26);
  drift(1170, 12, 22, 34);
  drift(1418, 14, 23, 40);
  // snow grain
  for (let i = 0; i < 2200; i++) {
    const y = 900 + Math.pow(R(), 0.8) * 700, x = R() * W, near = (y - 900) / 700;
    g.fillStyle = R() < 0.5 ? `rgba(150,165,205,${0.08 + 0.1 * near})` : `rgba(255,255,255,${0.5 + 0.4 * near})`;
    g.beginPath(); g.arc(x, y, 0.6 + near * 1.3 * R(), 0, TAU); g.fill();
  }
  // near foreground in the shade of trees behind us (also the dark base the caption sits on)
  g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 10) g.lineTo(x, 1572 + 18 * Math.sin(x * 0.009 + 0.6) + 10 * Math.sin(x * 0.023 + 2.1) + 6 * Math.sin(x * 0.051));
  g.lineTo(W, H); g.closePath();
  const gs = g.createLinearGradient(0, 1560, 0, H);
  gs.addColorStop(0, '#9AA8D2'); gs.addColorStop(0.25, '#7D8DC0'); gs.addColorStop(1, '#4E5B8E');
  g.fillStyle = gs; g.fill();
  for (let i = 0; i < 500; i++) {
    const x = R() * W, y = 1600 + R() * 320;
    g.fillStyle = `rgba(220,228,250,${0.1 + 0.25 * R()})`;
    g.beginPath(); g.arc(x, y, 0.8 + R() * 1.8, 0, TAU); g.fill();
  }
}

function paintFront(g) {
  // two near snow mounds framing the field, dry grass poking out of the left one
  const mound = (cx, cy, rx, ry) => {
    g.save();
    const gr = g.createLinearGradient(0, cy - ry, 0, cy + ry);
    gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.55, '#E8EDF8'); gr.addColorStop(1, '#AEBADF');
    g.fillStyle = gr; ell(g, cx, cy, rx, ry); g.fill();
    g.fillStyle = 'rgba(255,248,236,0.8)'; ell(g, cx + rx * 0.12, cy - ry * 0.72, rx * 0.55, ry * 0.18); g.fill();
    g.restore();
  };
  const R = rand(9102);
  g.lineCap = 'round';
  for (let i = 0; i < 11; i++) {
    const x = 30 + R() * 190, h = 60 + R() * 90, lean = (R() - 0.35) * 40;
    g.strokeStyle = R() < 0.5 ? '#C9A26A' : '#B48A54'; g.lineWidth = 3 + R() * 2;
    g.beginPath(); g.moveTo(x, 1452); g.quadraticCurveTo(x + lean * 0.3, 1452 - h * 0.6, x + lean, 1452 - h); g.stroke();
    if (R() < 0.6) { g.fillStyle = '#D8B47A'; ell(g, x + lean, 1452 - h, 4, 9, lean * 0.02); g.fill(); }
  }
  mound(70, 1500, 250, 104);
  mound(1050, 1508, 220, 96);
}

/** a footprint as a soft dent: raised lit lip, shaded wall toward the sun, lighter floor */
function printSprite(kind, lit) {
  const [c, g] = mk(96, 48);
  const ox = 22, oy = 24, SQ = kind === 'r' ? 0.62 : 0.72;
  const shape = (grow, dx, dy) => {
    g.beginPath();
    if (kind === 'r') {            // long hind-foot print, heel at the origin, toes toward +x
      const Lp = rL + grow * 2, wh = (5 + grow) * SQ * 2, wt = (8.5 + grow) * SQ * 2;
      const x0 = ox - grow + dx, y0 = oy + dy;
      g.moveTo(x0, y0);
      g.bezierCurveTo(x0, y0 - wh, x0 + Lp * 0.55, y0 - wt * 1.05, x0 + Lp * 0.86, y0 - wt * 0.9);
      g.bezierCurveTo(x0 + Lp * 1.04, y0 - wt * 0.7, x0 + Lp * 1.04, y0 + wt * 0.7, x0 + Lp * 0.86, y0 + wt * 0.9);
      g.bezierCurveTo(x0 + Lp * 0.55, y0 + wt * 1.05, x0, y0 + wh, x0, y0);
      g.fill();
    } else {                       // a round pad and three toes that bend outward at the tips (ψ), no back toe: not an arrow
      const L = 24, x0 = ox + dx, y0 = oy + dy, q = SQ;
      g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 5.5 + grow * 2;
      g.moveTo(x0 + 3, y0); g.quadraticCurveTo(x0 + L * 0.6, y0 + 1, x0 + L, y0);
      g.moveTo(x0 + 2, y0 - 3 * q); g.quadraticCurveTo(x0 + L * 0.5, y0 - 4 * q, x0 + L * 0.74, y0 - L * 0.72 * q);
      g.moveTo(x0 + 2, y0 + 3 * q); g.quadraticCurveTo(x0 + L * 0.5, y0 + 4 * q, x0 + L * 0.74, y0 + L * 0.72 * q);
      g.stroke();
      g.beginPath(); ell(g, x0 + 1, y0, 7.5 + grow, (7.5 + grow) * q * 1.15); g.fill();
    }
  };
  const paint = (col, grow, dx, dy) => { g.fillStyle = col; g.strokeStyle = col; shape(grow, dx, dy); };
  if (!lit) {
    paint('rgba(255,255,255,0.75)', 1.2, 0.9, 1.3);      // lip catching the light
    paint('#A9B8DA', 0, 0, 0);                            // the dent's shaded wall
    paint('#CFD8EC', -1.8, -1.6, 1.1);                     // lighter floor, shadow kept on the sun side
  } else {
    paint('rgba(255,250,236,0.85)', 1.2, 0.9, 1.3);
    paint('#E39A4E', 0, 0, 0);
    paint('#FFD08A', -1.8, -1.6, 1.1);
  }
  return { c, ox, oy };
}

function glowSprite(col, r = 48) {
  const [c, g] = mk(r * 2, r * 2);
  const gr = g.createRadialGradient(r, r, 0, r, r, r);
  gr.addColorStop(0, col.replace('A', '1')); gr.addColorStop(0.4, col.replace('A', '0.45')); gr.addColorStop(1, col.replace('A', '0'));
  g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2);
  return c;
}

// ---------------------------------------------------------------- the creatures
const C_R = { fur: '#B48D6E', furD: '#977459', furS: '#A7805F', belly: '#F4E8D7', ear: '#F0B3A6', nose: '#E68A8E', eye: '#2B2433', tail: '#FFFFFF' };
const C_H = { body: '#8E9CBB', breast: '#9AA8C6', wing: '#71809F', wingD: '#5F6D90', tail: '#465273', tail2: '#56638A',
  comb: '#E1463B', wattle: '#D63C33', beak: '#F2A93A', leg: '#EFAE38', legD: '#D29530', thigh: '#8391B2', thighD: '#717E9E', lace: '#7C8AAB' };

function drawRabbit(g, P, t, lookB, earExtra, blink) {
  const s = RAB.s, X = P.x, Y = RAB.lane;
  // long morning shadow (sun on the right)
  const hgt = P.height || 0;
  g.fillStyle = `rgba(92,110,170,${0.2 * (1 - clamp(hgt / 160) * 0.6)})`;
  ell(g, X - 46 * s, Y + 2, 96 * s * (1 - clamp(hgt / 300)), 11 * s, 0); g.fill();

  g.save();
  g.translate(X, Y);
  g.scale(s, s);
  const ry = P.y / s;
  const sq = P.sq, sx = sq < 0 ? 1 - 0.13 * sq : 1 + 0.12 * sq, sy = sq < 0 ? 1 + 0.2 * sq : 1 - 0.05 * sq, pv = [-10, -45];
  const st = Math.max(0, sq);          // stretched: the head reaches forward along the body line
  const xf = (x, y) => {               // the body transform, applied to a point (same order as the canvas calls)
    x *= sx; y *= sy;
    x -= pv[0]; y -= pv[1];
    const c = Math.cos(P.pitch), sn = Math.sin(P.pitch);
    return [c * x - sn * y + pv[0], sn * x + c * y + pv[1] + ry];
  };
  const hip = xf(RAB.hip[0], RAB.hip[1]);
  const heelL = [(P.heel[0] - X) / s, P.heel[1] / s];
  const leg = (dx, dy, col, colFoot) => {
    const hx = hip[0] + dx * 0.5, hy = hip[1] + dy * 0.3;
    const fx = heelL[0] + dx, fy = heelL[1] + dy;
    const [kx, ky] = ik(hx, hy, fx, fy, RAB.l1, RAB.l2, -1);
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = col; g.lineWidth = 17;
    g.beginPath(); g.moveTo(hx, hy); g.lineTo(kx, ky); g.lineTo(fx, fy); g.stroke();
    const tx = fx + RAB.L * Math.cos(P.phi), ty = fy + RAB.L * Math.sin(P.phi);
    g.strokeStyle = colFoot; g.lineWidth = 13;
    g.beginPath(); g.moveTo(fx, fy - 4); g.lineTo(tx - 2, ty - 5); g.stroke();
    g.fillStyle = colFoot; ell(g, tx - 4, ty - 5.5, 9, 7, P.phi); g.fill();
  };
  // far hind leg (behind the body; offset in depth: 4 px ahead, 6 px up on screen)
  leg(6, -RAB.depth / s, C_R.furD, C_R.furD);

  g.save();
  g.translate(0, ry);
  g.translate(pv[0], pv[1]); g.rotate(P.pitch); g.translate(-pv[0], -pv[1]);
  g.scale(sx, sy);
  // head anchor (for the ears too)
  const HX = 46 + 14 * st, HY = -92 + 16 * st;
  const earBase = -0.42 - 0.22 * st + 0.22 * Math.max(0, -sq) + earExtra;
  const ear = (ax, ay, rot, col, inner, len) => {
    g.save(); g.translate(ax, ay); g.rotate(rot);
    g.fillStyle = col; ell(g, 0, -len / 2, 12.5, len / 2); g.fill();
    if (inner) { g.fillStyle = inner; ell(g, 1.5, -len / 2 + 4, 6, len / 2 - 9); g.fill(); }
    g.restore();
  };
  const flip = Math.cos(PI * lookB);
  const headGroup = (fn) => { g.save(); g.translate(HX, HY); g.scale(flip, 1); g.translate(-HX, -HY); fn(); g.restore(); };
  headGroup(() => ear(HX - 10, HY - 20, earBase - 0.18, C_R.furD, null, 70));
  // tail, body, haunch, chest
  g.fillStyle = '#DCE3F2'; ell(g, -58, -55, 14, 13); g.fill();
  g.fillStyle = C_R.tail; ell(g, -60, -58, 13, 12); g.fill();
  g.fillStyle = C_R.fur; ell(g, -2, -55, 55, 38, -0.12); g.fill();
  g.fillStyle = C_R.furS; ell(g, -26, -46, 33, 32); g.fill();
  g.fillStyle = C_R.fur; ell(g, -24, -50, 29, 28); g.fill();
  g.fillStyle = C_R.fur; ell(g, 28, -58, 26, 28); g.fill();
  g.fillStyle = C_R.belly; ell(g, 26, -42, 20, 15, 0.2); g.fill();
  // front paws: tucked in flight, down when resting
  const pawY = -5 - 16 * P.air + (P.rest ? 3 : 0);
  g.fillStyle = C_R.furD; ell(g, 30, pawY - 1, 10, 6.5); g.fill();
  g.fillStyle = C_R.fur; ell(g, 39, pawY, 11, 7); g.fill();
  // head
  headGroup(() => {
    g.fillStyle = C_R.fur; ell(g, HX, HY, 28, 27); g.fill();
    ell(g, HX + 8, HY + 10, 21, 18); g.fill();
    g.fillStyle = C_R.belly; ell(g, HX + 20, HY + 8, 12, 9.5); g.fill();
    g.fillStyle = C_R.nose; ell(g, HX + 30, HY + 3, 4.6, 3.6); g.fill();
    g.fillStyle = 'rgba(240,150,150,0.35)'; ell(g, HX + 6, HY + 12, 7, 4); g.fill();
    if (blink) { g.strokeStyle = C_R.eye; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(HX + 6, HY - 5); g.lineTo(HX + 16, HY - 5); g.stroke(); }
    else {
      g.fillStyle = C_R.eye; ell(g, HX + 11, HY - 5, 5.6, 6.2); g.fill();
      g.fillStyle = '#FFFFFF'; ell(g, HX + 13, HY - 7.5, 2, 2); g.fill();
    }
    ear(HX, HY - 22, earBase, C_R.fur, C_R.ear, 76);
  });
  g.restore();
  // near hind leg over the haunch
  leg(0, RAB.depth / s, C_R.fur, '#C29C7C');
  g.restore();
}

function drawHen(g, t, lookB, nod, flap) {
  const s = HEN.s, X = henRoot(t), Y = HEN.lane;
  const { rock, bob } = henBody(t);
  g.fillStyle = 'rgba(92,110,170,0.2)';
  ell(g, X - 52 * s, Y + 3, 100 * s, 12 * s, 0); g.fill();
  g.save();
  g.translate(X, Y); g.scale(s, s);
  const piv = [0, -20];
  const bx = (x, y) => {                    // body transform for points: bob up, rock about the pivot
    y -= bob;
    x -= piv[0]; y -= piv[1];
    const c = Math.cos(rock), sn = Math.sin(rock);
    return [c * x - sn * y + piv[0], sn * x + c * y + piv[1]];
  };
  const hip = bx(HEN.hip[0], HEN.hip[1]);
  const foot = (f) => { const q = henFoot(f, t); return [(q.x - X) / s, q.y / s + (f ? HEN.depth : -HEN.depth), q.sw]; };
  const leg = (f, thighCol, legCol) => {
    const [fx, fy, sw] = foot(f);
    const hx = hip[0] + (f ? 4 : -4), hy = hip[1];
    const [jx, jy] = ik(hx, hy, fx, fy, HEN.l1, HEN.l2, 1);
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = thighCol; g.lineWidth = 20;
    g.beginPath(); g.moveTo(hx, hy); g.lineTo(lerp(hx, jx, 0.75), lerp(hy, jy, 0.75)); g.stroke();
    g.strokeStyle = legCol; g.lineWidth = 7.5;
    g.beginPath(); g.moveTo(lerp(hx, jx, 0.6), lerp(hy, jy, 0.6)); g.lineTo(jx, jy); g.lineTo(fx, fy); g.stroke();
    // toes: flat on the snow in stance, curled in swing
    const curl = sw * 0.9;
    g.lineWidth = 5.5;
    g.beginPath();
    g.moveTo(fx, fy); g.lineTo(fx + 21 * Math.cos(curl), fy + 21 * Math.sin(curl));
    g.moveTo(fx, fy); g.lineTo(fx + 16 * Math.cos(curl + 0.12), fy + 2 + 16 * Math.sin(curl + 0.12));
    g.moveTo(fx, fy); g.lineTo(fx - 4, fy - 1 - 3 * curl);
    g.stroke();
  };
  leg(0, C_H.thighD, C_H.legD);       // far leg first
  g.save();
  g.translate(0, -bob);
  g.translate(piv[0], piv[1]); g.rotate(rock); g.translate(-piv[0], -piv[1]);
  // tail feathers (wobble after each step)
  let wob = 0;
  for (const p of hen.contacts) { const u = t - p.t; if (u > 0 && u < 0.8) wob += 0.06 * p.amp * Math.exp(-u / 0.16) * Math.sin(u * 26); }
  const feather = (cx, cy, rot, col, ry2) => { g.save(); g.translate(-48, -104); g.rotate(wob); g.translate(48, 104); g.fillStyle = col; ell(g, cx, cy, 12, ry2, rot); g.fill(); g.restore(); };
  feather(-70, -128, -0.95, C_H.tail2, 30);
  feather(-62, -138, -0.55, C_H.tail, 36);
  feather(-52, -142, -0.2, C_H.tail2, 32);
  // body
  g.fillStyle = C_H.body; ell(g, -6, -90, 58, 45); g.fill();
  g.fillStyle = C_H.breast; ell(g, 24, -96, 34, 38); g.fill();
  g.strokeStyle = C_H.lace; g.lineWidth = 3; g.lineCap = 'round';
  for (const [lx, ly] of [[16, -104], [32, -92], [18, -80], [34, -112], [4, -66], [22, -66]]) { g.beginPath(); g.arc(lx, ly, 8, 0.3, PI - 0.3); g.stroke(); }
  // wing (lifts on the cheer)
  g.save();
  g.translate(18, -104); g.rotate(-flap); g.translate(-18, 104);
  g.fillStyle = C_H.wing; ell(g, -16, -94, 40, 25, -0.12); g.fill();
  g.strokeStyle = C_H.wingD; g.lineWidth = 3.5;
  for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(-36 - k * 9, -88 + k * 4, 9, 0.5, PI - 0.2); g.stroke(); }
  g.restore();
  g.restore();
  // neck + head: the head lives in world space (stabilised) — only its offset from the root is local
  const nb = bx(HEN.neck[0], HEN.neck[1]);
  const hxW = henHeadX(t);
  const hx = (hxW - X) / s + nod[0], hy = HEN.head[1] + nod[1];
  g.strokeStyle = C_H.breast; g.lineWidth = 31; g.lineCap = 'round';
  g.beginPath(); g.moveTo(nb[0], nb[1]); g.lineTo(lerp(nb[0], hx, 0.55) - 4, lerp(nb[1], hy, 0.55)); g.lineTo(hx - 4, hy + 6); g.stroke();
  g.save();
  g.translate(hx, hy); g.scale(Math.cos(PI * lookB), 1);
  let cw = 0;
  for (const p of hen.contacts) { const u = t - p.t; if (u > 0 && u < 0.6) cw += 0.12 * p.amp * Math.exp(-u / 0.12) * Math.sin(u * 30); }
  g.save(); g.rotate(cw);
  g.fillStyle = C_H.comb;
  ell(g, -5, -19, 7, 8); g.fill(); ell(g, 4, -23, 8, 9); g.fill(); ell(g, 13, -19, 7, 8); g.fill(); ell(g, 4, -16, 12, 6); g.fill();
  g.restore();
  g.fillStyle = C_H.breast; ell(g, 0, 0, 21, 20); g.fill();
  g.fillStyle = C_H.wattle; ell(g, 15, 13, 5.5, 8.5, -0.2); g.fill();
  g.fillStyle = C_H.beak;
  g.beginPath(); g.moveTo(16, -7); g.quadraticCurveTo(28, -3, 33, 0); g.quadraticCurveTo(26, 3, 16, 4); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,240,226,0.85)'; ell(g, -3, 6, 5, 4); g.fill();
  g.fillStyle = '#22202E'; ell(g, 8, -5, 4.3, 4.6); g.fill();
  g.fillStyle = '#FFFFFF'; ell(g, 9.5, -6.8, 1.5, 1.5); g.fill();
  g.restore();
  leg(1, C_H.thigh, C_H.leg);         // near leg in front
  g.restore();
}

// ================================================================ demo
defineDemo({
  id: '91-gait-cycle',
  title: '눈 위의 박자',
  tech: '닫힌식 보행 주기 · 발 고정 · 발자국 박자',
  duration: D,
  background: '#EEF1F8',
  async setup(api) {
    await Promise.all([
      fontReady(`900 132px ${KR}`, '깡충뒤뚱'),
      fontReady(`700 42px ${KR}`, '첫눈 온 아침'),
      fontReady(`800 34px ${KR}`, '두 발 같이한 발씩 번갈아'),
    ]);
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.g = ctx;
    const [land, gl] = mk(W, H); paintLand(gl); this.land = land;
    const [front, gfr] = mk(W, H); paintFront(gfr); this.front = front;
    this.spr = { r: printSprite('r', false), h: printSprite('h', false), rL: printSprite('r', true), hL: printSprite('h', true) };
    this.glowGold = glowSprite('rgba(255,200,120,A)', 56);
    this.glowW = glowSprite('rgba(255,255,255,A)', 40);
    this.flake = glowSprite('rgba(255,255,255,A)', 16);
    // clouds
    const cloud = (w) => {
      const [c, g] = mk(w + 40, w * 0.5);
      const h = w * 0.34, cx = (w + 40) / 2, by = w * 0.42;
      g.fillStyle = 'rgba(255,246,240,0.95)';
      ell(g, cx - w * 0.24, by - h * 0.42, h * 0.42, h * 0.42); g.fill();
      ell(g, cx, by - h * 0.68, h * 0.6, h * 0.6); g.fill();
      ell(g, cx + w * 0.24, by - h * 0.5, h * 0.46, h * 0.46); g.fill();
      g.beginPath(); g.roundRect(cx - w * 0.46, by - h * 0.5, w * 0.92, h * 0.5, h * 0.25); g.fill();
      g.fillStyle = 'rgba(214,206,226,0.55)'; g.beginPath(); g.roundRect(cx - w * 0.44, by - h * 0.14, w * 0.88, h * 0.14, h * 0.07); g.fill();
      return c;
    };
    this.clouds = [{ c: cloud(300), x: 640, y: 96, v: 5 }, { c: cloud(220), x: 40, y: 640, v: 7 }, { c: cloud(180), x: 520, y: 690, v: 4 }];
    // falling snow, three depths
    const R = rand(9103);
    this.snow = [];
    for (let i = 0; i < 120; i++) {
      const z = i < 60 ? 0 : i < 100 ? 1 : 2;
      this.snow.push({ x: R() * W, y: R() * H, z, r: [1.6, 3.2, 8][z] * (0.7 + R() * 0.6), vy: [26, 48, 90][z] * (0.8 + R() * 0.4),
        sway: [8, 14, 22][z] * R(), f: 0.4 + R() * 0.8, ph: R() * TAU, a: [0.7, 0.85, 0.35][z] });
    }
    // glints on the snow
    this.glints = [];
    for (let i = 0; i < 46; i++) this.glints.push({ x: R() * W, y: 905 + R() * 540, f: 1.2 + R() * 2, ph: R() * TAU, r: 3 + R() * 4 });
    // snow puffs at each contact (velocities fixed here)
    this.puffs = [];
    for (const h of hops) {
      if (h === hops[0]) continue;
      const parts = [];
      for (let k = 0; k < 15; k++) parts.push({ x: h.heel + R() * rL, y: RAB.lane + (R() - 0.5) * 12, vx: (R() - 0.35) * 220 * h.e, vy: -(70 + R() * 170) * (0.4 + 0.6 * h.e),
        r: 2.5 + R() * 4.5, life: 0.45 + R() * 0.35 });
      this.puffs.push({ t: h.b, parts, ring: [h.heel + rL / 2, RAB.lane], big: h.e, lane: 'r' });
    }
    for (const p of hen.contacts) {
      const parts = [];
      for (let k = 0; k < 5; k++) parts.push({ x: p.x + 4 + R() * 16, y: HEN.lane + (p.f ? HEN.depth : -HEN.depth), vx: (R() - 0.3) * 90, vy: -(40 + R() * 70),
        r: 2 + R() * 2.5, life: 0.35 + R() * 0.2 });
      this.puffs.push({ t: p.t, parts, ring: [p.x + 6, HEN.lane + (p.f ? HEN.depth : -HEN.depth)], big: 0.35 * p.amp, lane: 'h' });
    }
    // the rhythm strip panel
    const [panel, gp] = mk(W, 260);
    const PY = 40;
    gp.save();
    gp.shadowColor = 'rgba(40,52,100,0.22)'; gp.shadowBlur = 30; gp.shadowOffsetY = 12;
    gp.fillStyle = 'rgba(255,255,255,0.9)';
    gp.beginPath(); gp.roundRect(40, PY, 1000, 186, 46); gp.fill();
    gp.restore();
    gp.strokeStyle = 'rgba(150,165,210,0.35)'; gp.lineWidth = 2; gp.beginPath(); gp.roundRect(40, PY, 1000, 186, 46); gp.stroke();
    for (const [yy, col] of [[PY + 56, 'rgba(229,130,42,0.22)'], [PY + 132, 'rgba(62,109,186,0.22)']]) {
      gp.strokeStyle = col; gp.lineWidth = 3; gp.setLineDash([2, 12]); gp.lineCap = 'round';
      gp.beginPath(); gp.moveTo(146, yy); gp.lineTo(1010, yy); gp.stroke();
    }
    gp.setLineDash([]);
    this.panel = panel; this.panelY = 1450 - PY;
    this.rowR = 1450 + 56; this.rowH = 1450 + 132;
    // text layout (measured once)
    const g = ctx;
    const lay = (txt, font) => {
      g.font = font;
      const out = []; let x = 0;
      for (const ch of Array.from(txt)) { const w = g.measureText(ch).width; out.push({ ch, x: x + w / 2, w }); x += w; }
      return { syl: out, w: x };
    };
    this.FA = `900 134px ${KR}`;
    this.lineA = lay('깡충 깡충', this.FA);
    this.lineB = lay('뒤뚱 뒤뚱', this.FA);
    g.font = `800 36px ${KR}`;
    this.chipA = { txt: '두 발 같이', w: g.measureText('두 발 같이').width };
    this.chipB = { txt: '한 발씩 번갈아', w: g.measureText('한 발씩 번갈아').width };
  },

  frame(t) {
    const g = this.g;
    const warm = smooth(t / D);
    // ---------------------------------------------------------------- sky, sun, clouds
    const sky = g.createLinearGradient(0, 0, 0, 900);
    sky.addColorStop(0, mix('#A6B8DE', '#B3C4E6', warm));
    sky.addColorStop(0.5, mix('#D3D2EA', '#E7D6E4', warm));
    sky.addColorStop(1, mix('#F6D6C8', '#FFDDBB', warm));
    g.fillStyle = sky; g.fillRect(0, 0, W, 900);
    const sunX = 838, sunY = 772 - 120 * ease.outCubic(t / D);
    const halo = g.createRadialGradient(sunX, sunY, 10, sunX, sunY, 520);
    halo.addColorStop(0, `rgba(255,236,200,${0.95})`);
    halo.addColorStop(0.18, `rgba(255,214,166,${0.55 + 0.15 * warm})`);
    halo.addColorStop(1, 'rgba(255,214,166,0)');
    g.fillStyle = halo; g.fillRect(0, 0, W, 1000);
    g.fillStyle = '#FFF7E6'; ell(g, sunX, sunY, 50, 50); g.fill();
    for (const c of this.clouds) g.drawImage(c.c, ((c.x + c.v * t + 200) % (W + 400)) - 200, c.y);
    // ---------------------------------------------------------------- land + warm light
    g.drawImage(this.land, 0, 0);
    const wl = g.createRadialGradient(sunX, sunY, 40, sunX, sunY, 1150);
    wl.addColorStop(0, `rgba(255,214,160,${0.30 + 0.12 * warm})`);
    wl.addColorStop(0.5, `rgba(255,222,180,${0.12 + 0.08 * warm})`);
    wl.addColorStop(1, 'rgba(255,222,180,0)');
    g.fillStyle = wl; g.fillRect(0, 880, W, 700);
    // glints
    for (const q of this.glints) {
      const a = Math.pow(Math.max(0, Math.sin(t * q.f + q.ph)), 12);
      if (a < 0.02) continue;
      star(g, q.x, q.y, q.r * (0.6 + 0.4 * a), `rgba(255,255,255,${a})`);
    }
    // ---------------------------------------------------------------- the beam (behind and over)
    const beamA = smooth((t - SW0 + 0.25) / 0.25) * (1 - smooth((t - SW1) / 0.35));
    const bx = sweepX(t);
    // ---------------------------------------------------------------- prints (dents) + light in them
    for (const q of PRINTS) {
      if (t < q.t) continue;
      const k = t - q.t, sp = this.spr[q.kind];
      const lit = t >= q.fire ? clamp((t - q.fire) / 0.12) : 0;
      g.globalAlpha = clamp(k / 0.05);
      if (q.rot) { g.save(); g.translate(q.x, q.y); g.rotate(q.rot); g.translate(-q.x, -q.y); }
      g.drawImage(sp.c, q.x - sp.ox, q.y - sp.oy);
      if (lit > 0) {
        const spL = this.spr[q.kind + 'L'];
        const fl = Math.exp(-(t - q.fire) * 5);
        g.globalAlpha = lit * 0.38 + 0.4 * fl;
        g.drawImage(this.glowGold, q.cx - 56, q.y - 30, 112, 60);
        g.globalAlpha = lit;
        g.drawImage(spL.c, q.x - spL.ox, q.y - spL.oy);
        if (fl > 0.02) { g.globalAlpha = fl * 0.9; g.drawImage(this.glowW, q.cx - 30, q.y - 16, 60, 32); }
      }
      if (q.rot) g.restore();
      g.globalAlpha = 1;
    }
    // ring on the snow where the light crosses a print
    for (const q of PRINTS) {
      const u = (t - q.fire) / 0.45;
      if (q.fire <= q.t + 0.01 || u <= 0 || u >= 1 || q.x < 20) continue;
      g.strokeStyle = `rgba(255,190,110,${0.8 * (1 - u)})`; g.lineWidth = 3 * (1 - u) + 1;
      ell(g, q.cx, q.y, 14 + 40 * ease.outCubic(u), (14 + 40 * ease.outCubic(u)) * 0.32); g.stroke();
    }
    // ---------------------------------------------------------------- rabbit
    const lookR = smooth((t - 4.12) / 0.16) - smooth((t - 6.9) / 0.16);
    const lookH = smooth((t - 4.24) / 0.16) - smooth((t - 6.98) / 0.16);
    const P = rabbitAt(t);
    let earX = 0, sqX = 0;
    for (const h of hops) { const u = t - h.b; if (u > 0 && u < 1.2) earX += 0.42 * h.e * Math.exp(-u / 0.2) * Math.sin(u * 18); }
    for (const f of R_SWEEP) { const u = t - f; if (u > -0.05 && u < 0.5) { sqX -= 0.35 * bump((u + 0.05) / 0.25); earX += 0.25 * Math.exp(-Math.max(0, u) / 0.12) * Math.sin(Math.max(0, u) * 20); } }
    const cheer = bump((t - ARRIVE) / 0.5);
    sqX += 0.55 * cheer;
    earX -= 0.25 * cheer + 0.06 * Math.sin(t * 2.3) * (P.rest ? 1 : 0);
    const blinkR = ((t + 0.7) % 3.1) > 3.0;
    drawRabbit(g, Object.assign({}, P, { sq: clamp(P.sq + sqX, -1, 1) }), t, lookR, earX, blinkR);
    this.drawPuffs(g, t, 'r');
    // ---------------------------------------------------------------- hen
    const nod = [0, 0];
    for (const f of H_SWEEP) { const u = (t - f + 0.04) / 0.18; nod[0] -= 9 * bump(u); nod[1] += 4 * bump(u); }
    nod[1] -= 8 * cheer;
    const flap = 0.7 * bump((t - ARRIVE + 0.05) / 0.25) + 0.7 * bump((t - ARRIVE - 0.2) / 0.25);
    drawHen(g, t, lookH, nod, flap);
    this.drawPuffs(g, t, 'h');
    // ---------------------------------------------------------------- foreground
    g.drawImage(this.front, 0, 0);
    // the beam over the field
    if (beamA > 0.001) {
      const bg = g.createLinearGradient(bx - 90, 0, bx + 90, 0);
      bg.addColorStop(0, 'rgba(255,214,150,0)'); bg.addColorStop(0.5, `rgba(255,214,150,${0.42 * beamA})`); bg.addColorStop(1, 'rgba(255,214,150,0)');
      g.fillStyle = bg; g.fillRect(bx - 90, 880, 180, 760);
      const vg = g.createLinearGradient(0, 860, 0, 1000);
      vg.addColorStop(0, 'rgba(255,240,215,0)'); vg.addColorStop(1, `rgba(255,240,215,${0.75 * beamA})`);
      g.fillStyle = vg; g.fillRect(bx - 1.5, 860, 3, 780);
      for (let i = 0; i < 18; i++) {           // warm dust in the light
        const yy = 900 + ((i * 97.3 + t * (18 + i % 5 * 7)) % 700), xx = bx + 52 * Math.sin(i * 2.7 + t * (0.8 + (i % 3) * 0.3));
        const a = beamA * (0.35 + 0.35 * Math.sin(t * 3 + i)) * (1 - Math.abs(xx - bx) / 70);
        if (a > 0.02) { g.globalAlpha = a; g.drawImage(this.glowGold, xx - 7, yy - 7, 14, 14); }
      }
      g.globalAlpha = 1;
    }
    // falling snow
    for (const f of this.snow) {
      const y = ((f.y + f.vy * t) % (H + 60)) - 30;
      const x = (((f.x + f.sway * Math.sin(t * f.f + f.ph) + 6 * t * (f.z + 1)) % W) + W) % W;
      if (f.z === 2) { g.globalAlpha = f.a; g.drawImage(this.flake, x - f.r * 2, y - f.r * 2, f.r * 4, f.r * 4); }
      else { g.globalAlpha = f.a; g.fillStyle = '#FFFFFF'; ell(g, x, y, f.r, f.r); g.fill(); }
    }
    g.globalAlpha = 1;
    // ---------------------------------------------------------------- the rhythm strip
    const pin = ease.outCubic(clamp((t - 0.2) / 0.55));
    if (pin <= 0) { this.drawWords(g, t); return; }
    const py = (1 - pin) * 70;
    g.save(); g.translate(0, py);
    g.globalAlpha = pin;
    g.drawImage(this.panel, 0, this.panelY);
    g.globalAlpha = 1;
    this.drawIcons(g, t);
    g.save();
    g.beginPath(); g.rect(SX_LO - 8, 1450, SX_HI - SX_LO + 20, 190); g.clip();
    for (const m of MARKS) {
      if (t < m.t || m.x < SX_LO - 10 || m.x > SX_HI + 10) continue;
      const pop = outBack((t - m.t) / 0.24, 2.4), edge = smooth((m.x - SX_LO) / 18);
      const lit = t >= m.fire ? clamp((t - m.fire) / 0.1) : 0;
      const fl = t >= m.fire ? Math.exp(-(t - m.fire) * 6) : 0;
      const sc = pop * (1 + 0.55 * fl + 0.1 * lit);
      const ry = m.kind === 'r' ? this.rowR : this.rowH + 15 * m.side;
      g.globalAlpha = edge;
      if (lit > 0) { g.globalAlpha = edge * (0.55 * lit + 0.45 * fl); const hs = (m.kind === 'r' ? 66 : 48) * (1 + 0.4 * fl); g.drawImage(this.glowGold, m.x - hs / 2, (m.kind === 'r' ? this.rowR : ry) - hs / 2, hs, hs); g.globalAlpha = edge; }
      g.save(); g.translate(m.x, m.kind === 'r' ? this.rowR : ry); g.scale(sc, sc);
      if (m.kind === 'r') {
        g.fillStyle = AMB;
        g.beginPath(); g.roundRect(-15, -21, 30, 12, 6); g.roundRect(-15, 9, 30, 12, 6); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.roundRect(-12, -19, 12, 4, 2); g.roundRect(-12, 11, 12, 4, 2); g.fill();
      } else {
        g.strokeStyle = BLU; g.fillStyle = BLU; g.lineWidth = 4.5; g.lineCap = 'round';
        g.beginPath();
        g.rotate(m.side * -0.14);
        g.moveTo(-6, 0); g.quadraticCurveTo(2, 1, 11, 0);
        g.moveTo(-7, -2); g.quadraticCurveTo(0, -3, 4, -11);
        g.moveTo(-7, 2); g.quadraticCurveTo(0, 3, 4, 11);
        g.stroke();
        ell(g, -7, 0, 6, 5.5); g.fill();
      }
      g.restore();
      if (fl > 0.2) {
        const u = (1 - fl) / 0.8;
        g.strokeStyle = `rgba(240,160,70,${(fl - 0.2) * 1.2})`;
        g.lineWidth = 3;
        ell(g, m.x, m.kind === 'r' ? this.rowR : ry, 12 + 26 * u, 12 + 26 * u); g.stroke();
      }
      g.globalAlpha = 1;
    }
    g.restore();
    if (beamA > 0.001) {
      const bg = g.createLinearGradient(bx - 60, 0, bx + 60, 0);
      bg.addColorStop(0, 'rgba(255,200,120,0)'); bg.addColorStop(0.5, `rgba(255,200,120,${0.38 * beamA})`); bg.addColorStop(1, 'rgba(255,200,120,0)');
      g.fillStyle = bg; g.fillRect(bx - 60, 1452, 120, 184);
      g.fillStyle = `rgba(232,140,50,${0.85 * beamA})`; g.beginPath(); g.roundRect(bx - 2, 1462, 4, 164, 2); g.fill();
    }
    g.restore();
    // ---------------------------------------------------------------- words that walk
    this.drawWords(g, t);
  },

  drawIcons(g, t) {
    // row heads: a rabbit and a hen, each pulsing on its own beats
    const pulse = (beats) => { let v = 0; for (const b of beats) { const u = (t - b.t) / 0.22; if (u > 0 && u < 1) v = Math.max(v, bump(u)); } return v; };
    const pr = pulse(R_BEATS), ph = pulse(H_BEATS);
    // rabbit
    g.save(); g.translate(92, this.rowR); g.scale(1 + 0.12 * pr, 1 + 0.12 * pr);
    g.fillStyle = 'rgba(229,130,42,0.14)'; ell(g, 0, 0, 36, 36); g.fill();
    g.fillStyle = C_R.fur;
    g.save(); g.translate(-6, -12); g.rotate(-0.35 - 0.2 * pr); ell(g, 0, -16, 6.5, 17); g.fill(); g.restore();
    g.save(); g.translate(4, -13); g.rotate(-0.12 - 0.2 * pr); ell(g, 0, -16, 7, 18); g.fill(); g.fillStyle = C_R.ear; ell(g, 0.5, -15, 3, 12); g.fill(); g.restore();
    g.fillStyle = C_R.fur; ell(g, 0, 4, 18, 16); g.fill();
    g.fillStyle = C_R.belly; ell(g, 9, 9, 7, 5.5); g.fill();
    g.fillStyle = C_R.eye; ell(g, 6, 0, 3.2, 3.6); g.fill();
    g.fillStyle = C_R.nose; ell(g, 15, 6, 2.6, 2.1); g.fill();
    g.restore();
    // hen
    g.save(); g.translate(92, this.rowH); g.translate(-6 * ph, 0);
    g.fillStyle = 'rgba(62,109,186,0.14)'; ell(g, 6 * ph, 0, 36, 36); g.fill();
    g.fillStyle = C_H.comb; ell(g, -5, -17, 5, 6); g.fill(); ell(g, 2, -20, 6, 7); g.fill(); ell(g, 9, -17, 5, 6); g.fill();
    g.fillStyle = C_H.breast; ell(g, 0, 0, 17, 16); g.fill();
    g.fillStyle = C_H.wattle; ell(g, 12, 11, 4, 6); g.fill();
    g.fillStyle = C_H.beak; g.beginPath(); g.moveTo(13, -5); g.lineTo(26, 0); g.lineTo(13, 4); g.closePath(); g.fill();
    g.fillStyle = '#22202E'; ell(g, 6, -4, 3.2, 3.4); g.fill();
    g.restore();
  },

  drawPuffs(g, t, lane) {
    for (const pf of this.puffs) {
      if (pf.lane !== lane) continue;
      const k = t - pf.t;
      if (k < 0 || k > 0.9) continue;
      // a low cloud of snow dust
      const u = k / 0.5;
      if (u < 1) {
        const rr = (14 + 36 * ease.outCubic(u)) * (0.5 + pf.big);
        g.fillStyle = `rgba(255,255,255,${0.75 * (1 - u)})`;
        ell(g, pf.ring[0], pf.ring[1] - 4, rr, rr * 0.3); g.fill();
        g.fillStyle = `rgba(255,255,255,${0.35 * (1 - u)})`;
        ell(g, pf.ring[0] - rr * 0.35, pf.ring[1] - 8 - 10 * u, rr * 0.55, rr * 0.3); g.fill();
        ell(g, pf.ring[0] + rr * 0.4, pf.ring[1] - 6 - 8 * u, rr * 0.45, rr * 0.26); g.fill();
      }
      for (const q of pf.parts) {
        if (k > q.life) continue;
        const dr = (1 - Math.exp(-3 * k)) / 3;
        const x = q.x + q.vx * dr, y = Math.min(q.y + 2, q.y + q.vy * dr + 0.5 * 620 * k * k);
        const a = 1 - k / q.life;
        g.fillStyle = `rgba(170,186,222,${0.5 * a})`; ell(g, x + 1, y + 1.5, q.r, q.r); g.fill();
        g.fillStyle = `rgba(255,255,255,${a})`; ell(g, x, y, q.r, q.r); g.fill();
      }
    }
  },

  drawWords(g, t) {
    const X0 = 76;
    // kicker
    const kin = ease.outCubic(clamp(t / 0.45));
    g.font = `700 42px ${KR}`;
    g.fillStyle = `rgba(42,46,72,${0.72 * kin})`;
    g.fillText('첫눈 온 아침', X0 + (1 - kin) * -30, 252);
    g.fillStyle = `rgba(42,46,72,${0.25 * kin})`; g.fillRect(X0 + 254, 238, 60 * kin, 4);
    const lines = [
      { L: this.lineA, y: 404, col: AMB_T, beats: R_BEATS, kind: 'r', t0: 0.12 },
      { L: this.lineB, y: 552, col: BLU_T, beats: H_BEATS, kind: 'h', t0: 0.3 },
    ];
    const henRock = henBody(t).rock;
    for (const ln of lines) {
      let si = 0;
      ln.L.syl.forEach((sy, i) => {
        if (sy.ch === ' ') return;
        const idx = si++;
        const pin = (t - ln.t0 - idx * 0.07) / 0.42;
        if (pin <= 0) return;
        const pop = Math.max(0, outBack(pin, 2));
        let dy = (1 - pop) * 60, rot = 0, scx = pop, scy = pop;
        const word = idx < 2 ? 0 : 1;
        if (ln.kind === 'r') {
          // both syllables of a word hop together: up on the flight, squash on the landing
          let n = 0;
          for (const b of ln.beats) {
            if ((n++ % 2) !== word) continue;
            const u = (t - (b.t - b.pre)) / b.pre;
            if (u > 0 && u < 1) { dy -= 46 * 4 * u * (1 - u); scy *= 1 + 0.08 * (1 - u); scx *= 1 - 0.05 * (1 - u); }
            const v = (t - b.t) / 0.2;
            if (v > 0 && v < 1) { scy *= 1 - 0.2 * bump(v); scx *= 1 + 0.12 * bump(v); }
          }
        } else {
          // one syllable at a time, alternating lean: 뒤 → 뚱 → 뒤 → 뚱
          let n = 0;
          for (const b of ln.beats) {
            if ((n++ % 4) !== idx) continue;
            const v = (t - b.t + 0.04) / 0.3;
            if (v > 0 && v < 1) { rot += (idx % 2 ? 1 : -1) * 0.16 * bump(v); dy += 14 * bump(v); scy *= 1 - 0.08 * bump(v); }
          }
          rot += henRock * 0.6;
        }
        const cx = X0 + sy.x;
        g.save();
        g.translate(cx, ln.y + dy);
        g.rotate(rot); g.scale(scx, scy);
        g.font = this.FA; g.textAlign = 'center';
        g.lineJoin = 'round';
        g.fillStyle = 'rgba(52,62,110,0.14)'; g.fillText(sy.ch, 0, 12);
        g.strokeStyle = 'rgba(255,255,255,0.92)'; g.lineWidth = 16; g.strokeText(sy.ch, 0, 0);
        g.fillStyle = ln.col; g.fillText(sy.ch, 0, 0);
        g.restore();
      });
    }
    g.textAlign = 'left';
    // glosses on the climax
    const chip = (c, x, y, at, col) => {
      const p = (t - at) / 0.4;
      if (p <= 0) return;
      const s = outBack(p, 2.2);
      g.save(); g.translate(x, y); g.scale(s, s);
      const w = c.w + 74;
      g.fillStyle = 'rgba(40,52,100,0.12)'; g.beginPath(); g.roundRect(0, -30 + 6, w, 62, 31); g.fill();
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(0, -30, w, 62, 31); g.fill();
      g.fillStyle = col; ell(g, 30, 1, 9, 9); g.fill();
      g.fillStyle = INK; g.font = `800 36px ${KR}`; g.fillText(c.txt, 50, 14);
      g.restore();
    };
    chip(this.chipA, X0 + this.lineA.w + 30, 362, SW0 + 0.05, AMB);
    chip(this.chipB, X0 + this.lineB.w + 30, 510, SW0 + 0.2, BLU);
  },
});

function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`;
}
function star(g, x, y, r, col) {
  g.fillStyle = col;
  g.beginPath();
  g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r);
  g.fill();
}
