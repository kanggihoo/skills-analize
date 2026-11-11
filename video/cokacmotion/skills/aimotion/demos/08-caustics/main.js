/*
 * 08 · 수영장 바닥의 빛 — refraction caustics on a pool floor, in three WebGL2 passes.
 *
 * Pass 1 (caustics): a dense grid over the water surface. The vertex shader evaluates the analytic wave
 *   heightfield (8 directional waves + an expanding ripple ring), refracts the sun through the surface
 *   normal (Snell), and moves the vertex to where that light lands on the floor. The fragment shader
 *   measures how much surface area one floor texel received — |det(dP/dx, dP/dy)| / texel area, i.e. the
 *   inverse Jacobian of the surface→floor map, via dFdx/dFdy of the original position — and adds it
 *   (additive blending sums the folds). Leaves floating on (or falling toward) the water block that light.
 * Pass 2 (scene): every view ray meets the same surface, splits into a Fresnel reflection of the sky
 *   (with sun glints) and a refracted ray that reaches the tiled floor, which is lit by the caustic texture
 *   and dimmed/tinted by absorption along both paths. Ginkgo leaves float on top.
 * Pass 3 (finish): bloom from the mip chain, tone map, vignette, grain.
 */
import { defineDemo, track, ease, clamp } from '../_lib/stage.js';

// ---------------------------------------------------------------- geometry of the shot (metres)
const DEPTH = 1.2;                                                   // pool depth
const SUN = ((el, az) => [Math.cos(el) * Math.sin(az), Math.cos(el) * Math.cos(az), Math.sin(el)])(58 * Math.PI / 180, -0.47);
const FLOOR_DOM = [-1.45, -0.95, 1.45, 2.75];                        // caustic texture covers this floor area
const CW = 900, CH = 1150;                                           // caustic texture size
const GX = 470, GY = 610;                                            // surface grid vertices
// light landing at floor point Q left the surface near Q + offset (toward the sun); grid covers that area
const SURF_DOM = [FLOOR_DOM[0] - 0.36, FLOOR_DOM[1] + 0.30, FLOOR_DOM[2] - 0.10, FLOOR_DOM[3] + 0.62];

const SURF = `
uniform float t;
uniform vec4 waves[9];        // direction (xy), wavenumber, amplitude
uniform vec4 ring;            // centre (xy), time of touch, amplitude
uniform vec4 leafA, leafB;    // floating leaves: base (xy), angle, size
uniform vec4 leafC;           // the falling leaf: base (xy), height above water, angle
uniform vec2 leafCf;          // its flutter (squash along its axis) and size
// h and its gradient (dh/dx, dh/dy)
vec3 surf(vec2 p) {
  vec3 r = vec3(0.0);
  for (int i = 0; i < 9; i++) {
    vec4 w = waves[i];
    float om = sqrt(9.81 * w.z + 0.074 / 1000.0 * w.z * w.z * w.z) * 0.42;   // gravity–capillary dispersion (slowed for 30 fps)
    float ph = w.z * dot(w.xy, p) - om * t + float(i) * 1.73;
    r.x += w.w * sin(ph);
    r.yz += w.w * w.z * cos(ph) * w.xy;
  }
  float tau = t - ring.z;
  if (tau > 0.0) {                                   // the ripple ring from the leaf's touch: three wave packets
    vec2 d = p - ring.xy;
    float rr = length(d) + 1e-4;
    float decay = ring.w * exp(-tau / 2.6) / sqrt(1.0 + rr / 0.12) * smoothstep(0.0, 0.12, tau);
    for (int j = 0; j < 3; j++) {
      float fj = float(j);
      float v = 0.26 + 0.15 * fj, k = 34.0 - 7.0 * fj, wd = 0.045 + 0.02 * fj;
      float x = rr - v * tau;
      float env = exp(-x * x / (wd * wd)) * decay * (1.0 - 0.3 * fj);
      float hj = env * cos(k * x);
      float dh = env * (-k * sin(k * x) - 2.0 * x / (wd * wd) * cos(k * x)) - hj * 0.5 / (rr + 0.12);
      r.x += hj;
      r.yz += dh * d / rr;
    }
  }
  return r;
}
// ginkgo leaf: approx. signed distance (m) in leaf space (petiole base at origin, blade fanning along +y)
float ginkgo(vec2 q, float R) {
  float rho = length(q), phi = atan(q.x, q.y), ph = abs(phi);
  float edge = R * (0.80 + 0.20 * cos(ph * 1.5)) * (1.0 - 0.26 * exp(-ph * ph / 0.0035)) * (1.0 + 0.025 * sin(phi * 23.0));
  float blade = max(rho - edge, (ph - 1.0) * rho);
  float stem = length(q - vec2(0.0, clamp(q.y, -0.5 * R, 0.0))) - 0.0035;
  return min(blade, stem);
}
vec2 toLeaf(vec2 p, vec2 base, float ang) { float c = cos(ang), s = sin(ang); p -= base; return vec2(c * p.x + s * p.y, -s * p.x + c * p.y); }
`;

// ---------------------------------------------------------------- pass 1: caustics
const CAUS_VERT = `#version 300 es
precision highp float;
in vec2 g;
uniform vec4 surfDom, floorDom;
uniform vec3 Ls;
uniform float eta, depth;
${SURF}
out vec2 P;
out float att;
void main() {
  P = mix(surfDom.xy, surfDom.zw, g);
  vec3 s = surf(P);
  vec3 n = normalize(vec3(-s.y, -s.z, 1.0));
  vec3 T = refract(-Ls, n, eta);
  float len = (depth + s.x) / max(-T.z, 0.05);
  vec2 Q = P + T.xy * len;
  float ci = clamp(dot(Ls, n), 0.0, 1.0);
  att = 1.0 - (0.02 + 0.98 * pow(1.0 - ci, 5.0));            // Fresnel transmission
  gl_Position = vec4((Q - floorDom.xy) / (floorDom.zw - floorDom.xy) * 2.0 - 1.0, 0.0, 1.0);
}`;
const CAUS_FRAG = `#version 300 es
precision highp float;
in vec2 P;
in float att;
uniform float texelArea;
uniform vec3 Ls;
${SURF}
out vec4 o;
// what fraction (and colour) of sunlight gets through the surface at P: leaves block it, a little leaks through warm
vec3 leafMask(vec2 p) {
  vec3 m = vec3(1.0);
  float dA = length(p - leafA.xy) > 0.25 ? 1.0 : ginkgo(toLeaf(p, leafA.xy, leafA.z), leafA.w);
  float dB = length(p - leafB.xy) > 0.25 ? 1.0 : ginkgo(toLeaf(p, leafB.xy, leafB.z), leafB.w);
  // the falling leaf: where the sun ray toward p crosses the leaf's height
  vec2 pc = p + Ls.xy / Ls.z * leafC.z;
  vec2 qc = toLeaf(pc, leafC.xy, leafC.w);
  float dC = leafC.z < 0.0 || length(qc) > 0.3 ? 1.0 : ginkgo(vec2(qc.x / max(leafCf.x, 0.2), qc.y), leafCf.y) * leafCf.x;
  float soft = 0.006 + 0.012 * max(leafC.z, 0.0);             // penumbra widens with height
  vec3 through = vec3(0.30, 0.20, 0.03);                      // light filtered by a thin yellow leaf
  m = mix(m, through, smoothstep(0.004, -0.004, dA));
  m = mix(m, through, smoothstep(0.004, -0.004, dB));
  m = mix(m, through, smoothstep(soft, -soft, dC));
  return m;
}
void main() {
  vec2 dx = dFdx(P), dy = dFdy(P);
  float area = abs(dx.x * dy.y - dx.y * dy.x);                 // surface area that landed on this floor texel
  float I = min(area / texelArea, 40.0) * att;
  o = vec4(I * leafMask(P), 1.0);
}`;

// ---------------------------------------------------------------- pass 2: the scene
const SCENE_FRAG = `#version 300 es
precision highp float;
uniform vec2 stage;
uniform float focal, eta, depth, frameNo, sunGain;
uniform vec3 camPos, camF, camR, camU, Ls;
uniform vec4 floorDom;
uniform sampler2D caus;
uniform vec3 nA, nB, nC;      // the leaves tilt with the water under them (evaluated once per frame in JS)
${SURF}
out vec4 o;
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vnoise(vec2 x) { vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }

// pool floor: 12.5 cm mosaic tiles, grout, and a dark blue lane line ending in a T
vec3 floorAlbedo(vec2 p, float pix) {
  const float TS = 0.125;
  vec2 g = p / TS, id = floor(g), f = fract(g);
  float jit = h21(id + 3.1);
  vec3 tile = mix(vec3(0.70, 0.86, 0.90), vec3(0.80, 0.92, 0.94), jit) * (0.96 + 0.06 * vnoise(p * 60.0));
  float lane = max(step(abs(p.x - 0.30), 0.125) * step(p.y, 2.05), step(abs(p.y - 2.05), 0.125) * step(abs(p.x - 0.30), 0.50));
  tile = mix(tile, vec3(0.05, 0.13, 0.36) * (0.92 + 0.12 * jit), lane);
  // grout lines (anti-aliased by the pixel footprint)
  vec2 e = min(f, 1.0 - f) * TS;
  float gw = 0.0028, aa = pix * 0.8;
  float grout = 1.0 - smoothstep(gw - aa, gw + aa, min(e.x, e.y));
  return mix(tile, vec3(0.42, 0.52, 0.56), grout * 0.85);
}
vec3 skyCol(vec3 r) {
  vec3 c = mix(vec3(0.62, 0.74, 0.86), vec3(0.30, 0.48, 0.78), smoothstep(0.1, 0.9, r.z));
  float sd = max(dot(r, Ls), 0.0);
  return c + vec3(1.0, 0.92, 0.80) * (pow(sd, 40.0) * 0.6);
}
// leaf colour with light: sun through/on the leaf, veins, a wet sheen
vec4 leafLook(vec2 q, float R, float sd, float pix, vec3 n, vec3 rd, float hue) {
  float cov = clamp(0.5 - sd / pix, 0.0, 1.0);
  if (cov <= 0.0) return vec4(0.0);
  float phi = atan(q.x, q.y), rho = length(q);
  vec3 base = mix(vec3(0.93, 0.56, 0.05), vec3(0.80, 0.64, 0.10), hue);
  float vein = smoothstep(0.35, 0.0, abs(fract(phi * 9.5 + 0.5) - 0.5)) * smoothstep(0.1 * R, 0.5 * R, rho);
  base *= 1.0 - 0.18 * vein;
  base = mix(base, vec3(0.62, 0.38, 0.05), smoothstep(0.75 * R, R, rho) * 0.35);   // toasted rim
  base *= 0.9 + 0.2 * vnoise(q * 140.0);
  base *= 0.82 + 0.25 * smoothstep(0.0, R, rho);                                     // paler toward the fan's edge
  base *= 1.0 - 0.35 * smoothstep(-2.5 * pix, -0.5 * pix, sd);                      // thin darker rim
  float diff = max(dot(n, Ls), 0.0);
  vec3 c = base * (0.28 + 1.0 * diff) * vec3(1.0, 0.97, 0.9) + base * base * 0.25;   // + sun glowing through
  float spec = pow(max(dot(reflect(rd, n), Ls), 0.0), 60.0) * 0.25;
  return vec4(c + spec, cov);
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec3 rd = normalize(camF * focal + camR * (px.x - 0.5 * stage.x) + camU * (px.y - 0.5 * stage.y));
  // the water surface: plane hit, then one refinement on the heightfield
  float tt = -camPos.z / rd.z;
  vec2 P = camPos.xy + rd.xy * tt;
  vec3 s = surf(P);
  tt = (s.x - camPos.z) / rd.z;
  P = camPos.xy + rd.xy * tt;
  s = surf(P);
  vec3 n = normalize(vec3(-s.y, -s.z, 1.0));
  float pixS = tt / focal;                                    // metres per pixel at the surface
  float cosi = clamp(-dot(rd, n), 0.0, 1.0);
  float F = 0.02 + 0.98 * pow(1.0 - cosi, 5.0);
  vec3 R = reflect(rd, n);
  vec3 refl = skyCol(R);
  // refracted view ray → floor
  vec3 Tv = refract(rd, n, eta);
  float len = (depth + s.x) / max(-Tv.z, 0.05);
  vec2 Fp = P + Tv.xy * len;
  float pixF = pixS * (1.0 + len / tt * 1.3);
  vec3 alb = floorAlbedo(Fp, pixF);
  vec2 cu = (Fp - floorDom.xy) / (floorDom.zw - floorDom.xy);
  vec3 c = textureLod(caus, cu, 0.6).rgb;
  vec3 E = vec3(0.075, 0.115, 0.145) + vec3(1.0, 0.95, 0.86) * c * sunGain;
  vec3 sigma = vec3(0.58, 0.11, 0.05);                      // absorption per metre (red goes first)
  float lenSun = depth / 0.92;
  vec3 under = alb * E * exp(-sigma * (len + lenSun));
  under += vec3(0.010, 0.060, 0.085) * (1.0 - exp(-0.8 * len));  // in-scattered blue-green
  vec3 col = mix(under, refl * 0.55, F);
  // sun glints: the sun's mirror image in the facets
  float sd = max(dot(R, Ls), 0.0);
  col += vec3(1.0, 0.95, 0.85) * pow(sd, 9000.0) * 40.0 * F / 0.04;
  // leaves on the water (they ride the local surface normal)
  vec2 qA = toLeaf(P, leafA.xy, leafA.z), qB = toLeaf(P, leafB.xy, leafB.z);
  vec4 la = leafLook(qA, leafA.w, ginkgo(qA, leafA.w), pixS, nA, rd, 0.0);
  vec4 lb = leafLook(qB, leafB.w, ginkgo(qB, leafB.w), pixS, nB, rd, 0.7);
  col = mix(col, la.rgb, la.a);
  col = mix(col, lb.rgb, lb.a);
  // the falling leaf, above the water: intersect its height plane
  if (leafC.z >= 0.0) {
    float tc = (leafC.z - camPos.z) / rd.z;
    vec2 pc = camPos.xy + rd.xy * tc;
    vec2 qc = toLeaf(pc, leafC.xy, leafC.w);
    vec2 qs = vec2(qc.x / max(leafCf.x, 0.2), qc.y);
    float dC = ginkgo(qs, leafCf.y) * leafCf.x;
    vec4 lc = leafLook(qs, leafCf.y, dC, tc / focal * 1.2, nC, rd, 0.35);
    col = mix(col, lc.rgb, lc.a);
  }
  o = vec4(min(col, vec3(6.0)), 1.0);         // cap HDR so the mip bloom stays a glow, not a blot
}`;

// ---------------------------------------------------------------- pass 3: finish
const FINISH_FRAG = `#version 300 es
precision highp float;
uniform sampler2D img;
uniform vec2 stage;
uniform float frameNo, fade, expo;
out vec4 o;
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
void main() {
  vec2 px = gl_FragCoord.xy, uv = px / stage;
  vec3 c = textureLod(img, uv, 0.0).rgb;
  vec3 b = textureLod(img, uv, 2.0).rgb * 0.30 + textureLod(img, uv, 3.5).rgb * 0.30 + textureLod(img, uv, 5.0).rgb * 0.30;
  vec3 hot = max(b - 0.9, 0.0);
  c += hot * 0.45 + b * 0.07;
  c *= expo;
  c = 1.0 - exp(-c * 1.1);
  c = pow(c, vec3(1.0 / 2.2));
  c = mix(c, c * c * (3.0 - 2.0 * c), 0.25);                 // gentle S-curve
  vec2 q = uv - 0.5;
  c *= 1.0 - 0.42 * pow(length(q * vec2(1.15, 0.9)), 2.3);
  c *= fade;
  c += (h21(px + frameNo * 7.13) - 0.5) / 255.0 * 1.5;
  o = vec4(c, 1.0);
}`;

const QUAD_VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

// ---------------------------------------------------------------- timeline
const D = 9;
const T_LAND = 5.2;
const fade = track([[0, 0], [0.9, 1, ease.outCubic], [8.5, 1], [D, 0, ease.inCubic]]);
const sunGain = track([[0, 0.5], [2.0, 1.95, ease.inOutCubic], [D, 1.95]]);
// the breeze builds, then stills just before the leaf touches down, so its rings read clearly; then returns
const waveAmp = track([[0, 0.50], [1.8, 0.72, ease.inOutCubic], [3.8, 0.70], [5.1, 0.40, ease.inOutCubic], [7.2, 0.42], [D, 0.56, ease.inOutCubic]]);
const camH = track([[0, 2.75], [D, 2.35, ease.inOutCubic]]);
const camY = track([[0, -0.70], [D, -0.55, ease.inOutCubic]]);
// the falling leaf: from high above the frame's upper right, spiralling down to touch at T_LAND
const T_FALL = 3.0;
// (high above the water the visible patch is small, so it starts almost over its landing point and drifts in)
const fallZ = track([[T_FALL, 1.2], [T_LAND, 0.0, (p) => 1 - Math.pow(1 - p, 1.25)]]);
const fallX = track([[T_FALL, 0.47], [T_LAND, 0.10, ease.inOutCubic], [D, 0.07]]);
const fallY = track([[T_FALL, 0.80], [T_LAND, 0.62, ease.outCubic], [D, 0.66]]);
const fallA = track([[T_FALL, 2.6], [T_LAND, -0.55, ease.outCubic], [D, -0.75]]);
// flutter: the leaf rocks (seen squashed along its axis) and settles flat just before touching down
const flutter = (t) => (t < T_LAND ? 1 - (0.5 - 0.5 * Math.cos((t - T_FALL) * 6.0)) * 0.6 * (1 - clamp((t - 4.5) / 0.6)) : 1);

// the same heightfield gradient as the shader's surf(), for the leaves' tilt (once per frame)
function surfGrad(p, t, amp, ringW) {
  let gx = 0, gy = 0;
  for (let i = 0; i < 9; i++) {
    const [dx, dy, k, a0] = WAVES.slice(i * 4, i * 4 + 4), a = a0 * amp;
    const om = Math.sqrt(9.81 * k + 0.074 / 1000 * k * k * k) * 0.42;
    const c = Math.cos(k * (dx * p[0] + dy * p[1]) - om * t + i * 1.73);
    gx += a * k * c * dx; gy += a * k * c * dy;
  }
  const tau = t - T_LAND;
  if (tau > 0) {
    const d = [p[0] - fallX(T_LAND), p[1] - fallY(T_LAND)], rr = Math.hypot(...d) + 1e-4;
    const decay = ringW * Math.exp(-tau / 2.6) / Math.sqrt(1 + rr / 0.12) * ((x) => x * x * (3 - 2 * x))(clamp(tau / 0.12));
    for (let j = 0; j < 3; j++) {
      const v = 0.26 + 0.15 * j, k = 34 - 7 * j, wd = 0.045 + 0.02 * j, x = rr - v * tau;
      const env = Math.exp(-x * x / (wd * wd)) * decay * (1 - 0.3 * j);
      const hj = env * Math.cos(k * x);
      const dh = env * (-k * Math.sin(k * x) - 2 * x / (wd * wd) * Math.cos(k * x)) - hj * 0.5 / (rr + 0.12);
      gx += dh * d[0] / rr; gy += dh * d[1] / rr;
    }
  }
  const l = Math.hypot(gx, gy, 1);
  return [-gx / l, -gy / l, 1 / l];
}
const WAVES = (() => {
  // a light breeze from the upper left: one long swell + short ripples (6–30 cm). Short ripples carry the
  // curvature that focuses light (focal length n/((n−1)κ) ≈ 0.9 m < depth) while keeping slopes small.
  const out = [];
  const spec = [[-0.55, 0.90, 0.0030], [-0.62, 0.30, 0.0019], [-0.30, 0.22, 0.0015], [-0.88, 0.17, 0.0011], [-0.12, 0.13, 0.00080],
                [-0.98, 0.105, 0.00055], [-0.45, 0.085, 0.00036], [-0.20, 0.070, 0.00026], [-0.75, 0.060, 0.00020]];
  for (const [ang, lam, amp] of spec) { const a = ang - Math.PI / 2; out.push(Math.cos(a), Math.sin(a), 2 * Math.PI / lam, amp); }
  return out;
})();

defineDemo({
  id: '08-caustics',
  title: '수영장 바닥의 빛',
  tech: 'WebGL2 셰이더 · 굴절 코스틱',
  duration: D,
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float missing');
    gl.getExtension('EXT_float_blend');
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const program = (vs, fs, attr, names) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, attr);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const U = {};
      for (const n of names) U[n] = gl.getUniformLocation(p, n);
      return { p, U };
    };
    const surfU = ['t', 'waves', 'ring', 'leafA', 'leafB', 'leafC', 'leafCf'];
    const P1 = program(CAUS_VERT, CAUS_FRAG, 'g', [...surfU, 'surfDom', 'floorDom', 'Ls', 'eta', 'depth', 'texelArea']);
    const P2 = program(QUAD_VERT, SCENE_FRAG, 'p', [...surfU, 'stage', 'focal', 'eta', 'depth', 'frameNo', 'sunGain', 'camPos', 'camF', 'camR', 'camU', 'Ls', 'floorDom', 'caus', 'nA', 'nB', 'nC']);
    const P3 = program(QUAD_VERT, FINISH_FRAG, 'p', ['img', 'stage', 'frameNo', 'fade', 'expo']);

    // the surface grid (static): GX × GY vertices in [0,1]², two triangles per cell
    const gridVao = gl.createVertexArray();
    gl.bindVertexArray(gridVao);
    const gv = new Float32Array(GX * GY * 2);
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) { gv[(j * GX + i) * 2] = i / (GX - 1); gv[(j * GX + i) * 2 + 1] = j / (GY - 1); }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, gv, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const idx = new Uint32Array((GX - 1) * (GY - 1) * 6);
    let k = 0;
    for (let j = 0; j < GY - 1; j++) for (let i = 0; i < GX - 1; i++) {
      const a = j * GX + i, b = a + 1, c = a + GX, d = c + 1;
      idx[k++] = a; idx[k++] = b; idx[k++] = d; idx[k++] = a; idx[k++] = d; idx[k++] = c;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    const quadVao = gl.createVertexArray();
    gl.bindVertexArray(quadVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const target = (w, h, mips) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texStorage2D(gl.TEXTURE_2D, mips ? 1 + Math.floor(Math.log2(Math.max(w, h))) : 2, gl.RGBA16F, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('fbo incomplete');
      return { tex, fbo, w, h };
    };
    const causT = target(CW, CH, false);
    const sceneT = target(W, H, true);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const focal = 960 / Math.tan((46 / 2) * Math.PI / 180);
    const texelArea = ((FLOOR_DOM[2] - FLOOR_DOM[0]) / CW) * ((FLOOR_DOM[3] - FLOOR_DOM[1]) / CH);
    const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

    const RING_W = 0.0080;
    const leafPos = {};
    const setSurf = (U, t) => {
      gl.uniform1f(U.t, t);
      const amp = waveAmp(t);
      gl.uniform4fv(U.waves, WAVES.map((v, i) => (i % 4 === 3 ? v * amp : v)));
      gl.uniform4f(U.ring, fallX(T_LAND), fallY(T_LAND), T_LAND, RING_W);
      leafPos.A = [-0.36 + 0.012 * t, 0.02 + 0.010 * t + 0.004 * Math.sin(t * 0.9)];
      leafPos.B = [-0.52 + 0.010 * t, 1.42 - 0.008 * t];
      gl.uniform4f(U.leafA, ...leafPos.A, 0.45 + 0.05 * Math.sin(t * 0.5), 0.125);
      gl.uniform4f(U.leafB, ...leafPos.B, -2.35 + 0.04 * t, 0.115);
      gl.uniform4f(U.leafC, fallX(t), fallY(t), t < T_FALL ? -1 : t < T_LAND ? fallZ(t) : 0, fallA(t));
      gl.uniform2f(U.leafCf, flutter(t), 0.12);
    };

    this.draw = (t) => {
      // pass 1: caustics
      gl.bindFramebuffer(gl.FRAMEBUFFER, causT.fbo);
      gl.viewport(0, 0, CW, CH);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(P1.p);
      setSurf(P1.U, t);
      gl.uniform4fv(P1.U.surfDom, SURF_DOM);
      gl.uniform4fv(P1.U.floorDom, FLOOR_DOM);
      gl.uniform3fv(P1.U.Ls, SUN);
      gl.uniform1f(P1.U.eta, 1 / 1.333);
      gl.uniform1f(P1.U.depth, DEPTH);
      gl.uniform1f(P1.U.texelArea, texelArea);
      gl.bindVertexArray(gridVao);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_INT, 0);
      gl.disable(gl.BLEND);
      // pass 2: scene → float texture
      gl.bindVertexArray(quadVao);
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneT.fbo);
      gl.viewport(0, 0, W, H);
      gl.useProgram(P2.p);
      setSurf(P2.U, t);
      const pos = [0, camY(t), camH(t)], target3 = [0.02, 0.36, 0];
      const F = norm(target3.map((x, i) => x - pos[i]));
      const R = norm(cross(F, [0, 0, 1]));
      const Up = cross(R, F);
      gl.uniform2f(P2.U.stage, W, H);
      gl.uniform1f(P2.U.focal, focal);
      gl.uniform1f(P2.U.eta, 1 / 1.333);
      gl.uniform1f(P2.U.depth, DEPTH);
      gl.uniform1f(P2.U.frameNo, Math.round(t * 30));
      gl.uniform1f(P2.U.sunGain, sunGain(t));
      gl.uniform3fv(P2.U.camPos, pos);
      gl.uniform3fv(P2.U.camF, F); gl.uniform3fv(P2.U.camR, R); gl.uniform3fv(P2.U.camU, Up);
      gl.uniform3fv(P2.U.Ls, SUN);
      gl.uniform4fv(P2.U.floorDom, FLOOR_DOM);
      const amp = waveAmp(t);
      gl.uniform3fv(P2.U.nA, surfGrad(leafPos.A, t, amp, RING_W));
      gl.uniform3fv(P2.U.nB, surfGrad(leafPos.B, t, amp, RING_W));
      gl.uniform3fv(P2.U.nC, t < T_LAND ? (() => { const f = flutter(t); const l = Math.hypot(0.25 * (1 - f), 0.15, 1); return [0.25 * (1 - f) / l, 0.15 / l, 1 / l]; })()
        : surfGrad([fallX(t), fallY(t)], t, amp, RING_W));
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, causT.tex);
      gl.uniform1i(P2.U.caus, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindTexture(gl.TEXTURE_2D, sceneT.tex);
      gl.generateMipmap(gl.TEXTURE_2D);
      // pass 3: finish to the canvas
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(P3.p);
      gl.uniform1i(P3.U.img, 0);
      gl.uniform2f(P3.U.stage, W, H);
      gl.uniform1f(P3.U.frameNo, Math.round(t * 30));
      gl.uniform1f(P3.U.fade, fade(t));
      gl.uniform1f(P3.U.expo, 1.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  },
  frame(t) { this.draw(t); },
});
