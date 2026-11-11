/*
 * 20-woodcut/shader.js — one full-screen fragment shader does the whole workshop as a function of t:
 * the carved block (height map + cherry grain + the pasted drawing), the brayer's three passes of ink,
 * the washi sheet lowered onto the kento, the baren's rubbing (show-through on the back of the sheet),
 * and the peel: the sheet curls round a moving cylinder and lands printed-face-up, mirrored.
 * Every texel of the print is computed from the same block it lay on: ink amount on the block × contact
 * (raised surface, grain relief, pores) × baren pressure → speckled transfer on the paper's fibre tops.
 */
export const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

export const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uBlock, uThr, uFin, uFib;
uniform vec2 uRes;
uniform vec3 uCam, uLight, uLamp;
uniform float uFrame, uCarve, uRub, uEmb, uLodB, uLodF;
uniform vec4 uPass[3];
uniform vec4 uRoller, uPaper, uBaren, uPeel;
out vec4 o;

const vec4 BLK = vec4(90.0, 210.0, 900.0, 1300.0);
const vec4 PAP = vec4(120.0, 250.0, 840.0, 1220.0);
const vec3 INK_WET = vec3(0.028, 0.029, 0.038);
const vec3 INK_PRINT = vec3(0.082, 0.078, 0.076);
const float PI = 3.14159265;

float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
float sdBox(vec2 p, vec2 b) { vec2 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0); }
float shade(vec3 n) { return min(0.36 + 0.64 * max(dot(n, uLight), 0.0) / max(uLight.z, 0.2), 1.45); }
vec3 halfV() { return normalize(uLight + vec3(0.0, 0.0, 1.0)); }

// ---------------------------------------------------------------- the block
// cherry plank, pith far below: cathedral growth rings. x = latewood, y = grain relief (0 low..1 high), z = pores
vec3 wood(vec2 w) {
  vec2 q = w - vec2(560.0, 2700.0);
  float warp = fbm(w * vec2(0.0035, 0.0009)) * 9.0 + noise(w * vec2(0.02, 0.003)) * 1.3;
  float f = fract(length(q * vec2(1.0, 0.16)) / 15.0 + warp);
  float late = smoothstep(0.55, 0.85, f) * (1.0 - smoothstep(0.93, 1.0, f));
  float hgt = 0.35 + 0.65 * late + 0.15 * (noise(w * vec2(0.25, 0.012)) - 0.5);
  float pore = smoothstep(0.72, 0.9, noise(w * vec2(0.55, 0.045))) * (1.0 - late);
  return vec3(late, clamp(hgt, 0.0, 1.0), pore);
}
vec4 blk(vec2 w) { return textureLod(uBlock, (w - BLK.xy) / BLK.zw, uLodB); }
// R raised · G cut depth · B moment of cutting · A blurred raised
float cutAmt(vec4 b) { return (1.0 - b.r) * smoothstep(b.b, b.b + 0.025, uCarve); }
float hgt(vec2 w) { vec4 b = blk(w); return 1.0 - cutAmt(b) * (0.2 + 0.8 * b.g); }

// ink film laid by the brayer: three passes, each streaky along the roll, with a dry patch on the roller
// that comes round once per turn (2π·42 px) and skips; earlywood dips and pores take less
float rollInk(vec2 w, vec4 b, vec3 gr) {
  float contact = b.r * (0.72 + 0.28 * gr.y) * (1.0 - 0.6 * gr.z) + (1.0 - b.r) * (1.0 - smoothstep(0.0, 0.22, b.g)) * 0.45;
  float cov = 0.0;
  for (int i = 0; i < 3; i++) {
    vec4 P = uPass[i];
    if (P.z <= 0.0) continue;
    float yNow = mix(P.x, P.y, P.z);
    float passed = P.y > P.x ? smoothstep(yNow + 4.0, yNow - 4.0, w.y) : smoothstep(yNow - 4.0, yNow + 4.0, w.y);
    float ph = abs(w.y - P.x) / 42.0;
    vec2 rc = vec2(cos(ph), sin(ph)) * 1.6;
    float film = 0.66 + 0.5 * (noise(vec2(w.x * 0.05, P.w * 13.0)) - 0.5) + 0.2 * (noise(vec2(w.x * 0.4, P.w * 7.0)) - 0.5);
    float skip = smoothstep(0.58, 0.8, noise(vec2(w.x * 0.012 + P.w * 5.0, P.w * 3.0) + rc));
    film *= 1.0 - 0.75 * skip;
    cov = 1.0 - (1.0 - cov) * (1.0 - clamp(film * contact, 0.0, 1.0) * passed);
  }
  return cov;
}

// ---------------------------------------------------------------- the baren's record
float rubFrac(vec4 th, float s) {
  if (s <= 0.0) return 0.0;
  if (s < th.x) return 0.1 * clamp(1.0 - (th.x - s) / 0.04, 0.0, 1.0);
  if (s < th.y) return mix(0.10, 0.35, (s - th.x) / max(th.y - th.x, 1e-4));
  if (s < th.z) return mix(0.35, 0.65, (s - th.y) / max(th.z - th.y, 1e-4));
  if (s < th.w) return mix(0.65, 0.95, (s - th.z) / max(th.w - th.z, 1e-4));
  return mix(0.95, 1.0, clamp((s - th.w) / 0.05, 0.0, 1.0));
}
float pressure(vec2 m, float s) {
  vec2 uv = (m - PAP.xy) / PAP.zw;
  return textureLod(uFin, uv, 0.0).r * 2.0 * rubFrac(textureLod(uThr, uv, 0.0) * (255.0 / 254.0), s);
}

// ---------------------------------------------------------------- the sheet
vec4 fib(vec2 m) { return textureLod(uFib, (m - PAP.xy + 12.0) / (PAP.zw + 24.0), uLodF); }
vec3 paperBase(vec2 m, vec4 f) {
  vec3 c = vec3(0.935, 0.912, 0.858);
  c *= 0.962 + 0.055 * fbm(m * 0.025);                         // formation: cloudy thickness
  c += 0.055 * f.r * vec3(1.0, 0.99, 0.95);                      // kozo fibres
  c = mix(c, vec3(0.42, 0.33, 0.24), clamp(f.g, 0.0, 1.0) * 0.55);  // bark specks
  return c;
}
float paperA(vec2 m) {                                           // deckled edge
  vec2 PC = PAP.xy + 0.5 * PAP.zw;
  float sd = sdBox(m - PC, 0.5 * PAP.zw) + (noise(m * 0.09) - 0.5) * 3.0 + (noise(m * 0.7) - 0.5) * 1.4;
  return smoothstep(0.8, -0.8, sd);
}
float paperSoft(vec2 m, float soft) { return smoothstep(soft, -soft, sdBox(m - PAP.xy - 0.5 * PAP.zw, 0.5 * PAP.zw)); }
// x: ink density printed at sheet point m after rubbing progress s; y: inked raised surface under m
vec2 printInfo(vec2 m, float s, vec4 f) {
  vec4 b = blk(m);
  vec3 gr = wood(m);
  float inkB = rollInk(m, b, gr);
  float pr = pressure(m, s);
  float contact = b.r * smoothstep(0.05, 0.6, pr * (0.7 + 0.5 * gr.y)) * (1.0 - 0.7 * gr.z)
                + (1.0 - b.r) * (1.0 - smoothstep(0.0, 0.2, b.g)) * 0.35 * min(pr, 1.0);
  float amt = inkB * contact * (1.0 - exp(-2.4 * pr));
  // thin ink lands on the fibre tops first: goma-zuri speckle where the pressure or the ink ran short
  float micro = 0.55 * noise(m * 1.7) + 0.3 * noise(m * 0.6 + 3.0) + 0.25 * f.r;
  float D = smoothstep(micro * 0.55 - 0.05, micro * 0.55 + 0.2, amt) * (0.6 + 0.4 * amt) * smoothstep(0.0, 0.05, amt);
  return vec2(clamp(D, 0.0, 1.0), inkB * b.r);
}
vec2 gradA(vec2 m) {
  float e = 1.2;
  return vec2(blk(m + vec2(e, 0.0)).a - blk(m - vec2(e, 0.0)).a, blk(m + vec2(0.0, e)).a - blk(m - vec2(0.0, e)).a) / (2.0 * e);
}
// the face that looks up while the sheet lies on the block: the print shows through damp washi, in relief
vec3 paperBack(vec2 m, float s, float down) {
  vec4 f = fib(m);
  vec3 c = paperBase(m, f);
  if (down > 0.0) {
    vec2 inf = printInfo(m, s, f);
    float pr = pressure(m, s);
    c *= 1.0 - down * (0.10 * inf.y + 0.40 * inf.x);
    vec3 n = normalize(vec3(-gradA(m) * uEmb * min(pr, 1.3), 1.0));
    c *= shade(n);
    c += down * 0.05 * min(pr, 1.2) * pow(max(dot(n, halfV()), 0.0), 24.0);   // burnished by the baren
  }
  return c;
}
// the printed face, seen mirrored (d = fold direction): inked areas pressed into the sheet
vec3 paperFront(vec2 m, vec3 ng, vec2 d) {
  vec4 f = fib(m);
  vec3 c = paperBase(m, f);
  c = mix(c, INK_PRINT, printInfo(m, 1.0, f).x);
  vec2 g = gradA(m);
  g -= 2.0 * dot(g, d) * d;
  vec3 n = normalize(ng + vec3(g * uEmb * min(pressure(m, 1.0), 1.3), 0.0));
  return c * shade(n);
}

// ---------------------------------------------------------------- tools
vec4 roller(vec2 w) {
  float sc = 1.0 + 0.25 * uRoller.y;
  vec2 q = (w - vec2(540.0, uRoller.x)) / sc;
  vec3 H = halfV();
  vec4 res = vec4(0.0);
  float hx = abs(q.x) - 500.0;
  if (hx > 0.0 && hx < 112.0 && abs(q.y) < 16.0) {               // rolling-pin handles
    float ny = q.y / 16.0;
    vec3 n = vec3(0.0, ny, sqrt(max(1.0 - ny * ny, 0.0)));
    vec3 col = vec3(0.40, 0.25, 0.13) * (0.82 + 0.3 * noise(vec2(q.x * 0.05, q.y * 0.5)));
    col = col * shade(n) + 0.22 * pow(max(dot(n, H), 0.0), 30.0);
    res = vec4(col, smoothstep(16.0, 14.5, abs(q.y)) * smoothstep(112.0, 107.0, hx));
  }
  if (abs(hx + 1.0) < 6.0 && abs(q.y) < 26.0) {                   // steel caps
    float ny = q.y / 26.0;
    vec3 n = vec3(0.0, ny, sqrt(max(1.0 - ny * ny, 0.0)));
    vec3 col = vec3(0.45, 0.46, 0.48) * shade(n) + 0.5 * pow(max(dot(n, H), 0.0), 60.0);
    res = vec4(col, 1.0);
  }
  float rr = 42.0;
  if (abs(q.x) < 495.0 && abs(q.y) < rr) {                       // the inked rubber roller
    float ny = q.y / rr;
    vec3 n = vec3(0.0, ny, sqrt(max(1.0 - ny * ny, 0.0)));
    float sv = (asin(clamp(ny, -1.0, 1.0)) + uRoller.w) * rr;
    vec3 n2 = normalize(n + vec3(noise(vec2(q.x * 0.5, sv * 0.5)) - 0.5, noise(vec2(q.x * 0.35, sv * 0.35) + 5.0) - 0.5, 0.0) * 0.28);
    vec3 col = INK_WET * (0.8 + 0.5 * noise(vec2(q.x * 0.03, sv * 0.02))) * shade(n);
    col += vec3(0.72, 0.78, 0.9) * pow(max(dot(n2, H), 0.0), 40.0) * 0.55 + 0.03 * pow(max(dot(n2, H), 0.0), 5.0);
    float a = smoothstep(rr, rr - 1.5, abs(q.y)) * smoothstep(495.0, 493.0, abs(q.x));
    res = vec4(mix(res.rgb, col, a), max(res.a, a));
  }
  return res;
}
vec4 baren(vec2 w) {
  float sc = 1.0 + 0.22 * uBaren.z;
  vec2 q = (w - uBaren.xy) / sc;
  float r = length(q) / 115.0;
  if (r > 1.02) return vec4(0.0);
  float ca = cos(uBaren.w), sa = sin(uBaren.w);
  vec2 l = vec2(ca * q.x + sa * q.y, -sa * q.x + ca * q.y) / 115.0;   // local frame, knot along x
  vec3 n = normalize(vec3(q / 115.0 * smoothstep(0.68, 1.0, r) * 1.8, 1.0));
  float fb = noise(vec2(l.x * 4.0, l.y * 140.0)) * 0.6 + noise(vec2(l.x * 22.0, l.y * 320.0)) * 0.4;
  vec3 col = mix(vec3(0.60, 0.48, 0.29), vec3(0.84, 0.73, 0.49), fb);
  // the sheath is gathered toward both ends of the knot: radial creases
  float crease = sin(atan(l.y, abs(l.x) + 1e-4) * 22.0) * smoothstep(0.45, 0.95, abs(l.x)) * smoothstep(0.25, 0.4, abs(l.y));
  col *= 1.0 + 0.08 * crease;
  float band = smoothstep(0.23, 0.17, abs(l.y)) * smoothstep(0.98, 0.84, abs(l.x));
  if (band > 0.0) {                                              // the twisted knot (handle)
    float ny = clamp(l.y / 0.2, -1.0, 1.0);
    float tw = 0.5 + 0.5 * sin(l.x * 62.0 + ny * 2.6);
    vec2 hxy = vec2(-sa, ca) * ny + vec2(ca, sa) * (tw - 0.5) * 0.5;
    vec3 hn = normalize(vec3(hxy, sqrt(max(1.0 - ny * ny, 0.05))));
    vec3 hc = mix(vec3(0.50, 0.38, 0.21), vec3(0.88, 0.78, 0.55), tw) * (0.85 + 0.15 * fb);
    n = normalize(mix(n, hn, band));
    col = mix(col, hc, band);
  }
  float ao = 1.0 - 0.25 * smoothstep(0.17, 0.3, abs(l.y)) * (1.0 - smoothstep(0.3, 0.45, abs(l.y))) * smoothstep(0.98, 0.8, abs(l.x));
  col = col * shade(n) * ao + 0.12 * pow(max(dot(n, halfV()), 0.0), 18.0);
  return vec4(col, smoothstep(1.0, 0.985, r));
}

vec3 table(vec2 w) {
  float g = fbm(w * vec2(0.0025, 0.03));
  vec3 c = mix(vec3(0.07, 0.052, 0.043), vec3(0.122, 0.088, 0.066), g);
  return c * (0.9 + 0.1 * noise(w * vec2(0.08, 0.6)));
}

void main() {
  vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 w = (s - 0.5 * uRes) / uCam.z + uCam.xy;
  vec2 PC = PAP.xy + 0.5 * PAP.zw;
  vec3 col = table(w);

  // is the block hidden under a sheet that lies flat on it? (then skip shading it)
  bool covered = uPaper.y > 0.5 && uPeel.w < 0.5 && uPaper.x <= 0.0 && sdBox(w - PC, 0.5 * PAP.zw) < -4.0;

  // ---- the block
  vec2 bc = BLK.xy + 0.5 * BLK.zw;
  col *= 1.0 - 0.6 * (1.0 - smoothstep(-6.0, 34.0, sdBox(w - bc - vec2(12.0, 18.0), 0.5 * BLK.zw)));
  float bIn = sdBox(w - bc, 0.5 * BLK.zw);
  if (bIn < 0.6 && !covered) {
    vec4 b = blk(w);
    vec3 gr = wood(w);
    float cut = cutAmt(b);
    vec3 woodC = mix(vec3(0.74, 0.53, 0.35), vec3(0.55, 0.35, 0.21), gr.x);
    woodC *= (0.92 + 0.16 * noise(w * vec2(0.9, 0.035))) * (1.0 - 0.35 * gr.z);
    vec3 surf = mix(woodC, vec3(0.86, 0.80, 0.69), 0.5);                       // pasted drawing (hanshita)
    surf = mix(surf, vec3(0.24, 0.22, 0.21) * (0.9 + 0.2 * gr.x), b.r * 0.82);
    vec3 cutC = mix(woodC * 1.1 + 0.04, woodC * 0.55, b.g);                   // fresh wood, darker deep down
    cutC += cut * (1.0 - smoothstep(0.0, 0.06, uCarve - b.b)) * vec3(0.10, 0.08, 0.05);
    vec3 bcol = mix(surf, cutC, cut);
    float e = 0.75;
    vec3 n = normalize(vec3(-(hgt(w + vec2(e, 0.0)) - hgt(w - vec2(e, 0.0))) * 1.8, -(hgt(w + vec2(0.0, e)) - hgt(w - vec2(0.0, e))) * 1.8, 1.0));
    float ink = rollInk(w, b, gr) * (1.0 - 0.55 * clamp(pressure(w, uRub), 0.0, 1.0) * b.r * step(0.5, uPaper.y));
    bcol = mix(bcol, INK_WET, ink) * shade(n);
    vec3 n2 = normalize(n + vec3(noise(w * 0.4) - 0.5, noise(w * 0.4 + 9.0) - 0.5, 0.0) * 0.3);
    bcol += ink * pow(max(dot(n2, halfV()), 0.0), 50.0) * 0.5 * vec3(0.88, 0.92, 1.0);
    // bevelled edge of the plank
    vec2 nb = normalize(vec2(sdBox(w + vec2(1, 0) - bc, 0.5 * BLK.zw) - sdBox(w - vec2(1, 0) - bc, 0.5 * BLK.zw),
                             sdBox(w + vec2(0, 1) - bc, 0.5 * BLK.zw) - sdBox(w - vec2(0, 1) - bc, 0.5 * BLK.zw)) + 1e-5);
    bcol *= 1.0 + 0.5 * (1.0 - smoothstep(0.0, 3.5, -bIn)) * dot(nb, normalize(uLight.xy + 1e-5));
    col = mix(col, bcol, smoothstep(0.6, -0.6, bIn));
  }

  // ---- the brayer
  if (uRoller.z > 0.5) {
    float sc = 1.0 + 0.25 * uRoller.y, off = (16.0 + 70.0 * uRoller.y) * sc, soft = 8.0 + 30.0 * uRoller.y;
    float sh = (1.0 - smoothstep(-soft, soft, abs(w.y - uRoller.x - off) - 36.0 * sc)) * (1.0 - smoothstep(-soft, soft, abs(w.x - 552.0) - 600.0 * sc));
    col *= 1.0 - 0.5 * sh;
    vec4 rl = roller(w);
    col = mix(col, rl.rgb, rl.a);
  }

  // ---- the sheet
  if (uPaper.y > 0.5) {
    if (uPeel.w < 0.5) {
      float h = uPaper.x, sc = 1.0 + 0.2 * h;
      vec2 m = (w - PC - uPaper.zw) / sc + PC;
      vec2 ms = (w - PC - uPaper.zw - vec2(18.0, 26.0) * (0.12 + 3.2 * h)) / sc + PC;
      col *= 1.0 - (0.22 + 0.22 * h) * paperSoft(ms, 2.0 + 40.0 * h);
      float a = paperA(m);
      if (a > 0.0) col = mix(col, paperBack(m, uRub, 1.0 - smoothstep(0.0, 0.05, h)), a);
    } else {
      // peeling: the sheet wraps a cylinder of radius R whose axis lies on the fold line (tilted by alpha)
      vec2 d = vec2(cos(uPeel.z), sin(uPeel.z)), pp = vec2(-d.y, d.x);
      float xf = uPeel.x, R = max(uPeel.y, 0.5);
      float lx = dot(w - PC, d) - xf, ys = dot(w - PC, pp);
      if (lx > 0.0) col *= 1.0 - 0.42 * exp(-max(lx - R, 0.0) / (0.9 * R + 4.0)) * smoothstep(625.0, 595.0, abs(ys)) * smoothstep(0.0, 6.0, R);
      if (lx < 0.0) { float a = paperA(w); if (a > 0.0) col = mix(col, paperBack(w, 1.0, 1.0), a); }
      if (lx >= 0.0 && lx <= R) {
        float th = asin(clamp(lx / R, 0.0, 1.0));
        vec2 m1 = PC + d * (xf + R * th) + pp * ys;
        float a1 = paperA(m1);
        if (a1 > 0.0) col = mix(col, paperBack(m1, 1.0, 1.0) * (0.5 + 0.35 * cos(th)), a1);
        float th2 = PI - th;
        vec2 m2 = PC + d * (xf + R * th2) + pp * ys;
        float a2 = paperA(m2);
        if (a2 > 0.0) col = mix(col, paperFront(m2, vec3(d * sin(th2), -cos(th2)), d), a2);
      }
      if (lx < 0.0) {
        vec2 wsh = w - vec2(14.0, 20.0) * (0.25 + 2.2 * R / 60.0);
        float lxs = dot(wsh - PC, d) - xf;
        if (lxs < 0.0) col *= 1.0 - 0.32 * paperSoft(PC + d * (xf + PI * R - lxs) + pp * dot(wsh - PC, pp), 3.0 + 0.25 * R);
        vec2 m3 = PC + d * (xf + PI * R - lx) + pp * ys;
        float a3 = paperA(m3);
        if (a3 > 0.0) col = mix(col, paperFront(m3, vec3(0.0, 0.0, 1.0), d), a3);
      }
    }
  }

  // ---- the baren
  if (uBaren.z < 1.5) {
    float sc = 1.0 + 0.22 * uBaren.z, soft = 6.0 + 34.0 * uBaren.z;
    vec2 off = vec2(14.0, 22.0) * (0.3 + 3.0 * uBaren.z);
    col *= 1.0 - 0.45 * (1.0 - smoothstep(-soft, soft, length(w - uBaren.xy - off) - 112.0 * sc));
    vec4 bn = baren(w);
    col = mix(col, bn.rgb, bn.a);
  }

  // lamp pool, vignette, a whisper of film grain (seeded by the frame number)
  vec2 dl = (w - uLamp.xy) / uLamp.z;
  col *= 0.5 + 0.62 * exp(-dot(dl, dl));
  vec2 sv = s / uRes - 0.5;
  col *= 1.0 - 0.55 * dot(sv * vec2(1.1, 0.75), sv * vec2(1.1, 0.75));
  col += (hash(s + uFrame * 13.17) - 0.5) * 0.012;
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
