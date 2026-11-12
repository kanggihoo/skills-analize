/*
 * props.js — street furniture as projected boxes, re-coloured every frame by the scene light and sorted by depth
 * together with the ghosts: tram shelters, signals, catenary, lamps, benches, the kiosk, planters, bollards, trees.
 */
import { clamp } from '../_lib/stage.js';
import { proj, hex, mix, mul, scale, add, css, shade } from './cam.js';
import { ZS, TREE, TREE2, LAMPS, BENCHES, KIOSK, SHELTERS, SIGNALS, POLES } from './town.js';
import { SIGNAL_DUTY, RED_HEX } from './traffic.js';

/** visible faces of an axis-aligned box (camera at the origin, 20 m up) */
export function box(x0, x1, z0, z1, y0, y1, alb, extra = {}) {
  const F = [];
  const add4 = (n, P) => F.push({ n, scr: P.map((p) => proj(p[0], p[1], p[2])), alb });
  if (z0 > 0) add4([0, 0, -1], [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]]);
  if (x1 < 0) add4([1, 0, 0], [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]]);
  if (x0 > 0) add4([-1, 0, 0], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]]);
  if (y1 < 20) add4([0, 1, 0], [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]);
  return { faces: F, z: extra.z ?? (z0 + z1) / 2, ...extra };
}
const quad = (g, q) => { g.beginPath(); g.moveTo(q[0][0], q[0][1]); for (let i = 1; i < q.length; i++) g.lineTo(q[i][0], q[i][1]); g.closePath(); };
function drawBox(g, b, L, k = 1) {
  for (const f of b.faces) {
    g.fillStyle = css(scale(shade(f.alb, f.n, L), k)); quad(g, f.scr); g.fill();
    g.strokeStyle = g.fillStyle; g.lineWidth = 0.7; g.stroke();
  }
}

const C = {
  metal: hex('#4a5060'), roof: hex('#5f8d8b'), glass: hex('#a9c1cf'), wood: hex('#b07a52'), cream: hex('#efe6d4'),
  teal: hex('#5f8d8b'), planter: hex('#b9a58c'), shrub: hex('#6f9a5b'), shrubD: hex('#4f7a4a'), post: hex('#3f4554'),
  goods: ['#e0b04f', '#7aa35e', '#e7e1d4', '#c98f6b'].map(hex), bark: hex('#6b5442'), leafD: hex('#5a8a52'), leafL: hex('#86b067'),
};
const CANOPY = [[0, 0, 0.78], [-0.55, 0.18, 0.55], [0.55, 0.12, 0.6], [-0.25, -0.5, 0.55], [0.32, -0.42, 0.55], [0, 0.42, 0.6]];

export function buildProps() {
  const P = [];
  // tram shelters: glass back panel behind the riders, roof in front of them (it is higher, nearer the window)
  for (const s of SHELTERS) {
    P.push({ kind: 'glass', ...box(s.x0, s.x1, s.z + 0.6, s.z + 0.68, 0.15, 2.45, C.glass), z: s.z + 0.64 });
    P.push({ kind: 'box', ...box(s.x0 + 0.2, s.x0 + 0.32, s.z + 0.5, s.z + 0.62, 0, 2.5, C.metal), z: s.z + 0.56 });
    P.push({ kind: 'box', ...box(s.x1 - 0.32, s.x1 - 0.2, s.z + 0.5, s.z + 0.62, 0, 2.5, C.metal), z: s.z + 0.56 });
    P.push({ kind: 'box', ...box(s.x0, s.x1, s.z - 0.75, s.z + 0.75, 2.5, 2.66, C.roof), z: s.z - 1.2 });
  }
  // catenary: two poles per side street edge, span wires and the contact wires over each track
  for (const p of POLES) for (const z of [ZS.nearWalk - 0.6, ZS.road1 + 0.6]) P.push({ kind: 'box', ...box(p.x - 0.1, p.x + 0.1, z - 0.1, z + 0.1, 0, 6.3, C.post) });
  P.push({ kind: 'wires', z: ZS.wbTrack - 0.2, lines: [[-200, 5.7, ZS.wbTrack, 200, 5.7, ZS.wbTrack], ...POLES.map((p) => [p.x, 6.2, ZS.nearWalk - 0.6, p.x, 6.2, ZS.road1 + 0.6])] });
  P.push({ kind: 'wires', z: ZS.ebTrack - 0.2, lines: [[-200, 5.7, ZS.ebTrack, 200, 5.7, ZS.ebTrack]] });
  // signals: pole + a head with three lamps facing the window
  for (const s of SIGNALS) {
    P.push({ kind: 'box', ...box(s.x - 0.08, s.x + 0.08, s.z - 0.08, s.z + 0.08, 0, 3.0, C.post) });
    const head = box(s.x - 0.17, s.x + 0.17, s.z - 0.3, s.z - 0.08, 2.75, 3.75, C.post, { z: s.z - 0.2 });
    head.kind = 'signal'; head.lamps = [3.55, 3.25, 2.95].map((y) => proj(s.x, y, s.z - 0.31)); head.size = 700 / proj(s.x, 3, s.z)[2];
    head.duty = s.z > 30 ? SIGNAL_DUTY.cross : SIGNAL_DUTY.main;
    P.push(head);
  }
  // lamps
  for (const lp of LAMPS) P.push({ kind: 'lamp', z: lp.z, b: proj(lp.x, 0, lp.z), tp: proj(lp.x, lp.h, lp.z), arm: proj(lp.x + 0.8, lp.h - 0.1, lp.z) });
  // benches: seat, back (on the window side: the sitters face the street)
  for (const b of BENCHES) {
    P.push({ kind: 'box', ...box(b.x - 1.05, b.x + 1.05, b.z - 0.25, b.z + 0.25, 0.4, 0.48, C.wood), z: b.z + 0.02 });
    P.push({ kind: 'box', ...box(b.x - 1.05, b.x + 1.05, b.z - 0.33, b.z - 0.26, 0.5, 0.95, C.wood), z: b.z - 0.3 });
    for (const dx of [-0.9, 0.9]) P.push({ kind: 'box', ...box(b.x + dx - 0.05, b.x + dx + 0.05, b.z - 0.3, b.z + 0.2, 0, 0.4, C.metal), z: b.z - 0.31 });
  }
  // the kiosk: a back room, an open counter facing the window, a roof
  const K = KIOSK;
  P.push({ kind: 'box', ...box(K.x0, K.x1, 9.9, K.z1, 0, 2.5, C.cream) });
  P.push({ kind: 'box', ...box(K.x0, K.x0 + 0.12, 8.5, 9.9, 0, 2.5, C.cream), z: 9.2 });
  P.push({ kind: 'box', ...box(K.x1 - 0.12, K.x1, 8.5, 9.9, 0, 2.5, C.cream), z: 9.2 });
  P.push({ kind: 'box', ...box(K.x0, K.x1, 8.4, 8.85, 0, 1.05, C.teal), z: 8.62 });
  for (let i = 0; i < 6; i++) P.push({ kind: 'box', ...box(K.x0 + 0.3 + i * 0.6, K.x0 + 0.75 + i * 0.6, 8.48, 8.8, 1.05, 1.3 + (i % 3) * 0.06, C.goods[i % 4]), z: 8.6 });
  P.push({ kind: 'box', ...box(K.x0 - 0.3, K.x1 + 0.3, 8.1, K.z1 + 0.2, 2.5, 2.72, C.teal), z: 8.0 });
  // planters and bollards along the plaza edge
  for (const x of [-27, -2.5, 15.5]) {
    P.push({ kind: 'box', ...box(x - 0.9, x + 0.9, 12.1, 12.8, 0, 0.5, C.planter) });
    P.push({ kind: 'shrub', z: 12.4, c: proj(x, 0.85, 12.45), r: 0.55 * (700 / proj(x, 0.8, 12.45)[2]) });
  }
  for (let x = -24; x <= 24; x += 4) if (Math.abs(x - 15.5) > 2 && Math.abs(x + 2.5) > 2) P.push({ kind: 'box', ...box(x - 0.1, x + 0.1, 12.85, 13.05, 0, 0.8, C.post) });
  for (const tr of [TREE, TREE2]) P.push({ kind: 'tree', z: tr.z, tr, b: proj(tr.x, 0, tr.z), c: proj(tr.x, tr.cy, tr.z) });
  return P;
}

export function propItems(P, L, Ge, lampK, glow, Lsig, Llamp, Lpool) {
  return P.map((p) => ({ z: p.z, draw: (g) => drawProp(g, p, L, Ge, lampK, glow, Lsig, Llamp, Lpool) }));
}

function drawProp(g, p, L, Ge, lampK, glow, Lsig, Llamp, Lpool) {
  if (p.kind === 'box') return drawBox(g, p, L);
  if (p.kind === 'glass') { g.globalAlpha = 0.35; drawBox(g, p, L, 1.05); g.globalAlpha = 1; return; }
  if (p.kind === 'wires') {
    g.strokeStyle = css(scale(shade(C.post, [0, 0, -1], L), 0.9)); g.lineWidth = 1.1;
    g.beginPath();
    for (const [x0, y0, z0, x1, y1, z1] of p.lines) {
      // clip long wires to the frame in world X (the projection stays a straight line)
      const a = proj(x0, y0, z0), b = proj(x1, y1, z1);
      g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]);
    }
    g.stroke();
    return;
  }
  if (p.kind === 'signal') {
    drawBox(g, p, L);
    const cols = [RED_HEX, '#ffb54a', '#5fd3a0'].map(hex);
    p.lamps.forEach((lp, i) => {
      // a long exposure averages the cycle: each lamp shows its duty share of the time
      const e = p.duty[i] * Lsig * Ge;
      g.fillStyle = css(add(scale(cols[i], 0.18 * L.amb[1] + 0.25 * p.duty[i]), scale(cols[i], e)));
      g.beginPath(); g.arc(lp[0], lp[1], Math.max(1.3, p.size * 0.11), 0, Math.PI * 2); g.fill();
      if (e > 0.25) {
        const s = p.size * 1.6;
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp((e - 0.25) * 0.3);
        const gr = g.createRadialGradient(lp[0], lp[1], 0, lp[0], lp[1], s);
        gr.addColorStop(0, css(cols[i], 0.8)); gr.addColorStop(1, css(cols[i], 0));
        g.fillStyle = gr; g.beginPath(); g.arc(lp[0], lp[1], s, 0, Math.PI * 2); g.fill();
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      }
    });
    return;
  }
  if (p.kind === 'lamp') {
    const w = Math.max(1.2, 0.16 * (700 / p.b[2]));
    g.strokeStyle = css(shade(C.post, [0, 0, -1], L)); g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(p.b[0], p.b[1]); g.lineTo(p.tp[0], p.tp[1]); g.lineTo(p.arm[0], p.arm[1]); g.stroke();
    const e = lampK * Ge * Llamp, hr = Math.max(2.5, 0.3 * (700 / p.b[2]));
    g.fillStyle = css(add(shade(C.post, [0, -1, 0], L), scale(hex('#fff2dc'), e)));
    g.beginPath(); g.ellipse(p.arm[0], p.arm[1] + hr * 0.3, hr, hr * 0.55, 0, 0, Math.PI * 2); g.fill();
    if (e > 0.3) {
      const s = hr * 13;
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp((e - 0.3) * 0.22);
      g.drawImage(glow, p.arm[0] - s / 2, p.arm[1] - s / 2, s, s);
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    return;
  }
  if (p.kind === 'shrub') {
    const d = shade(C.shrubD, [0, 0.5, -0.86], L), l = shade(C.shrub, [L.w[0], Math.max(0.3, L.w[1]), L.w[2]], L);
    g.fillStyle = css(d);
    g.beginPath(); for (const [ox, rr] of [[-0.7, 0.55], [0, 0.7], [0.7, 0.55]]) { g.moveTo(p.c[0] + ox * p.r + rr * p.r, p.c[1]); g.arc(p.c[0] + ox * p.r, p.c[1], rr * p.r, 0, Math.PI * 2); } g.fill();
    g.fillStyle = css(l);
    g.beginPath(); for (const [ox, rr] of [[-0.6, 0.38], [0.1, 0.5], [0.75, 0.36]]) { g.moveTo(p.c[0] + ox * p.r + rr * p.r, p.c[1] - 0.18 * p.r); g.arc(p.c[0] + ox * p.r, p.c[1] - 0.18 * p.r, rr * p.r, 0, Math.PI * 2); } g.fill();
    return;
  }
  if (p.kind === 'tree') {
    const tr = p.tr, r = tr.r * (700 / p.c[2]);
    g.strokeStyle = css(shade(C.bark, [0, 0, -1], L)); g.lineWidth = 0.34 * (700 / p.b[2]); g.lineCap = 'round';
    g.beginPath(); g.moveTo(p.b[0], p.b[1]); g.lineTo(p.c[0], p.c[1] + r * 0.4); g.stroke();
    // foliage scatters: a low orange sun tints it only partly; at night the plaza lamp beside it warms the leaves
    const lampL = scale(hex('#ffd9a8'), lampK * Ge * Lpool * 0.2);   // light, so it multiplies the leaf albedo
    const dark = add(shade(C.leafD, [0, 0, -1], L), mul(C.leafD, lampL)), lit = add(mix(shade(C.leafL, [0, 1, 0], L), shade(C.leafL, [L.w[0], Math.max(0.3, L.w[1]), L.w[2]], L), 0.55), mul(C.leafL, scale(lampL, 1.5)));
    // shift the lit lobe toward the sun's direction on screen
    const sp = proj(tr.x + L.w[0] * 2, tr.cy + L.w[1] * 2, tr.z + L.w[2] * 2);
    const dx = sp[0] - p.c[0], dy = sp[1] - p.c[1], dl = Math.hypot(dx, dy) || 1;
    g.fillStyle = css(dark);
    g.beginPath(); for (const [ox, oy, rr] of CANOPY) { g.moveTo(p.c[0] + ox * r + rr * r, p.c[1] + oy * r); g.arc(p.c[0] + ox * r, p.c[1] + oy * r, rr * r, 0, Math.PI * 2); } g.fill();
    g.save(); g.clip();
    g.fillStyle = css(mix(dark, lit, clamp(0.35 + L.sv)));
    const k = 0.34 * r;
    g.beginPath(); for (const [ox, oy, rr] of CANOPY) { const cx = p.c[0] + ox * r + (dx / dl) * k, cy = p.c[1] + oy * r + (dy / dl) * k - 0.05 * r; g.moveTo(cx + rr * r * 0.84, cy); g.arc(cx, cy, rr * r * 0.84, 0, Math.PI * 2); } g.fill();
    g.restore();
  }
}
