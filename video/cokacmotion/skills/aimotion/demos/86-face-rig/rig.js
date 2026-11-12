/*
 * rig.js — one parametric face rig for every character of demo 86 (a child, a grandmother, a cat).
 *
 *  · channels   an expression is a vector of 24 numbers (CH). Characters differ only in their spec: proportions
 *               (eye spacing and size, brow height, nose, mouth width, head shape) and palette, plus which of the
 *               shared part styles they use (eyes 'white' | 'dot' | 'iris', mouth 'human' | 'cat', ears, hair).
 *  · acting     poses are partial vectors merged onto a character's rest pose; acting(keys) blends full vectors
 *               over time with an ease per segment (the ease of the END key, like stage.track).
 *  · springs    secondary motion (hair tuft, bun, glasses, ears, whiskers, cheeks, tail) is a damped spring that
 *               follows a driver taken from the head's motion. The driver is sampled at 120 Hz in setup and treated
 *               as piecewise linear, so its acceleration is a train of impulses Δv_k; a damped spring's response
 *               to an impulse is closed-form, so the lag at any t is a finite sum — a pure function of t.
 *  · blinks     idle blinks are hashed per slot and pushed off the big beats.
 * Drawing is Canvas 2D in rig units: head radius ≈ 100, origin at the head centre, y down.
 */
import { clamp, lerp, ease } from '../_lib/stage.js';

const TAU = Math.PI * 2;
const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };

// ================================================================== channels and poses
export const CH = [
  'lid', 'lidLo', 'shape', 'pupil', 'lookX', 'lookY', 'cross',          // eyes: open (1) / closed (0) / wide (>1), lower lid, closed shape (−1 happy ∩, 0 line, 1 clench ><)
  'browUp', 'browIn', 'browTilt',                                        // brows: raise, furrow (+ inner ends down, − worried), asymmetry
  'mOpen', 'mWide', 'mCurve', 'teeth',                                   // mouth: open, width (− round "o"), smile/frown, teeth
  'cheek', 'nostril', 'wrinkle',                                         // cheeks raise/puff, nostril flare, nose scrunch
  'tilt', 'pitch', 'squash', 'lift', 'lean',                             // head roll (deg), pitch (− back), squash (− stretch), lift, body lean (deg)
  'earBack', 'fur',                                                      // cat: ears flattened (− perked), fur puff
];
export const BASE = Object.fromEntries(CH.map((k) => [k, 0]));
Object.assign(BASE, { lid: 1, pupil: 1 });

/** a full vector: `over` on top of `rest` */
export const pose = (rest, over = {}) => { const o = {}; for (const k of CH) o[k] = k in over ? over[k] : rest[k]; return o; };
export const mix = (a, b, k) => { const o = {}; for (const c of CH) o[c] = a[c] + (b[c] - a[c]) * k; return o; };

/** eases (p in 0..1; settle and back overshoot past 1 on the way) */
const settleRaw = (p) => Math.exp(-6.5 * p) * Math.cos(3.1 * Math.PI * p);
export const EZ = {
  lin: (p) => p,
  io: ease.inOutCubic,
  out: ease.outCubic,
  in: ease.inCubic,
  inQ: (p) => p * p,
  ioQ: (p) => (p < 0.5 ? 2 * p * p : 1 - 2 * (1 - p) * (1 - p)),
  expo: ease.outExpo,
  back: (p) => ease.outBack(p, 1.8),
  // a damped spring landing: ~12 % overshoot at p ≈ 0.32, a 1.5 % undershoot, then still — exact 0 and 1 at the ends
  settle: (p) => (1 - settleRaw(p)) / (1 - settleRaw(1)),
};

/** keys: [[t, vector, ease?], …] → (t) → vector. Each segment uses the ease of its end key (default io). */
export function acting(keys) {
  return (t) => {
    if (t <= keys[0][0]) return pose(keys[0][1]);
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, a] = keys[i - 1], [t1, b, e] = keys[i];
        return mix(a, b, (e || EZ.io)(clamp((t - t0) / Math.max(1e-6, t1 - t0))));
      }
    }
    return pose(keys[keys.length - 1][1]);
  };
}

/** a fine tremble: three incommensurate sines (13–27 Hz), ±1 */
export const tremble = (t, ph = 0) =>
  0.5 * Math.sin(TAU * 13.1 * t + ph) + 0.3 * Math.sin(TAU * 19.7 * t + 1.7 * ph + 1) + 0.2 * Math.sin(TAU * 27.3 * t + 2.3 * ph + 2);

/** a soft one-sided pulse that peaks at u = w (inhale hitches, laugh bounces) */
export const pulse = (u, w) => (u <= 0 ? 0 : (u / w) * Math.exp(1 - u / w));

// ================================================================== hashed blinks
export function hash01(a, b) {
  let h = Math.imul((a | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b | 0) + 0x632be5ab, 0xc2b2ae35);
  h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
/**
 * Idle blink times for one character: one blink per slot of 2.3–3.9 s, its place in the slot hashed from (seed, slot).
 * A blink that would land on a big beat ([a, b] windows) is pushed to just after it — a blink never hides a beat.
 */
export function blinkTimes(seed, D, beats, { gap = [2.3, 3.9], first = 0.5 } = {}) {
  const out = [];
  let t = first + 1.1 * hash01(seed, 0);
  for (let i = 1; t < D + 0.3 && i < 64; i++) {
    let b = t;
    for (let pass = 0; pass < 2; pass++) for (const [a, z] of beats) if (b > a - 0.15 && b < z) b = z + 0.08 + 0.3 * hash01(seed, 100 + i);
    if (!out.length || b - out[out.length - 1] > 0.7) out.push(b);
    t = b + gap[0] + (gap[1] - gap[0]) * hash01(seed, i);
  }
  return out;
}
/** blink amount 0..1 at t: closes in 0.07 s, holds 0.03 s, opens in 0.12 s */
export function blinkAt(t, times) {
  let b = 0;
  for (const s of times) {
    const u = t - s;
    if (u < 0 || u > 0.22) continue;
    b = Math.max(b, u < 0.07 ? sm(u / 0.07) : u < 0.1 ? 1 : 1 - sm((u - 0.1) / 0.12));
  }
  return b;
}

// ================================================================== closed-form damped springs
/**
 * samples: driver values at t0 + i·h. Returns lag(t) = follower − driver for a spring (natural frequency f Hz,
 * damping ratio zeta) that is at rest before t0. For a piecewise-linear driver d, the lag e obeys
 *   e'' + 2ζω e' + ω² e = −d'' = −Σ Δv_k δ(t − t_k)   →   e(t) = −Σ_k (Δv_k / ω_d) · e^{−ζω(t−t_k)} · sin(ω_d (t−t_k))
 * (exact between samples). Only the impulses of the last ~6 time constants contribute.
 */
export function spring(samples, t0, h, f, zeta) {
  const n = samples.length;
  const dv = new Float64Array(n);
  for (let i = 1; i < n - 1; i++) dv[i] = (samples[i + 1] - 2 * samples[i] + samples[i - 1]) / h;
  const w = TAU * f, a = zeta * w, wd = w * Math.sqrt(1 - zeta * zeta);
  const span = Math.ceil(6 / a / h);
  return (t) => {
    const k1 = Math.min(n - 2, Math.floor((t - t0) / h));
    let e = 0;
    for (let k = Math.max(1, k1 - span); k <= k1; k++) {
      const tau = t - (t0 + k * h);
      if (dv[k] !== 0) e -= (dv[k] / wd) * Math.exp(-a * tau) * Math.sin(wd * tau);
    }
    return e;
  };
}
/** a single closed-form kick: a spring knocked at t0 (amplitude amp, f Hz, damping zeta) */
export const kick = (t, t0, amp, f, zeta) => {
  const u = t - t0;
  if (u <= 0) return 0;
  const w = TAU * f;
  return amp * Math.exp(-zeta * w * u) * Math.sin(w * Math.sqrt(1 - zeta * zeta) * u);
};

// ================================================================== placement: rig units → stage px
/**
 * C: { hip: [x, y], neckH (px), R (head radius px), s = R/100, headUp (rig units from neck pivot to head centre) }
 * The body leans about the hip, lifts, and squashes; the head rolls about the neck pivot and squashes from it.
 */
export function xform(C, c, pop = 1) {
  const lean = (c.lean * Math.PI) / 180, roll = ((c.tilt + c.lean) * Math.PI) / 180;
  const sx = 1 + 0.1 * c.squash, sy = 1 - 0.13 * c.squash;
  const lift = c.lift * C.R * 0.4;
  const neckH = C.neckH * (1 - 0.05 * c.squash) * pop;
  const neck = [C.hip[0] + Math.sin(lean) * neckH, C.hip[1] - lift - Math.cos(lean) * neckH];
  return { lean, roll, sx: sx * pop, sy: sy * pop, s: C.s, neck, lift, pop };
}
/** pitch moves the features (not the skull): back = up and a little compressed */
export const featureY = (c, y) => y * (1 - 0.06 * Math.abs(c.pitch)) + 12 * c.pitch;
export function toStage(C, X, x, y) {
  const px = x * X.sx * X.s, py = (y - C.headUp) * X.sy * X.s;
  const cs = Math.cos(X.roll), sn = Math.sin(X.roll);
  return [X.neck[0] + px * cs - py * sn, X.neck[1] + px * sn + py * cs];
}
/** set ctx to the head's rig space */
export function headSpace(ctx, C, X) {
  ctx.translate(X.neck[0], X.neck[1]);
  ctx.rotate(X.roll);
  ctx.scale(X.sx * X.s, X.sy * X.s);
  ctx.translate(0, -C.headUp);
}

// ================================================================== drawing helpers
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU); }
function ink(ctx, C, w) { ctx.lineWidth = w; ctx.strokeStyle = C.pal.ink; ctx.stroke(); }
function fillInk(ctx, C, fill, w) { ctx.fillStyle = fill; ctx.fill(); if (w) ink(ctx, C, w); }
/** a closed polar outline through midpoints (smooth when the radii vary slowly, soft spikes when they alternate) */
function polarPath(ctx, pts) {
  const n = pts.length;
  ctx.beginPath();
  const m0 = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2];
  ctx.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
}

// ---------------------------------------------------------------- eyes
function closedCurve(E, side, shape, ex, ey) {
  const rx = E.shutW || E.rx, ry = Math.max(E.ry, 14);
  const line = [[-rx, 0.12 * ry], [0, 0.62 * ry], [rx, 0.12 * ry]];
  const happy = [[-rx, 0.4 * ry], [0, -0.95 * ry], [rx, 0.4 * ry]];
  const clench = [[side * 0.85 * rx, -0.72 * ry], [-side * 1.2 * rx, 0], [side * 0.85 * rx, 0.72 * ry]];
  const tgt = shape < 0 ? happy : clench, k = Math.min(1, Math.abs(shape));
  return line.map((p, i) => [ex + lerp(p[0], tgt[i][0], k), ey + lerp(p[1], tgt[i][1], k)]);
}

function drawEye(ctx, C, c, side, blink) {
  const E = C.eye, P = C.pal, lw = C.lw;
  const open = clamp(c.lid * (1 - blink), 0, 1.6);
  const wide = Math.max(0, open - 1), o1 = Math.min(open, 1), lo = clamp(c.lidLo);
  const ex = side * E.x, ey = E.y;
  const rx = E.rx * (1 + 0.16 * wide), ry = E.ry * (1 + 0.32 * wide);
  // the opening narrows between the lids: the upper lid comes down to a line just below the centre,
  // the lower lid pushes up with lidLo (a squint or a smile) — the eye stays one outlined almond
  const shut = ey + 0.42 * E.ry;
  const top = lerp(shut, ey - ry, o1);
  const bot = Math.max(top + 0.6, lerp(shut, ey + ry, o1) - 0.85 * E.ry * lo * o1);
  const cy = (top + bot) / 2, ryE = (bot - top) / 2, rxE = rx * (0.9 + 0.1 * o1);
  const aOpen = clamp((open - 0.06) / 0.12), aShut = clamp((0.2 - open) / 0.12);
  if (aOpen > 0) {
    ctx.save();
    ctx.globalAlpha *= aOpen;
    ell(ctx, ex, cy, rxE, ryE);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = E.style === 'iris' ? P.iris : E.style === 'dot' ? P.ink : '#fffdf8';
    ctx.fillRect(ex - rx - 2, ey - ry - 2, 2 * rx + 4, 2 * ry + 4);
    // where the pupil looks: a gaze vector, plus convergence (both pupils toward the nose and down)
    const gx = clamp(c.lookX - side * 0.85 * c.cross, -1.2, 1.2), gy = clamp(c.lookY + 0.55 * c.cross, -1, 1.1);
    if (E.style === 'white') {
      const pr = E.pupil * c.pupil * (1 - 0.12 * wide);
      const px = ex + gx * (rx - pr) * 0.78, py = ey + gy * (ry - pr) * 0.62 + 2;
      ell(ctx, px, py, pr, pr * 1.08); ctx.fillStyle = P.iris; ctx.fill();
      ell(ctx, px, py, pr * 0.55, pr * 0.6); ctx.fillStyle = P.ink; ctx.fill();
      ell(ctx, px + pr * 0.38, py - pr * 0.42, pr * 0.32, pr * 0.32); ctx.fillStyle = '#fff'; ctx.fill();
      ell(ctx, px - pr * 0.35, py + pr * 0.4, pr * 0.14, pr * 0.14); ctx.fill();
    } else if (E.style === 'iris') {
      const k = clamp((c.pupil - 0.4) / 1.2), q = clamp((1 - c.pupil) / 0.6);
      const pw = rx * (0.12 + 0.42 * k), ph = ry * (0.88 - 0.42 * q);
      const px = ex + gx * rx * 0.55, py = ey + gy * ry * 0.4;
      ell(ctx, ex + gx * rx * 0.18, ey + ry * 0.35, rx * 0.9, ry * 0.55); ctx.fillStyle = P.iris2; ctx.fill();
      ell(ctx, px, py, pw, ph); ctx.fillStyle = P.ink; ctx.fill();
      ell(ctx, px + rx * 0.3, py - ry * 0.36, rx * 0.2, rx * 0.2); ctx.fillStyle = '#fff'; ctx.fill();
      ell(ctx, px - rx * 0.22, py + ry * 0.38, rx * 0.09, rx * 0.09); ctx.fill();
    } else {
      const px = ex + gx * rx * 0.25, py = ey + gy * ry * 0.2;
      ell(ctx, px + rx * 0.3, py - ry * 0.35, rx * 0.34, rx * 0.34); ctx.fillStyle = '#fff'; ctx.fill();
    }
    ctx.restore();
    if (E.style !== 'dot') {
      ell(ctx, ex, cy, rxE, ryE); ink(ctx, C, lw * 0.8);
      // the upper lid line is a little heavier
      ctx.beginPath(); ctx.ellipse(ex, cy, rxE, ryE, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.lineCap = 'round'; ink(ctx, C, lw * 1.05);
    }
    ctx.restore();
  }
  if (aShut > 0) {
    const shape = blink > 0.5 && c.lid > 0.5 ? 0 : c.shape;
    const [a, b, d] = closedCurve(E, side, shape, ex, ey);
    ctx.save();
    ctx.globalAlpha *= aShut;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(b[0], b[1], d[0], d[1]);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ink(ctx, C, lw * 1.05);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- brows, nose, mouth, cheeks
function drawBrows(ctx, C, c) {
  const B = C.brow;
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    const up = c.browUp * B.lift + side * c.browTilt * 5;
    const yIn = B.y - up + c.browIn * 9, yOut = B.y - up - c.browIn * 3;
    const xIn = side * (B.x - B.len + c.browIn * 3), xOut = side * (B.x + B.len);
    ctx.beginPath();
    ctx.moveTo(xIn, yIn);
    ctx.quadraticCurveTo((xIn + xOut) / 2, (yIn + yOut) / 2 - B.arch * (1 + 0.35 * c.browUp - 0.6 * Math.max(0, c.browIn)), xOut, yOut);
    ctx.lineWidth = B.w; ctx.strokeStyle = C.pal.brow; ctx.stroke();
  }
}

function drawNose(ctx, C, c) {
  const N = C.nose, P = C.pal, fl = clamp(c.nostril, 0, 1.3), ny = N.y;
  if (N.style === 'cat') {
    const w = N.w * (1 + 0.25 * fl), h = N.h;
    ctx.beginPath();
    ctx.moveTo(-w, ny - h * 0.45);
    ctx.quadraticCurveTo(0, ny - h * 1.0, w, ny - h * 0.45);
    ctx.quadraticCurveTo(w * 0.55, ny + h * 0.5, 0, ny + h * 0.62);
    ctx.quadraticCurveTo(-w * 0.55, ny + h * 0.5, -w, ny - h * 0.45);
    fillInk(ctx, C, P.nose, C.lw * 0.55);
    for (const side of [-1, 1]) { ell(ctx, side * w * 0.42, ny - h * 0.05, 1 + 2.2 * fl, 0.8 + 1.6 * fl, side * 0.5); ctx.fillStyle = P.ink; ctx.fill(); }
    ell(ctx, -w * 0.25, ny - h * 0.55, w * 0.3, h * 0.16); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill();
  } else {
    const w = N.w * (1 + 0.32 * fl), h = N.h * (1 + 0.08 * fl);
    ell(ctx, 0, ny, w, h);
    fillInk(ctx, C, P.nose, C.lw * 0.5);
    ell(ctx, -w * 0.32, ny - h * 0.4, w * 0.32, h * 0.22); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill();
    ctx.fillStyle = P.ink;
    for (const side of [-1, 1]) { ell(ctx, side * w * 0.46, ny + h * 0.3, 1.4 + 2.4 * fl, 1 + 2.1 * fl, -side * 0.35); ctx.fill(); }
  }
  // scrunch: "bunny lines" on both sides of the bridge
  if (c.wrinkle > 0.03) {
    ctx.save();
    ctx.globalAlpha *= clamp(c.wrinkle);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const side of [-1, 1]) for (let i = 0; i < 2; i++) {
      const x = side * (N.w + 3 + i * 4), y = ny - N.h * 0.5 - i * 7;
      ctx.moveTo(x, y); ctx.quadraticCurveTo(x + side * 5, y - 2, x + side * 8, y - 8);
    }
    ink(ctx, C, C.lw * 0.42);
    ctx.restore();
  }
}

function drawMouth(ctx, C, c) {
  const M = C.mouth, P = C.pal;
  const open = clamp(c.mOpen, 0, 1.25), round = Math.max(0, -c.mWide), wide = Math.max(0, c.mWide);
  const hw = M.w * (1 + 0.55 * wide) * (1 - 0.45 * round) * (1 + 0.12 * open);
  const cy = M.y - c.mCurve * M.curve * (1 - 0.4 * open);
  const mid = M.y + c.mCurve * M.curve * 0.55;
  // the upper lip arches up as the mouth opens (a gasp); a smile keeps it flatter
  const topMid = mid - open * M.h * (0.24 + 0.3 * round - 0.16 * clamp(c.mCurve)) + (M.style === 'cat' ? -2 : 0);
  const botMid = mid + open * M.h * (1 - 0.25 * wide);
  const kx = 0.52 + 0.4 * round;
  const ctl = (m) => (m - 0.25 * cy) / 0.75;          // cubic control y whose curve passes through m at its middle
  const aOpen = clamp((open - 0.025) / 0.07);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const cavity = () => {
    ctx.beginPath();
    ctx.moveTo(-hw, cy);
    if (M.style === 'cat') {
      ctx.quadraticCurveTo(-hw * 0.5, topMid + 10, 0, topMid);
      ctx.quadraticCurveTo(hw * 0.5, topMid + 10, hw, cy);
    } else ctx.bezierCurveTo(-hw * kx, ctl(topMid), hw * kx, ctl(topMid), hw, cy);
    ctx.bezierCurveTo(hw * (kx + 0.1), ctl(botMid), -hw * (kx + 0.1), ctl(botMid), -hw, cy);
    ctx.closePath();
  };
  if (aOpen > 0) {
    ctx.save();
    ctx.globalAlpha *= aOpen;
    cavity();
    ctx.fillStyle = P.mouth; ctx.fill();
    ctx.save();
    ctx.clip();
    const h = botMid - topMid;
    ell(ctx, 0, botMid - h * 0.12, hw * 0.62, h * 0.36); ctx.fillStyle = P.tongue; ctx.fill();
    if (c.teeth > 0.02) {
      ctx.fillStyle = '#fffaf2';
      if (M.style === 'cat') {
        for (const side of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(side * hw * 0.62, cy - 6); ctx.lineTo(side * hw * 0.38, cy - 4); ctx.lineTo(side * hw * 0.5, cy + 9 * c.teeth); ctx.fill();
        }
      } else ctx.fillRect(-hw, topMid - 30, 2 * hw, 30 + 8 * c.teeth);
    }
    ctx.restore();
    cavity();
    ink(ctx, C, C.lw * 0.85);
    ctx.restore();
  }
  if (aOpen < 1) {
    ctx.save();
    ctx.globalAlpha *= 1 - aOpen;
    ctx.beginPath();
    if (M.style === 'cat') {
      ctx.moveTo(-hw, cy); ctx.quadraticCurveTo(-hw * 0.5, mid + 9, 0, mid - 1); ctx.quadraticCurveTo(hw * 0.5, mid + 9, hw, cy);
    } else {
      ctx.moveTo(-hw, cy); ctx.bezierCurveTo(-hw * kx, ctl(mid), hw * kx, ctl(mid), hw, cy);
    }
    ink(ctx, C, C.lw * 0.9);
    ctx.restore();
  }
  if (M.style === 'cat') {   // the philtrum: nose to mouth
    ctx.beginPath(); ctx.moveTo(0, C.nose.y + C.nose.h * 0.6); ctx.lineTo(0, topMid + (aOpen > 0 ? 0 : mid - topMid)); ink(ctx, C, C.lw * 0.6);
  }
  return { hw, cy, mid, botMid };
}

function drawCheeks(ctx, C, c, dy) {
  const K = C.cheek;
  ctx.save();
  ctx.globalAlpha *= 0.42 + 0.3 * clamp(c.cheek);
  ctx.fillStyle = C.pal.blush;
  for (const side of [-1, 1]) {
    ell(ctx, side * (K.x + 2 * c.cheek), K.y - 6 * c.cheek + dy, K.rx * (1 + 0.22 * c.cheek), K.ry * (1 + 0.18 * c.cheek));
    ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- head shapes, hair, ears, extras
function catHeadPts(c, n = 60) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const th = (i / n) * TAU;
    let r = 1;
    // fluffy cheeks on the lower sides (θ ≈ 0.5 and π − 0.5, y down)
    const cheekW = Math.exp(-((th - 0.5) ** 2) / 0.09) + Math.exp(-((th - (Math.PI - 0.5)) ** 2) / 0.09);
    r += 0.07 * cheekW;
    const tuft = 0.5 * cheekW + clamp(c.fur) * (0.8 + 0.4 * Math.sin(i * 2.3));
    r += (i % 2 ? 0.075 : -0.02) * tuft;
    pts.push([108 * r * Math.cos(th), 86 * r * Math.sin(th) + 4]);
  }
  return pts;
}

function drawHeadShape(ctx, C, c) {
  const P = C.pal;
  const g = ctx.createRadialGradient(-34, -44, 8, -10, -10, 140);
  g.addColorStop(0, P.skinLit); g.addColorStop(0.55, P.skin); g.addColorStop(1, P.skinShade);
  if (C.head === 'cat') polarPath(ctx, catHeadPts(c));
  else ell(ctx, 0, 0, C.headRx, C.headRy);
  fillInk(ctx, C, g, C.lw);
}

function drawBackParts(ctx, C, c, S) {
  const P = C.pal, lw = C.lw;
  if (C.hair === 'bun') {
    // bun on a spring: it lags the head's roll and bob
    ctx.save();
    ctx.translate(0, -100);
    ctx.rotate((S.bun * Math.PI) / 180);
    ctx.translate(0, S.bunY);
    ell(ctx, 0, -14, 36, 31); fillInk(ctx, C, P.hair, lw);
    ctx.beginPath(); ctx.arc(-6, -18, 18, 3.6, 5.2); ctx.strokeStyle = P.hairShade; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-40, -30); ctx.lineTo(30, 4); ink(ctx, C, 9);
    ctx.beginPath(); ctx.moveTo(-40, -30); ctx.lineTo(30, 4); ctx.strokeStyle = P.pin; ctx.lineWidth = 4; ctx.stroke();
    ell(ctx, -42, -31, 6, 6); fillInk(ctx, C, P.pin, 3);
    ctx.restore();
    ell(ctx, 0, -14, 106, 94); fillInk(ctx, C, P.hair, lw);   // the back of the hair
  }
  if (C.ears === 'round') {
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * (C.headRx - 8), 10);
      ctx.rotate((S.ear * Math.PI) / 180);
      ell(ctx, side * 8, 0, 19, 22); fillInk(ctx, C, P.skin, lw);
      ctx.beginPath(); ctx.arc(side * 9, 1, 9, side > 0 ? -1.4 : 1.7, side > 0 ? 1.4 : 4.5); ink(ctx, C, lw * 0.5);
      ctx.restore();
    }
  }
  if (C.ears === 'cat') {
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 58, -58);
      const back = c.earBack;
      // mirrored: flattened back / perked forward and the vertical flop; shared: the lag of the head's roll
      const deg = side * (back * 52 + S.earY * 0.5) + S.ear + (side > 0 ? S.twitch : 0);
      ctx.rotate((deg * Math.PI) / 180);
      ctx.scale(1, 1 - 0.32 * Math.max(0, back) + 0.08 * Math.max(0, -back));
      ctx.beginPath();
      ctx.moveTo(-side * 34, 10); ctx.quadraticCurveTo(side * 10, -86, side * 26, -78); ctx.quadraticCurveTo(side * 44, -40, side * 40, 22);
      ctx.closePath();
      fillInk(ctx, C, P.skin, lw);
      ctx.beginPath();
      ctx.moveTo(-side * 18, 4); ctx.quadraticCurveTo(side * 12, -62, side * 22, -58); ctx.quadraticCurveTo(side * 30, -30, side * 28, 10);
      ctx.closePath();
      ctx.fillStyle = P.earIn; ctx.fill();
      ctx.restore();
    }
  }
}

function drawHair(ctx, C, c, S) {
  const P = C.pal, lw = C.lw;
  if (C.hair === 'kid') {
    ctx.beginPath();
    ctx.moveTo(-101, 4);
    ctx.bezierCurveTo(-110, -72, -58, -114, 0, -114);
    ctx.bezierCurveTo(58, -114, 110, -72, 101, 4);
    ctx.bezierCurveTo(99, -32, 88, -58, 64, -66);
    ctx.quadraticCurveTo(52, -50, 34, -63);
    ctx.quadraticCurveTo(18, -50, 0, -65);
    ctx.quadraticCurveTo(-20, -50, -38, -63);
    ctx.quadraticCurveTo(-56, -52, -70, -63);
    ctx.bezierCurveTo(-90, -58, -100, -32, -101, 4);
    ctx.closePath();
    fillInk(ctx, C, P.hair, lw);
    ctx.beginPath(); ctx.moveTo(-58, -94); ctx.quadraticCurveTo(-30, -106, 0, -104); ctx.strokeStyle = P.hairLit; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
    // the tuft: a curl on a spring
    ctx.save();
    ctx.translate(6, -108);
    ctx.rotate((S.tuft * Math.PI) / 180);
    ctx.scale(1, 1 + 0.004 * S.tuftY);
    ctx.beginPath(); ctx.moveTo(0, 2); ctx.bezierCurveTo(2, -22, 22, -38, 38, -30); ctx.bezierCurveTo(48, -24, 44, -10, 33, -13);
    ctx.lineCap = 'round'; ctx.strokeStyle = P.ink; ctx.lineWidth = 15; ctx.stroke(); ctx.strokeStyle = P.hair; ctx.lineWidth = 7; ctx.stroke();
    ctx.restore();
  }
  if (C.hair === 'bun') {
    // a scalloped silver fringe of curls
    ctx.beginPath();
    ctx.moveTo(-98, 6);
    ctx.bezierCurveTo(-108, -70, -58, -108, 0, -108);
    ctx.bezierCurveTo(58, -108, 108, -70, 98, 6);
    const n = 7;
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.06 + (0.88 * (i + 1)) / n);
      const x = 96 * Math.cos(a), y = -74 * Math.sin(a) - 4 + 22;
      const am = Math.PI * (0.06 + (0.88 * (i + 0.5)) / n);
      ctx.quadraticCurveTo(84 * Math.cos(am), -52 * Math.sin(am) + 30, x, y);
    }
    ctx.closePath();
    fillInk(ctx, C, P.hair, lw);
    ctx.beginPath(); ctx.arc(-30, -70, 22, 3.5, 5.3); ctx.arc(26, -74, 20, 3.9, 5.6);
    ctx.strokeStyle = P.hairShade; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
  }
  if (C.head === 'cat') {
    // tabby stripes, clipped to the head
    ctx.save();
    polarPath(ctx, catHeadPts(c));
    ctx.clip();
    ctx.fillStyle = P.stripe;
    for (const [x, w, l] of [[-18, 7, 34], [0, 8, 40], [18, 7, 34]]) {
      ctx.beginPath(); ctx.moveTo(x - w, -92); ctx.quadraticCurveTo(x, -92 + l * 1.2, x + w, -92); ctx.fill();
    }
    for (const side of [-1, 1]) for (let i = 0; i < 2; i++) {
      const y = 6 + i * 16;
      ctx.beginPath(); ctx.moveTo(side * 118, y - 6); ctx.quadraticCurveTo(side * 92, y, side * 118, y + 6); ctx.fill();
    }
    ctx.restore();
  }
}

function drawMuzzle(ctx, C) {
  if (C.head !== 'cat') return;
  ctx.fillStyle = C.pal.muzzle;
  ell(ctx, -15, 30, 22, 16); ctx.fill();
  ell(ctx, 15, 30, 22, 16); ctx.fill();
  ell(ctx, 0, 42, 18, 12); ctx.fill();
}

function drawWhiskers(ctx, C, c, S) {
  if (C.head !== 'cat') return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = C.pal.ink; ctx.globalAlpha *= 0.75; ctx.lineWidth = 2.6;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 34, 28);
    // mirrored: nostril twitch, smile, fur puff, vertical bounce; shared: the lag of the head's roll
    const deg = side * (-c.nostril * 7 + c.mCurve * 4 + 8 * c.fur + S.whiskY) + S.whisk;
    ctx.rotate((deg * Math.PI) / 180);
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const y = (i - 1) * 8;
      ctx.moveTo(side * 6, y); ctx.quadraticCurveTo(side * 50, y + (i - 1) * 6 - 4, side * (92 + i * 4), y + (i - 1) * 14 + 2);
    }
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawGlasses(ctx, C, c, S) {
  if (!C.glasses) return;
  const E = C.eye;
  ctx.save();
  ctx.translate(0, E.y + S.glassY);
  ctx.rotate((S.glassR * Math.PI) / 180);
  for (const side of [-1, 1]) {
    ell(ctx, side * E.x, 0, 25, 23);
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = C.pal.frame; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(side * E.x - 12, -10); ctx.lineTo(side * E.x - 2, -18);
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(-E.x + 25, -2); ctx.quadraticCurveTo(0, -12, E.x - 25, -2);
  ctx.moveTo(-E.x - 25, -4); ctx.lineTo(-94, -10); ctx.moveTo(E.x + 25, -4); ctx.lineTo(94, -10);
  ctx.lineWidth = 4.5; ctx.strokeStyle = C.pal.frame; ctx.stroke();
  ctx.restore();
}

function drawLines(ctx, C, c, m) {
  if (!C.wrinkles) return;
  // forehead lines come with raised brows; smile lines follow the mouth corners; crow's feet with a squint
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = C.pal.line;
  ctx.lineWidth = 3;
  const fh = clamp(c.browUp);
  if (fh > 0.03) {
    ctx.globalAlpha = fh;
    ctx.beginPath();
    for (let i = 0; i < 2; i++) { const y = -60 - i * 9 - 8 * fh; ctx.moveTo(-22 + i * 4, y + 2); ctx.quadraticCurveTo(0, y - 3, 22 - i * 4, y + 2); }
    ctx.stroke();
  }
  ctx.globalAlpha = 0.5 + 0.4 * clamp(c.cheek);
  ctx.beginPath();
  for (const side of [-1, 1]) {
    ctx.moveTo(side * (C.nose.w + 10), C.nose.y + 4);
    ctx.quadraticCurveTo(side * (m.hw + 12), (C.nose.y + m.cy) / 2 + 4, side * (m.hw + 6), m.cy + 8);
  }
  ctx.stroke();
  const crow = clamp(c.lidLo * 1.5 + (c.lid < 0.2 ? 0.5 : 0));
  if (crow > 0.03) {
    ctx.globalAlpha = crow * 0.8;
    ctx.beginPath();
    for (const side of [-1, 1]) for (let i = -1; i <= 1; i++) {
      const x = side * (C.eye.x + 20), y = C.eye.y + i * 6;
      ctx.moveTo(x, y); ctx.lineTo(x + side * 8, y + i * 4);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draw one head. ctx is in stage space; C is the character spec, c the channel vector, S its secondary values
 * ({ tuft, tuftY, ear, earY, twitch, cheek, bun, bunY, glassY, glassR, whisk }), blink 0..1.
 */
export function drawHead(ctx, C, c, S, blink, X) {
  ctx.save();
  headSpace(ctx, C, X);
  ctx.lineJoin = 'round';
  drawBackParts(ctx, C, c, S);
  drawHeadShape(ctx, C, c);
  ctx.save();
  // pitch: tipping back lifts the whole face (hairline included) and compresses it a little; forward drops it
  ctx.translate(0, 12 * c.pitch);
  ctx.scale(1, 1 - 0.06 * Math.abs(c.pitch));
  drawHair(ctx, C, c, S);
  drawCheeks(ctx, C, c, S.cheek / C.s);
  drawMuzzle(ctx, C);
  for (const side of [-1, 1]) drawEye(ctx, C, c, side, blink);
  drawBrows(ctx, C, c);
  drawNose(ctx, C, c);
  const m = drawMouth(ctx, C, c);
  drawLines(ctx, C, c, m);
  drawWhiskers(ctx, C, c, S);
  drawGlasses(ctx, C, c, S);
  ctx.restore();
  ctx.restore();
}
