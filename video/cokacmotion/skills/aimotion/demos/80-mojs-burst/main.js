/*
 * 80 · 축하의 순간 — a celebration micro-interaction built from mo.js's motion-graphics vocabulary.
 *
 *   0.0–2.3 s  UI scene on warm white: a heart button springs in, is tapped (press → release), the heart pops with a
 *              ring and two bursts, little hearts swirl upward and a day counter ticks 0 → 100 ("함께한 날").
 *   2.1–3.1 s  at 100 the heart swells and collapses; a burst flies out and two circles (pink, then deep teal) flood
 *              the screen while the counter travels up, grows ×2.7 and turns gold — it becomes the hero numeral.
 *   3.0–6.3 s  "일" springs in beside it, fireworks (rocket + swirl trail → mixed-shape burst + ring + crackle) go off
 *              around the title, streamers swirl up, "축하해" lands letter by letter, then a mega burst (hearts, polygons,
 *              zigzags, curves, rays, three rings) and the whole title gives one beat.
 *   6.3–9.0 s  resolution: slow dashed rings turn, sparkles twinkle, confetti flutters down.
 *
 * Everything is ONE mojs.Timeline (Shape, ShapeSwirl, Burst, Html, Tween) seeked with setProgress through seek.js,
 * which makes the picture a pure function of t (see the comment there). Every random value comes from rand(seed)
 * and is handed to mo.js as a plain number — no 'rand(…)' strings, no stagger randomness.
 */
import { defineDemo, rand } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { createSeeker } from './seek.js';

const D = 9;
const C = {
  cream: '#FFF6EA', ink: '#2A1E3B', blush: '#F5E2D0', pink: '#FF4F8B', pinkDeep: '#E8336E', yellow: '#FFD23F',
  teal: '#2EC4B6', tealLight: '#9BF2E8', field: '#0E6F6B', disc1: '#127A75', disc2: '#16857F', coral: '#FF8C42', white: '#FFFFFF',
};
const BX = 540, BY = 820;            // the heart button
const HERO_Y = 700, SUB_Y = 1012;    // centre lines of "100일" and "축하해"
const HERO_PX = 300, SUB_PX = 200;   // their font sizes (Black Han Sans)
const COUNT_Y = 1092, COUNT_PX = 110; // the counter in the UI scene

// delays in ms, nudged 0.37 ms off round numbers so no tween edge ever lands exactly on a frame instant
// (mo.js shows/hides a Shape on the edge callbacks, and an exact hit would depend on the direction of approach)
const at = (s) => Math.round(s * 1000) + 0.37;
const bump = (p) => Math.sin(Math.PI * p);                    // 0 → 1 → 0, a pure easing function
const STROKED = new Set(['zigzag', 'curve', 'cross', 'line']);

function registerShapes(mojs) {
  class Heart extends mojs.CustomShape {
    getShape() { return '<path d="M50 89C27 73 7 57 7 35 7 20 18 9 31 9c8 0 15 4 19 11 4-7 11-11 19-11 13 0 24 11 24 26 0 22-20 38-43 54z"/>'; }
    getLength() { return 290; }
  }
  class Sparkle extends mojs.CustomShape {
    getShape() { return '<path d="M50 2C53 36 64 47 98 50 64 53 53 64 50 98 47 64 36 53 2 50 36 47 47 36 50 2z"/>'; }
    getLength() { return 300; }
  }
  mojs.addShape('heart', Heart);
  mojs.addShape('sparkle', Sparkle);
}

/** Per-child option arrays for a confetti Burst — mo.js maps array values onto children by index (modulo). */
function kids(r, n, o) {
  const k = { shape: [], fill: [], stroke: [], strokeWidth: [], radius: [], points: [], rotate: [], duration: [], delay: [],
    pathScale: [], degreeShift: [], isSwirl: [], swirlSize: [], swirlFrequency: [], direction: [] };
  const off = Math.floor(r() * o.colors.length);
  for (let i = 0; i < n; i++) {
    const sh = o.shapes[i % o.shapes.length];
    const col = o.colors[(i + off) % o.colors.length];
    const st = STROKED.has(sh);
    const rad = o.size[0] + r() * (o.size[1] - o.size[0]);
    k.shape.push(sh);
    k.fill.push(st ? 'none' : col);
    k.stroke.push(st ? col : 'none');
    k.strokeWidth.push(st ? Math.max(3, Math.round(rad * 0.34)) : 0);
    k.radius.push(st ? Math.round(rad * 1.25) : Math.round(rad));
    k.points.push(sh === 'polygon' ? (r() < 0.6 ? 3 : 5) : sh === 'zigzag' ? 5 : 3);
    const spin = (r() < 0.5 ? -1 : 1) * Math.round(o.spin * (0.5 + r()));
    k.rotate.push({ 0: spin });
    k.duration.push(Math.round(o.dur[0] + r() * (o.dur[1] - o.dur[0])));
    k.delay.push(Math.round(r() * (o.jitter ?? 60)));
    k.pathScale.push(+(o.reach[0] + r() * (o.reach[1] - o.reach[0])).toFixed(3));
    k.degreeShift.push(Math.round((r() * 2 - 1) * (o.wobble ?? 8)));
    const sw = r() < (o.swirl ?? 0.35);
    k.isSwirl.push(sw);
    k.swirlSize.push(Math.round(6 + r() * 16));
    k.swirlFrequency.push(+(2 + r() * 4).toFixed(2));
    k.direction.push(r() < 0.5 ? -1 : 1);
  }
  return Object.assign(k, { scale: { 1: 0, easing: 'quad.in' }, easing: o.easing || 'quint.out', strokeLinecap: 'round' });
}

defineDemo({
  id: '80-mojs-burst',
  title: '축하의 순간',
  tech: 'mo.js · Burst · Shape · ShapeSwirl · Html · Timeline.setProgress',
  duration: D,
  background: C.cream,

  async setup(api) {
    const mojs = window.mojs;
    if (!mojs) throw new Error('mo.js did not load (window.mojs missing)');
    await fontReady(`400 ${HERO_PX}px "Black Han Sans"`, '0123456789일축하해');
    await fontReady('800 68px "Pretendard Variable"', '오늘은특별한날하트를눌러확인해보세요함께한');
    registerShapes(mojs);

    const layer = (z) => { const l = api.layer('div', { z }); l.classList.add('mo'); return l; };
    const L1 = layer(1);   // UI scene
    const LF = layer(2);   // colour flood
    const L3 = layer(3);   // field, fireworks, rings (behind the title)
    const LT = layer(4);   // title type
    const L5 = layer(5);   // particles in front of the title
    const el = (parent, cls, html, css = '') => {
      const e = document.createElement('div');
      e.className = cls; e.innerHTML = html; if (css) e.style.cssText = css;
      parent.appendChild(e);
      return e;
    };

    // ---------- DOM: the UI scene ----------
    const bar = el(L1, 'ui-bar', '');
    const head = el(L1, 'ui-head', '', 'top:0;height:0');
    el(head, 'ui-head ui-title', '오늘은 특별한 날');
    el(head, 'ui-head ui-sub', '하트를 눌러 확인해 보세요');
    const label = el(L1, 'ui-label', '함께한 <i>날</i>');

    // ---------- DOM: title type (laid out from measured advances so "100" and "일" sit as one word) ----------
    const m = document.createElement('canvas').getContext('2d');
    m.font = `400 ${HERO_PX}px "Black Han Sans"`;
    const w100 = m.measureText('100').width, wIl = m.measureText('일').width, gap = 10;
    const left = 540 - (w100 + gap + wIl) / 2;
    const cx100 = left + w100 / 2, cxIl = left + w100 + gap + wIl / 2;
    m.font = `400 ${SUB_PX}px "Black Han Sans"`;
    const subChars = ['축', '하', '해'], subW = subChars.map((c) => m.measureText(c).width), subGap = 14;
    const subTotal = subW.reduce((a, b) => a + b, 0) + subGap * 2;
    const subCx = []; let sx = 540 - subTotal / 2;
    for (const w of subW) { subCx.push(sx + w / 2); sx += w + subGap; }

    const hero = el(LT, '', '', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:540px 860px');
    const box = (cx, cy, px, w) => `left:${cx - w / 2}px;top:${cy - px / 2}px;width:${w}px;height:${px}px;font-size:${px}px;line-height:${px}px`;
    // counter: move (UI spot → hero spot) ⊃ pop ⊃ entrance ⊃ ink / gold faces; one mo.js Html per element
    const ctrMove = el(hero, 'big', '', box(cx100, HERO_Y, HERO_PX, 1000));
    const ctrPop = el(ctrMove, 'stack', '', 'height:100%;transform-origin:50% 50%');
    const ctrIn = el(ctrPop, 'stack', '', 'height:100%');
    const inkFace = el(ctrIn, 'stack ink', '0');
    const goldFace = el(ctrIn, 'stack gold', '0', 'opacity:0');
    const il = el(hero, 'big gold', '일', box(cxIl, HERO_Y, HERO_PX, wIl + 60) + ';transform-origin:50% 85%');
    const subs = subChars.map((c, i) => el(hero, 'big white', c, box(subCx[i], SUB_Y, SUB_PX, subW[i] + 40) + ';transform-origin:50% 90%'));

    // ---------- the timeline ----------
    const tl = new mojs.Timeline();
    const add = (mod) => { tl.add(mod); return mod; };
    const shape = (parent, o) => add(new mojs.Shape({ parent, left: 0, top: 0, ...o }));
    const swirl = (parent, o) => add(new mojs.ShapeSwirl({ parent, left: 0, top: 0, ...o }));
    const burst = (parent, o) => add(new mojs.Burst({ parent, left: 0, top: 0, ...o }));
    const html = (target, o) => add(new mojs.Html({ el: target, ...o }));
    const ring = (parent, x, y, t, o) => shape(parent, {
      x, y, shape: 'circle', fill: 'none', stroke: o.color, radius: { [o.r0 ?? 0]: o.r1 }, strokeWidth: { [o.w]: 0 },
      duration: o.dur ?? 640, delay: at(t), easing: o.easing ?? 'cubic.out', isShowEnd: false, ...(o.extra || {}),
    });

    // ===== scene 1: the button =====
    html(head, { opacity: { 0: 1 }, y: { 44: 0 }, duration: 560, delay: at(0.06), easing: 'cubic.out' });
    html(bar, { y: { 340: 0 }, duration: 620, delay: at(0.0), easing: 'cubic.out' });
    shape(L1, { x: BX, y: BY + 20, radius: 152, fill: C.blush, scale: { 0: 1 }, easing: 'elastic.out', duration: 900, delay: at(0.05) });
    shape(L1, { x: BX, y: BY, radius: 150, fill: C.white, stroke: '#F0DCCB', strokeWidth: 5, scale: { 0: 1 }, easing: 'elastic.out', duration: 460, delay: at(0.04) })
      .then({ scale: 0.88, duration: 110, easing: 'quad.out' })            // press   0.50–0.61
      .then({ scale: 1, duration: 900, easing: 'elastic.out' });           // release 0.61–1.51
    shape(L1, { shape: 'heart', x: BX, y: BY + 6, radius: 64, fill: 'none', stroke: C.ink, strokeWidth: 10, scale: { 0: 1 },
      easing: 'back.out', duration: 410, delay: at(0.10), isShowEnd: false })
      .then({ scale: 0.8, duration: 100, easing: 'quad.out' })
      .then({ scale: 0, duration: 110, easing: 'cubic.in' });
    // the filled heart: pop on release, swell at 100, collapse into the flood
    shape(L1, { shape: 'heart', x: BX, y: BY + 6, radius: 64, fill: C.pink, scale: { 0: 1 }, easing: 'elastic.out', duration: 1000, delay: at(0.62), isShowEnd: false })
      .then({ scale: 1.32, duration: 130, easing: 'cubic.out', delay: 380 })
      .then({ scale: 0, duration: 260, easing: 'back.in' });
    // the tap: a soft fingertip and a ripple
    shape(L1, { x: BX + 6, y: BY + 10, radius: 52, fill: C.ink, opacity: { 0: 0.15, easing: bump }, scale: { 1.4: 0.9 }, duration: 420, delay: at(0.28), easing: 'cubic.out', isShowEnd: false });
    ring(L1, BX, BY, 0.47, { color: C.ink, r0: 40, r1: 132, w: 8, dur: 420, extra: { strokeOpacity: { 0.4: 0 } } });
    // release: ring + two bursts
    ring(L1, BX, BY, 0.62, { color: C.pink, r0: 60, r1: 205, w: 38, dur: 640 });
    burst(L1, { x: BX, y: BY, radius: { 120: 265 }, count: 10, timeline: { delay: at(0.64) },
      children: { shape: 'circle', radius: [13, 9, 12, 8, 14, 9, 12, 8, 13, 10], fill: [C.pink, C.yellow, C.teal, C.coral, C.pink],
        scale: { 1: 0 }, duration: [760, 700, 800, 720, 760, 690, 780, 710, 750, 730], delay: [0, 20, 10, 30, 0, 25, 15, 5, 20, 10], easing: 'quint.out' } });
    burst(L1, { x: BX, y: BY, radius: { 100: 215 }, count: 10, rotate: 18, timeline: { delay: at(0.69) },
      children: { shape: 'polygon', points: 3, radius: 10, fill: [C.yellow, C.teal, C.pink], rotate: { 0: 200 }, scale: { 1: 0 }, duration: 640, easing: 'cubic.out' } });

    // likes pouring in: little hearts swirl up while the counter runs
    const rh = rand(8001);
    for (let i = 0; i < 18; i++) {
      const t0 = 0.76 + 1.3 * Math.pow(i / 18, 0.85) + rh() * 0.04;
      const x0 = BX + (rh() * 2 - 1) * 46, x1 = BX + (rh() * 2 - 1) * 300;
      swirl(L1, { shape: 'heart', fill: [C.pink, C.coral, C.pink, C.yellow, C.teal][i % 5], radius: Math.round(13 + rh() * 15),
        x: { [x0]: x1 }, y: { [BY - 30]: Math.round(BY - 400 - rh() * 300) },
        swirlSize: Math.round(10 + rh() * 24), swirlFrequency: +(2 + rh() * 3).toFixed(2), direction: rh() < 0.5 ? -1 : 1,
        scale: { 0.2: 1, easing: 'back.out' }, opacity: { 1: 0, easing: 'quad.in' },
        duration: Math.round(1000 + rh() * 450), delay: at(t0), easing: 'sin.out', isShowEnd: false });
    }

    // the counter: entrance, ticking 0 → 100, a pop at 100, then the journey to the hero spot (ink face → gold face)
    html(label, { opacity: { 0: 1 }, y: { 26: 0 }, duration: 520, delay: at(0.22), easing: 'cubic.out' });
    html(ctrIn, { opacity: { 0: 1 }, y: { 80: 0 }, duration: 520, delay: at(0.24), easing: 'cubic.out' });
    let shown = 0;
    add(new mojs.Tween({
      delay: at(0.74), duration: 1380, easing: (p) => 1 - Math.pow(1 - p, 2.2),
      onUpdate(ep) {                    // the number is a function of eased progress only; `shown` just skips equal writes
        const n = Math.round(ep * 100);
        if (n !== shown) { shown = n; inkFace.textContent = goldFace.textContent = String(n); }
      },
    }));
    html(ctrPop, { scaleX: { 1: 1.3 }, scaleY: { 1: 1.3 }, duration: 300, delay: at(2.12), easing: bump });
    const s0 = COUNT_PX / HERO_PX;
    html(ctrMove, { x: { [540 - cx100]: 0 }, y: { [COUNT_Y - HERO_Y]: 0 }, scaleX: { [s0]: 1 }, scaleY: { [s0]: 1 },
      duration: 780, delay: at(2.30), easing: [0.7, 0, 0.25, 1.12] });
    html(inkFace, { opacity: { 1: 0 }, duration: 280, delay: at(2.44), easing: 'linear.none' });
    html(goldFace, { opacity: { 0: 1 }, duration: 280, delay: at(2.44), easing: 'linear.none' });

    // ===== scene 2: 100 → burst → flood =====
    const rk = rand(8002);
    burst(L3, { x: BX, y: BY, radius: { 140: 470 }, count: 16, timeline: { delay: at(2.14) },
      children: kids(rk, 16, { shapes: ['circle', 'polygon', 'heart', 'rect'], colors: [C.pink, C.yellow, C.teal, C.coral],
        size: [11, 19], dur: [820, 1050], reach: [0.75, 1.1], spin: 260, swirl: 0.4 }) });
    shape(LF, { x: BX, y: BY, radius: 1260, fill: C.pink, scale: { 0: 1 }, duration: 640, delay: at(2.28), easing: 'cubic.inout' });
    shape(LF, { x: BX, y: BY, radius: 1260, fill: C.field, scale: { 0: 1 }, duration: 660, delay: at(2.40), easing: 'cubic.inout' });

    // ===== scene 3: the field =====
    shape(L3, { x: 540, y: 862, radius: 500, fill: C.disc1, scale: { 0: 1 }, easing: 'elastic.out', duration: 1500, delay: at(2.84) });
    shape(L3, { x: 540, y: 862, radius: 380, fill: C.disc2, scale: { 0: 1 }, easing: 'elastic.out', duration: 1500, delay: at(2.95) });
    ring(L3, 540, 862, 3.0, { color: C.tealLight, r0: 60, r1: 480, w: 30, dur: 900, easing: 'quint.out' });
    ring(L3, 540, 862, 3.08, { color: C.yellow, r0: 230, r1: 580, w: 10, dur: 1100, easing: 'quint.out', extra: { strokeDasharray: '2 26', strokeLinecap: 'round', rotate: { 0: 50 } } });

    // "일" springs in with a little burst
    html(il, { scaleX: { 0: 1 }, scaleY: { 0: 1 }, rotateZ: { [-28]: 0 }, y: { 90: 0 }, duration: 1000, delay: at(3.02), easing: 'elastic.out' });
    burst(L5, { x: cxIl, y: HERO_Y - 10, radius: { 70: 190 }, count: 9, timeline: { delay: at(3.06) },
      children: { shape: ['circle', 'polygon', 'circle'], points: 3, radius: [10, 8, 12], fill: [C.yellow, C.pink, C.white], rotate: { 0: 180 },
        scale: { 1: 0 }, duration: [620, 700, 660], easing: 'quint.out' } });

    // fireworks: rocket (with a two-dot trail) → mixed-shape burst + ring + flash + delayed crackle
    const rf = rand(8003);
    const FW = [
      [3.22, 190, 430, [C.pink, C.yellow, C.white]],
      [3.52, 892, 372, [C.yellow, C.tealLight, C.white]],
      [3.84, 548, 236, [C.coral, C.yellow, C.pink]],
      [4.12, 168, 1236, [C.tealLight, C.white, C.yellow]],
      [4.46, 912, 1186, [C.pink, C.white, C.coral]],
      [4.82, 352, 1392, [C.yellow, C.pink, C.tealLight]],
      [5.18, 742, 1412, [C.white, C.yellow, C.pink]],
    ];
    for (const [t, X, Y, pal] of FW) {
      const x0 = Math.round(X + (rf() * 2 - 1) * 140), fly = 0.5;
      const dir = rf() < 0.5 ? -1 : 1;
      [[7, 15, 1, 0], [5, 10, 0.7, 45], [3.5, 7, 0.45, 90]].forEach(([rx, ry, op, lag]) => swirl(L3, {
        shape: 'circle', fill: pal[0] === C.white ? C.yellow : C.white, radiusX: rx, radiusY: ry, x: { [x0]: X }, y: { 1990: Y },
        swirlSize: 9, swirlFrequency: 2.6, direction: dir, scale: { 1: 0.6 }, opacity: { [op]: op * 0.4 },
        duration: fly * 1000, delay: at(t) + lag, easing: 'cubic.out', isShowEnd: false }));
      const tb = t + fly, R = Math.round(170 + rf() * 60), n = 14 + Math.floor(rf() * 5);
      shape(L3, { x: X, y: Y, radius: 46, fill: C.white, scale: { 0.2: 1 }, opacity: { 1: 0 }, duration: 260, delay: at(tb), easing: 'cubic.out', isShowEnd: false });
      ring(L3, X, Y, tb, { color: pal[1], r0: 10, r1: Math.round(R * 0.95), w: 16, dur: 620 });
      burst(L3, { x: X, y: Y, radius: { 0: R }, count: n, rotate: Math.round(rf() * 360), timeline: { delay: at(tb) },
        children: kids(rf, n, { shapes: ['circle', 'polygon', 'zigzag', 'circle', 'curve', 'rect'], colors: pal, size: [8, 15],
          dur: [800, 1150], reach: [0.62, 1.12], spin: 300, swirl: 0.4, jitter: 70 }) });
      burst(L3, { x: X, y: Y, radius: { [Math.round(R * 0.55)]: Math.round(R * 1.2) }, count: 10, rotate: Math.round(rf() * 36), timeline: { delay: at(tb + 0.26) },
        children: { shape: 'circle', radius: [4, 3, 5, 3, 4], fill: [C.yellow, C.white], scale: { 1: 0 }, duration: [520, 600, 480, 560], easing: 'cubic.out' } });
    }

    // streamers swirl up from the bottom edge all through the party
    const rs = rand(8004);
    for (let i = 0; i < 20; i++) {
      const t0 = 3.3 + (i / 20) * 4.6 + rs() * 0.12;
      const X = Math.round(70 + rs() * 940);
      const sh = i % 3 === 2 ? 'curve' : 'circle';
      const col = [C.pink, C.yellow, C.tealLight, C.white][i % 4];
      swirl(L3, { shape: sh, fill: sh === 'curve' ? 'none' : col, stroke: sh === 'curve' ? col : 'none', strokeWidth: sh === 'curve' ? 5 : 0,
        strokeLinecap: 'round', radius: sh === 'curve' ? 14 : Math.round(6 + rs() * 5),
        x: { [X]: X + Math.round((rs() * 2 - 1) * 120) }, y: { 1990: Math.round(380 + rs() * 600) },
        swirlSize: Math.round(26 + rs() * 40), swirlFrequency: +(2 + rs() * 2.5).toFixed(2), direction: rs() < 0.5 ? -1 : 1,
        rotate: { 0: Math.round((rs() * 2 - 1) * 360) }, scale: { 1: 0.3 }, opacity: { 1: 0, easing: 'quad.in' },
        duration: Math.round(1700 + rs() * 900), delay: at(t0), easing: 'sin.out', isShowEnd: false });
    }

    // "축하해" lands letter by letter, each with its own burst
    const rl = rand(8005);
    subs.forEach((s, i) => {
      const t = 4.40 + i * 0.14;
      html(s, { scaleX: { 0: 1 }, scaleY: { 0: 1 }, y: { 130: 0 }, rotateZ: { [[-24, 16, -12][i]]: 0 }, duration: 1050, delay: at(t), easing: 'elastic.out' });
      burst(L5, { x: Math.round(subCx[i]), y: SUB_Y - 20, radius: { 60: 175 }, count: 8, rotate: Math.round(rl() * 45), timeline: { delay: at(t + 0.07) },
        children: kids(rl, 8, { shapes: ['circle', 'polygon', 'curve', 'circle'], colors: [C.yellow, C.pink, C.tealLight], size: [7, 12],
          dur: [560, 760], reach: [0.8, 1.1], spin: 220, swirl: 0.2, jitter: 40 }) });
    });

    // ===== climax: the mega burst =====
    const MX = 540, MY = 862, TM = 5.95;
    const rm = rand(8006);
    ring(L3, MX, MY, TM, { color: C.yellow, r0: 120, r1: 430, w: 34, dur: 760 });
    ring(L3, MX, MY, TM + 0.08, { color: C.pink, r0: 160, r1: 560, w: 22, dur: 820 });
    ring(L3, MX, MY, TM + 0.16, { color: C.tealLight, r0: 330, r1: 660, w: 9, dur: 1000, extra: { strokeDasharray: '3 20', strokeLinecap: 'round', rotate: { 0: -40 } } });
    burst(L3, { x: MX, y: MY, radius: { 300: 610 }, count: 36, timeline: { delay: at(TM) },
      children: { shape: 'line', radius: { 30: 6 }, stroke: [C.yellow, C.white, C.pink, C.white], strokeWidth: 7, strokeLinecap: 'round',
        fill: 'none', duration: [820, 900, 860], easing: 'expo.out' } });
    burst(L3, { x: MX, y: MY, radius: { 220: 680 }, count: 26, rotate: 7, timeline: { delay: at(TM + 0.04) },
      children: kids(rm, 26, { shapes: ['heart', 'circle', 'polygon', 'zigzag', 'curve', 'rect', 'circle'],
        colors: [C.pink, C.yellow, C.white, C.tealLight, C.coral], size: [12, 22], dur: [1100, 1500], reach: [0.7, 1.1], spin: 320, swirl: 0.45, jitter: 90 }) });
    html(hero, { scaleX: { 1: 1.07 }, scaleY: { 1: 1.07 }, duration: 420, delay: at(TM), easing: bump });

    // ===== resolution =====
    shape(L3, { x: MX, y: MY, shape: 'circle', radius: 470, fill: 'none', stroke: C.tealLight, strokeOpacity: 0.6, strokeWidth: 5,
      strokeDasharray: '2 20', strokeLinecap: 'round', rotate: { 0: 80 }, scale: { 0.82: 1 }, opacity: { 0: 1 },
      duration: 2700, delay: at(6.25), easing: 'sin.out' });
    shape(L3, { x: MX, y: MY, shape: 'circle', radius: 545, fill: 'none', stroke: C.yellow, strokeOpacity: 0.45, strokeWidth: 7,
      strokeDasharray: '1 34', strokeLinecap: 'round', rotate: { 0: -60 }, scale: { 0.9: 1 }, opacity: { 0: 1 },
      duration: 2700, delay: at(6.35), easing: 'sin.out' });
    // sparkles twinkle in a loose ring around the title
    const rp = rand(8007);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + rp() * 0.3, rr = 430 + rp() * 120;
      const x = Math.round(MX + Math.cos(a) * rr * 0.98), y = Math.round(MY + Math.sin(a) * rr * 1.18);
      shape(L5, { shape: 'sparkle', x, y, radius: Math.round(14 + rp() * 16), fill: [C.yellow, C.white, C.pink, C.white][i % 4],
        scale: { 0: 1, easing: bump }, rotate: { 0: 90 }, duration: Math.round(700 + rp() * 400), delay: at(6.3 + rp() * 2.3), easing: 'sin.inout', isShowEnd: false });
    }
    // confetti flutters down (scaleX follows a cosine curve: the flip of a falling paper)
    const rc = rand(8008);
    for (let i = 0; i < 34; i++) {
      const X = Math.round(30 + rc() * 1020), sh = ['rect', 'polygon', 'zigzag', 'rect', 'curve', 'circle'][i % 6];
      const st = STROKED.has(sh), col = [C.pink, C.yellow, C.white, C.tealLight, C.coral][i % 5];
      const flips = 2 + Math.floor(rc() * 4);
      swirl(L5, { shape: sh, points: sh === 'polygon' ? 3 : 4, fill: st ? 'none' : col, stroke: st ? col : 'none', strokeWidth: st ? 4 : 0,
        strokeLinecap: 'round', radius: Math.round(st ? 12 : 8 + rc() * 5), radiusY: sh === 'rect' ? Math.round(5 + rc() * 3) : null,
        x: { [X]: X + Math.round((rc() * 2 - 1) * 160) }, y: { [-60]: 2000 },
        swirlSize: Math.round(20 + rc() * 40), swirlFrequency: +(2 + rc() * 3).toFixed(2), direction: rc() < 0.5 ? -1 : 1,
        rotate: { 0: Math.round((rc() * 2 - 1) * 540) }, scale: 1, scaleX: { 1: 1, curve: (p) => Math.cos(p * Math.PI * 2 * flips) },
        duration: Math.round(2600 + rc() * 1100), delay: at(5.9 + rc() * 2.4), easing: 'linear.none', isShowEnd: false });
    }

    // the master clock: the timeline spans exactly D (later modules simply run past the end)
    add(new mojs.Tween({ duration: D * 1000 }));
    this.seeker = createSeeker(tl);
  },

  frame(t) {
    this.seeker.seek(t * 1000);
  },
});
