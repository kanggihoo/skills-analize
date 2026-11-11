/*
 * art.js — 만화 원고의 그림: 책상과 원고지(구움), 인쇄 결, 칸 배경, 문·초인종, 택배 상자, 고양이 네 자세.
 * 그림은 모두 '스티커' 방식이다: 먹 외곽선 → 종이로 속 메우기(녹아웃) → 색판을 multiply로 비껴 찍기 → 먹 디테일.
 */
import { rand } from '../_lib/stage.js';
import { INK, PAPER, YEL, RED, CYAN, plate, hash, dots, star4 } from './sfx.js';

const TAU = Math.PI * 2;
export const CAT = '#f6ae48', STRIPE = '#e2743c', PINK = '#f39b8b';
export const KRAFT = '#e2aa69', KRAFT_D = '#c98d50', KRAFT_L = '#efc890';

// 원고지(종이) 자리와 칸 자리 — main.js와 공유
export const PAGE = { x0: 30, y0: 40, x1: 1050, y1: 1652 };
export const PANELS = {
  p1: [[66, 132], [478, 132], [446, 582], [66, 582]],
  p2: [[496, 132], [1014, 132], [1014, 582], [464, 582]],
  p3: [[66, 600], [1014, 600], [1014, 904], [66, 934]],
  p4: [[66, 952], [1014, 922], [1014, 1616], [66, 1616]],
  p5: [[680, 1336], [1000, 1316], [1000, 1598], [680, 1598]],
};

// ---------------------------------------------------------------- 도형 도우미
export function polyPath(pts, P = new Path2D()) {
  P.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) P.lineTo(pts[i][0], pts[i][1]);
  P.closePath();
  return P;
}
export function ellPath(x, y, rx, ry, rot = 0, P = new Path2D()) {
  P.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot));
  P.ellipse(x, y, rx, ry, rot, 0, TAU);
  return P;
}
export function capPath(x0, y0, x1, y1, r, P = new Path2D()) {
  const a = Math.atan2(y1 - y0, x1 - x0), h = Math.PI / 2;
  P.moveTo(x0 + r * Math.cos(a - h), y0 + r * Math.sin(a - h));
  P.arc(x1, y1, r, a - h, a + h);
  P.arc(x0, y0, r, a + h, a + 3 * h);
  P.closePath();
  return P;
}
function rrectPath(x, y, w, h, r, P = new Path2D()) {
  P.moveTo(x + r, y); P.arcTo(x + w, y, x + w, y + h, r); P.arcTo(x + w, y + h, x, y + h, r);
  P.arcTo(x, y + h, x, y, r); P.arcTo(x, y, x + w, y, r); P.closePath();
  return P;
}
/** Catmull-Rom으로 부드럽게 한 중심선 */
function smoothLine(pts, n = 8) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
/** 굵기가 w0 → w1로 줄어드는 관(꼬리). fur > 0이면 가장자리가 털처럼 들쭉날쭉 */
export function tubePath(pts, w0, w1, { fur = 0, seed = 3 } = {}) {
  const S = smoothLine(pts, 8), n = S.length, Lft = [], Rgt = [];
  for (let i = 0; i < n; i++) {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const u = i / (n - 1);
    let w = (w0 + (w1 - w0) * u) / 2;
    const fl = fur ? fur * (i % 2 ? 1 : 0.15) * (0.6 + 0.8 * hash(seed, i)) : 0, fr = fur ? fur * (i % 2 ? 0.15 : 1) * (0.6 + 0.8 * hash(seed, i, 1)) : 0;
    Lft.push([S[i][0] - ty * (w + fl), S[i][1] + tx * (w + fl)]);
    Rgt.push([S[i][0] + ty * (w + fr), S[i][1] - tx * (w + fr)]);
  }
  const P = new Path2D();
  P.moveTo(Lft[0][0], Lft[0][1]);
  for (let i = 1; i < n; i++) P.lineTo(Lft[i][0], Lft[i][1]);
  const e = S[n - 1], q = S[n - 2], a = Math.atan2(e[1] - q[1], e[0] - q[0]);
  P.arc(e[0], e[1], w1 / 2 + (fur ? fur * 0.5 : 0), a + Math.PI / 2, a - Math.PI / 2, true);
  for (let i = n - 1; i >= 0; i--) P.lineTo(Rgt[i][0], Rgt[i][1]);
  P.closePath();
  return P;
}

/**
 * 스티커: parts = [{ P, col, pl, ink }]. 먹선을 모두 먼저 긋고 종이로 모두 메운 뒤 색판을 찍으므로
 * 겹친 부품들의 바깥선만 남는다(합집합 외곽선). w = 보이는 먹선 굵기(현재 변환 단위).
 */
export function sticker(ctx, parts, w = 4.5) {
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 2 * w;
  for (const p of parts) if (p.ink !== false) ctx.stroke(p.P);
  ctx.fillStyle = PAPER;
  for (const p of parts) ctx.fill(p.P);
  ctx.globalCompositeOperation = 'multiply';
  for (const p of parts) {
    if (!p.col) continue;
    ctx.save(); plate(ctx, p.pl || 'Y'); ctx.fillStyle = p.col; ctx.fill(p.P); ctx.restore();
  }
  ctx.restore();
}
/** 판 하나로 색을 multiply 해서 찍는다 */
export function tint(ctx, P, col, pl = 'Y', alpha = 1) {
  ctx.save(); plate(ctx, pl);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = alpha;
  ctx.fillStyle = col; ctx.fill(P);
  ctx.restore();
}
export function inkLine(ctx, pts, w = 3, alpha = 1) {
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke(); ctx.restore();
}

// ---------------------------------------------------------------- 구워 두는 것
/** 책상 + 원고지(그림자, 결, 바랜 가장자리, 하늘색 밑그림 칸, 재단선) + 머리글 */
export async function bakePage(W, H, headless) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  // 책상: 어두운 회청색 + 스탠드 불빛
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#2c2832'); gr.addColorStop(1, '#16151a');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const lamp = g.createRadialGradient(860, 120, 40, 860, 120, 1500);
  lamp.addColorStop(0, 'rgba(255,210,150,0.16)'); lamp.addColorStop(1, 'rgba(255,210,150,0)');
  g.fillStyle = lamp; g.fillRect(0, 0, W, H);
  const R = rand(5051);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,240,220,${(R() * 0.035).toFixed(3)})`; g.fillRect(R() * W, R() * H, 1 + R() * 1.5, 1 + R() * 1.5); }
  // 다음 장이 살짝 비껴 깔려 있다
  g.save(); g.translate(540, 900); g.rotate(-0.018); g.translate(-540, -900);
  g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30; g.shadowOffsetY = 10;
  g.fillStyle = '#d9cfba'; g.fillRect(PAGE.x0 + 10, PAGE.y0 + 18, PAGE.x1 - PAGE.x0, PAGE.y1 - PAGE.y0);
  g.restore();
  // 원고지
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 44; g.shadowOffsetY = 16;
  g.fillStyle = '#f4ebd7'; g.fillRect(PAGE.x0, PAGE.y0, PAGE.x1 - PAGE.x0, PAGE.y1 - PAGE.y0);
  g.restore();
  g.save();
  g.beginPath(); g.rect(PAGE.x0, PAGE.y0, PAGE.x1 - PAGE.x0, PAGE.y1 - PAGE.y0); g.clip();
  // 얼룩(저주파)
  for (let i = 0; i < 70; i++) {
    const x = PAGE.x0 + R() * 1020, y = PAGE.y0 + R() * 1612, r = 60 + R() * 220;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.025 + R() * 0.03;
    rg.addColorStop(0, R() < 0.5 ? `rgba(196,170,120,${a})` : `rgba(255,252,240,${a * 1.4})`); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  // 가장자리 바램
  const ed = g.createRadialGradient(540, 846, 600, 540, 846, 1100);
  ed.addColorStop(0, 'rgba(180,140,80,0)'); ed.addColorStop(1, 'rgba(180,140,80,0.16)');
  g.fillStyle = ed; g.fillRect(0, 0, W, H);
  // 하늘색 밑그림(비사진 청색): 칸 자리, 여백선
  g.strokeStyle = 'rgba(70,150,215,0.30)'; g.lineWidth = 1.6;
  for (const k of ['p1', 'p2', 'p3', 'p4']) {
    const p = PANELS[k];
    g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]); g.closePath(); g.stroke();
    // 대각선 두 줄(칸 비움 표시)
    g.globalAlpha = 0.5; g.beginPath(); g.moveTo(p[0][0], p[0][1]); g.lineTo(p[2][0], p[2][1]); g.moveTo(p[1][0], p[1][1]); g.lineTo(p[3][0], p[3][1]); g.stroke(); g.globalAlpha = 1;
  }
  g.strokeRect(52, 120, 976, 1510);
  // 재단선
  g.strokeStyle = 'rgba(35,29,34,0.55)'; g.lineWidth = 1.4;
  for (const [x, y, sx, sy] of [[44, 54, 1, 1], [1036, 54, -1, 1], [44, 1638, 1, -1], [1036, 1638, -1, -1]]) {
    g.beginPath(); g.moveTo(x, y + sy * 22); g.lineTo(x, y); g.lineTo(x + sx * 22, y); g.stroke();
  }
  // 머리글: 화 번호 + 제목 + 꼬리말
  g.fillStyle = RED; g.fillRect(66, 70, 46, 42);
  g.fillStyle = PAPER; g.font = '800 26px "Pretendard Variable"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('07', 89, 92);
  g.fillStyle = INK; g.textAlign = 'left'; g.font = '800 34px "Pretendard Variable"';
  g.fillText('택배 왔다', 124, 92);
  g.textAlign = 'right'; g.font = '600 22px "Pretendard Variable"'; g.globalAlpha = 0.55;
  g.fillText('고양이 생활', 1014, 94);
  g.globalAlpha = 1;
  // 망점 줄 장식
  g.fillStyle = INK; g.globalAlpha = 0.5;
  for (let i = 0; i < 26; i++) { g.beginPath(); g.arc(300 + i * 13, 92, 1 + 2.6 * (i / 25), 0, TAU); g.fill(); }
  g.globalAlpha = 1;
  g.restore();
  return createImageBitmap(c);
}

/** 인쇄 결(multiply로 덮음): 흰 바탕에 잔티, 섬유, 잉크 번짐 얼룩 */
export async function bakeGrain(W, H, headless) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
  g.save(); g.beginPath(); g.rect(PAGE.x0, PAGE.y0, PAGE.x1 - PAGE.x0, PAGE.y1 - PAGE.y0); g.clip();
  const R = rand(7717);
  for (let i = 0; i < 9000; i++) {
    const v = 200 + Math.floor(R() * 50);
    g.fillStyle = `rgba(${v},${v - 8},${v - 22},${(0.25 + R() * 0.4).toFixed(2)})`;
    const s = 0.8 + R() * 1.6; g.fillRect(PAGE.x0 + R() * 1020, PAGE.y0 + R() * 1612, s, s);
  }
  g.lineCap = 'round';
  for (let i = 0; i < 900; i++) {
    const x = PAGE.x0 + R() * 1020, y = PAGE.y0 + R() * 1612, a = R() * TAU, l = 6 + R() * 22;
    g.strokeStyle = `rgba(150,130,100,${(0.05 + R() * 0.09).toFixed(3)})`; g.lineWidth = 0.6 + R() * 0.8;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.6, y + Math.sin(a + 0.6) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // 잉크가 덜 묻은 결(가로 줄무늬, 아주 옅게)
  for (let y = PAGE.y0; y < PAGE.y1; y += 3) {
    const a = 0.02 * (0.5 + 0.5 * Math.sin(y * 0.031) * Math.sin(y * 0.0071));
    g.fillStyle = `rgba(120,110,90,${a.toFixed(4)})`; g.fillRect(PAGE.x0, y, 1020, 1);
  }
  g.restore();
  return createImageBitmap(c);
}

// ---------------------------------------------------------------- 고양이
function earParts(hx, hy, r, back = 0) {
  return [
    polyPath([[hx - 0.92 * r, hy - 0.3 * r], [hx - (0.82 + 0.55 * back) * r, hy - (1.32 - 0.5 * back) * r], [hx - 0.22 * r, hy - 0.86 * r]]),
    polyPath([[hx + 0.12 * r, hy - 0.94 * r], [hx + (0.66 - 0.75 * back) * r, hy - (1.42 - 0.5 * back) * r], [hx + 0.9 * r, hy - 0.4 * r]]),
  ];
}
/** 얼굴: mood = 'focus' | 'wide' | 'sparkle' */
function catFace(ctx, hx, hy, r, mood, blink = 0, back = 0) {
  ctx.save();
  // 귀 안쪽
  const ie = [
    polyPath([[hx - 0.78 * r, hy - 0.42 * r], [hx - (0.8 + 0.5 * back) * r, hy - (1.12 - 0.42 * back) * r], [hx - 0.36 * r, hy - 0.8 * r]]),
    polyPath([[hx + 0.24 * r, hy - 0.86 * r], [hx + (0.64 - 0.66 * back) * r, hy - (1.2 - 0.42 * back) * r], [hx + 0.78 * r, hy - 0.5 * r]]),
  ];
  for (const P of ie) tint(ctx, P, PINK, 'M');
  // 이마 줄무늬
  ctx.save(); plate(ctx, 'M'); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = STRIPE;
  for (const [dx, w] of [[-0.18, 0.09], [0.06, 0.1], [0.3, 0.08]]) {
    ctx.beginPath(); ctx.moveTo(hx + dx * r - w * r, hy - 0.93 * r); ctx.lineTo(hx + dx * r + w * r, hy - 0.93 * r); ctx.lineTo(hx + dx * r, hy - 0.55 * r); ctx.fill();
  }
  ctx.restore();
  // 주둥이(흰 털: 노랑판을 비움)
  ctx.save(); plate(ctx, 'Y'); ctx.fillStyle = PAPER;
  ctx.fill(ellPath(hx + 0.38 * r, hy + 0.36 * r, 0.46 * r, 0.32 * r, -0.1));
  ctx.restore();
  // 눈
  const eyes = [[hx - 0.08 * r, hy - 0.08 * r], [hx + 0.6 * r, hy - 0.1 * r]];
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineWidth = 0.075 * r;
  for (const [ex, ey] of eyes) {
    if (blink > 0.5) { ctx.beginPath(); ctx.moveTo(ex - 0.13 * r, ey); ctx.quadraticCurveTo(ex, ey + 0.1 * r, ex + 0.13 * r, ey); ctx.stroke(); continue; }
    const rx = mood === 'sparkle' ? 0.2 * r : mood === 'focus' ? 0.16 * r : 0.12 * r, ry = mood === 'sparkle' ? 0.24 * r : mood === 'focus' ? 0.2 * r : 0.17 * r;
    ctx.fill(ellPath(ex, ey, rx, ry));
    ctx.fillStyle = PAPER;
    ctx.fill(ellPath(ex + 0.05 * r, ey - 0.07 * r, 0.06 * r, 0.06 * r));
    if (mood === 'sparkle') { const S = new Path2D(); star4(S, ex - 0.06 * r, ey + 0.08 * r, 0.09 * r, 0.3); ctx.fill(S); }
    ctx.fillStyle = INK;
  }
  // 코, 입, 수염
  const nx = hx + 0.42 * r, ny = hy + 0.2 * r;
  ctx.save(); plate(ctx, 'M'); ctx.fillStyle = RED;
  ctx.beginPath(); ctx.moveTo(nx - 0.08 * r, ny - 0.04 * r); ctx.lineTo(nx + 0.08 * r, ny - 0.04 * r); ctx.lineTo(nx, ny + 0.05 * r); ctx.fill();
  ctx.restore();
  ctx.lineWidth = 0.05 * r;
  ctx.beginPath();
  ctx.moveTo(nx - 0.16 * r, ny + 0.12 * r); ctx.quadraticCurveTo(nx - 0.08 * r, ny + 0.22 * r, nx, ny + 0.08 * r);
  ctx.quadraticCurveTo(nx + 0.08 * r, ny + 0.22 * r, nx + 0.16 * r, ny + 0.12 * r);
  ctx.stroke();
  ctx.lineWidth = 0.035 * r;
  ctx.beginPath();
  for (const s of [-1, 1]) {
    ctx.moveTo(nx + 0.26 * r, ny + (0.05 + s * 0.05) * r); ctx.lineTo(nx + 0.78 * r, ny + (0.0 + s * 0.14) * r);
  }
  ctx.moveTo(nx - 0.5 * r, ny + 0.02 * r); ctx.lineTo(nx - 0.9 * r, ny - 0.04 * r);
  ctx.stroke();
  if (mood === 'sparkle') { // 볼터치
    ctx.save(); ctx.globalAlpha = 0.85;
    tint(ctx, ellPath(hx - 0.3 * r, hy + 0.32 * r, 0.16 * r, 0.09 * r), PINK, 'M');
    tint(ctx, ellPath(hx + 0.86 * r, hy + 0.28 * r, 0.12 * r, 0.08 * r), PINK, 'M');
    ctx.restore();
  }
  ctx.restore();
}
function bodyStripes(ctx, cx, cy, rx, ry, rot, n = 3) {
  ctx.save(); plate(ctx, 'M'); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = STRIPE;
  ctx.translate(cx, cy); ctx.rotate(rot);
  for (let i = 0; i < n; i++) {
    const x = -rx * 0.55 + i * rx * 0.42;
    ctx.beginPath(); ctx.moveTo(x - 10, -ry * 0.98); ctx.quadraticCurveTo(x + 6, -ry * 0.5, x - 4, -ry * 0.12); ctx.quadraticCurveTo(x + 18, -ry * 0.55, x + 12, -ry * 0.98); ctx.fill();
  }
  ctx.restore();
}

/** 달리는 고양이(오른쪽을 향함, 원점 = 몸통 중심). ghost: 잔상 색이면 색만 찍는다 */
export function catDash(ctx, { ghost = null, run = 0 } = {}) {
  const sw = Math.sin(run * TAU) * 0.18;
  const parts = [
    { P: tubePath([[-86, -8], [-138, -30], [-196, -30], [-236, -52]], 24, 15), col: CAT },
    { P: capPath(-58, 10, -150 + sw * 40, 38, 15), col: CAT },
    { P: capPath(-48, 14, -132, 54 - sw * 30, 14), col: CAT },
    { P: ellPath(0, 0, 100, 38, -0.04), col: CAT },
    { P: capPath(58, 12, 152, 30 - sw * 30, 14), col: CAT },
    { P: capPath(66, 18, 142 + sw * 40, 50, 13), col: CAT },
    { P: ellPath(120, -22, 50, 44), col: CAT },
    ...earParts(120, -22, 46, 1).map((P) => ({ P, col: CAT })),
  ];
  if (ghost) {
    ctx.save(); plate(ctx, 'C'); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = ghost;
    for (const p of parts) ctx.fill(p.P);
    ctx.restore();
    return;
  }
  sticker(ctx, parts, 4.6);
  // 배 흰 털, 줄무늬
  ctx.save(); plate(ctx, 'Y'); ctx.fillStyle = PAPER; ctx.fill(ellPath(10, 22, 62, 14, -0.04)); ctx.restore();
  bodyStripes(ctx, 0, 0, 100, 38, -0.04, 3);
  inkLine(ctx, [[64, 22], [96, 34]], 3); inkLine(ctx, [[-52, 20], [-86, 32]], 3);
  catFace(ctx, 120, -22, 46, 'focus', 0, 1);
}

/** 웅크린 고양이(사냥 자세). wig: 엉덩이 흔들림(px) */
export function catCrouch(ctx, { wig = 0, tailK = 0 } = {}) {
  const tw = Math.sin(tailK) * 6;
  const rear = [
    { P: tubePath([[-80 + wig, -20], [-102 + wig, -78], [-96 + wig + tw, -136], [-72 + wig + tw * 1.5, -158]], 22, 15), col: CAT },
    { P: ellPath(-52 + wig, 46, 32, 12), col: CAT },
    { P: ellPath(-56 + wig, 2, 48, 44, 0.2), col: CAT },
  ];
  const front = [
    { P: ellPath(4, 14, 94, 34, 0.1), col: CAT },
    { P: ellPath(96, 52, 24, 11), col: CAT },
    { P: ellPath(128, 54, 24, 11), col: CAT },
    { P: ellPath(116, 10, 48, 42), col: CAT },
    ...earParts(116, 10, 44, 0.15).map((P) => ({ P, col: CAT })),
  ];
  sticker(ctx, rear.concat(front), 4.6);
  ctx.save(); plate(ctx, 'Y'); ctx.fillStyle = PAPER; ctx.fill(ellPath(30, 34, 50, 10, 0.1)); ctx.restore();
  bodyStripes(ctx, -10, 14, 94, 34, 0.1, 3);
  bodyStripes(ctx, -56 + wig, 2, 48, 44, 0.2, 2);
  inkLine(ctx, [[-22 + wig, 30], [-38 + wig, 44]], 3);
  catFace(ctx, 116, 10, 44, 'focus', 0, 0.1);
}

/** 상자에서 얼굴을 내민 고양이(원점 = 머리 중심) */
export function catPeek(ctx, { blink = 0 } = {}) {
  const parts = [{ P: ellPath(0, 0, 66, 58), col: CAT }, ...earParts(0, 0, 60, 0).map((P) => ({ P, col: CAT }))];
  sticker(ctx, parts, 4.4);
  catFace(ctx, -14, 4, 58, 'sparkle', blink, 0);
}
export function catPaws(ctx) {
  sticker(ctx, [{ P: ellPath(-46, 0, 24, 15), col: CAT }, { P: ellPath(40, 0, 24, 15), col: CAT }], 4.2);
  inkLine(ctx, [[-50, -2], [-50, 10]], 2.6); inkLine(ctx, [[-40, -2], [-40, 10]], 2.6);
  inkLine(ctx, [[36, -2], [36, 10]], 2.6); inkLine(ctx, [[46, -2], [46, 10]], 2.6);
}

// ---------------------------------------------------------------- 택배 상자
/**
 * 3/4로 본 상자. (x, y) = 앞면 왼쪽 아래, 깊이 벡터 (dx, dy).
 * open > 0이면 덮개가 그만큼 열리고, inner(ctx)가 안쪽 어둠과 앞벽 사이에 그려진다(꼬리 등).
 */
export function drawBox(ctx, x, y, w, h, dx, dy, { open = 0, flutter = 0, inner = null, w0 = 3.8, seed = 1 } = {}) {
  const fTL = [x, y - h], fTR = [x + w, y - h], fBR = [x + w, y], fBL = [x, y];
  const bTL = [x + dx, y - h + dy], bTR = [x + w + dx, y - h + dy], bBR = [x + w + dx, y + dy];
  const front = polyPath([fTL, fTR, fBR, fBL]), side = polyPath([fTR, bTR, bBR, fBR]);
  if (open <= 0) {
    const top = polyPath([fTL, fTR, bTR, bTL]);
    sticker(ctx, [{ P: side, col: KRAFT_D }, { P: front, col: KRAFT }, { P: top, col: KRAFT_L }], w0);
    // 덮개 이음매와 테이프
    const m0 = [(fTL[0] + fTR[0]) / 2, fTL[1]], m1 = [(bTL[0] + bTR[0]) / 2, bTL[1]];
    const tw = w * 0.12;
    const tape = polyPath([[m0[0] - tw, m0[1]], [m0[0] + tw, m0[1]], [m1[0] + tw, m1[1]], [m1[0] - tw, m1[1]]]);
    const tape2 = polyPath([[m0[0] - tw, m0[1]], [m0[0] + tw, m0[1]], [m0[0] + tw, m0[1] + h * 0.34], [m0[0] - tw, m0[1] + h * 0.34]]);
    ctx.save(); ctx.fillStyle = PAPER; ctx.fill(tape); ctx.fill(tape2); ctx.restore();
    tint(ctx, tape, '#f7e3b4', 'Y'); tint(ctx, tape2, '#f7e3b4', 'Y');
    inkLine(ctx, [m0, m1], 2.4);
    // 위쪽 화살표 두 개(취급 표시 낙서)
    const ax = x + w * 0.24, ay = y - h * 0.5;
    for (const k of [0, 1]) inkLine(ctx, [[ax + k * 16, ay + 16], [ax + k * 16, ay - 10]], 2.4), inkLine(ctx, [[ax + k * 16 - 7, ay - 3], [ax + k * 16, ay - 11], [ax + k * 16 + 7, ay - 3]], 2.4);
    return;
  }
  // 열린 덮개: 경첩 모서리 + (닫힘 → 열림) 방향
  const fl = (A, B, closed, opened, len, k) => {
    const ang = flutter * Math.sin(k * 2.1 + seed);
    let ux = closed[0] + (opened[0] - closed[0]) * open, uy = closed[1] + (opened[1] - closed[1]) * open;
    const c = Math.cos(ang), s = Math.sin(ang);
    [ux, uy] = [ux * c - uy * s, ux * s + uy * c];
    const L = Math.hypot(ux, uy) || 1;
    ux = ux / L * len; uy = uy / L * len;
    return polyPath([A, B, [B[0] + ux, B[1] + uy], [A[0] + ux * 0.92, A[1] + uy * 0.92]]);
  };
  const flapBack = fl(bTL, bTR, [-dx, -dy], [0.2, -1], h * 0.62, 0);
  const flapL = fl(fTL, bTL, [1, 0], [-1, -0.55], w * 0.42, 1);
  const flapR = fl(fTR, bTR, [-1, 0], [1, -0.7], w * 0.4, 2);
  const flapF = fl(fTL, fTR, [dx, dy], [-0.12, 1], h * 0.48, 3);
  sticker(ctx, [{ P: flapBack, col: KRAFT_L }, { P: flapL, col: KRAFT_L }, { P: flapR, col: KRAFT_D }], w0);
  // 안쪽: 어둠 + 뒷벽 안쪽
  const hole = polyPath([fTL, fTR, bTR, bTL]);
  sticker(ctx, [{ P: hole, col: '#5a4a3e', pl: 'K' }], w0);
  if (inner) inner(ctx);
  sticker(ctx, [{ P: side, col: KRAFT_D }, { P: front, col: KRAFT }], w0);
  sticker(ctx, [{ P: flapF, col: KRAFT_L }], w0);
  const ax = x + w * 0.24, ay = y - h * 0.32;
  for (const k of [0, 1]) inkLine(ctx, [[ax + k * 18, ay + 18], [ax + k * 18, ay - 12]], 2.6), inkLine(ctx, [[ax + k * 18 - 8, ay - 4], [ax + k * 18, ay - 13], [ax + k * 18 + 8, ay - 4]], 2.6);
}

// ---------------------------------------------------------------- 칸 배경
export function panelPath(k) { return polyPath(PANELS[k]); }

/** 칸 1: 현관 밖. bell = 초인종 불(0..1), arcs = [[나이, 세기]…] 소리 호 */
export function drawP1(ctx, bell, arcs) {
  const P = panelPath('p1');
  ctx.fillStyle = PAPER; ctx.fill(P);
  tint(ctx, P, '#d3e8f0', 'C');
  // 벽 판자 줄
  ctx.save(); ctx.strokeStyle = INK; ctx.globalAlpha = 0.22; ctx.lineWidth = 2;
  ctx.beginPath(); for (let y = 160; y < 548; y += 34) { ctx.moveTo(60, y); ctx.lineTo(480, y - 4); } ctx.stroke(); ctx.restore();
  // 벽 그늘 망점(위쪽이 진함)
  ctx.save(); ctx.fillStyle = '#2f6f9a'; ctx.globalCompositeOperation = 'multiply';
  dots(ctx, [60, 130, 480, 548], 0, 0, 9, Math.PI / 4, (x, y) => 2.4 * Math.max(0, 1 - (y - 130) / 260) * Math.min(1, Math.max(0, (x - 236) / 140)));
  ctx.restore();
  // 바닥
  const floor = polyPath([[60, 548], [480, 548], [480, 590], [60, 590]]);
  ctx.fillStyle = PAPER; ctx.fill(floor); tint(ctx, floor, '#ddd5c4', 'Y');
  inkLine(ctx, [[60, 548], [480, 548]], 3.2);
  // 문틀 + 문
  sticker(ctx, [{ P: polyPath([[74, 166], [238, 166], [238, 548], [74, 548]]), col: '#86b6c9', pl: 'C' }], 4);
  sticker(ctx, [{ P: polyPath([[88, 182], [224, 182], [224, 548], [88, 548]]), col: '#ea8a70', pl: 'M' }], 3.6);
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 2.6;
  ctx.stroke(rrectPath(106, 206, 100, 136, 8)); ctx.stroke(rrectPath(106, 364, 100, 160, 8)); ctx.restore();
  tint(ctx, rrectPath(110, 210, 92, 128, 6), '#f3b7a6', 'M', 0.8);
  sticker(ctx, [{ P: capPath(192, 376, 214, 376, 7), col: YEL }, { P: ellPath(196, 376, 11, 11), col: YEL }], 3);
  sticker(ctx, [{ P: ellPath(156, 196, 7, 7), col: '#c9c1b0' }], 2.4);
  // 초인종
  const bx = 265, by = 342;
  sticker(ctx, [{ P: rrectPath(bx - 16, by - 26, 32, 52, 7), col: '#efe6d2' }], 3.2);
  if (bell > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = bell; plate(ctx, 'Y');
    ctx.fillStyle = YEL; ctx.fill(ellPath(bx, by, 26, 26)); ctx.restore();
  }
  sticker(ctx, [{ P: ellPath(bx, by, 9, 9), col: bell > 0.2 ? YEL : '#e2d9c5' }], 2.6);
  // 소리 호
  ctx.save(); ctx.strokeStyle = INK; ctx.lineCap = 'round';
  for (const [age, k] of arcs) {
    for (let j = 0; j < 3; j++) {
      const r = 26 + j * 15 + age * 26, a = Math.max(0, Math.min(1, k * (1 - j * 0.2)));
      if (a <= 0) continue;
      ctx.lineWidth = 3.6 - j * 0.6; ctx.globalAlpha = a;
      ctx.beginPath(); ctx.arc(bx, by, r, -0.75, 0.75); ctx.stroke();
      ctx.beginPath(); ctx.arc(bx, by, r, Math.PI - 0.75, Math.PI + 0.75); ctx.stroke();
    }
  }
  ctx.restore();
  // 발매트 + 상자
  sticker(ctx, [{ P: polyPath([[82, 548], [230, 548], [252, 576], [60, 576]]), col: '#c95c47', pl: 'M' }], 3.4);
  inkLine(ctx, [[94, 556], [236, 556]], 2, 0.6); inkLine(ctx, [[80, 566], [246, 566]], 2, 0.6);
  drawBox(ctx, 98, 566, 100, 72, 30, -18, { w0: 3.4 });
}

/** 칸 2: 거실. 벽, 마룻바닥, 액자, 방석 */
export function drawP2(ctx, dent) {
  const P = panelPath('p2');
  ctx.fillStyle = PAPER; ctx.fill(P);
  const wall = polyPath([[440, 120], [1030, 120], [1030, 514], [440, 514]]);
  tint(ctx, wall, '#fbe9bd', 'Y');
  const floor = polyPath([[440, 514], [1030, 514], [1030, 600], [440, 600]]);
  tint(ctx, floor, '#efc0a0', 'M');
  ctx.save(); ctx.strokeStyle = INK; ctx.globalAlpha = 0.35; ctx.lineWidth = 2;
  ctx.beginPath(); for (let i = -6; i < 12; i++) { ctx.moveTo(740 + i * 34, 514); ctx.lineTo(740 + i * 80, 600); } ctx.stroke(); ctx.restore();
  sticker(ctx, [{ P: polyPath([[440, 500], [1030, 500], [1030, 516], [440, 516]]), col: '#f6efe0' }], 2.6);
  // 벽의 망점(오른쪽 위가 진함)
  ctx.save(); ctx.fillStyle = '#b8862e'; ctx.globalCompositeOperation = 'multiply';
  dots(ctx, [460, 130, 1016, 500], 0, 0, 10, Math.PI / 4, (x, y) => 2.6 * Math.max(0, Math.min(1, (x - 760) / 260)) * Math.max(0, 1 - (y - 130) / 300));
  ctx.restore();
  // 액자: 산과 해 낙서
  sticker(ctx, [{ P: polyPath([[884, 168], [984, 168], [984, 252], [884, 252]]), col: '#9fd0e5', pl: 'C' }], 3.6);
  ctx.save(); ctx.fillStyle = PAPER; ctx.fillRect(896, 180, 76, 60); ctx.restore();
  inkLine(ctx, [[900, 236], [922, 206], [936, 222], [950, 200], [970, 236]], 2.6);
  sticker(ctx, [{ P: ellPath(958, 194, 8, 8), col: RED, pl: 'M' }], 2);
  // 방석 (고양이가 박차고 나간 자리)
  sticker(ctx, [{ P: ellPath(566, 508, 74, 20 - dent * 5), col: '#8fcbe6', pl: 'C' }], 3.8);
  inkLine(ctx, [[520, 506], [612, 506]], 2, 0.5);
}

/** 칸 3: 긴장 — 위에서 짙어지는 망점, 바닥, 닫힌 상자 */
export function drawP3(ctx) {
  const P = panelPath('p3');
  ctx.fillStyle = PAPER; ctx.fill(P);
  const floor = polyPath([[50, 878], [1030, 860], [1030, 950], [50, 950]]);
  tint(ctx, floor, '#f2cbb7', 'M');
  ctx.save(); ctx.fillStyle = INK; ctx.globalCompositeOperation = 'multiply';
  dots(ctx, [60, 596, 1020, 880], 0, 0, 9, Math.PI / 4, (x, y) => {
    const d = Math.hypot((x - 560) * 0.7, (y - 820) * 1.25);
    return 3.1 * Math.max(0, Math.min(1, (d - 150) / 420)) * Math.max(0, 1 - (y - 600) / 330);
  });
  ctx.restore();
  inkLine(ctx, [[50, 878], [1030, 860]], 3.2);
  drawBox(ctx, 772, 870, 158, 116, 40, -24, { w0: 3.8 });
}

/** 칸 4 배경: 바깥으로 짙어지는 파랑 망점 */
export function drawP4bg(ctx, vx, vy) {
  const P = panelPath('p4');
  ctx.fillStyle = PAPER; ctx.fill(P);
  tint(ctx, P, '#e3f1f6', 'C');
  ctx.save(); ctx.fillStyle = CYAN; ctx.globalCompositeOperation = 'multiply'; plate(ctx, 'C');
  dots(ctx, [60, 916, 1020, 1620], vx, vy, 10, Math.PI / 12, (x, y) => 4.2 * Math.max(0, Math.min(1, (Math.hypot(x - vx, (y - vy) * 1.2) - 260) / 520)));
  ctx.restore();
}

/** 칸 5(속 칸): 따뜻한 노랑 바탕 + 둥근 망점 */
export function drawP5bg(ctx) {
  const P = panelPath('p5');
  ctx.fillStyle = PAPER; ctx.fill(P);
  tint(ctx, P, '#fde6a6', 'Y');
  ctx.save(); ctx.fillStyle = PINK; ctx.globalCompositeOperation = 'multiply'; plate(ctx, 'M');
  dots(ctx, [676, 1310, 1004, 1600], 846, 1470, 9, Math.PI / 4, (x, y) => 3.4 * Math.max(0, Math.min(1, (Math.hypot(x - 846, y - 1460) - 90) / 150)));
  ctx.restore();
}
