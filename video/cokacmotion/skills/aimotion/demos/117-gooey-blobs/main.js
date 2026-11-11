/*
 * 117 · 몽글몽글 — a liquid-blob title sequence for an invented studio ("몽글 연구소"), 10 s, 1080×1920.
 * Everything that is liquid is ONE metaball field (goo.js) on a 540×960 grid: balls, capsules, glyph coverage,
 * a wipe term and a drain term are summed, thresholded with a one-cell smoothstep edge and lit (gloss, inner
 * gradient, drop shadow). Colours ride along with the kernels, so they blend wherever two pieces of goo meet.
 *
 *   0.0–2.2  01 SPLIT   a sunflower blob pops in, buds a tomato droplet; the neck thins and pinches off — 똑
 *   2.2–3.9  02 MERGE   the two reach out bulb-tipped arms, hover, snap together; the waist blends orange
 *   3.9–5.9  03 WRAP    the goo climbs to the headline 감싸 안고, flows around it (a carved gap), the letters
 *                       join the field and melt (ink → tomato), the goo lets go and the letters re-form crisp
 *   5.9–6.5  wipe       the fallen goo swells into a lumpy disc that fills the frame
 *   6.5–10   04 FLOW    the cobalt lock-up is revealed as the goo drains into the title 몽글 / 몽글, which
 *                       condenses crisp; a drop buds off the last 글 and lands on the base rule
 *
 * Determinism: every primitive is a closed-form function of t (no state, no simulation); the field is rebuilt
 * from scratch each frame; glyph rasters, blur levels, noise, the crisp title and the grain are baked in setup.
 */
import { defineDemo, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';
import * as G from './goo.js';

const D = 10, W = 1080, H = 1920, TAU = Math.PI * 2;
const KR = `"${FONTS.pretendard.family}"`, LAT = `"${FONTS.bricolage.family}"`;

// ---------------------------------------------------------------- palette (flat, bold) + one accent per scene
const CREAM = [244, 236, 221], INK = [29, 27, 51], TOM = [255, 84, 51], SUN = [255, 194, 30], ORA = [255, 138, 36];
const COB = [41, 62, 206], PINK = [255, 150, 192], HI = [255, 250, 236], MILK = [250, 244, 232];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// ---------------------------------------------------------------- small math
const sat = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const seg = (t, a, b) => sat((t - a) / (b - a));
const sm = (x) => { x = sat(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;
const L2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const oC = (p) => 1 - (1 - p) ** 3, iC = (p) => p * p * p, iQ = (p) => p * p, ioC = ease.inOutCubic, oE = ease.outExpo;
const oB = (p, c = 1.7) => ease.outBack(p, c);
const ioS = (p) => 0.5 - 0.5 * Math.cos(Math.PI * p);
const damp = (u, f, k) => (u <= 0 ? 0 : Math.exp(-k * u) * Math.sin(f * u));
const norm = (x, y) => { const l = Math.hypot(x, y); return [x / l, y / l]; };

// ---------------------------------------------------------------- beats (s)
const TS1 = 1.62;            // the bud pinches off
const TS2 = 3.36;            // the two blobs snap together
const TH0 = 4.3;             // goo climbs to the word
const TM0 = 4.86;            // letters join the field
const TREL = 5.3;            // goo lets go
const TW0 = 5.9, TW1 = 6.62; // wipe grows … covers
const TSWAP = 6.5;           // scene B under the goo (the wipe has covered every corner by 6.48)
const TCRISP = 7.66;         // title turns crisp

// ---------------------------------------------------------------- scene A geometry (stage px)
const DIR = norm(0.86, 0.51), ANG_D = Math.atan2(DIR[1], DIR[0]);
const P0 = [400, 1010], RP0 = 175, P2 = [290, 1030], RP2 = 165, B2 = [815, 1085], RB2 = 125, P3 = [420, 1050], B3 = [680, 1062];
const SATS = [[ANG_D, 0.42, 0.56], [ANG_D + 2.25, 0.4, 0.6], [ANG_D - 2.25, 0.4, 0.6]];   // parent lumps: angle, offset, radius (× r)
const AMP = [6, 9, 9, 9, 6, 8, 4, 5, 5, 7, 7, 7];                                       // breathing per ball
const breathe = (t, i, k = 1) => [AMP[i] * k * Math.sin(t * 2.3 + i * 1.37), AMP[i] * k * Math.cos(t * 1.9 + i * 1.78)];
const WC = [540, 1335];      // where the released goo lands and the wipe grows from

function budD(t) {           // bud distance from the parent centre: accelerates into the pinch, coasts after
  if (t < TS1) { const p = seg(t, 0.82, TS1); return 30 + 330 * (0.55 * ioC(p) + 0.45 * p * p); }
  return 360 + 75 * oC(seg(t, TS1, 2.05));
}
function parentPos(t) {
  let x, y;
  if (t < 1.95) [x, y] = P0;
  else if (t < TS2) [x, y] = L2(P0, P2, ioC(seg(t, 1.95, 2.6)));
  else [x, y] = L2(P2, P3, oB(seg(t, TS2, TS2 + 0.55), 1.4));
  const pull = t < TS1 ? sm(seg(t, 0.95, TS1)) : 1 - oC(seg(t, TS1, TS1 + 0.25));
  const k = 16 * pull - 24 * damp(t - TS1, 14, 4.5);
  return [x + DIR[0] * k, y + DIR[1] * k, pull];
}
const parentR = (t) => (t < 0.1 ? 0 : oB(seg(t, 0.1, 0.62), 2.2)) * lerp(RP0, RP2, ioC(seg(t, 1.95, 2.6)));
const BUD_END = [P0[0] + DIR[0] * budD(2.05), P0[1] + DIR[1] * budD(2.05)];
function budPos(t) {
  if (t < 2.05) { const d = budD(t); return [P0[0] + DIR[0] * d, P0[1] + DIR[1] * d]; }
  if (t < TS2) return L2(BUD_END, B2, ioC(seg(t, 2.05, 2.65)));
  return L2(B2, B3, oB(seg(t, TS2, TS2 + 0.55), 1.4));
}
const budR = (t) => (t < 0.82 ? 0 : t < 2.05 ? 22 + 80 * oC(seg(t, 0.82, 1.45)) : lerp(102, RB2, ioC(seg(t, 2.05, 2.65))));
const XB = (() => {          // where the neck breaks (58 % of the way from the parent's rim to the bud's)
  const [px, py] = parentPos(TS1), a = parentR(TS1) * 0.95, b = budD(TS1) - budR(TS1) * 0.95;
  const d = a + (b - a) * 0.58 + Math.hypot(px - P0[0], py - P0[1]);
  return [P0[0] + DIR[0] * d, P0[1] + DIR[1] * d];
})();
function tipGap(t) {         // surface gap between the two reaching tips: closes, hovers, snaps
  if (t < TS2) return 330 - 286 * oC(seg(t, 2.55, 3.26)) + 5 * Math.sin(t * 17) * sm(seg(t, 3.0, 3.26));
  return 44 - 104 * oC(seg(t, TS2, TS2 + 0.08));
}

/** scene A, t < TH0: 12 balls (base positions, breathing added later) + capsules */
function early(t) {
  const B = Array.from({ length: 12 }, () => ({ x: 0, y: 0, r: 0, col: SUN, sx: 1, sy: 1, ang: 0 }));
  const caps = [];
  const [px, py, pull] = parentPos(t), rp = parentR(t);
  const [bx, by] = budPos(t), rb = budR(t);
  Object.assign(B[0], { x: px, y: py, r: rp * 0.98 });
  SATS.forEach(([a, dd, rr], k) => {
    const o = dd * rp + (k === 0 ? 50 * pull : 0);
    Object.assign(B[1 + k], { x: px + Math.cos(a) * o, y: py + Math.sin(a) * o, r: rr * rp });
  });
  // the bud: stretched along DIR into the pinch, then a damped squash–stretch
  const u = t - TS1;
  const st = u < 0 ? 0.14 * sm(seg(t, 1.2, TS1)) : 0.14 * Math.exp(-5.5 * u) * Math.cos(16 * u) + 0.2 * damp(u, 16, 5.5);
  const bc = mixc(SUN, TOM, sm((budD(t) - rp * 0.5) / (rp * 0.8)));   // the bud blushes tomato as it leaves the parent
  Object.assign(B[4], { x: bx, y: by, r: rb, col: bc, sx: 1 + st, sy: 1 / (1 + st), ang: ANG_D });
  const lag = u < 0 ? sm(seg(t, 1.1, TS1)) : Math.exp(-6 * u) * Math.cos(13 * u);
  const so = 0.34 * rb * (1 + 0.7 * lag);
  Object.assign(B[5], { x: bx - DIR[0] * so, y: by - DIR[1] * so, r: 0.6 * rb, col: bc });
  // the neck: one capsule centre→centre that thins; at the pinch it splits into two halves that snap back
  if (t >= 0.82 && u < 0) caps.push([px, py, bx, by, lerp(70, 12, sm(seg(t, 1.0, TS1))), SUN, bc]);
  else if (u >= 0 && u < 0.2) {
    const k = oC(sat(u / 0.16)), rn = 12 * (1 - u / 0.2);
    const ea = L2(XB, [px + DIR[0] * rp * 0.9, py + DIR[1] * rp * 0.9], k), eb = L2(XB, [bx - DIR[0] * rb * 0.9, by - DIR[1] * rb * 0.9], k);
    caps.push([px, py, ea[0], ea[1], rn, SUN, ORA], [bx, by, eb[0], eb[1], rn, TOM, ORA]);
  }
  // the satellite droplet a real pinch-off leaves behind, swallowed by the bud a moment later
  if (u >= 0 && u < 0.36) {
    const k = iQ(seg(t, TS1, TS1 + 0.32)), p = L2(XB, [bx - DIR[0] * rb * 0.55, by - DIR[1] * rb * 0.55], k);
    Object.assign(B[6], { x: p[0], y: p[1] + 26 * Math.sin(Math.PI * k), r: 14 * (1 - iC(seg(t, TS1 + 0.18, TS1 + 0.35))), col: ORA });
  }
  // reaching arms: a thick base + a thin finger + a bulb at the tip, from each body toward the other
  if (t >= 2.5 && t < TS2 + 0.4) {
    const grow = sm(seg(t, 2.5, 2.7)) * (t < TS2 ? 1 : 1 - oC(seg(t, TS2, TS2 + 0.32)));
    const gap = tipGap(t), [dx, dy] = norm(bx - px, by - py), mx = lerp(px, bx, 0.56), my = lerp(py, by, 0.56);
    const hv = t < TS2 ? 1 : 0, w1 = 13 * Math.sin(t * 8.5) * hv, w2 = 11 * Math.sin(t * 7.2 + 1.3) * hv;
    const tp = [mx - dx * (gap / 2 + 34) - dy * w1, my - dy * (gap / 2 + 34) + dx * w1];
    const tb = [mx + dx * (gap / 2 + 30) - dy * w2, my + dy * (gap / 2 + 30) + dx * w2];
    Object.assign(B[7], { x: tp[0], y: tp[1], r: 34 * grow, col: SUN });
    Object.assign(B[8], { x: tb[0], y: tb[1], r: 30 * grow, col: TOM });
    caps.push([px, py, lerp(px, tp[0], 0.55), lerp(py, tp[1], 0.55), 52 * grow, SUN], [px, py, tp[0], tp[1], 26 * grow, SUN]);
    caps.push([bx, by, lerp(bx, tb[0], 0.55), lerp(by, tb[1], 0.55), 44 * grow, TOM], [bx, by, tb[0], tb[1], 23 * grow, TOM]);
  }
  // after the snap: a fat bridge, sunflower at one end and tomato at the other (orange where they meet)
  if (t >= TS2) caps.push([px, py, bx, by, 26 + 88 * oC(seg(t, TS2, TS2 + 0.45)), SUN, TOM]);
  return { B, caps };
}

// splash droplets thrown from the contact point at the snap
const SPL = [[-2.1, 620, 1], [-1.75, 760, 0.8], [-1.35, 700, 0.95], [-0.95, 640, 0.75], [-2.55, 540, 0.7], [-0.55, 520, 0.65], [-1.55, 880, 0.55]];
function splash(t) {
  const u = t - TS2;
  if (u < 0 || u > 0.62) return;
  const m = [lerp(P2[0], B2[0], 0.56), (P2[1] + B2[1]) / 2 - 34];
  for (const [a, v, s] of SPL) {
    const x = m[0] + Math.cos(a) * v * 1.3 * u, y = m[1] + Math.sin(a) * v * 1.3 * u + 1500 * u * u;
    G.ball(x, y, 17 * s * (1 - u / 0.62) ** 0.7, ORA);
  }
}

// late scene A (t ≥ TH0): hug → release → land, filled in setup from the measured headline
let START, HUG, LAND;
const NEWF = [0, 0, 0, 0, 0, 0, 0.5, 0.35, 0.65, 0.25, 0.5, 0.75];   // newborn balls start on the bridge
function late(t) {
  const B = [], caps = [];
  const s0 = START.B, P = [s0[0].x, s0[0].y], Q = [s0[4].x, s0[4].y];
  const fade = 1 - sm(seg(t, 6.1, 6.32)), absorb = sm(seg(t, 5.92, 6.12));   // swallowed by the wipe: take its colour, then shrink away
  for (let i = 0; i < 12; i++) {
    const s = s0[i], h = HUG[i], l = LAND[i];
    let sx = s.x, sy = s.y, sr = s.r;
    if (sr <= 0.8) { sx = lerp(P[0], Q[0], NEWF[i]); sy = lerp(P[1], Q[1], NEWF[i]); sr = 0; }
    const pr = seg(t, h.t0, h.t0 + 0.52), e = ioC(pr), bulge = Math.sin(Math.PI * e);
    let x = lerp(sx, h.x, ioS(pr)) + bulge * h.arc, y = lerp(sy, h.y, e), r = lerp(sr, h.r, oC(pr));
    const col = mixc(s.col, h.col, e);
    let ey = 1 + 0.85 * bulge;                                   // drawn out into a stream while it climbs
    const pf = seg(t, l.t0, l.t0 + 0.44);
    if (pf > 0) { x = lerp(x, l.x, ioS(pf)); y = lerp(y, l.y, pf * pf); r = lerp(r, l.r, pf); ey *= 1 + 0.3 * pf * pf; }
    const u = t - (l.t0 + 0.44);
    if (u > 0) ey = 1 / (1 + 0.32 * damp(u, 18, 6));             // landing squash
    B.push({ x, y, r: r * fade, col: mixc(col, SUN, absorb), sx: 1 / Math.sqrt(ey), sy: ey, ang: 0 });
  }
  const rb = 114 * (1 - oC(seg(t, TH0, TH0 + 0.32)));
  if (rb > 1) caps.push([P[0], P[1], Q[0], Q[1], rb, SUN, TOM]);
  return { B, caps };
}
const wipeR = (t) => 100 + 1600 * ioC(seg(t, TW0, TW1));

// ---------------------------------------------------------------- typography
const HS = 168, HX = 80, HB = 432, HLS = -0.03 * HS;            // scene A headline: Pretendard 900, −0.03em
const HEADS = [
  { text: '떨어지고', tin: 0.3, tout: 2.08 },
  { text: '다시 붙고', tin: 2.26, tout: 3.82 },
  { text: '감싸 안고', tin: 3.98, tout: null },
];
const TSZ = 300, TLS = -0.04 * TSZ, T1X = 84, T1B = 716, T2R = 996, T2B = 1010;   // title lock-up
const CHAP = [{ n: 1, en: 'SPLIT', ko: '분리' }, { n: 2, en: 'MERGE', ko: '결합' }, { n: 3, en: 'WRAP', ko: '포옹' }, { n: 4, en: 'FLOW', ko: '흐름' }];
const CH_T = [0, 2.2, 3.9, TSWAP];
const chapAt = (t) => (t < CH_T[1] ? 0 : t < CH_T[2] ? 1 : t < CH_T[3] ? 2 : 3);

let LAY = {};                  // per-glyph layouts, measured in setup
function layout(ctx, text, font, ls) {
  ctx.font = font;
  let x = 0;
  const chars = [];
  for (const ch of text) { const w = ctx.measureText(ch).width; chars.push({ ch, x, w }); x += w + ls; }
  return { chars, width: x - ls, font };
}
function drawGlyphs(ctx, L, x0, base) { ctx.font = L.font; for (const c of L.chars) if (c.ch !== ' ') ctx.fillText(c.ch, x0 + c.x, base); }
const t2x = () => T2R - LAY.title.width;
function drawTitle(ctx, ox = 0, oy = 0) { drawGlyphs(ctx, LAY.title, T1X + ox, T1B + oy); drawGlyphs(ctx, LAY.title, t2x() + ox, T2B + oy); }

/** a line of glyphs rising out of a line mask (expo.out, staggered), leaving faster upward (cubic in) */
function riseLine(ctx, L, x0, base, size, t, tin, tout, fill, stag = 0.055, fills = null) {
  ctx.save();
  ctx.beginPath(); ctx.rect(0, base - size * 1.0, W, size * 1.3); ctx.clip();
  ctx.font = L.font;
  L.chars.forEach((c, i) => {
    if (c.ch === ' ') return;
    const pin = oE(seg(t, tin + i * stag, tin + i * stag + 0.75));
    const pout = tout == null ? 0 : iC(seg(t, tout + i * 0.03, tout + i * 0.03 + 0.3));
    if (pin <= 0 || pout >= 1) return;
    ctx.fillStyle = fills ? fills[i] : fill;
    ctx.fillText(c.ch, x0 + c.x, base + (1 - pin) * size * 1.12 - pout * size * 1.2);
  });
  ctx.restore();
}

function resetCtx(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); ctx.lineWidth = 1;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0px';
}

function dotGrid(ctx, col) {
  ctx.fillStyle = col;
  ctx.beginPath();
  for (let y = 236; y < 1460; y += 40) for (let x = 60; x <= 1020; x += 40) { ctx.moveTo(x + 2.2, y); ctx.arc(x, y, 2.2, 0, TAU); }
  ctx.fill();
}

/** "0N / 04" with the changing digit rolling up inside its cell (fixed cell width → tabular) */
function counter(ctx, xr, base, t, col, colDim) {
  const size = 30, cell = 19;
  ctx.font = `700 ${size}px ${LAT}`; ctx.textAlign = 'center';
  const k = chapAt(t);
  const tc = CH_T[k], p = k > 0 && k < 3 ? oE(seg(t, tc, tc + 0.5)) : 1;
  const x0 = xr - cell * 6.2;
  ctx.fillStyle = col;
  ctx.fillText('0', x0 + cell * 0.5, base);
  ctx.save(); ctx.beginPath(); ctx.rect(x0 + cell, base - size, cell, size * 1.25); ctx.clip();
  ctx.fillText(String(CHAP[k].n), x0 + cell * 1.5, base + (1 - p) * size * 1.1);
  if (p < 1) ctx.fillText(String(CHAP[k - 1].n), x0 + cell * 1.5, base - p * size * 1.1);
  ctx.restore();
  ctx.fillStyle = colDim;
  ctx.fillText('/', x0 + cell * 2.85, base);
  ctx.fillText('0', x0 + cell * 4.2, base); ctx.fillText('4', x0 + cell * 5.2, base);
  ctx.textAlign = 'left';
}

function chrome(ctx, t, ink, dim, accent, scene) {
  const k = chapAt(t);
  // top bar
  const pr = scene === 'A' ? oC(seg(t, 0.05, 0.7)) : 1;
  ctx.font = `800 30px ${KR}`; ctx.fillStyle = ink; ctx.letterSpacing = '-0.5px';
  ctx.globalAlpha = sm(seg(t, 0.05, 0.35)); ctx.fillText('몽글 연구소', 80, 128);
  ctx.letterSpacing = '0px';
  counter(ctx, 1000, 128, t, ink, dim);
  ctx.globalAlpha = 1;
  ctx.fillStyle = dim;
  ctx.fillRect(80, 160, 920 * pr, 2);
  // base rule + chapter + progress pips
  ctx.fillRect(80, 1476, 920 * pr, 2);
  ctx.font = `700 24px ${LAT}`; ctx.letterSpacing = '4.5px';
  const label = scene === 'A' ? `${String(CHAP[k].n).padStart(2, '0')}  ${CHAP[k].en}` : 'LIQUID MOTION STUDY';
  ctx.save(); ctx.beginPath(); ctx.rect(70, 1500, 600, 50); ctx.clip();
  const lp = scene === 'A' && k > 0 ? oE(seg(t, CH_T[k], CH_T[k] + 0.55)) : 1;
  ctx.fillStyle = ink; ctx.globalAlpha = 0.8 * sm(seg(t, 0.2, 0.5));
  ctx.fillText(label, 80, 1534 + (1 - lp) * 40);
  if (lp < 1 && k > 0) ctx.fillText(`${String(CHAP[k - 1].n).padStart(2, '0')}  ${CHAP[k - 1].en}`, 80, 1534 - lp * 40);
  ctx.restore();
  ctx.letterSpacing = '0px'; ctx.globalAlpha = 1;
  for (let j = 0; j < 4; j++) {
    const x = 1000 - (3 - j) * 54 - 44;
    ctx.fillStyle = dim; ctx.fillRect(x, 1522, 44, 7);
    const f = j < k ? 1 : j === k ? (k === 0 ? oC(seg(t, 0.3, 0.9)) : oC(seg(t, CH_T[k], CH_T[k] + 0.5))) : 0;
    if (f > 0) { ctx.fillStyle = accent; ctx.fillRect(x, 1522, 44 * f, 7); }
  }
}

// ---------------------------------------------------------------- callouts (scene A, over the goo)
function callout(ctx, t, tgt, knee, text, tin, tout, align = 'left') {
  const a = 1 - sm(seg(t, tout, tout + 0.14));
  if (t < tin || a <= 0) return;
  fgInk = true;
  const pl = oC(seg(t, tin, tin + 0.26)), pt = oE(seg(t, tin + 0.12, tin + 0.6));
  ctx.globalAlpha = a;
  ctx.strokeStyle = rgb(INK); ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(tgt[0], tgt[1]); ctx.lineTo(lerp(tgt[0], knee[0], pl), lerp(tgt[1], knee[1], pl)); ctx.stroke();
  ctx.fillStyle = rgb(MILK); ctx.beginPath(); ctx.arc(tgt[0], tgt[1], 9 * oB(seg(t, tin, tin + 0.25), 2.5), 0, TAU); ctx.fill(); ctx.stroke();
  ctx.font = `700 40px ${KR}`; ctx.letterSpacing = '-0.8px'; ctx.textAlign = align;
  const tw = ctx.measureText(text).width, ox = align === 'left' ? knee[0] + 14 : knee[0] - tw / 2, oy = knee[1] + (align === 'left' ? 14 : 52);
  ctx.save(); ctx.beginPath(); ctx.rect(ox - 8, oy - 46, (tw + 20) * pt, 64); ctx.clip();
  ctx.fillStyle = rgb(INK); ctx.fillText(text, align === 'left' ? ox : knee[0], oy);
  ctx.restore();
  ctx.textAlign = 'left'; ctx.letterSpacing = '0px'; ctx.globalAlpha = 1;
}
function ring(ctx, t, t0, c, r0, r1, col, dur = 0.45, lw = 5) {
  const u = seg(t, t0, t0 + dur);
  if (u <= 0 || u >= 1) return;
  fgInk = true;
  ctx.globalAlpha = 1 - u; ctx.strokeStyle = col; ctx.lineWidth = lw * (1 - u) + 1;
  ctx.beginPath(); ctx.arc(c[0], c[1], lerp(r0, r1, oC(u)), 0, TAU); ctx.stroke();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- scene B goo: drain, title, droplets, drip
let TXH3, TXT, DN, NZ, TH, DRIP, titleArt, BOX3;
function finalGoo(t) {
  const p = seg(t, TSWAP, 7.62), s = 0.96 - 1.06 * (0.5 * p + 0.5 * ioS(p));
  G.drain(s, DN, NZ, SUN, 1.2 * (1 - sm(seg(t, TSWAP, TSWAP + 0.12))));   // starts saturated (as flat as the wipe), then relaxes
  G.text(TXT, 1, 2.6 * (1 - ioC(seg(t, 6.6, 7.62))), 0, SUN);
  // a tomato drop and a milk drop pop in beside the title; the tomato one leans in and kisses the first 글
  const p1 = oB(seg(t, 7.6, 8.0), 2.0), lean = sm(seg(t, 8.45, 8.95)) * (1 - sm(seg(t, 9.3, 9.85)));
  const kx = T1X + LAY.title.width + 16;   // just overlapping the first 글's right edge
  const tx = lerp(868, kx, lean) + 10 * Math.sin(t * 1.7) * (1 - lean), ty = lerp(560, 604, lean) + 12 * Math.cos(t * 1.3) * (1 - lean);
  G.ball(tx, ty, 38 * p1, TOM, 1 + 0.12 * lean, 1 - 0.08 * lean);
  const p2 = oB(seg(t, 7.74, 8.12), 2.0);
  G.ball(222 + 9 * Math.sin(t * 1.4 + 1), 902 + 11 * Math.cos(t * 1.1), 26 * p2, MILK);
  const p3 = oB(seg(t, 7.86, 8.2), 2.0);
  G.ball(150 + 6 * Math.sin(t * 1.9), 1012 + 8 * Math.cos(t * 1.6 + 2), 13 * p3, PINK);
  // the drip: buds off the bottom of the last 글, the neck thins, it pinches, falls and sits on the base rule
  const t0 = 8.2, ts = 9.02, [xd, yb] = DRIP, rD = 40, cyS = yb + 60;
  if (t >= t0 && t < ts) {
    const p = seg(t, t0, ts), cy = yb - 18 + 78 * ioC(p);
    G.ball(xd, cy, rD * oC(seg(t, t0, t0 + 0.45)), SUN, 1 / (1 + 0.14 * p), 1 + 0.14 * p);
    G.capsule(xd, yb - 24, xd, cy, lerp(26, 9, sm(seg(t, t0 + 0.35, ts))), SUN);
  } else if (t >= ts) {
    const u = t - ts;
    if (u < 0.18) G.capsule(xd, yb - 24, xd, lerp(cyS - rD * 0.8, yb - 12, oC(sat(u / 0.15))), 9 * (1 - u / 0.18), SUN);
    const YL = 1476 - rD * 0.62, uL = (-120 + Math.sqrt(120 * 120 + 4 * 1450 * (YL - cyS))) / (2 * 1450);
    if (u < uL) {
      const y = cyS + 120 * u + 1450 * u * u, st = 1 + Math.min(0.32, u * 0.9);
      G.ball(xd, y, rD, SUN, 1 / st, st);
    } else {
      const v = u - uL, q = 1 + 0.45 * Math.exp(-7 * v) * Math.cos(20 * v);   // splat, wobble, settle into a bead
      const ry = rD * 0.62 / Math.max(0.6, q * 0.75 + 0.25), rx = rD * 1.45 * (0.8 + 0.2 * q);
      G.ball(xd, 1476 - ry * 0.98, 1, SUN, rx, ry);
    }
  }
}

// ---------------------------------------------------------------- the demo
let bg, fg, gooCtx, gooImg, fgInk = false;

defineDemo({
  id: '117-gooey-blobs',
  title: '몽글몽글',
  tech: '메타볼 블롭 · 붙고 갈라지고 글자를 감싸는 액체',
  duration: D,
  background: `rgb(${CREAM.join(',')})`,
  async setup(api) {
    const KO = '몽글 연구소떨어지고다시 붙고감싸 안고목이 가늘어지면똑닿는 순간, 하나떨어져도다시 하나붙고갈라지고감싸는 액체의 모양,·';
    await Promise.all([
      fontReady(`900 ${HS}px ${KR}`, KO), fontReady(`800 30px ${KR}`, KO), fontReady(`700 40px ${KR}`, KO), fontReady(`500 32px ${KR}`, KO),
      fontReady(`700 30px ${LAT}`, '0123456789/ SPLITMERGEWRAPFLOWLIQUIDMOTIONSTUDYNO.117·—'),
    ]);
    bg = api.canvas({ z: 0 }).ctx;
    const goo = api.canvas({ z: 1, scale: 0.5 });
    gooCtx = goo.ctx;
    gooImg = gooCtx.createImageData(G.GW, G.GH);
    fg = api.canvas({ z: 2 }).ctx;

    // layouts (per glyph, so the crisp text and the field raster share one set of positions)
    LAY.heads = HEADS.map((h) => layout(bg, h.text, `900 ${HS}px ${KR}`, HLS));
    LAY.title = layout(bg, '몽글', `900 ${TSZ}px ${KR}`, TLS);
    LAY.tag = layout(bg, '떨어져도, 다시 하나', `800 74px ${KR}`, -2);

    // glyph fields
    TXH3 = G.textField((c) => drawGlyphs(c, LAY.heads[2], HX, HB), 11);
    TXT = G.textField((c) => drawTitle(c), 23);
    BOX3 = TXH3.box;

    // hug targets around the measured headline; who goes where, when, and where it lands afterwards
    {
      const [x0, y0, x1, y1] = BOX3, ww = x1 - x0, wh = y1 - y0, cy = (y0 + y1) / 2;
      const T_ = [];
      for (let k = 0; k < 4; k++) T_.push({ x: x0 + ww * (k + 0.5) / 4, y: cy, r: 0.6 * wh, row: 0 });        // interior 0–3
      for (let k = 0; k < 3; k++) T_.push({ x: x0 + ww * (0.17 + 0.33 * k), y: y0 - 0.1 * wh, r: 0.42 * wh, row: 1 }); // top 4–6
      for (let k = 0; k < 3; k++) T_.push({ x: x0 + ww * (0.17 + 0.33 * k), y: y1 + 0.1 * wh, r: 0.42 * wh, row: 2 }); // bottom 7–9
      T_.push({ x: x0 - 0.12 * wh, y: cy, r: 0.5 * wh, row: 3 }, { x: x1 + 0.12 * wh, y: cy, r: 0.5 * wh, row: 3 });     // ends 10–11
      const MAP = [0, 1, 4, 10, 3, 6, 2, 8, 11, 7, 5, 9];          // ball i → target MAP[i]
      const FALL = [3, 4, 9, 7, 5, 11, 0, 1, 2, 6, 10, 8];         // release order (bottom row first)
      const ROW_ORDER = [0, 1, 3, 2];                              // climb: interior, then top, ends, bottom
      const rise = [...Array(12).keys()].sort((a, b) => ROW_ORDER[T_[MAP[a]].row] - ROW_ORDER[T_[MAP[b]].row] || a - b);
      const rr = (i) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
      START = early(TH0);
      HUG = START.B.map((_, i) => {
        const tg = T_[MAP[i]], f = sat((tg.x - x0) / ww);
        const col = mixc(SUN, ORA, f * 0.85);   // a sunflower pool warming to orange: the tomato letters stay readable in it
        return { ...tg, col, t0: TH0 + 0.026 * rise.indexOf(i), arc: (rr(i) - 0.5) * 70 };
      });
      LAND = HUG.map((h, i) => {
        const a = i * 2.4;
        return { x: WC[0] + Math.cos(a) * 60, y: WC[1] + Math.sin(a) * 34, r: 0.55 * h.r + 16, t0: TREL + 0.036 * FALL[i] };
      });
    }

    // drain fields (cells): distance from the title's ink box, and smooth value noise
    DN = new Float32Array(G.GN); NZ = new Float32Array(G.GN);
    {
      const [x0, y0, x1, y1] = TXT.box.map((v) => v / 2);
      for (let y = 0; y < G.GH; y++) for (let x = 0; x < G.GW; x++) {
        const dx = Math.max(x0 - x, 0, x - x1), dy = Math.max(y0 - y, 0, y - y1);
        DN[y * G.GW + x] = Math.min(1.3, Math.hypot(dx, dy) / 380);
      }
      let s = 991;
      const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (const [cell, amp] of [[74, 0.76], [34, 0.2], [15, 0.04]]) {
        const nx = Math.ceil(G.GW / cell) + 2, ny = Math.ceil(G.GH / cell) + 2, K = Array.from({ length: nx * ny }, rnd);
        for (let y = 0; y < G.GH; y++) {
          const v = y / cell, j = Math.floor(v), fy = v - j, ey = fy * fy * (3 - 2 * fy);
          for (let x = 0; x < G.GW; x++) {
            const u = x / cell, i = Math.floor(u), fx = u - i, ex = fx * fx * (3 - 2 * fx);
            const a = K[j * nx + i], b = K[j * nx + i + 1], c = K[(j + 1) * nx + i], d = K[(j + 1) * nx + i + 1];
            NZ[y * G.GW + x] += amp * (a + (b - a) * ex + (c - a) * ey + (a - b - c + d) * ex * ey);
          }
        }
      }
    }
    TH = G.angleField(WC[0], WC[1]);

    // where the drip leaves the last 글: lowest ink cell of the line-2 glyph near its right side
    {
      const xd = Math.round(T2R - LAY.title.chars[1].w * 0.36), cx = Math.round(xd / 2) - TXT.bx0;
      let yb = 0;
      for (let y = 0; y < TXT.h; y++) if (TXT.lv[0][y * TXT.w + cx] > 0.5) yb = y;
      DRIP = [xd, (TXT.by0 + yb) * 2 + 2];
    }

    // the crisp title, baked once: sunflower, a darker lower-right inner edge, an inset highlight band upper-left
    {
      const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d', { willReadFrequently: api.headless })]; };
      const [art, a] = mk(), [band, b] = mk();
      a.fillStyle = rgb(SUN); drawTitle(a);
      // lower-right inner edge: glyphs minus glyphs nudged up-left (where a step down-right leaves the ink)
      b.fillStyle = rgb([226, 128, 8]); drawTitle(b); b.globalCompositeOperation = 'destination-out'; drawTitle(b, -8, -8);
      a.globalCompositeOperation = 'source-atop'; a.globalAlpha = 0.55; a.drawImage(band, 0, 0);
      // highlight: an inset band along the upper-left edges (a step up-left of 6 px is ink, of 17 px is not)
      b.globalCompositeOperation = 'source-over'; b.clearRect(0, 0, W, H);
      b.fillStyle = rgb(HI); drawTitle(b, 6, 6); b.globalCompositeOperation = 'destination-out'; drawTitle(b, 17, 17);
      b.globalCompositeOperation = 'destination-in'; drawTitle(b);
      a.globalAlpha = 0.88; a.drawImage(band, 0, 0);
      titleArt = art;
    }

    // grain: a static noise layer, soft-light over everything
    {
      const g = api.canvas({ z: 3 });
      g.el.style.mixBlendMode = 'soft-light'; g.el.style.opacity = '0.55'; g.el.style.pointerEvents = 'none';
      const im = g.ctx.createImageData(W, H), px = im.data;
      let s = 4242;
      for (let i = 0; i < W * H; i++) {
        s = (s * 1103515245 + 12345) >>> 0;
        const v = 128 + ((s >>> 16) / 65536 - 0.5) * 110;
        px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = v; px[i * 4 + 3] = 255;
      }
      g.ctx.putImageData(im, 0, 0);
    }
  },

  frame(t) {
    const B_ = t >= TSWAP;
    // ---------------- the field
    G.clear();
    if (!B_) {
      const { B, caps } = t < TH0 ? early(t) : late(t);
      const bk = t < TH0 ? 1 : lerp(1, 0.45, sm(seg(t, TH0, 4.7)));
      B.forEach((b, i) => { const [ox, oy] = breathe(t, i, bk); G.ball(b.x + ox, b.y + oy, b.r, b.col, b.sx, b.sy, b.ang); });
      for (const c of caps) G.capsule(...c);
      splash(t);
      if (t > 4.4 && t < 6.0) {
        const carve = sm(seg(t, 4.42, 4.72)) * (1 - 0.3 * sm(seg(t, 4.98, 5.22))) * (1 - sm(seg(t, 5.45, 5.75)));
        G.carve(TXH3, carve);
        const gain = t < 5.86 ? 1.12 * sm(seg(t, TM0, TM0 + 0.11)) : 1.12 * (1 - sm(seg(t, 5.86, 5.98)));
        const m = 1.7 * sm(seg(t, 4.97, 5.28)) * (1 - sm(seg(t, 5.38, 5.84)));
        const slump = sm(seg(t, 5.0, 5.3)) * (1 - sm(seg(t, 5.4, 5.82)));
        G.text(TXH3, gain, m, slump, TOM);   // tomato goo seeps into the ink letters from inside, then they melt
      }
      if (t > TW0) G.wipe(WC[0], WC[1], wipeR(t), t, SUN, TH);
      G.shade(gooImg.data, { sh: [96, 62, 42], shA: 0.2, hi: HI });
    } else {
      finalGoo(t);
      G.shade(gooImg.data, { sh: [14, 20, 92], shA: 0.34, hi: HI });
    }
    gooCtx.putImageData(gooImg, 0, 0);

    // ---------------- under the goo
    resetCtx(bg); resetCtx(fg);
    fg.clearRect(0, 0, W, H);
    fgInk = false;
    // caption scrim: an ink gradient under the harness caption, over the cream scene, the wipe and the drain;
    // it fades once the bottom of the frame is cobalt (white caption already reads there)
    const scr = 1 - sm(seg(t, 7.1, 7.6));
    if (scr > 0) {
      const sg = fg.createLinearGradient(0, 1560, 0, H);
      sg.addColorStop(0, rgb(INK, 0)); sg.addColorStop(0.33, rgb(INK, 0.38 * scr));
      sg.addColorStop(0.67, rgb(INK, 0.56 * scr)); sg.addColorStop(1, rgb(INK, 0.6 * scr));
      fg.fillStyle = sg; fg.fillRect(0, 1560, W, H - 1560);
      fgInk = true;
    }
    if (!B_) {
      bg.fillStyle = rgb(CREAM); bg.fillRect(0, 0, W, H);
      const lg = bg.createRadialGradient(540, 860, 80, 540, 960, 1300);
      lg.addColorStop(0, 'rgba(255,251,242,0.6)'); lg.addColorStop(1, 'rgba(196,164,120,0.22)');
      bg.fillStyle = lg; bg.fillRect(0, 0, W, H);
      dotGrid(bg, rgb(INK, 0.06));
      chrome(bg, t, rgb(INK), rgb(INK, 0.22), rgb(TOM), 'A');
      riseLine(bg, LAY.heads[0], HX, HB, HS, t, HEADS[0].tin, HEADS[0].tout, rgb(INK));
      riseLine(bg, LAY.heads[1], HX, HB, HS, t, HEADS[1].tin, HEADS[1].tout, rgb(INK));
      if (t < 4.975 || t >= 5.86) riseLine(bg, LAY.heads[2], HX, HB, HS, t, HEADS[2].tin, null, rgb(t < 5 ? INK : TOM));

      // ---------------- over the goo: callouts and beats
      if (t > 0.88 && t < 1.8) {
        const d = budD(t), a = parentR(t) * 0.95, b = d - budR(t) * 0.95;
        const nk = [P0[0] + DIR[0] * ((a + b) / 2 + 8), P0[1] + DIR[1] * ((a + b) / 2 + 8)];
        callout(fg, t, nk, [nk[0] + 70, 905], '목이 가늘어지면', 0.9, TS1 - 0.02);
      }
      if (t > TS1 && t < 2.4) {
        const pp = oB(seg(t, TS1 + 0.02, TS1 + 0.3), 2.4), pe = iC(seg(t, 2.1, 2.26));
        const sc = pp * (1 - pe);
        if (sc > 0.01) {
          fgInk = true;
          fg.save(); fg.translate(850, 1080); fg.rotate(-0.16); fg.scale(sc, sc);
          fg.font = `900 132px ${KR}`; fg.textAlign = 'center'; fg.fillStyle = rgb(TOM);
          fg.fillText('똑', 0, 0);
          fg.restore(); fg.textAlign = 'left';
        }
        ring(fg, t, TS1, XB, 12, 96, rgb(TOM), 0.42, 6);
      }
      if (t > TS2 && t < 4.3) {
        const [px, py] = parentPos(t), [bx, by] = budPos(t), m = [(px + bx) / 2, (py + by) / 2];
        ring(fg, t, TS2, m, 24, 170, rgb(INK, 0.5), 0.5, 5);
        callout(fg, t, m, [m[0], 1262], '닿는 순간, 하나', TS2 + 0.06, 4.12, 'center');
      }
    } else {
      bg.fillStyle = rgb(COB); bg.fillRect(0, 0, W, H);
      const lg = bg.createRadialGradient(560, 760, 60, 540, 900, 1250);
      lg.addColorStop(0, 'rgba(92,118,255,0.55)'); lg.addColorStop(1, 'rgba(14,20,110,0.42)');
      bg.fillStyle = lg; bg.fillRect(0, 0, W, H);
      dotGrid(bg, rgb(MILK, 0.07));
      chrome(bg, t, rgb(MILK), rgb(MILK, 0.3), rgb(SUN), 'B');
      bg.font = `700 26px ${LAT}`; bg.letterSpacing = '5px'; bg.fillStyle = rgb(SUN);
      bg.fillRect(84, 404, 56, 4); bg.fillText('SHOWREEL  2026', 158, 416); bg.letterSpacing = '0px';
      const fills = LAY.tag.chars.map((c, i) => (i >= 6 ? rgb(SUN) : rgb(MILK)));
      riseLine(bg, LAY.tag, 84, 1166, 74, t, 7.8, null, null, 0.045, fills);
      bg.font = `500 32px ${KR}`; bg.fillStyle = rgb(MILK, 0.74 * sm(seg(t, 8.1, 8.5))); bg.letterSpacing = '-0.4px';
      bg.fillText('붙고, 갈라지고, 감싸는 액체의 모양', 86, 1238 + 16 * (1 - oE(seg(t, 8.1, 8.65))));
      bg.letterSpacing = '0px';
      // over the goo: the crisp title
      const ca = sm(seg(t, TCRISP, TCRISP + 0.16));
      if (ca > 0) {
        fgInk = true;
        const [x0, y0, x1, y1] = TXT.box;
        fg.globalAlpha = ca;
        fg.drawImage(titleArt, x0 - 30, y0 - 30, x1 - x0 + 60, y1 - y0 + 60, x0 - 30, y0 - 30, x1 - x0 + 60, y1 - y0 + 60);
        fg.globalAlpha = 1;
      }
    }
    // A 2D canvas that is only cleared in a frame is not re-presented by Chrome's compositor: it keeps showing a
    // recycled buffer from an earlier frame (caught by sequential captures). Hide the overlay when it holds nothing.
    fg.canvas.style.visibility = fgInk ? 'visible' : 'hidden';
  },
});
