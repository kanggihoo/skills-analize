/*
 * 23 · the tape, the VCR and the television.
 *   RECORD (720×240 per field): camcorder RGB → YIQ; luma band-limited (~3 MHz), chroma squeezed to ~0.5 MHz,
 *     delayed and averaged with the neighbouring line (colour-under) — stored as (Y, I, Q).
 *   PLAY (720×240): time-base error per scanline (wow, jitter, top-of-frame flagging, head switching at the
 *     bottom), mistracking bands, dropouts, tape hiss on luma and blotchy chroma noise, the playback peaking
 *     that rings around edges, vertical roll while the servo locks, then the VCR's own clean on-screen display.
 *   CRT (stage): curved glass, raster with barrel distortion, 240 scanlines whose beam widens with brightness
 *     (per gun), aperture grille + damper wires, glass halation, 9300 K white, bezel lit by the picture,
 *     reflections on the faceplate, and the power-off collapse to a line, a dot and its afterglow.
 */
const COMMON = `#version 300 es
precision highp float;
const mat3 RGB2YIQ = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);
const mat3 YIQ2RGB = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);
uint hu(uint x) { x ^= x >> 16; x *= 0x7feb352du; x ^= x >> 15; x *= 0x846ca68bu; x ^= x >> 16; return x; }
float hl(float a, float b) { return float(hu(uint(a + 8192.0) * 0x9E3779B1u ^ hu(uint(b) + 0x85ebca6bu)) & 0xffffffu) / 16777215.0; }
float n1(float x, float seed) { float i = floor(x), f = x - i; f = f * f * (3.0 - 2.0 * f); return mix(hl(i, seed), hl(i + 1.0, seed), f); }
`;

export const RECORD_FS = COMMON + `
uniform sampler2D uCam;
out vec4 o;
vec3 yiq(vec2 uv) { return RGB2YIQ * texture(uCam, uv).rgb; }
void main() {
  float x = gl_FragCoord.x;
  // one field: the camcorder integrates two CCD rows per line, so sample exactly between them
  float v = gl_FragCoord.y / 240.0;
  float Y = 0.0, ws = 0.0;
  for (int i = -3; i <= 3; i++) {
    float w = exp(-float(i * i) / 2.4);
    Y += w * yiq(vec2((x + float(i)) / 720.0, v)).x;
    ws += w;
  }
  Y /= ws;
  vec2 C = vec2(0.0);
  ws = 0.0;
  for (int i = -15; i <= 15; i++) {
    float w = exp(-float(i * i) / 60.0);
    vec2 uvc = vec2((x - 2.5 + float(i)) / 720.0, v);
    C += w * 0.5 * (yiq(uvc).yz + yiq(uvc + vec2(0.0, 1.0 / 240.0)).yz);
    ws += w;
  }
  C /= ws;
  o = vec4(Y, C * 0.92, 1.0);
}`;

export const PLAY_FS = COMMON + `
uniform sampler2D uTape, uOSD;
uniform float uField, uTrk, uBlue, uRoll, uSnow, uOsdPlay, uOsdTrk, uMeter;
out vec4 o;
const float NS = 720.0, NL = 240.0;
vec3 tape(float x, float ln) { return texture(uTape, vec2(x / NS, 1.0 - (ln + 0.5) / NL)).rgb; }
void main() {
  float x = gl_FragCoord.x - 0.5;
  float line = NL - 0.5 - gl_FragCoord.y;          // 0 = top
  float F = uField, tF = uField / 59.94;
  float sl = mod(line + uRoll, 262.0);             // vertical hold: lines 240..261 are the blanking interval
  float seed = F * 263.0 + floor(sl);

  // ---- time-base error of this scanline (samples): wow, jitter, flagging at the top, head switching at the bottom
  float dx = 0.8 * sin(sl * 0.031 + F * 0.21) + 0.45 * sin(sl * 0.113 - F * 0.47) + 0.3 * sin(F * 0.05);
  dx += (hl(sl, F * 7.0 + 1.0) - 0.5) * (0.7 + 3.5 * uTrk);
  float fl = max(1.0 - sl / 16.0, 0.0);
  dx += 7.0 * fl * fl * (0.8 + 0.4 * hl(3.0, F * 7.0 + 2.0));
  // ---- mistracking: two noisy bands crawl up the picture, and the bottom third gets ragged
  float band = 0.0;
  for (int j = 0; j < 2; j++) {
    float yb = fract(0.92 - tF * 0.21 + 0.5 * float(j)) * 262.0;
    float d = abs(sl - yb);
    d = min(d, 262.0 - d);
    float hw = (3.0 + 20.0 * uTrk) * (0.6 + 0.8 * n1(x * 0.012 + float(j) * 7.0, F * 2.0 + float(j)));
    band = max(band, smoothstep(hw, hw * 0.3, d));
  }
  band = max(band, 0.55 * smoothstep(170.0, 236.0, sl) * smoothstep(0.3, 1.0, uTrk));
  float bs = band * min(uTrk * 1.6, 1.0);
  dx += bs * (14.0 + 26.0 * hl(sl, F * 7.0 + 3.0));
  float hsw = smoothstep(231.5, 234.5, sl) * step(sl, 240.0);
  dx += hsw * (10.0 + (sl - 233.0) * 3.0 + 8.0 * hl(sl, F * 7.0 + 4.0));

  float xs = x - dx;
  vec3 c = tape(xs, sl);
  // playback peaking: overshoot around edges, plus a faint echo a few samples to the right
  float Yl = tape(xs - 1.7, sl).x, Yr = tape(xs + 1.7, sl).x;
  float Yl2 = tape(xs - 4.5, sl).x, Yr2 = tape(xs + 4.5, sl).x;
  float Y = c.x + 0.95 * (c.x - 0.5 * (Yl + Yr)) - 0.22 * (c.x - 0.5 * (Yl2 + Yr2));
  Y += 0.10 * (c.x - tape(xs - 6.0, sl).x);
  vec2 IQ = c.yz;
  // tape hiss: streaks along the line; chroma noise: long blotches
  Y += (n1(x * 0.45, seed) - 0.5) * 0.055 + (hl(x, seed + 0.5) - 0.5) * 0.025;
  IQ += (vec2(n1(x * 0.07, seed + 1e5), n1(x * 0.07, seed + 2e5)) - 0.5) * 0.07;
  // snow: white dashes (mistracking, startup)
  float snow = smoothstep(0.62, 0.95, n1(x * 0.8, seed + 3e5)) * 1.05 + (hl(x, seed + 4e5) - 0.5) * 0.15;
  float sn = max(bs * 0.85, uSnow);
  Y = mix(Y, snow, sn);
  IQ *= (1.0 - bs) * (1.0 - uSnow) * (1.0 - 0.5 * uTrk);           // the colour killer drops weak chroma
  Y += hsw * ((hl(x * 0.3, seed + 5e5) - 0.5) * 0.35 - 0.05);
  // dropouts: oxide missing for a moment, a short white streak
  for (int j = 0; j < 4; j++) {
    uint h = hu(uint(F) * 4u + uint(j) + 77u);
    vec4 r = vec4(uvec4(h, h >> 8, h >> 16, h >> 24) & 255u) / 255.0;
    if (r.w > 0.30 + 0.55 * uTrk) continue;
    float lj = floor(r.x * 232.0);
    float x0 = r.y * 700.0, len = 12.0 + 140.0 * r.z * r.z;
    float on = step(abs(sl - lj), 0.5) + 0.6 * step(abs(sl - lj - 1.0), 0.5) * step(x, x0 + len * 0.4);
    float d = on * smoothstep(x0, x0 + 3.0, x) * smoothstep(x0 + len, x0 + len - 6.0, x);
    Y = mix(Y, 0.92 + 0.15 * hl(x, seed + 6e5), d * 0.9);
    IQ *= 1.0 - d;
  }
  if (sl >= 240.0) {
    // vertical blanking (seen only while the picture rolls): black, with the closed-caption data line
    Y = 0.0;
    IQ = vec2(0.0);
    if (floor(sl) == 254.0 && x > 130.0) Y = 0.5 * step(0.5, hl(floor(x / 12.0), F));
  }
  vec3 rgb = YIQ2RGB * vec3(Y, IQ);
  rgb = mix(rgb, vec3(0.05, 0.12, 0.70), uBlue);                    // the VCR's blue screen
  // the VCR's on-screen display: clean, it never went through the tape
  vec4 osd = texture(uOSD, vec2((x + 0.5) / NS, 1.0 - (line + 0.5) / NL));
  float a = osd.a * (line < 120.0 ? max(uOsdPlay, uBlue) : uOsdTrk);
  rgb = mix(rgb, osd.rgb, a);
  if (uOsdTrk > 0.0 && line > 202.0 && line < 214.0) {
    float k = floor((x - 360.0) / 28.0 + 0.5);
    if (abs(k) <= 5.0) {
      vec2 bq = vec2(x - 360.0 - k * 28.0, line - 208.0);
      float shadow = step(abs(bq.x), 11.0) * step(abs(bq.y), 6.0);
      float outer = step(abs(bq.x), 9.0) * step(abs(bq.y), 4.5);
      float inner = step(abs(bq.x), 7.0) * step(abs(bq.y), 3.0);
      float fill = step(abs(k + 5.0 - floor(uMeter * 10.0 + 0.5)), 0.5);
      rgb = mix(rgb, vec3(0.02), shadow * uOsdTrk * 0.7);
      rgb = mix(rgb, vec3(0.95), outer * (1.0 - inner * (1.0 - fill)) * uOsdTrk);
    }
  }
  o = vec4(rgb, 1.0);
}`;

// bloom: first step turns the signal into light (CRT gamma 2.4) while halving; then 13-tap down, tent up
export const LIN_FS = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o; uniform sampler2D src; uniform vec2 texel;
vec3 L(vec2 d) { return pow(max(texture(src, uv + d * texel).rgb, 0.0), vec3(2.4)); }
void main() { o = vec4(0.25 * (L(vec2(-0.5, -0.5)) + L(vec2(0.5, -0.5)) + L(vec2(-0.5, 0.5)) + L(vec2(0.5, 0.5))), 1.0); }`;
export const DOWN_FS = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o; uniform sampler2D src; uniform vec2 texel;
vec3 s(vec2 o2) { return texture(src, uv + o2 * texel).rgb; }
void main() {
  vec3 c = s(vec2(0)) * 0.125;
  c += (s(vec2(-1, -1)) + s(vec2(1, -1)) + s(vec2(-1, 1)) + s(vec2(1, 1))) * 0.125;
  c += (s(vec2(-2, -2)) + s(vec2(2, -2)) + s(vec2(-2, 2)) + s(vec2(2, 2))) * 0.03125;
  c += (s(vec2(0, -2)) + s(vec2(0, 2)) + s(vec2(-2, 0)) + s(vec2(2, 0))) * 0.0625;
  o = vec4(c, 1.0);
}`;
export const UP_FS = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o; uniform sampler2D src; uniform vec2 texel;
vec3 s(vec2 o2) { return texture(src, uv + o2 * texel).rgb; }
void main() {
  vec3 c = s(vec2(0)) * 4.0;
  c += (s(vec2(-1, 0)) + s(vec2(1, 0)) + s(vec2(0, -1)) + s(vec2(0, 1))) * 2.0;
  c += s(vec2(-1, -1)) + s(vec2(1, -1)) + s(vec2(-1, 1)) + s(vec2(1, 1));
  o = vec4(c / 16.0, 1.0);
}`;
export const FS_VS = `#version 300 es
layout(location=0) in vec2 p; out vec2 uv;
void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0, 1); }`;

export const CRT_FS = (G) => COMMON + `
uniform sampler2D uSig, uBloom, uAvg;
uniform vec2 uRes;
uniform float uMode, uVs, uHs, uGain, uLine, uDot, uGlow;
uniform vec3 uLed;
out vec4 o;
const vec2 PC = vec2(${G.PCX.toFixed(1)}, ${G.PCY.toFixed(1)});
const float PH = ${G.PH.toFixed(1)};
const float K = 0.045;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float sbox(vec2 p, vec2 a, vec2 b, float s) { vec2 v = smoothstep(a - s, a + s, p) * smoothstep(b + s, b - s, p); return v.x * v.y; }
void main() {
  vec2 sp = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 c = (sp - PC) / PH;                             // tube coordinates: y in -1..1 over the picture height
  vec2 p = c * (1.0 + K * dot(c, c));                  // the raster as seen on curved glass (barrel)
  float lim = 0.955 - 0.010 * c.x * c.x;               // the bezel opening, bowed like the tube
  float open = smoothstep(lim + 0.003, lim - 0.003, abs(c.y));
  // how much light the picture throws into the room
  vec3 avg = (2.0 * texture(uAvg, vec2(0.5)).rgb + texture(uAvg, vec2(0.25, 0.3)).rgb + texture(uAvg, vec2(0.75, 0.3)).rgb
            + texture(uAvg, vec2(0.25, 0.7)).rgb + texture(uAvg, vec2(0.75, 0.7)).rgb) / 6.0 * uGain * (1.0 - uMode) + uGlow;
  float aL = dot(avg, vec3(0.3, 0.5, 0.2));

  vec3 col;
  if (open > 0.0) {
    vec3 light = vec3(0.0);
    if (uMode < 0.5) {
      vec2 q = p / vec2(uHs, uVs);
      vec2 pic = vec2(q.x / 1.33333 * 0.5 + 0.5, q.y * 0.5 + 0.5);
      float L = pic.y * 240.0;
      float li = floor(L);
      for (int j = -1; j <= 1; j++) {
        float ln = li + float(j);
        if (ln < 0.0 || ln > 239.0) continue;
        vec3 s = texture(uSig, vec2(pic.x, 1.0 - (ln + 0.5) / 240.0)).rgb;
        vec3 lin = pow(max(s, 0.0), vec3(2.4));
        vec3 sg = 0.29 + 0.24 * sqrt(clamp(lin, 0.0, 1.5));       // each gun's beam widens with its current
        float d = L - (ln + 0.5);
        light += lin * exp(-d * d / (2.0 * sg * sg)) / (sg * 2.5066);
      }
      float edge = smoothstep(1.0, 0.994, abs(q.y)) * smoothstep(1.3333, 1.328, abs(q.x));
      light += texture(uBloom, vec2(pic.x, 1.0 - pic.y)).rgb * 0.11;   // halation inside the faceplate
      light *= edge * uGain / (uVs * uHs);
    } else {
      // the deflection has collapsed: a bright line, then a dot that slowly fades
      float sy = max(uVs, 0.004);
      float yp = exp(-0.5 * (p.y / sy) * (p.y / sy));
      float hlen = uHs * 1.3333;
      float xp = smoothstep(hlen + 0.015, max(hlen - 0.015, 0.0), abs(p.x));
      light = vec3(0.92, 0.97, 1.1) * uLine * yp * xp;
      float rd = length(p);
      light += vec3(0.85, 0.93, 1.0) * uDot * (4.0 * exp(-rd * rd / (2.0 * 0.010 * 0.010)) + 0.35 * exp(-rd / 0.05));
    }
    // aperture grille (fixed on the glass) and the two damper wires of a Trinitron
    light *= 1.0 + 0.5 * cos(6.2831853 * (sp.x / 7.2 - vec3(0.0, 1.0, 2.0) / 3.0));
    float w1 = (sp.y - (PC.y - PH * 0.34)) / 0.9, w2 = (sp.y - (PC.y + PH * 0.34)) / 0.9;
    light *= 1.0 - 0.32 * (exp(-w1 * w1) + exp(-w2 * w2));
    light *= vec3(0.93, 0.98, 1.08);                      // 9300 K: a Korean living-room TV's bluish white
    light *= mix(1.0, 0.7, smoothstep(0.4, 2.0, dot(c, c)));
    // the faceplate: grey phosphor lit by the room, a window and a lamp reflected, a sheen along the top
    vec3 glass = vec3(0.008, 0.0087, 0.010) * (0.3 + 4.0 * aL);
    glass += vec3(0.014, 0.018, 0.024) * sbox(c, vec2(-0.80, -0.88), vec2(-0.40, -0.40), 0.10);
    glass += vec3(0.022, 0.017, 0.011) * exp(-dot(c - vec2(0.56, -0.64), c - vec2(0.56, -0.64)) * 14.0);
    float sheen = (c.y + lim) / 0.05;
    glass += vec3(0.022, 0.024, 0.028) * exp(-sheen * sheen) * (0.6 + 0.4 * cos(c.x * 2.0));
    col = (light + glass) * open;
  } else col = vec3(0.0);

  // the cabinet: dark plastic, lit by the picture near the opening, an inner bevel that catches the light
  float dist = abs(c.y) - lim;
  vec3 plastic = vec3(0.050, 0.050, 0.056) * (0.95 + 0.1 * hash12(floor(sp * 0.7)));
  vec3 cab = plastic * (0.05 + 1.6 * aL * exp(-max(dist, 0.0) / 0.22));
  cab += vec3(0.10, 0.10, 0.11) * aL * smoothstep(0.035, 0.0, dist) * smoothstep(-0.002, 0.006, dist);
  // speaker slots and the power LED on the lower bezel
  if (sp.y > ${G.SLOT0.toFixed(1)} && sp.y < ${G.SLOT1.toFixed(1)} && (sp.x > 70.0 && sp.x < 330.0 || sp.x > 750.0 && sp.x < 1010.0)) {
    cab *= mix(1.0, 0.3, smoothstep(0.4, 0.6, fract(sp.y / 15.0)) * smoothstep(0.95, 0.8, fract(sp.y / 15.0)));
  }
  vec2 ld = sp - vec2(${G.LEDX.toFixed(1)}, ${G.LEDY.toFixed(1)});
  float lr = length(ld);
  cab += uLed * (smoothstep(7.0, 5.0, lr) * 0.9 + 0.08 * exp(-lr / 14.0));
  col = mix(cab, col, open);
  col = pow(max(col, 0.0), vec3(1.0 / 2.2));
  col += (hash12(sp + 0.31) - 0.5) / 255.0;
  o = vec4(col, 1.0);
}`;
