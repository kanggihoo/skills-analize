/*
 * 09 · 20만 개의 별 — a spiral galaxy as ~216,000 GPU point sprites.
 * Every star's position is a closed-form function of (its attributes, t) evaluated in the vertex shader:
 * differential rotation ω(r) moves it around the centre, and a density-wave map squeezes its angle toward
 * the logarithmic arms (stars slow down where the pattern is), so the arms persist while stars stream
 * through them. Passes (all into one RGBA16F HDR target): sky → diffuse disk + bulge (ray–plane / line
 * integrals) → stars (additive) → dust (alpha "over", darkens) → HII knots + young clusters (additive),
 * then a mip-chain bloom and a filmic tone map onto the canvas.
 */
import { defineDemo, rand, track, ease, clamp, lerp } from '../_lib/stage.js';

const D = 10;
// ---- the galaxy model (shared by JS and GLSL) ----
const ARMS = 2, TANP = 0.31, R0 = 0.1, OMP = 1.0, V0 = 1.0, RC = 0.12, SENSE = -1;
const omega = (r) => (V0 * (1 - Math.exp(-r / RC))) / Math.max(r, 1e-3);
const armPhi = (r) => Math.log(Math.max(r, 0.02) / R0) / TANP;
const patAng = (tau) => SENSE * OMP * tau;
// the same arm wiggle / clump functions as the GLSL below, for placing dust, HII and the camera
const wig = (r, j) => 0.34 * Math.sin(7 * r + 2.4 * j + 0.5) + 0.2 * Math.sin(19 * r + 4.1 * j) + 0.1 * Math.sin(43 * r + 1.7 * j);
const clumps = (r, j) => { const s = 0.5 + 0.5 * Math.sin(29 * r + 5 * j + 1.3 * Math.sin(11 * r)); return 0.25 + 0.95 * s * s * s; };
/** pattern-frame angle of phase psi from arm j at radius r */
const armAt = (r, psi, j) => armPhi(r) + (psi + wig(r, j) + 2 * Math.PI * j) / ARMS;

const COMMON = `#version 300 es
precision highp float;
const float ARMS = ${ARMS.toFixed(1)}, TANP = ${TANP}, R0 = ${R0}, OMP = ${OMP.toFixed(1)}, V0 = ${V0.toFixed(1)}, RC = ${RC}, SENSE = ${SENSE.toFixed(1)};
const float TAU2 = 6.2831853;
uniform float uTau;
float omega(float r) { return V0 * (1.0 - exp(-r / RC)) / max(r, 1e-3); }
float armPhi(float r) { return log(max(r, 0.02) / R0) / TANP; }
float patAng() { return SENSE * OMP * uTau; }
// each arm wanders around the ideal log spiral and is brighter in clumps (functions of r and arm index j)
float wig(float r, float j) { return 0.34 * sin(7.0 * r + 2.4 * j + 0.5) + 0.2 * sin(19.0 * r + 4.1 * j) + 0.1 * sin(43.0 * r + 1.7 * j); }
float clumps(float r, float j) { float s = 0.5 + 0.5 * sin(29.0 * r + 5.0 * j + 1.3 * sin(11.0 * r)); return 0.25 + 0.95 * s * s * s; }
// phase measured from the (wiggled) arm; w0 blends smoothly between arm 0 and arm 1
float armPsi(float psiU, float r, out float w0) {
  w0 = 0.5 + 0.5 * cos(psiU * 0.5);
  return psiU - mix(wig(r, 1.0), wig(r, 0.0), w0);
}
`;

// ---------- stars: closed-form orbits ----------
const STAR_VS = COMMON + `
layout(location=0) in vec4 aOrb;   // r, theta0, height, arm squeeze A
layout(location=1) in vec4 aCol;   // rgb, luminosity
layout(location=2) in vec2 aKind;  // young (0/1), unused
uniform mat4 uVP;
uniform float uGain, uFocus, uAperture;
out vec3 vCol; out float vSig, vSize, vR, vDisc;
void main() {
  float r = aOrb.x, om = omega(r);
  float thu = aOrb.y + SENSE * om * uTau;               // differential rotation
  float w0;
  float psi = armPsi(ARMS * (thu - armPhi(r) - patAng()), r, w0);   // phase relative to the arm pattern
  float th = thu - aOrb.w / ARMS * sin(psi);            // density wave: bunch up near psi = 0
  vec3 p = vec3(r * cos(th), aOrb.z, r * sin(th));
  float L = aCol.w;
  if (aKind.x > 0.5) {
    // young stars: born where the gas crosses the arm, fade as they drift away from it
    float rate = sign(SENSE * (om - OMP));
    float age = mod(psi * rate + 0.5, TAU2) - 0.5;
    L *= smoothstep(-0.5, 0.0, age) * exp(-max(age, 0.0) / 1.0);
    L *= mix(clumps(r, 1.0), clumps(r, 0.0), w0);
  }
  vec4 c = uVP * vec4(p, 1.0);
  float w = max(c.w, 1e-3);
  float flux = L * uGain / (w * w + 0.0015);
  float sig = clamp(0.62 + 0.42 * log(1.0 + flux * 0.6), 0.62, 3.6);
  // depth of field: stars far from the focus plane spread their (conserved) flux over a bokeh disc
  float coc = min(uAperture * abs(1.0 - uFocus / w), 34.0);
  vDisc = smoothstep(2.5, 6.0, coc);
  vR = max(coc, 1.0);
  float size = max(ceil(sig * 5.0) + 1.0, vDisc > 0.0 ? ceil(2.0 * coc + 3.0) : 0.0);
  gl_PointSize = size;
  vSize = size; vSig = sig;
  vCol = aCol.rgb * flux;
  gl_Position = c;
}`;
const STAR_FS = `#version 300 es
precision highp float;
in vec3 vCol; in float vSig, vSize, vR, vDisc;
out vec4 o;
void main() {
  vec2 d = (gl_PointCoord - 0.5) * vSize;
  float r2 = dot(d, d);
  float g = exp(-r2 / (2.0 * vSig * vSig)) / (6.2831853 * vSig * vSig);
  if (vDisc > 0.0) {               // a lens-like bokeh disc with a slightly brighter rim
    float r = sqrt(r2);
    float disc = smoothstep(vR + 0.8, vR - 0.8, r) * (0.7 + 0.3 * smoothstep(0.4 * vR, vR, r)) / (3.1415927 * vR * vR * 0.8);
    g = mix(g, disc, vDisc);
  }
  o = vec4(vCol * g, 1.0);
}`;

// ---------- extended sprites that live in the pattern frame: dust (over) and HII (additive) ----------
const BLOB_VS = COMMON + `
layout(location=0) in vec4 aOrb;   // r, angle in pattern frame, height, world size
layout(location=1) in vec4 aCol;   // rgb, alpha / intensity
uniform mat4 uVP;
uniform float uPx, uMaxPx;
out vec4 vCol;
void main() {
  float r = aOrb.x;
  float th = aOrb.y + patAng() + SENSE * (omega(r) - OMP) * uTau * 0.12;   // gas lags the pattern a little
  vec4 c = uVP * vec4(r * cos(th), aOrb.z, r * sin(th), 1.0);
  float w = max(c.w, 1e-3);
  float px = aOrb.w * uPx / w;
  float a = aCol.w * min(1.0, px * px / 4.0);           // below 2 px: keep the size, shrink the coverage
  a *= smoothstep(uMaxPx, uMaxPx * 0.45, px);            // very near blobs dissolve instead of covering the lens
  gl_PointSize = clamp(px, 2.0, uMaxPx);
  vCol = vec4(aCol.rgb, a);
  gl_Position = c;
}`;
const DUST_FS = `#version 300 es
precision highp float;
in vec4 vCol; out vec4 o;
void main() {
  vec2 d = gl_PointCoord * 2.0 - 1.0;
  float q = dot(d, d);
  float prof = q < 1.0 ? exp(-q * 2.6) * (1.0 - q) : 0.0;
  o = vec4(vCol.rgb, vCol.a * prof);
}`;
const GLOW_FS = `#version 300 es
precision highp float;
in vec4 vCol; out vec4 o;
void main() {
  vec2 d = gl_PointCoord * 2.0 - 1.0;
  float q = dot(d, d);
  float prof = q < 1.0 ? exp(-q * 4.0) * (1.0 - q) : 0.0;
  o = vec4(vCol.rgb * vCol.a * prof, 1.0);
}`;

// ---------- background sky (directions at infinity) + a few foreground stars with spikes ----------
const SKY_VS = `#version 300 es
precision highp float;
layout(location=0) in vec4 aDir;   // xyz direction, spike (0/1)
layout(location=1) in vec4 aCol;   // rgb, flux
uniform mat4 uVP; uniform float uSkyGain;
out vec3 vCol; out float vSig, vSize, vSpike;
void main() {
  vec4 c = uVP * vec4(aDir.xyz, 0.0);
  gl_Position = vec4(c.xy, 0.0, c.w);
  float flux = aCol.w * uSkyGain;
  vSpike = aDir.w;
  vSig = clamp(0.6 + 0.35 * log(1.0 + flux), 0.6, 2.4);
  vSize = aDir.w > 0.5 ? 150.0 : ceil(vSig * 5.0) + 1.0;
  gl_PointSize = vSize;
  vCol = aCol.rgb * flux / (6.2831853 * vSig * vSig);
}`;
const SKY_FS = `#version 300 es
precision highp float;
in vec3 vCol; in float vSig, vSize, vSpike; out vec4 o;
void main() {
  vec2 d = (gl_PointCoord - 0.5) * vSize;
  float g = exp(-dot(d, d) / (2.0 * vSig * vSig));
  if (vSpike > 0.5) {
    vec2 a = abs(d);
    float spikes = exp(-a.x * 1.4) * exp(-a.y * 0.05) + exp(-a.y * 1.4) * exp(-a.x * 0.05);
    g += 0.012 * spikes * smoothstep(75.0, 20.0, length(d)) + 0.02 * exp(-length(d) * 0.18);
  }
  o = vec4(vCol * g, 1.0);
}`;

// ---------- full-screen passes ----------
const FS_VS = `#version 300 es
layout(location=0) in vec2 p; out vec2 uv;
void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0, 1); }`;

// unresolved starlight: the exponential disk (ray ∩ plane) and the bulge (line integral of 3 gaussians)
const DIFFUSE_FS = COMMON + `
in vec2 uv; out vec4 o;
uniform vec3 uEye, uRight, uUp, uFwd; uniform vec2 uTan; uniform float uDisk, uBulge;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.3; a *= 0.5; } return s; }
// ∫ gaussian blob of radius b centred at origin along ray e + s d, s ≥ 0  (d unit)
float lineGauss(vec3 e, vec3 d, float b) {
  float s0 = -dot(e, d);
  float d2 = dot(e, e) - s0 * s0;
  float tail = 0.5 + 0.5 * tanh(clamp(1.13 * s0 / b, -9.0, 9.0));   // ≈ (1 + erf(s0 / b)) / 2 (clamped: SwiftShader's tanh overflows to NaN)
  return 1.7725 * b * exp(-d2 / (b * b)) * tail;
}
void main() {
  vec2 ndc = uv * 2.0 - 1.0;
  vec3 dir = normalize(uFwd + ndc.x * uTan.x * uRight + ndc.y * uTan.y * uUp);
  vec3 col = vec3(0.0);
  float s = -uEye.y / dir.y;
  if (s > 0.0) {
    vec3 p = uEye + dir * s;
    float r = length(p.xz);
    float th = atan(p.z, p.x);
    float w0;
    float psi = armPsi(ARMS * (th - armPhi(r) - patAng()), r, w0);
    float cp = cos(psi);
    float old = 0.866 / (1.0 - 0.5 * cp);
    float arm = exp((cp - 1.0) * 3.0) * mix(clumps(r, 1.0), clumps(r, 0.0), w0);   // the young arm band
    float lane = exp((cos(psi - 0.42) - 1.0) * 45.0);                // dust lane on the concave edge
    float a = th - patAng();
    vec2 q = vec2(cos(a), sin(a)) * r;                                // pattern-frame coordinates
    float n = fbm(q * 11.0 + 3.0);
    float sb = exp(-r / 0.24) * smoothstep(1.25, 0.5, r) * (0.45 + 0.55 * smoothstep(0.02, 0.16, r));
    float sy = exp(-r / 0.55) * smoothstep(1.15, 0.7, r) * smoothstep(0.1, 0.3, r);
    vec3 c = vec3(1.0, 0.8, 0.58) * old * sb * 1.1
           + vec3(0.42, 0.6, 1.0) * arm * sy * (0.4 + 1.2 * n * n) * 1.5;
    c *= 1.0 - 0.55 * lane * smoothstep(0.1, 0.25, r) * smoothstep(0.25, 0.6, n);
    float path = 1.0 / max(abs(dir.y), 0.07);
    col += c * min(path, 2.6) * 0.5 * uDisk;
  }
  // the bulge: flattened, three nested gaussians (a cuspy, warm core)
  vec3 e = uEye * vec3(1.0, 1.35, 1.0), d = dir * vec3(1.0, 1.35, 1.0);
  float dl = length(d); d /= dl;
  float b = 0.9 * lineGauss(e, d, 0.022) / 0.022 + 0.42 * lineGauss(e, d, 0.065) / 0.065 + 0.13 * lineGauss(e, d, 0.17) / 0.17;
  col += vec3(1.0, 0.74, 0.46) * b * 0.8 * uBulge;
  o = vec4(col, 1.0);
}`;

// 13-tap downsample (Jimenez 2014) and 3×3 tent upsample for the bloom chain
const DOWN_FS = `#version 300 es
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
const UP_FS = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o; uniform sampler2D src; uniform vec2 texel; uniform float k;
vec3 s(vec2 o2) { return texture(src, uv + o2 * texel).rgb; }
void main() {
  vec3 c = s(vec2(0)) * 4.0;
  c += (s(vec2(-1, 0)) + s(vec2(1, 0)) + s(vec2(0, -1)) + s(vec2(0, 1))) * 2.0;
  c += s(vec2(-1, -1)) + s(vec2(1, -1)) + s(vec2(-1, 1)) + s(vec2(1, 1));
  o = vec4(c / 16.0 * k, 1.0);
}`;
const COMP_FS = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform sampler2D hdr, bloom; uniform float uExp, uBloomK, uFrame;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main() {
  vec3 c = texture(hdr, uv).rgb + texture(bloom, uv).rgb * uBloomK;
  c += vec3(0.0016, 0.0022, 0.0045) * (1.0 - 0.6 * length(uv - vec2(0.5, 0.45)));   // a deep blue sky floor
  c = aces(c * uExp);
  vec2 v = (uv - 0.5) * vec2(1.0, 1.4);
  c *= 1.0 - 0.32 * pow(dot(v, v) * 1.6, 1.4);
  c = pow(c, vec3(1.0 / 2.2));
  c += (hash(gl_FragCoord.xy + uFrame * 7.13) - 0.5) * 0.012;
  o = vec4(c, 1.0);
}`;

// ---------- small matrix helpers (column-major) ----------
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function mul4(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
    o[c * 4 + r] = s;
  }
  return o;
}

// ---------- the camera story ----------
const tau = track([[0, 0], [D, 0.95, (p) => p * (1.25 - 0.25 * p)]]);          // galactic time (slowly decelerating)
const dive = track([[1.4, 0], [6.4, 1, ease.inOutCubic]]);                        // wide establishing shot → above the arm
const glide = track([[5.3, 0], [9.9, 1, ease.inOutCubic]]);                       // … then across the arm toward the core
const exposure = track([[0, 0], [1.8, 1, ease.outCubic], [4.5, 1.0], [7, 0.82], [D, 0.75]]);
// the close shots live in the pattern frame (they co-rotate with the arms): polar (r, angle, height)
const RA = 0.5, AA = armAt(RA, 0.15, 0);
const A_EYE = [0.8, AA + 0.05, 0.17], A_TGT = [0.27, AA + 0.05, 0.0];
const B_EYE = [0.63, AA + 0.08, 0.085], B_TGT = [0.08, AA + 0.08, 0.02];
const polar = ([r, a, y], rot) => [r * Math.cos(a + rot), y, r * Math.sin(a + rot)];
const mix3 = (a, b, k) => a.map((x, i) => lerp(x, b[i], k));

function camera(t) {
  const k = dive(t), g = glide(t), T = tau(t), rot = patAng(T);
  // wide: inertial, looking at the centre from far and high
  const az = 2.3 + 0.04 * t, el = 0.62;
  const dir0 = [Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)];
  const d0 = lerp(4.5, 3.85, ease.outCubic(clamp(t / 1.6)));
  // close: riding the density wave above the arm, then gliding over it
  const e1 = polar(mix3(A_EYE, B_EYE, g), rot), t1 = polar(mix3(A_TGT, B_TGT, g), rot);
  const v1 = sub(e1, t1), d1 = Math.hypot(...v1), dir1 = v1.map((x) => x / d1);
  const kd = ease.inOutCubic(k);
  const tgt = t1.map((x) => x * k);
  const dir = norm(dir0.map((x, i) => lerp(x, dir1[i], kd)));
  const dist = Math.exp(lerp(Math.log(d0), Math.log(d1), k));               // constant relative speed
  const eye = tgt.map((x, i) => x + dir[i] * dist);
  return { eye, tgt, shift: 0.2 * (1 - kd), roll: lerp(1.15, 0.12, kd) - 0.1 * g, fov: lerp(36, 50, kd) * Math.PI / 180, focus: dist, aperture: 6 * k * k };
}

defineDemo({
  id: '09-gpu-galaxy',
  title: '20만 개의 별',
  tech: 'WebGL2 포인트 스프라이트 · 버텍스 셰이더 궤도',
  duration: D,
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('no float render targets');
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n'));
      return s;
    };
    const program = (vs, fs) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) {
        const name = gl.getActiveUniform(p, i).name;
        u[name] = gl.getUniformLocation(p, name);
      }
      return { p, u };
    };
    const P = {
      star: program(STAR_VS, STAR_FS), dust: program(BLOB_VS, DUST_FS), glow: program(BLOB_VS, GLOW_FS),
      sky: program(SKY_VS, SKY_FS), diffuse: program(FS_VS, DIFFUSE_FS),
      down: program(FS_VS, DOWN_FS), up: program(FS_VS, UP_FS), comp: program(FS_VS, COMP_FS),
    };
    // interleaved float buffer → VAO with the given attribute sizes
    const vao = (data, sizes) => {
      const v = gl.createVertexArray();
      gl.bindVertexArray(v);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const stride = sizes.reduce((a, b) => a + b, 0) * 4;
      let off = 0;
      sizes.forEach((n, i) => { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, n, gl.FLOAT, false, stride, off); off += n * 4; });
      gl.bindVertexArray(null);
      return { v, count: data.length / (stride / 4) };
    };

    // ---------- the population (seeded) ----------
    const R = rand(20241029);
    const gauss = () => Math.sqrt(-2 * Math.log(R() + 1e-12)) * Math.cos(2 * Math.PI * R());
    const lap = () => (R() < 0.5 ? -1 : 1) * -Math.log(R() + 1e-12);   // Laplace (exponential disk height)
    const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    const stars = [];
    const push = (r, th, y, A, col, L, young) => stars.push(r, th, y, A, col[0], col[1], col[2], L, young, 0);
    const lum = (k, a, cap) => Math.min(cap, k * Math.pow(R() + 0.002, -a));   // heavy-tailed: many faint, few bright
    const N_OLD = 104000, N_YOUNG = 58000, N_BULGE = 46000, N_HALO = 2000;
    for (let i = 0; i < N_OLD; i++) {            // old disk: exponential, warm, gently bunched
      let r; do { r = -0.26 * Math.log(R() * R() + 1e-12); } while (r > 1.25 || r < 0.02);
      const c = mixc([1.0, 0.72, 0.48], [1.0, 0.92, 0.82], R());
      push(r, R() * 6.2832, lap() * 0.009 * (1 + r), 0.45 + 0.2 * R(), c, lum(0.07, 0.95, 30), 0);
    }
    for (let i = 0; i < N_YOUNG; i++) {          // young: in the arms, blue-white, short-lived
      let r; do { r = 0.1 + -0.32 * Math.log(R() + 1e-12); } while (r > 1.15);
      const c = mixc([0.42, 0.6, 1.0], [0.85, 0.92, 1.0], R() * R());
      push(r, R() * 6.2832, lap() * 0.004, 0.84 + 0.12 * R(), c, lum(0.5, 1.1, 400), 1);
    }
    for (let i = 0; i < N_BULGE; i++) {          // bulge: Hernquist sphere, flattened, warm
      let rs; do { const u = Math.sqrt(R()); rs = 0.05 * u / (1 - u); } while (rs > 0.32);
      const ct = 2 * R() - 1, st = Math.sqrt(1 - ct * ct);
      const c = mixc([1.0, 0.64, 0.38], [1.0, 0.85, 0.66], R());
      push(rs * st, R() * 6.2832, rs * ct * 0.72, 0, c, lum(0.05, 0.8, 8), 0);
    }
    for (let i = 0; i < N_HALO; i++) {           // a sparse halo
      const rs = 0.2 + 1.4 * Math.pow(R(), 1.5), ct = 2 * R() - 1, st = Math.sqrt(1 - ct * ct);
      push(rs * st, R() * 6.2832, rs * ct, 0, [1.0, 0.85, 0.7], lum(0.05, 0.7, 4), 0);
    }
    this.starVAO = vao(new Float32Array(stars), [4, 4, 2]);

    // dust and HII live in the pattern frame: angle of phase psi (from the wiggled arm j) at radius r
    const dust = [];
    const dcol = () => mixc([0.003, 0.002, 0.0015], [0.01, 0.006, 0.004], R());
    for (let i = 0; i < 15000; i++) {            // the lane on the concave edge, with feathers trailing out of it
      let r; do { r = 0.09 + -0.36 * Math.log(R() + 1e-12); } while (r > 1.05);
      const j = R() < 0.5 ? 0 : 1;
      const lumpy = 0.5 + 0.5 * Math.sin(13 * r + 2.1 * j + 1.7 * Math.sin(5 * r + j));   // lane thickness/opacity wanders
      if (R() > 0.35 + 0.65 * lumpy) continue;
      let psi = 0.42 + gauss() * (0.04 + 0.1 * lumpy * Math.min(1, 1.6 - r)), rr = r;
      const len = R() < 0.3 ? 4 + Math.floor(R() * 8) : 1 + Math.floor(R() * 2);
      const dpsi = 0.04 + 0.05 * R(), dr = (0.003 + 0.005 * R()) * (R() < 0.6 ? 1 : -0.5);
      for (let k = 0; k < len; k++) {
        const sz = (0.004 + 0.009 * R()) * (0.5 + rr);
        const op = (0.16 + 0.22 * R()) * Math.min(1, (rr - 0.06) * 8) * (k ? 0.8 : 1);
        const c = dcol();
        dust.push(rr, armAt(rr, psi, j) + gauss() * 0.003, gauss() * 0.0025, sz, c[0], c[1], c[2], op);
        psi += dpsi; rr += dr;
      }
    }
    for (let i = 0; i < 7000; i++) {             // flocculent wisps between the arms
      let r; do { r = 0.12 + -0.4 * Math.log(R() + 1e-12); } while (r > 1.0);
      const c = dcol();
      dust.push(r, R() * 6.2832, gauss() * 0.004, 0.006 + 0.014 * R(), c[0], c[1], c[2], 0.06 + 0.12 * R());
    }
    this.dustVAO = vao(new Float32Array(dust), [4, 4]);

    // HII knots (pink) with a hot blue cluster in each, strung along the arms (more where the arm is clumpy)
    const hii = [];
    for (let i = 0; i < 520; i++) {
      let r; do { r = 0.15 + -0.3 * Math.log(R() + 1e-12); } while (r > 1.05);
      const j = R() < 0.5 ? 0 : 1;
      if (R() > clumps(r, j) / 1.2) continue;
      const psi = 0.08 + gauss() * 0.16;
      const a = armAt(r, psi, j);
      const big = Math.pow(R(), 2.0);
      const n = 3 + Math.floor(big * 12);
      for (let k = 0; k < n; k++) {
        const dr = gauss() * 0.005 * (1 + 1.5 * big), da = gauss() * 0.005 * (1 + 1.5 * big) / r;
        const c = mixc([1.0, 0.3, 0.48], [1.0, 0.5, 0.62], R());
        hii.push(r + dr, a + da, gauss() * 0.002, 0.003 + 0.007 * R() * (0.6 + big), c[0], c[1], c[2], 0.3 + 0.5 * R());
      }
      if (R() < 0.7) hii.push(r, a, 0, 0.0015 + 0.0025 * big, 0.7, 0.82, 1.0, 2 + 3 * R());
    }
    this.hiiVAO = vao(new Float32Array(hii), [4, 4]);

    // sky: far stars as directions
    const sky = [];
    for (let i = 0; i < 6000; i++) {
      const z = 2 * R() - 1, a = R() * 6.2832, s = Math.sqrt(1 - z * z);
      const c = mixc([0.75, 0.85, 1.0], [1.0, 0.85, 0.7], R());
      sky.push(s * Math.cos(a), z, s * Math.sin(a), 0, c[0], c[1], c[2], 0.12 * Math.pow(R() + 0.01, -0.9));
    }
    for (let i = 0; i < 7; i++) {
      const z = 2 * R() - 1, a = R() * 6.2832, s = Math.sqrt(1 - z * z);
      sky.push(s * Math.cos(a), z, s * Math.sin(a), 1, 1.0, 0.92, 0.82, 6 + 10 * R());
    }
    this.skyVAO = vao(new Float32Array(sky), [4, 4]);
    this.counts = { stars: stars.length / 10, dust: dust.length / 8, hii: hii.length / 8, sky: sky.length / 8 };

    // full-screen triangle
    const fsV = gl.createVertexArray();
    gl.bindVertexArray(fsV);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // render targets
    const target = (w, h) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('fbo incomplete');
      return { tex, fb, w, h };
    };
    const hdr = target(W, H);
    const maxPoint = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1];   // GPUs differ (255 … 1024): never ask for more
    const mips = [];
    for (let i = 1, w = W, h = H; i <= 6; i++) { w = Math.ceil(w / 2); h = Math.ceil(h / 2); mips.push(target(w, h)); }

    const fullscreen = (prog, dst) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null);
      gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H);
      gl.useProgram(prog.p);
      gl.bindVertexArray(fsV);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    this.draw = (t) => {
      const T = tau(t);
      const cam = camera(t);
      // view basis with roll about the viewing axis
      const fwd = norm(sub(cam.tgt, cam.eye));
      let right = norm(cross(fwd, [0, 1, 0]));
      let up = cross(right, fwd);
      const cr = Math.cos(cam.roll), sr = Math.sin(cam.roll);
      [right, up] = [[right[0] * cr + up[0] * sr, right[1] * cr + up[1] * sr, right[2] * cr + up[2] * sr],
        [up[0] * cr - right[0] * sr, up[1] * cr - right[1] * sr, up[2] * cr - right[2] * sr]];
      cam.eye = cam.eye.map((x, i) => x - up[i] * cam.shift);    // pan: keep the wide shot clear of the caption
      const view = [right[0], up[0], -fwd[0], 0, right[1], up[1], -fwd[1], 0, right[2], up[2], -fwd[2], 0,
        -dot3(right, cam.eye), -dot3(up, cam.eye), dot3(fwd, cam.eye), 1];
      const near = 0.004, far = 40, f = 1 / Math.tan(cam.fov / 2), asp = W / H;
      const proj = [f / asp, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0];
      const vp = new Float32Array(mul4(proj, view));
      const pxPerUnit = (H / 2) * f;               // pixels per world unit at depth 1
      const ex = exposure(t);

      gl.bindFramebuffer(gl.FRAMEBUFFER, hdr.fb);
      gl.viewport(0, 0, W, H);
      gl.disable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);

      // 1. sky
      gl.useProgram(P.sky.p);
      gl.uniformMatrix4fv(P.sky.u.uVP, false, vp);
      gl.uniform1f(P.sky.u.uSkyGain, 1.0);
      gl.bindVertexArray(this.skyVAO.v);
      gl.drawArrays(gl.POINTS, 0, this.skyVAO.count);

      // 2. diffuse disk + bulge
      gl.useProgram(P.diffuse.p);
      gl.uniform1f(P.diffuse.u.uTau, T);
      gl.uniform3fv(P.diffuse.u.uEye, cam.eye);
      gl.uniform3fv(P.diffuse.u.uRight, right);
      gl.uniform3fv(P.diffuse.u.uUp, up);
      gl.uniform3fv(P.diffuse.u.uFwd, fwd);
      gl.uniform2f(P.diffuse.u.uTan, asp / f, 1 / f);
      gl.uniform1f(P.diffuse.u.uDisk, lerp(1.0, 0.5, dive(t)));     // up close the resolved stars carry the disk light
      gl.uniform1f(P.diffuse.u.uBulge, lerp(1.0, 1.6, dive(t)));
      fullscreen(P.diffuse, hdr);

      // 3. stars
      gl.useProgram(P.star.p);
      gl.uniformMatrix4fv(P.star.u.uVP, false, vp);
      gl.uniform1f(P.star.u.uTau, T);
      gl.uniform1f(P.star.u.uGain, 3.0);
      gl.uniform1f(P.star.u.uFocus, cam.focus);
      gl.uniform1f(P.star.u.uAperture, cam.aperture);
      gl.bindVertexArray(this.starVAO.v);
      gl.drawArrays(gl.POINTS, 0, this.starVAO.count);

      // 4. dust: "over" blending darkens what is already there
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(P.dust.p);
      gl.uniformMatrix4fv(P.dust.u.uVP, false, vp);
      gl.uniform1f(P.dust.u.uTau, T);
      gl.uniform1f(P.dust.u.uPx, pxPerUnit);
      gl.uniform1f(P.dust.u.uMaxPx, Math.min(260, maxPoint));
      gl.bindVertexArray(this.dustVAO.v);
      gl.drawArrays(gl.POINTS, 0, this.dustVAO.count);

      // 5. HII knots + clusters
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(P.glow.p);
      gl.uniformMatrix4fv(P.glow.u.uVP, false, vp);
      gl.uniform1f(P.glow.u.uTau, T);
      gl.uniform1f(P.glow.u.uPx, pxPerUnit);
      gl.uniform1f(P.glow.u.uMaxPx, Math.min(200, maxPoint));
      gl.bindVertexArray(this.hiiVAO.v);
      gl.drawArrays(gl.POINTS, 0, this.hiiVAO.count);
      gl.disable(gl.BLEND);

      // 6. bloom: downsample chain, then tent-upsample back up, adding
      let src = hdr;
      gl.useProgram(P.down.p);
      for (const m of mips) {
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.tex);
        gl.uniform1i(P.down.u.src, 0);
        gl.uniform2f(P.down.u.texel, 1 / src.w, 1 / src.h);
        fullscreen(P.down, m);
        src = m;
      }
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(P.up.p);
      for (let i = mips.length - 1; i > 0; i--) {
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, mips[i].tex);
        gl.uniform1i(P.up.u.src, 0);
        gl.uniform2f(P.up.u.texel, 1 / mips[i].w, 1 / mips[i].h);
        gl.uniform1f(P.up.u.k, 1.0);
        fullscreen(P.up, mips[i - 1]);
      }
      gl.disable(gl.BLEND);

      // 7. composite
      gl.useProgram(P.comp.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, hdr.tex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, mips[0].tex);
      gl.uniform1i(P.comp.u.hdr, 0);
      gl.uniform1i(P.comp.u.bloom, 1);
      gl.uniform1f(P.comp.u.uExp, ex);
      gl.uniform1f(P.comp.u.uBloomK, 0.06);
      gl.uniform1f(P.comp.u.uFrame, Math.round(t * 30));
      fullscreen(P.comp, null);
    };
  },
  frame(t) { this.draw(t); },
});
