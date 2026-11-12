/*
 * 51-topo-type/shader.js — one fragment shader prints the whole sheet: table, paper, neatline, and the map.
 *   field(q)  the terrain: a signed distance (stage px, + sea / − land) that starts as a point (the drop) and
 *             becomes 물결 → 바람결 → 숨결. Each change is an SDF interpolation with a smooth-min union mixed in
 *             at mid-way (blend), and the blend weight k travels over the sheet (radial / left→right wipes).
 *   sea       bathymetric lines on F(d) = LS·ln(1 + d/LS)/s0 — the spacing widens away from the coast (old
 *             "water lining"); they flow outward with uPhase; every 5th is an index line; stepped tints.
 *   land      height contours every SL px of depth, stepped tints, hillshade from the SDF gradient, illuminated
 *             (Tanaka-style) line weight, and a soft cast shadow onto the sea.
 *   print     three plates (K coast, blue sea, sienna land) each a little off register; low-frequency domain
 *             warp so the lines look hand-surveyed; wind streaks during 바람결.
 * Everything is a function of the uniforms (pure in t) — fwidth-style AA uses the screen-space gradient.
 */
export const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const f = (x) => Number(x).toFixed(4);
const v4 = (a) => `vec4(${a.map(f).join(', ')})`;

export const frag = (K) => `#version 300 es
precision highp float;
uniform sampler2D uSdf;                // RGBA16F: r = 물결, g = 바람결, b = 숨결 (stage px)
uniform float uT, uPhase, uWind, uWindAmp, uS0, uLw, uTint, uFade, uRf, uRd, uPacket, uKOn, uBreath, uFrame;
uniform vec2 uC, uL;                   // the drop; direction toward the sun (y down)
out vec4 o;

const vec2 RES = vec2(1080.0, 1920.0);
const vec4 SHEET = ${v4(K.sheet)};
const vec4 FRAME = ${v4(K.frame)};
const vec3 PAPER  = vec3(0.953, 0.931, 0.884);
const vec3 INK_K  = vec3(0.105, 0.135, 0.190);   // charcoal navy
const vec3 INK_B  = vec3(0.175, 0.340, 0.475);   // prussian blue
const vec3 INK_S  = vec3(0.560, 0.300, 0.185);   // burnt sienna
const vec3 TINT_B = vec3(0.565, 0.720, 0.775);
const vec3 TINT_S = vec3(0.900, 0.665, 0.450);
const vec2 OFF_B = vec2(1.4, -0.9), OFF_S = vec2(-0.8, 0.7);   // misregistration of the two colour plates
const float LS = 420.0, SL = 8.0;

float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), u = fract(p);
  u = u * u * (3.0 - 2.0 * u);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float sst(float x) { x = clamp(x, 0.0, 1.0); return x * x * (3.0 - 2.0 * x); }
float smin(float a, float b, float r) { float h = max(r - abs(a - b), 0.0) / r; return min(a, b) - h * h * r * 0.25; }
// SDF interpolation; half-way it leans toward the smooth union, so the shapes melt instead of shrinking apart
float blend(float a, float b, float k) { return mix(mix(a, b, k), smin(a, b, 36.0), 2.2 * k * (1.0 - k)); }
float sdBoxSq(vec2 p, vec2 h) { vec2 d = abs(p) - h; return max(d.x, d.y); }
float sdBox(vec2 p, vec2 h) { vec2 d = abs(p) - h; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
// exact coverage of a line of width w (px) by a 1-px box filter, c = distance (px) from the line's centre
float box(float c, float w) { return clamp(min(c + 0.5 * w, 0.5) - max(c - 0.5 * w, -0.5), 0.0, 1.0); }
// screen-space gradient length (isotropic, unlike fwidth)
float aaw(float v) { return max(length(vec2(dFdx(v), dFdy(v))), 1e-4); }

// the terrain at stage point q; n = a low-frequency noise that staggers each change a little
float field(vec2 q, float n) {
  vec3 s = texture(uSdf, q / RES).rgb;
  float r = length(q - uC);
  float k0 = sst((uT - ${f(K.T0)} - r / ${f(K.V0)} - 0.35 * n) / ${f(K.D0)});        // drop → 물결, from the centre out
  float k1 = sst((uT - ${f(K.T1)} - q.x / 1080.0 * 0.5 - 0.3 * n) / ${f(K.D1)});     // → 바람결, the wind sweeps left → right
  float k2 = sst((uT - ${f(K.T2)} - r / ${f(K.V2)} - 0.3 * n) / ${f(K.D2)});         // → 숨결, an exhale from the centre
  float w = blend(blend(s.r, s.g, k1), s.b, k2);
  return blend(r - uRd, w, k0);
}

// paper: two scales of mottling, and fibres as hash-grid sprites (3×3 neighbour cells, so none is cut off)
vec3 paper(vec2 q) {
  vec3 c = PAPER * (0.978 + 0.035 * vnoise(q * 0.008 + 2.0) + 0.022 * (vnoise(q * 0.42) - 0.5));
  vec2 cell = floor(q / 16.0);
  float fib = 0.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = cell + vec2(i, j);
    float h = hash(id * 1.37 + 4.1);
    if (h < 0.7) continue;
    vec2 ctr = (id + vec2(hash(id + 1.7), hash(id + 8.3))) * 16.0;
    float a = hash(id + 3.9) * 6.2832, len = 4.0 + 9.0 * hash(id + 5.5);
    vec2 dir = vec2(cos(a), sin(a)), d = q - ctr;
    float along = clamp(dot(d, dir), -len, len);
    float dist = length(d - dir * along);
    fib += (h > 0.86 ? -0.05 : 0.035) * smoothstep(0.9, 0.2, dist);
  }
  return c * (1.0 - fib);
}

void main() {
  vec2 q = vec2(gl_FragCoord.x, RES.y - gl_FragCoord.y);

  // ---------- the table and the sheet's shadow on it
  vec3 table = vec3(0.068, 0.073, 0.083) * (0.86 + 0.22 * vnoise(q * 0.004) + 0.06 * vnoise(q * 0.35));
  table *= 1.0 - 0.4 * smoothstep(0.25, 1.15, length((q - vec2(540.0, 820.0)) / vec2(860.0, 1250.0)));
  vec2 sc = 0.5 * (SHEET.xy + SHEET.zw), sh = 0.5 * (SHEET.zw - SHEET.xy);
  float sdSheet = sdBox(q - sc, sh);
  table *= 1.0 - 0.72 * (1.0 - smoothstep(-34.0, 46.0, sdBox(q - sc - vec2(9.0, 18.0), sh - 8.0)));

  // ---------- where the surveyor's lines are drawn: low-frequency wobble + the wind's streaks
  float n = vnoise(q * 0.0035 + 7.0);
  float d0 = field(q, n);
  float amp = 1.4 + min(abs(d0) * 0.028, 11.0);
  vec2 warp = (vec2(vnoise(q * 0.0055 + vec2(3.1, 9.2) + uT * 0.035), vnoise(q * 0.0055 + vec2(8.7, 1.3) - uT * 0.035)) - 0.5) * 2.0 * amp;
  vec2 wn = vec2(vnoise(vec2(q.x * 0.0026 - uWind, q.y * 0.010)), vnoise(vec2(q.x * 0.0026 - uWind + 5.2, q.y * 0.010 + 3.7))) - 0.5;
  warp += wn * vec2(0.8, 2.0) * uWindAmp * smoothstep(0.0, 140.0, d0);
  vec2 p = q + warp;
  float dK = field(p, n), dB = field(p + OFF_B, n), dS = field(p + OFF_S, n);

  // ---------- sea plate (blue): bathymetric lines flowing outward, stepped depth tints
  float r = length(q - uC);
  float front = smoothstep(uRf, uRf - 150.0, r);
  float lead = (uRf - r) / 170.0;
  float packet = mix(0.28 + 0.72 * exp(-lead * lead), 1.0, uPacket);
  float fs = (LS / uS0) * log(1.0 + max(dB, 0.0) / LS) - uPhase;
  float ni = floor(fs + 0.5);
  float isIdx = 1.0 - step(0.5, mod(ni, 5.0));
  float seaM = smoothstep(-0.6, 0.6, dB);
  float lineB = box(abs(fs - ni) / aaw(fs), mix(0.85, 1.75, isIdx) * uLw) * mix(0.52, 0.88, isIdx);
  lineB *= seaM * smoothstep(1.5, 6.0, dB) * front * packet * (0.86 + 0.28 * vnoise(q * 0.9 + 11.0));
  float depth = max(floor(fs) + uPhase, 0.0);
  float seaCov = (0.10 + 0.34 * (1.0 - exp(-depth / 7.0))) * uTint * seaM * front * (0.95 + 0.1 * vnoise(q * 0.3 + 5.0));

  // ---------- land plate (sienna): height contours, stepped tints, hillshade from the SDF gradient
  float u = max(-dS, 0.0);
  float fl = u / SL - 0.3 * uBreath;
  float nl = floor(fl + 0.5);
  float lIdx = 1.0 - step(0.5, mod(nl, 5.0));
  float landM = smoothstep(0.6, -0.6, dS);
  vec2 ps = p + OFF_S, e = vec2(1.5, 0.0);
  vec2 g = vec2(field(ps + e.xy, n) - field(ps - e.xy, n), field(ps + e.yx, n) - field(ps - e.yx, n));
  g /= max(length(g), 1e-5);                                   // outward (downhill) direction
  float slope = 1.35 * exp(-u / 22.0) + 0.1;                   // dz/du: steep at the shore, a plateau on the ridge
  vec3 N = normalize(vec3(g * slope, 1.0));
  vec3 Ls = normalize(vec3(uL * 0.78, 0.62));
  float hs = clamp(dot(N, Ls) / Ls.z, 0.35, 1.6);              // 1 = flat
  float hb = max(floor(fl), 0.0);
  float landCov = (0.20 + 0.30 * clamp(hb / 4.0, 0.0, 1.0)) * mix(0.75, 1.0, uTint) * landM;
  float lineS = box(abs(fl - nl) / aaw(fl), mix(0.8, 1.5, lIdx) * uLw) * mix(0.6, 0.9, lIdx) * step(0.5, nl) * landM;
  lineS *= mix(1.25, 0.55, clamp((hs - 0.7) / 0.8, 0.0, 1.0)); // illuminated contours: pale in the sun, dark in shade
  float castSh = smoothstep(5.0, -9.0, field(ps + uL * 15.0, n)) * seaM;

  // ---------- K plate: the coastline
  float lineK = box(abs(dK) / aaw(dK), 2.3 * mix(1.0, uLw, 0.6)) * uKOn;

  // ---------- print: inks are transparent films, laid on the paper one after another
  vec3 pap = paper(q);
  vec3 m = pap;
  m *= mix(vec3(1.0), TINT_B, seaCov);
  m *= mix(vec3(1.0), TINT_S, landCov);
  m *= mix(1.0, hs, 0.55 * landM);
  m *= 1.0 - 0.10 * castSh * uTint;
  m *= mix(vec3(1.0), INK_B, lineB);
  m *= mix(vec3(1.0), INK_S, lineS);
  m *= mix(vec3(1.0), INK_K, lineK * 0.92);

  // ---------- neatline: hairline map border, a heavy outer rule, alternating bars between (a topo-map border)
  vec2 fc = 0.5 * (FRAME.xy + FRAME.zw), fh = 0.5 * (FRAME.zw - FRAME.xy);
  float sq = sdBoxSq(q - fc, fh);
  float inMap = smoothstep(0.5, -0.5, sq);
  vec3 col = mix(pap, m, inMap);
  vec2 ad = abs(q - fc) - fh;
  float along = ad.x > ad.y ? (q.y - FRAME.y) / (1420.0 / 24.0) : (q.x - FRAME.x) / (928.0 / 16.0);
  float bar = step(0.5, fract(along * 0.5)) * smoothstep(-0.5, 0.5, sq - 0.6) * smoothstep(0.5, -0.5, sq - 6.4);
  float frameInk = max(box(abs(sq), 0.8), box(abs(sq - 7.0), 1.9));
  frameInk = max(frameInk, bar * 0.9);
  // grid crosses (the printed graticule)
  vec2 gq = (q - FRAME.xy) / vec2(232.0, 1420.0 / 6.0);
  vec2 gd = (fract(gq + 0.5) - 0.5) * vec2(232.0, 1420.0 / 6.0);
  float arm = 9.0;
  float grat = max(box(abs(gd.x), 0.9) * smoothstep(arm + 0.5, arm - 0.5, abs(gd.y)),
                    box(abs(gd.y), 0.9) * smoothstep(arm + 0.5, arm - 0.5, abs(gd.x))) * inMap * smoothstep(-20.0, -40.0, sq);
  col *= mix(vec3(1.0), INK_K, max(frameInk * 0.95, grat * 0.42));

  // ---------- light on the sheet, its cut edge, then the sheet on the table
  col *= 1.035 - 0.05 * (q.y / RES.y) - 0.03 * (q.x / RES.x);
  col *= 1.0 - 0.06 * smoothstep(-3.0, 0.0, sdSheet);
  vec3 c = mix(table, col, smoothstep(0.7, -0.7, sdSheet));
  c *= uFade;
  c += (hash(q + uFrame * 7.31) - 0.5) * 0.012;
  o = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;
