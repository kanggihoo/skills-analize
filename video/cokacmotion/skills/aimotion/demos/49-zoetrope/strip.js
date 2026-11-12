/*
 * 49-zoetrope/strip.js — the paper animation strip, drawn once in setup (Canvas 2D).
 * Twelve drawings of a galloping horse, one per cell. The gait is computed, not copied: a body that rises in the
 * suspension phase and pitches, four legs whose hooves follow stance (on the ground, sliding back) and swing
 * (lifted, folded, carried forward) trajectories with transverse-gallop phase offsets, solved with two-bone IK
 * (forelegs fold at the knee forward, hind legs at the hock backward). Each cell is inked separately with its own
 * small hand error, on cream paper with printed borders and a cell number.
 * Cell j is centred at drum angle ψ = j·30°. Because a slit reaches the viewer before the one at the next lower
 * angle, the drawing seen advances as j DEcreases — so cell j carries gait phase ((12 − j) mod 12) / 12.
 */
import { rand, clamp, lerp } from '../_lib/stage.js';

export const CELLS = 12, CW = 320, SH = 286;    // cell width, strip height (px) — the strip band's aspect on the drum

const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };

function ik(S, F, L1, L2, bendSign) {
  let dx = F[0] - S[0], dy = F[1] - S[1], d = Math.hypot(dx, dy);
  const dmax = L1 + L2 - 0.6, dmin = Math.abs(L1 - L2) + 2;
  const dc = clamp(d, dmin, dmax);
  if (d < 1e-6) { dx = 0; dy = 1; d = 1; }
  const ux = dx / d, uy = dy / d;
  const a = (L1 * L1 - L2 * L2 + dc * dc) / (2 * dc), h = Math.sqrt(Math.max(L1 * L1 - a * a, 0));
  const J = [S[0] + ux * a - uy * h * bendSign, S[1] + uy * a + ux * h * bendSign];
  const E = [S[0] + ux * dc, S[1] + uy * dc];
  return { J, E };
}

// gait: transverse gallop. phase offsets of stance start, stance fraction
const LEGS = [
  { name: 'LH', hind: true, near: true, off: 0.0 },
  { name: 'RH', hind: true, near: false, off: 0.09 },
  { name: 'LF', hind: false, near: true, off: 0.33 },
  { name: 'RF', hind: false, near: false, off: 0.42 },
];
const STANCE = 0.3;

function drawHorse(c, p, cx, gy, R) {
  const J = (k = 1.0) => (R() - 0.5) * k;                // the hand's small error
  const lift = 9 * Math.cos(2 * Math.PI * (p - 0.82));    // highest in the suspension phase
  const pitch = 0.07 * Math.sin(2 * Math.PI * (p - 0.12));
  const nod = 0.16 * Math.sin(2 * Math.PI * (p - 0.35));
  const bx = cx - 8, by = gy - 118 - lift;
  const rot = (x, y) => [bx + x * Math.cos(pitch) - y * Math.sin(pitch), by + x * Math.sin(pitch) + y * Math.cos(pitch)];
  const INK = '#24170c', FAR = '#5e4632';

  // legs: far side first (lighter ink), then the body, then the near legs
  const leg = (L, ink) => {
    const attach = L.hind ? rot(-50, 6) : rot(54, 12);
    const L1 = L.hind ? 56 : 50, L2 = L.hind ? 58 : 54, A = L.hind ? 40 : 46, Hs = L.hind ? 34 : 52;
    const q = (((p - L.off) % 1) + 1) % 1;
    const baseX = attach[0] + (L.hind ? 6 : 10);
    let F;
    if (q < STANCE) F = [baseX + A - 2 * A * (q / STANCE), gy - 6];
    else {
      const u = (q - STANCE) / (1 - STANCE);
      const fx = baseX - A + 2 * A * smooth(u * 1.15 - 0.05);
      const fy = gy - 6 - Hs * Math.pow(Math.sin(Math.PI * u), 0.8) - (L.hind ? 0 : 14 * Math.sin(Math.PI * clamp(u * 1.6)));
      F = [fx, fy];
    }
    const { J: K, E } = ik(attach, F, L1, L2, L.hind ? 1 : -1);   // hock folds back, knee forward
    // tapered limbs as filled quads; hoof as a small wedge
    const seg = (a, b, w0, w1) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      c.beginPath();
      c.moveTo(a[0] + nx * w0 + J(), a[1] + ny * w0 + J());
      c.lineTo(b[0] + nx * w1 + J(), b[1] + ny * w1 + J());
      c.lineTo(b[0] - nx * w1 + J(), b[1] - ny * w1 + J());
      c.lineTo(a[0] - nx * w0 + J(), a[1] - ny * w0 + J());
      c.fill();
      c.beginPath(); c.arc(b[0], b[1], w1, 0, Math.PI * 2); c.fill();
    };
    c.fillStyle = ink;
    seg(attach, K, L.hind ? 17 : 13, L.hind ? 8 : 7.5);
    seg(K, E, 6, 4.5);
    // pastern + hoof: angled a little forward of the cannon
    const dx = E[0] - K[0], dy = E[1] - K[1], l = Math.hypot(dx, dy) || 1;
    const ang = Math.atan2(dy, dx) - (q < STANCE ? 0.5 : -0.3) * (L.hind ? 1 : 1);
    const H = [E[0] + Math.cos(ang) * 11, E[1] + Math.sin(ang) * 11];
    seg(E, H, 4.5, 6);
  };
  LEGS.filter((L) => !L.near).forEach((L) => leg(L, FAR));

  c.fillStyle = INK;
  // tail: a tuft streaming back, lifting at speed
  c.lineCap = 'round';
  c.strokeStyle = INK;
  const tb = rot(-70, -16);
  for (let k = 0; k < 9; k++) {
    const sw = 6 * Math.sin(2 * Math.PI * (p + k * 0.04));
    c.lineWidth = 7 - k * 0.6;
    c.beginPath();
    c.moveTo(tb[0], tb[1]);
    c.quadraticCurveTo(tb[0] - 30, tb[1] - 8 + sw * 0.5 + k * 1.5, tb[0] - 58 - k * 2 + J(2), tb[1] + 10 + sw + k * 3 + J(2));
    c.stroke();
  }
  // barrel, chest, hindquarters
  const blob = (x, y, rx, ry, a = 0) => { const [px, py] = rot(x, y); c.beginPath(); c.ellipse(px + J(), py + J(), rx, ry, pitch + a, 0, Math.PI * 2); c.fill(); };
  blob(0, 0, 70, 33);
  blob(48, 4, 30, 34, -0.3);
  blob(-46, -4, 34, 36, 0.2);
  // neck and head, nodding about the withers
  const w = rot(38, -22);
  const hr = (x, y) => { const ca = Math.cos(nod), sa = Math.sin(nod), dx = x - 38, dy = y + 22; return rot(38 + dx * ca - dy * sa, -22 + dx * sa + dy * ca); };
  const neck = [hr(28, -28), hr(70, -66), hr(88, -84), hr(100, -78), hr(98, -58), hr(84, -30), hr(70, 18), hr(40, 20)];
  c.beginPath(); neck.forEach((q, i) => (i ? c.lineTo(q[0] + J(), q[1] + J()) : c.moveTo(q[0], q[1]))); c.fill();
  const head = [hr(86, -86), hr(96, -96), hr(106, -90), hr(140, -60), hr(146, -50), hr(140, -42), hr(118, -40), hr(100, -52)];
  c.beginPath(); head.forEach((q, i) => (i ? c.lineTo(q[0] + J(0.6), q[1] + J(0.6)) : c.moveTo(q[0], q[1]))); c.fill();
  const ear = [hr(90, -90), hr(92, -108), hr(99, -94)];
  c.beginPath(); ear.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.fill();
  // mane: short strokes off the crest of the neck
  c.lineWidth = 3;
  for (let k = 0; k < 9; k++) {
    const a = hr(30 + k * 7, -32 - k * 6.2), b = hr(22 + k * 7 - 6 * Math.cos(2 * Math.PI * p), -36 - k * 6.2 - 6);
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0] + J(2), b[1] + J(2)); c.stroke();
  }
  // near legs over the body
  LEGS.filter((L) => L.near).forEach((L) => leg(L, INK));
  // the eye and nostril, scratched out of the ink
  c.fillStyle = '#efe2c2';
  const eye = hr(108, -78);
  c.beginPath(); c.arc(eye[0], eye[1], 2.2, 0, Math.PI * 2); c.fill();
}

export function makeStrip() {
  const R = rand(4949);
  const cv = document.createElement('canvas');
  cv.width = CW * CELLS; cv.height = SH;
  const c = cv.getContext('2d');
  // cream paper, uneven tone, fibres, foxing
  c.fillStyle = '#efe3c3';
  c.fillRect(0, 0, cv.width, cv.height);
  const img = c.getImageData(0, 0, cv.width, cv.height), d = img.data;
  for (let y = 0; y < SH; y++) for (let x = 0; x < cv.width; x++) {
    const i = (y * cv.width + x) * 4;
    const n = (Math.sin(x * 0.013 + Math.sin(y * 0.05) * 2) + Math.sin(x * 0.0041 + y * 0.02)) * 4 + (R() - 0.5) * 10;
    d[i] = clamp(d[i] + n, 0, 255); d[i + 1] = clamp(d[i + 1] + n * 0.95, 0, 255); d[i + 2] = clamp(d[i + 2] + n * 0.8, 0, 255);
  }
  c.putImageData(img, 0, 0);
  for (let k = 0; k < 60; k++) {   // foxing spots
    const x = R() * cv.width, y = R() * SH, r = 2 + R() * 9;
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(150,100,40,0.18)'); g.addColorStop(1, 'rgba(150,100,40,0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  // printed borders
  c.fillStyle = '#3a2716';
  c.fillRect(0, 10, cv.width, 3); c.fillRect(0, 17, cv.width, 1.2);
  c.fillRect(0, SH - 13, cv.width, 3); c.fillRect(0, SH - 18.2, cv.width, 1.2);
  const GY = SH - 34;
  for (let j = 0; j < CELLS; j++) {
    const x0 = j * CW, cx = x0 + CW / 2;
    const p = ((CELLS - j) % CELLS) / CELLS;
    // ground: a dashed ruled line and a soft shadow under the horse
    c.fillStyle = 'rgba(58,39,22,0.55)';
    for (let x = x0 + 6; x < x0 + CW - 6; x += 9) c.fillRect(x, GY + 2 + (R() - 0.5), 5, 1.4);
    const sh = c.createRadialGradient(cx, GY, 0, cx, GY, 110);
    sh.addColorStop(0, 'rgba(60,40,20,0.22)'); sh.addColorStop(1, 'rgba(60,40,20,0)');
    c.save(); c.translate(cx, GY); c.scale(1, 0.12); c.translate(-cx, -GY); c.fillStyle = sh; c.fillRect(cx - 110, GY - 110, 220, 220); c.restore();
    c.save(); c.translate(cx, GY); c.scale(0.82, 0.82); c.translate(-cx, -GY);
    drawHorse(c, p, cx, GY, R);
    c.restore();
    // cell number, and a faint separating tick
    c.fillStyle = '#3a2716';
    c.font = 'italic 600 15px Georgia, serif';
    c.textAlign = 'left';
    c.fillText(String(j + 1), x0 + 10, SH - 22);
    c.fillRect(x0, 24, 1, 8); c.fillRect(x0, SH - 31, 1, 8);
  }
  return cv;
}
