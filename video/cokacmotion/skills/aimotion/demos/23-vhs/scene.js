/*
 * 23 · what the camcorder saw — a birthday cake by candlelight in a dark living room (one fragment shader,
 * 720×480 = one interlaced camcorder frame). The output is the camcorder's VIDEO SIGNAL, not light:
 * scene light → CCD (vertical smear under the flames, noise that grows with the auto-gain) → gamma 0.45 with a
 * highlight knee → the camcorder's own date stamp keyed in. That signal is what gets recorded on the tape (vhs.js).
 * Scene time is the video FIELD clock (59.94 fields/s); every uniform is a function of the field index.
 */
export const SCENE_FS = `#version 300 es
precision highp float;
uniform vec2 res;
uniform float tf, uGain, uField, uZoom;
uniform vec2 uShake;
uniform vec4 uFl[7];        // wick top x, y; flame height; sway (in flame heights)
uniform vec4 uFs[7];        // lit 0..1; smoke age (s, < 0: none); ember glow; light output
uniform sampler2D uText;    // the chocolate writing on the cake (canvas, alpha)
uniform sampler2D uStamp;   // the camcorder's date stamp (canvas, rgba)
out vec4 o;

const vec2 CK = vec2(0.667, 0.39);    // centre of the cake's top
const vec2 CR = vec2(0.27, 0.065);    // radii of the top ellipse
const float CB = 0.235;               // centre y of the bottom ellipse

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float box(vec2 p, vec2 a, vec2 b, float soft) {
  vec2 s = smoothstep(a - soft, a + soft, p) * smoothstep(b + soft, b - soft, p);
  return s.x * s.y;
}
float sdSeg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }

// light from the seven flames reaching a point (screen-space falloff, k sets how local it is)
float candles(vec2 p, float k) {
  float s = 0.0;
  for (int i = 0; i < 7; i++) {
    vec2 d = p - (uFl[i].xy + vec2(0.0, uFl[i].z * 0.4));
    s += uFs[i].w / (1.0 + dot(d, d) * k);
  }
  return s;
}
const vec3 FIRE = vec3(1.0, 0.60, 0.28);
const vec3 HALL = vec3(1.0, 0.78, 0.50);

vec3 flame(vec2 p, vec4 F, float lit) {
  vec2 q = (p - F.xy) / F.z;
  q.x -= F.w * q.y * max(q.y, 0.0);
  float y = q.y + 0.12;
  if (y < -0.1 || y > 1.4) return vec3(0.0);
  float yc = clamp(y, 0.0, 1.0);
  float w = 0.25 * pow(yc, 0.45) * pow(clamp(1.15 - y, 0.0, 1.0), 0.8) + 0.02;
  float r = abs(q.x) / w;
  float body = exp(-r * r * 2.0) * smoothstep(1.15, 0.8, y) * smoothstep(0.0, 0.1, y);
  float core = exp(-r * r * 5.0) * smoothstep(0.75, 0.2, y) * smoothstep(0.04, 0.2, y);
  float blue = exp(-r * r * 3.0) * smoothstep(0.25, 0.06, y) * smoothstep(-0.02, 0.06, y);
  float glow = exp(-length(q * vec2(1.0, 0.6)) * 2.2) * 0.22;
  return lit * (vec3(1.0, 0.42, 0.10) * body * 3.0 + vec3(1.0, 0.88, 0.6) * core * 8.0 + vec3(0.12, 0.2, 0.9) * blue * 0.9 + FIRE * glow);
}

vec3 balloon(vec3 col, vec2 p, vec2 c, float r, vec3 alb, float Lc, float hall) {
  vec2 q = (p - c) / vec2(r, r * 1.18);
  float d2 = dot(q, q);
  // string
  float sx = c.x + 0.006 * sin((p.y - c.y) * 40.0);
  float str = smoothstep(0.0022, 0.0008, abs(p.x - sx)) * step(p.y, c.y - r * 1.18) * smoothstep(c.y - 0.5, c.y - 0.2, p.y);
  col = mix(col, vec3(0.03) + 0.05 * Lc, str * 0.7);
  if (d2 > 1.05) return col;
  vec3 n = vec3(q, sqrt(max(1.0 - d2, 0.0)));
  float below = max(dot(n, normalize(vec3(0.0, -0.8, 0.6))), 0.0);   // the candles are below
  float right = max(dot(n, normalize(vec3(0.9, -0.1, 0.4))), 0.0);   // the hallway is to the right
  vec3 c2 = alb * (0.02 + 0.10 * Lc * below + 0.09 * hall * right);
  vec2 hp = q - vec2(-0.05, -0.45);
  c2 += FIRE * 0.12 * Lc * exp(-dot(hp, hp) * 60.0);                   // the flames reflected on the rubber
  vec2 hq = q - vec2(0.45, 0.25);
  c2 += HALL * 0.08 * hall * exp(-dot(hq, hq) * 40.0);
  float edge = smoothstep(1.0, 0.92, d2);
  // the knot
  float knot = smoothstep(0.012, 0.006, length(p - c + vec2(0.0, r * 1.2)));
  return mix(mix(col, c2, edge), alb * 0.04 * Lc, knot);
}

void main() {
  vec2 uv = gl_FragCoord.xy / res;
  vec2 p = vec2(uv.x * 1.33333, uv.y);
  vec2 C0 = vec2(0.667, 0.45);
  p = C0 + (p - C0) / uZoom + uShake;

  float Lc = candles(vec2(0.667, 0.47), 0.0);       // total candle output
  float hall = 1.0;
  // ---- the wall: striped wallpaper, lit by the candles and a little by the hallway
  vec3 col = vec3(0.33, 0.29, 0.24) * (0.9 + 0.1 * smoothstep(0.3, 0.7, fract(p.x * 38.0)));
  float Ew = candles(p, 5.0) * 0.03 + 0.012 * hall * smoothstep(0.5, 1.15, p.x);
  col *= Ew;
  col *= FIRE * 0.6 + 0.4;
  // ---- a window at night on the left: deep blue, a streetlight and city lights out of focus
  float win = box(p, vec2(0.23, 0.53), vec2(0.45, 0.96), 0.008);
  vec3 night = vec3(0.010, 0.016, 0.040) + vec3(0.05, 0.03, 0.01) * exp(-dot(p - vec2(0.30, 0.66), p - vec2(0.30, 0.66)) * 120.0);
  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    vec2 bc = vec2(0.25 + 0.19 * hash12(vec2(fi, 1.0)), 0.56 + 0.17 * hash12(vec2(fi, 2.0)));
    vec3 bcol = mix(vec3(1.0, 0.55, 0.18), vec3(0.6, 0.75, 1.0), step(0.6, hash12(vec2(fi, 3.0))));
    night += bcol * 0.05 * smoothstep(0.016, 0.012, length(p - bc));
  }
  float mull = max(smoothstep(0.006, 0.003, abs(p.x - 0.34)), smoothstep(0.006, 0.003, abs(p.y - 0.75)));
  night = mix(night, vec3(0.006), mull);
  col = mix(col, night, win);
  // curtains on both sides of the window, deep red folds
  float cur = box(p, vec2(0.17, 0.48), vec2(0.25, 1.05), 0.006) + box(p, vec2(0.43, 0.48), vec2(0.50, 1.05), 0.006);
  float folds = 0.55 + 0.45 * sin(p.x * 140.0 + 1.5 * sin(p.y * 9.0));
  col = mix(col, vec3(0.42, 0.06, 0.05) * (candles(p, 5.0) * 0.035 + 0.004) * folds, clamp(cur, 0.0, 1.0));
  // ---- the open door on the right: a warm hallway, someone standing in it (out of focus)
  float door = box(p, vec2(0.93, 0.40), vec2(1.10, 1.08), 0.010);
  vec3 hallc = HALL * (0.16 + 0.10 * smoothstep(0.5, 1.0, p.y));
  float person = smoothstep(0.040, 0.028, length((p - vec2(1.035, 0.80)) * vec2(1.0, 0.9)));
  person = max(person, box(p, vec2(0.985, 0.38), vec2(1.085, 0.755), 0.012) * smoothstep(0.77, 0.74, p.y + 0.3 * abs(p.x - 1.035)));
  hallc = mix(hallc, vec3(0.012, 0.009, 0.008), person);
  col = mix(col, hallc, door);
  // ---- a framed picture above the table
  float frame = box(p, vec2(0.56, 0.74), vec2(0.78, 0.95), 0.004);
  float inner = box(p, vec2(0.575, 0.755), vec2(0.765, 0.935), 0.003);
  vec3 pic = vec3(0.10, 0.12, 0.10) * (0.6 + 0.4 * vnoise(p * 30.0)) * Ew * 4.0 + FIRE * 0.05 * Lc * exp(-dot(p - vec2(0.64, 0.80), p - vec2(0.64, 0.80)) * 900.0);
  col = mix(col, mix(vec3(0.15, 0.09, 0.05) * Ew * 3.0, pic, inner), frame);
  // ---- balloons
  col = balloon(col, p, vec2(0.36, 0.82), 0.075, vec3(0.85, 0.06, 0.05), Lc, hall * 0.2);
  col = balloon(col, p, vec2(0.475, 0.91), 0.062, vec3(0.06, 0.20, 0.85), Lc, hall * 0.3);
  col = balloon(col, p, vec2(0.985, 0.85), 0.070, vec3(0.90, 0.72, 0.05), Lc, hall);
  col = balloon(col, p, vec2(1.09, 0.95), 0.060, vec3(0.10, 0.65, 0.20), Lc, hall);

  // ---- the table: a red gingham cloth in perspective (derivatives taken outside any branch)
  float dz = max(0.43 - p.y, 0.01);
  vec2 tc = vec2((p.x - 0.667) / dz * 0.08, 0.05 / dz);
  vec2 tw = fwidth(tc) / 0.022 + 1e-4;
  vec2 tri = abs(fract(tc / 0.022) - 0.5) * 2.0;
  vec2 tst = smoothstep(0.5 - tw, 0.5 + tw, tri);
  vec3 cloth = mix(vec3(0.80, 0.77, 0.72), vec3(0.72, 0.07, 0.06), 0.5 * (tst.x + tst.y));
  vec3 tcol = cloth * (candles(p, 7.0) * 0.07 + 0.006) * FIRE;
  tcol *= smoothstep(0.405, 0.395, p.y) * 0.85 + 0.15;            // the far edge of the table
  col = mix(col, tcol, step(p.y, 0.405));
  // ---- the plate
  vec2 pq = (p - vec2(0.667, 0.215)) / vec2(0.335, 0.072);
  float pd = dot(pq, pq);
  if (pd < 1.0) {
    float E = candles(p, 7.0) * 0.09 + 0.008;
    vec3 plate = vec3(0.80, 0.80, 0.78) * E * FIRE * (0.7 + 0.3 * smoothstep(0.6, 0.95, pd));
    plate += FIRE * 0.6 * E * smoothstep(0.80, 0.88, pd) * smoothstep(0.98, 0.9, pd);
    col = mix(col, plate, smoothstep(1.0, 0.97, pd));
  }
  // ---- the cake: a cream-covered cylinder
  float dx = (p.x - CK.x) / CR.x;
  float topF = CK.y - CR.y * sqrt(max(1.0 - dx * dx, 0.0));
  float botF = CB - 0.06 * sqrt(max(1.0 - dx * dx, 0.0));
  float E = candles(p, 6.0) * 0.085 + 0.010;                // + the hallway's spill
  if (abs(dx) < 1.0 && p.y > botF && p.y < topF) {
    float phi = asin(clamp(dx, -1.0, 1.0));
    float vert = (p.y - botF) / max(topF - botF, 1e-3);
    vec3 cream = vec3(0.90, 0.78, 0.60);
    vec3 side = cream * E * FIRE * (0.30 + 0.70 * cos(phi)) * (0.45 + 0.55 * vert);
    // pink garlands and a row of piped beads at the bottom
    float sw = topF - 0.030 - 0.018 * abs(sin(phi * 4.0));
    float garl = smoothstep(0.007, 0.003, abs(p.y - sw));
    side = mix(side, vec3(0.95, 0.40, 0.55) * E * FIRE * (0.35 + 0.65 * cos(phi)), garl);
    float bead = smoothstep(0.55, 0.35, length(vec2(fract(phi * 9.0) - 0.5, (p.y - botF - 0.010) / 0.012)));
    side = mix(side, cream * E * FIRE * 1.1 * (0.30 + 0.70 * cos(phi)), bead);
    col = mix(col, side, smoothstep(1.0, 0.985, abs(dx)));
  }
  vec2 tq = (p - CK) / CR;
  float td = dot(tq, tq);
  if (td < 1.0) {
    vec3 top = vec3(0.93, 0.83, 0.67) * E * FIRE * 1.15;
    vec4 txt = texture(uText, tq * 0.5 + 0.5);
    top = mix(top, vec3(0.20, 0.09, 0.04) * E * FIRE, txt.a);
    col = mix(col, top, smoothstep(1.0, 0.96, td));
  }
  // rosettes and strawberries around the rim
  for (int k = 0; k < 20; k++) {
    float a = float(k) / 20.0 * 6.2832;
    vec2 rc = CK + vec2(cos(a) * 0.252, sin(a) * 0.058);
    vec2 d = (p - rc) / vec2(0.016, 0.013);
    float dd = dot(d, d);
    if (dd < 1.0) {
      bool berry = (k % 2) == 1;
      vec3 n = vec3(d, sqrt(max(1.0 - dd, 0.0)));
      float sh = 0.35 + 0.65 * max(dot(n, normalize(vec3(0.0, 0.5, 0.8))), 0.0);
      vec3 c = berry ? vec3(0.75, 0.05, 0.04) : vec3(0.97, 0.55, 0.65);
      c *= E * FIRE * sh * 1.2;
      c += berry ? FIRE * E * 0.8 * smoothstep(0.25, 0.0, length(d - vec2(-0.3, 0.35))) : vec3(0.0);
      // front rosettes cover the side, back ones sit on the top
      col = mix(col, c, smoothstep(1.0, 0.8, dd));
    }
  }
  // ---- the candles: striped, lit from their own flame
  const vec3 CC[7] = vec3[7](vec3(1.0, 0.55, 0.70), vec3(0.55, 0.75, 1.0), vec3(1.0, 0.90, 0.40), vec3(0.55, 0.95, 0.70), vec3(0.80, 0.65, 1.0), vec3(0.95, 0.95, 0.92), vec3(1.0, 0.65, 0.35));
  for (int i = 0; i < 7; i++) {
    vec2 wt = uFl[i].xy;
    float body = box(p, vec2(wt.x - 0.0075, wt.y - 0.092), vec2(wt.x + 0.0075, wt.y - 0.006), 0.0012);
    if (body > 0.0) {
      float stripe = step(0.5, fract((p.y - wt.y) * 55.0 + (p.x - wt.x) * 40.0));
      vec3 cc = mix(CC[i], vec3(0.95, 0.93, 0.88), stripe);
      float lx = (p.x - wt.x) / 0.0075;
      float lit = candles(p, 9.0) * 0.06 * (0.45 + 0.55 * sqrt(max(1.0 - lx * lx, 0.0)));
      lit += uFs[i].x * 0.25 * smoothstep(wt.y - 0.05, wt.y, p.y);
      col = mix(col, cc * lit * FIRE, body);
    }
    float wick = smoothstep(0.0016, 0.0006, abs(p.x - wt.x)) * step(wt.y - 0.007, p.y) * step(p.y, wt.y + 0.003);
    col = mix(col, vec3(0.01), wick);
    col += vec3(1.0, 0.35, 0.06) * uFs[i].z * 0.9 * exp(-dot(p - wt, p - wt) / (0.0025 * 0.0025));   // a glowing ember
    // smoke rising from a blown-out wick
    float age = uFs[i].y;
    if (age > 0.0) {
      float dy = p.y - wt.y;
      float len = 0.12 * age + 0.01;
      if (dy > 0.0 && dy < len) {
        float xc = wt.x + 0.010 * sin(dy * 45.0 - age * 5.0 + float(i) * 1.7) * smoothstep(0.0, 0.05, dy) * (1.0 + dy * 9.0);
        float w = 0.0022 + dy * 0.05;
        float sx2 = (p.x - xc) / w;
        float sm = exp(-sx2 * sx2) * exp(-age / 1.5) * (1.0 - dy / len) * (0.6 + 0.4 * vnoise(vec2(p.x * 200.0, dy * 80.0 - age * 3.0)));
        col += vec3(0.05, 0.05, 0.056) * sm * (0.25 + 0.75 * smoothstep(0.0, 0.08, dy));
      }
    }
  }
  // ---- the flames, emissive
  vec3 fl = vec3(0.0);
  float smear = 0.0;
  for (int i = 0; i < 7; i++) {
    fl += flame(p, uFl[i], uFs[i].x);
    float fx = uFl[i].x + uFl[i].w * uFl[i].z * 0.3;
    float sd = (p.x - fx) / 0.0035;
    smear += uFs[i].x * exp(-sd * sd);
  }
  col += fl;

  // ---- the camcorder: CCD smear, auto-gain, noise, gamma with a knee, date stamp
  vec3 v = col * 1.6 * uGain;
  v += vec3(0.9, 0.75, 0.85) * smear * 0.030;                 // vertical smear: charge spilling down the CCD columns
  vec2 cell = floor(gl_FragCoord.xy);
  float nl = hash12(cell + fract(uField * 0.6180339) * 917.0) - 0.5;
  vec2 cc2 = floor(gl_FragCoord.xy / vec2(2.0, 1.0));
  vec2 nc = vec2(hash12(cc2 * 1.3 + fract(uField * 0.7548776) * 613.0), hash12(cc2 * 1.7 + fract(uField * 0.5698403) * 431.0)) - 0.5;
  vec3 g = pow(max(v, 0.0), vec3(0.45));
  g = mix(g, 0.85 + (g - 0.85) * 0.25, step(0.85, g));
  float na = 0.010 + 0.016 * (uGain - 1.0);
  g += nl * na * 1.6;
  g += vec3(nc.x, -0.5 * (nc.x + nc.y), nc.y) * na * 1.4;
  vec4 st = texture(uStamp, uv);
  g = mix(g, st.rgb, st.a);
  o = vec4(clamp(g, 0.0, 1.1), 1.0);
}`;
