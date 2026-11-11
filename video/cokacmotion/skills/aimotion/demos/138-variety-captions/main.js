/*
 * 138 · 라면 물 조절 실패 — 예능 자막 · 겹 테두리 + 튀어나오기 + 화자 색 + 상황 자막
 *
 * Two friends make ramen in a small kitchen. The picture is ordinary footage; the captions do the comedy, in the
 * grammar of Korean variety-show editing:
 *   speaker captions  one hue per speaker (their clothes), stacked outline, per-letter spring pop, placed under the speaker
 *   situation caption small, bracketed, hand-lettered, in a rounded tag beside the face it describes
 *   emphasis beat     the only use of the accent: heavy stacked outline + block extrusion, slammed letters with a
 *                     decaying shake, punch-in zoom of the footage, radial speed lines (집중선), one flash
 *   narration         a softer register to close: no gradient, no overshoot, rises in
 * Everything is drawn on one Canvas 2D (a per-frame scale on DOM text rasterizes differently by seek order).
 * Every value is a closed-form function of t; static art is baked in setup.
 */
import { defineDemo, clamp, lerp, ease, track, ramp } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { layoutCaption, drawCaption, speakerPalette, oklch, spring, backIn, backOut, outQuad, hash, TAU } from './caption.js';
import {
  C, POT, PEOPLE, W, H, mkCanvas, bakeWall, bakeCounter, bakeLight, bakeVignette, bakeGrain, bakeSoft, bakeBowl,
  drawPerson, drawArm, drawKettle, drawBurner, drawPot, drawFoam, puff, sweat,
} from './art.js';

const D = 10;
// ---------------------------------------------------------------- tokens: two speaker hues + ONE accent
const PAL = { A: speakerPalette(250), B: speakerPalette(355) };   // hues ≥ 90° apart, and ≥ 90° from the accent
const ACCENT = oklch(0.86, 0.17, 92);                              // reserved for the emphasis beat
const ACCENT_DEEP = oklch(0.72, 0.16, 70);
const INK = C.ink;
const F = { speak: '"Do Hyeon"', emph: '"Black Han Sans"', hand: '"Gaegu"', ui: '"Pretendard Variable"' };

// ---------------------------------------------------------------- the beat sheet (s)
const T = {
  label: 0.15,
  pourUp: 0.95, pourOn: 1.36, pourOff: 3.22, settle: 3.5, putDown: 4.2,
  capA: [1.15, 3.3], capB: [3.55, 5.25],
  boil: 4.1, foam: 4.65, peek: 5.27,
  hit: 5.45,                       // the pot boils over: punch, flash, speed lines, emphasis
  emph: [5.47, 7.3], shock: [5.45, 7.42],
  laugh: 7.45, close: 7.75,
};
const TAGS = [
  { text: '(자신만만)', who: 'A', t0: 1.95, t1: 3.25 },
  { text: '(동공지진)', who: 'A', t0: 5.72, t1: 7.25 },
];
const TAG_OFF = [-14, -196];       // a situation tag sits in a fixed slot by its subject's face (screen px from the face centre)

// ---------------------------------------------------------------- caption styles (widths × font size)
const speakerStyle = (pal, id) => ({
  reach: 0.16, pivot: 'base',
  layers: [
    { kind: 'shadow', w: 0.25, off: [0.03, 0.075], color: pal.shadow },
    { kind: 'stroke', w: 0.25, color: pal.edge },
    { kind: 'stroke', w: 0.11, color: '#fffdf7' },
    { kind: 'fill', id, grad: [[0, pal.top], [0.45, pal.bottom], [1, pal.bottom]] },
  ],
});
const EMPH = {
  reach: 0.3, pivot: 'mid',
  layers: [
    { kind: 'extrude', w: 0.36, dir: [0.045, 0.1], steps: 7, color: '#1c1521' },
    { kind: 'stroke', w: 0.36, color: INK },
    { kind: 'stroke', w: 0.25, color: '#ffffff' },
    { kind: 'stroke', w: 0.085, color: INK, join: 'miter', miter: 2 },
    { kind: 'fill', id: 'emph', grad: [[0, '#fff7cf'], [0.42, ACCENT], [1, ACCENT_DEEP]] },
  ],
};
const NARR = {
  reach: 0.15, pivot: 'base',
  layers: [
    { kind: 'shadow', w: 0.16, off: [0, 0.055], color: '#3e2f3a' },
    { kind: 'stroke', w: 0.16, color: '#7a6170' },
    { kind: 'fill', grad: '#fffaf1' },
  ],
};
const miniStyle = (pal) => ({
  reach: 0.15, pivot: 'base',
  layers: [
    { kind: 'stroke', w: 0.24, color: INK },
    { kind: 'stroke', w: 0.11, color: '#ffffff' },
    { kind: 'fill', grad: pal.bottom },
  ],
});
const POP = { kind: 'pop', zeta: 0.42, f: 2.9, drop: 0.45, squash: 0.6, spin: 0.22 };
const SLAM = { kind: 'slam', zeta: 0.5, f: 4.4, big: 2.1, squash: 1.6, spin: 0.22 };
const RISE = { kind: 'rise', dur: 0.5, drop: 0.32 };
const CAPS = [
  { id: 'A', lines: [{ text: '물은…', size: 66, font: F.speak }, { text: '대충 이 정도?', size: 104, font: F.speak }],
    x: 300, y: 1566, t0: T.capA[0], t1: T.capA[1], style: speakerStyle(PAL.A, 'A'), enter: POP, seed: 1 },
  { id: 'B', lines: [{ text: '그거', size: 66, font: F.speak }, { text: '너무 많지 않아?', size: 104, font: F.speak }],
    x: 790, y: 1566, t0: T.capB[0], t1: T.capB[1], style: speakerStyle(PAL.B, 'B'), enter: POP, seed: 2 },
  { id: 'E', lines: [{ text: '넘.쳤.다', size: 228, font: F.emph, track: -0.02 }],
    x: 540, y: 330, t0: T.emph[0], t1: T.emph[1], style: EMPH, enter: SLAM, stagger: 0.055, exitDur: 0.15, exitStagger: 0.02, seed: 3 },
  { id: 'N', lines: [{ text: '다음엔 계량컵으로…', size: 80, font: F.speak }],
    x: 540, y: 1548, t0: T.close, t1: 99, style: NARR, enter: RISE, stagger: 0.05, seed: 4 },
  { id: 'kA', lines: [{ text: 'ㅋㅋ', size: 100, font: F.hand, track: -0.3 }], x: 118, y: 606, t0: 7.62, t1: 99, style: miniStyle(PAL.A), enter: POP, stagger: 0.09, margin: 30, seed: 5 },
  { id: 'kB', lines: [{ text: 'ㅋㅋㅋ', size: 100, font: F.hand, track: -0.3 }], x: 960, y: 578, t0: 7.5, t1: 99, style: miniStyle(PAL.B), enter: POP, stagger: 0.09, margin: 30, seed: 6 },
];

// ---------------------------------------------------------------- camera: slow push (parallax) × punch-in (uniform)
const FOCUS = [545, 985];
const FRAME = 1.1;                 // base framing: the footage is shot a little tighter than the art
const push = (t) => 0.035 * ease.inOutCubic(clamp(t / D));
/** punch-in: 1 → 1.1 in 0.12 s (outQuad), then eased back over 0.8 s */
function punch(t) {
  const u = t - T.hit;
  if (u < 0) return 1;
  if (u < 0.12) return 1 + 0.1 * outQuad(u / 0.12);
  return 1 + 0.1 * (1 - ease.inOutCubic(clamp((u - 0.12) / 0.8)));
}
function cam(g, t, f) {
  const s = FRAME * (1 + push(t) * f) * punch(t);
  g.setTransform(s, 0, 0, s, FOCUS[0] * (1 - s), FOCUS[1] * (1 - s));
  return s;
}
const toScreen = (t, f, x, y) => { const s = FRAME * (1 + push(t) * f) * punch(t); return [FOCUS[0] + (x - FOCUS[0]) * s, FOCUS[1] + (y - FOCUS[1]) * s]; };

// ---------------------------------------------------------------- acting (closed form in t)
const tri = (u, d) => (u <= 0 || u >= d ? 0 : 1 - Math.abs(2 * u / d - 1));
const blinkAt = (t, list) => list.reduce((m, b) => Math.max(m, tri(t - b, 0.14)), 0);
const hop = (t) => { const u = t - T.hit; return u > 0 && u < 0.24 ? -26 * Math.sin(Math.PI * u / 0.24) : 0; };
const laughU = (t) => Math.max(0, t - T.laugh);
const bob = (t) => { const u = laughU(t); return u > 0 ? -8 * Math.abs(Math.sin(TAU * 2.4 * u)) * (0.55 + 0.45 * Math.exp(-u)) : 0; };
/** talking mouth: one open–close per syllable, syllables spread evenly from the caption start */
const talk = (t, t0, n, per = 0.17) => (t > t0 && t < t0 + n * per ? 0.55 * Math.abs(Math.sin(Math.PI * (t - t0) / per)) : 0);

const A_ = {
  lean: track([[0, 0.02], [1.0, 0.02], [1.35, 0.06], [3.3, 0.06], [3.7, -0.01], [5.4, -0.01], [5.55, -0.05, ease.outBack], [7.3, -0.04], [7.6, 0.03]]),
  tilt: track([[0, 0.04], [1.2, 0.08], [3.3, 0.08], [3.75, -0.06], [4.9, -0.06], [5.2, 0.02], [5.45, 0.0], [7.3, 0], [7.62, 0.14]]),
  look: track([[0, [0.7, 0.8]], [3.4, [0.8, 0.9]], [3.8, [1, -0.1]], [4.85, [1, -0.1]], [5.15, [0.8, 0.9]], [5.45, [0.6, 0.6]]]),
  browUp: track([[0, 0.2], [1.2, 0.6], [3.3, 0.6], [3.8, 0.1], [5.35, 0.3], [5.47, 1.1], [7.3, 1.0], [7.62, 0.4]]),
  worry: track([[0, 0], [3.3, 0], [4.0, 0.5], [5.35, 0.7], [5.47, 1.0], [7.3, 1.0], [7.62, 0.4]]),
  smile: track([[0, 0.5], [1.15, 0.7], [3.3, 0.8], [3.8, 0.1], [5.4, -0.3]]),
  grip: track([[0, [372, 878]], [T.pourUp, [372, 878]], [1.32, [400, 790], ease.outCubic], [T.pourOff, [404, 794]], [3.55, [392, 850]], [3.85, [300, 990]], [T.putDown, [222, 1104], ease.outCubic]]),
  pour: track([[0, 0], [T.pourUp, 0], [1.32, 0.6, (p) => ease.outBack(p, 1.4)], [3.2, 0.7], [T.settle, 0], [T.putDown, 0]]),
  handR: track([[T.putDown, [222, 1104]], [4.55, [378, 1150]], [5.43, [378, 1150]], [5.6, [352, 790], ease.outCubic], [7.3, [352, 790]], [7.62, [350, 704], ease.outCubic]]),
  handL: track([[0, [128, 1150]], [5.43, [128, 1150]], [5.6, [158, 790], ease.outCubic], [7.3, [158, 790]], [7.62, [212, 1062], ease.outCubic]]),
};
const B_ = {
  lean: track([[0, -0.03], [3.45, -0.03], [3.75, -0.07], [5.3, -0.07], [5.55, 0.07, ease.outBack], [7.3, 0.06], [7.6, 0.0]]),
  tilt: track([[0, -0.05], [2.4, -0.05], [2.7, -0.13], [3.5, -0.11], [3.75, 0.04], [5.35, 0.04], [5.5, -0.03], [7.4, -0.03], [7.62, -0.15]]),
  look: track([[0, [-0.7, 0.8]], [2.4, [-0.7, 0.8]], [2.7, [-1, 0]], [3.5, [-1, 0]], [3.75, [-0.8, 0.9]], [5.6, [-0.6, 0.6]]]),
  lid: track([[0, 0], [2.4, 0], [2.7, 0.6], [3.5, 0.6], [3.75, 0.2], [5.5, 0.3]]),
  browUp: track([[0, 0.1], [2.4, 0.1], [2.7, 0.75], [3.5, 0.75], [3.75, 0.4], [5.35, 0.6], [5.5, 1.2], [7.3, 1.1], [7.62, 0.5]]),
  worry: track([[0, 0], [2.4, 0], [2.7, -0.45], [3.5, -0.35], [3.75, 0.5], [5.35, 0.7], [5.5, 0.9], [7.4, 0.9], [7.62, 0.3]]),
  smile: track([[0, 0.3], [2.4, 0.3], [2.7, -0.35], [3.5, -0.35], [4.8, -0.4]]),
  handL: track([[0, [774, 1148]], [3.6, [774, 1148]], [3.86, [652, 902], ease.outBack], [5.3, [652, 902]], [5.47, [712, 690], ease.outCubic], [7.3, [712, 690]], [7.6, [778, 940], ease.outCubic]]),
  handR: track([[0, [872, 1148]], [5.3, [872, 1148]], [5.47, [930, 690], ease.outCubic], [7.3, [930, 690]], [7.6, [866, 940], ease.outCubic]]),
};

function poseA(t) {
  const shock = t >= T.shock[0] && t < T.laugh, laugh = t >= T.laugh;
  const step = Math.floor(t * 24), amp = shock ? 0.07 * PEOPLE.A.R * (0.6 + 0.4 * Math.exp(-(t - T.shock[0]) * 1.5)) : 0;
  const o = laugh ? 0.5 + 0.25 * Math.abs(Math.sin(TAU * 2.4 * laughU(t))) : talk(t, T.capA[0], 7);
  return {
    bx: 0, by: hop(t) + bob(t), lean: A_.lean(t), hx: 0, hy: 0,
    tilt: A_.tilt(t) + (laugh ? 0.04 * Math.sin(TAU * 1.2 * laughU(t)) : 0),
    face: {
      eye: shock ? 'wide' : laugh ? 'laugh' : 'dot', look: A_.look(t), blink: blinkAt(t, [0.62, 4.5]), lid: 0,
      jit: [amp * (hash(step, 1) - 0.5) * 2, amp * (hash(step, 2) - 0.5) * 2],
      browUp: A_.browUp(t), worry: A_.worry(t), blush: laugh ? 0.95 : 0.6,
      mouth: shock ? { kind: 'wave', w: 0.36 } : { kind: o > 0.06 ? 'open' : 'line', o, s: laugh ? 1 : A_.smile(t), w: laugh ? 0.5 : 0.4 },
    },
  };
}
function poseB(t) {
  const shock = t >= T.shock[0] && t < T.laugh, laugh = t >= T.laugh;
  const o = laugh ? 0.55 + 0.25 * Math.abs(Math.sin(TAU * 2.4 * laughU(t) + 1)) : talk(t, T.capB[0], 7);
  return {
    bx: 0, by: hop(t) * 0.8 + bob(t + 0.1), lean: B_.lean(t) + (laugh ? 0.035 * Math.sin(TAU * 1.3 * laughU(t)) : 0), hx: 0, hy: 0,
    tilt: B_.tilt(t),
    face: {
      eye: shock ? 'wide' : laugh ? 'laugh' : 'dot', look: B_.look(t), blink: blinkAt(t, [1.7, 5.05]), lid: B_.lid(t), jit: [0, 0],
      browUp: B_.browUp(t), worry: B_.worry(t), blush: laugh ? 0.95 : 0.55,
      mouth: shock ? { kind: 'O', o: clamp((t - T.shock[0]) / 0.2) } : { kind: o > 0.06 ? 'open' : 'line', o, s: laugh ? 1 : B_.smile(t), w: laugh ? 0.52 : 0.36 },
    },
  };
}

// ---------------------------------------------------------------- pot state
const level = track([[T.pourOn, 0], [T.pourOff, 0.97, (p) => p]]);
const boilK = (t) => ramp(t, T.boil, 5.3);
const foamCover = (t) => ramp(t, T.foam, T.peek);
/** dome height above the rim: a peek, the eruption on a spring, then a slow sink */
function domeH(t) {
  if (t < T.peek) return 0;
  if (t < T.hit) return 16 * ease.outCubic((t - T.peek) / (T.hit - T.peek));
  return 16 + 104 * spring(t - T.hit, 0.36, 2.2).x - 52 * ease.inOutCubic(clamp((t - 6.1) / 2.8));
}
const DRIPS = [[430, 30, 104, 0.05], [474, 24, 62, 0.13], [522, 36, 118, 0.02], [574, 26, 76, 0.17], [622, 32, 110, 0.08], [664, 24, 50, 0.22]]
  .map(([x, w, max, delay]) => ({ x, w, max, delay }));
const dripLen = (d, t) => { const u = t - T.hit - d.delay; return u > 0 ? d.max * (1 - Math.exp(-u / 0.32)) : 0; };
const PUFFS = [[438, 5.86, 1], [618, 6.0, 2], [528, 6.18, 3], [660, 6.46, 4]];

// ---------------------------------------------------------------- the emphasis beat: shake and speed lines
/** decaying letter shake: every stamp shakes the letter it lands (and, weaker, the letters already down) */
function emphShake(cap) {
  return (c, p, t) => {
    let dx = 0, dy = 0, dr = 0;
    for (let j = c.k; j < cap.n; j++) {
      const u = t - (cap.t0 + j * cap.stagger) - 0.05;
      if (u <= 0) continue;
      const a = (j === c.k ? 1 : 0.45) * Math.exp(-u / 0.2);
      if (a < 0.01) continue;
      const ph = hash(c.k, j, 31) * TAU;
      dx += 15 * a * Math.sin(TAU * 17 * u + ph);
      dy += 11 * a * Math.cos(TAU * 13 * u + ph * 1.7);
      dr += 0.06 * a * Math.sin(TAU * 11 * u + ph * 2.3);
    }
    p.x += dx; p.y += dy; p.rot += dr;
  };
}
/**
 * 집중선: wedges from beyond the frame toward a focus, re-dealt 12 times a second. Each wedge k has an angle, an inner
 * radius and a width from hash(k, step); the inner radius sweeps in from the frame edge on the hit and retreats outward
 * as the beat ends, so the clear centre opens up instead of fading.
 */
function speedLines(g, t) {
  const u = t - T.hit;
  if (u < 0 || u > 1.7) return;
  const step = Math.floor(u * 12), cx = FOCUS[0], cy = FOCUS[1] - 10;
  const inK = ease.outExpo(clamp(u / 0.1)), outK = ease.inCubic(clamp((u - 1.05) / 0.65));
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.beginPath();
  for (let k = 0; k < 110; k++) {
    const a = (k + hash(k, step, 41)) / 110 * TAU, ca = Math.cos(a), sa = Math.sin(a);
    // the clear centre is an ellipse (tall frame): r_e(a) = 1 / √((cos a / ax)² + (sin a / ay)²), ax 430, ay 640, + jitter
    const re = 1 / Math.hypot(ca / 430, sa / 640);
    const r0 = lerp(1500, re * (1 + 0.38 * hash(k, step, 42)), inK) + 1300 * outK;
    const w = (4 + 28 * hash(k, step, 43) ** 2) / 2, r1 = 1600;
    g.moveTo(cx + ca * r0, cy + sa * r0);
    g.lineTo(cx + ca * r1 - sa * w, cy + sa * r1 + ca * w);
    g.lineTo(cx + ca * r1 + sa * w, cy + sa * r1 - ca * w);
  }
  g.fillStyle = 'rgba(30,22,36,0.86)'; g.fill();
}

// ---------------------------------------------------------------- situation tag + corner label
function drawTag(g, tag, t, ax, ay) {
  const u = t - tag.t0;
  if (u <= 0) return;
  let s = spring(u, 0.48, 3.2).x;
  const v = t - tag.t1;
  if (v > 0) { const k = clamp(v / 0.12); if (k >= 1) return; s *= 1 - backIn(k); }
  if (s <= 0.01) return;
  const rot = -0.07 + 0.05 * (1 - Math.min(1, u / 0.3));
  g.setTransform(s * Math.cos(rot), s * Math.sin(rot), -s * Math.sin(rot), s * Math.cos(rot), ax, ay);
  g.font = `700 50px ${F.hand}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const w = tag.w + 44, h = 66;
  g.beginPath(); g.roundRect(-w / 2 + 5, -h / 2 + 7, w, h, h / 2); g.fillStyle = 'rgba(42,34,50,0.22)'; g.fill();
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fillStyle = '#fffdf6'; g.fill();
  g.lineWidth = 4; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke();
  g.fillStyle = '#4a3f4c'; g.fillText(tag.text, 0, 17);
  g.setTransform(1, 0, 0, 1, 0, 0);
}
function drawLabel(g, t, dome) {
  const p = clamp((t - T.label) / 0.5);
  if (p <= 0) return;
  const x = -440 * (1 - backOut(p, 1.3)) + 46, y = 92;
  g.setTransform(1, 0, 0, 1, x, y);
  g.font = `800 38px ${F.ui}`; g.textAlign = 'left'; g.textBaseline = 'middle';
  const tw = g.measureText('오늘의 요리 도전').width, w = tw + 112, h = 70;
  g.beginPath(); g.roundRect(5, 7, w, h, h / 2); g.fillStyle = 'rgba(42,34,50,0.22)'; g.fill();
  g.beginPath(); g.roundRect(0, 0, w, h, h / 2); g.fillStyle = '#fffdf6'; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
  // tiny pot icon that mirrors the real pot (its foam rises with the dome)
  const ix = 48, iy = 40;
  g.beginPath(); g.roundRect(ix - 22, iy - 12, 44, 26, [4, 4, 10, 10]); g.fillStyle = C.sage; g.fill(); g.lineWidth = 3.5; g.stroke();
  g.beginPath(); g.moveTo(ix - 30, iy - 12); g.lineTo(ix + 30, iy - 12); g.stroke();
  const fh = clamp(dome / 120);
  if (fh > 0.02) {
    g.beginPath();
    for (const [dx, r] of [[-12, 8], [0, 10], [12, 8]]) { g.moveTo(ix + dx + r * fh, iy - 14 - 4 * fh); g.arc(ix + dx, iy - 14 - 4 * fh, r * fh, 0, TAU); }
    g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 3; g.stroke();
  } else {
    g.beginPath(); g.moveTo(ix - 6, iy - 20); g.quadraticCurveTo(ix - 12, iy - 28, ix - 5, iy - 34); g.moveTo(ix + 6, iy - 20); g.quadraticCurveTo(ix, iy - 28, ix + 7, iy - 34);
    g.lineWidth = 3; g.lineCap = 'round'; g.stroke();
  }
  g.fillStyle = INK; g.fillText('오늘의 요리 도전', 88, h / 2 + 1);
  g.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------------------------------------------------------------- water stream from the spout (a falling parabola)
function stream(g, tip, wy, t) {
  const head = clamp((t - T.pourOn) / 0.12), tail = clamp((t - T.pourOff) / 0.14);
  if (head <= tail) return;
  const vx = 120, fall = wy - tip[1], tf = Math.sqrt(Math.max(1, fall) * 2 / 1800);
  const pt = (s) => [tip[0] + vx * s * tf + 2 * Math.sin(t * 40 + s * 6), tip[1] + 900 * (s * tf) ** 2];
  g.beginPath();
  for (let i = 0; i <= 14; i++) { const s = lerp(tail, head, i / 14), [x, y] = pt(s); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.lineWidth = 18; g.strokeStyle = INK; g.stroke();
  g.lineWidth = 11; g.strokeStyle = '#cfe9f7'; g.stroke();
  g.lineWidth = 3; g.strokeStyle = '#ffffff'; g.stroke();
  if (head >= 1 && tail <= 0) {
    const [x, y] = pt(1), step = Math.floor(t * 18);
    g.beginPath(); g.ellipse(x, y, 26 + 4 * hash(step, 5), 7, 0, 0, TAU); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,0.95)'; g.stroke();
    for (let k = 0; k < 4; k++) {
      const a = -Math.PI / 2 + (k - 1.5) * 0.5, r = 14 + 10 * hash(step, k);
      g.beginPath(); g.arc(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r, 3.4, 0, TAU); g.fillStyle = '#ffffff'; g.fill();
      g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
    }
  }
}

defineDemo({
  id: '138-variety-captions',
  title: '라면 물 조절 실패',
  tech: '예능 자막 · 겹 테두리 + 튀어나오기 + 화자 색 + 상황 자막',
  duration: D,
  background: '#241c26',

  async setup(api) {
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.g = ctx;
    const all = CAPS.map((c) => c.lines.map((l) => l.text).join('')).join('');
    await fontReady(`104px ${F.speak}`, all + '다음엔계량컵으로');
    await fontReady(`228px ${F.emph}`, '넘.쳤.다');
    await fontReady(`700 50px ${F.hand}`, TAGS.map((t) => t.text).join('') + 'ㅋ');
    await fontReady(`800 38px ${F.ui}`, '오늘의 요리 도전');
    // captions: measured once (prefix widths), line-length and reading-time rules checked here
    this.caps = Object.fromEntries(CAPS.map((c) => [c.id, layoutCaption(ctx, c)]));
    ctx.font = `700 50px ${F.hand}`;
    for (const tag of TAGS) tag.w = ctx.measureText(tag.text).width;
    // foam dome: bubbles with a spread across the rim (u), front/back (v), how much the dome lifts them, radius
    this.dome = Array.from({ length: 26 }, (_, k) => {
      const u = (k / 25) * 2 - 1 + (hash(k, 51) - 0.5) * 0.08;
      return { u, v: (hash(k, 52) - 0.5) * 1.4, lift: 0.35 + 0.65 * hash(k, 53), r: 20 + 18 * hash(k, 54), ph: hash(k, 55) * TAU };
    });
    this.drops = Array.from({ length: 9 }, (_, k) => ({
      x: POT.x + (hash(k, 61) - 0.5) * 240, vx: (hash(k, 62) - 0.5) * 820, vy: -(560 + 520 * hash(k, 63)), r: 5 + 5 * hash(k, 64), d: hash(k, 65) * 0.08,
    }));
    this.wisps = [-80, 0, 78, -36, 42].map((dx, k) => ({ x: POT.x + dx, per: 1.5 + 0.4 * hash(k, 72), ph: hash(k, 73), on: k / 5, amp: 14 + 8 * hash(k, 74), len: 230 + 90 * hash(k, 76), sw: hash(k, 75) * TAU }));
    // baked layers (CPU raster in headless so the first composite matches a revisit)
    const hl = api.headless, bake = (fn, w = W, h = H) => { const [c, g] = mkCanvas(w, h, hl); fn(g, w); return c; };
    this.wall = bake(bakeWall);
    this.counter = bake(bakeCounter);
    this.light = bake(bakeLight);
    this.vig = bake(bakeVignette);
    this.soft = bake(bakeSoft, 128, 128);
    this.bowl = bake((g, w) => bakeBowl(g, w, hl), 640, 400);
    this.grain = ctx.createPattern(bake(bakeGrain, 256, 256), 'repeat');
    for (const c of [this.wall, this.counter, this.light, this.vig, this.soft, this.bowl]) ctx.drawImage(c, 0, 0);
    ctx.reset();
  },

  frame(t) {
    const g = this.g;
    g.reset();
    g.imageSmoothingQuality = 'high';

    // ---------------- footage: wall (parallax 0.55), then everything on the counter plane (1.0)
    cam(g, t, 0.55);
    g.drawImage(this.wall, 0, 0);
    cam(g, t, 1);
    const pA = poseA(t), pB = poseB(t);
    for (const [P, p] of [[PEOPLE.A, pA], [PEOPLE.B, pB]]) {           // soft contact shadows on the tiles
      g.globalAlpha = 0.2;
      g.drawImage(this.soft, P.x - 1.6 * P.R + 34 + 400 * p.lean, P.hy - 0.9 * P.R + 30, 3.2 * P.R, 4.4 * P.R);
      g.globalAlpha = 1;
    }
    const QA = drawPerson(g, PEOPLE.A, pA, PAL.A, t);
    const QB = drawPerson(g, PEOPLE.B, pB, PAL.B, t);
    g.drawImage(this.counter, 0, 0);
    drawBurner(g, t, 1);
    const lev = level(t), dome = domeH(t);
    drawPot(g, lev, boilK(t), { cover: foamCover(t) }, t);
    if (t >= T.peek) drawFoam(g, this.dome, dome, DRIPS.map((d) => ({ x: d.x, w: d.w, len: dripLen(d, t) })), t);
    // droplets thrown by the eruption (ballistic, closed form), drawn as one outlined union
    const du = t - T.hit;
    if (du > 0 && du < 1) {
      const P2 = new Path2D();
      for (const d of this.drops) {
        const u = du - d.d;
        if (u <= 0) continue;
        const x = d.x + d.vx * u, y = POT.y - 30 + d.vy * u + 1700 * u * u, r = d.r * Math.min(1, u / 0.05);
        if (y > 1090) continue;
        P2.moveTo(x + r, y); P2.arc(x, y, r, 0, TAU);
      }
      g.lineWidth = 8; g.strokeStyle = INK; g.stroke(P2); g.fillStyle = '#ffffff'; g.fill(P2);
    }
    for (const [x, t0, seed] of PUFFS) {
      const u = t - t0;
      if (u > 0 && u < 0.9) puff(g, x + 20 * u * (seed % 2 ? -1 : 1), 1090 - 110 * u, 44 * Math.sin(Math.PI * u / 0.9) ** 0.6, seed);
    }
    // kettle and its stream, then the arms (over the counter)
    const grip = t < T.putDown ? A_.grip(t) : [222, 1104], tip = drawKettle(g, grip[0], grip[1], A_.pour(t));
    stream(g, tip, POT.y + (1 - lev) * 64 - 4, t);
    const shock = t >= T.shock[0] && t < T.laugh, laugh = t >= T.laugh;
    {
      const P = PEOPLE.A, hr = t < T.putDown ? grip : A_.handR(t), hl = A_.handL(t);
      const scratch = laugh ? 6 * Math.sin(TAU * 5 * laughU(t)) : 0;
      drawArm(g, P, QA.shL, hl, 26, PAL.A, shock ? 'open' : 'fist', [0.15, -1], -1);
      drawArm(g, P, QA.shR, [hr[0] + scratch, hr[1]], t < T.putDown ? 34 : 26, PAL.A, shock ? 'open' : 'fist', [-0.15, -1], 1);
    }
    {
      const P = PEOPLE.B, tremble = shock ? 3 * Math.sin(t * 70) : 0;
      const clap = laugh ? 16 * Math.abs(Math.sin(TAU * 2.4 * laughU(t))) : 0;
      const pointing = t > 3.62 && t < 5.36;
      const hl = B_.handL(t), hr = B_.handR(t);
      drawArm(g, P, QB.shL, [hl[0] - clap + tremble, hl[1]], t < 3.6 ? 34 : 24, PAL.B, shock ? 'open' : pointing ? 'point' : 'fist', shock ? [-0.3, -1] : [-0.55, 0.84], -1);
      drawArm(g, P, QB.shR, [hr[0] + clap - tremble, hr[1]], t < 5.3 ? 34 : 24, PAL.B, shock ? 'open' : 'fist', [0.3, -1], 1);
    }
    // steam: stylised wisps (a sine curve whose visible segment slides up and off its end), ink under white
    const steamK = ramp(t, 2.6, 4.2) * 0.6 + ramp(t, 4.4, 5.2) * 0.4;
    if (steamK > 0.01) {
      g.lineCap = 'round'; g.lineJoin = 'round';
      const base = POT.y - 40 - dome * 0.9;
      for (const w of this.wisps) {
        if (w.on > steamK) continue;
        const q = (t / w.per + w.ph) % 1, head = Math.min(1, q * 1.5), tail = Math.max(0, q * 1.5 - 0.5);
        if (head - tail < 0.02) continue;
        g.beginPath();
        for (let i = 0; i <= 16; i++) {
          const s2 = lerp(tail, head, i / 16);
          const x = w.x + w.amp * Math.sin(TAU * (s2 * 1.1) + w.sw) * (0.4 + s2), y = base - s2 * w.len;
          i ? g.lineTo(x, y) : g.moveTo(x, y);
        }
        g.lineWidth = 13; g.strokeStyle = 'rgba(42,34,50,0.5)'; g.stroke();
        g.lineWidth = 7; g.strokeStyle = '#ffffff'; g.stroke();
      }
    }
    // comic marks on the people: sweat drop (A), surprise lines (B)
    if (t > 5.84 && t < T.laugh + 0.1) {
      const u = t - 5.84, s = 30 * spring(u, 0.45, 3).x * (t > T.laugh ? 1 - clamp((t - T.laugh) / 0.1) : 1);
      sweat(g, QA.head[0] + 0.98 * PEOPLE.A.R, QA.head[1] - 0.42 * PEOPLE.A.R + 26 * ease.inOutCubic(clamp(u / 1.3)), s, -0.2);
    }
    if (shock) {
      const u = t - T.shock[0], k = ease.outExpo(clamp(u / 0.15)), [hx, hy] = QB.head, R = PEOPLE.B.R;
      g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 7;
      for (const a of [-1.2, -0.75, -0.3]) {
        const r0 = 1.3 * R, r1 = r0 + 46 * k, c = Math.cos(a), s = Math.sin(a);
        g.beginPath(); g.moveTo(hx + c * r0, hy + s * r0); g.lineTo(hx + c * r1, hy + s * r1); g.stroke();
      }
    }
    // light over the whole footage
    cam(g, t, 0.55);
    g.globalCompositeOperation = 'screen'; g.drawImage(this.light, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'multiply'; g.drawImage(this.vig, 0, 0);
    g.globalCompositeOperation = 'source-over';
    cam(g, t, 1.6);                                                   // foreground: out of focus, moves most
    g.drawImage(this.bowl, 720, 1440);
    g.setTransform(1, 0, 0, 1, 0, 0);

    // ---------------- the emphasis beat (screen space, over the footage)
    speedLines(g, t);
    const fu = t - T.hit;
    if (fu >= 0 && fu < 0.16) { g.fillStyle = `rgba(255,252,240,${(0.5 * (1 - fu / 0.16)).toFixed(4)})`; g.fillRect(0, 0, W, H); }

    // ---------------- captions (screen space: they never zoom with the footage)
    drawLabel(g, t, dome);
    for (const tag of TAGS) {
      // follow the face through the camera, but keep the tag's own size and keep it inside the frame
      const Q = tag.who === 'A' ? QA : QB, [fx, fy] = toScreen(t, 1, Q.head[0], Q.head[1]), half = tag.w / 2 + 40;
      drawTag(g, tag, t, clamp(fx + TAG_OFF[0], half, W - half), fy + TAG_OFF[1]);
    }
    const K = this.caps;
    drawCaption(g, K.A, t);
    drawCaption(g, K.B, t);
    drawCaption(g, K.kA, t, (c, p) => { p.y += -6 * Math.sin(TAU * 2.4 * (t - 7.62) + c.k); });
    drawCaption(g, K.kB, t, (c, p) => { p.y += -6 * Math.sin(TAU * 2.4 * (t - 7.5) + c.k + 1); });
    drawCaption(g, K.E, t, emphShake(K.E));
    drawCaption(g, K.N, t);

    // print grain, very light
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.35;
    g.fillStyle = this.grain; g.fillRect(0, 0, W, H);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  },
});
