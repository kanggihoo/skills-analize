/*
 * 01 · 먹 한 방울 — an ink drop falls onto hanji and blooms into a 수묵 landscape. Pure SVG.
 *
 * Every ink layer is plain geometry (alpha = ink dilution) pushed through the SVG filter engine in two stages:
 *   setup  — the layer's shapes → feTurbulence (fixed seed) → feDisplacementMap → feGaussianBlur, rendered twice:
 *            a WET ink (strong displacement, wide bleed) and a DRY ink (settled edges), each baked to a bitmap;
 *            plus a map whose B channel is the radial "arrival" field + turbulence.
 *   frame  — one cheap filter per layer:  feImage(wet) ⊕ feImage(dry)  (feComposite arithmetic, k = wetness)
 *            masked by feColorMatrix  alpha = slope·(B − thr)     the bleeding front (fingers from the noise)
 *            → feComponentTransfer table [0, 1, .84]              ink pools along the advancing front.
 * Per frame only attributes change: thr, the wet/dry mix, the blot, seal pressure. No displacement or blur is
 * re-evaluated over a large region per frame, and a layer whose front has passed and dried costs nothing.
 * The paper (turbulence fibres + feDiffuseLighting) is baked once too. The falling drop is drawn once and moved
 * and defocused with CSS transform / filter: blur(), which the compositor applies without repainting.
 */
import { defineDemo, rand, track, ease, clamp, lerp, ramp, smooth } from '../_lib/stage.js';

const NS = 'http://www.w3.org/2000/svg';
const D = 9.6;
const IMPACT_T = 1.35;
const INK = '#16151a';
const PAPER_Y = 1668;                       // bottom (deckle) edge of the sheet; below it the dark felt
const DROP_R = 150;                         // the bead is drawn once at this radius and scaled
const SHADOW_W = 136, SHADOW_H = 108;       // its shadow ellipse at full height (rx 68, ry 54)

// ---------- small helpers ----------
function h(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
/** write an attribute only when its value changes (an unchanged layer must not be repainted) */
function put(el, k, v) {
  v = String(v);
  const key = '_' + k;
  if (el[key] !== v) { el[key] = v; el.setAttribute(k, v); }
}
/** the same for an inline style property */
function setStyle(el, k, v) {
  const key = '__s' + k;
  if (el[key] !== v) { el[key] = v; el.style[k] = v; }
}
const f1 = (v) => Math.round(v * 10) / 10;
const f2 = (v) => Math.round(v * 100) / 100;
/** smooth 1-D value noise in [-1, 1] with unit knot spacing */
function noise1(seed) {
  const r = rand(seed), knots = Array.from({ length: 512 }, () => r() * 2 - 1);
  return (x) => {
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    const a = knots[((i % 512) + 512) % 512], b = knots[(((i + 1) % 512) + 512) % 512];
    return a + (b - a) * u;
  };
}
/** a ridge line y(x) = base − max(bumps) + rocky jitter, sampled every `step` px */
function ridge({ x0, x1, base, bumps, seed, rough = 10, step = 6 }) {
  const n1 = noise1(seed), n2 = noise1(seed + 101);
  const pts = [];
  for (let x = x0; x <= x1 + 0.1; x += step) {
    let hgt = 0;
    for (const [c, hh, w, p = 2] of bumps) hgt = Math.max(hgt, hh * Math.exp(-Math.pow(Math.abs(x - c) / w, p)));
    pts.push([x, base - hgt + rough * n1(x / 38) + rough * 0.45 * n2(x / 9)]);
  }
  return pts;
}
/**
 * graded wash under a ridge: N nested bands from the crest down to a depth that wanders with x, each with the
 * same small alpha — they pile up near the crest and thin out below (a gradient that follows the ridge).
 * `total` is the opacity reached where all bands overlap.
 */
function wash(g, pts, { depth, n = 22, total = 0.8, seed = 1, wander = 0.35, floor = 1e9, taper = 140 }) {
  const nz = noise1(seed), xa = pts[0][0], xb = pts[pts.length - 1][0];
  const alpha = 1 - Math.pow(1 - total, 1 / n);
  for (let k = 0; k < n; k++) {
    let d = 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L');
    for (let i = pts.length - 1; i >= 0; i--) {
      const [x, y] = pts[i];
      const end = smooth(Math.min(x - xa, xb - x) / taper);                   // bands pinch shut at the ends
      const dk = Math.max(2, Math.min(depth, floor - y) * end) * (k + 1) / n;   // never deeper than the floor
      d += `L${f1(x)},${f1(y + dk * (1 - wander * 0.5 * (1 - nz(x / 70 + k * 3.7))))}`;
    }
    h('path', { d: d + 'Z', 'fill-opacity': f2(alpha * 1000) / 1000 }, g);
  }
}
/** a brush stroke: polygon around a polyline with width w(u), u ∈ [0, 1] along the stroke */
function brush(pts, w) {
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const ww = w(i / (pts.length - 1)) / 2;
    L.push([pts[i][0] + nx * ww, pts[i][1] + ny * ww]);
    R.push([pts[i][0] - nx * ww, pts[i][1] - ny * ww]);
  }
  return 'M' + L.concat(R.reverse()).map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';
}
/** Catmull-Rom points through control points */
function curve(cp, per = 10) {
  const out = [];
  for (let i = 0; i < cp.length - 1; i++) {
    const p0 = cp[Math.max(0, i - 1)], p1 = cp[i], p2 = cp[i + 1], p3 = cp[Math.min(cp.length - 1, i + 2)];
    for (let s = 0; s < per; s++) {
      const t = s / per, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  out.push(cp[cp.length - 1]);
  return out;
}
const at = (pts, x) => { let b = pts[0]; for (const p of pts) if (Math.abs(p[0] - x) < Math.abs(b[0] - x)) b = p; return b[1]; };

// ---------- baking: static noise rendered ONCE by the SVG filter engine, reused as a bitmap ----------
// Live, every re-rastered tile re-evaluated feTurbulence (and the paper's lighting): ~4 s/frame on this
// software-GPU renderer. Each job is an SVG string → <img> → canvas → PNG blob URL → feImage / <img>.
const BAKES = [];
async function bakeAll(holder) {
  await Promise.all(BAKES.map(async (b) => {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      `<svg xmlns="${NS}" width="${b.w}" height="${b.h}" viewBox="${b.vb || `0 0 ${b.w} ${b.h}`}">${b.inner}</svg>`);
    await img.decode();
    const c = document.createElement('canvas');
    c.width = b.w; c.height = b.h;
    c.getContext('2d', { willReadFrequently: true }).drawImage(img, 0, 0);   // CPU raster
    const url = URL.createObjectURL(await new Promise((r) => c.toBlob(r, 'image/png')));
    // feImage fires no load event; warm the image cache through an <image> (which does) before handing it over
    const pre = h('image', { width: 1, height: 1, opacity: 0 });
    await new Promise((r) => { pre.addEventListener('load', r); pre.addEventListener('error', r); pre.setAttribute('href', url); holder.appendChild(pre); });
    pre.remove();
    await b.done(url);
  }));
}
/** a noise map: R, G = fractal noise (displacement vectors); B = arrival field + amp·(noise − ½) */
function noiseMap(w, hh, { freq, oct = 4, seed, field = null, amp = 0.55 }) {
  const grad = field ? `<radialGradient id="g" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${f1(field.cx)} ${f1(field.cy)}) scale(${f1(field.rx)} ${f1(field.ry)})"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>` : '';
  return `<defs>${grad}
    <filter id="f" filterUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${hh}" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${oct}" seed="${seed}" result="n"/>
      <feColorMatrix in="n" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 0 1" result="rg"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="nb"/>
      <feComposite in="SourceGraphic" in2="nb" operator="arithmetic" k2="${field ? 1 : 0}" k3="${amp}" k4="${-amp / 2}" result="v"/>
      <feColorMatrix in="v" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 0 1" result="vb"/>
      <feComposite in="rg" in2="vb" operator="arithmetic" k2="1" k3="1"/>
    </filter></defs>
    <rect width="${w}" height="${hh}" fill="${field ? 'url(#g)' : '#000'}" filter="url(#f)"/>`;
}
/** prepend to `filter` an feImage that will show a baked noise map over the user-space box */
function mapImage(filter, [x, y, w, hh], opts) {
  const fe = h('feImage', { x, y, width: w, height: hh, preserveAspectRatio: 'none', result: 'map' });
  filter.prepend(fe);
  BAKES.push({ w, h: hh, inner: noiseMap(w, hh, opts), done: (url) => fe.setAttribute('href', url) });
  return fe;
}

/**
 * a box-sized SVG in stage coordinates on its own composited layer. res < 1 rasterises it (filters included)
 * at reduced resolution and scales it back up with a constant transform — for soft, blurry layers.
 */
function sheet(stage, [x, y, w, hh], z, css = '', res = 1) {
  const s = h('svg', { width: w * res, height: hh * res, viewBox: `${x} ${y} ${w} ${hh}` });
  s.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w * res}px;height:${hh * res}px;z-index:${z};overflow:hidden;` +
    `transform-origin:0 0;transform:scale(${1 / res});will-change:transform;${css}`;
  stage.appendChild(s);
  return { svg: s, defs: h('defs', {}, s) };
}

/**
 * one ink layer (see the header). Returns the group to draw the shapes into (detached: it is only baked),
 * bake() to queue the wet / dry ink renders once the shapes exist, and set(thr, wetness) for the frame.
 */
function inkLayer(stage, z, id, { box, src, r, sx = 1, sy = 1, freq = 0.022, oct = 4, seed, amp = 0.55, slope = 9, color = INK, pool = 0.84, res = 1 }) {
  const { svg, defs } = sheet(stage, box, z, '', res);
  const [x, y, w, hh] = box;
  const f = h('filter', { id: `f-${id}`, filterUnits: 'userSpaceOnUse', primitiveUnits: 'userSpaceOnUse', x, y, width: w, height: hh, 'color-interpolation-filters': 'sRGB' }, defs);
  mapImage(f, box, { freq, oct, seed, amp, field: { cx: src[0] - x, cy: src[1] - y, rx: r * sx, ry: r * sy } });
  const ink = {};
  for (const k of ['wet', 'dry']) ink[k] = h('feImage', { x, y, width: w, height: hh, preserveAspectRatio: 'none', result: k }, f);
  const mix = h('feComposite', { in: 'wet', in2: 'dry', operator: 'arithmetic', k2: 1, k3: 0, result: 'ink' }, f);
  const thr = h('feColorMatrix', { in: 'map', type: 'matrix', values: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0', result: 'm' }, f);
  const ct = h('feComponentTransfer', { in: 'm', result: 'mt' }, f);
  h('feFuncA', { type: 'table', tableValues: `0 1 ${pool}` }, ct);
  h('feComposite', { in: 'ink', in2: 'mt', operator: 'in' }, f);
  h('rect', { x, y, width: w, height: hh, fill: '#000', filter: `url(#f-${id})` }, svg);   // the filter's canvas
  const g = h('g');
  return {
    g, svg,
    bake() {
      const { d, s } = LAYERS[id];
      const extra = [...defs.children].filter((e) => e.tagName !== 'filter').map((e) => e.outerHTML).join('');
      [['dry', d[0], s[0]], ['wet', d[1], s[1]]].forEach(([k, scale, sigma]) => BAKES.push({
        w: Math.round(w * res), h: Math.round(hh * res), vb: `${x} ${y} ${w} ${hh}`, done: (url) => ink[k].setAttribute('href', url),
        inner: `<defs>${extra}<filter id="k" filterUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${hh}" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${oct}" seed="${seed}" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="d"/>
          <feGaussianBlur in="d" stdDeviation="${sigma}"/></filter></defs>
          <g filter="url(#k)" fill="${color}">${g.innerHTML}</g>`,
      }));
    },
    set(threshold, wetness) {
      put(thr, 'values', `0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${slope} 0 ${Math.round(-slope * threshold * 1000) / 1000}`);
      put(mix, 'k2', f2(wetness));
      put(mix, 'k3', f2(1 - wetness));
    },
  };
}

// ---------- timeline ----------
// thr: 1.08 = nothing has arrived, −0.25 = fully soaked. wet: 1 → 0 as the layer dries (the wet ink fades into
// the dry ink); every layer is dry soon after its front has passed, so later frames leave it untouched.
// d / s: displacement and blur σ of the baked DRY and WET inks.
const T = (a, b, e = ease.inOutCubic) => track([[a, 1.08], [b, -0.25, e]]);
const wet = (a, b) => track([[a, 1], [b, 0, ease.inOutCubic]]);
// the blot flashes open at impact, then drains away as the mountain drinks its ink
const blotR = track([[IMPACT_T, 4], [IMPACT_T + 0.45, 80, ease.outExpo], [1.95, 84, ease.outCubic], [3.6, 0, ease.inOutCubic]]);
const LAYERS = {
  //          reveal         ease            dry by  displacement(dry, wet)  blur σ(dry, wet)
  farther: { thr: T(2.8, 6.0), wet: wet(2.8, 6.6), d: [18, 22], s: [3.6, 2.4] },
  far:     { thr: T(2.1, 5.6), wet: wet(2.1, 6.2), d: [14, 26], s: [2.4, 2.6] },
  main:    { thr: T(IMPACT_T + 0.15, 4.6, ease.outCubic), wet: wet(1.6, 5.2), d: [12, 30], s: [1.3, 2.4] },
  mid:     { thr: T(2.8, 5.8, ease.outCubic), wet: wet(2.8, 6.4), d: [10, 24], s: [1.4, 2.0] },
  water:   { thr: T(3.6, 6.6), wet: wet(3.6, 7.1), d: [8, 16], s: [1.0, 1.5] },
  pine:    { thr: T(3.9, 6.8, ease.outCubic), wet: wet(3.9, 7.4), d: [7, 26], s: [0.8, 2.2] },
  boat:    { thr: T(5.6, 7.6, ease.outCubic), wet: wet(5.6, 8.0), d: [4, 8], s: [0.6, 1.2] },
  sun:     { thr: T(5.4, 8.2), wet: wet(5.4, 8.8), d: [8, 14], s: [2.4, 3.0] },
};

defineDemo({
  id: '01-svg-ink',
  title: '먹 한 방울',
  tech: 'SVG 필터 · feTurbulence + feDisplacementMap',
  duration: D,
  background: '#141210',
  async setup({ stage }) {
    // ======== paper + felt: SVG (turbulence fibres + feDiffuseLighting, displaced deckle edge), baked once ========
    let fib = '';
    { // long 닥 fibres floating in the sheet
      const r = rand(77);
      for (let i = 0; i < 70; i++) {
        const x = r() * 1080, y = r() * PAPER_Y, a = r() * Math.PI * 2, l = 40 + r() * 140;
        const bx = x + Math.cos(a) * l, by = y + Math.sin(a) * l;
        const cx = (x + bx) / 2 + (r() - 0.5) * 60, cy = (y + by) / 2 + (r() - 0.5) * 60;
        fib += `<path d="M${f1(x)},${f1(y)}Q${f1(cx)},${f1(cy)} ${f1(bx)},${f1(by)}" stroke="${r() < 0.6 ? '#b8a585' : '#fffaf0'}" stroke-opacity="${f1(0.10 + r() * 0.16)}" stroke-width="${f1(0.6 + r() * 1.1)}"/>`;
      }
    }
    const paperImg = document.createElement('img');
    paperImg.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:0;will-change:transform';
    stage.appendChild(paperImg);
    this.veil = document.createElement('img');           // the same sheet again, above the ink (loop dissolve)
    this.veil.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:20;will-change:opacity;opacity:0';
    stage.appendChild(this.veil);
    BAKES.push({ w: 1080, h: 1920, done: (url) => { paperImg.src = url; this.veil.src = url; return Promise.all([paperImg.decode(), this.veil.decode()]); }, inner: `<defs>
      <filter id="felt" filterUnits="userSpaceOnUse" x="0" y="1560" width="1080" height="360" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.09  0 0 0 0 0.082  0 0 0 0 0.075  0.18 0 0 0 0" result="g"/>
        <feFlood flood-color="#181614"/><feComposite in2="SourceAlpha" operator="in" result="base"/>
        <feComposite in="g" in2="base" operator="atop"/>
      </filter>
      <filter id="paper" filterUnits="userSpaceOnUse" x="-20" y="-20" width="1120" height="${PAPER_Y + 60}" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" result="edgeN"/>
        <feDisplacementMap in="SourceAlpha" in2="edgeN" scale="14" xChannelSelector="R" yChannelSelector="G" result="shape"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves="5" seed="2" result="fib"/>
        <feDiffuseLighting in="fib" surfaceScale="1.0" diffuseConstant="1.13" lighting-color="#f9f2e3" result="lit">
          <feDistantLight azimuth="235" elevation="62"/>
        </feDiffuseLighting>
        <feComposite in="lit" in2="shape" operator="in" result="sheet"/>
        <feGaussianBlur in="shape" stdDeviation="7" result="sh"/>
        <feOffset in="sh" dy="5" result="sho"/>
        <feFlood flood-color="#000" flood-opacity=".55"/><feComposite in2="sho" operator="in" result="shadow"/>
        <feMerge><feMergeNode in="shadow"/><feMergeNode in="sheet"/></feMerge>
      </filter>
      <radialGradient id="light" gradientUnits="userSpaceOnUse" cx="260" cy="260" r="1750">
        <stop offset="0" stop-color="#fffaf0" stop-opacity=".55"/><stop offset=".45" stop-color="#fff8ec" stop-opacity="0"/>
        <stop offset=".8" stop-color="#5a4630" stop-opacity=".10"/><stop offset="1" stop-color="#3a2a18" stop-opacity=".28"/>
      </radialGradient>
      <clipPath id="sheetClip"><rect x="0" y="-20" width="1080" height="${PAPER_Y + 14}"/></clipPath></defs>
      <rect width="1080" height="1920" fill="#141210"/>
      <rect x="0" y="1560" width="1080" height="360" fill="#181614" filter="url(#felt)"/>
      <rect x="-40" y="-40" width="1160" height="${PAPER_Y + 40}" fill="#000" filter="url(#paper)"/>
      <g clip-path="url(#sheetClip)" fill="none" stroke-linecap="round">${fib}</g>
      <rect x="0" y="-20" width="1080" height="${PAPER_Y + 14}" fill="url(#light)" clip-path="url(#sheetClip)"/>` });

    const L = {};
    // the main peak decides where the drop lands
    const mainR = ridge({ x0: 150, x1: 990, base: 1040, seed: 2, rough: 11,
      bumps: [[560, 640, 120, 1.7], [410, 430, 95, 1.8], [700, 500, 85, 1.8], [810, 330, 100], [270, 260, 110]] });
    let summit = mainR[0];
    for (const p of mainR) if (p[1] < summit[1]) summit = p;
    const IMPACT = [Math.round(summit[0]), Math.round(summit[1] + 30)];
    this.impact = IMPACT;

    // --- sun glow: the faintest warm light in the sky, no filter ---
    {
      const { svg, defs } = sheet(stage, [480, 80, 760, 760], 1);
      const g = h('radialGradient', { id: 'glow', cx: 0.5, cy: 0.5, r: 0.5 }, defs);
      h('stop', { offset: 0, 'stop-color': '#e9a27c', 'stop-opacity': 0.34 }, g);
      h('stop', { offset: 0.35, 'stop-color': '#efc2a0', 'stop-opacity': 0.14 }, g);
      h('stop', { offset: 1, 'stop-color': '#f4dcc4', 'stop-opacity': 0 }, g);
      this.glow = h('circle', { cx: 858, cy: 452, r: 380, fill: 'url(#glow)', opacity: 0 }, svg);
    }

    // --- the sun: a pale vermilion wash ---
    L.sun = inkLayer(stage, 2, 'sun', { box: [700, 300, 300, 300], src: [858, 452], r: 90, seed: 33, color: '#c2553a', freq: 0.03, amp: 0.4, slope: 6, pool: 0.9 });
    {
      const g = h('radialGradient', { id: 'sunG', cx: 0.5, cy: 0.5, r: 0.5 }, L.sun.svg.querySelector('defs'));
      h('stop', { offset: 0, 'stop-color': '#c2553a', 'stop-opacity': 0.5 }, g);
      h('stop', { offset: 0.8, 'stop-color': '#c2553a', 'stop-opacity': 0.44 }, g);
      h('stop', { offset: 1, 'stop-color': '#c2553a', 'stop-opacity': 0.12 }, g);
      h('circle', { cx: 858, cy: 452, r: 56, fill: 'url(#sunG)' }, L.sun.g);
    }

    // --- the far range (palest, cool) ---
    L.farther = inkLayer(stage, 3, 'farther', { box: [0, 520, 1080, 470], src: [800, 760], r: 900, sx: 1, sy: 0.5, seed: 21, color: '#3b4450', freq: 0.016, amp: 0.6, res: 0.5 });
    wash(L.farther.g, ridge({ x0: -20, x1: 1100, base: 860, seed: 4, rough: 8, bumps: [[90, 150, 160], [330, 120, 140], [700, 190, 170], [1000, 170, 150]] }), { depth: 150, n: 14, total: 0.42, seed: 8, floor: 950 });

    // --- far peaks (cool grey, soft) ---
    L.far = inkLayer(stage, 4, 'far', { box: [0, 300, 1080, 740], src: [560, 520], r: 760, sx: 1, sy: 0.75, seed: 17, color: '#2c333d', freq: 0.018, res: 0.5 });
    wash(L.far.g, ridge({ x0: -20, x1: 470, base: 980, seed: 12, rough: 9, bumps: [[230, 360, 120, 1.6], [70, 230, 120], [400, 200, 90]] }), { depth: 300, n: 20, total: 0.62, seed: 3, floor: 1010 });
    wash(L.far.g, ridge({ x0: 600, x1: 1100, base: 980, seed: 13, rough: 9, bumps: [[905, 470, 115, 1.5], [720, 260, 110], [1060, 300, 110]] }), { depth: 330, n: 20, total: 0.62, seed: 5, floor: 1010 });

    // --- main peak: where the drop lands ---
    L.main = inkLayer(stage, 5, 'main', { box: [110, 300, 920, 800], src: IMPACT, r: 640, sx: 1.05, sy: 0.95, seed: 7, freq: 0.02 });
    wash(L.main.g, mainR, { depth: 430, n: 26, total: 0.9, seed: 9, wander: 0.45, floor: 1075 });
    { // 준법: hemp-fibre texture strokes falling from the crest + broken crest line + moss dots
      const r = rand(5);
      for (let i = 0; i < 46; i++) {
        const x = 200 + r() * 760, y0 = at(mainR, x) + 6 + r() * 30;
        const len = Math.min(90 + r() * 260, (1050 - y0) * 0.75), bend = (r() - 0.5) * 50, lean = (x - 560) * 0.08;
        const pts = curve([[x, y0], [x + lean * 0.5 + bend, y0 + len * 0.5], [x + lean + bend * 0.3, y0 + len]], 8);
        const wmax = 3 + r() * 7;
        h('path', { d: brush(pts, (u) => wmax * Math.sin(Math.PI * Math.min(1, u * 1.15 + 0.05)) + 0.5), 'fill-opacity': f1(0.14 + r() * 0.24) }, L.main.g);
      }
      const nz = noise1(44);
      for (const [a, b] of [[150, 340], [360, 470], [480, 760], [780, 990]]) {
        const pts = mainR.filter((p) => p[0] >= a && p[0] <= b).map(([x, y]) => [x, y + 2]);
        if (pts.length > 2) h('path', { d: brush(pts, (u) => 3 + 6 * Math.abs(nz(u * 6 + a)) * Math.sin(Math.PI * u)), 'fill-opacity': 0.75 }, L.main.g);
      }
      for (let i = 0; i < 34; i++) {
        const x = 190 + r() * 780, y = at(mainR, x) + 4 + r() * 22;
        h('ellipse', { cx: f1(x), cy: f1(y), rx: f1(4 + r() * 6), ry: f1(2 + r() * 3), transform: `rotate(${f1(-30 + r() * 60)} ${f1(x)} ${f1(y)})`, 'fill-opacity': 0.85 }, L.main.g);
      }
    }

    // --- mist: soft paper-toned wisps, bent by a stretched noise field. `lighten` keeps them invisible over
    //     bare paper (paper is lighter) and lets them veil the ink. They drift through the static field. ---
    {
      const box = [0, 840, 1080, 300];
      const { svg, defs } = sheet(stage, box, 6, 'mix-blend-mode:lighten', 0.5);
      const g = h('radialGradient', { id: 'mist', cx: 0.5, cy: 0.5, r: 0.5 }, defs);
      h('stop', { offset: 0, 'stop-color': '#efe8da', 'stop-opacity': 0.9 }, g);
      h('stop', { offset: 0.55, 'stop-color': '#efe8da', 'stop-opacity': 0.5 }, g);
      h('stop', { offset: 1, 'stop-color': '#efe8da', 'stop-opacity': 0 }, g);
      const f = h('filter', { id: 'wisp', filterUnits: 'userSpaceOnUse', x: box[0], y: box[1], width: box[2], height: box[3], 'color-interpolation-filters': 'sRGB' }, defs);
      mapImage(f, box, { freq: '0.006 0.022', oct: 3, seed: 19 });
      h('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale: 110, xChannelSelector: 'R', yChannelSelector: 'G' }, f);
      this.mistG = h('g', { filter: 'url(#wisp)', opacity: 0 }, svg);
      this.mists = [[260, 1035, 340, 52, 11, 0.85], [800, 1010, 320, 46, -8, 0.8], [520, 950, 240, 30, 6, 0.55], [120, 905, 220, 34, 5, 0.5]].map(([x, y, rx, ry, v, o]) => ({
        el: h('ellipse', { cx: x, cy: y, rx, ry, fill: 'url(#mist)', opacity: o }, this.mistG), x, v }));
    }

    // --- mid ridges (forest lines) ---
    L.mid = inkLayer(stage, 7, 'mid', { box: [0, 920, 1080, 480], src: [540, 1050], r: 700, sx: 1, sy: 0.45, seed: 9, freq: 0.024 });
    const midL = ridge({ x0: -20, x1: 640, base: 1180, seed: 31, rough: 7, bumps: [[230, 190, 160, 1.6], [500, 80, 100]] });
    const midR = ridge({ x0: 430, x1: 1100, base: 1215, seed: 32, rough: 7, bumps: [[860, 170, 150, 1.6], [620, 70, 110]] });
    wash(L.mid.g, midL, { depth: 210, n: 22, total: 0.78, seed: 14, floor: 1370 });
    wash(L.mid.g, midR, { depth: 190, n: 22, total: 0.78, seed: 15, floor: 1370 });
    { // distant trees: little vertical dabs along the crests
      const r = rand(9);
      for (const R of [midL, midR]) for (let i = 0; i < 46; i++) {
        const p = R[Math.floor(r() * R.length)], hh = 8 + r() * 18;
        h('ellipse', { cx: f1(p[0]), cy: f1(p[1] - hh * 0.35), rx: f1(2.5 + r() * 3), ry: f1(hh * 0.6), 'fill-opacity': f1(0.35 + r() * 0.3) }, L.mid.g);
      }
    }

    // --- water: far bank, ripples ---
    L.water = inkLayer(stage, 8, 'water', { box: [300, 1235, 780, 370], src: [640, 1400], r: 700, sx: 1, sy: 0.25, seed: 41, freq: 0.03, color: '#262a30' });
    wash(L.water.g, ridge({ x0: 420, x1: 1100, base: 1262, seed: 51, rough: 3, step: 8, bumps: [[900, 14, 120]] }), { depth: 14, n: 6, total: 0.5, seed: 2 });
    {
      const r = rand(13);
      for (let i = 0; i < 26; i++) {
        const y = 1280 + Math.pow(r(), 0.8) * 300, x = 380 + r() * 680, l = 40 + r() * 170 * (0.5 + (y - 1280) / 300);
        const pts = curve([[x, y], [x + l * 0.5, y + (r() - 0.5) * 4], [x + l, y + (r() - 0.5) * 3]], 6);
        h('path', { d: brush(pts, (u) => 1.2 + 2.2 * Math.sin(Math.PI * u)), 'fill-opacity': f1(0.25 + r() * 0.35) }, L.water.g);
      }
    }

    // --- the boat ---
    L.boat = inkLayer(stage, 9, 'boat', { box: [600, 1340, 260, 180], src: [720, 1438], r: 130, seed: 52, freq: 0.05, slope: 7, pool: 0.95 });
    {
      const g = L.boat.g;
      h('path', { d: 'M640,1432 Q720,1460 808,1428 Q790,1446 722,1450 Q668,1448 640,1432Z', 'fill-opacity': 0.9 }, g);
      h('path', { d: 'M700,1432 Q706,1404 718,1402 Q730,1408 732,1434Z', 'fill-opacity': 0.75 }, g);   // the figure
      h('path', { d: 'M700,1404 L719,1388 L740,1404 Q720,1400 700,1404Z', 'fill-opacity': 0.9 }, g);   // straw hat
      h('path', { d: brush([[734, 1418], [790, 1370], [830, 1352]], (u) => 2.2 * (1 - u) + 0.6), 'fill-opacity': 0.8 }, g); // rod
      for (let i = 0; i < 4; i++) h('path', { d: brush([[660 + i * 14, 1466 + i * 9], [760 - i * 8, 1468 + i * 9]], (u) => 2.6 * Math.sin(Math.PI * u)), 'fill-opacity': f2(0.4 - i * 0.07) }, g);
    }

    // --- foreground: rock and pine (darkest, crispest) ---
    L.pine = inkLayer(stage, 10, 'pine', { box: [0, 890, 720, 790], src: [200, 1450], r: 900, sx: 0.9, sy: 1, seed: 29, freq: 0.026, pool: 0.9 });
    const rockR = ridge({ x0: -20, x1: 640, base: 1700, seed: 61, rough: 9, bumps: [[90, 330, 180, 1.4], [300, 240, 140], [480, 130, 110]] });
    wash(L.pine.g, rockR, { depth: 320, n: 24, total: 0.92, seed: 21, wander: 0.5 });
    {
      const r = rand(31), nz = noise1(71);
      h('path', { d: brush(rockR.filter((p) => p[0] < 600), (u) => 3 + 8 * Math.abs(nz(u * 7))), 'fill-opacity': 0.85 }, L.pine.g);
      for (let i = 0; i < 26; i++) { // rock fissures
        const x = r() * 560, y0 = at(rockR, x) + 10 + r() * 40, len = 60 + r() * 160;
        const pts = curve([[x, y0], [x - 10 + r() * 20, y0 + len * 0.5], [x - 20 + r() * 40, y0 + len]], 6);
        h('path', { d: brush(pts, (u) => (2 + r() * 5) * Math.sin(Math.PI * u) + 0.4), 'fill-opacity': f1(0.25 + r() * 0.35) }, L.pine.g);
      }
      const trunk = curve([[190, 1470], [215, 1330], [275, 1200], [360, 1100], [455, 1015], [540, 975]], 12);
      h('path', { d: brush(trunk, (u) => 36 * (1 - u * 0.72) * (1 + 0.18 * nz(u * 12))), 'fill-opacity': 0.9 }, L.pine.g);
      for (let k = 0; k < 14; k++) { // bark scales, lighter dry-brush flecks
        const p = trunk[Math.floor(4 + r() * (trunk.length - 12))];
        h('ellipse', { cx: f1(p[0] + (r() - 0.5) * 12), cy: f1(p[1]), rx: f1(4 + r() * 5), ry: 2.5, fill: '#fff', 'fill-opacity': 0.18 }, L.pine.g);
      }
      const branches = [
        [[300, 1170], [380, 1160], [470, 1168], [560, 1150]],
        [[255, 1240], [200, 1222], [130, 1230]],
        [[400, 1065], [470, 1060], [560, 1050], [650, 1030]],
        [[345, 1110], [290, 1085], [215, 1080]],
        [[470, 1005], [520, 960], [590, 930]],
      ];
      const clusters = [];
      for (const b of branches) {
        h('path', { d: brush(curve(b, 10), (u) => 11 * (1 - u * 0.75)), 'fill-opacity': 0.85 }, L.pine.g);
        clusters.push(b[b.length - 1], b[Math.floor(b.length / 2)]);
      }
      clusters.push([540, 975], [610, 960], [500, 1010]);
      for (const [cx, cy] of clusters) { // foliage: a soft grey cushion + fans of needles
        h('ellipse', { cx, cy: cy - 6, rx: 62, ry: 26, 'fill-opacity': 0.22 }, L.pine.g);
        for (let fan = 0; fan < 3; fan++) {
          const fx = cx + (fan - 1) * 34 + (r() - 0.5) * 10, fy = cy - 4 + (r() - 0.5) * 10;
          for (let k = 0; k < 15; k++) {
            const a = Math.PI * (1.05 + 0.9 * k / 14) + (r() - 0.5) * 0.08, l = 24 + r() * 10;
            h('path', { d: brush([[fx, fy], [fx + Math.cos(a) * l, fy + Math.sin(a) * l]], (u) => 2.6 * (1 - u) + 0.4), 'fill-opacity': 0.8 }, L.pine.g);
          }
        }
      }
    }

    // --- birds ---
    {
      const { svg } = sheet(stage, [140, 250, 460, 150], 11);
      this.birds = h('g', { fill: INK, opacity: 0 }, svg);
      this.birdPaths = [0, 1, 2].map(() => h('path', {}, this.birds));
    }

    // --- the blot + spatter: the drop's own ink. Classic "gooey" chain on its own alpha:
    //     displacement → blur → steep alpha threshold → dried rim (alpha − blur(alpha)) → ink. ---
    {
      const box = [IMPACT[0] - 280, IMPACT[1] - 240, 560, 480];
      const { svg, defs } = sheet(stage, box, 12);
      defs.insertAdjacentHTML('beforeend', `
        <filter id="blotF" filterUnits="userSpaceOnUse" x="${box[0]}" y="${box[1]}" width="560" height="480" color-interpolation-filters="sRGB">
          <feDisplacementMap in="SourceAlpha" in2="map" scale="40" xChannelSelector="R" yChannelSelector="G" result="d"/>
          <feGaussianBlur in="d" stdDeviation="5" result="b"/>
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 7 -2.6" result="a"/>
          <feGaussianBlur in="a" stdDeviation="6" result="ab"/>
          <feComposite in="a" in2="ab" operator="arithmetic" k2="2.2" k3="-1.35" result="ar"/>
          <feFlood flood-color="${INK}"/><feComposite in2="ar" operator="in"/>
        </filter>`);
      mapImage(defs.querySelector('#blotF'), box, { freq: 0.03, oct: 4, seed: 3 });
      this.blotDisp = defs.querySelector('#blotF feDisplacementMap');
      this.blotBlur = defs.querySelector('#blotF feGaussianBlur');
      this.blot = h('g', { filter: 'url(#blotF)' }, svg);
      this.blotSheet = svg;
      this.blotCore = h('circle', { cx: IMPACT[0], cy: IMPACT[1], r: 0 }, this.blot);
      const r = rand(404);
      this.spatter = [];
      for (let i = 0; i < 14; i++) {
        const a = Math.PI * 2 * (i + r() * 0.6) / 14, d = 95 + r() * 85, rr = 4 + r() * 8;
        this.spatter.push({ a, d, rr, delay: r() * 0.08, el: h('ellipse', { rx: 0, ry: 0 }, this.blot) });
      }
    }

    // --- the seal: 백문 (white letters cut into vermilion), uneven pressure from a small live turbulence ---
    {
      const SX = 892, SY = 1492, SS = 96;
      const { svg, defs } = sheet(stage, [SX - 24, SY - 24, SS + 48, SS + 48], 13);
      defs.insertAdjacentHTML('beforeend', `
        <filter id="seal" filterUnits="userSpaceOnUse" x="${SX - 24}" y="${SY - 24}" width="${SS + 48}" height="${SS + 48}" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" seed="8" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d"/>
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 4 0 0 -1.4" result="press"/>
          <feComposite in="d" in2="press" operator="in"/>
        </filter>`);
      this.sealPress = defs.querySelector('#seal feColorMatrix[result=press]');
      this.seal = h('g', { filter: 'url(#seal)', opacity: 0 }, svg);
      this.sealInner = h('g', {}, this.seal);
      // the glyph 먹 built from bars: ㅁ, ㅓ, ㄱ — the bars are paper (cut away) inside the red block
      const u = SS / 12;
      const bars = [
        [1.5, 1.3, 5.2, 1.15], [1.5, 1.3, 1.15, 4.9], [5.55, 1.3, 1.15, 4.9], [1.5, 5.05, 5.2, 1.15], // ㅁ
        [8.6, 1.1, 1.2, 5.6], [6.7, 3.4, 1.9, 1.1],                                                 // ㅓ
        [1.5, 7.4, 8.3, 1.2], [8.6, 7.4, 1.2, 3.4],                                                 // ㄱ
      ];
      let d = `M${SX},${SY}h${SS}v${SS}h${-SS}Z`;
      for (const [bx, by, bw, bh] of bars) d += `M${f1(SX + bx * u)},${f1(SY + by * u)}v${f1(bh * u)}h${f1(bw * u)}v${f1(-bh * u)}Z`;
      h('path', { d, fill: '#b3301f', 'fill-rule': 'evenodd' }, this.sealInner);
      this.sealC = [SX + SS / 2, SY + SS / 2];
    }
    this.L = L;

    // ======== the drop: a glossy bead drawn ONCE; its fall is a CSS transform (scale + position) and its defocus
    //          a CSS filter: blur() — both applied by the compositor, so the fall repaints nothing ========
    {
      const R0 = DROP_R;
      this.dropEl = document.createElement('div');
      this.dropEl.style.cssText = `position:absolute;left:0;top:0;width:${2 * R0}px;height:${2 * R0}px;z-index:14;transform-origin:${R0}px ${R0}px;will-change:transform,filter,opacity;opacity:0`;
      this.dropEl.innerHTML = `<svg width="${2 * R0}" height="${2 * R0}" viewBox="${-R0} ${-R0} ${2 * R0} ${2 * R0}"><defs>
        <radialGradient id="dropG" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#4a4650"/><stop offset=".45" stop-color="#16141a"/><stop offset="1" stop-color="#050406"/></radialGradient>
        <radialGradient id="dropHi" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <radialGradient id="dropRim" cx=".62" cy=".7" r=".5"><stop offset=".55" stop-color="#9aa0b0" stop-opacity="0"/><stop offset=".9" stop-color="#c8d0e0" stop-opacity=".35"/><stop offset="1" stop-color="#c8d0e0" stop-opacity="0"/></radialGradient></defs>
        <circle r="${R0}" fill="url(#dropG)"/><circle r="${R0}" fill="url(#dropRim)"/>
        <ellipse cx="${-R0 * 0.36}" cy="${-R0 * 0.4}" rx="${R0 * 0.26}" ry="${R0 * 0.17}" fill="url(#dropHi)" transform="rotate(-35 ${-R0 * 0.36} ${-R0 * 0.4})"/></svg>`;
      // the shadow on the paper: a soft and a crisp ellipse, cross-faded with the drop's height (no live blur)
      const shadow = (stops) => {
        const e = document.createElement('div');
        e.style.cssText = `position:absolute;left:0;top:0;width:${SHADOW_W}px;height:${SHADOW_H}px;z-index:13;transform-origin:50% 50%;will-change:transform,opacity;opacity:0;background:radial-gradient(closest-side, ${stops})`;
        stage.appendChild(e);
        return e;
      };
      this.shadowSoft = shadow('rgba(26,20,8,.75), rgba(26,20,8,.35) 45%, rgba(26,20,8,0)');
      this.shadowCrisp = shadow('rgba(26,20,8,1) 55%, rgba(26,20,8,.5) 80%, rgba(26,20,8,0)');
      stage.appendChild(this.dropEl);
    }

    for (const k in L) L[k].bake();
    const holder = h('svg', { width: 1, height: 1 });
    holder.style.cssText = 'position:absolute;left:0;top:0;opacity:0';
    stage.appendChild(holder);
    await bakeAll(holder);
    holder.remove();
  },

  frame(t) {
    const L = this.L, [ix, iy] = this.impact;
    // ---- the falling drop: comes down toward the paper (defocused → sharp, its shadow converges) ----
    //      everything here is a compositor property: transform, filter: blur(), opacity
    const hgt = 1 - ease.inCubic(clamp((t - 0.15) / (IMPACT_T - 0.15)));     // height above the paper, 1 → 0 (gravity)
    const showDrop = t > 0.1 && t < IMPACT_T, fadeIn = clamp((t - 0.1) * 4);
    {
      const r = lerp(17, DROP_R, Math.pow(hgt, 1.6)), s = r / DROP_R;
      const cx = ix - 40 * hgt, cy = iy - 60 * hgt;
      setStyle(this.dropEl, 'opacity', showDrop ? f2(fadeIn) : '0');
      setStyle(this.dropEl, 'transform', `translate(${f1(cx - DROP_R)}px,${f1(cy - DROP_R)}px) scale(${(Math.round(s * 1000) / 1000)})`);
      // CSS blur acts before the transform, so the radius is given in the bead's own (unscaled) units
      setStyle(this.dropEl, 'filter', `blur(${f1(28 * Math.pow(hgt, 1.4) / s)}px)`);
      const so = 160 * hgt, sx = ix + so * 0.55, sy = iy + so * 0.75;
      const sk = (18 + 50 * hgt) / (SHADOW_W / 2), op = showDrop ? lerp(0.5, 0.06, hgt) * clamp((t - 0.1) * 3) : 0;
      const tr = `translate(${f1(sx - SHADOW_W / 2)}px,${f1(sy - SHADOW_H / 2)}px) scale(${Math.round(sk * 1000) / 1000})`;
      setStyle(this.shadowSoft, 'transform', tr);
      setStyle(this.shadowCrisp, 'transform', tr);
      setStyle(this.shadowSoft, 'opacity', f2(op * hgt));
      setStyle(this.shadowCrisp, 'opacity', f2(op * (1 - hgt)));
    }

    // ---- the blot: opens at impact, spatter flies out and lands, then everything drains into the summit ----
    const blotOn = t >= IMPACT_T && t < 3.65;
    setStyle(this.blotSheet, 'opacity', blotOn ? '1' : '0');            // opacity, not display: no layer churn
    if (blotOn) {
      const wB = wet(IMPACT_T, 3.6)(t);
      put(this.blotCore, 'r', f1(blotR(t)));
      put(this.blotDisp, 'scale', f1(18 + 36 * wB));
      put(this.blotBlur, 'stdDeviation', f1(3 + 3 * wB));
      const drain = 1 - ramp(t, 2.0, 3.6);
      for (const s of this.spatter) {
        const p = ease.outCubic(clamp((t - IMPACT_T - s.delay) / 0.3));
        const d = s.d * p, x = ix + Math.cos(s.a) * d, y = iy + Math.sin(s.a) * d * 0.85;
        const rr = s.rr * (0.5 + 0.5 * p) * drain;
        put(s.el, 'cx', f1(x)); put(s.el, 'cy', f1(y));
        put(s.el, 'rx', f1(rr * (1.4 + 0.9 * (1 - p)))); put(s.el, 'ry', f1(rr));
        put(s.el, 'transform', `rotate(${f1(s.a * 180 / Math.PI)} ${f1(x)} ${f1(y)})`);
      }
    }

    // ---- ink layers: arrival threshold, displacement and blur (wet → dry) ----
    for (const k in LAYERS) {
      const c = LAYERS[k], w = c.wet(t);
      L[k].set(c.thr(t), w);
    }

    // ---- afterglow: warm light, mist drifting, birds ----
    put(this.glow, 'opacity', f2(ramp(t, 6.0, 9.2)));
    const mistA = ramp(t, 3.0, 4.6);
    put(this.mistG, 'opacity', f2(mistA));
    if (mistA > 0) for (const m of this.mists) put(m.el, 'cx', f1(m.x + m.v * t));
    const bA = ramp(t, 5.8, 7.2);
    put(this.birds, 'opacity', f2(bA));
    if (bA > 0) [[0, 0, 1], [38, 16, 0.8], [-30, 30, 0.7]].forEach(([dx, dy, s], i) => {
      const bx = 220 + dx + 26 * t, by = 330 + dy - 4 * t + 3 * Math.sin(t * 1.3 + i);
      const flap = Math.sin(t * 5.5 + i * 2.1) * 6 * s, w = 15 * s;
      put(this.birdPaths[i], 'd', `M${f1(bx - w)},${f1(by - flap)}Q${f1(bx - w * 0.4)},${f1(by - 3 - flap * 0.3)} ${f1(bx)},${f1(by + 2)}Q${f1(bx + w * 0.4)},${f1(by - 3 - flap * 0.3)} ${f1(bx + w)},${f1(by - flap)}Q${f1(bx + w * 0.4)},${f1(by - 1 - flap * 0.2)} ${f1(bx)},${f1(by + 4.5)}Q${f1(bx - w * 0.4)},${f1(by - 1 - flap * 0.2)} ${f1(bx - w)},${f1(by - flap)}Z`);
    });

    // ---- the seal presses in: overshoot, settle; coverage grows with pressure (alpha = 4·noise − c) ----
    const sp = clamp((t - 7.9) / 0.5);
    const sc = lerp(1.12, 1, ease.outBack(sp, 1.2));
    put(this.seal, 'opacity', f2(ease.outCubic(Math.min(1, sp * 2.5))));
    put(this.sealInner, 'transform', `translate(${this.sealC[0]} ${this.sealC[1]}) scale(${Math.round(sc * 1000) / 1000}) translate(${-this.sealC[0]} ${-this.sealC[1]})`);
    // ---- loop: in the last half second a second copy of the sheet rises over the ink (the ink sinks back
    //      into the paper), so the jump to t = 0 — blank paper — is seamless. One layer's opacity instead of
    //      fading every ink sheet (their filters keep their tiles and nothing re-rasters for the dissolve). ----
    setStyle(this.veil, 'opacity', ramp(t, D - 0.55, D).toFixed(3));
    put(this.sealPress, 'values', `0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 4 0 0 ${f2(lerp(-1.5, 0.2, ease.outCubic(sp)))}`);
  },
});
