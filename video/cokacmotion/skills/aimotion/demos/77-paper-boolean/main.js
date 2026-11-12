/*
 * 77 · 오리고 붙인 풍경 — a toy paper theatre built from Paper.js boolean operations.
 * The curtain parts (0.35–1.55 s); cut-paper flats slide in from the wings and up through the stage slot (0.6–2.6 s);
 * clouds inflate as live unions of circles (1.9–3.0 s) and the sun is cut out of the sky (a live subtract that
 * moves every frame). Day turns to dusk: paper strips of sunset slide in and the same sun disc is cut through
 * each of them as it sinks behind the hills; the village's shutters fold open one by one and the warm layer
 * behind the subtracted windows glows (5.5–7.6 s). Night: a crescent moon is cut live (disc minus a sliding
 * disc), stars are punched out of the sky one by one, the footlights come up (6.6–8.8 s), and the tableau rests.
 *
 * setup(): paper.setup on a stage canvas (hidpi off, autoUpdate off, insertItems off); every static flat is built
 *          once from unite/subtract/intersect/exclude and hand-cut (resampled, wobbled, smoothed); a paper grain
 *          canvas becomes a multiply Raster.
 * frame(t): every transform, colour and live boolean is set from t (live booleans are cached by their rounded
 *          inputs), then view.update(true). No onFrame, no randomness at draw time.
 */
import { defineDemo, track, ease, clamp, ramp, rand } from '../_lib/stage.js';
import { pt, rect, circle, ellipse, poly, star, uniteAll, compound, handCut, slot, tod, col, hash, NIGHT } from './cut.js';

const W = 1080, H = 1920, D = 10;
const P = window.paper;

// ---- palette: warm paper — terracotta, sage, mustard, cream, navy ([day, dusk, night] where it changes) ------
const NAVY = [35, 50, 77], MUSTARD = [217, 164, 58], TERRA = [192, 88, 62];
const PAL = {
  backing: [[247, 236, 212], [249, 232, 204], [252, 240, 212]],
  sun: [[232, 170, 58], [232, 120, 60], [214, 92, 60]],
  sky: [[180, 209, 202], [236, 172, 128], [34, 48, 78]],
  rays: [[242, 202, 98], [244, 178, 96], [244, 178, 96]],
  strips: [
    [[240, 196, 124], [240, 196, 124], [62, 68, 106]],
    [[232, 148, 104], [232, 148, 104], [52, 56, 94]],
    [[206, 108, 94], [206, 108, 94], [43, 45, 82]],
  ],
  cloud: [[252, 247, 236], [248, 206, 178], [70, 84, 118]],
  far: [[163, 184, 150], [160, 142, 126], [40, 54, 76]],
  village: [[198, 102, 74], [170, 88, 72], [50, 43, 63]],
  shutter: [[52, 80, 98], [56, 66, 86], [28, 34, 52]],
  shutterBack: [[78, 110, 124], [80, 90, 108], [40, 48, 68]],
  glass: [[44, 52, 72], [120, 84, 70], [255, 206, 112]],
  meadow: [[188, 196, 130], [172, 150, 106], [46, 64, 62]],
  river: [[142, 190, 198], [236, 166, 124], [48, 72, 112]],
  ripple: [[250, 244, 226], [252, 226, 196], [240, 206, 146]],
  hillL: [[222, 168, 64], [206, 128, 70], [76, 62, 58]],
  hillR: [[108, 142, 102], [112, 118, 90], [34, 52, 56]],
  daisy: [[252, 246, 232], [250, 222, 200], [150, 156, 178]],
  daisyC: [[226, 160, 52], [222, 130, 60], [120, 96, 70]],
  shadow: [[60, 36, 20], [60, 30, 26], [6, 8, 22]],
};

// ---- timeline ----------------------------------------------------------------------------------------------
const CURTAIN = [0.35, 1.2];                                   // start, duration
// flats: [start, duration, from dx, from dy, z-order index for jitter]
const ENTER = {
  far: [0.6, 1.0, -1100, 0], village: [0.9, 1.0, 1100, 0], meadow: [1.15, 1.0, 0, 560],
  hillL: [1.4, 0.95, -900, 0], hillR: [1.55, 0.95, 900, 0],
};
const STRIPS = [[800, 16, 0.4, 4.3, -1100], [868, 13, 2.1, 4.55, 1100], [930, 11, 4.4, 4.8, -1100]];   // y, wave, phase, enter, from
const sunPath = track([[2.2, [742, 500]], [4.0, [735, 530]], [6.9, [655, 1070]]]);
const SUN_R = 64;
const sunR = (t) => SUN_R * (ease.outBack(clamp((t - 2.2) / 0.7), 1.4) - ease.inCubic(clamp((t - 7.0) / 0.3)));
const rayK = (t) => ease.outBack(clamp((t - 2.45) / 0.6), 1.6) * (1 - ease.inCubic(clamp((t - 5.4) / 0.6)));
const moonPath = track([[6.6, [292, 580]], [9.6, [326, 484], ease.outCubic]]);
const MOON_R = 58, MOON_DIR = [-0.78, -0.62];
const moonK = (t) => ease.outBack(clamp((t - 6.6) / 0.6), 1.3);
const moonD = track([[6.6, 0.3], [9.2, 0.82]]);                // shadow-disc offset / R: the crescent waxes
const SHUTTERS = [5.5, 2.0, 0.5];                              // first, spread, each
const STARS_AT = [7.0, 1.7];
const LIGHTS = [7.4, 8.4];                                     // footlights come up

// ---- the flats (static geometry, stage coordinates) ---------------------------------------------------------
const OPEN = { x: 96, y: 210, w: 888, bottom: 1572, r: 60 };
/** the proscenium opening (grown by g): square at the stage floor, rounded at the top — one path, no coincident edges */
function opening(g) {
  const x = OPEN.x - g, y = OPEN.y - g, w = OPEN.w + 2 * g, h = OPEN.bottom - OPEN.y + 2 * g, r = OPEN.r + g, k = 0.5523 * r;
  return new P.Path({
    segments: [[[x, y + h]], [[x, y + r], [0, 0], [0, -k]], [[x + r, y], [-k, 0], [0, 0]],
      [[x + w - r, y], [0, 0], [k, 0]], [[x + w, y + r], [0, -k], [0, 0]], [[x + w, y + h]]],
    closed: true,
  });
}

const lollipop = (x, yb, r, h) => [circle(x, yb - h - r * 0.8, r), rect(x - 5, yb - h - r * 0.4, 10, h + r * 0.4 + 12)];
const fir = (x, yb, w, h) => [
  poly([[x - w / 2, yb - h * 0.28], [x, yb - h * 0.72], [x + w / 2, yb - h * 0.28]]),
  poly([[x - w * 0.42, yb - h * 0.55], [x, yb - h], [x + w * 0.42, yb - h * 0.55]]),
  rect(x - 4, yb - h * 0.32, 8, h * 0.32 + 12),
];

const BASE = 1300;   // village bottom (hidden behind the meadow)
const BUILDINGS = [
  { x: 118, w: 96, top: 1132, roof: 'gable', rh: 52, chim: [64, 14, 40] },
  { x: 210, w: 78, top: 1104, roof: 'gable', rh: 46 },          // walls overlap a little: no shared edges
  { x: 300, w: 132, top: 1126, roof: 'gable', rh: 56, church: true },
  { x: 428, w: 64, top: 994, roof: 'spire', rh: 124, tower: true },
  { x: 506, w: 92, top: 1136, roof: 'gable', rh: 62, chim: [16, 12, 34] },
  { x: 606, w: 112, top: 1064, roof: 'stepped' },
  { x: 726, w: 84, top: 1122, roof: 'gable', rh: 50, chim: [56, 12, 30] },
  { x: 812, w: 64, top: 1072, roof: 'mill' },
  { x: 888, w: 92, top: 1142, roof: 'gable', rh: 48 },
];
const WIN_W = 18, WIN_H = 26, WIN_BOTTOM = 1220;   // windows must sit above the meadow's edge

function villageParts() {
  const parts = [rect(92, 1200, 900, BASE - 1200 + 40)];
  const windows = [];
  for (const b of BUILDINGS) {
    const { x, w, top } = b;
    if (b.roof === 'mill') {
      parts.push(poly([[x, BASE], [x + 12, top], [x + w - 12, top], [x + w, BASE]]), ellipse(x + w / 2, top + 2, w / 2 - 6, 24));
      windows.push({ kind: 'round', x: x + w / 2, y: top + 52, r: 8 });
      continue;
    }
    parts.push(rect(x, top, w, BASE - top));
    if (b.roof === 'gable') parts.push(poly([[x - 6, top + 1], [x + w / 2, top - b.rh], [x + w + 6, top + 1]]));
    if (b.roof === 'spire') {
      const cx = x + w / 2;
      parts.push(poly([[x - 4, top + 1], [cx, top - b.rh], [x + w + 4, top + 1]]),
        rect(cx - 2, top - b.rh - 28, 4, 32), rect(cx - 9, top - b.rh - 20, 18, 4));
    }
    if (b.roof === 'stepped') parts.push(rect(x + 6, top - 20, w - 12, 21), rect(x + 20, top - 40, w - 40, 21), rect(x + 36, top - 58, w - 72, 19));
    if (b.chim) parts.push(rect(x + b.chim[0], top - b.rh * 0.62 - b.chim[2], b.chim[1], b.chim[2] + b.rh * 0.5));
    if (b.tower) {
      windows.push({ kind: 'round', x: x + w / 2, y: top + 38, r: 12 }, { kind: 'arch', x: x + w / 2, y: top + 100, w: 12, h: 30 });
    } else if (b.church) {
      for (let k = 0; k < 3; k++) windows.push({ kind: 'arch', x: x + w * (k + 0.5) / 3, y: top + 42, w: 16, h: 32 });
    } else {
      const cols = w >= 100 ? 3 : w >= 76 ? 2 : 1;
      for (let y = top + 24; y + WIN_H < WIN_BOTTOM; y += 52) {
        for (let k = 0; k < cols; k++) windows.push({ kind: 'rect', x: x + w * (k + 0.5) / cols, y: y + WIN_H / 2, w: WIN_W, h: WIN_H, shutters: true });
      }
    }
  }
  parts.push(...lollipop(98, 1240, 24, 64), ...lollipop(992, 1240, 22, 56));
  return { parts, windows };
}
const windowShape = (wn, grow = 0) => {
  if (wn.kind === 'round') return circle(wn.x, wn.y, wn.r + grow);
  if (wn.kind === 'arch') {
    const hw = wn.w / 2 + grow;
    // the arch's circle is 0.4 px wider than the shaft so the two cross instead of touching tangentially
    return uniteAll([rect(wn.x - hw, wn.y - wn.h / 2 + hw, 2 * hw, wn.h - hw + grow), circle(wn.x, wn.y - wn.h / 2 + hw, hw + 0.4)]);
  }
  return rect(wn.x - wn.w / 2 - grow, wn.y - wn.h / 2 - grow, wn.w + 2 * grow, wn.h + 2 * grow);
};

// river: a ribbon that widens toward us, cut to the meadow by intersect
function riverRibbon() {
  const P0 = [590, 1226], P1 = [470, 1330], P2 = [700, 1440], P3 = [420, 1660];
  const bez = (s) => {
    const u = 1 - s;
    return [u * u * u * P0[0] + 3 * u * u * s * P1[0] + 3 * u * s * s * P2[0] + s * s * s * P3[0],
      u * u * u * P0[1] + 3 * u * u * s * P1[1] + 3 * u * s * s * P2[1] + s * s * s * P3[1]];
  };
  const width = (s) => 8 + 210 * Math.pow(s, 1.5);
  const L = [], R = [], center = [];
  for (let i = 0; i <= 28; i++) {
    const s = i / 28, a = bez(Math.max(0, s - 0.01)), b = bez(Math.min(1, s + 0.01)), c = bez(s);
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), hw = width(s) / 2;
    L.push([c[0] - (dy / l) * hw, c[1] + (dx / l) * hw]);
    R.push([c[0] + (dy / l) * hw, c[1] - (dx / l) * hw]);
    center.push(c);
  }
  const shape = poly([...L, ...R.reverse()]);
  shape.smooth({ type: 'catmull-rom', factor: 0.5 });
  return { shape, bez, width };
}

// ---- paper grain (a canvas made once; drawn as a multiply Raster) ------------------------------------------
function grainCanvas() {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const img = g.createImageData(W, H), d = img.data, r = rand(77);
  const CW = 30, gw = Math.ceil(W / CW) + 2, coarse = new Float32Array(gw * (Math.ceil(H / CW) + 2));
  for (let i = 0; i < coarse.length; i++) coarse[i] = r();
  for (let y = 0; y < H; y++) {
    const fy = y / CW, iy = Math.floor(fy), ty = fy - iy;
    for (let x = 0; x < W; x++) {
      const fx = x / CW, ix = Math.floor(fx), tx = fx - ix;
      const a = coarse[iy * gw + ix], b = coarse[iy * gw + ix + 1], cc = coarse[(iy + 1) * gw + ix], e = coarse[(iy + 1) * gw + ix + 1];
      const m = (a + (b - a) * tx) * (1 - ty) + (cc + (e - cc) * tx) * ty;
      const v = 255 - m * 12 - r() * 16;
      const i = (y * W + x) * 4;
      d[i] = v; d[i + 1] = v - 1; d[i + 2] = v - 4; d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  g.lineWidth = 0.8;
  for (let i = 0; i < 1800; i++) {
    const x = r() * W, y = r() * H, a = r() * Math.PI, l = 5 + r() * 16;
    g.strokeStyle = `rgba(120, 100, 80, ${0.08 + r() * 0.1})`;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  return c;
}

// ---- helpers for flats --------------------------------------------------------------------------------------
const shadowStyle = { color: null, blur: 14, off: [5, 7] };
function card(item, fill, k = 1) {
  if (!item) return item;
  item.fillColor = fill;
  item.shadowColor = shadowStyle.color;
  item.shadowBlur = shadowStyle.blur * k;
  item.shadowOffset = pt(shadowStyle.off[0] * k, shadowStyle.off[1] * k);
  return item;
}
function flat(parent) {
  const g = new P.Group();
  g.applyMatrix = false;
  parent.addChild(g);
  return g;
}
/** slide-in from the wings (outBack, with a small tilt that settles), then a slow sway + 12 fps stop-motion jitter */
function flatMatrix(idx, t, enter, pivot, sway = 0.22) {
  let dx = 0, dy = 0, tilt = 0;
  if (enter) {
    const [t0, dur, fx, fy] = enter, u = clamp((t - t0) / dur), e = ease.outBack(u, 1.25);
    dx = fx * (1 - e); dy = fy * (1 - e); tilt = (1 - ease.outCubic(u)) * (fx ? Math.sign(fx) * 3 : 2);
  }
  const f = Math.floor(t * 12);
  const jx = (hash(idx, f) - 0.5) * 1.2, jy = (hash(idx + 31, f) - 0.5) * 1.0, jr = (hash(idx + 57, f) - 0.5) * 0.12;
  const rot = tilt + sway * Math.sin(t * (0.9 + 0.13 * idx) + idx * 1.7) + jr;
  return new P.Matrix().translate(dx + jx, dy + jy).rotate(rot, pivot);
}
const radial = (x, y, r, rgb, a0) => ({
  gradient: { stops: [[col(rgb, a0), 0], [col(rgb, a0 * 0.35), 0.45], [col(rgb, 0), 1]], radial: true },
  origin: pt(x, y), destination: pt(x + r, y),
});

// ---- build -------------------------------------------------------------------------------------------------
function build(S) {
  const root = P.project.activeLayer;
  shadowStyle.color = col(PAL.shadow[0], 0.3);
  const r = rand(4021);

  // backdrop: the cream light box, the sun disc behind the sky, the sky card with live holes
  S.backing = rect(30, 120, 1020, 1520); root.addChild(S.backing);
  S.sunDisc = circle(0, 0, SUN_R + 12); S.sunDisc.applyMatrix = false; root.addChild(S.sunDisc);
  S.skyRect = rect(30, 120, 1020, 1520);
  S.sky = slot(root);
  S.sunHole = handCut(circle(0, 0, SUN_R), 8, 1.1, 1);
  S.moonDisc = handCut(circle(0, 0, MOON_R), 8, 1.0, 2);
  // stars: 5-point stars and a few round pricks, placed off the moon and clouds
  S.stars = [];
  const avoid = [[180, 470, 400, 640], [670, 330, 900, 440], [560, 720, 830, 860]];
  for (let tries = 0; S.stars.length < 24 && tries < 2000; tries++) {
    const x = 140 + r() * 800, y = 385 + r() * 400;
    if (Math.hypot(x - 310, y - 530) < 120) continue;
    if (avoid.some(([a, b, c, d]) => x > a && x < c && y > b && y < d)) continue;
    if (S.stars.some((s) => Math.hypot(s.x - x, s.y - y) < 64)) continue;
    const round = S.stars.length % 3 === 2, R = round ? 3 + r() * 2 : 8 + r() * 9;
    S.stars.push({ x, y, R, round, rot: r() * 72, base: round ? circle(0, 0, R) : star(0, 0, 5, R, R * 0.42, r() * 72) });
  }
  S.stars.forEach((s, i) => { s.t0 = STARS_AT[0] + STARS_AT[1] * (i / S.stars.length) + r() * 0.15; s.tw = r() * 6.28; });
  // glows (screen): the moon and each star
  S.moonGlow = circle(0, 0, 150); S.moonGlow.applyMatrix = false; S.moonGlow.blendMode = 'screen'; root.addChild(S.moonGlow);
  S.moonGlow.fillColor = radial(0, 0, 150, [255, 240, 200], 0.55);
  S.starGlows = S.stars.map((s) => {
    const g = circle(s.x, s.y, s.R * 2.6 + 6);
    g.blendMode = 'screen'; g.fillColor = radial(s.x, s.y, s.R * 2.6 + 6, [255, 236, 190], 0.6);
    root.addChild(g);
    return g;
  });
  // the sun's paper burst: a 16-point star minus a circle → a ring of rays
  S.rays = star(0, 0, 16, 124, 100).subtract(circle(0, 0, 92));
  S.rays = handCut(S.rays, 5, 0.6, 3) || S.rays;
  S.rays.applyMatrix = false; root.addChild(S.rays);

  // sunset strips (the sun is cut through them too while it passes behind)
  S.strips = STRIPS.map(([Y, A, ph, t0, from], i) => {
    const pts = [];
    for (let x = -30; x <= W + 30; x += 24) pts.push([x, Y + A * Math.sin(x / 110 + ph) + 6 * Math.sin(x / 37 + ph * 2.1)]);
    pts.push([W + 30, 1320], [-30, 1320]);
    const base = handCut(poly(pts), 10, 1.0, 4 + i);
    const g = flat(root);
    return { base, g, s: slot(g), enter: [t0, 0.9, from, 0], pal: PAL.strips[i] };
  });

  // clouds: unions of circles with a flat bottom (intersect), hand-cut — inflated live, then cached
  S.clouds = [
    { x: 250, y: 610, s: 1.0, t0: 1.9, v: 6, c: [[-118, -8, 40], [-62, -30, 58], [4, -46, 72], [78, -26, 56], [128, -6, 38]] },
    { x: 790, y: 430, s: 0.72, t0: 2.15, v: 9, c: [[-96, -6, 36], [-40, -34, 54], [24, -40, 60], [86, -12, 40]] },
    { x: 690, y: 846, s: 0.86, t0: 2.4, v: 7, c: [[-110, -6, 38], [-52, -26, 52], [10, -38, 60], [70, -22, 48], [118, -4, 32]] },
  ].map((c) => { const g = flat(root); return { ...c, g, s: slot(g) }; });
  S.cloudFloor = rect(-320, -320, 640, 320.5);

  // far hills: united blobs and poplars, hand-cut
  S.farG = flat(root);
  const farParts = [ellipse(180, 1060, 270, 122), ellipse(520, 1030, 300, 140), ellipse(880, 1070, 290, 116), rect(-40, 1060, 1160, 640)];
  for (const [x, y] of [[392, 880], [416, 872], [440, 878], [862, 930], [884, 924]]) farParts.push(ellipse(x, y, 9, 32));
  S.far = card(handCut(uniteAll(farParts), 12, 1.6, 5), null);
  S.farG.addChild(S.far);

  // village: houses ∪ roofs ∪ chimneys ∪ spire ∪ trees, minus every window; the glass layer sits behind it
  S.villageG = flat(root);
  const { parts, windows } = villageParts();
  S.windows = windows;
  S.glass = uniteAll(windows.map((w) => windowShape(w, 4)));
  S.villageG.addChild(S.glass);
  S.village = uniteAll(parts).subtract(compound(windows.map((w) => windowShape(w))));
  S.villageG.addChild(S.village);
  // windmill sails: a separate card turning on its hub
  const hub = [BUILDINGS[7].x + BUILDINGS[7].w / 2, BUILDINGS[7].top - 6];
  const sails = [];
  for (let k = 0; k < 4; k++) {
    const arm = uniteAll([rect(-3, -92, 6, 92), rect(2, -86, 15, 60)]);
    arm.rotate(k * 90, pt(0, 0));
    sails.push(arm);
  }
  S.sails = uniteAll([...sails, circle(0, 0, 8)]).subtract(circle(0, 0, 3));
  S.sails.applyMatrix = false; S.sailsHub = hub;
  S.villageG.addChild(S.sails);
  S.shutters = slot(S.villageG);
  // shutter order: a shuffled cascade
  const order = windows.map((w, i) => i).filter((i) => windows[i].shutters);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  order.forEach((wi, k) => { windows[wi].tOpen = SHUTTERS[0] + SHUTTERS[1] * (k / order.length) + r() * 0.1; });
  S.halos = windows.map((w) => {
    const h = circle(w.x, w.y, 34);
    h.blendMode = 'screen'; h.fillColor = radial(w.x, w.y, 34, [255, 196, 96], 0.8);
    S.villageG.addChild(h);
    return h;
  });

  // meadow with the river (ribbon ∩ meadow) and live ripples (ripples ∩ river)
  S.meadowG = flat(root);
  const meadow = handCut(uniteAll([ellipse(230, 1300, 340, 64), ellipse(640, 1282, 380, 58), ellipse(990, 1306, 270, 74), rect(-40, 1290, 1160, 420)]), 12, 1.4, 6);
  S.meadow = card(meadow, null);
  S.meadowG.addChild(S.meadow);
  const rib = riverRibbon();
  S.river = card(rib.shape.intersect(meadow), null, 0.5);
  S.meadowG.addChild(S.river);
  S.riverBez = rib.bez; S.riverW = rib.width;
  S.ripples = slot(S.meadowG);
  S.rippleSeeds = Array.from({ length: 9 }, () => [(r() - 0.5) * 0.5, 0.75 + r() * 0.5]);

  // front hills with trees, and a few cut-paper daisies
  const daisy = (x, y, s) => {
    const petals = [];
    for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2; petals.push(circle(x + Math.cos(a) * 9 * s, y + Math.sin(a) * 9 * s, 6.5 * s)); }
    return { flower: uniteAll(petals), heart: circle(x, y, 5 * s) };
  };
  S.hillLG = flat(root);
  S.hillL = card(handCut(uniteAll([ellipse(190, 1490, 340, 150), rect(-60, 1490, 600, 220),
    ...lollipop(130, 1356, 44, 70), ...fir(300, 1352, 74, 120)]), 9, 1.3, 7), null);
  S.hillLG.addChild(S.hillL);
  S.hillRG = flat(root);
  S.hillR = card(handCut(uniteAll([ellipse(910, 1510, 300, 135), rect(560, 1510, 600, 220),
    ...lollipop(852, 1392, 36, 56), ...lollipop(975, 1404, 28, 50), ...fir(756, 1400, 60, 104)]), 9, 1.3, 8), null);
  S.hillRG.addChild(S.hillR);
  S.daisies = [[[120, 1468, 1.1], [236, 1452, 0.9], [370, 1498, 1.0]], [[700, 1486, 0.95], [818, 1462, 1.05], [940, 1490, 0.9]]].map((list, side) =>
    list.map(([x, y, s]) => {
      const d = daisy(x, y, s);
      (side ? S.hillRG : S.hillLG).addChild(d.flower);
      (side ? S.hillRG : S.hillLG).addChild(d.heart);
      return d;
    }));

  // warm footlight wash at night
  S.footGlow = ellipse(540, 1600, 620, 330);
  S.footGlow.blendMode = 'screen'; S.footGlow.fillColor = radial(540, 1600, 620, [255, 190, 110], 0.5);
  root.addChild(S.footGlow);

  // ---- the theatre: curtain panels, drapes, valance, frame ----
  const curtainPanel = (x0) => {
    const g = flat(root);
    const panel = rect(x0, 228, 480, 1366);
    const medal = circle(x0 + 240, 900, 62).exclude(star(x0 + 240, 900, 8, 84, 34, 22.5));   // exclude: a star-cut medallion
    g.addChild(card(panel, col([186, 80, 60]), 1.2));
    for (let k = 1; k < 8; k++) {
      const x = x0 + k * 60;
      const fold = new P.Path({ segments: [[x, 236], [x + 6 * Math.sin(k), 900], [x - 4, 1586]] });
      fold.smooth({ type: 'catmull-rom' });
      fold.strokeColor = col([140, 54, 42], 0.55); fold.strokeWidth = 3;
      g.addChild(fold);
    }
    g.addChild(card(medal, col(MUSTARD), 0.5));
    return g;
  };
  S.curtL = curtainPanel(70); S.curtR = curtainPanel(530);

  const drape = new P.Path({
    segments: [[[50, 290], [0, 0], [0, 0]], [[300, 290], [0, 0], [-40, 220]], [[176, 980], [36, -250], [-24, 140]], [[262, 1574], [-10, -250], [0, 0]], [[50, 1590], [0, 0], [0, 0]]],
    closed: true,
  });
  const drapes = flat(root);
  const drapeR = drape.clone().scale(-1, 1, pt(540, 0));
  for (const d of [drape, drapeR]) drapes.addChild(card(d, col([172, 72, 56]), 1.2));
  for (const sx of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const mx = (v) => 540 - sx * (540 - v);                  // left drape, or its mirror
      const fold = new P.Path({ segments: [[mx(90 + k * 50), 296], [mx(150 + k * 12), 976], [mx(110 + k * 60), 1570]] });
      fold.smooth({ type: 'catmull-rom' });
      fold.strokeColor = col([128, 48, 38], 0.5); fold.strokeWidth = 3;
      drapes.addChild(fold);
    }
    const tie = rect(118, 962, 104, 22, 10); tie.rotate(8);
    const tassel = uniteAll([circle(206, 1000, 9), poly([[198, 1004], [214, 1004], [212, 1046], [200, 1046]])]);
    if (sx < 0) { tie.scale(-1, 1, pt(540, 0)); tassel.scale(-1, 1, pt(540, 0)); }
    drapes.addChild(card(tie, col(MUSTARD), 0.6));
    drapes.addChild(card(tassel, col(MUSTARD), 0.6));
  }
  S.drapes = drapes;

  const valance = flat(root);
  const scallops = [];
  for (let k = 0; k < 13; k++) scallops.push(circle(70 + 36 + k * 72.3, 298, 37));
  const val = handCut(uniteAll([rect(60, 170, 960, 130), ...scallops]), 7, 0.8, 9);
  valance.addChild(card(val.clone().translate(pt(0, 16)), col(MUSTARD), 0.8));
  valance.addChild(card(val, col(TERRA), 1.1));
  for (let k = 0; k < 12; k++) {
    const x = 70 + 72 + k * 72.3;
    valance.addChild(card(uniteAll([circle(x, 336, 7), poly([[x - 5, 338], [x + 5, 338], [x, 364]])]), col(MUSTARD), 0.5));
  }
  S.valance = valance;

  const frame = (S.frame = flat(root));
  frame.addChild(card(opening(14).subtract(opening(0)), col(MUSTARD), 0.6));            // the gilt trim ring
  frame.addChild(card(rect(0, 0, W, H).subtract(opening(14)), col(NAVY), 1.8));          // the proscenium
  for (const x of [34, 1032]) frame.addChild(card(uniteAll([rect(x, 214, 14, 1360), rect(x - 9, 200, 32, 18), rect(x - 9, 1566, 32, 18)]), col(MUSTARD), 0.5));
  frame.addChild(card(circle(540, 104, 44).exclude(star(540, 104, 10, 60, 30)), col(MUSTARD), 0.6));   // crest
  for (const sx of [1, -1]) {
    const leaf = ellipse(540 + sx * 92, 106, 44, 13); leaf.rotate(sx * -14);
    frame.addChild(card(leaf, col(MUSTARD), 0.5));
  }
  frame.addChild(card(rect(70, 1612, 940, 5), col(MUSTARD), 0.3));
  frame.addChild(card(rect(70, 1624, 940, 2), col(MUSTARD), 0.2));
  S.lamps = [];
  for (let k = 0; k < 8; k++) {
    const x = 150 + k * 111.4;
    const lamp = circle(x, 1600, 14).intersect(rect(x - 16, 1585, 32, 14.5));
    frame.addChild(card(lamp, null, 0.3));
    const glow = circle(x, 1588, 46);
    glow.blendMode = 'screen'; glow.fillColor = radial(x, 1588, 46, [255, 214, 140], 0.9);
    frame.addChild(glow);
    S.lamps.push({ lamp, glow });
  }

  // vignette and paper grain over everything
  const vig = rect(0, 0, W, H);
  vig.fillColor = { gradient: { stops: [[col([255, 255, 255]), 0.55], [col([214, 200, 186]), 1]], radial: true }, origin: pt(540, 900), destination: pt(540 + 1150, 900) };
  vig.blendMode = 'multiply';
  root.addChild(vig);
  const grain = new P.Raster(grainCanvas());
  grain.position = pt(W / 2, H / 2);
  grain.blendMode = 'multiply';
  root.addChild(grain);
}

// ---- frame -------------------------------------------------------------------------------------------------
function update(S, t) {
  const night = ramp(t, NIGHT[0], NIGHT[1]);
  shadowStyle.color = col(tod(PAL.shadow, t), 0.3 + 0.18 * night);
  const sh = shadowStyle.color;
  const restyle = (item, rgb, k = 1) => card(item, col(rgb), k);

  S.backing.fillColor = col(tod(PAL.backing, t));

  // sun, its rays, the sky with its live holes (sun, crescent moon, stars)
  const [sx, sy] = sunPath(t), sr = Math.max(0, sunR(t));
  S.sunDisc.matrix = new P.Matrix().translate(sx, sy);
  S.sunDisc.fillColor = col(tod(PAL.sun, t));
  S.sunDisc.visible = sr > 0.5;
  const rk = rayK(t);
  S.rays.visible = rk > 0.01;
  S.rays.matrix = new P.Matrix().translate(sx, sy).rotate(t * 8).scale(Math.max(rk, 0.001));
  card(S.rays, col(tod(PAL.rays, t)), 0.5);

  const [mx, my] = moonPath(t), mk = t >= 6.6 ? moonK(t) : 0, md = moonD(t) * MOON_R;
  const starK = S.stars.map((s) => (t >= s.t0 ? ease.outBack(clamp((t - s.t0) / 0.4), 1.8) : 0));
  const skyKey = [sx, sy, sr, mx, my, mk, md].map((v) => v.toFixed(2)).join(',') + '|' + starK.map((k) => k.toFixed(3)).join(',');
  const sky = S.sky.set(skyKey, () => {
    const holes = [];
    if (sr > 0.5) holes.push(S.sunHole.clone().scale(sr / SUN_R, pt(0, 0)).translate(pt(sx, sy)));
    if (mk > 0.01) {
      const disc = S.moonDisc.clone().scale(mk, pt(0, 0)).translate(pt(mx, my));
      const shade = circle(mx + MOON_DIR[0] * md * mk, my + MOON_DIR[1] * md * mk, MOON_R * 1.04 * mk);
      const crescent = disc.subtract(shade);                   // the crescent window, recut every frame
      if (crescent && !crescent.isEmpty()) holes.push(crescent);
    }
    S.stars.forEach((s, i) => { if (starK[i] > 0.01) holes.push(s.base.clone().scale(starK[i], pt(0, 0)).translate(pt(s.x, s.y))); });
    return holes.length ? S.skyRect.subtract(compound(holes)) : S.skyRect.clone();
  });
  card(sky, col(tod(PAL.sky, t)), 0.8);
  S.moonGlow.matrix = new P.Matrix().translate(mx, my);
  S.moonGlow.opacity = mk > 0 ? 0.7 * ramp(t, 6.9, 8.2) : 0;
  S.moonGlow.visible = S.moonGlow.opacity > 0.005;
  S.stars.forEach((s, i) => {
    const o = starK[i] > 0 ? clamp(starK[i]) * (0.55 + 0.45 * Math.sin(t * 3.1 + s.tw)) : 0;
    S.starGlows[i].opacity = o; S.starGlows[i].visible = o > 0.005;
  });

  // sunset strips: slide in at dusk; the sun disc is subtracted from each while it passes behind
  const sunPt = pt(sx, sy);
  S.strips.forEach((st, i) => {
    st.g.visible = t >= st.enter[0];
    st.g.matrix = flatMatrix(10 + i, t, st.enter, pt(540, 1000), 0.15);
    const local = st.g.matrix.inverseTransform(sunPt);
    const over = sr > 0.5 && local.y + sr > st.base.bounds.top - 2;
    const key = over ? `${local.x.toFixed(1)},${local.y.toFixed(1)},${sr.toFixed(2)}` : 'plain';
    const item = st.s.set(key, () => (over ? st.base.subtract(S.sunHole.clone().scale(sr / SUN_R, pt(0, 0)).translate(local)) : st.base.clone()));
    card(item, col(tod(st.pal, t)), 0.8);
  });

  // clouds: live union of growing circles ∩ a flat floor, hand-cut; drifting
  S.clouds.forEach((c, i) => {
    c.g.matrix = flatMatrix(20 + i, t, null, pt(0, 0), 0.4).prepend(new P.Matrix().translate(c.x + (t - 2) * c.v, c.y));
    const ks = c.c.map((_, j) => ease.outBack(clamp((t - c.t0 - 0.08 * j) / 0.5), 1.4));
    const key = ks.map((k) => k.toFixed(3)).join(',');
    const item = c.s.set(key, () => {
      const circles = c.c.map(([x, y, rr], j) => (ks[j] > 0.02 ? circle(x * c.s, y * c.s, rr * c.s * ks[j]) : null)).filter(Boolean);
      if (!circles.length) return null;
      return handCut(uniteAll(circles).intersect(S.cloudFloor), 8, 0.9, 10 + i);
    });
    card(item, col(tod(PAL.cloud, t)), 0.7);
  });

  // the flats
  S.farG.matrix = flatMatrix(1, t, ENTER.far, pt(540, 1300));
  restyle(S.far, tod(PAL.far, t));
  S.villageG.matrix = flatMatrix(2, t, ENTER.village, pt(540, 1300));
  restyle(S.village, tod(PAL.village, t));
  S.glass.fillColor = col(tod(PAL.glass, t));
  restyle(S.sails, tod(PAL.village, t), 0.6);
  S.sails.matrix = new P.Matrix().translate(S.sailsHub[0], S.sailsHub[1]).rotate(18 + t * 14);
  // shutters fold back on their hinges (scale x = cos πe about the outer edge: closed → edge-on → flat on the wall)
  const sk = S.windows.map((w) => (w.shutters ? ease.inOutCubic(clamp((t - w.tOpen) / SHUTTERS[2])) : 1));
  const shutterKey = sk.map((k) => k.toFixed(3)).join(',');
  const shut = S.shutters.set(shutterKey, () => {
    const g = new P.Group();
    S.windows.forEach((w, i) => {
      if (!w.shutters) return;
      const c = Math.cos(Math.PI * sk[i]), hw = (w.w / 2 + 1) * c, y0 = w.y - w.h / 2 - 1, h = w.h + 2;
      if (Math.abs(hw) < 0.4) return;
      const xl = w.x - w.w / 2 - 1, xr = w.x + w.w / 2 + 1;
      const left = rect(Math.min(xl, xl + hw), y0, Math.abs(hw), h), right = rect(Math.min(xr, xr - hw), y0, Math.abs(hw), h);
      left.data.back = right.data.back = c < 0;
      g.addChildren([left, right]);
    });
    return g;
  });
  const sFront = col(tod(PAL.shutter, t)), sBack = col(tod(PAL.shutterBack, t));
  for (const it of shut.children) it.fillColor = it.data.back ? sBack : sFront;
  const nightGlow = ramp(t, 5.6, 7.4);
  S.windows.forEach((w, i) => {
    const o = (w.shutters ? clamp((t - w.tOpen - 0.15) / 0.5) : ramp(t, 6.0, 7.6)) * nightGlow * 0.85;
    S.halos[i].opacity = o; S.halos[i].visible = o > 0.005;
  });

  S.meadowG.matrix = flatMatrix(3, t, ENTER.meadow, pt(540, 1400));
  restyle(S.meadow, tod(PAL.meadow, t));
  restyle(S.river, tod(PAL.river, t), 0.5);
  // ripples drift downstream: lens shapes (united) ∩ the river, recut every frame
  const rip = S.ripples.set(t.toFixed(4), () => {
    const lens = [];
    S.rippleSeeds.forEach(([ox, ks], i) => {
      const s = (i / S.rippleSeeds.length + t * 0.055) % 1;
      const [cx, cy] = S.riverBez(s), w = S.riverW(s), k = Math.sin(Math.PI * s);
      if (k < 0.08) return;
      lens.push(ellipse(cx + ox * w, cy, w * 0.3 * ks * k, (2 + 4 * s) * k));
    });
    return lens.length ? S.river.intersect(uniteAll(lens)) : null;
  });
  if (rip) { rip.fillColor = col(tod(PAL.ripple, t), 0.9); rip.shadowColor = null; }

  S.hillLG.matrix = flatMatrix(4, t, ENTER.hillL, pt(200, 1560));
  restyle(S.hillL, tod(PAL.hillL, t));
  S.hillRG.matrix = flatMatrix(5, t, ENTER.hillR, pt(880, 1560));
  restyle(S.hillR, tod(PAL.hillR, t));
  for (const side of S.daisies) for (const d of side) { restyle(d.flower, tod(PAL.daisy, t), 0.4); restyle(d.heart, tod(PAL.daisyC, t), 0.2); }

  const lights = ramp(t, LIGHTS[0], LIGHTS[1]);
  S.footGlow.opacity = 0.55 * lights; S.footGlow.visible = lights > 0.005;
  for (const L of S.lamps) {
    restyle(L.lamp, [217 + 38 * lights, 164 + 70 * lights, 58 + 110 * lights], 0.3);
    L.glow.opacity = lights; L.glow.visible = lights > 0.005;
  }

  // the curtain parts; the drapes sway a hair
  const e = ease.inOutCubic(clamp((t - CURTAIN[0]) / CURTAIN[1]));
  S.curtL.matrix = new P.Matrix().translate(-560 * e, 0);
  S.curtR.matrix = new P.Matrix().translate(560 * e, 0);
  S.curtL.visible = S.curtR.visible = e < 0.999;
  S.drapes.matrix = new P.Matrix().rotate(0.15 * Math.sin(t * 0.8), pt(540, 290));
  // the theatre's own cards keep their colours; only the shadow tone follows the light (glows never cast one)
  for (const it of [S.curtL, S.curtR, S.drapes, S.valance, S.frame]) {
    for (const c of it.children) if (c.fillColor && c.blendMode === 'normal') c.shadowColor = sh;
  }
}

defineDemo({
  id: '77-paper-boolean',
  title: '오리고 붙인 풍경',
  tech: 'Paper.js · 불리언 연산(unite/subtract/intersect) · 경로 스무딩',
  duration: D,
  fps: 30,
  background: '#23324d',
  async setup({ layer }) {
    const el = layer('canvas', { z: 0 });
    el.width = W; el.height = H;
    el.setAttribute('hidpi', 'off');                             // 1080×1920 backing store on every screen
    P.setup(el);
    P.view.autoUpdate = false;                                   // drawn only by view.update() in frame()
    P.settings.insertItems = false;                              // nothing lands in the scene unless added
    this.S = {};
    build(this.S);
  },
  frame(t) {
    update(this.S, t);
    P.view.update(true);
  },
});
