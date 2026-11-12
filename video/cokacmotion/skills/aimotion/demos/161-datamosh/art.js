/*
 * art.js — the three illustrated shots, painted once in setup with Canvas 2D (rounded flat shapes, a few tokens).
 *
 *   A  still life: a vase of flowers on a gingham table      → bg (opaque) + flowers (alpha, sways about the vase mouth)
 *   B  koi pond seen from above                             → water (polar texture, rotated per radius in the shader),
 *                                                            pad/lotus atlas, koi atlas (straight; bent along the arc
 *                                                            in the shader), a static foreground branch
 *   C  turntable seen from above                            → plinth layer, record (spun in the shader), tonearm layer
 *
 * Every number that the motion-vector fields need (vortex centre, pad orbits, koi paths, branch mask, record centre,
 * tonearm) is exported from here so the painting and the vectors can never disagree.
 */
import { rand } from '../_lib/stage.js';

export const W = 1080, H = 1920, TAU = Math.PI * 2;

export const PAL = {
  ink: '#2c2f4e', cream: '#fff6e8', butter: '#f8e2a2', peach: '#f6bfa0', apricot: '#ef9f78',
  lilac: '#cbb9ee', peri: '#b7c4f2', mint: '#a6dcc8', sage: '#86b99a', leaf: '#5f9c7a',
  accent: '#ff2f87',
};

// ------------------------------------------------------------------------------------------------ shared geometry
export const A_PIVOT = [540, 1004];          // vase mouth: the flowers sway about it; the push-in centres on the bouquet
export const A_ZOOM_C = [540, 860];

export const B_C = [540, 930];               // vortex centre (stage px)
export const B_TEX = 2400;                   // the water texture covers a 2400 × 2400 px square around B_C
export const B_TEXPX = 1600;                 // … with 1600² texels
// pads and lotus flowers orbit the vortex: [radius, angle0, scale, atlas cell, own rotation]
export const PADS = [
  [215, 0.35, 0.80, 0, 0.4], [250, 3.30, 0.95, 1, 2.2], [400, 1.55, 1.25, 0, 1.0], [430, 4.55, 1.10, 2, 3.6],
  [470, 2.65, 0.85, 1, 0.2], [600, 0.10, 1.30, 2, 5.0], [640, 3.75, 1.20, 0, 2.7], [690, 5.45, 0.95, 1, 4.1],
  [760, 2.15, 1.35, 0, 0.9], [820, 4.35, 1.05, 2, 1.7], [850, 1.0, 0.9, 1, 3.0], [930, 3.05, 1.25, 1, 2.0],
  [400, 1.55, 0.62, 3, 0.3], [600, 0.10, 0.55, 3, 1.4], [760, 2.15, 0.50, 4, 0.6],
];
// the koi swim faster than the water, along circles around B_C: [radius, angle at t = 0, rad/s, scale, atlas row]
export const KOI = [[300, 1.25, 1.25, 0.8, 0], [545, 4.4, 0.86, 0.78, 1]];
export const KOI_NOSE = 610, KOI_TAIL = 40, KOI_ROW = 256;   // sprite x of the nose and the tail tip; atlas row height
// the overhanging branch (static foreground): an ellipse that also marks its zero-motion blocks
export const BRANCH = [990, 520, 300, 250];

export const C_C = [540, 900];               // record centre = push-in centre
export const REC_R = 390, LABEL_R = 128;     // record and label radius (scene px)
export const REC_TEX = 840;                  // record texture size
export const ARM = [[905, 455], [792, 1068]];// tonearm: pivot → stylus (scene px)

// ------------------------------------------------------------------------------------------------ helpers
export function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d', { willReadFrequently: true })];
}
const circ = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
const ell = (g, x, y, rx, ry, a = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, TAU); g.fill(); };
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
function leafShape(g, x0, y0, x1, y1, wd) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), nx = -dy / l * wd, ny = dx / l * wd;
  g.beginPath(); g.moveTo(x0, y0);
  g.quadraticCurveTo(mx + nx, my + ny, x1, y1);
  g.quadraticCurveTo(mx - nx, my - ny, x0, y0);
  g.fill();
}

// ================================================================================================ A · still life
function vasePath(g, dx = 0, dy = 0) {
  const x = 540 + dx, y = dy;
  g.beginPath();
  g.moveTo(x - 66, y + 1004);
  g.bezierCurveTo(x - 60, y + 1040, x - 52, y + 1062, x - 64, y + 1090);
  g.bezierCurveTo(x - 190, y + 1150, x - 200, y + 1290, x - 104, y + 1362);
  g.lineTo(x + 104, y + 1362);
  g.bezierCurveTo(x + 200, y + 1290, x + 190, y + 1150, x + 64, y + 1090);
  g.bezierCurveTo(x + 52, y + 1062, x + 60, y + 1040, x + 66, y + 1004);
  g.closePath();
}

export function paintA() {
  const [bc, g] = mk(W, H);
  // wall: warm cream with wide soft stripes
  g.fillStyle = '#fbe7cd'; g.fillRect(0, 0, W, 1200);
  for (let x = -30; x < W; x += 108) {
    g.fillStyle = '#f6dabd'; g.fillRect(x, 0, 46, 1200);
    g.fillStyle = '#fdf0dd'; g.fillRect(x + 21, 0, 4, 1200);
  }
  // window light: four panes of a parallelogram, cast from the upper left
  const pane = (x0, y0, x1, y1) => {
    const sk = 0.34;
    g.beginPath();
    g.moveTo(x0 + sk * (y0 - 120), y0); g.lineTo(x1 + sk * (y0 - 120), y0);
    g.lineTo(x1 + sk * (y1 - 120), y1); g.lineTo(x0 + sk * (y1 - 120), y1); g.fill();
  };
  g.fillStyle = 'rgba(255,251,240,0.42)';
  pane(-40, 120, 150, 560); pane(176, 120, 360, 560); pane(-40, 588, 150, 1030); pane(176, 588, 360, 1030);
  // a round framed picture
  g.fillStyle = 'rgba(176,120,86,0.18)'; circ(g, 874, 348, 104);
  g.fillStyle = PAL.lilac; circ(g, 862, 334, 104);
  g.fillStyle = '#fff8ec'; circ(g, 862, 334, 82);
  g.save(); g.beginPath(); g.arc(862, 334, 82, 0, TAU); g.clip();
  g.fillStyle = '#cfe6f6'; g.fillRect(760, 250, 210, 120);
  g.fillStyle = PAL.butter; circ(g, 896, 300, 26);
  g.fillStyle = PAL.mint; ell(g, 820, 400, 120, 58);
  g.fillStyle = PAL.sage; ell(g, 930, 418, 110, 52);
  g.restore();
  // skirting
  g.fillStyle = '#f1cfae'; g.fillRect(0, 1150, W, 34);
  g.fillStyle = '#f7dcc0'; g.fillRect(0, 1150, W, 6);

  // table: periwinkle gingham in perspective (vanishing point far above)
  const T0 = 1180, VP = [540, -900];
  g.fillStyle = '#bfcbf3'; g.fillRect(0, T0, W, H - T0);
  const xAt = (xb, y) => VP[0] + (xb - VP[0]) * (y - VP[1]) / (H - VP[1]);
  g.fillStyle = 'rgba(132,152,222,0.42)';
  for (let xb = -900; xb < 2000; xb += 150) {
    g.beginPath();
    g.moveTo(xAt(xb, T0), T0); g.lineTo(xAt(xb + 75, T0), T0); g.lineTo(xb + 75, H); g.lineTo(xb, H); g.fill();
  }
  const rows = [];
  for (let k = 0; k <= 14; k++) rows.push(T0 + (H - T0) * Math.pow(k / 10, 1.45));
  for (let k = 0; k + 1 < rows.length; k += 2) g.fillRect(0, rows[k], W, rows[k + 1] - rows[k]);
  g.fillStyle = '#dfe6fb'; g.fillRect(0, T0, W, 7);
  g.fillStyle = 'rgba(110,120,190,0.25)'; g.fillRect(0, T0 + 7, W, 4);

  // shadows of the vase: on the wall (offset right) and on the cloth
  g.save(); g.beginPath(); g.rect(0, 0, W, T0); g.clip();
  g.fillStyle = 'rgba(200,140,96,0.20)'; vasePath(g, 58, -40); g.fill();
  g.restore();
  g.fillStyle = 'rgba(70,82,150,0.22)'; ell(g, 600, 1366, 200, 34);

  // the vase: mint ceramic, a lilac band with cream dots, shade on the right, a highlight on the left
  g.save(); vasePath(g); g.fillStyle = '#a2dbc6'; g.fill(); g.clip();
  g.fillStyle = '#86c7b0'; vasePath(g, 70, 0); g.fill();
  g.fillStyle = PAL.lilac; g.fillRect(300, 1206, 480, 52);
  g.fillStyle = '#b5a2e2'; g.fillRect(540 + 70, 1206, 300, 52);
  g.fillStyle = '#fff6e8';
  for (let x = 380; x < 720; x += 44) circ(g, x, 1232, 7);
  g.fillStyle = 'rgba(255,255,255,0.45)'; rr(g, 426, 1112, 20, 196, 10);
  g.fillStyle = 'rgba(255,255,255,0.3)'; rr(g, 456, 1290, 14, 40, 7);
  g.restore();
  g.fillStyle = '#c4ece0'; ell(g, 540, 1004, 70, 16);
  g.fillStyle = '#5f9e8c'; ell(g, 540, 1006, 54, 10);

  // lemon (left) and teacup (right)
  g.fillStyle = 'rgba(70,82,150,0.2)'; ell(g, 262, 1478, 92, 18);
  g.fillStyle = '#f5d466'; ell(g, 250, 1432, 84, 58, -0.18);
  g.fillStyle = '#efc246'; ell(g, 268, 1446, 64, 40, -0.18);
  g.fillStyle = '#f5d466'; ell(g, 236, 1424, 60, 38, -0.18);
  g.fillStyle = '#fff1b8'; ell(g, 222, 1408, 22, 10, -0.5);
  g.fillStyle = '#e8b93c'; ell(g, 334, 1414, 12, 9, -0.2);
  g.fillStyle = PAL.sage; leafShape(g, 300, 1392, 380, 1350, 22);
  g.fillStyle = 'rgba(70,82,150,0.2)'; ell(g, 846, 1494, 150, 26);
  g.fillStyle = '#fffaf1'; ell(g, 830, 1474, 150, 36);
  g.fillStyle = '#efe3d0'; ell(g, 830, 1470, 104, 22);
  g.fillStyle = '#fffaf1';
  g.beginPath(); g.moveTo(742, 1352); g.lineTo(918, 1352); g.bezierCurveTo(912, 1430, 880, 1466, 830, 1466);
  g.bezierCurveTo(780, 1466, 748, 1430, 742, 1352); g.fill();
  g.strokeStyle = '#fffaf1'; g.lineWidth = 16;
  g.beginPath(); g.arc(924, 1398, 30, -1.2, 1.4); g.stroke();
  g.save(); g.beginPath(); g.moveTo(742, 1352); g.lineTo(918, 1352); g.bezierCurveTo(912, 1430, 880, 1466, 830, 1466);
  g.bezierCurveTo(780, 1466, 748, 1430, 742, 1352); g.clip();
  g.fillStyle = PAL.apricot; g.fillRect(700, 1384, 260, 22);
  g.fillStyle = 'rgba(160,130,110,0.16)'; g.fillRect(860, 1340, 80, 140);
  g.restore();
  g.fillStyle = '#f3e8d6'; ell(g, 830, 1352, 88, 16);
  g.fillStyle = '#d99d6e'; ell(g, 830, 1354, 76, 11);
  // a fallen petal
  g.fillStyle = PAL.apricot; ell(g, 660, 1452, 22, 12, 0.5);
  g.fillStyle = '#f6bfa0'; ell(g, 654, 1448, 14, 7, 0.5);

  // ---------------------------------------------------------------- flowers (own layer)
  const [fc, f] = mk(W, H);
  const stems = [[430, 640], [660, 560], [322, 820], [612, 770], [770, 660], [520, 470], [712, 860], [380, 520], [458, 860]];
  f.strokeStyle = '#6aa883'; f.lineCap = 'round'; f.lineWidth = 9;
  for (const [x, y] of stems) {
    f.beginPath(); f.moveTo(540 + (x - 540) * 0.08, 1012);
    f.quadraticCurveTo(540 + (x - 540) * 0.25, 860, x, y); f.stroke();
  }
  const leaves = [[500, 940, 360, 860, 34], [580, 930, 760, 900, 30], [520, 900, 420, 760, 24], [560, 880, 700, 760, 26], [548, 960, 640, 1000, 20], [530, 960, 430, 1000, 18]];
  for (const [x0, y0, x1, y1, wd] of leaves) {
    f.fillStyle = '#78b98d'; leafShape(f, x0, y0, x1, y1, wd);
    f.strokeStyle = 'rgba(220,245,225,0.55)'; f.lineWidth = 3;
    f.beginPath(); f.moveTo(x0, y0); f.lineTo(x0 + (x1 - x0) * 0.85, y0 + (y1 - y0) * 0.85); f.stroke();
  }
  const ranunculus = (x, y, r, c) => {
    f.fillStyle = 'rgba(120,70,50,0.12)'; circ(f, x + 6, y + 10, r);
    const ring = [c[0], c[1], c[0], c[2], c[1], c[2]];
    for (let i = 0; i < 6; i++) { f.fillStyle = ring[i]; circ(f, x + i * 2, y - i * 3, r * (1 - i * 0.15)); }
    f.strokeStyle = 'rgba(255,255,255,0.55)'; f.lineWidth = 4;
    for (let i = 1; i < 5; i++) { f.beginPath(); f.arc(x + i * 2, y - i * 3, r * (1 - i * 0.15) - 2, 3.6 + i * 0.5, 5.2 + i * 0.5); f.stroke(); }
  };
  const daisy = (x, y, r, rot) => {
    f.fillStyle = 'rgba(120,70,50,0.12)'; circ(f, x + 6, y + 8, r * 0.9);
    for (let i = 0; i < 14; i++) {
      const a = rot + i * TAU / 14;
      f.fillStyle = i % 2 ? '#fffaf1' : '#fbf0de';
      ell(f, x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.48, r * 0.17, a);
    }
    f.fillStyle = '#f2c24f'; circ(f, x, y, r * 0.28);
    f.fillStyle = '#e3a93a'; circ(f, x + 3, y + 3, r * 0.16);
  };
  const tulip = (x, y, r, c0, c1) => {
    f.fillStyle = 'rgba(120,70,50,0.12)'; ell(f, x + 6, y + 10, r * 0.8, r);
    f.fillStyle = c1; ell(f, x, y - r * 0.15, r * 0.62, r * 0.9);
    f.fillStyle = c0; ell(f, x - r * 0.32, y + r * 0.05, r * 0.5, r * 0.82, -0.25);
    f.fillStyle = c0; ell(f, x + r * 0.32, y + r * 0.05, r * 0.5, r * 0.82, 0.25);
    f.fillStyle = 'rgba(255,255,255,0.4)'; ell(f, x - r * 0.4, y - r * 0.15, r * 0.1, r * 0.4, -0.25);
  };
  const cluster = (x, y, r) => {
    const R = rand(Math.round(x * 7 + y));
    for (let i = 0; i < 9; i++) {
      const a = R() * TAU, d = Math.sqrt(R()) * r;
      const cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d;
      f.fillStyle = i % 3 ? PAL.lilac : '#b9a3e6';
      for (let k = 0; k < 5; k++) { const b = k * TAU / 5 + a; circ(f, cx + Math.cos(b) * 9, cy + Math.sin(b) * 9, 8); }
      f.fillStyle = '#fff3d6'; circ(f, cx, cy, 4);
    }
  };
  cluster(380, 520, 46); cluster(712, 860, 40);
  tulip(660, 560, 84, '#f8d870', '#ecbd4e');
  ranunculus(430, 640, 108, ['#ef9f78', '#f6bfa0', '#fbdcc6']);
  daisy(322, 820, 84, 0.2);
  ranunculus(612, 770, 72, ['#f6bfa0', '#fbdcc6', '#fff0e2']);
  daisy(770, 660, 64, 0.5);
  tulip(520, 470, 60, '#fbe0cf', '#f3c3a6');
  daisy(458, 860, 52, 0.9);
  // buds
  f.fillStyle = '#f6bfa0'; ell(f, 800, 520, 18, 26, 0.5); ell(f, 280, 660, 16, 24, -0.6);
  return { bg: bc, fl: fc };
}

// ================================================================================================ B · koi pond
export function paintB() {
  // ---- water: a polar picture around B_C (rotated per radius in the shader). RGB = water, A = surface highlights.
  const S = B_TEXPX / B_TEX, N = B_TEXPX, cx = N / 2, cy = N / 2;
  const [wc, w] = mk(N, N);
  const gr = w.createRadialGradient(cx, cy, 0, cx, cy, 1200 * S);
  gr.addColorStop(0, '#2f7d8c'); gr.addColorStop(0.18, '#3f939c'); gr.addColorStop(0.45, '#62b2ad');
  gr.addColorStop(0.75, '#86cbbd'); gr.addColorStop(1, '#a3dccb');
  w.fillStyle = gr; w.fillRect(0, 0, N, N);
  const R = rand(4242);
  // darker and lighter current bands: arcs along circles (the vortex slides them past each other)
  w.lineCap = 'round';
  for (let i = 0; i < 150; i++) {
    const r = (70 + Math.pow(R(), 0.8) * 1100) * S, a0 = R() * TAU, span = 0.25 + R() * 0.9;
    const dark = R() < 0.42;
    w.strokeStyle = dark ? `rgba(36,104,118,${0.18 + R() * 0.2})` : `rgba(200,240,226,${0.16 + R() * 0.24})`;
    w.lineWidth = (5 + R() * 16) * S;
    w.beginPath(); w.arc(cx, cy, r, a0, a0 + span); w.stroke();
  }
  // the funnel: three spiral arms
  for (let k = 0; k < 3; k++) {
    w.strokeStyle = 'rgba(150,215,206,0.35)'; w.lineWidth = 14 * S;
    w.beginPath();
    for (let s = 0; s <= 1; s += 0.01) {
      const r = (30 + 520 * s * s) * S, a = k * TAU / 3 + 5.2 * s;
      if (s === 0) w.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); else w.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    w.stroke();
  }
  // floating petals (cream) drift with the water
  for (let i = 0; i < 26; i++) {
    const r = (180 + R() * 950) * S, a = R() * TAU;
    w.fillStyle = R() < 0.5 ? '#fff4e4' : '#fbd8c4';
    ell(w, cx + r * Math.cos(a), cy + r * Math.sin(a), 13 * S, 7 * S, a + 1.2);
  }
  // alpha channel: surface highlights (thin bright arcs), painted on their own canvas
  const [hc, h] = mk(N, N);
  h.lineCap = 'round';
  for (let i = 0; i < 120; i++) {
    const r = (90 + Math.pow(R(), 0.7) * 1100) * S, a0 = R() * TAU, span = 0.08 + R() * 0.35;
    h.strokeStyle = `rgba(255,255,255,${0.35 + R() * 0.5})`; h.lineWidth = (3 + R() * 5) * S;
    h.beginPath(); h.arc(cx, cy, r, a0, a0 + span); h.stroke();
  }
  const wd = w.getImageData(0, 0, N, N), hd = h.getImageData(0, 0, N, N).data;
  for (let i = 0; i < N * N; i++) wd.data[i * 4 + 3] = hd[i * 4 + 3];

  // ---- pad atlas: 4 × 2 cells of 256 px (1 texel = 1 stage px at scale 1)
  const [pc, p] = mk(1024, 512);
  const pad = (ox, oy, base, rim, vein, notch) => {
    const x = ox + 128, y = oy + 128, r = 112;
    p.fillStyle = rim;
    p.beginPath(); p.moveTo(x, y); p.arc(x, y, r, notch + 0.2, notch + TAU - 0.2); p.closePath(); p.fill();
    p.fillStyle = base;
    p.beginPath(); p.moveTo(x, y); p.arc(x, y, r - 9, notch + 0.24, notch + TAU - 0.24); p.closePath(); p.fill();
    p.strokeStyle = vein; p.lineWidth = 3.2; p.lineCap = 'round';
    for (let a = notch + 0.6; a < notch + TAU - 0.4; a += 0.46) {
      p.beginPath(); p.moveTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); p.lineTo(x + Math.cos(a) * (r - 18), y + Math.sin(a) * (r - 18)); p.stroke();
    }
    p.fillStyle = 'rgba(255,255,255,0.22)';
    p.beginPath(); p.arc(x, y, r - 22, notch + 3.6, notch + 4.9); p.arc(x, y, r - 46, notch + 4.9, notch + 3.6, true); p.fill();
    p.fillStyle = vein; circ(p, x, y, 6);
  };
  pad(0, 0, '#8ccb98', '#6aae7e', '#acdcb2', 0.0);
  pad(256, 0, '#9bd08e', '#78b571', '#bfe3ad', 0.7);
  pad(512, 0, '#7fc2a0', '#5ea585', '#a3d8bd', -0.5);
  // lotus flower (cell 3) and bud (cell 4)
  {
    const x = 768 + 128, y = 128;
    p.fillStyle = 'rgba(30,80,70,0.18)'; circ(p, x + 6, y + 8, 92);
    for (let k = 0; k < 2; k++) {
      const n = k ? 7 : 9, rr0 = k ? 58 : 90, wdt = k ? 26 : 32;
      for (let i = 0; i < n; i++) {
        const a = i * TAU / n + k * 0.4;
        const px = x + Math.cos(a) * rr0 * 0.55, py = y + Math.sin(a) * rr0 * 0.55;
        p.fillStyle = k ? '#fff8ef' : '#fde9dc'; ell(p, px, py, rr0 * 0.5, wdt, a);
        p.fillStyle = k ? '#fbd7c2' : '#f6b998'; ell(p, x + Math.cos(a) * rr0 * 0.88, y + Math.sin(a) * rr0 * 0.88, rr0 * 0.13, wdt * 0.42, a);
      }
    }
    p.fillStyle = '#f6d469'; circ(p, x, y, 24);
    p.fillStyle = '#e8b947';
    for (let i = 0; i < 8; i++) { const a = i * TAU / 8; circ(p, x + Math.cos(a) * 12, y + Math.sin(a) * 12, 3.5); }
  }
  {
    const x = 128, y = 256 + 128;
    p.fillStyle = 'rgba(30,80,70,0.18)'; ell(p, x + 6, y + 8, 40, 62);
    p.fillStyle = '#fde4d4'; ell(p, x, y, 38, 62);
    p.fillStyle = '#f6b998'; ell(p, x, y - 30, 22, 30);
    p.fillStyle = '#fff6ee'; ell(p, x - 12, y + 6, 16, 44, -0.15);
  }

  // ---- koi atlas: 640 × 512, two rows; each koi faces +x, centreline at row + 128
  const [kc, k] = mk(640, 512);
  const XT = 150, XN = KOI_NOSE, WM = 66;
  const hw = (x) => {
    const s = (x - XT) / (XN - XT);
    if (s <= 0) return 13;
    if (s < 0.62) return 13 + (WM - 13) * Math.sin(Math.PI / 2 * s / 0.62);
    const q = (s - 0.62) / 0.38;
    return WM * Math.sqrt(Math.max(0, 1 - q * q * q * q * 0.98 - 0.02 * q));
  };
  const body = (oy) => {
    k.beginPath();
    for (let x = XT - 6; x <= XN; x += 4) k.lineTo(x, oy - hw(x));
    for (let x = XN; x >= XT - 6; x -= 4) k.lineTo(x, oy + hw(x));
    k.closePath();
  };
  const koi = (oy, cBody, cFin, patches, cPatch, cSheen) => {
    // tail fin and pectoral fins (translucent), under the body
    k.fillStyle = cFin;
    k.beginPath(); k.moveTo(XT + 20, oy - 10);
    k.quadraticCurveTo(90, oy - 30, KOI_TAIL, oy - 74); k.quadraticCurveTo(84, oy - 10, 66, oy);
    k.quadraticCurveTo(84, oy + 10, KOI_TAIL, oy + 74); k.quadraticCurveTo(90, oy + 30, XT + 20, oy + 10); k.fill();
    for (const sd of [-1, 1]) {
      k.beginPath(); k.moveTo(470, oy + sd * 40);
      k.quadraticCurveTo(440, oy + sd * 110, 392, oy + sd * 104); k.quadraticCurveTo(410, oy + sd * 70, 430, oy + sd * 44); k.fill();
      k.beginPath(); k.moveTo(250, oy + sd * 26);
      k.quadraticCurveTo(232, oy + sd * 66, 206, oy + sd * 62); k.quadraticCurveTo(214, oy + sd * 40, 226, oy + sd * 22); k.fill();
    }
    k.strokeStyle = 'rgba(255,255,255,0.5)'; k.lineWidth = 2;
    for (let i = -3; i <= 3; i++) { k.beginPath(); k.moveTo(XT, oy); k.lineTo(KOI_TAIL + 18, oy + i * 20); k.stroke(); }
    body(oy); k.fillStyle = cBody; k.fill();
    k.save(); body(oy); k.clip();
    k.fillStyle = cPatch;
    for (const [x, y, rx, ry, a] of patches) ell(k, x, oy + y, rx, ry, a);
    k.fillStyle = cSheen; ell(k, 380, oy, 190, 10);
    k.fillStyle = 'rgba(40,60,80,0.10)'; k.fillRect(0, oy + 30, 640, 60);
    k.restore();
    k.fillStyle = '#2c2f4e'; ell(k, 568, oy - 30, 6, 8); ell(k, 568, oy + 30, 6, 8);
  };
  koi(128, '#fffaf2', 'rgba(255,250,242,0.72)', [[500, -6, 72, 48, 0.2], [350, 20, 86, 40, -0.2], [236, -14, 52, 28, 0.3]], '#f3854a', 'rgba(255,255,255,0.5)');
  koi(384, '#f6c95e', 'rgba(252,230,170,0.72)', [[420, 0, 120, 30, 0], [270, 0, 80, 18, 0]], '#fbe3a0', 'rgba(255,248,220,0.55)');

  // ---- the overhanging branch (static, top right) with its shadow on the water
  const [tc, tg] = mk(W, H);
  const [bx, by, brx, bry] = BRANCH;
  const RB = rand(77);
  const twig = [[1100, 330], [960, 430], [820, 560], [760, 700]];
  const leavesB = [];
  for (let i = 0; i < 22; i++) {
    const s = RB(), seg = Math.min(2, Math.floor(s * 3)), f = s * 3 - seg;
    const [x0, y0] = twig[seg], [x1, y1] = twig[seg + 1];
    const x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f, a = 1.2 + (RB() - 0.5) * 2.4, l = 90 + RB() * 70;
    leavesB.push([x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, 22 + RB() * 12, RB() < 0.5]);
  }
  tg.save(); tg.beginPath(); tg.ellipse(bx, by, brx, bry, 0, 0, TAU); tg.clip();
  tg.fillStyle = 'rgba(20,70,80,0.26)';
  for (const [x0, y0, x1, y1, wdd] of leavesB) leafShape(tg, x0 - 40, y0 + 60, x1 - 40, y1 + 60, wdd);
  tg.strokeStyle = '#4c5f4a'; tg.lineWidth = 12; tg.lineCap = 'round';
  tg.beginPath(); tg.moveTo(twig[0][0], twig[0][1]);
  for (let i = 1; i < twig.length; i++) tg.lineTo(twig[i][0], twig[i][1]);
  tg.stroke();
  for (const [x0, y0, x1, y1, wdd, light] of leavesB) {
    tg.fillStyle = light ? '#4f9a74' : '#3a7d64'; leafShape(tg, x0, y0, x1, y1, wdd);
    tg.strokeStyle = 'rgba(190,235,205,0.45)'; tg.lineWidth = 2.5;
    tg.beginPath(); tg.moveTo(x0, y0); tg.lineTo(x0 + (x1 - x0) * 0.8, y0 + (y1 - y0) * 0.8); tg.stroke();
  }
  tg.restore();
  return { water: wd, pads: pc, koi: kc, top: tc };
}

// ================================================================================================ C · turntable
export function paintC(fontKR) {
  const [bc, g] = mk(W, H);   // plinth layer (alpha), scene px
  // soft layered shadow under the plinth
  for (let i = 6; i >= 1; i--) { g.fillStyle = `rgba(60,46,110,${0.035})`; rr(g, 104 + 16 - i * 5, 330 + 26 - i * 5, 866 + i * 10, 1096 + i * 10, 60 + i * 5); }
  g.fillStyle = '#f2d48e'; rr(g, 104, 324, 872, 1106, 58);
  g.fillStyle = '#f8e2a6'; rr(g, 104, 318, 866, 1096, 56);
  g.fillStyle = '#fbebc2'; rr(g, 122, 336, 830, 1060, 44);
  // the well and the platter rim
  g.fillStyle = '#e8c987'; circ(g, C_C[0], C_C[1], 420);
  g.fillStyle = '#d6d2ea'; circ(g, C_C[0], C_C[1], 406);
  g.strokeStyle = '#c2bde0'; g.lineWidth = 3;
  for (const r of [398, 384]) { g.beginPath(); g.arc(C_C[0], C_C[1], r, 0, TAU); g.stroke(); }
  // controls
  g.fillStyle = '#fff6e6'; rr(g, 168, 1318, 92, 46, 23); rr(g, 276, 1318, 92, 46, 23);
  g.fillStyle = PAL.ink; g.font = `800 24px ${fontKR}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('33', 214, 1342); g.fillText('45', 322, 1342);
  g.fillStyle = '#e8c987'; circ(g, 868, 1338, 44);
  g.fillStyle = '#fff6e6'; circ(g, 864, 1334, 38);
  g.fillStyle = PAL.ink; rr(g, 861, 1302, 6, 24, 3);
  g.fillStyle = '#8fd9bf'; circ(g, 780, 1340, 11);
  g.fillStyle = 'rgba(143,217,191,0.3)'; circ(g, 780, 1340, 20);
  // a sleeve under the plinth's lower left corner
  {
    const [sc, s] = mk(W, H);
    s.translate(130, 1560); s.rotate(-0.12);
    s.fillStyle = 'rgba(60,46,110,0.12)'; rr(s, -144, -140, 300, 300, 10);
    s.save(); s.beginPath(); s.roundRect(-150, -150, 300, 300, 10); s.clip();
    s.fillStyle = '#fbf3e6'; s.fillRect(-150, -150, 300, 300);
    s.fillStyle = '#a6dcc8'; for (let i = 0; i < 5; i++) s.fillRect(-150, -130 + i * 60, 300, 26);
    s.fillStyle = '#f6bfa0'; circ(s, -30, 60, 74);
    s.fillStyle = '#fbf3e6'; circ(s, -30, 60, 10);
    s.restore();
    g.globalCompositeOperation = 'destination-over'; g.drawImage(sc, 0, 0); g.globalCompositeOperation = 'source-over';
  }

  // record: vinyl with grooves and track gaps, label with the song (spun in the shader)
  const [rc, r] = mk(REC_TEX, REC_TEX);
  const o = REC_TEX / 2;
  r.fillStyle = '#2b2e4c'; circ(r, o, o, REC_R);
  r.lineWidth = 1.4;
  for (let rad = LABEL_R + 26; rad < REC_R - 6; rad += 3.2) {
    r.strokeStyle = (Math.floor(rad / 3.2) % 2) ? 'rgba(80,86,130,0.55)' : 'rgba(20,22,40,0.5)';
    r.beginPath(); r.arc(o, o, rad, 0, TAU); r.stroke();
  }
  r.strokeStyle = '#22253f'; r.lineWidth = 5;
  for (const rad of [196, 252, 300, 344]) { r.beginPath(); r.arc(o, o, rad, 0, TAU); r.stroke(); }
  r.strokeStyle = '#3a3e62'; r.lineWidth = 6;
  r.beginPath(); r.arc(o, o, REC_R - 3, 0, TAU); r.stroke();
  // a soft scuff so the spin reads on the vinyl too
  r.strokeStyle = 'rgba(150,156,200,0.35)'; r.lineWidth = 3;
  r.beginPath(); r.arc(o, o, 280, 0.4, 0.9); r.stroke();
  r.beginPath(); r.arc(o, o, 230, 3.5, 3.8); r.stroke();
  r.fillStyle = '#f6bfa0'; circ(r, o, o, LABEL_R);
  r.fillStyle = '#ef9f78';
  r.beginPath(); r.arc(o, o, LABEL_R, 0, TAU); r.arc(o, o, LABEL_R - 16, 0, TAU, true); r.fill();
  r.fillStyle = '#fff6e8';
  r.beginPath(); r.moveTo(o, o); r.arc(o, o, LABEL_R - 16, -2.3, -0.84); r.closePath(); r.fill();
  r.fillStyle = PAL.ink; r.textAlign = 'center'; r.textBaseline = 'middle';
  r.font = `900 30px ${fontKR}`; r.fillText('녹는 여름', o, o + 42);
  r.font = `700 17px ${fontKR}`; r.fillText('B면 · 33 RPM', o, o + 76);
  r.fillStyle = '#d8d6ea'; circ(r, o, o, 8);

  // tonearm layer: rest, pivot, counterweight, arm, headshell, spindle; shadow first
  const [ac, a] = mk(W, H);
  const [[px, py], [sx, sy]] = ARM;
  const arm = (dx, dy, col, colHead) => {
    a.strokeStyle = col; a.lineCap = 'round'; a.lineWidth = 18;
    a.beginPath(); a.moveTo(px + dx, py + dy); a.lineTo(sx + dx - 18, sy + dy - 70); a.lineTo(sx + dx, sy + dy - 18); a.stroke();
    a.save(); a.translate(sx + dx, sy + dy); a.rotate(0.25); a.fillStyle = colHead; rr(a, -26, -40, 52, 74, 12); a.restore();
    a.fillStyle = col; rr(a, px + dx - 26, py + dy - 120, 52, 70, 16);
    circ(a, px + dx, py + dy, 52);
  };
  arm(16, 22, 'rgba(50,40,90,0.2)', 'rgba(50,40,90,0.2)');
  arm(0, 0, '#f4f0e8', PAL.ink);
  a.fillStyle = '#d9d4c8'; circ(a, px, py, 34);
  a.fillStyle = '#f4f0e8'; circ(a, px, py, 20);
  a.fillStyle = '#c8c2b4'; rr(a, px - 22, py - 112, 44, 10, 5);
  a.strokeStyle = 'rgba(160,150,140,0.6)'; a.lineWidth = 3; a.lineCap = 'round';
  a.beginPath(); a.moveTo(px - 4, py + 40); a.lineTo(sx - 22, sy - 76); a.stroke();
  a.fillStyle = '#e8c987'; rr(a, 940, 860, 26, 70, 13);
  a.fillStyle = '#fff6e6'; rr(a, 944, 864, 18, 30, 9);
  a.fillStyle = '#c9c6dc'; circ(a, C_C[0], C_C[1], 12);
  a.fillStyle = '#f2f0fa'; circ(a, C_C[0] - 3, C_C[1] - 3, 6);
  return { base: bc, rec: rc, arm: ac };
}
