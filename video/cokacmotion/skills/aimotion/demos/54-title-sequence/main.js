/*
 * 54 · 오려 낸 제목 — the opening titles of an imaginary 1959 film, "아홉 번째 계단", in cut paper.
 * Canvas 2D. In setup every letter is traced from the font raster into polygons (trace.js) and every shape is a
 * polygon too; frame(t) quantises time to 12 poses a second (on twos: floor(t·12)) and, per pose, places each
 * piece by hand (seeded jitter), re-cuts its edge with that pose's seed (scissor facets, paper.js) and fills it
 * with a grain pattern that travels with it, over a flat field of coloured paper. Gate weave at 24 fps.
 * Five shots joined by match cuts: a bar → the stem of 각; stairs → a credit block; a spiral → the ㅇ of 아.
 */
import { defineDemo, rand, clamp, lerp } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { traceText, stemRect } from './trace.js';
import { TAU, hseed, mk, paperTile, sheetTile, piece, rectLoop, circleLoop, polyLoop, drawPiece } from './paper.js';

const D = 10, NSTEP = 120;
// shot boundaries (pose index, 12 per second)
const S2 = 14, S3 = 32, S4 = 60, S5 = 96;

const COL = { verm: '#d33c1c', black: '#18130f', ochre: '#cf962c', cream: '#eee2c6' };
const RIM = { verm: 'rgba(255,206,182,0.32)', black: 'rgba(196,184,166,0.24)', ochre: 'rgba(255,236,196,0.34)', cream: 'rgba(255,253,244,0.42)' };
const BHS = (px) => `400 ${px}px "Black Han Sans"`;
const DOH = (px) => `400 ${px}px "Do Hyeon"`;
const BEB = (px) => `400 ${px}px "Bebas Neue"`;

// stepped motion tables (one value per pose): arrive with a small overshoot, slide, leave accelerating
const SLAM = [0.52, 0.93, 1.05, 1];
const SLIDE = [0.2, 0.47, 0.73, 0.9, 0.98, 1];
const EXIT = [0.06, 0.3, 0.68, 1.15];
const GROW = [0.07, 0.22, 0.5, 0.82, 1.0];
const SHRINK = [0.22, 0.5, 0.78, 1.0];
const MORPH = [0.28, 0.72, 1.0];
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const HIT = 26;                                  // shot 4 pose of the inverted 'stab' when the title is complete

// shot 1 bars: [colour, rect, pose in, from, pose out, toward]
const BARS = [
  ['black', [112, 236, 196, 1476], 1, [0, -1560], 9, [0, -1700]],
  ['black', [868, 372, 938, 1612], 2, [0, 1600], 10, [0, 1700]],
  ['ochre', [52, 1236, 772, 1308], 3, [-900, 0], 9, [-1000, 0]],
  ['cream', [636, 146, 662, 1006], 5, [0, -1100], 8, [0, -1200]],
  ['black', [318, 540, 1028, 618], 5, [950, 0], 10, [950, 0]],
  ['cream', [236, 1392, 548, 1414], 6, [-700, 0], 11, [0, 900]],
];
// shot 3 roles, bottom stair first (so the block reads 촬영 · 음악 · 미술 · 편집 · 음향 from the top)
const ROLES = [['음향', 'SOUND'], ['편집', 'EDITING'], ['미술', 'ART DIRECTION'], ['음악', 'MUSIC'], ['촬영', 'CINEMATOGRAPHY']];

const CUT_BIG = { f0: 7, f1: 16, jag: 0.8, wander: 1.5 };
const CUT_MID = { f0: 6, f1: 12, jag: 0.6, wander: 1.0 };
const CUT_SMALL = { f0: 3.5, f1: 7, jag: 0.38, wander: 0.55 };
const CUT_BAR = { f0: 8, f1: 18, jag: 0.85, wander: 1.7 };

/** pose of a piece arriving at step n0 from offset `from` along table T; null before it arrives */
function arrive(P, n, n0, from, T = SLAM) {
  const k = n - n0;
  if (k < 0) return null;
  const v = k >= T.length ? 1 : T[k];
  return { x: P.home[0] + (1 - v) * from[0], y: P.home[1] + (1 - v) * from[1] };
}
/** the same pose carried away from step n1 toward offset `to`; null once it has left */
function leave(pose, n, n1, to) {
  if (!pose) return null;
  const k = n - n1;
  if (k < 0) return pose;
  if (k >= EXIT.length) return null;
  return { ...pose, x: pose.x + EXIT[k] * to[0], y: pose.y + EXIT[k] * to[1] };
}
const tab = (T, k) => (k <= 0 ? T[0] : k >= T.length ? T[T.length - 1] : T[k]);

/** a traced text as pieces laid out on the stage: ink box aligned to x (left | center | right), ink top at `top` */
function block(tr, { size, x, top, align = 'center', color, cut, lift = 1.2, seed, rot = 0.018 }) {
  const k = size / tr.size, { L, R, A, D: De } = tr.ink;
  const ox = align === 'left' ? x + L * k : align === 'right' ? x - R * k : x - (R - L) * k / 2;
  const oy = top + A * k;
  const r = rand(seed);
  const pieces = tr.comps.map((cp) => {
    const loops = cp.loops.map((l) => {
      const pts = new Float64Array(2 * l.n);
      for (let i = 0; i < l.n; i++) { pts[2 * i] = (l.pts[2 * i] - cp.cx) * k; pts[2 * i + 1] = (l.pts[2 * i + 1] - cp.cy) * k; }
      return { pts, corner: l.corner, n: l.n };
    });
    return piece(loops, { color, cut, lift, home: [ox + cp.cx * k, oy + cp.cy * k], rot0: (r() - 0.5) * 2 * rot, ch: cp.ch, box: cp.box.map((v) => v * k) });
  });
  return { pieces, top, bottom: top + (A + De) * k, left: ox - L * k, right: ox + R * k };
}
const inkW = (tr) => tr.ink.L + tr.ink.R;

/** an Archimedean strip r = a + bθ of width w, as one closed loop (outer edge out, inner edge back) */
function spiralLoop(a, pitch, w, turns, step = 5) {
  const b = pitch / TAU, th1 = turns * TAU, outer = [], inner = [];
  for (let th = 0; ; ) {
    const t = Math.min(th, th1), r = a + b * t;
    outer.push([(r + w / 2) * Math.cos(t), (r + w / 2) * Math.sin(t), 0]);
    inner.push([(r - w / 2) * Math.cos(t), (r - w / 2) * Math.sin(t), 0]);
    if (t >= th1) break;
    th += step / (r + w / 2);
  }
  outer[0][2] = 1; outer[outer.length - 1][2] = 1; inner[0][2] = 1; inner[inner.length - 1][2] = 1;
  return { loop: polyLoop([...outer, ...inner.reverse()]), R: a + b * th1 + w / 2 };
}

/** a rectangle piece built for this pose (rects morph, so they are rebuilt; the seed keeps their boil their own) */
function rectPiece(x0, y0, x1, y1, color, seed, o = {}) {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return piece([rectLoop(x0 - cx, y0 - cy, x1 - cx, y1 - cy)], { color, seed, home: [cx, cy], cut: CUT_BAR, lift: 1, ...o });
}

defineDemo({
  id: '54-title-sequence',
  title: '오려 낸 제목',
  tech: '컷아웃 그래픽 · 가위 자국 윤곽 · 2프레임 홀드(12fps) · 매치 컷',
  duration: D,
  background: COL.verm,
  async setup({ canvas, headless }) {
    const c = (this.ctx = canvas({ type: '2d', attrs: headless ? { willReadFrequently: true } : undefined }).ctx);
    await fontReady(BHS(200), '각본연출아홉번째계단');
    await fontReady(DOH(100), '촬영음악편집미술음향그날밤,계단은하나더있었다.');
    await fontReady(BEB(100), 'WRITTEN AND DIRECTED CINEMATOGRAPHY MUSIC EDITING ART DIRECTION SOUND THE NINTH STEP');

    // --- paper: one grain, one cloudiness, a sheet pattern per colour
    const grain = paperTile(11, 512, [[16, 0.1], [64, 0.09], [256, 0.06]], 1400);
    const cloudy = paperTile(23, 256, [[3, 0.3], [8, 0.22], [24, 0.12]], 0);
    const PAT = {};
    for (const k in COL) PAT[k] = c.createPattern(sheetTile(COL[k], grain, cloudy), 'repeat');
    this.PAT = PAT;
    // print fall-off: a gentle vignette, a little more at the foot so the caption reads on light fields
    {
      const v = mk(1080, 1920), g = v.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, 1080, 1920);
      const rg = g.createRadialGradient(540, 860, 300, 540, 960, 1250);
      rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(150,132,118,0.55)');
      g.fillStyle = rg; g.fillRect(0, 0, 1080, 1920);
      const lg = g.createLinearGradient(0, 1600, 0, 1920);
      lg.addColorStop(0, 'rgba(120,100,90,0)'); lg.addColorStop(1, 'rgba(120,100,90,0.5)');
      g.fillStyle = lg; g.fillRect(0, 1600, 1080, 320);
      this.vignette = v;
    }

    // --- type, traced once
    const T = {
      gak: traceText('각본', BHS, 400),
      yeon: traceText('연출', BHS, 400),
      wd: traceText('WRITTEN AND DIRECTED', BEB, 62, { scale: 2.5, spacing: 8 }),
      ahop: traceText('아홉', BHS, 400),
      beon: traceText('번째 계단', BHS, 160, { scale: 1.5 }),
      latin: traceText('THE NINTH STEP', BEB, 90, { scale: 2, spacing: 15 }),
      last1: traceText('그날 밤,', DOH, 62, { scale: 2 }),
      last2: traceText('계단은 하나 더 있었다.', DOH, 94, { scale: 2 }),
      roles: ROLES.map(([ko, en]) => ({ ko: traceText(ko, DOH, 62, { scale: 2 }), en: traceText(en, BEB, 44, { scale: 2.5, spacing: 5 }) })),
    };

    // ---------------- S2: 각본 / 연출 (black on cream) + WRITTEN AND DIRECTED (vermilion)
    const big2 = 400 * 800 / Math.max(inkW(T.gak), inkW(T.yeon));
    const gak = block(T.gak, { size: big2, x: 540, top: 300, color: 'black', cut: CUT_BIG, seed: 21 });
    const yeon = block(T.yeon, { size: big2, x: 540, top: gak.bottom + 52, color: 'black', cut: CUT_BIG, seed: 22 });
    const wd = block(T.wd, { size: 62, x: 540, top: yeon.bottom + 84, color: 'verm', cut: CUT_SMALL, seed: 23, lift: 0.8 });
    // the hero: the piece of 각 with the tallest full-height column is its ㅏ; its stem is the bar of shot 1
    let hero = null, heroStem = null;
    for (const P of gak.pieces.filter((p) => p.ch === 0)) {
      const s = stemRect(P.loops[0].pts);
      if (!heroStem || s[3] - s[1] > heroStem[3] - heroStem[1]) { hero = P; heroStem = s; }
    }
    hero.rot0 = 0;                                  // square to the frame, like the bar it replaces
    const HB = [hero.home[0] + heroStem[0], hero.home[1] + heroStem[1], hero.home[0] + heroStem[2], hero.home[1] + heroStem[3]];
    this.s2 = { gak, yeon, wd, hero, accent: [440, wd.bottom + 34, 640, wd.bottom + 46] };
    this.HB = HB;

    // ---------------- S3: five stairs → five credit bars, roles cut from cream and ochre
    const SX = 64, SWD = 168, SH = 112, SY = 1520;
    const stairs = [0, 1, 2, 3, 4].map((i) => [SX + i * SWD, SY - (i + 1) * SH, 1160, SY - i * SH]);
    const bars = [0, 1, 2, 3, 4].map((i) => { const j = 4 - i; return [64, 700 + j * 124, 1016, 700 + j * 124 + 104]; });
    const roles = T.roles.map((tr, i) => {
      const j = 4 - i, cy = 700 + j * 124 + 52;     // role i sits on the bar that was stair i (role 0 on the lowest bar)
      const ko = block(tr.ko, { size: 62, x: 104, top: 0, align: 'left', color: 'cream', cut: CUT_SMALL, seed: 40 + i, lift: 0.6 });
      const en = block(tr.en, { size: 44, x: 976, top: 0, align: 'right', color: 'ochre', cut: CUT_SMALL, seed: 50 + i, lift: 0.6 });
      for (const b of [ko, en]) { const dy = cy - (b.top + b.bottom) / 2; for (const P of b.pieces) P.home[1] += dy; }
      return { ko, en };
    });
    const ball = piece([circleLoop(30)], { color: 'verm', cut: { f0: 5, f1: 9, jag: 0.5, wander: 0.8 }, lift: 1.3 });
    this.s3 = { stairs, bars, roles, ball, SX, SWD, SH, SY };

    // ---------------- S4: the spiral → the ㅇ of 아; 아홉 / 번째 계단 / THE NINTH STEP
    const big4 = 400 * 830 / inkW(T.ahop);
    const ahop = block(T.ahop, { size: big4, x: 540, top: 450, color: 'cream', cut: CUT_BIG, seed: 61 });
    const beon = block(T.beon, { size: 160 * 700 / inkW(T.beon), x: 540, top: ahop.bottom + 58, color: 'ochre', cut: CUT_MID, seed: 62 });
    const latin = block(T.latin, { size: 90 * 600 / inkW(T.latin), x: 540, top: beon.bottom + 64, color: 'cream', cut: CUT_SMALL, seed: 63, lift: 0.8 });
    let ring = null;
    for (const P of ahop.pieces) if (P.ch === 0 && P.loops.length > 1 && (!ring || P.box[2] - P.box[0] > ring.box[2] - ring.box[0])) ring = P;
    if (!ring) ring = ahop.pieces[0];
    ring.color = 'verm';
    const ringR = ((ring.box[2] - ring.box[0]) + (ring.box[3] - ring.box[1])) / 4;
    const SPC = [540, 830];
    const sv = spiralLoop(48, 150, 84, 2.6), so = spiralLoop(123, 150, 33, 2.2);
    const spiral = piece([sv.loop], { color: 'verm', cut: { f0: 6, f1: 13, jag: 0.65, wander: 1.1 }, lift: 0 });
    const spiral2 = piece([so.loop], { color: 'ochre', cut: { f0: 5, f1: 11, jag: 0.55, wander: 0.9 }, lift: 0 });
    this.s4 = { ahop, beon, latin, ring, ringR, spiral, spiral2, R: sv.R, SPC, accent: [470, latin.bottom + 40, 610, latin.bottom + 50] };

    // ---------------- S5: the last line, a bar, a key
    const l1 = block(T.last1, { size: 62, x: 128, top: 690, align: 'left', color: 'black', cut: CUT_SMALL, seed: 81, lift: 0.8 });
    const l2 = block(T.last2, { size: 94 * 824 / inkW(T.last2), x: 128, top: l1.bottom + 30, align: 'left', color: 'black', cut: CUT_MID, seed: 82, lift: 0.9 });
    const barY = l2.bottom + 150;
    const KEY_SHAFT = [[30, -10], [192, -10], [192, 40], [178, 40], [178, 24], [166, 24], [166, 40], [150, 40], [150, 10], [30, 10]];
    const key = piece([circleLoop(40, 0, 0, 3), circleLoop(17, 0, 0, 3), polyLoop(KEY_SHAFT)],
      { holes: [false, true, false], color: 'cream', cut: { f0: 4, f1: 8, jag: 0.45, wander: 0.6 }, lift: 1.1, home: [712, barY - 44 * 1.25], rot0: -0.04 });
    this.s5 = { l1, l2, bar: [128, barY, 952, barY + 14], key, keySc: 1.25 };
  },

  frame(t) {
    const c = this.ctx;
    const n = Math.min(NSTEP - 1, Math.max(0, Math.floor(t * 12 + 1e-6)));
    const f24 = Math.floor(t * 24 + 1e-6);
    // gate weave (24 fps): the whole picture shifts and turns a hair, as through an old optical printer
    const wr = rand(hseed(f24, 4242));
    const wx = (wr() - 0.5) * 1.6, wy = (wr() - 0.5) * 1.6, wa = (wr() - 0.5) * 0.0011;
    const ca = Math.cos(wa), sa = Math.sin(wa);
    const base = [ca, sa, -sa, ca, 540 - (ca * 540 - sa * 960) + wx, 960 - (sa * 540 + ca * 960) + wy];
    c.setTransform(...base);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    const look = { pat: (k) => this.PAT[k], rim: (k) => RIM[k], map: null, shadow: 1 };
    const field = (k, ox = 0, oy = 0) => {
      const p = this.PAT[k];
      p.setTransform(new DOMMatrix([1, 0, 0, 1, ox, oy]));
      c.fillStyle = p; c.fillRect(-40, -40, 1160, 2000);
    };
    const draw = (P, pose, extra) => { if (pose) drawPiece(c, P, extra ? { ...pose, ...extra } : pose, n, look); };

    if (n < S2) this.shot1(n, c, look, field, draw);
    else if (n < S3) this.shot2(n - S2, c, look, field, draw);
    else if (n < S4) this.shot3(n - S3, c, look, field, draw);
    else if (n < S5) this.shot4(n - S4, n, c, look, field, draw, base);
    else this.shot5(n - S5, n, c, look, field, draw, base);

    // exposure: vignette and a per-frame flicker
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'multiply';
    c.drawImage(this.vignette, 0, 0);
    c.globalCompositeOperation = 'source-over';
    const fl = 0.012 + 0.03 * rand(hseed(f24, 99))();
    c.fillStyle = `rgba(12,7,3,${fl.toFixed(4)})`;
    c.fillRect(0, 0, 1080, 1920);
  },

  // ---------------------------------------------------------------- shot 1: bars on vermilion (0–1.17 s)
  shot1(n, c, look, field, draw) {
    const flash = n === 4;                       // one inverted pose on the off-beat
    if (flash) look.map = (k) => (k === 'black' ? 'verm' : k);
    field(flash ? 'black' : 'verm', 0, 0);
    BARS.forEach(([col, r, nIn, from, nOut, to], i) => {
      const P = rectPiece(...r, col, 300 + i);
      draw(P, leave(arrive(P, n, nIn, from, i % 2 ? SLIDE : SLAM), n, nOut, to));
    });
    const [x0, y0, x1, y1] = this.HB;
    const H = rectPiece(x0, y0, x1, y1, 'black', 399, { lift: 1.2 });
    draw(H, arrive(H, n, 7, [0, 1300], SLIDE));
  },

  // ---------------------------------------------------------------- shot 2: 각본 · 연출 (1.17–2.67 s)
  shot2(r, c, look, field, draw) {
    field('cream', 211, 87);
    const { gak, yeon, wd, hero, accent } = this.s2;
    const others = gak.pieces.filter((p) => p !== hero);
    // the match: the bar of shot 1 is now the stem of ㅏ, in place from the first pose
    draw(hero, { x: hero.home[0], y: hero.home[1] });
    others.forEach((P, i) => {
      const n0 = P.ch === 0 ? 1 + (i % 2) : 3 + (i % 2);
      const d = P.ch === 0 ? (i % 2 ? [0, 900] : [-900, 0]) : [0, -1000];
      draw(P, arrive(P, r, n0, d));
    });
    yeon.pieces.forEach((P, i) => draw(P, arrive(P, r, P.ch === 0 ? 5 : 6, P.ch === 0 ? [1000, 0] : [0, 1000])));
    wd.pieces.forEach((P, i) => draw(P, arrive(P, r, 8 + Math.floor(i / 6), [-1100, 0], SLIDE)));
    const A = rectPiece(...accent, 'ochre', 210, { lift: 0.7, cut: CUT_MID });
    draw(A, arrive(A, r, 10, [900, 0]));
  },

  // ---------------------------------------------------------------- shot 3: stairs, a ball, a credit block (2.67–5.0 s)
  shot3(r, c, look, field, draw) {
    field('ochre', 77, 301);
    const { stairs, bars, roles, ball, SX, SWD, SH, SY } = this.s3;
    stairs.forEach((st, i) => {
      // stair → bar: the rectangle morphs pose by pose (alternate stairs a pose late, like a hand moving them)
      const k = r - 12 - (i % 2);
      const m = k < 0 ? 0 : tab(MORPH, k);
      const b = bars[i];
      const rc = st.map((v, q) => lerp(v, b[q], m));
      const P = rectPiece(rc[0], rc[1], rc[2], rc[3], 'black', 500 + i, { lift: 0.9 });
      draw(P, arrive(P, r, i, [1000, 0]));
    });
    // the ball hops down one stair per pose, then off
    const land = (i) => [SX + i * SWD + SWD * 0.55, SY - (i + 1) * SH - 30];
    const BALL = [[land(4)[0], land(4)[1] - 300], land(4), land(3), land(2), land(1), land(0), [land(0)[0] - 230, land(0)[1] + 320]];
    const bk = r - 5;
    if (bk >= 0 && bk < BALL.length) draw(ball, { x: BALL[bk][0], y: BALL[bk][1], rot: bk * 0.9 });
    // the roles slam onto the bars, top bar first
    roles.forEach(({ ko, en }, i) => {
      const n0 = 15 + (4 - i);
      ko.pieces.forEach((P) => draw(P, arrive(P, r, n0, [-700, 0])));
      en.pieces.forEach((P) => draw(P, arrive(P, r, n0, [700, 0])));
    });
  },

  // ---------------------------------------------------------------- shot 4: the spiral and the title (5.0–8.0 s)
  shot4(r, n, c, look, field, draw, base) {
    const hitPose = r === HIT;                   // one inverted pose as the title lands
    if (hitPose) look.map = (k) => ({ black: 'verm', cream: 'black', verm: 'cream', ochre: 'black' }[k] || k);
    field(hitPose ? 'verm' : 'black', 330, 140);
    const { ahop, beon, latin, ring, ringR, spiral, spiral2, R, SPC, accent } = this.s4;
    // a slow push-in on the held title, in steps
    const push = r > HIT ? 1 + 0.0036 * (r - HIT) : 1;
    if (push !== 1) c.transform(push, 0, 0, push, 540 * (1 - push), 860 * (1 - push));
    if (r < 12) {
      // the ball of shot 3 opens into a spinning spiral, then winds down onto the ㅇ
      const grow = tab(GROW, r), shrink = r < 8 ? 0 : tab(SHRINK, r - 8);
      const k = ringR / R;
      const sc = grow * Math.exp(Math.log(k) * shrink);
      const x = lerp(SPC[0], ring.home[0], shrink), y = lerp(SPC[1], ring.home[1], shrink);
      const rot = -r * (Math.PI / 6) - (r > 8 ? (r - 8) * 0.35 : 0);
      if (r >= 2 && r < 11) {
        const s2 = tab(GROW, r - 2) * (r < 8 ? 1 : tab([0.7, 0.4, 0.12], r - 8));
        draw(spiral2, { x, y, rot, sc: Math.max(0.02, s2 * sc / Math.max(grow, 1e-3)) });
      }
      draw(spiral, { x, y, rot, sc });
      return;
    }
    // r ≥ 12: the match — the ring is the ㅇ, and the rest of the title is cut in around it
    const others = ahop.pieces.filter((p) => p !== ring);
    draw(ring, { x: ring.home[0], y: ring.home[1] });
    others.forEach((P, i) => {
      const n0 = P.ch === 0 ? 13 : 14 + Math.min(2, i - 1);
      draw(P, arrive(P, r, n0, DIRS[(i + 1) % 4].map((v) => v * 900)));
    });
    beon.pieces.forEach((P) => {
      const word = P.ch < 2 ? 0 : 1;   // 번째 | 계단
      draw(P, arrive(P, r, 18 + word, word ? [1000, 0] : [-1000, 0]));
    });
    latin.pieces.forEach((P, i) => draw(P, arrive(P, r, 21 + (i % 3 === 1 ? 1 : 0), [0, 700], SLIDE)));
    const A = rectPiece(...accent, 'verm', 640, { lift: 0.7, cut: CUT_MID });
    draw(A, arrive(A, r, 23, [-800, 0], SLIDE));
  },

  // ---------------------------------------------------------------- shot 5: vermilion closes in; one last line (8.0–10 s)
  shot5(r, n, c, look, field, draw, base) {
    if (r < 6) {
      // the held title under slats of vermilion paper sliding in from alternate sides
      this.shot4(S5 - 1 - S4, n, c, look, field, draw, base);
      c.setTransform(...base);
      for (let k = 0; k < 6; k++) {               // closing like blinds: two slats a pose, from opposite sides
        const y0 = -6 + k * 322, P = rectPiece(-30, y0, 1110, y0 + 334, 'verm', 700 + k, { lift: 1.4 });
        draw(P, arrive(P, r, k >> 1, [k % 2 ? 1180 : -1180, 0]));
      }
      return;
    }
    field('verm', 401, 233);
    const { l1, l2, bar, key, keySc } = this.s5;
    const B = rectPiece(...bar, 'black', 900, { lift: 0.7, cut: CUT_MID });
    draw(B, arrive(B, r, 6, [-1100, 0], SLIDE));
    l1.pieces.forEach((P) => draw(P, arrive(P, r, 8, [0, -700])));
    const half = l2.pieces.length / 2;
    l2.pieces.forEach((P, i) => draw(P, arrive(P, r, i < half ? 10 : 11, [0, 760])));
    const DROP = [-420, -130, 9, -5, 0];
    const kk = r - 13;
    if (kk >= 0) draw(key, { x: key.home[0], y: key.home[1] + tab(DROP, kk), sc: keySc, rot: kk === 2 ? 0.03 : 0 });
  },
});

