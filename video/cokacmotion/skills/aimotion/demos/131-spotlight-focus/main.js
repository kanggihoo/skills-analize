/*
 * 131 · 책방 고양이는 어디에 — guiding the eye twice: a spotlight mask that searches like an eye, then a rack focus.
 *
 * A cosy illustrated bookshop in four depth cards (back room 7 m, bookcase 3.2 m, hanging lamps 1.9 m, counter 0.85 m).
 *   0–1.5   the whole shop, deep focus; caption "책방 고양이를 찾아보세요"
 *   1.5–5.0 a soft spotlight gathers and searches the shelves in saccades (main-sequence durations, minimum-jerk
 *           profile, stretch along the velocity, saccadic suppression, fixation drift, a hypometric last jump and
 *           a corrective one); outside it the shop loses colour (luminance-preserving) and exposure
 *   5.0–6.5 it lands on the cat and snaps tight; ears twitch, pupils narrow in the light, a slow blink
 *   6.5–9.0 the spotlight opens; the aperture opens (f/8 → f/1.2) and focus racks to the teacup, holds, then pulls
 *           to the cat; the picture breathes with the focus (thin-lens image distance)
 *   9.0–10  afterglow: the spotlight returns as a wide, gentle pool around the cat; a second slow blink
 *
 * Spotlight: an ellipse signed distance d ≈ f/|∇f| (f = |A·q| − 1, A = diag(1/a, 1/b)·S⁻¹ with S the velocity stretch),
 * smoothstep falloff, evaluated per texel on a quarter-size mask each frame. The mask (black, alpha = outside) is drawn
 * twice over the finished picture: 'saturation' (luminance-preserving desaturation) and source-over (C·(1 − k), exposure).
 * Depth of field: every card is painted once and blurred in setup into a pyramid σ = 0, 1, 2, 4, 8, 16, 32 texels;
 * per frame the thin-lens circle of confusion c = A·v_f·|1/z − 1/z_f| picks two neighbouring levels and cross-fades
 * them in premultiplied space. Point lights are drawn as discs of diameter c (bokeh).
 */
import { defineDemo, rand, clamp, lerp, smooth, ramp, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 10, W = 1080, H = 1920, TAU = Math.PI * 2;
const CX = W / 2, CY = H / 2;                 // optical axis (focus breathing scales about it)
const KR = `"${FONTS.pretendard.family}"`;

// ---------------------------------------------------------------- palette: warm wood, deep green, cream + one accent
const C = {
  night: '#100a07',
  wood0: '#2f1d12', wood1: '#4a2e1c', wood2: '#6a4227', wood3: '#8f5c34', wood4: '#b98451', wood5: '#d6a774',
  green0: '#12231b', green1: '#1a3327', green2: '#264a39', green3: '#3c6650', green4: '#6a9375', green5: '#a2bf9b',
  cream0: '#f6eedc', cream1: '#eadbbb', cream2: '#d2bd94', cream3: '#a99370',
  plum: '#573a36', slate: '#33403a',
  cat: '#ee8a37', catD: '#c25f1e', catL: '#f6b469', catCream: '#f9edd8', catNose: '#ad5e4a',
  eye: '#a9c35f', eyeD: '#6c8a3a', ink: '#1b1410',
};
const LIGHT = [255, 224, 170];                // lamplight (not a colour token: it only ever glows)
const BOOKS = [C.green1, C.green2, C.green2, C.green3, C.green4, C.slate, C.wood1, C.wood2, C.wood3, C.wood4,
  C.cream1, C.cream2, C.cream3, C.plum];

const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const lum = (h) => { const [r, g, b] = hex(h); return (0.3 * r + 0.59 * g + 0.11 * b) / 255; };
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// ---------------------------------------------------------------- lens: thin lens, f = 50 mm, 24 mm across 1080 px
const LENS_F = 50, PX_MM = W / 24;
const Z_BACK = 7000, Z_SHELF = 3200, Z_LAMP = 1900, Z_COUNTER = 850, Z_CUP = 850;   // mm from the lens
const N_DEEP = 8, N_WIDE = 1.2;
const vImg = (zf) => LENS_F * zf / (zf - LENS_F);                                    // image distance (mm)
/** circle-of-confusion diameter in px: c = A·v_f·|1/z − 1/z_f|, A = f/N */
const coc = (z, zf, N) => PX_MM * (LENS_F / N) * vImg(zf) * Math.abs(1 / z - 1 / zf);
const RACK1 = [6.72, 7.32], RACK2 = [7.62, 8.66];    // cat → cup (while the iris opens), hold, cup → cat
function lens(t) {
  const p1 = ease.inOutCubic(clamp((t - RACK1[0]) / (RACK1[1] - RACK1[0])));
  const p2 = ease.inOutCubic(clamp((t - RACK2[0]) / (RACK2[1] - RACK2[0])));
  const inv = lerp(lerp(1 / Z_SHELF, 1 / Z_CUP, p1), 1 / Z_SHELF, p2);              // pulled in diopters
  const zf = 1 / inv;
  const N = N_DEEP * Math.pow(N_WIDE / N_DEEP, smooth((t - 6.55) / 0.75));          // the iris opens in stops
  return { zf, N, sb: vImg(zf) / vImg(Z_SHELF) };                                    // breathing: image scale ∝ v
}

// ---------------------------------------------------------------- gaze: fixations and saccades (closed form in t)
const CAT = { x: 832, y: 490 };
const FIX = [[612, 1232], [300, 1030], [254, 494], [868, 852]];   // armchair, basket, globe, the figurine
const DWELL = [0.7, 0.5, 0.5, 0.6];
const T_SPOT = 1.5, T_LAND = 5.0;
const mj = (u) => u * u * u * (10 + u * (-15 + 6 * u));          // minimum-jerk position profile
const msDur = (d) => 0.07 + 0.00032 * d;                         // main sequence: duration grows with amplitude
function buildGaze() {
  const dw = DWELL.slice(), segs = [];
  for (let pass = 0; pass < 2; pass++) {                         // pass 2 lengthens the last dwell to land at T_LAND
    segs.length = 0;
    let t = T_SPOT;
    const add = (a, b, dur, sac) => { segs.push({ t0: t, t1: t + dur, a, b, sac }); t += dur; };
    for (let i = 0; i < FIX.length; i++) {
      add(FIX[i], FIX[i], dw[i], false);
      if (i + 1 < FIX.length) add(FIX[i], FIX[i + 1], msDur(Math.hypot(FIX[i + 1][0] - FIX[i][0], FIX[i + 1][1] - FIX[i][1])), true);
    }
    // the last, long saccade falls short (hypometric, 86 %); after a short latency a corrective saccade lands
    const p = FIX[FIX.length - 1], q = [CAT.x, CAT.y], u = [lerp(p[0], q[0], 0.86), lerp(p[1], q[1], 0.86)];
    add(p, u, msDur(Math.hypot(u[0] - p[0], u[1] - p[1])), true);
    add(u, u, 0.12, false);
    add(u, q, msDur(Math.hypot(q[0] - u[0], q[1] - u[1])), true);
    dw[FIX.length - 1] += T_LAND - t;
  }
  return segs;
}
const GAZE = buildGaze();
function gaze(t) {
  let x = FIX[0][0], y = FIX[0][1];
  if (t >= T_LAND) { x = CAT.x; y = CAT.y; } else {
    for (const s of GAZE) if (t >= s.t0 && t < s.t1) {
      const k = s.sac ? mj((t - s.t0) / (s.t1 - s.t0)) : 0;
      x = lerp(s.a[0], s.b[0], k); y = lerp(s.a[1], s.b[1], k);
    }
  }
  const k = t < T_LAND ? 1 : 0.45;                                // ocular drift during fixations
  x += k * (3.4 * Math.sin(1.9 * t + 0.4) + 1.6 * Math.sin(4.7 * t + 1.1));
  y += k * (2.8 * Math.sin(1.4 * t + 2.0) + 1.4 * Math.sin(5.3 * t + 0.3));
  return [x, y];
}

// ---------------------------------------------------------------- the spotlight's state (screen px)
const SEARCH = { a: 178, b: 152, F: 92 }, TIGHT = { a: 122, b: 112, F: 50 };
function spot(t, G) {
  if (t < 1.4 || (t > 7.15 && t < 8.75)) return null;
  if (t >= 8.75) {                                                  // afterglow: the device returns, wide and gentle
    const k = ramp(t, 8.75, 9.8), [x, y] = apply(G, CAT.x, CAT.y + 40);
    return { x, y, a: 380 - 50 * k, b: 470 - 70 * k, ux: 1, uy: 0, s: 1, F: 280, desat: 0.48 * k, dark: 0.5 * k, supp: 0, rim: 0.3 * k };
  }
  const [x, y] = gaze(t), h = 1 / 240;
  const [x1, y1] = gaze(t + h), [x0, y0] = gaze(t - h);
  const vx = (x1 - x0) / (2 * h), vy = (y1 - y0) / (2 * h), v = Math.hypot(vx, vy);
  const fast = smooth(v / 2600);
  const bloom = ease.outCubic(clamp((t - 1.42) / 0.62));          // the light gathers: radius ×5 → ×1
  const fp = clamp((t - T_LAND) / 0.42), found = fp <= 0 ? 0 : ease.outBack(fp, 2.4);
  const open = Math.pow(20, ease.inCubic(clamp((t - 6.5) / 0.62)));
  const size = lerp(5, 1, bloom) * open;
  const lvl = ramp(t, 1.42, 1.95) * (1 - ramp(t, 6.55, 7.12));
  return {
    x, y, size,
    a: lerp(SEARCH.a, TIGHT.a, found) * size, b: lerp(SEARCH.b, TIGHT.b, found) * size,
    ux: v > 1 ? vx / v : 1, uy: v > 1 ? vy / v : 0, s: 1 + 0.36 * fast,    // stretch along the saccade
    F: lerp(SEARCH.F, TIGHT.F, clamp(found)) * Math.sqrt(size),
    desat: lvl * (0.9 + 0.1 * clamp(found)), dark: lvl * (0.7 + 0.12 * clamp(found)),
    supp: 0.26 * fast,                                                // saccadic suppression: the world dims mid-jump
    rim: lvl * (0.55 + 0.45 * clamp(found)),
  };
}

// ---------------------------------------------------------------- cat pose (only animated while the cat is sharp)
const REST = { blink: 0, pupil: 0.45, ear: 0, tail: 0 };
function blinkAt(t, t0) {                                            // a slow blink: close .16 s, hold .1 s, open .24 s
  const c = ease.inOutCubic(clamp((t - t0) / 0.16)), o = ease.inOutCubic(clamp((t - t0 - 0.26) / 0.24));
  return c * (1 - o);
}
function catPose(t, sharp) {
  const g = clamp(1 - sharp / 0.12);                                 // σ of the cat card (texels) → pose gate
  const twitch = Math.exp(-Math.pow((t - 5.12) / 0.07, 2)) + 0.6 * Math.exp(-Math.pow((t - 5.34) / 0.06, 2));
  const pupil = lerp(0.45, 1, ramp(t, 5.0, 5.3) * (1 - ramp(t, 6.4, 6.9))) * (1 - ramp(t, 9.0, 9.6) * 0.25);
  const sway = 0.07 * Math.sin(1.6 * t) + 0.03 * Math.sin(3.7 * t + 1);
  const flick = 0.22 * Math.exp(-Math.pow((t - 9.05) / 0.12, 2)) - 0.12 * Math.exp(-Math.pow((t - 9.3) / 0.12, 2));
  return {
    blink: g * Math.max(blinkAt(t, 5.42), blinkAt(t, 9.25)),
    pupil: lerp(REST.pupil, pupil, g), ear: g * twitch, tail: g * (sway + flick),
  };
}

// ---------------------------------------------------------------- canvases and affine maps
let CPU = false;   // headless only: CPU raster for every canvas (deterministic first composite, no GPU↔CPU copies)
function mk(w, h, cpu = CPU) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  return { c, ctx: c.getContext('2d', cpu ? { willReadFrequently: true } : undefined) };
}
const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const rot = (px, py, a) => { const c = Math.cos(a), s = Math.sin(a); return [c, s, -s, c, px - c * px + s * py, py - s * px - c * py]; };
function reset(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
}

// ---------------------------------------------------------------- drawing primitives (flat, rounded)
const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];
function ell(ctx, x, y, rx, ry, fill) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fillStyle = fill; ctx.fill(); }
function line(ctx, pts, col, w, cap = 'round') {
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = cap; ctx.lineJoin = 'round'; ctx.stroke();
}

/** one upright book from its base yb: spine, lit left edge, shaded right edge, bands and sometimes a label */
function book(ctx, r, x, yb, w, h, col) {
  ctx.fillStyle = col; rr(ctx, x, yb - h, w, h, Math.min(3.5, w * 0.22)); ctx.fill();
  ctx.fillStyle = 'rgba(255,238,210,0.13)'; ctx.fillRect(x + 1.5, yb - h + 3, Math.max(1.5, w * 0.17), h - 5);
  ctx.fillStyle = 'rgba(12,6,3,0.24)'; ctx.fillRect(x + w - Math.max(1.5, w * 0.2), yb - h + 2, Math.max(1.5, w * 0.2), h - 3);
  const band = lum(col) > 0.55 ? C.wood2 : C.cream2;
  const style = r();
  ctx.fillStyle = band; ctx.globalAlpha = 0.75;
  if (style < 0.55) {
    ctx.fillRect(x + 1, yb - h + h * 0.09, w - 2, Math.max(2, h * 0.022));
    ctx.fillRect(x + 1, yb - h * 0.13, w - 2, Math.max(2, h * 0.022));
  } else if (style < 0.8) {
    ctx.fillRect(x + 1, yb - h + h * 0.07, w - 2, Math.max(3, h * 0.05));
    ctx.fillRect(x + 1, yb - h * 0.18, w - 2, Math.max(2, h * 0.025));
  }
  if (r() < 0.5 && w > 15) {
    ctx.globalAlpha = 0.55; ctx.fillStyle = lum(col) > 0.55 ? C.wood1 : C.cream1;
    rr(ctx, x + w * 0.22, yb - h * 0.62, w * 0.56, h * 0.17, 1.5); ctx.fill();
  }
  if (r() < 0.35) { ctx.globalAlpha = 0.6; ctx.fillStyle = band; ell(ctx, x + w / 2, yb - h * 0.3, Math.max(1.6, w * 0.1), Math.max(1.6, w * 0.1), band); }
  ctx.globalAlpha = 1;
}
/** books lying flat; returns the width used and the stack's top */
function flatStack(ctx, r, x, yb, room) {
  const n = 2 + Math.floor(r() * 3);
  let y = yb, maxW = 0;
  for (let i = 0; i < n; i++) {
    const th = 12 + r() * 9, len = Math.min(room - 6, 62 + r() * 46) * (1 - i * 0.05), off = (r() - 0.5) * 8;
    const col = pick(r, BOOKS), xx = x + 3 + off + (i ? 4 : 0);
    ctx.fillStyle = col; rr(ctx, xx, y - th, len, th, 2.5); ctx.fill();
    ctx.fillStyle = 'rgba(255,238,210,0.14)'; ctx.fillRect(xx + 2, y - th + 1.5, len - 4, Math.max(1.5, th * 0.18));
    ctx.fillStyle = 'rgba(12,6,3,0.2)'; ctx.fillRect(xx + 1, y - th * 0.28, len - 2, th * 0.28);
    ctx.fillStyle = lum(col) > 0.55 ? C.wood2 : C.cream2; ctx.globalAlpha = 0.7;
    ctx.fillRect(xx + len * 0.08, y - th + 2, Math.max(2, len * 0.035), th - 4); ctx.fillRect(xx + len * 0.88, y - th + 2, Math.max(2, len * 0.035), th - 4);
    ctx.globalAlpha = 1;
    maxW = Math.max(maxW, len + off + 6); y -= th;
  }
  return { w: maxW + 6, top: y };
}

// small objects that fill the shelves -------------------------------------------------
function plant(ctx, r, x, yb, trailing) {
  const w = 44;
  ctx.fillStyle = C.cream1; ctx.beginPath(); ctx.moveTo(x, yb - 40); ctx.lineTo(x + w, yb - 40); ctx.lineTo(x + w - 6, yb); ctx.lineTo(x + 6, yb); ctx.fill();
  ctx.fillStyle = C.cream3; ctx.fillRect(x - 2, yb - 44, w + 4, 8);
  ctx.fillStyle = 'rgba(12,6,3,0.15)'; ctx.fillRect(x + w * 0.62, yb - 36, w * 0.3, 34);
  const leaves = [C.green3, C.green4, C.green2];
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * 2.4, L = 18 + r() * 16;
    ctx.save(); ctx.translate(x + w / 2 + (r() - 0.5) * 16, yb - 44); ctx.rotate(a);
    ell(ctx, L * 0.55, 0, L * 0.55, L * 0.24, pick(r, leaves)); ctx.restore();
  }
  if (trailing) {                                    // ivy that spills over the shelf edge
    let px = x + w - 4, py = yb - 38;
    for (let i = 0; i < 11; i++) {
      px += 3 + r() * 4; py += 9 + r() * 5;
      line(ctx, [px - 4, py - 9, px, py], C.green1, 2);
      ctx.save(); ctx.translate(px, py); ctx.rotate((i % 2 ? 0.7 : -0.9) + (r() - 0.5) * 0.4);
      ell(ctx, 7, 0, 8, 4.6, i % 3 ? C.green3 : C.green4); ctx.restore();
    }
  }
  return w + 8;
}
function jar(ctx, r, x, yb) {
  const w = 34, h = 46;
  ctx.fillStyle = 'rgba(234,219,187,0.35)'; rr(ctx, x, yb - h, w, h, 8); ctx.fill();
  ctx.fillStyle = C.cream2; ctx.globalAlpha = 0.7; rr(ctx, x + 4, yb - h * 0.55, w - 8, h * 0.5, 5); ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = C.wood3; rr(ctx, x + 3, yb - h - 8, w - 6, 10, 3); ctx.fill();
  ctx.fillStyle = 'rgba(255,248,232,0.45)'; ctx.fillRect(x + 5, yb - h + 6, 3, h - 14);
  return w + 8;
}
function clock(ctx, x, yb) {
  const R = 24, cx = x + R + 2, cy = yb - R - 4;
  ell(ctx, cx, yb - 3, R * 0.9, 4, 'rgba(10,5,2,0.3)');
  ell(ctx, cx, cy, R, R, C.wood3); ell(ctx, cx, cy, R - 5, R - 5, C.cream0);
  line(ctx, [cx, cy, cx, cy - 13], C.wood1, 2.5); line(ctx, [cx, cy, cx + 9, cy + 4], C.wood1, 2.5);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ell(ctx, cx + Math.cos(a) * (R - 9), cy + Math.sin(a) * (R - 9), 1.3, 1.3, C.wood2); }
  ell(ctx, cx - R * 0.55, cy - R - 2, 5, 5, C.wood4); ell(ctx, cx + R * 0.55, cy - R - 2, 5, 5, C.wood4);
  return R * 2 + 10;
}
function pictureFrame(ctx, x, yb, h = 58) {
  const w = h * 0.8;
  ctx.save(); ctx.translate(x + 6, yb); ctx.rotate(-0.06);
  ctx.fillStyle = C.wood3; rr(ctx, 0, -h, w, h, 3); ctx.fill();
  ctx.fillStyle = C.cream1; ctx.fillRect(5, -h + 5, w - 10, h - 10);
  ctx.fillStyle = C.green4; ctx.beginPath(); ctx.moveTo(5, -12); ctx.quadraticCurveTo(w * 0.35, -h * 0.6, w - 5, -h * 0.3); ctx.lineTo(w - 5, -5); ctx.lineTo(5, -5); ctx.fill();
  ctx.fillStyle = C.green2; ctx.beginPath(); ctx.moveTo(5, -8); ctx.quadraticCurveTo(w * 0.6, -h * 0.4, w - 5, -14); ctx.lineTo(w - 5, -5); ctx.lineTo(5, -5); ctx.fill();
  ctx.restore();
  return w + 14;
}
function candle(ctx, x, yb) {
  ell(ctx, x + 16, yb - 3, 16, 4, C.wood3);
  ctx.fillStyle = C.cream0; rr(ctx, x + 9, yb - 52, 14, 48, 3); ctx.fill();
  ctx.fillStyle = 'rgba(12,6,3,0.15)'; ctx.fillRect(x + 17, yb - 50, 6, 46);
  line(ctx, [x + 16, yb - 52, x + 16, yb - 58], C.ink, 1.6);
  return 40;
}
function hourglass(ctx, x, yb) {
  const w = 32, h = 54;
  ctx.fillStyle = C.wood2; rr(ctx, x, yb - 7, w, 7, 2); ctx.fill(); rr(ctx, x, yb - h, w, 7, 2); ctx.fill();
  ctx.fillStyle = 'rgba(234,219,187,0.35)';
  ctx.beginPath(); ctx.moveTo(x + 4, yb - h + 7); ctx.lineTo(x + w - 4, yb - h + 7); ctx.lineTo(x + w / 2 + 2, yb - h / 2); ctx.lineTo(x + w - 4, yb - 7); ctx.lineTo(x + 4, yb - 7); ctx.lineTo(x + w / 2 - 2, yb - h / 2); ctx.fill();
  ctx.fillStyle = C.cream2; ctx.beginPath(); ctx.moveTo(x + 7, yb - 7); ctx.lineTo(x + w / 2, yb - 22); ctx.lineTo(x + w - 7, yb - 7); ctx.fill();
  line(ctx, [x + 3, yb - h + 5, x + 3, yb - 5], C.wood3, 3); line(ctx, [x + w - 3, yb - h + 5, x + w - 3, yb - 5], C.wood3, 3);
  return w + 10;
}
function box(ctx, r, x, yb) {
  const w = 54 + r() * 20, h = 30 + r() * 14;
  ctx.fillStyle = r() < 0.5 ? C.wood3 : C.green3; rr(ctx, x, yb - h, w, h, 3); ctx.fill();
  ctx.fillStyle = 'rgba(255,238,210,0.15)'; ctx.fillRect(x, yb - h, w, 6);
  ctx.fillStyle = 'rgba(12,6,3,0.25)'; ctx.fillRect(x, yb - h + 8, w, 2);
  ell(ctx, x + w / 2, yb - h * 0.45, 3, 3, C.cream2);
  return w + 8;
}
function globe(ctx, x, yb) {                           // decoy 2
  const cx = x + 40, cy = yb - 66, R = 38;
  ell(ctx, cx, yb - 4, 30, 6, C.wood1); ctx.fillStyle = C.wood2; rr(ctx, cx - 4, cy + R - 4, 8, yb - cy - R, 2); ctx.fill();
  ell(ctx, cx, cy, R, R, C.green2);
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, R, R, 0, 0, TAU); ctx.clip();
  ctx.fillStyle = C.cream2;
  for (const [dx, dy, s] of [[-14, -14, 15], [10, -20, 9], [16, 6, 13], [-10, 18, 10], [-28, 6, 7]]) ell(ctx, cx + dx, cy + dy, s, s * 0.7, C.cream2);
  ctx.fillStyle = 'rgba(255,240,210,0.16)'; ell(ctx, cx - 12, cy - 14, R * 0.6, R * 0.5, 'rgba(255,240,210,0.16)');
  ctx.fillStyle = 'rgba(10,5,2,0.28)'; ell(ctx, cx + 20, cy + 18, R * 0.75, R * 0.75, 'rgba(10,5,2,0.25)');
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, R + 7, Math.PI * 0.62, Math.PI * 2.38); ctx.strokeStyle = C.wood4; ctx.lineWidth = 4; ctx.stroke();
  return 88;
}
function basket(ctx, x, yb) {                          // decoy 1: a basket of rolled maps
  const w = 100, h = 52;
  for (const [dx, a, col] of [[22, -0.25, C.cream1], [44, 0.1, C.cream2], [66, 0.3, C.cream1], [34, 0.05, C.cream0]]) {
    ctx.save(); ctx.translate(x + dx, yb - h + 8); ctx.rotate(a);
    ctx.fillStyle = col; rr(ctx, -8, -64, 16, 70, 6); ctx.fill(); ell(ctx, 0, -64, 8, 3.5, C.cream3);
    ctx.fillStyle = C.green3; ctx.fillRect(-8, -36, 16, 5); ctx.restore();
  }
  ctx.fillStyle = C.wood3; ctx.beginPath(); ctx.moveTo(x, yb - h); ctx.lineTo(x + w, yb - h); ctx.lineTo(x + w - 8, yb); ctx.lineTo(x + 8, yb); ctx.fill();
  for (let i = 0; i < 4; i++) line(ctx, [x + 4, yb - h + 8 + i * 12, x + w - 4, yb - h + 8 + i * 12], C.wood2, 3, 'butt');
  for (let i = 0; i < 9; i++) line(ctx, [x + 8 + i * 10.5, yb - h, x + 10 + i * 9.6, yb], 'rgba(255,230,190,0.18)', 2, 'butt');
  ctx.fillStyle = C.wood4; rr(ctx, x - 3, yb - h - 4, w + 6, 8, 4); ctx.fill();
  return w + 10;
}
function figurine(ctx, x, yb) {                        // decoy 3: a glazed ceramic cat
  const cx = x + 26;
  ctx.fillStyle = C.green2;
  ctx.beginPath(); ctx.moveTo(cx - 22, yb); ctx.bezierCurveTo(cx - 26, yb - 34, cx - 16, yb - 52, cx, yb - 54); ctx.bezierCurveTo(cx + 16, yb - 52, cx + 26, yb - 34, cx + 22, yb); ctx.fill();
  ell(ctx, cx, yb - 62, 15, 14, C.green2);
  ctx.beginPath(); ctx.moveTo(cx - 14, yb - 66); ctx.lineTo(cx - 12, yb - 84); ctx.lineTo(cx - 3, yb - 74); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx + 14, yb - 66); ctx.lineTo(cx + 12, yb - 84); ctx.lineTo(cx + 3, yb - 74); ctx.fill();
  line(ctx, [cx + 20, yb - 4, cx + 32, yb - 6, cx + 34, yb - 22], C.green2, 7);
  ctx.fillStyle = 'rgba(234,245,225,0.32)'; ell(ctx, cx - 8, yb - 34, 4, 14, 'rgba(234,245,225,0.3)'); ell(ctx, cx - 5, yb - 66, 3, 4, 'rgba(234,245,225,0.45)');
  ell(ctx, cx - 5, yb - 62, 2, 1.4, C.green0); ell(ctx, cx + 5, yb - 62, 2, 1.4, C.green0);
  return 60;
}

// ---------------------------------------------------------------- the bookcase card (z = 3.2 m)
const BOARDS = [565, 735, 905, 1075, 1245], TOP = 395, BT = 18, FLOOR = 1420;
const POSTS = [[-70, -50], [172, 194], [392, 418], [662, 688], [944, 966], [1140, 1162]];
const BAYS = [[-50, 172], [194, 392], [418, 662], [688, 944], [966, 1140]];
const ARCH = { x0: 428, x1: 652, cy: 752, r: 112 };
const archPath = (ctx, x0 = ARCH.x0, x1 = ARCH.x1, top = ARCH.cy, bottom = FLOOR + 6) => {
  ctx.beginPath(); ctx.moveTo(x0, bottom); ctx.lineTo(x0, top); ctx.arc((x0 + x1) / 2, top, (x1 - x0) / 2, Math.PI, 0); ctx.lineTo(x1, bottom); ctx.closePath();
};

function fillRow(ctx, r, x0, x1, yb, hgt, slots) {
  let x = x0 + 3 + r() * 5, prevH = hgt * 0.8;
  while (x < x1 - 10) {
    const s = slots.find((q) => x + 12 > q[0] && x < q[1]);
    if (s) { if (s[2]) s[2](ctx, s[0], yb); x = s[1] + 2; continue; }
    const next = slots.find((q) => q[0] >= x), lim = next ? next[0] : x1, room = lim - x;
    if (room < 14) { x = next ? next[0] : x1; continue; }
    const k = r();
    if (k < 0.1 && room > 80) { x += flatStack(ctx, r, x, yb, room).w; prevH = hgt * 0.3; continue; }
    if (k < 0.17 && room > 92) {
      const o = r(), q = r() < 0.5;
      const used = o < 0.25 ? plant(ctx, r, x, yb, q && hgt > 140) : o < 0.42 ? jar(ctx, r, x, yb) : o < 0.58 ? candle(ctx, x, yb)
        : o < 0.72 ? hourglass(ctx, x, yb) : o < 0.86 ? pictureFrame(ctx, x, yb) : box(ctx, r, x, yb);
      x += used; prevH = 50; continue;
    }
    if (k < 0.22) { x += 5 + r() * 10; prevH = 0; continue; }
    // a group of books of related height, sometimes ending in one that leans on the group
    const n = 2 + Math.floor(r() * 6), base = hgt * (0.66 + r() * 0.26);
    for (let i = 0; i < n && x < lim - 12; i++) {
      const w = Math.min(lim - x - 1, 13 + r() * 19), h = Math.min(hgt - 6, base * (0.9 + r() * 0.16));
      if (w < 10) break;
      book(ctx, r, x, yb, w, h, pick(r, BOOKS)); x += w + 0.8; prevH = h;
    }
    if (r() < 0.28 && lim - x > 34 && prevH > 40) {
      const th = 0.18 + r() * 0.2, w = 14 + r() * 10, h = Math.min(prevH / Math.cos(th) - 4, hgt - 10);
      const bx = x + h * Math.sin(th) - 2;
      if (bx + w * Math.cos(th) < lim - 2) {
        ctx.save(); ctx.translate(bx, yb); ctx.rotate(-th); book(ctx, r, 0, 0, w, h, pick(r, BOOKS)); ctx.restore();
        x = bx + w * Math.cos(th) + 3; prevH = 0;
      }
    }
  }
}

function drawShelves(ctx) {
  const r = rand(131);
  // ceiling: dark boards, two beams, a cornice
  let g = ctx.createLinearGradient(0, -90, 0, 400);
  g.addColorStop(0, '#120b08'); g.addColorStop(1, '#2a1b12');
  ctx.fillStyle = g; ctx.fillRect(-90, -90, 1260, 490);
  for (let i = -8; i <= 30; i++) { const xb = -90 + i * 52; line(ctx, [540 + (xb - 540) * 1.3, -90, xb, 340], 'rgba(0,0,0,0.3)', 2, 'butt'); }
  for (const [y, h] of [[70, 38], [214, 46]]) {
    ctx.fillStyle = C.wood0; ctx.fillRect(-90, y, 1260, h);
    ctx.fillStyle = C.wood1; ctx.fillRect(-90, y + h - 6, 1260, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-90, y + h, 1260, 10);
  }
  ctx.fillStyle = C.wood2; ctx.fillRect(-90, 336, 1260, 20);
  ctx.fillStyle = C.wood4; ctx.fillRect(-90, 336, 1260, 3);
  ctx.fillStyle = C.wood1; ctx.fillRect(-90, 356, 1260, 26);
  for (let x = -84; x < 1170; x += 28) { ctx.fillStyle = C.wood2; ctx.fillRect(x, 360, 16, 14); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x, 372, 16, 2); }
  ctx.fillStyle = C.wood3; ctx.fillRect(-90, 382, 1260, 13);
  ctx.fillStyle = C.wood5; ctx.fillRect(-90, 382, 1260, 2);
  // carcass and bays
  ctx.fillStyle = C.wood1; ctx.fillRect(-90, TOP, 1260, FLOOR - TOP + 4);
  const slots = {
    '1,0': [[214, 302, (c, x, y) => globe(c, x, y)]],
    '1,3': [[250, 360, (c, x, y) => basket(c, x, y)]],
    '2,0': [[512, 568, (c, x, y) => clock(c, x, y)]],
    '3,0': [[722, 944, null]],                                     // the cat's gap
    '3,2': [[842, 902, (c, x, y) => figurine(c, x, y)]],
    '0,1': [[86, 140, (c, x, y) => plant(c, r, x, y, true)]],
    '4,2': [[1000, 1060, (c, x, y) => jar(c, r, x, y)]],
  };
  BAYS.forEach(([bx0, bx1], bi) => {
    for (let k = 0; k < 5; k++) {
      const y0 = k ? BOARDS[k - 1] + BT : TOP, y1 = BOARDS[k];
      if (bi === 2 && k > 0) continue;
      ctx.fillStyle = C.green1; ctx.fillRect(bx0, y0, bx1 - bx0, y1 - y0);
      for (let x = bx0 + 18; x < bx1; x += 36) { ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(x, y0, 2, y1 - y0); }
      fillRow(ctx, r, bx0, bx1, y1 - 3, y1 - y0 - 8, slots[`${bi},${k}`] || []);
      g = ctx.createLinearGradient(0, y0, 0, y0 + 46);
      g.addColorStop(0, 'rgba(8,4,2,0.55)'); g.addColorStop(1, 'rgba(8,4,2,0)');
      ctx.fillStyle = g; ctx.fillRect(bx0, y0, bx1 - bx0, 46);
      for (const [xa, dir] of [[bx0, 1], [bx1, -1]]) {
        g = ctx.createLinearGradient(xa, 0, xa + 26 * dir, 0);
        g.addColorStop(0, 'rgba(8,4,2,0.35)'); g.addColorStop(1, 'rgba(8,4,2,0)');
        ctx.fillStyle = g; ctx.fillRect(Math.min(xa, xa + 26 * dir), y0, 26, y1 - y0);
      }
    }
  });
  // the panel around the arch
  ctx.fillStyle = C.wood1; ctx.fillRect(418, BOARDS[0] + BT, 244, FLOOR - BOARDS[0] - BT);
  ctx.strokeStyle = C.wood0; ctx.lineWidth = 3; archPath(ctx, ARCH.x0 - 26, ARCH.x1 + 26, ARCH.cy, FLOOR - 160); ctx.stroke();
  // boards and posts
  BAYS.forEach(([bx0, bx1], bi) => {
    for (let k = 0; k < 5; k++) {
      if (bi === 2 && k > 0) continue;
      const y = BOARDS[k];
      ctx.fillStyle = C.wood3; ctx.fillRect(bx0 - 2, y - 4, bx1 - bx0 + 4, 5);
      ctx.fillStyle = C.wood2; ctx.fillRect(bx0 - 2, y + 1, bx1 - bx0 + 4, BT - 1);
      ctx.fillStyle = C.wood4; ctx.fillRect(bx0 - 2, y + 1, bx1 - bx0 + 4, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(bx0 - 2, y + BT - 3, bx1 - bx0 + 4, 3);
    }
  });
  for (const [p0, p1] of POSTS) {
    ctx.fillStyle = C.wood2; ctx.fillRect(p0, TOP - 2, p1 - p0, FLOOR - TOP + 4);
    ctx.fillStyle = C.wood4; ctx.fillRect(p0, TOP - 2, 3, FLOOR - TOP + 4);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(p1 - 4, TOP - 2, 4, FLOOR - TOP + 4);
  }
  // base cupboards and floor
  BAYS.forEach(([bx0, bx1], bi) => {
    if (bi === 2) return;
    const y0 = BOARDS[4] + BT;
    ctx.fillStyle = C.wood1; ctx.fillRect(bx0, y0, bx1 - bx0, FLOOR - y0);
    const half = (bx1 - bx0) / 2;
    for (let j = 0; j < 2; j++) {
      ctx.strokeStyle = C.wood0; ctx.lineWidth = 3; ctx.strokeRect(bx0 + j * half + 12, y0 + 14, half - 24, FLOOR - y0 - 28);
      ctx.strokeStyle = 'rgba(214,167,116,0.25)'; ctx.lineWidth = 1.5; ctx.strokeRect(bx0 + j * half + 16, y0 + 18, half - 32, FLOOR - y0 - 36);
      ell(ctx, bx0 + j * half + (j ? 22 : half - 22), y0 + 60, 4, 4, C.wood4);
    }
  });
  ctx.fillStyle = C.wood0; ctx.fillRect(-90, FLOOR, 1260, 110);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-90, FLOOR + 14 + i * 26, 1260, 2); }
  // the library ladder on its rail
  ctx.fillStyle = C.wood4; ctx.fillRect(688, 398, 480, 6); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(688, 404, 480, 3);
  const rails = [[968, FLOOR + 6, 992, 404], [1052, FLOOR + 6, 1076, 404]];
  for (let i = 1; i < 9; i++) {
    const u = i / 9, y = lerp(FLOOR, 404, u), xa = lerp(968, 992, u), xb = lerp(1052, 1076, u);
    ctx.fillStyle = C.wood3; rr(ctx, xa, y - 6, xb - xa, 12, 3); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(xa, y + 4, xb - xa, 3);
  }
  for (const [xa, ya, xb, yb] of rails) {
    line(ctx, [xa + 3, ya, xb + 3, yb], 'rgba(0,0,0,0.35)', 16, 'butt');
    line(ctx, [xa, ya, xb, yb], C.wood3, 14, 'butt');
    line(ctx, [xa - 4, ya, xb - 4, yb], C.wood5, 3, 'butt');
  }
  for (const [, , xb, yb] of rails) { ell(ctx, xb + 2, yb, 9, 6, C.wood1); ell(ctx, xb + 2, yb - 1, 5, 4, C.wood4); }
  // lamplight on the bookcase and darker corners (before the arch is cut, so the opening stays clean)
  ctx.globalCompositeOperation = 'screen';
  for (const [x, y, R, a] of [[652, 330, 620, 0.26], [1000, 250, 460, 0.2], [260, 430, 420, 0.1], [520, 1300, 520, 0.12]]) {
    g = ctx.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, rgba(LIGHT, a)); g.addColorStop(0.5, rgba(LIGHT, a * 0.35)); g.addColorStop(1, rgba(LIGHT, 0));
    ctx.fillStyle = g; ctx.fillRect(x - R, y - R, R * 2, R * 2);
  }
  ctx.globalCompositeOperation = 'source-over';
  g = ctx.createRadialGradient(560, 800, 380, 560, 800, 1200);
  g.addColorStop(0, 'rgba(10,5,3,0)'); g.addColorStop(1, 'rgba(10,5,3,0.5)');
  ctx.fillStyle = g; ctx.fillRect(-90, -90, 1260, 1620);
  // the arch: cut through to the back room, then the trim
  ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; archPath(ctx); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
  ctx.save(); archPath(ctx); ctx.clip();
  g = ctx.createLinearGradient(ARCH.x0, 0, ARCH.x0 + 30, 0); g.addColorStop(0, 'rgba(8,4,2,0.45)'); g.addColorStop(1, 'rgba(8,4,2,0)');
  ctx.fillStyle = g; ctx.fillRect(ARCH.x0, ARCH.cy - ARCH.r, 30, FLOOR);
  ctx.restore();
  ctx.lineWidth = 22; ctx.strokeStyle = C.wood2;
  ctx.beginPath(); ctx.moveTo(ARCH.x0 - 11, FLOOR + 6); ctx.lineTo(ARCH.x0 - 11, ARCH.cy); ctx.arc(540, ARCH.cy, ARCH.r + 11, Math.PI, 0); ctx.lineTo(ARCH.x1 + 11, FLOOR + 6); ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = C.wood4;
  ctx.beginPath(); ctx.moveTo(ARCH.x0 - 20, FLOOR + 6); ctx.lineTo(ARCH.x0 - 20, ARCH.cy); ctx.arc(540, ARCH.cy, ARCH.r + 20, Math.PI, 0); ctx.lineTo(ARCH.x1 + 20, FLOOR + 6); ctx.stroke();
  ctx.fillStyle = C.wood3; ctx.beginPath(); ctx.moveTo(526, ARCH.cy - ARCH.r - 24); ctx.lineTo(554, ARCH.cy - ARCH.r - 24); ctx.lineTo(549, ARCH.cy - ARCH.r + 2); ctx.lineTo(531, ARCH.cy - ARCH.r + 2); ctx.fill();
}

// ---------------------------------------------------------------- the back room card (z = 7 m), seen through the arch
const BACK_LAMP = [458, 1092];
function drawBackRoom(ctx) {
  const r = rand(77);
  let g = ctx.createLinearGradient(0, 520, 0, 1215);
  g.addColorStop(0, '#1b3328'); g.addColorStop(1, '#2b4d3d');
  ctx.fillStyle = g; ctx.fillRect(330, 520, 420, 700);
  // window on the night street, rain on the glass
  const wx0 = 478, wx1 = 604, wy0 = 790, wy1 = 1070;
  ctx.fillStyle = C.cream1; archPath(ctx, wx0 - 12, wx1 + 12, wy0 + 50, wy1 + 12); ctx.fill();
  ctx.save(); archPath(ctx, wx0, wx1, wy0 + 50, wy1); ctx.clip();
  g = ctx.createLinearGradient(0, wy0, 0, wy1); g.addColorStop(0, '#0d2120'); g.addColorStop(1, '#1d3d39');
  ctx.fillStyle = g; ctx.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
  ctx.fillStyle = '#0b1916'; ctx.beginPath(); ctx.moveTo(wx0, wy1); ctx.lineTo(wx0, 980); ctx.lineTo(520, 972); ctx.lineTo(522, 940); ctx.lineTo(560, 940); ctx.lineTo(562, 990); ctx.lineTo(wx1, 985); ctx.lineTo(wx1, wy1); ctx.fill();
  for (const [x, y] of [[500, 990], [536, 955], [548, 955], [584, 1000], [512, 1012]]) { ctx.fillStyle = 'rgba(255,214,150,0.75)'; ctx.fillRect(x, y, 6, 8); }
  for (let i = 0; i < 26; i++) { const x = wx0 + r() * (wx1 - wx0), y = wy0 + r() * (wy1 - wy0); line(ctx, [x, y, x - 4, y + 16 + r() * 18], 'rgba(214,230,220,0.18)', 1.5); }
  ctx.restore();
  ctx.fillStyle = C.cream1; ctx.fillRect(538, wy0, 6, wy1 - wy0); ctx.fillRect(wx0, 930, wx1 - wx0, 6);
  ctx.fillStyle = C.cream2; ctx.fillRect(wx0 - 20, wy1 + 8, wx1 - wx0 + 40, 12);
  // wainscot, floor, rug
  ctx.fillStyle = C.wood1; ctx.fillRect(330, 1110, 420, 105);
  ctx.fillStyle = C.wood3; ctx.fillRect(330, 1106, 420, 7);
  for (let x = 340; x < 750; x += 70) { ctx.strokeStyle = C.wood0; ctx.lineWidth = 2; ctx.strokeRect(x, 1124, 56, 76); }
  g = ctx.createLinearGradient(0, 1215, 0, 1520); g.addColorStop(0, C.wood2); g.addColorStop(1, C.wood1);
  ctx.fillStyle = g; ctx.fillRect(330, 1215, 420, 305);
  for (let i = -6; i < 8; i++) line(ctx, [540 + i * 40, 1215, 540 + i * 140, 1520], 'rgba(0,0,0,0.22)', 2, 'butt');
  ell(ctx, 548, 1330, 165, 40, C.green2); ell(ctx, 548, 1330, 150, 33, C.green3);
  ctx.strokeStyle = C.cream2; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(548, 1330, 140, 28, 0, 0, TAU); ctx.stroke();
  // a small far bookcase on the right wall
  ctx.fillStyle = C.wood1; ctx.fillRect(660, 930, 90, 300);
  for (let k = 0; k < 4; k++) {
    const yb = 1000 + k * 64;
    ctx.fillStyle = C.green0; ctx.fillRect(668, yb - 56, 82, 56);
    let x = 670; while (x < 748) { const w = 7 + r() * 7, h = 34 + r() * 16; book(ctx, r, x, yb, w, h, pick(r, BOOKS)); x += w + 0.5; }
    ctx.fillStyle = C.wood3; ctx.fillRect(664, yb, 86, 6);
  }
  // floor lamp, side table, armchair with a cushion (decoy 0)
  ell(ctx, BACK_LAMP[0], 1300, 22, 6, C.wood0);
  ctx.fillStyle = C.wood0; ctx.fillRect(BACK_LAMP[0] - 3, 1090, 6, 210);
  ctx.fillStyle = C.cream1; ctx.beginPath(); ctx.moveTo(BACK_LAMP[0] - 26, 1046); ctx.lineTo(BACK_LAMP[0] + 26, 1046); ctx.lineTo(BACK_LAMP[0] + 38, 1094); ctx.lineTo(BACK_LAMP[0] - 38, 1094); ctx.fill();
  ctx.fillStyle = 'rgba(255,226,170,0.9)'; ell(ctx, BACK_LAMP[0], 1094, 38, 6, 'rgba(255,232,186,0.95)');
  ell(ctx, 512, 1262, 26, 6, C.wood3); ctx.fillStyle = C.wood1; ctx.fillRect(509, 1262, 6, 46); ell(ctx, 512, 1306, 14, 4, C.wood1);
  ctx.fillStyle = C.green3; rr(ctx, 503, 1246, 28, 8, 2); ctx.fill(); ctx.fillStyle = C.cream1; rr(ctx, 506, 1238, 22, 8, 2); ctx.fill();
  ctx.fillStyle = C.green3; rr(ctx, 568, 1150, 116, 100, 26); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,210,0.1)'; rr(ctx, 576, 1158, 30, 84, 14); ctx.fill();
  ctx.fillStyle = C.green2; rr(ctx, 556, 1226, 140, 54, 16); ctx.fill();
  ctx.fillStyle = C.green3; rr(ctx, 550, 1206, 30, 70, 12); ctx.fill(); rr(ctx, 672, 1206, 30, 70, 12); ctx.fill();
  ctx.fillStyle = C.cream1; rr(ctx, 590, 1196, 58, 44, 14); ctx.fill();
  ctx.fillStyle = C.cream3; ctx.fillRect(600, 1216, 38, 3);
  ctx.fillStyle = C.wood0; ctx.fillRect(564, 1278, 8, 18); ctx.fillRect(680, 1278, 8, 18);
  // lamplight
  ctx.globalCompositeOperation = 'screen';
  g = ctx.createRadialGradient(BACK_LAMP[0], 1110, 0, BACK_LAMP[0], 1110, 300);
  g.addColorStop(0, rgba(LIGHT, 0.42)); g.addColorStop(0.45, rgba(LIGHT, 0.14)); g.addColorStop(1, rgba(LIGHT, 0));
  ctx.fillStyle = g; ctx.fillRect(330, 520, 420, 1000);
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- hanging lamps and a garland (z = 1.9 m)
const LAMPS = [{ x: 652, y: 262, w: 176, ph: 0.4 }, { x: 1000, y: 196, w: 150, ph: 2.1 }];
function drawLamp(ctx, L) {
  const { x, y, w } = L;
  line(ctx, [x, -90, x, y - 30], C.ink, 3, 'butt');
  ctx.fillStyle = C.wood1; rr(ctx, x - 10, y - 34, 20, 16, 4); ctx.fill();
  ctx.fillStyle = C.green2;
  ctx.beginPath(); ctx.moveTo(x - 18, y - 20); ctx.bezierCurveTo(x - w * 0.3, y - 16, x - w * 0.5, y + 20, x - w / 2, y + 44);
  ctx.lineTo(x + w / 2, y + 44); ctx.bezierCurveTo(x + w * 0.5, y + 20, x + w * 0.3, y - 16, x + 18, y - 20); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,210,0.16)';
  ctx.beginPath(); ctx.moveTo(x - 12, y - 16); ctx.bezierCurveTo(x - w * 0.24, y - 10, x - w * 0.36, y + 18, x - w * 0.38, y + 40); ctx.lineTo(x - w * 0.26, y + 40); ctx.bezierCurveTo(x - w * 0.24, y + 16, x - w * 0.14, y - 8, x - 4, y - 16); ctx.fill();
  ell(ctx, x, y + 44, w / 2, 9, C.cream1);
  ell(ctx, x, y + 46, w / 2 - 8, 6, '#fff3d6');
}
const GARLAND = { x0: -70, y0: 350, x1: 708, y1: 336, sag: 74, n: 13 };
const garlandAt = (u) => [lerp(GARLAND.x0, GARLAND.x1, u), lerp(GARLAND.y0, GARLAND.y1, u) + 4 * GARLAND.sag * u * (1 - u)];
function drawGarland(ctx) {
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) { const [x, y] = garlandAt(i / 60); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.stroke();
  for (let i = 0; i < GARLAND.n; i++) {
    const [x, y] = garlandAt((i + 0.5) / GARLAND.n);
    ctx.fillStyle = C.wood0; rr(ctx, x - 4, y - 2, 8, 10, 2); ctx.fill();
    ell(ctx, x, y + 15, 6, 8, '#fff0cc');
  }
}

// ---------------------------------------------------------------- the counter card (z = 0.85 m): books, glasses, lamp, the teacup
const CUP = { x: 790, top: 1272, base: 1366 }, CUP_S = 1.25;      // counter design coords; the cup is drawn ×1.25
const BANKER = [492, 1252];
const CDY = 130;                                                  // the counter sits this much lower on screen
const CUP_TOP = CUP.base + CDY - (CUP.base - CUP.top) * CUP_S;     // the cup's rim on screen
function drawCounter(ctx) {
  ctx.save(); ctx.translate(0, CDY);
  // counter top and front
  let g = ctx.createLinearGradient(0, 1338, 0, 1400);
  g.addColorStop(0, C.wood3); g.addColorStop(1, C.wood4);
  ctx.fillStyle = g; ctx.fillRect(-90, 1338, 1260, 62);
  const r = rand(19);
  for (let i = 0; i < 14; i++) { const y = 1344 + r() * 50, x = -90 + r() * 1100; line(ctx, [x, y, x + 120 + r() * 240, y + (r() - 0.5) * 3], 'rgba(60,32,16,0.22)', 1.5); }
  ctx.fillStyle = C.wood5; ctx.fillRect(-90, 1398, 1260, 4);
  ctx.fillStyle = C.wood2; ctx.fillRect(-90, 1402, 1260, 24);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-90, 1426, 1260, 10);
  g = ctx.createLinearGradient(0, 1426, 0, 2010); g.addColorStop(0, C.wood1); g.addColorStop(1, '#25160d');
  ctx.fillStyle = g; ctx.fillRect(-90, 1426, 1260, 584);
  for (const [x0, x1] of [[-40, 340], [380, 700], [740, 1120]]) {
    ctx.strokeStyle = C.wood0; ctx.lineWidth = 4; rr(ctx, x0, 1470, x1 - x0, 520, 8); ctx.stroke();
    ctx.strokeStyle = 'rgba(214,167,116,0.18)'; ctx.lineWidth = 2; rr(ctx, x0 + 8, 1478, x1 - x0 - 16, 504, 6); ctx.stroke();
  }
  // banker's lamp: its pool of light on the counter
  ctx.globalCompositeOperation = 'screen';
  g = ctx.createRadialGradient(BANKER[0], 1372, 0, BANKER[0], 1372, 330);
  g.addColorStop(0, rgba(LIGHT, 0.5)); g.addColorStop(0.5, rgba(LIGHT, 0.16)); g.addColorStop(1, rgba(LIGHT, 0));
  ctx.fillStyle = g; ctx.fillRect(BANKER[0] - 330, 1338, 660, 64);
  ctx.globalCompositeOperation = 'source-over';
  // a stack of books with reading glasses
  for (const [x, y, w, h, col] of [[54, 1336, 286, 32, C.green2], [72, 1304, 250, 32, C.cream1], [62, 1276, 236, 28, C.wood2]]) {
    ell(ctx, x + w / 2 + 6, y + h - 1, w / 2 + 6, 5, 'rgba(10,5,2,0.28)');
    ctx.fillStyle = col; rr(ctx, x, y, w, h, 4); ctx.fill();
    ctx.fillStyle = col === C.cream1 ? C.cream3 : C.cream1; ctx.fillRect(x + w - 26, y + 4, 22, h - 8);
    for (let i = 1; i < 4; i++) line(ctx, [x + w - 25, y + 4 + i * (h - 8) / 4, x + w - 5, y + 4 + i * (h - 8) / 4], 'rgba(120,96,70,0.5)', 1, 'butt');
    ctx.fillStyle = 'rgba(255,240,215,0.16)'; ctx.fillRect(x + 4, y + 3, w - 34, 4);
    ctx.fillStyle = lum(col) > 0.55 ? C.wood2 : C.cream2; ctx.globalAlpha = 0.8; ctx.fillRect(x + 22, y + 4, 5, h - 8); ctx.fillRect(x + 34, y + 4, 3, h - 8); ctx.globalAlpha = 1;
  }
  const gy = 1250;
  for (const gx of [150, 226]) {
    ell(ctx, gx, gy + 4, 32, 22, 'rgba(10,5,2,0.18)');
    ell(ctx, gx, gy, 31, 21, 'rgba(225,236,226,0.22)');
    ctx.strokeStyle = C.wood0; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(gx, gy, 31, 21, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,250,236,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(gx, gy, 22, 13, 0, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();
  }
  line(ctx, [181, gy - 4, 188, gy - 9, 195, gy - 4], C.wood0, 4);
  line(ctx, [119, gy - 2, 96, gy + 14], C.wood0, 4); line(ctx, [257, gy - 2, 284, gy + 16], C.wood0, 4);
  // banker's lamp
  ell(ctx, BANKER[0], 1368, 70, 10, 'rgba(10,5,2,0.3)');
  ctx.fillStyle = C.wood3; rr(ctx, BANKER[0] - 58, 1346, 116, 22, 8); ctx.fill();
  ctx.fillStyle = C.wood4; ctx.fillRect(BANKER[0] - 50, 1348, 100, 3);
  ctx.fillStyle = C.wood2; ctx.fillRect(BANKER[0] - 5, 1262, 10, 86);
  line(ctx, [BANKER[0] + 40, 1262, BANKER[0] + 44, 1312], C.wood4, 2); ell(ctx, BANKER[0] + 44, 1316, 4, 5, C.wood4);
  ctx.fillStyle = C.green2;
  ctx.beginPath(); ctx.moveTo(BANKER[0] - 92, 1262); ctx.bezierCurveTo(BANKER[0] - 88, 1216, BANKER[0] - 60, 1204, BANKER[0], 1204);
  ctx.bezierCurveTo(BANKER[0] + 60, 1204, BANKER[0] + 88, 1216, BANKER[0] + 92, 1262); ctx.fill();
  ctx.fillStyle = 'rgba(200,236,210,0.22)';
  ctx.beginPath(); ctx.moveTo(BANKER[0] - 70, 1246); ctx.bezierCurveTo(BANKER[0] - 64, 1222, BANKER[0] - 40, 1213, BANKER[0] - 10, 1212); ctx.lineTo(BANKER[0] - 12, 1222); ctx.bezierCurveTo(BANKER[0] - 40, 1224, BANKER[0] - 56, 1232, BANKER[0] - 60, 1248); ctx.fill();
  ell(ctx, BANKER[0], 1262, 92, 9, C.wood4);
  ell(ctx, BANKER[0], 1264, 84, 6, '#fff1cf');
  // a small potted plant
  ctx.fillStyle = C.cream1; rr(ctx, 978, 1300, 70, 66, 12); ctx.fill();
  ctx.fillStyle = 'rgba(12,6,3,0.14)'; ctx.fillRect(1020, 1304, 24, 60);
  const pr = rand(5);
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (pr() - 0.5) * 2.2, L = 30 + pr() * 26;
    ctx.save(); ctx.translate(1013, 1302); ctx.rotate(a); ell(ctx, L * 0.55, 0, L * 0.55, L * 0.2, pick(pr, [C.green3, C.green4, C.green2])); ctx.restore();
  }
  // the teacup on its saucer
  const { x, top, base } = CUP;
  ctx.translate(x, base); ctx.scale(CUP_S, CUP_S); ctx.translate(-x, -base);
  ell(ctx, x + 6, base + 10, 112, 14, 'rgba(10,5,2,0.3)');
  ell(ctx, x, base + 2, 108, 18, C.cream2); ell(ctx, x, base - 2, 104, 16, C.cream0); ell(ctx, x, base - 1, 62, 9, C.cream1);
  line(ctx, [x - 86, base - 2, x - 36, base + 4], '#c9c3b4', 5); ell(ctx, x - 92, base - 4, 11, 6, '#d6d0c2');
  ctx.strokeStyle = C.cream0; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.ellipse(x + 78, top + 38, 22, 26, 0, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
  ctx.strokeStyle = 'rgba(12,6,3,0.16)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(x + 78, top + 38, 26, 30, 0, -Math.PI * 0.3, Math.PI * 0.5); ctx.stroke();
  const body = () => {
    ctx.beginPath(); ctx.moveTo(x - 74, top); ctx.bezierCurveTo(x - 74, top + 54, x - 52, base - 6, x - 34, base - 4);
    ctx.lineTo(x + 34, base - 4); ctx.bezierCurveTo(x + 52, base - 6, x + 74, top + 54, x + 74, top); ctx.closePath();
  };
  body(); ctx.fillStyle = C.cream0; ctx.fill();
  ctx.save(); body(); ctx.clip();
  ctx.fillStyle = C.green2; ctx.beginPath(); ctx.moveTo(x - 80, top + 22); ctx.quadraticCurveTo(x, top + 38, x + 80, top + 22); ctx.lineTo(x + 80, top + 36); ctx.quadraticCurveTo(x, top + 52, x - 80, top + 36); ctx.fill();
  ctx.fillStyle = C.cream2; ctx.beginPath(); ctx.moveTo(x - 80, top + 40); ctx.quadraticCurveTo(x, top + 56, x + 80, top + 40); ctx.lineTo(x + 80, top + 43); ctx.quadraticCurveTo(x, top + 59, x - 80, top + 43); ctx.fill();
  g = ctx.createLinearGradient(x - 74, 0, x + 74, 0);
  g.addColorStop(0, 'rgba(12,6,3,0.05)'); g.addColorStop(0.25, 'rgba(255,255,255,0.25)'); g.addColorStop(0.42, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(12,6,3,0.22)');
  ctx.fillStyle = g; ctx.fillRect(x - 80, top, 160, base - top);
  ctx.restore();
  ell(ctx, x, top, 74, 13, C.cream1);
  ell(ctx, x, top + 2, 66, 10, '#7a4a26');
  ell(ctx, x - 12, top + 1, 34, 4.5, 'rgba(214,167,116,0.55)');
  ctx.strokeStyle = C.cream2; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, top, 74, 13, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- the cat (z = 3.2 m), drawn live while it is sharp
function drawCat(ctx, P) {
  ctx.save(); ctx.translate(CAT.x, CAT.y);
  // tail: from behind the loaf, over the board edge, hanging (sways about the edge)
  const piv = [96, 76], seg = [];
  seg.push([64, 46], [84, 58], piv);
  for (let i = 1; i <= 9; i++) {
    const u = i / 9, a = P.tail * (0.4 + u) + 0.05;
    const lx = 6 * Math.sin(u * 2.4) - (u > 0.75 ? (u - 0.75) * 70 : 0), ly = 128 * u - (u > 0.85 ? (u - 0.85) * 80 : 0);
    seg.push([piv[0] + lx * Math.cos(a) - ly * Math.sin(a), piv[1] + lx * Math.sin(a) + ly * Math.cos(a)]);
  }
  for (let i = 1; i < seg.length; i++) {
    const w = lerp(22, 15, i / seg.length);
    line(ctx, [seg[i - 1][0], seg[i - 1][1], seg[i][0], seg[i][1]], i > 3 && i % 2 === 0 ? C.catD : C.cat, w);
  }
  line(ctx, [seg[seg.length - 2][0], seg[seg.length - 2][1], seg[seg.length - 1][0], seg[seg.length - 1][1]], C.catD, 15);
  // loaf (clipped at the shelf board)
  ctx.save(); ctx.beginPath(); ctx.rect(-200, -200, 400, 274); ctx.clip();
  ell(ctx, 6, 40, 104, 52, C.cat);
  for (const [x0, y0, x1, y1] of [[-78, 8, -70, 28], [-60, -4, -52, 18], [62, -2, 56, 20], [80, 8, 74, 28]]) line(ctx, [x0, y0, x1, y1], C.catD, 7);
  ell(ctx, -30, 10, 50, 14, 'rgba(255,240,215,0.14)');
  ctx.restore();
  // ears (behind the head)
  const ear = (sx, twist) => {
    ctx.save(); ctx.translate(sx * 30, -30); ctx.rotate(twist);
    ctx.fillStyle = C.cat; ctx.beginPath(); ctx.moveTo(sx * -26, 16); ctx.quadraticCurveTo(sx * 2, -60, sx * 8, -50); ctx.quadraticCurveTo(sx * 18, -28, sx * 24, -8); ctx.fill();
    ctx.fillStyle = C.catL; ctx.beginPath(); ctx.moveTo(sx * -14, 8); ctx.quadraticCurveTo(sx * 2, -42, sx * 6, -38); ctx.quadraticCurveTo(sx * 13, -22, sx * 14, -6); ctx.fill();
    ctx.restore();
  };
  ear(-1, -0.32 * P.ear); ear(1, 0.06 * P.ear);
  // head with cheek tufts
  ctx.fillStyle = C.cat;
  ctx.beginPath(); ctx.ellipse(0, 4, 60, 49, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-54, 6); ctx.lineTo(-68, 22); ctx.lineTo(-48, 30); ctx.fill();
  ctx.beginPath(); ctx.moveTo(54, 6); ctx.lineTo(68, 22); ctx.lineTo(48, 30); ctx.fill();
  for (const [x0, y0, x1, y1] of [[-12, -42, -8, -26], [0, -46, 0, -28], [12, -42, 8, -26], [-58, 6, -44, 9], [-56, 18, -45, 18], [58, 6, 44, 9], [56, 18, 45, 18]]) line(ctx, [x0, y0, x1, y1], C.catD, 5.5);
  // muzzle, nose, mouth
  ell(ctx, -11, 24, 16, 12.5, C.catCream); ell(ctx, 11, 24, 16, 12.5, C.catCream); ell(ctx, 0, 33, 12, 8, C.catCream);
  ctx.fillStyle = C.catNose; ctx.beginPath(); ctx.moveTo(-7, 12); ctx.quadraticCurveTo(0, 9, 7, 12); ctx.quadraticCurveTo(2, 19, 0, 19); ctx.quadraticCurveTo(-2, 19, -7, 12); ctx.fill();
  ctx.strokeStyle = '#7a3c26'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 19); ctx.lineTo(0, 23); ctx.quadraticCurveTo(-4, 28, -9, 25); ctx.moveTo(0, 23); ctx.quadraticCurveTo(4, 28, 9, 25); ctx.stroke();
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) line(ctx, [sx * 24, 24 + i * 4, sx * 62, 16 + i * 9], 'rgba(255,248,236,0.8)', 1.4);
  // eyes: the upper lid comes down to meet the lower one (a slow blink); the pupil narrows in the light
  for (const sx of [-1, 1]) {
    const ex = sx * 24, ey = -3, hw = 13.5, lo = 11, up = lerp(-14, lo - 1, P.blink);
    const eye = () => { ctx.beginPath(); ctx.moveTo(ex - hw, ey + 1); ctx.quadraticCurveTo(ex, ey + up * 1.55, ex + hw, ey - 1); ctx.quadraticCurveTo(ex, ey + lo * 1.5, ex - hw, ey + 1); ctx.closePath(); };
    if (P.blink < 0.93) {
      eye(); ctx.fillStyle = C.eye; ctx.fill();
      ctx.save(); eye(); ctx.clip();
      ell(ctx, ex, ey + 6, hw, 7, C.eyeD);
      ell(ctx, ex, ey + 1, lerp(6.5, 2.2, P.pupil), 11, C.ink);
      ell(ctx, ex - 4, ey - 3, 2.6, 2.6, 'rgba(255,255,250,0.95)');
      ctx.restore();
    }
    ctx.beginPath(); ctx.moveTo(ex - hw - 1, ey + 1); ctx.quadraticCurveTo(ex, ey + up * 1.55, ex + hw + 1, ey - 1);
    ctx.strokeStyle = '#3a1d10'; ctx.lineWidth = P.blink < 0.93 ? 2.6 : 3; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.restore();
}
function drawCatFront(ctx) {                    // the two books it hides behind, and its paws on top
  ctx.save(); ctx.translate(CAT.x, CAT.y);
  ell(ctx, -6, 74, 100, 5, 'rgba(10,5,2,0.35)');
  for (const [x, y, w, h, col] of [[-104, 54, 192, 21, C.green2], [-94, 36, 172, 19, C.cream1]]) {
    ctx.fillStyle = col; rr(ctx, x, y, w, h, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,215,0.16)'; ctx.fillRect(x + 3, y + 2, w - 6, 3);
    ctx.fillStyle = col === C.cream1 ? C.wood2 : C.cream2; ctx.globalAlpha = 0.8; ctx.fillRect(x + 14, y + 3, 4, h - 6); ctx.fillRect(x + w - 22, y + 3, 4, h - 6); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(12,6,3,0.2)'; ctx.fillRect(x + 1, y + h - 5, w - 2, 5);
  }
  for (const px of [-26, 22]) {
    ell(ctx, px, 38, 17, 10, C.cat); ell(ctx, px, 41, 15, 6, C.catCream);
    line(ctx, [px - 5, 38, px - 5, 46], C.catD, 1.6); line(ctx, [px + 5, 38, px + 5, 46], C.catD, 1.6);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- sprites and captions
function sprite(kind, c) {
  const S = 128, { c: cv, ctx } = mk(S, S), col = c.join(',');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 63);
  if (kind === 'disc') {                       // bokeh: a flat disc with a slightly brighter rim
    g.addColorStop(0, `rgba(${col},0.6)`); g.addColorStop(0.72, `rgba(${col},0.7)`); g.addColorStop(0.9, `rgba(${col},0.95)`);
    g.addColorStop(0.96, `rgba(${col},0.45)`); g.addColorStop(1, `rgba(${col},0)`);
  } else if (kind === 'puff') {                // steam
    g.addColorStop(0, `rgba(${col},0.9)`); g.addColorStop(0.5, `rgba(${col},0.4)`); g.addColorStop(1, `rgba(${col},0)`);
  } else {                                     // a soft glowing point
    g.addColorStop(0, `rgba(${col},1)`); g.addColorStop(0.2, `rgba(${col},0.6)`); g.addColorStop(0.55, `rgba(${col},0.12)`); g.addColorStop(1, `rgba(${col},0)`);
  }
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  return cv;
}
function textLine(parts, size, weight, spacing) {
  const font = `${weight} ${size}px ${KR}`, m = mk(4, 4).ctx;
  m.font = font; m.letterSpacing = spacing;
  const ws = parts.map(([s]) => m.measureText(s).width), tw = ws.reduce((a, b) => a + b, 0);
  const pad = 36, S = mk(tw + pad * 2, size * 1.5 + pad * 2), g = S.ctx;
  g.font = font; g.letterSpacing = spacing; g.textBaseline = 'alphabetic';
  g.shadowColor = 'rgba(14,8,4,0.7)'; g.shadowBlur = 20; g.shadowOffsetY = 3;
  let x = pad;
  parts.forEach(([s, col], i) => { g.fillStyle = col; g.fillText(s, x, pad + size * 1.12); x += ws[i]; });
  return { c: S.c, ox: pad, oy: pad + size * 1.12 };
}
const CAPS = [
  { t0: 0.3, t1: 1.45, lines: [
    [[['오늘의 숨은그림찾기', 'rgba(246,238,220,0.78)']], 32, 600, '3px', 150],
    [[['책방 ', C.cream0], ['고양이', C.cat], ['를', C.cream0]], 82, 800, '-2px', 250],
    [[['찾아보세요', C.cream0]], 82, 800, '-2px', 346]] },
  { t0: 5.1, t1: 6.38, lines: [
    [[['맨 윗칸, 책 사이에', 'rgba(246,238,220,0.78)']], 32, 600, '3px', 150],
    [[['찾았다!', C.cream0]], 82, 800, '-2px', 250]] },
  { t0: 8.66, t1: 99, lines: [
    [[['책방 지킴이', 'rgba(246,238,220,0.78)']], 32, 600, '3px', 150],
    [[['시선 끝엔', C.cream0]], 82, 800, '-2px', 250],
    [[['언제나 ', C.cream0], ['귤이', C.cat]], 82, 800, '-2px', 346]] },
];
const CAP_TEXT = CAPS.flatMap((c) => c.lines.flatMap((l) => l[0].map((p) => p[0]))).join('');

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '131-spotlight-focus',
  title: '책방 고양이는 어디에',
  tech: '시선 유도 · 스포트라이트 마스크 + 초점 이동(피사계 심도)',
  duration: D,
  background: C.night,

  async setup(api) {
    CPU = api.headless;
    await fontReady(`800 82px ${KR}`, CAP_TEXT);
    await fontReady(`600 32px ${KR}`, CAP_TEXT);
    const main = api.canvas({ type: '2d', attrs: CPU ? { willReadFrequently: true } : undefined });
    this.ctx = main.ctx;
    this.scratch = mk(W, H);

    // cards back to front; each is painted once at m texels per stage px and blurred into a pyramid
    const defs = [
      { name: 'back', z: Z_BACK, m: 1, rect: [340, 540, 400, 980], opaque: true, draw: drawBackRoom },
      { name: 'shelves', z: Z_SHELF, m: 1, rect: [-90, -90, 1260, 1620], draw: drawShelves },
      { name: 'cat', z: Z_SHELF, m: 1, rect: [CAT.x - 140, CAT.y - 100, 270, 330], live: true, draw: (g) => drawCat(g, REST) },
      { name: 'catFront', z: Z_SHELF, m: 1, rect: [CAT.x - 120, CAT.y + 20, 230, 70], draw: drawCatFront },
      { name: 'garland', z: Z_LAMP, m: 1, rect: [-90, 300, 830, 200], draw: drawGarland },
      ...LAMPS.map((L) => ({ name: 'lamp', z: Z_LAMP, m: 1, rect: [L.x - L.w / 2 - 40, -90, L.w + 80, L.y + 200], lamp: L,
        anim: (t) => rot(L.x, -90, 0.011 * Math.sin(1.15 * t + L.ph) + 0.004 * Math.sin(2.7 * t + L.ph * 2)), draw: (g) => drawLamp(g, L) })),
      { name: 'counter', z: Z_COUNTER, m: 1.15, rect: [-90, 1290, 1260, 740], draw: drawCounter },
    ];
    this.cards = defs.map((d) => {
      const [x0, y0, w, h] = d.rect, m = d.m;
      const L0 = mk(w * m, h * m);
      L0.ctx.setTransform(m, 0, 0, m, -x0 * m, -y0 * m);
      d.draw(L0.ctx);
      const levels = [L0.c];
      for (const s of [1, 2]) { const L = mk(L0.c.width, L0.c.height); L.ctx.filter = `blur(${s}px)`; L.ctx.drawImage(L0.c, 0, 0); levels.push(L.c); }
      for (let prev = levels[2]; levels.length < 7;) {               // half size + blur √3 → σ doubles: 4, 8, 16, 32
        const cw = Math.ceil(prev.width / 2), ch = Math.ceil(prev.height / 2);
        const L = mk(cw, ch); L.ctx.filter = 'blur(1.732px)'; L.ctx.drawImage(prev, 0, 0, cw, ch);
        levels.push(L.c); prev = L.c;
      }
      d.levels = levels;
      if (d.live) d.live = L0.ctx;
      return d;
    });

    // spotlight mask: quarter-size texels, alpha = how far outside the ellipse; a warm rim for the edge of the light
    this.MS = 4; this.MW = W / this.MS; this.MH = H / this.MS;
    this.mask = mk(this.MW, this.MH, true); this.maskImg = this.mask.ctx.createImageData(this.MW, this.MH);
    this.rim = mk(this.MW, this.MH, true); this.rimImg = this.rim.ctx.createImageData(this.MW, this.MH);
    for (let i = 0; i < this.rimImg.data.length; i += 4) { this.rimImg.data[i] = 255; this.rimImg.data[i + 1] = 222; this.rimImg.data[i + 2] = 168; }

    this.spr = { dot: sprite('dot', LIGHT), disc: sprite('disc', LIGHT), puff: sprite('puff', [250, 244, 232]) };
    const Cn = mk(420, 860), cc = Cn.ctx;                              // a soft cone of lamplight (pre-blurred)
    let cg = cc.createLinearGradient(0, 30, 0, 840);
    cg.addColorStop(0, rgba(LIGHT, 0.55)); cg.addColorStop(0.35, rgba(LIGHT, 0.18)); cg.addColorStop(1, rgba(LIGHT, 0));
    cc.filter = 'blur(18px)'; cc.fillStyle = cg;
    cc.beginPath(); cc.moveTo(140, 30); cc.lineTo(280, 30); cc.lineTo(395, 840); cc.lineTo(25, 840); cc.fill();
    this.cone = Cn.c;
    this.caps = CAPS.map((c) => ({ ...c, lines: c.lines.map(([parts, size, weight, sp, y]) => ({ ...textLine(parts, size, weight, sp), y, size })) }));

    // finishing: vignette with a darker foot for the captions, and a grain tile
    const V = mk(W, H), vc = V.ctx;
    let g = vc.createRadialGradient(560, 820, 360, 560, 820, 1300);
    g.addColorStop(0, 'rgba(12,6,3,0)'); g.addColorStop(1, 'rgba(12,6,3,0.62)');
    vc.fillStyle = g; vc.fillRect(0, 0, W, H);
    g = vc.createLinearGradient(0, 1560, 0, H); g.addColorStop(0, 'rgba(12,6,3,0)'); g.addColorStop(1, 'rgba(12,6,3,0.6)');
    vc.fillStyle = g; vc.fillRect(0, 1560, W, H - 1560);
    this.vignette = V.c;
    const Gn = mk(256, 256), img = Gn.ctx.createImageData(256, 256), rg = rand(9);
    for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (rg() + rg() - 1) * 120; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    Gn.ctx.putImageData(img, 0, 0);
    this.grain = this.ctx.createPattern(Gn.c, 'repeat');
  },

  /** two neighbouring blur levels cross-faded in premultiplied space: (1 − w)·A + w·B */
  drawCard(card, sigma, G, t, alpha = 1) {
    const ctx = this.ctx, sb = G[0];
    const s = sigma * card.m / sb, top = card.levels.length - 1;       // σ in level-0 texels
    let i0, w;
    if (s <= 1) { i0 = 0; w = s; } else { const lf = Math.min(top, 1 + Math.log2(s)); i0 = Math.min(top - 1, Math.floor(lf)); w = lf - i0; }
    const M = card.anim ? mul(G, card.anim(t)) : G, [x0, y0, rw, rh] = card.rect;
    card.M = M;
    if (w < 0.004 || w > 0.996 || card.opaque) {
      ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]); ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = alpha; ctx.drawImage(card.levels[w > 0.996 ? i0 + 1 : i0], x0, y0, rw, rh);
      if (card.opaque && w >= 0.004 && w <= 0.996) { ctx.globalAlpha = alpha * w; ctx.drawImage(card.levels[i0 + 1], x0, y0, rw, rh); }
      ctx.globalAlpha = 1;
      return;
    }
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    for (const [u, v] of [[x0, y0], [x0 + rw, y0], [x0, y0 + rh], [x0 + rw, y0 + rh]]) {
      const [x, y] = apply(M, u, v); bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y);
    }
    bx0 = Math.max(0, Math.floor(bx0) - 2); by0 = Math.max(0, Math.floor(by0) - 2); bx1 = Math.min(W, Math.ceil(bx1) + 2); by1 = Math.min(H, Math.ceil(by1) + 2);
    if (bx1 <= bx0 || by1 <= by0) return;
    const sc = this.scratch.ctx, bw = bx1 - bx0, bh = by1 - by0;
    sc.setTransform(1, 0, 0, 1, 0, 0); sc.globalCompositeOperation = 'source-over'; sc.globalAlpha = 1;
    sc.clearRect(bx0, by0, bw, bh);
    sc.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
    sc.globalAlpha = 1 - w; sc.drawImage(card.levels[i0], x0, y0, rw, rh);
    sc.globalCompositeOperation = 'lighter'; sc.globalAlpha = w; sc.drawImage(card.levels[i0 + 1], x0, y0, rw, rh);
    sc.globalCompositeOperation = 'source-over'; sc.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = alpha;
    ctx.drawImage(this.scratch.c, bx0, by0, bw, bh, bx0, by0, bw, bh);
    ctx.globalAlpha = 1;
  },

  /** a point light at depth z: in focus a soft glow, out of focus a disc of diameter c with energy (r/R)² */
  light(x, y, r, c, a, floor = 0.1) {
    const ctx = this.ctx, R = Math.hypot(r, c / 2);
    const q = (r / R) ** 2, sharp = 1 - smooth((R / r - 1.3) / 1.6);
    ctx.globalCompositeOperation = 'lighter';
    if (sharp > 0.003) { ctx.globalAlpha = a * sharp; ctx.drawImage(this.spr.dot, x - r * 3, y - r * 3, r * 6, r * 6); }
    if (sharp < 0.997) { ctx.globalAlpha = a * (1 - sharp) * Math.max(q, floor); ctx.drawImage(this.spr.disc, x - R, y - R, R * 2, R * 2); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },

  /** the spotlight: SDF of the (stretched) ellipse per quarter-size texel, smoothstep falloff, two composites */
  spotlight(sp) {
    const { MS, MW, MH } = this, A = this.maskImg.data, R = this.rimImg.data;
    const k = 1 / sp.s - 1, ux = sp.ux, uy = sp.uy;                    // S⁻¹ = I + (1/s − 1)·u·uᵀ
    const i00 = 1 + k * ux * ux, i01 = k * ux * uy, i11 = 1 + k * uy * uy;
    const a00 = i00 / sp.a, a01 = i01 / sp.a, a10 = i01 / sp.b, a11 = i11 / sp.b;   // A = diag(1/a, 1/b)·S⁻¹
    const fi = -0.35 * sp.F, fo = sp.F, span = fo - fi, rw = 0.42 * sp.F, supp = sp.supp;
    for (let j = 0, p = 3; j < MH; j++) {
      const qy = (j + 0.5) * MS - sp.y;
      for (let i = 0; i < MW; i++, p += 4) {
        const qx = (i + 0.5) * MS - sp.x;
        const u0 = a00 * qx + a01 * qy, u1 = a10 * qx + a11 * qy;     // u = A·q
        const k0 = Math.sqrt(u0 * u0 + u1 * u1);
        const g0 = a00 * u0 + a10 * u1, g1 = a01 * u0 + a11 * u1;     // Aᵀ·u = |A·q|·∇f
        const k1 = Math.sqrt(g0 * g0 + g1 * g1);
        const d = k1 > 1e-12 ? k0 * (k0 - 1) / k1 : -1e4;             // d ≈ f / |∇f|, f = |A·q| − 1
        let o = (d - fi) / span; o = o <= 0 ? 0 : o >= 1 ? 1 : o * o * (3 - 2 * o);   // smoothstep
        o = 1 - (1 - o) * (1 - supp);
        A[p] = o * 255 + 0.5;
        const e = d / rw; R[p] = 255 * Math.exp(-e * e) * (d < 0 ? 1 : 0.55) + 0.5;
      }
    }
    this.mask.ctx.putImageData(this.maskImg, 0, 0);
    this.rim.ctx.putImageData(this.rimImg, 0, 0);
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = sp.desat; ctx.drawImage(this.mask.c, 0, 0, W, H);   // luminance-preserving
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = sp.dark; ctx.drawImage(this.mask.c, 0, 0, W, H);   // exposure: C·(1 − k)
    if (sp.rim > 0.004) { ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.16 * sp.rim; ctx.drawImage(this.rim.c, 0, 0, W, H); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  },

  frame(t) {
    const ctx = this.ctx;
    reset(ctx); reset(this.scratch.ctx);
    for (const c of this.cards) if (c.live) reset(c.live);
    const L = lens(t), G = [L.sb, 0, 0, L.sb, CX * (1 - L.sb), CY * (1 - L.sb)];
    const cocAt = (z) => coc(z, L.zf, L.N);
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);

    for (const card of this.cards) {
      const c = cocAt(card.z), sigma = c / 4;                       // Gaussian σ matched to a disc of diameter c (σ = c/4)
      if (card.live) {
        const g = card.live, [x0, y0] = card.rect;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, card.levels[0].width, card.levels[0].height);
        g.setTransform(card.m, 0, 0, card.m, -x0 * card.m, -y0 * card.m);
        drawCat(g, catPose(t, sigma * card.m / L.sb));
      }
      this.drawCard(card, sigma, G, t);
      if (card.name === 'back') {
        const [x, y] = apply(G, BACK_LAMP[0], BACK_LAMP[1] + 2);
        this.light(x, y, 9, c, 0.55, 0.16);
      } else if (card.name === 'garland') {
        for (let i = 0; i < GARLAND.n; i++) {
          const [bx, by] = garlandAt((i + 0.5) / GARLAND.n), [x, y] = apply(G, bx, by + 15);
          const tw = 0.82 + 0.18 * Math.sin(2.1 * t + i * 1.7) * Math.sin(1.3 * t + i);
          this.light(x, y, 5, c, 0.5 * tw, 0.2);
        }
      } else if (card.lamp) {
        const Lp = card.lamp, [x, y] = apply(card.M, Lp.x, Lp.y + 50);
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.16;
        ctx.drawImage(this.spr.dot, x - 260, y - 200, 520, 400);
        const k = Lp.w / 170 * G[0];
        ctx.globalAlpha = 0.2; ctx.drawImage(this.cone, x - 210 * k, y - 34 * k, 420 * k, 860 * k);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        this.light(x, y, 18, c, 0.5, 0.2);
      } else if (card.name === 'counter') {
        const [lx, ly] = apply(G, BANKER[0], BANKER[1] + CDY + 6);
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.2; ctx.drawImage(this.spr.dot, lx - 220, ly - 70, 440, 160);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        // steam: puffs rising and curling from the cup, softened by the same circle of confusion
        const rs = Math.max(0, c / 2);
        for (let wi = 0; wi < 2; wi++) for (let j = 0; j < 36; j++) {
          const u = (t * 0.26 + wi / 2 + j / 36) % 1, ph = wi * 2.6;     // each puff rises; the strand is a travelling wave
          const bx = CUP.x + (wi ? 26 : -22) + 34 * Math.sin(u * 4.6 + ph - t * 1.2) * Math.pow(u, 0.8), by = CUP_TOP - 6 - u * 340;
          const r0 = 10 + 30 * u, R = Math.hypot(r0, rs);
          const a = 0.12 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.1)), 1.2) * (r0 / R) ** 2;
          if (a < 0.002) continue;
          const [x, y] = apply(G, bx, by), Rs = R * G[0];
          ctx.globalAlpha = a; ctx.drawImage(this.spr.puff, x - Rs, y - Rs, Rs * 2, Rs * 2);
        }
        ctx.globalAlpha = 1;
      }
    }

    // ---- the spotlight over the finished picture
    const sp = spot(t, G);
    if (sp && (sp.dark > 0.003 || sp.desat > 0.003)) this.spotlight(sp);
    if (t > T_LAND && t < T_LAND + 0.8) {                             // the find: two rings leave the spotlight's edge
      for (const [d0, a0] of [[0, 0.5], [0.13, 0.3]]) {
        const u = clamp((t - T_LAND - d0) / 0.65);
        if (u <= 0 || u >= 1) continue;
        const e = ease.outCubic(u);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a0 * (1 - u) * (1 - u);
        ctx.strokeStyle = C.cream0; ctx.lineWidth = 2 + 3 * (1 - u);
        ctx.beginPath(); ctx.ellipse(CAT.x, CAT.y, TIGHT.a * (1 + 0.9 * e), TIGHT.b * (1 + 0.9 * e), 0, 0, TAU); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // ---- finishing: vignette, grain, captions, fade in
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.drawImage(this.vignette, 0, 0);
    const rr2 = rand(5000 + Math.round(t * 30));
    this.grain.setTransform(new DOMMatrix([1, 0, 0, 1, Math.floor(rr2() * 256), Math.floor(rr2() * 256)]));
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.07; ctx.fillStyle = this.grain; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    for (const cap of this.caps) {
      if (t < cap.t0 - 0.01 || t > cap.t1 + 0.4) continue;
      cap.lines.forEach((ln, i) => {
        const t0 = cap.t0 + i * 0.11, p = ease.outExpo(clamp((t - t0) / 0.7)), out = ease.inCubic(clamp((t - cap.t1) / 0.32));
        const a = clamp((t - t0) / 0.3) * (1 - out);
        if (a < 0.003) return;
        ctx.globalAlpha = a; ctx.drawImage(ln.c, 84 - ln.ox, ln.y - ln.oy + (1 - p) * 34 - out * 18);
      });
      ctx.globalAlpha = 1;
    }
    const fade = 1 - ease.outCubic(clamp(t / 0.8));
    if (fade > 0.002) { ctx.globalAlpha = fade; ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  },
});
