/*
 * 130 · 다음 숫자는? — a quiz beat from a short video: a number row pops in on a rhythm, four choices stagger in,
 * a countdown ring runs out while a heartbeat speeds up, the answer card takes the one big impact, arcs explain it.
 *
 *   0.0–1.8  header and question rise; 1, 1, 2, 3, 5 pop in on a 0.26 s beat, the "?" lands a beat late and wobbles
 *   1.8–3.0  four answer cards stagger in; the ring arrives and its arc charges once around; the digit flips to 5
 *   3.0–7.0  the arc is eaten clockwise (angle = closed form of t); the digit flips 5 → 1 on the ring's fifths;
 *            a heartbeat ticks every 0.4 s, then geometrically faster over the last 2 s; cards, "?", ring, caption dot
 *            and the backdrop pulse on every tick; viewer-poll bars rise in bursts on the ticks (example numbers)
 *   7.0–8.0  time up: the ring flashes and leaves; the wrong cards dim and slide back (staggered, fast); card C takes
 *            the single impact (anticipation, spring pop, radial lines, shock outline, colour flood, camera kick)
 *   8.0–10   arcs draw by dash offset: 2 + 3 → 5 above the row, 3 + 5 → "?" below; the "?" flips to 8;
 *            "피보나치 수열" rises where the ring was; afterglow
 *
 * Rendering: one Canvas 2D board drawn from scratch every frame (CPU raster in the headless check), over a baked
 * backdrop and under a baked near layer and grain. One paused GSAP timeline tweens plain proxy objects (entrances and
 * exits); frame(t) = tl.time(t), then closed forms (ring, flaps, ticks, poll, impact, arcs) and the drawing.
 */
import { defineDemo, rand, clamp, lerp, ease, ramp } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';

const D = 10;
const KR = `"${FONTS.pretendard.family}"`;
const F = (w, px) => `${w} ${px}px ${KR}`;
const TAU = Math.PI * 2, DEG = Math.PI / 180;

// palette: deep indigo, cream, one accent (warm yellow)
const C = { cream: '#f8f0dc', acc: '#ffc53d', ink: '#1a1650', tile: '#302a7e', tileQ: '#25206c', dig: '#2c2777',
  track: '#2b2574', lip: '#151142', slot: '#0f0c30' };
const CR = '248,240,220', AR = '255,197,61', IR = '26,22,80';

// ---------------------------------------------------------------- story clock (seconds)
const T = {
  pill: 0.04, q: 0.14,
  pop: [0.36, 0.62, 0.88, 1.14, 1.4, 1.7],          // 1, 1, 2, 3, 5 on a 0.26 s beat; the "?" a little late
  card: 1.8, cardStep: 0.12,
  ring: 2.3, charge: 2.42, digit: 2.72,
  cd: 3.0, up: 7.0, hit: 7.2, ok: 7.34, ringOut: 7.34,
  arcA: 8.0, arcB: 8.36, eight: 8.72, label: 8.74, sub: 9.0,
};

// ---------------------------------------------------------------- layout (stage px)
const PILL_Y = 147, Q_Y = 248, CAPT_Y = 1173, LAB_Y = 925, SUB_Y = 1018;
const TILE = { x0: 82, step: 156, y: 488, w: 136, h: 160, r: 26, fs: 100 };
const XC = (i) => TILE.x0 + TILE.w / 2 + i * TILE.step;      // tile centres 150 … 930
const SEQ = ['1', '1', '2', '3', '5', '?'];
const RING = { x: 540, y: 925, r: 164, w: 28 };
const DIG = { x: -84, y: -98, w: 168, h: 196, r: 28, fs: 140 };   // the digit card, in ring coordinates
const CARD = { w: 452, h: 172, r: 36, pos: [[72, 1204], [556, 1204], [72, 1396], [556, 1396]] };
const CHOICE = [['A', '6'], ['B', '7'], ['C', '8'], ['D', '9']];
const ANS = 2;
const CC = { x: CARD.pos[ANS][0] + CARD.w / 2, y: CARD.pos[ANS][1] + CARD.h / 2 };   // card C centre

// explanation arcs: half-ellipses from a source tile to the sum tile, nested so they never cross
const AY = TILE.y - 12, BY = TILE.y + TILE.h + 10 + 12;    // above the row / below the tile lips
const ARCS = [
  { x0: XC(2), x1: XC(4) + 16, y: AY, h: 96, up: true, t0: T.arcA, d: 0.36, col: C.cream, w: 7 },
  { x0: XC(3), x1: XC(4) - 16, y: AY, h: 52, up: true, t0: T.arcA + 0.08, d: 0.28, col: C.cream, w: 7 },
  { x0: XC(3), x1: XC(5) + 16, y: BY, h: 96, up: false, t0: T.arcB, d: 0.36, col: C.acc, w: 9 },
  { x0: XC(4), x1: XC(5) - 16, y: BY, h: 52, up: false, t0: T.arcB + 0.08, d: 0.28, col: C.acc, w: 9 },
];
const CHIPS = [
  { text: '2 + 3 = 5', x: (ARCS[0].x0 + ARCS[0].x1) / 2, y: AY - 96 - 34, at: T.arcA + 0.24, bg: C.cream, from: 26 },
  { text: '3 + 5 = 8', x: (ARCS[2].x0 + ARCS[2].x1) / 2, y: BY + 96 + 34, at: T.arcB + 0.24, bg: C.acc, from: -26 },
];

// ---------------------------------------------------------------- the tension rhythm
// 3.0–5.0: a steady tick every U = 0.4 s. 5.0–7.0: N ticks whose intervals shrink geometrically (U·r^k), r solved
// so that the N intervals fill the last 2 s exactly: U·(1 − r^N)/(1 − r) = 2. Tick k of that phase: A0 + U·(1 − r^k)/(1 − r).
const TICK = (() => {
  const U0 = T.cd, U = 0.4, A0 = 5.0, N = 10, span = T.up - A0;
  let lo = 0.3, hi = 0.99999;
  for (let i = 0; i < 64; i++) { const r = (lo + hi) / 2; if ((U * (1 - r ** N)) / (1 - r) > span) hi = r; else lo = r; }
  const r = (lo + hi) / 2;
  const t = [];
  for (let k = 0; U0 + k * U < A0 - 1e-6; k++) t.push(U0 + k * U);
  const nu = t.length;
  for (let k = 0; k < N; k++) t.push(A0 + (U * (1 - r ** k)) / (1 - r));
  const dt = t.map((x, i) => (i + 1 < t.length ? t[i + 1] : T.up) - x);
  return { t, dt, r, U, A0, N, nu, lnr: Math.log(r) };
})();
// index of the last tick at or before t, closed form in both phases (the geometric one inverts the series sum)
function lastTick(t) {
  if (t < TICK.t[0]) return -1;
  if (t < TICK.A0) return Math.floor((t - TICK.t[0]) / TICK.U + 1e-9);
  const x = 1 - ((t - TICK.A0) * (1 - TICK.r)) / TICK.U;
  const k = x <= 0 ? TICK.N - 1 : Math.floor(Math.log(x) / TICK.lnr + 1e-9);
  return TICK.nu + Math.min(TICK.N - 1, k);
}
// heartbeat: "lub" on the tick, a smaller "dub" a third of the interval later. The decay is tied to the interval, so the
// pulses stay separate while the ticks crowd together; the amplitude climbs with the tick number.
function beat(t) {
  const k = lastTick(t);
  if (k < 0) return 0;
  let b = 0;
  for (let j = Math.max(0, k - 3); j <= k; j++) {
    const s = t - TICK.t[j];
    if (s < 0) continue;
    const dt = TICK.dt[j], tau = Math.min(0.15, 0.45 * dt), amp = 0.7 + (0.45 * j) / (TICK.t.length - 1);
    let v = (1 - Math.exp(-s / 0.014)) * Math.exp(-s / tau);
    const s2 = s - 0.32 * dt;
    if (s2 > 0) v += 0.42 * (1 - Math.exp(-s2 / 0.014)) * Math.exp(-s2 / (0.8 * tau));
    b += amp * v;
  }
  return b;
}

// ---------------------------------------------------------------- viewer poll (예시): votes arrive in bursts on the ticks
const POLL = { n: 2847, early: [0.22, 0.41, 0.22, 0.15], final: [0.12, 0.29, 0.47, 0.12] };
function poll(t) {
  let f = 0;
  for (const tk of TICK.t) f += ease.outCubic(clamp((t - tk) / 0.22));
  f /= TICK.t.length;                                              // turnout 0 → 1, one equal burst per tick
  const m = ramp(t, 3.6, 6.6);                                     // B leads early, C overtakes
  return { f, s: POLL.early.map((e, i) => lerp(e, POLL.final[i], m)) };
}

// ---------------------------------------------------------------- the countdown ring: angle = closed form of t
// before T.cd the arc charges once around (its head leads clockwise from 12 o'clock); from T.cd to T.up the remaining
// fraction is linear, rem = 1 − (t − cd)/(up − cd), and the arc is eaten clockwise: it spans [−90° + 360°·(1 − rem), 270°].
function ringArc(t) {
  if (t < T.cd) {
    const c = ease.outCubic(clamp((t - T.charge) / (T.cd - T.charge)));
    return { a0: -Math.PI / 2, a1: -Math.PI / 2 + TAU * c, head: 1, rem: c };
  }
  const rem = clamp(1 - (t - T.cd) / (T.up - T.cd));
  return { a0: -Math.PI / 2 + TAU * (1 - rem), a1: 1.5 * Math.PI, head: 0, rem };
}
// the digit changes exactly when the arc crosses a fifth: 5 at the start, then 4, 3, 2, 1, 0 at t = cd + (up − cd)·(1 − k/5)
const DIGIT_AT = [4, 3, 2, 1, 0].map((k) => ({ k, t: T.cd + (T.up - T.cd) * (1 - k / 5) }));

// ---------------------------------------------------------------- small closed-form helpers
// damped spring offset: x(0) = x0, x'(0) = v0, natural frequency w (rad/s), damping ratio z < 1
function spring(s, x0, v0, w, z) {
  const a = z * w, wd = w * Math.sqrt(1 - z * z);
  return Math.exp(-a * s) * (x0 * Math.cos(wd * s) + ((v0 + a * x0) / wd) * Math.sin(wd * s));
}
const bump = (s, p) => (s <= 0 ? 0 : (s / p) * Math.exp(1 - s / p));     // 0 at s = 0, peak 1 at s = p, then decays
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixC = (a, b, k) => { const A = rgb(a), B = rgb(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// card C: a short squash (anticipation), then a spring released from 0.96 with a strong upward velocity, resting at 1.05
function popC(t) {
  if (t < T.hit - 0.12) return 1;
  if (t < T.hit) return 1 - 0.04 * ease.inOutCubic((t - (T.hit - 0.12)) / 0.12);
  return 1.05 + spring(t - T.hit, -0.09, 3.6, 18, 0.35);
}
// distance from a rectangle's centre to its edge along angle a
const boxRay = (a, hw, hh) => Math.min(hw / Math.max(1e-6, Math.abs(Math.cos(a))), hh / Math.max(1e-6, Math.abs(Math.sin(a))));

// ---------------------------------------------------------------- type metrics (measured once in setup)
const M = { dig: 0.72, hanUp: 0.8, hanDn: 0.1 };
const digBase = (cy, px) => cy + (M.dig * px) / 2;                     // baseline that centres digits/caps on cy
const hanBase = (cy, px) => cy + ((M.hanUp - M.hanDn) * px) / 2;       // baseline that centres Hangul on cy
function txt(g, s, x, y, font, color, align = 'center', ls = 0) {
  g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic'; g.letterSpacing = `${ls}px`;
  g.fillText(s, x, y);
}
// tabular figures by hand (canvas has no font-variant-numeric): every digit gets the advance of '0', centred in it
function tnum(g, s, x, y, font, color, align = 'right') {
  g.font = font; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.letterSpacing = '0px';
  const w0 = g.measureText('0').width, ws = [...s].map((ch) => (/\d/.test(ch) ? w0 : g.measureText(ch).width));
  const W = ws.reduce((a, b) => a + b, 0);
  let px = align === 'right' ? x - W : align === 'center' ? x - W / 2 : x;
  [...s].forEach((ch, i) => { g.fillText(ch, px + ws[i] / 2, y); px += ws[i]; });
  return W;
}

// ---------------------------------------------------------------- split-flap: two static halves + two hinged flaps
// [static top = new, static bottom = old, flap top = old (falls 0 → 90° toward the viewer), flap bottom = new (90° → 0,
// bouncing)]. A flap tilted θ toward a pinhole at distance P puts its free edge at hh·cosθ·P/(P − hh·sinθ) from the hinge
// and its mid-depth is P/(P − hh·sinθ/2) wide: one 2D scale about the hinge line, clipped to the half's rounded rect.
class Flap {
  constructor(events, dur, box) { Object.assign(this, { ev: events, dur, b: box, hh: box.h / 2 - 1.5, P: 3.2 * box.h }); }
  half(g, face, top, th, shade) {
    const { x, y, w, h, r, fs } = this.b, hy = y + h / 2, y0 = top ? y : hy + 1.5;
    g.save();
    if (th) {
      const s = Math.sin(th), k = this.P / (this.P - this.hh * s);
      g.translate(x + w / 2, hy); g.scale(this.P / (this.P - 0.5 * this.hh * s), Math.cos(th) * k); g.translate(-(x + w / 2), -hy);
    }
    g.beginPath(); g.roundRect(x, y0, w, this.hh, top ? [r, r, 5, 5] : [5, 5, r, r]); g.clip();
    g.fillStyle = face.bg; g.fillRect(x, y0, w, this.hh);
    if (top) { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x, y0, w, 2); }
    if (face.text) txt(g, face.text, x + w / 2, digBase(y + h / 2, fs), F(850, fs), face.fg);
    if (shade > 0.002) { g.fillStyle = `rgba(7,5,28,${shade.toFixed(3)})`; g.fillRect(x, y0, w, this.hh); }
    g.restore();
  }
  draw(g, t) {
    const { x, y, w, h, r } = this.b, ev = this.ev;
    g.fillStyle = C.slot; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill();      // the slot shows in the hinge gap
    let i = 0;
    while (i + 1 < ev.length && ev[i + 1].t <= t) i++;
    const cur = ev[i].f, u = i > 0 ? (t - ev[i].t) / this.dur : 1;
    if (u >= 1 || u < 0) { this.half(g, cur, true, 0, 0); this.half(g, cur, false, 0, 0); return; }
    const old = ev[i - 1].f;
    if (u < 0.5) {                                   // the old top half falls toward the viewer, accelerating (θ ∝ u²)
      const th = (Math.PI / 2) * (u / 0.5) ** 2;
      this.half(g, cur, true, 0, 0.45 * (1 - u / 0.5)); this.half(g, old, false, 0, 0);
      this.half(g, old, true, th, 0.6 * Math.sin(th));
    } else {                                         // the new bottom half lands and bounces twice, decaying
      const v = (u - 0.5) / 0.5, th = (Math.PI / 2) * Math.exp(-3.2 * v) * Math.abs(Math.cos(1.62 * Math.PI * v));
      this.half(g, cur, true, 0, 0); this.half(g, old, false, 0, 0.4 * (1 - Math.sin(th)));
      this.half(g, cur, false, th, 0.35 * Math.sin(th));
    }
  }
}

// ---------------------------------------------------------------- backdrop painting (setup only)
const radial = (g, x, y, r1, col, a) => {
  const rg = g.createRadialGradient(x, y, 0, x, y, r1);
  rg.addColorStop(0, `rgba(${col},${a})`); rg.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = rg; g.fillRect(0, 0, g.canvas.width, g.canvas.height);
};
const GLYPHS = ['+', '×', '÷', '=', '?', '%', '+', '='];
const STAR = new Path2D('M0 -1C.13 -.13 .13 -.13 1 0C.13 .13 .13 .13 0 1C-.13 .13 -.13 .13 -1 0C-.13 -.13 -.13 -.13 0 -1Z');
const CHECK = new Path2D('M5 12.6 9.8 17.2 19 7.4');

defineDemo({
  id: '130-quiz-countdown',
  title: '다음 숫자는?',
  tech: '퀴즈 연출 · 카운트다운 링 + 긴장 리듬 + 정답 공개',
  duration: D,
  background: '#14113d',
  async setup(api) {
    const { headless } = api;
    const ALL = '오늘의 퀴즈Q.07다음에 올 숫자는?시청자 선택 · 예시참여명정답!피보나치 수열앞의 두 수를 더하면 다음 수' +
      '0123456789+=%,?ABCD×÷ ';
    await Promise.all([600, 650, 700, 750, 800, 850].map((w) => fontReady(`${w} 40px ${KR}`, ALL)));
    // every canvas is CPU-rastered in the headless check (willReadFrequently): a GPU canvas there can composite
    // differently on its first frame; in a real browser all of them stay GPU-backed
    const cv = (z, w = 1080, h = 1920) => {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;z-index:${z}`;
      api.stage.appendChild(c);
      return { el: c, ctx: c.getContext('2d', headless ? { willReadFrequently: true } : undefined) };
    };

    // ---------------- far: base gradient + soft light (static)
    const base = cv(0);
    {
      const g = base.ctx;
      const lg = g.createLinearGradient(0, 0, 0, 1920);
      lg.addColorStop(0, '#2a2476'); lg.addColorStop(0.45, '#1d1859'); lg.addColorStop(1, '#0f0c30');
      g.fillStyle = lg; g.fillRect(0, 0, 1080, 1920);
      radial(g, 540, RING.y, 800, '98,86,214', 0.32);
      radial(g, 540, 60, 760, '132,120,240', 0.17);
      radial(g, 1000, 1760, 620, AR, 0.035);
      const bg = g.createLinearGradient(0, 1600, 0, 1920);
      bg.addColorStop(0, 'rgba(8,6,28,0)'); bg.addColorStop(1, 'rgba(8,6,28,.62)');
      g.fillStyle = bg; g.fillRect(0, 1600, 1080, 320);
    }
    // ---------------- far: drifting bokeh and faint math glyphs (baked once, moved by transform)
    const far = cv(1, 1080, 2140);
    far.el.style.top = '-40px';
    {
      const g = far.ctx, R = rand(13001);
      for (let i = 0; i < 30; i++) {
        const x = R() * 1080, y = R() * 2140, r = 8 + R() ** 1.8 * 62, a = 0.035 + R() * 0.085, warm = R() < 0.18;
        g.filter = `blur(${(1.5 + r * 0.14).toFixed(1)}px)`;
        g.fillStyle = warm ? `rgba(${AR},${a.toFixed(3)})` : `rgba(206,198,255,${a.toFixed(3)})`;
        g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      }
      g.filter = 'blur(1.6px)';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      const spots = [[120, 380], [960, 300], [70, 1010], [1010, 860], [150, 1730], [930, 1600], [880, 1950], [210, 2080]];
      spots.forEach(([x, y], i) => {
        g.save(); g.translate(x, y); g.rotate((R() - 0.5) * 0.7);
        g.font = F(800, Math.round(110 + R() * 90));
        g.fillStyle = `rgba(190,180,255,${(0.05 + R() * 0.04).toFixed(3)})`;
        g.fillText(GLYPHS[i], 0, 0);
        g.restore();
      });
      g.filter = 'none';
    }
    // ---------------- the board: one live canvas (backdrop light, then every element, drawn from t each frame)
    const board = cv(2);
    // ---------------- near: big soft discs and two blurred glyphs in front (parallax)
    const near = cv(4, 1180, 2020);
    near.el.style.left = '-50px'; near.el.style.top = '-50px';
    near.el.style.transformOrigin = '590px 1040px';
    {
      const g = near.ctx, R = rand(13003);
      const spots = [[40, 520, 70], [1150, 760, 90], [70, 1420, 56], [1140, 1880, 110], [600, 30, 60], [1120, 260, 46]];
      for (const [x, y, r] of spots) {
        g.filter = `blur(${(10 + r * 0.16).toFixed(1)}px)`;
        g.fillStyle = R() < 0.35 ? `rgba(${AR},.10)` : 'rgba(214,206,255,.09)';
        g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      }
      g.filter = 'blur(7px)';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = F(850, 260);
      g.fillStyle = 'rgba(200,190,255,.075)';
      g.save(); g.translate(1100, 1180); g.rotate(0.3); g.fillText('?', 0, 0); g.restore();
      g.save(); g.translate(30, 210); g.rotate(-0.35); g.fillText('+', 0, 0); g.restore();
      g.filter = 'none';
    }
    // ---------------- film grain (static)
    const grain = cv(5, 540, 960);
    {
      grain.el.style.width = '1080px'; grain.el.style.height = '1920px'; grain.el.style.opacity = '0.045';
      const g = grain.ctx, rg = rand(13004), id = g.createImageData(540, 960);
      for (let i = 0; i < id.data.length; i += 4) { const v = Math.floor(rg() * 255); id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
      g.putImageData(id, 0, 0);
    }

    // ---------------- type metrics and fixed layouts (measured once)
    const g = board.ctx;
    g.font = F(850, 100); M.dig = g.measureText('0').actualBoundingBoxAscent / 100;
    { const m = g.measureText('가나다'); M.hanUp = m.actualBoundingBoxAscent / 100; M.hanDn = m.actualBoundingBoxDescent / 100; }
    const measure = (s, font, ls = 0) => { g.font = font; g.letterSpacing = `${ls}px`; const w = g.measureText(s).width; g.letterSpacing = '0px'; return w; };
    const QF = F(850, 78), QLS = -0.035 * 78;
    const qW = measure('다음에 올 숫자는?', QF, QLS), qx0 = 540 - qW / 2;
    const Q = { x: [qx0, qx0 + measure('다음에 올 ', QF, QLS)], wq: measure('숫자는', QF, QLS) };
    const LF = F(850, 94), LLS = -0.035 * 94, LAB = [...'피보나치 수열'];
    const lW = measure(LAB.join(''), LF, LLS), lx0 = 540 - lW / 2;
    const labX = LAB.map((_, j) => lx0 + measure(LAB.slice(0, j).join(''), LF, LLS));
    const PILL = { w1: measure('오늘의 퀴즈', F(700, 28), -0.28), w2: measure('Q.07', F(650, 28)) };
    PILL.w = 24 + 14 + 14 + PILL.w1 + 18 + PILL.w2 + 28;
    const SUB = ['앞의 두 수를 ', '더하면', ' 다음 수'].map((s, i) => measure(s, F(i === 1 ? 750 : 600, 35), -0.5));
    const CAP = { w1: measure('참여 ', F(650, 27)), wm: measure('명', F(650, 27)) };
    const chipW = CHIPS.map((c) => measure(c.text, F(800, 33), -0.33) + 48);
    const okW = 14 + 28 + 8 + measure('정답!', F(800, 27)) + 20;
    // half-ellipse lengths for the dash (numerically: 400 chords)
    const arcLen = ARCS.map((a) => {
      const rx = (a.x1 - a.x0) / 2;
      let L = 0, px = a.x0, py = a.y;
      for (let i = 1; i <= 400; i++) {
        const th = Math.PI * (1 + i / 400), x = a.x0 + rx + rx * Math.cos(th), y = a.y + a.h * Math.sin(th) * (a.up ? 1 : -1);
        L += Math.hypot(x - px, y - py); px = x; py = y;
      }
      return L;
    });
    // ring watch marks: two static paths
    const marks = [new Path2D(), new Path2D()];
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * TAU - Math.PI / 2, big = i % 5 === 0, r0 = 194, r1 = big ? 211 : 203, p = marks[big ? 1 : 0];
      p.moveTo(r0 * Math.cos(a), r0 * Math.sin(a)); p.lineTo(r1 * Math.cos(a), r1 * Math.sin(a));
    }

    // ---------------- impact tables (setup only)
    const RL = rand(13002);
    const lines = Array.from({ length: 16 }, (_, j) => ({
      a: (j / 16) * TAU + (RL() - 0.5) * 0.18, L: 120 + RL() * 150, w: 8 + RL() * 7, d: RL() * 0.05, col: j % 2 ? CR : AR,
    }));
    const SPK = [
      { x: CC.x - 262, y: CC.y - 80, s: 22, at: T.hit + 0.2, ph: 0.1 }, { x: CC.x + 246, y: CC.y - 104, s: 15, at: T.hit + 0.28, ph: 0.55 },
      { x: CC.x + 236, y: CC.y + 92, s: 17, at: T.hit + 0.34, ph: 0.3 }, { x: CC.x - 240, y: CC.y + 100, s: 12, at: T.hit + 0.24, ph: 0.8 },
      { x: XC(5) - 84, y: TILE.y - 40, s: 18, at: T.eight + 0.3, ph: 0.2 }, { x: XC(5) + 82, y: TILE.y + 14, s: 13, at: T.eight + 0.38, ph: 0.65 },
      { x: XC(5) + 66, y: TILE.y + TILE.h + 52, s: 11, at: T.eight + 0.44, ph: 0.4 },
    ];

    // ---------------- split-flaps
    const face = (text, bg, fg) => ({ text, bg, fg });
    const tileBox = (i) => ({ x: TILE.x0 + i * TILE.step, y: TILE.y, w: TILE.w, h: TILE.h, r: TILE.r, fs: TILE.fs });
    const flaps = SEQ.map((s, i) => new Flap(i < 5 ? [{ t: 0, f: face(s, C.tile, C.cream) }]
      : [{ t: 0, f: face('?', C.tileQ, C.acc) }, { t: T.eight, f: face('8', C.acc, C.ink) }], 0.42, tileBox(i)));
    const digFaces = { 5: face('5', C.dig, C.cream), 4: face('4', C.dig, C.cream), 3: face('3', C.dig, C.cream),
      2: face('2', C.dig, C.acc), 1: face('1', C.dig, C.acc), 0: face('0', C.acc, C.ink) };
    const dFlap = new Flap([{ t: 0, f: face('', C.dig, C.cream) }, { t: T.digit, f: digFaces[5] },
      ...DIGIT_AT.map((d) => ({ t: d.t, f: digFaces[d.k] }))], 0.3, DIG);

    // ---------------- the timeline: entrances and exits, tweening plain proxies that frame() draws from
    const P = {
      pill: { y: -40, o: 0 }, q: [{ yp: 118 }, { yp: 118 }],
      tile: SEQ.map(() => ({ y: 50, s: 0.3, o: 0 })),
      card: CARD.pos.map(() => ({ x: 0, y: 130, s: 0.84, r: 0, o: 0, dim: 0 })),
      ring: { s: 0.45, o: 0, r: -40 }, capt: { y: 18, o: 0 }, ok: { s: 0, r: -14, o: 0 },
      chip: CHIPS.map((c) => ({ y: c.from, o: 0, c: 0.5 })), lab: LAB.map(() => ({ yp: 115 })), sub: { y: 22, o: 0 },
    };
    const tl = gsap.timeline({ paused: true, defaults: { lazy: false } });
    tl.fromTo(P.pill, { y: -40, o: 0 }, { y: 0, o: 1, duration: 0.6, ease: 'expo.out' }, T.pill);
    tl.fromTo(P.q, { yp: 118 }, { yp: 0, duration: 0.75, ease: 'expo.out', stagger: 0.1 }, T.q);
    P.tile.forEach((p, i) => {                        // one pop per beat
      tl.fromTo(p, { y: 50, s: 0.3 }, { y: 0, s: 1, duration: 0.55, ease: `back.out(${i === 5 ? 3 : 2.2})` }, T.pop[i]);
      tl.fromTo(p, { o: 0 }, { o: 1, duration: 0.1, ease: 'none' }, T.pop[i]);
    });
    P.card.forEach((p, i) => {                        // reading order, alternating tilt
      const at = T.card + i * T.cardStep;
      tl.fromTo(p, { y: 130, r: i % 2 ? 6 : -6, s: 0.84 }, { y: 0, r: 0, s: 1, duration: 0.7, ease: 'back.out(1.5)' }, at);
      tl.fromTo(p, { o: 0 }, { o: 1, duration: 0.2, ease: 'none' }, at);
    });
    tl.fromTo(P.ring, { s: 0.45, o: 0, r: -40 }, { s: 1, o: 1, r: 0, duration: 0.65, ease: 'back.out(1.6)' }, T.ring);
    tl.fromTo(P.capt, { y: 18, o: 0 }, { y: 0, o: 1, duration: 0.5, ease: 'expo.out' }, 2.6);
    // time up: the wrong cards dim and slide back — staggered, each its own direction, faster than they came in
    const EXIT = [{ i: 1, at: T.up + 0.02, x: 34, y: -6, r: 2.5, d: 0.28 }, { i: 3, at: T.up + 0.07, x: 36, y: 12, r: 2, d: 0.26 },
      { i: 0, at: T.up + 0.11, x: -34, y: -4, r: -2.5, d: 0.3 }];
    for (const e of EXIT) {
      tl.to(P.card[e.i], { x: e.x, y: e.y, r: e.r, s: 0.9, duration: e.d, ease: 'power3.out' }, e.at);
      tl.fromTo(P.card[e.i], { dim: 0 }, { dim: 0.6, duration: e.d * 0.8, ease: 'power2.out' }, e.at);
    }
    tl.to(P.ring, { s: 0.6, o: 0, duration: 0.28, ease: 'power2.in' }, T.ringOut);
    tl.fromTo(P.ok, { s: 0, r: -14, o: 0 }, { s: 1, r: 0, o: 1, duration: 0.5, ease: 'back.out(2.6)' }, T.ok);
    // chips slide out of their arc and open from the centre (clip inset 50 % → 0)
    CHIPS.forEach((c, k) => tl.fromTo(P.chip[k], { y: c.from, o: 0, c: 0.5 }, { y: 0, o: 1, c: 0, duration: 0.46, ease: 'expo.out' }, c.at));
    tl.fromTo(P.lab, { yp: 115 }, { yp: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05 }, T.label);
    tl.fromTo(P.sub, { y: 22, o: 0 }, { y: 0, o: 1, duration: 0.6, ease: 'expo.out' }, T.sub);
    tl.time(D); tl.time(0);                           // initialise every tween once, in order

    Object.assign(this, { tl, P, g, flaps, dFlap, lines, SPK, marks, arcLen, Q, labX, PILL, SUB, CAP, chipW, okW,
      far: far.el, near: near.el });
  },

  frame(t) {
    const { tl, P, g, flaps, dFlap, lines, SPK, marks, arcLen, Q, labX, PILL, SUB, CAP, chipW, okW, far, near } = this;
    tl.time(t);
    const b = beat(t);                                       // heartbeat 0 … ~1.2
    const tens = ramp(t, 4.9, 5.5);                          // the last two seconds turn to the accent
    const sHit = t - T.hit;
    const col = mixC(C.cream, C.acc, tens);

    // camera: a push-in through the countdown (board about the ring, backdrop layers deeper), released by the impact
    // kick and a whole-pixel shake; a slow drift back in for the afterglow
    const push = ease.inOutCubic(clamp((t - T.cd) / (T.up + 0.2 - T.cd))) * (sHit > 0 ? Math.exp(-4 * sHit) : 1) +
      0.5 * bump(sHit, 0.05) + 0.35 * ease.inOutCubic(clamp((t - 8.2) / 1.8));
    let sx = 0, sy = 0;
    if (sHit > 0) {
      const amp = 12 * Math.exp(-8 * sHit);
      sx = Math.round(amp * Math.sin(53 * sHit + 0.3)); sy = Math.round(0.8 * amp * Math.sin(41 * sHit + 1.9));
    }
    const cs = 1 + 0.025 * push;

    // ---------------- reset the context, then the backdrop light (rays, tick glow, vignette, colour wash)
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.setLineDash([]); g.lineDashOffset = 0; g.lineCap = 'butt'; g.lineJoin = 'miter'; g.letterSpacing = '0px';
    g.clearRect(0, 0, 1080, 1920);
    {
      const a = (0.03 + 0.03 * ramp(t, 3, 7)) * (1 - 0.6 * ramp(t, T.up, T.up + 0.6)) * ramp(t, 0, 0.8);
      const rot = 0.05 * t + 0.4 * ease.inCubic(clamp((t - T.cd) / (T.up - T.cd)));
      g.translate(RING.x, RING.y); g.rotate(rot);
      const rg = g.createRadialGradient(0, 0, 60, 0, 0, 1350);
      rg.addColorStop(0, `rgba(${CR},${a.toFixed(4)})`); rg.addColorStop(1, `rgba(${CR},0)`);
      g.fillStyle = rg;
      g.beginPath();
      for (let i = 0; i < 18; i++) {
        const a0 = (i / 18) * TAU, a1 = a0 + TAU / 36;
        g.moveTo(0, 0); g.lineTo(1500 * Math.cos(a0), 1500 * Math.sin(a0)); g.lineTo(1500 * Math.cos(a1), 1500 * Math.sin(a1));
      }
      g.fill();
      g.setTransform(1, 0, 0, 1, 0, 0);
    }
    const wash = (x, y, r0, r1, rgbs, a, mid) => {
      const rg = g.createRadialGradient(x, y, r0, x, y, r1);
      rg.addColorStop(0, `rgba(${rgbs},${a.toFixed(4)})`);
      if (mid) rg.addColorStop(0.55, `rgba(${rgbs},${(a * mid).toFixed(4)})`);
      rg.addColorStop(1, `rgba(${rgbs},0)`);
      g.fillStyle = rg; g.fillRect(0, 0, 1080, 1920);
    };
    if (b > 0.01 && t < T.up + 0.5) wash(RING.x, RING.y, 120, 560, '255,214,120', 0.1 * b * (0.4 + 0.6 * tens));   // breathes on every tick
    {                                                        // tension vignette: closes in over the last seconds
      const v = 0.55 * ease.inCubic(clamp((t - 4.4) / 2.6)) * (1 + 0.2 * b) * (1 - ease.outCubic(clamp(sHit / 0.5)));
      if (v > 0.002) {
        const rg = g.createRadialGradient(RING.x, RING.y, 260, RING.x, RING.y, 1180);
        rg.addColorStop(0, 'rgba(6,4,22,0)'); rg.addColorStop(1, `rgba(6,4,22,${v.toFixed(4)})`);
        g.fillStyle = rg; g.fillRect(0, 0, 1080, 1920);
      }
    }
    if (sHit > 0) wash(CC.x, CC.y, 0, 140 + 1500 * ease.outExpo(clamp(sHit / 0.75)), AR, 0.075 + 0.25 * Math.exp(-2.6 * sHit), 0.4);  // the colour flood
    if (t > T.eight) wash(XC(5), TILE.y + TILE.h / 2, 30, 300, AR, 0.16 * ease.outCubic(clamp((t - T.eight - 0.2) / 0.5)));   // afterglow
    if (t >= T.up && t < T.up + 0.5) { g.fillStyle = `rgba(255,236,190,${(0.12 * Math.exp(-(t - T.up) / 0.09)).toFixed(4)})`; g.fillRect(0, 0, 1080, 1920); }

    // ---------------- the board, in camera space
    g.setTransform(cs, 0, 0, cs, RING.x * (1 - cs) + sx, RING.y * (1 - cs) + sy);

    // header pill
    if (P.pill.o > 0.002) {
      g.save(); g.globalAlpha = P.pill.o; g.translate(0, P.pill.y);
      const x0 = 540 - PILL.w / 2, y0 = PILL_Y - 29;
      g.beginPath(); g.roundRect(x0, y0, PILL.w, 58, 29);
      g.fillStyle = `rgba(${CR},.07)`; g.fill();
      g.lineWidth = 2; g.strokeStyle = `rgba(${CR},.13)`; g.beginPath(); g.roundRect(x0 + 1, y0 + 1, PILL.w - 2, 56, 28); g.stroke();
      const dx = x0 + 24 + 7;
      wash2(g, dx, PILL_Y, 16, AR, 0.5);
      g.fillStyle = C.acc; g.beginPath(); g.arc(dx, PILL_Y, 7, 0, TAU); g.fill();
      txt(g, '오늘의 퀴즈', x0 + 24 + 14 + 14, hanBase(PILL_Y, 28), F(700, 28), C.cream, 'left', -0.28);
      txt(g, 'Q.07', x0 + 24 + 14 + 14 + PILL.w1 + 18, digBase(PILL_Y, 28), F(650, 28), `rgba(${CR},.5)`, 'left');
      g.restore();
    }
    // the question: two words rising inside their masks
    {
      const top = Q_Y - M.hanUp * 78 - 10, bot = Q_Y + M.hanDn * 78 + 40, base = hanBase(Q_Y, 78);
      ['다음에 올', '숫자는'].forEach((w, k) => {
        const dy = (P.q[k].yp / 100) * 87;
        if (dy > 86.9) return;
        g.save(); g.beginPath(); g.rect(Q.x[k] - 10, top, (k ? Q.wq + 70 : 400), bot - top); g.clip();
        txt(g, w, Q.x[k], base + dy, F(850, 78), C.cream, 'left', -0.035 * 78);
        if (k) txt(g, '?', Q.x[1] + Q.wq, base + dy, F(850, 78), C.acc, 'left', -0.035 * 78);
        g.restore();
      });
    }

    // the number row: pings behind the pops, then the tiles
    g.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const k = (t - T.pop[i]) / 0.5;
      if (k <= 0 || k >= 1) continue;
      g.strokeStyle = `rgba(${i === 5 ? AR : CR},${(0.4 * (1 - k) ** 1.4).toFixed(3)})`;
      g.beginPath(); g.arc(XC(i), TILE.y + TILE.h / 2, 66 + 44 * ease.outCubic(k), 0, TAU); g.stroke();
    }
    const hiA = ramp(t, T.arcA - 0.02, T.arcA + 0.1) * (1 - ramp(t, T.arcA + 0.44, T.arcA + 0.58));
    const hiB = ramp(t, T.arcB - 0.02, T.arcB + 0.1) * (1 - ramp(t, T.arcB + 0.46, T.arcB + 0.62));
    const wob = t < T.pop[5] ? 0 : lerp(9, 3.2, ramp(t, 2.6, 3.4)) * (1 - ramp(t, T.eight - 0.12, T.eight + 0.05));
    for (let i = 0; i < 6; i++) {
      const p = P.tile[i];
      if (p.o <= 0.002) continue;
      const x = TILE.x0 + i * TILE.step, y = TILE.y, cx = XC(i), cy = y + TILE.h / 2;
      let s = p.s, rot = 0;
      if (i === 5) { s *= 1 + 0.07 * b + 0.12 * bump(t - (T.eight + 0.24), 0.07); rot = wob * Math.sin(TAU * 1.45 * (t - T.pop[5])); }
      if (i === 4) s *= 1 + 0.1 * bump(t - (T.arcA + 0.36), 0.06);
      g.save(); g.globalAlpha = p.o;
      g.translate(cx, cy + p.y); g.rotate(rot * DEG); g.scale(s, s); g.translate(-cx, -cy);
      g.fillStyle = i === 5 && t >= T.eight + 0.21 ? '#c4860f' : C.lip;
      g.beginPath(); g.roundRect(x, y + 10, TILE.w, TILE.h, TILE.r); g.fill();
      flaps[i].draw(g, t);
      const ring = (rgbs, a, w, inf) => {
        if (a <= 0.002) return;
        g.lineWidth = w; g.strokeStyle = `rgba(${rgbs},${a.toFixed(3)})`;
        g.beginPath(); g.roundRect(x - inf, y - inf, TILE.w + 2 * inf, TILE.h + 2 * inf, TILE.r + inf); g.stroke();
      };
      if (i === 2 || i === 3) ring(CR, hiA, 4, 7);
      if (i === 3 || i === 4) ring(AR, hiB, 4, 7);
      if (i === 5) {
        const qa = 1 - 0.55 * ramp(t, T.eight + 0.2, T.eight + 0.5);
        ring(AR, 0.14 * qa, 16, 6.5); ring(AR, qa, 5, 6.5);
      }
      g.restore();
    }

    // the explanation arcs: half-ellipses drawn by dash offset, a dot where each starts, a chevron where it lands
    g.lineCap = 'round'; g.lineJoin = 'round';
    ARCS.forEach((a, i) => {
      const p = ease.inOutCubic(clamp((t - a.t0) / a.d));
      if (p <= 0.002) return;
      const L = arcLen[i], rx = (a.x1 - a.x0) / 2;
      g.strokeStyle = a.col; g.lineWidth = a.w;
      g.setLineDash([L, L]); g.lineDashOffset = L * (1 - p);
      g.beginPath(); g.ellipse(a.x0 + rx, a.y, rx, a.h, 0, Math.PI, 0, !a.up); g.stroke();
      g.setLineDash([]); g.lineDashOffset = 0;
      const k0 = clamp((t - a.t0) / 0.22), k1 = clamp((t - (a.t0 + a.d - 0.05)) / 0.24);
      g.fillStyle = a.col; g.beginPath(); g.arc(a.x0, a.y, a.w * 0.95 * ease.outBack(k0, 2.4), 0, TAU); g.fill();
      if (k1 > 0) {
        const sc = ease.outBack(k1, 2.4), dy = a.up ? -13 : 13;
        g.save(); g.translate(a.x1, a.y); g.scale(sc, sc);
        g.beginPath(); g.moveTo(-12, dy); g.lineTo(0, 0); g.lineTo(12, dy); g.stroke();
        g.restore();
      }
    });

    // the countdown ring and its digit card
    if (P.ring.o > 0.002) {
      const ra = ringArc(t), on = t >= T.charge && t < T.up && ra.rem > 0.0015;
      const rs = P.ring.s * (1 + 0.035 * ease.inCubic(ramp(t, 4.6, T.up)) + 0.012 * b + 0.07 * bump(t - T.up, 0.05));
      g.save(); g.globalAlpha = P.ring.o;
      g.translate(RING.x, RING.y); g.rotate(P.ring.r * DEG); g.scale(rs, rs);
      g.fillStyle = 'rgba(18,15,60,.5)'; g.beginPath(); g.arc(0, 0, 184, 0, TAU); g.fill();
      g.strokeStyle = `rgba(${CR},.2)`; g.lineCap = 'round';
      g.lineWidth = 2.5; g.stroke(marks[0]); g.lineWidth = 4.5; g.stroke(marks[1]);
      g.lineWidth = RING.w; g.strokeStyle = C.track; g.beginPath(); g.arc(0, 0, RING.r, 0, TAU); g.stroke();
      if (on) {                                              // the arc: rounded caps, angle from ringArc(t)
        g.strokeStyle = col;
        g.globalAlpha = P.ring.o * 0.14; g.lineWidth = 58; g.beginPath(); g.arc(0, 0, RING.r, ra.a0, ra.a1); g.stroke();
        g.globalAlpha = P.ring.o; g.lineWidth = RING.w + 5 * b; g.beginPath(); g.arc(0, 0, RING.r, ra.a0, ra.a1); g.stroke();
        const ha = ra.head ? ra.a1 : ra.a0, hx = RING.r * Math.cos(ha), hy = RING.r * Math.sin(ha);
        g.globalAlpha = P.ring.o * 0.32; g.fillStyle = col; g.beginPath(); g.arc(hx, hy, 26 + 10 * b, 0, TAU); g.fill();
        g.globalAlpha = P.ring.o; g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(hx, hy, 9 + 3 * b, 0, TAU); g.fill();
      }
      if (t >= T.up) {                                       // time up: the empty track flashes warm, with a soft halo
        const fa = Math.exp(-(t - T.up) / 0.14);
        g.strokeStyle = `rgba(255,214,110,${(0.3 * fa).toFixed(3)})`; g.lineWidth = 84;
        g.beginPath(); g.arc(0, 0, RING.r, 0, TAU); g.stroke();
        g.strokeStyle = `rgba(255,236,176,${(0.95 * fa).toFixed(3)})`; g.lineWidth = 36;
        g.beginPath(); g.arc(0, 0, RING.r, 0, TAU); g.stroke();
      }
      const kt = lastTick(t);
      for (let m = 0; m < 4 && t < T.up + 0.6; m++) {        // a ripple per tick (the last four)
        const j = kt - m, k = j >= 0 ? (t - TICK.t[j]) / 0.55 : -1;
        if (k < 0 || k >= 1) continue;
        g.strokeStyle = col; g.globalAlpha = P.ring.o * 0.36 * (1 - k); g.lineWidth = 3 * (1 - k) + 0.5;
        g.beginPath(); g.arc(0, 0, RING.r + 18 + 64 * ease.outCubic(k), 0, TAU); g.stroke();
      }
      {
        const k = (t - T.up) / 0.5;                          // the time-up ripple
        if (k >= 0 && k < 1) {
          g.strokeStyle = C.acc; g.globalAlpha = P.ring.o * 0.7 * (1 - k) ** 1.5; g.lineWidth = 8 * (1 - k) + 1;
          g.beginPath(); g.arc(0, 0, RING.r + 18 + 110 * ease.outCubic(k), 0, TAU); g.stroke();
        }
      }
      g.globalAlpha = P.ring.o;
      g.fillStyle = '#120f3a'; g.beginPath(); g.roundRect(DIG.x, DIG.y + 11, DIG.w, DIG.h, DIG.r); g.fill();
      dFlap.draw(g, t);
      g.restore();
    }

    // poll caption: live dot pulses with the heartbeat, turnout counts up (예시)
    const PL = poll(t);
    if (P.capt.o > 0.002) {
      g.save(); g.globalAlpha = P.capt.o; g.translate(0, P.capt.y);
      g.fillStyle = `rgba(${AR},${(t < T.up ? 0.45 + 0.55 * clamp(b) : 0.3).toFixed(3)})`;
      g.beginPath(); g.arc(82, CAPT_Y, 6 + 1.5 * clamp(b) * (t < T.up ? 1 : 0), 0, TAU); g.fill();
      txt(g, '시청자 선택 · 예시', 100, hanBase(CAPT_Y, 27), F(650, 27), `rgba(${CR},.62)`, 'left', -0.27);
      txt(g, '명', 1004, hanBase(CAPT_Y, 27), F(650, 27), `rgba(${CR},.62)`, 'right');
      const wn = tnum(g, fmt(Math.round(POLL.n * PL.f)), 1004 - CAP.wm - 2, digBase(CAPT_Y, 27), F(750, 27), C.cream, 'right');
      txt(g, '참여 ', 1004 - CAP.wm - 2 - wn, hanBase(CAPT_Y, 27), F(650, 27), `rgba(${CR},.62)`, 'right');
      g.restore();
    }

    // the answer cards: wrong ones first, then the impact lines, then card C on top
    const pulse = 1 + 0.03 * b;
    const glowA = clamp(0.7 * b * (0.45 + 0.55 * tens) * (1 - ramp(t, T.up, T.up + 0.15)));
    const content = (i, x0, y0, ink) => {
      const fg = ink ? C.ink : C.cream, soft = ink ? IR : CR;
      g.fillStyle = `rgba(${soft},${ink ? 0.14 : 0.1})`; g.beginPath(); g.arc(x0 + 58, y0 + 86, 32, 0, TAU); g.fill();
      txt(g, CHOICE[i][0], x0 + 58, digBase(y0 + 86, 31), F(800, 31), fg);
      txt(g, CHOICE[i][1], x0 + 116, digBase(y0 + 86, 112), F(850, 112), fg, 'left', -3.4);
      tnum(g, `${PL.f > 0.001 ? Math.round(100 * PL.s[i]) : 0}%`, x0 + CARD.w - 78, digBase(y0 + 86, 33), F(750, 33), fg, 'right');
      // bar = share (on a 50 % full scale) × a turnout curve that rises early: 1 − (1 − f)²
      const tx = x0 + CARD.w - 58, ty = y0 + 32, hb = 108 * clamp(PL.s[i] / 0.5) * (1 - (1 - PL.f) ** 2);
      g.fillStyle = `rgba(${soft},${ink ? 0.16 : 0.12})`; g.beginPath(); g.roundRect(tx, ty, 22, 108, 11); g.fill();
      if (hb > 0.3) { g.fillStyle = ink ? C.ink : `rgba(${CR},.78)`; g.beginPath(); g.roundRect(tx, ty + 108 - hb, 22, hb, Math.min(11, hb / 2)); g.fill(); }
    };
    const drawCard = (i) => {
      const p = P.card[i];
      if (p.o <= 0.002) return;
      const [x0, y0] = CARD.pos[i], cx = x0 + CARD.w / 2, cy = y0 + CARD.h / 2, W = CARD.w, H = CARD.h;
      const sc = p.s * (i === ANS ? pulse * popC(t) : pulse);
      g.save(); g.globalAlpha = p.o;
      g.translate(cx + p.x, cy + p.y); g.rotate(p.r * DEG); g.scale(sc, sc); g.translate(-cx, -cy);
      if (glowA > 0.002) {                                   // the heartbeat outline
        g.lineWidth = 4; g.strokeStyle = `rgba(${CR},${glowA.toFixed(3)})`;
        g.beginPath(); g.roundRect(x0 - 8, y0 - 8, W + 16, H + 16, CARD.r + 8); g.stroke();
      }
      if (i === ANS && sHit > 0) {                           // card C's warm halo: bright on the hit, then it breathes
        const gy = clamp(Math.exp(-2.5 * sHit) + 0.42 * (1 - Math.exp(-2.5 * sHit)) + 0.07 * Math.sin(TAU * 0.7 * sHit));
        for (let k = 0; k < 5; k++) {
          g.lineWidth = 8; g.strokeStyle = `rgba(${AR},${(gy * (0.3 - 0.055 * k)).toFixed(3)})`;
          g.beginPath(); g.roundRect(x0 - 12 - 7 * k, y0 - 12 - 7 * k, W + 24 + 14 * k, H + 24 + 14 * k, CARD.r + 12 + 7 * k); g.stroke();
        }
        g.lineWidth = 4; g.strokeStyle = `rgba(${AR},${gy.toFixed(3)})`;
        g.beginPath(); g.roundRect(x0 - 8, y0 - 8, W + 16, H + 16, CARD.r + 8); g.stroke();
      }
      g.fillStyle = '#141040'; g.beginPath(); g.roundRect(x0, y0 + 11, W, H, CARD.r); g.fill();
      g.save();
      g.beginPath(); g.roundRect(x0, y0, W, H, CARD.r); g.clip();
      const lg = g.createLinearGradient(0, y0, 0, y0 + H);
      lg.addColorStop(0, '#332d84'); lg.addColorStop(1, '#29236f');
      g.fillStyle = lg; g.fillRect(x0, y0, W, H);
      g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x0, y0, W, 2);
      content(i, x0, y0, false);
      // colour flood: a circle clip growing from the centre over a yellow copy of the face
      const fR = i === ANS && sHit > 0 ? 270 * ease.outCubic(clamp(sHit / 0.32)) : 0;
      if (fR > 0) {
        g.beginPath(); g.arc(cx, cy, fR, 0, TAU); g.clip();
        const fy = g.createLinearGradient(0, y0, 0, y0 + H);
        fy.addColorStop(0, '#ffd35e'); fy.addColorStop(1, '#ffbf2f');
        g.fillStyle = fy; g.fillRect(x0, y0, W, H);
        content(i, x0, y0, true);
      }
      g.restore();
      if (p.dim > 0.002) { g.fillStyle = `rgba(18,15,56,${p.dim.toFixed(3)})`; g.beginPath(); g.roundRect(x0 - 2, y0 - 2, W + 4, H + 17, CARD.r + 2); g.fill(); }
      if (i === ANS && P.ok.o > 0.002) {                     // the "정답!" tab on the top edge
        const ox = x0 + 286, oy = y0 - 26, pcx = ox + 0.3 * okW, pcy = oy + 25;
        g.globalAlpha = p.o * P.ok.o;
        g.translate(pcx, pcy); g.rotate(P.ok.r * DEG); g.scale(P.ok.s, P.ok.s); g.translate(-pcx, -pcy);
        g.fillStyle = 'rgba(5,4,20,.35)'; g.beginPath(); g.roundRect(ox, oy + 6, okW, 50, 25); g.fill();
        g.fillStyle = C.ink; g.beginPath(); g.roundRect(ox, oy, okW, 50, 25); g.fill();
        g.lineWidth = 2; g.strokeStyle = `rgba(${AR},.5)`; g.beginPath(); g.roundRect(ox + 1, oy + 1, okW - 2, 48, 24); g.stroke();
        g.save(); g.translate(ox + 14, oy + 11); g.scale(28 / 24, 28 / 24);
        g.lineWidth = 3.2 * 24 / 28; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = C.acc; g.stroke(CHECK);
        g.restore();
        txt(g, '정답!', ox + 14 + 28 + 8, hanBase(oy + 25, 27), F(800, 27), C.acc, 'left');
      }
      g.restore();
    };
    for (const i of [0, 1, 3]) drawCard(i);
    // the impact: radial lines from card C's edge (shorter downward, the caption zone stays clear) and a shock outline
    g.lineCap = 'round';
    for (const l of lines) {
      const s = sHit - l.d;
      if (s <= 0 || s > 0.62) continue;
      const r0 = boxRay(l.a, (CARD.w / 2) * 1.12, (CARD.h / 2) * 1.12) + 20, L = l.L * (1 - 0.62 * Math.max(0, Math.sin(l.a)));
      const head = r0 + L * ease.outExpo(clamp(s / 0.36)), tail = r0 + L * ease.outCubic(clamp((s - 0.07) / 0.42));
      if (head - tail < 0.5) continue;
      const ca = Math.cos(l.a), sa = Math.sin(l.a);
      g.strokeStyle = `rgb(${l.col})`; g.lineWidth = l.w;
      g.beginPath(); g.moveTo(CC.x + ca * tail, CC.y + sa * tail); g.lineTo(CC.x + ca * head, CC.y + sa * head); g.stroke();
    }
    {
      const k = sHit / 0.6;
      if (k > 0 && k < 1) {
        const dd = 14 + 150 * ease.outCubic(k), w = CARD.w * 1.05 + 2 * dd, h = CARD.h * 1.05 + dd;
        g.lineWidth = 9 * (1 - k) + 1; g.strokeStyle = `rgba(${AR},${(0.85 * (1 - k) ** 1.3).toFixed(3)})`;
        g.beginPath(); g.roundRect(CC.x - w / 2, CC.y - h / 2, w, h, 40 + 0.9 * dd); g.stroke();
      }
    }
    drawCard(ANS);

    // chips (slide out of their arc, open from the centre), label (syllables rise in masks), sub line
    CHIPS.forEach((c, k) => {
      const p = P.chip[k];
      if (p.o <= 0.002) return;
      const w = chipW[k], x0 = c.x - w / 2, y0 = c.y - 28 + p.y, band = w * (1 - 2 * p.c);
      if (band < 1) return;
      g.save(); g.globalAlpha = p.o;
      g.beginPath(); g.roundRect(c.x - band / 2, y0 - 2, band, 64, Math.min(28, band / 2)); g.clip();
      g.fillStyle = 'rgba(5,4,20,.3)'; g.beginPath(); g.roundRect(x0, y0 + 6, w, 56, 28); g.fill();
      g.fillStyle = c.bg; g.beginPath(); g.roundRect(x0, y0, w, 56, 28); g.fill();
      txt(g, c.text, c.x, digBase(y0 + 28, 33), F(800, 33), C.ink, 'center', -0.33);
      g.restore();
    });
    {
      const top = LAB_Y - M.hanUp * 94 - 12, bot = LAB_Y + M.hanDn * 94 + 30, base = hanBase(LAB_Y, 94);
      [...'피보나치 수열'].forEach((ch, j) => {
        const dy = (P.lab[j].yp / 100) * 107;
        if (ch === ' ' || dy > 106.9) return;
        g.save(); g.beginPath(); g.rect(labX[j] - 6, top, 110, bot - top); g.clip();
        txt(g, ch, labX[j], base + dy, F(850, 94), C.cream, 'left', 0);
        g.restore();
      });
    }
    if (P.sub.o > 0.002) {
      g.save(); g.globalAlpha = P.sub.o; g.translate(0, P.sub.y);
      const x0 = 540 - (SUB[0] + SUB[1] + SUB[2]) / 2, by = hanBase(SUB_Y, 35);
      txt(g, '앞의 두 수를 ', x0, by, F(600, 35), `rgba(${CR},.72)`, 'left', -0.5);
      txt(g, '더하면', x0 + SUB[0], by, F(750, 35), C.acc, 'left', -0.5);
      txt(g, ' 다음 수', x0 + SUB[0] + SUB[1], by, F(600, 35), `rgba(${CR},.72)`, 'left', -0.5);
      g.restore();
    }

    // afterglow sparkles (twinkle; closed form after each one's start)
    for (const s of SPK) {
      const u = t - s.at;
      if (u <= 0) continue;
      const sz = s.s * ease.outBack(clamp(u / 0.35), 2) * (0.72 + 0.28 * Math.sin(TAU * (0.8 * u + s.ph)));
      g.save(); g.translate(s.x, s.y); g.rotate((20 * u + 90 * s.ph) * DEG); g.scale(sz, sz);
      g.globalAlpha = 0.9 * clamp(u / 0.15); g.fillStyle = SPK.indexOf(s) % 3 === 1 ? C.cream : C.acc; g.fill(STAR);
      g.restore();
    }
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;

    // ---------------- depth: far layer drifts and pushes in a little, the near layer pushes in more (parallax)
    far.style.transform = `translate(${(9 * Math.sin(t * 0.45)).toFixed(2)}px,${(-7 * t).toFixed(2)}px) scale(${(1 + 0.03 * push).toFixed(5)})`;
    near.style.transform = `translate(${(1.6 * sx - 4 * t).toFixed(2)}px,${(1.6 * sy - 10 * t).toFixed(2)}px) scale(${(1 + 0.09 * push).toFixed(5)})`;
  },
});

// a small soft glow disc (the pill's dot)
function wash2(g, x, y, r, rgbs, a) {
  const rg = g.createRadialGradient(x, y, 0, x, y, r);
  rg.addColorStop(0, `rgba(${rgbs},${a})`); rg.addColorStop(1, `rgba(${rgbs},0)`);
  g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
}
