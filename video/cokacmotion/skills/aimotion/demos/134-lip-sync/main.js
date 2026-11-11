/*
 * 134 · 아침 라디오 — 립싱크 · 한글 자모 → 입 모양 + 조음 결합
 *
 * Seven in the morning in a small radio booth. The lamp comes on, the minute hand clicks to 7:00, the ON AIR sign
 * lights, the host breathes in and says "좋은 아침입니다. 오늘은 바람이 조금 불어요." — then smiles, nods, and the
 * sign goes dark. No audio: the mouth is driven by a character-level TTS alignment (lipsync.js):
 *   text → Hangul decomposition → pronunciation rules → consonant / glide / vowel segments → viseme targets in a
 *   7-parameter mouth space → Cohen–Massaro dominance blend (anticipation and carry-over) → a Bézier mouth.
 * The same table drives the captions (per-syllable wipe + an on-air red tally), head nods on accented syllables,
 * the eyebrow lift on the emphasised word, blinks scheduled away from accents, the breath, and the VU needle.
 * Everything is a pure function of t: closed forms and tables baked in setup.
 */
import { defineDemo, rand, clamp, lerp, ramp, ease, track } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { ALIGNMENT, EMPHASIS, analyse, mouthAt, gesture, NP, JAW, WIDE, ROUND, UPPER, TEETH, TONGUE, PRESS } from './lipsync.js';

const W = 1080, H = 1920, D = 10, MG = 70, TAU = Math.PI * 2;
const SANS = `"${FONTS.pretendard.family}"`, SIGN = `"${FONTS.bebasNeue.family}"`;

// ================================================================== palette: warm studio, ink, one accent
const INK = '#2a1f1b';
const CREAM = '#fff4e3';
const WALL = '#f3e2c8';
const FOAM = '#d09a6a', FOAM_D = '#b9845a', FOAM_L = '#dcaa7b';
const WOOD = '#7e4a30', WOOD_L = '#a8683f';
const KNIT = '#4f7c77', KNIT_D = '#3f6563', KNIT_L = '#669590';
const SKIN = '#f6c8a0', SKIN_D = '#e4a57d', SKIN_L = '#ffe0c6';
const HAIR = '#3a2620', HAIR_L = '#5d3f32';
const GEAR = '#3a3335', GEAR_L = '#5a5053', GEAR_D = '#272123';
const LIP = '#e3988a', LIP_D = '#c4766b', MOUTH = '#4d1c23', TONGUE_C = '#ea8b86', TOOTH = '#fffaf1';
const ACC = '#ff4a38';                     // on-air red: the sign, the mic tally, the caption tally, the VU red zone

// ================================================================== the story clock (seconds)
const T_LAMP = 0.2;        // the booth lamp comes on (flickers once)
const T_ONAIR = 0.78;      // 7:00 — the ON AIR sign lights
const T_SMILE = 6.32;      // speech is over: the smile
const T_NOD = 7.05;        // a small nod
const T_DIM = 8.05;        // the sign goes dark; afterglow

const lampK = track([[0, 0], [T_LAMP, 0], [T_LAMP + 0.04, 0.85, ease.outCubic], [T_LAMP + 0.09, 0.2], [T_LAMP + 0.15, 0.95, ease.outCubic], [0.75, 1]]);
const onAirK = (t) => {
  if (t < T_ONAIR) return 0;
  const on = track([[T_ONAIR, 0], [T_ONAIR + 0.03, 1, ease.outCubic], [T_ONAIR + 0.07, 0.35], [T_ONAIR + 0.11, 1, ease.outCubic]])(t);
  return on * (1 - ramp(t, T_DIM, T_DIM + 0.55));
};
const afterK = (t) => ramp(t, T_DIM + 0.1, T_DIM + 0.6) * (1 - ramp(t, T_DIM + 0.6, T_DIM + 1.6));   // the lamp's warm afterglow

// ================================================================== layout
const NECK = [540, 1018];                  // head pivot (neck base); the head centre sits HEAD_UP·HS above it
const HS = 1.1;                            // host scale (the rig is drawn in its own units)
const HEAD_UP = 258;
const MOUTH_Y = 126;                       // head-local
const WIN = [64, 372, 440, 852];           // window: x0, y0, x1, y1
const DESK_Y = 1292, DESK_F = 1374;        // desk top back edge, front edge
const CAP_Y = [1514, 1612];                // caption baselines
const CAP_SIZE = 68;
const FOCUS = [540, 900];

const smooth01 = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const env = (t, a, b, c, d) => ramp(t, a, b) * (1 - ramp(t, c, d));
const hash01 = (a, b) => { let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; };

// ================================================================== the performance (closed forms of t)
const SPEECH = analyse(ALIGNMENT);
// non-speech mouth gestures share the coarticulation blend: the in-breath before speaking and at the full stop
//                         jaw  wide round upper teeth tongue press
SPEECH.segs.push(gesture([0.2, 0.15, 0.05, 0.3, 0.35, 0.05, 0], [1.4, 1, 1, 1, 1, 1, 1.4], 1.33, [0.16, 0.1]));
SPEECH.segs.push(gesture([0.14, 0.1, 0.05, 0.25, 0.3, 0.05, 0], [1.2, 1, 1, 1, 1, 1, 1.2], 3.33, [0.1, 0.08]));
const SPEECH_END = SPEECH.last;
// accents → head nods (impulse responses g(x) = x·e^(1−x), peak at τp); the final nod is slower and bigger
const NODS = SPEECH.syl.filter((s) => s.prom > 0).map((s) => ({ t: s.v0 - 0.07, a: s.prom === 2 ? 1 : 0.6, tp: 0.13 }));
NODS.push({ t: T_NOD, a: 1.9, tp: 0.2 });
// the emphasised word → an eyebrow lift window
const EMPH = EMPHASIS.map((e) => { const w = SPEECH.words.find((x) => x.text === e.word); return { ...e, t0: w.t0, t1: w.t1 }; });
const BROW_WIN = EMPH.filter((e) => e.kind === 'brow');
const nod = (t) => {
  let p = 0;
  for (const n of NODS) { const x = (t - n.t) / n.tp; if (x > 0 && x < 12) p += n.a * x * Math.exp(1 - x); }
  return p;
};
const rollT = track([[0, 0], [1.2, 0], [1.6, -1.2], [3.0, -2.2], [3.6, 0.6], [5.0, 1.8], [6.3, 2.4], [7.2, 3.4], [10, 2.6]]);
const yawT = track([[0, 0], [1.6, 0.12], [3.0, -0.1], [3.7, 0.1], [5.4, -0.06], [6.4, 0], [8.7, 0], [9.5, -0.62], [10, -0.66]]);
const gazeT = track([[0, [-0.35, 0.85]], [0.86, [-0.35, 0.85]], [1.08, [0, 0], ease.outCubic], [3.12, [0, 0]], [3.24, [-0.3, 0.55]], [3.5, [0, 0]],
  [8.75, [0, 0]], [9.35, [-0.95, -0.12]], [10, [-1, -0.14]]]);
const smileT = track([[0, 0.32], [1.2, 0.3], [1.55, 0.14], [T_SMILE, 0.14], [T_SMILE + 0.5, 1, ease.outCubic], [10, 1]]);
const breathT = track([[0, 0], [0.95, 0], [1.48, 1], [3.02, 0.3, ease.outCubic], [3.42, 0.85], [6.3, 0.12, ease.outCubic], [7.3, 0.5], [8.4, 0.25], [10, 0.4]]);
const SMILE_P = [0.13, 0.75, 0, 0.6, 0.9, 0.05, 0];   // the open smile, in the same mouth space

function browAt(t) {
  let b = 0.36 * env(t, 1.0, 1.4, 1.55, 1.85);                         // anticipation with the in-breath
  for (const e of BROW_WIN) b += env(t, e.t0 - 0.16, e.t0 + 0.02, e.t1 - 0.04, e.t1 + 0.28);
  for (const n of NODS.slice(0, -1)) { const x = (t - n.t + 0.05) / 0.12; if (x > 0 && x < 10) b += 0.18 * n.a * x * Math.exp(1 - x); }
  b += 0.32 * ramp(t, T_SMILE, T_SMILE + 0.6) - 0.12 * env(t, 9.2, 9.8, 11, 12);
  return b;
}

/** blinks: hashed candidates every ~2.7 s, moved off accents and the emphasis, pulled into pauses (setup, once) */
function scheduleBlinks() {
  const avoid = NODS.slice(0, -1).map((n) => [n.t - 0.12, n.t + 0.34]);
  for (const e of BROW_WIN) avoid.push([e.t0 - 0.2, e.t1 + 0.1]);
  avoid.push([T_ONAIR - 0.1, T_ONAIR + 0.25], [T_NOD - 0.15, T_NOD + 0.6]);
  const silent = [[0, SPEECH.first - 0.05], ...SPEECH.pauses, [SPEECH_END + 0.05, D]];
  const out = [];
  for (let k = 0; k < 4; k++) {
    const want = 0.62 + 2.68 * k + (hash01(1341, k) - 0.5) * 0.7;
    let best = want, cost = 1e9;
    for (let x = want - 0.7; x <= want + 0.7; x += 0.01) {
      const span = [x - 0.03, x + 0.24];
      const hit = avoid.some(([a, b]) => span[1] > a && span[0] < b);
      const quiet = silent.some(([a, b]) => x > a && x + 0.2 < b);
      const c = Math.abs(x - want) + (hit ? 5 : 0) - (quiet ? 0.35 : 0);
      if (c < cost) { cost = c; best = x; }
    }
    if (best < D - 0.3 && !out.some((b) => Math.abs(b - best) < 1.1)) out.push(+best.toFixed(3));
  }
  return out;
}
const blinkShape = (u) => (u < 0 || u > 0.23 ? 0 : u < 0.07 ? smooth01(u / 0.07) : u < 0.1 ? 1 : 1 - smooth01((u - 0.1) / 0.13));

// ================================================================== small drawing helpers
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
const el = (g, x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU); };
const ink = (g, w, c = INK) => { g.lineWidth = w; g.strokeStyle = c; g.stroke(); };
const fill = (g, c) => { g.fillStyle = c; g.fill(); };
const mkCanvas = (w, h, headless) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d', headless ? { willReadFrequently: true } : undefined)];
};

// ================================================================== the sunbeam: the window rectangle swept along the light direction
const SUNBEAM = (() => {
  const [x0, y0, x1, y1] = WIN, L = 1400, n = Math.hypot(1, 0.36), d = [1 / n, 0.36 / n];
  const at = (x, y) => [x + d[0] * L, y + d[1] * L];
  const hull = [[x0 + 30, y0], [x1, y0], at(x1, y0), at(x1, y1), at(x0 + 30, y1), [x0 + 30, y1]];
  const u = (x, y) => x * d[1] - y * d[0];                       // transverse coordinate (across the beam)
  return { o: [x0, (y0 + y1) / 2], d, L, hull, u, uMin: u(x1, y0), uMax: u(x0 + 30, y1) };
})();
const inBeam = (x, y) => {
  const B = SUNBEAM, u = B.u(x, y), e = 40;
  return x < WIN[0] + 30 ? 0 : smooth01((u - B.uMin) / e) * smooth01((B.uMax - u) / e) * (1 - smooth01((x - 860) / 260));
};

// ================================================================== baked layers (setup)
function bakeSky(g) {
  g.translate(MG, MG);
  const [x0, y0, x1, y1] = WIN;
  const sky = g.createLinearGradient(0, y0 - 60, 0, y1);
  sky.addColorStop(0, '#9fc6dc'); sky.addColorStop(0.55, '#f6dcc0'); sky.addColorStop(1, '#ffc996');
  g.fillStyle = sky; g.fillRect(x0 - 60, y0 - 60, x1 - x0 + 120, y1 - y0 + 120);
  // far hills and a low town, in two hazy values
  g.beginPath(); g.moveTo(x0 - 60, y1 - 92);
  for (let x = x0 - 60; x <= x1 + 60; x += 10) g.lineTo(x, y1 - 92 - 26 * Math.sin(x * 0.011 + 1.2) - 12 * Math.sin(x * 0.027));
  g.lineTo(x1 + 60, y1 + 60); g.lineTo(x0 - 60, y1 + 60); fill(g, '#e9c2b4');
  const R = rand(1342);
  g.fillStyle = '#d6a9a3';
  for (let x = x0 - 40; x < x1 + 40;) {
    const w = 26 + R() * 40, h = 24 + R() * 70;
    rr(g, x, y1 - 40 - h, w, h + 80, 4); g.fill();
    if (R() < 0.5) { rr(g, x + w * 0.3, y1 - 40 - h - 14, 6, 16, 2); g.fill(); }
    x += w + 2 + R() * 8;
  }
  g.fillStyle = '#c29590';
  for (let x = x0 - 60; x < x1 + 60;) { const w = 40 + R() * 50, h = 12 + R() * 30; rr(g, x, y1 - 18 - h, w, h + 60, 6); g.fill(); x += w + R() * 6; }
}

function foamPanel(g, x, y, s, vertical) {
  rr(g, x, y, s, s, 18); fill(g, FOAM_D);
  g.save(); rr(g, x + 4, y + 4, s - 8, s - 8, 15); g.clip();
  fill(g, FOAM);
  const n = 5, step = (s - 8) / n;
  for (let i = 0; i < n; i++) {   // wedge ridges: a lit face and a shaded groove each
    const a = (vertical ? x : y) + 4 + i * step;
    g.fillStyle = FOAM_L;
    if (vertical) g.fillRect(a + step * 0.08, y, step * 0.34, s); else g.fillRect(x, a + step * 0.08, s, step * 0.34);
    g.fillStyle = 'rgba(150,95,55,.32)';
    if (vertical) g.fillRect(a + step * 0.82, y, step * 0.18, s); else g.fillRect(x, a + step * 0.82, s, step * 0.18);
  }
  const sh = g.createLinearGradient(x, y, x + s, y + s);
  sh.addColorStop(0, 'rgba(255,235,205,.18)'); sh.addColorStop(1, 'rgba(90,50,25,.18)');
  g.fillStyle = sh; g.fillRect(x, y, s, s);
  g.restore();
}

function bakeWall(g) {
  g.translate(MG, MG);
  const [x0, y0, x1, y1] = WIN;
  // the upper wall (cream) with a ceiling strip
  const top = g.createLinearGradient(0, -MG, 0, 340);
  top.addColorStop(0, '#e6cfad'); top.addColorStop(1, WALL);
  g.fillStyle = top; g.fillRect(-MG, -MG, W + 2 * MG, 350 + MG);
  g.fillStyle = '#d6b892'; g.fillRect(-MG, -MG, W + 2 * MG, 26 + MG);
  // foam: a grid of wedge panels on dark battens; the window is cut out of the layer (the sky is behind it)
  g.fillStyle = '#4a342c'; g.fillRect(-MG, 338, W + 2 * MG, 1100);
  const S = 196, GAP = 10;
  for (let row = 0; row < 6; row++) for (let col = -1; col < 6; col++) {
    const x = -38 + col * (S + GAP), y = 348 + row * (S + GAP);
    if (x + S > x0 - 24 && x < x1 + 24 && y + S > y0 - 24 && y < y1 + 40) continue;
    foamPanel(g, x, y, S, (row + col) % 2 === 0);
  }
  g.fillStyle = WOOD_L; g.fillRect(-MG, 326, W + 2 * MG, 18);
  g.fillStyle = WOOD; g.fillRect(-MG, 340, W + 2 * MG, 6);
  // window: deep cream frame, sill
  rr(g, x0 - 24, y0 - 24, x1 - x0 + 48, y1 - y0 + 48, 24); fill(g, CREAM); ink(g, 4);
  g.fillStyle = '#e9d3b4'; g.fillRect(x0 - 8, y0 - 8, x1 - x0 + 16, 10);
  rr(g, x0 - 36, y1 + 16, x1 - x0 + 72, 24, 7); fill(g, '#ecdcc2'); ink(g, 4);
  g.save(); g.globalCompositeOperation = 'destination-out';
  rr(g, x0, y0, x1 - x0, y1 - y0, 14); g.fill();
  g.restore();
  rr(g, x0, y0, x1 - x0, y1 - y0, 14); ink(g, 4);
  // clock body (hands are drawn per frame)
  const [cx, cy] = CLOCK;
  el(g, cx + 6, cy + 9, 86, 86); fill(g, 'rgba(60,35,20,.16)');
  el(g, cx, cy, 86, 86); fill(g, WOOD_L); ink(g, 5);
  el(g, cx, cy, 70, 70); fill(g, CREAM); ink(g, 3);
  g.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU, r0 = i % 3 === 0 ? 50 : 56;
    g.beginPath(); g.moveTo(cx + r0 * Math.sin(a), cy - r0 * Math.cos(a)); g.lineTo(cx + 62 * Math.sin(a), cy - 62 * Math.cos(a)); ink(g, i % 3 === 0 ? 6 : 3.5);
  }
  // the lamp's cord, the sign's hangers
  g.beginPath(); g.moveTo(LAMP[0], -MG); g.lineTo(LAMP[0], LAMP[1] - 40); ink(g, 4);
  const [sx, sy] = SIGNPOS;
  g.fillStyle = '#5a4640'; g.fillRect(sx - 90, sy - 130, 10, 76); g.fillRect(sx + 80, sy - 130, 10, 76);
}
const CLOCK = [900, 176];
const LAMP = [178, 152];
const SIGNPOS = [540, 176];

function bakeDesk(g) {
  g.translate(MG, MG);
  // desk top (seen from a little above), a rounded front trim, the front panel
  const top = g.createLinearGradient(0, DESK_Y, 0, DESK_F);
  top.addColorStop(0, WOOD); top.addColorStop(1, WOOD_L);
  g.beginPath(); g.moveTo(-MG, DESK_Y); g.lineTo(W + MG, DESK_Y); g.lineTo(W + MG, DESK_F); g.lineTo(-MG, DESK_F); g.fillStyle = top; g.fill();
  g.beginPath(); g.moveTo(-MG, DESK_Y); g.lineTo(W + MG, DESK_Y); ink(g, 4);
  const front = g.createLinearGradient(0, DESK_F, 0, H + MG);
  front.addColorStop(0, '#5a3424'); front.addColorStop(0.35, '#432619'); front.addColorStop(1, '#2a1912');
  g.fillStyle = front; g.fillRect(-MG, DESK_F, W + 2 * MG, H - DESK_F + MG);
  // wood grain: long soft streaks (seeded)
  const R = rand(1343);
  g.save(); g.globalAlpha = 0.12; g.strokeStyle = '#1f120c'; g.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    const y = DESK_F + 30 + R() * (H - DESK_F), x = -MG + R() * (W + MG), len = 160 + R() * 420;
    g.lineWidth = 1.5 + R() * 3;
    g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + len * 0.3, y - 6 + R() * 12, x + len * 0.7, y - 6 + R() * 12, x + len, y + R() * 6 - 3); g.stroke();
  }
  g.restore();
  rr(g, -MG, DESK_F - 8, W + 2 * MG, 26, 13); fill(g, '#c98a5c'); ink(g, 4);
  g.fillStyle = 'rgba(255,240,215,.35)'; g.fillRect(-MG, DESK_F - 4, W + 2 * MG, 5);
  // the console: a slanted mixer strip with fader slots and a VU window
  const [kx, ky, kw, kh] = CONSOLE;
  g.beginPath(); g.moveTo(kx + 18, ky); g.lineTo(kx + kw - 18, ky); g.lineTo(kx + kw, ky + kh); g.lineTo(kx, ky + kh); g.closePath();
  fill(g, GEAR); ink(g, 4);
  g.fillStyle = GEAR_L; g.fillRect(kx + 20, ky + 4, kw - 40, 5);
  for (let i = 0; i < 5; i++) { const x = FADER_X(i); rr(g, x - 3, ky + 16, 6, kh - 28, 3); fill(g, GEAR_D); }
  const [vx, vy, vw, vh] = VU;
  rr(g, vx, vy, vw, vh, 10); fill(g, '#f7e7c4'); ink(g, 3.5);
  g.save(); rr(g, vx, vy, vw, vh, 10); g.clip();
  const [px, py] = [vx + vw / 2, vy + vh + 26];
  g.lineCap = 'round';
  for (let i = 0; i <= 10; i++) {
    const a = -0.82 + (i / 10) * 1.64, red = i >= 8;
    g.beginPath(); g.moveTo(px + 52 * Math.sin(a), py - 52 * Math.cos(a)); g.lineTo(px + (i % 5 === 0 ? 62 : 59) * Math.sin(a), py - (i % 5 === 0 ? 62 : 59) * Math.cos(a));
    ink(g, red ? 3 : 2, red ? ACC : INK);
  }
  g.beginPath(); g.arc(px, py, 56, -Math.PI / 2 + 0.5, -Math.PI / 2 + 0.82); ink(g, 4, ACC);
  g.restore();
  // the mug (cream, one ink stripe) — its steam is drawn per frame
  const [mx, my] = MUG;
  el(g, mx + 8, my + 4, 66, 10); fill(g, 'rgba(30,15,8,.3)');
  g.beginPath(); g.arc(mx - 58, my - 62, 26, Math.PI * 0.5, Math.PI * 1.5); ink(g, 12, INK); g.beginPath(); g.arc(mx - 58, my - 62, 26, Math.PI * 0.5, Math.PI * 1.5); ink(g, 5, '#efe0c8');
  g.beginPath(); g.moveTo(mx - 56, my - 120); g.lineTo(mx - 52, my - 6); g.quadraticCurveTo(mx, my + 6, mx + 52, my - 6); g.lineTo(mx + 56, my - 120); g.closePath();
  fill(g, '#f3e6d0'); ink(g, 4);
  g.save(); g.clip();
  g.fillStyle = 'rgba(180,120,80,.22)'; g.fillRect(mx + 18, my - 130, 50, 140);
  g.fillStyle = KNIT; g.fillRect(mx - 70, my - 74, 140, 14);
  g.restore();
  el(g, mx, my - 120, 56, 11); fill(g, '#5b3424'); ink(g, 4);
  el(g, mx, my - 118, 46, 7); fill(g, '#3e2117');
}
const CONSOLE = [612, 1302, 356, 62];
const VU = [812, 1310, 128, 50];
const MUG = [150, 1350];
const FADER_X = (i) => CONSOLE[0] + 38 + i * 32;

// the microphone on a desk-clamped boom arm (static; its tally LED is drawn per frame)
const MIC = { x: 752, y: 1080, a: -0.95 };   // grille centre; rotation that points the grille up-left at the mouth
function bakeMic(g) {
  g.translate(MG, MG);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const mc = Math.cos(MIC.a), ms = Math.sin(MIC.a);
  const base = [1000, DESK_Y + 6], elbow = [1052, 968], mount = [MIC.x - 160 * ms, MIC.y + 160 * mc];   // the yoke's foot
  // arm: two parallel tubes per segment, a spring along each
  const tube = (a, b, off) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(a[0] + nx * off * s, a[1] + ny * off * s); g.lineTo(b[0] + nx * off * s, b[1] + ny * off * s); ink(g, 13, INK); }
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(a[0] + nx * off * s, a[1] + ny * off * s); g.lineTo(b[0] + nx * off * s, b[1] + ny * off * s); ink(g, 6, GEAR_L); }
    g.beginPath();
    for (let i = 0; i <= 26; i++) { const k = 0.25 + (i / 26) * 0.45, w = (i % 2 ? 1 : -1) * (off + 5); g.lineTo(a[0] + dx * k + nx * w, a[1] + dy * k + ny * w); }
    ink(g, 2.5, '#8b8083');
  };
  tube(base, elbow, 9);
  tube(elbow, mount, 9);
  el(g, elbow[0], elbow[1], 17, 17); fill(g, GEAR); ink(g, 4);
  rr(g, base[0] - 34, base[1] - 10, 68, 26, 6); fill(g, GEAR); ink(g, 4);
  rr(g, base[0] - 12, base[1] - 46, 24, 44, 5); fill(g, GEAR_L); ink(g, 4);
  // cable along the arm
  g.beginPath(); g.moveTo(mount[0] + 30, mount[1] + 30); g.bezierCurveTo(950, 1220, 1020, 1110, elbow[0] + 12, elbow[1] + 30); ink(g, 5, GEAR_D);
  // the mic: a capsule with a grille, in a ring mount
  g.save();
  g.translate(MIC.x, MIC.y); g.rotate(MIC.a);
  // body: y from −64 (grille top) to +150
  rr(g, -44, -70, 88, 230, 44); fill(g, GEAR); ink(g, 5);
  g.save(); rr(g, -44, -70, 88, 230, 44); g.clip();
  g.fillStyle = GEAR_L; g.fillRect(-44, 40, 20, 140);
  // grille
  rr(g, -44, -70, 88, 104, 44); fill(g, '#cfc5ba');
  g.strokeStyle = '#8f857c'; g.lineWidth = 2.5;
  for (let y = -60; y < 34; y += 9) { g.beginPath(); g.moveTo(-44, y); g.lineTo(44, y); g.stroke(); }
  for (let x = -36; x <= 36; x += 9) { g.beginPath(); g.moveTo(x, -70); g.lineTo(x, 34); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-36, -70, 12, 104);
  g.restore();
  rr(g, -44, -70, 88, 104, 44); ink(g, 5);
  rr(g, -48, 30, 96, 14, 6); fill(g, GEAR_L); ink(g, 4);
  // yoke: a U bracket around the body, its pivot knobs on both sides
  g.beginPath(); g.moveTo(-58, 70); g.lineTo(-58, 132); g.quadraticCurveTo(-58, 150, -40, 150); g.lineTo(40, 150); g.quadraticCurveTo(58, 150, 58, 132); g.lineTo(58, 70);
  ink(g, 14, INK); ink(g, 7, GEAR_L);
  for (const s of [-1, 1]) { el(g, s * 58, 74, 11, 11); fill(g, GEAR); ink(g, 4); }
  g.restore();
}
const MIC_LED = () => { const c = Math.cos(MIC.a), s = Math.sin(MIC.a), lx = 0, ly = 62; return [MIC.x + lx * c - ly * s, MIC.y + lx * s + ly * c]; };

function bakeVignette(g) {
  const v = g.createRadialGradient(540, 820, 380, 540, 900, 1250);
  v.addColorStop(0, 'rgba(40,20,10,0)'); v.addColorStop(1, 'rgba(40,20,10,.5)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}
function bakeGrain(g, w, h) {
  const R = rand(1344), img = g.createImageData(w, h);
  for (let i = 0; i < w * h; i++) { const v = R() < 0.5 ? 0 : 255; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = Math.floor(R() * 16); }
  g.putImageData(img, 0, 0);
}

// ================================================================== the host (drawn in rig units around the neck base, scaled by HS)
function drawTorso(g, S) {
  g.save();
  g.translate(NECK[0] + S.bodyX, NECK[1] + S.bodyY);
  g.scale(HS, HS);
  g.lineJoin = 'round'; g.lineCap = 'round';
  // neck, with the chin's shadow on it
  rr(g, -54, -200, 108, 214, 30); fill(g, SKIN);
  g.save(); rr(g, -54, -200, 108, 214, 30); g.clip();
  el(g, 0, -166, 96, 58 + 6 * S.nod); fill(g, SKIN_D);
  g.restore();
  rr(g, -54, -200, 108, 214, 30); ink(g, 5);
  // sweater: sloped shoulders, sleeves falling to the desk
  const body = () => {
    g.beginPath();
    g.moveTo(-72, -38);
    g.bezierCurveTo(-150, -34, -246, -18, -298, 34);
    g.bezierCurveTo(-336, 74, -350, 160, -354, 270);
    g.lineTo(-362, 460); g.lineTo(362, 460); g.lineTo(354, 270);
    g.bezierCurveTo(350, 160, 336, 74, 298, 34);
    g.bezierCurveTo(246, -18, 150, -34, 72, -38);
    g.closePath();
  };
  body(); fill(g, KNIT);
  g.save(); body(); g.clip();
  const lg = g.createLinearGradient(-360, 0, 360, 0);
  lg.addColorStop(0, 'rgba(255,232,196,.26)'); lg.addColorStop(0.4, 'rgba(255,232,196,0)'); lg.addColorStop(0.62, 'rgba(25,45,45,0)'); lg.addColorStop(1, 'rgba(25,45,45,.32)');
  g.fillStyle = lg; g.fillRect(-370, -60, 740, 520);
  g.strokeStyle = 'rgba(28,52,50,.2)'; g.lineWidth = 4;
  for (let x = -230; x <= 230; x += 24) { g.beginPath(); g.moveTo(x, 36 + Math.abs(x) * 0.1); g.lineTo(x * 1.03, 460); g.stroke(); }
  for (const s of [-1, 1]) {   // sleeves: a seam from the shoulder and a slightly darker arm
    g.beginPath(); g.moveTo(s * 292, 40); g.bezierCurveTo(s * 262, 110, s * 256, 200, s * 262, 460); g.lineTo(s * 380, 460); g.lineTo(s * 380, 40); g.closePath();
    fill(g, 'rgba(40,70,68,.22)');
    g.beginPath(); g.moveTo(s * 292, 40); g.bezierCurveTo(s * 262, 110, s * 256, 200, s * 262, 460); ink(g, 4, KNIT_D);
  }
  g.restore();
  body(); ink(g, 5);
  // a ribbed crew neck with a cream shirt collar inside
  g.beginPath(); g.moveTo(-80, -40); g.quadraticCurveTo(0, 52, 80, -40); g.lineTo(60, -40); g.quadraticCurveTo(0, 24, -60, -40); g.closePath();
  fill(g, KNIT_L); ink(g, 4);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 6, 2); g.lineTo(s * 56, -40); g.lineTo(s * 66, 14); g.closePath(); fill(g, CREAM); ink(g, 4); }
  g.restore();
}

function drawEye(g, x, y, side, S) {
  const rx = 22, ry = 25;
  const c = clamp(S.blink), sq = S.squint, hap = S.happy, look = Math.max(0, S.gaze[1]);
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (hap > 0.5) {   // happy closed eye: ∩
    g.beginPath(); g.moveTo(x - rx, y + 8); g.quadraticCurveTo(x, y - 20, x + rx, y + 8); ink(g, 6.5);
    return;
  }
  // the upper lid rests a little low (relaxed) and follows the gaze down; the cheek pushes the lower lid up in a smile
  const top = ry * (1 - c) * (0.92 - 0.3 * look - 0.12 * sq), bot = ry * (1 - c) * (1 - 0.42 * sq);
  const ey = y + ry * 0.4 * c + 3 * sq + 3 * look;
  if (top < 2.6) {   // closed for the blink: a soft lash line
    g.beginPath(); g.moveTo(x - rx - 2, ey - 2); g.quadraticCurveTo(x, ey + 8, x + rx + 2, ey - 2); ink(g, 6);
    return;
  }
  const shape = () => { g.beginPath(); g.ellipse(x, ey, rx, top, 0, Math.PI, TAU); g.ellipse(x, ey, rx, Math.max(0.5, bot), 0, 0, Math.PI); };
  shape(); fill(g, '#fffaf2');
  g.save(); shape(); g.clip();
  const ix = x + S.gaze[0] * 9 + S.yaw * 5, iy = ey + S.gaze[1] * 9 + 1;
  el(g, ix, iy, 17.5, 18.5); fill(g, '#5e3c2c');
  el(g, ix, iy + 2, 12, 12); fill(g, '#4a2d22');
  el(g, ix, iy, 9.5, 10); fill(g, '#1f1411');
  el(g, ix - 5.5, iy - 6, 5.2, 5.2); fill(g, '#fffaf2');
  el(g, ix + 5.5, iy + 5.5, 2.4, 2.4); fill(g, '#fffaf2');
  g.beginPath(); g.ellipse(x, ey - top, rx + 2, 7, 0, 0, TAU); fill(g, 'rgba(120,70,50,.18)');   // lid shadow on the white
  g.restore();
  shape(); ink(g, 4);
  g.beginPath(); g.ellipse(x, ey, rx, top, 0, Math.PI * 1.03, Math.PI * 1.97); ink(g, 7);
}

/**
 * The parametric mouth. P = [jaw, wide, round, upper, teeth, tongue, press] (lipsync.js), curl = corner lift (smile).
 * Outer lips and the inner aperture are cubic Béziers whose control y is solved so the curve passes through the wanted
 * mid point: for P0.y = P3.y = c and P1.y = P2.y = k, B(½).y = (2c + 6k)/8 → k = (4m − c)/3.
 */
function drawMouth(g, P, curl, my) {
  const jaw = clamp(P[JAW], 0, 1.1), wide = P[WIDE], round = clamp(P[ROUND]), upper = clamp(P[UPPER]);
  const teeth = clamp(P[TEETH]), tongue = clamp(P[TONGUE]), press = clamp(P[PRESS]);
  const seal = (1 - press) * (1 - press);                         // ㅁㅂㅍ seal the lips whatever the jaw does
  const hw = 54 * (1 + 0.24 * wide - 0.34 * round + 0.07 * jaw) + 7 * curl;   // corner half-width
  const cy = my + 12 * jaw * seal - 10 * curl + 2 * press;          // corner height (a smile lifts the corners)
  const up = my - (5 * upper + 5 * jaw) * seal;                     // inner upper lip, mid point
  const lo = my + (50 * jaw + 3 * upper) * seal;                    // inner lower lip, mid point (rides the jaw)
  const gap = lo - up;
  const iw = hw * (0.9 - 0.3 * round);                              // rounding pulls the opening into an O
  const kx = lerp(0.6, 1.0, round);                                 // control x spread: 1 → round ends
  const tU = 6 + 7 * round - 3 * press, tL = 10 + 8 * round - 4 * press;   // protrusion shows more lip; a press rolls it in
  const K = (m, c) => (4 * m - c) / 3;
  g.lineCap = 'round'; g.lineJoin = 'round';

  // outer lips (the upper one with a small cupid's bow), a colour line instead of ink
  const oc = cy - 1, ohw = hw + 5;
  const outer = () => {
    g.beginPath();
    g.moveTo(-ohw, oc);
    g.bezierCurveTo(-ohw * 0.8, K(up - tU * 0.9, oc), -ohw * 0.45, up - tU - 3, -ohw * 0.17, up - tU - 1.5);
    g.quadraticCurveTo(0, up - tU + 3, ohw * 0.17, up - tU - 1.5);
    g.bezierCurveTo(ohw * 0.45, up - tU - 3, ohw * 0.8, K(up - tU * 0.9, oc), ohw, oc);
    g.bezierCurveTo(ohw * 0.75, K(lo + tL, oc), -ohw * 0.75, K(lo + tL, oc), -ohw, oc);
    g.closePath();
  };
  outer(); fill(g, LIP);
  g.save(); outer(); g.clip();
  el(g, 0, lo + tL * 0.5, ohw * 0.42, tL * 0.3); fill(g, 'rgba(255,228,212,.45)');   // lower-lip sheen
  g.restore();
  outer(); ink(g, 3, LIP_D);

  // the aperture (dark inner mouth), teeth and tongue clipped inside it
  const aOpen = clamp((gap - 1.2) / 3);
  const cavity = () => {
    g.beginPath();
    g.moveTo(-iw, cy);
    g.bezierCurveTo(-iw * kx, K(up, cy), iw * kx, K(up, cy), iw, cy);
    g.bezierCurveTo(iw * kx, K(lo, cy), -iw * kx, K(lo, cy), -iw, cy);
    g.closePath();
  };
  if (aOpen > 0) {
    g.save();
    g.globalAlpha = aOpen;
    cavity(); fill(g, MOUTH);
    g.save(); cavity(); g.clip();
    // tongue: body low in the mouth; its tip rises behind the upper teeth for ㄴ ㄷ ㄹ
    const h = Math.max(gap, 1);
    el(g, 0, lo + 4 - h * 0.12, iw * 0.78, h * 0.42 + 4); fill(g, TONGUE_C);
    if (tongue > 0.05) { el(g, 0, lerp(lo - h * 0.1, up + h * 0.3, tongue), iw * 0.42, h * 0.32 + 2); fill(g, TONGUE_C); }
    g.beginPath(); g.moveTo(0, lo - h * 0.05); g.lineTo(0, lo - h * (0.22 + 0.2 * tongue)); ink(g, 2.5, 'rgba(160,60,60,.5)');
    // upper teeth: a band under the upper lip; lower teeth show for the high spread vowels and ㅅ ㅈ ㅊ
    const tH = Math.min(3 + 11 * teeth, Math.max(2, gap * 0.62));
    rr(g, -iw * 0.86, up - 30, iw * 1.72, 30 + tH, [0, 0, 7, 7]); fill(g, TOOTH);
    const lowT = clamp((teeth - 0.45) / 0.5) * Math.min(1, 14 / Math.max(gap, 1));
    if (lowT > 0) { rr(g, -iw * 0.62, lo - 1 - Math.min(7 * lowT, gap * 0.25), iw * 1.24, 30, [6, 6, 0, 0]); fill(g, '#f3eadc'); }
    g.restore();
    cavity(); ink(g, 4.5);
    g.restore();
  }
  if (aOpen < 1) {   // the closed seam (a press straightens it)
    g.save();
    g.globalAlpha = 1 - aOpen;
    g.beginPath(); g.moveTo(-hw - 2, cy); g.bezierCurveTo(-hw * 0.5, K(my + 1.5 - 2 * press, cy), hw * 0.5, K(my + 1.5 - 2 * press, cy), hw + 2, cy); ink(g, 4.5);
    g.restore();
  }
  if (curl > 0.35) {   // smile dimples
    g.save(); g.globalAlpha = clamp((curl - 0.35) / 0.4);
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * (ohw - 1), oc - 9); g.quadraticCurveTo(s * (ohw + 6), oc - 3, s * (ohw + 2), oc + 5); ink(g, 3.2); }
    g.restore();
  }
}

const FRINGE = (g) => {   // the front hair: crown down to a side-swept fringe (head-local)
  g.beginPath();
  g.moveTo(-214, 24);
  g.bezierCurveTo(-236, -150, -132, -248, 0, -248);
  g.bezierCurveTo(132, -248, 236, -150, 214, 24);
  g.bezierCurveTo(206, -30, 192, -70, 160, -80);      // right side lock
  g.bezierCurveTo(150, -82, 140, -70, 132, -62);
  g.bezierCurveTo(118, -92, 92, -106, 56, -106);       // the sweep across the forehead
  g.bezierCurveTo(44, -104, 36, -94, 30, -86);
  g.bezierCurveTo(14, -106, -14, -118, -40, -126);
  g.bezierCurveTo(-50, -132, -56, -142, -60, -154);    // into the part
  g.bezierCurveTo(-82, -122, -122, -104, -162, -92);
  g.quadraticCurveTo(-176, -84, -184, -66);
  g.bezierCurveTo(-196, -40, -206, -10, -214, 24);
  g.closePath();
};

function drawHead(g, S) {
  const P = S.P, jaw = clamp(P[JAW]);
  const yaw = S.yaw, fx = yaw * 16, nodY = S.nod * 9;
  g.save();
  g.translate(NECK[0] + S.bodyX, NECK[1] + S.bodyY);
  g.scale(HS, HS);
  g.rotate((S.roll * Math.PI) / 180);
  g.translate(0, -HEAD_UP + S.nod * 4);
  g.lineJoin = 'round'; g.lineCap = 'round';
  const chin = 206 + 20 * jaw * (1 - 0.6 * clamp(P[PRESS])) - 3 * S.nod;
  const head = () => {
    g.beginPath();
    g.moveTo(0, -214);
    g.bezierCurveTo(124, -214, 210, -128, 210, -4);
    g.bezierCurveTo(210, 98, 152, chin - 4, fx * 0.3, chin);
    g.bezierCurveTo(-152, chin - 4, -210, 98, -210, -4);
    g.bezierCurveTo(-210, -128, -124, -214, 0, -214);
    g.closePath();
  };
  // back hair: a short bob behind the face
  g.beginPath();
  g.moveTo(-218, 76); g.bezierCurveTo(-250, -120, -150, -256, 0, -256); g.bezierCurveTo(150, -256, 250, -120, 218, 76);
  g.quadraticCurveTo(204, 112, 172, 100); g.lineTo(-172, 100); g.quadraticCurveTo(-204, 112, -218, 76); g.closePath();
  fill(g, HAIR); ink(g, 5);
  // face: soft light from the window side
  head();
  const fg = g.createRadialGradient(-90, -60, 20, -40, -10, 330);
  fg.addColorStop(0, SKIN_L); fg.addColorStop(0.45, SKIN); fg.addColorStop(1, SKIN_D);
  g.fillStyle = fg; g.fill();
  g.save(); head(); g.clip();
  g.save(); g.translate(fx * 0.55 + 6, nodY * 0.5 + 12); FRINGE(g); fill(g, 'rgba(196,120,86,.45)'); g.restore();   // the fringe's shadow
  el(g, fx * 0.4, chin + 8, 120, 34); fill(g, 'rgba(206,132,96,.3)');
  g.restore();
  head(); ink(g, 5);

  // features: they follow the nod (pitch) and slide with the yaw
  g.save();
  g.translate(fx, nodY);
  const lift = 9 * S.smile;
  for (const s of [-1, 1]) {
    const bx = s * 124 + fx * 0.2, by = 98 - lift;
    const bg = g.createRadialGradient(bx, by, 4, bx, by, 44);
    bg.addColorStop(0, 'rgba(244,128,108,.5)'); bg.addColorStop(1, 'rgba(244,128,108,0)');
    g.fillStyle = bg; g.fillRect(bx - 50, by - 40, 100, 80);
  }
  for (const s of [-1, 1]) drawEye(g, s * 80, 10, s, S);
  // nose
  el(g, 5, 64, 21, 14); fill(g, 'rgba(214,138,100,.45)');
  g.beginPath(); g.moveTo(-13, 67); g.quadraticCurveTo(-1, 83, 16, 69); ink(g, 4.5);
  el(g, -6, 57, 6, 4.5); fill(g, 'rgba(255,244,232,.75)');
  drawMouth(g, P, S.smile, MOUTH_Y);
  g.restore();

  // front hair
  g.save();
  g.translate(fx * 0.55, nodY * 0.5);
  FRINGE(g); fill(g, HAIR);
  g.save(); FRINGE(g); g.clip();
  g.beginPath(); g.moveTo(-150, -196); g.bezierCurveTo(-60, -230, 60, -230, 150, -184); ink(g, 11, HAIR_L);
  g.beginPath(); g.moveTo(-40, -164); g.bezierCurveTo(20, -130, 100, -124, 176, -96); ink(g, 6, HAIR_L);
  g.beginPath(); g.moveTo(-80, -150); g.bezierCurveTo(-120, -130, -160, -116, -196, -60); ink(g, 5, HAIR_L);
  g.restore();
  FRINGE(g); ink(g, 5);
  g.restore();

  // brows sit over the fringe
  g.save();
  g.translate(fx, nodY);
  for (const s of [-1, 1]) {
    const b = S.brow * 15;
    g.beginPath(); g.moveTo(s * 38, -60 - b * 1.1); g.quadraticCurveTo(s * 78, -84 - b * 1.2, s * 116, -62 - b * 0.7);
    ink(g, 13, HAIR);
  }
  g.restore();

  // headphones: band over the hair, cups over the ears (they slide against the features with the yaw)
  const cupX = 224, cupDx = -yaw * 6;
  const band = () => { g.beginPath(); g.moveTo(-cupX + 6 + cupDx, -40); g.bezierCurveTo(-250 + cupDx, -336, 250 + cupDx, -336, cupX - 6 + cupDx, -40); };
  band(); ink(g, 34, INK);
  band(); ink(g, 24, GEAR);
  g.beginPath(); g.moveTo(-150 + cupDx, -226); g.bezierCurveTo(-90 + cupDx, -262, 90 + cupDx, -262, 150 + cupDx, -226); ink(g, 6, GEAR_L);
  for (const s of [-1, 1]) {
    const x = s * cupX + cupDx * (s < 0 ? 1.2 : 0.8);
    rr(g, x - 16, -64, 32, 50, 8); fill(g, GEAR); ink(g, 4);
    rr(g, x - 38, -22, 76, 132, 34); fill(g, GEAR); ink(g, 5);
    rr(g, x - 26 + s * 10, -6, 40, 100, 20); fill(g, GEAR_L);
    el(g, x + s * 8, 44, 13, 30); fill(g, GEAR_D);
    rr(g, x - s * 30 - 9, -16, 18, 120, 9); fill(g, GEAR_D); ink(g, 3.5);
  }
  g.restore();
}

// ================================================================== the demo
defineDemo({
  id: '134-lip-sync',
  title: '아침 라디오',
  tech: '립싱크 · 한글 자모 → 입 모양 + 조음 결합',
  duration: D,
  background: '#2a1f1b',

  async setup(api) {
    const { ctx } = api.canvas({ type: '2d', attrs: api.headless ? { willReadFrequently: true } : undefined });
    this.g = ctx;
    const capText = ALIGNMENT.map((r) => r[0]).join('');
    await fontReady(`800 ${CAP_SIZE}px ${SANS}`, capText);
    await fontReady(`400 96px ${SIGN}`, 'ON AIR');

    // ---------------- captions: two lines from the alignment, one box per character (measured once)
    const g0 = ctx;
    g0.font = `800 ${CAP_SIZE}px ${SANS}`;
    const lines = [[]];
    ALIGNMENT.forEach(([ch, t0, t1], i) => {
      const L = lines[lines.length - 1];
      if (ch === ' ' && L.length && /[.!?]/.test(L[L.length - 1].ch)) { lines.push([]); return; }
      L.push({ ch, t0, t1, i });
    });
    this.lines = lines.map((L, li) => {
      const text = L.map((c) => c.ch).join('');
      const w = g0.measureText(text).width, x0 = W / 2 - w / 2;
      let pre = '';
      for (const c of L) { c.x = x0 + g0.measureText(pre).width; c.w = g0.measureText(c.ch).width; pre += c.ch; c.syl = !!/[가-힣]/.test(c.ch); }
      return { text, x0, w, y: CAP_Y[li], chars: L, t0: L.find((c) => c.syl).t0, t1: L.filter((c) => c.syl).pop().t1 };
    });
    this.sylBoxes = this.lines.flatMap((L, li) => L.chars.filter((c) => c.syl).map((c) => ({ ...c, li, y: L.y })));

    // ---------------- blinks, VU ballistics (a damped 2nd-order needle driven by the speech level)
    this.blinks = scheduleBlinks();
    const R = rand(1345);
    this.motes = Array.from({ length: 70 }, () => ({ x: 120 + R() * 820, y: 380 + R() * 900, vx: 4 + R() * 8, vy: -3 - R() * 6, f: 0.08 + R() * 0.15, ph: R() * TAU, r: 1.8 + R() * 2.8, a: 0.5 + R() * 0.5 }));
    const HZ = 120, N = Math.ceil(D * HZ) + 2, vu = new Float32Array(N), P = new Float32Array(NP);
    let x = 0, v = 0;
    const wn = TAU * 2.1, z = 0.72, dt = 1 / HZ;
    for (let i = 0; i < N; i++) {
      const t = i * dt;
      mouthAt(SPEECH.segs, t, P);
      const speaking = t > SPEECH.first - 0.05 && t < SPEECH_END + 0.05 && !SPEECH.pauses.some(([a, b]) => t > a + 0.02 && t < b - 0.02);
      const e = speaking ? clamp(0.25 + 0.95 * P[JAW] + 0.25 * P[ROUND]) : 0;
      for (let k = 0; k < 4; k++) { const a = wn * wn * (e - x) - 2 * z * wn * v; v += a * dt / 4; x += v * dt / 4; }
      vu[i] = x;
    }
    this.vu = (t) => { const f = clamp(t * HZ, 0, N - 1.001), i = Math.floor(f); return lerp(vu[i], vu[i + 1], f - i); };

    // ---------------- baked layers
    const hl = api.headless;
    const bw = W + 2 * MG, bh = H + 2 * MG;
    const mk = (draw) => { const [c, g] = mkCanvas(bw, bh, hl); draw(g); return c; };
    this.sky = mk(bakeSky);
    this.wall = mk(bakeWall);
    this.desk = mk(bakeDesk);
    this.mic = mk(bakeMic);
    { const [c, g] = mkCanvas(W, H, hl); bakeVignette(g); this.vig = c; }
    { const [c, g] = mkCanvas(256, 256, hl); bakeGrain(g, 256, 256); this.grain = ctx.createPattern(c, 'repeat'); }
    // touch every layer once so the first real frame does not differ from a revisit
    for (const c of [this.sky, this.wall, this.desk, this.mic, this.vig]) ctx.drawImage(c, 0, 0);
    ctx.reset();
  },

  pose(t) {
    const P = mouthAt(SPEECH.segs, t);
    const so = ramp(t, T_SMILE, T_SMILE + 0.55);
    for (let p = 0; p < NP; p++) P[p] = lerp(P[p], SMILE_P[p], 0.88 * so);
    const n = nod(t);
    let blink = 0;
    for (const b of this.blinks) blink = Math.max(blink, blinkShape(t - b));
    const hap = env(t, T_NOD - 0.08, T_NOD + 0.04, T_NOD + 0.55, T_NOD + 0.62);
    const br = breathT(t) + 0.12 * Math.sin(TAU * 0.27 * t);
    return {
      P, smile: smileT(t), nod: n, roll: rollT(t) + 0.6 * Math.sin(TAU * 0.13 * t), yaw: yawT(t),
      brow: browAt(t), browIn: 0, blink, happy: hap, squint: 0.75 * so,
      gaze: gazeT(t), bodyY: -11 * br + 2 * n, bodyX: 0,
    };
  },

  frame(t) {
    const g = this.g;
    g.reset();
    const lamp = lampK(t), air = onAirK(t), after = afterK(t);
    const zoom = 1 + 0.035 * ease.inOutCubic(clamp((t - 0.4) / 6.2)) + 0.012 * ramp(t, 6.6, 10);
    const cam = (f) => {
      const s = 1 + (zoom - 1) * f;
      g.setTransform(s, 0, 0, s, FOCUS[0] * (1 - s), FOCUS[1] * (1 - s) - 6 * f * ramp(t, 0.4, 6.6));
    };

    // ---------------- background: sky (far), wall (mid)
    cam(0.45);
    g.drawImage(this.sky, -MG, -MG);
    const [x0, y0, x1, y1] = WIN;
    g.save();
    g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    const sunY = 690 - 26 * (t / D), sunX = 176;
    const sg = g.createRadialGradient(sunX, sunY, 10, sunX, sunY, 230);
    sg.addColorStop(0, 'rgba(255,246,220,.95)'); sg.addColorStop(0.18, 'rgba(255,226,170,.6)'); sg.addColorStop(1, 'rgba(255,210,150,0)');
    g.fillStyle = sg; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    el(g, sunX, sunY, 34, 34); fill(g, '#fff6e0');
    // two soft clouds drifting with the breeze
    for (const [cx, cy, s, sp] of [[120, 470, 1, 7], [330, 560, 0.75, 11]]) {
      const x = cx + sp * t;
      g.fillStyle = 'rgba(255,248,238,.8)';
      el(g, x, cy, 60 * s, 18 * s); g.fill(); el(g, x - 30 * s, cy + 4, 36 * s, 14 * s); g.fill(); el(g, x + 26 * s, cy - 8 * s, 34 * s, 20 * s); g.fill();
    }
    // two birds cross the window in the afterglow
    for (const [d, yy] of [[0, 520], [0.35, 548]]) {
      const u = (t - 7.6 - d) / 2.6;
      if (u > 0 && u < 1) {
        const bx = lerp(x0 - 30, x1 + 20, u), by = yy - 40 * u, f = Math.sin(TAU * 3.2 * (t - d));
        g.beginPath(); g.moveTo(bx - 11, by - 4 * f); g.quadraticCurveTo(bx - 4, by - 2, bx, by + 2); g.quadraticCurveTo(bx + 4, by - 2, bx + 11, by - 4 * f); ink(g, 3, '#7a5a5c');
      }
    }
    g.restore();
    cam(0.8);
    g.drawImage(this.wall, -MG, -MG);
    // clock: 6:59 → 7:00 exactly when the sign lights
    {
      const [cx, cy] = CLOCK, sec = 52 + t * 1.0, minute = t < T_ONAIR ? 59 : 60 + (t - T_ONAIR) / 60;
      const tick = t < T_ONAIR ? 0 : Math.exp(-(t - T_ONAIR) * 14) * Math.sin((t - T_ONAIR) * 60) * 0.06;
      const hand = (a, r, w, c = INK) => { g.beginPath(); g.moveTo(cx - 10 * Math.sin(a), cy + 10 * Math.cos(a)); g.lineTo(cx + r * Math.sin(a), cy - r * Math.cos(a)); ink(g, w, c); };
      g.lineCap = 'round';
      hand(((7 + minute / 60 - 1) / 12) * TAU, 36, 8);
      hand((minute / 60) * TAU + tick, 54, 5.5);
      hand((Math.floor(sec) / 60) * TAU, 58, 2.5, '#9b6a4a');
      el(g, cx, cy, 6, 6); fill(g, INK);
    }
    // the lamp: shade + bulb + its pool of light on the wall
    {
      const [lx, ly] = LAMP;
      const k = lamp, glowA = 0.7 * k + 0.3 * after;
      if (glowA > 0.003) {
        g.save(); g.globalCompositeOperation = 'screen';
        const lg = g.createRadialGradient(lx, ly + 30, 10, lx, ly + 60, 380);
        lg.addColorStop(0, `rgba(255,214,150,${glowA})`); lg.addColorStop(0.35, `rgba(255,200,130,${0.35 * glowA})`); lg.addColorStop(1, 'rgba(255,214,150,0)');
        g.fillStyle = lg; g.fillRect(lx - 400, ly - 300, 800, 800);
        // the cone under the shade
        g.beginPath(); g.moveTo(lx - 84, ly + 36); g.lineTo(lx + 84, ly + 36); g.lineTo(lx + 300, ly + 520); g.lineTo(lx - 260, ly + 520); g.closePath();
        const cg = g.createLinearGradient(0, ly + 36, 0, ly + 520);
        cg.addColorStop(0, `rgba(255,224,170,${0.32 * glowA})`); cg.addColorStop(1, 'rgba(255,224,170,0)');
        g.fillStyle = cg; g.fill();
        g.restore();
      }
      g.lineJoin = 'round';
      g.beginPath(); g.moveTo(lx - 22, ly - 42); g.lineTo(lx + 22, ly - 42); g.lineTo(lx + 30, ly - 22); g.lineTo(lx - 30, ly - 22); g.closePath(); fill(g, GEAR); ink(g, 4);
      g.beginPath(); g.moveTo(lx - 30, ly - 24); g.bezierCurveTo(lx - 64, ly - 10, lx - 84, ly + 18, lx - 88, ly + 34); g.lineTo(lx + 88, ly + 34);
      g.bezierCurveTo(lx + 84, ly + 18, lx + 64, ly - 10, lx + 30, ly - 24); g.closePath(); fill(g, '#efd9a6'); ink(g, 4.5);
      el(g, lx, ly + 36, 40, 13); fill(g, k > 0.5 ? '#fffaea' : '#cbb999'); ink(g, 3.5);
      if (k > 0.5) { el(g, lx, ly + 36, 30, 8); fill(g, '#fff3c4'); }
    }
    // the ON AIR sign
    {
      const [sx, sy] = SIGNPOS, w = 360, h = 112;
      rr(g, sx - w / 2 + 6, sy - h / 2 + 9, w, h, 22); fill(g, 'rgba(70,40,25,.22)');
      rr(g, sx - w / 2, sy - h / 2, w, h, 22); fill(g, '#2f2224'); ink(g, 5);
      rr(g, sx - w / 2 + 12, sy - h / 2 + 12, w - 24, h - 24, 14);
      const dark = [92, 42, 40], lit = [255, 74, 56];
      const c = dark.map((d, i) => Math.round(lerp(d, lit[i], air)));
      fill(g, `rgb(${c})`);
      if (air > 0.01) {
        g.save(); rr(g, sx - w / 2 + 12, sy - h / 2 + 12, w - 24, h - 24, 14); g.clip();
        const hg = g.createRadialGradient(sx, sy, 10, sx, sy, 190);
        hg.addColorStop(0, `rgba(255,190,150,${0.55 * air})`); hg.addColorStop(1, 'rgba(255,190,150,0)');
        g.fillStyle = hg; g.fillRect(sx - w / 2, sy - h / 2, w, h);
        g.restore();
      }
      g.font = `400 84px ${SIGN}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '10px';
      const tc = [120, 70, 64].map((d, i) => Math.round(lerp(d, [255, 244, 227][i], air)));
      g.fillStyle = `rgb(${tc})`; g.fillText('ON AIR', sx + 5, sy + 5);
      g.letterSpacing = '0px';
      // a soft red bloom around the sign on the wall and ceiling
      if (air > 0.01) {
        g.save(); g.globalCompositeOperation = 'screen';
        const bg = g.createRadialGradient(sx, sy, 60, sx, sy, 420);
        bg.addColorStop(0, `rgba(255,90,60,${0.42 * air})`); bg.addColorStop(1, 'rgba(255,90,60,0)');
        g.fillStyle = bg; g.fillRect(sx - 440, sy - 300, 880, 720);
        g.restore();
      }
    }
    // ---------------- the host
    cam(1);
    const S = this.pose(t);
    drawTorso(g, S);
    drawHead(g, S);
    // a little red from the sign on the hair and band (rim light)
    if (air > 0.01) {
      g.save(); g.globalCompositeOperation = 'soft-light';
      const rg = g.createRadialGradient(540, 360, 40, 540, 470, 420);
      rg.addColorStop(0, `rgba(255,70,50,${0.5 * air})`); rg.addColorStop(1, 'rgba(255,70,50,0)');
      g.fillStyle = rg; g.fillRect(100, 200, 880, 700);
      g.restore();
    }

    // ---------------- desk, mug steam, VU needle, mic (foreground)
    cam(1.08);
    g.drawImage(this.desk, -MG, -MG);
    {
      // steam: three strands; the breeze of "바람이 조금 불어요" leans them over
      const [mx, my] = MUG, lean = 60 * ramp(t, 4.6, 6.2) + 25 * Math.sin(TAU * 0.11 * t);
      g.save(); g.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        const ph = k * 2.1, sx = mx - 22 + k * 22;
        g.beginPath();
        for (let i = 0; i <= 28; i++) {
          const h = i / 28, y = my - 132 - h * 230;
          const x = sx + 16 * h * Math.sin(TAU * (h * 1.25 - 0.42 * t) + ph) + lean * h * h;
          if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        const sg2 = g.createLinearGradient(0, my - 132, 0, my - 362);
        sg2.addColorStop(0, 'rgba(255,248,236,0)'); sg2.addColorStop(0.25, 'rgba(255,248,236,.5)'); sg2.addColorStop(1, 'rgba(255,248,236,0)');
        g.strokeStyle = sg2; g.lineWidth = 9 - k * 1.5; g.stroke();
      }
      g.restore();
      // VU needle
      const [vx, vy, vw, vh] = VU, px = vx + vw / 2, py = vy + vh + 26;
      const a = -0.82 + 1.64 * clamp(this.vu(t) * 0.92, -0.02, 1.04);
      g.save(); rr(g, vx, vy, vw, vh, 10); g.clip();
      g.beginPath(); g.moveTo(px, py); g.lineTo(px + 60 * Math.sin(a), py - 60 * Math.cos(a)); ink(g, 2.5);
      g.restore();
      // fader caps; the host's right hand pushes fader 2 up as the clock reaches 7:00
      const [, ky, , kh] = CONSOLE, push = 15 * ease.inOutCubic(clamp((t - 0.5) / 0.3));
      let hy = 0;
      for (let i = 0; i < 5; i++) {
        const y = ky + 18 + (kh - 34) * [0.62, 0.72, 0.3, 0.5, 0.42][i] - (i === 1 ? push : 0);
        if (i === 1) hy = y;
        rr(g, FADER_X(i) - 11, y, 22, 14, 4); fill(g, CREAM); ink(g, 3);
      }
      // cue sheet and hands resting on the desk (forearms come out from behind its back edge)
      g.lineJoin = 'round'; g.lineCap = 'round';
      g.beginPath(); g.moveTo(306, 1304); g.lineTo(520, 1298); g.lineTo(532, 1370); g.lineTo(298, 1376); g.closePath();
      fill(g, '#fbf3e3'); ink(g, 3.5);
      for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(322 + (i === 0 ? 0 : 6), 1318 + i * 14); g.lineTo(i === 0 ? 420 : 500 - i * 22, 1316 + i * 14); ink(g, i === 0 ? 5 : 3.5, i === 0 ? '#c9a98a' : '#ddc7ad'); }
      const arm = (ex, ey, hx, hy2, side, ang) => {
        // a tapered sleeve from behind the desk edge to the wrist, a cuff, then the hand
        const dx = hx - ex, dy = hy2 - ey, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
        const wE = 46, wW = 30, wx = hx - ux * 26, wy = hy2 - uy * 26;
        g.beginPath();
        g.moveTo(ex + nx * wE, ey + ny * wE);
        g.quadraticCurveTo((ex + wx) / 2 + nx * (wE + 6), (ey + wy) / 2 + ny * (wE + 6), wx + nx * wW, wy + ny * wW);
        g.lineTo(wx - nx * wW, wy - ny * wW);
        g.quadraticCurveTo((ex + wx) / 2 - nx * (wE + 2), (ey + wy) / 2 - ny * (wE + 2), ex - nx * wE, ey - ny * wE);
        g.closePath(); fill(g, KNIT); ink(g, 4.5);
        g.beginPath(); g.moveTo(wx + nx * wW, wy + ny * wW); g.lineTo(wx - nx * wW, wy - ny * wW); ink(g, 12, KNIT_D);
        g.save(); g.translate(hx, hy2); g.rotate(ang);
        g.beginPath(); g.moveTo(-34, -6); g.bezierCurveTo(-36, -26, 30, -28, 36, -6); g.bezierCurveTo(40, 14, 30, 26, 0, 26); g.bezierCurveTo(-30, 26, -38, 12, -34, -6); g.closePath();
        fill(g, SKIN); ink(g, 4.5);
        for (const fxp of [-14, 0, 14]) { g.beginPath(); g.moveTo(fxp + side * 4, 10); g.lineTo(fxp + side * 4, 25); ink(g, 3.2); }
        g.beginPath(); g.ellipse(-side * 30, -4, 13, 10, -side * 0.5, 0, TAU); fill(g, SKIN); ink(g, 4);
        el(g, side * 8, -10, 16, 6); fill(g, 'rgba(255,236,214,.6)');
        g.restore();
      };
      const bob = this.pose(t).bodyY * 0.25;
      arm(250, DESK_Y - 30 + bob, 384, 1334, -1, -0.1);
      arm(860, DESK_Y - 30 + bob, FADER_X(1) + 6, hy + 2, 1, 0.08);
    }
    cam(1.12);
    g.drawImage(this.mic, -MG, -MG);
    {
      const [lx, ly] = MIC_LED();
      el(g, lx, ly, 7, 7); fill(g, air > 0.05 ? ACC : '#5a2c2a'); ink(g, 2.5);
      if (air > 0.05) {
        g.save(); g.globalCompositeOperation = 'screen';
        const lg = g.createRadialGradient(lx, ly, 2, lx, ly, 40);
        lg.addColorStop(0, `rgba(255,90,60,${0.7 * air})`); lg.addColorStop(1, 'rgba(255,90,60,0)');
        g.fillStyle = lg; g.fillRect(lx - 40, ly - 40, 80, 80);
        g.restore();
      }
    }

    // ---------------- light: the morning sunbeam (stronger once the show is over), dust in it
    cam(0.9);
    {
      const k = 0.4 + 0.6 * ramp(t, T_DIM - 0.2, T_DIM + 1.5);
      const B = SUNBEAM;
      g.save();
      g.globalCompositeOperation = 'screen';
      g.beginPath(); B.hull.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      const sb = g.createLinearGradient(B.o[0], B.o[1], B.o[0] + B.d[0] * B.L, B.o[1] + B.d[1] * B.L);
      sb.addColorStop(0, `rgba(255,214,150,${0.2 * k})`); sb.addColorStop(0.55, `rgba(255,200,140,${0.1 * k})`); sb.addColorStop(1, 'rgba(255,200,140,0)');
      g.fillStyle = sb; g.fill();
      for (const m of this.motes) {
        const x = m.x + m.vx * t + 9 * Math.sin(TAU * m.f * t + m.ph), y = m.y + m.vy * t + 6 * Math.sin(TAU * m.f * 0.7 * t + m.ph * 1.7);
        const a = inBeam(x, y) * k * m.a * (0.6 + 0.4 * Math.sin(TAU * 0.5 * t + m.ph));
        if (a < 0.02) continue;
        el(g, x, y, m.r, m.r); g.fillStyle = `rgba(255,240,210,${a})`; g.fill();
      }
      g.restore();
    }

    // ---------------- the booth before the lamp, vignette, grain
    g.setTransform(1, 0, 0, 1, 0, 0);
    // before the lamp: a blue pre-dawn booth
    const dark = 0.84 * (1 - lamp);
    if (dark > 0.003) {
      g.globalCompositeOperation = 'multiply';
      g.fillStyle = `rgba(38,44,96,${dark})`; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'source-over';
    }
    g.drawImage(this.vig, 0, 0);

    // ---------------- captions (screen space): per-syllable wipe and the on-air tally
    this.captions(g, t, air);

    g.globalAlpha = 0.5; g.fillStyle = this.grain; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  },

  captions(g, t, air) {
    g.font = `800 ${CAP_SIZE}px ${SANS}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    const out = 1 - 0.18 * ramp(t, T_DIM, T_DIM + 0.6);   // the words stay; they settle a little when the sign goes dark
    this.lines.forEach((L, li) => {
      const inK = ease.outCubic(clamp((t - (li === 0 ? 1.18 : 3.22)) / 0.4));
      if (inK <= 0) return;
      const dy = (1 - inK) * 26;
      const a = inK * out;
      g.save();
      g.translate(0, dy);
      g.globalAlpha = a;
      // dim text, then the spoken part wiped in over its own sticker shadow (no blur)
      g.fillStyle = 'rgba(255,244,227,.26)'; g.fillText(L.text, L.x0, L.y);
      let xr = L.x0;
      for (const c of L.chars) {
        if (t >= c.t1) xr = c.x + c.w;
        else if (t > c.t0 && c.syl) { xr = c.x + c.w * smooth01((t - c.t0) / (c.t1 - c.t0)); break; }
        else break;
      }
      if (t >= L.t1) xr = L.x0 + L.w;
      if (xr > L.x0) {
        g.save(); g.beginPath(); g.rect(L.x0 - 10, L.y - CAP_SIZE, xr - L.x0 + 10, CAP_SIZE * 1.4); g.clip();
        g.fillStyle = 'rgba(20,10,6,.8)'; g.fillText(L.text, L.x0, L.y + 6);     // sticker shadow, no blur
        g.fillStyle = CREAM; g.fillText(L.text, L.x0, L.y);
        g.restore();
      }
      g.restore();
    });
    // the tally: a red bar under the syllable being spoken; it slides between syllables and waits as a dot in pauses
    const B = this.sylBoxes;
    let i = B.findIndex((b) => t < b.t1);
    if (i < 0) i = B.length - 1;
    const b = B[i], pv = B[Math.max(0, i - 1)];
    const inSyl = t >= b.t0;
    const slide = i === 0 ? 1 : ease.outCubic(clamp((t - (inSyl ? b.t0 - 0.05 : pv.t1)) / (inSyl ? 0.09 : Math.max(0.09, b.t0 - pv.t1))));
    const from = i === 0 ? b : pv;
    let cx = lerp(from.x + from.w / 2, b.x + b.w / 2, inSyl ? slide : (b.t0 - pv.t1 > 0.2 ? slide : 0));
    let cy = lerp(from.y, b.y, inSyl ? slide : (b.t0 - pv.t1 > 0.2 ? slide : 0)) + 22;
    let bw = lerp(from.w, b.w, slide) * 0.82;
    const speaking = (t >= b.t0 - 0.05 && t <= b.t1) ? 1 : 0;
    if (t > SPEECH_END) { const last = B[B.length - 1]; cx = last.x + last.w + 22; cy = last.y - 22; }
    const dot = t > SPEECH_END ? smooth01((t - SPEECH_END) / 0.25) : 1 - speaking;
    bw = lerp(bw, 14, smooth01(dot));
    const ta = air * ramp(t, 1.2, 1.5);
    if (ta > 0.01) {
      const yy = cy;
      g.save(); g.globalAlpha = ta;
      rr(g, cx - bw / 2, yy - 6, bw, 12, 6); fill(g, ACC);
      g.restore();
    }
  },
});
