/*
 * 05 · 흐르는 성운 — one WebGL2 fragment shader, no geometry.
 * Domain-warped fBm (noise fed back into its own coordinates, twice) makes the gas; three star layers
 * from a hashed grid; a star ignites in the middle with a soft core, a halo and diffraction spikes.
 * Everything is a function of the uniforms below, which are pure functions of t (track()).
 */
import { defineDemo, track, ease } from '../_lib/stage.js';

const FRAG = `#version 300 es
precision highp float;
uniform vec2 res;
uniform float t, reveal, warp, zoom, ignite, frameNo;
uniform vec2 pan;
out vec4 o;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
const mat2 ROT = mat2(0.8, 0.6, -0.6, 0.8);
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) { s += a * noise(p); p = ROT * p * 2.03 + 17.1; a *= 0.5; }
  return s;
}
// a star layer: one candidate star per cell, kept with probability k. A star sits up to 0.4 cell from its cell
// centre and its halo reaches 0.35 cell, so its light crosses into neighbouring cells: every pixel sums the
// stars of the 3×3 cells around it (looking only at its own cell cut the halos off at the cell edges).
vec3 stars(vec2 uv, float scale, float k, float seed) {
  vec2 g = uv * scale, base = floor(g);
  vec3 sum = vec3(0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = base + vec2(i, j);
    float h = hash(id + seed);
    if (h > k) continue;
    vec2 off = vec2(hash(id + seed + 3.1), hash(id + seed + 7.7)) - 0.5;
    float d = length(g - (id + 0.5 + off * 0.8));
    if (d > 0.35) continue;
    float tw = 0.65 + 0.35 * sin(t * (1.5 + 3.0 * hash(id + 9.0)) + h * 40.0);
    float b = smoothstep(0.09, 0.0, d) * tw + 0.35 * smoothstep(0.35, 0.0, d) * tw * tw;
    sum += mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.85, 0.7), hash(id + 2.0)) * b;
  }
  return sum;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5 * res) / res.x;          // x ∈ [-0.5, 0.5], y ∈ [-0.89, 0.89]
  vec2 p = uv / zoom + pan;

  // domain warp: q bends p, r bends p again through q, f is the gas density
  vec2 q = vec2(fbm(p * 2.2 + vec2(0.0, 0.03 * t)), fbm(p * 2.2 + vec2(5.2, 1.3) - 0.02 * t));
  vec2 r = vec2(fbm(p * 1.8 + warp * 2.6 * q + vec2(1.7, 9.2) + 0.06 * t),
                fbm(p * 1.8 + warp * 2.6 * q + vec2(8.3, 2.8) - 0.05 * t));
  float f = fbm(p * 1.8 + warp * 2.6 * r);
  float soft = fbm(p * 0.9 + 1.3 * r);               // a low-frequency glow under the filaments

  // the gas: colour from where the warp came from, brightness from density
  vec3 col = mix(vec3(0.05, 0.03, 0.12), vec3(0.45, 0.10, 0.45), clamp(f * f * 2.2, 0.0, 1.0));
  col = mix(col, vec3(0.05, 0.42, 0.62), clamp(length(q) * 0.9 - 0.25, 0.0, 1.0));
  col = mix(col, vec3(1.0, 0.55, 0.35), clamp(r.x * r.x * 1.4 - 0.25, 0.0, 1.0) * 0.8);
  float density = smoothstep(0.25, 1.05, f + 0.25 * q.y);
  // dark dust lanes: another warped layer subtracts light
  float dust = smoothstep(0.52, 0.78, fbm(p * 4.0 + 2.0 * r + 11.0));
  vec3 gas = col * (0.25 + 2.2 * density * density) * (1.0 - 0.6 * dust);
  // emission glow: H-alpha red where it is dense, O-III teal at the edges, smooth and wide
  gas += vec3(0.85, 0.22, 0.32) * pow(smoothstep(0.35, 0.9, soft), 2.0) * 0.55;
  gas += vec3(0.10, 0.55, 0.60) * smoothstep(0.45, 0.8, soft) * (1.0 - density) * 0.35;

  // the reveal: the cloud brightens outward from the centre
  float rr = length(uv);
  float show = smoothstep(reveal * 1.25, reveal * 1.25 - 0.45, rr - 0.12 * f);
  vec3 c = gas * show;

  // stars behind and in front (parallax through zoom)
  vec2 sp = uv / mix(1.0, zoom, 0.35) + pan * 0.3;
  c += stars(sp, 38.0, 0.18, 1.0) * 0.9;
  c += stars(sp * 1.0 + 3.0, 90.0, 0.10, 4.0) * 0.6 * (1.0 - 0.6 * density * show);
  c += stars(uv / mix(1.0, zoom, 0.9) + pan, 14.0, 0.08, 9.0) * 1.2;

  // the newborn star: core + halo + 4 spikes, lighting the gas around it
  vec2 sc = uv - vec2(0.02, -0.06);
  float d = length(sc);
  float core = ignite * (0.006 / (d * d + 0.0004));
  float halo = ignite * 0.55 * exp(-d * 7.0);
  float spikes = ignite * (exp(-abs(sc.x) * 420.0) * exp(-abs(sc.y) * 6.0) + exp(-abs(sc.y) * 420.0) * exp(-abs(sc.x) * 6.0)) * 0.9;
  vec3 starCol = vec3(1.0, 0.86, 0.72);
  c += starCol * (core + halo + spikes);
  c += gas * ignite * 1.6 * exp(-d * 4.0);            // the gas near it lights up

  // tone map, vignette, grain (grain changes with the frame number, not with real time)
  c = 1.0 - exp(-c * 1.15);
  c *= 1.0 - 0.55 * pow(length(uv * vec2(1.0, 0.62)), 2.2);
  c += (hash(frag + frameNo * 7.13) - 0.5) * 0.02;
  o = vec4(pow(max(c, 0.0), vec3(0.92)), 1.0);
}`;

const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;

const D = 9;
const reveal = track([[0, 0.05], [3.6, 1.15, ease.inOutCubic]]);
const warp = track([[0, 0.15], [6.5, 1.0, ease.inOutCubic], [D, 1.08]]);
const zoom = track([[0, 0.75], [D, 1.35, (p) => p]]);
const panX = track([[0, -0.15], [D, 0.12, (p) => p]]);
const ignite = track([[5.6, 0], [6.4, 1.3, ease.outExpo], [7.2, 0.85], [D, 0.95]]);

defineDemo({
  id: '05-fbm-nebula',
  title: '흐르는 성운',
  tech: 'WebGL2 프래그먼트 셰이더 · 도메인 워핑 fBm',
  duration: D,
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2' });
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    for (const n of ['res', 't', 'reveal', 'warp', 'zoom', 'ignite', 'pan', 'frameNo']) U[n] = gl.getUniformLocation(prog, n);
    gl.viewport(0, 0, W, H);
    gl.uniform2f(U.res, W, H);
    this.draw = (t) => {
      gl.uniform1f(U.t, t);
      gl.uniform1f(U.reveal, reveal(t));
      gl.uniform1f(U.warp, warp(t));
      gl.uniform1f(U.zoom, zoom(t));
      gl.uniform1f(U.ignite, ignite(t));
      gl.uniform2f(U.pan, panX(t), 0.02 * Math.sin(t * 0.4));
      gl.uniform1f(U.frameNo, Math.round(t * 30));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  },
  frame(t) { this.draw(t); },
});
