/*
 * 50-neon/sign.js — the sign, as a neon bender would lay it out: single-line tube centrelines.
 *
 * Design units: the sign is 2 wide (x right, y up, origin at its centre); world = SC × design, placed at
 * (0, CY) on the wall. Each TUBE is one glass unit with an electrode at each end; it is a list of RUNS, lit
 * or blacked out (the bender paints the crossovers between strokes black so they don't glow). Curves are
 * sampled into short straight segments.
 *   border  — a rounded rectangle, green phosphor (argon-mercury + green coating), electrodes at the bottom
 *   cup     — rim + body as one loop, handle, saucer: clear argon-mercury (pale blue)
 *   steam   — three wavy lines, warm-white phosphor
 *   커피    — clear neon (red-orange); the ㅣ of 피 is the failing tube
 */
export const SC = 1.12, CY = 2.05;
export const TYPES = { NEON: 0, ARHG: 1, GREEN: 2, WHITE: 3 };

const line = (a, b, n = 1) => Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]);
function cubic(p0, p1, p2, p3, n = 14) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, m = 1 - t;
    out.push([m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
      m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]);
  }
  return out;
}
function arc(cx, cy, r, a0, a1, n = 8) {
  return Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
}
const join = (...parts) => parts.reduce((acc, p) => acc.concat(acc.length ? p.slice(1) : p), []);
const off = (pts, dx, dy, k = 0.55) => pts.map(([x, y]) => [dx + x * k / 0.55, dy + y * k / 0.55]);

function border() {
  const x0 = -1, x1 = 1, y0 = -0.95, y1 = 0.95, r = 0.14, H = Math.PI / 2;
  return [{ lit: true, pts: join(
    line([0.035, y0], [x1 - r, y0]), arc(x1 - r, y0 + r, r, -H, 0),
    line([x1, y0 + r], [x1, y1 - r], 3), arc(x1 - r, y1 - r, r, 0, H),
    line([x1 - r, y1], [x0 + r, y1], 3), arc(x0 + r, y1 - r, r, H, 2 * H),
    line([x0, y1 - r], [x0, y0 + r], 3), arc(x0 + r, y0 + r, r, 2 * H, 3 * H),
    line([x0 + r, y0], [-0.035, y0])) }];
}
function cupBody() {
  // the rim's front arc from right to left, then down the left side, along the bottom, up the right side
  const rim = Array.from({ length: 13 }, (_, i) => { const a = i / 12; return [0.262 - 0.524 * a, 0.445 - 0.045 * Math.sin(Math.PI * a)]; });
  return [{ lit: true, pts: join(rim,
    cubic([-0.262, 0.445], [-0.262, 0.17], [-0.2, 0.06], [-0.08, 0.05]),
    line([-0.08, 0.05], [0.08, 0.05]),
    cubic([0.08, 0.05], [0.2, 0.06], [0.262, 0.17], [0.262, 0.415])) }];
}
const handle = () => [{ lit: true, pts: cubic([0.262, 0.37], [0.42, 0.39], [0.43, 0.17], [0.235, 0.16], 16) }];
const saucer = () => [{ lit: true, pts: join(cubic([-0.42, 0.045], [-0.38, 0.0], [-0.3, -0.012], [-0.15, -0.012], 8), line([-0.15, -0.012], [0.15, -0.012]), cubic([0.15, -0.012], [0.3, -0.012], [0.38, 0.0], [0.42, 0.045], 8)) }];
function steam(x0, ph) {
  const pts = [];
  for (let i = 0; i <= 16; i++) { const y = 0.53 + 0.27 * i / 16; pts.push([x0 + 0.028 * Math.sin((y - 0.53) * 21 + ph) * (0.6 + 0.4 * i / 16), y]); }
  return [{ lit: true, pts }];
}
// 커 and 피 in a 0.55 box, bottom-left at (dx, dy)
const K_X = -0.62, P_X = 0.08, L_Y = -0.82;
function kieuk() {
  return [
    { lit: true, pts: off(join(line([0.04, 0.48], [0.25, 0.48]), cubic([0.25, 0.48], [0.265, 0.31], [0.18, 0.13], [0.06, 0.05], 12)), K_X, L_Y) },
    { lit: false, pts: off(line([0.06, 0.05], [0.05, 0.27]), K_X, L_Y) },
    { lit: true, pts: off(line([0.05, 0.27], [0.205, 0.27]), K_X, L_Y) },
    { lit: false, pts: off(cubic([0.205, 0.27], [0.25, 0.27], [0.29, 0.285], [0.33, 0.285], 5), K_X, L_Y) },
    { lit: true, pts: off(line([0.33, 0.285], [0.432, 0.285]), K_X, L_Y) },
  ];
}
const eo = () => [{ lit: true, pts: off(line([0.465, 0.53], [0.465, 0.02], 2), K_X, L_Y) }];
const pieupTop = () => [{ lit: true, pts: off(line([0.03, 0.47], [0.29, 0.47]), P_X, L_Y) }];
function pieupU() {
  return [
    { lit: true, pts: off(line([0.02, 0.08], [0.30, 0.08]), P_X, L_Y) },
    { lit: false, pts: off(cubic([0.30, 0.08], [0.31, 0.11], [0.25, 0.12], [0.222, 0.135], 5), P_X, L_Y) },
    { lit: true, pts: off(line([0.222, 0.135], [0.215, 0.425]), P_X, L_Y) },
    { lit: false, pts: off(cubic([0.215, 0.425], [0.2, 0.44], [0.12, 0.44], [0.102, 0.425], 6), P_X, L_Y) },
    { lit: true, pts: off(line([0.102, 0.425], [0.107, 0.135]), P_X, L_Y) },
  ];
}
const i_ = () => [{ lit: true, pts: off(line([0.445, 0.53], [0.445, 0.02], 2), P_X, L_Y) }];

// ignite: when the transformer reaches this tube; fail: the stuttering one
export const TUBES = [
  { name: 'border', type: TYPES.GREEN, ignite: 0.95, runs: border() },
  { name: 'cup', type: TYPES.ARHG, ignite: 1.75, runs: cupBody() },
  { name: 'handle', type: TYPES.ARHG, ignite: 1.9, runs: handle() },
  { name: 'saucer', type: TYPES.ARHG, ignite: 2.05, runs: saucer() },
  { name: 'steam1', type: TYPES.WHITE, ignite: 2.5, runs: steam(-0.115, 0.0) },
  { name: 'steam2', type: TYPES.WHITE, ignite: 2.62, runs: steam(0.0, 1.9) },
  { name: 'steam3', type: TYPES.WHITE, ignite: 2.74, runs: steam(0.115, 3.7) },
  { name: 'ㅋ+tick', type: TYPES.NEON, ignite: 3.2, runs: kieuk() },
  { name: 'ㅓ', type: TYPES.NEON, ignite: 3.42, runs: eo() },
  { name: 'ㅍ top', type: TYPES.NEON, ignite: 3.7, runs: pieupTop() },
  { name: 'ㅍ U', type: TYPES.NEON, ignite: 3.86, runs: pieupU() },
  { name: 'ㅣ', type: TYPES.NEON, ignite: 4.2, runs: i_(), fail: true },
];

/**
 * flatten into segments (world metres): seg = [ax, ay, bx, by, s0, len, tube, blackout]
 * and a tube table: [segStart, segCount, totalLen, type] + bbox, + the two electrode ends.
 */
export function buildSign() {
  const segs = [], tubes = [];
  TUBES.forEach((T, ti) => {
    const start = segs.length;
    let s = 0;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const run of T.runs) {
      const P = run.pts.map(([x, y]) => [x * SC, CY + y * SC]);
      for (let i = 0; i < P.length - 1; i++) {
        const [ax, ay] = P[i], [bx, by] = P[i + 1], L = Math.hypot(bx - ax, by - ay);
        if (L < 1e-5) continue;
        segs.push([ax, ay, bx, by, s, L, ti, run.lit ? 0 : 1]);
        s += L;
        x0 = Math.min(x0, ax, bx); y0 = Math.min(y0, ay, by); x1 = Math.max(x1, ax, bx); y1 = Math.max(y1, ay, by);
      }
    }
    const first = segs[start], last = segs[segs.length - 1];
    tubes.push({ ...T, segStart: start, segCount: segs.length - start, len: s, bbox: [x0, y0, x1, y1],
      ends: [[first[0], first[1]], [last[2], last[3]]] });
  });
  return { segs, tubes };
}
