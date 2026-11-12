/*
 * 143 · 기다림 — slit-scan typography: every pixel reads the word's own animation at its own moment.
 *
 * The word's animation (letters floating and rocking, an orange light orbiting with a trail, a glint sweeping) is
 * one loop of P seconds. setup renders N frames of the letters into an (x, y, t) volume — a three.js Data3DTexture
 * with one byte per voxel, the letters' signed distance. The light and the glint are closed-form functions of
 * (x, y, t), so the shader evaluates them at τ instead of storing them. The frame is one full-screen
 * ShaderMaterial that samples the volume at (x, y, τ) with
 *     τ(x, y, t) = t_src(t) − [k_lin(t)·d_lin + k_rad(t)·d_rad + k_ang(t)·d_ang]
 * d_lin = rows (y), d_rad = distance from the centre, d_ang = angle in turns. With all k = 0 every pixel shows the
 * same moment (the plain animated word); as the k grow, each slit shows a different moment and the letters smear
 * into bands, rings and finally a vortex. Linear filtering on the time axis blends neighbouring slices (no steps);
 * the time axis wraps (RepeatWrapping) because the source is a seamless loop, so any τ is valid.
 *
 *   0–2    the dusk poster, the word floats in, a glint passes, the orange light circles the word
 *   2–6    the slit-scan grows: rows → rings → vortex (climax 5.1–6.0)
 *   6–7.4  the time displacement collapses; the word re-forms crisply with a soft glow
 *   7.4–10 afterglow: the subtitle, stars come out
 */
import * as THREE from 'three';
import { defineDemo, rand, ease, clamp, lerp, track, ramp } from '../_lib/stage.js';
import { fontReady, signedDistance } from '../_lib/type.js';

const W = 1080, H = 1920, D = 10, TAU = Math.PI * 2, DEG = Math.PI / 180;
const WORD = '기다림';
const SUB = '조금 늦게 와도 괜찮아';
const HEAD_L = '해 질 녘, 정류장에서', HEAD_R = '18:40';
const F_WORD = '"Black Han Sans"', F_UI = '"Pretendard Variable"';

// ---------------------------------------------------------------- the source loop and its volume
const P = 4.8;                      // loop period of the word's own animation (seconds of source time)
const N = 96;                       // slices baked over one period (50 ms apart)
const VS = 0.5;                     // volume resolution: voxels per stage pixel
const VX0 = 0, VY0 = 548, VWS = 1080, VHS = 544;   // the stage rectangle the volume covers
const VW = VWS * VS, VH = VHS * VS; // 540 × 272 voxels
const ENC = 8;                      // SDF byte steps per voxel → ±16 voxels = ±32 stage px
const CX = 540, CY = 820;           // word centre = centre of the radial and angular slits
const WORD_W = 820;                 // ink width of the word (px)
const RX = 470, RY = 135, TILT = -5 * DEG, A0 = -0.6;   // the orange light's orbit
const SLIT_L = 240;                 // px of slit distance per unit of d (rows and rings)

/** letter i at source time u: a slow float on a small ellipse, a rock, a breath (all periodic in P) */
function letterPose(i, u) {
  const a = TAU * (u / P - 0.12 * i);
  return { dx: 28 * Math.cos(a + 0.3), dy: -58 * Math.sin(a), rot: 9 * DEG * Math.sin(a + 0.9), s: 1 + 0.05 * Math.sin(2 * a + 0.5) };
}
// ---------------------------------------------------------------- story
const T_SRC0 = 0.55;                // source time at t = 0
const KL = track([[2.0, 0], [3.25, 3.4], [4.35, 0]]);                         // rows
const KR = track([[3.0, 0], [4.2, 4.6], [5.1, 2.2], [6.05, 2.2], [7.35, 0]]);  // rings
const KA = track([[4.0, 0], [5.1, 2 * P], [6.05, 2 * P], [7.35, 0]]);          // angle: two whole loops per turn at the climax
const GLOW = track([[7.15, 0], [7.42, 1, ease.outCubic], [8.4, 0, ease.inOutCubic]]);
const T_SUB = 7.75;

// ---------------------------------------------------------------- palette (sRGB)
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const v3 = (h) => `vec3(${hex(h).map((x) => x.toFixed(4)).join(', ')})`;
const PAL = {
  sky0: '#1b1440', sky1: '#33235e', sky2: '#6a3a78', sky3: '#c0668a', sky4: '#f4ae8c',
  creamT: '#f9e5c9', creamB: '#f3d0b0', rose: '#f09a86', sheen: '#fffbf3',
  shadow: '#170e2e', accent: '#ff7a2e', hot: '#ffd8a8', ink: '#2a1a48',
};

// =================================================================== shader
const VERT = /* glsl */`
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FRAG = /* glsl */`
precision highp float;
precision highp sampler3D;
uniform sampler3D uVol;            // the letters' signed distance, one byte per voxel (127.5 = edge)
uniform sampler2D uLand;           // hills, ground, the stop sign, the moon (straight alpha)
uniform sampler2D uType;           // R header · G subtitle · B stars (coverage)
uniform float uTime, uSrc, uKl, uKr, uKa, uSeam, uSlit, uZoom, uGlow, uHead, uNight, uFrame, uExpo, uDotIn;

#define PI 3.14159265
#define TAU 6.28318531
const vec2 C = vec2(${CX}.0, ${CY}.0);
const vec4 VR = vec4(${VX0}.0, ${VY0}.0, ${VWS}.0, ${VHS}.0);
const float P = ${P.toFixed(3)}, N = ${N}.0, SL = ${SLIT_L}.0;
const float DEC = ${(1 / (ENC * VS)).toFixed(6)};   // byte step → stage px
const float BETA = 0.42;            // half-width (rad) of the cross-fade wedge at the angle's branch cut
const vec2 SW_N = vec2(0.8829, -0.4695);   // glint band normal (the band leans 62° from horizontal)
const float RX = ${RX}.0, RY = ${RY}.0, TILT = ${TILT.toFixed(5)}, A0 = ${A0.toFixed(4)};

struct S { float w; float d; float fr; float tl; float tf; float sw; float tint; };

float sq(float x) { return x * x; }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }

// the volume (and its closed-form channels) at stage point p and source time tau
S at(vec2 p, float tau) {
  S s;
  vec2 q = (p - VR.xy) / VR.zw;
  if (q.x <= 0.0 || q.y <= 0.0 || q.x >= 1.0 || q.y >= 1.0) s.w = 32.0;
  else {
    // r: slice k sits at (k + 0.5) / N; RepeatWrapping blends the last slice into the first
    s.w = (127.5 - 255.0 * textureLod(uVol, vec3(q, tau / P + 0.5 / N), 0.0).r) * DEC;
  }
  float ph = tau / P;
  // closed-form channels of the same loop, evaluated at tau (exact, no slices needed)
  // the orange light: an ellipse around the word, one turn per loop, nearer = bigger, in front on the lower half
  float a = TAU * ph + A0;
  vec2 e = vec2(RX * cos(a), RY * sin(a));
  vec2 o = C + vec2(e.x * cos(TILT) - e.y * sin(TILT), e.x * sin(TILT) + e.y * cos(TILT));
  s.d = length(p - o) - (12.0 + 6.0 * (0.5 + 0.5 * sin(a)));
  s.fr = smoothstep(-0.22, 0.22, sin(a));
  // its trail: a thin arc behind it on the orbit, fading with the time since the light passed that point
  vec2 rp = p - C;
  vec2 u = vec2(rp.x * cos(TILT) + rp.y * sin(TILT), -rp.x * sin(TILT) + rp.y * cos(TILT)) / vec2(RX, RY);
  float lu = max(length(u), 1e-4);
  float de = (lu - 1.0) / length(u / (vec2(RX, RY) * lu));      // ≈ distance to the ellipse (px)
  float b = atan(u.y, u.x);
  float age = mod(a - b, TAU);                                   // radians of orbit since the light was here
  s.tl = exp(-age / 0.7) * exp(-sq(de / (1.6 + 7.0 * exp(-age / 0.35))));
  s.tf = smoothstep(-0.22, 0.22, sin(b));
  // the glint: a soft band crossing the word twice per loop
  float c = mix(-1500.0, 1500.0, fract(2.0 * ph + 0.6875));
  float x = dot(p - C, SW_N) - c;
  s.sw = exp(-sq(x / 72.0)) + 0.35 * exp(-sq(x / 200.0));
  return s;
}
S mixS(S a, S b, float k) {
  S s;
  s.w = mix(a.w, b.w, k); s.d = mix(a.d, b.d, k); s.fr = mix(a.fr, b.fr, k); s.tl = mix(a.tl, b.tl, k); s.tf = mix(a.tf, b.tf, k);
  s.sw = mix(a.sw, b.sw, k); s.tint = mix(a.tint, b.tint, k);
  return s;
}
// the slit-scan: one moment per pixel
S slit(vec2 p) {
  vec2 r = p - C;
  float dl = r.y / SL, dr = length(r) / SL;
  float th = atan(-r.x, -r.y);       // 0 straight up, ±PI straight down (the branch cut points down)
  float disp = uKl * dl + uKr * dr + uKa * th / TAU;
  S s = at(p, uSrc - disp);
  s.tint = 0.5 - 0.5 * cos(TAU * disp / P);
  // across the cut d_ang jumps by one turn; unless k_ang is a whole number of loops that is a jump in time.
  // Near the cut, blend with the branch continued from the other side: both meet at 50/50 on the cut.
  float wedge = 0.5 * smoothstep(PI - BETA, PI, abs(th)) * uSeam;
  if (wedge > 0.0) {
    float disp2 = disp - uKa * sign(th);
    S s2 = at(p, uSrc - disp2);
    s2.tint = 0.5 - 0.5 * cos(TAU * disp2 / P);
    s = mixS(s, s2, wedge);
  }
  return s;
}
float cover(float d) { return clamp(0.5 - d / max(fwidth(d), 1e-3), 0.0, 1.0); }

vec3 sky(float y) {
  vec3 c = mix(${v3(PAL.sky0)}, ${v3(PAL.sky1)}, smoothstep(0.0, 420.0, y));
  c = mix(c, ${v3(PAL.sky2)}, smoothstep(420.0, 860.0, y));
  c = mix(c, ${v3(PAL.sky3)}, smoothstep(860.0, 1150.0, y));
  c = mix(c, ${v3(PAL.sky4)}, smoothstep(1150.0, 1360.0, y));
  // nightfall in the afterglow: deeper and bluer, the warm band sinks
  vec3 n = c * vec3(0.72, 0.7, 0.88);
  return mix(c, n, uNight * (0.35 + 0.4 * smoothstep(1360.0, 300.0, y)));
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, ${H}.0 - gl_FragCoord.y);
  vec3 col = sky(p.y);
  // horizon glow
  col += vec3(1.0, 0.7, 0.52) * 0.22 * exp(-sq((p.x - 540.0) / 760.0) - sq((p.y - 1372.0) / 230.0)) * (1.0 - 0.5 * uNight);

  // ---- where the word is sampled: entrance rise (staggered left → right) and the re-form pulse
  float e = clamp((uTime - 0.12 - 0.5 * (p.x - 110.0) / 860.0) / 0.85, 0.0, 1.0);
  e = 1.0 - (1.0 - e) * (1.0 - e) * (1.0 - e);
  vec2 pw = C + (p - C) / uZoom - vec2(0.0, 120.0 * (1.0 - e));
  S s = slit(pw);
  S sh = slit(pw - vec2(12.0, 20.0));
  float enter = smoothstep(0.0, 0.55, e);

  // ---- sky light: the glint grazes the haze around the word; stars
  vec4 tb = texture(uType, p / vec2(${W}.0, ${H}.0));
  col += vec3(1.0, 0.8, 0.64) * s.sw * (0.06 + 0.11 * uSlit) * exp(-sq(length(p - C) / 700.0)) * enter;
  col += vec3(1.0, 0.95, 0.88) * tb.b * (0.3 + 0.7 * uNight);

  // ---- hills, ground, stop sign, moon
  vec4 land = texture(uLand, p / vec2(${W}.0, ${H}.0));
  col = mix(col, land.rgb, land.a);

  // ---- the word's shadow on the sky (soft: the SDF gives a penumbra for free)
  float aS = (1.0 - smoothstep(-6.0, 26.0, sh.w)) * 0.34 * enter;
  col = mix(col, ${v3(PAL.shadow)}, aS);

  // ---- the orange light behind the letters
  float aW = cover(s.w) * enter;
  float aD = cover(s.d) * uDotIn;
  float gD = (0.26 * exp(-max(s.d, 0.0) / 9.0) + 0.12 * exp(-max(s.d, 0.0) / 34.0)) * uDotIn * (1.0 - aD);
  vec3 dotC = mix(${v3(PAL.accent)}, ${v3(PAL.hot)}, 0.75 * smoothstep(-4.0, -9.0, s.d));
  float back = 1.0 - s.fr, tl = min(s.tl, 1.0) * 0.8 * uDotIn;
  col = mix(col, ${v3(PAL.accent)}, tl * (1.0 - s.tf));
  col += ${v3(PAL.accent)} * gD * back;
  col = mix(col, dotC, aD * back);

  // ---- the letters: cream, warmer at the foot; slits far from now take a rose tint; the glint
  vec3 ink = mix(${v3(PAL.creamT)}, ${v3(PAL.creamB)}, smoothstep(640.0, 1000.0, p.y));
  ink = mix(ink, ${v3(PAL.rose)}, s.tint * 0.62 * uSlit);
  ink = mix(ink * 0.96, ${v3(PAL.sheen)}, min(s.sw, 1.0) * 0.9) + vec3(0.12, 0.07, 0.0) * s.sw;   // the glint, slightly over
  ink += vec3(0.06, 0.035, 0.0) * uGlow;
  // re-form pulse: a warm halo straight from the distance field
  col += vec3(1.0, 0.82, 0.62) * 0.32 * uGlow * exp(-max(s.w, 0.0) / 16.0) * (1.0 - aW);
  col = mix(col, ink, aW);

  // ---- the orange light in front
  col = mix(col, ${v3(PAL.accent)}, tl * s.tf);
  col += ${v3(PAL.accent)} * gD * s.fr;
  col = mix(col, dotC, aD * s.fr);

  // ---- type: header (fades in), subtitle (rises letter by letter, left to right)
  col = mix(col, ${v3(PAL.creamT)}, tb.r * uHead * 0.88);
  float ks = clamp((uTime - ${T_SUB.toFixed(2)} - 0.6 * (p.x - 280.0) / 520.0) / 0.6, 0.0, 1.0);
  ks = 1.0 - (1.0 - ks) * (1.0 - ks) * (1.0 - ks);
  float sub = texture(uType, (p + vec2(0.0, 30.0 * (1.0 - ks))) / vec2(${W}.0, ${H}.0)).g * ks;
  col = mix(col, ${v3(PAL.ink)}, sub * 0.92);

  // ---- grade: exposure, violet lift in the shadows, warm roll-off, vignette; film grain
  col *= uExpo;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col += vec3(0.03, 0.0, 0.05) * (1.0 - smoothstep(0.0, 0.45, l));
  col = col / (1.0 + 0.12 * max(col - 0.85, 0.0));
  vec2 vq = (p - vec2(540.0, 880.0)) / vec2(${W}.0, ${H}.0);
  col *= 1.0 - 0.34 * smoothstep(0.28, 0.78, length(vq * vec2(1.25, 1.0)));
  vec2 o = vec2(17.31, 41.97) * uFrame;
  float g = (hash12(p + o) - 0.5) * 0.8 + (hash12(floor(p * 0.5) + o * 1.7) - 0.5) * 0.6;
  col += g * 0.045 * (0.45 + 0.55 * (1.0 - abs(2.0 * l - 1.0)));
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

// =================================================================== setup helpers
function mkCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d', { willReadFrequently: true })];
}

/** lay the word out: per-letter ink box → centres so that the ink is WORD_W wide and centred on (CX, CY) */
function layoutWord(g) {
  g.font = `400 300px ${F_WORD}`;
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const m = Array.from(WORD).map((ch) => ({ ch, m: g.measureText(ch) }));
  const GAP = 0.07;   // × font size between inks
  const ink = m.reduce((s, x) => s + x.m.actualBoundingBoxLeft + x.m.actualBoundingBoxRight, 0) + 2 * GAP * 300;
  const size = 300 * WORD_W / ink;
  g.font = `400 ${size}px ${F_WORD}`;
  const L = Array.from(WORD).map((ch) => {
    const q = g.measureText(ch);
    const l = q.actualBoundingBoxLeft, r = q.actualBoundingBoxRight, a = q.actualBoundingBoxAscent, d = q.actualBoundingBoxDescent;
    return { ch, w: l + r, ox: (l - r) / 2, oy: (a - d) / 2, h: a + d };
  });
  let x = CX - WORD_W / 2;
  for (const it of L) { it.cx = x + it.w / 2; x += it.w + GAP * size; }
  return { size, L };
}

/** the (x, y, t) volume: N slices of the loop, one byte per voxel = the letters' signed distance */
function bakeVolume(size, L) {
  // each letter is set once, upright, into its own bitmap; every slice draws those bitmaps with a sub-pixel
  // transform (fillText under a transform snaps glyphs to whole pixels, which shows up as steps in time)
  const M = 24;
  const bmp = L.map((it) => {
    const w = Math.ceil(it.w + 2 * M), h = Math.ceil(it.h + 2 * M);
    const [c, bg] = mkCanvas(w, h);
    bg.fillStyle = '#fff';
    bg.font = `400 ${size}px ${F_WORD}`;
    bg.textAlign = 'center'; bg.textBaseline = 'alphabetic';
    bg.fillText(it.ch, w / 2 + it.ox, h / 2 + it.oy);
    return c;
  });
  const [, g] = mkCanvas(VW, VH);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  const vol = new Uint8Array(VW * VH * N);
  const cov = new Float32Array(VW * VH);
  for (let k = 0; k < N; k++) {
    const u = k * P / N;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, VW, VH);
    for (let i = 0; i < L.length; i++) {
      const it = L[i], q = letterPose(i, u), b = bmp[i];
      g.setTransform(VS, 0, 0, VS, -VX0 * VS, -VY0 * VS);   // stage px → voxels
      g.translate(it.cx + q.dx, CY + q.dy);
      g.rotate(q.rot);
      g.scale(q.s, q.s);
      g.drawImage(b, -b.width / 2, -b.height / 2);
    }
    const px = g.getImageData(0, 0, VW, VH).data;
    for (let j = 0; j < cov.length; j++) cov[j] = px[j * 4 + 3] / 255;
    const sd = signedDistance(cov, VW, VH);                   // voxels, + outside
    const base = k * VW * VH;
    for (let y = 0; y < VH; y++) for (let x = 0; x < VW; x++) {
      const j = y * VW + x;
      // clamp-to-edge must read "empty": the border voxels are forced to the far value
      const b = x === 0 || y === 0 || x === VW - 1 || y === VH - 1 ? 0 : Math.round(127.5 - sd[j] * ENC);
      vol[base + j] = b < 0 ? 0 : b > 255 ? 255 : b;
    }
  }
  const tex = new THREE.Data3DTexture(vol, VW, VH, N);
  tex.format = THREE.RedFormat; tex.type = THREE.UnsignedByteType;
  tex.minFilter = tex.magFilter = THREE.LinearFilter;            // trilinear: x, y AND time
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.wrapR = THREE.RepeatWrapping;                              // the time axis is a loop
  tex.generateMipmaps = false; tex.unpackAlignment = 1; tex.needsUpdate = true;
  return tex;
}

/** hills, ground, the stop sign and a crescent moon — flat, rounded, baked once */
function bakeLand() {
  const [c, g] = mkCanvas(W, H);
  const R = rand(1430);
  const ridge = (y0, amp, seeds, fill) => {
    g.fillStyle = fill;
    g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) {
      let y = y0;
      for (const [f, a, ph] of seeds) y -= a * amp * (0.5 + 0.5 * Math.sin(x * f + ph));
      g.lineTo(x, y);
    }
    g.lineTo(W, H); g.fill();
  };
  // far ridge (rosy, hazy) and near ridge (plum)
  ridge(1352, 1, [[0.0042, 26, 0.4], [0.011, 9, 2.1], [0.023, 4, 0.7]], '#b46482');
  // far town: small rounded blocks on the far ridge with a few cream windows
  g.fillStyle = '#9a5378';
  let bx = 120;
  while (bx < 980) {
    const w = 18 + R() * 30, h = 14 + R() * 34;
    if (R() < 0.75 && Math.abs(bx - 540) > 70) { g.beginPath(); g.roundRect(bx, 1346 - h, w, h + 20, 3); g.fill(); }
    bx += w + 4 + R() * 26;
  }
  ridge(1378, 1, [[0.0031, 22, 2.6], [0.0087, 10, 0.3], [0.019, 3, 1.4]], '#5a3768');
  g.fillStyle = 'rgba(255,236,206,0.55)';
  for (let i = 0; i < 26; i++) {
    const x = 140 + R() * 800, y = 1318 + R() * 22;
    if (Math.abs(x - 540) < 80) continue;
    g.fillRect(Math.round(x), Math.round(y), 2, 2);
  }
  // ground: deep violet, a warm sheen at the horizon, the kerb line in front
  let gr = g.createLinearGradient(0, 1380, 0, H);
  gr.addColorStop(0, '#3b2856'); gr.addColorStop(0.35, '#251a3e'); gr.addColorStop(1, '#130d24');
  g.fillStyle = gr; g.fillRect(0, 1392, W, H - 1392);
  ridge(1398, 1, [[0.0026, 10, 1.1], [0.007, 5, 2.2]], '#2f2149');
  gr = g.createLinearGradient(0, 1392, 0, 1470);
  gr.addColorStop(0, 'rgba(244,174,140,0.22)'); gr.addColorStop(1, 'rgba(244,174,140,0)');
  g.fillStyle = gr; g.fillRect(0, 1392, W, 80);
  g.fillStyle = '#1b1231'; g.fillRect(0, 1592, W, H - 1592);
  g.fillStyle = 'rgba(255,226,196,0.16)'; g.fillRect(0, 1590, W, 3);
  // the stop sign: a pole and a round plate with a little bus drawn in cream
  const SX = 928;
  g.fillStyle = '#1e1434';
  g.beginPath(); g.roundRect(SX - 7, 1150, 14, 446, 7); g.fill();
  g.beginPath(); g.ellipse(SX, 1596, 34, 7, 0, 0, TAU); g.fill();
  g.beginPath(); g.arc(SX, 1128, 56, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(252,235,210,0.9)'; g.lineWidth = 4;
  g.beginPath(); g.arc(SX, 1128, 47, 0, TAU); g.stroke();
  g.fillStyle = 'rgba(252,235,210,0.95)';
  g.beginPath(); g.roundRect(SX - 25, 1106, 50, 38, 8); g.fill();
  g.fillStyle = '#1e1434';
  g.beginPath(); g.roundRect(SX - 19, 1112, 38, 13, 3); g.fill();
  g.fillRect(SX - 25, 1134, 50, 3);
  g.fillStyle = 'rgba(252,235,210,0.95)';
  for (const dx of [-14, 14]) { g.beginPath(); g.arc(SX + dx, 1146, 5.5, 0, TAU); g.fill(); }
  // crescent moon
  g.fillStyle = 'rgba(255,240,218,0.92)';
  g.beginPath(); g.arc(842, 372, 34, 0, TAU); g.fill();
  g.globalCompositeOperation = 'destination-out';
  g.beginPath(); g.arc(857, 360, 31, 0, TAU); g.fill();
  g.globalCompositeOperation = 'source-over';
  return texFromCanvas(g);
}

/** header (R), subtitle (G), stars (B) as coverage */
function bakeType() {
  const out = new Uint8Array(W * H * 4);
  const put = (ch, draw) => {
    const [, g] = mkCanvas(W, H);
    g.fillStyle = '#fff'; g.strokeStyle = '#fff';
    draw(g);
    const d = g.getImageData(0, 0, W, H).data;
    for (let i = 0; i < W * H; i++) out[i * 4 + ch] = d[i * 4 + 3];
  };
  put(0, (g) => {
    g.font = `600 30px ${F_UI}`; g.letterSpacing = '0.5px'; g.textBaseline = 'alphabetic';
    g.textAlign = 'left'; g.fillText(HEAD_L, 64, 128);
    g.textAlign = 'right'; g.fillText(HEAD_R, W - 64, 128);
    g.fillRect(64, 156, W - 128, 2);
  });
  put(1, (g) => {
    g.font = `800 54px ${F_UI}`; g.letterSpacing = '-1px'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillText(SUB, CX, 1232);
  });
  put(2, (g) => {
    const R = rand(77);
    for (let i = 0; i < 90; i++) {
      const x = 40 + R() * 1000, y = 200 + Math.pow(R(), 1.4) * 520, r = 0.7 + R() * R() * 1.9;
      if (Math.hypot(x - 842, y - 372) < 70) continue;
      g.globalAlpha = 0.35 + 0.65 * R();
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
  });
  const t = new THREE.DataTexture(out, W, H, THREE.RGBAFormat, THREE.UnsignedByteType);
  t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
}

function texFromCanvas(g) {
  const d = g.getImageData(0, 0, W, H).data;
  const t = new THREE.DataTexture(new Uint8Array(d.buffer.slice(0)), W, H, THREE.RGBAFormat, THREE.UnsignedByteType);
  t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
}

// =================================================================== the demo
defineDemo({
  id: '143-slit-scan',
  title: '기다림',
  tech: '슬릿스캔 · 시간 변위 표본 (x, y, t 볼륨)',
  duration: D,
  background: '#1b1440',

  async setup(api) {
    await fontReady(`400 300px ${F_WORD}`, WORD);
    await fontReady(`800 54px ${F_UI}`, SUB);
    await fontReady(`600 30px ${F_UI}`, HEAD_L + HEAD_R);

    const [, mg] = mkCanvas(8, 8);
    const { size, L } = layoutWord(mg);
    const vol = bakeVolume(size, L);
    const land = bakeLand();
    const type = bakeType();

    const el = api.layer('canvas', { z: 0 });
    el.width = W; el.height = H;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    const U = {
      uVol: { value: vol }, uLand: { value: land }, uType: { value: type },
      uTime: { value: 0 }, uSrc: { value: 0 }, uKl: { value: 0 }, uKr: { value: 0 }, uKa: { value: 0 }, uSeam: { value: 0 },
      uSlit: { value: 0 }, uZoom: { value: 1 }, uGlow: { value: 0 }, uHead: { value: 0 }, uNight: { value: 0 },
      uFrame: { value: 0 }, uExpo: { value: 1 }, uDotIn: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    Object.assign(this, { renderer, scene, cam, U });
  },

  frame(t) {
    const U = this.U;
    const kl = KL(t), kr = KR(t), ka = KA(t);
    U.uTime.value = t;
    U.uSrc.value = t + T_SRC0;
    U.uKl.value = kl; U.uKr.value = kr; U.uKa.value = ka;
    // the branch-cut wedge is only needed while k_ang is not a whole number of loops
    U.uSeam.value = Math.abs(ka / P - Math.round(ka / P)) > 1e-5 ? 1 : 0;
    U.uSlit.value = clamp(Math.max(kl / 3.4, kr / 4.6, Math.abs(ka) / P));
    const gl = GLOW(t);
    U.uGlow.value = gl;
    U.uZoom.value = 1 + 0.018 * gl;
    U.uHead.value = ease.outCubic(ramp(t, 0.35, 1.1));
    U.uNight.value = ramp(t, 7.5, 10);
    U.uFrame.value = Math.floor(t * 24);
    U.uExpo.value = lerp(0.5, 1, ease.outCubic(clamp(t / 0.8)));
    U.uDotIn.value = ramp(t, 0.55, 1.2);
    this.renderer.render(this.scene, this.cam);
  },
});
