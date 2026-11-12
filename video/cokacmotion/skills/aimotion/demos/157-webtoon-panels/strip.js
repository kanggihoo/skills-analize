/*
 * strip.js — the webtoon strip as a timeline: layout, pace field, scroll curve s(t), the leap through the gutter.
 * Pure maths, no DOM: every value here is a closed form of t or a table built once at import.
 *
 *   screen y = strip y − s(t)          (the strip scrolls up through a fixed 1080×1920 frame)
 *   pace     dt/ds = 1/v(y)            the reader moves fast over panel art already read, slowly over empty gutter
 *   σ(s)     = ∫ ds / v(s + ANCHOR)    reading time spent between stops (the anchor line is where the eye rests)
 *   move     s(t) = σ⁻¹( σ₀ + Δσ·MJ(u) ),  MJ(u) = u³(10 − 15u + 6u²)  — minimum jerk in reading time, not in pixels
 *   dwell    = READ0 + READ_SYL · syllables + beat     (balloon text length + the panel's acting beat)
 */
export const W = 1080, H = 1920;
export const VIEW_H = 1650;               // the strip is read above this line (captions live below)
export const ANCHOR = 780;                // screen y the eye rests on; each panel's focus point is brought here

// pacing constants (the whole timeline comes from these and the layout)
export const READ0 = 0.25;                // s, minimum look at any panel
export const READ_SYL = 0.06;             // s per syllable of balloon/SFX text (≈ 16 syllables per second)
export const MOVE0 = 0.3;                 // s, the hand's start/stop overhead of one scroll gesture
export const V_PAGE = 2600;               // px/s while panel art passes the anchor line
export const V_GUTTER = 520;              // px/s while an empty gutter passes it: a gutter of height G is a pause of G/V_GUTTER
export const EDGE = 420;                  // px over which the pace blends at a gutter edge

const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

// strip layout (px, y down from the top of the episode)
export const PANELS = [
  { id: 'p1', poly: rect(72, 260, 1008, 900), border: true, focus: 600,
    text: ['해 질 녘, 옥상', '하아암'], beat: 0.65 },           // wide establishing shot; the cat yawns
  { id: 'p2', poly: rect(72, 1040, 1008, 1360), border: true, focus: 1200,
    text: ['팔랑팔랑', '!'], beat: 0.8 },                      // letterbox close-up; the eyes go wide
  { id: 'p3', poly: [[72, 1580], [1008, 1500], [1008, 2560], [72, 2800]], border: true, focus: 2180,
    text: [], beat: 0.9 },                                        // tall, slanted: action; crouch and wiggle
  { id: 'p4', poly: rect(200, 3420, 680, 3860), border: true, focus: 3640,
    text: [], beat: 0.4 },                                        // small and silent: the held moment
  { id: 'p5', poly: rect(0, 4080, 1080, 6240), border: false, focus: 5100,
    text: ['쏙', '…냥'], beat: 0 },                               // full bleed, no border: release
];
export const P = Object.fromEntries(PANELS.map((p) => [p.id, p]));
export const STRIP_END = 6240;
export const P5_FADE = 170;               // the borderless panel opens out of the paper over this many px

const top = (p) => p.poly.reduce((a, q, i) => (i < 2 ? a + q[1] / 2 : a), 0);       // mean of the top edge
const bottom = (p) => (p.poly[2][1] + p.poly[3][1]) / 2;                              // mean of the bottom edge
// gutters between consecutive panels, measured edge mean to edge mean
export const GUTTERS = PANELS.slice(0, -1).map((p, i) => ({ y0: bottom(p), y1: top(PANELS[i + 1]) }));

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const smooth = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
export const MJ = (u) => { u = clamp(u); return u * u * u * (10 + u * (-15 + 6 * u)); };

/** gutter membership of a strip y (0 over panel art, 1 inside a gutter), blended over EDGE px at each edge */
export function inGutter(y) {
  let g = 0;
  for (const G of GUTTERS) g = Math.max(g, smooth((y - G.y0 + EDGE / 2) / EDGE) * smooth((G.y1 - y + EDGE / 2) / EDGE));
  return g;
}
/** scroll speed at a strip position of the anchor line */
export const pace = (y) => V_PAGE + (V_GUTTER - V_PAGE) * inGutter(y);

// σ(s): cumulative reading time along the scroll position, tabulated per pixel (trapezoid rule)
const SIG = new Float64Array(STRIP_END + 1);
for (let s = 1; s <= STRIP_END; s++) SIG[s] = SIG[s - 1] + 0.5 * (1 / pace(s - 1 + ANCHOR) + 1 / pace(s + ANCHOR));
const sigma = (s) => { const i = Math.min(STRIP_END - 1, Math.max(0, Math.floor(s))), f = s - i; return SIG[i] + (SIG[i + 1] - SIG[i]) * f; };
function sigmaInv(v, lo, hi) {                // monotone table → binary search + linear interpolation
  let a = Math.floor(lo), b = Math.ceil(hi);
  while (b - a > 1) { const m = (a + b) >> 1; if (SIG[m] < v) a = m; else b = m; }
  const d = SIG[b] - SIG[a];
  return a + (d > 0 ? (v - SIG[a]) / d : 0);
}

const syllables = (txt) => txt.join('').replace(/[\s,.…]/g, '').length;
// stops: scroll position that puts each panel's focus on the anchor line
export const STOPS = PANELS.map((p) => clamp(p.focus - ANCHOR, 0, STRIP_END - H));

// the timeline: dwell on each panel, then a move to the next
export const TL = [];
{
  let t = 0;
  PANELS.forEach((p, i) => {
    const dwell = READ0 + READ_SYL * syllables(p.text) + p.beat;
    p.syl = syllables(p.text);
    p.dwell = dwell;
    p.t0 = t;
    if (i === PANELS.length - 1) { p.t1 = Infinity; return; }
    t += dwell;
    p.t1 = t;
    const s0 = STOPS[i], s1 = STOPS[i + 1];
    const read = sigma(s1) - sigma(s0);          // ∫ ds / v
    const m = MOVE0 + read;
    TL.push({ from: i, to: i + 1, t0: t, t1: t + m, s0, s1, sig0: sigma(s0), sig1: sigma(s1), m, read });
    t += m;
  });
}
export const ARRIVE5 = TL[TL.length - 1].t1;   // the strip comes to rest on the last panel

/** the scroll position at time t */
export function scroll(t) {
  for (const mv of TL) {
    if (t < mv.t0) return mv.s0;
    if (t <= mv.t1) {
      const v = mv.sig0 + (mv.sig1 - mv.sig0) * MJ((t - mv.t0) / (mv.t1 - mv.t0));
      return sigmaInv(v, mv.s0, mv.s1);
    }
  }
  return STOPS[STOPS.length - 1];
}
// ---------------------------------------------------------------- the leap: panel 3 → gutter → panel 4
// The cat is staged in camera space S(p) (a cubic Bézier on screen) and placed on the strip as C = S + (0, s(t)):
// the camera keeps the cat in frame while the page slides up behind it, so the borders and the empty gutter pass
// under the cat. p runs on reading time like the scroll (so the cat slows in the gutter with the page), with an
// explosive start: p = 0.2·(1 − (1 − u/0.16)²) + 0.8·MJ(u).
export const LEAP = TL[2];                         // the move from panel 3 to panel 4
export const T_LAUNCH = LEAP.t0, T_ARRIVE = LEAP.t1;
export const PERCH = [716, 1726];                   // the cat's body centre crouched on the panel-3 ledge (strip)
export const REST4 = [474, 3596];                   // where it hangs in panel 4 (strip)
const S0 = [PERCH[0], PERCH[1] - STOPS[2]], S3 = [REST4[0], REST4[1] - STOPS[3]];
const S1 = [S0[0] - 110, S0[1] - 70], S2 = [S3[0] - 50, S3[1] - 60];
const bez = (a, b, c, d, u) => { const v = 1 - u; return v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d; };
export function leapProgress(t) {
  const u = clamp((t - T_LAUNCH) / (T_ARRIVE - T_LAUNCH));
  const burst = 1 - Math.pow(1 - clamp(u / 0.16), 2);          // the push-off: the first 16 % covers the jump arc fast
  return 0.2 * burst + 0.8 * MJ(u);                             // MJ(u) = the scroll's own reading-time progress
}
/** the leaping cat: strip position, screen position and strip-space velocity. Outside [T_LAUNCH, T_ARRIVE] the camera
 *  term is frozen, so once the cat has landed in panel 4 it stays on the page while the strip scrolls on. */
const camAt = (t) => scroll(clamp(t, T_LAUNCH, T_ARRIVE));
export function leap(t) {
  const p = leapProgress(t), s = camAt(t);
  const sx = bez(S0[0], S1[0], S2[0], S3[0], p), sy = bez(S0[1], S1[1], S2[1], S3[1], p);
  const h = 1 / 120, pa = leapProgress(t - h), pb = leapProgress(t + h);
  const vx = (bez(S0[0], S1[0], S2[0], S3[0], pb) - bez(S0[0], S1[0], S2[0], S3[0], pa)) / (2 * h);
  const vy = (bez(S0[1], S1[1], S2[1], S3[1], pb) + camAt(t + h) - bez(S0[1], S1[1], S2[1], S3[1], pa) - camAt(t - h)) / (2 * h);
  return { p, x: sx, y: sy + s, sx, sy, vx, vy, speed: Math.hypot(vx, vy) };
}

/** strip y of panel 3's slanted bottom border at x */
export const p3Bottom = (x) => { const [, , br, bl] = P.p3.poly; return bl[1] + (br[1] - bl[1]) * (x - bl[0]) / (br[0] - bl[0]); };
