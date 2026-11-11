/*
 * 29 · 소리가 그리는 빛 — Web Audio synthesis + offline FFT analysis, drawn as functions of t.
 *
 * setup: the piece is synthesised with an OfflineAudioContext (synth.js: oscillators, envelopes, filters, a
 * generated convolution reverb), then analysed by our own FFT (analysis.js) into tables: 64 log-spaced band levels
 * at 120 frames/s, RMS, low-band level, spectral-flux onsets (high and low), and the pitches that are new at each
 * onset. The picture reads only those tables:
 *   - a polar spectrogram: wavefronts leave the centre 10 times a second, each shaped and lit by the spectrum at
 *     the moment it left (low frequencies at the bottom, high at the top, mirrored) — the sound's recent history
 *   - one petal of light per detected note, pointing to its pitch class (five directions of the pentatonic scale),
 *     as long as its octave, glowing with the level of its own band right now (it fades as the note rings out)
 *   - a ripple at each petal's tip and a burst of sparks on its onset; a shock ring on every low-band onset (pulse)
 * Sound: the same AudioBuffer plays live through spec.onTransport (restarted at t on play / seek / loop).
 */
import { defineDemo, rand, track, ease, clamp } from '../_lib/stage.js';
import { D, SCALE } from './score.js';
import { renderPiece } from './synth.js';
import { analyse, AR, BANDS, bandOf } from './analysis.js';

const CX = 540, CY = 800;                        // centre of the flower (stage px)
const R0 = 118;                                  // radius where the wavefronts are born
const MAX_NOTES = 48, MAX_PULSES = 16;
// petal colours by scale degree: D gold, E coral, F♯ rose, A violet, B cyan
const DEG_COL = [[1.0, 0.74, 0.36], [1.0, 0.50, 0.36], [1.0, 0.40, 0.62], [0.68, 0.50, 1.0], [0.40, 0.80, 1.0]];

const GLSL_HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
`;
const QUAD_VS = `#version 300 es
layout(location=0) in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const SCENE_FS = GLSL_HEAD + `
uniform sampler2D uBands;            // 64 bands x K frames (R16F)
uniform float uT, uK, uRms, uLow, uZoom, uFade;
uniform vec4 uNoteA[${MAX_NOTES}];   // angle (rad), length (px), onset t, band u
uniform vec4 uNoteB[${MAX_NOTES}];   // colour, strength
uniform int uNotes;
uniform vec2 uPulse[${MAX_PULSES}];  // onset t, strength
uniform int uPulses;
out vec4 o;
const float AR = ${AR.toFixed(1)}, R0 = ${R0.toFixed(1)}, PI = 3.14159265;
const float RING_DT = 0.1, RING_V = 160.0, RING_AGE = 2.6, RING_AMP = 28.0;

float level(float u, float t) { return texture(uBands, vec2(u, (max(t, 0.0) * AR + 0.5) / uK)).r; }
vec3 ringCol(float b) {
  vec3 lo = vec3(1.0, 0.40, 0.30), mid = vec3(1.0, 0.80, 0.54), hi = vec3(0.56, 0.80, 1.0);
  return b < 0.5 ? mix(lo, mid, smoothstep(0.08, 0.45, b)) : mix(mid, hi, smoothstep(0.55, 0.9, b));
}
// iq's exact vesica (lens) distance: half-length along y = b, built from circle radius r and offset d
float sdVesica(vec2 p, float r, float d) {
  p = abs(p);
  float b = sqrt(max(r * r - d * d, 0.0));
  return ((p.y - b) * d > p.x * b) ? length(p - vec2(0.0, b)) : length(p - vec2(-d, 0.0)) - r;
}
float outBack(float x) { float c = 1.6; x -= 1.0; return 1.0 + (c + 1.0) * x * x * x + c * x * x; }
// slow motes in the dark (hash grid; a mote may cross its cell edge -> 3x3 neighbourhood)
float motes(vec2 p, float cell, float seed) {
  vec2 g = p / cell, id = floor(g);
  float acc = 0.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 c = id + vec2(i, j);
    float h = hash(c + seed);
    if (h > 0.22) continue;
    vec2 sp = (c + 0.2 + 0.6 * vec2(hash(c + seed + 3.1), hash(c + seed + 7.3))) * cell;
    sp += vec2(14.0 * sin(uT * 0.4 + h * 40.0), -10.0 * uT);
    float r = 1.2 + 2.6 * hash(c + seed + 1.7);
    float d = length(p - sp);
    acc += exp(-d * d / (r * r)) * (0.4 + 0.6 * hash(c + seed + 9.1));
  }
  return acc;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, 1920.0 - gl_FragCoord.y);       // stage px, y down
  vec2 C = vec2(${CX}.0, ${CY}.0);
  vec2 d = (p - C) / uZoom;
  float r = length(d);
  float phi = atan(d.x, d.y);                                     // 0 = straight down, +-pi = up
  float bu = mix(0.03, 0.97, abs(phi) / PI);                      // band: low at the bottom, high at the top

  // ---- night background, lifted a little by the loudness
  vec3 col = mix(vec3(0.010, 0.008, 0.026), vec3(0.028, 0.018, 0.060), exp(-dot(d, d) / (760.0 * 760.0)));
  col += vec3(0.05, 0.028, 0.085) * uRms * exp(-r * r / (430.0 * 430.0));
  col += vec3(0.55, 0.62, 0.9) * (motes(p, 70.0, 1.0) * 0.035 + motes(p * 1.0 + 300.0, 150.0, 5.0) * 0.05);

  // ---- polar spectrogram: wavefronts born at R0, each carrying the spectrum of its birth time
  float te0 = uT - (r - R0) / RING_V;
  float k0 = floor(te0 / RING_DT);
  for (int j = -3; j <= 1; j++) {
    float te = (k0 + float(j)) * RING_DT;
    float age = uT - te;
    if (te < 0.0 || age < 0.0 || age > RING_AGE) continue;
    float L = level(bu, te);
    float rr = R0 + RING_V * age + RING_AMP * L;
    float w = 1.3 + 1.6 * age;
    float dd = r - rr;
    float fade = exp(-age * 1.05) * smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(RING_AGE - 0.6, RING_AGE, age));
    col += ringCol(bu) * exp(-dd * dd / (w * w)) * L * L * fade * 0.85;
  }
  // a soft continuous glow under the lines (the same spectrogram, unshaped)
  {
    float age = (r - R0) / RING_V;
    if (age > 0.0 && age < RING_AGE) {
      float L = level(bu, uT - age);
      col += ringCol(bu) * L * L * L * exp(-age * 1.6) * 0.11;
    }
  }
  // ---- the source: the spectrum now as a closed outline, a hot core breathing with the low band
  {
    float L = level(bu, uT);
    float rc = R0 * (0.5 + 0.5 * L);
    float dd = r - rc;
    col += ringCol(bu) * exp(-dd * dd / 9.0) * (0.25 + 0.9 * L * L);
    col += vec3(1.0, 0.82, 0.62) * (1.0 - smoothstep(rc * 0.2, rc, r)) * (0.05 + 0.25 * uRms);
    col += vec3(1.0, 0.86, 0.70) * exp(-r * r / (900.0 + 1800.0 * uLow)) * (0.25 + 1.1 * uRms);
  }
  // ---- pulse shock rings (low-band onsets)
  for (int i = 0; i < ${MAX_PULSES}; i++) {
    if (i >= uPulses) break;
    float age = uT - uPulse[i].x;
    if (age < 0.0 || age > 2.5) continue;
    float rr = R0 * 0.6 + 640.0 * (1.0 - exp(-age * 1.7));
    float w = 3.0 + 16.0 * age;
    float dd = r - rr;
    float s = uPulse[i].y * exp(-age * 2.1);
    col += vec3(1.0, 0.42, 0.58) * exp(-dd * dd / (w * w)) * s * 0.42;
    col += vec3(1.0, 0.7, 0.55) * exp(-r * r / 3000.0) * s * exp(-age * 7.0) * 0.8;
  }
  // ---- petals, ripples (one per detected note)
  for (int i = 0; i < ${MAX_NOTES}; i++) {
    if (i >= uNotes) break;
    vec4 A = uNoteA[i];
    vec4 B = uNoteB[i];
    float age = uT - A.z;
    if (age < 0.0) continue;
    vec2 dir = vec2(cos(A.x), sin(A.x));
    float along = dot(d, dir);
    vec2 tip = dir * (R0 * 0.55 + A.y);
    // ripple at the tip
    float rr = 18.0 + 210.0 * (1.0 - exp(-age * 3.0));
    float dr = length(d - tip) - rr;
    float rw = 1.6 + 5.0 * age;
    col += B.rgb * exp(-dr * dr / (rw * rw)) * B.a * exp(-age * 2.4) * 0.5;
    if (along < 0.0) continue;
    // the petal: a lens from near the centre to the tip, grown with a small overshoot
    float grow = outBack(clamp(age / 0.32, 0.0, 1.0));
    float len = A.y * grow;
    float hl = 0.5 * len;                                         // half length
    float hw = max(len * 0.12, 1.0);                              // half width
    float rad = (hl * hl + hw * hw) / (2.0 * hw);
    vec2 q = vec2(dot(d, vec2(-dir.y, dir.x)), along - (R0 * 0.55 + hl));
    float sd = sdVesica(q, rad, rad - hw);
    float L = level(A.w, uT);                                     // its band, now: the petal fades with its note
    float lit = B.a * (0.16 * exp(-age / 4.0) + 1.5 * L * L * L) + B.a * 2.2 * exp(-age * 9.0);
    float edge = exp(-sd * sd / 5.0);
    float fill = (1.0 - smoothstep(-hw * 1.2, 0.0, sd)) * 0.22;
    float vein = exp(-q.x * q.x / 2.0) * step(sd, 0.0) * 0.35;
    col += B.rgb * (edge + fill + vein) * lit;
  }
  o = vec4(col * uFade, 1.0);
}`;

const SPARK_VS = `#version 300 es
layout(location=0) in vec4 aP;      // x, y (stage px), size, alpha
layout(location=1) in vec3 aC;
out vec4 vC;
void main() {
  gl_Position = vec4(aP.x / 540.0 - 1.0, 1.0 - aP.y / 960.0, 0.0, 1.0);
  gl_PointSize = aP.z;
  vC = vec4(aC, aP.w);
}`;
const SPARK_FS = `#version 300 es
precision highp float;
in vec4 vC;
out vec4 o;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float d2 = dot(q, q);
  float b = exp(-d2 * 5.0) * (1.0 - smoothstep(0.6, 1.0, d2));
  o = vec4(vC.rgb * vC.a * b, 1.0);
}`;

// 4× downsample (four bilinear taps) / separable blur / final composite
const DOWN_FS = GLSL_HEAD + `
uniform sampler2D uSrc; uniform vec2 uTexel; out vec4 o;
void main() {
  vec2 sz = vec2(textureSize(uSrc, 0));
  vec2 c = gl_FragCoord.xy * uTexel;                               // destination uv
  o = 0.25 * (texture(uSrc, c + vec2(-1.0, -1.0) / sz) + texture(uSrc, c + vec2(1.0, -1.0) / sz)
            + texture(uSrc, c + vec2(-1.0, 1.0) / sz) + texture(uSrc, c + vec2(1.0, 1.0) / sz));
}`;
const BLUR_FS = GLSL_HEAD + `
uniform sampler2D uSrc; uniform vec2 uDir; out vec4 o;
void main() {
  vec2 sz = vec2(textureSize(uSrc, 0));
  vec2 uv = gl_FragCoord.xy / sz, dd = uDir / sz;
  vec3 c = texture(uSrc, uv).rgb * 0.2270270;
  c += (texture(uSrc, uv + dd * 1.3846154).rgb + texture(uSrc, uv - dd * 1.3846154).rgb) * 0.3162162;
  c += (texture(uSrc, uv + dd * 3.2307692).rgb + texture(uSrc, uv - dd * 3.2307692).rgb) * 0.0702703;
  o = vec4(c, 1.0);
}`;
const FINAL_FS = GLSL_HEAD + `
uniform sampler2D uHdr, uB1, uB2; uniform float uFrame, uBloom; out vec4 o;
void main() {
  vec2 uv = gl_FragCoord.xy / vec2(1080.0, 1920.0);
  vec3 c = texture(uHdr, uv).rgb;
  c += (texture(uB1, uv).rgb * 0.55 + texture(uB2, uv).rgb * 0.65) * uBloom;
  c = 1.0 - exp(-c * 1.15);
  vec2 v = (uv - vec2(0.5, 0.56)) * vec2(1.0, 0.62) * 2.0;
  c *= 1.0 - 0.42 * smoothstep(0.3, 1.3, dot(v, v));
  c = pow(max(c, 0.0), vec3(1.0 / 2.2));
  c += (hash(gl_FragCoord.xy + uFrame * 7.13) - 0.5) * (1.6 / 255.0);
  o = vec4(c, 1.0);
}`;

// ------------------------------------------------------------------ the story around the analysis
const zoom = track([[0, 0.94], [5.3, 1.0], [D, 1.04, (p) => p]]);
const fade = track([[0, 0], [0.3, 1, ease.outCubic], [D - 0.35, 1], [D, 0.85]]);
const bloomK = track([[0, 0.8], [5.3, 1.1], [7.0, 1.0], [D, 0.85]]);

/** linear interpolation in a per-frame table */
const sampleTable = (tab, t) => { const x = clamp(t * AR, 0, tab.length - 1.001), i = Math.floor(x), f = x - i; return tab[i] * (1 - f) + tab[i + 1] * f; };

function audioTransport(buffer, hint) {
  let actx = null, src = null, tp = { playing: false, t: 0, at: 0 };
  const stop = () => { if (src) { try { src.stop(); } catch (e) { /* already stopped */ } src.disconnect(); src = null; } };
  const sync = () => {
    stop();
    const running = actx && actx.state === 'running';
    hint.style.display = running ? 'none' : 'flex';
    if (!running || !tp.playing) return;
    // the player's clock: t at the last transport event + wall time since; start a little ahead by the output
    // latency so the sound is heard when the picture shows it
    const now = (tp.t + (performance.now() - tp.at) / 1000) % D;
    const lat = (actx.baseLatency || 0) + (actx.outputLatency || 0);
    src = actx.createBufferSource();
    src.buffer = buffer;
    src.connect(actx.destination);
    src.start(0, Math.min(D - 0.02, now + lat));
  };
  const unlock = () => {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      actx = new AC({ latencyHint: 'interactive' });
      actx.addEventListener('statechange', sync);
    }
    if (actx.state !== 'running') actx.resume().catch(() => {});   // 'statechange' → sync()
    else if (!src) sync();
  };
  // the first click on the picture turns the sound on (instead of pausing the player); the bar works as usual
  addEventListener('click', (e) => {
    const first = !actx || actx.state !== 'running';
    unlock();
    if (first && !(e.target && e.target.closest && e.target.closest('.dp-bar'))) e.stopPropagation();
  }, true);
  addEventListener('keydown', unlock, true);
  return (playing, t) => { tp = { playing, t, at: performance.now() }; sync(); };
}

defineDemo({
  id: '29-audio-sync',
  title: '소리가 그리는 빛',
  tech: 'Web Audio · OfflineAudioContext 합성 + FFT 분석 동기화',
  duration: D,
  background: '#05040c',
  async setup({ stage, canvas, headless }) {
    // ---------------- sound: synthesise, then analyse
    const buffer = await renderPiece(rand);
    const L = buffer.getChannelData(0), Rch = buffer.getChannelData(1);
    const mono = new Float32Array(L.length);
    for (let i = 0; i < L.length; i++) mono[i] = 0.5 * (L[i] + Rch[i]);
    const A = analyse(mono, buffer.sampleRate, D, { scale: SCALE });
    this.A = A;

    // notes → petals: direction by scale degree, length by pitch, a small fan for repeated pitches
    const notes = [];
    const seen = new Map();
    for (const on of A.onsets) for (const n of on.notes) {
      if (notes.length >= MAX_NOTES) break;
      const c = seen.get(n.midi) || 0;
      seen.set(n.midi, c + 1);
      const fan = [0, 7, -7, 13, -13, 18, -18][c % 7] * Math.PI / 180;
      const ang = (-90 + 72 * n.deg) * Math.PI / 180 + fan;
      const len = 150 + (n.midi - 60) * 9.5;
      const strength = clamp(0.55 + 0.6 * on.strength, 0.5, 1.15) * (0.75 + 0.25 * n.level);
      notes.push({ t: on.t, ang, len, u: bandOf(n.f) / BANDS, col: DEG_COL[n.deg], strength, seed: notes.length + 1 });
    }
    this.notes = notes;
    const noteA = new Float32Array(MAX_NOTES * 4), noteB = new Float32Array(MAX_NOTES * 4);
    notes.forEach((n, i) => { noteA.set([n.ang, n.len, n.t, n.u], i * 4); noteB.set([...n.col, n.strength], i * 4); });
    const pulses = A.pulses.slice(0, MAX_PULSES);
    const pulseA = new Float32Array(MAX_PULSES * 2);
    pulses.forEach((p, i) => pulseA.set([p.t, clamp(0.4 + 0.8 * p.strength, 0.4, 1.1)], i * 2));

    // sparks: fixed randoms per note, positions are closed-form functions of t
    const SPARKS = 30;
    const sparkR = notes.map((n) => { const R = rand(5000 + n.seed * 31); return Array.from({ length: SPARKS }, () => [R(), R(), R(), R(), R()]); });
    const sparkData = new Float32Array(notes.length * SPARKS * 7);

    // ---------------- GL
    const { ctx: gl } = canvas({ type: 'webgl2' });
    const hdrFmt = gl.getExtension('EXT_color_buffer_float') ? gl.RGBA16F : gl.RGBA8;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n'));
      return s;
    };
    const program = (vsrc, fsrc) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vsrc)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fsrc));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < nu; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const P = {
      scene: program(QUAD_VS, SCENE_FS), spark: program(SPARK_VS, SPARK_FS),
      down: program(QUAD_VS, DOWN_FS), blur: program(QUAD_VS, BLUR_FS), final: program(QUAD_VS, FINAL_FS),
    };
    const target = (w, h) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, hdrFmt, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { tex, fb, w, h };
    };
    const hdr = target(1080, 1920), b1 = target(270, 480), b1t = target(270, 480), b2 = target(135, 240), b2t = target(135, 240);

    // the band table as a texture: x = band, y = analysis frame
    const bandTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bandTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, BANDS, A.frames, 0, gl.RED, gl.FLOAT, A.bands);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const quad = gl.createVertexArray();
    gl.bindVertexArray(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const sparkVao = gl.createVertexArray();
    gl.bindVertexArray(sparkVao);
    const sparkBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sparkBuf);
    gl.bufferData(gl.ARRAY_BUFFER, sparkData.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 28, 16);
    gl.bindVertexArray(null);

    const pass = (prog, dst, tex, set) => {
      gl.useProgram(prog.p);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null);
      gl.viewport(0, 0, dst ? dst.w : 1080, dst ? dst.h : 1920);
      let unit = 0;
      for (const [name, t] of Object.entries(tex)) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        if (prog.u[name]) gl.uniform1i(prog.u[name], unit);
        unit++;
      }
      if (set) set(prog.u);
      gl.bindVertexArray(quad);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    this.draw = (t) => {
      const z = zoom(t);
      const rms = sampleTable(A.rms, t), low = sampleTable(A.low, t);
      gl.disable(gl.BLEND);
      pass(P.scene, hdr, { uBands: bandTex }, (u) => {
        gl.uniform1f(u.uT, t); gl.uniform1f(u.uK, A.frames); gl.uniform1f(u.uRms, rms); gl.uniform1f(u.uLow, low);
        gl.uniform1f(u.uZoom, z); gl.uniform1f(u.uFade, fade(t));
        gl.uniform4fv(u.uNoteA, noteA); gl.uniform4fv(u.uNoteB, noteB); gl.uniform1i(u.uNotes, notes.length);
        gl.uniform2fv(u.uPulse, pulseA); gl.uniform1i(u.uPulses, pulses.length);
      });

      // sparks from each petal tip at its onset: drag-limited flight, a slow rise, fading
      let n = 0;
      const f = fade(t);
      notes.forEach((nt, i) => {
        const age = t - nt.t;
        if (age < 0 || age > 2.4) return;
        const tipR = (R0 * 0.55 + nt.len) * z;
        const tx = CX + Math.cos(nt.ang) * tipR, ty = CY + Math.sin(nt.ang) * tipR;
        for (const [r1, r2, r3, r4, r5] of sparkR[i]) {
          const a = nt.ang + (r1 - 0.5) * 1.9, v = 110 + 430 * r2 * r2, k = 2.2 + 1.2 * r3;
          const s = (v * (1 - Math.exp(-k * age))) / k;
          const x = tx + Math.cos(a) * s, y = ty + Math.sin(a) * s - 22 * age * age;
          const al = nt.strength * Math.exp(-age * (1.3 + 1.4 * r4)) * (0.6 + 0.4 * Math.sin(age * (9 + 14 * r5) + r1 * 20)) * f;
          sparkData.set([x, y, 3 + 7 * r3 * r3, al * 0.9, ...nt.col.map((c) => 0.45 + 0.55 * c)], n * 7);
          n++;
        }
      });
      if (n) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, hdr.fb);
        gl.viewport(0, 0, 1080, 1920);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.useProgram(P.spark.p);
        gl.bindVertexArray(sparkVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, sparkBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, sparkData, 0, n * 7);
        gl.drawArrays(gl.POINTS, 0, n);
        gl.disable(gl.BLEND);
      }
      // bloom
      pass(P.down, b1, { uSrc: hdr.tex }, (u) => gl.uniform2f(u.uTexel, 1 / 270, 1 / 480));
      pass(P.blur, b1t, { uSrc: b1.tex }, (u) => gl.uniform2f(u.uDir, 1, 0));
      pass(P.blur, b1, { uSrc: b1t.tex }, (u) => gl.uniform2f(u.uDir, 0, 1));
      pass(P.down, b2, { uSrc: b1.tex }, (u) => gl.uniform2f(u.uTexel, 1 / 135, 1 / 240));
      pass(P.blur, b2t, { uSrc: b2.tex }, (u) => gl.uniform2f(u.uDir, 1, 0));
      pass(P.blur, b2, { uSrc: b2t.tex }, (u) => gl.uniform2f(u.uDir, 0, 1));
      pass(P.final, null, { uHdr: hdr.tex, uB1: b1.tex, uB2: b2.tex }, (u) => {
        gl.uniform1f(u.uFrame, Math.round(t * 30)); gl.uniform1f(u.uBloom, bloomK(t));
      });
    };

    // ---------------- live sound
    if (!headless) {
      const hint = document.createElement('div');
      hint.style.cssText = 'position:absolute;left:50%;top:96px;transform:translateX(-50%);display:flex;align-items:center;gap:14px;' +
        'padding:16px 30px 16px 24px;border-radius:999px;background:rgba(20,16,36,.62);border:1px solid rgba(255,255,255,.14);' +
        'color:#efe9ff;font:600 30px/1 "Pretendard Variable",Pretendard,sans-serif;letter-spacing:-0.01em;z-index:900;pointer-events:none';
      hint.innerHTML = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>클릭하면 소리가 나요';
      stage.appendChild(hint);
      this.transport = audioTransport(buffer, hint);
    }
  },
  onTransport({ playing, t }) {
    if (this.transport) this.transport(playing, t);
  },
  frame(t) {
    this.draw(t);
  },
});
