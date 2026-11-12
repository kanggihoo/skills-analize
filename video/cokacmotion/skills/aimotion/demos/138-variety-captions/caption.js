/*
 * caption.js — Korean variety-show captions (예능 자막) drawn glyph by glyph on Canvas 2D.
 *
 *  · colour     speaker palettes are derived in OKLCH: one hue per speaker, the same lightness/chroma for everyone,
 *               so no speaker's captions weigh more than another's. sRGB conversion with chroma clipping into gamut.
 *  · layout     each caption is a few short lines (≤ MAX_LINE characters, checked in setup); every character is measured
 *               once (prefix widths, so kerning is kept) and gets a reading index; the block is clamped inside the frame.
 *  · motion     per-character closed-form spring (step response of a damped oscillator), staggered by reading index;
 *               squash/stretch from the spring's acceleration; exits are a short back-in that is faster than the entrance.
 *  · layers     a style is a list of passes drawn widest first: extruded block, hard offset shadow, outer stroke,
 *               inner stroke, gradient fill. Every pass runs over all characters before the next pass starts, so the
 *               outlines of neighbouring characters merge into one band instead of cutting into each other's fill.
 * Nothing here keeps state between frames: every value is a function of t.
 */
import { clamp } from '../_lib/stage.js';

export const TAU = Math.PI * 2;
export const MAX_LINE = 12;                                   // characters per line, spaces included
export const READ = { base: 0.5, perSyl: 0.11, min: 1.2 };    // minimum time on screen (s)

// ---------------------------------------------------------------- colour: OKLCH → sRGB
function oklabToLinear(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}
const inGamut = (c) => c.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
const gamma = (v) => { v = clamp(v); return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055; };
/** oklch(L 0..1, C, h°) as '#rrggbb'; out-of-gamut colours keep L and h and lose chroma (bisection) */
export function oklch(L, C, h) {
  const rad = (h * Math.PI) / 180, ca = Math.cos(rad), sa = Math.sin(rad);
  let lin = oklabToLinear(L, C * ca, C * sa);
  if (!inGamut(lin)) {
    let lo = 0, hi = C;
    for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (inGamut(oklabToLinear(L, mid * ca, mid * sa))) lo = mid; else hi = mid; }
    lin = oklabToLinear(L, lo * ca, lo * sa);
  }
  return '#' + lin.map((v) => Math.round(gamma(v) * 255).toString(16).padStart(2, '0')).join('');
}
/** one speaker = one hue; every other token is derived from it at fixed lightness steps */
export function speakerPalette(h) {
  return {
    h,
    top: oklch(0.93, 0.06, h),       // gradient fill, top of the letter
    bottom: oklch(0.74, 0.135, h),   // gradient fill, baseline
    edge: oklch(0.31, 0.105, h),     // outer stroke: the speaker's hue, nearly black
    shadow: oklch(0.21, 0.05, h),    // hard offset shadow
    cloth: oklch(0.72, 0.115, h),    // what the speaker wears (the caption colour is their clothes)
    clothDark: oklch(0.58, 0.115, h),
  };
}

// ---------------------------------------------------------------- springs and eases
/**
 * Unit step response of a damped spring (ζ < 1), released at u = 0 from rest:
 *   x(u)  = 1 − e^(−ζωu) (cos ω_d u + (ζω/ω_d) sin ω_d u),   ω_d = ω√(1−ζ²)
 *   x'(u) = e^(−ζωu) (ω²/ω_d) sin ω_d u
 *   x''(u)= e^(−ζωu) (ω²/ω_d) (ω_d cos ω_d u − ζω sin ω_d u)
 * Overshoot = e^(−ζπ/√(1−ζ²)) at u = π/ω_d.
 */
export function spring(u, zeta, f) {
  const w = TAU * f;
  if (u <= 0) return { x: 0, v: 0, a: 0, w };
  const wd = w * Math.sqrt(1 - zeta * zeta), e = Math.exp(-zeta * w * u), c = Math.cos(wd * u), s = Math.sin(wd * u);
  return { x: 1 - e * (c + (zeta * w / wd) * s), v: e * (w * w / wd) * s, a: e * (w * w / wd) * (wd * c - zeta * w * s), w };
}
export const backIn = (k, c = 1.70158) => (c + 1) * k * k * k - c * k * k;
export const backOut = (k, c = 1.70158) => 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2;
export const outCubic = (k) => 1 - (1 - k) ** 3;
export const outQuad = (k) => 1 - (1 - k) * (1 - k);
/** small integer hash → 0..1 */
export function hash(a, b = 0, c = 0) {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// ---------------------------------------------------------------- layout
const syllables = (s) => (s.match(/[가-힣]/g) || []).length;
/** minimum time a caption must stay readable: a floor, plus a per-syllable allowance */
export const readTime = (text) => Math.max(READ.min, READ.base + READ.perSyl * syllables(text));

/**
 * Measure a caption once (fonts must be loaded): spec = { lines: [{ text, size, font }], x, y (baseline of the LAST line),
 * lead (line gap, × size), t0, t1, style, enter, stagger, margin }. Returns the spec with chars: [{ ch, x, y, size, font, k }].
 */
export function layoutCaption(g, spec) {
  const cap = { stagger: 0.035, margin: 44, lead: 1.12, exitDur: 0.13, exitStagger: 0.012, ...spec };
  const text = cap.lines.map((l) => l.text).join(' ');
  for (const l of cap.lines) {
    if (Array.from(l.text).length > MAX_LINE) throw new Error(`caption line longer than ${MAX_LINE}: ${l.text}`);
  }
  // the reading-time rule can only lengthen a caption, never cut it
  cap.read = readTime(text);
  if (cap.t1 - cap.t0 < cap.read) cap.t1 = cap.t0 + cap.read;
  const st = cap.style;
  const pad = Math.max(...cap.lines.map((l) => l.size)) * st.reach;          // how far the widest pass reaches past the glyph
  const rows = cap.lines.map((l) => {
    g.font = `${l.size}px ${l.font}`;
    const chars = Array.from(l.text), track = l.size * (l.track ?? 0.01);
    const xs = [];
    let pre = '', w = 0;
    for (let i = 0; i < chars.length; i++) {
      const a = g.measureText(pre).width + i * track, b = g.measureText(pre + chars[i]).width + i * track;
      xs.push([(a + b) / 2, b - a]);
      pre += chars[i];
      w = b;
    }
    return { ...l, chars, xs, w };
  });
  const half = Math.max(...rows.map((r) => r.w)) / 2 + pad;
  const cx = clamp(cap.x, cap.margin + half, 1080 - cap.margin - half);
  cap.box = [cx - half, cap.y - cap.lines.length * 1.1 * rows[rows.length - 1].size, 2 * half];
  cap.chars = [];
  let k = 0, y = cap.y;
  for (let r = rows.length - 1; r >= 0; r--) {       // baselines from the bottom line up
    rows[r].y = y;
    // next baseline up = this line's cap height (≈ 0.8 em) + both outlines' reach + a gap of lead × the upper size
    if (r > 0) y -= 0.8 * rows[r].size + st.reach * (rows[r].size + rows[r - 1].size) + (cap.lead - 1) * rows[r - 1].size + 4;
  }
  for (const r of rows) {
    r.chars.forEach((ch, i) => {
      if (ch === ' ') return;
      cap.chars.push({ ch, x: cx - r.w / 2 + r.xs[i][0], y: r.y, size: r.size, font: `${r.size}px ${r.font}`, k: k++, seed: hash(k, r.size, cap.seed || 7) });
    });
  }
  cap.n = k;
  return cap;
}

// ---------------------------------------------------------------- per-character motion (closed form in t)
/**
 * Entrance kinds
 *   pop   scale 0 → 1 on a spring, dropping in from above; squash/stretch from the spring acceleration
 *   slam  scale BIG → 1 on a stiffer spring (overshoots below 1 = the impact), squashed flat while below 1
 *   rise  soft register: outCubic scale 0 → 1 while rising, no overshoot, no squash
 * Exit: back-in shrink (a 10 % swell, then gone) in exitDur, reading order, a third of the entrance stagger.
 */
export function charPose(cap, c, t) {
  const u = t - cap.t0 - c.k * cap.stagger;
  if (u <= 0) return null;
  const S = c.size, E = cap.enter;
  let sc = 1, sx = 1, sy = 1, dx = 0, dy = 0, rot = 0;
  if (E.kind === 'pop') {
    const s = spring(u, E.zeta, E.f);
    sc = s.x;
    dy = -E.drop * S * (1 - s.x);
    const q = clamp(-E.squash * s.a / (s.w * s.w), -0.28, 0.28);   // + = squash (decelerating into the landing)
    sx = 1 + q; sy = 1 - q;
    rot = (c.seed - 0.5) * 2 * E.spin * (1 - s.x);
  } else if (E.kind === 'slam') {
    const s = spring(u, E.zeta, E.f);
    sc = 1 + (E.big - 1) * (1 - s.x);
    const q = clamp((s.x - 1) * E.squash, 0, 0.3);                    // only while the letter is pressed below 1
    sx = 1 + q; sy = 1 - q;
    rot = (c.seed - 0.5) * 2 * E.spin * (1 - s.x);
  } else {
    const p = outCubic(clamp(u / E.dur));
    sc = p;
    dy = E.drop * S * (1 - p);
  }
  // exit
  const v = t - cap.t1 - c.k * cap.exitStagger;
  if (v > 0) {
    const k = clamp(v / cap.exitDur);
    if (k >= 1) return null;
    sc *= 1 - backIn(k);
    dy -= 0.22 * S * k * k;
  }
  if (sc <= 0.004) return null;
  return { x: c.x + dx, y: c.y + dy, sx: sc * sx, sy: sc * sy, rot };
}

// ---------------------------------------------------------------- drawing
/**
 * A style is { reach, pivot, layers } where every layer width is a fraction of the font size:
 *   { kind: 'extrude', w, dir: [dx, dy] (× size), steps, color }   — solid block: the outer silhouette swept along dir
 *   { kind: 'shadow', w, off: [dx, dy] (× size), color }             — hard offset shadow (no blur: deterministic)
 *   { kind: 'stroke', w, color, join, miter }                        — centred stroke of the glyph outline, width w·size
 *   { kind: 'fill', grad: [[stop, colour], …] | colour }             — the letter itself, vertical gradient in glyph space
 * Visible band of stroke k = (w_k − w_(k−1)) / 2 · size: a centred stroke puts half its width inside the glyph,
 * and the narrower pass drawn after it covers that half again.
 */
export function drawCaption(g, cap, t, extra) {
  const P = [];
  for (const c of cap.chars) {
    const p = charPose(cap, c, t);
    if (!p) continue;
    if (extra) extra(c, p, t);
    P.push([c, p]);
  }
  if (!P.length) return 0;
  const st = cap.style;
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  for (const L of st.layers) {
    let font = '';
    for (const [c, p] of P) {
      if (c.font !== font) { g.font = c.font; font = c.font; }
      const S = c.size, base = st.pivot === 'mid' ? 0.36 * S : 0;
      const cs = Math.cos(p.rot), sn = Math.sin(p.rot);
      const place = (ox = 0, oy = 0) => g.setTransform(cs * p.sx, sn * p.sx, -sn * p.sy, cs * p.sy, p.x + ox, p.y + oy);
      if (L.kind === 'fill') {
        place();
        g.fillStyle = typeof L.grad === 'string' ? L.grad : gradFor(g, L, S, base);
        g.fillText(c.ch, 0, base);
        continue;
      }
      g.lineJoin = L.join || 'round';
      g.miterLimit = L.miter || 10;
      g.lineWidth = L.w * S;
      g.strokeStyle = g.fillStyle = L.color;
      if (L.kind === 'stroke') { place(); g.strokeText(c.ch, 0, base); continue; }
      if (L.kind === 'shadow') {
        place(L.off[0] * S * p.sx, L.off[1] * S * p.sy);
        g.strokeText(c.ch, 0, base); g.fillText(c.ch, 0, base);
        continue;
      }
      // extrude: the same silhouette stamped along dir; steps are close enough that the round-joined copies overlap
      for (let i = L.steps; i >= 1; i--) {
        const k = i / L.steps;
        place(L.dir[0] * S * k * p.sx, L.dir[1] * S * k * p.sy);
        g.strokeText(c.ch, 0, base); g.fillText(c.ch, 0, base);
      }
    }
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  return P.length;
}
// gradients are made in glyph space (baseline at 0) once per size and reused by every character of that size
const GRADS = new Map();
function gradFor(g, L, S, base) {
  const key = L.id + ':' + S + ':' + base;
  let gr = GRADS.get(key);
  if (!gr) {
    gr = g.createLinearGradient(0, base - 0.8 * S, 0, base + 0.06 * S);
    for (const [o, col] of L.grad) gr.addColorStop(o, col);
    GRADS.set(key, gr);
  }
  return gr;
}
