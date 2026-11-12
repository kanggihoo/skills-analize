/*
 * art.js — flat vector art for the seal scene, drawn with Canvas 2D.
 *   bakeDesk()      felt mat + hanji form + props, baked once at BS× into one bitmap (setup)
 *   bakePrint()     a seal impression with ink coverage set by pressure (setup)
 *   drawSeal()      the boxwood seal (cylinder, gold band, inked face, knob), ink outline — every frame
 *   drawWord()      comic sound word with a double outline; starburst() the jagged backing
 * Palette: ink #1d1a17 · hanji #f1e6cb · felt #1f2436 · vermilion #d4402a (the one accent) · gold #e2a73a.
 */
import { rand } from '../_lib/stage.js';
import { TAU } from './kit.js';

export const C = {
  ink: '#1d1a17', inkSoft: '#5c5246', hanji: '#f4e9d0', cream: '#fbf4e2', felt: '#1f2436',
  verm: '#d4402a', vermHi: '#ff6a47', vermInk: '#c3321b', gold: '#e2a73a', line: '#b4533b',
};
export const FONT = { kr: '"Pretendard Variable"', serif: '"Hahmlet Variable"', sfx: '"Black Han Sans"' };

// ---------------------------------------------------------------- value noise (seeded, smooth)
function valueNoise(seed) {
  const r = rand(seed), P = new Uint16Array(512), V = new Float32Array(256);
  for (let i = 0; i < 256; i++) { P[i] = i; V[i] = r(); }
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const s = P[i]; P[i] = P[j]; P[j] = s; }
  for (let i = 0; i < 256; i++) P[i + 256] = P[i];
  const f = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const a = V[P[P[X] + Y]], b = V[P[P[X + 1] + Y]], c = V[P[P[X] + Y + 1]], d = V[P[P[X + 1] + Y + 1]];
    const u = f(xf), v = f(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}
function fbm(n, x, y, oct = 4) {
  let s = 0, amp = 1, tot = 0, fx = x, fy = y;
  for (let o = 0; o < oct; o++) { s += amp * n(fx, fy); tot += amp; amp *= 0.5; fx *= 2.03; fy *= 2.03; }
  return s / tot;
}

function canvas(w, h, cpu = false) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d', cpu ? { willReadFrequently: true } : undefined) };
}

/** soft round sprite (radial falloff), white — tinted by drawing with globalAlpha / composite */
export function softDisc(size = 128, stops = [[0, 1], [0.55, 0.55], [1, 0]], rgb = '255,255,255') {
  const { c, g } = canvas(size, size);
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, a] of stops) gr.addColorStop(o, `rgba(${rgb},${a})`);
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  return c;
}

// ---------------------------------------------------------------- the desk (baked)
export const PAPER = { x0: 110, y0: 470, x1: 970, y1: 1500 };
export const TABLE = { x0: 165, x1: 915, yh: 815, y0: 875, y1: 1125, cols: [290, 540, 790] };

/** deckled hanji outline: points along the rectangle with smooth + fine jitter */
function deckle(seed) {
  const r = rand(seed), n = valueNoise(seed + 1), pts = [];
  const { x0, y0, x1, y1 } = PAPER;
  const edge = (ax, ay, bx, by, nx, ny, off) => {
    const L = Math.hypot(bx - ax, by - ay), steps = Math.ceil(L / 9);
    for (let i = 0; i < steps; i++) {
      const k = i / steps, j = (n(off + k * L / 60, 3.7) - 0.5) * 7 + (r() - 0.5) * 2.4;
      pts.push([ax + (bx - ax) * k + nx * j, ay + (by - ay) * k + ny * j]);
    }
  };
  edge(x0, y0, x1, y0, 0, -1, 0); edge(x1, y0, x1, y1, 1, 0, 40); edge(x1, y1, x0, y1, 0, 1, 80); edge(x0, y1, x0, y0, -1, 0, 120);
  return pts;
}
const polyPath = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); };

/**
 * Bake the felt, the paper (fibres, grain, printed form) and two props into one bitmap.
 * Covers world rect (X0, Y0, BW, BH) at BS pixels per world px.
 */
export function bakeDesk({ X0, Y0, BW, BH, BS }) {
  const W = Math.round(BW * BS), H = Math.round(BH * BS);
  const { c, g } = canvas(W, H, true);
  g.setTransform(BS, 0, 0, BS, -X0 * BS, -Y0 * BS);

  // felt: base, grain, a warm pool of lamp light from the upper left, darker edges
  g.fillStyle = C.felt; g.fillRect(X0, Y0, BW, BH);
  const pool = g.createRadialGradient(260, 260, 40, 260, 260, 1500);
  pool.addColorStop(0, 'rgba(255,196,130,0.22)'); pool.addColorStop(0.45, 'rgba(255,170,110,0.08)'); pool.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = pool; g.fillRect(X0, Y0, BW, BH);
  const r = rand(8901);
  g.lineCap = 'round';
  for (let i = 0; i < 2600; i++) {       // felt hairs
    const x = X0 + r() * BW, y = Y0 + r() * BH, a = r() * TAU, l = 3 + r() * 9;
    g.strokeStyle = r() < 0.5 ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.12)';
    g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }

  // paper: soft cast shadow, then the sheet
  const pts = deckle(4471);
  g.save();
  g.filter = `blur(${Math.round(22 * BS)}px)`;
  g.translate(12, 20); g.fillStyle = 'rgba(4,6,14,0.55)'; polyPath(g, pts); g.fill();
  g.restore();
  g.save();
  g.filter = `blur(${Math.round(4 * BS)}px)`;
  g.translate(3, 5); g.fillStyle = 'rgba(4,6,14,0.35)'; polyPath(g, pts); g.fill();
  g.restore();
  g.fillStyle = C.hanji; polyPath(g, pts); g.fill();

  g.save();
  polyPath(g, pts); g.clip();
  // light across the sheet: warmer, brighter toward the lamp
  const lg = g.createLinearGradient(PAPER.x0, PAPER.y0, PAPER.x1, PAPER.y1);
  lg.addColorStop(0, 'rgba(255,250,236,0.55)'); lg.addColorStop(0.5, 'rgba(255,250,236,0)'); lg.addColorStop(1, 'rgba(120,90,50,0.10)');
  g.fillStyle = lg; g.fillRect(PAPER.x0 - 20, PAPER.y0 - 20, PAPER.x1 - PAPER.x0 + 40, PAPER.y1 - PAPER.y0 + 40);
  // cloudy formation of the fibres (hanji is uneven), then the fibres themselves
  const nz = valueNoise(311);
  for (let i = 0; i < 140; i++) {
    const x = PAPER.x0 + r() * (PAPER.x1 - PAPER.x0), y = PAPER.y0 + r() * (PAPER.y1 - PAPER.y0);
    const rr = 30 + r() * 90, lite = nz(x / 120, y / 120) > 0.5;
    const gr = g.createRadialGradient(x, y, 0, x, y, rr);
    gr.addColorStop(0, lite ? 'rgba(255,253,244,0.14)' : 'rgba(196,170,126,0.04)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  for (let i = 0; i < 1100; i++) {
    const x = PAPER.x0 + r() * (PAPER.x1 - PAPER.x0), y = PAPER.y0 + r() * (PAPER.y1 - PAPER.y0);
    const a = r() * TAU, l = 8 + r() * 46, bend = (r() - 0.5) * l * 0.8, dark = r() < 0.28;
    g.strokeStyle = dark ? `rgba(130,100,60,${(0.05 + r() * 0.09).toFixed(3)})` : `rgba(255,255,250,${(0.2 + r() * 0.26).toFixed(3)})`;
    g.lineWidth = dark ? 0.5 + r() * 0.7 : 0.6 + r() * 1.1;
    const cx = Math.cos(a), cy = Math.sin(a);
    g.beginPath(); g.moveTo(x, y);
    g.quadraticCurveTo(x + cx * l / 2 - cy * bend, y + cy * l / 2 + cx * bend, x + cx * l, y + cy * l); g.stroke();
  }
  for (let i = 0; i < 70; i++) {     // bark specks
    const x = PAPER.x0 + r() * (PAPER.x1 - PAPER.x0), y = PAPER.y0 + r() * (PAPER.y1 - PAPER.y0), a = r() * TAU, l = 2 + r() * 7;
    g.strokeStyle = `rgba(80,60,35,${(0.25 + r() * 0.3).toFixed(3)})`; g.lineWidth = 0.7 + r() * 0.8;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l, y + Math.sin(a) * l + 2, x + Math.cos(a + 0.6) * l * 1.6, y + Math.sin(a + 0.6) * l * 1.6); g.stroke();
  }

  // the printed form: title, rules, a three-cell table (결재란) with (인) marks, two writing lines
  const ink = 'rgba(29,26,23,0.86)';
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillStyle = ink; g.font = `800 62px ${FONT.serif}`;
  g.fillText('한 박자 연습장', 540, 632);
  g.fillStyle = 'rgba(92,82,70,0.85)'; g.font = `600 27px ${FONT.kr}`;
  g.fillText('같은 도장으로 세 칸을 찍는다', 540, 684);
  g.strokeStyle = C.line; g.globalAlpha = 0.6;
  g.lineWidth = 3; g.beginPath(); g.moveTo(170, 730); g.lineTo(910, 730); g.stroke();
  g.lineWidth = 1.2; g.beginPath(); g.moveTo(170, 738); g.lineTo(910, 738); g.stroke();
  const T = TABLE;
  g.globalAlpha = 0.75; g.lineWidth = 3.5;
  g.strokeRect(T.x0, T.yh, T.x1 - T.x0, T.y1 - T.yh);
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(T.x0, T.y0); g.lineTo(T.x1, T.y0);
  for (let i = 1; i < 3; i++) { const x = T.x0 + (i * (T.x1 - T.x0)) / 3; g.moveTo(x, T.yh); g.lineTo(x, T.y1); }
  g.stroke();
  g.globalAlpha = 1;
  g.fillStyle = 'rgba(140,58,38,0.92)'; g.font = `700 32px ${FONT.serif}`;
  ['작게', '중간', '크게'].forEach((s, i) => g.fillText(s, T.cols[i], T.yh + 43));
  g.textAlign = 'left'; g.fillStyle = 'rgba(92,82,70,0.7)'; g.font = `600 28px ${FONT.serif}`;
  g.fillText('날짜', 172, 1318); g.fillText('이름', 172, 1408);
  g.strokeStyle = 'rgba(29,26,23,0.28)'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(240, 1322); g.lineTo(910, 1322); g.moveTo(240, 1412); g.lineTo(910, 1412); g.stroke();
  g.restore();

  // stray fibres on the deckled edge
  for (let i = 0; i < pts.length; i += 3) {
    if (r() < 0.55) continue;
    const [x, y] = pts[i], a = r() * TAU, l = 3 + r() * 9;
    g.strokeStyle = 'rgba(245,236,214,0.7)'; g.lineWidth = 0.7;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }

  // grain over the whole bake (felt and paper alike), at bake resolution
  const img = g.getImageData(0, 0, W, H), d = img.data;
  let s = 1234567;
  for (let i = 0; i < d.length; i += 4) {
    s = (s * 1103515245 + 12345) >>> 0;
    const k = ((s >>> 16) & 255) / 255 - 0.5;
    d[i] += k * 5; d[i + 1] += k * 5; d[i + 2] += k * 4.5;
  }
  g.putImageData(img, 0, 0);
  g.setTransform(BS, 0, 0, BS, -X0 * BS, -Y0 * BS);

  drawInkDish(g, 900, 372);
  drawBrush(g);
  return c;
}

/** a celadon dish of seal paste (인주), top-down, ink outline */
function drawInkDish(g, x, y) {
  g.save();
  g.translate(x, y);
  g.fillStyle = 'rgba(4,6,14,0.45)';
  g.filter = 'blur(10px)'; g.beginPath(); g.arc(10, 16, 88, 0, TAU); g.fill(); g.filter = 'none';
  g.fillStyle = '#c9dccf'; g.strokeStyle = C.ink; g.lineWidth = 5;
  g.beginPath(); g.arc(0, 0, 84, 0, TAU); g.fill(); g.stroke();
  const rim = g.createRadialGradient(-24, -30, 10, 0, 0, 84);
  rim.addColorStop(0, 'rgba(255,255,255,0.45)'); rim.addColorStop(1, 'rgba(60,90,80,0.25)');
  g.fillStyle = rim; g.beginPath(); g.arc(0, 0, 82, 0, TAU); g.fill();
  g.fillStyle = '#b8322a'; g.lineWidth = 3;
  g.beginPath(); g.arc(4, 4, 58, 0, TAU); g.fill(); g.stroke();
  const r = rand(77);
  for (let i = 0; i < 22; i++) {          // paste texture: soft ridges
    const a = r() * TAU, rr = r() * 48;
    g.fillStyle = r() < 0.5 ? 'rgba(255,140,110,0.22)' : 'rgba(110,20,14,0.22)';
    g.beginPath(); g.ellipse(4 + Math.cos(a) * rr, 4 + Math.sin(a) * rr, 6 + r() * 12, 3 + r() * 5, r() * TAU, 0, TAU); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,0.55)';
  g.beginPath(); g.ellipse(-20, -22, 16, 7, -0.6, 0, TAU); g.fill();
  g.restore();
}

/** a brush lying across the sheet's upper-left corner */
function drawBrush(g) {
  g.save();
  g.translate(120, 470); g.rotate(0.16);
  g.fillStyle = 'rgba(4,6,14,0.4)'; g.filter = 'blur(8px)';
  g.beginPath(); g.roundRect(-330, 12, 560, 30, 15); g.fill(); g.filter = 'none';
  g.strokeStyle = C.ink; g.lineWidth = 5; g.lineJoin = 'round';
  // bamboo handle with nodes
  g.fillStyle = '#c9a265';
  g.beginPath(); g.roundRect(-330, -13, 440, 26, 12); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,240,200,0.45)'; g.fillRect(-320, -8, 420, 5);
  g.strokeStyle = 'rgba(29,26,23,0.55)'; g.lineWidth = 3;
  [-240, -120, 0].forEach((x) => { g.beginPath(); g.moveTo(x, -12); g.lineTo(x, 12); g.stroke(); });
  // ferrule and hair tip
  g.strokeStyle = C.ink; g.lineWidth = 5;
  g.fillStyle = '#7a3b22'; g.beginPath(); g.roundRect(104, -16, 40, 32, 6); g.fill(); g.stroke();
  g.fillStyle = '#26211d';
  g.beginPath(); g.moveTo(144, -17); g.bezierCurveTo(200, -20, 236, -6, 262, 0); g.bezierCurveTo(236, 6, 200, 20, 144, 17); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.18)';
  g.beginPath(); g.ellipse(180, -6, 24, 4, -0.05, 0, TAU); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- seal impressions (baked)
/**
 * One impression: the seal face (a filled disc with a paper-coloured ring and the carved word cut out = 백문)
 * times an ink-coverage field. cov = smoothstep(P + (fbm − 0.5)·A), where P is the pressure under that point —
 * a light tap prints a speckled crescent, a full slam a solid disc with ink squeezed to the rim.
 *   kind: { pressure(nx, ny) → 0..1, amp, alpha, seed, squeeze }
 * Returned canvas is 2×: S px for 2·(R + pad) world px.
 */
export function bakePrint(R, word, { pressure, amp = 0.5, alpha = 1, seed = 1, squeeze = 0, satellites = 0 }) {
  const PAD = 26, S = 2, N = Math.round((R + PAD) * 2 * S), cx = N / 2;
  const { c, g } = canvas(N, N, true);
  const nEdge = valueNoise(seed + 7);
  // face mask: slightly irregular disc
  g.fillStyle = '#000';
  g.beginPath();
  for (let i = 0; i <= 180; i++) {
    const a = (i / 180) * TAU, rr = (R + (nEdge(Math.cos(a) * 3 + 5, Math.sin(a) * 3 + 5) - 0.5) * 3.2) * S;
    const x = cx + Math.cos(a) * rr, y = cx + Math.sin(a) * rr;
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.fill();
  g.globalCompositeOperation = 'destination-out';
  g.lineWidth = 4.5 * S; g.beginPath(); g.arc(cx, cx, (R - 13) * S, 0, TAU); g.stroke();
  g.font = `900 ${Math.round(74 * S)}px ${FONT.serif}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#000';
  g.save(); g.translate(cx, cx + 3 * S); g.scale(1, 1.08); g.fillText(word, 0, 0); g.restore();
  g.globalCompositeOperation = 'source-over';
  // satellites: ink squeezed out past the rim on a hard press
  const r = rand(seed + 3);
  for (let i = 0; i < satellites; i++) {
    const a = r() * TAU, rr = (R + 3 + Math.pow(r(), 1.6) * 16) * S, s = (0.8 + Math.pow(r(), 2.5) * 3.4) * S;
    g.beginPath(); g.ellipse(cx + Math.cos(a) * rr, cx + Math.sin(a) * rr, s * 1.3, s, a, 0, TAU); g.fill();
  }

  const img = g.getImageData(0, 0, N, N), d = img.data;
  const n1 = valueNoise(seed), n2 = valueNoise(seed + 1);
  const light = [232, 104, 78], dark = [176, 34, 18];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 4, m = d[i + 3] / 255;
      if (m <= 0) continue;
      const nx = (x - cx) / (R * S), ny = (y - cx) / (R * S), rad = Math.hypot(nx, ny);
      const P = pressure(nx, ny);
      const big = fbm(n1, x / (26 * S), y / (26 * S), 4), fine = n2(x / (2.2 * S), y / (2.2 * S));
      const v = P + (big - 0.5) * amp + (fine - 0.5) * 0.28;
      let cov = Math.min(1, Math.max(0, (v - 0.5) / 0.09));
      cov = cov * cov * (3 - 2 * cov);
      // density: darker where pressed harder and toward the rim (squeezed ink)
      const dens = Math.min(1, Math.max(0, 0.35 + 0.45 * P + squeeze * Math.max(0, rad - 0.82) * 4 + (big - 0.5) * 0.5));
      d[i] = light[0] + (dark[0] - light[0]) * dens;
      d[i + 1] = light[1] + (dark[1] - light[1]) * dens;
      d[i + 2] = light[2] + (dark[2] - light[2]) * dens;
      d[i + 3] = 255 * m * cov * alpha * (0.82 + 0.18 * dens);
    }
  }
  g.putImageData(img, 0, 0);
  return { c, N, world: N / S };
}

// ---------------------------------------------------------------- the seal (live, vector)
/**
 * Boxwood seal in a 3/4 view on a top-down sheet (the flat-illustration cheat): the base point (0, 0) is the
 * lowest point of the face; the body rises in −y. Draw after translate(base) · rotate(tilt) · scale(squash·persp).
 */
export function drawSeal(g, R, { inkW = 5, inked = 1 } = {}) {
  const ry = 0.3 * R, yb = -ry, yt = yb - 2.3 * R;
  g.lineJoin = 'round'; g.lineCap = 'round';
  // body silhouette
  const body = () => {
    g.beginPath();
    g.moveTo(-R, yt);
    g.ellipse(0, yt, R, ry, 0, Math.PI, TAU);
    g.lineTo(R, yb);
    g.ellipse(0, yb, R, ry, 0, 0, Math.PI);
    g.closePath();
  };
  const wood = g.createLinearGradient(-R, 0, R, 0);
  wood.addColorStop(0, '#a5642e'); wood.addColorStop(0.2, '#e6ad68'); wood.addColorStop(0.5, '#cc8c4c');
  wood.addColorStop(0.82, '#a1612f'); wood.addColorStop(1, '#84481f');
  body(); g.fillStyle = wood; g.fill();
  g.save(); body(); g.clip();
  // grain lines
  g.strokeStyle = 'rgba(110,60,24,0.22)'; g.lineWidth = 1.6;
  for (const [x, w] of [[-0.75, 0.05], [-0.3, -0.04], [0.15, 0.06], [0.55, -0.03], [0.82, 0.04]]) {
    g.beginPath(); g.moveTo(x * R, yt); g.bezierCurveTo((x + w) * R, yt + R, (x - w) * R, yb - R, x * R, yb + ry); g.stroke();
  }
  // specular streak
  g.fillStyle = 'rgba(255,238,210,0.42)';
  g.beginPath(); g.roundRect(-0.64 * R, yt + 0.62 * R, 0.13 * R, 1.75 * R, 0.06 * R); g.fill();
  // gold band (front arcs)
  const b1 = yt + 0.32 * R, b2 = yt + 0.56 * R;
  g.beginPath(); g.moveTo(-R, b1); g.ellipse(0, b1, R, ry, 0, Math.PI, 0, true); g.lineTo(R, b2); g.ellipse(0, b2, R, ry, 0, 0, Math.PI); g.closePath();
  const gold = g.createLinearGradient(-R, 0, R, 0);
  gold.addColorStop(0, '#b9852a'); gold.addColorStop(0.22, '#ffd77a'); gold.addColorStop(0.55, '#e2a73a'); gold.addColorStop(1, '#9a6a1c');
  g.fillStyle = gold; g.fill();
  g.strokeStyle = 'rgba(29,26,23,0.7)'; g.lineWidth = inkW * 0.5; g.stroke();
  // inked face: the vermilion lip at the bottom
  if (inked > 0) {
    const f1 = yb - 0.13 * R;
    g.beginPath(); g.moveTo(-R, f1); g.ellipse(0, f1, R, ry, 0, Math.PI, 0, true); g.lineTo(R, yb); g.ellipse(0, yb, R, ry, 0, 0, Math.PI); g.closePath();
    g.fillStyle = C.vermInk; g.globalAlpha = inked; g.fill(); g.globalAlpha = 1;
  }
  g.restore();
  body(); g.strokeStyle = C.ink; g.lineWidth = inkW; g.stroke();
  // top face with a lit front rim
  g.beginPath(); g.ellipse(0, yt, R, ry, 0, 0, TAU);
  g.fillStyle = '#e9b674'; g.fill();
  g.beginPath(); g.ellipse(0, yt, R * 0.9, ry * 0.78, 0, 0.15, Math.PI - 0.15); g.strokeStyle = 'rgba(255,236,200,0.6)'; g.lineWidth = inkW * 0.6; g.stroke();
  g.beginPath(); g.ellipse(0, yt, R, ry, 0, 0, TAU); g.strokeStyle = C.ink; g.lineWidth = inkW; g.stroke();
  // knob: collar, waisted neck, ball, finial
  g.beginPath(); g.ellipse(0, yt + 0.01 * R, 0.44 * R, 0.13 * R, 0, 0, TAU); g.fillStyle = '#c98a4b'; g.fill(); g.stroke();
  const by = yt - 0.66 * R, br = 0.44 * R, nw = 0.25 * R;
  const neck = g.createLinearGradient(-nw, 0, nw, 0);
  neck.addColorStop(0, '#a5642e'); neck.addColorStop(0.3, '#e0a764'); neck.addColorStop(1, '#8c4f24');
  g.beginPath(); g.moveTo(-nw, yt); g.quadraticCurveTo(-nw * 0.55, yt - 0.2 * R, -nw * 0.75, by + br * 0.6);
  g.lineTo(nw * 0.75, by + br * 0.6); g.quadraticCurveTo(nw * 0.55, yt - 0.2 * R, nw, yt);
  g.ellipse(0, yt, nw, 0.08 * R, 0, 0, Math.PI); g.closePath();
  g.fillStyle = neck; g.fill(); g.stroke();
  const ball = g.createRadialGradient(-0.18 * R, by - 0.2 * R, 0.04 * R, 0, by, br);
  ball.addColorStop(0, '#f2c486'); ball.addColorStop(0.55, '#c9894a'); ball.addColorStop(1, '#93552a');
  g.beginPath(); g.arc(0, by, br, 0, TAU); g.fillStyle = ball; g.fill(); g.stroke();
  g.beginPath(); g.ellipse(0, by + 0.02 * R, br, 0.13 * R, 0, 0, Math.PI); g.strokeStyle = 'rgba(29,26,23,0.35)'; g.lineWidth = inkW * 0.5; g.stroke();
  g.strokeStyle = C.ink; g.lineWidth = inkW;
  g.beginPath(); g.arc(0, by - br - 0.06 * R, 0.13 * R, 0, TAU); g.fillStyle = '#e2a73a'; g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,248,230,0.7)';
  g.beginPath(); g.ellipse(-0.17 * R, by - 0.2 * R, 0.1 * R, 0.06 * R, -0.6, 0, TAU); g.fill();
}

// ---------------------------------------------------------------- sound words
/** jagged comic starburst polygon (unit radius), jitter from rand(seed) */
export function starburst(seed, spikes = 16) {
  const r = rand(seed), pts = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * TAU + (r() - 0.5) * 0.08;
    const rr = i % 2 ? 0.6 + r() * 0.08 : 0.9 + r() * 0.18;
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  return pts;
}
export function drawBurstShape(g, pts, x, y, rad, rot, { fill = '#ffcf4a', ink = C.ink, inkW = 6 } = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px * rad, py * rad) : g.moveTo(px * rad, py * rad))); g.closePath();
  g.fillStyle = fill; g.fill();
  g.lineJoin = 'round'; g.lineWidth = inkW; g.strokeStyle = ink; g.stroke();
  g.restore();
}
/** outlined sound word: drop shadow, ink outer line, cream outline, fill (round joins: no miter spikes) */
export function drawWord(g, text, x, y, size, { rot = 0, scale = 1, alpha = 1, fill = C.verm, outline = C.cream, outW = 12, ink = C.ink, inkW = 5, shadow = 0.3 } = {}) {
  if (alpha <= 0.002 || scale <= 0.001) return;
  g.save();
  g.translate(x, y); g.rotate(rot); g.scale(scale, scale);
  g.globalAlpha = alpha;
  g.font = `${size}px ${FONT.sfx}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.miterLimit = 2;
  if (shadow > 0) {
    g.globalAlpha = alpha * shadow; g.fillStyle = ink; g.strokeStyle = ink;
    g.lineWidth = (outW + inkW) * 2; g.strokeText(text, 0, size * 0.07); g.fillText(text, 0, size * 0.07);
    g.globalAlpha = alpha;
  }
  if (inkW > 0) { g.strokeStyle = ink; g.lineWidth = (outW + inkW) * 2; g.strokeText(text, 0, 0); }
  g.strokeStyle = outline; g.lineWidth = outW * 2; g.strokeText(text, 0, 0);
  g.fillStyle = fill; g.fillText(text, 0, 0);
  g.restore();
}
