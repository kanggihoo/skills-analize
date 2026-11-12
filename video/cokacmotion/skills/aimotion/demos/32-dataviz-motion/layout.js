/*
 * layout.js — the data (synthetic, "예시 데이터") and every layout computed once in setup():
 *   · monotone-cubic value curves per port (2014–2024) and the smoothed rank table for the bar race
 *   · the Sankey layout (d3.sankey) of the final year: port → trade lane
 *   · the East-Asia Mercator projection (d3.geoMercator().fitExtent) and a Dorling layout of the port
 *     bubbles (d3.forceSimulation run to rest synchronously) so neighbouring ports do not overlap
 * Pure: takes d3 and the topojson helpers as arguments (no DOM), so it can be checked in node too.
 */

export const YEAR0 = 2014, YEAR1 = 2024;

// value = container throughput in millions of TEU per year (synthetic but plausible; NOT official statistics)
// colours: the validated 8-slot categorical palette (dark-surface steps), fixed per entity, never per rank
export const PORTS = [
  { key: 'sha', name: '상하이', country: '중국', iso: '156', lon: 121.75, lat: 31.15, col: '#3987e5',
    v: [35.3, 36.5, 37.1, 40.2, 42.0, 43.3, 43.5, 47.0, 47.3, 49.2, 51.5] },
  { key: 'sin', name: '싱가포르', country: '싱가포르', iso: '702', lon: 103.80, lat: 1.26, col: '#d95926',
    v: [33.9, 30.9, 30.9, 33.7, 36.6, 37.2, 36.9, 37.5, 37.3, 39.0, 41.1] },
  { key: 'nin', name: '닝보·저우산', country: '중국', iso: '156', lon: 121.85, lat: 29.93, col: '#199e70',
    v: [19.5, 20.6, 21.6, 24.6, 26.4, 27.5, 28.7, 31.1, 33.4, 35.3, 39.3] },
  { key: 'shz', name: '선전', country: '중국', iso: '156', lon: 114.10, lat: 22.55, col: '#c98500',
    v: [24.0, 24.2, 24.0, 25.2, 27.7, 25.8, 26.6, 28.8, 30.0, 29.9, 33.4] },
  { key: 'qin', name: '칭다오', country: '중국', iso: '156', lon: 120.20, lat: 36.00, col: '#d55181',
    v: [16.6, 17.5, 18.0, 18.3, 19.3, 21.0, 22.0, 23.7, 25.7, 28.8, 30.9] },
  { key: 'kla', name: '포트클랑', country: '말레이시아', iso: '458', lon: 101.37, lat: 3.00, col: '#1f9a2e',
    v: [10.9, 11.9, 13.2, 12.0, 12.3, 13.6, 13.2, 13.7, 13.2, 14.1, 14.6] },
  { key: 'bus', name: '부산', country: '한국', iso: '410', lon: 129.05, lat: 35.08, col: '#9085e9',
    v: [18.7, 19.5, 19.4, 20.5, 21.7, 21.9, 21.8, 22.7, 22.1, 23.0, 24.4] },
  { key: 'hkg', name: '홍콩', country: '홍콩', iso: '344', lon: 114.12, lat: 22.35, col: '#e66767',
    v: [22.2, 20.1, 19.8, 20.8, 19.6, 18.4, 18.0, 17.8, 16.7, 14.4, 13.7] },
];

// trade lanes (Sankey targets) and each port's share of its boxes per lane (synthetic)
export const LANES = [
  { key: 'asia', name: '아시아 역내' },
  { key: 'na', name: '북미' },
  { key: 'eu', name: '유럽' },
  { key: 'etc', name: '중동·기타' },
];
export const SHARE = {
  sha: [0.38, 0.24, 0.22, 0.16],
  sin: [0.46, 0.06, 0.22, 0.26],
  nin: [0.32, 0.28, 0.24, 0.16],
  shz: [0.30, 0.32, 0.22, 0.16],
  qin: [0.40, 0.20, 0.18, 0.22],
  kla: [0.50, 0.06, 0.18, 0.26],
  bus: [0.44, 0.30, 0.12, 0.14],
  hkg: [0.52, 0.18, 0.16, 0.14],
};

// countries tinted on the map (choropleth of the ports' totals) and a few context labels
export const COUNTRY_LABELS = [
  ['중국', 109.0, 31.5], ['한국', 127.4, 38.0], ['일본', 133.2, 34.6], ['베트남', 106.9, 13.6], ['태국', 101.2, 15.6],
  ['필리핀', 122.4, 12.2], ['라오스', 103.0, 19.6], ['말레이시아', 113.6, 3.4], ['대만', 120.95, 23.1], ['미얀마', 96.4, 21.5],
];
// a main shipping lane through the ports (lon, lat), drawn faint with flowing dashes
export const ROUTE = [
  [95.0, 6.6], [98.4, 4.6], [100.6, 2.6], [102.6, 1.45], [103.8, 1.05], [104.9, 1.6], [106.8, 4.8], [109.6, 9.4],
  [111.6, 14.5], [113.6, 19.6], [114.6, 21.9], [117.6, 23.0], [119.8, 24.3], [121.7, 27.4], [122.7, 29.8],
  [122.9, 31.3], [123.6, 33.4], [125.3, 33.0], [127.6, 33.4], [128.9, 34.8], [130.6, 34.3], [133.0, 33.2], [137.0, 33.6],
];
export const ROUTE_QINGDAO = [[123.6, 33.4], [122.4, 35.3], [120.6, 35.9]];

/** Fritsch–Carlson monotone cubic through equally spaced samples ys[0..n-1]; returns f(x), x in [0, n-1] */
export function monotone(ys) {
  const n = ys.length, d = new Float64Array(n - 1), m = new Float64Array(n);
  for (let i = 0; i < n - 1; i++) d[i] = ys[i + 1] - ys[i];
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return (x) => {
    x = Math.max(0, Math.min(n - 1, x));
    const i = Math.min(n - 2, Math.floor(x)), u = x - i, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * m[i + 1];
  };
}

/**
 * Smoothed rank table: rank of every port sampled on a fine grid of t, then blurred in time with a Gaussian
 * (σ = sigma s), so a swap becomes a smooth glide of ~4σ around the instant the two values cross.
 */
export function rankTable({ valueAt, yearAt, n, t0, t1, dt = 1 / 240, sigma = 0.07 }) {
  const N = Math.ceil((t1 - t0) / dt) + 1;
  const raw = Array.from({ length: n }, () => new Float32Array(N));
  const vals = new Float64Array(n), idx = Array.from({ length: n }, (_, i) => i);
  for (let s = 0; s < N; s++) {
    const y = yearAt(t0 + s * dt);
    for (let i = 0; i < n; i++) vals[i] = valueAt(i, y);
    idx.sort((a, b) => vals[b] - vals[a] || a - b);
    idx.forEach((p, r) => { raw[p][s] = r; });
  }
  const R = Math.ceil(3 * sigma / dt), w = new Float64Array(2 * R + 1);
  let ws = 0;
  for (let k = -R; k <= R; k++) { w[k + R] = Math.exp(-0.5 * (k * dt / sigma) ** 2); ws += w[k + R]; }
  const sm = raw.map((row) => {
    const out = new Float32Array(N);
    for (let s = 0; s < N; s++) {
      let acc = 0;
      for (let k = -R; k <= R; k++) acc += w[k + R] * row[Math.max(0, Math.min(N - 1, s + k))];
      out[s] = acc / ws;
    }
    return out;
  });
  return (i, t) => {
    const f = (t - t0) / dt;
    if (f <= 0) return sm[i][0];
    if (f >= N - 1) return sm[i][N - 1];
    const s = Math.floor(f), k = f - s;
    return sm[i][s] * (1 - k) + sm[i][s + 1] * k;
  };
}

/** Sankey (port → lane) for the final year, ports kept in their final rank order so bars morph straight into nodes */
export function sankeyLayout(d3, { rankEnd, extent, nodeWidth = 18, nodePadding = 26 }) {
  const nodes = [
    ...PORTS.map((p, i) => ({ id: p.key, kind: 'port', i })),
    ...LANES.map((l, j) => ({ id: l.key, kind: 'lane', j })),
  ];
  const links = [];
  PORTS.forEach((p, i) => LANES.forEach((l, j) => links.push({ source: p.key, target: l.key, value: p.v[p.v.length - 1] * SHARE[p.key][j], i, j })));
  const sk = d3.sankey()
    .nodeId((d) => d.id)
    .nodeWidth(nodeWidth)
    .nodePadding(nodePadding)
    .nodeAlign(d3.sankeyJustify)
    .nodeSort((a, b) => (a.kind === 'port' ? rankEnd[a.i] - rankEnd[b.i] : a.j - b.j))
    .extent(extent)
    .iterations(32);
  return sk({ nodes, links });
}

/** East-Asia Mercator, fitted so every port sits inside `box`; clipped to the stage */
export function mapProjection(d3, { box, W, H }) {
  const frame = { type: 'MultiPoint', coordinates: [[99.0, 0.2], [131.0, 39.6]] };
  return d3.geoMercator().fitExtent(box, frame).clipExtent([[-40, -40], [W + 40, H + 40]]);
}

/** Dorling layout: bubbles pulled to their true positions, pushed apart by collision; kept inside `bounds` */
export function dorling(d3, { pts, bounds }) {
  const nodes = pts.map((p, i) => ({ i, x: p.x, y: p.y, tx: p.x, ty: p.y, r: p.r }));
  const sim = d3.forceSimulation(nodes)
    .force('x', d3.forceX((d) => d.tx).strength(0.12))
    .force('y', d3.forceY((d) => d.ty).strength(0.12))
    .force('collide', d3.forceCollide((d) => d.r + 7).strength(0.9).iterations(4))
    .stop();
  const [[x0, y0], [x1, y1]] = bounds;
  for (let k = 0; k < 420; k++) {
    sim.tick();
    for (const d of nodes) {
      d.x = Math.max(x0 + d.r, Math.min(x1 - d.r, d.x));
      d.y = Math.max(y0 + d.r, Math.min(y1 - d.r, d.y));
    }
  }
  return nodes;
}
