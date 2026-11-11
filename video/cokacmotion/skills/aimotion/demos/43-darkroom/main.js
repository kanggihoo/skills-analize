/*
 * 43 · 암실에서 떠오르는 사진 — a gelatin-silver print developing in a tray under the safelight (WebGL2, closed form in t).
 *
 * setup: the photograph (a lamp-lit alley at night) is ray-cast once in a shader: walls of brick and plaster, wet
 *   cobbles with glossy lamp reflections, a lantern and a far lamp with mist halos, a lit window, wires and the moon.
 *   Its luminance goes through the negative (film grain added in log exposure) and the paper's S-shaped curve →
 *   the density each point of the print WILL reach, d∞. A second pass sums the dense areas upstream/downstream along
 *   the rocking axis → the bromide-drag field (reaction products restrain development next to dense areas).
 * frame(t): one fullscreen pass, every term a function of t:
 *   development  τ = (development clock) − (time the developer reached that point: an uneven wet front);
 *                each texel has four grain clusters with their own thresholds; a grain needs an induction time that is
 *                short where the exposure was high (shadows first) and long where it was low (highlights last):
 *                ind = 0.9 + 2.6·(1 − d∞)^1.3 s; agitation streaks and bromide drag modulate the rate.
 *   liquid       standing slosh modes cos(mπx/Lx)·cos(nπy/Ly) driven by the rocking (damped oscillators integrated
 *                once in JS), a wave rolling across the tray, capillary ripples, rings from drips —
 *                height, gradient and Hessian analytically. Refraction shifts the view of the bottom; caustics are
 *                1/|det(I + κ·H)|; the surface mirrors the safelight panels (ray–rectangle test, Fresnel).
 *   the room     red-amber safelights (white tray glows, blue fixer tray goes dark), a stainless sink with droplets,
 *                a thermometer in the developer, tongs; transfers to stop bath and fixer; the fluorescent light
 *                flickers on and the camera pushes in to the silver grain.
 */
import { defineDemo, track, ease, clamp, lerp, smooth } from '../_lib/stage.js';

const D = 10;
const HEADLESS = new URLSearchParams(location.search).has('render');
const PITCH = 1100;                         // trays are 1100 px apart along x (world px, y down)
const TW = 1024, TH = 1280;                 // the photograph's texture

// ---------------------------------------------------------------- the story (world px; trays at x = 540, 1640, 2740)
const camX = track([[0, 0], [5.95, 0], [6.45, PITCH, ease.inOutCubic], [7.12, PITCH], [7.62, 2 * PITCH, ease.inOutCubic]]);
const printX = track([[0, 520], [0.5, 540, ease.outCubic], [5.95, 540], [6.45, 540 + PITCH, ease.inOutCubic], [7.12, 540 + PITCH], [7.62, 540 + 2 * PITCH, ease.inOutCubic]]);
const printY = track([[0, 860], [0.5, 905, ease.outCubic], [5.8, 905], [6.1, 880], [6.5, 900], [7.0, 900], [7.25, 880], [7.6, 905]]);
const printR = track([[0, 0.07], [0.5, 0.022, ease.outCubic], [5.8, 0.022], [6.2, 0.05], [6.6, -0.012], [7.0, -0.012], [7.3, 0.03], [7.7, 0.016]]);
const lift = track([[0, 1], [0.12, 1], [0.46, 0, ease.inCubic], [5.72, 0], [5.98, 1, ease.outCubic], [6.4, 1], [6.6, 0, ease.inCubic],
  [6.98, 0], [7.18, 1, ease.outCubic], [7.52, 1], [7.7, 0, ease.inCubic]]);
// the development clock: runs once the print is in the developer, keeps going a little while it drains, stops in the stop bath
const devClock = (t) => (t < 5.8 ? t : 5.8 + 0.35 * (1 - Math.exp(-(t - 5.8) / 0.35)));
const fixAmt = track([[7.7, 0], [9.0, 1, ease.outCubic]]);
const safe = track([[0, 0.0], [0.5, 1.0, ease.outCubic], [D, 1.0]]);
// the fluorescent tube starts with a stutter
const white = (t) => {
  const k = [[7.98, 0], [8.02, 0.55], [8.06, 0.05], [8.13, 0.75], [8.17, 0.18], [8.21, 0.25], [8.3, 1.0]];
  if (t < k[0][0]) return 0;
  for (let i = 1; i < k.length; i++) if (t < k[i][0]) return lerp(k[i - 1][1], k[i][1], (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
  return 1;
};
const zoom = track([[0, 1.03], [1.5, 1.0], [8.45, 1.0], [D, 1.2, ease.inOutCubic]]);
const fade = track([[0, 0.0], [0.45, 1.0, ease.outCubic]]);

// rocking (tilt, arbitrary units) of each tray: the developer is rocked steadily, the stop bath briefly, the fixer gently
const env = (t, a, b, r = 0.3) => smooth((t - a) / r) * (1 - smooth((t - (b - r)) / r));
const ROCK = [
  (t) => env(t, 0.95, 5.65, 0.4) * Math.sin(2 * Math.PI * (t - 0.95) / 1.55),
  (t) => env(t, 6.62, 7.0, 0.12) * 0.8 * Math.sin(2 * Math.PI * (t - 6.62) / 0.75),
  (t) => env(t, 7.75, 9.15, 0.35) * 0.55 * Math.sin(2 * Math.PI * (t - 7.75) / 1.7),
];
// impulses: the print landing / leaving the liquid of a tray
const KICKS = [[0, 0.46, 1.0], [0, 5.75, -0.8], [1, 6.6, 0.9], [1, 6.98, -0.7], [2, 7.7, 0.9]];
// slosh modes (m, n), natural periods relative to the fundamental, and how strongly the rocking drives them
const MODES = [[0, 1, 1.0, 1.0], [0, 2, 0.5, 0.22], [0, 3, 0.34, 0.11], [1, 1, 0.58, 0.16], [1, 0, 0.72, 0.1], [2, 1, 0.4, 0.07]];
const T0 = 1.55, ZETA = 0.09, AMP = 2.2;
const SR = 240, NS = D * SR + 2;
function bakeSlosh() {
  // damped oscillators a'' = -ω²(a - β·θ(t)) - 2ζω a', semi-implicit Euler at 1/960 s, sampled at 1/240 s
  const out = [0, 1, 2].map(() => MODES.map(() => new Float32Array(NS)));
  const energy = [0, 1, 2].map(() => new Float32Array(NS));
  for (let tr = 0; tr < 3; tr++) {
    const a = MODES.map(() => 0), v = MODES.map(() => 0);
    let e = 0;
    const sub = 4, dt = 1 / (SR * sub);
    for (let s = 0; s < NS; s++) {
      for (let k = 0; k < sub; k++) {
        const t = (s * sub + k) * dt, th = ROCK[tr](t);
        for (const [ti, tk, imp] of KICKS) if (ti === tr && t <= tk && t + dt > tk) { v.forEach((_, j) => { v[j] += imp * 9 * MODES[j][3] * (j % 2 ? -1 : 1); }); e += Math.abs(imp) * 1.4; }
        MODES.forEach((m, j) => {
          const w = 2 * Math.PI / (T0 * m[2]);
          v[j] += (-w * w * (a[j] - m[3] * th) - 2 * ZETA * w * v[j]) * dt;
          a[j] += v[j] * dt;
        });
        e += (Math.abs(th) * 1.2 - e) * dt * 1.6;     // the ripples follow the agitation and die away
      }
      MODES.forEach((_, j) => { out[tr][j][s] = a[j] * AMP; });
      energy[tr][s] = e;
    }
  }
  return { out, energy };
}
const sample = (arr, t) => { const x = clamp(t, 0, D) * SR, i = Math.floor(x), f = x - i; return lerp(arr[i], arr[Math.min(i + 1, NS - 1)], f); };

// rings on the liquid: the print landing, drips from the lifted print, the print entering stop and fixer
const RINGS = [];
{
  const r = (() => { let a = 4311; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
  RINGS.push([540, 1260, 0.44, 2.2], [540, 540, 0.45, 2.0], [200, 900, 0.47, 1.2], [880, 900, 0.47, 1.2]);
  for (const [t0, x0, n] of [[5.86, 540, 4], [7.1, 540 + PITCH, 3]]) for (let i = 0; i < n; i++) RINGS.push([x0 - 200 + r() * 420, 1290 + r() * 40, t0 + i * 0.07 + r() * 0.04, 0.8 + r() * 0.6]);
  RINGS.push([1640, 1250, 6.58, 1.6], [1640, 560, 6.6, 1.4], [2740, 1250, 7.68, 1.6], [2740, 560, 7.7, 1.3]);
}
// falling drops (drawn between the lifted print and the liquid)
const DROPS = [];
{
  const r = (() => { let a = 99; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
  for (const [t0, n] of [[5.98, 7], [7.18, 6]]) for (let i = 0; i < n; i++) DROPS.push({ t0: t0 + i * 0.05 + r() * 0.05, dx: -300 + r() * 600, r: 3 + r() * 3.5 });
}

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
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
vec2 vor(vec2 p, out vec2 id) {
  vec2 i = floor(p), f = fract(p);
  float F1 = 9.0, F2 = 9.0;
  id = i;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(x, y), c = g + 0.15 + 0.7 * vec2(hash(i + g), hash(i + g + 17.17)) - f;
    float d = dot(c, c);
    if (d < F1) { F2 = F1; F1 = d; id = i + g; } else if (d < F2) F2 = d;
  }
  return vec2(sqrt(F1), sqrt(F2));
}
`;

// ---- the photograph: a lamp-lit alley at night (world metres; x right, y up, z into the alley)
const SCENE = HEAD + `
uniform vec2 res;
uniform float ssN;
const vec3 EYE = vec3(0.15, 1.55, 0.0);
const vec3 L1 = vec3(-1.12, 3.2, 6.2);      // the wall lantern
const vec3 L2 = vec3(1.42, 3.8, 21.0);      // a far lamp on the right
const float XL = -1.5, XR = 1.75, ZF = 34.0;
const float KX = 1.04, KY = 1.3, U0 = 0.52, V0 = 0.42;
float roofL(float z) { return z < 13.0 ? 7.2 : (z < 21.0 ? 9.8 : 6.2); }
float roofR(float z) { return z < 8.5 ? 6.4 : (z < 26.0 ? 8.4 : 5.6); }
float irr(vec3 P, vec3 n) {
  vec3 d1 = L1 - P, d2 = L2 - P;
  float r1 = dot(d1, d1), r2 = dot(d2, d2);
  return 7.0 * max(dot(n, d1 * inversesqrt(r1)), 0.0) / (r1 + 0.25) + 2.6 * max(dot(n, d2 * inversesqrt(r2)), 0.0) / (r2 + 0.25);
}
float boxHit(vec3 o, vec3 d, vec3 c, vec3 hs) {
  vec3 inv = 1.0 / d, t0 = (c - hs - o) * inv, t1 = (c + hs - o) * inv;
  vec3 mn = min(t0, t1), mx = max(t0, t1);
  float a = max(max(mn.x, mn.y), mn.z), b = min(min(mx.x, mx.y), mx.z);
  return (b > max(a, 0.0)) ? a : 1e9;
}
float brickWall(vec2 w, out float plaster) {
  // w = (z, y) on the left wall: running-bond bricks, plaster patches, grime toward the ground
  float row = floor(w.y / 0.078);
  float zz = w.x + mod(row, 2.0) * 0.115;
  vec2 cell = vec2(floor(zz / 0.23), row);
  vec2 f = vec2(fract(zz / 0.23) * 0.23, fract(w.y / 0.078) * 0.078);
  float mort = 1.0 - smoothstep(0.004, 0.009, min(min(f.x, 0.23 - f.x), min(f.y, 0.078 - f.y)));
  float b = 0.2 + 0.16 * hash(cell) + 0.05 * vnoise(w * 40.0);
  float a = mix(b, 0.42, mort);
  plaster = smoothstep(0.52, 0.6, fbm(w * vec2(0.35, 0.5) + 3.0));
  a = mix(a, 0.44 * (0.8 + 0.3 * fbm(w * 3.0)) * (1.0 - 0.3 * smoothstep(0.5, 0.8, fbm(vec2(w.x * 2.0, w.y * 0.3)))), plaster);
  a *= 0.55 + 0.45 * smoothstep(0.0, 0.9, w.y);
  return a;
}
float plasterWall(vec2 w) {
  float a = 0.36 * (0.8 + 0.35 * fbm(w * vec2(1.5, 1.0)));
  a *= 1.0 - 0.35 * smoothstep(0.45, 0.85, fbm(vec2(w.x * 3.0, w.y * 0.25) + 9.0));      // rain stains running down
  a *= 1.0 - 0.5 * (1.0 - smoothstep(0.0, 0.006, abs(fbm(w * 1.3 + 4.0) - 0.5)));        // cracks
  a *= 0.6 + 0.4 * smoothstep(0.0, 1.0, w.y);
  return a;
}
// the alley without reflections: luminance seen along a ray
float shade(vec3 o, vec3 d, out float tHit, out int kind, out vec3 Hp) {
  float tb = 1e9; kind = 0;
  if (d.x < 0.0) { float t = (XL - o.x) / d.x; vec3 H = o + d * t; if (H.z > 0.0 && H.z < ZF && H.y < roofL(H.z) && H.y > 0.0 && t < tb) { tb = t; kind = 1; } }
  if (d.x > 0.0) { float t = (XR - o.x) / d.x; vec3 H = o + d * t; if (H.z > 0.0 && H.z < ZF && H.y < roofR(H.z) && H.y > 0.0 && t < tb) { tb = t; kind = 2; } }
  if (d.y < 0.0) { float t = -o.y / d.y; vec3 H = o + d * t; if (H.z < ZF && t < tb) { tb = t; kind = 3; } }
  if (d.z > 0.0) { float t = (ZF - o.z) / d.z; vec3 H = o + d * t; if (H.y < 6.0 && H.y > 0.0 && t < tb) { tb = t; kind = 4; } }
  // lanterns and the bracket
  float tl = boxHit(o, d, L1, vec3(0.12, 0.19, 0.12));
  float tbr = boxHit(o, d, vec3(-1.33, 3.47, 6.2), vec3(0.18, 0.018, 0.018));
  float tl2 = boxHit(o, d, L2, vec3(0.07, 0.11, 0.07));
  tHit = tb; Hp = o + d * tb;
  if (tbr < tb && tbr < tl) { tHit = tbr; kind = 5; return 0.004; }
  if (tl < tb) {
    tHit = tl; kind = 6;
    vec3 H = o + d * tl, q = (H - L1) / vec3(0.12, 0.19, 0.12);
    float frame = step(0.82, max(abs(q.x), abs(q.z))) + step(0.86, abs(q.y)) + step(abs(q.z), 0.08) * step(0.5, abs(q.x));
    return frame > 0.5 ? 0.02 : 9.0;
  }
  if (tl2 < tb) { tHit = tl2; kind = 6; return 5.0; }
  vec3 H = Hp;
  if (kind == 1) {
    float pl;
    float a = brickWall(vec2(H.z, H.y), pl);
    float L = a * (irr(H, vec3(1, 0, 0)) + 0.012);
    // the lit window (curtained, warm) and its frame
    vec2 wq = vec2(H.z - 9.75, H.y - 3.0);
    if (abs(wq.x) < 0.75 && abs(wq.y) < 0.7) {
      float bars = 1.0 - (1.0 - smoothstep(0.02, 0.035, abs(wq.x))) - (1.0 - smoothstep(0.02, 0.035, abs(wq.y - 0.15)));
      float curtain = 0.75 + 0.25 * sin(wq.x * 38.0 + 2.0 * sin(wq.y * 3.0));
      float glow = (1.3 + 0.7 * smoothstep(0.7, -0.3, wq.y)) * curtain * clamp(bars, 0.0, 1.0);
      L = (abs(wq.x) > 0.7 || abs(wq.y) > 0.65) ? 0.05 * a : glow;
    }
    // a drainpipe
    if (abs(H.z - 15.1) < 0.075) { float c = (H.z - 15.1) / 0.075; L = 0.3 * (irr(H + vec3(0.07, 0, 0), normalize(vec3(sqrt(max(1.0 - c * c, 0.0)), 0, c))) + 0.01) * (1.0 - 0.6 * c * c); }
    return L;
  }
  if (kind == 2) {
    vec2 w = vec2(H.z, H.y);
    float a = plasterWall(w);
    // a shuttered window, a dark door with a step, a little sign, pot plants by the door
    if (abs(w.x - 4.8) < 0.8 && abs(w.y - 3.15) < 0.75) a = 0.2 * (0.7 + 0.3 * step(0.5, fract(w.y * 14.0))) * (abs(w.x - 4.8) > 0.74 ? 0.5 : 1.0);
    if (abs(w.x - 12.8) < 0.62 && w.y < 2.35) a = 0.07 * (0.8 + 0.4 * step(0.06, abs(fract((w.x - 12.18) / 0.62) - 0.5))) ;
    if (abs(w.x - 7.85) < 0.5 && abs(w.y - 3.25) < 0.28) a = abs(w.x - 7.85) > 0.44 || abs(w.y - 3.25) > 0.22 ? 0.12 : 0.62 - 0.4 * step(0.6, vnoise(w * vec2(28.0, 40.0)));
    float pot = (abs(w.x - 11.75) < 0.38 ? 1.0 : 0.0) * step(w.y, 0.55 + 0.35 * fbm(w * 9.0));
    a = mix(a, 0.05 + 0.06 * vnoise(w * 30.0), pot);
    return a * (irr(H, vec3(-1, 0, 0)) + 0.01);
  }
  if (kind == 3) {
    // cobbles (the reflections are added by the caller)
    vec2 id; vec2 F = vor(H.xz * 4.2, id);
    float stone = smoothstep(0.04, 0.13, F.y - F.x);
    float a = mix(0.035, 0.13 + 0.12 * hash(id), stone);
    if (abs(H.x - 0.1) < 0.13) a = 0.09;          // the gutter
    float ao = smoothstep(0.0, 0.5, H.x - XL) * smoothstep(0.0, 0.5, XR - H.x);
    return a * (irr(H, vec3(0, 1, 0)) * (0.5 + 0.5 * ao) + 0.008);
  }
  if (kind == 4) {
    // the far wall with an arch (a lit street beyond)
    vec2 w = vec2(H.x - 0.1, H.y);
    float arch = step(abs(w.x), 0.8) * step(w.y, 2.2 + sqrt(max(0.64 - w.x * w.x, 0.0)) * 0.6);
    float a = plasterWall(w + 40.0) * 0.8;
    float L = a * (irr(H, vec3(0, 0, -1)) + 0.012);
    return mix(L, 0.06 + 0.04 * smoothstep(1.5, 0.0, w.y), arch);
  }
  // the sky between the roofs: city glow below, faint clouds, the moon
  return 0.0;
}
float sky(vec2 uv) {
  float L = mix(0.035, 0.012, smoothstep(0.35, 0.0, uv.y));
  L *= 0.8 + 0.4 * fbm(uv * vec2(6.0, 14.0));
  vec2 m = (uv - vec2(0.56, 0.085)) * vec2(0.8, 1.0);
  float dm = length(m);
  L += 4.5 * (1.0 - smoothstep(0.0125, 0.0145, dm)) * (0.9 + 0.1 * vnoise(m * 900.0));
  L += 0.12 * exp(-dm * dm / 0.0016) + 0.03 * exp(-dm / 0.06);
  return L;
}
vec2 projUV(vec3 Q) { vec3 r = Q - EYE; return vec2(U0 + r.x / (r.z * KX), V0 - r.y / (r.z * KY)); }
float photo(vec2 uv) {
  vec3 d = normalize(vec3((uv.x - U0) * KX, -(uv.y - V0) * KY, 1.0));
  float tH; int kind; vec3 H;
  float L = shade(EYE, d, tH, kind, H);
  if (kind == 0) L = sky(uv);
  if (kind == 3) {
    // wet cobbles: glossy reflections of the lamps, the window and the walls; puddles are mirrors
    vec2 id; vec2 F = vor(H.xz * 4.2, id);
    float stone = smoothstep(0.04, 0.13, F.y - F.x);
    vec2 e = vec2(0.01, 0.0);
    vec2 Fx = vor((H.xz + e.xy) * 4.2, id), Fz = vor((H.xz + e.yx) * 4.2, id);
    vec3 n = normalize(vec3(-(Fx.x - F.x) / e.x * 0.08 * stone, 1.0, -(Fz.x - F.x) / e.x * 0.08 * stone));
    float puddle = smoothstep(0.56, 0.62, fbm(H.xz * vec2(0.7, 0.28) + 2.0));
    if (abs(H.x - 0.1) < 0.13) puddle = max(puddle, 0.7);
    n = normalize(mix(n, vec3(0, 1, 0), puddle));
    vec3 R = reflect(d, n);
    float shin = mix(mix(70.0, 400.0, 1.0 - stone), 6000.0, puddle);
    float spec = 0.0;
    vec3 l1 = normalize(L1 - H), l2 = normalize(L2 - H);
    spec += 7.0 / (dot(L1 - H, L1 - H) + 0.3) * exp((dot(R, l1) - 1.0) * shin) * shin * 0.012;
    spec += 2.6 / (dot(L2 - H, L2 - H) + 0.3) * exp((dot(R, l2) - 1.0) * shin) * shin * 0.012;
    float tR; int kR; vec3 HR;
    float LR = shade(H + n * 0.001, R, tR, kR, HR);
    if (kR == 0) LR = 0.03;
    L += (0.04 + 0.5 * puddle + 0.15 * (1.0 - stone)) * LR + spec * (0.35 + 0.65 * puddle);
  }
  // mist around the lamps
  vec2 a1 = (uv - projUV(L1)) * vec2(0.8, 1.0), a2 = (uv - projUV(L2)) * vec2(0.8, 1.0);
  L += 0.5 / (1.0 + dot(a1, a1) / 0.00035) + 0.11 * exp(-length(a1) / 0.1);
  L += 0.18 / (1.0 + dot(a2, a2) / 0.00012) + 0.035 * exp(-length(a2) / 0.06);
  // overhead wires against the sky
  float wires = 0.0;
  wires = max(wires, 1.0 - smoothstep(0.0009, 0.0024, abs(uv.y - (0.15 + 0.9 * (uv.x - 0.47) * (uv.x - 0.47)))));
  wires = max(wires, 1.0 - smoothstep(0.0007, 0.0018, abs(uv.y - (0.23 + 1.5 * (uv.x - 0.63) * (uv.x - 0.63)))));
  wires = max(wires, 1.0 - smoothstep(0.0006, 0.0015, abs(uv.y - (0.07 + 0.45 * (uv.x - 0.33) * (uv.x - 0.33)))));
  L = mix(L, L * 0.12, wires * step(uv.y, 0.5));
  // lens vignette
  vec2 vq = (uv - 0.5) * vec2(1.0, 1.25);
  L *= 1.0 - 0.45 * dot(vq, vq);
  return L;
}
void main() {
  vec2 fc = gl_FragCoord.xy;
  float L = 0.0;
  for (float j = 0.0; j < 2.0; j++) for (float i = 0.0; i < 2.0; i++) {
    if (i >= ssN || j >= ssN) continue;
    vec2 off = ssN > 1.0 ? (vec2(i, j) + 0.5) / ssN : vec2(0.5);
    vec2 uv = vec2((fc.x - 0.5 + off.x) / res.x, 1.0 - (fc.y - 0.5 + off.y) / res.y);
    L += photo(uv);
  }
  L /= ssN * ssN;
  // the negative: film grain in log exposure (clumps of ~2 texels), then the paper's S curve
  float g = (vnoise(fc * 0.55) - 0.5) + 0.6 * (vnoise(fc * 1.1 + 13.0) - 0.5);
  float x = log2(max(L, 1e-5) / 0.06) + 0.16 * g;
  float dinf = 1.0 - 1.0 / (1.0 + exp(-1.2 * x));
  o = vec4(dinf, 0.0, 0.0, 1.0);
}`;

// bromide drag: reaction products from dense areas drift along the rocking axis and restrain development there
const DRAG = HEAD + `
uniform sampler2D T;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(T, 0) - 1;
  float d0 = texelFetch(T, q, 0).r, acc = 0.0, ws = 0.0;
  for (int k = 1; k <= 14; k++) {
    float w = exp(-float(k) / 5.0);
    acc += w * (texelFetch(T, clamp(q + ivec2(0, k * 5), ivec2(0), m), 0).r + texelFetch(T, clamp(q - ivec2(0, k * 5), ivec2(0), m), 0).r);
    ws += 2.0 * w;
  }
  o = vec4(d0, clamp((acc / ws - d0) * 1.6, 0.0, 1.0), 0.0, 1.0);
}`;

const DISPLAY = HEAD + `
uniform sampler2D Sc;
uniform vec2 res, zc;
uniform float camX, zoom, time, safe, white, tDev, fixAmt, fade, devDone;
uniform vec4 pr;                 // print centre (world), rotation, lift
uniform float pScale;
uniform vec4 trayS[3];           // y shift, rolling-wave position, its amplitude, ripple amplitude
uniform vec4 modeA[3];           // slosh modes (0,1) (0,2) (0,3) (1,1)
uniform vec2 modeB[3];           // (1,0) (2,1)
uniform vec4 rings[16];          // world x, y, start time, amplitude
uniform vec4 drops[8];           // world x, y, radius, alpha
const float PI = 3.14159265;
const float PITCH = ${PITCH.toFixed(1)};
const vec2 TRAY_HALF = vec2(480.0, 650.0), INNER = vec2(440.0, 610.0);
const vec2 PRINT_HALF = vec2(360.0, 450.0), IMG_HALF = vec2(324.0, 414.0);
const vec3 SAFE_RGB = vec3(0.8, 0.06, 0.0095), WHITE_RGB = vec3(1.0, 0.985, 0.95);   // a deep red safelight (linear)
const vec3 SL1 = vec3(200.0, 120.0, 1100.0), SL2 = vec3(2520.0, 140.0, 1250.0);
const vec3 TUBE = vec3(2740.0, -100.0, 2000.0);
float sdRound(vec2 p, vec2 b, float r) { vec2 d = abs(p) - b + r; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r; }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

// ---- liquid surface: height, gradient, Hessian (xx, yy, xy)
void mode(vec2 x, vec2 L, float m, float n, float a, inout float h, inout vec2 g, inout vec3 H) {
  float kx = m * PI / L.x, ky = n * PI / L.y;
  float cx = cos(kx * x.x), sx = sin(kx * x.x), cy = cos(ky * x.y), sy = sin(ky * x.y);
  h += a * cx * cy;
  g += a * vec2(-kx * sx * cy, -ky * cx * sy);
  H += a * vec3(-kx * kx * cx * cy, -ky * ky * cx * cy, kx * ky * sx * sy);
}
void surf(int i, vec2 q, vec2 P, out float h, out vec2 g, out vec3 H) {
  vec2 L = INNER * 2.0, x = q + INNER;
  h = 0.0; g = vec2(0.0); H = vec3(0.0);
  vec4 A = modeA[i]; vec2 B = modeB[i]; vec4 S = trayS[i];
  mode(x, L, 0.0, 1.0, A.x, h, g, H);
  mode(x, L, 0.0, 2.0, A.y, h, g, H);
  mode(x, L, 0.0, 3.0, A.z, h, g, H);
  mode(x, L, 1.0, 1.0, A.w, h, g, H);
  mode(x, L, 1.0, 0.0, B.x, h, g, H);
  mode(x, L, 2.0, 1.0, B.y, h, g, H);
  // the wave that rolls across the tray with each rock (a slightly curved front)
  {
    float sig = 72.0, cx = 34.0 * sin(PI * x.x / L.x), sxd = -34.0 * PI / L.x * cos(PI * x.x / L.x);
    float s = x.y - S.y - cx;
    float e = S.z * exp(-s * s / (sig * sig));
    float ds = -2.0 * s / (sig * sig) * e, dss = (4.0 * s * s / (sig * sig * sig * sig) - 2.0 / (sig * sig)) * e;
    h += e; g += ds * vec2(sxd, 1.0); H += dss * vec3(sxd * sxd, 1.0, sxd);
  }
  // capillary ripples
  for (int k = 0; k < 7; k++) {
    float fk = float(k);
    float ang = fk * 2.39996 + 0.7, lam = 36.0 + 11.0 * fk, kk = 2.0 * PI / lam;
    vec2 dir = vec2(cos(ang), sin(ang));
    float ph = kk * dot(dir, x) - (2.0 + 0.35 * fk) * time * 3.0 + fk * 1.7;
    float a = S.w * 0.32 * lam / 80.0;
    float sn = sin(ph), cs = cos(ph);
    h += a * sn; g += a * cs * kk * dir; H += -a * sn * kk * kk * vec3(dir.x * dir.x, dir.y * dir.y, dir.x * dir.y);
  }
  // rings from drips and from the print landing
  for (int k = 0; k < 16; k++) {
    vec4 r = rings[k];
    float tau = time - r.z;
    if (tau <= 0.0 || r.w <= 0.0) continue;
    vec2 d = P - r.xy;
    float rr = length(d) + 1e-3;
    float xr = rr - 250.0 * tau, w = 26.0 + 30.0 * tau;
    float env = r.w * exp(-xr * xr / (w * w)) * exp(-tau / 1.3) / sqrt(1.0 + rr / 50.0);
    if (env < 1e-4) continue;
    float kk = 2.0 * PI / 40.0, c = cos(kk * xr), s = sin(kk * xr);
    vec2 n = d / rr;
    h += env * c; g += -env * kk * s * n; H += -env * kk * kk * c * vec3(n.x * n.x, n.y * n.y, n.x * n.y);
  }
}

// ---- the print
float wetTime(vec2 uv) {   // when the developer flooded each point (an uneven front sweeping up from the bottom edge)
  return 0.47 + 0.42 * ((1.0 - uv.y) * 0.86 + 0.14 * uv.x + 0.16 * (fbm(uv * vec2(3.0, 4.0) + 5.0) - 0.5));
}
float density(vec2 uv) {
  vec4 sc = texture(Sc, vec2(uv.x, 1.0 - uv.y));
  float dinf = sc.r, drag = sc.g;
  float tau = max(tDev - wetTime(uv), 0.0);
  // agitation is never perfectly even: fresh developer streams along the rocking axis
  float streak = vnoise(vec2(uv.x * 46.0, uv.y * 5.0)) + 0.5 * vnoise(vec2(uv.x * 110.0, uv.y * 9.0));
  float rate = (1.0 + 0.2 * (streak - 0.75)) * (1.0 - 0.5 * drag * (1.0 - devDone));
  float te = tau * rate;
  float ind = 0.9 + 2.6 * pow(max(1.0 - dinf, 0.0), 1.3);         // induction: heavily exposed (dark) areas start first
  vec2 gq = uv * vec2(${TW}.0, ${TH}.0) / 1.8;
  float acc = 0.0;
  for (int k = 0; k < 4; k++) {
    float u = vnoise(gq + float(k) * 37.1);              // grain clusters with their own latent-image size
    float th = ind * (0.55 + 0.9 * u);
    acc += smoothstep(th, th + 0.45 * ind + 0.25, te);
  }
  return dinf * acc * 0.25 * (1.0 - 0.05 * drag);
}
// albedo of the print at print-local px (paper, image, dry/wet)
vec3 printAlbedo(vec2 pq, out float isPrint, out float wet) {
  isPrint = 1.0 - smoothstep(-0.8, 0.8, sdRound(pq, PRINT_HALF, 3.0));
  vec3 paper = vec3(0.86, 0.855, 0.83);
  vec2 uv = (pq + IMG_HALF) / (2.0 * IMG_HALF);
  wet = smoothstep(-0.02, 0.02, tDev - wetTime(clamp(uv, 0.0, 1.0)));
  vec3 a = paper;
  if (abs(pq.x) < IMG_HALF.x && abs(pq.y) < IMG_HALF.y) {
    float d = density(uv);
    a = paper * pow(10.0, -2.05 * d) * vec3(1.0, 0.985, 0.965 + 0.035 * fixAmt);   // warm-black silver
  }
  a *= 1.0 - 0.07 * wet;
  a = mix(a, a * 0.9 + 0.035, 0.6 * (1.0 - fixAmt) * white);     // unfixed: a faint creamy veil
  return a;
}

// ---- lights
float safeIrr(vec3 P) {
  vec3 a = SL1 - P, b = SL2 - P;
  float ra = length(a), rb = length(b);
  return (1.25e9 * a.z / (ra * ra * ra) + 0.8e9 * b.z / (rb * rb * rb)) / 470.0;
}
vec3 lightAt(vec3 P, float caust) {
  return SAFE_RGB * safe * safeIrr(P) * caust + WHITE_RGB * white * (0.95 - 0.12 * smoothstep(0.0, 1400.0, abs(P.y - 700.0))) * mix(1.0, caust, 0.25);
}
vec3 envRefl(vec3 P, vec3 R) {
  // what the liquid mirrors: two safelight panels, the fluorescent tube, a dim / bright ceiling
  vec3 c = vec3(0.0);
  if (R.z > 0.05) {
    vec2 h1 = (P + R * ((SL1.z - P.z) / R.z)).xy - SL1.xy;
    vec2 h2 = (P + R * ((SL2.z - P.z) / R.z)).xy - SL2.xy;
    vec2 h3 = (P + R * ((TUBE.z - P.z) / R.z)).xy - TUBE.xy;
    float p1 = (1.0 - smoothstep(110.0, 140.0, abs(h1.x))) * (1.0 - smoothstep(70.0, 95.0, abs(h1.y)));
    float p2 = (1.0 - smoothstep(110.0, 140.0, abs(h2.x))) * (1.0 - smoothstep(70.0, 95.0, abs(h2.y)));
    float p3 = (1.0 - smoothstep(420.0, 440.0, abs(h3.x))) * (1.0 - smoothstep(22.0, 32.0, abs(h3.y)));
    c += SAFE_RGB * safe * 46.0 * (p1 + 0.8 * p2) * (0.85 + 0.15 * sin(h1.y * 0.25));
    c += WHITE_RGB * white * 40.0 * p3;
  }
  c += SAFE_RGB * safe * 0.05 + WHITE_RGB * white * 0.55;
  return c;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 sp = vec2(fc.x, res.y - fc.y);
  vec2 s2 = zc + (sp - zc) / zoom;
  vec2 P = vec2(s2.x + camX, s2.y);                   // world px (y down)
  vec3 cam = vec3(camX + 540.0, 900.0, 2600.0);
  int ti = int(clamp(floor((P.x - 540.0) / PITCH + 0.5), 0.0, 2.0));
  vec4 ts = trayS[ti];
  vec2 C = vec2(540.0 + PITCH * float(ti), 900.0 + ts.x);
  vec2 q = P - C;
  float dOut = sdRound(q, TRAY_HALF, 56.0), dIn = sdRound(q, INNER, 32.0);
  vec3 trayAlb = ti == 0 ? vec3(0.84, 0.84, 0.82) : (ti == 1 ? vec3(0.78, 0.13, 0.1) : vec3(0.16, 0.3, 0.58));
  float h = pr.w;
  mat2 Rp = rot(-pr.z);
  vec3 col;

  if (dIn < 0.0) {
    // ---- under the liquid: refraction, caustics, the tray floor with ribs, the print, the thermometer
    float eta; vec2 g; vec3 Hs;
    surf(ti, q, P, eta, g, Hs);
    float kap = 60.0;
    float det = (1.0 + kap * Hs.x) * (1.0 + kap * Hs.y) - kap * kap * Hs.z * Hs.z;
    float caust = clamp(1.0 / max(abs(det), 0.22), 0.0, 3.2);
    caust = mix(1.0, caust, 0.85);
    vec2 Pb = P - g * 38.0;                            // what we see through the tilted surface
    vec2 qb = Pb - C;
    // tray floor: ribs along the length
    float xr = mod(qb.x + 440.0, 74.0) - 37.0;
    float rib = 1.0 - smoothstep(4.0, 7.0, abs(xr));
    vec3 alb = trayAlb * (0.93 + 0.07 * rib * sign(-xr) * 0.5 + 0.04 * rib);
    alb *= 1.0 - 0.18 * smoothstep(-60.0, 0.0, sdRound(qb, INNER, 32.0));   // the floor darkens toward the walls
    // the thermometer lying in the developer
    if (ti == 0) {
      vec2 a = vec2(398.0, -560.0), b = vec2(414.0, -170.0), pa = qb - a, ba = b - a;
      float tt = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0), dd = length(pa - ba * tt);
      float bulb = length(qb - b) - 11.0;
      float glass = min(dd - 8.0, bulb);
      if (glass < 1.0) {
        float across = dot(pa, normalize(vec2(-ba.y, ba.x)));
        float col_ = (1.0 - smoothstep(1.2, 2.2, abs(across))) * step(0.32, tt);
        vec3 ga = mix(alb * 0.75, vec3(0.75, 0.08, 0.05), max(col_, step(bulb, -3.0)));
        ga += 0.25 * (1.0 - smoothstep(0.0, 2.0, abs(across + 4.5)));     // the glass catches light along one side
        ga *= 1.0 - 0.5 * step(0.97, fract(tt * 40.0)) * step(abs(across), 7.0) * step(0.2, tt);   // scale marks
        alb = mix(alb, ga, 1.0 - smoothstep(-0.8, 0.8, glass));
      }
    }
    float shade = 1.0;
    float wet = 1.0;
    float isP = 0.0;
    if (h < 0.01) {
      vec2 pq = Rp * (Pb - pr.xy) / pScale;
      vec3 pa = printAlbedo(pq, isP, wet);
      alb = mix(alb, pa, isP);
      // the print's thin edge casts a hairline shadow on the floor
      shade = 1.0 - 0.35 * (1.0 - smoothstep(0.0, 5.0, sdRound(Rp * (Pb - pr.xy - vec2(3.0, 4.0)) / pScale, PRINT_HALF, 3.0))) * (1.0 - isP);
    }
    // liquid colour: developer brownish, stop bath yellow indicator, fixer clear
    vec3 Tl = ti == 0 ? vec3(0.95, 0.9, 0.78) : (ti == 1 ? vec3(0.97, 0.93, 0.62) : vec3(0.99, 0.99, 0.98));
    vec3 Lb = lightAt(vec3(Pb, 0.0), caust);
    col = alb * Lb * Tl * Tl * shade;
    // the free surface mirrors the lamps (Fresnel)
    vec3 n = normalize(vec3(-g.x, -g.y, 1.0));
    vec3 V = normalize(cam - vec3(P, 26.0));
    float cosi = clamp(dot(n, V), 0.0, 1.0);
    float F = 0.02 + 0.98 * pow(1.0 - cosi, 5.0);
    col += F * envRefl(vec3(P, 26.0), reflect(-V, n));
    // the dry part of the print floating before it is soaked: a bright meniscus at the wet front
    if (h < 0.01 && isP > 0.0 && tDev < 1.1) {
      vec2 uv = (Rp * (Pb - pr.xy) / pScale + IMG_HALF) / (2.0 * IMG_HALF);
      float fr = tDev - wetTime(clamp(uv, 0.0, 1.0));
      col += SAFE_RGB * safe * 0.35 * exp(-fr * fr / 0.0004) * isP;
    }
  } else if (dOut < 0.0) {
    // ---- the tray's rim: a rounded plastic lip
    float u = clamp(dIn / 40.0, 0.0, 1.0);
    vec2 e = vec2(1.0, 0.0);
    vec2 gr = normalize(vec2(sdRound(q + e.xy, INNER, 32.0) - sdRound(q - e.xy, INNER, 32.0), sdRound(q + e.yx, INNER, 32.0) - sdRound(q - e.yx, INNER, 32.0)) + 1e-5);
    float slope = cos(PI * u) * 1.6;
    vec3 n = normalize(vec3(-gr * slope, 1.0));
    vec3 Pw = vec3(P, 40.0 * sin(PI * u));
    vec3 ld = normalize(SL1 - Pw);
    float dif = 0.35 + 0.65 * max(dot(n, ld), 0.0);
    col = trayAlb * lightAt(Pw, 1.0) * dif;
    vec3 V = normalize(cam - Pw);
    float sp = pow(max(dot(n, normalize(ld + V)), 0.0), 60.0);
    col += (SAFE_RGB * safe * safeIrr(Pw) * 0.5 + WHITE_RGB * white * 0.25) * sp;
    // the pouring spout at one corner
    col *= 1.0 - 0.25 * (1.0 - smoothstep(0.0, 40.0, length(q - vec2(440.0, -610.0))));
  } else {
    // ---- the sink: brushed stainless steel, droplets, the trays' shadows
    float br = vnoise(vec2(P.x * 0.006, P.y * 0.9)) * 0.6 + vnoise(vec2(P.x * 0.02, P.y * 2.3)) * 0.4;
    vec3 steel = vec3(0.16, 0.165, 0.17) * (0.75 + 0.5 * br);
    float sh = smoothstep(-10.0, 50.0, sdRound(q - vec2(26.0, 34.0), TRAY_HALF, 56.0));
    col = steel * lightAt(vec3(P, 0.0), 1.0) * (0.45 + 0.55 * sh);
    // a broad, streaky sheen where the lamps are mirrored
    vec3 V = normalize(cam - vec3(P, 0.0));
    vec3 R = reflect(-V, vec3(0.0, 0.0, 1.0));
    vec3 e = envRefl(vec3(P, 0.0), normalize(R + vec3(0.04 * (br - 0.5), 0.25 * (br - 0.5), 0.0)));
    col += 0.06 * e * (0.6 + 0.8 * br);
    // droplets on the steel
    vec2 cell = floor(P / 46.0);
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 c = cell + vec2(x, y);
      if (hash(c + 5.0) < 0.55) continue;
      vec2 ctr = (c + vec2(hash(c), hash(c + 3.3))) * 46.0;
      float r = 3.0 + 7.0 * hash(c + 7.7);
      vec2 dq = (P - ctr) / r;
      float dd = dot(dq, dq);
      if (dd < 1.0) {
        col *= 0.7 + 0.3 * dd;
        col += (SAFE_RGB * safe * 1.6 + WHITE_RGB * white * 1.4) * exp(-dot(dq + vec2(0.35, 0.4), dq + vec2(0.35, 0.4)) * 30.0);
      }
    }
    // bamboo tongs resting between the developer and the stop bath
    {
      vec2 a = vec2(1090.0, 250.0), b = vec2(1040.0, 980.0);
      for (int k = 0; k < 2; k++) {
        vec2 a2 = a + vec2(float(k) * 22.0, 0.0), b2 = b + vec2(float(k) * 40.0, 0.0);
        vec2 pa = P - a2, ba = b2 - a2;
        float tt = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        float dd = length(pa - ba * tt) - 7.0;
        float dsh = length(P - vec2(12.0, 16.0) - a2 - ba * clamp(dot(P - vec2(12.0, 16.0) - a2, ba) / dot(ba, ba), 0.0, 1.0)) - 7.0;
        col *= 1.0 - 0.5 * (1.0 - smoothstep(-2.0, 10.0, dsh));
        if (dd < 1.0) {
          float acr = dot(pa, normalize(vec2(-ba.y, ba.x))) / 7.0;
          vec3 bam = vec3(0.72, 0.55, 0.3) * (0.55 + 0.45 * sqrt(max(1.0 - acr * acr, 0.0))) * (0.9 + 0.1 * vnoise(vec2(tt * 300.0, 1.0)));
          if (tt > 0.88) bam = vec3(0.08) * (0.6 + 0.4 * sqrt(max(1.0 - acr * acr, 0.0)));   // rubber tips
          col = mix(col, bam * lightAt(vec3(P, 10.0), 1.0) + 0.3 * pow(max(1.0 - abs(acr + 0.4) * 2.5, 0.0), 3.0) * (SAFE_RGB * safe * safeIrr(vec3(P, 10.0)) + WHITE_RGB * white), 1.0 - smoothstep(-1.0, 1.0, dd));
        }
      }
    }
  }

  // ---- the lifted print: its shadow, the falling drops, the dripping sheet itself
  if (h > 0.0) {
    vec2 off = vec2(34.0, 50.0) * h;
    float dsh = sdRound(Rp * (P - pr.xy - off) / pScale, PRINT_HALF, 3.0);
    col *= 1.0 - 0.55 * h * (1.0 - smoothstep(-20.0 * h, 14.0 + 26.0 * h, dsh));
  }
  for (int k = 0; k < 8; k++) {
    vec4 d = drops[k];
    if (d.w <= 0.0) continue;
    vec2 dq = (P - d.xy) / vec2(d.z, d.z * 1.5);
    float dd = dot(dq, dq);
    if (dd < 1.0) col = mix(col, col * 0.6 + (SAFE_RGB * safe * 1.8 + WHITE_RGB * white) * exp(-dot(dq + vec2(0.3, 0.4), dq + vec2(0.3, 0.4)) * 8.0), d.w);
  }
  if (h > 0.0) {
    vec2 pq = Rp * (P - pr.xy) / pScale;
    float isP, wet;
    vec3 alb = printAlbedo(pq, isP, wet);
    if (isP > 0.0) {
      vec3 Pw = vec3(P, 200.0 * h);
      // the sheet bends a little where the tongs hold it; a film of developer runs off in streaks
      float run = vnoise(vec2(pq.x * 0.05, pq.y * 0.006 - time * 2.5));
      vec3 n = normalize(vec3(0.03 * (run - 0.5), -0.16 * h + 0.06 * (pq.y / 450.0), 1.0));
      n.xy = rot(pr.z) * n.xy;
      vec3 c = alb * lightAt(Pw, 1.0) * (0.92 + 0.08 * run);
      vec3 V = normalize(cam - Pw);
      float F = 0.04 + 0.96 * pow(1.0 - clamp(dot(n, V), 0.0, 1.0), 5.0);
      c += F * envRefl(Pw, reflect(-V, n)) * (0.7 + 0.6 * run) * wet;
      col = mix(col, c, isP);
    }
  }

  // ---- grade
  col *= fade;
  col = col / (1.0 + 0.12 * col);
  vec2 vq = (fc / res - 0.5) * vec2(1.0, 0.7) * 2.0;
  col *= 1.0 - 0.38 * clamp(dot(vq, vq) * 0.5, 0.0, 1.0);
  col = pow(max(col, vec3(0.0)), vec3(1.0 / 2.2));
  col += (hash(fc + fract(time) * 91.0) - 0.5) * (0.02 + 0.03 * (1.0 - white)) * vec3(1.0, 0.9, 0.85);
  o = vec4(col, 1.0);
}`;

defineDemo({
  id: '43-darkroom',
  title: '암실에서 떠오르는 사진',
  tech: 'WebGL2 · 현상 반응 (잠상 → 은 입자) + 안전등',
  duration: D,
  background: '#000',
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2' });
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n'));
      return s;
    };
    const program = (fsrc) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fsrc));
      gl.bindAttribLocation(p, 0, 'p');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const target = (w, h, mips = false) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      const levels = mips ? Math.floor(Math.log2(Math.max(w, h))) + 1 : 1;
      gl.texStorage2D(gl.TEXTURE_2D, levels, gl.RGBA8, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { tex, fb, w, h };
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
        gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t.tex);
        if (P.u[name]) gl.uniform1i(P.u[name], unit);
        unit++;
      }
      set(P.u);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);

    // --- the photograph → target density, then the bromide-drag field (with mipmaps for the push-in)
    const Psc = program(SCENE), Pdr = program(DRAG), Pd = program(DISPLAY);
    const raw = target(TW, TH), sc = target(TW, TH, true);
    pass(Psc, raw, {}, (u) => { gl.uniform2f(u.res, TW, TH); gl.uniform1f(u.ssN, HEADLESS ? 1 : 2); });
    pass(Pdr, sc, { T: raw });
    gl.bindTexture(gl.TEXTURE_2D, sc.tex);
    gl.generateMipmap(gl.TEXTURE_2D);

    const slosh = bakeSlosh();
    const ringArr = new Float32Array(16 * 4), dropArr = new Float32Array(8 * 4);
    const tsArr = new Float32Array(12), mA = new Float32Array(12), mB = new Float32Array(6);
    this.render = (t) => {
      // per tray: rocking shift, rolling wave, ripple energy, mode amplitudes
      for (let i = 0; i < 3; i++) {
        const th = ROCK[i](t), m = slosh.out[i];
        const a0 = sample(m[0], t);
        tsArr.set([4.0 * th, 1220 * (0.5 - 0.46 * Math.cos(2 * Math.PI * (t - [0.95, 6.62, 7.75][i]) / [1.55, 0.75, 1.7][i])), 5.5 * Math.abs(th) + 0.25 * Math.abs(a0), Math.min(1.6, sample(slosh.energy[i], t))], i * 4);
        mA.set([a0, sample(m[1], t), sample(m[2], t), sample(m[3], t)], i * 4);
        mB.set([sample(m[4], t), sample(m[5], t)], i * 2);
      }
      ringArr.fill(0);
      RINGS.filter((r) => t > r[2] && t < r[2] + 3.5).slice(-16).forEach((r, k) => ringArr.set(r, k * 4));
      dropArr.fill(0);
      let nd = 0;
      const px0 = printX(t), py0 = printY(t), pr = printR(t), h = lift(t);
      for (const d of DROPS) {
        const age = t - d.t0;
        if (age < 0 || age > 0.22 || nd >= 8) continue;
        // a drop leaves the lower edge of the print and falls toward the liquid (toward the camera's foot: it shrinks)
        const fall = age / 0.22;
        dropArr.set([px0 + d.dx, py0 + 450 * (1 + 0.1 * h) + 30 * fall * fall, d.r * (1 - 0.3 * fall), 1 - fall * fall * 0.6], nd * 4);
        nd++;
      }
      pass(Pd, null, { Sc: sc }, (u) => {
        gl.uniform2f(u.res, W, H); gl.uniform2f(u.zc, 430, 760);
        gl.uniform1f(u.camX, camX(t)); gl.uniform1f(u.zoom, zoom(t)); gl.uniform1f(u.time, t);
        gl.uniform1f(u.safe, safe(t)); gl.uniform1f(u.white, white(t)); gl.uniform1f(u.tDev, devClock(t));
        gl.uniform1f(u.fixAmt, fixAmt(t)); gl.uniform1f(u.fade, fade(t)); gl.uniform1f(u.devDone, smooth((t - 5.0) / 1.2));
        gl.uniform4f(u.pr, px0, py0 + (h < 0.01 ? [0, 1, 2].map((i) => 4.0 * ROCK[i](t))[Math.round((px0 - 540) / PITCH)] : 0), pr, h);
        gl.uniform1f(u.pScale, 1 + 0.07 * h);
        gl.uniform4fv(u.trayS, tsArr); gl.uniform4fv(u.modeA, mA); gl.uniform2fv(u.modeB, mB);
        gl.uniform4fv(u.rings, ringArr); gl.uniform4fv(u.drops, dropArr);
      });
    };
  },
  frame(t) {
    this.render(t);
  },
});
