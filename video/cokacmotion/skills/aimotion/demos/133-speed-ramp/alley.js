/*
 * alley.js — the alley after the rain: a pinhole camera that slides along the run, and the layers it sees.
 *
 * Ground plane, camera height HC, focal F, horizon YH. A point x (world, px at the run's depth ZT), height h, depth Z
 * lands on screen at   sx = 540 + (x − cx)·F/Z,   sy = YH + (HC − h)·F/Z.
 * Each vertical layer moves at its own rate F/Z (the far wall 0.6, distant roofs 0.25, near props 1.95), and the
 * ground plane — every depth at once — moves by the shear  sx′ = sx − cx·(sy − YH)/HC,  one affine drawImage.
 * A horizontal mirror flips every point about its own ground line: the far wall's reflection is the wall flipped
 * about its base (y = 930), the kid's about the line his wheels roll on (y = 1250).
 */
import { clamp, lerp, smooth } from '../_lib/stage.js';
import { V } from './kid.js';

export const W = 1080, H = 1920;
export const F = 1160, HC = 800, YH = 450, ZT = F;
export const YG = YH + (HC * F) / ZT;                 // 1250: the line the wheels roll on
export const WALL_F = 0.6, YWB = YH + HC * WALL_F;    // the far wall stands on y = 930
export const FAR_F = 0.25, FG_F = 1.95;
export const proj = (x, h, Z, cx) => [540 + ((x - cx) * F) / Z, YH + ((HC - h) * F) / Z, F / Z];

const SI = (u) => u * u * u - 0.5 * u * u * u * u;
const Sm = (u) => u * u * (3 - 2 * u);

/**
 * Camera: locked to the kid (who rolls at V), then a smoothstep brake that ends exactly at the frozen frame, so
 * the freeze and everything after it is shot from a still camera.  cx(τ) = V·τ, then V·[A + D(u − ∫S)].
 */
export function makeCamera(tauFreeze) {
  const A = tauFreeze - 0.4, D = 0.4;
  return {
    A, D,
    x(tau) { if (tau <= A) return V * tau; const u = Math.min(1, (tau - A) / D); return V * (A + D * (u - SI(u))); },
    v(tau) { if (tau <= A) return V; const u = Math.min(1, (tau - A) / D); return V * (1 - Sm(u)); },
    max: V * (A + D / 2),
  };
}

let CPU = false;
export function setCPU(v) { CPU = v; }
export function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  const g = c.getContext('2d', CPU ? { willReadFrequently: true } : undefined);
  return { c, g };
}

// ---------------------------------------------------------------- noise
function hash2(ix, iy) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x, y) => 0.55 * vnoise(x, y) + 0.3 * vnoise(x * 2.1 + 5.2, y * 2.1 + 1.7) + 0.15 * vnoise(x * 4.3 + 9.1, y * 4.3 + 3.3);

// ---------------------------------------------------------------- palette (wet blue-grey, ink)
export const C = {
  ink: '#1b2230', inkSoft: '#2a3444',
  skyTop: '#91a7ba', skyMid: '#b2c1cd', skyLow: '#d9e1e7', skyHor: '#e6ebef',
  far1: '#b7c4cf', far2: '#9eafbe', farWin: '#8e9fb0',
  wallA: '#6d8092', wallB: '#7b8d9d', wallC: '#62768a', wallD: '#8495a4', wallE: '#5b6f83',
  trim: '#8fa0ae', trimDark: '#4b5d70', glass: '#b6c6d2', glassDark: '#3e5063',
  cream: '#eef0ee', acc: '#ffc83d',
};

// ---------------------------------------------------------------- sky + clouds
export function bakeSky() {
  const { c, g } = mk(W, 760);
  const gr = g.createLinearGradient(0, 0, 0, 760);
  gr.addColorStop(0, C.skyTop); gr.addColorStop(0.32, C.skyMid); gr.addColorStop(0.7, C.skyLow); gr.addColorStop(1, C.skyHor);
  g.fillStyle = gr; g.fillRect(0, 0, W, 760);
  const sun = g.createRadialGradient(830, 150, 0, 830, 150, 460);
  sun.addColorStop(0, 'rgba(255,253,244,0.62)'); sun.addColorStop(0.35, 'rgba(250,250,244,0.22)'); sun.addColorStop(1, 'rgba(250,250,244,0)');
  g.fillStyle = sun; g.fillRect(0, 0, W, 760);
  return c;
}

export function bakeClouds(r) {
  const out = [];
  for (let k = 0; k < 6; k++) {
    const w = 520 + r() * 260, h = 200 + r() * 60;
    const { c, g } = mk(w + 80, h + 80);
    g.filter = 'blur(7px)';
    const n = 7 + Math.floor(r() * 4);
    const blobs = [];
    for (let i = 0; i < n; i++) {
      const x = 40 + w * (0.1 + 0.8 * (i / (n - 1))) + (r() - 0.5) * 50;
      const rr = 40 + r() * 70 * (1 - Math.abs(i / (n - 1) - 0.5));
      blobs.push([x, 40 + h - 40 - rr * 0.7 - r() * 30, rr]);
    }
    g.fillStyle = 'rgba(176,192,206,0.9)';
    for (const [x, y, rr] of blobs) { g.beginPath(); g.arc(x + 6, y + 14, rr, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = 'rgba(234,239,243,0.95)';
    for (const [x, y, rr] of blobs) { g.beginPath(); g.arc(x, y, rr * 0.94, 0, Math.PI * 2); g.fill(); }
    g.filter = 'none';
    out.push({ c, x0: -260 + k * 300 + r() * 120, y: -40 + r() * 230, a: 0.55 + r() * 0.35, sp: 10 + r() * 14 });
  }
  return out;
}

// ---------------------------------------------------------------- distant roofs (f = 0.25)
export function bakeFar(r, camMax) {
  const FW = Math.ceil(W + FAR_F * camMax + 40), FH = 470;
  const { c, g } = mk(FW, FH);
  const row = (col, winCol, y0, y1, wmin, wmax, haze) => {
    let x = -20;
    while (x < FW) {
      const w = wmin + r() * (wmax - wmin), top = y0 + r() * (y1 - y0);
      g.fillStyle = col; g.fillRect(x, top, w + 1, FH - top);
      // window grid
      g.fillStyle = winCol;
      const cols = Math.max(2, Math.floor(w / 26)), rows = Math.floor((FH - top - 20) / 30);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        if (r() < 0.25) continue;
        g.fillRect(x + 10 + i * (w - 16) / cols, top + 18 + j * 30, (w - 16) / cols - 9, 13);
      }
      if (r() < 0.35) {                       // rooftop water tank
        const tx = x + w * (0.2 + r() * 0.5);
        g.fillStyle = col; g.fillRect(tx, top - 34, 46, 34); g.fillRect(tx + 4, top - 42, 38, 10);
        g.fillRect(tx + 6, top - 4, 3, 4);
      }
      if (r() < 0.3) { g.fillStyle = col; g.fillRect(x + w * 0.7, top - 60, 3, 60); g.fillRect(x + w * 0.7 - 14, top - 52, 31, 2.5); }
      x += w + 6 + r() * 30;
    }
    const hz = g.createLinearGradient(0, y0, 0, FH);
    hz.addColorStop(0, `rgba(214,223,230,${haze})`); hz.addColorStop(1, `rgba(214,223,230,${haze + 0.25})`);
    g.fillStyle = hz; g.fillRect(0, y0 - 60, FW, FH);
  };
  row(C.far1, '#adbbc7', 150, 270, 90, 210, 0.25);
  row(C.far2, C.farWin, 250, 360, 70, 160, 0.12);
  return c;
}

// ---------------------------------------------------------------- the far wall (f = 0.6)
// Drawn in a layout space laid out for a wall standing on y = 1050 at f = 0.75, then mapped onto the real wall
// (f = 0.6, base y = 930) by one scale about the base: x → 0.8x, y → 930 − 0.8(1050 − y).
export const WALL_Y0 = 0;
export function bakeWall(r, camMax, font) {
  const WW = Math.ceil(W + WALL_F * camMax + 40), WH = YWB - WALL_Y0;
  const { c, g } = mk(WW, WH);
  const SC = WALL_F / 0.75, OB = 1050;
  g.setTransform(SC, 0, 0, SC, 10 - 10 * SC, YWB - OB * SC - WALL_Y0 + 120 * SC);
  const LW = (WW - 10) / SC + 10;
  const X = (x) => x + 10, Y = (y) => y - 120;      // layout space → pre-scale canvas
  const rect = (x0, y0, x1, y1, col) => { g.fillStyle = col; g.fillRect(X(x0), Y(y0), x1 - x0, y1 - y0); };
  const rr = (x0, y0, x1, y1, rad, col) => { g.fillStyle = col; g.beginPath(); g.roundRect(X(x0), Y(y0), x1 - x0, y1 - y0, rad); g.fill(); };

  const B = [
    { x0: -10, x1: 520, top: 330, col: C.wallA },
    { x0: 520, x1: 900, top: -240, col: C.wallC, tile: true },
    { x0: 900, x1: 1460, top: 360, col: C.wallB },
    { x0: 1460, x1: 2160, top: 310, col: C.wallD },
    { x0: 2160, x1: 2840, top: 300, col: C.wallA },
    { x0: 2840, x1: LW, top: -240, col: C.wallE, tile: true },
  ];
  for (const b of B) {
    rect(b.x0, b.top, b.x1, OB, b.col);
    const gr = g.createLinearGradient(0, Y(Math.max(b.top, 0)), 0, Y(OB));
    gr.addColorStop(0, 'rgba(255,255,255,0.10)'); gr.addColorStop(0.55, 'rgba(255,255,255,0)'); gr.addColorStop(0.86, 'rgba(10,20,32,0.10)'); gr.addColorStop(1, 'rgba(10,20,32,0.34)');
    g.fillStyle = gr; g.fillRect(X(b.x0), Y(b.top), b.x1 - b.x0, OB - b.top);
    if (b.tile) {
      g.fillStyle = 'rgba(20,32,46,0.10)';
      for (let y = b.top + 20; y < OB; y += 34) g.fillRect(X(b.x0), Y(y), b.x1 - b.x0, 2);
      for (let y = b.top + 20, k = 0; y < OB; y += 34, k++) for (let x = b.x0 + (k % 2) * 40; x < b.x1; x += 80) g.fillRect(X(x), Y(y), 2, 34);
    } else {
      for (let i = 0; i < (b.x1 - b.x0) / 6; i++) {
        g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(10,20,30,0.06)';
        const x = b.x0 + r() * (b.x1 - b.x0), y = b.top + 20 + r() * (OB - b.top - 20);
        g.beginPath(); g.arc(X(x), Y(y), 2 + r() * 7, 0, Math.PI * 2); g.fill();
      }
      rect(b.x0, b.top - 14, b.x1, b.top + 4, C.trim);
      rect(b.x0, b.top + 4, b.x1, b.top + 12, 'rgba(10,20,32,0.18)');
    }
    rect(b.x1 - 3, b.top, b.x1, OB, 'rgba(10,20,32,0.16)');
  }

  const streak = (x, y0, len, w = 10, a = 0.16) => {
    const gr = g.createLinearGradient(0, Y(y0), 0, Y(y0 + len));
    gr.addColorStop(0, `rgba(16,26,38,${a})`); gr.addColorStop(1, 'rgba(16,26,38,0)');
    g.fillStyle = gr; g.fillRect(X(x), Y(y0), w, len);
  };
  const plant = (px, py, s, col, n = 8, pot = '#6f7f8e') => {
    g.fillStyle = col;
    for (let i = 0; i < n; i++) { const a = Math.PI * (0.1 + 0.8 * i / (n - 1)); g.beginPath(); g.ellipse(X(px + Math.cos(a) * 30 * s), Y(py - Math.sin(a) * 40 * s), 12 * s, 24 * s, a - Math.PI / 2, 0, Math.PI * 2); g.fill(); }
    rr(px - 24 * s, py - 16, px + 24 * s, py + 6, 4, pot);
  };
  const cable = (x0, x1, y, sag) => { g.strokeStyle = 'rgba(28,38,52,0.75)'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(x0), Y(y)); g.quadraticCurveTo(X((x0 + x1) / 2), Y(y + sag * 2), X(x1), Y(y)); g.stroke(); };
  const glass = (x0, y0, x1, y1) => {
    const gl = g.createLinearGradient(X(x0), Y(y0), X(x1), Y(y1)); gl.addColorStop(0, 'rgba(255,255,255,0.38)'); gl.addColorStop(0.55, 'rgba(255,255,255,0)');
    g.fillStyle = gl; g.fillRect(X(x0), Y(y0), x1 - x0, y1 - y0);
  };

  // 1 — garage: rolling shutter
  rect(60, 650, 460, 690, C.trimDark);
  rect(70, 690, 450, OB, '#8a9bab');
  for (let y = 700; y < OB; y += 15) { rect(70, y, 450, y + 2.5, 'rgba(30,44,58,0.28)'); rect(70, y + 3, 450, y + 4.5, 'rgba(255,255,255,0.12)'); }
  rect(70, OB - 26, 450, OB - 18, '#5f7184');
  rr(238, OB - 60, 282, OB - 46, 4, C.trimDark);
  rr(472, 470, 508, 520, 4, C.trimDark);
  for (let y = 476; y < 516; y += 8) rect(476, y, 504, y + 3, '#7d8fa0');
  streak(90, 690, 120, 360, 0.1);
  cable(-10, 520, 360, 30);

  // 2 — tiled two-storey: barred windows, drainpipe, meter
  for (const wy of [-60, 420]) {
    rr(585, wy, 835, wy + 230, 6, C.trimDark); rr(595, wy + 10, 825, wy + 220, 3, C.glass); glass(595, wy + 10, 825, wy + 220);
    for (let x = 612; x < 825; x += 26) rect(x, wy + 10, x + 5, wy + 220, '#3c4c5e');
    rect(585, wy + 230, 835, wy + 242, C.trim); streak(600, wy + 242, 150, 220, 0.14);
  }
  rr(560, 760, 640, 860, 6, '#8797a6'); rr(572, 772, 628, 812, 3, '#2e3b4b'); rect(596, 860, 600, OB, '#4a5a6b');
  rect(872, -240, 888, OB, '#55677a'); rect(870, 300, 890, 310, '#46576a'); rect(870, 700, 890, 710, '#46576a');
  rr(866, OB - 30, 900, OB, 4, '#46576a');

  // 3 — the closed shop: door with an awning, window with pots, a hanging AC
  rr(975, 690, 1115, OB, 6, '#4b5f73'); rr(990, 712, 1100, 860, 4, C.glass); glass(990, 712, 1100, 860);
  rr(1076, 880, 1092, 900, 3, '#c7d0d8');
  g.fillStyle = '#3f5164'; g.beginPath(); g.moveTo(X(955), Y(680)); g.lineTo(X(1135), Y(680)); g.lineTo(X(1125), Y(645)); g.lineTo(X(965), Y(645)); g.fill();
  rr(1175, 545, 1405, 810, 6, C.trimDark); rr(1186, 556, 1394, 799, 3, '#c3d0da'); glass(1186, 556, 1394, 799);
  rect(1290, 556, 1296, 799, C.trimDark);
  rect(1165, 810, 1415, 824, C.trim); streak(1185, 824, 130, 210, 0.13);
  for (const [px, s] of [[1210, 1], [1290, 0.85], [1360, 1.1]]) plant(px, 806, s * 0.85, '#5d6f62', 7, '#8b6f5e');
  rr(1230, 405, 1365, 495, 8, '#a3b1bd'); g.strokeStyle = '#6b7a89'; g.lineWidth = 3;
  g.beginPath(); g.arc(X(1268), Y(450), 30, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(X(1268), Y(450)); g.lineTo(X(1268 + 28 * Math.cos(i * 1.57 + 0.4)), Y(450 + 28 * Math.sin(i * 1.57 + 0.4))); g.stroke(); }
  for (let y = 420; y < 485; y += 9) rect(1312, y, 1352, y + 4, '#8394a3');
  rect(1240, 495, 1246, 520, '#5c6b7a'); rect(1350, 495, 1356, 520, '#5c6b7a');
  streak(1300, 495, 60, 6, 0.25);

  // 4 — plaster: pipe, a small barred window, meter, crates
  rect(1520, 310, 1534, OB, '#5e7083');
  rr(1600, 610, 1660, 690, 5, '#9aa9b6'); rr(1608, 622, 1652, 640, 2, '#4f6072');
  rr(1760, 430, 1960, 560, 5, C.trimDark); rr(1770, 440, 1950, 550, 3, C.glass); glass(1770, 440, 1950, 550);
  for (let x = 1784; x < 1950; x += 24) rect(x, 440, x + 4, 550, '#3c4c5e');
  rect(1752, 560, 1968, 570, C.trim); streak(1770, 570, 120, 180, 0.12);
  for (const [cx0, cy0] of [[1840, OB - 110], [1880, OB - 220], [1925, OB - 110], [2015, OB - 110]]) {
    rr(cx0 - 2, cy0, cx0 + 92, cy0 + 106, 6, '#53677c');
    for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) rr(cx0 + 10 + i * 20, cy0 + 16 + j * 28, cx0 + 22 + i * 20, cy0 + 34 + j * 28, 3, '#3e4f62');
    rect(cx0 - 2, cy0, cx0 + 92, cy0 + 8, '#6b7f93');
  }
  streak(1470, 330, 200, 680, 0.08);
  cable(1460, 2160, 345, 30);

  // 5 — the umbrella repair shop (behind the jump): lamp, sign, big window
  const LX = 2215, LY = 470;
  rr(2275, 560, 2765, 930, 8, C.trimDark);
  rr(2289, 574, 2751, 916, 4, '#d6dfe5');
  {
    const gl = g.createLinearGradient(0, Y(574), 0, Y(916)); gl.addColorStop(0, 'rgba(255,255,255,0.35)'); gl.addColorStop(1, 'rgba(120,140,160,0.25)');
    g.fillStyle = gl; g.fillRect(X(2289), Y(574), 462, 342);
    rect(2289, 760, 2751, 768, '#9aa8b5'); rect(2289, 850, 2751, 858, '#9aa8b5');
    const cols = ['#5b7187', '#2f3d4f', '#7d93a6', '#4a6a72', '#a7b3be'];
    for (let i = 0; i < 10; i++) {
      const ux = 2322 + i * 44 + (i % 2) * 6, uy = 600 + (i % 3) * 14, col = cols[i % cols.length];
      g.strokeStyle = '#6f7f8f'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(ux), Y(574)); g.lineTo(X(ux), Y(uy)); g.stroke();
      if (i % 3 === 1) { g.fillStyle = col; g.beginPath(); g.arc(X(ux), Y(uy + 34), 32, Math.PI, 0); g.fill(); g.fillRect(X(ux) - 1.5, Y(uy + 34), 3, 46); }
      else { g.fillStyle = col; g.beginPath(); g.moveTo(X(ux - 9), Y(uy + 8)); g.lineTo(X(ux + 9), Y(uy + 8)); g.lineTo(X(ux + 3), Y(uy + 120)); g.lineTo(X(ux - 3), Y(uy + 120)); g.fill(); }
    }
    for (let i = 0; i < 7; i++) rr(2310 + i * 64, 800, 2350 + i * 64, 850, 4, ['#7b8fa2', '#55697e', '#97a7b5'][i % 3]);
    const gl2 = g.createLinearGradient(X(2289), Y(574), X(2751), Y(916)); gl2.addColorStop(0, 'rgba(255,255,255,0.45)'); gl2.addColorStop(0.35, 'rgba(255,255,255,0.05)'); gl2.addColorStop(0.6, 'rgba(255,255,255,0.2)'); gl2.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gl2; g.fillRect(X(2289), Y(574), 462, 342);
  }
  rect(2516, 574, 2524, 916, C.trimDark);
  rect(2265, 930, 2775, 944, C.trim); streak(2285, 944, 100, 460, 0.12);
  rr(2390, 470, 2650, 535, 10, C.cream);
  rr(2390, 527, 2650, 535, 4, 'rgba(30,40,55,0.14)');
  g.fillStyle = C.ink; g.font = `800 40px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('우산 고쳐요', X(2520), Y(503));
  rect(LX - 3, LY - 50, LX + 3, LY - 10, '#3a4a5c'); rect(LX - 3, LY - 52, LX + 30, LY - 46, '#3a4a5c');
  rr(LX - 22, LY - 12, LX + 22, LY + 6, 6, '#3a4a5c');
  rr(LX - 14, LY + 4, LX + 14, LY + 26, 10, '#fbf6e9');
  const glo = g.createRadialGradient(X(LX), Y(LY + 16), 0, X(LX), Y(LY + 16), 190);
  glo.addColorStop(0, 'rgba(255,250,236,0.6)'); glo.addColorStop(0.3, 'rgba(255,250,236,0.17)'); glo.addColorStop(1, 'rgba(255,250,236,0)');
  g.fillStyle = glo; g.fillRect(X(LX - 190), Y(LY - 174), 380, 380);
  cable(2160, 2840, 330, 34); cable(2160, 2840, 344, 22);
  for (const [px, s] of [[2290, 1], [2350, 0.8], [2790, 0.9]]) plant(px, 292, s, '#4d6152');

  // 6 — tiled two-storey: door with steps, window with curtains, pipe, a pot by the door
  rect(2852, -240, 2866, OB, '#4d5f72');
  rr(2920, 690, 3060, OB - 20, 6, '#3f5164'); rr(2934, 706, 3046, 840, 4, C.glass); glass(2934, 706, 3046, 840); rect(2988, 706, 2992, 840, '#3f5164');
  rr(3032, 880, 3044, 900, 3, '#c7d0d8');
  rect(2900, OB - 22, 3080, OB - 8, '#8a9aa8'); rect(2890, OB - 10, 3090, OB, '#7a8a99');
  for (const wy of [-40, 470]) {
    rr(3110, wy, 3300, wy + 250, 6, C.trimDark); rr(3122, wy + 12, 3290, wy + 238, 3, '#c9d5de');
    g.fillStyle = '#9fb0bf'; g.beginPath(); g.moveTo(X(3122), Y(wy + 12)); g.quadraticCurveTo(X(3170), Y(wy + 130), X(3150), Y(wy + 238)); g.lineTo(X(3122), Y(wy + 238)); g.fill();
    rect(3102, wy + 250, 3310, wy + 262, C.trim); streak(3120, wy + 262, 150, 170, 0.13);
  }
  plant(3086, OB - 6, 1.15, '#56695b', 9, '#7b6a5f');

  // wet base along the whole wall
  const base = g.createLinearGradient(0, Y(OB - 90), 0, Y(OB));
  base.addColorStop(0, 'rgba(16,26,40,0)'); base.addColorStop(1, 'rgba(16,26,40,0.38)');
  g.fillStyle = base; g.fillRect(0, Y(OB - 90), LW + 20, 90);
  for (let x = 0; x < LW; x += 6 + r() * 20) streak(x, OB - 70 - r() * 60, 40 + r() * 70, 3 + r() * 6, 0.07 + r() * 0.08);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return { c, x0: -10, y0: WALL_Y0 };
}

/** the wall seen in the wet ground: flipped about its base, smeared down (rain-wet asphalt), darker */
export function bakeWallRefl(wall) {
  const WW = wall.c.width, RH = H - YWB;
  const { c, g } = mk(WW, RH);
  // the high sky, seen past the roofs near the camera
  const sk = g.createLinearGradient(0, 0, 0, RH);
  sk.addColorStop(0, '#9fb1c1'); sk.addColorStop(1, '#7d93a6');
  g.fillStyle = sk; g.fillRect(0, 0, WW, RH);
  g.setTransform(1, 0, 0, -1, 0, YWB - wall.y0);
  g.drawImage(wall.c, 0, 0);
  g.setTransform(1, 0, 0, 1, 0, 0);
  // streak: average of copies shifted down (a one-sided vertical box blur)
  const { c: tmp, g: tg } = mk(WW, RH);
  tg.drawImage(c, 0, 0);
  for (let i = 1; i < 10; i++) { g.globalAlpha = 1 / (i + 1); g.drawImage(tmp, 0, i * 3.2); }
  g.globalAlpha = 1;
  tg.clearRect(0, 0, WW, RH); tg.filter = 'blur(2.5px)'; tg.drawImage(c, 0, 0); tg.filter = 'none';
  g.clearRect(0, 0, WW, RH); g.drawImage(tmp, 0, 0);
  g.globalCompositeOperation = 'destination-over';          // the blur thinned the edges: back them with the wall's base tone
  g.fillStyle = '#566a7d'; g.fillRect(0, 0, WW, RH);
  g.globalCompositeOperation = 'multiply';
  const dk = g.createLinearGradient(0, 0, 0, RH);
  dk.addColorStop(0, '#b3bfca'); dk.addColorStop(0.5, '#9cabb9'); dk.addColorStop(1, '#8a9aab');
  g.fillStyle = dk; g.fillRect(0, 0, WW, RH);
  g.globalCompositeOperation = 'source-over';
  return c;
}

// ---------------------------------------------------------------- the ground (pre-shear screen space at cx = 0)
// small puddles along the run (world x, Z, half-axes): the asphalt layer opens there and the reflection shows whole
const MINI = [[420, 1010, 150, 60], [1260, 1420, 220, 70], [1880, 880, 120, 44], [-80, 1600, 260, 80], [3200, 1180, 180, 60]];
export function bakeGround(r, camMax, puddle) {
  const GW = Math.ceil(W + camMax * ((H - YH) / HC) + 8), GH = H - YWB;
  const { c, g } = mk(GW, GH);
  const img = g.createImageData(GW, GH), d = img.data;
  const [pcx, pcz, prx, prz] = puddle.ell;
  for (let v = 0; v < GH; v++) {
    const sy = YWB + v + 0.5, Z = (HC * F) / (sy - YH), cell = 2.6;
    const iz = Math.floor(Z / cell), zf = Z / 380;
    const nearWall = smooth((Z - 1720) / 180);
    for (let u = 0; u < GW; u++) {
      const x = ((u + 0.5 - 540) * Z) / F;
      let wet = fbm(x / 430, zf) * 1.15 - 0.12 + 0.35 * nearWall;
      const ex = (x - pcx) / prx, ez = (Z - pcz) / prz, e = ex * ex + ez * ez;
      wet += 0.6 * (1 - smooth((e - 1) / 0.7));
      for (const [qx, qz, qa, qb] of MINI) { const mx = (x - qx) / qa, mz = (Z - qz) / qb, m = mx * mx + mz * mz; if (m < 1.25) wet = Math.max(wet, 1.6 - 0.8 * m); }
      wet = Math.min(1.6, Math.max(0, (wet - 0.14) / 0.34));
      const stain = (vnoise(x / 900, Z / 520) - 0.5) * 12;
      const sp = hash2(Math.floor(x / cell), iz);
      let lum = 84 + stain + (sp - 0.5) * (16 - 9 * wet) + (sp > 0.94 ? 16 : 0);
      lum -= 24 * Math.min(wet, 1);
      const i = (v * GW + u) * 4;
      d[i] = lum - 9; d[i + 1] = lum + 1; d[i + 2] = lum + 13;
      d[i + 3] = 255 * (wet > 1.2 ? 0.06 : 0.9 - 0.66 * Math.min(wet, 1));
    }
  }
  g.putImageData(img, 0, 0);
  const P = (x, Z) => [540 + (x * F) / Z, YH + (HC * F) / Z - YWB, F / Z];
  // curb along the wall base + the gutter
  for (let k = 0; k < 2; k++) {
    const ZW = ZT / WALL_F, [, y0] = P(0, ZW), [, y1] = P(0, ZW - 80);
    g.fillStyle = k ? 'rgba(20,30,42,0.4)' : 'rgba(150,165,178,0.55)';
    if (k) g.fillRect(0, y1 - 2, GW, 5); else g.fillRect(0, y0, GW, y1 - y0);
  }
  // manhole cover (world circle → ellipse)
  {
    const [mx, my, s] = P(980, 1300), rx = 78 * s, ry = rx * (HC / 1300);
    g.fillStyle = 'rgba(52,62,74,0.9)'; g.beginPath(); g.ellipse(mx, my, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(120,135,150,0.35)'; g.lineWidth = 3; g.beginPath(); g.ellipse(mx, my, rx * 0.86, ry * 0.86, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2;
    for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(mx + k * rx * 0.22, my - ry * 0.8 * Math.sqrt(1 - (k * 0.22) ** 2)); g.lineTo(mx + k * rx * 0.22, my + ry * 0.8 * Math.sqrt(1 - (k * 0.22) ** 2)); g.stroke(); }
    const sh = g.createLinearGradient(mx - rx, my - ry, mx + rx, my + ry);
    sh.addColorStop(0, 'rgba(200,215,228,0.22)'); sh.addColorStop(0.5, 'rgba(200,215,228,0)');
    g.fillStyle = sh; g.beginPath(); g.ellipse(mx, my, rx, ry, 0, 0, Math.PI * 2); g.fill();
  }
  // cracks
  g.strokeStyle = 'rgba(18,24,32,0.45)'; g.lineCap = 'round';
  for (let k = 0; k < 34; k++) {
    let x = -300 + r() * 5600, Z = 820 + r() * 1000, a = r() * Math.PI * 2;
    g.lineWidth = 1.2 + r() * 1.4;
    g.beginPath(); let [px, py] = P(x, Z); g.moveTo(px, py);
    for (let i = 0; i < 9; i++) { a += (r() - 0.5) * 1.2; x += Math.cos(a) * 26; Z += Math.sin(a) * 14; [px, py] = P(x, Z); g.lineTo(px, py); }
    g.stroke();
  }
  // a few fallen leaves
  for (let k = 0; k < 18; k++) {
    const x = -200 + r() * 5400, Z = 860 + r() * 1000, [lx, ly, s] = P(x, Z);
    g.save(); g.translate(lx, ly); g.rotate(r() * Math.PI); g.scale(1, HC / Z);
    g.fillStyle = ['#6c7a5c', '#5d6d55', '#7d7f5f'][k % 3];
    g.beginPath(); g.ellipse(0, 0, 13 * s, 6 * s, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  return c;
}

// ---------------------------------------------------------------- the puddle: an outline on the ground plane (x, Z)
export function makePuddle(xp) {
  const K = [[-250, 1188], [-150, 1214], [-20, 1206], [110, 1212], [185, 1186], [212, 1124], [244, 1040], [292, 962], [272, 884],
    [180, 828], [40, 806], [-96, 818], [-214, 852], [-300, 906], [-332, 992], [-306, 1080], [-282, 1150]];
  const pts = [];
  const n = K.length;
  for (let i = 0; i < n; i++) {
    const p0 = K[(i - 1 + n) % n], p1 = K[i], p2 = K[(i + 1) % n], p3 = K[(i + 2) % n];
    for (let k = 0; k < 6; k++) {
      const t = k / 6, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c2, d2) => 0.5 * (2 * b + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d2) * t2 + (-a + 3 * b - 3 * c2 + d2) * t3);
      pts.push([xp + f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  const inside = (x, Z) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i], [xj, zj] = pts[j];
      if ((zi > Z) !== (zj > Z) && x < ((xj - xi) * (Z - zi)) / (zj - zi) + xi) c = !c;
    }
    return c;
  };
  return { pts, inside, ell: [xp - 20, 1010, 330, 225] };
}

/** add the projected outline to the current path */
export function puddlePath(g, pd, cx) {
  for (let i = 0; i < pd.pts.length; i++) {
    const [x, Z] = pd.pts[i];
    const sx = 540 + ((x - cx) * F) / Z, sy = YH + (HC * F) / Z;
    if (i) g.lineTo(sx, sy); else g.moveTo(sx, sy);
  }
  g.closePath();
}

// ---------------------------------------------------------------- near props (f = 1.95): out of focus, in shade
export function bakeProps(r) {
  const out = [];
  const blurred = (w, h, draw, x, blur = 5) => {
    const { c, g } = mk(w + 40, h + 40);
    g.filter = `blur(${blur}px)`;
    g.translate(20, 20); draw(g, w, h); g.filter = 'none';
    out.push({ c, x, w: w + 40, h: h + 40 });
  };
  // a bollard
  blurred(80, 600, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#1b2330'); gr.addColorStop(0.55, '#2e394a'); gr.addColorStop(1, '#161d28');
    g.fillStyle = gr; g.beginPath(); g.roundRect(0, 20, w, h, 30); g.fill();
    g.fillStyle = '#c9d2da'; g.fillRect(0, 120, w, 46);
    g.fillStyle = '#28323f'; g.beginPath(); g.ellipse(w / 2, 26, w / 2 + 6, 22, 0, 0, Math.PI * 2); g.fill();
  }, 760);
  // stacked crates
  blurred(330, 330, (g) => {
    for (const [x, y, w] of [[0, 120, 330], [30, 0, 270]]) {
      g.fillStyle = '#2c3a4a'; g.beginPath(); g.roundRect(x, y, w, 140, 10); g.fill();
      g.fillStyle = '#1e2836';
      for (let j = 0; j < 2; j++) for (let i = 0; i < 5; i++) { g.beginPath(); g.roundRect(x + 18 + i * (w - 30) / 5, y + 28 + j * 52, (w - 30) / 5 - 14, 34, 6); g.fill(); }
    }
  }, 1650, 6);
  // a potted plant (framing the final shot)
  blurred(380, 520, (g, w, h) => {
    const lv = ['#2c3b34', '#34463c', '#253229'];
    for (let i = 0; i < 16; i++) {
      const a = Math.PI * (0.05 + 0.9 * (i / 15)) + (r() - 0.5) * 0.2, L = 160 + r() * 120;
      g.fillStyle = lv[i % 3];
      g.save(); g.translate(w / 2, 330); g.rotate(-a); g.beginPath(); g.ellipse(L * 0.55, 0, L * 0.55, 26 + r() * 10, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    g.fillStyle = '#2b3646'; g.beginPath(); g.moveTo(60, 300); g.lineTo(w - 60, 300); g.lineTo(w - 90, h); g.lineTo(90, h); g.fill();
    g.fillStyle = '#3a4758'; g.fillRect(52, 292, w - 104, 36);
  }, 2800, 6);
  return out;
}
