/*
 * 118 · 점 하나로 여는 무대 — the opening titles of an imaginary design conference ("온점", the Korean full stop),
 * played on one fixed LED dot grid. 6,283 dots (pitch 20 px) are the only drawing element of the picture: every frame,
 * each dot's radius, colour and a small offset are a function of fields evaluated at its grid position.
 *
 *   power-on front → one accent dot → 점 (circle) → 선 (capsule) → 면 (rounded rect): one rounded-box SDF whose
 *   half-size and corner radius are keyframed → a cursor icon (polygon SDF) slides in and clicks → a radial wipe front
 *   carves the plane into the word 온점 (a signed-distance field of the type, baked in setup); every dot collapses and
 *   re-pops on a damped spring as the front passes → the accent full stop pops and sends a radial echo up through the letters → the camera
 *   pushes into the full stop until the dots are big LED circles (scale-aware drawing: lens highlight and rim appear only
 *   when a dot is big on screen) and the stop grows into the conference mark.
 * Crisp screen-space type (header, stage chips, tagline, lockup) is paired with the dot type for contrast.
 *
 * Determinism: nothing accumulates. Per-dot arrival times of the fronts and the type distance field are baked in
 * setup; everything else is a closed form of t (springs, pulses, hashed value noise). The 2D context state is reset
 * at the start of every frame; the sprites are baked once and drawn once in setup.
 */
import { defineDemo, clamp, lerp, smooth, ease } from '../_lib/stage.js';
import { FONTS, fontReady, textAlpha, signedDistance } from '../_lib/type.js';

const D = 10;
const TAU = Math.PI * 2;
const KR = `"${FONTS.pretendard.family}"`, MONO = `"${FONTS.jetbrainsMono.family}"`;

// ---------------------------------------------------------------- grid
const PITCH = 20;
const GX = 540, GY = 880;                       // a dot sits exactly here: the ignition point, centre of the shapes
const IX0 = -30, IX1 = 30, IY0 = -47, IY1 = 55; // x −60…1140, y −60…1980 (margin for drift, punch and shake)
const R_OFF = 2.8, R_LIT = 9.2;                 // off LED / fully lit LED radius (1.6 px gap at pitch 20)
const SOFT = 15;                                // half-width of the size ramp across a field edge (0.75 pitch)

// ---------------------------------------------------------------- palette (rgba — a dot mixes off → lit → accent)
const OFF_DARK = [118, 124, 150, 0.17], OFF_ON = [168, 182, 255, 0.22];
const LIT = [248, 244, 236, 1], ACC = [255, 92, 46, 1];
const BG_DARK = '#05060b', BG_IN = '#2129a8', BG_MID = '#141a7e', BG_OUT = '#070a36';

// ---------------------------------------------------------------- timeline (s)
const T_IGN = 0.3, T_POW = 0.55;                // one dot, then the panel powers on
const T_DOT = 0.95, T_LINE = 1.95, T_PLANE = 2.6;
const T_CUR = 3.2, T_CLICK = 4.05;              // cursor in, click = wipe front origin
const T_STOP = 5.0, T_TAG = 5.15, T_ECHO = 5.15, ECHO_V = 700;   // the stop's echo: two rings, 0.38 s apart
const T_OUT = 6.85, T_PUSH0 = 6.95, T_PUSH1 = 8.75, T_GROW = 7.7, T_DIM = 7.7, T_MARK = 8.6, T_LOCK = 8.5;
const Z1 = 3.3;                                 // push-in zoom
const STAGES = [[T_DOT, '01', '점', 'POINT'], [T_LINE, '02', '선', 'LINE'], [T_PLANE, '03', '면', 'PLANE'], [T_CLICK + 0.05, '04', '글', 'TYPE']];

// ---------------------------------------------------------------- motion primitives (closed forms)
// damped spring step response: 0 → 1 with ~32 % overshoot, settles in ~0.8 s
const SW = TAU * 2.3, SZ = 0.34, SWD = SW * Math.sqrt(1 - SZ * SZ);
function spring(u) {
  if (u <= 0) return 0;
  return 1 - Math.exp(-SZ * SW * u) * (Math.cos(SWD * u) + (SZ * SW / SWD) * Math.sin(SWD * u));
}
const pulse = (u, w = 0.07) => (u <= 0 ? 0 : (u / w) * Math.exp(1 - u / w));   // peak 1 at u = w, then decays
const cover = (d) => smooth(0.5 - d / (2 * SOFT));                              // signed distance → dot size 0..1
const win = (t, a, b, f = 0.15) => smooth((t - a) / f) * (1 - smooth((t - b) / f));

function hash2(ix, iy) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  let fx = x - ix, fy = y - iy;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

// ---------------------------------------------------------------- shape fields
function sdRoundBox(px, py, bx, by, r) {
  const qx = Math.abs(px) - bx, qy = Math.abs(py) - by;
  const ox = qx > 0 ? qx : 0, oy = qy > 0 ? qy : 0;
  return Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(qx, qy), 0) - r;
}
// pointer arrow, tip at (0, 0), height 1 (y down)
const CURSOR = [0, 0, 0, 0.80, 0.19, 0.635, 0.315, 0.925, 0.445, 0.865, 0.325, 0.585, 0.575, 0.585];
function sdPoly(px, py, V) {
  const n = V.length / 2;
  let d = (px - V[0]) ** 2 + (py - V[1]) ** 2, s = 1;
  for (let i = 0, j = n - 1; i < n; j = i, i++) {
    const vix = V[2 * i], viy = V[2 * i + 1], ex = V[2 * j] - vix, ey = V[2 * j + 1] - viy;
    const wx = px - vix, wy = py - viy;
    const h = clamp((wx * ex + wy * ey) / (ex * ex + ey * ey));
    const bx = wx - ex * h, by = wy - ey * h;
    d = Math.min(d, bx * bx + by * by);
    const c1 = py >= viy, c2 = py < V[2 * j + 1], c3 = ex * wy > ey * wx;
    if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
  }
  return s * Math.sqrt(d);
}

/** 점 → 선 → 면: one rounded box, keyframed. Returns [bx, by, r, rot, accent]. */
function shapeAt(t) {
  let bx = 0, by = 0, r = -80, rot = 0, acc = 1;
  if (t >= T_IGN) r = 8 * spring(t - T_IGN);                                     // a single dot pops
  if (t >= T_DOT) r = lerp(8, 140, ease.outBack(clamp((t - T_DOT) / 0.6), 1.6)); // 점
  r += 5 * Math.sin(TAU * (t - 1.55) / 0.8) * win(t, 1.55, 1.95, 0.1);           // breathing hold
  if (t >= T_LINE) {                                                             // 선: stretch into a capsule, tilt
    const p = ease.inOutCubic(clamp((t - T_LINE) / 0.6));
    bx = 360 * p; r = lerp(140, 42, p); rot = -0.2 * p; acc = 1 - p;
  }
  if (t >= T_PLANE) {                                                            // 면: open into a rounded plane
    const q = clamp((t - T_PLANE) / 0.65), e = ease.outBack(q, 1.3), c = ease.outCubic(q);
    by = 500 * e; bx = lerp(360, 350, c); r = lerp(42, 64, c); rot = -0.2 * (1 - c); acc = 0;
  }
  return [bx, by, r, rot, acc];
}
function cursorAt(t) {
  const p = ease.outExpo(clamp((t - T_CUR) / 0.7));
  const s = 230 * (1 - 0.15 * Math.sin(Math.PI * clamp((t - (T_CLICK - 0.11)) / 0.22)));   // click squash
  return [lerp(1080, 600, p), lerp(1800, 990, p), s];
}

// ---------------------------------------------------------------- crisp type helpers (screen space)
/** one line in a line mask: k = entrance 0→1 (rises in), o = exit 0→1 (leaves upward) */
function maskLine(ctx, parts, x, y, h, k, o, align = 'left') {
  if (k <= 0 || o >= 1) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, y - h * 1.02, 1080, h * 1.34); ctx.clip();
  const dy = (1 - k) * h * 1.15 - o * h * 1.15;
  let w = 0;
  for (const p of parts) { ctx.font = p.font; ctx.letterSpacing = p.ls || '0px'; p.w = ctx.measureText(p.s).width; w += p.w; }
  let px = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  for (const p of parts) {
    ctx.font = p.font; ctx.letterSpacing = p.ls || '0px'; ctx.fillStyle = p.color;
    ctx.fillText(p.s, px, y + dy);
    px += p.w;
  }
  ctx.restore();
}
const inK = (t, t0, d = 0.6) => ease.outExpo(clamp((t - t0) / d));
const outK = (t, t0, d = 0.3) => { const p = clamp((t - t0) / d); return p * p; };   // power2.in

defineDemo({
  id: '118-dot-matrix',
  title: '점 하나로 여는 무대',
  tech: '점 격자 모션 · 점의 크기와 색으로 그리는 도형과 글자',
  duration: D,
  background: BG_DARK,

  async setup(api) {
    await Promise.all([
      fontReady(`900 320px ${KR}`, '온점'),
      fontReady(`800 70px ${KR}`, '온점 디자인 컨퍼런스점선면글'),
      fontReady(`700 46px ${KR}`, '모든 디자인은 점 하나에서 시작한다'),
      fontReady(`600 22px ${MONO}`, 'ONJEOM DESIGN CONFERENCE 2026 OPENING POINT LINE PLANE TYPE 0123456789:.—·'),
    ]);
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = ctx;

    // --- the word 온점 → coverage → signed distance (half resolution of the world, sampled once per dot)
    const S = 0.5, RW = 540, RH = 960, FS = 320;   // raster px; FS 320 = 640 world px
    const lay = {};
    const alpha = textAlpha(RW, RH, (c) => {
      c.font = `900 ${FS}px ${KR}`;
      const m1 = c.measureText('온'), m2 = c.measureText('점');
      const h1 = m1.actualBoundingBoxAscent + m1.actualBoundingBoxDescent;
      const h2 = m2.actualBoundingBoxAscent + m2.actualBoundingBoxDescent;
      const gap = FS * 0.07, top = GY * S - (h1 + gap + h2) / 2;
      const cx = 515 * S;
      const x1 = cx - (m1.actualBoundingBoxRight - m1.actualBoundingBoxLeft) / 2;
      const x2 = cx - (m2.actualBoundingBoxRight - m2.actualBoundingBoxLeft) / 2;
      const b1 = top + m1.actualBoundingBoxAscent, b2 = top + h1 + gap + m2.actualBoundingBoxAscent;
      c.fillText('온', x1, b1);
      c.fillText('점', x2, b2);
      lay.top = top / S; lay.bottom = (b2 + m2.actualBoundingBoxDescent) / S;
      lay.left = Math.min(x1 - m1.actualBoundingBoxLeft, x2 - m2.actualBoundingBoxLeft) / S;
      lay.right2 = (x2 + m2.actualBoundingBoxRight) / S;
      lay.right = Math.max(x1 + m1.actualBoundingBoxRight, lay.right2 * S) / S;
    });
    const sd = signedDistance(alpha, RW, RH);
    const STOP_R = 52;
    this.STOP = { x: lay.right2 + 30 + STOP_R, y: lay.bottom - STOP_R, r: STOP_R };
    this.lay = lay;
    const sampleSD = (wx, wy) => {
      const fx = wx * S - 0.5, fy = wy * S - 0.5;
      if (fx < 0 || fy < 0 || fx >= RW - 1 || fy >= RH - 1) return 999;
      const ix = Math.floor(fx), iy = Math.floor(fy), ax = fx - ix, ay = fy - iy, i = iy * RW + ix;
      const v = sd[i] * (1 - ax) * (1 - ay) + sd[i + 1] * ax * (1 - ay) + sd[i + RW] * (1 - ax) * ay + sd[i + RW + 1] * ax * ay;
      return v / S;
    };

    // --- the grid and every per-dot constant
    const N = (IX1 - IX0 + 1) * (IY1 - IY0 + 1);
    const WX = new Float32Array(N), WY = new Float32Array(N), TD = new Float32Array(N), DP = new Float32Array(N);
    const TP = new Float32Array(N), TC = new Float32Array(N), TM = new Float32Array(N), UX = new Float32Array(N), UY = new Float32Array(N);
    const CLX = 600, CLY = 990;   // click point = cursor tip at the click
    let n = 0;
    for (let iy = IY0; iy <= IY1; iy++) for (let ix = IX0; ix <= IX1; ix++, n++) {
      const x = GX + ix * PITCH, y = GY + iy * PITCH;
      WX[n] = x; WY[n] = y;
      TD[n] = sampleSD(x, y);
      const nz = vnoise(x / 110, y / 110);
      const d0 = Math.hypot(x - GX, y - GY);
      UX[n] = d0 > 0 ? (x - GX) / d0 : 0; UY[n] = d0 > 0 ? (y - GY) / d0 : 0;
      TP[n] = T_POW + d0 / 1800 + 0.05 * nz;                                           // power-on front
      TC[n] = T_CLICK + 0.03 + Math.hypot(x - CLX, y - CLY) / 1450 + 0.05 * nz;          // click wipe front
      DP[n] = Math.hypot(x - this.STOP.x, y - this.STOP.y);
      TM[n] = T_DIM + DP[n] / 1300 + 0.05 * nz;                                        // the type dims away from the stop
    }
    Object.assign(this, { N, WX, WY, TD, DP, TP, TC, TM, UX, UY, CLX, CLY });
    this.SX = new Float32Array(N); this.SY = new Float32Array(N); this.RR = new Float32Array(N);
    this.GA = new Float32Array(N); this.KEY = new Int16Array(N); this.VIS = new Int32Array(N); this.ORD = new Int32Array(N);

    // --- colour buckets: power 0..3 × lit 0..10 × accent 0..6 (radius stays continuous; only colour is quantized)
    this.COL = [];
    for (let p = 0; p < 4; p++) for (let l = 0; l < 11; l++) for (let a = 0; a < 7; a++) {
      const off = OFF_DARK.map((v, j) => lerp(v, OFF_ON[j], p / 3));
      const c1 = off.map((v, j) => lerp(v, LIT[j], l / 10));
      const c = c1.map((v, j) => lerp(v, ACC[j], a / 6));
      this.COL.push(`rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${c[3].toFixed(3)})`);
    }
    this.CNT = new Int32Array(this.COL.length);

    // --- sprites, baked once: glow (white / accent) and the LED lens (highlight + rim) for big dots
    const mk = (size, draw) => {
      const c = document.createElement('canvas'); c.width = c.height = size;
      draw(c.getContext('2d', api.headless ? { willReadFrequently: true } : undefined), size);
      return c;
    };
    const glow = (rgb) => mk(96, (g, s) => {
      const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(0.25, `rgba(${rgb},.55)`);
      gr.addColorStop(0.6, `rgba(${rgb},.12)`); gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, s, s);
    });
    this.GLOW_W = glow('255,246,232'); this.GLOW_A = glow('255,110,60');
    this.LENS = mk(128, (g, s) => {
      const c = s / 2, R = s / 2;
      g.beginPath(); g.arc(c, c, R, 0, TAU); g.clip();
      let gr = g.createRadialGradient(c + R * 0.18, c + R * 0.22, R * 0.2, c, c, R);     // body: darker toward the lower rim
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.7, 'rgba(0,0,0,0.06)'); gr.addColorStop(1, 'rgba(0,0,20,0.42)');
      g.fillStyle = gr; g.fillRect(0, 0, s, s);
      gr = g.createRadialGradient(c - R * 0.34, c - R * 0.38, 0, c - R * 0.34, c - R * 0.38, R * 0.42);   // specular
      gr.addColorStop(0, 'rgba(255,255,255,0.62)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, s, s);
      g.lineWidth = s * 0.035; g.strokeStyle = 'rgba(255,255,255,0.20)';                 // thin bright lip
      g.beginPath(); g.arc(c, c, R * 0.93, Math.PI * 1.05, Math.PI * 1.55); g.stroke();
    });
    // first composite of each sprite happens here, not in a frame
    for (const sp of [this.GLOW_W, this.GLOW_A, this.LENS]) ctx.drawImage(sp, 0, 0, 40, 40);
    ctx.clearRect(0, 0, 1080, 1920);
  },

  /** world → screen: screen = (w − Q)·z + S, Q = the full stop (the push-in pivot) */
  camera(t) {
    const Q = this.STOP;
    let z = 1 + 0.018 * smooth((t - 4.3) / 2.6);                     // slow drift while the word holds
    const p = ease.inOutCubic(clamp((t - T_PUSH0) / (T_PUSH1 - T_PUSH0)));
    z *= Math.pow(Z1, p);
    z *= 1 + 0.035 * smooth((t - T_PUSH1) / (D - T_PUSH1));           // keeps creeping in afterwards
    const pc = t - T_CLICK, pm = t - T_MARK;
    if (pc > 0) z *= 1 + 0.03 * pulse(pc, 0.06);                       // punch at the click
    if (pm > 0) z *= 1 + 0.02 * pulse(pm, 0.07);
    let sx = lerp(Q.x, 540, p), sy = lerp(Q.y, 790, p);
    sx += 1.8 * Math.sin(t * 1.3) + 0.9 * Math.sin(t * 2.7 + 1.0);     // handheld
    sy += 1.5 * Math.sin(t * 1.1 + 2.0) + 0.8 * Math.sin(t * 3.1);
    if (pc > 0) { const a = 7 * Math.exp(-pc * 9); sx += a * Math.sin(pc * 57); sy += 0.6 * a * Math.cos(pc * 49); }
    return { z, qx: Q.x, qy: Q.y, sx, sy };
  },

  frame(t) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); ctx.letterSpacing = '0px';
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'low';

    const cam = this.camera(t), z = cam.z;
    const toX = (x) => (x - cam.qx) * z + cam.sx, toY = (y) => (y - cam.qy) * z + cam.sy;
    const { N, WX, WY, TD, DP, TP, TC, TM, UX, UY, SX, SY, RR, GA, KEY, VIS, ORD, CNT, STOP } = this;

    // ---- background: dark panel, the cobalt field floods out with the power-on front
    ctx.fillStyle = BG_DARK; ctx.fillRect(0, 0, 1080, 1920);
    const rb = (t - T_POW) * 1800;
    if (rb > 0) {
      const gx = toX(GX), gy = toY(GY);
      const g = ctx.createRadialGradient(540, 860, 0, 540, 860, 1350);
      g.addColorStop(0, BG_IN); g.addColorStop(0.5, BG_MID); g.addColorStop(1, BG_OUT);
      ctx.save();
      if (rb < 2400) { ctx.beginPath(); ctx.arc(gx, gy, rb, 0, TAU); ctx.clip(); }
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
      ctx.restore();
    }
    // light behind the composition: cool white behind the type, warm behind the mark
    {
      const k1 = smooth((t - T_PLANE) / 0.6) * (1 - smooth((t - T_PUSH0) / 1.2));
      const k2 = smooth((t - T_GROW) / 1.0);
      if (k1 > 0.01) {
        const g = ctx.createRadialGradient(toX(540), toY(900), 0, toX(540), toY(900), 760 * z);
        g.addColorStop(0, `rgba(150,170,255,${0.16 * k1})`); g.addColorStop(1, 'rgba(150,170,255,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
      }
      if (k2 > 0.01) {
        const mx = toX(STOP.x), my = toY(STOP.y);
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, 820);
        g.addColorStop(0, `rgba(255,96,52,${0.26 * k2})`); g.addColorStop(0.55, `rgba(255,96,52,${0.07 * k2})`); g.addColorStop(1, 'rgba(255,96,52,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
      }
    }

    // ---- fields → every dot
    const [bx, by, br, rot, acc] = shapeAt(t);
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const [cx, cy, cs] = cursorAt(t);
    const curOn = t > T_CUR;
    const waveAmp = 0.36 * win(t, 2.95, 4.0, 0.35);                   // travelling bands across the plane
    const wantShape = t < T_CLICK + 1.6, wantWord = t > T_CLICK;
    const e1 = (t - T_ECHO) * ECHO_V, e2 = (t - T_ECHO - 0.38) * ECHO_V;   // echo ring radii (px from the stop)
    const eOn = t > T_ECHO && t < T_ECHO + 2.6;
    // the full stop: pops, then grows into the mark during the push
    const rp = STOP.r * spring(t - T_STOP) + 84 * ease.outBack(clamp((t - T_GROW) / 0.95), 1.5);
    const um = t - T_MARK;
    const ringR = rp + um * 300, ringK = um > 0 ? 1 - smooth(um / 1.1) : 0;
    const rOff = R_OFF;
    let nv = 0;
    const PAD = 40;

    for (let i = 0; i < N; i++) {
      const x = WX[i], y = WY[i];
      const up = t - TP[i];
      const pw = smooth(up / 0.3), pb = pulse(up, 0.05);
      let bump = 0.4 * pb, ox = 7 * pb * UX[i], oy = 7 * pb * UY[i];
      const shim = pw * (0.03 + 0.12 * vnoise(x * 0.0065 + t * 0.22, y * 0.0065 - t * 0.09));

      // shapes (before the click front has passed this dot)
      let Ls = 0, As = 0;
      const uc = t - TC[i];
      if (wantShape && uc < 1.0) {
        const dx = x - GX, dy = y - GY;
        let c = cover(sdRoundBox(cr * dx + sr * dy, -sr * dx + cr * dy, bx, by, br));
        if (waveAmp > 0 && c > 0) {
          const ph = (x * 0.8 + y * 0.6) * 0.021 - t * 7.5;
          c *= 1 - waveAmp * (0.5 + 0.5 * Math.sin(ph));
          oy += 3.5 * waveAmp * Math.cos(ph);
        }
        Ls = c * (1 - acc); As = c * acc;
        if (curOn && x > cx - 60 && x < cx + cs * 0.6 + 60 && y > cy - 60 && y < cy + cs + 60) {
          const dc = sdPoly((x - cx) / cs, (y - cy) / cs, CURSOR) * cs - 3;
          const moat = cover(dc - 26);
          Ls *= 1 - moat; As = Math.max(As * (1 - moat), cover(dc));
        }
      }
      // the word, the full stop, the mark
      let Lw = 0, Aw = 0, Lg = 0;
      if (wantWord && uc > -0.05) {
        let d = TD[i];
        const dp = DP[i];
        if (eOn) {   // the full stop's echo: rings run out from it through the letters
          const q1 = (dp - e1) / 55, q2 = (dp - e2) / 55;
          const g = (Math.exp(-q1 * q1) + 0.6 * Math.exp(-q2 * q2)) * (1 - smooth(dp / 1500));
          d -= 6 * g; bump += 0.22 * g;
          Aw = 0.45 * g * cover(d);
          Lg = 0.32 * g;                                                 // the ring also lifts the off LEDs
          if (dp > 0) { ox += 4 * g * (x - STOP.x) / dp; oy += 4 * g * (y - STOP.y) / dp; }
        }
        Lw = cover(d) * (1 + 0.05 * Math.sin((x * 0.6 - y * 0.8) * 0.02 + t * 3.2));   // the type breathes a little
        const um2 = t - TM[i];
        if (um2 > 0) Lw *= 1 - 0.8 * spring(um2);
        Aw = Math.max(Aw, cover(dp - rp));
        if (um > 0) {
          const rw = 0.5 + 0.5 * Math.cos(TAU * (dp / 150 - um * 1.5));   // rings running out of the mark's centre
          bump += 0.16 * Aw * rw * rw * rw * smooth(um / 0.4);
          if (ringK > 0) Aw = Math.max(Aw, 0.85 * ringK * cover(Math.abs(dp - ringR) - 7));
        }
      }
      // the click front: the plane collapses, the type pops 0.09 s later (two springs)
      const kOut = spring(uc), kIn = spring(uc - 0.09);
      let L = Math.max(Ls * (1 - kOut) + Lw * kIn, Lg);
      let A = As * (1 - kOut) + Aw * kIn;
      const fg = pulse(uc, 0.035);
      A += 0.9 * fg * (1 - clamp(A)); bump += 0.3 * fg;
      L += 0.5 * pb;

      const v = Math.max(L, A, shim);
      let r = ((rOff * (0.72 + 0.28 * pw)) + (R_LIT - rOff) * v) * (1 + bump);
      if (r < 0.2) continue;
      const R = r * z;
      const px = (x + ox - cam.qx) * z + cam.sx, py = (y + oy - cam.qy) * z + cam.sy;
      if (px < -R - PAD || px > 1080 + R + PAD || py < -R - PAD || py > 1920 + R + PAD) continue;
      SX[i] = px; SY[i] = py; RR[i] = R;
      const lq = Math.round(clamp(Math.max(L, shim)) * 10), aq = Math.round(clamp(A) * 6), pq = Math.round(pw * 3);
      KEY[i] = (pq * 11 + lq) * 7 + aq;
      GA[i] = Math.max(clamp(L), clamp(A)) * (aq >= 3 ? -1 : 1);       // sign = glow colour
      VIS[nv++] = i;
    }

    // ---- glow under the dots (additive)
    ctx.globalCompositeOperation = 'lighter';
    for (let j = 0; j < nv; j++) {
      const i = VIS[j], g = GA[i], a = Math.abs(g);
      if (a < 0.12) continue;
      ctx.globalAlpha = 0.17 * a;
      const G = RR[i] * 2.9;
      ctx.drawImage(g < 0 ? this.GLOW_A : this.GLOW_W, SX[i] - G, SY[i] - G, 2 * G, 2 * G);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

    // ---- dots, one path per colour bucket (counting sort by key)
    CNT.fill(0);
    for (let j = 0; j < nv; j++) CNT[KEY[VIS[j]]]++;
    let acc0 = 0;
    for (let k = 0; k < CNT.length; k++) { const c = CNT[k]; CNT[k] = acc0; acc0 += c; }
    for (let j = 0; j < nv; j++) { const i = VIS[j]; ORD[CNT[KEY[i]]++] = i; }
    let s0 = 0;
    for (let k = 0; k < CNT.length; k++) {
      const s1 = CNT[k];
      if (s1 > s0) {
        ctx.fillStyle = this.COL[k];
        ctx.beginPath();
        for (let j = s0; j < s1; j++) { const i = ORD[j], R = RR[i]; ctx.moveTo(SX[i] + R, SY[i]); ctx.arc(SX[i], SY[i], R, 0, TAU); }
        ctx.fill();
      }
      s0 = s1;
    }

    // ---- scale-aware detail: a dot that is big on screen becomes an LED with a lens highlight and a rim
    if (z * R_LIT > 9) {
      for (let j = 0; j < nv; j++) {
        const i = VIS[j], R = RR[i];
        const a = smooth((R - 9) / 14);
        if (a <= 0.01) continue;
        ctx.globalAlpha = a;
        ctx.drawImage(this.LENS, SX[i] - R, SY[i] - R, 2 * R, 2 * R);
      }
      ctx.globalAlpha = 1;
    }

    // ---- impacts (three beats only): ignition ring, click ring + flash, mark ring
    const ring = (x, y, r0, r1, w0, t0, dur, rgb) => {
      const u = (t - t0) / dur;
      if (u <= 0 || u >= 1) return;
      const e = ease.outExpo(u);
      ctx.strokeStyle = `rgba(${rgb},${(1 - u) * (1 - u)})`;
      ctx.lineWidth = lerp(w0, 1, e);
      ctx.beginPath(); ctx.arc(x, y, lerp(r0, r1, e), 0, TAU); ctx.stroke();
    };
    ring(toX(GX), toY(GY), 10, 120, 3, T_IGN, 0.7, '255,120,80');
    ring(toX(this.CLX), toY(this.CLY), 16, 360, 7, T_CLICK, 0.6, '255,120,80');
    ring(toX(STOP.x), toY(STOP.y), rp * z, rp * z + 260, 5, T_MARK, 0.9, '255,236,224');
    if (t > T_CLICK && t < T_CLICK + 0.6) {
      ctx.fillStyle = `rgba(255,236,226,${0.24 * Math.exp(-(t - T_CLICK) / 0.08)})`;
      ctx.fillRect(0, 0, 1080, 1920);
    }

    // bezel shade: the header and the caption area sit on a darker band of the panel
    let g = ctx.createLinearGradient(0, 0, 0, 300);
    g.addColorStop(0, 'rgba(4,5,22,0.62)'); g.addColorStop(1, 'rgba(4,5,22,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 300);
    g = ctx.createLinearGradient(0, 1600, 0, 1920);
    g.addColorStop(0, 'rgba(4,5,22,0)'); g.addColorStop(1, 'rgba(4,5,22,0.6)');
    ctx.fillStyle = g; ctx.fillRect(0, 1600, 1080, 320);

    this.drawType(t);
  },

  /** crisp type: header, stage chips, tagline, lockup — screen space, never zoomed */
  drawType(t) {
    const ctx = this.ctx;
    const W70 = 'rgba(255,255,255,0.78)', W45 = 'rgba(255,255,255,0.42)', ACCS = 'rgb(255,92,46)';

    // header + rule
    const kh = inK(t, 0.15, 0.7);
    maskLine(ctx, [{ s: 'ONJEOM DESIGN CONFERENCE', font: `600 22px ${MONO}`, ls: '3px', color: W70 }], 64, 112, 30, kh, 0);
    const fr = Math.floor(t * 30), tc = `00:${String(Math.floor(fr / 30)).padStart(2, '0')}:${String(fr % 30).padStart(2, '0')}`;
    maskLine(ctx, [{ s: 'OPENING  ', font: `500 22px ${MONO}`, ls: '3px', color: W45 }, { s: tc, font: `600 22px ${MONO}`, ls: '2px', color: W70 }], 1016, 112, 30, inK(t, 0.25, 0.7), 0, 'right');
    const kr = ease.inOutCubic(clamp((t - 0.2) / 0.8));
    if (kr > 0) { ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(64, 136, 952 * kr, 2); }

    // stage chips 01 점 · 02 선 · 03 면 · 04 글 — the active one is white with an accent bar
    let act = -1;
    for (let i = 0; i < STAGES.length; i++) if (t >= STAGES[i][0]) act = i;
    const ko = outK(t, T_OUT, 0.28);
    if (act >= 0 && ko < 1) {
      const CX0 = 64, STEP = 132, Y = 206;
      for (let i = 0; i < STAGES.length; i++) {
        const [t0, num, syl] = STAGES[i];
        const k = inK(t, T_DOT - 0.15 + i * 0.06, 0.6), o = outK(t, T_OUT + i * 0.04, 0.26);
        const on = smooth((t - t0) / 0.18) * (i === act ? 1 : 1 - smooth((t - STAGES[Math.min(i + 1, 3)][0]) / 0.18));
        const col = `rgba(255,255,255,${(0.34 + 0.66 * on).toFixed(3)})`;
        maskLine(ctx, [{ s: num + ' ', font: `500 20px ${MONO}`, ls: '1px', color: on > 0.5 ? ACCS : W45 },
          { s: syl, font: `800 34px ${KR}`, ls: '0px', color: col }], CX0 + i * STEP, Y, 40, k, o);
      }
      // accent bar slides to the active chip
      let bxp = CX0;
      for (let i = 1; i < STAGES.length; i++) bxp = lerp(bxp, CX0 + i * STEP, ease.outExpo(clamp((t - STAGES[i][0]) / 0.45)));
      const kb = inK(t, T_DOT, 0.5) * (1 - ko);
      if (kb > 0) { ctx.fillStyle = ACCS; ctx.fillRect(bxp, 222, 92 * kb, 4); }
      // English gloss of the active stage, right-aligned
      const g = STAGES[act];
      maskLine(ctx, [{ s: g[3], font: `600 22px ${MONO}`, ls: '4px', color: W45 }], 1016, 204, 30, inK(t, g[0], 0.45), Math.max(ko, act < 3 ? outK(t, STAGES[act + 1][0] - 0.12, 0.12) : 0), 'right');
    }

    // the crisp line under the dot type
    maskLine(ctx, [{ s: '모든 디자인은 ', font: `700 46px ${KR}`, ls: '-1px', color: 'rgba(255,255,255,0.92)' },
      { s: '점', font: `800 46px ${KR}`, ls: '-1px', color: ACCS },
      { s: ' 하나에서 시작한다', font: `700 46px ${KR}`, ls: '-1px', color: 'rgba(255,255,255,0.92)' }],
      540, 1572, 56, inK(t, T_TAG, 0.7), outK(t, T_OUT, 0.3), 'center');

    // lockup under the mark
    maskLine(ctx, [{ s: '온점 디자인 컨퍼런스', font: `800 70px ${KR}`, ls: '-2px', color: '#fff' }], 540, 1388, 80, inK(t, T_LOCK, 0.8), 0, 'center');
    maskLine(ctx, [{ s: '2026.11.14', font: `600 26px ${MONO}`, ls: '3px', color: W70 },
      { s: '  —  ', font: `500 26px ${MONO}`, ls: '0px', color: ACCS },
      { s: '11.15', font: `600 26px ${MONO}`, ls: '3px', color: W70 }], 540, 1452, 34, inK(t, T_LOCK + 0.12, 0.8), 0, 'center');
  },
});
