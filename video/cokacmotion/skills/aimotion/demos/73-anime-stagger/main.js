/*
 * 73 · 점들의 합창 — anime.js 4: grid staggers, SVG line drawing (createDrawable), shape morph (morphTo),
 * motion paths (createMotionPath), springs (createSpring), all on one paused timeline seeked by t.
 *
 * A Bauhaus score poster for a choir of 21 × 25 dots at 96 BPM (one beat = 625 ms, 16 beats = 10 s).
 *   b0–b1   the choir takes its places (stagger from the top-left corner); rules and headline draw in
 *   b2–b5   count-in 1 · 2 · 3 · 4 — each numeral wipes in from the side the conductor's baton moves to
 *           (4/4 beat pattern: down, left, right, up) while the baton draws the pattern (drawable + motion path)
 *   b6–b11  the chorus: a red burst from the centre, squares turning from a corner, a hop from the other
 *           corner, ripples from a moving point, fortissimo stripes; a yellow triangle morphs to a red square
 *           and a cobalt circle on the downbeats (morphTo, multiply overprint)
 *   b12–b15 cut-off, then unison: the whole field gathers into one halftone sphere — one 점 made of dots
 *
 * anime does not write the dots directly. Every dot is a plain object with one property per gesture
 * (intro, on0…, burst, rot1, hop, m0…, calm, gath …); each property is tweened exactly once on the timeline,
 * with its delay from stagger({ grid, from }). frame(t) seeks the timeline and composes those layers into
 * one transform / colour / radius per dot. One tween per property keeps the seek exact in both directions
 * (no two tweens hand a value to each other), and layering gives what a single property could not:
 * a ripple can ride on top of a numeral, a colour band on top of a turn.
 */
import { defineDemo, clamp } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import {
  createTimeline, stagger, createDrawable, morphTo, createMotionPath, createSpring,
} from '../node_modules/animejs/dist/bundles/anime.esm.min.js';

const D = 10;
const BEAT = 625;                              // ms — 96 BPM; anime timelines count in milliseconds
const B = (n) => n * BEAT;                     // beat number → timeline ms
const COLS = 21, ROWS = 25, GAP = 48;          // the choir
const N = COLS * ROWS;
const X0 = 60, Y0 = 432;                       // first cell centre (stage px)
const CX = X0 + ((COLS - 1) / 2) * GAP, CY = Y0 + ((ROWS - 1) / 2) * GAP;   // 540, 1008
const DOT = 44;                                // a dot at scale 1 (cells are 48: 4 px of paper between)
const BASE = 0.3;                              // resting scale
const GRID = [COLS, ROWS];

const PAPER = '#EEE6D3';
const INK = [22, 21, 20], RED = [222, 58, 33], COBALT = [33, 71, 182], YELLOW = [244, 184, 20];
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
const MONO = `"${FONTS.jetbrainsMono.family}", monospace`;
const GROT = `"${FONTS.bricolage.family}", sans-serif`;

// ---------------------------------------------------------------- eases (pure functions of progress)
// anime calls a function-valued parameter once per target, so a custom ease goes in wrapped: ease: () => fn
const fn = (f) => () => f;
const smooth01 = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
/** a pulse that returns to where it started: quick attack over the first `a` of the time, soft release */
const bump = (a) => (p) => (p <= 0 || p >= 1 ? 0 : p < a ? 1 - (1 - p / a) ** 3 : 1 - smooth01((p - a) / (1 - a)));
/** a hop: rises decelerating, falls accelerating (a parabola in time), lands where it took off */
const hopEase = (p) => (p <= 0 || p >= 1 ? 0 : p < 0.42 ? 1 - (1 - p / 0.42) ** 2 : 1 - ((p - 0.42) / 0.58) ** 2);
const inQuad = (u) => u * u;
const outCubic = (u) => 1 - (1 - u) ** 3;
const outInQuad = (u) => (u < 0.5 ? (1 - (1 - 2 * u) ** 2) / 2 : (1 + (2 * u - 1) ** 2) / 2);

// ---------------------------------------------------------------- the conductor's 4/4 pattern (local coords)
// segments: top → ictus 1 (down) → 2 (left) → 3 (right) → 4 (up) → top
const COND = { x: 744, y: 130 };
const COND_SEGS = [
  'M140,14 C140,70 141,140 140,182',
  'C140,138 74,112 34,152',
  'C92,122 194,120 248,152',
  'C232,110 174,72 152,58',
  'C142,50 140,32 140,14',
];
const COND_D = COND_SEGS.join(' ');
const ICTUS_LABEL = [[154, 206], [10, 146], [258, 146], [166, 60]];   // where the numerals 1–4 sit

// ---------------------------------------------------------------- the morphing shape (stage coords)
const R3 = Math.sqrt(3);
const TRI = `M${CX},${CY - 372} L${CX + 186 * R3},${CY + 186} L${CX - 186 * R3},${CY + 186} Z`;
const SQR = `M${CX},${CY - 282} L${CX + 282},${CY - 282} L${CX + 282},${CY + 282} L${CX - 282},${CY + 282} L${CX - 282},${CY - 282} Z`;
const CIR = `M${CX},${CY - 330} A330,330 0 1,1 ${CX},${CY + 330} A330,330 0 1,1 ${CX},${CY - 330} Z`;

// the orbit the moving point travels in the chorus, and when it sends out its four ripples
const ORBIT_R = 384;
const ORBIT = `M${CX},${CY - ORBIT_R} A${ORBIT_R},${ORBIT_R} 0 1,1 ${CX},${CY + ORBIT_R} A${ORBIT_R},${ORBIT_R} 0 1,1 ${CX},${CY - ORBIT_R} Z`;
const ORBIT_T0 = B(8.75), ORBIT_DUR = B(2.5), ORBIT_TURNS = 1.1;
const M_AT = [0, 1, 2, 3].map((j) => B(9) + j * BEAT / 2);

defineDemo({
  id: '73-anime-stagger',
  title: '점들의 합창',
  tech: 'anime.js 4 · 그리드 스태거 · SVG 드로잉/모프',
  duration: D,
  background: PAPER,
  async setup({ stage, layer }) {
    await Promise.all([
      fontReady(`800 160px "${FONTS.bricolage.family}"`, 'CHORUS'),
      fontReady(`500 22px "${FONTS.jetbrainsMono.family}"`, 'NO.73 FOR VOICES 96BPM 4/4 BAR BEAT FINE 0123456789·'),
      fontReady(`900 300px "${FONTS.anybody.family}"`, '1234'),
    ]);

    // ============================================================ the numerals as dot coverage
    // each count-in numeral is set in Anybody (OFL) at wght 900, expanded, on a 16 px-per-cell raster and
    // averaged per cell: a dot's share of the numeral is its coverage, so edges come out as half-size dots
    const SS = 16;
    const cov = [1, 2, 3, 4].map((n) => {
      const c = document.createElement('canvas');
      c.width = COLS * SS; c.height = ROWS * SS;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.font = `900 300px "${FONTS.anybody.family}"`;
      try { g.fontStretch = 'expanded'; } catch (e) { /* older canvas: normal width */ }
      const m = g.measureText(String(n));
      const iw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, ih = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const k = Math.min((14.6 * SS) / iw, (21.6 * SS) / ih);
      g.setTransform(k, 0, 0, k, c.width / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2 * k,
        c.height / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 * k);
      g.fillStyle = '#000';
      g.fillText(String(n), 0, 0);
      const px = g.getImageData(0, 0, c.width, c.height).data;
      const out = new Float32Array(N);
      for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
        let s = 0;
        for (let y = 2; y < SS - 2; y++) for (let x = 2; x < SS - 2; x++) s += px[((r * SS + y) * c.width + col * SS + x) * 4 + 3];
        out[r * COLS + col] = smooth01((s / ((SS - 4) * (SS - 4) * 255) - 0.12) / 0.62);
      }
      return out;
    });

    // ============================================================ the final sphere: halftone shading
    // a sphere lit from the upper left, ink ∝ (1 − diffuse); dot area ∝ ink so scale ∝ √ink; plus its shadow
    const RS = 8.3 * GAP;
    const L = (() => { const v = [-0.46, -0.62, 0.64], n = Math.hypot(...v); return v.map((x) => x / n); })();
    const sphere = new Float32Array(N);
    const stripe = [];
    const dots = [];
    for (let i = 0; i < N; i++) {
      const col = i % COLS, row = (i / COLS) | 0;
      const x = X0 + col * GAP, y = Y0 + row * GAP;
      const dx = (x - CX) / RS, dy = (y - CY) / RS, r2 = dx * dx + dy * dy, dist = Math.sqrt(r2) * RS;
      let s = 0;
      if (r2 < 1.2) {
        const nz = Math.sqrt(Math.max(0, 1 - Math.min(r2, 1)));
        const diff = Math.max(0, dx * L[0] + dy * L[1] + nz * L[2]);
        const ink = 0.1 + 0.9 * Math.pow(1 - diff, 1.25);
        s = Math.sqrt(ink) * clamp((RS - dist) / GAP + 0.55);
      }
      // the cast shadow, lower right, on the ground line
      const sx = (x - (CX + 150)) / 330, sy = (y - (CY + RS + 52)) / 64;
      const sh = 1 - (sx * sx + sy * sy);
      if (sh > 0 && s < 0.05) s = 0.5 * smooth01(sh * 2.2);
      sphere[i] = s;
      // fortissimo stripes: diagonal bands, red / cobalt / yellow
      stripe.push(Math.floor((col + row) / 2.6) % 3);
      dots.push({
        intro: 0, prep: 0, on0: 0, on1: 0, on2: 0, on3: 0, off0: 0, off1: 0, off2: 0, off3: 0,
        burst: 0, sq: 0, grow: 0, rot1: 0, cob: 0, hop: 0, yel: 0, m0: 0, m1: 0, m2: 0, m3: 0,
        ff: 0, rot2: 0, calm: 0, gath: 0,
      });
    }

    // ============================================================ layers
    const field = layer('div', { z: 1 });
    field.style.contain = 'strict';
    const els = [];
    for (let i = 0; i < N; i++) {
      const e = document.createElement('i');
      const x = X0 + (i % COLS) * GAP, y = Y0 + ((i / COLS) | 0) * GAP;
      e.style.cssText = `position:absolute;left:${x - DOT / 2}px;top:${y - DOT / 2}px;width:${DOT}px;height:${DOT}px;border-radius:50%;background:${hex(INK)};transform:scale(0)`;
      field.appendChild(e);
      els.push(e);
    }

    // the overprinted shape (multiply: ink stays ink, paper takes the colour)
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs, parent) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    };
    const print = layer('svg', { z: 2 });
    print.style.mixBlendMode = 'multiply';
    const shapeG = mk('g', {}, print);
    shapeG.style.cssText = `transform-box:view-box;transform-origin:${CX}px ${CY}px;transform:scale(0)`;
    // two stacked paths, so that each property of each element is tweened exactly once: B (square → circle)
    // sits under A (triangle → square) and takes over at b10 with the same outline
    const shapeB = mk('path', { d: SQR, fill: hex(RED), opacity: 0 }, shapeG);
    const shape = mk('path', { d: TRI, fill: hex(YELLOW) }, shapeG);
    const hidden = mk('g', { visibility: 'hidden' }, print);
    const sqT = mk('path', { d: SQR }, hidden), ciT = mk('path', { d: CIR }, hidden);
    const orbitP = mk('path', { d: ORBIT, fill: 'none' }, hidden);

    // the top layer: rules, the conductor's diagram, the orbiting point
    const top = layer('svg', { z: 3 });
    const rules = [
      mk('path', { d: 'M60,110 H1020', stroke: hex(INK), 'stroke-width': 3, fill: 'none' }, top),
      mk('path', { d: 'M60,352 H1020', stroke: hex(INK), 'stroke-width': 3, fill: 'none' }, top),
      mk('path', { d: `M60,${Y0 - 33} H1020`, stroke: hex(INK), 'stroke-width': 1.2, fill: 'none', opacity: 0.55 }, top),
    ];
    const cond = mk('g', { transform: `translate(${COND.x},${COND.y})` }, top);
    const condPath = mk('path', { d: COND_D, fill: 'none', stroke: hex(RED), 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, cond);
    // the draw-out is a paper-coloured stroke drawn over the line (one draw tween per element; see NOTES)
    const eraser = mk('path', { d: COND_D, fill: 'none', stroke: PAPER, 'stroke-width': 11, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, cond);
    mk('path', { d: COND_D, fill: 'none', stroke: hex(INK), 'stroke-width': 1, 'stroke-dasharray': '2 6', opacity: 0.35 }, cond);
    const nums = ICTUS_LABEL.map(([x, y], k) => {
      const tx = mk('text', { x, y, 'font-size': 22, 'font-weight': 600, fill: hex(INK), opacity: 0 }, cond);
      tx.style.fontFamily = MONO;
      tx.textContent = String(k + 1);
      return tx;
    });
    const baton = mk('circle', { cx: 0, cy: 0, r: 10, fill: hex(INK) }, cond);
    baton.style.transform = 'translateX(140px) translateY(14px)';

    const orbitMove = mk('g', {}, top);
    orbitMove.style.transform = `translateX(${CX}px) translateY(${CY - ORBIT_R}px)`;
    const orbitIn = mk('g', {}, orbitMove), orbitOut = mk('g', {}, orbitIn);
    orbitIn.style.transform = 'scale(0)';
    mk('circle', { r: 26, fill: 'none', stroke: hex(INK), 'stroke-width': 4 }, orbitOut);
    mk('circle', { r: 9, fill: hex(RED) }, orbitOut);

    // typography (Latin only in these faces): small mono labels, the headline, the live bar counter
    const type = layer('div', { z: 4 });
    const label = (text, css) => {
      const e = document.createElement('div');
      e.textContent = text;
      e.style.cssText = `position:absolute;font:500 21px/1 ${MONO};letter-spacing:.14em;color:${hex(INK)};white-space:pre;opacity:0;${css}`;
      type.appendChild(e);
      return e;
    };
    const labels = [
      label('NO. 73', 'left:60px;top:66px'),
      label(`FOR ${N} VOICES`, 'right:60px;top:66px;text-align:right'),
      label('96 BPM', 'left:60px;top:366px'),
      label('4/4', 'left:300px;top:366px'),
      label('BAR 1 · BEAT 1', 'right:60px;top:366px;text-align:right'),
    ];
    const counter = labels[4];
    const head = document.createElement('div');
    head.style.cssText = `position:absolute;left:52px;top:128px;white-space:nowrap;font:800 180px/1 ${GROT};font-variation-settings:"opsz" 96;letter-spacing:-.02em;color:${hex(INK)}`;
    const letters = [...'CHORUS'].map((ch) => {
      const w = document.createElement('span');
      w.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding:0 .01em';
      const s = document.createElement('span');
      s.style.cssText = 'display:inline-block;transform:translateY(105%)';
      s.textContent = ch;
      w.appendChild(s);
      head.appendChild(w);
      return s;
    });
    type.appendChild(head);
    // fit the headline between the margin and the conductor's diagram (layout px, not affected by the stage scale)
    const fitW = COND.x - 40 - 52;
    head.style.fontSize = `${Math.min(220, 180 * fitW / Math.max(1, head.offsetWidth))}px`;
    head.style.top = `${330 - head.offsetHeight * 0.96}px`;

    // the dark band under the caption, with a 16-beat ticker
    const band = layer('div', { z: 5 });
    band.style.cssText += `;top:1636px;height:${1920 - 1636}px;background:${hex(INK)}`;
    const ticks = [];
    for (let k = 0; k < 16; k++) {
      const e = document.createElement('div');
      const x = 60 + k * 56 + Math.floor(k / 4) * 24;
      e.style.cssText = `position:absolute;left:${x}px;top:26px;width:48px;height:12px;box-sizing:border-box;border:2px solid ${PAPER}`;
      band.appendChild(e);
      ticks.push(e);
    }

    // ============================================================ the score
    const tl = createTimeline({ autoplay: false, defaults: { ease: 'linear' } });
    const st = (each, from, extra = {}) => stagger(each, { grid: GRID, from, ...extra });

    // b0 — rules draw, the choir takes its places from the top-left corner, the headline rises
    tl.add(createDrawable(rules), { draw: ['0 0', '0 1'], duration: 900, ease: 'inOutQuart', delay: stagger(140) }, 0);
    tl.add(dots, { intro: [0, 1], duration: 560, ease: 'outBack(1.7)', delay: st(15, 'first') }, 0);
    tl.add(letters, { translateY: ['105%', '0%'], duration: 820, ease: 'outExpo', delay: stagger(55) }, 160);
    tl.add(labels, { opacity: [0, 1], translateY: [10, 0], duration: 520, ease: 'outCubic', delay: stagger(80) }, 320);

    // b1 — the conductor breathes in (upbeat): a soft swell from the centre
    tl.add(dots, { prep: [0, 1], duration: 620, ease: fn(bump(0.35)), delay: st(13, 'center') }, B(1));

    // b2–b5 — count-in. Numeral k wipes in from the side the baton travels to; the next count (or the
    // chorus burst) wipes it out along the same front
    const ORIGINS = [[0.5, 0], [1, 0.5], [0, 0.5], [0.5, 1]];
    const countSpring = createSpring({ stiffness: 420, damping: 19, mass: 1 });
    for (let k = 0; k < 4; k++) {
      tl.add(dots, { ['on' + k]: [0, 1], ease: countSpring, delay: st(9, ORIGINS[k]) }, B(2 + k));
      tl.add(dots, { ['off' + k]: [0, 1], duration: 240, ease: 'outQuad', delay: st(k < 3 ? 9 : 11, k < 3 ? ORIGINS[k + 1] : 'center') }, B(3 + k));
    }

    // the baton: 4/4 pattern, one segment per beat, faster into each ictus (outIn between ictuses)
    const segLen = (() => {
      const probe = mk('path', {}, hidden);
      const out = [];
      let prev = 0;
      for (let k = 1; k <= COND_SEGS.length; k++) {
        probe.setAttribute('d', COND_SEGS.slice(0, k).join(' '));
        const l = probe.getTotalLength();
        out.push(l - prev); prev = l;
      }
      probe.remove();
      return out;
    })();
    const T = segLen.reduce((a, b) => a + b, 0);
    const I4 = T - segLen[4];
    const starts = [segLen[0], segLen[0] + segLen[1], segLen[0] + segLen[1] + segLen[2], I4];
    const lens = [segLen[1], segLen[2], segLen[3], segLen[4] + segLen[0]];
    /** arc length (unwrapped, grows by T per bar) along the pattern at beat τ (1 ≤ τ ≤ 14) */
    const batonS = (tau) => {
      if (tau <= 1) return 0;
      if (tau < 2) return segLen[0] * inQuad(tau - 1);
      if (tau >= 14) return 3 * T;
      if (tau >= 13) return 2 * T + I4 + segLen[4] * outCubic(tau - 13);
      const n = Math.floor((tau - 2) / 4), k = Math.floor(tau - 2) % 4;
      return n * T + starts[k] + lens[k] * outInQuad(tau - Math.floor(tau));
    };
    const [condDraw] = createDrawable(condPath);
    tl.add(condDraw, { draw: ['0 0', '0 1'], duration: B(5), ease: fn((p) => Math.min(1, batonS(1 + 5 * p) / T)) }, B(1));
    tl.add(createDrawable(eraser), { draw: ['0 0', '0 1'], duration: 900, ease: 'inOutQuart' }, B(14));
    const mp = createMotionPath(condPath, 1e-7);   // a non-zero offset makes the path wrap: the baton loops
    tl.add(baton, { translateX: mp.translateX, translateY: mp.translateY, duration: B(13), ease: fn((p) => batonS(1 + 13 * p) / T) }, B(1));
    nums.forEach((e, k) => tl.add(e, { opacity: [0, 1], duration: 180 }, B(2 + k)));

    // b6 — CHORUS. A red burst from the centre; the dots square up; the yellow triangle springs in
    tl.add(dots, { burst: [0, 1], duration: 760, ease: fn(bump(0.22)), delay: st(11, 'center') }, B(6));
    tl.add(dots, { sq: [0, 1], duration: 420, ease: 'inOutQuad', delay: st(11, 'center') }, B(6) + 120);
    tl.add(shapeG, { scale: [0, 1], ease: createSpring({ stiffness: 170, damping: 12 }) }, B(6));

    // b7 — from the top-left corner: the squares grow and turn a quarter on a spring, a cobalt band on the front
    const turn = createSpring({ stiffness: 240, damping: 13 });
    tl.add(dots, { grow: [0, 1], duration: 380, ease: 'outCubic', delay: st(12, 'first') }, B(7));
    tl.add(dots, { rot1: [0, 1], ease: turn, delay: st(12, 'first') }, B(7));
    tl.add(dots, { cob: [0, 1], duration: 640, ease: fn(bump(0.25)), delay: st(12, 'first') }, B(7));

    // b8 — from the bottom-right corner: a hop, in yellow; the triangle becomes a red square.
    // morphTo resamples both outlines to the same number of points; the pairs are taken here once so each
    // tween carries an explicit [from, to] (the path shows exactly the tween's from value before it starts)
    tl.add(dots, { hop: [0, 1], duration: 540, ease: fn(hopEase), delay: st(12, 'last') }, B(8));
    tl.add(dots, { yel: [0, 1], duration: 620, ease: fn(bump(0.3)), delay: st(12, 'last') }, B(8));
    const [triPts, sqPts] = morphTo(sqT)(shape);
    shape.setAttribute('d', sqPts);
    const [sqPts2, ciPts] = morphTo(ciT)(shape);
    shape.setAttribute('d', triPts);
    shapeB.setAttribute('d', sqPts2);
    tl.add(shape, { d: [triPts, sqPts], fill: [hex(YELLOW), hex(RED)], duration: 560, ease: 'inOutQuart' }, B(8));

    // b8¾–b11¼ — the moving point orbits the shape; on every eighth note it sends a ripple from where it is
    const orbitLen = orbitP.getTotalLength();
    const om = createMotionPath(orbitP, 1e-7);
    tl.add(orbitMove, { translateX: om.translateX, translateY: om.translateY, duration: ORBIT_DUR, ease: fn((p) => ORBIT_TURNS * p) }, ORBIT_T0);
    tl.add(orbitIn, { scale: [0, 1], ease: createSpring({ stiffness: 300, damping: 16 }) }, ORBIT_T0);
    tl.add(orbitOut, { scale: [1, 0], duration: 260, ease: 'inBack(2)' }, ORBIT_T0 + ORBIT_DUR - 260);
    M_AT.forEach((at, j) => {
      const s = (((ORBIT_TURNS * (at - ORBIT_T0)) / ORBIT_DUR) % 1) * orbitLen;
      const p = orbitP.getPointAtLength(s);
      const from = [clamp((p.x - X0) / ((COLS - 1) * GAP)), clamp((p.y - Y0) / ((ROWS - 1) * GAP))];
      tl.add(dots, { ['m' + j]: [0, 1], duration: 580, ease: fn(bump(0.24)), delay: st(8, from) }, at);
    });

    // b10 — the square becomes a cobalt circle
    tl.add(shapeB, { opacity: [0, 1], duration: 1 }, B(10) - 40);
    tl.add(shape, { opacity: [1, 0], duration: 1 }, B(10));
    tl.add(shapeB, { d: [sqPts2, ciPts], fill: [hex(RED), hex(COBALT)], duration: 560, ease: 'inOutQuart' }, B(10));

    // b11 — fortissimo: one sweep from corner to corner, another quarter turn, stripes of all three colours
    tl.add(dots, { ff: [0, 1], duration: 720, ease: fn(bump(0.3)), delay: st(10, 'first') }, B(11));
    tl.add(dots, { rot2: [0, 1], ease: turn, delay: st(10, 'first') }, B(11));

    // b12 — cut-off: from the edges inwards everything returns to small round dots
    tl.add(dots, { calm: [0, 1], duration: 560, ease: 'outQuart', delay: st(10, 'center', { reversed: true }) }, B(12));

    // b13 — unison: the field gathers into one shaded sphere (outBack: inner dots overshoot, outer ones vanish)
    tl.add(dots, { gath: [0, 1], duration: 760, ease: 'outBack(1.3)', delay: st(16, 'center') }, B(13));

    // b14 — the baton comes to rest (the pattern draws out behind it); the circle slips off register
    tl.add(shapeG, { translateX: [0, 58], translateY: [0, -58], ease: createSpring({ stiffness: 110, damping: 15 }) }, B(14));

    // prime: run the score to its end and back once, so every tween has written its from value and the
    // state before any tween starts is the same whether the page is fresh or has been seeked back
    tl.seek(tl.duration, true);
    tl.seek(0, true);
    this.tl = tl;

    // ============================================================ per frame: compose the layers into each dot
    const lastT = new Array(N).fill(''), lastC = new Array(N).fill(''), lastR = new Array(N).fill('');
    const c0 = cov[0], c1 = cov[1], c2 = cov[2], c3 = cov[3];
    const RGB = [RED, COBALT, YELLOW];
    const ink = hex(INK), red = hex(RED);
    const hold = (x) => (x < 0 ? 0 : x);
    this.compose = (t) => {
      for (let i = 0; i < N; i++) {
        const d = dots[i];
        // count-in: presence of each numeral, and a red leading edge while a dot is changing
        const p0 = d.on0 * (1 - d.off0), p1 = d.on1 * (1 - d.off1), p2 = d.on2 * (1 - d.off2), p3 = d.on3 * (1 - d.off3);
        const dig = c0[i] * p0 + c1[i] * p1 + c2[i] * p2 + c3[i] * p3;
        const edge = 4 * (c0[i] * hold(d.on0 * (1 - d.on0)) * (1 - d.off0) + c1[i] * hold(d.on1 * (1 - d.on1)) * (1 - d.off1) +
          c2[i] * hold(d.on2 * (1 - d.on2)) * (1 - d.off2) + c3[i] * hold(d.on3 * (1 - d.on3)) * (1 - d.off3));
        const ch = 1 - d.calm;                     // the chorus layers fade with the cut-off
        const mm = d.m0 + d.m1 + d.m2 + d.m3;
        let s = BASE * d.intro + (1 - BASE) * dig + 0.26 * d.prep +
          ch * (0.82 * d.burst + 0.34 * d.grow + 0.42 * mm + 0.5 * d.ff);
        const sp = sphere[i] - s;
        s = Math.max(0, s + sp * d.gath);
        // colour: ink, pulled toward red / cobalt / yellow by the layers that carry colour
        const band = RGB[stripe[i]];
        let wR = 0.85 * edge + c3[i] * p3 + ch * (d.burst + 0.9 * (d.m0 + d.m2));
        let wC = ch * (d.cob + 0.9 * (d.m1 + d.m3));
        let wY = ch * d.yel;
        const f = ch * d.ff;
        if (band === RED) wR += f; else if (band === COBALT) wC += f; else wY += f;
        let r = INK[0], g = INK[1], b = INK[2];
        let w = clamp(wR); r += (RED[0] - r) * w; g += (RED[1] - g) * w; b += (RED[2] - b) * w;
        w = clamp(wC); r += (COBALT[0] - r) * w; g += (COBALT[1] - g) * w; b += (COBALT[2] - b) * w;
        w = clamp(wY); r += (YELLOW[0] - r) * w; g += (YELLOW[1] - g) * w; b += (YELLOW[2] - b) * w;
        const dy = -32 * ch * d.hop;
        const rot = 90 * (d.rot1 + d.rot2);
        const sq = clamp(d.sq * ch);
        const tr = `translateY(${dy.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${s.toFixed(3)})`;
        const cs = `rgb(${r | 0},${g | 0},${b | 0})`;
        const rs = `${(50 - 44 * sq).toFixed(1)}%`;
        const e = els[i].style;
        if (tr !== lastT[i]) { e.transform = tr; lastT[i] = tr; }
        if (cs !== lastC[i]) { e.background = cs; lastC[i] = cs; }
        if (rs !== lastR[i]) { e.borderRadius = rs; lastR[i] = rs; }
      }

      // the metronome: bar · beat counter, the ticker, the current ictus numeral, CHORUS lighting up letter by letter
      const beat = Math.min(15, Math.floor((t * 1000) / BEAT + 1e-6));
      counter.textContent = t * 1000 >= B(14) ? 'FINE' : `BAR ${(beat >> 2) + 1} · BEAT ${(beat & 3) + 1}`;
      for (let k = 0; k < 16; k++) {
        const s = ticks[k].style;
        s.background = k < beat ? PAPER : k === beat ? red : 'transparent';
        s.borderColor = k === beat ? red : PAPER;
      }
      const conducting = beat >= 2 && beat <= 13;
      nums.forEach((e, k) => e.setAttribute('fill', conducting && ((beat - 2) & 3) === k ? red : ink));
      letters.forEach((e, j) => {
        const lit = t * 1000 >= B(6 + j) && t * 1000 < B(12) + j * 60;
        e.style.color = lit ? red : ink;
      });
    };
  },
  frame(t) {
    this.tl.seek(t * 1000);   // synchronous: every child animation renders inside seek()
    this.compose(t);
  },
});
