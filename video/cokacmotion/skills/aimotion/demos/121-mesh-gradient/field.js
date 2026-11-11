/*
 * field.js — 그라데이션 메시 (121번)
 *
 * 5×7 제어점마다 색(새벽표·아침표, OKLab)과 느린 주기 경로가 있다. 화면은 108×192 저해상도(1칸 = 10px)에서 계산하고
 * 본 캔버스에 고품질 확대로 올린다(색이 매끄러워서 확대해도 티가 나지 않는다).
 *   - 위치: 제어점 i의 변위 d_i(t)를 같은 격자 위 Catmull-Rom으로 보간한 변위장 d(p)를 만들고, 색은 p − d(p)에서 읽는다
 *           (제어점이 d_i만큼 움직인 메시의 1차 역사상 — 변위가 칸 크기의 0.4 이하라 접히지 않는다).
 *   - 색: 제어점 색을 OKLab에서 쌍삼차(Catmull-Rom 4×4) 보간한다. 섞인 색이 sRGB 보간처럼 탁해지지 않는다.
 *   - 같은 OKLab 값에서 세 장을 만든다: 바탕(field), 유리 뒤(blur: 상자 흐림 두 번 + 밝기·채도 조금 올림),
 *     글자 창(window: 새벽에는 밝은 파스텔, 아침에는 진하고 채도 높은 판 — 바탕과 늘 반대 명도).
 */
import { rand } from '../_lib/stage.js';

export const S = 10, LW = 108, LH = 192, N = LW * LH;
export const NX = 5, NY = 7, CW = 1080 / (NX - 1), CH = 1920 / (NY - 1);
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- sRGB ↔ OKLab
const toLin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
export function hexLab(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = toLin((n >> 16) & 255), g = toLin((n >> 8) & 255), b = toLin(n & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
// linear → sRGB 8비트, 4096칸 표 (pow를 픽셀마다 부르지 않는다)
const GAM = new Uint8ClampedArray(4097);
for (let i = 0; i <= 4096; i++) { const c = i / 4096; GAM[i] = Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)); }
const enc = (c) => GAM[c <= 0 ? 0 : c >= 1 ? 4096 : (c * 4096 + 0.5) | 0];
/** OKLab → sRGB 바이트 4개를 d[o..o+3]에 (색역 밖은 채널별로 자른다) */
export function put(L, a, b, d, o) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  d[o] = enc(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  d[o + 1] = enc(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  d[o + 2] = enc(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
  d[o + 3] = 255;
}

/** 글자·유리 위 글씨가 크림 → 먹색으로 뒤집히는 정도: 바탕 OKLab 명도의 문턱 */
export const flipK = (L) => { const v = Math.min(1, Math.max(0, (L - 0.64) / 0.1)); return v * v * (3 - 2 * v); };
const idx = (x, y) => Math.min(LH - 1, Math.max(0, Math.floor(y / S))) * LW + Math.min(LW - 1, Math.max(0, Math.floor(x / S)));

/** Catmull-Rom 가중치 4개와 이웃 인덱스 4개 (u: 제어점 단위, 가장자리는 복제) */
function weights(u, n, W, I, o) {
  if (u < 0) u = 0; else if (u > n - 1) u = n - 1;
  let i0 = Math.floor(u); if (i0 > n - 2) i0 = n - 2;
  const f = u - i0, f2 = f * f, f3 = f2 * f;
  W[o] = 0.5 * (-f3 + 2 * f2 - f); W[o + 1] = 0.5 * (3 * f3 - 5 * f2 + 2);
  W[o + 2] = 0.5 * (-3 * f3 + 4 * f2 + f); W[o + 3] = 0.5 * (f3 - f2);
  I[o] = i0 > 0 ? i0 - 1 : 0; I[o + 1] = i0; I[o + 2] = i0 + 1; I[o + 3] = i0 + 2 < n ? i0 + 2 : n - 1;
}

/**
 * dawn, day: 제어점 색 35개(행 우선, 위→아래). 반환: compute(t, opts) 뒤에 writeField / writeGlass / writeWindow.
 */
export function makeMesh({ dawn, day, seed }) {
  const K = NX * NY;
  const D0 = dawn.map(hexLab), D1 = day.map(hexLab);
  const r = rand(seed);
  // 제어점마다 느린 리사주 경로: 진폭은 칸의 0.2–0.4, 주기 10–24초
  const MOT = Array.from({ length: K }, () => ({
    ax: (0.2 + 0.2 * r()) * CW, ay: (0.2 + 0.2 * r()) * CH,
    wx: 0.26 + 0.36 * r(), wy: 0.22 + 0.36 * r(), px: r() * TAU, py: r() * TAU,
  }));
  const nL = new Float32Array(K), nA = new Float32Array(K), nB = new Float32Array(K);
  const ndx = new Float32Array(K), ndy = new Float32Array(K);
  const FX = new Float32Array(LW), FY = new Float32Array(LH);
  const UW = new Float32Array(LW * 4), UI = new Int32Array(LW * 4), VW = new Float32Array(LH * 4), VI = new Int32Array(LH * 4);
  const Rdx = new Float32Array(NY * LW), Rdy = new Float32Array(NY * LW);
  const FL = new Float32Array(N), FA = new Float32Array(N), FB = new Float32Array(N);
  const BL = new Float32Array(N), BA = new Float32Array(N), BB = new Float32Array(N), tmp = new Float32Array(N);
  const cw = new Float32Array(4), ci = new Int32Array(4), rw = new Float32Array(4), ri = new Int32Array(4);

  /**
   * prog(y) → 0..1 새벽→아침 진행(제어점 높이마다), b: 들숨 0..1, cam: { s, dy } 바탕의 시차 카메라,
   * bc: 들숨이 퍼지는 중심, bs: 들숨 배율
   */
  function compute(t, { prog, b, cam, bc, bs }) {
    const cs = 1 + 0.2 * b;
    for (let j = 0; j < NY; j++) {
      const p = prog(j * CH), bump = 4 * p * (1 - p);   // 전선이 지나는 띠는 조금 밝고 따뜻하다
      for (let i = 0; i < NX; i++) {
        const k = j * NX + i, d = D0[k], e = D1[k], m = MOT[k];
        nL[k] = d[0] + (e[0] - d[0]) * p + 0.05 * bump + 0.015 * b;
        nA[k] = (d[1] + (e[1] - d[1]) * p) * cs;
        nB[k] = (d[2] + (e[2] - d[2]) * p + 0.03 * bump) * cs;
        ndx[k] = m.ax * Math.sin(m.wx * t + m.px);
        ndy[k] = m.ay * Math.sin(m.wy * t + m.py);
      }
    }
    // 화면 → 메시 좌표(카메라 역변환, 들숨 확대의 역변환). x와 y가 따로 놀아서 가중치를 열·행마다 한 번만 구한다.
    for (let x = 0; x < LW; x++) {
      let fx = 540 + ((x + 0.5) * S - 540) / cam.s;
      fx = bc[0] + (fx - bc[0]) / bs;
      FX[x] = fx; weights(fx / CW, NX, UW, UI, x * 4);
    }
    for (let y = 0; y < LH; y++) {
      let fy = 960 + ((y + 0.5) * S - cam.dy - 960) / cam.s;
      fy = bc[1] + (fy - bc[1]) / bs;
      FY[y] = fy; weights(fy / CH, NY, VW, VI, y * 4);
    }
    // 변위장: 행 방향 보간을 먼저 해 두고(7×108), 픽셀마다 열 방향 4탭만
    for (let j = 0; j < NY; j++) {
      for (let x = 0; x < LW; x++) {
        let sx = 0, sy = 0;
        for (let m = 0; m < 4; m++) { const w = UW[x * 4 + m], k = j * NX + UI[x * 4 + m]; sx += w * ndx[k]; sy += w * ndy[k]; }
        Rdx[j * LW + x] = sx; Rdy[j * LW + x] = sy;
      }
    }
    for (let y = 0; y < LH; y++) {
      for (let x = 0; x < LW; x++) {
        let dx = 0, dy = 0;
        for (let n = 0; n < 4; n++) { const w = VW[y * 4 + n], o = VI[y * 4 + n] * LW + x; dx += w * Rdx[o]; dy += w * Rdy[o]; }
        weights((FX[x] - dx) / CW, NX, cw, ci, 0);
        weights((FY[y] - dy) / CH, NY, rw, ri, 0);
        let L = 0, A = 0, B = 0;
        for (let n = 0; n < 4; n++) {
          const row = ri[n] * NX, w = rw[n];
          const k0 = row + ci[0], k1 = row + ci[1], k2 = row + ci[2], k3 = row + ci[3];
          L += w * (cw[0] * nL[k0] + cw[1] * nL[k1] + cw[2] * nL[k2] + cw[3] * nL[k3]);
          A += w * (cw[0] * nA[k0] + cw[1] * nA[k1] + cw[2] * nA[k2] + cw[3] * nA[k3]);
          B += w * (cw[0] * nB[k0] + cw[1] * nB[k1] + cw[2] * nB[k2] + cw[3] * nB[k3]);
        }
        const o = y * LW + x;
        FL[o] = L; FA[o] = A; FB[o] = B;
      }
    }
  }

  // 상자 흐림(반경 r, 가장자리 복제) — 가로·세로 두 번씩이면 가우시안에 가깝다(σ ≈ 2.8칸 ≈ 28px)
  function boxH(src, dst, rad) {
    const inv = 1 / (2 * rad + 1);
    for (let y = 0; y < LH; y++) {
      const row = y * LW;
      let acc = 0;
      for (let k = -rad; k <= rad; k++) acc += src[row + Math.min(Math.max(k, 0), LW - 1)];
      for (let x = 0; x < LW; x++) {
        dst[row + x] = acc * inv;
        acc += src[row + Math.min(x + rad + 1, LW - 1)] - src[row + Math.max(x - rad, 0)];
      }
    }
  }
  function boxV(src, dst, rad) {
    const inv = 1 / (2 * rad + 1);
    for (let x = 0; x < LW; x++) {
      let acc = 0;
      for (let k = -rad; k <= rad; k++) acc += src[Math.min(Math.max(k, 0), LH - 1) * LW + x];
      for (let y = 0; y < LH; y++) {
        dst[y * LW + x] = acc * inv;
        acc += src[Math.min(y + rad + 1, LH - 1) * LW + x] - src[Math.max(y - rad, 0) * LW + x];
      }
    }
  }

  return {
    compute,
    /** 바탕 */
    writeField(d) { for (let o = 0; o < N; o++) put(FL[o], FA[o], FB[o], d, o * 4); },
    /** 유리 뒤: 흐리고, 밝기 +dl, 채도 ×dc */
    writeGlass(d, dl, dc) {
      for (const [F, B] of [[FL, BL], [FA, BA], [FB, BB]]) { boxH(F, tmp, 3); boxV(tmp, B, 3); boxH(B, tmp, 3); boxV(tmp, B, 3); }
      for (let o = 0; o < N; o++) put(BL[o] + dl, BA[o] * dc, BB[o] * dc, d, o * 4);
    },
    /**
     * 글자 창: 바탕 명도의 반대편. 픽셀마다 바탕 L이 문턱(0.64–0.74)을 넘으면 k → 1.
     * k 0(어두운 바탕): 밝은 파스텔(L≈0.9, 채도 ×1.1). k 1(밝은 바탕): 진하고 채도 높게(L≈0.42, 채도 ×2.1, 상한 0.17),
     * 이때 따뜻한 색은 자홍 쪽으로 돌려(최대 40°) 복숭아빛이 갈색·새빨강으로 가라앉지 않고 산딸기·보라·남색 쪽으로 간다.
     */
    writeWindow(d) {
      for (let o = 0; o < N; o++) {
        const L = FL[o], k = flipK(L), cs = 1.1 + 1.0 * k;
        const Lw = (0.89 + 0.22 * (L - 0.42)) * (1 - k) + (0.45 + 0.30 * (L - 0.85)) * k;
        let a = FA[o] * cs, b = FB[o] * cs + 0.012 * (1 - k);
        if (k > 0) {
          // 아침 쪽: 따뜻한 색상(b > 0)은 자홍 쪽으로 최대 40° 돌리고, 채도는 0.17에서 멈춘다
          const ang = -0.7 * k * Math.min(1, Math.max(0, (FB[o] + 0.01) / 0.04));
          const c = Math.cos(ang), s = Math.sin(ang), a2 = a * c - b * s, b2 = a * s + b * c;
          const C = Math.hypot(a2, b2), cap = C > 0.17 ? 0.17 / C : 1;
          a = a2 * cap; b = b2 * cap;
        }
        put(Lw, a, b, d, o * 4);
      }
    },
    /** 화면 (x, y)의 바탕 명도 / 유리 뒤(흐린) 명도 — writeGlass 뒤에 부른다 */
    L(x, y) { return FL[idx(x, y)]; },
    LB(x, y) { return BL[idx(x, y)]; },
  };
}
