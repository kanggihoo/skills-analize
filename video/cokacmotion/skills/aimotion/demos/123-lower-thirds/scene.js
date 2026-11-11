/*
 * 123 · scene.js — the two "camera shots" the graphics package sits on (Canvas 2D, flat illustration, pure functions of t).
 *   shot A (0 → CUT)  인터뷰: a street-stall baker under a striped awning on a snowy night, medium shot, slow push-in.
 *   shot B (CUT → end) 인서트: fish-shaped pastries cooling on a wire rack; tongs set down one fresh pastry at the beat (6.0 s).
 * Everything that moves is a closed form of t; scatter tables (snow, bokeh, steam) are baked once from rand(seed).
 */
import { rand, clamp, lerp } from '../_lib/stage.js';

export const CUT = 4.3;          // the stinger covers the frame from ~4.2 to ~4.45 s; the shot changes under it
export const BEAT = 5.66;         // the fresh pastry lands (the data chip ticks +1 at the same instant)
const TAU = Math.PI * 2;
const fract = (x) => x - Math.floor(x);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const sstep = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const outExpo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const outBack = (p, c = 1.6) => 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
const inOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

// ------------------------------------------------------------------ baked tables
export function makeScene() {
  const r = rand(12301);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const bokehA = Array.from({ length: 34 }, () => ({
    x: -40 + r() * 1160, y: 180 + r() * 1180, rad: 16 + r() * r() * 74,
    c: pick(['255,184,96', '255,150,90', '255,214,150', '120,200,255', '255,120,150', '255,184,96']),
    a: 0.16 + r() * 0.3, ph: r() * TAU, sp: 0.5 + r() * 1.2,
  }));
  const bokehB = Array.from({ length: 16 }, () => ({
    x: -60 + r() * 1200, y: -40 + r() * 330, rad: 30 + r() * 80,
    c: pick(['255,184,96', '255,200,130', '255,150,90']), a: 0.18 + r() * 0.3, ph: r() * TAU, sp: 0.4 + r(),
  }));
  const flake = (n, s0, s1, v0, v1) => Array.from({ length: n }, () => ({
    x: r() * 1160 - 40, y: r() * 2000, s: s0 + r() * (s1 - s0), v: v0 + r() * (v1 - v0), amp: 6 + r() * 22, ph: r() * TAU, f: 0.4 + r() * 0.9,
  }));
  const steamA = Array.from({ length: 22 }, (_, i) => ({ x: 270 + (i % 4) * 132 + r() * 60, ph: r(), sp: 0.28 + r() * 0.18, w: r() * TAU, s: 0.7 + r() * 0.6 }));
  const steamB = Array.from({ length: 30 }, () => ({ fx: Math.floor(r() * 7), dx: (r() - 0.5) * 140, ph: r(), sp: 0.22 + r() * 0.16, w: r() * TAU, s: 0.7 + r() * 0.7 }));
  // mouth: syllable openness table, 12 syllables a second
  const syl = Array.from({ length: 64 }, () => (r() < 0.16 ? 0 : 0.35 + r() * 0.65));
  return { bokehA, bokehB, farSnow: flake(110, 1.6, 3.6, 55, 105), nearSnow: flake(26, 7, 15, 170, 290), syl, steamA, steamB };
}

/** the defocused alley behind the stall, painted once with a blur filter (static: only the camera moves it) */
export function bakeAlley(headless) {
  const M = 90;
  const c = document.createElement('canvas');
  c.width = 1080 + 2 * M; c.height = 1920 + 2 * M;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  g.translate(M, M);
  const sky = g.createLinearGradient(0, -M, 0, 1920 + M);
  sky.addColorStop(0, '#0f1530'); sky.addColorStop(0.55, '#1d2348'); sky.addColorStop(1, '#2a2445');
  g.fillStyle = sky; g.fillRect(-M, -M, 1080 + 2 * M, 1920 + 2 * M);
  g.filter = 'blur(16px)';
  g.fillStyle = '#1a2044'; rr(g, -120, 300, 370, 1400, 10); g.fill();
  g.fillStyle = '#231f4a'; rr(g, 830, 230, 400, 1500, 10); g.fill();
  g.fillStyle = '#161b3b'; rr(g, 220, 520, 640, 1100, 10); g.fill();
  for (const [x, y, w, h, col] of WINDOWS) {
    g.fillStyle = `rgba(${col},0.55)`; g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(20,24,56,0.55)'; g.fillRect(x + w / 2 - 4, y, 8, h); g.fillRect(x, y + h * 0.42, w, 8);
  }
  g.fillStyle = 'rgba(255,140,175,0.75)'; g.fillRect(930, 380, 34, 360);           // a neon sign far down the alley
  g.fillStyle = 'rgba(255,214,150,0.8)'; g.fillRect(126, 456, 30, 30);             // street lamp head
  g.filter = 'none';
  glow(g, 947, 560, 240, '255,110,150', 0.3);
  glow(g, 140, 470, 270, '255,190,110', 0.34);
  return { c, M };
}

// ------------------------------------------------------------------ helpers
function camera(g, c, depth) {
  const s = 1 + (c.s - 1) * depth;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(c.cx + c.ox * depth, c.cy + c.oy * depth);
  g.rotate(c.rot * depth);
  g.scale(s, s);
  g.translate(-c.cx, -c.cy);
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function disc(g, x, y, r, fill) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = fill; g.fill(); }
function glow(g, x, y, r, rgb, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${rgb},${a})`);
  gr.addColorStop(0.45, `rgba(${rgb},${a * 0.45})`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.fillRect(x - r, y - r, r * 2, r * 2);
}
function bokeh(g, x, y, r, rgb, a) {
  const gr = g.createRadialGradient(x, y, r * 0.2, x, y, r);
  gr.addColorStop(0, `rgba(${rgb},${a * 0.75})`);
  gr.addColorStop(0.82, `rgba(${rgb},${a})`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
}
function snow(g, list, t, alpha) {
  g.fillStyle = `rgba(255,255,255,${alpha})`;
  for (const f of list) {
    const y = ((f.y + f.v * t) % 2000) - 40;
    const x = f.x + f.amp * Math.sin(t * f.f + f.ph);
    g.beginPath(); g.arc(x, y, f.s, 0, TAU); g.fill();
  }
}

// ------------------------------------------------------------------ shot A: the interview
const WINDOWS = [
  [-30, 330, 150, 200, '255,190,120'], [128, 620, 92, 130, '150,215,255'], [-20, 880, 170, 110, '255,200,130'],
  [118, 1090, 96, 170, '255,176,110'], [884, 960, 150, 120, '255,196,128'], [1000, 1150, 110, 190, '150,215,255'], [250, 600, 70, 90, '255,190,120'],
];
export function drawA(g, t, S) {
  const k = clamp(t / CUT);
  const c = {
    cx: 540, cy: 820, s: 1.012 + 0.05 * k,
    ox: 3.2 * Math.sin(1.3 * t + 0.4) + 1.5 * Math.sin(2.7 * t + 1.9),
    oy: 2.6 * Math.sin(1.1 * t + 2.2) + 1.2 * Math.sin(3.1 * t),
    rot: 0.0024 * Math.sin(0.8 * t + 0.5),
  };
  // night alley, out of focus (depth 0.35)
  // (the static, defocused alley was baked once with a blur filter: bakeAlley)
  camera(g, c, 0.35);
  g.drawImage(S.alley.c, -S.alley.M, -S.alley.M);
  for (const b of S.bokehA) {
    const tw = 0.75 + 0.25 * Math.sin(t * b.sp + b.ph);
    bokeh(g, b.x, b.y, b.rad, b.c, b.a * tw);
  }
  snow(g, S.farSnow, t, 0.55);

  // awning poles + striped valance (depth 1.1)
  camera(g, c, 1.1);
  g.fillStyle = '#120f16';
  g.fillRect(52, 140, 22, 1400); g.fillRect(1006, 140, 22, 1400);
  valance(g, t);
  // bulbs
  for (const [bx, by, ph] of [[290, 372, 0], [800, 344, 1.7]]) {
    const sw = 0.05 * Math.sin(t * 1.6 + ph);
    const px = bx + Math.sin(sw) * (by - 220), py = 220 + Math.cos(sw) * (by - 220);
    g.strokeStyle = '#1a1414'; g.lineWidth = 4; g.beginPath(); g.moveTo(bx, 210); g.lineTo(px, py); g.stroke();
    g.fillStyle = '#3a3030'; rr(g, px - 11, py - 18, 22, 20, 5); g.fill();
    g.globalCompositeOperation = 'lighter';
    glow(g, px, py + 14, 300, '255,170,80', 0.32 + 0.02 * Math.sin(t * 9 + ph));
    g.globalCompositeOperation = 'source-over';
    disc(g, px, py + 14, 20, '#fff4cf');
    disc(g, px - 5, py + 9, 7, '#ffffff');
  }

  // the baker (depth 1.0)
  camera(g, c, 1.0);
  person(g, t, S);

  // grill, counter, case of pastries, paper bags (depth 1.15)
  camera(g, c, 1.15);
  counter(g, t);
  // steam rising off the moulds
  steam(g, S.steamA.map((p) => ({ x: p.x, y: 1300, ph: p.ph, sp: p.sp, w: p.w, s: p.s })), t, 560, 0.17);

  // near snow, big and soft (depth 1.4)
  camera(g, c, 1.4);
  snow(g, S.nearSnow, t, 0.32);
  g.setTransform(1, 0, 0, 1, 0, 0);
  // warm spill from the grill at the bottom of frame
  const warm = g.createLinearGradient(0, 1150, 0, 1920);
  warm.addColorStop(0, 'rgba(255,140,60,0)'); warm.addColorStop(1, 'rgba(255,120,50,0.16)');
  g.fillStyle = warm; g.fillRect(0, 1150, 1080, 770);
}

function valance(g, t) {
  const top = -30, base = 214, wv = 72, n = 17;
  for (let i = 0; i < n; i++) {
    const x = -60 + i * wv;
    const dy = 5 * Math.sin(t * 1.4 + i * 0.7);
    g.fillStyle = i % 2 ? '#efe2c6' : '#c8412f';
    g.beginPath();
    g.moveTo(x, top); g.lineTo(x + wv, top); g.lineTo(x + wv, base + dy);
    g.arc(x + wv / 2, base + dy, wv / 2, 0, Math.PI);
    g.closePath(); g.fill();
  }
  // fold shading + the lit underside
  const sh = g.createLinearGradient(0, top, 0, base + 40);
  sh.addColorStop(0, 'rgba(20,10,20,0.45)'); sh.addColorStop(0.7, 'rgba(20,10,20,0.05)'); sh.addColorStop(1, 'rgba(255,170,90,0.18)');
  g.fillStyle = sh; g.fillRect(-60, top, 1200, base + 40 - top);
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(-60, 60, 1200, 10);
}

function talkAmt(t, S) {
  const env = sstep(seg(t, 1.12, 1.3)) * (1 - sstep(seg(t, 3.35, 3.55)));
  if (env <= 0) return 0;
  const i = Math.floor(t * 12), f = fract(t * 12);
  const a = S.syl[i % 64], b = S.syl[(i + 1) % 64];
  return env * lerp(a, b, sstep(f)) * (0.55 + 0.45 * Math.abs(Math.sin(t * TAU * 6)));
}
function blink(t, times) {
  let v = 0;
  for (const b of times) { const d = Math.abs(t - b); if (d < 0.08) v = Math.max(v, 1 - d / 0.08); }
  return v;
}

function person(g, t, S) {
  const talk = talkAmt(t, S);
  const breathe = Math.sin(t * 2.1) * 0.008;
  const tilt = 0.04 * Math.sin(t * 0.8 + 0.3) + 0.018 * Math.sin(t * 2.6) * (talk > 0 ? 1 : 0.3);
  const nod = 4 * Math.sin(t * 3.2) * Math.min(1, talk * 2);
  // body
  g.save();
  g.translate(520, 1420); g.scale(1, 1 + breathe); g.translate(-520, -1420);
  g.fillStyle = '#6e2836';
  g.beginPath();
  g.moveTo(258, 1440);
  g.lineTo(272, 1170);
  g.bezierCurveTo(278, 1070, 326, 1020, 410, 1002);
  g.quadraticCurveTo(520, 982, 630, 1002);
  g.bezierCurveTo(714, 1020, 762, 1070, 768, 1170);
  g.lineTo(782, 1440);
  g.closePath(); g.fill();
  // quilting
  g.save(); g.clip();
  g.strokeStyle = 'rgba(30,6,16,0.35)'; g.lineWidth = 4;
  for (let i = 0; i < 6; i++) { const y = 1060 + i * 66; g.beginPath(); g.moveTo(220, y + 14); g.quadraticCurveTo(520, y - 22, 820, y + 14); g.stroke(); }
  g.fillStyle = 'rgba(255,170,110,0.10)'; g.fillRect(232, 960, 200, 500);        // warm key from screen-left
  g.strokeStyle = 'rgba(30,6,16,0.5)'; g.lineWidth = 6; g.lineCap = 'round';      // arms hanging at the sides
  g.beginPath(); g.moveTo(352, 1060); g.quadraticCurveTo(340, 1220, 360, 1440); g.moveTo(688, 1060); g.quadraticCurveTo(700, 1220, 680, 1440); g.stroke();
  g.lineCap = 'butt';
  g.restore();
  // apron
  g.fillStyle = '#efe6d4';
  g.beginPath(); g.moveTo(398, 1110); g.quadraticCurveTo(520, 1094, 642, 1110); g.lineTo(668, 1440); g.lineTo(372, 1440); g.closePath(); g.fill();
  g.strokeStyle = '#efe6d4'; g.lineWidth = 16; g.lineCap = 'round';
  g.beginPath(); g.moveTo(410, 1112); g.lineTo(452, 990); g.moveTo(630, 1112); g.lineTo(588, 990); g.stroke();
  g.lineCap = 'butt';
  g.fillStyle = 'rgba(120,90,60,0.16)'; rr(g, 440, 1200, 160, 90, 14); g.fill();   // pocket
  g.strokeStyle = 'rgba(120,90,60,0.35)'; g.lineWidth = 3; rr(g, 440, 1200, 160, 90, 14); g.stroke();
  g.restore();

  // head (pivots at the neck)
  g.save();
  g.translate(520, 975 + nod * 0.2); g.rotate(tilt); g.translate(-520, -975);
  g.fillStyle = '#e2ad86'; rr(g, 470, 900, 100, 90, 30); g.fill();               // neck
  // scarf
  g.fillStyle = '#2d6b61';
  g.beginPath(); g.ellipse(520, 968, 168, 56, 0, 0, TAU); g.fill();
  g.fillStyle = '#245a52';
  g.beginPath(); g.moveTo(600, 960); g.quadraticCurveTo(660, 1040, 640, 1150); g.lineTo(580, 1150); g.quadraticCurveTo(600, 1050, 560, 990); g.closePath(); g.fill();
  g.strokeStyle = '#e9dcc0'; g.lineWidth = 7;
  for (const y of [948, 976]) { g.beginPath(); g.ellipse(520, y + 6, 160, 40, 0, 0.12 * Math.PI, 0.88 * Math.PI); g.stroke(); }
  g.beginPath(); g.moveTo(588, 1120); g.lineTo(636, 1120); g.stroke();
  // curls behind the face
  g.fillStyle = '#463a3c';
  for (const [x, y, r] of [[378, 726, 34], [366, 784, 32], [384, 836, 26], [662, 726, 34], [674, 784, 32], [656, 836, 26]]) disc(g, x, y, r, '#463a3c');
  g.fillStyle = 'rgba(255,255,255,0.12)';
  for (const [x, y] of [[372, 716], [362, 776], [668, 716], [676, 776]]) disc(g, x - 8, y - 8, 9, 'rgba(255,255,255,0.10)');
  // face
  g.fillStyle = '#f0c29b';
  g.beginPath(); g.ellipse(520, 776, 146, 160, 0, 0, TAU); g.fill();
  {
    const sh = g.createRadialGradient(470, 730, 60, 500, 760, 230);
    sh.addColorStop(0, 'rgba(255,214,170,0.20)'); sh.addColorStop(0.55, 'rgba(200,120,90,0)'); sh.addColorStop(1, 'rgba(170,90,70,0.32)');
    g.fillStyle = sh; g.beginPath(); g.ellipse(520, 776, 146, 160, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(255,150,190,0.45)'; g.lineWidth = 6;
    g.beginPath(); g.ellipse(520, 776, 143, 157, 0, -0.55, 0.75); g.stroke();
  }
  // ears
  disc(g, 376, 800, 22, '#e6b28a'); disc(g, 664, 800, 22, '#e2ab84');
  // cheeks
  g.fillStyle = 'rgba(236,120,104,0.38)';
  g.beginPath(); g.ellipse(438, 838, 38, 22, 0, 0, TAU); g.ellipse(612, 838, 38, 22, 0, 0, TAU); g.fill();
  // brows
  const lift = 5 * Math.min(1, talk * 1.6);
  g.strokeStyle = '#4a3a38'; g.lineWidth = 9; g.lineCap = 'round';
  g.beginPath(); g.moveTo(436, 734 - lift); g.quadraticCurveTo(464, 720 - lift, 494, 730 - lift); g.moveTo(548, 730 - lift); g.quadraticCurveTo(578, 720 - lift, 606, 734 - lift); g.stroke();
  // eyes (glancing toward the interviewer, screen-right)
  const bl = blink(t, [0.82, 2.48, 3.92]);
  for (const ex of [466, 576]) {
    const h = 19 * (1 - bl * 0.9);
    g.fillStyle = '#2a1f1f';
    g.beginPath(); g.ellipse(ex + 5, 784, 14, Math.max(1.5, h), 0, 0, TAU); g.fill();
    if (bl < 0.5) disc(g, ex + 9, 777, 4.5, '#ffffff');
    g.strokeStyle = 'rgba(80,50,40,0.5)'; g.lineWidth = 3.5;
    g.beginPath(); g.moveTo(ex + 26, 796); g.lineTo(ex + 36, 802); g.stroke();       // smile crinkle
  }
  // nose
  g.fillStyle = '#dc9c76';
  g.beginPath(); g.ellipse(526, 826, 18, 14, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,230,200,0.5)'; disc(g, 520, 820, 5, 'rgba(255,230,200,0.5)');
  // mouth
  const mo = 4 + 30 * talk;
  g.fillStyle = '#7a2b2e';
  g.beginPath();
  g.moveTo(488, 866);
  g.quadraticCurveTo(526, 878, 564, 866);
  g.quadraticCurveTo(560, 870 + mo * 1.5, 526, 872 + mo * 1.6);
  g.quadraticCurveTo(492, 870 + mo * 1.5, 488, 866);
  g.fill();
  if (mo > 8) {
    g.save(); g.clip();
    g.fillStyle = '#ffffff'; g.fillRect(480, 864, 90, 8);
    g.fillStyle = '#d96a66'; g.beginPath(); g.ellipse(526, 878 + mo * 1.6, 26, 14, 0, 0, TAU); g.fill();
    g.restore();
  }
  // beanie
  g.fillStyle = '#d4922e';
  g.beginPath(); g.ellipse(520, 700, 164, 150, 0, Math.PI, TAU); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.ellipse(520, 700, 164, 150, 0, Math.PI, TAU); g.clip();
  g.fillStyle = 'rgba(120,60,10,0.16)';
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.ellipse(520 + i * 44, 650, 8, 80, i * 0.16, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(255,220,150,0.18)'; g.beginPath(); g.ellipse(450, 600, 50, 30, -0.5, 0, TAU); g.fill();
  g.restore();
  g.fillStyle = '#c07d24'; rr(g, 350, 652, 340, 70, 30); g.fill();
  g.strokeStyle = 'rgba(90,45,5,0.35)'; g.lineWidth = 4;
  for (let x = 370; x <= 670; x += 20) { g.beginPath(); g.moveTo(x, 662); g.lineTo(x, 712); g.stroke(); }
  // pompom
  const pr = rand(77);
  for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; disc(g, 520 + Math.cos(a) * 36, 546 + Math.sin(a) * 32, 18, '#e7b260'); }
  disc(g, 520, 546, 40, '#e9b866');
  for (let i = 0; i < 8; i++) disc(g, 500 + pr() * 40, 530 + pr() * 30, 3, 'rgba(255,240,200,0.6)');
  g.restore();
  g.lineCap = 'butt';
}

function fishSilhouette(g) {
  g.beginPath();
  g.moveTo(-150, 2);
  g.bezierCurveTo(-148, -54, -96, -88, -30, -88);
  g.bezierCurveTo(32, -88, 74, -56, 96, -22);
  g.lineTo(140, -66);
  g.quadraticCurveTo(154, -66, 151, -50);
  g.quadraticCurveTo(128, -10, 131, 4);
  g.quadraticCurveTo(130, 22, 151, 56);
  g.quadraticCurveTo(154, 72, 140, 70);
  g.lineTo(96, 24);
  g.bezierCurveTo(72, 62, 26, 86, -34, 84);
  g.bezierCurveTo(-102, 82, -150, 54, -150, 2);
  g.closePath();
}
/** a fish-shaped pastry (붕어빵), local length ~300 px; tone 0..1 = how toasted */
function fish(g, x, y, s, rot, tone = 0.5, sx = 1, sy = 1, flip = 1) {
  g.save();
  g.translate(x, y); g.rotate(rot); g.scale(s * sx * flip, s * sy);
  g.lineJoin = 'round';
  // crisp batter flange
  fishSilhouette(g);
  g.strokeStyle = '#eebd6c'; g.lineWidth = 18; g.stroke();
  g.strokeStyle = 'rgba(160,90,30,0.35)'; g.lineWidth = 4; g.stroke();
  const body = g.createLinearGradient(0, -90, 0, 90);
  body.addColorStop(0, lerpColor([244, 190, 102], [226, 158, 74], tone));
  body.addColorStop(1, lerpColor([206, 128, 52], [172, 94, 34], tone));
  g.fillStyle = body; g.fill();
  g.save(); g.clip();
  // toasted rim inside
  g.strokeStyle = 'rgba(140,70,20,0.38)'; g.lineWidth = 16; fishSilhouette(g); g.stroke();
  // highlight on the upper body
  g.fillStyle = 'rgba(255,226,160,0.40)'; g.beginPath(); g.ellipse(-24, -46, 96, 26, -0.08, 0, TAU); g.fill();
  // scales (embossed: dark arc + light arc above it)
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    const sx2 = -30 + c * 27 + (r % 2) * 13, sy2 = -36 + r * 27;
    g.lineWidth = 3.4;
    g.strokeStyle = 'rgba(255,230,170,0.55)'; g.beginPath(); g.arc(sx2, sy2 - 3, 13, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    g.strokeStyle = 'rgba(130,64,18,0.55)'; g.beginPath(); g.arc(sx2, sy2, 13, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  }
  // gill, tail ridges, fin ridges
  g.strokeStyle = 'rgba(130,64,18,0.6)'; g.lineWidth = 4.5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-62, -60); g.quadraticCurveTo(-92, 2, -62, 62); g.stroke();
  g.lineWidth = 3.5;
  for (const a of [-0.5, -0.17, 0.17, 0.5]) { g.beginPath(); g.moveTo(104, a * 18); g.lineTo(142, a * 110); g.stroke(); }
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-14 + i * 22, -84 + i * 4); g.lineTo(-6 + i * 22, -66 + i * 4); g.stroke(); }
  g.restore();
  // eye + mouth
  disc(g, -108, -24, 15, '#a0561f'); disc(g, -108, -24, 8, '#5a2a0c'); disc(g, -112, -28, 3.5, 'rgba(255,240,210,0.9)');
  g.strokeStyle = 'rgba(110,50,14,0.7)'; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-148, 12); g.quadraticCurveTo(-136, 18, -128, 10); g.stroke();
  g.restore();
  g.lineCap = 'butt'; g.lineJoin = 'miter';
}
/** one pastry broken in two: the halves drift apart and the red-bean filling shows in the gap */
function brokenFish(g, x, y, s, rot, tone, sx, sy, flip) {
  g.save();
  g.translate(x, y); g.rotate(rot); g.scale(s * flip, s);
  // filling first (it sits between the halves)
  g.fillStyle = '#5b1d1f';
  g.beginPath();
  g.moveTo(-26, -78); g.quadraticCurveTo(8, -84, 30, -70); g.quadraticCurveTo(44, -10, 34, 64);
  g.quadraticCurveTo(4, 80, -24, 70); g.quadraticCurveTo(-40, 0, -26, -78); g.fill();
  const br = rand(4401);
  for (let i = 0; i < 26; i++) disc(g, -22 + br() * 52, -66 + br() * 130, 3 + br() * 4, i % 3 ? 'rgba(130,48,46,0.9)' : 'rgba(40,10,12,0.8)');
  g.fillStyle = 'rgba(255,190,170,0.25)'; g.beginPath(); g.ellipse(2, -30, 10, 26, 0.2, 0, TAU); g.fill();
  for (const [side, dx, dr] of [[-1, -30, -0.07], [1, 32, 0.08]]) {
    g.save();
    g.translate(dx, 0); g.rotate(dr);
    g.beginPath();
    if (side < 0) { g.moveTo(-200, -140); g.lineTo(-6, -140); g.lineTo(6, -40); g.lineTo(-8, 30); g.lineTo(4, 140); g.lineTo(-200, 140); }
    else { g.moveTo(200, -140); g.lineTo(-6, -140); g.lineTo(6, -40); g.lineTo(-8, 30); g.lineTo(4, 140); g.lineTo(200, 140); }
    g.clip();
    fish(g, 0, 0, 1, 0, tone);
    g.restore();
  }
  g.restore();
}
function lerpColor(a, b, k) { return `rgb(${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(lerp(a[2], b[2], k))})`; }
function fishShadow(g, x, y, s, rot, off, a, flip = 1) {
  g.save();
  g.translate(x + off * 0.5, y + off); g.rotate(rot); g.scale(s * 1.03 * flip, s * 1.03);
  g.fillStyle = `rgba(10,6,6,${a})`;
  fishSilhouette(g); g.fill();
  g.restore();
}

function counter(g, t) {
  // fire glow behind the moulds
  const fire = g.createLinearGradient(0, 1250, 0, 1390);
  fire.addColorStop(0, 'rgba(255,120,40,0)'); fire.addColorStop(1, 'rgba(255,110,30,0.55)');
  g.fillStyle = fire; g.fillRect(220, 1250, 560, 140);
  // moulds (iron clamshells) with handles toward camera
  for (let i = 0; i < 4; i++) {
    const x = 246 + i * 132, y = 1268;
    const turn = i === 1 ? Math.sin(TAU * sstep(seg(t, 2.1, 2.9)) * 0.5) : 0;      // she turns one mould over
    g.fillStyle = '#2c282c'; rr(g, x, y - turn * 26, 116, 86 + turn * 10, 22); g.fill();
    g.strokeStyle = '#4c454a'; g.lineWidth = 4; rr(g, x + 6, y + 6 - turn * 26, 104, 70, 18); g.stroke();
    g.strokeStyle = 'rgba(255,170,90,0.25)'; g.lineWidth = 3;                        // fish emboss outline
    g.beginPath(); g.ellipse(x + 54, y + 42 - turn * 22, 34, 18, 0, 0, TAU); g.stroke();
    g.strokeStyle = '#3a3438'; g.lineWidth = 10;
    g.beginPath(); g.moveTo(x + 40, y + 84); g.lineTo(x + 34, y + 190); g.moveTo(x + 76, y + 84); g.lineTo(x + 82, y + 190); g.stroke();
    g.fillStyle = '#8a5432'; rr(g, x + 24, y + 176, 68, 34, 14); g.fill();
    g.fillStyle = 'rgba(255,210,160,0.2)'; rr(g, x + 30, y + 180, 56, 8, 4); g.fill();
  }
  // counter top + front panel
  g.fillStyle = '#9c6236'; g.fillRect(-60, 1380, 1200, 44);
  g.fillStyle = '#c08550'; g.fillRect(-60, 1380, 1200, 8);
  g.fillStyle = '#8f2c26'; g.fillRect(-60, 1424, 1200, 600);
  g.fillStyle = '#e9dcc0'; g.fillRect(-60, 1486, 1200, 26);
  g.fillStyle = 'rgba(0,0,0,0.18)';
  for (let x = 40; x < 1100; x += 210) g.fillRect(x, 1424, 5, 600);
  // glass case of finished pastries (left)
  const cx0 = 790;
  g.fillStyle = 'rgba(30,20,20,0.5)'; rr(g, cx0, 1226, 230, 158, 16); g.fill();
  fish(g, cx0 + 66, 1330, 0.32, 0.1, 0.4); fish(g, cx0 + 170, 1336, 0.32, -0.12, 0.6); fish(g, cx0 + 116, 1290, 0.3, 0.05, 0.3);
  g.fillStyle = 'rgba(190,225,255,0.13)'; rr(g, cx0, 1206, 230, 178, 16); g.fill();
  g.strokeStyle = 'rgba(220,240,255,0.4)'; g.lineWidth = 3; rr(g, cx0, 1206, 230, 178, 16); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.moveTo(cx0 + 22, 1222); g.lineTo(cx0 + 52, 1222); g.lineTo(cx0 + 22, 1290); g.closePath(); g.fill();
  // paper bags (left)
  for (let i = 0; i < 3; i++) {
    const x = 92 + i * 10, y = 1236 - i * 14;
    g.fillStyle = i % 2 ? '#c49a62' : '#d2aa70'; rr(g, x, y, 130, 150, 6); g.fill();
    g.fillStyle = 'rgba(80,50,20,0.25)'; g.fillRect(x, y + 18, 130, 4);
  }
}

function steam(g, list, t, rise, alpha) {
  for (const p of list) {
    const ph = fract(t * p.sp + p.ph);
    const y = p.y - ph * rise;
    const x = p.x + Math.sin(ph * 5 + p.w) * 34 + ph * 20;
    const r = (34 + ph * 110) * p.s;
    const a = alpha * Math.sin(Math.PI * ph);
    if (a <= 0.002) continue;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,248,240,${a})`);
    gr.addColorStop(1, 'rgba(255,248,240,0)');
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

// ------------------------------------------------------------------ shot B: the insert (pastries on the rack)
const RACK = [  // tray space: x, y, scale, rot, tone, flip (1 = head left), broken (shows the red-bean filling)
  [250, 520, 0.96, -0.22, 0.35, 1], [700, 450, 0.98, 2.95, 0.55, 1], [230, 890, 1.04, 0.1, 0.7, -1, true],
  [960, 760, 1.0, -0.14, 0.4, 1], [250, 1190, 1.08, -0.08, 0.5, -1], [770, 1150, 1.1, 0.26, 0.65, 1], [520, 1470, 1.12, 3.0, 0.45, 1],
];
const NEW = { x: 590, y: 820, s: 1.04, rot: -0.06 };   // where the fresh one is set down

export function drawB(g, t, S) {
  const k = clamp((t - CUT) / (10 - CUT));
  const punch = t > BEAT ? 0.012 * Math.exp(-(t - BEAT) * 7) * Math.cos((t - BEAT) * 22) : 0;
  const c = {
    cx: 540, cy: 900, s: 1.075 - 0.06 * sstep(k) + punch,
    ox: 2.6 * Math.sin(1.2 * t + 1.1) + 1.4 * Math.sin(2.9 * t + 0.3),
    oy: 2.2 * Math.sin(1.0 * t + 0.2) + 1.1 * Math.sin(3.3 * t + 1.4),
    rot: -0.004 + 0.002 * Math.sin(0.7 * t),
  };
  g.setTransform(1, 0, 0, 1, 0, 0);
  const bg = g.createLinearGradient(0, 0, 0, 600);
  bg.addColorStop(0, '#24181c'); bg.addColorStop(1, '#3a2620');
  g.fillStyle = bg; g.fillRect(0, 0, 1080, 1920);
  camera(g, c, 0.4);
  for (const b of S.bokehB) bokeh(g, b.x, b.y, b.rad, b.c, b.a * (0.75 + 0.25 * Math.sin(t * b.sp + b.ph)));

  camera(g, c, 1.0);
  g.translate(540, 1000); g.rotate(-0.07); g.translate(-540, -1000);
  // tray
  g.fillStyle = '#17110f'; rr(g, -120, 286, 1320, 1900, 40); g.fill();
  const tray = g.createLinearGradient(0, 300, 900, 1700);
  tray.addColorStop(0, '#3a2b25'); tray.addColorStop(1, '#221a18');
  g.fillStyle = tray; rr(g, -100, 304, 1280, 1880, 32); g.fill();
  g.strokeStyle = 'rgba(255,190,130,0.25)'; g.lineWidth = 4; rr(g, -100, 304, 1280, 1880, 32); g.stroke();
  // warm key light pool
  g.globalCompositeOperation = 'lighter';
  glow(g, 380, 700, 760, '255,150,70', 0.14);
  g.globalCompositeOperation = 'source-over';
  // wire rack: shadows first, then wires
  const wires = [];
  for (let y = 360; y < 1900; y += 44) wires.push(y);
  g.lineWidth = 5;
  g.strokeStyle = 'rgba(0,0,0,0.45)';
  g.beginPath(); for (const y of wires) { g.moveTo(-60, y + 9); g.lineTo(1160, y + 9); } g.stroke();
  g.strokeStyle = '#a9a39c';
  g.beginPath(); for (const y of wires) { g.moveTo(-60, y); g.lineTo(1160, y); } g.stroke();
  g.lineWidth = 9;
  g.strokeStyle = 'rgba(0,0,0,0.45)';
  g.beginPath(); for (const x of [120, 540, 960]) { g.moveTo(x + 8, 330); g.lineTo(x + 8, 1960); } g.stroke();
  g.strokeStyle = '#c9c3bb';
  g.beginPath(); for (const x of [120, 540, 960]) { g.moveTo(x, 330); g.lineTo(x, 1960); } g.stroke();

  // resting pastries
  for (const [x, y, s, r, tone, fl] of RACK) fishShadow(g, x, y, s, r, 14, 0.42, fl);
  for (const [x, y, s, r, tone, fl, broken] of RACK) (broken ? brokenFish : fish)(g, x, y, s, r, tone, 1, 1, fl);

  // the fresh one: held high by the tongs, lowered, released at BEAT - 0.1, lands at BEAT
  const lower = sstep(seg(t, 4.95, 5.54));
  const fall = seg(t, 5.56, BEAT);
  const hgt = t < 5.56 ? lerp(1, 0.28, lower) : 0.28 * (1 - fall * fall);
  const land = t >= BEAT ? seg(t, BEAT, BEAT + 0.32) : 0;
  const squash = t >= BEAT ? 1 - 0.07 * Math.sin(Math.PI * Math.min(1, land * 1.6)) * (1 - land) : 1;
  const fx = NEW.x + 40 * hgt, fy = NEW.y - 150 * hgt, fs = NEW.s * (1 + 0.1 * hgt);
  fishShadow(g, NEW.x + 20 * hgt, NEW.y, NEW.s, NEW.rot, 14 + 70 * hgt, 0.42 - 0.22 * hgt);
  fish(g, fx, fy, fs, NEW.rot - 0.06 * hgt, 0.5, 1 + (1 - squash) * 0.6, squash);

  // tongs: enter from the top right, open on release, leave
  const tin = outExpo(seg(t, CUT + 0.2, CUT + 1.0));
  const tout = sstep(seg(t, 5.84, 6.5));
  const open = sstep(seg(t, 5.52, 5.64));
  const tipX = fx + 70 + 520 * (1 - tin) + 500 * tout, tipY = fy - 40 - 600 * (1 - tin) - 700 * tout;
  tongs(g, tipX, tipY, open);

  // steam: over the rack, plus a puff when the fresh one lands
  steam(g, S.steamB.map((p) => {
    const f = p.fx < RACK.length ? RACK[p.fx] : RACK[0];
    return { x: f[0] + p.dx, y: f[1] - 30, ph: p.ph, sp: p.sp, w: p.w, s: p.s };
  }), t, 480, 0.12);
  if (t > BEAT) {      // the fresh one steams harder
    steam(g, S.steamB.slice(0, 10).map((p) => ({ x: NEW.x + p.dx * 0.8, y: NEW.y - 40, ph: p.ph, sp: p.sp * 1.3, w: p.w, s: p.s })), t, 420, 0.2 * sstep(seg(t, BEAT, BEAT + 0.5)));
  }
  if (t > BEAT - 0.02) {
    const q = seg(t, BEAT, BEAT + 0.9);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI * (0.1 + 0.8 * (i / 8));
      const d = 40 + 160 * outExpo(q);
      const x = NEW.x + Math.cos(a) * d * 1.3, y = NEW.y - 20 + Math.sin(a) * d * 0.8 - q * 60;
      const r = 50 + 70 * q;
      const al = 0.3 * (1 - q);
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(255,248,240,${al})`); gr.addColorStop(1, 'rgba(255,248,240,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  camera(g, c, 1.35);
  snow(g, S.nearSnow.slice(0, 12), t, 0.22);
  g.setTransform(1, 0, 0, 1, 0, 0);
}

function tongs(g, x, y, open) {
  // two arms from a hinge far up-right; tips pinch the pastry
  const hx = x + 560, hy = y - 520;
  const spread = 0.05 + 0.1 * open;
  const ang = Math.atan2(y - hy, x - hx), len = Math.hypot(x - hx, y - hy);
  g.lineCap = 'round';
  for (const s of [-1, 1]) {
    const a = ang + s * spread;
    const ex = hx + Math.cos(a) * len, ey = hy + Math.sin(a) * len;
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 24;
    g.beginPath(); g.moveTo(hx + 16, hy + 40); g.lineTo(ex + 16, ey + 40); g.stroke();
    g.strokeStyle = '#8f949b'; g.lineWidth = 22;
    g.beginPath(); g.moveTo(hx, hy); g.lineTo(ex, ey); g.stroke();
    g.strokeStyle = '#d9dce0'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(hx - 4, hy - 6); g.lineTo(ex - 4, ey - 6); g.stroke();
    // scalloped tip
    g.fillStyle = '#b9bdc3';
    g.beginPath(); g.ellipse(ex, ey, 26, 16, a, 0, TAU); g.fill();
  }
  g.lineCap = 'butt';
}
