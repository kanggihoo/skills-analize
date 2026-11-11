/*
 * 36 · 바람에 날리는 비단 — XPBD cloth, baked in setup (sim.js), drawn with raw WebGL2.
 * The bake records every particle of the 80×120 silk at 30 fps; frame(t) blends the two nearest recorded frames,
 * rebuilds normals and thread tangents from the grid, and draws:
 *   silk     two-sided, shot-silk colour (crimson warp / gold weft, the weft showing at grazing angles),
 *            Kajiya–Kay anisotropic sheen along both thread directions, translucency for light from behind
 *   shadows  one key-light shadow map (ortho, depth texture) with PCSS: a blocker search sets the penumbra,
 *            so the silk's shadow is sharp where it touches and soft where it hangs high above the floor
 *   set      polished dark stone sphere on a travertine column, warm floor pool, two brass pins on wires, dust in the beam
 */
import { defineDemo, track, ease, ramp, lerp, clamp } from '../_lib/stage.js';
import { bakeCloth, NX, NY, SPHERE, COLUMN, PIN_X, PIN_Y, PIN_Z } from './sim.js';

const D = 9.5, FPS = 30;

// ---------- the story ----------
const camEye = track([[0, [1.25, 1.55, 4.7]], [3.6, [1.05, 1.75, 4.3]], [5.4, [1.25, 1.35, 3.6], ease.inOutCubic], [D, [1.9, 1.15, 2.75], ease.inOutCubic]]);
const camTgt = track([[0, [0.0, 1.45, 0.45]], [3.6, [0.0, 1.62, 0.6]], [5.4, [0.0, 1.0, 0.6], ease.inOutCubic], [D, [0.0, 0.66, 0.6], ease.inOutCubic]]);
const fadeOf = (t) => ramp(t, 0, 0.5) * (1 - ramp(t, D - 0.45, D));
const keyI = track([[0, 2.6], [2.0, 3.1], [D, 3.0]]);
const rimI = track([[0, 1.6], [3.0, 2.3], [6.0, 1.8], [D, 2.1]]);

// ---------- GLSL ----------
const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
`;
const COMMON = `
uniform vec3 camPos, keyDir, keyCol, rimDir, rimCol, skyA, gndA;
uniform mat4 lightVP;
uniform sampler2D shadowMap;
uniform float time, fade, depthSpan, orthoW;
const vec2 PD[16] = vec2[](vec2(-0.942, -0.399), vec2(0.946, -0.769), vec2(-0.094, -0.929), vec2(0.345, 0.294),
  vec2(-0.916, 0.458), vec2(-0.815, -0.879), vec2(-0.383, 0.277), vec2(0.975, 0.756), vec2(0.443, -0.975), vec2(0.537, -0.474),
  vec2(-0.265, -0.419), vec2(0.792, 0.191), vec2(-0.242, 0.997), vec2(-0.814, 0.914), vec2(0.200, 0.786), vec2(0.144, -0.141));
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
// PCSS on an orthographic key light: blocker search → penumbra width ∝ receiver–blocker distance → Poisson PCF
float shadowAt(vec3 wp, vec3 n, float a) {
  vec4 lp = lightVP * vec4(wp + n * 0.006, 1.0);
  vec3 s = lp.xyz * 0.5 + 0.5;
  if (s.x < 0.0 || s.y < 0.0 || s.x > 1.0 || s.y > 1.0 || s.z > 1.0) return 1.0;
  float zr = s.z - 0.0006;
  mat2 R = mat2(cos(a), sin(a), -sin(a), cos(a));
  float search = 0.035 / orthoW, sum = 0.0, cnt = 0.0;
  for (int i = 0; i < 12; i++) {
    float d = texture(shadowMap, s.xy + R * PD[i] * search).r;
    if (d < zr) { sum += d; cnt += 1.0; }
  }
  if (cnt < 0.5) return 1.0;
  float pen = clamp((zr - sum / cnt) * depthSpan * 0.09 / orthoW, 1.2 / 2048.0, 0.03 / orthoW);
  float lit = 0.0;
  for (int i = 0; i < 16; i++) lit += step(zr, texture(shadowMap, s.xy + R * PD[i] * pen).r);
  return lit / 16.0;
}
vec3 bgCol(vec2 fc) {
  vec2 q = fc / vec2(1080.0, 1920.0);
  vec3 c = mix(vec3(0.030, 0.026, 0.028), vec3(0.008, 0.007, 0.009), smoothstep(0.35, 1.0, q.y));
  float gl = length((q - vec2(0.42, 0.62)) * vec2(1.0, 0.62)) * 2.6;
  float g = exp(-gl * gl);
  c += vec3(0.075, 0.058, 0.050) * g;
  return c;
}
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
vec4 grade(vec3 col, vec2 fc) {
  col = aces(col);
  col = pow(col, vec3(1.0 / 2.2));
  vec2 q = fc / vec2(1080.0, 1920.0) - 0.5;
  col *= 1.0 - 0.35 * smoothstep(0.3, 0.9, length(q * vec2(1.0, 0.72)) * 1.3);
  col += (hash12(fc + fract(time * 7.31) * 113.0) - 0.5) / 255.0 * 1.5;
  return vec4(col * fade, 1.0);
}
// a studio seen in reflections: dark room, the key softbox, the warm rim panel
vec3 studio(vec3 r) {
  vec3 c = mix(gndA * 0.6, skyA * 0.7, smoothstep(-0.3, 0.6, r.y));
  float k = max(dot(r, keyDir), 0.0), k2 = k * k, k4 = k2 * k2, k16 = k4 * k4; k16 *= k16;
  float m = max(dot(r, rimDir), 0.0), m2 = m * m, m4 = m2 * m2, m16 = m4 * m4; m16 *= m16;
  return c + keyCol * (smoothstep(0.93, 0.975, k) * 2.2 + k16 * 0.12) + rimCol * (smoothstep(0.95, 0.985, m) * 1.6 + m16 * 0.1);
}
`;

const MESH_VS = HEAD + `
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNrm;
layout(location = 2) in vec3 aTan;
layout(location = 3) in vec2 aUv;
uniform mat4 VP, M;
out vec3 vW, vN, vT; out vec2 vUv;
void main() {
  vec4 w = M * vec4(aPos, 1.0);
  vW = w.xyz; vN = mat3(M) * aNrm; vT = mat3(M) * aTan; vUv = aUv;
  gl_Position = VP * w;
}`;
const DEPTH_VS = HEAD + `
layout(location = 0) in vec3 aPos;
uniform mat4 VP, M;
void main() { gl_Position = VP * (M * vec4(aPos, 1.0)); }`;
const DEPTH_FS = HEAD + `out vec4 o; void main() { o = vec4(1.0); }`;

const SILK_FS = HEAD + COMMON + `
uniform vec3 warpC, weftC;
in vec3 vW, vN, vT; in vec2 vUv;
out vec4 o;
vec3 silkLight(vec3 N, vec3 V, vec3 T, vec3 B, vec3 base, vec3 L, vec3 lc, float sh) {
  float nl = dot(N, L);
  vec3 c = base * lc * clamp((nl + 0.3) / 1.3, 0.0, 1.0) * sh;
  c += base * base * 2.4 * lc * clamp(-nl, 0.0, 1.0) * sh * 0.6;           // light through the thin silk
  vec3 H = normalize(L + V);
  float th = dot(T, H), bh = dot(B, H);
  float sw = sqrt(max(1.0 - th * th, 0.0)), sb = sqrt(max(1.0 - bh * bh, 0.0));
  float sw2 = sw * sw, sw4 = sw2 * sw2, sw8 = sw4 * sw4, sw16 = sw8 * sw8, sw64 = sw16 * sw16 * sw16 * sw16;
  float sb2 = sb * sb, sb4 = sb2 * sb2, sb8 = sb4 * sb4, sb32 = sb8 * sb8 * sb8 * sb8;
  // satin: long warp floats give the strong, narrow band; the weft a broader, golden one
  vec3 spec = vec3(1.0, 0.55, 0.52) * sw64 * 0.7 + vec3(1.0, 0.78, 0.42) * sb32 * 0.38;
  return c + lc * spec * sh * smoothstep(-0.05, 0.3, nl);
}
void main() {
  vec3 N = normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 V = normalize(camPos - vW);
  vec3 T = normalize(vT - N * dot(vT, N));
  vec3 B = cross(N, T);
  float nv = clamp(dot(N, V), 0.0, 1.0);
  // slubs along the weft (fade out before they could alias)
  float fw = fwidth(vUv.y) * 520.0;
  float slub = (vnoise(vec2(vUv.x * 14.0, vUv.y * 520.0)) - 0.5) * (1.0 - smoothstep(0.35, 1.0, fw));
  float gz = 1.0 - nv;
  vec3 base = mix(warpC, weftC, smoothstep(0.3, 0.98, gz) * 0.65) * (1.0 + 0.1 * slub);
  float nlk = dot(N, keyDir);
  float sh = shadowAt(vW, nlk >= 0.0 ? N : -N, hash12(gl_FragCoord.xy) * 6.2831853);
  vec3 col = silkLight(N, V, T, B, base, keyDir, keyCol, sh);
  col += silkLight(N, V, T, B, base, rimDir, rimCol, 1.0);
  col += base * mix(gndA, skyA, N.y * 0.5 + 0.5);
  float gz2 = gz * gz;
  col += weftC * gz2 * gz2 * (0.25 * keyCol * sh + 0.4 * rimCol) * 0.25;   // grazing sheen
  o = grade(col, gl_FragCoord.xy);
}`;

const STONE_FS = HEAD + COMMON + `
uniform int kind;            // 0 floor, 1 column (travertine), 2 sphere (polished dark stone), 3 brass
uniform vec4 sph;            // sphere centre + radius (for contact occlusion)
uniform float colR;
in vec3 vW, vN, vT; in vec2 vUv;
out vec4 o;
float sphereOcc(vec3 p, vec3 n) {    // analytic occlusion of a sphere (Quilez)
  vec3 d = sph.xyz - p; float l = length(d);
  return clamp(1.0 - max(dot(n, d / l), 0.0) * (sph.w * sph.w) / (l * l), 0.0, 1.0);
}
void main() {
  vec3 N = normalize(vN), V = normalize(camPos - vW);
  float rot = hash12(gl_FragCoord.xy) * 6.2831853;
  float sh = shadowAt(vW, N, rot);
  float nl = max(dot(N, keyDir), 0.0), nr = max(dot(N, rimDir), 0.0);
  vec3 col;
  if (kind == 0) {
    float tex = 0.85 + 0.15 * vnoise(vW.xz * 9.0) + 0.06 * (vnoise(vW.xz * 60.0) - 0.5);
    vec3 alb = vec3(0.075, 0.064, 0.057) * tex;
    float pl = length((vW.xz - vec2(0.05, 0.6)) * vec2(0.8, 1.0)) * 0.75;
    float pool = exp(-pl * pl);
    float ao = sphereOcc(vW, N);
    float cd = length(vW.xz - sph.xz);
    ao *= 1.0 - 0.55 * exp(-max(cd - colR, 0.0) * 9.0);
    col = alb * (keyCol * nl * sh * (0.35 + 0.65 * pool) + skyA * 0.5 * ao + rimCol * nr * 0.15);
    vec3 H = normalize(keyDir + V);
    float nh = max(dot(N, H), 0.0), nh2 = nh * nh, nh8 = nh2 * nh2 * nh2 * nh2;
    col += keyCol * 0.02 * nh8 * nh8 * sh * pool;
    float far = smoothstep(2.4, 6.5, length(vW.xz - vec2(0.0, 0.5)));
    col = mix(col, bgCol(gl_FragCoord.xy) * 0.9, far);
  } else if (kind == 1) {
    float vein = vnoise(vec2(vW.y * 3.0, atan(vW.x - sph.x, vW.z - sph.z) * 2.0) + vnoise(vW.xy * 18.0) * 0.6);
    vec3 alb = mix(vec3(0.52, 0.46, 0.39), vec3(0.64, 0.58, 0.50), vein) * (0.92 + 0.08 * vnoise(vW.xy * 140.0));
    float ao = sphereOcc(vW, N) * (0.55 + 0.45 * smoothstep(0.0, 0.25, vW.y));
    col = alb * (keyCol * nl * sh + skyA * 0.6 * ao + gndA * 0.5 * ao + rimCol * nr * 0.5);
  } else if (kind == 2) {
    vec3 R = reflect(-V, N);
    float nv = clamp(dot(N, V), 0.0, 1.0), f1 = 1.0 - nv, f2 = f1 * f1;
    float F = 0.045 + 0.955 * f2 * f2 * f1;
    vec3 alb = vec3(0.018, 0.018, 0.022) * (0.9 + 0.2 * vnoise(N.xy * 9.0 + N.z * 4.0));
    vec3 env = studio(R);
    float rs = shadowAt(vW + R * 0.08, N, rot);       // the silk can block the softbox reflection too
    col = alb * (keyCol * nl * sh + skyA * 0.5) + env * F * mix(0.35, 1.0, rs);
    vec3 H = normalize(keyDir + V);
    float nh = max(dot(N, H), 0.0), nh2 = nh * nh, nh4 = nh2 * nh2, nh16 = nh4 * nh4, nh64 = nh16 * nh16 * nh16 * nh16;
    col += keyCol * nh64 * nh64 * 2.0 * sh;
  } else {
    vec3 R = reflect(-V, N);
    vec3 alb = vec3(0.78, 0.55, 0.26);
    col = alb * (keyCol * nl * sh * 0.4 + skyA * 0.3) + alb * studio(R) * 0.9;
  }
  o = grade(col, gl_FragCoord.xy);
}`;

const BG_VS = `#version 300 es
layout(location = 0) in vec2 p; void main() { gl_Position = vec4(p, 0.9999, 1); }`;
const BG_FS = HEAD + COMMON + `out vec4 o; void main() { o = grade(bgCol(gl_FragCoord.xy), gl_FragCoord.xy); }`;

// dust drifting through the key beam (additive points, lit only inside the beam)
const MOTE_VS = HEAD + COMMON + `
layout(location = 0) in vec4 aSeed;
uniform mat4 VP;
out float vA;
void main() {
  vec3 p = aSeed.xyz + vec3(0.07 * sin(time * 0.31 + aSeed.w * 7.0), 0.05 * sin(time * 0.23 + aSeed.w * 3.0) - time * 0.012, 0.06 * cos(time * 0.27 + aSeed.w * 5.0));
  vec4 c = VP * vec4(p, 1.0);
  gl_Position = c;
  float sz = (1.5 + 2.5 * fract(aSeed.w * 13.7)) * 3.2 / c.w;
  gl_PointSize = max(sz, 1.0);
  vA = shadowAt(p, keyDir, aSeed.w * 6.2831853) * (0.25 + 0.75 * fract(aSeed.w * 31.3)) * min(sz, 1.0) * (0.6 + 0.4 * sin(time * 2.0 + aSeed.w * 40.0));
}`;
const MOTE_FS = HEAD + COMMON + `
in float vA; out vec4 o;
void main() {
  vec2 q = gl_PointCoord - 0.5; float r = dot(q, q) * 4.0;
  float a = exp(-r * 3.0) * vA * 0.5 * fade;
  o = vec4(keyCol * a * 0.08, 0.0);
}`;

// ---------- matrices (column-major) ----------
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function perspective(fovy, asp, n, f) { const k = 1 / Math.tan(fovy / 2), nf = 1 / (n - f); return [k / asp, 0, 0, 0, 0, k, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]; }
function ortho(l, r, b, t, n, f) { return [2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, -2 / (f - n), 0, -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1]; }
function lookAt(eye, tgt, up0 = [0, 1, 0]) {
  const fw = norm(sub3(tgt, eye)), rt = norm(cross(fw, up0)), up = cross(rt, fw);
  return [rt[0], up[0], -fw[0], 0, rt[1], up[1], -fw[1], 0, rt[2], up[2], -fw[2], 0, -dot(rt, eye), -dot(up, eye), dot(fw, eye), 1];
}
function mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }
const translate = (x, y, z, s = 1) => new Float32Array([s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, x, y, z, 1]);
const scaleXYZ = (x, y, z, sx, sy, sz) => new Float32Array([sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, x, y, z, 1]);
const I4 = translate(0, 0, 0);

// ---------- geometry ----------
function sphereGeo(seg = 64, rings = 40) {
  const P = [], Nn = [], Tt = [], U = [], idx = [];
  for (let j = 0; j <= rings; j++) {
    const v = j / rings, th = v * Math.PI;
    for (let i = 0; i <= seg; i++) {
      const u = i / seg, ph = u * Math.PI * 2;
      const n = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)];
      P.push(...n); Nn.push(...n); Tt.push(-Math.sin(ph), 0, Math.cos(ph)); U.push(u, v);
    }
  }
  for (let j = 0; j < rings; j++) for (let i = 0; i < seg; i++) {
    const a = j * (seg + 1) + i, b = a + seg + 1;
    idx.push(a, a + 1, b, a + 1, b + 1, b);
  }
  return { P, N: Nn, T: Tt, U, idx };
}
function cylinderGeo(seg = 64, rings = 8) {     // unit radius, y from 0 to 1, open
  const P = [], Nn = [], Tt = [], U = [], idx = [];
  for (let j = 0; j <= rings; j++) for (let i = 0; i <= seg; i++) {
    const ph = (i / seg) * Math.PI * 2, c = Math.cos(ph), s = Math.sin(ph);
    P.push(c, j / rings, s); Nn.push(c, 0, s); Tt.push(0, 1, 0); U.push(i / seg, j / rings);
  }
  for (let j = 0; j < rings; j++) for (let i = 0; i < seg; i++) {
    const a = j * (seg + 1) + i, b = a + seg + 1;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  return { P, N: Nn, T: Tt, U, idx };
}

defineDemo({
  id: '36-cloth',
  title: '바람에 날리는 비단',
  tech: 'XPBD 천 시뮬레이션 · 위치 기반 동역학 미리 굽기',
  duration: D,
  background: '#050405',
  async setup({ canvas, W, H }) {
    // ---- the bake: all of the physics happens here, once ----
    const bake = bakeCloth({ fps: FPS, duration: D });
    const NP = NX * NY, FR = bake.frames, NFR = bake.total;

    const { ctx: gl } = canvas({ type: 'webgl2' });
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
      const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < nu; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const P = {
      silk: program(MESH_VS, SILK_FS), stone: program(MESH_VS, STONE_FS), depth: program(DEPTH_VS, DEPTH_FS),
      bg: program(BG_VS, BG_FS), mote: program(MOTE_VS, MOTE_FS),
    };

    // ---- meshes ----
    const mesh = (g, dynamic = false) => {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const buf = (data, loc, size, usage) => {
        const b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
        return b;
      };
      const use = dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
      const m = {
        vao, pos: buf(new Float32Array(g.P), 0, 3, use), nrm: buf(new Float32Array(g.N), 1, 3, use),
        tan: buf(new Float32Array(g.T), 2, 3, use), uv: buf(new Float32Array(g.U), 3, 2, gl.STATIC_DRAW),
      };
      const ib = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      const big = g.P.length / 3 > 65535;
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, big ? new Uint32Array(g.idx) : new Uint16Array(g.idx), gl.STATIC_DRAW);
      m.count = g.idx.length; m.type = big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
      gl.bindVertexArray(null);
      return m;
    };
    // silk grid: winding chosen so the side that starts facing the camera (+z) is the front face
    const clothIdx = [], clothUv = [];
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) clothUv.push(i / (NX - 1), j / (NY - 1));
    for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) {
      const a = j * NX + i, b = a + 1, c = a + NX, d = c + 1;
      clothIdx.push(a, c, b, b, c, d);
    }
    const cP = new Float32Array(NP * 3), cN = new Float32Array(NP * 3), cT = new Float32Array(NP * 3);
    const silk = mesh({ P: cP, N: cN, T: cT, U: clothUv, idx: clothIdx }, true);
    const ball = mesh(sphereGeo());
    const cyl = mesh(cylinderGeo());
    const floorG = { P: [-8, 0, -8, 8, 0, -8, 8, 0, 8, -8, 0, 8], N: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], T: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], U: [0, 0, 1, 0, 1, 1, 0, 1], idx: [0, 2, 1, 0, 3, 2] };
    const floor = mesh(floorG);
    const quad = gl.createVertexArray();
    gl.bindVertexArray(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    // dust motes
    const NM = 160, seeds = new Float32Array(NM * 4);
    { let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < NM; i++) seeds.set([-0.9 + 1.8 * r(), 0.15 + 2.6 * r(), -0.6 + 1.8 * r(), r()], i * 4); }
    const motes = gl.createVertexArray();
    gl.bindVertexArray(motes);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // ---- shadow map (key light, orthographic) ----
    const SM = 2048;
    const smTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, smTex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT32F, SM, SM);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const smFb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, smFb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, smTex, 0);
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer(gl.NONE);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('shadow framebuffer incomplete');
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const keyDir = norm([-0.52, 0.8, 0.5]), rimDir = norm([0.62, 0.42, -0.66]);
    const LC = [0.1, 1.25, 0.45], OW = 2.1, SPAN = 9;
    const lightVP = mul(ortho(-OW, OW, -OW, OW, 0.1, SPAN), lookAt([LC[0] + keyDir[0] * 4.5, LC[1] + keyDir[1] * 4.5, LC[2] + keyDir[2] * 4.5], LC, [0, 0, -1]));
    const proj = perspective(34 * Math.PI / 180, W / H, 0.05, 40);

    // ---- per-frame cloth: blend two baked frames, rebuild normals / warp tangents from the grid ----
    const updateCloth = (t) => {
      const ft = clamp(t * FPS, 0, NFR - 1), f0 = Math.floor(ft), f1 = Math.min(f0 + 1, NFR - 1), k = ft - f0;
      const A = f0 * NP * 3, B = f1 * NP * 3;
      for (let q = 0; q < NP * 3; q++) cP[q] = FR[A + q] + (FR[B + q] - FR[A + q]) * k;
      for (let j = 0; j < NY; j++) {
        const j0 = Math.max(j - 1, 0), j1 = Math.min(j + 1, NY - 1);
        for (let i = 0; i < NX; i++) {
          const i0 = Math.max(i - 1, 0), i1 = Math.min(i + 1, NX - 1);
          const a = (j * NX + i0) * 3, b = (j * NX + i1) * 3, c = (j0 * NX + i) * 3, d = (j1 * NX + i) * 3;
          const ux = cP[b] - cP[a], uy = cP[b + 1] - cP[a + 1], uz = cP[b + 2] - cP[a + 2];      // across (weft)
          const vx = cP[d] - cP[c], vy = cP[d + 1] - cP[c + 1], vz = cP[d + 2] - cP[c + 2];      // down the length (warp)
          let nx = vy * uz - vz * uy, ny = vz * ux - vx * uz, nz = vx * uy - vy * ux;
          const nl = Math.hypot(nx, ny, nz) || 1, vl = Math.hypot(vx, vy, vz) || 1;
          const o = (j * NX + i) * 3;
          cN[o] = nx / nl; cN[o + 1] = ny / nl; cN[o + 2] = nz / nl;
          cT[o] = vx / vl; cT[o + 1] = vy / vl; cT[o + 2] = vz / vl;
        }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, silk.pos); gl.bufferSubData(gl.ARRAY_BUFFER, 0, cP);
      gl.bindBuffer(gl.ARRAY_BUFFER, silk.nrm); gl.bufferSubData(gl.ARRAY_BUFFER, 0, cN);
      gl.bindBuffer(gl.ARRAY_BUFFER, silk.tan); gl.bufferSubData(gl.ARRAY_BUFFER, 0, cT);
    };

    // scene objects: [mesh, model matrix, kind]
    const colTop = SPHERE.y;
    const objects = [
      [ball, scaleXYZ(SPHERE.x, SPHERE.y, SPHERE.z, SPHERE.r, SPHERE.r, SPHERE.r), 2],
      ...(COLUMN ? [[cyl, scaleXYZ(SPHERE.x, 0, SPHERE.z, COLUMN.r, colTop, COLUMN.r), 1]] : []),
      // brass pins and the fine wires they hang from
      [ball, scaleXYZ(-PIN_X, PIN_Y + 0.004, PIN_Z, 0.011, 0.011, 0.011), 3],
      [ball, scaleXYZ(PIN_X, PIN_Y + 0.004, PIN_Z, 0.011, 0.011, 0.011), 3],
      [cyl, scaleXYZ(-PIN_X, PIN_Y, PIN_Z, 0.0016, 4, 0.0016), 3],
      [cyl, scaleXYZ(PIN_X, PIN_Y, PIN_Z, 0.0016, 4, 0.0016), 3],
    ];
    const draw = (m) => { gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES, m.count, m.type, 0); };
    const common = (u, t) => {
      gl.uniform3fv(u.camPos, this.eye); gl.uniform3fv(u.keyDir, keyDir); gl.uniform3fv(u.rimDir, rimDir);
      gl.uniform3fv(u.keyCol, [1.0, 0.9, 0.78].map((c) => c * keyI(t)));
      gl.uniform3fv(u.rimCol, [1.0, 0.72, 0.45].map((c) => c * rimI(t)));
      gl.uniform3fv(u.skyA, [0.075, 0.08, 0.1]); gl.uniform3fv(u.gndA, [0.05, 0.035, 0.028]);
      gl.uniformMatrix4fv(u.lightVP, false, lightVP);
      gl.uniform1f(u.time, t); gl.uniform1f(u.fade, fadeOf(t)); gl.uniform1f(u.depthSpan, SPAN - 0.1); gl.uniform1f(u.orthoW, 2 * OW);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, smTex); gl.uniform1i(u.shadowMap, 0);
    };

    this.render = (t) => {
      updateCloth(t);
      this.eye = camEye(t);
      const VP = mul(proj, lookAt(this.eye, camTgt(t)));

      // 1 · shadow map
      gl.bindFramebuffer(gl.FRAMEBUFFER, smFb);
      gl.viewport(0, 0, SM, SM);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS); gl.disable(gl.CULL_FACE);
      gl.useProgram(P.depth.p);
      gl.uniformMatrix4fv(P.depth.u.VP, false, lightVP);
      gl.uniformMatrix4fv(P.depth.u.M, false, I4);
      draw(silk);
      for (const [m, M] of objects) { gl.uniformMatrix4fv(P.depth.u.M, false, M); draw(m); }

      // 2 · the picture
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.DEPTH_TEST);
      gl.useProgram(P.bg.p); common(P.bg.u, t);
      gl.bindVertexArray(quad); gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(P.stone.p); common(P.stone.u, t);
      gl.uniformMatrix4fv(P.stone.u.VP, false, VP);
      gl.uniform4f(P.stone.u.sph, SPHERE.x, SPHERE.y, SPHERE.z, SPHERE.r);
      gl.uniform1f(P.stone.u.colR, COLUMN ? COLUMN.r : 0);
      gl.uniform1i(P.stone.u.kind, 0); gl.uniformMatrix4fv(P.stone.u.M, false, I4); draw(floor);
      for (const [m, M, kind] of objects) { gl.uniform1i(P.stone.u.kind, kind); gl.uniformMatrix4fv(P.stone.u.M, false, M); draw(m); }
      gl.useProgram(P.silk.p); common(P.silk.u, t);
      gl.uniformMatrix4fv(P.silk.u.VP, false, VP); gl.uniformMatrix4fv(P.silk.u.M, false, I4);
      gl.uniform3fv(P.silk.u.warpC, [0.50, 0.025, 0.07]); gl.uniform3fv(P.silk.u.weftC, [0.86, 0.42, 0.07]);
      draw(silk);
      // 3 · dust in the beam
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false);
      gl.useProgram(P.mote.p); common(P.mote.u, t);
      gl.uniformMatrix4fv(P.mote.u.VP, false, VP);
      gl.bindVertexArray(motes); gl.drawArrays(gl.POINTS, 0, NM);
      gl.disable(gl.BLEND); gl.depthMask(true);
      gl.bindVertexArray(null);
    };
  },
  frame(t) {
    this.render(t);
  },
});
