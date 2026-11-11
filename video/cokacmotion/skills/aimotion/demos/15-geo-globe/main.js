/*
 * 15 · 지구 위를 나는 길 — real coastlines (world-atlas 50m) on a d3-geo orthographic globe, drawn with Canvas 2D.
 *
 *  · land      d3 geoPath(geoOrthographic) streams the coastline straight into a Path2D every frame; d3 clips it to
 *              the visible hemisphere (clipAngle 90°) and to the frame (clipExtent). Polygons whose bounding cap
 *              cannot reach the view are culled first, and the overview uses a thinned level of detail.
 *  · night     the terminator is a geoCircle of radius 90° centred on the antisolar point, projected and clipped by
 *              the same d3 pipeline into a small mask, then softened in JS by a blur sized in degrees on the globe.
 *  · light     a per-pixel Lambert term (sun direction in view space) and a limb-scatter term, at quarter resolution.
 *  · flights   great circles from Seoul (geoInterpolate), lifted off the surface by a sin profile and occluded by the
 *              sphere in 3D; their heads and trails are pure functions of t.
 *  · cities    synthetic night lights round real cities, kept on land by geoContains (a raster pre-pass settles the
 *              clear cases), splatted in JS into one buffer.
 */
import { defineDemo, rand, clamp, lerp, smooth, track, ease } from '../_lib/stage.js';
import {
  geoOrthographic, geoEquirectangular, geoPath, geoGraticule, geoCircle, geoContains, geoInterpolate, geoDistance, geoBounds, geoArea,
} from 'd3-geo';
import { feature, mesh } from 'topojson-client';

const D = 9.6;
const CX = 540, CY = 880;                 // globe centre on the stage
const SEOUL = [126.98, 37.57];
const SUN_LAT = -13;                      // subsolar latitude (late autumn); its longitude sweeps in = dawn
const DEG = Math.PI / 180;
const EARTH_KM = 6371;
const TWILIGHT_DEG = 4.5;                 // softness (σ) of the terminator, in degrees of arc on the globe

// destination (Korean label), lon, lat, outbound launch time, inbound arrival time at Seoul
const ROUTES = [
  ['도쿄', 139.69, 35.69, 1.00, 8.95],
  ['런던', -0.13, 51.51, 1.20, 8.30],
  ['두바이', 55.27, 25.20, 1.45, 8.55],
  ['싱가포르', 103.82, 1.35, 1.70, 8.70],
  ['시드니', 151.21, -33.87, 1.95, 8.40],
  ['샌프란시스코', -122.42, 37.77, 2.20, 8.20],
  ['모스크바', 37.62, 55.75, 2.45, 8.62],
  ['뉴욕', -74.0, 40.71, 2.70, 8.10],
  ['호놀룰루', -157.86, 21.31, 2.95, 8.48],
  ['베이징', 116.40, 39.90, 3.25, 8.82, 'left'],
];

// population centres for the synthetic night lights: lon, lat, weight, spread (deg)
const CITIES = [
  [126.98, 37.57, 10, 0.32], [126.70, 37.45, 4, 0.18], [127.03, 37.26, 4, 0.2], [129.07, 35.18, 6, 0.22], [128.60, 35.87, 4.5, 0.2],
  [127.38, 36.35, 3.5, 0.18], [126.85, 35.16, 3.5, 0.18], [129.31, 35.54, 2.5, 0.14], [128.68, 35.23, 2.5, 0.14], [127.15, 35.82, 2, 0.13],
  [127.49, 36.64, 2, 0.13], [129.36, 36.02, 1.6, 0.12], [128.90, 37.75, 1.4, 0.12], [126.53, 33.50, 1.6, 0.13], [127.92, 37.34, 1.5, 0.12],
  [125.75, 39.03, 1.2, 0.12],
  [139.69, 35.69, 11, 0.45], [135.50, 34.69, 8, 0.35], [136.90, 35.18, 5, 0.28], [130.40, 33.59, 4, 0.24], [141.35, 43.06, 3, 0.22],
  [132.46, 34.39, 2.5, 0.2], [140.87, 38.27, 2.5, 0.2], [135.2, 34.7, 3, 0.2], [133.9, 34.65, 1.8, 0.15],
  [121.47, 31.23, 10, 0.5], [116.40, 39.90, 9, 0.5], [117.20, 39.13, 5, 0.35], [123.43, 41.80, 4.5, 0.35], [121.60, 38.91, 3.5, 0.3],
  [120.38, 36.07, 4, 0.3], [126.63, 45.75, 3.5, 0.3], [114.30, 30.59, 6, 0.45], [104.07, 30.67, 6, 0.45], [106.50, 29.56, 6, 0.45],
  [113.26, 23.13, 9, 0.5], [114.06, 22.54, 7, 0.35], [118.80, 32.06, 5, 0.35], [108.94, 34.34, 5, 0.4], [113.62, 34.75, 5, 0.4],
  [121.56, 25.04, 5, 0.3], [120.30, 22.62, 3, 0.25], [125.32, 43.88, 3, 0.3], [112.55, 37.87, 3, 0.35], [119.3, 26.08, 3, 0.3],
  [120.15, 30.27, 5, 0.35], [117.0, 36.67, 4, 0.35], [114.5, 38.04, 3.5, 0.35], [112.94, 28.23, 4, 0.35], [102.71, 25.04, 3, 0.35],
  [106.63, 26.65, 2.5, 0.3], [108.32, 22.82, 2.5, 0.3], [115.86, 28.68, 3, 0.3], [87.6, 43.8, 2, 0.3], [103.83, 36.06, 2, 0.3],
  [100.50, 13.75, 7, 0.45], [106.66, 10.76, 6, 0.4], [105.85, 21.03, 5, 0.35], [101.69, 3.14, 5, 0.35], [103.82, 1.35, 5, 0.18],
  [106.85, -6.21, 8, 0.45], [112.75, -7.25, 4, 0.35], [120.98, 14.60, 7, 0.4], [96.16, 16.84, 3, 0.3], [90.41, 23.81, 6, 0.4],
  [88.36, 22.57, 6, 0.4], [77.21, 28.61, 8, 0.5], [72.88, 19.08, 8, 0.4], [77.59, 12.97, 6, 0.4], [80.27, 13.08, 5, 0.35],
  [78.47, 17.38, 5, 0.35], [67.01, 24.86, 6, 0.4], [74.35, 31.55, 5, 0.4], [72.57, 23.02, 4, 0.35], [75.79, 26.91, 3, 0.35],
  [55.27, 25.20, 4, 0.3], [46.68, 24.71, 4, 0.35], [51.39, 35.69, 6, 0.4], [44.36, 33.31, 3, 0.35], [31.24, 30.04, 7, 0.4],
  [28.98, 41.01, 6, 0.35], [37.62, 55.75, 7, 0.45], [30.31, 59.94, 4, 0.35], [-0.13, 51.51, 7, 0.4], [2.35, 48.86, 7, 0.4],
  [13.40, 52.52, 4, 0.35], [12.50, 41.90, 4, 0.35], [-3.70, 40.42, 4, 0.35], [3.38, 6.52, 5, 0.4], [28.05, -26.20, 4, 0.4],
  [36.82, -1.29, 3, 0.35], [151.21, -33.87, 5, 0.35], [144.96, -37.81, 5, 0.35], [153.03, -27.47, 3, 0.3], [115.86, -31.95, 3, 0.3],
  [174.76, -36.85, 2, 0.25], [-118.24, 34.05, 8, 0.6], [-122.42, 37.77, 5, 0.35], [-122.33, 47.61, 4, 0.35], [-123.12, 49.28, 3, 0.3],
  [-74.0, 40.71, 9, 0.5], [-87.63, 41.88, 6, 0.45], [-99.13, 19.43, 7, 0.5], [-157.86, 21.31, 1.6, 0.15], [-149.9, 61.2, 1, 0.2],
  [131.89, 43.12, 1.6, 0.2], [135.07, 48.48, 1.2, 0.2], [104.3, 52.3, 1.5, 0.25], [82.93, 55.03, 2.5, 0.3], [60.6, 56.84, 2.5, 0.3],
];
// a few bright corridors (highways / rail) between cities, for the close-up
const CORRIDORS = [
  [[126.98, 37.57], [127.38, 36.35], 40], [[127.38, 36.35], [128.60, 35.87], 40], [[128.60, 35.87], [129.07, 35.18], 30],
  [[126.98, 37.57], [126.85, 35.16], 45], [[139.69, 35.69], [136.90, 35.18], 45], [[136.90, 35.18], [135.50, 34.69], 30],
  [[135.50, 34.69], [130.40, 33.59], 50], [[116.40, 39.90], [121.47, 31.23], 70], [[121.47, 31.23], [113.26, 23.13], 60],
];

const unit = (lon, lat) => {
  const l = lon * DEG, p = lat * DEG, c = Math.cos(p);
  return [c * Math.cos(l), c * Math.sin(l), Math.sin(p)];
};
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// ---- timeline (all pure functions of t) ----
const camP = (t) => 1 - Math.pow(1 - clamp(t / 9.25), 2.3);   // a spin that settles on Seoul…
const logR = track([[0, Math.log(420)], [1.8, Math.log(468), ease.outCubic], [5.7, Math.log(482), (p) => p], [9.6, Math.log(2700), ease.inOutCubic]]);
const expo = track([[0, 0.55], [1.7, 1, ease.outCubic]]);
const sunLon = track([[0, -62], [2.6, 24, ease.outCubic]]);       // dawn sweeps in; ends as evening over East Asia
const fadeOut = (t) => 0.9 * smooth((t - 9.22) / 0.38);          // the player loops: end on near-black, start dim

// ======================= geometry prepared once =======================

/** thin every ring to ≥ minDeg steps and drop polygons under minArea (sr); keep the exact polygon wherever
 *  thinning would change its area (antimeridian / pole rings, slivers) so d3 never sees a flipped ring */
function thinLand(multi, minDeg, minArea) {
  const thinRing = (ring) => {
    if (ring.some(([l, q]) => Math.abs(l) > 179.9 || q < -89)) return ring;
    const out = [ring[0]];
    let [pl, pp] = ring[0];
    for (let i = 1; i < ring.length - 1; i++) {
      const [l, q] = ring[i], dl = (l - pl) * Math.cos(q * DEG), dq = q - pp;
      if (dl * dl + dq * dq >= minDeg * minDeg) { out.push(ring[i]); pl = l; pp = q; }
    }
    out.push(ring[ring.length - 1]);
    return out;
  };
  return { type: 'MultiPolygon', coordinates: multi.coordinates.flatMap((poly) => {
    const a0 = geoArea({ type: 'Polygon', coordinates: poly });
    if (a0 < minArea) return [];
    const tp = poly.map(thinRing).filter((r) => r.length >= 4);
    const a1 = tp.length ? geoArea({ type: 'Polygon', coordinates: tp }) : 0;
    return [Math.abs(a1 - a0) < 0.25 * a0 ? tp : poly];
  }) };
}

/** a bounding cap per polygon (centre = normalised mean vertex, radius = farthest vertex) for view culling,
 *  plus every ring as packed unit vectors for the no-clip fast path (polygons wholly on the near hemisphere) */
function capsOf(multi) {
  return multi.coordinates.map((poly) => {
    const vs = poly[0].map(([l, q]) => unit(l, q));
    let c = vs.reduce((s, v) => [s[0] + v[0], s[1] + v[1], s[2] + v[2]], [0, 0, 0]);
    const len = Math.hypot(...c) || 1;
    c = c.map((x) => x / len);
    let r = 0;
    for (const v of vs) r = Math.max(r, Math.acos(clamp(dot(c, v), -1, 1)));
    // d3 rings repeat the first vertex at the end; drop it (the fast path closes rings itself)
    const rings = poly.map((ring) => {
      const n = ring.length - 1, a = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { const u = unit(ring[i][0], ring[i][1]); a[i * 3] = u[0]; a[i * 3 + 1] = u[1]; a[i * 3 + 2] = u[2]; }
      return a;
    });
    return { poly, c, r, rings };
  });
}

/** a path sink for d3 that closes rings with lineTo instead of closePath: fill() closes subpaths by itself, and
 *  Path2D.closePath turned out to be the single most expensive call when streaming ~1,400 coastline rings */
function openRingSink(path) {
  let x0 = 0, y0 = 0;
  return {
    moveTo(x, y) { x0 = x; y0 = y; path.moveTo(x, y); },
    lineTo(x, y) { path.lineTo(x, y); },
    closePath() { path.lineTo(x0, y0); },
    arc(x, y, r, a0, a1) { path.moveTo(x + r, y); path.arc(x, y, r, a0, a1); },
  };
}

/** land test for the synthetic lights. Exact answer = spherical geoContains (~1 ms on the 10k-vertex Eurasia
 *  ring), so equirectangular rasters of the same land settle the clear cases in O(1): a pixel the coastline
 *  does not touch is fully covered (alpha 255 → land) or empty (0 → sea); only anti-aliased coast pixels ask
 *  geoContains. A fine 0.025° raster over East Asia (where the camera lands) + a 0.1° global one. */
function makeLandTest(land) {
  const polys = land.coordinates.map((c) => { const poly = { type: 'Polygon', coordinates: c }; return { poly, b: geoBounds(poly) }; });
  const makeRaster = (lonA, latA, lonB, latB, perDeg) => {
    const mw = Math.round((lonB - lonA) * perDeg), mh = Math.round((latB - latA) * perDeg);
    const cv = document.createElement('canvas'); cv.width = mw; cv.height = mh;
    const g = cv.getContext('2d', { willReadFrequently: true });
    const pr = geoEquirectangular().scale(perDeg / DEG).translate([-lonA * perDeg, latB * perDeg]).precision(0.1);
    g.fillStyle = '#fff'; g.beginPath(); geoPath(pr, g)(land); g.fill();
    const px = g.getImageData(0, 0, mw, mh).data;
    const m = new Uint8Array(mw * mh);
    for (let i = 0; i < m.length; i++) m[i] = px[i * 4 + 3] === 255 ? 2 : px[i * 4 + 3] === 0 ? 0 : 1;
    return (lon, lat) => {
      const x = Math.floor((lon - lonA) * perDeg), y = Math.floor((latB - lat) * perDeg);
      return x < 0 || y < 0 || x >= mw || y >= mh ? -1 : m[y * mw + x];
    };
  };
  const fine = makeRaster(95, 15, 150, 52, 40), coarse = makeRaster(-180, -90, 180, 90, 10);
  const stats = { exact: 0 };
  const onLand = (lon, lat) => {
    const f = fine(lon, lat), r = f >= 0 ? f : coarse(lon, lat);
    if (r === 0 || r === 2) return r === 2;
    stats.exact++;
    for (const { poly, b } of polys) {
      if (lat < b[0][1] - 0.01 || lat > b[1][1] + 0.01) continue;
      const inLon = b[0][0] <= b[1][0] ? lon >= b[0][0] - 0.01 && lon <= b[1][0] + 0.01 : lon >= b[0][0] || lon <= b[1][0];
      if (inLon && geoContains(poly, [lon, lat])) return true;
    }
    return false;
  };
  return { onLand, stats };
}

/** synthetic but plausible night lights: clustered round real cities (dense core, long tail, satellite towns),
 *  bright corridors, sparse rural dots near population — all from rand(seed), all on land */
function makeLights(onLand) {
  const R1 = rand(1507);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - R1())) * Math.cos(2 * Math.PI * R1());
  const lights = [];   // x, y, z (unit), brightness, size
  const hazes = [];    // one broad faint glow per city: x, y, z, weight, spread
  const add = (lon, lat, b, s) => { if (onLand(lon, lat)) lights.push(...unit(lon, lat), b, s); };
  for (const [lon, lat, w, sp] of CITIES) {
    const n = Math.round(w * (lon > 95 && lon < 150 && lat > 15 && lat < 50 ? 110 : 40));   // dense where we zoom in
    const cl = Math.cos(lat * DEG);
    const subs = [[0, 0]];
    for (let s = 0; s < Math.round(w / 1.4); s++) { const a = R1() * 6.283, r = sp * (1.1 + 2.4 * R1()); subs.push([Math.cos(a) * r, Math.sin(a) * r]); }
    for (let i = 0; i < n; i++) {
      const main = subs.length === 1 || R1() < 0.72;
      const sub = main ? subs[0] : subs[1 + Math.floor(R1() * (subs.length - 1))];
      const scale = main ? sp : sp * 0.3;
      const r = Math.pow(-Math.log(1 - R1() * 0.999), 1.35) * scale * 0.5;
      const a = R1() * 6.283;
      const core = Math.exp(-1.6 * r / scale);
      add(lon + (sub[0] + Math.cos(a) * r) / cl, lat + sub[1] + Math.sin(a) * r, (0.18 + 0.4 * R1()) * (0.4 + 0.8 * core), 0.45 + 0.7 * R1());
    }
    hazes.push(...unit(lon, lat), w, sp);
  }
  for (const [a, b, n] of CORRIDORS) {
    const ip = geoInterpolate(a, b);
    for (let i = 0; i < n; i++) { const [lon, lat] = ip(R1()); add(lon + gauss() * 0.05, lat + gauss() * 0.05, 0.25 + 0.4 * R1(), 0.45 + 0.4 * R1()); }
  }
  const cityVec = CITIES.map(([lon, lat]) => unit(lon, lat));
  for (let i = 0; i < 9000; i++) {
    const lon = R1() * 360 - 180, lat = Math.asin(R1() * 2 - 1) / DEG;
    if (lat > 62 || lat < -45) continue;
    const v = unit(lon, lat);
    let best = -1;
    for (const c of cityVec) best = Math.max(best, dot(c, v));
    const dmin = Math.acos(Math.min(1, best)) / DEG;
    if (R1() > 0.035 + 0.6 * Math.exp(-((dmin / 7) ** 2))) continue;
    add(lon, lat, 0.12 + 0.3 * R1(), 0.4 + 0.5 * R1());
  }
  return { LA: new Float32Array(lights), LN: lights.length / 5, HZ: new Float32Array(hazes), HN: hazes.length / 5 };
}

/** routes: great circles from Seoul as 3D points lifted by h·sin(πf) above the unit sphere */
const NS = 140;
function makeRoutes() {
  return ROUTES.map(([name, lon, lat, launch, inArrive, side]) => {
    const d = geoDistance(SEOUL, [lon, lat]);
    const ip = geoInterpolate(SEOUL, [lon, lat]);
    const h = 0.025 + 0.19 * d / Math.PI;                   // longer flights climb higher
    const P = new Float32Array(NS * 3);
    for (let i = 0; i < NS; i++) {
      const f = i / (NS - 1), v = unit(...ip(f)), s = 1 + h * Math.sin(Math.PI * f);
      P[i * 3] = v[0] * s; P[i * 3 + 1] = v[1] * s; P[i * 3 + 2] = v[2] * s;
    }
    const dur = 0.9 + 1.2 * d, durIn = 0.75 * dur;
    return { name, side, dest: unit(lon, lat), d, P, launch, land: launch + dur, dur, inLaunch: inArrive - durIn, inArrive, durIn };
  });
}

/** 3 × (horizontal + vertical) running-sum box blur ≈ a gaussian of σ ≈ r, O(1) per pixel whatever r is */
function blur3(a, tmp, w, h, r) {
  if (r < 1) return;
  const inv = 1 / (2 * r + 1);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++) {
      const o = y * w;
      let acc = a[o] * (r + 1);
      for (let i = 1; i <= r; i++) acc += a[o + Math.min(w - 1, i)];
      for (let x = 0; x < w; x++) {
        tmp[o + x] = acc * inv;
        acc += a[o + Math.min(w - 1, x + r + 1)] - a[o + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = tmp[x] * (r + 1);
      for (let i = 1; i <= r; i++) acc += tmp[Math.min(h - 1, i) * w + x];
      for (let y = 0; y < h; y++) {
        a[y * w + x] = acc * inv;
        acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
      }
    }
  }
}

function glowSprite(rgb, core) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,248,232,1)'); gr.addColorStop(core, `rgba(${rgb},0.55)`);
  gr.addColorStop(0.55, `rgba(${rgb},0.12)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return c;
}

// ======================= the demo =======================

defineDemo({
  id: '15-geo-globe',
  title: '지구 위를 나는 길',
  tech: 'd3-geo · 실제 해안선 + 정사영',
  duration: D,
  background: '#02040a',

  async setup({ canvas, layer, W, H }) {
    const [landTopo, ctrTopo] = await Promise.all([
      fetch('../node_modules/world-atlas/land-50m.json').then((r) => r.json()),
      fetch('../node_modules/world-atlas/countries-110m.json').then((r) => r.json()),
    ]);
    const landHi = feature(landTopo, landTopo.objects.land).features[0].geometry;   // one MultiPolygon, 1419 parts
    const landLo = thinLand(landHi, 0.1, 1.5e-5);                                    // ≈1 px steps at overview scale
    const capsHi = capsOf(landHi), capsLo = capsOf(landLo);
    const borders = mesh(ctrTopo, ctrTopo.objects.countries, (a, b) => a !== b);
    const graticule = geoGraticule().step([10, 10]).precision(1)();
    const nightCircle = geoCircle().radius(90).precision(0.5);

    const { onLand, stats } = makeLandTest(landHi);
    const { LA, LN, HZ, HN } = makeLights(onLand);
    const routes = makeRoutes();
    this.stats = { lights: LN, exactLandTests: stats.exact };

    // ---- canvases: static sky (once), live globe, static vignette (once), DOM counter ----
    // headless render (SwiftShader, no GPU): willReadFrequently keeps the live canvas on Skia's CPU raster path,
    // several times faster there; a normal browser keeps its default GPU-accelerated canvas
    const RENDER = new URLSearchParams(location.search).has('render');
    const sky = canvas({ type: '2d', z: 0 }).ctx;
    const { ctx } = canvas({ type: '2d', z: 1, attrs: RENDER ? { willReadFrequently: true } : undefined });
    const veil = canvas({ type: '2d', z: 2 }).ctx;
    {
      const bg = sky.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#03050d'); bg.addColorStop(0.5, '#050a18'); bg.addColorStop(1, '#02040a');
      sky.fillStyle = bg; sky.fillRect(0, 0, W, H);
      const neb = sky.createRadialGradient(CX - 140, CY - 260, 0, CX - 140, CY - 260, 900);
      neb.addColorStop(0, 'rgba(40,70,140,0.22)'); neb.addColorStop(0.5, 'rgba(30,40,100,0.08)'); neb.addColorStop(1, 'rgba(0,0,0,0)');
      sky.globalCompositeOperation = 'lighter'; sky.fillStyle = neb; sky.fillRect(0, 0, W, H);
      const vg = veil.createRadialGradient(CX, CY, H * 0.3, CX, CY, H * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
      veil.fillStyle = vg; veil.fillRect(0, 0, W, H);
      const top = veil.createLinearGradient(0, 0, 0, 420);
      top.addColorStop(0, 'rgba(2,4,10,0.7)'); top.addColorStop(1, 'rgba(2,4,10,0)');
      veil.fillStyle = top; veil.fillRect(0, 0, W, 420);
    }
    const hud = layer('div', { z: 3 });
    hud.innerHTML = `<div style="position:absolute;left:72px;top:172px;font-family:'Pretendard Variable',sans-serif;font-variant-numeric:tabular-nums;color:#ffecd2">
      <div style="font-size:26px;font-weight:600;letter-spacing:.04em;color:#bccde8;opacity:.62">SEOUL ICN · 10개 노선 왕복</div>
      <div style="margin-top:8px;white-space:nowrap"><span data-k="num" style="font-size:68px;font-weight:700;letter-spacing:-.01em">0</span><span style="font-size:34px;font-weight:600;opacity:.72;margin-left:14px">km</span></div></div>`;
    const hudBox = hud.firstElementChild, hudNum = hud.querySelector('[data-k=num]');

    // ---- d3 pipeline: one projection, path generators bound to their targets ----
    const projection = geoOrthographic().precision(0).clipExtent([[-8, -8], [W + 8, H + 8]]);   // rings are dense: no resampling
    const toCtx = geoPath(projection, ctx);
    const toPath2D = geoPath(projection);

    // ---- offscreen buffers ----
    const QW = W >> 2, QH = H >> 2;                          // quarter res: lighting + night mask
    const offscreen = (w, h, attrs) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d', attrs)]; };
    const [mulC, mulX] = offscreen(QW, QH), [addC, addX] = offscreen(QW, QH);
    const [, nightX] = offscreen(QW, QH, { willReadFrequently: true });
    const toNight = geoPath(projection, nightX);
    const mulI = mulX.createImageData(QW, QH), addI = addX.createImageData(QW, QH);
    const NM = new Float32Array(QW * QH), NT = new Float32Array(QW * QH);
    const LW = W >> 1, LH = H >> 1;                          // half res: city lights
    const [lightC, lightX] = offscreen(LW, LH);
    const lightI = lightX.createImageData(LW, LH);
    for (let i = 3; i < lightI.data.length; i += 4) lightI.data[i] = 255;
    const LB = new Float32Array(LW * LH * 3);
    // per-pixel transcendental calls replaced by tables (the loops below run on ~10⁵–10⁶ pixels every frame):
    // TONE[v·1024] = 255·(1 − e^(−1.5v)) for v < 16, RIM[(1 − nz)·1023] = (1 − nz)^2.6
    const TONE = new Uint8ClampedArray(16384), RIM = new Float32Array(1024);
    for (let i = 0; i < 16384; i++) TONE[i] = 255 * (1 - Math.exp(-1.5 * i / 1024));
    for (let i = 0; i < 1024; i++) RIM[i] = Math.pow(i / 1023, 2.6);
    const headSprite = glowSprite('255,196,120', 0.1);
    const starC = document.createElement('canvas'); starC.width = 1600; starC.height = H;
    {
      const g = starC.getContext('2d'), R2 = rand(77);
      for (let i = 0; i < 700; i++) {
        const x = R2() * 1600, y = R2() * H, b = Math.pow(R2(), 3), sz = (0.5 + R2() * 2) * (0.5 + b);
        g.fillStyle = `rgba(${200 + 55 * b | 0},${215 + 30 * b | 0},255,${(0.25 + 0.75 * b).toFixed(3)})`;
        g.fillRect(x - sz / 2, y - sz / 2, sz, sz);
      }
    }
    const scr = new Float32Array(NS * 3), vis = new Uint8Array(NS), tmp = [0, 0, 0];

    // ======================= per frame =======================
    this.render = (t) => {
      // ---- camera + sun in view space ----
      const p = camP(t);
      const lon0 = lerp(58, SEOUL[0], p), lat0 = lerp(6, SEOUL[1], p);
      const R = Math.exp(logR(t));
      const zoomK = clamp((R - 482) / (2700 - 482));
      const ex = expo(t);
      const sLon = sunLon(t);
      projection.rotate([-lon0, -lat0]).scale(R).translate([CX, CY]);
      // view basis matching d3's rotate: e → screen right, n → screen up, c → toward the viewer
      const c = unit(lon0, lat0);
      const e = [-Math.sin(lon0 * DEG), Math.cos(lon0 * DEG), 0];
      const n = [-Math.sin(lat0 * DEG) * Math.cos(lon0 * DEG), -Math.sin(lat0 * DEG) * Math.sin(lon0 * DEG), Math.cos(lat0 * DEG)];
      const proj = (x, y, z, out) => {
        out[0] = CX + R * (x * e[0] + y * e[1] + z * e[2]);
        out[1] = CY - R * (x * n[0] + y * n[1] + z * n[2]);
        out[2] = x * c[0] + y * c[1] + z * c[2];
        return out;
      };
      const sun = unit(sLon, SUN_LAT);
      const Lx = dot(sun, e), Ly = dot(sun, n), Lz = dot(sun, c);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);
      const disc = new Path2D();
      disc.arc(CX, CY, R, 0, Math.PI * 2);
      const bx0 = Math.max(0, CX - R - 12), by0 = Math.max(0, CY - R - 12), bx1 = Math.min(W, CX + R + 12), by1 = Math.min(H, CY + R + 12);

      // ---- 1. ocean + sun glint (where the normal is the half vector between sun and viewer) ----
      const oc = ctx.createRadialGradient(CX - R * 0.2, CY - R * 0.25, 0, CX, CY, R);
      oc.addColorStop(0, '#1d5687'); oc.addColorStop(1, '#123c66');
      ctx.fillStyle = oc; ctx.fill(disc);
      {
        const hz = Lz + 1, hl = Math.hypot(Lx, Ly, hz);
        if (hz / hl > 0.05 && R < 1100) {
          const gx = CX + R * Lx / hl, gy = CY - R * Ly / hl, gr = R * 0.45;
          const gl = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
          gl.addColorStop(0, 'rgba(170,205,240,0.55)'); gl.addColorStop(0.3, 'rgba(90,150,210,0.2)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gl; ctx.fill(disc);
          ctx.globalCompositeOperation = 'source-over';
        }
      }

      // ---- 2. land: cull by bounding cap, then d3 projects + clips (hemisphere, frame) into a Path2D ----
      const viewRad = Math.min(Math.PI / 2, Math.asin(Math.min(1, Math.hypot(W / 2, H - CY) / R))) + 3 * DEG;
      const caps = R > 1100 ? capsHi : capsLo;
      // Polygons that cross the horizon go through d3 (rotation, spherical clipping, frame clipping). Polygons wholly
      // on the near hemisphere need no clipping, so they skip d3 and are projected directly: orthographic
      // projection of a unit vector is two dot products with the view basis (e, n). Canvas clips to the frame.
      const visibleLand = { type: 'MultiPolygon', coordinates: [] };
      const landPath = new Path2D();
      const ex0 = e[0], ex1 = e[1], ex2 = e[2], nx0 = n[0], nx1 = n[1], nx2 = n[2];
      for (const k of caps) {
        const ang = Math.acos(clamp(dot(k.c, c), -1, 1));
        if (ang - k.r >= viewRad) continue;                       // wholly out of view
        if (ang + k.r > Math.PI / 2 - 0.2 * DEG) { visibleLand.coordinates.push(k.poly); continue; }   // crosses the horizon
        for (const a of k.rings) {
          landPath.moveTo(CX + R * (a[0] * ex0 + a[1] * ex1 + a[2] * ex2), CY - R * (a[0] * nx0 + a[1] * nx1 + a[2] * nx2));
          for (let i = 3; i < a.length; i += 3) {
            landPath.lineTo(CX + R * (a[i] * ex0 + a[i + 1] * ex1 + a[i + 2] * ex2), CY - R * (a[i] * nx0 + a[i + 1] * nx1 + a[i + 2] * nx2));
          }
          landPath.lineTo(CX + R * (a[0] * ex0 + a[1] * ex1 + a[2] * ex2), CY - R * (a[0] * nx0 + a[1] * nx1 + a[2] * nx2));
        }
      }
      toPath2D.context(openRingSink(landPath))(visibleLand);
      ctx.fillStyle = '#9ba293';
      ctx.fill(landPath);
      // strokes under 1 px take Skia's hairline fast path (a general AA stroke of a coastline is very slow on CPU)
      ctx.strokeStyle = 'rgba(60,64,52,0.4)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); toCtx(borders); ctx.stroke();
      ctx.strokeStyle = 'rgba(190,215,255,0.13)'; ctx.lineWidth = 0.9;
      ctx.beginPath(); toCtx(graticule); ctx.stroke();

      // ---- 3. night: geoCircle(antisolar, 90°) through the same projection + clipping → mask → soft edge ----
      nightX.setTransform(1, 0, 0, 1, 0, 0);
      nightX.clearRect(0, 0, QW, QH);
      nightX.setTransform(0.25, 0, 0, 0.25, 0, 0);
      nightX.fillStyle = '#fff';
      nightX.beginPath(); toNight(nightCircle.center([sLon + 180, -SUN_LAT])()); nightX.fill();
      {
        const px = nightX.getImageData(0, 0, QW, QH).data;
        for (let y = 0, q = 0; y < QH; y++) {
          const ny = -((y + 0.5) * 4 - CY) / R;
          for (let x = 0; x < QW; x++, q++) {
            const nx = ((x + 0.5) * 4 - CX) / R, r2 = nx * nx + ny * ny;
            // outside the disc there is no geometry: continue the terminator outward (so the blur does not pull
            // the night limb toward "day"), using the sign of the sun term at the nearest limb point
            NM[q] = r2 <= 1 ? px[q * 4 + 3] / 255 : (nx * Lx + ny * Ly) / Math.sqrt(r2) < 0 ? 1 : 0;
          }
        }
        blur3(NM, NT, QW, QH, Math.round(TWILIGHT_DEG * DEG * R / 4));   // σ in degrees of arc → quarter-res px
      }

      // ---- 4. lighting maps (quarter res): multiply = Lambert day ↔ night tint by the mask; add = limb + dusk ----
      {
        const md = mulI.data, ad = addI.data;
        // only the disc's bounding box is drawn below (+2 quarter-px margin for the bilinear upscale)
        const qx0 = Math.max(0, (bx0 >> 2) - 2), qx1 = Math.min(QW, (bx1 >> 2) + 3);
        const qy0 = Math.max(0, (by0 >> 2) - 2), qy1 = Math.min(QH, (by1 >> 2) + 3);
        for (let y = qy0; y < qy1; y++) {
          const ny0 = -((y + 0.5) * 4 - CY) / R;
          for (let x = qx0, q = y * QW + qx0; x < qx1; x++, q++) {
            const o = q * 4;
            let nx = ((x + 0.5) * 4 - CX) / R, ny = ny0;
            let r2 = nx * nx + ny * ny;
            if (r2 > 1) { const k = 1 / Math.sqrt(r2); nx *= k; ny *= k; r2 = 1; }   // edge value outside (trimmed later)
            const nz = Math.sqrt(1 - r2);
            const lam = nx * Lx + ny * Ly + nz * Lz;                                   // cos(sun zenith angle)
            const lit = Math.min(1, 0.3 + 0.8 * Math.max(lam, 0)) * ex;
            const nf = NM[q];
            md[o] = 255 * lerp(lit, 0.075, nf);
            md[o + 1] = 255 * lerp(lit * 0.98, 0.095, nf);
            md[o + 2] = 255 * lerp(lit * 0.95, 0.19, nf);
            md[o + 3] = 255;
            const rim = RIM[((1 - nz) * 1023) | 0] * (0.12 + 0.88 * (1 - nf)) * ex;
            const dusk = 4 * nf * (1 - nf) * ex;                                       // warm band on the terminator
            ad[o] = 255 * Math.min(1, rim * 0.32 + dusk * 0.06);
            ad[o + 1] = 255 * Math.min(1, rim * 0.6 + dusk * 0.022);
            ad[o + 2] = 255 * Math.min(1, rim * 1.0 + dusk * 0.008);
            ad[o + 3] = 255;
          }
        }
        mulX.putImageData(mulI, 0, 0, qx0, qy0, qx1 - qx0, qy1 - qy0);
        addX.putImageData(addI, 0, 0, qx0, qy0, qx1 - qx0, qy1 - qy0);
        ctx.imageSmoothingEnabled = true;
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(mulC, bx0 / 4, by0 / 4, (bx1 - bx0) / 4, (by1 - by0) / 4, bx0, by0, bx1 - bx0, by1 - by0);
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(addC, bx0 / 4, by0 / 4, (bx1 - bx0) / 4, (by1 - by0) / 4, bx0, by0, bx1 - bx0, by1 - by0);
        // moonlit coastlines for the night close-up only (in the overview lit/unlit land already reads, and a
        // coastline stroke is the costliest raster op here); once zoomed, culling + clipExtent keep the path short
        const coastA = 0.3 * smooth((R - 900) / 600) * ex;
        if (coastA > 0.005) {
          ctx.strokeStyle = `rgba(150,176,220,${coastA.toFixed(3)})`; ctx.lineWidth = 0.9;
          ctx.stroke(landPath);
        }
      }

      // ---- 5. city lights: splatted in JS into one half-res buffer → one drawImage (not ~10k sprite draws) ----
      LB.fill(0);
      const splat = (x, y, a, rr, core) => {   // x, y in stage px; rr radius in half-res px
        if (a < 0.003) return;
        const cx = x * 0.5, cy = y * 0.5;
        const sc = Math.max(0.45, rr * 0.22), sh = Math.max(0.8, rr * 0.5);
        const ic = 1 / (2.3 * sc) ** 2, ih = 1 / (2.3 * sh) ** 2;          // (1 − d²/r²)³ ≈ gaussian, no exp()
        const ext = Math.ceil(2.3 * sh), xi = Math.floor(cx), yi = Math.floor(cy);
        const x0 = Math.max(0, xi - ext), x1 = Math.min(LW - 1, xi + ext), y0 = Math.max(0, yi - ext), y1 = Math.min(LH - 1, yi + ext);
        for (let yy = y0; yy <= y1; yy++) {
          const dy = yy + 0.5 - cy;
          for (let xx = x0, o = (yy * LW + x0) * 3; xx <= x1; xx++, o += 3) {
            const dx = xx + 0.5 - cx, d2 = dx * dx + dy * dy;
            const wh = 1 - d2 * ih;
            if (wh <= 0) continue;
            const wc = 1 - d2 * ic;
            const cc = wc > 0 ? core * a * wc * wc * wc : 0, hh = 0.35 * a * wh * wh * wh;
            LB[o] += cc + hh; LB[o + 1] += 0.93 * cc + 0.6 * hh; LB[o + 2] += 0.8 * cc + 0.26 * hh;
          }
        }
      };
      const darkness = (v) => smooth((0.04 - dot(v, sun)) / 0.22);          // lights switch on past the terminator
      const lsz = 3.8 * Math.pow(R / 470, 0.45);
      const lgain = lerp(0.42, 1, zoomK);                                    // dots overlap more when small
      for (let i = 0; i < HN; i++) {
        const v = [HZ[i * 5], HZ[i * 5 + 1], HZ[i * 5 + 2]];
        proj(v[0], v[1], v[2], tmp);
        if (tmp[2] < 0.05) continue;
        const nt = darkness(v), s = HZ[i * 5 + 4] * DEG * R * 7;
        if (nt <= 0 || tmp[0] < -s || tmp[0] > W + s || tmp[1] < -s || tmp[1] > H + s) continue;
        splat(tmp[0], tmp[1], 0.12 * Math.sqrt(HZ[i * 5 + 3]) * nt * smooth(tmp[2] / 0.3) * ex, s / 4, 0);
      }
      for (let i = 0; i < LN; i++) {
        const j = i * 5;
        proj(LA[j], LA[j + 1], LA[j + 2], tmp);
        if (tmp[2] < 0.02 || tmp[0] < -20 || tmp[0] > W + 20 || tmp[1] < -20 || tmp[1] > H + 20) continue;
        const nt = smooth((0.04 - (LA[j] * sun[0] + LA[j + 1] * sun[1] + LA[j + 2] * sun[2])) / 0.22);
        if (nt > 0) splat(tmp[0], tmp[1], LA[j + 3] * nt * smooth(tmp[2] / 0.3) * ex * lgain, lsz * LA[j + 4] / 4, 1);
      }
      {
        // soft tone curve 1 − e^(−1.5v) (table): dense clusters glow amber instead of clipping white.
        // Only the disc's bounding box is converted and drawn — everything outside is trimmed in step 6 anyway.
        const d = lightI.data;
        const lx0 = Math.max(0, (bx0 >> 1) - 1), lx1 = Math.min(LW, (bx1 >> 1) + 2);
        const ly0 = Math.max(0, (by0 >> 1) - 1), ly1 = Math.min(LH, (by1 >> 1) + 2);
        const tone = (v) => TONE[v < 16 ? (v * 1024) | 0 : 16383];
        for (let y = ly0; y < ly1; y++) {
          for (let i = (y * LW + lx0) * 3, o = (y * LW + lx0) * 4, e = (y * LW + lx1) * 3; i < e; i += 3, o += 4) {
            if (LB[i] === 0) { d[o] = d[o + 1] = d[o + 2] = 0; continue; }
            d[o] = tone(LB[i]); d[o + 1] = tone(LB[i + 1]); d[o + 2] = tone(LB[i + 2]);
          }
        }
        lightX.putImageData(lightI, 0, 0, lx0, ly0, lx1 - lx0, ly1 - ly0);
        ctx.drawImage(lightC, lx0, ly0, lx1 - lx0, ly1 - ly0, lx0 * 2, ly0 * 2, (lx1 - lx0) * 2, (ly1 - ly0) * 2);
      }

      // ---- 6. trim to the disc with one anti-aliased fill, then slide stars + atmosphere in *behind* it ----
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fill(disc);
      ctx.globalCompositeOperation = 'destination-over';
      {
        const sk = 1 + zoomK * 0.25, off = (((-lon0 * 2.2) % 1600) + 1600) % 1600 - 260;   // parallax with the spin
        ctx.globalAlpha = ex;
        ctx.setTransform(sk, 0, 0, sk, CX - CX * sk, CY - CY * sk);
        ctx.drawImage(starC, off, 0);
        ctx.drawImage(starC, off - 1600, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
      }
      if (R < 2400) {
        const x0 = Math.max(0, CX - R * 1.32), y0 = Math.max(0, CY - R * 1.32), x1 = Math.min(W, CX + R * 1.32), y1 = Math.min(H, CY + R * 1.32);
        const halo = ctx.createRadialGradient(CX, CY, R * 0.96, CX, CY, R * 1.2);
        halo.addColorStop(0, `rgba(110,170,255,${0.5 * ex})`); halo.addColorStop(0.18, `rgba(70,130,240,${0.2 * ex})`);
        halo.addColorStop(0.5, `rgba(40,80,200,${0.06 * ex})`); halo.addColorStop(1, 'rgba(20,40,120,0)');
        ctx.fillStyle = halo; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        const sx = CX + Lx * R * 0.12, sy = CY - Ly * R * 0.12;               // brighter toward the sun
        const halo2 = ctx.createRadialGradient(sx, sy, R * 0.9, sx, sy, R * 1.3);
        halo2.addColorStop(0, `rgba(120,180,255,${0.22 * ex})`); halo2.addColorStop(0.35, `rgba(80,140,240,${0.07 * ex})`);
        halo2.addColorStop(1, 'rgba(40,80,200,0)');
        ctx.fillStyle = halo2; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      }

      // ---- 7. flights: lifted great circles, occluded by the sphere ----
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      const lw = Math.pow(R / 470, 0.3);
      const strokeRun = (i0, i1, style, width) => {
        ctx.strokeStyle = style; ctx.lineWidth = width;
        ctx.beginPath();
        let pen = false;
        for (let i = i0; i <= i1; i++) {
          if (!vis[i]) { pen = false; continue; }
          if (pen) ctx.lineTo(scr[i * 3], scr[i * 3 + 1]); else { ctx.moveTo(scr[i * 3], scr[i * 3 + 1]); pen = true; }
        }
        ctx.stroke();
      };
      const pointAt = (f) => {
        const x = f * (NS - 1), i = Math.min(NS - 2, Math.floor(x)), k = x - i;
        return [lerp(scr[i * 3], scr[i * 3 + 3], k), lerp(scr[i * 3 + 1], scr[i * 3 + 4], k), vis[i] && vis[i + 1]];
      };
      const drawTrail = (from, to, rgb) => {   // tapered trail ending at the head (index units)
        const dir = to > from ? 1 : -1, len = Math.abs(to - from);
        if (len < 0.5) return;
        const iEnd = dir > 0 ? Math.floor(to) : Math.ceil(to);
        for (let i = dir > 0 ? Math.ceil(from) : Math.floor(from); dir > 0 ? i < iEnd : i > iEnd; i += dir) {
          const j = i + dir;
          if (!vis[i] || !vis[j]) continue;
          const q = Math.abs(i - from) / len;
          ctx.strokeStyle = `rgba(${rgb},${(0.08 + 0.85 * q * q).toFixed(3)})`;
          ctx.lineWidth = (1 + 3.2 * q) * lw;
          ctx.beginPath(); ctx.moveTo(scr[i * 3], scr[i * 3 + 1]); ctx.lineTo(scr[j * 3], scr[j * 3 + 1]); ctx.stroke();
        }
      };
      const ripple = (x, y, k, size, alpha) => {
        if (k <= 0 || k >= 1) return;
        ctx.strokeStyle = `rgba(255,214,160,${(alpha * (1 - k) * (1 - k)).toFixed(3)})`;
        ctx.lineWidth = 2 * (1 - k) + 0.6;
        ctx.beginPath(); ctx.arc(x, y, 3 + size * ease.outCubic(k), 0, Math.PI * 2); ctx.stroke();
      };
      const heads = [], labels = [];
      const net = smooth((t - 8.7) / 0.7);     // afterglow: once everyone is home the whole network warms up
      let flownKm = 0;
      for (const r of routes) {
        const po = smooth((t - r.launch) / r.dur), pi = smooth((t - r.inLaunch) / r.durIn);
        flownKm += (po + pi) * r.d * EARTH_KM;
        if (po <= 0) continue;
        for (let i = 0; i < NS; i++) {
          proj(r.P[i * 3], r.P[i * 3 + 1], r.P[i * 3 + 2], tmp);
          scr[i * 3] = tmp[0]; scr[i * 3 + 1] = tmp[1];
          const X = (tmp[0] - CX) / R, Y = (tmp[1] - CY) / R;
          vis[i] = tmp[2] > 0 || X * X + Y * Y > 1 ? 1 : 0;   // hidden only when behind the sphere *and* inside its disc
        }
        const hi = po * (NS - 1), settle = smooth((t - r.land) / 1.2), end = Math.min(NS - 1, Math.ceil(hi));
        if (R > 900) strokeRun(0, end, `rgba(255,190,120,${(0.1 + 0.08 * net).toFixed(3)})`, 4);
        strokeRun(0, end, `rgba(255,214,170,${(0.55 - 0.1 * settle + 0.25 * net).toFixed(3)})`, R > 900 ? 1.5 : 0.95);
        if (po < 1) {
          drawTrail(Math.max(0, hi - 0.3 * (NS - 1)), hi, '255,200,130');
          const [hx, hy, hv] = pointAt(po);
          if (hv) heads.push([hx, hy, 1]);
        }
        const [dx, dy, dz] = proj(r.dest[0], r.dest[1], r.dest[2], [0, 0, 0]);
        const front = smooth(dz / 0.12);
        if (t > r.land && front > 0) {
          ripple(dx, dy, (t - r.land) / 1.1, 34 * lw, front);
          ctx.fillStyle = `rgba(255,220,170,${(0.85 * front).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(dx, dy, 2.6 * lw, 0, Math.PI * 2); ctx.fill();
          const la = smooth((t - r.land) / 0.3) * (1 - smooth((t - r.land - 1.7) / 0.6)) * front;
          if (la > 0) labels.push([r.name, dx, dy, la, r.side]);
        }
        if (pi > 0 && pi < 1) {                // the flight home
          const hiIn = (1 - pi) * (NS - 1);
          drawTrail(Math.min(NS - 1, hiIn + 0.3 * (NS - 1)), hiIn, '255,226,190');
          const [hx, hy, hv] = pointAt(1 - pi);
          if (hv) heads.push([hx, hy, 1.15]);
        }
      }
      for (const [x, y, k] of heads) {
        const s = 46 * k * lw;
        ctx.drawImage(headSprite, x - s / 2, y - s / 2, s, s);
        ctx.fillStyle = 'rgba(255,250,240,0.95)';
        ctx.beginPath(); ctx.arc(x, y, 2.4 * lw, 0, Math.PI * 2); ctx.fill();
      }
      // Seoul: launches and homecomings pulse here
      const [sx, sy] = proj(...unit(SEOUL[0], SEOUL[1]), [0, 0, 0]);
      let pulse = 0;
      for (const r of routes) {
        ripple(sx, sy, (t - r.launch) / 1.0, 26 * lw, 0.55);
        ripple(sx, sy, (t - r.inArrive) / 1.3, 70 * lw, 0.9);
        if (t > r.inArrive) pulse += Math.exp(-(t - r.inArrive) * 2.2);
      }
      const sv = smooth((t - 0.6) / 0.6), gs = (60 + 50 * Math.min(pulse, 3)) * lw;
      ctx.globalAlpha = Math.min(1, 0.7 * sv + 0.25 * pulse);
      ctx.drawImage(headSprite, sx - gs / 2, sy - gs / 2, gs, gs);
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(255,252,245,${sv.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(sx, sy, 3.6 * lw, 0, Math.PI * 2); ctx.fill();

      // ---- 8. labels ----
      ctx.globalCompositeOperation = 'source-over';
      ctx.textBaseline = 'middle';
      const label = (txt, x, y, a, size, weight) => {
        ctx.font = `${weight} ${size}px "Pretendard Variable", sans-serif`;
        ctx.fillStyle = `rgba(0,0,0,${(0.45 * a).toFixed(3)})`; ctx.fillText(txt, x + 1, y + 2);
        ctx.fillStyle = `rgba(255,240,222,${a.toFixed(3)})`; ctx.fillText(txt, x, y);
      };
      ctx.font = '600 26px "Pretendard Variable", sans-serif';
      for (const [name, x, y, a, side] of labels) {
        const w = ctx.measureText(name).width;
        const lx = side === 'left' || x + 14 + w > W - 28 ? x - 14 - w : x + 14;   // flip left near the right edge
        label(name, clamp(lx, 28, W - 28 - w), clamp(y - 16, 330, 1640), 0.92 * a, 26, 600);
      }
      {
        const fs = 30 + 12 * zoomK;
        ctx.font = `700 ${fs}px "Pretendard Variable", sans-serif`;
        label('서울', sx - 20 - 14 * zoomK - ctx.measureText('서울').width, sy + 24 * (1 - zoomK) - 8 * zoomK, sv, fs, 700);
      }

      // ---- 9. loop seam + counter ----
      const fo = fadeOut(t);
      if (fo > 0) { ctx.fillStyle = `rgba(2,4,10,${fo.toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
      hudBox.style.opacity = (smooth((t - 0.8) / 0.8) * (1 - fo)).toFixed(3);
      hudNum.textContent = Math.round(flownKm).toLocaleString('en-US');
    };
  },

  frame(t) { this.render(t); },
});
