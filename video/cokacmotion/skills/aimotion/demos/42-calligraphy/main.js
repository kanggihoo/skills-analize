/*
 * 42 · 붓으로 쓴 한 글자 — a brush writes 길 on hanji (WebGL2: instanced bristle capsules + a GPU capillary bleed sim).
 *
 * brush.js — the brush as a bundle of 96 bristles, the five strokes of 길 with 기필·행필·수필 pressure, the tip angle,
 *            per-bristle ink loads that drain and refill. Baked once into ~120k capsules (bristle × 1/240 s), sorted by time.
 * Paper    — hanji baked once: long 닥 fibres in every direction (hash grid, bent segments), flocculated formation,
 *            fine grain, bark specks, a deckled edge on dark felt. From the same fibres, at the bleed grid's
 *            resolution, a capillary conductance per cell edge (fibre orientation tensor · edge direction).
 * Ink      — two layers, both written by the capsules of each sub-step:
 *            mark  (stage resolution): carbon pressed into the fibres by each hair. A hair deposits in proportion to its
 *                  contact time; a drying hair only catches the fibres that stand up (threshold on the tooth that rises
 *                  as its load falls) → broken lanes = 비백.
 *            bleed (2 px cells): the water the hairs release (∝ load², pressure, contact time — so dwelling heads
 *                  and press-stops flood) spreads by capillarity: porous-medium flow on 8 neighbours,
 *                  F = Dk·K_edge·M(w̄)·Δw with M = w̄²/(w̄²+M0) — wet ink runs far, damp ink barely moves, the front stays
 *                  sharp and follows the fibres. Carbon rides the water but the fibres filter it (factor < 1), and it
 *                  settles faster where the film is thin → grey feathered halo with a darker rim; water alone leaves a
 *                  translucent wet zone that fades as it dries.
 * Seeking  — replay(): 4 sub-steps per video frame, checkpoints are GPU blits of the mark and the bleed state.
 * Overlay  — the brush (bamboo handle in perspective, ferrule, wet tuft pressed into its footprint) and the seal stone,
 *            with soft shadows, drawn on a 2D canvas as a pure function of t.
 */
import { defineDemo, replay, track, ease, clamp, lerp, smooth } from '../_lib/stage.js';
import { buildCapsules, brushPose, footprint, WRITE_END } from './brush.js';

const HEADLESS = new URLSearchParams(location.search).has('render');
const D = 10, FPS = 30, SUB = 4;
const RX = 80, RY = 150, RW = 920, RH = 1400;         // the ink region (stage px, y down)
const GY0 = 1920 - (RY + RH);                          // its bottom edge in GL px
const NX = RW / 2, NY = RH / 2;                        // bleed grid: one cell = 2 × 2 px
const SHEET = [44, 76, 1036, 1704];                    // the hanji sheet (stage px)
const SEAL = { x: 250, y: 1500, s: 116, rot: -0.03 };  // the seal impression
const ST = { down: 7.72, touch: 8.0, up: 8.3, gone: 8.85 };   // seal stamping
const VP = [540, -2600], HC = 4200;                     // overlay perspective: vanishing point above the frame, camera height
const LDIR = [0.62, 0.42];                              // shadow offset per unit height (light from the upper left)

// ---------------------------------------------------------------- shaders
const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

const HEAD0 = `#version 300 es
precision highp float;
precision highp sampler2D;
float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
`;
const HEAD = HEAD0 + 'out vec4 o;\n';

// hanji (닥) fibres: long, thin, gently bent, in every direction. Cells of 34 px hold 3 fibres each, a fibre reaches at
// most 32 px from its centre, so the 3×3 cells around a point see every fibre that can touch it.
// I = brightness of the nearest fibre, T = orientation tensor (t⊗t) of the fibres within ~2 px (for capillarity).
const FIBRES = `
void fibres(vec2 p, float scale, out float I, out vec3 T) {
  const float CS = 34.0;
  vec2 q = p / scale;
  vec2 ci = floor(q / CS);
  I = 0.0; T = vec3(0.0);
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 c = ci + vec2(x, y);
    for (int k = 0; k < 3; k++) {
      vec2 sd = c + float(k) * 31.7 + scale * 7.3;
      vec2 ctr = (c + vec2(hash(sd), hash(sd + 3.7))) * CS;
      float ang = hash(sd + 9.1) * 3.14159265;
      float hl = 12.0 + 20.0 * hash(sd + 1.3);
      float bend = (hash(sd + 5.5) - 0.5) * 9.0;
      float th = 0.42 + 0.55 * hash(sd + 2.2);
      vec2 dir = vec2(cos(ang), sin(ang)), nrm = vec2(-dir.y, dir.x), d = q - ctr;
      float s = clamp(dot(d, dir) / hl, -1.0, 1.0);
      vec2 off = d - dir * s * hl - nrm * bend * (1.0 - s * s);
      float dist2 = dot(off, off);
      float ends = 1.0 - smoothstep(0.8, 1.0, abs(s));
      I = max(I, exp(-dist2 / (th * th)) * ends * (0.45 + 0.55 * hash(sd + 8.8)));
      vec2 tg = normalize(dir * hl + nrm * bend * 2.0 * s);
      T += exp(-dist2 / 5.0) * ends * vec3(tg.x * tg.x, tg.y * tg.y, tg.x * tg.y);
    }
  }
}
`;

// stage-resolution paper: fibre brightness, tooth height (what a dry hair catches), formation, bark specks
const PAPER = HEAD + FIBRES + `
void main() {
  vec2 p = gl_FragCoord.xy;
  float I1, I2; vec3 T1, T2;
  fibres(p, 1.0, I1, T1);
  fibres(p + 517.0, 0.55, I2, T2);
  float fib = max(I1, 0.65 * I2);
  float form = fbm(p / 42.0);                              // flocs: the sheet is cloudy in transmitted light
  float grain = vnoise(p / 2.2) * 0.6 + vnoise(p / 5.0) * 0.4;
  float tooth = smoothstep(0.12, 0.72, 0.5 * fib + 0.3 * grain + 0.3 * form);
  vec2 b = floor(p / 2.0);
  float speck = step(0.9991, hash(b + 3.1)) * (0.4 + 0.6 * hash(b + 9.4));
  o = vec4(fib, tooth, form, speck);
}`;

// the desk: the deckled edge of the sheet (+ fibres fraying out of it), the felt's nap, the sheet's contact shadow
const DESK = HEAD + FIBRES + `
uniform vec4 sheet;
float inside(vec2 s) { return min(min(s.x - sheet.x, sheet.z - s.x), min(s.y - sheet.y, sheet.w - s.y)); }
void main() {
  vec2 p = gl_FragCoord.xy, s = vec2(p.x, 1920.0 - p.y);
  float wob = 5.0 * (fbm(s * 0.02) - 0.5) + 2.2 * (vnoise(s * 0.18) - 0.5);
  float din = inside(s) + wob;
  float I; vec3 T;
  fibres(p + 91.0, 0.7, I, T);
  float a = smoothstep(-0.7, 0.7, din);
  a = max(a, 0.85 * I * smoothstep(-7.0, 0.0, din));
  float felt = 0.6 * fbm(p / 2.6) + 0.4 * fbm(p / 11.0);
  float sh = smoothstep(-5.0, 3.0, inside(s - vec2(2.5, 3.5)) + wob);
  o = vec4(a, felt, sh, 0.0);
}`;

// capillary conductance of each cell edge (E, N, NE, NW) from the fibre orientation tensor at the edge's midpoint:
// water runs along fibres. Symmetric by construction (one value per edge).
const COND = HEAD + FIBRES + `
uniform vec2 origin;
float cond(vec3 T, vec2 d) { return clamp(0.16 + 1.15 * (T.x * d.x * d.x + T.y * d.y * d.y + 2.0 * T.z * d.x * d.y), 0.0, 1.0); }
void main() {
  vec2 p = origin + floor(gl_FragCoord.xy) * 2.0 + 1.0;
  float I; vec3 T;
  vec4 K;
  fibres(p + vec2(1.0, 0.0), 1.0, I, T);  K.x = cond(T, vec2(1.0, 0.0));
  fibres(p + vec2(0.0, 1.0), 1.0, I, T);  K.y = cond(T, vec2(0.0, 1.0));
  fibres(p + vec2(1.0, 1.0), 1.0, I, T);  K.z = cond(T, vec2(0.7071, 0.7071));
  fibres(p + vec2(-1.0, 1.0), 1.0, I, T); K.w = cond(T, vec2(-0.7071, 0.7071));
  o = K * (0.72 + 0.56 * fbm(p / 42.0));
}`;

// one bristle capsule (segment a→b, radius r) — instanced, 4 vertices
const CAP_VS = `#version 300 es
in vec4 aAB; in vec4 aP; in float aS;
uniform vec4 region;
out vec2 vPos; flat out vec4 vAB; flat out vec4 vP; flat out float vS;
void main() {
  vec2 a = aAB.xy, b = aAB.zw, d = b - a;
  float r = max(aP.x, 1.2) + 1.6, L = length(d);
  vec2 dir = L > 1e-4 ? d / L : vec2(1.0, 0.0), nrm = vec2(-dir.y, dir.x);
  float sx = (gl_VertexID == 0 || gl_VertexID == 2) ? -1.0 : 1.0;
  float sy = gl_VertexID < 2 ? -1.0 : 1.0;
  vec2 p = (sx < 0.0 ? a - dir * r : b + dir * r) + nrm * sy * r;
  vPos = p; vAB = aAB; vP = aP; vS = aS;
  vec2 c = (p - region.xy) / region.zw;
  gl_Position = vec4(c.x * 2.0 - 1.0, 1.0 - c.y * 2.0, 0.0, 1.0);
}`;
const CAP_FS = HEAD + `
uniform sampler2D Pp;
uniform int mode;
in vec2 vPos; flat in vec4 vAB; flat in vec4 vP; flat in float vS;
void main() {
  vec2 a = vAB.xy, ba = vAB.zw - vAB.xy, pa = vPos - a;
  float h2 = dot(ba, ba);
  float tt = h2 > 1e-6 ? clamp(dot(pa, ba) / h2, 0.0, 1.0) : 0.0;
  float d = length(pa - ba * tt), r = vP.x;
  if (mode == 0) {
    // carbon pressed into the fibres. A drying hair (load L) only catches the tooth above a threshold that rises
    // as L falls; the hair's own wobble breaks its lane (→ 비백, flying white)
    float cov = 1.0 - smoothstep(r - 0.75, r + 0.75, d);
    if (cov <= 0.0) discard;
    float h = texelFetch(Pp, clamp(ivec2(int(vPos.x), int(1920.0 - vPos.y)), ivec2(0), ivec2(1079, 1919)), 0).g;
    float thr = 1.5 - 2.4 * vP.w;
    float n = vnoise(vPos * 0.06 + vS * 3.1) - 0.5;
    float g = smoothstep(thr - 0.09, thr + 0.09, h + 0.34 * n);
    o = vec4(vP.y * cov * g, 0.0, 0.0, 0.0);
  } else {
    // water (and the carbon it carries) into the bleed grid; small hairs are widened to the cell size, same volume
    float re = max(r, 1.3);
    float cov = (1.0 - smoothstep(re - 1.0, re + 1.0, d)) * (r * r) / (re * re);
    if (cov <= 0.0) discard;
    o = vec4(vP.z * cov, 0.72 * vP.z * cov, 0.0, 0.0);
  }
}`;

// the bleed: capillary porous-medium flow along fibre conductances, carbon carried and filtered, settling, drying
const SIM = HEAD + `
uniform sampler2D S, Src, K;
uniform float Dk, M0, filt, rho, evap;
ivec2 m;
float w0, c0, dw, dc;
vec4 st(ivec2 r) { r = clamp(r, ivec2(0), m); vec4 a = texelFetch(S, r, 0); a.xy += texelFetch(Src, r, 0).xy; return a; }
vec4 kat(ivec2 r) { return texelFetch(K, clamp(r, ivec2(0), m), 0); }
void flow(vec4 sj, float kk) {
  float mm = 0.5 * (w0 + sj.x);
  float M = mm * mm / (mm * mm + M0);                     // wetter fibres conduct better (Richards / porous medium)
  float F = Dk * kk * M * (sj.x - w0);                   // > 0: water comes in from j
  float conc = F > 0.0 ? sj.y / max(sj.x, 1e-4) : c0 / max(w0, 1e-4);
  dw += F;
  dc += F * min(conc, 3.0) * filt;                       // the fibres filter the carbon out of the moving water
}
void main() {
  m = textureSize(S, 0) - 1;
  ivec2 q = ivec2(gl_FragCoord.xy);
  vec4 s = st(q);
  w0 = s.x; c0 = s.y; dw = 0.0; dc = 0.0;
  vec4 k = texelFetch(K, q, 0);
  flow(st(q + ivec2(1, 0)), k.x);
  flow(st(q + ivec2(0, 1)), k.y);
  flow(st(q + ivec2(1, 1)), 0.5 * k.z);
  flow(st(q + ivec2(-1, 1)), 0.5 * k.w);
  flow(st(q + ivec2(-1, 0)), kat(q + ivec2(-1, 0)).x);
  flow(st(q + ivec2(0, -1)), kat(q + ivec2(0, -1)).y);
  flow(st(q + ivec2(-1, -1)), 0.5 * kat(q + ivec2(-1, -1)).z);
  flow(st(q + ivec2(1, -1)), 0.5 * kat(q + ivec2(1, -1)).w);
  float w = max(w0 + dw, 0.0), c = max(c0 + dc, 0.0), f = s.z;
  // carbon settles onto the fibres, faster where the film is thin (the creeping front → a darker rim)
  float settle = w < 0.004 ? c : rho * c * (0.08 / (w + 0.08));
  c -= settle; f += settle;
  w = max(w - evap * (0.3 + w), 0.0);
  o = vec4(w, c, f, max(s.w, w));
}`;

const CLEAR = HEAD + `uniform vec4 val; void main() { o = val; }`;

// the picture: felt, the hanji sheet in window light, Beer–Lambert ink, wet translucency and sheen, the seal,
// the paperweight
const DISPLAY = HEAD + `
uniform sampler2D Pp, Dk, Mk, Sm, Sl;
uniform vec2 zc, simPx;
uniform vec4 region, sealR;
uniform float zoom, fade, sealOn, warm;
float sdBox(vec2 p, vec2 b, float r) { vec2 d = abs(p) - b + r; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r; }
void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 p = zc + (fc - zc) / zoom;
  vec2 s = vec2(p.x, 1920.0 - p.y);
  vec2 uv = clamp(p / vec2(1080.0, 1920.0), 0.0, 1.0);
  vec4 pp = texture(Pp, uv), dk = texture(Dk, uv);

  // window light from the upper left, a soft pool on the desk
  vec2 lq = (s - vec2(180.0, 260.0)) / vec2(1500.0, 1900.0);
  float light = (1.07 - 0.32 * dot(lq, lq)) * fade;
  vec3 lampC = mix(vec3(1.0, 0.985, 0.95), vec3(1.0, 0.95, 0.86), warm);

  // felt underlay: dark, with a soft nap
  vec3 felt = vec3(0.011, 0.012, 0.015) * (0.7 + 0.6 * dk.g);
  felt *= 1.0 - 0.5 * dk.b;                                    // the sheet's thin shadow on the felt

  // the sheet
  vec3 paper = vec3(0.80, 0.765, 0.67);
  paper *= 0.95 + 0.1 * (pp.b - 0.5) * 2.0 * 0.5;
  paper *= 1.0 + 0.07 * pp.r;                                  // the long fibres catch the light
  paper *= 1.0 - 0.012 * smoothstep(0.55, 1.0, sin(s.y * 6.2832 / 3.7 + 2.0 * vnoise(s * vec2(0.01, 0.05))));   // laid lines of the screen
  paper *= 1.0 - 0.02 * smoothstep(0.93, 1.0, cos(6.2832 * (s.x + 6.0 * vnoise(s * vec2(0.003, 0.01))) / 74.0)); // chain lines
  paper = mix(paper, paper * vec3(0.55, 0.42, 0.3), 0.55 * pp.a);  // bark specks

  // ink
  vec2 ru = (p - region.xy) / region.zw;
  float inR = step(0.0, ru.x) * step(ru.x, 1.0) * step(0.0, ru.y) * step(ru.y, 1.0);
  float mk = texture(Mk, ru).r * inR;
  vec4 sm = texture(Sm, ru) * inR;
  float wet = smoothstep(0.015, 0.4, sm.x);
  float halo = (sm.y + sm.z) * (0.75 + 0.5 * pp.r);           // the halo sits in the fibres → feathered at full resolution
  // the fibres saturate: once they are full of carbon more ink hardly darkens them (dry hair lines stay grey)
  float odm = 4.3 * (1.0 - exp(-mk * (1.0 - 0.14 * pp.r) / 1.7));
  float od = odm + 1.55 * halo + 0.045 * smoothstep(0.02, 0.2, sm.w);   // + the faint water mark
  od *= 1.0 + 0.12 * wet;
  vec3 T = exp(-od * vec3(1.0, 0.962, 0.9));                  // pine-soot ink: diluted it turns a cool grey
  vec3 refl = paper * (1.0 - 0.17 * wet) * T;                 // wet hanji turns translucent and shows the dark felt

  // seal impression: cinnabar paste, grainy, slightly uneven pressure, ragged carved edges
  vec2 sq = s - sealR.xy;
  float cr = cos(sealR.w), sr = sin(sealR.w);
  sq = vec2(cr * sq.x - sr * sq.y, sr * sq.x + cr * sq.y);
  vec2 su = sq / sealR.z + 0.5;
  if (sealOn > 0.0 && su.x > -0.02 && su.x < 1.02 && su.y > -0.02 && su.y < 1.02) {
    float mask = texture(Sl, su).r;
    float rough = 0.16 * (vnoise(s * 0.45) - 0.5) + 0.1 * (vnoise(s * 1.3) - 0.5);
    float edge = 1.0 - smoothstep(-0.004, 0.006, max(abs(su.x - 0.5), abs(su.y - 0.5)) - 0.5 + 0.008 * (vnoise(s * 0.3) - 0.5));
    float m = smoothstep(0.42, 0.58, mask + rough) * edge;
    float paste = (0.72 + 0.28 * fbm(s * 0.35)) * (0.82 + 0.18 * smoothstep(0.0, 1.0, 1.2 - su.x * 0.6 - su.y * 0.5));
    paste *= smoothstep(0.05, 0.4, pp.g + 0.25);              // the deepest pores stay white
    float dens = clamp(m * paste * sealOn, 0.0, 1.0);
    refl = mix(refl, refl * vec3(0.86, 0.15, 0.10), dens);
  }

  vec3 col = mix(felt, refl, dk.r);

  // the sheen of wet ink: a broad window reflection on the liquid film, brighter where it curves
  if (sm.x > 0.01) {
    vec2 e = 1.0 / simPx;
    float gx = texture(Sm, ru + vec2(e.x, 0.0)).x - texture(Sm, ru - vec2(e.x, 0.0)).x;
    float gy = texture(Sm, ru + vec2(0.0, e.y)).x - texture(Sm, ru - vec2(0.0, e.y)).x;
    vec3 n = normalize(vec3(-gx * 3.0, -gy * 3.0, 1.0));
    vec3 H = normalize(vec3(-0.42, 0.5, 1.0) + vec3(0.0, 0.0, 1.0));
    float sp = pow(max(dot(n, H), 0.0), 18.0);
    col += wet * (0.012 + 0.11 * sp) * vec3(0.9, 0.93, 1.0) * smoothstep(0.3, 1.5, od + 0.3);
  }

  // the paperweight (문진): a rosewood bar lying across the top of the sheet, its shadow falls down-right
  vec2 bc = vec2(540.0, 121.0), bh = vec2(392.0, 22.0);
  float dsh = sdBox(s - bc - vec2(9.0, 12.0), bh, 10.0);
  col *= 1.0 - 0.55 * (1.0 - smoothstep(-8.0, 22.0, dsh));
  float db = sdBox(s - bc, bh, 10.0);
  if (db < 1.0) {
    vec2 bq = (s - bc) / bh;
    float grain = fbm(vec2(s.x * 0.012, s.y * 0.35) + vec2(fbm(s * vec2(0.004, 0.05)) * 3.0, 0.0));
    vec3 wood = mix(vec3(0.035, 0.013, 0.007), vec3(0.11, 0.045, 0.02), grain);
    wood = mix(wood, wood * 1.6, smoothstep(0.45, 0.75, fbm(vec2(s.x * 0.03, s.y * 0.6))) * 0.4);
    float bevel = smoothstep(0.55, 1.0, -bq.y) * 0.9 + smoothstep(0.75, 1.0, -bq.x) * 0.3;   // the lit upper edge
    float shade = 1.0 - 0.45 * smoothstep(0.4, 1.0, bq.y);
    wood = wood * shade + vec3(0.12, 0.10, 0.08) * bevel * smoothstep(0.0, 0.5, 1.0 - abs(bq.x));
    wood += vec3(0.05, 0.045, 0.04) * pow(max(1.0 - abs(bq.y + 0.35) * 5.0, 0.0), 2.0);   // a long soft highlight on the polish
    col = mix(col, wood, 1.0 - smoothstep(-1.0, 1.0, db));
  }

  col *= light * lampC;
  vec2 vq = (fc / vec2(1080.0, 1920.0) - 0.5) * vec2(1.0, 0.75) * 2.0;
  col *= 1.0 - 0.3 * clamp(dot(vq, vq) * 0.5, 0.0, 1.0);
  col = pow(max(col, vec3(0.0)), vec3(1.0 / 2.2));
  col += (hash(fc) - 0.5) / 255.0;
  o = vec4(col, 1.0);
}`;

// ---------------------------------------------------------------- story
const fade = track([[0, 0.3], [0.9, 1.0, ease.outCubic], [D, 1.0]]);
const zoom = track([[0, 1.055], [1.0, 1.045], [WRITE_END, 1.0, ease.inOutCubic], [D, 0.982, (p) => p]]);
const warm = track([[0, 0.0], [WRITE_END, 0.15], [D, 0.55]]);
const evap = track([[0, 0.00045], [WRITE_END, 0.0006], [8.6, 0.0026, ease.inCubic], [D, 0.003]]);
const sealOn = (t) => (t < ST.touch + 0.04 ? 0 : 1);

// ---------------------------------------------------------------- the overlay: brush and seal stone
const proj = (x, y, z) => { const k = z / (HC - z); return [x + (x - VP[0]) * k, y + (y - VP[1]) * k, HC / (HC - z)]; };
const shadowOf = (x, y, z) => [x + z * LDIR[0], y + z * LDIR[1]];

function quadPath(c, a, b, wa, wb) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  c.beginPath();
  c.moveTo(a[0] + nx * wa, a[1] + ny * wa); c.lineTo(b[0] + nx * wb, b[1] + ny * wb);
  c.lineTo(b[0] - nx * wb, b[1] - ny * wb); c.lineTo(a[0] - nx * wa, a[1] - ny * wa);
  return [nx, ny];
}
function cylGrad(c, a, n, w, stops) {
  // offset 0 on the side the light comes from (upper left) — the handle runs down the screen, so that is +n
  const g = c.createLinearGradient(a[0] + n[0] * w, a[1] + n[1] * w, a[0] - n[0] * w, a[1] - n[1] * w);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}
// teardrop footprint outline: belly circle radius rb at (x, y), tip of length tl along angle phi
function tearPts(x, y, rb, tl, phi, k = 1) {
  const loc = [], c = Math.cos(phi), s = Math.sin(phi), R = rb * k;
  for (let i = 14; i >= 1; i--) { const u = i / 14; loc.push([u * tl, R * Math.pow(1 - u, 0.85)]); }   // tip → belly, one side
  for (let i = 0; i <= 24; i++) { const a = Math.PI * 0.5 + Math.PI * i / 24; loc.push([Math.cos(a) * R, Math.sin(a) * R]); }   // round the back
  for (let i = 1; i <= 14; i++) { const u = i / 14; loc.push([u * tl, -R * Math.pow(1 - u, 0.85)]); }  // belly → tip, other side
  return loc.map(([a, b]) => [x + a * c - b * s, y + a * s + b * c]);
}
function fillPts(c, pts) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.fill(); }

function drawBrush(c, q) {
  if (q.vis <= 0.002) return;
  const lean = [0.1, 0.17];
  const contact = q.z <= 0.01 && q.p > 0.004;
  const fp = footprint(q.p);
  const zf = contact ? 98 - 46 * Math.min(q.p, 1) : q.z + 98;          // height of the ferrule's lower rim
  const base = contact ? [q.x - Math.cos(q.phi) * fp.rb * 0.25, q.y - Math.sin(q.phi) * fp.rb * 0.25] : [q.x, q.y];
  const ax = (h) => [base[0] + lean[0] * h, base[1] + lean[1] * h, h];
  const P = (h) => { const a = ax(h); return proj(a[0], a[1], a[2]); };
  const S = (h) => { const a = ax(h); return shadowOf(a[0], a[1], a[2]); };
  c.save();
  c.globalAlpha = q.vis;
  // shadows: a crisp one near the paper, a wide soft one for the long handle
  c.fillStyle = 'rgba(20,16,12,1)';
  c.filter = 'blur(16px)'; c.globalAlpha = 0.16 * q.vis;
  quadPath(c, S(zf), S(zf + 1700), 16, 22); c.fill();
  c.filter = 'blur(5px)'; c.globalAlpha = 0.26 * q.vis;
  quadPath(c, S(Math.max(0, zf - 40)), S(zf + 260), 11, 15); c.fill();
  if (contact) { fillPts(c, tearPts(...shadowOf(q.x, q.y, 18), fp.rb * 0.8, fp.tl * 0.8, q.phi)); }
  else { quadPath(c, S(q.z), S(zf), 2, 12); c.fill(); }
  c.filter = 'none'; c.globalAlpha = q.vis;

  // the tuft: soaked with ink, black and glossy
  const fb = P(zf);
  if (contact) {
    const tear = tearPts(q.x, q.y, fp.rb, fp.tl, q.phi, 1.02);
    c.fillStyle = 'rgb(8,7,8)';
    fillPts(c, tear);
    // the neck from the ferrule down into the pressed belly
    const d = [q.x - fb[0], q.y - fb[1]], dl = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / dl, d[0] / dl];
    const wN = 14 * fb[2], wB = Math.max(fp.rb * 0.95, 8);
    c.beginPath();
    c.moveTo(fb[0] + n[0] * wN, fb[1] + n[1] * wN);
    c.quadraticCurveTo(fb[0] + d[0] * 0.55 + n[0] * wB * 1.05, fb[1] + d[1] * 0.55 + n[1] * wB * 1.05, q.x + n[0] * wB, q.y + n[1] * wB);
    c.lineTo(q.x - n[0] * wB, q.y - n[1] * wB);
    c.quadraticCurveTo(fb[0] + d[0] * 0.55 - n[0] * wB * 1.05, fb[1] + d[1] * 0.55 - n[1] * wB * 1.05, fb[0] - n[0] * wN, fb[1] - n[1] * wN);
    c.closePath();
    const g = c.createLinearGradient(fb[0] - n[0] * wB, fb[1] - n[1] * wB, fb[0] + n[0] * wB, fb[1] + n[1] * wB);
    g.addColorStop(0, 'rgb(4,4,5)'); g.addColorStop(0.3, 'rgb(26,25,27)'); g.addColorStop(0.42, 'rgb(58,56,60)'); g.addColorStop(0.55, 'rgb(14,13,15)'); g.addColorStop(1, 'rgb(3,3,4)');
    c.fillStyle = g; c.fill();
    // a few hairs catching the light
    c.strokeStyle = 'rgba(150,150,160,0.14)'; c.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const k = (i - 3) / 3.5;
      c.beginPath(); c.moveTo(fb[0] + n[0] * wN * k * 0.8, fb[1] + n[1] * wN * k * 0.8);
      c.quadraticCurveTo(fb[0] + d[0] * 0.6 + n[0] * wB * k, fb[1] + d[1] * 0.6 + n[1] * wB * k, q.x + n[0] * wB * k * 0.9 + Math.cos(q.phi) * fp.tl * 0.3, q.y + n[1] * wB * k * 0.9 + Math.sin(q.phi) * fp.tl * 0.3);
      c.stroke();
    }
  } else {
    // hanging in the air: a full, pointed cone
    const tip = P(q.z), mid = P(q.z + 40);
    const d = [tip[0] - fb[0], tip[1] - fb[1]], dl = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / dl, d[0] / dl];
    const wN = 14 * fb[2], wB = 17 * mid[2];
    c.beginPath();
    c.moveTo(fb[0] + n[0] * wN, fb[1] + n[1] * wN);
    c.bezierCurveTo(fb[0] + d[0] * 0.35 + n[0] * wB, fb[1] + d[1] * 0.35 + n[1] * wB, tip[0] - d[0] * 0.25 + n[0] * wB * 0.5, tip[1] - d[1] * 0.25 + n[1] * wB * 0.5, tip[0], tip[1]);
    c.bezierCurveTo(tip[0] - d[0] * 0.25 - n[0] * wB * 0.5, tip[1] - d[1] * 0.25 - n[1] * wB * 0.5, fb[0] + d[0] * 0.35 - n[0] * wB, fb[1] + d[1] * 0.35 - n[1] * wB, fb[0] - n[0] * wN, fb[1] - n[1] * wN);
    c.closePath();
    const g = c.createLinearGradient(fb[0] - n[0] * wB, fb[1] - n[1] * wB, fb[0] + n[0] * wB, fb[1] + n[1] * wB);
    g.addColorStop(0, 'rgb(4,4,5)'); g.addColorStop(0.32, 'rgb(30,29,31)'); g.addColorStop(0.44, 'rgb(66,64,68)'); g.addColorStop(0.58, 'rgb(14,13,15)'); g.addColorStop(1, 'rgb(3,3,4)');
    c.fillStyle = g; c.fill();
  }

  // ferrule (dark horn) and the bamboo handle, in perspective toward the camera
  const f0 = P(zf), f1 = P(zf + 34), h1 = P(zf + 1700);
  let n = quadPath(c, f0, f1, 14.5 * f0[2], 15 * f1[2]);
  c.fillStyle = cylGrad(c, f0, n, 15 * f0[2], [[0, '#0d0806'], [0.3, '#3a2417'], [0.42, '#8a6a52'], [0.55, '#2a1810'], [1, '#090504']]);
  c.fill();
  n = quadPath(c, f1, h1, 13.5 * f1[2], 13.5 * h1[2]);
  c.fillStyle = cylGrad(c, f1, n, 13.5 * f1[2], [[0, '#3b2a14'], [0.18, '#9c7a45'], [0.34, '#d9bd84'], [0.42, '#efdcae'], [0.56, '#b8945a'], [0.85, '#6d5029'], [1, '#2e200d']]);
  c.fill();
  // bamboo nodes
  for (const hn of [zf + 330, zf + 820]) {
    const a = P(hn - 6), b = P(hn + 6);
    n = quadPath(c, a, b, 14 * a[2], 14 * b[2]);
    c.fillStyle = cylGrad(c, a, n, 14 * a[2], [[0, '#2a1c0a'], [0.35, '#8a6a36'], [0.45, '#c9a96c'], [0.6, '#7a5a2c'], [1, '#22170a']]);
    c.fill();
  }
  c.restore();
}

function drawSealStone(c, t) {
  if (t < ST.down - 0.3 || t > ST.gone) return;
  // height of the stone's face above the paper: comes down from the lower left, presses, lifts away
  let z;
  if (t < ST.touch) z = 420 * Math.pow(1 - smooth((t - (ST.down - 0.3)) / (ST.touch - ST.down + 0.3)), 1.6);
  else if (t < ST.up) z = 0;
  else z = 460 * Math.pow(smooth((t - ST.up) / (ST.gone - ST.up)), 1.4);
  const slide = t < ST.touch ? 1 - smooth((t - (ST.down - 0.3)) / (ST.touch - ST.down + 0.3)) : smooth((t - ST.up) / (ST.gone - ST.up));
  const cx = SEAL.x - 120 * slide, cy = SEAL.y + 220 * slide;
  const vis = 1 - smooth((t - ST.gone + 0.2) / 0.2);
  const half = SEAL.s * 0.5 + 6, H = 150;           // stone face (a little larger than the carving) and height
  const rot = SEAL.rot;
  const corner = (sx, sy, h) => {
    const x = cx + (sx * Math.cos(rot) + sy * Math.sin(rot)) * half, y = cy + (-sx * Math.sin(rot) + sy * Math.cos(rot)) * half;
    return proj(x, y, z + h);
  };
  const shd = (sx, sy, h) => {
    const x = cx + (sx * Math.cos(rot) + sy * Math.sin(rot)) * half, y = cy + (-sx * Math.sin(rot) + sy * Math.cos(rot)) * half;
    return shadowOf(x, y, z + h);
  };
  c.save();
  c.globalAlpha = vis;
  // shadow: the whole block, softer as it rises
  c.filter = `blur(${(4 + z * 0.04).toFixed(1)}px)`;
  c.fillStyle = `rgba(25,18,12,${(0.42 - Math.min(0.25, z / 1600)).toFixed(3)})`;
  c.beginPath();
  const sp = [shd(-1, -1, 0), shd(1, -1, 0), shd(1, 1, 0), shd(1, 1, H), shd(-1, 1, H), shd(-1, -1, H)];
  c.moveTo(sp[0][0], sp[0][1]); for (const q of sp.slice(1)) c.lineTo(q[0], q[1]); c.fill();
  c.filter = 'none';
  // the near side face (seen because the camera looks at the desk from the writer's side) and the top
  const b0 = corner(-1, 1, 0), b1 = corner(1, 1, 0), t0 = corner(-1, 1, H), t1 = corner(1, 1, H);
  const g = c.createLinearGradient(b0[0], b0[1], t0[0], t0[1]);
  g.addColorStop(0, '#5d5a45'); g.addColorStop(1, '#8a8566');
  c.fillStyle = g;
  c.beginPath(); c.moveTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.lineTo(t1[0], t1[1]); c.lineTo(t0[0], t0[1]); c.fill();
  const r0 = corner(1, -1, 0), r1 = corner(1, -1, H);
  c.fillStyle = '#4c4a39';
  c.beginPath(); c.moveTo(b1[0], b1[1]); c.lineTo(r0[0], r0[1]); c.lineTo(r1[0], r1[1]); c.lineTo(t1[0], t1[1]); c.fill();
  const tp = [corner(-1, -1, H), corner(1, -1, H), corner(1, 1, H), corner(-1, 1, H)];
  const g2 = c.createLinearGradient(tp[0][0], tp[0][1], tp[2][0], tp[2][1]);
  g2.addColorStop(0, '#c9c2a0'); g2.addColorStop(0.5, '#a9a283'); g2.addColorStop(1, '#8a8468');
  c.fillStyle = g2;
  c.beginPath(); c.moveTo(tp[0][0], tp[0][1]); for (const q of tp.slice(1)) c.lineTo(q[0], q[1]); c.fill();
  // veins in the soapstone
  c.strokeStyle = 'rgba(90,80,50,0.35)'; c.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const a = tp[0], b = tp[2], k = 0.25 + i * 0.22;
    c.beginPath(); c.moveTo(lerp(tp[0][0], tp[3][0], k), lerp(tp[0][1], tp[3][1], k));
    c.quadraticCurveTo(lerp(a[0], b[0], 0.5) + 10 * i, lerp(a[1], b[1], 0.5) - 8, lerp(tp[1][0], tp[2][0], k * 0.8 + 0.1), lerp(tp[1][1], tp[2][1], k * 0.8 + 0.1));
    c.stroke();
  }
  c.restore();
}

// ---------------------------------------------------------------- the seal's carving (음각: the letters are cut away)
function sealCanvas() {
  const S = 256, cv = document.createElement('canvas');
  cv.width = S; cv.height = S;
  const c = cv.getContext('2d');
  c.fillStyle = '#000'; c.fillRect(0, 0, S, S);
  c.fillStyle = '#fff'; c.fillRect(6, 6, S - 12, S - 12);
  c.fillStyle = '#000';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = '800 112px "Pretendard Variable", Pretendard, sans-serif';
  // two syllables stacked, stretched to fill the square like a carved seal
  for (const [ch, y] of [['솔', 70], ['뫼', 186]]) {
    c.save(); c.translate(S / 2, y); c.scale(1.62, 0.98); c.fillText(ch, 0, 4); c.restore();
  }
  // chips where the stone broke while cutting
  const r = (() => { let a = 77; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
  for (let i = 0; i < 26; i++) {
    const edge = r() < 0.5, x = edge ? (r() < 0.5 ? 6 + r() * 5 : S - 6 - r() * 5) : 10 + r() * (S - 20), y = edge ? 10 + r() * (S - 20) : (r() < 0.5 ? 6 + r() * 5 : S - 6 - r() * 5);
    c.beginPath(); c.arc(x, y, 1.5 + r() * 3.5, 0, Math.PI * 2); c.fill();
  }
  return cv;
}

// ---------------------------------------------------------------- demo
defineDemo({
  id: '42-calligraphy',
  title: '붓으로 쓴 한 글자',
  tech: '붓 물리 모델 · 먹 머금음·필압·비백 + 화선지 번짐',
  duration: D,
  background: '#0b0b0d',
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2', z: 0 });
    const over = canvas({ type: '2d', z: 2 }).ctx;
    this.over = over;
    const f32 = gl.getExtension('EXT_color_buffer_float');
    const lin32 = gl.getExtension('OES_texture_float_linear');
    if (!f32) throw new Error('EXT_color_buffer_float unsupported');
    const SFMT = lin32 ? gl.RGBA32F : gl.RGBA16F;

    // --- tiny GL kit
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n'));
      return s;
    };
    const program = (vsrc, fsrc, attribs) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vsrc)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fsrc));
      attribs.forEach((n, i) => gl.bindAttribLocation(p, i, n));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const texture = (w, h, fmt, filter = gl.LINEAR) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texStorage2D(gl.TEXTURE_2D, 1, fmt, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const target = (w, h, fmt, filter = gl.LINEAR) => {
      const tex = texture(w, h, fmt, filter), fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('incomplete framebuffer');
      return { tex, fb, w, h, fmt };
    };
    const fsVAO = gl.createVertexArray();
    gl.bindVertexArray(fsVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const pass = (P, dst, tex = {}, set = () => {}) => {
      gl.useProgram(P.p);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null);
      gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H);
      let unit = 0;
      for (const [name, t] of Object.entries(tex)) {
        gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t.tex || t);
        if (P.u[name]) gl.uniform1i(P.u[name], unit);
        unit++;
      }
      set(P.u);
      gl.bindVertexArray(fsVAO);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const blit = (src, dst) => {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, src.fb); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dst.fb);
      gl.blitFramebuffer(0, 0, src.w, src.h, 0, 0, dst.w, dst.h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    };
    const P = {
      paper: program(VERT, PAPER, ['p']), desk: program(VERT, DESK, ['p']), cond: program(VERT, COND, ['p']),
      cap: program(CAP_VS, CAP_FS, ['aAB', 'aP', 'aS']), sim: program(VERT, SIM, ['p']), clear: program(VERT, CLEAR, ['p']),
      display: program(VERT, DISPLAY, ['p']),
    };
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);

    // --- bake the hanji, the desk and the capillary conductances
    const paperT = target(W, H, gl.RGBA8);
    const deskT = target(W, H, gl.RGBA8);
    const condT = target(NX, NY, gl.RGBA16F, gl.NEAREST);
    pass(P.paper, paperT);
    pass(P.desk, deskT, {}, (u) => gl.uniform4f(u.sheet, ...SHEET));
    pass(P.cond, condT, {}, (u) => gl.uniform2f(u.origin, RX, GY0));

    // --- seal carving
    const sealTex = texture(256, 256, gl.R8);
    {
      const cv = sealCanvas(), px = cv.getContext('2d').getImageData(0, 0, 256, 256).data;
      const r8 = new Uint8Array(256 * 256);
      for (let i = 0; i < 256 * 256; i++) r8[i] = px[i * 4];   // row 0 = top of the seal = stage-up
      gl.bindTexture(gl.TEXTURE_2D, sealTex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 256, 256, gl.RED, gl.UNSIGNED_BYTE, r8);
    }

    // --- bristle capsules (all strokes, sorted by time)
    const caps = buildCapsules();
    const capBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, capBuf);
    gl.bufferData(gl.ARRAY_BUFFER, caps.data, gl.STATIC_DRAW);
    const capVAO = gl.createVertexArray();
    gl.bindVertexArray(capVAO);
    for (let i = 0; i < 3; i++) { gl.enableVertexAttribArray(i); gl.vertexAttribDivisor(i, 1); }
    const bindCaps = (first) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, capBuf);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 36, first * 36);
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 36, first * 36 + 16);
      gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 36, first * 36 + 32);
    };
    gl.bindVertexArray(null);
    const lowerBound = (x) => { let lo = 0, hi = caps.times.length; while (lo < hi) { const m = (lo + hi) >> 1; if (caps.times[m] < x - 1e-9) lo = m + 1; else hi = m; } return lo; };
    const capRange = (ta, tb) => {
      const k0 = lowerBound(ta), k1 = lowerBound(tb);
      const c0 = k0 < caps.times.length ? caps.firsts[k0] : caps.count, c1 = k1 < caps.times.length ? caps.firsts[k1] : caps.count;
      return [c0, c1];
    };

    // --- ink state: the mark (stage res) and the bleed (ping-pong), and the per-sub-step source
    const mark = target(RW, RH, gl.R16F);
    let cur = target(NX, NY, SFMT), nxt = target(NX, NY, SFMT);
    const src = target(NX, NY, gl.RGBA16F, gl.NEAREST);
    const zero = (T) => { gl.bindFramebuffer(gl.FRAMEBUFFER, T.fb); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); };
    let srcDirty = true;

    const drawCaps = (c0, c1) => {
      gl.useProgram(P.cap.p);
      gl.uniform4f(P.cap.u.region, RX, RY, RW, RH);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, paperT.tex); gl.uniform1i(P.cap.u.Pp, 0);
      gl.bindVertexArray(capVAO);
      bindCaps(c0);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, src.fb); gl.viewport(0, 0, NX, NY);
      gl.uniform1i(P.cap.u.mode, 1);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, c1 - c0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, mark.fb); gl.viewport(0, 0, RW, RH);
      gl.uniform1i(P.cap.u.mode, 0);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, c1 - c0);
      gl.disable(gl.BLEND);
      gl.bindVertexArray(null);
    };
    const px = new Float32Array(4);
    this.R = replay({
      dt: 1 / FPS,
      every: 30,
      init: () => { zero(mark); zero(cur); zero(src); srcDirty = false; },
      step: (n) => {
        for (let k = 0; k < SUB; k++) {
          const ta = (n * SUB + k) / (FPS * SUB), tb = ta + 1 / (FPS * SUB);
          const [c0, c1] = capRange(ta, tb);
          if (srcDirty) { zero(src); srcDirty = false; }
          if (c1 > c0) { drawCaps(c0, c1); srcDirty = true; }
          pass(P.sim, nxt, { S: cur, Src: src, K: condT }, (u) => {
            gl.uniform1f(u.Dk, 0.13); gl.uniform1f(u.M0, 0.12); gl.uniform1f(u.filt, 0.45);
            gl.uniform1f(u.rho, 0.02); gl.uniform1f(u.evap, evap(ta));
          });
          [cur, nxt] = [nxt, cur];
        }
        if (HEADLESS) { gl.bindFramebuffer(gl.FRAMEBUFFER, cur.fb); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, px); }
      },
      save: () => {
        const c = { m: target(RW, RH, gl.R16F), s: target(NX, NY, SFMT) };
        blit(mark, c.m); blit(cur, c.s);
        return c;
      },
      load: (c) => { blit(c.m, mark); blit(c.s, cur); zero(src); srcDirty = false; },
    });

    this.render = (t) => {
      pass(P.display, null, { Pp: paperT, Dk: deskT, Mk: mark, Sm: cur, Sl: sealTex }, (u) => {
        gl.uniform2f(u.zc, 540, 1020); gl.uniform2f(u.simPx, NX, NY);
        gl.uniform4f(u.region, RX, GY0, RW, RH);
        gl.uniform4f(u.sealR, SEAL.x, SEAL.y, SEAL.s, SEAL.rot);
        gl.uniform1f(u.zoom, zoom(t)); gl.uniform1f(u.fade, fade(t));
        gl.uniform1f(u.sealOn, sealOn(t)); gl.uniform1f(u.warm, warm(t));
      });
    };
  },
  async frame(t) {
    await this.R.seek(t);
    this.render(t);
    const c = this.over, z = zoom(t);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, 1080, 1920);
    // the same camera as the GL picture (zoom about stage (540, 900))
    c.setTransform(z, 0, 0, z, 540 * (1 - z), 900 * (1 - z));
    c.globalAlpha = 1;
    drawSealStone(c, t);
    drawBrush(c, brushPose(t));
  },
});
