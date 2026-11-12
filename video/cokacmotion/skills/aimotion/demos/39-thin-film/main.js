/*
 * 39 · 비눗방울 무지개 — the colours of a soap bubble, computed from the physics of a thin film.
 *
 * One full-screen fragment shader ray-casts a wobbling bubble (a volume-preserving ellipsoid, the l = 2 shape
 * mode, ringing down after it detaches). Both walls the ray crosses are a soap film of thickness h(s, t):
 *   • drainage — Mysels' law for a vertical film h = √(ηz / ρgt) (thin at the top, thick at the bottom),
 *     saturating at the thickness it was blown with; the "front" F(t) is a time-lapse clock;
 *   • convection — the thickness pattern is carried by a divergence-free flow on the sphere
 *     (v = ∇ψ × s, ψ a time-varying noise stream function), traced backwards from t to 0 per pixel;
 *   • black film — where h falls below ~80 nm it jumps to the 12 nm Newton black film (sharp-edged spots).
 * For every pixel the film reflectance R(λ) is the Airy sum of the two interfaces (r23 = −r12: the half-wave
 * phase flip at the first face), for s and p polarisation at the true angle of incidence (Snell inside the
 * film, water's dispersion), at 41 wavelengths 380…780 nm. Σ R(λ)·D65(λ)·CMF(λ) → XYZ → linear sRGB is folded
 * into 41 RGB weights in setup(), so the shader just sums R(λ)·W[λ]. The film reflects a soft studio
 * environment; the far wall is seen through the near one (T = 1 − R).
 * The pop: a hole opens in a black spot and its rim runs over the sphere at a constant (Taylor–Culick) speed,
 * shown in slow motion; the rim beads (Rayleigh–Plateau) and sheds droplets, drawn as point sprites with exact
 * sphere refraction. Everything is a pure function of t.
 */
import { defineDemo, track, ease, rand, clamp } from '../_lib/stage.js';

const D = 9.5;
const T_POP = 7.25, POP_DUR = 0.55;          // the rim crosses the whole bubble in 0.55 s (slow motion)
const DIST = 6.2, FOCAL = 2420;              // bubble radius 1 at 6.2 units → ~395 px on screen
const NS = 41;                               // spectral samples, 380…780 nm every 10 nm
const EXPO = 1.5;

// ---------------------------------------------------------------- shared GLSL: environment + tone
const COMMON = `
const float PI = 3.14159265;
const float EXPO = ${EXPO.toFixed(2)};
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
// a rectangular soft light seen in direction c: gnomonic coordinates on its plane, soft-edged box
float panel(vec3 d, vec3 c, vec2 hs, float soft, out vec2 uv) {
  float k = dot(d, c);
  uv = vec2(9.0);
  if (k < 0.1) return 0.0;
  vec3 e1 = normalize(cross(vec3(0.0, 1.0, 0.0), c)), e2 = cross(c, e1);
  uv = vec2(dot(d, e1), dot(d, e2)) / k;
  vec2 q = abs(uv) - hs;
  float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  return 1.0 - smoothstep(-soft, soft, sd);
}
// the studio around the bubble: dark backdrop ahead of the camera, a lit room behind it with a four-pane
// window (hot centre), a cool strip light and a small warm lamp
vec3 env(vec3 d) {
  vec3 c = mix(vec3(0.004, 0.005, 0.011), vec3(0.020, 0.018, 0.034), smoothstep(-0.7, 0.9, d.y));
  float behind = smoothstep(-0.30, 0.60, d.z);
  vec3 dome = mix(vec3(0.24, 0.15, 0.10), vec3(1.55, 1.60, 1.78), smoothstep(-0.55, 0.85, d.y));
  c += dome * behind;
  vec2 uv;
  float w = panel(d, normalize(vec3(-0.52, 0.50, 0.69)), vec2(0.34, 0.26), 0.02, uv);
  float mull = smoothstep(0.006, 0.016, abs(uv.x)) * smoothstep(0.006, 0.016, abs(uv.y));
  c += vec3(1.0, 0.95, 0.88) * w * mull * (7.0 + 9.0 * exp(-dot(uv, uv) * 7.0));
  float s = panel(d, normalize(vec3(0.80, 0.05, 0.60)), vec2(0.07, 0.48), 0.03, uv);
  c += vec3(0.75, 0.88, 1.0) * s * 6.0;
  float lw = max(dot(d, normalize(vec3(0.30, -0.42, 0.86))), 0.0);
  c += vec3(1.0, 0.55, 0.25) * (3.0 * smoothstep(0.985, 0.995, lw) + 0.35 * pow(lw, 12.0));
  return c;
}
vec3 tonemap(vec3 c) {
  c = max(c, 0.0);
  c = (c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14);
  return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
}
`;

const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 stage;
uniform float focal, fade, frameNo, pxs;
uniform vec3 bc, axes;
uniform mat3 brot;
uniform float front, flowT, spotK, popA, show, bokehY;
uniform vec3 popQ, popE1, popE2;
uniform vec3 W[${NS}];
out vec4 o;
${COMMON}
const float H0 = 1500.0;      // thickness the bubble was blown with (nm)
const float HC = 80.0;        // below this the film collapses to the Newton black film
const float HBLACK = 12.0;
const float SWIRL = 0.14;
const mat3 ROT = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);   // orthonormal

float hash3(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
// value noise with its analytic gradient: (n, dn/dx, dn/dy, dn/dz)
vec4 noised(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec3 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  float a = hash3(i), b = hash3(i + vec3(1, 0, 0)), c = hash3(i + vec3(0, 1, 0)), d = hash3(i + vec3(1, 1, 0));
  float e = hash3(i + vec3(0, 0, 1)), f1 = hash3(i + vec3(1, 0, 1)), g = hash3(i + vec3(0, 1, 1)), h = hash3(i + vec3(1, 1, 1));
  float k1 = b - a, k2 = c - a, k3 = e - a, k4 = a - b - c + d, k5 = a - c - e + g, k6 = a - b - e + f1, k7 = -a + b + c - d + e - f1 - g + h;
  float v = a + k1 * u.x + k2 * u.y + k3 * u.z + k4 * u.x * u.y + k5 * u.y * u.z + k6 * u.z * u.x + k7 * u.x * u.y * u.z;
  vec3 gr = du * vec3(k1 + k4 * u.y + k6 * u.z + k7 * u.y * u.z,
                      k2 + k5 * u.z + k4 * u.x + k7 * u.z * u.x,
                      k3 + k6 * u.x + k5 * u.y + k7 * u.x * u.y);
  return vec4(v, gr);
}
// gradient of the stream function ψ(s, t): two octaves drifting upward (warm thin film rises)
vec3 flowGrad(vec3 s, float tt) {
  vec3 g = noised(s * 1.7 + vec3(0.0, -0.10 * tt, 0.0)).yzw * 1.7;
  g += 0.55 * 3.4 * (transpose(ROT) * noised(ROT * s * 3.4 + vec3(4.1, 1.3 - 0.22 * tt, 2.7)).yzw);
  return g;
}
// where the film now at s was at t = 0: integrate the surface flow v = ∇ψ × s backwards (12 midpoint steps)
vec3 advectBack(vec3 s) {
  float dt = flowT / 12.0;
  for (int k = 0; k < 12; k++) {
    float tk = flowT - (float(k) + 0.5) * dt;
    vec3 v = cross(flowGrad(s, tk), s) * SWIRL;
    s = normalize(s - v * dt);
  }
  return s;
}
float thickness(vec3 s) {
  vec3 a = advectBack(s);
  float z = 1.0 - mix(s.y, a.y, 0.7);                       // depth below the top of the bubble (0…2 radii)
  float x = max(z + 0.012, 0.0) / front;
  float x2 = x * x;
  float prof = sqrt(x / sqrt(sqrt(1.0 + x2 * x2)));         // √(z/t) (Mysels), smoothly capped at 1
  float m = noised(a * 2.6 + 1.7).x * 0.65 + noised(ROT * a * 5.9 + 3.1).x * 0.35;
  float h = H0 * prof * (0.74 + 0.52 * m);
  h *= 1.0 - spotK * exp(-max(1.0 - dot(s, popQ), 0.0) / 0.005);   // the black spot where it will burst
  return mix(HBLACK, h, smoothstep(HC - 4.0, HC + 4.0, h));
}
// spectral reflectance of a free film (air | water n(λ) | air), unpolarised, summed into linear sRGB
vec3 filmRGB(float h, float cosi) {
  float sin2 = 1.0 - cosi * cosi;
  vec3 acc = vec3(0.0);
  for (int i = 0; i < ${NS}; i++) {
    float lam = 380.0 + 10.0 * float(i);
    float n = 1.324 + 3300.0 / (lam * lam);                 // water (Cauchy fit)
    float ct = sqrt(max(1.0 - sin2 / (n * n), 0.0));        // Snell: cosine inside the film
    float rs = (cosi - n * ct) / (cosi + n * ct);           // Fresnel amplitude coefficients, r23 = −r12
    float rp = (n * cosi - ct) / (n * cosi + ct);
    float c = cos(4.0 * PI * n * h * ct / lam);             // round-trip phase δ
    float rs2 = rs * rs, rp2 = rp * rp;
    float Rs = 2.0 * rs2 * (1.0 - c) / (1.0 + rs2 * rs2 - 2.0 * rs2 * c);
    float Rp = 2.0 * rp2 * (1.0 - c) / (1.0 + rp2 * rp2 - 2.0 * rp2 * c);
    acc += W[i] * (0.5 * (Rs + Rp));
  }
  return acc;
}
// the burst: film presence (0 inside the hole) and the beaded liquid rim at the hole's edge (rgb, alpha)
vec4 hole(vec3 s, vec3 n, vec3 rd, out float film) {
  film = 1.0;
  if (popA < 0.0) return vec4(0.0);
  float ca = clamp(dot(s, popQ), -1.0, 1.0);
  float ang = acos(ca);
  float az = atan(dot(s, popE2), dot(s, popE1));
  float bead = 0.5 + 0.5 * cos(az * 23.0 + 2.0 * sin(az * 5.0 + popA * 3.0));
  float rw = (0.010 + 0.022 * popA / PI) * (0.55 + 0.9 * bead * bead);
  float aa = pxs * 1.5;
  film = smoothstep(popA + rw - aa, popA + rw + aa, ang);
  float a = smoothstep(popA - aa, popA + aa, ang) * (1.0 - film);
  if (a <= 0.0) return vec4(0.0);
  float u = clamp((ang - popA) / rw, 0.0, 1.0);
  vec3 tq = ca * s - popQ;
  float tl = length(tq);
  vec3 ea = tl > 1e-5 ? tq / tl : vec3(0.0);                // along the sphere, away from the burst point
  vec3 nf = dot(n, rd) < 0.0 ? n : -n;                     // the side of the rim facing the camera
  float ph = (u - 0.5) * 2.6;
  vec3 nt = normalize(nf * cos(ph) + ea * sin(ph));        // normal across the rim's round cross-section
  float cv = clamp(-dot(rd, nt), 0.0, 1.0);
  float F = 0.02 + 0.98 * pow(1.0 - cv, 5.0);
  vec3 rc = F * env(reflect(rd, nt)) + (1.0 - F) * vec3(0.012, 0.014, 0.024);
  rc += vec3(0.9, 0.95, 1.0) * 0.25 * bead * exp(-(u - 0.35) * (u - 0.35) * 30.0);
  return vec4(rc, a * 0.96);
}
// background: a dark, out-of-focus garden of lights (hash grid, each disc may cross into neighbour cells)
vec3 bokeh(vec2 p, float cell, float keep, float seed, float r0, float r1, float k) {
  vec2 g = p / cell, id0 = floor(g);
  vec3 acc = vec3(0.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = id0 + vec2(i, j);
    float h = h21(id + seed);
    if (h > keep) continue;
    vec2 ctr = (id + 0.5 + (vec2(h21(id + seed + 3.1), h21(id + seed + 7.7)) - 0.5) * 0.6) * cell;
    float r = mix(r0, r1, h21(id + seed + 11.3));
    float d = length(p - ctr);
    float disc = 1.0 - smoothstep(r - 1.5, r + 1.5, d);
    float ring = smoothstep(r * 0.72, r, d) * disc;
    float hc = h21(id + seed + 5.0);
    vec3 tint = hc < 0.4 ? vec3(1.0, 0.62, 0.32) : hc < 0.65 ? vec3(1.0, 0.48, 0.58) : hc < 0.85 ? vec3(0.42, 0.72, 1.0) : vec3(0.95, 0.88, 0.70);
    acc += tint * (disc * 0.8 + ring * 0.45) * k * (0.35 + 0.65 * h21(id + seed + 2.0));
  }
  return acc;
}
vec3 backdrop(vec2 px) {
  vec2 uv = px / stage;
  vec3 c = mix(vec3(0.003, 0.004, 0.010), vec3(0.016, 0.014, 0.030), uv.y);
  vec2 a = uv - vec2(0.15, 0.10), b = uv - vec2(0.95, 0.78);
  c += vec3(0.060, 0.028, 0.012) * exp(-dot(a, a * vec2(3.0, 5.0)));
  c += vec3(0.012, 0.030, 0.050) * exp(-dot(b, b * vec2(3.0, 4.0)));
  vec2 p = px + vec2(0.0, bokehY);
  c += bokeh(p, 230.0, 0.45, 1.0, 22.0, 64.0, 0.07);
  c += bokeh(p * 0.92 + vec2(77.0, 31.0), 120.0, 0.30, 9.0, 8.0, 22.0, 0.05);
  return c;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec3 rd = normalize(vec3(px - 0.5 * stage, -focal));
  vec3 bg = backdrop(px);
  vec3 col = bg;
  if (show > 0.5) {
    // the ellipsoid in its own frame is the unit sphere: transform the ray, solve the quadratic
    mat3 rt = transpose(brot);
    vec3 o_ = (rt * (-bc)) / axes;
    vec3 d_ = (rt * rd) / axes;
    float a = dot(d_, d_), b = dot(o_, d_);
    float imp2 = max(dot(o_, o_) - b * b / a, 0.0);
    float cov = clamp((1.0 - sqrt(imp2)) / pxs + 0.5, 0.0, 1.0);     // anti-aliased silhouette
    if (cov > 0.0) {
      float sq = sqrt(max(a * (1.0 - imp2), 0.0));
      vec3 p0 = normalize(o_ + d_ * ((-b - sq) / a));     // near wall
      vec3 p1 = normalize(o_ + d_ * ((-b + sq) / a));     // far wall
      vec3 s0 = brot * p0, s1 = brot * p1;                 // film coordinates (gravity-aligned)
      vec3 n0 = normalize(brot * (p0 / axes)), n1 = normalize(brot * (p1 / axes));
      float c0 = clamp(-dot(rd, n0), 1e-3, 1.0), c1 = clamp(dot(rd, n1), 1e-3, 1.0);
      float f0, f1;
      vec4 rim0 = hole(s0, n0, rd, f0);
      vec4 rim1 = hole(s1, n1, rd, f1);
      vec3 R0 = f0 > 0.001 ? filmRGB(thickness(s0), c0) * f0 : vec3(0.0);
      vec3 R1 = f1 > 0.001 ? filmRGB(thickness(s1), c1) * f1 : vec3(0.0);
      vec3 far = bg * (1.0 - R1) * (1.0 - rim1.a) + R1 * env(reflect(rd, n1)) + rim1.rgb * rim1.a;
      vec3 bub = far * (1.0 - R0) * (1.0 - rim0.a) + R0 * env(reflect(rd, n0)) + rim0.rgb * rim0.a;
      col = mix(bg, bub, cov);
    }
  }
  col = tonemap(col * EXPO);
  vec2 uv = px / stage - 0.5;
  col *= 1.0 - 0.55 * dot(uv * vec2(1.0, 0.8), uv * vec2(1.0, 0.8));
  col *= fade;
  col += (h21(px + frameNo * 7.13) - 0.5) / 255.0 * 1.5;
  o = vec4(col, 1.0);
}`;

// droplets: point sprites shaded as water spheres (exact two-refraction path, Fresnel, window glint)
const DROP_VERT = `#version 300 es
in vec4 a;          // x, y (stage px, y down), radius (px), alpha
uniform vec2 stage;
out float vR, vA;
void main() {
  vR = max(a.z, 0.6); vA = a.w;
  gl_Position = a.w > 0.002 ? vec4(a.x / stage.x * 2.0 - 1.0, 1.0 - a.y / stage.y * 2.0, 0.0, 1.0) : vec4(2.0, 2.0, 2.0, 1.0);
  gl_PointSize = 2.0 * (vR + 1.5);
}`;
const DROP_FRAG = `#version 300 es
precision highp float;
uniform vec2 stage;
uniform float focal, fade;
in float vR, vA;
out vec4 o;
${COMMON}
void main() {
  vec2 q = (gl_PointCoord * 2.0 - 1.0) * (vR + 1.5) / vR;
  q.y = -q.y;
  float d = length(q);
  float cov = clamp((1.0 - d) * vR + 0.5, 0.0, 1.0);
  if (cov <= 0.0) discard;
  vec3 rd = normalize(vec3(gl_FragCoord.xy - 0.5 * stage, -focal));
  vec3 n = normalize(vec3(q, sqrt(max(1.0 - d * d, 0.0))));
  float cv = clamp(-dot(rd, n), 0.0, 1.0);
  float F = 0.02 + 0.98 * pow(1.0 - cv, 5.0);
  vec3 col = F * env(reflect(rd, n));
  vec3 t1 = refract(rd, n, 1.0 / 1.333);                   // into the drop …
  vec3 p2 = n + t1 * (-2.0 * dot(n, t1));                  // … across the unit sphere …
  vec3 t2 = refract(t1, -p2, 1.333);                       // … and out (total internal reflection → mirror)
  if (dot(t2, t2) < 0.5) t2 = reflect(t1, -p2);
  col += (1.0 - F) * 0.92 * env(t2);
  vec3 nh = normalize(normalize(vec3(-0.52, 0.50, 0.69)) - rd);   // where the window glints (≥ 1 px wide)
  vec2 dq = q - nh.xy;
  col += vec3(1.0, 0.96, 0.9) * 1.6 * exp(-dot(dq, dq) * vR * vR / 1.4);
  o = vec4(tonemap(col * EXPO) * fade, cov * vA);
}`;

// ---------------------------------------------------------------- spectral weights (CIE 1931 → sRGB)
function cmf(l) {   // Wyman, Sloan & Shirley (2013) multi-lobe fit of the CIE 1931 2° observer
  const g = (x, mu, s1, s2) => { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
  return [
    1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
    0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
    1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8),
  ];
}
// CIE standard illuminant D65, 380…780 nm in 10 nm steps
const D65 = [49.98, 54.65, 82.75, 91.49, 93.43, 86.68, 104.86, 117.01, 117.81, 114.86, 115.92, 108.81, 109.35, 107.80,
  104.79, 107.69, 104.41, 104.05, 100.00, 96.33, 95.79, 88.69, 90.01, 89.60, 87.70, 83.29, 83.70, 80.03, 80.21, 82.28,
  78.28, 69.72, 71.61, 74.35, 61.60, 69.89, 75.09, 63.59, 46.42, 66.81, 63.38];
function spectralWeights() {
  const M = [[3.2406, -1.5372, -0.4986], [-0.9689, 1.8758, 0.0415], [0.0557, -0.2040, 1.0570]];
  const W = new Float32Array(NS * 3), sum = [0, 0, 0];
  for (let i = 0; i < NS; i++) {
    const [X, Y, Z] = cmf(380 + 10 * i).map((v) => v * D65[i]);
    for (let k = 0; k < 3; k++) { W[i * 3 + k] = M[k][0] * X + M[k][1] * Y + M[k][2] * Z; sum[k] += W[i * 3 + k]; }
  }
  for (let i = 0; i < NS; i++) for (let k = 0; k < 3; k++) W[i * 3 + k] /= sum[k];   // R ≡ 1 → white (1, 1, 1)
  return W;
}

// ---------------------------------------------------------------- timeline (all pure functions of t)
const fade = track([[0, 0], [0.9, 1, ease.outCubic], [9.0, 1], [D, 0, ease.inCubic]]);
const riseY = track([[0, -3.3], [2.7, 0.36, ease.outCubic], [D, 0.50, ease.inOutCubic]]);
const logFront = track([[0, Math.log(0.10)], [2.4, Math.log(0.45)], [5.0, Math.log(2.6)], [6.4, Math.log(14)], [T_POP, Math.log(48)]]);
const spotK = track([[5.6, 0], [T_POP, 0.9, ease.inOutCubic]]);
const bubbleCenter = (t) => [0.07 * Math.sin(0.7 * t + 0.4) - 0.03, riseY(t), -DIST];
const popA = (t) => (t < T_POP ? -1 : ((t - T_POP) / POP_DUR) * Math.PI);

const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const POPQ = norm([-0.22, 0.90, 0.38]);            // the burst point: in the black cap, tilted toward us
const POPE1 = norm(cross(POPQ, [0, 0, 1]));
const POPE2 = cross(POPQ, POPE1);

// the l = 2 shape mode after detaching: semi-axes (1+ex, 1+ey, 1/((1+ex)(1+ey))) — volume preserved — and a sway
function shape(t) {
  const vy = (riseY(t + 0.01) - riseY(t - 0.01)) / 0.02;     // rising fast flattens it a little
  const ex = 0.050 * Math.exp(-t / 1.6) * Math.cos(7.2 * t + 0.5) + 0.006 * Math.sin(1.9 * t);
  const ey = 0.045 * Math.exp(-t / 1.4) * Math.cos(7.2 * t + 2.1) - 0.012 * vy + 0.005 * Math.sin(2.3 * t + 1);
  const ez = 1 / ((1 + ex) * (1 + ey)) - 1;
  const th = 0.12 * Math.exp(-t / 2) * Math.sin(4.1 * t) + 0.03 * Math.sin(0.8 * t);
  const ph = 0.08 * Math.exp(-t / 2) * Math.cos(5.3 * t);
  const cz = Math.cos(th), sz = Math.sin(th), cx = Math.cos(ph), sx = Math.sin(ph);
  // brot = Rz(th)·Rx(ph), column-major for uniformMatrix3fv
  const Rz = [[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]], Rx = [[1, 0, 0], [0, cx, -sx], [0, sx, cx]];
  const R = Rz.map((row) => [0, 1, 2].map((j) => row[0] * Rx[0][j] + row[1] * Rx[1][j] + row[2] * Rx[2][j]));
  return { axes: [1 + ex, 1 + ey, 1 + ez], rot: [R[0][0], R[1][0], R[2][0], R[0][1], R[1][1], R[2][1], R[0][2], R[1][2], R[2][2]] };
}

// droplets shed by the rim: born where (and when) the rim passes, flying off along the sphere with drag + gravity
const ND = 1400;
function makeDrops() {
  const R = rand(3901), vr = Math.PI / POP_DUR, out = [];
  for (let i = 0; i < ND; i++) {
    const big = i < 90;                                     // the last of the rim collapses into big drops
    const al = big ? Math.PI - 0.45 * Math.sqrt(R()) : Math.acos(1 - 2 * (0.003 + 0.997 * R()));
    const ph = R() * 2 * Math.PI;
    const tb = T_POP + (al / Math.PI) * POP_DUR;
    const ring = [0, 1, 2].map((k) => POPE1[k] * Math.cos(ph) + POPE2[k] * Math.sin(ph));
    const s = [0, 1, 2].map((k) => POPQ[k] * Math.cos(al) + ring[k] * Math.sin(al));
    const ea = [0, 1, 2].map((k) => -POPQ[k] * Math.sin(al) + ring[k] * Math.cos(al));
    const sp = big ? vr * (0.08 + 0.18 * R()) : vr * (0.22 + 0.5 * R());
    const rad = (R() - 0.35) * 0.35 * vr * (big ? 0.5 : 1);
    const jit = [R() - 0.5, R() - 0.5, R() - 0.5].map((v) => v * 0.15 * vr);
    const size = big ? 0.009 + 0.016 * R() : 0.0022 + 0.012 * R() ** 3;
    const c = bubbleCenter(tb);
    out.push({
      tb, size,
      P0: [0, 1, 2].map((k) => c[k] + s[k]),
      V: [0, 1, 2].map((k) => ea[k] * sp + s[k] * rad + jit[k]),
      k: clamp(4.5e-4 / (size * size), 1.2, 12),           // Stokes drag ∝ 1/r²: mist stops fast, big drops fly on
      mist: size < 0.004,
    });
  }
  return out;
}

defineDemo({
  id: '39-thin-film',
  title: '비눗방울 무지개',
  tech: '스펙트럼 박막 간섭 · 두께장 흐름',
  duration: D,
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const program = (vs, fs, attr) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, attr);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      return p;
    };
    const film = program(VERT, FRAG, 'p');
    const drops = program(DROP_VERT, DROP_FRAG, 'a');
    const U = {}, V = {};
    for (const n of ['stage', 'focal', 'fade', 'frameNo', 'pxs', 'bc', 'axes', 'brot', 'front', 'flowT', 'spotK', 'popA', 'show', 'bokehY', 'popQ', 'popE1', 'popE2', 'W']) U[n] = gl.getUniformLocation(film, n);
    for (const n of ['stage', 'focal', 'fade']) V[n] = gl.getUniformLocation(drops, n);

    const quad = gl.createVertexArray();
    gl.bindVertexArray(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const dropList = makeDrops();
    const dropData = new Float32Array(ND * 4);
    const pts = gl.createVertexArray();
    gl.bindVertexArray(pts);
    const dropBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dropBuf);
    gl.bufferData(gl.ARRAY_BUFFER, dropData.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    gl.useProgram(film);
    gl.uniform2f(U.stage, W, H);
    gl.uniform1f(U.focal, FOCAL);
    gl.uniform1f(U.pxs, DIST / FOCAL);
    gl.uniform3fv(U.popQ, POPQ); gl.uniform3fv(U.popE1, POPE1); gl.uniform3fv(U.popE2, POPE2);
    gl.uniform3fv(U.W, spectralWeights());
    gl.useProgram(drops);
    gl.uniform2f(V.stage, W, H);
    gl.uniform1f(V.focal, FOCAL);
    gl.viewport(0, 0, W, H);

    this.draw = (t) => {
      const f = fade(t), pa = popA(t), sp = shape(t);
      gl.disable(gl.BLEND);
      gl.useProgram(film);
      gl.bindVertexArray(quad);
      gl.uniform1f(U.fade, f);
      gl.uniform1f(U.frameNo, Math.round(t * 30));
      gl.uniform3fv(U.bc, bubbleCenter(t));
      gl.uniform3fv(U.axes, sp.axes);
      gl.uniformMatrix3fv(U.brot, false, sp.rot);
      gl.uniform1f(U.front, Math.exp(logFront(t)));
      gl.uniform1f(U.flowT, t * 1.15);
      gl.uniform1f(U.spotK, spotK(t));
      gl.uniform1f(U.popA, pa);
      gl.uniform1f(U.show, pa < Math.PI + 0.1 ? 1 : 0);
      gl.uniform1f(U.bokehY, 260 * ease.outCubic(clamp(t / 2.7)) + 14 * t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (t < T_POP) return;
      // droplets, in closed form: x(τ) = x0 + v(1 − e^(−kτ))/k + g(τ/k − (1 − e^(−kτ))/k²)
      const G = 2.4;
      for (let i = 0; i < ND; i++) {
        const d = dropList[i], tau = t - d.tb;
        let alpha = 0, x = 0, y = 0, r = 0;
        if (tau > 0) {
          const e = Math.exp(-d.k * tau), a1 = (1 - e) / d.k, a2 = tau / d.k - (1 - e) / (d.k * d.k);
          const Px = d.P0[0] + d.V[0] * a1, Py = d.P0[1] + d.V[1] * a1 - G * a2, Pz = d.P0[2] + d.V[2] * a1;
          const z = Math.max(-Pz, 0.5);
          x = W / 2 + FOCAL * Px / z; y = H / 2 - FOCAL * Py / z; r = FOCAL * d.size / z;
          alpha = clamp(tau / 0.03) * (d.mist ? Math.exp(-tau * 0.9) : 1) * Math.min(1, r / 0.7);
        }
        dropData.set([x, y, r, alpha], i * 4);
      }
      gl.useProgram(drops);
      gl.bindVertexArray(pts);
      gl.bindBuffer(gl.ARRAY_BUFFER, dropBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, dropData);
      gl.uniform1f(V.fade, f);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
      gl.drawArrays(gl.POINTS, 0, ND);
      gl.disable(gl.BLEND);
    };
  },
  frame(t) { this.draw(t); },
});
