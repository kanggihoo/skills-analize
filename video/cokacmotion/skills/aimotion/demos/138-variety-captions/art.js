/*
 * art.js — the kitchen, the two friends, the kettle and the pot. Flat rounded illustration with a 5 px ink line.
 * Static layers (wall, counter, light, vignette, grain) are baked once in setup; people, kettle, pot and foam are
 * drawn live from a pose that main.js computes as a pure function of t.
 * Tokens: ink, cream wall, sage tile and cabinets, warm wood. Speaker hues come from caption.js (their clothes);
 * the single accent (yellow) is not used here at all — it belongs to the emphasis beat.
 */
import { rand, clamp } from '../_lib/stage.js';
import { hash } from './caption.js';

export const TAU = Math.PI * 2;
export const W = 1080, H = 1920;
export const C = {
  ink: '#2a2232', wall: '#f5ead6', wallTop: '#ecdcc3', tile: '#e8ede3', grout: '#cdd6c9', trim: '#d6b088',
  wood: '#e0b17b', woodHi: '#efc999', woodDark: '#c08a55', cab: '#7c9f92', cabDark: '#5f8174', cabHi: '#93b5a8',
  sage: '#8fb0a1', terra: '#c98e6e', cream: '#fbf5e9', steel: '#dfe6ec', steelDark: '#8e99a7',
  water: '#bcd8e6', waterHi: '#e4f2f8', foam: '#ffffff', foamShade: '#d8e1ea', sky: '#cfe5ef', leaf: '#79a487', leafDark: '#5b8a6b',
  blush: 'rgba(255,128,132,0.38)', mouth: '#7a2c3c', tongue: '#ef8a8f',
};
export const POT = { x: 545, y: 962, rx: 148, ry: 27, bot: 1086 };
export const COUNTER = { back: 1124, front: 1188, cab: 1214 };
export const PEOPLE = {
  A: { x: 255, hy: 745, R: 110, skin: '#ffd6b3', hair: '#3b2a2a', style: 'short' },
  B: { x: 820, hy: 728, R: 106, skin: '#f7c8a3', hair: '#7a4630', style: 'bun' },
};
const HIP = 1262;

export function mkCanvas(w, h, headless) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d', headless ? { willReadFrequently: true } : undefined)];
}
const ink = (g, w = 5, col = C.ink) => { g.lineWidth = w; g.strokeStyle = col; g.stroke(); };
const fill = (g, col) => { g.fillStyle = col; g.fill(); };
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
const el = (g, x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU); };
const pathInk = (g, P, col, w = 5) => { g.fillStyle = col; g.fill(P); g.lineWidth = w; g.strokeStyle = C.ink; g.stroke(P); };

// ================================================================== baked: the wall (background)
export function bakeWall(g) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  const R = rand(13801);
  let gr = g.createLinearGradient(0, 0, 0, 800);
  gr.addColorStop(0, C.wallTop); gr.addColorStop(1, C.wall);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // faint wallpaper dots
  g.fillStyle = 'rgba(176,140,104,0.10)';
  for (let y = 40; y < 770; y += 54) for (let x = (y / 54) % 2 ? 27 : 0; x < W; x += 54) { el(g, x, y, 3.2, 3.2); g.fill(); }
  // tile backsplash
  const TY = 772, TS = 66;
  g.fillStyle = C.tile; g.fillRect(0, TY, W, COUNTER.back - TY + 40);
  for (let y = TY, r = 0; y < COUNTER.back + 40; y += TS, r++) {
    for (let x = (r % 2) * -TS / 2; x < W; x += TS) {
      const v = R();
      g.fillStyle = v < 0.18 ? '#dfe7dc' : v > 0.88 ? '#f1f3ec' : C.tile;
      g.fillRect(x + 2, y + 2, TS - 4, TS - 4);
      g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x + 6, y + 6, TS - 22, 4);
    }
  }
  g.strokeStyle = C.grout; g.lineWidth = 3;
  for (let y = TY, r = 0; y < COUNTER.back + 40; y += TS, r++) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    for (let x = (r % 2) * -TS / 2; x < W; x += TS) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + TS); g.stroke(); }
  }
  rr(g, -10, TY - 14, W + 20, 16, 4); fill(g, C.trim); ink(g, 4);

  // window (upper right) with café curtain and a herb pot on the sill
  const wx = 668, wy = 150, ww = 320, wh = 380;
  rr(g, wx - 18, wy - 18, ww + 36, wh + 36, 22); fill(g, C.cream); ink(g, 5);
  g.save(); rr(g, wx, wy, ww, wh, 10); g.clip();
  gr = g.createLinearGradient(0, wy, 0, wy + wh);
  gr.addColorStop(0, '#bfe0ee'); gr.addColorStop(0.7, '#e6f1ea'); gr.addColorStop(1, '#f5eedd');
  g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
  g.fillStyle = 'rgba(255,255,255,0.85)';
  for (const [cx, cy, s] of [[742, 232, 1], [905, 300, 0.75]]) {
    g.beginPath();
    for (const [dx, dy, r] of [[-40, 6, 24], [-12, -8, 32], [22, 0, 26], [46, 10, 18]]) g.ellipse(cx + dx * s, cy + dy * s, r * s, r * s * 0.86, 0, 0, TAU);
    g.fill();
  }
  // far rooftops
  g.fillStyle = '#d7e3da';
  g.beginPath(); g.moveTo(wx, wy + wh);
  for (const [x, y] of [[0, 300], [60, 300], [60, 270], [120, 270], [120, 310], [190, 310], [190, 262], [250, 262], [250, 296], [320, 296]]) g.lineTo(wx + x, wy + y);
  g.lineTo(wx + ww, wy + wh); g.fill();
  g.restore();
  rr(g, wx, wy, ww, wh, 10); ink(g, 4);
  g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh * 0.5); g.lineTo(wx + ww, wy + wh * 0.5);
  g.lineWidth = 14; g.strokeStyle = C.ink; g.stroke(); g.lineWidth = 7; g.strokeStyle = C.cream; g.stroke();
  // curtain valance with a scalloped hem
  g.beginPath(); g.moveTo(wx - 30, wy - 30); g.lineTo(wx + ww + 30, wy - 30); g.lineTo(wx + ww + 30, wy + 56);
  for (let i = 8; i > 0; i--) { const x0 = wx - 30 + (ww + 60) * i / 8, x1 = wx - 30 + (ww + 60) * (i - 1) / 8; g.quadraticCurveTo((x0 + x1) / 2, wy + 92, x1, wy + 56); }
  g.closePath(); fill(g, '#efd2bd'); ink(g, 5);
  g.strokeStyle = 'rgba(201,142,110,0.45)'; g.lineWidth = 6;
  for (let i = 1; i < 8; i++) { const x = wx - 30 + (ww + 60) * i / 8; g.beginPath(); g.moveTo(x, wy - 22); g.lineTo(x, wy + 50); g.stroke(); }
  rr(g, wx - 46, wy - 44, ww + 92, 16, 8); fill(g, C.woodDark); ink(g, 4);
  // sill + herb
  rr(g, wx - 34, wy + wh + 10, ww + 68, 22, 8); fill(g, C.cream); ink(g, 4);
  herb(g, wx + 250, wy + wh + 10);

  // shelf (upper left): jars, bowls, a plant
  const sy = 470;
  for (const x of [118, 400]) { g.beginPath(); g.moveTo(x, sy + 12); g.lineTo(x, sy + 52); g.lineTo(x + 30, sy + 12); g.closePath(); fill(g, C.woodDark); ink(g, 4); }
  jar(g, 112, sy, 82, 112, '#e7cf9e', C.terra, 0.62);
  jar(g, 208, sy, 74, 82, '#a5765a', C.sage, 0.5);
  bowls(g, 318, sy);
  plant(g, 418, sy);
  rr(g, 70, sy, 400, 16, 6); fill(g, C.wood); ink(g, 4);

  // pendant lamp (top centre)
  g.beginPath(); g.moveTo(540, -10); g.lineTo(540, 132); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke();
  g.beginPath(); g.moveTo(478, 196); g.bezierCurveTo(478, 140, 602, 140, 602, 196); g.closePath(); fill(g, '#6f9184'); ink(g, 5);
  rr(g, 528, 124, 24, 18, 5); fill(g, '#4c6a5f'); ink(g, 4);
  el(g, 540, 198, 22, 9); fill(g, '#fff4cf'); ink(g, 4);
}
function jar(g, x, y, w, h, content, lid, lev) {
  rr(g, x, y - h, w, h, 14); fill(g, '#eaf2ee');
  g.save(); rr(g, x, y - h, w, h, 14); g.clip(); g.fillStyle = content; g.fillRect(x, y - h * lev, w, h); g.restore();
  rr(g, x, y - h, w, h, 14); ink(g, 4);
  g.fillStyle = 'rgba(255,255,255,0.7)'; rr(g, x + 10, y - h + 14, 8, h - 34, 4); g.fill();
  rr(g, x - 4, y - h - 16, w + 8, 20, 6); fill(g, lid); ink(g, 4);
}
function bowls(g, x, y) {
  for (let i = 0; i < 3; i++) {
    const yy = y - i * 20;
    g.beginPath(); g.moveTo(x - 44, yy - 26); g.quadraticCurveTo(x, yy + 14, x + 44, yy - 26); g.closePath(); fill(g, C.cream); ink(g, 4);
    g.beginPath(); g.moveTo(x - 36, yy - 18); g.quadraticCurveTo(x, yy + 2, x + 36, yy - 18); g.lineWidth = 3; g.strokeStyle = '#8fb0c4'; g.stroke();
  }
}
function plant(g, x, y) {
  for (const [a, l] of [[-0.9, 64], [-0.35, 82], [0.2, 74], [0.75, 58], [-1.4, 46]]) {
    g.save(); g.translate(x, y - 40); g.rotate(a);
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(18, -l * 0.5, 0, -l); g.quadraticCurveTo(-18, -l * 0.5, 0, 0); fill(g, C.leaf); ink(g, 4);
    g.restore();
  }
  g.beginPath(); g.moveTo(x - 30, y - 46); g.lineTo(x + 30, y - 46); g.lineTo(x + 22, y); g.lineTo(x - 22, y); g.closePath(); fill(g, C.terra); ink(g, 4);
}
function herb(g, x, y) {
  for (const [a, l] of [[-0.5, 40], [0, 52], [0.5, 40]]) {
    g.save(); g.translate(x, y - 30); g.rotate(a);
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(12, -l * 0.5, 0, -l); g.quadraticCurveTo(-12, -l * 0.5, 0, 0); fill(g, C.leaf); ink(g, 3.5);
    g.restore();
  }
  rr(g, x - 22, y - 34, 44, 34, 6); fill(g, C.terra); ink(g, 4);
}

// ================================================================== baked: counter (mid layer, in front of the people)
export function bakeCounter(g) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  // cabinets
  g.fillStyle = C.cab; g.fillRect(0, COUNTER.cab, W, H - COUNTER.cab);
  for (const [x, w] of [[26, 500], [554, 500]]) {
    rr(g, x, COUNTER.cab + 34, w, 640, 18); fill(g, C.cabHi); ink(g, 4);
    rr(g, x + 34, COUNTER.cab + 68, w - 68, 572, 12); g.lineWidth = 4; g.strokeStyle = C.cabDark; g.stroke();
    el(g, x + (x < 300 ? w - 60 : 60), COUNTER.cab + 110, 13, 13); fill(g, C.wood); ink(g, 4);
  }
  let gr = g.createLinearGradient(0, COUNTER.cab, 0, COUNTER.cab + 60);
  gr.addColorStop(0, 'rgba(40,30,45,0.32)'); gr.addColorStop(1, 'rgba(40,30,45,0)');
  g.fillStyle = gr; g.fillRect(0, COUNTER.cab, W, 60);
  // top surface and lip
  g.fillStyle = C.wood; g.fillRect(-10, COUNTER.back, W + 20, COUNTER.front - COUNTER.back);
  g.strokeStyle = 'rgba(150,100,60,0.22)'; g.lineWidth = 2.5;
  for (let i = 0; i < 6; i++) { const y = COUNTER.back + 10 + i * 10; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(300, y + 4, 700, y - 4, W, y + 2); g.stroke(); }
  g.fillStyle = 'rgba(60,40,40,0.18)'; g.fillRect(0, COUNTER.back, W, 7);
  g.beginPath(); g.moveTo(-10, COUNTER.back); g.lineTo(W + 10, COUNTER.back); ink(g, 4);
  rr(g, -10, COUNTER.front, W + 20, COUNTER.cab - COUNTER.front, 4); fill(g, C.woodDark); ink(g, 5);
  g.beginPath(); g.moveTo(0, COUNTER.front + 6); g.lineTo(W, COUNTER.front + 6); g.lineWidth = 3; g.strokeStyle = C.woodHi; g.stroke();
  // a tea towel hung over the lip (stripes in the wall's neutrals)
  g.save(); g.translate(992, COUNTER.front - 6); g.rotate(-0.03);
  const Tw = new Path2D();
  Tw.moveTo(-62, 0); Tw.lineTo(62, 0); Tw.lineTo(66, 214); Tw.quadraticCurveTo(0, 226, -66, 214); Tw.closePath();
  g.fillStyle = C.cream; g.fill(Tw);
  g.save(); g.clip(Tw); g.fillStyle = C.sage; for (const y of [150, 172]) g.fillRect(-80, y, 160, 10); g.fillStyle = 'rgba(80,60,50,0.12)'; g.fillRect(24, 0, 60, 240); g.restore();
  g.lineWidth = 5; g.strokeStyle = C.ink; g.stroke(Tw);
  rr(g, -66, -12, 132, 26, 10); fill(g, '#efe6d6'); ink(g, 5);
  g.restore();
  // a pillow-pack of noodles (no print, just a bowl drawing) at the right end
  g.save(); g.translate(1000, 1104); g.rotate(-0.07);
  rr(g, -76, -60, 152, 112, 18); fill(g, '#f3e8d2'); ink(g, 5);
  g.strokeStyle = 'rgba(160,120,80,0.5)'; g.lineWidth = 3;
  for (let x = -66; x <= 66; x += 12) { g.beginPath(); g.moveTo(x, -58); g.lineTo(x, -46); g.moveTo(x, 40); g.lineTo(x, 50); g.stroke(); }
  g.beginPath(); g.moveTo(-36, -8); g.quadraticCurveTo(0, 46, 36, -8); g.closePath(); fill(g, '#b9845a'); ink(g, 4);
  g.strokeStyle = '#ead9b0'; g.lineWidth = 4;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-24 + i * 4, -10); g.bezierCurveTo(-10, -26, 6, 4, 24 - i * 4, -12); g.stroke(); }
  g.restore();
}

// ================================================================== baked: an out-of-focus bowl in the foreground (blurred once)
export function bakeBowl(g, w, headless) {
  const [c, h] = mkCanvas(w, w * 0.62, headless);
  h.lineJoin = 'round'; h.lineCap = 'round';
  const cx = w / 2, cy = w * 0.2;
  h.beginPath(); h.moveTo(cx - 250, cy); h.bezierCurveTo(cx - 240, cy + 250, cx + 240, cy + 250, cx + 250, cy); h.closePath();
  h.fillStyle = '#d9cdb9'; h.fill(); h.lineWidth = 7; h.strokeStyle = C.ink; h.stroke();
  h.save(); h.clip(); h.fillStyle = C.cabDark; h.fillRect(0, cy + 70, w, 26); h.fillStyle = 'rgba(80,60,60,0.14)'; h.fillRect(cx + 90, 0, 200, 400); h.restore();
  h.beginPath(); h.ellipse(cx, cy, 250, 46, 0, 0, TAU); h.fillStyle = '#e6dccb'; h.fill(); h.stroke();
  h.beginPath(); h.ellipse(cx, cy + 6, 222, 34, 0, 0, TAU); h.fillStyle = '#bfae94'; h.fill();
  for (const [dx, a] of [[-30, -0.2], [10, -0.13]]) {
    h.save(); h.translate(cx + dx, cy - 6); h.rotate(a);
    h.beginPath(); h.roundRect(-300, -8, 560, 16, 8); h.fillStyle = C.woodDark; h.fill(); h.lineWidth = 6; h.stroke(); h.restore();
  }
  g.filter = 'blur(9px)';
  g.drawImage(c, 0, 0);
  g.filter = 'none';
}

// ================================================================== baked: light, vignette, grain, soft sprite
export function bakeLight(g) {
  // the lamp: a warm pool around the top centre, and window daylight bloom
  let gr = g.createRadialGradient(540, 200, 10, 540, 420, 760);
  gr.addColorStop(0, 'rgba(255,236,190,0.55)'); gr.addColorStop(0.45, 'rgba(255,226,170,0.16)'); gr.addColorStop(1, 'rgba(255,226,170,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  gr = g.createRadialGradient(830, 340, 40, 830, 340, 420);
  gr.addColorStop(0, 'rgba(235,248,255,0.4)'); gr.addColorStop(1, 'rgba(235,248,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
export function bakeVignette(g) {
  let gr = g.createRadialGradient(540, 860, 380, 540, 960, 1240);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(176,150,160,1)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  gr = g.createLinearGradient(0, 1560, 0, H);
  gr.addColorStop(0, 'rgba(60,40,60,0)'); gr.addColorStop(1, 'rgba(36,26,40,0.85)');
  g.fillStyle = gr; g.fillRect(0, 1560, W, H - 1560);
}
export function bakeGrain(g, n = 256) {
  const R = rand(13802), img = g.createImageData(n, n);
  for (let i = 0; i < n * n; i++) { const v = 128 + (R() - 0.5) * 34; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0);
}
/** soft ink disc for the shadows the people cast on the tiles (strength set by globalAlpha) */
export function bakeSoft(g, n = 128) {
  const gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  gr.addColorStop(0, 'rgba(60,40,62,1)'); gr.addColorStop(0.55, 'rgba(60,40,62,0.5)'); gr.addColorStop(1, 'rgba(60,40,62,0)');
  g.fillStyle = gr; g.fillRect(0, 0, n, n);
}

// ================================================================== people
const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
/**
 * Resolve a pose into world points: hip, head centre, shoulders. Pose fields used here: bx, by (body shift),
 * lean (rad, about the hip; + leans right), hx, hy (head shift), tilt (head roll).
 */
export function rig(P, s) {
  const hip = [P.x + s.bx, HIP + s.by];
  const top = P.hy + 0.86 * P.R - HIP;                         // torso top, hip-relative
  const neck = rot(0, top, s.lean);
  const head = [hip[0] + rot(0, -0.84 * P.R, s.lean)[0] + neck[0] + s.hx, hip[1] + neck[1] + rot(0, -0.84 * P.R, s.lean)[1] + s.hy];
  const sh = (side) => { const v = rot(side * 0.84 * P.R, top + 0.36 * P.R, s.lean); return [hip[0] + v[0], hip[1] + v[1]]; };
  return { hip, top, head, shL: sh(-1), shR: sh(1) };
}

/** torso + head (drawn before the counter). The arms come later (drawArms), over the counter. */
export function drawPerson(g, P, s, pal, t) {
  const Q = rig(P, s), R = P.R;
  g.lineJoin = 'round'; g.lineCap = 'round';
  const head = () => { g.translate(Q.head[0], Q.head[1]); g.rotate(s.tilt + s.lean * 0.4); };
  if (P.style === 'bun') { g.save(); head(); hairBack(g, R, P, pal); g.restore(); }
  // torso
  g.save(); g.translate(Q.hip[0], Q.hip[1]); g.rotate(s.lean);
  const w = R, r = 0.55 * R, top = Q.top;
  const T = new Path2D();
  T.moveTo(-w * 1.12, 80); T.lineTo(-w, top + r); T.quadraticCurveTo(-w, top, -w + r, top);
  T.lineTo(w - r, top); T.quadraticCurveTo(w, top, w, top + r); T.lineTo(w * 1.12, 80); T.closePath();
  g.fillStyle = pal.cloth; g.fill(T);
  g.save(); g.clip(T); g.fillStyle = pal.clothDark; g.globalAlpha = 0.5; g.fillRect(w * 0.42, top - 10, w, 400); g.globalAlpha = 1; g.restore();
  g.lineWidth = 5; g.strokeStyle = C.ink; g.stroke(T);
  if (P.style === 'short') {
    // hood folded behind the neck + drawstrings
    el(g, 0, top + 0.06 * R, 0.78 * R, 0.3 * R); fill(g, pal.clothDark); ink(g, 5);
    for (const sx of [-1, 1]) {
      g.beginPath(); g.moveTo(sx * 0.24 * R, top + 0.3 * R); g.lineTo(sx * 0.27 * R, top + 0.88 * R); ink(g, 9); g.strokeStyle = C.cream; g.lineWidth = 4; g.stroke();
    }
  } else {
    for (const sx of [-1, 1]) {
      g.beginPath(); g.moveTo(0, top + 0.02 * R); g.quadraticCurveTo(sx * 0.5 * R, top - 0.04 * R, sx * 0.5 * R, top + 0.16 * R);
      g.quadraticCurveTo(sx * 0.36 * R, top + 0.42 * R, 0, top + 0.26 * R); g.closePath(); fill(g, C.cream); ink(g, 4);
    }
  }
  g.restore();
  // head
  g.save(); head();
  for (const sx of [-1, 1]) { el(g, sx * 0.98 * R, 0.12 * R, 0.17 * R, 0.21 * R); fill(g, P.skin); ink(g, 5); }
  el(g, 0, 0, R, R * 0.97); fill(g, P.skin); ink(g, 5);
  face(g, R, s.face, t);
  if (P.style === 'short') hairShort(g, R, P); else hairFront(g, R, P);
  g.restore();
  return Q;
}

function hairShort(g, R, P) {
  const F = new Path2D();
  F.moveTo(-1.0 * R, 0.14 * R);
  F.bezierCurveTo(-1.14 * R, -0.62 * R, -0.62 * R, -1.13 * R, 0.02 * R, -1.1 * R);
  F.bezierCurveTo(0.66 * R, -1.1 * R, 1.13 * R, -0.62 * R, 1.0 * R, 0.14 * R);
  F.quadraticCurveTo(0.93 * R, -0.24 * R, 0.68 * R, -0.4 * R);
  F.quadraticCurveTo(0.52 * R, -0.25 * R, 0.32 * R, -0.42 * R);
  F.quadraticCurveTo(0.14 * R, -0.26 * R, -0.1 * R, -0.44 * R);
  F.quadraticCurveTo(-0.3 * R, -0.27 * R, -0.54 * R, -0.42 * R);
  F.quadraticCurveTo(-0.82 * R, -0.32 * R, -0.9 * R, -0.04 * R);
  F.closePath();
  pathInk(g, F, P.hair, 5);
  g.beginPath(); g.moveTo(-0.38 * R, -0.86 * R); g.quadraticCurveTo(-0.1 * R, -0.98 * R, 0.2 * R, -0.9 * R);
  g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,0.22)'; g.stroke();
  g.beginPath(); g.moveTo(0.06 * R, -1.08 * R); g.bezierCurveTo(0.0, -1.42 * R, 0.36 * R, -1.46 * R, 0.33 * R, -1.22 * R); ink(g, 7);
}
function hairBack(g, R, P, pal) {
  el(g, 0.08 * R, -1.12 * R, 0.36 * R, 0.34 * R); fill(g, P.hair); ink(g, 5);
  g.beginPath(); g.ellipse(0.06 * R, -0.84 * R, 0.24 * R, 0.08 * R, 0, 0, TAU); fill(g, pal.cloth); ink(g, 4);
  const B = new Path2D();
  B.moveTo(-1.13 * R, 0.78 * R); B.lineTo(-1.14 * R, -0.05 * R);
  B.bezierCurveTo(-1.14 * R, -0.75 * R, -0.62 * R, -1.12 * R, 0, -1.12 * R);
  B.bezierCurveTo(0.62 * R, -1.12 * R, 1.14 * R, -0.75 * R, 1.14 * R, -0.05 * R);
  B.lineTo(1.13 * R, 0.78 * R); B.quadraticCurveTo(1.1 * R, 0.95 * R, 0.86 * R, 0.92 * R);
  B.lineTo(-0.86 * R, 0.92 * R); B.quadraticCurveTo(-1.1 * R, 0.95 * R, -1.13 * R, 0.78 * R); B.closePath();
  pathInk(g, B, P.hair, 5);
}
function hairFront(g, R, P) {
  const F = new Path2D();
  F.moveTo(-1.02 * R, 0.22 * R);
  F.bezierCurveTo(-1.14 * R, -0.62 * R, -0.6 * R, -1.12 * R, 0.04 * R, -1.1 * R);
  F.bezierCurveTo(0.68 * R, -1.08 * R, 1.14 * R, -0.6 * R, 1.02 * R, 0.22 * R);
  F.lineTo(0.9 * R, 0.12 * R);
  F.bezierCurveTo(0.9 * R, -0.24 * R, 0.64 * R, -0.44 * R, 0.3 * R, -0.48 * R);
  F.bezierCurveTo(-0.08 * R, -0.52 * R, -0.42 * R, -0.34 * R, -0.62 * R, -0.16 * R);
  F.bezierCurveTo(-0.78 * R, -0.02 * R, -0.86 * R, 0.1 * R, -0.92 * R, 0.24 * R);
  F.closePath();
  pathInk(g, F, P.hair, 5);
  g.beginPath(); g.moveTo(-0.34 * R, -0.86 * R); g.quadraticCurveTo(-0.04 * R, -1.0 * R, 0.3 * R, -0.9 * R);
  g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,0.22)'; g.stroke();
}

/**
 * Face channels: eye 'dot' | 'wide' | 'laugh', look [x, y] (−1..1), blink 0..1, lid 0..1 (skeptical half-lid), jit [x, y]
 * (pupil jitter, px), browUp, worry (+ inner ends up), mouth { kind 'line' | 'open' | 'O' | 'wave', o, s (smile), w }, blush.
 */
function face(g, R, f, t) {
  for (const side of [-1, 1]) {
    const ex = side * 0.36 * R, ey = 0.07 * R;
    if (f.eye === 'laugh') {
      g.beginPath(); g.arc(ex, ey + 0.07 * R, 0.12 * R, Math.PI + 0.32, -0.32); ink(g, 0.065 * R);
    } else if (f.eye === 'wide') {
      el(g, ex, ey, 0.19 * R, 0.22 * R); fill(g, '#ffffff'); ink(g, 4.5);
      const px = ex + f.look[0] * 0.07 * R + f.jit[0], py = ey + f.look[1] * 0.07 * R + f.jit[1];
      el(g, px, py, 0.068 * R, 0.068 * R); fill(g, C.ink);
      el(g, px - 0.025 * R, py - 0.028 * R, 0.022 * R, 0.022 * R); fill(g, '#ffffff');
    } else {
      const open = 1 - f.blink, ry = 0.125 * R * Math.max(0.1, open * (1 - 0.42 * f.lid));
      const px = ex + f.look[0] * 0.05 * R, py = ey + f.look[1] * 0.04 * R + 0.03 * R * f.lid;
      el(g, px, py, 0.088 * R, ry); fill(g, C.ink);
      if (open > 0.6) { el(g, px - 0.03 * R, py - ry * 0.4, 0.028 * R, 0.028 * R); fill(g, '#ffffff'); }
      if (f.lid > 0.05) {
        g.beginPath(); g.moveTo(px - 0.13 * R, py - ry - 0.01 * R + side * 0.02 * R * f.lid); g.lineTo(px + 0.13 * R, py - ry - 0.01 * R - side * 0.02 * R * f.lid);
        ink(g, 0.045 * R);
      }
    }
    const bx = side * 0.36 * R, by = -0.24 * R - f.browUp * 0.1 * R;
    g.beginPath();
    g.moveTo(bx + side * 0.12 * R, by + f.worry * 0.05 * R);
    g.quadraticCurveTo(bx, by - 0.04 * R, bx - side * 0.12 * R, by - f.worry * 0.07 * R);
    ink(g, 0.06 * R);
  }
  g.beginPath(); g.arc(0, 0.25 * R, 0.05 * R, 0.25 * Math.PI, 0.85 * Math.PI); ink(g, 0.035 * R);
  if (f.blush > 0) {
    g.globalAlpha = f.blush;
    for (const side of [-1, 1]) { el(g, side * 0.58 * R, 0.34 * R, 0.15 * R, 0.085 * R); fill(g, C.blush); }
    g.globalAlpha = 1;
  }
  mouth(g, R, f.mouth, t);
}
function mouth(g, R, m, t) {
  const y = 0.47 * R, w = m.w * R;
  if (m.kind === 'wave') {
    g.beginPath();
    for (let i = 0; i <= 24; i++) { const x = -w / 2 + (w * i) / 24; const yy = y + 0.035 * R * Math.sin(i / 24 * TAU * 2.5 + t * 30); i ? g.lineTo(x, yy) : g.moveTo(x, yy); }
    ink(g, 0.045 * R);
    return;
  }
  if (m.kind === 'O') {
    el(g, 0, y + 0.05 * R, 0.1 * R * (0.85 + 0.15 * m.o), 0.13 * R * (0.6 + 0.6 * m.o)); fill(g, C.mouth); ink(g, 4.5);
    return;
  }
  if (m.o < 0.06) {
    g.beginPath(); g.moveTo(-w / 2, y - m.s * 0.035 * R); g.quadraticCurveTo(0, y + m.s * 0.13 * R, w / 2, y - m.s * 0.035 * R); ink(g, 0.045 * R);
    return;
  }
  const lo = y + (0.05 + 0.34 * m.o) * R + m.s * 0.05 * R;
  const M = new Path2D();
  M.moveTo(-w / 2, y - m.s * 0.03 * R); M.quadraticCurveTo(0, y + m.s * 0.04 * R, w / 2, y - m.s * 0.03 * R);
  M.quadraticCurveTo(w * 0.42, lo, 0, lo); M.quadraticCurveTo(-w * 0.42, lo, -w / 2, y - m.s * 0.03 * R); M.closePath();
  g.fillStyle = C.mouth; g.fill(M);
  g.save(); g.clip(M); el(g, 0, lo, w * 0.3, 0.12 * R * m.o + 0.03 * R); fill(g, C.tongue); g.restore();
  g.lineWidth = 0.042 * R; g.strokeStyle = C.ink; g.stroke(M);
}

/** one arm from shoulder to hand: a bent sleeve (quadratic, elbow pushed by `bend`), then the hand */
export function drawArm(g, P, sh, hand, bend, pal, kind = 'fist', dir = [0, 1], side = 1) {
  const R = P.R, dx = hand[0] - sh[0], dy = hand[1] - sh[1], L = Math.hypot(dx, dy) || 1;
  // the elbow is pushed along the normal that points away from the body (side −1 = screen-left arm)
  let nx = -dy / L, ny = dx / L;
  if (nx * side + ny * 0.4 < 0) { nx = -nx; ny = -ny; }
  const cx = (sh[0] + hand[0]) / 2 + nx * bend, cy = (sh[1] + hand[1]) / 2 + ny * bend;
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(sh[0], sh[1]); g.quadraticCurveTo(cx, cy, hand[0], hand[1]);
  g.lineWidth = 0.4 * R + 10; g.strokeStyle = C.ink; g.stroke();
  g.lineWidth = 0.4 * R; g.strokeStyle = pal.cloth; g.stroke();
  // hand: union of parts, ink under, skin over
  const r = 0.2 * R, Hd = new Path2D(), [ux, uy] = dir, px = -uy, py = ux;
  Hd.ellipse(hand[0], hand[1], r, r, 0, 0, TAU);
  if (kind === 'open') {
    for (const k of [-1.5, -0.5, 0.5, 1.5]) {
      const fx = hand[0] + ux * r * 0.95 + px * k * r * 0.42, fy = hand[1] + uy * r * 0.95 + py * k * r * 0.42;
      Hd.moveTo(fx + r * 0.3, fy); Hd.ellipse(fx, fy, r * 0.3, r * 0.3, 0, 0, TAU);
    }
    const tx = hand[0] - px * r * 1.0 + ux * 0.1 * r, ty = hand[1] - py * r * 1.0 + uy * 0.1 * r;
    Hd.moveTo(tx + r * 0.3, ty); Hd.ellipse(tx, ty, r * 0.3, r * 0.3, 0, 0, TAU);
  } else if (kind === 'point') {
    const fx = hand[0] + ux * r * 1.5, fy = hand[1] + uy * r * 1.5;
    Hd.moveTo(fx + r * 0.27, fy); Hd.ellipse(fx, fy, r * 0.27, r * 0.27, 0, 0, TAU);
    const a = Math.atan2(uy, ux);
    Hd.moveTo(hand[0], hand[1]);
    const rr2 = new Path2D(); rr2.roundRect(0, -r * 0.27, r * 1.5, r * 0.54, r * 0.27);
    Hd.addPath(rr2, new DOMMatrix().translateSelf(hand[0], hand[1]).rotateSelf((a * 180) / Math.PI));
  }
  g.lineWidth = 9; g.strokeStyle = C.ink; g.stroke(Hd);
  g.fillStyle = P.skin; g.fill(Hd);
}

// ================================================================== props
/** kettle, local origin = the hand's grip on the handle; returns the spout tip in world coordinates */
export const SPOUT = [176, -24];
export function drawKettle(g, x, y, a) {
  g.save(); g.translate(x, y); g.rotate(a);
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); g.moveTo(18, -34); g.bezierCurveTo(-24, -42, -26, 34, 16, 36);
  g.lineWidth = 24; g.strokeStyle = C.ink; g.stroke(); g.lineWidth = 14; g.strokeStyle = '#4b4651'; g.stroke();
  const S = new Path2D();
  S.moveTo(118, 2); S.quadraticCurveTo(152, -2, 168, -28); S.lineTo(182, -22); S.quadraticCurveTo(164, 14, 126, 34); S.closePath();
  pathInk(g, S, '#e9e3d6', 5);
  const B = new Path2D();
  B.moveTo(8, 46); B.lineTo(134, 46); B.bezierCurveTo(144, 0, 122, -42, 71, -46); B.bezierCurveTo(20, -42, -2, 0, 8, 46); B.closePath();
  g.fillStyle = '#f6f1e6'; g.fill(B);
  g.save(); g.clip(B); g.fillStyle = C.sage; g.fillRect(0, 14, 150, 13); g.fillStyle = 'rgba(120,100,90,0.14)'; g.fillRect(96, -50, 60, 100); g.restore();
  g.lineWidth = 5; g.strokeStyle = C.ink; g.stroke(B);
  el(g, 71, -45, 36, 9); fill(g, '#e9e3d6'); ink(g, 4);
  el(g, 71, -57, 10, 10); fill(g, '#4b4651'); ink(g, 4);
  g.fillStyle = 'rgba(255,255,255,0.8)'; rr(g, 26, -18, 9, 40, 5); g.fill();
  g.restore();
  const [sx, sy] = rot(SPOUT[0], SPOUT[1], a);
  return [x + sx, y + sy];
}

/** the gas burner under the pot (live, because the flame flickers) */
export function drawBurner(g, t, heat) {
  g.lineJoin = 'round';
  for (const x of [436, 500, 590, 654]) { rr(g, x - 6, POT.bot - 4, 12, 20, 3); fill(g, '#3a3640'); }
  // flame: blue tongues between the pot bottom and the burner plate, flickering in 1/20 s steps
  if (heat > 0) {
    const step = Math.floor(t * 20);
    g.save(); g.beginPath(); g.rect(400, POT.bot - 30, 290, 46); g.clip();
    for (let k = 0; k < 11; k++) {
      const x = 452 + k * 18.6, h = heat * (13 + 9 * hash(step, k, 3));
      g.beginPath(); g.moveTo(x - 7, 1100); g.quadraticCurveTo(x - 4, 1100 - h * 0.6, x, 1100 - h); g.quadraticCurveTo(x + 4, 1100 - h * 0.6, x + 7, 1100); g.closePath();
      fill(g, '#5aa2f0');
      g.beginPath(); g.moveTo(x - 3, 1100); g.quadraticCurveTo(x, 1100 - h * 0.7, x + 3, 1100); g.closePath(); fill(g, '#d8f0ff');
    }
    g.restore();
  }
  rr(g, 398, 1098, 294, 70, 14); fill(g, '#45414d'); ink(g, 5);
  rr(g, 398, 1098, 294, 16, 8); fill(g, '#5e5967'); ink(g, 4);
  g.strokeStyle = '#2f2c36'; g.lineWidth = 4;
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(426 + i * 18, 1130); g.lineTo(426 + i * 18, 1152); g.stroke(); }
  el(g, 652, 1140, 16, 16); fill(g, C.cream); ink(g, 4);
  g.beginPath(); g.moveTo(652, 1140); g.lineTo(652 + 9 * Math.cos(-2.2), 1140 + 9 * Math.sin(-2.2)); ink(g, 4);
  for (const x of [418, 672]) { rr(g, x - 12, 1164, 24, 10, 4); fill(g, '#2f2c36'); }
}

/**
 * The pot. level: water 0..1 of the visible depth; boil 0..1 (bubble rate); foam { cover 0..1 (white layer on the
 * water), h (dome height above the rim, px), drips [{ x, w, len }], wob (time for the bubble wobble) }.
 */
export function drawPot(g, level, boil, foam, t) {
  const { x, y, rx, ry, bot } = POT;
  g.lineJoin = 'round'; g.lineCap = 'round';
  // handles
  for (const s of [-1, 1]) { rr(g, x + s * (rx + 22) - 20, y + 18, 40, 18, 9); fill(g, '#4b4651'); ink(g, 4); }
  // inside: back wall, then the water surface clipped to the rim
  g.save();
  el(g, x, y, rx, ry); g.clip();
  let gr = g.createLinearGradient(0, y - ry, 0, y + ry);
  gr.addColorStop(0, '#6f7b8a'); gr.addColorStop(1, '#a8b3bf');
  g.fillStyle = gr; g.fillRect(x - rx, y - ry, 2 * rx, 2 * ry);
  const depth = 64, wy = y + (1 - level) * depth;
  el(g, x, wy, rx * 0.985, ry * 0.985);
  g.fillStyle = level > 0.02 ? C.water : '#8994a2'; g.fill();
  if (level > 0.02) {
    el(g, x - rx * 0.25, wy - ry * 0.35, rx * 0.4, ry * 0.2); fill(g, 'rgba(255,255,255,0.5)');
    // boiling: bubbles born and popping on hashed slots, a pure function of t
    if (boil > 0) {
      for (let k = 0; k < 34; k++) {
        if (hash(k, 91) > boil) continue;
        const per = 0.36 + 0.3 * hash(k, 92), ph = hash(k, 93), cyc = Math.floor(t / per + ph), u = t / per + ph - cyc;
        const a = hash(k, cyc, 94) * TAU, d = Math.sqrt(hash(k, cyc, 95)) * 0.86;
        const bx = x + Math.cos(a) * rx * d, by = wy + Math.sin(a) * ry * d * 0.9;
        const r = (5 + 9 * hash(k, cyc, 96)) * Math.sin(Math.PI * Math.min(1, u * 1.15));
        if (r <= 0.5) continue;
        el(g, bx, by - r * 0.4, r, r * 0.75); fill(g, 'rgba(255,255,255,0.75)');
        g.lineWidth = 2; g.strokeStyle = 'rgba(80,110,140,0.45)'; g.stroke();
      }
    }
    if (foam.cover > 0) foamLayer(g, x, wy, rx, ry, foam.cover, t);
  }
  g.restore();
  // body
  const Bd = new Path2D();
  Bd.moveTo(x - rx, y); Bd.lineTo(x - rx + 6, bot - 20); Bd.quadraticCurveTo(x - rx + 8, bot, x - rx + 30, bot);
  Bd.lineTo(x + rx - 30, bot); Bd.quadraticCurveTo(x + rx - 8, bot, x + rx - 6, bot - 20); Bd.lineTo(x + rx, y);
  Bd.ellipse(x, y, rx, ry, 0, 0, Math.PI, false); Bd.closePath();
  gr = g.createLinearGradient(x - rx, 0, x + rx, 0);
  gr.addColorStop(0, '#95a1ae'); gr.addColorStop(0.16, '#dbe2e9'); gr.addColorStop(0.3, '#f6f8fa'); gr.addColorStop(0.42, '#d5dde5');
  gr.addColorStop(0.78, '#bcc6d0'); gr.addColorStop(1, '#8794a2');
  g.fillStyle = gr; g.fill(Bd);
  g.lineWidth = 5; g.strokeStyle = C.ink; g.stroke(Bd);
  // rim: a thick ring with ink on both sides
  el(g, x, y, rx, ry); g.lineWidth = 13; g.strokeStyle = C.ink; g.stroke(); g.lineWidth = 6; g.strokeStyle = '#eef2f6'; g.stroke();
}
/** foam on the water: bubble clusters clipped to the rim (cover 0..1 grows the clusters) */
function foamLayer(g, x, wy, rx, ry, cover, t) {
  const P = new Path2D(), Q = new Path2D();
  for (let k = 0; k < 26; k++) {
    if (hash(k, 71) > cover * 1.15) continue;
    const a = hash(k, 72) * TAU, d = Math.sqrt(hash(k, 73)) * 0.95;
    const bx = x + Math.cos(a) * rx * d, by = wy + Math.sin(a) * ry * d;
    const r = (12 + 16 * hash(k, 74)) * Math.min(1, cover * 1.6) * (1 + 0.06 * Math.sin(t * 9 + k));
    P.moveTo(bx + r, by); P.ellipse(bx, by, r, r * 0.7, 0, 0, TAU);
    Q.moveTo(bx - 2 + r * 0.8, by - 3); Q.ellipse(bx - 2, by - 3, r * 0.8, r * 0.52, 0, 0, TAU);
  }
  g.lineWidth = 6; g.strokeStyle = 'rgba(42,34,50,0.55)'; g.stroke(P);
  g.fillStyle = C.foamShade; g.fill(P);
  g.fillStyle = C.foam; g.fill(Q);
}

/**
 * The boil-over: a foam dome on the rim (h px above it) and drips down the front wall, drawn as ONE union
 * (ink stroke of every part first, then the fills) so the outline runs round the whole mass, plus toon shading
 * (shade fill, then the same circles shifted up-left and shrunk in white).
 */
export function drawFoam(g, dome, h, drips, t) {
  const { x, y, rx, ry } = POT;
  const P = new Path2D(), Q = new Path2D();
  const add = (cx, cy, r) => {
    P.moveTo(cx + r, cy); P.arc(cx, cy, r, 0, TAU);
    Q.moveTo(cx - r * 0.12 + r * 0.8, cy - r * 0.16); Q.arc(cx - r * 0.12, cy - r * 0.16, r * 0.8, 0, TAU);
  };
  for (const b of dome) {
    const r = b.r * clamp(h / 30 + 0.35, 0, 1) * (1 + 0.07 * Math.sin(t * 7 + b.ph));
    const bx = x + b.u * rx * 0.98, by = y + b.v * ry - h * b.lift * (1 - 0.55 * b.u * b.u) + 4;
    add(bx, by, r);
  }
  // a collar of foam lying over the front rim: the drips hang from it
  const ck = clamp(h / 22);
  for (let k = 0; k <= 10; k++) {
    const th = Math.PI * (0.06 + 0.88 * k / 10), r = (17 + 8 * hash(k, 81)) * ck;
    if (r > 1) add(x + rx * Math.cos(th) * 0.99, y + ry * Math.sin(th) + 2, r * (1 + 0.05 * Math.sin(t * 8 + k)));
  }
  for (const d of drips) {
    if (d.len <= 1) continue;
    const top = y + ry * Math.sqrt(Math.max(0, 1 - ((d.x - x) / rx) ** 2)) + 4, bot = top + d.len;
    // a tapered run: narrow under the collar, swelling into a bead at the tip
    // wound clockwise like the arcs: with the nonzero rule, opposite windings would cancel and punch holes in the union
    const Dr = new Path2D();
    Dr.moveTo(d.x - d.w * 0.32, top); Dr.lineTo(d.x + d.w * 0.32, top);
    Dr.quadraticCurveTo(d.x + d.w * 0.36, bot - d.w * 0.4, d.x + d.w * 0.5, bot);
    Dr.lineTo(d.x - d.w * 0.5, bot); Dr.quadraticCurveTo(d.x - d.w * 0.36, bot - d.w * 0.4, d.x - d.w * 0.32, top); Dr.closePath();
    P.addPath(Dr); Q.addPath(Dr);
    add(d.x, bot, d.w * 0.55);
  }
  g.lineJoin = 'round';
  g.lineWidth = 10; g.strokeStyle = C.ink; g.stroke(P);
  g.fillStyle = C.foamShade; g.fill(P);
  g.fillStyle = C.foam; g.fill(Q);
}

/** cartoon steam puff (ink outlined cloud) — the sizzle where foam hits the flame */
export function puff(g, x, y, s, seed) {
  if (s <= 0.5) return;
  const P = new Path2D();
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * TAU + hash(seed, k) * 0.6, r = s * (0.45 + 0.25 * hash(seed, k, 2));
    const cx = x + Math.cos(a) * s * 0.5, cy = y + Math.sin(a) * s * 0.36;
    P.moveTo(cx + r, cy); P.arc(cx, cy, r, 0, TAU);
  }
  g.lineWidth = 8; g.strokeStyle = C.ink; g.stroke(P);
  g.fillStyle = '#f2f5f8'; g.fill(P);
}

/** sweat drop icon: teardrop with a highlight */
export function sweat(g, x, y, s, a = 0) {
  g.save(); g.translate(x, y); g.rotate(a);
  g.beginPath(); g.moveTo(0, -s); g.bezierCurveTo(s * 0.25, -s * 0.45, s * 0.62, -s * 0.05, s * 0.6, s * 0.3);
  g.arc(0, s * 0.3, s * 0.6, 0, Math.PI, false); g.bezierCurveTo(-s * 0.62, -s * 0.05, -s * 0.25, -s * 0.45, 0, -s); g.closePath();
  fill(g, '#bfe4fb'); g.lineWidth = 5; g.strokeStyle = C.ink; g.lineJoin = 'round'; g.stroke();
  el(g, -s * 0.22, s * 0.25, s * 0.12, s * 0.2, -0.3); fill(g, '#ffffff');
  g.restore();
}
