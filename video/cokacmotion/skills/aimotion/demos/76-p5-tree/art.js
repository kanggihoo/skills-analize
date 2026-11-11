/*
 * 76 · art.js — everything painted once in setup into p5.Graphics: the sky with its watercolour washes, two cloud-wash
 * layers, the land (far hills, meadow, flowers), the paper grain, and the sprites (blossom clusters, buds, leaves,
 * petals, the tree's ground shadow). The washes use layered, recursively deformed polygons at a few percent opacity
 * (Tyler Hobbs' watercolour method) with p5's random()/randomGaussian() under randomSeed.
 */
import { rand } from '../_lib/stage.js';
import { W, H, groundY } from './tree.js';

// ---- palette (soft spring pastels on warm paper) ------------------------------------------------------
export const PAL = {
  skyTop: [184, 212, 226], skyMid: [226, 234, 232], skyLow: [247, 233, 220], skyHorizon: [249, 224, 210],
  sunGlow: [255, 247, 228],
  farA: [196, 203, 223], farTrees: [168, 184, 198], farB: [180, 200, 166], farBTrees: [146, 170, 136],
  meadow: [[0, [166, 194, 136]], [0.16, [134, 168, 112]], [0.4, [88, 122, 86]], [0.62, [54, 82, 62]], [1, [30, 46, 38]]],
  bark: [[88, 64, 62], [104, 78, 74], [124, 94, 90]], barkHi: [162, 132, 124], barkShade: [62, 44, 45],
  text: [100, 76, 92], seal: [196, 80, 64],
};

// ---- watercolour washes ---------------------------------------------------------------------------------
function deform(p, pts, depth, variance) {
  let cur = pts;
  for (let d = 0; d < depth; d++) {
    const next = [];
    for (let i = 0; i < cur.length; i++) {
      const a = cur[i], b = cur[(i + 1) % cur.length];
      next.push(a);
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const v = (a[2] + b[2]) / 2;
      const ang = p.random(Math.PI * 2), r = p.randomGaussian(0, len * variance * v);
      next.push([(a[0] + b[0]) / 2 + Math.cos(ang) * r, (a[1] + b[1]) / 2 + Math.sin(ang) * r, v * (0.8 + 0.4 * p.random())]);
    }
    cur = next;
  }
  return cur;
}
function blobBase(p, cx, cy, rx, ry, sides = 10) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, 0.6 + 0.8 * p.random()]);
  }
  return deform(p, pts, 4, 0.32);
}
/** Many nearly transparent deformed copies of one base polygon: soft, pooled watercolour edges. */
export function wash(p, g, base, col, layers = 22, alpha = 6, depth = 3, variance = 0.24) {
  g.noStroke();
  g.fill(col[0], col[1], col[2], alpha);
  for (let l = 0; l < layers; l++) {
    const poly = deform(p, base, depth, variance);
    g.beginShape();
    for (const q of poly) g.vertex(q[0], q[1]);
    g.endShape(p.CLOSE);
  }
}

function lerp3(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
function gradAt(stops, k) {
  for (let i = 1; i < stops.length; i++) if (k <= stops[i][0]) return lerp3(stops[i - 1][1], stops[i][1], (k - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
  return stops[stops.length - 1][1];
}

// ---- sky (half resolution, drawn ×2 — softer) -----------------------------------------------------------
export function makeSky(p) {
  const g = p.createGraphics(540, 800);
  const stops = [[0, PAL.skyTop], [0.48, PAL.skyMid], [0.8, PAL.skyLow], [1, PAL.skyHorizon]];
  g.strokeWeight(1.6);
  for (let y = 0; y < 800; y++) {
    const c = gradAt(stops, y / 799);
    g.stroke(c[0], c[1], c[2]);
    g.line(0, y + 0.5, 540, y + 0.5);
  }
  g.noStroke();
  for (let i = 0; i < 40; i++) { g.fill(...PAL.sunGlow, 6); g.circle(96, 128, 620 - i * 14); }   // morning light, top left
  const tints = [[[236, 210, 222], 410, 170, 150, 70], [[208, 224, 238], 120, 400, 170, 60], [[244, 230, 200], 330, 560, 190, 60],
    [[228, 220, 240], 470, 650, 150, 50], [[240, 220, 226], 60, 690, 160, 50]];
  for (const [c, x, y, rx, ry] of tints) wash(p, g, blobBase(p, x, y, rx, ry), c, 18, 5);
  return g;
}

/** A layer of drifting cloud washes; drawn ×2, wider than the stage so it can slide. */
export function makeClouds(p, near) {
  const g = p.createGraphics(720, 520);
  const specs = near
    ? [[[253, 240, 240], 140, 300, 120, 30], [[250, 230, 216], 470, 200, 140, 34], [[246, 236, 246], 640, 380, 110, 26]]
    : [[[250, 247, 244], 300, 140, 170, 40], [[228, 228, 240], 80, 230, 120, 30], [[248, 242, 236], 560, 90, 150, 34], [[236, 232, 244], 420, 330, 130, 28]];
  for (const [c, x, y, rx, ry] of specs) {
    const base = blobBase(p, x, y, rx, ry, 12);
    wash(p, g, base, c, near ? 26 : 22, near ? 9 : 7);
    // a brighter top: the same shape lifted a little, fewer layers
    wash(p, g, blobBase(p, x - rx * 0.1, y - ry * 0.35, rx * 0.7, ry * 0.6, 10), [255, 252, 248], 12, 7);
  }
  return g;
}

// ---- land: far hills, meadow, flowers (full resolution, transparent above) ------------------------------
function ridgeBase(p, yOf, bottom) {
  const pts = [];
  for (let x = -40; x <= W + 40; x += 30) pts.push([x, yOf(x), 0.5]);
  pts.push([W + 40, bottom, 0.05], [-40, bottom, 0.05]);
  return pts;
}
export function makeLand(p) {
  const g = p.createGraphics(W, H);
  const yA = (x) => 1352 + 24 * Math.sin(x / 170 + 1.0) + 12 * Math.sin(x / 61 + 0.3) - 34 * Math.exp(-(((x - 830) / 200) ** 2));
  const yB = (x) => 1420 + 24 * Math.sin(x / 240 + 2.2) + 10 * Math.sin(x / 90);
  // far hills: a solid body under soft washed edges
  for (const [yOf, col, trees, n] of [[yA, PAL.farA, PAL.farTrees, 30], [yB, PAL.farB, PAL.farBTrees, 22]]) {
    g.noStroke(); g.fill(...col, 150);
    g.beginShape();
    for (let x = -10; x <= W + 10; x += 8) g.vertex(x, yOf(x) + 8);
    g.vertex(W + 10, 1700); g.vertex(-10, 1700);
    g.endShape(p.CLOSE);
    wash(p, g, ridgeBase(p, yOf, 1700), col, 12, 30, 3, 0.05);
    for (let i = 0; i < n; i++) {
      const x = p.random(-10, W + 10), r = p.random(5, 13);
      g.fill(...trees, 120);
      g.ellipse(x, yOf(x) + 2 - r * 0.6, r * 1.5, r * 2.1);
    }
  }
  // meadow: one shape with a vertical gradient (p5 + drawingContext gradient, the usual p5 idiom)
  g.push();
  g.noStroke(); g.fill(255);
  const grad = g.drawingContext.createLinearGradient(0, 1500, 0, H);
  for (const [k, c] of PAL.meadow) grad.addColorStop(k, `rgb(${c[0]},${c[1]},${c[2]})`);
  g.drawingContext.fillStyle = grad;
  g.beginShape();
  for (let x = -10; x <= W + 10; x += 6) g.vertex(x, groundY(x));
  g.vertex(W + 10, H + 10); g.vertex(-10, H + 10);
  g.endShape(p.CLOSE);
  g.pop();
  // meadow washes: lighter near the crest, darker pools further down
  for (const [c, x, y, rx, ry, a] of [[[184, 210, 150], 260, 1590, 260, 40, 7], [[184, 210, 150], 820, 1600, 240, 36, 7],
    [[70, 104, 72], 160, 1720, 260, 70, 6], [[70, 104, 72], 900, 1760, 280, 80, 6], [[96, 130, 92], 560, 1650, 300, 50, 5]]) {
    wash(p, g, blobBase(p, x, y, rx, ry, 10), c, 14, a);
  }
  // grass texture: short strokes, lighter and finer near the crest
  for (let i = 0; i < 2600; i++) {
    const x = p.random(-10, W + 10);
    const k = Math.pow(p.random(), 1.2);
    const y = groundY(x) + 4 + k * (H - groundY(x));
    const c = k < 0.3 ? [120, 156, 100] : k < 0.6 ? [70, 102, 72] : [28, 44, 36];
    g.stroke(c[0], c[1], c[2], 70);
    g.strokeWeight(0.8 + k * 1.2);
    const h = 4 + k * 12, lean = p.random(-0.35, 0.35);
    g.line(x, y, x + Math.sin(lean) * h, y - Math.cos(lean) * h);
  }
  // a pencil-light edge along the crest
  g.noFill(); g.stroke(206, 222, 176, 90); g.strokeWeight(2);
  g.beginShape();
  for (let x = -10; x <= W + 10; x += 6) g.vertex(x, groundY(x) + 1);
  g.endShape();
  // little flowers in the grass
  g.noStroke();
  const flowerCols = [[252, 250, 242], [246, 222, 120], [244, 200, 212], [252, 250, 242]];
  for (let i = 0; i < 170; i++) {
    const x = p.random(10, W - 10);
    const k = Math.pow(p.random(), 1.5);
    const y = groundY(x) + 8 + k * 150;
    const c = flowerCols[i % 4], r = 1.6 + k * 2.6;
    g.fill(c[0], c[1], c[2], 220);
    for (let j = 0; j < 4; j++) g.circle(x + Math.cos(j * 1.57) * r * 0.8, y + Math.sin(j * 1.57) * r * 0.5, r * 1.2);
    g.fill(232, 180, 80, 220); g.circle(x, y, r * 0.7);
  }
  return g;
}

/** Soft elliptical shadow under the crown (drawn scaled with growth, multiply). */
export function makeShadow(p) {
  const g = p.createGraphics(420, 90);
  g.noStroke();
  for (let i = 0; i < 30; i++) {
    const k = i / 29;
    g.fill(60, 92, 64, 4);
    g.ellipse(210, 45, 420 * (1 - k * 0.8), 90 * (1 - k * 0.8));
  }
  return g;
}

// ---- paper grain (drawn over everything with SOFT_LIGHT; 128 = no change) -------------------------------
export function makeGrain(p) {
  const g = p.createGraphics(W, H);
  const r = rand(907);
  const CW = 24, gw = Math.ceil(W / CW) + 2, gh = Math.ceil(H / CW) + 2;
  const coarse = new Float32Array(gw * gh);
  for (let i = 0; i < coarse.length; i++) coarse[i] = r() - 0.5;
  g.loadPixels();
  const px = g.pixels;
  for (let y = 0; y < H; y++) {
    const fy = y / CW, iy = Math.floor(fy), ty = fy - iy, sy = ty * ty * (3 - 2 * ty);
    for (let x = 0; x < W; x++) {
      const fx = x / CW, ix = Math.floor(fx), tx = fx - ix, sx = tx * tx * (3 - 2 * tx);
      const a = coarse[iy * gw + ix], b = coarse[iy * gw + ix + 1], c = coarse[(iy + 1) * gw + ix], d = coarse[(iy + 1) * gw + ix + 1];
      const mottle = (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy;
      const v = 128 + mottle * 26 + (r() - 0.5) * 18;
      const i = (y * W + x) * 4;
      px[i] = px[i + 1] = px[i + 2] = v; px[i + 3] = 255;
    }
  }
  g.updatePixels();
  // paper fibres
  for (let i = 0; i < 1500; i++) {
    const x = r() * W, y = r() * H, a = r() * Math.PI, l = 6 + r() * 18;
    g.stroke(r() < 0.5 ? 92 : 170, 40);
    g.strokeWeight(0.8);
    g.line(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l);
  }
  return g;
}

// ---- sprites (painted at 2× and drawn at 1×) -----------------------------------------------------------
// one cherry petal pointing up, base at (0,0), notched tip at (0,-R) — p5 2.x bezierVertex: anchor, then (c1, c2, anchor)…
function petalPath(g, p, R) {
  g.beginShape();
  g.bezierVertex(0, 0);
  g.bezierVertex(-0.3 * R, -0.18 * R); g.bezierVertex(-0.6 * R, -0.62 * R); g.bezierVertex(-0.36 * R, -0.93 * R);
  g.bezierVertex(-0.26 * R, -1.04 * R); g.bezierVertex(-0.1 * R, -1.02 * R); g.bezierVertex(0, -0.85 * R);
  g.bezierVertex(0.1 * R, -1.02 * R); g.bezierVertex(0.26 * R, -1.04 * R); g.bezierVertex(0.36 * R, -0.93 * R);
  g.bezierVertex(0.6 * R, -0.62 * R); g.bezierVertex(0.3 * R, -0.18 * R); g.bezierVertex(0, 0);
  g.endShape(p.CLOSE);
}

export const FLOWER = {
  front: { petal: [[253, 232, 238], [248, 206, 218]], deep: [236, 148, 174], line: [228, 160, 182], center: [204, 90, 122], stamen: [186, 78, 106], pollen: [240, 196, 104] },
  white: { petal: [[255, 248, 246], [252, 234, 236]], deep: [242, 186, 200], line: [236, 196, 206], center: [214, 110, 136], stamen: [196, 92, 116], pollen: [242, 204, 110] },
  back: { petal: [[226, 200, 216], [218, 186, 206]], deep: [200, 146, 176], line: [204, 166, 190], center: [160, 92, 124], stamen: [150, 82, 110], pollen: [210, 170, 110] },
};

function flower(g, p, x, y, R, rot, col, r) {
  const rr = (a, b) => a + (b - a) * r();
  g.push();
  g.translate(x, y);
  g.rotate(rot);
  for (let k = 0; k < 5; k++) {
    g.push();
    g.rotate((k / 5) * Math.PI * 2 + rr(-0.12, 0.12));
    const c = lerp3(col.petal[0], col.petal[1], r());
    g.fill(c[0], c[1], c[2]); g.stroke(...col.line, 170); g.strokeWeight(1);
    petalPath(g, p, R * rr(0.92, 1.06));
    g.noStroke(); g.fill(...col.deep, 120);
    g.scale(0.52);
    petalPath(g, p, R);
    g.pop();
  }
  g.stroke(...col.stamen, 220); g.strokeWeight(1.1);
  const tips = [];
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2 + rr(-0.2, 0.2), l = R * rr(0.32, 0.5);
    tips.push([Math.cos(a) * l, Math.sin(a) * l]);
    g.line(0, 0, tips[k][0], tips[k][1]);
  }
  g.noStroke(); g.fill(...col.pollen);
  for (const [tx, ty] of tips) g.circle(tx, ty, R * 0.11);
  g.fill(...col.center); g.circle(0, 0, R * 0.26);
  g.pop();
}

function bud(g, p, x, y, s, rot, back) {
  g.push(); g.translate(x, y); g.rotate(rot); g.noStroke();
  g.fill(...(back ? [150, 150, 112] : [132, 150, 92])); g.triangle(-4 * s, 2 * s, 4 * s, 2 * s, 0, -5 * s);
  g.fill(...(back ? [204, 140, 168] : [234, 128, 158])); g.ellipse(0, -8 * s, 9 * s, 13 * s);
  g.fill(255, 220, 230, 140); g.ellipse(-1.5 * s, -10 * s, 3 * s, 6 * s);
  g.pop();
}

/** A clump of 3–5 blossoms (+ buds): the full version and a sparse one shown after the gust strips it. */
export function makeCluster(p, kind) {
  const col = FLOWER[kind], back = kind === 'back';
  const n = 3 + Math.floor(p.random(3));
  const items = [];
  for (let i = 0; i < n; i++) {
    const a = p.random(Math.PI * 2), r = i === 0 ? p.random(0, 6) : p.random(14, 30);
    items.push({ x: 64 + Math.cos(a) * r, y: 64 + Math.sin(a) * r, R: p.random(17, 23) * (i === 0 ? 1.06 : 1), rot: p.random(Math.PI * 2),
      seed: Math.floor(p.random(1e9)) });
  }
  const buds = [];
  for (let i = 0, m = Math.floor(p.random(3)); i < m; i++) {
    const a = p.random(Math.PI * 2);
    buds.push({ x: 64 + Math.cos(a) * 34, y: 64 + Math.sin(a) * 34, rot: a + Math.PI / 2 });
  }
  const paint = (count) => {
    const g = p.createGraphics(128, 128);
    for (const b of buds) bud(g, p, b.x, b.y, 1.5, b.rot, back);
    // each flower has its own seeded generator, so the sparse version's flower is the same as in the full one
    for (let i = Math.min(count, items.length) - 1; i >= 0; i--) {
      const it = items[i];
      flower(g, p, it.x, it.y, it.R, it.rot, col, rand(it.seed));
    }
    return g;
  };
  return { full: paint(items.length), sparse: paint(1) };
}

export function makeBud(p) {
  const g = p.createGraphics(48, 48);
  bud(g, p, 24, 34, 1.8, 0, false);
  return g;
}

export function makeLeaf(p, tone) {
  const g = p.createGraphics(64, 64);
  g.translate(32, 58);
  g.noStroke();
  g.fill(...(tone ? [156, 192, 104] : [182, 210, 122]));
  g.beginShape();
  g.bezierVertex(0, 0);
  g.bezierVertex(-18, -14); g.bezierVertex(-14, -40); g.bezierVertex(0, -54);
  g.bezierVertex(14, -40); g.bezierVertex(18, -14); g.bezierVertex(0, 0);
  g.endShape(p.CLOSE);
  g.stroke(122, 158, 84, 200); g.strokeWeight(1.4);
  g.line(0, -2, 0, -46);
  g.strokeWeight(0.9);
  for (let k = 1; k < 5; k++) { g.line(0, -k * 10, -7, -k * 10 - 6); g.line(0, -k * 10, 7, -k * 10 - 6); }
  return g;
}

/** A single loose petal centred in its sprite: front, back (the deeper underside) and fallen (a little faded). */
export function makePetal(p, kind) {
  const g = p.createGraphics(48, 48);
  g.translate(24, 42);
  const c = kind === 'back' ? [240, 184, 202] : kind === 'fallen' ? [246, 214, 222] : [252, 222, 230];
  g.fill(c[0], c[1], c[2]); g.stroke(226, 156, 180, 170); g.strokeWeight(1);
  petalPath(g, p, 36);
  g.noStroke(); g.fill(232, 140, 168, kind === 'back' ? 150 : 110);
  g.scale(0.45);
  petalPath(g, p, 36);
  return g;
}
