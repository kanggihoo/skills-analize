/*
 * 46-letterpress/shader.js — one ray-cast fragment shader for a small clamshell platen press, seen from above.
 *
 * World: x right, y up the screen, z toward the camera, units = stage px (1 mm ≈ 8.7 px). The bed is z = 0;
 * the forme (height map uF, ray-marched) stands in the upper half, type-high = 200; the platen is a box that
 * swings about the hinge line y = 940 (angle uPhi: 0 = open, lying in the lower half, π = closed on the forme).
 * The sheet sits on the platen, so a sheet point (u, v) meets the forme at (u, 940 + v): the forme is the
 * mirror image of the print across the hinge, exactly as the type reads mirrored in a real chase.
 *   forme: metal sorts (face, beard, shoulder), quads, leads, wooden furniture, iron chase; ink film laid by
 *          two rollers in two passes (streaks along the roller, a dry band once per revolution)
 *   print: ink = film × contact, mottled where thin ink lands only on fibre tops; squeeze rim inside the edge,
 *          faint halo outside; Beer–Lambert colour so thick ink is deeper. Relief: the paper's height field
 *          (tight wrap + broad sink + fibres + cockle) lit by a key light and a low raking light with
 *          marched shadows inside the impression.
 */
export const VERT = `#version 300 es
layout(location = 0) in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export const FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uF, uP;
uniform vec2 uRes;
uniform vec3 uEye, uFwd, uRight, uUp;
uniform float uFocal, uPhi, uImp, uTransfer, uKeyI, uFrame;
uniform vec4 uRoll;            // lower roller y, spacing, spin (rad), visible
uniform vec4 uFront, uOn;      // roller contact lines: pass 1 (A, B, moving down), pass 2 (A, B, moving up)
uniform vec4 uRake;            // direction to the raking lamp (xyz), intensity
uniform vec3 uSpot;            // the lamp's pool of light on the sheet: centre x, y, radius
uniform vec4 uHick[3];
out vec4 o;
float gLod = 0.0;     // mip level for shading lookups, from the hit distance (no derivatives inside branches)

const float YH = 940.0, TH = 200.0, PS = 7.0, PT = 70.0, RR = 58.0;
const vec4 SHEET = vec4(100.0, 40.0, 880.0, 800.0);       // u0, v0, width, height (platen-local)
const vec4 PLAT = vec4(70.0, 20.0, 1010.0, 870.0);        // u0, v0, u1, v1
const vec4 CHASE = vec4(70.0, 960.0, 1010.0, 1810.0);     // x0, y0, x1, y1 (world)
const vec3 KEYC = vec3(1.0, 0.94, 0.86);
const vec3 AMB = vec3(0.085, 0.09, 0.105);
const vec3 INK_ABS = vec3(0.25, 3.6, 3.4);                 // vermilion: absorbs green and blue
const float PI = 3.14159265;

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s / 0.9375; }

// ---------------------------------------------------------------- geometry
vec3 pD() { return vec3(0.0, -cos(uPhi), sin(uPhi)); }      // along the platen, away from the hinge
vec3 pN() { return vec3(0.0, sin(uPhi), cos(uPhi)); }       // platen face normal
const vec3 HINGE = vec3(0.0, YH, TH + PS);
vec2 formeTC(vec2 p) { return (p - vec2(SHEET.x, YH + SHEET.y)) / SHEET.zw; }
float hAt(vec2 p) {
  vec2 tc = formeTC(p);
  if (tc.x >= 0.0 && tc.x <= 1.0 && tc.y >= 0.0 && tc.y <= 1.0) return textureLod(uF, tc, 0.0).r * TH;
  if (p.x >= CHASE.x && p.x <= CHASE.z && p.y >= CHASE.y && p.y <= CHASE.w) return 0.62 * TH;
  return 0.0;
}
// slab test; returns entry t (or -1) and the axis of entry
float boxHit(vec3 o, vec3 r, vec3 bmin, vec3 bmax, out int axis) {
  vec3 inv = 1.0 / (r + vec3(equal(r, vec3(0.0))) * 1e-7);
  vec3 t0 = (bmin - o) * inv, t1 = (bmax - o) * inv;
  vec3 tn = min(t0, t1), tf = max(t0, t1);
  float a = max(max(tn.x, tn.y), tn.z), b = min(min(tf.x, tf.y), tf.z);
  axis = tn.x >= tn.y && tn.x >= tn.z ? 0 : (tn.y >= tn.z ? 1 : 2);
  return (b >= max(a, 0.0)) ? max(a, 0.0) : -1.0;
}
// a cylinder along x: centre (y, z), radius, x range
float cylHit(vec3 ro, vec3 rd, vec2 c, float R, vec2 xr) {
  vec2 oc = ro.yz - c, d = rd.yz;
  float a = dot(d, d), b = dot(oc, d), cc = dot(oc, oc) - R * R;
  float disc = b * b - a * cc;
  if (disc < 0.0 || a < 1e-9) return -1.0;
  float t = (-b - sqrt(disc)) / a;
  if (t < 0.0) return -1.0;
  float x = ro.x + rd.x * t;
  return (x >= xr.x && x <= xr.y) ? t : -1.0;
}
// platen in its own frame: (u, v, w) = (x, along, normal)
void toPlaten(vec3 ro, vec3 rd, out vec3 o, out vec3 r) {
  vec3 d = pD(), n = pN(), rel = ro - HINGE;
  o = vec3(rel.x, dot(rel, d), dot(rel, n));
  r = vec3(rd.x, dot(rd, d), dot(rd, n));
}

// ---------------------------------------------------------------- ink
// film left on the type faces by the four roller contacts (or by all of them: the film at the moment of printing)
float film(vec2 p, bool all) {
  float keep = 1.0;
  for (int j = 0; j < 4; j++) {
    float on = all ? 1.0 : uOn[j];
    float fr = uFront[j];
    float passed = j < 2 ? smoothstep(fr - 4.0, fr + 4.0, p.y) : smoothstep(fr + 4.0, fr - 4.0, p.y);
    if (all) passed = 1.0;
    float fj = float(j);
    // ink ridges along the roller, and a dry band that comes round once per revolution (2πR)
    float dep = 0.36 * (1.0 + 0.5 * (noise(vec2(p.x * 0.03, fj * 3.1)) - 0.5) + 0.25 * (noise(vec2(p.x * 0.22, fj * 7.7)) - 0.5));
    float ph = (p.y - 37.0 * fj) / (2.0 * PI * RR);
    float dry = smoothstep(0.78, 0.97, 0.5 + 0.5 * cos(ph * 2.0 * PI)) * smoothstep(0.35, 0.7, noise(vec2(p.x * 0.012 + fj, 2.0)));
    dep *= 1.0 - 0.75 * dry;
    keep *= 1.0 - clamp(dep, 0.0, 1.0) * passed * on;
  }
  return 1.0 - keep;
}

// ---------------------------------------------------------------- lighting
float shadowKey(vec3 P, vec3 L) {
  int ax;
  vec3 o, r;
  toPlaten(P + L * 0.5, L, o, r);
  if (boxHit(o, r, vec3(PLAT.x, PLAT.y, -PT), vec3(PLAT.z, PLAT.w, PS), ax) > 0.0) return 0.0;
  if (uRoll.w > 0.5) {
    if (cylHit(P + L * 0.5, L, vec2(uRoll.x, TH + RR), RR, vec2(80.0, 1000.0)) > 0.0) return 0.0;
    if (cylHit(P + L * 0.5, L, vec2(uRoll.x + uRoll.y, TH + RR), RR, vec2(80.0, 1000.0)) > 0.0) return 0.0;
  }
  // the forme shadows itself (type faces onto shoulders and quads)
  float sh = 1.0;
  if (P.x > CHASE.x - 300.0 && P.x < CHASE.z + 300.0 && P.y > CHASE.y - 300.0 && P.y < CHASE.w + 300.0) {
    float s = 1.5;
    for (int i = 0; i < 14; i++) {
      vec3 q = P + L * s;
      if (q.z > TH + 1.0) break;
      sh = min(sh, clamp((q.z - hAt(q.xy)) / (0.18 * s) + 0.5, 0.0, 1.0));
      s *= 1.45;
    }
  }
  return sh;
}
vec3 keyDir() { return normalize(vec3(-0.5, 0.62, 0.62)); }
vec3 lit(vec3 P, vec3 n, vec3 V, vec3 alb, float spec, float gloss, float ao, float shK, float rakeSh) {
  vec3 L = keyDir();
  vec3 c = alb * AMB * ao;
  float ndl = max(dot(n, L), 0.0);
  vec3 H = normalize(L + V);
  float fr = 0.04 + 0.96 * pow(clamp(1.0 - dot(V, H), 0.0, 1.0), 5.0);
  c += KEYC * uKeyI * shK * (alb * ndl + spec * fr * pow(max(dot(n, H), 0.0), gloss) * ndl * (gloss + 8.0) / 40.0);
  if (uRake.w > 0.0) {
    vec3 R = uRake.xyz;
    float pool = exp(-dot(P.xy - uSpot.xy, P.xy - uSpot.xy) / (uSpot.z * uSpot.z));
    float ndr = max(dot(n, R), 0.0);
    vec3 Hr = normalize(R + V);
    c += vec3(1.0, 0.9, 0.76) * uRake.w * pool * rakeSh * (alb * ndr + spec * pow(max(dot(n, Hr), 0.0), gloss) * ndr * 0.3);
  }
  return c;
}

// ---------------------------------------------------------------- surfaces
vec3 shadeForme(vec3 P, vec3 V) {
  vec2 tc = formeTC(P.xy);
  bool inF = tc.x >= 0.0 && tc.x <= 1.0 && tc.y >= 0.0 && tc.y <= 1.0;
  vec3 n = vec3(0.0, 0.0, 1.0);
  vec3 alb; float spec = 0.04, gloss = 16.0, ao = 1.0;
  if (inF) {
    vec4 F = textureLod(uF, tc, gLod);
    vec4 Q = textureLod(uP, tc, gLod);
    float k = exp2(gLod);
    vec2 e = k / vec2(@TW@.0, @THx@.0);
    float hx = textureLod(uF, tc + vec2(e.x, 0.0), gLod).r - textureLod(uF, tc - vec2(e.x, 0.0), gLod).r;
    float hy = textureLod(uF, tc + vec2(0.0, e.y), gLod).r - textureLod(uF, tc - vec2(0.0, e.y), gLod).r;
    n = normalize(vec3(-hx * TH * @S@.0 * 0.5 / k, -hy * TH * @S@.0 * 0.5 / k, 1.0));
    ao = 0.35 + 0.65 * Q.a;
    float h = F.r, rnd = F.a, sd = (F.b - 0.5) * 12.0;
    if (h > 0.95) {
      // metal sort: face, beard and shoulder; old type is stained dark round the faces
      vec3 metal = vec3(0.30, 0.31, 0.33) * (0.85 + 0.3 * rnd);
      float stain = smoothstep(-4.0, 0.0, sd) * (1.0 - F.g) * 0.8 + smoothstep(0.6, 0.9, noise(P.xy * 0.4 + rnd * 40.0)) * 0.3;
      alb = mix(metal, vec3(0.05, 0.02, 0.02), stain);
      spec = 0.5; gloss = mix(18.0, 90.0, F.g);
      // fresh ink on the face (and a little on the very top of the beard)
      float f = film(P.xy, false) * uTransfer * smoothstep(0.985, 0.998, h);
      if (f > 0.0) {
        float peel = 0.85 + 0.3 * noise(P.xy * 1.7);
        vec3 inkC = exp(-INK_ABS * f * 2.6 * peel) * vec3(0.55, 0.5, 0.48);
        alb = mix(alb, inkC, smoothstep(0.0, 0.15, f));
        spec = mix(spec, 0.9, smoothstep(0.0, 0.2, f)); gloss = mix(gloss, 160.0, smoothstep(0.0, 0.2, f));
        n = normalize(n + vec3(noise(P.xy * 0.9) - 0.5, noise(P.xy * 0.9 + 7.0) - 0.5, 0.0) * 0.06 * f);
      }
    } else if (h > 0.745) {
      alb = vec3(0.16, 0.165, 0.175) * (0.8 + 0.3 * noise(P.xy * 0.2)); spec = 0.25; gloss = 20.0;
    } else {
      // wooden furniture: grain along a direction per block, worn and ink-stained
      float a = rnd * PI;
      vec2 gdir = vec2(cos(a), sin(a));
      vec2 gp = vec2(dot(P.xy, gdir), dot(P.xy, vec2(-gdir.y, gdir.x)));
      float grain = noise(vec2(gp.x * 0.012, gp.y * 0.35 + 3.0 * noise(gp * 0.01))) * 0.6 + 0.4 * noise(vec2(gp.x * 0.05, gp.y * 1.3));
      alb = mix(vec3(0.33, 0.19, 0.09), vec3(0.18, 0.09, 0.04), grain) * (0.8 + 0.4 * rnd);
      alb = mix(alb, vec3(0.08, 0.03, 0.025), smoothstep(0.6, 0.85, fbm(P.xy * 0.02 + rnd * 9.0)) * 0.5);
      spec = 0.06; gloss = 10.0;
    }
  } else if (P.z > 1.0) {
    // the iron chase
    alb = vec3(0.045, 0.045, 0.05) * (0.8 + 0.4 * fbm(P.xy * 0.05)); spec = 0.3; gloss = 30.0;
    if (P.z < 0.6 * TH) n = abs(P.x - CHASE.x) < 1.0 ? vec3(-1, 0, 0) : abs(P.x - CHASE.z) < 1.0 ? vec3(1, 0, 0) : abs(P.y - CHASE.y) < 1.0 ? vec3(0, -1, 0) : vec3(0, 1, 0);
  } else {
    // the press bed: machined iron, fly-cutter arcs
    float arcs = fract(length(P.xy - vec2(540.0, -1800.0)) / 6.0);
    alb = vec3(0.05, 0.052, 0.056) * (0.85 + 0.3 * fbm(P.xy * 0.01));
    spec = 0.35 + 0.25 * smoothstep(0.3, 0.5, arcs) * smoothstep(0.7, 0.5, arcs); gloss = 40.0;
  }
  float shK = shadowKey(P, keyDir());
  return lit(P, n, V, alb, spec, gloss, ao, shK, 1.0);
}

vec3 shadeRoller(vec3 P, vec2 c, vec3 V, float spin) {
  vec3 n = normalize(vec3(0.0, P.y - c.x, P.z - c.y));
  float ang = atan(n.z, n.y) + spin;
  vec2 sp = vec2(P.x, ang * RR);
  // composition roller under a film of vermilion ink: orange-peel texture, faint streaks
  float peel = noise(sp * 0.35) * 0.6 + noise(sp * 1.1) * 0.4;
  n = normalize(n + vec3(peel - 0.5, 0.0, 0.0) * 0.08);
  vec3 alb = exp(-INK_ABS * (0.9 + 0.3 * noise(vec2(P.x * 0.03, 3.0)))) * vec3(0.5, 0.45, 0.45);
  if (P.x < 80.0 || P.x > 1000.0) { alb = vec3(0.35, 0.36, 0.38); }
  return lit(P, n, V, alb, 0.9, 120.0, 1.0, shadowKey(P, keyDir()), 1.0);
}

// paper height (world px, along the platen normal) at sheet texture coords tc
float paperH(vec2 tc) {
  vec4 Q = textureLod(uP, tc, gLod);
  float dep = uImp * 3.4 * (0.72 * Q.g + 0.28 * Q.b);
  float fib = (0.22 * Q.r + 0.08 * noise(tc * vec2(@SWx@.0, @SHx@.0) * 1.2)) / (1.0 + 0.6 * gLod);
  float cockle = 0.6 * noise(tc * 3.0 + 4.0) + 0.3 * noise(tc * 7.0 + 1.0);
  return -dep + fib + cockle;
}
vec3 shadeSheet(vec3 P, vec3 loc, vec3 V) {
  vec2 tc = (loc.xy - SHEET.xy) / SHEET.zw;
  vec3 d = pD(), nn = pN(), X = vec3(1.0, 0.0, 0.0);
  vec4 F = textureLod(uF, tc, gLod);
  vec4 Q = textureLod(uP, tc, gLod);
  // the paper's relief → world normal
  vec2 e = 1.2 * exp2(gLod) / vec2(@TW@.0, @THx@.0);
  float h0 = paperH(tc);
  float gu = (paperH(tc + vec2(e.x, 0.0)) - paperH(tc - vec2(e.x, 0.0))) / (2.0 * e.x * SHEET.z);
  float gv = (paperH(tc + vec2(0.0, e.y)) - paperH(tc - vec2(0.0, e.y))) / (2.0 * e.y * SHEET.w);
  vec3 n = normalize(-gu * X - gv * d + nn);
  // the print: ink film at the moment of impression × contact (sorts stand a hair high or low)
  float sd = (F.b - 0.5) * 12.0;
  vec2 fp = vec2(loc.x, YH + loc.y);
  float f0 = film(fp, true);
  float f = f0 * uImp;
  float contact = F.g * (0.82 + 0.3 * F.a);
  float amt = f * contact;
  // thin ink wets the fibre tops first: mottle in the solids, speckle where it ran short
  float micro = 0.5 * Q.r + 0.35 * noise(tc * vec2(@SWx@.0, @SHx@.0) * 0.9) + 0.25 * noise(tc * vec2(@SWx@.0, @SHx@.0) * 0.25);
  float cov = smoothstep(micro * 0.55 - 0.08, micro * 0.55 + 0.22, amt);
  float tau = amt * cov * (0.8 + 0.25 * noise(tc * 900.0));
  // squeeze: the platen pushes the ink film toward the edges of the face → a darker rim just inside the edge,
  // and a faint halo of squeezed ink just outside it
  float x = (sd - 0.9) / 0.75;
  float rim = exp(-x * x) * F.g;
  float halo = smoothstep(-2.2, -0.2, sd) * (1.0 - F.g) * smoothstep(0.05, 0.25, f0);
  tau += f * (0.75 * rim + 0.16 * halo * (0.6 + 0.8 * noise(tc * 700.0)));
  // dust on the forme: hickeys (a white dot ringed with ink)
  for (int i = 0; i < 3; i++) {
    vec4 hk = uHick[i];
    float dh = length(loc.xy - SHEET.xy - hk.xy);
    tau *= mix(1.0, smoothstep(hk.z * 0.6, hk.z, dh), uImp);
    tau += uImp * 0.5 * exp(-pow(max(dh - hk.z * 1.25, 0.0) / (hk.z * 0.45), 2.0)) * amt;
  }
  vec3 paper = vec3(0.79, 0.75, 0.66) * (0.95 + 0.07 * Q.r) * (0.97 + 0.05 * fbm(tc * 40.0));
  // salt: specks of bare fibre in the solids where the paper's tooth didn't reach the ink
  tau *= 1.0 - 0.45 * smoothstep(0.72, 0.95, 0.6 * Q.r + 0.5 * noise(tc * 1600.0)) * smoothstep(0.3, 0.6, tau);
  vec3 alb = paper * exp(-INK_ABS * tau * 1.6);
  // shadows inside the impression from the raking lamp (march along the light over the paper's height field)
  float rsh = 1.0;
  if (uRake.w > 0.0 && uImp > 0.0) {
    vec3 R = uRake.xyz;
    vec2 Ld = vec2(dot(R, X), dot(R, d));
    float Lw = dot(R, nn);
    float lxy = max(length(Ld), 1e-3);
    vec2 stepTC = Ld / lxy / SHEET.zw;
    float s = 0.6;
    for (int i = 0; i < 10; i++) {
      float hh = paperH(tc + stepTC * s);
      rsh = min(rsh, clamp(1.0 - (hh - (h0 + s * Lw / lxy)) / 0.35, 0.0, 1.0));
      s *= 1.5;
    }
  }
  float spec = 0.03 + 0.12 * smoothstep(0.2, 0.8, tau);       // dried ink has a slight sheen
  return lit(P, n, V, alb, spec, 24.0, 1.0, shadowKey(P, keyDir()), rsh);
}

vec3 shadePlaten(vec3 P, vec3 loc, int axis, vec3 V) {
  vec3 d = pD(), nn = pN(), X = vec3(1.0, 0.0, 0.0);
  vec3 n; vec3 alb; float spec = 0.3, gloss = 30.0;
  if (axis == 2 && loc.z > -1.0) {
    // tympan: oiled manila over the packing, with brass gauge pins along the sheet's edges
    n = nn;
    alb = vec3(0.36, 0.25, 0.12) * (0.8 + 0.3 * fbm(loc.xy * 0.03)) * (0.9 + 0.1 * noise(loc.xy * 0.8));
    alb = mix(alb, alb * 0.6, smoothstep(0.55, 0.8, fbm(loc.xy * 0.008 + 3.0)));
    spec = 0.12; gloss = 14.0;
    vec2 pins[3] = vec2[3](vec2(330.0, 850.0), vec2(750.0, 850.0), vec2(88.0, 450.0));
    for (int i = 0; i < 3; i++) {
      vec2 q = abs(loc.xy - pins[i]);
      if ((i < 2 && q.x < 16.0 && q.y < 5.0) || (i == 2 && q.x < 5.0 && q.y < 16.0)) { alb = vec3(0.55, 0.38, 0.13); spec = 0.9; gloss = 70.0; }
    }
    // the sheet's soft contact shadow on the tympan
    vec2 dq = max(SHEET.xy - loc.xy, loc.xy - SHEET.xy - SHEET.zw);
    alb *= 0.55 + 0.45 * smoothstep(0.0, 9.0, max(dq.x, dq.y));
  } else if (axis == 2) {
    // the back of the platen: cast iron with a grid of ribs
    vec2 fu = fract(loc.xy / vec2(118.0, 142.0)) - 0.5;
    vec2 rib = smoothstep(0.08, 0.02, abs(fu));
    vec2 slope = sign(fu) * smoothstep(0.09, 0.05, abs(fu)) * smoothstep(0.0, 0.03, abs(fu));
    n = normalize(-nn + (X * slope.x + d * slope.y) * 0.6);
    alb = vec3(0.04, 0.05, 0.045) * (0.8 + 0.4 * fbm(loc.xy * 0.02)) * (1.0 + 0.6 * max(rib.x, rib.y));
    spec = 0.25; gloss = 24.0;
  } else {
    // machined edges
    n = axis == 0 ? (loc.x < 540.0 ? -X : X) : (loc.y < 400.0 ? -d : d);
    alb = vec3(0.12, 0.125, 0.13); spec = 0.6; gloss = 50.0;
  }
  return lit(P, n, V, alb, spec, gloss, 1.0, shadowKey(P, keyDir()), 1.0);
}

void main() {
  vec2 px = gl_FragCoord.xy - 0.5 * uRes;
  vec3 rd = normalize(uFwd * uFocal + uRight * px.x + uUp * px.y);
  vec3 ro = uEye, V = -rd;
  float best = 1e9;
  vec3 col = vec3(0.0);
  int kind = 0;   // 1 platen, 2 sheet, 3 roller A, 4 roller B, 5 hinge
  vec3 loc; int axis = 0;
  {
    vec3 o, r; toPlaten(ro, rd, o, r);
    int ax;
    float tp = boxHit(o, r, vec3(PLAT.x, PLAT.y, -PT), vec3(PLAT.z, PLAT.w, 0.0), ax);
    if (tp > 0.0 && tp < best) { best = tp; kind = 1; loc = o + r * tp; axis = ax; }
    float ts = boxHit(o, r, vec3(SHEET.x, SHEET.y, 0.0), vec3(SHEET.x + SHEET.z, SHEET.y + SHEET.w, PS), ax);
    if (ts > 0.0 && ts <= best + 0.01) { best = ts; kind = 2; loc = o + r * ts; axis = ax; }
  }
  if (uRoll.w > 0.5) {
    float ta = cylHit(ro, rd, vec2(uRoll.x, TH + RR), RR, vec2(40.0, 1040.0));
    if (ta > 0.0 && ta < best) { best = ta; kind = 3; }
    float tb = cylHit(ro, rd, vec2(uRoll.x + uRoll.y, TH + RR), RR, vec2(40.0, 1040.0));
    if (tb > 0.0 && tb < best) { best = tb; kind = 4; }
  }
  float thg = cylHit(ro, rd, vec2(YH, TH - 14.0), 24.0, vec2(30.0, 1050.0));
  if (thg > 0.0 && thg < best) { best = thg; kind = 5; }

  float tTop = (TH + 1.0 - ro.z) / rd.z;
  if (kind == 0 || best > tTop) {
    // ray-march the forme's height field from type-high down to below the furniture, then the bed
    float tLow = (0.5 * TH - ro.z) / rd.z;
    float t0 = max(tTop, 0.0);
    const int N = 44;
    float dt = (tLow - t0) / float(N);
    float t = t0, tp = t0;
    bool hit = false;
    for (int i = 0; i <= N; i++) {
      vec3 p = ro + rd * t;
      if (p.z <= hAt(p.xy)) { hit = true; break; }
      tp = t; t += dt;
    }
    float tf;
    if (hit) {
      float a = tp, b = t;
      for (int i = 0; i < 7; i++) { float m = 0.5 * (a + b); vec3 p = ro + rd * m; if (p.z <= hAt(p.xy)) b = m; else a = m; }
      tf = b;
    } else {
      int ax;
      float tc = boxHit(ro, rd, vec3(CHASE.x, CHASE.y, 0.0), vec3(CHASE.z, CHASE.w, 0.62 * TH), ax);
      tf = tc > 0.0 ? tc : -ro.z / rd.z;
    }
    if (tf < best) { best = tf; kind = 0; }
  }
  vec3 P = ro + rd * best;
  gLod = max(0.0, log2(@S@.0 * best / uFocal));
  if (kind == 0) col = shadeForme(P, V);
  else if (kind == 1) col = shadePlaten(P, loc, axis, V);
  else if (kind == 2) col = axis == 2 ? shadeSheet(P, loc, V) : vec3(0.62, 0.58, 0.5) * (AMB * 2.0 + KEYC * uKeyI * 0.35);
  else if (kind == 3 || kind == 4) col = shadeRoller(P, vec2(uRoll.x + (kind == 4 ? uRoll.y : 0.0), TH + RR), V, uRoll.z);
  else {
    vec3 n = normalize(vec3(0.0, P.y - YH, P.z - (TH - 14.0)));
    col = lit(P, n, V, vec3(0.1, 0.1, 0.11), 0.7, 60.0, 1.0, 1.0, 1.0);
  }
  // tone: soft shoulder, gentle warm grade, vignette, grain by frame number
  col = col / (1.0 + 0.55 * col);
  col *= 1.32;
  col = pow(max(col, vec3(0.0)), vec3(1.0 / 2.2));
  vec2 vq = gl_FragCoord.xy / uRes - 0.5;
  col *= 1.0 - 0.5 * pow(min(length(vq * vec2(0.9, 1.0)) * 1.3, 1.0), 2.6);
  col += (hash12(gl_FragCoord.xy + uFrame * 13.7) - 0.5) * 0.018;
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
