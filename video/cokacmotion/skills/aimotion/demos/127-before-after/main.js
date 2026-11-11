/*
 * 127 · 정리 전, 정리 후 — a before/after comparison scene (Canvas 2D, 10 s, 1080×1920).
 *
 * One scene description: every object of a small studio flat carries two states, A (정리 전) and B (정리 후):
 * position, scale, rotation, visibility, z and shape parameters (curtain opening, blanket crumple, plant droop,
 * cable tangle, folded or heaped clothes …). ONE renderer, paintRoom(g, state, t, camera), draws either state, so
 * everything that did not change lands on exactly the same pixels in both.
 *
 *   0.0–1.5  the messy room assembles (clutter drops in), title 정리 전
 *   1.5–4.4  before/after slider: both states are rendered full frame and composited through a feathered clip; the
 *            handle follows a hand path of minimum-jerk strokes through a damped spring (baked), labels ride the line
 *   4.4–5.0  the wipe line turns 90° about the handle: left/right becomes top/bottom
 *   5.0–7.4  split screen: two crop windows of the same scene with the same camera; the differences found in setup
 *            (A/B state compare → bounding boxes → numbered callouts placed without collisions) are circled in both
 *            halves with the same number; counters computed from the states (바닥의 물건 23 → 2 …)
 *   7.4–10   the top window slides away, the bottom one opens to the full room; the handle becomes the 정리 끝 stamp;
 *            sunlight afterglow
 * Shared micro-motion (dust, plant sway, curtain hem, clock, pendant) reads the same t in both states.
 */
import { defineDemo, rand, clamp, lerp, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const W = 1080, H = 1920, D = 10, TAU = Math.PI * 2;
const KR = `"${FONTS.pretendard.family}"`;

const seg = (t, a, b) => clamp((t - a) / (b - a));
const oc = (p) => ease.outCubic(clamp(p));
const io = (p) => ease.inOutCubic(clamp(p));
const ox = (p) => ease.outExpo(clamp(p));
const ob = (p, c = 1.7) => ease.outBack(clamp(p), c);
const i2 = (p) => { p = clamp(p); return p * p; };
const sm = (p) => { p = clamp(p); return p * p * (3 - 2 * p); };

// ------------------------------------------------------------------ palette: warm beige / grey, ink, ONE accent (mint)
const C = {
  ceil: '#E4D9C8', wall: '#EFE7DA', wall2: '#E8DECE', base: '#E0D3BF',
  floor: '#DCC8AC', floor2: '#CDB696', boardLine: 'rgba(110,84,52,0.13)',
  ink: '#2C2A31', ink2: '#5F5A54', ink3: '#8E877E', grey: '#B9B1A5', grey2: '#A39B8F', grey3: '#CFC8BC',
  paper: '#FBF8F2', oat: '#EADFCB', oat2: '#DCCDB3', sand: '#D9C3A0', wood: '#C9A982', wood2: '#B39169',
  kraft: '#CFA877', kraft2: '#B88F5E', kraft3: '#A47C4E',
  sky: '#F4EBDC', sky2: '#E9DCC6',
  mint: '#34C49C', mintD: '#1E9C7B', mintL: '#CDF2E6',
  inkBg: '#29272C',
};
const SUN = '255,229,182';

// ------------------------------------------------------------------ story clock (s)
const T = {
  titleIn: 0.32, titleOut: 1.42,
  hAppear: 1.46, grab: 1.72, release: 4.0,          // handle: pops in at the right edge, pressed while dragged
  turnA: 4.1, turnB: 4.62,                          // the wipe line turns 90° about the handle
  cropA: 4.62, cropB: 5.12,                         // full frames → two registered crop windows
  calloutA: 5.1, calloutStep: 0.084,               // numbered rings, staggered
  countA: 4.98, roll: [5.25, 5.75],
  calloutOut: 7.2, mergeA: 7.36, mergeB: 8.18,       // windows → the full 정리 후 room
  stamp: 8.3, title2: 8.02, glowA: 8.2,
};

// world → screen camera for a window: screen = (wx, wy) + s·(p − (cx, cy))
const CAM_FULL = { s: 1, cx: 540, cy: 960, wx: 540, wy: 960 };
const VP = [540, 560];                // vanishing point of the 2.5D tops and sides
const FLOOR_Y = 1120;                  // wall/floor line
const HANDLE_Y = 895;                  // the slider handle's height = the split gutter's centre
const WIN = { x: 24, w: 1032, h: 735, top: 150, bot: 905, r: 30 };   // final crop windows

// ------------------------------------------------------------------ drawing kit
let HEADLESS = false;
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d', HEADLESS ? { willReadFrequently: true } : undefined) };
}
function resetCtx(g) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.lineCap = 'butt'; g.lineJoin = 'miter'; g.setLineDash([]); g.lineDashOffset = 0; g.letterSpacing = '0px';
  g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)'; g.shadowOffsetX = 0; g.shadowOffsetY = 0;
  g.imageSmoothingEnabled = true; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
}
function rr(g, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
function poly(g, p, fill) {
  g.beginPath(); g.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]);
  g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); }
}
/** a closed smooth blob through points (quadratic midpoints), for crumpled cloth and paper */
function blob(g, p) {
  const n = p.length / 2;
  g.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = i % n, b = (i + 1) % n;
    const mx = (p[2 * a] + p[2 * b]) / 2, my = (p[2 * a + 1] + p[2 * b + 1]) / 2;
    if (i === 0) g.moveTo(mx, my); else g.quadraticCurveTo(p[2 * a], p[2 * a + 1], mx, my);
  }
  g.closePath();
}
function lin(g, x0, y0, x1, y1, stops) {
  const r = g.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) r.addColorStop(o, c);
  return r;
}
function rad(g, x, y, r0, r1, stops) {
  const r = g.createRadialGradient(x, y, r0, x, y, r1);
  for (const [o, c] of stops) r.addColorStop(o, c);
  return r;
}
function hex(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mixHex(a, b, k) {
  const A = hex(a), B = hex(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * k)},${Math.round(A[1] + (B[1] - A[1]) * k)},${Math.round(A[2] + (B[2] - A[2]) * k)})`;
}

// One-point 2.5D: a box's front face is drawn as given; its top (and the side facing the vanishing point) recede
// toward VP by the factor 1/(1 + d). VPL is VP expressed in the current object's local frame (set per object).
let VPL = VP;
function prism(g, x0, y0, x1, y1, d, front, top, side) {
  const k = 1 / (1 + d), [vx, vy] = VPL;
  const bx0 = vx + (x0 - vx) * k, bx1 = vx + (x1 - vx) * k, by0 = vy + (y0 - vy) * k, by1 = vy + (y1 - vy) * k;
  if (side) {
    if (x1 < vx) poly(g, [x1, y0, bx1, by0, bx1, by1, x1, y1], side);
    else if (x0 > vx) poly(g, [x0, y0, bx0, by0, bx0, by1, x0, y1], side);
  }
  if (top && y0 > vy) poly(g, [x0, y0, x1, y0, bx1, by0, bx0, by0], top);
  if (front) { g.fillStyle = front; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
  return { bx0, bx1, by0, by1 };
}

// =================================================================== the room shell (scene coordinates)
const BOARDS = { fx: 540, fy: 300, lanes: [], joints: [] };   // floor boards converge to a high vanishing point
function boardX(x0, y) { return BOARDS.fx + (x0 - BOARDS.fx) * (y - BOARDS.fy) / (FLOOR_Y - BOARDS.fy); }
function bakeBoards() {
  for (let x = -1400; x <= 2500; x += 84) BOARDS.lanes.push(x);
  const r = rand(1271);
  for (let i = 0; i < BOARDS.lanes.length - 1; i++) {
    let y = FLOOR_Y + 30 + r() * 160;
    while (y < 2000) { BOARDS.joints.push([i, y]); y += 230 + r() * 260 + (y - FLOOR_Y) * 0.6; }
  }
}
function paintShell(g, t) {
  // ceiling, wall, crown moulding
  g.fillStyle = C.ceil; g.fillRect(-700, -500, 2500, 590);
  g.fillStyle = lin(g, 0, 90, 0, FLOOR_Y, [[0, C.wall], [1, C.wall2]]); g.fillRect(-700, 90, 2500, FLOOR_Y - 90);
  g.fillStyle = C.paper; g.fillRect(-700, 84, 2500, 16);
  g.fillStyle = 'rgba(96,74,50,0.10)'; g.fillRect(-700, 100, 2500, 7);
  // floor + boards
  g.fillStyle = lin(g, 0, FLOOR_Y, 0, 2000, [[0, C.floor], [1, C.floor2]]); g.fillRect(-700, FLOOR_Y, 2500, 900);
  g.strokeStyle = C.boardLine; g.lineWidth = 2;
  g.beginPath();
  for (const x of BOARDS.lanes) { g.moveTo(x, FLOOR_Y); g.lineTo(boardX(x, 2000), 2000); }
  for (const [i, y] of BOARDS.joints) { g.moveTo(boardX(BOARDS.lanes[i], y), y); g.lineTo(boardX(BOARDS.lanes[i + 1], y), y); }
  g.stroke();
  // baseboard
  g.fillStyle = C.paper; g.fillRect(-700, FLOOR_Y - 22, 2500, 22);
  g.fillStyle = 'rgba(96,74,50,0.13)'; g.fillRect(-700, FLOOR_Y, 2500, 6);
  // rug (oval, under everything on the floor)
  g.fillStyle = 'rgba(80,60,40,0.10)'; g.beginPath(); g.ellipse(536, 1482, 432, 136, 0, 0, TAU); g.fill();
  g.fillStyle = C.oat; g.beginPath(); g.ellipse(530, 1472, 424, 130, 0, 0, TAU); g.fill();
  g.strokeStyle = C.paper; g.lineWidth = 7; g.beginPath(); g.ellipse(530, 1472, 384, 112, 0, 0, TAU); g.stroke();
  g.strokeStyle = C.grey3; g.lineWidth = 3; g.beginPath(); g.ellipse(530, 1472, 340, 94, 0, 0, TAU); g.stroke();
  g.beginPath(); g.ellipse(530, 1472, 300, 80, 0, 0, TAU); g.stroke();

  paintWindow(g);
  // curtain rod
  g.fillStyle = C.ink; rr(g, 112, 466, 496, 8, 4); g.fill();
  g.beginPath(); g.arc(112, 470, 10, 0, TAU); g.arc(608, 470, 10, 0, TAU); g.fill();
  // framed print
  g.fillStyle = C.ink; rr(g, 640, 500, 150, 196, 6); g.fill();
  g.fillStyle = C.paper; g.fillRect(650, 510, 130, 176);
  g.fillStyle = C.oat; g.fillRect(668, 528, 94, 140);
  g.fillStyle = C.ink2; g.beginPath(); g.arc(733, 572, 17, 0, TAU); g.fill();
  poly(g, [668, 668, 668, 630, 700, 604, 735, 636, 762, 618, 762, 668], C.sand);
  poly(g, [668, 668, 668, 650, 712, 628, 762, 662, 762, 668], C.kraft2);
  // clock — the second hand reads t (identical in both states)
  paintClock(g, t);
  // shelf
  VPL = VP;
  g.fillStyle = C.ink2;
  poly(g, [690, 838, 704, 838, 704, 870], C.ink2); poly(g, [968, 838, 982, 838, 968, 870], C.ink2);
  prism(g, 646, 820, 1014, 838, 0.07, C.wood, '#DEC4A0', C.wood2);
  g.fillStyle = C.ink; g.fillRect(958, 784, 40, 36);
  g.fillStyle = C.ink2; g.fillRect(958, 784, 40, 7);
  g.fillStyle = C.oat2; g.beginPath(); g.ellipse(926, 806, 15, 15, 0, 0, TAU); g.fill(); g.fillRect(920, 780, 12, 16);
  g.strokeStyle = C.ink2; g.lineWidth = 2.5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(926, 782); g.quadraticCurveTo(920, 752, 906, 738); g.moveTo(926, 782); g.quadraticCurveTo(934, 760, 946, 750); g.stroke();
  g.lineCap = 'butt';
  g.fillStyle = C.ink; g.fillRect(872, 772, 6, 48); g.fillRect(872, 814, 26, 6);     // bookend
  // outlet
  g.fillStyle = C.paper; rr(g, 1092, 1046, 32, 42, 5); g.fill();
  g.fillStyle = 'rgba(60,50,40,0.22)'; g.fillRect(1092, 1086, 32, 3);
  g.fillStyle = C.ink2; g.fillRect(1102, 1058, 3, 8); g.fillRect(1111, 1058, 3, 8);
  // door + coat hook (right, beyond the portrait frame; seen in the wide split crop)
  g.fillStyle = C.paper; g.fillRect(1124, 560, 236, FLOOR_Y - 560);
  g.fillStyle = C.oat2; g.fillRect(1142, 578, 200, FLOOR_Y - 578);
  g.fillStyle = 'rgba(255,255,255,0.35)'; rr(g, 1166, 610, 152, 200, 8); g.fill(); rr(g, 1166, 846, 152, 240, 8); g.fill();
  g.fillStyle = C.ink; g.beginPath(); g.arc(1168, 870, 10, 0, TAU); g.fill();
  // nightstand (left, beyond the frame)
  VPL = VP;
  prism(g, -330, 1050, -196, 1184, 0.12, C.wood, '#DEC4A0', C.wood2);
  g.fillStyle = C.ink2; rr(g, -290, 1100, 54, 8, 4); g.fill();
  g.fillStyle = C.ink; g.fillRect(-268, 990, 6, 58);
  poly(g, [-300, 990, -230, 990, -244, 950, -286, 950], C.oat2);
}
function paintWindow(g) {
  g.save();
  g.beginPath(); g.rect(170, 500, 380, 350); g.clip();
  g.fillStyle = lin(g, 0, 500, 0, 850, [[0, '#E6D8BF'], [0.55, '#F2E8D6'], [1, '#F8F1E4']]); g.fillRect(170, 500, 380, 350);
  g.fillStyle = rad(g, 214, 548, 0, 240, [[0, 'rgba(255,250,232,0.95)'], [0.35, 'rgba(255,244,214,0.5)'], [1, 'rgba(255,244,214,0)']]);
  g.fillRect(170, 500, 380, 350);
  g.fillStyle = '#D9CCB6';
  poly(g, [170, 850, 170, 770, 226, 770, 226, 742, 292, 742, 292, 778, 352, 778, 352, 726, 396, 700, 440, 726, 440, 786, 498, 786, 498, 752, 550, 752, 550, 850]);
  g.fill();
  g.fillStyle = '#E3D7C3';
  for (const [x, y] of [[380, 744], [400, 760], [414, 744], [270, 760], [520, 776]]) { g.fillRect(x, y, 8, 10); }
  g.fillStyle = '#CFC4AE'; g.beginPath(); g.arc(470, 812, 48, 0, TAU); g.arc(510, 800, 38, 0, TAU); g.arc(214, 826, 40, 0, TAU); g.fill();
  g.restore();
  g.fillStyle = 'rgba(96,74,50,0.12)'; g.fillRect(170, 500, 380, 9); g.fillRect(170, 500, 8, 350);
  g.fillStyle = C.paper;
  g.fillRect(156, 486, 408, 14); g.fillRect(156, 850, 408, 14); g.fillRect(156, 486, 14, 378); g.fillRect(550, 486, 14, 378);
  g.fillRect(354, 500, 12, 350); g.fillRect(170, 664, 380, 10);
  VPL = VP;
  prism(g, 140, 864, 580, 884, 0.09, '#F4EEE4', '#FFFDF8', '#E4DACA');
  g.fillStyle = 'rgba(96,74,50,0.10)'; g.fillRect(150, 884, 420, 8);
}
function paintClock(g, t) {
  const x = 930, y = 600, r = 54;
  g.fillStyle = 'rgba(96,74,50,0.12)'; g.beginPath(); g.arc(x + 4, y + 6, r + 6, 0, TAU); g.fill();
  g.fillStyle = C.ink; g.beginPath(); g.arc(x, y, r + 6, 0, TAU); g.fill();
  g.fillStyle = C.paper; g.beginPath(); g.arc(x, y, r - 2, 0, TAU); g.fill();
  g.fillStyle = C.ink2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU, l = i % 3 ? 5 : 10;
    g.save(); g.translate(x, y); g.rotate(a); g.fillRect(-1.5, -r + 6, 3, l); g.restore();
  }
  g.strokeStyle = C.ink; g.lineCap = 'round';
  const hand = (a, l, w) => { g.lineWidth = w; g.beginPath(); g.moveTo(x - Math.sin(a) * 8, y + Math.cos(a) * 8); g.lineTo(x + Math.sin(a) * l, y - Math.cos(a) * l); g.stroke(); };
  hand(((10 + 8 / 60) / 12) * TAU, 26, 6);
  hand((8 / 60) * TAU, 40, 4);
  g.strokeStyle = C.mintD; hand(((12 + t) / 60) * TAU, 44, 2.2);
  g.lineCap = 'butt';
  g.fillStyle = C.ink; g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill();
}
function paintPendant(g, t) {
  const ax = 900, ay = 90, L = 214, a = 0.03 * Math.sin(1.25 * t + 0.4);
  const x = ax + Math.sin(a) * L, y = ay + Math.cos(a) * L;
  g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(ax, ay); g.lineTo(x, y); g.stroke();
  g.save(); g.translate(x, y); g.rotate(-a);
  g.fillStyle = C.ink; g.fillRect(-9, -6, 18, 16);
  g.beginPath(); g.moveTo(-70, 64); g.bezierCurveTo(-66, 10, -30, 6, 0, 6); g.bezierCurveTo(30, 6, 66, 10, 70, 64); g.closePath(); g.fill();
  g.fillStyle = C.ink2; g.beginPath(); g.moveTo(10, 8); g.bezierCurveTo(44, 12, 62, 24, 70, 64); g.lineTo(46, 64); g.bezierCurveTo(42, 34, 28, 16, 10, 8); g.fill();
  g.fillStyle = C.oat; g.beginPath(); g.ellipse(0, 64, 70, 9, 0, 0, TAU); g.fill();
  g.restore();
}

// =================================================================== object kinds: draw(g, st, t, E, it) in local coords
// st = the object's state (x, y, s, r, vis, z, surface, shape …), it = the object (fixed params), E = { S, L } state
// key and light level. box(st, it) returns the local bounds [x0, y0, x1, y1] that difference detection transforms.
const shadowEl = (g, cx, w, h = 12, a = 0.16) => {
  g.fillStyle = `rgba(70,50,30,${a})`; g.beginPath(); g.ellipse(cx, 0, w, h, 0, 0, TAU); g.fill();
};
const KINDS = {};

KINDS.desk = {
  draw(g) {
    g.fillStyle = 'rgba(70,50,30,0.13)';
    g.beginPath(); g.ellipse(636, 1186, 26, 7, 0, 0, TAU); g.ellipse(1046, 1186, 26, 7, 0, 0, TAU); g.fill();
    g.fillStyle = C.wood2; g.fillRect(626, 1024, 20, 162); g.fillRect(1036, 1024, 20, 162);
    prism(g, 886, 1024, 1056, 1114, 0.035, C.wood, null, C.wood2);
    g.fillStyle = 'rgba(80,60,40,0.16)'; g.fillRect(886, 1024, 170, 6);
    g.fillStyle = C.ink2; rr(g, 944, 1062, 54, 9, 4.5); g.fill();
    prism(g, 604, 998, 1076, 1026, 0.12, C.wood, '#E3CBA8', C.wood2);
    g.fillStyle = 'rgba(255,255,255,0.32)'; g.fillRect(604, 998, 472, 3);
    // lamp (off) and a closed laptop: unchanged in both states
    g.fillStyle = C.ink; g.beginPath(); g.ellipse(668, 984, 30, 8, 0, 0, TAU); g.fill(); g.fillRect(638, 978, 60, 6);
    g.strokeStyle = C.ink; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(668, 980); g.lineTo(688, 900); g.lineTo(742, 872); g.stroke();
    g.lineCap = 'butt'; g.lineJoin = 'miter';
    g.save(); g.translate(742, 872); g.rotate(0.5);
    poly(g, [-18, -14, 18, -14, 34, 26, -34, 26], C.oat2); g.fillStyle = C.ink; g.fillRect(-18, -16, 36, 6);
    g.restore();
    prism(g, 872, 984, 1032, 998, 0.12, C.grey2, C.grey3, null);
    g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(872, 984, 160, 2);
  },
};
KINDS.chairSeat = {
  draw(g) {
    g.fillStyle = 'rgba(70,50,30,0.14)'; g.beginPath(); g.ellipse(820, 1412, 118, 16, 0, 0, TAU); g.fill();
    g.fillStyle = C.ink2; g.fillRect(756, 1276, 9, 104); g.fillRect(876, 1276, 9, 104);
    prism(g, 726, 1250, 914, 1278, 0.1, C.oat2, C.oat, C.sand);
  },
};
KINDS.chairBack = {
  draw(g) {
    g.fillStyle = C.ink; g.fillRect(736, 1278, 12, 136); g.fillRect(892, 1278, 12, 136);
    g.fillRect(744, 1104, 10, 150); g.fillRect(886, 1104, 10, 150);
    g.fillStyle = C.oat2; rr(g, 732, 1084, 176, 48, 16); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)'; rr(g, 742, 1090, 156, 10, 5); g.fill();
  },
};
KINDS.bed = {
  draw(g) {
    g.fillStyle = 'rgba(70,50,30,0.14)'; g.beginPath(); g.ellipse(180, 1316, 380, 18, 0, 0, TAU); g.fill();
    g.fillStyle = C.wood2; g.fillRect(-156, 1290, 18, 24); g.fillRect(494, 1290, 18, 24);
    g.fillStyle = C.wood; rr(g, -176, 930, 40, 380, 12); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(-170, 944, 8, 340);
    prism(g, -140, 1178, 522, 1292, 0.03, C.wood, null, C.wood2);
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(-140, 1178, 662, 4);
    prism(g, -134, 1132, 514, 1180, 0.16, '#F3EEE5', '#FBF8F2', '#E7E0D4');
    g.fillStyle = 'rgba(96,74,50,0.10)'; g.fillRect(-134, 1172, 648, 8);
  },
};
KINDS.basket = {
  draw(g) {
    shadowEl(g, 0, 78, 12);
    poly(g, [-68, -100, 68, -100, 58, 0, -58, 0], C.oat2);
    g.strokeStyle = 'rgba(150,110,70,0.35)'; g.lineWidth = 3;
    g.beginPath();
    for (let y = -84; y < 0; y += 14) { const k = (y + 100) / 100; g.moveTo(-68 + 10 * k, y); g.lineTo(68 - 10 * k, y); }
    g.stroke();
    g.fillStyle = C.kraft3; g.beginPath(); g.ellipse(0, -100, 64, 13, 0, 0, TAU); g.fill();
    g.fillStyle = C.sand; rr(g, -72, -108, 144, 14, 7); g.fill();
    g.fillStyle = C.kraft2; rr(g, -18, -84, 36, 10, 5); g.fill();
  },
};

// curtains: open 0 (drawn, the light glows through) … 1 (gathered and tied back with a mint band)
KINDS.curtain = {
  draw(g, st, t, E, it) {
    const o = st.shape.open, side = it.side;
    const sway = 3.2 * Math.sin(1.15 * t + side * 1.3) + 1.6 * Math.sin(2.3 * t + side);
    if (side > 0) { g.translate(720, 0); g.scale(-1, 1); }
    const top = 478, tie = 724, hem = 914;
    const oT = [104, top], oK = [lerp(104, 112, o), tie], oH = [lerp(102, 92, o) - sway * 0.4, hem];
    const iT = [lerp(346, 202, o), top], iK = [lerp(345, 176, o), tie], iH = [lerp(344, 214, o) + sway, hem];
    const at = (f, P, Q) => [P[0] + (Q[0] - P[0]) * f, P[1] + (Q[1] - P[1]) * f];
    const edge = (f) => [at(f, oT, iT), at(f, oK, iK), at(f, oH, iH)];
    const ctrl = (a, k, b) => [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2];
    const band = (f0, f1, fill) => {
      const A = edge(f0), B = edge(f1), ca = ctrl(...A), cb = ctrl(...B);
      g.beginPath(); g.moveTo(A[0][0], A[0][1]); g.quadraticCurveTo(ca[0], ca[1], A[2][0], A[2][1]);
      g.lineTo(B[2][0], B[2][1] + 4); g.quadraticCurveTo(cb[0], cb[1], B[0][0], B[0][1]); g.closePath();
      g.fillStyle = fill; g.fill();
    };
    band(0, 1, C.oat);
    const n = 6;
    for (let i = 0; i < n; i++) {
      band((i + 0.06) / n, (i + 0.3) / n, 'rgba(255,255,255,0.42)');
      band((i + 0.58) / n, (i + 0.94) / n, `rgba(128,100,64,${0.1 + 0.08 * o})`);
    }
    // backlit when drawn: the sun behind the cloth
    if (o < 0.9) {
      g.save(); band(0, 1, 'rgba(0,0,0,0)'); g.clip();
      g.fillStyle = rad(g, 300, 600, 10, 330, [[0, `rgba(${SUN},${0.5 * (1 - o)})`], [1, `rgba(${SUN},0)`]]);
      g.globalCompositeOperation = 'screen'; g.fillRect(90, 470, 300, 450); g.restore();
    }
    g.fillStyle = C.ink2;
    for (let i = 0; i <= 5; i++) { const [x] = at(i / 5, oT, iT); g.beginPath(); g.arc(x, 474, 6, 0, TAU); g.fill(); }
    if (o > 0.5) {
      const [kx] = edge(0.5)[1];
      g.save(); g.translate(kx, tie); g.rotate(-0.08);
      g.fillStyle = C.mint; rr(g, -40, -9, 80, 18, 9); g.fill();
      g.fillStyle = C.mintD; g.beginPath(); g.arc(30, 0, 8, 0, TAU); g.fill();
      g.restore();
    }
  },
  box(st, it) {
    const o = st.shape.open, inner = Math.max(lerp(346, 202, o), lerp(344, 214, o)) + 6;
    return it.side > 0 ? [720 - inner, 466, 720 - 90, 920] : [90, 466, inner, 920];
  },
};

// blanket + pillow: crumple 1 = kicked-off heap, 0 = made bed
let BLANKET_HEAP = null;
KINDS.blanket = {
  draw(g, st, t) {
    if (st.shape.crumple > 0.5) {
      const p = BLANKET_HEAP;
      g.fillStyle = 'rgba(70,50,30,0.12)'; g.beginPath(); g.ellipse(430, 1300, 90, 10, 0, 0, TAU); g.fill();
      blob(g, p); g.fillStyle = '#F4EEE3'; g.fill();
      g.save(); blob(g, p); g.clip();
      g.fillStyle = lin(g, 0, 1010, 0, 1290, [[0, 'rgba(255,255,255,0.4)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(110,84,52,0.18)']]);
      g.fillRect(0, 990, 560, 320);
      g.strokeStyle = C.grey3; g.lineWidth = 7;
      for (let k = 0; k < 4; k++) {
        g.beginPath();
        for (let x = 0; x <= 540; x += 12) { const y = 1080 + k * 44 + 16 * Math.sin(x * 0.021 + k * 1.7) + 9 * Math.sin(x * 0.053 + k); if (x === 0) g.moveTo(x, y); else g.lineTo(x, y); }
        g.stroke();
      }
      g.strokeStyle = 'rgba(110,84,52,0.22)'; g.lineWidth = 4; g.lineCap = 'round';
      for (const [x0, y0, cx, cy, x1, y1] of [[120, 1090, 170, 1120, 230, 1100], [260, 1060, 300, 1110, 360, 1090], [330, 1160, 380, 1190, 450, 1170], [170, 1190, 220, 1220, 270, 1200], [420, 1080, 450, 1120, 500, 1110]]) {
        g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
      }
      g.lineCap = 'butt';
      g.restore();
    } else {
      poly(g, [62, 1136, 516, 1136, 517, 1058, 130, 1058], '#F7F2EA');
      g.fillStyle = '#EFE8DC'; rr(g, 58, 1128, 462, 112, 14); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(64, 1128, 452, 5);
      g.fillStyle = C.grey3; g.fillRect(58, 1188, 462, 7); g.fillRect(58, 1203, 462, 4);
      poly(g, [62, 1136, 128, 1136, 140, 1058, 128, 1058], C.oat);
      g.fillStyle = C.oat; rr(g, 58, 1128, 70, 112, 14); g.fill();
      g.fillStyle = 'rgba(110,84,52,0.10)'; g.fillRect(124, 1128, 6, 112);
    }
  },
  box(st) { return st.shape.crumple > 0.5 ? [0, 1000, 540, 1300] : [56, 1054, 522, 1242]; },
};
KINDS.pillow = {
  draw(g, st) {
    if (st.surface === 'floor') shadowEl(g, 0, 88, 12);
    g.fillStyle = '#F6F1E7'; rr(g, -92, -62, 184, 60, 26); g.fill();
    g.fillStyle = 'rgba(110,84,52,0.10)'; rr(g, -92, -26, 184, 24, 12); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.55)'; rr(g, -70, -56, 110, 12, 6); g.fill();
  },
  box() { return [-94, -64, 94, 2]; },
};

KINDS.book = {
  draw(g, st, t, E, it) {
    const { w, h, col, band } = it;
    if (st.surface === 'floor' && it.lowest) { g.save(); g.rotate(-st.r); shadowEl(g, 0, h * 0.62, 10, 0.15); g.restore(); }
    g.fillStyle = col; rr(g, -w / 2, -h, w, h, 3); g.fill();
    g.fillStyle = band; g.fillRect(-w / 2, -h * 0.82, w, 7); g.fillRect(-w / 2, -h * 0.2, w, 4);
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(-w / 2 + 3, -h + 3, 3, h - 6);
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(w / 2 - 4, -h + 2, 4, h - 4);
    g.fillStyle = band; rr(g, -w * 0.22, -h * 0.6, w * 0.44, h * 0.22, 2); g.fill();
  },
  box(st, it) { return [-it.w / 2, -it.h, it.w / 2, 0]; },
};

// garments: fold 1 = folded square on the stack, 0 = crumpled heap (seeded blob) with a hanging sleeve
const BLOBS = {};
KINDS.garment = {
  draw(g, st, t, E, it) {
    const { col, col2 } = it;
    if (st.shape.fold > 0.5) {
      if (it.type === 'sock') {
        g.fillStyle = col; g.beginPath(); g.arc(0, -13, 13, 0, TAU); g.fill();
        g.fillStyle = col2; g.fillRect(-13, -15, 26, 4);
        return;
      }
      const w = it.fw, h = it.fh;
      g.fillStyle = col; rr(g, -w / 2, -h, w, h, 7); g.fill();
      g.fillStyle = col2; g.fillRect(-w / 2 + 6, -h * 0.5, w - 12, 3);
      g.fillStyle = 'rgba(255,255,255,0.28)'; rr(g, -w / 2 + 4, -h + 2, w - 8, 4, 2); g.fill();
      if (it.collar) { g.fillStyle = col2; g.beginPath(); g.ellipse(0, -h, 14, 5, 0, 0, Math.PI); g.fill(); }
      return;
    }
    const style = CRUMPLE[it.type];
    if (st.surface === 'floor') shadowEl(g, 0, it.cw * 0.5, 8, 0.14);
    style.draw(g, st, t, it);
  },
  box(st, it) {
    if (st.shape.fold > 0.5) return it.type === 'sock' ? [-14, -27, 14, 0] : [-it.fw / 2, -it.fh - 6, it.fw / 2, 0];
    return CRUMPLE[it.type].box(it);
  },
};


// the heaped look of each garment type (local coords; flat ones lie on the floor, drape hangs over the chair rail)
function tube(g, x, y, len, ang, w, col, col2, t) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = col2; rr(g, -w / 2 - 1, -6, w + 2, len + 1, w / 2); g.fill();
  g.fillStyle = col; rr(g, -w / 2, -6, w, len - 12, w / 2 - 1); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(-w / 2 + 3, 0, 4, len - 24);
  g.fillStyle = col2; for (let k = 0; k < 3; k++) g.fillRect(-w / 2 + 4 + k * (w - 8) / 2.5, len - 14, 3, 12);
  g.restore();
}
function mound(g, it, extra) {
  const p = BLOBS[it.id];
  blob(g, p); g.fillStyle = it.col; g.fill();
  g.save(); blob(g, p); g.clip();
  g.fillStyle = lin(g, 0, -it.ch, 0, 0, [[0, 'rgba(255,255,255,0.22)'], [1, 'rgba(60,40,20,0.2)']]);
  g.fillRect(-it.cw, -it.ch - 10, it.cw * 2, it.ch + 20);
  if (extra) extra();
  g.strokeStyle = it.col2; g.lineWidth = 3.5; g.lineCap = 'round';
  for (const [a, b, c, d, e, f] of it.creases) { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo(c, d, e, f); g.stroke(); }
  g.lineCap = 'butt';
  g.restore();
}
const CRUMPLE = {
  sweater: { draw(g, st, t, it) { mound(g, it, () => { g.fillStyle = it.col2; for (let x = -it.cw / 2; x < it.cw / 2; x += 9) g.fillRect(x, -16, 3, 16); }); }, box: (it) => [-it.cw / 2, -it.ch, it.cw / 2, 2] },
  towel: { draw(g, st, t, it) { mound(g, it, () => { g.fillStyle = C.ink2; g.save(); g.rotate(-0.25); g.fillRect(-it.cw, -it.ch * 0.62, it.cw * 2, 9); g.fillRect(-it.cw, -it.ch * 0.62 + 15, it.cw * 2, 4); g.restore(); }); }, box: (it) => [-it.cw / 2, -it.ch, it.cw / 2, 2] },
  pants: {
    draw(g, st, t, it) { const [sx, sy, len, ang] = it.sleeve; tube(g, sx, sy, len, ang + 0.04 * Math.sin(1.4 * t), 42, it.col, it.col2, t); mound(g, it); },
    box: (it) => { const [sx, sy, len, ang] = it.sleeve; const ex = sx - Math.sin(ang) * len, ey = sy + Math.cos(ang) * len; return [Math.min(-it.cw / 2, ex - 20), -it.ch, it.cw / 2, Math.max(2, ey + 10)]; },
  },
  hoodie: {
    // hung over the chair's top rail: hood, front panel with pocket and drawstrings, two sleeves
    draw(g, st, t, it) {
      const sw = 0.04 * Math.sin(1.3 * t);
      tube(g, -60, 18, 150, 0.1 + sw, 30, it.col, it.col2, t);
      tube(g, 62, 14, 128, -0.14 + sw, 30, it.col, it.col2, t);
      g.fillStyle = it.col2; g.beginPath(); g.ellipse(-30, -10, 44, 30, -0.2, 0, TAU); g.fill();
      g.fillStyle = it.col; g.beginPath(); g.ellipse(-30, -14, 38, 25, -0.2, 0, TAU); g.fill();
      g.fillStyle = '#6E675E'; g.beginPath(); g.ellipse(-26, -10, 22, 12, -0.2, 0, TAU); g.fill();
      g.fillStyle = it.col;
      g.beginPath(); g.moveTo(-64, 4); g.quadraticCurveTo(0, -14, 66, 2); g.lineTo(70, 128); g.quadraticCurveTo(36, 138, 2, 130); g.quadraticCurveTo(-34, 138, -68, 128); g.closePath(); g.fill();
      g.fillStyle = 'rgba(60,40,20,0.12)'; g.fillRect(-68, 104, 138, 26);
      g.fillStyle = it.col2; rr(g, -44, 66, 88, 38, 10); g.fill();
      g.fillStyle = it.col; rr(g, -40, 70, 80, 30, 8); g.fill();
      g.strokeStyle = C.paper; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-12, 8); g.quadraticCurveTo(-16, 30, -12 + 4 * Math.sin(1.7 * t), 52); g.moveTo(12, 6); g.quadraticCurveTo(16, 28, 13 + 4 * Math.sin(1.7 * t + 1), 46); g.stroke();
      g.lineCap = 'butt';
      g.strokeStyle = it.col2; g.lineWidth = 3;
      g.beginPath(); g.moveTo(-40, 30); g.quadraticCurveTo(-30, 60, -46, 96); g.moveTo(36, 26); g.quadraticCurveTo(44, 70, 34, 110); g.stroke();
    },
    box: () => [-96, -44, 104, 168],
  },
  tee: {
    draw(g, st, t, it) {
      const P = [-36, -2, 34, -4, 38, -28, 62, -34, 56, -50, 26, -56, 12, -50, -12, -50, -26, -56, -58, -48, -64, -32, -38, -28];
      poly(g, P, it.col);
      g.fillStyle = 'rgba(60,40,20,0.10)'; poly(g, [-36, -2, 34, -4, 36, -16, -36, -14]); g.fill();
      g.fillStyle = it.col2; g.beginPath(); g.ellipse(0, -50, 13, 5, 0, 0, Math.PI); g.fill();
      g.strokeStyle = it.col2; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-20, -40); g.quadraticCurveTo(0, -30, 18, -38); g.moveTo(-10, -20); g.quadraticCurveTo(10, -14, 26, -22); g.stroke();
      g.lineCap = 'butt';
    },
    box: () => [-66, -58, 64, 2],
  },
  sock: {
    draw(g, st, t, it) {
      g.fillStyle = it.col;
      g.beginPath(); g.moveTo(-30, -18); g.lineTo(2, -21); g.quadraticCurveTo(10, -21, 12, -15); g.lineTo(26, -11); g.quadraticCurveTo(34, -8, 30, -2);
      g.lineTo(4, -2); g.quadraticCurveTo(-4, -2, -6, -6); g.lineTo(-30, -6); g.closePath(); g.fill();
      g.fillStyle = it.col2; g.fillRect(-30, -18, 7, 12);
      g.beginPath(); g.moveTo(24, -11); g.quadraticCurveTo(34, -8, 30, -2); g.lineTo(22, -2); g.closePath(); g.fill();
    },
    box: () => [-32, -24, 34, 2],
  },
};

KINDS.cup = {
  draw(g, st, t, E, it) {
    if (st.shape.spill) {
      g.save(); g.rotate(-st.r);
      g.fillStyle = 'rgba(140,100,60,0.30)'; g.beginPath(); g.ellipse(-44, 18, 46, 9, 0, 0, TAU); g.ellipse(-86, 22, 20, 5, 0, 0, TAU); g.fill();
      g.restore();
    } else if (st.surface === 'floor') shadowEl(g, 0, 26, 6, 0.15);
    g.strokeStyle = it.col; g.lineWidth = 7; g.beginPath(); g.arc(20, -26, 12, -1.3, 1.3); g.stroke();
    g.fillStyle = it.col; rr(g, -20, -48, 40, 48, 8); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.10)'; g.fillRect(10, -46, 10, 44);
    g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(-15, -44, 5, 38);
    g.fillStyle = it.dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)'; g.beginPath(); g.ellipse(0, -48, 20, 5, 0, 0, TAU); g.fill();
    if (!st.shape.spill) { g.fillStyle = '#7A5A3E'; g.beginPath(); g.ellipse(0, -47, 15, 3.4, 0, 0, TAU); g.fill(); }
    if (st.shape.hot) {
      g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 4; g.lineCap = 'round';
      for (let i = 0; i < 2; i++) {
        g.beginPath();
        for (let k = 0; k <= 14; k++) {
          const y = -56 - k * 5, x = -6 + i * 12 + 5 * Math.sin(y * 0.09 + t * 3.1 + i * 2.1);
          if (k === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.globalAlpha = 0.85; g.stroke(); g.globalAlpha = 1;
      }
      g.lineCap = 'butt';
    }
  },
  box(st) { return [-22, -50, 34, 0]; },
};

// cables: the same two cords, tangled on the floor (A) or run and coiled with a mint tie (B); paths baked in setup
const CABLES = {};
KINDS.cable = {
  draw(g, st, t, E, it) {
    const P = CABLES[it.id][st.shape.tangle > 0.5 ? 'A' : 'B'];
    g.strokeStyle = C.ink2; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(P.pts[0], P.pts[1]);
    for (let i = 2; i < P.pts.length; i += 2) g.lineTo(P.pts[i], P.pts[i + 1]);
    g.stroke();
    g.lineCap = 'butt'; g.lineJoin = 'miter';
    for (const [x, y, w, h, a] of P.ties) { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = C.mint; rr(g, -w / 2, -h / 2, w, h, 4); g.fill(); g.restore(); }
    if (P.plug) { const [x, y, a] = P.plug; g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = C.paper; rr(g, -15, -11, 30, 22, 5); g.fill(); g.fillStyle = C.grey2; g.fillRect(-15, 6, 30, 5); g.restore(); }
  },
  box(st, it) { return CABLES[it.id][st.shape.tangle > 0.5 ? 'A' : 'B'].box; },
};

KINDS.box = {
  draw(g, st, t, E, it) {
    const { w, h } = it, x0 = -w / 2, x1 = w / 2, y0 = -h;
    shadowEl(g, 6, w * 0.6, 12, 0.16);
    const { bx0, bx1, by0 } = prism(g, x0, y0, x1, 0, 0.18, null, C.kraft3, C.kraft2);
    poly(g, [bx0, by0, bx1, by0, bx1 + 8, by0 - h * 0.46, bx0 - 4, by0 - h * 0.5], C.kraft);
    poly(g, [x0, y0, bx0, by0, bx0 - h * 0.42, by0 - h * 0.12, x0 - h * 0.48, y0 - h * 0.05], C.kraft2);
    poly(g, [x1, y0, bx1, by0, bx1 + h * 0.44, by0 - h * 0.2, x1 + h * 0.5, y0 - h * 0.12], '#C59D6B');
    g.fillStyle = C.kraft; g.fillRect(x0, y0, w, h);
    poly(g, [x0, y0, x1, y0, x1 - 6, y0 + h * 0.36, x0 + 6, y0 + h * 0.36], '#D8B587');
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(-9, y0, 18, h * 0.36);
    g.fillStyle = 'rgba(80,55,30,0.18)'; g.fillRect(x0, y0 + h * 0.36, w, 4);
    g.strokeStyle = 'rgba(80,55,30,0.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + 18, -h * 0.28); g.lineTo(x0 + 48, -h * 0.28); g.stroke();
  },
  box(st, it) { return [-it.w / 2 - it.h * 0.5, -it.h * 1.55, it.w / 2 + it.h * 0.5, 4]; },
};
KINDS.paper = {
  draw(g, st, t, E, it) {
    if (st.surface === 'floor') shadowEl(g, 0, it.r, 5, 0.14);
    g.save(); g.translate(0, -it.r);
    blob(g, BLOBS[it.id]); g.fillStyle = C.paper; g.fill();
    g.strokeStyle = 'rgba(80,70,60,0.35)'; g.lineWidth = 2.2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-it.r * 0.5, -it.r * 0.2); g.lineTo(it.r * 0.1, it.r * 0.15); g.lineTo(it.r * 0.4, -it.r * 0.35);
    g.moveTo(-it.r * 0.2, it.r * 0.5); g.lineTo(it.r * 0.2, it.r * 0.35); g.stroke();
    g.lineCap = 'butt'; g.restore();
  },
  box(st, it) { return [-it.r * 1.25, -it.r * 2.3, it.r * 1.25, 2]; },
};
KINDS.snack = {
  draw(g) {
    g.fillStyle = C.sand; rr(g, -32, -86, 64, 84, 10); g.fill();
    g.fillStyle = C.kraft2;
    for (let x = -30; x < 30; x += 8) { poly(g, [x, -86, x + 4, -92, x + 8, -86]); g.fill(); poly(g, [x, -2, x + 4, 4, x + 8, -2]); g.fill(); }
    g.fillStyle = C.ink; g.fillRect(-32, -62, 64, 26);
    g.fillStyle = C.paper; g.beginPath(); g.arc(0, -49, 9, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(-26, -82, 6, 74);
  },
  box() { return [-34, -94, 34, 6]; },
};
KINDS.bin = {
  draw(g, st) {
    if (st.r === 0) shadowEl(g, 0, 40, 9, 0.16);
    poly(g, [-38, -92, 38, -92, 31, 0, -31, 0], C.grey);
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(-26, -84, 7, 80);
    g.fillStyle = 'rgba(0,0,0,0.08)'; poly(g, [12, -92, 38, -92, 31, 0, 10, 0]); g.fill();
    g.fillStyle = C.ink2; g.beginPath(); g.ellipse(0, -92, 38, 10, 0, 0, TAU); g.fill();
    g.fillStyle = '#4A464D'; g.beginPath(); g.ellipse(0, -92, 32, 7, 0, 0, TAU); g.fill();
    if (st.shape.full) {
      g.fillStyle = C.paper;
      for (const [x, y, r] of [[-12, -98, 13], [10, -100, 15], [-2, -108, 12]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
      g.strokeStyle = 'rgba(80,70,60,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(4, -104); g.lineTo(14, -98); g.moveTo(-16, -100); g.lineTo(-8, -95); g.stroke();
    }
  },
  box(st) { return st.shape.full ? [-40, -124, 40, 2] : [-40, -104, 40, 2]; },
};

// plant: droop 1 = wilted on the floor, 0 = upright on the sill; the sway reads t in both states
const LEAVES = [[-1.05, 92], [-0.62, 112], [-0.22, 126], [0.18, 118], [0.55, 108], [0.98, 90], [-0.02, 84]];
KINDS.plant = {
  draw(g, st, t) {
    const d = st.shape.droop;
    if (st.surface === 'floor') shadowEl(g, 0, 44, 8, 0.16);
    const cA = mixHex('#46B487', '#A9A68A', d), cB = mixHex('#359A71', '#8E8B6F', d);
    g.strokeStyle = mixHex('#3E9C70', '#8A8670', d); g.lineWidth = 4; g.lineCap = 'round';
    LEAVES.forEach(([a0, len], i) => {
      const sway = 0.06 * Math.sin(1.7 * t + i * 0.9);
      const a = a0 * (1 + 0.85 * d) + Math.sign(a0 || 1) * 0.5 * d + sway;
      const L = len * (1 - 0.15 * d);
      const bx = Math.sin(a) * L * 0.55, by = -62 - Math.cos(a * 0.8) * L * 0.6;
      const ex = Math.sin(a) * L, ey = -62 - Math.cos(a) * L + d * 30;
      g.beginPath(); g.moveTo(0, -60); g.quadraticCurveTo(bx, by, ex, ey); g.stroke();
      g.save(); g.translate(ex, ey); g.rotate(Math.atan2(ey - by, ex - bx) + Math.PI / 2);
      g.fillStyle = i % 2 ? cA : cB;
      g.beginPath(); g.moveTo(0, 6); g.quadraticCurveTo(22, -18, 0, -50); g.quadraticCurveTo(-22, -18, 0, 6); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 2); g.lineTo(0, -40); g.stroke();
      g.restore();
      g.strokeStyle = mixHex('#3E9C70', '#8A8670', d); g.lineWidth = 4;
    });
    g.lineCap = 'butt';
    if (d > 0.5) { g.save(); g.translate(-64, -4); g.rotate(1.25); g.fillStyle = '#B4A989'; g.beginPath(); g.moveTo(0, 6); g.quadraticCurveTo(18, -14, 0, -40); g.quadraticCurveTo(-18, -14, 0, 6); g.fill(); g.restore(); }
    poly(g, [-36, -58, 36, -58, 27, 0, -27, 0], C.kraft2);
    g.fillStyle = 'rgba(0,0,0,0.10)'; poly(g, [10, -58, 36, -58, 27, 0, 8, 0]); g.fill();
    g.fillStyle = C.kraft; rr(g, -40, -68, 80, 14, 6); g.fill();
  },
  box(st) { return st.shape.droop > 0.5 ? [-150, -150, 140, 2] : [-112, -200, 112, 2]; },
};

// =================================================================== the scene description: one list, two states
// state = { x, y, s, r, vis, z, surface, shape }. Objects without B are unchanged (B = A). The renderer, difference
// detection, counters and callouts all read only this list.
const ITEMS = [];
const S0 = { x: 0, y: 0, s: 1, r: 0, vis: true, z: 0, surface: 'none', shape: {} };
function add(id, kind, group, A, B, it = {}) {
  const a = { ...S0, ...A, shape: { ...(A.shape || {}) } };
  const b = B ? { ...a, ...B, shape: { ...a.shape, ...(B.shape || {}) } } : a;
  ITEMS.push({ id, kind, group, A: a, B: b, ...it });
}
function buildScene() {
  add('bed', 'bed', null, { z: 1314 });
  add('desk', 'desk', null, { z: 1186 });
  add('chairSeat', 'chairSeat', null, { z: 1404 });
  add('chairBack', 'chairBack', null, { z: 1416 });
  add('basket', 'basket', null, { x: 622, y: 1292, z: 1292, surface: 'floor' });

  // (callout numbers are not fixed here: detect() finds the changed groups and numbers them in reading order)
  // curtains — drawn (A) / open and tied back (B)
  add('curtainL', 'curtain', 'curtain', { z: 50, shape: { open: 0.03 } }, { shape: { open: 1 } }, { side: -1 });
  add('curtainR', 'curtain', 'curtain', { z: 50, shape: { open: 0.03 } }, { shape: { open: 1 } }, { side: 1 });

  // books — a toppled pile on the rug (A) / a row on the shelf (B)
  const BK = [[26, 118, C.ink, C.sand], [32, 104, C.sand, C.ink], [22, 126, C.grey2, C.paper], [30, 96, C.oat2, C.ink2],
    [36, 112, C.ink2, C.oat], [24, 130, C.kraft, C.ink], [28, 100, C.grey3, C.ink2]];
  const r = rand(1273);
  let shelfX = 664, pileY = 1630;
  BK.forEach(([w, h, col, band], i) => {
    let A;
    if (i < 5) {
      const s = 1.1, j = (r() - 0.5) * 22;
      A = { x: 590 - (h * s) / 2 + j, y: pileY - (w * s) / 2, s, r: Math.PI / 2 + (r() - 0.5) * 0.1, z: 1630 + i * 0.01, surface: 'floor' };
      pileY -= w * s;
    } else if (i === 5) A = { x: 716, y: 1562, s: 1.1, r: Math.PI / 2 + 0.1, z: 1562, surface: 'floor' };
    else A = { x: 884, y: 1624, s: 1.1, r: -Math.PI / 2 + 0.14, z: 1624, surface: 'floor' };
    const B = { x: shelfX + (w * 0.85) / 2, y: 820, s: 0.85, r: 0, z: 120 + i * 0.01, surface: 'shelf' };
    shelfX += w * 0.85 + 1;
    add('book' + i, 'book', 'books', A, B, { w, h, col, band, lowest: i === 0 || i >= 5 });
  });

  // clothes — heaped on the chair and dropped under it (A) / folded and stacked on the basket (B)
  const GA = [
    ['towel', C.grey3, '#B4AC9F', 110, 22, false, 120, 70, null, { x: 862, y: 1120, r: 0.06, z: 1406, surface: 'chair' }],
    ['pants', '#7D756B', '#615A52', 112, 24, false, 124, 58, [-46, -14, 128, 0.36], { x: 758, y: 1238, z: 1405, surface: 'chair' }],
    ['hoodie', C.grey2, '#857D72', 124, 28, true, 196, 72, null, { x: 852, y: 1090, r: 0.02, z: 1417, surface: 'chair' }],
    ['sweater', C.ink, '#48454E', 116, 26, true, 156, 90, null, { x: 784, y: 1140, r: -0.05, z: 1407, surface: 'chair' }],
    ['tee', C.paper, '#DDD4C6', 108, 20, true, 128, 56, null, { x: 814, y: 1404, s: 1.05, r: 0.06, z: 1408, surface: 'floor' }],
    ['sock', C.grey, C.ink3, 0, 0, false, 64, 24, null, { x: 850, y: 1424, s: 1.1, r: 0.3, z: 1424, surface: 'floor' }],
    ['sock', C.ink2, C.ink3, 0, 0, false, 60, 22, null, { x: 918, y: 1418, s: 1.1, r: -0.4, z: 1418, surface: 'floor' }],
  ];
  let stackY = 1192;
  GA.forEach(([type, col, col2, fw, fh, collar, cw, ch, sleeve, A], i) => {
    let B;
    if (type === 'sock') B = { x: 606 + (i - 5) * 28, y: stackY, s: 1, r: 0, z: 1300 + i, surface: 'basket', shape: { fold: 1 } };
    else { B = { x: 622 + (i % 2 ? 3 : -3), y: stackY, s: 1, r: (i % 2 ? 0.015 : -0.012), z: 1293 + i, surface: 'basket', shape: { fold: 1 } }; stackY -= fh; }
    const pr = rand(300 + i), creases = [];
    for (let k = 0; k < 3; k++) {
      const x0 = (pr() - 0.5) * cw * 0.6, y0 = -ch * (0.25 + pr() * 0.5);
      creases.push([x0, y0, x0 + (pr() - 0.3) * cw * 0.3, y0 + (pr() - 0.5) * ch * 0.4, x0 + (pr() - 0.2) * cw * 0.35, y0 + (pr() - 0.5) * ch * 0.3]);
    }
    add('cloth' + i, 'garment', 'clothes', { ...A, shape: { fold: 0 } }, B, { type, col, col2, fw, fh, collar, cw, ch, sleeve, creases });
  });

  // bed — blanket kicked into a heap, pillow tossed to the foot (A) / made bed (B)
  add('blanket', 'blanket', 'bed', { z: 1315, shape: { crumple: 1 } }, { shape: { crumple: 0 } });
  add('pillow', 'pillow', 'bed', { x: 452, y: 1078, s: 0.95, r: 0.42, z: 1316, surface: 'bed' }, { x: -34, y: 1136, s: 1, r: 0, z: 1316, surface: 'bed' });

  // cups — five on the desk, one knocked over (A) / one, hot (B)
  const CU = [[C.ink, true], [C.paper, false], [C.sand, false], [C.grey2, false], [C.oat2, false]];
  const CA = [{ x: 718, y: 998, z: 1190, surface: 'desk' }, { x: 792, y: 996, z: 1191, surface: 'desk' }, { x: 952, y: 984, z: 1192, surface: 'desk' },
    { x: 846, y: 1000, z: 1189, surface: 'desk' }, { x: 1062, y: 978, r: -Math.PI / 2, z: 1193, surface: 'desk', shape: { spill: 1 } }];
  CU.forEach(([col, dark], i) => {
    const B = i === 1 ? { x: 800, y: 998, shape: { hot: 1 } } : { vis: false };
    add('cup' + i, 'cup', 'cups', { ...CA[i], shape: { spill: 0, hot: 0, ...(CA[i].shape || {}) } }, B, { col, dark });
  });

  // cables — tangled on the floor (A) / run to the outlet and coiled with mint ties (B)
  add('cableLamp', 'cable', 'cables', { z: 1240, surface: 'floor', shape: { tangle: 1 } }, { z: 1187, surface: 'desk', shape: { tangle: 0 } });
  add('cableCharger', 'cable', 'cables', { z: 1262, surface: 'floor', shape: { tangle: 1 } }, { z: 1193, surface: 'desk', shape: { tangle: 0 } });

  // boxes and rubbish — open boxes, a tipped bin, paper and a snack bag (A) / gone, bin upright and full (B)
  add('box', 'box', 'trash', { x: 108, y: 1606, z: 1606, surface: 'floor' }, { vis: false }, { w: 196, h: 128 });
  add('bin', 'bin', 'trash', { x: 222, y: 1614, r: Math.PI / 2, z: 1640, surface: 'floor', shape: { full: 0 } },
    { x: 1000, y: 1258, r: 0, z: 1258, shape: { full: 1 } });
  [[17, 342, 1636], [15, 380, 1604], [19, 362, 1672], [14, 262, 1688], [15, 30, 1662], [13, 300, 1556], [16, 250, 1530]].forEach(([pr, x, y], i) => {
    add('paper' + i, 'paper', 'trash', { x, y, z: y, surface: 'floor' }, { vis: false }, { r: pr });
  });
  add('snack', 'snack', 'trash', { x: 150, y: 1478, r: -0.32, z: 1607, surface: 'floor' }, { vis: false });

  // plant — wilted on the shelf (A) / upright on the sill in the sun (B)
  add('plant', 'plant', 'plant', { x: 792, y: 820, s: 0.74, z: 121, surface: 'shelf', shape: { droop: 1 } },
    { x: 360, y: 866, s: 0.8, z: 60, surface: 'sill', shape: { droop: 0 } });
}
const curtainOpen = (S) => ITEMS.find((it) => it.id === 'curtainL')[S].shape.open;

// ------------------------------------------------------------------ automatic difference detection
function changeOf(it) {
  const a = it.A, b = it.B;
  if (a.vis !== b.vis) return a.vis ? 'removed' : 'added';
  if (!a.vis) return null;
  if (Math.hypot(a.x - b.x, a.y - b.y) > 0.5 || Math.abs(a.r - b.r) > 0.01 || Math.abs(a.s - b.s) > 0.005) return 'moved';
  for (const k of new Set([...Object.keys(a.shape), ...Object.keys(b.shape)])) if (a.shape[k] !== b.shape[k]) return 'shape';
  return null;
}
/** an object's bounds in scene coordinates for one state: its kind's local box through (scale, rotation, translation) */
function sceneBox(it, S) {
  const st = it[S];
  if (!st.vis || !KINDS[it.kind].box) return null;
  const [x0, y0, x1, y1] = KINDS[it.kind].box(st, it);
  const c = Math.cos(st.r), s = Math.sin(st.r);
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  for (const [px, py] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) {
    const X = st.x + st.s * (px * c - py * s), Y = st.y + st.s * (px * s + py * c);
    bx0 = Math.min(bx0, X); by0 = Math.min(by0, Y); bx1 = Math.max(bx1, X); by1 = Math.max(by1, Y);
  }
  return [bx0, by0, bx1, by1];
}
const unite = (a, b) => (!a ? b : !b ? a : [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);
/** the object's real silhouette in one state: drawn alone into a small mask, kept as the left/right edge of every
 *  second row (scene px, alpha > 0.35, so soft shadows and spills do not count) */
function maskPts(it, S) {
  const b = sceneBox(it, S);
  if (!b) return [];
  const m = 24, x0 = Math.floor(b[0] - m), y0 = Math.floor(b[1] - m);
  const w = Math.ceil(b[2] - b[0] + 2 * m), h = Math.ceil(b[3] - b[1] + 2 * m);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  const st = it[S];
  g.translate(st.x - x0, st.y - y0); g.rotate(st.r); g.scale(st.s, st.s);
  VPL = [(VP[0] - st.x) / st.s, (VP[1] - st.y) / st.s];
  KINDS[it.kind].draw(g, st, 6, { S, L: 1 }, it);
  VPL = VP;
  const d = g.getImageData(0, 0, w, h).data, pts = [];
  for (let y = 0; y < h; y += 2) {
    let a = -1, z = -1;
    for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 90) { if (a < 0) a = x; z = x; }
    if (a >= 0) pts.push([x0 + a, y0 + y], [x0 + z + 1, y0 + y]);
  }
  return pts;
}
function ptsBox(p) {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const [x, y] of p) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
  return [a, b, c, d];
}
/** single-linkage clusters of objects whose silhouette boxes come within `gap` px; each cluster keeps all its points */
function clusters(objs, gap = 60) {
  const par = objs.map((_, i) => i), f = (i) => (par[i] === i ? i : (par[i] = f(par[i])));
  for (let i = 0; i < objs.length; i++) for (let j = i + 1; j < objs.length; j++) {
    const p = objs[i].box, q = objs[j].box;
    const dx = Math.max(0, p[0] - q[2], q[0] - p[2]), dy = Math.max(0, p[1] - q[3], q[1] - p[3]);
    if (Math.hypot(dx, dy) < gap) par[f(i)] = f(j);
  }
  const out = new Map();
  objs.forEach((o, i) => { const k = f(i); if (!out.has(k)) out.set(k, []); out.get(k).push(...o.pts); });
  return [...out.values()].map((pts) => ({ pts, box: ptsBox(pts) }));
}
const DIFF = { groups: [], counters: [], crop: null };
function detect() {
  const by = new Map();
  for (const it of ITEMS) {
    if (!changeOf(it)) continue;
    const key = it.group || it.id;
    if (!by.has(key)) by.set(key, { key, items: [] });
    by.get(key).items.push(it);
  }
  const groups = [...by.values()];
  for (const gr of groups) {
    for (const S of ['A', 'B']) {
      const objs = gr.items.filter((it) => it[S].vis).map((it) => ({ pts: maskPts(it, S) })).filter((o) => o.pts.length);
      objs.forEach((o) => { o.box = ptsBox(o.pts); });
      gr[S] = clusters(objs);
    }
    // a group that vanished entirely is marked where it was
    gr.ghost = !gr.B.length;
    if (gr.ghost) gr.B = gr.A;
    gr.boxA = gr.A.reduce((u, c) => unite(u, c.box), null);
  }
  // reading order: rows of 260 px, then left to right (by the A silhouettes)
  groups.sort((p, q) => {
    const py = Math.floor(((p.boxA[1] + p.boxA[3]) / 2) / 260), qy = Math.floor(((q.boxA[1] + q.boxA[3]) / 2) / 260);
    return py - qy || (p.boxA[0] + p.boxA[2]) - (q.boxA[0] + q.boxA[2]);
  });
  groups.forEach((gr, i) => { gr.n = i + 1; });
  DIFF.groups = groups;
  // counters from the states
  const count = (S, f) => ITEMS.filter((it) => it[S].vis && f(it, it[S])).length;
  DIFF.counters = [
    ['바닥의 물건', (it, st) => st.surface === 'floor'],
    ['흩어진 컵', (it) => it.kind === 'cup'],
    ['널린 옷', (it, st) => it.kind === 'garment' && !st.shape.fold],
  ].map(([label, f]) => ({ label, a: count('A', f), b: count('B', f) }));
  // the crop both windows share: every changed silhouette in either state, padded, fitted to the window's aspect
  let u = null;
  for (const gr of groups) for (const c of [...gr.A, ...gr.B]) u = unite(u, c.box);
  const pad = 40;
  let [x0, y0, x1, y1] = [u[0] - pad, u[1] - pad, u[2] + pad, u[3] + pad];
  const asp = WIN.w / WIN.h;
  if ((x1 - x0) / (y1 - y0) < asp) { const w = (y1 - y0) * asp, cx = (x0 + x1) / 2; x0 = cx - w / 2; x1 = cx + w / 2; }
  else { const h = (x1 - x0) / asp, cy = (y0 + y1) / 2; y0 = cy - h / 2; y1 = cy + h / 2; }
  DIFF.crop = { s: WIN.w / (x1 - x0), cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, box: [x0, y0, x1, y1] };
}

// =================================================================== the renderer: paintRoom(g, S, t, cam, E)
const ORDER = {};
const ENTER = new Map();
function setCam(g, c) { g.setTransform(c.s, 0, 0, c.s, c.wx - c.s * c.cx, c.wy - c.s * c.cy); }

// sunlight: the part of the window the curtains leave open, projected onto the floor (panes → quads)
function lightPanes(o) {
  const xl = lerp(346, 202, o) + 2, xr = 720 - xl, out = [];
  for (const [px0, px1] of [[170, 354], [366, 550]]) for (const [py0, py1] of [[500, 664], [674, 850]]) {
    const a = Math.max(px0, xl), b = Math.min(px1, xr);
    if (b - a > 1) out.push([a, py0, b, py1]);
  }
  return out;
}
function proj(wx, wy) {
  const fy = 1150 + (850 - wy) * 1.02;
  const fx = wx + 0.72 * (fy - 1120);
  return [540 + (fx - 540) * (1 + (fy - 1120) / 1500), fy];
}
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function paintPatch(g, o, L) {
  g.globalCompositeOperation = 'screen';
  for (const [x0, y0, x1, y1] of lightPanes(o)) {
    const q = [proj(x0, y0), proj(x1, y0), proj(x1, y1), proj(x0, y1)];
    poly(g, q.flat(), `rgba(${SUN},${(0.5 * L).toFixed(3)})`);
  }
  g.globalCompositeOperation = 'source-over';
}
function paintShaft(g, o, L) {
  const panes = lightPanes(o);
  if (!panes.length) return;
  const pts = [];
  for (const [x0, y0, x1, y1] of panes) pts.push([x0, y0], [x1, y0], [x1, y1], [x0, y1], proj(x0, y0), proj(x1, y0), proj(x1, y1), proj(x0, y1));
  const h = hull(pts);
  g.globalCompositeOperation = 'screen';
  g.fillStyle = lin(g, 330, 560, 700, 1420, [[0, `rgba(${SUN},${(0.26 * L).toFixed(3)})`], [0.55, `rgba(${SUN},${(0.1 * L).toFixed(3)})`], [1, `rgba(${SUN},${(0.02 * L).toFixed(3)})`]]);
  poly(g, h.flat()); g.fill();
  // god rays: bands along the shaft axis drifting slowly, brighter in the afterglow
  if (o > 0.5) {
    g.save(); poly(g, h.flat()); g.clip();
    const ax = 370, ay = 560, bx = 760, by = 1440, len = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / len, uy = (by - ay) / len;
    for (let i = 0; i < 5; i++) {
      const d = -170 + i * 82 + 14 * Math.sin(0.55 * T_NOW + i * 1.9), w = 18 + 14 * ((i * 7) % 3);
      const a = (0.05 + 0.09 * Math.max(0, L - 1)) * (0.6 + 0.4 * Math.sin(0.8 * T_NOW + i * 2.3));
      const px = -uy * d, py = ux * d;
      g.fillStyle = `rgba(${SUN},${a.toFixed(3)})`;
      poly(g, [ax + px - ux * 200, ay + py - uy * 200, ax + px - uy * w - ux * 200, ay + py + ux * w - uy * 200, bx + px - uy * w * 2, by + py + ux * w * 2, bx + px, by + py]); g.fill();
    }
    g.restore();
  }
  g.globalCompositeOperation = 'source-over';
}
let T_NOW = 0;
// dust: the same motes at the same t in both states; only the light they catch differs
const DUST = [];
function bakeDust() {
  const r = rand(1277);
  for (let i = 0; i < 64; i++) DUST.push({ x: 140 + r() * 860, y: 520 + r() * 900, a1: r() * TAU, a2: r() * TAU, a3: r() * TAU, f: 0.3 + r() * 0.5, sz: 1.6 + r() * 2.8 });
}
function beamAt(o, x, y) {
  const xl = lerp(346, 202, o) + 2, xr = 720 - xl;
  const [ax] = proj((xl + xr) / 2, 675), aw = (proj(xr, 675)[0] - proj(xl, 675)[0]) / 2;
  const k = clamp((y - 675) / (1330 - 675), -0.3, 1.2);
  const xc = lerp((xl + xr) / 2, ax, k), hw = Math.max(4, lerp((xr - xl) / 2, aw, k));
  return sm(1 - Math.abs(x - xc) / hw) * (y > 480 && y < 1520 ? 1 : 0);
}
function paintDust(g, t, o, L, S) {
  for (const d of DUST) {
    const x = d.x + 26 * Math.sin(d.f * t + d.a1) + 9 * Math.sin(2.3 * d.f * t + d.a2);
    const y = d.y + 20 * Math.sin(0.7 * d.f * t + d.a3) - 6 * t;
    const b = beamAt(o, x, y) * L;
    const a = S === 'A' ? 0.2 + 0.6 * b : 0.06 + 0.85 * b;
    if (a < 0.04) continue;
    g.fillStyle = b > 0.15 ? `rgba(255,248,228,${a.toFixed(3)})` : `rgba(150,140,128,${a.toFixed(3)})`;
    g.beginPath(); g.arc(x, y, d.sz * (0.8 + 0.5 * b), 0, TAU); g.fill();
  }
}

function paintRoom(g, S, t, cam, E = {}) {
  T_NOW = t;
  const L = E.L ?? 1;
  // an opaque base first: the seams between abutting shapes at fractional pixels blend with what lies beneath, and
  // that must never be the previous frame
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = C.wall2; g.fillRect(0, 0, W, H);
  setCam(g, cam);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  paintShell(g, t);
  const o = curtainOpen(S);
  paintPatch(g, o, S === 'A' ? 0.9 : L);
  paintPendant(g, t);
  for (const it of ORDER[S]) {
    const st = it[S];
    let k = 1, dy = 0, a = 1;
    if (S === 'A' && E.enter && ENTER.has(it.id)) {
      const t0 = ENTER.get(it.id), p = seg(t, t0, t0 + 0.42);
      if (p <= 0) continue;
      k = 0.55 + 0.45 * ob(p, 2.2); dy = -70 * (1 - oc(p)); a = clamp(p * 3);
    }
    g.save();
    g.translate(st.x, st.y + dy);
    if (k !== 1) g.scale(k, k);
    g.rotate(st.r);
    if (st.s !== 1) g.scale(st.s, st.s);
    VPL = [(VP[0] - st.x) / st.s, (VP[1] - st.y) / st.s];
    if (a < 1) g.globalAlpha = a;
    KINDS[it.kind].draw(g, st, t, { S, L }, it);
    g.restore();
  }
  VPL = VP;
  paintShaft(g, o, S === 'A' ? 0.9 : L);
  paintDust(g, t, o, L, S);
  // the room's light: drawn curtains leave it cool and dim; open, it is warm
  setCam(g, cam);
  if (S === 'A') {
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = '#D9D6DB'; g.fillRect(-700, -500, 2500, 2600);
    g.fillStyle = rad(g, 420, 900, 300, 1300, [[0, 'rgba(255,255,255,0)'], [1, 'rgba(170,165,172,0.55)']]);
    g.fillRect(-700, -500, 2500, 2600);
  } else {
    g.globalCompositeOperation = 'screen';
    g.fillStyle = rad(g, 330, 650, 40, 900, [[0, `rgba(${SUN},${(0.22 * L).toFixed(3)})`], [1, `rgba(${SUN},0)`]]);
    g.fillRect(-700, -500, 2500, 2600);
    if (L > 1) {
      g.fillStyle = rad(g, 300, 640, 0, 620, [[0, `rgba(${SUN},${(0.6 * (L - 1)).toFixed(3)})`], [0.5, `rgba(${SUN},${(0.18 * (L - 1)).toFixed(3)})`], [1, `rgba(${SUN},0)`]]);
      g.fillRect(-700, -500, 2500, 2600);
    }
  }
  g.globalCompositeOperation = 'source-over';
  g.setTransform(1, 0, 0, 1, 0, 0);
}

// =================================================================== the slider: a hand drags, the handle follows
// The hand moves in minimum-jerk strokes between rest points (x = xa + (xb − xa)(10p³ − 15p⁴ + 6p⁵), the smooth
// profile of human reaching), slightly arced vertically. The handle is tied to the hand by a damped spring
// (ω = 19 rad/s, ζ = 0.52), integrated at a fixed 1/600 s step in setup, so it lags, overshoots each reversal
// and settles — then frame(t) only interpolates the baked table.
const HAND = { t0: T.grab, dt: 1 / 600, x: [], y: [], v: [] };
const STROKES = [[T.grab, 1012], [2.4, 166], [3.06, 780], [3.6, 380], [T.release, 540]];
function bakeHand() {
  const mj = (p) => p * p * p * (10 - 15 * p + 6 * p * p);
  const target = (t) => {
    for (let i = 1; i < STROKES.length; i++) {
      const [ta, xa] = STROKES[i - 1], [tb, xb] = STROKES[i];
      if (t <= tb) { const p = clamp((t - ta) / (tb - ta)); return [xa + (xb - xa) * mj(p), HANDLE_Y - (i % 2 ? 16 : -12) * Math.sin(Math.PI * p)]; }
    }
    return [STROKES[STROKES.length - 1][1], HANDLE_Y];
  };
  const w = 19, z = 0.52, dt = HAND.dt;
  let x = 1012, v = 0, y = HANDLE_Y, vy = 0;
  const n = Math.ceil((4.9 - HAND.t0) / dt);
  for (let i = 0; i <= n; i++) {
    HAND.x.push(x); HAND.y.push(y); HAND.v.push(v);
    const [tx, ty] = target(HAND.t0 + i * dt);
    v += (w * w * (tx - x) - 2 * z * w * v) * dt; x += v * dt;
    vy += (w * w * (ty - y) - 2 * z * w * vy) * dt; y += vy * dt;
  }
}
function handleAt(t) {
  if (t <= HAND.t0) {
    const p = seg(t, T.hAppear, T.grab);
    return { x: lerp(1130, 1012, ob(p, 1.4)), y: HANDLE_Y, v: 0 };
  }
  const f = (t - HAND.t0) / HAND.dt, i = Math.min(HAND.x.length - 2, Math.floor(f)), k = Math.min(1, f - i);
  let x = lerp(HAND.x[i], HAND.x[i + 1], k), y = lerp(HAND.y[i], HAND.y[i + 1], k);
  const v = lerp(HAND.v[i], HAND.v[i + 1], k);
  const q = sm(seg(t, T.release, T.turnA + 0.02));
  x = lerp(x, 540, q); y = lerp(y, HANDLE_Y, q);
  return { x, y, v: v * (1 - q) };
}
/** the wipe line at t: point P on it, unit normal n pointing into state B, feather half-width f */
function wipeLine(t) {
  const h = handleAt(t), p = io(seg(t, T.turnA, T.turnB)), phi = (Math.PI / 2) * p;
  return { px: p > 0 ? 540 : h.x, py: HANDLE_Y, nx: Math.cos(phi), ny: Math.sin(phi), f: lerp(20, 0.6, p), phi, h };
}

// two pre-rendered full states → one frame through a feathered clip, with an edge shadow on the A side
let OFF_A, OFF_B;
function composite(g, t, Ln) {
  paintRoom(OFF_A.g, 'A', t, CAM_FULL);
  paintRoom(OFF_B.g, 'B', t, CAM_FULL);
  const { px, py, nx, ny, f } = Ln, b = OFF_B.g;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.globalCompositeOperation = 'destination-in';
  b.fillStyle = lin(b, px - nx * f, py - ny * f, px + nx * f, py + ny * f, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]);
  b.fillRect(0, 0, W, H);
  b.globalCompositeOperation = 'source-over';
  g.drawImage(OFF_A.c, 0, 0);
  g.fillStyle = lin(g, px, py, px - nx * 90, py - ny * 90, [[0, 'rgba(36,30,26,0.30)'], [0.35, 'rgba(36,30,26,0.10)'], [1, 'rgba(36,30,26,0)']]);
  g.fillRect(0, 0, W, H);
  g.drawImage(OFF_B.c, 0, 0);
}
function paintWipeEdge(g, t, Ln) {
  const grow = oc(seg(t, T.hAppear + 0.04, T.hAppear + 0.42)) * (1 - seg(t, T.turnB - 0.12, T.turnB + 0.04));
  if (grow <= 0) return;
  const dx = -Ln.ny, dy = Ln.nx, L = 2300 * grow, x = Ln.px, y = HANDLE_Y;
  const line = (w, c) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(x - dx * L, y - dy * L); g.lineTo(x + dx * L, y + dy * L); g.stroke(); };
  line(26, 'rgba(52,196,156,0.10)'); line(12, 'rgba(52,196,156,0.22)'); line(5, 'rgba(255,255,255,0.75)'); line(2.5, '#FFFFFF');
}
function paintKnob(g, x, y, R, phi, sq, sqAng, alpha = 1) {
  g.save(); g.globalAlpha = alpha;
  g.fillStyle = rad(g, x, y + 16, R * 0.4, R * 1.5, [[0, 'rgba(30,24,20,0.30)'], [1, 'rgba(30,24,20,0)']]);
  g.beginPath(); g.ellipse(x, y + 16, R * 1.5, R * 1.25, 0, 0, TAU); g.fill();
  g.translate(x, y); g.rotate(sqAng); g.scale(sq, 1 / sq); g.rotate(-sqAng);
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
  g.strokeStyle = C.mint; g.lineWidth = Math.max(2, R * 0.13); g.beginPath(); g.arc(0, 0, R - R * 0.065, 0, TAU); g.stroke();
  g.rotate(phi);
  g.fillStyle = C.ink;
  const a = R * 0.2, o = R * 0.22;
  poly(g, [-o, -a, -o - a * 1.15, 0, -o, a]); g.fill();
  poly(g, [o, -a, o + a * 1.15, 0, o, a]); g.fill();
  g.restore();
}
function paintSliderHandle(g, t, Ln) {
  const pop = ob(seg(t, T.hAppear, T.hAppear + 0.32), 2.0);
  if (pop <= 0) return;
  const press = 1 - 0.08 * sm(seg(t, T.grab - 0.06, T.grab + 0.06)) + 0.08 * ob(seg(t, T.release, T.release + 0.3), 3) * (t > T.release ? 1 : 0);
  const { x, y, v } = Ln.h;
  const sq = 1 + Math.min(0.2, Math.abs(v) / 9000);
  const cx = Ln.phi > 0 ? 540 : x, cy = Ln.phi > 0 ? HANDLE_Y : y;
  paintKnob(g, cx, cy, 46 * pop * press, Ln.phi, sq, 0);
}

// ------------------------------------------------------------------ type: chips and titles
const CHIP = { h: 70, padX: 30, font: `800 36px ${KR}`, wA: 0, wB: 0 };
function measure() {
  const c = mk(8, 8).g; c.font = CHIP.font;
  CHIP.wA = Math.ceil(c.measureText('정리 전').width) + CHIP.padX * 2;
  CHIP.wB = Math.ceil(c.measureText('정리 후').width) + CHIP.padX * 2;
}
function paintChip(g, x, y, which, k = 1, alpha = 1) {
  if (alpha <= 0.01 || k <= 0.01) return;
  const w = which === 'A' ? CHIP.wA : CHIP.wB, h = CHIP.h;
  g.save(); g.globalAlpha = alpha;
  g.translate(x + w / 2, y + h / 2); g.scale(k, k);
  g.fillStyle = 'rgba(30,24,20,0.16)'; rr(g, -w / 2, -h / 2 + 6, w, h, h / 2); g.fill();
  g.fillStyle = which === 'A' ? C.ink : C.mint; rr(g, -w / 2, -h / 2, w, h, h / 2); g.fill();
  g.fillStyle = which === 'A' ? C.paper : C.inkBg;
  g.font = CHIP.font; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(which === 'A' ? '정리 전' : '정리 후', 0, 2);
  g.restore();
}
function paintTitle(g, t, kick, word, tIn, tOut, accent) {
  const pIn = ox(seg(t, tIn, tIn + 0.62)), pK = ox(seg(t, tIn - 0.08, tIn + 0.5));
  const pOut = tOut ? i2(seg(t, tOut, tOut + 0.24)) : 0;
  if (pK <= 0 || pOut >= 1) return;
  g.save();
  g.globalAlpha = 1 - pOut;
  g.beginPath(); g.rect(40, 128, 760, 56); g.clip();
  g.fillStyle = C.ink2; g.font = `700 32px ${KR}`; g.textBaseline = 'alphabetic';
  g.fillText(kick, 66, 170 + (1 - pK) * 52 - pOut * 56);
  g.restore();
  g.save();
  g.globalAlpha = 1 - pOut;
  g.beginPath(); g.rect(40, 186, 760, 158); g.clip();
  g.fillStyle = C.ink; g.font = `900 132px ${KR}`; g.letterSpacing = '-4px'; g.textBaseline = 'alphabetic';
  g.fillText(word, 58, 322 + (1 - pIn) * 150 - pOut * 160);
  g.letterSpacing = '0px';
  g.restore();
  if (accent) {
    const u = oc(seg(t, tIn + 0.4, tIn + 0.85));
    g.fillStyle = C.mint; rr(g, 64, 340, 300 * u, 12, 6); g.fill();
  }
}

// =================================================================== split screen: two crop windows of one scene
const lerpRect = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const camFor = (rect, c0, c1, s0, s1, k) => ({
  s: s0 * Math.pow(s1 / s0, k), cx: lerp(c0[0], c1[0], k), cy: lerp(c0[1], c1[1], k), wx: rect[0] + rect[2] / 2, wy: rect[1] + rect[3] / 2,
});
const RA0 = [0, 0, W, HANDLE_Y], RB0 = [0, HANDLE_Y, W, H - HANDLE_Y];
const RA1 = [WIN.x, WIN.top, WIN.w, WIN.h], RB1 = [WIN.x, WIN.bot, WIN.w, WIN.h];
/** both windows at t: rect [x, y, w, h], corner radius, camera */
function windowsAt(t) {
  const cr = DIFF.crop, k = io(seg(t, T.cropA, T.cropB)), m = io(seg(t, T.mergeA, T.mergeB));
  const ra = lerpRect(RA0, RA1, k), rb = lerpRect(RB0, RB1, k);
  const ca = (r0) => [r0[0] + r0[2] / 2, r0[1] + r0[3] / 2];
  const A = { rect: ra, r: WIN.r * k, cam: camFor(ra, ca(RA0), [cr.cx, cr.cy], 1, cr.s, k) };
  const B = { rect: rb, r: WIN.r * k, cam: camFor(rb, ca(RB0), [cr.cx, cr.cy], 1, cr.s, k) };
  if (m > 0) {
    // B opens to the full frame and pushes A out over the top: A's bottom edge rides B's top edge
    B.rect = lerpRect(rb, [0, 0, W, H], m); B.r = WIN.r * (1 - m);
    B.cam = camFor(B.rect, [cr.cx, cr.cy], [540, 960], cr.s, 1, m);
    const up = (rb[1] - B.rect[1]) + 260 * i2(seg(t, T.mergeA, T.mergeB));
    A.rect = [ra[0], ra[1] - up, ra[2], ra[3]];
    A.cam = { ...A.cam, wy: A.cam.wy - up };
  }
  return { A, B, k, m };
}
function paintBackdrop(g) {
  g.fillStyle = rad(g, 540, 900, 100, 1300, [[0, '#353238'], [1, '#232126']]);
  g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,0.035)';
  for (let y = 24; y < H; y += 36) for (let x = 24; x < W; x += 36) g.fillRect(x, y, 2, 2);
}
function paintPane(g, S, t, w, L) {
  const [x, y, ww, hh] = w.rect;
  if (y + hh < -10) return;
  if (w.r > 0.5) {
    g.fillStyle = 'rgba(0,0,0,0.28)'; rr(g, x, y + 12, ww, hh, w.r); g.fill();
  }
  g.save(); rr(g, x, y, ww, hh, w.r); g.clip();
  paintRoom(g, S, t, w.cam, { L });
  g.restore();
}

// ------------------------------------------------------------------ callouts (laid out once in setup)
const RB = 21;                                     // badge radius
const LAYOUT = { A: [], B: [] };
function toScreen(cam, x, y) { return [cam.wx + cam.s * (x - cam.cx), cam.wy + cam.s * (y - cam.cy)]; }
const centroid = (P) => { let x = 0, y = 0; for (const p of P) { x += p[0]; y += p[1]; } return [x / P.length, y / P.length]; };
/** the gap between two convex polygons along their best separating edge normal (≤ the true distance; < 0 = overlap) */
function hullGap(P, Q) {
  let best = -Infinity;
  for (const [A, B] of [[P, Q], [Q, P]]) {
    const c = centroid(A);
    for (let i = 0; i < A.length; i++) {
      const a = A[i], b = A[(i + 1) % A.length];
      let nx = b[1] - a[1], ny = a[0] - b[0];
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      if (nx * (a[0] - c[0]) + ny * (a[1] - c[1]) < 0) { nx = -nx; ny = -ny; }
      const e = nx * a[0] + ny * a[1];
      let m = Infinity;
      for (const q of B) m = Math.min(m, nx * q[0] + ny * q[1] - e);
      best = Math.max(best, m);
    }
  }
  return best;
}
/** signed distance from a point to a convex polygon (negative inside) */
function hullDist(H, x, y) {
  const c = centroid(H);
  let out = -Infinity;
  for (let i = 0; i < H.length; i++) {
    const a = H[i], b = H[(i + 1) % H.length];
    let nx = b[1] - a[1], ny = a[0] - b[0];
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    if (nx * (a[0] - c[0]) + ny * (a[1] - c[1]) < 0) { nx = -nx; ny = -ny; }
    out = Math.max(out, nx * (x - a[0]) + ny * (y - a[1]));
  }
  return out;
}
const hullArea = (H) => { let s = 0; for (let i = 0; i < H.length; i++) { const a = H[i], b = H[(i + 1) % H.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s / 2); };
/** the offset curve of a convex hull: every vertex rounded by an arc of radius r, then resampled every 5 px */
function roundLoop(H, r) {
  const n = H.length, c = centroid(H), raw = [];
  const nrm = (a, b) => {
    let nx = b[1] - a[1], ny = a[0] - b[0];
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    if (nx * ((a[0] + b[0]) / 2 - c[0]) + ny * ((a[1] + b[1]) / 2 - c[1]) < 0) { nx = -nx; ny = -ny; }
    return Math.atan2(ny, nx);
  };
  for (let i = 0; i < n; i++) {
    const p = H[(i - 1 + n) % n], v = H[i], q = H[(i + 1) % n];
    const a0 = nrm(p, v);
    let da = nrm(v, q) - a0;
    while (da <= -Math.PI) da += TAU;
    while (da > Math.PI) da -= TAU;
    const k = Math.max(1, Math.ceil(Math.abs(da) / 0.18));
    for (let j = 0; j <= k; j++) { const a = a0 + (da * j) / k; raw.push([v[0] + r * Math.cos(a), v[1] + r * Math.sin(a)]); }
  }
  const cum = [0];
  for (let i = 1; i <= raw.length; i++) { const a = raw[i - 1], b = raw[i % raw.length]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const L = cum[cum.length - 1], N = Math.max(24, Math.round(L / 5)), pts = [];
  for (let k = 0, i = 0; k < N; k++) {
    const s = (k / N) * L;
    while (cum[i + 1] < s) i++;
    const a = raw[i], b = raw[(i + 1) % raw.length], u = (s - cum[i]) / Math.max(1e-6, cum[i + 1] - cum[i]);
    pts.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]);
  }
  const nor = pts.map((p, k) => {
    const a = pts[(k - 1 + N) % N], b = pts[(k + 1) % N];
    let nx = b[1] - a[1], ny = a[0] - b[0];
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    if (nx * (p[0] - c[0]) + ny * (p[1] - c[1]) < 0) { nx = -nx; ny = -ny; }
    return [nx, ny];
  });
  return { pts, nor, L, c };
}
/** a hand-drawn pass around a loop: low-frequency wobble along the normal, starting at the upper left and running
 *  10 % past the start on a slightly wider radius, like a marker that does not close exactly */
function handPath(loop, seed) {
  const r = rand(seed), f1 = r() * TAU, f2 = r() * TAU, N = loop.pts.length;
  let k0 = 0;
  loop.pts.forEach((p, k) => { if (p[0] + p[1] < loop.pts[k0][0] + loop.pts[k0][1]) k0 = k; });
  const out = [];
  const M = Math.round(N * 1.1);
  for (let j = 0; j <= M; j++) {
    const k = (k0 + j) % N, u = j / N;
    const w = 2.0 * Math.sin(TAU * 2 * u + f1) + 1.2 * Math.sin(TAU * 5 * u + f2) + 6 * sm((u - 0.92) / 0.18) - 1.5;
    out.push([loop.pts[k][0] + loop.nor[k][0] * w, loop.pts[k][1] + loop.nor[k][1] * w]);
  }
  return out;
}

/** Callout layout, once in setup, per half:
 *  1. each changed group's silhouette clusters → convex hull in window pixels → a loop at offset r = 12;
 *  2. any two loops closer than r₁ + r₂ + 6 shrink to r = 6; if they still touch, the smaller one becomes a pin
 *     (a dot on the object + a short leader), so no two marks ever cross;
 *  3. badges: candidates around each mark (on the stroke, or out on a leader), cost = collisions with badges, other
 *     marks, window edge, labels and the gutter pill, + a pull toward the upper left and toward the same side as
 *     the same number in the other half. Greedy in number order. */
function layoutCallouts() {
  const cr = DIFF.crop;
  const pill = [540 - 180, HANDLE_Y - 44, 540 + 180, HANDLE_Y + 44];
  const angA = new Map();
  for (const [S, rect] of [['A', RA1], ['B', RB1]]) {
    const cam = { s: cr.s, cx: cr.cx, cy: cr.cy, wx: rect[0] + rect[2] / 2, wy: rect[1] + rect[3] / 2 };
    const marks = [];
    DIFF.groups.forEach((gr) => {
      for (const cl of gr[S]) {
        const H = hull(cl.pts.map(([x, y]) => toScreen(cam, x, y)));
        marks.push({ n: gr.n, key: gr.key, H, r: 12, mode: 'loop', ghost: S === 'B' && gr.ghost, area: hullArea(H) });
      }
    });
    const touch = (a, b) => hullGap(a.H, b.H) < (a.mode === 'loop' ? a.r : 0) + (b.mode === 'loop' ? b.r : 0) + 6;
    for (let i = 0; i < marks.length; i++) for (let j = i + 1; j < marks.length; j++) if (touch(marks[i], marks[j])) { marks[i].r = 6; marks[j].r = 6; }
    for (let guard = 0; guard < 20; guard++) {
      let hit = null;
      for (let i = 0; i < marks.length && !hit; i++) for (let j = i + 1; j < marks.length && !hit; j++) {
        if ((marks[i].mode === 'loop' || marks[j].mode === 'loop') && touch(marks[i], marks[j]) && !(marks[i].mode === 'pin' && marks[j].mode === 'pin')) hit = [marks[i], marks[j]];
      }
      if (!hit) break;
      const loops = hit.filter((m) => m.mode === 'loop');
      loops.sort((a, b) => a.area - b.area)[0].mode = 'pin';
    }
    // badges
    const placed = [];
    const chip = [rect[0] + 10, rect[1] + 10, rect[0] + 34 + (S === 'A' ? CHIP.wA : CHIP.wB), rect[1] + 24 + CHIP.h];
    marks.sort((a, b) => a.n - b.n || b.area - a.area);
    marks.forEach((m, mi) => {
      m.loop = roundLoop(m.H, m.mode === 'loop' ? m.r : 4);
      const c = m.loop.c, N = m.loop.pts.length, cand = [];
      for (let k = 0; k < 32; k++) {
        const i = Math.floor((k / 32) * N), [px, py] = m.loop.pts[i], [nx, ny] = m.loop.nor[i];
        const ang = Math.atan2(py - c[1], px - c[0]);
        if (m.mode === 'loop') cand.push({ x: px + nx * (RB - 4), y: py + ny * (RB - 4), ang, from: null, extra: 0 });
        for (const dd of [30, 52]) cand.push({ x: px + nx * (RB + dd), y: py + ny * (RB + dd), ang, from: [px, py], extra: m.mode === 'loop' ? 14 + dd * 0.2 : dd * 0.2 });
      }
      let best = null, bestCost = Infinity;
      for (const q of cand) {
        let cost = q.extra + 3 * (1 - Math.cos(q.ang + 2.2));
        if (S === 'B' && angA.has(m.key)) cost += 5 * (1 - Math.cos(q.ang - angA.get(m.key)));
        for (const p of placed) { const d = Math.hypot(q.x - p[0], q.y - p[1]); if (d < 2 * RB + 8) cost += 1000 + (2 * RB + 8 - d) * 10; }
        marks.forEach((o, oi) => {
          if (oi === mi) { if (q.from && hullDist(o.H, q.x, q.y) < RB + 2) cost += 200; return; }
          const rr2 = o.mode === 'loop' ? o.r : 0;
          if (hullDist(o.H, q.x, q.y) - rr2 < RB + 4) cost += 500;
          if (q.from) for (const u of [0.35, 0.7]) if (hullDist(o.H, lerp(q.from[0], q.x, u), lerp(q.from[1], q.y, u)) - rr2 < 3) cost += 300;
        });
        if (q.x < rect[0] + RB + 8 || q.x > rect[0] + rect[2] - RB - 8 || q.y < rect[1] + RB + 8 || q.y > rect[1] + rect[3] - RB - 8) cost += 600;
        if (q.x > chip[0] - RB && q.x < chip[2] + RB && q.y > chip[1] - RB && q.y < chip[3] + RB) cost += 600;
        if (q.x > pill[0] - RB && q.x < pill[2] + RB && q.y > pill[1] - RB && q.y < pill[3] + RB) cost += 600;
        if (cost < bestCost) { bestCost = cost; best = q; }
      }
      placed.push([best.x, best.y]);
      if (S === 'A' && !angA.has(m.key)) angA.set(m.key, best.ang);
      m.badge = [best.x, best.y];
      if (best.from) { const dx = best.x - best.from[0], dy = best.y - best.from[1], l = Math.hypot(dx, dy); m.leader = [best.from[0], best.from[1], best.x - (dx / l) * RB, best.y - (dy / l) * RB]; }
      m.path = m.mode === 'loop' ? handPath(m.loop, 1300 + m.n * 7 + (S === 'B' ? 3 : 0)) : null;
      m.dot = m.mode === 'pin' ? (m.leader ? [m.leader[0], m.leader[1]] : c) : null;
      if (m.mode === 'pin' && m.leader) {
        // the pin's dot sits a little inside the object, on the line toward its centre
        const [x, y] = m.dot, dx = c[0] - x, dy = c[1] - y, l = Math.hypot(dx, dy) || 1, k = Math.min(10, l * 0.5);
        m.dot = [x + (dx / l) * k, y + (dy / l) * k]; m.leader[0] = m.dot[0]; m.leader[1] = m.dot[1];
      }
    });
    LAYOUT[S] = marks;
  }
}
function polyPart(g, P, p) {
  const n = Math.max(2, Math.ceil(P.length * p));
  g.beginPath(); g.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < n && i < P.length; i++) g.lineTo(P[i][0], P[i][1]);
  g.stroke();
}
function paintCallouts(g, t) {
  const out = seg(t, T.calloutOut, T.calloutOut + 0.2);
  if (out >= 1) return;
  for (const S of ['A', 'B']) {
    for (const m of LAYOUT[S]) {
      const t0 = T.calloutA + (m.n - 1) * T.calloutStep;
      const pr = io(seg(t, t0, t0 + 0.3)), pb = ob(seg(t, t0 + 0.08, t0 + 0.32), 2.4);
      if (pr <= 0) continue;
      const a = 1 - out;
      g.save(); g.globalAlpha = a;
      g.lineJoin = 'round'; g.lineCap = 'round';
      if (m.mode === 'loop') {
        g.fillStyle = `rgba(52,196,156,${(0.1 * pr).toFixed(3)})`;
        poly(g, m.loop.pts.flat()); g.fill();
        g.strokeStyle = 'rgba(20,16,14,0.16)'; g.lineWidth = 7.5; polyPart(g, m.path, pr);
        g.strokeStyle = C.mint; g.lineWidth = 4.2; polyPart(g, m.path, pr);
      } else {
        const k = ob(seg(t, t0, t0 + 0.24), 2.4);
        g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(m.dot[0], m.dot[1], 9 * k, 0, TAU); g.fill();
        g.fillStyle = C.mint; g.beginPath(); g.arc(m.dot[0], m.dot[1], 5.5 * k, 0, TAU); g.fill();
      }
      if (m.leader) {
        const [x0, y0, x1, y1] = m.leader, q = oc(seg(t, t0 + 0.04, t0 + 0.24));
        g.strokeStyle = 'rgba(20,16,14,0.16)'; g.lineWidth = 6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, q), lerp(y0, y1, q)); g.stroke();
        g.strokeStyle = C.mint; g.lineWidth = 3.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, q), lerp(y0, y1, q)); g.stroke();
      }
      g.lineJoin = 'miter'; g.lineCap = 'butt';
      if (pb > 0) {
        const [bx, by] = m.badge, r = RB * pb * (1 - 0.3 * out);
        g.fillStyle = 'rgba(20,16,14,0.28)'; g.beginPath(); g.arc(bx, by + 3, r + 2, 0, TAU); g.fill();
        g.fillStyle = C.mint; g.beginPath(); g.arc(bx, by, r, 0, TAU); g.fill();
        g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.stroke();
        g.fillStyle = C.inkBg; g.font = `900 ${Math.max(1, Math.round(25 * pb))}px ${KR}`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(String(m.n), bx, by + 1.5);
      }
      g.restore();
    }
  }
}
function paintCounters(g, t) {
  const out = i2(seg(t, T.calloutOut, T.calloutOut + 0.22));
  const n = DIFF.counters.length, gap = 12, w = (WIN.w - gap * (n - 1)) / n;
  DIFF.counters.forEach((c, i) => {
    const p = ox(seg(t, T.countA + i * 0.07, T.countA + i * 0.07 + 0.5));
    if (p <= 0 || out >= 1) return;
    const x = WIN.x + i * (w + gap), y = 22 - (1 - p) * 40 - out * 60;
    g.save(); g.globalAlpha = p * (1 - out);
    g.fillStyle = 'rgba(255,255,255,0.07)'; rr(g, x, y, w, 112, 22); g.fill();
    g.fillStyle = 'rgba(251,248,242,0.66)'; g.font = `700 26px ${KR}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillText(c.label, x + 24, y + 40);
    const roll = seg(t, T.roll[0] + i * 0.08, T.roll[1] + i * 0.08);
    const v = Math.round(lerp(c.a, c.b, oc(roll)));
    g.font = `800 50px ${KR}`;
    g.fillStyle = 'rgba(251,248,242,0.5)'; g.fillText(String(c.a), x + 24, y + 96);
    const wa = g.measureText(String(c.a)).width;
    g.fillStyle = C.mint; g.font = `800 40px ${KR}`; g.fillText('→', x + 36 + wa, y + 93);
    g.font = `900 50px ${KR}`; g.fillStyle = roll > 0 ? C.mint : 'rgba(251,248,242,0.5)';
    g.fillText(String(v), x + 92 + wa, y + 96);
    g.restore();
  });
}
// the device that returns: slider knob → gutter pill "달라진 곳 N" → the 정리 끝 stamp
const STAMP = { x: 690, y: 258, r: 118, rot: -0.16 };
function paintPill(g, t) {
  const open = io(seg(t, T.cropA + 0.25, T.cropB + 0.05)) * (1 - io(seg(t, T.calloutOut, T.calloutOut + 0.24)));
  const fly = io(seg(t, T.mergeA + 0.1, T.stamp));
  if (t >= T.stamp) return;
  let x = 540, y = HANDLE_Y;
  if (fly > 0) {
    const u = fly, cx = 980, cy = 560;
    x = (1 - u) * (1 - u) * 540 + 2 * u * (1 - u) * cx + u * u * STAMP.x;
    y = (1 - u) * (1 - u) * HANDLE_Y + 2 * u * (1 - u) * cy + u * u * STAMP.y;
  }
  const R = lerp(46, 40, sm(seg(t, T.turnB, T.cropB))) * (1 - 0.35 * Math.sin(Math.PI * fly));
  if (open < 0.02) { paintKnob(g, x, y, R, Math.PI / 2, 1, 0); return; }
  const w = lerp(2 * R, 330, open), h = lerp(2 * R, 72, open);
  g.fillStyle = 'rgba(20,16,14,0.35)'; rr(g, x - w / 2, y - h / 2 + 6, w, h, h / 2); g.fill();
  g.fillStyle = '#FFFFFF'; rr(g, x - w / 2, y - h / 2, w, h, h / 2); g.fill();
  g.strokeStyle = C.mint; g.lineWidth = 5; rr(g, x - w / 2 + 2.5, y - h / 2 + 2.5, w - 5, h - 5, h / 2 - 2.5); g.stroke();
  const ta = clamp((open - 0.55) / 0.45);
  if (ta > 0) {
    g.save(); g.globalAlpha = ta; rr(g, x - w / 2, y - h / 2, w, h, h / 2); g.clip();
    g.fillStyle = C.ink; g.font = `800 32px ${KR}`; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText('달라진 곳', x - 132, y + 2);
    g.fillStyle = C.mint; g.beginPath(); g.arc(x + 108, y, 24, 0, TAU); g.fill();
    g.fillStyle = C.inkBg; g.font = `900 30px ${KR}`; g.textAlign = 'center';
    g.fillText(String(DIFF.groups.length), x + 108, y + 2);
    g.restore();
  }
}
function paintStamp(g, t) {
  const p = seg(t, T.stamp, T.stamp + 0.34);
  if (p <= 0) return;
  const k = p < 1 ? lerp(1.45, 1, ob(p, 2.6)) : 1;
  const R = STAMP.r * lerp(0.36, 1, oc(seg(t, T.stamp, T.stamp + 0.12))) * k;
  // shock ring + ticks: once, on the press
  const q = seg(t, T.stamp + 0.06, T.stamp + 0.66);
  if (q > 0 && q < 1) {
    g.strokeStyle = `rgba(52,196,156,${(0.7 * (1 - q)).toFixed(3)})`; g.lineWidth = 8 * (1 - q) + 1;
    g.beginPath(); g.arc(STAMP.x, STAMP.y, STAMP.r * (1.05 + 0.75 * oc(q)), 0, TAU); g.stroke();
    g.lineCap = 'round'; g.lineWidth = 6 * (1 - q);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.3, r0 = STAMP.r * (1.2 + 0.5 * oc(q)), r1 = r0 + 30 * (1 - q);
      g.beginPath(); g.moveTo(STAMP.x + Math.cos(a) * r0, STAMP.y + Math.sin(a) * r0); g.lineTo(STAMP.x + Math.cos(a) * r1, STAMP.y + Math.sin(a) * r1); g.stroke();
    }
    g.lineCap = 'butt';
  }
  g.save(); g.translate(STAMP.x, STAMP.y); g.rotate(STAMP.rot * oc(p));
  g.fillStyle = 'rgba(30,24,20,0.18)'; g.beginPath(); g.arc(4, 10, R, 0, TAU); g.fill();
  g.fillStyle = C.mint; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, R * 0.86, 0, TAU); g.stroke();
  const s = R / STAMP.r;
  g.scale(s, s);
  const ck = oc(seg(t, T.stamp + 0.1, T.stamp + 0.36));
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 15; g.lineCap = 'round'; g.lineJoin = 'round';
  const P = [[-40, -26], [-12, 2], [42, -50]], cum = [0, Math.hypot(28, 28), Math.hypot(28, 28) + Math.hypot(54, 52)];
  const Lk = cum[2] * ck;
  g.beginPath(); g.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < 3; i++) { if (cum[i] <= Lk) g.lineTo(P[i][0], P[i][1]); else { const u = (Lk - cum[i - 1]) / (cum[i] - cum[i - 1]); g.lineTo(lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)); break; } }
  if (ck > 0) g.stroke();
  g.lineCap = 'butt'; g.lineJoin = 'miter';
  g.fillStyle = '#FFFFFF'; g.font = `900 40px ${KR}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('정리 끝', 0, 48);
  g.restore();
}

// =================================================================== setup bakes
function bakeShapes() {
  // the kicked-off blanket: a lumpy outline over the bed with one corner hanging toward the floor
  const r = rand(1279), heap = [[36, 1150], [52, 1076], [118, 1036], [190, 1058], [252, 1006], [330, 1036], [396, 1014], [452, 1054], [512, 1070], [546, 1140],
    [536, 1228], [516, 1262], [480, 1270], [440, 1250], [380, 1244], [300, 1252], [220, 1234], [140, 1242], [72, 1222], [28, 1194]];
  BLANKET_HEAP = heap.flatMap(([x, y]) => [x + (r() - 0.5) * 10, y + (r() - 0.5) * 10]);
  for (const it of ITEMS) {
    if (it.kind === 'garment') {
      const q = rand(400 + it.id.length * 7 + it.cw), n = 11, pts = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU, k = 0.78 + q() * 0.3;
        pts.push(Math.cos(a) * (it.cw / 2) * k, Math.min(0, -it.ch / 2 + Math.sin(a) * (it.ch / 2) * k));
      }
      BLOBS[it.id] = pts;
    } else if (it.kind === 'paper') {
      const q = rand(500 + it.r * 13), n = 9, pts = [];
      for (let i = 0; i < n; i++) { const a = (i / n) * TAU, k = 0.82 + q() * 0.28; pts.push(Math.cos(a) * it.r * k, Math.sin(a) * it.r * k); }
      BLOBS[it.id] = pts;
    }
  }
  // cables: polylines (loops = a trochoid along the floor run)
  const run = (out, x0, y0, x1, y1, loops, R, ph = 0) => {
    for (let i = 0; i <= 90; i++) {
      const u = i / 90, a = TAU * loops * u + ph;
      out.push(lerp(x0, x1, u) + R * Math.sin(a), lerp(y0, y1, u) - R * 0.55 * (1 - Math.cos(a)) + 5 * Math.sin(u * 9));
    }
  };
  const lampA = [1030, 1150, 1034, 1176];
  run(lampA, 1036, 1196, 1096, 1232, 1.6, 20);
  lampA.push(1112, 1226, 1108, 1180, 1106, 1120, 1104, 1080);
  const chA = [1114, 1082, 1124, 1150, 1124, 1214];
  run(chA, 1126, 1244, 1046, 1270, 1.4, 18, 1.2);
  const coil = (out, cx, cy, rx, ry, turns) => { for (let i = 0; i <= 80; i++) { const a = TAU * turns * (i / 80); out.push(cx + rx * Math.cos(a) + i * 0.12, cy + ry * Math.sin(a)); } };
  const lampB = [1068, 1006, 1084, 1028, 1098, 1054, 1106, 1078];
  const chB = [1114, 1082, 1122, 1058, 1104, 1012, 1074, 996, 1066, 984];
  coil(chB, 1040, 984, 26, 8, 3);
  const bx = (p, pad = 10) => { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (let i = 0; i < p.length; i += 2) { a = Math.min(a, p[i]); c = Math.max(c, p[i]); b = Math.min(b, p[i + 1]); d = Math.max(d, p[i + 1]); } return [a - pad, b - pad, c + pad, d + pad]; };
  CABLES.cableLamp = { A: { pts: lampA, ties: [], box: bx(lampA) }, B: { pts: lampB, ties: [[1088, 1034, 12, 22, 0.6]], box: bx(lampB) } };
  CABLES.cableCharger = { A: { pts: chA, ties: [], plug: [1032, 1270, 0.3], box: bx(chA, 18) }, B: { pts: chB, ties: [[1044, 984, 12, 24, 0.2], [1116, 1068, 10, 18, 0.2]], box: bx(chB) } };
}
function captionScrim(api) {
  const el = api.layer('div', { z: 999 });
  el.style.cssText += ';pointer-events:none;background:linear-gradient(to bottom, rgba(41,39,44,0) 80%, rgba(41,39,44,.38) 89%, rgba(41,39,44,.66) 100%)';
}
function grainLayer(api) {
  const c = document.createElement('canvas'); c.width = 540; c.height = 960;
  c.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:5;pointer-events:none;opacity:.07;mix-blend-mode:multiply;image-rendering:auto';
  const g = c.getContext('2d'), img = g.createImageData(540, 960), r = rand(1281);
  for (let i = 0; i < img.data.length; i += 4) { const v = 150 + Math.floor(r() * 105); img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0);
  api.stage.appendChild(c);
}

// =================================================================== the demo
let MAIN;
defineDemo({
  id: '127-before-after',
  title: '정리 전, 정리 후',
  tech: '비교 장면 · 한 장면의 두 상태 + 와이프 슬라이더 + 분할 화면',
  duration: D,
  background: C.inkBg,
  async setup(api) {
    HEADLESS = api.headless;
    captionScrim(api);
    grainLayer(api);
    const glyphs = '정리 전후끝달라진곳토요일오전오후시원룸바닥의물건흩어진컵널린옷·→0123456789 ';
    for (const w of [900, 800, 700]) await fontReady(`${w} 40px ${KR}`, glyphs);
    const cv = api.canvas({ type: '2d', attrs: HEADLESS ? { willReadFrequently: true } : undefined });
    MAIN = { c: cv.el, g: cv.ctx };
    OFF_A = mk(W, H); OFF_B = mk(W, H);
    bakeBoards(); bakeDust(); buildScene(); bakeShapes(); measure();
    detect(); layoutCallouts(); bakeHand();
    for (const S of ['A', 'B']) ORDER[S] = ITEMS.map((it, i) => [it, i]).filter(([it]) => it[S].vis)
      .sort((p, q) => p[0][S].z - q[0][S].z || p[1] - q[1]).map(([it]) => it);
    // the clutter drops in back to front
    const drop = ITEMS.filter((it) => changeOf(it) && ['book', 'garment', 'cup', 'box', 'paper', 'snack', 'bin', 'plant', 'pillow'].includes(it.kind))
      .sort((p, q) => p.A.z - q.A.z);
    drop.forEach((it, i) => ENTER.set(it.id, 0.1 + (0.95 * i) / Math.max(1, drop.length - 1)));
    this.report = { groups: DIFF.groups.map((g) => [g.n, g.key, g.items.length, g.ghost]), counters: DIFF.counters, crop: DIFF.crop,
      marks: ['A', 'B'].map((S) => LAYOUT[S].map((m) => `${S}${m.n}:${m.mode}${m.mode === 'loop' ? m.r : ''}${m.leader ? '+leader' : ''}`).join(' ')) };
  },
  frame(t) {
    const g = MAIN.g;
    resetCtx(g); resetCtx(OFF_A.g); resetCtx(OFF_B.g);
    let wins = null;
    if (t < T.hAppear) {
      const s = lerp(1.075, 1, oc(seg(t, 0, 1.4)));
      paintRoom(g, 'A', t, { s, cx: 540, cy: 1000, wx: 540, wy: 1000 }, { enter: true });
    } else if (t < T.turnB) {
      const Ln = wipeLine(t);
      composite(g, t, Ln);
      paintWipeEdge(g, t, Ln);
      paintChips(g, t, Ln, null);
      paintSliderHandle(g, t, Ln);
    } else if (t < T.mergeB) {
      paintBackdrop(g);
      wins = windowsAt(t);
      paintPane(g, 'A', t, wins.A, 1);
      paintPane(g, 'B', t, wins.B, 1);
      paintCallouts(g, t);
      paintCounters(g, t);
      paintChips(g, t, null, wins);
      paintPill(g, t);
    } else {
      const L = 1 + 0.6 * sm(seg(t, T.glowA, 9.6));
      const punch = 0.012 * Math.exp(-7 * Math.max(0, t - T.stamp)) * (t > T.stamp ? Math.sin(Math.min(Math.PI, (t - T.stamp) * 14)) : 0);
      const s = 1 + 0.04 * sm(seg(t, T.mergeB, D)) + punch;
      paintRoom(g, 'B', t, { s, cx: 540, cy: 1000, wx: 540, wy: 1000 }, { L });
    }
    if (t >= T.mergeA && t < T.stamp) paintPill(g, t);
    paintTitle(g, t, '토요일 오전 10시 · 원룸', '정리 전', T.titleIn, T.titleOut, false);
    if (t > T.title2 - 0.1) paintTitle(g, t, '토요일 오후 1시 · 같은 방', '정리 후', T.title2, null, true);
    paintStamp(g, t);
  },
});

// riding labels: each sticks to its side of the wipe line, then flies to its window's corner
function paintChips(g, t, Ln, wins) {
  const pop = ob(seg(t, T.grab + 0.05, T.grab + 0.4), 1.8);
  if (pop <= 0) return;
  const hx = Ln ? Ln.px : 540;
  const ride = { A: [Math.max(24, hx - 26 - CHIP.wA), 160], B: [Math.min(W - 24 - CHIP.wB, hx + 26), 160] };
  const turn = io(seg(t, T.turnA, T.cropB));
  const corner = (S) => {
    if (!wins) return S === 'A' ? [24, 24] : [24, HANDLE_Y + 24];
    const r = wins[S].rect; return [r[0] + 24, r[1] + 24];
  };
  const fade = 1 - sm(seg(t, 7.86, 8.1));
  for (const S of ['A', 'B']) {
    const [cx, cy] = corner(S);
    const x = lerp(ride[S][0], cx, turn), y = lerp(ride[S][1], cy, turn);
    g.save();
    if (Ln && Ln.phi === 0) { g.beginPath(); if (S === 'A') g.rect(0, 0, Ln.px, H); else g.rect(Ln.px, 0, W - Ln.px, H); g.clip(); }
    paintChip(g, x, y, S, pop, S === 'B' ? fade : 1);
    g.restore();
  }
}
