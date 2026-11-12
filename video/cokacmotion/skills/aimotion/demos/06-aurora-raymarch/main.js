/*
 * 06 · 오로라, 빛의 커튼 — volumetric aurora in three WebGL2 passes.
 *
 * Each curtain is a thin vertical sheet standing on a ribbon in the horizontal plane. JS builds the two
 * ribbons per frame as polylines (a tilted base line + travelling trochoid folds that can curl back on
 * themselves) and uploads them as a tiny float texture.
 * Pass 0 (field): bakes, for both ribbons, the signed horizontal distance and the arc length at the nearest
 *   point into a 800×560 float texture covering 1600 × 1040 km.
 * Pass 1 (volume → half-float texture, 0.62×): every view ray above the horizon is marched through the
 *   85–380 km shell over a curved Earth, only inside each curtain's window. Per segment the sheet's Gaussian
 *   cross-section is integrated exactly (erf of the linearly varying distance), so a ~3 km sheet stays crisp
 *   with 34 segments and brightens correctly where the line of sight grazes a fold. Emission by altitude:
 *   pink-violet lower border (~95 km), green 100–200 km with field-aligned rays, red above 200 km.
 * Pass 2 (scene → canvas): sky, stars, four silhouette layers at real distances, and a lake that reflects
 *   by re-tracing the scene from a virtual camera under the water, with ripples, Fresnel, smear and mist;
 *   bloom from the volume texture's mip chain; tone map. Every uniform is a pure function of t.
 */
import { defineDemo, track, ease } from '../_lib/stage.js';

const SKY_SCALE = 0.62;          // pass-1 resolution relative to the stage
const NP = 160, X0 = -1000, DX = 2000 / (NP - 1);   // ribbon polyline: points, start x, spacing (km)

const COMMON = `#version 300 es
precision highp float;
uniform vec2 stage;
uniform float focal, t;
uniform vec3 camF, camR, camU;
float h11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float n1(float x) { float i = floor(x), f = fract(x); float u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); return mix(h11(i), h11(i + 1.0), u) * 2.0 - 1.0; }
vec3 dirOf(vec2 px) { return normalize(camF * focal + camR * (px.x - 0.5 * stage.x) + camU * (px.y - 0.5 * stage.y)); }
vec2 uvOf(vec3 d) { float z = max(dot(d, camF), 1e-3); return vec2(dot(d, camR), dot(d, camU)) * focal / z / stage + 0.5; }
`;

// ---------------------------------------------------------------- pass 0: curtain distance field
// Each curtain is a ribbon in the horizontal plane (x east, z north, km), built per frame in JS as a
// polyline that can fold and curl back on itself. This pass bakes, for both curtains, the signed
// horizontal distance to the ribbon and the arc length at the nearest point into one float texture.
const FIELD_FRAG = `#version 300 es
precision highp float;
uniform sampler2D pts;            // NP × 2 texels: (x, z, arc length, 0) per curve
uniform vec4 dom;                 // field domain: xmin, zmin, xmax, zmax (km)
uniform vec2 fres;
uniform vec4 base[2];             // per curve: tilt dz/dx, z0, bend, window half-span
uniform float X0, DX;
out vec4 o;
const int NP = ${NP};
const int WIN = 28;
vec2 field(int c, vec2 p) {
  vec4 b = base[c];
  float xp = (p.x + b.x * (p.y - b.y)) / (1.0 + b.x * b.x);    // projection onto the curve's base line
  int i0 = int(floor((xp - X0) / DX)) - WIN / 2;
  float best = 1e12, sd = 0.0, sArc = 0.0;
  vec4 a = texelFetch(pts, ivec2(clamp(i0, 0, NP - 1), c), 0);
  for (int k = 1; k <= WIN; k++) {
    vec4 e = texelFetch(pts, ivec2(clamp(i0 + k, 0, NP - 1), c), 0);
    vec2 ab = e.xy - a.xy, ap = p - a.xy;
    float h = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
    vec2 q = ap - ab * h;
    float d2 = dot(q, q);
    if (d2 < best) { best = d2; sd = (ab.x * ap.y - ab.y * ap.x >= 0.0 ? 1.0 : -1.0) * sqrt(d2); sArc = mix(a.z, e.z, h); }
    a = e;
  }
  return vec2(sd, sArc);
}
void main() {
  vec2 p = mix(dom.xy, dom.zw, gl_FragCoord.xy / fres);
  o = vec4(field(0, p), field(1, p));
}`;

// ---------------------------------------------------------------- pass 1: the aurora volume
const SKY_FRAG = COMMON + `
uniform vec2 res;
uniform sampler2D fld;
uniform vec4 dom;
uniform vec4 base[2];
uniform vec2 sheetI;                        // brightness of each curtain
uniform float surge, redAmt, violet, rayPh, foldPh, pixAng;
uniform vec3 front;                         // breakup: arc length of the running front, glow behind it, flash at it
out vec4 o;
const float RE = 6371.0;                    // Earth radius, km
const vec3 GREEN = vec3(0.10, 1.00, 0.42);  // atomic oxygen 557.7 nm
const vec3 RED = vec3(0.80, 0.06, 0.22);    // atomic oxygen 630.0 nm (high, thin air)
const vec3 VIOLET = vec3(0.85, 0.14, 0.80); // N2 / N2+ (deepest electrons, lower border)

float erfa(float x) { return tanh(1.2027 * x); }
// horizontal distance at which a ray of slope tanE reaches altitude h over a curved Earth
float rAt(float h, float tanE) { return 2.0 * h / (tanE + sqrt(tanE * tanE + 2.0 * h / RE)); }
vec4 fieldAt(vec2 xz) { return textureLod(fld, (xz - dom.xy) / (dom.zw - dom.xy), 0.0); }

// emission at altitude h on curtain c at arc length s: altitude profile × rays × patches
// fs = how many km of curtain one pixel spans at the crossing: ray detail finer than that is averaged out
vec3 emit(int c, float s, float h, float fs) {
  float p = c == 0 ? 3.1 : 11.7;
  float hb = 103.0 - 8.0 * surge + 5.0 * n1(s * 0.025 + p * 3.0 + foldPh * 0.5);   // lower border (km)
  float u = h - hb;
  float r1 = 0.5 + 0.5 * n1(s * 0.16 + rayPh + p * 5.0);
  float r2 = 0.5 + 0.5 * n1(s * 0.47 - rayPh * 1.6 + p);
  float r2s = r2 * r2; r2s *= r2s * r2;
  r1 = mix(0.5, r1, clamp(1.0 - fs * 0.24, 0.0, 1.0));
  r2s = mix(0.09, r2s, clamp(1.0 - fs * 0.70, 0.0, 1.0));
  float ray = 0.40 + 0.40 * r1 * r1 + 1.5 * r2s;                                    // field-aligned rays
  float edge = smoothstep(-1.0, 0.6, u);
  float up = max(u, 0.0);
  float g = edge * (0.55 * ray * exp(-up / (14.0 + 30.0 * ray)) + 1.1 * exp(-up / 11.0) + 1.1 * exp(-up / 3.0));
  float rd = smoothstep(170.0, 245.0, h) * exp(-max(h - 245.0, 0.0) / 85.0) * (0.35 + 0.5 * r1 + 0.6 * r2s) * redAmt;
  float v = exp(-((u + 0.5) / 1.6) * ((u + 0.5) / 1.6)) * violet * (0.6 + 0.6 * ray);
  float along = 0.30 + 0.70 * smoothstep(-0.5, 0.7, n1(s * 0.011 + p * 0.7 - foldPh * 0.35));
  if (c == 0) {   // the substorm breakup runs along the main curtain from the horizon toward the zenith
    float ds = s - front.x;
    along *= 1.0 + front.y * smoothstep(120.0, -320.0, ds) + front.z * exp(-ds * ds / 36000.0);
  }
  return (GREEN * g + RED * rd * 0.5 + VIOLET * v) * along;
}

// march one curtain inside its window; each segment integrates the sheet's Gaussian cross-section
// exactly (g = signed horizontal distance to the ribbon, linear along the segment)
vec3 curtain(int c, vec2 hd, float tanE, float cosE, float r0, float r1) {
  vec4 b = base[c];
  float den = hd.y - b.x * hd.x;
  if (den < 0.05) return vec3(0.0);
  float ra = max(r0, (b.y - b.w) / den), rb = min(r1, (b.y + b.w) / den);
  if (rb <= ra) return vec3(0.0);
  const int N = 34;
  float dr = (rb - ra) / float(N);
  float sig = 2.2 + 0.006 * ra;           // sheet half-thickness (km); a bit wider far away (pixel footprint)
  float sigW = sig * 6.0;                 // faint diffuse skirt
  vec4 f = fieldAt(hd * ra);
  float gP = c == 0 ? f.x : f.z, rP = ra;
  vec3 acc = vec3(0.0);
  for (int k = 1; k <= N; k++) {
    float r = ra + dr * float(k);
    f = fieldAt(hd * r);
    float g = c == 0 ? f.x : f.z;
    float dg = g - gP;
    // a distance field is 1-Lipschitz: a bigger jump is a sign flip at a medial axis, not the sheet
    if (abs(dg) < dr * 1.05 + 1.5) {
      float w, wW, rs;
      if (abs(dg) > 1e-3) {
        float cc = dr * 0.886227 / dg;                 // ∫exp(-(g/σ)²)dr = σ·Δr/Δg·(√π/2)·[erf]
        w = (erfa(g / sig) - erfa(gP / sig)) * sig * cc;
        wW = (erfa(g / sigW) - erfa(gP / sigW)) * sigW * cc;
        rs = clamp(rP - gP * dr / dg, rP, r);         // where the ray crosses the sheet
      } else {
        w = dr * exp(-g * g / (sig * sig)); wW = dr * exp(-g * g / (sigW * sigW)); rs = 0.5 * (r + rP);
      }
      float wt = w + 0.06 * wW;
      if (wt > 2e-3) {
        // re-read the arc length exactly at the crossing (interpolating it would shimmer the fine rays)
        vec4 fc = fieldAt(hd * rs);
        float h = rs * tanE + rs * rs / (2.0 * RE);
        float fs = rs * pixAng / clamp(abs(dg) / dr, 0.04, 1.0);
        acc += emit(c, c == 0 ? fc.y : fc.w, h, fs) * wt;
      }
    }
    rP = r; gP = g;
  }
  return acc * (sheetI[c] / cosE);
}

void main() {
  vec2 px = gl_FragCoord.xy / res * stage;
  vec3 d = dirOf(px);
  if (d.y < -0.004) { o = vec4(0.0); return; }
  float cosE = length(d.xz);
  vec2 hd = d.xz / cosE;
  float tanE = max(d.y, 0.0005) / cosE;
  float r0 = rAt(86.0, tanE), r1 = min(rAt(380.0, tanE), 1700.0);
  vec3 c = curtain(0, hd, tanE, cosE, r0, r1) + curtain(1, hd, tanE, cosE, r0, r1);
  c *= 0.0042;
  // diffuse auroral glow low in the north: path length through a 95–150 km slab (van Rhijn brightening)
  float slab = (rAt(150.0, tanE) - rAt(95.0, tanE)) / cosE;
  float pch = 0.6 + 0.4 * n1(atan(d.x, d.z) * 7.0 + foldPh * 0.6);
  c += GREEN * slab * 0.000012 * pch * (0.5 + 0.5 * sheetI.y);
  // atmospheric extinction (airmass), stronger in blue
  float am = 1.0 / (d.y + 0.035);
  c *= exp(-vec3(0.030, 0.042, 0.075) * am);
  o = vec4(c, 1.0);
}`;

// ---------------------------------------------------------------- pass 2: landscape, lake, light
const SCENE_FRAG = COMMON + `
uniform sampler2D sky;
uniform float camX, camH, fade, frameNo, glow, ripple;
out vec4 o;

vec3 skyBase(vec3 d) {
  float s = max(d.y, 0.0);
  vec3 c = mix(vec3(0.0070, 0.0125, 0.0230), vec3(0.0012, 0.0020, 0.0062), pow(smoothstep(0.0, 0.8, s), 0.5));
  c += vec3(0.0025, 0.0060, 0.0065) * exp(-s * 18.0);
  return c;
}
vec3 starLayer(vec2 p, float scale, float keep, float seed) {
  vec2 g = p * scale, id = floor(g), f = fract(g) - 0.5;
  float h = h21(id + seed);
  if (h > keep) return vec3(0.0);
  vec2 off = (vec2(h21(id + seed + 1.7), h21(id + seed + 4.3)) - 0.5) * 0.7;
  float dpx = length(f - off) / scale * focal;           // distance in pixels
  float m = h / keep;
  float b = pow(1.0 - m, 6.0) * 2.4 + 0.18;
  float tw = 0.7 + 0.3 * sin(t * (2.0 + 4.0 * h21(id + 9.1)) + h * 60.0);
  vec3 col = mix(vec3(0.70, 0.80, 1.0), vec3(1.0, 0.86, 0.68), h21(id + 2.0));
  return col * b * tw * (exp(-dpx * dpx / 0.9) + 0.06 * exp(-dpx / 2.2));
}
vec3 stars(vec3 d) {
  vec2 p = vec2(atan(d.x, d.z), asin(clamp(d.y, -1.0, 1.0)));
  vec3 s = starLayer(p, 150.0, 0.30, 1.0) + starLayer(p, 330.0, 0.22, 7.0) * 0.55 + starLayer(p, 60.0, 0.10, 13.0) * 1.3;
  return s * 0.055 * exp(-0.22 / max(d.y + 0.01, 0.01));
}
vec3 skyAt(vec3 d, float lod) {
  vec2 uv = uvOf(d);
  vec3 a = textureLod(sky, uv, lod).rgb;
  return skyBase(d) + a + stars(d) * (1.0 - smoothstep(0.0, 2.5, lod));
}
// ---- terrain: heights in metres as functions of world x (m) for planes z = D
float ridged(float x) {
  float s = 0.0, a = 0.55, f = 1.0;
  for (int i = 0; i < 5; i++) { float n = 1.0 - abs(n1(x * f + float(i) * 13.1)); s += a * n * n; a *= 0.47; f *= 2.17; }
  return s;
}
float hFar(float x) {
  float m = 0.5 + 0.5 * n1(x / 9000.0 + 2.0);
  return 450.0 + 1500.0 * m * m + 1100.0 * max(ridged(x / 4200.0 + 4.3) - 0.3, 0.0) * (0.4 + m);
}
float hMid(float x) {
  float s = 70.0 + 170.0 * (0.6 * n1(x / 2600.0 + 1.3) + 0.3 * n1(x / 1100.0 + 7.0) + 0.1 * n1(x / 420.0));
  return s + 14.0 * abs(n1(x / 9.0)) + 6.0 * abs(n1(x / 3.7));   // tree crowns on the ridge line
}
// spruce trees in cells of size c; returns coverage at (x, y) for pixel size pix
float spruces(float x, float y, float c, vec2 hr, float wk, float seed, float pix, float keep) {
  float cid = floor(x / c), cov = 0.0;
  for (int j = -1; j <= 1; j++) {
    float id = cid + float(j);
    float h0 = h11(id * 1.37 + seed);
    if (h0 > keep) continue;
    float xi = (id + 0.15 + 0.7 * h11(id * 2.11 + seed + 3.0)) * c;
    float Ht = mix(hr.x, hr.y, h11(id * 3.7 + seed + 7.0));
    float v = y / Ht;
    if (v > 1.0) continue;
    float W = Ht * wk * (0.85 + 0.3 * h11(id * 5.3 + seed));
    float tier = fract(max(v, 0.0) * (6.0 + 4.0 * h0) + h0 * 7.0);
    float w = W * pow(clamp(1.0 - v, 0.0, 1.0), 1.1) * (1.0 - 0.42 * tier) + Ht * 0.012;
    cov = max(cov, clamp((w - abs(x - xi)) / pix + 0.5, 0.0, 1.0));
  }
  return cov;
}
// front-to-back over the four layers; water=1 when the (real) camera ray meets the lake first
vec3 scene(float cy, vec3 d, float lod, out float water, out float sWater) {
  water = 0.0;
  sWater = (cy > 0.0 && d.y < 0.0) ? cy / -d.y : 1e9;
  vec3 col = vec3(0.0); float a = 0.0;
  float dz = max(d.z, 0.05);
  vec3 sk = skyBase(vec3(d.x, abs(d.y), d.z));
  vec3 amb = vec3(0.010, 0.040, 0.028) * glow;
  // L0: near promontory with tall spruces (D = 120 m, only to the right)
  {
    float D = 120.0, s = D / dz; if (s > sWater) { water = 1.0; return col; }
    float x = camX + s * d.x, y = cy + s * d.y, pix = s / focal;
    float shore = smoothstep(9.0, 22.0, x);
    float gH = shore * (2.2 + 1.2 * n1(x / 6.0)) - (1.0 - shore) * 4.0;
    float cov = clamp((gH - y) / pix + 0.5, 0.0, 1.0);
    if (shore > 0.0 && y < 36.0) cov = max(cov, spruces(x, y - gH + 0.6, 6.5, vec2(13.0, 31.0), 0.17, 3.0, pix, 0.86 * step(13.0, x)));
    vec3 lc = vec3(0.0016, 0.0022, 0.0030) + amb * 0.05;
    col += (1.0 - a) * cov * lc; a += (1.0 - a) * cov;
  }
  // L1: far shore forest (D = 560 m)
  {
    float D = 560.0, s = D / dz; if (s > sWater) { water = 1.0; return col; }
    float x = camX + s * d.x, y = cy + s * d.y, pix = s / focal;
    float gH = 3.0 + 2.5 * n1(x / 40.0) + 1.5 * n1(x / 13.0);
    float cov = y > 30.0 ? 0.0 : max(clamp((gH - y) / pix + 0.5, 0.0, 1.0), spruces(x, y - gH + 0.8, 5.0, vec2(9.0, 22.0), 0.19, 11.0, pix, 0.9));
    vec3 lc = mix(vec3(0.0025, 0.0038, 0.0055), sk, 0.12) + amb * 0.10;
    col += (1.0 - a) * cov * lc; a += (1.0 - a) * cov;
  }
  // L2: forested ridge (D = 7.5 km)
  {
    float D = 7500.0, s = D / dz;
    float x = camX + s * d.x, y = cy + s * d.y, pix = s / focal;
    float cov = y > 520.0 ? 0.0 : clamp((hMid(x) - y) / pix + 0.5, 0.0, 1.0);
    vec3 lc = mix(vec3(0.0035, 0.0055, 0.0085), sk, 0.32) + amb * 0.22;
    col += (1.0 - a) * cov * lc; a += (1.0 - a) * cov;
  }
  // L3: snowy range (D = 26 km) — faces in shadow, snow catching the aurora's green light
  {
    float D = 26000.0, s = D / dz;
    float x = camX + s * d.x, y = cy + s * d.y, pix = s / focal;
    float H = y > 4200.0 ? 0.0 : hFar(x);
    float cov = clamp((H - y) / pix + 0.5, 0.0, 1.0);
    float snow = smoothstep(-30.0, 30.0, y - (H - 200.0 - 160.0 * abs(n1(x / 180.0)))) * smoothstep(1500.0, 1900.0, H) * 0.6;
    vec3 lc = mix(vec3(0.0045, 0.0070, 0.0115), sk, 0.45) + snow * (vec3(0.006, 0.010, 0.016) + amb * 0.6) + amb * 0.2;
    col += (1.0 - a) * cov * lc; a += (1.0 - a) * cov;
  }
  col += (1.0 - a) * skyAt(d, lod);
  return col;
}
// ripples on the lake: a few directional waves, gradient in closed form
vec2 rippleGrad(vec2 p) {
  vec2 g = vec2(0.0);
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float ang = -1.5708 + (fi - 2.5) * 0.32 + 0.15 * sin(fi * 3.1);   // mostly rolling toward the camera
    float lam = 4.2 / (1.0 + fi * 0.45);                                // wavelength (m)
    float kk = 6.2832 / lam;
    vec2 dir = vec2(cos(ang), sin(ang));
    float w = sqrt(9.8 * kk);                                           // deep-water dispersion
    float s = 0.0030 / (1.0 + fi * 0.35);                               // slope amplitude
    g += dir * s * cos(kk * dot(dir, p) - w * t + fi * 1.7);
  }
  return g;
}
// fine cat's-paw ripples, only near the shore we stand on (they would alias farther out)
vec2 fineGrad(vec2 p) {
  vec2 g = vec2(0.0);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float ang = -1.5708 + (fi - 1.5) * 0.55;
    float kk = 6.2832 / (0.55 + 0.22 * fi);
    vec2 dir = vec2(cos(ang), sin(ang));
    g += dir * 0.0045 * cos(kk * dot(dir, p) - sqrt(9.8 * kk) * t + fi * 2.3);
  }
  return g;
}
vec3 bloomAt(vec2 uv) {
  vec3 b = vec3(0.0);
  vec2 e = vec2(0.006, 0.0034);
  b += 0.12 * textureLod(sky, uv + e, 4.0).rgb;
  b += 0.20 * textureLod(sky, uv - 2.0 * e.yx * vec2(1, -1), 5.5).rgb;
  b += 0.22 * textureLod(sky, uv, 7.0).rgb;
  return b;
}
void main() {
  vec2 px = gl_FragCoord.xy;
  vec3 d = dirOf(px);
  float water, sw;
  vec3 col = scene(camH, d, 0.0, water, sw);
  vec2 uv = uvOf(d);
  vec3 bl;
  if (water > 0.5) {
    vec3 P = vec3(camX, camH, 0.0) + d * sw;
    float near = exp(-sw / 45.0);
    vec2 gr = (rippleGrad(P.xz) * near + fineGrad(P.xz) * exp(-sw / 9.0)) * ripple;
    vec3 n = normalize(vec3(-gr.x, 1.0, -gr.y));
    vec3 r = reflect(d, n);
    r.y = max(r.y, 0.0008);
    float cosi = clamp(-dot(d, n), 0.0, 1.0);
    float F = 0.02 + 0.98 * pow(1.0 - cosi, 5.0);
    F = 0.22 + 0.78 * F;
    float lod = 0.3 + 1.6 * (1.0 - near);
    float wd, ws;
    vec3 refl = scene(-camH, r, lod, wd, ws);
    // vertical smear of bright reflections (ripples stretch them toward the viewer)
    vec2 ru = uvOf(r);
    vec3 smear = vec3(0.0);
    for (int k = 1; k <= 2; k++) {
      float o2 = float(k) * (0.0035 + 0.005 * near);
      smear += textureLod(sky, ru + vec2(0.0, o2), lod + 1.0).rgb + textureLod(sky, ru - vec2(0.0, o2), lod + 1.0).rgb;
    }
    refl = mix(refl, refl * 0.5 + smear / 4.0 * 0.5, 0.4);
    vec3 body = vec3(0.0008, 0.0022, 0.0030);
    col = refl * F + body * (1.0 - F);
    bl = bloomAt(vec2(ru.x, ru.y)) * F;
  } else {
    bl = bloomAt(uv);
  }
  // low mist over the far water and the shore, lit by the aurora
  float el = asin(clamp(d.y, -1.0, 1.0));
  vec3 mistC = (vec3(0.010, 0.020, 0.024) + textureLod(sky, vec2(uv.x, uvOf(vec3(d.x, 0.06, d.z)).y), 6.0).rgb * 0.9);
  col += mistC * exp(-abs(el + 0.002) / 0.012) * 0.35;
  col += bl * glow;
  // tone map, vignette, grade, grain
  col *= 1.25;
  col = 1.0 - exp(-max(col, 0.0));   // never negative before the gamma pow (NaN on real GPUs)
  vec2 q = px / stage - 0.5;
  col *= 1.0 - 0.6 * pow(length(q * vec2(1.25, 0.9)), 2.6);
  col = pow(col, vec3(1.0 / 2.2));
  col = mix(col, col * col * (3.0 - 2.0 * col), 0.18);
  col *= fade;
  col += (h21(px + frameNo * 7.13) - 0.5) / 255.0 * 1.6;
  o = vec4(col, 1.0);
}`;

const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

// ---------------------------------------------------------------- timeline (pure functions of t)
const D = 9;
const fade = track([[0, 0], [1.1, 1, ease.outCubic], [8.6, 1], [D, 0.0, ease.inCubic]]);
const mainI = track([[0, 0.25], [1.2, 0.40, ease.inOutCubic], [4.4, 1.0], [D, 1.0]]);
// the breakup front: position along the visible curtain (0 = far horizon, 1 = overhead), glow behind, flash
const frontPos = track([[4.8, -0.05], [6.4, 1.1, (p) => 1 - Math.pow(1 - p, 2.2)]]);
const frontGlow = track([[4.8, 0], [6.3, 1.5, ease.outCubic], [7.0, 1.3], [8.5, 0.35], [D, 0.25]]);
const frontFlash = track([[4.8, 0], [5.05, 2.2, ease.outCubic], [6.0, 1.7], [6.6, 0, ease.inOutCubic]]);
const farI = track([[0, 0.5], [3.0, 0.8], [5.4, 0.85], [6.2, 1.4], [7.8, 1.0], [D, 0.9]]);
const surge = track([[4.9, 0], [5.9, 1, ease.outCubic], [6.8, 0.75], [8.5, 0.25]]);
const redAmt = track([[0, 0.25], [3.8, 0.6], [5.6, 1.0], [7.5, 0.85], [D, 0.75]]);
const violet = track([[0, 0.10], [4.9, 0.2], [5.8, 1.7, ease.outCubic], [7.4, 0.6], [D, 0.35]]);
const foldAmp = track([[0, 0.7], [4.8, 1.0], [6.0, 1.35], [D, 1.2]]);
const glow = track([[0, 0.5], [4.8, 0.8], [5.9, 1.25, ease.outCubic], [D, 0.85]]);
const ripple = track([[0, 1.0], [D, 1.0]]);
const yawDeg = track([[0, -3.2], [D, 2.6, (p) => p]]);
const pitchDeg = track([[0, 9.0], [D, 10.6, ease.inOutCubic]]);
const camXm = track([[0, -9], [D, 9, ease.inOutCubic]]);
// speeds integrate into phases (fixed-step sum from 0 — depends only on t)
const foldSpeed = track([[0, 0.10], [4.8, 0.16], [5.8, 0.55, ease.outCubic], [7.0, 0.25], [D, 0.14]]);
const raySpeed = track([[0, 0.35], [4.8, 0.6], [5.8, 2.6, ease.outCubic], [7.2, 0.9], [D, 0.5]]);
function integrate(f, t) {
  const n = Math.max(1, Math.ceil(t / 0.01));
  const h = t / n;
  let s = 0;
  for (let i = 0; i < n; i++) s += f((i + 0.5) * h) * h;
  return s;
}

// ---------------------------------------------------------------- the curtains as ribbons (km)
const TAU = Math.PI * 2;
// base line z = z0 + tilt·x + bend·x²; two travelling fold waves: normal amplitude A, tangential B
// (B·k > 1 makes the trochoid loop back on itself — the curls of a real curtain)
const CURVES = [
  { z0: 300, tilt: -1.6, bend: 0.0004, A: 30, B: 30, k: TAU / 125, w: 1.0, A2: 10, B2: 8, k2: TAU / 52, w2: -1.6, seed: 1.3 },
  { z0: 660, tilt: 0.05, bend: 0.00005, A: 48, B: 30, k: TAU / 380, w: 0.6, A2: 18, B2: 10, k2: TAU / 140, w2: 1.1, seed: 7.9 },
];
const hashJ = (i) => { let h = Math.imul(i | 0, 374761393) ^ 0x9e3779b9; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const noiseJ = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return (hashJ(i) + (hashJ(i + 1) - hashJ(i)) * u) * 2 - 1; };
function buildCurves(out, foldPh, amp) {
  CURVES.forEach((C, c) => {
    let px = 0, pz = 0, s = 0;
    for (let i = 0; i < NP; i++) {
      const xb = X0 + i * DX;
      const zb = C.z0 + C.tilt * xb + C.bend * xb * xb;
      const dz = C.tilt + 2 * C.bend * xb, L = Math.hypot(1, dz);
      const tx = 1 / L, tz = dz / L, nx = -tz, nz = tx;
      const env = amp * (0.55 + 0.45 * noiseJ(xb * 0.0045 + C.seed + foldPh * 0.15));
      const p1 = C.k * xb - foldPh * C.w + C.seed, p2 = C.k2 * xb - foldPh * C.w2 + C.seed * 3;
      const dt = env * (C.B * Math.cos(p1) + C.B2 * Math.cos(p2));
      const dn = env * (C.A * Math.sin(p1) + C.A2 * Math.sin(p2)) + 14 * noiseJ(xb * 0.012 + C.seed * 5);
      const x = xb + tx * dt + nx * dn, z = zb + tz * dt + nz * dn;
      if (i > 0) s += Math.hypot(x - px, z - pz);
      const o = (c * NP + i) * 4;
      out[o] = x; out[o + 1] = z; out[o + 2] = s; out[o + 3] = 0;
      px = x; pz = z;
    }
  });
}

defineDemo({
  id: '06-aurora-raymarch',
  title: '오로라, 빛의 커튼',
  tech: 'WebGL2 볼류메트릭 레이마칭',
  duration: D,
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float missing');
    gl.getExtension('OES_texture_float_linear');
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const program = (frag, names) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, frag));
      gl.bindAttribLocation(p, 0, 'p');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const U = {};
      for (const n of names) U[n] = gl.getUniformLocation(p, n);
      return { p, U };
    };
    const common = ['stage', 'focal', 't', 'camF', 'camR', 'camU'];
    const P0 = program(FIELD_FRAG, ['pts', 'dom', 'fres', 'base', 'X0', 'DX']);
    const P1 = program(SKY_FRAG, [...common, 'res', 'fld', 'dom', 'base', 'sheetI', 'surge', 'redAmt', 'violet', 'rayPh', 'foldPh', 'pixAng', 'front']);
    const P2 = program(SCENE_FRAG, [...common, 'sky', 'camX', 'camH', 'fade', 'frameNo', 'glow', 'ripple']);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const makeTarget = (w, h, fmt, mips) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      const levels = mips ? 1 + Math.floor(Math.log2(Math.max(w, h))) : 1;
      gl.texStorage2D(gl.TEXTURE_2D, levels, fmt, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('fbo incomplete');
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { tex, fbo, w, h };
    };
    const FW = 800, FH = 560, DOM = [-800, 40, 800, 1080];
    const field = makeTarget(FW, FH, gl.RGBA32F, false);
    const skyT = makeTarget(Math.round(W * SKY_SCALE), Math.round(H * SKY_SCALE), gl.RGBA16F, true);
    // curve points: NP × 2 RGBA32F, rewritten every frame
    const ptsData = new Float32Array(NP * 2 * 4);
    const ptsTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, ptsTex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, NP, 2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    const baseU = new Float32Array(CURVES.flatMap((C) => [C.tilt, C.z0, C.bend, 0]));

    const focal = 960 / Math.tan((75 / 2) * Math.PI / 180);
    const setCommon = (U, t) => {
      const yaw = yawDeg(t) * Math.PI / 180, pit = pitchDeg(t) * Math.PI / 180;
      const F = [Math.sin(yaw) * Math.cos(pit), Math.sin(pit), Math.cos(yaw) * Math.cos(pit)];
      const R = [Math.cos(yaw), 0, -Math.sin(yaw)];
      const Up = [F[1] * R[2] - F[2] * R[1], F[2] * R[0] - F[0] * R[2], F[0] * R[1] - F[1] * R[0]];
      gl.uniform2f(U.stage, W, H);
      gl.uniform1f(U.focal, focal);
      gl.uniform1f(U.t, t);
      gl.uniform3fv(U.camF, F); gl.uniform3fv(U.camR, R); gl.uniform3fv(U.camU, Up);
    };

    this.draw = (t) => {
      const foldPh = integrate(foldSpeed, t), amp = foldAmp(t);
      // the ribbons for this instant → data texture; window half-span per curve from its fold size
      buildCurves(ptsData, foldPh, amp);
      CURVES.forEach((C, c) => { baseU[c * 4 + 3] = 1.15 * amp * (C.A + C.B + C.A2 + C.B2) + 30; });
      gl.bindTexture(gl.TEXTURE_2D, ptsTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, NP, 2, gl.RGBA, gl.FLOAT, ptsData);
      // pass 0: distance field of both ribbons
      gl.bindFramebuffer(gl.FRAMEBUFFER, field.fbo);
      gl.viewport(0, 0, FW, FH);
      gl.useProgram(P0.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, ptsTex);
      gl.uniform1i(P0.U.pts, 0);
      gl.uniform4fv(P0.U.dom, DOM);
      gl.uniform2f(P0.U.fres, FW, FH);
      gl.uniform4fv(P0.U.base, baseU);
      gl.uniform1f(P0.U.X0, X0);
      gl.uniform1f(P0.U.DX, DX);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // pass 1: aurora volume → texture (+ mips)
      gl.bindFramebuffer(gl.FRAMEBUFFER, skyT.fbo);
      gl.viewport(0, 0, skyT.w, skyT.h);
      gl.useProgram(P1.p);
      setCommon(P1.U, t);
      gl.bindTexture(gl.TEXTURE_2D, field.tex);
      gl.uniform1i(P1.U.fld, 0);
      gl.uniform2f(P1.U.res, skyT.w, skyT.h);
      gl.uniform4fv(P1.U.dom, DOM);
      gl.uniform4fv(P1.U.base, baseU);
      gl.uniform2f(P1.U.sheetI, mainI(t), farI(t));
      gl.uniform1f(P1.U.surge, surge(t));
      gl.uniform1f(P1.U.redAmt, redAmt(t));
      gl.uniform1f(P1.U.violet, violet(t));
      gl.uniform1f(P1.U.foldPh, foldPh);
      gl.uniform1f(P1.U.rayPh, integrate(raySpeed, t));
      gl.uniform1f(P1.U.pixAng, 1 / (focal * SKY_SCALE));
      // arc length of the main curtain where it meets the horizon (x ≈ -520 km) and overhead (x ≈ +260 km)
      const sAt = (xb) => ptsData[Math.round((xb - X0) / DX) * 4 + 2];
      const s0 = sAt(-520), s1 = sAt(260);
      gl.uniform3f(P1.U.front, s0 + (s1 - s0) * frontPos(t), frontGlow(t), frontFlash(t));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindTexture(gl.TEXTURE_2D, skyT.tex);
      gl.generateMipmap(gl.TEXTURE_2D);
      // pass 2: the scene
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(P2.p);
      setCommon(P2.U, t);
      gl.uniform1i(P2.U.sky, 0);
      gl.uniform1f(P2.U.camX, camXm(t));
      gl.uniform1f(P2.U.camH, 2.2);
      gl.uniform1f(P2.U.fade, fade(t));
      gl.uniform1f(P2.U.frameNo, Math.round(t * 30));
      gl.uniform1f(P2.U.glow, glow(t));
      gl.uniform1f(P2.U.ripple, ripple(t));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  },
  frame(t) { this.draw(t); },
});
