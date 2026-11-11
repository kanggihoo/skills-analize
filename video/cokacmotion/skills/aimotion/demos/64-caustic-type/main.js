/*
 * 64 · 빛으로 쓴 글자 — sunlight through a moving water/glass sheet throws dancing caustics on a pale stone floor;
 * the sheet calms into a lens designed in setup, and the same light gathers into a poem: 빛이 / 머문 / 자리.
 *
 * Setup (CPU, design.js): the "magic window" inverse problem. The wanted brightness is built from the text's signed
 *   distance (bright rim lines + a pool inside each stroke + a dim floor with a darker moat), the lens mesh is relaxed
 *   until every lens cell's area equals the brightness of its target cell (Ferraro's loop: area → loss → Poisson →
 *   move along the gradient, with the loss in its exact Monge–Ampère form), then inverted onto a regular lens grid.
 * Pass 1 (caustics): that regular lens grid is drawn with every vertex at its landing point on the floor:
 *   mix(chaotic landing from an animated wave field, designed landing, s(t)) — the mix of two refracting surfaces in
 *   the paraxial limit, and between a gradient map and the identity it is McCann's displacement interpolation, so the
 *   light flows into the letters without tearing. The fragment shader adds lens area / floor area (the inverse
 *   Jacobian, via dFdx/dFdy of the lens position) with additive blending, once per colour channel with a slightly
 *   different refraction strength (dispersion → rainbow fringes when the letters are sharpest).
 * Pass 2 (scene): view rays hit the honed travertine floor (slabs, bedding, pores, relief), lit by the caustic texture,
 *   bounce light and a cool room ambient; the sunbeam in the dusty air is ray-marched over the same texture, and
 *   dust motes (points with depth-of-field) glint in it.
 * Pass 3 (finish): B-spline mip bloom, filmic tone, split toning, vignette, grain.
 */
import { defineDemo, track, ease } from '../_lib/stage.js';
import { FONTS, fontReady, textAlpha, signedDistance } from '../_lib/type.js';
import { designLens, invertMesh } from './design.js';

// ---------------------------------------------------------------- geometry (floor units: the light patch is 1 × 1.5)
const D = 9.5;
const NX = 256, NY = 384, ASPECT = NY / NX;      // design grid: one cell = 1/256 of the patch width
const RX = 576, RY = 864;                        // render mesh: a regular grid over the lens (≈ 2.25 per design cell)
const DOM = [-0.1, -0.1, 1.1, 1.6];              // the caustic texture covers this floor rectangle
const CW = 1024, CH = 1452;                      // … at ≈ 1 texel per screen pixel
const LINES = ['빛이', '머문', '자리'];
const FONT = (px) => `800 ${px}px "${FONTS.notoSerifKR.family}"`;
const EM = 94;                                   // em size in design cells
const SUNXY = [-0.10, 0.36];                     // sun direction, horizontal travel per unit height (L.xy / L.z)
const ZTOP = 1.6;                                // height of the water sheet above the floor (top of the beam)
const FOCAL = 2500;                              // px
const MOTES = 420;

// wanted brightness from the signed distance d (design cells, + outside): a floor with a darker moat around the
// letters (the light was borrowed from there), a pool filling each stroke, and a bright line just inside its edge
function density(d) {
  const fill = 1 / (1 + Math.exp(d / 0.55));
  const rim = Math.exp(-(((d + 0.75) / 0.85) ** 2));
  const moat = 1 - 0.5 * Math.exp(-Math.max(d, 0) / 7);
  return 0.17 * moat + 2.4 * fill + 4.2 * rim;
}

// the chaotic water: directional waves (angle, wavelength in patch widths, focusing strength f = K·a·k², phase).
// The landing offset is K·∇h = Σ (f/k)·cos(phase)·dir; f near 0.5 per wave folds the light into a caustic net.
const WAVES = [
  [0.35, 0.44, 0.50, 0.0], [1.95, 0.32, 0.52, 1.3], [2.85, 0.24, 0.48, 2.9], [4.10, 0.18, 0.45, 4.1],
  [5.05, 0.135, 0.40, 0.7], [0.95, 0.10, 0.32, 5.3], [3.55, 0.075, 0.26, 3.3],
];
const NW = WAVES.length;
const WV = new Float32Array(NW * 4), WP = new Float32Array(NW * 2);
WAVES.forEach(([a, lam, f, ph], i) => {
  const k = 2 * Math.PI / lam;
  WV.set([Math.cos(a), Math.sin(a), k, f], i * 4);
  WP.set([0.38 * Math.sqrt(k), ph], i * 2);       // deep-water-like dispersion: short ripples run faster
});

// ---------------------------------------------------------------- the story (pure functions of t)
const fade = track([[0, 0], [0.9, 1, ease.outCubic], [D - 0.7, 1], [D, 0, ease.inCubic]]);
const calm = track([[0, 1.0], [1.4, 1.0], [3.6, 0.5, ease.inOutCubic], [D, 0.45]]);         // the water settles
const design = track([[2.8, 0], [6.1, 1, ease.inOutCubic]]);                                 // s(t): chaos → lens
const shimmer = track([[5.4, 0], [6.9, 0.05, ease.inOutCubic], [D, 0.04]]);                  // afterglow breathing
const speed = track([[0, 1.0], [2.0, 1.0], [4.5, 0.55, ease.inOutCubic], [6.5, 0.45], [D, 0.5]]);
const disp = track([[0, 0.010], [5.0, 0.012], [6.2, 0.034, ease.inOutCubic], [7.6, 0.024], [D, 0.022]]);
const sunGain = track([[0, 0.92], [3.0, 1.0], [6.1, 1.16, ease.inOutCubic], [7.8, 1.02], [D, 0.95]]);
const warm = track([[0, 0.0], [5.0, 0.15], [D, 0.75, ease.inOutCubic]]);                    // late sun turns gold
const bloomK = track([[0, 0.35], [6.2, 0.62, ease.inOutCubic], [D, 0.45]]);
const beamK = track([[0, 0.030], [6.2, 0.040], [D, 0.034]]);
const camZ = track([[0, 3.0], [D, 2.78, ease.inOutCubic]]);
const camY = track([[0, -0.50], [D, -0.40, ease.inOutCubic]]);
const camX = track([[0, 0.53], [D, 0.48, ease.inOutCubic]]);
// wave phase clock: ∫ speed dt on a fixed 1/240 s lattice (a pure function of t, so slowing never jumps the phase)
function waveClock(t) {
  const h = 1 / 240, n = Math.floor(t / h);
  let s = 0;
  for (let i = 0; i < n; i++) s += speed((i + 0.5) * h) * h;
  return s + speed((n * h + t) / 2) * (t - n * h);
}

// ---------------------------------------------------------------- shaders
const CAUS_VS = `#version 300 es
precision highp float;
precision highp int;
layout(location = 0) in vec2 tgt;      // designed landing point of this lens vertex (patch units)
uniform int gridX;
uniform vec2 gstep;                    // lens spacing of the render grid
uniform vec4 wv[${NW}];                // wave dir.xy, wavenumber, focusing strength
uniform vec2 wp[${NW}];                // angular speed, phase
uniform float tau, amp, sD, kc;
uniform vec4 dom;
out vec2 L;
void main() {
  int id = gl_VertexID;
  L = vec2(float(id % gridX), float(id / gridX)) * gstep;
  vec2 ch = vec2(0.0);
  for (int i = 0; i < ${NW}; i++) {
    float ph = wv[i].z * dot(wv[i].xy, L) - wp[i].x * tau + wp[i].y;
    ch += (wv[i].w / wv[i].z) * cos(ph) * wv[i].xy;
  }
  // landing = lens + kc · (chaotic offset + s · designed offset); kc is this colour's refraction strength
  vec2 P = L + kc * (amp * ch + sD * (tgt - L));
  gl_Position = vec4((P - dom.xy) / (dom.zw - dom.xy) * 2.0 - 1.0, 0.0, 1.0);
}`;
const CAUS_FS = `#version 300 es
precision highp float;
in vec2 L;
uniform float texelArea, aspect, clampI;
out vec4 o;
void main() {
  vec2 dx = dFdx(L), dy = dFdy(L);
  float I = min(abs(dx.x * dy.y - dx.y * dy.x) / texelArea, clampI);   // lens area landing on this texel
  float e = min(min(L.x, 1.0 - L.x), min(L.y, aspect - L.y));
  I *= smoothstep(-0.0005, 0.007, e);                                   // the window's penumbra
  o = vec4(I, I, I, 1.0);
}`;

const QUAD_VS = `#version 300 es
layout(location = 0) in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

const NOISE = `
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vnoise(vec2 x) { vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.3; a *= 0.5; } return s; }
`;
// the sunbeam's density at height z above floor point F: near the floor it carries the caustic picture, blurring and
// evening out toward the water sheet where the light is still uniform; zero outside the window's column
const BEAM = `
uniform sampler2D caus;
uniform vec4 dom;
uniform vec2 sunXY;
uniform float zTop, aspect;
float aperture(vec2 F) {
  return smoothstep(-0.012, 0.012, F.x) * smoothstep(1.012, 0.988, F.x) * smoothstep(-0.012, 0.012, F.y) * smoothstep(aspect + 0.012, aspect - 0.012, F.y);
}
vec3 beamAt(vec3 X) {
  vec2 F = X.xy - sunXY * X.z;
  vec3 c = textureLod(caus, (F - dom.xy) / (dom.zw - dom.xy), 1.0 + X.z * 4.0).rgb;
  return mix(c, vec3(1.0), clamp(X.z / zTop, 0.0, 1.0)) * aperture(F);
}
`;

const SCENE_FS = `#version 300 es
precision highp float;
uniform vec2 stage;
uniform float focal, frameNo, beamK, bounceK;
uniform int beamSteps;
uniform vec3 camPos, camF, camR, camU, sunCol, ambCol, Ls;
out vec4 o;
${NOISE}
${BEAM}
// honed travertine: slabs in running bond, bedding bands, elongated pores, grain; hgt = a relief value for shading
vec3 stone(vec2 p, float pix, out float hgt) {
  const vec2 SZ = vec2(0.52, 0.78);
  float row = floor((p.y + 0.21) / SZ.y);
  vec2 q = vec2(p.x + 0.17 + 0.5 * SZ.x * mod(row, 2.0), p.y + 0.21);
  vec2 id = floor(q / SZ);
  vec2 f = q - id * SZ;
  vec2 e = min(f, SZ - f);
  float joint = 1.0 - smoothstep(0.0028 - 0.7 * pix, 0.0028 + 0.7 * pix, min(e.x, e.y));
  float sl = h21(id + 17.0);
  float warp = fbm(p * vec2(1.3, 2.2) + id * 3.7);
  float bed = p.y * 21.0 + warp * 5.0 + sl * 9.0;
  float bands = 0.05 * smoothstep(0.55, 1.0, sin(bed)) + 0.035 * smoothstep(0.8, 1.0, sin(bed * 2.7 + warp * 7.0));
  vec3 base = mix(vec3(0.815, 0.775, 0.705), vec3(0.775, 0.725, 0.645), sl);
  base *= 0.93 + 0.11 * fbm(p * 3.1 + 11.0 + id);
  base *= 1.0 - bands;
  float gfade = 1.0 - smoothstep(0.0015, 0.004, pix);              // detail finer than a pixel fades to its mean
  base *= 1.0 + 0.05 * gfade * (vnoise(p * 210.0) - 0.5);
  float pn = vnoise(vec2(p.x * 70.0, p.y * 210.0) + id * 13.0 + warp * 4.0);
  float pore = smoothstep(0.78, 0.86, pn) * gfade;
  base *= 1.0 - 0.32 * pore;
  base = mix(base, vec3(0.50, 0.47, 0.42), joint * 0.85);
  hgt = -0.6 * pore - joint + 2.5 * fbm(p * 26.0 + id * 2.0);   // × 0.00035 below: pores/joints tilt ~0.1, mottling ~0.04
  return base;
}
void main() {
  vec2 px = gl_FragCoord.xy;
  vec3 rd = normalize(camF * focal + camR * (px.x - 0.5 * stage.x) + camU * (px.y - 0.5 * stage.y));
  float tt = -camPos.z / rd.z;
  vec2 P = camPos.xy + rd.xy * tt;
  vec2 dpx = dFdx(P), dpy = dFdy(P);
  float pix = 0.5 * (length(dpx) + length(dpy));
  float hgt;
  vec3 alb = stone(P, pix, hgt);
  // relief normal from screen-space derivatives of the relief value (solve the 2×2 chain rule)
  float hx = dFdx(hgt), hy = dFdy(hgt);
  float det = dpx.x * dpy.y - dpx.y * dpy.x;
  vec2 g = vec2(hx * dpy.y - hy * dpx.y, hy * dpx.x - hx * dpy.x) / (abs(det) > 1e-12 ? det : 1e-12);
  vec3 n = normalize(vec3(-g * 0.00035, 1.0));
  float shade = clamp(dot(n, Ls) / Ls.z, 0.0, 1.6);
  // sunlight that came through the water: the caustic texture (bias: the sun's disc softens it a touch)
  vec2 cu = (P - dom.xy) / (dom.zw - dom.xy);
  float inDom = step(0.0, cu.x) * step(cu.x, 1.0) * step(0.0, cu.y) * step(cu.y, 1.0);
  vec3 C = texture(caus, cu, 0.35).rgb * inDom;
  // bounce: the lit patch glows back into the room, falling off with distance from it
  vec2 dq = max(abs(P - vec2(0.5, 0.5 * aspect)) - vec2(0.5, 0.5 * aspect), 0.0);
  vec3 bounce = textureLod(caus, clamp(cu, 0.04, 0.96), 6.5).rgb * exp(-length(dq) / 0.45) * bounceK;
  vec3 amb = ambCol * (0.8 + 0.45 * smoothstep(-0.5, 3.0, P.y));
  vec3 col = alb * (amb + sunCol * (C * shade + bounce));
  // the sunbeam in the dusty air between the floor and the water: march the view ray by height
  float jit = fract(52.9829189 * fract(dot(px, vec2(0.06711056, 0.00583715))) + frameNo * 0.61803);
  float dz = min(zTop, camPos.z * 0.98) / float(beamSteps);
  vec3 beam = vec3(0.0);
  for (int i = 0; i < beamSteps; i++) {
    float z = (float(i) + jit) * dz;
    beam += beamAt(vec3(P + (camPos.xy - P) * (z / camPos.z), z));
  }
  col += sunCol * beam * (beamK * dz / max(-rd.z, 0.2));
  o = vec4(min(col, vec3(40.0)), 1.0);
}`;

// dust motes in the beam: a point each, lit by the beam where it floats, blurred by depth of field
const MOTE_VS = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 stage;
uniform float focal, t, focusD, moteK;
uniform vec3 camPos, camF, camR, camU, sunCol;
out vec3 vCol;
${BEAM}
uint pcg(uint v) { uint s = v * 747796405u + 2891336453u; uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
float h1(uint v) { return float(pcg(v)) * (1.0 / 4294967295.0); }
void main() {
  uint id = uint(gl_VertexID) * 9u;
  float a = h1(id + 1u), b = h1(id + 2u), c = h1(id + 3u), d = h1(id + 4u), e = h1(id + 5u), f = h1(id + 6u), g = h1(id + 7u), h = h1(id + 8u);
  float z = mix(0.06, zTop, c);
  vec3 X = vec3(vec2(mix(-0.04, 1.04, a), mix(-0.04, aspect + 0.04, b)) + sunXY * z, z);
  X += vec3(0.03 * sin(t * (0.18 + 0.25 * d) + 6.2832 * e), 0.03 * sin(t * (0.15 + 0.2 * f) + 6.2832 * g),
            0.02 * sin(t * (0.11 + 0.15 * h) + 6.2832 * a) + 0.008 * t);
  vec3 dens = beamAt(X);
  vec3 r = X - camPos;
  float depth = max(dot(r, camF), 0.1);
  vec2 sp = vec2(dot(r, camR), dot(r, camU)) / depth * focal;
  gl_Position = vec4(sp / (0.5 * stage), 0.0, 1.0);
  float size = clamp(1.5 + 160.0 * abs(1.0 / depth - 1.0 / focusD), 1.5, 60.0);
  gl_PointSize = size + 2.0;
  float glint = 0.55 + 0.45 * sin(t * (1.3 + 2.0 * d) + 6.2832 * f);   // a grain turning in the light
  vCol = sunCol * dens * (moteK * glint * (0.4 + 0.6 * e) / pow(size, 1.6));
}`;
const MOTE_FS = `#version 300 es
precision highp float;
in vec3 vCol;
out vec4 o;
void main() {
  float r = length(gl_PointCoord * 2.0 - 1.0);
  float disc = smoothstep(1.0, 0.82, r) * (0.75 + 0.25 * smoothstep(0.3, 0.9, r));   // bokeh with a faint rim
  o = vec4(vCol * disc, 1.0);
}`;

const FINAL_FS = `#version 300 es
precision highp float;
uniform sampler2D img;
uniform vec2 stage;
uniform float frameNo, fade, expo, bloomK;
out vec4 o;
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
// cubic B-spline sample of one mip level from 4 bilinear taps (round glows, no mip blocks)
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
  vec2 uv = gl_FragCoord.xy / stage;
  vec3 c = textureLod(img, uv, 0.0).rgb;
  vec3 b = bsp(uv, 2) * 0.30 + bsp(uv, 3) * 0.28 + bsp(uv, 4) * 0.22 + bsp(uv, 5) * 0.12 + bsp(uv, 6) * 0.08;
  c += max(b - 0.6, 0.0) * bloomK + b * 0.04;
  c = 1.0 - exp(-c * expo);
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c *= mix(vec3(0.93, 0.98, 1.07), vec3(1.03, 1.0, 0.96), smoothstep(0.04, 0.5, lum));   // cool shade, warm light
  c = pow(max(c, 0.0), vec3(1.0 / 2.2));
  vec2 q = (uv - 0.5) * vec2(1.0, 0.72);
  c *= 1.0 - 0.55 * pow(clamp(dot(q, q) * 2.6, 0.0, 1.0), 1.5);
  c *= fade;
  c += (h21(gl_FragCoord.xy + frameNo * 7.13) - 0.5) * (2.0 / 255.0);
  o = vec4(c, 1.0);
}`;

// ---------------------------------------------------------------- setup: the target, the lens, the GL
async function buildTarget() {
  await fontReady(FONT(100), LINES.join(''));
  const S = 2, tw = NX * S, th = NY * S;                  // raster at 2 px per design cell
  const alpha = textAlpha(tw, th, (ctx) => {
    ctx.font = FONT(EM * S);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const pitch = 1.16 * EM * S;
    LINES.forEach((s, i) => {
      const m = ctx.measureText(s);                        // centre each line's ink, not its em box
      ctx.fillText(s, tw / 2, th / 2 + 4 * S + (i - 1) * pitch + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
    });
  });
  const sd = signedDistance(alpha, tw, th);
  const I = new Float64Array(NX * NY);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    let acc = 0;
    for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) acc += density(sd[((NY - 1 - j) * S + sy) * tw + i * S + sx] / S);
    I[j * NX + i] = acc / (S * S);                         // canvas rows run down; design rows run up the floor (away)
  }
  return I;
}

defineDemo({
  id: '64-caustic-type',
  title: '빛으로 쓴 글자',
  tech: '역설계 커스틱(최적 수송·포아송 반복) · 광자 메시 래스터화 · 분산',
  duration: D,
  background: '#050506',
  async setup({ canvas, W, H, headless }) {
    // the lens: wanted brightness → designed lens mesh → regular render grid with its landing points
    const I = await buildTarget();
    const lens = designLens(I, NX, NY);
    const inv = invertMesh(lens.px, lens.py, NX, NY, RX, RY);
    const tgt = inv.tgt;
    for (let k = 0; k < tgt.length; k++) tgt[k] /= NX;     // design cells → patch units
    this.designInfo = { iters: lens.history.length, rms: lens.history[lens.history.length - 1], missed: inv.missed, bowties: inv.bowties };

    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float missing (needed to render half-float targets)');
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const program = (vs, fs) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const Pc = program(CAUS_VS, CAUS_FS), Ps = program(QUAD_VS, SCENE_FS), Pm = program(MOTE_VS, MOTE_FS), Pf = program(QUAD_VS, FINAL_FS);

    // render mesh: vertex k = lens grid point (k % RX, k / RX); attribute = its designed landing point
    const meshVao = gl.createVertexArray();
    gl.bindVertexArray(meshVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, tgt, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const idx = new Uint32Array((RX - 1) * (RY - 1) * 6);
    for (let l = 0, q = 0; l < RY - 1; l++) for (let k = 0; k < RX - 1; k++) {
      const a = l * RX + k, b = a + 1, c = a + RX + 1, d = a + RX;
      idx[q++] = a; idx[q++] = b; idx[q++] = c; idx[q++] = a; idx[q++] = c; idx[q++] = d;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    const quadVao = gl.createVertexArray();
    gl.bindVertexArray(quadVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const emptyVao = gl.createVertexArray();
    gl.bindVertexArray(null);

    const target = (w, h) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texStorage2D(gl.TEXTURE_2D, 1 + Math.floor(Math.log2(Math.max(w, h))), gl.RGBA16F, w, h);   // half float: filterable
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('framebuffer incomplete');
      return { tex, fbo, w, h };
    };
    const causT = target(CW, CH), sceneT = target(W, H);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const texelArea = ((DOM[2] - DOM[0]) / CW) * ((DOM[3] - DOM[1]) / CH);
    const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const LS = norm([SUNXY[0], SUNXY[1], 1]);
    const beamSteps = headless ? 10 : 20;
    const setBeam = (u) => {
      gl.uniform4fv(u.dom, DOM); gl.uniform2fv(u.sunXY, SUNXY);
      gl.uniform1f(u.zTop, ZTOP); gl.uniform1f(u.aspect, ASPECT);
    };

    this.draw = (t) => {
      const s = design(t), dl = disp(t);
      const amp = (1 - s) * calm(t) + shimmer(t);
      const tau = waveClock(t);
      const frameNo = Math.round(t * 30);
      // ---- pass 1: caustics, one colour channel per draw (dispersion)
      gl.bindFramebuffer(gl.FRAMEBUFFER, causT.fbo);
      gl.viewport(0, 0, CW, CH);
      gl.colorMask(true, true, true, true);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(Pc.p);
      gl.uniform1i(Pc.u.gridX, RX);
      gl.uniform2f(Pc.u.gstep, 1 / (RX - 1), ASPECT / (RY - 1));
      gl.uniform4fv(Pc.u.wv, WV); gl.uniform2fv(Pc.u.wp, WP);
      gl.uniform1f(Pc.u.tau, tau); gl.uniform1f(Pc.u.amp, amp); gl.uniform1f(Pc.u.sD, s);
      gl.uniform4fv(Pc.u.dom, DOM);
      gl.uniform1f(Pc.u.texelArea, texelArea); gl.uniform1f(Pc.u.aspect, ASPECT); gl.uniform1f(Pc.u.clampI, 30);
      gl.bindVertexArray(meshVao);
      const ks = [1 - dl, 1, 1 + 1.4 * dl];                 // red refracts least, blue most
      for (let c = 0; c < 3; c++) {
        gl.colorMask(c === 0, c === 1, c === 2, false);
        gl.uniform1f(Pc.u.kc, ks[c]);
        gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_INT, 0);
      }
      gl.colorMask(true, true, true, true);
      gl.disable(gl.BLEND);
      gl.bindTexture(gl.TEXTURE_2D, causT.tex);
      gl.generateMipmap(gl.TEXTURE_2D);

      // ---- pass 2: the room
      const pos = [camX(t), camY(t), camZ(t)];
      const F = norm([0.5 - pos[0], 0.64 - pos[1], -pos[2]]);
      const R = norm(cross(F, [0, 0, 1]));
      const U = cross(R, F);
      const wk = warm(t), g = sunGain(t);
      const sunCol = [1.0 * g, (0.94 - 0.14 * wk) * g, (0.84 - 0.26 * wk) * g];
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneT.fbo);
      gl.viewport(0, 0, W, H);
      gl.useProgram(Ps.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, causT.tex);
      gl.uniform1i(Ps.u.caus, 0);
      setBeam(Ps.u);
      gl.uniform2f(Ps.u.stage, W, H);
      gl.uniform1f(Ps.u.focal, FOCAL); gl.uniform1f(Ps.u.frameNo, frameNo);
      gl.uniform1f(Ps.u.beamK, beamK(t)); gl.uniform1f(Ps.u.bounceK, 0.06);
      gl.uniform1i(Ps.u.beamSteps, beamSteps);
      gl.uniform3fv(Ps.u.camPos, pos); gl.uniform3fv(Ps.u.camF, F); gl.uniform3fv(Ps.u.camR, R); gl.uniform3fv(Ps.u.camU, U);
      gl.uniform3fv(Ps.u.sunCol, sunCol); gl.uniform3f(Ps.u.ambCol, 0.020, 0.026, 0.036); gl.uniform3fv(Ps.u.Ls, LS);
      gl.bindVertexArray(quadVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // dust motes
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(Pm.p);
      gl.uniform1i(Pm.u.caus, 0);
      setBeam(Pm.u);
      gl.uniform2f(Pm.u.stage, W, H);
      gl.uniform1f(Pm.u.focal, FOCAL); gl.uniform1f(Pm.u.t, t);
      gl.uniform1f(Pm.u.focusD, Math.hypot(0.5 - pos[0], 0.75 - pos[1], pos[2]));
      gl.uniform1f(Pm.u.moteK, 7.0);
      gl.uniform3fv(Pm.u.camPos, pos); gl.uniform3fv(Pm.u.camF, F); gl.uniform3fv(Pm.u.camR, R); gl.uniform3fv(Pm.u.camU, U);
      gl.uniform3fv(Pm.u.sunCol, sunCol);
      gl.bindVertexArray(emptyVao);
      gl.drawArrays(gl.POINTS, 0, MOTES);
      gl.disable(gl.BLEND);
      gl.bindTexture(gl.TEXTURE_2D, sceneT.tex);
      gl.generateMipmap(gl.TEXTURE_2D);

      // ---- pass 3: finish
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(Pf.p);
      gl.uniform1i(Pf.u.img, 0);
      gl.uniform2f(Pf.u.stage, W, H);
      gl.uniform1f(Pf.u.frameNo, frameNo);
      gl.uniform1f(Pf.u.fade, fade(t));
      gl.uniform1f(Pf.u.expo, 1.25);
      gl.uniform1f(Pf.u.bloomK, bloomK(t));
      gl.bindVertexArray(quadVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  },
  frame(t) { this.draw(t); },
});
