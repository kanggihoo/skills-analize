/*
 * shaders.js — GLSL for the three.js ShaderMaterials. Stage space everywhere: x right, y down (px), z = height above
 * the wall toward the camera; a vertex goes to three.js world as (x, −y, z).
 */

// ---------------------------------------------------------------------------------------------- shared by every pass
export const COMMON = /* glsl */`
uniform vec4 uWallR;   // wall-region textures: x0, y0, w, h (stage px)
uniform vec4 uCardR;   // card-region textures
uniform vec4 uDepR;    // deposition grid: x0, y0, cell, -
uniform vec2 uDepN;    // grid texels
uniform sampler2D uWall, uThr, uSdf, uKraft, uShadow;
uniform highp sampler2DArray uDep;
uniform float uSlice;
uniform vec4 uRem[12];
uniform int uRemN;
uniform vec3 uL, uAmb, uSun;
uniform vec4 uShadeLine;
uniform float uSunK;
uniform vec3 uCream, uCoral;
uniform vec2 uRes;

vec2 wallUV(vec2 p) { return (p - uWallR.xy) / uWallR.zw; }
vec2 cardUV(vec2 p) { return (p - uCardR.xy) / uCardR.zw; }
float cardSdf(vec2 p) {
  vec2 uv = cardUV(p);
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 99.0;
  return texture(uSdf, uv).r;
}
// where the board did not lie flat (px above the wall): a bow by the lower right, a curl at the upper left
float liftField(vec2 p) {
  vec2 a = (p - vec2(900.0, 1010.0)) / vec2(70.0, 120.0);
  vec2 b = (p - vec2(214.0, 700.0)) / vec2(60.0, 90.0);
  return 6.5 * exp(-dot(a, a)) + 3.0 * exp(-dot(b, b));
}
// D(p, t): baked slice + the core Gaussians of the samples since that slice
vec2 deposit(vec2 p) {
  vec2 uv = ((p - uDepR.xy) / uDepR.z + 0.5) / uDepN;
  vec2 d = texture(uDep, vec3(uv, uSlice)).rg;
  for (int i = 0; i < 12; i++) {
    if (i >= uRemN) break;
    vec4 s = uRem[i];
    vec2 q = p - s.xy;
    float g = exp(-dot(q, q) * s.z) * abs(s.w);
    if (s.w > 0.0) d.x += g; else d.y += g;
  }
  return d;
}
// coverage of one coat. The film hides what is under it like an absorbing layer, 1 − e^(−k·D_eff); on concrete the peaks
// catch more of a thin coat than the pits (D_eff = D·(0.3 + 1.4·h^1.3)). Droplets show where 1 − e^(−kD) passes their threshold.
float dropCover(float D, float thr) { return smoothstep(thr, thr + 0.03, 1.0 - exp(-2.4 * D)); }
float coverWall(float D, float hgt, float thr) {
  float film = 1.0 - exp(-2.3 * D * (0.3 + 1.4 * pow(clamp(hgt, 0.0, 1.0), 1.3)));
  return max(film, dropCover(D, thr));
}
float coverCard(float D, float fib, float thr) {
  float film = 1.0 - exp(-2.5 * D * (0.55 + 0.9 * fib));
  return max(film, dropCover(D, thr));
}
// low sun from the upper left; the lower right corner lies in the shadow of a building out of frame, under the coping too
float sunField(vec2 p) {
  float s = smoothstep(-150.0, 150.0, dot(p - uShadeLine.xy, uShadeLine.zw));
  return s * smoothstep(300.0, 352.0, p.y) * uSunK;
}
vec3 shadeAt(vec3 alb, vec3 N, vec2 p, float occ) {
  float diff = max(dot(N, uL), 0.0) / uL.z;
  return alb * (uAmb * (1.0 - 0.22 * occ) + uSun * sunField(p) * diff * (1.0 - occ));
}
vec3 grade(vec3 c) {
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(c * vec3(0.92, 0.93, 1.08), c, smoothstep(0.08, 0.55, l));   // violet in the shadows
  c = c / (1.0 + 0.1 * max(c - 0.75, 0.0) * 4.0);                       // soft shoulder for the bright paint
  return c;
}
`;

// the board's shape while it is peeled: flat for u ≤ 0, wrapped on a cylinder of radius R up to angle φ, then a straight flap
export const BEND = /* glsl */`
uniform vec2 uN;          // in-plane unit vector pointing at the lifted side
uniform float uS, uR, uPhi;
uniform mat4 uE;          // rigid move of the whole card (drop in, pull off)
uniform float uThick;
vec3 bend(vec2 p, out vec3 nrm, out float u) {
  float a = dot(uN, p);
  u = a - uS;
  vec2 base = p - uN * a;
  float an, h;
  if (u <= 0.0) { an = a; h = 0.0; nrm = vec3(0.0, 0.0, 1.0); }
  else if (u <= uR * uPhi) {
    float th = u / uR;
    an = uS + uR * sin(th); h = uR * (1.0 - cos(th)); nrm = vec3(-sin(th) * uN, cos(th));
  } else {
    float e = u - uR * uPhi;
    an = uS + uR * sin(uPhi) + e * cos(uPhi); h = uR * (1.0 - cos(uPhi)) + e * sin(uPhi); nrm = vec3(-sin(uPhi) * uN, cos(uPhi));
  }
  return vec3(base + uN * an, h);
}
vec4 toClip(vec3 P) { return projectionMatrix * viewMatrix * vec4(P.x, -P.y, P.z, 1.0); }
`;

// ---------------------------------------------------------------------------------------------- the wall
export const WALL_VS = /* glsl */`
varying vec2 vP;
void main() { vP = vec2(position.x, -position.y); gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }
`;
export const WALL_FS = /* glsl */`
${COMMON}
uniform float uFrame;
varying vec2 vP;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main() {
  vec2 p = vP, uw = wallUV(p);
  vec4 W = texture(uWall, uw);
  vec2 e = 1.0 / uWallR.zw;
  float hx = texture(uWall, uw + vec2(e.x, 0.0)).a - texture(uWall, uw - vec2(e.x, 0.0)).a;
  float hy = texture(uWall, uw + vec2(0.0, e.y)).a - texture(uWall, uw - vec2(0.0, e.y)).a;
  float face = smoothstep(297.0, 303.0, p.y) * (1.0 - smoothstep(1725.0, 1731.0, p.y)) * smoothstep(62.0, 66.0, p.x);
  vec4 sh = texture(uShadow, gl_FragCoord.xy / uRes);
  vec3 col = W.rgb;
  if (face > 0.0) {
    // paint that reached the wall: through the holes, plus a feather under the board where it stood off the wall
    float sdf = cardSdf(p);
    float wU = 0.35 + 1.15 * liftField(p);
    float M = max(smoothstep(-0.5, 0.5, sdf), 0.85 * exp(min(sdf, 0.0) / wU));
    vec2 D = deposit(p) * M;
    vec2 thr = texture(uThr, uw).rg;
    float c1 = coverWall(D.x, W.a, thr.r), c2 = coverWall(D.y, W.a, thr.g);
    vec3 alb = mix(W.rgb, uCream, c1);
    alb = mix(alb, uCoral, c2);
    float relief = 1.0 - 0.6 * smoothstep(0.5, 2.6, D.x + D.y) * max(c1, c2);
    vec3 N = normalize(vec3(-hx * 2.4 * relief, -hy * 2.4 * relief, 1.0));
    float occ = max(max(sh.r, sh.g), sh.b);
    col = mix(W.rgb, shadeAt(alb, N, p, occ), face);
  }
  col = grade(col);
  col += (hash12(gl_FragCoord.xy + uFrame * 17.0) - 0.5) * 0.028;
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------------------------------------------------------------------------------------- the card (two passes: attached, lifted)
export const CARD_VS = /* glsl */`
${COMMON}
${BEND}
varying vec2 vRest; varying vec3 vNrm; varying vec3 vPos; varying float vU;
void main() {
  vec2 p = position.xy;
  vec3 nrm; float u;
  vec3 P = bend(p, nrm, u);
  P.z += uThick + liftField(p) * (1.0 - smoothstep(0.0, 40.0, u));
  vec4 Q = uE * vec4(P, 1.0);
  vRest = p; vNrm = mat3(uE) * nrm; vPos = Q.xyz; vU = u;
  gl_Position = toClip(Q.xyz);
}
`;
export const CARD_FS = /* glsl */`
${COMMON}
uniform int uPart;
uniform vec3 uCam;
uniform float uLifting;
uniform float uR2;
varying vec2 vRest; varying vec3 vNrm; varying vec3 vPos; varying float vU;
void main() {
  if (uPart == 0 ? vU > 0.0 : vU <= 0.0) discard;
  vec2 uc = cardUV(vRest);
  float sdf = texture(uSdf, uc).r;
  float fw = max(fwidth(sdf), 0.3);
  float a = clamp(0.5 - sdf / fw, 0.0, 1.0);
  if (a < 0.004) discard;
  vec4 kr = texture(uKraft, uc);
  vec3 N = normalize(vNrm);
  vec3 V = normalize(uCam - vPos);
  vec3 alb;
  if (dot(N, V) >= 0.0) {
    vec2 D = deposit(vRest);
    vec2 thr = texture(uThr, wallUV(vRest)).rg;
    float c1 = coverCard(D.x, kr.a, thr.r), c2 = coverCard(D.y, kr.a, thr.g);
    alb = mix(kr.rgb, uCream, c1);
    alb = mix(alb, uCoral, c2);
    // the knife cut: a thin crushed bevel along every edge, bright where the edge faces the sun
    if (sdf > -3.2) {
      vec2 e = 1.0 / uCardR.zw;
      vec2 gs = vec2(texture(uSdf, uc + vec2(e.x, 0.0)).r - texture(uSdf, uc - vec2(e.x, 0.0)).r,
                     texture(uSdf, uc + vec2(0.0, e.y)).r - texture(uSdf, uc - vec2(0.0, e.y)).r);
      vec2 gn = gs / max(length(gs), 1e-4);
      float k = smoothstep(-3.2, -1.4, sdf);
      float side = dot(gn, normalize(uL.xy));
      alb = mix(alb, kr.rgb * 1.08, k * 0.45);
      alb *= 1.0 + k * 0.3 * side;
    }
  } else {
    alb = vec3(0.68, 0.55, 0.4) * (0.86 + 0.2 * kr.a);              // the plain back of the board
    N = -N;
  }
  float occ = 0.0;
  if (uPart == 0) { vec4 sh = texture(uShadow, gl_FragCoord.xy / uRes); occ = max(sh.g, sh.b); }
  vec3 col = shadeAt(alb, N, vRest, occ);
  if (uPart == 0 && uLifting > 0.5) col *= 1.0 - 0.3 * exp(vU / (0.5 * uR2 + 8.0));   // the bend hovers just above: less sky
  gl_FragColor = vec4(grade(col), a);
}
`;

// ---------------------------------------------------------------------------------------------- shadow buffer (MAX blend)
// r = the board's own contact shadow (wall only), g = lifted board and tape, b = can and tapes in the air
export const CARD_SH_VS = /* glsl */`
${COMMON}
${BEND}
varying vec2 vRest; varying float vH; varying float vU;
void main() {
  vec2 p = position.xy;
  vec3 nrm; float u;
  vec3 P = bend(p, nrm, u);
  P.z += uThick + liftField(p) * (1.0 - smoothstep(0.0, 40.0, u));
  vec3 Q = (uE * vec4(P, 1.0)).xyz;
  vec3 S = Q - uL * (max(Q.z, 0.0) / uL.z);
  vRest = p; vH = max(Q.z, 0.0); vU = u;
  gl_Position = toClip(vec3(S.xy, 0.0));
}
`;
export const CARD_SH_FS = /* glsl */`
${COMMON}
varying vec2 vRest; varying float vH; varying float vU;
void main() {
  float sdf = texture(uSdf, cardUV(vRest)).r;
  float w = 0.7 + 0.05 * vH;
  float a = (1.0 - smoothstep(-w, w, sdf)) * 0.95 * exp(-vH / 900.0);
  gl_FragColor = vU > 0.0 ? vec4(0.0, a, 0.0, 0.0) : vec4(a, 0.0, 0.0, 0.0);
}
`;

// ---------------------------------------------------------------------------------------------- masking tape (4 strips in one geometry)
export const TAPE_VS = /* glsl */`
${COMMON}
${BEND}
attribute float aIdx;
uniform vec4 uTapeA[4];   // cx, cy, angle, length
uniform vec4 uTapeB[4];   // width, slap height, slap scale, alpha
varying vec2 vUV; varying vec2 vRest; varying vec3 vNrm; varying vec3 vPos; varying float vU; varying float vAlpha; varying float vH;
void main() {
  int i = int(aIdx + 0.5);
  vec4 A = uTapeA[i], B = uTapeB[i];
  vec2 loc = position.xy * vec2(A.w, B.x) * B.z;
  float c = cos(A.z), s = sin(A.z);
  vec2 p = A.xy + vec2(c * loc.x - s * loc.y, s * loc.x + c * loc.y);
  vec3 nrm; float u;
  vec3 P = bend(p, nrm, u);
  P.z += uThick * 2.0 + B.y;
  vec4 Q = uE * vec4(P, 1.0);
  vUV = position.xy + 0.5; vRest = p; vNrm = mat3(uE) * nrm; vPos = Q.xyz; vU = u; vAlpha = B.w; vH = B.y;
  gl_Position = toClip(Q.xyz);
}
`;
export const TAPE_FS = /* glsl */`
${COMMON}
uniform sampler2D uTape;
uniform int uPart;
uniform vec3 uCam;
varying vec2 vUV; varying vec2 vRest; varying vec3 vNrm; varying vec3 vPos; varying float vU; varying float vAlpha; varying float vH;
void main() {
  if (uPart == 0 ? vU > 0.0 : vU <= 0.0) discard;
  vec4 tp = texture(uTape, vUV);
  float a = tp.a * vAlpha;
  if (a < 0.004) discard;
  vec3 N = normalize(vNrm);
  vec3 alb = tp.rgb;
  if (dot(N, normalize(uCam - vPos)) >= 0.0) {
    vec2 D = deposit(vRest);
    vec2 thr = texture(uThr, wallUV(vRest)).rg;
    float c1 = coverCard(D.x, 0.7, thr.r), c2 = coverCard(D.y, 0.7, thr.g);
    alb = mix(alb, uCream, c1); alb = mix(alb, uCoral, c2);
  } else { alb *= vec3(0.86, 0.82, 0.74); N = -N; }
  float occ = 0.0;
  if (uPart == 0) { vec4 sh = texture(uShadow, gl_FragCoord.xy / uRes); occ = max(sh.g, sh.b) * step(vH, 0.5); }
  gl_FragColor = vec4(grade(shadeAt(alb, N, vRest, occ)), a);
}
`;
export const TAPE_SH_VS = TAPE_VS.replace('void main() {', 'void main_() {') + /* glsl */`
void main() {
  main_();
  vec3 S = vPos - uL * (max(vPos.z, 0.0) / uL.z);
  gl_Position = toClip(vec3(S.xy, 0.0));
}
`;
export const TAPE_SH_FS = /* glsl */`
uniform sampler2D uTape;
varying vec2 vUV; varying vec2 vRest; varying vec3 vNrm; varying vec3 vPos; varying float vU; varying float vAlpha; varying float vH;
void main() {
  float a = texture(uTape, vUV, 2.5).a * vAlpha;
  if (vU > 0.0) gl_FragColor = vec4(0.0, a * 0.8 * exp(-vPos.z / 900.0), 0.0, 0.0);
  else if (vH > 0.5) gl_FragColor = vec4(0.0, 0.0, a * 0.55 * exp(-vH / 120.0), 0.0);
  else discard;
}
`;

// ---------------------------------------------------------------------------------------------- drips
export const DRIP_VS = /* glsl */`
attribute vec4 iA;   // x0, y0, half width, L∞
attribute vec4 iB;   // t0, τ, wobble amplitude, phase
attribute vec3 iC;   // paint colour
uniform float uTime;
varying vec2 vLoc; varying vec2 vP; varying vec4 vA; varying vec4 vB; varying vec3 vCol; varying float vL; varying float vRb;
void main() {
  float age = max(uTime - iB.x, 0.0);
  float k = 1.0 - exp(-age / iB.y);
  float L = iA.w * k;
  float rb = iA.z * (1.05 + 0.4 * k);
  float pad = iA.z * 3.0 + iB.z + 3.0;
  vec2 loc = mix(vec2(-pad, -iA.z * 2.0), vec2(pad, L + rb * 2.0 + 3.0), position.xy);
  if (uTime < iB.x) loc = vec2(0.0);
  vLoc = loc; vP = iA.xy + loc; vA = iA; vB = iB; vCol = iC; vL = L; vRb = rb;
  gl_Position = projectionMatrix * viewMatrix * vec4(vP.x, -vP.y, 0.0, 1.0);
}
`;
export const DRIP_FS = /* glsl */`
${COMMON}
varying vec2 vLoc; varying vec2 vP; varying vec4 vA; varying vec4 vB; varying vec3 vCol; varying float vL; varying float vRb;
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float wob(float y) { return vB.z * sin(y * 0.05 + vB.w) * smoothstep(0.0, 50.0, y); }
float field(vec2 q, out vec3 N) {
  float hw = vA.z * (0.6 + 0.4 * exp(-max(q.y, 0.0) / 14.0));
  float xc = wob(q.y);
  float ds = abs(q.x - xc) - hw;
  ds = max(ds, q.y - vL);
  vec2 bc = vec2(wob(vL), vL + vRb * 0.25);
  float db = length(q - bc) - vRb;
  float d = smin(ds, db, 3.0);
  // normal: a round cord across, a sphere at the tip
  float nx = clamp((q.x - xc) / hw, -1.0, 1.0);
  vec3 Nc = vec3(nx * 0.9, -0.15, sqrt(max(1.0 - nx * nx, 0.02)));
  vec2 bq = (q - bc) / vRb;
  vec3 Nb = vec3(bq, sqrt(max(1.0 - dot(bq, bq), 0.02)));
  N = normalize(mix(Nc, Nb, smoothstep(-0.5, 0.5, ds - db)));
  return d;
}
void main() {
  vec3 N, Ns;
  vec2 q = vLoc;
  float d = field(q, N);
  float fw = max(fwidth(d), 0.35);
  float a = clamp(0.5 - d / fw, 0.0, 1.0);
  a *= smoothstep(-vA.z * 1.6, 3.0, q.y);                       // the top melts into the letter it leaves
  float ds = field(q - vec2(1.4, 1.6), Ns);                       // thin cast shadow, lower right
  float as = clamp(0.5 - ds / 1.6, 0.0, 1.0) * smoothstep(0.0, 6.0, q.y) * 0.32;
  vec4 sh = texture(uShadow, gl_FragCoord.xy / uRes);
  float occ = max(sh.g, sh.b);
  vec3 col = shadeAt(vCol, N, vP, occ);
  vec3 H = normalize(uL + vec3(0.0, 0.0, 1.0));
  col += uSun * sunField(vP) * pow(max(dot(N, H), 0.0), 36.0) * 0.55 * (1.0 - occ);
  vec3 shadeCol = vec3(0.12, 0.09, 0.16);
  float A = a + as * (1.0 - a);
  vec3 C = (grade(col) * a + shadeCol * as * (1.0 - a)) / max(A, 1e-4);
  if (A < 0.004) discard;
  gl_FragColor = vec4(C, A);
}
`;

// ---------------------------------------------------------------------------------------------- airborne: mist, cone, specks, can
export const MIST_VS = /* glsl */`
attribute vec4 iA;   // x, y, radius, alpha
attribute vec4 iB;   // r, g, b, seed
varying vec2 vLoc; varying vec2 vP; varying vec4 vA; varying vec4 vB;
void main() {
  vLoc = position.xy * 2.0 - 1.0;
  vP = iA.xy + vLoc * iA.z;
  vA = iA; vB = iB;
  gl_Position = projectionMatrix * viewMatrix * vec4(vP.x, -vP.y, 2.0, 1.0);
}
`;
export const MIST_FS = /* glsl */`
uniform sampler2D uNoise;
varying vec2 vLoc; varying vec2 vP; varying vec4 vA; varying vec4 vB;
void main() {
  float r2 = dot(vLoc, vLoc);
  float base = exp(-r2 * 3.6);
  float n = texture(uNoise, vP / 430.0 + vB.w).r;
  float n2 = texture(uNoise, vP / 160.0 - vB.w * 1.7).r;
  float dens = base * smoothstep(0.2, 0.8, n * 0.75 + n2 * 0.4);
  gl_FragColor = vec4(vB.rgb, clamp(dens * vA.w, 0.0, 0.9));
}
`;
export const CONE_VS = /* glsl */`
varying vec2 vP;
void main() { vP = vec2(position.x, -position.y); gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }
`;
export const CONE_FS = /* glsl */`
uniform vec2 uApex, uImpact;
uniform float uSig, uAlpha, uTime;
uniform vec3 uCol;
varying vec2 vP;
void main() {
  vec2 ax = uImpact - uApex;
  float len = max(length(ax), 1.0);
  vec2 dir = ax / len;
  vec2 q = vP - uApex;
  float al = dot(q, dir), along = al / len;
  float across = dot(q, vec2(-dir.y, dir.x));
  float width = mix(4.0, uSig * 1.25, clamp(along, 0.0, 1.3));
  float fan = exp(-across * across / (width * width)) * smoothstep(-0.02, 0.15, along) * (1.0 - smoothstep(0.95, 1.35, along));
  float ang = atan(across, max(al, 2.0));
  float streak = 0.55 + 0.45 * sin(ang * 70.0 + uTime * 41.0) * sin(ang * 29.0 - uTime * 27.0 + along * 6.0);
  vec2 di = vP - uImpact;
  float disc = exp(-dot(di, di) / (2.0 * uSig * uSig * 0.5));
  float a = uAlpha * (fan * 0.5 * streak + disc * 0.42);
  gl_FragColor = vec4(uCol, clamp(a, 0.0, 0.8));
}
`;
export const SPECK_VS = /* glsl */`
attribute vec4 iA;   // x, y, size, alpha
varying vec2 vLoc; varying float vAlpha;
void main() {
  vLoc = position.xy * 2.0 - 1.0;
  vec2 p = iA.xy + vLoc * iA.z;
  vAlpha = iA.w;
  gl_Position = projectionMatrix * viewMatrix * vec4(p.x, -p.y, 4.0, 1.0);
}
`;
export const SPECK_FS = /* glsl */`
uniform vec3 uCol;
varying vec2 vLoc; varying float vAlpha;
void main() { float r2 = dot(vLoc, vLoc); float a = (exp(-r2 * 9.0) + 0.35 * exp(-r2 * 2.5)) * vAlpha; gl_FragColor = vec4(uCol, min(a, 1.0)); }
`;
export const SPRITE_VS = /* glsl */`
varying vec2 vUV;
void main() { vUV = uv; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }
`;
export const SPRITE_FS = /* glsl */`
uniform sampler2D uTex;
uniform float uAlpha;
varying vec2 vUV;
void main() {
  vec4 c = texture(uTex, vUV);
  float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
  vec3 g = mix(c.rgb * vec3(0.92, 0.93, 1.08), c.rgb, smoothstep(0.08, 0.55, l));
  gl_FragColor = vec4(g, c.a * uAlpha);
}
`;
export const SPRITE_SH_FS = /* glsl */`
uniform sampler2D uTex;
uniform float uAlpha;
varying vec2 vUV;
void main() { gl_FragColor = vec4(0.0, 0.0, texture(uTex, vUV).a * uAlpha, 0.0); }
`;
