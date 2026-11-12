/*
 * 105 · 택배 왔다 — 만화 의성어 레터링 · 소리를 그리는 글자
 *
 * 원고지 한 장에 칸이 하나씩 미끄러져 들어오고, 칸마다 소리 하나가 '그려진 글자'로 찍힌다.
 *   띵동(둥글고 말랑, 통통 튐) → 휘이익(곡선 경로를 따라 기울고 늘어남 + 속도선) →
 *   부르르(떨리는 외곽선 + 진동 겹선) → 콰쾅!(각진 글자, 소실점으로 뻗는 입체 + 망점, 금, 집중선) → 반짝(작은 여운)
 * 글자는 모두 Pretendard Black의 벡터 외곽선을 가공한 것이다(sfx.js). 그림과 인쇄 흉내는 art.js.
 */
import { defineDemo, clamp, lerp, ease } from '../_lib/stage.js';
import { fontReady, loadOutlineFont } from '../_lib/type.js';
import {
  INK, PAPER, YEL, RED, hash, vnoise, plate, prepGlyph, mapGlyph, affine, extrude, drawLetter, makeCracks,
  focusLines, makePath, pathLine, star4, spiky, addContours, GLYPH_SIZE as K,
} from './sfx.js';
import {
  PANELS, bakePage, bakeGrain, drawP1, drawP2, drawP3, drawP4bg, drawP5bg, catDash, catCrouch, catPeek, catPaws, drawBox,
  sticker, tint, polyPath, ellPath, tubePath, inkLine, CAT, STRIPE, KRAFT,
} from './art.js';

const D = 10;
const TAU = Math.PI * 2;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const { outExpo, outBack, outCubic } = ease;
const outQuart = (p) => 1 - (1 - p) ** 4;
const wob = (u, f, k) => (u < 0 ? 0 : Math.exp(-u * k) * Math.cos(u * f));   // 감쇠 진동(충격 응답)
const wobS = (u, f, k) => (u < 0 ? 0 : Math.exp(-u * k) * Math.sin(u * f));

// ---------------------------------------------------------------- 시각표
const T = {
  p1: 0.10, ring: [0.66, 0.98],
  p2: 1.42, dash0: 2.02, dash1: 2.56,
  p3: 2.95, shiv: 3.55, freeze: 5.05,
  p4: 5.40, hit: 5.45,
  p5: 7.35, peek: 7.55, spark: 7.95, cap: 8.3,
};

// ---------------------------------------------------------------- 글자 스타일 (px)
const ST = {
  ding:   { ink: 6.5, rim: 8, inkIn: 2.6, join: 'round', face: YEL, faceP: 'Y', ext: '#8ccbe8', extP: 'C', dots: { sp: 7, r: 3.6, col: '#2c6d99' }, inline: [5, 8.5], shine: true },
  whoosh: { ink: 5.5, rim: 7.5, join: 'round', face: '#a3d6ec', faceP: 'C', inline: [3.6, 6.6], shine: [[-140, 12]] },
  shiver: { ink: 6, rim: 8, join: 'round', face: '#f6a998', faceP: 'M', inline: [3.8, 6.8], ghostW: 3.4 },
  boom:   { ink: 9, rim: 11, inkIn: 4, join: 'miter', face: YEL, faceP: 'Y', ext: RED, extP: 'M', dots: { sp: 8.5, r: 5.2, col: INK }, band: { y: 22, col: '#f5a35c' }, shine: [[-150, 20], [-114, 8]] },
  spark:  { ink: 4.6, rim: 6, inkIn: 2, join: 'round', face: YEL, faceP: 'Y', ext: '#f4a493', extP: 'M', dots: { sp: 5.5, r: 2.6, col: '#a8402c' }, inline: [3, 5.4] },
};

// 손글씨처럼: 글자마다 해시로 회전·기준선·크기를 조금씩 흔든다
const jit = (word, i, L) => ({ ...L, rot: L.rot + (hash(word, i, 1) - 0.5) * 0.1, y: L.y + (hash(word, i, 2) - 0.5) * 12, size: L.size * (1 + (hash(word, i, 3) - 0.5) * 0.06) });
const BELL = [265, 342];
const DING = [{ ch: '띵', size: 160, x: 392, y: 238, rot: -0.2, t0: 0.70 }, { ch: '동', size: 186, x: 380, y: 450, rot: 0.12, t0: 1.02 }].map((L, i) => jit(11, i, L));
const WHOOSH = [{ ch: '휘', size: 116, at: 0.12 }, { ch: '이', size: 136, at: 0.33 }, { ch: '익', size: 164, at: 0.56 }];
const SHIVER = [{ ch: '부', size: 122, x: 168, y: 716, rot: -0.13, t0: 3.55 }, { ch: '르', size: 136, x: 292, y: 702, rot: 0.07, t0: 3.67 }, { ch: '르', size: 152, x: 424, y: 688, rot: -0.05, t0: 3.79 }].map((L, i) => jit(33, i, L));
const BOOM = [{ ch: '콰', size: 250, x: 240, y: 1136, rot: -0.17, t0: 5.47 }, { ch: '쾅', size: 360, x: 536, y: 1082, rot: 0.05, t0: 5.55 }, { ch: '!', size: 330, x: 836, y: 1120, rot: 0.17, t0: 5.63 }].map((L, i) => jit(44, i, L));
const VP = [567, 1404];
const SPARK = [{ ch: '반', size: 76, x: 742, y: 1396, rot: -0.16, t0: 7.95 }, { ch: '짝', size: 92, x: 818, y: 1382, rot: 0.1, t0: 8.05 }].map((L, i) => jit(55, i, L));
const PATH2 = makePath([540, 486], [596, 196], [856, 150], [1010, 452]);

const CEN = {};
for (const k in PANELS) { const p = PANELS[k]; CEN[k] = [p.reduce((a, q) => a + q[0], 0) / p.length, p.reduce((a, q) => a + q[1], 0) / p.length]; }

// ---------------------------------------------------------------- 칸 움직임
function panelX(k, t) {
  if (k === 'p1') { const p = seg(t, T.p1, T.p1 + 0.55); return { vis: t >= T.p1, dx: -660 * (1 - outQuart(p)), dy: 0, rot: -0.08 * (1 - outBack(p, 1.6)), sc: 1, moving: p < 1 }; }
  if (k === 'p2') { const p = seg(t, T.p2, T.p2 + 0.55); return { vis: t >= T.p2, dx: 680 * (1 - outQuart(p)), dy: 0, rot: 0.07 * (1 - outBack(p, 1.6)), sc: 1, moving: p < 1 }; }
  if (k === 'p3') { const p = seg(t, T.p3, T.p3 + 0.55); return { vis: t >= T.p3, dx: 0, dy: 760 * (1 - outQuart(p)), rot: -0.04 * (1 - outBack(p, 1.6)), sc: 1, moving: p < 1 }; }
  if (k === 'p4') {
    const p = seg(t, T.p4, T.p4 + 0.32);
    return { vis: t >= T.p4, dx: 0, dy: 0, rot: 0.03 * (1 - outExpo(p)), sc: 1 + 0.16 * (1 - outExpo(p)) - 0.018 * wobS(t - T.hit, 30, 8), moving: p < 1 };
  }
  const p = seg(t, T.p5, T.p5 + 0.5);
  return { vis: t >= T.p5, dx: 400 * (1 - outQuart(p)), dy: 30 * (1 - outQuart(p)), rot: 0.12 * (1 - outBack(p, 1.5)), sc: 1, moving: p < 1 };
}
function withPanel(ctx, k, X, fn) {
  const [cx, cy] = CEN[k];
  ctx.save();
  ctx.translate(cx + X.dx, cy + X.dy); ctx.rotate(X.rot); ctx.scale(X.sc, X.sc); ctx.translate(-cx, -cy);
  fn();
  ctx.restore();
}
/** 칸 하나: (움직이는 동안 그림자와 종이 여백) → 칸 안 그림(클립) → 먹 테두리 */
function drawPanel(ctx, k, X, art, margin = 0) {
  const P = polyPath(PANELS[k]);
  withPanel(ctx, k, X, () => {
    if (X.moving || margin) {
      if (X.moving) {
        ctx.save(); ctx.translate(12, 16); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(60,40,30,0.22)';
        ctx.lineJoin = 'round'; ctx.lineWidth = 24; ctx.strokeStyle = 'rgba(60,40,30,0.22)'; ctx.fill(P); ctx.restore();
      }
      ctx.save(); ctx.lineJoin = 'round'; ctx.strokeStyle = PAPER; ctx.lineWidth = Math.max(margin, 22); ctx.stroke(P); ctx.restore();
    }
    ctx.save(); ctx.clip(P); art(); ctx.restore();
    ctx.save(); ctx.lineJoin = 'miter'; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(P); ctx.restore();
  });
}

// ---------------------------------------------------------------- 소리마다 글자 배치 (t의 닫힌 식)
function dingPose(i, t, g) {
  const L = DING[i], hop = 0.26;
  if (t < L.t0) return null;
  const p = seg(t, L.t0, L.t0 + hop), e = outCubic(p);
  let x = lerp(BELL[0], L.x, e), y = lerp(BELL[1], L.y, e) - 64 * Math.sin(Math.PI * p);
  const s = (0.22 + 0.78 * outCubic(p)) * L.size / K;
  const u = t - (L.t0 + hop);
  let sy;
  if (u >= 0) {
    // 통, 통: 두 번 더 튀고(포물선) 닿을 때마다 찌그러진다
    if (u < 0.22) { const v = u / 0.22; y -= 34 * 4 * v * (1 - v); } else if (u < 0.35) { const v = (u - 0.22) / 0.13; y -= 10 * 4 * v * (1 - v); }
    sy = 1 - 0.27 * wob(u, 34, 11) - 0.13 * wob(u - 0.22, 36, 13) - 0.06 * wob(u - 0.35, 36, 14);
    y += Math.sin((t - L.t0) * TAU * 0.8 + i * Math.PI) * 3.5 * seg(t, L.t0 + 0.7, L.t0 + 1.3);
  } else sy = 1 + 0.18 * Math.sin(Math.PI * p);
  const sx = 1 + (1 - sy) * 0.85, rot = L.rot + (1 - e) * (i ? 0.6 : -0.6);
  return { x, y, s, sx, sy, rot, ay: g.h / 2 };
}
function catS(t) { const p = seg(t, T.dash0, T.dash1); return PATH2.L * 0.8 * (1 - (1 - p) ** 2.3); }
function shiverAmp(t) { return t < T.shiv || t >= T.freeze ? 0 : 0.35 + 0.65 * seg(t, T.shiv, T.freeze - 0.12); }

defineDemo({
  id: '105-comic-sfx',
  title: '택배 왔다',
  tech: '만화 의성어 레터링 · 소리를 그리는 글자',
  duration: D,
  background: '#16151a',

  async setup(api) {
    const chars = '택배 왔다고양이생활07에게는,상자가본품이다.';
    await fontReady('800 34px "Pretendard Variable"', chars);
    await fontReady('700 40px "Gaegu"', '고양이에게 택배는, 상자가 본품이다.');
    const font = await loadOutlineFont('Pretendard-Black');
    this.ctx = api.canvas({ z: 0, attrs: api.headless ? { willReadFrequently: true } : undefined }).ctx;
    // 소리마다 다른 글자 가공 (모두 같은 글꼴에서)
    this.G = {
      ding: DING.map((L, i) => prepGlyph(font, L.ch, { round: 18, wobble: 1.4, seed: 100 + i })),
      whoosh: WHOOSH.map((L, i) => prepGlyph(font, L.ch, { maxSeg: 5, wobble: 1.4, seed: 200 + i })),
      shiver: SHIVER.map((L, i) => prepGlyph(font, L.ch, { maxSeg: 4, wave: { a: 3.4, l: 5.5 }, wobble: 1.2, seed: 300 + i })),
      boom: BOOM.map((L, i) => prepGlyph(font, L.ch, { tol: 0.8, simplify: 5.5, jitter: 2.4, seed: 400 + i })),
      spark: SPARK.map((L, i) => prepGlyph(font, L.ch, { round: 14, wobble: 1, seed: 500 + i })),
    };
    this.cracks = this.G.boom.map((g, i) => (g.ch === '!' ? [makeCracks(g, 470)[0]] : makeCracks(g, 460 + i)));
    // 상자에서 튀어나오는 것들(완충재 땅콩, 골판지 조각): 초기값만 정해 두고 위치는 t의 닫힌 식
    this.debris = Array.from({ length: 30 }, (_, i) => {
      const a = -Math.PI / 2 + (hash(i, 61) - 0.5) * 2.4, v = 900 + 1100 * hash(i, 62);
      return { kind: i % 3 === 0 ? 'scrap' : 'peanut', x0: VP[0] + (hash(i, 63) - 0.5) * 140, y0: VP[1] + 8, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        spin: (hash(i, 64) - 0.5) * 16, rot0: hash(i, 65) * TAU, size: 11 + 12 * hash(i, 66), delay: hash(i, 67) * 0.07 };
    });
    this.page = await bakePage(api.W, api.H, api.headless);
    this.grain = await bakeGrain(api.W, api.H, api.headless);
  },

  frame(t) {
    const ctx = this.ctx, G = this.G;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.setLineDash([]);
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.miterLimit = 10; ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.drawImage(this.page, 0, 0);

    const X1 = panelX('p1', t), X2 = panelX('p2', t), X3 = panelX('p3', t), X4 = panelX('p4', t), X5 = panelX('p5', t);

    // ---------------- 칸 1: 띵동 — 초인종 불빛과 소리 호
    if (X1.vis) {
      let bell = 0; const arcs = [];
      T.ring.forEach((tr, j) => {
        if (t >= tr - 0.04) bell = Math.max(bell, Math.exp(-Math.max(0, t - tr) * 3.2));
        if (t >= tr) arcs.push([outCubic(seg(t, tr, tr + 0.3)) + j * 0.6, Math.min(1, (t - tr) / 0.06) * (1 - 0.3 * seg(t, tr + 0.3, tr + 0.9))]);
      });
      drawPanel(ctx, 'p1', X1, () => drawP1(ctx, Math.max(bell, t > T.ring[1] ? 0.3 : 0), arcs));
    }
    // ---------------- 칸 2: 휘이익 — 방석에서 튀어 나가는 고양이, 경로를 따르는 속도선
    if (X2.vis) {
      const sc = catS(t), sp = clamp((catS(t) - catS(t - 1 / 30)) * 30 / 2000);
      drawPanel(ctx, 'p2', X2, () => {
        drawP2(ctx, seg(t, T.dash0, T.dash0 + 0.1) * (1 - seg(t, T.dash0 + 0.3, T.dash0 + 0.9)));
        // 출발 먼지
        const pu = t - T.dash0;
        if (pu > 0 && pu < 0.7) {
          const k = Math.sin(Math.PI * clamp(pu / 0.7)) ** 0.8;
          const parts = [[-46, -4, 16], [-24, -16, 20], [6, -10, 17], [30, -2, 13]].map(([dx, dy, r], j) => ({ P: ellPath(566 + dx * (1 + pu * 1.6) - 20 * j * pu, 500 + dy - 20 * pu, r * k, r * k * 0.8), col: '#eae4d6' }));
          sticker(ctx, parts, 3.2);
        }
        if (t < T.dash0) {
          // 출발 전: 방석 위에서 웅크림 + 엉덩이 흔들기(예비 동작)
          const wig = 3 * Math.sin(t * TAU * 6) * seg(t, T.p2 + 0.4, T.dash0);
          ctx.save(); ctx.translate(560, 470); ctx.rotate(-0.12); ctx.scale(0.56, 0.56); catCrouch(ctx, { wig, tailK: t * 9 }); ctx.restore();
        } else {
          // 속도선: 고양이 엉덩이 뒤에서 경로를 따라 끌린다
          ctx.save(); ctx.fillStyle = INK; ctx.beginPath();
          for (let k = 0; k < 12; k++) {
            const off = (k % 2 ? -1 : 1) * (72 + 70 * hash(k, 21)) - 10;
            const s1 = sc - 74 - 46 * hash(k, 22) - Math.abs(off) * 0.25, s0 = Math.max(0, s1 - 140 - 300 * hash(k, 23));
            if (s1 > s0 + 4) pathLine(ctx, PATH2, s0, s1, off, 2.4 + 5 * hash(k, 24) ** 2);
          }
          ctx.fill(); ctx.restore();
          // 잔상 두 장 + 고양이
          const pose = (s, ghost) => {
            const [x, y, tx, ty] = PATH2.at(s);
            ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(ty, tx)); ctx.scale(0.62, 0.62);
            catDash(ctx, { ghost, run: t * 3.2 }); ctx.restore();
          };
          if (sp > 0.05) { pose(sc - 120 * sp, `rgba(58,162,210,${(0.22 * sp).toFixed(3)})`); pose(sc - 60 * sp, `rgba(58,162,210,${(0.4 * sp).toFixed(3)})`); }
          pose(sc, null);
        }
      });
    }
    // ---------------- 칸 3: 부르르 — 상자를 노려보는 고양이의 떨림
    const A = shiverAmp(t), step = Math.floor(t * 24);
    if (X3.vis) {
      drawPanel(ctx, 'p3', X3, () => {
        drawP3(ctx);
        const wig = A * 9 * (hash(step, 99) - 0.5) * 2;
        ctx.save(); ctx.translate(556, 832); ctx.scale(0.82, 0.82); catCrouch(ctx, { wig, tailK: 0.6 + A * Math.sin(t * 50) }); ctx.restore();
        // 진동선: 엉덩이 양옆 괄호, 꼬리 위 잔떨림 (떨림이 멈춰도 그림으로 남는다)
        const vis = seg(t, T.shiv, T.shiv + 0.2);
        if (vis > 0) {
          ctx.save(); ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.globalAlpha = vis;
          const rx = 556 - 56 * 0.82 + wig * 0.82, ry = 834, fl = A > 0 ? (step % 2 ? 4 : -4) : 0;
          for (let j = 0; j < 3; j++) {
            ctx.lineWidth = 3.4 - j * 0.6;
            ctx.beginPath(); ctx.arc(rx + fl, ry, 52 + j * 13, Math.PI - 0.55, Math.PI + 0.55); ctx.stroke();
          }
          for (let j = 0; j < 3; j++) {
            const bx = 470 + j * 16 + fl, by = 680 - j * 6;
            ctx.lineWidth = 2.8; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 7, by - 8); ctx.lineTo(bx - 2, by - 15); ctx.lineTo(bx + 5, by - 23); ctx.stroke();
          }
          ctx.restore();
        }
      });
    }
    // ---------------- 칸 4: 콰쾅! — 터지는 상자, 집중선
    const hitU = t - T.hit;
    if (X4.vis) {
      drawPanel(ctx, 'p4', X4, () => {
        drawP4bg(ctx, VP[0], VP[1]);
        const fg = outExpo(seg(t, T.hit - 0.04, T.hit + 0.2));
        ctx.save(); ctx.fillStyle = INK; focusLines(ctx, VP[0], VP[1] - 30, { n: 150, rIn: 250 + 8 * Math.sin(t * 9), rOut: 1150, seed: 9, grow: fg, wMax: 0.02 }); ctx.restore();
        // 폭발 구름(뾰족한 말풍선 모양)
        const bp = outBack(seg(t, T.p4, T.p4 + 0.22), 2.2);
        if (bp > 0) {
          const B1 = new Path2D(); spiky(B1, VP[0], VP[1] - 10, 120 * bp, 250 * bp, 15, 0.1 + 0.02 * Math.sin(t * 7), 81);
          const B2 = new Path2D(); spiky(B2, VP[0], VP[1] - 10, 80 * bp, 160 * bp, 11, 0.4, 82);
          sticker(ctx, [{ P: B1, col: '#fbe08a' }], 4.6);
          sticker(ctx, [{ P: B2, col: null }], 3);
        }
        tint(ctx, ellPath(VP[0] + 20, 1598, 210, 18), 'rgba(35,29,34,0.28)', 'K');
        const open = outBack(seg(t, T.p4, T.p4 + 0.2), 2.2);
        drawBox(ctx, 430, 1594, 210, 168, 64, -40, {
          open, flutter: 0.32 * Math.exp(-Math.max(0, hitU) * 2.6) + 0.04, seed: t * 17, w0: 4.2,
          inner: (c) => {
            // 털이 곤두선 꼬리(상자 속에서 솟아오름)
            const up = outBack(seg(t, T.hit, T.hit + 0.25), 1.8), sw = Math.sin(t * 5) * 6;
            const pts = [[574, 1470], [566, 1440 - 60 * up], [586 + sw * 0.5, 1440 - 108 * up], [572 + sw, 1440 - 150 * up], [594 + sw * 1.4, 1440 - 178 * up]];
            const TP = tubePath(pts, 40, 26, { fur: 8 * up, seed: 7 });
            sticker(c, [{ P: TP, col: CAT }], 4.4);
            c.save(); c.clip(TP); plate(c, 'M'); c.globalCompositeOperation = 'multiply'; c.fillStyle = STRIPE;
            for (let j = 0; j < 3; j++) { const yy = 1440 - (52 + j * 38) * up; c.beginPath(); c.moveTo(530, yy); c.lineTo(640, yy - 14); c.lineTo(640, yy - 2); c.lineTo(530, yy + 12); c.fill(); }
            c.restore();
          },
        });
        // 완충재·골판지 조각
        for (const d of this.debris) {
          const u = hitU - d.delay;
          if (u <= 0) continue;
          const x = d.x0 + d.vx * (1 - Math.exp(-1.4 * u)) / 1.4, y = d.y0 + d.vy * u + 1300 * u * u;
          if (y > 1700 || x < 0 || x > 1100) continue;
          const sz = d.size * Math.min(1, u / 0.06);
          ctx.save(); ctx.translate(x, y); ctx.rotate(d.rot0 + d.spin * u);
          if (d.kind === 'peanut') sticker(ctx, [{ P: ellPath(-sz * 0.45, 0, sz * 0.62, sz * 0.5), col: '#f1ead8' }, { P: ellPath(sz * 0.45, 0, sz * 0.62, sz * 0.5), col: '#f1ead8' }], 2.6);
          else sticker(ctx, [{ P: polyPath([[-sz, -sz * 0.6], [sz, -sz * 0.4], [sz * 0.7, sz * 0.6], [-sz * 0.8, sz * 0.5]]), col: KRAFT }], 2.6);
          ctx.restore();
        }
      });
    }

    // ================= 의성어 (칸 위에, 칸 테두리를 넘어도 된다)
    // 띵동: 둥근 모서리, 짧은 입체(파랑 망점), 초인종에서 튀어나와 통통 튄다
    G.ding.forEach((g, i) => {
      const q = dingPose(i, t, g);
      if (!q) return;
      const F = mapGlyph(g, affine(q));
      const vx = q.x + 70, vy = q.y + 1000, k = 0.036;
      const B = extrude(F, vx, vy, k), dl = Math.hypot(vx - q.x, vy - q.y);
      drawLetter(ctx, F, B, g.sign, ST.ding, { L: q, depth: [q.x, q.y, (vx - q.x) / dl, (vy - q.y) / dl, q.s * g.h * 0.3, q.s * g.h * 0.5 + dl * k] });
    });
    // 반짝이(띵동 둘레)
    if (t > T.ring[0]) {
      const S = new Path2D();
      [[300, 170, 15, 0.8], [468, 312, 12, 0.95], [292, 452, 11, 1.12], [470, 520, 14, 1.25]].forEach(([x, y, r, t0], j) => {
        const p = outBack(seg(t, t0, t0 + 0.25), 2.5);
        if (p > 0) star4(S, x, y, r * p * (0.8 + 0.2 * Math.sin(t * 8 + j * 2)), 0.1 * j);
      });
      sticker(ctx, [{ P: S, col: YEL }], 2.6);
    }
    // 휘이익: 경로를 따라 휘고(굽은 기준선), 기울고(이탤릭), 늘어난다. 지나간 자리에 파랑 잔상
    if (X2.vis && t >= T.dash0) {
      const sc = catS(t);
      G.whoosh.forEach((g, i) => {
        const W = WHOOSH[i], S0 = W.at * PATH2.L, pop = seg(sc, S0 + 10, S0 + 170);
        if (pop <= 0) return;
        const sca = (0.45 + 0.55 * outBack(pop, 2)) * W.size / K, stretch = lerp(1.9, 1.22, outExpo(pop)), shear = 0.36;
        const v0 = -14 + (hash(i, 7) - 0.5) * 16, rj = (hash(i, 8) - 0.5) * 0.14, cr = Math.cos(rj), sr = Math.sin(rj);
        const warp = (S) => (x, y, nx, ny, kk, o, j) => {
          const xr = x * cr - y * sr, yr = x * sr + y * cr;
          const [px, py, tx, ty] = PATH2.at(S + (xr * stretch - yr * shear) * sca);
          const v = v0 + yr * sca;
          o[j] = px - ty * v; o[j + 1] = py + tx * v;
        };
        // 잔상: 경로 뒤쪽으로 밀린 같은 글자를 파랑판에 옅게
        ctx.save(); plate(ctx, 'C'); ctx.globalCompositeOperation = 'multiply';
        for (const [back, a] of [[64, 0.22], [34, 0.38]]) {
          const E = new Path2D(); addContours(E, mapGlyph(g, warp(S0 - back * sca * 2)));
          ctx.fillStyle = `rgba(58,162,210,${a})`; ctx.fill(E);
        }
        ctx.restore();
        const F = mapGlyph(g, warp(S0));
        const [lx, ly, ltx, lty] = PATH2.at(S0);
        drawLetter(ctx, F, null, g.sign, ST.whoosh, { L: { x: lx - lty * v0, y: ly + ltx * v0, rot: Math.atan2(lty, ltx), s: sca } });
      });
    }
    // 부르르: 물결 외곽선이 매 1/24초 새로 흔들리고, 양옆에 진동 겹선이 남는다
    G.shiver.forEach((g, i) => {
      const L = SHIVER[i];
      if (!X3.vis || t < L.t0) return;
      const pop = seg(t, L.t0, L.t0 + 0.3);
      const s = (0.3 + 0.7 * outBack(pop, 2.4)) * L.size / K;
      const jx = A * 7 * (hash(step, i, 3) - 0.5) * 2, jy = A * 3 * (hash(step, i, 4) - 0.5) * 2;
      const disp = A > 0 ? (x, y, k) => A * 9 * (vnoise(k * 0.23 + step * 7.3, i + 11) * 2 - 1) : null;
      const q = { x: L.x + jx, y: L.y + jy, s, rot: L.rot + A * 0.05 * (hash(step, i, 5) - 0.5), disp };
      const F = mapGlyph(g, affine(q));
      const gap = 18 + 8 * A, ga = pop;
      drawLetter(ctx, F, null, g.sign, ST.shiver, { L: q, ghosts: [[-gap, 0, 0.6 * ga], [gap, 0, 0.6 * ga], [-gap * 1.8, 2, 0.28 * ga]] });
    });
    // 콰쾅!: 상자(소실점)에서 튀어나오며 커지고, 입체가 소실점까지 뻗었다가 줄어든다. 금이 가고 별이 튄다
    if (X4.vis) {
      withPanel(ctx, 'p4', X4, () => {
        G.boom.forEach((g, i) => {
          const L = BOOM[i], u = t - L.t0;
          if (u < 0) return;
          const p = outExpo(seg(u, 0, 0.22));
          const sp = 0.12 + 0.88 * outBack(seg(u, 0, 0.3), 2.6);
          const x = lerp(VP[0], L.x, p) + 8 * wobS(u - 0.18, 61, 6), y = lerp(VP[1], L.y, p) + 6 * wobS(u - 0.18, 53, 6);
          const q = { x, y, s: sp * L.size / K, rot: L.rot + 0.4 * (1 - p) * (i - 1) };
          const F = mapGlyph(g, affine(q));
          const k = lerp(0.95, 0.27, outExpo(seg(u, 0.02, 0.4)));
          const B = extrude(F, VP[0], VP[1], k);
          const dl = Math.hypot(VP[0] - x, VP[1] - y) || 1;
          drawLetter(ctx, F, B, g.sign, ST.boom, {
            L: q, depth: [x, y, (VP[0] - x) / dl, (VP[1] - y) / dl, q.s * g.h * 0.2, q.s * g.h * 0.5 + dl * k * 0.9],
            cracks: this.cracks[i], crackP: seg(t, 5.74 + i * 0.04, 5.88 + i * 0.04),
          });
        });
        // 충격 별: 흰 네 갈래 + 노랑 뾰족 별
        const W4 = new Path2D(), Y4 = new Path2D();
        [[110, 1010, 30], [388, 966, 22], [718, 936, 28], [964, 994, 36], [960, 1256, 22], [150, 1296, 26], [712, 1290, 18]].forEach(([x, y, r], j) => {
          const p = outBack(seg(t, T.hit + 0.16 + j * 0.03, T.hit + 0.4 + j * 0.03), 2.6);
          if (p <= 0) return;
          const rr = r * p * (0.85 + 0.15 * Math.sin(t * 9 + j));
          if (j % 2) spiky(Y4, x, y, rr * 0.45, rr, 8, 0.2 * j + 0.3 * t, 90 + j); else star4(W4, x, y, rr * 1.2, 0.3 * j);
        });
        sticker(ctx, [{ P: Y4, col: YEL }], 3);
        sticker(ctx, [{ P: W4, col: null }], 3);
      });
    }

    // ---------------- 칸 5(속 칸): 상자에서 얼굴을 내민 고양이 + 반짝
    if (X5.vis) {
      drawPanel(ctx, 'p5', X5, () => {
        drawP5bg(ctx);
        const up = outBack(seg(t, T.peek, T.peek + 0.35), 1.7);
        const blink = t > 9.18 && t < 9.3 ? 1 : 0;
        ctx.save(); ctx.translate(850, 1500 + 80 * (1 - up)); ctx.scale(0.92, 0.92); catPeek(ctx, { blink }); ctx.restore();
        const rim = polyPath([[670, 1536], [1010, 1528], [1010, 1610], [670, 1610]]);
        sticker(ctx, [{ P: rim, col: KRAFT }], 4);
        inkLine(ctx, [[670, 1552], [1010, 1544]], 2.4, 0.5);
        ctx.save(); ctx.translate(848, 1536 - 6 * up); catPaws(ctx); ctx.restore();
      }, 16);
      withPanel(ctx, 'p5', X5, () => {
        G.spark.forEach((g, i) => {
          const L = SPARK[i], u = t - L.t0;
          if (u < 0) return;
          const s = (0.2 + 0.8 * outBack(seg(u, 0, 0.3), 2.8)) * L.size / K;
          const q = { x: L.x, y: L.y - 4 * Math.sin((t - L.t0) * 7 + i * 2) * seg(u, 0.3, 0.6), s, rot: L.rot };
          const F = mapGlyph(g, affine(q));
          const vx = q.x + 30, vy = q.y + 700, kk = 0.05, B = extrude(F, vx, vy, kk), dl = Math.hypot(30, 700);
          drawLetter(ctx, F, B, g.sign, ST.spark, { L: q, depth: [q.x, q.y, 30 / dl, 700 / dl, q.s * g.h * 0.3, q.s * g.h * 0.5 + 35] });
        });
        const S = new Path2D();
        [[920, 1376, 16, 8.0], [960, 1430, 10, 8.15], [716, 1452, 12, 8.25], [898, 1452, 8, 8.35]].forEach(([x, y, r, t0], j) => {
          const p = outBack(seg(t, t0, t0 + 0.25), 2.5);
          if (p > 0) star4(S, x, y, r * p * (0.7 + 0.3 * Math.sin(t * 9 + j * 1.7)), 0);
        });
        sticker(ctx, [{ P: S, col: YEL }], 2.4);
      });
    }
    // ---------------- 해설 상자
    if (t >= T.cap) {
      const p = outBack(seg(t, T.cap, T.cap + 0.3), 1.8);
      ctx.save(); ctx.translate(252, 1552); ctx.rotate(-0.025); ctx.scale(p, p);
      sticker(ctx, [{ P: polyPath([[-164, -46], [164, -46], [164, 46], [-164, 46]]), col: '#fbe39a' }], 3.6);
      ctx.fillStyle = INK; ctx.font = '700 37px "Gaegu"'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('고양이에게 택배는,', -144, -8);
      ctx.fillText('상자가 본품이다.', -144, 32);
      ctx.restore();
    }

    // 인쇄 결
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(this.grain, 0, 0); ctx.restore();
  },
});
