/*
 * 22 · the summer scene that the Super 8 camera "shoots" — one fragment shader that writes linear scene
 * radiance (RGBA16F, sky ≈ 0.1–0.5, sun disc ≈ 350, glints ≈ 10–80) for ONE film frame. The film and the
 * projector (main.js / film.js) never see anything but this texture.
 *
 * Geometry lives in two spaces:
 *   - the world (y up, z out to sea, camera 1.6 m above the sand) for sky, sea, waves, foam and beach;
 *   - a fixed "billboard plane" (gnomonic projection around the direction F0) for things far enough away that
 *     only their direction matters: the sun, the palm, the kite and its tail, gulls, a sail on the horizon.
 * Everything is a function of the uniforms, and every uniform is a function of the film frame index.
 */

// the billboard plane: centred on azimuth 0.12 rad, elevation 0.22 rad
const AZ0 = 0.12, EL0 = 0.22;
export const F0 = [Math.cos(EL0) * Math.sin(AZ0), Math.sin(EL0), Math.cos(EL0) * Math.cos(AZ0)];
export const R0 = [Math.cos(AZ0), 0, -Math.sin(AZ0)];
export const U0 = [F0[1] * R0[2] - F0[2] * R0[1], F0[2] * R0[0] - F0[0] * R0[2], F0[0] * R0[1] - F0[1] * R0[0]];
export const SUN_P = [0.14, 0.14];          // the sun in plane coordinates (≈ az 15°, el 21°)
export const CROWN = [-0.12, 0.2];          // the palm crown
export const KITE_H = 0.034;                // kite half-height unit (plane units ≈ radians)
export const planeDir = ([x, y]) => {
  const d = [F0[0] + x * R0[0] + y * U0[0], F0[1] + x * R0[1] + y * U0[1], F0[2] + x * R0[2] + y * U0[2]];
  const l = Math.hypot(...d);
  return d.map((v) => v / l);
};
const v3 = (a) => `vec3(${a.map((x) => x.toFixed(7)).join(', ')})`;
const v2 = (a) => `vec2(${a.map((x) => x.toFixed(5)).join(', ')})`;

export const SCENE_FS = `#version 300 es
precision highp float;
uniform vec2 res;
uniform float ts, uFrame, uFov;
uniform mat3 uCam;          // columns: right, up, forward
uniform vec3 uKite;         // plane x, plane y, roll angle
uniform vec2 uTail[14];     // tail points (plane coords), computed from the kite's past path
uniform vec2 uSunUV;        // where the sun falls in this frame (uv, may be outside 0..1)
out vec4 o;

const float PI = 3.14159265;
const vec3 F0 = ${v3(F0)}, R0 = ${v3(R0)}, U0 = ${v3(U0)};
const vec2 SUN_P = ${v2(SUN_P)};
const vec2 CROWN = ${v2(CROWN)};
const float KH = ${KITE_H.toFixed(4)};
const float CAM_H = 1.6;
const float SUN_R = 0.0050;           // angular radius of the sun disc
vec3 SUN;

// ---------- noise ----------
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 5.3; a *= 0.5; }
  return s;
}
uint hu(uint x) { x ^= x >> 16; x *= 0x7feb352du; x ^= x >> 15; x *= 0x846ca68bu; x ^= x >> 16; return x; }

// ---------- sky ----------
vec3 skyRad(vec3 d) {
  float el = max(d.y, 0.0);
  float h = 1.0 - el;
  vec3 c = mix(vec3(0.070, 0.150, 0.400), vec3(0.330, 0.430, 0.540), h * h * h * h);
  c = mix(c, vec3(0.47, 0.51, 0.54), exp(-el * 28.0) * 0.55);              // summer haze on the horizon
  float ang = acos(clamp(dot(d, SUN), -1.0, 1.0));
  c += vec3(1.0, 0.86, 0.62) * (0.10 * exp(-ang * 3.0) + 0.50 * exp(-ang * 13.0) + 2.4 * exp(-ang * 75.0));
  return c;
}
vec3 skyFull(vec3 d, float aa) {
  vec3 c = skyRad(d);
  // low summer cumulus along the horizon, back-lit: grey cores, bright edges toward the sun
  float el = d.y;
  if (el < 0.32) {
    float az = atan(d.x, d.z);
    vec2 q = vec2(az * 4.2 + ts * 0.010, el * 12.0);
    float n = fbm(q + 0.7 * fbm(q * 1.9 + 3.0));
    float band = smoothstep(0.30, 0.04, el) * smoothstep(-0.005, 0.03, el);
    float cov = smoothstep(0.47, 0.70, n * (0.62 + 0.55 * band)) * band;
    float edge = 1.0 - smoothstep(0.50, 0.85, n);
    float ang = acos(clamp(dot(d, SUN), -1.0, 1.0));
    vec3 cc = vec3(0.36, 0.37, 0.41) + vec3(1.0, 0.88, 0.70) * edge * (0.18 + 2.2 * exp(-ang * 3.5));
    c = mix(c, cc, cov * 0.92);
  }
  // the sun disc with limb darkening
  float ang = acos(clamp(dot(d, SUN), -1.0, 1.0));
  float r = ang / SUN_R;
  float disc = smoothstep(1.0 + aa / SUN_R, 1.0 - aa / SUN_R, r);
  c += vec3(1.0, 0.93, 0.80) * 350.0 * disc * (0.6 + 0.4 * sqrt(max(1.0 - min(r * r, 1.0), 0.0)));
  return c;
}

// ---------- sea, surf and sand ----------
// 7 directional waves travelling toward the shore (-z). Waves shorter than the pixel footprint are faded out and
// their slope variance moves into the "unresolved roughness" that widens the sun glitter (Cox–Munk style).
const vec3 WAVES[7] = vec3[7](vec3(14.0, 0.17, 0.10), vec3(8.5, 0.085, -0.30), vec3(5.1, 0.050, 0.45), vec3(3.0, 0.026, -0.60),
                              vec3(1.7, 0.014, 0.80), vec3(0.9, 0.0065, -0.20), vec3(0.5, 0.0032, 0.60));
vec3 seaNormal(vec2 x, float fp, out float var) {
  vec2 g = vec2(0.0);
  var = 0.0035;
  for (int i = 0; i < 7; i++) {
    float lam = WAVES[i].x, A = WAVES[i].y;
    vec2 dir = normalize(vec2(WAVES[i].z, -1.0));
    float k = 2.0 * PI / lam, w = sqrt(9.81 * k);
    float ph = dot(dir, x) * k - w * ts + float(i) * 1.7;
    float vis = smoothstep(2.0 * fp, 5.0 * fp, lam);
    float s = A * k;
    g += vis * s * cos(ph) * dir;
    var += (1.0 - vis) * 0.5 * s * s;
  }
  // a little wind chop
  g += 0.05 * (vec2(vnoise(x * 1.3 + ts * 0.7), vnoise(x * 1.3 - 4.0 - ts * 0.6)) - 0.5) * smoothstep(3.0 * fp, 8.0 * fp, 0.8);
  return normalize(vec3(-g.x, 1.0, -g.y));
}

vec3 sea(vec3 d, float pixAng, vec2 frag) {
  float dist = CAM_H / max(-d.y, 1e-4);
  vec2 P = d.xz * dist;
  float fp = dist * pixAng * max(dist / CAM_H, 1.0);
  // the surf cycle (period 5 s): a breaker rolls in, the swash runs up the sand and drains back
  float ph = fract(ts / 5.0 + 0.035 * sin(P.x * 0.4));
  float runup = 8.7 - 1.7 * (ph < 0.28 ? smoothstep(0.0, 0.28, ph) : 1.0 - smoothstep(0.28, 1.0, ph));
  float zw = runup + 0.25 * sin(P.x * 0.7 + 2.0) + 0.12 * sin(P.x * 2.3);
  vec3 col;
  if (P.y < zw) {
    // sand: dry above the highest run-up, dark and mirror-wet below it
    float wet = smoothstep(6.6, 7.4, P.y);
    float tex = 0.85 + 0.25 * fbm(P * vec2(3.0, 5.0)) + 0.06 * vnoise(P * 40.0);
    vec3 dry = vec3(0.60, 0.50, 0.36) * 0.85 * tex;
    vec3 n = normalize(vec3(0.03 * (vnoise(P * 6.0) - 0.5), 1.0, 0.03 * (vnoise(P * 6.0 + 9.0) - 0.5)));
    vec3 r = reflect(d, n);
    float hv = max(dot(normalize(SUN - d), n), 1e-3);
    float tan2 = (1.0 - hv * hv) / (hv * hv);
    vec3 wetc = dry * 0.48 + skyRad(vec3(r.x, abs(r.y), r.z)) * 0.22 + vec3(1.0, 0.9, 0.75) * 9.0 * exp(-tan2 / 0.012);
    col = mix(dry, wetc, wet);
    // the edge of the receding swash leaves a thin bright film and lace foam
    float film = smoothstep(zw - 0.9, zw, P.y);
    col = mix(col, col * 0.7 + skyRad(vec3(r.x, abs(r.y), r.z)) * 0.3, film * wet);
    float lace = smoothstep(0.08, 0.0, zw - P.y) * smoothstep(0.35, 0.65, fbm(P * vec2(4.0, 9.0) + ts));
    col = mix(col, vec3(0.80, 0.80, 0.77), lace * 0.85);
  } else {
    float var;
    vec3 n = seaNormal(P, fp, var);
    float cv = max(dot(-d, n), 0.0);
    float F = 0.02 + 0.98 * pow(clamp(1.0 - cv, 0.0, 1.0), 5.0);
    vec3 r = reflect(d, n);
    vec3 refl = skyRad(vec3(r.x, abs(r.y), r.z));
    float shallow = smoothstep(zw + 6.0, zw, P.y);
    vec3 body = mix(vec3(0.010, 0.040, 0.050), vec3(0.06, 0.17, 0.15), shallow);
    col = mix(body, refl, F);
    // sun glitter: probability that a facet tilts the sun into the lens, then discrete sparkles that change every frame
    vec3 hh = normalize(SUN - d);
    float ch = max(dot(hh, n), 1e-3);
    float tan2 = (1.0 - ch * ch) / (ch * ch);
    float sig2 = var * 2.0;
    float glit = exp(-tan2 / sig2) * min(0.03 / sig2, 4.0) * (0.6 + 4.0 * F);
    vec2 cell = floor(frag / vec2(3.0, 1.6));
    uint hh2 = hu(uint(int(cell.x) + 4096) * 73856093u ^ uint(int(cell.y) + 4096) * 19349663u ^ uint(uFrame) * 83492791u);
    vec3 rr = vec3(uvec3(hh2, hh2 >> 8, hh2 >> 16) & 255u) / 255.0;
    vec2 dp = (frag - (cell + rr.xy) * vec2(3.0, 1.6)) / vec2(1.3, 0.7);
    float spark = pow(rr.z, 14.0) * exp(-dot(dp, dp));
    col += vec3(1.0, 0.92, 0.78) * glit * (0.45 + 70.0 * spark);
    // breakers: one line per surf cycle, foaming as it reaches the shallows
    float zb = zw + 14.0 * (1.0 - ph) + 0.5 * sin(P.x * 0.33 + 1.0) + 0.3 * sin(P.x * 0.9);
    float behind = P.y - zb;
    float foamAmt = smoothstep(15.0 + zw * 0.0, zw + 4.0, zb) * smoothstep(-0.25, 0.0, behind) * exp(-max(behind, 0.0) / (0.5 + 1.8 * (1.0 - ph)));
    float lacy = smoothstep(0.30, 0.62, fbm(P * vec2(1.8, 4.0) + vec2(0.0, ts * 0.4)));
    col = mix(col, vec3(0.85, 0.85, 0.82), clamp(foamAmt * (0.35 + 0.8 * lacy), 0.0, 1.0) * smoothstep(60.0, 20.0, dist));
    // the run-up itself: a frothy leading edge
    float edge = smoothstep(0.5, 0.0, P.y - zw) * smoothstep(0.3, 0.7, fbm(P * vec2(5.0, 10.0) - ts));
    col = mix(col, vec3(0.82, 0.82, 0.79), edge * 0.8);
  }
  // aerial perspective toward the horizon
  col = mix(col, vec3(0.46, 0.50, 0.54), 1.0 - exp(-dist / 900.0));
  return col;
}

// ---------- billboard objects (plane coordinates) ----------
float sdSeg(vec2 p, vec2 a, vec2 b, out float h) {
  vec2 pa = p - a, ba = b - a;
  h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
vec2 bez(vec2 a, vec2 b, vec2 c, float t) { return mix(mix(a, b, t), mix(b, c, t), t); }

// fronds: circular arcs from the crown, drooping; leaflets are slanted stripes along the arc (a comb)
const float FA[11] = float[11](168.0, 145.0, 121.0, 97.0, 75.0, 50.0, 22.0, -8.0, -38.0, 200.0, 228.0);
const float FL[11] = float[11](0.20, 0.24, 0.21, 0.17, 0.21, 0.25, 0.28, 0.26, 0.21, 0.22, 0.18);
const float FK[11] = float[11](2.6, 2.3, 2.0, 1.4, 1.9, 2.3, 2.5, 2.8, 3.1, 2.9, 3.3);
// returns (coverage, leaflet share of it)
vec2 frond(vec2 p, int i, float aa) {
  float fi = float(i);
  float gust = 0.6 + 0.4 * sin(ts * 0.9 + 1.3);
  float a = radians(FA[i]) + gust * (0.05 * sin(ts * 1.7 + fi * 1.3) + 0.025 * sin(ts * 3.9 + fi * 2.7));
  float L = FL[i];
  float k = FK[i] * (1.0 + 0.12 * gust * sin(ts * 2.1 + fi));
  vec2 t0 = vec2(cos(a), sin(a));
  float sg = t0.x >= 0.0 ? 1.0 : -1.0;
  vec2 nb = sg * vec2(t0.y, -t0.x);
  float R = 1.0 / k;
  vec2 v = p - (CROWN + nb * R);
  float r = length(v);
  float w = atan(-nb.y, -nb.x) - atan(v.y, v.x);
  w -= 2.0 * PI * floor((w + PI) / (2.0 * PI));
  float u = sg * w * R;
  float sp = u / L;
  if (sp < -0.03 || sp > 1.05) return vec2(0.0);
  float off = r - R;
  float ao = abs(off);
  float spc = clamp(sp, 0.0, 1.0);
  float rw = mix(0.0030, 0.0007, spc);
  float rach = smoothstep(rw + aa, rw - aa, ao) * smoothstep(-0.02, 0.0, sp) * smoothstep(1.03, 0.98, sp);
  float Lf = (0.050 * pow(max(sin(PI * min(spc * 0.9 + 0.08, 1.0)), 0.0), 0.6) + 0.004) * (off < 0.0 ? 1.0 : 0.62);
  float spacing = 0.0078;
  float q = (u - ao * 0.9) / spacing + fi * 0.37 + 0.25 * sin(ts * 7.0 + u * 35.0 + fi) * (ao / 0.05);
  float lfrac = clamp(ao / Lf, 0.0, 1.0);
  float duty = 0.40 * (1.0 - lfrac * lfrac) + 0.05;
  float fq = abs(fract(q) - 0.5) * 2.0;
  float dq = aa * 1.4 / spacing + 0.02;
  float leaf = smoothstep(duty + dq, duty - dq, fq) * smoothstep(Lf + aa, Lf - aa, ao) * step(0.0, sp) * smoothstep(1.02, 0.97, sp);
  float c = max(rach, leaf);
  return vec2(c, c > 0.0 ? leaf * (1.0 - rach) / c : 0.0);
}

// the palm as a light filter: rgb transmission (leaflets glow green-gold when the sun is behind them) + own light
vec3 palmTrans(vec2 p, float aa, out float cover) {
  vec3 tr = vec3(1.0);
  cover = 0.0;
  // trunk: quadratic Bézier, tapered, with ring bumps
  vec2 A = vec2(-0.47, -0.95), B = vec2(-0.36, -0.15), C = CROWN + vec2(0.0, -0.01);
  if (p.x < 0.0 && p.y < C.y + 0.03) {
    float best = 1e9, tb = 0.0;
    vec2 prev = A;
    for (int i = 1; i <= 12; i++) {
      vec2 cur = bez(A, B, C, float(i) / 12.0);
      float h;
      float dd = sdSeg(p, prev, cur, h);
      if (dd < best) { best = dd; tb = (float(i) - 1.0 + h) / 12.0; }
      prev = cur;
    }
    float w = mix(0.021, 0.011, tb) + 0.0012 * smoothstep(0.5, 1.0, sin(tb * 150.0));
    float c = smoothstep(w + aa, w - aa, best);
    tr *= 1.0 - c;
    cover = max(cover, c);
  }
  // crown, coconuts
  float dc = min(length((p - CROWN) / vec2(1.0, 0.8)) - 0.017,
             min(length(p - CROWN - vec2(-0.008, -0.017)) - 0.0075, min(length(p - CROWN - vec2(0.007, -0.020)) - 0.007, length(p - CROWN - vec2(0.0, -0.011)) - 0.0075)));
  float cc = smoothstep(aa, -aa, dc);
  tr *= 1.0 - cc;
  cover = max(cover, cc);
  if (length(p - CROWN) < 0.36) {
    for (int i = 0; i < 11; i++) {
      vec2 f = frond(p, i, aa);
      if (f.x <= 0.0) continue;
      tr *= (1.0 - f.x) + f.x * f.y * vec3(0.10, 0.13, 0.022);
      cover = max(cover, f.x);
    }
  }
  return tr;
}

// the kite: a back-lit diamond of red and yellow sailcloth on two spars, its streamer tail and its line
mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
vec3 kiteTrans(vec2 p, float aa, out vec3 emit, out float cover) {
  vec3 tr = vec3(1.0);
  emit = vec3(0.0);
  cover = 0.0;
  vec2 K = uKite.xy;
  mat2 R = rot2(uKite.z);
  // line from the bridle to the flyer below the bottom-left of the frame, sagging
  vec2 b0 = K + R * vec2(0.0, -0.15 * KH);
  vec2 g = vec2(-0.78, -1.15);
  vec2 m = mix(b0, g, 0.5) + vec2(0.05, -0.05);
  float dl = 1e9;
  vec2 prev = b0;
  for (int i = 1; i <= 8; i++) {
    vec2 cur = bez(b0, m, g, float(i) / 8.0);
    float h;
    dl = min(dl, sdSeg(p, prev, cur, h));
    prev = cur;
  }
  float lw = 0.0005;
  float lc = smoothstep(lw + aa, lw - aa, dl) * min(lw * 2.0 / aa, 1.0);
  tr *= 1.0 - lc * 0.8;
  emit += vec3(0.40, 0.38, 0.33) * lc * 0.5;
  // tail
  float dt = 1e9, seg = 0.0;
  for (int i = 1; i < 14; i++) {
    float h;
    float dd = sdSeg(p, uTail[i - 1], uTail[i], h);
    if (dd < dt) { dt = dd; seg = float(i - 1) + h; }
  }
  float tw = 0.0028 * (1.0 - seg / 16.0);
  float tc = smoothstep(tw + aa, tw - aa, dt);
  vec3 tcol = mod(floor(seg * 1.5), 2.0) < 1.0 ? vec3(0.05, 0.10, 0.40) : vec3(0.32, 0.30, 0.26);
  // bows every third point
  for (int i = 3; i < 14; i += 3) {
    vec2 dir = normalize(uTail[i] - uTail[i - 1]);
    vec2 lp = p - uTail[i];
    vec2 l2 = vec2(dot(lp, dir), dot(lp, vec2(-dir.y, dir.x)));
    float bow = abs(l2.y) / 0.010 + abs(l2.x) / (0.0015 + 0.004 * abs(l2.y) / 0.010) - 1.0;
    float bc = smoothstep(0.15, -0.15, bow);
    tc = max(tc, bc);
    tcol = mix(tcol, vec3(0.45, 0.04, 0.03), bc);
  }
  tr *= (1.0 - tc) + tc * tcol;
  cover = max(cover, tc);
  // the sail
  vec2 lp = transpose(R) * (p - K) / KH;
  float e = abs(lp.x) / 0.62 + (lp.y > 0.25 ? (lp.y - 0.25) / 0.52 : (0.25 - lp.y) / 1.27) - 1.0;
  float sc = smoothstep(aa / KH * 1.6, -aa / KH * 1.6, e * 0.45);
  if (sc > 0.0) {
    bool red = (lp.x < 0.0) == (lp.y > 0.25);
    vec3 fab = red ? vec3(0.42, 0.035, 0.02) : vec3(0.46, 0.32, 0.03);
    float wr = 0.85 + 0.15 * sin(lp.x * 9.0 + lp.y * 4.0 + ts * 13.0);
    float spar = max(smoothstep(0.045 + aa / KH, 0.045 - aa / KH, abs(lp.x)), smoothstep(0.04 + aa / KH, 0.04 - aa / KH, abs(lp.y - 0.25)) * step(abs(lp.x), 0.62));
    vec3 t = fab * wr * (1.0 - 0.9 * spar);
    tr *= (1.0 - sc) + sc * t;
    emit += sc * (red ? vec3(0.05, 0.006, 0.004) : vec3(0.05, 0.04, 0.006));
    cover = max(cover, sc);
  }
  return tr;
}

// gulls: two slow gliders with flapping, bent wings
float gull(vec2 p, vec2 c, float s, float flap, float aa) {
  vec2 q = (p - c) / s;
  q.x = abs(q.x);
  vec2 elbow = vec2(0.45, 0.18 + 0.25 * flap), tip = vec2(1.0, -0.05 + 0.9 * flap);
  float h1, h2;
  float d = min(sdSeg(q, vec2(0.0), elbow, h1) - 0.09 * (1.0 - 0.4 * h1), sdSeg(q, elbow, tip, h2) - 0.06 * (1.0 - 0.8 * h2));
  return smoothstep(aa / s, -aa / s, d);
}

void main() {
  SUN = normalize(F0 + SUN_P.x * R0 + SUN_P.y * U0);
  vec2 uv = gl_FragCoord.xy / res;
  vec2 q = (uv - 0.5) * 2.0 * vec2(res.x / res.y, 1.0) * uFov;
  vec3 d = normalize(uCam * vec3(q, 1.0));
  float pixAng = 2.0 * uFov / res.y;
  float den = max(dot(d, F0), 0.05);
  vec2 P = vec2(dot(d, R0), dot(d, U0)) / den;
  float aa = pixAng / den * 0.9;

  vec3 col = d.y > 0.0 ? skyFull(d, pixAng) : sea(d, pixAng, gl_FragCoord.xy);
  // the horizon line is anti-aliased by blending the two sides across a pixel
  float hz = d.y / pixAng;
  if (abs(hz) < 1.0) col = mix(sea(vec3(d.x, -pixAng * 0.5, d.z), pixAng, gl_FragCoord.xy), skyFull(vec3(d.x, pixAng * 0.5, d.z), pixAng), hz * 0.5 + 0.5);

  // a sail on the horizon
  vec2 sb = P - vec2(-0.075, -tan(${EL0.toFixed(4)}));
  float sail = smoothstep(aa, -aa, max(max(-sb.x, -sb.y), (sb.x / 0.0055 + sb.y / 0.011 - 1.0) * 0.004));
  col = mix(col, vec3(0.62, 0.60, 0.55), sail);
  float hull = smoothstep(aa, -aa, max(abs(sb.x - 0.002) - 0.006, abs(sb.y + 0.0006) - 0.0007));
  col = mix(col, vec3(0.05, 0.05, 0.06), hull);

  // gulls
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    vec2 gc = vec2(-0.40 + 0.034 * ts + 0.06 * fi, 0.10 - 0.035 * fi + 0.012 * sin(ts * 0.6 + fi * 2.0));
    float flap = 0.5 * sin(ts * 7.5 + fi * 2.4) * (0.5 + 0.5 * sin(ts * 0.8 + fi));
    float gcov = gull(P, gc, 0.011 - 0.003 * fi, flap, aa);
    col = mix(col, vec3(0.035, 0.035, 0.04), gcov);
  }

  // the kite (line, tail, sail) then the palm in front of everything
  vec3 emit;
  float cov;
  vec3 kt = kiteTrans(P, aa, emit, cov);
  col = col * kt + emit;
  vec3 pt = palmTrans(P, aa, cov);
  col = col * pt + vec3(0.016, 0.017, 0.010) * cov;

  // lens: how much of the sun gets past the fronds and the kite (evaluated at the sun, blurred by its size)
  float c1, c2;
  vec3 e2;
  vec3 vis3 = palmTrans(SUN_P, SUN_R, c1) * kiteTrans(SUN_P, SUN_R, e2, c2);
  float vis = clamp(dot(vis3, vec3(0.333)), 0.0, 1.0);
  // ghosts of the iris (a 2-blade Super 8 diamond aperture) mirrored through the frame centre, and a faint star
  vec2 asp = vec2(res.x / res.y, 1.0);
  float inFrame = smoothstep(0.9, 0.1, max(abs(uSunUV.x - 0.5), abs(uSunUV.y - 0.5)) - 0.5);
  float gAmt = vis * inFrame;
  if (gAmt > 0.001) {
    vec2 axis = uSunUV - 0.5;
    const vec4 GH[5] = vec4[5](vec4(-0.35, 0.045, 0.08, 0.0), vec4(-0.70, 0.085, 0.05, 1.0), vec4(-1.10, 0.035, 0.12, 2.0), vec4(0.45, 0.022, 0.10, 3.0), vec4(-1.60, 0.14, 0.025, 4.0));
    for (int i = 0; i < 5; i++) {
      vec2 gp = 0.5 + axis * GH[i].x;
      vec2 dd = (uv - gp) * asp;
      dd = mat2(0.7071, 0.7071, -0.7071, 0.7071) * dd;
      float sd = (abs(dd.x) + abs(dd.y)) / GH[i].y;
      float shape = smoothstep(1.0, 0.86, sd) * (0.55 + 0.45 * smoothstep(0.6, 1.0, sd));
      vec3 tint = GH[i].w < 0.5 ? vec3(0.55, 0.95, 0.45) : GH[i].w < 1.5 ? vec3(0.95, 0.45, 0.85) : GH[i].w < 2.5 ? vec3(1.0, 0.70, 0.30) : GH[i].w < 3.5 ? vec3(0.45, 0.70, 1.0) : vec3(0.40, 0.60, 1.0);
      col += tint * shape * GH[i].z * gAmt;
    }
    vec2 ds = (uv - uSunUV) * asp;
    vec2 dr = mat2(0.7071, 0.7071, -0.7071, 0.7071) * ds;
    float star = exp(-abs(dr.x) * 900.0) * exp(-abs(dr.y) * 9.0) + exp(-abs(dr.y) * 900.0) * exp(-abs(dr.x) * 9.0);
    col += vec3(1.0, 0.9, 0.75) * star * 1.6 * gAmt;
    col += vec3(1.0, 0.85, 0.65) * 0.06 * gAmt * exp(-length(ds) * 3.0);     // veiling glare
  }
  o = vec4(max(col, 0.0), 1.0);
}`;
