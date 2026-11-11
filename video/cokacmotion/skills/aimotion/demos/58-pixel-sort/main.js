/*
 * 58 · 정렬된 소란 — a glitch poster whose letters melt under a GPU pixel sort and resolve back.
 *
 * Every frame starts from nothing (no state, frame(t) is pure):
 *   1. BASE  the poster is rendered from t into a 1024-long "sort space" texture (rows: 1024×960, columns: 1024×540);
 *            alpha marks the pixels inside a span (luma inside the animated window [lo, hi] AND inside the
 *            choreographed gate: a jagged melt front per column, drifting segments per row band, a restore sweep).
 *   2. MASK + 3 SCAN + KEY   segmented sort trick: m[x] = x where a span starts or the pixel stays, else -1;
 *            a radix-4 prefix max (5 passes, the first and last fused) gives spanStart; the key
 *            spanStart·1024 + luma10 (in span) / x·1024 + 1023 (outside) is packed with the colour in RGBA32F.
 *   4. SORT  a bitonic network over all 1024 positions of every line: 36 fragment passes instead of 55, because
 *            each stage's last three steps (j = 4, 2, 1) run in registers on an aligned group of 8.
 *            Sorting the whole line by that key puts every span back on its own interval, sorted inside it.
 *   5. COMP  full-resolution composite: the crisp poster where nothing moved, the sorted texture inside spans;
 *            bloom; then tearing, chromatic offset, scanlines, grain and a restore beam to the screen.
 */
import { defineDemo, track, ease, clamp } from '../_lib/stage.js';
import { fontReady, textAlpha } from '../_lib/type.js';
import * as SH from './shaders.js';

const D = 9.6;
const N = 1024;                 // sort length (power of two)
const MR = 960, MC = 540;       // lines across the sort axis: rows mode (2 px rows), columns mode (2 px columns)
const SW = 1080, SH_ = 1920;
const BW = 270, BH = 480;       // bloom grid

// ---------------------------------------------------------------- story (seconds)
const T_MELT = 1.85;            // the threshold opens: columns melt downward
const FLIP = 4.2;               // the direction flips: rows, chromatic offset, scanlines
const SW0 = 6.45, SW1 = 7.85;   // the restore sweep
const AG0 = 8.5, AG1 = 8.8;     // a last small glitch in one band
const AGB = [0.305, 0.337];     // its rows (fraction of height, through 소란)

const B_LO = track([[T_MELT, 0.5], [2.6, 0.085, ease.outCubic]]);   // floor: above the sky at the header rule (0.067)
const B_DRIP = track([[1.95, 0], [4.15, 1.55, ease.inOutCubic]]);
const C_LO = track([[FLIP, 0.1], [5.45, 0.0]]);         // low from the start: 소란 stays molten through the flip
const C_AMT = track([[FLIP, 0.6], [5.3, 1.0]]);
const C_SEG = track([[FLIP, 0.42], [5.5, 1.0]]);
const C_FULL = track([[5.35, 0], [5.75, 1], [6.25, 1], [6.6, 0.5]]);
const C_FLIP = track([[FLIP, 0], [4.75, 0.5]]);
const SWEEP = track([[SW0, 0], [SW1, 1.06]]);
const CHROMA = track([[1.9, 0], [4.0, 2.5], [FLIP + 0.05, 8], [5.8, 11], [6.4, 9], [SW1, 1.4], [D, 1.0]]);
const SCAN = track([[FLIP, 0], [4.5, 1], [6.5, 1], [SW1, 0.18]]);
const BLOOM = track([[0, 0.2], [2.0, 0.2], [3.8, 0.45], [5.9, 0.7], [SW1, 0.3], [D, 0.26]]);
const GRAIN = track([[0, 0.032], [FLIP, 0.045], [5.8, 0.07], [SW1, 0.034]]);
const EXPO = track([[0, 0], [0.75, 1, ease.outCubic], [9.15, 1], [D, 0, ease.inCubic]]);
const BEAM = track([[SW0, 0], [SW0 + 0.15, 1], [SW1 - 0.2, 1], [SW1, 0]]);
// glitch hits: [start, length, strength]
const HITS = [[1.22, 0.1, 0.3], [FLIP - 0.03, 0.17, 1.0], [5.05, 0.07, 0.45], [5.62, 0.1, 0.6], [6.2, 0.07, 0.4], [AG0 + 0.02, 0.12, 0.55]];
const hit = (t) => HITS.reduce((h, [t0, d, a]) => (t >= t0 && t < t0 + d ? Math.max(h, a) : h), 0);

/** the sort's part of the choreography at time t */
function plan(t) {
  const p = { use: 0, axis: 0, lo: 2, hi: 2, drip: 0, row: [0, 0, 0, 0], sweep: [0, 0, 0, 0] };
  if (t >= T_MELT && t < FLIP) Object.assign(p, { use: 1, axis: 1, lo: B_LO(t), hi: 1.01, drip: B_DRIP(t) });
  else if (t >= FLIP && t < SW1) Object.assign(p, { use: 1, axis: 0, lo: C_LO(t), hi: 1.01, row: [C_AMT(t), C_SEG(t), C_FULL(t), C_FLIP(t)], sweep: [SWEEP(t), 0, 0, 0] });
  else if (t >= AG0 && t < AG1) Object.assign(p, { use: 1, axis: 0, lo: 0, hi: 1.01, row: [1, 1, 1, 1], sweep: [0, AGB[0], AGB[1], 1] });
  return p;
}

// ---------------------------------------------------------------- the type, rasterised once into four channels
const SORAN = '소란', WORD = 'NOISE';
const POEM = ['흩어진 것은 밝기 순으로 눕고', '소란은 끝내 제자리로 돌아온다'];
const F_SO = (px) => `400 ${px}px "Black Han Sans"`;
// canvas: the width axis goes through ctx.fontStretch (set apart from the shorthand); loading names it in the shorthand
const F_WORD = (px) => `900 ${px}px "Anybody Variable"`;
const F_SMALL = (px) => `650 ${px}px "Anybody Variable"`;
const F_POEM = (px) => `500 ${px}px "Pretendard Variable"`;

function setFont(c, font, stretch = 'normal', spacing = 0) {
  c.font = font;
  if ('fontStretch' in c) c.fontStretch = stretch;
  if ('letterSpacing' in c) c.letterSpacing = `${spacing}px`;
}
/** fit `text` to a target ink width; returns the font size */
function fit(c, fontAt, text, width, stretch) {
  setFont(c, fontAt(100), stretch);
  const m = c.measureText(text);
  return 100 * width / (m.actualBoundingBoxLeft + m.actualBoundingBoxRight);
}
/** draw `text` with its ink box centred on x and its ink top at y; returns the ink box */
function drawCentered(c, text, x, top) {
  const m = c.measureText(text);
  const x0 = x - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
  const y0 = top + m.actualBoundingBoxAscent;
  c.fillText(text, x0, y0);
  return { top, bottom: y0 + m.actualBoundingBoxDescent };
}

async function typeLayers() {
  await fontReady(F_SO(200), SORAN);
  await fontReady(`extra-expanded ${F_WORD(200)}`, WORD);
  await fontReady(`condensed ${F_SMALL(28)}`, 'N°58 SORTED NOISE KEY = START × 1024 + LUMA BITONIC NETWORK · 36 PASSES');
  await fontReady(F_POEM(34), POEM.join(''));
  const W = SW, H = SH_;
  let so = null;
  const R = textAlpha(W, H, (c) => {
    const px = fit(c, F_SO, SORAN, 944);
    setFont(c, F_SO(px), 'normal', 0);
    so = drawCentered(c, SORAN, 540, 404);
  });
  const G = textAlpha(W, H, (c) => {
    const px = fit(c, F_WORD, WORD, 1000, 'extra-expanded');
    setFont(c, F_WORD(px), 'extra-expanded', 0);
    const m = c.measureText(WORD);
    c.fillText(WORD, 540 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2, 1402);
  });
  const B = textAlpha(W, H, (c) => {
    setFont(c, F_SMALL(27), 'condensed', 4.5);
    c.textBaseline = 'alphabetic';
    c.textAlign = 'left'; c.fillText('N°58', 64, 128);
    c.textAlign = 'right'; c.fillText('SORTED NOISE', 1016, 128);
    setFont(c, F_SMALL(21), 'condensed', 3.5);
    c.textAlign = 'left'; c.fillText('KEY = START × 1024 + LUMA', 64, 1626);
    c.textAlign = 'right'; c.fillText('BITONIC NETWORK · 36 PASSES', 1016, 1626);
    setFont(c, F_POEM(34), 'normal', 0.5);
    c.textAlign = 'center';
    c.fillText(POEM[0], 540, 986);
    c.fillText(POEM[1], 540, 1036);
  });
  const A = textAlpha(W, H, (c) => {
    c.fillRect(64, 149, 952, 2);
    c.fillRect(64, 1588, 952, 1.5);
    c.beginPath(); c.arc(812, 118, 6.5, 0, Math.PI * 2); c.fill();
  });
  const data = new Uint8Array(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    data[i * 4] = Math.round(R[i] * 255);
    data[i * 4 + 1] = Math.round(G[i] * 255);
    data[i * 4 + 2] = Math.round(B[i] * 255);
    data[i * 4 + 3] = Math.round(A[i] * 255);
  }
  return { data, so };
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '58-pixel-sort',
  title: '정렬된 소란',
  tech: 'GPU 픽셀 정렬(비토닉 정렬망) · 밝기 구간 분할 정렬 · 색수차',
  duration: D,
  background: '#08071a',
  async setup({ canvas, headless }) {
    const { ctx: gl } = canvas({ type: 'webgl2' });
    this.gl = gl; this.headless = headless;
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float missing (float render targets)');
    const type = await typeLayers();

    // --- tiny GL kit
    const shader = (kind, src) => {
      const s = gl.createShader(kind);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n'));
      return s;
    };
    const vs = shader(gl.VERTEX_SHADER, SH.VERT);
    const program = (src) => {
      const p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, src));
      gl.bindAttribLocation(p, 0, 'p');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    const texture = (w, h, fmt, filter) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, fmt, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return tex;
    };
    const target = (w, h, fmt, filter = gl.NEAREST) => {
      const tex = texture(w, h, fmt, filter);
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
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
    /** one full-screen pass into dst (null = screen); rows limits the viewport height (sort space) */
    const pass = (P, dst, tex, set, rows) => {
      gl.useProgram(P.p);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null);
      gl.viewport(0, 0, dst ? dst.w : SW, dst ? (rows || dst.h) : SH_);
      let unit = 0;
      for (const [name, t] of Object.entries(tex)) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t.tex || t);
        if (P.u[name]) gl.uniform1i(P.u[name], unit);
        unit++;
      }
      if (set) set(P.u);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const P = {
      base: program(SH.BASE), mask: program(SH.MASK), scan: program(SH.SCAN), key: program(SH.KEY),
      step: program(SH.STEP), pre8: program(SH.PRE8), mrg8: program(SH.MRG8),
      comp: program(SH.COMP), down: program(SH.DOWN), blur: program(SH.BLUR), out: program(SH.OUT),
    };

    // type texture (RGBA8, row 0 = top of the stage, sampled with y-down coordinates)
    const T = texture(SW, SH_, gl.RGBA8, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, SW, SH_, gl.RGBA, gl.UNSIGNED_BYTE, type.data);

    const MMAX = Math.max(MR, MC);
    const Base = target(N, MMAX, gl.RGBA16F);
    const PA = target(N, MMAX, gl.R16F), PB = target(N, MMAX, gl.R16F);     // span starts: integers −1..1023, exact in half
    const SA = target(N, MMAX, gl.RGBA32F), SB = target(N, MMAX, gl.RGBA32F); // key + colour, NEAREST only (texelFetch)
    const C = target(SW, SH_, gl.RGBA16F, gl.LINEAR);
    const B1 = target(BW, BH, gl.RGBA16F, gl.LINEAR), B2 = target(BW, BH, gl.RGBA16F, gl.LINEAR);

    const soY = [type.so.top, type.so.bottom];
    const common = (u, t, pl, M) => {
      if (u.uTime) gl.uniform1f(u.uTime, t);
      if (u.uSo) gl.uniform2f(u.uSo, soY[0], soY[1]);
      if (u.uAxis) gl.uniform1i(u.uAxis, pl.axis);
      if (u.uM) gl.uniform1f(u.uM, M);
      if (u.uWin) gl.uniform2f(u.uWin, pl.lo, pl.hi);
      if (u.uDrip) gl.uniform1f(u.uDrip, pl.drip);
      if (u.uRow) gl.uniform4fv(u.uRow, pl.row);
      if (u.uSweep) gl.uniform4fv(u.uSweep, pl.sweep);
    };

    /** the segmented sort of the poster at time t; returns the sorted RGBA32F target */
    const sortAt = (t, pl, M) => {
      pass(P.base, Base, { T }, (u) => common(u, t, pl, M), M);
      pass(P.mask, PA, { B: Base }, null, M);
      let a = PA, b = PB;
      for (const d of [4, 16, 64]) { pass(P.scan, b, { P: a }, (u) => gl.uniform1i(u.d, d), M); [a, b] = [b, a]; }
      pass(P.key, SA, { P: a, B: Base }, (u) => common(u, t, pl, M), M);
      let s = SA, s2 = SB;
      pass(P.pre8, s2, { S: s }, null, M); [s, s2] = [s2, s];
      for (let k = 16; k <= N; k *= 2) {
        for (let j = k >> 1; j >= 8; j >>= 1) {
          pass(P.step, s2, { S: s }, (u) => { gl.uniform1i(u.k, k); gl.uniform1i(u.j, j); }, M);
          [s, s2] = [s2, s];
        }
        pass(P.mrg8, s2, { S: s }, (u) => gl.uniform1i(u.k, k), M);
        [s, s2] = [s2, s];
      }
      return s;
    };

    this.render = (t) => {
      const pl = plan(t);
      const M = pl.axis === 0 ? MR : MC;
      const sorted = pl.use ? sortAt(t, pl, M) : SA;
      pass(P.comp, C, { T, S: sorted }, (u) => { common(u, t, pl, M); gl.uniform1i(u.uUse, pl.use); });
      pass(P.down, B1, { C });
      pass(P.blur, B2, { B: B1 }, (u) => gl.uniform2f(u.dir, 1, 0));
      pass(P.blur, B1, { B: B2 }, (u) => gl.uniform2f(u.dir, 0, 1));
      pass(P.blur, B2, { B: B1 }, (u) => gl.uniform2f(u.dir, 2.4, 0));
      pass(P.blur, B1, { B: B2 }, (u) => gl.uniform2f(u.dir, 0, 2.4));
      const h = hit(t), frameNo = Math.floor(t * 30 + 1e-6);
      pass(P.out, null, { C, Bl: B1 }, (u) => {
        gl.uniform1f(u.uChroma, CHROMA(t) + 16 * h);
        gl.uniform1f(u.uTear, h);
        gl.uniform1f(u.uSeed, frameNo);
        gl.uniform1f(u.uScan, SCAN(t));
        gl.uniform1f(u.uGrain, GRAIN(t));
        gl.uniform1f(u.uBloom, BLOOM(t));
        gl.uniform1f(u.uExpo, EXPO(t));
        gl.uniform1f(u.uBeam, BEAM(t));
        gl.uniform1f(u.uBeamY, clamp(SWEEP(t), 0, 1.06) * SH_);
        gl.uniform1f(u.uFlash, 0.1 * h * h);
      });
    };
  },
  frame(t) {
    this.render(t);
    // headless check runs only: surface any GL error (one synchronous round trip; never in live playback)
    if (this.headless) { const e = this.gl.getError(); if (e) throw new Error(`WebGL error 0x${e.toString(16)} at t=${t}`); }
  },
});
