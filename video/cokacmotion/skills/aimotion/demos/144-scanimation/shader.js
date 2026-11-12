/*
 * 144 · one full-screen fragment shader for the desk, the card and both films (three.js ShaderMaterial).
 * Screen space is stage pixels, y down. Every pixel composites, bottom to top:
 *   surface(p)  desk texture → card shadow → card print (texture) + microtext band (glyph lattice, analytic)
 *   film A      barrier grid: clear acetate with opaque bars; exact slit coverage of the pixel (box filter)
 *   film B      lens array: every lenslet images the surface around its own centre (moiré magnifier)
 */
export const VERT = /* glsl */`
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export const fragSrc = (k) => /* glsl */`
precision highp float;
uniform sampler2D uDesk, uCard, uGlyph;
// card: centre on screen, screen → card matrix (rotation / scale), height above the desk, end gloss (pos, strength)
uniform vec2 uCardT; uniform mat2 uCardInv; uniform float uCardLift; uniform vec2 uGloss;
// moiré base layer: microtext band (card px x0 y0 x1 y1), lattice origin (card px), base period
uniform vec4 uBand; uniform vec2 uB0; uniform float uPB;
uniform vec3 uAccent, uBar;
// film A (barrier grid): centre, screen → film matrix, lift 0..1; slit width and period in film px
uniform float uF1On, uF1Lift; uniform vec2 uF1T; uniform mat2 uF1Inv; uniform float uSW, uPF;
// film B (lens array): centre, screen → film and film → screen matrices, lift, lens period, lens image factor, defocus, sheen
uniform float uF2On, uF2Lift, uPR, uLensK, uLensBlur; uniform vec2 uF2T; uniform mat2 uF2Inv, uF2M; uniform vec2 uSheen;

const vec2 VIEW = vec2(${k.W}.0, ${k.H}.0);
const vec2 CARD = vec2(${k.CW}.0, ${k.CH}.0);
const float CR = ${k.CR}.0;
const vec2 F1 = vec2(${k.F1W}.0, ${k.F1H}.0);
const float IN1 = ${k.IN1}.0;
const vec2 F2 = vec2(${k.F2W}.0, ${k.F2H}.0);
const float IN2 = ${k.IN2}.0;
const float GPX = ${k.GPX.toFixed(4)};                 // glyph texels per card px
const float FR = 18.0;                              // film corner radius
const vec2 LIGHT = vec2(-0.48, -0.88);              // towards the light: top left

float sdBox(vec2 q, vec2 h, float r) {
  vec2 d = abs(q) - h + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}
vec2 boxN(vec2 q, vec2 h, float r) {                 // outward normal of the rounded box
  vec2 d = abs(q) - h + r, s = sign(q);
  if (max(d.x, d.y) > 0.0) return s * normalize(max(d, 0.0) + 1e-5);
  return d.x > d.y ? vec2(s.x, 0.0) : vec2(0.0, s.y);
}
// ∫₀ˣ slit(x') dx' for slits [0, SW) repeating every PF: the exact box filter of the barrier is a difference of this
float slitInt(float x) {
  float n = floor(x / uPF);
  return n * uSW + min(x - n * uPF, uSW);
}

// everything below the films at screen point p. blur < 0: filtered by the pixel footprint (analytic gradients);
// blur ≥ 0: a point sample seen through a lenslet, defocused by a radius of blur card px
vec3 surface(vec2 p, float blur) {
  vec3 col = texture(uDesk, p / VIEW).rgb;
  float sc = 1.0 / length(uCardInv[0]);
  float h = uCardLift;
  vec2 qs = uCardInv * (p - uCardT - vec2(5.0 + 16.0 * h, 12.0 + 64.0 * h));
  float b = 20.0 + 46.0 * h;
  col *= 1.0 - (0.40 - 0.16 * h) * (1.0 - smoothstep(-b, b, sdBox(qs, CARD * 0.5, CR) * sc));
  vec2 qc0 = uCardInv * (p - uCardT - vec2(1.0, 2.5));
  col *= 1.0 - 0.32 * (1.0 - h) * (1.0 - smoothstep(-1.5, 3.0, sdBox(qc0, CARD * 0.5, CR) * sc));
  vec2 q = uCardInv * (p - uCardT);
  float sd = sdBox(q, CARD * 0.5, CR) * sc;
  float a = clamp(0.5 - sd, 0.0, 1.0);
  if (a <= 0.0) return col;
  vec2 qc = q + CARD * 0.5;                          // card px from its top-left corner
  vec3 cc = blur < 0.0 ? textureGrad(uCard, qc / CARD, uCardInv[0] / CARD, uCardInv[1] / CARD).rgb
                      : textureLod(uCard, qc / CARD, log2(max(blur, 1.0))).rgb;
  // the moiré base layer: one small glyph cell repeated with period PB (printed upside down, see main.js)
  vec2 lo = clamp(qc - uBand.xy + 0.5, 0.0, 1.0), hi = clamp(uBand.zw - qc + 0.5, 0.0, 1.0);
  float inB = lo.x * lo.y * hi.x * hi.y;
  if (inB > 0.0) {
    vec2 u = (qc - uB0) / uPB;
    float g = blur < 0.0 ? textureGrad(uGlyph, u, uCardInv[0] / uPB, uCardInv[1] / uPB).r
                         : textureLod(uGlyph, u, log2(max(GPX * blur, 1.0))).r;
    cc = mix(cc, uAccent, g * inB);
  }
  cc *= 1.0 + 0.035 * (0.5 - qc.y / CARD.y) + 0.02 * (0.5 - qc.x / CARD.x);   // soft light from the top left
  cc *= 1.0 - 0.10 * (1.0 - smoothstep(0.0, 2.5, -sd));                       // cut edge of the card
  float gl = (qc.x * 0.55 + qc.y - uGloss.x) / 110.0;
  cc += uGloss.y * 0.07 * exp(-gl * gl);                                      // gloss sweep in the afterglow
  return mix(col, cc, a);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, VIEW.y - gl_FragCoord.y);
  vec3 col = surface(p, -1.0);
  vec2 Ld = normalize(LIGHT);

  // ---------------------------------------------------------------- film A: barrier grid
  if (uF1On > 0.5) {
    float fs = 1.0 / length(uF1Inv[0]);
    // shadow: a hairline of the sheet while it lies flat; the bars throw a blurred, offset copy once it lifts
    vec2 fsh = uF1Inv * (p - uF1T - vec2(2.0, 4.0) - uF1Lift * vec2(34.0, 64.0)) + F1 * 0.5;
    float bl = 1.2 + 26.0 * uF1Lift;
    float body = 1.0 - smoothstep(-bl, bl, sdBox(fsh - F1 * 0.5, F1 * 0.5, FR) * fs);
    float hb = bl / fs, xs = fsh.x - IN1;
    float ts = (slitInt(xs + hb) - slitInt(xs - hb)) / (2.0 * hb);
    vec2 es = min(fsh - IN1, F1 - IN1 - fsh);
    float inS = smoothstep(-bl, bl, min(es.x, es.y) * fs);
    col *= 1.0 - body * (0.07 + 0.12 * uF1Lift) - 0.40 * smoothstep(0.0, 1.0, uF1Lift) * (1.0 - ts) * inS;

    vec2 f = uF1Inv * (p - uF1T) + F1 * 0.5;
    float sd = sdBox(f - F1 * 0.5, F1 * 0.5, FR) * fs;
    float a = clamp(0.5 - sd, 0.0, 1.0);
    if (a > 0.0) {
      // exact coverage: the pixel's footprint along the film's x, integrated against the slit pattern
      float hw = 0.5 * (abs(uF1Inv[0].x) + abs(uF1Inv[1].x));
      float x = f.x - IN1;
      float T = (slitInt(x + hw) - slitInt(x - hw)) / (2.0 * hw);
      vec2 eb = min(f - IN1, F1 - IN1 - f) * fs;
      float m = clamp(min(eb.x, eb.y) + 0.5, 0.0, 1.0);
      vec3 film = col * 0.965 + vec3(0.020, 0.028, 0.034);              // clear acetate, a touch cool
      film = mix(film, uBar, m * (1.0 - T) * 0.975);                    // the printed bars
      float gw = (f.x * 0.42 + f.y - 330.0) / 170.0;
      film += 0.035 * exp(-gw * gw);                                    // broad gloss, fixed to the sheet
      float edge = 1.0 - smoothstep(0.0, 2.4, -sd), ln = dot(boxN(f - F1 * 0.5, F1 * 0.5, FR), Ld);
      film += edge * (0.34 * max(ln, 0.0) + 0.06);
      film *= 1.0 - edge * 0.24 * max(-ln, 0.0);
      col = mix(col, film, a);
    }
  }

  // ---------------------------------------------------------------- film B: lens array (moiré magnifier)
  if (uF2On > 0.5) {
    float fs = 1.0 / length(uF2Inv[0]);
    vec2 fsh = uF2Inv * (p - uF2T - vec2(2.0, 4.0) - uF2Lift * vec2(-30.0, 60.0));
    float bl = 1.2 + 26.0 * uF2Lift;
    col *= 1.0 - (0.08 + 0.16 * uF2Lift) * (1.0 - smoothstep(-bl, bl, sdBox(fsh, F2 * 0.5, FR) * fs));

    vec2 f = uF2Inv * (p - uF2T);                                       // film px from its centre
    float sd = sdBox(f, F2 * 0.5, FR) * fs;
    float a = clamp(0.5 - sd, 0.0, 1.0);
    if (a > 0.0) {
      vec3 film = col * 0.965 + vec3(0.020, 0.028, 0.034);
      vec2 lh = F2 * 0.5 - IN2;
      float lm = clamp(min(lh.x - abs(f.x), lh.y - abs(f.y)) * fs + 0.5, 0.0, 1.0);
      if (lm > 0.0) {
        // 2×2 samples: each finds its lenslet k, the lens centre c on screen, and looks through it.
        // A lenslet shows the surface around c, inverted and magnified 1/|K| times: point ps → c + K·(ps − c).
        vec3 acc = vec3(0.0);
        for (int i = 0; i < 4; i++) {
          vec2 ps = p + vec2((i & 1) == 0 ? -0.25 : 0.25, i < 2 ? -0.25 : 0.25);
          vec2 fl = uF2Inv * (ps - uF2T);
          vec2 kk = floor(fl / uPR + 0.5);
          vec2 d = fl / uPR - kk;                                       // −0.5..0.5 inside the lenslet
          vec2 c = uF2T + uF2M * (kk * uPR);
          vec3 img = surface(c + uLensK * (ps - c), uLensBlur);
          float sq = max(abs(d.x), abs(d.y));
          img *= 1.02 - 0.09 * smoothstep(0.36, 0.5, sq) - 0.05 * dot(d, d);   // dome: darker rim
          vec2 hd = d - vec2(-0.16, -0.2);
          img = mix(img, vec3(1.0), 0.34 * exp(-dot(hd, hd) / 0.006));        // one highlight per dome
          acc += img;
        }
        film = mix(film, acc * 0.25, lm);
      }
      float gw = (f.x * 0.42 + f.y + 40.0) / 170.0;
      film += 0.03 * exp(-gw * gw);
      float sw = (f.x + 0.55 * f.y - uSheen.x) / 70.0;
      film += uSheen.y * 0.20 * exp(-sw * sw);                          // the sheen that runs across at the lock
      float edge = 1.0 - smoothstep(0.0, 2.4, -sd), ln = dot(boxN(f, F2 * 0.5, FR), Ld);
      film += edge * (0.34 * max(ln, 0.0) + 0.06);
      film *= 1.0 - edge * 0.24 * max(-ln, 0.0);
      col = mix(col, film, a);
    }
  }
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
