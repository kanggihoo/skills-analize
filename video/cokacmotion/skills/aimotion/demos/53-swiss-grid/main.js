/*
 * 53 · 격자 위의 리듬 — a kinetic poster in the International Typographic Style, built on box breathing
 * (four counts in, four held, four out, four held) at 120 bpm on a six-column grid.
 *
 * Width fitting: INHALE / HOLD / EXHALE are set in Roboto Flex and must stay exactly flush with the column span
 * they occupy, whatever their weight, optical size and grade. In setup every word is measured in the DOM at
 * 17 wdth × 7 wght × 5 opsz (one batch, one layout), and the first / last letter's side bearings are measured on a
 * canvas (ink bounds) over font-stretch × weight. Each frame inverts that table — bilinear in (wght, log opsz),
 * then a monotone search over wdth — so the ink of the first and last letter lands on the column edges; no DOM is
 * read after setup. GRAD pulses on every beat (it changes weight, not width).
 *
 * Story: the grid drops in (0–1 s) · INHALE grows across the columns beat by beat and fills in weight (bar 1) ·
 * HOLD steps one column per beat (bar 2) · EXHALE enters and the stack cascades on eighth notes (bar 3, climax) ·
 * the blocks resolve one per beat into the final composition (bar 4) · the grid fades and the poster holds.
 * A red dot walks the breathing box one side per phase; numbers tick; the active phase is marked in red.
 */
import { defineDemo, ease, clamp, lerp, smooth } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 10;
const BEAT = 0.5;                                   // 120 bpm
const T1 = 1.0;                                     // beat 1
const tb = (k) => T1 + (k - 1) * BEAT;              // time of beat k (1…16)
const RF = `"${FONTS.robotoFlex.family}"`, KR = `"${FONTS.pretendard.family}"`;
const PAPER = '#f2efe8', INK = '#141414', RED = '#e2231a';
const red = (a) => `rgba(226,35,26,${clamp(a).toFixed(3)})`, ink = (a) => `rgba(20,20,20,${clamp(a).toFixed(3)})`;

// ---------------------------------------------------------------- the grid: 6 columns, 72 margins, 24 gutters
const MARGIN = 72, COLW = 136, GUT = 24;
const colL = (c) => MARGIN + (c - 1) * (COLW + GUT);
const colR = (c) => colL(c) + COLW;
const CAP = 216;                                    // cap height of the three big words
const ROWS = [184, 424, 664];                       // their cap tops (24 px = one baseline unit between rows)
const RULES = [{ y: 140, w: 4 }, { y: 928, w: 1 }, { y: 1316, w: 1 }];
const BOX = { x: colL(5), y: 972, s: colR(6) - colL(5) };   // the breathing box: columns 5–6, a square
const BAND = 1680;

// ---------------------------------------------------------------- choreography: [time, first col, last col, wght]
const WORDS = [
  { name: 'INHALE', row: 0, enter: tb(1), keys: [
    [tb(1), 1, 4, 140], [tb(2), 1, 5, 380], [tb(3), 1, 6, 640], [tb(4), 1, 6, 900],
    [tb(9) + 0.25, 2, 6, 900], [tb(10) + 0.25, 3, 6, 900], [tb(11) + 0.25, 2, 6, 900], [tb(12) + 0.25, 1, 6, 900], [tb(13), 1, 6, 960]] },
  { name: 'HOLD', row: 1, enter: tb(5), keys: [
    [tb(5), 1, 3, 900], [tb(6), 2, 4, 900], [tb(7), 3, 5, 900], [tb(8), 4, 6, 900],
    [tb(10), 3, 6, 900], [tb(11), 2, 5, 900], [tb(12), 3, 6, 900], [tb(14), 3, 6, 100]] },
  { name: 'EXHALE', row: 2, enter: tb(9), keys: [
    [tb(9), 1, 6, 900], [tb(10), 1, 5, 700], [tb(11), 1, 4, 460], [tb(12), 1, 4, 260], [tb(15), 1, 4, 720]] },
];
const MOVE = 0.22;                                  // a snap between spans
const snap = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : ease.outBack(p, 1.0));
const k01 = (t, a, b) => clamp((t - a) / (b - a));
const sm = (t, a, b) => smooth(k01(t, a, b));
const oc = (t, a, b) => ease.outCubic(k01(t, a, b));
const calm = (t) => 1 - sm(t, 8.6, 9.0);           // beat accents die away into the still poster
/** beats elapsed at t (0 before beat 1, 16 after the last) and the latest beat's time */
const beatsAt = (t) => clamp(Math.floor((t - T1) / BEAT) + 1, 0, 16);
const gradPulse = (t, since) => {
  const n = beatsAt(t);
  if (n < 1) return 0;
  const a = t - tb(n);
  return tb(n) >= since - 1e-6 ? 130 * Math.exp(-a / 0.11) * calm(t) : 0;
};

/** a word's state at t: span edges (px), wght, opsz, GRAD, entry wipe, the span-flash of its last move */
function wordState(W, t) {
  if (t < W.enter) return null;
  const K = W.keys;
  let i = 0;
  while (i + 1 < K.length && K[i + 1][0] <= t) i++;
  const k1 = K[i], k0 = K[Math.max(0, i - 1)];
  const p = snap((t - k1[0]) / MOVE), pw = ease.outCubic(clamp((t - k1[0]) / 0.26));
  const enter = t - W.enter;
  let opsz = 8 + 136 * ease.inOutCubic(clamp(enter / 0.55));           // arrives at text size, focuses to display
  if (i > 0) opsz -= 84 * Math.sin(Math.PI * clamp((t - k1[0]) / 0.3)); // a breath of optical size on each move
  return {
    L: lerp(colL(k0[1]), colL(k1[1]), p), R: lerp(colR(k0[2]), colR(k1[2]), p),
    wght: lerp(k0[3], k1[3], pw), opsz: clamp(opsz, 8, 144), grad: gradPulse(t, W.enter),
    wipe: ease.outCubic(clamp(enter / 0.2)),
    flash: i > 0 || enter < 0.6 ? Math.exp(-(t - k1[0]) / 0.18) * (t - k1[0] < 0.7 ? 1 : 0) : 0,
    span: [k1[1], k1[2]],
  };
}

// ---------------------------------------------------------------- width table (measured in setup)
const WD = [25, 30, 35, 40, 47.5, 55, 62.5, 70, 77.5, 85, 92.5, 100, 110, 120, 130, 140, 151];
const WG = [100, 250, 400, 550, 700, 850, 1000];
const OP = [8, 16, 32, 64, 144];
const OPL = OP.map(Math.log);
const MS = 300;                                     // measuring size (px)
const STRETCH = [['ultra-condensed', 50], ['extra-condensed', 62.5], ['condensed', 75], ['semi-condensed', 87.5],
  ['normal', 100], ['semi-expanded', 112.5], ['expanded', 125], ['extra-expanded', 150]];
const SBW = [100, 400, 700, 1000];
function bracket(xs, v) {
  if (v <= xs[0]) return [0, 0];
  for (let i = 0; i < xs.length - 1; i++) if (v <= xs[i + 1]) return [i, (v - xs[i]) / (xs[i + 1] - xs[i])];
  return [xs.length - 2, 1];
}
const vstr = (wd, wg, op, gr) => `"wdth" ${wd.toFixed(2)}, "wght" ${wg.toFixed(1)}, "opsz" ${op.toFixed(1)}, "GRAD" ${gr.toFixed(1)}, "slnt" 0`;

defineDemo({
  id: '53-swiss-grid',
  title: '격자 위의 리듬',
  tech: '가변 폰트 폭 맞춤(wdth·wght·opsz·GRAD) · 모듈 그리드 조판',
  duration: D,
  background: PAPER,
  async setup(api) {
    const { stage } = api;
    const KTEXT = '격자 위에서글자도숨을 쉰다넷 — 들이쉬고머금고내쉬고비운다';
    await fontReady(`400 100px ${RF}`, 'INHALEXODBRTGMPU0123456789/·');
    await fontReady(`800 100px ${KR}`, KTEXT);
    const attrs = api.headless ? { willReadFrequently: true } : undefined;
    const g = api.canvas({ z: 0, attrs }).ctx;     // grid, rules, flashes, box, dot, beat squares
    const layer = api.layer('div', { z: 1 });
    layer.style.pointerEvents = 'none';
    const mk = (text, css, parent = layer) => {
      const e = document.createElement('div');
      e.textContent = text;
      e.style.cssText = `position:absolute;left:0;top:0;white-space:pre;line-height:1;${css}`;
      parent.appendChild(e);
      return e;
    };

    // ------------------------------------------------------------ measure: advance of each word over the axes
    const sc = stage.getBoundingClientRect().width / 1080 || 1;
    const meas = mk('', 'visibility:hidden');
    const cells = [];
    for (const W of WORDS) {
      W.adv = new Float64Array(WG.length * OP.length * WD.length);
      WG.forEach((wg, gi) => OP.forEach((op, oi) => WD.forEach((wd, wi) => {
        const d = mk(W.name, `font-family:${RF};font-size:${MS}px;font-variation-settings:${vstr(wd, wg, op, 0)}`, meas);
        const m = document.createElement('span');
        m.style.cssText = 'display:inline-block;width:0;height:0';
        d.appendChild(m);
        cells.push({ W, i: (gi * OP.length + oi) * WD.length + wi, d, m });
      })));
    }
    // one layout for all of them; the zero-size marker sits on the baseline right after the last letter
    let baseEm = 0.93;
    for (const c of cells) {
      const a = c.d.getBoundingClientRect(), b = c.m.getBoundingClientRect();
      c.W.adv[c.i] = (b.left - a.left) / sc / MS;
      baseEm = (b.top - a.top) / sc / MS;
    }
    // Pretendard's baseline inside a line-height:1 box
    const kd = mk('가', `font-family:${KR};font-size:${MS}px;font-variation-settings:"wght" 400`, meas);
    const km = document.createElement('span'); km.style.cssText = 'display:inline-block;width:0;height:0'; kd.appendChild(km);
    const baseKR = (km.getBoundingClientRect().top - kd.getBoundingClientRect().top) / sc / MS;
    meas.remove();
    if (!(baseEm > 0.5 && baseEm < 1.3)) baseEm = 0.93;

    // side bearings of the first / last letter (ink) and the cap height, from canvas ink bounds
    const cv = document.createElement('canvas').getContext('2d');
    const canStretch = 'fontStretch' in cv;
    const ink1 = (font, stretch, ch) => {
      cv.font = font;
      if (canStretch) cv.fontStretch = stretch;
      const m = cv.measureText(ch);
      return m;
    };
    const SB = {};
    for (const ch of new Set(WORDS.flatMap((W) => [W.name[0], W.name[W.name.length - 1]]))) {
      SB[ch] = STRETCH.map(([kw]) => SBW.map((w) => {
        const m = ink1(`${w} ${MS}px ${RF}`, kw, ch);
        const l = -m.actualBoundingBoxLeft / MS, r = (m.width - m.actualBoundingBoxRight) / MS;
        return [Number.isFinite(l) ? l : 0.06, Number.isFinite(r) ? r : 0.06];
      }));
    }
    const capM = ink1(`500 ${MS}px ${RF}`, 'normal', 'H');
    const CAPR = capM.actualBoundingBoxAscent > 0 ? capM.actualBoundingBoxAscent / MS : 0.711;
    const SX = STRETCH.map((s) => s[1]);
    /** side bearing (em) of ch at wdth wd, wght wg: bilinear; below 50 % it follows the 50→62.5 slope */
    const sbAt = (ch, wd, wg, side) => {
      const T = SB[ch];
      const [wi, wf] = bracket(SBW, wg);
      const at = (si) => lerp(T[si][wi][side], T[si][wi + 1][side], wf);
      if (wd < SX[0]) return Math.max(0, at(0) + (at(1) - at(0)) * (wd - SX[0]) / (SX[1] - SX[0]));
      const [si, sf] = bracket(SX, wd);
      return lerp(at(si), at(si + 1), sf);
    };
    const row = new Float64Array(WD.length);
    /** solve wdth (and the size) so the word's ink spans exactly `target` px at cap height CAP */
    const fit = (W, target, wg, op) => {
      const [gi, gf] = bracket(WG, wg), [oi, of] = bracket(OPL, Math.log(op));
      const A = W.adv, n = WD.length, idx = (a, b, w) => (a * OP.length + b) * n + w;
      for (let w = 0; w < n; w++) {
        const a0 = lerp(A[idx(gi, oi, w)], A[idx(gi, oi + 1, w)], of), a1 = lerp(A[idx(gi + 1, oi, w)], A[idx(gi + 1, oi + 1, w)], of);
        row[w] = lerp(a0, a1, gf);
      }
      const f = W.name[0], l = W.name[W.name.length - 1], S0 = CAP / CAPR;
      let wd = 100, lsb = 0, rsb = 0;
      for (let it = 0; it < 3; it++) {
        lsb = sbAt(f, wd, wg, 0); rsb = sbAt(l, wd, wg, 1);
        const need = target / S0 + lsb + rsb;
        if (need <= row[0]) wd = WD[0];
        else if (need >= row[n - 1]) wd = WD[n - 1];
        else {
          let i = 0;
          while (i < n - 2 && row[i + 1] < need) i++;
          wd = WD[i] + (need - row[i]) / Math.max(1e-9, row[i + 1] - row[i]) * (WD[i + 1] - WD[i]);
        }
      }
      lsb = sbAt(f, wd, wg, 0); rsb = sbAt(l, wd, wg, 1);
      const [wi, wf] = bracket(WD, wd);
      const adv = lerp(row[wi], row[wi + 1], wf);
      const S = target / Math.max(0.05, adv - lsb - rsb);     // = S0 unless wdth saturated
      return { wd, S, lsb };
    };

    // ------------------------------------------------------------ elements
    // the three words
    for (const W of WORDS) W.el = mk(W.name, `font-family:${RF};opacity:0;will-change:transform`);
    // header: small caps line on the grid
    const HEAD = [
      { text: 'BOX BREATHING', c: 1 }, { text: '4 · 4 · 4 · 4', c: 3 }, { text: '120 BPM', c: 5 }, { text: '00/16', c: 6, count: true },
    ].map((h) => ({ ...h, el: mk(h.text, `font-family:${RF};font-size:22px;letter-spacing:0.06em;font-variation-settings:${vstr(100, 640, 22, 0)};font-variant-numeric:tabular-nums;color:${INK}`) }));
    // Korean: three lines set to the height of the breathing box (ink top = box top, last ink bottom = box bottom)
    const KL = [{ text: '격자 위에서', w: 300, at: tb(5) }, { text: '글자도', w: 800, at: tb(9) }, { text: '숨을 쉰다', w: 800, at: tb(11) }];
    const mA = ink1(`800 ${MS}px ${KR}`, 'normal', '격자글숨'), mD = ink1(`800 ${MS}px ${KR}`, 'normal', '숨을 쉰다');
    const asc = mA.actualBoundingBoxAscent > 0 ? mA.actualBoundingBoxAscent / MS : 0.8;
    const desc = Number.isFinite(mD.actualBoundingBoxDescent) ? Math.max(0, mD.actualBoundingBoxDescent / MS) : 0.05;
    const KF = BOX.s / (asc + 2 * 1.24 + desc), KLH = 1.24 * KF;
    KL.forEach((k, i) => {
      const m = ink1(`${k.w} ${MS}px ${KR}`, 'normal', k.text);
      const lsb = Number.isFinite(m.actualBoundingBoxLeft) ? -m.actualBoundingBoxLeft / MS : 0;
      k.base = BOX.y + asc * KF + i * KLH;
      k.x = MARGIN - lsb * KF;
      k.el = mk(k.text, `font-family:${KR};font-size:${KF.toFixed(2)}px;color:${INK};opacity:0`);
      k.el.style.transform = `translate(${k.x.toFixed(2)}px, ${(k.base - baseKR * KF).toFixed(2)}px)`;
    });
    // the breathing instructions (columns 1–2), one line per phase
    const SMALL = ['넷 — 들이쉬고', '넷 — 머금고', '넷 — 내쉬고', '넷 — 비운다'].map((text, i) => {
      const m = ink1(`500 28px ${KR}`, 'normal', text);
      const lsb = Number.isFinite(m.actualBoundingBoxLeft) ? -m.actualBoundingBoxLeft : 0;
      const el = mk(text, `font-family:${KR};font-size:28px;color:${INK};opacity:0`);
      el.style.transform = `translate(${(MARGIN - lsb).toFixed(2)}px, ${(1362 + 46 * i).toFixed(2)}px)`;
      return el;
    });
    // phase labels under the beat squares (columns 3–6) and on the sides of the box
    const PH = ['IN', 'HOLD', 'OUT', 'HOLD'];
    const PHL = PH.map((text, i) => {
      const el = mk(text, `font-family:${RF};font-size:20px;letter-spacing:0.08em;font-variation-settings:${vstr(100, 650, 20, 0)};opacity:0`);
      el.style.transform = `translate(${colL(3 + i)}px, 1410px)`;
      return el;
    });
    const SIDE = [
      { text: 'IN', x: BOX.x - 12, y: BOX.y + BOX.s / 2, r: -90 }, { text: 'HOLD', x: BOX.x + BOX.s / 2, y: BOX.y - 12, r: 0 },
      { text: 'OUT', x: BOX.x + BOX.s + 12, y: BOX.y + BOX.s / 2, r: 90 }, { text: 'HOLD', x: BOX.x + BOX.s / 2, y: BOX.y + BOX.s + 12, r: 0, below: true },
    ].map((s) => {
      const el = mk(s.text, `font-family:${RF};font-size:15px;letter-spacing:0.12em;font-variation-settings:${vstr(100, 600, 15, 0)};color:${INK};opacity:0;transform-origin:50% 100%`);
      return { ...s, el };
    });
    // the count inside the box: big figures sliding on the beat, clipped by the box
    const numBox = mk('', `left:${BOX.x + 2}px;top:${BOX.y + 2}px;width:${BOX.s - 4}px;height:${BOX.s - 4}px;overflow:hidden`);
    const NUMCAP = 176, NS = NUMCAP / CAPR, numBase = BOX.s / 2 - 2 + NUMCAP / 2;
    const digitInk = {};
    for (const dch of '1234') { const m = ink1(`900 ${MS}px ${RF}`, 'normal', dch); digitInk[dch] = ((m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2) / MS; }
    const nums = [0, 1].map(() => mk('', `font-family:${RF};font-size:${NS.toFixed(2)}px;font-variation-settings:${vstr(100, 900, 144, 0)};color:${INK};opacity:0`, numBox));
    // the base band (the harness caption sits on it)
    const band = mk('', `left:0;top:${BAND}px;width:1080px;height:${1920 - BAND}px;background:${INK}`);
    band.style.zIndex = '2';

    // ------------------------------------------------------------ per frame
    this.render = (t) => {
      const n = beatsAt(t);
      const phase = n >= 1 ? Math.floor((n - 1) / 4) : -1;
      const done = t >= tb(16) + BEAT;
      // ======== canvas
      g.clearRect(0, 0, 1080, 1920);
      const gridA = sm(t, 0.0, 0.3) * (1 - sm(t, 8.6, 9.3));
      if (gridA > 0) {
        // baseline grid
        g.strokeStyle = ink(0.05 * gridA * sm(t, 0.1, 0.7)); g.lineWidth = 1; g.beginPath();
        for (let y = 40; y < BAND; y += 24) { g.moveTo(0, y + 0.5); g.lineTo(1080, y + 0.5); }
        g.stroke();
        // column edges drop in, left to right on eighth notes
        g.strokeStyle = ink(0.2 * gridA); g.beginPath();
        for (let c = 1; c <= 6; c++) for (const [k, x] of [[0, colL(c)], [1, colR(c)]]) {
          const p = ease.outExpo(k01(t, 0.04 * (2 * (c - 1) + k), 0.04 * (2 * (c - 1) + k) + 0.4));
          if (p > 0) { g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, BAND * p); }
        }
        g.stroke();
      }
      // span flashes: the columns a block has just snapped to
      for (const W of WORDS) {
        const s = wordState(W, t);
        W.s = s;
        if (!s || s.flash <= 0.01) continue;
        g.fillStyle = red(0.10 * s.flash);
        g.fillRect(colL(s.span[0]), ROWS[W.row] - 12, colR(s.span[1]) - colL(s.span[0]), CAP + 24);
      }
      // rules wipe in
      RULES.forEach((r, i) => {
        const p = oc(t, 0.35 + 0.12 * i, 0.8 + 0.12 * i);
        if (p <= 0) return;
        g.fillStyle = INK; g.fillRect(MARGIN, r.y, (colR(6) - MARGIN) * p, r.w);
      });
      // the breathing box: outline, the red trail of the path walked so far, the dot
      {
        const pb = oc(t, 0.55, 0.95);
        const P = [[BOX.x, BOX.y + BOX.s], [BOX.x, BOX.y], [BOX.x + BOX.s, BOX.y], [BOX.x + BOX.s, BOX.y + BOX.s]];
        const at = (s) => { const side = Math.min(3, Math.floor(s / 4)), f = (s - 4 * side) / 4, a = P[side], b = P[(side + 1) % 4]; return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]; };
        if (pb > 0) {
          g.strokeStyle = ink(0.28); g.lineWidth = 1; g.beginPath();
          const S = 16 * pb;
          g.moveTo(P[0][0] + 0.5, P[0][1] + 0.5);
          for (let s = 1; s <= Math.floor(S); s++) { const q = at(s); g.lineTo(q[0] + 0.5, q[1] + 0.5); }
          const q = at(S); g.lineTo(q[0] + 0.5, q[1] + 0.5); g.stroke();
          // corner ticks and quarter marks
          g.fillStyle = ink(0.5 * pb);
          for (let s = 0; s < 16; s++) { const c = at(s), big = s % 4 === 0; g.fillRect(c[0] - (big ? 3 : 1.5), c[1] - (big ? 3 : 1.5), big ? 6 : 3, big ? 6 : 3); }
        }
        // dot position along the perimeter: one quarter-side per beat, a snappy hop that overshoots along its side
        let s = 0, hopV = 0, dir = [0, -1], c = at(0);
        if (n >= 1) {
          const p = clamp((t - tb(n)) / 0.16), h = ease.outBack(p, 1.3), a0 = at(n - 1), a1 = at(n);
          s = n - 1 + Math.min(1, h);
          c = [lerp(a0[0], a1[0], h), lerp(a0[1], a1[1], h)];
          hopV = Math.sin(Math.PI * p);
          dir = [(a1[0] - a0[0]) / (BOX.s / 4), (a1[1] - a0[1]) / (BOX.s / 4)];
          g.strokeStyle = RED; g.lineWidth = 3; g.lineJoin = 'miter'; g.beginPath();
          g.moveTo(P[0][0], P[0][1]);
          for (let k = 4; k < s; k += 4) { const q = at(k); g.lineTo(q[0], q[1]); }
          if (s >= 16) g.closePath(); else { const q = at(s); g.lineTo(q[0], q[1]); }
          g.stroke();
        }
        const appear = ease.outBack(clamp((t - 0.5) / 0.3), 2);
        if (appear > 0) {
          const r = 15 * appear, st = 1 + 0.55 * hopV * calm(t);
          g.save(); g.translate(c[0], c[1]); g.rotate(Math.atan2(dir[1], dir[0]));
          g.fillStyle = RED; g.beginPath(); g.ellipse(0, 0, r * st, r / st, 0, 0, Math.PI * 2); g.fill(); g.restore();
          // downbeats: a ring opens from the dot
          for (const k of [1, 5, 9, 13]) {
            const a = t - tb(k);
            if (a < 0 || a > 0.5) continue;
            g.strokeStyle = red(0.8 * (1 - a / 0.5)); g.lineWidth = 2;
            g.beginPath(); g.arc(c[0], c[1], 15 + 70 * ease.outCubic(a / 0.5), 0, Math.PI * 2); g.stroke();
          }
        }
      }
      // beat squares (columns 3–6, one column per phase)
      {
        const a = oc(t, 0.7, 1.0);
        if (a > 0) {
          for (let k = 1; k <= 16; k++) {
            const x = colL(3 + Math.floor((k - 1) / 4)) + ((k - 1) % 4) * 36, y = 1362, sz = 28;
            if (t < tb(k)) { g.strokeStyle = ink(0.4 * a); g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, sz - 1, sz - 1); continue; }
            const cur = k === n && !done;
            const pop = cur ? 1 + 0.18 * Math.exp(-(t - tb(k)) / 0.08) : 1;
            g.fillStyle = cur ? RED : INK;
            const z = sz * pop;
            g.fillRect(x + (sz - z) / 2, y + (sz - z) / 2, z, z);
          }
        }
      }

      // ======== type
      for (const W of WORDS) {
        const s = W.s, e = W.el;
        if (!s) { e.style.opacity = '0'; continue; }
        const f = fit(W, s.R - s.L, s.wght, s.opsz);
        const base = ROWS[W.row] + CAP;
        e.style.opacity = '1';
        e.style.fontSize = `${f.S.toFixed(3)}px`;
        e.style.fontVariationSettings = vstr(f.wd, s.wght, s.opsz, s.grad);
        e.style.transform = `translate(${(s.L - f.lsb * f.S).toFixed(2)}px, ${(base - baseEm * f.S).toFixed(2)}px)`;
        // entry: wiped up from the baseline
        e.style.clipPath = s.wipe < 1 ? `inset(${Math.max(0, baseEm * f.S - s.wipe * (CAPR * f.S + 12)).toFixed(2)}px 0 0 0)` : 'none';
      }
      // header (the counter ticks)
      HEAD.forEach((h, i) => {
        const a = oc(t, 0.3 + 0.05 * i, 0.6 + 0.05 * i);
        h.el.style.opacity = a.toFixed(3);
        h.el.style.transform = `translate(${colL(h.c)}px, ${(96 + 10 * (1 - a)).toFixed(2)}px)`;
        if (h.count) { const txt = `${String(n).padStart(2, '0')}/16`; if (h.el.textContent !== txt) h.el.textContent = txt; }
      });
      // Korean lines: weight swells in from a hairline, wiped from the left, breathing a little on each beat
      KL.forEach((k) => {
        const a = t - k.at;
        if (a < 0) { k.el.style.opacity = '0'; return; }
        const w = lerp(45, k.w, ease.outCubic(clamp(a / 0.45))) + 70 * (gradPulse(t, k.at) / 130);
        k.el.style.opacity = '1';
        k.el.style.fontVariationSettings = `"wght" ${w.toFixed(1)}`;
        const wp = ease.outCubic(clamp(a / 0.3));
        k.el.style.clipPath = wp < 1 ? `inset(0 ${(100 * (1 - wp)).toFixed(2)}% 0 0)` : 'none';
      });
      // instructions and phase labels: the active phase is marked
      SMALL.forEach((el, i) => {
        const a = oc(t, 0.6 + 0.06 * i, 0.95 + 0.06 * i);
        const act = !done && phase === i;
        el.style.opacity = (a * (done ? 1 : act ? 1 : 0.34)).toFixed(3);
        el.style.fontVariationSettings = `"wght" ${act ? 700 : done ? 500 : 400}`;
      });
      PHL.forEach((el, i) => {
        const a = oc(t, 0.75 + 0.05 * i, 1.0 + 0.05 * i);
        el.style.opacity = a.toFixed(3);
        el.style.color = !done && phase === i ? RED : INK;
      });
      SIDE.forEach((sd, i) => {
        const a = oc(t, 0.8 + 0.05 * i, 1.1 + 0.05 * i) * (!done && phase === i ? 1 : 0.5);
        sd.el.style.opacity = a.toFixed(3);
        sd.el.style.color = !done && phase === i ? RED : INK;
        sd.el.style.transform = `translate(${sd.x}px, ${sd.y}px) translate(-50%, ${sd.below ? 0 : -100}%) rotate(${sd.r}deg)`;
      });
      // the count: the new figure rises from below, the old one leaves upward
      nums.forEach((el) => { el.style.opacity = '0'; });
      if (n >= 1) {
        const p = ease.outBack(clamp((t - tb(n)) / 0.2), 1.1) * 1, q = ease.outCubic(clamp((t - tb(n)) / 0.2));
        const show = (el, k, dy, op) => {
          const ch = String(((k - 1) % 4) + 1);
          if (el.textContent !== ch) el.textContent = ch;
          const x = (BOX.s - 4) / 2 - digitInk[ch] * NS - 0;
          el.style.opacity = op.toFixed(3);
          el.style.fontVariationSettings = vstr(100, 900, 144, gradPulse(t, tb(1)));
          el.style.transform = `translate(${x.toFixed(2)}px, ${(numBase - baseEm * NS + dy).toFixed(2)}px)`;
        };
        show(nums[0], n, (1 - p) * 120, q);
        if (n >= 2 && q < 1) show(nums[1], n - 1, -q * 120, 1 - q);
      }
    };
  },
  frame(t) {
    this.render(t);
  },
});
