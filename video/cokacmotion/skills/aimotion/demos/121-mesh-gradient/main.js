/*
 * 121 · 숨 고르는 아침 — 흐르는 그라데이션 메시 · 그레인 · 유리 카드
 *
 * 가상의 호흡·소리 앱 「숨, 고르기」의 오프닝(브랜드 모션). 10초, 1080×1920.
 *   0–1.6   새벽 남보라 메시가 흐르고, 큰 제목 「숨, / 고르기」가 넓은 자간에서 좁혀지며 들어온다(글자 = 메시를 보는 창).
 *   1.5–3   유리 카드 셋(지금 흐르는 소리 · 호흡 가이드 · 연속 기록)이 깊이 차례로 떠올라 자리 잡는다(시차).
 *   3.6–5.8 새벽 → 아침: 색 전선이 아래에서 위로 메시를 쓸고 올라간다. 시계가 05:40 → 07:30으로 구르고,
 *           바탕 명도가 문턱을 넘는 자리마다 제목 창은 밝은 파스텔에서 진한 고채도로, 카드 글자는 크림에서 먹색으로 뒤집힌다.
 *   5.6–6.6 절정: 들숨이 가장 깊어지고(메시가 숨 중심에서 부푼다) 빛줄기가 제목과 유리를 한 번 훑는다. 숨 물결이 유리 밑을 지난다.
 *   6.8     연속 기록 23 → 24일(숫자가 구르고 오늘 점이 찍힌다).
 *   7.7–10  카드가 들어올 때보다 빠르게 빠지고, 유리 앱 아이콘(「숨」)과 알약 「오늘의 숨, 시작하기」가 튀어 올라 끝맺는다.
 *
 * 그림은 모두 Canvas 2D 한 장. 메시는 field.js(108×192에서 OKLab 쌍삼차)로 계산해 확대하고, 그레인은 setup에서 구운 잡음을
 * 초당 24번 옮겨 overlay로 얹는다(카드 아래까지만 — 유리는 매끈하다). 유리는 흐린 메시 사본을 카드 자리에서 그대로 오려 낸다.
 */
import { defineDemo, clamp, lerp, ease, rand } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { S, LW, LH, makeMesh, flipK } from './field.js';

const D = 10;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const sst = (a, b, x) => { const v = clamp((x - a) / (b - a)); return v * v * (3 - 2 * v); };
const { outExpo, outBack, outCubic } = ease;
const pad2 = (n) => String(n).padStart(2, '0');
const KR = `"${FONTS.pretendard.family}"`;
const font = (w, s) => `${w} ${s}px ${KR}`;

// ---------------------------------------------------------------- 시각표 (초)
const T = {
  top: 0.25, title: 0.35, sub: 1.3,
  br0: 2.1,                               // 호흡: 2.1–6.1 들숨, 6.1–10.1 날숨
  sh0: 3.6, sweep: 1.3, swid: 0.9,        // 새벽→아침 전선: 바닥에서 3.6 s 출발, 1.3 s 만에 꼭대기, 한 점이 바뀌는 데 0.9 s
  glint: [5.5, 6.6],                      // 빛줄기 한 번
  streak: 6.8, icon: 8.12, cta: 8.34,
};
const RIPPLES = [3.1, 4.1, 5.1, 6.1, 7.1];  // 들숨·날숨 박자마다 숨 물결

// ---------------------------------------------------------------- 색
// 메시 제어점 5×7 (위 → 아래). 새벽: 깊은 남색 → 보라 → 장밋빛 → 바닥의 호박빛. 아침: 하늘 → 라일락·복숭아 → 산호·보라.
const DAWN = [
  '#13173a', '#1a1c4b', '#231d57', '#1a1b49', '#121533',
  '#1e2157', '#2b286a', '#3a2a77', '#282865', '#1b1f4f',
  '#342c72', '#4c3282', '#5a3789', '#423280', '#2c2a69',
  '#623a87', '#84458d', '#76408d', '#593d8b', '#40377b',
  '#9a4c85', '#bc5c7f', '#b05784', '#864b8a', '#5c438d',
  '#d4707a', '#ea8975', '#e47e73', '#bb6883', '#88588f',
  '#f29f79', '#ffbc84', '#f7ad7c', '#e08d7d', '#b4758d',
];
const DAY = [
  '#a7ccff', '#bad6ff', '#cfdbff', '#c0d2ff', '#a8c4ff',
  '#c5dbff', '#e2dfff', '#f1dbf7', '#dbd7ff', '#bed0ff',
  '#eedbff', '#ffdae6', '#ffd5d7', '#f6d8ee', '#d6d2ff',
  '#ffd9c7', '#ffcab2', '#ffcbb9', '#ffd7d1', '#d5ede5',
  '#ffcfb1', '#ffbaa1', '#ffb5a9', '#f5c1d5', '#cac5f9',
  '#f2a7b7', '#ff9f9b', '#f597ad', '#c8a5ed', '#9fb3f3',
  '#b88de0', '#d989a8', '#c485c8', '#8f8de6', '#7a99e8',
];
const CREAM = [253, 249, 255], INK = [27, 22, 62], SHADOW = '#1b1442';
const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const rgba = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a.toFixed(4)})`;

// ---------------------------------------------------------------- 시간 함수
/** 새벽(0) → 아침(1), 화면 높이 y에서 */
const shift = (y, t) => sst(0, 1, (t - T.sh0 - (1 - y / 1920) * T.sweep) / T.swid);
/** 들숨 0 → 1 → 0 (2.1–6.1 들숨, 6.1–10.1 날숨) */
const breath = (t) => (t < T.br0 ? 0 : 0.5 - 0.5 * Math.cos(Math.PI * Math.min(t - T.br0, 8) / 4));
/** 시차 카메라: 천천히 위로 밀며 조금 다가간다. f = 층의 깊이(0 먼 바탕 … 1 맨 앞 카드) */
function cam(t, f) { const u = sst(0, 1, t / D); return { s: 1 + 0.032 * f * u, dy: (26 - 60 * u) * f }; }
const camPt = (c, x, y) => [540 + (x - 540) * c.s, 960 + (y - 960) * c.s + c.dy];

// ---------------------------------------------------------------- 배치
const M0 = 72;                               // 바깥 여백
const TS = 280, Y1 = 530, Y2 = 858, X0 = 62; // 제목 크기·기준선·왼쪽(광학 보정)
const CARDS = [
  { key: 'A', x: 72, y: 930, w: 936, h: 220, r: 44, z: 0.8, tin: 1.55, tout: 7.90, tilt: -2.5 },
  { key: 'B', x: 72, y: 1190, w: 500, h: 420, r: 44, z: 0.9, tin: 1.72, tout: 7.81, tilt: 2.0 },
  { key: 'C', x: 612, y: 1190, w: 396, h: 420, r: 44, z: 1.0, tin: 1.89, tout: 7.72, tilt: 3.0 },
];
const PILL = { w: 184, h: 64, r: 32, z: 0.5 };
const CTA = { w: 640, h: 128, r: 64, z: 0.9, cy: 1262 };
const ICON = { w: 184, h: 184, r: 56, z: 0.85, cy: 1046 };   // 끝맺음 앱 아이콘: 유리 안의 「숨」
const RING = [250, 214];                      // 카드 B 안의 숨 원 중심(카드 좌표)

let ctx, mesh, fieldC, fieldX, fieldI, winC, winX, winI, glsC, glsX, glsI, noiseC, OFF, winPat;
let LINE1, LINE2;                             // 제목 음절과 폭
const cells = new Map();

// ---------------------------------------------------------------- 도우미
/** 패턴(글자 창)을 현재 변환과 무관하게 화면에 고정한다: 패턴 변환 = CTM⁻¹ · 10배 */
function win() { winPat.setTransform(ctx.getTransform().invertSelf().scaleSelf(S, S)); return winPat; }

/** 고정폭 숫자: 0–9는 같은 칸 폭, 나머지는 제 폭. 반환: 전체 폭 */
function tnum(str, x, y, size, weight, align = 'left') {
  ctx.font = font(weight, size);
  const key = weight + '/' + size;
  if (!cells.has(key)) cells.set(key, Math.max(...'0123456789'.split('').map((d) => ctx.measureText(d).width)));
  const cell = cells.get(key);
  const ws = [...str].map((ch) => (/\d/.test(ch) ? cell : ctx.measureText(ch).width));
  const total = ws.reduce((a, b) => a + b, 0);
  let cx = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
  ctx.textAlign = 'center';
  [...str].forEach((ch, i) => { ctx.fillText(ch, cx + ws[i] / 2, y); cx += ws[i]; });
  ctx.textAlign = 'left';
  return total;
}

function mk(w, h, cpu) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d', cpu)];
}

/** 카드 그림자: 카드보다 조금 작은 둥근 사각형을 흐려 setup에서 한 번 굽는다 */
function bakeShadow(w, h, r, blur, cpu) {
  const pad = Math.ceil(blur * 2.6);
  const [c, x] = mk(w + 2 * pad, h + 2 * pad, cpu);
  x.filter = `blur(${blur}px)`;
  x.fillStyle = SHADOW;
  x.beginPath(); x.roundRect(pad + 18, pad + 14, w - 36, h - 22, r); x.fill();
  return { c, pad };
}

/** 카드의 변환과 불투명도: 깊이(z)만큼 아래에서 떠올라 넘쳤다 자리 잡고, 들숨에 살짝 뜨고, 퇴장은 더 빠르게 */
function cardXf(c, t) {
  const pin = seg(t, c.tin, c.tin + 1.0), pout = seg(t, c.tout, c.tout + 0.42);
  const b = breath(t), cm = cam(t, c.z);
  const dy = (1 - outBack(pin, 1.3)) * 360 * c.z + pout * pout * 560 * c.z
    - 10 * b * c.z + 5 * Math.sin(1.3 * t + c.z * 7) * c.z;
  const sc = lerp(0.86, 1, outExpo(pin)) * (1 - 0.06 * pout);
  const rot = (1 - outCubic(pin)) * c.tilt;
  const alpha = sst(0, 0.4, t - c.tin) * (1 - sst(0.25, 1, pout));
  const [X, Y] = camPt(cm, c.x + c.w / 2, c.y + c.h / 2 + dy);
  const M = new DOMMatrix().translateSelf(X, Y).rotateSelf(rot).scaleSelf(sc * cm.s).translateSelf(-c.w / 2, -c.h / 2);
  return { M, alpha };
}

/** 숨 물결: 카드 B의 숨 원에서 박자마다 하나씩, 시각 τ의 원 중심에서 퍼진다 */
function ripples(t) {
  const out = [];
  for (const tau of RIPPLES) {
    const age = t - tau;
    if (age < 0 || age > 3.8) continue;
    const p = cardXf(CARDS[1], tau).M.transformPoint({ x: RING[0], y: RING[1] });
    const a = (tau === 6.1 ? 1 : 0.72) * sst(0, 0.12, age) * (1 - sst(0.5, 3.8, age));
    out.push({ x: p.x, y: p.y, r: 70 + 340 * age, a });
  }
  if (t > T.icon + 0.12) {   // 끝맺음 아이콘이 튀어 오를 때 한 번
    const age = t - T.icon - 0.12;
    out.push({ x: 540, y: ICON.cy + cam(t, ICON.z).dy, r: 80 + 420 * age, a: sst(0, 0.1, age) * (1 - sst(0.3, 1.7, age)) });
  }
  return out;
}

/** 빛줄기: 화면 대각선(35°)을 따라 한 번 지나가는 띠의 중심 위치. 없으면 null */
const GD = [Math.cos(0.61), Math.sin(0.61)];
function glintPos(t) {
  const e = seg(t, T.glint[0], T.glint[1]);
  return e <= 0 || e >= 1 ? null : lerp(-300, 2100, ease.inOutCubic(e));
}
function glintGrad(P, a, M) {
  // 화면 좌표의 띠를 현재 변환의 지역 좌표로 옮긴다
  let p0 = { x: GD[0] * (P - 100), y: GD[1] * (P - 100) }, p1 = { x: GD[0] * (P + 100), y: GD[1] * (P + 100) };
  if (M) { const inv = M.inverse(); p0 = inv.transformPoint(p0); p1 = inv.transformPoint(p1); }
  const g = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${a.toFixed(4)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  return g;
}

// ---------------------------------------------------------------- 유리
/**
 * 유리 한 장: ① 구운 그림자 ② 둥근 사각형으로 오리고, 화면 좌표 그대로 흐린 메시 사본을 깐다(카드가 움직여도 뒤 그림과 맞물린다)
 * ③ 그 위로 숨 물결을 흐린 띠로(같은 원을 반경 ±34px 방사 그라디언트로) ④ 흰 막(명도) + 위쪽 광택 + 빛줄기
 * ⑤ 1.5px 안쪽 하이라이트 테두리(왼쪽 위가 밝다)
 */
function drawGlass(g, M, alpha, k, t, rips) {
  const { w, h, r } = g;
  ctx.setTransform(M);
  ctx.globalAlpha = alpha * lerp(0.62, 0.34, k);
  ctx.drawImage(g.sh.c, -g.sh.pad, -g.sh.pad + 22 * g.z);
  ctx.globalAlpha = alpha;
  ctx.save();
  ctx.beginPath(); ctx.roundRect(0, 0, w, h, r); ctx.clip();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(glsC, 0, 0, 1080, 1920);
  for (const q of rips) {
    const rg = ctx.createRadialGradient(q.x, q.y, Math.max(0, q.r - 36), q.x, q.y, q.r + 36);
    rg.addColorStop(0, 'rgba(255,255,255,0)');
    rg.addColorStop(0.5, `rgba(255,255,255,${(0.26 * q.a).toFixed(4)})`);
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, 1080, 1920);
  }
  const P = glintPos(t);
  if (P !== null) { ctx.fillStyle = glintGrad(P, lerp(0.22, 0.42, k), null); ctx.fillRect(0, 0, 1080, 1920); }
  ctx.setTransform(M);
  ctx.fillStyle = `rgba(255,255,255,${lerp(0.06, 0.18, k).toFixed(4)})`;
  ctx.fillRect(0, 0, w, h);
  const sh = ctx.createLinearGradient(0, 0, 0, h);
  sh.addColorStop(0, `rgba(255,255,255,${lerp(0.13, 0.24, k).toFixed(4)})`);
  sh.addColorStop(0.45, 'rgba(255,255,255,0)');
  ctx.fillStyle = sh; ctx.fillRect(0, 0, w, h);
  ctx.restore();
  ctx.setTransform(M);
  ctx.globalAlpha = alpha;
  const bg = ctx.createLinearGradient(0, 0, w * 0.35, h);
  bg.addColorStop(0, `rgba(255,255,255,${lerp(0.55, 0.95, k).toFixed(4)})`);
  bg.addColorStop(1, `rgba(255,255,255,${lerp(0.08, 0.38, k).toFixed(4)})`);
  ctx.strokeStyle = bg; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(0.75, 0.75, w - 1.5, h - 1.5, r - 0.75); ctx.stroke();
}

// ---------------------------------------------------------------- 카드 내용 (카드 좌표, 변환 M이 걸린 상태)
function label(text, x, y, col, k) {
  ctx.font = font(600, 26); ctx.fillStyle = rgba(col, lerp(0.74, 0.66, k)); ctx.fillText(text, x, y);
}

function cardA(c, t, col, k) {
  label('지금 흐르는 소리', 40, 60, col, k);
  ctx.font = font(800, 46); ctx.fillStyle = rgba(col); ctx.fillText('새벽 숲, 낮은 빗소리', 40, 120);
  // 재생 막대와 시간(고정폭)
  const sec = 72 + Math.floor(t), fr = (72 + t) / 240, BW = 500;
  ctx.fillStyle = rgba(col, 0.2); ctx.beginPath(); ctx.roundRect(40, 152, BW, 6, 3); ctx.fill();
  ctx.fillStyle = win(); ctx.beginPath(); ctx.roundRect(40, 152, BW * fr, 6, 3); ctx.fill();
  ctx.beginPath(); ctx.arc(40 + BW * fr, 155, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rgba(col, 0.7);
  tnum(`${pad2(Math.floor(sec / 60))}:${pad2(sec % 60)}`, 40, 196, 22, 600);
  tnum('04:00', 40 + BW, 196, 22, 600, 'right');
  // 파형: 막대 18개, 높이는 t의 사인 합
  ctx.fillStyle = win();
  ctx.beginPath();
  for (let i = 0; i < 18; i++) {
    const env = 0.55 + 0.45 * Math.sin(0.9 * t + i * 0.37);
    const v = Math.abs(Math.sin(2.3 * t + i * 0.83) * 0.6 + Math.sin(3.7 * t - i * 0.51) * 0.4);
    const hh = 10 + 58 * env * v;
    ctx.roundRect(592 + i * 11, 110 - hh / 2, 6, hh, 3);
  }
  ctx.fill();
  // 일시정지 단추
  const bx = c.w - 82, by = 110;
  ctx.fillStyle = rgba(col, lerp(0.16, 0.1, k)); ctx.beginPath(); ctx.arc(bx, by, 46, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rgba(col);
  ctx.beginPath(); ctx.roundRect(bx - 13, by - 16, 9, 32, 3); ctx.roundRect(bx + 4, by - 16, 9, 32, 3); ctx.fill();
}

function cardB(c, t, col, k, M) {
  label('호흡 가이드', 40, 60, col, k);
  ctx.fillStyle = rgba(col, 0.66);
  ctx.font = font(600, 26); ctx.textAlign = 'right'; ctx.fillText('들숨 4 · 날숨 4', c.w - 40, 60); ctx.textAlign = 'left';
  const b = breath(t), [rx, ry] = RING, u = t - T.br0;
  // 안내 원과 박자 점 넷
  ctx.strokeStyle = rgba(col, 0.32); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(rx, ry, 112, 0, Math.PI * 2); ctx.stroke();
  const n = u < 0 ? 0 : u < 4 ? Math.floor(u) + 1 : Math.min(4, Math.floor(u - 4) + 1);
  for (let i = 0; i < 4; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 2, px = rx + 112 * Math.cos(a), py = ry + 112 * Math.sin(a);
    ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2);
    if (i < n) { ctx.fillStyle = win(); ctx.fill(); } else { ctx.fillStyle = rgba(col, 0.25); ctx.fill(); }
  }
  // 숨 원판: 글자와 같은 창(진한 메시)
  const rd = 44 + 56 * b;
  ctx.fillStyle = win(); ctx.beginPath(); ctx.arc(rx, ry, rd, 0, Math.PI * 2); ctx.fill();
  const hl = ctx.createRadialGradient(rx - rd * 0.35, ry - rd * 0.45, 0, rx, ry, rd);
  hl.addColorStop(0, 'rgba(255,255,255,0.32)'); hl.addColorStop(0.6, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl; ctx.fill();
  // 박자 숫자: 원판 안에서 굴러 바뀐다
  if (u >= 0) {
    const ph = u < 4 ? u : u - 4, e = outCubic(seg(ph - Math.floor(ph), 0, 0.24));
    const prev = Math.floor(ph) === 0 ? (u >= 4 ? 4 : 0) : n - 1;
    const dcol = mix(INK, CREAM, k);
    ctx.save(); ctx.beginPath(); ctx.arc(rx, ry, rd, 0, Math.PI * 2); ctx.clip();
    ctx.textBaseline = 'middle';
    ctx.fillStyle = rgba(dcol, e); tnum(String(n), rx, ry + 4 + (1 - e) * 46, 64, 800, 'center');
    if (prev > 0 && e < 1) { ctx.fillStyle = rgba(dcol, 1 - e); tnum(String(prev), rx, ry + 4 - e * 46, 64, 800, 'center'); }
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }
  // 들이쉬고 / 내쉬고
  const sw = sst(0, 1, seg(t, 6.02, 6.3));
  ctx.font = font(800, 38); ctx.textAlign = 'center';
  ctx.fillStyle = rgba(col, 1 - sw); ctx.fillText('들이쉬고', rx, 386 - sw * 14);
  ctx.fillStyle = rgba(col, sw); ctx.fillText('내쉬고', rx, 400 - sw * 14);
  ctx.textAlign = 'left';
}

function cardC(c, t, col, k) {
  label('연속 기록', 40, 60, col, k);
  // 23 → 24: 일의 자리만 굴러 바뀐다
  const e = outExpo(seg(t, T.streak, T.streak + 0.5));
  ctx.fillStyle = rgba(col);
  const tens = tnum('2', 36, 212, 132, 800);
  const cell = cells.get('800/132');
  ctx.save(); ctx.beginPath(); ctx.rect(36 + tens - 4, 92, cell + 8, 140); ctx.clip();
  if (e < 1) { ctx.fillStyle = rgba(col, 1 - e); tnum('3', 36 + tens, 212 - e * 120, 132, 800); }
  if (e > 0) { ctx.fillStyle = rgba(col, e); tnum('4', 36 + tens, 212 + (1 - e) * 120, 132, 800); }
  ctx.restore();
  ctx.fillStyle = rgba(col); ctx.font = font(800, 46); ctx.fillText('일', 36 + tens + cell + 8, 210);
  // 요일 점 일곱: 여섯은 채워져 있고, 오늘(마지막)은 6.8 s에 찍힌다
  const days = '월화수목금토일';
  for (let i = 0; i < 7; i++) {
    const x = 53 + i * 48, y = 290;
    if (i < 6) { ctx.fillStyle = win(); ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill(); }
    else {
      ctx.strokeStyle = rgba(col, 0.45); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke();
      const pe = seg(t, T.streak, T.streak + 0.45);
      if (pe > 0) {
        const s = Math.max(0, outBack(pe, 2.2));
        ctx.fillStyle = win(); ctx.beginPath(); ctx.arc(x, y, 13 * s, 0, Math.PI * 2); ctx.fill();
        const re = seg(t, T.streak, T.streak + 0.75);
        if (re < 1) { ctx.strokeStyle = rgba(col, 0.6 * (1 - re)); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 13 + 34 * outCubic(re), 0, Math.PI * 2); ctx.stroke(); }
      }
    }
    ctx.font = font(600, 20); ctx.textAlign = 'center'; ctx.fillStyle = rgba(col, i === 6 ? 0.9 : 0.6);
    ctx.fillText(days[i], x, 338); ctx.textAlign = 'left';
  }
  ctx.font = font(700, 26); ctx.fillStyle = rgba(col, 0.82); ctx.fillText('오늘도 고르게', 40, 392);
}

// ---------------------------------------------------------------- 장면
defineDemo({
  id: '121-mesh-gradient',
  title: '숨 고르는 아침',
  tech: '흐르는 그라데이션 메시 · 필름 그레인 · 유리 카드',
  duration: D,
  background: '#13173a',
  async setup(api) {
    await fontReady(font(900, TS), '숨,고르기흐트러진하루를으로는분지금흐르는소리새벽숲낮은빗소리호흡가이드들숨날숨이쉬고내연속기록일월화수목토오늘도게아침의시작하기매함께루틴0123456789:·→');
    const cpu = api.headless ? { willReadFrequently: true } : undefined;
    ({ ctx } = api.canvas({ type: '2d', attrs: cpu }));
    [fieldC, fieldX] = mk(LW, LH, cpu); fieldI = fieldX.createImageData(LW, LH);
    [winC, winX] = mk(LW, LH, cpu); winI = winX.createImageData(LW, LH);
    [glsC, glsX] = mk(LW, LH, cpu); glsI = glsX.createImageData(LW, LH);
    mesh = makeMesh({ dawn: DAWN, day: DAY, seed: 121 });

    // 필름 그레인: 1180×2020 잡음 한 장(삼각 분포 회색)을 굽고, 프레임마다 초당 24번 바뀌는 오프셋으로 찍는다
    const GW = 1180, GH = 2020;
    let nx;
    [noiseC, nx] = mk(GW, GH, cpu);
    const img = nx.createImageData(GW, GH), r = rand(7), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const v = 128 + 92 * (r() + r() - 1); d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    nx.putImageData(img, 0, 0);
    const ro = rand(24);
    OFF = Array.from({ length: Math.ceil(D * 24) + 2 }, () => [Math.floor(ro() * 100), Math.floor(ro() * 100)]);

    for (const c of CARDS) c.sh = bakeShadow(c.w, c.h, c.r, 26, cpu);
    PILL.sh = bakeShadow(PILL.w, PILL.h, PILL.r, 16, cpu);
    CTA.sh = bakeShadow(CTA.w, CTA.h, CTA.r, 26, cpu);
    ICON.sh = bakeShadow(ICON.w, ICON.h, ICON.r, 24, cpu);

    // 제목 음절 폭
    ctx.font = font(900, TS);
    const meas = (s) => [...s].map((ch) => ({ ch, w: ctx.measureText(ch).width }));
    LINE1 = meas('숨,'); LINE2 = meas('고르기');
  },

  frame(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';

    // ---- 메시 (저해상도 세 장: 바탕, 글자 창, 유리 뒤)
    const b = breath(t);
    const bc = cardXf(CARDS[1], Math.max(t, 3)).M.transformPoint({ x: RING[0], y: RING[1] });
    mesh.compute(t, { prog: (y) => shift(y, t), b, cam: cam(t, 0.3), bc: [bc.x, bc.y], bs: 1 + 0.07 * b });
    mesh.writeField(fieldI.data); fieldX.putImageData(fieldI, 0, 0);
    mesh.writeWindow(winI.data); winX.putImageData(winI, 0, 0);
    mesh.writeGlass(glsI.data, 0.05, 1.12); glsX.putImageData(glsI, 0, 0);
    // 크림 ↔ 먹색: 그 자리의 실제 바탕 명도로 정한다(바탕 글씨는 바탕, 유리 위 글씨는 흐린 사본)
    const kAt = (x, y) => flipK(mesh.L(x, y)), kGl = (x, y) => flipK(mesh.LB(x, y));
    winPat = ctx.createPattern(winC, 'no-repeat');
    ctx.drawImage(fieldC, 0, 0, 1080, 1920);

    // ---- 숨 물결 (바탕 위, 선명한 선)
    const rips = ripples(t);
    ctx.lineWidth = 2.5;
    for (const q of rips) {
      ctx.strokeStyle = `rgba(255,255,255,${(0.42 * q.a).toFixed(4)})`;
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2); ctx.stroke();
    }

    // ---- 자막 자리 아래 어둠(하네스 자막이 밝은 아침 위에서도 읽히게)
    const sc = ctx.createLinearGradient(0, 1560, 0, 1920), sa = lerp(0.4, 0.56, shift(1780, t));   // 아침일수록 진하게
    sc.addColorStop(0, 'rgba(34,16,60,0)'); sc.addColorStop(0.42, `rgba(34,16,60,${(0.66 * sa).toFixed(4)})`); sc.addColorStop(1, `rgba(34,16,60,${sa.toFixed(4)})`);
    ctx.fillStyle = sc; ctx.fillRect(0, 1560, 1080, 360);

    // ---- 제목: 글자가 메시를 보는 창. 넓은 자간에서 좁혀지며 음절마다 숨 들이쉬듯 떠오른다
    const ct = cam(t, 0.6);
    const trk = lerp(0.1, -0.02, outCubic(seg(t, 0.3, 2.9))) * TS;
    const P = glintPos(t);
    ctx.font = font(900, TS);
    let idx = 0;
    for (const [line, base] of [[LINE1, Y1], [LINE2, Y2]]) {
      let x = X0;
      for (const { ch, w } of line) {
        const e = seg(t, T.title + 0.085 * idx, T.title + 0.085 * idx + 1.0), pe = outExpo(e);
        let s = lerp(0.86, 1, pe);
        if (ch === ',') s *= 1 + 0.16 * b;    // 쉼표도 숨을 쉰다
        const [X, Y] = camPt(ct, x + w / 2, base - 0.36 * TS + (1 - pe) * 80);
        const M = new DOMMatrix().translateSelf(X, Y).scaleSelf(s * ct.s).translateSelf(-w / 2, 0.36 * TS);
        ctx.setTransform(M);
        ctx.globalAlpha = sst(0, 0.45, e);
        ctx.fillStyle = win(); ctx.fillText(ch, 0, 0);
        if (P !== null) { ctx.fillStyle = glintGrad(P, 0.6 * kAt(X, Y), M); ctx.fillText(ch, 0, 0); }
        x += w + trk; idx++;
      }
    }
    // 부제: '숨,' 오른쪽에 두 줄
    const subX = X0 + LINE1[0].w + LINE1[1].w + 70;
    [['흐트러진 하루를', 412], ['숨으로 고르는 4분', 472]].forEach(([s, y], i) => {
      const e = outExpo(seg(t, T.sub + 0.12 * i, T.sub + 0.12 * i + 0.9));
      const [X, Y] = camPt(ct, subX, y + (1 - e) * 26);
      ctx.setTransform(ct.s, 0, 0, ct.s, X, Y);
      ctx.globalAlpha = sst(0, 0.5, e);
      ctx.font = font(700, 42); ctx.fillStyle = rgba(mix(CREAM, INK, kAt(X + 150, Y - 14)), 0.92); ctx.fillText(s, 0, 0);
    });

    // ---- 위 줄: 시계(고정폭) + 새벽/아침
    {
      const c = cam(t, 0.5), a = sst(0, 0.6, t - T.top), k = kAt(150, 140), col = mix(CREAM, INK, k);
      const [X, Y] = camPt(c, M0, 150 - (1 - a) * 16);
      ctx.setTransform(c.s, 0, 0, c.s, X, Y); ctx.globalAlpha = a;
      const mins = Math.round(340 + 110 * sst(0, 1, seg(t, T.sh0, T.sh0 + T.sweep + T.swid)));
      ctx.fillStyle = rgba(col);
      const w = tnum(`${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`, 0, 0, 34, 700);
      ctx.font = font(500, 34);
      ctx.fillStyle = rgba(col, 0.72 * (1 - k)); ctx.fillText('새벽', w + 16, 0);
      ctx.fillStyle = rgba(col, 0.72 * k); ctx.fillText('아침', w + 16, 0);
    }
    // ---- 끝맺음 아래 문구(바탕 글자라 그레인 아래)
    {
      const e = outExpo(seg(t, T.cta + 0.25, T.cta + 1.1));
      if (e > 0) {
        const c = cam(t, 0.8), [X, Y] = camPt(c, 540, CTA.cy + 128 + (1 - e) * 20);
        ctx.setTransform(c.s, 0, 0, c.s, X, Y); ctx.globalAlpha = e;
        ctx.font = font(600, 30); ctx.textAlign = 'center'; ctx.fillStyle = rgba(INK, 0.72);
        ctx.fillText('매일 아침 4분, 소리와 함께', 0, 0); ctx.textAlign = 'left';
      }
    }

    // ---- 필름 그레인 (유리 카드 아래까지만)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = lerp(0.3, 0.26, shift(960, t));
    ctx.globalCompositeOperation = 'overlay';
    const [ox, oy] = OFF[Math.min(OFF.length - 1, Math.floor(t * 24))];
    ctx.drawImage(noiseC, -ox, -oy);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    // ---- 위 오른쪽 유리 알약
    {
      const c = cam(t, PILL.z), a = sst(0, 0.6, t - T.top - 0.15), k = kGl(1080 - M0 - PILL.w / 2, 139);
      const [X, Y] = camPt(c, 1080 - M0 - PILL.w / 2, 139 - (1 - a) * 16);
      const M = new DOMMatrix().translateSelf(X, Y).scaleSelf(c.s).translateSelf(-PILL.w / 2, -PILL.h / 2);
      drawGlass(PILL, M, a, k, t, rips);
      ctx.font = font(700, 28); ctx.textAlign = 'center'; ctx.fillStyle = rgba(mix(CREAM, INK, k));
      ctx.fillText('4분 루틴', PILL.w / 2, 42); ctx.textAlign = 'left';
    }

    // ---- 카드 셋 (먼 것부터)
    for (const c of CARDS) {
      const { M, alpha } = cardXf(c, t);
      if (alpha <= 0.001) continue;
      const ce = M.transformPoint({ x: c.w / 2, y: c.h / 2 }), k = kGl(ce.x, ce.y), col = mix(CREAM, INK, k);
      drawGlass(c, M, alpha, k, t, rips);
      ctx.setTransform(M); ctx.globalAlpha = alpha;
      if (c.key === 'A') cardA(c, t, col, k);
      else if (c.key === 'B') cardB(c, t, col, k, M);
      else cardC(c, t, col, k);
      ctx.globalAlpha = 1;
    }

    // ---- 끝맺음 앱 아이콘: 유리 사각 안의 「숨」
    {
      const e = seg(t, T.icon, T.icon + 0.75);
      if (e > 0) {
        const c = cam(t, ICON.z), s = lerp(0.6, 1, outBack(e, 1.7)), a = sst(0, 0.3, e);
        const [X, Y] = camPt(c, 540, ICON.cy);
        const M = new DOMMatrix().translateSelf(X, Y).scaleSelf(s * c.s).translateSelf(-ICON.w / 2, -ICON.h / 2);
        drawGlass(ICON, M, a, 1, t, rips);
        ctx.setTransform(M); ctx.globalAlpha = a;
        // 「숨」 한 글자 모노그램(제목과 같은 창 채움), 날숨에 맞춰 아주 조금 작아진다
        const sc = 1 + 0.03 * breath(t);
        ctx.transform(sc, 0, 0, sc, ICON.w / 2 * (1 - sc), ICON.h / 2 * (1 - sc));
        ctx.font = font(900, 118); ctx.textAlign = 'center'; ctx.fillStyle = win();
        ctx.fillText('숨', ICON.w / 2, ICON.h / 2 + 42); ctx.textAlign = 'left';
      }
    }
    // ---- 끝맺음 유리 알약
    {
      const e = seg(t, T.cta, T.cta + 0.8);
      if (e > 0) {
        const c = cam(t, CTA.z), s = lerp(0.72, 1, outBack(e, 1.6)), a = sst(0, 0.35, e);
        const [X, Y] = camPt(c, 540, CTA.cy);
        const M = new DOMMatrix().translateSelf(X, Y).scaleSelf(s * c.s).translateSelf(-CTA.w / 2, -CTA.h / 2);
        drawGlass(CTA, M, a, 1, t, rips);
        ctx.setTransform(M); ctx.globalAlpha = a;
        ctx.font = font(800, 44); ctx.fillStyle = rgba(INK); ctx.fillText('오늘의 숨, 시작하기', 58, 80);
        const ax = CTA.w - 66, ay = 64;
        ctx.fillStyle = win(); ctx.beginPath(); ctx.arc(ax, ay, 44, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(ax - 14, ay); ctx.lineTo(ax + 14, ay); ctx.moveTo(ax + 3, ay - 12); ctx.lineTo(ax + 15, ay); ctx.lineTo(ax + 3, ay + 12); ctx.stroke();
        ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
  },
});
