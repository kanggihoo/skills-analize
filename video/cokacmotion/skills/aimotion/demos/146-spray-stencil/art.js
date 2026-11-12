/*
 * art.js — everything painted once in setup (Canvas 2D shapes + one per-pixel pass). Nothing here depends on t.
 *
 *   bakeWall(R)    rgb = albedo (sky, coping, ground and the drainpipe are painted lit; the wall face is left unlit
 *                  because the shader lights it together with the paint), a = height (pores, crack, tie holes, seams)
 *   bakeKraft(R)   rgb = kraft board with pencil guide lines, a = fibre height (where thin paint catches first)
 *   bakeTape(), bakeCan(paint), bakeCanShadow(), bakeMistNoise(), bakeDrops(), drawVignette()
 */
import { rand, clamp, lerp } from '../_lib/stage.js';

const TAU = Math.PI * 2;
export const ZONE = { cope: 250, face: 300, ground: 1728, pipe: 64 };

export function cnv(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d', { willReadFrequently: true }) };
}

/** value noise on a 256² lattice (wraps every 256 units) */
export function noise2(seed) {
  const N = 256, r = rand(seed), T = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) T[i] = r();
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const x0 = xi & 255, y0 = yi & 255, x1 = (x0 + 1) & 255, y1 = (y0 + 1) & 255;
    const a = T[y0 * N + x0], b = T[y0 * N + x1], c = T[y1 * N + x0], d = T[y1 * N + x1];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}
const fbm = (n, x, y, o = 3) => { let s = 0, a = 0.5, f = 1, k = 0; for (let i = 0; i < o; i++) { s += a * n(x * f + i * 17.3, y * f - i * 9.1); k += a; a *= 0.5; f *= 2.03; } return s / k; };

// ------------------------------------------------------------------------------------------------ the wall
export function bakeWall(R) {
  const { x0, y0, w, h } = R;
  const A = cnv(w, h), HT = cnv(w, h);
  const g = A.g, gh = HT.g;
  g.translate(-x0, -y0); gh.translate(-x0, -y0);
  const r = rand(4101);
  const X1 = x0 + w, Y1 = y0 + h;

  // ---- dusk sky, far roofs, wires, a thin moon
  const sky = g.createLinearGradient(0, y0, 0, ZONE.cope);
  sky.addColorStop(0, '#24264f'); sky.addColorStop(0.42, '#463f74'); sky.addColorStop(0.76, '#9c6d90'); sky.addColorStop(1, '#e9a988');
  g.fillStyle = sky; g.fillRect(x0, y0, w, ZONE.face - y0);
  g.fillStyle = 'rgba(248,226,206,0.16)';
  for (const [cx, cy, rx, ry] of [[250, 168, 260, 9], [760, 150, 220, 7], [520, 196, 330, 8], [990, 186, 160, 6]]) { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.fill(); }
  {
    const mx = 846, my = 92, mr = 21;
    const glow = g.createRadialGradient(mx, my, 0, mx, my, 90);
    glow.addColorStop(0, 'rgba(246,230,200,0.28)'); glow.addColorStop(1, 'rgba(246,230,200,0)');
    g.fillStyle = glow; g.fillRect(mx - 90, my - 90, 180, 180);
    g.save(); g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.clip();
    g.fillStyle = '#f4e6c8'; g.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
    g.fillStyle = sky; g.beginPath(); g.arc(mx + 9, my - 6, mr * 0.92, 0, TAU); g.fill();
    g.restore();
  }
  // roofs beyond the wall (one flat tone, a few warm windows)
  g.fillStyle = '#3d3767';
  g.beginPath(); g.moveTo(x0, ZONE.cope);
  for (const [x, y] of [[x0, 214], [90, 214], [90, 196], [210, 196], [236, 176], [262, 196], [300, 196], [300, 222], [420, 222], [420, 204],
    [560, 204], [560, 188], [598, 188], [598, 204], [700, 204], [700, 226], [780, 226], [800, 200], [930, 200], [930, 182], [1010, 182], [1010, 210], [X1, 210]]) g.lineTo(x, y);
  g.lineTo(X1, ZONE.cope); g.fill();
  g.fillStyle = '#342f5c';
  for (const [cx, cy, rr] of [[372, 214, 26], [404, 206, 20], [852, 204, 24], [880, 212, 18]]) { g.beginPath(); g.arc(cx, cy, rr, 0, TAU); g.fill(); }
  g.fillStyle = '#3d3767'; g.fillRect(612, 160, 4, 30); g.fillRect(598, 168, 32, 3);           // a roof antenna
  g.fillStyle = 'rgba(255,200,140,0.75)';
  for (const [x, y] of [[132, 204], [156, 204], [478, 212], [956, 192], [972, 192], [728, 214]]) g.fillRect(x, y, 9, 6);
  // two sagging wires
  g.lineCap = 'round';
  for (const [ya, yb, sag, lw] of [[118, 64, 46, 2.4], [140, 92, 40, 1.7]]) {
    g.strokeStyle = '#1d1c3a'; g.lineWidth = lw; g.beginPath();
    for (let x = x0; x <= X1; x += 12) { const k = (x - x0) / w, y = lerp(ya, yb, k) + sag * (1 - (2 * k - 1) ** 2); x === x0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
  }

  // ---- coping (concrete cap) on top of the wall
  g.fillStyle = '#c7b9ad'; g.fillRect(x0, ZONE.cope, w, 12);
  const cf = g.createLinearGradient(0, ZONE.cope + 12, 0, ZONE.face);
  cf.addColorStop(0, '#a79b92'); cf.addColorStop(1, '#8b8079');
  g.fillStyle = cf; g.fillRect(x0, ZONE.cope + 12, w, ZONE.face - ZONE.cope - 12);
  g.fillStyle = 'rgba(255,240,222,0.55)'; g.fillRect(x0, ZONE.cope + 11, w, 2);
  g.fillStyle = 'rgba(40,30,40,0.35)'; g.fillRect(x0, ZONE.face - 2, w, 2);
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '230,220,205' : '90,80,80'},${(0.15 + r() * 0.2).toFixed(2)})`; g.beginPath(); g.ellipse(x0 + r() * w, ZONE.cope + 14 + r() * 30, 3 + r() * 9, 1.5 + r() * 3, 0, 0, TAU); g.fill(); }

  // ---- the wall face (unlit albedo)
  g.fillStyle = '#a3988f'; g.fillRect(x0, ZONE.face, w, ZONE.ground - ZONE.face);
  gh.fillStyle = '#fff'; gh.fillRect(x0, y0, w, h);
  for (let i = 0; i < 70; i++) {                                   // mottling
    const cx = x0 + r() * w, cy = ZONE.face + r() * (ZONE.ground - ZONE.face), rr = 60 + r() * 220, dark = r() < 0.55;
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rr);
    gr.addColorStop(0, dark ? `rgba(120,108,100,${(0.1 + r() * 0.16).toFixed(3)})` : `rgba(190,180,170,${(0.1 + r() * 0.16).toFixed(3)})`);
    gr.addColorStop(1, 'rgba(160,150,140,0)');
    g.fillStyle = gr; g.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
  }
  // a buffed-out patch of old grey paint (somebody painted over an old tag)
  g.save(); g.filter = 'blur(3px)'; g.fillStyle = 'rgba(150,143,140,0.55)';
  g.beginPath(); g.roundRect(640, 1452, 330, 176, 10); g.fill();
  g.fillStyle = 'rgba(150,143,140,0.45)'; g.beginPath(); g.roundRect(150, 318, 250, 118, 8); g.fill();
  g.restore();
  // water stains from the coping
  g.save(); g.beginPath(); g.rect(x0, ZONE.face, w, ZONE.ground - ZONE.face); g.clip();
  for (let i = 0; i < 18; i++) {
    const sx = x0 + 80 + r() * (w - 120), sw = 12 + r() * 48, len = 120 + r() ** 1.5 * 640, a = 0.07 + r() * 0.13;
    for (let k = 0; k < 14; k++) {
      const p = k / 14, gg = g.createLinearGradient(0, ZONE.face, 0, ZONE.face + len);
      gg.addColorStop(0, `rgba(96,86,80,${a.toFixed(3)})`); gg.addColorStop(1, 'rgba(96,86,80,0)');
      g.fillStyle = gg; g.globalAlpha = 0.22;
      g.beginPath(); g.ellipse(sx + Math.sin(p * 9 + i) * 4, ZONE.face + len * p * 0.5, sw * (1 - p * 0.6) * 0.5, len * (0.5 - p * 0.25), 0, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
  }
  g.restore();
  // splash grime and salt bloom at the base
  {
    const bg = g.createLinearGradient(0, ZONE.ground - 190, 0, ZONE.ground);
    bg.addColorStop(0, 'rgba(84,78,70,0)'); bg.addColorStop(1, 'rgba(84,78,70,0.5)');
    g.fillStyle = bg; g.fillRect(x0, ZONE.ground - 190, w, 190);
    for (let i = 0; i < 8; i++) {
      const cx = x0 + r() * w, cy = ZONE.ground - 40 - r() * 90, rr = 30 + r() * 70;
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rr);
      gr.addColorStop(0, 'rgba(228,224,214,0.2)'); gr.addColorStop(1, 'rgba(228,224,214,0)');
      g.fillStyle = gr; g.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
    }
  }
  // formwork seams (grooves) and tie holes
  const seam = (ax, ay, bx, by) => {
    g.strokeStyle = 'rgba(110,100,94,0.45)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
    gh.strokeStyle = 'rgba(0,0,0,0.55)'; gh.lineWidth = 2.6; gh.beginPath(); gh.moveTo(ax, ay); gh.lineTo(bx, by); gh.stroke();
  };
  seam(x0, 1452, X1, 1452); seam(150, ZONE.face, 150, ZONE.ground); seam(932, ZONE.face, 932, ZONE.ground);
  for (const [cx, cy] of [[186, 392], [558, 392], [930, 392], [186, 1590], [558, 1590], [930, 1590], [930, 930], [186, 930]]) {
    g.fillStyle = '#7a6f69'; g.beginPath(); g.arc(cx, cy, 10, 0, TAU); g.fill();
    g.fillStyle = '#4b423e'; g.beginPath(); g.arc(cx, cy, 6, 0, TAU); g.fill();
    const hg = gh.createRadialGradient(cx, cy, 0, cx, cy, 11);
    hg.addColorStop(0, 'rgba(0,0,0,0.95)'); hg.addColorStop(0.7, 'rgba(0,0,0,0.6)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
    gh.fillStyle = hg; gh.fillRect(cx - 12, cy - 12, 24, 24);
  }
  // a crack, lower left, with two branches
  {
    const pts = [[x0, 1170]], rc = rand(77);
    let x = 40, y = 1188;
    while (y < ZONE.ground) { pts.push([x, y]); x += 6 + rc() * 14; y += 12 + rc() * 16; x += (rc() - 0.5) * 18; }
    const crack = (P, lw) => {
      for (const [gg, col, wd] of [[g, 'rgba(58,48,44,0.9)', lw], [gh, 'rgba(0,0,0,0.9)', lw + 1.2]]) {
        gg.strokeStyle = col; gg.lineWidth = wd; gg.lineJoin = 'round'; gg.beginPath();
        P.forEach(([px, py], i) => (i ? gg.lineTo(px, py) : gg.moveTo(px, py))); gg.stroke();
      }
    };
    crack(pts, 2.4);
    crack(pts.slice(9, 13).map(([px, py], i) => [px + i * 16, py - i * 4]), 1.4);
    crack(pts.slice(22, 26).map(([px, py], i) => [px - i * 14, py + i * 3]), 1.2);
  }
  // pores
  for (let i = 0; i < 4200; i++) {
    const cx = x0 + r() * w, cy = ZONE.face + 4 + r() * (ZONE.ground - ZONE.face - 8), rr = 0.6 + r() ** 3 * 2.8;
    g.fillStyle = `rgba(104,94,88,${(0.25 + r() * 0.35).toFixed(2)})`; g.beginPath(); g.arc(cx, cy, rr, 0, TAU); g.fill();
    gh.fillStyle = `rgba(0,0,0,${(0.4 + r() * 0.45).toFixed(2)})`; gh.beginPath(); gh.arc(cx, cy, rr + 0.3, 0, TAU); gh.fill();
  }

  // ---- ground: curb strip, pavement, contact shadow, weeds
  g.fillStyle = '#383240'; g.fillRect(x0, ZONE.ground, w, Y1 - ZONE.ground);
  g.fillStyle = '#5a5262'; g.fillRect(x0, ZONE.ground, w, 16);
  g.fillStyle = 'rgba(255,225,200,0.22)'; g.fillRect(x0, ZONE.ground + 15, w, 2);
  {
    const sg = g.createLinearGradient(0, ZONE.ground + 16, 0, ZONE.ground + 70);
    sg.addColorStop(0, 'rgba(14,10,22,0.45)'); sg.addColorStop(1, 'rgba(14,10,22,0)');
    g.fillStyle = sg; g.fillRect(x0, ZONE.ground + 16, w, 54);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '120,110,130' : '20,16,26'},${(0.2 + r() * 0.3).toFixed(2)})`; g.fillRect(x0 + r() * w, ZONE.ground + 18 + r() * (Y1 - ZONE.ground), 1.5, 1.5); }
  }
  const weed = (bx, by, s, flip) => {
    for (let k = 0; k < 6; k++) {
      const a = -Math.PI / 2 + (k - 2.5) * 0.32 * flip + (r() - 0.5) * 0.2, L = s * (0.6 + r() * 0.6);
      g.fillStyle = k % 2 ? '#5d6a4c' : '#73805a';
      g.save(); g.translate(bx + (k - 2.5) * 3, by); g.rotate(a + Math.PI / 2);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * 0.28, -L * 0.5, 0, -L); g.quadraticCurveTo(-L * 0.28, -L * 0.5, 0, 0); g.fill();
      g.restore();
    }
  };
  weed(118, ZONE.ground + 6, 46, 1); weed(690, ZONE.ground + 8, 34, -1); weed(1020, ZONE.ground + 6, 52, 1);

  // ---- drainpipe on the left, and the soft shadow it throws on the wall
  {
    const sh = g.createLinearGradient(56, 0, 104, 0);
    sh.addColorStop(0, 'rgba(40,30,50,0.42)'); sh.addColorStop(1, 'rgba(40,30,50,0)');
    g.fillStyle = sh; g.fillRect(56, ZONE.face, 48, ZONE.ground - ZONE.face);
    const pg = g.createLinearGradient(16, 0, 62, 0);
    pg.addColorStop(0, '#565467'); pg.addColorStop(0.28, '#9b97a8'); pg.addColorStop(0.5, '#73707f'); pg.addColorStop(1, '#3a3846');
    g.fillStyle = pg; g.beginPath(); g.roundRect(18, ZONE.cope + 4, 42, ZONE.ground - ZONE.cope - 4, 6); g.fill();
    for (const by of [520, 1010, 1500]) {
      g.fillStyle = '#3c3a49'; g.beginPath(); g.roundRect(12, by, 54, 16, 4); g.fill();
      g.fillStyle = 'rgba(255,235,215,0.3)'; g.fillRect(14, by + 2, 50, 2);
    }
    g.fillStyle = pg; g.beginPath(); g.roundRect(10, ZONE.ground - 34, 66, 40, 10); g.fill();
  }

  // ---- per-pixel: grain and mottling on the face, height for the shader
  const a = g.getImageData(0, 0, w, h).data, hh = gh.getImageData(0, 0, w, h).data;
  const n1 = noise2(11), n2 = noise2(12), n3 = noise2(13);
  const out = new Uint8Array(w * h * 4);
  for (let j = 0; j < h; j++) {
    const y = j + y0, face = y >= ZONE.face && y < ZONE.ground, ground = y >= ZONE.ground;
    for (let i = 0; i < w; i++) {
      const x = i + x0, k = (j * w + i) * 4;
      let f = 1, hgt = 0.55;
      if (face && x >= ZONE.pipe) {
        f = (0.93 + 0.14 * fbm(n1, x / 150, y / 150, 2)) * (0.95 + 0.1 * n2(x / 2.1, y / 2.1));
        const pit = 1 - hh[k] / 255;
        hgt = 0.3 + 0.42 * fbm(n3, x / 30, y / 30, 3) + 0.24 * n2(x / 5.2 + 31.7, y / 5.2 - 4.1) - 0.66 * pit;
      } else if (ground) f = 0.94 + 0.12 * n2(x / 1.7, y / 1.7);
      out[k] = clamp(a[k] * f, 0, 255); out[k + 1] = clamp(a[k + 1] * f, 0, 255); out[k + 2] = clamp(a[k + 2] * f, 0, 255);
      out[k + 3] = clamp(Math.round(hgt * 255), 0, 255);
    }
  }
  return out;
}

// ------------------------------------------------------------------------------------------------ kraft board
export function bakeKraft(R, CARD, guides) {
  const { x0, y0, w, h } = R;
  const { g } = cnv(w, h);
  g.translate(-x0, -y0);
  g.fillStyle = '#b9966d'; g.fillRect(x0, y0, w, h);
  // pencil guide lines and registration ticks (the layout drawn before cutting)
  g.lineCap = 'round';
  const rp = rand(31);
  for (const y of guides) {
    g.strokeStyle = `rgba(70,62,58,${(0.3 + rp() * 0.12).toFixed(2)})`; g.lineWidth = 1.3;
    g.beginPath(); g.moveTo(CARD.x + 34 + rp() * 20, y + (rp() - 0.5) * 2); g.lineTo(CARD.x + CARD.w - 30 - rp() * 30, y + (rp() - 0.5) * 2); g.stroke();
  }
  g.strokeStyle = 'rgba(70,62,58,0.4)'; g.lineWidth = 1.5;
  for (const [cx, cy] of [[CARD.x + 40, CARD.y + 40], [CARD.x + CARD.w - 40, CARD.y + CARD.h - 40]]) {
    g.beginPath(); g.moveTo(cx - 12, cy); g.lineTo(cx + 12, cy); g.moveTo(cx, cy - 12); g.lineTo(cx, cy + 12); g.stroke();
  }
  // a scuffed dent and a ring where a cup stood
  g.strokeStyle = 'rgba(120,86,50,0.22)'; g.lineWidth = 5; g.beginPath(); g.arc(CARD.x + CARD.w - 120, CARD.y + 108, 38, 0.3, 5.6); g.stroke();
  const src = g.getImageData(0, 0, w, h).data;
  const n1 = noise2(21), n2 = noise2(22), out = new Uint8Array(w * h * 4);
  for (let j = 0; j < h; j++) {
    const y = j + y0;
    for (let i = 0; i < w; i++) {
      const x = i + x0, k = (j * w + i) * 4;
      const streak = n1(x / 26, y / 1.8), mott = fbm(n2, x / 90, y / 90, 2);
      const flute = 1 + 0.022 * Math.sin((x / 9.5) * TAU);
      const edge = Math.min(x - CARD.x, CARD.x + CARD.w - x, y - CARD.y, CARD.y + CARD.h - y);
      const ed = 0.86 + 0.14 * clamp(edge / 26, 0, 1);
      const f = (0.9 + 0.12 * streak + 0.1 * (mott - 0.5)) * flute * ed;
      out[k] = clamp(src[k] * f, 0, 255); out[k + 1] = clamp(src[k + 1] * f, 0, 255); out[k + 2] = clamp(src[k + 2] * f * 0.98, 0, 255);
      out[k + 3] = clamp(Math.round((0.35 + 0.55 * streak + 0.2 * (mott - 0.5)) * 255), 0, 255);
    }
  }
  return out;
}

// ------------------------------------------------------------------------------------------------ masking tape
export function bakeTape() {
  const w = 256, h = 64, { g } = cnv(w, h), r = rand(55);
  const L = [], Rt = [];
  for (let y = 0; y <= h; y += 4) { L.push([8 + r() * 7, y]); Rt.push([w - 8 - r() * 7, y]); }
  g.beginPath(); L.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  for (let i = Rt.length - 1; i >= 0; i--) g.lineTo(Rt[i][0], Rt[i][1]);
  g.closePath();
  g.fillStyle = 'rgba(231,215,170,0.93)'; g.fill();
  g.save(); g.clip();
  for (let i = 0; i < 9; i++) {                                    // crinkles
    const x = 20 + r() * (w - 40);
    g.strokeStyle = `rgba(${r() < 0.5 ? '255,250,235' : '150,130,90'},${(0.18 + r() * 0.18).toFixed(2)})`; g.lineWidth = 1 + r();
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 30, h); g.stroke();
  }
  g.fillStyle = 'rgba(140,120,80,0.18)'; g.fillRect(0, 0, w, 2); g.fillRect(0, h - 2, w, 2);
  g.restore();
  return { data: new Uint8Array(g.getImageData(0, 0, w, h).data.buffer), w, h };
}

// ------------------------------------------------------------------------------------------------ the spray can
// design space 300 × 620 px; the nozzle sits on the left side of the actuator at NOZ
export const CAN = { w: 300, h: 620, noz: [116, 70], S: 1.5 };
function canPath(g) {
  g.beginPath();
  g.moveTo(86, 150); g.bezierCurveTo(86, 112, 120, 102, 150, 102); g.bezierCurveTo(180, 102, 214, 112, 214, 150);
  g.lineTo(214, 532); g.quadraticCurveTo(214, 552, 150, 552); g.quadraticCurveTo(86, 552, 86, 532); g.closePath();
  g.roundRect(118, 46, 64, 64, 12);
}
export function bakeCan(paint) {
  const S = CAN.S, { c, g } = cnv(CAN.w * S, CAN.h * S);
  g.scale(S, S);
  const cyl = (y0, y1, stops) => { const gr = g.createLinearGradient(86, 0, 214, 0); stops.forEach(([o, col]) => gr.addColorStop(o, col)); return gr; };
  // body: deep ink, warm light from the left, cool rim on the right
  g.fillStyle = cyl(150, 540, [[0, '#4e4f6c'], [0.16, '#6a6884'], [0.3, '#3a4160'], [0.7, '#252c45'], [0.93, '#1a2034'], [1, '#3e4670']]);
  g.beginPath(); g.moveTo(86, 150); g.lineTo(214, 150); g.lineTo(214, 532); g.quadraticCurveTo(214, 552, 150, 552); g.quadraticCurveTo(86, 552, 86, 532); g.closePath(); g.fill();
  // colour band: the paint inside, no label
  g.fillStyle = cyl(0, 0, [[0, paint[2]], [0.18, paint[0]], [0.62, paint[1]], [1, paint[2]]]);
  g.fillRect(86, 300, 128, 92);
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(86, 300, 128, 3);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(86, 389, 128, 3);
  // specular stripe
  g.fillStyle = 'rgba(255,240,226,0.32)'; g.beginPath(); g.roundRect(104, 160, 9, 370, 4.5); g.fill();
  // bottom rim
  g.fillStyle = cyl(0, 0, [[0, '#8a8ea2'], [0.25, '#c4c6d2'], [0.7, '#6d7186'], [1, '#4b4f63']]);
  g.beginPath(); g.moveTo(86, 524); g.lineTo(214, 524); g.lineTo(214, 532); g.quadraticCurveTo(214, 552, 150, 552); g.quadraticCurveTo(86, 552, 86, 532); g.closePath(); g.fill();
  // shoulder dome and neck
  g.fillStyle = cyl(0, 0, [[0, '#9c9fb2'], [0.22, '#dfe0e8'], [0.5, '#a5a8b9'], [1, '#5b5f74']]);
  g.beginPath(); g.moveTo(86, 152); g.bezierCurveTo(86, 112, 120, 102, 150, 102); g.bezierCurveTo(180, 102, 214, 112, 214, 152); g.closePath(); g.fill();
  g.fillStyle = 'rgba(30,30,50,0.35)'; g.fillRect(86, 149, 128, 4);
  g.fillStyle = '#7d8094'; g.beginPath(); g.ellipse(150, 106, 34, 8, 0, 0, TAU); g.fill();
  // actuator cap in the paint colour, nozzle hole on its left
  const ag = g.createLinearGradient(118, 0, 182, 0);
  ag.addColorStop(0, paint[0]); ag.addColorStop(0.5, paint[1]); ag.addColorStop(1, paint[2]);
  g.fillStyle = ag; g.beginPath(); g.roundRect(118, 46, 64, 64, 12); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.roundRect(124, 50, 52, 10, 5); g.fill();
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(118, 92, 64, 3);
  g.fillStyle = '#2a2232'; g.beginPath(); g.ellipse(CAN.noz[0] + 6, CAN.noz[1], 5, 6, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(CAN.noz[0] + 7.5, CAN.noz[1] - 2, 1.6, 0, TAU); g.fill();
  return { data: new Uint8Array(g.getImageData(0, 0, c.width, c.height).data.buffer), w: c.width, h: c.height };
}
export function bakeCanShadow() {
  const s = 0.5, { c, g } = cnv(CAN.w * s, CAN.h * s);
  g.scale(s, s); g.filter = 'blur(9px)'; g.fillStyle = '#fff'; canPath(g); g.fill();
  return { data: new Uint8Array(g.getImageData(0, 0, c.width, c.height).data.buffer), w: c.width, h: c.height };
}

// ------------------------------------------------------------------------------------------------ mist noise (tileable 256²)
export function bakeMistNoise() {
  const N = 256, out = new Uint8Array(N * N * 4), r = rand(808);
  const oct = [8, 16, 32, 64].map((P) => { const T = new Float32Array(P * P); for (let i = 0; i < P * P; i++) T[i] = r(); return { P, T }; });
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let s = 0, amp = 0.5, norm = 0;
    for (const { P, T } of oct) {
      const fx = (x / N) * P, fy = (y / N) * P, xi = Math.floor(fx), yi = Math.floor(fy), u = fx - xi, v = fy - yi;
      const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
      const a = T[(yi % P) * P + (xi % P)], b = T[(yi % P) * P + ((xi + 1) % P)], c = T[((yi + 1) % P) * P + (xi % P)], d = T[((yi + 1) % P) * P + ((xi + 1) % P)];
      s += amp * (a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv); norm += amp; amp *= 0.55;
    }
    const k = (y * N + x) * 4, v = Math.round((s / norm) * 255);
    out[k] = out[k + 1] = out[k + 2] = v; out[k + 3] = 255;
  }
  return out;
}

/**
 * Droplet thresholds for both coats over the wall region (RG bytes; 255 = no droplet).
 * A droplet with threshold u shows once 1 − e^(−kD) > u. Big droplets get the low thresholds, so the thin fringe of a
 * spray shows few, large dots and the core fills in with many small ones until the film takes over.
 */
export function bakeDrops(R, count = 52000) {
  const { x0, y0, w, h } = R, out = new Uint8Array(w * h * 2).fill(255);
  for (let ch = 0; ch < 2; ch++) {
    const r = rand(9001 + ch * 77);
    for (let n = 0; n < count; n++) {
      const cx = r() * w, cy = r() * h, u = r(), rad = 0.65 + 2.5 * (1 - u) ** 4 + r() * 0.35, v = Math.round(8 + u * 246);
      const i0 = Math.max(0, Math.floor(cx - rad)), i1 = Math.min(w - 1, Math.ceil(cx + rad));
      const j0 = Math.max(0, Math.floor(cy - rad)), j1 = Math.min(h - 1, Math.ceil(cy + rad));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        if ((i + 0.5 - cx) ** 2 + (j + 0.5 - cy) ** 2 > rad * rad) continue;
        const k = (j * w + i) * 2 + ch;
        if (v < out[k]) out[k] = v;
      }
    }
  }
  return out;
}

// ------------------------------------------------------------------------------------------------ static vignette
export function drawVignette(g, W, H) {
  const v = g.createRadialGradient(W / 2, H * 0.46, H * 0.3, W / 2, H * 0.5, H * 0.78);
  v.addColorStop(0, 'rgba(16,12,28,0)'); v.addColorStop(1, 'rgba(16,12,28,0.42)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  const b = g.createLinearGradient(0, H - 420, 0, H);
  b.addColorStop(0, 'rgba(14,10,24,0)'); b.addColorStop(0.6, 'rgba(14,10,24,0.38)'); b.addColorStop(1, 'rgba(14,10,24,0.62)');
  g.fillStyle = b; g.fillRect(0, H - 420, W, 420);
}
