/*
 * 93 · 종이배의 하루 — a transition kit, told as one day of a paper boat (10 s, 1080×1920).
 *
 *   S1 아침 · 웅덩이  ─ whip pan ─▶  S2 한낮 · 개울  ─ scan band ─▶  S3 오후 · 바다
 *   ─ sonar ping (from the lighthouse lamp) ─▶  S4 노을 · 항구  ─ iris + match cut (boat → boat) ─▶
 *   S5 밤 · 창가  ─ light-leak cross-dissolve (dawn) ─▶  S1 again = frame 0 (the piece loops)
 *
 * Grammar of every join: the hero text leaves first (0.28 s power2.in, faster than its 0.72 s expo.out entrance),
 * the transition passes, and the new scene settles (camera scale 1.05 → 1, expo.out).
 * Scenes are flat illustrations painted with Canvas 2D: the static part of each is baked once in setup into a
 * full-frame bitmap; water, ripples, waves, birds, lights and the boat are drawn live from t. Transitions are
 * compositing: offscreen scene renders blitted with offsets (whip), a source-rect clip (scan), a circular clip
 * (ping), an even-odd mask (iris) and an alpha blend under a 'screen' leak (dissolve).
 * Text is DOM (Pretendard), split with SplitText and driven by one paused GSAP timeline: frame(t) = tl.time(t).
 * Determinism: every picture is a closed-form function of t; randomness only from rand(seed) in setup.
 */
import { defineDemo, rand, clamp, lerp } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';
import { SplitText } from '../node_modules/gsap/SplitText.js';

gsap.registerPlugin(SplitText);

const W = 1080, H = 1920, D = 10, TAU = Math.PI * 2;
const PF = `"${FONTS.pretendard.family}"`;
const pe = (n) => gsap.parseEase(n);
const EXPO = pe('expo.out'), P2IO = pe('power2.inOut'), P3IO = pe('power3.inOut'), P4IO = pe('power4.inOut');
const P2I = pe('power2.in'), P2O = pe('power2.out'), P3O = pe('power3.out'), SIO = pe('sine.inOut');
const seg = (t, a, b) => clamp((t - a) / (b - a));
const fract = (x) => x - Math.floor(x);
const bell = (t, a, b) => Math.sin(Math.PI * seg(t, a, b));
const loopT = (t) => (t >= 9 ? t - D : t);           // S1 is also the end of the piece (the dawn dissolve)

// ------------------------------------------------------------------ timing (seconds)
const T = {
  whipA: 1.40, whipB: 1.94,                      // whip pan S1 → S2 (power4.inOut, the cut is the midpoint)
  scanA: 3.14, scanB: 3.80,                      // scan band, top → bottom, S2 → S3
  lampOn: 4.98, pre1: 5.10, pre2: 5.30,          // the lighthouse lamp lights up and pings twice…
  pingA: 5.56, pingB: 6.46,                      // …then the sonar ping wipe S3 → S4 (climax)
  irisA: 7.26, irisC: 7.70, swap: 7.78, irisO: 7.86, irisB: 8.40,   // iris closes on the boat, match cut, opens
  leakA: 9.24, leakB: 10.0, leakEnd: 10.36,      // dawn leak dissolve S5 → S1 (the blob runs on into the next loop)
};
const HEROES = [
  { chip: '오전 7:30 · 웅덩이', dot: '#ffd36e', in: 0.16, out: 1.06,
    lines: [['종이배의', 128, '#1d2a3e'], ['하루', 236, '#ff5a3c']], dark: true },
  { chip: '오전 11:00 · 개울', dot: '#ffe45c', in: 2.02, out: 2.86, lines: [['쏴아—', 236, '#123b4c']], dark: true, wave: true },
  { chip: '오후 3:00 · 바다', dot: '#fff6cf', in: 3.98, out: 4.86, lines: [['넓다!', 236, '#ffffff']] },
  { chip: '오후 6:20 · 항구', dot: '#ff8a4c', in: 6.42, out: 7.06, lines: [['노을', 236, '#fff1df']] },
  { chip: '밤 9:40 · 창가', dot: 'moon', in: 8.48, out: 9.06, lines: [['잘 자', 236, '#fff4e2']], float: true },
];

let HEADLESS = false, main, offA, offB;
const BG = [], SPR = {}, GL = {};
let PNG = { x: 871, y: 624 }, RMAX = 1600, Q = { x: 560, y: 1225, s: 1.1 }, SILL = 1250;

// ------------------------------------------------------------------ tiny drawing kit
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d', HEADLESS ? { willReadFrequently: true } : undefined) };
}
const lin = (g, x0, y0, x1, y1, st) => { const r = g.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of st) r.addColorStop(o, c); return r; };
const radg = (g, x, y, r0, r1, st) => { const r = g.createRadialGradient(x, y, r0, x, y, r1); for (const [o, c] of st) r.addColorStop(o, c); return r; };
const circ = (g, x, y, r) => { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, TAU); };
const ell = (g, x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, TAU); };
function poly(g, p) { g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.closePath(); }
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
function glowSprite(rgb, mid = 0.42, size = 256) {
  const { c, g } = mk(size, size), h = size / 2;
  g.fillStyle = radg(g, h, h, 0, h, [[0, `rgba(${rgb},1)`], [mid, `rgba(${rgb},.32)`], [1, `rgba(${rgb},0)`]]);
  g.fillRect(0, 0, size, size);
  return c;
}
function glow(g, spr, x, y, r, a) {
  if (a <= 0.004 || r <= 0) return;
  g.globalAlpha = Math.min(1, a);
  g.drawImage(spr, x - r, y - r, 2 * r, 2 * r);
  g.globalAlpha = 1;
}
/** cumulus: a union of circles on a flat base, shaded top → bottom */
function cloud(g, x, y, w, top, bot, seed, alpha = 1, sq = 1) {
  const r = rand(seed), n = 4 + Math.round(w / 80);
  g.save();
  g.globalAlpha = alpha;
  g.beginPath(); g.rect(x - w, y - w * 1.2, w * 3, w * 1.2); g.clip();
  g.translate(0, y); g.scale(1, sq); g.translate(0, -y);
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1), rr = w * (0.1 + 0.17 * Math.sin(Math.PI * (0.15 + 0.7 * f)) + 0.05 * r());
    const cx = x + f * w, cy = y - rr * (0.35 + 0.35 * r());
    g.moveTo(cx + rr, cy); g.arc(cx, cy, rr, 0, TAU);
  }
  g.fillStyle = lin(g, 0, y - w * 0.45, 0, y, [[0, top], [1, bot]]);
  g.fill();
  g.restore();
}
/** a soft ridge line (sum of sines) filled down to `bottom` */
function ridge(g, y, amp, color, seed, x0 = -20, x1 = W + 20, bottom = H) {
  const r = rand(seed), a = r() * TAU, b = r() * TAU, c = r() * TAU;
  g.beginPath(); g.moveTo(x0, bottom);
  for (let x = x0; x <= x1; x += 12) g.lineTo(x, y - amp * (0.55 * Math.sin(x / 230 + a) + 0.3 * Math.sin(x / 97 + b) + 0.15 * Math.sin(x / 41 + c)));
  g.lineTo(x1, bottom); g.closePath();
  g.fillStyle = color; g.fill();
}
function tree(g, x, y, s, [dark, mid, light], trunk) {
  g.fillStyle = trunk; g.fillRect(x - 7 * s, y - 70 * s, 14 * s, 70 * s);
  const blob = (list, col) => { g.beginPath(); for (const [dx, dy, r] of list) { g.moveTo(x + (dx + r) * s, y + dy * s); g.arc(x + dx * s, y + dy * s, r * s, 0, TAU); } g.fillStyle = col; g.fill(); };
  blob([[-38, -100, 46], [34, -104, 50], [0, -150, 58], [-12, -76, 42], [28, -72, 38]], dark);
  blob([[-30, -112, 36], [24, -118, 38], [-4, -158, 44]], mid);
  blob([[-24, -170, 22], [-44, -116, 18], [14, -150, 18]], light);
}
function house(g, x, base, w, h, wall, roof, win) {
  g.fillStyle = wall; g.fillRect(x, base - h, w, h);
  g.fillStyle = roof; poly(g, [x - 14, base - h + 4, x + w / 2, base - h - w * 0.42, x + w + 14, base - h + 4]); g.fill();
  g.fillStyle = win;
  for (let i = 0; i < Math.floor(w / 46); i++) g.fillRect(x + 16 + i * 46, base - h + 26, 22, 28);
}

// ------------------------------------------------------------------ the paper boat (ink-outlined sticker; origin = waterline centre)
const HULL = [-150, -46, 150, -46, 92, 24, -92, 24];
const BRIM = [-150, -46, 150, -46, 128, -26, -128, -26];
const PAL = {
  morning: { sailL: '#fffdf6', sailR: '#d5d8dc', hull: '#f7f5ef', hullR: '#d1d5da', brim: '#e8e7e2', crease: 'rgba(100,112,130,.38)', ink: '#26314a', dot: '#ff5a3c' },
  noon:    { sailL: '#fffef6', sailR: '#d8dccd', hull: '#fbf9ef', hullR: '#d3d8c6', brim: '#eeede0', crease: 'rgba(100,118,96,.38)', ink: '#203540', dot: '#ff5a3c' },
  sea:     { sailL: '#ffffff', sailR: '#c9d7e8', hull: '#f5f8fc', hullR: '#c3d1e2', brim: '#e3ebf4', crease: 'rgba(70,100,140,.4)', ink: '#1b2a48', dot: '#ff5a3c' },
  sunset:  { sailL: '#ffe7cc', sailR: '#cf8592', hull: '#ffd9bd', hullR: '#bb7287', brim: '#f6bea3', crease: 'rgba(140,60,80,.42)', ink: '#38193a', dot: '#ff4f3a', rim: '#ffd9a0' },
  night:   { sailL: '#fbe4bf', sailR: '#8789ae', hull: '#f2d8b2', hullR: '#8283a6', brim: '#e7cb9d', crease: 'rgba(110,80,70,.42)', ink: '#1c1d36', dot: '#f0603e', rim: '#ffd59a' },
};
function drawBoat(g, P, damp = 0) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.fillStyle = P.sailL; poly(g, [-74, -40, 0, -40, 0, -158]); g.fill();
  g.fillStyle = P.sailR; poly(g, [0, -40, 74, -40, 0, -158]); g.fill();
  g.fillStyle = P.dot; circ(g, -24, -80, 12); g.fill();
  if (P.rim) { g.strokeStyle = P.rim; g.lineWidth = 5; g.beginPath(); g.moveTo(-66, -46); g.lineTo(-4, -148); g.stroke(); }
  g.strokeStyle = P.ink; g.lineWidth = 6; poly(g, [-74, -40, 74, -40, 0, -158]); g.stroke();
  g.lineWidth = 2.5; g.strokeStyle = P.crease; g.beginPath(); g.moveTo(0, -150); g.lineTo(0, -44); g.stroke();
  g.fillStyle = P.hull; poly(g, HULL); g.fill();
  g.fillStyle = P.hullR; poly(g, [100, -26, 128, -26, 92, 24, 66, 24]); g.fill();
  g.fillStyle = P.brim; poly(g, BRIM); g.fill();
  g.strokeStyle = P.crease; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(-128, -26); g.lineTo(-100, 24); g.moveTo(0, -26); g.lineTo(0, 24); g.stroke();
  if (damp) {
    g.save(); poly(g, HULL); g.clip();
    g.fillStyle = `rgba(120,90,70,${0.22 * damp})`;
    ell(g, -50, 8, 46, 16); g.fill(); ell(g, 40, 14, 38, 12); g.fill(); ell(g, 96, -8, 18, 10); g.fill();
    g.restore();
  }
  if (P.rim) { g.strokeStyle = P.rim; g.lineWidth = 4; g.beginPath(); g.moveTo(-140, -42); g.lineTo(-94, 18); g.stroke(); }
  g.strokeStyle = P.ink; g.lineWidth = 6; poly(g, HULL); g.stroke();
  g.lineWidth = 3.5; g.beginPath(); g.moveTo(-128, -26); g.lineTo(128, -26); g.stroke();
}
function placeBoat(g, P, b, water = null, damp = 0) {
  g.save(); g.translate(b.x, b.y); g.rotate(b.rot || 0); g.scale(b.s, b.s);
  drawBoat(g, P, damp);
  if (water) {
    g.save(); poly(g, HULL); g.clip();
    g.fillStyle = water; g.fillRect(-170, 2, 340, 40);
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-114, 1); g.quadraticCurveTo(0, 6, 114, 1); g.stroke();
  }
  g.restore();
}
function boatSprite(P) { const { c, g } = mk(320, 200); g.translate(160, 168); drawBoat(g, P); return c; }
/** mirrored copy under the waterline, cut into slices that wobble sideways */
function reflectBoat(g, spr, b, t, alpha, amp, squash = 0.8) {
  g.save(); g.translate(b.x, b.y + 2); g.rotate(-(b.rot || 0)); g.scale(b.s, -b.s * squash);
  g.globalAlpha = alpha;
  const h = 12;
  for (let r0 = 168 - h, j = 0; r0 > -h; r0 -= h, j++) {
    const y0 = Math.max(0, r0), hh = r0 + h - y0;
    const dx = amp * Math.sin(t * 3.1 + j * 0.85) * Math.min(1, j / 4);
    g.drawImage(spr, 0, y0, 320, hh, -160 + dx, y0 - 168, 320, hh);
  }
  g.globalAlpha = 1;
  g.restore();
}

// ------------------------------------------------------------------ cameras: settle (1.05 → 1) · slow drift · handheld · punch & shake at the ping
const CAM = [
  { t0: 0, dur: 0.95, px: 540, py: 1000, d0: 0, d1: 1.6, drift: 0.016, hand: 3 },
  { t0: 1.84, dur: 0.95, px: 540, py: 1060, d0: 1.84, d1: 3.8, drift: 0.022, hand: 3 },
  { t0: T.scanA + 0.1, dur: 1.1, px: 540, py: 780, d0: 3.3, d1: 5.6, drift: 0.022, hand: 2.5 },
  { t0: T.pingA, dur: 1.25, px: 871, py: 624, d0: 6.3, d1: 7.8, drift: 0.022, hand: 2.5 },
  { t0: T.irisO, dur: 1.0, px: 560, py: 1225, d0: 8.3, d1: 10, drift: 0.014, hand: 0 },
];
const punchK = (t) => (t < T.pingA ? 0 : t < T.pingA + 0.07 ? P2O((t - T.pingA) / 0.07) : 1 - P3O(seg(t, T.pingA + 0.07, T.pingA + 0.62)));
function cam(i, t) {
  const c = CAM[i], u = i === 0 ? loopT(t) : t;
  const k = (1 + 0.05 * (1 - EXPO(seg(u, c.t0, c.t0 + c.dur)))) * (1.014 + c.drift * seg(u, c.d0, c.d1));
  let a = k, e = c.px * (1 - k) + c.hand * Math.sin(u * 0.9 + i * 1.7), f = c.py * (1 - k) + c.hand * 0.8 * Math.sin(u * 1.27 + i * 2.3);
  if (i === 2 || i === 3) {
    const kp = 1 + 0.032 * punchK(t);
    a *= kp; e = PNG.x + kp * (e - PNG.x); f = PNG.y + kp * (f - PNG.y);
    const p = seg(t, T.pingA, T.pingA + 0.5);
    if (p > 0 && p < 1) { const env = (1 - p) * (1 - p); e += 7 * env * Math.sin(TAU * 6 * p + 0.6); f += 5 * env * Math.sin(TAU * 6.8 * p + 2.1); }
  }
  return { a, e, f };
}
const applyCam = (g, v) => g.setTransform(v.a, 0, 0, v.a, v.e, v.f);
const scr = (v, x, y) => [v.a * x + v.e, v.a * y + v.f];

// =================================================================== S1 · 아침 웅덩이
const PUD = { cx: 540, cy: 1262, rx: 490, ry: 226 };
const B1 = { x: 548, y: 1232, s: 1.04 };   // S1's boat: where S5's boat is at the loop point (set in setup)
function puddlePath(g, grow = 0) {
  g.beginPath();
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * TAU;
    const r = 1 + 0.055 * Math.sin(3 * a + 0.7) + 0.035 * Math.sin(5 * a + 2.1) + 0.02 * Math.sin(9 * a + 0.3);
    const x = PUD.cx + Math.cos(a) * (PUD.rx * r + grow), y = PUD.cy + Math.sin(a) * (PUD.ry * r + grow * 0.45);
    if (i) g.lineTo(x, y); else g.moveTo(x, y);
  }
  g.closePath();
}
function ginkgo(g, x, y, s, rot, col) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = col;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(-30, -34); g.quadraticCurveTo(-16, -52, -2, -44); g.lineTo(0, -36); g.lineTo(2, -44);
  g.quadraticCurveTo(16, -52, 30, -34); g.closePath(); g.fill();
  g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 14); g.stroke();
  g.strokeStyle = 'rgba(120,80,0,.18)'; g.lineWidth = 1.5;
  g.beginPath(); for (let k = -2; k <= 2; k++) { g.moveTo(0, -2); g.lineTo(k * 11, -38); } g.stroke();
  g.restore();
}
function bgPuddle(g) {
  const r = rand(101);
  g.fillStyle = lin(g, 0, 0, 0, 840, [[0, '#96b7d1'], [0.55, '#c3d7e4'], [1, '#e3ecef']]);
  g.fillRect(0, 0, W, 860);
  g.translate(0, 84);                                                              // the far layers sit lower than the title
  glow(g, GL.cream, 900, 210, 640, 0.95);
  glow(g, GL.white, 900, 210, 160, 0.75);
  cloud(g, -80, 380, 460, '#ffffff', '#d6e3ec', 11, 0.85);
  cloud(g, 600, 250, 300, '#ffffff', '#dae5ee', 12, 0.65);
  // utility pole and its sagging wires: depth in the sky
  g.strokeStyle = 'rgba(52,64,84,.55)'; g.lineWidth = 2.4;
  for (const [y0, y1] of [[246, 330], [260, 360], [274, 392]]) { g.beginPath(); g.moveTo(958, y0); g.quadraticCurveTo(470, y1 + 80, -20, y1); g.stroke(); }
  g.fillStyle = '#6c7a8d'; g.fillRect(950, 186, 16, 520); g.fillRect(904, 238, 106, 9);
  g.fillStyle = '#8796a6'; g.fillRect(950, 186, 5, 520);
  // far houses and a tree crown, cool morning haze
  for (const [x, w, h] of [[-30, 170, 120], [160, 130, 92], [600, 150, 128], [775, 118, 86], [905, 200, 138]]) house(g, x, 664, w, h, '#a9bccc', '#8499b0', '#c4d3df');
  tree(g, 450, 664, 1.25, ['#88a99c', '#9ab8a9', '#abc6b6'], '#7f8f8c');
  g.fillStyle = 'rgba(227,236,240,.35)'; g.fillRect(0, 420, W, 260);           // haze over the far layer
  g.translate(0, -84);
  cloud(g, 640, 300, 280, '#ffffff', '#dae5ee', 13, 0.5, 0.7);
  // hedge
  const HY = 84;
  g.fillStyle = '#5b8a68'; g.fillRect(-20, 650 + HY, W + 40, 100);
  g.beginPath(); for (let x = -30; x < W + 60; x += 54) { const rr = 40 + 12 * r(); g.moveTo(x + rr, 652 + HY); g.arc(x, 652 + HY, rr, 0, TAU); } g.fill();
  g.fillStyle = '#76a77f';
  g.beginPath(); for (let x = -40; x < W + 60; x += 54) { const rr = 22 + 8 * r(); g.moveTo(x + rr, 632 + HY); g.arc(x, 632 + HY, rr, 0, TAU); } g.fill();
  g.fillStyle = lin(g, 0, 690 + HY, 0, 750 + HY, [[0, 'rgba(40,70,50,0)'], [1, 'rgba(40,70,50,.55)']]); g.fillRect(0, 690 + HY, W, 60);
  // curb + ground (wet asphalt)
  g.fillStyle = '#aab4bb'; g.fillRect(0, 744 + HY, W, 22);
  g.fillStyle = 'rgba(70,82,94,.5)'; for (let x = 60; x < W; x += 170) g.fillRect(x, 744 + HY, 3, 22);
  g.fillStyle = lin(g, 0, 766 + HY, 0, H, [[0, '#8696a7'], [0.35, '#68788b'], [1, '#384658']]); g.fillRect(0, 766 + HY, W, H - 766 - HY);
  for (let i = 0; i < 1900; i++) {
    const x = r() * W, y = 770 + HY + Math.pow(r(), 0.8) * (H - 770 - HY), s = 1 + 2.2 * r() * (y / H);
    g.fillStyle = r() < 0.5 ? `rgba(255,255,255,${0.06 + 0.1 * r()})` : `rgba(10,20,30,${0.08 + 0.12 * r()})`;
    g.fillRect(x, y, s, s);
  }
  glow(g, GL.white, 800, 980, 420, 0.12);                                          // sky sheen on wet asphalt
  // the puddle: wet halo, sky reflection, reflected hedge and pole, rim
  puddlePath(g, 28); g.fillStyle = 'rgba(30,42,58,.24)'; g.fill();
  puddlePath(g); g.fillStyle = lin(g, 0, PUD.cy - PUD.ry, 0, PUD.cy + PUD.ry, [[0, '#dbe7ee'], [0.45, '#b2cadb'], [1, '#7f9fbb']]); g.fill();
  g.save(); puddlePath(g); g.clip();
  const fy = PUD.cy - PUD.ry * 1.08;
  g.fillStyle = 'rgba(72,110,86,.72)'; g.fillRect(0, fy - 40, W, 92);
  g.beginPath(); for (let x = -30; x < W + 60; x += 54) { const rr = 26 + 9 * r(); g.moveTo(x + rr, fy + 52); g.arc(x, fy + 52, rr, 0, TAU); } g.fill();
  g.fillStyle = 'rgba(150,170,190,.35)'; g.fillRect(0, fy + 84, W, 26);
  g.fillStyle = 'rgba(60,72,90,.5)'; g.fillRect(953, fy, 10, 230);
  glow(g, GL.cream, 880, PUD.cy - 60, 240, 0.65);
  g.restore();
  g.strokeStyle = 'rgba(32,44,58,.5)'; g.lineWidth = 7; puddlePath(g); g.stroke();
  g.save(); puddlePath(g); g.clip(); g.translate(0, -9); g.strokeStyle = 'rgba(255,255,255,.32)'; g.lineWidth = 10; puddlePath(g); g.stroke(); g.restore();
  // fallen ginkgo leaves (some at the puddle edge)
  for (const [x, y, s, a, c] of [[120, 1000, 0.9, -0.6, '#f0bd3c'], [960, 1040, 1.0, 0.8, '#f4c84a'], [900, 1560, 1.25, 2.4, '#e9a933'], [640, 1600, 1.4, -2.2, '#f2c040'],
    [330, 1560, 1.1, 1.2, '#d98a2b'], [1030, 1330, 1.2, -0.3, '#f4c84a'], [470, 950, 0.8, 2.0, '#efb73a']]) ginkgo(g, x, y, s, a, c);
  // a child's yellow rain boot, standing at the edge of the frame
  g.save(); g.translate(-96, 1668);
  ell(g, 160, 4, 200, 24); g.fillStyle = 'rgba(16,24,36,.42)'; g.fill();
  g.beginPath(); g.moveTo(0, -330); g.lineTo(172, -330); g.lineTo(180, -150); g.quadraticCurveTo(188, -116, 256, -98);
  g.quadraticCurveTo(326, -82, 330, -36); g.lineTo(330, -14); g.lineTo(-8, -14); g.closePath();
  g.fillStyle = '#f5c22f'; g.fill();
  g.save(); g.clip(); g.fillStyle = '#d99c17'; g.fillRect(-20, -340, 58, 340); g.fillStyle = 'rgba(255,246,190,.85)'; g.fillRect(84, -312, 16, 168); g.restore();
  g.beginPath(); g.roundRect(-14, -30, 352, 34, 15); g.fillStyle = '#2f3544'; g.fill();
  ell(g, 86, -330, 90, 17); g.fillStyle = '#d4981a'; g.fill(); ell(g, 86, -327, 74, 10); g.fillStyle = '#5a400f'; g.fill();
  g.restore();
}
const RIP1 = [];
function boat1(u) {
  const gust = P2I(seg(u, 1.2, 1.62));
  return { x: B1.x + 820 * gust, y: B1.y + 4 * Math.sin(u * 2.2), s: B1.s, rot: 0.035 * Math.sin(u * 1.8) - 0.12 * bell(u, 1.2, 1.62) };
}
function drawPuddle(g, t) {
  const u = loopT(t), b = boat1(u);
  g.drawImage(BG[0], 0, 0);
  g.save(); puddlePath(g); g.clip();
  glow(g, GL.cream, 870 + 12 * Math.sin(u * 0.8), PUD.cy - 50, 170, 0.35 + 0.15 * Math.sin(u * 2.3));
  g.lineWidth = 2.5;
  for (const p of RIP1) {
    const age = fract((u + p.ph) / p.per) * p.per;
    if (age > 1.05) continue;
    const k = age / 1.05, rad = 6 + 86 * P2O(k);
    g.strokeStyle = `rgba(255,255,255,${(0.6 * (1 - k)).toFixed(3)})`;
    ell(g, p.x, p.y, rad, rad * 0.42); g.stroke();
    if (k > 0.18) { ell(g, p.x, p.y, rad * 0.6, rad * 0.25); g.stroke(); }
  }
  reflectBoat(g, SPR.morning, b, u, 0.3, 5, 0.72);
  // a leaf afloat
  ginkgo(g, 290 + 18 * Math.sin(u * 0.5), PUD.cy + 80 + 4 * Math.sin(u * 1.4), 0.9, 2.6 + 0.1 * Math.sin(u), '#f3c443');
  g.restore();
  // rings that the bobbing boat sends out
  for (let j = 0; j < 2; j++) {
    const k = fract(u / 1.3 + j * 0.5), rx = 150 + 170 * P2O(k);
    g.strokeStyle = `rgba(255,255,255,${(0.42 * (1 - k)).toFixed(3)})`; g.lineWidth = 3;
    ell(g, b.x, b.y + 10, rx, rx * 0.3); g.stroke();
  }
  placeBoat(g, PAL.morning, b, 'rgba(120,158,190,.5)');
  // the gust: leaves lift and fly right
  const gk = seg(u, 1.15, 1.7);
  if (gk > 0) {
    for (let i = 0; i < 6; i++) {
      const q = P2I(clamp(gk * 1.3 - i * 0.05));
      ginkgo(g, 140 + i * 150 + 1100 * q, 1580 - i * 70 - 260 * q + 40 * Math.sin(i * 2 + q * 6), 1.1, i + q * 9, i % 2 ? '#f0bd3c' : '#e9a933');
    }
  }
  // drizzle
  g.strokeStyle = 'rgba(235,244,255,.3)'; g.lineWidth = 2;
  g.beginPath();
  for (let i = 0; i < 44; i++) {
    const y = fract(i * 0.6180339 + u * 0.82) * 2060 - 90, x = fract(i * 0.7548776 - u * 0.11) * (W + 80) - 40;
    g.moveTo(x, y); g.lineTo(x - 7, y + 40);
  }
  g.stroke();
}

// =================================================================== S2 · 한낮 개울
function bgBrook(g) {
  const r = rand(202);
  g.fillStyle = lin(g, 0, 0, 0, 860, [[0, '#62b5e4'], [0.6, '#acdcef'], [1, '#e0f4ee']]); g.fillRect(0, 0, W, 880);
  glow(g, GL.cream, 900, 180, 560, 0.95); glow(g, GL.white, 900, 180, 120, 0.9);
  cloud(g, 520, 470, 380, '#ffffff', '#d3e9f2', 21, 0.95);
  cloud(g, -40, 640, 300, '#ffffff', '#d7ecf3', 22, 0.85);
  ridge(g, 690, 60, '#a9d2c4', 23);
  ridge(g, 760, 46, '#8cc39c', 24);
  for (const [x, s, c] of [[90, 1.0, 0], [210, 0.8, 1], [640, 1.15, 0], [760, 0.85, 1], [1010, 1.05, 0]]) {
    tree(g, x, 856, s, c ? ['#4f925e', '#68ab69', '#8cc778'] : ['#468a57', '#5fa262', '#82bf72'], '#6a5039');
  }
  // the hut with a red roof on the far bank
  g.fillStyle = '#f2e6d3'; g.fillRect(842, 776, 118, 76);
  g.fillStyle = '#d9533d'; poly(g, [828, 782, 901, 728, 974, 782]); g.fill();
  g.fillStyle = '#6b4a35'; g.fillRect(868, 808, 26, 44); g.fillStyle = '#9fd0e6'; g.fillRect(914, 796, 26, 22);
  g.fillStyle = lin(g, 0, 840, 0, 905, [[0, '#93c86d'], [1, '#6ea152']]); g.fillRect(0, 846, W, 60);
  // water
  g.fillStyle = lin(g, 0, 900, 0, 1330, [[0, '#a6e2e7'], [0.35, '#64bed3'], [1, '#2c8db5']]); g.fillRect(0, 900, W, 430);
  g.fillStyle = 'rgba(52,110,70,.35)'; g.fillRect(0, 900, W, 26);                  // the far bank's reflection
  g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 9; i++) g.fillRect(r() * W, 940 + r() * 340, 120 + r() * 220, 5);
  // stones in the water
  for (const [x, y, s] of [[250, 1010, 34], [620, 958, 24], [820, 1196, 46], [120, 1250, 30]]) {
    ell(g, x, y + s * 0.3, s * 1.3, s * 0.4); g.fillStyle = 'rgba(20,70,90,.35)'; g.fill();
    ell(g, x, y, s * 1.2, s * 0.78); g.fillStyle = '#8b959b'; g.fill();
    ell(g, x - s * 0.2, y - s * 0.3, s * 0.8, s * 0.42); g.fillStyle = '#b3bcc0'; g.fill();
    ell(g, x - s * 0.1, y - s * 0.55, s * 0.6, s * 0.22); g.fillStyle = '#7ea85a'; g.fill();
  }
  // near bank: mud lip, grass, tufts, little flowers
  g.fillStyle = '#7f6649';
  g.beginPath(); g.moveTo(0, H); g.lineTo(0, 1318);
  for (let x = 0; x <= W; x += 30) g.lineTo(x, 1314 + 8 * Math.sin(x / 70) + 5 * Math.sin(x / 23));
  g.lineTo(W, H); g.closePath(); g.fill();
  g.fillStyle = lin(g, 0, 1340, 0, H, [[0, '#6db054'], [1, '#2f6339']]);
  g.beginPath(); g.moveTo(0, H); g.lineTo(0, 1346);
  for (let x = 0; x <= W; x += 30) g.lineTo(x, 1342 + 10 * Math.sin(x / 90 + 1) + 6 * Math.sin(x / 31));
  g.lineTo(W, H); g.closePath(); g.fill();
  for (let i = 0; i < 26; i++) { ell(g, r() * W, 1322 + r() * 14, 6 + 6 * r(), 4 + 3 * r()); g.fillStyle = r() < 0.5 ? '#a49279' : '#c2b39b'; g.fill(); }
  for (let i = 0; i < 70; i++) {
    const x = r() * W, y = 1360 + Math.pow(r(), 0.7) * 520, s = 0.6 + 0.9 * (y - 1340) / 580;
    g.fillStyle = r() < 0.5 ? '#3f7d3c' : '#86c062';
    g.beginPath();
    for (let k = -2; k <= 2; k++) { g.moveTo(x + k * 7 * s, y); g.quadraticCurveTo(x + k * 10 * s, y - 30 * s, x + k * 16 * s + 6 * s, y - (44 + 10 * Math.abs(k)) * s); g.lineTo(x + k * 7 * s + 5 * s, y); }
    g.fill();
  }
  for (let i = 0; i < 22; i++) {
    const x = r() * W, y = 1400 + r() * 420, s = 0.7 + 0.6 * r();
    g.fillStyle = '#ffffff'; for (let k = 0; k < 5; k++) { circ(g, x + 9 * s * Math.cos(k * 1.256), y + 9 * s * Math.sin(k * 1.256), 6 * s); g.fill(); }
    g.fillStyle = '#ffcf3a'; circ(g, x, y, 5 * s); g.fill();
  }
}
const STREAK2 = [], REEDS = [];
function boat2(t) {
  return { x: lerp(360, 640, seg(t, 1.6, 3.9)) + 6 * Math.sin(t * 2.3), y: 1112 + 7 * Math.sin(t * 4.2), s: 1.0, rot: 0.07 * Math.sin(t * 3.4) - 0.03 };
}
function drawBrook(g, t) {
  g.drawImage(BG[1], 0, 0);
  // the current: streaks that run faster nearer the bank
  g.lineCap = 'round';
  for (const s of STREAK2) {
    const x = fract(s.x0 + t * s.v / (W + 320)) * (W + 320) - 160;
    g.strokeStyle = `rgba(255,255,255,${(s.a * (0.6 + 0.4 * Math.sin(t * 5 + s.ph))).toFixed(3)})`;
    g.lineWidth = s.w; g.beginPath(); g.moveTo(x, s.y); g.lineTo(x + s.len, s.y + 1); g.stroke();
  }
  // foam around the stones
  for (const [x, y, s] of [[250, 1010, 34], [620, 958, 24], [820, 1196, 46], [120, 1250, 30]]) {
    for (let j = 0; j < 2; j++) {
      const k = fract(t * 0.9 + j * 0.5 + x * 0.001);
      g.strokeStyle = `rgba(255,255,255,${(0.7 * (1 - k)).toFixed(3)})`; g.lineWidth = 3;
      g.beginPath(); g.ellipse(x - s * 0.2, y + s * 0.15, s * (1.35 + 0.6 * k), s * (0.5 + 0.2 * k), 0, Math.PI * 0.55, Math.PI * 1.45); g.stroke();
    }
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x + s, y + s * 0.2); g.quadraticCurveTo(x + s * 2.2, y + s * 0.5 + 3 * Math.sin(t * 6), x + s * 3.4, y + s * 0.3); g.stroke();
  }
  // petals carried downstream
  for (let i = 0; i < 6; i++) {
    const x = fract(i * 0.37 + t * 0.09) * (W + 100) - 50, y = 960 + i * 58 + 6 * Math.sin(t * 2 + i);
    ell(g, x, y, 9, 5, t + i); g.fillStyle = i % 2 ? '#ffd4dc' : '#ffffff'; g.fill();
  }
  // the boat: shadow, wake, bow wave
  const b = boat2(t);
  ell(g, b.x, b.y + 22, 150, 22); g.fillStyle = 'rgba(16,70,96,.25)'; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.65)'; g.lineWidth = 4;
  for (let j = 0; j < 3; j++) {
    const k = fract(t * 1.6 + j / 3), L = 60 + 220 * k;
    g.globalAlpha = 1 - k;
    g.beginPath(); g.moveTo(b.x - 110 - L, b.y + 6 - 26 * k); g.quadraticCurveTo(b.x - 110 - L * 0.4, b.y + 10, b.x - 100, b.y + 12);
    g.moveTo(b.x - 110 - L, b.y + 30 + 26 * k); g.quadraticCurveTo(b.x - 110 - L * 0.4, b.y + 24, b.x - 100, b.y + 18); g.stroke();
  }
  g.globalAlpha = 1;
  placeBoat(g, PAL.noon, b, 'rgba(70,170,200,.55)');
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 4;
  g.beginPath(); g.arc(b.x + 104, b.y + 8, 16 + 4 * Math.sin(t * 9), Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  // foreground reeds and cattails (they sway; a dragonfly hovers)
  for (const rd of REEDS) {
    const sway = 0.035 * Math.sin(t * 1.4 + rd.ph) + 0.015 * Math.sin(t * 3.1 + rd.ph * 2);
    const tx = rd.x + Math.sin(sway) * rd.h, ty = H + 30 - Math.cos(sway) * rd.h;
    g.strokeStyle = rd.c; g.lineWidth = rd.w;
    g.beginPath(); g.moveTo(rd.x, H + 30); g.quadraticCurveTo(rd.x + rd.bend, H + 30 - rd.h * 0.5, tx, ty); g.stroke();
    if (rd.cat) { g.save(); g.translate(tx, ty); g.rotate(sway); g.beginPath(); g.roundRect(-11, -78, 22, 82, 11); g.fillStyle = '#7b4e2c'; g.fill();
      g.fillStyle = 'rgba(255,220,170,.35)'; g.fillRect(-7, -70, 5, 62); g.strokeStyle = rd.c; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -78); g.lineTo(0, -110); g.stroke(); g.restore(); }
  }
  const dx = 780 + 40 * Math.sin(t * 0.9), dy = 1010 + 18 * Math.sin(t * 1.7);
  g.save(); g.translate(dx, dy); g.rotate(-0.1);
  g.fillStyle = 'rgba(230,248,255,.55)';
  const fl = 0.25 * Math.sin(t * 40);
  for (const [ox, a] of [[-6, -0.5 + fl], [-6, 0.5 - fl], [6, -0.6 - fl], [6, 0.6 + fl]]) { ell(g, ox, a * 40, 9, 30, a * 0.4); g.fill(); }
  g.strokeStyle = '#1e5a72'; g.lineWidth = 6; g.beginPath(); g.moveTo(-34, 0); g.lineTo(46, 0); g.stroke();
  g.fillStyle = '#1e5a72'; circ(g, 50, 0, 8); g.fill();
  g.restore();
}

// =================================================================== S3 · 오후 바다
const LH3 = { x: 860, y: 628 };          // the lighthouse lamp (the ping comes from here)
function bgSea(g) {
  g.fillStyle = lin(g, 0, 0, 0, 790, [[0, '#1a58a8'], [0.5, '#4f9ad6'], [1, '#c9e5f2']]); g.fillRect(0, 0, W, 800);
  glow(g, GL.cream, 790, 210, 720, 0.85); glow(g, GL.gold, 790, 210, 260, 0.55); glow(g, GL.white, 790, 210, 150, 1);
  circ(g, 790, 210, 58); g.fillStyle = radg(g, 790, 200, 0, 60, [[0, '#ffffff'], [0.7, '#fff8dc'], [1, '#ffe9a8']]); g.fill();
  cloud(g, -60, 778, 640, '#ffffff', '#b6cfe5', 31, 1, 0.42);
  cloud(g, 330, 780, 360, '#ffffff', '#c2d8ea', 32, 0.95, 0.38);
  cloud(g, 560, 470, 250, '#ffffff', '#cfe1ef', 33, 0.7, 0.8);
  g.fillStyle = 'rgba(214,236,246,.5)'; g.fillRect(0, 740, W, 44);                 // horizon haze
  // the islet and its lighthouse
  g.fillStyle = '#4b6b86';
  g.beginPath(); g.moveTo(718, 788); g.quadraticCurveTo(760, 742, 830, 744); g.quadraticCurveTo(880, 728, 930, 746); g.quadraticCurveTo(990, 752, 1016, 788); g.closePath(); g.fill();
  g.fillStyle = '#5d7f9a'; g.beginPath(); g.moveTo(760, 770); g.quadraticCurveTo(820, 748, 880, 752); g.lineTo(850, 772); g.closePath(); g.fill();
  g.fillStyle = '#e9eef2'; g.fillRect(900, 724, 34, 24); g.fillStyle = '#c4553c'; poly(g, [896, 726, 917, 710, 938, 726]); g.fill();
  const x = LH3.x;
  g.fillStyle = '#f4f2ec'; poly(g, [x - 17, 750, x + 17, 750, x + 12, 646, x - 12, 646]); g.fill();
  g.fillStyle = '#e0553c'; for (const [a, b] of [[728, 712], [694, 678], [662, 650]]) { const w0 = 17 - (750 - a) * 0.048, w1 = 17 - (750 - b) * 0.048; poly(g, [x - w0, a, x + w0, a, x + w1, b, x - w1, b]); g.fill(); }
  g.fillStyle = 'rgba(40,60,90,.25)'; poly(g, [x + 4, 750, x + 17, 750, x + 12, 646, x + 3, 646]); g.fill();
  g.fillStyle = '#2b3c55'; g.fillRect(x - 17, 640, 34, 6);
  g.fillStyle = '#cfe0e8'; g.fillRect(x - 10, 616, 20, 24);
  g.fillStyle = '#c4423a'; poly(g, [x - 14, 618, x, 600, x + 14, 618]); g.fill();
  // sea base
  g.fillStyle = lin(g, 0, 786, 0, H, [[0, '#5aa6d8'], [0.3, '#2f78b6'], [1, '#0b3a6c']]); g.fillRect(0, 786, W, H - 786);
  glow(g, GL.white, 790, 820, 300, 0.35);
}
const ROWS = 12, GLIT3 = [], GULLS = [];
function seaRow(g, r, t) {
  const f = (r + 1) / ROWS, sc = Math.pow(f, 1.6);
  const y0 = 784 + 1180 * Math.pow(f, 1.75);
  const A = 3 + 28 * sc, lam = 80 + 560 * sc, ph = r * 1.93 + t * (0.45 + 1.2 * sc) * (r % 2 ? 1 : -0.7);
  const wy = (x) => y0 + A * Math.sin((x / lam) * TAU + ph) + A * 0.3 * Math.sin((x / lam) * TAU * 2.1 + ph * 1.3);
  const step = Math.max(8, lam / 16), pts = [];
  for (let x = -24; x <= W + 24; x += step) pts.push(x, wy(x));
  g.beginPath(); g.moveTo(-24, H + 10);
  for (let i = 0; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.lineTo(W + 24, H + 10); g.closePath();
  g.fillStyle = mix('#64aedc', '#0c4279', Math.pow(r / (ROWS - 1), 0.85)); g.fill();
  g.strokeStyle = `rgba(210,238,255,${(0.28 + 0.3 * sc).toFixed(3)})`; g.lineWidth = 1.5 + 3.5 * sc;
  g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke();
  if (sc > 0.18) {   // foam caps on the crests (sin = -1 is the highest point, y grows downward)
    g.fillStyle = `rgba(255,255,255,${(0.5 + 0.35 * sc).toFixed(3)})`;
    const c0 = (-Math.PI / 2 - ph) / TAU, k0 = Math.ceil(-24 / lam - c0), k1 = Math.floor((W + 24) / lam - c0);
    for (let k = k0; k <= k1; k++) { const xc = (k + c0) * lam; ell(g, xc, wy(xc) + 1, lam * 0.11, 2 + 5 * sc); g.fill(); }
  }
  return y0;
}
function boat3(t) {
  return { x: 470 + 18 * Math.sin(t * 0.6), y: 1196 + 24 * Math.sin(t * 1.9), s: 0.95, rot: 0.13 * Math.sin(t * 1.9 + 1.2) };
}
function drawSea(g, t) {
  g.drawImage(BG[2], 0, 0);
  for (let r = 0; r < 4; r++) seaRow(g, r, t);
  { // a buoy in the middle distance (scale + depth)
    const by = 1000 + 7 * Math.sin(t * 2.1), ba = 0.13 * Math.sin(t * 1.7 + 0.4);
    g.save(); g.translate(842, by); g.rotate(ba);
    g.fillStyle = '#2b3a52'; g.fillRect(-3, -96, 6, 30); g.fillRect(-14, -70, 28, 6);
    g.fillStyle = '#e2553a'; poly(g, [-26, 0, 26, 0, 12, -66, -12, -66]); g.fill();
    g.fillStyle = '#f6f2ea'; poly(g, [-21, -22, 21, -22, 16, -42, -16, -42]); g.fill();
    g.fillStyle = 'rgba(30,40,70,.25)'; poly(g, [6, 0, 26, 0, 12, -66, 3, -66]); g.fill();
    g.restore();
    g.globalCompositeOperation = 'lighter'; glow(g, GL.gold, 842 + 96 * Math.sin(ba), by - 98, 26, 0.35 + 0.35 * Math.max(0, Math.sin(t * 3))); g.globalCompositeOperation = 'source-over';
  }
  for (let r = 4; r < 6; r++) seaRow(g, r, t);
  // glitter under the sun
  for (const s of GLIT3) {
    const a = Math.pow(Math.max(0, Math.sin(t * s.w + s.ph)), 6);
    if (a < 0.03) continue;
    g.fillStyle = `rgba(255,255,240,${a.toFixed(3)})`;
    g.fillRect(s.x - s.l, s.y - 1.5, s.l * 2, 3); g.fillRect(s.x - 1.5, s.y - s.l * 0.5, 3, s.l);
  }
  const b = boat3(t);
  const k = 0.5 + 0.5 * Math.sin(t * 1.9 + 2.6);           // spray when the bow comes down
  if (k > 0.55) for (let i = 0; i < 7; i++) {
    const q = (k - 0.55) / 0.45;
    circ(g, b.x + 120 + i * 9 + 30 * q, b.y - 10 - 50 * q * Math.sin(1 + i * 0.4) + i * 2, 5 - i * 0.4); g.fillStyle = `rgba(255,255,255,${(0.8 * q).toFixed(3)})`; g.fill();
  }
  placeBoat(g, PAL.sea, b, 'rgba(40,110,170,.6)');
  for (let r = 6; r < ROWS; r++) seaRow(g, r, t);
  // gulls
  for (const gl of GULLS) {
    const x = gl.x + gl.v * t, y = gl.y + 10 * Math.sin(t * 1.3 + gl.ph), fl = Math.sin(t * gl.f + gl.ph);
    g.save(); g.translate(x, y); g.scale(gl.s, gl.s);
    g.strokeStyle = '#ffffff'; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(-40, -14 * fl); g.quadraticCurveTo(-18, -22 - 12 * fl, 0, 0); g.quadraticCurveTo(18, -22 - 12 * fl, 40, -14 * fl); g.stroke();
    g.strokeStyle = '#2d3d58'; g.lineWidth = 3; g.beginPath(); g.moveTo(-40, -14 * fl); g.lineTo(-30, -16 - 8 * fl); g.moveTo(40, -14 * fl); g.lineTo(30, -16 - 8 * fl); g.stroke();
    g.restore();
  }
  // the lamp lights up before the ping
  const on = seg(t, T.lampOn, T.lampOn + 0.16);
  if (on > 0) {
    g.globalCompositeOperation = 'lighter';
    glow(g, GL.gold, LH3.x, LH3.y, 70 + 30 * on + 10 * Math.sin(t * 9), 0.9 * on);
    glow(g, GL.white, LH3.x, LH3.y, 18, on);
    g.globalCompositeOperation = 'source-over';
  }
}

// =================================================================== S4 · 노을 항구
const SUN4 = { x: 300, y: 868 };
function crane(g, x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = col; g.strokeStyle = col;
  g.fillRect(-62, -270, 14, 270); g.fillRect(48, -270, 14, 270);
  g.lineWidth = 6; g.beginPath();
  for (const [a, b] of [[-262, -140], [-136, -8]]) { g.moveTo(-55, a); g.lineTo(55, b); g.moveTo(55, a); g.lineTo(-55, b); }
  g.moveTo(-62, -140); g.lineTo(62, -140); g.stroke();
  g.fillRect(-300, -294, 440, 24);
  g.lineWidth = 3; g.beginPath(); for (let k = -300; k < 140; k += 40) { g.moveTo(k, -270); g.lineTo(k + 20, -294); g.lineTo(k + 40, -270); } g.stroke();
  g.fillRect(-44, -336, 88, 44);
  g.fillRect(-7, -400, 14, 110);
  g.lineWidth = 4; g.beginPath(); g.moveTo(-290, -294); g.lineTo(0, -398); g.lineTo(130, -294); g.stroke();
  g.lineWidth = 2.5; g.beginPath(); g.moveTo(-220, -270); g.lineTo(-220, -170); g.stroke(); g.fillRect(-248, -172, 56, 9);
  g.restore();
}
function fishingBoat(g, x, y, s, hull, light) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = hull;
  g.beginPath(); g.moveTo(-130, -34); g.lineTo(140, -44); g.quadraticCurveTo(118, 8, 84, 14); g.lineTo(-104, 14); g.quadraticCurveTo(-124, 0, -130, -34); g.fill();
  g.fillRect(-70, -92, 76, 52);
  g.fillStyle = light; g.fillRect(-56, -80, 18, 14); g.fillRect(-30, -80, 18, 14);
  g.strokeStyle = hull; g.lineWidth = 4;
  g.beginPath(); g.moveTo(44, -40); g.lineTo(44, -190); g.moveTo(44, -186); g.lineTo(134, -44); g.moveTo(44, -186); g.lineTo(-120, -36); g.moveTo(44, -150); g.lineTo(-10, -150); g.stroke();
  g.fillStyle = '#ff6b4a'; poly(g, [44, -190, 76, -180, 44, -170]); g.fill();
  g.restore();
}
function bgHarbour(g) {
  const r = rand(404);
  g.fillStyle = lin(g, 0, 0, 0, 940, [[0, '#2c235c'], [0.3, '#663a7c'], [0.58, '#cc577a'], [0.84, '#ff9a5a'], [1, '#ffd08a']]);
  g.fillRect(0, 0, W, 950);
  glow(g, GL.amber, SUN4.x, SUN4.y, 760, 0.62);
  glow(g, GL.gold, SUN4.x, SUN4.y, 340, 0.9);
  circ(g, SUN4.x, SUN4.y, 128); g.fillStyle = radg(g, SUN4.x, SUN4.y - 40, 0, 160, [[0, '#fff4d2'], [0.65, '#ffd78e'], [1, '#ffb066']]); g.fill();
  // long lit clouds
  for (const [x, y, w, h, c] of [[-80, 560, 560, 26, 'rgba(255,140,140,.55)'], [420, 468, 460, 20, 'rgba(255,160,150,.45)'], [560, 712, 600, 30, 'rgba(255,180,130,.55)'],
    [60, 770, 420, 18, 'rgba(255,205,150,.55)'], [700, 600, 380, 16, 'rgba(255,150,140,.4)']]) {
    g.fillStyle = c; g.beginPath(); g.roundRect(x, y, w, h, h / 2); g.fill();
    g.fillStyle = 'rgba(120,50,100,.25)'; g.beginPath(); g.roundRect(x + 30, y + h * 0.6, w - 60, h * 0.4, h / 4); g.fill();
  }
  // far headland (left), hazy
  g.fillStyle = '#a25a84';
  g.beginPath(); g.moveTo(-10, 942); g.lineTo(-10, 884);
  for (let x = 0; x <= 620; x += 20) g.lineTo(x, 894 - 26 * Math.sin(x / 180 + 0.4) - 8 * Math.sin(x / 47));
  g.lineTo(660, 942); g.closePath(); g.fill();
  // cranes, warehouses, containers
  crane(g, 600, 936, 0.78, '#8b4d7f');
  crane(g, 735, 936, 0.98, '#5e3468');
  g.fillStyle = '#6a3a6c';
  for (const [x, w, h] of [[620, 140, 54], [760, 120, 74], [880, 210, 60]]) { g.fillRect(x, 936 - h, w, h); g.beginPath(); for (let k = 0; k < w; k += 35) { g.moveTo(x + k, 936 - h); g.lineTo(x + k + 35, 936 - h - 16); g.lineTo(x + k + 35, 936 - h); } g.fill(); }
  g.fillStyle = '#7b3f6a'; for (let i = 0; i < 8; i++) g.fillRect(560 + i * 30, 906 - (i % 3) * 14, 28, 30 + (i % 3) * 14);
  // breakwater + the lighthouse, backlit (its lamp sits exactly where the ping came from)
  g.fillStyle = '#3e2552'; g.fillRect(780, 928, 320, 22);
  const x = PNG.x, ly = PNG.y;
  g.fillStyle = '#3d2452'; poly(g, [x - 36, 940, x + 36, 940, x + 22, ly + 30, x - 22, ly + 30]); g.fill();
  g.fillStyle = 'rgba(255,160,120,.35)'; poly(g, [x - 36, 940, x - 26, 940, x - 16, ly + 30, x - 22, ly + 30]); g.fill();
  g.fillStyle = 'rgba(160,60,90,.55)'; for (const k of [0.25, 0.55]) { const yy = 940 - (940 - ly - 30) * k, w = 36 - 14 * k; g.fillRect(x - w, yy - 14, w * 2, 28); }
  g.fillStyle = '#2c1a3d'; g.fillRect(x - 30, ly + 24, 60, 8); g.fillRect(x - 3, ly - 34, 6, 12);
  poly(g, [x - 22, ly - 18, x, ly - 34, x + 22, ly - 18]); g.fill();
  g.fillStyle = '#ffe7b0'; g.fillRect(x - 15, ly - 18, 30, 42);
  // water
  g.fillStyle = lin(g, 0, 936, 0, H, [[0, '#ffb877'], [0.1, '#ee8b7c'], [0.32, '#9b4f7c'], [0.68, '#4a2c5e'], [1, '#21173a']]);
  g.fillRect(0, 936, W, H - 936);
  g.fillStyle = 'rgba(255,230,180,.6)'; g.fillRect(0, 934, W, 4);
  glow(g, GL.gold, SUN4.x, 960, 260, 0.45);
  // reflections of the silhouettes (vertical, wavy)
  g.fillStyle = 'rgba(60,30,80,.4)';
  for (let y = 944; y < 1240; y += 9) { const w = 26 + (y - 940) * 0.05, j = 8 * Math.sin(y * 0.21); g.fillRect(x - w + j, y, w * 2, 5); g.fillRect(700 + j * 1.4, y, 60, 4); }
  // moored fishing boats (mid ground) and their reflections
  for (const [bx, by, s] of [[690, 1006, 0.9], [960, 1030, 1.05]]) {
    g.fillStyle = 'rgba(40,20,60,.35)'; for (let y = by + 18; y < by + 110; y += 10) g.fillRect(bx - 120 * s + 9 * Math.sin(y * 0.3), y, 250 * s, 5);
    fishingBoat(g, bx, by, s, '#34204a', '#ffd38a');
  }
  // the pier (left foreground): deck, posts, lamps
  g.fillStyle = '#2a1934';
  for (const px of [30, 140, 250, 360]) { g.fillRect(px - 9, 1150, 18, 170); g.fillStyle = 'rgba(42,25,52,.45)'; for (let y = 1326; y < 1460; y += 10) g.fillRect(px - 9 + 6 * Math.sin(y * 0.4), y, 18, 5); g.fillStyle = '#2a1934'; }
  g.fillStyle = '#3a2242'; g.fillRect(-20, 1118, 430, 36);
  g.fillStyle = '#ff9d6c'; g.fillRect(-20, 1116, 430, 4);
  g.fillStyle = '#2a1934'; for (let k = 0; k < 430; k += 36) g.fillRect(-20 + k, 1124, 2, 30);
  for (const lx of [90, 330]) {
    g.fillStyle = '#2a1934'; g.fillRect(lx - 5, 880, 10, 240); g.fillRect(lx - 22, 872, 44, 12);
    glow(g, GL.gold, lx, 896, 70, 0.85); circ(g, lx, 892, 11); g.fillStyle = '#fff1c4'; g.fill();
  }
  g.fillStyle = '#2a1934'; g.beginPath(); g.roundRect(196, 1086, 34, 34, 8); g.fill();
  // a cat on the pier, watching the sun go down
  g.fillStyle = '#26162e';
  ell(g, 268, 1092, 26, 24); g.fill(); circ(g, 262, 1060, 17); g.fill();
  poly(g, [249, 1052, 252, 1034, 262, 1046]); g.fill(); poly(g, [266, 1046, 276, 1034, 277, 1052]); g.fill();
  g.strokeStyle = '#26162e'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(290, 1106); g.quadraticCurveTo(318, 1112, 312, 1080); g.stroke();
}
const SHIM4 = [], BIRDS4 = [];
function boat4(t) {
  const damp = 1 - seg(t, 6.9, 7.72);
  return { x: 560 + 10 * Math.sin(t * 0.5), y: 1225 + 5 * Math.sin(t * 1.6) * damp, s: 1.1, rot: 0.05 * Math.sin(t * 1.3) * damp };
}
function drawHarbour(g, t) {
  g.drawImage(BG[3], 0, 0);
  // the sun's column on the water
  g.lineCap = 'round';
  for (const s of SHIM4) {
    const fl = 0.5 + 0.5 * Math.sin(t * s.w + s.ph);
    g.strokeStyle = `rgba(255,226,170,${(0.25 + 0.65 * fl).toFixed(3)})`; g.lineWidth = s.lw;
    const L = s.hw * (0.35 + 0.65 * fl), xc = SUN4.x + s.dx + 6 * Math.sin(t * 1.3 + s.ph);
    g.beginPath(); g.moveTo(xc - L, s.y); g.lineTo(xc + L, s.y); g.stroke();
  }
  for (let i = 0; i < 26; i++) {
    const y = 1000 + i * 34, x = fract(i * 0.41 + t * 0.03 * (1 + (i % 3))) * (W + 200) - 100;
    g.strokeStyle = 'rgba(255,190,190,.18)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 60 + 40 * (i % 3), y); g.stroke();
  }
  // the lighthouse beam sweeps
  const ang = Math.PI + 0.35 + 0.28 * Math.sin(t * 0.9);
  g.globalCompositeOperation = 'lighter';
  g.save(); g.translate(PNG.x, PNG.y); g.rotate(ang);
  g.fillStyle = lin(g, 0, 0, 900, 0, [[0, 'rgba(255,236,190,.32)'], [1, 'rgba(255,236,190,0)']]);
  g.beginPath(); g.moveTo(0, -8); g.lineTo(900, -70); g.lineTo(900, 70); g.lineTo(0, 8); g.closePath(); g.fill();
  g.restore();
  glow(g, GL.gold, PNG.x, PNG.y, 90 + 8 * Math.sin(t * 7), 0.95);
  glow(g, GL.white, PNG.x, PNG.y, 20, 1);
  g.globalCompositeOperation = 'source-over';
  // birds crossing the sun
  g.strokeStyle = '#3a1f44'; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const bd of BIRDS4) {
    const x = bd.x + bd.v * t, y = bd.y + 6 * Math.sin(t * 1.1 + bd.ph), fl = Math.sin(t * bd.f + bd.ph);
    g.lineWidth = 4 * bd.s; g.beginPath(); g.moveTo(x - 22 * bd.s, y - 9 * fl * bd.s); g.quadraticCurveTo(x - 9 * bd.s, y - (13 + 7 * fl) * bd.s, x, y);
    g.quadraticCurveTo(x + 9 * bd.s, y - (13 + 7 * fl) * bd.s, x + 22 * bd.s, y - 9 * fl * bd.s); g.stroke();
  }
  const b = boat4(t);
  reflectBoat(g, SPR.sunset, b, t, 0.38, 7, 0.8);
  for (let j = 0; j < 2; j++) {
    const k = fract(t / 1.6 + j * 0.5), rx = 160 + 160 * P2O(k);
    g.strokeStyle = `rgba(255,214,170,${(0.4 * (1 - k)).toFixed(3)})`; g.lineWidth = 3; ell(g, b.x, b.y + 12, rx, rx * 0.22); g.stroke();
  }
  placeBoat(g, PAL.sunset, b, 'rgba(200,90,120,.5)');
}

// =================================================================== S5 · 밤 창가
const WIN = { x0: 150, x1: 930, y0: 230 };
function bgWindow(g) {
  const r = rand(505), y1 = SILL - 34;
  g.fillStyle = lin(g, 0, 0, 0, H, [[0, '#20264a'], [1, '#121530']]); g.fillRect(0, 0, W, H);
  // the night outside
  g.save(); g.beginPath(); g.rect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, y1 - WIN.y0); g.clip();
  g.fillStyle = lin(g, 0, WIN.y0, 0, y1, [[0, '#0a1130'], [0.6, '#192659'], [1, '#2d3c70']]); g.fillRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, y1 - WIN.y0);
  for (let i = 0; i < 140; i++) { const sx = WIN.x0 + r() * 780, sy = WIN.y0 + r() * 640; g.fillStyle = `rgba(230,236,255,${(0.2 + 0.5 * r()).toFixed(2)})`; g.fillRect(sx, sy, 2, 2); }
  glow(g, GL.moon, 720, 470, 300, 0.5);
  circ(g, 720, 470, 62); g.fillStyle = '#f6f1dc'; g.fill();
  g.fillStyle = 'rgba(200,196,170,.45)'; circ(g, 700, 452, 12); g.fill(); circ(g, 742, 492, 9); g.fill(); circ(g, 728, 446, 6); g.fill();
  for (const [x, y, w] of [[260, 560, 300], [560, 640, 360], [180, 760, 260]]) { g.fillStyle = 'rgba(90,110,170,.28)'; g.beginPath(); g.roundRect(x, y, w, 18, 9); g.fill(); }
  ridge(g, 990, 50, '#1a2450', 51, WIN.x0 - 10, WIN.x1 + 10);
  ridge(g, 1050, 30, '#121a3c', 52, WIN.x0 - 10, WIN.x1 + 10);
  g.fillStyle = '#1b2650'; g.fillRect(WIN.x0, 1110, 780, y1 - 1110);                 // the far bay
  for (let y = 1116; y < y1; y += 8) { g.fillStyle = `rgba(246,241,220,${(0.5 - (y - 1116) * 0.004).toFixed(3)})`; g.fillRect(700 + 10 * Math.sin(y), y, 40 - (y - 1116) * 0.1, 3); }
  for (let i = 0; i < 70; i++) { const lx = WIN.x0 + r() * 780, ly = 1030 + r() * 80; g.fillStyle = r() < 0.7 ? '#ffcf7a' : '#fff1c8'; g.fillRect(lx, ly, 3, 3); }
  g.fillStyle = '#0f1530'; g.fillRect(784, 1046, 8, 40); g.fillRect(760, 1084, 70, 10);
  g.restore();
  // glass sheen
  g.fillStyle = 'rgba(255,255,255,.04)'; poly(g, [WIN.x0, WIN.y0 + 200, WIN.x0 + 260, WIN.y0, WIN.x0 + 360, WIN.y0, WIN.x0, WIN.y0 + 320]); g.fill();
  // window frame and mullions (lamp-lit on their left faces)
  g.fillStyle = '#5a3d2c';
  g.fillRect(WIN.x0 - 30, WIN.y0 - 30, WIN.x1 - WIN.x0 + 60, 30); g.fillRect(WIN.x0 - 30, WIN.y0, 30, y1 - WIN.y0); g.fillRect(WIN.x1, WIN.y0, 30, y1 - WIN.y0);
  g.fillRect(527, WIN.y0, 26, y1 - WIN.y0); g.fillRect(WIN.x0, 700, WIN.x1 - WIN.x0, 22);
  g.fillStyle = '#9a6a46'; g.fillRect(WIN.x0 - 30, WIN.y0 - 30, 8, y1 - WIN.y0 + 30); g.fillRect(527, WIN.y0, 6, y1 - WIN.y0); g.fillRect(WIN.x0, 700, WIN.x1 - WIN.x0, 5);
  // curtains on a rod
  g.fillStyle = '#6b4a35'; g.fillRect(20, 168, 1040, 14); circ(g, 22, 175, 14); g.fill(); circ(g, 1058, 175, 14); g.fill();
  const curtain = (x0, w, side) => {
    g.beginPath(); g.moveTo(x0, 182); g.lineTo(x0 + w, 182);
    g.quadraticCurveTo(x0 + w + side * 26, 700, x0 + w - side * 30, SILL + 10); g.lineTo(x0 - side * 10, SILL + 10); g.closePath();
    g.fillStyle = '#34467c'; g.fill();
    g.save(); g.clip();
    for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? 'rgba(20,28,60,.35)' : 'rgba(120,140,200,.16)'; g.fillRect(x0 + (k * w) / 6, 182, w / 9, SILL); }
    g.restore();
  };
  curtain(36, 190, 1); curtain(854, 190, -1);
  // sill: top plane, front face, shadow under
  g.fillStyle = lin(g, 0, SILL - 34, 0, SILL + 4, [[0, '#d39c64'], [1, '#b47f4e']]); g.fillRect(0, SILL - 34, W, 38);
  g.fillStyle = '#7a5134'; g.fillRect(0, SILL + 4, W, 60);
  g.fillStyle = '#a06d46'; g.fillRect(0, SILL + 4, W, 5);
  g.fillStyle = lin(g, 0, SILL + 64, 0, SILL + 160, [[0, 'rgba(0,0,10,.5)'], [1, 'rgba(0,0,10,0)']]); g.fillRect(0, SILL + 64, W, 96);
  // a jar of shells (from the sea) and a potted plant
  g.save(); g.translate(250, SILL - 20);
  ell(g, 0, 0, 64, 12); g.fillStyle = 'rgba(40,20,10,.35)'; g.fill();
  g.beginPath(); g.roundRect(-56, -150, 112, 150, 22); g.fillStyle = 'rgba(190,220,240,.18)'; g.fill();
  for (const [sx, sy, c] of [[-26, -24, '#ffd9c4'], [12, -30, '#fff1dc'], [32, -18, '#f7b9a8'], [-4, -54, '#ffe6c8'], [-34, -60, '#f2c2b0'], [22, -62, '#fff4e6']]) {
    g.fillStyle = c; g.beginPath(); g.moveTo(sx, sy + 12); g.lineTo(sx - 15, sy - 6); g.quadraticCurveTo(sx, sy - 22, sx + 15, sy - 6); g.closePath(); g.fill();
  }
  g.strokeStyle = 'rgba(220,240,255,.55)'; g.lineWidth = 4; g.beginPath(); g.roundRect(-56, -150, 112, 150, 22); g.stroke();
  g.fillStyle = '#8a6a4a'; g.fillRect(-46, -168, 92, 20);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-42, -136, 9, 110);
  g.restore();
  g.save(); g.translate(860, SILL - 20);
  ell(g, 0, 0, 70, 12); g.fillStyle = 'rgba(40,20,10,.35)'; g.fill();
  for (const [a, l, c] of [[-1.0, 150, '#3f7a4e'], [-0.55, 190, '#56935c'], [-0.1, 210, '#3f7a4e'], [0.35, 180, '#62a065'], [0.8, 140, '#4a8655']]) {
    g.save(); g.translate(0, -96); g.rotate(a * 0.7); ell(g, 0, -l / 2, 22, l / 2); g.fillStyle = c; g.fill(); g.restore();
  }
  g.fillStyle = '#c4673f'; poly(g, [-52, -96, 52, -96, 40, 0, -40, 0]); g.fill();
  g.fillStyle = '#d97b51'; g.fillRect(-58, -110, 116, 22);
  g.fillStyle = 'rgba(80,20,10,.25)'; poly(g, [12, -88, 52, -88, 40, 0, 6, 0]); g.fill();
  g.restore();
  // a child's crayon drawing of today, taped under the sill: the sun, the waves, the boat
  g.save(); g.translate(700, SILL + 270); g.rotate(0.05);
  g.fillStyle = 'rgba(0,0,10,.3)'; g.fillRect(-142, -102, 296, 222);
  g.fillStyle = '#f7efdc'; g.fillRect(-150, -112, 296, 222);
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = '#f2a33a'; g.lineWidth = 5; circ(g, 70, -50, 26); g.stroke();
  g.beginPath(); for (let k = 0; k < 8; k++) { const a = k * TAU / 8; g.moveTo(70 + Math.cos(a) * 36, -50 + Math.sin(a) * 36); g.lineTo(70 + Math.cos(a) * 50, -50 + Math.sin(a) * 50); } g.stroke();
  g.strokeStyle = '#4a86c8'; g.lineWidth = 6;
  for (const y of [40, 66]) { g.beginPath(); for (let x = -130; x <= 130; x += 8) g.lineTo(x, y + 7 * Math.sin(x / 14)); g.stroke(); }
  g.strokeStyle = '#2a2a40'; g.lineWidth = 4; poly(g, [-80, 10, 0, 10, -22, 34, -58, 34]); g.stroke(); poly(g, [-62, 10, -18, 10, -40, -36]); g.stroke();
  g.fillStyle = '#e8573c'; circ(g, -44, -2, 5); g.fill();
  g.fillStyle = 'rgba(236,222,180,.75)'; g.save(); g.rotate(-0.3); g.fillRect(-170, -88, 70, 22); g.restore(); g.save(); g.rotate(0.3); g.fillRect(70, -150, 70, 22); g.restore();
  g.restore();
  // warm lamp light from the left, cool moonlight through the glass
  g.globalCompositeOperation = 'lighter';
  glow(g, GL.amber, -140, SILL - 120, 1150, 0.42);
  g.fillStyle = 'rgba(150,170,255,.06)'; poly(g, [560, WIN.y0, 930, WIN.y0, 760, SILL - 34, 300, SILL - 34]); g.fill();
  g.globalCompositeOperation = 'source-over';
}
function drawWindow(g, t) {
  g.drawImage(BG[4], 0, 0);
  for (const s of STARS5) {
    const a = 0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(t * s.w + s.ph), 3);
    g.fillStyle = `rgba(240,244,255,${a.toFixed(3)})`; g.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
    if (s.big) { g.fillRect(s.x - 6 * a, s.y - 0.75, 12 * a, 1.5); g.fillRect(s.x - 0.75, s.y - 6 * a, 1.5, 12 * a); }
  }
  // the far lighthouse still blinks
  const bl = Math.pow(Math.max(0, Math.sin(t * 2.6)), 8);
  g.globalCompositeOperation = 'lighter';
  glow(g, GL.gold, 788, 1044, 34, 0.25 + 0.75 * bl); glow(g, GL.moon, 720, 470, 120, 0.25 + 0.05 * Math.sin(t * 1.3));
  g.globalCompositeOperation = 'source-over';
  // the boat dries on the sill (a damp spot and a slow drip)
  const b = { x: Q.x, y: Q.y, s: Q.s, rot: 0 };
  ell(g, b.x, SILL - 2, 118 * b.s, 9); g.fillStyle = 'rgba(70,40,20,.35)'; g.fill();
  ell(g, b.x - 20, SILL - 3, 70 * b.s, 5); g.fillStyle = 'rgba(255,220,170,.22)'; g.fill();
  placeBoat(g, PAL.night, b, null, 1);
  const dk = fract((t - 8.0) / 1.4);
  if (dk < 0.7) { circ(g, b.x + 82 * b.s - 4 * dk, b.y + 4 + 18 * dk * b.s, 4.5); g.fillStyle = `rgba(200,225,255,${(0.75 * (1 - dk / 0.7)).toFixed(3)})`; g.fill(); }
}
const STARS5 = [];

// =================================================================== transitions
let BAND, BAND_H = 320;
function makeBand() {
  const { c, g } = mk(W, BAND_H + 50), h = BAND_H;
  g.fillStyle = lin(g, 0, 0, 0, h, [[0, 'rgba(90,214,230,0)'], [0.45, 'rgba(90,214,230,.24)'], [0.82, 'rgba(130,232,242,.62)'], [1, 'rgba(240,255,255,.95)']]);
  g.fillRect(0, 0, W, h);
  for (let y = 0; y < h; y += 7) { g.fillStyle = `rgba(255,255,255,${(0.05 + 0.14 * y / h).toFixed(3)})`; g.fillRect(0, y, W, 2); }
  g.fillStyle = 'rgba(255,255,255,.6)'; for (let x = 0; x < W; x += 54) g.fillRect(x, h - 30, 3, 22);
  g.fillStyle = lin(g, 0, h - 44, 0, h, [[0, 'rgba(170,245,250,0)'], [1, 'rgba(210,252,255,.85)']]); g.fillRect(0, h - 44, W, 44);
  g.fillStyle = lin(g, 0, h, 0, h + 50, [[0, 'rgba(190,250,255,.55)'], [1, 'rgba(190,250,255,0)']]); g.fillRect(0, h, W, 50);
  g.fillStyle = '#ffffff'; g.fillRect(0, h - 6, W, 7);
  return c;
}
const SPARKS = [], WARP = [];
/** every frame starts from the same 2D state (caps, joins, alpha… would otherwise leak from whatever was drawn last) */
function resetCtx(g) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.lineCap = 'butt'; g.lineJoin = 'miter'; g.lineWidth = 1; g.miterLimit = 10;
  g.fillStyle = '#000'; g.strokeStyle = '#000';
}
function renderScene(i, g, t) {
  resetCtx(g);
  applyCam(g, cam(i, t));
  [drawPuddle, drawBrook, drawSea, drawHarbour, drawWindow][i](g, t);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function whip(t) {
  const g = main.g, P = (x) => W * P4IO(seg(x, T.whipA, T.whipB));
  const X = P(t), v = Math.abs(P(t + 1 / 240) - P(t - 1 / 240)) * 120;    // px/s
  const L = Math.min(460, v * 0.05);                                         // shutter ≈ 1/20 s
  renderScene(0, offA.g, t); renderScene(1, offB.g, t);
  resetCtx(g);
  g.fillRect(0, 0, W, H);
  const N = L < 3 ? 1 : 8;
  for (let i = 0; i < N; i++) {                                              // running mean of N offset samples
    const o = N === 1 ? 0 : L * (i / (N - 1) - 0.5);
    g.globalAlpha = 1 / (i + 1);
    if (X - o < W) g.drawImage(offA.c, Math.round(-X + o), 0);
    if (X - o > 0) g.drawImage(offB.c, Math.round(W - X + o), 0);
  }
  g.globalAlpha = 1;
  const sp = clamp(v / 6000);
  if (sp > 0.05) {                                                           // light streaks along the pan
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) {
      const y = 140 + fract(i * 0.618) * 1500, len = 200 + 500 * fract(i * 0.371), x = fract(i * 0.754 - X / 1700) * (W + len) - len;
      g.fillStyle = `rgba(255,250,235,${(0.16 * sp).toFixed(3)})`; g.fillRect(x, y, len * sp, 3 + (i % 3) * 2);
    }
    g.globalCompositeOperation = 'source-over';
  }
}
function scan(t) {
  const g = main.g, p = P2IO(seg(t, T.scanA, T.scanB));
  const edge = lerp(-40, H + BAND_H, p);
  renderScene(1, g, t);
  renderScene(2, offB.g, t);
  const e = Math.round(clamp(edge, 0, H));
  if (e > 0) g.drawImage(offB.c, 0, 0, W, e, 0, 0, W, e);
  g.drawImage(BAND, 0, Math.round(edge - BAND_H));
  // spray riding the edge
  for (let i = 0; i < 34; i++) {
    const x = fract(i * 0.6180339) * W, d = 8 + 70 * fract(i * 0.4142 + p * 3);
    circ(g, x, edge + d - 20, 2 + (i % 4)); g.fillStyle = `rgba(235,255,255,${(0.75 * (1 - d / 80)).toFixed(3)})`; g.fill();
  }
}
function ping(t) {
  const g = main.g;
  renderScene(2, g, t);
  const R = RMAX * P2IO(seg(t, T.pingA, T.pingB));
  renderScene(3, offB.g, t);
  g.save(); circ(g, PNG.x, PNG.y, R); g.clip(); g.drawImage(offB.c, 0, 0); g.restore();
}
function leak(t) {
  const g = main.g;
  renderScene(4, g, t);
  renderScene(0, offB.g, t);
  g.globalAlpha = SIO(seg(t, T.leakA, T.leakB)); g.drawImage(offB.c, 0, 0); g.globalAlpha = 1;
}
/** decorations that outlive a single composite: pre-pings, rings, sparks, the iris mask, the dawn leak */
function overlays(t) {
  const g = main.g;
  resetCtx(g);
  // two small pings from the lamp, then the wipe's own rings
  for (const t0 of [T.pre1, T.pre2]) {
    const p = seg(t, t0, t0 + 0.55);
    if (p > 0 && p < 1) { g.strokeStyle = `rgba(255,224,160,${(0.95 * (1 - p)).toFixed(3)})`; g.lineWidth = 3; circ(g, PNG.x, PNG.y, 10 + 150 * EXPO(p)); g.stroke(); }
  }
  for (const [d, w, peak] of [[0, 7, 1], [0.12, 3, 0.6]]) {
    const p = seg(t, T.pingA + d, T.pingB + d);
    if (p <= 0 || p >= 1) continue;
    const R = RMAX * P2IO(p), a = peak * (1 - P2IO(p));
    g.strokeStyle = `rgba(255,214,150,${(0.22 * a).toFixed(3)})`; g.lineWidth = w * 5; circ(g, PNG.x, PNG.y, R); g.stroke();
    g.strokeStyle = `rgba(255,236,190,${a.toFixed(3)})`; g.lineWidth = w; g.stroke();
  }
  const s0 = T.pingA + 0.05, age = t - s0;
  if (age > 0 && age < 1) {
    g.globalCompositeOperation = 'lighter';
    if (age < 0.2) glow(g, GL.gold, PNG.x, PNG.y, 160 + 500 * age, 0.6 * (1 - age / 0.2));
    for (const p of SPARKS) {
      if (age > p.life) continue;
      const u = age / p.life, f = (1 - Math.exp(-1.4 * age)) / 1.4, e = Math.exp(-1.4 * age);
      const x = PNG.x + p.vx * f, y = PNG.y + p.vy * f, al = Math.pow(1 - u, 1.4);
      g.strokeStyle = g.fillStyle = `rgba(255,${p.warm ? 200 : 240},${p.warm ? 130 : 210},${al.toFixed(3)})`;
      g.lineWidth = Math.max(1, p.sz * 0.7);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - p.vx * e * 0.035, y - p.vy * e * 0.035); g.stroke();
      const rr = p.sz * (1 - u * 0.6); g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    for (const p of WARP) {
      const a2 = age + 0.03; if (a2 > p.life) continue;
      const u = a2 / p.life, f = (1 - Math.exp(-1.2 * a2)) / 1.2, rr = 40 + p.sp * f, Lw = 50 + rr * 0.28;
      g.strokeStyle = `rgba(255,236,200,${(Math.pow(1 - u, 1.2) * Math.min(1, u * 8)).toFixed(3)})`; g.lineWidth = p.sz;
      g.beginPath(); g.moveTo(PNG.x + p.cx * (rr - Lw), PNG.y + p.cy * (rr - Lw)); g.lineTo(PNG.x + p.cx * rr, PNG.y + p.cy * rr); g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
  }
  // iris: closes onto the boat, the cut happens inside the circle (boat → the same boat on the sill), opens
  if (t >= T.irisA && t < T.irisB) {
    let r, cx, cy;
    if (t < T.swap) {
      const v = cam(3, t), b = boat4(t);
      [cx, cy] = scr(v, b.x, b.y - 62 * b.s);
      r = lerp(1500, 186, P3IO(seg(t, T.irisA, T.irisC)));
    } else {
      const v = cam(4, t);
      [cx, cy] = scr(v, Q.x, Q.y - 62 * Q.s);
      r = lerp(186, 1500, P3IO(seg(t, T.irisO, T.irisB)));
    }
    g.fillStyle = radg(g, cx, cy, Math.max(0, r - 70), r, [[0, 'rgba(10,8,22,0)'], [1, 'rgba(10,8,22,.55)']]);
    circ(g, cx, cy, r); g.fill();
    g.fillStyle = '#0b0918';
    g.beginPath(); g.rect(0, 0, W, H); g.arc(cx, cy, r, 0, TAU); g.fill('evenodd');
    g.strokeStyle = 'rgba(255,214,160,.75)'; g.lineWidth = 4; circ(g, cx, cy, r + 2); g.stroke();
  }
  // the dawn leak: a warm blob swept across while S5 dissolves into the morning (it runs on past the loop point)
  const u = loopT(t), lp = seg(u, T.leakA - D, T.leakEnd - D);
  if (lp > 0 && lp < 1) {
    const a = lp < 0.4 ? P2O(lp / 0.4) : Math.pow(1 - (lp - 0.4) / 0.6, 2);
    g.globalCompositeOperation = 'screen';
    const x = lerp(-420, 1500, SIO(lp)), y = lerp(1480, 640, lp);
    glow(g, GL.leakWarm, x, y, 1150, a);
    glow(g, GL.leakWarm, x, y, 600, 0.6 * a);
    glow(g, GL.leakPink, x - 460, y + 420, 760, 0.7 * a);
    g.globalAlpha = 0.55 * a; g.drawImage(GL.leakWarm, x - 1300, y - 120, 2600, 240); g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }
}

// =================================================================== DOM text
const CSS = `
.k93 { position:absolute; inset:0; pointer-events:none; font-family:${PF}; }
.k93 .hero { position:absolute; left:88px; top:262px; }
.k93 .chip { display:inline-flex; align-items:center; gap:14px; height:62px; padding:0 28px 0 16px; border-radius:31px; box-sizing:border-box;
  background:rgba(14,20,40,.5); border:2px solid rgba(255,255,255,.32); color:#fff; font:700 31px/1 ${PF}; letter-spacing:-0.01em;
  font-variant-numeric:tabular-nums; white-space:nowrap; }
.k93 .chip i { width:28px; height:28px; border-radius:50%; display:block; }
.k93 .ln { font-weight:900; line-height:1.12; letter-spacing:-0.045em; white-space:nowrap; }
`;
function buildText(stage, tl) {
  const root = document.createElement('div');
  root.className = 'k93'; root.style.zIndex = 5;
  const st = document.createElement('style'); st.textContent = CSS; root.appendChild(st);
  stage.appendChild(root);
  const waves = [];
  HEROES.forEach((h, i) => {
    const box = document.createElement('div'); box.className = 'hero'; root.appendChild(box);
    const chip = document.createElement('div'); chip.className = 'chip';
    const dot = h.dot === 'moon' ? 'background:#f6f0da;box-shadow:inset -9px -3px 0 0 #8e95c4' : `background:${h.dot};box-shadow:0 0 14px ${h.dot}`;
    chip.innerHTML = `<i style="${dot}"></i><span>${h.chip}</span>`;
    box.appendChild(chip);
    const chars = [];
    h.lines.forEach(([txt, size, color], j) => {
      const ln = document.createElement('div'); ln.className = 'ln';
      ln.style.cssText = `font-size:${size}px;color:${color};margin-top:${j ? -6 : 14}px;filter:drop-shadow(0 6px 22px ${h.dark ? 'rgba(255,255,255,.55)' : 'rgba(12,8,30,.45)'})`;
      ln.textContent = txt; box.appendChild(ln);
      const sp = new SplitText(ln, { type: 'chars', mask: 'chars' });
      chars.push(...sp.chars);
    });
    tl.fromTo(chip, { autoAlpha: 0, scale: 0.6, y: 12, transformOrigin: '0% 50%' }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, h.in - 0.06);
    // char i enters at in + 0.055·i and leaves at out + 0.03·i: the entrance must end before its exit starts (two live
    // tweens on one property would make the result depend on the seek history)
    const dIn = Math.min(0.72, h.out - h.in - 0.025 * (chars.length - 1) - 0.02, h.out - h.in - 0.02);
    tl.fromTo(chars, { yPercent: 118 }, { yPercent: 0, duration: dIn, ease: 'expo.out', stagger: 0.055 }, h.in);
    tl.to(chars, { yPercent: -118, duration: 0.28, ease: 'power2.in', stagger: 0.03 }, h.out);
    tl.to(chip, { autoAlpha: 0, y: -26, duration: 0.24, ease: 'power2.in' }, h.out + 0.05);
    if (h.wave || h.float) waves.push({ chars, h });
  });
  return waves;
}

// =================================================================== the demo
defineDemo({
  id: '93-transition-kit',
  title: '종이배의 하루',
  tech: '장면 전환 키트 · 와이프·아이리스·휩 팬·매치 컷',
  duration: D,
  background: '#0b0918',
  async setup(api) {
    HEADLESS = api.headless;
    await fontReady(`900 236px ${PF}`, HEROES.map((h) => h.chip + h.lines.map((l) => l[0]).join('')).join(''));
    const attrs = HEADLESS ? { willReadFrequently: true } : undefined;
    const c = api.canvas({ type: '2d', z: 0, attrs });
    main = { c: c.el, g: c.ctx };
    offA = mk(W, H); offB = mk(W, H);

    GL.white = glowSprite('255,255,255'); GL.cream = glowSprite('255,244,214'); GL.gold = glowSprite('255,206,130');
    GL.amber = glowSprite('255,168,92', 0.38); GL.moon = glowSprite('214,226,255');
    GL.leakWarm = (() => { const { c: cv, g } = mk(256, 256); g.fillStyle = radg(g, 128, 128, 0, 128, [[0, 'rgba(255,232,186,.95)'], [0.45, 'rgba(255,170,108,.38)'], [1, 'rgba(255,140,90,0)']]); g.fillRect(0, 0, 256, 256); return cv; })();
    GL.leakPink = (() => { const { c: cv, g } = mk(256, 256); g.fillStyle = radg(g, 128, 128, 0, 128, [[0, 'rgba(255,206,214,.9)'], [0.5, 'rgba(255,120,140,.28)'], [1, 'rgba(255,110,130,0)']]); g.fillRect(0, 0, 256, 256); return cv; })();
    SPR.morning = boatSprite(PAL.morning); SPR.sunset = boatSprite(PAL.sunset);

    // continuity points: the ping starts on S3's lamp; S4's camera pivots there; S5's boat sits where S4's boat was at the cut
    { const [x, y] = scr(cam(2, T.pingA), LH3.x, LH3.y); PNG = { x, y }; }
    CAM[3].px = PNG.x; CAM[3].py = PNG.y;
    RMAX = Math.hypot(Math.max(PNG.x, W - PNG.x), Math.max(PNG.y, H - PNG.y)) + 60;
    {
      const v4 = cam(3, T.swap), b4 = boat4(T.swap), [x, y] = scr(v4, b4.x, b4.y);
      CAM[4].px = x; CAM[4].py = y;
      const k5 = cam(4, T.swap).a;
      Q = { x, y, s: (v4.a * b4.s) / k5 };
      SILL = Math.round(y + 24 * Q.s + 1);
      // the dawn dissolve is a match too: at t = D (= frame 0) S1's boat sits exactly where S5's boat is
      const v0 = cam(0, D), v5 = cam(4, D), [sx, sy] = scr(v5, Q.x, Q.y);
      B1.x = (sx - v0.e) / v0.a; B1.y = (sy - v0.f) / v0.a; B1.s = (v5.a * Q.s) / v0.a;
      PUD.cy = B1.y + 34;
    }

    // per-scene tables (rand(seed) only)
    { const r = rand(11); for (let i = 0; i < 9; i++) { const a = r() * TAU, k = Math.sqrt(r()) * 0.8; RIP1.push({ x: PUD.cx + Math.cos(a) * PUD.rx * k, y: PUD.cy + Math.sin(a) * PUD.ry * k, per: 1.1 + r() * 0.9, ph: r() * 2 }); } }
    { const r = rand(22); for (let i = 0; i < 48; i++) { const y = 910 + Math.pow(r(), 0.9) * 410, dpt = (y - 900) / 430; STREAK2.push({ x0: r(), y, v: 70 + 300 * dpt, len: 26 + 90 * dpt, w: 2 + 3 * dpt, a: 0.25 + 0.35 * dpt, ph: r() * TAU }); } }
    { const r = rand(23); for (let i = 0; i < 9; i++) REEDS.push({ x: 820 + i * 34 + r() * 20, h: 420 + r() * 300, w: 6 + r() * 4, bend: -30 + r() * 40, ph: r() * TAU, cat: i % 3 !== 1, c: i % 2 ? '#3e6f3a' : '#4f8a45' }); }
    { const r = rand(33); for (let i = 0; i < 60; i++) { const y = 790 + Math.pow(r(), 1.6) * 360, w = 30 + (y - 790) * 0.55; GLIT3.push({ x: 790 + (r() - 0.5) * 2 * w, y, l: 4 + 9 * r(), w: 3 + 5 * r(), ph: r() * TAU }); } }
    { const r = rand(34); for (let i = 0; i < 3; i++) GULLS.push({ x: 120 + i * 260 + r() * 60, y: 420 + r() * 200, v: 18 + r() * 14, s: 0.7 + r() * 0.5, f: 7 + r() * 3, ph: r() * TAU }); }
    { const r = rand(44); for (let i = 0; i < 36; i++) { const k = i / 36, y = 944 + 560 * Math.pow(k, 1.35); SHIM4.push({ y, hw: 26 + 170 * k, dx: (r() - 0.5) * 60 * k, lw: 3 + 6 * k, w: 2.5 + 3 * r(), ph: r() * TAU }); } }
    { const r = rand(45); for (let i = 0; i < 4; i++) BIRDS4.push({ x: 60 + i * 120 + r() * 50, y: 700 + r() * 160, v: 16 + r() * 10, s: 0.8 + r() * 0.5, f: 6 + r() * 3, ph: r() * TAU }); }
    { const r = rand(55); for (let i = 0; i < 46; i++) STARS5.push({ x: WIN.x0 + 10 + r() * 760, y: WIN.y0 + 10 + r() * 620, w: 1.5 + 3 * r(), ph: r() * TAU, big: r() < 0.18 }); }
    { const r = rand(93); for (let i = 0; i < 90; i++) { const a = r() * TAU, sp = RMAX * 1.15 * (0.35 + 0.65 * r()); SPARKS.push({ vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.85 * (0.55 + 0.45 * r()), sz: 2.6 * (0.5 + r()), warm: r() < 0.6 }); }
      for (let i = 0; i < 36; i++) { const a = r() * TAU; WARP.push({ cx: Math.cos(a), cy: Math.sin(a), sp: RMAX * 0.8 * (0.35 + 0.65 * r()), life: 0.6 * (0.55 + 0.45 * r()), sz: 2 * (0.5 + r()) }); } }

    // bake the static part of each scene
    for (const fn of [bgPuddle, bgBrook, bgSea, bgHarbour, bgWindow]) { const o = mk(W, H); fn(o.g); BG.push(o.c); }
    BAND = makeBand();

    // vignette + moving film grain over everything
    const vig = document.createElement('div');
    vig.style.cssText = 'position:absolute;inset:0;z-index:3;pointer-events:none;background:radial-gradient(ellipse 80% 70% at 50% 46%, rgba(0,0,0,0) 58%, rgba(8,8,24,.42) 100%)';
    api.stage.appendChild(vig);
    const gr = document.createElement('canvas'); gr.width = W + 64; gr.height = H + 64;
    gr.style.cssText = `position:absolute;left:0;top:0;width:${W + 64}px;height:${H + 64}px;z-index:8;pointer-events:none;opacity:.10;mix-blend-mode:overlay`;
    { const gg = gr.getContext('2d'), img = gg.createImageData(gr.width, gr.height), r = rand(2027);
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.floor(r() * 256); img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      gg.putImageData(img, 0, 0); }
    api.stage.appendChild(gr);
    this.grain = gr;

    // text: one paused timeline
    const tl = gsap.timeline({ paused: true, defaults: { lazy: false } });
    this.waves = buildText(api.stage, tl);
    tl.set({}, {}, D);
    tl.time(D); tl.time(0);
    this.tl = tl;
  },
  frame(t) {
    this.tl.time(t);
    for (const { chars, h } of this.waves) {           // per-char offsets on the CSS translate property (GSAP owns transform)
      chars.forEach((c, i) => {
        const y = h.wave ? 12 * Math.sin(t * 7.5 - i * 0.9) : 8 * Math.sin(t * 2.2 - i * 0.7);
        c.style.translate = `0 ${y.toFixed(2)}px`;
      });
    }
    const g = main.g;
    resetCtx(g);
    if (t < T.whipA) renderScene(0, g, t);
    else if (t < T.whipB) whip(t);
    else if (t < T.scanA) renderScene(1, g, t);
    else if (t < T.scanB) scan(t);
    else if (t < T.pingA) renderScene(2, g, t);
    else if (t < T.pingB) ping(t);
    else if (t < T.swap) renderScene(3, g, t);
    else if (t < T.leakA) renderScene(4, g, t);
    else leak(t);
    overlays(t);
    const q = Math.floor(t * 12);
    this.grain.style.transform = `translate(${-((q * 37) % 64)}px, ${-((q * 23 + 11) % 64)}px)`;
  },
});
