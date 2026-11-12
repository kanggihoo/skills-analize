/*
 * 157 · 칸 너머로 점프 — webtoon panel directing: scroll is time, the gutter is a pause, the big beat breaks the border.
 *
 * A vertical strip scrolls up through the 9:16 frame. Five panels, each a directing choice:
 *   1 wide establishing shot (rooftop at sunset, a cat yawns)   2 letterbox close-up (the eyes go wide: a paper butterfly)
 *   3 tall panel with slanted borders (crouch, wiggle, leap)     — a 740 px empty gutter —
 *   4 small silent panel (the cat hangs mid-air, nothing moves)   5 full bleed, no border (the box: "쏙", the butterfly lands)
 *
 * strip.js turns the layout into the timeline: dwell = 0.25 + 0.06·syllables + beat; moves are minimum jerk in reading
 * time σ(s) = ∫ ds / v(s), with v = 2600 px/s over panel art and 520 px/s over empty gutter, so a gutter of height G
 * holds the scroll for ≈ G/520 s. Every panel is a clipped window; its baked layers are drawn at y − f·d (d = the
 * panel's stop − s), an inner parallax camera. The leaping cat lives on a layer above the borders, clipped by the union
 * panel 3 ∪ gutter ∪ panel 4, and is staged in camera space so the border and the empty gutter slide under it.
 */
import { defineDemo, rand, clamp, lerp, smooth, ramp, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import * as S from './strip.js';
import * as A from './art.js';

const D = 10, W = 1080, H = 1920, TAU = Math.PI * 2, DEG = Math.PI / 180;
const C = A.C;
const PRE = `"${FONTS.pretendard.family}"`, GAEGU = `"${FONTS.gaegu.family}"`, BHS = `"${FONTS.blackHanSans.family}"`;
const PAPER_H = 640;

// ---------------------------------------------------------------- beats (seconds), all derived from the strip timeline
const [, P2, P3] = S.PANELS;
const T_YAWN = 0.62;
const T_FLY = [P2.t0 - 0.06, P2.t1 - 0.2];          // the butterfly crosses the close-up
const T_WIDE = 2.3;                                  // the eyes go wide
const T_CROUCH = P3.t0, T_WIGGLE = P3.t0 + 0.38;
const T_LAUNCH = S.T_LAUNCH, T_ARRIVE = S.T_ARRIVE;
const T_LAND = S.ARRIVE5 - 0.08;                     // "쏙": the cat drops into the box as the strip settles
const T_BFLY5 = [T_LAND + 0.22, T_LAND + 0.76];        // the butterfly floats down onto the nose
const T_NYANG = T_BFLY5[1] + 0.16;

// ---------------------------------------------------------------- panel 2: the butterfly's pass and the eyes
const EYES = [[330, 1196], [750, 1196]];
function fly2(t) {
  const u = (t - T_FLY[0]) / (T_FLY[1] - T_FLY[0]);
  const x = lerp(-30, 1090, u), y = 1168 + 46 * Math.sin(TAU * 0.85 * (t - T_FLY[0]) + 0.6) - 18 * Math.sin(TAU * 5.5 * t);
  return { u, x, y, ph: TAU * 5.5 * t, rot: 0.3 + 0.18 * Math.sin(TAU * 1.3 * t) };
}
// ---------------------------------------------------------------- panel 3 → 4: the butterfly leads the leap
const HOVER = [300, 2160], BREST = [372, 3796];
function fly34(t) {
  const q = ease.inOutCubic(clamp((t - T_LAUNCH + 0.08) / (T_ARRIVE - T_LAUNCH - 0.3)));
  const still = q >= 1 ? 1 : 0;
  const bob = (1 - q) * (22 * Math.sin(TAU * 0.9 * t) + 8 * Math.sin(TAU * 5.5 * t));
  return {
    x: lerp(HOVER[0], BREST[0], q) + (1 - q) * 18 * Math.sin(TAU * 0.6 * t + 1), y: lerp(HOVER[1], BREST[1], q) + bob,
    ph: still ? 0.9 : TAU * 5.5 * Math.min(t, T_ARRIVE - 0.3), rot: lerp(-0.2 + 0.12 * Math.sin(TAU * 1.1 * t), 0.35, q), open: still ? 0.9 : 1,
  };
}
// the cat on the ledge and in flight
const DIVE = [[0, 8], [0.05, -20], [0.22, 70], [0.6, 74], [1, 56]];
function trackAt(keys, u) {
  if (u <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (u <= keys[i][0]) {
    const k = smooth((u - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
    return lerp(keys[i - 1][1], keys[i][1], k);
  }
  return keys[keys.length - 1][1];
}
function catState(t) {
  if (t < T_LAUNCH) {
    const c = lerp(0.3, 1, ease.inOutCubic(clamp((t - T_CROUCH) / 0.32)));
    const wEnv = ramp(t, T_WIGGLE, T_WIGGLE + 0.12) * (1 - ramp(t, T_LAUNCH - 0.12, T_LAUNCH - 0.02));
    const wig = 9 * wEnv * Math.sin(TAU * 4.6 * (t - T_WIGGLE));
    const lash = Math.sin(TAU * 1.3 * t) * (10 + 18 * wEnv);
    return {
      x: S.PERCH[0], y: S.PERCH[1], alpha: 8 + 6 * c, sc: 1.1,
      pose: { c, s: 0, wig, ear: 0.15 * c, tail: [168 - 10 * c, -18 + lash * 0.6, -24 + lash], open: 1, pupil: lerp(0.5, 0.95, c), look: [0.8, 0.6], mouth: 0 },
      halo: false,
    };
  }
  const L = S.leap(t), u = clamp((t - T_LAUNCH) / (T_ARRIVE - T_LAUNCH));
  const live = 1 - smooth(L.p);                         // secondary motion fades out: the silent panel is still
  const c = 1 - smooth(u / 0.06), s = smooth(u / 0.12), alpha = trackAt(DIVE, u);
  return {
    x: L.x, y: L.y, alpha, sc: lerp(lerp(1.1, 1.24, smooth(L.p / 0.3)), 0.7, smooth((L.p - 0.62) / 0.38)), L,
    pose: {
      c, s, wig: 0, ear: 0.85 * s, tail: [-148 + 10 * live * Math.sin(TAU * 2.2 * t), 26 + 12 * live * Math.sin(TAU * 2.2 * t - 1), 34],
      open: 1, pupil: 0.95, look: [0.9, 0.2], mouth: 0.35 * s, reach: smooth(L.p),
      headRot: -0.5 * Math.max(0, alpha) * DEG,          // the head stays nearer level than the diving body: eyes on the target
    },
    halo: true,
  };
}

// ---------------------------------------------------------------- helpers
const pop = (t, t0, d = 0.34, k = 2.2) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / d), k));
function bake(rect, painter) {
  const [x0, y0, x1, y1] = rect, { c, g } = A.mk(x1 - x0, y1 - y0);
  g.translate(-x0, -y0); painter(g);
  return { c, x: x0, y: y0 };
}
const bbox = (poly) => [Math.min(...poly.map((p) => p[1])), Math.max(...poly.map((p) => p[1]))];
const GUTTER3 = [S.P.p3.poly[2], [1008, S.P.p4.poly[0][1]], [72, S.P.p4.poly[0][1]], S.P.p3.poly[3]];

defineDemo({
  id: '157-webtoon-panels',
  title: '칸 너머로 점프',
  tech: '웹툰 칸 연출 · 스크롤이 곧 시간 + 칸 사이 여백 + 칸 깨기',
  duration: D,
  background: C.paper,

  async setup(api) {
    A.setCPU(api.headless);
    await fontReady(`800 54px ${PRE}`, '지붕 위의 나비');
    await fontReady(`700 30px ${PRE}`, '제7화 해 질 녘, 옥상');
    await fontReady(`700 46px ${GAEGU}`, '하아암…냥팔랑');
    await fontReady(`400 200px ${BHS}`, '휙쏙!');
    const main = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.ctx = main.ctx;

    // ---- panel layers: { c, x, y, f }  (f = parallax: share of the scroll the layer resists)
    const L = (f, rect, painter, extra = {}) => ({ ...bake(rect, painter), f, ...extra });
    this.layers = {
      p1: [L(0.2, [72, -80, 1008, 1220], A.P1.sky), L(0.16, [72, 380, 1008, 640], A.P1.clouds, { drift: 7 }),
        L(0.1, [40, 560, 1040, 1200], A.P1.far), L(0.04, [40, 600, 1070, 1300], A.P1.mid),
        L(0, [40, 690, 1040, 1200], A.P1.near), L(-0.08, [40, 260, 1040, 430], A.P1.wires, { front: true })],
      p2: [L(0.05, [40, 900, 1040, 1500], A.P2.fur)],
      p3: [L(0.18, [72, 1180, 1008, 3140], A.P3.sky), L(0.1, [40, 2200, 1040, 3200], A.P3.city),
        L(0.05, [40, 2560, 680, 3100], A.P3.terrace), L(0, [580, 1740, 1066, 3062], A.P3.building)],
      p4: [L(0.12, [200, 3150, 680, 4130], A.P4.sky)],
      p5: [L(0.15, [0, 4080, 1080, 6480], A.P5.sky), L(0.08, [-10, 4880, 1090, 5640], A.P5.city),
        L(0.03, [-40, 4540, 1120, 4900], A.P5.lights), L(0, [0, 5150, 1080, 6262], A.P5.terrace),
        L(-0.1, [-60, 5480, 1140, 6262], A.P5.leaves, { front: true })],
    };
    this.paper = A.bakePaper(W, PAPER_H);

    // ---- lettering
    this.caption = A.bakeCaption({ x: 100, y: 230, text: '해 질 녘, 옥상', font: `700 30px ${PRE}`, size: 30 });
    this.balloons = [
      { t0: T_YAWN + 0.06, ...A.bakeBalloon({ cx: 452, cy: 586, rx: 128, ry: 62, tip: [624, 700], text: '하아암…', font: `700 46px ${GAEGU}`, size: 46, dy: 2 }) },
      { t0: T_WIDE + 0.08, ...A.bakeBalloon({ cx: 930, cy: 1016, rx: 50, ry: 50, tip: [826, 1114], text: '!', font: `400 62px ${BHS}`, size: 62, dy: 3 }) },
      { t0: T_NYANG, ...A.bakeBalloon({ cx: 818, cy: 5020, rx: 112, ry: 64, tip: [612, 5196], text: '…냥', font: `700 46px ${GAEGU}`, size: 46, dy: 2 }) },
    ];
    const g2 = (ch) => A.bakeGlyph(ch, `700 54px ${GAEGU}`, 54, { rimW: 0.1 });
    this.sfx2 = ['팔', '랑', '팔', '랑'].map(g2);
    this.sfx3 = [A.bakeGlyph('휙', `400 210px ${BHS}`, 210, { fill: C.creamHi, rim: C.ink, rimW: 0.07, edge: C.cream }),
      A.bakeGlyph('!', `400 160px ${BHS}`, 160, { fill: C.creamHi, rim: C.ink, rimW: 0.07, edge: C.cream })];
    this.sfx5 = [A.bakeGlyph('쏙', `400 176px ${BHS}`, 176, { fill: C.creamHi, rim: C.ink, rimW: 0.07, edge: C.cream }),
      A.bakeGlyph('!', `400 120px ${BHS}`, 120, { fill: C.creamHi, rim: C.ink, rimW: 0.07, edge: C.cream })];
    const H0 = A.mk(1080, 260), hg = H0.g;
    hg.textAlign = 'center'; hg.textBaseline = 'middle';
    hg.font = `700 26px ${PRE}`; const cw = hg.measureText('제7화').width + 34;
    hg.fillStyle = C.ink; A.rr(hg, 540 - cw / 2, 72, cw, 40, 20); hg.fill();
    hg.fillStyle = C.cream; hg.fillText('제7화', 540, 93);
    hg.fillStyle = C.ink; hg.font = `800 54px ${PRE}`; hg.fillText('지붕 위의 나비', 540, 162);
    hg.fillRect(510, 206, 60, 4);
    this.header = H0.c;

    // ---- focus lines for the leap (panel 3): a radial burst around the launch point, inked on from the edges inward
    const r = rand(157);
    this.burst = { x: S.PERCH[0] - 30, y: S.PERCH[1] + 90, lines: [] };
    for (let i = 0; i < 110; i++) {
      const a = TAU * (i + 0.8 * r()) / 110;
      this.burst.lines.push({ a, rIn: lerp(170, 380, r()), w: lerp(4, 20, r() * r()), delay: 0.12 * r(), alpha: lerp(0.4, 0.9, r()) });
    }
    // ---- caption band and the rail's panel map
    const F = A.mk(W, 420), fg = F.g, fgr = fg.createLinearGradient(0, 0, 0, 420);
    fgr.addColorStop(0, 'rgba(34,31,60,0)'); fgr.addColorStop(0.4, 'rgba(34,31,60,0.86)'); fgr.addColorStop(1, 'rgba(34,31,60,0.95)');
    fg.fillStyle = fgr; fg.fillRect(0, 0, W, 420);
    this.foot = F.c;

    // warm-up: composite every baked canvas once (the first composite of a CPU canvas is then not special)
    const ctx = this.ctx;
    for (const k in this.layers) for (const l of this.layers[k]) ctx.drawImage(l.c, 0, 0, 4, 4);
    for (const b of [this.caption, ...this.balloons, ...this.sfx2, ...this.sfx3, ...this.sfx5]) ctx.drawImage(b.c, 0, 0, 4, 4);
    ctx.drawImage(this.paper, 0, 0, 4, 4); ctx.drawImage(this.header, 0, 0, 4, 4); ctx.drawImage(this.foot, 0, 0, 4, 4);
  },

  // ------------------------------------------------------------------------------------------------ panels
  layer(l, d, t, front) {
    if (!!l.front !== front) return;
    this.ctx.drawImage(l.c, l.x + (l.drift || 0) * t, l.y - l.f * d);
  },

  panel1(t, d) {
    const ctx = this.ctx;
    for (const l of this.layers.p1) this.layer(l, d, t, false);
    const yawn = ramp(t, T_YAWN, T_YAWN + 0.18) * (1 - ramp(t, T_YAWN + 0.5, T_YAWN + 0.7));
    ctx.save(); ctx.translate(650, 812);
    A.drawSitCat(ctx, { tail: Math.sin(TAU * 0.7 * t) * 0.8, yawn, look: Math.sin(t * 2) * 0.3 });
    ctx.restore();
    for (const l of this.layers.p1) this.layer(l, d, t, true);
  },

  panel2(t, d) {
    const ctx = this.ctx;
    const push = 1 + 0.05 * ease.inOutCubic(clamp((t - P2.t0 + 0.4) / 1.9));
    ctx.translate(540, 1200); ctx.scale(push, push); ctx.translate(-540, -1200);
    for (const l of this.layers.p2) this.layer(l, d, t, false);
    const b = fly2(t), inPass = b.u > 0 && b.u < 1;
    const wide = t < T_WIDE ? 0 : ease.outBack(clamp((t - T_WIDE) / 0.16), 2.6);
    const open = lerp(0.4, 1, wide), pupil = lerp(0.1, 0.9, ease.outCubic(clamp((t - T_WIDE - 0.02) / 0.3)));
    const lookTo = inPass ? clamp((b.x - 540) / 520, -1, 1) : b.u <= 0 ? 0 : 0.75;
    const look = t < T_FLY[0] ? 0 : lookTo;
    for (const [i, [ex, ey]] of EYES.entries()) {
      const near = inPass ? clamp(1 - Math.abs(b.x - ex) / 330) : 0;
      A.drawBigEye(ctx, ex, ey, { open, pupil, look, rot: i ? -0.07 : 0.07,
        refl: { a: near * 0.9, x: -(b.x - ex) * 0.1, y: (b.y - ey) * 0.08, ph: b.ph } });
    }
    // 팔랑팔랑 — hand-lettered along the trail, a syllable as the butterfly passes
    this.sfx2.forEach((gl, k) => {                       // the butterfly flies left → right, so the word inks on in reading order
      const tk = T_FLY[0] + 0.3 + 0.16 * k, p = fly2(tk);
      const s = pop(t, tk, 0.3, 2.6);
      if (s <= 0) return;
      const x = p.x - 40, y = 1312 - 10 * ease.outCubic(clamp((t - tk) / 0.8)) + (k % 2 ? 6 : -6);
      this.glyph(gl, x, y, s, (k % 2 ? 0.16 : -0.12), clamp((t - tk) / 0.06));
    });
    if (inPass) A.drawButterfly(ctx, b.x, b.y, 50, b.ph, b.rot, 1);
  },

  panel3(t, d) {
    const ctx = this.ctx;
    for (const l of this.layers.p3) this.layer(l, d, t, false);
    if (t < T_LAUNCH) return;
    // the action beat: the background drops to night and focus lines burst from the launch point
    const k = ease.outCubic(clamp((t - T_LAUNCH) / 0.12));
    ctx.globalAlpha = 0.78 * k; ctx.fillStyle = C.indigo0; ctx.fillRect(40, 1400, 1000, 1500); ctx.globalAlpha = 1;
    ctx.fillStyle = C.cream;
    const B = this.burst, R_OUT = 1700;
    for (const L of B.lines) {
      const g = ease.outCubic(clamp((t - T_LAUNCH - L.delay) / 0.16));
      if (g <= 0) continue;
      const rin = lerp(R_OUT, L.rIn, g), ca = Math.cos(L.a), sa = Math.sin(L.a), hw = L.w / 2;
      ctx.globalAlpha = L.alpha * k;
      ctx.beginPath();
      ctx.moveTo(B.x + ca * rin, B.y + sa * rin);
      ctx.lineTo(B.x + ca * R_OUT - sa * hw, B.y + sa * R_OUT + ca * hw);
      ctx.lineTo(B.x + ca * R_OUT + sa * hw, B.y + sa * R_OUT - ca * hw);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // push-off dust from the ledge
    const du = clamp((t - T_LAUNCH) / 0.45);
    if (du > 0 && du < 1) {
      ctx.fillStyle = C.cream;
      for (let i = 0; i < 7; i++) {
        const a = Math.PI * (0.05 + 0.13 * i), rr = 30 + 90 * ease.outCubic(du);
        ctx.globalAlpha = 0.8 * (1 - du);
        ctx.beginPath(); ctx.arc(700 + Math.cos(a) * rr * 1.4, 1840 - Math.sin(a) * rr * 0.4, 9 + 14 * du * (i % 3 + 1) / 3, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // 휙! — drawn on the panel, the cat passes over it
    const s = pop(t, T_LAUNCH + 0.04, 0.3, 2.4);
    this.glyph(this.sfx3[0], 238, 2050, s, -0.2, clamp((t - T_LAUNCH - 0.04) / 0.05));
    this.glyph(this.sfx3[1], 360, 2016, pop(t, T_LAUNCH + 0.1, 0.3, 2.4), -0.1, clamp((t - T_LAUNCH - 0.1) / 0.05));
  },

  panel4(t, d) {
    for (const l of this.layers.p4) this.layer(l, d, t, false);
  },

  panel5(t, d) {
    const ctx = this.ctx;
    const push = 1 + 0.13 * ease.inOutCubic(clamp((t - S.ARRIVE5 + 0.25) / (D - S.ARRIVE5 + 0.25)));
    ctx.translate(540, 5250); ctx.scale(push, push); ctx.translate(-540, -5250);
    for (const l of this.layers.p5) this.layer(l, d, t, false);
    // the box, the cat dropping in, the butterfly
    const u = t - T_LAND;
    const sq = u < 0 ? 0 : -0.15 * Math.exp(-u / 0.13) * Math.cos(TAU * u / 0.36);
    const BX = 540, BY = 5440;
    A.drawBox(ctx, BX, BY, sq, 'back');
    if (u > -0.24 && u < 0.02) {                                   // the drop: accelerating, nose first
      const k = clamp((u + 0.24) / 0.24), y = lerp(4840, 5330, k * k);
      ctx.save(); ctx.translate(lerp(600, 548, k), y); ctx.rotate(-80 * DEG); ctx.scale(-0.72, 0.72);
      A.drawCat(ctx, { s: 1, ear: 0.9, tail: [-170, 10, 10], open: 1, pupil: 0.9, look: [1, 0], reach: 1 });
      ctx.restore();
    }
    let headY = 5300;
    if (u > 0.06) headY = lerp(5330, 5214, ease.outBack(clamp((u - 0.06) / 0.34), 2.2));
    const bf = this.fly5(t);
    if (u > 0.06) {
      const cross = ease.inOutCubic(clamp((t - T_BFLY5[1] + 0.1) / 0.3));
      ctx.save(); ctx.translate(BX, headY + sq * 120); ctx.scale(1.2, 1.2); ctx.translate(-BX, -headY - sq * 120);
      A.drawBoxCat(ctx, BX, headY + sq * 120, {
        open: 1, cross, lookY: bf ? clamp((bf.y - headY) / 300, -1, 0) * (1 - cross) : -0.6, ear: Math.max(0, 1 - (u - 0.06) / 0.3),
        blush: ramp(t, T_BFLY5[1] + 0.05, T_BFLY5[1] + 0.4), mouth: ramp(t, T_NYANG, T_NYANG + 0.1) * (1 - ramp(t, T_NYANG + 0.35, T_NYANG + 0.5)) * 0.8,
      });
      ctx.restore();
    }
    A.drawBox(ctx, BX, BY, sq, 'front');
    const pw = pop(t, T_LAND + 0.3, 0.26, 2.4);                     // paws hook over the rim once the head is up
    if (pw > 0) for (const k of [-1, 1]) {
      ctx.save(); ctx.translate(BX + k * 66, BY - 182 + sq * 40); ctx.scale(pw, pw); A.drawPaw(ctx, 0, 0); ctx.restore();
    }
    // 쏙!
    this.glyph(this.sfx5[0], 300, 5070, pop(t, T_LAND + 0.02, 0.3, 2.6), -0.18, clamp((t - T_LAND - 0.02) / 0.05));
    this.glyph(this.sfx5[1], 404, 5034, pop(t, T_LAND + 0.08, 0.3, 2.6), -0.06, clamp((t - T_LAND - 0.08) / 0.05));
    if (bf) A.drawButterfly(ctx, bf.x, bf.y + (headY - 5214) * 1.2, bf.size, bf.ph, bf.rot, bf.open);
    for (const l of this.layers.p5) this.layer(l, d, t, true);
  },
  fly5(t) {
    if (t < T_BFLY5[0]) return null;
    const u = clamp((t - T_BFLY5[0]) / (T_BFLY5[1] - T_BFLY5[0])), e = ease.inOutCubic(u);
    const x = lerp(930, 540, e) + (1 - e) * 40 * Math.sin(TAU * 1.4 * (t - T_BFLY5[0]));
    const y = lerp(4760, 5226, ease.outCubic(u)) + (1 - u) * 16 * Math.sin(TAU * 5 * t);
    const rest = u >= 1;
    return { x, y, size: lerp(44, 36, e), ph: rest ? 0.6 + 0.5 * Math.sin(TAU * 0.7 * (t - T_BFLY5[1])) : TAU * 5.5 * t, rot: lerp(-0.4, 0, e), open: 1 };
  },

  glyph(gl, x, y, s, rot, a) {
    if (s <= 0 || a <= 0) return;
    const ctx = this.ctx;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.globalAlpha = a; ctx.drawImage(gl.c, -gl.w / 2, -gl.h / 2, gl.w, gl.h);
    ctx.restore();
  },

  // ------------------------------------------------------------------------------------------------ the leap layer
  leapLayer(t) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    A.pathPoly(ctx, S.P.p3.poly, false); A.pathPoly(ctx, GUTTER3, false); A.pathPoly(ctx, S.P.p4.poly, false);
    ctx.clip();
    const st = catState(t);
    const place = () => { ctx.translate(st.x, st.y); ctx.rotate(-st.alpha * DEG); ctx.scale(-st.sc, st.sc); };
    // flat drop shadow on the paper of the gutter only
    if (st.halo) {
      ctx.save(); ctx.beginPath(); A.pathPoly(ctx, GUTTER3, false); ctx.clip();
      ctx.translate(18, 22); place(); A.drawCatShadow(ctx, st.pose, C.paperShade);
      ctx.restore();
    }
    // the butterfly leads; motion streaks trail the cat while it is fast
    const b = fly34(t);
    if (t > P2.t1 - 0.6) A.drawButterfly(ctx, b.x, b.y, 34, b.ph, b.rot, b.open);
    if (st.L) {
      const v = st.L, sp = Math.hypot(v.vx, v.vy), k = clamp((sp - 250) / 1200);
      if (k > 0.01) {
        const ux = -v.vx / sp, uy = -v.vy / sp, nx = -uy, ny = ux;
        ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
        for (const [o, l0, l1, w] of [[-92, 150, 420, 4], [-48, 200, 520, 3], [6, 210, 560, 4], [52, 170, 460, 3], [96, 150, 360, 2.5]]) {
          const bx = st.x + nx * o * st.sc + ux * l0 * st.sc, by = st.y + ny * o * st.sc + uy * l0 * st.sc;
          ctx.globalAlpha = 0.7 * k; ctx.lineWidth = w;
          ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + ux * (l1 - l0) * k, by + uy * (l1 - l0) * k); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }
    ctx.save(); place(); A.drawCat(ctx, { ...st.pose, halo: st.halo }); ctx.restore();
    ctx.restore();
  },

  // ------------------------------------------------------------------------------------------------ the rail
  rail(t, s) {
    const ctx = this.ctx, RX = 1044, Y0 = 150, Y1 = 1500, k = (Y1 - Y0) / S.STRIP_END;
    const e = ease.outCubic(clamp((t - 0.3) / 0.5));
    if (e <= 0) return;
    ctx.save(); ctx.translate(60 * (1 - e), 0); ctx.globalAlpha = e;
    ctx.fillStyle = 'rgba(244,234,215,0.86)'; A.rr(ctx, RX - 14, Y0 - 14, 28, Y1 - Y0 + 28, 14); ctx.fill();
    ctx.strokeStyle = 'rgba(43,38,67,0.18)'; ctx.lineWidth = 2; ctx.stroke();
    const mx = (x) => RX - 8 + 16 * x / W, my = (y) => Y0 + y * k;
    ctx.fillStyle = 'rgba(43,38,67,0.5)'; ctx.fillRect(RX - 4, my(150) - 1.5, 8, 3);       // the episode title
    for (const p of S.PANELS) {
      const poly = p.poly.map(([x, y]) => [mx(x), my(y)]);
      if (p.border) { ctx.fillStyle = 'rgba(43,38,67,0.55)'; A.pathPoly(ctx, poly); ctx.fill(); }
      else {                                                                              // full bleed: no edge, fades in
        const gr = ctx.createLinearGradient(0, poly[0][1], 0, poly[0][1] + 40);
        gr.addColorStop(0, 'rgba(43,38,67,0)'); gr.addColorStop(1, 'rgba(43,38,67,0.42)');
        ctx.fillStyle = gr; A.pathPoly(ctx, [[RX - 10, poly[0][1]], [RX + 10, poly[0][1]], [RX + 10, poly[2][1]], [RX - 10, poly[2][1]]]); ctx.fill();
      }
    }
    // the view window, with a notch at the reading line
    const y0 = my(s), y1 = my(s + S.VIEW_H);
    ctx.fillStyle = 'rgba(255,138,31,0.14)'; A.rr(ctx, RX - 12, y0, 24, y1 - y0, 7); ctx.fill();
    ctx.strokeStyle = C.accent; ctx.lineWidth = 3.5; ctx.stroke();
    const ya = my(s + S.ANCHOR);
    ctx.fillStyle = C.accent; ctx.beginPath(); ctx.moveTo(RX - 20, ya - 7); ctx.lineTo(RX - 12, ya); ctx.lineTo(RX - 20, ya + 7); ctx.closePath(); ctx.fill();
    ctx.restore();
  },

  // ------------------------------------------------------------------------------------------------ frame
  frame(t) {
    const ctx = this.ctx;
    ctx.reset();
    const s = S.scroll(t);
    // impact shake on the two big beats (closed-form decays)
    const sh = (t0, amp) => { const u = t - t0; return u < 0 || u > 0.5 ? [0, 0] : [amp * Math.exp(-u / 0.1) * Math.sin(TAU * 23 * u), amp * Math.exp(-u / 0.1) * Math.cos(TAU * 19 * u)]; };
    const [ax, ay] = sh(T_LAUNCH, 9), [bx, by] = sh(T_LAND, 6);
    const ox = ax + bx, oy = ay + by;

    // paper (scrolls with the strip)
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    const py = -(((s - oy) % PAPER_H) + PAPER_H) % PAPER_H;
    for (let y = py; y < H; y += PAPER_H) ctx.drawImage(this.paper, 0, y);

    ctx.setTransform(1, 0, 0, 1, ox, oy - s);
    // header (the episode title rises in)
    const he = ease.outCubic(clamp((t - 0.05) / 0.5));
    ctx.globalAlpha = he; ctx.drawImage(this.header, 0, 24 * (1 - he)); ctx.globalAlpha = 1;

    const draw = { p1: this.panel1, p2: this.panel2, p3: this.panel3, p4: this.panel4, p5: this.panel5 };
    S.PANELS.forEach((p, i) => {
      const [ya, yb] = bbox(p.poly);
      if (yb < s - 40 || ya > s + 1720) return;
      const d = S.STOPS[i] - s;
      ctx.save();
      A.pathPoly(ctx, p.poly); ctx.clip();
      draw[p.id].call(this, t, d);
      ctx.restore();
      ctx.setTransform(1, 0, 0, 1, ox, oy - s);
      if (p.border) {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineJoin = 'miter';
        A.pathPoly(ctx, p.poly); ctx.stroke();
      } else {                                           // full bleed: the image opens out of the paper, no edge
        const gr = ctx.createLinearGradient(0, ya, 0, ya + S.P5_FADE);
        gr.addColorStop(0, C.paper); gr.addColorStop(1, 'rgba(244,234,215,0)');
        ctx.fillStyle = gr; ctx.fillRect(0, ya - 2, W, S.P5_FADE + 2);
      }
    });

    if (s + 1720 > 1500 && s < 3900) this.leapLayer(t);

    // lettering over the borders: the narration box and the balloons pop from their tails
    const ce = pop(t, 0.2, 0.3, 1.8);
    if (ce > 0) {
      const c = this.caption;
      ctx.save(); ctx.translate(c.px, c.py); ctx.scale(ce, ce); ctx.translate(-c.px, -c.py);
      ctx.globalAlpha = clamp((t - 0.2) / 0.08); ctx.drawImage(c.c, c.x, c.y); ctx.restore();
    }
    for (const b of this.balloons) {
      const k = pop(t, b.t0, 0.32, 2.2);
      if (k <= 0) continue;
      ctx.save(); ctx.translate(b.px, b.py); ctx.scale(lerp(0.3, 1, k), lerp(0.3, 1, k)); ctx.translate(-b.px, -b.py);
      ctx.globalAlpha = clamp((t - b.t0) / 0.07); ctx.drawImage(b.c, b.x, b.y); ctx.restore();
    }

    // screen space: entrance, rail, caption band
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const fade = 1 - ease.outCubic(clamp(t / 0.55));
    if (fade > 0.002) { ctx.globalAlpha = fade; ctx.fillStyle = C.paper; ctx.fillRect(0, 230, W, H); ctx.globalAlpha = 1; }
    ctx.drawImage(this.foot, 0, H - 420);
    this.rail(t, s);
  },
});
