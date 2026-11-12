/*
 * light.js — the colour and the life of a light, as pure functions.
 *
 *   kelvinXY(T)     CIE 1931 xy of a blackbody at T kelvin (Kim et al. 2002 cubic fit of the Planckian locus, 1667–25000 K)
 *   kelvinLinear(T) its linear-sRGB colour at luminance 1, white-balanced to the camera (von Kries in RGB, WB_K)
 *   flicker(t, s)   seeded value-noise octaves: a flame's brightness wobble (8–12 Hz, a few per cent)
 */
import { rand, clamp } from '../_lib/stage.js';

export const WB_K = 5500;   // the camera's white balance: 5500 K renders as white, 6500 K as a cool daylight

export function kelvinXY(T) {
  T = clamp(T, 1667, 25000);
  const u = 1e3 / T, u2 = u * u, u3 = u2 * u;
  const x = T <= 4000
    ? -0.2661239 * u3 - 0.2343589 * u2 + 0.8776956 * u + 0.179910
    : -3.0258469 * u3 + 2.1070379 * u2 + 0.2226347 * u + 0.240390;
  const x2 = x * x, x3 = x2 * x;
  const y = T <= 2222 ? -1.1063814 * x3 - 1.34811020 * x2 + 2.18555832 * x - 0.20219683
    : T <= 4000 ? -0.9549476 * x3 - 1.37418593 * x2 + 2.09137015 * x - 0.16748867
      : 3.0817580 * x3 - 5.87338670 * x2 + 3.75112997 * x - 0.37001483;
  return [x, y];
}

// xy (Y = 1) → XYZ → linear sRGB (D65), negative lobes (outside the sRGB gamut below ~1900 K) clipped to 0
function xyToLinear([x, y]) {
  const X = x / y, Y = 1, Z = (1 - x - y) / y;
  return [
    Math.max(0, 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z),
    Math.max(0, -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z),
    Math.max(0, 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z),
  ];
}
const WB = xyToLinear(kelvinXY(WB_K));

/** linear RGB of a T-kelvin light seen through a camera balanced at WB_K, scaled to luminance 1 */
export function kelvinLinear(T) {
  const c = xyToLinear(kelvinXY(T)).map((v, i) => v / WB[i]);
  const Y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return c.map((v) => v / Y);
}

const enc = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
/** the same colour for a swatch on screen: normalised so the brightest channel is 1, sRGB-encoded, as css */
export function kelvinCss(T, a = 1) {
  const c = kelvinLinear(T), m = Math.max(...c);
  return `rgba(${c.map((v) => Math.round(clamp(enc(v / m)) * 255)).join(',')},${a})`;
}

// ---------------------------------------------------------------- flicker: seeded value noise
const TABLE = 512;
function noiseTable(seed) {
  const r = rand(seed), a = new Float32Array(TABLE);
  for (let i = 0; i < TABLE; i++) a[i] = r() * 2 - 1;
  return a;
}
const TABLES = new Map();
/** smooth 1D value noise in [-1, 1] (quintic fade), period TABLE */
export function vnoise(x, seed) {
  if (!TABLES.has(seed)) TABLES.set(seed, noiseTable(seed));
  const a = TABLES.get(seed), i = Math.floor(x), f = x - i, u = f * f * f * (f * (f * 6 - 15) + 10);
  const i0 = ((i % TABLE) + TABLE) % TABLE, i1 = (i0 + 1) % TABLE;
  return a[i0] + (a[i1] - a[i0]) * u;
}
/**
 * A flame's brightness multiplier 1 + Σ amp_k · noise(f_k · t): octaves at a slow sway, ~8.5 Hz and ~11.5 Hz.
 * `amp` scales the whole wobble (match ≈ 0.09, a calm candle ≈ 0.035).
 */
export function flicker(t, seed, amp) {
  return 1 + amp * (0.55 * vnoise(t * 2.3, seed) + 0.3 * vnoise(t * 8.6, seed + 1) + 0.15 * vnoise(t * 11.7, seed + 2));
}
