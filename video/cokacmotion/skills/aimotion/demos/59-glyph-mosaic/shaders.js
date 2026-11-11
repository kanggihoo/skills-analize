/*
 * shaders.js — GLSL for 59 · 글자로 빚은 등대.
 *   SCENE_FS   the raymarched night: a striped lighthouse on a rocky headland (SDF sphere tracing), a swell-covered
 *              sea (height field), a crescent moon and stars, and the lamp's rotating beam in the sea haze
 *              (single scattering, integrated across the beam in closed form). Rendered at 216×384 = 6×6 per cell.
 *   CELL_FS    6×6 average per text cell (36×64)
 *   MOSAIC_FS  the poem in a 36×64 grid: every cell's syllable, from a 9-weight SDF atlas, at a weight (and
 *              brightness) set by the scene's luminance; weights between atlas levels are blended as distances
 *   DOWN_FS / BLUR_FS / FINAL_FS   bloom and tone map
 */

const HASH = `
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float h31(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }`;

export const SCENE_FS = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec3 uCamPos, uCamF, uCamR, uCamU;
uniform float uFocal;                 // focal length in target pixels
uniform float uT, uAz, uLamp, uAlign, uCamAz;
uniform vec3 uMoonDir;
out vec4 o;
const float PI = 3.14159265, TAU = 6.2831853;
const vec3 LH = vec3(3.5, 0.0, 0.0);          // lighthouse axis (x, -, z)
const vec3 LAMP = vec3(3.5, 15.15, 0.0);
const float BASE_Y = 2.2, TOP_Y = 14.0;
const float TILT = -0.045, SIG_AZ = 0.08, SIG_EL = 0.13;    // beam: narrow in azimuth, a little taller
const float MOON_R = 0.05;
const vec3 LAMPC = vec3(1.0, 0.80, 0.52);
const vec3 MOONC = vec3(0.50, 0.56, 0.70);
${HASH}
float n3(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1, 0, 0)), f.x), mix(h31(i + vec3(0, 1, 0)), h31(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(h31(i + vec3(0, 0, 1)), h31(i + vec3(1, 0, 1)), f.x), mix(h31(i + vec3(0, 1, 1)), h31(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm3(vec3 p) { return 0.5 * n3(p) + 0.25 * n3(p * 2.03 + 7.1) + 0.125 * n3(p * 4.11 + 3.3); }
float sdEll(vec3 p, vec3 r) { float k0 = length(p / r), k1 = length(p / (r * r)); return k0 * (k0 - 1.0) / max(k1, 1e-4); }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float wrapPi(float a) { return mod(a + PI, TAU) - PI; }

// ---------------------------------------------------------------- geometry
float sdRock(vec3 p) {
  float d = sdEll(p - vec3(4.6, -1.6, -1.0), vec3(8.0, 4.1, 6.5));
  d = smin(d, sdEll(p - vec3(-1.8, -1.9, 3.2), vec3(4.6, 2.5, 3.6)), 1.8);
  d = smin(d, sdEll(p - vec3(11.0, -1.0, -3.0), vec3(5.0, 3.4, 5.0)), 2.0);
  if (d > 2.2) return d - 0.8;                                  // the displacement cannot reach this far
  return d + (fbm3(p * 0.62) - 0.5) * 1.3 + (n3(p * 2.3) - 0.5) * 0.22;
}
// tower, gallery, parapet, lantern, roof, finial. part: 0 body, 1 iron, 2 lantern glass, 3 roof
float sdTower(vec3 p, out float part) {
  vec3 q = p - LH;
  float rr = length(q.xz);
  part = 0.0;
  if (rr > 4.5) return rr - 2.2;
  float h = clamp((q.y - BASE_Y) / (TOP_Y - BASE_Y), 0.0, 1.0);
  float d = max((rr - mix(1.85, 1.3, h)) * 0.99, max(BASE_Y - 0.9 - q.y, q.y - TOP_Y));
  float gal = max(rr - 2.05, abs(q.y - 14.14) - 0.14);
  float par = max(abs(rr - 1.98) - 0.07, abs(q.y - 14.52) - 0.26);
  float lan = max(rr - 1.08, abs(q.y - 15.14) - 0.88);
  float roof = max(sdEll(q - vec3(0.0, 16.0, 0.0), vec3(1.3, 1.0, 1.3)), 16.0 - q.y);
  float fin = min(length(q - vec3(0.0, 17.15, 0.0)) - 0.17, max(rr - 0.05, abs(q.y - 17.4) - 0.3));
  if (gal < d) { d = gal; part = 1.0; }
  if (par < d) { d = par; part = 1.0; }
  if (lan < d) { d = lan; part = 2.0; }
  if (roof < d) { d = roof; part = 3.0; }
  if (fin < d) { d = fin; part = 1.0; }
  return d;
}
float map(vec3 p, out float mat) {
  float pt;
  float dt = sdTower(p, pt);
  float dr = sdRock(p);
  mat = dt < dr ? pt : 4.0;
  return min(dt, dr);
}
vec3 normalAt(vec3 p) {
  const vec2 e = vec2(1.0, -1.0) * 0.012;
  float m;
  return normalize(e.xyy * map(p + e.xyy, m) + e.yyx * map(p + e.yyx, m) + e.yxy * map(p + e.yxy, m) + e.xxx * map(p + e.xxx, m));
}
float march(vec3 ro, vec3 rd, float tmax, out float mat) {
  float t = 0.5;
  mat = -1.0;
  tmax = min(tmax, 170.0);
  for (int i = 0; i < 110; i++) {
    vec3 p = ro + rd * t;
    if (p.y > 17.8 && rd.y > 0.0) break;                        // above everything, climbing
    float m;
    float d = map(p, m);
    if (d < 0.0025 * t) { mat = m; return t; }
    t += d * 0.8;
    if (t > tmax) break;                                        // the sea is nearer
  }
  return 1e9;
}

// ---------------------------------------------------------------- sea: long swells, fading with distance
float waveH(vec2 p, float k) {
  return k * (0.32 * sin(dot(p, vec2(0.16, 0.10)) - 0.85 * uT)
            + 0.20 * sin(dot(p, vec2(-0.09, 0.21)) - 1.05 * uT + 1.3)
            + 0.09 * sin(dot(p, vec2(0.37, -0.23)) - 1.6 * uT + 2.1)
            + 0.05 * sin(dot(p, vec2(-0.55, 0.61)) - 2.1 * uT + 0.4));
}
vec3 waveN(vec2 p, float k) {
  vec2 g = 0.32 * vec2(0.16, 0.10) * cos(dot(p, vec2(0.16, 0.10)) - 0.85 * uT)
         + 0.20 * vec2(-0.09, 0.21) * cos(dot(p, vec2(-0.09, 0.21)) - 1.05 * uT + 1.3)
         + 0.09 * vec2(0.37, -0.23) * cos(dot(p, vec2(0.37, -0.23)) - 1.6 * uT + 2.1)
         + 0.05 * vec2(-0.55, 0.61) * cos(dot(p, vec2(-0.55, 0.61)) - 2.1 * uT + 0.4);
  return normalize(vec3(-g.x * k, 1.0, -g.y * k));
}
float seaHit(vec3 ro, vec3 rd) {
  if (rd.y > -1e-4) return 1e9;
  float t = min(ro.y / -rd.y, 600.0);
  for (int i = 0; i < 7; i++) {
    vec3 p = ro + rd * t;
    t += (p.y - waveH(p.xz, exp(-t * 0.012))) / -rd.y * 0.55;
    t = clamp(t, 0.0, 600.0);
  }
  return t;
}

// ---------------------------------------------------------------- sky
vec3 skyCol(vec3 rd) {
  float el = rd.y;
  vec3 c = mix(vec3(0.070, 0.088, 0.140), vec3(0.010, 0.015, 0.036), smoothstep(-0.02, 0.5, el));
  c += vec3(0.05, 0.06, 0.075) * exp(-max(el, 0.0) * 14.0);   // haze along the horizon
  float md = clamp(dot(rd, uMoonDir), -1.0, 1.0);
  c += MOONC * (0.16 * exp((md - 1.0) * 9.0) + 0.55 * exp((md - 1.0) * 150.0));
  return c;
}
vec3 moonDisc(vec3 rd) {
  if (dot(rd, uMoonDir) < 0.9) return vec3(0.0);
  vec3 mR = normalize(cross(uMoonDir, vec3(0.0, 1.0, 0.0))), mU = cross(mR, uMoonDir);
  vec2 q = vec2(dot(rd, mR), dot(rd, mU)) / MOON_R;
  float r = length(q);
  if (r > 1.1) return vec3(0.0);
  vec3 n = vec3(q, sqrt(max(1.0 - r * r, 0.0)));
  float lit = smoothstep(-0.04, 0.16, dot(n, normalize(vec3(-0.62, -0.30, -0.42))));   // a crescent, lit lower left
  float mar = 0.82 + 0.18 * n3(vec3(q * 2.6, 4.0));
  return vec3(1.0, 0.96, 0.88) * (2.8 * lit * mar + 0.045) * (1.0 - smoothstep(0.93, 1.03, r));
}
vec3 stars(vec3 rd) {
  if (rd.y < 0.02) return vec3(0.0);
  vec2 sp = vec2(atan(rd.x, -rd.z), asin(clamp(rd.y, -1.0, 1.0))) * 90.0;
  vec2 ip = floor(sp);
  vec3 acc = vec3(0.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {        // a star may sit near its cell's edge
    vec2 c = ip + vec2(float(i), float(j));
    float h = h21(c);
    if (h < 0.94) continue;
    vec2 pos = c + vec2(h21(c + 17.1), h21(c + 41.7));
    vec2 dd = sp - pos;
    float b = (h - 0.94) / 0.06;
    float tw = 0.65 + 0.35 * sin(uT * (1.5 + 3.0 * h21(c + 3.3)) + h * 50.0);
    acc += vec3(0.85, 0.9, 1.0) * b * b * tw * 2.4 * exp(-dot(dd, dd) * 4.0);
  }
  float mf = 1.0 - smoothstep(0.985, 0.996, dot(rd, uMoonDir));     // none on the moon
  return acc * smoothstep(0.02, 0.16, rd.y) * mf;
}

// ---------------------------------------------------------------- the lamp
float hg(float c, float g) { float g2 = g * g; return (1.0 - g2) / (12.566 * pow(max(1.0 + g2 - 2.0 * g * c, 1e-3), 1.5)); }
// single scattering from one beam along the view ray, integrated in closed form across the beam: the ray's
// horizontal line crosses the beam axis at distance rho from the lamp; the gaussian (in azimuth) integrates to
// sigma·√π·rho / sin(crossing angle). Elevation, haze, spreading and the phase function are taken at the crossing.
vec3 beam(vec3 ro, vec3 rd, float tmax, float az) {
  vec2 bd = vec2(cos(az), sin(az));
  vec2 o2 = ro.xz - LAMP.xz, r2 = rd.xz;
  float rl = length(r2);
  float den = r2.x * bd.y - r2.y * bd.x;                     // cross(r2, bd)
  if (rl < 1e-4 || abs(den) < 1e-6) return vec3(0.0);
  float s = -(o2.x * bd.y - o2.y * bd.x) / den;
  float rho = (o2.x * r2.y - o2.y * r2.x) / -den;
  if (s < 0.0 || s > tmax || rho < 0.0) return vec3(0.0);
  vec3 p = ro + rd * s;
  float del = atan(p.y - (LAMP.y + tan(TILT) * rho), rho);
  float sn = max(abs(den) / rl, 0.06);
  float len = min(SIG_AZ * 1.7725 * rho / (sn * rl), 30.0);
  vec3 v = (p - LAMP) / max(length(p - LAMP), 1e-3);         // never normalize a zero vector (NaN on real GPUs)
  float ph = hg(dot(v, -rd), 0.6);
  float haze = 0.06 + 0.5 * exp(-max(p.y, 0.0) / 16.0);
  float fall = 1.0 / (1.0 + rho * rho * 0.002);
  return LAMPC * 46.0 * exp(-del * del / (SIG_EL * SIG_EL)) * len * ph * haze * fall * smoothstep(0.8, 2.4, rho);
}
// lens glare round the lamp, flaring when a beam faces the camera
vec3 glare(vec3 rd) {
  vec3 l = normalize(LAMP - uCamPos);
  float a2 = max(2.0 * (1.0 - dot(rd, l)), 0.0);
  float g = 0.6 * exp(-a2 / 0.00022) + 0.12 * exp(-a2 / 0.004)
          + uAlign * (3.2 * exp(-a2 / 0.0018) + 1.0 * exp(-a2 / 0.02) + 0.4 * exp(-a2 / 0.15));
  return LAMPC * g * uLamp;
}

// ---------------------------------------------------------------- shading
vec3 shadeSolid(vec3 p, vec3 rd, float mat) {
  vec3 n = normalAt(p);
  vec3 L = uMoonDir;
  float dif = max(dot(n, L), 0.0);
  float fac = max(dot(n, -rd), 0.0);
  float rim = (1.0 - fac) * (1.0 - fac) * (1.0 - fac) * max(dot(n, L) + 0.35, 0.0);
  vec3 amb = vec3(0.045, 0.055, 0.085) * (0.6 + 0.4 * n.y);
  vec3 lv = LAMP - p;
  float ld2 = dot(lv, lv);
  float lamp = uLamp * max(dot(n, lv * inversesqrt(max(ld2, 1e-4))), 0.0) * 9.0 / (1.0 + ld2 * 1.2);
  vec3 q = p - LH;
  if (mat > 3.5) {                                            // rock: dark, wet edges catch the moon
    vec3 alb = vec3(0.065, 0.065, 0.075) * (0.75 + 0.5 * n3(p * 1.7));
    return alb * (MOONC * (dif * 1.4 + rim * 2.0) + amb + LAMPC * lamp * 0.3) + vec3(0.04, 0.05, 0.07) * rim;
  }
  if (mat > 2.5) {                                            // roof: dark painted iron
    return vec3(0.05, 0.05, 0.055) * (MOONC * (dif + rim * 2.5) + amb) + LAMPC * lamp * 0.05;
  }
  if (mat > 1.5) {                                            // lantern glass: the lamp behind mullions
    float ang = atan(q.z, q.x);
    float f = fract(ang * 8.0 / TAU);
    float bar = 1.0 - smoothstep(0.03, 0.09, min(f, 1.0 - f));
    float hb = 1.0 - smoothstep(0.02, 0.06, abs(q.y - 15.2));
    float face = max(cos(wrapPi(ang - uAz)), 0.0);
    float glow = uLamp * (1.2 + 1.6 * face * face * face * face + 5.0 * uAlign);
    return LAMPC * glow * (1.0 - bar) * (1.0 - 0.8 * hb) + vec3(0.02, 0.025, 0.035) * rim;
  }
  if (mat > 0.5) {                                            // gallery and parapet
    return vec3(0.06, 0.06, 0.065) * (MOONC * (dif + rim * 2.0) + amb) + LAMPC * lamp * 0.12;
  }
  // tower: white with three dark bands, a lit window facing us
  float band = step(0.5, fract((p.y - 2.6) / 4.0));
  vec3 alb = mix(vec3(0.20, 0.07, 0.06), vec3(0.80, 0.78, 0.74), band);
  vec3 col = alb * (MOONC * (dif * 1.1 + rim * 1.6) + amb + vec3(0.05, 0.06, 0.08) * fac + LAMPC * lamp * 0.25);
  float wa = abs(wrapPi(atan(q.z, q.x) - uCamAz));
  float win = (1.0 - smoothstep(0.12, 0.17, wa)) * (1.0 - smoothstep(0.32, 0.42, abs(p.y - 7.6)));   // in a dark band
  col = mix(col, vec3(1.0, 0.72, 0.42) * 1.6 * uLamp, win);
  return col;
}
vec3 shadeSea(vec3 p, vec3 rd, float t) {
  float k = exp(-t * 0.012);
  vec3 n = waveN(p.xz, k);
  // fine ripples for the glitter
  vec2 rp = vec2(n3(vec3(p.xz * 1.7, uT * 0.8)), n3(vec3(p.xz * 1.7 + 9.1, uT * 0.8))) - 0.5;
  n = normalize(n + vec3(rp.x, 0.0, rp.y) * 0.22 * k);
  float c = max(dot(n, -rd), 0.0), x = 1.0 - c, x2 = x * x;
  float fr = 0.02 + 0.98 * x2 * x2 * x;
  vec3 rr = reflect(rd, n);
  rr.y = abs(rr.y);
  float mg = max(dot(rr, uMoonDir), 0.0);
  // a rough night sea mirrors the sky only dimly (the horizon must stay a line), the moon and lamp sharply
  vec3 refl = 0.5 * skyCol(rr) + vec3(1.0, 0.95, 0.85) * (pow(mg, 220.0) * 7.0 + pow(mg, 28.0) * 0.3);
  float lg = max(dot(rr, normalize(LAMP - p)), 0.0);
  refl += LAMPC * uLamp * (1.0 + 3.0 * uAlign) * (pow(lg, 500.0) * 30.0 + pow(lg, 50.0) * 0.35);
  vec3 col = vec3(0.004, 0.010, 0.018) + refl * fr;
  // surf against the rocks
  float rdist = sdRock(p);
  float foam = (1.0 - smoothstep(0.0, 1.5, rdist)) * (0.55 + 0.45 * sin(rdist * 4.0 - uT * 1.7 + n3(p * 0.8) * 4.0));
  col += vec3(0.50, 0.55, 0.62) * max(foam, 0.0) * 0.45;
  vec3 hz = vec3(rd.x, 0.0, rd.z) / max(length(rd.xz), 1e-4);
  return mix(col, 0.55 * skyCol(hz), 1.0 - exp(-t * 0.004));
}

void main() {
  vec2 pc = gl_FragCoord.xy - 0.5 * uRes;
  vec3 rd = normalize(uCamF * uFocal + uCamR * pc.x + uCamU * pc.y);
  vec3 ro = uCamPos;
  float mat;
  float tw = seaHit(ro, rd);
  float ts = march(ro, rd, tw, mat);
  vec3 col;
  float th;
  if (ts < tw && ts < 1e8) { col = shadeSolid(ro + rd * ts, rd, mat); th = ts; }
  else if (tw < 1e8) { col = shadeSea(ro + rd * tw, rd, tw); th = tw; }
  else { col = skyCol(rd) + moonDisc(rd) + stars(rd); th = 1e9; }
  col += (beam(ro, rd, th, uAz) + 0.55 * beam(ro, rd, th, uAz + PI)) * uLamp;
  col += glare(rd);
  o = vec4(col, 1.0);
}`;

// the 6×6 texels of the scene under one text cell, averaged
export const CELL_FS = `#version 300 es
precision highp float;
uniform sampler2D uScene;
out vec4 o;
void main() {
  ivec2 c = ivec2(gl_FragCoord.xy) * 6;
  vec3 s = vec3(0.0);
  for (int j = 0; j < 6; j++) for (int i = 0; i < 6; i++) s += texelFetch(uScene, c + ivec2(i, j), 0).rgb;
  o = vec4(s / 36.0, 1.0);
}`;

export const MOSAIC_FS = `#version 300 es
precision highp float;
precision highp sampler2DArray;
uniform sampler2DArray uAtlas;     // signed distance (texels, + outside); layer = weight 100…900; 8×8 cells of 64
uniform sampler2D uScene;          // 216×384, linear HDR
uniform sampler2D uCell;           // 36×64 cell averages
uniform sampler2D uMap;            // 36×64: r = glyph index, g = highlighted line
uniform sampler2D uCov;            // coverage of glyph g at level l (texel l, g); last row = mean
uniform float uNG;                 // number of glyphs (row of the mean)
uniform float uIntro, uFront, uDiss, uHi, uPlain, uExpo, uT, uFade;
uniform vec2 uLampPx;
out vec4 o;
const float CELLPX = 30.0;
const float S = 48.0 / 27.0;       // atlas texels per stage pixel: 48 px glyphs set at 27 px
${HASH}
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y);
}
float covAt(float g, float lv) {
  float l0 = floor(lv), l1 = min(l0 + 1.0, 8.0);
  return mix(texelFetch(uCov, ivec2(int(l0), int(g)), 0).r, texelFetch(uCov, ivec2(int(l1), int(g)), 0).r, lv - l0);
}
void main() {
  vec2 fc = vec2(gl_FragCoord.x, 1920.0 - gl_FragCoord.y);        // stage px, y down
  ivec2 cell = ivec2(floor(fc / CELLPX));
  vec2 cc = (vec2(cell) + 0.5) * CELLPX;
  vec2 lp = fc - cc;                                               // px from the cell centre
  vec4 mp = texelFetch(uMap, cell, 0);
  float g = floor(mp.r * 255.0 + 0.5);
  float hi = mp.g;

  // the picture under this cell: its average, plus the detail under this very pixel
  vec3 L = mix(texelFetch(uCell, ivec2(cell.x, 63 - cell.y), 0).rgb,
               texture(uScene, vec2(fc.x / 1080.0, 1.0 - fc.y / 1920.0)).rgb, 0.55);
  L = max(L, vec3(0.0));
  float lum = dot(L, vec3(0.2126, 0.7152, 0.0722));
  float tl = 1.0 - exp(-lum * uExpo);
  float sceneLv = 8.0 * pow(clamp(tl, 0.0, 1.0), 0.85);

  // reveal: a front spreading out from the lantern; later the picture dissolves in soft patches
  float hc = h21(vec2(cell) + 0.37);
  float dist = length(cc - uLampPx) + (hc - 0.5) * 140.0;
  float front = 1.0 - smoothstep(uFront - 260.0, uFront, dist);
  float th = 0.12 + 0.8 * vn(vec2(cell) * 0.16 + 3.7) + 0.12 * hc;
  float R = front * (1.0 - smoothstep(th - 0.1, th + 0.1, uDiss));

  float lv = mix(uPlain, sceneLv, R);
  lv = clamp(mix(lv, 4.4, hi * uHi), 0.0, 8.0);

  // the glyph at a continuous weight: blend the distance fields of the two nearest atlas weights
  float l0 = floor(lv), l1 = min(l0 + 1.0, 8.0);
  vec2 at = 32.0 + lp * S;
  vec2 auv = (vec2(mod(g, 8.0), floor(g / 8.0)) * 64.0 + at) / 512.0;
  float d = mix(texture(uAtlas, vec3(auv, l0)).r, texture(uAtlas, vec3(auv, l1)).r, lv - l0) / S;
  float cov = 1.0 - smoothstep(-0.62, 0.62, d);

  // simple and complex syllables carry the same light at the same weight
  float comp = clamp(sqrt(covAt(uNG, lv) / max(covAt(g, lv), 1e-3)), 0.75, 1.45);
  comp = mix(1.0, comp, R);

  // colour: pale ivory text, tinted by the picture where it shows
  vec3 hue = L / max(max(L.r, max(L.g, L.b)), 1e-4);
  hue = mix(vec3(dot(hue, vec3(0.3333))), hue, 0.75);
  vec3 plain = vec3(0.80, 0.80, 0.77);
  float bright = mix(0.36 + 0.06 * uPlain, 0.28 + 1.0 * tl, R);   // the calm poem at the end is a touch brighter
  vec3 col = mix(plain, mix(vec3(0.85, 0.87, 0.90), hue, 0.85), R) * bright * comp;
  col = mix(col, vec3(1.0, 0.74, 0.40) * 1.3, hi * uHi);
  col *= 1.0 + hi * uHi * 0.12 * sin(uT * 2.2 - float(cell.x) * 0.5);   // a slow shimmer runs along the line

  // the poem is first written in, cell by cell in reading order
  float order = (float(cell.y) + float(cell.x) / 36.0) / 64.0;
  float vis = smoothstep(0.0, 0.06, uIntro - order * 0.94);

  vec3 bg = vec3(0.010, 0.013, 0.024) + L * 0.05 * R;               // a breath of the picture behind the text
  o = vec4((bg + col * cov * vis) * uFade, 1.0);
}`;

export const DOWN_FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D src;
uniform vec2 px;
out vec4 o;
void main() {
  o = vec4(0.25 * (texture(src, uv + px * vec2(-1, -1)).rgb + texture(src, uv + px * vec2(1, -1)).rgb
                 + texture(src, uv + px * vec2(-1, 1)).rgb + texture(src, uv + px * vec2(1, 1)).rgb), 1.0);
}`;

export const BLUR_FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D src;
uniform vec2 dir;
out vec4 o;
void main() {
  vec3 c = texture(src, uv).rgb * 0.1964825501511404;
  c += (texture(src, uv + dir * 1.411764705882353).rgb + texture(src, uv - dir * 1.411764705882353).rgb) * 0.2969069646728344;
  c += (texture(src, uv + dir * 3.2941176470588234).rgb + texture(src, uv - dir * 3.2941176470588234).rgb) * 0.09447039785044732;
  c += (texture(src, uv + dir * 5.176470588235294).rgb + texture(src, uv - dir * 5.176470588235294).rgb) * 0.010381362401148057;
  o = vec4(c, 1.0);
}`;

export const FINAL_FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D uImg, uBloomA, uBloomB;
uniform float uFrame, uBloom;
out vec4 o;
${HASH}
void main() {
  vec2 fc = vec2(gl_FragCoord.x, 1920.0 - gl_FragCoord.y);
  vec3 c = texture(uImg, uv).rgb + (texture(uBloomA, uv).rgb * 0.30 + texture(uBloomB, uv).rgb * 0.40) * uBloom;
  c = 1.0 - exp(-c * 1.5);
  float v = length((fc - vec2(540.0, 880.0)) / vec2(860.0, 1320.0));
  c *= 1.0 - 0.38 * smoothstep(0.45, 1.25, v);
  c *= 1.0 - 0.55 * smoothstep(1560.0, 1820.0, fc.y);              // quiet under the caption
  c += (h21(fc + uFrame * 7.13) - 0.5) * (1.4 / 255.0);
  o = vec4(max(c, 0.0), 1.0);
}`;
