/*
 * 60 · scene.js — the word, its size, where it rests, the drop schedule and the table taps. Shared by main.js and
 * any node run of the bake (no DOM here).
 *
 *   "말랑" in two very large gummies on a glossy table. Both syllables stand on their own in Pretendard Black:
 *   말 on its full-width ㄹ, 랑 on a wide, flat-bottomed ㅇ. (Stacking a second row does not work with these
 *   glyphs: the ㅏ stem rises above the ㅁ/ㄹ, so a letter set on top rests on the stem alone and rolls off;
 *   syllables like 마 or 이 even stand on their vowel stem alone.)
 *   Story: 말 drops, squashes and bounces · 랑 drops beside it and squeezes against it · two taps on the table
 *   (말-랑) make both jiggle as one · the jiggle fades out.
 */
import { buildMesh } from './mesh.js';

export const D = 9.5;
export const FLOOR_Y = 1272;                 // where the jelly meets the table (stage px)
const SIZE = 600;                            // font size (px): each letter ≈ 490 × 540
const GAP = 14;                              // px between the two letters at rest
const START_BOTTOM = -40;                    // every letter starts just above the frame

// colour (sRGB, the gummy's transmission colour) and coverage channel (R, G of the coverage target)
export const LETTERS = [
  { ch: '말', size: SIZE, rgb: [0xff, 0x2f, 0x6c], chan: 0, release: 0.45, theta0: -0.025, dx: -6 },
  { ch: '랑', size: SIZE, rgb: [0xff, 0x8c, 0x0a], chan: 1, release: 1.75, theta0: 0.035, dx: -10 },
];

// the climax: two quick taps on the table, the pair hops and jiggles as one
export const TAPS = [[4.6, 15], [4.93, 11]];        // [time (s), lift (px)]
const TAP_LEN = 0.09;
/** how far the table is lifted at t (px): a smooth bump 16·s²(1−s)² per tap (≈ sin²πs, but plain arithmetic, so the
 *  bake stays bit-identical in every JS engine) */
export function tableLift(t) {
  let y = 0;
  for (const [t0, a] of TAPS) { const s = (t - t0) / TAP_LEN; if (s > 0 && s < 1) { const k = s * (1 - s); y += a * 16 * k * k; } }
  return y;
}
export const WORLD = { floorY: FLOOR_Y, wallL: 12, wallR: 1068, floorAt: (t) => FLOOR_Y - tableLift(t) };

/**
 * Outline → mesh → initial pose for every letter.
 * outline(ch, size) must return contours laid out at x = 0, baseline y = 0 (outlineContours(font, ch, 0, 0, size)[0].contours).
 */
export function buildScene(outline, rand) {
  const glyph = LETTERS.map((L) => {
    const contours = outline(L.ch, L.size);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const c of contours) for (let i = 0; i < c.pts.length; i += 2) { x0 = Math.min(x0, c.pts[i]); x1 = Math.max(x1, c.pts[i]); y0 = Math.min(y0, c.pts[i + 1]); y1 = Math.max(y1, c.pts[i + 1]); }
    return { contours, x0, x1, y0, y1 };
  });
  const spanW = glyph.reduce((s, g) => s + g.x1 - g.x0, 0) + GAP * (glyph.length - 1);
  let x = (1080 - spanW) / 2;
  const rnd = rand(60);
  return LETTERS.map((L, i) => {
    const g = glyph[i];
    const ox = x - g.x0, oy = FLOOR_Y - g.y1;
    x += g.x1 - g.x0 + GAP;
    const contours = g.contours.map((c) => {
      const pts = new Float32Array(c.pts.length);
      for (let k = 0; k < pts.length; k += 2) { pts[k] = c.pts[k] + ox; pts[k + 1] = c.pts[k + 1] + oy; }
      return { pts, area: c.area };
    });
    const mesh = buildMesh(contours, { sb: 12, si: 18, rnd });
    return { ...L, mesh, x0: [L.dx, START_BOTTOM - (g.y1 + oy)], v0: [0, 260], omega0: 0 };
  });
}
