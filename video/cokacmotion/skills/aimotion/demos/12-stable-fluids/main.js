/*
 * 12 · 물속에 퍼지는 잉크 — Jos Stam's stable fluids on the GPU (WebGL2, float ping-pong textures).
 * Per sub-step: vorticity confinement + nozzle forces + slight negative buoyancy → divergence →
 * Jacobi pressure (warm-started) → gradient subtraction → semi-Lagrangian (RK2) advection of velocity,
 * MacCormack advection of three ink channels. Velocity lives on a 270×480 grid, ink on 540×960.
 * Rendering: a low-res light march toward the surface gives coloured transmittance (ink shadows itself and
 * casts shadows into the light shafts), plus bloom, caustics and drifting motes.
 * Seeking uses replay(): 2 fixed sub-steps per video frame, checkpoints are GPU blits of (velocity, pressure, ink).
 */
import { defineDemo, replay, track, ease, clamp } from '../_lib/stage.js';

const HEADLESS = new URLSearchParams(location.search).has('render');
const D = 9, FPS = 30, SUB = 2, DT = 1 / (FPS * SUB);
const NX = 270, NY = 480;          // velocity / pressure grid
const DX = 540, DY = 960;          // ink grid
const BX = 135, BY = 240;          // bloom grid
const LX = 270, LY = 480;          // light-march grid
const JACOBI = 30;

// ---------- emitters: scripted nozzles, pure functions of t ----------
const env = (t, a, b, c, d) => clamp(Math.min((t - a) / (b - a), (d - t) / (d - c)), 0, 1);
const deg = Math.PI / 180;
function emitters(t) {
  // [x, y (uv, y up), angle (deg), speed (cells/s), radius (height units), strength 0..1, ink rgb weights]
  // two equal puffs on one line, aimed at each other: each rolls up into a vortex dipole (a mushroom head);
  // when they meet, the vortices swap partners and two mixed cyan–rose dipoles curl away sideways
  const k1 = Math.max(env(t, 0.5, 0.58, 0.95, 1.2), 0.14 * env(t, 1.0, 1.3, 2.4, 3.4));
  const k2 = Math.max(env(t, 0.5, 0.58, 0.95, 1.2), 0.14 * env(t, 1.0, 1.3, 2.4, 3.4));
  const k3 = Math.max(env(t, 4.1, 4.2, 4.42, 4.65), 0.1 * env(t, 4.45, 4.75, 5.3, 6.0));
  return [
    { x: 0.12, y: 0.80, a: -52.6 + 2 * Math.sin(3.1 * t), v: 300, r: 0.016, k: k1, c: [1, 0, 0] },
    { x: 0.88, y: 0.20, a: 127.4 + 2 * Math.sin(2.7 * t + 1), v: 300, r: 0.016, k: k2, c: [0, 1, 0] },
    { x: 0.44, y: 0.965, a: -90 + 3 * Math.sin(2.3 * t), v: 230, r: 0.015, k: k3, c: [0, 0, 1] },
  ];
}

// ---------- shaders ----------
const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
out vec4 o;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
`;
const CLEAR = HEAD + `uniform vec4 val; void main() { o = val; }`;

// curl of the velocity field (cells)
const CURL = HEAD + `
uniform sampler2D V;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(V, 0) - 1;
  float L = texelFetch(V, ivec2(max(q.x - 1, 0), q.y), 0).y, R = texelFetch(V, ivec2(min(q.x + 1, m.x), q.y), 0).y;
  float B = texelFetch(V, ivec2(q.x, max(q.y - 1, 0)), 0).x, T = texelFetch(V, ivec2(q.x, min(q.y + 1, m.y)), 0).x;
  o = vec4(0.5 * ((R - L) - (T - B)), 0, 0, 0);
}`;

// vorticity confinement + nozzles + negative buoyancy of the ink
const FORCE = HEAD + `
uniform sampler2D V, C, Ink;
uniform float dt, eps, grav, aspect;
uniform vec4 em[3];      // x, y, radius, strength
uniform vec2 ev[3];      // target velocity (cells/s)
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(V, 0) - 1;
  vec2 uv = gl_FragCoord.xy / vec2(textureSize(V, 0));
  float L = texelFetch(C, ivec2(max(q.x - 1, 0), q.y), 0).x, R = texelFetch(C, ivec2(min(q.x + 1, m.x), q.y), 0).x;
  float B = texelFetch(C, ivec2(q.x, max(q.y - 1, 0)), 0).x, T = texelFetch(C, ivec2(q.x, min(q.y + 1, m.y)), 0).x;
  float c = texelFetch(C, q, 0).x;
  vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  f = f / (length(f) + 1e-5) * eps * c;
  f.y = -f.y;
  vec2 v = texelFetch(V, q, 0).xy + f * dt;
  vec4 ink = texture(Ink, uv);
  v.y -= grav * (ink.r + ink.g + ink.b) * dt;
  for (int i = 0; i < 3; i++) {
    vec2 d = (uv - em[i].xy) * vec2(aspect, 1.0);
    float g = exp(-dot(d, d) / (em[i].z * em[i].z)) * em[i].w;
    v = mix(v, ev[i], clamp(g * 0.6, 0.0, 1.0));
  }
  // walls: no flow through the border
  if (q.x == 0 || q.x == m.x) v.x = 0.0;
  if (q.y == 0 || q.y == m.y) v.y = 0.0;
  o = vec4(v, 0, 0);
}`;

const DIV = HEAD + `
uniform sampler2D V;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(V, 0) - 1;
  vec2 c = texelFetch(V, q, 0).xy;
  float L = q.x > 0 ? texelFetch(V, ivec2(q.x - 1, q.y), 0).x : -c.x;
  float R = q.x < m.x ? texelFetch(V, ivec2(q.x + 1, q.y), 0).x : -c.x;
  float B = q.y > 0 ? texelFetch(V, ivec2(q.x, q.y - 1), 0).y : -c.y;
  float T = q.y < m.y ? texelFetch(V, ivec2(q.x, q.y + 1), 0).y : -c.y;
  o = vec4(0.5 * (R - L + T - B), 0, 0, 0);
}`;

// Jacobi iteration for ∇²p = div (Neumann borders); k scales the previous pressure (warm start decay)
const JAC = HEAD + `
uniform sampler2D Pr, Dv; uniform float k;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(Pr, 0) - 1;
  float L = texelFetch(Pr, ivec2(max(q.x - 1, 0), q.y), 0).x, R = texelFetch(Pr, ivec2(min(q.x + 1, m.x), q.y), 0).x;
  float B = texelFetch(Pr, ivec2(q.x, max(q.y - 1, 0)), 0).x, T = texelFetch(Pr, ivec2(q.x, min(q.y + 1, m.y)), 0).x;
  o = vec4(((L + R + B + T) * k - texelFetch(Dv, q, 0).x) * 0.25, 0, 0, 0);
}`;

const GRAD = HEAD + `
uniform sampler2D Pr, V;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(Pr, 0) - 1;
  float L = texelFetch(Pr, ivec2(max(q.x - 1, 0), q.y), 0).x, R = texelFetch(Pr, ivec2(min(q.x + 1, m.x), q.y), 0).x;
  float B = texelFetch(Pr, ivec2(q.x, max(q.y - 1, 0)), 0).x, T = texelFetch(Pr, ivec2(q.x, min(q.y + 1, m.y)), 0).x;
  o = vec4(texelFetch(V, q, 0).xy - 0.5 * vec2(R - L, T - B), 0, 0);
}`;

// semi-Lagrangian advection, RK2 back-trace; velocity in cells/s of the velocity grid
const ADV_V = HEAD + `
uniform sampler2D V; uniform float dt, diss;
void main() {
  vec2 vs = vec2(textureSize(V, 0));
  vec2 uv = gl_FragCoord.xy / vs;
  vec2 v0 = texelFetch(V, ivec2(gl_FragCoord.xy), 0).xy;
  vec2 v1 = texture(V, uv - 0.5 * dt * v0 / vs).xy;
  vec2 v = texture(V, uv - dt * v1 / vs).xy;
  o = vec4(v / (1.0 + diss * dt), 0, 0);
}`;

// ink advection, MacCormack: (1) plain RK2 semi-Lagrangian step → F
const ADV_D = HEAD + `
uniform sampler2D V, Ink; uniform vec2 vs; uniform float dt;
void main() {
  vec2 uv = gl_FragCoord.xy / vec2(textureSize(Ink, 0));
  vec2 v0 = texture(V, uv).xy;
  vec2 v1 = texture(V, uv - 0.5 * dt * v0 / vs).xy;
  o = texture(Ink, uv - dt * v1 / vs);
}`;
// (2) advect F backward, take half the round-trip error as a correction, clamp to the source texels'
// range (keeps it stable and free of new extrema), dissipate, inject at the nozzles
const MAC_D = HEAD + `
uniform sampler2D V, Ink, F; uniform vec2 vs; uniform float dt, diss, aspect, rate, pulse;
uniform vec4 em[3]; uniform vec3 ec[3];
void main() {
  vec2 isz = vec2(textureSize(Ink, 0));
  vec2 uv = gl_FragCoord.xy / isz;
  vec2 v0 = texture(V, uv).xy;
  vec2 v1 = texture(V, uv - 0.5 * dt * v0 / vs).xy;
  vec2 src = uv - dt * v1 / vs;
  vec2 w0 = texture(V, uv + 0.5 * dt * v0 / vs).xy;
  vec4 back = texture(F, uv + dt * w0 / vs);
  vec4 fwd = texelFetch(F, ivec2(gl_FragCoord.xy), 0);
  vec4 d = fwd + 0.5 * (texelFetch(Ink, ivec2(gl_FragCoord.xy), 0) - back);
  ivec2 b = ivec2(floor(src * isz - 0.5)), m = ivec2(isz) - 1;
  vec4 a1 = texelFetch(Ink, clamp(b, ivec2(0), m), 0), a2 = texelFetch(Ink, clamp(b + ivec2(1, 0), ivec2(0), m), 0);
  vec4 a3 = texelFetch(Ink, clamp(b + ivec2(0, 1), ivec2(0), m), 0), a4 = texelFetch(Ink, clamp(b + ivec2(1, 1), ivec2(0), m), 0);
  d = clamp(d, min(min(a1, a2), min(a3, a4)), max(max(a1, a2), max(a3, a4)));
  d /= 1.0 + diss * dt;
  for (int i = 0; i < 3; i++) {
    // ink enters along the jet's shear layer (a ring around the nozzle axis), pulsed: the bands it leaves
    // are what the vortex cores wind into spirals (the way dye reveals vortices in a flow experiment)
    vec2 e = (uv - em[i].xy) * vec2(aspect, 1.0);
    float q = dot(e, e) / (em[i].z * em[i].z);
    float g = (0.55 + 1.3 * q) * exp(-q) * em[i].w * pulse;
    d.rgb += ec[i] * g * rate * dt;
  }
  o = vec4(min(d.rgb, vec3(3.0)), 0.0);
}`;

// light: march toward the surface through the ink → coloured transmittance; .a = blurred total density
const LIGHT = HEAD + `
uniform sampler2D Ink; uniform vec2 ldir; uniform vec3 abs1, abs2, abs3;
void main() {
  vec2 uv = gl_FragCoord.xy / vec2(${LX}.0, ${LY}.0);
  vec3 tau = vec3(0);
  vec2 p = uv;
  float stepL = 0.012;
  for (int i = 0; i < 22; i++) {
    p += ldir * stepL;
    if (p.y > 1.0) break;
    vec3 d = texture(Ink, p).rgb;
    tau += (d.r * abs1 + d.g * abs2 + d.b * abs3) * stepL;
    stepL *= 1.06;
  }
  vec3 dc = texture(Ink, uv).rgb;
  o = vec4(exp(-tau * 2.4), dc.r + dc.g + dc.b);
}`;

// 4× downsample of the ink (for bloom)
const DOWN = HEAD + `
uniform sampler2D Ink;
void main() {
  vec2 uv = gl_FragCoord.xy / vec2(${BX}.0, ${BY}.0);
  vec2 px = 1.0 / vec2(textureSize(Ink, 0));
  o = 0.25 * (texture(Ink, uv + px * vec2(-1, -1)) + texture(Ink, uv + px * vec2(1, -1)) + texture(Ink, uv + px * vec2(-1, 1)) + texture(Ink, uv + px * vec2(1, 1)));
}`;

const BLUR = HEAD + `
uniform sampler2D B; uniform ivec2 dir;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(B, 0) - 1;
  const float w[5] = float[](0.2270, 0.1945, 0.1216, 0.0540, 0.0162);
  vec4 acc = texelFetch(B, q, 0) * w[0];
  for (int i = 1; i < 5; i++)
    acc += (texelFetch(B, clamp(q + dir * i, ivec2(0), m), 0) + texelFetch(B, clamp(q - dir * i, ivec2(0), m), 0)) * w[i];
  o = acc;
}`;

const FINAL = HEAD + `
uniform sampler2D Ink, Lt, Bl;
uniform vec2 res, cam;
uniform float zoom, t, frameNo, fade, keyI, rayI;
uniform vec2 ldir;
uniform vec3 c1, c2, c3;
vec4 bsp(sampler2D s, vec2 uv) {
  vec2 sz = vec2(textureSize(s, 0));
  vec2 p = uv * sz - 0.5, i = floor(p), f = p - i;
  vec2 f2 = f * f, f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0, w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0, w3 = f3 / 6.0;
  vec2 g0 = w0 + w1, g1 = w2 + w3;
  vec2 h0 = (i - 0.5 + w1 / g0) / sz, h1 = (i + 1.5 + w3 / g1) / sz;
  return g0.y * (g0.x * texture(s, vec2(h0.x, h0.y)) + g1.x * texture(s, vec2(h1.x, h0.y)))
       + g1.y * (g0.x * texture(s, vec2(h0.x, h1.y)) + g1.x * texture(s, vec2(h1.x, h1.y)));
}
// bounded caustic web: ridges of two domain-warped noise layers
float caustic(vec2 p, float tt) {
  vec2 w = vec2(vnoise(p * 0.7 + tt * 0.3), vnoise(p * 0.7 + 5.2 - tt * 0.25));
  float a = vnoise(p + w * 2.2 + tt * 0.2);
  float b = vnoise(p * 1.4 - w * 1.6 - tt * 0.17 + 9.0);
  return pow(1.0 - abs(a - 0.5) * 2.0, 10.0) + 0.7 * pow(1.0 - abs(b - 0.5) * 2.0, 10.0);
}
vec3 motes(vec2 p, float scale, float seed, float sharp) {
  vec2 g = p * scale + vec2(t * 0.05, -t * 0.08), id = floor(g), f = fract(g) - 0.5;
  float h = hash(id + seed);
  if (h > 0.3) return vec3(0);
  float r = mix(0.05, 0.2, hash(id + seed + 1.3)) / sharp;
  r = min(r, 0.34);
  vec2 off = (vec2(hash(id + seed + 3.1), hash(id + seed + 7.7)) - 0.5) * 2.0 * (0.44 - r);   // disc stays inside its cell
  off += 0.04 * vec2(sin(t * 0.9 + h * 40.0), cos(t * 0.7 + h * 13.0));
  float d = length(f - off);
  return vec3(0.75, 0.9, 1.0) * smoothstep(r, r * 0.4, d);
}
void main() {
  vec2 frag = gl_FragCoord.xy, sc = frag / res;
  vec2 uv = cam + (sc - 0.5) / zoom;
  vec2 asp = vec2(res.x / res.y, 1.0);

  // ---- water: deep gradient, light shafts from the surface, caustic shimmer near the top
  vec3 deep = mix(vec3(0.003, 0.008, 0.022), vec3(0.012, 0.050, 0.080), smoothstep(0.0, 1.05, sc.y));
  deep += vec3(0.02, 0.06, 0.07) * exp(-pow(length((sc - vec2(0.42, 1.08)) * asp * vec2(1.0, 0.8)), 2.0) * 3.0);
  vec2 perp = vec2(-ldir.y, ldir.x);
  float sh = dot(uv * asp, perp);
  float rays = pow(vnoise(vec2(sh * 22.0, t * 0.15)), 2.0) * 0.6 + pow(vnoise(vec2(sh * 7.0 + 3.0, t * 0.1)), 2.0) * 0.7;
  rays *= smoothstep(-0.1, 1.0, uv.y) * rayI;
  vec4 lt = texture(Lt, uv);
  vec3 shaft = vec3(0.30, 0.55, 0.62) * rays * lt.rgb;
  float cs = caustic(uv * asp * vec2(9.0, 5.0) + vec2(0.0, 3.0), t * 0.5 + 23.0);
  vec3 bg = deep + shaft * 0.26 + vec3(0.30, 0.60, 0.66) * cs * smoothstep(0.8, 1.02, uv.y) * 0.10;

  // ---- ink: scattering cloud lit from above, self-shadowed by the light march
  vec3 d = max(bsp(Ink, uv).rgb, 0.0);
  float Dn = d.r + d.g + d.b;
  float alpha = 1.0 - exp(-1.0 * Dn);
  vec3 cov = 1.0 - exp(-1.0 * d);                                      // per-ink coverage
  vec3 alb = (cov.r * c1 + cov.g * c2 + cov.b * c3) / max(alpha, 1e-3);  // scattering adds where inks overlap
  alb = pow(alb, vec3(1.15));
  vec2 px = 1.5 / vec2(${LX}.0, ${LY}.0);
  float gx = texture(Lt, uv + vec2(px.x, 0)).a - texture(Lt, uv - vec2(px.x, 0)).a;
  float gy = texture(Lt, uv + vec2(0, px.y)).a - texture(Lt, uv - vec2(0, px.y)).a;
  vec3 n = normalize(vec3(-gx, -gy, 0.6));
  float lam = clamp(dot(n, normalize(vec3(ldir, 0.55))) * 0.5 + 0.5, 0.0, 1.0);
  float cook = 0.85 + 0.3 * caustic(uv * asp * 6.0, t * 0.5 + 11.0);
  vec3 light = vec3(0.07, 0.09, 0.12) + keyI * lt.rgb * (0.35 + 0.9 * lam) * cook;
  float thick = 1.0 - exp(-0.6 * Dn);                                  // more ink scatters more light
  vec3 ink = alb * light * (0.7 + 0.8 * thick);
  ink += alb * alb * (1.0 - alpha) * alpha * 1.6 * lt.rgb;           // translucent fringes glow
  vec3 col = bg * (1.0 - 0.9 * alpha) + ink * alpha * 1.7;

  // ---- in-scattering bloom around the plumes
  vec3 bd = bsp(Bl, uv).rgb;
  col += (bd.r * c1 + bd.g * c2 + bd.b * c3) * 0.34 * keyI;

  // ---- motes in the water (depth)
  vec2 mp = (sc - 0.5) * asp;
  col += motes(mp, 26.0, 2.0, 1.0) * 0.10 * (0.4 + rays);
  col += motes(mp * 0.9, 9.0, 7.0, 0.5) * 0.035;

  col *= fade;
  col = 1.0 - exp(-col * 1.4);
  vec2 vq = (sc - 0.5) * vec2(1.0, 0.6) * 2.0;
  col *= 1.0 - 0.5 * pow(clamp(dot(vq, vq) * 0.55, 0.0, 1.0), 1.5);
  col += (hash(frag + frameNo * 7.13) - 0.5) * 0.016;
  o = vec4(pow(max(col, 0.0), vec3(0.95)), 1.0);
}`;

// ---------- the story ----------
const zoom = track([[0, 1.06], [D, 1.16, (p) => p]]);
const camX = track([[0, 0.5], [D, 0.5]]);
const camY = track([[0, 0.53], [D, 0.5]]);
const fade = track([[0, 0.45], [1.0, 1.0, ease.outCubic], [D - 0.8, 1.0], [D, 0.8]]);
const keyI = track([[0, 1.35], [D, 1.35]]);
const rayI = track([[0, 0.7], [4.5, 1.0], [D, 0.8]]);

const INK = { c1: [0.10, 0.78, 0.92], c2: [1.00, 0.24, 0.46], c3: [0.95, 0.68, 0.30] };
// what each ink absorbs from white light (its complement, plus a little grey)
const ABS = (c) => c.map((x) => 1.05 - x * 0.9);

defineDemo({
  id: '12-stable-fluids',
  title: '물속에 퍼지는 잉크',
  tech: 'GPU 유체 시뮬레이션 · Stable Fluids',
  duration: D,
  background: '#02060c',
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2' });
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float missing');
    if (!gl.getExtension('OES_texture_float_linear')) throw new Error('OES_texture_float_linear missing');

    // --- tiny GL kit ---
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n'));
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT);
    const program = (src) => {
      const p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, src));
      gl.bindAttribLocation(p, 0, 'p');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < nu; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const target = (w, h, fmt, filter = gl.LINEAR) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, fmt, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('incomplete framebuffer');
      return { tex, fb, w, h, fmt };
    };
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
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
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t.tex);
        if (P.u[name]) gl.uniform1i(P.u[name], unit);
        unit++;
      }
      set(P.u);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const blit = (src, dst) => {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, src.fb);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dst.fb);
      gl.blitFramebuffer(0, 0, src.w, src.h, 0, 0, dst.w, dst.h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    };

    const P = {
      clear: program(CLEAR), curl: program(CURL), force: program(FORCE), div: program(DIV), jac: program(JAC),
      grad: program(GRAD), advV: program(ADV_V), advD: program(ADV_D), macD: program(MAC_D), light: program(LIGHT), down: program(DOWN),
      blur: program(BLUR), final: program(FINAL),
    };
    // state (ping-pong pairs) + temporaries
    let V = target(NX, NY, gl.RG32F), V2 = target(NX, NY, gl.RG32F);
    let Pr = target(NX, NY, gl.R32F, gl.NEAREST), Pr2 = target(NX, NY, gl.R32F, gl.NEAREST);
    let Ink = target(DX, DY, gl.RGBA16F), Ink2 = target(DX, DY, gl.RGBA16F);
    const Fwd = target(DX, DY, gl.RGBA16F);
    const Cu = target(NX, NY, gl.R32F, gl.NEAREST), Dv = target(NX, NY, gl.R32F, gl.NEAREST);
    const Lt = target(LX, LY, gl.RGBA16F), B1 = target(BX, BY, gl.RGBA16F), B2 = target(BX, BY, gl.RGBA16F);

    const aspect = NX / NY;
    const setEmitters = (u, t, forInk) => {
      const es = emitters(t);
      const em = new Float32Array(12), ev = new Float32Array(6), ec = new Float32Array(9);
      es.forEach((e, i) => {
        em.set([e.x, e.y, e.r, e.k], i * 4);
        ev.set([Math.cos(e.a * deg) * e.v, Math.sin(e.a * deg) * e.v], i * 2);
        ec.set(e.c, i * 3);
      });
      gl.uniform4fv(u.em, em);
      if (forInk) gl.uniform3fv(u.ec, ec); else gl.uniform2fv(u.ev, ev);
    };

    const px = new Float32Array(4);
    const R = replay({
      dt: 1 / FPS,
      every: 30,
      init: () => {
        for (const T of [V, Pr, Ink]) pass(P.clear, T, {}, (u) => gl.uniform4f(u.val, 0, 0, 0, 0));
      },
      step: (n) => {
        for (let s = 0; s < SUB; s++) {
          const t = (n * SUB + s) * DT;
          pass(P.curl, Cu, { V });
          pass(P.force, V2, { V, C: Cu, Ink }, (u) => {
            gl.uniform1f(u.dt, DT); gl.uniform1f(u.eps, 7.0); gl.uniform1f(u.grav, 2.5); gl.uniform1f(u.aspect, aspect);
            setEmitters(u, t, false);
          });
          [V, V2] = [V2, V];
          pass(P.div, Dv, { V });
          for (let i = 0; i < JACOBI; i++) {
            pass(P.jac, Pr2, { Pr, Dv }, (u) => gl.uniform1f(u.k, i === 0 ? 0.8 : 1.0));
            [Pr, Pr2] = [Pr2, Pr];
          }
          pass(P.grad, V2, { Pr, V });
          [V, V2] = [V2, V];
          pass(P.advV, V2, { V }, (u) => { gl.uniform1f(u.dt, DT); gl.uniform1f(u.diss, 0.15); });
          [V, V2] = [V2, V];
          pass(P.advD, Fwd, { V, Ink }, (u) => { gl.uniform2f(u.vs, NX, NY); gl.uniform1f(u.dt, DT); });
          pass(P.macD, Ink2, { V, Ink, F: Fwd }, (u) => {
            gl.uniform2f(u.vs, NX, NY); gl.uniform1f(u.dt, DT); gl.uniform1f(u.diss, 0.05);
            gl.uniform1f(u.aspect, aspect); gl.uniform1f(u.rate, 3.4);
            gl.uniform1f(u.pulse, 0.55 + 0.45 * Math.cos(2 * Math.PI * 7 * t));
            setEmitters(u, t, true);
          });
          [Ink, Ink2] = [Ink2, Ink];
        }
        // headless verification only: wait for the (software) GPU here with a 1-pixel readback, so a long
        // seek doesn't pile up behind the screenshot's 30 s timeout. Live playback never stalls on this.
        if (HEADLESS) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, V.fb);
          gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, px);
        }
      },
      save: () => {
        const c = { V: target(NX, NY, gl.RG32F), Pr: target(NX, NY, gl.R32F, gl.NEAREST), Ink: target(DX, DY, gl.RGBA16F) };
        blit(V, c.V); blit(Pr, c.Pr); blit(Ink, c.Ink);
        return c;
      },
      load: (c) => { blit(c.V, V); blit(c.Pr, Pr); blit(c.Ink, Ink); },
    });

    const ldirOf = (t) => { const a = (100 + 5 * Math.sin(t * 0.3)) * deg; return [Math.cos(a), Math.sin(a)]; };   // toward the surface
    this.render = (t) => {
      const n = Math.round(t * FPS);
      const ld = ldirOf(t);
      pass(P.light, Lt, { Ink }, (u) => {
        gl.uniform2f(u.ldir, ld[0], ld[1]);
        gl.uniform3fv(u.abs1, ABS(INK.c1)); gl.uniform3fv(u.abs2, ABS(INK.c2)); gl.uniform3fv(u.abs3, ABS(INK.c3));
      });
      pass(P.down, B1, { Ink });
      pass(P.blur, B2, { B: B1 }, (u) => gl.uniform2i(u.dir, 1, 0));
      pass(P.blur, B1, { B: B2 }, (u) => gl.uniform2i(u.dir, 0, 1));
      pass(P.final, null, { Ink, Lt, Bl: B1 }, (u) => {
        gl.uniform2f(u.res, W, H); gl.uniform2f(u.cam, camX(t), camY(t)); gl.uniform1f(u.zoom, zoom(t));
        gl.uniform1f(u.t, t); gl.uniform1f(u.frameNo, n); gl.uniform1f(u.fade, fade(t));
        gl.uniform1f(u.keyI, keyI(t)); gl.uniform1f(u.rayI, rayI(t));
        gl.uniform2f(u.ldir, ld[0], ld[1]);
        gl.uniform3fv(u.c1, INK.c1); gl.uniform3fv(u.c2, INK.c2); gl.uniform3fv(u.c3, INK.c3);
      });
    };
    this.R = R;
  },
  async frame(t) {
    await this.R.seek(t);
    this.render(t);
  },
});
