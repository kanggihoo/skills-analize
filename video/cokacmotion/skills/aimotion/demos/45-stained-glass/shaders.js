/*
 * 45-stained-glass/shaders.js — GLSL for the chapel.
 *   COMMON  window geometry, noise, the tree's moving shadow on the window, the glass itself (glassT)
 *   BAKE    (setup) the window's transmission map TX: glass colour × Beer–Lambert thickness × streaks × seeds
 *           × grisaille × waviness caustics, lead/stone = 0. Mip-mapped: the floor and the shafts read it blurred.
 *   VOL     (half res) single-scattering light shafts: march the view ray through the oblique light cylinder
 *           behind the window, project every sample back onto the glass along the sun direction
 *   SCENE   floor (projected window + gloss), wall, splayed reveal, and the window seen from inside
 *   MOTES   dust flakes as points that light up only inside the coloured beam
 *   bloom (prefilter / down / up) and the final tone map
 */
export const COMMON = `
const vec3 WC = vec3(0.0, 6.2, -0.5);   // window centre on the glass plane (m)
const float WR = 3.4;                   // window radius (m) = 1 window unit
const float REV = 0.45;                 // the reveal widens by this much from the glass (z=-0.5) to the wall face (z=0)
const float EXT = 1.02;
const float PI = 3.14159265;
uniform float uTime, uEdge, uWind;

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash13(vec3 p3) { p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s / 0.9375; }
float noise3(vec3 p) {
  vec3 i = floor(p), f = fract(p); vec3 u = f * f * (3.0 - 2.0 * f);
  float a = mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), u.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), u.x), u.y);
  float b = mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), u.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), u.x), u.y);
  return mix(a, b, u.z);
}
// window units → texture uv (row 0 of the textures is the top of the window)
vec2 wuv(vec2 q) { return vec2(q.x, -q.y) / (2.0 * EXT) + 0.5; }

// the crown of a tree across the street: as the sun climbs, the lower edge of its shadow sweeps down the window.
// Leafy gaps let light through in patches near the edge; the crown sways a little (uWind is a function of t).
float sunMask(vec2 q) {
  float edge = uEdge + 0.16 * (fbm(vec2(q.x * 1.7 + 4.0, 2.3)) - 0.5);
  float leaf = fbm(q * 6.5 + vec2(uWind, 0.3 * uWind));
  return smoothstep(-0.035, 0.035, q.y - edge + 0.34 * (leaf - 0.5));
}

// dust phase function: two Henyey–Greenstein lobes (strong forward + mild), normalised so isotropic = 1
float phase(float c) {
  float a = (1.0 - 0.5625) / pow(max(1.5625 - 1.5 * c, 1e-3), 1.5);
  float b = (1.0 - 0.0625) / pow(max(1.0625 - 0.5 * c, 1e-3), 1.5);
  return 0.35 * a + 0.65 * b;
}

// seeds (bubbles) in hand-blown glass, stretched along the direction the sheet was drawn
vec2 bubbles(vec2 q, vec2 dir) {
  vec2 g = q * 40.0, base = floor(g), acc = vec2(0.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = base + vec2(i, j);
    if (hash12(id + 17.0) > 0.3) continue;
    vec2 c = id + 0.5 + (hash22(id) - 0.5) * 0.9;
    float h = hash12(id + 5.3);
    float r = 0.05 + 0.24 * h * h * h;
    vec2 d = g - c;
    d = vec2(dot(d, dir) * 0.42, dot(d, vec2(-dir.y, dir.x)));
    float x = length(d) / r;
    acc.x += smoothstep(0.8, 0.15, x);
    acc.y += smoothstep(0.5, 0.85, x) * smoothstep(1.2, 0.9, x);
  }
  return min(acc, vec2(1.0));
}
// slight undulation of the glass surface (each piece is its own sheet)
float wave(vec2 q, float seed) { return 0.6 * noise(q * 16.0 + seed * 5.77) + 0.4 * noise(q * 37.0 - seed * 3.1); }
vec2 waveGrad(vec2 q, float seed) {
  float e = 0.004, c = wave(q, seed);
  return vec2(wave(q + vec2(e, 0.0), seed) - c, wave(q + vec2(0.0, e), seed) - c) / e;
}
// transmission of the glass at q (linear RGB): piece colour as transmittance per unit thickness, raised to the
// local thickness (Beer–Lambert); thickness = sheet thickness + streaks along the draw + cloudiness + grozed edge.
// Flashed ruby (a thin red layer on clear glass) streaks much more. Then seeds, grisaille, and lead/stone = 0.
vec3 glassT(vec2 q, vec3 col, vec4 b, float seed) {
  vec3 base = pow(max(col, vec3(0.0)), vec3(2.2));
  float ang = hash11(seed * 1.37 + 0.5) * PI;
  vec2 dir = vec2(cos(ang), sin(ang));
  vec2 sq = vec2(dot(q, dir), dot(q, vec2(-dir.y, dir.x)));
  float streak = 0.6 * noise(vec2(sq.x * 7.0, sq.y * 110.0) + seed * 7.13) + 0.4 * noise(vec2(sq.x * 2.5, sq.y * 38.0) + seed * 3.31);
  float cloud = fbm(q * 7.0 + seed * 1.7);
  float ruby = smoothstep(0.25, 0.5, base.r) * (1.0 - smoothstep(0.03, 0.12, base.g));
  float thick = 0.78 + 0.45 * hash11(seed * 2.11 + 3.7) + (0.5 + 1.1 * ruby) * (streak - 0.5) + 0.45 * (cloud - 0.5);
  thick += 0.75 * b.b;
  vec3 T = pow(max(base, vec3(1e-4)), vec3(max(thick, 0.22)));
  vec2 bb = bubbles(q, dir);
  T *= (1.0 + 0.7 * bb.x) * (1.0 - 0.65 * bb.y);
  T *= 1.0 - 0.95 * clamp(b.a, 0.0, 1.0);
  float opq = max(smoothstep(0.03, 0.25, b.r), smoothstep(0.02, 0.25, b.g));
  return T * (1.0 - opq);
}
`;

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
`;

// ------------------------------------------------------------------ setup: transmission map
export const BAKE = HEAD + COMMON + `
uniform sampler2D uT0, uT1;
in vec2 vUv;
out vec4 o;
void main() {
  vec3 acc = vec3(0.0);
  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) {
    vec2 uv = vUv + (vec2(float(i), float(j)) - 0.5) * (0.5 / 1024.0);
    vec2 q = vec2(uv.x - 0.5, 0.5 - uv.y) * 2.0 * EXT;
    vec4 a = textureLod(uT0, uv, 0.0), b = textureLod(uT1, uv, 0.0);
    float seed = texelFetch(uT0, ivec2(clamp(uv, 0.0, 0.9999) * 2048.0), 0).a * 255.0;
    vec3 T = glassT(q, a.rgb, b, seed);
    // the wavy sheet focuses and spreads the light a little (caustic ripples in the projection)
    float e = 0.006, c = wave(q, seed);
    float lap = (wave(q + vec2(e, 0.0), seed) + wave(q - vec2(e, 0.0), seed) + wave(q + vec2(0.0, e), seed) + wave(q - vec2(0.0, e), seed) - 4.0 * c) / (e * e);
    T *= clamp(1.0 - 0.0005 * lap, 0.6, 1.5);
    acc += T;
  }
  vec2 qc = vec2(vUv.x - 0.5, 0.5 - vUv.y) * 2.0 * EXT;
  acc *= 0.25 * step(length(qc), 0.95);
  o = vec4(sqrt(acc), 1.0);
}`;

// ------------------------------------------------------------------ volumetric shafts (half resolution)
export const VOL = HEAD + COMMON + `
uniform sampler2D uTX;
uniform vec2 uRes;
uniform vec3 uCamPos, uSunD, uSunC;
uniform mat3 uCamRot;
uniform float uFocal, uDust, uFrame;
out vec4 o;
float dust(vec3 X) {
  vec3 p = X * 0.55 + vec3(0.04, 0.012, -0.02) * uTime;
  float d = 0.55 * noise3(p) + 0.3 * noise3(p * 2.27 + 11.3) + 0.15 * noise3(p * 5.1 - vec3(0.0, uTime * 0.06, 0.0));
  return 0.3 + 1.4 * smoothstep(0.38, 0.8, d);
}
void main() {
  vec2 fc = gl_FragCoord.xy;
  vec3 rd = normalize(uCamRot * vec3((fc - 0.5 * uRes) / uFocal, -1.0));
  vec3 ro = uCamPos;
  // where the view ray ends: floor, the wall face, or (through the opening) the glass
  float tEnd = 60.0;
  if (rd.y < 0.0) tEnd = min(tEnd, -ro.y / rd.y);
  if (rd.z < 0.0) {
    float tW = -ro.z / rd.z;
    vec3 Wp = ro + rd * tW;
    tEnd = min(tEnd, length(Wp.xy - WC.xy) > WR + REV ? tW : (WC.z - ro.z) / rd.z);
  }
  // the lit volume is the oblique cylinder of points whose sun-ward ray crosses the window disc:
  // Q(t) = Q0 + Q1·t is the window point behind the ray at t, so |Q(t)| < 1 is a quadratic interval
  vec2 Q0 = (ro.xy - uSunD.xy * (ro.z - WC.z) / uSunD.z - WC.xy) / WR;
  vec2 Q1 = (rd.xy - uSunD.xy * rd.z / uSunD.z) / WR;
  float a = dot(Q1, Q1), b = dot(Q0, Q1), c = dot(Q0, Q0) - 1.0;
  float t0 = 0.0, t1 = tEnd;
  if (a > 1e-9) {
    float disc = b * b - a * c;
    if (disc <= 0.0) { o = vec4(0.0, 0.0, 0.0, 1.0); return; }
    float s = sqrt(disc);
    t0 = max(t0, (-b - s) / a); t1 = min(t1, (-b + s) / a);
  } else if (c > 0.0) { o = vec4(0.0, 0.0, 0.0, 1.0); return; }
  if (t1 <= t0) { o = vec4(0.0, 0.0, 0.0, 1.0); return; }
  const int N = 44;
  float dt = (t1 - t0) / float(N);
  float j = fract(52.9829189 * fract(dot(fc, vec2(0.06711056, 0.00583715))) + uFrame * 0.6180339);
  vec3 acc = vec3(0.0);
  for (int i = 0; i < N; i++) {
    float t = t0 + (float(i) + j) * dt;
    vec3 X = ro + rd * t;
    float lam = (X.z - WC.z) / uSunD.z;
    if (lam < 0.0) continue;
    if (X.z > 0.0 && length(X.xy - uSunD.xy * (X.z / uSunD.z) - WC.xy) > WR + REV) continue;   // clipped by the reveal
    vec2 Q = Q0 + Q1 * t;
    // farther from the glass the coloured pattern blurs: the sun is a disc, not a point
    float lod = clamp(log2((0.01 + lam * 0.014) / WR / 0.002), 0.0, 7.0);
    vec3 T = textureLod(uTX, wuv(Q), lod).rgb;
    acc += T * T * (sunMask(Q) * dust(X));
  }
  acc *= dt * uDust * phase(dot(uSunD, -rd));
  o = vec4(acc * uSunC, 1.0);
}`;

// ------------------------------------------------------------------ the scene
export const SCENE = HEAD + COMMON + `
uniform sampler2D uT0, uT1, uTX, uVol;
uniform vec2 uRes, uVolRes;
uniform vec3 uCamPos, uSunD, uSunC, uSkyZ, uSkyH, uAmbC;
uniform mat3 uCamRot;
uniform float uFocal, uLit;
in vec2 vUv;
out vec4 o;

vec3 sq3(vec3 c) { return c * c; }
// what is outside: dawn sky, a band of thin cloud, and the dark crown of the tree across the street
vec3 outside(vec3 d) {
  float el = d.y;
  vec3 c = mix(uSkyH, uSkyZ, smoothstep(0.0, 0.7, el));
  vec2 sxz = -uSunD.xz;
  float az = max(dot(normalize(d.xz + vec2(1e-5)), normalize(sxz + vec2(1e-5))), 0.0);
  c += uSunC * 0.05 * pow(az, 8.0) * exp(-max(el, 0.0) * 5.0);
  vec2 cp = d.xz / max(el + 0.2, 0.05) * 1.2 + vec2(uTime * 0.03, 0.0);
  float cl = smoothstep(0.45, 0.85, fbm(cp));
  c = mix(c, uSkyH * 0.7 + uSunC * 0.06, cl * 0.5);
  float azim = atan(d.x, -d.z);
  float th = 0.18 + 0.09 * fbm(vec2(azim * 4.0, 1.3));
  float lv = noise(vec2(azim, el) * 70.0) - 0.5;
  float tree = smoothstep(th + 0.012, th - 0.012, el + 0.05 * lv);
  return mix(c, vec3(0.012, 0.016, 0.012) + uSunC * 0.006, tree);
}
// mean radiance the window throws into the room (whole-texture mip of TX = average transmission)
vec3 winRad() {
  vec3 m = textureLod(uTX, vec2(0.5), 11.0).rgb;
  return m * m * 1.35 * (0.5 * (uSkyZ + uSkyH) + uSunC * 0.4 * uLit);
}
vec3 stoneAlb(vec2 p) {
  float n = fbm(p * 3.0), m = noise(p * 23.0);
  vec3 c = vec3(0.50, 0.46, 0.40) * (0.78 + 0.35 * n) * (0.9 + 0.14 * m);
  return c * (1.0 - 0.28 * smoothstep(0.55, 0.8, fbm(p * 0.7 + 3.0)));
}
const vec3 ROOM_L = vec3(0.12, -0.5, 0.86);     // the room's light comes mostly from the lit floor in front

// ---- floor: worn limestone flags, the window projected on it, a soft gloss reflection of the window
vec3 floorShade(vec3 P, vec3 rd, float pw) {
  float rowL = 0.85;
  float row = floor(P.z / rowL);
  float L = 1.0 + 0.45 * hash11(row * 1.7 + 0.3);
  float off = hash11(row * 5.3 + 1.0) * L;
  float xx = (P.x + off) / L, ci = floor(xx);
  vec2 f = vec2(fract(xx) * L, fract(P.z / rowL) * rowL);
  float jd = min(min(f.x, L - f.x), min(f.y, rowL - f.y));
  float joint = 1.0 - smoothstep(0.004, 0.006 + pw * 1.5, jd);
  vec2 id = vec2(ci, row);
  float h = hash12(id);
  vec3 alb = vec3(0.60, 0.56, 0.50) * (0.8 + 0.32 * h);
  alb *= 0.8 + 0.32 * fbm(P.xz * 2.2 + id * 5.0);
  alb = mix(alb, alb * vec3(0.84, 0.8, 0.74), smoothstep(0.5, 0.8, fbm(P.xz * 0.8 + 9.0)));
  alb = mix(alb, vec3(0.13, 0.12, 0.11), joint * 0.85);
  // relief: each slab a little dished and pitted
  vec2 bp = P.xz * 7.0 + id * 3.0;
  float hb = noise(bp), e = 0.05;
  vec2 g = vec2(noise(bp + vec2(e, 0.0)) - hb, noise(bp + vec2(0.0, e)) - hb) / e;
  vec3 n = normalize(vec3(-g.x * 0.05, 1.0, -g.y * 0.05));

  // sunlight through the window: project the floor point back along the sun onto the glass,
  // and read the transmission blurred by the sun's disc (blur grows with the distance travelled)
  vec3 E = vec3(0.0);
  if (uSunD.y < -0.02) {
    float lam = (P.z - WC.z) / uSunD.z;
    vec2 Q = (P.xy - uSunD.xy * lam - WC.xy) / WR;
    vec2 Q0 = P.xy - uSunD.xy * (P.z / uSunD.z) - WC.xy;
    float open = smoothstep(WR + REV + 0.03, WR + REV - 0.06, length(Q0));
    if (dot(Q, Q) < 1.05 && open > 0.0) {
      float rb = (0.008 + lam * 0.0105) / WR;
      float lod = max(0.0, log2(rb / 0.002 * 0.75));
      vec3 s = sq3(textureLod(uTX, wuv(Q), lod).rgb) * 0.25;
      for (int i = 0; i < 6; i++) {
        float a = float(i) * 1.0472 + 0.3;
        s += sq3(textureLod(uTX, wuv(Q + rb * 0.75 * vec2(cos(a), sin(a))), lod).rgb) * 0.125;
      }
      E = uSunC * s * (sunMask(Q) * open * max(dot(n, -uSunD), 0.0));
    }
  }
  vec3 v = vec3(WC.x, WC.y, WC.z) - P;
  float d2 = dot(v, v);
  vec3 vn = v * inversesqrt(d2);
  float ff = WR * WR * max(vn.y, 0.0) * max(-vn.z, 0.0) / (d2 + WR * WR * 0.25);
  vec3 amb = uAmbC * (0.45 + 0.55 * smoothstep(0.0, 2.0, P.z)) * (0.6 + 0.4 * exp(-abs(P.x) * 0.15));
  vec3 col = alb * (E + winRad() * ff + amb);

  // the polished, worn stone mirrors the window softly
  vec3 rr = reflect(rd, n);
  if (rr.z < -0.01) {
    float tg = (WC.z - P.z) / rr.z;
    vec3 G = P + rr * tg;
    vec2 Qr = (G.xy - WC.xy) / WR;
    if (dot(Qr, Qr) < 1.0) {
      vec3 Tr = sq3(textureLod(uTX, wuv(Qr), 4.5).rgb);
      float ang = acos(clamp(dot(rr, -uSunD), -1.0, 1.0));
      vec3 Lr = Tr * (0.5 * (uSkyZ + uSkyH) + uSunC * sunMask(Qr) * (0.16 + 0.8 * exp(-ang * ang * 3.5)));
      float fres = 0.03 + 0.97 * pow(clamp(1.0 - dot(-rd, n), 0.0, 1.0), 5.0);
      float gloss = 0.35 + 0.65 * smoothstep(0.3, 0.7, fbm(P.xz * 0.6 + 2.0));
      col += Lr * fres * gloss * (1.0 - joint);
    }
  }
  return col;
}

// ---- the wall: a ring of voussoirs round the opening, a roll moulding, ashlar courses, a string course
vec3 wallShade(vec3 P, float pw) {
  vec2 d = P.xy - WC.xy;
  float r = length(d);
  vec3 n = vec3(0.0, 0.0, 1.0);
  vec3 alb;
  float joint = 0.0;
  float r0 = WR + REV, r1 = r0 + 0.62, r2 = r1 + 0.17;
  if (r < r1) {
    float a = atan(d.y, d.x);
    float seg = a / (2.0 * PI) * 36.0, fs = fract(seg);
    float jd = min(min(fs, 1.0 - fs) * (2.0 * PI / 36.0) * r, min(r - r0, r1 - r));
    joint = 1.0 - smoothstep(0.005, 0.007 + pw * 1.5, jd);
    alb = stoneAlb(vec2(a * r, r) + floor(seg) * 3.7) * (0.85 + 0.25 * hash11(floor(seg) + 40.0));
    float ch = 1.0 - smoothstep(0.0, 0.06, r - r0);       // chamfer into the reveal
    n = normalize(vec3(-normalize(d) * ch * 0.8, 1.0));
  } else if (r < r2) {
    float u = (r - r1) / (r2 - r1) * 2.0 - 1.0;
    n = normalize(vec3(normalize(d) * u * 0.9, sqrt(max(1.0 - u * u * 0.81, 0.0))));
    alb = stoneAlb(P.xy * 1.3) * 1.04;
  } else {
    float row = floor(P.y / 0.42);
    float yy = fract(P.y / 0.42) * 0.42;
    float L = 0.6 + 0.5 * hash11(row * 7.3);
    float off = hash11(row * 3.7) * L;
    float xx = (P.x + off) / L, ci = floor(xx), fx = fract(xx) * L;
    float jd = min(min(fx, L - fx), min(yy, 0.42 - yy));
    joint = 1.0 - smoothstep(0.005, 0.007 + pw * 1.5, jd);
    vec2 id = vec2(ci, row);
    alb = stoneAlb(P.xy + id * 3.1) * (0.82 + 0.28 * hash12(id));
    float bul = smoothstep(0.0, 0.04, jd);
    n = normalize(vec3(0.0, 0.0, 1.0) + vec3((fbm(P.xy * 4.0) - 0.5) * 0.4 * bul, (fbm(P.xy * 4.0 + 7.0) - 0.5) * 0.4 * bul, 0.0));
  }
  // string course under the window: a projecting roll
  float sc = (P.y - 2.18) / 0.11;
  if (abs(sc) < 1.0) { n = normalize(vec3(0.0, -sc * 0.9, sqrt(max(1.0 - sc * sc * 0.81, 0.0)))); alb = stoneAlb(P.xy * 1.5) * 1.05; joint = 0.0; }
  float dif = 0.3 + 0.7 * max(dot(n, normalize(ROOM_L)), 0.0);
  vec3 L = uAmbC * (0.8 + 2.2 * exp(-P.y * 0.45)) * dif;
  L += winRad() * 0.05 * exp(-max(r - r0, 0.0) * 1.2);
  L *= exp(-max(P.y - 9.0, 0.0) * 0.18) * exp(-abs(P.x) * 0.06);
  return alb * L * (1.0 - 0.85 * joint);
}

// ---- the splayed reveal of the opening
float coneHit(vec3 ro, vec3 rd) {
  float k = REV / 0.5;
  vec3 oo = ro - WC;
  float base = WR + k * oo.z;
  float A = rd.x * rd.x + rd.y * rd.y - k * k * rd.z * rd.z;
  float B = 2.0 * (oo.x * rd.x + oo.y * rd.y - k * base * rd.z);
  float C = oo.x * oo.x + oo.y * oo.y - base * base;
  float disc = B * B - 4.0 * A * C;
  if (disc < 0.0 || abs(A) < 1e-7) return -1.0;
  float s = sqrt(disc);
  float ta = (-B - s) / (2.0 * A), tb = (-B + s) / (2.0 * A);
  float za = ro.z + rd.z * ta, zb = ro.z + rd.z * tb;
  float tt = 1e9;
  if (ta > 0.0 && za >= WC.z && za <= 0.0) tt = min(tt, ta);
  if (tb > 0.0 && zb >= WC.z && zb <= 0.0) tt = min(tt, tb);
  return tt < 1e8 ? tt : -1.0;
}
vec3 revealShade(vec3 P) {
  vec2 rv = normalize(P.xy - WC.xy + vec2(1e-5));
  vec3 n = normalize(vec3(-rv, REV / 0.5));
  float depth = P.z - WC.z;
  float a = atan(rv.y, rv.x);
  float seg = fract(a / (2.0 * PI) * 40.0);
  float joint = smoothstep(0.04, 0.0, min(seg, 1.0 - seg));
  vec3 alb = stoneAlb(vec2(a * WR, P.z * 3.0)) * (1.0 - 0.7 * joint);
  vec3 edgeT = sq3(textureLod(uTX, wuv(rv * 0.9), 5.0).rgb) * 3.0;
  vec3 glow = edgeT * (0.5 * (uSkyZ + uSkyH) + uSunC * 0.3 * uLit) * exp(-depth * 6.0) + winRad() * 0.35 * exp(-depth * 2.0);
  vec3 amb = uAmbC * (0.35 + 0.65 * max(dot(n, normalize(ROOM_L)), 0.0));
  return alb * (glow + amb);
}

// ---- the window from inside: backlit glass, lead cames and stone tracery lit by the room
vec3 windowShade(vec2 q, vec2 uv, vec4 A, vec4 B, vec3 rd) {
  float seed = texelFetch(uT0, ivec2(clamp(uv, 0.0, 0.9999) * 2048.0), 0).a * 255.0;
  vec3 T = glassT(q, A.rgb, B, seed);
  // the uneven surface bends the view: sky, tree and sun behind the glass wobble and break up
  vec3 dOut = normalize(rd + vec3(waveGrad(q, seed) * 0.0045, 0.0));
  float ang = acos(clamp(dot(dOut, -uSunD), -1.0, 1.0));
  float lit = sunMask(q);
  // direct sun: diffused by the glass (wide haze lobe), aureole, and the sun's disc itself
  float sunT = lit * (0.3 + 1.0 * exp(-ang * ang * 3.5) + 1.6 * exp(-ang * ang * 90.0) + 45.0 * exp(-ang * ang * 4000.0));
  vec3 Lg = T * (outside(dOut) + uSunC * sunT);

  // came and tracery: normals from the height maps
  float tx = 1.0 / 2048.0, dq = 2.0 * EXT / 2048.0;
  vec4 bl = textureLod(uT1, uv - vec2(tx, 0.0), 0.0), br = textureLod(uT1, uv + vec2(tx, 0.0), 0.0);
  vec4 bu = textureLod(uT1, uv - vec2(0.0, tx), 0.0), bd = textureLod(uT1, uv + vec2(0.0, tx), 0.0);
  vec2 gL = vec2(br.r - bl.r, bu.r - bd.r) / (2.0 * dq);
  vec2 gS = vec2(br.g - bl.g, bu.g - bd.g) / (2.0 * dq);
  vec3 Ld = normalize(ROOM_L), V = -rd;
  vec3 roomL = uAmbC * 7.0;
  vec3 near = sq3(textureLod(uTX, uv, 2.5).rgb) * (0.5 * (uSkyZ + uSkyH) + uSunC * (0.16 + 0.5 * exp(-ang * ang * 3.5)) * lit);
  // lead: dull grey metal with a soft sheen along the rounded top
  vec3 nl = normalize(vec3(-gL * 0.0045, 1.0));
  float dl = max(dot(nl, Ld), 0.0);
  float sl = pow(max(dot(nl, normalize(Ld + V)), 0.0), 28.0);
  vec3 leadC = roomL * (0.05 * dl + 0.015) + roomL * 0.5 * sl + near * 0.22 * (1.0 - B.r);
  // stone tracery: chamfered, catching coloured light from the glass beside it
  vec3 ns = normalize(vec3(-gS * 0.012, 1.0));
  vec3 sa = stoneAlb(q * WR * 1.4);
  vec3 stoneC = sa * (roomL * (0.12 + 0.3 * max(dot(ns, Ld), 0.0)) + near * 0.8 * (1.0 - B.g));
  float lead = smoothstep(0.03, 0.25, B.r), st = smoothstep(0.02, 0.25, B.g);
  return Lg + mix(leadC, stoneC, st) * max(lead, st);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec3 rd = normalize(uCamRot * vec3((fc - 0.5 * uRes) / uFocal, -1.0));
  vec3 ro = uCamPos;
  // the glass-plane hit is computed for every pixel so the texture derivatives stay continuous
  float tG = (WC.z - ro.z) / min(rd.z, -1e-4);
  vec3 G = ro + rd * tG;
  vec2 q = (G.xy - WC.xy) / WR;
  vec2 uv = wuv(q);
  vec4 A = texture(uT0, uv);
  vec4 B = texture(uT1, uv);

  float tF = rd.y < 0.0 ? -ro.y / rd.y : 1e9;
  float tW = -ro.z / min(rd.z, -1e-4);
  vec3 Wp = ro + rd * tW;
  float rW = length(Wp.xy - WC.xy);
  vec3 col;
  if (tF < tW) {
    vec3 P = ro + rd * tF;
    col = floorShade(P, rd, tF / uFocal / max(-rd.y, 0.03));
  } else if (rW > WR + REV) {
    col = wallShade(Wp, tW / uFocal);
  } else {
    float tc = coneHit(ro, rd);
    if (tc > 0.0 && tc < tG) col = revealShade(ro + rd * tc);
    else if (dot(q, q) < 1.0) col = windowShade(q, uv, A, B, rd);
    else col = revealShade(G);
  }
  // shafts, upsampled from half resolution with a small tent
  vec2 vt = 1.0 / uVolRes;
  vec3 vol = texture(uVol, vUv).rgb * 0.36;
  vol += (texture(uVol, vUv + vec2(vt.x, 0.0)).rgb + texture(uVol, vUv - vec2(vt.x, 0.0)).rgb
        + texture(uVol, vUv + vec2(0.0, vt.y)).rgb + texture(uVol, vUv - vec2(0.0, vt.y)).rgb) * 0.16;
  col += vol;
  o = vec4(max(col, vec3(0.0)), 1.0);
}`;

// ------------------------------------------------------------------ dust motes
export const MOTE_VS = `#version 300 es
precision highp float;
precision highp sampler2D;
` + COMMON + `
layout(location = 0) in vec4 aM;
uniform sampler2D uTX;
uniform vec2 uRes;
uniform vec3 uCamPos, uSunD, uSunC;
uniform mat3 uCamRot;
uniform float uFocal, uMote;
out vec3 vCol;
void main() {
  float s = aM.w;
  vec3 P = aM.xyz;
  P += 0.2 * vec3(sin(uTime * (0.21 + 0.1 * fract(s * 7.1)) + s * 13.0),
                  sin(uTime * (0.17 + 0.08 * fract(s * 3.3)) + s * 5.0),
                  sin(uTime * (0.19 + 0.1 * fract(s * 9.7)) + s * 2.0));
  P.y -= 0.04 * uTime * fract(s * 1.7);
  vec3 v = transpose(uCamRot) * (P - uCamPos);
  vCol = vec3(0.0);
  if (v.z > -0.4) { gl_Position = vec4(3.0, 3.0, 0.0, 1.0); gl_PointSize = 1.0; return; }
  vec2 sp = v.xy / -v.z * uFocal;
  gl_Position = vec4(sp / (0.5 * uRes), 0.0, 1.0);
  gl_PointSize = clamp(0.012 * uFocal / -v.z, 1.5, 7.0);
  float lam = (P.z - WC.z) / uSunD.z;
  vec2 Q = (P.xy - uSunD.xy * lam - WC.xy) / WR;
  if (dot(Q, Q) < 1.0 && lam > 0.0) {
    vec3 T = textureLod(uTX, wuv(Q), 2.0).rgb;
    float tw = 0.25 + 0.75 * pow(max(0.5 + 0.5 * sin(uTime * (2.0 + 3.0 * fract(s * 5.3)) + s * 31.0), 0.0), 6.0);
    vCol = uSunC * T * T * (sunMask(Q) * tw * phase(dot(uSunD, normalize(uCamPos - P))) * uMote);
  }
}`;
export const MOTE_FS = HEAD + `
in vec3 vCol;
out vec4 o;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float a = exp(-dot(d, d) * 14.0);
  o = vec4(vCol * a, 1.0);
}`;

// ------------------------------------------------------------------ bloom + tone map
export const PREFILTER = HEAD + `
uniform sampler2D uSrc;
uniform vec2 uTexel;
uniform float uExpo, uThr;
in vec2 vUv;
out vec4 o;
void main() {
  vec3 c = (texture(uSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb + texture(uSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb
          + texture(uSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb + texture(uSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb) * 0.25 * uExpo;
  float br = max(c.r, max(c.g, c.b));
  float knee = 0.6;
  float s = clamp(br - uThr + knee, 0.0, 2.0 * knee);
  s = s * s / (4.0 * knee);
  o = vec4(c * (max(s, br - uThr) / max(br, 1e-4)), 1.0);
}`;
export const DOWN = HEAD + `
uniform sampler2D uSrc;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 o;
void main() {
  vec3 c = texture(uSrc, vUv).rgb * 4.0;
  c += texture(uSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb + texture(uSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb;
  c += texture(uSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb + texture(uSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  o = vec4(c / 8.0, 1.0);
}`;
export const UP = HEAD + `
uniform sampler2D uSrc;
uniform vec2 uTexel;
uniform float uK;
in vec2 vUv;
out vec4 o;
void main() {
  vec3 c = texture(uSrc, vUv).rgb * 4.0;
  c += (texture(uSrc, vUv + vec2(uTexel.x, 0.0)).rgb + texture(uSrc, vUv - vec2(uTexel.x, 0.0)).rgb
      + texture(uSrc, vUv + vec2(0.0, uTexel.y)).rgb + texture(uSrc, vUv - vec2(0.0, uTexel.y)).rgb) * 2.0;
  c += texture(uSrc, vUv + uTexel).rgb + texture(uSrc, vUv - uTexel).rgb
     + texture(uSrc, vUv + vec2(uTexel.x, -uTexel.y)).rgb + texture(uSrc, vUv + vec2(-uTexel.x, uTexel.y)).rgb;
  o = vec4(c / 16.0 * uK, 1.0);
}`;
export const FINAL = HEAD + `
uniform sampler2D uScene, uBloom;
uniform float uExpo, uBloomK, uFrame;
in vec2 vUv;
out vec4 o;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main() {
  vec3 c = texture(uScene, vUv).rgb * uExpo + texture(uBloom, vUv).rgb * uBloomK;
  c = aces(max(c, vec3(0.0)));
  c = pow(c, vec3(1.0 / 2.2));
  vec2 v = (vUv - 0.5) * vec2(0.95, 1.0);
  c *= 1.0 - 0.42 * pow(min(length(v) * 1.35, 1.0), 2.4);
  c += (hash12(gl_FragCoord.xy + uFrame * 17.31) - 0.5) * 0.022;
  o = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;
