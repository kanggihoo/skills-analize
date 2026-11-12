/*
 * 17 · 글자가 된 별 — WebGL2 point sprites: 48 000 particles in one static vertex buffer, drawn as gl.POINTS.
 * Every particle's position is a closed-form function of t computed in the vertex shader from its own
 * attributes: a place in a rotating spiral galaxy, a target pixel in "별", a target pixel in "빛"
 * (both sampled from an offscreen canvas with Pretendard), and personal delays. Between targets the
 * particle travels on a polar spiral around the word's centre, so the gather, the morph and the final
 * scatter (back out into a golden galaxy) are all vortices. Each frame draws the same buffer at four nearby
 * times (a closed-form shutter → light trails) into a half-float buffer that is bloomed and tone-mapped
 * over a faint fBm nebula.
 */
import { defineDemo, rand, track, ease, clamp, ramp } from '../_lib/stage.js';

const D = 10;
const N = 48000;
const C = [540, 860];                 // centre of the word (stage px)
const FONT = '860 700px "Pretendard Variable"';

// ------------------------------------------------------------------ shaders
const PARTICLE_VS = `#version 300 es
precision highp float;
layout(location=0) in vec4 aS;   // galaxy: radius, angle, depth z, phase
layout(location=1) in vec4 aW;   // target in word 1 (xy), target in word 2 (zw)
layout(location=2) in vec4 aD;   // delays: gather, morph, scatter; kind (0 sky, 1 word, 2 word + flare)
layout(location=3) in vec4 aR;   // three randoms, size
uniform float t, zoom, fade, sky;
uniform vec2 C;
out vec3 vCol;
out float vA, vFlare;
const float PI = 3.141592653589793, TAU = 6.283185307179586;
float eio(float x) { x = clamp(x, 0.0, 1.0); return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) * 0.5; }

// differential rotation: the inner galaxy turns faster
vec2 galaxy(float tt) {
  float r = aS.x, w = 0.035 + 0.30 / (1.0 + r / 230.0);
  float a = aS.y + w * tt;
  return C + vec2(cos(a), sin(a) * 0.9) * r;
}
// travel A → B on a polar spiral about C. turns < 0: always turn the way the galaxy turns;
// otherwise take the short way round plus that many whole turns
vec2 spiral(vec2 A, vec2 B, float e, float bulge, float turns) {
  vec2 da = A - C, db = B - C;
  float aa = atan(da.y, da.x), ab = atan(db.y, db.x);
  float d = turns < 0.0 ? mod(ab - aa, TAU) : mod(ab - aa + PI, TAU) - PI + turns * TAU;
  float ang = aa + d * e;
  float r = mix(length(da), length(db), e) + bulge * sin(PI * e);
  return C + vec2(cos(ang), sin(ang)) * r;
}

void main() {
  float kind = aD.w, z = aS.z;
  vec2 S = galaxy(t);
  vec3 starCol = mix(vec3(0.66, 0.78, 1.0), vec3(1.0, 0.82, 0.62), step(0.84, aR.x));
  float tw = 0.7 + 0.3 * sin(t * (1.3 + 4.0 * aR.y) + aS.w);
  vec2 p; vec3 col; float a, size = aR.w, flare = 0.0;
  if (kind < 0.5) {
    p = S;
    col = starCol;
    a = (0.25 + 0.75 * z * z) * tw * sky * 1.4;
  } else {
    float e1 = eio((t - 1.15 - aD.x) / 1.7);
    float e2 = eio((t - 5.0 - aD.y) / 1.5);
    float e3 = eio((t - 8.0 - aD.z) / 1.75);
    vec2 jit = vec2(sin(t * 2.1 + aS.w), cos(t * 1.7 + aS.w * 1.3)) * 1.4;
    vec2 T1 = aW.xy + jit, T2 = aW.zw + jit;
    if (e2 <= 0.0) p = spiral(S, T1, e1, 0.0, -1.0);
    else if (e3 <= 0.0) p = spiral(T1, T2, e2, 40.0 + 200.0 * aR.z, 1.0);
    else p = spiral(T2, C + (S - C) * 0.82, e3, 90.0 + 160.0 * aR.z, -1.0);   // stardust swirls back into a galaxy
    vec3 c1 = mix(vec3(0.74, 0.80, 1.0), vec3(0.95, 0.93, 1.0), aR.y * 0.6);   // 별: silver-blue
    vec3 c2 = mix(vec3(1.0, 0.72, 0.42), vec3(1.0, 0.9, 0.7), aR.y * 0.7);     // 빛: gold
    col = mix(mix(starCol, c1, e1), c2, e2);
    col = mix(col, vec3(1.0, 0.62, 0.58), e3 * 0.55);                          // dust: rose
    // on the letters: mostly faint dust, a few bright stars, and a slow sheen of light sweeping across
    float sweep = pow(0.5 + 0.5 * sin(dot(aW.xy - C, vec2(0.006, 0.004)) - t * 2.2), 10.0) * e1 * (1.0 - e2)
                + pow(0.5 + 0.5 * sin(dot(aW.zw - C, vec2(0.006, 0.004)) - t * 2.4 + 1.0), 10.0) * e2 * 1.4;
    float hold = 0.62 * (0.82 + 0.18 * tw) * (0.45 + 1.4 * aR.x * aR.x * aR.x) * (1.0 + 1.3 * sweep);
    a = mix((0.25 + 0.75 * z * z) * tw * 1.5, hold, e1);
    a *= 1.0 + 0.5 * sin(PI * e2);                                                // brighter while swirling
    // stardust: dimmer on average, but every grain glints now and then
    float glint = pow(0.5 + 0.5 * sin(t * (2.0 + 5.0 * aR.z) + aS.w * 5.0), 8.0);
    a = mix(a, (0.25 + 0.75 * z * z) * tw * 1.35 + 1.4 * glint * (0.3 + 0.7 * z), e3);
    size *= mix(mix(0.8 + 0.9 * z, 1.0, e1), 0.75 + 0.8 * z, e3);
    if (kind > 1.5) {                                                              // a few flare stars on the letters
      float pk = pow(0.5 + 0.5 * sin(t * (0.9 + aR.z) + aS.w * 3.0), 6.0);
      flare = pk * e1 * (1.0 - e3) * (1.0 - 0.8 * sin(PI * e2));
      size = mix(size, 30.0, flare);
    }
  }
  p = C + (p - C) * zoom;
  gl_Position = vec4(p.x / 540.0 - 1.0, 1.0 - p.y / 960.0, 0.0, 1.0);
  gl_PointSize = size;
  vCol = col; vA = a * fade; vFlare = flare;
}`;

const PARTICLE_FS = `#version 300 es
precision highp float;
in vec3 vCol;
in float vA, vFlare;
uniform float gain;
out vec4 o;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float d2 = dot(q, q);
  if (d2 > 1.0) discard;
  float k = mix(1.0, 9.0, vFlare);                                     // a flare star keeps a pin-point core
  float b = exp(-d2 * 7.0 * k) + 0.18 * exp(-d2 * 2.2 * k);
  b += vFlare * 0.9 * (exp(-abs(q.x) * 38.0) * exp(-abs(q.y) * 2.6) + exp(-abs(q.y) * 38.0) * exp(-abs(q.x) * 2.6));
  b *= smoothstep(1.0, 0.7, d2);
  o = vec4(vCol * vA * b * gain, 1.0);
}`;

const BOKEH_VS = `#version 300 es
precision highp float;
layout(location=0) in vec4 aB;   // x, y, radius, phase
layout(location=1) in vec4 aC;   // colour, alpha
uniform float t, zoom, fade;
uniform vec2 C;
out vec4 vC;
void main() {
  vec2 p = aB.xy + vec2(28.0 * sin(t * 0.21 + aB.w), -14.0 * t + 10.0 * cos(t * 0.17 + 2.0 * aB.w));
  p = C + (p - C) * (1.0 + (zoom - 1.0) * 3.0);                          // foreground: stronger parallax
  gl_Position = vec4(p.x / 540.0 - 1.0, 1.0 - p.y / 960.0, 0.0, 1.0);
  gl_PointSize = aB.z;
  vC = vec4(aC.rgb, aC.a * fade);
}`;
const BOKEH_FS = `#version 300 es
precision highp float;
in vec4 vC;
out vec4 o;
void main() {
  float d = length(gl_PointCoord * 2.0 - 1.0);
  float disc = smoothstep(1.0, 0.75, d) * (0.7 + 0.3 * smoothstep(0.4, 0.85, d));
  o = vec4(vC.rgb * vC.a * disc, 1.0);
}`;

const QUAD_VS = `#version 300 es
layout(location=0) in vec2 p;
out vec2 uv;
void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0, 1); }`;

// 13-tap separable gaussian (linear sampling)
const BLUR_FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D src;
uniform vec2 dir;
out vec4 o;
void main() {
  vec3 c = texture(src, uv).rgb * 0.1964825501511404;
  c += (texture(src, uv + dir * 1.411764705882353).rgb + texture(src, uv - dir * 1.411764705882353).rgb) * 0.2969069646728344;
  c += (texture(src, uv + dir * 3.2941176470588234).rgb + texture(src, uv - dir * 3.2941176470588234).rgb) * 0.09447039785044732;
  c += (texture(src, uv + dir * 5.176470588235294).rgb + texture(src, uv - dir * 5.176470588235294).rgb) * 0.010381362401148057;
  o = vec4(c, 1.0);
}`;
// 4 bilinear taps = a 4×4 box: halves (or quarters) the resolution without aliasing
const DOWN_FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D src;
uniform vec2 px;
out vec4 o;
void main() {
  o = vec4(0.25 * (texture(src, uv + px * vec2(-1, -1)).rgb + texture(src, uv + px * vec2(1, -1)).rgb
                 + texture(src, uv + px * vec2(-1, 1)).rgb + texture(src, uv + px * vec2(1, 1)).rgb), 1.0);
}`;

const FINAL_FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D scene, bloomA, bloomB;
uniform float t, fade, frameNo, glowAmt, flash;
uniform vec3 glowCol;
uniform vec2 C;
out vec4 o;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * noise(p); p = mat2(0.8, 0.6, -0.6, 0.8) * p * 2.02 + 7.3; a *= 0.5; } return s; }
void main() {
  vec2 fc = vec2(gl_FragCoord.x, 1920.0 - gl_FragCoord.y);       // stage px, y down
  vec2 q = (fc - C) / 1080.0;
  // the nebula: two warped fBm layers, violet and teal, very faint
  float n1 = fbm(q * 2.4 + vec2(0.02 * t, -0.015 * t) + fbm(q * 1.6 - 0.01 * t) * 0.9);
  float n2 = fbm(q * 3.1 + vec2(-0.012 * t, 0.02 * t) + 4.0);
  vec3 neb = vec3(0.012, 0.014, 0.035)
           + vec3(0.17, 0.07, 0.30) * pow(smoothstep(0.36, 0.95, n1), 2.0) * 0.9
           + vec3(0.04, 0.20, 0.25) * pow(smoothstep(0.42, 0.95, n2), 2.0) * 0.45;
  neb *= 0.55 + 0.6 * exp(-dot(q, q) * 3.0);
  // a broad glow behind the word, coloured by what the word is
  float r2 = dot(q * vec2(1.0, 1.25), q * vec2(1.0, 1.25));
  neb += glowCol * glowAmt * (0.42 * exp(-r2 * 9.0) + 0.12 * exp(-r2 * 2.2)) * (0.75 + 0.5 * n1);
  vec3 c = neb * fade + texture(scene, uv).rgb + texture(bloomA, uv).rgb * (0.55 + 0.6 * flash) + texture(bloomB, uv).rgb * (0.6 + 0.9 * flash);
  c = 1.0 - exp(-c * 1.25);
  c *= 1.0 - 0.5 * pow(length((fc - vec2(540.0, 900.0)) / vec2(760.0, 1250.0)), 2.6);
  c += (hash(fc + frameNo * 7.13) - 0.5) * 0.018;
  o = vec4(pow(max(c, 0.0), vec3(0.95)), 1.0);
}`;

// ------------------------------------------------------------------ helpers
function compile(gl, vs, fs) {
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
  return { p, u };
}

function renderTarget(gl, w, h, half) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, half ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, half ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return ok ? { tex, fb, w, h } : null;
}

/** sample `count` points inside a glyph; ~30% of them on its outline so the letter reads crisply */
function sampleGlyph(ch, count, R, W, H) {
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d', { willReadFrequently: true });
  c.font = FONT;
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  const m = c.measureText(ch);
  const x0 = C[0] - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
  const y0 = C[1] + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  c.fillStyle = '#fff';
  c.fillText(ch, x0, y0);
  const a = c.getImageData(0, 0, W, H).data;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : a[(y * W + x) * 4 + 3]);
  const inside = [], edge = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (at(x, y) < 128) continue;
    inside.push(x, y);
    if (at(x - 3, y) < 128 || at(x + 3, y) < 128 || at(x, y - 3) < 128 || at(x, y + 3) < 128) edge.push(x, y);
  }
  const out = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const src = R() < 0.3 ? edge : inside;
    const k = Math.floor(R() * (src.length / 2)) * 2;
    out[2 * i] = src[k] + R() - 0.5 + 0.5;
    out[2 * i + 1] = src[k + 1] + R() - 0.5 + 0.5;
  }
  return out;
}

// ------------------------------------------------------------------ timeline
const zoom = track([[0, 1.1], [4.6, 1.0, ease.inOutCubic], [7.6, 1.04, ease.inOutCubic], [D, 0.94, ease.inOutCubic]]);
const fade = (t) => ramp(t, 0, 1.4);
const sky = track([[0, 1], [2.4, 1], [4.0, 0.45], [8.3, 0.45], [9.8, 1.0]]);       // the sky dims while the words stand
const glowAmt = track([[0, 0.15], [3.6, 0.55], [5.0, 0.5], [7.2, 1.0], [8.15, 0.9], [9.3, 0.18], [D, 0.12]]);
const glowMix = track([[0, 0], [5.4, 0], [7.0, 1]]);
const flash = (t) => Math.exp(-Math.pow((t - 7.35) / 0.32, 2)) * 0.9 + Math.exp(-Math.pow((t - 3.75) / 0.35, 2)) * 0.35;

defineDemo({
  id: '17-hangul-particles',
  title: '글자가 된 별',
  tech: 'WebGL2 포인트 스프라이트 · 텍스트 샘플링',
  duration: D,
  async setup({ canvas, W, H }) {
    await document.fonts.load(FONT, '별빛');
    if (!document.fonts.check(FONT, '별빛')) console.warn('Pretendard Variable did not load; falling back');
    const { ctx: gl } = canvas({ type: 'webgl2' });
    const half = !!gl.getExtension('EXT_color_buffer_float');

    // ---------- particles ----------
    const R = rand(2024);
    const w1 = sampleGlyph('별', N, rand(1), W, H);
    const w2 = sampleGlyph('빛', N, rand(2), W, H);
    // the i-th point of "별" goes to the point of "빛" with the same rank by angle around C, so the morph
    // is one coherent whirl instead of a random exchange
    const ang = (w, i) => Math.atan2(w[2 * i + 1] - C[1], w[2 * i] - C[0]);
    const o1 = Array.from({ length: N }, (_, i) => i).sort((a, b) => ang(w1, a) - ang(w1, b));
    const o2 = Array.from({ length: N }, (_, i) => i).sort((a, b) => ang(w2, a) - ang(w2, b));
    const perm = new Int32Array(N);
    for (let k = 0; k < N; k++) perm[o1[k]] = o2[k];
    let minX = 1e9, maxX = -1e9;
    for (let i = 0; i < N; i++) { minX = Math.min(minX, w2[2 * i]); maxX = Math.max(maxX, w2[2 * i]); }
    const data = new Float32Array(N * 16);
    for (let i = 0; i < N; i++) {
      const o = i * 16;
      const kind = i < 11000 ? 0 : i < 11160 ? 2 : 1;
      // the galaxy: two logarithmic arms plus a diffuse disc; sky particles spread wider
      const u = R();
      const r = kind === 0 ? 40 + 1150 * Math.sqrt(R()) : 12 + 1060 * Math.pow(u, 1.5);
      const arm = R() < 0.5 ? 0 : Math.PI;
      const g = (R() + R() + R() - 1.5) * 0.9;
      const th = R() < 0.72 ? arm + 2.3 * Math.log(r / 40) + g * (0.25 + 0.5 * r / 1100) : R() * Math.PI * 2;
      const z = R();
      data[o] = r; data[o + 1] = th; data[o + 2] = z; data[o + 3] = R() * Math.PI * 2;
      const j = perm[i];
      data[o + 4] = w1[2 * i]; data[o + 5] = w1[2 * i + 1]; data[o + 6] = w2[2 * j]; data[o + 7] = w2[2 * j + 1];
      const rn = Math.min(1, r / 1075);
      data[o + 8] = 0.15 + 1.6 * (0.6 * rn + 0.4 * R());                                    // gather: inner first
      data[o + 9] = 0.7 * (0.6 * (w2[2 * j] - minX) / (maxX - minX) + 0.4 * R());         // morph: sweeps left → right
      data[o + 10] = 0.5 * (0.5 * rn + 0.5 * R());
      data[o + 11] = kind;
      const r1 = R(), r2 = R(), r3 = R();
      data[o + 12] = r1; data[o + 13] = r2; data[o + 14] = r3;
      data[o + 15] = kind === 0 ? 1.6 + 3.4 * Math.pow(R(), 3) * (0.4 + z) : 2.2 + 2.8 * Math.pow(R(), 2.2);
    }
    const P = compile(gl, PARTICLE_VS, PARTICLE_FS);
    const vaoP = gl.createVertexArray();
    gl.bindVertexArray(vaoP);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    for (let k = 0; k < 4; k++) { gl.enableVertexAttribArray(k); gl.vertexAttribPointer(k, 4, gl.FLOAT, false, 64, k * 16); }

    // ---------- out-of-focus foreground particles ----------
    const RB = rand(99), NB = 13;
    const bd = new Float32Array(NB * 8);
    for (let i = 0; i < NB; i++) {
      const warm = RB() < 0.35;
      const side = i % 2 ? 1 : -1, x = 540 + side * (230 + RB() * 420);   // keep them off the word
      bd.set([x, 80 + RB() * (H - 160), 90 + 260 * Math.pow(RB(), 1.4), RB() * 6.28,
        warm ? 1.0 : 0.6, warm ? 0.78 : 0.75, warm ? 0.55 : 1.0, 0.012 + 0.028 * RB()], i * 8);
    }
    const B = compile(gl, BOKEH_VS, BOKEH_FS);
    const vaoB = gl.createVertexArray();
    gl.bindVertexArray(vaoB);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, bd, gl.STATIC_DRAW);
    for (let k = 0; k < 2; k++) { gl.enableVertexAttribArray(k); gl.vertexAttribPointer(k, 4, gl.FLOAT, false, 32, k * 16); }

    // ---------- post ----------
    const vaoQ = gl.createVertexArray();
    gl.bindVertexArray(vaoQ);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    const BL = compile(gl, QUAD_VS, BLUR_FS), DN = compile(gl, QUAD_VS, DOWN_FS), FN = compile(gl, QUAD_VS, FINAL_FS);
    const scene = renderTarget(gl, W, H, half);
    const qa = renderTarget(gl, W / 4, H / 4, half), qb = renderTarget(gl, W / 4, H / 4, half);
    const ea = renderTarget(gl, W / 8, H / 8, half), eb = renderTarget(gl, W / 8, H / 8, half);
    if (!scene || !qa || !ea) throw new Error('render targets incomplete');
    const gain = half ? 1 : 0.5;     // an 8-bit buffer clips sooner

    const quad = (prog, dst, bind) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null);
      gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H);
      gl.useProgram(prog.p);
      bind(prog.u);
      gl.bindVertexArray(vaoQ);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const tex = (unit, rt, loc) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, rt.tex); gl.uniform1i(loc, unit); };

    this.draw = (t) => {
      const z = zoom(t), f = fade(t);
      // 1. particles, additive, at four instants inside a short shutter → light trails while they fly
      gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fb);
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(P.p);
      gl.uniform2f(P.u.C, C[0], C[1]);
      gl.uniform1f(P.u.zoom, z);
      gl.uniform1f(P.u.fade, f);
      gl.uniform1f(P.u.sky, sky(t));
      gl.bindVertexArray(vaoP);
      const SH = [0, 0.023, 0.046, 0.069];
      for (const dt of SH) {
        gl.uniform1f(P.u.t, Math.max(0, t - dt));
        gl.uniform1f(P.u.gain, gain / SH.length);
        gl.drawArrays(gl.POINTS, 0, N);
      }
      gl.useProgram(B.p);
      gl.uniform1f(B.u.t, t); gl.uniform1f(B.u.zoom, z); gl.uniform1f(B.u.fade, f); gl.uniform2f(B.u.C, C[0], C[1]);
      gl.bindVertexArray(vaoB);
      gl.drawArrays(gl.POINTS, 0, NB);
      gl.disable(gl.BLEND);
      // 2. bloom: quarter and eighth resolution, separable gaussian
      quad(DN, qa, (u) => { tex(0, scene, u.src); gl.uniform2f(u.px, 1 / W, 1 / H); });
      quad(BL, qb, (u) => { tex(0, qa, u.src); gl.uniform2f(u.dir, 4 / W, 0); });
      quad(BL, qa, (u) => { tex(0, qb, u.src); gl.uniform2f(u.dir, 0, 4 / H); });
      quad(DN, ea, (u) => { tex(0, qa, u.src); gl.uniform2f(u.px, 4 / W, 4 / H); });
      quad(BL, eb, (u) => { tex(0, ea, u.src); gl.uniform2f(u.dir, 8 / W, 0); });
      quad(BL, ea, (u) => { tex(0, eb, u.src); gl.uniform2f(u.dir, 0, 8 / H); });
      // 3. nebula + scene + bloom, tone-mapped
      const gm = glowMix(t);
      quad(FN, null, (u) => {
        tex(0, scene, u.scene); tex(1, qa, u.bloomA); tex(2, ea, u.bloomB);
        gl.uniform1f(u.t, t); gl.uniform1f(u.fade, f); gl.uniform1f(u.frameNo, Math.round(t * 30));
        gl.uniform1f(u.glowAmt, glowAmt(t) * f); gl.uniform1f(u.flash, flash(t));
        gl.uniform3f(u.glowCol, 0.32 + 0.5 * gm, 0.36 + 0.22 * gm, 0.75 - 0.5 * gm);
        gl.uniform2f(u.C, C[0], C[1]);
      });
    };
  },
  frame(t) { this.draw(t); },
});
