/*
 * 65 · 점균이 쓴 글자 — a slime mould (Physarum polycephalum) grows from oat flakes into a transport network, the way
 * it rebuilt the Tokyo rail map; then the nutrients move into the shape of a word and the network crawls into it:
 * 이어 / 지다 ("to be connected"), standing as living, pulsing veins under a dark-field microscope.
 *
 * Model: Jones (2010), on the GPU (WebGL2). 327,680 agents in an RGBA32F state texture (x, y, heading, birth), ping-pong.
 * Every step: each agent samples trail + food at three sensors (front, ±SA at distance SO), turns by RA toward the
 * strongest (random when both sides beat the front), and steps SS forward — unless the pixel ahead was occupied
 * (Jones's exclusion: then it stays, picks a random heading and lays no trail). Moving agents deposit into the trail
 * map (points, additive, R16F) while a second render target counts agents per pixel for the next step's exclusion;
 * then the trail is diffused (3×3 mean) and decays. Food is a static texture added to what the agents sense:
 * oat-flake blobs first, the word's attraction field (flat inside the strokes, falling off outside) after the switch,
 * and agents far from food lay less trail (starvation), so the old network fades while the letters fill.
 * Growth: every agent has a birth time = its distance to the nearest inoculation flake / front speed, so the
 * plasmodium spreads outward from four flakes instead of starting everywhere at once.
 * Seeking: fixed 4 steps per video frame; replay() with GPU checkpoints (blitFramebuffer copies of agents + trail;
 * the occupancy counts are recomputed from the restored agents).
 * Picture: dark-field microscope — amber/gold veins with a pale core and soft bloom on deep blue-black, oat flakes with
 * bright rims, out-of-focus debris at two depths, a rack-focus entrance, contraction waves sweeping the letters.
 */
import { defineDemo, replay, track, ease } from '../_lib/stage.js';
import { FONTS, fontReady, textAlpha, signedDistance } from '../_lib/type.js';

const D = 10, FPS = 30, SPF = 4;                 // 4 simulation steps per video frame → 120 steps per second
const AW = 640, AH = 512;                        // 327,680 agents (≈ 16 % of the 1080 × 1920 lattice, Jones's regime)
const FW = 540, FH = 960;                        // food field (half resolution, linear filtered)
// the agent rule (lengths in screen px): Jones's 22.5° sensors, 45° turns, scaled to this lattice
const SA = 0.3927, RA = 0.7854, SO = 12, SS = 1.3, JIT = 0.06, DECAY = 0.9, DIFF = 1.0;
const W_SEED = 4, W_GLYPH = 10, SMIN = 0.15, FRONT = 1.5;
// oat flakes (screen px, y down) and the four the plasmodium is inoculated on
const OATS = [[250, 330], [800, 270], [560, 640], [170, 900], [900, 830], [450, 1170], [820, 1330], [230, 1520], [640, 1590]];
const INOC = [0, 1, 6, 7];                       // the four outer flakes: smallest covering radius (645 px)
const WORD = [['이어', 650], ['지다', 1130]];    // two lines, ink centres (y down)
const EM = 420;
const FONT = (px) => `800 ${px}px "${FONTS.pretendard.family}"`;

// ---------------------------------------------------------------- the story (pure functions of t / step)
const mixG = track([[3.3, 0], [4.1, 1, ease.inOutCubic]]);       // food: oat flakes → the word
const starve = track([[3.5, 0], [4.8, 1, ease.inOutCubic]]);     // off-food agents lay less trail
const fade = track([[0, 0], [0.8, 1, ease.outCubic], [D - 0.7, 1], [D, 0, ease.inCubic]]);
const defocus = track([[0, 1], [1.4, 0, ease.outCubic]]);        // the microscope comes into focus
const oatK = track([[0, 1], [3.5, 1], [5.0, 0.12, ease.inOutCubic]]);
const ghostK = track([[3.2, 0], [3.9, 1, ease.inOutCubic], [6.0, 0, ease.inOutCubic]]);
const pulseK = track([[5.6, 0], [7.2, 0.6, ease.inOutCubic], [D, 0.45]]);
const bloomK = track([[0, 0.35], [7.2, 0.55, ease.inOutCubic], [D, 0.62]]);
const expo = track([[0, 1.0], [7.2, 1.08, ease.inOutCubic], [D, 0.96]]);
const zoom = track([[0, 1.0], [D, 1.05, ease.inOutCubic]]);

// ---------------------------------------------------------------- shaders
const HEAD = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uint pcg(uint v) { uint s = v * 747796405u + 2891336453u; uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
float h1(uint v) { return float(pcg(v)) * (1.0 / 4294967295.0); }
`;
const QUAD_VS = `#version 300 es
layout(location = 0) in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

// agents are born on the lattice at random, waiting until the growth front (from the nearest inoculation flake) reaches them
const INIT_FS = HEAD + `
uniform vec2 res;
uniform vec2 inoc[4];
uniform float vf;
out vec4 o;
void main() {
  ivec2 ij = ivec2(gl_FragCoord.xy);
  uint id = uint(ij.y * ${AW} + ij.x);
  vec2 p = vec2(2.0 + h1(id * 8u + 1u) * (res.x - 4.0), 2.0 + h1(id * 8u + 2u) * (res.y - 4.0));
  float best = 1e9; vec2 c = p;
  for (int k = 0; k < 4; k++) { float d = distance(p, inoc[k]); if (d < best) { best = d; c = inoc[k]; } }
  vec2 dir = p - c;
  float th = atan(dir.y, dir.x + 1e-4) + (h1(id * 8u + 4u) - 0.5) * 1.2;   // heading outward, give or take
  o = vec4(p, mod(th, 6.2831853), best / vf + 0.15 * h1(id * 8u + 6u));
}`;

// one Jones step for one agent: sense, rotate, move (or be blocked)
const UPDATE_FS = HEAD + `
uniform sampler2D S, T, C, Fd;
uniform vec2 res;
uniform float tau, mixG;
uniform uint stepN;
out vec4 o;
float sense(vec2 p) {
  vec2 uv = p / res;
  vec4 f = texture(Fd, uv);
  return texture(T, uv).r + ${W_SEED.toFixed(1)} * (1.0 - mixG) * f.r + ${W_GLYPH.toFixed(1)} * mixG * f.g;
}
void main() {
  ivec2 ij = ivec2(gl_FragCoord.xy);
  vec4 s = texelFetch(S, ij, 0);
  float birth = s.w < 0.0 ? -1.0 - s.w : s.w;        // w < 0 marks "blocked last step"
  if (birth > tau) { o = vec4(s.xyz, birth); return; } // not grown yet
  uint id = uint(ij.y * ${AW} + ij.x);
  vec2 p = s.xy;
  float th = s.z;
  const float SA = ${SA}, RA = ${RA}, SO = ${SO.toFixed(1)};
  float F = sense(p + SO * vec2(cos(th), sin(th)));
  float FL = sense(p + SO * vec2(cos(th + SA), sin(th + SA)));
  float FR = sense(p + SO * vec2(cos(th - SA), sin(th - SA)));
  uint k = pcg(id ^ (stepN * 2654435761u));
  float r1 = float(k) * (1.0 / 4294967295.0), r2 = h1(k ^ 0x9e3779b9u);
  if (F > FL && F > FR) {}
  else if (F < FL && F < FR) th += r1 < 0.5 ? RA : -RA;
  else if (FL > FR) th += RA;
  else if (FR > FL) th -= RA;
  th += (r2 - 0.5) * ${(2 * JIT).toFixed(3)};
  vec2 np = p + ${SS} * (0.85 + 0.3 * h1(id * 8u + 5u)) * vec2(cos(th), sin(th));
  ivec2 own = ivec2(p), dst = ivec2(np);
  bool ok = np.x >= 1.0 && np.x <= res.x - 1.0 && np.y >= 1.0 && np.y <= res.y - 1.0;
  if (ok) ok = texelFetch(C, dst, 0).r < (own == dst ? 1.5 : 0.5);   // Jones's exclusion: one agent per site
  if (!ok) { th = r2 * 6.2831853; np = p; }
  o = vec4(np, mod(th, 6.2831853), ok ? birth : -1.0 - birth);
}`;

// deposit: one point per agent into the trail (target 0) and an occupancy count (target 1)
const DEPOSIT_VS = HEAD + `
uniform sampler2D S, Fd;
uniform vec2 res;
uniform float tau, mixG, starve, dep;
flat out float vDep;
void main() {
  int id = gl_VertexID;
  vec4 s = texelFetch(S, ivec2(id % ${AW}, id / ${AW}), 0);
  float birth = s.w < 0.0 ? -1.0 - s.w : s.w;
  gl_PointSize = 1.0;
  if (birth > tau) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vDep = 0.0; return; }
  vec4 f = texture(Fd, s.xy / res);
  float food = mix(f.r, f.g, mixG);
  float d = dep * (1.0 + ${FRONT.toFixed(2)} * exp(-(tau - birth) / 0.3))                 // the young growth front glows
          * mix(1.0, ${SMIN} + ${(1 - SMIN).toFixed(2)} * smoothstep(0.05, 0.6, food), starve);   // starving agents lay less
  vDep = s.w < 0.0 ? 0.0 : d;                                                          // blocked: no trail (Jones)
  gl_Position = vec4(s.xy / res * 2.0 - 1.0, 0.0, 1.0);
}`;
const DEPOSIT_FS = `#version 300 es
precision highp float;
flat in float vDep;
layout(location = 0) out vec4 oT;
layout(location = 1) out vec4 oC;
void main() { oT = vec4(vDep, 0.0, 0.0, 0.0); oC = vec4(1.0, 0.0, 0.0, 0.0); }`;

const DIFFUSE_FS = HEAD + `
uniform sampler2D T;
out vec4 o;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(T, 0) - 1;
  float c = texelFetch(T, q, 0).r, s = 0.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) s += texelFetch(T, clamp(q + ivec2(i, j), ivec2(0), m), 0).r;
  o = vec4((c + (s / 9.0 - c) * ${DIFF.toFixed(2)}) * ${DECAY}, 0.0, 0.0, 1.0);
}`;

const NOISE = `
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vnoise(vec2 x) { vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.3; a *= 0.5; } return s; }
`;
// the microscope image (HDR, before bloom)
const COMPOSE_FS = `#version 300 es
precision highp float;
uniform sampler2D T, Fd;
uniform vec2 res;
uniform float t, zoom, oatK, ghostK, pulseK;
uniform vec3 oats[${OATS.length}];             // x, y (GL px), rotation
out vec4 o;
${NOISE}
// out-of-focus specks in the medium: one disc per lucky hash cell, summed over the 3×3 neighbourhood
float debris(vec2 p, float scale, float seed, vec2 drift) {
  vec2 g = p * scale + drift * t, id0 = floor(g);
  float acc = 0.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = id0 + vec2(i, j);
    if (h21(id + seed) > 0.32) continue;
    vec2 c = id + vec2(h21(id + seed + 1.7), h21(id + seed + 3.1));
    float rr = 0.16 + 0.26 * h21(id + seed + 5.3), d = length(g - c);
    acc += smoothstep(rr, rr * 0.72, d) * (0.6 + 0.4 * smoothstep(rr * 0.35, rr, d)) * (0.35 + 0.65 * h21(id + seed + 7.9));
  }
  return acc;
}
vec3 veinColor(float v) {
  vec3 deep = vec3(0.32, 0.11, 0.02), gold = vec3(1.0, 0.56, 0.16), pale = vec3(1.0, 0.86, 0.58);
  vec3 c = mix(deep, gold, smoothstep(0.0, 0.6, v));
  c = mix(c, pale, smoothstep(0.6, 1.0, v));
  float v2 = v * v;
  return c * (v * 1.5) + pale * (v2 * v2 * 1.4);
}
// an oat flake under dark-field light: a lumpy ellipse, bright rim, faint grainy body
vec3 oatFlakes(vec2 p) {
  vec3 acc = vec3(0.0);
  for (int k = 0; k < ${OATS.length}; k++) {
    vec2 q = p - oats[k].xy;
    if (dot(q, q) > 1600.0) continue;
    float a0 = oats[k].z, cs = cos(a0), sn = sin(a0);
    vec2 qr = vec2(cs * q.x + sn * q.y, -sn * q.x + cs * q.y);
    float a = atan(qr.y, qr.x + 1e-4);
    float rad = 16.0 * (1.0 + 0.12 * sin(3.0 * a + a0 * 5.0) + 0.06 * sin(7.0 * a + a0));
    float d = length(qr * vec2(1.0, 1.45)) / rad;
    float body = smoothstep(1.0, 0.86, d);
    float rim = smoothstep(0.55, 0.95, d) * body;
    acc += vec3(0.95, 0.82, 0.58) * (0.16 * body * (0.75 + 0.5 * vnoise(qr * 0.35 + a0 * 10.0)) + 0.55 * rim);
  }
  return acc;
}
void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 sp = 0.5 * res + (px - 0.5 * res) / zoom;          // the slide under the (slowly zooming) objective
  vec2 uv = sp / res;
  // dark field: deep blue-black, a little lighter where the condenser's cone is centred, agar mottling
  vec2 cq = (px - 0.5 * res) / res.y;
  float r = length(cq * vec2(1.0, 0.9));
  vec3 col = mix(vec3(0.007, 0.012, 0.028), vec3(0.0015, 0.003, 0.008), smoothstep(0.05, 0.8, r));
  col *= 0.8 + 0.4 * fbm(sp / 300.0 + 2.0);
  col += vec3(0.006, 0.010, 0.020) * smoothstep(0.55, 0.9, fbm(sp / 40.0 + 9.0));
  // specks above and below the focal plane drift at their own speeds (parallax = depth)
  col += debris(px / res.y, 7.0, 3.0, vec2(0.020, 0.030)) * vec3(0.05, 0.08, 0.13)
       + debris(px / res.y, 3.0, 11.0, vec2(-0.024, 0.042)) * vec3(0.09, 0.06, 0.03);
  // the plasmodium
  float Tv = texture(T, uv).r;
  vec4 f = texture(Fd, uv);
  float v = 1.0 - exp(-Tv * Tv / (Tv + 0.5));                // soft threshold: veins (T ≥ 1) glow, the faint web (T ≈ 0.2) stays a whisper
  float wave = 0.5 + 0.5 * sin(6.2831853 * (0.55 * t - dot(sp, vec2(0.55, -1.0)) / 640.0));   // contraction waves, reading order
  col += veinColor(v) * (1.0 + pulseK * f.a * (wave - 0.35));
  col += oatFlakes(sp) * oatK;
  // the new nutrient shows faintly in the medium before the veins arrive
  col += ghostK * vec3(0.06, 0.10, 0.18) * smoothstep(0.35, 0.95, f.g) * (1.0 - v);
  o = vec4(min(col, vec3(30.0)), 1.0);
}`;

const FINAL_FS = `#version 300 es
precision highp float;
uniform sampler2D img;
uniform vec2 stage;
uniform float frameNo, fade, expo, bloomK, defocus;
out vec4 o;
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec3 bsp(vec2 uv, int lod) {
  vec2 sz = vec2(textureSize(img, lod));
  vec2 p = uv * sz - 0.5, i = floor(p), f = p - i;
  vec2 f2 = f * f, f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0, w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0, w3 = f3 / 6.0;
  vec2 g0 = w0 + w1, g1 = w2 + w3;
  vec2 h0 = (i - 0.5 + w1 / g0) / sz, h1 = (i + 1.5 + w3 / g1) / sz;
  float l = float(lod);
  return g0.y * (g0.x * textureLod(img, h0, l).rgb + g1.x * textureLod(img, vec2(h1.x, h0.y), l).rgb)
       + g1.y * (g0.x * textureLod(img, vec2(h0.x, h1.y), l).rgb + g1.x * textureLod(img, h1, l).rgb);
}
void main() {
  vec2 uv = gl_FragCoord.xy / stage, cc = uv - 0.5;
  // a touch of lateral colour from the objective, growing toward the edge of the field
  vec3 c = vec3(textureLod(img, 0.5 + cc * 1.0018, 0.0).r, textureLod(img, uv, 0.0).g, textureLod(img, 0.5 + cc * 0.9982, 0.0).b);
  vec3 b2 = bsp(uv, 2), b3 = bsp(uv, 3), b4 = bsp(uv, 4), b5 = bsp(uv, 5), b6 = bsp(uv, 6);
  c = mix(c, b2 * 0.55 + b3 * 0.45, defocus);                   // rack focus
  c += (b2 * 0.28 + b3 * 0.28 + b4 * 0.22 + b5 * 0.14 + b6 * 0.08) * bloomK;
  c = 1.0 - exp(-c * expo);
  c = pow(max(c, 0.0), vec3(1.0 / 2.2));
  vec2 q = cc * vec2(1.0, 0.68);
  c *= 1.0 - 0.6 * pow(clamp(dot(q, q) * 2.9, 0.0, 1.0), 1.6);  // the field stop's soft edge
  c *= fade;
  c += (h21(gl_FragCoord.xy + frameNo * 7.13) - 0.5) * (2.0 / 255.0);
  o = vec4(c, 1.0);
}`;

// ---------------------------------------------------------------- setup
async function buildFood(H) {
  // the word as a half-resolution signed distance field
  await fontReady(FONT(EM / 2), WORD.map((w) => w[0]).join(''));
  const alpha = textAlpha(FW, FH, (ctx) => {
    ctx.font = FONT(EM / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (const [s, y] of WORD) {
      const m = ctx.measureText(s);
      ctx.fillText(s, FW / 2, y / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
    }
  });
  const sd = signedDistance(alpha, FW, FH);
  const px = new Uint8Array(FW * FH * 4);
  const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) {
    const X = (i + 0.5) * 2, Y = (j + 0.5) * 2;                         // screen px, y down (canvas rows)
    let r = 0;
    for (const [ox, oy] of OATS) { const d = Math.hypot(X - ox, Y - oy); r += Math.exp(-d * d / (2 * 18 * 18)) + 0.30 * Math.exp(-d / 120); }
    const d = sd[j * FW + i] * 2;                                       // px, + outside
    const g = d < 0 ? 1 : 0.55 * Math.exp(-d / 9) + 0.45 * Math.exp(-d / 160);   // flat inside, pulling from outside
    const k = ((FH - 1 - j) * FW + i) * 4;                              // GL rows run up
    px[k] = Math.round(255 * Math.min(r, 1));
    px[k + 1] = Math.round(255 * g);
    px[k + 3] = Math.round(255 * sm(3, -3, d));                         // soft letter mask (for the pulse)
  }
  // growth front speed: the farthest lattice point is reached at ≈ 3.1 s, just before the food moves (≈ 208 px/s)
  let maxD = 0;
  for (let y = 0; y <= H; y += 8) for (let x = 0; x <= 1080; x += 8) {
    let best = Infinity;
    for (const k of INOC) best = Math.min(best, Math.hypot(x - OATS[k][0], y - OATS[k][1]));
    maxD = Math.max(maxD, best);
  }
  return { px, vf: maxD / 3.1 };
}

defineDemo({
  id: '65-physarum-type',
  title: '점균이 쓴 글자',
  tech: 'Physarum 에이전트(감지·회전·이동·침착) · 확산·감쇠 · 먹이장',
  duration: D,
  fps: FPS,
  background: '#020306',
  async setup({ canvas, W, H, headless }) {
    const food = await buildFood(H);
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float missing (needed to render float targets)');
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const quadVs = sh(gl.VERTEX_SHADER, QUAD_VS);
    const program = (fs, vs = quadVs) => {
      const p = gl.createProgram();
      gl.attachShader(p, typeof vs === 'string' ? sh(gl.VERTEX_SHADER, vs) : vs);
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const P = { init: program(INIT_FS), update: program(UPDATE_FS), deposit: program(DEPOSIT_FS, DEPOSIT_VS),
      diffuse: program(DIFFUSE_FS), compose: program(COMPOSE_FS), final: program(FINAL_FS) };

    const tex = (w, h, fmt, filter, levels = 1) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texStorage2D(gl.TEXTURE_2D, levels, fmt, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, levels > 1 ? gl.LINEAR_MIPMAP_LINEAR : filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const fbo = (w, h, ...atts) => {
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      atts.forEach((t, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0));
      gl.drawBuffers(atts.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('framebuffer incomplete');
      return { fb: f, w, h };
    };
    // agents: RGBA32F (positions need full float precision); trail: R16F (blendable, filterable); counts: R16F
    const agentTex = [tex(AW, AH, gl.RGBA32F, gl.NEAREST), tex(AW, AH, gl.RGBA32F, gl.NEAREST)];
    const trailTex = [tex(W, H, gl.R16F, gl.LINEAR), tex(W, H, gl.R16F, gl.LINEAR)];
    const countTex = tex(W, H, gl.R16F, gl.NEAREST);
    const agentFb = agentTex.map((t) => fbo(AW, AH, t));
    const trailFb = trailTex.map((t) => fbo(W, H, t));
    const depFb = trailTex.map((t) => fbo(W, H, t, countTex));
    const foodTex = tex(FW, FH, gl.RGBA8, gl.LINEAR);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, FW, FH, gl.RGBA, gl.UNSIGNED_BYTE, food.px);
    const sceneTex = tex(W, H, gl.RGBA16F, gl.LINEAR, 1 + Math.floor(Math.log2(H)));   // half float: filterable, mip bloom
    const sceneFb = fbo(W, H, sceneTex);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const quadVao = gl.createVertexArray();
    gl.bindVertexArray(quadVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const emptyVao = gl.createVertexArray();
    gl.bindVertexArray(null);

    const bindTex = (P_, map) => {
      let unit = 0;
      for (const [name, t] of Object.entries(map)) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.uniform1i(P_.u[name], unit++);
      }
    };
    const fullscreen = (P_, target, map, set) => {
      gl.useProgram(P_.p);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fb : null);
      gl.viewport(0, 0, target ? target.w : W, target ? target.h : H);
      bindTex(P_, map);
      set && set(P_.u);
      gl.bindVertexArray(quadVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const inocGL = INOC.flatMap((k) => [OATS[k][0], H - OATS[k][1]]);
    const oatsGL = OATS.flatMap(([x, y], k) => [x, H - y, k * 2.39996 + 0.7]);
    let cur = 0, tcur = 0;                        // which agent / trail texture is live

    // deposit pass (also used alone, with dep = 0, to rebuild the occupancy counts after a checkpoint load)
    const deposit = (tau, dep) => {
      gl.useProgram(P.deposit.p);
      gl.bindFramebuffer(gl.FRAMEBUFFER, depFb[tcur].fb);
      gl.viewport(0, 0, W, H);
      gl.clearBufferfv(gl.COLOR, 1, [0, 0, 0, 0]);
      bindTex(P.deposit, { S: agentTex[cur], Fd: foodTex });
      gl.uniform2f(P.deposit.u.res, W, H);
      gl.uniform1f(P.deposit.u.tau, tau);
      gl.uniform1f(P.deposit.u.mixG, mixG(tau)); gl.uniform1f(P.deposit.u.starve, starve(tau));
      gl.uniform1f(P.deposit.u.dep, dep);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.bindVertexArray(emptyVao);
      gl.drawArrays(gl.POINTS, 0, AW * AH);
      gl.disable(gl.BLEND);
    };
    const simStep = (N) => {
      const tau = N / (FPS * SPF);
      fullscreen(P.update, agentFb[1 - cur], { S: agentTex[cur], T: trailTex[tcur], C: countTex, Fd: foodTex }, (u) => {
        gl.uniform2f(u.res, W, H); gl.uniform1f(u.tau, tau); gl.uniform1f(u.mixG, mixG(tau)); gl.uniform1ui(u.stepN, N);
      });
      cur = 1 - cur;
      deposit(tau, 1.0);
      fullscreen(P.diffuse, trailFb[1 - tcur], { T: trailTex[tcur] });
      tcur = 1 - tcur;
    };
    const blit = (srcTex, dstTex, w, h) => {
      const a = gl.createFramebuffer(), b = gl.createFramebuffer();
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, a);
      gl.framebufferTexture2D(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, srcTex, 0);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, b);
      gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dstTex, 0);
      gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
      gl.deleteFramebuffer(a); gl.deleteFramebuffer(b);
    };
    const sync = new Float32Array(4);
    this.R = replay({
      dt: 1 / FPS,
      every: 45,
      init: () => {
        cur = 0; tcur = 0;
        fullscreen(P.init, agentFb[0], {}, (u) => { gl.uniform2f(u.res, W, H); gl.uniform2fv(u.inoc, inocGL); gl.uniform1f(u.vf, food.vf); });
        for (const f of [...trailFb, depFb[0]]) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, f.fb);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      },
      step: (n) => {
        for (let k = 0; k < SPF; k++) simStep(n * SPF + k);
        // headless verification only: wait for the software GPU here (1-pixel readback) so long seeks don't pile up
        if (headless) { gl.bindFramebuffer(gl.FRAMEBUFFER, agentFb[cur].fb); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, sync); }
      },
      // checkpoint = copies of the agents and the trail (≈ 9.4 MB of GPU memory each)
      save: () => {
        const a = tex(AW, AH, gl.RGBA32F, gl.NEAREST), t = tex(W, H, gl.R16F, gl.LINEAR);
        blit(agentTex[cur], a, AW, AH);
        blit(trailTex[tcur], t, W, H);
        return { a, t, n: this.R ? this.R.step : 0 };
      },
      load: (c) => {
        blit(c.a, agentTex[cur], AW, AH);
        blit(c.t, trailTex[tcur], W, H);
        deposit((c.n * SPF - 1) / (FPS * SPF), 0.0);   // occupancy of the restored positions; adds nothing to the trail
      },
    });

    this.render = (t) => {
      const frameNo = Math.round(t * FPS);
      fullscreen(P.compose, { fb: sceneFb.fb, w: W, h: H }, { T: trailTex[tcur], Fd: foodTex }, (u) => {
        gl.uniform2f(u.res, W, H); gl.uniform1f(u.t, t); gl.uniform1f(u.zoom, zoom(t));
        gl.uniform1f(u.oatK, oatK(t)); gl.uniform1f(u.ghostK, ghostK(t)); gl.uniform1f(u.pulseK, pulseK(t));
        gl.uniform3fv(u.oats, oatsGL);
      });
      gl.bindTexture(gl.TEXTURE_2D, sceneTex);
      gl.generateMipmap(gl.TEXTURE_2D);
      fullscreen(P.final, null, { img: sceneTex }, (u) => {
        gl.uniform2f(u.stage, W, H); gl.uniform1f(u.frameNo, frameNo); gl.uniform1f(u.fade, fade(t));
        gl.uniform1f(u.expo, expo(t)); gl.uniform1f(u.bloomK, bloomK(t)); gl.uniform1f(u.defocus, defocus(t));
      });
    };
  },
  async frame(t) {
    await this.R.seek(t);
    this.render(t);
  },
});
