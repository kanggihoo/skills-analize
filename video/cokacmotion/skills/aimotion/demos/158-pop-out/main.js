/*
 * 158 · 액자를 넘은 고래 — the pop-out illusion: two white bars and the picture's own edge are read as the screen
 * plane, so whatever is drawn over them reads as coming out of the screen.
 *
 *   0–0.6    a framed dawn sea on a cream page fades in; the caption "잔잔한 줄 알았지"
 *   0.55–1.2 two white bars draw down the picture (the screen plane); a small side-view depth gauge appears
 *   0.9–2.95 far out a humpback's back breaks the surface, it blows, and dives with its flukes up over the sun's path
 *   3.0–4.0  a dark shape rises; the breach: the head passes under the left bar, reaches the right bar and crosses
 *            the plane there (t ≈ 4.0) — from now on the bar runs under it
 *   4.0–6.0  head and flipper out past the frame; water drops fly out, grow, fall back and stain the mat and page;
 *            the whale's shadow falls on the mat outside the picture; climax and poster at 5.7
 *   6.0–6.6  it slides back, tips over, re-enters the window still in front, turns away and slaps down far out
 *   6.6–9.5  the splash stays inside (a few drops land on the mat), ripples settle; "고래가 다녀갔다"
 *
 * Technique (see NOTES.md): every element has a depth Z relative to the bar plane. Draw order: picture world (clipped
 * by the mat) → bars → what lies on the plane (stains, shadow) → everything with Z > 0, unclipped. The whale is split
 * per pixel: a software z-buffer of its mesh (depth.js) gives front = smoothstep(−d, d, Z) and back = 1 − front'.
 * Depth cues: perspective s = 1/(1 − Z/V), a contact-hardening shadow (PCSS) whose offset and blur grow with Z,
 * drops ballistic in Z that stain the page where they land, and window parallax of the sea layers.
 */
import { defineDemo, rand, clamp, lerp, smooth, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import * as WH from './whale.js';
import { makeBuf, clearBuf, fillAll, rasterMax, dilate, mattes, pcss } from './depth.js';

const D = 9.5, W = 1080, H = 1920, TAU = Math.PI * 2;
const KR = `"${FONTS.pretendard.family}"`;
const { V, EX, HZ, SEA_Y, LEN, NS, TB, sOf } = WH;

// ---------------------------------------------------------------- palette: navy, teal, cream + one accent (coral)
const C = {
  page: '#f2e9d8', page2: '#e7dcc6', mat: '#faf6ec', matLo: '#e4dac6', frame: '#1c2c42', frameHi: '#30496a', frameLo: '#101b2b',
  ink: '#1b2a3d', white: '#fffdf8',
  sky0: '#11213a', sky1: '#21425c', sky2: '#4d7f8b', sky3: '#c9b2a4',
  far: '#5d8d94', sea1: '#3a6a77', sea2: '#24495e', sea3: '#16304a', crest: '#a6c8c6', foam: '#eef5f2', drop: '#e8f3f1',
  coral: '#ff7a5a', coralL: '#ffb49a',
};
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixc = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
const rgba = (h, a) => { const c = hex(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };

// ---------------------------------------------------------------- layout: frame → mat → window (the picture)
const FR = { x: 120, y: 640, w: 840, h: 900, r: 46 };
const MT = { x: 142, y: 662, w: 796, h: 856, r: 28 };
const WIN = { x: 198, y: 718, w: 684, h: 744, r: 12 };
const BARS = [WIN.x + WIN.w / 3, WIN.x + (2 * WIN.w) / 3];       // 426, 654: thirds of the picture
const BAR_W = 30;
const inRect = (R, x, y, m = 0) => x > R.x + m && x < R.x + R.w - m && y > R.y + m && y < R.y + R.h - m;

// the eye drifts a little: window parallax (Z = 0 never moves, the far sky moves most, Z > 0 the other way)
const eye = (t) => [EX + 12 * Math.sin(0.62 * t + 0.5), HZ + 4 * Math.sin(0.47 * t + 1.3)];
const projP = (e, X, Y, Z) => { const s = sOf(Z); return [e[0] + (X - e[0]) * s, e[1] + (Y - e[1]) * s, s]; };

// the shadow light: a broad source up-left in the room, H_L above the plane, W_L wide (PCSS)
const LIGHT = { X: -900, Y: -1500, H: 4000, W: 520 };
const shadowOf = (X, Y, h) => { const k = LIGHT.H / (LIGHT.H - h); return [LIGHT.X + (X - LIGHT.X) * k, LIGHT.Y + (Y - LIGHT.Y) * k]; };
const shadowAlpha = (h) => 0.46 * (1 - 0.5 * clamp(h / 420));

// ---------------------------------------------------------------- canvases
let CPU = false;
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  return { c, ctx: c.getContext('2d', CPU ? { willReadFrequently: true } : undefined) };
}
function reset(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}
const rr = (ctx, R, inset = 0) => { ctx.beginPath(); ctx.roundRect(R.x + inset, R.y + inset, R.w - 2 * inset, R.h - 2 * inset, Math.max(0, R.r - inset)); };

// ---------------------------------------------------------------- setup paintings
function paintPage(g, r) {
  g.fillStyle = C.page; g.fillRect(0, 0, W, H);
  // paper: soft blotches and fibres
  for (let i = 0; i < 260; i++) {
    const x = r() * W, y = r() * H, s = 60 + r() * 160;
    g.fillStyle = r() < 0.5 ? 'rgba(255,252,244,0.022)' : 'rgba(150,120,80,0.014)';
    g.beginPath(); g.ellipse(x, y, s, s * (0.5 + r() * 0.5), r() * 3, 0, TAU); g.fill();
  }
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(120,96,62,0.05)' : 'rgba(255,255,250,0.09)';
    g.fillRect(r() * W, r() * H, 1 + r(), 1 + r());
  }
  g.lineCap = 'round';
  for (let i = 0; i < 1400; i++) {
    const x = r() * W, y = r() * H, a = r() * TAU, l = 4 + r() * 14;
    g.strokeStyle = r() < 0.5 ? 'rgba(120,96,62,0.05)' : 'rgba(255,255,250,0.1)'; g.lineWidth = 0.7 + r() * 0.6;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.6, y + Math.sin(a + 0.6) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // a quiet vignette
  const v = g.createRadialGradient(W / 2, H * 0.48, 300, W / 2, H * 0.5, 1250);
  v.addColorStop(0, 'rgba(120,96,60,0)'); v.addColorStop(1, 'rgba(110,84,52,0.2)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  // frame shadow on the page (setup only, so the blur is rasterised once)
  g.save(); g.filter = 'blur(22px)'; g.fillStyle = 'rgba(40,32,24,0.32)'; rr(g, { ...FR, x: FR.x + 10, y: FR.y + 22 }); g.fill(); g.restore();
  g.save(); g.filter = 'blur(4px)'; g.fillStyle = 'rgba(40,32,24,0.3)'; rr(g, { ...FR, x: FR.x + 2, y: FR.y + 5 }); g.fill(); g.restore();
  // frame: navy, lit bevel top-left, darker bottom-right
  rr(g, FR); g.fillStyle = C.frame; g.fill();
  g.save(); rr(g, FR); g.clip();
  const fg = g.createLinearGradient(FR.x, FR.y, FR.x + FR.w, FR.y + FR.h);
  fg.addColorStop(0, 'rgba(90,120,160,0.35)'); fg.addColorStop(0.5, 'rgba(90,120,160,0)'); fg.addColorStop(1, 'rgba(0,0,0,0.25)');
  g.fillStyle = fg; g.fillRect(FR.x, FR.y, FR.w, FR.h);
  g.lineWidth = 3; g.strokeStyle = 'rgba(140,170,205,0.35)'; rr(g, FR, 1.5); g.stroke();
  g.restore();
  // mat with its own soft shadow from the frame lip
  rr(g, MT); g.fillStyle = C.mat; g.fill();
  g.save(); rr(g, MT); g.clip();
  g.filter = 'blur(6px)'; g.lineWidth = 14; g.strokeStyle = 'rgba(30,30,40,0.22)'; rr(g, { ...MT, x: MT.x - 2, y: MT.y - 4 }, -6); g.stroke(); g.filter = 'none';
  for (let i = 0; i < 260; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(160,140,110,0.05)' : 'rgba(255,255,255,0.25)';
    g.beginPath(); g.arc(MT.x + r() * MT.w, MT.y + r() * MT.h, 0.6 + r() * 1.4, 0, TAU); g.fill();
  }
  g.restore();
  // bevelled cut around the window: a bright core, lit on the lower-right faces
  g.save();
  rr(g, WIN, -7); g.fillStyle = '#fffefa'; g.fill();
  g.beginPath(); g.moveTo(WIN.x - 7, WIN.y + WIN.h + 7); g.lineTo(WIN.x + WIN.w + 7, WIN.y + WIN.h + 7); g.lineTo(WIN.x + WIN.w + 7, WIN.y - 7);
  g.lineTo(WIN.x + WIN.w, WIN.y); g.lineTo(WIN.x + WIN.w, WIN.y + WIN.h); g.lineTo(WIN.x, WIN.y + WIN.h); g.closePath();
  g.fillStyle = 'rgba(210,198,176,0.55)'; g.fill();
  g.restore();
  // the window itself: a hole
  g.save(); g.globalCompositeOperation = 'destination-out'; rr(g, WIN); g.fill(); g.restore();
  // inner shadow the mat casts on the picture (the picture sits behind it)
  g.save(); rr(g, WIN); g.clip();
  g.filter = 'blur(9px)'; g.lineWidth = 26; g.strokeStyle = 'rgba(5,12,22,0.55)'; rr(g, { ...WIN, x: WIN.x + 6, y: WIN.y + 9 }, -13); g.stroke();
  g.restore();
}
function paintSky(g, w, h, r) {
  // window-sized sky + margin, horizon at y = h − 40 (drawn at eye y)
  const hy = h - 60, gr = g.createLinearGradient(0, 0, 0, hy);
  gr.addColorStop(0, C.sky0); gr.addColorStop(0.42, C.sky1); gr.addColorStop(0.78, C.sky2); gr.addColorStop(1, C.sky3);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}
function cloudSprite(w, h, seed) {
  const S = mk(w, h), g = S.ctx, r = rand(seed), base = h * 0.78;
  const puffs = [];
  let x = w * 0.06;
  while (x < w * 0.94) {
    const u = x / w, rad = h * (0.16 + 0.42 * Math.pow(Math.sin(Math.PI * u), 1.4)) * (0.7 + 0.5 * r());
    puffs.push([x, base - rad * 0.55, rad]); x += rad * (0.7 + 0.4 * r());
  }
  const body = () => {
    g.beginPath();
    for (const [px, py, rad] of puffs) { g.moveTo(px + rad, py); g.arc(px, py, rad, 0, TAU); }
    g.roundRect(w * 0.03, base - h * 0.16, w * 0.94, h * 0.16, h * 0.08);
  };
  g.save(); g.beginPath(); g.rect(0, 0, w, base); g.clip();
  body(); g.fillStyle = '#2f5873'; g.fill();
  body(); g.clip();
  const lg = g.createLinearGradient(0, 0, 0, base);
  lg.addColorStop(0, 'rgba(120,156,176,0.5)'); lg.addColorStop(0.45, 'rgba(120,156,176,0)'); lg.addColorStop(0.78, 'rgba(255,160,130,0)'); lg.addColorStop(1, 'rgba(255,160,130,0.7)');
  g.fillStyle = lg; g.fillRect(0, 0, w, h);
  g.restore();
  return S.c;
}
function glowSprite(rad, col, a0) {
  const S = mk(rad * 2, rad * 2), g = S.ctx, gr = g.createRadialGradient(rad, rad, 0, rad, rad, rad);
  gr.addColorStop(0, rgba(col, a0)); gr.addColorStop(0.35, rgba(col, a0 * 0.35)); gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr; g.fillRect(0, 0, rad * 2, rad * 2);
  return S.c;
}
function headlands(w, h) {
  const S = mk(w, h), g = S.ctx;
  // left: two low hills; right: a long headland with a tiny lighthouse
  g.fillStyle = '#3f6b78';
  g.beginPath(); g.moveTo(0, h); g.bezierCurveTo(30, h - 20, 70, h - 34, 120, h - 30); g.bezierCurveTo(150, h - 26, 170, h - 14, 230, h - 9); g.lineTo(260, h); g.fill();
  g.fillStyle = '#4b7884';
  g.beginPath(); g.moveTo(w - 330, h); g.bezierCurveTo(w - 280, h - 10, w - 230, h - 22, w - 170, h - 26); g.bezierCurveTo(w - 120, h - 30, w - 60, h - 46, w, h - 50); g.lineTo(w, h); g.fill();
  g.fillStyle = '#3f6b78'; g.fillRect(w - 128, h - 52, 7, 24); g.beginPath(); g.moveTo(w - 131, h - 52); g.lineTo(w - 124.5, h - 60); g.lineTo(w - 118, h - 52); g.fill();
  return S.c;
}

// ---------------------------------------------------------------- sea rows (painted plane, window parallax)
// row k lies at depth with scale s_k; its screen line is y = ey + 520·s_k
const ROWS = Array.from({ length: 12 }, (_, k) => {
  const s = 0.035 * Math.pow(1.36, k);
  return { s, amp: 2 + 9 * s, lam: 60 + 230 * s, sp: 0.5 + 0.9 * s, ph: k * 1.7, col: mixc(C.far, C.sea3, clamp(Math.pow(s, 0.6))), crest: mixc('#b7d3cf', '#5f8fa0', clamp(s * 1.1)) };
}).filter((r) => r.s < 1.05);
const rowY = (row, e) => e[1] + 520 * row.s;
const rowShift = (row, e) => (e[0] - EX) * (1 - row.s);
function crestY(row, x, t, e) {
  const xx = x - rowShift(row, e);
  return rowY(row, e) + row.amp * (Math.sin(xx / row.lam * TAU + row.ph + t * row.sp * 2.1) * 0.7 + Math.sin(xx / row.lam * 2.7 + row.ph * 2 - t * row.sp * 1.3) * 0.3);
}

// ---------------------------------------------------------------- droplets, stains (all baked as closed-form flights)
const GZ = 1500, GY = 700;           // gravity in the room: toward the page (−Z) and down
const FRAMEP = (x, y) => inRect(FR, x, y) && !inRect(MT, x, y) ? 'frame' : inRect(MT, x, y) ? 'mat' : 'page';
function bodyPoint(ps, u, f) {
  // a point on the visible front of the body at spine u, across offset f ∈ [−1, 1] (world)
  const fi = clamp(u) * NS, i = Math.min(NS - 1, Math.floor(fi)), w = fi - i, P = ps.P;
  const X = lerp(P[i * 3], P[i * 3 + 3], w), Y = lerp(P[i * 3 + 1], P[i * 3 + 4], w), Z = lerp(P[i * 3 + 2], P[i * 3 + 5], w);
  const tx = P[i * 3 + 3] - P[i * 3], ty = P[i * 3 + 4] - P[i * 3 + 1], l = Math.hypot(tx, ty) || 1;
  const nx = ty / l, ny = -tx / l, r = lerp(WH.RADIUS[i], WH.RADIUS[i + 1], w);
  return [X + nx * r * f, Y + ny * r * f, Z + r * Math.sqrt(Math.max(0, 1 - f * f))];
}
// where the slap happens: the body's middle on the surface at the impact
const SLAP = (() => { const p = bodyPoint(WH.pose(TB.impact), 0.72, 0); return [p[0], p[2] - 40]; })();
function makeDrops() {
  const drops = [];
  const r = rand(158);
  // (a) breach spray at the surface, all inside the picture
  for (let i = 0; i < 96; i++) {
    const t0 = 3.42 + Math.pow(r(), 1.6) * 0.6, ps = WH.pose(t0), wl = WH.waterline(ps);
    if (!wl) continue;
    const X = wl.X + (r() - 0.5) * 240, Z = wl.Z + (r() - 0.5) * 90;
    drops.push({ t0, p: [X, SEA_Y - 4, Z], v: [(r() - 0.3) * 560, -(500 + r() * 1300), (r() - 0.5) * 160], g: [0, 2500, 0], r: 2 + r() * 4.2, kind: 'in' });
  }
  // (b) shed by the whale while it is out: they leave its front surface, fly toward the viewer and fall onto the plane
  //     (landing spots are chosen first, on the mat and the page around the head and the flipper)
  const ZONES = [[500, 470, 420, 150], [470, 668, 420, 44], [889, 760, 46, 240], [966, 760, 90, 300]];
  const pick = [0, 1, 0, 2, 3, 0, 1, 3, 0, 2, 1, 0, 3];
  pick.forEach((zi, i) => {
    const t0 = 4.2 + (i / pick.length) * 1.7 + r() * 0.05, ps = WH.pose(t0);
    let p = null;
    for (let k = 0; k < 20 && !p; k++) { const q = bodyPoint(ps, 0.68 + r() * 0.34, (r() * 2 - 1) * 0.85); if (q[2] > 40 && q[1] < SEA_Y - 100) p = q; }
    if (!p) return;
    const [zx, zy, zw, zh] = ZONES[zi];
    drops.push(flightTo(t0, p, [zx + r() * zw, zy + r() * zh], 0.6 + r() * 0.45, 4 + r() * 3.5, 'out'));
  });
  // (c) the slap: spray inside, and a few that reach the bottom mat and the page
  const pi = WH.pose(TB.impact);
  for (let i = 0; i < 150; i++) {
    const u = 0.42 + r() * 0.6, p = bodyPoint(pi, u, r() * 2 - 1);
    const t0 = TB.impact - 0.04 + Math.pow(r(), 1.5) * 0.22;
    drops.push({ t0, p: [p[0], SEA_Y - 6, p[2] - 30], v: [(r() - 0.45) * 760, -(450 + r() * 1650), (r() - 0.5) * 300], g: [0, 2500, 0], r: 2 + r() * 5, kind: 'in' });
  }
  [[312, 1492], [520, 1503], [716, 1486], [902, 1430], [1012, 1512]].forEach(([tx, ty], i) => {
    const p = bodyPoint(pi, 0.45 + 0.1 * i, 0.5);
    drops.push(flightTo(TB.impact + 0.03 + i * 0.03, [p[0], SEA_Y - 10, p[2]], [tx, ty], 0.9 + (i % 3) * 0.13, 4.5 + (i % 3) * 1.2, 'out'));
  });
  return drops;
}
/** a flight from p (world) that lands on the plane Z = 0 at (tx, ty) after tl seconds, under gravity (0, GY, −GZ) */
function flightTo(t0, p, [tx, ty], tl, rad, kind) {
  const v = [(tx - p[0]) / tl, (ty - p[1] - 0.5 * GY * tl * tl) / tl, (0 - p[2] + 0.5 * GZ * tl * tl) / tl];
  return { t0, p, v, g: [0, GY, -GZ], r: rad, kind, tl, land: [tx, ty], surf: FRAMEP(tx, ty) };
}
const dropAt = (d, tau) => [d.p[0] + d.v[0] * tau + 0.5 * d.g[0] * tau * tau, d.p[1] + d.v[1] * tau + 0.5 * d.g[1] * tau * tau, d.p[2] + d.v[2] * tau + 0.5 * d.g[2] * tau * tau];

// ---------------------------------------------------------------- captions
function textSprite(parts, size, weight, spacing) {
  const font = `${weight} ${size}px ${KR}`, m = mk(4, 4).ctx;
  m.font = font; m.letterSpacing = spacing;
  const ws = parts.map(([s]) => m.measureText(s).width), tw = ws.reduce((a, b) => a + b, 0);
  const pad = 12, S = mk(tw + pad * 2, size * 1.4 + pad * 2), g = S.ctx;
  g.font = font; g.letterSpacing = spacing; g.textBaseline = 'alphabetic';
  let x = pad;
  parts.forEach(([s, col], i) => { g.fillStyle = col; g.fillText(s, x, pad + size * 1.05); x += ws[i]; });
  return { c: S.c, ox: pad, oy: pad + size * 1.05, w: tw };
}
const CAPS = [
  { t0: 0.35, t1: 3.22, lines: [[[['새벽 다섯 시, 액자 속 바다', rgba(C.ink, 0.62)]], 30, 600, '2px', 214], [[['잔잔한 줄 알았지', C.ink]], 76, 800, '-2px', 306]] },
  { t0: 7.45, t1: 99, lines: [[[['종이 위에 물자국만 남았다', rgba(C.ink, 0.62)]], 30, 600, '2px', 214], [[['고래', C.coral], ['가 다녀갔다', C.ink]], 76, 800, '-2px', 306]] },
];
const GAUGE_TXT = [['그림 속', 0], ['화면', 1], ['밖', 2]];
const ALL_TEXT = CAPS.flatMap((c) => c.lines.flatMap((l) => l[0].map((p) => p[0]))).join('') + GAUGE_TXT.map((g) => g[0]).join('');

// gauge: side view, horizontal = depth Z, vertical = height above the sea
const GA = { x0: 128, x1: 452, xs: 360, y: 1600 };   // kept above the caption scrim
const gaugeX = (Z) => GA.xs + (Z >= 0 ? Z * 0.24 : -205 * (1 - Math.exp(Z / (0.55 * V))));
const gaugeY = (Y) => GA.y - clamp((SEA_Y - Y) * 0.05, -12, 44);

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '158-pop-out',
  title: '액자를 넘은 고래',
  tech: '팝아웃 착시 · 깊이 기준 막대 + 피사체 매트 + 액자 밖 그림자',
  duration: D,
  background: C.page,

  async setup(api) {
    CPU = api.headless;
    captionScrim(api, '46,34,26');
    await fontReady(`800 76px ${KR}`, ALL_TEXT);
    await fontReady(`600 30px ${KR}`, ALL_TEXT);
    const main = api.canvas({ type: '2d', attrs: CPU ? { willReadFrequently: true } : undefined });
    this.ctx = main.ctx;
    const r = rand(9158);

    this.page = mk(W, H); paintPage(this.page.ctx, r);
    this.sky = mk(WIN.w + 80, (HZ - WIN.y) + 80); paintSky(this.sky.ctx, this.sky.c.width, this.sky.c.height, r);
    this.clouds = [cloudSprite(360, 64, 3), cloudSprite(240, 44, 7), cloudSprite(560, 40, 11)];
    this.sunGlow = glowSprite(300, C.coral, 0.55);
    this.dot = glowSprite(32, '#0e1a2a', 1);
    this.lands = headlands(WIN.w + 60, 64);
    this.stars = Array.from({ length: 34 }, () => [WIN.x + r() * WIN.w, WIN.y + 6 + r() * 150, 0.6 + r() * 1.2, r() * TAU]);
    this.rowDash = ROWS.map((row, k) => { const rr2 = rand(300 + k); return Array.from({ length: 9 + k * 2 }, () => [rr2() * (WIN.w + 200), rr2() * 0.8, 0.3 + rr2() * 0.7]); });
    // bars: white with a hair of shadow on the picture behind them
    this.bar = mk(BAR_W + 24, WIN.h + 24);
    { const g = this.bar.ctx; g.filter = 'blur(3px)'; g.fillStyle = 'rgba(4,10,20,0.35)'; g.fillRect(14, 14, BAR_W, WIN.h); g.filter = 'none'; g.fillStyle = C.white; g.fillRect(10, 10, BAR_W, WIN.h); }

    // whale layers: colour, front, back; half-resolution mattes; quarter-resolution shadow
    this.wc = mk(W, H); this.fc = mk(W, H); this.bc = mk(W, H);
    this.zb = makeBuf(W / 2, H / 2, 0.5); fillAll(this.zb); this.ztmp = new Float32Array((W / 2) * (H / 2));
    this.mF = mk(W / 2, H / 2); this.mB = mk(W / 2, H / 2);
    this.imF = new ImageData(W / 2, H / 2); this.imB = new ImageData(W / 2, H / 2);
    for (let i = 0; i < this.imF.data.length; i += 4) { this.imF.data[i] = this.imF.data[i + 1] = this.imF.data[i + 2] = 255; this.imB.data[i] = this.imB.data[i + 1] = this.imB.data[i + 2] = 255; }
    const SW = W / 4, SH = H / 4;
    this.sb = makeBuf(SW, SH, 0.25); fillAll(this.sb);
    this.shadow = {
      w: SW, h: SH, k: 0.25, cov: new Float32Array(SW * SH), hcov: new Float32Array(SW * SH),
      satC: new Float64Array((SW + 1) * (SH + 1)), satH: new Float64Array((SW + 1) * (SH + 1)), rs: 14, WL: LIGHT.W, HL: LIGHT.H, alpha: shadowAlpha,
    };
    this.shImg = new ImageData(SW, SH);
    { const [cr, cg, cb] = hex('#0e1b2c'); for (let i = 0; i < this.shImg.data.length; i += 4) { this.shImg.data[i] = cr; this.shImg.data[i + 1] = cg; this.shImg.data[i + 2] = cb; } }
    this.shC = mk(SW, SH);

    this.drops = makeDrops();
    this.caps = CAPS.map((cap) => ({ ...cap, lines: cap.lines.map(([parts, size, wt, sp, y]) => ({ ...textSprite(parts, size, wt, sp), y })) }));
    this.gtxt = GAUGE_TXT.map(([s]) => textSprite([[s, rgba(C.ink, 0.6)]], 19, 700, '1px'));
    // first composite of every offscreen canvas happens here, not in the first captured frame
    this.frame(5.7);
  },

  // ---------------------------------------------------------------- the picture world (behind the plane)
  drawPicture(t, e, wh) {
    const ctx = this.ctx;
    // sky (at infinity: shifts with the eye by the full drift)
    const dx = e[0] - EX, dy = e[1] - HZ;
    ctx.drawImage(this.sky.c, WIN.x - 40 + dx, WIN.y - 40 + dy - 20);
    const night = 1 - smooth(t / 6);
    ctx.fillStyle = '#e8eef2';
    for (const [x, y, s, ph] of this.stars) {
      const a = (0.25 + 0.5 * night) * (0.75 + 0.25 * Math.sin(t * 2.3 + ph)) * clamp((e[1] - 90 - y) / 120);
      if (a < 0.02) continue;
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x + dx, y + dy, s, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // sun rising on the horizon, its glow, clouds lit from below
    const sunY = e[1] + 26 - 30 * ease.outCubic(clamp(t / 9));
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.55 + 0.1 * smooth(t / 6);
    ctx.drawImage(this.sunGlow, e[0] - 300, sunY - 300); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    for (const [k, cl] of this.clouds.entries()) {
      const cx = [300, 760, 470][k] + 6 * t * (k === 1 ? -1 : 1) + dx * 0.98, cy = [800, 845, 905][k] + dy;
      ctx.globalAlpha = [0.8, 0.7, 0.45][k]; ctx.drawImage(cl, cx - cl.width / 2, cy - cl.height / 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(e[0], sunY, 50, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,214,190,0.5)'; ctx.beginPath(); ctx.arc(e[0] - 10, sunY - 12, 30, 0, TAU); ctx.fill();
    ctx.drawImage(this.lands, WIN.x - 30 + dx * 0.97, e[1] - 62);
    // sea: base gradient under the horizon
    const sg = ctx.createLinearGradient(0, e[1], 0, WIN.y + WIN.h);
    sg.addColorStop(0, '#6f989b'); sg.addColorStop(0.08, C.far); sg.addColorStop(0.35, C.sea1); sg.addColorStop(0.7, C.sea2); sg.addColorStop(1, C.sea3);
    ctx.fillStyle = sg; ctx.fillRect(WIN.x - 4, e[1], WIN.w + 8, WIN.y + WIN.h - e[1] + 4);
    // the sun's path on the water
    const sp = ctx.createLinearGradient(0, e[1], 0, e[1] + 420);
    sp.addColorStop(0, 'rgba(255,150,120,0.42)'); sp.addColorStop(1, 'rgba(255,150,120,0)');
    ctx.fillStyle = sp; ctx.beginPath(); ctx.moveTo(e[0] - 40, e[1]); ctx.lineTo(e[0] + 40, e[1]); ctx.lineTo(e[0] + 150, e[1] + 420); ctx.lineTo(e[0] - 150, e[1] + 420); ctx.fill();

    // rows from far to near; the whale's back part goes in where its waterline lies
    let whaleDone = false;
    for (let k = 0; k < ROWS.length; k++) {
      const row = ROWS[k], y0 = rowY(row, e);
      if (!whaleDone && wh && y0 > wh.yw) { this.drawBack(wh); whaleDone = true; }
      this.drawRow(row, k, t, e, wh);
    }
    if (!whaleDone && wh) this.drawBack(wh);
    this.drawWater(t, e, wh);
  },
  drawRow(row, k, t, e, wh) {
    const ctx = this.ctx, x0 = WIN.x - 10, x1 = WIN.x + WIN.w + 10, step = Math.max(6, row.lam / 10);
    ctx.beginPath(); ctx.moveTo(x0, WIN.y + WIN.h + 10);
    for (let x = x0; x <= x1 + step; x += step) ctx.lineTo(x, crestY(row, x, t, e));
    ctx.lineTo(x1 + step, WIN.y + WIN.h + 10);
    ctx.fillStyle = row.col; ctx.globalAlpha = wh && rowY(row, e) > wh.yw ? 0.62 : 0.9; ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let x = x0; x <= x1 + step; x += step) { const y = crestY(row, x, t, e); x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.strokeStyle = row.crest; ctx.lineWidth = 1 + 2.2 * row.s; ctx.lineJoin = 'round'; ctx.stroke();
    // glints: pale on the crests, coral inside the sun's path
    const sh = rowShift(row, e);
    for (const [u, ph, l] of this.rowDash[k]) {
      const xs = WIN.x - 100 + ((u + t * 14 * row.sp + sh) % (WIN.w + 200)), y = crestY(row, xs, t, e) + 3 + row.amp * 0.6;
      const inPath = Math.abs(xs - e[0]) < 40 + 120 * row.s;
      const a = (0.35 + 0.4 * Math.sin(t * 3 + ph * 9)) * (inPath ? 1.4 : 0.6);
      if (a <= 0.02) continue;
      ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = inPath ? C.coralL : C.crest;
      const lw = (10 + 46 * row.s) * l;
      ctx.beginPath(); ctx.roundRect(xs - lw / 2, y, lw, 1.4 + 2.6 * row.s, 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  },
  drawBack(wh) {
    const ctx = this.ctx, [x0, y0, x1, y1] = wh.bb;
    ctx.globalAlpha = wh.vis;
    ctx.drawImage(this.bc.c, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
    ctx.globalAlpha = 1;
  },

  // foam, splashes, ripples and in-picture drops (Z < 0)
  drawWater(t, e, wh) {
    const ctx = this.ctx;
    // ripple rings on the plane of the sea: a blow, the dive, the breach, the slap
    const rings = [[1.42, 150, -2 * V, 0.5], [2.75, 430, -2 * V, 0.6], [3.45, WH.Q[0], WH.Q[2], 0.9], [TB.impact, SLAP[0], SLAP[1], 1.2]];
    ctx.lineWidth = 2;
    for (const [t0, X, Z, big] of rings) {
      for (let j = 0; j < 4; j++) {
        const tau = t - t0 - j * 0.32;
        if (tau <= 0 || tau > 3.2) continue;
        const [x, y, s] = projP(e, X, SEA_Y, Z), rad = (60 + 260 * (1 - Math.exp(-tau * 0.9))) * big * s;
        ctx.globalAlpha = 0.45 * Math.exp(-tau * 1.1) * (1 - j * 0.18);
        ctx.strokeStyle = C.foam; ctx.beginPath(); ctx.ellipse(x, y, rad, rad * 0.16, 0, 0, TAU); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    // a blow far out: a bushy column of mist from the blowhole, rising, spreading, drifting downwind
    if (t > 1.4 && t < 2.6) {
      const ps = WH.pose(1.45), p = bodyPoint(ps, 0.92, 0.95), tau = t - 1.4;
      const rise = 1 - Math.exp(-tau * 3.2), fade = smooth(tau / 0.08) * (1 - smooth((tau - 0.35) / 0.8));
      ctx.fillStyle = C.foam;
      for (let j = 0; j < 12; j++) {
        const f = j / 11, side = ((j * 5) % 3 - 1) * 0.5;
        const X = p[0] + side * 40 * f * rise + 70 * tau * f, Y = p[1] - 330 * f * rise - 30 * tau;
        const [x, y, sc] = projP(e, X, Y, p[2]), rad = (10 + 46 * f) * sc * (0.5 + 0.7 * rise);
        ctx.globalAlpha = 0.55 * fade * (1 - 0.45 * f); ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // the swell before the breach: a lighter patch where it will come up
    if (t > 2.9 && t < 3.7) {
      const [x, y, s] = projP(e, WH.Q[0], SEA_Y, WH.Q[2]), k = smooth((t - 2.9) / 0.5) * (1 - smooth((t - 3.45) / 0.2));
      ctx.fillStyle = '#86b5b6';
      for (let j = 0; j < 3; j++) {
        ctx.globalAlpha = 0.16 * k; ctx.beginPath(); ctx.ellipse(x, y, (150 - 40 * j) * s * (0.6 + 0.4 * k), (30 - 8 * j) * s, 0, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // foam collar where the body pierces the surface
    if (wh && wh.collar) {
      const { x, y, hw, s, a } = wh.collar, r2 = rand(77);
      ctx.fillStyle = C.foam;
      for (let j = 0; j < 22; j++) {
        const u = j / 21, xx = x + (u * 2 - 1) * hw * 1.25, w = Math.sin(Math.PI * u);
        const rad = (6 + 14 * r2()) * s * (0.6 + 0.6 * w), yy = y + (r2() - 0.5) * 8 * s + 4 * s * Math.sin(t * 7 + j);
        ctx.globalAlpha = a * (0.55 + 0.4 * r2()); ctx.beginPath(); ctx.ellipse(xx, yy, rad * 1.6, rad * 0.7, 0, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // crowns: the breach and the slap lift a lobed wall of water that leans outward and falls
    for (const [t0, dur, X, Z, w0, h0, seed] of [[3.44, 0.95, WH.Q[0], WH.Q[2], 300, 300, 5], [TB.impact - 0.03, 1.35, SLAP[0], SLAP[1], 760, 430, 9]]) {
      const tau = t - t0; if (tau <= 0 || tau > dur) continue;
      const p = tau / dur, [x, y, s] = projP(e, X, SEA_Y, Z);
      const w = w0 * s * (0.8 + 0.5 * p), hgt = h0 * s * Math.sin(Math.PI * Math.min(1, Math.pow(p, 0.6) * 1.02)), a = 0.92 * (1 - p * p);
      if (hgt < 2) continue;
      // rounded columns of water, taller in the middle, leaning outward as they rise, over a translucent wall
      const r3 = rand(seed), n = 9, cw = w / n;
      const cg = ctx.createLinearGradient(0, y - hgt, 0, y + 8 * s);
      cg.addColorStop(0, `rgba(246,251,250,${a})`); cg.addColorStop(0.55, `rgba(220,239,238,${a * 0.85})`); cg.addColorStop(1, `rgba(160,200,206,${a * 0.45})`);
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.ellipse(x, y, w * 0.5, hgt * 0.42, 0, Math.PI, TAU); ctx.fill();
      for (let j = 0; j < n; j++) {
        const um = (j + 0.5) / n, env = Math.pow(Math.sin(Math.PI * um), 0.8), hh = hgt * env * (0.55 + 0.45 * r3());
        const lean = (um - 0.5) * 0.9 * hh * p, xb = x + (um - 0.5) * w, rad = cw * (0.32 + 0.18 * r3()) * (1 - 0.35 * p);
        const xt = xb + lean, yt = y - hh;
        ctx.beginPath();
        ctx.moveTo(xb - rad * 1.3, y + 6 * s);
        ctx.quadraticCurveTo(xb - rad * 1.1, y - hh * 0.4, xt - rad, yt);
        ctx.arc(xt, yt, rad, Math.PI, TAU);
        ctx.quadraticCurveTo(xb + rad * 1.1, y - hh * 0.4, xb + rad * 1.3, y + 6 * s);
        ctx.fill();
        // a drop breaking off the top of each column
        const dy = hh * 0.25 * p, dr = rad * 0.55 * (1 - p * 0.5);
        if (p > 0.2) { ctx.beginPath(); ctx.arc(xt + lean * 0.25, yt - rad - dy - dr, dr, 0, TAU); ctx.fill(); }
      }
      // white water on the surface where it came down, in broken patches
      ctx.fillStyle = C.foam;
      const r4 = rand(seed + 1);
      for (let j = 0; j < 16; j++) {
        const u = r4() * 2 - 1, rx = (14 + 30 * r4()) * s * (w0 > 400 ? 1.6 : 1), ry = rx * 0.32;
        ctx.globalAlpha = (0.55 + 0.4 * r4()) * (1 - p);
        ctx.beginPath(); ctx.ellipse(x + u * w * 0.5, y + (r4() - 0.4) * 22 * s, rx * (1 - 0.4 * Math.abs(u)), ry, 0, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // foam patches that linger and thin out
    for (const [t0, X, Z, w] of [[3.5, WH.Q[0], WH.Q[2], 300], [TB.impact + 0.3, SLAP[0], SLAP[1], 760]]) {
      const tau = t - t0; if (tau <= 0) continue;
      const [x, y, s] = projP(e, X, SEA_Y, Z), a = 0.6 * Math.exp(-tau * 0.55) * smooth(tau / 0.3);
      if (a < 0.01) continue;
      const r3 = rand(Math.round(X));
      ctx.fillStyle = C.foam;
      for (let j = 0; j < 30; j++) {
        const xx = x + (r3() - 0.5) * w * s * (1 + 0.25 * tau), yy = y + (r3() - 0.5) * 50 * s * (1 + 0.2 * tau), rad = (5 + 16 * r3()) * s;
        ctx.globalAlpha = a * (0.4 + 0.6 * r3()); ctx.beginPath(); ctx.ellipse(xx, yy, rad * 1.8, rad * 0.55, 0, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // in-picture drops (and the outward ones while they are still behind the plane)
    this.drawDrops(t, e, false);
  },

  /** drops: front = Z > 0 (over everything), back = Z ≤ 0 (inside the picture, under the bars) */
  drawDrops(t, e, front) {
    const ctx = this.ctx;
    for (const d of this.drops) {
      const tau = t - d.t0;
      if (tau <= 0) continue;
      if (d.kind === 'out' && tau >= d.tl) continue;
      const P = dropAt(d, tau);
      if (d.kind === 'in' && P[1] > SEA_Y + 10) continue;
      if ((P[2] > 0) !== front) continue;
      const [x, y, s] = projP(e, P[0], P[1], P[2]);
      const vx = d.v[0] + d.g[0] * tau, vy = d.v[1] + d.g[1] * tau;
      const sp = Math.hypot(vx, vy), ang = Math.atan2(vy, vx), rad = d.r * s, len = rad + Math.min(22, sp * 0.011) * s;
      const a = d.kind === 'in' ? clamp((SEA_Y + 10 - P[1]) / 40) : 1;
      if (!front) {
        ctx.globalAlpha = a * 0.85; ctx.fillStyle = C.drop; ctx.beginPath(); ctx.ellipse(x, y, len, rad, ang, 0, TAU); ctx.fill();
        continue;
      }
      // a drop in front: a pale bead with a darker lower edge and a bright point
      ctx.globalAlpha = a;
      ctx.fillStyle = '#9fc4c8'; ctx.beginPath(); ctx.ellipse(x, y, len, rad, ang, 0, TAU); ctx.fill();
      ctx.fillStyle = '#eef7f6'; ctx.beginPath(); ctx.ellipse(x - rad * 0.12, y - rad * 0.16, len * 0.86, rad * 0.8, ang, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x - rad * 0.32, y - rad * 0.34, rad * 0.26, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  },
  dropShadows(t) {
    const ctx = this.ctx;
    for (const d of this.drops) {
      if (d.kind !== 'out') continue;
      const tau = t - d.t0; if (tau <= 0 || tau >= d.tl) continue;
      const P = dropAt(d, tau); if (P[2] <= 0) continue;
      const [sx, sy] = shadowOf(P[0], P[1], P[2]), pen = LIGHT.W * P[2] / (LIGHT.H - P[2]);
      const R = Math.hypot(d.r, pen * 0.5);
      ctx.globalAlpha = shadowAlpha(P[2]) * clamp((d.r / R) ** 2 * 1.6 + 0.08);
      ctx.drawImage(this.dot, sx - R * 1.2, sy - R * 1.2, R * 2.4, R * 2.4);
    }
    ctx.globalAlpha = 1;
  },
  drawStains(t) {
    const ctx = this.ctx;
    for (const d of this.drops) {
      if (d.kind !== 'out') continue;
      const tau = t - d.t0 - d.tl; if (tau < 0) continue;
      const [x, y] = d.land;
      if (inRect(WIN, x, y)) continue;
      const grow = ease.outCubic(clamp(tau / 0.12)), R = d.r * (2.5 + 0.4 * Math.sin(d.r * 9)) * (0.5 + 0.5 * grow);
      const rot = d.r * 3.1, fresh = Math.exp(-tau * 2.2);
      if (d.surf === 'frame') {
        ctx.fillStyle = `rgba(150,180,205,${0.18 + 0.2 * fresh})`; ctx.beginPath(); ctx.ellipse(x, y, R * 0.75, R * 0.65, rot, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgba(235,244,248,${0.35 + 0.4 * fresh})`; ctx.beginPath(); ctx.arc(x - R * 0.22, y - R * 0.22, R * 0.2, 0, TAU); ctx.fill();
        continue;
      }
      // the drop sits on the paper for a moment, then soaks in: darker paper with a tide line and a few flecks
      ctx.fillStyle = `rgba(118,94,60,${0.08 + 0.05 * fresh})`; ctx.beginPath(); ctx.ellipse(x, y, R, R * 0.88, rot, 0, TAU); ctx.fill();
      ctx.strokeStyle = `rgba(104,82,52,${0.17 + 0.08 * fresh})`; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = 'rgba(118,94,60,0.13)';
      for (let j = 0; j < 3; j++) {
        const an = rot * 2 + j * 2.2, dd = R * (1.4 + 0.3 * j) * grow;
        ctx.beginPath(); ctx.arc(x + Math.cos(an) * dd, y + Math.sin(an) * dd, R * (0.14 - 0.03 * j), 0, TAU); ctx.fill();
      }
      if (fresh > 0.03) {
        ctx.fillStyle = `rgba(214,234,236,${0.75 * fresh})`; ctx.beginPath(); ctx.ellipse(x, y, R * 0.62, R * 0.52, rot, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${0.9 * fresh})`; ctx.beginPath(); ctx.arc(x - R * 0.2, y - R * 0.18, R * 0.16, 0, TAU); ctx.fill();
      }
    }
  },

  // ---------------------------------------------------------------- the whale: colour, z-buffer, mattes, shadow
  buildWhale(t, e) {
    const ps = WH.pose(t);
    if (ps.vis < 0.003) return null;
    const g = WH.project(ps, e[0], e[1]);
    const pad = 40, bb = [Math.max(0, Math.floor(g.bbox[0] - pad)), Math.max(0, Math.floor(g.bbox[1] - pad)), Math.min(W, Math.ceil(g.bbox[2] + pad)), Math.min(H, Math.ceil(g.bbox[3] + pad))];
    bb[0] -= bb[0] % 2; bb[1] -= bb[1] % 2; bb[2] += bb[2] % 2; bb[3] += bb[3] % 2;
    if (bb[2] <= bb[0] || bb[3] <= bb[1]) return null;
    const wc = this.wc.ctx;
    reset(wc); wc.clearRect(0, 0, W, H);
    WH.drawWhale(wc, g, {
      rim: (Z) => {
        const k = smooth((Z + 80) / 160);
        return `rgba(${Math.round(lerp(255, 255, k))},${Math.round(lerp(158, 242, k))},${Math.round(lerp(128, 222, k))},${lerp(0.55, 0.65, k)})`;
      },
    });
    // aerial haze on what is far behind the plane, along the body
    wc.globalCompositeOperation = 'source-atop';
    const hg = wc.createLinearGradient(g.x[0], g.y[0], g.x[NS], g.y[NS]);
    for (let k = 0; k <= 4; k++) { const i = Math.round((k / 4) * NS); hg.addColorStop(k / 4, `rgba(108,150,158,${0.3 * clamp(-g.Z[i] / (1.6 * V))})`); }
    wc.fillStyle = hg; wc.fillRect(bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]);
    // under water: below the waterline the body sinks into the sea colour
    const wl = WH.waterline(ps), Zr = wl ? wl.Z : ps.P[(NS >> 1) * 3 + 2], sR = sOf(Zr), yw = e[1] + (SEA_Y - e[1]) * sR;
    const anyUnder = ps.P.some((v, i) => i % 3 === 1 && v > SEA_Y);
    if (anyUnder) {
      const ug = wc.createLinearGradient(0, yw - 2, 0, yw + 0.2 * LEN * sR);
      ug.addColorStop(0, 'rgba(31,72,92,0.6)'); ug.addColorStop(0.1, 'rgba(31,72,92,0.8)'); ug.addColorStop(0.5, 'rgba(24,54,76,0.95)'); ug.addColorStop(1, 'rgba(22,50,72,1)');
      wc.fillStyle = ug; wc.fillRect(bb[0], yw - 2, bb[2] - bb[0], Math.max(0, bb[3] - yw + 2));
    }
    wc.globalCompositeOperation = 'source-over';

    // per-pixel depth: rasterise the mesh, grow it a little, test against the plane
    const zb = this.zb, M = g.mesh;
    clearBuf(zb);
    // depth per vertex; anything below the sea surface belongs to the picture, whatever its Z
    const zat = new Float32Array(M.wv.length / 3);
    for (let k = 0; k < zat.length; k++) zat[k] = M.wv[k * 3 + 1] > SEA_Y + 8 ? Math.min(M.wv[k * 3 + 2], -40) : M.wv[k * 3 + 2];
    rasterMax(zb, M.sv, zat, M.tri);
    dilate(zb, 4, this.ztmp);
    mattes(zb, this.imF, this.imB);
    const [mx0, my0, mx1, my1] = zb.bb;
    for (const [cv, im] of [[this.mF, this.imF], [this.mB, this.imB]]) {
      reset(cv.ctx); cv.ctx.clearRect(0, 0, W / 2, H / 2);
      if (mx1 >= mx0) cv.ctx.putImageData(im, 0, 0, mx0, my0, mx1 - mx0 + 1, my1 - my0 + 1);
    }
    const bw = bb[2] - bb[0], bh = bb[3] - bb[1];
    for (const [L, mask] of [[this.fc, this.mF], [this.bc, this.mB]]) {
      const c = L.ctx;
      reset(c); c.clearRect(0, 0, W, H);
      c.drawImage(this.wc.c, bb[0], bb[1], bw, bh, bb[0], bb[1], bw, bh);
      c.globalCompositeOperation = 'destination-in'; c.imageSmoothingQuality = 'low';
      c.drawImage(mask.c, bb[0] / 2, bb[1] / 2, bw / 2, bh / 2, bb[0], bb[1], bw, bh);
      c.globalCompositeOperation = 'source-over';
    }
    let front = false;
    for (let k = 0; k < zat.length; k++) if (zat[k] > 0) { front = true; break; }

    // shadow of the front part on the plane: project every vertex from the light, rasterise its height
    let shadowOn = false;
    if (front) {
      const sb = this.sb, S = this.shadow, sv = new Float64Array(zat.length * 2);
      for (let k = 0; k < zat.length; k++) { const p = shadowOf(M.wv[k * 3], M.wv[k * 3 + 1], Math.max(0, zat[k])); sv[k * 2] = p[0]; sv[k * 2 + 1] = p[1]; }
      fillAll(sb);
      rasterMax(sb, sv, zat, M.tri, 0);
      for (let i = 0; i < S.cov.length; i++) { const h = sb.v[i]; if (h > 0) { S.cov[i] = 1; S.hcov[i] = h; } else { S.cov[i] = 0; S.hcov[i] = 0; } }
      pcss(S, this.shImg);
      reset(this.shC.ctx); this.shC.ctx.clearRect(0, 0, S.w, S.h); this.shC.ctx.putImageData(this.shImg, 0, 0);
      shadowOn = true;
    }
    // where the body meets the water (for the foam collar)
    let collar = null;
    if (wl && t > 0.9) {
      const [x, y, s] = projP(e, wl.X, SEA_Y, wl.Z), i = wl.i;
      const hw = WH.RADIUS[Math.min(NS, i)] * s * 1.1;
      const a = t < TB.gone ? 0.7 : t < TB.impact ? 0.9 * smooth((t - 3.4) / 0.1) : 0.6 * (1 - smooth((t - TB.impact) / 0.4));
      if (a > 0.01) collar = { x, y, hw: Math.max(hw, 30 * s), s, a };
    }
    return { g, bb, vis: ps.vis, yw, front, shadowOn, collar, ps };
  },

  // ---------------------------------------------------------------- frame
  frame(t) {
    const ctx = this.ctx;
    reset(ctx);
    const e = eye(t);
    const wh = this.buildWhale(t, e);

    // 1. picture world, then the page with the window cut out over it (the mat hides whatever lies outside)
    ctx.fillStyle = C.sea3; ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
    this.drawPicture(t, e, wh);
    ctx.drawImage(this.page.c, 0, 0);

    // 2. the bars: the screen plane, drawn down the picture at the start
    for (let b = 0; b < 2; b++) {
      const p = ease.outCubic(clamp((t - 0.55 - b * 0.12) / 0.55));
      if (p <= 0) continue;
      const hh = WIN.h * p;
      ctx.drawImage(this.bar.c, 0, 0, BAR_W + 24, hh + 14, BARS[b] - BAR_W / 2 - 10, WIN.y - 10, BAR_W + 24, hh + 14);
    }

    // 3. on the plane: stains of drops that landed, then the shadow of everything in front
    this.drawStains(t);
    if (wh && wh.shadowOn) {
      ctx.globalAlpha = wh.vis; ctx.drawImage(this.shC.c, 0, 0, W, H); ctx.globalAlpha = 1;
    }
    this.dropShadows(t);

    // 4. in front of the plane: the whale's front part and the drops between it and the viewer
    if (wh && wh.front) {
      const [x0, y0, x1, y1] = wh.bb;
      ctx.globalAlpha = wh.vis; ctx.drawImage(this.fc.c, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); ctx.globalAlpha = 1;
    }
    this.drawDrops(t, e, true);

    // 5. the gauge, captions, fade-in
    this.drawGauge(t);
    for (const cap of this.caps) {
      if (t < cap.t0 - 0.01 || t > cap.t1 + 0.3) continue;
      cap.lines.forEach((ln, i) => {
        const t0 = cap.t0 + i * 0.1, p = ease.outExpo(clamp((t - t0) / 0.7)), out = ease.inCubic(clamp((t - cap.t1) / 0.26));
        const a = clamp((t - t0) / 0.3) * (1 - out);
        if (a < 0.003) return;
        ctx.globalAlpha = a; ctx.drawImage(ln.c, FR.x - ln.ox, ln.y - ln.oy + (1 - p) * 30 - out * 22);
      });
      ctx.globalAlpha = 1;
    }
    const fade = 1 - ease.outCubic(clamp(t / 0.6));
    if (fade > 0.002) { ctx.globalAlpha = fade; ctx.fillStyle = C.page; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  },

  drawGauge(t) {
    const ctx = this.ctx, a = smooth((t - 0.9) / 0.4);
    if (a <= 0.003) return;
    ctx.globalAlpha = a;
    // axis, the plane as a tiny white bar, the eye
    ctx.strokeStyle = rgba(C.ink, 0.28); ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(GA.x0, GA.y); ctx.lineTo(GA.x1 - 26, GA.y); ctx.stroke();
    const cross = Math.exp(-(((t - 4.02) / 0.12) ** 2));
    if (cross > 0.01) { ctx.globalAlpha = a * 0.5 * cross; ctx.drawImage(this.dot, GA.xs - 28, GA.y - 40, 56, 56); ctx.globalAlpha = a; }
    ctx.fillStyle = C.white; ctx.strokeStyle = rgba(C.ink, 0.55); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(GA.xs - 5, GA.y - 50, 10, 64, 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = rgba(C.ink, 0.6); ctx.lineWidth = 2;
    const ex = GA.x1 - 8, ey = GA.y - 12;
    ctx.beginPath(); ctx.moveTo(ex - 13, ey); ctx.quadraticCurveTo(ex - 3, ey - 9, ex + 7, ey - 2); ctx.moveTo(ex - 13, ey); ctx.quadraticCurveTo(ex - 3, ey + 9, ex + 7, ey + 2); ctx.stroke();
    ctx.fillStyle = rgba(C.ink, 0.6); ctx.beginPath(); ctx.arc(ex - 5, ey, 2.6, 0, TAU); ctx.fill();
    const [tIn, tPl, tOut] = this.gtxt;
    ctx.drawImage(tIn.c, GA.x0 - tIn.ox, GA.y + 34 - tIn.oy);
    ctx.drawImage(tPl.c, GA.xs - tPl.w / 2 - tPl.ox, GA.y + 34 - tPl.oy);
    ctx.drawImage(tOut.c, GA.xs + 44 - tOut.ox, GA.y + 34 - tOut.oy);
    // the nose: a dot with a short trail
    const pts = [];
    for (let k = 14; k >= 0; k--) {
      const tk = t - k * 0.04;
      if (tk < 0.85) continue;
      const ps = WH.pose(tk);
      if (ps.vis < 0.05) continue;
      const n = WH.nose(ps); pts.push([gaugeX(n[2]), gaugeY(n[1]), ps.vis, k]);
    }
    if (pts.length > 1) {
      ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      for (let k = 1; k < pts.length; k++) {
        ctx.globalAlpha = a * 0.35 * (1 - pts[k][3] / 15) * pts[k][2];
        ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(pts[k - 1][0], pts[k - 1][1]); ctx.lineTo(pts[k][0], pts[k][1]); ctx.stroke();
      }
    }
    const last = pts[pts.length - 1];
    if (last && last[3] === 0) {
      const ps = WH.pose(t), n = WH.nose(ps), out = smooth(n[2] / 40);
      ctx.globalAlpha = a * last[2];
      ctx.fillStyle = mixc(C.ink, C.white, out); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(last[0], last[1], 7, 0, TAU); ctx.fill(); if (out > 0.02) ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
});

/** a soft scrim of warm ink under the harness caption (bottom 19 % of the stage): the white caption reads on the cream page */
function captionScrim(api, rgb) {
  const el = api.layer('div', { z: 999 });
  el.style.background = `linear-gradient(to bottom, rgba(${rgb},0) 81%, rgba(${rgb},.42) 88.5%, rgba(${rgb},.72) 100%)`;
  el.style.pointerEvents = 'none';
}
