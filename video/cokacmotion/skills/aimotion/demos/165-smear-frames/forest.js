/*
 * forest.js — the autumn forest: baked depth layers (far haze, mid trunks, light shafts, the two near trunks,
 * the forest floor), the branches the squirrel stands on (they bend, so they are drawn per frame), the acorn,
 * and the leaf shapes.
 */
import { clamp, lerp } from '../_lib/stage.js';
import { tube, poly, COL } from './squirrel.js';

export const W = 1080, H = 1920, MG = 90;       // layer canvases carry a margin for camera moves
export const PAL = {
  ink: COL.ink, bark: '#5e3d29', barkD: '#452c1d', barkL: '#7c5538', moss: '#6b7d3c',
  leafA: '#b8502a', leafB: '#9c3a26', leafC: '#c9702f', leafD: '#7e8a3f', leafE: '#5d7238',
};
let CPU = false;
export const setCPU = (v) => { CPU = v; };
export function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d', CPU ? { willReadFrequently: true } : undefined) };
}
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- the near branches (world = design coordinates)
export const BR = {
  left: { x0: -70, y0: 1304, x1: 452, y1: 1262, r0: 34, r1: 10, sag: -10 },
  right: { x0: 1150, y0: 1170, x1: 708, y1: 1128, r0: 36, r1: 10, sag: -8 },
};
const brSpine = (b, u, bend) => {
  const x = lerp(b.x0, b.x1, u);
  const y = lerp(b.y0, b.y1, u) + b.sag * Math.sin(Math.PI * u) + bend * u * u;
  return [x, y];
};
const brR = (b, u) => lerp(b.r0, b.r1, Math.pow(u, 0.8));
/** top surface of a branch at world x (the squirrel's feet stand here) */
export function branchTop(b, x, bend = 0) {
  const u = clamp((x - b.x0) / (b.x1 - b.x0));
  return brSpine(b, u, bend)[1] - brR(b, u) + 2;
}
export function drawBranch(g, b, bend, leaves, sil) {
  const sp = [], rr = [];
  for (let i = 0; i <= 20; i++) { const u = i / 20, p = brSpine(b, u, bend); sp.push(p[0], p[1]); rr.push(brR(b, u)); }
  const P = tube(sp, rr);
  // a side twig near the tip
  const tw = [];
  {
    const a = brSpine(b, 0.72, bend), dir = b.x1 > b.x0 ? 1 : -1;
    const q = [], qr = [];
    for (let i = 0; i <= 8; i++) { const u = i / 8; q.push(a[0] + dir * 70 * u, a[1] - 64 * u + 18 * u * u + bend * 0.3 * u); qr.push(lerp(7, 3, u)); }
    tw.push(tube(q, qr));
  }
  g.lineJoin = 'round';
  g.beginPath(); poly(g, P); g.closePath(); for (const t of tw) { poly(g, t); g.closePath(); }
  if (sil) { g.lineWidth = 9; g.strokeStyle = sil; g.stroke(); g.fillStyle = sil; g.fill(); }
  else {
    g.lineWidth = 9; g.strokeStyle = PAL.ink; g.stroke(); g.fillStyle = PAL.bark; g.fill();
    // a lit top edge and a shaded underside, clipped to the branch
    g.save(); g.beginPath(); poly(g, P); g.closePath(); g.clip();
    g.beginPath();
    for (let i = 0; i <= 20; i++) { const u = i / 20, p = brSpine(b, u, bend), r = brR(b, u); i ? g.lineTo(p[0], p[1] - r * 0.55) : g.moveTo(p[0], p[1] - r * 0.55); }
    g.lineWidth = 6; g.strokeStyle = PAL.barkL; g.stroke();
    g.beginPath();
    for (let i = 0; i <= 20; i++) { const u = i / 20, p = brSpine(b, u, bend), r = brR(b, u); i ? g.lineTo(p[0], p[1] + r) : g.moveTo(p[0], p[1] + r); }
    g.lineWidth = Math.max(10, b.r0 * 0.7); g.strokeStyle = PAL.barkD; g.stroke();
    g.restore();
  }
  // leaves along the branch
  for (const L of leaves) {
    const p = brSpine(b, L.u, bend);
    drawLeaf(g, p[0] + L.dx, p[1] + L.dy + bend * 0.15 * L.u, L.s, L.a + bend * 0.002, 1, sil || L.col, !sil);
  }
}

// ---------------------------------------------------------------- the acorn's twig (hangs from the upper branch)
export const TWIG = { x0: 772, y0: 650, x1: 712, y1: 922 };
export function twigPath(sway, snap) {
  // the twig bends with the sway; after the grab it whips up and settles (snap = signed offset of its end)
  const ex = TWIG.x1 + sway + snap * 0.4, ey = TWIG.y1 - Math.abs(snap) * 0.5;
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    pts.push(lerp(TWIG.x0, ex, u) + 22 * Math.sin(Math.PI * u) * (1 - u), lerp(TWIG.y0, ey, u));
  }
  return pts;
}
export function drawTwig(g, pts, sil) {
  const r = [];
  for (let i = 0; i < pts.length / 2; i++) r.push(lerp(6, 2.6, i / (pts.length / 2 - 1)));
  const P = tube(pts, r);
  g.beginPath(); poly(g, P); g.closePath();
  g.lineWidth = 7; g.strokeStyle = sil || PAL.ink; g.stroke(); g.fillStyle = sil || PAL.barkL; g.fill();
}

// ---------------------------------------------------------------- leaf shape
/** an almond leaf with a midrib; flip = cos of its spin (a 3-D flutter seen flat) */
export function drawLeaf(g, x, y, s, a, flip, col, rib = true, alpha = 1) {
  g.save();
  g.translate(x, y); g.rotate(a); g.scale(s * (Math.abs(flip) < 0.08 ? 0.08 * Math.sign(flip || 1) : flip), s);
  g.globalAlpha = alpha;
  g.beginPath();
  g.moveTo(0, -1); g.bezierCurveTo(0.62, -0.55, 0.5, 0.45, 0, 1); g.bezierCurveTo(-0.5, 0.45, -0.62, -0.55, 0, -1);
  g.fillStyle = col; g.fill();
  if (rib) {
    g.lineWidth = 0.09; g.strokeStyle = 'rgba(42,26,16,0.55)';
    g.beginPath(); g.moveTo(0, -0.95); g.lineTo(0, 1.25); g.stroke();
  }
  g.restore();
}

// ---------------------------------------------------------------- baked layers
const blob = (g, x, y, r, col) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = col; g.fill(); };
function cluster(g, r, x, y, R, cols, n = 9) {
  for (let i = 0; i < n; i++) {
    const a = r() * TAU, d = R * Math.sqrt(r()) * 0.7;
    blob(g, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, R * (0.35 + 0.35 * r()), cols[Math.floor(r() * cols.length)]);
  }
}

/** far: the haze gradient, distant trunks in aerial perspective, the dark canopy, the mist */
export function bakeFar(r) {
  const { c, g } = mk(W + 2 * MG, H + 2 * MG);
  g.translate(MG, MG);
  const gr = g.createLinearGradient(0, -MG, 0, H + MG);
  [[0, '#141e18'], [0.16, '#1c2a21'], [0.3, '#34483a'], [0.42, '#6f8a72'], [0.5, '#a3b08c'], [0.56, '#b4b991'], [0.63, '#94a27e'],
    [0.72, '#5d6c4a'], [0.84, '#323726'], [1, '#1d1c14']].forEach(([k, v]) => gr.addColorStop(k, v));
  g.fillStyle = gr; g.fillRect(-MG, -MG, W + 2 * MG, H + 2 * MG);
  // sun glow behind the gap, upper left of the action
  const sun = g.createRadialGradient(380, 860, 0, 380, 860, 760);
  sun.addColorStop(0, 'rgba(255,236,190,0.55)'); sun.addColorStop(0.4, 'rgba(250,226,170,0.2)'); sun.addColorStop(1, 'rgba(250,226,170,0)');
  g.fillStyle = sun; g.fillRect(-MG, -MG, W + 2 * MG, H + 2 * MG);
  // distant trunks, three depths, each lighter with distance
  for (const [n, wmin, wmax, col, a] of [[16, 10, 26, '#86a084', 0.55], [12, 18, 40, '#6c8669', 0.7], [8, 30, 56, '#53684f', 0.85]]) {
    for (let i = 0; i < n; i++) {
      const x = -MG + r() * (W + 2 * MG), w = wmin + r() * (wmax - wmin), lean = (r() - 0.5) * 0.05;
      g.save(); g.globalAlpha = a; g.translate(x, 0); g.transform(1, 0, lean, 1, 0, 0);
      const tg = g.createLinearGradient(0, 300, 0, 1500);
      tg.addColorStop(0, col); tg.addColorStop(0.7, col); tg.addColorStop(1, 'rgba(160,172,130,0)');
      g.fillStyle = tg; g.beginPath(); g.roundRect(-w / 2, -MG, w, 1700, w / 2); g.fill();
      g.restore();
    }
  }
  // hazy mid-height foliage between the trunks
  for (let i = 0; i < 26; i++) cluster(g, r, -MG + r() * (W + 2 * MG), 520 + r() * 380, 70 + r() * 70, ['rgba(120,140,104,0.5)', 'rgba(150,150,104,0.45)', 'rgba(160,120,84,0.35)'], 7);
  // the canopy: dark masses with a few autumn clusters
  for (let i = 0; i < 46; i++) {
    const x = -MG + r() * (W + 2 * MG), y = -MG + r() * 420;
    cluster(g, r, x, y, 110 + r() * 110, ['#18241c', '#1d2b21', '#223226', '#2a3a28', r() < 0.3 ? '#5a2e1c' : '#26352a'], 10);
  }
  for (let i = 0; i < 14; i++) cluster(g, r, -MG + r() * (W + 2 * MG), 300 + r() * 220, 60 + r() * 50, ['#3c4a2a', '#4b3a22', '#6a3420', '#2c3b29'], 8);
  // mist at the foot of the trees
  const mist = g.createLinearGradient(0, 1240, 0, 1520);
  mist.addColorStop(0, 'rgba(196,196,150,0)'); mist.addColorStop(0.5, 'rgba(196,196,150,0.32)'); mist.addColorStop(1, 'rgba(196,196,150,0)');
  g.fillStyle = mist; g.fillRect(-MG, 1240, W + 2 * MG, 280);
  return c;
}

/** mid: nearer trunks and undergrowth */
export function bakeMid(r) {
  const { c, g } = mk(W + 2 * MG, H + 2 * MG);
  g.translate(MG, MG);
  for (const [x, w, col] of [[150, 64, '#3e4c38'], [470, 44, '#46553f'], [770, 70, '#3a4735'], [930, 38, '#4a5942'], [-40, 52, '#3a4634']]) {
    const tg = g.createLinearGradient(0, 0, 0, 1700);
    tg.addColorStop(0, col); tg.addColorStop(0.75, col); tg.addColorStop(1, 'rgba(70,80,60,0.2)');
    g.fillStyle = tg; g.beginPath(); g.roundRect(x - w / 2, -MG, w, 1800, w / 2); g.fill();
    g.fillStyle = 'rgba(210,200,150,0.08)'; g.fillRect(x - w / 2 + 6, -MG, w * 0.25, 1800);
  }
  // undergrowth: rounded bushes with a few rust ones
  for (let i = 0; i < 34; i++) {
    const x = -MG + r() * (W + 2 * MG), y = 1440 + r() * 160;
    cluster(g, r, x, y, 90 + r() * 60, ['#2f3d2a', '#36472f', '#405233', r() < 0.35 ? '#6e3a22' : '#3a4a2e'], 9);
  }
  return c;
}

/** light shafts from the upper left (drawn with 'screen') */
export function bakeShafts(r) {
  const { c, g } = mk(W + 2 * MG, H + 2 * MG);
  g.translate(MG, MG);
  for (const [x, w, a] of [[120, 120, 0.22], [300, 70, 0.16], [430, 160, 0.2], [640, 90, 0.12]]) {
    g.save();
    g.translate(x, -MG); g.rotate(-0.36);
    const lg = g.createLinearGradient(-w / 2, 0, w / 2, 0);
    lg.addColorStop(0, 'rgba(255,232,180,0)'); lg.addColorStop(0.5, `rgba(255,232,180,${a})`); lg.addColorStop(1, 'rgba(255,232,180,0)');
    const vg = g.createLinearGradient(0, 0, 0, 1700);
    g.fillStyle = lg; g.fillRect(-w / 2, 0, w, 1700);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(0.35, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = vg; g.fillRect(-w / 2 - 2, 0, w + 4, 1700);
    g.restore();
  }
  void r;
  return c;
}

/** near: the two trunks, the upper branch the acorn hangs from, the forest floor */
export function bakeNear(r) {
  const { c, g } = mk(W + 2 * MG, H + 2 * MG);
  g.translate(MG, MG);
  g.lineJoin = 'round';
  const trunk = (pts, rr) => {
    const P = tube(pts, rr);
    g.beginPath(); poly(g, P); g.closePath();
    g.lineWidth = 10; g.strokeStyle = PAL.ink; g.stroke(); g.fillStyle = PAL.bark; g.fill();
    g.save(); g.beginPath(); poly(g, P); g.closePath(); g.clip();
    // bark: long dark grooves and a lit edge
    for (let i = 0; i < pts.length / 2 - 1; i++) {
      const x = pts[2 * i], y = pts[2 * i + 1], rad = rr[i];
      for (let k = 0; k < 3; k++) {
        const off = (r() - 0.5) * rad * 1.4;
        g.beginPath(); g.moveTo(x + off, y); g.lineTo(pts[2 * i + 2] + off + (r() - 0.5) * 6, pts[2 * i + 3]);
        g.lineWidth = 2 + r() * 3; g.strokeStyle = 'rgba(42,26,16,0.35)'; g.stroke();
      }
    }
    g.restore();
    return P;
  };
  // left trunk (mostly beyond the left edge)
  { const pts = [], rr = []; for (let i = 0; i <= 10; i++) { const y = -MG + (i / 10) * (H + 2 * MG); pts.push(-40 + 12 * Math.sin(i * 0.7), y); rr.push(96 - i * 2); } trunk(pts, rr); }
  // right trunk
  { const pts = [], rr = []; for (let i = 0; i <= 10; i++) { const y = -MG + (i / 10) * (H + 2 * MG); pts.push(1086 - 10 * Math.sin(i * 0.6), y); rr.push(104 - i * 2); } trunk(pts, rr); }
  // the upper branch, from the right trunk to the left, with leaf clusters
  {
    const pts = [], rr = [];
    for (let i = 0; i <= 14; i++) { const u = i / 14; pts.push(lerp(1060, 500, u), lerp(640, 690, u) - 28 * Math.sin(Math.PI * u)); rr.push(lerp(30, 8, u)); }
    trunk(pts, rr);
    for (let i = 0; i < 26; i++) {
      const u = 0.25 + r() * 0.75, x = lerp(1060, 500, u) + (r() - 0.5) * 60, y = lerp(640, 690, u) - 28 * Math.sin(Math.PI * u) - 10 - r() * 40;
      drawLeaf(g, x, y, 22 + r() * 12, (r() - 0.5) * 2.4, 0.7 + 0.3 * r(), [PAL.leafA, PAL.leafB, PAL.leafC, PAL.leafD][Math.floor(r() * 4)]);
    }
  }
  // forest floor
  const fl = g.createLinearGradient(0, 1560, 0, H + MG);
  fl.addColorStop(0, '#2c2f20'); fl.addColorStop(1, '#16150f');
  g.fillStyle = fl;
  g.beginPath(); g.moveTo(-MG, 1600);
  for (let x = -MG; x <= W + MG; x += 40) g.lineTo(x, 1590 + 18 * Math.sin(x * 0.012) + 10 * Math.sin(x * 0.041));
  g.lineTo(W + MG, H + MG); g.lineTo(-MG, H + MG); g.fill();
  for (let i = 0; i < 70; i++) drawLeaf(g, -MG + r() * (W + 2 * MG), 1600 + r() * 380, 14 + r() * 12, r() * TAU, 0.5 + 0.5 * r(),
    ['#5e2a18', '#6d3a1e', '#4d4a24', '#3f2a18'][Math.floor(r() * 4)], false);
  // two mushrooms by the right trunk
  for (const [x, y, s] of [[905, 1606, 1], [948, 1618, 0.7]]) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.beginPath(); g.roundRect(-9, -30, 18, 34, 8); g.lineWidth = 6; g.strokeStyle = PAL.ink; g.stroke(); g.fillStyle = '#ead8b8'; g.fill();
    g.beginPath(); g.ellipse(0, -30, 36, 22, 0, Math.PI, TAU); g.closePath(); g.stroke(); g.fillStyle = '#a8432a'; g.fill();
    g.fillStyle = '#f2e2c4'; for (const [a, b] of [[-14, -40], [6, -46], [18, -36]]) blob(g, a, b, 4, '#f2e2c4');
    g.restore();
  }
  return c;
}

/** a big out-of-focus leaf for the very front */
export function bakeForeLeaf(col, blurPx) {
  const s = 150, { c, g } = mk(s * 2, s * 2);
  g.filter = `blur(${blurPx}px)`;
  drawLeaf(g, s, s, s * 0.62, 0.4, 1, col, false);
  g.filter = 'none';
  return c;
}

export function bakeVignette() {
  const { c, g } = mk(W, H);
  const v = g.createRadialGradient(W / 2, 980, 380, W / 2, 980, 1250);
  v.addColorStop(0, 'rgba(14,10,6,0)'); v.addColorStop(1, 'rgba(14,10,6,0.62)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  const b = g.createLinearGradient(0, 1500, 0, H);
  b.addColorStop(0, 'rgba(10,8,5,0)'); b.addColorStop(1, 'rgba(10,8,5,0.55)');
  g.fillStyle = b; g.fillRect(0, 1500, W, H - 1500);
  const t = g.createLinearGradient(0, 0, 0, 420);
  t.addColorStop(0, 'rgba(8,10,8,0.5)'); t.addColorStop(1, 'rgba(8,10,8,0)');
  g.fillStyle = t; g.fillRect(0, 0, W, 420);
  return c;
}

/** soft round glow sprite (dust motes in the light) */
export function bakeMote() {
  const { c, g } = mk(64, 64);
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,240,205,0.9)'); gr.addColorStop(0.25, 'rgba(255,236,196,0.45)'); gr.addColorStop(1, 'rgba(255,236,196,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return c;
}
