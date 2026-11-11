/*
 * 10 · 보이지 않는 바람 — 122,880 particles carried by a divergence-free wind, entirely on the GPU.
 * State = particle texture (RGBA32F: x, y, dye, age; ping-pong) + trail buffer (RGBA16F, fades every step).
 * Wind = curl of a stream function ψ: a steady updraft plus slowly morphing fBm noise. Each depth layer z is a
 * 2-D slice of a 3-D field; an invisible sphere cuts every slice in a circle of radius √(R² − z²) and Bridson's
 * ramp (ψ·ramp(d/d₀)) turns that circle into a streamline, so the wind must go around it (curl noise, 2007).
 * Each particle carries a dye value (ψ where it was born); thin bands of dye light up like smoke wires in a wind
 * tunnel, so the lit particles trace material lines that wrap around the sphere without ever breaking up.
 * Each sim step draws every particle as an anti-aliased segment prev → next into the trail buffer, so the
 * picture is the long exposure of the flow. Seek = replay() from checkpoint copies of both textures.
 */
import { defineDemo, rand, track, ease, replay, lerp } from '../_lib/stage.js';

const D = 10;
const DT = 1 / 60;                 // two sim steps per video frame
const TW = 384, TH = 320;          // particle texture → 122,880 particles
const ZS = 0.25;                   // depth slab half-thickness (sphere units)
const CENTER = [0, 0.1];           // the hidden sphere, a little above the middle of the frame
const FZ = 2.2;                    // perspective: screen = world · 1 / (1 − z / FZ)

// story, all functions of sim time T = n · DT
const radius = track([[2.2, 0], [5.6, 0.27, ease.inOutCubic]]);                  // the sphere appears inside the wind
const WIND = 0.18;                                                               // updraft speed (width units / s)
const turb = track([[0, 0.07], [2.2, 0.062], [5.4, 0.014], [D, 0.008]]);      // turbulence: wild → laminar around the sphere
const decay = track([[0, 0.95], [4.5, 0.955], [8.0, 0.97], [D, 0.977]]);       // trails lengthen into a long exposure
const lines = track([[0, 0.85], [3.0, 0.85], [5.5, 1.0]]);                       // smoke lines sharpen as the shape appears
const front = track([[0, -1.1], [2.2, 1.3, (p) => 0.5 - 0.5 * Math.cos(Math.PI * p)]]);               // the lit smoke rises in from below
const exposure = track([[0, 0.7], [1.4, 1.25, ease.outCubic], [7.5, 1.3], [D, 1.2]]);

const HEAD = `#version 300 es
precision highp float;
precision highp int;
`;
const HASH = `
uint pcg(uint v) { uint s = v * 747796405u + 2891336453u; uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
float h1(uint v) { return float(pcg(v)) * (1.0 / 4294967295.0); }
// each particle lives on one of 7 depth sheets, fixed by its id
float layerZ(uint id) { return (floor(h1(id * 11u + 5u) * 7.0) / 3.0 - 1.0) * ${ZS}; }
`;
const NOISE = HASH + `
// a pseudo-random gradient per lattice corner: one integer hash, no trig (bit-exact and cheap)
vec3 grad(ivec3 c) {
  uint h = pcg(uint(c.x) * 0x8da6b343u ^ uint(c.y) * 0xd8163841u ^ uint(c.z) * 0xcb1ab31fu);
  return vec3(float(h & 1023u), float((h >> 10u) & 1023u), float((h >> 20u) & 1023u)) * (1.0 / 511.5) - 1.0;
}
// 3-D gradient noise with its analytic gradient (Quilez): returns (n, dn/dx, dn/dy, dn/dz)
vec4 noised(vec3 x) {
  ivec3 i = ivec3(floor(x)); vec3 f = fract(x);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec3 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  vec3 ga = grad(i), gb = grad(i + ivec3(1, 0, 0)), gc = grad(i + ivec3(0, 1, 0)), gd = grad(i + ivec3(1, 1, 0));
  vec3 ge = grad(i + ivec3(0, 0, 1)), gf = grad(i + ivec3(1, 0, 1)), gg = grad(i + ivec3(0, 1, 1)), gh = grad(i + ivec3(1, 1, 1));
  float va = dot(ga, f), vb = dot(gb, f - vec3(1, 0, 0)), vc = dot(gc, f - vec3(0, 1, 0)), vd = dot(gd, f - vec3(1, 1, 0));
  float ve = dot(ge, f - vec3(0, 0, 1)), vf = dot(gf, f - vec3(1, 0, 1)), vg = dot(gg, f - vec3(0, 1, 1)), vh = dot(gh, f - vec3(1, 1, 1));
  float v = va + u.x * (vb - va) + u.y * (vc - va) + u.z * (ve - va) + u.x * u.y * (va - vb - vc + vd)
          + u.y * u.z * (va - vc - ve + vg) + u.z * u.x * (va - vb - ve + vf) + u.x * u.y * u.z * (-va + vb + vc - vd + ve - vf - vg + vh);
  vec3 d = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.z * (ge - ga) + u.x * u.y * (ga - gb - gc + gd)
         + u.y * u.z * (ga - gc - ge + gg) + u.z * u.x * (ga - gb - ge + gf) + u.x * u.y * u.z * (-ga + gb + gc - gd + ge - gf - gg + gh)
         + du * (vec3(vb - va, vc - va, ve - va) + u.yzx * vec3(va - vb - vc + vd, va - vc - ve + vg, va - vb - ve + vf)
                 + u.zxy * vec3(va - vb - ve + vf, va - vb - vc + vd, va - vc - ve + vg) + u.yzx * u.zxy * (-va + vb + vc - vd + ve - vf - vg + vh));
  return vec4(v, d);
}
`;

// ---------- simulation: advect every particle through the curl of ψ (RK2) ----------
const SIM_FS = HEAD + NOISE + `
uniform sampler2D uPos;
uniform float uT, uDt, uWind, uTurb, uRad;
uniform uint uStep;
uniform vec2 uC;
out vec4 o;
const float D0 = 0.13, ZS = ${ZS}, S = 1.3;
float ramp(float r) { return r * (1.875 - r * r * (1.25 - 0.375 * r * r)); }   // Bridson's smooth 0→1
// ψ and its gradient at p in layer z: updraft + 2 octaves of noise, then Bridson's ramp around the sphere's slice
vec3 psi(vec2 p, float z) {
  vec3 q = vec3(p.x * S, p.y * S, z * 1.3 + uT * 0.08);   // a quasi-steady field that slowly morphs: ψ stays nearly constant along paths
  vec4 n1 = noised(q), n2 = noised(q * 2.07 + vec3(5.2, 1.3, 7.7));
  float s = -uWind * (p.x - uC.x) + uTurb * (n1.x + 0.25 * n2.x);
  vec2 g = vec2(-uWind, 0.0) + uTurb * S * (n1.yz + 0.5175 * n2.yz);
  float r2 = uRad * uRad - z * z;
  if (r2 > 0.0) {
    vec2 rel = p - uC;
    float dist = max(length(rel), 1e-5);
    float r = clamp((dist - sqrt(r2)) / D0, 0.0, 1.0);
    float rp = (r > 0.0 && r < 1.0) ? (1.875 - 3.75 * r * r + 1.875 * r * r * r * r) / D0 : 0.0;
    float rm = ramp(r);
    g = rp * (rel / dist) * s + rm * g;
    s *= rm;
  }
  return vec3(s, g);
}
vec2 vel(vec2 p, float z) { vec3 s = psi(p, z); return vec2(s.z, -s.y); }   // (∂ψ/∂y, −∂ψ/∂x): divergence-free exactly
bool inside(vec2 p, float z) { float r2 = uRad * uRad - z * z; return r2 > 0.0 && length(p - uC) < sqrt(r2); }
void main() {
  ivec2 ij = ivec2(gl_FragCoord.xy);
  vec4 s = texelFetch(uPos, ij, 0);
  uint id = uint(ij.y * ${TW} + ij.x);
  vec2 p = s.xy; float z = layerZ(id), dye = s.z, age = s.w;
  vec2 v1 = vel(p, z);
  p += vel(p + v1 * uDt * 0.5, z) * uDt;
  age += uDt;
  float life = 2.5 + 5.0 * h1(id * 7u + 3u);
  if (p.y > 1.02) { p.y -= 2.04; age = 0.0; }               // leave at the top → re-enter at the bottom
  if (p.x > 0.64) { p.x -= 1.28; age = 0.0; }
  if (p.x < -0.64) { p.x += 1.28; age = 0.0; }
  if (age > life || inside(p, z)) {                         // reborn somewhere new (hash of id and step: repeatable)
    uint k = pcg(id ^ (uStep * 2654435761u));
    p = vec2(h1(k) * 1.28 - 0.64, h1(k + 1u) * 2.04 - 1.02);
    if (inside(p, z)) p.y = -1.0 + 0.05 * h1(k + 2u);
    age = 0.0;
  }
  // the dye is set once, at birth, to ψ there: in a steady flow it is the streamline's label, and it is then
  // carried unchanged, so dye bands are material lines (streaklines) that bend with the flow instead of flickering
  if (age == 0.0 || dye > 1e8) dye = psi(p, z).x;
  o = vec4(p, dye, age);
}`;

// ---------- trails: one anti-aliased capsule per particle from prev → next ----------
const SEG_VS = HEAD + HASH + `
uniform sampler2D uPrev, uNext;
uniform vec2 uRes;
uniform float uDt, uGain, uWind, uLines, uFront;
out vec2 vP, vA, vB; out vec3 vCol; out float vW;
const float FZ = ${FZ}, ZS = ${ZS};
vec2 proj(vec3 p) { return (vec2(p.x, p.y) / (1.0 - p.z / FZ)) * uRes.x + 0.5 * uRes; }   // world → pixels
void main() {
  int id = gl_VertexID / 6;                                             // 6 vertices (two triangles) per particle
  ivec2 ij = ivec2(id % ${TW}, id / ${TW});
  vec4 a = texelFetch(uPrev, ij, 0), b = texelFetch(uNext, ij, 0);
  if (b.w < a.w) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }   // reborn this step: no streak across the frame
  float z = layerZ(uint(id));
  vec2 A = proj(vec3(a.xy, z)), B = proj(vec3(b.xy, z));
  float near = (z + ZS) / (2.0 * ZS);                                   // 0 far … 1 near
  float w = mix(0.55, 1.05, near);
  vec2 d = B - A; float L = length(d);
  vec2 t = L > 1e-4 ? d / L : vec2(1.0, 0.0), n = vec2(-t.y, t.x);
  int v = (0x132210 >> (4 * (gl_VertexID % 6))) & 3;                  // corners 0,1,2, 2,1,3
  float m = w + 1.0;
  vec2 P = ((v & 1) == 0 ? A - t * m : B + t * m) + n * ((v & 2) == 0 ? -m : m);
  vP = P; vA = A; vB = B; vW = w;
  // colour from speed (relative to the updraft) and depth; fade in after birth
  float sp = length(b.xy - a.xy) / uDt / (uWind * 2.2);
  vec3 c = mix(vec3(0.05, 0.12, 0.45), vec3(0.2, 0.62, 1.0), smoothstep(0.2, 0.6, sp));
  c = mix(c, vec3(1.0, 0.76, 0.48), smoothstep(0.7, 1.0, sp));
  // smoke wires: particles whose dye falls in a thin band light up (1 on a line, 0 between lines)
  float band = abs(fract(b.z / uWind / 0.065) - 0.5) * 2.0;
  float line = smoothstep(0.83, 0.98, band);
  float lit = (0.08 + uLines * 11.0 * line) * smoothstep(uFront, uFront - 0.35, b.y);
  vCol = c * uGain * lit * mix(0.12, 1.0, near * near) * smoothstep(0.0, 0.35, b.w) * (0.3 + 0.7 * smoothstep(0.05, 0.45, sp));
  gl_Position = vec4(P / uRes * 2.0 - 1.0, 0.0, 1.0);
}`;
const SEG_FS = HEAD + `
in vec2 vP, vA, vB; in vec3 vCol; in float vW;
out vec4 o;
void main() {
  // half-open, box-filtered segment [A, B): consecutive steps of one particle join without overlap (no beads)
  vec2 ab = vB - vA, ap = vP - vA;
  float L = length(ab);
  vec2 t = L > 1e-4 ? ab / L : vec2(1.0, 0.0);
  float u = dot(ap, t), dist = abs(dot(ap, vec2(-t.y, t.x)));
  float along = clamp(u + 0.5, 0.0, 1.0) - clamp(u - L + 0.5, 0.0, 1.0);
  o = vec4(vCol * along * clamp(vW + 0.5 - dist, 0.0, 1.0), 1.0);
}`;

const FS_VS = `#version 300 es
layout(location=0) in vec2 p; out vec2 uv;
void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0, 1); }`;
const FADE_FS = `#version 300 es
precision highp float; uniform float uK; out vec4 o; void main() { o = vec4(0.0, 0.0, 0.0, uK); }`;
const COPY_FS = `#version 300 es
precision highp float; uniform sampler2D src; out vec4 o; void main() { o = texelFetch(src, ivec2(gl_FragCoord.xy), 0); }`;
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
in vec2 uv; out vec4 o; uniform sampler2D src; uniform vec2 texel;
vec3 s(vec2 o2) { return texture(src, uv + o2 * texel).rgb; }
void main() {
  vec3 c = s(vec2(0)) * 4.0;
  c += (s(vec2(-1, 0)) + s(vec2(1, 0)) + s(vec2(0, -1)) + s(vec2(0, 1))) * 2.0;
  c += s(vec2(-1, -1)) + s(vec2(1, -1)) + s(vec2(-1, 1)) + s(vec2(1, 1));
  o = vec4(c / 16.0, 1.0);
}`;
const COMP_FS = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform sampler2D trail, bloom; uniform float uExp, uBloomK, uFrame;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main() {
  vec3 c = texture(trail, uv).rgb + texture(bloom, uv).rgb * uBloomK;
  vec2 q = (uv - vec2(0.5, 0.55)) * vec2(1.0, 1.78);
  c += vec3(0.004, 0.008, 0.02) * (1.0 - 0.7 * dot(q, q));          // deep blue night behind the wind
  c = aces(c * uExp);
  vec2 v = (uv - 0.5) * vec2(1.0, 1.3);
  c *= 1.0 - 0.35 * pow(dot(v, v) * 1.7, 1.3);
  c = pow(c, vec3(1.0 / 2.2));
  c += (hash(gl_FragCoord.xy + uFrame * 7.13) - 0.5) * 0.012;
  o = vec4(c, 1.0);
}`;

defineDemo({
  id: '10-curl-flow',
  title: '보이지 않는 바람',
  tech: 'GPU 파티클 · 컬 노이즈 + 핑퐁 텍스처',
  duration: D,
  async setup({ canvas, W, H }) {
    const { ctx: gl } = canvas({ type: 'webgl2', attrs: { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false } });
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('no float render targets');
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
      for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) {
        const name = gl.getActiveUniform(p, i).name;
        u[name] = gl.getUniformLocation(p, name);
      }
      return { p, u };
    };
    const P = {
      sim: program(FS_VS, SIM_FS), seg: program(SEG_VS, SEG_FS), fade: program(FS_VS, FADE_FS), copy: program(FS_VS, COPY_FS),
      down: program(FS_VS, DOWN_FS), up: program(FS_VS, UP_FS), comp: program(FS_VS, COMP_FS),
    };
    const fsV = gl.createVertexArray();
    gl.bindVertexArray(fsV);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const emptyV = gl.createVertexArray();          // the segment pass reads everything from textures

    const target = (w, h, fmt, type, filter, data = null) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, fmt, w, h, 0, gl.RGBA, type, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('fbo incomplete');
      return { tex, fb, w, h };
    };
    const posTarget = () => target(TW, TH, gl.RGBA32F, gl.FLOAT, gl.NEAREST);
    const trailTarget = () => target(W, H, gl.RGBA16F, gl.HALF_FLOAT, gl.LINEAR);
    const pos = [posTarget(), posTarget()];
    const trail = trailTarget();
    const mips = [];
    for (let i = 0, w = W, h = H; i < 6; i++) { w = Math.ceil(w / 2); h = Math.ceil(h / 2); mips.push(target(w, h, gl.RGBA16F, gl.HALF_FLOAT, gl.LINEAR)); }

    // the initial particle cloud (seeded): uniform in the domain, a fixed depth layer each, staggered ages
    const R = rand(1010);
    const init0 = new Float32Array(TW * TH * 4);
    for (let i = 0; i < TW * TH; i++) {
      init0[i * 4] = R() * 1.28 - 0.64;
      init0[i * 4 + 1] = R() * 2.04 - 1.02;
      init0[i * 4 + 2] = 1e9;                                       // dye: "not yet labelled" (set on the first step)
      init0[i * 4 + 3] = R() * 2.5;
    }

    const pass = (prog, dst) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
      gl.viewport(0, 0, dst.w, dst.h);
      gl.useProgram(prog.p);
      gl.bindVertexArray(fsV);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const copy = (src, dst) => {
      gl.disable(gl.BLEND);
      gl.useProgram(P.copy.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.tex);
      gl.uniform1i(P.copy.u.src, 0);
      pass(P.copy, dst);
    };
    let cur = 0;                     // pos[cur] holds the live particle state
    const syncBuf = new Float32Array(4);
    let catchUp = 0;

    const sim = replay({
      dt: DT,
      every: 120,
      init: () => {
        gl.bindTexture(gl.TEXTURE_2D, pos[0].tex);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, TW, TH, gl.RGBA, gl.FLOAT, init0);
        cur = 0;
        gl.bindFramebuffer(gl.FRAMEBUFFER, trail.fb);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      },
      step: (n) => {
        const T = n * DT, src = pos[cur], dst = pos[1 - cur];
        // 1. advect
        gl.disable(gl.BLEND);
        gl.useProgram(P.sim.p);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.tex);
        gl.uniform1i(P.sim.u.uPos, 0);
        gl.uniform1f(P.sim.u.uT, T);
        gl.uniform1f(P.sim.u.uDt, DT);
        gl.uniform1f(P.sim.u.uWind, WIND);
        gl.uniform1f(P.sim.u.uTurb, turb(T));
        gl.uniform1f(P.sim.u.uRad, radius(T));
        gl.uniform1ui(P.sim.u.uStep, n);
        gl.uniform2f(P.sim.u.uC, CENTER[0], CENTER[1]);
        pass(P.sim, dst);
        // 2. fade the trails, then lay down this step's streaks
        const k = decay(T);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ZERO, gl.SRC_ALPHA);
        gl.useProgram(P.fade.p);
        gl.uniform1f(P.fade.u.uK, k);
        pass(P.fade, trail);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.useProgram(P.seg.p);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.tex);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, dst.tex);
        gl.uniform1i(P.seg.u.uPrev, 0);
        gl.uniform1i(P.seg.u.uNext, 1);
        gl.uniform1f(P.seg.u.uLines, lines(T));
        gl.uniform1f(P.seg.u.uFront, front(T));
        gl.uniform2f(P.seg.u.uRes, W, H);
        gl.uniform1f(P.seg.u.uDt, DT);
        gl.uniform1f(P.seg.u.uWind, WIND);
        gl.uniform1f(P.seg.u.uGain, 0.16 * (1 - k));            // steady-state brightness independent of trail length
        gl.bindVertexArray(emptyV);
        gl.drawArrays(gl.TRIANGLES, 0, 6 * TW * TH);
        gl.disable(gl.BLEND);
        cur = 1 - cur;
        if (++catchUp % 20 === 0) {     // long seeks: let the GPU catch up inside seek() (a 1-texel read is a sync point);
                                        // live playback (1–2 steps per tick) never gets here, so it never stalls
          gl.bindFramebuffer(gl.FRAMEBUFFER, pos[cur].fb);
          gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, syncBuf);
        }
      },
      save: () => {                  // checkpoint = fresh copies of both textures
        const s = { pos: posTarget(), trail: trailTarget() };
        copy(pos[cur], s.pos);
        copy(trail, s.trail);
        return s;
      },
      load: (s) => {
        copy(s.pos, pos[cur]);
        copy(s.trail, trail);
      },
    });

    this.draw = async (t) => {
      catchUp = 0;
      await sim.seek(t);
      // bloom of the trail buffer, then tone-mapped composite (stateless: reads the state, never writes it)
      gl.disable(gl.BLEND);
      let src = trail;
      gl.useProgram(P.down.p);
      for (const m of mips) {
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.tex);
        gl.uniform1i(P.down.u.src, 0);
        gl.uniform2f(P.down.u.texel, 1 / src.w, 1 / src.h);
        pass(P.down, m);
        src = m;
      }
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(P.up.p);
      for (let i = mips.length - 1; i > 0; i--) {
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, mips[i].tex);
        gl.uniform1i(P.up.u.src, 0);
        gl.uniform2f(P.up.u.texel, 1 / mips[i].w, 1 / mips[i].h);
        pass(P.up, mips[i - 1]);
      }
      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(P.comp.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, trail.tex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, mips[0].tex);
      gl.uniform1i(P.comp.u.trail, 0);
      gl.uniform1i(P.comp.u.bloom, 1);
      gl.uniform1f(P.comp.u.uExp, exposure(t));
      gl.uniform1f(P.comp.u.uBloomK, 0.08);
      gl.uniform1f(P.comp.u.uFrame, Math.round(t * 30));
      gl.bindVertexArray(fsV);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  },
  frame(t) { return this.draw(t); },
});
