/*
 * 47-embroidery/stitches.js — the pattern, worked stitch by stitch (setup only; pure, seeded).
 *
 * Every element is turned into the stitches a hand embroiderer would make:
 *   long-and-short shading  lsFlower()  — radial rows from the petal edge inwards, alternating long/short first row,
 *                                         later rows split back into the previous one, lines thinned as they converge
 *   satin                   satin()     — parallel scan lines across a polygon at a chosen angle, edge to edge
 *   satin leaf (two halves) leaf()      — from the midrib out to the edge, slanted toward the tip, one green per half
 *   stem stitch             stemStitch()— overlapping half-steps, each stitch brought up beside the last (a rope)
 *   French knots            knot()      — a coil of two wraps with the needle hole in the middle
 * Coordinates are stage px (y down). Colours are linear RGB.
 */
import { rand, clamp, lerp } from '../_lib/stage.js';

export const HOOP = { c: [540, 860], rin: 444, rout: 480 };
export const TW = 3.5;           // two strands of stranded cotton ≈ 0.55 mm at ~6.3 px/mm

export const srgb = (h) => { const v = parseInt(h.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((c) => Math.pow(c / 255, 2.2)); };
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const scl = (a, k) => [a[0] * k, a[1] * k];
const vlen = (a) => Math.hypot(a[0], a[1]);
const nrm = (a) => { const l = vlen(a) || 1; return [a[0] / l, a[1] / l]; };
const perp = (a) => [-a[1], a[0]];
const dir = (ang) => [Math.cos(ang), Math.sin(ang)];
const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];

let R = rand(4747);
const jit = (k) => (R() - 0.5) * 2 * k;

let OUT = [];
// one straight stitch: thread comes up at a, goes down at b
function stitch(a, b, col, o = {}) {
  const v = 1 + jit(0.035);    // strand-to-strand dye variation
  OUT.push({ kind: 0, a, b, w: o.w || TW, col: col.map((c) => c * v), strands: o.strands || 2, twist: o.twist ?? 0.45, h: o.h || 0, group: o.group || '' });
}
function knot(p, r, col, group) {
  OUT.push({ kind: 1, a: p, b: p, w: r, col: col.map((c) => c * (1 + jit(0.04))), strands: 2, twist: 0.45, h: 0, group });
}

// ---------- curves ----------
function bez(p0, p1, p2, p3) {
  return (t) => { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t; return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]; };
}
function arc(f, n = 240) {
  const P = [], S = [0];
  for (let i = 0; i <= n; i++) P.push(f(i / n));
  for (let i = 1; i <= n; i++) S.push(S[i - 1] + vlen(sub(P[i], P[i - 1])));
  const L = S[n];
  const at = (s) => {
    s = clamp(s, 0, L);
    let lo = 0, hi = n;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (S[m] <= s) lo = m; else hi = m; }
    const k = (s - S[lo]) / Math.max(S[hi] - S[lo], 1e-9);
    return { p: [lerp(P[lo][0], P[hi][0], k), lerp(P[lo][1], P[hi][1], k)], d: nrm(sub(P[hi], P[lo])) };
  };
  return { at, L };
}

// ---------- stitches ----------
function stemStitch(curve, col, { sl = 12, w = TW, rows = [0], s0 = 0, s1 = Infinity, group = 'stem' } = {}) {
  const { at } = curve, L = Math.min(curve.L, s1);
  for (const off of rows) {
    for (let s = s0; s + sl * 0.55 <= L; s += (sl / 2) * (0.9 + 0.2 * R())) {
      const e = Math.min(s + sl, L), A = at(s), B = at(e);
      const k = w * 0.34;    // brought up beside the previous stitch: each one leans across the line
      stitch(add(add(A.p, scl(perp(A.d), off + k)), [jit(0.3), jit(0.3)]), add(add(B.p, scl(perp(B.d), off - k)), [jit(0.3), jit(0.3)]), col, { w, group });
    }
  }
}

function satin(poly, d, colAt, { gap = 2.7, ext = 0.7, group = 'satin', w = TW } = {}) {
  const n = perp(d);
  let omin = Infinity, omax = -Infinity;
  for (const p of poly) { const o = p[0] * n[0] + p[1] * n[1]; omin = Math.min(omin, o); omax = Math.max(omax, o); }
  for (let o = omin + gap * 0.5; o < omax; o += gap * (0.9 + 0.2 * R())) {
    const hits = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length];
      const dp = p[0] * n[0] + p[1] * n[1] - o, dq = q[0] * n[0] + q[1] * n[1] - o;
      if ((dp < 0) !== (dq < 0)) { const k = dp / (dp - dq); hits.push(lerp(p[0], q[0], k) * d[0] + lerp(p[1], q[1], k) * d[1]); }
    }
    hits.sort((a, b) => a - b);
    for (let i = 0; i + 1 < hits.length; i += 2) {
      const sa = hits[i] - ext + jit(0.45), sb = hits[i + 1] + ext + jit(0.45);
      if (sb - sa < 2.2) continue;
      const base = scl(n, o + jit(0.2));
      const A = add(base, scl(d, sa)), B = add(base, scl(d, sb));
      stitch(A, B, colAt(scl(add(A, B), 0.5)), { group, w });
    }
  }
}

function leaf(base, tip, wmax, bend, colA, colB, { slant = 0.17, group = 'leaf' } = {}) {
  const ax = sub(tip, base), Lx = vlen(ax), n0 = perp(nrm(ax));
  const ctrl = add(add(base, scl(ax, 0.5)), scl(n0, bend * Lx));
  const M = (u) => { const a = 1 - u; return [a * a * base[0] + 2 * a * u * ctrl[0] + u * u * tip[0], a * a * base[1] + 2 * a * u * ctrl[1] + u * u * tip[1]]; };
  const Md = (u) => nrm([2 * (1 - u) * (ctrl[0] - base[0]) + 2 * u * (tip[0] - ctrl[0]), 2 * (1 - u) * (ctrl[1] - base[1]) + 2 * u * (tip[1] - ctrl[1])]);
  const wid = (u) => wmax * Math.pow(Math.sin(Math.PI * clamp(u)), 0.75) * (1.12 - 0.3 * u);
  const E = (u, s) => add(M(u), scl(perp(Md(u)), s * wid(u)));
  for (const [s, col] of [[1, colA], [-1, colB]]) {
    for (let u = 0.035; u < 0.965; u += (2.4 / Lx) * (0.9 + 0.2 * R())) {
      const ue = Math.min(u + slant * (1 - 0.55 * u), 0.992);
      const m = add(M(u), scl(perp(Md(u)), s * 0.9));
      const e = add(E(ue, s * 1.02), [jit(0.35), jit(0.35)]);
      if (vlen(sub(e, m)) < 2.2) continue;
      stitch(m, e, col, { group });
    }
  }
  return { M, Md };
}

const F1 = { c: [585, 735], R: 170, rin: 44, n: 5, rot: -Math.PI / 2 + 0.32, petals: [] };
function f1Edge(pt, phi) { return F1.rin + (pt.Ri - F1.rin) * Math.pow(Math.max(1 - phi * phi, 0), 0.32) * (1 - 0.08 * Math.exp(-((phi / 0.14) ** 2))) * (1 + 0.02 * Math.sin(phi * 8 + pt.i * 1.7)); }
function insideF1(p) {
  const d = sub(p, F1.c), r = vlen(d), a = Math.atan2(d[1], d[0]);
  if (r < F1.rin) return true;
  for (const pt of F1.petals) {
    let da = a - pt.th; da = Math.atan2(Math.sin(da), Math.cos(da));
    const phi = da / pt.hw;
    if (Math.abs(phi) < 1 && r < f1Edge(pt, phi)) return true;
  }
  return false;
}
function lsFlower(cols, vein) {
  const { c, rin, n } = F1;
  for (let i = 0; i < n; i++) {
    const pt = { i, th: F1.rot + (i * 2 * Math.PI) / n + jit(0.05), Ri: F1.R * (0.93 + 0.12 * R()), hw: 0.7 };
    F1.petals.push(pt);
  }
  for (const pt of F1.petals) {
    const M = Math.round((pt.Ri * 2 * pt.hw * 0.9) / 2.45);
    const lines = [];
    for (let j = 0; j < M; j++) {
      const phi = -0.985 + (1.97 * (j + 0.5)) / M + jit(0.25 / M);
      lines.push({ ang: pt.th + phi * pt.hw, r: f1Edge(pt, phi) + 0.6, long: j % 2 === 0 });
    }
    for (let row = 0; row < 9; row++) {
      let any = false;
      for (const L of lines) {
        if (L.r <= rin - 5) continue;
        const r0 = row === 0 ? L.r : L.r + 5 + jit(1.5);            // split back into the row above
        const ln = row === 0 ? (L.long ? 34 : 20) + jit(3.5) : 24 + jit(5);
        const r1 = Math.max(r0 - ln, rin - 9);
        L.r = r1;
        if (row > 0 && R() > clamp((1.3 * r0) / pt.Ri, 0.38, 1)) continue;   // the lines converge: drop some
        any = true;
        const ci = clamp(row + (R() < 0.2 ? (R() < 0.5 ? -1 : 1) : 0), 0, cols.length - 1);
        stitch(add(c, scl(dir(L.ang + jit(0.012)), r0)), add(c, scl(dir(L.ang + jit(0.012)), r1)), cols[ci], { group: 'f1' });
      }
      if (!any) break;
    }
  }
  // veins: single-strand straight stitches laid over the shading
  for (const pt of F1.petals) {
    for (const phi of [-0.32, 0, 0.32]) {
      const span = f1Edge(pt, phi) - rin, a = pt.th + phi * pt.hw * 0.8;
      const r1 = rin + 4, r2 = rin + span * (0.5 - 0.14 * Math.abs(phi)), rm = lerp(r1, r2, 0.5 + jit(0.06));
      stitch(add(c, scl(dir(a), r1)), add(c, scl(dir(a + jit(0.02)), rm)), vein, { w: 1.9, strands: 1, h: 2.2, group: 'vein' });
      stitch(add(c, scl(dir(a + jit(0.02)), rm)), add(c, scl(dir(a + jit(0.03)), r2)), vein, { w: 1.9, strands: 1, h: 2.2, group: 'vein' });
    }
  }
}

function satinFlower(F, colOf) {
  for (let i = 0; i < F.n; i++) {
    const th = F.rot + (i * 2 * Math.PI) / F.n + jit(0.04), ax = dir(th), nx = perp(ax);
    const Rp = F.R * (0.94 + 0.1 * R()), poly = [];
    const side = (s) => {
      const pts = [];
      for (let k = 0; k <= 36; k++) {
        const u = k / 36, w = F.wm * Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2)) * (0.72 + 0.42 * u);
        pts.push(add(F.c, add(scl(ax, lerp(F.r0, Rp, u)), scl(nx, s * w))));
      }
      return pts;
    };
    poly.push(...side(1), ...side(-1).reverse());
    satin(poly, rot(ax, F.slant), (p) => colOf(i, vlen(sub(p, F.c)) / Rp), { gap: F.gap || 2.7, group: F.group });
  }
}

function phyllo(c, rad, N, kr, colOf, group) {
  for (let k = 0; k < N; k++) {
    const r = rad * Math.sqrt((k + 0.5) / N), a = k * 2.39996 + jit(0.08);
    knot(add(c, add(scl(dir(a), r), [jit(0.7), jit(0.7)])), kr * (0.92 + 0.16 * R()), colOf(r / rad), group);
  }
}

/** Build the whole piece. Returns { main: [...stitches in working order], knots: [...], cut: [...threads lying on the cloth] }. */
export function buildPattern() {
  R = rand(4747); OUT = []; F1.petals = [];
  const C = (h) => srgb(h);
  // --- the big rose-pink flower: long-and-short shading, pale edge → deep centre
  lsFlower(['#fbe6df', '#f7c9c1', '#f0a3a3', '#e07a87', '#c44f66', '#962b47', '#7a1f3a'].map(C), C('#6e1532'));
  // --- leaves and the main stem
  const gLa = C('#9cbf72'), gLb = C('#62904a'), gDa = C('#86ab60'), gDb = C('#4f7a3a');
  leaf([592, 1000], [716, 930], 31, 0.12, gLa, gLb);
  leaf([578, 1078], [462, 1042], 27, -0.1, gDa, gDb);
  const S1 = arc(bez([548, 1236], [545, 1120], [600, 1000], [588, 860]));
  let s1end = S1.L;
  while (s1end > 0 && insideF1(S1.at(s1end).p)) s1end -= 1;
  const stemC = C('#4b6e35'), stemC2 = C('#5d8443');
  stemStitch(S1, stemC, { rows: [-1.9, 1.9], s1: s1end + 3 });
  // --- the blue satin flower and its stem
  const S2 = arc(bez([540, 1238], [520, 1150], [420, 1110], [296, 1000]));
  stemStitch(S2, stemC2, { sl: 11 });
  leaf([367, 1058], [296, 1112], 20, 0.15, gLa, gLb, { slant: 0.2 });
  const F2 = { c: [300, 960], R: 86, r0: 15, wm: 30, n: 5, rot: -Math.PI / 2 - 0.2, slant: 1.12, group: 'f2' };
  const blue = [C('#7fa3e3'), C('#5e84cf'), C('#4466b8')];
  satinFlower(F2, (i, u) => (u < 0.42 ? blue[2] : i % 2 ? blue[0] : blue[1]));
  // --- the bud: stem, leaf, satin bud in two pinks, then the calyx over its base
  const S3 = arc(bez([556, 1236], [600, 1170], [720, 1120], [795, 1046]));
  stemStitch(S3, stemC2, { sl: 11 });
  leaf([664, 1144], [737, 1206], 22, -0.15, gDa, gDb, { slant: 0.2 });
  {
    const Bb = [795, 1044], ax = dir(-1.2), nx = perp(ax), poly = [];
    for (let k = 0; k <= 30; k++) { const u = k / 30, w = 15 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 0.8); poly.push(add(Bb, add(scl(ax, 80 * u), scl(nx, w)))); }
    for (let k = 30; k >= 0; k--) { const u = k / 30, w = 15 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 0.8); poly.push(add(Bb, add(scl(ax, 80 * u), scl(nx, -w)))); }
    const p1 = C('#e5778f'), p2 = C('#f4aebd'), p3 = C('#fbd3da');
    satin(poly, rot(ax, 1.25), (p) => { const u = ((p[0] - Bb[0]) * ax[0] + (p[1] - Bb[1]) * ax[1]) / 80; return u < 0.45 ? p1 : u < 0.75 ? p2 : p3; }, { gap: 2.6, group: 'bud' });
    leaf(Bb, add(Bb, scl(dir(-1.2 - 0.5), 44)), 9, 0.25, gLa, gLb, { slant: 0.22, group: 'calyx' });
    leaf(Bb, add(Bb, scl(dir(-1.2 + 0.45), 40)), 9, -0.25, gDa, gDb, { slant: 0.22, group: 'calyx' });
  }
  // --- forget-me-nots on a thin stem
  const S4 = arc(bez([468, 1125], [400, 1000], [420, 820], [318, 650]));
  stemStitch(S4, stemC2, { sl: 10, w: 3.0 });
  stemStitch(arc(bez([322, 660], [300, 680], [270, 690], [252, 700])), stemC2, { sl: 9, w: 2.8 });
  stemStitch(arc(bez([326, 652], [340, 620], [355, 595], [370, 578])), stemC2, { sl: 9, w: 2.8 });
  leaf([352, 742], [262, 800], 17, 0.18, gLa, gLb, { slant: 0.22 });
  const FM = [[318, 642, 26], [252, 700, 22], [372, 576, 24]];
  const fmA = C('#a8cdf0'), fmB = C('#83b0e3');
  FM.forEach(([x, y, r], j) => {
    for (let i = 0; i < 5; i++) {
      const th = -Math.PI / 2 + j + (i * 2 * Math.PI) / 5, pc = add([x, y], scl(dir(th), r * 0.52)), poly = [];
      for (let k = 0; k < 24; k++) { const a = (k / 24) * 2 * Math.PI; poly.push(add(pc, scl(dir(a), r * 0.42 * (1 - 0.12 * Math.exp(-(((Math.cos(a - th) - 1) / 0.08) ** 2)))))); }
      satin(poly, rot(dir(th), Math.PI / 2 + 0.3), () => (i % 2 ? fmA : fmB), { gap: 2.5, group: 'fmn' });
    }
  });
  const main = OUT;
  // --- French knots last: the centres
  OUT = [];
  phyllo(F1.c, 41, 74, 4.6, (u) => (u < 0.42 ? C('#f8da7a') : u < 0.78 ? C('#eab040') : R() < 0.5 ? C('#a8692a') : C('#7a4a22')), 'k1');
  phyllo(F2.c, 13.5, 11, 4.2, (u) => (u < 0.6 ? C('#f6d562') : C('#e39b35')), 'k2');
  for (const [x, y] of FM) knot([x, y], 4.2, C('#f6d35a'), 'k3');
  for (const [x, y] of [[206, 648], [226, 620], [418, 522], [396, 497], [440, 548], [200, 742]]) knot([x, y], 4.0, R() < 0.5 ? fmA : fmB, 'k4');
  const knots = OUT;
  // --- threads lying on the cloth outside the hoop (static props)
  const cut = [];
  const lay = (f, col, w = TW) => {
    const c = arc(f);
    const segs = [];
    for (let s = 0; s < c.L; s += 10) { const e = Math.min(s + 11, c.L); segs.push({ a: c.at(s).p, b: c.at(e).p, s }); }
    cut.push({ segs, col, w });
  };
  lay(bez([150, 1560], [330, 1420], [420, 1640], [610, 1500]), C('#e07a87'));
  lay(bez([170, 1610], [360, 1520], [430, 1700], [690, 1585]), C('#62904a'));
  lay(bez([760, 1440], [880, 1380], [960, 1520], [1040, 1470]), C('#eab040'));
  return { main, knots, cut, F1 };
}
