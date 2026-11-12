/*
 * palette.js — day → dusk → night colour for every named paint, computed per frame (Zdog has no lighting).
 *
 * Each key has three stops. Night and dusk are derived from the day colour (a cool, dark multiply for night,
 * a warm one for dusk) unless given explicitly; emissive keys (lit windows, the lamp) go the other way.
 * mix(k): k = 0 day, 0.5 dusk, 1 night.
 */
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const NIGHT = { mul: [0.27, 0.33, 0.6], add: [14, 18, 46] };
const DUSK = { mul: [1.0, 0.8, 0.8], add: [16, 0, 14] };
const derive = (c, { mul, add }) => c.map((v, i) => Math.min(255, v * mul[i] + add[i]));

// [day, dusk?, night?]
export const PAINT = {
  grass: ['#7bd06b', '#c8b46a', '#2b5a5c'],
  grass2: ['#a2e07c'],
  road: ['#5e6178'],
  dash: ['#fff3cf'],
  water: ['#56c2ee', '#c58fc6', '#24407a'],
  waterRim: ['#c3efff'],
  wallCream: ['#fff4e2'], wallPeach: ['#ffd3ae'], wallMint: ['#c6f0db'], wallLilac: ['#e3d7ff'], wallButter: ['#ffe8a3'], wallSky: ['#d3ebff'],
  roofCoral: ['#ff6a55'], roofBlue: ['#3f70dc'], roofViolet: ['#8a5cf0'], roofOrange: ['#ff9a3c'], roofTeal: ['#21aa9b'], roofBerry: ['#e2477d'],
  door: ['#7b4b37'], trunk: ['#9b6a4b'], brick: ['#c8603e'],
  leaf1: ['#3fbf68'], leaf2: ['#5cd27b'], leaf3: ['#2ea463'], pine: ['#279a6c'], pine2: ['#33b07a'], bush: ['#4cc070'],
  flowerPink: ['#ff7eb6'], flowerYellow: ['#ffd23f'], flowerWhite: ['#ffffff'],
  lhWhite: ['#fff9f0'], lhRed: ['#ff4f4f'], lhDark: ['#3a4160'],
  millBody: ['#f6e3c5'], millCap: ['#c9613f'], blade: ['#fffaf2'],
  carRed: ['#ff4d6d'], carYellow: ['#ffc23d'], cabin: ['#ffffff'], tire: ['#2a2d40'],
  cloud: ['#ffffff', '#ffd9e2', '#8590c4'],
  // emissive: dark-ish by day, bright at night (not darkened)
  window: ['#a9dcff', '#ffcf86', '#ffd76a'],
  lamp: ['#d9f4ff', '#ffe7a0', '#fff1a6'],
  headlight: ['#fff6d6', '#fff1b8', '#fff3b0'],
};

const STOPS = {};
for (const [k, v] of Object.entries(PAINT)) {
  const d = hex(v[0]);
  STOPS[k] = [d, v[1] ? hex(v[1]) : derive(d, DUSK), v[2] ? hex(v[2]) : derive(d, NIGHT)];
}

const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/** colour of a 3-stop ramp at k ∈ [0, 1] */
export const ramp3 = (s, k) => (k < 0.5 ? lerp3(s[0], s[1], k * 2) : lerp3(s[1], s[2], (k - 0.5) * 2));
export const rgb = (c, a) => (a === undefined
  ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
  : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`);
export { lerp3, hex };

/**
 * All paints at night-ness k: { key: { c: [r,g,b] lit, s: [r,g,b] shadow, base, shade, hi } }.
 * The shadow is a cool, darker version of the colour; at night lighting contrast drops (moonlight).
 */
export function paintsAt(k) {
  const out = {};
  const sm = [lerpN(0.74, 0.8, k), lerpN(0.78, 0.82, k), lerpN(0.9, 0.9, k)];
  for (const key in STOPS) {
    const c = ramp3(STOPS[key], k);
    const s = [c[0] * sm[0], c[1] * sm[1], c[2] * sm[2]];
    out[key] = { c, s, base: rgb(c), shade: rgb(s), hi: null };
  }
  return out;
}
function lerpN(a, b, k) { return a + (b - a) * k; }
