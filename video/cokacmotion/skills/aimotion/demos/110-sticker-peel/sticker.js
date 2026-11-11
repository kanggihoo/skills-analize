/*
 * sticker.js — 다이컷 스티커 엔진 (110)
 *
 *  굽기(setup): 그림의 커버리지 → 거리장으로 테두리 R만큼 넓히고 오목한 모서리를 C만큼 둥글게 닫음(closing)
 *               → 안쪽 구멍 메우기 → 마칭 스퀘어로 칼선(다이컷) 윤곽 → Path2D.
 *               앞면(인쇄)·뒷면(이형지 쪽)·그림자 두 장(빽빽/부드러움)을 이미지로 굽는다.
 *  그리기(frame): 접힘선 기준 '말려 올라가는 떼기' — 접힘선을 넘은 부분을 반지름 r의 원통에 감고(띠 N개),
 *               원통을 지난 부분은 각도 φ로 곧게 들린 날개(flap). 각 띠는 접힘선 법선 방향으로만 늘고 줄어드는
 *               아핀 변환이라 Canvas 2D의 setTransform + clip 만으로 그린다. 등을 보이는 띠는 뒷면 이미지.
 *  모든 행렬은 캔버스 순서 [a, b, c, d, e, f] (x' = a·x + c·y + e, y' = b·x + d·y + f).
 */
import { signedDistance, textAlpha } from '../_lib/type.js';

export const SS = 1.25;            // 스티커 이미지는 무대 px의 1.25배로 굽는다(카메라가 1.17배까지 다가감)
export const TAU = Math.PI * 2;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function canvas2d(w, h, headless) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  const g = c.getContext('2d', headless ? { willReadFrequently: true } : undefined);
  return { c, g };
}

// ---------------------------------------------------------------- 행렬
export const I = [1, 0, 0, 1, 0, 0];
export function mul(A, B) {
  return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
    A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
}
export const mulN = (...Ms) => Ms.reduce((A, B) => mul(A, B));
export function trs(x, y, rot = 0, sx = 1, sy = sx) { const c = Math.cos(rot), s = Math.sin(rot); return [c * sx, s * sx, -s * sy, c * sy, x, y]; }
export const tr = (x, y) => [1, 0, 0, 1, x, y];
export function inv(M) {
  const det = M[0] * M[3] - M[1] * M[2];
  const a = M[3] / det, b = -M[1] / det, c = -M[2] / det, d = M[0] / det;
  return [a, b, c, d, -(a * M[4] + c * M[5]), -(b * M[4] + d * M[5])];
}
export const apply = (M, x, y) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]];
export const setM = (g, M) => g.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);

// ---------------------------------------------------------------- 마칭 스퀘어 (iso 0.5) → 닫힌 윤곽들
// 모서리 비트: 왼위 8, 오위 4, 오아래 2, 왼아래 1. 변: 0 위, 1 오른쪽, 2 아래, 3 왼쪽.
const MS = { 1: [[3, 2]], 2: [[2, 1]], 3: [[3, 1]], 4: [[0, 1]], 6: [[0, 2]], 7: [[0, 3]], 8: [[0, 3]], 9: [[0, 2]], 11: [[0, 1]], 12: [[3, 1]], 13: [[2, 1]], 14: [[3, 2]] };
export function contourLoops(a, w, h, iso = 0.5) {
  const P = new Map();
  const at = (x, y) => a[y * w + x];
  const f = (v0, v1) => (iso - v0) / (v1 - v0);
  function edge(x, y, e) {
    let id;
    if (e === 0) { id = (y * w + x) * 2; if (!P.has(id)) P.set(id, [x + f(at(x, y), at(x + 1, y)), y]); }
    else if (e === 2) { id = ((y + 1) * w + x) * 2; if (!P.has(id)) P.set(id, [x + f(at(x, y + 1), at(x + 1, y + 1)), y + 1]); }
    else if (e === 3) { id = (y * w + x) * 2 + 1; if (!P.has(id)) P.set(id, [x, y + f(at(x, y), at(x, y + 1))]); }
    else { id = (y * w + x + 1) * 2 + 1; if (!P.has(id)) P.set(id, [x + 1, y + f(at(x + 1, y), at(x + 1, y + 1))]); }
    return id;
  }
  const sa = [], sb = [];
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      const c = (at(x, y) >= iso ? 8 : 0) | (at(x + 1, y) >= iso ? 4 : 0) | (at(x + 1, y + 1) >= iso ? 2 : 0) | (at(x, y + 1) >= iso ? 1 : 0);
      if (c === 0 || c === 15) continue;
      let pairs = MS[c];
      if (c === 5 || c === 10) {
        const mid = (at(x, y) + at(x + 1, y) + at(x, y + 1) + at(x + 1, y + 1)) / 4 >= iso;
        pairs = (c === 5) === mid ? [[0, 3], [2, 1]] : [[0, 1], [3, 2]];
      }
      for (const [e0, e1] of pairs) { sa.push(edge(x, y, e0)); sb.push(edge(x, y, e1)); }
    }
  }
  const byEdge = new Map();
  const add = (e, i) => { const l = byEdge.get(e); if (l) l.push(i); else byEdge.set(e, [i]); };
  for (let i = 0; i < sa.length; i++) { add(sa[i], i); add(sb[i], i); }
  const used = new Uint8Array(sa.length), loops = [];
  for (let i0 = 0; i0 < sa.length; i0++) {
    if (used[i0]) continue;
    const loop = [];
    let i = i0, from = sa[i0];
    for (;;) {
      used[i] = 1;
      const to = sa[i] === from ? sb[i] : sa[i];
      const p = P.get(from); loop.push(p[0], p[1]);
      const l = byEdge.get(to), j = l[0] === i ? l[1] : l[0];
      if (j === undefined || used[j]) break;
      i = j; from = to;
    }
    if (loop.length >= 12) loops.push(loop);
  }
  return loops;
}

// 한 번 훑는 단순화: 직전에 남긴 점과 다음 점을 잇는 선에서 tol 안이면 버린다
function simplify(L, tol) {
  const n = L.length / 2, out = [L[0], L[1]];
  let px = L[0], py = L[1];
  for (let i = 1; i < n; i++) {
    const x = L[2 * i], y = L[2 * i + 1], j = (i + 1) % n, nx = L[2 * j], ny = L[2 * j + 1];
    const dx = nx - px, dy = ny - py, len = Math.hypot(dx, dy) || 1;
    if (Math.abs((x - px) * dy - (y - py) * dx) / len > tol) { out.push(x, y); px = x; py = y; }
  }
  return out;
}

export function pathFrom(loops) {
  const p = new Path2D();
  for (const L of loops) {
    p.moveTo(L[0], L[1]);
    for (let i = 2; i < L.length; i += 2) p.lineTo(L[i], L[i + 1]);
    p.closePath();
  }
  return p;
}

// 바깥에서 닿지 않는 '밖' 픽셀(글자 속 구멍)을 안으로 메운다 — 실제 다이컷은 구멍을 따내지 않는다
function fillHoles(a, w, h) {
  const seen = new Uint8Array(w * h), q = new Int32Array(w * h);
  let qh = 0, qt = 0;
  const push = (i) => { if (!seen[i] && a[i] < 0.5) { seen[i] = 1; q[qt++] = i; } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (qh < qt) {
    const i = q[qh++], x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < w * (h - 1)) push(i + w);
  }
  for (let i = 0; i < a.length; i++) if (a[i] < 0.5 && !seen[i]) a[i] = 1;
}

export function roundRectLoop(w, h, r, n = 10) {
  const L = [], q = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 0.5], [-w / 2 + r, -h / 2 + r, 1], [w / 2 - r, -h / 2 + r, 1.5]];
  for (const [cx, cy, a0] of q) for (let i = 0; i <= n; i++) { const a = (a0 + 0.5 * i / n) * Math.PI; L.push(cx + r * Math.cos(a), cy + r * Math.sin(a)); }
  return L;
}

// ---------------------------------------------------------------- 굽기
/**
 * def: { w, h (내용 상자, 무대 px), R 흰 테두리, C 오목 모서리 둥글기, shape(g) 커버리지, face(g) 인쇄, back?(g),
 *        loops? (칼선을 직접 줄 때), white, backing, edge, ghost, seed, bubbles }
 */
export async function bakeSticker(def, rng, headless) {
  const { w, h } = def;
  const R = def.R ?? 20, C = def.C ?? 14;
  const M = R + C + 12;
  const cw = Math.ceil((w + 2 * M) * SS), ch = Math.ceil((h + 2 * M) * SS);
  const ox = cw / 2, oy = ch / 2;
  const toLocal = (g) => g.setTransform(SS, 0, 0, SS, ox, oy);

  let loops = def.loops;
  if (!loops) {
    const cov = textAlpha(cw, ch, (g) => { toLocal(g); g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineJoin = 'round'; def.shape(g); });
    const sd = signedDistance(cov, cw, ch);
    const R1 = (R + C) * SS;
    for (let i = 0; i < sd.length; i++) cov[i] = clamp01(R1 + 0.5 - sd[i]);          // 팽창 R + C
    const sd2 = signedDistance(cov, cw, ch);
    const da = new Float32Array(cw * ch);
    for (let i = 0; i < da.length; i++) da[i] = clamp01(-C * SS + 0.5 - sd2[i]);     // 침식 C → 오목한 곳이 둥글게 닫힘
    fillHoles(da, cw, ch);
    loops = contourLoops(da, cw, ch).map((L) => simplify(L, 0.22)).map((L) => L.map((v, j) => (v + 0.5 - (j % 2 ? oy : ox)) / SS));
  }
  const die = pathFrom(loops);

  // 앞면: 흰 비닐 + 인쇄 + 결 + 가장자리 빛
  const F = canvas2d(cw, ch, headless), fg = F.g;
  toLocal(fg);
  fg.fillStyle = def.white || '#fdfcf8';
  fg.fill(die, 'evenodd');
  fg.save();
  fg.clip(die, 'evenodd');
  def.face(fg);
  fg.globalAlpha = 1;
  for (let i = 0; i < (w * h) / 900; i++) {           // 비닐 결(아주 옅은 점)
    fg.fillStyle = rng() < 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(60,50,40,0.05)';
    fg.fillRect(-w / 2 - M + rng() * (w + 2 * M), -h / 2 - M + rng() * (h + 2 * M), 0.8 + rng() * 1.6, 0.8 + rng() * 1.6);
  }
  fg.lineJoin = 'round';
  fg.translate(1.0, 1.6); fg.strokeStyle = 'rgba(40,30,25,0.13)'; fg.lineWidth = 5; fg.stroke(die);
  fg.translate(-2.0, -2.6); fg.strokeStyle = 'rgba(255,255,255,0.8)'; fg.lineWidth = 2.6; fg.stroke(die);
  fg.restore();

  // 뒷면: 접착면 색 + 비쳐 보이는 인쇄(좌우는 그릴 때 변환이 뒤집는다)
  const B = canvas2d(cw, ch, headless), bgc = B.g;
  toLocal(bgc);
  bgc.fillStyle = def.backing || '#eeebe4';
  bgc.fill(die, 'evenodd');
  bgc.save();
  bgc.clip(die, 'evenodd');
  bgc.setTransform(1, 0, 0, 1, 0, 0);
  bgc.globalAlpha = def.ghost ?? 0.07;
  bgc.drawImage(F.c, 0, 0);
  bgc.globalAlpha = 1;
  toLocal(bgc);
  if (def.back) def.back(bgc);
  for (let i = 0; i < (w * h) / 500; i++) {
    bgc.fillStyle = rng() < 0.6 ? 'rgba(255,255,255,0.25)' : 'rgba(90,80,60,0.07)';
    bgc.fillRect(-w / 2 - M + rng() * (w + 2 * M), -h / 2 - M + rng() * (h + 2 * M), 1 + rng() * 1.5, 1 + rng() * 1.5);
  }
  bgc.restore();

  // 그림자 두 장
  const BP = 34, sw = cw + Math.ceil(2 * BP * SS), sh = ch + Math.ceil(2 * BP * SS);
  const shadow = (sig) => {
    const S = canvas2d(sw, sh, headless);
    S.g.filter = `blur(${(sig * SS).toFixed(2)}px)`;
    S.g.setTransform(SS, 0, 0, SS, sw / 2, sh / 2);
    S.g.fillStyle = '#000';
    S.g.fill(die, 'evenodd');
    return S.c;
  };

  // 기포와 주름 (붙은 직후 손가락이 밀어내 사라진다)
  const probe = canvas2d(4, 4, false).g;
  const inside = (x, y) => probe.isPointInPath(die, x, y, 'evenodd');
  const bubbles = [], wrinkles = [];
  for (let k = 0, tries = 0; k < (def.bubbles ?? 4) && tries < 400; tries++) {
    const x = (rng() - 0.5) * w, y = (rng() - 0.5) * h;
    if (!inside(x, y)) continue;
    bubbles.push({ x, y, r: 5 + rng() * 9, k: 0.65 + rng() * 0.3, a: rng() * Math.PI });
    k++;
  }
  for (let k = 0, tries = 0; k < (def.wrinkles ?? 2) && tries < 400; tries++) {
    const x = (rng() - 0.5) * w * 0.9, y = (rng() - 0.5) * h * 0.9, a = rng() * Math.PI, len = 34 + rng() * 50;
    const x1 = x + Math.cos(a) * len, y1 = y + Math.sin(a) * len;
    if (!inside(x, y) || !inside(x1, y1)) continue;
    const bend = (rng() - 0.5) * 16;
    wrinkles.push({ x0: x, y0: y, x1, y1, cx: (x + x1) / 2 - Math.sin(a) * bend, cy: (y + y1) / 2 + Math.cos(a) * bend });
    k++;
  }

  const [front, back, shT, shS] = await Promise.all([F.c, B.c, shadow(2.2), shadow(11)].map((c) => createImageBitmap(c)));
  return {
    def, w, h, die, loops, front, back, shT, shS, bubbles, wrinkles, frontCanvas: F.c,
    fw: cw / SS, fh: ch / SS, sw: sw / SS, sh: sh / SS,
    /** 칼선 위 점 중 n 방향으로 가장 먼 거리 */
    extent(nx, ny) { let m = -1e9; for (const L of loops) for (let i = 0; i < L.length; i += 2) m = Math.max(m, nx * L[i] + ny * L[i + 1]); return m; },
  };
}

export const drawFront = (g, st) => g.drawImage(st.front, -st.fw / 2, -st.fh / 2, st.fw, st.fh);
export const drawBack = (g, st) => g.drawImage(st.back, -st.fw / 2, -st.fh / 2, st.fw, st.fh);
export const drawShadowImg = (g, st, soft) => g.drawImage(soft ? st.shS : st.shT, -st.sw / 2, -st.sh / 2, st.sw, st.sh);

// ---------------------------------------------------------------- 떼기 (페이지 컬)
// 접힘선: 국소 좌표에서 n·p = s. n은 떼어지는 쪽(벌써 들린 쪽)을 가리킨다. u = n·p − s > 0 이 들린 부분.
//  0 < u ≤ rφ : 원통에 감김. θ = u/r, 투영 n좌표 s + r·sinθ, 높이 r(1 − cosθ)
//  u > rφ     : 각도 φ로 곧게 들린 날개. 투영 s + r·sinφ + (u − rφ)·cosφ, 높이 r(1 − cosφ) + (u − rφ)·sinφ
export function proj(u, r, phi) { return u <= r * phi ? r * Math.sin(u / r) : r * Math.sin(phi) + (u - r * phi) * Math.cos(phi); }
export function height(u, r, phi) { return u <= r * phi ? r * (1 - Math.cos(u / r)) : r * (1 - Math.cos(phi)) + (u - r * phi) * Math.sin(phi); }

/** 원통을 띠 N개로 나누고(θ = π/2에서 반드시 끊어 앞·뒤를 가른다), 남는 길이는 날개 하나 */
export function peelPieces(umax, r, phi, N = 20) {
  const th = Math.min(phi, umax / r), ts = [];
  for (let i = 0; i <= N; i++) ts.push((th * i) / N);
  if (th > Math.PI / 2) { ts.push(Math.PI / 2); ts.sort((a, b) => a - b); }
  const out = [];
  for (let i = 0; i < ts.length - 1; i++) {
    const a = ts[i], b = ts[i + 1];
    if (b - a > 1e-4) out.push({ u0: a * r, u1: b * r, th: (a + b) / 2 });
  }
  if (umax > r * phi + 0.5) out.push({ u0: r * phi, u1: umax, th: phi, flap: true });
  return out;
}

/** 조각 하나의 아핀 지도: n 방향 좌표 U(= n·p)를 kU + A로, 접선 방향은 그대로 */
export function pieceMatrix(nx, ny, s, p, r, phi) {
  const P0 = proj(p.u0, r, phi), P1 = proj(p.u1, r, phi);
  const k = (P1 - P0) / (p.u1 - p.u0), A = s + P0 - k * (s + p.u0), q = k - 1;
  return [1 + q * nx * nx, q * nx * ny, q * nx * ny, 1 + q * ny * ny, A * nx, A * ny];
}
/** 같은 조각의 그림자: 높이 z(U)에 비례해 kl(국소 좌표의 '높이 1당 그림자 이동')만큼 밀린다 */
export function pieceShadowMatrix(Pm, nx, ny, s, p, r, phi, klx, kly) {
  const z0 = height(p.u0, r, phi), z1 = height(p.u1, r, phi);
  const sg = (z1 - z0) / (p.u1 - p.u0), tau = z0 - sg * (s + p.u0);
  return [Pm[0] + klx * sg * nx, Pm[1] + kly * sg * nx, Pm[2] + klx * sg * ny, Pm[3] + kly * sg * ny, Pm[4] + klx * tau, Pm[5] + kly * tau];
}

/** 국소 좌표에서 n·p ∈ [U0, U1] 띠로 클립 (현재 변환 아래) */
export function clipBand(g, nx, ny, U0, U1) {
  const tx = -ny, ty = nx, L = 4000;
  g.beginPath();
  g.moveTo(nx * U0 + tx * L, ny * U0 + ty * L);
  g.lineTo(nx * U0 - tx * L, ny * U0 - ty * L);
  g.lineTo(nx * U1 - tx * L, ny * U1 - ty * L);
  g.lineTo(nx * U1 + tx * L, ny * U1 + ty * L);
  g.clip();
}
