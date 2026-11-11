/*
 * 88 · 날개의 파랑 — a brass magnifier travels over a flat illustration of a blue butterfly on a specimen card.
 * Inside the glass is not a bigger copy but a hidden layer of the same place: the wing as overlapping scales.
 * The glass refracts it (barrel remap, chromatic fringe at the rim, highlight, drop shadow). Then the iris: the lens
 * grows until its circle passes the corners of the frame and the scale world inside becomes the whole scene, zooming
 * ten times further to the ridges on the scales, where white light goes in and only blue comes back. Then it shrinks
 * back out onto the desk.
 *
 * Layers (all built in setup): A = the flat desk illustration (macro units = stage px), B = the scale layer ×5 over the
 * lens path, C1 ×18 and C2 ×60 around the iris point. frame(t) remaps them per pixel inside the lens (CPU, JS) and
 * draws the flat inside of a large lens with drawImage.
 */
import { defineDemo, rand, clamp, lerp, smooth } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';
import { W, H, AW, TAU, PAL, HIND, polyPath, renderDesk, renderBlueMask, makeScales, renderLevel, scaleHalf, ridgeY, N_RIDGE } from './art.js';

const D = 10;
// the motion grammar of the source (GSAP eases used as plain functions of progress)
const ez = (n) => gsap.parseEase(n);
const IO3 = ez('power3.inOut'), IO2 = ez('power2.inOut'), OUT2 = ez('power2.out'), OUT3 = ez('power3.out');
const EXPO = ez('expo.out'), IN2 = ez('power2.in'), POP = ez('back.out(1.8)'), BACK = ez('back.out(1.5)');
const seg = (t, a, b) => clamp((t - a) / (b - a));

// ---------------------------------------------------------------- the lens and its path
const R0 = 190;            // glass radius on the desk (stage px)
const M0 = 8;              // magnification at the centre of the glass (stage px per macro unit)
const A0 = 0.6;            // barrel strength: slope of the remap at the centre (1 = flat)
const E0 = 0.014;          // chromatic split at the rim
const band = (R) => 190 + 0.12 * Math.max(0, R - 190);   // refracting band (stage px): the whole glass when small, a rim when large
const RB = 1700, M1 = 60, M2 = 64;   // the lens after the iris, magnification at the end of the iris / micro scene
const P_IN = [1345, 1290], P1 = [815, 1250], P2 = [720, 1010], MOVE_C = [850, 1090];
const TGT = P2, LF = [540, 900], DRIFT = [0.28, -0.42], T2 = [TGT[0] + DRIFT[0], TGT[1] + DRIFT[1]];
const T_ENTER = [0.35, 1.65], T_MOVE = [2.45, 3.45], T_DIP = [4.8, 5.1], T_IRIS = [5.1, 6.8], T_BACK = [8.45, 9.5];
const CP = [600, 1000];
const camS = (t) => 1 + 0.0022 * t;
const cam = (t, p) => { const s = camS(t); return [CP[0] + (p[0] - CP[0]) * s, CP[1] + (p[1] - CP[1]) * s]; };
const camInv = (t, p) => { const s = camS(t); return [CP[0] + (p[0] - CP[0]) / s, CP[1] + (p[1] - CP[1]) / s]; };
const norm = (x, y) => { const l = Math.hypot(x, y); return [x / l, y / l]; };

// detail levels: origin (macro), size (macro), magnification Z (level px per macro unit)
const LV = {
  B: { Z: 6, ox: 640, oy: 945, mw: 480, mh: 350, feather: 0 },
  C1: { Z: 18, ox: TGT[0] - 34, oy: TGT[1] - 54, mw: 68, mh: 116, feather: 0.07 },
  C2: { Z: 60, ox: TGT[0] - 11, oy: TGT[1] - 16.4, mw: 22, mh: 35, feather: 0.04 },
};
const wC1 = (M) => smooth((M - 10) / 4), wC2 = (M) => smooth((M - 26) / 12);

function deskPath(t) {
  if (t <= T_ENTER[1]) {
    const p = IO3(seg(t, ...T_ENTER)), b = Math.sin(Math.PI * p) * 46;
    return [lerp(P_IN[0], P1[0], p), lerp(P_IN[1], P1[1], p) - b];
  }
  if (t <= T_MOVE[0]) return P1;
  if (t <= T_MOVE[1]) {
    const p = IO3(seg(t, ...T_MOVE)), q = 1 - p;
    return [q * q * P1[0] + 2 * q * p * MOVE_C[0] + p * p * P2[0], q * q * P1[1] + 2 * q * p * MOVE_C[1] + p * p * P2[1]];
  }
  return P2;
}
// holds: a damped settle along the arrival direction, then a hand's micro-wobble
const HOLDS = [
  { a: T_ENTER[1], b: T_MOVE[0], dir: norm(P1[0] - P_IN[0], P1[1] - P_IN[1]) },
  { a: T_MOVE[1], b: T_DIP[0], dir: norm(P2[0] - MOVE_C[0], P2[1] - MOVE_C[1]) },
  { a: T_BACK[1], b: 99, dir: norm(T2[0] - LF[0], T2[1] - LF[1]) },
];
function wobble(t) {
  let x = 0, y = 0;
  for (const h of HOLDS) {
    if (t < h.a || t > h.b) continue;
    const out = 1 - smooth(seg(t, h.b - 0.25, h.b)), env = smooth(seg(t, h.a, h.a + 0.4)) * out;
    x += env * (2.4 * Math.sin(5.1 * t + 1) + 1.2 * Math.sin(12.3 * t + 0.3));
    y += env * (2.0 * Math.sin(4.3 * t + 2) + 1.0 * Math.sin(10.9 * t + 1.2));
    const k = t - h.a, st = 9 * Math.exp(-5.5 * k) * Math.sin(TAU * 2.3 * k) * out;
    x += st * h.dir[0]; y += st * h.dir[1];
  }
  return [x, y];
}

/** every lens parameter at time t (a pure function) */
function state(t) {
  const S = { t, lift: 0, eps: E0, a: A0, Mc: M0, R: R0, hAng: Math.PI / 4 };
  let L, m;
  if (t < T_IRIS[0]) {
    const base = cam(t, deskPath(t)), w = wobble(t);
    L = [base[0] + w[0], base[1] + w[1]];
    m = camInv(t, L);
    S.R = R0 * (1 - 0.06 * IO2(seg(t, ...T_DIP)));      // anticipation before the iris
    const e = 1 / 60, pa = deskPath(t - e), pb = deskPath(t + e);
    const vx = (pb[0] - pa[0]) / (2 * e), vy = (pb[1] - pa[1]) / (2 * e);
    S.hAng += clamp(-vx * 0.0003 + vy * 0.0001, -0.3, 0.3) + 0.025 * Math.sin(2.1 * t);
  } else if (t < T_IRIS[1]) {
    const p = IO3(seg(t, ...T_IRIS)), Rd = R0 * 0.94, Ls = cam(T_IRIS[0], TGT);
    S.R = Rd * Math.pow(RB / Rd, p);                    // radius and magnification grow geometrically
    S.Mc = M0 * Math.pow(M1 / M0, p);
    S.a = lerp(A0, 1, smooth(p));
    L = [lerp(Ls[0], LF[0], p), lerp(Ls[1], LF[1], p)]; m = TGT;
    S.eps = E0 * (1 + 0.8 * Math.sin(Math.PI * p)) * Math.pow(R0 / S.R, 0.8); S.lift = p;
    S.hAng += 0.025 * Math.sin(2.1 * T_IRIS[0]);
  } else if (t < T_BACK[0]) {
    const k = seg(t, T_IRIS[1], T_BACK[0]), d = smooth(k);
    S.R = RB; S.Mc = M1 * Math.pow(M2 / M1, k); S.a = 1; S.lift = 1;
    L = LF; m = [TGT[0] + DRIFT[0] * d, TGT[1] + DRIFT[1] * d];
  } else if (t < T_BACK[1]) {
    const p = IO3(seg(t, ...T_BACK)), Le = cam(t, T2);
    S.R = RB * Math.pow(R0 / RB, p); S.Mc = M2 * Math.pow(M0 / M2, p); S.a = lerp(1, A0, smooth(p));
    L = [lerp(LF[0], Le[0], p), lerp(LF[1], Le[1], p)]; m = T2;
    S.eps = E0 * (1 + 0.8 * Math.sin(Math.PI * p)) * Math.pow(R0 / S.R, 0.8); S.lift = 1 - p;
  } else {
    const base = cam(t, T2), w = wobble(t), k = t - T_BACK[1];
    L = [base[0] + w[0], base[1] + w[1]]; m = camInv(t, L);
    S.R = R0 * (1 + 0.035 * Math.exp(-6 * k) * Math.sin(TAU * 2.2 * k));   // lands with a small bounce
  }
  S.Lx = L[0]; S.Ly = L[1]; S.mx = m[0]; S.my = m[1];
  S.u0 = Math.max(0, 1 - band(S.R) / S.R);
  S.w1 = wC1(S.Mc); S.w2 = wC2(S.Mc);
  S.far = Math.max(Math.hypot(S.Lx, S.Ly), Math.hypot(W - S.Lx, S.Ly), Math.hypot(S.Lx, H - S.Ly), Math.hypot(W - S.Lx, H - S.Ly));
  S.full = S.u0 * S.R - 4 > S.far;
  return S;
}
/** macro → screen inside the glass (the flat part of the mapping) */
const view = (S, p) => [S.Lx + (p[0] - S.mx) * S.Mc, S.Ly + (p[1] - S.my) * S.Mc];

// ---------------------------------------------------------------- per-pixel refraction (CPU)
let SA, SB, SC1, curW1 = 0;
const OUTC = new Float32Array(3);
/** bilinear sample of level L at level px (lx, ly) → OUTC (rgb); returns alpha */
function bil(L, lx, ly) {
  const ix = lx | 0, iy = ly | 0, fx = lx - ix, fy = ly - iy, d = L.d, s = L.w * 4, p = iy * s + ix * 4;
  const a = (1 - fx) * (1 - fy), b = fx * (1 - fy), c = (1 - fx) * fy, e = fx * fy;
  OUTC[0] = d[p] * a + d[p + 4] * b + d[p + s] * c + d[p + s + 4] * e;
  OUTC[1] = d[p + 1] * a + d[p + 5] * b + d[p + s + 1] * c + d[p + s + 5] * e;
  OUTC[2] = d[p + 2] * a + d[p + 6] * b + d[p + s + 2] * c + d[p + s + 6] * e;
  return d[p + 3] * a + d[p + 7] * b + d[p + s + 3] * c + d[p + s + 7] * e;
}
/** the hidden layer at macro point (mx, my): B where it exists (else A), C1 blended in by magnification */
function sample(mx, my) {
  let L = SB, lx = (mx - L.ox) * L.Z - 0.5, ly = (my - L.oy) * L.Z - 0.5;
  if (!(lx >= 0 && ly >= 0 && lx < L.w - 1 && ly < L.h - 1)) {
    L = SA; lx = mx - 0.5; ly = my - 0.5;
    lx = lx < 0 ? 0 : lx > L.w - 1.001 ? L.w - 1.001 : lx;
    ly = ly < 0 ? 0 : ly > L.h - 1.001 ? L.h - 1.001 : ly;
  }
  bil(L, lx, ly);
  if (curW1 > 0) {
    const C = SC1, cx = (mx - C.ox) * C.Z - 0.5, cy = (my - C.oy) * C.Z - 0.5;
    if (cx >= 0 && cy >= 0 && cx < C.w - 1 && cy < C.h - 1) {
      const r0 = OUTC[0], g0 = OUTC[1], b0 = OUTC[2], w = (curW1 * bil(C, cx, cy)) / 255;
      OUTC[0] = r0 + (OUTC[0] - r0) * w; OUTC[1] = g0 + (OUTC[1] - g0) * w; OUTC[2] = b0 + (OUTC[2] - b0) * w;
    }
  }
}

defineDemo({
  id: '88-loupe-lens',
  title: '날개의 파랑',
  tech: '돋보기 렌즈 · 굴절 왜곡 + 숨은 층 + 아이리스 전환',
  duration: D,
  background: '#1c130d',

  async setup(api) {
    const KR = `"${FONTS.pretendard.family}"`, HAND = `"${FONTS.nanumPen.family}"`;
    this.KR = KR; this.HAND = HAND;
    await Promise.all([
      fontReady(`900 128px ${KR}`, '이 파랑은어디서 올까?결이 만든'),
      fontReady(`700 66px ${KR}`, '물감이 아니라'),
      fontReady(`400 62px ${HAND}`, '작은 비늘들!파란 물감일까?흰빛파란빛만No. 88'),
    ]);
    const cpu = api.headless ? { willReadFrequently: true } : undefined;
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return { cv: c, g: c.getContext('2d', cpu) }; };
    const pixels = (g, w, h) => g.getImageData(0, 0, w, h).data;

    // ---- layer A: the flat illustration
    const A = mk(AW, H);
    const cardPath = renderDesk(A.g, HAND);
    const Apx = pixels(A.g, AW, H);
    SA = { d: Apx, w: AW, h: H, Z: 1, ox: 0, oy: 0 };
    this.A = { cv: A.cv, Z: 1, ox: 0, oy: 0, mw: AW, mh: H };

    // ---- the hidden layer: scales, drawn at three magnifications
    const hindPath = polyPath(HIND);
    const test = mk(4, 4).g;
    const inWing = (x, y) => test.isPointInPath(hindPath, x, y);
    const B = LV.B;
    const scales = makeScales(Apx, AW, inWing, [B.ox - 12, B.oy - 12, B.ox + B.mw + 12, B.oy + B.mh + 12]);
    this.scales = scales;
    this.lv = {};
    for (const [k, spec] of Object.entries(LV)) {
      const c = mk(Math.round(spec.mw * spec.Z), Math.round(spec.mh * spec.Z));
      const lv = { ...spec, cv: c.cv, g: c.g };
      renderLevel(lv, { Acv: A.cv, scales, lvl: k === 'B' ? 0 : k === 'C1' ? 1 : 2, base: k === 'B' ? 'desk' : 'membrane', cardPath, hindPath, feather: spec.feather });
      this.lv[k] = lv;
    }
    SB = { d: pixels(this.lv.B.g, this.lv.B.cv.width, this.lv.B.cv.height), w: this.lv.B.cv.width, h: this.lv.B.cv.height, Z: B.Z, ox: B.ox, oy: B.oy };
    const c1 = this.lv.C1;
    SC1 = { d: pixels(c1.g, c1.cv.width, c1.cv.height), w: c1.cv.width, h: c1.cv.height, Z: c1.Z, ox: c1.ox, oy: c1.oy };

    // ---- the refraction buffer (one stage-sized ImageData, a dirty rectangle per frame)
    const buf = mk(W, H);
    this.bcv = buf.cv; this.bg = buf.g; this.buf = buf.g.createImageData(W, H);

    // ---- sheen mask (blue parts of the wings), sprites
    const SH = { x: 80, y: 530, w: 940, h: 780 };
    const mask = mk(SH.w, SH.h);
    mask.g.translate(-SH.x, -SH.y); renderBlueMask(mask.g);
    this.sheen = { ...SH, mask: mask.cv, scratch: mk(SH.w, SH.h) };

    const sh = mk(1100, 1100), tmp = mk(1100, 1100), C = 420;
    {
      const g = tmp.g;
      g.translate(C, C);
      g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.arc(0, 0, R0, 0, TAU); g.fill();
      g.strokeStyle = '#000'; g.lineWidth = 0.1 * R0; g.beginPath(); g.arc(0, 0, R0 * 1.05, 0, TAU); g.stroke();
      g.rotate(Math.PI / 4); g.fillStyle = '#000';
      g.beginPath(); g.roundRect(R0 * 1.04, -R0 * 0.085, R0 * 0.2, R0 * 0.17, 4); g.fill();
      g.beginPath(); g.roundRect(R0 * 1.22, -R0 * 0.11, R0 * 0.95, R0 * 0.22, R0 * 0.11); g.fill();
      sh.g.filter = 'blur(11px)'; sh.g.drawImage(tmp.cv, 0, 0);
    }
    this.shadow = { cv: sh.cv, C };
    const dot = mk(64, 64);
    { const g = dot.g, rg = g.createRadialGradient(32, 32, 0, 32, 32, 32); rg.addColorStop(0, 'rgba(255,236,200,1)'); rg.addColorStop(0.35, 'rgba(255,220,170,.45)'); rg.addColorStop(1, 'rgba(255,220,170,0)'); g.fillStyle = rg; g.fillRect(0, 0, 64, 64); }
    this.dot = dot.cv;
    const star = mk(128, 128);
    {
      const g = star.g; g.translate(64, 64);
      const rg = g.createRadialGradient(0, 0, 0, 0, 0, 30); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.3, 'rgba(160,230,255,.55)'); rg.addColorStop(1, 'rgba(120,200,255,0)');
      g.fillStyle = rg; g.fillRect(-64, -64, 128, 128);
      g.fillStyle = 'rgba(235,250,255,.95)';
      for (const r of [0, Math.PI / 2]) { g.save(); g.rotate(r); g.beginPath(); g.moveTo(-62, 0); g.quadraticCurveTo(0, 3.2, 62, 0); g.quadraticCurveTo(0, -3.2, -62, 0); g.fill(); g.restore(); }
    }
    this.star = star.cv;

    // ---- type: glyph positions measured once (per-syllable pop like the source's TypeFX)
    const tg = mk(8, 8).g;
    /**
     * Text with its blurred shadow, rasterised once. Canvas text shadows go through Skia's glyph-mask cache, so a
     * shadowed fillText can come out a few levels different depending on what was drawn before; a sprite cannot.
     */
    const sprite = (str, font, col, sh) => {
      tg.font = font; tg.letterSpacing = '0px';
      const wd = tg.measureText(str).width, size = parseFloat(/(\d+)px/.exec(font)[1]);
      const pad = sh ? Math.ceil(sh.blur * 1.5 + Math.abs(sh.dy)) + 6 : 6;
      const c = mk(Math.ceil(wd + 2 * pad), Math.ceil(size * 1.45 + 2 * pad));
      c.g.font = font; c.g.fillStyle = col;
      if (sh) { c.g.shadowColor = sh.color; c.g.shadowBlur = sh.blur; c.g.shadowOffsetY = sh.dy; }
      c.g.fillText(str, pad, pad + size * 1.08);
      return { cv: c.cv, ax: pad, ay: pad + size * 1.08, w: wd, size };
    };
    this.labels = {
      '흰빛': sprite('흰빛', `400 88px ${HAND}`, PAL.brass, { color: 'rgba(0,4,20,.85)', blur: 18, dy: 4 }),
      '파란빛만': sprite('파란빛만', `400 88px ${HAND}`, PAL.brass, { color: 'rgba(0,4,20,.85)', blur: 18, dy: 4 }),
    };
    // sticky notes: paper, tape and handwriting in one sprite
    this.notes = [
      { text: '작은 비늘들!', x: 392, y: 1418, rot: -0.07, a: 1.8, b: 2.4 },
      { text: '파란 물감일까?', x: 380, y: 1318, rot: 0.05, a: 3.62, b: 4.62 },
    ].map((n) => {
      tg.font = `400 64px ${HAND}`; tg.letterSpacing = '0px';
      const w = tg.measureText(n.text).width + 64, h = 96, pad = 48, c = mk(Math.ceil(w + 2 * pad), h + 2 * pad), g = c.g;
      g.translate(c.cv.width / 2, c.cv.height / 2);
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 18; g.shadowOffsetY = 10;
      g.fillStyle = PAL.note; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 6); g.fill();
      g.shadowColor = 'transparent';
      g.fillStyle = 'rgba(255,255,255,.45)'; g.save(); g.rotate(-0.05); g.fillRect(-46, -h / 2 - 14, 92, 26); g.restore();
      g.font = `400 64px ${HAND}`; g.fillStyle = PAL.ink; g.textBaseline = 'middle'; g.textAlign = 'center';
      g.fillText(n.text, 0, 4);
      return { ...n, cv: c.cv };
    });
    const layout = (lines) => lines.map((ln) => {
      tg.font = `${ln.weight} ${ln.size}px ${KR}`; tg.letterSpacing = `${(-0.045 * ln.size).toFixed(1)}px`;
      const text = ln.parts.map((p) => p[0]).join(''), glyphs = [];
      let k = 0;
      for (const [str, col] of ln.parts) for (const ch of str) {
        const x0 = tg.measureText(text.slice(0, k)).width, x1 = tg.measureText(text.slice(0, k + 1)).width;
        if (ch !== ' ') glyphs.push({ ch, x: 72 + x0, w: x1 - x0, col });
        k++;
      }
      for (const gl of glyphs) {
        gl.spr = sprite(gl.ch, tg.font, gl.col, { color: 'rgba(0,0,0,.55)', blur: 26, dy: 8 });
        if (gl.ch === '결') gl.glow = sprite(gl.ch, tg.font, gl.col, { color: 'rgba(80,200,255,1)', blur: 46, dy: 0 });
      }
      return { ...ln, glyphs };
    });
    this.title = layout([
      { y: 300, size: 132, weight: 900, t0: 0.1, tx: 6.28, parts: [['이 ', '#f7f1e6'], ['파랑', '#5cc4ff'], ['은', '#f7f1e6']] },
      { y: 448, size: 132, weight: 900, t0: 0.28, tx: 6.34, parts: [['어디서 올까?', '#f7f1e6']] },
    ]);
    this.hero = layout([
      { y: 268, size: 66, weight: 700, t0: 6.92, parts: [['물감이 아니라', '#d6e6ff']] },
      { y: 420, size: 132, weight: 900, t0: 7.1, parts: [['결', '#62d2ff'], ['이 만든 파랑', '#f7f1e6']] },
    ]);

    // ---- rays and sparkles live on real ridges of the C2 scales (visible ones only)
    const covered = (i, px, py) => {
      for (let j = i + 1; j < scales.length; j++) {
        const s = scales[j];
        if (Math.abs(s.x - px) > 12 || Math.abs(s.y - py) > 12) continue;
        const c = Math.cos(s.th), sn = Math.sin(s.th), dx = px - s.x, dy = py - s.y;
        const hw = scaleHalf(s, dx * c + dy * sn);
        if (hw > 0 && Math.abs(-dx * sn + dy * c) < hw + 0.15) return true;
      }
      return false;
    };
    const onRidge = (s, u, j) => {
      const c = Math.cos(s.th), sn = Math.sin(s.th), x = u * s.L, y = ridgeY(s, j);
      return [s.x + x * c - y * sn, s.y + x * sn + y * c];
    };
    const c2 = LV.C2, inC2 = (p) => p[0] > c2.ox + 1.5 && p[0] < c2.ox + c2.mw - 1.5 && p[1] > c2.oy + 1.5 && p[1] < c2.oy + c2.mh - 1.5;
    const S7 = state(7.4);
    this.rays = [[300, 1150, 6.9], [640, 1330, 7.12], [820, 990, 7.34]].map(([tx, ty, t0]) => {
      let best = null, bd = 1e9;
      for (const s of scales) {
        if (!inC2([s.x, s.y])) continue;
        for (const u of [0.58, 0.66, 0.74]) for (const j of [4, 8, 12]) {
          const p = onRidge(s, u, j), v = view(S7, p), d = Math.hypot(v[0] - tx, v[1] - ty);
          if (d < bd && !covered(s.i, p[0], p[1])) { bd = d; best = { p, th: s.th }; }
        }
      }
      return { ...best, t0 };
    });
    const rs = rand(7301), sparks = [];
    for (let n = 0; n < 400 && sparks.length < 44; n++) {
      const s = scales[Math.floor(rs() * scales.length)];
      if (!inC2([s.x, s.y])) continue;
      const p = onRidge(s, 0.45 + rs() * 0.45, 2 * Math.floor(rs() * 9));
      if (!covered(s.i, p[0], p[1])) sparks.push({ p, ph: rs(), f: 0.5 + rs() * 0.9, sz: 7 + rs() * 12 });
    }
    this.sparks = sparks;

    // the beat: the moment the brass rim leaves the last corner of the frame
    this.tRim = T_IRIS[1];
    for (let t = T_IRIS[0]; t < T_IRIS[1]; t += 1 / 240) { const S = state(t); if (S.R * 1.1 > S.far) { this.tRim = t; break; } }

    // dust in the lamp light
    this.motes = Array.from({ length: 48 }, (_, i) => { const r = rand(900 + i); return { x: r() * W, y: r() * H, z: 0.4 + r() * 0.9, ph: r() * TAU, sp: 8 + r() * 16, sz: 3 + r() * 7 }; });

    const { ctx } = api.canvas({ z: 1, attrs: cpu });
    this.ctx = ctx;
  },

  // ============================================================== drawing
  frame(t) {
    const ctx = this.ctx, S = state(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    if (S.full) {
      this.levels(S, 0);
    } else {
      const s = camS(t);
      ctx.setTransform(s, 0, 0, s, CP[0] * (1 - s), CP[1] * (1 - s));
      ctx.drawImage(this.A.cv, 0, 0);
      this.wingSheen(t);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const visible = S.Lx - S.R * 1.12 < W;
      if (visible) {
        this.lensShadow(S);
        this.refract(S);
        if (S.u0 > 0) this.levels(S, S.u0 * S.R);
        this.glass(S, t);
      }
      this.motes1(t, 1 - S.lift);
      if (visible) this.lensBody(S);
    }
    this.depth(S);
    this.micro(S, t);
    this.flash(t);
    this.texts(t);
    this.tags(t);
  },

  /** the flat inside of the glass (or the whole frame): levels with drawImage, coarse → fine */
  levels(S, clipR) {
    const ctx = this.ctx;
    let bx0 = 0, by0 = 0, bx1 = W, by1 = H;
    if (clipR) { bx0 = Math.max(0, S.Lx - clipR); by0 = Math.max(0, S.Ly - clipR); bx1 = Math.min(W, S.Lx + clipR); by1 = Math.min(H, S.Ly + clipR); }
    if (bx1 <= bx0 || by1 <= by0) return;
    const mr = [S.mx + (bx0 - S.Lx) / S.Mc, S.my + (by0 - S.Ly) / S.Mc, S.mx + (bx1 - S.Lx) / S.Mc, S.my + (by1 - S.Ly) / S.Mc];
    const inner = (lv) => [lv.ox + lv.mw * lv.feather, lv.oy + lv.mh * lv.feather, lv.ox + lv.mw * (1 - lv.feather), lv.oy + lv.mh * (1 - lv.feather)];
    const covers = (b) => b[0] <= mr[0] && b[1] <= mr[1] && b[2] >= mr[2] && b[3] >= mr[3];
    const { B, C1, C2 } = this.lv, list = [];
    if (!(S.w2 >= 1 && covers(inner(C2)))) {
      if (!(S.w1 >= 1 && covers(inner(C1)))) {
        if (!covers(inner(B))) list.push([this.A, 1]);
        list.push([B, 1]);
      }
      if (S.w1 > 0) list.push([C1, S.w1]);
    }
    if (S.w2 > 0) list.push([C2, S.w2]);
    ctx.save();
    if (clipR) { ctx.beginPath(); ctx.arc(S.Lx, S.Ly, clipR, 0, TAU); ctx.clip(); }
    for (const [lv, al] of list) {
      const x0 = Math.max(mr[0], lv.ox), y0 = Math.max(mr[1], lv.oy), x1 = Math.min(mr[2], lv.ox + lv.mw), y1 = Math.min(mr[3], lv.oy + lv.mh);
      if (x1 <= x0 || y1 <= y0) continue;
      ctx.globalAlpha = al;
      ctx.drawImage(lv.cv, (x0 - lv.ox) * lv.Z, (y0 - lv.oy) * lv.Z, (x1 - x0) * lv.Z, (y1 - y0) * lv.Z,
        S.Lx + (x0 - S.mx) * S.Mc, S.Ly + (y0 - S.my) * S.Mc, (x1 - x0) * S.Mc, (y1 - y0) * S.Mc);
    }
    ctx.restore();
  },

  /**
   * Radial remap, per output pixel: screen radius r (u = r/R) → source radius R·f(u)/(a·Mc) in macro units, with
   * f(u) = a·u + (1−a)·x³, x = (u−u0)/(1−u0). Small lens: u0 = 0, a barrel over the whole glass (centre bulges, rim
   * compresses). Large lens: u0 > 0, the inside is flat (drawn by levels()) and only the rim band is refracted here.
   * Red and blue are sampled at radii ×(1 ± eps·u⁴): the chromatic fringe at the rim.
   */
  refract(S) {
    const { Lx, Ly, R, a, u0, Mc, mx, my, eps } = S;
    const x0 = Math.max(0, Math.floor(Lx - R - 2)), x1 = Math.min(W, Math.ceil(Lx + R + 2));
    const y0 = Math.max(0, Math.floor(Ly - R - 2)), y1 = Math.min(H, Math.ceil(Ly + R + 2));
    if (x1 <= x0 || y1 <= y0) return;
    const ri0 = u0 * R, area = Math.min((x1 - x0) * (y1 - y0), Math.PI * (R * R - ri0 * ri0));
    const q = Math.min(1, Math.sqrt(360000 / Math.max(1, area))), inv = 1 / q;    // a pixel budget for the band
    const ri = u0 > 0 ? Math.max(0, ri0 - 2 * inv - 2) : 0;
    const bw = Math.min(W, Math.ceil((x1 - x0) * q)), bh = Math.min(H, Math.ceil((y1 - y0) * q));
    const out = this.buf.data, stride = W * 4, Ro = R + 1.5, span = 1 / Math.max(1e-6, 1 - u0), k1 = 1 / (a * Mc);
    curW1 = S.w1;
    for (let j = 0; j < bh; j++) {
      const dy = y0 + (j + 0.5) * inv - Ly, row = j * stride;
      out.fill(0, row, row + bw * 4);
      if (dy * dy >= Ro * Ro) continue;
      const xo = Math.sqrt(Ro * Ro - dy * dy);
      const i0 = Math.max(0, Math.floor((Lx - xo - x0) * q)), i1 = Math.min(bw, Math.ceil((Lx + xo - x0) * q));
      let h0 = i1, h1 = i1;
      if (ri > 0 && dy * dy < ri * ri) { const xi = Math.sqrt(ri * ri - dy * dy); h0 = Math.ceil((Lx - xi - x0) * q); h1 = Math.floor((Lx + xi - x0) * q); }
      for (let i = i0; i < i1; i++) {
        if (i >= h0 && i < h1) { i = h1 - 1; continue; }
        const dx = x0 + (i + 0.5) * inv - Lx, r = Math.sqrt(dx * dx + dy * dy);
        const u = r < R ? r / R : 1;
        let xx = (u - u0) * span; if (xx < 0) xx = 0;
        const f = a * u + (1 - a) * xx * xx * xx;
        const s = r > 1e-4 ? (R * f * k1) / r : 1 / Mc, kc = eps * u * u * u * u, p = row + i * 4;
        if (kc < 0.0015) {
          sample(mx + dx * s, my + dy * s);
          out[p] = OUTC[0]; out[p + 1] = OUTC[1]; out[p + 2] = OUTC[2];
        } else {
          const s1 = s * (1 + kc), s2 = s * (1 - kc);
          sample(mx + dx * s1, my + dy * s1); out[p] = OUTC[0];
          sample(mx + dx * s, my + dy * s); out[p + 1] = OUTC[1];
          sample(mx + dx * s2, my + dy * s2); out[p + 2] = OUTC[2];
        }
        out[p + 3] = 255;
      }
    }
    this.bg.putImageData(this.buf, 0, 0, 0, 0, bw, bh);
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath(); ctx.arc(Lx, Ly, R, 0, TAU); ctx.clip();
    ctx.drawImage(this.bcv, 0, 0, bw, bh, x0, y0, bw * inv, bh * inv);
    ctx.restore();
  },

  lensShadow(S) {
    const ctx = this.ctx, k = S.R / R0, grow = 1 + 1.6 * S.lift, sh = this.shadow;
    ctx.save();
    ctx.globalAlpha = 0.68 * (1 - 0.85 * S.lift);
    ctx.translate(S.Lx + 0.22 * S.R * grow, S.Ly + 0.3 * S.R * grow);
    ctx.rotate(S.hAng - Math.PI / 4);
    ctx.scale(k * (1 + 0.25 * S.lift), k * (1 + 0.25 * S.lift));
    ctx.drawImage(sh.cv, -sh.C, -sh.C);
    ctx.restore();
  },

  /** glass: inner rim shadow, cool tint, highlight crescent, a moving sheen while the lens rests on the blue */
  glass(S, t) {
    const ctx = this.ctx, { Lx, Ly, R } = S;
    ctx.save();
    ctx.beginPath(); ctx.arc(Lx, Ly, R, 0, TAU); ctx.clip();
    const ig = ctx.createRadialGradient(Lx, Ly, R * 0.74, Lx, Ly, R);
    ig.addColorStop(0, 'rgba(6,10,24,0)'); ig.addColorStop(0.7, 'rgba(6,10,24,.16)'); ig.addColorStop(1, 'rgba(6,10,24,.5)');
    ctx.fillStyle = ig; ctx.fillRect(Lx - R, Ly - R, 2 * R, 2 * R);
    ctx.fillStyle = 'rgba(190,225,255,.04)'; ctx.fillRect(Lx - R, Ly - R, 2 * R, 2 * R);
    const sp = seg(t, 3.7, 4.55);
    if (sp > 0 && sp < 1) {
      const off = lerp(-1.4, 1.4, IO2(sp)) * R;
      ctx.translate(Lx, Ly); ctx.rotate(-0.62);
      const g = ctx.createLinearGradient(off - 0.42 * R, 0, off + 0.42 * R, 0);
      g.addColorStop(0, 'rgba(140,230,255,0)'); g.addColorStop(0.5, 'rgba(160,236,255,.42)'); g.addColorStop(1, 'rgba(140,230,255,0)');
      ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(-R * 1.5, -R * 1.5, 3 * R, 3 * R);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over';
    }
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,.26)'; ctx.lineWidth = 0.075 * R;
    ctx.beginPath(); ctx.arc(Lx, Ly, 0.8 * R, 3.55, 4.35); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.lineWidth = 0.05 * R;
    ctx.beginPath(); ctx.arc(Lx, Ly, 0.84 * R, 0.35, 1.05); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(Lx - 0.47 * R, Ly - 0.63 * R, 0.035 * R, 0, TAU); ctx.fill();
    ctx.restore();
  },

  /** brass rim and turned-wood handle (drawn after the glass, scaled with the radius) */
  lensBody(S) {
    const ctx = this.ctx, { Lx, Ly, R } = S, T = 0.1 * R;
    ctx.save();
    ctx.translate(Lx, Ly); ctx.rotate(S.hAng);
    const cg = ctx.createLinearGradient(0, -0.09 * R, 0, 0.09 * R);
    cg.addColorStop(0, '#f6d688'); cg.addColorStop(0.5, '#c88f2c'); cg.addColorStop(1, '#6f4a14');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(R + 0.06 * R, -0.085 * R, 0.2 * R, 0.17 * R, 0.03 * R); ctx.fill();
    const hg = ctx.createLinearGradient(0, -0.11 * R, 0, 0.11 * R);
    hg.addColorStop(0, '#24160f'); hg.addColorStop(0.28, '#7a4a2c'); hg.addColorStop(0.55, '#3b2418'); hg.addColorStop(1, '#140b07');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.roundRect(R + 0.24 * R, -0.11 * R, 0.95 * R, 0.22 * R, 0.11 * R); ctx.fill();
    ctx.fillStyle = 'rgba(255,230,200,.16)'; ctx.beginPath(); ctx.roundRect(R + 0.3 * R, -0.075 * R, 0.82 * R, 0.035 * R, 0.02 * R); ctx.fill();
    ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(R + 1.12 * R, -0.1 * R, 0.07 * R, 0.2 * R, 0.03 * R); ctx.fill();
    ctx.restore();
    const rg = ctx.createLinearGradient(Lx - R, Ly - R, Lx + R, Ly + R);
    rg.addColorStop(0, '#fbe3a0'); rg.addColorStop(0.42, '#dba23a'); rg.addColorStop(0.75, '#9a6a20'); rg.addColorStop(1, '#5a3a10');
    ctx.strokeStyle = rg; ctx.lineWidth = T;
    ctx.beginPath(); ctx.arc(Lx, Ly, R + T / 2, 0, TAU); ctx.stroke();
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,248,225,.55)'; ctx.lineWidth = 0.28 * T;
    ctx.beginPath(); ctx.arc(Lx, Ly, R + 0.62 * T, 3.45, 4.5); ctx.stroke();
    ctx.strokeStyle = 'rgba(40,22,4,.35)'; ctx.lineWidth = 0.3 * T;
    ctx.beginPath(); ctx.arc(Lx, Ly, R + 0.5 * T, 0.2, 1.4); ctx.stroke();
    ctx.strokeStyle = 'rgba(38,22,6,.85)'; ctx.lineWidth = Math.max(1.5, 0.16 * T);
    ctx.beginPath(); ctx.arc(Lx, Ly, R + 0.06 * T, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,236,190,.4)'; ctx.lineWidth = Math.max(1, 0.1 * T);
    ctx.beginPath(); ctx.arc(Lx, Ly, R + T, 0, TAU); ctx.stroke();
  },

  /** a sheen sweeping over the blue of the macro wing (at the start, and again at the end) */
  wingSheen(t) {
    const sweeps = [[0.0, 1.5, 0.42], [9.15, 10.3, 0.55]];
    for (const [a, b, amp] of sweeps) {
      const k = seg(t, a, b);
      if (k <= 0 || k >= 1) continue;
      const sh = this.sheen, g = sh.scratch.g, x = lerp(-420, sh.w + 420, IO2(k));
      g.globalCompositeOperation = 'copy'; g.drawImage(sh.mask, 0, 0);
      g.globalCompositeOperation = 'source-in';
      const lg = g.createLinearGradient(x - 260, sh.h * 0.5 + 160, x + 260, sh.h * 0.5 - 160);
      lg.addColorStop(0, 'rgba(170,235,255,0)'); lg.addColorStop(0.5, `rgba(185,242,255,${amp})`); lg.addColorStop(1, 'rgba(170,235,255,0)');
      g.fillStyle = lg; g.fillRect(0, 0, sh.w, sh.h);
      g.globalCompositeOperation = 'source-over';
      const ctx = this.ctx;
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(sh.scratch.cv, sh.x, sh.y);
      ctx.globalCompositeOperation = 'source-over';
    }
  },

  motes1(t, alpha) {
    if (alpha <= 0.01) return;
    const ctx = this.ctx;
    ctx.globalCompositeOperation = 'screen';
    for (const m of this.motes) {
      const x = ((m.x + 14 * Math.sin(0.35 * t + m.ph) + 5 * t * m.z) % W + W) % W;
      const y = ((m.y - m.sp * t * m.z + 9 * Math.sin(0.5 * t + m.ph * 2)) % H + H) % H;
      const lamp = 1 - clamp(Math.hypot(x - 220, y - 420) / 1500);
      const tw = 0.5 + 0.5 * Math.sin(1.6 * t + m.ph * 3);
      ctx.globalAlpha = alpha * lamp * (0.12 + 0.5 * tw);
      const s = m.sz * m.z;
      ctx.drawImage(this.dot, x - s, y - s, 2 * s, 2 * s);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },

  /** the scale world gets a vignette and a darker foot for the caption, as the lens rises toward the camera */
  depth(S) {
    if (S.lift <= 0) return;
    const ctx = this.ctx;
    ctx.save();
    if (!S.full) { ctx.beginPath(); ctx.arc(S.Lx, S.Ly, S.R, 0, TAU); ctx.clip(); }
    ctx.globalAlpha = S.lift;
    const vg = ctx.createRadialGradient(LF[0], LF[1], 420, LF[0], LF[1], 1250);
    vg.addColorStop(0, 'rgba(2,4,16,0)'); vg.addColorStop(1, 'rgba(2,4,16,.6)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    const fg = ctx.createLinearGradient(0, 1560, 0, H);
    fg.addColorStop(0, 'rgba(2,4,16,0)'); fg.addColorStop(1, 'rgba(2,4,16,.62)');
    ctx.fillStyle = fg; ctx.fillRect(0, 1560, W, H - 1560);
    ctx.restore();
  },

  /** the scale world's own light: white rays in, only blue back out; ridge glints; sparkles */
  micro(S, t) {
    const env = smooth(seg(t, 6.45, 6.95)) * (1 - smooth(seg(t, 8.25, 8.6)));
    if (env <= 0) return;
    const ctx = this.ctx;
    ctx.save();
    if (!S.full) { ctx.beginPath(); ctx.arc(S.Lx, S.Ly, S.R, 0, TAU); ctx.clip(); }
    ctx.globalCompositeOperation = 'lighter';
    // a slow sheen across the ridges
    {
      const x = lerp(-600, 1700, seg(t, 6.6, 8.6));
      const g = ctx.createLinearGradient(x - 340, 1200, x + 340, 700);
      g.addColorStop(0, 'rgba(90,200,255,0)'); g.addColorStop(0.5, `rgba(90,200,255,${0.16 * env})`); g.addColorStop(1, 'rgba(90,200,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    for (const sp of this.sparks) {
      const [x, y] = view(S, sp.p), k = Math.max(0, Math.sin(TAU * (sp.f * t + sp.ph)));
      const a = env * Math.pow(k, 8);
      if (a < 0.02) continue;
      const s = sp.sz * (0.6 + 0.4 * k) * (S.Mc / M1);
      ctx.globalAlpha = a; ctx.drawImage(this.star, x - s, y - s, 2 * s, 2 * s);
    }
    const vin = norm(0.58, 1), vout = norm(0.58, -1);
    const line = (ax, ay, bx, by, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); };
    ctx.lineCap = 'round';
    this.rays.forEach((ry, idx) => {
      const tin = ry.t0, thit = tin + 0.34;
      if (t < tin) return;
      const [hx, hy] = view(S, ry.p), sx = hx - vin[0] * 2300, sy = hy - vin[1] * 2300;
      const ei = OUT2(seg(t, tin, thit)), ex = lerp(sx, hx, ei), ey = lerp(sy, hy, ei);
      const nx = -vin[1], ny = vin[0];
      ctx.globalAlpha = env;
      // white = all colours: three thin coloured lines added together, fading in toward the hit
      const fin = (rgb, a1) => { const g = ctx.createLinearGradient(hx - vin[0] * 1400, hy - vin[1] * 1400, hx, hy); g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(1, `rgba(${rgb},${a1})`); return g; };
      line(sx, sy, ex, ey, fin('255,255,255', 0.2), 30);
      line(sx, sy, ex, ey, fin('255,255,255', 0.5), 7);
      for (const [o, rgb] of [[-4, '255,80,70'], [0, '80,255,110'], [4, '80,140,255']]) line(sx + nx * o, sy + ny * o, ex + nx * o, ey + ny * o, fin(rgb, 0.95), 3.2);
      if (t < thit) return;
      // red and green sink into the scale and fade (absorbed); blue comes back out
      const ab = seg(t, thit, thit + 0.5);
      for (const [o, col] of [[-4, [255, 80, 70]], [0, [80, 255, 110]]]) {
        const len = 30 + 80 * OUT2(ab), g = ctx.createLinearGradient(hx, hy, hx + vin[0] * len, hy + vin[1] * len);
        g.addColorStop(0, `rgba(${col},${0.85 * (1 - ab * 0.6)})`); g.addColorStop(1, `rgba(${col},0)`);
        line(hx + nx * o, hy + ny * o, hx + vin[0] * len + nx * o, hy + vin[1] * len + ny * o, g, 3.2);
      }
      const eo = EXPO(seg(t, thit, thit + 0.6)), ox = hx + vout[0] * 2300 * eo, oy = hy + vout[1] * 2300 * eo;
      const fo = (rgb, a1) => { const g = ctx.createLinearGradient(hx, hy, hx + vout[0] * 1500, hy + vout[1] * 1500); g.addColorStop(0, `rgba(${rgb},${a1})`); g.addColorStop(1, `rgba(${rgb},0)`); return g; };
      line(hx, hy, ox, oy, fo('50,150,255', 0.3), 38);
      line(hx, hy, ox, oy, fo('90,200,255', 0.95), 8);
      line(hx, hy, ox, oy, fo('230,248,255', 0.6), 2.4);
      // the ridge lights up along its length
      const gl = smooth(seg(t, thit, thit + 0.12)) * (1 - 0.55 * seg(t, thit + 0.3, thit + 1.2)), dx = Math.cos(ry.th), dy = Math.sin(ry.th);
      const rl = 150 * (S.Mc / M1), rg = ctx.createLinearGradient(hx - dx * rl, hy - dy * rl, hx + dx * rl, hy + dy * rl);
      rg.addColorStop(0, 'rgba(110,220,255,0)'); rg.addColorStop(0.5, `rgba(130,230,255,${0.75 * gl})`); rg.addColorStop(1, 'rgba(110,220,255,0)');
      line(hx - dx * rl, hy - dy * rl, hx + dx * rl, hy + dy * rl, rg, 9);
      // glint and ring at the hit
      const gp = seg(t, thit, thit + 0.7), gs = (34 + 10 * idx) * POP(seg(t, thit, thit + 0.2)) * (1 - 0.55 * gp);
      ctx.drawImage(this.star, hx - gs, hy - gs, 2 * gs, 2 * gs);
      const rp = seg(t, thit, thit + 0.55);
      if (rp < 1) { ctx.globalAlpha = env * 0.7 * (1 - rp); ctx.strokeStyle = 'rgba(170,235,255,1)'; ctx.lineWidth = 4 * (1 - rp) + 1; ctx.beginPath(); ctx.arc(hx, hy, 14 + 96 * OUT3(rp), 0, TAU); ctx.stroke(); }
    });
    ctx.restore();
    // labels on the first ray (the detective's handwriting, brass)
    const r0 = this.rays[0], [hx, hy] = view(S, r0.p);
    this.hand('흰빛', clamp(hx - vin[0] * 400 + vin[1] * 100, 130, 950), hy - vin[1] * 400 - vin[0] * 100, 7.0, 8.25, t, env, -0.06);
    this.hand('파란빛만', clamp(hx + vout[0] * 400 - vout[1] * 110, 160, 920), hy + vout[1] * 400 + vout[0] * 110, 7.4, 8.25, t, env, -0.05);
  },

  hand(text, x, y, tin, tout, t, env, rot) {
    const p = seg(t, tin, tin + 0.45), q = seg(t, tout, tout + 0.3);
    if (p <= 0 || q >= 1) return;
    const ctx = this.ctx, e = POP(p);
    ctx.save();
    ctx.globalAlpha = clamp(p * 3) * (1 - IN2(q)) * Math.min(1, env * 1.4);
    ctx.translate(x, y - 30 * (1 - e) - 40 * IN2(q)); ctx.rotate(rot); ctx.scale(0.6 + 0.4 * e, 0.6 + 0.4 * e);
    const sp = this.labels[text];
    ctx.drawImage(sp.cv, -sp.w / 2 - sp.ax, -sp.ay + 0.33 * sp.size);
    ctx.restore();
  },

  flash(t) {
    const tf = this.tRim, ctx = this.ctx;
    const a = t < tf ? 0.26 * smooth(seg(t, tf - 0.08, tf)) : 0.26 * (1 - OUT2(seg(t, tf, tf + 0.38)));
    if (a > 0.003) {
      ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a;
      ctx.fillStyle = '#dff4ff'; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    const rp = seg(t, tf, tf + 0.6);
    if (rp > 0 && rp < 1) {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.42 * (1 - rp);
      ctx.strokeStyle = '#bfe9ff'; ctx.lineWidth = 16 * (1 - rp) + 2;
      ctx.beginPath(); ctx.arc(LF[0], LF[1], 180 + 980 * OUT3(rp), 0, TAU); ctx.stroke();
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
  },

  /** title (desk) and answer (scale world): syllables pop in with an overshoot, staggered */
  texts(t) {
    const ctx = this.ctx;
    const bd = smooth(seg(t, 5.5, 6.4)) * (1 - smooth(seg(t, 8.5, 9.4)));
    if (bd > 0) {
      const g = ctx.createLinearGradient(0, 0, 0, 640);
      g.addColorStop(0, `rgba(3,6,20,${0.74 * bd})`); g.addColorStop(0.65, `rgba(3,6,20,${0.38 * bd})`); g.addColorStop(1, 'rgba(3,6,20,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, 640);
    }
    const draw = (lines, pulse) => {
      for (const ln of lines) {
        ln.glyphs.forEach((gl, i) => {
          const p = seg(t, ln.t0 + i * 0.05, ln.t0 + i * 0.05 + 0.55);
          if (p <= 0) return;
          const q = ln.tx ? IN2(seg(t, ln.tx + i * 0.028, ln.tx + i * 0.028 + 0.26)) : 0;
          if (q >= 1) return;
          const e = BACK(p), sc = 0.72 + 0.28 * e, cx = gl.x + gl.w / 2;
          ctx.save();
          ctx.globalAlpha = clamp(p * 3.5) * (1 - q);
          ctx.translate(cx, ln.y + 46 * (1 - e) - 70 * q); ctx.scale(sc, sc);
          if (pulse && gl.glow) {
            const k = Math.exp(-Math.pow((t - 7.7) / 0.22, 2)), a = ctx.globalAlpha;
            ctx.globalAlpha = a * (0.45 + 0.55 * k);
            ctx.drawImage(gl.glow.cv, -gl.w / 2 - gl.glow.ax, -gl.glow.ay);
            ctx.globalAlpha = a;
          }
          ctx.drawImage(gl.spr.cv, -gl.w / 2 - gl.spr.ax, -gl.spr.ay);
          ctx.restore();
        });
      }
    };
    draw(this.title, false);
    draw(this.hero, true);
  },

  /** sticky notes (the viewer's questions), in with back.out, out faster with power2.in */
  tags(t) {
    const ctx = this.ctx;
    for (const n of this.notes) {
      const p = seg(t, n.a, n.a + 0.5), q = seg(t, n.b, n.b + 0.4);
      if (p <= 0 || q >= 1) continue;
      const e = POP(p), qi = IN2(q), sc = (0.55 + 0.45 * e) * (1 - 0.1 * qi);
      ctx.save();
      ctx.globalAlpha = clamp(p * 3) * (1 - qi);
      ctx.translate(n.x, n.y + 30 * (1 - e) - 70 * qi);
      ctx.rotate(n.rot - 0.17 * (1 - e) + 0.21 * qi);
      ctx.scale(sc, sc);
      ctx.drawImage(n.cv, -n.cv.width / 2, -n.cv.height / 2);
      ctx.restore();
    }
  },
});
