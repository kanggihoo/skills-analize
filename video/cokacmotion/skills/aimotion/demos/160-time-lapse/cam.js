/*
 * cam.js — one pinhole camera for everything (ground, buildings, sky, sun, stars), the sun's position from the hour
 * angle and the latitude, the light it gives, and colour helpers (linear light → tone curve → sRGB).
 *
 * World frame (metres): X to the camera's right, Y up, Z forward along the ground. The camera stands at
 * (0, HC, 0) in a window, faces azimuth AZ (degrees from north, clockwise) and is pitched down by PITCH.
 */
import { clamp, lerp } from '../_lib/stage.js';

export const DEG = Math.PI / 180;
export const F = 700;                 // focal length in stage px (horizontal field of view ≈ 75°)
export const PITCH = 20 * DEG;
export const HC = 20;                 // camera height (m): a sixth-floor window
export const AZ = 348 * DEG;          // facing north-north-west, so the pole star stands over the mountains
export const LAT = 20 * DEG;          // an invented town at 20° N …
export const DEC = 16 * DEG;          // … on a late-spring day (solar declination +16°)
const CP = Math.cos(PITCH), SP = Math.sin(PITCH), CA = Math.cos(AZ), SA = Math.sin(AZ);

/** camera-space (xc, yc, zc) of a world direction or offset */
export function toCam(X, Y, Z) { return [X, Y * CP + Z * SP, -Y * SP + Z * CP]; }
/** screen [x, y, zc] of a world point; zc > 0 in front of the camera */
export function proj(X, Y, Z) {
  const y = Y - HC, yc = y * CP + Z * SP, zc = -y * SP + Z * CP;
  return [540 + (F * X) / zc, 960 - (F * yc) / zc, zc];
}
/** screen point of a world direction (at infinity) */
export function projDir(d) {
  const yc = d[1] * CP + d[2] * SP, zc = -d[1] * SP + d[2] * CP;
  return zc <= 1e-6 ? null : [540 + (F * d[0]) / zc, 960 - (F * yc) / zc];
}
/** world direction through a screen pixel (unit) */
export function pixelDir(x, y) {
  const xc = (x - 540) / F, yc = -(y - 960) / F;
  const d = [xc, yc * CP - SP, yc * SP + CP], l = Math.hypot(d[0], d[1], d[2]);
  return [d[0] / l, d[1] / l, d[2] / l];
}
/** east-north-up → world */
export const enuToWorld = ([e, n, u]) => [e * CA - n * SA, u, e * SA + n * CA];
/** projected size (px per metre) at camera depth zc */
export const pxPerM = (zc) => F / zc;

/**
 * Direction of a body of declination dec at hour angle H (radians, + after transit) in east-north-up:
 *   E = −cos δ sin H,  N = sin δ cos φ − cos δ cos H sin φ,  U = sin δ sin φ + cos δ cos H cos φ
 * The sun uses H = 15°·(T − 12) (local solar time T in hours); its elevation h = asin U.
 */
export function bodyENU(dec, H) {
  const cd = Math.cos(dec), sd = Math.sin(dec), cH = Math.cos(H), sH = Math.sin(H), cl = Math.cos(LAT), sl = Math.sin(LAT);
  return [-cd * sH, sd * cl - cd * cH * sl, sd * sl + cd * cH * cl];
}
export const sunENU = (T) => bodyENU(DEC, 15 * DEG * (T - 12));
export function sunAt(T) {
  const enu = sunENU(T);
  return { enu, w: enuToWorld(enu), h: Math.asin(clamp(enu[2], -1, 1)) / DEG };
}

// ---------------------------------------------------------------- colour
export const hex = (h) => {
  const n = parseInt(h.slice(1), 16), c = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return [c((n >> 16) & 255), c((n >> 8) & 255), c(n & 255)];
};
const enc = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
/** soft shoulder above 0.8 so lights can be brighter than white without clipping hard */
export const tone = (x) => (x <= 0.8 ? x : 0.8 + 0.2 * (1 - Math.exp(-(x - 0.8) / 0.2)));
export const toByte = (x) => Math.round(clamp(enc(tone(Math.max(0, x)))) * 255);
export function css(c, a = 1) {
  return a >= 1 ? `rgb(${toByte(c[0])},${toByte(c[1])},${toByte(c[2])})` : `rgba(${toByte(c[0])},${toByte(c[1])},${toByte(c[2])},${a.toFixed(4)})`;
}
export const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const mul = (a, b) => [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
export const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** colour table keyed by sun elevation (degrees, ascending) → linear RGB, interpolated with smoothstep per segment */
export function table(rows) {
  const R = rows.map(([h, c]) => [h, hex(c)]);
  return (h) => {
    if (h <= R[0][0]) return R[0][1];
    for (let i = 1; i < R.length; i++) if (h <= R[i][0]) {
      let k = (h - R[i - 1][0]) / (R[i][0] - R[i - 1][0]); k = k * k * (3 - 2 * k);
      return mix(R[i - 1][1], R[i][1], k);
    }
    return R[R.length - 1][1];
  };
}

// ---------------------------------------------------------------- the light the scene is painted with
// sky light (ambient): its hue follows the sky; its level is the share the camera does not compensate
const AMB = table([[-18, '#41579a'], [-10, '#5164aa'], [-5, '#7a84c0'], [-1, '#a790b8'], [3, '#a99cc4'], [10, '#aab6d6'], [30, '#aec4e2']]);
const AMB_LEVEL = table([[-18, '#e6e6e6'], [-6, '#f2f2f2'], [0, '#d8d8d8'], [6, '#bcbcbc'], [14, '#c4c4c4'], [40, '#cccccc']]);
/** sun colour from the air mass (Kasten–Young) and Rayleigh-like extinction exp(−τ_λ m), hue kept, level half kept */
function sunColour(h) {
  const he = Math.max(h, -0.5);
  const m = 1 / (Math.sin(he * DEG) + 0.50572 * Math.pow(he + 6.07995, -1.6364));
  const tau = [0.05, 0.11, 0.24], z = tau.map((v) => Math.exp(-v)), c = tau.map((v, i) => Math.exp(-v * m) / z[i]);
  const lum = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  const k = Math.pow(Math.max(lum, 1e-4), -0.55);
  return c.map((v) => v * k);
}
/**
 * Everything the painter needs at scene time T: sun vectors, elevation, exposure, and the two lights in image units
 * (amb = sky light on a surface facing up, sun = direct light on a surface facing the sun).
 */
export function lightAt(T, ev, gainA, Tend = T, Sw = 0) {
  const S = sunAt(T);
  // the frame integrates its window, so anything that switches with the sun (it sinking behind the hills, the peaks
  // and the clouds losing it later) is averaged over the window with the Hann weight (8 samples)
  const hs = [], ws = [];
  for (let i = 0; i < 8; i++) { const u = (i + 0.5) / 8; hs.push(Sw > 0 ? sunAt(Tend - u * Sw).h : S.h); ws.push(Math.sin(Math.PI * u) ** 2); }
  const wsum = ws.reduce((a, b) => a + b, 0);
  const avg = (f) => { let a = 0; for (let i = 0; i < 8; i++) a += ws[i] * f(hs[i]); return a / wsum; };
  const sv = avg((h) => { const v = clamp((h - 0.4) / 2.6); return v * v * (3 - 2 * v); });   // behind the far hills at 0.4°
  const amb = scale(mul(AMB(S.h), AMB_LEVEL(S.h)), gainA * 1.05);
  const sunRaw = scale(sunColour(S.h), 0.62 * gainA * (1 + 1.4 * (1 - clamp(S.h / 18))));
  return { ...S, sv, amb, sun: scale(sunRaw, sv), sunRaw, ev, avg };
}
/** lit colour of a surface with albedo a and outward normal n (world) */
export function shade(a, n, L, ambK = 1) {
  const up = n[1];
  const ka = ambK * (0.55 + 0.45 * Math.max(0, up));      // vertical faces see half the sky …
  const kb = 0.16 * (1 - Math.max(0, up)), sy = Math.max(0, L.w[1]);   // … and the light bounced off the street
  const d = Math.max(0, n[0] * L.w[0] + n[1] * L.w[1] + n[2] * L.w[2]);
  const e = (c) => L.amb[c] * (ka + kb) + L.sun[c] * (d + kb * sy);
  return [a[0] * e(0), a[1] * e(1), a[2] * e(2)];
}
