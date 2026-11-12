/*
 * 59 · 글자로 빚은 등대 — a poem written into a 36×64 grid of Hangul, in reading order, becomes a picture.
 *
 *   setup():  every syllable of the poem (and the interpunct that separates its words) is rasterised with
 *             Pretendard Variable at nine weights, 100…900, and turned into signed distance fields: one R16F
 *             texture array, one layer per weight. The coverage of every glyph at every weight is measured too.
 *   frame(t): (1) a night scene is raymarched at 216×384, six samples a side per text cell: a striped lighthouse
 *             on a rocky headland, swells, a crescent moon, stars and the lamp's rotating beam in the sea haze;
 *             (2) its 6×6 blocks are averaged per cell; (3) a full-screen pass draws the poem: each cell keeps its
 *             syllable, only its weight (the blend of two neighbouring weights' distance fields), and a little of
 *             its brightness and colour follow the picture's luminance — the detail under each pixel thickens
 *             or thins the strokes inside a glyph; (4) bloom and tone map.
 * Story: the poem is written in as plain thin text → the lamp lights, its beam starts to sweep, and the picture
 * spreads out from the lantern through the weights → the beam swings round to face us: a flash → the picture
 * dissolves in patches back into a calm, readable poem, in which one line keeps the lamp's warm light.
 */
import { defineDemo, clamp, lerp } from '../_lib/stage.js';
import { fontReady, textAlpha, signedDistance } from '../_lib/type.js';
import { createGL, QUAD_VS } from './gl.js';
import { SCENE_FS, CELL_FS, MOSAIC_FS, DOWN_FS, BLUR_FS, FINAL_FS } from './shaders.js';

const D = 10;
const TAU = Math.PI * 2;
const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const wrapPi = (a) => a - TAU * Math.floor((a + Math.PI) / TAU);

// ---------------------------------------------------------------- the grid and the poem
const COLS = 36, ROWS = 64, CELLPX = 30;            // 36 × 64 cells of 30 px = the whole 1080 × 1920 stage
const SW = COLS * 6, SH = ROWS * 6;                 // the scene: 6 × 6 samples per cell
const FONT_PX = 48, ACELL = 64, AGRID = 8, LEVELS = 9;
const AW = ACELL * AGRID;                           // 512: one atlas layer, 8 × 8 cells
const FAMILY = '"Pretendard Variable"';
const POEM = '어두운 바다 위에 누군가 불을 켜 둔다 돌아오는 길을 잃지 않도록 빛은 천천히 돌며 너의 이름을 부른다';
const DOT = '·';
const HILITE = '너의·이름을·부른다';                  // the line that keeps the light at the end
const HILITE_ROW = 28, HILITE_COL = 13;             // where we would like it (row, first column)

// ---------------------------------------------------------------- the scene's camera
const FOVY = 46 * Math.PI / 180;
const FPX = 960 / Math.tan(FOVY / 2);               // stage px
const LAMP = [3.5, 15.15, 0];
const AIM = [1.0, 9.6, 0];
const MOON_PX = [250, 330];                         // where the moon stands at t = 0 (stage px)

// ---------------------------------------------------------------- story
const intro = (t) => (t - 0.1) / 1.35;                                            // the poem is written in
const lampOn = (t) => { const k = sm((t - 1.25) / 0.85); return t < 1.25 ? 0 : k * (1 + 0.3 * Math.sin(t * 41) * (1 - k)); };
const beamAz = (t) => -Math.PI / 2 - 0.70 * Math.max(0, t - 1.6);                // turns from "away" through "left" to us
const front = (t) => 2300 * sm((t - 1.7) / 2.8);                                  // the picture spreads from the lantern
const dissolve = (t) => 1.3 * sm((t - 6.9) / 1.7);
const hilite = (t) => sm((t - 7.9) / 1.0);
const plainLv = (t) => lerp(0.6, 1.5, sm((t - 7.0) / 2.0));                       // thin at first, calm and readable at the end
const fade = (t) => sm(t / 0.5) * (1 - sm((t - 9.55) / 0.45));

function camera(t) {
  const k = t / D;
  const p = [-2.0, 4.3 + 0.25 * k, 31.5 - 2.0 * k];                              // a slow push in
  const f = [AIM[0] - p[0], AIM[1] - p[1], AIM[2] - p[2]];
  let l = Math.hypot(...f); f[0] /= l; f[1] /= l; f[2] /= l;
  const r = [-f[2], 0, f[0]];
  l = Math.hypot(...r); r[0] /= l; r[2] /= l;
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  return { p, f, r, u };
}
function project(c, P) {
  const x = P[0] - c.p[0], y = P[1] - c.p[1], z = P[2] - c.p[2];
  const zv = x * c.f[0] + y * c.f[1] + z * c.f[2];
  return [540 + FPX * (x * c.r[0] + y * c.r[1] + z * c.r[2]) / zv, 960 - FPX * (x * c.u[0] + y * c.u[1] + z * c.u[2]) / zv];
}

defineDemo({
  id: '59-glyph-mosaic',
  title: '글자로 빚은 등대',
  tech: '9단 굵기 글리프 SDF 아틀라스 · 휘도→굵기 하프톤 · 레이마칭 장면',
  duration: D,
  background: '#000',
  async setup({ canvas, W, H }) {
    const words = POEM.split(' ');
    const seq = Array.from(words.join(DOT) + DOT);                               // 58 cells: 41 syllables, 17 dots
    const uniq = [...new Set(seq.filter((c) => c !== DOT))];
    const NG = uniq.length + 1, DOT_G = uniq.length;
    const gOf = new Map(uniq.map((c, i) => [c, i]));
    gOf.set(DOT, DOT_G);
    await fontReady(`100 ${FONT_PX}px ${FAMILY}`, uniq.join(''));
    await fontReady(`900 ${FONT_PX}px ${FAMILY}`, uniq.join(''));

    // ---------- nine weights → distance fields, and how much ink each glyph lays down ----------
    const atlas = new Float32Array(AW * AW * LEVELS);
    const cov = new Float32Array(LEVELS * (NG + 1));
    const cellA = new Float32Array(ACELL * ACELL);
    for (let l = 0; l < LEVELS; l++) {
      const font = `${100 + 100 * l} ${FONT_PX}px ${FAMILY}`;
      const a = textAlpha(AW, AW, (ctx) => {
        ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let g = 0; g < uniq.length; g++) ctx.fillText(uniq[g], (g % AGRID) * ACELL + ACELL / 2, Math.floor(g / AGRID) * ACELL + ACELL / 2);
        // the word separator is a round dot that grows with the weight — an AM halftone dot
        ctx.beginPath();
        ctx.arc((DOT_G % AGRID) * ACELL + ACELL / 2, Math.floor(DOT_G / AGRID) * ACELL + ACELL / 2, 2.0 + 1.45 * l, 0, TAU);
        ctx.fill();
      });
      let mean = 0;
      for (let g = 0; g < NG; g++) {
        const ox = (g % AGRID) * ACELL, oy = Math.floor(g / AGRID) * ACELL;
        let ink = 0;
        for (let y = 0; y < ACELL; y++) for (let x = 0; x < ACELL; x++) {
          const v = a[(oy + y) * AW + ox + x];
          cellA[y * ACELL + x] = v;
          if (x >= 6 && x < 58 && y >= 6 && y < 58) ink += v;               // the part of the cell shown on screen
        }
        const d = signedDistance(cellA, ACELL, ACELL);
        for (let y = 0; y < ACELL; y++) atlas.set(d.subarray(y * ACELL, (y + 1) * ACELL), l * AW * AW + (oy + y) * AW + ox);
        cov[g * LEVELS + l] = ink / (52 * 52);
        if (g < uniq.length) mean += ink / (52 * 52);
      }
      cov[NG * LEVELS + l] = mean / uniq.length;
    }

    // ---------- the grid: poem in reading order, one occurrence of the last line marked ----------
    const N = COLS * ROWS, map = new Uint8Array(N * 4);
    for (let i = 0; i < N; i++) map[i * 4] = gOf.get(seq[i % seq.length]);
    {
      const hl = Array.from(HILITE), off = seq.join('').indexOf(HILITE);
      let best = -1, bestCost = Infinity;
      for (let s = off; s + hl.length <= N; s += seq.length) {
        const row = Math.floor(s / COLS), col = s % COLS;
        if (col + hl.length > COLS || row > 52) continue;                         // on one row, above the caption
        const cost = Math.abs(row - HILITE_ROW) + 0.35 * Math.abs(col - HILITE_COL);
        if (cost < bestCost) { bestCost = cost; best = s; }
      }
      if (best >= 0) for (let k = 0; k < hl.length; k++) map[(best + k) * 4 + 1] = 255;
    }

    // ---------- GL ----------
    const { ctx: gl } = canvas({ type: 'webgl2' });
    const G = createGL(gl);
    const atlasTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, atlasTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.R16F, AW, AW, LEVELS, 0, gl.RED, gl.FLOAT, atlas);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const dataTex = (w, h, internal, format, type, data) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const covTex = dataTex(LEVELS, NG + 1, gl.R16F, gl.RED, gl.FLOAT, cov);
    const mapTex = dataTex(COLS, ROWS, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, map);

    const PSC = G.program(QUAD_VS, SCENE_FS), PCE = G.program(QUAD_VS, CELL_FS), PMO = G.program(QUAD_VS, MOSAIC_FS);
    const PDN = G.program(QUAD_VS, DOWN_FS), PBL = G.program(QUAD_VS, BLUR_FS), PFN = G.program(QUAD_VS, FINAL_FS);
    const sceneRT = G.target(SW, SH), cellRT = G.target(COLS, ROWS), img = G.target(W, H);
    const qa = G.target(W / 4, H / 4), qb = G.target(W / 4, H / 4), ea = G.target(W / 8, H / 8), eb = G.target(W / 8, H / 8);

    // the moon: a fixed direction in the world, set from where it should stand in the first frame; it rises a little
    const c0 = camera(0);
    const mx = (MOON_PX[0] - 540) / FPX, my = (960 - MOON_PX[1]) / FPX;
    const moonAt = (t) => {
      const e = my + 0.03 * t / D;
      const v = [0, 1, 2].map((k) => c0.f[k] + c0.r[k] * mx + c0.u[k] * e);
      const l = Math.hypot(...v);
      return v.map((x) => x / l);
    };
    const focal = (SH / 2) / Math.tan(FOVY / 2);

    this.draw = (t) => {
      const c = camera(t);
      const az = beamAz(t), camAz = Math.atan2(c.p[2] - LAMP[2], c.p[0] - LAMP[0]);
      const da = wrapPi(az - camAz), align = Math.exp(-da * da / 0.025);
      const lamp = lampOn(t), moon = moonAt(t), lampPx = project(c, LAMP);

      // 1. the scene, low resolution
      G.pass(PSC, sceneRT, (u) => {
        gl.uniform2f(u.uRes, SW, SH);
        gl.uniform3fv(u.uCamPos, c.p); gl.uniform3fv(u.uCamF, c.f); gl.uniform3fv(u.uCamR, c.r); gl.uniform3fv(u.uCamU, c.u);
        gl.uniform1f(u.uFocal, focal);
        gl.uniform1f(u.uT, t); gl.uniform1f(u.uAz, az); gl.uniform1f(u.uLamp, lamp); gl.uniform1f(u.uAlign, align);
        gl.uniform1f(u.uCamAz, camAz); gl.uniform3fv(u.uMoonDir, moon);
      });
      // 2. one average per text cell
      G.pass(PCE, cellRT, (u) => G.tex(0, sceneRT, u.uScene));
      // 3. the poem, weighted by the picture
      G.pass(PMO, img, (u) => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, atlasTex);
        gl.uniform1i(u.uAtlas, 0);
        G.tex(1, sceneRT, u.uScene); G.tex(2, cellRT, u.uCell); G.tex(3, mapTex, u.uMap); G.tex(4, covTex, u.uCov);
        gl.uniform1f(u.uNG, NG);
        gl.uniform1f(u.uIntro, intro(t)); gl.uniform1f(u.uFront, front(t)); gl.uniform1f(u.uDiss, dissolve(t));
        gl.uniform1f(u.uHi, hilite(t)); gl.uniform1f(u.uPlain, plainLv(t)); gl.uniform1f(u.uExpo, 2.6);
        gl.uniform1f(u.uT, t); gl.uniform1f(u.uFade, fade(t));
        gl.uniform2f(u.uLampPx, lampPx[0], lampPx[1]);
      });
      // 4. bloom and tone map
      G.pass(PDN, qa, (u) => { G.tex(0, img, u.src); gl.uniform2f(u.px, 1 / W, 1 / H); });
      G.pass(PBL, qb, (u) => { G.tex(0, qa, u.src); gl.uniform2f(u.dir, 4 / W, 0); });
      G.pass(PBL, qa, (u) => { G.tex(0, qb, u.src); gl.uniform2f(u.dir, 0, 4 / H); });
      G.pass(PDN, ea, (u) => { G.tex(0, qa, u.src); gl.uniform2f(u.px, 4 / W, 4 / H); });
      G.pass(PBL, eb, (u) => { G.tex(0, ea, u.src); gl.uniform2f(u.dir, 8 / W, 0); });
      G.pass(PBL, ea, (u) => { G.tex(0, eb, u.src); gl.uniform2f(u.dir, 0, 8 / H); });
      G.pass(PFN, null, (u) => {
        G.tex(0, img, u.uImg); G.tex(1, qa, u.uBloomA); G.tex(2, ea, u.uBloomB);
        gl.uniform1f(u.uFrame, Math.round(t * 30)); gl.uniform1f(u.uBloom, 1 + 0.8 * align + 0.4 * hilite(t));
      });
    };
  },
  frame(t) { this.draw(t); },
});
