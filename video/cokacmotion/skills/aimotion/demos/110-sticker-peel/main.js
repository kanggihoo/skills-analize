/*
 * 110 · 나중에 말고 지금 — 다이컷 스티커 · 말려 올라가는 떼기
 *
 * 책상 위 닫힌 노트북 뚜껑. 가운데에는 오래 붙어 바랜 라벨 「나중에」 하나뿐이다.
 * 성격을 말하는 낱말 스티커(야행성, 커피 진심, 호기심?, 덕질 중)와 별·하트가 한 장씩 철썩 붙는다
 * (들린 채 날아와 그림자가 좁혀지며 착지, 눌려 퍼졌다 돌아오고, 엄지가 훑으면 기포·주름이 펴진다).
 * 카메라가 다가가면 「나중에」의 모서리가 손톱에 들리고, 접힘선이 대각선으로 지나가며 라벨이 말려 올라간다.
 * 그 밑에서 홀로그램 「지금」이 나온다. 라벨은 뜯겨 화면 밖으로 날아가고, 「지금」이 반짝인다.
 * 엔진은 sticker.js(칼선 굽기·페이지 컬), 스티커 그림은 designs.js, 책상과 뚜껑은 scene.js.
 */
import { defineDemo, clamp, lerp, ease, track, rand } from '../_lib/stage.js';
import { fontReady, loadOutlineFont, outlineContours } from '../_lib/type.js';
import {
  SS, I, mul, mulN, trs, tr, inv, apply, setM, canvas2d, roundRectLoop, bakeSticker, drawFront, drawBack, drawShadowImg,
  peelPieces, pieceMatrix, pieceShadowMatrix, clipBand,
} from './sticker.js';
import { makeDesigns, holoGradient } from './designs.js';
import { bakeScene, bakeVignette, MARGIN, LID } from './scene.js';

const D = 10;
const TAU = Math.PI * 2;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const { outExpo, outBack, outCubic, inOutCubic } = ease;
const sineIO = (p) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(p));

// ---------------------------------------------------------------- 시각표 (초)
const T = { head1: 0.3, push0: 3.35, push1: 4.25, lift0: 3.95, peel0: 4.5, peel1: 7.05, fly1: 7.6, head2: 5.0, shine: [8.0, 9.5] };

// ---------------------------------------------------------------- 배치 (무대 좌표)
const PLACE = { now: { x: 530, y: 1003, rot: -0.03 }, later: { x: 535, y: 997, rot: -0.085 } };
const SLAPS = [
  { key: 'night',   x: 382, y: 552,  rot: -0.15, t0: 0.70, from: [-0.8, -0.6], spin: -0.32, kick: 3.2 },
  { key: 'coffee',  x: 708, y: 718,  rot: 0.07,  t0: 1.22, from: [1, 0.1],     spin: 0.3,   kick: 2.4 },
  { key: 'curious', x: 378, y: 1296, rot: 0.08,  t0: 1.74, from: [-1, 0.45],   spin: 0.34,  kick: 2.8 },
  { key: 'fan',     x: 738, y: 1408, rot: -0.11, t0: 2.26, from: [0.9, 0.6],   spin: -0.3,  kick: 2.6 },
  { key: 'star',    x: 822, y: 572,  rot: 0.24,  t0: 2.70, from: [0.5, -1],    spin: 0.5,   kick: 1.6 },
  { key: 'heart',   x: 238, y: 1442, rot: -0.28, t0: 2.98, from: [-0.6, 1],    spin: -0.5,  kick: 1.4 },
];
// 떼는 방향(n: 들린 쪽을 가리킴). 손톱은 왼위 모서리를 대각선으로 들고(A0), 당기면서 거의 가로로 돌아간다(A1)
const A0 = Math.atan2(-0.78, -1), A1 = Math.atan2(-0.3, -1);
const LIGHT = (() => { const v = [-0.42, -0.6, 0.68], l = Math.hypot(...v); return v.map((a) => a / l); })();
const HALF = (() => { const v = [LIGHT[0], LIGHT[1], LIGHT[2] + 1], l = Math.hypot(...v); return v.map((a) => a / l); })();
const SH_K = [0.2, 0.28];   // 높이 1 px당 그림자가 밀리는 양(무대 좌표, 빛은 왼위에서)
// 창문 반사 띠: 축 (0.6, 0.8) 위치, 반폭, 세기 — 뚜껑에 구운 띠와 같은 자리
const GLOSS = [[718, 200, 0.26], [978, 46, 0.24], [1518, 220, 0.12]];
const ACC = '#ffd23f', CREAM = '#f6eee0';
// 마지막 광택 훑기: 같은 축 위를 지나가는 밝은 띠 하나 (frame 첫머리에서 t로 정한다)
const SHINE = { c: -1e4, a: 0 };
const shineAt = (t) => { const p = seg(t, T.shine[0], T.shine[1]); return { c: lerp(380, 2000, inOutCubic(p)), a: p > 0 && p < 1 ? 0.62 * Math.sin(Math.PI * p) ** 0.5 : 0 }; };
const TWINKLE = [[8.25, -128, -62, 20], [8.75, 112, -74, 15], [9.3, 30, 66, 18]];   // 「지금」 국소 좌표
const phiT = track([[T.peel0, 0.66], [5.7, 0.72], [T.peel1, 0.6]]);
const rT = track([[T.peel0, 18], [6.0, 40, (p) => p], [T.peel1, 34]]);
const HEAD = [
  { y: 186, t0: T.head1, parts: [['취향은 ', CREAM], ['붙이고', ACC], [',', CREAM]] },
  { y: 274, t0: T.head2, parts: [['미루던 건 ', CREAM], ['뗀다', ACC], ['.', CREAM]] },
];

// ---------------------------------------------------------------- 카메라
const zoomT = track([[0, 1.0], [T.push0, 1.035, (p) => p], [T.push1, 1.15], [T.peel1, 1.17, (p) => p], [8.4, 1.1], [D, 1.085, (p) => p]]);
const camC = track([[0, [540, 966]], [T.push0, [540, 966]], [T.push1, [535, 952]], [T.peel1, [532, 956], (p) => p], [8.4, [540, 962]], [D, [540, 962]]]);
function camera(t, revealT) {
  let z = zoomT(t);
  const u = t - revealT;
  if (u > 0) z += 0.03 * (1 - Math.exp(-u * 30)) * Math.exp(-u * 3.2);   // 「지금」이 다 드러나는 순간의 펀치
  const [cx, cy] = camC(t);
  let hx = 2.6 * Math.sin(0.9 * t + 0.4) + 1.4 * Math.sin(2.3 * t + 1.3);   // 핸드헬드
  let hy = 2.2 * Math.sin(0.7 * t + 2.0) + 1.2 * Math.sin(1.9 * t + 0.2);
  for (const S of SLAPS) {                                                   // 철썩: 감쇠 흔들림
    const v = t - S.t0;
    if (v > 0 && v < 0.6) { const k = S.kick * Math.exp(-v * 18) * Math.sin(v * 70); hx -= k * S.from[0]; hy -= k * S.from[1]; }
  }
  return mul(trs(540 + hx, 960 + hy, 0.004 * Math.sin(0.45 * t + 0.3), z), tr(-cx, -cy));
}

// ---------------------------------------------------------------- 철썩 붙기
function slapPose(S, t) {
  const A = 0.26, ta = S.t0 - A;
  if (t < ta) return null;
  if (t < S.t0) {                     // 들린 채 날아온다: 높이는 가속하며 0으로(철썩), 옆 이동은 감속
    const p = (t - ta) / A, hgt = 1 - p * p, l = (1 - p) * (1 - p);
    return { x: S.x + S.from[0] * 300 * l, y: S.y + S.from[1] * 300 * l, rot: S.rot + S.spin * hgt, sc: 1 + 0.55 * hgt, h: hgt, a: clamp(p / 0.18) };
  }
  const u = t - S.t0;                 // 착지: 눌려 퍼졌다 돌아온다
  const sq = 0.06 * Math.exp(-u * 13) * Math.sin(u * 44);
  return { x: S.x, y: S.y, rot: S.rot + 0.03 * Math.exp(-u * 10) * Math.sin(u * 30) * Math.sign(S.spin), sc: 1 + sq, h: 0, a: 1 };
}
// 엄지 훑기: 착지 0.08초 뒤 왼쪽에서 오른쪽으로
function sweepX(S, st, t) {
  const p = seg(t, S.t0 + 0.08, S.t0 + 0.62);
  if (p <= 0) return -1e4;
  if (p >= 1) return 1e4;
  return lerp(-st.w / 2 - 60, st.w / 2 + 60, inOutCubic(p));
}

// ---------------------------------------------------------------- 그리기 도구
/** 평평한(또는 들린) 스티커 하나: 부드러운 그림자 → 붙은 그림자 → 두께 → 앞면 */
function drawFlat(g, st, cam, Wm, hgt = 0, alpha = 1) {
  g.globalAlpha = 0.3 * (1 - 0.3 * hgt) * alpha;
  setM(g, mulN(cam, tr(4 + 80 * hgt, 8 + 115 * hgt), Wm, trs(0, 0, 0, 1 + 0.06 * hgt)));
  drawShadowImg(g, st, true);
  const tight = 0.55 * (1 - hgt) ** 3 * alpha;
  if (tight > 0.004) { g.globalAlpha = tight; setM(g, mulN(cam, tr(1, 2.4), Wm)); drawShadowImg(g, st, false); }
  g.globalAlpha = alpha;
  setM(g, mulN(cam, tr(0.5, 2.6), Wm));
  g.fillStyle = st.def.edge || '#aba396';
  g.fill(st.die, 'evenodd');
  setM(g, mul(cam, Wm));
  drawFront(g, st);
  g.globalAlpha = 1;
}

/** 표면 효과: 기포·주름(엄지가 지나가면 사라짐), 엄지 자국 광택, 창문 반사 띠 — 모두 칼선 안으로 클립 */
function surfaceFx(g, st, cam, Wm, { xs = 1e4, alpha = 1, bub = 0 } = {}) {
  g.save();
  setM(g, mul(cam, Wm));
  g.clip(st.die, 'evenodd');
  g.globalAlpha = alpha;
  if (bub > 0) {
    g.lineCap = 'round';
    for (const w of st.wrinkles) {
      const v = clamp(((w.x0 + w.x1) / 2 - xs) / 40 + 0.5) * bub;
      if (v <= 0.01) continue;
      g.strokeStyle = `rgba(30,20,40,${(0.2 * v).toFixed(3)})`; g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(w.x0 + 1.2, w.y0 + 1.8); g.quadraticCurveTo(w.cx + 1.2, w.cy + 1.8, w.x1 + 1.2, w.y1 + 1.8); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${(0.6 * v).toFixed(3)})`; g.lineWidth = 2;
      g.beginPath(); g.moveTo(w.x0 - 0.8, w.y0 - 1); g.quadraticCurveTo(w.cx - 0.8, w.cy - 1, w.x1 - 0.8, w.y1 - 1); g.stroke();
    }
    for (const b of st.bubbles) {
      const v = clamp((b.x - xs) / 22 + 0.5) * bub;
      if (v <= 0.01) continue;
      const rx = b.r * (0.35 + 0.65 * v), ry = rx * b.k;
      g.save(); g.translate(b.x, b.y); g.rotate(b.a);
      g.fillStyle = `rgba(30,20,40,${(0.18 * v).toFixed(3)})`; g.beginPath(); g.ellipse(1.4, 2, rx, ry, 0, 0, TAU); g.fill();
      g.fillStyle = `rgba(255,255,255,${(0.4 * v).toFixed(3)})`; g.beginPath(); g.ellipse(0, 0, rx * 0.94, ry * 0.94, 0, 0, TAU); g.fill();
      g.strokeStyle = `rgba(255,255,255,${(0.85 * v).toFixed(3)})`; g.lineWidth = 1.5;
      g.beginPath(); g.ellipse(0, 0, rx * 0.8, ry * 0.8, 0, Math.PI * 1.05, Math.PI * 1.6); g.stroke();
      g.fillStyle = `rgba(255,255,255,${v.toFixed(3)})`; g.beginPath(); g.arc(-rx * 0.38, -ry * 0.4, rx * 0.17, 0, TAU); g.fill();
      g.restore();
    }
    g.lineCap = 'butt';
  }
  if (xs > -1e3 && xs < 1e3) {
    const gr = g.createLinearGradient(xs - 60, 0, xs + 26, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.72, 'rgba(255,255,255,0.5)'); gr.addColorStop(0.86, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(40,30,50,0)');
    g.fillStyle = gr; g.fillRect(xs - 60, -st.h, 86, 2 * st.h);
  }
  setM(g, cam);
  const cx = Wm[4], cy = Wm[5], RR = Math.max(st.fw, st.fh) * 0.75;
  const bands = SHINE.a > 0 ? [...GLOSS, [SHINE.c, 80, SHINE.a]] : GLOSS;
  for (const [c, hw, a] of bands) {
    const pc = 0.6 * cx + 0.8 * cy;
    if (Math.abs(pc - c) > hw + RR) continue;
    const gr = g.createLinearGradient(0.6 * (c - hw), 0.8 * (c - hw), 0.6 * (c + hw), 0.8 * (c + hw));
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${(a * alpha).toFixed(3)})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(cx - RR, cy - RR, 2 * RR, 2 * RR);
  }
  g.restore();
}

function sparklePath(g, x, y, r) {
  const k = 0.16 * r;
  g.beginPath();
  g.moveTo(x, y - r);
  g.quadraticCurveTo(x + k, y - k, x + r, y); g.quadraticCurveTo(x + k, y + k, x, y + r);
  g.quadraticCurveTo(x - k, y + k, x - r, y); g.quadraticCurveTo(x - k, y - k, x, y - r);
}

defineDemo({
  id: '110-sticker-peel',
  title: '나중에 말고 지금',
  tech: '다이컷 스티커 · 말려 올라가는 떼기',
  duration: D,
  background: '#1c140f',

  async setup(api) {
    await fontReady('800 66px "Pretendard Variable"', '취향은 붙이고, 미루던 건 뗀다.');
    await fontReady('900 110px "Pretendard Variable"', '호기심? 커피 진심 할 일 나중에');
    await fontReady('400 112px "Black Han Sans"', '야행성 덕질 중');
    const font = await loadOutlineFont('Pretendard-Black');
    const H = api.headless;

    // 「지금」: Pretendard Black 벡터 윤곽 → Path2D (홀로그램 클립에 그대로 쓴다)
    const glyphs = outlineContours(font, '지금', 0, 0, 168, { letterSpacing: -6 });
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const gl of glyphs) for (const c of gl.contours) for (let i = 0; i < c.pts.length; i += 2) {
      x0 = Math.min(x0, c.pts[i]); x1 = Math.max(x1, c.pts[i]); y0 = Math.min(y0, c.pts[i + 1]); y1 = Math.max(y1, c.pts[i + 1]);
    }
    const ncx = (x0 + x1) / 2, ncy = (y0 + y1) / 2, nowPath = new Path2D();
    for (const gl of glyphs) for (const c of gl.contours) {
      nowPath.moveTo(c.pts[0] - ncx, c.pts[1] - ncy);
      for (let i = 2; i < c.pts.length; i += 2) nowPath.lineTo(c.pts[i] - ncx, c.pts[i + 1] - ncy);
      nowPath.closePath();
    }
    this.nowPath = nowPath;
    const now = { path: nowPath, w: x1 - x0, h: y1 - y0 };
    this.nowBox = now;

    const Wn = trs(PLACE.now.x, PLACE.now.y, PLACE.now.rot), Wl = trs(PLACE.later.x, PLACE.later.y, PLACE.later.rot);
    const ref = {};
    const DS = makeDesigns(now, ref, mul(inv(Wl), Wn), rand(901));
    DS.later.loops = [roundRectLoop(620, 290, 38)];
    this.st = {};
    this.st.now = await bakeSticker(DS.now, rand(77), H);
    ref.die = this.st.now.die;
    for (const k of ['later', 'night', 'coffee', 'curious', 'fan', 'star', 'heart']) this.st[k] = await bakeSticker(DS[k], rand(DS[k].seed * 7 + 1), H);

    // 홀로그램 반짝이 두 장(번갈아 깜빡)
    const glit = (seed) => {
      const r = rand(seed), w = now.w + 40, h = now.h + 40, { c, g } = canvas2d(w * SS, h * SS, H);
      g.setTransform(SS, 0, 0, SS, (w * SS) / 2, (h * SS) / 2);
      for (let i = 0; i < 420; i++) {
        const x = (r() - 0.5) * w, y = (r() - 0.5) * h, s = 0.6 + r() * r() * 2.6;
        g.fillStyle = r() < 0.6 ? 'rgba(255,255,255,0.95)' : `hsla(${(r() * 360).toFixed(0)}, 100%, 85%, 0.9)`;
        g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
      }
      return createImageBitmap(c);
    };
    this.glit = [await glit(501), await glit(502)];

    // 떼어 낸 자리의 접착제 찌꺼기(라벨 국소 좌표, 처음 들린 왼위 모서리 근처)
    const rb = rand(611);
    this.blobs = Array.from({ length: 7 }, (_, i) => {
      const t0 = i / 7, cx = i < 4 ? -296 + rb() * 30 : -280 + t0 * 190, cy = i < 4 ? -110 + i * 26 + rb() * 12 : -134 + rb() * 10, R = 4 + rb() * 9;
      const p = new Path2D();
      for (let k = 0; k < 9; k++) { const a = (k / 9) * TAU, rr = R * (0.6 + rb() * 0.6); k ? p.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.7) : p.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.7); }
      p.closePath();
      return p;
    });

    // 떼기 범위와 「지금」이 다 드러나는 시각(꼭대기 s + r이 지금의 가장 먼 칼선을 지날 때)
    const L = this.st.later;
    this.liftD = track([[T.lift0, 16], [4.14, 54, outCubic], [4.28, 40], [T.peel0, 60, (p) => p]]);   // 손톱이 두 번 긁는다
    { const nx = Math.cos(A1), ny = Math.sin(A1), e = -L.extent(-nx, -ny) - 70; this.flyPivot = apply(Wl, nx * e, ny * e); }
    { const lp = new Path2D(); lp.roundRect(-LID.w / 2, -LID.h / 2, LID.w, LID.h, LID.r); this.lidPath = lp; }
    const rel = mul(inv(Wl), Wn);
    const nowPts = [];
    for (const Lp of this.st.now.loops) for (let i = 0; i < Lp.length; i += 2) nowPts.push(apply(rel, Lp[i], Lp[i + 1]));
    this.revealT = T.peel1;
    for (let t = T.peel0; t < T.peel1; t += 1 / 240) {
      const P = this.peelState(t);
      if (nowPts.every(([x, y]) => P.nx * x + P.ny * y > P.s + P.r)) { this.revealT = t; break; }
    }

    // 반짝 별 (지금 둘레)
    const rs = rand(707);
    this.sparks = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * TAU + (rs() - 0.5) * 0.5, rr = 1 + rs() * 0.25;
      return { x: PLACE.now.x + Math.cos(a) * 250 * rr, y: PLACE.now.y + Math.sin(a) * 150 * rr, s: 14 + rs() * 18, d: rs() * 0.16 };
    });

    // 머리글 글자 자리
    this.ctx = api.canvas({ z: 0, attrs: H ? { willReadFrequently: true } : undefined }).ctx;
    const g = this.ctx;
    g.font = '800 66px "Pretendard Variable"'; g.letterSpacing = '-2px';
    this.head = HEAD.map((Ln) => {
      const full = Ln.parts.map((p) => p[0]).join(''), chars = [];
      let i = 0;
      for (const [txt, col] of Ln.parts) for (const ch of Array.from(txt)) {
        chars.push({ c: ch, col, x: 92 + g.measureText(Array.from(full).slice(0, i).join('')).width, i });
        i++;
      }
      return { ...Ln, chars };
    });
    g.letterSpacing = '0px';

    // 이형지(빈 칼선 자리)와 책상·뚜껑
    const S = this.st;
    const sheet = {
      holes: [['night', -88, -190, 0.36, 0], ['coffee', 92, -120, 0.36, 0.0], ['curious', -80, -40, 0.34, 0], ['fan', 96, 30, 0.36, 0], ['star', -120, 110, 0.4, 0.1], ['heart', 20, 120, 0.42, 0]]
        .map(([k, x, y, s, rot]) => ({ die: S[k].die, x, y, s, rot })),
      left: [{ st: S.star, x: 120, y: 160, s: 0.4, rot: -0.2 }, { st: S.heart, x: -40, y: 210, s: 0.42, rot: 0.15 }],
    };
    this.bg = await bakeScene({ W: api.W, H: api.H, sheet, headless: H });
    this.vig = await bakeVignette(api.W, api.H, H);
  },

  /** 떼기 상태: 접힘선 s, 원통 반지름 r, 날개 각 φ, 날아가는 변환 E */
  peelState(t) {
    const L = this.st.later;
    let ang = A0, d, r, phi;
    if (t < T.lift0) { d = 16; r = 11; phi = 0.5 * Math.PI; }
    else if (t < T.peel0) {
      const p = seg(t, T.lift0, T.peel0);
      d = this.liftD(t); r = lerp(11, 18, p); phi = lerp(0.5, 0.66, outCubic(p)) * Math.PI;
    } else {
      const p = seg(t, T.peel0, T.peel1), q = 0.55 * p + 0.45 * p * p;   // 처음엔 접착이 버티고, 끝은 확 뜯긴다
      ang = lerp(A0, A1, sineIO(seg(t, T.peel0, T.peel0 + 1.3)));
      const span = L.extent(Math.cos(ang), Math.sin(ang)) + L.extent(-Math.cos(ang), -Math.sin(ang));
      d = lerp(60, span + 6, q); r = rT(t); phi = phiT(t) * Math.PI;
    }
    const nx = Math.cos(ang), ny = Math.sin(ang), ext = L.extent(nx, ny), s = ext - d, smin = -L.extent(-nx, -ny);
    let E = I, Esh = I, fq = 0, flyRot = 0;
    if (t > T.peel1) {
      const p = seg(t, T.peel1, T.fly1), q = p * p * (0.35 + 0.65 * p) + 0.3 * p;
      const [px, py] = this.flyPivot;
      flyRot = 0.35 * q;
      E = mulN(tr(px + 300 * q, py - 1050 * q), trs(0, 0, flyRot, 1 + 0.9 * q), tr(-px, -py));   // 손이 들어 올려 가져간다
      Esh = mul(tr(140 * q, 190 * q), E);
      fq = p;
    }
    return { nx, ny, ext, s, smin, d, r, phi, E, Esh, fq, flyRot, gone: t >= T.fly1 };
  },

  frame(t) {
    const g = this.ctx, st = this.st;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.setLineDash([]);
    g.lineCap = 'butt'; g.lineJoin = 'miter'; g.miterLimit = 10; g.lineWidth = 1; g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)';
    g.imageSmoothingEnabled = true; g.letterSpacing = '0px';

    const cam = camera(t, this.revealT);
    Object.assign(SHINE, shineAt(t));
    setM(g, cam);
    g.drawImage(this.bg, -MARGIN, -MARGIN);
    if (SHINE.a > 0) {                       // 뚜껑에도 옅게 지나간다
      g.save();
      setM(g, mul(cam, trs(LID.x, LID.y, LID.rot))); g.clip(this.lidPath);
      setM(g, cam);
      const c = SHINE.c, gr = g.createLinearGradient(0.6 * (c - 90), 0.8 * (c - 90), 0.6 * (c + 90), 0.8 * (c + 90));
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${(SHINE.a * 0.22).toFixed(3)})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(-100, 200, 1300, 1600);
      g.restore();
    }

    const Wl = trs(PLACE.later.x, PLACE.later.y, PLACE.later.rot), Wn = trs(PLACE.now.x, PLACE.now.y, PLACE.now.rot);
    const P = this.peelState(t);
    const { nx, ny } = P;

    // ---- 라벨 밑: 깨끗한 자리, 때 낀 윤곽선, 접착제 찌꺼기, 그리고 「지금」
    setM(g, mul(cam, Wl));
    g.fillStyle = 'rgba(255,255,255,0.07)'; g.fill(st.later.die, 'evenodd');
    g.lineJoin = 'round';
    g.strokeStyle = 'rgba(70,60,45,0.12)'; g.lineWidth = 10; g.stroke(st.later.die);
    g.strokeStyle = 'rgba(60,50,35,0.3)'; g.lineWidth = 2.2; g.stroke(st.later.die);
    for (const b of this.blobs) { g.fillStyle = 'rgba(246,242,230,0.55)'; g.fill(b); g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1; g.stroke(b); }
    g.lineJoin = 'miter';
    if (t > T.lift0 - 0.1) this.drawNow(g, cam, Wn, t);

    // ---- 「나중에」의 아직 붙어 있는 부분 (접힘선 안쪽만)
    if (P.s > P.smin) {
      g.save();
      setM(g, mul(cam, Wl)); clipBand(g, nx, ny, -5000, P.s);
      drawFlat(g, st.later, cam, Wl);
      surfaceFx(g, st.later, cam, Wl);
      setM(g, mul(cam, Wl)); g.clip(st.later.die, 'evenodd');       // 접힘선 앞의 그늘
      const aw = 40 + 1.6 * P.r, ao = g.createLinearGradient(nx * (P.s - aw), ny * (P.s - aw), nx * P.s, ny * P.s);
      ao.addColorStop(0, 'rgba(25,18,10,0)'); ao.addColorStop(1, 'rgba(25,18,10,0.34)');
      g.fillStyle = ao; g.fillRect(-400, -250, 800, 500);
      g.restore();
    }

    // ---- 새 스티커들 (붙는 순서대로 위에)
    for (const S of SLAPS) {
      const s = st[S.key], pose = slapPose(S, t);
      if (!pose) continue;
      const Wm = trs(pose.x, pose.y, pose.rot, pose.sc);
      drawFlat(g, s, cam, Wm, pose.h, pose.a);
      surfaceFx(g, s, cam, Wm, { xs: sweepX(S, s, t), alpha: pose.a, bub: seg(t, S.t0, S.t0 + 0.05) });
    }

    // ---- 말려 올라간 부분: 그림자 → 원통 띠(앞/뒤, 각도 음영) → 곧게 들린 날개
    this.drawPeel(g, cam, Wl, P);

    // ---- 「지금」이 다 드러나는 순간: 반짝 별과 고리
    const u = t - this.revealT;
    if (u > 0 && u < 1.2) {
      setM(g, cam);
      const rp = seg(u, 0, 0.7);
      if (rp < 1) {
        g.strokeStyle = `rgba(255,250,235,${(0.4 * (1 - rp)).toFixed(3)})`; g.lineWidth = 2 + 6 * (1 - rp);
        g.beginPath(); g.arc(PLACE.now.x, PLACE.now.y, lerp(190, 400, outCubic(rp)), 0, TAU); g.stroke();
      }
      for (const sp of this.sparks) {
        const v = u - sp.d;
        if (v <= 0 || v > 0.9) continue;
        const sc = outBack(seg(v, 0, 0.22), 2.2) * (1 - seg(v, 0.4, 0.9));
        if (sc <= 0.01) continue;
        g.save(); g.translate(sp.x, sp.y); g.rotate(v * 1.4); g.scale(sc, sc);
        const gl = g.createRadialGradient(0, 0, 0, 0, 0, sp.s * 1.6);
        gl.addColorStop(0, 'rgba(255,240,180,0.55)'); gl.addColorStop(1, 'rgba(255,240,180,0)');
        g.fillStyle = gl; g.beginPath(); g.arc(0, 0, sp.s * 1.6, 0, TAU); g.fill();
        g.fillStyle = '#fffaf0'; sparklePath(g, 0, 0, sp.s); g.fill();
        g.restore();
      }
    }

    // ---- 여운: 홀로그램 위에서 가끔 반짝 (작은 별 셋, 차례로)
    for (const [t0, x, y, r] of TWINKLE) {
      const v = (t - t0) / 0.5;
      if (v <= 0 || v >= 1) continue;
      const k = Math.sin(Math.PI * v);
      g.save();
      setM(g, mul(cam, Wn)); g.translate(x, y); g.rotate(v * 0.8); g.scale(k, k);
      g.fillStyle = '#fffdf4'; sparklePath(g, 0, 0, r); g.fill();
      g.restore();
    }

    // ---- 화면 고정: 비네트, 머리글
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.drawImage(this.vig, 0, 0);
    g.font = '800 66px "Pretendard Variable"'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    for (const Ln of this.head) {
      if (t < Ln.t0) continue;
      g.save();
      g.beginPath(); g.rect(0, Ln.y - 82, 1080, 104); g.clip();
      for (const ch of Ln.chars) {
        const p = seg(t, Ln.t0 + ch.i * 0.035, Ln.t0 + ch.i * 0.035 + 0.55);
        if (p <= 0) continue;
        g.globalAlpha = Math.min(1, p * 2.5);
        g.fillStyle = ch.col;
        g.fillText(ch.c, ch.x, Ln.y + 78 * (1 - outExpo(p)));
      }
      g.restore();
    }
    g.globalAlpha = 1;
  },

  /** 홀로그램 「지금」: 흰 테·남색 외곽선은 구운 앞면, 무지개 포일은 글자 윤곽으로 클립해 매 프레임 */
  drawNow(g, cam, Wn, t) {
    const st = this.st.now, nb = this.nowBox;
    drawFlat(g, st, cam, Wn);
    g.save();
    setM(g, mul(cam, Wn));
    g.clip(this.nowPath);
    const ph = 0.08 + t * 0.06 + (cam[4] - 540) * 0.0005 + (cam[0] - 1) * 0.6;
    g.globalAlpha = 0.92;
    g.fillStyle = holoGradient(g, -nb.w / 2 - 30, -nb.h / 2 - 40, nb.w / 2 + 30, nb.h / 2 + 40, ph);
    g.fillRect(-nb.w / 2 - 20, -nb.h / 2 - 20, nb.w + 40, nb.h + 40);
    g.globalAlpha = 0.4;
    g.fillStyle = holoGradient(g, nb.w / 2, -nb.h / 2, -nb.w / 2, nb.h / 2, -ph * 1.3 + 0.3, 6, 100, 86);
    g.fillRect(-nb.w / 2 - 20, -nb.h / 2 - 20, nb.w + 40, nb.h + 40);
    const tw = 0.5 + 0.5 * Math.sin(t * 6.3), gw = nb.w + 40, gh = nb.h + 40;
    g.globalAlpha = 0.25 + 0.5 * tw; g.drawImage(this.glit[0], -gw / 2, -gh / 2, gw, gh);
    g.globalAlpha = 0.25 + 0.5 * (1 - tw); g.drawImage(this.glit[1], -gw / 2, -gh / 2, gw, gh);
    g.restore();
    // 드러나는 순간 한 번 훑고 지나가는 반짝 띠(칼선 전체)
    const gp = seg(t, this.revealT + 0.04, this.revealT + 0.6);
    if (gp > 0 && gp < 1) {
      g.save();
      setM(g, mul(cam, Wn)); g.clip(st.die, 'evenodd');
      const x = lerp(-st.w / 2 - 120, st.w / 2 + 120, inOutCubic(gp));
      g.rotate(0.45);
      const gr = g.createLinearGradient(x - 70, 0, x + 70, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(x - 70, -400, 140, 800);
      g.restore();
    }
    surfaceFx(g, st, cam, Wn);
  },

  /** 페이지 컬: 접힘선 너머를 원통 띠 20개 + 날개 하나로. 띠마다 아핀 지도 · 클립 · 앞/뒷면 · 각도 음영 */
  drawPeel(g, cam, Wl, P) {
    const st = this.st.later, { nx, ny } = P;
    const umax = P.d;
    if (umax <= 0.3 || P.gone) return;
    const pieces = peelPieces(umax, P.r, P.phi, 20);
    const curl = pieces.filter((p) => !p.flap), flap = pieces.find((p) => p.flap);
    // 그림자: 높이에 비례해 오른아래로 밀린 부드러운 실루엣
    const cr = Math.cos(-PLACE.later.rot), sr = Math.sin(-PLACE.later.rot);
    const klx = cr * SH_K[0] - sr * SH_K[1], kly = sr * SH_K[0] + cr * SH_K[1];
    const shPieces = [];
    if (curl.length) shPieces.push({ u0: 0, u1: curl[curl.length - 1].u1 });
    if (flap) shPieces.push(flap);
    const shA = 0.42 * (1 - P.fq) ** 2;
    if (shA > 0.003) {
      for (const sp of shPieces) {
        const Pm = pieceMatrix(nx, ny, P.s, sp, P.r, P.phi);
        const Ms = pieceShadowMatrix(Pm, nx, ny, P.s, sp, P.r, P.phi, klx, kly);
        g.save();
        setM(g, mulN(cam, P.Esh, Wl, Ms));
        clipBand(g, nx, ny, P.s + sp.u0 - 0.5, P.s + sp.u1 + (sp === flap ? 90 : 0.5));
        g.globalAlpha = shA;
        drawShadowImg(g, st, true);
        g.restore();
      }
    }
    const rot = PLACE.later.rot + P.flyRot;
    const n3x = Math.cos(rot) * nx - Math.sin(rot) * ny, n3y = Math.sin(rot) * nx + Math.cos(rot) * ny;
    const WE = mul(P.E, Wl);
    for (const p of pieces) {
      const Pm = pieceMatrix(nx, ny, P.s, p, P.r, P.phi);
      g.save();
      setM(g, mulN(cam, WE, Pm));
      clipBand(g, nx, ny, P.s + p.u0 - 0.7, P.s + p.u1 + (p.flap ? 90 : 0.7));
      const ct = Math.cos(p.th), sn = Math.sin(p.th), back = ct < 0;
      if (back) drawBack(g, st); else drawFront(g, st);
      let Nx = -sn * n3x, Ny = -sn * n3y, Nz = ct;
      if (back) { Nx = -Nx; Ny = -Ny; Nz = -Nz; }
      const b = (Nx * LIGHT[0] + Ny * LIGHT[1] + Nz * LIGHT[2]) / LIGHT[2];
      const spec = Math.pow(Math.max(0, Nx * HALF[0] + Ny * HALF[1] + Nz * HALF[2]), 40);
      if (b < 1) { g.fillStyle = `rgba(28,22,34,${Math.min(0.6, (1 - b) * 0.62).toFixed(3)})`; g.fill(st.die, 'evenodd'); }
      else if (b > 1.003) { g.fillStyle = `rgba(255,255,255,${Math.min(0.42, (b - 1) * 0.75).toFixed(3)})`; g.fill(st.die, 'evenodd'); }
      if (spec > 0.02) { g.fillStyle = `rgba(255,255,255,${Math.min(0.6, spec * 0.6).toFixed(3)})`; g.fill(st.die, 'evenodd'); }
      g.strokeStyle = back ? 'rgba(120,108,84,0.55)' : 'rgba(90,80,60,0.35)'; g.lineWidth = 1.3; g.stroke(st.die);   // 비닐 단면
      g.restore();
    }
  },
});
