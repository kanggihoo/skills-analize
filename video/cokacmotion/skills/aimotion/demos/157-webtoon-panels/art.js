/*
 * art.js — the drawings: palette, the cat rig, the paper butterfly, balloons and hand-lettered SFX, and the baked
 * layers of every panel (painted in strip coordinates, so a layer drawn at its own position is the panel at rest).
 * Nothing here reads time; main.js passes poses and phases in.
 */
import { rand } from '../_lib/stage.js';

export const C = {
  paper: '#f4ead7', paperShade: '#e2d3b8', ink: '#2b2643', inkSoft: '#4a4468',
  night: '#232147', indigo0: '#2b2952', indigo1: '#3b3a6b', indigo2: '#53518a', indigo3: '#6f6ca6',
  lav: '#a59bc8', lav2: '#cbc1dd', peach0: '#eea893', peach1: '#f6c3a7', peach2: '#fbdcc3', cream: '#fff4e3', creamHi: '#fffaf2',
  rose: '#d38f95', wall: '#46426e', wallD: '#3a3760', winLit: '#ffe6c0', winDark: '#353259',
  cat: '#6c6890', catD: '#54517a', catL: '#8783ab', catCream: '#f8ecda', nose: '#e8998f', eye: '#ecdba0', eyeD: '#c4ad6e',
  box: '#d8ab86', boxD: '#b98962', boxL: '#ecc9a6', boxIn: '#5a4565',
  accent: '#ff8a1f', accentL: '#ffb46a', accentD: '#d0640c',
};
const TAU = Math.PI * 2, DEG = Math.PI / 180;

let CPU = false;
export const setCPU = (v) => { CPU = v; };
/** offscreen canvas; in headless runs a CPU raster so the first composite is the same as every later one */
export function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  return { c, g: c.getContext('2d', CPU ? { willReadFrequently: true } : undefined) };
}
export function pathPoly(g, pts, begin = true) {
  if (begin) g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
}
export function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
const lerp = (a, b, k) => a + (b - a) * k;

// ======================================================================= the cat (side / three-quarter rig)
// Local frame: the cat faces +x, y down, body centre at the origin, ~240 px nose to tail root at scale 1.
// Parts are stroked "sausages" (body, legs, tail) and filled shapes (head, ears). Drawing all ink outlines first and
// all fills second merges the parts into one silhouette with a single outer line; a cream halo pass under both is
// the knockout that lets the cat sit on top of panel borders.
const INK = 5;
function catGeom(q) {
  const s = q.s || 0, c = q.c || 0, w = q.wig || 0;
  const H = [-60 - 18 * s + w, 2 + 6 * c - 3 * s - Math.abs(w) * 0.25];
  const K = [50 + 16 * s, -2 + 30 * c + 2 * s];
  const R = 42 - 3 * s;
  const mid = [(H[0] + K[0]) / 2, (H[1] + K[1]) / 2 - 10 + 8 * s + 6 * c];
  const hd = [K[0] + 52 + 14 * c + 20 * s, K[1] - 46 + 32 * c + 26 * s];
  // legs: [root, joint, paw]; standing → crouched (folded) → leaping (front reaches, hind extends)
  const sh = [K[0] + 12, K[1] + 18], hp = [H[0] - 4, H[1] + 16];
  const pick = (a, b, d) => [a[0] * (1 - c - s) + b[0] * c + d[0] * s, a[1] * (1 - c - s) + b[1] * c + d[1] * s];
  const fJ = pick([4, 40], [-20, 30], [56, 14]), fP = pick([6, 78], [34, 46], [118, 30]);
  const hJ = pick([18, 38], [36, 26], [-34, 40]), hP = pick([-6, 78], [6, 48], [-104, 66]);
  const reach = q.reach || 0;                                     // extra stretch of the front paws (toward a target)
  // o < 0: the far leg, a little behind and splayed so both legs read
  const F = (o) => { const f = o < 0 ? 1 : 0; return [[sh[0] + o, sh[1]], [sh[0] + fJ[0] + o, sh[1] + fJ[1] - 6 * f * s], [sh[0] + fP[0] + o + reach * 18 - 10 * f * s, sh[1] + fP[1] - reach * 6 - 22 * f * s]]; };
  const B = (o) => { const f = o < 0 ? 1 : 0; return [[hp[0] + o, hp[1]], [hp[0] + hJ[0] + o, hp[1] + hJ[1] + 4 * f * s], [hp[0] + hP[0] + o + 14 * f * s, hp[1] + hP[1] + 18 * f * s]]; };
  // tail: three bones from the root, angles in degrees (0 = +x)
  const ta = q.tail || [-130, 35, 30], T0 = [H[0] - R * 0.7, H[1] - R * 0.35];
  const tail = [T0];
  let a = ta[0];
  for (const [i, L] of [[0, 46], [1, 44], [2, 34]]) { if (i) a += ta[i]; const p = tail[tail.length - 1]; tail.push([p[0] + L * Math.cos(a * DEG), p[1] + L * Math.sin(a * DEG)]); }
  return { H, K, R, mid, hd, F, B, tail };
}
function strokeLimb(g, pts, w) {
  g.lineWidth = w; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  if (pts.length === 3) g.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
  else { for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; g.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); } const L = pts[pts.length - 1]; g.lineTo(L[0], L[1]); }
  g.stroke();
}
const LEG = (pts) => [pts[0], pts[1], pts[2]];
function headPath(g, hd) { g.beginPath(); g.ellipse(hd[0], hd[1], 52, 45, 0, 0, TAU); }
/** run fn with the head's own rotation about its centre (q.headRot, radians: < 0 lifts the nose) */
function withHead(g, G, q, fn) {
  const a = q.headRot || 0;
  if (!a) { fn(); return; }
  g.save(); g.translate(G.hd[0], G.hd[1]); g.rotate(a); g.translate(-G.hd[0], -G.hd[1]); fn(); g.restore();
}
function earPath(g, hd, side, back) {
  // side: 1 near ear (right of crown), -1 far ear; back: 0..1 folds the ear toward −x
  const bx = hd[0] + (side > 0 ? 14 : -22), by = hd[1] - 30;
  const lean = (side > 0 ? 10 : -6) - back * 30;
  const tipx = bx + lean, tipy = by - 44 + back * 16;
  g.beginPath();
  g.moveTo(bx - 22, by + 8);
  g.quadraticCurveTo(tipx - 8, tipy + 6, tipx, tipy);
  g.quadraticCurveTo(tipx + 8, tipy + 10, bx + 22, by + 4);
  g.closePath();
}
/** the silhouette passes; mode: 'halo' (cream knockout) | 'shadow' (flat) | 'cat' (far legs, merged outline, fills) */
function catPass(g, G, q, mode, shadowCol) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  const farLegs = [G.F(-16), G.B(-14)];
  const sil = (e, col) => {                     // the near silhouette, every part grown by e/2
    g.strokeStyle = col; g.fillStyle = col;
    strokeLimb(g, G.tail, 19 + e);
    strokeLimb(g, [G.H, G.mid, G.K], 2 * G.R + e);
    g.beginPath(); g.arc(G.K[0], G.K[1] + 4, G.R + 4 + e / 2, 0, TAU); g.fill();
    g.beginPath(); g.arc(G.H[0] + 6, G.H[1] + 2, G.R + 6 + e / 2, 0, TAU); g.fill();
    strokeLimb(g, LEG(G.F(0)), 26 + e);
    strokeLimb(g, LEG(G.B(0)), 26 + e);
    g.lineWidth = Math.max(e, 0.001);
    withHead(g, G, q, () => {
      for (const f of [() => headPath(g, G.hd), () => earPath(g, G.hd, -1, q.ear || 0), () => earPath(g, G.hd, 1, q.ear || 0)]) {
        f(); g.fill(); if (e) g.stroke();
      }
    });
  };
  if (mode === 'halo' || mode === 'shadow') {
    const e = mode === 'halo' ? 2 * (INK + 9) : 2 * INK, col = mode === 'halo' ? C.cream : shadowCol;
    g.strokeStyle = col; for (const leg of farLegs) strokeLimb(g, LEG(leg), 24 + e);
    sil(e, col);
    return;
  }
  g.strokeStyle = C.ink; for (const leg of farLegs) strokeLimb(g, LEG(leg), 24 + 2 * INK);
  g.strokeStyle = C.catD; for (const leg of farLegs) strokeLimb(g, LEG(leg), 24);
  sil(2 * INK, C.ink);
  sil(0, C.cat);
}
function catEye(g, x, y, rx, ry, open, pupil, lx, ly) {
  g.save();
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU);
  g.fillStyle = C.eye; g.fill();
  g.clip();
  g.fillStyle = C.eyeD; g.beginPath(); g.ellipse(x, y + ry * 0.75, rx * 1.2, ry * 0.5, 0, 0, TAU); g.fill();
  g.fillStyle = C.ink; g.beginPath(); g.ellipse(x + lx * rx * 0.35, y + ly * ry * 0.3, rx * (0.22 + 0.5 * pupil), ry * 0.86, 0, 0, TAU); g.fill();
  g.fillStyle = C.creamHi; g.beginPath(); g.arc(x - rx * 0.3 + lx * rx * 0.2, y - ry * 0.38, Math.max(2, rx * 0.28), 0, TAU); g.fill();
  // lid: fur colour from the top down to the lid line
  if (open < 0.999) {
    const ly0 = y - ry + 2 * ry * (1 - open);
    g.fillStyle = C.cat; g.fillRect(x - rx - 2, y - ry - 2, 2 * rx + 4, ly0 - (y - ry) + 2);
    g.strokeStyle = C.ink; g.lineWidth = 3.5; g.beginPath(); g.moveTo(x - rx, ly0); g.lineTo(x + rx, ly0); g.stroke();
  }
  g.restore();
  g.strokeStyle = C.ink; g.lineWidth = 3.5; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.stroke();
}
/**
 * Draw the rigged cat at the current transform (facing +x).
 * q: { s stretch 0..1, c crouch 0..1, wig hip wiggle px, ear 0..1 (back), tail [deg ×3], open 0..1, pupil 0..1,
 *      look [x, y] −1..1, mouth 0..1, reach 0..1, halo bool, shadow [dx, dy] }
 */
export function drawCat(g, q) {
  const G = catGeom(q);
  if (q.halo) catPass(g, G, q, 'halo');
  catPass(g, G, q, 'cat');
  // details
  g.lineCap = 'round'; g.lineJoin = 'round';
  withHead(g, G, q, () => {
  // inner ears
  g.fillStyle = C.nose;
  g.save(); g.translate(G.hd[0], G.hd[1]); g.scale(0.55, 0.55); g.translate(-G.hd[0], -G.hd[1] + 26);
  earPath(g, [G.hd[0] + 10, G.hd[1] - 10], 1, q.ear || 0); g.globalAlpha = 0.85; g.fill(); g.globalAlpha = 1;
  g.restore();
  });
  // chest and muzzle cream, sock tips
  g.fillStyle = C.catCream;
  g.beginPath(); g.ellipse(G.K[0] + 24, G.K[1] + 16, 18, 21, -0.3, 0, TAU); g.fill();
  for (const leg of [G.F(0), G.B(0)]) { const p = leg[2]; g.beginPath(); g.arc(p[0], p[1], 10, 0, TAU); g.fill(); }
  // back stripes
  g.strokeStyle = C.catD; g.lineWidth = 7;
  for (let i = 0; i < 3; i++) {
    const u = 0.25 + i * 0.2, x = lerp(G.H[0], G.K[0], u), y = lerp(G.H[1], G.K[1], u) - G.R + 4 + (i === 1 ? -3 : 0);
    g.beginPath(); g.moveTo(x - 4, y); g.quadraticCurveTo(x + 2, y + 12, x - 2, y + 22); g.stroke();
  }
  g.strokeStyle = C.catD; strokeLimb(g, G.tail.slice(2), 19);
  withHead(g, G, q, () => {
  g.strokeStyle = C.catD; g.lineWidth = 6;
  for (const k of [-1, 0, 1]) { const x = G.hd[0] - 4 + k * 11; g.beginPath(); g.moveTo(x, G.hd[1] - 42); g.lineTo(x + 2, G.hd[1] - 28); g.stroke(); }
  // muzzle
  const hx = G.hd[0], hy = G.hd[1];
  g.fillStyle = C.catCream; g.beginPath(); g.ellipse(hx + 30, hy + 18, 25, 18, 0, 0, TAU); g.fill();
  // eyes: near (bigger) left of the nose line, far right of it
  const open = q.open ?? 1, pupil = q.pupil ?? 0.4, [lx, ly] = q.look || [0.6, 0];
  if (open < 0.12) {
    g.strokeStyle = C.ink; g.lineWidth = 4;
    for (const [x, w] of [[hx + 4, 13], [hx + 40, 10]]) { g.beginPath(); g.moveTo(x - w, hy - 4); g.quadraticCurveTo(x, hy + 4, x + w, hy - 4); g.stroke(); }
  } else {
    catEye(g, hx + 4, hy - 6, 13, 15, open, pupil, lx, ly);
    catEye(g, hx + 40, hy - 7, 9.5, 14, open, pupil, lx, ly);
  }
  // nose, mouth
  g.fillStyle = C.nose; g.strokeStyle = C.ink; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(hx + 40, hy + 8); g.lineTo(hx + 52, hy + 8); g.lineTo(hx + 46, hy + 15); g.closePath(); g.fill(); g.stroke();
  const m = q.mouth || 0;
  if (m > 0.05) {
    g.fillStyle = C.rose; g.beginPath(); g.ellipse(hx + 44, hy + 26, 9 * m + 3, 12 * m, 0, 0, TAU); g.fill(); g.stroke();
  } else {
    g.beginPath(); g.moveTo(hx + 46, hy + 15); g.quadraticCurveTo(hx + 44, hy + 23, hx + 37, hy + 21);
    g.moveTo(hx + 46, hy + 15); g.quadraticCurveTo(hx + 49, hy + 23, hx + 55, hy + 20); g.stroke();
  }
  // whiskers
  g.strokeStyle = C.ink; g.lineWidth = 2.5;
  for (const k of [-1, 1]) { g.beginPath(); g.moveTo(hx + 56, hy + 16 + k * 3); g.lineTo(hx + 84, hy + 10 + k * 9); g.stroke(); }
  });
}
/** the silhouette alone (for a flat drop shadow), at the current transform */
export function drawCatShadow(g, q, color) {
  catPass(g, catGeom(q), q, 'shadow', color);
}

// small sitting cat for the establishing shot (seen from the side, facing +x), feet at the origin
export function drawSitCat(g, st) {
  const { tail = 0, yawn = 0, look = 0 } = st;
  g.lineCap = 'round'; g.lineJoin = 'round';
  const head = [6 + 4 * yawn, -96 - 6 * yawn], tilt = -0.35 * yawn;
  const tailPts = [[-26, -14], [-46, 6 + 4 * tail], [-44 + 10 * tail, 46], [-34 + 16 * tail, 78 + 6 * tail]];
  const shapes = (ext) => {
    strokeLimb(g, tailPts, 11 + ext);
    g.beginPath(); g.ellipse(-4, -36, 30 + ext / 2, 40 + ext / 2, -0.12, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(12, -10, 14 + ext / 2, 11 + ext / 2, 0, 0, TAU); g.fill();
    g.save(); g.translate(head[0], head[1]); g.rotate(tilt);
    g.beginPath(); g.ellipse(0, 0, 27 + ext / 2, 23 + ext / 2, 0, 0, TAU); g.fill();
    for (const [bx, lean] of [[-12, -2], [8, 6]]) {
      g.beginPath(); g.moveTo(bx - 11, -14); g.lineTo(bx + lean, -38 - ext * 0.6); g.lineTo(bx + 11, -16); g.closePath(); g.fill();
      if (ext) { g.lineWidth = ext; g.stroke(); }
    }
    g.restore();
  };
  g.fillStyle = C.ink; g.strokeStyle = C.ink; shapes(7);
  g.fillStyle = C.cat; g.strokeStyle = C.cat; shapes(0);
  g.fillStyle = C.catCream; g.beginPath(); g.ellipse(10, -40, 12, 20, 0.2, 0, TAU); g.fill();
  g.beginPath(); g.arc(16, -6, 7, 0, TAU); g.fill();
  g.save(); g.translate(head[0], head[1]); g.rotate(tilt);
  g.fillStyle = C.catCream; g.beginPath(); g.ellipse(15, 8, 13, 9, 0, 0, TAU); g.fill();
  g.strokeStyle = C.ink; g.lineWidth = 3;
  if (yawn > 0.3) {                                       // eyes squeezed shut, mouth wide
    for (const x of [2, 18]) { g.beginPath(); g.moveTo(x - 6, -5); g.lineTo(x, -2); g.lineTo(x - 6, 1); g.stroke(); }
    g.fillStyle = C.rose; g.beginPath(); g.ellipse(18, 12, 6, 9 * yawn, 0, 0, TAU); g.fill(); g.stroke();
  } else {
    g.fillStyle = C.ink;
    for (const x of [4 + look * 2, 19 + look * 2]) { g.beginPath(); g.ellipse(x, -3, 3, 4.2, 0, 0, TAU); g.fill(); }
    g.beginPath(); g.moveTo(20, 8); g.quadraticCurveTo(18, 13, 13, 12); g.stroke();
  }
  g.fillStyle = C.nose; g.beginPath(); g.arc(23, 4, 3.2, 0, TAU); g.fill();
  g.restore();
}

// ======================================================================= the close-up eyes (panel 2)
/** one eye of the extreme close-up: almond window, iris, slit→round pupil, highlights, a reflection, the lid */
export function drawBigEye(g, x, y, st) {
  const { open, pupil, look, refl, rot } = st;
  const rx = 118, ry = 98 * (0.92 + 0.08 * open);
  g.save(); g.translate(x, y); g.rotate(rot);
  const almond = () => {
    g.beginPath(); g.moveTo(-rx, 6);
    g.bezierCurveTo(-rx * 0.6, -ry * 1.28, rx * 0.6, -ry * 1.28, rx, -6);
    g.bezierCurveTo(rx * 0.6, ry * 1.25, -rx * 0.6, ry * 1.25, -rx, 6);
    g.closePath();
  };
  almond(); g.fillStyle = C.eye; g.fill();
  g.save(); almond(); g.clip();
  const gr = g.createRadialGradient(-10, -10, 10, 0, 0, rx * 1.05);
  gr.addColorStop(0, '#f6eac0'); gr.addColorStop(0.6, C.eye); gr.addColorStop(1, C.eyeD);
  g.fillStyle = gr; g.fillRect(-rx - 4, -ry * 1.4, 2 * rx + 8, ry * 2.8);
  // iris ring
  g.strokeStyle = 'rgba(160,130,70,0.45)'; g.lineWidth = 6;
  g.beginPath(); g.arc(look * 34, 0, ry * 0.92, 0, TAU); g.stroke();
  const pw = lerp(10, 66, pupil), ph = lerp(ry * 0.95, ry * 0.78, pupil);
  g.fillStyle = C.ink; g.beginPath(); g.ellipse(look * 34, 2, pw, ph, 0, 0, TAU); g.fill();
  // the butterfly reflected in the eye (accent), mirrored and small
  if (refl.a > 0.01) {
    g.globalAlpha = refl.a;
    drawButterfly(g, look * 34 + refl.x, -18 + refl.y, 15, refl.ph, 0, 1);
    g.globalAlpha = 1;
  }
  g.fillStyle = C.creamHi;
  g.beginPath(); g.ellipse(look * 34 - 30, -ry * 0.42, 20, 16, -0.4, 0, TAU); g.fill();
  g.beginPath(); g.arc(look * 34 + 26, ry * 0.36, 8, 0, TAU); g.fill();
  // upper lid (half-closed when bored)
  const lid = -ry * 1.1 + (1 - open) * ry * 1.25;
  g.fillStyle = C.cat;
  g.beginPath(); g.moveTo(-rx - 8, -ry * 1.6); g.lineTo(rx + 8, -ry * 1.6); g.lineTo(rx + 8, lid - 6); g.quadraticCurveTo(0, lid + 22 * open, -rx - 8, lid + 6); g.closePath(); g.fill();
  g.strokeStyle = C.ink; g.lineWidth = 9;
  g.beginPath(); g.moveTo(rx + 8, lid - 6); g.quadraticCurveTo(0, lid + 22 * open, -rx - 8, lid + 6); g.stroke();
  g.restore();
  almond(); g.strokeStyle = C.ink; g.lineWidth = 8; g.stroke();
  // lower lash line, a little thicker at the outer corner
  g.lineWidth = 4; g.beginPath(); g.moveTo(-rx * 0.7, ry * 0.86); g.quadraticCurveTo(0, ry * 1.12, rx * 0.7, ry * 0.86); g.globalAlpha = 0.35; g.stroke(); g.globalAlpha = 1;
  g.restore();
}

// ======================================================================= the cat in the box (panel 5, front view)
export function drawBoxCat(g, x, y, st) {
  const { open = 1, cross = 0, lookY = 0, blush = 0, ear = 0, mouth = 0 } = st;
  g.save(); g.translate(x, y);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const shapes = (ext) => {
    g.beginPath(); g.ellipse(0, 0, 74 + ext / 2, 62 + ext / 2, 0, 0, TAU); g.fill();
    for (const k of [-1, 1]) {
      g.save(); g.translate(k * 44, -40); g.rotate(k * (0.25 + 0.15 * ear));
      g.beginPath(); g.moveTo(-24, 14); g.quadraticCurveTo(-6, -40, 0, -46 - ext * 0.5); g.quadraticCurveTo(8, -40, 24, 14); g.closePath(); g.fill();
      if (ext) { g.lineWidth = ext; g.stroke(); }
      g.restore();
    }
  };
  g.fillStyle = C.ink; g.strokeStyle = C.ink; shapes(10);
  g.fillStyle = C.cat; g.strokeStyle = C.cat; shapes(0);
  g.fillStyle = C.nose;
  for (const k of [-1, 1]) { g.save(); g.translate(k * 44, -40); g.rotate(k * (0.25 + 0.15 * ear)); g.beginPath(); g.moveTo(-12, 6); g.quadraticCurveTo(-3, -24, 0, -28); g.quadraticCurveTo(4, -24, 12, 6); g.closePath(); g.fill(); g.restore(); }
  g.strokeStyle = C.catD; g.lineWidth = 7;
  for (const k of [-1, 0, 1]) { g.beginPath(); g.moveTo(k * 13, -58); g.lineTo(k * 13 + k * 2, -40); g.stroke(); }
  g.fillStyle = C.catCream; g.beginPath(); g.ellipse(0, 26, 40, 26, 0, 0, TAU); g.fill();
  // eyes: crossing toward the nose when the butterfly sits there
  for (const k of [-1, 1]) {
    const ex = k * 30, ey = -6;
    g.save();
    g.beginPath(); g.ellipse(ex, ey, 17, 20 * open, 0, 0, TAU); g.fillStyle = C.eye; g.fill(); g.clip();
    g.fillStyle = C.ink; g.beginPath(); g.ellipse(ex - k * 9 * cross, ey + 4 * cross + lookY * 7, 9, 15, 0, 0, TAU); g.fill();
    g.fillStyle = C.creamHi; g.beginPath(); g.arc(ex - 6 - k * 6 * cross, ey - 8, 4.5, 0, TAU); g.fill();
    g.restore();
    g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.ellipse(ex, ey, 17, 20 * open, 0, 0, TAU); g.stroke();
  }
  if (blush > 0.01) { g.globalAlpha = 0.55 * blush; g.fillStyle = C.rose; for (const k of [-1, 1]) { g.beginPath(); g.ellipse(k * 50, 24, 13, 7, 0, 0, TAU); g.fill(); } g.globalAlpha = 1; }
  g.fillStyle = C.nose; g.strokeStyle = C.ink; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-8, 14); g.lineTo(8, 14); g.lineTo(0, 22); g.closePath(); g.fill(); g.stroke();
  if (mouth > 0.05) { g.fillStyle = C.rose; g.beginPath(); g.ellipse(0, 34, 7, 8 * mouth, 0, 0, TAU); g.fill(); g.stroke(); }
  else { g.beginPath(); g.moveTo(0, 22); g.quadraticCurveTo(-2, 32, -11, 30); g.moveTo(0, 22); g.quadraticCurveTo(2, 32, 11, 30); g.stroke(); }
  g.lineWidth = 2.5;
  for (const k of [-1, 1]) for (const j of [-1, 1]) { g.beginPath(); g.moveTo(k * 36, 24 + j * 4); g.lineTo(k * 76, 18 + j * 10); g.stroke(); }
  g.restore();
}
export function drawPaw(g, x, y) {
  g.fillStyle = C.ink; g.beginPath(); g.ellipse(x, y, 24, 17, 0, 0, TAU); g.fill();
  g.fillStyle = C.catCream; g.beginPath(); g.ellipse(x, y, 19, 12.5, 0, 0, TAU); g.fill();
  g.strokeStyle = C.ink; g.lineWidth = 2.5;
  for (const k of [-1, 1]) { g.beginPath(); g.moveTo(x + k * 6, y + 2); g.lineTo(x + k * 6, y + 9); g.stroke(); }
}

// ======================================================================= the paper butterfly (the one accent)
/** origami butterfly: four flat facets per side; ph = wing phase (radians), open = 1 flat … 0 folded */
export function drawButterfly(g, x, y, size, ph, rot, open = 1) {
  const k = Math.max(0.12, (0.2 + 0.8 * Math.abs(Math.cos(ph))) * open + (1 - open) * 0.2);
  g.save(); g.translate(x, y); g.rotate(rot);
  const lw = Math.max(1.2, size * 0.05);
  g.lineJoin = 'round'; g.lineCap = 'round';
  for (const side of [-1, 1]) {
    g.save(); g.scale(side * k, 1);
    // forewing (two facets on the crease), hindwing (two facets)
    const fw = [[0, -size * 0.12], [size * 1.0, -size * 0.78], [size * 0.86, size * 0.06]];
    const crease = [size * 0.52, -size * 0.3];
    const hw = [[0, size * 0.04], [size * 0.8, size * 0.24], [size * 0.38, size * 0.74]];
    g.fillStyle = C.accentL; pathPoly(g, [fw[0], fw[1], crease]); g.fill();
    g.fillStyle = C.accent; pathPoly(g, [fw[0], crease, fw[1], fw[2]]); g.fill();
    g.fillStyle = C.accent; pathPoly(g, [hw[0], hw[1], [size * 0.5, size * 0.38]]); g.fill();
    g.fillStyle = C.accentD; pathPoly(g, [hw[0], [size * 0.5, size * 0.38], hw[2]]); g.fill();
    g.strokeStyle = C.ink; g.lineWidth = lw / Math.max(0.35, k);
    pathPoly(g, [fw[0], fw[1], fw[2]]); g.stroke();
    pathPoly(g, [hw[0], hw[1], hw[2]]); g.stroke();
    g.restore();
  }
  g.strokeStyle = C.ink; g.lineWidth = lw * 1.6;
  g.beginPath(); g.moveTo(0, -size * 0.2); g.lineTo(0, size * 0.5); g.stroke();
  g.lineWidth = lw;
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, -size * 0.2); g.quadraticCurveTo(s * size * 0.12, -size * 0.5, s * size * 0.26, -size * 0.56); g.stroke(); }
  g.restore();
}

// ======================================================================= lettering (baked once)
/** a speech balloon with a tail aimed at the speaker, baked; returns { c, x, y, px, py } (strip px, pivot = tail root) */
export function bakeBalloon({ cx, cy, rx, ry, tip, text, font, size, color = C.ink, dy = 0 }) {
  const pad = 30;
  const xs = [cx - rx, cx + rx, tip[0]], ys = [cy - ry, cy + ry, tip[1]];
  const x0 = Math.floor(Math.min(...xs) - pad), y0 = Math.floor(Math.min(...ys) - pad);
  const w = Math.ceil(Math.max(...xs) + pad) - x0, h = Math.ceil(Math.max(...ys) + pad) - y0;
  const { c, g } = mk(w, h);
  g.translate(-x0, -y0);
  const a = Math.atan2((tip[1] - cy) / ry, (tip[0] - cx) / rx);      // the tail leaves toward the speaker
  const dA = 0.26;
  const base = (aa) => [cx + rx * 0.82 * Math.cos(aa), cy + ry * 0.82 * Math.sin(aa)];
  const b0 = base(a - dA), b1 = base(a + dA);
  const mid = [(b0[0] + b1[0]) / 2, (b0[1] + b1[1]) / 2];
  const bend = [-(tip[1] - mid[1]) * 0.18, (tip[0] - mid[0]) * 0.18];   // a slight curve, like a pen stroke
  const shape = () => {
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU);
    g.moveTo(b0[0], b0[1]);
    g.quadraticCurveTo((b0[0] + tip[0]) / 2 + bend[0], (b0[1] + tip[1]) / 2 + bend[1], tip[0], tip[1]);
    g.quadraticCurveTo((b1[0] + tip[0]) / 2 + bend[0] * 0.4, (b1[1] + tip[1]) / 2 + bend[1] * 0.4, b1[0], b1[1]);
    g.closePath();
  };
  g.lineJoin = 'round';
  shape(); g.strokeStyle = C.ink; g.lineWidth = 9; g.stroke();
  shape(); g.fillStyle = C.creamHi; g.fill();
  g.fillStyle = color; g.font = `${font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, cx, cy + dy);
  return { c, x: x0, y: y0, px: mid[0], py: mid[1] };
}
/** narration box (square, flat offset shade) */
export function bakeCaption({ x, y, text, font, size }) {
  const { g: m } = mk(8, 8); m.font = font;
  const tw = m.measureText(text).width, w = Math.ceil(tw + 52), h = Math.ceil(size * 1.9);
  const { c, g } = mk(w + 14, h + 14);
  g.fillStyle = C.indigo1; g.fillRect(9, 9, w, h);
  g.fillStyle = C.creamHi; g.fillRect(2, 2, w, h);
  g.strokeStyle = C.ink; g.lineWidth = 4; g.strokeRect(2, 2, w, h);
  g.fillStyle = C.ink; g.font = font; g.textBaseline = 'middle'; g.fillText(text, 28, 2 + h / 2 + 1);
  return { c, x: x - 2, y: y - 2, w, h, px: x, py: y };
}
/** one hand-lettered SFX glyph: ink letter, thick cream border, thin ink rim; baked at 1.25× for the pop overshoot */
export function bakeGlyph(ch, font, size, { fill = C.ink, rim = C.cream, rimW = 0.12, edge = C.ink } = {}) {
  const S = 1.25, pad = Math.ceil(size * 0.4);
  const { g: m } = mk(8, 8); m.font = font.replace(/(\d+)px/, (_, n) => `${n * S}px`);
  const tw = m.measureText(ch).width;
  const w = Math.ceil(tw + 2 * pad * S), h = Math.ceil(size * S * 1.3 + 2 * pad * S);
  const { c, g } = mk(w, h);
  g.font = m.font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const cx = w / 2, cy = h / 2 + size * S * 0.04;
  g.strokeStyle = edge; g.lineWidth = size * S * (rimW * 2 + 0.07); g.strokeText(ch, cx, cy);
  g.strokeStyle = rim; g.lineWidth = size * S * rimW * 2; g.strokeText(ch, cx, cy);
  g.fillStyle = fill; g.fillText(ch, cx, cy);
  return { c, w: w / S, h: h / S, adv: tw / S };
}

// ======================================================================= baked panel layers (strip coordinates)
// Each painter fills its rect; main.js keeps { c, x, y, f } and draws it at y − f·d (d = panel's stop − scroll).
function lin(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); for (const [k, c] of stops) gr.addColorStop(k, c); return gr; }
function glow(g, x, y, r, rgb, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(0.45, `rgba(${rgb},${a * 0.35})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function stars(g, r, n, x0, x1, y0, y1, a = 0.85) {
  g.fillStyle = C.cream;
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, r()), y = lerp(y0, y1, r() * r()), s = 1.6 + 2.2 * r(); g.globalAlpha = a * (0.45 + 0.55 * r()); g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
}
function skyline(g, r, { x0, x1, ytop, ybot, hmin, hmax, wmin, wmax, color, win, winA = 0.7 }) {
  let x = x0;
  while (x < x1) {
    const w = lerp(wmin, wmax, r()), h = lerp(hmin, hmax, r()), y = ytop + (hmax - h);
    g.fillStyle = color; g.fillRect(x, y, w + 1, ybot - y);
    if (r() < 0.35) { g.fillRect(x + w * 0.3, y - 14, w * 0.18, 14); }
    if (r() < 0.25) { g.fillRect(x + w * 0.62, y - 30, 3, 30); }
    if (win) {
      g.fillStyle = win;
      for (let wy = y + 14; wy < ybot - 10; wy += 22) for (let wx = x + 8; wx < x + w - 10; wx += 18) if (r() < 0.16) { g.globalAlpha = winA * (0.5 + 0.5 * r()); g.fillRect(wx, wy, 7, 9); }
      g.globalAlpha = 1;
    }
    x += w + lerp(-4, 10, r());
  }
}
function catenary(x0, y0, x1, y1, sag, n = 40) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(x0, x1, u), lerp(y0, y1, u) + sag * 4 * u * (1 - u)]); }
  return pts;
}
function strokePts(g, pts) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.stroke(); }
function windows(g, r, x0, x1, y0, y1, dx, dy, w, h, pLit) {
  for (let y = y0; y < y1; y += dy) for (let x = x0; x < x1; x += dx) {
    const lit = r() < pLit;
    if (lit) glow(g, x + w / 2, y + h / 2, w * 1.4, '255,214,170', 0.22);
    g.fillStyle = lit ? C.winLit : C.winDark; rr(g, x, y, w, h, 6); g.fill();
    g.strokeStyle = C.ink; g.lineWidth = 3; g.stroke();
    if (lit) { g.fillStyle = 'rgba(214,160,130,0.55)'; g.fillRect(x + 3, y + h * 0.55, w - 6, 3); }
  }
}
function shrub(g, x, y, r, rnd, dark = C.indigo1, light = C.indigo2) {
  const blobs = [];
  for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.1 + 0.8 * rnd()), d = r * (0.3 + 0.5 * rnd()); blobs.push([x + Math.cos(a) * d, y + Math.sin(a) * d * 0.9, r * (0.42 + 0.25 * rnd())]); }
  g.fillStyle = C.ink; for (const [bx, by, br] of blobs) { g.beginPath(); g.arc(bx, by, br + 4, 0, TAU); g.fill(); }
  g.fillStyle = dark; for (const [bx, by, br] of blobs) { g.beginPath(); g.arc(bx, by, br, 0, TAU); g.fill(); }
  g.fillStyle = light; for (const [bx, by, br] of blobs) { g.beginPath(); g.arc(bx + br * 0.25, by - br * 0.3, br * 0.5, 0, TAU); g.fill(); }
}
function pot(g, x, y, w, h, col = C.rose) {
  g.fillStyle = col; g.strokeStyle = C.ink; g.lineWidth = 4;
  g.beginPath(); g.moveTo(x - w / 2, y - h); g.lineTo(x + w / 2, y - h); g.lineTo(x + w * 0.38, y); g.lineTo(x - w * 0.38, y); g.closePath(); g.fill(); g.stroke();
  g.fillRect(x - w / 2 - 4, y - h - 2, w + 8, 12); g.strokeRect(x - w / 2 - 4, y - h - 2, w + 8, 12);
}

// ---- panel 1: rooftop at sunset (rect 72..1008 × 260..900)
export const P1 = {
  sky(g) {
    g.fillStyle = lin(g, 260, 900, [[0, '#4c4a86'], [0.34, '#8a82ba'], [0.6, '#e2aca6'], [0.8, '#f7c8ad'], [1, '#fbdec5']]);
    g.fillRect(72, -80, 936, 1300);
    glow(g, 830, 770, 330, '255,236,214', 0.6);
    g.fillStyle = '#fff2de'; g.beginPath(); g.arc(830, 770, 62, 0, TAU); g.fill();
    stars(g, rand(11), 9, 100, 980, 280, 420, 0.7);
  },
  clouds(g) {
    for (const [x, y, w, h] of [[150, 470, 310, 30], [520, 418, 210, 22], [790, 560, 190, 20], [300, 604, 170, 16], [880, 470, 120, 14]]) {
      g.fillStyle = '#cdc0dc'; rr(g, x, y, w, h, h / 2); g.fill();
      g.fillStyle = '#f2bfac'; rr(g, x + h * 0.6, y + h * 0.55, w - h * 1.2, h * 0.45, h * 0.22); g.fill();
    }
  },
  far(g) {
    skyline(g, rand(12), { x0: 60, x1: 1030, ytop: 640, ybot: 1200, hmin: 40, hmax: 120, wmin: 46, wmax: 120, color: '#8c84b6', win: C.winLit, winA: 0.55 });
  },
  mid(g) {
    g.lineJoin = 'round';
    g.fillStyle = '#5c5891'; g.strokeStyle = C.ink; g.lineWidth = 4;
    g.fillRect(40, 770, 300, 500); g.strokeRect(40, 770, 300, 500);
    g.fillStyle = C.peach1; g.fillRect(40, 770, 300, 6);
    // water tank on legs
    g.strokeStyle = C.ink; g.lineWidth = 5;
    for (const lx of [160, 186, 236, 262]) { g.beginPath(); g.moveTo(lx, 740); g.lineTo(lx + (lx < 210 ? -6 : 6), 770); g.stroke(); }
    g.fillStyle = '#6d69a1'; rr(g, 150, 676, 122, 70, 10); g.fill(); g.lineWidth = 4; g.stroke();
    g.fillStyle = C.peach0; g.globalAlpha = 0.6; g.fillRect(250, 682, 14, 58); g.globalAlpha = 1;
    g.beginPath(); g.moveTo(144, 680); g.quadraticCurveTo(211, 640, 278, 680); g.closePath(); g.fillStyle = '#5c5891'; g.fill(); g.stroke();
    // right block + antenna
    g.fillStyle = '#58548b'; g.fillRect(846, 792, 220, 500); g.strokeRect(846, 792, 220, 500);
    g.fillStyle = C.peach1; g.fillRect(846, 792, 220, 6);
    g.lineWidth = 4; g.beginPath(); g.moveTo(940, 792); g.lineTo(940, 650); g.moveTo(912, 676); g.lineTo(968, 676); g.moveTo(920, 704); g.lineTo(960, 704); g.stroke();
  },
  near(g) {
    const r = rand(13);
    g.fillStyle = C.wall; g.fillRect(40, 830, 1000, 360);
    g.strokeStyle = 'rgba(43,38,67,0.35)'; g.lineWidth = 2.5;
    for (let y = 856, row = 0; y < 1180; y += 26, row++) {
      g.beginPath(); g.moveTo(40, y); g.lineTo(1040, y); g.stroke();
      for (let x = 40 + (row % 2) * 30; x < 1040; x += 60) { g.beginPath(); g.moveTo(x, y - 26); g.lineTo(x, y); g.stroke(); }
    }
    g.fillStyle = 'rgba(246,195,167,0.18)'; g.fillRect(40, 830, 1000, 40);
    g.fillStyle = C.peach1; g.fillRect(40, 812, 1000, 20);
    g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.moveTo(40, 812); g.lineTo(1040, 812); g.moveTo(40, 832); g.lineTo(1040, 832); g.stroke();
    pot(g, 196, 812, 74, 50);
    shrub(g, 196, 760, 52, r, '#4a4878', '#6a679a');
  },
  wires(g) {
    g.strokeStyle = C.ink; g.lineWidth = 4;
    strokePts(g, catenary(40, 318, 1040, 286, 64));
    g.lineWidth = 3; strokePts(g, catenary(40, 352, 1040, 330, 54));
  },
};

// ---- panel 2: the eyes (band 72..1008 × 1040..1360)
export const P2 = {
  fur(g) {
    g.fillStyle = C.cat; g.fillRect(40, 900, 1000, 600);
    const gr = g.createRadialGradient(540, 1220, 40, 540, 1220, 560);
    gr.addColorStop(0, 'rgba(150,145,190,0.55)'); gr.addColorStop(1, 'rgba(150,145,190,0)');
    g.fillStyle = gr; g.fillRect(40, 900, 1000, 600);
    // warm sunset rim from the right
    const rim = g.createLinearGradient(1008, 0, 760, 0);
    rim.addColorStop(0, 'rgba(246,190,160,0.35)'); rim.addColorStop(1, 'rgba(246,190,160,0)');
    g.fillStyle = rim; g.fillRect(40, 900, 1000, 600);
    // forehead stripes
    g.fillStyle = C.catD;
    for (const [x, w] of [[488, 26], [540, 30], [592, 26]]) { g.beginPath(); g.moveTo(x - w / 2, 960); g.quadraticCurveTo(x, 1130, x + w / 2, 960); g.closePath(); g.fill(); }
    // fur tufts
    const r = rand(21);
    g.strokeStyle = C.catD; g.lineWidth = 5; g.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const x = lerp(80, 1000, r()), y = lerp(1050, 1350, r());
      if (Math.abs(x - 330) < 150 && Math.abs(y - 1196) < 120) continue;
      if (Math.abs(x - 750) < 150 && Math.abs(y - 1196) < 120) continue;
      g.globalAlpha = 0.45; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8, y + 10, x + 4, y + 24); g.stroke();
    }
    g.globalAlpha = 1;
    // muzzle and nose bridge at the bottom centre
    g.fillStyle = C.catCream;
    g.beginPath(); g.moveTo(400, 1500); g.bezierCurveTo(420, 1300, 500, 1272, 540, 1272); g.bezierCurveTo(580, 1272, 660, 1300, 680, 1500); g.closePath(); g.fill();
    g.strokeStyle = C.ink; g.lineWidth = 5; g.beginPath(); g.moveTo(540, 1316); g.lineTo(540, 1372); g.stroke();
    g.fillStyle = C.nose; g.beginPath(); g.moveTo(500, 1330); g.quadraticCurveTo(540, 1310, 580, 1330); g.lineTo(540, 1372); g.closePath(); g.fill();
    g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke();
  },
};

// ---- panel 3: the ledge (quad (72,1580) (1008,1500) (1008,2560) (72,2800))
export const P3 = {
  sky(g) {
    g.fillStyle = lin(g, 1500, 2800, [[0, '#2f2d5c'], [0.32, '#4d4a86'], [0.66, '#8a7db4'], [0.86, '#d69a9b'], [1, '#efb9a2']]);
    g.fillRect(72, 1180, 936, 1960);
    stars(g, rand(31), 22, 90, 1000, 1500, 2000, 0.85);
  },
  city(g) {
    skyline(g, rand(32), { x0: 60, x1: 1030, ytop: 2420, ybot: 3200, hmin: 50, hmax: 170, wmin: 50, wmax: 130, color: '#6c649c', win: C.winLit, winA: 0.6 });
  },
  terrace(g) {
    // the lower terrace far below: a hint of where the leap goes (string lights + a tiny box)
    g.fillStyle = '#4c4677'; g.fillRect(40, 2700, 620, 400);
    g.fillStyle = 'rgba(240,180,160,0.35)'; g.fillRect(40, 2700, 620, 8);
    g.strokeStyle = C.ink; g.lineWidth = 2.5; strokePts(g, catenary(40, 2630, 660, 2650, 30));
    for (let i = 1; i < 13; i++) { const u = i / 13, x = lerp(40, 660, u), y = lerp(2630, 2650, u) + 30 * 4 * u * (1 - u); glow(g, x, y + 4, 16, '255,236,200', 0.55); g.fillStyle = C.cream; g.beginPath(); g.arc(x, y + 4, 3.5, 0, TAU); g.fill(); }
    g.fillStyle = C.box; g.strokeStyle = C.ink; g.lineWidth = 2.5; g.fillRect(318, 2690, 44, 30); g.strokeRect(318, 2690, 44, 30);
  },
  building(g) {
    const r = rand(33);
    g.fillStyle = C.wall; g.fillRect(596, 1862, 470, 1200);
    g.fillStyle = 'rgba(240,180,160,0.4)'; g.fillRect(596, 1862, 12, 1200);
    windows(g, r, 664, 1010, 1960, 2700, 120, 160, 64, 86, 0.45);
    g.strokeStyle = C.ink; g.lineWidth = 5; g.beginPath(); g.moveTo(596, 1862); g.lineTo(596, 3062); g.stroke();
    g.fillStyle = C.wallD; g.fillRect(624, 1862, 14, 1200); g.strokeStyle = C.ink; g.lineWidth = 3; g.strokeRect(624, 1862, 14, 1200);
    g.fillStyle = C.peach1; g.fillRect(586, 1840, 480, 22);
    g.strokeStyle = C.ink; g.lineWidth = 4; g.strokeRect(586, 1840, 480, 22);
    pot(g, 958, 1840, 62, 44, '#c98a8a');
    shrub(g, 958, 1792, 42, r, '#4a4878', '#6a679a');
  },
};

// ---- panel 4: the held moment (rect 200..680 × 3420..3860)
export const P4 = {
  sky(g) {
    g.fillStyle = lin(g, 3420, 3860, [[0, '#24224a'], [0.6, '#3d3b72'], [1, '#5b5793']]);
    g.fillRect(200, 3150, 480, 980);
    const r = rand(41);
    stars(g, r, 9, 220, 660, 3440, 3700, 0.9);
    // a four-point sparkle
    g.fillStyle = C.cream; g.save(); g.translate(270, 3500);
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, d = i % 2 ? 3 : 13; g.lineTo(Math.cos(a) * d, Math.sin(a) * d); } g.closePath(); g.fill(); g.restore();
    // crescent moon
    const m = mk(90, 90);
    m.g.fillStyle = C.cream; m.g.beginPath(); m.g.arc(45, 45, 32, 0, TAU); m.g.fill();
    m.g.globalCompositeOperation = 'destination-out'; m.g.beginPath(); m.g.arc(60, 36, 28, 0, TAU); m.g.fill();
    glow(g, 600, 3500, 90, '255,240,214', 0.25);
    g.drawImage(m.c, 555, 3455);
    // the destination, far below: a string of lights
    g.strokeStyle = 'rgba(43,38,67,0.8)'; g.lineWidth = 2; strokePts(g, catenary(200, 3800, 680, 3790, 20));
    for (let i = 1; i < 10; i++) { const u = i / 10, x = lerp(200, 680, u), y = lerp(3800, 3790, u) + 80 * u * (1 - u); glow(g, x, y + 3, 12, '255,236,200', 0.5); g.fillStyle = C.cream; g.beginPath(); g.arc(x, y + 3, 2.6, 0, TAU); g.fill(); }
  },
};

// ---- panel 5: the terrace, full bleed (0..1080 × 4080..6160)
export const P5 = {
  sky(g) {
    g.fillStyle = lin(g, 4080, 5270, [[0, '#211f45'], [0.36, '#38366e'], [0.64, '#6a65a2'], [0.84, '#b597b8'], [0.95, '#efb3a0'], [1, '#f9d4b8']]);
    g.fillRect(0, 4080, 1080, 2400);
    glow(g, 540, 5250, 620, '252,214,186', 0.35);
    stars(g, rand(51), 26, 20, 1060, 4120, 4720, 0.85);
  },
  city(g) {
    skyline(g, rand(52), { x0: -10, x1: 1090, ytop: 5040, ybot: 5600, hmin: 40, hmax: 150, wmin: 46, wmax: 120, color: '#5d5891', win: C.winLit, winA: 0.65 });
  },
  terrace(g) {
    const r = rand(53);
    // floor in perspective (vanishing point above the box)
    g.fillStyle = lin(g, 5262, 6160, [[0, '#c69ca1'], [0.35, '#9c7f99'], [1, '#5f557f']]);
    g.fillRect(0, 5262, 1080, 1000);
    g.strokeStyle = 'rgba(43,38,67,0.22)'; g.lineWidth = 3;
    for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(540 + i * 60, 5262); g.lineTo(540 + i * 466, 6262); g.stroke(); }
    for (let k = 0; k < 7; k++) { const y = 5262 + 900 * Math.pow(k / 7, 1.7) + 10; g.beginPath(); g.moveTo(0, y); g.lineTo(1080, y); g.stroke(); }
    // railing
    g.fillStyle = C.indigo1; g.strokeStyle = C.ink; g.lineWidth = 3.5;
    for (let x = 30; x < 1080; x += 84) { g.fillRect(x - 4, 5186, 8, 76); g.strokeRect(x - 4, 5186, 8, 76); }
    g.fillStyle = C.indigo2; g.fillRect(-10, 5174, 1100, 14); g.lineWidth = 4; g.strokeRect(-10, 5174, 1100, 14);
    g.fillStyle = C.peach1; g.fillRect(-10, 5174, 1100, 4);
    g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 5262); g.lineTo(1080, 5262); g.stroke();
    // box shadow on the floor
    const sh = g.createRadialGradient(560, 5440, 10, 560, 5440, 230);
    sh.addColorStop(0, 'rgba(43,38,67,0.45)'); sh.addColorStop(1, 'rgba(43,38,67,0)');
    g.save(); g.translate(560, 5440); g.scale(1, 0.22); g.translate(-560, -5440); g.fillStyle = sh; g.fillRect(300, 5200, 520, 480); g.restore();
    // planters
    pot(g, 130, 5420, 140, 110, '#b98186');
    shrub(g, 130, 5300, 92, r, '#3e3c6a', '#5c5990');
    pot(g, 960, 5400, 110, 96, '#b98186');
    shrub(g, 960, 5296, 74, r, '#3e3c6a', '#5c5990');
  },
  lights(g) {
    g.strokeStyle = C.ink; g.lineWidth = 3;
    const A = catenary(-30, 4620, 1110, 4590, 180, 60);
    strokePts(g, A);
    for (let i = 2; i < 60; i += 4) {
      const [x, y] = A[i];
      glow(g, x, y + 10, 44, '255,232,196', 0.4);
      g.fillStyle = C.cream; g.strokeStyle = C.ink; g.lineWidth = 2.5;
      g.beginPath(); g.ellipse(x, y + 10, 7, 9, 0, 0, TAU); g.fill(); g.stroke();
    }
  },
  leaves(g) {
    const leaf = (x, y, L, a, w) => {
      g.save(); g.translate(x, y); g.rotate(a);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * 0.5, -w, L, 0); g.quadraticCurveTo(L * 0.5, w, 0, 0); g.closePath();
      g.fillStyle = '#2a284c'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke();
      g.strokeStyle = '#45437a'; g.lineWidth = 3; g.beginPath(); g.moveTo(8, 0); g.lineTo(L * 0.85, 0); g.stroke();
      g.restore();
    };
    for (const [x, y, L, a, w] of [[-40, 5760, 330, -0.75, 70], [-30, 5840, 360, -0.35, 74], [10, 5900, 280, -1.15, 60], [1120, 5740, 320, Math.PI + 0.7, 66], [1110, 5860, 360, Math.PI + 0.3, 72], [1080, 5920, 260, Math.PI + 1.1, 56]]) leaf(x, y, L, a, w);
  },
};

/** the cardboard box (front three-quarter), bottom-centre at (x, y); sq = squash (−: squashed) */
export function drawBox(g, x, y, sq, part) {
  const sx = 1 - 0.8 * sq, sy = 1 + sq;
  g.save(); g.translate(x, y); g.scale(sx, sy);
  const w = 290, h = 186, d = 64;
  g.lineJoin = 'round'; g.strokeStyle = C.ink; g.lineWidth = 5;
  if (part === 'back') {
    // inside of the box + back and side flaps
    g.fillStyle = C.boxD; pathPoly(g, [[-w / 2 + 14, -h - 56], [w / 2 + d * 0.6, -h - 70], [w / 2 + d, -h - d * 0.55], [-w / 2, -h]]); g.fill(); g.stroke();
    g.fillStyle = C.boxIn; pathPoly(g, [[-w / 2, -h], [-w / 2 + 22, -h - d * 0.55], [w / 2 + d * 0.62, -h - d * 0.55], [w / 2 + d * 0.0 + 6, -h]]); g.fill(); g.stroke();
    g.fillStyle = C.boxL; pathPoly(g, [[-w / 2 + 22, -h - d * 0.55], [-w / 2 - 34, -h - d * 1.4], [-w / 2 - 50, -h - 10], [-w / 2, -h]]); g.fill(); g.stroke();
  } else {
    // side face, front face, front flap, tape
    g.fillStyle = C.boxD; pathPoly(g, [[w / 2, -h], [w / 2 + d * 0.62, -h - d * 0.55], [w / 2 + d * 0.62, -d * 0.55], [w / 2, 0]]); g.fill(); g.stroke();
    g.fillStyle = C.box; g.fillRect(-w / 2, -h, w, h); g.strokeRect(-w / 2, -h, w, h);
    g.fillStyle = C.boxL; g.globalAlpha = 0.6; g.fillRect(-w / 2 + 6, -h + 6, w - 12, 10); g.globalAlpha = 1;
    g.fillStyle = C.boxL; pathPoly(g, [[-w / 2, -h], [w / 2, -h], [w / 2 - 10, -h + 52], [-w / 2 + 10, -h + 52]]); g.fill(); g.stroke();
    g.fillStyle = '#e9cfae'; g.fillRect(-26, -h + 52, 52, h - 52); g.lineWidth = 3; g.strokeRect(-26, -h + 52, 52, h - 52);
    g.strokeStyle = 'rgba(43,38,67,0.4)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-w / 2 + 34, -40); g.lineTo(-w / 2 + 84, -40); g.moveTo(-w / 2 + 34, -26); g.lineTo(-w / 2 + 70, -26); g.stroke();
  }
  g.restore();
}

/** paper tile (scrolls with the strip) */
export function bakePaper(w, h) {
  const { c, g } = mk(w, h), r = rand(7);
  g.fillStyle = C.paper; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) {
    const x = r() * w, y = r() * h, s = 1.5 + 3 * r();
    g.fillStyle = r() < 0.5 ? 'rgba(160,138,100,0.06)' : 'rgba(255,255,255,0.12)';
    g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
  }
  for (let i = 0; i < 40; i++) {
    const x = r() * w, y = r() * h;
    const gr = g.createRadialGradient(x, y, 0, x, y, 60 + 120 * r());
    gr.addColorStop(0, 'rgba(200,180,140,0.05)'); gr.addColorStop(1, 'rgba(200,180,140,0)');
    g.fillStyle = gr; g.fillRect(x - 200, y - 200, 400, 400);
  }
  return c;
}
