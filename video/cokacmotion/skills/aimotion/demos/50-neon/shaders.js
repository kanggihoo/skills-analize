/*
 * 50-neon/shaders.js — GLSL for the neon sign on a brick wall over a wet street.
 *   COMMON  tube data (segments in an RGBA32F texture, per-tube state in uniforms), nearest-tube search,
 *           the analytic irradiance of a straight line light, emission colours
 *   WALLMAP (wall space, 1.25 cm texels) irradiance on the bricks from every lit tube segment as a line light,
 *           its dominant direction, and the wall's radiance (lit bricks + the tubes) for the reflections
 *   GROUNDMAP (ground space) irradiance on the pavement from the same line lights
 *   SCENE   the camera's view: glass tubes (glowing column or phosphor coat, glass highlights, electrodes,
 *           blackout paint, housings), bricks lit by the wall map with grazing-light relief, wet asphalt and
 *           puddles reflecting the wall map (vertically smeared, rain ripples), drizzle
 *   bloom + tone map (FINAL)
 */
export const COMMON = `
uniform sampler2D uSeg;            // RGBA32F, NSEG × 2: (ax, ay, bx, by) / (s0, len, tube, blackout)
uniform vec4 uTube[12];            // segStart, segCount, length, type
uniform vec4 uBox[12];             // bbox (world)
uniform vec4 uTB[12];              // brightness, ignition fill (0..1 from both electrodes), cathode glow, 0
uniform float uTime;
const int NT = 12;
const float RT = 0.011;            // tube radius (22 mm glass)
const float HS = 0.055;            // the tube's centreline stands this far off the wall
const vec4 WALLR = vec4(-3.2, 0.0, 6.4, 5.0);     // wall map: x0, y0, width, height (m)
const vec4 GROUNDR = vec4(-3.2, 0.0, 6.4, 6.0);   // ground map: x0, z0, width, depth (m)
const float PI = 3.14159265;

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s / 0.9375; }

// emitted radiance of each gas/coating at full brightness (linear HDR)
vec3 gasCol(float type) {
  if (type < 0.5) return vec3(1.0, 0.2, 0.055) * 9.0;         // neon: red-orange, clear glass
  if (type < 1.5) return vec3(0.3, 0.52, 1.0) * 7.0;          // argon + mercury: pale blue, clear glass
  if (type < 2.5) return vec3(0.2, 1.0, 0.3) * 6.0;           // argon-mercury + green phosphor
  return vec3(1.0, 0.82, 0.62) * 6.5;                          // warm-white phosphor
}
// how much of the tube glows at arc length s: the electrode sleeves at both ends stay dark, and while the
// tube strikes the discharge fills it from both electrodes toward the middle
float glowAt(int i, float s) {
  vec4 T = uTube[i], B = uTB[i];
  float e = min(s, T.z - s);
  float sleeve = smoothstep(0.02, 0.035, e);
  float fill = smoothstep(-0.02, 0.0, B.y * T.z * 0.5 - e);
  return B.x * sleeve * fill;
}
float cathode(int i, float s) { vec4 T = uTube[i]; float e = min(s, T.z - s); return uTB[i].z * exp(-max(e - 0.03, 0.0) / 0.03) * step(0.025, e); }

struct Hit { float d; float side; float s; int tube; float blk; vec2 dir; };
Hit nearestTube(vec2 p, float reach) {
  Hit h; h.d = 1e9; h.tube = -1; h.side = 0.0; h.s = 0.0; h.blk = 0.0; h.dir = vec2(1.0, 0.0);
  for (int i = 0; i < NT; i++) {
    vec4 bb = uBox[i];
    if (p.x < bb.x - reach || p.x > bb.z + reach || p.y < bb.y - reach || p.y > bb.w + reach) continue;
    int s0 = int(uTube[i].x), n = int(uTube[i].y);
    for (int k = 0; k < 64; k++) {
      if (k >= n) break;
      vec4 a = texelFetch(uSeg, ivec2(s0 + k, 0), 0);
      vec2 ab = a.zw - a.xy, ap = p - a.xy;
      float L2 = max(dot(ab, ab), 1e-10);
      float t = clamp(dot(ap, ab) / L2, 0.0, 1.0);
      vec2 q = ap - ab * t;
      float d = length(q);
      if (d < h.d) {
        vec4 m = texelFetch(uSeg, ivec2(s0 + k, 1), 0);
        vec2 dir = ab * inversesqrt(L2);
        h.d = d; h.tube = i; h.s = m.x + m.y * t; h.blk = m.w; h.dir = dir;
        h.side = sign(dir.x * q.y - dir.y * q.x);
      }
    }
  }
  return h;
}
// irradiance at P (normal N) from a straight line light A→B of unit intensity per metre:
// ∫ dot(N, X−P) / |X−P|³ ds, in closed form (the segment split at the foot of the perpendicular)
float lineIrr(vec3 P, vec3 N, vec3 A, vec3 B) {
  vec3 ab = B - A;
  float L = length(ab);
  vec3 u = ab / L, ap = A - P;
  float sa = dot(ap, u);
  vec3 w = ap - sa * u;
  float d2 = max(dot(w, w), 1e-6);
  float ra = inversesqrt(d2 + sa * sa), rb = inversesqrt(d2 + (sa + L) * (sa + L));
  float J1 = ((sa + L) * rb - sa * ra) / d2;
  float J2 = ra - rb;
  return max(dot(N, w) * J1 + dot(N, u) * J2, 0.0);
}
// the streetlamp up the street, out of frame (upper left, in front of the wall): a cold point light
uniform vec3 uLamp, uStreet;
vec3 lampAt(vec3 P, vec3 n, out vec3 L) {
  vec3 d = uLamp - P;
  float d2 = dot(d, d);
  L = d * inversesqrt(d2);
  return uStreet * max(dot(n, L), 0.0) / d2;
}
// sum over every glowing segment: irradiance (rgb) and a luminance-weighted direction toward the light
vec3 tubeLight(vec3 P, vec3 N, out vec3 dirSum) {
  vec3 E = vec3(0.0);
  dirSum = vec3(0.0);
  for (int i = 0; i < NT; i++) {
    if (uTB[i].x <= 0.001 && uTB[i].z <= 0.001) continue;
    vec3 col = gasCol(uTube[i].w) * (2.0 * RT);
    int s0 = int(uTube[i].x), n = int(uTube[i].y);
    for (int k = 0; k < 64; k++) {
      if (k >= n) break;
      vec4 a = texelFetch(uSeg, ivec2(s0 + k, 0), 0);
      vec4 m = texelFetch(uSeg, ivec2(s0 + k, 1), 0);
      if (m.w > 0.5) continue;
      float g = glowAt(i, m.x + 0.5 * m.y) + cathode(i, m.x + 0.5 * m.y) * 0.3;
      if (g <= 0.0) continue;
      vec3 A = vec3(a.xy, HS), B = vec3(a.zw, HS);
      float irr = lineIrr(P, N, A, B) * g;
      E += col * irr;
      vec3 mid = 0.5 * (A + B) - P;
      dirSum += normalize(mid) * irr * dot(col, vec3(0.3, 0.55, 0.15));
    }
  }
  return E;
}
`;

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
`;

// ------------------------------------------------------------------ wall map (MRT)
export const WALLMAP = HEAD + COMMON + `
in vec2 vUv;
layout(location = 0) out vec4 oRad;
layout(location = 1) out vec4 oIrr;
layout(location = 2) out vec4 oDir;
void main() {
  vec2 p = WALLR.xy + vUv * WALLR.zw;
  vec3 dsum;
  vec3 E = tubeLight(vec3(p, 0.0), vec3(0.0, 0.0, 1.0), dsum);
  oIrr = vec4(E, 1.0);
  oDir = vec4(length(dsum) > 1e-6 ? normalize(dsum) : vec3(0.0, 0.0, 1.0), 1.0);
  // what the wet street sees of the wall: lit brick (average albedo) + the tubes themselves
  vec3 Ll;
  vec3 rad = vec3(0.2, 0.085, 0.06) * (E + lampAt(vec3(p, 0.0), vec3(0.0, 0.0, 1.0), Ll)) / PI;
  Hit h = nearestTube(p, 0.03);
  if (h.tube >= 0) {
    float cov = smoothstep(RT + 0.006, RT - 0.004, h.d);
    float g = h.blk > 0.5 ? 0.0 : glowAt(h.tube, h.s);
    rad = mix(rad, gasCol(uTube[h.tube].w) * g * 0.8 + vec3(0.01), cov);
  }
  oRad = vec4(rad, 1.0);
}`;

// ------------------------------------------------------------------ ground map
export const GROUNDMAP = HEAD + COMMON + `
in vec2 vUv;
out vec4 o;
void main() {
  vec2 g = GROUNDR.xy + vUv * GROUNDR.zw;
  vec3 dsum;
  o = vec4(tubeLight(vec3(g.x, 0.0, g.y), vec3(0.0, 1.0, 0.0), dsum), 1.0);
}`;

// ------------------------------------------------------------------ the view
export const SCENE = HEAD + COMMON + `
uniform sampler2D uWallR, uWallE, uWallD, uGroundE;
uniform vec2 uRes;
uniform vec3 uCamPos;
uniform mat3 uCamRot;
uniform float uFocal, uFrame, uRain;
uniform vec2 uEnds[24];
in vec2 vUv;
out vec4 o;

vec2 wallUV(vec2 p) { return (p - WALLR.xy) / WALLR.zw; }

// ---- bricks: running bond, recessed mortar, rounded and chipped arrises, burnt headers, grime, damp foot
float brickH(vec2 p, out vec3 alb, out float mortar) {
  float bw = 0.225, bh = 0.075;
  float row = floor(p.y / bh);
  float x = p.x / bw + 0.5 * mod(row, 2.0);
  float ci = floor(x);
  vec2 f = vec2(fract(x) * bw, fract(p.y / bh) * bh);
  vec2 e = min(f, vec2(bw, bh) - f);
  float chip = 0.0025 * noise(p * 90.0) + 0.002 * noise(p * 23.0 + ci);
  float jd = min(e.x, e.y) - 0.005 - chip;
  mortar = 1.0 - smoothstep(0.0, 0.0015, jd);
  vec2 id = vec2(ci, row);
  float hs = hash12(id), hs2 = hash12(id + 7.7);
  vec3 b = mix(vec3(0.30, 0.095, 0.055), vec3(0.42, 0.16, 0.08), hs);
  b = mix(b, vec3(0.12, 0.045, 0.035), step(0.86, hs2));
  b *= 0.8 + 0.35 * noise(p * 60.0) * noise(p * 13.0 + id);
  vec3 m = vec3(0.17, 0.16, 0.15) * (0.8 + 0.4 * noise(p * 80.0));
  alb = mix(b, m, mortar);
  // rain-washed grime running down from the top, and the damp, darker foot of the wall
  alb *= 1.0 - 0.35 * smoothstep(0.45, 0.8, fbm(vec2(p.x * 6.0, p.y * 0.6)));
  alb *= mix(0.55, 1.0, smoothstep(0.15, 0.7, p.y + 0.15 * noise(p * 4.0)));
  float face = smoothstep(0.0, 0.006, jd);
  return face * (0.004 + 0.0015 * noise(p * 140.0)) + (1.0 - face) * (-0.006);
}

vec3 tubeShadowWall(vec2 p) {
  // the streetlight throws the tubes' shadows a little down and right on the bricks
  vec3 Ls = normalize(uLamp - vec3(p, 0.0));
  vec2 q = p + Ls.xy * (HS / max(Ls.z, 0.2));
  Hit h = nearestTube(q, 0.03);
  return vec3(h.tube >= 0 ? smoothstep(RT * 0.5, RT * 1.8, h.d) : 1.0);
}

vec3 shadeWall(vec3 P, vec3 V, float pw) {
  vec3 alb; float mortar;
  float h0 = brickH(P.xy, alb, mortar);
  vec3 a2; float m2;
  float e = max(0.0012, pw * 0.7);
  float hx = brickH(P.xy + vec2(e, 0.0), a2, m2), hy = brickH(P.xy + vec2(0.0, e), a2, m2);
  vec3 n = normalize(vec3(-(hx - h0) / e, -(hy - h0) / e, 1.0));
  vec2 uv = wallUV(P.xy);
  vec3 E = texture(uWallE, uv).rgb;
  vec3 Ld = normalize(texture(uWallD, uv).xyz + vec3(0.0, 0.0, 1e-3));
  // grazing light from the tubes: relief of the bricks against the flat-wall irradiance
  float relief = clamp(max(dot(n, Ld), 0.0) / max(Ld.z, 0.08), 0.0, 3.0);
  relief = mix(1.0, relief, 0.85);
  // mortar sits back and is half shadowed
  float occ = 1.0 - 0.45 * mortar;
  vec3 Ll;
  vec3 street = lampAt(P, n, Ll) * tubeShadowWall(P.xy);
  vec3 c = alb * (E * relief * occ + street + vec3(0.004, 0.005, 0.008)) / PI;
  // electrode housings: black boots where each tube turns back through the wall
  float dh = 1e9;
  for (int i = 0; i < 24; i++) dh = min(dh, length(P.xy - uEnds[i]));
  if (dh < 0.026) {
    float r = dh / 0.026;
    float rimL = smoothstep(0.7, 0.95, r) * smoothstep(1.0, 0.95, r);
    c = vec3(0.006) + E * 0.004 * (1.0 + 4.0 * rimL) + lampAt(P, vec3(0.0, 0.0, 1.0), Ll) * 0.3 * rimL;
  }
  return c;
}

vec3 shadeGround(vec3 P, vec3 rd, float pw) {
  // asphalt: dark aggregate; puddles in the dips; rain rings in the puddles
  vec2 g = P.xz;
  float pud = smoothstep(0.52, 0.6, fbm(g * vec2(0.55, 0.9) + 3.0) + 0.12 * (1.0 - smoothstep(0.0, 1.2, P.z)));
  float agg = noise(g * 140.0) * 0.6 + noise(g * 37.0) * 0.4;
  vec3 alb = vec3(0.045, 0.045, 0.05) * (0.6 + 0.8 * agg);
  alb = mix(alb, vec3(0.012, 0.012, 0.014), pud);
  vec2 bump = (vec2(noise(g * 60.0), noise(g * 60.0 + 5.0)) - 0.5) * 0.35 * (1.0 - pud);
  vec3 n = normalize(vec3(bump.x, 1.0, bump.y));
  // raindrops: each cell drops one every ~1.1 s at its own phase; a ring runs out and fades
  vec2 cell = floor(g / 0.22);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = cell + vec2(i, j);
    vec2 c = (id + 0.2 + 0.6 * hash22(id)) * 0.22;
    float per = 0.9 + 0.5 * hash12(id + 3.0);
    float age = mod(uTime + hash12(id + 9.0) * per, per);
    float rr = age * 0.28, d = length(g - c);
    float qd = (d - rr) / 0.012;
    float ring = exp(-qd * qd) * exp(-age * 3.5) * uRain;
    vec2 dir = (g - c) / max(d, 1e-4);
    float wave = sin((d - rr) * 260.0) * ring;
    n = normalize(n + vec3(dir.x, 0.0, dir.y) * wave * 0.5 * pud);
  }
  float rough = mix(0.16, 0.012, pud);
  vec3 Eg = texture(uGroundE, (g - GROUNDR.xy) / GROUNDR.zw).rgb;
  vec3 Lg;
  vec3 c = alb * (Eg + lampAt(P, n, Lg) + vec3(0.004, 0.005, 0.008)) / PI;
  // the wet surface mirrors the wall: reflect, hit the wall plane, read the wall's radiance,
  // blurred by roughness and smeared vertically the way wet asphalt stretches every light
  vec3 r = reflect(rd, n);
  if (r.z < -1e-3) {
    float tw = -P.z / r.z;
    vec3 W = P + r * tw;
    if (W.y > 0.0) {
      float spread = rough * tw;
      float lod = log2(max(spread * 0.35 / 0.0125, 1.0));
      vec3 acc = vec3(0.0); float ws = 0.0;
      for (int k = -3; k <= 3; k++) {
        float o = float(k) / 3.0;
        vec2 q = W.xy + vec2(0.0, o * spread * 2.2);
        float w = exp(-o * o * 1.6);
        vec2 uv = wallUV(q);
        float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
        acc += textureLod(uWallR, uv, lod).rgb * w * inside; ws += w;
      }
      vec3 refl = acc / ws;
      float cosv = max(dot(-rd, n), 0.0);
      float F = 0.02 + 0.98 * pow(clamp(1.0 - cosv, 0.0, 1.0), 5.0);
      c += refl * F * mix(0.55, 1.0, pud);
    }
  }
  return c;
}

// ---- the glass tube itself
vec3 shadeTube(Hit h, vec3 P, vec3 V, vec3 behind) {
  vec4 T = uTube[h.tube];
  float type = T.w;
  float x = clamp(h.d / RT, 0.0, 1.0) * h.side;
  vec3 perp = vec3(-h.dir.y, h.dir.x, 0.0);
  vec3 n = normalize(perp * x + vec3(0.0, 0.0, 1.0) * sqrt(max(1.0 - x * x, 0.0)));
  float e = min(h.s, T.z - h.s);
  float sleeve = 1.0 - smoothstep(0.02, 0.035, e);
  vec3 Ls;
  vec3 El = lampAt(P, n, Ls);
  vec3 H = normalize(Ls + V);
  float spec = pow(max(dot(n, H), 0.0), 90.0) * 1.6 + pow(max(dot(n, H), 0.0), 12.0) * 0.08;
  float fres = 0.04 + 0.96 * pow(clamp(1.0 - dot(n, V), 0.0, 1.0), 5.0);
  vec3 Eh = texture(uWallE, wallUV(P.xy)).rgb;
  vec3 glassRefl = (uStreet / dot(uLamp - P, uLamp - P)) * spec * 6.0 + Eh * 0.02 * fres + vec3(0.002) * fres;
  if (h.blk > 0.5) {
    // blackout paint over the crossover: semi-gloss black
    return vec3(0.004) + Eh * 0.006 + (uStreet / dot(uLamp - P, uLamp - P)) * pow(max(dot(n, H), 0.0), 30.0) * 1.2;
  }
  float g = glowAt(h.tube, h.s), cg = cathode(h.tube, h.s);
  vec3 gc = gasCol(type);
  vec3 c;
  float chord = sqrt(max(1.0 - x * x / 0.72, 0.0));
  if (type < 1.5) {
    // clear glass: the positive column fills the bore; brighter through its middle (longer path)
    vec3 glow = gc * (0.12 + 1.0 * pow(chord, 1.3)) * g;
    // an unlit clear tube shows the wall through it, a little darkened and bent
    vec3 through = behind * (0.55 + 0.25 * (1.0 - abs(x)));
    c = through * (1.0 - min(g, 1.0) * 0.6) + glow + gc * cg * 0.25 * chord;
  } else {
    // phosphor coat: the inner wall glows evenly; unlit it reads as a milky white tube
    vec3 coat = vec3(0.55, 0.56, 0.54) * (Eh * 0.25 + El + vec3(0.004)) / PI;
    c = coat * (1.0 - min(g, 1.0)) + gc * (0.72 + 0.28 * chord) * (1.0 - 0.25 * x * x) * g + gc * cg * 0.2;
  }
  // electrode sleeve: a darker glass end with the metal electrode inside
  if (sleeve > 0.0) {
    float metal = smoothstep(0.75, 0.55, abs(x));
    vec3 el = mix(behind * 0.4, vec3(0.03, 0.03, 0.035) + El * 0.15, metal);
    el += gc * cg * 0.6 * metal;
    c = mix(c, el, sleeve);
  }
  return c + glassRefl;
}

// ---- drizzle: streaks falling through the light of the sign
vec3 rain(vec2 fc, vec3 E) {
  vec3 acc = vec3(0.0);
  for (int l = 0; l < 3; l++) {
    float fl = float(l);
    float sc = 18.0 + 16.0 * fl;
    vec2 p = fc + vec2(0.13 * fc.y, 0.0);
    p.y += uTime * (2400.0 - 600.0 * fl);
    vec2 cs = vec2(sc * 0.55, sc * 6.0);
    vec2 id = floor(p / cs), f = fract(p / cs);
    float hh = hash12(id + fl * 17.0);
    if (hh > 0.12) continue;
    float xo = 0.2 + 0.6 * hash12(id + 4.0 + fl);
    float streak = smoothstep(0.09, 0.0, abs(f.x - xo)) * smoothstep(0.0, 0.25, f.y) * smoothstep(1.0, 0.55, f.y);
    acc += streak * (0.5 + 0.5 * hash12(id + 8.0)) * (1.0 - 0.3 * fl);
  }
  return acc * E * 0.05 * uRain;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec3 rd = normalize(uCamRot * vec3((fc - 0.5 * uRes) / uFocal, -1.0));
  vec3 ro = uCamPos, V = -rd;
  float tW = -ro.z / min(rd.z, -1e-4);
  vec3 Wp = ro + rd * tW;
  vec3 col;
  bool ground = Wp.y < 0.0 && rd.y < 0.0;
  if (ground) {
    float tg = -ro.y / rd.y;
    vec3 G = ro + rd * tg;
    col = shadeGround(G, rd, tg / uFocal);
  } else {
    col = shadeWall(Wp, V, tW / uFocal);
    // the tube layer in front of the wall
    float tT = (HS - ro.z) / min(rd.z, -1e-4);
    vec3 Q = ro + rd * tT;
    Hit h = nearestTube(Q.xy, RT * 1.5);
    if (h.tube >= 0 && h.d < RT) {
      float aa = smoothstep(RT, RT - max(tT / uFocal, 0.0005) * 1.2, h.d);
      col = mix(col, shadeTube(h, Q, V, col), aa);
    }
  }
  vec2 wuv = wallUV(Wp.xy);
  vec3 Er = texture(uWallE, wuv).rgb + textureLod(uWallR, wuv, 3.0).rgb * 2.0;
  vec3 Ld;
  col += rain(fc, Er + lampAt(vec3(Wp.xy, 1.5), normalize(uLamp - vec3(Wp.xy, 1.5)), Ld) * 2.0);
  o = vec4(max(col, vec3(0.0)), 1.0);
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
  float knee = 0.5;
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
  c *= 1.0 - 0.45 * pow(min(length(v) * 1.3, 1.0), 2.4);
  c += (hash12(gl_FragCoord.xy + uFrame * 17.31) - 0.5) * 0.024;
  o = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;
