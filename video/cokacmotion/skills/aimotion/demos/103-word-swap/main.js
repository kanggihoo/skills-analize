/*
 * 103 · 오늘의 빈칸 — word-swap kit: one sentence, one slot, five swaps with five grammars.
 *
 *   오늘 나는 [ 바쁜 ] 사람      the slot opens (the sentence makes room) and the first word drops in
 *     slice   바쁜 → 지친         knife lines, then six bands slide out right / in from the left, staggered
 *     prism   지친 → 느린         the slot is the front face of a square prism; it tips back and rolls the next face up
 *     width   느린 → 뒤처진       old syllables fold, the slot stretches (back.out), "사람" is shoved aside and leans
 *     block   뒤처진 → 모자란     amber + cream blocks wipe over, the word changes under them, they leave to the right
 *     reel    모자란 → 충분한     climax: a slot-machine reel through every word of the day, motion-blurred,
 *                                 overshoot stop, the slot floods amber, punch, rings, sparks; night turns to dawn
 *
 * One Canvas 2D. Everything is a closed-form function of t: each swap reads its local time u = t − at and draws.
 * Eases come from GSAP (gsap.parseEase) — pure functions, no timeline state. The slot width is a sum of eased steps,
 * and the line is laid out from it every frame, so the rest of the sentence slides (FLIP) instead of jumping.
 */
import { defineDemo, rand, clamp, lerp, W, H } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';

const D = 10;
const PF = `"${FONTS.pretendard.family}"`;
const WORDS = ['바쁜', '지친', '느린', '뒤처진', '모자란', '충분한'];
const SWAPS = [
  { kind: 'slice', at: 1.95, dur: 0.56 },
  { kind: 'prism', at: 3.2, dur: 0.72 },
  { kind: 'width', at: 4.6, dur: 0.74 },
  { kind: 'block', at: 6.0, dur: 0.62 },
  { kind: 'reel', at: 7.3, dur: 99 },                      // the reel owns the slot to the end
];
const ROLL = { wind: 0.14, spin: 0.8, p0: -0.16, vL: 6.5, w: 2 * Math.PI * 2.6, z: 7, shutter: 1 / 36 };
const T_LAND = SWAPS[4].at + ROLL.wind + ROLL.spin;          // 8.24 s: the reel stops on 충분한
const REEL = [4, 3, 2, 1, 0, 4, 3, 2, 1, 0, 5];               // word index of each reel item (top of the strip = last)
const T_OPEN = 0.5, T_WORD0 = 0.92;                           // intro: the slot opens, then the first word drops in

// palette: night indigo, cream type, one accent (amber); dawn warms the sky after the reel lands
const COL = { cream: '#fbf1e4', amber: '#ffbe55', ink: '#1d1540', tile: '#30285d' };
// type: three sizes (40 / 128 / 178), one family
const S0 = 40, S1 = 128, S2 = 178;
const F0 = `700 ${S0}px ${PF}`, F1 = `800 ${S1}px ${PF}`, F2 = `900 ${S2}px ${PF}`;
const TR1 = -0.035 * S1, TR2 = -0.03 * S2;                   // tighter tracking on the big lines
const L1Y = 770, L2Y = 1010, KICKY = 506, HISTY = 1212;       // baselines
const PADX = 34, PADY = 30, GAP = 40, BL = 24;                // slot padding, slot→"사람" gap, sprite bleed
const CX = W / 2, CY = 880;                                   // centre of the type group (drift, punch)
const SUN = { x: 540, y0: 1790, y1: 1470, r: 168 };
const MOON = { x: 846, y: 318, r: 44 };

const ez = (s) => gsap.parseEase(s);
const EXPO_OUT = ez('expo.out'), EXPO_IO = ez('expo.inOut'), P2IN = ez('power2.in');
const P3IO = ez('power3.inOut'), BACK14 = ez('back.out(1.4)'), BACK17 = ez('back.out(1.7)');
const BACK22 = ez('back.out(2.2)'), BACKIO = ez('back.inOut(1.25)'), SINE_IO = ez('sine.inOut');
const seg = (t, a, d) => clamp((t - a) / d);
const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const bell = (t, a, b) => (t <= a || t >= b ? 0 : Math.sin(Math.PI * (t - a) / (b - a)));

let G, HEADLESS = false;
const M = {};            // metrics + layout
const SPR = {};          // baked sprites
const BUF = {};          // per-frame scratch canvases (made + first drawn in setup)
let DUST = [], SPARKS = [], STARS = [], ROLLTAB = null;

function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  return { c, g: c.getContext('2d', HEADLESS ? { willReadFrequently: true } : undefined) };
}
function resetCtx(g) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.lineCap = 'butt'; g.lineJoin = 'miter'; g.lineWidth = 1; g.setLineDash([]);
  g.fillStyle = '#000'; g.strokeStyle = '#000'; g.filter = 'none';
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
}
function rr(g, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r);
}
const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;

// ------------------------------------------------------------------ text layout (setup)
function lay(text, font, track) {
  G.font = font;
  const syl = [];
  let x = 0;
  for (const ch of text) { const w = G.measureText(ch).width; syl.push({ ch, x, w }); x += w + track; }
  return { text, syl, w: x - track };
}
/** a word on a transparent strip as tall as the slot; glyph baseline at the slot's text baseline */
function wordSprite(L, color) {
  const { c, g } = mk(L.w + 2 * BL, M.TH);
  g.font = F2; g.fillStyle = color;
  for (const s of L.syl) g.fillText(s.ch, BL + s.x, M.BASE);
  return c;
}
function tilePath(g, x, y, w, h) { rr(g, x, y, w, h, 22); }
function paintTile(g, x, y, w, h, fill = COL.tile) {
  tilePath(g, x, y, w, h);
  g.fillStyle = fill; g.fill();
  // a lit top lip and a darker foot: the slot reads as a pressed-in plate
  const lg = g.createLinearGradient(0, y, 0, y + h);
  lg.addColorStop(0, 'rgba(255,255,255,0.13)'); lg.addColorStop(0.07, 'rgba(255,255,255,0.02)');
  lg.addColorStop(0.85, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(0,0,0,0.22)');
  g.fillStyle = lg; g.fill();
}
/** prism face: the plate with the word, opaque */
function faceSprite(i) {
  const L = M.WL[i], w = L.w + 2 * PADX;
  const { c, g } = mk(w, M.TH);
  paintTile(g, 0, 0, w, M.TH);
  g.font = F2; g.fillStyle = COL.amber;
  for (const s of L.syl) g.fillText(s.ch, PADX + s.x, M.BASE);
  return c;
}

// ------------------------------------------------------------------ backdrop (baked)
function hillY(x, k) {
  return k === 0
    ? 1478 + 34 * Math.sin(x / 190 + 0.4) + 20 * Math.sin(x / 83 + 2.1) - 40 * Math.exp(-(((x - 820) / 170) ** 2))
    : 1606 + 26 * Math.sin(x / 260 + 2.3) + 12 * Math.sin(x / 101 + 0.7) - 30 * Math.exp(-(((x - 150) / 140) ** 2));
}
function bakeSky(dawn) {
  const { c, g } = mk(W, H);
  const lg = g.createLinearGradient(0, 0, 0, H);
  if (!dawn) {
    lg.addColorStop(0, '#0f0c22'); lg.addColorStop(0.42, '#1b1640'); lg.addColorStop(0.7, '#2b2058'); lg.addColorStop(0.82, '#3a2763'); lg.addColorStop(1, '#1a1333');
  } else {
    lg.addColorStop(0, '#1f1748'); lg.addColorStop(0.38, '#3b2266'); lg.addColorStop(0.6, '#7a3470'); lg.addColorStop(0.74, '#d65a62'); lg.addColorStop(0.8, '#ff9a5e'); lg.addColorStop(1, '#3a1d3f');
  }
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // soft light pooled behind the sentence
  const rg = g.createRadialGradient(540, 900, 0, 540, 900, 760);
  rg.addColorStop(0, dawn ? 'rgba(255,150,120,0.20)' : 'rgba(126,100,230,0.20)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // thin concentric rings around the sun's place
  g.lineWidth = 3;
  for (const r of [430, 690, 950, 1210]) {
    g.beginPath(); g.arc(SUN.x, SUN.y1, r, 0, Math.PI * 2);
    g.strokeStyle = dawn ? 'rgba(255,214,170,0.10)' : 'rgba(190,170,255,0.06)'; g.stroke();
  }
  // vignette
  const vg = g.createRadialGradient(540, 860, 520, 540, 900, 1250);
  vg.addColorStop(0, 'rgba(6,4,20,0)'); vg.addColorStop(1, dawn ? 'rgba(30,8,30,0.45)' : 'rgba(4,2,14,0.6)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return c;
}
function bakeMoon() {
  const R = MOON.r, S = R * 7, { c, g } = mk(S, S), o = S / 2;
  g.beginPath(); g.arc(o, o, R, 0, Math.PI * 2); g.fillStyle = '#fff4dc'; g.fill();
  g.globalCompositeOperation = 'destination-out';
  g.beginPath(); g.arc(o + R * 0.58, o - R * 0.32, R * 0.84, 0, Math.PI * 2); g.fill();
  g.globalCompositeOperation = 'destination-over';          // the glow goes behind the crescent
  const gl = g.createRadialGradient(o, o, R * 0.6, o, o, S / 2);
  gl.addColorStop(0, 'rgba(220,210,255,0.24)'); gl.addColorStop(1, 'rgba(220,210,255,0)');
  g.fillStyle = gl; g.fillRect(0, 0, S, S);
  return c;
}
function bakeHills(dawn) {
  const top = 1380, { c, g } = mk(W, H - top);
  g.translate(0, -top);
  // far ridge with a few small houses
  g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 6) g.lineTo(x, hillY(x, 0));
  g.lineTo(W, H);
  g.fillStyle = dawn ? '#5b2a5c' : '#271d4d'; g.fill();
  if (dawn) {          // rim light where the sun touches the ridge
    g.beginPath();
    for (let x = 0; x <= W; x += 6) g.lineTo(x, hillY(x, 0) + 1);
    g.strokeStyle = 'rgba(255,186,130,0.55)'; g.lineWidth = 3; g.stroke();
  }
  const HOUSES = [[96, 0.9], [176, 1.1], [640, 1.0], [712, 0.8], [905, 1.15], [978, 0.9]];
  for (const [hx, s] of HOUSES) {
    const by = hillY(hx, 0) + 10, w = 44 * s, h = 34 * s;
    g.fillStyle = dawn ? '#4b2150' : '#1f1740';
    rr(g, hx - w / 2, by - h, w, h + 12, 5); g.fill();
    g.beginPath(); g.moveTo(hx - w / 2 - 6, by - h + 2); g.lineTo(hx, by - h - 22 * s); g.lineTo(hx + w / 2 + 6, by - h + 2); g.fill();
    if (!dawn) { g.fillStyle = 'rgba(255,196,110,0.85)'; rr(g, hx - 7 * s, by - h + 10 * s, 14 * s, 12 * s, 3); g.fill(); }
  }
  // near hill (the caption sits on it)
  g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 6) g.lineTo(x, hillY(x, 1));
  g.lineTo(W, H);
  g.fillStyle = dawn ? '#2a1236' : '#110c25'; g.fill();
  if (dawn) {
    g.beginPath();
    for (let x = 0; x <= W; x += 6) g.lineTo(x, hillY(x, 1) + 1);
    g.strokeStyle = 'rgba(255,150,120,0.35)'; g.lineWidth = 2.5; g.stroke();
  }
  return c;
}

// ------------------------------------------------------------------ the reel's position (baked once)
// spin: v(s) = A·s^1.15·(1−s)^2.1 + vL·s³ (quick launch, long braking, still moving vL at the stop),
// scaled so the strip travels exactly from p0 to the last item; then a damped spring takes the leftover speed.
function bakeRoll() {
  const N = REEL.length - 1, n = 4000, Ts = ROLL.spin;
  const shape = (s) => Math.pow(s, 1.15) * Math.pow(1 - s, 2.1);
  let I = 0;
  for (let i = 0; i < n; i++) I += shape((i + 0.5) / n) / n;
  const A = ((N - ROLL.p0) / Ts - ROLL.vL / 4) / I;
  const tab = new Float64Array(n + 1);
  let p = ROLL.p0;
  tab[0] = p;
  for (let i = 0; i < n; i++) { const s = (i + 0.5) / n; p += (A * shape(s) + ROLL.vL * s * s * s) * (Ts / n); tab[i + 1] = p; }
  const k = (N - ROLL.p0) / (tab[n] - ROLL.p0);           // remove the midpoint-rule residue
  for (let i = 0; i <= n; i++) tab[i] = ROLL.p0 + (tab[i] - ROLL.p0) * k;
  return tab;
}
/** reel position (in items) at time τ after the reel starts */
function reelP(tau) {
  const N = REEL.length - 1;
  if (tau <= 0) return 0;
  if (tau < ROLL.wind) return ROLL.p0 * (1 - Math.cos(Math.PI * tau / ROLL.wind)) / 2;   // wind-up
  const s = tau - ROLL.wind;
  if (s < ROLL.spin) {
    const f = (s / ROLL.spin) * (ROLLTAB.length - 1), i = Math.floor(f);
    return lerp(ROLLTAB[i], ROLLTAB[Math.min(i + 1, ROLLTAB.length - 1)], f - i);
  }
  const q = s - ROLL.spin;
  return N + (ROLL.vL / ROLL.w) * Math.exp(-ROLL.z * q) * Math.sin(ROLL.w * q);
}

// ------------------------------------------------------------------ the slot's width (FLIP source)
// sum of eased steps: each swap moves the width from its old word's plate to the new one's
const WSPEC = {
  slice: [0.15, 0.3, P3IO], prism: [0.2, 0.35, P3IO], width: [0.04, 0.58, BACK17],
  block: [0.27, 0.04, (p) => p], reel: [0.5, 0.4, P3IO],
};
const openK = (t) => BACK14(seg(t, T_OPEN, 0.46));
function slotW(t) {
  let w = M.TW[0] * openK(t);
  SWAPS.forEach((s, k) => {
    const d = M.TW[k + 1] - M.TW[k];
    if (d) { const [a, dd, e] = WSPEC[s.kind]; w += d * e(seg(t, s.at + a, dd)); }
  });
  return Math.max(0, w);
}
function line2(t) {
  const sw = slotW(t), gk = openK(t);
  const total = sw + GAP * gk + M.SARAM.w;
  const x0 = CX - total / 2;
  return { sw, x: x0, cx: x0 + sw / 2, saramX: x0 + sw + GAP * gk };
}

// ------------------------------------------------------------------ drawing: backdrop
function drawBackdrop(g, t, wD) {
  if (wD < 1) g.drawImage(SPR.night, 0, 0);
  if (wD > 0) { g.globalAlpha = wD; g.drawImage(SPR.dawn, 0, 0); g.globalAlpha = 1; }
  // stars (night only), twinkling
  if (wD < 1) {
    for (const s of STARS) {
      const a = (1 - wD) * s.a * (0.55 + 0.45 * Math.sin(t * s.f + s.ph));
      g.fillStyle = `rgba(240,232,255,${a.toFixed(3)})`;
      g.fillRect(s.x - s.r / 2, s.y - s.r / 2, s.r, s.r);
    }
  }
  // the moon sets as the day turns
  if (wD < 1) {
    g.globalAlpha = 1 - wD;
    g.drawImage(SPR.moon, MOON.x - SPR.moon.width / 2, MOON.y + 8 * Math.sin(t * 0.3) + 120 * wD - SPR.moon.height / 2);
    g.globalAlpha = 1;
  }
  // rays from the sun's place, swaying slowly; they wake up warm at dawn
  const sunY = lerp(SUN.y0, SUN.y1, SINE_IO(seg(t, T_LAND - 0.1, 1.5)));
  const rc = mix([168, 150, 255], [255, 206, 150], wD), ra = 0.045 + 0.075 * wD;
  const rg = g.createRadialGradient(SUN.x, sunY, 120, SUN.x, sunY, 1500);
  rg.addColorStop(0, rgba(rc, 0)); rg.addColorStop(0.18, rgba(rc, ra)); rg.addColorStop(1, rgba(rc, 0));
  g.fillStyle = rg;
  const NR = 22, rot = 0.025 * Math.sin(t * 0.45) + 0.012 * t;
  g.beginPath();
  for (let i = 0; i < NR; i++) {
    const a0 = Math.PI + (i / NR) * Math.PI + rot, a1 = a0 + (0.5 / NR) * Math.PI;
    g.moveTo(SUN.x, sunY); g.lineTo(SUN.x + Math.cos(a0) * 1800, sunY + Math.sin(a0) * 1800);
    g.lineTo(SUN.x + Math.cos(a1) * 1800, sunY + Math.sin(a1) * 1800);
  }
  g.fill();
  // the sun (rises only after the reel lands)
  if (wD > 0.001) {
    const gl = g.createRadialGradient(SUN.x, sunY, SUN.r * 0.6, SUN.x, sunY, 720);
    gl.addColorStop(0, `rgba(255,190,110,${(0.55 * wD).toFixed(3)})`); gl.addColorStop(1, 'rgba(255,140,90,0)');
    g.fillStyle = gl; g.fillRect(0, sunY - 720, W, 1440);
    const sg = g.createRadialGradient(SUN.x, sunY - 40, 10, SUN.x, sunY, SUN.r);
    sg.addColorStop(0, '#fff1c4'); sg.addColorStop(1, '#ffc46a');
    g.globalAlpha = Math.min(1, wD * 1.6);
    g.beginPath(); g.arc(SUN.x, sunY, SUN.r, 0, Math.PI * 2); g.fillStyle = sg; g.fill();
    g.globalAlpha = 1;
  }
  // hills
  const top = 1380;
  if (wD < 1) g.drawImage(SPR.hillsN, 0, top);
  if (wD > 0) { g.globalAlpha = wD; g.drawImage(SPR.hillsD, 0, top); g.globalAlpha = 1; }
  // drifting motes
  const dc = mix([236, 226, 255], [255, 214, 160], wD);
  for (const d of DUST) {
    const span = 1500, y = 1560 - ((d.y0 + d.v * t) % span), x = d.x0 + d.amp * Math.sin(t * d.f + d.ph);
    const a = d.a * (0.6 + 0.4 * Math.sin(t * d.f * 1.7 + d.ph * 2)) * (0.75 + 0.5 * wD);
    g.fillStyle = rgba(dc, a);
    g.beginPath(); g.arc(x, y, d.r, 0, Math.PI * 2); g.fill();
  }
}

// ------------------------------------------------------------------ drawing: the slot
function wordAt(g, i, cx, dy = 0, color = 'amber', alpha = 1) {
  const s = SPR.word[color][i];
  if (alpha <= 0) return;
  g.globalAlpha = alpha;
  g.drawImage(s, cx - s.width / 2, M.TT + dy);
  g.globalAlpha = 1;
}
function clipTile(g, L) {
  g.save();
  tilePath(g, L.x, M.TT, L.sw, M.TH);
  g.clip();
}

/** slice: knife lines, then each band is a conveyor: the old word's band leaves right, the new one rides in behind it */
function swapSlice(g, L, o, n, u) {
  const NB = 6, sO = SPR.word.amber[o], sN = SPR.word.amber[n];
  const run = L.sw / 2 + (sO.width + sN.width) / 4 + 6;   // the new band starts just left of the plate, flush behind the old
  paintTile(g, L.x, M.TT, L.sw, M.TH);
  clipTile(g, L);
  for (let b = 0; b < NB; b++) {
    const y0 = Math.round((b * M.TH) / NB), y1 = Math.round(((b + 1) * M.TH) / NB), h = y1 - y0;
    const p = seg(u, 0.1 + 0.034 * b, 0.32), e = EXPO_IO(p), x = run * e;
    if (p < 1) g.drawImage(sO, 0, y0, sO.width, h, L.cx - sO.width / 2 + x, M.TT + y0, sO.width, h);
    if (p > 0) g.drawImage(sN, 0, y0, sN.width, h, L.cx - sN.width / 2 + x - run, M.TT + y0, sN.width, h);
  }
  g.restore();
  // knife lines across the cuts (they cut first, then fade as the bands move)
  g.lineCap = 'round';
  for (let b = 1; b < NB; b++) {
    const y = M.TT + Math.round((b * M.TH) / NB), k = EXPO_OUT(seg(u, 0.012 * b, 0.14)), a = 1 - seg(u, 0.2, 0.3);
    if (k <= 0 || a <= 0) continue;
    const xa = L.x - 26, xb = xa + (L.sw + 52) * k;
    g.strokeStyle = `rgba(255,190,85,${(0.95 * a).toFixed(3)})`; g.lineWidth = 3;
    g.beginPath(); g.moveTo(xa, y); g.lineTo(xb, y); g.stroke();
  }
  g.lineCap = 'butt';
}

/** prism: the plate is the front face of a square prism turning about its horizontal axis */
function drawFace(g, L, sprite, phi) {
  const c = Math.cos(phi), s = Math.sin(phi);
  if (c < 0.003) return;
  const { c: fc, g: fg } = BUF.face, fw = sprite.width, TH = M.TH;
  fg.setTransform(1, 0, 0, 1, 0, 0); fg.globalAlpha = 1;
  fg.globalCompositeOperation = 'source-over';
  fg.clearRect(0, 0, fc.width, fc.height);
  fg.drawImage(sprite, 0, 0);
  // light from above: a face tipping up catches it, a face coming from below is in shade
  const shade = clamp(0.72 * (1 - c) - 0.3 * s, 0, 0.84);
  fg.globalCompositeOperation = 'source-atop';
  if (shade > 0) { fg.fillStyle = `rgba(8,5,26,${shade.toFixed(3)})`; fg.fillRect(0, 0, fw, TH); }
  if (s > 0) { fg.fillStyle = `rgba(255,226,180,${(0.12 * s * c).toFixed(3)})`; fg.fillRect(0, 0, fw, TH); }
  fg.globalCompositeOperation = 'source-over';
  const a = TH / 2, Dc = 1250, cy = M.TT + TH / 2, ROW = 2;
  for (let r = 0; r < TH; r += ROW) {
    const r1 = Math.min(TH, r + ROW), s0 = r - a, s1 = r1 - a;
    const y0 = -a * s + s0 * c, z0 = a - a * c - s0 * s, y1 = -a * s + s1 * c, z1 = a - a * c - s1 * s;
    const k0 = Dc / (Dc + z0), k1 = Dc / (Dc + z1), km = (k0 + k1) / 2;
    const py0 = cy + y0 * k0, py1 = cy + y1 * k1;
    g.drawImage(fc, 0, r, fw, r1 - r, L.cx - (fw * km) / 2, py0, fw * km, py1 - py0 + 0.6);
  }
}
function swapPrism(g, L, o, n, u) {
  const th = (Math.PI / 2) * BACKIO(seg(u, 0, 0.7));
  // a soft contact shadow under the turning body
  const lift = Math.abs(Math.sin(2 * th));
  g.fillStyle = `rgba(5,3,18,${(0.35 * lift).toFixed(3)})`;
  rr(g, L.x + 10, M.TT + M.TH + 4, L.sw - 20, 14, 7); g.fill();
  drawFace(g, L, SPR.face[o], th);
  drawFace(g, L, SPR.face[n], th - Math.PI / 2);
  // the leading edge glints as it passes the light
  const a = M.TH / 2, Dc = 1250, c = Math.cos(th), s = Math.sin(th);
  const y = -a * s + a * c, z = a - a * c - a * s, k = Dc / (Dc + z), ga = 0.75 * Math.max(0, Math.sin(2 * th));
  if (ga > 0.01) {
    const fw = SPR.face[o].width * k, py = M.TT + M.TH / 2 + y * k;
    const lg = g.createLinearGradient(L.cx - fw / 2, 0, L.cx + fw / 2, 0);
    lg.addColorStop(0, 'rgba(255,240,215,0)'); lg.addColorStop(0.5, `rgba(255,240,215,${ga.toFixed(3)})`); lg.addColorStop(1, 'rgba(255,240,215,0)');
    g.fillStyle = lg; g.fillRect(L.cx - fw / 2, py - 1.5, fw, 3);
  }
}

/** width: old syllables fold shut, the plate stretches to the new word, new syllables unfold from the middle out */
function swapWidth(g, L, o, n, u) {
  // ghost of the plate's first width (FLIP's "first" box), fading as the plate leaves it
  const ga = 0.55 * (1 - seg(u, 0.05, 0.45));
  if (ga > 0) {
    g.strokeStyle = `rgba(251,241,228,${ga.toFixed(3)})`; g.lineWidth = 2.5;
    tilePath(g, L.cx - M.TW[o] / 2 - 10, M.TT - 10, M.TW[o] + 20, M.TH + 20); g.stroke();
  }
  paintTile(g, L.x, M.TT, L.sw, M.TH);
  clipTile(g, L);
  const sO = SPR.word.amber[o], sN = SPR.word.amber[n];
  const draw = (spr, Lw, j, kx, ky, alpha) => {
    const syl = Lw.syl[j], left = L.cx - Lw.w / 2 + syl.x, mid = left + syl.w / 2;
    const sx = BL + syl.x, sw = syl.w;
    const dw = sw * kx, dh = M.TH * ky;
    if (dw < 0.3 || alpha <= 0) return;
    g.globalAlpha = alpha;
    g.drawImage(spr, sx, 0, sw, M.TH, mid - dw / 2, M.TT + M.BASE - M.BASE * ky, dw, dh);
    g.globalAlpha = 1;
  };
  const LO = M.WL[o], LN = M.WL[n];
  LO.syl.forEach((_, j) => {           // outer syllables fold first
    const p = seg(u, 0.0 + 0.05 * j, 0.24);
    if (p < 1) draw(sO, LO, j, 1 - P2IN(p), 1 + 0.12 * P2IN(p), 1);
  });
  const mid = (LN.syl.length - 1) / 2;
  LN.syl.forEach((_, j) => {           // new syllables open from the middle outwards
    const rank = Math.abs(j - mid), p = seg(u, 0.2 + 0.08 * rank, 0.42);
    if (p > 0) draw(sN, LN, j, BACK22(p), 1 + 0.16 * (1 - EXPO_OUT(p)), Math.min(1, p * 5));
  });
  g.restore();
}

/** block: an amber block, then a cream one, wipe over left→right; the word changes under them; they leave right */
function swapBlock(g, L, o, n, u) {
  paintTile(g, L.x, M.TT, L.sw, M.TH);
  if (u < 0.29) wordAt(g, o, L.cx);
  else { clipTile(g, L); wordAt(g, n, L.cx + -14 * (1 - EXPO_OUT(seg(u, 0.3, 0.4)))); g.restore(); }
  const bx = L.x - 10, bw = L.sw + 20;
  const band = (lead, tail, y, h, fill) => {
    const xa = bx + bw * tail, xb = bx + bw * lead;
    if (xb - xa < 0.5) return;
    g.fillStyle = fill; g.fillRect(xa, y, xb - xa, h);
  };
  band(EXPO_IO(seg(u, 0, 0.24)), EXPO_IO(seg(u, 0.34, 0.25)), M.TT - 10, M.TH + 20, COL.amber);
  band(EXPO_IO(seg(u, 0.07, 0.22)), EXPO_IO(seg(u, 0.29, 0.24)), M.TT + 14, M.TH - 28, COL.cream);
}

/** reel: a slot-machine strip of every word of the day, motion-blurred, braking onto 충분한 with an overshoot */
function swapReel(g, L, u, t) {
  const tau = u, p = reelP(tau), P = M.TH + 34;
  paintTile(g, L.x, M.TT, L.sw, M.TH);
  // the strip, averaged over the shutter: K samples added with alpha 1/K ('lighter' on a clear buffer = the mean)
  const blurPx = Math.abs(p - reelP(tau - ROLL.shutter)) * P;
  const K = Math.max(1, Math.min(28, Math.ceil(blurPx / 5)));
  const { c: bc, g: bg } = BUF.reel;
  bg.setTransform(1, 0, 0, 1, 0, 0); bg.globalAlpha = 1; bg.globalCompositeOperation = 'source-over';
  bg.clearRect(0, 0, bc.width, bc.height);
  bg.globalCompositeOperation = 'lighter';
  bg.globalAlpha = 1 / K;
  const ox = bc.width / 2, oy = 60;
  for (let k = 0; k < K; k++) {
    const pk = K === 1 ? p : reelP(tau - (ROLL.shutter * k) / (K - 1));
    for (let j = Math.floor(pk) - 1; j <= Math.ceil(pk) + 1; j++) {
      if (j < 0 || j >= REEL.length) continue;
      const y = (pk - j) * P;
      if (Math.abs(y) > M.TH + 4) continue;
      const s = SPR.word.amber[REEL[j]];
      bg.drawImage(s, ox - s.width / 2, oy + y);
    }
  }
  bg.globalAlpha = 1; bg.globalCompositeOperation = 'source-over';
  clipTile(g, L);
  g.drawImage(bc, L.cx - ox, M.TT - oy);
  // drum shading while it spins
  const act = sm(seg(u, 0, 0.12)) * (1 - sm(seg(t, T_LAND, 0.3)));
  if (act > 0.002) {
    const lg = g.createLinearGradient(0, M.TT, 0, M.TT + M.TH);
    lg.addColorStop(0, `rgba(6,3,20,${(0.75 * act).toFixed(3)})`); lg.addColorStop(0.3, 'rgba(6,3,20,0)');
    lg.addColorStop(0.7, 'rgba(6,3,20,0)'); lg.addColorStop(1, `rgba(6,3,20,${(0.75 * act).toFixed(3)})`);
    g.fillStyle = lg; g.fillRect(L.x, M.TT, L.sw, M.TH);
  }
  // jackpot: the plate floods amber from the centre, the word turns ink
  const tl = t - T_LAND;
  if (tl > 0) {
    const R = Math.hypot(L.sw, M.TH) / 2 + 12, rho = R * EXPO_OUT(seg(tl, 0, 0.34));
    if (rho > 0.5) {
      g.beginPath(); g.arc(L.cx, M.TT + M.TH / 2, rho, 0, Math.PI * 2); g.clip();
      g.fillStyle = COL.amber; g.fillRect(L.x, M.TT, L.sw, M.TH);
      const lg = g.createLinearGradient(0, M.TT, 0, M.TT + M.TH);
      lg.addColorStop(0, 'rgba(255,255,255,0.28)'); lg.addColorStop(0.12, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(120,40,0,0.18)');
      g.fillStyle = lg; g.fillRect(L.x, M.TT, L.sw, M.TH);
      const N = REEL.length - 1;
      wordAt(g, 5, L.cx, (p - N) * P, 'ink');
    }
  }
  g.restore();
  // pay-line pointers, slot-machine style, inside the plate's side padding while the reel runs
  const pa = BACK17(seg(u, 0, 0.3)) * (1 - EXPO_OUT(seg(t, T_LAND + 0.15, 0.3)));
  if (pa > 0.01) {
    const cy = M.TT + M.TH / 2, s = 13 * pa;
    g.fillStyle = COL.amber;
    for (const [x, d] of [[L.x + 12, 1], [L.x + L.sw - 12, -1]]) {
      g.beginPath(); g.moveTo(x + d * s * 1.1, cy); g.lineTo(x, cy - s); g.lineTo(x, cy + s); g.fill();
    }
  }
}

// ------------------------------------------------------------------ climax: rings shaped like the slot, sparks, glint
function drawImpact(g, L, t) {
  const tl = t - T_LAND;
  if (tl < 0 || tl > 1.4) return;
  for (const [d0, dl, grow, lw] of [[0, 0.62, 150, 7], [0.07, 0.55, 82, 4]]) {
    const q = seg(tl, d0, dl);
    if (q <= 0 || q >= 1) continue;
    const e = EXPO_OUT(q), inf = 12 + grow * e, a = (1 - q) * (1 - q) * 0.85;
    g.strokeStyle = `rgba(255,198,100,${a.toFixed(3)})`; g.lineWidth = lw * (1 - 0.6 * q);
    rr(g, L.x - inf, M.TT - inf, L.sw + 2 * inf, M.TH + 2 * inf, 22 + inf * 0.8); g.stroke();
  }
  g.lineCap = 'round';
  for (const s of SPARKS) {
    const q = tl / s.life;
    if (q <= 0 || q >= 1) continue;
    const pos = (tt) => { const f = (1 - Math.exp(-s.k * tt)) / s.k; return [s.x0(L) + s.vx * f, s.y0 + s.vy * f + 260 * tt * tt]; };
    const [x1, y1] = pos(tl), [x0, y0] = pos(Math.max(0, tl - 0.035));
    g.strokeStyle = s.warm ? `rgba(255,196,96,${(1 - q).toFixed(3)})` : `rgba(255,244,226,${(1 - q).toFixed(3)})`;
    g.lineWidth = s.w * (1 - 0.5 * q);
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  }
  g.lineCap = 'butt';
}
function drawGlint(g, L, t) {
  const q = seg(t, 8.95, 0.7);
  if (q <= 0 || q >= 1) return;
  const x = lerp(L.x - 120, L.x + L.sw + 160, P3IO(q)), y0 = M.TT, y1 = M.TT + M.TH, sk = 0.38 * M.TH, hw = 46;
  clipTile(g, L);
  g.globalCompositeOperation = 'lighter';
  const lg = g.createLinearGradient(x - hw, 0, x + hw, 0);
  lg.addColorStop(0, 'rgba(255,250,235,0)'); lg.addColorStop(0.5, 'rgba(255,250,235,0.6)'); lg.addColorStop(1, 'rgba(255,250,235,0)');
  g.fillStyle = lg;
  g.beginPath(); g.moveTo(x - hw + sk / 2, y0); g.lineTo(x + hw + sk / 2, y0); g.lineTo(x + hw - sk / 2, y1); g.lineTo(x - hw - sk / 2, y1); g.fill();
  g.globalCompositeOperation = 'source-over';
  g.restore();
}

// ------------------------------------------------------------------ one frame
function draw(t) {
  const g = G;
  resetCtx(g);
  const wD = sm(seg(t, T_LAND - 0.12, 1.45));
  drawBackdrop(g, t, wD);

  const L = line2(t);
  // halo behind the slot
  {
    const hc = mix([140, 112, 255], [255, 176, 92], wD);
    const beat = 0.16 + 0.14 * wD + (t > T_LAND ? 0.24 * Math.exp(-(t - T_LAND) / 0.45) : 0);
    const hg = g.createRadialGradient(L.cx, M.TT + M.TH / 2, 0, L.cx, M.TT + M.TH / 2, 560);
    hg.addColorStop(0, rgba(hc, beat)); hg.addColorStop(1, rgba(hc, 0));
    g.fillStyle = hg; g.fillRect(0, 300, W, 1200);
  }

  // the type group: slow push-in, a little handheld, punch + damped shake when the reel lands
  const tl = t - T_LAND;
  const punch = tl < 0 ? 0 : tl < 0.06 ? Math.sin((Math.PI / 2) * (tl / 0.06)) : Math.exp(-(tl - 0.06) / 0.16);
  const shk = tl < 0 ? 0 : 11 * Math.exp(-tl / 0.15);
  const s = 1 + 0.022 * (t / D) + 0.05 * punch;
  const hx = 2.2 * Math.sin(0.9 * t + 0.3) + shk * Math.sin(tl * 2 * Math.PI * 13);
  const hy = 1.6 * Math.sin(1.3 * t + 1.1) + 0.7 * shk * Math.sin(tl * 2 * Math.PI * 17 + 1);
  const base = new DOMMatrix([s, 0, 0, s, CX - CX * s + hx, CY - CY * s + hy]);
  g.setTransform(base);
  drawImpact(g, L, t);                       // rings + sparks sit behind the type

  // kicker
  {
    const p = seg(t, 0.06, 0.6), a = Math.min(1, p * 3);
    if (a > 0) {
      const y = KICKY + 22 * (1 - EXPO_OUT(p));
      g.globalAlpha = a;
      g.strokeStyle = 'rgba(251,241,228,0.38)'; g.lineWidth = 2.5;
      const w = M.KICK.w + 64;
      rr(g, CX - w / 2, y - 46, w, 66, 33); g.stroke();
      g.font = F0; g.fillStyle = 'rgba(251,241,228,0.82)';
      for (const c of M.KICK.syl) g.fillText(c.ch, CX - M.KICK.w / 2 + c.x, y);
      g.globalAlpha = 1;
    }
  }
  // line 1: 오늘 나는 (syllables pop up)
  g.font = F1; g.fillStyle = COL.cream;
  M.LINE1.syl.forEach((c, i) => {
    const p = seg(t, 0.14 + 0.055 * i, 0.62);
    if (p <= 0) return;
    g.globalAlpha = Math.min(1, p * 4);
    g.fillText(c.ch, CX - M.LINE1.w / 2 + c.x, L1Y + 70 * (1 - BACK17(p)));
  });
  g.globalAlpha = 1;

  // the slot
  if (L.sw > 1) {
    const k = SWAPS.findIndex((sw) => t >= sw.at && t < sw.at + sw.dur);
    const cur = SWAPS.reduce((n, sw, i) => (t >= sw.at + sw.dur ? i + 1 : n), 0);
    if (k < 0 && cur === 0) {                       // intro: empty plate, then the first word drops in
      g.globalAlpha = Math.min(1, seg(t, T_OPEN, 0.12));
      paintTile(g, L.x, M.TT, L.sw, M.TH);
      g.globalAlpha = 1;
      const p = seg(t, T_WORD0, 0.5);
      if (p > 0) { clipTile(g, L); wordAt(g, 0, L.cx, -M.TH * 0.9 * (1 - BACK14(p))); g.restore(); }
    } else if (k < 0) {
      paintTile(g, L.x, M.TT, L.sw, M.TH);
      wordAt(g, cur, L.cx);
    } else {
      const sw = SWAPS[k], u = t - sw.at;
      if (sw.kind === 'slice') swapSlice(g, L, k, k + 1, u);
      else if (sw.kind === 'prism') swapPrism(g, L, k, k + 1, u);
      else if (sw.kind === 'width') swapWidth(g, L, k, k + 1, u);
      else if (sw.kind === 'block') swapBlock(g, L, k, k + 1, u);
      else swapReel(g, L, u, t);
    }
    drawGlint(g, L, t);
    // underline: the blank of a fill-in-the-blank, always as wide as the plate
    const bk = EXPO_OUT(seg(t, T_OPEN + 0.08, 0.5)), thick = 10 + 8 * (tl > 0 ? Math.exp(-tl / 0.12) : 0);
    let kick = 0;
    for (const sw of SWAPS.slice(0, 4)) kick = Math.max(kick, bell(t, sw.at + sw.dur * 0.55, sw.at + sw.dur * 0.55 + 0.3));
    const bw = L.sw * bk * (1 + 0.035 * kick);
    if (bw > 1) {
      g.fillStyle = COL.amber;
      rr(g, L.cx - bw / 2, M.TT + M.TH + 18, bw, thick, thick / 2); g.fill();
    }
  }
  // 사람 — placed from the slot width; it leans against the push (velocity of its own slide)
  {
    const p = seg(t, 0.3, 0.55);
    if (p > 0) {
      const v = (line2(t + 0.012).saramX - line2(t - 0.012).saramX) / 0.024;
      const lean = clamp(-v * 0.00008, -0.09, 0.09);
      const sc = 0.55 + 0.45 * BACK17(p), hw = M.SARAM.w / 2;
      g.setTransform(base.translate(L.saramX + hw, L2Y).rotate((lean * 180) / Math.PI).scale(sc));
      g.globalAlpha = Math.min(1, p * 4);
      g.font = F2; g.fillStyle = COL.cream;
      for (const c of M.SARAM.syl) g.fillText(c.ch, c.x - hw, 0);
      g.globalAlpha = 1;
      g.setTransform(base);
    }
  }
  // the day's discarded words, struck through in order under the sentence
  {
    g.font = F0;
    const dim = 1 - 0.45 * sm(seg(t, 8.6, 0.6));
    M.HIST.forEach((h, k) => {
      const at = SWAPS[k].at + 0.12, p = seg(t, at, 0.45);
      if (p <= 0) return;
      const y = HISTY + 18 * (1 - EXPO_OUT(p));
      g.globalAlpha = Math.min(1, p * 3) * 0.7 * dim;
      g.fillStyle = COL.cream;
      for (const c of h.L.syl) g.fillText(c.ch, h.x + c.x, y);
      const q = P3IO(seg(t, at + 0.3, 0.3));
      if (q > 0) {
        g.globalAlpha = 0.9 * dim;
        g.fillStyle = COL.amber;
        g.fillRect(h.x - 6, y - 15, (h.L.w + 12) * q, 4);
      }
      g.globalAlpha = 1;
    });
  }

  // warm light flash on the landing (added light around the slot, never a grey veil)
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (tl > 0 && tl < 0.7) {
    const fa = 0.34 * Math.exp(-tl / 0.11), fy = M.TT + M.TH / 2;
    const fg = g.createRadialGradient(L.cx, fy, 0, L.cx, fy, 900);
    fg.addColorStop(0, `rgba(255,214,150,${fa.toFixed(3)})`); fg.addColorStop(0.5, `rgba(255,170,110,${(fa * 0.4).toFixed(3)})`); fg.addColorStop(1, 'rgba(255,150,100,0)');
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = fg; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
  }
}

defineDemo({
  id: '103-word-swap',
  title: '오늘의 빈칸',
  tech: '단어 교체 키트 · 한 자리에서 바뀌는 낱말',
  duration: D,
  background: '#0f0c22',
  async setup(api) {
    HEADLESS = api.headless;
    const all = WORDS.join('') + '오늘 나는 사람' + '오늘의 나를 한 단어로';
    await Promise.all([fontReady(F2, all), fontReady(F1, all), fontReady(F0, all)]);
    const c = api.canvas({ type: '2d', z: 0, attrs: HEADLESS ? { willReadFrequently: true } : undefined });
    G = c.ctx;

    // ---- metrics
    G.font = F2;
    const m = G.measureText(WORDS.join('') + '사람');
    const asc = Math.ceil(m.actualBoundingBoxAscent), desc = Math.ceil(m.actualBoundingBoxDescent);
    M.TH = asc + desc + 2 * PADY;
    M.TT = Math.round(L2Y - asc - PADY);
    M.BASE = L2Y - M.TT;                             // baseline inside the plate / a word sprite
    M.WL = WORDS.map((w) => lay(w, F2, TR2));
    M.TW = M.WL.map((L) => L.w + 2 * PADX);         // plate width per word
    M.SARAM = lay('사람', F2, TR2);
    M.LINE1 = lay('오늘 나는', F1, TR1);
    M.KICK = lay('오늘의 나를 한 단어로', F0, 0);
    {
      const items = WORDS.slice(0, 5).map((w) => lay(w, F0, 0)), sep = 42;
      const total = items.reduce((a, L) => a + L.w, 0) + sep * (items.length - 1);
      let x = CX - total / 2;
      M.HIST = items.map((L) => { const h = { L, x }; x += L.w + sep; return h; });
    }

    // ---- sprites
    SPR.word = { amber: M.WL.map((L) => wordSprite(L, COL.amber)), ink: M.WL.map((L) => wordSprite(L, COL.ink)) };
    SPR.face = M.WL.map((_, i) => faceSprite(i));
    SPR.night = bakeSky(false); SPR.dawn = bakeSky(true);
    SPR.moon = bakeMoon(); SPR.hillsN = bakeHills(false); SPR.hillsD = bakeHills(true);
    const maxTW = Math.max(...M.TW) + 2 * BL;
    BUF.face = mk(maxTW, M.TH);
    BUF.reel = mk(maxTW, M.TH + 120);
    ROLLTAB = bakeRoll();

    // ---- tables (rand only)
    { const r = rand(10301); DUST = Array.from({ length: 46 }, () => ({ x0: r() * W, y0: r() * 1500, v: 10 + 34 * r(), amp: 6 + 18 * r(), f: 0.4 + 0.9 * r(), ph: r() * 6.283, r: 1.2 + 2.4 * r() * r(), a: 0.18 + 0.4 * r() })); }
    { const r = rand(10302); STARS = Array.from({ length: 70 }, () => ({ x: r() * W, y: 60 + Math.pow(r(), 1.3) * 1250, r: 1.5 + 2.5 * r() * r(), a: 0.25 + 0.55 * r(), f: 1 + 3 * r(), ph: r() * 6.283 })); }
    {
      const r = rand(10303);
      SPARKS = Array.from({ length: 34 }, (_, i) => {
        const side = i % 4, a = r();
        // start on the plate's edge, fly outwards
        let x0, y0, vx, vy;
        if (side < 2) { const top = side === 0; x0 = (L) => L.x + a * L.sw; y0 = top ? M.TT : M.TT + M.TH; vx = (a - 0.5) * 900; vy = (top ? -1 : 1) * (500 + 700 * r()); }
        else { const left = side === 2; x0 = left ? (L) => L.x : (L) => L.x + L.sw; y0 = M.TT + a * M.TH; vx = (left ? -1 : 1) * (700 + 800 * r()); vy = (a - 0.5) * 700; }
        return { x0, y0, vx, vy, k: 5 + 3 * r(), life: 0.45 + 0.4 * r(), w: 3 + 4 * r(), warm: r() < 0.65 };
      });
    }

    // grain over everything (moves in steps of 1/12 s)
    const gr = document.createElement('canvas'); gr.width = W + 64; gr.height = H + 64;
    gr.style.cssText = `position:absolute;left:0;top:0;width:${W + 64}px;height:${H + 64}px;z-index:4;pointer-events:none;opacity:.11;mix-blend-mode:overlay`;
    { const gg = gr.getContext('2d'), img = gg.createImageData(gr.width, gr.height), r = rand(10399);
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.floor(r() * 256); img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      gg.putImageData(img, 0, 0); }
    api.stage.appendChild(gr);
    this.grain = gr;

    // warm-up: draw every phase once so each scratch canvas and sprite has been composited before the first real frame
    for (const sw of SWAPS) for (const f of [0.2, 0.5, 0.8]) draw(sw.at + sw.dur * f);
    draw(T_LAND + 0.1);
  },
  frame(t) {
    draw(t);
    const q = Math.floor(t * 12);
    this.grain.style.transform = `translate(${-((q * 37) % 64)}px, ${-((q * 23 + 11) % 64)}px)`;
  },
});
