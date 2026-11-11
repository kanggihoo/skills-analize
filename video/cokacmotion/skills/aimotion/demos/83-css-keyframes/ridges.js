/*
 * 83 · ridges.js — the mountain geometry, written once at setup as CSS text (clip-path polygon keyframes).
 * Nothing here runs per frame: the browser interpolates the polygons itself (same vertex count in every keyframe).
 *
 *   ridge-N   the silhouette: a low "folded" polygon unfolds into the full ridge (staggered, overshooting ease)
 *   lit-N     the sun-facing facets: a band under the ridge line whose depth grows from 0 as the sun rises
 *             (on every slope that descends toward the sun, a triangle peak → (peak + drop) → valley)
 */
import { rand } from '../_lib/stage.js';

export const SUN_X = 540;   // the sun rises at this x (style.css .sunrig uses the same)
const BASE = 1232;          // polygons close below the waterline (1210); the lake covers the seam

// control points [x, y] per layer (far → near); x runs past both stage edges so the slopes leave the frame
export const RIDGES = [
  { pts: [[-60, 905], [70, 858], [150, 890], [250, 812], [345, 868], [432, 930], [540, 988], [648, 934], [735, 878], [832, 826], [935, 872], [1010, 846], [1140, 902]],
    sub: 3, jitter: 5, seed: 11, fold: 0.34, rise: [0.15, 1.75], facet: 0.62, facetMax: 70 },
  { pts: [[-60, 905], [55, 858], [168, 772], [256, 846], [332, 902], [420, 1000], [540, 1066], [662, 1008], [762, 928], [852, 816], [930, 764], [1012, 826], [1140, 868]],
    sub: 3, jitter: 6, seed: 23, fold: 0.30, rise: [0.4, 2.05], facet: 0.55, facetMax: 90 },
  { pts: [[-60, 1032], [92, 990], [205, 1040], [304, 1074], [420, 1108], [540, 1122], [642, 1094], [762, 1048], [884, 1006], [992, 1040], [1140, 998]],
    sub: 4, jitter: 4, seed: 37, fold: 0.28, rise: [0.65, 2.3], facet: 0.5, facetMax: 40 },
  { pts: [[-60, 1150], [120, 1164], [262, 1184], [402, 1194], [540, 1198], [680, 1192], [822, 1178], [962, 1160], [1140, 1146]],
    sub: 3, jitter: 2, seed: 41, fold: 0.22, rise: [0.9, 2.55], facet: 0.35, facetMax: 14,
    // pines along the shore, clear of the centre so the sun's path on the water stays open: [x, height]
    pines: [[-12, 150], [34, 196], [78, 132], [118, 168], [166, 108], [208, 128], [252, 84], [300, 62],
            [742, 70], [790, 96], [838, 132], [880, 104], [926, 176], [972, 142], [1020, 204], [1070, 160]] },
];

const D = 10;   // seconds; keyframe % = t / D * 100

// ground height of a ridge's control polyline at x
function groundAt(pts, x) {
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
  }
  return pts[pts.length - 1][1];
}

// a pine silhouette, left base → tip → right base (tiers of branches)
function pine(x, yb, h) {
  const w = h * 0.44, p = [];
  const L = [[-0.5, 0], [-0.17, -0.24], [-0.4, -0.24], [-0.13, -0.49], [-0.31, -0.48], [-0.08, -0.73], [-0.19, -0.72], [0, -1]];
  for (const [u, v] of L) p.push([x + u * w, yb + v * h]);
  for (let i = L.length - 2; i >= 0; i--) p.push([x - L[i][0] * w, yb + L[i][1] * h]);
  return p;
}

/** the full top line of one ridge: subdivided, jittered (deterministic), with pines inserted by x */
function topLine(R) {
  const r = rand(R.seed);
  const line = [];
  for (let i = 0; i < R.pts.length - 1; i++) {
    const [x0, y0] = R.pts[i], [x1, y1] = R.pts[i + 1];
    for (let k = 0; k < R.sub; k++) {
      const u = k / R.sub, j = k === 0 ? 0 : (r() - 0.5) * 2 * R.jitter;
      line.push({ x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u + j, seg: i });
    }
  }
  const last = R.pts[R.pts.length - 1];
  line.push({ x: last[0], y: last[1], seg: R.pts.length - 2 });
  if (!R.pines) return line;
  // splice the pines into the ground line (each tree replaces the ground between its two base points)
  let out = line;
  for (const [px, ph] of R.pines) {
    const tree = pine(px, groundAt(R.pts, px) + 2, ph).map(([x, y]) => ({ x, y, seg: -1 }));
    const x0 = tree[0].x, x1 = tree[tree.length - 1].x;
    const before = out.filter((p) => p.x < x0), after = out.filter((p) => p.x > x1);
    out = [...before, ...tree, ...after];
  }
  return out;
}

/**
 * The lit facets. A slope is sun-facing when it descends toward SUN_X; under every such slope the band is a
 * triangle: full drop under the upper end (the peak), zero at the lower end (the valley). Each lower-boundary
 * point carries its zero-depth position (on the ridge line) and its full-depth position, so the keyframes can
 * grow the band from nothing. Walked right → left, it closes the polygon with the top line.
 */
function facetLine(line, R) {
  const lower = [];
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i], b = line[i + 1];
    const mid = (a.x + b.x) / 2;
    // left of the sun a facing slope goes down to the right; right of it, down to the left
    const facing = mid < SUN_X ? b.y > a.y + 0.5 : a.y > b.y + 0.5;
    if (!facing) { lower.push({ z: [a.x, a.y], f: [a.x, a.y] }, { z: [b.x, b.y], f: [b.x, b.y] }); continue; }
    const drop = Math.min(R.facetMax, Math.abs(b.y - a.y) * R.facet);
    // the divider under the peak leans toward the sun a little
    if (mid < SUN_X) lower.push({ z: [a.x, a.y], f: [a.x + drop * 0.22, a.y + drop] }, { z: [b.x, b.y], f: [b.x, b.y] });
    else lower.push({ z: [a.x, a.y], f: [a.x, a.y] }, { z: [b.x, b.y], f: [b.x - drop * 0.22, b.y + drop] });
  }
  return lower.reverse();
}

const fmt = (v) => (Math.round(v * 10) / 10).toString();
const poly = (pts) => `polygon(${pts.map(([x, y]) => `${fmt(x)}px ${fmt(y)}px`).join(',')})`;

/** CSS text: keyframes for every ridge (shape) and every facet band (light) */
export function ridgeCSS() {
  let css = '';
  RIDGES.forEach((R, n) => {
    const top = topLine(R);
    const full = [...top.map((p) => [p.x, p.y]), [top[top.length - 1].x, BASE], [top[0].x, BASE]];
    // folded: every point pulled toward the base line (the silhouette lies low, then stands up)
    const folded = full.map(([x, y]) => [x, BASE - (BASE - y) * R.fold]);
    const [s, e] = R.rise.map((t) => (t / D * 100).toFixed(2));
    css += `@keyframes ridge-${n + 1} {
  0%, ${s}% { clip-path: ${poly(folded)}; animation-timing-function: cubic-bezier(.22, 1.28, .36, 1); }
  ${e}%, 100% { clip-path: ${poly(full)}; }
}
`;
    // the facet band: top line forward, lower boundary back; k = 0 is a zero-area band, k = 1 full depth
    const lower = facetLine(top, R);
    const band = (k) => [...top.map((p) => [p.x, p.y]),
      ...lower.map(({ z, f }) => [z[0] + (f[0] - z[0]) * k, z[1] + (f[1] - z[1]) * k])];
    css += `@keyframes lit-${n + 1} {
  0%, 30% { clip-path: ${poly(band(0))}; animation-timing-function: cubic-bezier(.45, 0, .3, 1); }
  66%, 100% { clip-path: ${poly(band(1))}; }
}
`;
  });
  return css;
}

/** a field of stars as one box-shadow list (two sets, twinkling in opposite phase) */
export function starShadows(seed, n) {
  const r = rand(seed), out = [];
  for (let i = 0; i < n; i++) {
    const x = Math.round(r() * 1080), y = Math.round(Math.pow(r(), 1.5) * 860);
    const a = (0.35 + 0.65 * r() * r()).toFixed(2), s = r() < 0.12 ? 1 : 0;
    out.push(`${x}px ${y}px 0 ${s}px rgba(255,250,240,${a})`);
  }
  return out.join(',');
}
