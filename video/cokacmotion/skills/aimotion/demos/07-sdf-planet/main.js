/*
 * 07 · 고리를 두른 행성 — a ringed planet in one fragment shader.
 *
 * The planet (an oblate ellipsoid) and a small moon are signed distance functions, found by sphere tracing
 * from the camera. The ring is the plane y = 0 between 1.11 and 2.95 planet radii; its radial structure
 * (C ring, B ring, Cassini division, A ring with the Encke gap, F and G rings) is a 1-D optical-depth
 * profile baked in setup() into a mipmapped texture. Light on the ring is single scattering in a thin slab
 * (reflection when sun and eye are on the same face, diffuse transmission otherwise) with a
 * Henyey–Greenstein phase mixing back-scattering ice and forward-scattering dust — so the dusty parts glow
 * when the ring is backlit. Shadows both ways: the sun ray from a planet point crosses the ring plane
 * (transmittance e^(−τ/μ0)), and the ring point's sun ray is soft-shadow-marched against the SDF
 * (planet and moon). Everything is a pure function of t through the uniforms below.
 */
import { defineDemo, track, ease } from '../_lib/stage.js';

const R0 = 1.11, R1 = 4.6, RING_N = 4096;   // ring texture: radius range (planet radii) and resolution

const FRAG = `#version 300 es
precision highp float;
uniform vec2 stage, ctr;
uniform float focal, t, rot, sunI, sunVis, flare, frameNo, fade;
uniform vec3 camPos, camF, camR, camU, L, moonP;
uniform float moonR;
uniform sampler2D ringTex;
out vec4 o;

const vec3 PR = vec3(1.0, 0.90, 1.0);        // oblate planet: polar radius 0.90
const float R0 = ${R0.toFixed(3)}, R1 = ${R1.toFixed(3)};
const float PI = 3.14159265;

float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float h31(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float n3(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1, 0, 0)), f.x), mix(h31(i + vec3(0, 1, 0)), h31(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(h31(i + vec3(0, 0, 1)), h31(i + vec3(1, 0, 1)), f.x), mix(h31(i + vec3(0, 1, 1)), h31(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm3(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * n3(p); p = p * 2.07 + 11.3; a *= 0.5; } return s; }

// ---------------------------------------------------------------- the SDF scene
float sdPlanet(vec3 p) { float k0 = length(p / PR), k1 = length(p / (PR * PR)); return k0 * (k0 - 1.0) / k1; }
float sdMoon(vec3 p) { return length(p - moonP) - moonR; }
float map(vec3 p) { return min(sdPlanet(p), sdMoon(p)); }
vec3 normalAt(vec3 p) {
  const vec2 e = vec2(1.0, -1.0) * 0.0007;
  return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}
// soft shadow toward the sun: the closest miss along the sun ray sets the penumbra (k = sharpness)
float softShadow(vec3 p, float k) {
  float res = 1.0, s = 0.02;
  for (int i = 0; i < 26; i++) {
    float h = map(p + L * s);
    res = min(res, k * h / s);
    s += clamp(h, 0.04, 0.7);
    if (res < 0.002 || s > 9.0) break;
  }
  return smoothstep(0.0, 1.0, clamp(res, 0.0, 1.0));
}
float hg(float c, float g) { float g2 = g * g; return (1.0 - g2) / pow(max(1.0 + g2 - 2.0 * g * c, 1e-4), 1.5); }

// ---------------------------------------------------------------- planet surface
vec3 bandCol(float x) {           // x = sin(latitude) (+ turbulence)
  float f = 0.50 * sin(x * 21.0 + 0.6) + 0.30 * sin(x * 47.0 + 1.9) + 0.20 * sin(x * 93.0 + 0.4);
  vec3 cream = vec3(0.95, 0.85, 0.66), butter = vec3(0.80, 0.60, 0.38), dusk = vec3(0.64, 0.50, 0.36);
  vec3 c = mix(butter, cream, smoothstep(-0.35, 0.45, f));
  c = mix(c, dusk, smoothstep(0.55, 0.9, -f) * 0.6);
  c = mix(c, vec3(0.98, 0.90, 0.72), smoothstep(0.16, 0.02, abs(x - 0.02)) * 0.65);     // bright equatorial zone
  c = mix(c, vec3(0.50, 0.58, 0.66), smoothstep(0.80, 0.95, x));                        // bluish northern hood
  c = mix(c, vec3(0.62, 0.56, 0.50), smoothstep(-0.78, -0.95, x));                      // southern polar region
  return c;
}
vec3 albedo(vec3 p) {
  vec3 s = normalize(p / PR);
  float lat = asin(clamp(s.y, -1.0, 1.0));
  float lon = atan(s.z, s.x) + rot;
  // the storm: an oval vortex that twists the bands around it
  const float SLAT = -0.50;
  float slon = 0.95 + rot * 0.03;
  float dx = mod(lon - slon + PI, 2.0 * PI) - PI;
  vec2 q = vec2(dx * cos(SLAT), lat - SLAT);
  float d2 = dot(q / vec2(0.15, 0.075), q / vec2(0.15, 0.075));
  float sw = 2.6 * exp(-d2 * 0.9);
  q = mat2(cos(sw), sin(sw), -sin(sw), cos(sw)) * q;
  float lat2 = SLAT + q.y, lon2 = slon + q.x / cos(SLAT);
  vec3 z = vec3(cos(lon2) * 3.0, lat2 * 34.0, sin(lon2) * 3.0);
  float turb = fbm3(z) - 0.5;
  float x = sin(lat2) + turb * 0.035 + 0.006 * sin(lon2 * 7.0 + lat2 * 40.0);
  vec3 c = bandCol(x);
  c *= 0.93 + 0.14 * fbm3(z * 2.3 + 5.0);
  // storm core and its dark collar
  c = mix(c, vec3(1.0, 0.95, 0.84), smoothstep(1.2, 0.0, d2) * 0.85);
  c *= 1.0 - 0.18 * smoothstep(0.8, 1.6, d2) * smoothstep(3.2, 1.6, d2);
  // the polar hexagon
  float rho = acos(clamp(s.y, -1.0, 1.0));
  float th = atan(s.z, s.x) + rot;
  float hx = 0.24 / cos(mod(th, PI / 3.0) - PI / 6.0);
  c = mix(c, vec3(0.40, 0.50, 0.60), smoothstep(hx + 0.01, hx - 0.01, rho) * 0.7);
  c += vec3(0.08, 0.07, 0.05) * smoothstep(0.012, 0.0, abs(rho - hx));
  return c;
}

vec4 ringAt(float r, float lodBias) { return texture(ringTex, vec2((r - R0) / (R1 - R0), 0.5), lodBias); }

// irradiance falling on a planet point: Lambert × ring-shadow transmittance × moon shadow
vec3 shadePlanet(vec3 p, vec3 n, vec3 rd) {
  vec3 alb = albedo(p);
  float nl = dot(n, L);
  float diff = pow(clamp((nl + 0.05) / 1.05, 0.0, 1.0), 1.15);
  float ringT = 1.0;
  if (p.y * L.y < 0.0) {                               // the sun ray from here crosses the ring plane
    vec3 q = p + L * (-p.y / L.y);
    float r = length(q.xz);
    if (r > R0 && r < R1) ringT = exp(-textureLod(ringTex, vec2((r - R0) / (R1 - R0), 0.5), 2.5).x / abs(L.y));
  }
  vec3 mc = moonP - p;                                   // moon shadow (analytic penumbra)
  float ms = dot(mc, L);
  float moonSh = ms > 0.0 ? smoothstep(moonR * 0.75, moonR * 1.35, length(mc - L * ms)) : 1.0;
  float mu = max(dot(n, -rd), 0.0);
  vec3 col = alb * diff * ringT * moonSh * pow(mu, 0.18) * sunI;
  // ringshine: the lit face of the rings fills the night side near the equator
  float face = p.y * L.y > 0.0 ? 1.0 : 0.25;
  col += alb * vec3(0.95, 0.80, 0.62) * 0.022 * (1.0 - n.y * n.y) * face * smoothstep(0.2, -0.3, nl) * sunI;
  // atmosphere: thin blue haze at the lit limb, forward-scattered gold when backlit
  float rim = pow(max(1.0 - mu, 0.0), 4.0);   // mu can exceed 1 by rounding: no negative pow base
  float litLimb = smoothstep(-0.25, 0.35, nl);
  col += rim * litLimb * (vec3(0.30, 0.42, 0.62) * 0.35 + vec3(1.0, 0.78, 0.5) * 0.12 * hg(dot(rd, L), 0.6)) * sunI;
  return col;
}
vec3 shadeMoon(vec3 p, vec3 n, vec3 rd) {
  vec3 m = (p - moonP) / moonR;
  float cr = fbm3(m * 3.0 + 7.0);
  vec3 alb = vec3(0.78, 0.78, 0.80) * (0.75 + 0.35 * cr) * (1.0 - 0.25 * smoothstep(0.55, 0.62, n3(m * 6.0)));
  float diff = max(dot(n, L), 0.0);
  float sh = softShadow(p + n * 0.003, 20.0);              // the planet can eclipse the moon
  return alb * diff * sh * sunI * 1.1;
}

// ---------------------------------------------------------------- the ring: single scattering in a thin slab
vec3 shadeRing(vec3 q, float r, vec4 rs, vec3 rd, out float T) {
  float tau = rs.x;
  float mu = max(abs(rd.y), 0.012), mu0 = max(abs(L.y), 0.02);
  T = exp(-tau / mu);
  float c = dot(L, rd);                                   // cosine of the scattering angle
  float P = mix(hg(c, -0.32), 0.25 * hg(c, 0.55) + 0.75 * hg(c, 0.82), rs.w);
  float I;
  if (L.y * -rd.y > 0.0) I = mu0 / (mu0 + mu) * (1.0 - exp(-tau * (1.0 / mu0 + 1.0 / mu)));          // reflected
  else {                                                                                                // diffusely transmitted
    float dm = mu0 - mu;
    I = abs(dm) > 1e-3 ? mu0 * (exp(-tau / mu0) - exp(-tau / mu)) / dm : tau / mu0 * exp(-tau / mu0);
  }
  float S = softShadow(q + vec3(0.0, sign(L.y) * 0.002, 0.0), 26.0);
  vec3 tint = rs.y * mix(vec3(0.60, 0.61, 0.66), vec3(1.0, 0.85, 0.64), rs.z);
  tint = mix(tint, rs.y * vec3(0.50, 0.66, 1.0), smoothstep(2.5, 3.1, r));      // fine dust of the G and E rings scatters blue
  return tint * (0.55 * P / 4.0) * I * S * sunI * 2.4;
}

// ---------------------------------------------------------------- sky
vec3 starLayer(vec2 p, float scale, float keep, float seed, float pix) {
  vec2 g = p * scale, id = floor(g), f = fract(g) - 0.5;
  float h = h21(id + seed);
  if (h > keep) return vec3(0.0);
  vec2 off = (vec2(h21(id + seed + 1.7), h21(id + seed + 4.3)) - 0.5) * 0.7;
  float dpx = length(f - off) / scale / pix;
  float m = h / keep;
  float b = pow(1.0 - m, 7.0) * 3.0 + 0.15;
  vec3 col = mix(vec3(0.72, 0.82, 1.0), vec3(1.0, 0.86, 0.70), h21(id + 2.0));
  return col * b * (exp(-dpx * dpx / 0.8) + 0.05 * exp(-dpx / 2.0));
}
vec3 sky(vec3 rd, float pix) {
  vec2 p = vec2(atan(rd.x, rd.z), asin(clamp(rd.y, -1.0, 1.0)));
  vec3 s = starLayer(p, 160.0, 0.30, 1.0, pix) + starLayer(p, 360.0, 0.22, 7.0, pix) * 0.5 + starLayer(p, 55.0, 0.10, 13.0, pix) * 1.2;
  vec3 c = s * 0.05;
  // a faint, dusty band of the galaxy far behind
  float bd = dot(rd, normalize(vec3(0.35, 0.9, -0.25))) / 0.28;
  float band = exp(-bd * bd);   // x·x, not pow(x, 2.0): pow of a negative base is NaN on real GPUs
  float neb = fbm3(rd * 5.0 + 3.0);
  c += vec3(0.010, 0.009, 0.016) * band * smoothstep(0.45, 0.85, neb) + vec3(0.003, 0.0035, 0.006) * band;
  return c;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  float pix = 1.0 / focal;
  vec3 rd = normalize(camF * focal + camR * (px.x - ctr.x) + camU * (px.y - ctr.y));
  vec3 ro = camPos;

  // ring plane — computed for every pixel so screen derivatives exist for the texture filter
  float tR = -ro.y / rd.y;
  vec3 q = ro + rd * tR;
  float r = length(q.xz);
  vec4 rs = ringAt(r, 0.0);
  bool ringHit = tR > 0.0 && r > R0 && r < R1;

  // sphere-trace the planet and moon (start at the bounding sphere)
  float tHit = 1e9, cover = 0.0;
  float b = dot(ro, rd), cc = dot(ro, ro) - 1.06;
  float disc = b * b - cc;
  vec3 mo = ro - moonP;
  float bm = dot(mo, rd), dm = bm * bm - (dot(mo, mo) - moonR * moonR * 1.2);
  float s0 = 1e9;
  if (disc > 0.0) s0 = max(-b - sqrt(disc), 0.0);
  if (dm > 0.0) s0 = min(s0, max(-bm - sqrt(dm), 0.0));
  if (s0 < 1e8) {
    float s = s0, minR = 1e9, sMin = s0;
    for (int i = 0; i < 72; i++) {
      float h = map(ro + rd * s);
      if (h / s < minR) { minR = h / s; sMin = s; }
      if (h < 0.0003 * s) { tHit = s; break; }
      s += h * 0.95;
      if (s > 40.0) break;
    }
    // anti-aliased limb: a near miss (within ~1 px) still covers part of the pixel, shaded at the closest point
    cover = tHit < 1e8 ? 1.0 : clamp(1.0 - minR / (pix * 1.2), 0.0, 1.0);
    if (tHit > 1e8 && cover > 0.0) tHit = sMin;
  }

  vec3 col = sky(rd, pix);
  // atmosphere halo just outside the limb (in the planet's scaled space)
  vec3 ro2 = ro / PR, rd2 = normalize(rd / PR);
  float tc = max(-dot(ro2, rd2), 0.0);
  vec3 pc = ro2 + rd2 * tc;
  float bb = length(pc);
  if (bb > 1.0) {
    vec3 nc = pc / bb;
    float haze = exp(-(bb - 1.0) / 0.016) + 0.25 * exp(-(bb - 1.0) / 0.07);
    float lit = smoothstep(-0.3, 0.35, dot(nc, L));
    col += haze * (vec3(0.25, 0.38, 0.62) * 0.35 * lit + vec3(1.0, 0.72, 0.42) * 0.07 * hg(dot(rd, L), 0.8) * smoothstep(-0.6, 0.05, dot(nc, L))) * sunI;
  }
  if (cover > 0.0) {
    vec3 p = ro + rd * tHit;
    vec3 n = normalAt(p);
    vec3 sc = sdMoon(p) < sdPlanet(p) ? shadeMoon(p, n, rd) : shadePlanet(p, n, rd);
    col = mix(col, sc, cover);
  }
  // the sun's disk and its near glow live in the sky — the rings in front dim them by their transmittance
  float ang = acos(clamp(dot(rd, L), -1.0, 1.0));
  if (cover < 1.0) col += vec3(1.0, 0.94, 0.84) * sunVis * (40.0 * exp(-ang * ang / 1.2e-5) + 0.7 * exp(-ang * 45.0)) * (1.0 - cover);
  if (ringHit && (tR < tHit || cover < 1.0)) {
    float T;
    vec3 rc = shadeRing(q, r, rs, rd, T);
    float inFront = tR < tHit ? 1.0 : 1.0 - cover;
    col = mix(col, rc + T * col, inFront);
  }
  // lens: wide glare while the sun is out, a starburst at the limb as it slips behind the planet
  vec2 v = vec2(dot(rd - L, camR), dot(rd - L, camU));            // angular offset from the sun on the image plane
  float spikes = 0.0;
  for (int i = 0; i < 3; i++) {                                     // three thin diffraction lines, constant pixel width
    float th = 0.5 + float(i) * 1.0472;
    vec2 k = vec2(cos(th), sin(th));
    float perp = abs(v.x * k.y - v.y * k.x), along = abs(dot(v, k));
    spikes += exp(-perp / (pix * 1.1)) * exp(-along * (i == 0 ? 9.0 : 16.0));
  }
  col += vec3(1.0, 0.92, 0.80) * (sunVis * (0.035 * exp(-ang * 8.0) + 0.12 * exp(-ang * 30.0))
                                  + flare * (0.9 * spikes + 1.6 * exp(-ang * 80.0) + 0.05 * exp(-ang * 12.0)));

  // tone map (filmic), grade, vignette, grain
  col *= 1.35;
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
  vec2 uv = px / stage - 0.5;
  col *= 1.0 - 0.45 * pow(length(uv * vec2(1.1, 0.85)), 2.4);
  col *= fade;
  col += (h21(px + frameNo * 7.13) - 0.5) / 255.0 * 1.5;
  o = vec4(col, 1.0);
}`;

const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

// ---------------------------------------------------------------- the ring profile, baked once
function ringProfile() {
  const hash = (i) => { let h = Math.imul(i | 0, 374761393) ^ 0x68e31da4; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const noise = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) + (hash(i + 1) - hash(i)) * u; };
  const fbm = (x) => 0.5 * noise(x) + 0.25 * noise(x * 2.3 + 7) + 0.125 * noise(x * 5.1 + 3) + 0.125 * noise(x * 11.7 + 1);
  const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  const band = (r, a, b, e = 0.0015) => sm(a - e, a + e, r) * (1 - sm(b - e, b + e, r));
  const data = new Float32Array(RING_N * 4);
  for (let i = 0; i < RING_N; i++) {
    const r = R0 + (R1 - R0) * (i + 0.5) / RING_N;
    let tau = 0, alb = 0.9, warm = 0.5, dust = 0.1;
    // D ring (faint dust)
    tau += 0.004 * band(r, 1.11, 1.236, 0.01) * (0.5 + noise(r * 300));
    // C ring: thin, grey, with plateaus and two gaps
    const C = band(r, 1.239, 1.527, 0.002);
    let tc = 0.07 + 0.06 * fbm(r * 160) + 0.25 * band(r, 1.44, 1.49, 0.003) + 0.18 * band(r, 1.35, 1.37, 0.002);
    tc *= 1 - band(r, 1.288, 1.292, 0.0005) - band(r, 1.449, 1.455, 0.0006);
    // B ring: dense, warm, with ringlets on many scales
    const B = band(r, 1.527, 1.951, 0.0012);
    const tb = 1.1 + 1.3 * sm(1.56, 1.66, r) + 0.6 * (fbm(r * 90) - 0.5) + 0.35 * (fbm(r * 420) - 0.5) - 0.5 * sm(1.90, 1.951, r);
    // Cassini division (with the Huygens gap) and the A ring with the Encke and Keeler gaps
    const CD = band(r, 1.951, 2.025, 0.0012);
    const tcd = (0.10 + 0.08 * fbm(r * 300)) * (1 - band(r, 1.951, 1.958, 0.0006));
    const A = band(r, 2.025, 2.267, 0.0010);
    const ta = (0.55 + 0.18 * (fbm(r * 140) - 0.5) + 0.12 * Math.sin(r * 2400) * sm(2.18, 2.26, r)) * (1 - band(r, 2.2105, 2.2165, 0.0005)) * (1 - band(r, 2.2635, 2.2655, 0.0003));
    // F ring (narrow, dusty) and the faint G ring
    const F = Math.exp(-Math.pow((r - 2.326) / 0.0025, 2));
    const G = band(r, 2.72, 2.90, 0.04);
    const E = Math.exp(-Math.pow((r - 3.95) / 0.45, 2)) * sm(3.0, 3.5, r);
    tau += C * tc + B * tb + CD * tcd + A * ta + 0.35 * F + 0.0012 * G + 0.00022 * E;
    alb = 0.62 * C + 1.0 * B + 0.55 * CD + 0.86 * A + 0.9 * F + 0.8 * G + 0.8 * band(r, 1.11, 1.236, 0.01);
    alb *= 0.9 + 0.2 * fbm(r * 230);
    warm = 0.25 * C + 0.8 * B + 0.15 * CD + 0.55 * A + 0.3 * F + 0.2 * G;
    dust = 0.85 * band(r, 1.11, 1.236, 0.01) + 0.35 * C + 0.06 * B + 0.4 * CD + 0.12 * A + 0.95 * F + 1.0 * G + 1.0 * E;
    alb += 0.8 * E;
    data.set([tau, alb, warm, Math.min(1, dust)], i * 4);
  }
  return data;
}

// ---------------------------------------------------------------- timeline
const D = 9.5;
const fade = track([[0, 0], [1.0, 1, ease.outCubic], [9.0, 1], [D, 0, ease.inCubic]]);
// the camera starts just below the ring plane (lit face, nearly edge-on), crosses it, and rises to +18°
// exactly opposite the sun, which sits 18° below the plane — so the planet eclipses the sun at the climax
const elev = track([[0, -2.6], [0.4, -2.4], [7.3, 17.3, ease.inOutCubic], [D, 18.4, ease.outCubic]]);
const azim = track([[0, 50], [0.4, 53], [7.3, 178, ease.inOutCubic], [D, 181, ease.outCubic]]);
const dist = track([[0, 11.0], [D, 9.0, ease.inOutCubic]]);
const roll = track([[0, -19], [D, -24, ease.inOutCubic]]);
const SUN = ((b) => [0, Math.sin(b), Math.cos(b)])(-18 * Math.PI / 180);

defineDemo({
  id: '07-sdf-planet',
  title: '고리를 두른 행성',
  tech: 'SDF 레이마칭 · 셰이더 하나로 만든 3D',
  duration: D,
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(prog, 0, 'p');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const U = {};
    for (const n of ['stage', 'ctr', 'focal', 't', 'rot', 'sunI', 'sunVis', 'flare', 'frameNo', 'fade', 'camPos', 'camF', 'camR', 'camU', 'L', 'moonP', 'moonR', 'ringTex']) U[n] = gl.getUniformLocation(prog, n);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // bake the ring profile into a mipmapped float texture (mips = correct averaging when ringlets get sub-pixel)
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.getExtension('EXT_color_buffer_float');        // makes RGBA16F renderable → generateMipmap is allowed
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, RING_N, 1, 0, gl.RGBA, gl.FLOAT, ringProfile());
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U.ringTex, 0);

    const focal = 960 / Math.tan((40 / 2) * Math.PI / 180);
    gl.uniform2f(U.stage, W, H);
    gl.uniform2f(U.ctr, W / 2 + 20, H - 830);     // the planet's centre sits 830 px from the top
    gl.uniform1f(U.focal, focal);
    gl.uniform3fv(U.L, SUN);
    gl.viewport(0, 0, W, H);
    const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

    this.draw = (t) => {
      const e = elev(t) * Math.PI / 180, a = azim(t) * Math.PI / 180, d = dist(t), rl = roll(t) * Math.PI / 180;
      const pos = [d * Math.cos(e) * Math.sin(a), d * Math.sin(e), d * Math.cos(e) * Math.cos(a)];
      const F = norm(pos.map((x) => -x));
      let R = norm(cross(F, [0, 1, 0]));
      let Up = cross(R, F);
      // roll the frame so the ring plane runs diagonally across the portrait
      const c = Math.cos(rl), s = Math.sin(rl);
      [R, Up] = [R.map((x, i) => c * x + s * Up[i]), Up.map((x, i) => -s * R[i] + c * x)];
      gl.uniform3fv(U.camPos, pos);
      gl.uniform3fv(U.camF, F); gl.uniform3fv(U.camR, R); gl.uniform3fv(U.camU, Up);
      gl.uniform1f(U.t, t);
      gl.uniform1f(U.rot, 0.16 * t);
      gl.uniform1f(U.sunI, 1.0);
      // how much of the sun clears the limb: impact parameter of the camera→sun ray in the planet's scaled space
      const p2 = [pos[0], pos[1] / 0.9, pos[2]], l0 = [SUN[0], SUN[1] / 0.9, SUN[2]], ll = Math.hypot(...l0), l2 = l0.map((x) => x / ll);
      const pl = p2[0] * l2[0] + p2[1] * l2[1] + p2[2] * l2[2];
      const imp = pl < 0 ? Math.hypot(...p2.map((x, i) => x - pl * l2[i])) : 99;
      const vis = Math.min(1, Math.max(0, (imp - 0.995) / 0.03));
      gl.uniform1f(U.sunVis, vis * vis * (3 - 2 * vis));
      gl.uniform1f(U.flare, Math.exp(-Math.pow((imp - 1.0) / 0.13, 2)) * (imp < 1 ? 1 : 0.6));
      gl.uniform1f(U.frameNo, Math.round(t * 30));
      gl.uniform1f(U.fade, fade(t));
      // the moon on an inclined orbit, timed to cross in front of the planet
      const th = 0.95 - 0.30 * t, inc = 7 * Math.PI / 180, mr = 3.3;
      gl.uniform3f(U.moonP, mr * Math.cos(th), mr * Math.sin(th) * Math.sin(inc), mr * Math.sin(th) * Math.cos(inc));
      gl.uniform1f(U.moonR, 0.085);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  },
  frame(t) { this.draw(t); },
});
