/*
 * field.js — the threshold field, written once in GLSL and once in JS that computes the same numbers.
 *
 *   h(p, t) = g(p) + A · fbm(F·p + W·t)        g = a gradient normalised to 0..1 over the mesh
 *   k(t)    = the threshold, swept from below min h to above max h
 *
 * Source (dissolve):  a fragment is kept while h > k.   A grain's birth time b solves h(p, b) = k(b).
 * Target (reform):    a fragment is kept while h < k.   A grain's arrival time a solves h(q, a) = k(a).
 * The materials evaluate the GLSL per fragment; setup evaluates the JS twin per sampled point, so a grain
 * leaves (or lands) exactly where and when the surface under it opens (or closes).
 *
 * The noise is integer-hashed value noise: the lattice values come from a 32-bit integer hash that both GLSL ES 3.0
 * (uint) and JS (Math.imul, >>> 0) compute bit for bit, and only 24 bits are kept so the float conversion is exact.
 */

// ---------------------------------------------------------------- shared constants (both sides read these)
export const OCTAVES = 4;
const LAC = 2.03, OFF = [17.1, 31.7, 9.3];

/** fields: g(p) = (dot(p, dir) + radial·|p.xz| − g0) / (g1 − g0); h = g + amp · fbm(freq·p + drift·t + seed) */
export const SRC = {
  dir: norm([0.6, -0.72, -0.34]), radial: 0, amp: 0.42, freq: 2.3, drift: [-0.06, 0.16, 0.03], seed: [3.1, 7.7, 1.9],
  g0: 0, g1: 1, k0: 0, k1: 1,  // set from the mesh in setup (fitField)
  t0: 1.5, t1: 4.5, pad: 0.03, // the sweep
  edge: 0.032,                 // glow band width (field units)
};
export const DST = {
  dir: [0, 0.55, 0], radial: 1.0, amp: 0.3, freq: 3.1, drift: [0.04, -0.12, 0.05], seed: [11.3, 2.9, 5.4],
  g0: 0, g1: 1, k0: 0, k1: 1,
  t0: 6.35, t1: 8.45, pad: 0.03,
  edge: 0.05,
};

function norm(v) { const l = Math.hypot(...v); return v.map((x) => x / l); }

// ---------------------------------------------------------------- JS twin
const M = (a, b) => Math.imul(a, b) >>> 0;
function hash3(x, y, z) {
  let h = (M(x, 0x8da6b343) ^ M(y, 0xd8163841) ^ M(z, 0xcb1ab31f)) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0; h = M(h, 0x7feb352d);
  h = (h ^ (h >>> 15)) >>> 0; h = M(h, 0x846ca68b);
  h = (h ^ (h >>> 16)) >>> 0;
  return (h >>> 8) / 16777216;
}
const fade = (f) => f * f * f * (f * (f * 6 - 15) + 10);
export function vnoise(x, y, z) {
  const fx = Math.floor(x), fy = Math.floor(y), fz = Math.floor(z);
  const ux = fade(x - fx), uy = fade(y - fy), uz = fade(z - fz);
  const X = fx + 1024, Y = fy + 1024, Z = fz + 1024;
  const l = (a, b, k) => a + (b - a) * k;
  return l(
    l(l(hash3(X, Y, Z), hash3(X + 1, Y, Z), ux), l(hash3(X, Y + 1, Z), hash3(X + 1, Y + 1, Z), ux), uy),
    l(l(hash3(X, Y, Z + 1), hash3(X + 1, Y, Z + 1), ux), l(hash3(X, Y + 1, Z + 1), hash3(X + 1, Y + 1, Z + 1), ux), uy),
    uz);
}
export function fbm(x, y, z) {
  let s = 0, a = 0.5;
  for (let o = 0; o < OCTAVES; o++) {
    s += a * (vnoise(x, y, z) * 2 - 1);
    x = x * LAC + OFF[0]; y = y * LAC + OFF[1]; z = z * LAC + OFF[2];
    a *= 0.5;
  }
  return s / (1 - Math.pow(0.5, OCTAVES));
}

export const gradient = (F, x, y, z) => (x * F.dir[0] + y * F.dir[1] + z * F.dir[2] + F.radial * Math.hypot(x, z) - F.g0) / (F.g1 - F.g0);
export function field(F, x, y, z, t) {
  t = Math.min(F.t1, Math.max(F.t0, t));          // the noise drifts only while the front sweeps
  return gradient(F, x, y, z) + F.amp * fbm(F.freq * x + F.drift[0] * t + F.seed[0], F.freq * y + F.drift[1] * t + F.seed[1], F.freq * z + F.drift[2] * t + F.seed[2]);
}
/** the threshold: from just below the lowest h to just above the highest h over [t0, t1], eased (60 % inOutSine + 40 % linear) */
export function threshold(F, t) {
  const p = Math.min(1, Math.max(0, (t - F.t0) / (F.t1 - F.t0)));
  const e = 0.6 * (0.5 - 0.5 * Math.cos(Math.PI * p)) + 0.4 * p;
  return F.k0 + (F.k1 - F.k0) * e;
}
/** fit a field to a mesh: g0/g1 so g runs 0..1 across it, then k0/k1 = the range of h over its vertices and the sweep (± pad) */
export function fitField(F, pos, stride = 1) {
  let a = Infinity, b = -Infinity;
  for (let i = 0; i < pos.length; i += 3) {
    const g = pos[i] * F.dir[0] + pos[i + 1] * F.dir[1] + pos[i + 2] * F.dir[2] + F.radial * Math.hypot(pos[i], pos[i + 2]);
    a = Math.min(a, g); b = Math.max(b, g);
  }
  F.g0 = a; F.g1 = b;
  let lo = Infinity, hi = -Infinity;
  for (let n = 0; n <= 4; n++) {
    const t = F.t0 + ((F.t1 - F.t0) * n) / 4;
    for (let i = 0; i < pos.length; i += 3 * stride) {
      const h = field(F, pos[i], pos[i + 1], pos[i + 2], t);
      lo = Math.min(lo, h); hi = Math.max(hi, h);
    }
  }
  F.k0 = lo - F.pad; F.k1 = hi + F.pad;
}
/**
 * The first time in [t0 − 0.1, t1 + 0.1] where h − k drops to 0 (the moment the surface at p opens, or closes for the
 * inverse dissolve), by a 1/8 s scan and bisection. Returns [time, extra sign changes after it]: the second number checks
 * that the front never comes back over the point.
 */
export function crossing(F, x, y, z) {
  const f = (t) => field(F, x, y, z, t) - threshold(F, t);
  const a0 = F.t0 - 0.1, a1 = F.t1 + 0.1, dt = 1 / 8;
  let ta = a0, fa = f(ta), hit = -1, back = 0;
  if (fa <= 0) return [a0, 0];
  for (let t = a0 + dt; t <= a1 + 1e-9; t += dt) {
    const fb = f(t);
    if (hit < 0 && fb <= 0) {
      let lo = ta, hi = t;
      for (let i = 0; i < 15; i++) { const m = (lo + hi) / 2; if (f(m) <= 0) hi = m; else lo = m; }
      hit = hi;
    } else if (hit >= 0 && (fb > 0) !== (fa > 0)) back++;
    ta = t; fa = fb;
  }
  return [hit < 0 ? a1 : hit, back];
}

// ---------------------------------------------------------------- GLSL (same maths; constants inlined from the objects above)
const f6 = (x) => (Math.abs(x) < 1e-12 ? '0.0' : x.toFixed(6));
const v3 = (v) => `vec3(${v.map(f6).join(', ')})`;

export const NOISE_GLSL = /* glsl */`
uint fhash(uvec3 v) {
  uint h = v.x * 0x8da6b343u ^ v.y * 0xd8163841u ^ v.z * 0xcb1ab31fu;
  h ^= h >> 16; h *= 0x7feb352du; h ^= h >> 15; h *= 0x846ca68bu; h ^= h >> 16;
  return h;
}
float lat(ivec3 c) { return float(fhash(uvec3(c + 1024)) >> 8) * (1.0 / 16777216.0); }
float vnoise(vec3 p) {
  vec3 fl = floor(p); vec3 f = p - fl; ivec3 c = ivec3(fl);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(mix(lat(c), lat(c + ivec3(1, 0, 0)), u.x), mix(lat(c + ivec3(0, 1, 0)), lat(c + ivec3(1, 1, 0)), u.x), u.y),
    mix(mix(lat(c + ivec3(0, 0, 1)), lat(c + ivec3(1, 0, 1)), u.x), mix(lat(c + ivec3(0, 1, 1)), lat(c + ivec3(1, 1, 1)), u.x), u.y),
    u.z);
}
float fbm(vec3 p) {
  float s = 0.0, a = 0.5;
  for (int o = 0; o < ${OCTAVES}; o++) {
    s += a * (vnoise(p) * 2.0 - 1.0);
    p = p * ${f6(LAC)} + ${v3(OFF)};
    a *= 0.5;
  }
  return s / ${f6(1 - Math.pow(0.5, OCTAVES))};
}
`;

/** GLSL for one field: float <name>(vec3 p, float t) — call after fitField() so g0/g1 are final */
export function fieldGLSL(F, name) {
  return /* glsl */`
float ${name}(vec3 p, float t) {
  float g = (dot(p, ${v3(F.dir)}) + ${f6(F.radial)} * length(p.xz) - ${f6(F.g0)}) / ${f6(F.g1 - F.g0)};
  t = clamp(t, ${f6(F.t0)}, ${f6(F.t1)});
  return g + ${f6(F.amp)} * fbm(${f6(F.freq)} * p + ${v3(F.drift)} * t + ${v3(F.seed)});
}`;
}
