/*
 * 25 · 목탄 스케치 — WebGL2 charcoal on a paper tooth height field.
 * The paper is a height field (felted cells + laid lines + chain lines + fibre noise), baked once.
 * Every mark is scripted in setup(): construction lines, contours, hatching (tip of the stick) and massing
 * (side of the stick) are ribbons with a pressure curve and a birth time; a fragment shader deposits
 * charcoal only where the paper height exceeds a threshold that drops with pressure (light strokes catch only
 * the peaks of the tooth, heavy ones fill the valleys). A blending stump / tissue advects and blurs the
 * deposit along its path; a kneaded eraser lifts it with a soft, tooth-dependent footprint.
 * The deposit is cumulative and order-dependent, so seeking uses replay(): fixed 1/30 s steps, each step draws
 * the stroke pieces born in it and applies the smudge / erase passes active in it; checkpoints are GPU copies.
 */
import { defineDemo, replay, rand, track, ease, clamp, lerp } from '../_lib/stage.js';

const D = 10, FPS = 30, DT = 1 / FPS, W = 1080, H = 1920, TAU = Math.PI * 2;

// ---------------------------------------------------------------- shaders
const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
out vec4 o;
float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float worley(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float d = 9.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(x, y), q = vec2(hash(i + g), hash(i + g + 17.31));
    d = min(d, length(g + q - f));
  }
  return d;
}
`;

// the paper's tooth: 0 = valley, 1 = peak. Stage coordinates (y down).
const HEIGHT = HEAD + `
void main() {
  vec2 sp = vec2(gl_FragCoord.x, 1920.0 - gl_FragCoord.y);
  float cells = 1.0 - worley(sp / 7.5);                       // felted surface, ~8 px grains
  float lumps = vnoise(sp / 26.0);                              // coarser cockle
  float wav = vnoise(sp * vec2(0.004, 0.02)) * 3.0;
  float laid = 0.5 + 0.5 * sin(6.2831853 * (sp.y + wav) / 4.6);  // laid lines of an Ingres-type sheet
  laid *= 0.65 + 0.35 * vnoise(sp * vec2(0.08, 0.5));
  float chain = smoothstep(0.92, 1.0, cos(6.2831853 * (sp.x + 5.0 * vnoise(sp * vec2(0.01, 0.003))) / 112.0));
  float fine = 0.5 * vnoise(sp * 0.9) + 0.5 * vnoise(sp * 0.45);
  float raw = 0.36 * cells + 0.16 * lumps + 0.26 * laid + 0.17 * fine + 0.08 * chain;
  o = vec4(smoothstep(0.2, 0.8, raw), 0, 0, 1);
}`;

// a charcoal mark: ribbon vertices carry side (−1..1), arc length, pressure, half width, seed and kind
const STROKE_VS = `#version 300 es
in vec2 pos; in float side, arc, press, hw, seed, kind;
out float v, s, p, w, sd, k;
void main() {
  v = side; s = arc; p = press; w = hw; sd = seed; k = kind;
  gl_Position = vec4(pos.x / 540.0 - 1.0, 1.0 - pos.y / 960.0, 0, 1);
}`;
const STROKE_FS = HEAD + `
uniform sampler2D Ht;
in float v, s, p, w, sd, k;
void main() {
  float h = texelFetch(Ht, ivec2(gl_FragCoord.xy), 0).r;
  float av = abs(v);
  float side = step(0.5, k);
  // across the mark: the tip is a rounded nib; the side of the stick is a flat bar with crumbly ends
  float ragged = 0.3 * (vnoise(vec2(s * 0.035, sd * 5.0)) - 0.5);
  float edge = mix(1.0 - smoothstep(0.4, 1.0, av), 1.0 - smoothstep(0.62, 1.0, av + ragged), side);
  // the stick's own grain drags striations along the mark
  float streak = vnoise(vec2(v * w * mix(0.55, 0.32, side) + sd * 13.0, s * mix(0.012, 0.004, side) + sd));
  streak = mix(0.55, 1.25, streak);
  float pe = p * edge * streak * (0.85 + 0.3 * vnoise(vec2(s * 0.05, sd * 7.0)));
  // deposit only where the paper is higher than the threshold; pressure pushes the threshold into the valleys
  float thr = 1.0 - pe * mix(1.12, 0.98, side);
  float dep = smoothstep(thr - 0.08, thr + 0.05, h);
  float crumb = step(0.9975, hash(gl_FragCoord.xy + sd * 31.0)) * p * edge;   // loose crumbs pressed in
  float a = clamp(dep * (0.32 + 0.6 * p) + crumb * 0.6, 0.0, 1.0);
  o = vec4(a, 0, 0, a);                           // blended as d + (1 - d)·a
}`;

// blending stump / tissue: pick up charcoal upstream of the moving footprint, blurred, and lay it down here
const SMUDGE = HEAD + `
uniform sampler2D Dt;
uniform vec2 F, dir, res;
uniform float R, str, adv, seed, tap;
void main() {
  vec2 fc = gl_FragCoord.xy, q = fc - F;
  float d0 = texelFetch(Dt, ivec2(fc), 0).r;
  float r = length(q) / R + 0.18 * (vnoise(q * 0.06 + seed) - 0.5);
  vec2 nrm = vec2(-dir.y, dir.x);
  float fp = (1.0 - smoothstep(0.3, 1.0, r)) * str * (0.8 + 0.4 * vnoise(vec2(dot(q, nrm) * 0.35, seed)));
  vec2 up = fc - dir * adv;
  float b = 0.36 * texture(Dt, up / res).r
          + 0.16 * (texture(Dt, (up + nrm * tap) / res).r + texture(Dt, (up - nrm * tap) / res).r
                  + texture(Dt, (up + dir * tap) / res).r + texture(Dt, (up - dir * tap) / res).r);
  o = vec4(mix(d0, b * 0.985, fp), 0, 0, 1);
}`;

// kneaded eraser: lifts charcoal from the peaks easily, from the valleys only partly
const ERASE = HEAD + `
uniform sampler2D Dt, Ht;
uniform vec2 F;
uniform float R, str, seed;
void main() {
  vec2 fc = gl_FragCoord.xy, q = fc - F;
  float d0 = texelFetch(Dt, ivec2(fc), 0).r, h = texelFetch(Ht, ivec2(fc), 0).r;
  float r = length(q) / R + 0.3 * (vnoise(q * 0.09 + seed) - 0.5);
  float fp = (1.0 - smoothstep(0.45, 1.0, r)) * str;
  float lift = mix(0.35, 1.0, smoothstep(0.3, 0.75, h));
  o = vec4(d0 * (1.0 - fp * lift), 0, 0, 1);
}`;

// the sheet under a raking lamp, on a drawing board
const DISPLAY = HEAD + `
uniform sampler2D Dt, Ht;
uniform vec2 res;
uniform float zoom, lamp;
void main() {
  vec2 fc = gl_FragCoord.xy, c = res * 0.5;
  vec2 p = c + (fc - c) / zoom;
  vec2 e = min(p, res - p);
  float edge = min(e.x, e.y);
  vec2 sv = fc / res;
  float pool = (1.0 - 0.24 * length((sv - vec2(0.25, 0.8)) * vec2(1.0, 0.72))) * lamp;
  if (edge < 0.0) {
    vec3 board = vec3(0.2, 0.17, 0.14) * (0.8 + 0.2 * vnoise(p * vec2(0.004, 0.05)));
    board *= 1.0 - 0.6 * exp(edge / 9.0);
    o = vec4(board * pool, 1);
    return;
  }
  vec2 uv = p / res, px = 1.0 / res;
  float d = texture(Dt, uv).r, h = texture(Ht, uv).r;
  float hx = texture(Ht, uv + vec2(px.x, 0)).r - texture(Ht, uv - vec2(px.x, 0)).r;
  float hy = texture(Ht, uv + vec2(0, px.y)).r - texture(Ht, uv - vec2(0, px.y)).r;
  vec3 n = normalize(vec3(-hx * 0.6, -hy * 0.6, 1.0));
  vec3 L = normalize(vec3(-0.6, 0.55, 0.6));
  float rel = dot(n, L) - L.z;                                  // tooth tilted toward / away from the lamp
  vec3 paper = vec3(0.93, 0.9, 0.84) * (0.965 + 0.05 * vnoise(p * 0.006) + 0.03 * (h - 0.5));
  float dark = 1.0 - exp(-2.5 * d);
  vec3 col = mix(paper, vec3(0.115, 0.11, 0.125), dark);
  col *= 1.0 + rel * mix(0.9, 0.5, dark);
  col += vec3(0.05) * smoothstep(0.75, 1.0, d) * clamp(rel * 6.0, 0.0, 1.0);   // compressed charcoal sheen
  col *= 1.0 - 0.35 * exp(-edge / 2.5) * 0.4;                  // the cut edge of the sheet
  o = vec4(clamp(col * pool, 0.0, 1.0), 1);
}`;

// ---------------------------------------------------------------- geometry
const crPt = (a, b, c, d, u) => {
  const u2 = u * u, u3 = u2 * u, f = (i) => 0.5 * (2 * b[i] + (-a[i] + c[i]) * u + (2 * a[i] - 5 * b[i] + 4 * c[i] - d[i]) * u2 + (-a[i] + 3 * b[i] - 3 * c[i] + d[i]) * u3);
  return [f(0), f(1)];
};
/** Catmull–Rom through control points (open, or closed) */
function cr(ctrl, closed = false, step = 2.5) {
  const n = ctrl.length, out = [], segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const g = (j) => ctrl[closed ? (j + n) % n : clamp(j, 0, n - 1)];
    const p1 = g(i), p2 = g(i + 1), k = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let j = 0; j < k; j++) out.push(crPt(g(i - 1), p1, p2, g(i + 2), j / k));
  }
  if (!closed) out.push(ctrl[n - 1].slice(0, 2));
  return out;
}
/** elliptical arc, angle a in screen terms (0 = right, π/2 = front/bottom) */
function ell(cx, cy, rx, ry, a0, a1, step = 2.5) {
  const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / step));
  return Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
}
function resample(pts, step) {
  const out = [pts[0].slice(0, 2)];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let s = step - carry;
    while (s <= L) { out.push([a[0] + (b[0] - a[0]) * s / L, a[1] + (b[1] - a[1]) * s / L]); s += step; }
    carry = L - (s - step);
  }
  const last = pts[pts.length - 1];
  if (Math.hypot(last[0] - out[out.length - 1][0], last[1] - out[out.length - 1][1]) > step * 0.3) out.push(last.slice(0, 2));
  return out;
}
const polyLen = (P) => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
function pip([x, y], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
/** the visible runs of a line that passes behind objects */
function clipRuns(pts, polys) {
  const runs = [];
  let cur = [];
  for (const p of resample(pts, 2.5)) {
    if (polys.some((q) => pip(p, q))) { if (cur.length > 3) runs.push(cur); cur = []; } else cur.push(p);
  }
  if (cur.length > 3) runs.push(cur);
  return runs;
}
/** a thin shadow band on the right of a fold line, tapered at both ends */
function bandPoly(pts, w) {
  const q = resample(pts, 6), n = q.length;
  return [...q, ...q.map((p, i) => [p[0] + w * Math.sin(Math.PI * i / (n - 1)), p[1] + 0.3 * w * Math.sin(Math.PI * i / (n - 1))]).reverse()];
}
// scan-line intervals of a polygon (even–odd) and interval subtraction, for clipping hatch lines to a region
function intervals(poly, y) {
  const xs = [];
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y)) xs.push(xi + (y - yi) / (yj - yi) * (xj - xi));
  }
  xs.sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]);
  return out;
}
function subtract(iv, cut) {
  let out = iv;
  for (const [c0, c1] of cut) {
    const next = [];
    for (const [a, b] of out) {
      if (c1 <= a || c0 >= b) { next.push([a, b]); continue; }
      if (c0 > a) next.push([a, c0]);
      if (c1 < b) next.push([c1, b]);
    }
    out = next;
  }
  return out;
}
/** parallel lines at `angle` (rad) clipped to region minus exclusions → [[a, b], …] in rows (for zigzags) */
function hatchRows(region, excl, angle, spacing, rnd, { jit = 0.3, inset = 4 } = {}) {
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const rot = (p) => [p[0] * ca + p[1] * sa, -p[0] * sa + p[1] * ca], unrot = (x, y) => [x * ca - y * sa, x * sa + y * ca];
  const A = region.map(rot), E = excl.map((e) => e.map(rot));
  let y0 = Infinity, y1 = -Infinity;
  for (const p of A) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  const rows = [];
  for (let y = y0 + spacing * (0.3 + 0.4 * rnd()); y < y1; y += spacing * (1 + (rnd() - 0.5) * jit)) {
    let iv = intervals(A, y);
    for (const e of E) iv = subtract(iv, intervals(e, y));
    const row = [];
    for (const [a, b] of iv) {
      const a2 = a + inset * (0.5 + rnd()), b2 = b - inset * (0.5 + rnd());
      if (b2 - a2 > 8) row.push([unrot(a2, y), unrot(b2, y)]);
    }
    if (row.length) rows.push(row);
  }
  return rows;
}

// ---------------------------------------------------------------- marks and tool operations
const PROFILE = {
  even: (s) => ramp01(s / 0.06) * (1 - 0.8 * ramp01((s - 0.9) / 0.1)),
  flick: (s) => ramp01(s / 0.05) * (1 - 0.85 * ramp01((s - 0.35) / 0.65)),
  swell: (s) => Math.sqrt(Math.max(0, Math.sin(Math.PI * s))),
  lift: (s) => ramp01(s / 0.05) * (1 - 0.6 * s),
};
function ramp01(x) { x = clamp(x); return x * x * (3 - 2 * x); }
/** hand tremor: a slow sideways drift along the arc length */
function wobble(P, rnd, amp) {
  const a = rnd() * TAU, b = rnd() * TAU, f1 = 40 + rnd() * 40, f2 = 14 + rnd() * 10;
  let s = 0;
  return P.map((p, i) => {
    const q = P[Math.min(i + 1, P.length - 1)], r = P[Math.max(i - 1, 0)];
    let tx = q[0] - r[0], ty = q[1] - r[1];
    const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    if (i) s += Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]);
    const d = amp * (0.7 * Math.sin(s / f1 + a) + 0.3 * Math.sin(s / f2 + b));
    return [p[0] - ty * d, p[1] + tx * d];
  });
}
/** one mark of the stick. kind 0 = tip, 1 = side (massing) */
function mark(pts, rnd, { p = 0.5, hw = 2.6, kind = 0, profile = 'even', tone = null, wob = 1.0 } = {}) {
  let q = resample(pts, 2.5);
  if (wob) q = wobble(q, rnd, wob);
  const n = q.length, ph = rnd() * TAU, f = 25 + rnd() * 25;
  const press = q.map((pt, i) => {
    const s = i / Math.max(1, n - 1);
    let k = PROFILE[profile](s) * (1 + 0.12 * Math.sin(i * 2.5 / f + ph));
    if (tone) k *= tone(pt[0], pt[1]);
    return clamp(p * k, 0, 1);
  });
  return { type: 'mark', tool: kind ? 'chunk' : 'stick', pts: q, press, hw, kind, seed: rnd() * 100, len: n * 2.5 };
}
/** a stump / tissue / eraser operation along a path (dab = held in place) */
function op(type, pts, rnd, { R = 24, str = 0.5, dab = 0, tool } = {}) {
  const q = pts.length > 1 ? resample(pts, 2) : [pts[0], pts[0]];
  return { type, tool: tool || (type === 'erase' ? 'eraser' : R > 34 ? 'tissue' : 'stump'), pts: q, R, str, dab, seed: rnd() * 100, len: dab ? 0 : polyLen(q) };
}
/** lay a list of marks / operations end to end inside [t0, t1]: duration ~ length^0.75, lifts ~ travel */
function schedule(list, t0, t1) {
  let prev = null;
  const w = list.map((o) => {
    const g = prev ? 0.04 + Math.hypot(o.pts[0][0] - prev[0], o.pts[0][1] - prev[1]) * 0.0008 : 0;
    prev = o.pts[o.pts.length - 1];
    return [g, o.dab ? o.dab : 0.03 + Math.pow(o.len, 0.75) * 0.004];
  });
  const k = (t1 - t0) / w.reduce((s, [g, d]) => s + g + d, 0);
  let t = t0;
  list.forEach((o, i) => { t += w[i][0] * k; o.t0 = t; o.dur = w[i][1] * k; t += o.dur; });
  return list;
}
/** progress along an op at time t: hands speed up in the middle of a stroke */
const prog = (o, t) => { const x = clamp((t - o.t0) / o.dur); return 0.5 - 0.5 * Math.cos(Math.PI * x); };
function pointAt(o, u) {
  const f = u * (o.pts.length - 1), i = Math.min(o.pts.length - 2, Math.floor(f)), k = f - i;
  const a = o.pts[i], b = o.pts[i + 1];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, b[0] - a[0], b[1] - a[1]];
}

// ---------------------------------------------------------------- the still life (stage px, y down)
const PEAR_CTRL = [[340, 938], [380, 950], [406, 990], [412, 1040], [430, 1090], [478, 1140], [496, 1210], [484, 1280], [440, 1330], [370, 1350],
  [295, 1338], [240, 1290], [224, 1215], [242, 1140], [282, 1090], [290, 1040], [284, 990], [302, 952]];
const PEAR = cr(PEAR_CTRL, true, 6);
const PEAR_R = [[322, 942], [340, 938], [380, 950], [406, 990], [412, 1040], [430, 1090], [478, 1140], [496, 1210], [484, 1280], [440, 1330], [370, 1350]];
const PEAR_L = [[318, 945], [302, 952], [284, 990], [290, 1040], [282, 1090], [242, 1140], [224, 1215], [240, 1290], [295, 1338], [372, 1351]];
const PEAR_SH = [[402, 975], [412, 1040], [430, 1090], [478, 1140], [496, 1210], [484, 1280], [440, 1330], [370, 1350], [300, 1340], [345, 1318], [405, 1285],
  [442, 1225], [445, 1160], [415, 1100], [392, 1048], [386, 1000]];
const PEAR_CORE = [[395, 995], [402, 1045], [420, 1095], [452, 1140], [470, 1200], [462, 1262], [430, 1305], [385, 1325], [350, 1330], [395, 1300], [432, 1250],
  [440, 1180], [420, 1120], [395, 1070], [385, 1020]];
const STEM = [[338, 944], [342, 915], [352, 893], [366, 882]];
const STEMBOX = [[322, 850], [384, 850], [384, 950], [322, 950]];
const CUP_R = [[860, 1010], [852, 1080], [822, 1150], [780, 1195], [772, 1212]];
const CUP_L = [[610, 1010], [618, 1080], [648, 1150], [690, 1195], [698, 1212]];
const CUP = [...ell(735, 1010, 125, 32, Math.PI, TAU, 6), ...cr(CUP_R, false, 6), [772, 1222], [735, 1227], [698, 1222], ...cr(CUP_L, false, 6).reverse()];
const RIM = ell(735, 1010, 125, 32, 0, TAU, 6);
const CUP_IN_SH = [...ell(735, 1010, 121, 29, Math.PI * 0.62, Math.PI * 1.72, 6), [760, 1000], [720, 1025]];
const CUP_SH = [[860, 1012], [852, 1080], [822, 1150], [780, 1195], [770, 1212], [752, 1212], [790, 1160], [815, 1100], [822, 1040]];
const HANDLE_O = [[856, 1040], [915, 1048], [936, 1095], [906, 1150], [836, 1162]];
const HANDLE_I = [[840, 1140], [884, 1132], [905, 1100], [894, 1070], [852, 1064]];
const HANDLE = [...cr(HANDLE_O, false, 6), ...cr(HANDLE_I, false, 6)];
const SAUCER = ell(735, 1245, 197, 47, 0, TAU, 6);
const SAUCER_BAND = [...ell(735, 1240, 195, 42, 0.05, Math.PI - 0.05, 6), ...ell(735, 1252, 188, 40, Math.PI - 0.1, 0.1, 6)];
const SAUCER_RT = [...ell(735, 1240, 192, 39, -Math.PI / 2, Math.PI / 2, 6)];
const PEAR_CAST = ell(555, 1345, 150, 30, 0, TAU, 6), CUP_CAST = ell(915, 1262, 120, 26, 0, TAU, 6);
const CLOTH_BACK = [[40, 1035], [170, 1030], [300, 1060], [420, 1080], [522, 1112]];
const CLOTH_EDGE = [[522, 1112], [568, 1180], [592, 1260], [598, 1390], [565, 1500], [556, 1570], [548, 1645]];
const CLOTH_HANG = [[40, 1508], [200, 1498], [400, 1512], [563, 1502], [556, 1570], [548, 1645], [40, 1645]];
const FOLDS = [
  [[150, 1045], [190, 1170], [170, 1320], [150, 1500], [140, 1640]],
  [[95, 1180], [80, 1350], [70, 1520], [66, 1640]],
  [[280, 1370], [315, 1470], [300, 1560], [290, 1645]],
  [[470, 1362], [500, 1450], [470, 1540], [455, 1645]],
  [[540, 1180], [520, 1270], [530, 1360]],
  [[230, 1062], [258, 1100], [236, 1145]],
];
const TABLE = [[36, 925], [1044, 925], [1044, 1500], [565, 1500], [598, 1390], [592, 1260], [568, 1180], [522, 1112], [420, 1080], [300, 1060], [170, 1030], [36, 1035]];
const APRON = [[575, 1512], [1044, 1512], [1044, 1640], [556, 1640], [562, 1570]];
const WALL = [[40, 318], [1040, 318], [1040, 900], [40, 900]];

const PH = { constr: [0.35, 1.9], contour: [1.9, 3.2], hatch: [3.2, 5.2], mass: [5.2, 6.5], smudge: [6.5, 8.1], erase: [8.1, 9.1], accent: [9.1, 9.55] };

function buildScript() {
  const rnd = rand(7);
  const M = (pts, o) => mark(pts, rnd, o);
  // 1. construction: light, fast, overshooting ellipses and axes, drawn straight through the objects
  const C = [];
  const c = (pts, o = {}) => C.push(M(pts, { p: 0.22, hw: 2.2, profile: 'swell', wob: 1.4, ...o }));
  c([[40, 927], [1040, 922]]); c([[552, 1503], [1040, 1499]]);
  c([[352, 866], [366, 1372]], { p: 0.18 });
  c(ell(360, 1215, 138, 134, -2.2, -2.2 + TAU * 1.08)); c(ell(346, 1015, 72, 74, -1.0, -1.0 + TAU * 1.05));
  c([[735, 955], [735, 1300]], { p: 0.18 });
  c(ell(735, 1010, 126, 33, 2.6, 2.6 + TAU * 1.1)); c(ell(735, 1218, 42, 10, 0.5, 0.5 + TAU * 1.05)); c(ell(735, 1242, 196, 43, 2.8, 2.8 + TAU * 1.06));
  c([[608, 1008], [700, 1218]]); c([[862, 1008], [770, 1218]]);
  c(ell(890, 1100, 44, 54, -1.2, -1.2 + TAU * 0.9));
  c(cr([[40, 1036], [300, 1060], [522, 1112], [592, 1260], [598, 1390], [560, 1500], [548, 1645]]));
  c(ell(555, 1345, 150, 30, 3.0, 3.0 + TAU), { p: 0.16 }); c(ell(915, 1262, 120, 26, 3.0, 3.0 + TAU), { p: 0.16 });

  // 2. contours: heavier on the shadow side, lost and found
  const K = [];
  const k = (pts, o = {}) => K.push(M(pts, { p: 0.55, hw: 2.8, profile: 'even', wob: 0.8, ...o }));
  k(cr(PEAR_L), { p: 0.48, profile: 'lift' }); k(cr(PEAR_R), { p: 0.72 }); k(cr(STEM), { p: 0.8, hw: 3.2 });
  k(ell(735, 1010, 125, 32, Math.PI, TAU), { p: 0.45 }); k(ell(735, 1010, 125, 32, Math.PI, 0), { p: 0.7 });
  k(ell(735, 1013, 114, 25, Math.PI * 1.05, Math.PI * 1.95), { p: 0.34 });
  k(cr(CUP_R), { p: 0.72 }); k(cr(CUP_L), { p: 0.5, profile: 'lift' });
  k(ell(735, 1220, 37, 8, 0, Math.PI), { p: 0.6 });
  for (const run of clipRuns(ell(735, 1240, 195, 42, Math.PI, TAU), [CUP])) k(run, { p: 0.42 });
  k(ell(735, 1240, 195, 42, 0.05, Math.PI - 0.05), { p: 0.62 }); k(ell(735, 1252, 188, 40, 0.1, Math.PI - 0.1), { p: 0.5 });
  k(cr(HANDLE_O), { p: 0.62 }); k(cr(HANDLE_I), { p: 0.5 });
  k(cr(CLOTH_EDGE), { p: 0.5, profile: 'lift' });
  for (const run of clipRuns(cr(CLOTH_BACK), [PEAR])) k(run, { p: 0.4 });
  for (const F of FOLDS) k(cr(F), { p: 0.45, profile: 'flick', hw: 2.5 });
  k(cr([[40, 1506], [200, 1496], [400, 1510], [562, 1501]]), { p: 0.4 });
  for (const run of clipRuns([[36, 925], [1044, 925]], [STEMBOX])) k(run, { p: 0.45 });
  k([[565, 1500], [1044, 1500]], { p: 0.55 });

  // 3. hatching: flicked parallel strokes clipped to each shadow shape
  const HT = [];
  const hatch = (region, excl, deg, spacing, o = {}) => {
    for (const row of hatchRows(region, excl, deg * Math.PI / 180, spacing, rnd, { inset: o.inset ?? 4 })) for (const [a, b] of row) {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / (o.maxL ?? 120)));
      for (let i = 0; i < n; i++) {
        const f0 = i / n - (i ? 0.05 : 0), f1 = (i + 1) / n;
        const A = [lerp(a[0], b[0], f0), lerp(a[1], b[1], f0)], B = [lerp(a[0], b[0], f1), lerp(a[1], b[1], f1)];
        const dx = B[0] - A[0], dy = B[1] - A[1], bow = (o.bow ?? 0.04) * (rnd() - 0.3);
        const mid = [(A[0] + B[0]) / 2 - dy * bow, (A[1] + B[1]) / 2 + dx * bow];
        HT.push(M(cr([A, mid, B]), { p: (o.p ?? 0.45) * (0.85 + 0.3 * rnd()), hw: o.hw ?? 2.4, profile: o.profile ?? 'flick', tone: o.tone, wob: 0.5 }));
      }
    }
  };
  hatch(PEAR, [], -55, 13, { p: 0.24 });
  hatch(PEAR_SH, [], -55, 7.5, { p: 0.45, maxL: 90 });
  hatch(PEAR_CORE, [], 35, 8, { p: 0.5, maxL: 70 });
  hatch(CUP_IN_SH, [], -20, 6.5, { p: 0.45 });
  hatch(CUP, [RIM], -75, 12, { p: 0.22 });
  hatch(CUP_SH, [], -75, 7, { p: 0.52, maxL: 80 });
  hatch(HANDLE, [], -60, 6, { p: 0.48 });
  hatch(SAUCER_BAND, [], -80, 5.5, { p: 0.5, inset: 1 });
  hatch(SAUCER_RT, [CUP], -10, 9, { p: 0.3 });
  hatch(PEAR_CAST, [PEAR], -8, 6.5, { p: 0.55 }); hatch(PEAR_CAST, [PEAR], 40, 8, { p: 0.45, maxL: 60 });
  hatch(CUP_CAST, [CUP, HANDLE], -8, 6.5, { p: 0.55 }); hatch(CUP_CAST, [CUP, HANDLE], 40, 8, { p: 0.45, maxL: 60 });
  for (const F of FOLDS) hatch(bandPoly(cr(F), 22), [PEAR], -35, 7, { p: 0.42, maxL: 40, inset: 1 });
  hatch(CLOTH_HANG, [], -85, 10, { p: 0.28, maxL: 70 });
  hatch(TABLE, [CUP, HANDLE, SAUCER], -3, 14, { p: 0.22, maxL: 260, profile: 'even' });

  // 4. massing with the side of the stick: zigzag sweeps, grain only on the peaks unless pressed hard
  const MS = [];
  const mass = (region, excl, deg, spacing, o = {}) => {
    const rows = hatchRows(region, excl, deg * Math.PI / 180, spacing, rnd, { inset: -6, jit: 0.15 });
    let ctrl = [], flip = false;
    const flush = () => { if (ctrl.length >= 2) MS.push(M(cr(ctrl, false, 4), { p: o.p ?? 0.5, hw: o.hw ?? 26, kind: 1, profile: 'even', tone: o.tone, wob: 2.5 })); ctrl = []; };
    for (const row of rows) {
      if (row.length !== 1 || ctrl.length >= 2 * (o.per ?? 5)) flush();
      if (row.length !== 1) { for (const [a, b] of row) { ctrl = [a, b]; flush(); } continue; }
      const [a, b] = row[0];
      ctrl.push(...(flip ? [b, a] : [a, b]));
      flip = !flip;
    }
    flush();
  };
  const wallTone = (x, y) => 0.55 + 0.6 * (x / 1080) - 0.15 * (y - 318) / 600 - 0.25 * Math.exp(-((x - 200) ** 2 + (y - 620) ** 2) / 90000);
  mass(WALL, [STEMBOX], -14, 40, { p: 0.5, tone: wallTone });
  mass(WALL, [STEMBOX], 10, 46, { p: 0.36, tone: wallTone, per: 4 });
  mass(APRON, [], 0, 34, { p: 0.62, hw: 22 });
  mass(ell(540, 1347, 105, 18, 0, TAU, 6), [PEAR], -5, 18, { p: 0.55, hw: 12 });
  mass(ell(905, 1265, 85, 16, 0, TAU, 6), [CUP], -5, 18, { p: 0.55, hw: 12 });
  mass(CLOTH_HANG, [], -80, 40, { p: 0.3, hw: 20 });

  // 5. smudging: tissue on the big tones, stump along the forms
  const SM = [];
  const sm = (pts, R, str) => SM.push(op('smudge', pts, rnd, { R, str }));
  { const z = []; let f = false; for (let y = 350; y <= 862; y += 64) { z.push(...(f ? [[1000, y], [80, y]] : [[80, y], [1000, y]])); f = !f; } sm(cr(z, false, 4), 62, 0.5); }
  sm(cr([[590, 1530], [1020, 1535], [1010, 1600], [580, 1610]]), 40, 0.5);
  sm(ell(360, 1215, 108, 104, -0.6, 1.9), 24, 0.55); sm(ell(360, 1215, 80, 78, -0.3, 1.7), 20, 0.5); sm(ell(346, 1015, 48, 50, -0.9, 1.0), 18, 0.5);
  sm(cr([[430, 1342], [560, 1350], [690, 1342]]), 22, 0.55); sm(cr([[690, 1346], [560, 1352], [440, 1344]]), 18, 0.45);
  sm(cr([[800, 1262], [915, 1268], [1025, 1262]]), 22, 0.55); sm(cr([[1020, 1266], [910, 1270], [810, 1264]]), 18, 0.45);
  sm(cr([[842, 1030], [838, 1100], [806, 1170], [775, 1200]]), 18, 0.5); sm(cr([[812, 1040], [805, 1110], [780, 1180]]), 16, 0.45);
  sm(ell(735, 1010, 95, 20, Math.PI * 0.95, Math.PI * 1.6), 15, 0.5);
  for (const F of FOLDS) sm(cr(F.map(([x, y]) => [x + 9, y])), 13, 0.5);
  sm([[620, 980], [1020, 985]], 36, 0.35); sm([[640, 1430], [1020, 1440]], 36, 0.35);

  // 6. kneaded eraser: lift the light back out
  const ER = [];
  const er = (pts, R, str, dab = 0) => ER.push(op('erase', pts, rnd, { R, str, dab }));
  er(cr([[110, 470], [230, 420], [300, 560], [200, 700], [110, 620], [180, 520]]), 70, 0.12);
  er([[318, 1150]], 30, 0.35, 0.18); er([[300, 1190]], 20, 0.3, 0.12); er(cr([[334, 1118], [318, 1150], [305, 1185]]), 11, 0.45); er([[322, 996]], 15, 0.35, 0.1);
  er(ell(735, 1010, 125, 32, Math.PI * 0.82, Math.PI * 0.35), 5, 0.7);
  er(cr([[634, 1040], [645, 1105], [672, 1165]]), 8, 0.5);
  er(ell(735, 1240, 195, 42, Math.PI * 0.9, Math.PI * 0.45), 5, 0.65);
  for (const F of FOLDS.slice(0, 5)) er(cr(F.map(([x, y]) => [x - 8, y])), 7, 0.45);
  er(cr([[870, 1048], [915, 1056], [930, 1092]]), 4, 0.5);
  er([[600, 1497], [1040, 1496]], 4, 0.5);

  // 7. last accents: the darkest darks where things touch
  const AC = [];
  const ac = (pts) => AC.push(M(pts, { p: 0.95, hw: 3.3, profile: 'lift', wob: 0.6 }));
  ac(cr([[298, 1340], [370, 1356], [446, 1338]])); ac(ell(735, 1252, 188, 40, Math.PI * 0.92, Math.PI * 0.08));
  ac(cr([[700, 1229], [735, 1233], [772, 1229]])); ac(cr(HANDLE_I.slice(0, 4))); ac(cr(STEM)); ac(cr([[496, 1210], [484, 1280], [440, 1330]]));

  schedule(C, ...PH.constr); schedule(K, ...PH.contour); schedule(HT, ...PH.hatch); schedule(MS, ...PH.mass);
  schedule(SM, ...PH.smudge); schedule(ER, ...PH.erase); schedule(AC, ...PH.accent);
  const all = [...C, ...K, ...HT, ...MS, ...SM, ...ER, ...AC];
  return { all, marks: all.filter((o) => o.type === 'mark'), ops: all.filter((o) => o.type !== 'mark') };
}

/** ribbons for every mark: 6 vertices per segment, 8 floats per vertex (x, y, side, arc, press, hw, seed, kind) */
function buildRibbons(marks) {
  let nseg = 0;
  for (const m of marks) nseg += m.pts.length - 1;
  const V = new Float32Array(nseg * 6 * 8);
  let o = 0, seg = 0;
  for (const m of marks) {
    const P = m.pts, n = P.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1];
      const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
      const w = m.kind ? m.hw : m.hw * (0.7 + 0.5 * m.press[i]);
      L.push([P[i][0] + ty * w, P[i][1] - tx * w]); R.push([P[i][0] - ty * w, P[i][1] + tx * w]);
    }
    const put = (i, side) => {
      const q = side < 0 ? L[i] : R[i];
      V[o++] = q[0]; V[o++] = q[1]; V[o++] = side; V[o++] = i * 2.5; V[o++] = m.press[i]; V[o++] = m.hw; V[o++] = m.seed; V[o++] = m.kind;
    };
    m.first = seg; m.nseg = n - 1;
    for (let i = 0; i < n - 1; i++) { put(i, -1); put(i, 1); put(i + 1, -1); put(i, 1); put(i + 1, 1); put(i + 1, -1); }
    seg += n - 1;
  }
  return V;
}

// ---------------------------------------------------------------- the tools in the hand (2D overlay)
const DEG = Math.PI / 180, SPAD = 16;
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; }
/** a blurred black silhouette of a sprite (its shadow on the paper) */
function shadowOf(img) {
  const cv = mk(img.width + 2 * SPAD, img.height + 2 * SPAD), c = cv.getContext('2d');
  c.filter = 'blur(5px)'; c.drawImage(img, SPAD, SPAD); c.filter = 'none';
  c.globalCompositeOperation = 'source-in'; c.fillStyle = '#000'; c.fillRect(0, 0, cv.width, cv.height);
  return cv;
}
function stickShape(c, r, x0, x1, hw, brokenStart) {
  c.beginPath();
  if (brokenStart) { c.moveTo(x0, -hw * 0.2); c.lineTo(x0 + 3, -hw * 0.7); } else c.moveTo(x0, -hw * 0.2);
  for (let x = x0 + 8; x <= x1 - 2; x += 6) c.lineTo(x, -hw + (r() - 0.5) * 1.4 + Math.sin(x * 0.05) * 0.5);
  c.lineTo(x1 + 1, -hw * 0.5); c.lineTo(x1 - 1, hw * 0.6);
  for (let x = x1 - 4; x >= x0 + 8; x -= 6) c.lineTo(x, hw + (r() - 0.5) * 1.4);
  c.lineTo(x0 + 3, hw * 0.7); c.lineTo(x0, hw * 0.2); c.closePath();
}
function charcoalFill(c, r, x0, x1, hw) {
  const g = c.createLinearGradient(0, -hw, 0, hw);
  g.addColorStop(0, '#2e2d30'); g.addColorStop(0.25, '#5f5e62'); g.addColorStop(0.45, '#2a292c'); g.addColorStop(1, '#0c0c0d');
  c.fillStyle = g; c.fill();
  c.save(); c.clip();
  for (let i = 0; i < (x1 - x0) * 0.5; i++) { c.fillStyle = `rgba(205,205,210,${(0.04 + 0.1 * r()).toFixed(3)})`; c.fillRect(x0 + r() * (x1 - x0), -hw + r() * 2 * hw, 1 + r() * 7, 0.6); }
  c.restore();
}
function toolSprites() {
  const r = rand(99), S = {};
  { // vine charcoal: tip at the anchor, the stick rising up and to the right
    const cv = mk(300, 40), c = cv.getContext('2d');
    c.translate(10, 20); stickShape(c, r, 0, 282, 7.4, true); charcoalFill(c, r, 0, 282, 7.4);
    const tg = c.createLinearGradient(0, 0, 16, 0); tg.addColorStop(0, 'rgba(130,130,132,0.85)'); tg.addColorStop(1, 'rgba(130,130,132,0)');
    c.globalCompositeOperation = 'source-atop'; c.fillStyle = tg; c.fillRect(0, -9, 16, 18);
    S.stick = { img: cv, ax: 10, ay: 20, ang: -58 * DEG, skew: 0.12 };
  }
  { // a broken piece laid flat for massing (its length = the width of the side stroke)
    const cv = mk(76, 24), c = cv.getContext('2d');
    c.translate(5, 12); stickShape(c, r, 0, 64, 7.4, true); charcoalFill(c, r, 0, 64, 7.4);
    S.chunk = { img: cv, ax: 37, ay: 12, ang: 0, skew: 0 };
  }
  { // paper blending stump: a rolled grey cone, its tip black with charcoal
    const cv = mk(270, 34), c = cv.getContext('2d');
    c.translate(6, 17);
    c.beginPath(); c.moveTo(0, -1.5); c.lineTo(46, -11); c.lineTo(258, -11); c.lineTo(258, 11); c.lineTo(46, 11); c.lineTo(0, 1.5); c.closePath();
    const g = c.createLinearGradient(0, -11, 0, 11);
    g.addColorStop(0, '#cfc9bd'); g.addColorStop(0.3, '#ece7dc'); g.addColorStop(1, '#9a9488');
    c.fillStyle = g; c.fill();
    c.save(); c.clip();
    c.strokeStyle = 'rgba(110,100,86,0.45)'; c.lineWidth = 1;
    for (let x = 30; x < 270; x += 21) { c.beginPath(); c.moveTo(x, -12); c.lineTo(x + 15, 12); c.stroke(); }
    const tg = c.createLinearGradient(0, 0, 44, 0); tg.addColorStop(0, 'rgba(40,40,42,0.95)'); tg.addColorStop(1, 'rgba(60,60,62,0)');
    c.fillStyle = tg; c.fillRect(0, -12, 46, 24);
    c.restore();
    S.stump = { img: cv, ax: 6, ay: 17, ang: -52 * DEG, skew: 0.1 };
  }
  { // kneaded eraser, pinched to a point at the anchor
    const cv = mk(120, 80), c = cv.getContext('2d');
    c.translate(8, 66);
    const pts = cr([[0, 0], [14, -10], [30, -30], [52, -46], [78, -52], [100, -38], [102, -14], [86, 6], [60, 12], [34, 8], [14, 4]], true, 3);
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
    const g = c.createRadialGradient(56, -32, 4, 60, -22, 62);
    g.addColorStop(0, '#b3b6ba'); g.addColorStop(0.6, '#8d9196'); g.addColorStop(1, '#63676c');
    c.fillStyle = g; c.fill();
    c.save(); c.clip();
    for (let i = 0; i < 9; i++) {
      c.strokeStyle = `rgba(35,35,40,${(0.18 + 0.25 * r()).toFixed(2)})`; c.lineWidth = 2 + r() * 5;
      const x = r() * 100, y = -50 + r() * 60;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 20 * r(), y - 15 + 30 * r(), x + 10 + 30 * r(), y + 10 * (r() - 0.5)); c.stroke();
    }
    c.fillStyle = 'rgba(40,40,44,0.6)'; c.beginPath(); c.arc(4, -2, 7, 0, TAU); c.fill();
    const hl = c.createRadialGradient(60, -38, 0, 60, -38, 22); hl.addColorStop(0, 'rgba(255,255,255,0.3)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = hl; c.fillRect(30, -64, 60, 50);
    c.restore();
    S.eraser = { img: cv, ax: 8, ay: 66, ang: 0, skew: 0 };
  }
  { // a wad of tissue, centred on the smudge
    const cv = mk(170, 160), c = cv.getContext('2d');
    c.translate(85, 80);
    const n = 15, P = Array.from({ length: n }, (_, i) => { const a = TAU * i / n, q = 56 + r() * 18; return [q * Math.cos(a), q * Math.sin(a) * 0.9]; });
    c.beginPath(); P.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
    c.fillStyle = '#eeeae2'; c.fill();
    c.save(); c.clip();
    for (let i = 0; i < 22; i++) {
      const a = P[(r() * n) | 0], b = P[(r() * n) | 0], m = [(r() - 0.5) * 50, (r() - 0.5) * 50];
      c.fillStyle = `rgba(${r() < 0.5 ? '120,112,100' : '255,255,255'},${(0.05 + 0.1 * r()).toFixed(3)})`;
      c.beginPath(); c.moveTo(m[0], m[1]); c.lineTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.closePath(); c.fill();
    }
    c.strokeStyle = 'rgba(110,104,95,0.35)'; c.lineWidth = 1;
    for (let i = 0; i < 9; i++) { const a = r() * TAU, l = 20 + r() * 40; c.beginPath(); c.moveTo((r() - 0.5) * 40, (r() - 0.5) * 40); c.lineTo(Math.cos(a) * l, Math.sin(a) * l); c.stroke(); }
    const st = c.createRadialGradient(-22, 26, 0, -22, 26, 52); st.addColorStop(0, 'rgba(50,50,54,0.45)'); st.addColorStop(1, 'rgba(50,50,54,0)');
    c.fillStyle = st; c.fillRect(-85, -80, 170, 160);
    const g = c.createLinearGradient(-60, -60, 60, 60); g.addColorStop(0, 'rgba(255,255,255,0.15)'); g.addColorStop(1, 'rgba(60,50,40,0.22)');
    c.fillStyle = g; c.fillRect(-85, -80, 170, 160);
    c.restore();
    S.tissue = { img: cv, ax: 85, ay: 80, ang: 0, skew: 0 };
  }
  for (const k in S) S[k].sh = shadowOf(S[k].img);
  return S;
}
/** where the hand is at t: on the active mark/operation, lifted and travelling between them, entering and leaving */
function toolPose(all, t) {
  const first = all[0], last = all[all.length - 1], end = last.t0 + last.dur;
  const P0 = (o) => o.pts[0], P1 = (o) => o.pts[o.pts.length - 1];
  if (t < first.t0) { const u = ramp01(t / first.t0), s = P0(first); return { x: lerp(1260, s[0], u), y: lerp(1760, s[1], u), lift: 1 - u, tool: first.tool, dx: 1, dy: 0 }; }
  if (t >= end) {
    const u = clamp((t - end) / 0.5);
    if (u >= 1) return null;
    const e = P1(last), k = u * u;
    return { x: lerp(e[0], 1340, k), y: lerp(e[1], 380, k), lift: ramp01(u * 3), tool: last.tool, dx: 1, dy: 0 };
  }
  let lo = 0, hi = all.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (all[mid].t0 <= t) lo = mid; else hi = mid - 1; }
  const o = all[lo];
  if (t < o.t0 + o.dur) { const q = pointAt(o, prog(o, t)); return { x: q[0], y: q[1], lift: 0, tool: o.tool, dx: q[2], dy: q[3] }; }
  const nx = all[lo + 1], e = P1(o), s = P0(nx), u = clamp((t - o.t0 - o.dur) / Math.max(1e-6, nx.t0 - o.t0 - o.dur)), su = ramp01(u);
  return { x: lerp(e[0], s[0], su), y: lerp(e[1], s[1], su), lift: Math.sin(Math.PI * u) * Math.min(1, Math.hypot(s[0] - e[0], s[1] - e[1]) / 250),
    tool: u < 0.5 ? o.tool : nx.tool, dx: s[0] - e[0], dy: s[1] - e[1] };
}

// ---------------------------------------------------------------- the demo
const ZOOM = track([[0, 0.955], [D, 1.03]]);
const LAMP = track([[0, 0.9], [0.5, 1]]);

defineDemo({
  id: '25-charcoal',
  title: '목탄 스케치',
  tech: 'WebGL2 · 종이 결에 걸리는 목탄 + 문지름·지우개',
  duration: D,
  background: '#191612',
  async setup({ canvas, headless }) {
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    this.tool = canvas({ type: '2d', z: 1, attrs: headless ? { willReadFrequently: true } : undefined }).ctx;
    const script = (this.script = buildScript());
    this.sprites = toolSprites();

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const program = (vs, fs, attribs) => {
      const p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      attribs.forEach((n, i) => gl.bindAttribLocation(p, i, n));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); }
      return { p, u: (name) => u[name] ?? null };
    };
    const Pheight = program(VERT, HEIGHT, ['p']), Pdisp = program(VERT, DISPLAY, ['p']);
    const Psm = program(VERT, SMUDGE, ['p']), Per = program(VERT, ERASE, ['p']);
    const Pst = program(STROKE_VS, STROKE_FS, ['pos', 'side', 'arc', 'press', 'hw', 'seed', 'kind']);

    const fsVAO = gl.createVertexArray();
    gl.bindVertexArray(fsVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const stVAO = gl.createVertexArray();
    gl.bindVertexArray(stVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, buildRibbons(script.marks), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 32, 0);
    for (let i = 1; i < 7; i++) { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, 1, gl.FLOAT, false, 32, 4 + 4 * i); }
    gl.bindVertexArray(null);

    const tex = (internal) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texStorage2D(gl.TEXTURE_2D, 1, internal, W, H);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const fbo = (t) => {
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      return ok ? f : null;
    };
    // the deposit buffer: half floats when the GPU can render to them (smudging is repeated averaging), else 8 bit
    let FMT = gl.getExtension('EXT_color_buffer_float') ? gl.R16F : gl.R8;
    let tA = tex(FMT), fA = fbo(tA);
    if (!fA) { FMT = gl.R8; tA = tex(FMT); fA = fbo(tA); }
    const tB = tex(FMT), fB = fbo(tB), tH = tex(gl.R8), fH = fbo(tH);
    const blit = (src, dst, x0 = 0, y0 = 0, x1 = W, y1 = H) => {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, src); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dst);
      gl.blitFramebuffer(x0, y0, x1, y1, x0, y0, x1, y1, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    };
    const fullscreen = () => { gl.bindVertexArray(fsVAO); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    const bindTex = (unit, t) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); };

    gl.viewport(0, 0, W, H);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fH); gl.useProgram(Pheight.p); fullscreen();

    // --- one fixed step of the drawing: the marks born in [t0, t1), then the stump / eraser passes in it
    const drawMarks = (t0, t1) => {
      bindTex(0, null); bindTex(1, tH);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fA); gl.useProgram(Pst.p); gl.uniform1i(Pst.u('Ht'), 1);
      gl.bindVertexArray(stVAO);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      for (const m of script.marks) {
        if (m.t0 >= t1) break;
        if (m.t0 + m.dur <= t0) continue;
        const c0 = Math.round(prog(m, t0) * m.nseg), c1 = Math.round(prog(m, t1) * m.nseg);
        if (c1 > c0) gl.drawArrays(gl.TRIANGLES, (m.first + c0) * 6, (c1 - c0) * 6);
      }
      gl.disable(gl.BLEND);
    };
    const pass = (o, P, dir, l, s) => {
      const smudge = o.type === 'smudge', R = o.R, F = [P[0], H - P[1]], adv = smudge ? l * 0.7 : 0, pad = R * 1.3 + adv + 6;
      const x0 = clamp(Math.floor(F[0] - pad), 0, W), y0 = clamp(Math.floor(F[1] - pad), 0, H);
      const x1 = clamp(Math.ceil(F[0] + pad), 0, W), y1 = clamp(Math.ceil(F[1] + pad), 0, H);
      if (x1 <= x0 || y1 <= y0) return;
      const Pp = smudge ? Psm : Per;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fB); gl.useProgram(Pp.p);
      gl.enable(gl.SCISSOR_TEST); gl.scissor(x0, y0, x1 - x0, y1 - y0);
      bindTex(0, tA); bindTex(1, tH);
      gl.uniform1i(Pp.u('Dt'), 0); gl.uniform1i(Pp.u('Ht'), 1);
      gl.uniform2f(Pp.u('F'), F[0], F[1]); gl.uniform1f(Pp.u('R'), R); gl.uniform1f(Pp.u('str'), s); gl.uniform1f(Pp.u('seed'), o.seed);
      if (smudge) {
        gl.uniform2f(Pp.u('dir'), dir[0], -dir[1]); gl.uniform2f(Pp.u('res'), W, H);
        gl.uniform1f(Pp.u('adv'), adv); gl.uniform1f(Pp.u('tap'), 1.5 + R * 0.05);
      }
      fullscreen();
      blit(fB, fA, x0, y0, x1, y1);
      gl.disable(gl.SCISSOR_TEST);
    };
    const applyOps = (t0, t1) => {
      for (const o of script.ops) {
        if (o.t0 >= t1) break;
        if (o.t0 + o.dur <= t0) continue;
        if (o.dab) {                                             // pressed in place a few times
          const f = (Math.min(t1, o.t0 + o.dur) - Math.max(t0, o.t0)) / o.dur;
          pass(o, o.pts[0], [1, 0], 0, 1 - Math.pow(1 - o.str, 4 * f));
          continue;
        }
        const u0 = prog(o, t0), u1 = prog(o, t1), dist = (u1 - u0) * o.len, spacing = o.R * 0.3;
        const m = Math.max(1, Math.ceil(dist / spacing));
        let prev = pointAt(o, u0);
        for (let j = 1; j <= m; j++) {
          const q = pointAt(o, u0 + (u1 - u0) * j / m), dx = q[0] - prev[0], dy = q[1] - prev[1], l = Math.hypot(dx, dy);
          if (l < 1e-4) continue;
          pass(o, q, [dx / l, dy / l], l, o.str * Math.min(1, l / spacing));
          prev = q;
        }
      }
      bindTex(0, null);
    };
    this.R = replay({
      dt: DT, every: 30,
      init: () => { gl.bindFramebuffer(gl.FRAMEBUFFER, fA); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); },
      step: (n) => { drawMarks(n * DT, (n + 1) * DT); applyOps(n * DT, (n + 1) * DT); },
      save: () => { const t = tex(FMT), f = fbo(t); blit(fA, f); return { t, f }; },
      load: (s) => blit(s.f, fA),
    });
    this.display = (t) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
      gl.useProgram(Pdisp.p);
      bindTex(0, tA); bindTex(1, tH);
      gl.uniform1i(Pdisp.u('Dt'), 0); gl.uniform1i(Pdisp.u('Ht'), 1);
      gl.uniform2f(Pdisp.u('res'), W, H); gl.uniform1f(Pdisp.u('zoom'), ZOOM(t)); gl.uniform1f(Pdisp.u('lamp'), LAMP(t));
      fullscreen();
      bindTex(0, null);
    };
  },

  async frame(t) {
    await this.R.seek(t);
    this.display(t);
    // the hand-held tool over the sheet, under the same camera
    const c = this.tool, z = ZOOM(t);
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    const q = toolPose(this.script.all, t);
    if (!q) return;
    const S = this.sprites[q.tool], sc = 1 + 0.07 * q.lift;
    const ang = q.tool === 'chunk' ? Math.atan2(q.dy, q.dx) + Math.PI / 2 : S.ang;
    c.setTransform(z, 0, 0, z, W / 2 * (1 - z), H / 2 * (1 - z));
    c.save(); c.globalAlpha = 0.3 - 0.12 * q.lift; c.translate(q.x + 5 + 46 * q.lift, q.y + 4 + 38 * q.lift); c.rotate(ang + S.skew); c.scale(sc, sc);
    c.drawImage(S.sh, -S.ax - SPAD, -S.ay - SPAD); c.restore();
    c.save(); c.translate(q.x, q.y); c.rotate(ang); c.scale(sc, sc); c.drawImage(S.img, -S.ax, -S.ay); c.restore();
  },
});
