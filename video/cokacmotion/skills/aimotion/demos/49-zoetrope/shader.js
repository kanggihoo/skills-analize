/*
 * 49-zoetrope/shader.js — one full-screen pass that ray-traces the zoetrope analytically (cylinders, discs, planes)
 * and integrates the camera shutter: u_S sub-frame samples spread over the exposure, each one tracing the scene with
 * the drum at its own angle θ_k = θ(t) + ω·(k/S − ½)·E. Within a sample the slit occlusion is box-filtered exactly:
 * the fraction of that sample's time slice during which a slit lies on the ray (overlap of the swept angle with the
 * slit) blends the wall with what is seen through it. Nothing here knows about "frames of the animation": the strip
 * is a static texture on the inner wall that turns with the drum.
 * World: y up, drum axis = y axis, radius 1. Angles ψ are in the drum's own frame: ψ = atan(z, x) − θ.
 */
export const FS = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform vec3 u_cp, u_cf, u_cr, u_cu;
uniform float u_tanH, u_theta, u_omega, u_shutter, u_gain, u_fade, u_t;
uniform int u_S;
uniform vec3 u_lamp;
uniform sampler2D u_strip;
out vec4 o;

const float PI = 3.14159265, TAU = 6.28318531;
const float RO = 1.0, RI = 0.986;
const float YB = 0.27, YF = 0.30, YT = 1.42;      // drum bottom, inner floor, top
const float SB0 = 0.90, SB1 = 1.34;               // slit band (outer wall)
const float ST0 = 0.34, ST1 = 0.80;               // picture strip (inner wall)
const float SHW = 0.037;                          // slit half-width, rad (≈ 4.2° slit every 30°)
const float SP = TAU / 12.0;
const vec3 LAMPC = vec3(1.0, 0.80, 0.56) * 26.0;  // tungsten lamp

bool g_dyn;
float g_hw;    // angular half-width of the current sample's time slice (+ pixel footprint)

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
vec2 cyl(vec3 ro, vec3 rd, float r) {
  float a = dot(rd.xz, rd.xz), b = dot(ro.xz, rd.xz), c = dot(ro.xz, ro.xz) - r * r;
  float h = b * b - a * c;
  if (h < 0.0 || a < 1e-9) return vec2(-1.0, -1.0);
  h = sqrt(h);
  return vec2((-b - h) / a, (-b + h) / a);
}
float psiOf(vec3 p, float th) { return atan(p.z, p.x + 1e-7) - th; }
// signed angular distance to the nearest slit centre
float slitD(float psi) { float m = mod(psi + 0.5 * SP, SP) - 0.5 * SP; return m; }
float bandY(float y, float s) { return smoothstep(SB0 - s, SB0 + s, y) * (1.0 - smoothstep(SB1 - s, SB1 + s, y)); }
// fraction of the time slice [ψ − hw, ψ + hw] during which the slit is on this ray (exact box filter)
float slitFrac(float psi, float y, float hw) {
  float d = slitD(psi);
  float lo = max(d - hw, -SHW), hi = min(d + hw, SHW);
  return clamp((hi - lo) / (2.0 * hw), 0.0, 1.0) * bandY(y, 0.004);
}
float slitSoft(vec3 q, float th, float s) {
  float d = abs(slitD(psiOf(q, th)));
  return (1.0 - smoothstep(SHW - s, SHW + s, d)) * bandY(q.y, s);
}

// light from the lamp reaching P, blocked by the drum wall (passing through slits or over the rim)
float lampVis(vec3 P, float th, bool inside) {
  vec3 d = normalize(u_lamp - P);
  if (inside) {
    vec2 c = cyl(P, d, RI);
    vec3 q = P + d * c.y;
    g_dyn = true;
    return max(smoothstep(YT - 0.035, YT + 0.035, q.y), slitSoft(q, th, 0.012));
  }
  if (P.y >= YT - 1e-3) return 1.0;              // the rim's top edge sees the lamp
  vec2 c = cyl(P, d, RO);
  if (c.y <= 1e-4) return 1.0;
  if (c.x <= 1e-4) {          // under the drum: does the ray leave the cylinder below the drum bottom?
    vec3 q2 = P + d * c.y;
    return q2.y < YB ? 1.0 : 0.0;
  }
  vec3 q1 = P + d * c.x;
  if (q1.y > YT) return 1.0;
  if (q1.y < YB) { vec3 q2 = P + d * c.y; return q2.y < YB ? 1.0 : 0.0; }
  g_dyn = true;
  float o1 = slitSoft(q1, th, 0.012);
  if (o1 <= 0.0) return 0.0;
  vec3 q2 = P + d * c.y;
  return o1 * (q2.y > YT ? 1.0 : slitSoft(q2, th, 0.012));
}
vec3 lit(vec3 P, vec3 n, vec3 V, vec3 alb, float th, bool inside, float spec, float shin, float amb) {
  vec3 Ld = u_lamp - P;
  float dist2 = dot(Ld, Ld);
  vec3 L = Ld * inversesqrt(dist2);
  float ndl = dot(n, L);
  float vis = ndl > 0.0 ? lampVis(P + n * 0.003, th, inside) : 0.0;
  vec3 E = LAMPC / dist2 * vis;
  vec3 H = normalize(L + V);
  vec3 ambC = vec3(0.055, 0.045, 0.038) * amb;
  return alb * (ambC + E * max(ndl, 0.0)) + E * spec * pow(max(dot(n, H), 0.0), shin) * step(0.0, ndl);
}
vec3 background(vec3 rd) {
  vec3 toL = normalize(u_lamp - u_cp);
  float g = pow(max(dot(rd, toL), 0.0), 6.0);
  return vec3(0.010, 0.0075, 0.006) * (0.6 + 0.6 * smoothstep(-0.3, 0.4, rd.y)) + vec3(0.09, 0.06, 0.035) * g;
}

// ---- the inside of the drum, from a point p just inside (entered through a slit or the open top)
vec3 interior(vec3 p, vec3 rd, float th, float pixW) {
  vec2 c = cyl(p, rd, RI);
  float tw = c.y;
  float tf = rd.y < 0.0 ? (YF - p.y) / rd.y : 1e9;
  vec3 V = -rd;
  if (tf > 0.0 && tf < tw) {
    vec3 q = p + rd * tf;
    float ring = 0.5 + 0.5 * sin(length(q.xz) * 60.0);
    vec3 alb = vec3(0.03, 0.028, 0.026) * (0.85 + 0.15 * ring);
    return lit(q, vec3(0.0, 1.0, 0.0), V, alb, th, true, 0.05, 20.0, 0.25);
  }
  vec3 q = p + rd * tw;
  if (q.y > YT) return background(rd);
  float psi = psiOf(q, th);
  vec3 n = -vec3(q.x, 0.0, q.z) / RI;
  if (q.y >= ST0 && q.y <= ST1) {
    float u = fract(psi / TAU + 0.5 / 12.0), v = (ST1 - q.y) / (ST1 - ST0);
    float dist = length(q - u_cp) ;
    float tpp = 620.0 * pixW * dist / max(abs(dot(n, rd)), 0.15);
    vec3 alb = pow(textureLod(u_strip, vec2(u, v), max(log2(max(tpp, 1e-3)), 0.0)).rgb, vec3(2.2));
    return lit(q, n, V, alb * 0.95, th, true, 0.02, 8.0, 0.35);
  }
  if (slitSoft(q, th, 0.002) > 0.5) return background(rd) * 1.5;   // out through a slit on the far side
  vec3 alb = vec3(0.022, 0.02, 0.019);
  return lit(q, n, V, alb, th, true, 0.15, 30.0, 0.3);
}

// ---- the outside of the drum wall
vec3 outerWall(vec3 P, vec3 n, vec3 rd, float psi, float th) {
  vec3 V = -rd;
  float y = P.y;
  vec3 alb; float spec, shin;
  if (y > YT - 0.06 || y < YB + 0.035) {            // brass bands at top and bottom
    alb = vec3(0.62, 0.43, 0.17); spec = 1.3; shin = 70.0;
    float bump = 0.5 + 0.5 * sin(y * 900.0);
    n = normalize(n + vec3(0.0, (bump - 0.5) * 0.15, 0.0));
  } else if (y > SB0 - 0.05) {                      // black lacquered slit band, gold pinstripes and lozenges
    alb = vec3(0.012, 0.011, 0.012); spec = 0.9; shin = 90.0;
    float stripe = (1.0 - smoothstep(0.002, 0.004, abs(y - (SB0 - 0.028)))) + (1.0 - smoothstep(0.002, 0.004, abs(y - (SB1 + 0.028))));
    float dm = abs(slitD(psi + 0.5 * SP)) * 3.2 + abs(y - 0.5 * (SB0 + SB1)) * 0.9;
    float loz = 1.0 - smoothstep(0.022, 0.026, dm);
    alb = mix(alb, vec3(0.55, 0.38, 0.12), clamp(stripe + loz, 0.0, 1.0));
  } else {                                          // walnut, grain running round the bent wood
    float gr = vnoise(vec2(psi * 26.0, y * 60.0)) * 0.6 + 0.4 * vnoise(vec2(psi * 4.0, y * 240.0));
    alb = mix(vec3(0.085, 0.045, 0.024), vec3(0.19, 0.105, 0.055), gr);
    spec = 0.35; shin = 40.0;
  }
  return lit(P, n, V, alb, th, false, spec, shin, 1.0);
}

vec3 trace(vec3 ro, vec3 rd, float th, float pixW) {
  float tB = 1e9; int id = 0;
  vec3 n = vec3(0.0, 1.0, 0.0);
  if (rd.y < -1e-5) { tB = -ro.y / rd.y; id = 1; }
  vec2 c = cyl(ro, rd, 0.6);
  if (c.x > 0.0 && c.x < tB) { vec3 p = ro + rd * c.x; if (p.y >= 0.0 && p.y <= 0.07) { tB = c.x; id = 2; n = vec3(p.x, 0.0, p.z) / 0.6; } }
  if (rd.y < 0.0) { float t = (0.07 - ro.y) / rd.y; vec3 p = ro + rd * t; if (t > 0.0 && t < tB && dot(p.xz, p.xz) < 0.36) { tB = t; id = 3; n = vec3(0.0, 1.0, 0.0); } }
  c = cyl(ro, rd, 0.055);
  if (c.x > 0.0 && c.x < tB) { vec3 p = ro + rd * c.x; if (p.y >= 0.07 && p.y <= YB) { tB = c.x; id = 4; n = vec3(p.x, 0.0, p.z) / 0.055; } }
  c = cyl(ro, rd, RO);
  if (c.x > 0.0 && c.x < tB) { vec3 p = ro + rd * c.x; if (p.y >= YB && p.y <= YT) { tB = c.x; id = 5; n = vec3(p.x, 0.0, p.z); } }
  if (rd.y < 0.0) {
    float t = (YT - ro.y) / rd.y;
    if (t > 0.0 && t < tB) {
      vec3 p = ro + rd * t;
      float r2 = dot(p.xz, p.xz);
      if (r2 < RO * RO) {
        if (r2 > RI * RI) { tB = t; id = 6; n = vec3(0.0, 1.0, 0.0); }
        else { g_dyn = true; return interior(p, rd, th, pixW); }
      }
    }
  }
  if (id == 0) return background(rd);
  vec3 P = ro + rd * tB, V = -rd;
  if (id == 5) {
    g_dyn = true;
    float psi = psiOf(P, th);
    float f = slitFrac(psi, P.y, g_hw);
    vec3 wall = f < 1.0 ? outerWall(P, n, rd, psi, th) : vec3(0.0);
    if (f <= 0.0) return wall;
    vec2 ci = cyl(ro, rd, RI);
    vec3 inside = interior(ro + rd * max(ci.x, tB), rd, th, pixW);
    return mix(wall, inside, f);
  }
  if (id == 6) return lit(P, n, V, vec3(0.62, 0.43, 0.17), th, false, 1.3, 60.0, 1.0);
  if (id == 4) return lit(P, n, V, vec3(0.55, 0.38, 0.15), th, false, 1.4, 50.0, 1.0);
  if (id == 2 || id == 3) {
    float r = length(P.xz);
    float rings = vnoise(vec2(r * 90.0, 3.0)) * 0.5 + 0.5 * vnoise(vec2(atan(P.z, P.x + 1e-7) * 3.0, r * 20.0));
    vec3 alb = mix(vec3(0.05, 0.026, 0.014), vec3(0.12, 0.065, 0.034), rings);
    if (id == 3) n = normalize(n + vec3(P.x, 0.0, P.z) * smoothstep(0.5, 0.6, r) * 2.0);   // rounded edge of the plinth
    return lit(P, n, V, alb, th, false, 0.5, 45.0, 1.0);
  }
  // the table: dark polished oak, the lamp's pool, the drum's shadow; a little contact darkening at the plinth
  float g = vnoise(vec2(P.x * 3.0, P.z * 40.0)) * 0.55 + 0.45 * vnoise(vec2(P.x * 0.7, P.z * 9.0));
  vec3 alb = mix(vec3(0.05, 0.03, 0.018), vec3(0.11, 0.066, 0.036), g);
  float ao = mix(0.45, 1.0, smoothstep(0.58, 0.85, length(P.xz)));
  return lit(P, n, V, alb * ao, th, false, 0.45, 35.0, ao);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  float h = hash12(fc * 1.37 + 0.5);
  float aspect = u_res.x / u_res.y;
  float pixW = 2.0 * u_tanH / u_res.y;             // world size of a pixel at unit distance
  int S = u_S;
  float sweep = abs(u_omega) * u_shutter;           // drum angle swept during the exposure
  vec3 acc = vec3(0.0);
  float cnt = 0.0;
  g_dyn = false;
  for (int k = 0; k < 32; k++) {
    if (k >= S) break;
    float fk = (float(k) + fract(h + float(k) * 0.61803)) / float(S);
    float th = u_theta + u_omega * (fk - 0.5) * u_shutter;
    vec2 jit = vec2(fract(h * 7.13 + float(k) * 0.754877), fract(h * 3.71 + float(k) * 0.569840)) - 0.5;
    vec2 ndc = ((fc + jit) / u_res) * 2.0 - 1.0;
    vec3 rd = normalize(u_cf + u_cr * ndc.x * u_tanH * aspect + u_cu * ndc.y * u_tanH);
    // this sample stands for a slice of the exposure: the slit sweeps sweep/S over it (+ the pixel footprint on the wall)
    float dist = length(u_cp.xz) - 1.0;
    g_hw = max(0.5 * sweep / float(S), 0.35 * pixW * max(dist, 0.5));
    acc += trace(u_cp, rd, th, pixW);
    cnt += 1.0;
    if (k == 2 && !g_dyn) break;                   // nothing here sees the drum or its shadow: 3 samples are enough
  }
  vec3 col = acc / cnt * u_gain;
  vec2 vq = fc / u_res - 0.5;
  col *= 1.0 - 0.45 * clamp(dot(vq * vec2(1.0, 0.8), vq * vec2(1.0, 0.8)) * 1.6, 0.0, 1.0);
  col = max(col, vec3(0.0));
  col = col * (2.51 * col + 0.03) / (col * (2.43 * col + 0.59) + 0.14);
  col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2)) * u_fade;
  col += (hash12(fc + fract(u_t * 3.0) * 97.0) - 0.5) / 255.0;
  o = vec4(col, 1.0);
}`;
export const VS = `#version 300 es
layout(location = 0) in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;
