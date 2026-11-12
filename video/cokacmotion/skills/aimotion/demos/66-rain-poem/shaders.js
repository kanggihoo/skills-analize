/*
 * shaders.js — 66 · 빗속의 시
 *   SIM    one leapfrog step of the damped 2D wave equation on the RG32F height field (h_n, h_{n−1})
 *   SURF   height field → (h, ∂h/∂x, ∂h/∂y, ∇²h) in stage px, half float, linearly filtered for the scene
 *   FLOOR  bakes the lit stone floor once: granite, the carved poem with worn gold in the grooves, the seal
 *   SCENE  refraction to the floor, caustics, petal shadows, Fresnel reflection of the dusk sky and branch,
 *          floating petals, rain streaks and splashes, the last drop and its reflection converging
 *   FINISH bloom from the scene's mip chain, tone map, vignette, grain, fade
 * Stage coordinates are px with y down; render targets are addressed with gl_FragCoord (y up): rtUV() converts.
 */

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
out vec4 o;
float hash12(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vnoise(vec2 x) {
  vec2 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), f.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.3; a *= 0.5; }
  return s;
}
`;

// ------------------------------------------------------------------ wave equation step
// h' = h + (1 − γ)(h − h₋) + C²∇²h + ν∇²(h − h₋)   (9-point isotropic Laplacian: rings stay round)
// C² = (c·dt/dx)² = 0.25; the 9-point stencil's largest eigenvalue is −16/3, so the leapfrog limit is C² ≤ 0.75.
// γ: damping (ramps up in a sponge layer at the borders so nothing reflects off the frame edge);
// ν: viscous damping of short waves (∝ k², removes grid-scale ringing).
// Drops: a "Mexican hat" crater (zero net volume) added to both time levels — a dent released from rest.
export const SIM = HEAD + `
uniform sampler2D S;
uniform float C2, gam, nu, sponge, cell, stageH;
uniform vec4 drops[4];       // x, y (stage px), depth (px), radius (px)
uniform int nd;
#define F(dx, dy) texelFetch(S, clamp(q + ivec2(dx, dy), ivec2(0), m), 0).rg
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(S, 0) - 1;
  vec2 c = F(0, 0);
  vec2 lap = (4.0 * (F(1, 0) + F(-1, 0) + F(0, 1) + F(0, -1)) + F(1, 1) + F(-1, 1) + F(1, -1) + F(-1, -1) - 20.0 * c) / 6.0;
  float edge = float(min(min(q.x, m.x - q.x), min(q.y, m.y - q.y)));
  float g = gam + sponge * (1.0 - smoothstep(0.0, 26.0, edge));
  float h1 = c.x + (1.0 - g) * (c.x - c.y) + C2 * lap.x + nu * (lap.x - lap.y);
  float h0 = c.x;
  vec2 p = vec2(gl_FragCoord.x * cell, stageH - gl_FragCoord.y * cell);
  for (int i = 0; i < 4; i++) {
    if (i >= nd) break;
    vec2 d = p - drops[i].xy;
    float r2 = dot(d, d) / (drops[i].w * drops[i].w);
    if (r2 > 30.0) continue;
    float b = -drops[i].z * (1.0 - r2) * exp(-r2);
    h1 += b; h0 += b;
  }
  o = vec4(h1, h0, 0.0, 1.0);
}`;

// ------------------------------------------------------------------ height field → slope and curvature (stage px, y down)
export const SURF = HEAD + `
uniform sampler2D S;
uniform float cell;
#define F(dx, dy) texelFetch(S, clamp(q + ivec2(dx, dy), ivec2(0), m), 0).r
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(S, 0) - 1;
  float c = F(0, 0), e = F(1, 0), w = F(-1, 0), up = F(0, 1), dn = F(0, -1);
  float lap = (4.0 * (e + w + up + dn) + F(1, 1) + F(-1, 1) + F(1, -1) + F(-1, -1) - 20.0 * c) / (6.0 * cell * cell);
  // texel +y is up the stage (smaller stage y), so ∂h/∂y_stage = (h(below) − h(above)) / 2dx
  o = vec4(c, (e - w) / (2.0 * cell), (dn - up) / (2.0 * cell), lap);
}`;

// ------------------------------------------------------------------ the floor, baked once
export const FLOOR = HEAD + `
uniform sampler2D sdf, paint;
uniform vec2 stage;
uniform vec3 Lc;
float sdfAt(vec2 p) { return texture(sdf, p / stage).r; }
// groove: a brush-cut channel 5 px deep, steep at the edge
float groove(float d) { return smoothstep(1.4, -3.2, d); }
float heightAt(vec2 p) {
  float bump = 2.4 * fbm(p * 0.018) + 0.7 * vnoise(p * 0.21);
  return bump - 5.0 * groove(sdfAt(p));
}
void main() {
  vec2 p = vec2(gl_FragCoord.x, stage.y - gl_FragCoord.y);
  float d = sdfAt(p);
  float e = 1.2;
  vec3 N = normalize(vec3(-(heightAt(p + vec2(e, 0)) - heightAt(p - vec2(e, 0))) / (2.0 * e),
                          -(heightAt(p + vec2(0, e)) - heightAt(p - vec2(0, e))) / (2.0 * e), 1.0));
  // granite: grey-green body, low-frequency mottling, fine dark/light flecks, soft algae toward the basin's walls
  float mott = fbm(p * 0.0042 + 3.0);
  vec3 stone = mix(vec3(0.115, 0.125, 0.12), vec3(0.205, 0.20, 0.185), mott);
  stone *= 0.82 + 0.36 * fbm(p * 0.035);
  float fl = vnoise(p * 0.55 + 11.0);
  stone = mix(stone, vec3(0.32, 0.31, 0.29), smoothstep(0.83, 0.92, fl) * 0.7);
  stone = mix(stone, vec3(0.04, 0.045, 0.045), smoothstep(0.86, 0.95, vnoise(p * 0.47 + 37.0)) * 0.6);
  vec2 cq = (p / stage - 0.5) * vec2(1.0, 1.78);
  float wall = smoothstep(0.55, 1.05, length(cq) + 0.25 * fbm(p * 0.006));
  stone = mix(stone, vec3(0.045, 0.07, 0.04) * (0.7 + 0.6 * fbm(p * 0.02)), wall * 0.8);

  float gr = groove(d);
  float hemi = 0.55 + 0.45 * N.z;
  float diff = max(dot(N, Lc), 0.0);
  float ao = 1.0 - 0.45 * smoothstep(-0.5, -4.0, d);      // deep in the groove sees less sky
  vec3 col = stone * (0.42 * hemi + 0.85 * diff) * ao;

  // worn gold leaf laid in the grooves: metallic — tinted reflection of the sky and the low light off the groove walls
  float wear = smoothstep(0.30, 0.55, fbm(p * 0.045 + 5.0) + 0.18);
  float gold = gr * wear;
  vec3 F0 = vec3(1.0, 0.74, 0.36);
  vec3 H = normalize(Lc + vec3(0, 0, 1));
  float sp = max(dot(N, H), 0.0);
  sp = sp * sp; sp = sp * sp; sp = sp * sp;              // ^8: a broad, brushed-metal lobe
  vec3 gcol = F0 * (0.22 * hemi + 0.35 * diff + 0.55 * sp) * (0.85 + 0.3 * vnoise(p * 0.3));
  col = mix(col, gcol * mix(1.0, ao, 0.5), gold);

  // the vermilion seal, pigment worn into the stone's grain
  vec4 pt = texture(paint, p / stage);
  float pw = pt.a * smoothstep(0.2, 0.5, fbm(p * 0.08 + 2.0) + 0.15);
  col = mix(col, vec3(0.42, 0.075, 0.05) * (0.5 * hemi + 0.7 * diff), pw);
  o = vec4(col, 1.0);
}`;

// ------------------------------------------------------------------ the frame
export const MAXD = 40, MAXP = 8;
export const SCENE = HEAD + `
uniform sampler2D surf, floorT, canopy;
uniform vec2 stage, cam;
uniform float camH, canH, depth, eta, glow, starI, lightK, reflK, causK;
uniform vec4 canDom;
uniform vec3 Lc, Lg;
uniform vec4 petal[${MAXP}];     // x, y, angle, half-length
uniform float petalT[${MAXP}];   // tint
uniform int nPetal;
uniform vec4 drop[${MAXD}];      // x, y, age (t − impact; < 0 still falling), size
uniform int nDrop;
uniform vec4 fdrop;              // the last drop: impact x, y, height now, height at shutter open (< 0: none)
uniform float dropV;

vec2 rtUV(vec2 p) { return vec2(p.x / stage.x, 1.0 - p.y / stage.y); }
vec4 S(vec2 p) { return texture(surf, rtUV(p)); }
vec2 proj(vec2 X, float z) { return cam + (X - cam) * camH / (camH - z); }   // a point at height z above X
float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}
float pw(float x, float k) { return exp2(k * log2(max(x, 1e-6))); }

// cherry petal, centred, axis +x, notched tip; ≈ signed distance in px
float petalSD(vec2 q, float L) {
  float wx = 1.0 + 0.24 * clamp(q.x / L, -1.0, 1.0);
  vec2 a = vec2(L, 0.62 * L);
  vec2 e = vec2(q.x, q.y / wx);
  float d = (length(e / a) - 1.0) * a.y;
  float notch = length(q - vec2(1.04 * L, 0.0)) - 0.2 * L;
  return max(d, -notch);
}
vec2 toLocal(vec2 p, vec4 P) { float c = cos(P.z), s = sin(P.z); p -= P.xy; return vec2(c * p.x + s * p.y, -s * p.x + c * p.y); }

// the dusk sky over the basin, addressed by where a reflected ray meets the canopy plane
const vec3 STARS[5] = vec3[](vec3(70.0, -230.0, 1.0), vec3(-180.0, 820.0, 0.35), vec3(260.0, 1900.0, 0.28), vec3(1240.0, 1420.0, 0.3), vec3(-60.0, 2600.0, 0.22));
vec3 sky(vec2 Q, vec3 R) {
  vec2 g = Q - vec2(250.0, -2100.0);
  float w = exp(-length(g) / 2200.0);
  vec3 c = mix(vec3(0.075, 0.09, 0.19), vec3(0.16, 0.14, 0.25), w);
  c += vec3(1.3, 0.58, 0.27) * w * w * glow;
  c += vec3(0.55, 0.32, 0.26) * (1.0 - smoothstep(0.45, 0.93, R.z)) * glow;   // low sky, caught by steep ripple faces
  for (int i = 0; i < 5; i++) {
    vec2 d = Q - STARS[i].xy;
    c += vec3(0.9, 0.93, 1.0) * STARS[i].z * starI * 10.0 * exp(-dot(d, d) / 18.0);
  }
  return c;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, stage.y - gl_FragCoord.y);
  vec4 s = S(p);
  vec3 n = normalize(vec3(-s.yz, 1.0));
  vec3 v = normalize(vec3(p - cam, -camH));

  // ---- under the surface: refracted view ray to the floor
  vec3 T = refract(v, n, eta);
  float len = (depth + s.x) / max(-T.z, 0.2);
  vec2 Fp = p + T.xy * len;
  vec3 fl = texture(floorT, rtUV(Fp)).rgb;
  // light reaching Fp entered the surface toward the light; a converging (crest-shaped, ∇²h < 0) patch focuses it
  vec2 Sp = Fp + Lc.xy / Lc.z * depth * 0.62;
  float lapS = S(Sp).w;
  float I = 1.0 / max(1.0 + depth * (1.0 - eta) * lapS, 0.28);
  I = min(mix(1.0, I, causK), 3.2);
  // petals block the light: soft shadows on the floor (diffuse dusk light → wide penumbra)
  float sh = 1.0;
  for (int i = 0; i < ${MAXP}; i++) {
    if (i >= nPetal) break;
    vec2 qq = toLocal(Sp, petal[i]);
    if (dot(qq, qq) > 3600.0) continue;
    sh *= 1.0 - 0.55 * smoothstep(9.0, -7.0, petalSD(qq, petal[i].w));
  }
  vec3 under = fl * lightK * (0.38 + 0.62 * I) * sh;
  float path = len + depth / Lc.z;
  under *= exp(-vec3(0.0022, 0.0012, 0.0010) * path);
  under += vec3(0.008, 0.019, 0.030) * (1.0 - exp(-len / 280.0)) * lightK;

  // ---- reflection: the reflected ray meets the canopy plane (branch silhouette) or the sky behind it
  vec3 R = reflect(v, n);
  vec2 Q = p + R.xy * (canH / max(R.z, 0.08));
  vec2 cu = (Q - canDom.xy) / (canDom.zw - canDom.xy);
  float br = textureLod(canopy, cu, 1.3).a;
  vec3 refl = mix(sky(Q, R), vec3(0.012, 0.010, 0.016), br);
  float ci = clamp(-dot(v, n), 0.0, 1.0);
  float m5 = 1.0 - ci; m5 = m5 * m5 * m5 * m5 * m5;
  float Fr = 0.03 + 0.97 * m5;
  vec3 col = under * (1.0 - Fr) + refl * Fr * reflK;
  // glints of the afterglow on the ripple faces (a sharp lobe toward the bright low sky)
  col += vec3(1.0, 0.62, 0.36) * pw(max(dot(R, Lg), 0.0), 220.0) * 2.4 * glow * (1.0 - br);

  // ---- petals afloat: they ride the local surface (tilt, small push), with a dark meniscus rim
  for (int i = 0; i < ${MAXP}; i++) {
    if (i >= nPetal) break;
    vec4 P = petal[i];
    vec4 sc = S(P.xy);
    P.xy -= sc.yz * 14.0;
    vec2 q = toLocal(p, P);
    if (dot(q, q) > 4.0 * P.w * P.w + 400.0) continue;
    float d = petalSD(q, P.w);
    col *= 1.0 - 0.22 * smoothstep(4.0, 0.0, d) * smoothstep(-1.0, 0.5, d);
    float cov = clamp(0.5 - d, 0.0, 1.0);
    if (cov <= 0.0) continue;
    // a shallow cup: the rim is raised, so the normal leans toward the centre (local → stage rotation)
    vec2 cupL = -q / P.w * vec2(0.16, 0.34);
    vec2 cup = vec2(cos(P.z) * cupL.x - sin(P.z) * cupL.y, sin(P.z) * cupL.x + cos(P.z) * cupL.y);
    vec3 pn = normalize(vec3(-sc.yz * 2.5 + cup, 1.0));
    float base = smoothstep(0.2, -1.0, q.x / P.w);
    vec3 alb = mix(vec3(0.97, 0.86, 0.88), vec3(0.93, 0.60, 0.69), base * (0.6 + 0.4 * petalT[i]));
    alb *= 1.0 - 0.06 * smoothstep(0.6, 0.0, abs(fract(atan(q.y, q.x + P.w) * 5.0) - 0.5));   // faint veins
    float hemiP = 0.55 + 0.45 * pn.z;
    float dg = max(dot(pn, normalize(Lg + vec3(0, 0, 1.6))), 0.0);
    vec3 pc = alb * (vec3(0.16, 0.17, 0.26) * hemiP + vec3(0.55, 0.36, 0.26) * dg * glow) * lightK * 1.35;
    pc += alb * alb * vec3(0.10, 0.05, 0.05) * glow;                                        // light through the petal
    pc += vec3(0.9, 0.7, 0.55) * pw(max(dot(reflect(v, pn), Lg), 0.0), 40.0) * 0.18 * glow;  // wet sheen
    col = mix(col, pc, cov);
  }

  // ---- rain: streaks in flight (radial — they fall away from the camera), splashes at impact
  for (int i = 0; i < ${MAXD}; i++) {
    if (i >= nDrop) break;
    vec4 d = drop[i];
    if (d.z < 0.0) {
      float z0 = -d.z * dropV, z1 = z0 + dropV / 60.0;
      vec2 a = proj(d.xy, z0), b = proj(d.xy, z1);
      float dd = segDist(p, a, b);
      col += vec3(0.55, 0.60, 0.72) * (1.0 - smoothstep(0.4, 1.5, dd)) * 0.22 * d.w;
    } else {
      vec2 e = p - d.xy;
      float r2 = dot(e, e);
      float k = exp(-d.z / 0.045);
      col += vec3(0.85, 0.88, 1.0) * k * exp(-r2 / (3.0 + 260.0 * d.z)) * 0.7 * d.w;
      float rr = sqrt(r2) - (5.0 + 190.0 * d.z) * d.w;               // the crown's thin bright rim
      col += vec3(0.7, 0.75, 0.9) * k * exp(-rr * rr / 2.0) * 0.25;
    }
  }
  // ---- the last drop: a bead falling toward its own reflection until they touch
  if (fdrop.z > 0.0) {
    vec2 a = proj(fdrop.xy, fdrop.z), b = proj(fdrop.xy, fdrop.w);
    float rad = 4.6 * camH / (camH - fdrop.z);
    float dd = segDist(p, a, b) - rad;
    float cov = clamp(0.5 - dd, 0.0, 1.0);
    vec2 lp = (p - a) / rad;
    vec3 bead = sky(p, vec3(0, 0, 1)) * 0.6 + vec3(1.0, 0.8, 0.6) * exp(-dot(lp - vec2(-0.3, -0.45), lp - vec2(-0.3, -0.45)) * 9.0) * 1.6 * glow;
    bead *= 1.0 - 0.6 * smoothstep(0.4, 1.0, length(lp));
    col = mix(col, bead, cov * 0.85);
    // its mirror image below the surface (seen through the Fresnel reflection)
    vec2 a2 = cam + (fdrop.xy - cam) * camH / (camH + fdrop.z), b2 = cam + (fdrop.xy - cam) * camH / (camH + fdrop.w);
    float rad2 = 4.6 * camH / (camH + fdrop.z);
    float d2 = segDist(p, a2, b2) - rad2;
    col += vec3(0.9, 0.75, 0.6) * clamp(0.5 - d2, 0.0, 1.0) * 0.22 * glow;
  }
  o = vec4(min(col, vec3(8.0)), 1.0);
}`;

export const FINISH = HEAD + `
uniform sampler2D img;
uniform vec2 stage;
uniform float frameNo, fade, expo;
void main() {
  vec2 px = gl_FragCoord.xy, uv = px / stage;
  vec3 c = textureLod(img, uv, 0.0).rgb;
  vec3 b = textureLod(img, uv, 2.0).rgb * 0.35 + textureLod(img, uv, 3.5).rgb * 0.35 + textureLod(img, uv, 5.0).rgb * 0.30;
  c += max(b - 0.35, 0.0) * 0.55 + b * 0.04;
  c *= expo;
  c = 1.0 - exp(-c * 1.15);
  c = pow(max(c, 0.0), vec3(1.0 / 2.2));
  vec2 q = uv - 0.5;
  float vg = clamp(length(q * vec2(1.1, 0.78)) * 1.25, 0.0, 1.0);
  c *= 1.0 - 0.55 * vg * vg * vg;
  c *= fade;
  c += (hash12(px + frameNo * 7.13) - 0.5) / 255.0 * 2.0;
  o = vec4(max(c, 0.0), 1.0);
}`;
