/*
 * 11 · 스스로 그리는 무늬 — Gray–Scott reaction–diffusion on the GPU (WebGL2, float ping-pong textures).
 * The state (u, v, birth time) lives in an RGBA32F texture; every video frame runs K(n) explicit Euler
 * iterations of the 9-point Laplacian. Feed/kill vary across space and time (spots → stripes → coral),
 * then the field is lit as a wet relief at full resolution (B-spline upsampling, gradient normals,
 * specular, ambient occlusion from a blurred copy, a glowing growth front).
 * Seeking uses replay(): fixed steps per frame, GPU-side checkpoints (blitFramebuffer copies).
 */
import { defineDemo, replay, track, ease, rand, clamp } from '../_lib/stage.js';

const HEADLESS = new URLSearchParams(location.search).has('render');
const D = 9, FPS = 30;
const SW = 360, SH = 640;          // simulation grid (screen is 3× larger)
const LW = 90, LH = 160;           // low-res blur grid (AO, bloom, region mask)

// ---------- seeds: where life starts (sim uv, GL y up), the frame it appears, its radius in cells ----------
const R0 = rand(11);
const SEEDS = [
  [0, 0.50, 0.57, 7],
  [26, 0.23, 0.80, 6],
  [38, 0.79, 0.34, 6],
  [50, 0.76, 0.86, 5],
  [62, 0.20, 0.30, 6],
  [74, 0.52, 0.12, 5],
].map(([f, x, y, r]) => ({ f, x: x + (R0() - 0.5) * 0.04, y: y + (R0() - 0.5) * 0.03, r, s: R0() * 100 }));

// iterations per video frame (a function of the step index only)
const K = (n) => 110;

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
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
`;

// initial state: u = 1, v = 0 everywhere, no birth
const INIT = HEAD + `void main() { o = vec4(1.0, 0.0, 0.0, 0.0); }`;

// a seed: v injected in a ragged disc (copy + modify)
const SPLAT = HEAD + `
uniform sampler2D S; uniform vec2 at; uniform float rad, salt;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy);
  vec4 c = texelFetch(S, q, 0);
  vec2 d = gl_FragCoord.xy - at;
  float a = atan(d.y, d.x);
  float r = rad * (0.8 + 0.45 * vnoise(vec2(a * 2.0 + salt, salt)));
  float k = step(length(d), r);
  float j = hash(gl_FragCoord.xy + salt);
  o = mix(c, vec4(0.42 + 0.1 * j, 0.25 + 0.12 * j, c.z, c.w), k);
}`;

// feed / kill per cell for the current step: spots (mitosis) → stripes → coral, a wave from the first seed
const PARAM = HEAD + `
uniform vec2 grid, ctr; uniform float wave, outer;
void main() {
  vec2 uv = gl_FragCoord.xy / grid;
  vec2 d = (uv - ctr) * vec2(grid.x / grid.y, 1.0);
  float n = fbm(uv * vec2(3.0, 5.3) + 3.1);
  float r = length(d) + 0.22 * (n - 0.5);
  float p = smoothstep(wave + 0.12, wave - 0.12, r);                 // 1 inside the wave = coral
  p *= 1.0 - outer * smoothstep(0.38, 0.52, r + 0.1 * (n - 0.5));     // the rim keeps its spots (skin)
  // spots (0.0367, 0.0649) → worms (0.046, 0.0635) → coral (0.0545, 0.062)
  vec2 fk = mix(vec2(0.0367, 0.0649), vec2(0.0545, 0.0620), p);
  o = vec4(fk, p, 0.0);
}`;

// one explicit Euler step of Gray–Scott (Du = 1, Dv = 0.5, dt = 1, 9-point Laplacian), birth time stamped in .w
const SIM = HEAD + `
uniform sampler2D S, P; uniform float now;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(S, 0) - 1;
  int x0 = max(q.x - 1, 0), x1 = min(q.x + 1, m.x), y0 = max(q.y - 1, 0), y1 = min(q.y + 1, m.y);
  vec4 c = texelFetch(S, q, 0);
  vec2 a = texelFetch(S, ivec2(x0, q.y), 0).xy + texelFetch(S, ivec2(x1, q.y), 0).xy
         + texelFetch(S, ivec2(q.x, y0), 0).xy + texelFetch(S, ivec2(q.x, y1), 0).xy;
  vec2 b = texelFetch(S, ivec2(x0, y0), 0).xy + texelFetch(S, ivec2(x1, y0), 0).xy
         + texelFetch(S, ivec2(x0, y1), 0).xy + texelFetch(S, ivec2(x1, y1), 0).xy;
  vec2 lap = 0.2 * a + 0.05 * b - c.xy;
  vec2 fk = texelFetch(P, q, 0).xy;
  float uvv = c.x * c.y * c.y;
  float u = c.x + lap.x - uvv + fk.x * (1.0 - c.x);
  float v = c.y + 0.5 * lap.y + uvv - (fk.x + fk.y) * c.y;
  float born = (c.w == 0.0 && v > 0.18) ? now : c.w;
  o = vec4(clamp(u, 0.0, 1.0), clamp(v, 0.0, 1.0), c.z, born);
}`;

// surface, stage 1 (sim res): a crisp mask of the pattern, fresh-growth glow, "reached" flag
const MASK = HEAD + `
uniform sampler2D S; uniform float now;
void main() {
  vec4 c = texelFetch(S, ivec2(gl_FragCoord.xy), 0);
  float age = c.w > 0.0 ? now - c.w : 9.0;
  float glow = exp(-age / 0.032) * smoothstep(0.08, 0.3, c.y);
  o = vec4(smoothstep(0.05, 0.25, c.y), glow, c.w > 0.0 ? 1.0 : 0.0, 0.0);
}`;

// surface, stage 2: relief = blurred mask (pillowy domes), normal from its gradient
const SURF = HEAD + `
uniform sampler2D M, Hb;
float H(int x, int y) { return texelFetch(Hb, ivec2(x, y), 0).x; }
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(Hb, 0) - 1;
  int x0 = max(q.x - 1, 0), x1 = min(q.x + 1, m.x), y0 = max(q.y - 1, 0), y1 = min(q.y + 1, m.y);
  vec4 c = texelFetch(M, q, 0);
  o = vec4(c.x, 0.5 * (H(x1, q.y) - H(x0, q.y)), 0.5 * (H(q.x, y1) - H(q.x, y0)), c.y);
}`;

// 4× downsample: (relief, glow, reached, material p from the feed/kill map)
const DOWN = HEAD + `
uniform sampler2D Hb, P;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy) * 4;
  vec4 acc = vec4(0);
  for (int j = 0; j < 4; j++) for (int i = 0; i < 4; i++) {
    ivec2 r = q + ivec2(i, j);
    vec4 s = texelFetch(Hb, r, 0);
    acc += vec4(s.x, s.y, s.z, texelFetch(P, r, 0).z);
  }
  o = acc / 16.0;
}`;

// separable gaussian at low res
const BLUR = HEAD + `
uniform sampler2D B; uniform ivec2 dir;
void main() {
  ivec2 q = ivec2(gl_FragCoord.xy), m = textureSize(B, 0) - 1;
  const float w[5] = float[](0.2270, 0.1945, 0.1216, 0.0540, 0.0162);
  vec4 acc = texelFetch(B, q, 0) * w[0];
  for (int i = 1; i < 5; i++) {
    acc += (texelFetch(B, clamp(q + dir * i, ivec2(0), m), 0) + texelFetch(B, clamp(q - dir * i, ivec2(0), m), 0)) * w[i];
  }
  o = acc;
}`;

// the picture
const FINAL = HEAD + `
uniform sampler2D Sf, Hb, Bl;
uniform vec2 res, simSize, blSize, cam;
uniform vec3 pool;
uniform float zoom, t, frameNo, lightA, lightE, spec, glowI, fade, bump, focusY, dofI;
// cubic B-spline sample from 4 bilinear taps (smooth, C2 — no texel facets at 3× magnification)
vec4 bsp(sampler2D s, vec2 uv, vec2 sz) {
  vec2 p = uv * sz - 0.5, i = floor(p), f = p - i;
  vec2 f2 = f * f, f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0, w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0, w3 = f3 / 6.0;
  vec2 g0 = w0 + w1, g1 = w2 + w3;
  vec2 h0 = (i - 0.5 + w1 / g0) / sz, h1 = (i + 1.5 + w3 / g1) / sz;
  return g0.y * (g0.x * texture(s, vec2(h0.x, h0.y)) + g1.x * texture(s, vec2(h1.x, h0.y)))
       + g1.y * (g0.x * texture(s, vec2(h0.x, h1.y)) + g1.x * texture(s, vec2(h1.x, h1.y)));
}
// out-of-focus motes drifting in front of the surface (foreground depth)
vec3 motes(vec2 p, float scale, float seed, float par) {
  vec2 g = p * scale + vec2(0.0, -t * 0.12 * par), id = floor(g), f = fract(g) - 0.5;
  float h = hash(id + seed);
  if (h > 0.22) return vec3(0);
  float r = 0.16 + 0.14 * hash(id + seed + 1.3);
  vec2 off = (vec2(hash(id + seed + 3.1), hash(id + seed + 7.7)) - 0.5) * 2.0 * (0.44 - r);   // disc stays inside its cell
  off += 0.05 * vec2(sin(t * 0.7 + h * 30.0), cos(t * 0.5 + h * 17.0));
  float d = length(f - off);
  float disc = smoothstep(r, r * 0.72, d) * (0.55 + 0.45 * smoothstep(r * 0.5, r, d));
  vec3 col = mix(vec3(1.0, 0.70, 0.45), vec3(0.45, 0.75, 0.9), step(0.6, hash(id + seed + 5.0)));
  return col * disc;
}
void main() {
  vec2 frag = gl_FragCoord.xy, sc = frag / res;
  vec2 uv = cam + (sc - 0.5) / zoom;
  // depth of field: a focus band through the light pool, softer toward top and bottom
  float dof = smoothstep(0.22, 0.62, abs(sc.y - focusY)) * dofI;
  vec4 s = bsp(Sf, uv, simSize);
  vec4 sb = bsp(Hb, uv, simSize);
  vec4 b = bsp(Bl, uv, blSize);
  float aa = clamp(fwidth(s.x) * 1.5, 0.06, 0.5);                  // crisp at any zoom, antialiased
  float m = mix(smoothstep(0.5 - aa, 0.5 + aa, s.x), smoothstep(0.1, 0.9, sb.x), dof);
  vec3 n = normalize(vec3(-s.yz * bump * (1.0 - 0.75 * dof), 1.0));

  // material: pearl-amber spots → coral labyrinth; teal-ink valleys
  float region = smoothstep(0.02, 0.45, b.z);
  float mat = smoothstep(0.15, 0.85, b.w);
  float hue = fbm(uv * vec2(2.2, 3.9) + 7.0);
  vec3 skin = mix(vec3(0.98, 0.74, 0.50), mix(vec3(0.95, 0.36, 0.26), vec3(0.88, 0.25, 0.22), smoothstep(0.35, 0.7, hue)), mat);
  vec3 deep = mix(vec3(0.55, 0.26, 0.12), vec3(0.50, 0.08, 0.12), mat);
  vec3 valley = mix(vec3(0.014, 0.026, 0.042), vec3(0.036, 0.100, 0.118), region);
  skin = mix(deep, skin, smoothstep(0.55, 0.98, n.z));         // flanks deeper, crowns brighter
  vec3 alb = mix(valley, skin, m);

  // light: a warm key that sweeps, pooled around the subject; cool fill from below; wet specular
  vec3 L = normalize(vec3(cos(lightA) * cos(lightE), sin(lightA) * cos(lightE), sin(lightE)));
  vec3 Hh = normalize(L + vec3(0, 0, 1));
  vec2 pc = (sc - pool.xy) * vec2(res.x / res.y, 1.0);
  float poolK = mix(0.38, 1.0, exp(-dot(pc, pc) / (pool.z * pool.z)));
  float dif = clamp((dot(n, L) + 0.25) / 1.25, 0.0, 1.0);
  float fill = clamp(dot(n, normalize(vec3(0.5, -0.8, 0.35))), 0.0, 1.0);
  float nh = max(dot(n, Hh), 0.0);
  float sp = (pow(nh, 90.0) * 1.1 + pow(nh, 16.0) * 0.10) * spec * m * (1.0 - 0.7 * dof);
  float ao = clamp(1.0 - 1.6 * max(b.x - sb.x, 0.0), 0.3, 1.0) * mix(0.55, 1.0, m);
  vec3 col = alb * vec3(1.0, 0.94, 0.86) * (0.08 + 1.15 * dif) * ao * poolK;
  col += alb * vec3(0.30, 0.55, 0.78) * fill * 0.45 * ao;
  col += vec3(1.0, 0.94, 0.86) * sp * poolK;
  // subsurface: light leaking through the ridges warms their shadow side
  col += deep * vec3(1.0, 0.5, 0.4) * m * (1.0 - dif) * 0.22;
  // fresh growth glows; its bloom spills onto the floor
  vec3 gC = mix(vec3(1.0, 0.80, 0.50), vec3(1.0, 0.56, 0.40), mat);
  col += gC * (sb.y * 0.9 + b.y * 0.7) * glowI;

  // the unreached floor: a faint wet sheen under the same light
  float tex = fbm(uv * vec2(9.0, 16.0) + 4.0);
  col += (1.0 - region) * vec3(0.018, 0.038, 0.052) * (0.4 + 0.9 * tex) * (0.5 + dif) * poolK;

  // foreground motes (parallax with the camera, out of focus)
  vec2 mp = (sc - 0.5) * vec2(res.x / res.y, 1.0) / mix(1.0, zoom, 0.6);
  col += motes(mp, 6.0, 3.0, 1.0) * 0.06 + motes(mp, 3.5, 11.0, 1.6) * 0.04;

  // tone, vignette, grain
  col *= fade;
  col = 1.0 - exp(-col * 1.35);
  vec2 vq = (sc - 0.5) * vec2(1.0, 0.62) * 2.0;
  col *= 1.0 - 0.55 * pow(clamp(dot(vq, vq) * 0.55, 0.0, 1.0), 1.4);
  col += (hash(frag + frameNo * 7.13) - 0.5) * 0.016;
  o = vec4(pow(max(col, 0.0), vec3(0.94)), 1.0);
}`;

// ---------- the story (all pure functions of t) ----------
const zoom = track([[0, 2.3], [2.0, 1.9, ease.inOutCubic], [6.3, 1.09, ease.inOutCubic], [D, 1.32, ease.inOutCubic]]);
const camX = track([[0, SEEDS[0].x], [6.3, 0.5], [D, 0.47]]);
const camY = track([[0, SEEDS[0].y], [6.3, 0.52], [D, 0.56]]);
const lightA = track([[0, 2.15], [4.4, 2.35], [7.2, 3.35], [D, 3.55]]);
const lightE = track([[0, 0.55], [4.5, 0.75], [D, 0.5]]);
const spec = track([[0, 0.4], [4.0, 0.6], [6.0, 1.1], [D, 0.7]]);
const glowI = track([[0, 1.0], [6.5, 1.0], [D, 0.45]]);
const poolX = track([[0, 0.5], [4, 0.46], [7, 0.55], [D, 0.5]]);
const poolY = track([[0, 0.55], [D, 0.56]]);
const poolR = track([[0, 0.32], [3, 0.42], [6.5, 0.62], [D, 0.48]]);
const dofI = track([[0, 1.0], [5, 0.8], [6.5, 0.55], [D, 0.9]]);
const fade = track([[0, 0.3], [0.9, 1.0, ease.outCubic], [D - 0.8, 1.0], [D, 0.8]]);
// sim-time functions (of step index n)
const wave = (n) => track([[100, -0.15], [215, 0.72, ease.inOutCubic]])(n);
const outer = (n) => track([[175, 0.0], [240, 1.0]])(n);

defineDemo({
  id: '11-reaction-diffusion',
  title: '스스로 그리는 무늬',
  tech: 'GPGPU 반응-확산 · Gray–Scott',
  duration: D,
  background: '#05060b',
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
    const target = (w, h, fmt = gl.RGBA32F, filter = gl.LINEAR) => {
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
      return { tex, fb, w, h };
    };
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    // draw program `P` into target `dst` (null = screen) with textures bound to its sampler uniforms in order
    const pass = (P, dst, tex = {}, set = () => {}) => {
      gl.useProgram(P.p);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null);
      gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H);
      let unit = 0;
      for (const [name, t] of Object.entries(tex)) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t.tex);
        gl.uniform1i(P.u[name], unit++);
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

    const P = { init: program(INIT), splat: program(SPLAT), param: program(PARAM), sim: program(SIM),
      mask: program(MASK), surf: program(SURF), down: program(DOWN), blur: program(BLUR), final: program(FINAL) };
    let A = target(SW, SH), B = target(SW, SH);           // the state, ping-pong
    const prm = target(SW, SH, gl.RGBA32F, gl.NEAREST);    // feed/kill for this step
    const mk = target(SW, SH, gl.RGBA16F), hb1 = target(SW, SH, gl.RGBA16F), hb = target(SW, SH, gl.RGBA16F);
    const surf = target(SW, SH, gl.RGBA16F);
    const lo1 = target(LW, LH, gl.RGBA16F), lo2 = target(LW, LH, gl.RGBA16F);

    const params = (n) => pass(P.param, prm, {}, (u) => {
      gl.uniform2f(u.grid, SW, SH); gl.uniform2f(u.ctr, SEEDS[0].x, SEEDS[0].y);
      gl.uniform1f(u.wave, wave(n)); gl.uniform1f(u.outer, outer(n));
    });

    const px = new Float32Array(4);
    // plant the seeds scheduled for step n (a ragged disc of v)
    const sow = (n) => {
      for (const s of SEEDS) if (s.f === n) {
        pass(P.splat, B, { S: A }, (u) => { gl.uniform2f(u.at, s.x * SW, s.y * SH); gl.uniform1f(u.rad, s.r); gl.uniform1f(u.salt, s.s); });
        [A, B] = [B, A];
      }
    };
    const R = replay({
      dt: 1 / FPS,
      every: 30,
      init: () => { pass(P.init, A); sow(0); },
      step: (n) => {
        const now = n / FPS / D;
        if (n > 0) sow(n);
        params(n);
        const k = K(n);
        for (let i = 0; i < k; i++) {
          pass(P.sim, B, { S: A, P: prm }, (u) => gl.uniform1f(u.now, now + 1e-4));
          [A, B] = [B, A];
        }
        // headless verification only: wait for the (software) GPU here with a 1-pixel readback, so a long
        // seek doesn't pile up behind the screenshot's 30 s timeout. Live playback never stalls on this.
        if (HEADLESS) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, A.fb);
          gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, px);
        }
      },
      save: () => { const c = target(SW, SH); blit(A, c); return c; },
      load: (c) => { blit(c, A); },
    });

    this.render = (t) => {
      const n = Math.round(t * FPS), now = n / FPS / D;
      params(n);   // recomputed from n: never stale after a checkpoint load
      pass(P.mask, mk, { S: A }, (u) => gl.uniform1f(u.now, now));
      pass(P.blur, hb1, { B: mk }, (u) => gl.uniform2i(u.dir, 1, 0));
      pass(P.blur, hb, { B: hb1 }, (u) => gl.uniform2i(u.dir, 0, 1));
      pass(P.surf, surf, { M: mk, Hb: hb });
      pass(P.down, lo1, { Hb: hb, P: prm });
      pass(P.blur, lo2, { B: lo1 }, (u) => gl.uniform2i(u.dir, 1, 0));
      pass(P.blur, lo1, { B: lo2 }, (u) => gl.uniform2i(u.dir, 0, 1));
      pass(P.final, null, { Sf: surf, Hb: hb, Bl: lo1 }, (u) => {
        gl.uniform2f(u.res, W, H); gl.uniform2f(u.simSize, SW, SH); gl.uniform2f(u.blSize, LW, LH);
        gl.uniform2f(u.cam, camX(t), camY(t)); gl.uniform1f(u.zoom, zoom(t));
        gl.uniform1f(u.t, t); gl.uniform1f(u.frameNo, n);
        gl.uniform1f(u.lightA, lightA(t)); gl.uniform1f(u.lightE, lightE(t));
        gl.uniform1f(u.spec, spec(t)); gl.uniform1f(u.glowI, glowI(t)); gl.uniform1f(u.fade, fade(t));
        gl.uniform1f(u.bump, 7.0);
        gl.uniform3f(u.pool, poolX(t), poolY(t), poolR(t)); gl.uniform1f(u.focusY, poolY(t)); gl.uniform1f(u.dofI, dofI(t));
      });
    };
    this.R = R;
  },
  async frame(t) {
    await this.R.seek(t);
    this.render(t);
  },
});
