/*
 * traffic.js — the life of the crossroads, simulated once for the whole day in setup, then integrated per frame
 * over the shutter window [T − S, T] in closed form.
 *
 *   cars and trams  move along routes with a closed-form motion law (cruise, uniform braking to a queue spot, a wait,
 *                   uniform acceleration). τ(s), the time the front reaches route position s, is the inverse law, so
 *                   the exposure a lamp leaves in the route bin [sⱼ, sⱼ₊₁] is exactly
 *                     Eⱼ = Fn((T − τ(sⱼ))/S) − Fn((T − τ(sⱼ₊₁))/S)        (Hann-weighted share of the window)
 *                   and its trail there shines with L · Eⱼ · (lamp size / bin length): slow = bright, fast = faint.
 *   waits           (a car in a queue, a tram at its island, a person at a stop or on a bench) leave a ghost whose
 *                   alpha is the share of the window they occupy: W = Fn((T − a)/S) − Fn((T − b)/S).
 *   walkers         are only ever somewhere for ≈0.4 s; their trace is a faint band whose alpha is the flux of people
 *                   times that dwell, averaged over the window.
 */
import { clamp, rand } from '../_lib/stage.js';
import { proj, hex, mix, scale, add, css, shade } from './cam.js';
import { hannCDF, hann, occupancy } from './clock.js';
import { ZS } from './town.js';

const V0 = 10.5, AD = 2.6, AA = 2.2, DD = (V0 * V0) / (2 * AD);
const CYCLE = 90;
export const RED_HEX = '#ff3b30';
const L_HEAD = 4.2, L_TAIL = 4.6, L_TRAM = 0.06, LAMP = 0.2, BLOB = 3.2;
const knee = (v, k = 1.4) => v / (1 + v / k);   // keeps one bright event below clipping, so its Hann fade stays a fade
const CAR_COLS = ['#e9e5dc', '#3f4a5c', '#8c97a3', '#5d7d8c', '#c9b48a', '#6f7f6a', '#2c3140', '#b9c2c9'].map(hex);
const SHIRTS = ['#d8a64a', '#5b7fa6', '#e7e1d4', '#7b9a6b', '#c98f6b', '#47506a', '#a7a2c4', '#e3c27c', '#6f8f99', '#b58a9c'].map(hex);
const PANTS = ['#3a3f4c', '#4d5466', '#5e5348', '#2f3440', '#6b6f78'].map(hex);

// ---------------------------------------------------------------- tables (per scene hour)
function prof(rows) {
  return (T) => {
    if (T <= rows[0][0]) return rows[0][1];
    for (let i = 1; i < rows.length; i++) if (T <= rows[i][0]) { const k = (T - rows[i - 1][0]) / (rows[i][0] - rows[i - 1][0]); return rows[i - 1][1] + (rows[i][1] - rows[i - 1][1]) * k; }
    return rows[rows.length - 1][1];
  };
}
const CARS_PER_H = prof([[3.5, 40], [5.5, 120], [7.2, 620], [8.6, 640], [10, 380], [12, 420], [15.5, 400], [17.4, 660], [18.9, 620], [20, 420], [21.5, 280], [23, 160], [24.5, 90]]);
const PEOPLE = prof([[3.5, 0.05], [5.5, 0.4], [7.3, 2.4], [8.7, 2.2], [10, 0.9], [12, 1.3], [16, 1.1], [17.3, 2.1], [18.8, 1.8], [20.5, 0.7], [22, 0.35], [24.5, 0.1]]);   // per minute, per stop
const BENCH_PER_MIN = prof([[5, 0], [6.5, 0.03], [9, 0.11], [12, 0.18], [15, 0.15], [17, 0.2], [19, 0.12], [21, 0.05], [23, 0.01], [24.5, 0]]);
const CAFE_PER_MIN = prof([[7.8, 0], [8.2, 0.05], [10, 0.1], [12.5, 0.18], [15, 0.12], [18, 0.16], [20.5, 0.1], [21.4, 0], [24.5, 0]]);
const TRAM_HEADWAY = (T) => (T < 6.5 || T > 20.5 ? 12 : 7.5) * 60;

// signals (seconds into the 90 s cycle): main street green 0–48, cross street green 53–80;
// walk across the cross street 0–40, across the main street 53–75
const cyc = (s) => ((s % CYCLE) + CYCLE) % CYCLE;
const nextAt = (s, start) => { const c = cyc(s); return s + (c <= start ? start - c : CYCLE - c + start); };
const mainGreen = (s) => cyc(s) < 48, crossGreen = (s) => { const c = cyc(s); return c >= 53 && c < 80; };
const nextMainGreen = (s) => (mainGreen(s) ? s : nextAt(s, 0));
const nextCrossGreen = (s) => (crossGreen(s) ? s : nextAt(s, 53));
/** the share of each signal lamp's on-time in a cycle — a long exposure records exactly this */
export const SIGNAL_DUTY = { main: [42 / 90, 3 / 90, 45 / 90], cross: [27 / 90, 3 / 90, 60 / 90] };

// ---------------------------------------------------------------- routes
function route(parts, lampY = 0.75) {
  const P = [];
  let cur = null;
  for (const p of parts) {
    if (p[0] === 'M') { cur = p[1]; P.push(cur); }
    else if (p[0] === 'L') {
      const [x, z] = p[1], n = Math.max(1, Math.ceil(Math.hypot(x - cur[0], z - cur[1]) / 0.5));
      for (let i = 1; i <= n; i++) P.push([cur[0] + ((x - cur[0]) * i) / n, cur[1] + ((z - cur[1]) * i) / n]);
      cur = [x, z];
    } else {
      const [, cx, cz, r, a0, a1] = p, n = Math.max(2, Math.ceil((Math.abs(a1 - a0) * r) / 0.4));
      for (let i = 1; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; P.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); }
      cur = P[P.length - 1];
    }
  }
  const S = [0];
  for (let i = 1; i < P.length; i++) S.push(S[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const at = (s) => {
    s = clamp(s, 0, S[S.length - 1]);
    let lo = 0, hi = S.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (S[m] <= s) lo = m; else hi = m; }
    const k = (s - S[lo]) / Math.max(1e-9, S[hi] - S[lo]);
    const dx = P[hi][0] - P[lo][0], dz = P[hi][1] - P[lo][1], l = Math.hypot(dx, dz) || 1;
    return { x: P[lo][0] + dx * k, z: P[lo][1] + dz * k, hx: dx / l, hz: dz / l };
  };
  const R = { len: S[S.length - 1], at, lampY };
  // bin edges every ≈ 7 px on screen (at most 3 m apart), only where the route is on screen
  const E = [];
  let last = null;
  for (let s = 0; s <= R.len; s += 0.25) {
    const q = at(s), p = proj(q.x, lampY, q.z);
    const on = p[2] > 1 && p[0] > -60 && p[0] < 1140 && p[1] > 640 && p[1] < 1800;
    if (!on) { if (last) { E.push(s); last = null; } continue; }
    if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) >= 7 || s - E[E.length - 1] >= 3) { E.push(s); last = p; }
  }
  R.edges = Float64Array.from(E);
  R.q = E.map((s) => at(s));
  R.ok = new Uint8Array(Math.max(0, E.length - 1));
  for (let j = 0; j < E.length - 1; j++) R.ok[j] = E[j + 1] - E[j] <= 3.01 ? 1 : 0;
  // how much a head / tail lamp faces the camera in each bin
  R.vis = R.q.slice(0, -1).map((q) => {
    const vl = Math.hypot(q.x, q.z), d = (q.hx * q.x + q.hz * q.z) / vl;
    return { head: 0.3 + 0.7 * clamp(-d), tail: 0.3 + 0.7 * clamp(d) };
  });
  // runs: maximal stretches of drawable bins on one straight piece (one gradient each); the rest is drawn per bin
  R.runs = [];
  let j = 0;
  while (j < R.ok.length) {
    if (!R.ok[j]) { j++; continue; }
    let k = j;
    while (k + 1 < R.ok.length && R.ok[k + 1] && Math.abs(R.q[k + 1].hx - R.q[j].hx) < 1e-4 && Math.abs(R.q[k + 1].hz - R.q[j].hz) < 1e-4) k++;
    R.runs.push([j, k]);
    j = k + 1;
  }
  return R;
}

const PI = Math.PI;
function buildRoutes() {
  const ZE = ZS.ebLane, ZW = ZS.wbLane, FAR = 420;
  return {
    EB: route([['M', [-90, ZE]], ['L', [90, ZE]]]),
    EBL: route([['M', [-90, ZE]], ['L', [-5, ZE]], ['A', -5, ZE + 8, 8, -PI / 2, 0], ['L', [3, FAR]]]),
    WB: route([['M', [90, ZW]], ['L', [-90, ZW]]]),
    WBR: route([['M', [90, ZW]], ['L', [6.5, ZW]], ['A', 6.5, ZW + 3.5, 3.5, -PI / 2, -PI], ['L', [3, FAR]]]),
    SBR: route([['M', [-3, FAR]], ['L', [-3, ZW + 3.5]], ['A', -6.5, ZW + 3.5, 3.5, 0, -PI / 2], ['L', [-90, ZW]]]),
    SBL: route([['M', [-3, FAR]], ['L', [-3, ZE + 12]], ['A', 9, ZE + 12, 12, PI, PI * 1.5], ['L', [90, ZE]]]),
    TE: route([['M', [-90, ZS.ebTrack]], ['L', [90, ZS.ebTrack]]], 0.9),
    TW: route([['M', [90, ZS.wbTrack]], ['L', [-90, ZS.wbTrack]]], 0.9),
  };
}

// ---------------------------------------------------------------- motion law of one vehicle
/** time the vehicle's front reaches route position s (inverse of: cruise → brake → wait → accelerate → cruise) */
function tauFront(v, s) {
  if (!v.stop) return v.tl + (s - v.sl) / v.v;
  const vv = v.v, dd = (vv * vv) / (2 * v.ad), da = (vv * vv) / (2 * v.aa);
  const s1 = v.sq - dd, s2 = v.sq + da;
  if (s <= s1) return v.ta - (2 * dd) / vv - (s1 - s) / vv;
  if (s <= v.sq) return v.ta - Math.sqrt((2 * (v.sq - s)) / v.ad);
  if (s <= s2) return v.td + Math.sqrt((2 * (s - v.sq)) / v.aa);
  return v.td + vv / v.aa + (s - s2) / vv;
}

// ---------------------------------------------------------------- the day's simulation (setup)
export function build(seed = 1606) {
  const r = rand(seed);
  const routes = buildRoutes();
  const SPAN0 = 3.4 * 3600, SPAN1 = 24.6 * 3600;
  const veh = { EB: [], WB: [], SB: [], TE: [], TW: [] };
  const exp = (rate) => -Math.log(1 - r()) / rate;
  // cars: Poisson arrivals at each approach; a red light builds a queue that leaves 2.1 s apart after green
  const approaches = [
    { key: 'EB', k: 1, green: mainGreen, next: nextMainGreen, routes: [['EB', 0.85], ['EBL', 1]], sl: 77.6 },
    { key: 'WB', k: 0.9, green: mainGreen, next: nextMainGreen, routes: [['WB', 0.88], ['WBR', 1]], sl: 77.6 },
    { key: 'SB', k: 0.55, green: crossGreen, next: nextCrossGreen, routes: [['SBR', 0.5], ['SBL', 1]], sl: 420 - 39.6 },
  ];
  for (const ap of approaches) {
    let s = SPAN0, qn = 0, qg = -1;
    while (s < SPAN1) {
      s += exp((CARS_PER_H(s / 3600) * ap.k) / 3600);
      const u = r();
      const rk = ap.routes.find(([, p]) => u <= p)[0];
      const v = { r: rk, tl: s, sl: ap.sl, v: V0, ad: AD, aa: AA, len: 4.2, col: Math.floor(r() * CAR_COLS.length), stop: false };
      const g = ap.next(s);
      if (g !== qg) { qg = g; qn = 0; }
      const discharging = ap.green(s) && s < g + 2.1 * qn + 1.5 && qn > 0;
      if (g > s || discharging) {
        const q = qn++;
        v.stop = true; v.q = q; v.sq = ap.sl - 6.8 * q;
        v.ta = s - (ap.sl - v.sq) / V0 + DD / V0;
        v.td = Math.max(v.ta + 1.5, g + 1.2 + 2.1 * q);
      }
      veh[ap.key].push(v);
    }
  }
  // trams: a timetable per track, braking to the island, 40 s dwell
  const tram = (key, off) => {
    let s = 5.3 * 3600 + off;
    while (s < 23.85 * 3600) {
      veh[key].push({ r: key, stop: true, sq: 88.8, ta: s, td: s + 40, v: 9, ad: 1.1, aa: 1.0, len: 24, sl: 88.8, tl: s });
      s += TRAM_HEADWAY(s / 3600);
    }
  };
  tram('TE', 0); tram('TW', 222);
  for (const k in veh) veh[k].sort((a, b) => a.tl - b.tl);

  // people who wait: each is [from, to, x, z, height, shirt, pants]; sitters share fixed seats
  const people = [];
  const person = (a, b, x, z, extra = {}) => people.push({ a, b, x, z, h: 1.55 + 0.25 * r(), shirt: SHIRTS[Math.floor(r() * SHIRTS.length)], pants: PANTS[Math.floor(r() * PANTS.length)], pose: 'stand', ...extra });
  // tram riders wait on the island for the next departure
  const island = (x0, x1, z, key, k) => {
    const deps = veh[key].map((v) => v.td);
    let s = SPAN0, di = 0;
    while (s < SPAN1) {
      s += exp((PEOPLE(s / 3600) * k) / 60);
      while (di < deps.length && deps[di] < s + 15) di++;
      if (di >= deps.length) break;
      // most stand near the shelter
      const u = r() < 0.6 ? 0.25 + 0.3 * r() : r();
      person(s, deps[di], x0 + (x1 - x0) * u, z + (r() - 0.5) * 0.7);
    }
  };
  island(-20, -3.8, (ZS.ebIsland[0] + ZS.ebIsland[1]) / 2, 'TE', 1.4);
  island(3.8, 22, (ZS.wbIsland[0] + ZS.wbIsland[1]) / 2, 'TW', 1.2);
  // corners: people wait for the walk light
  const corner = (x, z, walkStart, k, sx = 1) => {
    let s = SPAN0;
    while (s < SPAN1) {
      s += exp((PEOPLE(s / 3600) * k) / 60);
      const c = cyc(s), walking = walkStart === 53 ? c >= 53 && c < 75 : c < 40;
      if (walking) continue;
      person(s, nextAt(s, walkStart), x + (r() - 0.5) * 1.6 * sx, z + (r() - 0.5) * 1.0);
    }
  };
  corner(-9.8, 14.5, 53, 1.1); corner(9.8, 14.5, 53, 0.9); corner(-9.8, 33.5, 53, 0.8); corner(9.9, 33.5, 53, 0.8);
  corner(-7.6, 36.6, 0, 0.6, 0.6); corner(7.6, 36.6, 0, 0.6, 0.6);
  // the plaza: people who stop to talk, wait for someone, look at the tram (5–25 min)
  {
    let s = SPAN0;
    const spotsP = [[-3.2, 9.4], [5.2, 12.2], [-10.8, 12.0], [0.6, 12.4], [-4.8, 12.3], [9.6, 11.6]];
    while (s < SPAN1) {
      const rt = PEOPLE(s / 3600) * 0.55 * (s / 3600 > 9 && s / 3600 < 21 ? 1 : 0.3);
      s += exp(rt / 60);
      const [x, z] = spotsP[Math.floor(r() * spotsP.length)], d = (4 + 22 * Math.pow(r(), 1.5)) * 60;
      const n = r() < 0.5 ? 2 : 1;
      for (let k = 0; k < n; k++) person(s, s + d, x + (k - (n - 1) / 2) * 0.75 + (r() - 0.5) * 0.5, z + (r() - 0.5) * 0.6);
    }
  }
  // seats: two benches on the plaza and the café terrace
  const seats = [];
  const seatGroup = (pts, rate, dur) => {
    const S = pts.map(([x, z, face]) => { const q = { x, z, face, ev: [], free: -1e9 }; seats.push(q); return q; });
    let s = SPAN0;
    while (s < SPAN1) {
      const rt = rate(s / 3600);
      s += exp(Math.max(1e-3, rt) / 60);
      if (rt < 1e-3) continue;
      const free = S.filter((q) => q.free < s);
      if (!free.length) continue;
      const q = free[Math.floor(r() * free.length)], d = (dur[0] + (dur[1] - dur[0]) * Math.pow(r(), 1.6)) * 60;
      q.ev.push([s, s + d, Math.floor(r() * SHIRTS.length)]); q.free = s + d + 30;
    }
  };
  seatGroup([[2.2, 10.6, 0], [3.4, 10.6, 0]], BENCH_PER_MIN, [4, 40]);
  seatGroup([[-7.4, 10.8, 0], [-6.2, 10.8, 0]], (T) => BENCH_PER_MIN(T) * 0.8, [3, 30]);
  seatGroup([[-24.6, 33.7, 1], [-23.2, 33.7, -1], [-18.6, 33.7, 1], [-17.2, 33.7, -1]], CAFE_PER_MIN, [12, 55]);
  // the kiosk keeper, behind the counter 06:40–19:50
  person(6.67 * 3600, 19.83 * 3600, -17.5, 9.35, { h: 1.62 });
  people.sort((a, b) => a.a - b.a);
  for (const p of people) { p.p = proj(p.x, 0, p.z); p.top = proj(p.x, p.h, p.z); }
  for (const q of seats) { q.p = proj(q.x, 0, q.z); q.top = proj(q.x, 1.6, q.z); }
  const maxWait = people.reduce((m, p) => Math.max(m, p.b - p.a), 0);

  // queue spots on screen (approach, q) and the tram stops
  const spots = [];
  for (const ap of ['SB', 'WB', 'EB']) for (let q = 0; q < 10; q++) {
    const R = routes[ap === 'SB' ? 'SBR' : ap];
    const sq = (ap === 'SB' ? 420 - 39.6 : 77.6) - 6.8 * q;
    const a = R.at(sq - 2.1), p = proj(a.x, 0.7, a.z);
    if (p[0] < -80 || p[0] > 1160) continue;
    spots.push({ ap, q, sq, x: a.x, z: a.z, hx: a.hx, hz: a.hz, faces: carFaces(a.x, a.z, a.hx, a.hz) });
  }
  const tramStops = [
    { key: 'TW', z: ZS.wbTrack, x0: 1.2, x1: 25.2 },
    { key: 'TE', z: ZS.ebTrack, x0: -25.2, x1: -1.2 },
  ].map((t) => ({ ...t, faces: tramFaces(t) }));
  // walking paths: where people only pass (≈0.4 s at a spot) — [x0, z0, x1, z1, people per minute factor]
  const walks = [
    [-60, 14.6, 60, 14.6, 5], [-60, 33.4, 60, 33.4, 4], [-9.8, 15.2, -9.8, 32.8, 2.4], [9.8, 15.2, 9.8, 32.8, 2],
    [-7.6, 36, -7.6, 160, 2.2], [7.6, 36, 7.6, 160, 2.2], [-6, 37, 6, 37, 1.6], [-30, 12.2, 30, 12.2, 2.2],
  ].map(([x0, z0, x1, z1, k]) => ({ x0, z0, x1, z1, k, z: Math.min(z0, z1), q: [[x0, 0.02, z0], [x1, 0.02, z1], [x1, 1.65, z1], [x0, 1.65, z0]].map((p) => proj(...p)) }));
  return { routes, veh, people, seats, maxWait, spots, tramStops, walks, scratch: null };
}

// ---------------------------------------------------------------- geometry of a queued car and a stopped tram
function boxFaces(cx, cz, hx, hz, L, Wd, y0, y1, tag) {
  const nx = -hz, nz = hx, out = [];
  const c = (a, b, y) => [cx + hx * a + nx * b, y, cz + hz * a + nz * b];
  const sides = [
    { n: [-nx, 0, -nz], q: [c(-L / 2, -Wd / 2, y0), c(L / 2, -Wd / 2, y0), c(L / 2, -Wd / 2, y1), c(-L / 2, -Wd / 2, y1)] },
    { n: [nx, 0, nz], q: [c(-L / 2, Wd / 2, y0), c(L / 2, Wd / 2, y0), c(L / 2, Wd / 2, y1), c(-L / 2, Wd / 2, y1)] },
    { n: [hx, 0, hz], q: [c(L / 2, -Wd / 2, y0), c(L / 2, Wd / 2, y0), c(L / 2, Wd / 2, y1), c(L / 2, -Wd / 2, y1)] },
    { n: [-hx, 0, -hz], q: [c(-L / 2, -Wd / 2, y0), c(-L / 2, Wd / 2, y0), c(-L / 2, Wd / 2, y1), c(-L / 2, -Wd / 2, y1)] },
  ];
  for (const sd of sides) {
    const m = sd.q[0], vis = sd.n[0] * (0 - m[0]) + sd.n[1] * (20 - m[1]) + sd.n[2] * (0 - m[2]);
    if (vis > 0) out.push({ n: sd.n, scr: sd.q.map((p) => proj(...p)), tag });
  }
  out.push({ n: [0, 1, 0], scr: [c(-L / 2, -Wd / 2, y1), c(-L / 2, Wd / 2, y1), c(L / 2, Wd / 2, y1), c(L / 2, -Wd / 2, y1)].map((p) => proj(...p)), tag: tag + 'Top' });
  return out;
}
function carFaces(x, z, hx, hz) {
  return [...boxFaces(x, z, hx, hz, 4.3, 1.8, 0.25, 0.85, 'body'), ...boxFaces(x - hx * 0.25, z - hz * 0.25, hx, hz, 2.3, 1.55, 0.85, 1.42, 'cabin')];
}
function tramFaces(t) {
  const L = t.x1 - t.x0, cx = (t.x0 + t.x1) / 2;
  const f = boxFaces(cx, t.z, 1, 0, L, 2.6, 0.35, 3.5, 'tram');
  const win = [];
  for (let i = 0; i < 9; i++) {
    const a = t.x0 + 1.2 + i * ((L - 2.4) / 9), b = a + (L - 2.4) / 9 - 0.45;
    win.push([[a, 1.55, t.z - 1.31], [b, 1.55, t.z - 1.31], [b, 2.85, t.z - 1.31], [a, 2.85, t.z - 1.31]].map((p) => proj(...p)));
  }
  const stripe = [[t.x0, 0.95, t.z - 1.31], [t.x1, 0.95, t.z - 1.31], [t.x1, 1.25, t.z - 1.31], [t.x0, 1.25, t.z - 1.31]].map((p) => proj(...p));
  return { f, win, stripe };
}

// ---------------------------------------------------------------- per frame
const FRONT = (arr, t) => { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m].tl < t) lo = m + 1; else hi = m; } return lo; };
const quad = (g, q) => { g.beginPath(); g.moveTo(q[0][0], q[0][1]); for (let i = 1; i < q.length; i++) g.lineTo(q[i][0], q[i][1]); g.closePath(); };

/** add one lamp's exposure to the route bins (moving parts only; the wait at the queue spot is a separate blob) */
function deposit(acc, R, v, off, T, S) {
  const E = R.edges, n = E.length;
  let prevTau = tauFront(v, E[0] - off), prevF = hannCDF((T - prevTau) / S);
  const sStop = v.stop ? v.sq + off : 1e9;
  for (let j = 1; j < n; j++) {
    const tau = tauFront(v, E[j] - off), F = hannCDF((T - tau) / S);
    if (R.ok[j - 1] && prevF !== F) {
      let e = prevF - F;
      if (sStop > E[j - 1] && sStop <= E[j]) e -= occupancy(v.ta, v.td, T, S);
      if (e > 0) acc[j - 1] += e;
    }
    prevF = F;
    if (tau > T + 1 && prevTau > T + 1) break;
    prevTau = tau;
  }
}

/**
 * Everything the traffic contributes to one frame, as depth-sorted items (z = metres from the window) plus the
 * additive light trails. ctx: { T, S (hours), L, Ge, mk }.
 */
export function collect(TF, ctx) {
  const T = ctx.T * 3600, S = ctx.S * 3600, L = ctx.L, Ge = ctx.Ge;
  if (!TF.scratch) TF.scratch = ctx.mk(760, 300);
  const sc = TF.scratch, items = [];
  const lights = clamp((4 - L.h) / 5), lights2 = lights * lights * (3 - 2 * lights);
  const tramLit = clamp((3 - L.h) / 4);

  // queued cars: per spot ΣW and the W-weighted colour (identical shapes, so this is the exact average)
  const qW = new Map();
  for (const key of ['SB', 'WB', 'EB']) {
    const arr = TF.veh[key], i0 = FRONT(arr, T - S - 200), i1 = FRONT(arr, T + 80);
    for (let i = i0; i < i1; i++) {
      const v = arr[i];
      if (!v.stop || v.q > 9) continue;
      const w = occupancy(v.ta, v.td, T, S);
      if (w <= 0) continue;
      const k = `${key}${v.q}`;
      let e = qW.get(k);
      if (!e) qW.set(k, (e = { w: 0, c: [0, 0, 0] }));
      e.w += w; const cc = CAR_COLS[v.col]; e.c[0] += cc[0] * w; e.c[1] += cc[1] * w; e.c[2] += cc[2] * w;
    }
  }
  const glass = hex('#2c3646');
  for (const sp of TF.spots) {
    const e = qW.get(`${sp.ap}${sp.q}`);
    if (!e || e.w < 0.004) continue;
    const col = scale(e.c, 1 / e.w);
    items.push({ z: sp.z, draw: (g) => ghost(g, sc, sp.faces, (f) => shade(f.tag === 'cabin' ? glass : f.tag === 'cabinTop' ? mix(col, glass, 0.4) : col, f.n, L), clamp(e.w)) });
  }
  // trams at their islands
  for (const ts of TF.tramStops) {
    let w = 0;
    for (const v of TF.veh[ts.key]) { if (v.td < T - S) continue; if (v.ta > T) break; w += occupancy(v.ta, v.td, T, S); }
    if (w > 0.004) items.push({ z: ts.z + 0.01, draw: (g) => drawTram(g, sc, ts, w, L, Ge * tramLit) });
  }
  // people who wait: alpha = their share of the window
  {
    const P = TF.people;
    let lo = 0, hi = P.length;
    const t0 = T - S - TF.maxWait;
    while (lo < hi) { const m = (lo + hi) >> 1; if (P[m].a < t0) lo = m + 1; else hi = m; }
    for (let i = lo; i < P.length; i++) {
      const p = P[i];
      if (p.a > T) break;
      const w = occupancy(p.a, p.b, T, S);
      if (w < 0.01) continue;
      items.push({ z: p.z, draw: (g) => drawPerson(g, p, p.shirt, p.pants, w, L) });
    }
  }
  // seats: ΣW per seat, W-weighted shirt colour
  for (const q of TF.seats) {
    let w = 0; const c = [0, 0, 0];
    for (const [a, b, k] of q.ev) { if (b < T - S) continue; if (a > T) break; const o = occupancy(a, b, T, S); w += o; c[0] += SHIRTS[k][0] * o; c[1] += SHIRTS[k][1] * o; c[2] += SHIRTS[k][2] * o; }
    if (w < 0.01) continue;
    const shirt = scale(c, 1 / w);
    items.push({ z: q.z - 0.05, draw: (g) => drawSitter(g, q, shirt, w, L) });
  }
  // walkers: a faint band, alpha = ∫ w · flux · dwell / ∫ w (6-point rule over the window)
  for (const wk of TF.walks) {
    let f = 0, ws = 0;
    for (let i = 0; i < 6; i++) { const u = (i + 0.5) / 6, w = hann(u); f += w * PEOPLE((T - u * S) / 3600); ws += w; }
    const a = clamp(((f / ws) * wk.k * 0.4) / 60 * 2.6);
    if (a < 0.006) continue;
    items.push({ z: wk.z, draw: (g) => drawWalk(g, wk, a, L) });
  }

  // light trails, drawn after the ghosts
  const trails = (g) => {
    const kHead = L_HEAD * Ge * lights2, kTail = L_TAIL * Ge * lights2;
    if (kHead < 0.03) return;
    g.globalCompositeOperation = 'lighter';
    const ROUTES = { EB: ['EB', 'EBL'], WB: ['WB', 'WBR'], SB: ['SBR', 'SBL'] };
    for (const key of ['SB', 'WB', 'EB']) {
      const acc = {};
      for (const rk of ROUTES[key]) acc[rk] = { h: new Float32Array(TF.routes[rk].edges.length), t: new Float32Array(TF.routes[rk].edges.length) };
      const arr = TF.veh[key], i0 = FRONT(arr, T - S - 200), i1 = FRONT(arr, T + 80);
      for (let i = i0; i < i1; i++) {
        const v = arr[i], R = TF.routes[v.r];
        deposit(acc[v.r].h, R, v, 0, T, S);
        deposit(acc[v.r].t, R, v, -v.len, T, S);
      }
      for (const rk of ROUTES[key]) trail(g, TF.routes[rk], acc[rk], kHead, kTail);
    }
    for (const ts of TF.tramStops) {
      const R = TF.routes[ts.key], n = R.edges.length;
      const acc = { h: new Float32Array(n), t: new Float32Array(n) }, band = new Float32Array(n);
      for (const v of TF.veh[ts.key]) {
        if (v.td + 30 < T - S) continue;
        if (v.ta - 30 > T) break;
        deposit(acc.h, R, v, 0, T, S); deposit(acc.t, R, v, -v.len, T, S);
        // the lit window band covers s while the front is in [s, s + len]: interval [τ(s), τ(s + len)], minus the dwell
        for (let j = 0; j < n - 1; j++) {
          if (!R.ok[j]) continue;
          const s = (R.edges[j] + R.edges[j + 1]) / 2, a = tauFront(v, s), b = tauFront(v, s + v.len);
          if (b < T - S || a > T) continue;
          let e = occupancy(a, b, T, S);
          if (a < v.td && b > v.ta) e -= occupancy(Math.max(a, v.ta), Math.min(b, v.td), T, S);
          if (e > 0) band[j] += e;
        }
      }
      trail(g, R, acc, kHead * 0.7, kTail * 0.9);
      ribbon(g, R, band, Ge * tramLit * L_TRAM);
    }
    // waiting cars: brake lights and headlights as blobs at the queue spots (a stopped lamp is not diluted)
    for (const sp of TF.spots) {
      const e = qW.get(`${sp.ap}${sp.q}`);
      if (!e) continue;
      const tailP = proj(sp.x - sp.hx * 2.15, 0.85, sp.z - sp.hz * 2.15), headP = proj(sp.x + sp.hx * 2.15, 0.7, sp.z + sp.hz * 2.15);
      const sz = 700 / tailP[2];
      // a lamp that stands still is not diluted and would clip at once; its level is kept ∝ W (soft knee) so a stop
      // fades in over the window instead of popping
      const kb = BLOB * lights2 * clamp(Ge / 250);
      blob(g, tailP, e.w * kb, sz, hex(RED_HEX));
      blob(g, headP, e.w * kb * 0.45, sz, hex('#fff2dc'));
    }
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
  };
  return { items, trails };
}

// ---------------------------------------------------------------- drawing helpers
const ia = (v) => 1 - Math.exp(-v);   // exposure → coverage of an additive light
/** strip of half-width hw (m) around the route, offset sideways by off (m), between edges j and k+1 */
function strip(R, j, k, off, hw) {
  const a = R.q[j], b = R.q[k + 1], y = R.lampY;
  const an = [-a.hz, a.hx], bn = [-b.hz, b.hx];
  return [
    proj(a.x + an[0] * (off - hw), y, a.z + an[1] * (off - hw)), proj(b.x + bn[0] * (off - hw), y, b.z + bn[1] * (off - hw)),
    proj(b.x + bn[0] * (off + hw), y, b.z + bn[1] * (off + hw)), proj(a.x + an[0] * (off + hw), y, a.z + an[1] * (off + hw)),
  ];
}
/**
 * Lamp trails as world-space strips (so their width follows perspective). Value per bin: k · E · (lamp size / bin
 * length) · facing; a straight run is one quad with a gradient through its bins, curves are drawn bin by bin. With
 * 'lighter' blending, neighbouring quads add up seamlessly.
 */
function trail(g, R, acc, kH, kT) {
  for (const [arr, k, colHex, side] of [[acc.t, kT, RED_HEX, 'tail'], [acc.h, kH, '#fff1da', 'head']]) {
    const col = hex(colHex);
    const val = (j) => (k * arr[j] * LAMP * R.vis[j][side]) / (R.edges[j + 1] - R.edges[j]);
    for (const [j0, j1] of R.runs) {
      let any = false;
      for (let j = j0; j <= j1; j++) if (val(j) > 0.01) { any = true; break; }
      if (!any) continue;
      for (const [off, hw, aK, vK] of [[0, 0.85, 0.3, 0.22], [0, 0.4, 0.45, 0.45], [-0.72, 0.1, 1, 1], [0.72, 0.1, 1, 1]]) {
        const q = strip(R, j0, j1, off, hw);
        const pa = proj(R.q[j0].x, R.lampY, R.q[j0].z), pb = proj(R.q[j1 + 1].x, R.lampY, R.q[j1 + 1].z);
        if (j1 === j0) { g.fillStyle = css(col, clamp(ia(val(j0) * vK) * aK)); quad(g, q); g.fill(); continue; }
        const gr = g.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
        const dx = pb[0] - pa[0], dy = pb[1] - pa[1], dl = dx * dx + dy * dy || 1;
        for (let j = j0; j <= j1; j++) {
          const m0 = proj(R.q[j].x, R.lampY, R.q[j].z), m1 = proj(R.q[j + 1].x, R.lampY, R.q[j + 1].z);
          const tt = clamp((((m0[0] + m1[0]) / 2 - pa[0]) * dx + ((m0[1] + m1[1]) / 2 - pa[1]) * dy) / dl);
          gr.addColorStop(tt, css(col, clamp(ia(val(j) * vK) * aK)));
        }
        g.fillStyle = gr; quad(g, q); g.fill();
      }
    }
  }
}
function ribbon(g, R, band, k) {
  if (k < 0.01) return;
  const col = hex('#ffe2b4');
  for (const [j0, j1] of R.runs) {
    const a = R.q[j0], b = R.q[j1 + 1];
    let any = false;
    for (let j = j0; j <= j1; j++) if (band[j] * k > 0.01) { any = true; break; }
    if (!any) continue;
    // the smeared band of lit windows: a soft halo and a brighter core at window height
    for (const [y0, y1, aK] of [[1.25, 3.15, 0.14], [1.75, 2.65, 0.38]]) {
      const q = [proj(a.x, y0, a.z - 1.3), proj(b.x, y0, b.z - 1.3), proj(b.x, y1, b.z - 1.3), proj(a.x, y1, a.z - 1.3)];
      const gr = g.createLinearGradient(q[0][0], q[0][1], q[1][0], q[1][1]);
      const dl = q[1][0] - q[0][0] || 1;
      for (let j = j0; j <= j1; j++) {
        const m = proj((R.q[j].x + R.q[j + 1].x) / 2, y0, R.q[j].z - 1.3);
        gr.addColorStop(clamp((m[0] - q[0][0]) / dl), css(col, clamp(ia(knee(band[j] * k)) * aK)));
      }
      g.fillStyle = gr; quad(g, q); g.fill();
    }
  }
}
function blob(g, p, v, sz, col) {
  if (v < 0.02) return;
  const r0 = Math.max(1.4, sz * 0.12);
  g.fillStyle = css(col, clamp(ia(v)));
  g.beginPath(); g.arc(p[0], p[1], r0, 0, Math.PI * 2); g.fill();
  const gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], r0 * 6);
  const a = clamp(ia(v * 0.2) * 0.55);
  gr.addColorStop(0, css(col, a)); gr.addColorStop(0.3, css(col, a * 0.35)); gr.addColorStop(1, css(col, 0));
  g.fillStyle = gr; g.beginPath(); g.arc(p[0], p[1], r0 * 6, 0, Math.PI * 2); g.fill();
}

/** draw faces opaque into the scratch canvas, then composite with alpha w (a ghost must not show its own overlaps) */
function ghost(g, sc, faces, colOf, w) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const f of faces) for (const p of f.scr) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  x0 = Math.floor(x0) - 2; y0 = Math.floor(y0) - 2; x1 = Math.ceil(x1) + 2; y1 = Math.ceil(y1) + 2;
  const W = Math.min(sc.c.width, x1 - x0), H = Math.min(sc.c.height, y1 - y0);
  const s = sc.g;
  s.setTransform(1, 0, 0, 1, 0, 0); s.globalAlpha = 1; s.globalCompositeOperation = 'source-over';
  s.clearRect(0, 0, W + 2, H + 2);
  s.setTransform(1, 0, 0, 1, -x0, -y0);
  for (const f of faces) {
    s.fillStyle = css(colOf(f));
    quad(s, f.scr); s.fill();
    s.strokeStyle = s.fillStyle; s.lineWidth = 0.6; s.stroke();
  }
  g.globalAlpha = w;
  g.drawImage(sc.c, 0, 0, W, H, x0, y0, W, H);
  g.globalAlpha = 1;
}
function drawTram(g, sc, ts, w, L, ge) {
  const body = hex('#ece6d8'), band = hex('#4f6f86'), roof = hex('#b9b7b0');
  const all = [...ts.faces.f, { scr: ts.faces.stripe, n: [0, 0, -1], tag: 'stripe' }, ...ts.faces.win.map((q) => ({ scr: q, n: [0, 0, -1], tag: 'win' }))];
  const glassC = add(shade(hex('#3c4a5e'), [0, 0, -1], L), scale(hex('#ffe2b4'), knee(L_TRAM * 2 * ge, 1.2)));
  ghost(g, sc, all, (f) => (f.tag === 'win' ? glassC : shade(f.tag === 'stripe' ? band : f.tag === 'tramTop' ? roof : body, f.n, L)), clamp(w));
}

// people: legs, body and head never overlap, so a ghost can be drawn straight onto the frame with one alpha
function drawPerson(g, p, shirtA, pantsA, w, L) {
  const base = p.p, h = base[1] - p.top[1], u = h / 1.7, cx = base[0];
  if (u < 0.5) return;
  g.globalAlpha = clamp(w);
  g.fillStyle = css(shade(pantsA, [0, 0.3, -0.95], L));
  const lw = 0.16 * u;
  g.beginPath(); g.roundRect(cx - 0.175 * u, base[1] - 0.84 * u, lw, 0.84 * u, lw / 2); g.roundRect(cx + 0.015 * u, base[1] - 0.84 * u, lw, 0.84 * u, lw / 2); g.fill();
  g.fillStyle = css(shade(shirtA, [0, 0.5, -0.86], L));
  g.beginPath(); g.roundRect(cx - 0.24 * u, base[1] - 1.44 * u, 0.48 * u, 0.58 * u, 0.15 * u); g.fill();
  g.fillStyle = css(shade(HEAD, [0, 0.8, -0.6], L));
  g.beginPath(); g.arc(cx, base[1] - 1.59 * u, 0.13 * u, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1;
}
const HEAD = hex('#6b4f40');
function drawSitter(g, q, shirtA, w, L) {
  const base = q.p, h = base[1] - q.top[1], u = h / 1.6, cx = base[0], by = base[1] - 0.45 * u;
  g.globalAlpha = clamp(w);
  g.fillStyle = css(shade(PANTS[0], [0, 0.6, -0.8], L));
  g.beginPath(); g.roundRect(cx - 0.2 * u, by - 0.02 * u, 0.4 * u, 0.36 * u, 0.08 * u); g.fill();
  g.fillStyle = css(shade(shirtA, [0, 0.5, -0.86], L));
  g.beginPath(); g.roundRect(cx - 0.23 * u, by - 0.62 * u, 0.46 * u, 0.58 * u, 0.15 * u); g.fill();
  g.fillStyle = css(shade(HEAD, [0, 0.8, -0.6], L));
  g.beginPath(); g.arc(cx, by - 0.77 * u, 0.13 * u, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1;
}
function drawWalk(g, wk, a, L) {
  const q = wk.q;
  if (Math.abs(wk.z1 - wk.z0) > 1) { g.fillStyle = css(shade(hex('#7d7f8c'), [0, 0.4, -0.9], L), a * 0.8); quad(g, q); g.fill(); return; }
  const gr = g.createLinearGradient(0, (q[0][1] + q[1][1]) / 2, 0, (q[2][1] + q[3][1]) / 2);
  const legs = shade(PANTS[1], [0, 0.3, -0.95], L), shirt = shade(hex('#9a9aa6'), [0, 0.5, -0.86], L), head = shade(HEAD, [0, 0.8, -0.6], L);
  gr.addColorStop(0, css(legs, 0)); gr.addColorStop(0.08, css(legs, a)); gr.addColorStop(0.48, css(legs, a));
  gr.addColorStop(0.52, css(shirt, a * 1.15)); gr.addColorStop(0.84, css(shirt, a)); gr.addColorStop(0.9, css(head, a * 0.6)); gr.addColorStop(1, css(head, 0));
  g.fillStyle = gr; quad(g, q); g.fill();
}
