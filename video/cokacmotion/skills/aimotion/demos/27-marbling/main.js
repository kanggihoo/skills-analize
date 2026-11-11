/*
 * 27 · 물 위의 마블링 — mathematical marbling (Lu, Jaffer et al. 2012), Canvas 2D.
 *
 * Ink films are polygons; drops, stylus strokes, a circular stir and a comb are closed-form maps of the plane
 * applied to their vertices (ops.js). setup() applies the whole sequence once and keeps the films after every
 * finished operation (checkpoints). frame(t) takes the checkpoint before t and applies only the operation in
 * progress, at its partial progress — so any t is drawn from scratch in a few ms, and no state carries over.
 * The paper (laid, wetted, turned over) is baked in setup from the final films: the print is the bath's
 * mirror image, multiplied into a laid-paper texture.
 */
import { defineDemo, rand, track, ease, clamp } from '../_lib/stage.js';
import { applyOp } from './ops.js';

const D = 10;
const SHEET = { x: 50, y: 90, w: 980, h: 1510 };
const RIM_Y = 1650;

// earth pigments of Turkish ebru: indigo, yellow ochre, madder, and a chalk white that opens rings
const PAL = { I: [31, 55, 96], O: [207, 155, 62], R: [166, 53, 47], W: [239, 230, 209] };
const BATH = [190, 194, 183];

// ---------------------------------------------------------------- the score: 24 drops, a stir, 3 strokes, a comb
function buildOps(W, H) {
  const rnd = rand(27);
  // first the ground: one big pour of indigo floods the whole bath; the stones dropped into it later squeeze
  // it into the dark veins between them (battal ebru)
  const sites = [
    { c: [290, 360], seq: 'OWR' }, { c: [800, 400], seq: 'RWI' }, { c: [520, 860], seq: 'WRO' },
    { c: [260, 1330], seq: 'RWO' }, { c: [790, 1290], seq: 'OIW' },
    { c: [70, 850], seq: 'WO', small: true }, { c: [1010, 860], seq: 'OR', small: true },
    { c: [560, 105], seq: 'WR', small: true }, { c: [520, 1610], seq: 'OW', small: true },
  ];
  const ops = [];
  ops.push({ type: 'drop', t0: 0.3, t1: 0.85, c: [540, 880], r: 1050, col: 'I' });
  let t = 0.9;
  const DT = 0.108;
  for (let layer = 0; layer < 3; layer++) {
    const order = sites.map((s, i) => [rnd(), i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    for (const i of order) {
      const s = sites[i];
      if (layer >= s.seq.length) continue;
      const r = (s.small ? [150, 100] : [232, 172, 120])[layer];
      const j = layer ? 30 : 0;       // later drops land a little off the first one: eccentric rings
      ops.push({ type: 'drop', t0: t, t1: t + DT, c: [s.c[0] + (rnd() - 0.5) * j, s.c[1] + (rnd() - 0.5) * j], r, col: s.seq[layer] });
      t += DT;
    }
  }
  // the stylus stirs one circle between three of the stones …
  ops.push({ type: 'vortex', t0: 3.5, t1: 3.98, c: [400, 640], R: 170, z: 420, L: 55 });
  // … draws three strokes back and forth (gel-git) …
  [[600, 1], [1080, -1], [1480, 1]].forEach(([y, dir], i) =>
    ops.push({ type: 'tine', t0: 4.02 + i * 0.39, t1: 4.41 + i * 0.39, B: [0, y], u: [dir, 0], z: 170, L: 24, S: Infinity }));
  // … and a fine comb is pulled down through everything
  ops.push({ type: 'tine', t0: 5.22, t1: 6.2, B: [20, 0], u: [0, 1], z: 115, L: 9, S: 40, comb: true });
  // where a moving tip starts and ends: far enough that nothing visible jumps (see ops.js)
  for (const o of ops) if (o.type === 'tine') {
    const ss = [[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => (x - o.B[0]) * o.u[0] + (y - o.B[1]) * o.u[1]);
    o.sStart = Math.min(...ss) - o.z - 12;
    o.sEnd = Math.max(...ss) + 2 * o.z + 12;
  }
  return ops;
}
const progress = (op, p) => op.type === 'drop' ? 1 - Math.pow(1 - p, 3)        // spreads fast, then slows
  : op.type === 'tine' ? 0.5 - 0.5 * Math.cos(Math.PI * p) : ease.inOutCubic(p);

// ---------------------------------------------------------------- textures, baked once
function cnv(w, h, attrs) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d', attrs)]; }
function hash(x, y, s) { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s, 2246822519); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, y, s) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, s), b = hash(i + 1, j, s), c = hash(i, j + 1, s), d = hash(i + 1, j + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
/** laid paper: pulp mottling, fibres, laid lines and chain lines (front), or a plainer back */
function paperTex(w, h, base, seed, laid) {
  const [c, x] = cnv(w, h);
  const img = x.createImageData(w, h), d = img.data;
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    let v = 0.55 * vnoise(px / 70, py / 70, seed) + 0.3 * vnoise(px / 11, py / 11, seed + 1) + 0.15 * vnoise(px / 2.5, py / 2.5, seed + 2);
    v = (v - 0.5) * 0.07;
    if (laid) {
      v += 0.010 * Math.sin(py * 1.45 + 0.8 * vnoise(px / 40, py / 40, seed + 3));
      const cx = ((px + 3 * Math.sin(py * 0.004)) % 104 + 104) % 104 - 52;
      v -= 0.016 * Math.exp(-cx * cx / 6);
    }
    const k = (py * w + px) * 4;
    d[k] = base[0] * (1 + v); d[k + 1] = base[1] * (1 + v); d[k + 2] = base[2] * (1 + v * 1.2); d[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  const rnd = rand(seed);
  x.lineCap = 'round';
  for (let i = 0; i < w * h / 2600; i++) {     // fibres: short, faint, curved
    const fx = rnd() * w, fy = rnd() * h, a = rnd() * Math.PI * 2, l = 4 + rnd() * 14;
    x.strokeStyle = rnd() < 0.85 ? `rgba(120,96,66,${0.05 + rnd() * 0.08})` : `rgba(255,255,250,${0.2 + rnd() * 0.2})`;
    x.lineWidth = 0.6 + rnd() * 0.5;
    x.beginPath(); x.moveTo(fx, fy);
    x.quadraticCurveTo(fx + Math.cos(a + 0.6) * l * 0.5, fy + Math.sin(a + 0.6) * l * 0.5, fx + Math.cos(a) * l, fy + Math.sin(a) * l);
    x.stroke();
  }
  return c;
}
/** each pigment as a pattern with a faint granulation, so a film is not a flat vector fill */
function pigment(rgb, seed) {
  const S = 256, [c, x] = cnv(S, S);
  const img = x.createImageData(S, S), d = img.data;
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
    // tileable: noise on a torus via wrapped lattice (period 32 and 8 cells)
    const g = (p, q, n, s) => { const f = (a, b) => hash(((a % n) + n) % n, ((b % n) + n) % n, s);
      const i = Math.floor(p), j = Math.floor(q), u = p - i, v = q - j, su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
      const a = f(i, j), b = f(i + 1, j), cc = f(i, j + 1), dd = f(i + 1, j + 1);
      return a + (b - a) * su + (cc - a) * sv + (a - b - cc + dd) * su * sv; };
    const v = 0.6 * g(px / 8, py / 8, 32, seed) + 0.4 * g(px / 2, py / 2, 128, seed + 5) - 0.5;
    const k = (py * S + px) * 4;
    d[k] = rgb[0] * (1 + v * 0.08); d[k + 1] = rgb[1] * (1 + v * 0.08); d[k + 2] = rgb[2] * (1 + v * 0.08); d[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return c;
}

function filmPath(x, f, W, H) {
  const p = f.pts;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < p.length; i += 2) { const a = p[i], b = p[i + 1]; if (a < x0) x0 = a; if (a > x1) x1 = a; if (b < y0) y0 = b; if (b > y1) y1 = b; }
  if (x1 < 0 || y1 < 0 || x0 > W || y0 > H) return false;     // wholly off-stage
  x.beginPath();
  x.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]);
  return true;     // no closePath: fill() closes the polygon
}
function drawFilms(x, films, fills, W, H) {
  for (const f of films) if (filmPath(x, f, W, H)) { x.fillStyle = fills[f.col]; x.fill(); }
}
const rgb = (c, k = 1) => `rgb(${Math.round(c[0] * k)},${Math.round(c[1] * k)},${Math.round(c[2] * k)})`;

// ---------------------------------------------------------------- the story after the comb
const fadeIn = track([[0, 0], [0.3, 1, ease.outCubic]]);
const slideT = track([[6.25, 0], [6.6, 1, ease.outCubic]]);
const wetT = track([[6.6, 0], [7.0, 1, ease.inOutCubic]]);
const flipT = track([[7.05, 0], [7.9, 1, ease.inOutCubic]]);
const sweepT = track([[7.9, 0], [9.8, 1, ease.inOutCubic]]);

defineDemo({
  id: '27-marbling',
  title: '물 위의 마블링',
  tech: '수학적 마블링 · 잉크 방울과 빗질의 닫힌식 변형 (Jaffer·Lu)',
  duration: D,
  background: '#000',
  async setup({ canvas, W, H, headless }) {
    const { ctx } = canvas({ type: '2d', attrs: headless ? { willReadFrequently: true } : undefined });
    this.ctx = ctx; this.W = W; this.H = H;
    const ops = buildOps(W, H);
    this.ops = ops;
    // checkpoints: the films after every finished operation
    const cps = [[]];
    for (const op of ops) cps.push(applyOp(cps[cps.length - 1], op, 1));
    this.cps = cps;
    const final = cps[cps.length - 1];

    this.fills = {};
    Object.entries(PAL).forEach(([k, c], i) => { this.fills[k] = ctx.createPattern(pigment(c, 40 + i), 'repeat'); });

    // the bath: milky size, a window's reflection, a vignette; the tray's walnut rim at the bottom
    const [bath, bx] = cnv(W, H);
    bx.drawImage(paperTex(W, H, BATH, 91, false), 0, 0);
    this.bath = bath;
    const [sheen, sx] = cnv(W, H);
    let g = sx.createRadialGradient(260, 260, 0, 260, 260, 900);
    g.addColorStop(0, 'rgba(255,255,255,0.20)'); g.addColorStop(0.5, 'rgba(255,255,255,0.06)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    sx.fillStyle = g; sx.fillRect(0, 0, W, H);
    g = sx.createLinearGradient(0, 0, W, H * 0.6);
    g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(0.52, 'rgba(255,255,255,0.07)'); g.addColorStop(0.6, 'rgba(255,255,255,0)');
    sx.fillStyle = g; sx.fillRect(0, 0, W, H);
    this.sheen = sheen;
    const [vig, vx] = cnv(W, H);
    g = vx.createRadialGradient(W * 0.5, H * 0.45, 300, W * 0.5, H * 0.45, 1250);
    g.addColorStop(0, '#fff'); g.addColorStop(1, '#8d8a84');
    vx.fillStyle = g; vx.fillRect(0, 0, W, H);
    this.vig = vig;
    const [rim, rx] = cnv(W, H - RIM_Y + 12);
    g = rx.createLinearGradient(0, 0, 0, 12);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
    rx.fillStyle = g; rx.fillRect(0, 0, W, 12);
    rx.drawImage(paperTex(W, H - RIM_Y, [58, 38, 26], 77, false), 0, 12);
    rx.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 70; i++) {      // grain
      rx.strokeStyle = `rgba(30,18,10,${0.15 + 0.25 * hash(i, 3, 5)})`; rx.lineWidth = 1 + 3 * hash(i, 4, 5);
      const y0 = 12 + hash(i, 1, 5) * (H - RIM_Y); rx.beginPath(); rx.moveTo(0, y0);
      for (let xx = 0; xx <= W; xx += 40) rx.lineTo(xx, y0 + 6 * Math.sin(xx * 0.006 + i) + 3 * Math.sin(xx * 0.021 + i * 2));
      rx.stroke();
    }
    rx.globalCompositeOperation = 'source-over';
    rx.fillStyle = 'rgba(255,236,210,0.22)'; rx.fillRect(0, 12, W, 2);
    g = rx.createLinearGradient(0, 14, 0, 60); g.addColorStop(0, 'rgba(255,230,200,0.10)'); g.addColorStop(1, 'rgba(255,230,200,0)');
    rx.fillStyle = g; rx.fillRect(0, 14, W, 46);
    this.rim = rim;

    // sprites: the steel tip of a stylus/comb pin (with its shadow and a ring of meniscus), falling drops
    const [pin, px] = cnv(40, 40);
    px.fillStyle = 'rgba(0,0,0,0.28)'; px.beginPath(); px.arc(24, 26, 7, 0, 7); px.fill();
    px.strokeStyle = 'rgba(255,255,255,0.35)'; px.lineWidth = 1.5; px.beginPath(); px.arc(20, 20, 9, 0, 7); px.stroke();
    g = px.createRadialGradient(18, 18, 0.5, 20, 20, 5.5);
    g.addColorStop(0, '#f4f6f8'); g.addColorStop(0.4, '#8b9097'); g.addColorStop(1, '#2a2d31');
    px.fillStyle = g; px.beginPath(); px.arc(20, 20, 5, 0, 7); px.fill();
    this.pin = pin;
    this.drops = {};
    for (const [k, c] of Object.entries(PAL)) {
      const [dc, dx] = cnv(40, 40);
      g = dx.createRadialGradient(16, 15, 1, 20, 20, 11);
      g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.25, rgb(c, 1.15)); g.addColorStop(1, rgb(c, 0.7));
      dx.fillStyle = g; dx.beginPath(); dx.arc(20, 20, 10, 0, 7); dx.fill();
      this.drops[k] = dc;
    }

    // the finished bath (static after the comb), and the bath after the paper has lifted the ink under it
    const [bfin, fx] = cnv(W, H);
    fx.drawImage(bath, 0, 0); drawFilms(fx, final, this.fills, W, H);
    this.bathFinal = bfin;
    const [ghost, gx] = cnv(W, H);
    gx.drawImage(bfin, 0, 0);
    gx.save(); gx.beginPath(); gx.rect(SHEET.x, SHEET.y, SHEET.w, SHEET.h); gx.clip();
    gx.drawImage(bath, 0, 0); gx.globalAlpha = 0.13; drawFilms(gx, final, this.fills, W, H);
    gx.restore();
    this.ghost = ghost;

    // the sheet. Back: plain, then damp with the colours showing through. Front: the print = mirror image.
    const inkLayer = (mirror, blur) => {
      const [k, kx] = cnv(SHEET.w, SHEET.h);
      if (blur) kx.filter = `blur(${blur}px)`;
      if (mirror) kx.setTransform(1, 0, 0, -1, -SHEET.x, SHEET.y + SHEET.h);     // flipped over its horizontal axis
      else kx.setTransform(1, 0, 0, 1, -SHEET.x, -SHEET.y);
      const flat = {}; for (const [n, c] of Object.entries(PAL)) flat[n] = rgb(c, n === 'W' ? 1.04 : 1.0);
      drawFilms(kx, final, flat, W + 200, H + 200);
      return k;
    };
    const back = paperTex(SHEET.w, SHEET.h, [232, 226, 212], 13, false);
    this.back = back;
    const [wet, wx] = cnv(SHEET.w, SHEET.h);
    wx.drawImage(back, 0, 0);
    wx.globalCompositeOperation = 'multiply';
    wx.globalAlpha = 0.22; wx.drawImage(inkLayer(false, 3), 0, 0);
    wx.globalAlpha = 0.18; wx.fillStyle = '#b9b2a4'; wx.fillRect(0, 0, SHEET.w, SHEET.h);
    this.wet = wet;
    const [front, frx] = cnv(SHEET.w, SHEET.h);
    frx.drawImage(paperTex(SHEET.w, SHEET.h, [244, 236, 219], 5, true), 0, 0);
    frx.globalCompositeOperation = 'multiply';
    frx.drawImage(inkLayer(true, 0), 0, 0);
    frx.globalCompositeOperation = 'source-over';
    const rnd = rand(2727);
    for (let i = 0; i < 9; i++) {      // holidays: little spots where an air bubble kept the paper off the ink
      const hx = 40 + rnd() * (SHEET.w - 80), hy = 40 + rnd() * (SHEET.h - 80), hr = 1.5 + rnd() * 4;
      frx.fillStyle = 'rgba(244,236,219,0.92)';
      frx.beginPath();
      for (let a = 0; a < 12; a++) { const rr = hr * (0.7 + 0.5 * rnd()), an = a / 12 * Math.PI * 2; frx.lineTo(hx + rr * Math.cos(an), hy + rr * Math.sin(an)); }
      frx.fill();
    }
    g = frx.createLinearGradient(0, 0, 0, 26);       // a faint tide line where the sheet first touched the bath
    g.addColorStop(0, 'rgba(120,100,70,0.10)'); g.addColorStop(1, 'rgba(120,100,70,0)');
    frx.fillStyle = g; frx.fillRect(0, SHEET.h - 26, SHEET.w, 26);
    this.front = front;
    const [shadow, shx] = cnv(SHEET.w + 160, SHEET.h + 160);
    shx.filter = 'blur(18px)'; shx.fillStyle = 'rgba(0,0,0,0.55)'; shx.fillRect(80, 80, SHEET.w, SHEET.h);
    this.shadow = shadow;
  },

  /** the films at time t: the checkpoint before t, plus the operation in progress at its partial progress */
  films(t) {
    const { ops, cps } = this;
    let i = 0;
    while (i < ops.length && ops[i].t1 <= t) i++;
    if (i >= ops.length || t <= ops[i].t0) return cps[i];
    const op = ops[i];
    return applyOp(cps[i], op, progress(op, (t - op.t0) / (op.t1 - op.t0)));
  },

  frame(t) {
    const { ctx: x, W, H, ops } = this;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    const combEnd = ops[ops.length - 1].t1;
    if (t < combEnd) {
      x.drawImage(this.bath, 0, 0);
      drawFilms(x, this.films(t), this.fills, W, H);
      this.tools(t);
    } else if (flipT(t) <= 0) {
      x.drawImage(this.bathFinal, 0, 0);
    } else {
      x.drawImage(this.ghost, 0, 0);
    }
    x.globalCompositeOperation = 'screen'; x.drawImage(this.sheen, 0, 0);
    x.globalCompositeOperation = 'source-over';
    if (t >= combEnd) this.paper(t);
    x.globalCompositeOperation = 'multiply'; x.drawImage(this.vig, 0, 0);
    x.globalCompositeOperation = 'source-over';
    x.drawImage(this.rim, 0, RIM_Y - 12);
    const f = fadeIn(t);
    if (f < 1) { x.fillStyle = `rgba(0,0,0,${1 - f})`; x.fillRect(0, 0, W, H); }
  },

  /** what moves on the bath: falling drops, ripples, the stylus and the comb */
  tools(t) {
    const x = this.ctx;
    for (const op of this.ops) {
      if (op.type === 'drop') {
        const a = (t - op.t0) / 0.75;                        // the ripple a drop sends out, damped by the size
        if (a > 0 && a < 1) {
          const r = op.r * Math.sqrt(progress(op, clamp((t - op.t0) / (op.t1 - op.t0)))) + 14 + 380 * (t - op.t0);
          x.globalCompositeOperation = 'screen';
          x.strokeStyle = `rgba(255,255,255,${0.20 * (1 - a) * (1 - a)})`; x.lineWidth = 2.5;
          x.beginPath(); x.arc(op.c[0], op.c[1], r, 0, Math.PI * 2); x.stroke();
          x.globalCompositeOperation = 'multiply';
          x.strokeStyle = `rgba(150,150,150,${0.25 * (1 - a) * (1 - a)})`; x.lineWidth = 3;
          x.beginPath(); x.arc(op.c[0], op.c[1], r + 4, 0, Math.PI * 2); x.stroke();
          x.globalCompositeOperation = 'source-over';
        }
        const h = (op.t0 - t) / 0.16;                        // falling: the drop and its shadow converge
        if (h > 0 && h < 1) {
          x.globalAlpha = 0.3 * (1 - h);
          x.fillStyle = '#000'; x.beginPath(); x.arc(op.c[0] + 60 * h, op.c[1] + 80 * h, 7, 0, Math.PI * 2); x.fill();
          x.globalAlpha = 1;
          const s = 1 + 1.2 * h;
          x.drawImage(this.drops[op.col], op.c[0] - 30 * h - 20 * s, op.c[1] - 50 * h - 20 * s, 40 * s, 40 * s);
        }
      } else if (t > op.t0 && t < op.t1) {
        const k = progress(op, (t - op.t0) / (op.t1 - op.t0));
        if (op.type === 'vortex') {
          const an = -1.2 + op.z * k / op.R;
          x.drawImage(this.pin, op.c[0] + op.R * Math.cos(an) - 20, op.c[1] + op.R * Math.sin(an) - 20);
        } else {
          // the pins ride half a stroke-length behind the front of the moving ramp (ops.js), where the drag is
          const s = op.sStart + (op.sEnd - op.sStart) * k - 0.5 * op.z;
          const n = [-op.u[1], op.u[0]];
          const cx = op.B[0] + op.u[0] * s, cy = op.B[1] + op.u[1] * s;
          if (op.S === Infinity) x.drawImage(this.pin, cx - 20, cy - 20);
          else {
            x.globalAlpha = 0.16; x.fillStyle = '#000';                  // the comb's spine, out of focus above
            x.fillRect(-20, cy - op.u[1] * 40 - 9, this.W + 40, 18);
            x.globalAlpha = 1;
            for (let j = -40; j <= 40; j++) {
              const qx = cx + n[0] * j * op.S, qy = cy + n[1] * j * op.S;
              if (qx > -30 && qx < this.W + 30 && qy > -30 && qy < this.H + 30) x.drawImage(this.pin, qx - 20, qy - 20);
            }
          }
        }
      }
    }
    x.globalAlpha = 1;
  },

  /** the sheet: carried in, wetted from the top down, turned over to show the print */
  paper(t) {
    const x = this.ctx, S = SHEET;
    const sl = slideT(t), wt = wetT(t), fl = flipT(t);
    if (fl <= 0) {
      const oy = (1 - sl) * -1750;
      const hover = 1 - wt;                                  // lying flat once wet: the shadow tightens
      x.globalAlpha = 0.5 + 0.2 * hover;
      x.drawImage(this.shadow, S.x - 80 + 6 + 22 * hover, S.y - 80 + oy + 8 + 30 * hover);
      x.globalAlpha = 1;
      x.drawImage(this.back, S.x, S.y + oy);
      if (wt > 0) {                                           // the damp front runs down the sheet
        const yf = S.h * wt;
        x.save(); x.beginPath(); x.rect(S.x, S.y, S.w, yf); x.clip(); x.drawImage(this.wet, S.x, S.y); x.restore();
        const fe = Math.min(36, S.h - yf);
        if (fe > 0) {
          x.save(); x.beginPath(); x.rect(S.x, S.y + yf, S.w, fe); x.clip(); x.globalAlpha = 0.45;
          x.drawImage(this.wet, S.x, S.y); x.restore(); x.globalAlpha = 1;
        }
      }
      return;
    }
    // turned over about its horizontal axis: back while cos θ > 0, then the front (the mirror image of the bath)
    const th = Math.PI * fl, lift = Math.sin(th), cy = Math.cos(th);
    const sc = 1 + 0.07 * lift;
    x.save();
    x.globalAlpha = 0.5 - 0.25 * lift;
    x.translate(S.x + S.w / 2 + 6 + 50 * lift, S.y + S.h / 2 + 8 + 70 * lift);
    x.scale(sc, sc * Math.max(Math.abs(cy), 0.02));
    x.drawImage(this.shadow, -S.w / 2 - 80, -S.h / 2 - 80);
    x.restore();
    x.save();
    x.translate(S.x + S.w / 2, S.y + S.h / 2);
    x.scale(sc, sc * Math.abs(cy));
    if (Math.abs(cy) > 1e-3) {
      x.drawImage(cy > 0 ? this.wet : this.front, -S.w / 2, -S.h / 2);
      x.fillStyle = `rgba(30,24,16,${0.4 * lift})`;           // the face turning away from the light
      x.fillRect(-S.w / 2, -S.h / 2, S.w, S.h);
    }
    x.restore();
    const sw = sweepT(t);                                     // afterglow: a slow raking light over the paper
    if (sw > 0 && sw < 1) {
      const gx = -600 + 2300 * sw;
      const g = x.createLinearGradient(gx - 420, S.y, gx + 420, S.y + 900);
      g.addColorStop(0, 'rgba(255,248,230,0)'); g.addColorStop(0.5, 'rgba(255,248,230,0.13)'); g.addColorStop(1, 'rgba(255,248,230,0)');
      x.globalCompositeOperation = 'screen'; x.fillStyle = g; x.fillRect(S.x, S.y, S.w, S.h);
      x.globalCompositeOperation = 'source-over';
    }
  },
});
