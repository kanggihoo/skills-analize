/*
 * 18 · 번지는 수채화 — a watercolour simulated on the GPU in the spirit of Curtis et al. 1997,
 * "Computer-Generated Watercolor" (WebGL2, float ping-pong textures, MRT).
 *
 * Three layers per cell, as in the paper:
 *   shallow water  — depth w and pipe fluxes F (a damped "virtual pipe" shallow-water model: water flows from high
 *                    to low head; the head includes the paper height, a slight board tilt and Curtis' "flow outward"
 *                    term that lowers pressure near the rim of a wet area). Water never enters dry paper
 *                    (the contact line is pinned) unless the neighbour is damp or the puddle overflows.
 *   pigment        — 4 pigments suspended in the water (G) and deposited on the paper (D). Suspended pigment
 *                    moves with exactly the water that moves (conservative upwind transport), settles into the
 *                    valleys of the paper and is lifted from the peaks (adsorption / desorption with granulation γ
 *                    and staining power ω).
 *   capillary      — saturation s of the paper fibres: absorbs from the water, wicks slowly through the fibres,
 *                    dries only after the surface water is gone. Damp fibres let new water in (backruns, blooms).
 * Evaporation is faster at the rim of a wet patch, so water (and pigment) keeps flowing to the pinned edge:
 * the dark, hard edge appears as it dries. The picture is composited optically with Kubelka–Munk: the sky
 * pigments mix in one layer, the indigo is glazed over it, over the cold-press paper (baked fibrous height field).
 * Seeking uses replay(): 8 fixed sub-steps per video frame, checkpoints are GPU blits of all four state textures.
 */
import { defineDemo, replay, track, ease, rand, clamp, lerp, smooth } from '../_lib/stage.js';

const HEADLESS = new URLSearchParams(location.search).has('render');
const D = 10, FPS = 30, SUB = 8;
const AX = 84, AY = 108, AW = 912, AH = 1456;   // painting area on the stage (inside the masking tape), px
const NX = 456, NY = 728;                        // simulation grid: 1 cell = 2×2 stage px
const MX = 114, MY = 182;                        // wet-mask grid (4×4 cells) for the rim detector
const NB = 6;                                    // brush / drop contacts per sub-step

// ---------- pigments: Kubelka–Munk absorption K and scattering S per unit thickness (Curtis 1997, fig. 5 style) ----------
const PIG = {
  //            French ultramarine    quinacridone rose     quinacridone gold     indigo
  K: [[0.86, 0.86, 0.06], [0.22, 1.47, 0.57], [0.05, 0.42, 1.95], [1.75, 1.35, 0.72]],
  S: [[0.005, 0.005, 0.09], [0.05, 0.003, 0.03], [0.03, 0.02, 0.01], [0.04, 0.04, 0.06]],
  dens: [2.6, 1.7, 1.5, 1.9],              // optical thickness per unit pigment mass
  gamma: [0.85, 0.15, 0.25, 0.5],          // granulation (settles into the paper valleys)
  rho: [0.004, 0.003, 0.003, 0.0035],      // adsorption rate per sub-step
  omega: [1.0, 3.5, 2.5, 1.6],             // staining power (desorption = rho / omega)
};

// ---------- the painter: brush strokes and drops as pure functions of t ----------
// stroke(t0, t1, radius in cells, water depth the brush leaves, pigment concentration in that water, path in
// painting uv (u right, v down), options). Paths are Catmull–Rom splines walked at arc-length speed.
const R0 = rand(1807);
const EVENTS = [];
// vary: how much the hand's pressure changes the width — a big flat wash brush stays fairly even, a small round
// brush on the ridges swells and tapers like calligraphy
const stroke = (t0, t1, r, water, conc, pts, o = {}) => EVENTS.push({
  kind: 0, t0, t1, r, water, conc, pts, release: o.release ?? 0.004, dry: o.dry ?? 0, bristle: o.bristle ?? 0.35, seed: R0() * 50,
  vary: o.vary ?? (r >= 30 ? 0.45 : r >= 16 ? 0.75 : 1.0),
});
const hash1 = (x) => { const v = Math.sin(x * 12.9898) * 43758.5453; return v - Math.floor(v); };
const vnoise1 = (x, sd) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash1(i + sd * 7.13) + (hash1(i + 1 + sd * 7.13) - hash1(i + sd * 7.13)) * u; };
/** brush pressure (→ width) at progress f of a stroke, one curve per stroke from its seed: the tip lands narrower
 *  and spreads as it is pressed, the belly swells, the pressure wanders with the hand, and the lift tapers
 *  (a quick flick runs almost to a point) */
function pressure(e, f) {
  const k = e.vary, h1 = hash1(e.seed + 1.7), h2 = hash1(e.seed + 5.3), h3 = hash1(e.seed + 9.1), h4 = hash1(e.seed + 13.9);
  const attack = 0.04 + 0.2 * h1, land = 1 - k * (0.25 + 0.4 * h2);
  const lift = 0.1 + 0.35 * h3, tip = 1 - k * (h4 < 0.35 ? 0.85 : 0.2 + 0.4 * h4);
  const a = land + (1 - land) * smooth(f / attack);
  const r = 1 + (tip - 1) * smooth((f - (1 - lift)) / lift);
  const belly = 1 + k * (0.05 + 0.25 * h2) * Math.sin(Math.PI * clamp(f / (1 - 0.5 * lift)));
  const wander = 1 + k * (0.36 * (vnoise1(f * 3.2, e.seed) - 0.5) + 0.14 * (vnoise1(f * 9, e.seed + 3) - 0.5));
  return Math.max(0.08, a * r * belly * wander);
}
const drop = (t0, u, v, r, water, conc, sats = 3) => {
  EVENTS.push({ kind: 1, t0, pts: [[u, v]], r, water, conc, seed: R0() * 50 });
  for (let i = 0; i < sats; i++) {          // a few satellite droplets from the splash
    const a = R0() * Math.PI * 2, d = (1.7 + R0() * 1.2) * r / NX;
    EVENTS.push({ kind: 1, t0: t0 + 0.02, pts: [[u + Math.cos(a) * d, v + Math.sin(a) * d * NX / NY]], r: r * (0.18 + 0.15 * R0()), water: water * 0.8, conc, seed: R0() * 50 });
  }
};
const CLEAR = [0, 0, 0, 0];
// 1. clear water: a big flat brush wets the sky area (zig-zag), the sheet glistens
stroke(0.30, 0.52, 42, 0.42, CLEAR, [[-0.06, 0.05], [0.5, 0.058], [1.06, 0.062]], { release: 0.006, bristle: 0.2 });
stroke(0.50, 0.72, 42, 0.42, CLEAR, [[1.06, 0.15], [0.5, 0.158], [-0.06, 0.162]], { release: 0.006, bristle: 0.2 });
stroke(0.70, 0.92, 42, 0.42, CLEAR, [[-0.06, 0.25], [0.5, 0.257], [1.06, 0.26]], { release: 0.006, bristle: 0.2 });
stroke(0.90, 1.12, 42, 0.42, CLEAR, [[1.06, 0.35], [0.5, 0.356], [-0.06, 0.36]], { release: 0.006, bristle: 0.2 });
stroke(1.10, 1.32, 42, 0.42, CLEAR, [[-0.06, 0.45], [0.5, 0.452], [1.06, 0.455]], { release: 0.006, bristle: 0.2 });
stroke(1.28, 1.48, 38, 0.42, CLEAR, [[1.06, 0.535], [0.5, 0.53], [-0.06, 0.538]], { release: 0.006, bristle: 0.2 });
// 2. ultramarine into the wet: it floods down and sideways
stroke(1.40, 1.68, 34, 0.58, [2.0, 0, 0, 0], [[-0.06, 0.04], [0.3, 0.06], [0.7, 0.07], [1.06, 0.05]], { release: 0.006 });
stroke(1.62, 1.90, 30, 0.58, [1.5, 0.05, 0, 0], [[1.06, 0.13], [0.6, 0.155], [0.25, 0.14], [-0.06, 0.15]], { release: 0.006 });
stroke(1.85, 2.12, 26, 0.56, [0.85, 0.08, 0, 0], [[-0.06, 0.225], [0.4, 0.24], [1.06, 0.235]], { release: 0.005 });
// 3. a rose band and a gold glow toward the horizon, wet-in-wet
stroke(2.05, 2.35, 24, 0.60, [0.04, 0.75, 0.03, 0], [[1.06, 0.34], [0.55, 0.36], [-0.06, 0.335]], { release: 0.005 });
stroke(2.30, 2.62, 26, 0.60, [0, 0.12, 0.85, 0], [[-0.06, 0.47], [0.5, 0.49], [1.06, 0.462]], { release: 0.005 });
// 4. drops into the drying sky: blooms (cauliflowers) that push the blue aside
drop(2.85, 0.30, 0.20, 11, 1.3, [0, 1.3, 0, 0]);
drop(3.05, 0.71, 0.12, 10, 1.25, CLEAR);
drop(3.25, 0.57, 0.30, 12, 1.3, [0, 0.8, 0.45, 0]);
drop(3.45, 0.15, 0.37, 8, 1.2, [0, 0.1, 1.1, 0], 2);
drop(3.62, 0.86, 0.26, 10, 1.25, [0.05, 1.0, 0, 0], 2);
// 5. a far ridge in violet laid into the damp sky (its top feathers upward)
const ridge1 = [[-0.06, 0.555], [0.08, 0.52], [0.18, 0.475], [0.27, 0.435], [0.36, 0.47], [0.45, 0.5], [0.55, 0.465], [0.63, 0.445], [0.72, 0.48], [0.82, 0.515], [0.92, 0.5], [1.06, 0.53]];
const off = (pts, dv, rev = false) => { const p = pts.map(([u, v]) => [u, v + dv]); return rev ? p.reverse() : p; };
stroke(3.95, 4.55, 9, 0.36, [0.55, 0.38, 0, 0], ridge1, { bristle: 0.25 });
stroke(4.35, 4.85, 16, 0.40, [0.5, 0.32, 0.02, 0.04], off(ridge1, 0.035, true));
stroke(4.65, 5.10, 18, 0.40, [0.45, 0.25, 0.05, 0.08], off(ridge1, 0.075));
// 6. the near ridge in indigo: soft where it meets the damp violet, hard where the paper is dry
const ridge2 = [[-0.06, 0.6], [0.1, 0.58], [0.22, 0.61], [0.35, 0.57], [0.48, 0.545], [0.6, 0.56], [0.7, 0.53], [0.8, 0.57], [0.9, 0.62], [1.06, 0.6]];
stroke(4.95, 5.45, 8, 0.36, [0.25, 0.05, 0, 1.1], ridge2, { bristle: 0.25 });
stroke(5.25, 5.70, 16, 0.40, [0.25, 0.05, 0, 1.0], off(ridge2, 0.035, true));
stroke(5.50, 5.95, 20, 0.40, [0.2, 0.06, 0.03, 0.9], off(ridge2, 0.085));
stroke(5.75, 6.15, 18, 0.38, [0.15, 0.04, 0.06, 0.75], off(ridge2, 0.14, true));
// 7. the shore, and dry-brush on the lake: the brush only touches the tops of the paper tooth (white sparkle)
stroke(6.05, 6.35, 4, 0.4, [0.2, 0, 0, 1.0], [[-0.06, 0.806], [0.5, 0.80], [1.06, 0.803]], { bristle: 0.1 });
stroke(6.20, 6.50, 11, 0.14, [0.9, 0.06, 0, 1.0], [[0.04, 0.842], [0.35, 0.844], [0.66, 0.846]], { dry: 0.56, bristle: 0.85, release: 0.0015 });
stroke(6.40, 6.70, 9, 0.14, [0.9, 0.08, 0, 1.0], [[0.97, 0.882], [0.65, 0.884], [0.33, 0.886]], { dry: 0.58, bristle: 0.85, release: 0.0015 });
stroke(6.60, 6.85, 7, 0.14, [0.9, 0.08, 0, 1.0], [[0.12, 0.926], [0.32, 0.928], [0.52, 0.93]], { dry: 0.62, bristle: 0.85, release: 0.0015 });
// 8. three birds on the dry sky (crisp, with their own dark rims)
const bird = (t0, u, v, s) => stroke(t0, t0 + 0.2, 1.7, 0.36, [0.2, 0, 0, 1.5],
  [[-0.022, 0.004], [-0.011, -0.006], [0, 0.003], [0.012, -0.007], [0.024, 0.004]].map(([a, b]) => [u + a * s, v + b * s]), { bristle: 0, release: 0.003 });
bird(8.70, 0.62, 0.30, 1.0);
bird(8.86, 0.68, 0.27, 0.8);
bird(9.00, 0.575, 0.255, 0.65);

// arc-length tables for the paths (sim cells, GL y up)
const cr = (p0, p1, p2, p3, s) => [0, 1].map((k) => 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * s
  + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * s * s + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * s * s * s));
for (const e of EVENTS) {
  const P = e.pts.map(([u, v]) => [u * NX, (1 - v) * NY]);
  const xs = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(i - 1, 0)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(i + 2, P.length - 1)];
    for (let k = 0; k < 24; k++) xs.push(cr(p0, p1, p2, p3, k / 24));
  }
  xs.push(P[P.length - 1]);
  const cum = [0];
  for (let i = 1; i < xs.length; i++) cum.push(cum[i - 1] + Math.hypot(xs[i][0] - xs[i - 1][0], xs[i][1] - xs[i - 1][1]));
  e.xs = xs; e.cum = cum; e.total = cum[cum.length - 1];
}
function pathAt(e, f) {
  if (e.total === 0) return e.xs[0];
  const L = clamp(f) * e.total;
  let i = 1;
  while (i < e.cum.length - 1 && e.cum[i] < L) i++;
  const a = e.cum[i - 1], b = e.cum[i], k = b > a ? (L - a) / (b - a) : 0;
  return [lerp(e.xs[i - 1][0], e.xs[i][0], k), lerp(e.xs[i - 1][1], e.xs[i][1], k)];
}
// the hand accelerates and slows down a little
const prog = (e, t) => { const p = clamp((t - e.t0) / (e.t1 - e.t0)); return 0.35 * p + 0.65 * smooth(p); };
// brush contacts during the sub-step [ta, tb]
function contacts(ta, tb) {
  const out = [];
  for (const e of EVENTS) {
    if (e.kind === 0) {
      if (tb <= e.t0 || ta >= e.t1) continue;
      const fa = prog(e, Math.max(ta, e.t0)), fb = prog(e, Math.min(tb, e.t1)), f = 0.5 * (fa + fb);
      const press = pressure(e, f);
      const load = 1 - 0.35 * f;              // the brush runs out of paint along the stroke
      // pressing harder also squeezes a little more water out of the brush
      out.push({ a: pathAt(e, fa), b: pathAt(e, fb), r: e.r * press, water: e.water * (1 - 0.2 * f), release: e.release * load * (0.75 + 0.25 * Math.min(press, 1.3)),
        conc: e.conc.map((c) => c * load), dry: e.dry, seed: e.seed, bristle: e.bristle });
    } else {
      if (tb <= e.t0 || ta >= e.t0 + 0.06) continue;
      out.push({ a: e.xs[0], b: e.xs[0], r: e.r, water: e.water, release: 0.02, conc: e.conc, dry: 0, seed: e.seed, bristle: 0 });
    }
  }
  return out.slice(0, NB);
}

// evaporation per sub-step: slow while painting, a damp pause for the blooms, then the sheet dries
// (2.45–2.85 s: a quick drying spell, so the drops land on a wash that is damp rather than flooded → crisp blooms)
const evap = track([[0, 0.00012], [2.3, 0.00012], [2.45, 0.0009, (p) => p], [2.85, 0.0009], [3.0, 0.0004], [3.9, 0.0004],
  [4.1, 0.00025], [6.0, 0.0003], [7.2, 0.0009, ease.inCubic], [8.4, 0.0018, (p) => p], [9.0, 0.004, (p) => p], [D, 0.004]]);

// ---------- shaders ----------
const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

const HEAD0 = `#version 300 es
precision highp float;
precision highp sampler2D;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
`;
const HEAD = HEAD0 + 'out vec4 o;\n';
const CLEARS = HEAD + `uniform vec4 val; void main() { o = val; }`;

// cold-press paper at stage resolution: rounded nodules between crevices (Worley F1/F2, two scales, domain-warped)
// + long curved cellulose fibres + fine tooth. r = height, g = fibre, b = slow sizing variation
const PAPER = HEAD + `
float tooth(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float F1 = 9.0, F2 = 9.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(x, y);
    vec2 c = g + 0.1 + 0.8 * vec2(hash(i + g), hash(i + g + 17.17)) - f;
    float d = length(c);
    if (d < F1) { F2 = F1; F1 = d; } else if (d < F2) F2 = d;
  }
  return 0.55 * (1.0 - smoothstep(0.0, 0.85, F1)) + 0.45 * smoothstep(0.0, 0.28, F2 - F1);
}
float fibres(vec2 p) {
  const float cs = 22.0;
  vec2 ci = floor(p / cs);
  float acc = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {   // fibres are shorter than a cell: 3×3 suffices
    vec2 c = ci + vec2(x, y);
    for (int k = 0; k < 2; k++) {
      vec2 c2 = c + float(k) * 7.31;
      vec2 ctr = (c + vec2(hash(c2), hash(c2 + 3.7))) * cs;
      float ang = hash(c2 + 9.1) * 6.2832;
      float hl = 9.0 + 11.0 * hash(c2 + 1.3), bend = (hash(c2 + 5.5) - 0.5) * 8.0, th = 0.55 + 0.6 * hash(c2 + 2.2);
      vec2 dir = vec2(cos(ang), sin(ang)), nrm = vec2(-dir.y, dir.x), d = p - ctr;
      float s = clamp(dot(d, dir) / hl, -1.0, 1.0);
      float dist = length(d - dir * s * hl - nrm * bend * (1.0 - s * s));
      acc = max(acc, exp(-dist * dist / (th * th)) * (0.5 + 0.5 * hash(c2 + 8.8)));
    }
  }
  return acc;
}
void main() {
  vec2 p = gl_FragCoord.xy;
  vec2 w = vec2(fbm(p / 55.0), fbm(p / 55.0 + 7.3)) - 0.5;
  float t1 = tooth(p / 13.0 + w * 0.9);
  float t2 = tooth(p / 6.5 + 4.1 + w * 0.6);
  float fib = fibres(p);
  float lo = fbm(p / 170.0 + 3.0);
  float h = 0.52 * t1 + 0.2 * t2 + 0.16 * fib + 0.07 * vnoise(p / 1.8) + 0.05 * lo;
  o = vec4(h, fib, lo, 0.0);
}`;
// stage-res paper: height + its gradient (per px), fibre
const PAPERN = HEAD + `
uniform sampler2D T;
float H(ivec2 q) { return texelFetch(T, clamp(q, ivec2(0), textureSize(T, 0) - 1), 0).x; }
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy);
  float gx = (H(q + ivec2(1, 1)) + 2.0 * H(q + ivec2(1, 0)) + H(q + ivec2(1, -1)) - H(q + ivec2(-1, 1)) - 2.0 * H(q + ivec2(-1, 0)) - H(q + ivec2(-1, -1))) / 8.0;
  float gy = (H(q + ivec2(1, 1)) + 2.0 * H(q + ivec2(0, 1)) + H(q + ivec2(-1, 1)) - H(q + ivec2(1, -1)) - 2.0 * H(q + ivec2(0, -1)) - H(q + ivec2(-1, -1))) / 8.0;
  vec4 c = texelFetch(T, q, 0);
  o = vec4(c.x, gx, gy, c.y);
}`;
// sim-res paper: mean height of the 2×2 px under a cell, fibre capacity c (how much water the fibres hold)
const PAPERS = HEAD + `
uniform sampler2D T;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy) * 2;
  vec4 a = (texelFetch(T, q, 0) + texelFetch(T, q + ivec2(1, 0), 0) + texelFetch(T, q + ivec2(0, 1), 0) + texelFetch(T, q + ivec2(1, 1), 0)) * 0.25;
  float cap = 0.11 + 0.10 * (1.0 - a.x) + 0.10 * a.y + 0.04 * a.z;
  o = vec4(a.x, cap, a.y, 0.0);
}`;

// wet mask, 4×4 cells → one texel (then blurred): tells a cell how close it is to the rim of its wet area
const WETM = HEAD + `
uniform sampler2D S;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy) * 4;
  float acc = 0.0;
  for (int j = 0; j < 4; j++) for (int i = 0; i < 4; i++) acc += smoothstep(0.003, 0.02, texelFetch(S, q + ivec2(i, j), 0).x);
  o = vec4(acc / 16.0, 0.0, 0.0, 0.0);
}`;
const BLUR = HEAD + `
uniform sampler2D B; uniform ivec2 dir;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(B, 0) - 1;
  const float w[5] = float[](0.2270, 0.1945, 0.1216, 0.0540, 0.0162);
  vec4 acc = texelFetch(B, q, 0) * w[0];
  for (int i = 1; i < 5; i++) acc += (texelFetch(B, clamp(q + dir * i, ivec2(0), m), 0) + texelFetch(B, clamp(q - dir * i, ivec2(0), m), 0)) * w[i];
  o = acc;
}`;

// shallow water, step 1: outflow fluxes to R, L, T, B ("virtual pipes", damped = viscous thin film)
const RIM = `
float rimOf(vec2 uv, float w) { return smoothstep(0.003, 0.02, w) * (1.0 - smoothstep(0.35, 0.95, texture(Mb, uv).x)); }
`;
const FLUX = HEAD + `
uniform sampler2D S, F, Pp, Mb;
uniform float A, damp, beta, tilt, eta, pin;
${RIM}
float head(ivec2 r, float w, float h) {
  vec2 uv = (vec2(r) + 0.5) / vec2(textureSize(S, 0));
  // water surface + paper relief + board tilt − Curtis' "flow outward" (lower pressure at the rim of the wet area)
  return w + beta * h + tilt * float(r.y) - eta * rimOf(uv, w);
}
float pipe(ivec2 r, ivec2 m, float fOld, float H, float mob, float over) {
  if (r.x < 0 || r.y < 0 || r.x > m.x || r.y > m.y) return 0.0;      // the tape is a wall
  vec4 sj = texelFetch(S, r, 0), pj = texelFetch(Pp, r, 0);
  float Hj = head(r, sj.x, pj.x);
  // the contact line is pinned: water only enters a cell that is wet, or damp (fibres more than half full),
  // unless this puddle is so full that it overflows
  float gate = max(max(smoothstep(0.003, 0.02, sj.x), smoothstep(0.55, 0.85, sj.y / pj.y)), over);
  return gate * max(0.0, fOld * damp * mob + A * mob * (H - Hj));
}
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(S, 0) - 1;
  float w = texelFetch(S, q, 0).x;
  if (w < 1e-5) { o = vec4(0.0); return; }
  float H = head(q, w, texelFetch(Pp, q, 0).x);
  float mob = w / (w + 0.06);                       // thin films are slow (viscous drag)
  float over = smoothstep(pin, pin + 0.2, w);
  vec4 f = texelFetch(F, q, 0);
  vec4 nf = vec4(pipe(q + ivec2(1, 0), m, f.x, H, mob, over), pipe(q + ivec2(-1, 0), m, f.y, H, mob, over),
                 pipe(q + ivec2(0, 1), m, f.z, H, mob, over), pipe(q + ivec2(0, -1), m, f.w, H, mob, over));
  float tot = nf.x + nf.y + nf.z + nf.w;
  o = tot > 1e-9 ? nf * min(1.0, 0.9 * w / tot) : vec4(0.0);   // never more water out than the cell holds
}`;

// shallow water, step 2 (+ pigment, capillary layer, brush): MRT → state S (w, s), suspended G, deposited D
const UPDATE = HEAD0 + `
layout(location = 0) out vec4 oS;
layout(location = 1) out vec4 oG;
layout(location = 2) out vec4 oD;
uniform sampler2D S, F, G, Dp, Pp, Mb;
uniform float E, alpha, kcap, kdiff, edgeBoost;
uniform vec4 rho, omega, gam;
uniform vec4 bA[${NB}], bP[${NB}], bC[${NB}], bS[${NB}];
${RIM}
float w0, sat0, cap0, wn, satN;
vec4 g0, gn;
// neighbour r: the water it sends us (component comp of its fluxes) and the pigment in that water,
// capillary exchange through the fibres, and slow diffusion of pigment within connected water
void nb(ivec2 r, ivec2 m, int comp) {
  if (r.x < 0 || r.y < 0 || r.x > m.x || r.y > m.y) return;
  vec4 sj = texelFetch(S, r, 0), fj4 = texelFetch(F, r, 0), gj = texelFetch(G, r, 0);
  float cj = texelFetch(Pp, r, 0).y;
  float fj = comp == 0 ? fj4.x : comp == 1 ? fj4.y : comp == 2 ? fj4.z : fj4.w;
  wn += fj;
  gn += gj * min(fj / max(sj.x, 1e-6), 1.0);
  satN += kcap * smoothstep(0.45, 0.9, max(sat0 / cap0, sj.y / cj)) * (sj.y - sat0);
  float link = min(w0, sj.x);
  if (link > 1e-4) gn += kdiff * link * (gj / max(sj.x, 1e-6) - g0 / max(w0, 1e-6));
}
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(S, 0) - 1;
  vec2 uv = (vec2(q) + 0.5) / vec2(textureSize(S, 0));
  vec4 s = texelFetch(S, q, 0), pp = texelFetch(Pp, q, 0), f = texelFetch(F, q, 0);
  vec4 dp = texelFetch(Dp, q, 0);
  g0 = texelFetch(G, q, 0); w0 = s.x; sat0 = s.y; cap0 = pp.y;
  float h = pp.x;
  float outF = f.x + f.y + f.z + f.w;
  wn = w0 - outF;
  gn = g0 * (1.0 - min(outF / max(w0, 1e-6), 1.0));
  satN = sat0;
  nb(q + ivec2(-1, 0), m, 0);    // the left neighbour's flux to the right
  nb(q + ivec2(1, 0), m, 1);
  nb(q + ivec2(0, -1), m, 2);
  nb(q + ivec2(0, 1), m, 3);
  wn = max(wn, 0.0);

  // the brush: fills the cells it touches up to its water level, with its pigment; ragged edge, bristle lanes,
  // dry brush only touches the tops of the tooth
  vec2 pos = vec2(q) + 0.5;
  for (int i = 0; i < ${NB}; i++) {
    vec4 b4 = bS[i];
    if (b4.y <= 0.0) continue;
    vec4 a4 = bA[i], p4 = bP[i];
    vec2 a = a4.xy, ba = a4.zw - a4.xy, pa = pos - a;
    float L2 = dot(ba, ba);
    float r = p4.x;
    float tt = L2 > 1e-4 ? clamp(dot(pa, ba) / L2, 0.0, 1.0) : 0.0;
    float dist = length(pa - ba * tt);
    if (dist > r * 1.3 + 3.0) continue;
    vec2 dir = L2 > 1e-4 ? ba * inversesqrt(L2) : vec2(1.0, 0.0);
    float across = dot(pa, vec2(-dir.y, dir.x)) / max(r, 1.0);
    float rag = vnoise(pos * 0.21 + b4.x) + 0.5 * vnoise(pos * 0.63 + b4.x * 1.7) - 0.75;
    float rr = r * (1.0 + 0.14 * rag);
    float fp = 1.0 - smoothstep(rr - 1.5, rr + 1.0, dist);
    float bristle = vnoise(vec2(across * 6.0 + b4.x, b4.x * 0.37));
    fp *= mix(1.0, 0.45 + 1.1 * bristle, b4.w);
    if (p4.w > 0.0) fp *= smoothstep(p4.w, p4.w + 0.12, h + 0.35 * (bristle - 0.5));
    float add = max(p4.y * fp - wn, 0.0) * 0.45 + p4.z * fp;
    wn += add;
    gn += add * bC[i];
  }

  // capillary layer: the fibres drink from the surface water (pigment stays behind in the water)
  float ab = min(wn, alpha * max(cap0 - satN, 0.0));
  wn -= ab; satN += ab;
  // evaporation, faster at the thin rim of a wet patch → water keeps flowing to the pinned edge (edge darkening)
  float rim = rimOf(uv, wn);
  wn = max(wn - E * (1.0 + edgeBoost * rim), 0.0);
  float wet = smoothstep(0.0, 0.01, wn);
  satN = clamp(satN - E * 1.1 * (1.0 - wet), 0.0, cap0);   // the paper itself dries only once the surface water is gone

  // pigment ↔ paper (Curtis): settles faster in thin water and in the valleys (granulation γ), is lifted from
  // the peaks while wet; staining pigments (high ω) hardly lift
  vec4 down = rho * gn * (1.0 - gam * h) * (0.15 / (wn + 0.15));
  vec4 up = rho / omega * dp * (1.0 + (h - 1.0) * gam) * wet;
  if (wn < 0.0015) { down = gn; up = vec4(0.0); wn = 0.0; }      // dried: everything left in the water settles
  down = min(down, gn); up = min(up, dp);
  gn += up - down; dp += down - up;
  oS = vec4(wn, satN, 0.0, 0.0);
  oG = max(gn, 0.0);
  oD = max(dp, 0.0);
}`;

// the picture: KM-composited pigments over the lit paper, water sheen, masking tape, the board
const FINAL = HEAD + `
uniform sampler2D S, G, Dp, Pf, Ps;
uniform vec2 res, zc, simPx;
uniform vec4 area;
uniform float zoom, fade, lampEl, lampAz;
uniform vec3 Kp[4], Sp[4];
uniform vec4 dens, gam;
void km(vec3 K, vec3 S, out vec3 R, out vec3 T) {
  // Kubelka–Munk reflectance and transmittance of a layer (thickness folded into K and S)
  vec3 bS = sqrt(K * (K + 2.0 * S)) + 1e-5;
  vec3 x = min(bS, vec3(30.0));
  vec3 sh = sinh(x), ch = cosh(x);
  vec3 den = (S + K) * sh + bS * ch;
  R = S * sh / den; T = bS / den;
}
vec3 env(vec3 r) {
  // what the wet sheet mirrors: a dim studio, brighter toward the ceiling, and a window up-left
  vec2 d = r.xy / max(r.z, 0.2);
  vec3 room = mix(vec3(0.07, 0.065, 0.06), vec3(0.30, 0.29, 0.28), smoothstep(-0.5, 0.5, d.y));
  vec2 wq = (d - vec2(-0.17, 0.21)) / vec2(0.11, 0.15);
  float win = 1.0 - smoothstep(0.85, 1.0, max(abs(wq.x), abs(wq.y)));
  float bars = smoothstep(0.025, 0.06, abs(wq.x)) * smoothstep(0.025, 0.06, abs(wq.y));
  return room + vec3(2.5, 2.65, 2.9) * win * bars;
}
float sdBox(vec2 p, vec2 c, vec2 hs) { vec2 d = abs(p - c) - hs; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
// a strip of masking tape over rect r (x0, y0, x1, y1), torn at its short ends
float tape(vec2 P, vec4 r, bool vert, float seed, out vec2 tc) {
  vec2 q = vert ? P.yx : P;
  vec4 b = vert ? r.yxwz : r;
  float t0 = 7.0 * (vnoise(vec2(q.y * 0.3, seed)) - 0.5) + 2.5 * (vnoise(vec2(q.y * 1.3, seed + 5.0)) - 0.5);
  float t1 = 7.0 * (vnoise(vec2(q.y * 0.3, seed + 9.0)) - 0.5) + 2.5 * (vnoise(vec2(q.y * 1.3, seed + 13.0)) - 0.5);
  float ea = smoothstep(b.x + t0 - 0.7, b.x + t0 + 0.7, q.x) * (1.0 - smoothstep(b.z + t1 - 0.7, b.z + t1 + 0.7, q.x));
  float wob = 0.8 * (vnoise(vec2(q.x * 0.05, seed + 2.0)) - 0.5);
  float ec = smoothstep(b.y - 0.6, b.y + 0.6, q.y + wob) * (1.0 - smoothstep(b.w - 0.6, b.w + 0.6, q.y + wob));
  tc = vec2(q.x - b.x, q.y - b.y);
  return ea * ec;
}
vec4 TA[4];
float tapes(vec2 P, out vec2 tc, out float n) {
  vec2 c; float a, acc = 0.0; n = 0.0; tc = vec2(0.0);
  for (int i = 0; i < 4; i++) {
    a = tape(P, TA[i], i >= 2, float(i) * 31.0, c);
    if (a > 0.0) { tc = c; n += a; }
    acc = acc + a * (1.0 - acc);
  }
  return acc;
}
void main() {
  vec2 sp = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y);
  vec2 P = zc + (sp - zc) / zoom;                     // stage px under this pixel (y down)
  TA[0] = vec4(area.x - 64.0, area.y - 40.0, area.x + area.z + 60.0, area.y + 5.0);
  TA[1] = vec4(area.x - 58.0, area.y + area.w - 5.0, area.x + area.z + 66.0, area.y + area.w + 40.0);
  TA[2] = vec4(area.x - 40.0, area.y - 70.0, area.x + 5.0, area.y + area.w + 64.0);
  TA[3] = vec4(area.x + area.z - 5.0, area.y - 62.0, area.x + area.z + 40.0, area.y + area.w + 72.0);
  float az = lampAz;
  vec3 L = normalize(vec3(cos(az) * cos(lampEl), sin(az) * cos(lampEl), sin(lampEl)));   // GL frame: y up
  vec3 lampC = vec3(1.0, 0.955, 0.89);
  vec2 lp = (P - vec2(250.0, 330.0)) / 1250.0;
  float pool = 0.9 + 0.16 * exp(-dot(lp, lp));

  // --- the board: dark slate, the sheet's soft shadow on it
  vec3 board = vec3(0.020, 0.018, 0.016) * (0.8 + 0.4 * fbm(P / 7.0)) * (0.85 + 0.3 * fbm(P / 90.0 + 4.0));
  vec2 ctr = area.xy + area.zw * 0.5;
  float dsh = sdBox(P - vec2(7.0, 11.0), ctr, area.zw * 0.5 + 42.0);
  board *= 1.0 - 0.75 * (1.0 - smoothstep(-6.0, 26.0, dsh));
  vec3 col = board;

  // --- the sheet (under the tape at its border) and the painting
  vec2 a = (P - area.xy) / area.zw;
  bool inSheet = sdBox(P, ctr, area.zw * 0.5 + 22.0) < 0.0;
  if (inSheet) {
    vec3 Rp = vec3(0.86, 0.83, 0.74);
    vec3 R = Rp;
    vec3 n = vec3(0.0, 0.0, 1.0);
    vec3 water = vec3(0.0);
    if (a.x >= 0.0 && a.y >= 0.0 && a.x <= 1.0 && a.y <= 1.0) {
      vec2 tuv = vec2(a.x, 1.0 - a.y);
      vec4 pf = texture(Pf, tuv);            // h, dh/dx, dh/dy (per px), fibre
      vec4 ps = texture(Ps, tuv);            // h (cell mean), capacity
      vec4 st = texture(S, tuv);             // w, s
      vec4 gs = texture(G, tuv), ds = texture(Dp, tuv);
      // paper colour: fibres a touch brighter, damp paper greyer
      float damp = smoothstep(0.3, 0.9, st.y / ps.y);
      Rp *= (0.975 + 0.05 * pf.w) * (1.0 - 0.11 * damp);
      // granulation at paper resolution: the deposit sinks into the valleys of the tooth; ultramarine flocculates
      vec4 gr = max(1.0 + gam * 2.4 * (ps.x - pf.x), 0.0);
      vec4 x = (ds * gr + gs) * dens;
      x.x *= 0.78 + 0.44 * vnoise(P / 2.3);
      // Kubelka–Munk: the sky pigments mixed in one layer, the indigo glazed over it, over the paper
      vec3 K1 = x.x * Kp[0] + x.y * Kp[1] + x.z * Kp[2], S1 = x.x * Sp[0] + x.y * Sp[1] + x.z * Sp[2];
      vec3 R1, T1, R2, T2;
      km(K1, S1, R1, T1);
      km(x.w * Kp[3], x.w * Sp[3], R2, T2);
      vec3 Ra = R1 + T1 * T1 * Rp / (1.0 - R1 * Rp);
      R = R2 + T2 * T2 * Ra / (1.0 - R2 * Ra);
      // wet paint looks deeper (no air–pigment interface)
      float wet = smoothstep(0.002, 0.03, st.x);
      R = mix(R, pow(max(R, vec3(0.0)), vec3(1.22)) * 0.95, wet);
      // paper relief
      n = normalize(vec3(-pf.y * 4.0, -pf.z * 4.0, 1.0));
      // water surface: free surface of the sim (+ paper relief showing through thin films) → mirror + glints
      vec2 dx = vec2(1.0 / simPx.x, 0.0), dy = vec2(0.0, 1.0 / simPx.y);
      // free surface = depth + paper height (flat at rest, like the sim's head), so the mirror is level
      float hx = (texture(S, tuv + dx).x + 0.06 * texture(Ps, tuv + dx).x - texture(S, tuv - dx).x - 0.06 * texture(Ps, tuv - dx).x) * 0.5;
      float hy = (texture(S, tuv + dy).x + 0.06 * texture(Ps, tuv + dy).x - texture(S, tuv - dy).x - 0.06 * texture(Ps, tuv - dy).x) * 0.5;
      float thin = 1.0 - smoothstep(0.02, 0.2, st.x);
      vec3 nW = normalize(vec3(-(hx * 2.6 + pf.y * 0.5 * thin), -(hy * 2.6 + pf.z * 0.5 * thin), 1.0));
      vec3 P3 = vec3(P.x, res.y - P.y, 0.0);
      vec3 V = normalize(vec3(540.0, res.y - 900.0, 2000.0) - P3);
      float fres = 0.02 + 0.98 * pow(1.0 - clamp(dot(nW, V), 0.0, 1.0), 5.0);
      vec3 Hl = normalize(L + V);
      float glint = pow(max(dot(nW, Hl), 0.0), 380.0) * 3.0 + pow(max(dot(nW, Hl), 0.0), 40.0) * 0.05;
      water = wet * (fres * env(reflect(-V, nW)) + glint * lampC * 0.5);
    }
    float dif = clamp(dot(n, L) / max(L.z, 0.15), 0.0, 2.2);
    col = R * lampC * mix(1.0, dif, 0.8) + water;
  }

  // --- masking tape over the border (crepe texture, slightly translucent, casts a thin shadow)
  vec2 tc; float nOver;
  float ta = tapes(P, tc, nOver);
  vec2 tcS; float nS;
  float shadow = tapes(P + vec2(-2.5, -3.5), tcS, nS);
  col *= 1.0 - 0.45 * shadow * (1.0 - ta);
  if (ta > 0.0) {
    float crepe = vnoise(vec2(tc.x * 0.9, tc.y * 0.07)) * 0.6 + vnoise(vec2(tc.x * 2.3, tc.y * 0.3)) * 0.4;
    vec3 tcol = vec3(0.58, 0.51, 0.33) * (0.9 + 0.14 * crepe + 0.06 * fbm(P / 13.0));
    tcol *= 1.0 - 0.12 * clamp(nOver - 1.0, 0.0, 1.0);     // where strips overlap
    float dif = 0.85 + 0.15 * crepe;
    col = mix(col, tcol * lampC * dif, ta * 0.93);
  }

  col *= pool * fade;
  vec2 vq = (sp / res - 0.5) * vec2(1.0, 0.7) * 2.0;
  col *= 1.0 - 0.28 * clamp(dot(vq, vq) * 0.5, 0.0, 1.0);
  col = pow(max(col, vec3(0.0)), vec3(1.0 / 2.2));
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  o = vec4(col, 1.0);
}`;

// ---------- the story ----------
const fade = track([[0, 0.25], [0.7, 1.0, ease.outCubic], [D - 0.5, 1.0], [D, 0.92]]);
const zoom = track([[0, 1.0], [D, 1.04, (p) => p]]);
const lampEl = track([[0, 0.95], [8.1, 0.95], [9.2, 0.34], [D, 0.40]]);
const lampAz = track([[0, 2.2], [8.1, 2.25], [D, 2.85]]);

defineDemo({
  id: '18-watercolor',
  title: '번지는 수채화',
  tech: 'WebGL2 GPGPU · 물과 안료 시뮬레이션 (Curtis 1997 방식)',
  duration: D,
  background: '#050505',
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2' });
    // float render targets: 32-bit with linear filtering if we can, else half floats
    const f32 = gl.getExtension('EXT_color_buffer_float');
    const lin32 = gl.getExtension('OES_texture_float_linear');
    const f16 = f32 || gl.getExtension('EXT_color_buffer_half_float');
    if (!f16) throw new Error('float render targets (EXT_color_buffer_float / _half_float) unsupported');
    const FMT = f32 && lin32 ? gl.RGBA32F : gl.RGBA16F;

    // --- tiny GL kit ---
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n'));
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT);
    const program = (src) => {
      const p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, src));
      gl.bindAttribLocation(p, 0, 'p');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < nu; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const texture = (w, h, fmt, filter = gl.LINEAR) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, fmt, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return tex;
    };
    const fbo = (texs) => {
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      texs.forEach((t, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0));
      gl.drawBuffers(texs.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('incomplete framebuffer');
      return fb;
    };
    const target = (w, h, fmt = FMT, filter = gl.LINEAR) => { const tex = texture(w, h, fmt, filter); return { tex, fb: fbo([tex]), w, h }; };
    // one state set = water/saturation S, suspended pigment G, deposited pigment D, written together (MRT)
    const stateSet = () => {
      const s = { S: target(NX, NY), G: target(NX, NY), D: target(NX, NY) };
      s.fb = fbo([s.S.tex, s.G.tex, s.D.tex]); s.w = NX; s.h = NY;
      return s;
    };
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const pass = (P, dst, tex = {}, set = () => {}) => {
      gl.useProgram(P.p);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null);
      gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H);
      let unit = 0;
      for (const [name, t] of Object.entries(tex)) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t.tex);
        if (P.u[name]) gl.uniform1i(P.u[name], unit);
        unit++;
      }
      set(P.u);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const blit = (src, dst) => {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, src.fb);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dst.fb);
      gl.blitFramebuffer(0, 0, src.w, src.h, 0, 0, dst.w, dst.h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    };

    const P = {
      clear: program(CLEARS), paper: program(PAPER), paperN: program(PAPERN), paperS: program(PAPERS),
      wetm: program(WETM), blur: program(BLUR), flux: program(FLUX), update: program(UPDATE), final: program(FINAL),
    };

    // --- bake the paper once
    const paperRaw = target(AW, AH, gl.RGBA16F, gl.NEAREST);
    const paperF = target(AW, AH, gl.RGBA16F);        // h, dh/dx, dh/dy, fibre (stage res)
    const paperS = target(NX, NY, gl.RGBA16F);        // h, capacity, fibre (sim res)
    pass(P.paper, paperRaw);
    pass(P.paperN, paperF, { T: paperRaw });
    pass(P.paperS, paperS, { T: paperRaw });

    // --- simulation state (ping-pong) + rim mask
    let cur = stateSet(), nxt = stateSet();
    let Fc = target(NX, NY), Fn = target(NX, NY);
    const M1 = target(MX, MY, gl.RGBA16F), M2 = target(MX, MY, gl.RGBA16F);

    const bA = new Float32Array(NB * 4), bP = new Float32Array(NB * 4), bC = new Float32Array(NB * 4), bS = new Float32Array(NB * 4);
    const setBrushes = (u, list) => {
      bA.fill(0); bP.fill(0); bC.fill(0); bS.fill(0);
      list.forEach((c, i) => {
        bA.set([c.a[0], c.a[1], c.b[0], c.b[1]], i * 4);
        bP.set([c.r, c.water, c.release, c.dry], i * 4);
        bC.set(c.conc, i * 4);
        bS.set([c.seed, 1, 0, c.bristle], i * 4);
      });
      gl.uniform4fv(u.bA, bA); gl.uniform4fv(u.bP, bP); gl.uniform4fv(u.bC, bC); gl.uniform4fv(u.bS, bS);
    };
    const v4 = (k) => PIG[k];
    const zero = (T) => pass(P.clear, T, {}, (u) => gl.uniform4f(u.val, 0, 0, 0, 0));

    const px = new Float32Array(4);
    const R = replay({
      dt: 1 / FPS,
      every: 45,
      init: () => { for (const T of [cur.S, cur.G, cur.D, Fc]) zero(T); },
      step: (n) => {
        // where are the rims of the wet areas? (once per video frame)
        pass(P.wetm, M1, { S: cur.S });
        pass(P.blur, M2, { B: M1 }, (u) => gl.uniform2i(u.dir, 1, 0));
        pass(P.blur, M1, { B: M2 }, (u) => gl.uniform2i(u.dir, 0, 1));
        for (let k = 0; k < SUB; k++) {
          const ta = (n * SUB + k) / (FPS * SUB), tb = ta + 1 / (FPS * SUB);
          pass(P.flux, Fn, { S: cur.S, F: Fc, Pp: paperS, Mb: M1 }, (u) => {
            gl.uniform1f(u.A, 0.14); gl.uniform1f(u.damp, 0.93); gl.uniform1f(u.beta, 0.06);
            gl.uniform1f(u.tilt, 0.00006); gl.uniform1f(u.eta, 0.05); gl.uniform1f(u.pin, 0.62);
          });
          [Fc, Fn] = [Fn, Fc];
          pass(P.update, nxt, { S: cur.S, F: Fc, G: cur.G, Dp: cur.D, Pp: paperS, Mb: M1 }, (u) => {
            gl.uniform1f(u.E, evap(ta)); gl.uniform1f(u.alpha, 0.04); gl.uniform1f(u.kcap, 0.002);
            gl.uniform1f(u.kdiff, 0.03); gl.uniform1f(u.edgeBoost, 3.0);
            gl.uniform4fv(u.rho, v4('rho')); gl.uniform4fv(u.omega, v4('omega')); gl.uniform4fv(u.gam, v4('gamma'));
            setBrushes(u, contacts(ta, tb));
          });
          [cur, nxt] = [nxt, cur];
        }
        // headless verification only: wait for the (software) GPU with a 1-pixel readback so a long seek does not
        // pile up behind the screenshot timeout. Live playback never stalls on this.
        if (HEADLESS) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, cur.S.fb);
          gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, px);
        }
      },
      save: () => {
        const c = { S: target(NX, NY), G: target(NX, NY), D: target(NX, NY), F: target(NX, NY) };
        blit(cur.S, c.S); blit(cur.G, c.G); blit(cur.D, c.D); blit(Fc, c.F);
        return c;
      },
      load: (c) => { blit(c.S, cur.S); blit(c.G, cur.G); blit(c.D, cur.D); blit(c.F, Fc); },
    });

    const Kflat = new Float32Array(PIG.K.flat()), Sflat = new Float32Array(PIG.S.flat());
    this.render = (t) => {
      pass(P.final, null, { S: cur.S, G: cur.G, Dp: cur.D, Pf: paperF, Ps: paperS }, (u) => {
        gl.uniform2f(u.res, W, H); gl.uniform2f(u.zc, 540, 836); gl.uniform2f(u.simPx, NX, NY);
        gl.uniform4f(u.area, AX, AY, AW, AH);
        gl.uniform1f(u.zoom, zoom(t)); gl.uniform1f(u.fade, fade(t));
        gl.uniform1f(u.lampEl, lampEl(t)); gl.uniform1f(u.lampAz, lampAz(t));
        gl.uniform3fv(u.Kp, Kflat); gl.uniform3fv(u.Sp, Sflat);
        gl.uniform4fv(u.dens, PIG.dens); gl.uniform4fv(u.gam, PIG.gamma);
      });
    };
    this.R = R;
  },
  async frame(t) {
    await this.R.seek(t);
    this.render(t);
  },
});
