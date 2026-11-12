/*
 * 32 · 숫자가 움직일 때 — one data story, three views, the same eight objects throughout.
 *
 *  1 · 순위  a bar-chart race of container throughput 2014 → 2024 (synthetic "예시 데이터"). Values follow monotone
 *            cubic curves through the yearly samples, the x scale is re-fitted to the leader every frame (ticks slide
 *            and fade at the edge), ranks glide: the rank of every port is sampled on a fine grid and blurred in time,
 *            so a swap is a smooth exchange of places centred on the moment the two values cross.
 *  2 · 흐름  each bar becomes its node in a d3.sankey layout (port → trade lane) — d3.interpolateObject between the
 *            two rectangles — and the ribbons (d3.sankeyLinkHorizontal) grow along their own arc length.
 *  3 · 지도  the nodes fly to their ports on a d3-geo Mercator map of East Asia (world-atlas 50m, topojson), morphing
 *            from rectangle to circle (corner radius → r); circles are area-proportional and laid out Dorling-style
 *            (d3.forceSimulation run to rest in setup); countries are tinted by their ports' total (choropleth).
 *
 * Every interpolator is evaluated at an eased progress computed from t — no d3.transition, no d3.timer — so any
 * frame can be drawn on its own. Everything heavy (layouts, projection, the map raster) happens once in setup().
 */
import { defineDemo, rand, clamp, lerp, smooth, ramp, ease } from '../_lib/stage.js';
import { feature, mesh } from 'topojson-client';
import {
  PORTS, LANES, YEAR0, YEAR1, COUNTRY_LABELS, ROUTE, ROUTE_QINGDAO,
  monotone, rankTable, sankeyLayout, mapProjection, dorling,
} from './layout.js';

const d3 = window.d3;   // UMD build (+ d3-sankey) loaded by index.html

const D = 10;
const FONT = '"Pretendard Variable", Pretendard, sans-serif';
const T = {
  grow0: 0.2,            // bars grow in
  race0: 0.95, race1: 3.85,   // 2014 → 2024
  morph0: 4.45,          // bars → Sankey nodes
  link0: 5.1,            // ribbons grow
  map0: 6.85,            // nodes fly to the map
  end0: 9.62,            // fade (the player loops)
};
const N = PORTS.length;
const X0 = 72, MAXW = 740, BAR_TOP = 424, PITCH = 136, BAR_H = 96;   // bar race geometry
const SK_EXTENT = [[300, 400], [838, 1480]];                          // Sankey
const MAP_BOX = [[70, 380], [1010, 1370]];                             // where the ports must fall on the map
const MC = [540, 875];                                                 // centre of the map's settle zoom
const RM = 70;                                                         // bubble radius of the largest port
const INK = '#f0efec', INK2 = '#c3c2b7', MUTED = '#8b909a', BG = '#090c12';
const SEA = '#0a1019';
const inkToMuted = d3.interpolateRgb(INK, INK2);
const yearAt = (t) => YEAR0 + (YEAR1 - YEAR0) * d3.easeSinInOut(clamp((t - T.race0) / (T.race1 - T.race0)));
const font = (w, s) => `${w} ${Math.round(s * 2) / 2}px ${FONT}`;

// ------------------------------------------------------------------ text helpers (tabular figures in Canvas 2D)
// Canvas has no font-variant-numeric, so digits are laid out in fixed slots of the widest digit: counters that
// change every frame never jitter sideways.
const wcache = new Map();
function charW(ctx, ch) {
  const k = ctx.font + '|' + ch;
  let w = wcache.get(k);
  if (w === undefined) { w = ctx.measureText(ch).width; wcache.set(k, w); }
  return w;
}
function digitW(ctx) {
  const k = ctx.font + '|#';
  let w = wcache.get(k);
  if (w === undefined) { w = 0; for (const c of '0123456789') w = Math.max(w, ctx.measureText(c).width); wcache.set(k, w); }
  return w;
}
const isDigit = (c) => c >= '0' && c <= '9';
function numW(ctx, s) {
  const dw = digitW(ctx);
  let w = 0;
  for (const c of s) w += isDigit(c) ? dw : charW(ctx, c);
  return w;
}
function drawNum(ctx, s, x, y, align = 'left') {
  const dw = digitW(ctx), w = numW(ctx, s);
  let cx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  ctx.textAlign = 'left';
  for (const c of s) {
    const cw = charW(ctx, c);
    if (isDigit(c)) { ctx.fillText(c, cx + (dw - cw) / 2, y); cx += dw; } else { ctx.fillText(c, cx, y); cx += cw; }
  }
  return w;
}
/** odometer: each place rolls to the next digit; higher places roll only while every lower digit is a 9 passing to 0 */
function drawOdometer(ctx, value, places, xRight, y, size, roll) {
  const dw = digitW(ctx), lh = size * 0.92;
  ctx.save();
  ctx.beginPath(); ctx.rect(xRight - places * dw - 4, y - size * 0.82, places * dw + 8, size * 0.94); ctx.clip();
  ctx.textAlign = 'left';
  const f0 = roll(value - Math.floor(value));
  for (let p = 0; p < places; p++) {
    const q = Math.floor(value / 10 ** p), d = q % 10;
    const lower = Math.floor(value) % 10 ** p;
    const f = p === 0 ? f0 : lower === 10 ** p - 1 ? f0 : 0;
    const x = xRight - (p + 1) * dw;
    for (const [dd, yy] of [[d, y - f * lh], [(d + 1) % 10, y + (1 - f) * lh]]) {
      if (yy > y + lh * 0.99 || yy < y - lh * 0.99) continue;
      const c = String(dd);
      ctx.fillText(c, x + (dw - charW(ctx, c)) / 2, yy);
    }
  }
  ctx.restore();
}
const fmt = d3.format(',');
/** millions of TEU → Korean 만/억 reading: 51.5 → "5,150만", 248.9 → "2억 4,890만" */
function man(v, withUnit = true) {
  const n = Math.round(v * 100);
  if (n >= 10000) {
    const e = Math.floor(n / 10000), r = n % 10000;
    return r ? `${e}억 ${fmt(r)}${withUnit ? '만' : ''}` : `${e}억`;
  }
  return fmt(n) + (withUnit ? '만' : '');
}

/** rectangle with separate left/right corner radii (bar: square baseline, round data end) */
function rrect(ctx, x, y, w, h, rl, rr) {
  const m = Math.max(0, Math.min(w, h) / 2);
  rl = Math.min(rl, m); rr = Math.min(rr, m);
  ctx.beginPath();
  ctx.moveTo(x + rl, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arc(x + w - rr, y + rr, rr, -Math.PI / 2, 0);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arc(x + w - rr, y + h - rr, rr, 0, Math.PI / 2);
  ctx.lineTo(x + rl, y + h);
  ctx.arc(x + rl, y + h - rl, rl, Math.PI / 2, Math.PI);
  ctx.lineTo(x, y + rl);
  ctx.arc(x + rl, y + rl, rl, Math.PI, Math.PI * 1.5);
  ctx.closePath();
}

defineDemo({
  id: '32-dataviz-motion',
  title: '숫자가 움직일 때',
  tech: 'd3 · 데이터 전환 애니메이션 (막대 순위 → 산키 → 지도)',
  duration: D,
  background: BG,

  async setup({ canvas, W, H, headless }) {
    const world = await (await fetch('../node_modules/world-atlas/countries-50m.json')).json();

    // ---------------------------------------------------------------- data → curves, ranks
    const curve = PORTS.map((p) => monotone(p.v));
    const valueAt = (i, year) => curve[i](year - YEAR0);
    const rankOf = rankTable({ valueAt, yearAt, n: N, t0: T.race0 - 0.6, t1: T.race1 + 0.6 });
    const rank0 = PORTS.map((_, i) => Math.round(rankOf(i, 0)));
    const rankEnd = PORTS.map((_, i) => Math.round(rankOf(i, D)));
    const vEnd = PORTS.map((p) => p.v[p.v.length - 1]);
    const vMaxEnd = Math.max(...vEnd);
    const vMax0 = Math.max(...PORTS.map((p) => p.v[0]));
    const total0 = d3.sum(PORTS, (p) => p.v[0]), totalEnd = d3.sum(vEnd);

    // ---------------------------------------------------------------- Sankey (final year)
    const graph = sankeyLayout(d3, { rankEnd, extent: SK_EXTENT });
    const portNode = PORTS.map((p) => graph.nodes.find((n) => n.id === p.key));
    const laneNode = LANES.map((l) => graph.nodes.find((n) => n.id === l.key));
    const linkPath = d3.sankeyLinkHorizontal();
    const lr = rand(32);
    const links = graph.links.map((L) => {
      const i = L.source.i, j = L.target.j;
      const x0 = L.source.x1, y0 = L.y0, x1 = L.target.x0, y1 = L.y1, xm = (x0 + x1) / 2;
      // the bump curve d3.linkHorizontal draws: (x0,y0) → C(xm,y0) (xm,y1) → (x1,y1); arc-length table for dashes/particles
      const bez = (u) => {
        const a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, d = u ** 3;
        return [a * x0 + b * xm + c * xm + d * x1, a * y0 + b * y0 + c * y1 + d * y1];
      };
      const S = 64, us = new Float64Array(S + 1), ls = new Float64Array(S + 1);
      let prev = bez(0), len = 0;
      for (let k = 1; k <= S; k++) { const u = k / S, p = bez(u); len += Math.hypot(p[0] - prev[0], p[1] - prev[1]); us[k] = u; ls[k] = len; prev = p; }
      const at = (s) => {   // arc-length fraction → point + unit normal
        const target = clamp(s) * len;
        let k = 1;
        while (k < S && ls[k] < target) k++;
        const f = (target - ls[k - 1]) / Math.max(1e-9, ls[k] - ls[k - 1]);
        const u = lerp(us[k - 1], us[k], f), p = bez(u), q = bez(Math.min(1, u + 1e-3)), r0 = bez(Math.max(0, u - 1e-3));
        const tx = q[0] - r0[0], ty = q[1] - r0[1], tl = Math.hypot(tx, ty) || 1;
        return [p[0], p[1], -ty / tl, tx / tl];
      };
      const col = PORTS[i].col;
      const parts = Array.from({ length: Math.max(2, Math.round(L.width / 9)) }, () => ({
        phase: lr(), lat: (lr() - 0.5) * 0.8, size: 1.3 + lr() * 1.6, speed: 0.42 + lr() * 0.22,
      }));
      return {
        i, j, value: L.value, width: L.width, len, at, parts, y1, x1,
        path: new Path2D(linkPath(L)),
        start: T.link0 + 0.06 * rankEnd[i] + 0.05 * j,
        col, glow: d3.color(col).brighter(0.9).formatHex(),
      };
    });

    // ---------------------------------------------------------------- map: projection, Dorling bubbles, raster
    const projection = mapProjection(d3, { box: MAP_BOX, W, H });
    const geoPath = d3.geoPath(projection);
    const countries = feature(world, world.objects.countries).features;
    const land = feature(world, world.objects.land);
    const borders = mesh(world, world.objects.countries, (a, b) => a !== b);
    const graticule = d3.geoGraticule().step([5, 5]).extent([[60, -40], [170, 70]])();
    const radius = (v) => RM * Math.sqrt(v / vMaxEnd);                // area ∝ value
    const truePos = PORTS.map((p) => projection([p.lon, p.lat]));
    const bub = dorling(d3, { pts: truePos.map(([x, y], i) => ({ x, y, r: radius(vEnd[i]) })), bounds: [[40, 372], [1040, 1408]] });
    // choropleth: total throughput of each country's ports (sequential, one hue, log-scaled)
    const totals = d3.rollup(PORTS.map((p, i) => [p.iso, vEnd[i]]), (a) => d3.sum(a, (d) => d[1]), (d) => d[0]);
    const seq = d3.scaleSequentialLog([10, 160], d3.interpolateRgb('#1c2531', '#5a7799'));
    const tinted = countries.filter((f) => totals.has(f.id)).map((f) => ({
      path: new Path2D(geoPath(f)), fill: seq(totals.get(f.id)), id: f.id,
    }));
    const route = [ROUTE, ROUTE_QINGDAO].map((line) => {
      const p = new Path2D();
      d3.line().curve(d3.curveCatmullRom.alpha(0.5)).context(p)(line.map((c) => projection(c)));
      return p;
    });
    // context labels that would sit under a bubble are dropped
    const labels = COUNTRY_LABELS.map(([name, lon, lat]) => ({ name, xy: projection([lon, lat]) }))
      .filter(({ xy: [x, y] }) => x > 40 && x < W - 40 && y > 380 && y < 1400 &&
        bub.every((b) => Math.hypot(b.x - x, b.y - y) > b.r + 34));
    // where each bubble's own label goes when it is too small to hold it: the first free side
    const bubLabel = bub.map((b, i) => {
      if (b.r >= 46) return { inside: true };
      const cand = [[0, b.r + 30, 'center'], [0, -b.r - 34, 'center'], [b.r + 14, 6, 'left'], [-b.r - 14, 6, 'right']];
      for (const [dx, dy, align] of cand) {
        const w = 120, cx = b.x + dx + (align === 'left' ? w / 2 : align === 'right' ? -w / 2 : 0), cy = b.y + dy;
        const free = bub.every((o, k) => k === i || (Math.abs(o.x - cx) > o.r + w / 2 || Math.abs(o.y - cy) > o.r + 26));
        if (free) return { inside: false, dx, dy, align };
      }
      return { inside: false, dx: 0, dy: b.r + 30, align: 'center' };
    });

    // the map, painted once (it only ever moves by a uniform zoom)
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = W; mapCanvas.height = H;
    {
      const g = mapCanvas.getContext('2d');
      const sea = g.createRadialGradient(560, 820, 80, 560, 900, 1300);
      sea.addColorStop(0, '#0f1a29'); sea.addColorStop(0.55, SEA); sea.addColorStop(1, '#06090e');
      g.fillStyle = sea; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(140,175,215,0.07)'; g.lineWidth = 1;
      g.stroke(new Path2D(geoPath(graticule)));
      const landP = new Path2D(geoPath(land));
      const lg = g.createLinearGradient(0, 300, 0, 1500);
      lg.addColorStop(0, '#18202c'); lg.addColorStop(1, '#131a24');
      g.fillStyle = lg; g.fill(landP);
      g.save(); g.lineJoin = 'round';
      g.strokeStyle = 'rgba(110,160,215,0.06)'; g.lineWidth = 7; g.stroke(landP);    // soft coastal glow
      g.strokeStyle = 'rgba(120,170,225,0.12)'; g.lineWidth = 3; g.stroke(landP);
      g.strokeStyle = 'rgba(170,200,235,0.42)'; g.lineWidth = 1; g.stroke(landP);
      g.setLineDash([3, 4]);
      g.strokeStyle = 'rgba(170,190,215,0.20)'; g.lineWidth = 1; g.stroke(new Path2D(geoPath(borders)));
      g.restore();
    }

    // ---------------------------------------------------------------- canvases
    const bg = canvas({ type: '2d', z: 0 }).ctx;
    const ctx = canvas({ type: '2d', z: 1, attrs: headless ? { willReadFrequently: true } : undefined }).ctx;
    {
      bg.fillStyle = BG; bg.fillRect(0, 0, W, H);
      const glow = bg.createRadialGradient(540, 260, 0, 540, 260, 1300);
      glow.addColorStop(0, 'rgba(46,62,92,0.55)'); glow.addColorStop(0.5, 'rgba(22,30,46,0.35)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
      bg.fillStyle = glow; bg.fillRect(0, 0, W, H);
      bg.fillStyle = 'rgba(150,170,200,0.06)';                // a quiet dot grid, the chart's paper
      for (let y = 18; y < H; y += 36) for (let x = 18; x < W; x += 36) bg.fillRect(x - 1, y - 1, 2, 2);
      const gr = rand(7);                                     // fine grain
      for (let k = 0; k < 9000; k++) {
        bg.fillStyle = gr() < 0.5 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.05)';
        bg.fillRect(gr() * W, gr() * H, 1.5, 1.5);
      }
      const vig = bg.createRadialGradient(540, 900, 500, 540, 960, 1250);
      vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.5)');
      bg.fillStyle = vig; bg.fillRect(0, 0, W, H);
    }

    // ---------------------------------------------------------------- per-port interpolators (object constancy)
    const barEnd = PORTS.map((_, i) => ({ x: X0, y: BAR_TOP + rankEnd[i] * PITCH, w: (vEnd[i] / vMaxEnd) * MAXW, h: BAR_H, rl: 1, rr: 7 }));
    const nodeRect = portNode.map((n) => ({ x: n.x0, y: n.y0, w: n.x1 - n.x0, h: n.y1 - n.y0, rl: 3, rr: 3 }));
    const barToNode = PORTS.map((_, i) => d3.interpolateObject(barEnd[i], nodeRect[i]));
    const dark = PORTS.map((p) => d3.interpolateRgb(p.col, '#0b0f16')(0.5));
    const toFlat = PORTS.map((p, i) => d3.interpolateRgb(dark[i], p.col));   // bar gradient root → flat node colour
    const hi = PORTS.map((p) => d3.interpolateRgb(p.col, '#ffffff')(0.45));
    const order = d3.range(N).sort((a, b) => rankEnd[a] - rankEnd[b]);
    const drawOrderBubbles = d3.range(N).sort((a, b) => vEnd[b] - vEnd[a]);   // big first, small on top

    const climbers = d3.range(N).map((i) => ({ i, d: rank0[i] - rankEnd[i] })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d) || b.d - a.d);
    const up = climbers.filter((c) => c.d > 0).sort((a, b) => b.d - a.d)[0], down = climbers.filter((c) => c.d < 0).sort((a, b) => a.d - b.d)[0];

    // ================================================================== frame
    this.render = (t) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      ctx.textBaseline = 'alphabetic';

      // ----- shared timing
      const pm = PORTS.map((_, i) => ease.inOutCubic(clamp((t - T.morph0 - 0.035 * rankEnd[i]) / 0.62)));
      const pf = PORTS.map((_, i) => ease.inOutCubic(clamp((t - (T.map0 + 0.12) - 0.075 * rankEnd[i]) / 0.95)));
      const mapP = ease.inOutCubic(clamp((t - T.map0) / 1.6));
      const ms = lerp(1.075, 1, mapP);                                      // map settle zoom
      const toMap = (x, y) => [MC[0] + (x - MC[0]) * ms, MC[1] + (y - MC[1]) * ms];
      const linkFade = 1 - ramp(t, T.map0, T.map0 + 0.6);

      // ================= 3 · the map (beneath everything)
      const mapA = ramp(t, T.map0 + 0.05, T.map0 + 1.0);
      if (mapA > 0) {
        ctx.save();
        ctx.globalAlpha = mapA;
        ctx.setTransform(ms, 0, 0, ms, MC[0] * (1 - ms), MC[1] * (1 - ms));
        ctx.drawImage(mapCanvas, 0, 0);
        const ca = ramp(t, 7.55, 8.4);
        if (ca > 0) {
          for (const c of tinted) {
            ctx.globalAlpha = mapA * ca * 0.9; ctx.fillStyle = c.fill; ctx.fill(c.path);
            ctx.globalAlpha = mapA * ca; ctx.strokeStyle = 'rgba(190,215,245,0.45)'; ctx.lineWidth = 1.2 / ms; ctx.stroke(c.path);
          }
        }
        const ra = ramp(t, 7.9, 8.7);   // the main shipping lane, dashes flowing north-east
        if (ra > 0) {
          ctx.globalAlpha = mapA * ra * 0.5;
          ctx.setLineDash([2, 9]); ctx.lineDashOffset = -t * 26; ctx.lineCap = 'round';
          ctx.strokeStyle = '#9fc3ea'; ctx.lineWidth = 2.2;
          for (const p of route) ctx.stroke(p);
          ctx.setLineDash([]); ctx.lineCap = 'butt';
        }
        const la = ramp(t, 7.7, 8.5);
        if (la > 0) {
          ctx.font = font(600, 22); ctx.textAlign = 'center';
          if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
          for (const l of labels) {
            ctx.globalAlpha = mapA * la * 0.62; ctx.fillStyle = '#a7b3c4';
            ctx.fillText(l.name, l.xy[0], l.xy[1]);
          }
          if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
          // direct label for the choropleth's darkest country instead of a legend
          const cn = labels.find((l) => l.name === '중국');
          if (cn) {
            ctx.globalAlpha = mapA * la * 0.75; ctx.font = font(500, 19); ctx.fillStyle = '#93a9c6';
            ctx.fillText(`4개 항만 합계 ${man(totals.get('156'))}`, cn.xy[0], cn.xy[1] + 28);
          }
        }
        ctx.restore();
        // shade under the header and under the lower third, so text over the map stays legible
        const top = ctx.createLinearGradient(0, 0, 0, 420);
        top.addColorStop(0, 'rgba(9,12,18,0.92)'); top.addColorStop(0.6, 'rgba(9,12,18,0.55)'); top.addColorStop(1, 'rgba(9,12,18,0)');
        const bot = ctx.createLinearGradient(0, 1380, 0, 1720);
        bot.addColorStop(0, 'rgba(9,12,18,0)'); bot.addColorStop(0.45, 'rgba(9,12,18,0.82)'); bot.addColorStop(1, 'rgba(9,12,18,0.95)');
        ctx.globalAlpha = mapA;
        ctx.fillStyle = top; ctx.fillRect(0, 0, W, 420);
        ctx.fillStyle = bot; ctx.fillRect(0, 1380, W, H - 1380);
        ctx.globalAlpha = 1;
      }

      // ================= 1 · axis, year (bar race)
      const axisA = ramp(t, 0.15, 0.6) * (1 - ramp(t, T.morph0 - 0.05, T.morph0 + 0.3));
      const year = yearAt(t);
      const vNow = PORTS.map((_, i) => valueAt(i, year));
      const grow = PORTS.map((_, i) => ease.outCubic(clamp((t - T.grow0 - 0.055 * rank0[i]) / 0.7)));
      const M = t < T.race0 ? vMax0 : Math.max(...vNow);                 // x domain follows the leader
      const xOf = (v) => X0 + (v / M) * MAXW;
      if (axisA > 0) {
        ctx.font = font(500, 20);
        for (let k = 1; k <= 6; k++) {
          const x = xOf(k * 10);
          const a = axisA * clamp((X0 + MAXW + 60 - x) / 70) * clamp((x - X0 - 30) / 40);
          if (a <= 0) continue;
          ctx.globalAlpha = a;
          ctx.fillStyle = 'rgba(160,175,200,0.16)'; ctx.fillRect(Math.round(x), 404, 1, BAR_TOP + 7 * PITCH + BAR_H - 404 + 6);
          ctx.fillStyle = MUTED; drawNum(ctx, `${fmt(k * 1000)}만`, x, 392, 'center');
        }
        ctx.globalAlpha = axisA;
        ctx.fillStyle = 'rgba(200,210,225,0.45)'; ctx.fillRect(X0 - 1, 404, 2, BAR_TOP + 7 * PITCH + BAR_H - 404 + 6);
        // the year, rolling like an odometer (whole years, a quick roll at each half-year)
        const ya = axisA * ramp(t, 0.3, 0.8);
        ctx.globalAlpha = ya * 0.2; ctx.fillStyle = INK; ctx.font = font(800, 168);
        drawOdometer(ctx, year + 0.58, 4, 1010, 1640, 168, (f) => ease.inOutCubic(clamp((f - 0.82) / 0.18)));
        ctx.globalAlpha = 1;
      }
      // the race's story in one line each, once the clock stops
      const noteA = ramp(t, T.race1 - 0.05, T.race1 + 0.3) * (1 - ramp(t, T.morph0 + 0.05, T.morph0 + 0.35));
      if (noteA > 0 && up && down) {
        let y = 1548;
        for (const c of [up, down]) {
          const p = PORTS[c.i];
          ctx.globalAlpha = noteA;
          ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(X0 + 8, y - 9, 8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = INK; ctx.font = font(700, 28); ctx.textAlign = 'left';
          ctx.fillText(p.name, X0 + 28, y);
          const nw = ctx.measureText(p.name).width;
          ctx.fillStyle = INK2; ctx.font = font(500, 28);
          ctx.fillText(`${rank0[c.i] + 1}위 → ${rankEnd[c.i] + 1}위 ${c.d > 0 ? '▲' : '▼'}`, X0 + 40 + nw, y);
          y += 46;
        }
        ctx.globalAlpha = 1;
      }

      // ================= 2 · Sankey ribbons and lanes (beneath the port nodes)
      const secA = linkFade;
      if (t >= T.link0 && secA > 0) {
        // ribbons: dashed along their own arc length, so each grows like ink flowing down the curve
        for (const L of links) {
          const p = ease.inOutCubic(clamp((t - L.start) / 0.62));
          if (p <= 0) continue;
          ctx.globalAlpha = 0.5 * secA;
          ctx.strokeStyle = L.col; ctx.lineWidth = Math.max(1, L.width - 1.5);
          if (p < 1) { ctx.setLineDash([p * L.len, L.len + 10]); ctx.lineDashOffset = 0; }
          ctx.stroke(L.path);
          if (p < 1) ctx.setLineDash([]);
        }
        ctx.globalCompositeOperation = 'lighter';
        for (const L of links) {
          const p = ease.inOutCubic(clamp((t - L.start) / 0.62));
          if (p > 0 && p < 1) {                     // a light at the growing front
            const [x, y] = L.at(p), r = L.width / 2 + 16, a = 0.55 * Math.sin(Math.PI * p) * secA;
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, L.glow); g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
          }
          const fa = ramp(t, L.start + 0.55, L.start + 0.95) * secA;   // then the boxes keep flowing
          if (fa > 0) {
            ctx.fillStyle = L.glow;
            for (const q of L.parts) {
              const s = (q.phase + (t - T.link0) * q.speed) % 1;
              const [x, y, nx, ny] = L.at(s), off = q.lat * L.width;
              ctx.globalAlpha = fa * 0.75 * Math.sin(Math.PI * s);
              ctx.beginPath(); ctx.arc(x + nx * off, y + ny * off, q.size, 0, Math.PI * 2); ctx.fill();
            }
          }
        }
        ctx.globalCompositeOperation = 'source-over';
        // lane nodes: filled segment by segment as the ribbons arrive; counters add up what has arrived
        LANES.forEach((lane, j) => {
          const n = laneNode[j];
          let sum = 0, first = Infinity;
          for (const L of links) if (L.j === j) {
            const p = ease.inOutCubic(clamp((t - L.start) / 0.62));
            sum += L.value * p; first = Math.min(first, L.start + 0.45);
            const a = ramp(t, L.start + 0.5, L.start + 0.7);
            if (a > 0) {
              ctx.globalAlpha = a * secA; ctx.fillStyle = L.col;
              ctx.fillRect(n.x0, L.y1 - L.width / 2, n.x1 - n.x0, L.width);
            }
          }
          const la = ramp(t, first, first + 0.3) * secA;
          if (la <= 0) return;
          ctx.globalAlpha = la;
          ctx.strokeStyle = 'rgba(235,240,248,0.55)'; ctx.lineWidth = 1.2;
          ctx.strokeRect(n.x0 - 0.5, n.y0 - 0.5, n.x1 - n.x0 + 1, n.y1 - n.y0 + 1);
          const cy = (n.y0 + n.y1) / 2;
          ctx.fillStyle = INK; ctx.font = font(800, 28); ctx.textAlign = 'left';
          ctx.fillText(lane.name, n.x1 + 16, cy - 4);
          ctx.fillStyle = INK2; ctx.font = font(600, 24);
          drawNum(ctx, man(sum), n.x1 + 16, cy + 26);
        });
        // column heads
        const ha = ramp(t, T.link0, T.link0 + 0.4) * secA;
        if (ha > 0) {
          ctx.globalAlpha = ha * 0.8; ctx.fillStyle = MUTED; ctx.font = font(600, 20);
          if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
          ctx.textAlign = 'right'; ctx.fillText('항만 · 2024년', SK_EXTENT[0][0] + 18, 378);
          ctx.textAlign = 'left'; ctx.fillText('항로', SK_EXTENT[1][0] - 18, 378);
          if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
        }
        ctx.globalAlpha = 1;
      }

      // ================= the eight objects: bar → node → bubble
      // leader lines + true positions first (under the bubbles)
      const landed = PORTS.map((_, i) => ramp(t, T.map0 + 0.12 + 0.075 * rankEnd[i] + 0.9, T.map0 + 0.12 + 0.075 * rankEnd[i] + 1.3));
      for (let i = 0; i < N; i++) {
        if (landed[i] <= 0) continue;
        const b = bub[i], [bx, by] = toMap(b.x, b.y), [tx, ty] = toMap(b.tx, b.ty), r = b.r * ms;
        const d = Math.hypot(tx - bx, ty - by);
        if (d < r + 4) continue;
        const ex = bx + (tx - bx) / d * r, ey = by + (ty - by) / d * r;
        ctx.globalAlpha = landed[i];
        ctx.strokeStyle = 'rgba(225,232,242,0.7)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(lerp(ex, tx, landed[i]), lerp(ey, ty, landed[i])); ctx.stroke();
        ctx.fillStyle = '#0b0f16'; ctx.beginPath(); ctx.arc(tx, ty, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(tx, ty, 3.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      const seq8 = t >= T.map0 ? drawOrderBubbles : order;
      for (const i of seq8) {
        const p = PORTS[i];
        let x, y, w, h, rl, rr, labelMode;
        const g0 = t < T.race0 ? grow[i] : 1;
        if (t < T.morph0) {                                       // ---- bar
          const v = (t < T.race0 ? p.v[0] : vNow[i]) * g0;
          const rk = rankOf(i, t);
          x = X0; y = BAR_TOP + rk * PITCH; w = Math.max(0, xOf(v) - X0); h = BAR_H; rl = 1; rr = 7;
          labelMode = 'bar';
        } else if (pf[i] <= 0) {                                  // ---- bar → node
          const r = barToNode[i](pm[i]);
          ({ x, y, w, h, rl, rr } = r);
          labelMode = 'node';
        } else {                                                   // ---- node → bubble
          const n = nodeRect[i], b = bub[i], k = pf[i];
          const [ex, ey] = toMap(b.x, b.y), R = b.r * ms;
          const sx = n.x + n.w / 2, sy = n.y + n.h / 2;
          const dx = ex - sx, dy = ey - sy, dist = Math.hypot(dx, dy) || 1;
          const cx = (sx + ex) / 2 - dy / dist * dist * 0.2, cy = (sy + ey) / 2 + dx / dist * dist * 0.2;
          const mx = (1 - k) * (1 - k) * sx + 2 * (1 - k) * k * cx + k * k * ex;   // along a gentle arc
          const my = (1 - k) * (1 - k) * sy + 2 * (1 - k) * k * cy + k * k * ey;
          w = lerp(n.w, 2 * R, k); h = lerp(n.h, 2 * R, k);
          x = mx - w / 2; y = my - h / 2; rl = rr = lerp(3, R, k);
          labelMode = 'fly';
        }
        if (w < 0.5) continue;
        const k = pf[i];
        // glow under the shape (bubbles bloom as they land)
        if (k > 0) {
          const cx = x + w / 2, cy = y + h / 2, gr = Math.max(w, h) * 0.95;
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
          g.addColorStop(0, p.col); g.addColorStop(1, 'rgba(0,0,0,0)');
          const breath = 1 + 0.3 * landed[i] * Math.sin(2 * Math.PI * (0.55 * t + i / N));
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.22 * k * breath;
          ctx.fillStyle = g; ctx.fillRect(cx - gr, cy - gr, 2 * gr, 2 * gr);
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        }
        // fill: a bar's gradient (dark at the baseline) flattens into the node, then gains a lit sphere-ish shading
        let fill;
        if (k > 0) {
          const cx = x + w * 0.36, cy = y + h * 0.3;
          fill = ctx.createRadialGradient(cx, cy, 0, x + w / 2, y + h / 2, Math.max(w, h) * 0.62);
          fill.addColorStop(0, d3.interpolateRgb(p.col, hi[i])(k)); fill.addColorStop(0.65, p.col); fill.addColorStop(1, d3.interpolateRgb(p.col, dark[i])(0.45 * k));
        } else {
          fill = ctx.createLinearGradient(x, 0, x + w, 0);
          fill.addColorStop(0, toFlat[i](labelMode === 'bar' ? 0 : pm[i])); fill.addColorStop(1, p.col);
        }
        rrect(ctx, x, y, w, h, rl, rr);
        ctx.fillStyle = fill; ctx.fill();
        if (k > 0) { ctx.strokeStyle = BG; ctx.globalAlpha = 0.9 * k; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1; }
        const barA = labelMode === 'bar' ? clamp(g0 * 2) : labelMode === 'node' ? 1 - pm[i] : 0;
        if (barA > 0) {
          // a light at the data end + a hairline highlight on the top edge
          ctx.globalCompositeOperation = 'lighter';
          const ex = x + w, ey = y + h / 2, gr = 46;
          const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, gr);
          g.addColorStop(0, hi[i]); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalAlpha = 0.3 * barA; ctx.fillStyle = g; ctx.fillRect(ex - gr, ey - gr, 2 * gr, 2 * gr);
          ctx.globalAlpha = 0.22 * barA; ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 2, y, Math.max(0, w - 9), 1.5);
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        }

        // ---- labels
        const nn = portNode[i], ncy = (nn.y0 + nn.y1) / 2, nRight = nn.x0 - 18;
        if (labelMode === 'bar' || labelMode === 'node') {
          const m = labelMode === 'bar' ? 0 : pm[i];
          const a = labelMode === 'bar' ? clamp(g0 * 3) : 1;
          // name: inside the bar at its root → right-aligned left of the node
          // (in 'bar' mode x, y, w are the live bar; in 'node' mode the label starts from the final bar)
          const B = labelMode === 'bar' ? { x, y, w } : barEnd[i];
          ctx.font = font(800, lerp(30, 28, m));
          const nw = ctx.measureText(p.name).width;
          const nx = lerp(B.x + 22, nRight - nw, m), ny = lerp(B.y + 46, ncy - 3, m);
          if (labelMode === 'bar' && t < T.race0) { ctx.save(); rrect(ctx, x, y, w, h, rl, rr); ctx.clip(); }
          ctx.globalAlpha = a; ctx.fillStyle = INK; ctx.textAlign = 'left';
          ctx.fillText(p.name, nx, ny);
          if (p.country !== p.name && m < 1) {
            ctx.globalAlpha = a * 0.72 * (1 - smooth(m * 3)); ctx.font = font(500, 20); ctx.fillStyle = INK;
            ctx.fillText(p.country, nx, ny + 30);
          }
          if (labelMode === 'bar' && t < T.race0) ctx.restore();
          // value: just past the data end → under the name
          const v = labelMode === 'bar' ? (t < T.race0 ? p.v[0] * g0 : vNow[i]) : vEnd[i];
          const s = man(v, false);
          ctx.font = font(700, lerp(34, 24, m));
          const sw = numW(ctx, s);
          ctx.font = font(600, lerp(22, 20, m));
          const uw = charW(ctx, '만');
          const vx = lerp(B.x + B.w + 16, nRight - sw - uw - 3, m);
          const vy = lerp(B.y + 60, ncy + 25, m);
          ctx.globalAlpha = a;
          ctx.font = font(700, lerp(34, 24, m)); ctx.fillStyle = inkToMuted(m);
          drawNum(ctx, s, vx, vy);
          ctx.font = font(600, lerp(22, 20, m)); ctx.fillStyle = MUTED;
          ctx.fillText('만', vx + sw + 3, vy);
          ctx.globalAlpha = 1;
        } else {
          // flying: the node's label leaves with it, fading; the bubble's own label arrives on landing
          const la = 1 - smooth(k / 0.25);
          if (la > 0) {
            ctx.globalAlpha = la; ctx.fillStyle = INK; ctx.font = font(800, 28); ctx.textAlign = 'right';
            ctx.fillText(p.name, x - 18, y + h / 2 - 3);
            ctx.fillStyle = INK2; ctx.font = font(700, 24);
            drawNum(ctx, man(vEnd[i]), x - 18, y + h / 2 + 25, 'right');
            ctx.textAlign = 'left';
          }
          const ba = smooth((k - 0.82) / 0.18);
          if (ba > 0) {
            const cx = x + w / 2, cy = y + h / 2, L = bubLabel[i];
            ctx.globalAlpha = ba;
            if (L.inside) {
              // the name must fit the circle: a compound name breaks at its '·', then the font shrinks if needed
              let fs = w > 120 ? 26 : 23;
              ctx.font = font(800, fs);
              let lines = [p.name];
              if (ctx.measureText(p.name).width > 0.8 * w && p.name.includes('·')) {
                const [a, b] = p.name.split('·');
                lines = [a + '·', b];
              }
              const widest = Math.max(...lines.map((s) => ctx.measureText(s).width));
              if (widest > 0.8 * w) fs *= 0.8 * w / widest;
              const lh = fs * 1.08, top = cy - 2 - (lines.length - 1) * lh * 0.5;
              ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 8;
              ctx.fillStyle = '#ffffff'; ctx.font = font(800, fs); ctx.textAlign = 'center';
              lines.forEach((s, k) => ctx.fillText(s, cx, top + k * lh));
              ctx.font = font(600, w > 120 ? 21 : 19); ctx.fillStyle = 'rgba(255,255,255,0.86)';
              drawNum(ctx, man(vEnd[i]), cx, top + (lines.length - 1) * lh + 26, 'center');
              ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
            } else {
              const lx = cx + L.dx * ms, ly = cy + L.dy * ms;
              ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 10;
              ctx.fillStyle = INK; ctx.font = font(800, 23); ctx.textAlign = L.align;
              ctx.fillText(p.name, lx, ly - 2);
              ctx.font = font(600, 19); ctx.fillStyle = INK2;
              drawNum(ctx, man(vEnd[i]), lx, ly + 21, L.align);
              ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
            }
            ctx.textAlign = 'left';
          }
          // one ring goes out as each bubble lands, then a slow breath
          const q = (t - (T.map0 + 0.12 + 0.075 * rankEnd[i] + 0.95)) / 1.0;
          if (q > 0 && q < 1) {
            ctx.globalAlpha = 0.6 * (1 - q) * (1 - q);
            ctx.strokeStyle = hi[i]; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2 + 50 * ease.outCubic(q), 0, Math.PI * 2); ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      }
      ctx.globalAlpha = 1;

      // ================= 3 · lower third: the total and a size key
      const lowA = ramp(t, T.map0 + 0.6, T.map0 + 1.3);
      if (lowA > 0) {
        const ta = ramp(t, 7.75, 8.2);
        if (ta > 0) {
          ctx.globalAlpha = ta;
          ctx.fillStyle = MUTED; ctx.font = font(600, 24); ctx.textAlign = 'left';
          ctx.fillText('8개 항만 합계 · 2024년', X0, 1490);
          const cnt = totalEnd * ease.outCubic(clamp((t - 7.85) / 1.05));
          ctx.fillStyle = INK; ctx.font = font(800, 66);
          const nw = drawNum(ctx, man(cnt), X0, 1566);
          ctx.fillStyle = INK2; ctx.font = font(600, 30);
          ctx.fillText('TEU', X0 + nw + 12, 1566);
          const da = ramp(t, 8.75, 9.15);
          if (da > 0) {
            ctx.globalAlpha = da; ctx.fillStyle = INK2; ctx.font = font(500, 24);
            ctx.fillText(`10년 전(${man(total0)})보다 ${Math.round((totalEnd / total0 - 1) * 100)}% 늘었다`, X0, 1612);
          }
        }
        // size key: area ∝ value, two reference circles
        const ka = ramp(t, 8.2, 8.7);
        if (ka > 0) {
          const kx = 925, kb = 1612;
          ctx.globalAlpha = ka;
          ctx.fillStyle = MUTED; ctx.font = font(600, 19); ctx.textAlign = 'right';
          ctx.fillText('원 넓이 = 물동량', 1008, 1446);
          for (const v of [50, 20]) {
            const r = radius(v) * ms;
            ctx.strokeStyle = 'rgba(220,228,240,0.55)'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(kx, kb - r, r, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(kx, kb - 2 * r); ctx.lineTo(kx - 104, kb - 2 * r); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = INK2; ctx.font = font(500, 18);
            drawNum(ctx, man(v), kx - 108, kb - 2 * r + 6, 'right');
          }
          ctx.textAlign = 'left';
        }
        ctx.globalAlpha = 1;
      }

      // ================= header: tag, title, the section line, a three-part rail
      const hA = ramp(t, 0.0, 0.55), hY = (1 - ease.outCubic(clamp(t / 0.7))) * 16;
      ctx.globalAlpha = hA;
      {
        ctx.font = font(700, 21);
        const tag = '예시 데이터', tw = ctx.measureText(tag).width;
        rrect(ctx, X0, 120 + hY, tw + 32, 40, 20, 20);
        ctx.strokeStyle = 'rgba(233,180,76,0.85)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = 'rgba(233,180,76,0.1)'; ctx.fill();
        ctx.fillStyle = '#efc46e'; ctx.textAlign = 'left'; ctx.fillText(tag, X0 + 16, 147 + hY);
        ctx.fillStyle = MUTED; ctx.font = font(500, 21);
        ctx.fillText('2014–2024 · 단위 만 TEU', X0 + tw + 50, 147 + hY);
        ctx.fillStyle = INK; ctx.font = font(800, 56);
        ctx.fillText('아시아 컨테이너 항만 물동량', X0, 226 + hY);
      }
      const secs = [
        ['1 · 순위', '10년 동안 어느 항만이 앞섰나'],
        ['2 · 흐름', '2024년의 컨테이너는 어디로 가나'],
        ['3 · 지도', '그 항만들은 어디에 있나'],
      ];
      const s1 = T.morph0 - 0.1, s2 = T.map0 - 0.05;
      const secA3 = [1 - ramp(t, s1 - 0.15, s1 + 0.15), ramp(t, s1, s1 + 0.3) * (1 - ramp(t, s2 - 0.15, s2 + 0.15)), ramp(t, s2, s2 + 0.3)];
      const secY = [-ramp(t, s1 - 0.15, s1 + 0.15) * 14, (1 - ramp(t, s1, s1 + 0.3)) * 14 - ramp(t, s2 - 0.15, s2 + 0.15) * 14, (1 - ramp(t, s2, s2 + 0.3)) * 14];
      secs.forEach(([a, b], k) => {
        if (secA3[k] <= 0) return;
        ctx.globalAlpha = hA * secA3[k];
        ctx.font = font(800, 31); ctx.fillStyle = '#9cc2f0'; ctx.textAlign = 'left';
        ctx.fillText(a, X0, 284 + hY + secY[k]);
        const aw = ctx.measureText(a).width;
        ctx.font = font(500, 30); ctx.fillStyle = INK2;
        ctx.fillText(b, X0 + aw + 18, 284 + hY + secY[k]);
      });
      {
        const segW = (W - 2 * X0 - 2 * 12) / 3;
        const prog = [clamp((t - 0.3) / (T.morph0 - 0.4)), clamp((t - T.morph0) / (T.map0 - T.morph0)), clamp((t - T.map0) / (9.3 - T.map0))];
        for (let k = 0; k < 3; k++) {
          const x = X0 + k * (segW + 12);
          ctx.globalAlpha = hA;
          ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x, 314, segW, 3);
          ctx.fillStyle = k === (t < s1 ? 0 : t < s2 ? 1 : 2) ? 'rgba(156,194,240,0.95)' : 'rgba(200,210,225,0.45)';
          ctx.fillRect(x, 314, segW * prog[k], 3);
        }
      }
      // footnote (always)
      ctx.globalAlpha = hA * 0.55; ctx.fillStyle = MUTED; ctx.font = font(500, 19); ctx.textAlign = 'left';
      ctx.fillText('예시 데이터 — 실제 통계가 아닌, 설명을 위해 만든 값입니다 · TEU = 20피트 컨테이너 1개', X0, 1656);
      ctx.globalAlpha = 1;

      // ================= fades at the loop seam
      const dk = Math.max(0.7 * (1 - smooth(t / 0.4)), 0.92 * smooth((t - T.end0) / (D - T.end0)));
      if (dk > 0) { ctx.fillStyle = `rgba(6,8,12,${dk.toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
    };
  },

  frame(t) { this.render(t); },
});
