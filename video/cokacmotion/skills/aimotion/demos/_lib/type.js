/*
 * _lib/type.js — shared typography helpers for demos 51+.
 * Every font used by a demo is SIL OFL 1.1 (see README "타이포그래피"). Nothing here touches time or randomness.
 *
 *   await fontReady('900 200px "Black Han Sans"', '글자')   // load the unicode-range subsets the text needs
 *   const a = textAlpha(w, h, (ctx) => { ctx.font = …; ctx.fillText(…); })   // Float32Array coverage 0..1
 *   const d = signedDistance(a, w, h)                       // px, > 0 outside, < 0 inside, sub-pixel from AA
 *   const f = await loadOutlineFont('Pretendard-Black')     // opentype.js Font (full glyph set, vector)
 *   const glyphs = outlineContours(f, '말랑', x, y, size)  // [{ ch, x0, advance, contours: [{ pts, area }] }]
 */

// font registry: family names exactly as the @font-face rules declare them; css (a path or a list, relative to a demo folder)
// goes into the demo's index.html as <link rel="stylesheet">
export const FONTS = {
  pretendard:   { family: 'Pretendard Variable', css: '../_lib/fonts.css', hangul: true, axes: { wght: [45, 920] } },
  notoSansKR:   { family: 'Noto Sans KR Variable', css: '../node_modules/@fontsource-variable/noto-sans-kr/index.css', hangul: true, axes: { wght: [100, 900] } },
  hahmlet:      { family: 'Hahmlet Variable', css: '../node_modules/@fontsource-variable/hahmlet/index.css', hangul: true, axes: { wght: [100, 900] } },
  notoSerifKR:  { family: 'Noto Serif KR', css: [200, 300, 400, 500, 600, 700, 800, 900].map((w) => `../node_modules/@fontsource/noto-serif-kr/${w}.css`), hangul: true, weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  nanumMyeongjo:{ family: 'Nanum Myeongjo', css: [400, 700, 800].map((w) => `../node_modules/@fontsource/nanum-myeongjo/${w}.css`), hangul: true, weights: [400, 700, 800] },
  gowunBatang:  { family: 'Gowun Batang', css: [400, 700].map((w) => `../node_modules/@fontsource/gowun-batang/${w}.css`), hangul: true, weights: [400, 700] },
  songMyung:    { family: 'Song Myung', css: '../node_modules/@fontsource/song-myung/index.css', hangul: true, weights: [400] },
  blackHanSans: { family: 'Black Han Sans', css: '../node_modules/@fontsource/black-han-sans/index.css', hangul: true, weights: [400] },
  doHyeon:      { family: 'Do Hyeon', css: '../node_modules/@fontsource/do-hyeon/index.css', hangul: true, weights: [400] },
  eastSeaDokdo: { family: 'East Sea Dokdo', css: '../node_modules/@fontsource/east-sea-dokdo/index.css', hangul: true, weights: [400] },
  gaegu:        { family: 'Gaegu', css: [300, 400, 700].map((w) => `../node_modules/@fontsource/gaegu/${w}.css`), hangul: true, weights: [300, 400, 700] },
  nanumPen:     { family: 'Nanum Pen Script', css: '../node_modules/@fontsource/nanum-pen-script/index.css', hangul: true, weights: [400] },
  // Latin only — never set Hangul in these (a missing glyph silently falls back to a system font)
  robotoFlex:   { family: 'Roboto Flex Variable', css: '../node_modules/@fontsource-variable/roboto-flex/full.css', hangul: false,
                  axes: { wght: [100, 1000], wdth: [25, 151], opsz: [8, 144], slnt: [-10, 0], GRAD: [-200, 150] } },
  fraunces:     { family: 'Fraunces Variable', css: '../node_modules/@fontsource-variable/fraunces/full.css', hangul: false,
                  axes: { wght: [100, 900], opsz: [9, 144], SOFT: [0, 100], WONK: [0, 1] } },
  anybody:      { family: 'Anybody Variable', css: '../node_modules/@fontsource-variable/anybody/wdth.css', hangul: false, axes: { wght: [100, 900], wdth: [50, 150] } },
  bricolage:    { family: 'Bricolage Grotesque Variable', css: '../node_modules/@fontsource-variable/bricolage-grotesque/opsz.css', hangul: false,
                  axes: { wght: [200, 800], wdth: [75, 100], opsz: [12, 96] } },
  jetbrainsMono:{ family: 'JetBrains Mono Variable', css: '../node_modules/@fontsource-variable/jetbrains-mono/index.css', hangul: false, axes: { wght: [100, 800] } },
  instrumentSerif: { family: 'Instrument Serif', css: '../node_modules/@fontsource/instrument-serif/index.css', hangul: false, weights: [400] },
  dmSerifDisplay:  { family: 'DM Serif Display', css: '../node_modules/@fontsource/dm-serif-display/index.css', hangul: false, weights: [400] },
  bebasNeue:    { family: 'Bebas Neue', css: '../node_modules/@fontsource/bebas-neue/index.css', hangul: false, weights: [400] },
};

/** Load the subsets `text` needs for a CSS font shorthand; throws if the face still is not available. */
export async function fontReady(font, text = 'Aa가') {
  await document.fonts.load(font, text);
  if (!document.fonts.check(font, text)) throw new Error(`font not available: ${font}`);
}

/** Draw into an offscreen w×h 2D canvas and return its alpha as coverage 0..1 (row-major, y down). */
export function textAlpha(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  draw(ctx, c);
  const px = ctx.getImageData(0, 0, w, h).data;
  const a = new Float32Array(w * h);
  for (let i = 0; i < a.length; i++) a[i] = px[i * 4 + 3] / 255;
  return a;
}

const INF = 1e20;

// Felzenszwalb & Huttenlocher 1D squared-distance transform over grid[offset + q*stride], in place
function edt1d(grid, offset, stride, n, f, v, z) {
  v[0] = 0; z[0] = -INF; z[1] = INF; f[0] = grid[offset];
  for (let q = 1, k = 0, s = 0; q < n; q++) {
    f[q] = grid[offset + q * stride];
    const q2 = q * q;
    do { const r = v[k]; s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2; } while (s <= z[k] && --k > -1);
    k++; v[k] = q; z[k] = s; z[k + 1] = INF;
  }
  for (let q = 0, k = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k], qr = q - r;
    grid[offset + q * stride] = f[r] + qr * qr;
  }
}

function edt2d(grid, w, h) {
  const n = Math.max(w, h);
  const f = new Float64Array(n), v = new Uint32Array(n), z = new Float64Array(n + 1);
  for (let x = 0; x < w; x++) edt1d(grid, x, w, h, f, v, z);
  for (let y = 0; y < h; y++) edt1d(grid, y * w, 1, w, f, v, z);
}

/**
 * Signed Euclidean distance (pixels) from coverage 0..1: positive outside the shape, negative inside, 0 on the 0.5 edge.
 * Anti-aliased edge pixels place the edge at sub-pixel precision (the tiny-sdf construction).
 */
export function signedDistance(alpha, w, h) {
  const N = w * h;
  const outer = new Float64Array(N), inner = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const a = alpha[i];
    if (a >= 1) { outer[i] = 0; inner[i] = INF; }
    else if (a <= 0) { outer[i] = INF; inner[i] = 0; }
    else { const d = 0.5 - a; outer[i] = d > 0 ? d * d : 0; inner[i] = d < 0 ? d * d : 0; }
  }
  edt2d(outer, w, h); edt2d(inner, w, h);
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) out[i] = Math.sqrt(outer[i]) - Math.sqrt(inner[i]);
  return out;
}

let opentype = null;
const outlineCache = new Map();
/**
 * Vector font for outlines (opentype.js). Pretendard ships complete OTFs (all 11,172 Hangul syllables):
 * 'Pretendard-Thin' … 'Pretendard-Black'. Pass a URL instead for another OFL OTF/TTF/WOFF (not WOFF2).
 */
export async function loadOutlineFont(name = 'Pretendard-Black') {
  const url = /[/.]/.test(name) ? name : new URL(`../node_modules/pretendard/dist/public/static/${name}.otf`, import.meta.url).href;
  if (!outlineCache.has(url)) {
    outlineCache.set(url, (async () => {
      opentype ||= await import('../node_modules/opentype.js/dist/opentype.mjs');
      const res = await fetch(url);
      if (!res.ok) throw new Error(`outline font ${res.status}: ${url}`);
      return opentype.parse(await res.arrayBuffer());
    })());
  }
  return outlineCache.get(url);
}

// adaptive flattening: subdivide until the control polygon is within tol of the chord
function flatQuad(out, x0, y0, x1, y1, x2, y2, tol, depth = 0) {
  const dx = x2 - x0, dy = y2 - y0, d = Math.abs((x1 - x2) * dy - (y1 - y2) * dx);
  if (depth > 12 || d * d <= tol * tol * (dx * dx + dy * dy) * 4 || (dx === 0 && dy === 0 && d === 0)) { out.push(x2, y2); return; }
  const ax = (x0 + x1) / 2, ay = (y0 + y1) / 2, bx = (x1 + x2) / 2, by = (y1 + y2) / 2, mx = (ax + bx) / 2, my = (ay + by) / 2;
  flatQuad(out, x0, y0, ax, ay, mx, my, tol, depth + 1);
  flatQuad(out, mx, my, bx, by, x2, y2, tol, depth + 1);
}
function flatCubic(out, x0, y0, x1, y1, x2, y2, x3, y3, tol, depth = 0) {
  const dx = x3 - x0, dy = y3 - y0;
  const d1 = Math.abs((x1 - x3) * dy - (y1 - y3) * dx), d2 = Math.abs((x2 - x3) * dy - (y2 - y3) * dx);
  if (depth > 12 || (d1 + d2) * (d1 + d2) <= tol * tol * (dx * dx + dy * dy) * 4) { out.push(x3, y3); return; }
  const x01 = (x0 + x1) / 2, y01 = (y0 + y1) / 2, x12 = (x1 + x2) / 2, y12 = (y1 + y2) / 2, x23 = (x2 + x3) / 2, y23 = (y2 + y3) / 2;
  const xa = (x01 + x12) / 2, ya = (y01 + y12) / 2, xb = (x12 + x23) / 2, yb = (y12 + y23) / 2, xm = (xa + xb) / 2, ym = (ya + yb) / 2;
  flatCubic(out, x0, y0, x01, y01, xa, ya, xm, ym, tol, depth + 1);
  flatCubic(out, xm, ym, xb, yb, x23, y23, x3, y3, tol, depth + 1);
}

/** opentype.js Path commands → closed polylines [{ pts: Float32Array [x0,y0,x1,y1,…] (no repeated end point), area }]. */
export function flattenPath(commands, tol = 0.25) {
  const contours = [];
  let cur = null, sx = 0, sy = 0, x = 0, y = 0;
  const finish = () => {
    if (!cur) return;
    let n = cur.length;
    if (n >= 4 && Math.abs(cur[n - 2] - cur[0]) < 1e-6 && Math.abs(cur[n - 1] - cur[1]) < 1e-6) { cur.length = n - 2; n -= 2; }
    if (n >= 6) {
      let A = 0;
      for (let i = 0; i < n; i += 2) { const j = (i + 2) % n; A += cur[i] * cur[j + 1] - cur[j] * cur[i + 1]; }
      contours.push({ pts: Float32Array.from(cur), area: A / 2 });
    }
    cur = null;
  };
  for (const c of commands) {
    if (c.type === 'M') { finish(); cur = [c.x, c.y]; sx = x = c.x; sy = y = c.y; }
    else if (c.type === 'L') { cur.push(c.x, c.y); x = c.x; y = c.y; }
    else if (c.type === 'Q') { flatQuad(cur, x, y, c.x1, c.y1, c.x, c.y, tol); x = c.x; y = c.y; }
    else if (c.type === 'C') { flatCubic(cur, x, y, c.x1, c.y1, c.x2, c.y2, c.x, c.y, tol); x = c.x; y = c.y; }
    else if (c.type === 'Z') { finish(); x = sx; y = sy; }
  }
  finish();
  return contours;
}

/**
 * Lay `text` out on one baseline (x, y = left baseline, y down, kerning on) and flatten each glyph's outline.
 * Returns one entry per character: { ch, x0, advance, contours }. In y-down screen space opentype's outer contours
 * come out with area < 0 and holes with area > 0 (TrueType/CFF winding); test the sign rather than assuming it.
 */
export function outlineContours(font, text, x, y, size, { tol = 0.25, letterSpacing = 0 } = {}) {
  const glyphs = font.stringToGlyphs(text);
  const scale = size / font.unitsPerEm;
  const out = [];
  let pen = x;
  const chars = Array.from(text);
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    const path = g.getPath(pen, y, size);
    const advance = (g.advanceWidth || 0) * scale;
    out.push({ ch: chars[i] ?? '', x0: pen, advance, contours: flattenPath(path.commands, tol) });
    pen += advance + letterSpacing;
    if (i + 1 < glyphs.length) pen += font.getKerningValue(g, glyphs[i + 1]) * scale;
  }
  return out;
}
