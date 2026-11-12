/*
 * 26 · the fragment shader. One full-screen pass draws every stage of the print: the copper plate on the bench
 * (burin cuts, inking, wiping), the damp sheet laid over it, and the finished impression on laid paper.
 * The picture itself is never "an image with a filter": each pixel asks "how dark should the moon be here?"
 * and then "is this pixel inside a burin line whose width encodes that darkness?".
 * Built from the constants main.js computes (crater count, line-family frames, maria).
 */
const v3 = (v) => `vec3(${v.map((x) => x.toFixed(5)).join(', ')})`;

export function buildFrag({ NC, FAM, MARE }) {
  return `#version 300 es
precision highp float;
precision highp sampler2D;
uniform vec2 stage;
uniform float uMirror, uHalo, uSky, uFrame, uText, uInk, uWipe, uSheet, uCurl, uSheen, uFade;
uniform vec4 uCut;          // burin progress of the line families A, B, C (0 → 1; 2 = finished plate)
uniform vec3 L, tycho, coper;
uniform sampler2D crTex;    // craters: row 0 centre.xyz + radius, row 1 depth/rim/peak/cos-limit, row 2 floor albedo/halo/flat floor
uniform sampler2D txTex;    // r: engraved lettering (design space), g: pencil notes (print space)
out vec4 o;

const float PI = 3.14159265;
const int NC = ${NC};
const vec2 MC = vec2(540.0, 741.0);  const float MR = 300.0;      // the moon (stage px, y down)
const vec2 FC = vec2(540.0, 741.0);  const vec2 FH = vec2(354.0, 455.0);   // the ruled image frame
const vec2 PC = vec2(540.0, 820.0);  const vec2 PH = vec2(390.0, 570.0);   // the copper plate = plate mark
const vec2 SC = vec2(540.0, 850.0);  const vec2 SH = vec2(470.0, 730.0);   // the sheet of paper
const float SKY = 5.6;                                                      // ruling pitch of the sky (px)
// three line families: parallels about an axis (ax), measured from a front direction e1 (seam behind the moon)
const vec3 AXA = ${v3(FAM.A[0])}, E1A = ${v3(FAM.A[1])}, E2A = ${v3(FAM.A[2])};
const vec3 AXB = ${v3(FAM.B[0])}, E1B = ${v3(FAM.B[1])}, E2B = ${v3(FAM.B[2])};
const vec3 AXC = ${v3(FAM.C[0])}, E1C = ${v3(FAM.C[1])}, E2C = ${v3(FAM.C[2])};
const float NA = 120.0, NB = 104.0, NCC = 96.0;                             // lines per half turn
const int NM = ${MARE.length};
const vec4 MARE[NM] = vec4[NM](${MARE.map((m) => `vec4(${m.slice(0, 4).map((x) => x.toFixed(5)).join(', ')})`).join(',\n  ')});   // centre, strength
const float MAREK[NM] = float[NM](${MARE.map((m) => m[4].toFixed(3)).join(', ')});                                      // 1/sigma^2

float sq(float x) { return x * x; }
float h11(float x) { x = fract(x * 0.1031); x *= x + 33.33; x *= x + x; return fract(x); }
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float h31(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float n2(vec2 x) {
  vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
}
float fbm2(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * n2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.3; a *= 0.5; } return s; }
float n3(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1, 0, 0)), f.x), mix(h31(i + vec3(0, 1, 0)), h31(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(h31(i + vec3(0, 0, 1)), h31(i + vec3(1, 0, 1)), f.x), mix(h31(i + vec3(0, 1, 1)), h31(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm3(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * n3(p); p = p * 2.07 + 11.3; a *= 0.5; } return s; }
float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdRBox(vec2 p, vec2 b, float r) { return sdBox(p, b - r) - r; }
vec2 boxN(vec2 p, vec2 b) { vec2 d = abs(p) - b; return d.x > d.y ? vec2(sign(p.x), 0.0) : vec2(0.0, sign(p.y)); }

// ================================================================ the moon: relief, albedo, light → darkness D
float mareMask(vec3 s) {
  float m = 0.0;
  for (int i = 0; i < NM; i++) m += MARE[i].w * exp(-(1.0 - dot(s, MARE[i].xyz)) * MAREK[i]);
  m += (fbm3(s * 4.2 + 3.1) - 0.47) * 0.55 + (n3(s * 13.0 + 1.7) - 0.5) * 0.18;
  return smoothstep(0.40, 0.62, m);
}
// bright ray systems of young craters: streaks in the azimuth around the crater, fading with distance
float rays(vec3 s, vec3 c, float len, float seed) {
  float th = acos(clamp(dot(s, c), -1.0, 1.0));
  vec3 e1 = normalize(cross(c, vec3(0.0, 0.0, 1.0)));
  vec3 e2 = cross(c, e1);
  float ang = atan(dot(s, e2), dot(s, e1) + 1e-6);
  float n = 0.5 * sin(ang * 5.0 + seed) + 0.35 * sin(ang * 11.0 + seed * 2.3) + 0.3 * sin(ang * 19.0 + seed * 4.1)
          + 0.22 * sin(ang * 31.0 + seed * 1.7) + 0.15 * sin(ang * 53.0 + seed * 3.3);
  return smoothstep(0.45, 1.05, n) * exp(-th / len) * smoothstep(0.03, 0.07, th);
}
// D in [0,1]: 0 = paper white, 1 = full ink. hgt = crater relief (sphere radii) for bending the lines.
float moonDark(vec3 s, out float hgt) {
  float h = 0.0, alb = 1.0, sh = 1.0, halo = 0.0;
  vec3 g = vec3(0.0);
  vec3 lt = L - s * dot(L, s);
  float lh = max(length(lt), 1e-4);
  vec3 ld = lt / lh;
  float tanE = dot(L, s) / lh;              // sun elevation above the local horizon
  for (int i = 0; i < NC; i++) {
    vec4 B = texelFetch(crTex, ivec2(i, 1), 0);
    vec4 A = texelFetch(crTex, ivec2(i, 0), 0);
    if (dot(s, A.xyz) < B.w) continue;      // farther than 2.2 radii: no influence
    vec4 C = texelFetch(crTex, ivec2(i, 2), 0);
    vec3 dv = s - A.xyz;
    float dl = max(length(dv), 1e-6);
    float x = dl / A.w;
    float f = 0.0, fp = 0.0;                 // profile f(x) and df/dx, x = distance / crater radius
    if (x < 1.0) {
      float b = x * x - 1.0;                 // parabolic bowl, optionally flooded flat (C.z)
      if (b > -C.z) { f = b; fp = 2.0 * x; } else f = -C.z;
      alb *= mix(1.0, C.x, 1.0 - smoothstep(0.8, 1.0, x));
      // the rim's shadow on the floor: march toward the sun in the crater plane, compare with the rim height
      vec3 qv = (dv - s * dot(dv, s)) / A.w;
      float qd = dot(qv, ld), qq = dot(qv, qv);
      float tr = -qd + sqrt(max(qd * qd - qq + 1.0, 0.0));
      sh = min(sh, smoothstep(-0.03, 0.03, tr * tanE - B.x * (B.y - f)));
    }
    float e = (x - 1.0) / 0.3, rim = exp(-e * e);
    f += B.y * rim; fp += B.y * rim * (-2.0 * e / 0.3);
    float pk = B.z * exp(-x * x * 40.0);     // central peak
    f += pk; fp -= pk * 80.0 * x;
    halo += C.y * exp(-x * x * 1.2);
    h += B.x * A.w * f;
    g += B.x * fp * dv / dl;                 // analytic gradient: d/ds of f(|s-c|/r)
  }
  hgt = h;
  vec3 n = normalize(s - (g - s * dot(g, s)));
  float mm = mareMask(s);
  alb *= mix(0.97, 0.50, mm) * (0.86 + 0.26 * fbm3(s * 10.0 + 5.3));
  alb += 0.32 * halo + 0.45 * rays(s, tycho, 0.55, 1.3) + 0.25 * rays(s, coper, 0.28, 4.1);
  alb = min(alb, 1.25);
  // Lambert mixed with Lommel–Seeliger (the airless full moon has almost no limb darkening)
  float lam = max(dot(n, L), 0.0);
  float ls = 2.0 * lam / (lam + max(s.z, 0.1));
  float tone = alb * mix(lam, min(ls, 1.2), 0.45) * sh;
  tone += 0.09 * alb * (1.0 - smoothstep(0.0, 0.18, dot(s, L)));   // earthshine on the night side
  return clamp(1.0 - 1.08 * tone, 0.0, 1.0);
}
` + LINES + SURFACES + MAIN;
}

// ================================================================ burin lines
const LINES = `
// coordinates of one line family on the sphere: v = latitude about the axis in line units (+ relief bend),
// ph = longitude from the front, cl = cos(latitude) (turns longitude into arc length)
void famCoord(vec3 s, vec3 ax, vec3 e1, vec3 e2, float N, float bend, out float v, out float ph, out float cl) {
  float sl = clamp(dot(s, ax), -1.0, 1.0);
  v = asin(sl) * N / PI + bend;
  cl = sqrt(max(1.0 - sl * sl, 0.0));
  ph = atan(dot(s, e2), dot(s, e1) + 1e-6);
}
// one family of engraved lines. c = ink coverage wanted (line width / pitch), duty = how continuous the line is
// (light tones break into flicks and dots), cut = burin progress. Returns the pixel's ink coverage.
float famInk(float v, float ph, float cl, float fv, float N, float c, float duty, float cut, float seed, inout float glint) {
  float i = floor(v + 0.5);
  float dv = abs(v - i);                     // distance to the line centre, in pitches
  float hi = h11(i * 1.618 + seed);
  float w = ph * cl * N / PI;                // arc length along the line, in pitches
  // the burin: lines are cut one after another (top first), each from one end to the other, tapering at the tip
  float ord = clamp(0.5 - i / N, 0.0, 1.0) * 0.72 + hi * 0.06;
  float pr = clamp((cut - ord) / 0.22, 0.0, 1.0);
  float toTip = (mix(-1.95, 1.95, pr) - ph) * cl * N / PI;
  float cutMask = pr >= 1.0 ? 1.0 : smoothstep(0.0, 5.0, toTip);
  if (pr > 0.0 && pr < 1.0) glint += exp(-toTip * toTip * 1.2) * exp(-dv * dv * 12.0) * step(0.05, c);
  c = clamp(c + (hi - 0.5) * 0.05, 0.0, 1.0);   // the hand: each line a little heavier or lighter
  // flicks: lens-shaped dashes whose length grows with the tone until they join into a swelling line
  float P = 1.7;
  float ws = w / P + hi * 13.7;
  float k = floor(ws + 0.5);
  float dw = (ws - k) * P;
  float hl = P * mix(0.2, 2.4, duty * duty) * (1.0 + (h11(k * 0.731 + i * 3.17 + seed) - 0.5) * 0.5 * (1.0 - duty));
  float u = dw / hl;
  float taper = max(1.0 - u * u, 0.0);
  float press = 1.0 + 0.14 * sin(w * 0.23 + hi * 6.28);          // burin pressure: the line swells and thins
  float hw = 0.5 * c * taper * press * cutMask;
  // exact box filter of the line [-hw, hw] over a pixel (fv = pitches per pixel): no aliasing, zero when hw = 0
  float a = hw / fv, d = dv / fv;
  float cov = max(0.0, min(a, d + 0.5) - max(-a, d - 0.5));
  return mix(cov, c * 0.9 * cutMask, smoothstep(0.32, 0.6, fv));   // lines denser than ~3 px: their mean tone
}
// stipple between the lines of family A: dots for the mid-tone transitions
float dotInk(float v, float ph, float cl, float fv, float r0, float cut) {
  float v2 = v + 0.5;
  float j = floor(v2 + 0.5);
  float hj = h11(j * 2.31 + 5.0);
  float w = ph * cl * NA / PI;
  float ws = w / 1.15 + hj * 9.1;
  float k = floor(ws + 0.5);
  float hk = h11(k * 1.37 + j * 7.7);
  vec2 dd = vec2(v2 - j + (hk - 0.5) * 0.18, (ws - k) * 1.15);
  float ord = clamp(0.5 - j / NA, 0.0, 1.0) * 0.72 + hj * 0.06;
  float pr = clamp((cut - ord) / 0.22, 0.0, 1.0);
  float shown = pr >= 1.0 ? 1.0 : step(ph, mix(-1.95, 1.95, pr) - 0.05);
  float r = r0 * (0.75 + 0.5 * hk) * shown;
  float a = r / fv, d = length(dd) / fv;
  return clamp(a - d + 0.5, 0.0, 1.0) * clamp(2.0 * a, 0.0, 1.0);
}
// stars: small gaps in the ruled sky, a round spot with four short arms (3×3 cells: a star may cross its cell)
float starGap(vec2 q) {
  vec2 id = floor(q / 64.0);
  float k = 1.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 c = id + vec2(i, j);
    float h = h21(c + 11.0);
    if (h > 0.16) continue;
    vec2 sp = (c + 0.5 + (vec2(h21(c + 3.1), h21(c + 7.7)) - 0.5) * 0.8) * 64.0;
    float r = 1.4 + 2.6 * sq(1.0 - h / 0.16);
    vec2 d = abs(q - sp);
    float dist = min(length(d), min(d.y * 3.0 + d.x * 0.36, d.x * 3.0 + d.y * 0.36));
    k *= smoothstep(r - 0.7, r + 0.7, dist);
  }
  return k;
}
`;

// ================================================================ materials: bench, copper, paper
const SURFACES = `
vec3 bench(vec2 p) {                       // dark walnut under a pool of lamplight
  float g = fbm2(vec2(p.x * 0.010, p.y * 0.0012) + 3.0);
  float rings = 0.5 + 0.5 * sin(p.x * 0.045 + g * 9.0 + 2.0 * fbm2(p * 0.003));
  vec3 c = mix(vec3(0.050, 0.032, 0.022), vec3(0.125, 0.078, 0.050), rings * 0.55 + g * 0.45);
  vec2 d = (p - vec2(470.0, 760.0)) / vec2(820.0, 1150.0);
  return c * (0.42 + 0.78 * exp(-dot(d, d)));
}
// polished copper: warm base, the soft reflection of a window sliding over it, polishing scratches, bevelled edge
vec3 copper(vec2 p, float dpl) {
  float u = dot(p - PC, normalize(vec2(0.8, 0.6)));
  float band = exp(-sq((u - uSheen) / 250.0)) + 0.35 * exp(-sq((u - uSheen + 520.0) / 140.0));
  float scr = n2(vec2(p.x * 0.004, p.y * 0.8)) * 0.6 + n2(vec2(p.x * 0.01 + 5.0, p.y * 2.3)) * 0.4;
  float y = (p.y - (PC.y - PH.y)) / (2.0 * PH.y);
  vec3 c = vec3(0.60, 0.33, 0.20) * (0.62 - 0.22 * y) * (0.92 + 0.16 * fbm2(p * 0.01));
  c += vec3(1.0, 0.74, 0.56) * band * (0.30 + 0.30 * scr);
  if (dpl > -9.0) {                         // the bevel: a narrow facet tilted outward, lit from the top left
    vec2 nb = boxN(p - PC, PH);
    float lit = dot(nb, vec2(-0.6, -0.8));
    c = c * (1.0 + 0.55 * lit) + vec3(1.0, 0.8, 0.62) * max(lit, 0.0) * 0.18;
  }
  return c;
}
float sdSheet(vec2 p) {                     // a deckled sheet: the hand-made edge wanders and frays
  return sdBox(p - SC, SH) + (fbm2(p * 0.025) - 0.47) * 8.0 + (n2(p * 0.21) - 0.5) * 2.0;
}
float paperH(vec2 p) {                      // fibres + laid lines (the wire mould's imprint)
  return 0.55 * fbm2(p * 0.09) + 0.22 * n2(p * 0.5) + 0.10 * sin(p.y * 1.43 + 0.6 * n2(p * 0.02));
}
// laid paper under a raking light from the top left; pressed = inside the plate mark (flattened by the press)
vec3 paper(vec2 p, float pressed, vec2 embossGrad, bool front) {
  float h0 = paperH(p);
  vec2 g = vec2(paperH(p + vec2(1.0, 0.0)) - h0, paperH(p + vec2(0.0, 1.0)) - h0) * mix(1.0, 0.35, pressed);
  g += embossGrad;
  float lit = 1.0 + dot(g, vec2(0.6, 0.8)) * 1.5;
  vec3 c = front ? vec3(0.935, 0.890, 0.790) : vec3(0.900, 0.875, 0.812);
  c *= 0.965 + 0.07 * n2(p * 0.012);                                                   // mottling of the pulp
  float cx = (fract((p.x + 3.0 * sin(p.y * 0.004)) / 104.0) - 0.5) * 104.0;          // chain lines
  c *= 1.0 - 0.022 * exp(-cx * cx / 5.0) * (1.0 - pressed * 0.5);
  float speck = smoothstep(0.87, 0.95, n2(p * 0.55 + 17.0)) * smoothstep(0.62, 0.8, n2(p * 0.03 + 4.0));
  c = mix(c, vec3(0.55, 0.45, 0.33), speck * 0.25);                                  // stray fibres and flecks
  vec2 d = (p - vec2(330.0, 420.0)) / 1500.0;
  return c * lit * (1.05 - 0.10 * length(d));
}
`;

// ================================================================ compose one pixel
const MAIN = `
void main() {
  vec2 p = vec2(gl_FragCoord.x, stage.y - gl_FragCoord.y);          // stage px, y down
  vec2 q = uMirror > 0.5 ? vec2(stage.x - p.x, p.y) : p;            // the plate carries the mirror image of the print

  // ---- what the engraver sees: the moon at q, as darkness D
  vec2 dm = (q - MC) / MR; dm.y = -dm.y;
  float rr = length(dm);
  float moonCov = clamp((1.0 - rr) * MR + 0.5, 0.0, 1.0);
  vec3 s = rr < 1.0 ? vec3(dm, sqrt(max(1.0 - rr * rr, 0.0))) : vec3(dm / max(rr, 1e-4), 0.0);
  float D = 0.0, hgt = 0.0;
  if (rr < 1.0 + 3.0 / MR) D = moonDark(s, hgt);

  // ---- how the engraver says it: three families of lines that wrap the sphere and bend over the relief
  float vA, pA, kA, vB, pB, kB, vC, pC, kC;
  famCoord(s, AXA, E1A, E2A, NA, hgt * NA / PI * 2.6, vA, pA, kA);
  famCoord(s, AXB, E1B, E2B, NB, hgt * NB / PI * 1.6, vB, pB, kB);
  famCoord(s, AXC, E1C, E2C, NCC, hgt * NCC / PI * 1.2, vC, pC, kC);
  float fA = max(fwidth(vA), 1e-3), fB = max(fwidth(vB), 1e-3), fC = max(fwidth(vC), 1e-3);
  float glint = 0.0;
  float mA = famInk(vA, pA, kA, fA, NA, clamp(D * 0.82, 0.0, 0.68), smoothstep(0.03, 0.36, D), uCut.x, 0.0, glint);
  float mB = famInk(vB, pB, kB, fB, NB, clamp((D - 0.40) * 1.05, 0.0, 0.5), smoothstep(0.40, 0.58, D), uCut.y, 3.0, glint);
  float mC = famInk(vC, pC, kC, fC, NCC, clamp((D - 0.68) * 1.45, 0.0, 0.42), smoothstep(0.68, 0.82, D), uCut.z, 7.0, glint);
  float rdot = 0.17 * smoothstep(0.10, 0.26, D) * (1.0 - smoothstep(0.38, 0.55, D));
  float mD = dotInk(vA, pA, kA, fA, rdot, uCut.x);
  float inkMoon = (1.0 - (1.0 - mA) * (1.0 - mB) * (1.0 - mC) * (1.0 - mD)) * moonCov;

  // ---- the sky: machine-ruled horizontal lines that thin into a halo of moonlight, gaps for stars
  vec2 fq = q - FC;
  float inFrame = clamp(min(FH.x - abs(fq.x), FH.y - abs(fq.y)) + 0.5, 0.0, 1.0);
  float vs = (q.y - (FC.y - FH.y)) / SKY;
  float iS = floor(vs + 0.5), dvs = abs(vs - iS);
  float prs = clamp((uSky - iS / (2.0 * FH.y / SKY) * 0.82) / 0.18, 0.0, 1.0);
  float xTip = mix(FC.x - FH.x - 40.0, FC.x + FH.x + 40.0, prs);
  float dist = length(q - MC);
  float cs = mix(0.46, 0.34, clamp((q.y - (FC.y - FH.y)) / (2.0 * FH.y), 0.0, 1.0));
  cs *= mix(0.12 + 0.6 * (1.0 - uHalo), 1.0, smoothstep(MR + 2.0, MR + 160.0, dist));
  cs *= mix(1.0, starGap(q), smoothstep(MR + 40.0, MR + 80.0, dist));
  float aS = 0.5 * cs * smoothstep(0.0, 30.0, xTip - q.x) * SKY, ds = dvs * SKY;
  float skyCov = max(0.0, min(aS, ds + 0.5) - max(-aS, ds - 0.5)) * inFrame * (1.0 - moonCov);

  // ---- border rules (a heavy and a fine line) and the engraved lettering
  float db = sdBox(fq, FH);
  float bShow = smoothstep(0.0, 0.01, uFrame * 1.02 - (atan(fq.y, fq.x + 1e-6) / (2.0 * PI) + 0.5));
  float b1 = clamp(1.7 - abs(db - 7.0) + 0.5, 0.0, 1.0), b2 = clamp(0.6 - abs(db) + 0.5, 0.0, 1.0);
  float bor = (1.0 - (1.0 - b1) * (1.0 - b2)) * bShow;
  float let = textureLod(txTex, q / stage, 0.0).r * smoothstep(0.0, 20.0, mix(150.0, 950.0, uText) - q.x);

  float ink = 1.0 - (1.0 - inkMoon) * (1.0 - skyCov) * (1.0 - bor) * (1.0 - let);
  vec2 gm = vec2(dFdx(ink), -dFdy(ink));                              // ink gradient, y down

  vec3 col = bench(p);
  if (uCurl <= 0.0) {
    // ================= the plate on the bench: cutting, inking, wiping, then the damp sheet laid on it
    float dsh = sdRBox(p - PC - vec2(14.0, 22.0), PH, 10.0);
    col *= 1.0 - 0.6 * (1.0 - smoothstep(-14.0, 46.0, dsh));
    float dpl = sdRBox(p - PC, PH, 7.0);
    float pcov = clamp(0.5 - dpl, 0.0, 1.0);
    if (pcov > 0.0) {
      vec3 cu = copper(p, dpl);
      float film = smoothstep(0.0, 0.3, uInk * 1.35 - fbm2(p * 0.005) * 0.35);           // dabbed on in blotches
      float wf = dot(p - (PC - PH), normalize(vec2(1.0, 1.25))) / 1400.0 + 0.07 * (fbm2(p * 0.004) - 0.5);
      float wiped = smoothstep(0.0, 0.06, uWipe * 1.15 - wf - 0.04);
      vec2 rp = mat2(0.94, -0.34, 0.34, 0.94) * p;                                           // tarlatan streaks
      float resid = 0.05 + 0.20 * smoothstep(0.35, 0.8, fbm2(rp * vec2(0.0025, 0.03))) + 0.12 * exp(-max(-dpl, 0.0) / 14.0);
      float surf = film * mix(1.0, resid, wiped);
      float lip = clamp(dot(gm, vec2(-0.6, -0.8)) * 1.6, 0.0, 1.0);   // the groove wall facing the lamp
      vec3 groove = mix(vec3(0.16, 0.075, 0.045), vec3(0.025, 0.02, 0.02), film);
      vec3 pc = mix(cu, groove, ink * 0.92);
      pc += vec3(1.0, 0.80, 0.62) * (lip * 0.5 + min(glint, 1.5) * 0.9) * (1.0 - film);
      float gloss = exp(-sq((dot(p - PC, normalize(vec2(0.8, 0.6))) - uSheen) / 250.0));
      pc = mix(pc, vec3(0.045, 0.038, 0.036) + vec3(0.30, 0.27, 0.25) * gloss * 0.35, surf);
      col = mix(col, pc, pcov);
    }
    if (uSheet > 0.0) {
      vec2 ps = p - vec2(0.0, (1.0 - uSheet) * -1780.0);
      col *= 1.0 - 0.5 * (1.0 - smoothstep(-24.0, 40.0, sdSheet(ps - vec2(8.0, 16.0))));
      col = mix(col, paper(ps, 0.0, vec2(0.0), false) * 0.97, clamp(0.5 - sdSheet(ps), 0.0, 1.0));
    }
  } else {
    // ================= the impression, uncovered as the sheet is turned from its corner
    col *= 1.0 - 0.5 * (1.0 - smoothstep(-24.0, 40.0, sdSheet(p - vec2(8.0, 16.0))));
    float scov = clamp(0.5 - sdSheet(p), 0.0, 1.0);
    float sc = dot(p - vec2(1010.0, 1580.0), normalize(vec2(-0.55, -1.0)));
    float F = mix(-150.0, 1980.0, uCurl);
    float bw = 120.0 * (1.0 - 0.4 * uCurl);
    vec3 pc;
    if (sc < F - bw || uCurl >= 1.0) {
      // plate mark: the damp paper pressed into the plate, its bevel embossed as a ridge of light and shade
      float pm = sdRBox(p - PC, PH, 7.0);
      float e0 = 1.0 - smoothstep(-7.0, 2.0, pm);
      float ex = 1.0 - smoothstep(-7.0, 2.0, sdRBox(p + vec2(1.0, 0.0) - PC, PH, 7.0));
      float ey = 1.0 - smoothstep(-7.0, 2.0, sdRBox(p + vec2(0.0, 1.0) - PC, PH, 7.0));
      pc = paper(p, e0, -1.2 * vec2(ex - e0, ey - e0), true);
      vec2 rp = mat2(0.94, 0.34, -0.34, 0.94) * p;
      float tone = e0 * (0.03 + 0.06 * smoothstep(0.35, 0.8, fbm2(rp * vec2(0.0025, 0.03))) + 0.10 * exp(-max(-pm, 0.0) / 12.0));
      vec3 inkc = vec3(0.085, 0.066, 0.056) * (0.85 + 0.3 * n2(p * 0.6));
      pc = mix(pc, inkc, tone);                                                // plate tone left by the wipe
      pc = mix(pc, inkc, ink * 0.94);
      pc += vec3(0.05, 0.045, 0.04) * clamp(dot(gm, vec2(0.6, 0.8)) * 1.5, 0.0, 1.0) * ink;   // raised ink lines
      float pen = textureLod(txTex, p / stage, 0.0).g * (0.65 + 0.5 * n2(p * 0.7));
      pc = mix(pc, vec3(0.36, 0.36, 0.38), pen * 0.7);                          // graphite catches the paper's tooth
      if (uCurl < 1.0) pc *= 1.0 - 0.38 * exp(-max(F - bw - sc, 0.0) / 38.0);  // shadow of the lifting sheet
    } else if (sc < F) {
      pc = paper(p, 0.0, vec2(0.0), false) * (0.70 + 0.42 * sin((F - sc) / bw * 2.6 + 0.25));   // the curl
    } else {
      pc = paper(p, 0.0, vec2(0.0), false) * 0.97;
    }
    col = mix(col, pc, scov);
  }
  vec2 vg = (p - vec2(540.0, 860.0)) / vec2(900.0, 1250.0);
  col *= 1.0 - 0.16 * dot(vg, vg);
  o = vec4(clamp(col, 0.0, 1.0) * uFade, 1.0);
}
`;
