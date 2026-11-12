/*
 * art.js — every picture in demo 88, drawn from scratch once in setup (no state, no time):
 *   renderDesk(g)        layer A, the flat illustration: walnut desk, specimen card, pencil, ruler, a blue butterfly
 *   makeScales(...)      the hidden layer's geometry: overlapping wing scales laid in rows around the hindwing root
 *   renderLevel(lv, …)   that layer drawn at one magnification (B ×5 over the lens path, C1 ×18, C2 ×60 around the iris point)
 * Coordinates are "macro" units = stage pixels of layer A. A is drawn wider than the stage (AW) because the lens enters
 * from the right over desk that is off-frame. The butterfly is a generic blue butterfly built from curves, not a portrait
 * of any species.
 */
import { rand } from '../_lib/stage.js';

export const W = 1080, H = 1920, AW = 1300;
export const TAU = Math.PI * 2;
export const PAL = {
  desk: ['#4b3425', '#33231a', '#20150e'], card: ['#f5edda', '#e5d8bb'], ink: '#2b2620', brass: '#e3b04b',
  border: '#17131d', spot: '#f4efe4', vein: 'rgba(9,14,40,.55)', membrane: '#090f26', note: '#f6e7a8',
  blue: ['#74d8ff', '#3c9bf8', '#2068dc', '#153c9e'],
};

// ------------------------------------------------------------------ geometry
/** closed Catmull-Rom spline through pts → dense polyline */
export function catmull(pts, n = 14) {
  const out = [], N = pts.length, P = (i) => pts[(i + N) % N];
  for (let i = 0; i < N; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  return out;
}
export function polyPath(poly) {
  const p = new Path2D();
  poly.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
  p.closePath();
  return p;
}
const mirror = (poly) => poly.map(([x, y]) => [W - x, y]);
function wavyEllipse(cx, cy, rx, ry, rot, amp, freq, ph) {
  const out = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < 180; i++) {
    const a = (i / 180) * TAU, k = 1 + amp * Math.sin(freq * a + ph) + amp * 0.5 * Math.sin(freq * 2.3 * a + ph * 1.7);
    const x = rx * k * Math.cos(a), y = ry * k * Math.sin(a);
    out.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return out;
}

// the right wings (left = mirror). Hindwing root and the iris point live in this frame.
export const HIND_ROOT = [566, 872], FORE_ROOT = [562, 762];
const HIND_PTS = [[566, 860], [640, 866], [760, 902], [872, 948], [946, 1008], [963, 1085], [932, 1166], [866, 1236], [776, 1281], [690, 1283], [624, 1240], [584, 1160], [561, 1060], [555, 950]];
const FORE_PTS = [[562, 760], [608, 700], [700, 640], [810, 588], [912, 550], [976, 546], [1001, 580], [987, 650], [952, 740], [906, 820], [860, 876], [790, 892], [700, 880], [620, 842], [575, 806]];
export const HIND = catmull(HIND_PTS), FORE = catmull(FORE_PTS);
const BLUE_H = wavyEllipse(590, 926, 312, 302, 0.15, 0.025, 7, 0.4);
const BLUE_F = wavyEllipse(596, 770, 338, 232, -0.46, 0.022, 8, 1.3);
const SPOTS_H = [[918, 1036, 9], [928, 1100, 11], [890, 1168, 10], [828, 1221, 9], [756, 1251, 7.5]];
const SPOTS_F = [[950, 590, 10], [960, 640, 8.5], [944, 694, 8], [915, 752, 7], [903, 610, 6]];
export const CARD = { cx: 545, cy: 936, w: 962, h: 932, rot: -0.024 };

function cardPath() {
  const p = new Path2D(), r = new Path2D();
  r.roundRect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 12);
  p.addPath(r, new DOMMatrix().translate(CARD.cx, CARD.cy).rotate(CARD.rot * 180 / Math.PI));
  return p;
}
/** veins: from the root out to the margin, slightly bowed */
function veins(root, outline, angles) {
  return angles.map((a, i) => {
    let best = null, bd = 1e9;
    for (const p of outline) {
      const dx = p[0] - root[0], dy = p[1] - root[1], d = Math.hypot(dx, dy);
      if (d < 140) continue;
      const da = Math.abs(Math.atan2(dy, dx) - a);
      if (da < bd) { bd = da; best = p; }
    }
    const sx = root[0] + Math.cos(a) * 26, sy = root[1] + Math.sin(a) * 26;
    const mx = (sx + best[0]) / 2, my = (sy + best[1]) / 2, nx = -(best[1] - sy), ny = best[0] - sx, nl = Math.hypot(nx, ny);
    const bow = (i % 2 ? 1 : -1) * 10;
    return [sx, sy, mx + (nx / nl) * bow, my + (ny / nl) * bow, best[0], best[1]];
  });
}
const VEINS_H = veins(HIND_ROOT, HIND, [0.1, 0.38, 0.66, 0.93, 1.18, 1.42]);
const VEINS_F = veins(FORE_ROOT, FORE, [-0.62, -0.5, -0.38, -0.25, -0.1, 0.06, 0.24, 0.42]);

/** the four wings as drawable records, right side first */
export const WINGS = (() => {
  const mk = (outline, blue, spots, vns, side) => {
    const m = side < 0;
    return {
      outline: m ? mirror(outline) : outline, blue: m ? mirror(blue) : blue,
      spots: spots.map(([x, y, r]) => [m ? W - x : x, y, r]),
      veins: vns.map((v) => (m ? v.map((c, i) => (i % 2 ? c : W - c)) : v)),
    };
  };
  return {
    hindR: mk(HIND, BLUE_H, SPOTS_H, VEINS_H, 1), hindL: mk(HIND, BLUE_H, SPOTS_H, VEINS_H, -1),
    foreR: mk(FORE, BLUE_F, SPOTS_F, VEINS_F, 1), foreL: mk(FORE, BLUE_F, SPOTS_F, VEINS_F, -1),
  };
})();

// ------------------------------------------------------------------ layer A
function desk(g) {
  const r = rand(8811);
  const lg = g.createLinearGradient(0, 0, 420, H);
  lg.addColorStop(0, PAL.desk[0]); lg.addColorStop(0.55, PAL.desk[1]); lg.addColorStop(1, PAL.desk[2]);
  g.fillStyle = lg; g.fillRect(0, 0, AW, H);
  for (let i = 0; i < 170; i++) {
    const y0 = r() * H, amp = 3 + r() * 16, fr = 0.0018 + r() * 0.004, ph = r() * TAU;
    g.beginPath();
    for (let x = -20; x <= AW + 20; x += 16) {
      const y = y0 + amp * Math.sin(x * fr + ph) + 2.5 * Math.sin(x * fr * 3.3 + ph * 2);
      if (x === -20) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.strokeStyle = r() < 0.62 ? `rgba(16,8,3,${0.1 + r() * 0.18})` : `rgba(255,212,165,${0.025 + r() * 0.05})`;
    g.lineWidth = 0.6 + r() * 2.6;
    g.stroke();
  }
  // plank seams
  for (const y of [318, 1612]) {
    g.fillStyle = 'rgba(8,4,2,.55)'; g.fillRect(0, y, AW, 4);
    g.fillStyle = 'rgba(255,220,180,.06)'; g.fillRect(0, y + 4, AW, 2);
  }
}

function pencil(g) {
  g.save();
  g.translate(742, 92); g.rotate(0.42);
  g.save(); g.filter = 'blur(9px)'; g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(40, 26, 560, 40); g.restore();
  const L = 560, h = 38;
  // wood cone and graphite
  g.beginPath(); g.moveTo(0, 0); g.lineTo(78, -h / 2); g.lineTo(78, h / 2); g.closePath();
  g.fillStyle = '#e8c79a'; g.fill();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(24, -h / 2 * 0.31); g.lineTo(24, h / 2 * 0.31); g.closePath();
  g.fillStyle = '#3a3634'; g.fill();
  // three faces of the body
  const faces = [['#f2bf52', -h / 2, h / 3], ['#dba035', -h / 6, h / 3], ['#b77d22', h / 6, h / 3]];
  for (const [c, y, hh] of faces) { g.fillStyle = c; g.fillRect(78, y, L - 78, hh); }
  g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(78, -h / 2 + 3, L - 78, 3);
  g.fillStyle = '#c9c4ba'; g.fillRect(L - 40, -h / 2, 40, h);
  g.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 4; i++) g.fillRect(L - 34 + i * 9, -h / 2, 2, h);
  g.restore();
}

function ruler(g) {
  g.save();
  g.translate(-40, 1468); g.rotate(-0.032);
  g.save(); g.filter = 'blur(10px)'; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(14, 22, 800, 76); g.restore();
  const lg = g.createLinearGradient(0, 0, 0, 76);
  lg.addColorStop(0, '#e2b56b'); lg.addColorStop(1, '#a8783a');
  g.fillStyle = lg; g.beginPath(); g.roundRect(0, 0, 800, 76, 6); g.fill();
  g.fillStyle = 'rgba(255,240,210,.35)'; g.fillRect(0, 2, 800, 3);
  g.strokeStyle = 'rgba(52,32,12,.75)';
  for (let i = 0, x = 60; x < 790; i++, x += 9.5) {
    const h = i % 10 === 0 ? 30 : i % 5 === 0 ? 21 : 12;
    g.lineWidth = i % 10 === 0 ? 2.2 : 1.4;
    g.beginPath(); g.moveTo(x, 4); g.lineTo(x, 4 + h); g.stroke();
  }
  g.restore();
}

function card(g, hand) {
  g.save();
  g.translate(CARD.cx, CARD.cy); g.rotate(CARD.rot);
  const { w, h } = CARD;
  g.save(); g.filter = 'blur(18px)'; g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.roundRect(-w / 2 + 14, -h / 2 + 30, w, h, 14); g.fill(); g.restore();
  const lg = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  lg.addColorStop(0, PAL.card[0]); lg.addColorStop(1, PAL.card[1]);
  g.fillStyle = lg; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 12); g.fill();
  g.strokeStyle = 'rgba(120,88,48,.32)'; g.lineWidth = 2.4; g.strokeRect(-w / 2 + 30, -h / 2 + 30, w - 60, h - 60);
  g.lineWidth = 1; g.strokeRect(-w / 2 + 38, -h / 2 + 38, w - 76, h - 76);
  // label: a handwritten catalogue number on a ruled line
  g.fillStyle = 'rgba(52,38,24,.82)'; g.font = `400 58px ${hand}`; g.textBaseline = 'alphabetic';
  g.fillText('No. 88', -w / 2 + 70, h / 2 - 72);
  g.fillStyle = 'rgba(120,88,48,.4)'; g.fillRect(-w / 2 + 66, h / 2 - 62, 250, 2);
  g.restore();
}

function wingShape(g, wg, isFore) {
  const path = polyPath(wg.outline), blue = polyPath(wg.blue);
  g.save();
  g.clip(path);
  const root = wg.outline[0];
  const bg = g.createRadialGradient(root[0], root[1], 40, root[0], root[1], 520);
  bg.addColorStop(0, '#2a2433'); bg.addColorStop(1, PAL.border);
  g.fillStyle = bg; g.fill(path);
  // blue field
  g.save(); g.clip(blue);
  const cx = root[0] + (wg.outline[30][0] - root[0]) * 0.28, cy = root[1] + (isFore ? -10 : 70);
  const rg = g.createRadialGradient(cx, cy, 10, cx, cy, isFore ? 420 : 380);
  rg.addColorStop(0, PAL.blue[0]); rg.addColorStop(0.32, PAL.blue[1]); rg.addColorStop(0.7, PAL.blue[2]); rg.addColorStop(1, PAL.blue[3]);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  g.restore();
  // soft edge between blue and border
  g.save(); g.filter = 'blur(5px)'; g.strokeStyle = 'rgba(14,12,28,.55)'; g.lineWidth = 9; g.stroke(blue); g.restore();
  // dark base near the body
  const db = g.createRadialGradient(root[0], root[1], 0, root[0], root[1], 120);
  db.addColorStop(0, 'rgba(12,16,40,.75)'); db.addColorStop(1, 'rgba(12,16,40,0)');
  g.fillStyle = db; g.fillRect(0, 0, W, H);
  // veins
  g.strokeStyle = PAL.vein; g.lineWidth = 3.2; g.lineCap = 'round';
  for (const [sx, sy, qx, qy, ex, ey] of wg.veins) { g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(qx, qy, ex, ey); g.stroke(); }
  // spots
  for (const [x, y, r] of wg.spots) {
    g.fillStyle = PAL.spot; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  g.restore();
  g.strokeStyle = 'rgba(8,6,12,.8)'; g.lineWidth = 2.6; g.stroke(path);
}

function body(g) {
  const cx = 540;
  // abdomen
  const ab = g.createLinearGradient(cx - 20, 0, cx + 20, 0);
  ab.addColorStop(0, '#120e0b'); ab.addColorStop(0.45, '#3a3028'); ab.addColorStop(1, '#0e0b09');
  g.fillStyle = ab; g.beginPath(); g.ellipse(cx, 958, 17, 128, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1.6;
  for (let i = 0; i < 8; i++) { const y = 862 + i * 25; g.beginPath(); g.moveTo(cx - 15, y); g.quadraticCurveTo(cx, y + 6, cx + 15, y); g.stroke(); }
  // thorax, fuzzy
  const th = g.createRadialGradient(cx - 6, 770, 4, cx, 790, 62);
  th.addColorStop(0, '#4a3d33'); th.addColorStop(1, '#16110d');
  g.fillStyle = th; g.beginPath(); g.ellipse(cx, 792, 27, 64, 0, 0, TAU); g.fill();
  const r = rand(77);
  g.strokeStyle = 'rgba(120,100,82,.35)'; g.lineWidth = 1.2;
  for (let i = 0; i < 160; i++) {
    const a = r() * TAU, rr = Math.sqrt(r());
    const x = cx + Math.cos(a) * 25 * rr, y = 792 + Math.sin(a) * 62 * rr;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 5, y + Math.sin(a) * 5); g.stroke();
  }
  // head, eyes, antennae with clubs
  g.fillStyle = '#1d1712'; g.beginPath(); g.arc(cx, 716, 24, 0, TAU); g.fill();
  g.fillStyle = '#3a3a46'; for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 15, 710, 9, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.45)'; for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 15 - 3, 706, 2.6, 0, TAU); g.fill(); }
  g.strokeStyle = '#1d1712'; g.lineWidth = 3.2; g.lineCap = 'round';
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(cx + s * 8, 696); g.bezierCurveTo(cx + s * 20, 640, cx + s * 52, 600, cx + s * 84, 566); g.stroke();
    g.fillStyle = '#1d1712'; g.beginPath(); g.ellipse(cx + s * 88, 561, 6.5, 11, s * 0.75, 0, TAU); g.fill();
  }
}

/** layer A: the flat illustration (canvas AW×H in macro units). Returns the card outline for the detail layer. */
export function renderDesk(g, hand) {
  desk(g);
  pencil(g);
  ruler(g);
  card(g, hand);
  // butterfly shadow on the card
  g.save(); g.filter = 'blur(14px)'; g.globalAlpha = 0.42; g.fillStyle = '#1a1006'; g.translate(16, 26);
  for (const k of ['hindR', 'hindL', 'foreR', 'foreL']) g.fill(polyPath(WINGS[k].outline));
  g.beginPath(); g.ellipse(540, 900, 30, 200, 0, 0, TAU); g.fill();
  g.restore();
  for (const k of ['hindR', 'hindL']) wingShape(g, WINGS[k], false);
  for (const k of ['foreR', 'foreL']) wingShape(g, WINGS[k], true);
  body(g);
  // lamp light from the upper left, vignette
  g.save();
  g.globalCompositeOperation = 'multiply';
  const lm = g.createRadialGradient(470, 760, 120, 470, 760, 1500);
  lm.addColorStop(0, '#ffffff'); lm.addColorStop(0.55, '#c9b9a6'); lm.addColorStop(1, '#4a3b30');
  g.fillStyle = lm; g.fillRect(0, 0, AW, H);
  g.globalCompositeOperation = 'screen';
  const lp = g.createRadialGradient(150, 120, 0, 150, 120, 980);
  lp.addColorStop(0, 'rgba(255,198,130,.32)'); lp.addColorStop(1, 'rgba(255,198,130,0)');
  g.fillStyle = lp; g.fillRect(0, 0, AW, H);
  g.restore();
  return cardPath();
}

/** white where the wings are blue (for the sheen sweep on the macro wing) */
export function renderBlueMask(g) {
  g.fillStyle = '#fff';
  for (const k of ['hindR', 'hindL', 'foreR', 'foreL']) {
    const wg = WINGS[k];
    g.save(); g.clip(polyPath(wg.outline)); g.fill(polyPath(wg.blue)); g.restore();
  }
}

// ------------------------------------------------------------------ the hidden layer: wing scales
const toHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
};
const hsl = (h, s, l, a = 1) => `hsla(${h.toFixed(1)},${(Math.max(0, Math.min(1, s)) * 100).toFixed(1)}%,${(Math.max(0, Math.min(1, l)) * 100).toFixed(1)}%,${a})`;

/** half-width of a scale at local x (its outline; used for the visibility test) */
export function scaleHalf(s, x) {
  const u = x / s.L;
  if (u < 0 || u > 1.02) return -1;
  if (u < 0.38) return s.W / 2 * (0.26 + 0.74 * Math.sin((u / 0.38) * Math.PI / 2));
  return s.W / 2 * (u < 0.9 ? 1 : 1 - (u - 0.9) * 0.6);
}
function scalePath(s) {
  const { L } = s, h = s.W / 2, p = new Path2D();
  p.moveTo(0, -0.13 * h);
  p.bezierCurveTo(0.14 * L, -0.2 * h, 0.2 * L, -h, 0.38 * L, -h);
  p.lineTo(0.88 * L, -h * 0.97);
  const n = s.teeth, tip = (y) => 0.9 * L + 0.07 * L * (1 - (y / h) * (y / h));
  for (let k = 0; k < n; k++) {
    const y0 = -h * 0.97 + (k * 1.94 * h) / n, y1 = y0 + (1.94 * h) / n, ym = (y0 + y1) / 2;
    p.quadraticCurveTo(tip(ym) + 0.09 * L, ym, tip(y1) - (k < n - 1 ? 0.02 * L : 0), y1);
  }
  p.lineTo(0.38 * L, h);
  p.bezierCurveTo(0.2 * L, h, 0.14 * L, 0.2 * h, 0, 0.13 * h);
  p.closePath();
  return p;
}

/**
 * Scales in rows around the hindwing root (a polar lattice: rows 5.15 apart, 4.3 apart along each row, alternate rows
 * staggered). Each scale takes the colour of layer A at its visible end, so the hidden layer is the same picture.
 * Sorted distal → proximal: the proximal scale's tip lies over the next row's sockets (roof tiles).
 */
export function makeScales(Apx, AWd, inWing, box) {
  const r = rand(4021), out = [];
  const [rx, ry] = HIND_ROOT;
  for (let k = 0; ; k++) {
    const rr = 12 + k * 5.15;
    if (rr > 470) break;
    const dphi = 4.3 / rr, off = (k % 2) * 0.5 * dphi;
    for (let phi = -0.3 + off; phi < 1.75; phi += dphi) {
      const L = 9 * (0.94 + r() * 0.12), Wd = 5.3 * (0.92 + r() * 0.14);
      const th = phi + (r() - 0.5) * 0.09;
      const x = rx + rr * Math.cos(phi) + (r() - 0.5) * 0.6, y = ry + rr * Math.sin(phi) + (r() - 0.5) * 0.6;
      const tx = x + Math.cos(th) * L * 0.62, ty = y + Math.sin(th) * L * 0.62;
      const teeth = 3 + Math.floor(r() * 3), hj = (r() - 0.5) * 16, lj = (r() - 0.5) * 0.08, sheen = r();
      if (tx < box[0] || tx > box[2] || ty < box[1] || ty > box[3]) continue;
      if (!inWing(tx, ty)) continue;
      const ix = Math.round(tx), iy = Math.round(ty), p = (iy * AWd + ix) * 4;
      out.push({ x, y, th, L, W: Wd, teeth, rr, hsl: toHsl(Apx[p], Apx[p + 1], Apx[p + 2]), hj, lj, sheen });
    }
  }
  out.sort((a, b) => b.rr - a.rr);
  out.forEach((s, i) => { s.i = i; });
  return out;
}

export const N_RIDGE = 17;
/** local y of ridge j (of N_RIDGE) on scale s — every level draws ridges at these same places */
export const ridgeY = (s, j) => -0.4 * s.W + (j * 0.8 * s.W) / (N_RIDGE - 1);
const RIDGE_STEP = [4, 2, 1];      // ×6 shows every 4th ridge, ×18 every 2nd, ×60 all: a finer level only adds ridges

/**
 * One scale at magnification Z, detail level lvl (0: ×6, 1: ×18, 2: ×60). Drawn in its own frame
 * (x along the scale from socket to toothed tip, macro units).
 */
function drawScale(g, s, Z, ox, oy, lvl) {
  const c = Math.cos(s.th), sn = Math.sin(s.th), px = 1 / Z;
  const [h0, s0, l0] = s.hsl, blue = s0 > 0.3 && l0 > 0.2;
  const hue = h0 + s.hj * (blue ? 1 : 0.2), sat = blue ? Math.min(1, s0 * 1.08) : s0, lit = l0 * (1 + s.lj);
  const path = scalePath(s);
  // shadow cast toward the lower right (light from the upper left), given in world units → local
  const wx = 0.42, wy = 0.6, lx = wx * c + wy * sn, ly = -wx * sn + wy * c;
  g.setTransform(Z * c, Z * sn, -Z * sn, Z * c, (s.x - ox) * Z, (s.y - oy) * Z);
  if (lvl === 2) {
    g.save(); g.filter = `blur(${(0.25 * Z).toFixed(1)}px)`; g.translate(lx * 1.3, ly * 1.3);
    g.fillStyle = 'rgba(2,4,14,.7)'; g.fill(path); g.restore();
  } else {
    g.save(); g.translate(lx, ly); g.fillStyle = 'rgba(2,4,14,.4)'; g.fill(path);
    g.translate(lx * 0.6, ly * 0.6); g.fillStyle = 'rgba(2,4,14,.18)'; g.fill(path); g.restore();
  }
  // body: dark socket end → its own colour → a lighter toothed tip
  const lg = g.createLinearGradient(0, 0, s.L, 0);
  lg.addColorStop(0, hsl(hue + 6, sat, lit * 0.3)); lg.addColorStop(0.45, hsl(hue, sat, lit * 0.74));
  lg.addColorStop(1, hsl(hue - 8, sat, Math.min(0.85, lit * 0.98 + 0.02)));
  g.fillStyle = lg; g.fill(path);
  // rounded cross-section: darker edges, a soft light band
  const cg = g.createLinearGradient(0, -s.W / 2, 0, s.W / 2);
  cg.addColorStop(0, 'rgba(0,0,12,.4)'); cg.addColorStop(0.22, 'rgba(0,0,0,0)');
  cg.addColorStop(0.36 + s.sheen * 0.12, `rgba(${blue ? '150,225,255' : '255,255,255'},.1)`); cg.addColorStop(0.62, 'rgba(0,0,0,0)');
  cg.addColorStop(1, 'rgba(0,0,12,.46)');
  g.fillStyle = cg; g.fill(path);
  // ridges along the scale (a subset at coarse levels, at the same positions)
  const step = RIDGE_STEP[lvl];
  g.save(); g.clip(path);
  const crestL = blue ? Math.min(0.8, lit * 1.12 + 0.1) : Math.min(0.5, lit * 1.6 + 0.08);
  const crest = hsl(hue - 18, blue ? 1 : sat, crestL, lvl === 0 ? 0.26 : lvl === 1 ? 0.6 : 0.9);
  const groove = hsl(hue + 10, sat, lit * 0.22, lvl === 0 ? 0.2 : 0.6);
  if (lvl === 2) {
    // cross-ribs between ridges (the ladder seen on a scale up close)
    g.beginPath();
    for (let j = 0; j < N_RIDGE - 1; j++) {
      const ya = ridgeY(s, j), yb = ridgeY(s, j + 1);
      for (let x = 0.3 * s.L + ((j * 0.37) % 0.15); x < s.L; x += 0.15) { g.moveTo(x, ya + 0.04); g.lineTo(x + 0.02, yb - 0.04); }
    }
    g.strokeStyle = hsl(hue + 8, sat, lit * 0.24, 0.55); g.lineWidth = 1.3 * px; g.stroke();
  }
  g.beginPath();
  for (let j = 0; j < N_RIDGE; j += step) { const y = ridgeY(s, j) + 0.035 * s.W; g.moveTo(0.22 * s.L, y); g.lineTo(1.05 * s.L, y); }
  g.strokeStyle = groove; g.lineWidth = (lvl === 2 ? 4.4 : lvl === 1 ? 1.6 : 1.1) * px; g.stroke();
  g.beginPath();
  for (let j = 0; j < N_RIDGE; j += step) { const y = ridgeY(s, j); g.moveTo(0.22 * s.L, y); g.lineTo(1.05 * s.L, y); }
  g.strokeStyle = crest; g.lineWidth = (lvl === 2 ? 2.8 : lvl === 1 ? 1.3 : 0.9) * px; g.stroke();
  if (lvl === 2) {
    // fine bright line on top of each crest
    g.strokeStyle = hsl(hue - 24, 1, blue ? 0.82 : 0.45, 0.6); g.lineWidth = 0.9 * px; g.stroke();
  }
  g.restore();
  g.strokeStyle = 'rgba(2,4,14,.5)'; g.lineWidth = (lvl === 2 ? 2.2 : 0.9) * px; g.stroke(path);
  // light catching the toothed free end
  g.save(); g.beginPath(); g.rect(0.8 * s.L, -s.W, s.L, 2 * s.W); g.clip();
  g.strokeStyle = hsl(hue - 16, blue ? 1 : sat, Math.min(0.85, crestL + 0.08), lvl === 2 ? 0.55 : 0.6);
  g.lineWidth = (lvl === 2 ? 2.4 : 1.1) * px; g.stroke(path);
  g.restore();
}

/**
 * Render the hidden layer into lv = { cv, g, Z, ox, oy } (level px = (macro − origin)·Z).
 * base 'desk': layer A enlarged underneath (paper, desk, card edge, wing shadow) with paper fibres and wood pores added;
 * base 'membrane': dark wing membrane only. feather: fraction of each side faded to alpha 0 (so a finer level can sit
 * on a coarser one without a visible edge).
 */
export function renderLevel(lv, { Acv, scales, lvl, base, cardPath, hindPath, feather = 0 }) {
  const { g, Z, ox, oy } = lv, w = lv.cv.width, h = lv.cv.height;
  const toMacro = () => g.setTransform(Z, 0, 0, Z, -ox * Z, -oy * Z);
  const mx0 = ox, my0 = oy, mx1 = ox + w / Z, my1 = oy + h / Z;
  const r = rand(5150 + lvl);
  if (base === 'desk') {
    toMacro();
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(Acv, 0, 0);
    // paper fibres on the card
    g.save(); g.clip(cardPath);
    const area = (mx1 - mx0) * (my1 - my0), n = Math.round(area * 0.16);
    const batches = [['rgba(110,84,52,.16)', 0.16], ['rgba(255,255,255,.3)', 0.14], ['rgba(110,84,52,.1)', 0.3]];
    for (const [col, lw] of batches) {
      g.beginPath();
      for (let i = 0; i < n / batches.length; i++) {
        const x = mx0 + r() * (mx1 - mx0), y = my0 + r() * (my1 - my0), a = r() * TAU, l = 0.8 + r() * 3.2, b = (r() - 0.5) * 1.2;
        g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l / 2 - Math.sin(a) * b, y + Math.sin(a) * l / 2 + Math.cos(a) * b, x + Math.cos(a) * l, y + Math.sin(a) * l);
      }
      g.strokeStyle = col; g.lineWidth = lw; g.stroke();
    }
    g.restore();
    // wood pores off the card
    g.save();
    const off = new Path2D(); off.rect(mx0, my0, mx1 - mx0, my1 - my0); off.addPath(cardPath);
    g.clip(off, 'evenodd');
    g.beginPath();
    for (let i = 0; i < (mx1 - mx0) * (my1 - my0) * 0.05; i++) {
      const x = mx0 + r() * (mx1 - mx0), y = my0 + r() * (my1 - my0), l = 0.6 + r() * 2.4;
      g.moveTo(x, y); g.lineTo(x + l, y + (r() - 0.5) * 0.3);
    }
    g.strokeStyle = 'rgba(10,5,2,.32)'; g.lineWidth = 0.22; g.stroke();
    g.restore();
    // membrane under the scales: the enlarged picture, darkened
    g.save(); g.fillStyle = 'rgba(4,6,18,.72)'; g.fill(hindPath); g.restore();
  } else {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = PAL.membrane; g.fillRect(0, 0, w, h);
  }
  // scales, clipped to the wing outline
  g.save();
  toMacro(); g.clip(hindPath);
  const pad = 11;
  for (const s of scales) {
    if (s.x < mx0 - pad || s.x > mx1 + pad || s.y < my0 - pad || s.y > my1 + pad) continue;
    drawScale(g, s, Z, ox, oy, lvl);
  }
  g.restore();
  // fringe hairs along the margin (only the coarse level sees the wing edge)
  if (base === 'desk') {
    toMacro();
    g.lineCap = 'round';
    const N = HIND.length, cx = 760, cy = 1080;
    for (let i = 0; i < N; i++) {
      const [x0, y0] = HIND[i], [x1, y1] = HIND[(i + 1) % N];
      if (Math.hypot(x0 - HIND_ROOT[0], y0 - HIND_ROOT[1]) < 150) continue;
      if (x0 < mx0 - 5 || x0 > mx1 + 5 || y0 < my0 - 5 || y0 > my1 + 5) continue;
      const len = Math.hypot(x1 - x0, y1 - y0);
      let nx = (y1 - y0) / len, ny = -(x1 - x0) / len;
      if (nx * (x0 - cx) + ny * (y0 - cy) < 0) { nx = -nx; ny = -ny; }
      for (let k = 0; k < len * 3; k++) {
        const u = k / (len * 3), x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u, l = 1.4 + r() * 2.2, tw = (r() - 0.5) * 0.5;
        const spot = WINGS.hindR.spots.some(([sx, sy, sr]) => Math.hypot(sx - x, sy - y) < sr + 9);
        g.strokeStyle = spot ? 'rgba(220,214,200,.8)' : `rgba(${18 + r() * 20 | 0},${15 + r() * 14 | 0},${24 + r() * 16 | 0},.9)`;
        g.lineWidth = 0.28 + r() * 0.16;
        g.beginPath(); g.moveTo(x - nx * 0.6, y - ny * 0.6); g.lineTo(x + (nx + tw * ny) * l, y + (ny - tw * nx) * l); g.stroke();
      }
    }
  }
  // feathered edges (alpha ramps on all four sides)
  if (feather > 0) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    const img = g.getImageData(0, 0, w, h), d = img.data, fx = feather * w, fy = feather * h;
    for (let y = 0; y < h; y++) {
      const ay = Math.min(1, y / fy, (h - 1 - y) / fy);
      for (let x = 0; x < w; x++) {
        const a = Math.min(ay, x / fx, (w - 1 - x) / fx);
        if (a < 1) d[(y * w + x) * 4 + 3] = Math.round(255 * Math.max(0, a * a * (3 - 2 * a)));
      }
    }
    g.putImageData(img, 0, 0);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
}
