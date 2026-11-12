/*
 * Shared design kit for the posters: palette, type families, and text placement by INK box.
 * Pixi places a Text by its texture box (baseline at the font's measured ascent), which says little about where
 * the glyphs actually are. Layout here measures the real ink (canvas measureText actualBoundingBox*) and the
 * ascent Pixi itself uses (CanvasTextMetrics.measureFont), so a headline can be fitted to a width and pinned by
 * its visible top-left corner whatever the font's metrics are.
 */
import { PIXI } from './pixi-global.js';

export const W = 1080, H = 1920;
export const PAD = 96;                       // the world is rendered with this margin (RGB split / displacement)
export const RW = W + 2 * PAD, RH = H + 2 * PAD;

export const C = {
  tomato: 0xf2452b,
  ultra: 0x2234d8,
  acid: 0xdcf43c,
  cream: 0xf4ebdc,
  ink: 0x17130f,
  pink: 0xff8fb4,
  violet: 0x6a2cff,
};

// SIL OFL 1.1 families from _lib/type.js FONTS (Hangul only in Hangul fonts)
export const F = {
  krDisplay: 'Black Han Sans',
  kr: 'Pretendard Variable',
  cond: 'Bebas Neue',
  serif: 'Fraunces Variable',
  mono: 'JetBrains Mono Variable',
};

/** a text style object; ls = letter spacing in em */
export function S(fontFamily, fontSize, fill, { weight = '400', ls = 0, ...rest } = {}) {
  return { fontFamily, fontSize, fill, fontWeight: String(weight), letterSpacing: ls * fontSize, ...rest };
}

const mctx = document.createElement('canvas').getContext('2d');

/** ink box of a single-line string in the local space of a Text / SplitText with anchor 0 */
export function inkBox(style, str) {
  const ts = new PIXI.TextStyle(style);
  const font = PIXI.fontStringFromTextStyle(ts);
  const asc = PIXI.CanvasTextMetrics.measureFont(font).ascent;   // Pixi draws line 1's baseline at y = ascent
  mctx.font = font;
  if ('letterSpacing' in mctx) mctx.letterSpacing = `${ts.letterSpacing || 0}px`;
  const m = mctx.measureText(str);
  return {
    left: -m.actualBoundingBoxLeft,
    right: m.actualBoundingBoxRight,
    top: asc - m.actualBoundingBoxAscent,
    bottom: asc + m.actualBoundingBoxDescent,
  };
}

/** font size at which `str` in `style` is `w` px wide (ink), letter spacing scaled with it */
export function fitSize(style, str, w) {
  const em = (style.letterSpacing || 0) / style.fontSize;
  const b = inkBox({ ...style, fontSize: 200, letterSpacing: em * 200 }, str);
  return (200 * w) / (b.right - b.left);
}
export function fitted(style, str, w, max = Infinity) {
  const size = Math.min(max, fitSize(style, str, w));
  const em = (style.letterSpacing || 0) / style.fontSize;
  return { ...style, fontSize: size, letterSpacing: em * size };
}

/**
 * Create a Text (or a PIXI.SplitText when split) and place it so that the point (ax, ay) of its ink box
 * (0,0 = top-left, 1,1 = bottom-right) sits at (x, y) of the parent. Returns { obj, rect } with the ink rect.
 */
export function inkText(str, style, x, y, ax = 0, ay = 0, split = false) {
  const obj = split
    ? new PIXI.SplitText({ text: str, style, charAnchor: 0.5 })
    : new PIXI.Text({ text: str, style });
  const b = inkBox(style, str);
  const w = b.right - b.left, h = b.bottom - b.top;
  obj.x = x - ax * w - b.left;
  obj.y = y - ay * h - b.top;
  return { obj, rect: { x: x - ax * w, y: y - ay * h, w, h } };
}

/** a rectangular reveal mask over an ink rect (with margin), added to `parent`, assigned to `obj` */
export function rectMask(parent, obj, r, mx = 16, my = mx) {
  const g = new PIXI.Graphics().rect(r.x - mx, r.y - my, r.w + 2 * mx, r.h + 2 * my).fill(0xffffff);
  parent.addChild(g);
  obj.mask = g;
  return g;
}

/** filled rectangle whose pivot is at a chosen edge, so scaleX/scaleY grows it from there */
export function bar(x, y, w, h, color, from = 'left') {
  const g = new PIXI.Graphics().rect(0, 0, w, h).fill(color);
  g.position.set(x, y);
  if (from === 'right') { g.pivot.x = w; g.x = x + w; }
  if (from === 'bottom') { g.pivot.y = h; g.y = y + h; }
  if (from === 'center') { g.pivot.set(w / 2, h / 2); g.position.set(x + w / 2, y + h / 2); }
  return g;
}

export function circle(x, y, r, color) {
  const g = new PIXI.Graphics().circle(0, 0, r).fill(color);
  g.position.set(x, y);
  return g;
}

export function fullBleed(color) {
  return new PIXI.Graphics().rect(-PAD, -PAD, RW, RH).fill(color);
}

export function sprite(tex, x, y, anchor = 0.5) {
  const s = new PIXI.Sprite({ texture: tex, anchor });
  s.position.set(x, y);
  return s;
}
