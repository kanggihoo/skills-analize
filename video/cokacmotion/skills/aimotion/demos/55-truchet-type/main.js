/*
 * 55 · 타일로 짠 글자 — a multi-scale Truchet weave that turns, tile by tile, into 이음 and then 매듭.
 *   setup(): 이음 and 매듭 are set in Pretendard Black (stacked, one syllable per line) → coverage (textAlpha) →
 *            a corner field on a 15 px lattice for each word → one quadtree over the 120 px base grid that splits
 *            wherever either word's corners disagree (down to 15 px) and, at random, elsewhere (so the start does
 *            not give the words away) → per leaf: 5-bit ink tiles for both words, thread orientations, and the
 *            schedule of its turns (wavefront distance + jitter), all baked into one instance buffer.
 *   frame(t): one uniform (t). The vertex shader turns each tile (overshoot ease, quarter turns), the fragment
 *            shader draws it (shaders.js): settled tiles → an offscreen layer → ink shadow + bevel + paper;
 *            the tiles that are turning are drawn on top as lifted cards with their own soft shadows.
 * Why the turns can change a tile: a quarter turn swaps a Smith tile's diagonal, so the threads reach their
 * target by 1 or 2 quarter turns; the ink grows in (or gives way) inside the turning tile's own frame.
 */
import { defineDemo, rand, ramp } from '../_lib/stage.js';
import { FONTS, fontReady, textAlpha } from '../_lib/type.js';
import { TILE_VS, TILE_FS, QUAD_VS, DOWN_FS, BLUR_FS, COMP_FS } from './shaders.js';

const D = 10;
const BASE = 120, FINE = 15, COLS = 9, ROWS = 16;           // tiles 120 / 60 / 30 / 15 px
const NXV = 1080 / FINE + 1, NYV = 1920 / FINE + 1;          // corner lattice 73 × 129
const P_SPLIT = [0.55, 0.45, 0.3];                           // extra random splits per level (camouflage + texture)
const FONT_PX = 620, LINE_GAP = 64, YC = 820;                // word size, gap between the two syllables, block centre
const WORD_FONT = `900 ${FONT_PX}px "${FONTS.pretendard.family}"`;
const UI = `"${FONTS.pretendard.family}"`;
const WORD_A = ['이', '음'], WORD_B = ['매', '듭'];
const SUBS = [
  { text: '끊어진 것을 잇고', a: (t) => ramp(t, 3.3, 3.9) * (1 - ramp(t, 4.75, 5.15)) },
  { text: '이어진 것을 맺는다', a: (t) => ramp(t, 7.4, 8.0) },
];
// sweep 1: a straight front from the top-left, downward; sweep 2: a ring from the centre outward
const S1 = { t0: 0.85, span: 2.0, dir: [0.447, 0.894] };
const S2 = { t0: 4.95, span: 1.95, c: [540, 820] };
const fade = (t) => ramp(t, 0, 0.4) * (1 - ramp(t, 9.65, D));

// ---------------------------------------------------------------- the words → corner fields
function layoutWord(ctx, syl) {
  ctx.font = WORD_FONT;
  const ink = syl.map((s) => { const m = ctx.measureText(s); return { s, l: m.actualBoundingBoxLeft, r: m.actualBoundingBoxRight, a: m.actualBoundingBoxAscent, d: m.actualBoundingBoxDescent }; });
  let top = YC - (ink.reduce((h, k) => h + k.a + k.d, 0) + LINE_GAP * (ink.length - 1)) / 2;
  return ink.map((k) => { const it = { s: k.s, x: 540 - (k.r - k.l) / 2, y: top + k.a }; top += k.a + k.d + LINE_GAP; return it; });
}
function coverage(items) {
  const a = textAlpha(1080, 1920, (ctx) => {
    ctx.font = WORD_FONT;
    ctx.textBaseline = 'alphabetic';
    for (const it of items) ctx.fillText(it.s, it.x, it.y);
  });
  // coverage at a stage point = mean of the 2×2 pixels around it
  const px = (x, y) => a[Math.min(1919, Math.max(0, y)) * 1080 + Math.min(1079, Math.max(0, x))];
  return (x, y) => {
    const i = Math.round(x), j = Math.round(y);
    return (px(i - 1, j - 1) + px(i, j - 1) + px(i - 1, j) + px(i, j)) / 4;
  };
}
function lattice(cov) {
  const v = new Uint8Array(NXV * NYV);
  for (let j = 0; j < NYV; j++) for (let i = 0; i < NXV; i++) v[j * NXV + i] = cov(i * FINE, j * FINE) >= 0.5 ? 1 : 0;
  return v;
}

// ---------------------------------------------------------------- quadtree + tile bits
function uniformIn(V, i0, j0, n) {
  const v = V[j0 * NXV + i0];
  for (let j = j0; j <= j0 + n; j++) for (let i = i0; i <= i0 + n; i++) if (V[j * NXV + i] !== v) return -1;
  return v;
}
function buildLeaves(VA, VB, R) {
  const leaves = [];
  const build = (x0, y0, lev) => {
    const s = BASE >> lev, n = s / FINE, i0 = x0 / FINE, j0 = y0 / FINE;
    const split = lev < 3 && (uniformIn(VA, i0, j0, n) < 0 || uniformIn(VB, i0, j0, n) < 0 || R() < P_SPLIT[lev]);
    if (!split) { leaves.push({ x0, y0, s, lev, n, i0, j0 }); return; }
    const h = s / 2;
    build(x0, y0, lev + 1); build(x0 + h, y0, lev + 1); build(x0, y0 + h, lev + 1); build(x0 + h, y0 + h, lev + 1);
  };
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) build(c * BASE, r * BASE, 0);
  return leaves;
}
/** 5 bits: corners TL, TR, BR, BL (from the lattice, shared with every neighbour) + the centre (the saddle resolver) */
function bitsOf(V, cov, L) {
  const at = (i, j) => V[j * NXV + i];
  const a = at(L.i0, L.j0), b = at(L.i0 + L.n, L.j0), c = at(L.i0 + L.n, L.j0 + L.n), d = at(L.i0, L.j0 + L.n);
  const e = L.n >= 2 ? at(L.i0 + L.n / 2, L.j0 + L.n / 2) : cov(L.x0 + L.s / 2, L.y0 + L.s / 2) >= 0.5 ? 1 : 0;
  return a | (b << 1) | (c << 2) | (d << 3) | (e << 4);
}
/** thread orientation for a word state: hug the ink boundary; circles inside the letters; free weave outside */
function orient(bits, L, R) {
  const e = (bits >> 4) & 1;
  const edge = (k) => (((bits >> k) & 1) !== e ? 1 : 0);
  const nAC = edge(0) + edge(2), nBD = edge(1) + edge(3);
  if (nAC + nBD > 0) return nAC > nBD ? 0 : nAC < nBD ? 1 : R() < 0.5 ? 0 : 1;
  if (e) return (L.x0 / L.s + L.y0 / L.s) & 1;      // checkerboard → the arcs close into rings
  return R() < 0.5 ? 0 : 1;
}

function bakeTiles(VA, VB, covA, covB) {
  const R = rand(5505);
  const leaves = buildLeaves(VA, VB, R);
  let pmin = Infinity, pmax = -Infinity, rmax = 0;
  for (const L of leaves) {
    const cx = L.x0 + L.s / 2, cy = L.y0 + L.s / 2;
    const p = cx * S1.dir[0] + cy * S1.dir[1];
    pmin = Math.min(pmin, p); pmax = Math.max(pmax, p);
    rmax = Math.max(rmax, Math.hypot(cx - S2.c[0], cy - S2.c[1]));
  }
  const data = new Float32Array(leaves.length * 20);
  let nShim = 0;
  leaves.forEach((L, k) => {
    const cx = L.x0 + L.s / 2, cy = L.y0 + L.s / 2;
    const bA = bitsOf(VA, covA, L), bB = bitsOf(VB, covB, L);
    const o0 = R() < 0.5 ? 0 : 1;
    const o1 = orient(bA, L, R);
    const k1 = o1 !== o0 ? 1 : 2;                       // a quarter turn swaps the diagonal; two keep it
    const same = bA === bB, uniB = bB === 0 || bB === 31;
    let o2, k2;
    if (same && !uniB) { o2 = o1; k2 = 0; }             // an edge tile both words share stays put
    else { o2 = orient(bB, L, R); k2 = o2 !== o1 ? 1 : 2; }
    const dur = 0.5 + 0.14 * (L.s / BASE);              // big tiles are heavier
    const st1 = S1.t0 + S1.span * ((cx * S1.dir[0] + cy * S1.dir[1] - pmin) / (pmax - pmin)) + 0.14 * R();
    const st2 = S2.t0 + S2.span * (Math.hypot(cx - S2.c[0], cy - S2.c[1]) / rmax) + 0.14 * R();
    // a few half turns of plain tiles: before the first wave (the weave is alive) and after the last (shimmer)
    let shS = 1e4, shD = 1, qs = 0, pre = false;
    const r = R(), weight = L.lev <= 1 ? 1 : L.lev === 2 ? 0.6 : 0.1;
    if (st1 > 1.3 && r < 0.012 * weight * 2) { shS = 0.1 + 0.45 * R(); shD = 0.62; qs = R() < 0.5 ? 2 : -2; pre = true; }
    else if (uniB && r > 1 - 0.03 * weight) {
      const s = 7.75 + 1.35 * R();
      if (s > st2 + dur + 0.25) { shS = s; shD = 0.8; qs = R() < 0.5 ? 2 : -2; nShim++; }
    }
    const thR1 = (pre ? qs : 0) + k1, thR2 = thR1 - k2;  // rest angles (quarter turns) when each word is upright
    data.set([cx, cy, L.s, L.lev, bA, bB, o0, same ? 1 : 0,                  // same ink in both words: keep it, never re-grow
      st1, dur, k1, st2, dur, -k2, shS, shD, qs, thR1, thR2, R()], k * 20);
  });
  return { data, count: leaves.length, shimmer: nShim };
}

// ---------------------------------------------------------------- GL helpers
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
function target(gl, w, h) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('framebuffer incomplete');
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { tex, fb, w, h };
}

// ---------------------------------------------------------------- the line of text under the word (2D overlay)
function drawText(g, t) {
  g.clearRect(0, 1420, 1080, 170);
  const f = fade(t);
  let rule = 0;
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.font = `600 38px ${UI}`;
  g.lineJoin = 'round';
  for (const s of SUBS) {
    const a = s.a(t) * f;
    rule = Math.max(rule, a);
    if (a <= 0.002) continue;
    const y = 1534 + (1 - a) * 8;
    g.strokeStyle = `rgba(239, 231, 216, ${0.92 * a})`;   // a paper halo knocks the threads back behind the words
    g.lineWidth = 16;
    g.strokeText(s.text, 540, y);
    g.fillStyle = `rgba(29, 39, 63, ${a})`;
    g.fillText(s.text, 540, y);
  }
  if (rule > 0.002) {
    g.fillStyle = `rgba(239, 231, 216, ${0.92 * rule})`;
    g.fillRect(540 - 30, 1466, 60, 9);
    g.fillStyle = `rgba(198, 89, 59, ${rule})`;
    g.fillRect(540 - 22 * rule, 1469, 44 * rule, 3);
  }
}

defineDemo({
  id: '55-truchet-type',
  title: '타일로 짠 글자',
  tech: '다중 스케일 트루셰 타일 · 모서리 점유 기반 타일 선택',
  duration: D,
  background: '#0e1119',
  async setup({ canvas, W, H }) {
    await fontReady(WORD_FONT, WORD_A.join('') + WORD_B.join(''));
    await fontReady(`600 38px ${UI}`, SUBS.map((s) => s.text).join(''));

    const mctx = document.createElement('canvas').getContext('2d');
    const covA = coverage(layoutWord(mctx, WORD_A)), covB = coverage(layoutWord(mctx, WORD_B));
    const tiles = bakeTiles(lattice(covA), lattice(covB), covA, covB);
    this.tileCount = tiles.count;

    const { ctx: gl } = canvas({ type: 'webgl2', z: 0 });
    const TP = compile(gl, TILE_VS, TILE_FS);
    const DN = compile(gl, QUAD_VS, DOWN_FS), BL = compile(gl, QUAD_VS, BLUR_FS), CP = compile(gl, QUAD_VS, COMP_FS);

    // tiles: a 4-vertex strip + one instance per leaf (5 × vec4)
    const vaoT = gl.createVertexArray();
    gl.bindVertexArray(vaoT);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, tiles.data, gl.STATIC_DRAW);
    for (let k = 0; k < 5; k++) {
      gl.enableVertexAttribArray(1 + k);
      gl.vertexAttribPointer(1 + k, 4, gl.FLOAT, false, 80, k * 16);
      gl.vertexAttribDivisor(1 + k, 1);
    }
    const vaoQ = gl.createVertexArray();
    gl.bindVertexArray(vaoQ);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const layer = target(gl, W, H), ha = target(gl, W / 2, H / 2), hb = target(gl, W / 2, H / 2);
    const quad = (prog, dst, bind) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null);
      gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H);
      gl.useProgram(prog.p);
      bind(prog.u);
      gl.bindVertexArray(vaoQ);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const tex = (unit, rt, loc) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, rt.tex); gl.uniform1i(loc, unit); };
    const tilesPass = (mode, t, f) => {
      gl.useProgram(TP.p);
      gl.uniform1f(TP.u.uT, t);
      gl.uniform1i(TP.u.uMode, mode);
      gl.uniform1f(TP.u.uFade, f);
      gl.bindVertexArray(vaoT);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, tiles.count);
    };

    const { ctx: g } = canvas({ type: '2d', z: 1 });

    this.draw = (t) => {
      const f = fade(t);
      // 1. settled tiles → layer (R ink, G threads, B accent); MAX blending, so the half-pixel overlaps add nothing
      gl.bindFramebuffer(gl.FRAMEBUFFER, layer.fb);
      gl.viewport(0, 0, W, H);
      gl.disable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendEquation(gl.MAX);
      gl.blendFunc(gl.ONE, gl.ONE);
      tilesPass(0, t, f);
      gl.blendEquation(gl.FUNC_ADD);
      gl.disable(gl.BLEND);
      // 2. the ink, blurred at half resolution (shadow + bevel)
      quad(DN, ha, (u) => { tex(0, layer, u.src); gl.uniform2f(u.px, 1 / W, 1 / H); });
      quad(BL, hb, (u) => { tex(0, ha, u.src); gl.uniform2f(u.dir, 2 / W, 0); });
      quad(BL, ha, (u) => { tex(0, hb, u.src); gl.uniform2f(u.dir, 0, 2 / H); });
      // 3. paper + layer → screen
      quad(CP, null, (u) => {
        tex(0, layer, u.uLayer); tex(1, ha, u.uBlur);
        gl.uniform1f(u.uFade, f); gl.uniform1f(u.uFrame, Math.round(t * 30));
      });
      // 4. the tiles that are turning: their shadows, then the cards, the highest on top
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
      tilesPass(1, t, f);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      tilesPass(2, t, f);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      drawText(g, t);
    };
  },
  frame(t) { this.draw(t); },
});
