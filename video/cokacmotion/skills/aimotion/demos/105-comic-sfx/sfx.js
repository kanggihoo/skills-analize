/*
 * sfx.js — 만화 의성어 레터링 엔진 (Canvas 2D, 모든 함수는 입력만의 순수 함수).
 *
 *   prepGlyph(font, ch, opts)       Pretendard Black 외곽선 → 가운데 정렬 윤곽 + '잉크 바깥쪽' 법선.
 *                                   스타일별 가공: simplify(각지게), round(모서리 둥글리기), maxSeg(휘기 위한 재분할),
 *                                   wobble(손글씨 흔들림), wave(물결 외곽선), jitter(꼭짓점 흔들림)
 *   mapGlyph(g, fn)                 점마다 fn(x, y, nx, ny, k, out, i) → 무대 좌표 윤곽(Float32Array[])
 *   affine(T)                       글자 단위 변환(이동·회전·배율·찌그러짐·기울임·법선 변위)
 *   extrude(F, vx, vy, k)           앞면을 소실점 쪽으로 k만큼 끌어 뒷면을 만든다
 *   drawLetter(ctx, F, B, sign, st, o)  겹 외곽선(흰 테 → 먹 → 종이) → 입체 면(망점) → 앞면 색 → 경계선 → 금
 *   dots / focusLines / pathLine / star4 / spiky   소리에 딸린 표시(망점, 집중선, 속도선, 별)
 *
 * 인쇄 흉내: 색은 'multiply'로 겹쳐 찍고(판끼리 섞임), 색판마다 PLATE만큼 어긋나게 찍는다(먹판은 제자리).
 */
import { outlineContours } from '../_lib/type.js';

export const INK = '#231d22';
export const PAPER = '#fcf6e8';
export const YEL = '#f7c331';
export const RED = '#e2472f';
export const CYAN = '#3aa2d2';
// 판 어긋남(무대 px): 먹(K)은 기준, 노랑·빨강·파랑 판이 조금씩 비껴 찍힌다
export const PLATE = { K: [0, 0], Y: [4, -2.5], M: [-3.5, 3], C: [3, 4] };

const TAU = Math.PI * 2;
const cl = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

/** 정수 해시 → [0, 1) */
export function hash(a, b = 0, c = 0) {
  let h = 0x811c9dc5 ^ Math.imul(a | 0, 0x27d4eb2d);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) ^ Math.imul(b | 0, 0x165667b1);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) ^ Math.imul(c | 0, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
/** 1D value noise [0, 1) */
export function vnoise(x, s = 0) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  const a = hash(i, s, 91), b = hash(i + 1, s, 91);
  return a + (b - a) * u;
}
/** 색판 어긋남: 현재 변환 뒤에 장치 좌표로 PLATE[p]만큼 민다 (save/restore 안에서 쓴다) */
export function plate(ctx, p) {
  const o = PLATE[p];
  if (!o || (!o[0] && !o[1])) return;
  const m = ctx.getTransform();
  ctx.setTransform(m.a, m.b, m.c, m.d, m.e + o[0], m.f + o[1]);
}

// ---------------------------------------------------------------- 윤곽 가공
function rdpClosed(p, tol) {
  const n = p.length / 2;
  if (n < 8) return p;
  let far = 0, fd = -1;
  for (let i = 1; i < n; i++) { const d = (p[2 * i] - p[0]) ** 2 + (p[2 * i + 1] - p[1]) ** 2; if (d > fd) { fd = d; far = i; } }
  const keep = new Uint8Array(n); keep[0] = keep[far] = 1;
  const rec = (a, b) => {
    const bb = b % n, ax = p[2 * a], ay = p[2 * a + 1], bx = p[2 * bb], by = p[2 * bb + 1];
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
    let md = -1, mi = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((p[2 * i] - ax) * dy - (p[2 * i + 1] - ay) * dx) / L;
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol) { keep[mi] = 1; rec(a, mi); rec(mi, b); }
  };
  rec(0, far); rec(far, n);
  const out = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(p[2 * i], p[2 * i + 1]);
  return out.length >= 6 ? out : p;
}

/** 꺾인 꼭짓점(꺾임 > minTurn)을 반지름 r의 필렛(2차 곡선)으로 바꾼다 — 볼록·오목 모두 */
function roundCorners(p, r, minTurn = 0.5) {
  const n = p.length / 2, out = [];
  for (let i = 0; i < n; i++) {
    const px = p[2 * i], py = p[2 * i + 1], a = (i - 1 + n) % n, b = (i + 1) % n;
    let ux = p[2 * a] - px, uy = p[2 * a + 1] - py, vx = p[2 * b] - px, vy = p[2 * b + 1] - py;
    const lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
    if (lu < 1e-6 || lv < 1e-6) { out.push(px, py); continue; }
    ux /= lu; uy /= lu; vx /= lv; vy /= lv;
    const ang = Math.acos(cl(ux * vx + uy * vy, -1, 1));
    if (Math.PI - ang < minTurn) { out.push(px, py); continue; }
    const d = Math.min(r / Math.tan(ang / 2), lu * 0.48, lv * 0.48);
    const x1 = px + ux * d, y1 = py + uy * d, x2 = px + vx * d, y2 = py + vy * d;
    for (let k = 0; k <= 6; k++) {
      const s = k / 6, s1 = 1 - s;
      out.push(s1 * s1 * x1 + 2 * s1 * s * px + s * s * x2, s1 * s1 * y1 + 2 * s1 * s * py + s * s * y2);
    }
  }
  return out;
}

function resample(p, maxLen) {
  const n = p.length / 2, out = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, x0 = p[2 * i], y0 = p[2 * i + 1], x1 = p[2 * j], y1 = p[2 * j + 1];
    out.push(x0, y0);
    const k = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / maxLen);
    for (let m = 1; m < k; m++) out.push(x0 + (x1 - x0) * m / k, y0 + (y1 - y0) * m / k);
  }
  return out;
}

/** 잉크 바깥쪽 법선. nonzero 글꼴에서는 바깥 윤곽·구멍 모두 잉크가 진행 방향의 같은 쪽에 있다 */
function normals(p, outerSign) {
  const n = p.length / 2, out = new Array(p.length), s = outerSign < 0 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const a = (i - 1 + n) % n, b = (i + 1) % n;
    let tx = p[2 * b] - p[2 * a], ty = p[2 * b + 1] - p[2 * a + 1];
    const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    out[2 * i] = -ty * s; out[2 * i + 1] = tx * s;
  }
  return out;
}

const SIZE = 300;   // 윤곽을 뽑는 기준 크기(px). 화면 크기는 size / SIZE 배율로 정한다
export const GLYPH_SIZE = SIZE;

/**
 * 글자 하나를 준비한다. 반환: { ch, w, h, sign, contours: [{ p, n }] } — 좌표는 잉크 상자 중심 기준, y 아래.
 */
export function prepGlyph(font, ch, { tol = 0.5, simplify = 0, round = 0, maxSeg = 0, wobble = 0, wave = null, jitter = 0, seed = 1 } = {}) {
  const g = outlineContours(font, ch, 0, 0, SIZE, { tol })[0];
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, big = null;
  for (const c of g.contours) {
    for (let i = 0; i < c.pts.length; i += 2) {
      x0 = Math.min(x0, c.pts[i]); x1 = Math.max(x1, c.pts[i]);
      y0 = Math.min(y0, c.pts[i + 1]); y1 = Math.max(y1, c.pts[i + 1]);
    }
    if (!big || Math.abs(c.area) > Math.abs(big.area)) big = c;
  }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, sign = Math.sign(big.area) || -1;
  const contours = [];
  g.contours.forEach((c, ci) => {
    let p = Array.from(c.pts, (v, i) => (i % 2 ? v - cy : v - cx));
    if (simplify) p = rdpClosed(p, simplify);
    if (jitter) for (let i = 0; i < p.length; i += 2) { p[i] += (hash(seed, ci * 997 + i, 1) - 0.5) * 2 * jitter; p[i + 1] += (hash(seed, ci * 997 + i, 2) - 0.5) * 2 * jitter; }
    if (round) p = roundCorners(p, round);
    if (maxSeg) p = resample(p, maxSeg);
    if (p.length < 6) return;
    const n = normals(p, sign);
    if (wobble || wave) {
      let arc = 0;
      for (let i = 0; i < p.length; i += 2) {
        if (i) arc += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]);
        let d = 0;
        if (wobble) d += wobble * (vnoise(arc / 38 + ci * 5.3, seed) * 2 - 1);
        if (wave) d += wave.a * Math.sin(arc / wave.l + ci);
        p[i] += n[i] * d; p[i + 1] += n[i + 1] * d;
      }
    }
    contours.push({ p: Float32Array.from(p), n: Float32Array.from(n) });
  });
  return { ch, w: x1 - x0, h: y1 - y0, sign, contours };
}

/** 점마다 fn(x, y, nx, ny, k, out, i)로 옮긴다. k는 윤곽을 통틀은 점 번호 */
export function mapGlyph(g, fn) {
  let k = 0;
  return g.contours.map((c) => {
    const p = c.p, n = c.n, o = new Float32Array(p.length);
    for (let i = 0; i < p.length; i += 2, k++) fn(p[i], p[i + 1], n[i], n[i + 1], k, o, i);
    return o;
  });
}

/**
 * 글자 단위 변환. T: { x, y, s(=size/SIZE 배율), rot, sx, sy(바닥 ay 기준 찌그러짐), shear(기울임), disp(x, y, k) → 법선 변위 }
 */
export function affine(T) {
  const c = Math.cos(T.rot || 0) * T.s, s = Math.sin(T.rot || 0) * T.s;
  const sx = T.sx ?? 1, sy = T.sy ?? 1, sh = T.shear || 0, ay = T.ay || 0, disp = T.disp;
  return (x, y, nx, ny, k, o, i) => {
    if (disp) { const d = disp(x, y, k); x += nx * d; y += ny * d; }
    const ly = ay + (y - ay) * sy, lx = x * sx - ly * sh;
    o[i] = T.x + lx * c - ly * s; o[i + 1] = T.y + lx * s + ly * c;
  };
}

/** 뒷면: 앞면의 점을 소실점 (vx, vy) 쪽으로 k(0..1)만큼 */
export function extrude(F, vx, vy, k) {
  return F.map((f) => {
    const b = new Float32Array(f.length);
    for (let i = 0; i < f.length; i += 2) { b[i] = f[i] + (vx - f[i]) * k; b[i + 1] = f[i + 1] + (vy - f[i + 1]) * k; }
    return b;
  });
}

export function addContours(P, cs) {
  for (const c of cs) {
    P.moveTo(c[0], c[1]);
    for (let i = 2; i < c.length; i += 2) P.lineTo(c[i], c[i + 1]);
    P.closePath();
  }
}
/** 옆면 사각형들. 모두 바깥 윤곽과 같은 감김으로 맞춰서 nonzero로 채우면 앞면 ∪ 옆면 ∪ 뒷면 = 입체의 실루엣 */
function addQuads(P, F, B, sign) {
  for (let ci = 0; ci < F.length; ci++) {
    const f = F[ci], b = B[ci], n = f.length;
    for (let i = 0; i < n; i += 2) {
      const j = (i + 2) % n;
      const ax = f[i], ay = f[i + 1], bx = f[j], by = f[j + 1], cx = b[j], cy = b[j + 1], dx = b[i], dy = b[i + 1];
      const A = (ax * by - bx * ay) + (bx * cy - cx * by) + (cx * dy - dx * cy) + (dx * ay - ax * dy);
      if (Math.abs(A) < 0.6) continue;
      P.moveTo(ax, ay);
      if (A * sign > 0) { P.lineTo(bx, by); P.lineTo(cx, cy); P.lineTo(dx, dy); }
      else { P.lineTo(dx, dy); P.lineTo(cx, cy); P.lineTo(bx, by); }
      P.closePath();
    }
  }
}

function bbox(cs, pad = 0) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const c of cs) for (let i = 0; i < c.length; i += 2) {
    if (c[i] < x0) x0 = c[i]; if (c[i] > x1) x1 = c[i];
    if (c[i + 1] < y0) y0 = c[i + 1]; if (c[i + 1] > y1) y1 = c[i + 1];
  }
  return [x0 - pad, y0 - pad, x1 + pad, y1 + pad];
}

/**
 * 망점: 각도 ang의 격자(원점 ox, oy 고정 → 물체와 함께 움직임), 반지름 rf(x, y) (px). 채우기 한 번.
 */
export function dots(ctx, [x0, y0, x1, y1], ox, oy, sp, ang, rf) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  let i0 = 1e9, i1 = -1e9, j0 = 1e9, j1 = -1e9;
  for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
    const i = ((x - ox) * ca + (y - oy) * sa) / sp, j = (-(x - ox) * sa + (y - oy) * ca) / sp;
    i0 = Math.min(i0, i); i1 = Math.max(i1, i); j0 = Math.min(j0, j); j1 = Math.max(j1, j);
  }
  ctx.beginPath();
  for (let j = Math.floor(j0); j <= Math.ceil(j1); j++) {
    for (let i = Math.floor(i0); i <= Math.ceil(i1); i++) {
      const x = ox + (i * ca - j * sa) * sp, y = oy + (i * sa + j * ca) * sp;
      if (x < x0 - sp || x > x1 + sp || y < y0 - sp || y > y1 + sp) continue;
      const r = rf(x, y);
      if (r < 0.35) continue;
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU);
    }
  }
  ctx.fill();
}

/**
 * 글자 하나를 겹겹이 그린다.
 *  st: { ink, rim, inkIn, join, face, faceP, ext, extP, dots: { sp, r, col }, inline: [안쪽, 바깥], shadow: [dx, dy, col],
 *        band: { y, col }, shine: true }
 *  o:  { L: { x, y, rot, s } 글자 좌표계(띠·광택·금), depth: [ox, oy, ux, uy, d0, d1] 망점 농도, ghosts: [[dx, dy, a]], cracks, crackP }
 */
export function drawLetter(ctx, F, B, sign, st, o = {}) {
  const face = new Path2D();
  addContours(face, F);
  let solid = face;
  if (B) { solid = new Path2D(); addContours(solid, F); addContours(solid, B); addQuads(solid, F, B, sign); }
  ctx.save();
  ctx.lineJoin = st.join || 'round';
  ctx.lineCap = 'round';
  ctx.miterLimit = 2.2;

  // 떨림 겹선: 얇은 먹선이 옆으로 비껴 남는다 (흰 테가 글자 가까운 부분을 덮는다)
  if (o.ghosts) {
    ctx.strokeStyle = INK; ctx.lineWidth = st.ghostW || 3;
    for (const [dx, dy, a] of o.ghosts) {
      ctx.globalAlpha = a; ctx.translate(dx, dy); ctx.stroke(face); ctx.translate(-dx, -dy);
    }
    ctx.globalAlpha = 1;
  }
  // 딱딱한 그림자(판 하나)
  if (st.shadow) {
    const [dx, dy, col, p] = st.shadow;
    ctx.save(); plate(ctx, p || 'K'); ctx.translate(dx, dy);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = ctx.strokeStyle = col; ctx.lineWidth = 2 * (st.ink + st.rim);
    ctx.stroke(solid); ctx.fill(solid);
    ctx.restore();
  }
  // 겹 외곽선: 바깥 흰 테 → 두꺼운 먹 → 종이로 속을 메워 안쪽 선을 지운다
  ctx.strokeStyle = PAPER; ctx.lineWidth = 2 * (st.ink + st.rim); ctx.stroke(solid);
  ctx.strokeStyle = INK; ctx.lineWidth = 2 * st.ink; ctx.stroke(solid);
  ctx.fillStyle = PAPER; ctx.fill(solid);

  if (B) {
    const notFace = new Path2D();
    notFace.rect(-6000, -6000, 14000, 14000);
    addContours(notFace, F);
    // 입체 옆면 색(앞면은 판에서 빼 둔다 = 녹아웃)
    ctx.save(); plate(ctx, st.extP); ctx.clip(notFace, 'evenodd');
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = st.ext; ctx.fill(solid);
    ctx.restore();
    // 옆면 망점: 소실점 쪽으로 갈수록 커진다
    if (st.dots && o.depth) {
      const [ox, oy, ux, uy, d0, d1] = o.depth, sd = st.dots;
      ctx.save(); ctx.clip(solid); ctx.clip(notFace, 'evenodd');
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = sd.col;
      dots(ctx, bbox(B.concat(F), 4), ox, oy, sd.sp, Math.PI / 4, (x, y) => {
        const f = cl(((x - ox) * ux + (y - oy) * uy - d0) / (d1 - d0));
        return sd.r * (0.18 + 0.82 * f);
      });
      ctx.restore();
    }
  }
  // 앞면 색 + 안쪽 장식(띠, 안쪽 흰 선, 광택) — 모두 앞면 판에 함께 찍힌다
  ctx.save();
  plate(ctx, st.faceP);
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = st.face; ctx.fill(face);
  if (st.band || st.inline || st.shine) {
    ctx.clip(face);
    if (st.band && o.L) {
      const L = o.L;
      ctx.save(); ctx.translate(L.x, L.y); ctx.rotate(L.rot); ctx.scale(L.s, L.s);
      ctx.fillStyle = st.band.col; ctx.fillRect(-400, st.band.y, 800, 400);
      ctx.restore();
    }
    if (st.inline) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = PAPER; ctx.lineWidth = 2 * st.inline[1]; ctx.stroke(face);
      ctx.globalCompositeOperation = 'multiply';
      ctx.strokeStyle = st.face; ctx.lineWidth = 2 * st.inline[0]; ctx.stroke(face);
    }
    if (st.shine && o.L) {
      const L = o.L;
      // 왼쪽 위의 비스듬한 광택 줄 두 개: 띠 { c ≤ x + y ≤ c + w } (글자 좌표)
      ctx.globalCompositeOperation = 'source-over';
      ctx.translate(L.x, L.y); ctx.rotate(L.rot); ctx.scale(L.s, L.s);
      ctx.fillStyle = PAPER;
      ctx.beginPath();
      for (const [c, w] of st.shine === true ? [[-150, 16], [-118, 7]] : st.shine) {
        ctx.moveTo(c - 300, 300); ctx.lineTo(c + 300, -300); ctx.lineTo(c + w + 300, -300); ctx.lineTo(c + w - 300, 300);
      }
      ctx.fill();
    }
  }
  ctx.restore();

  // 앞면과 옆면을 가르는 먹선 (먹판, 제자리)
  if (B && st.inkIn) { ctx.strokeStyle = INK; ctx.lineWidth = 2 * st.inkIn; ctx.stroke(face); }

  // 금: 먹 테두리 + 종이 속 (앞면 ∪ 옆면 안에서만)
  if (o.cracks && o.crackP > 0 && o.L) {
    const L = o.L;
    ctx.save(); ctx.clip(solid);
    ctx.translate(L.x, L.y); ctx.rotate(L.rot); ctx.scale(L.s, L.s);
    ctx.beginPath();
    for (const cr of o.cracks) {
      const m = Math.max(2, Math.ceil(cr.length / 2 * o.crackP));
      ctx.moveTo(cr[0], cr[1]);
      for (let i = 1; i < m; i++) {
        const fr = Math.min(1, cr.length / 2 * o.crackP - i + 1);
        const x = cr[2 * i - 2] + (cr[2 * i] - cr[2 * i - 2]) * fr, y = cr[2 * i - 1] + (cr[2 * i + 1] - cr[2 * i - 1]) * fr;
        ctx.lineTo(x, y);
      }
    }
    ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
    ctx.strokeStyle = INK; ctx.lineWidth = 9 / L.s; ctx.stroke();
    ctx.strokeStyle = PAPER; ctx.lineWidth = 3.4 / L.s; ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/** 금 모양: 글자 위쪽 가장자리에서 아래로 갈지자로 (글자 좌표, 기준 크기 SIZE) */
export function makeCracks(g, seed) {
  const out = [];
  for (let c = 0; c < 2; c++) {
    let x = (hash(seed, c, 1) - 0.5) * g.w * 0.7, y = -g.h * 0.62;
    let a = Math.PI / 2 + (hash(seed, c, 2) - 0.5) * 0.9;
    const pts = [x, y], n = 7;
    for (let i = 0; i < n; i++) {
      const len = g.h * (0.1 + 0.07 * hash(seed, c * 31 + i, 3));
      a += (i % 2 ? 1 : -1) * (0.55 + 0.4 * hash(seed, c * 31 + i, 4));
      a = Math.PI / 2 + cl(a - Math.PI / 2, -1.1, 1.1);
      x += Math.cos(a) * len; y += Math.sin(a) * len;
      pts.push(x, y);
    }
    out.push(pts);
  }
  return out;
}

// ---------------------------------------------------------------- 소리에 딸린 표시
/** 집중선: 중심 (cx, cy)를 향해 가늘어지는 쐐기들. grow 0→1로 바깥에서 안쪽으로 뻗는다 */
export function focusLines(ctx, cx, cy, { n = 120, rIn = 220, rOut = 1100, seed = 7, grow = 1, wMin = 0.004, wMax = 0.016 } = {}) {
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = ((i + hash(i, seed) * 0.85) / n) * TAU;
    const w = wMin + (wMax - wMin) * hash(i, seed, 1) ** 2;
    const tip = rIn * (1 + 0.85 * hash(i, seed, 2) ** 1.5);
    const r0 = rOut + (tip - rOut) * grow;
    if (r0 >= rOut - 2) continue;
    const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(a - w), sb = Math.sin(a - w), cc = Math.cos(a + w), sc = Math.sin(a + w);
    ctx.moveTo(cx + ca * r0, cy + sa * r0);
    ctx.lineTo(cx + cb * rOut, cy + sb * rOut);
    ctx.lineTo(cx + cc * rOut, cy + sc * rOut);
  }
  ctx.fill();
}

/** 3차 베지어를 호 길이로 다시 매긴 경로: at(s) → [x, y, tx, ty] */
export function makePath(p0, p1, p2, p3, n = 600) {
  const xs = new Float64Array(n + 1), ys = new Float64Array(n + 1), cum = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    xs[i] = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
    ys[i] = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
    if (i) cum[i] = cum[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
  }
  const L = cum[n];
  return {
    L,
    at(s) {
      // 끝 밖으로는 접선 방향으로 곧게 늘인다
      const sc = cl(s, 0, L);
      let lo = 0, hi = n;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= sc) lo = m; else hi = m; }
      const f = (sc - cum[lo]) / Math.max(1e-9, cum[hi] - cum[lo]);
      let tx = xs[hi] - xs[lo], ty = ys[hi] - ys[lo];
      const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const ex = s - sc;
      return [xs[lo] + (xs[hi] - xs[lo]) * f + tx * ex, ys[lo] + (ys[hi] - ys[lo]) * f + ty * ex, tx, ty];
    },
  };
}

/** 경로를 따라가는 속도선 하나: s0(꼬리, 폭 0) → s1(머리, 폭 w), 법선 방향 off */
export function pathLine(ctx, path, s0, s1, off, w, steps = 14) {
  if (s1 - s0 < 2) return;
  const L = [], R = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps, s = s0 + (s1 - s0) * u;
    const [x, y, tx, ty] = path.at(s);
    const nx = -ty, ny = tx, hw = w * 0.5 * Math.sin(Math.min(1, u * 1.15) * Math.PI / 2) * (u > 0.92 ? (1 - u) / 0.08 * 0.6 + 0.4 : 1);
    L.push([x + nx * (off + hw), y + ny * (off + hw)]);
    R.push([x + nx * (off - hw), y + ny * (off - hw)]);
  }
  ctx.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < L.length; i++) ctx.lineTo(L[i][0], L[i][1]);
  for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
}

/** 네 갈래 반짝이(오목한 변) */
export function star4(P, x, y, r, rot = 0, pinch = 0.22) {
  for (let k = 0; k < 4; k++) {
    const a = rot + k * Math.PI / 2, b = a + Math.PI / 2;
    const ox = x + Math.cos(a) * r, oy = y + Math.sin(a) * r, nx = x + Math.cos(b) * r, ny = y + Math.sin(b) * r;
    const mx = x + Math.cos(a + Math.PI / 4) * r * pinch, my = y + Math.sin(a + Math.PI / 4) * r * pinch;
    if (k === 0) P.moveTo(ox, oy);
    P.quadraticCurveTo(mx, my, nx, ny);
  }
  P.closePath();
}

/** 뾰족한 충격 별 (n갈래, 길이 흔들림) */
export function spiky(P, x, y, rIn, rOut, n, rot, seed) {
  for (let k = 0; k < 2 * n; k++) {
    const a = rot + (k / (2 * n)) * TAU;
    const r = k % 2 ? rIn * (0.85 + 0.3 * hash(seed, k, 5)) : rOut * (0.7 + 0.45 * hash(seed, k, 6));
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    if (k === 0) P.moveTo(px, py); else P.lineTo(px, py);
  }
  P.closePath();
}
