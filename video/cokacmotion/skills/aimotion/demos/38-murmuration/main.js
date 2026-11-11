/*
 * 38 · 찌르레기 군무 — a murmuration of 6,600 starlings, baked in setup (sim.js: topological boids, 7 nearest
 * neighbours from a spatial hash, a falcon, an alarm wave on the neighbour graph), drawn with raw WebGL2.
 *   sky       one full-screen pass, panoramic in (azimuth, elevation): dusk gradient with the glow of a sun just
 *             below the horizon, under-lit cloud streaks, first stars, hazy hills, a still lake mirroring it all
 *   birds     one instanced draw, 8 triangles per bird; the vertex shader builds each bird from its baked heading and
 *             bank angle and flaps the wings (wrist joint lags the shoulder, flap/glide bursts, faster when alarmed).
 *             Multiplicative blending (dst × src): birds darken the sky like real silhouettes, overlaps get darker,
 *             and it needs no sorting. Depth cues: perspective size, haze toward the sky colour with distance,
 *             sub-pixel birds widened to ~2.6 px with proportionally lower opacity so they never shimmer.
 *   reeds     a last pass of silhouettes in front: the reed bed the flock pours into at the horizon, swaying near reeds.
 */
import { defineDemo, ramp, clamp, lerp } from '../_lib/stage.js';
import { bakeMurmuration, FALCON_ON } from './sim.js';

const D = 9.5, FPS = 30;
const FOV = 46 * Math.PI / 180, PITCH = 13 * Math.PI / 180;
const CAM = [0, 1.6, 0];
const SUN_AZ = -0.95;           // radians, left of straight ahead; the sun has just set

const fadeOf = (t) => ramp(t, 0, 0.5) * (1 - ramp(t, D - 0.45, D));

const HEAD = `#version 300 es
precision highp float;
`;
const COMMON = `
uniform vec3 camF, camR, camU;
uniform vec2 tanH;
uniform float time, fade, dusk;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + vec2(1.7, -3.1); a *= 0.5; } return s / 0.97; }
vec3 rayOf(vec2 fc) {
  vec2 ndc = fc / vec2(1080.0, 1920.0) * 2.0 - 1.0;
  return normalize(camF + camR * ndc.x * tanH.x + camU * ndc.y * tanH.y);
}
float azOf(vec3 rd) { return atan(rd.x, -rd.z); }
vec3 grade(vec3 c, vec2 fc) {
  c = clamp((c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14), 0.0, 1.0);
  c = pow(c, vec3(1.0 / 2.2));
  vec2 q = fc / vec2(1080.0, 1920.0) - 0.5;
  c *= 1.0 - 0.3 * smoothstep(0.3, 0.9, length(q * vec2(1.0, 0.7)) * 1.3);
  return c;
}
`;

// ---- sky, hills, lake ----
const SKY_FS = HEAD + COMMON + `
uniform float sunAz;
out vec4 o;
float hills(float az) { return 0.009 + 0.011 * fbm(vec2(az * 3.2 + 7.0, 0.5)) + 0.004 * fbm(vec2(az * 14.0, 2.0)); }
vec3 sky(vec3 rd) {
  float e = max(rd.y, 0.0), az = azOf(rd);
  float da = az - sunAz; da = mod(da + 3.14159, 6.28318) - 3.14159;
  float sw = exp(-da * da * 1.1);
  float glowK = mix(1.0, 0.55, dusk);
  vec3 low = mix(vec3(0.80, 0.36, 0.40), vec3(1.0, 0.50, 0.20), sw) * glowK;
  vec3 mid = mix(vec3(0.27, 0.22, 0.40), vec3(0.42, 0.28, 0.36), sw) * mix(1.0, 0.75, dusk);
  vec3 zen = vec3(0.025, 0.045, 0.13) * mix(1.0, 0.75, dusk);
  vec3 c = mix(low, mid, smoothstep(0.0, 0.2, e));
  c = mix(c, zen, smoothstep(0.12, 0.75, e));
  c += vec3(1.0, 0.42, 0.12) * sw * exp(-e * 16.0) * 0.55 * glowK;
  // under-lit cloud streaks
  vec2 cp = vec2(az * 2.6 + time * 0.004, e * 26.0);
  float n = fbm(cp * vec2(1.0, 0.55) + vec2(0.0, 3.0));
  float nb = fbm(cp * vec2(1.0, 0.55) + vec2(0.0, 2.75));
  float band = smoothstep(0.04, 0.09, e) * (1.0 - smoothstep(0.28, 0.45, e));
  float cm = smoothstep(0.52, 0.72, n) * band;
  float lit = clamp(0.5 + (nb - n) * 5.0, 0.0, 1.0);
  vec3 cc = mix(vec3(0.16, 0.11, 0.2), mix(vec3(0.95, 0.45, 0.45), vec3(1.0, 0.62, 0.3), sw) * (0.6 + 0.6 * sw), lit * mix(1.0, 0.6, dusk));
  c = mix(c, cc, cm * 0.85);
  // first stars
  vec2 sp = vec2(az, e) * 420.0;
  vec2 si = floor(sp), sf = fract(sp) - 0.5;
  float h = hash12(si);
  float star = step(0.985, h) * smoothstep(0.08, 0.0, length(sf)) * (0.6 + 0.4 * sin(time * 3.0 + h * 60.0));
  c += vec3(0.8, 0.85, 1.0) * star * smoothstep(0.3, 0.7, e) * (0.15 + 0.6 * dusk);
  return c;
}
vec3 far(vec3 rd, float aa) {           // sky with the distant hills
  vec3 c = sky(rd);
  float az = azOf(rd), hh = hills(az);
  float ds = az - sunAz;
  vec3 hc = mix(vec3(0.16, 0.12, 0.2), vec3(0.35, 0.2, 0.22), exp(-ds * ds * 1.2)) * mix(1.0, 0.7, dusk);
  c = mix(c, hc, smoothstep(hh + aa, hh - aa, rd.y) * step(-0.0005, rd.y));
  return c;
}
void main() {
  vec3 rd = rayOf(gl_FragCoord.xy);
  float aa = fwidth(rd.y) * 1.2;
  vec3 c;
  if (rd.y >= -0.0005) c = far(rd, aa);
  else {
    // still lake: the mirrored sky, a little darker, broken by slow ripples near the camera
    float e = -rd.y, az = azOf(rd);
    float rip = (vnoise(vec2(az * 260.0, 6.0 / max(e, 0.004) + time * 0.6)) - 0.5) * 0.004 * smoothstep(0.0, 0.08, e);
    vec3 m = vec3(rd.x, max(e + rip, 0.0) + 0.0005, rd.z);
    c = far(normalize(m), aa) * mix(0.62, 0.35, smoothstep(0.0, 0.15, e));
  }
  o = vec4(grade(c, gl_FragCoord.xy) * fade + (hash12(gl_FragCoord.xy + fract(time * 7.1) * 91.0) - 0.5) / 255.0 * 1.5, 1.0);
}`;

// ---- birds: instanced, built and flapped in the vertex shader ----
const BIRD_VS = HEAD + `
layout(location = 0) in vec4 aT;      // side (−1, 0, 1), span position, chord position, segment (0 body, 1 inner wing, 2 outer wing)
layout(location = 1) in vec3 iPos;
layout(location = 2) in vec3 iDir;
layout(location = 3) in vec4 iMisc;   // roll, alarm, scale (0 = hidden), seed
uniform mat4 VP;
uniform vec3 camPos;
uniform float time, focal;
out float vA, vHaze;
void main() {
  float roll = iMisc.x, alarm = iMisc.y, scl = iMisc.z, seed = iMisc.w;
  if (scl <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vA = 0.0; vHaze = 1.0; return; }
  vec3 F = normalize(iDir + vec3(0.0, 1e-4, 0.0));
  vec3 Rc = cross(F, vec3(0.0, 1.0, 0.0));
  vec3 R = length(Rc) > 1e-4 ? normalize(Rc) : vec3(1.0, 0.0, 0.0);
  vec3 U = cross(R, F);
  float cr = cos(roll), sr = sin(roll);
  vec3 R2 = R * cr - U * sr, U2 = R * sr + U * cr;           // bank into the turn
  bool big = scl > 1.5;
  float fr = big ? 4.2 + 0.6 * sin(time * 0.7) : 11.5 + 3.0 * fract(seed * 7.13) + 3.0 * alarm;
  float gate = smoothstep(0.3, 0.62, 0.5 + 0.5 * sin(time * (0.8 + 0.6 * fract(seed * 3.1)) + seed * 40.0));
  gate = max(gate, clamp(alarm * 1.5, 0.0, 1.0));            // flap–glide bursts; alarmed birds beat hard
  float ph = time * fr * 6.2831853 + seed * 50.0;
  float th = mix(big ? -0.05 : 0.1, 0.12 + 0.8 * sin(ph), gate);
  float th2 = 0.45 * sin(ph - 1.0) * gate;                   // the hand lags the arm
  float side = aT.x, x = aT.y, z = aT.z, seg = aT.w;
  vec3 lp;
  if (seg < 0.5) lp = vec3(side * x, 0.0, z);
  else if (seg < 1.5) lp = vec3(side * x * cos(th), x * sin(th), z);
  else {
    const float xw = 0.095;
    float a2 = th + th2;
    lp = vec3(side * xw * cos(th), xw * sin(th), 0.0) + vec3(side * (x - xw) * cos(a2), (x - xw) * sin(a2), z);
  }
  vec4 cc = VP * vec4(iPos, 1.0);
  float px = 0.4 * scl * focal / max(cc.w, 0.5);
  float grow = max(1.0, 2.6 / px);
  vec3 wp = iPos + (R2 * lp.x + U2 * lp.y + F * lp.z) * scl * grow;
  gl_Position = VP * vec4(wp, 1.0);
  vA = clamp(0.93 / (grow * grow), 0.0, 0.93);
  vHaze = 1.0 - exp(-length(iPos - camPos) / 480.0);
}`;
const BIRD_FS = HEAD + `
uniform vec3 tint; uniform float fade;
in float vA, vHaze;
out vec4 o;
void main() {
  vec3 c = mix(tint, vec3(1.0), vHaze * 0.85);
  o = vec4(mix(vec3(1.0), c, vA * fade), 1.0);
}`;

// ---- reeds in front: the roost bed at the horizon and the near stems ----
const REED_FS = HEAD + COMMON + `
out vec4 o;
float stems(float az, float e, float cells, float top0, float top1, float w, float sway, float seed) {
  float a = az * cells, k0 = floor(a), cov = 0.0;
  for (int dk = -2; dk <= 2; dk++) {
    float k = k0 + float(dk);
    float h1 = hash12(vec2(k, seed)), h2 = hash12(vec2(k, seed + 7.0)), h3 = hash12(vec2(k, seed + 13.0));
    float top = mix(top0, top1, h2 * h2);
    float base = top0 - 0.25;
    float rise = clamp((e - base) / max(top - base, 1e-3), 0.0, 1.0);
    float x = k + h1 + sway * (sin(time * (1.1 + h3) + k * 0.7) + 0.4 * sin(time * 2.3 + k)) * rise * rise;
    float d = abs(a - x) / cells;
    float ww = w * (1.0 - 0.6 * rise);
    float edge = fwidth(a) / cells;
    float s = smoothstep(ww + edge, ww - edge, d) * step(e, top);
    // feathery plume at the tip
    float pl = smoothstep(0.013, 0.0, length(vec2((a - x) / cells * 2.0, (e - top + 0.008) * 1.3))) * step(0.45, h3)
             * (0.45 + 0.55 * vnoise(vec2(a * 5.0, e * 900.0)));
    cov = max(cov, max(s, pl * 0.9));
  }
  return cov;
}
void main() {
  vec3 rd = rayOf(gl_FragCoord.xy);
  float e = rd.y, az = azOf(rd);
  float aa = fwidth(e) * 1.2;
  // the roost: a reed bed on the far shore, ragged top just above the horizon
  float topF = 0.0045 + 0.0035 * fbm(vec2(az * 30.0, 1.0)) + 0.002 * vnoise(vec2(az * 400.0, 3.0));
  float bed = smoothstep(topF + aa, topF - aa, e) * smoothstep(-0.0105 - aa, -0.0105 + aa, e);
  // near reeds: a dark mass at the bottom with stems and plumes reaching up
  float massTop = -0.15 + 0.02 * fbm(vec2(az * 9.0, 4.0));
  float mass = smoothstep(massTop + aa, massTop - aa, e);
  float st = stems(az, e, 140.0, -0.12, -0.035, 0.0016, 0.25, 1.0) + stems(az, e, 90.0, -0.13, -0.06, 0.0024, 0.35, 5.0);
  float near = max(mass, clamp(st, 0.0, 1.0));
  float a = max(bed, near);
  if (a < 0.003) discard;
  vec3 c = mix(vec3(0.045, 0.03, 0.05), vec3(0.012, 0.01, 0.016), near);
  o = vec4(grade(c, gl_FragCoord.xy) * fade, a);
}`;

// ---------- matrices ----------
function perspective(fovy, asp, n, f) { const k = 1 / Math.tan(fovy / 2), nf = 1 / (n - f); return [k / asp, 0, 0, 0, 0, k, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]; }
function mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }

// bird template: body diamond + two wings of an inner (arm) and outer (hand) segment, swept back to a pointed tip
function birdTemplate() {
  const v = [];
  const tri = (a, b, c) => v.push(...a, ...b, ...c);
  // [side, span, chord, seg]
  tri([0, 0, 0.11, 0], [1, 0.022, 0.0, 0], [-1, 0.022, 0.0, 0]);          // head/breast
  tri([1, 0.022, 0.0, 0], [0, 0, -0.1, 0], [-1, 0.022, 0.0, 0]);          // tail
  for (const s of [-1, 1]) {
    const rf = [s, 0.018, 0.035, 1], rb = [s, 0.018, -0.03, 1], wf = [s, 0.095, 0.022, 1], wb = [s, 0.095, -0.04, 1];
    tri(rf, rb, wf); tri(rb, wb, wf);
    tri([s, 0.095, 0.022, 2], [s, 0.095, -0.04, 2], [s, 0.2, -0.075, 2]);
  }
  return new Float32Array(v);
}

defineDemo({
  id: '38-murmuration',
  title: '찌르레기 군무',
  tech: '보이드 알고리즘 · 수천 마리 군집 미리 굽기',
  duration: D,
  background: '#07060c',
  async setup({ canvas, W, H }) {
    const bake = bakeMurmuration({ fps: FPS, duration: D });
    const n = bake.n, OUT = bake.out, FAL = bake.falcon, NFR = bake.total;

    // camera yaw follows the flock (centroid of the birds still flying, Gaussian-smoothed over ±1 s)
    const az = new Float32Array(NFR);
    for (let f = 0; f < NFR; f++) {
      let sx = 0, sz = 0, c = 0;
      for (let i = 0; i < n; i += 3) { const k = (f * n + i) * 5; if (OUT[k + 1] > 3) { sx += OUT[k]; sz += OUT[k + 2]; c++; } }
      az[f] = c ? Math.atan2(sx / c, -sz / c) : (f ? az[f - 1] : 0);
    }
    const yawT = new Float32Array(NFR);
    for (let f = 0; f < NFR; f++) {
      let s = 0, w = 0;
      for (let g = -36; g <= 36; g++) { const ff = clamp(f + g, 0, NFR - 1), ww = Math.exp(-(g * g) / (2 * 15 * 15)); s += az[ff] * ww; w += ww; }
      yawT[f] = s / w;
    }

    const { ctx: gl } = canvas({ type: 'webgl2' });
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n'));
      return s;
    };
    const QUAD_VS = `#version 300 es
layout(location = 0) in vec2 p; void main() { gl_Position = vec4(p, 0, 1); }`;
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
    const P = { sky: program(QUAD_VS, SKY_FS), bird: program(BIRD_VS, BIRD_FS), reed: program(QUAD_VS, REED_FS) };

    const quad = gl.createVertexArray();
    gl.bindVertexArray(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // birds (+1 instance: the falcon)
    const NI = n + 1, STRIDE = 10;
    const tmpl = birdTemplate(), NV = tmpl.length / 4;
    const inst = new Float32Array(NI * STRIDE);
    const seedOf = (i) => { let x = (i + 1) * 2654435761 >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
    const sizes = new Float32Array(NI);
    for (let i = 0; i < NI; i++) sizes[i] = i === n ? 2.6 : 0.92 + 0.16 * seedOf(i + 9000);
    const birds = gl.createVertexArray();
    gl.bindVertexArray(birds);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, tmpl, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ib);
    gl.bufferData(gl.ARRAY_BUFFER, inst.byteLength, gl.DYNAMIC_DRAW);
    const B = 4 * STRIDE;
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, B, 0); gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 3, gl.FLOAT, false, B, 12); gl.vertexAttribDivisor(2, 1);
    gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 4, gl.FLOAT, false, B, 24); gl.vertexAttribDivisor(3, 1);
    gl.bindVertexArray(null);

    const proj = perspective(FOV, W / H, 0.5, 2000);
    const focal = (H / 2) / Math.tan(FOV / 2);
    const tanH = [Math.tan(FOV / 2) * W / H, Math.tan(FOV / 2)];

    const fillInstances = (t) => {
      const ft = clamp(t * FPS, 0, NFR - 1), f0 = Math.min(Math.floor(ft), NFR - 2), f1 = f0 + 1, k = ft - f0;
      const A = f0 * n * 5, Bo = f1 * n * 5;
      for (let i = 0; i < n; i++) {
        const a = A + i * 5, b = Bo + i * 5, o = i * STRIDE;
        const y0 = OUT[a + 1], y1 = OUT[b + 1];
        if (y0 < 2.5 && y1 < 2.5) { inst[o + 6] = 0; inst[o + 8] = 0; continue; }   // landed in the reeds
        inst[o] = OUT[a] + (OUT[b] - OUT[a]) * k;
        inst[o + 1] = y0 + (y1 - y0) * k;
        inst[o + 2] = OUT[a + 2] + (OUT[b + 2] - OUT[a + 2]) * k;
        inst[o + 3] = OUT[b] - OUT[a]; inst[o + 4] = y1 - y0; inst[o + 5] = OUT[b + 2] - OUT[a + 2];
        inst[o + 6] = OUT[a + 3] + (OUT[b + 3] - OUT[a + 3]) * k;
        inst[o + 7] = OUT[a + 4] + (OUT[b + 4] - OUT[a + 4]) * k;
        inst[o + 8] = sizes[i];
        inst[o + 9] = seedOf(i);
      }
      // the falcon
      const o = n * STRIDE, a = f0 * 4, b = f1 * 4;
      if (FAL[a + 3] > 0 && FAL[b + 3] > 0) {
        inst[o] = FAL[a] + (FAL[b] - FAL[a]) * k; inst[o + 1] = FAL[a + 1] + (FAL[b + 1] - FAL[a + 1]) * k; inst[o + 2] = FAL[a + 2] + (FAL[b + 2] - FAL[a + 2]) * k;
        const dx = FAL[b] - FAL[a], dy = FAL[b + 1] - FAL[a + 1], dz = FAL[b + 2] - FAL[a + 2];
        inst[o + 3] = dx; inst[o + 4] = dy; inst[o + 5] = dz;
        // bank from the change of heading
        const c = Math.max(f0 - 1, 0) * 4;
        const px = FAL[a] - FAL[c], pz = FAL[a + 2] - FAL[c + 2];
        const turn = (px * dz - pz * dx) / (Math.hypot(px, pz) * Math.hypot(dx, dz) + 1e-6);
        inst[o + 6] = clamp(-turn * 6, -1.2, 1.2); inst[o + 7] = 0; inst[o + 8] = sizes[n]; inst[o + 9] = 0.37;
      } else inst[o + 8] = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, ib);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, inst);
    };

    this.render = (t) => {
      const ft = clamp(t * FPS, 0, NFR - 1), f0 = Math.min(Math.floor(ft), NFR - 2);
      const yaw = lerp(yawT[f0], yawT[f0 + 1], ft - f0);
      const cp = Math.cos(PITCH), sp = Math.sin(PITCH);
      const F = [Math.sin(yaw) * cp, sp, -Math.cos(yaw) * cp];
      const R = [Math.cos(yaw), 0, Math.sin(yaw)];
      const U = [R[1] * F[2] - R[2] * F[1], R[2] * F[0] - R[0] * F[2], R[0] * F[1] - R[1] * F[0]];
      const view = [R[0], U[0], -F[0], 0, R[1], U[1], -F[1], 0, R[2], U[2], -F[2], 0,
        -(R[0] * CAM[0] + R[1] * CAM[1] + R[2] * CAM[2]), -(U[0] * CAM[0] + U[1] * CAM[1] + U[2] * CAM[2]), F[0] * CAM[0] + F[1] * CAM[1] + F[2] * CAM[2], 1];
      const VP = mul(proj, view);
      const dusk = ramp(t, 3.0, D);
      const common = (u) => {
        gl.uniform3fv(u.camF, F); gl.uniform3fv(u.camR, R); gl.uniform3fv(u.camU, U);
        gl.uniform2fv(u.tanH, tanH); gl.uniform1f(u.time, t); gl.uniform1f(u.fade, fadeOf(t)); gl.uniform1f(u.dusk, dusk);
      };
      fillInstances(t);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.useProgram(P.sky.p); common(P.sky.u); gl.uniform1f(P.sky.u.sunAz, SUN_AZ);
      gl.bindVertexArray(quad); gl.drawArrays(gl.TRIANGLES, 0, 3);
      // birds: multiply onto the sky
      gl.enable(gl.BLEND); gl.blendFunc(gl.DST_COLOR, gl.ZERO);
      gl.useProgram(P.bird.p);
      gl.uniformMatrix4fv(P.bird.u.VP, false, VP); gl.uniform3fv(P.bird.u.camPos, CAM);
      gl.uniform1f(P.bird.u.time, t); gl.uniform1f(P.bird.u.focal, focal); gl.uniform1f(P.bird.u.fade, fadeOf(t));
      gl.uniform3fv(P.bird.u.tint, [0.055, 0.048, 0.065]);
      gl.bindVertexArray(birds); gl.drawArraysInstanced(gl.TRIANGLES, 0, NV, NI);
      // reeds over everything
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(P.reed.p); common(P.reed.u);
      gl.bindVertexArray(quad); gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.disable(gl.BLEND);
      gl.bindVertexArray(null);
    };
    void FALCON_ON;
  },
  frame(t) {
    this.render(t);
  },
});
