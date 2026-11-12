/*
 * 113 · 빵빵하게 — puffy type: flat letters inflate into glossy balloon letters.
 *
 * setup(): every shape (the syllable 빵 in Do Hyeon, corners rounded by an opening/closing of its distance field, a star, a heart, a dot) is rasterised once (textAlpha), turned
 *          into a sub-pixel signed distance (signedDistance), smoothed a little (so the medial ridge rounds over) and
 *          packed with two blurred coverages (the shadow penumbrae) into one RGBA16F atlas.
 * frame(t): per object only a handful of numbers — transform, inflation radius R(t), fattening e(t), height above the
 *          wall, the poke dent — and one fragment shader (shader.js) turns distance into height, height into normals,
 *          and normals into candy vinyl: diffuse, a tight specular, a rim, a softbox and coloured studio reflections,
 *          plus a shadow on the backdrop that slides away and softens as the shape puffs up.
 * Story: two flat stickers 「빵」「빵」 slap onto a pastel studio wall → two breaths each puff them into balloons (R(t) is a
 *        spring with overshoot), confetti shapes follow → a finger pokes the right letter: a dent sinks in and springs
 *        back with a wobble → "한 번 더": a final big inflate (camera punch, glints) → they bob while the softbox glides.
 * Layers: 2D backdrop + ribbons (z0) · WebGL2 shapes + shadows (z1, transparent) · 2D finger, glints, copy (z2).
 */
import { defineDemo, rand, clamp, lerp, smooth, ramp, ease } from '../_lib/stage.js';
import { FONTS, fontReady, textAlpha, signedDistance } from '../_lib/type.js';
import { N, VERT, FRAG } from './shader.js';

const D = 10, TAU = Math.PI * 2, DEG = Math.PI / 180;
const W = 1080, H = 1920;
const KR = `"${FONTS.pretendard.family}"`;
const GLYPH_FONT = `400 560px "${FONTS.doHyeon.family}"`;
const INK = '#3D2C5C', ACCENT = '#FF4F7B';

// candy pastels (linear-ish 0..1, used by the shader and the 2D layers)
const C = {
  pink: [1.0, 0.52, 0.70], sky: [0.42, 0.71, 1.0], butter: [1.0, 0.80, 0.32], mint: [0.38, 0.84, 0.71], lilac: [0.70, 0.59, 0.98],
};
const WALL = [0.94, 0.88, 0.97], FLOOR = [1.0, 0.87, 0.83], SHADOW = [0.34, 0.19, 0.44];
const css = (c, k = 1, a = 1) => `rgba(${Math.round(clamp(c[0] * k) * 255)},${Math.round(clamp(c[1] * k) * 255)},${Math.round(clamp(c[2] * k) * 255)},${a})`;

// ------------------------------------------------------------------------------------------------ story times
const TF = 6.3;                                         // the final big inflate
const FING_IN = 4.36, PRESS0 = 4.74, PRESS1 = 4.94, RELEASE = 5.1;
const NOTCH = 36;                                       // how far the outline gives way (local px)
const SWEEP0 = 7.5, SWEEP1 = 9.6;                       // the softbox glides across
const SCRIM_Y = 1560;                                   // caption scrim starts here (fades in to the bottom)

/** step response 0 → 1 with overshoot (an inflation breath) */
const spring = (s, f = 1.3, k = 6) => (s <= 0 ? 0 : 1 - Math.exp(-k * s) * Math.cos(TAU * f * s));
/** impulse response: 0, swings ±1, dies out (a jiggle) */
const wobble = (s, f = 3, k = 5) => (s <= 0 ? 0 : Math.exp(-k * s) * Math.sin(TAU * f * s));

/** the poke, as one closed-form signal: 0 → 1 while the finger presses, then a damped spring back through 0 */
function pokeQ(t) {
  if (t < PRESS0) return 0;
  if (t < RELEASE) return ease.outCubic(clamp((t - PRESS0) / (PRESS1 - PRESS0)));
  const s = t - RELEASE;
  return Math.exp(-3.4 * s) * Math.cos(TAU * 2.1 * s);
}

// ------------------------------------------------------------------------------------------------ the cast
// back to front. x, y: stage centre · rot: degrees · sc: stage px per local px · breaths: [time, amount] ·
// z: how far it floats off the wall once inflated (shadow offset) · bob: [amplitude px, period s, phase]
const OBJS = [
  { id: 'heart', shape: 'heart', x: 168, y: 455, rot: -14, sc: 0.8, col: C.lilac, ta: 0.34, breaths: [[1.7, 1]], z: 70, bob: [9, 2.7, 0.3], fin: 0.1 },
  { id: 'star', shape: 'star', x: 896, y: 440, rot: 12, sc: 0.8, col: C.butter, ta: 0.42, breaths: [[1.82, 1]], z: 86, bob: [11, 3.1, 1.7], fin: 0.16 },
  { id: 'dot1', shape: 'dot', x: 580, y: 452, rot: 0, sc: 0.42, col: C.mint, ta: 0.5, breaths: [[1.94, 1]], z: 52, bob: [7, 2.3, 2.4], fin: 0.2 },
  { id: 'star2', shape: 'star', x: 170, y: 1400, rot: -20, sc: 0.52, col: C.mint, ta: 0.56, breaths: [[2.06, 1]], z: 42, bob: [6, 2.9, 4.1], fin: 0.24 },
  { id: 'dot2', shape: 'dot', x: 916, y: 1414, rot: 0, sc: 0.8, col: C.lilac, ta: 0.62, breaths: [[2.18, 1]], z: 48, bob: [7, 3.3, 5.2], fin: 0.28 },
  { id: 'dot3', shape: 'dot', x: 548, y: 1530, rot: 0, sc: 0.36, col: C.pink, ta: 0.68, breaths: [[2.28, 1]], z: 36, bob: [5, 2.5, 3.3], fin: 0.32 },
  { id: 'A', shape: 'glyph', x: 292, y: 834, rot: -5, sc: 0.92, col: C.pink, ta: 0.08, breaths: [[0.6, 0.36], [1.05, 0.3]], z: 66, bob: [10, 2.6, 0.0], fin: 0, letter: true, nb: [C.sky, 1] },
  { id: 'B', shape: 'glyph', x: 792, y: 880, rot: 4.5, sc: 0.92, col: C.sky, ta: 0.2, breaths: [[0.95, 0.36], [1.4, 0.3]], z: 66, bob: [10, 2.9, 1.9], fin: 0.07, letter: true, nb: [C.pink, -1], poke: true },
];

// ------------------------------------------------------------------------------------------------ shapes → atlas
const PAD = 100;
function blur(src, w, h, sigma) {
  const r = Math.ceil(sigma * 3), k = new Float32Array(2 * r + 1);
  let sum = 0;
  for (let i = -r; i <= r; i++) { k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma)); sum += k[i + r]; }
  for (let i = 0; i < k.length; i++) k[i] /= sum;
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let i = -r; i <= r; i++) { let xx = x + i; xx = xx < 0 ? 0 : xx >= w ? w - 1 : xx; s += src[row + xx] * k[i + r]; }
      tmp[row + x] = s;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let s = 0;
      for (let i = -r; i <= r; i++) { let yy = y + i; yy = yy < 0 ? 0 : yy >= h ? h - 1 : yy; s += tmp[yy * w + x] * k[i + r]; }
      out[y * w + x] = s;
    }
  }
  return out;
}

function starPath(ctx, cx, cy, ro, ri) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? ri : ro;
    if (i) ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); else ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
}
function heartPath(ctx, cx, cy, k) {
  ctx.beginPath();
  for (let i = 0; i <= 160; i++) {
    const s = (i / 160) * TAU;
    const x = 16 * Math.sin(s) ** 3, y = 13 * Math.cos(s) - 5 * Math.cos(2 * s) - 2 * Math.cos(3 * s) - Math.cos(4 * s);
    if (i) ctx.lineTo(cx + k * x, cy - k * (y + 2.5)); else ctx.moveTo(cx + k * x, cy - k * (y + 2.5));
  }
  ctx.closePath();
}

/** morphological opening on a distance field: erode by r, re-measure, grow back by r → convex corners get radius r */
function openShape(sd, w, h, r) {
  const a = new Float32Array(w * h);
  for (let i = 0; i < a.length; i++) a[i] = clamp(0.5 - (sd[i] + r));
  const o = signedDistance(a, w, h);
  for (let i = 0; i < o.length; i++) o[i] -= r;
  return o;
}
/** closing: grow by r, re-measure, shrink back → concave corners get radius r (narrow slots under 2r would fill) */
function closeShape(sd, w, h, r) {
  const a = new Float32Array(w * h);
  for (let i = 0; i < a.length; i++) a[i] = clamp(0.5 - (sd[i] - r));
  const o = signedDistance(a, w, h);
  for (let i = 0; i < o.length; i++) o[i] += r;
  return o;
}

/** one atlas cell: draw → coverage → signed distance (smoothed) + two blurred coverages */
function buildShape(kind, mctx) {
  let w, h, draw, inkW, inkH;
  if (kind === 'glyph') {
    mctx.font = GLYPH_FONT;
    const m = mctx.measureText('빵');
    inkW = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight);
    inkH = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);
    w = inkW + 2 * PAD; h = inkH + 2 * PAD;
    draw = (ctx) => { ctx.font = GLYPH_FONT; ctx.textBaseline = 'alphabetic'; ctx.fillText('빵', PAD + m.actualBoundingBoxLeft + (inkW - m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2, PAD + m.actualBoundingBoxAscent); };
  } else if (kind === 'star') {
    const ro = 120, ri = 60, lw = 34;
    inkW = inkH = 2 * (ro + lw / 2);
    w = h = inkW + 2 * PAD;
    draw = (ctx) => { starPath(ctx, w / 2, h / 2 + 10, ro, ri); ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = '#fff'; ctx.fill(); ctx.stroke(); };
  } else if (kind === 'heart') {
    const k = 7.2, lw = 22;
    inkW = Math.ceil(32 * k + lw); inkH = Math.ceil(30 * k + lw);
    w = inkW + 2 * PAD; h = inkH + 2 * PAD;
    draw = (ctx) => { heartPath(ctx, w / 2, h / 2, k); ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = '#fff'; ctx.fill(); ctx.stroke(); };
  } else {
    inkW = inkH = 120;
    w = h = inkW + 2 * PAD;
    draw = (ctx) => { ctx.beginPath(); ctx.arc(w / 2, h / 2, 60, 0, TAU); ctx.fill(); };
  }
  const a = textAlpha(w, h, draw);
  let sd = signedDistance(a, w, h);
  if (kind === 'glyph') sd = closeShape(openShape(sd, w, h, 15), w, h, 6);   // round the type's corners like a seamed balloon
  sd = blur(sd, w, h, 6);
  const g1 = blur(a, w, h, 9), g2 = blur(a, w, h, 30);
  let dMax = 0;
  for (let i = 0; i < sd.length; i++) if (-sd[i] > dMax) dMax = -sd[i];
  return { kind, w, h, inkW, inkH, sd, g1, g2, dMax };
}

/** shelf-pack the cells into one texture (2 px gutters) */
function packAtlas(shapes) {
  const order = Object.values(shapes).sort((p, q) => q.h - p.h);
  const maxW = 1300;
  let x = 0, y = 0, rowH = 0, aw = 0;
  for (const s of order) {
    if (x + s.w > maxW) { x = 0; y += rowH + 2; rowH = 0; }
    s.ox = x; s.oy = y;
    x += s.w + 2; rowH = Math.max(rowH, s.h); aw = Math.max(aw, x);
  }
  const AW = aw, AH = y + rowH;
  const data = new Float32Array(AW * AH * 4);
  for (let i = 0; i < data.length; i += 4) data[i] = 500;       // far outside everywhere else
  for (const s of order) {
    for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) {
      const k = j * s.w + i, o = ((s.oy + j) * AW + s.ox + i) * 4;
      data[o] = s.sd[k]; data[o + 1] = s.g1[k]; data[o + 2] = s.g2[k];
    }
  }
  return { AW, AH, data };
}

/** local height-field helpers on the CPU (same profile as the shader) — used to place the glints and the poke */
function cpuField(s) {
  const at = (x, y) => { x = clamp(Math.round(x + s.w / 2), 0, s.w - 1); y = clamp(Math.round(y + s.h / 2), 0, s.h - 1); return -s.sd[y * s.w + x]; };
  return { depth: at };
}

// ------------------------------------------------------------------------------------------------ object state at t
function state(o, t) {
  const ap = clamp((t - o.ta) / 0.42);
  const vis = clamp((t - o.ta) / 0.07);
  let lvl = 0;
  for (const [tb, amt] of o.breaths) lvl += amt * spring(t - tb, 1.3, 6);
  const lastBreath = o.breaths[o.breaths.length - 1][0];
  const finAmp = o.letter ? 0.75 : 0.25;
  const fin = finAmp * spring(t - (TF + o.fin), 1.05, 4.0);
  const inf = Math.max(0, lvl), full = clamp(inf / o.full);
  const bobEnv = ramp(t, lastBreath + 0.15, lastBreath + 1.3);
  const [ba, bp, bph] = o.bob;
  let x = o.x + 0.35 * ba * Math.sin((TAU * t) / (bp * 1.7) + bph * 2.3) * bobEnv;
  let y = o.y + ba * Math.sin((TAU * t) / bp + bph) * bobEnv;
  let rot = o.rot * DEG + 1.6 * DEG * Math.sin((TAU * t) / (bp * 1.3) + bph + 1) * bobEnv;
  let sx = 1, sy = 1;
  let z = o.z * full * (1 + 0.5 * fin / finAmp) + 7 * Math.sin((TAU * t) / bp + bph + 0.8) * bobEnv;
  let sc = o.sc * lerp(1.22, 1, ease.outBack(ap, 1.6)) * (1 + 0.04 * full + 0.075 * fin / finAmp);
  let R = o.R1 * (inf + fin);
  let dentA = 0, rim = 0.3 * Math.exp(-Math.max(0, t - TF - 0.15) * 1.5) * (t > TF ? smooth((t - TF) / 0.15) : 0);
  let push = 0;
  if (o.poke) {
    const q = pokeQ(t);
    dentA = 0.7 * q;
    push = -NOTCH * q;                                          // the outline gives way under the fingertip, then overshoots out
    sx *= 1 - 0.045 * q; sy *= 1 + 0.03 * q;                    // pushed from the side: narrower, a little taller
    x -= 9 * q;
    z -= 14 * q;
    R *= 1 + 0.07 * Math.max(0, q);                            // the air pushed out of the dent puffs the rest
  }
  if (o.id === 'A') {                                           // sympathetic jiggle: the neighbour was bumped
    const s = wobble(t - RELEASE - 0.05, 1.9, 3.6);
    rot += 1.8 * DEG * s; x -= 6 * s;
  }
  const e = o.e1 * full + o.e2 * (fin / finAmp);
  const gloss = smooth(clamp(inf / 0.4));
  return { x, y, rot, sx, sy, sc, R: Math.max(1.2, R), e, z: Math.max(0, z), dentA, push, vis, gloss, rim, inf, fin, full };
}
/** local → world (stage px before the camera) */
function toWorld(st, qx, qy) {
  const c = Math.cos(st.rot), s = Math.sin(st.rot);
  const lx = qx * st.sx * st.sc, ly = qy * st.sy * st.sc;
  return [st.x + c * lx - s * ly, st.y + s * lx + c * ly];
}

// ------------------------------------------------------------------------------------------------ copy
const LINES = [
  { words: [['숨', INK], ['한', INK], ['번,', INK], ['후—', ACCENT]], t0: 0.25, t1: 3.6, size: 70 },
  { words: [['콕', ACCENT], ['찔러', INK], ['보면', INK]], t0: 4.0, t1: 5.45, size: 70 },
  { words: [['한', ACCENT], ['번', ACCENT], ['더,', INK], ['후—!', ACCENT]], t0: 5.82, t1: 7.05, size: 70 },
  { words: [['기분까지', INK], ['빵빵', ACCENT]], t0: 7.45, t1: 99, size: 92 },
];
const COPY_Y = 300;

function drawCopy(g, t) {
  for (const L of LINES) {
    if (t < L.t0 || t > L.t1 + 0.6) continue;
    const size = L.size;
    g.font = `800 ${size}px ${KR}`;
    g.letterSpacing = `${(-0.03 * size).toFixed(1)}px`;
    const space = size * 0.26;
    const widths = L.words.map(([s]) => g.measureText(s).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (L.words.length - 1);
    let x = W / 2 - total / 2;
    g.save();
    g.beginPath();
    g.rect(0, COPY_Y - size * 1.05, W, size * 1.45);
    g.clip();
    L.words.forEach(([s, col], i) => {
      const pin = clamp((t - L.t0 - i * 0.075) / 0.55), pout = clamp((t - L.t1 - i * 0.045) / 0.26);
      const dy = (1 - ease.outExpo(pin)) * size * 1.15 - ease.inCubic(pout) * size * 1.2;
      if (pin > 0 && pout < 1) {
        g.fillStyle = col;
        g.fillText(s, x, COPY_Y + dy);
      }
      x += widths[i] + space;
    });
    g.restore();
  }
  g.letterSpacing = '0px';
}

/** every frame starts from default 2D state (transform, alpha, composite, dash, letter spacing) — nothing leaks between frames */
function resetCtx(g) {
  if (g.reset) { g.reset(); return; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.setLineDash([]);
  g.clearRect(0, 0, W, H);
}

// ------------------------------------------------------------------------------------------------ 2D sprites (setup)
function makeCanvas(w, h, headless) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, g: c.getContext('2d', headless ? { willReadFrequently: true } : undefined) };
}

function bakeBackdrop(headless) {
  const { c, g } = makeCanvas(W, H, headless);
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0.0, '#E4D9F6');
  lg.addColorStop(0.42, '#F2DFF0');
  lg.addColorStop(0.66, '#FBE6E6');
  lg.addColorStop(0.715, '#FFF1EC');     // the cyclorama sweep catches the light
  lg.addColorStop(0.76, '#FADDD5');
  lg.addColorStop(1.0, '#E9C0C4');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const glow = (x, y, r, col) => { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); };
  glow(150, 200, 1150, 'rgba(255,255,255,0.55)');                  // the softbox, upper left
  glow(990, 1540, 760, 'rgba(255,196,170,0.32)');                  // warm bounce off the floor
  glow(540, 1385, 640, 'rgba(255,248,244,0.35)');
  const R = rand(11301);
  const tints = ['rgba(255,170,205,', 'rgba(150,200,255,', 'rgba(255,214,120,', 'rgba(150,230,200,', 'rgba(190,165,255,'];
  for (let i = 0; i < 14; i++) {                                  // out-of-focus party bokeh on the wall
    const x = R() * W, y = 80 + R() * 1150, r = 40 + R() * 110, tc = tints[i % tints.length];
    const rg = g.createRadialGradient(x, y, r * 0.55, x, y, r);
    rg.addColorStop(0, `${tc}${(0.10 + R() * 0.08).toFixed(3)})`);
    rg.addColorStop(1, `${tc}0)`);
    g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  const vg = g.createRadialGradient(540, 860, 520, 540, 900, 1350);
  vg.addColorStop(0, 'rgba(120,80,160,0)'); vg.addColorStop(1, 'rgba(120,80,160,0.22)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const img = g.getImageData(0, 0, W, H), px = img.data;           // paper grain
  for (let i = 0; i < px.length; i += 4) { const n = (R() - 0.5) * 7; px[i] += n; px[i + 1] += n; px[i + 2] += n; }
  g.putImageData(img, 0, 0);
  return c;
}

// the poking hand, drawn once pointing to −x with the fingertip at (TIP_X, TIP_Y)
const TIP_X = 30, TIP_Y = 150;
function handParts(g, fill) {
  const parts = [
    () => g.roundRect(TIP_X, TIP_Y - 47, 470, 94, 47),           // index finger
    () => g.roundRect(400, TIP_Y - 82, 600, 380, 140),            // fist
    () => g.roundRect(388, TIP_Y + 34, 230, 92, 46),              // curled fingers
    () => g.roundRect(412, TIP_Y + 116, 214, 90, 45),
    () => g.roundRect(440, TIP_Y + 196, 190, 86, 43),
    () => g.roundRect(450, TIP_Y - 112, 280, 84, 42),             // thumb along the top
  ];
  for (const p of parts) { g.beginPath(); p(); fill(); }
}
function bakeHand(headless) {
  const { c, g } = makeCanvas(1060, 520, headless);
  const sk = g.createLinearGradient(0, TIP_Y - 120, 0, TIP_Y + 300);
  sk.addColorStop(0, '#FFDCC4'); sk.addColorStop(0.5, '#FFC4A6'); sk.addColorStop(1, '#F2A487');
  g.lineJoin = 'round';
  g.strokeStyle = '#D9806E'; g.lineWidth = 7;
  handParts(g, () => g.stroke());
  g.fillStyle = sk;
  handParts(g, () => g.fill());
  // knuckle seams between the curled fingers
  g.strokeStyle = 'rgba(205,118,98,0.55)'; g.lineWidth = 4; g.lineCap = 'round';
  for (const [x0, y0, x1] of [[396, TIP_Y + 40, 560], [420, TIP_Y + 122, 580], [446, TIP_Y + 202, 590]]) { g.beginPath(); g.moveTo(x0 + 30, y0); g.lineTo(x1, y0); g.stroke(); }
  // nail and creases on the index finger
  g.fillStyle = '#FFEDE4';
  g.beginPath(); g.roundRect(TIP_X + 14, TIP_Y - 34, 82, 50, 22); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.7)';
  g.beginPath(); g.roundRect(TIP_X + 26, TIP_Y - 27, 40, 11, 6); g.fill();
  g.strokeStyle = 'rgba(205,118,98,0.6)'; g.lineWidth = 4;
  for (const x of [196, 300]) { g.beginPath(); g.arc(x, TIP_Y + 2, 26, -0.9, 0.9); g.stroke(); }
  // a sleeve cuff in lilac
  const sl = g.createLinearGradient(0, 0, 0, 520);
  sl.addColorStop(0, '#B4A2FA'); sl.addColorStop(1, '#8D78E8');
  g.fillStyle = sl;
  g.beginPath(); g.roundRect(900, TIP_Y - 150, 160, 470, 46); g.fill();
  // highlight along the top of the finger
  g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(TIP_X + 120, TIP_Y - 34); g.lineTo(TIP_X + 400, TIP_Y - 34); g.stroke();
  // the hand's soft shadow (blurred once, here)
  const sh = makeCanvas(1060, 520, headless);
  sh.g.filter = 'blur(13px)';
  sh.g.fillStyle = 'rgba(70,30,90,1)';
  handParts(sh.g, () => sh.g.fill());
  return { hand: c, shadow: sh.c };
}

function sparkle(g, x, y, s, a) {
  if (a <= 0 || s <= 0) return;
  g.globalAlpha = a;
  const rg = g.createRadialGradient(x, y, 0, x, y, s * 1.1);
  rg.addColorStop(0, 'rgba(255,255,255,0.75)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rg; g.beginPath(); g.arc(x, y, s * 1.1, 0, TAU); g.fill();
  g.fillStyle = '#fff';
  g.beginPath();
  g.moveTo(x, y - s); g.quadraticCurveTo(x, y, x + s * 0.7, y); g.quadraticCurveTo(x, y, x, y + s);
  g.quadraticCurveTo(x, y, x - s * 0.7, y); g.quadraticCurveTo(x, y, x, y - s);
  g.fill();
  g.globalAlpha = 1;
}

// ------------------------------------------------------------------------------------------------ demo
defineDemo({
  id: '113-puffy-type',
  title: '빵빵하게',
  tech: '거리장 부풀림 셰이딩 · 높이장 법선 · 광택과 접촉 그림자',
  duration: D,
  background: '#E9DDF4',
  async setup({ canvas, headless }) {
    await fontReady(GLYPH_FONT, '빵');
    await fontReady(`800 70px ${KR}`, '숨한번,후—!콕찔러보면더기분까지빵');

    // ---- atlas
    const mctx = document.createElement('canvas').getContext('2d');
    const shapes = {};
    for (const k of ['glyph', 'star', 'heart', 'dot']) shapes[k] = buildShape(k, mctx);
    const atlas = packAtlas(shapes);
    for (const o of OBJS) {
      const s = shapes[o.shape];
      o.cell = s;
      o.R1 = o.letter ? 1.0 * (s.dMax + 4) : 1.0 * (s.dMax + 3);
      o.e1 = o.letter ? 2 : 3;
      o.e2 = o.letter ? 2.5 : 4;
      if (o.nb) o.nbCol = o.nb[0];
      o.full = o.breaths.reduce((a, b) => a + b[1], 0);
    }

    // ---- where to poke: the right end of the ring (ㅇ), from the side; the dent sits a little inside the outline
    const gs = shapes.glyph, F = cpuField(gs);
    let ex = -1e9, eys = 0, eyn = 0;
    for (let y = Math.round(gs.inkH * 0.12); y <= Math.round(gs.inkH / 2); y++) {
      let xr = -1e9;
      for (let x = Math.round(gs.inkW / 2) + 20; x > 0; x--) if (F.depth(x, y) > 0) { xr = x; break; }
      if (xr > ex + 0.5) { ex = xr; eys = y; eyn = 1; } else if (Math.abs(xr - ex) <= 0.5) { eys += y; eyn++; }
    }
    const B = OBJS.find((o) => o.poke);
    B.edge = [ex, eys / eyn];                                    // contact point on the outline
    B.dentC = [ex - 14, eys / eyn]; B.dentS = gs.dMax * 0.95;
    // glints: where the inflated normal faces the half vector of the key light (CPU copy of the profile)
    const L = [-0.48, -0.62, 0.62], Lm = Math.hypot(...L);
    const Hv = [L[0] / Lm, L[1] / Lm, L[2] / Lm + 1], Hm = Math.hypot(...Hv);
    const cand = [];
    const R2 = (gs.dMax + 4) * 1.4;
    for (let y = -gs.inkH / 2; y <= gs.inkH / 2; y += 3) for (let x = -gs.inkW / 2; x <= gs.inkW / 2; x += 3) {
      const d = F.depth(x, y) + 7;
      if (d < 4) continue;
      const gx = (F.depth(x + 2, y) - F.depth(x - 2, y)) / 4, gy = (F.depth(x, y + 2) - F.depth(x, y - 2)) / 4;
      const dc = Math.min(d, R2), u = 1 - dc / R2, h = R2 * Math.sqrt(Math.max(0, 1 - u * u));
      const dh = d < R2 ? Math.min(14, (R2 - dc) / Math.max(h, 0.35)) : 0;
      const n = [-dh * gx, -dh * gy, 1], nm = Math.hypot(...n);
      cand.push([(n[0] * Hv[0] + n[1] * Hv[1] + n[2] * Hv[2]) / (nm * Hm), x, y]);
    }
    cand.sort((p, q) => q[0] - p[0]);
    const glints = [];
    for (const c of cand) {
      if (glints.every((g) => Math.hypot(g[0] - c[1], g[1] - c[2]) > 150)) glints.push([c[1], c[2]]);
      if (glints.length === 3) break;
    }
    this.glints = glints;

    // ---- layers
    const back = canvas({ type: '2d', z: 0, attrs: headless ? { willReadFrequently: true } : undefined }).ctx;
    const { ctx: gl } = canvas({ type: 'webgl2', z: 1 });
    const over = canvas({ type: '2d', z: 2, attrs: headless ? { willReadFrequently: true } : undefined }).ctx;

    const bg = bakeBackdrop(headless);
    const hand = bakeHand(headless);
    // first composite of every offscreen canvas happens here, not in the first frame
    back.drawImage(bg, 0, 0); over.drawImage(hand.shadow, 0, 0); over.drawImage(hand.hand, 0, 0);
    back.clearRect(0, 0, W, H); over.clearRect(0, 0, W, H);

    // ---- GL
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    gl.bindVertexArray(gl.createVertexArray());
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, atlas.AW, atlas.AH, 0, gl.RGBA, gl.FLOAT, atlas.data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const U = {};
    for (const n of ['uAtlas', 'uAtlasSize', 'uN', 'uM', 'uP', 'uK', 'uDent', 'uCol', 'uNb', 'uSh', 'uS', 'uCam', 'uL', 'uBox', 'uWall', 'uFloor', 'uShadow']) U[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(U.uAtlas, 0);
    gl.uniform2f(U.uAtlasSize, atlas.AW, atlas.AH);
    gl.uniform1i(U.uN, OBJS.length);
    gl.uniform3fv(U.uWall, WALL);
    gl.uniform3fv(U.uFloor, FLOOR);
    gl.uniform3fv(U.uShadow, SHADOW);
    gl.viewport(0, 0, W, H);
    const arr = {};
    for (const n of ['uM', 'uP', 'uK', 'uDent', 'uCol', 'uNb', 'uSh', 'uS']) arr[n] = new Float32Array(N * 4);

    const CAM_C = [540, 840];
    const scrim = over.createLinearGradient(0, SCRIM_Y, 0, H);
    scrim.addColorStop(0, 'rgba(70,38,88,0)'); scrim.addColorStop(0.4, 'rgba(70,38,88,0.2)'); scrim.addColorStop(1, 'rgba(58,30,76,0.52)');
    this.draw = (t) => {
      // ---- camera: slow push + a punch on the final inflate
      const cs = 1 + 0.03 * smooth(t / D) + 0.028 * wobble(t - TF - 0.02, 1.5, 4.2);
      const states = OBJS.map((o) => state(o, t));

      // ---- backdrop + ribbons
      resetCtx(back);
      const bs = 1 + (cs - 1) * 0.45;
      back.setTransform(bs, 0, 0, bs, CAM_C[0] * (1 - bs), CAM_C[1] * (1 - bs));
      back.drawImage(bg, 0, 0);
      back.setTransform(cs, 0, 0, cs, CAM_C[0] * (1 - cs), CAM_C[1] * (1 - cs));
      OBJS.forEach((o, i) => { if (o.letter) drawRibbon(back, o, t, states[i]); });

      // ---- the puffy shapes
      OBJS.forEach((o, i) => {
        const st = states[i], s = o.cell, k = i * 4;
        const c = Math.cos(st.rot), sn = Math.sin(st.rot);
        const isx = 1 / (st.sx * st.sc), isy = 1 / (st.sy * st.sc);
        arr.uM.set([c * isx, -sn * isy, sn * isx, c * isy], k);
        arr.uP.set([st.x, st.y, s.ox + s.w / 2, s.oy + s.h / 2], k);
        arr.uK.set([s.w / 2 - 3, s.h / 2 - 3, st.R, st.e], k);
        arr.uDent.set(o.poke ? [o.dentC[0], o.dentC[1], st.dentA, o.dentS] : [0, 0, 0, 10], k);
        arr.uCol.set([o.col[0], o.col[1], o.col[2], st.gloss], k);
        arr.uNb.set(o.nb ? [o.nbCol[0], o.nbCol[1], o.nbCol[2], o.nb[1]] : [0, 0, 0, 0], k);
        const m = 3 + st.z + 0.5 * st.R * st.sc * st.full;
        const pk = clamp(m / 150);
        arr.uSh.set([0.5 * m, 0.72 * m, pk, 0.36 * (1 - 0.35 * pk)], k);
        arr.uS.set([st.sc, st.vis, st.rim, st.push], k);
      });
      for (const n of ['uM', 'uP', 'uK', 'uDent', 'uCol', 'uNb', 'uSh', 'uS']) gl.uniform4fv(U[n], arr[n]);
      gl.uniform3f(U.uCam, cs, CAM_C[0], CAM_C[1]);
      const sw = ease.inOutCubic(clamp((t - SWEEP0) / (SWEEP1 - SWEEP0)));
      const lx = lerp(-0.48, -0.3, sw), ly = -0.62, lz = 0.62;
      const lm = Math.hypot(lx, ly, lz);
      gl.uniform3f(U.uL, lx / lm, ly / lm, lz / lm);
      gl.uniform4f(U.uBox, lerp(-0.62, -0.12, sw), lerp(-0.78, -0.7, sw), 0.24, 0.15);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // ---- overlay: finger, impact, glints, flash, copy
      resetCtx(over);
      over.setTransform(cs, 0, 0, cs, CAM_C[0] * (1 - cs), CAM_C[1] * (1 - cs));
      drawPoke(over, t, OBJS.find((o) => o.poke), states[OBJS.findIndex((o) => o.poke)], hand);
      drawGlints(over, t, this.glints, OBJS, states);
      over.setTransform(1, 0, 0, 1, 0, 0);
      if (t > TF) {
        const fl = 0.2 * Math.exp(-(t - TF) / 0.1) * smooth((t - TF) / 0.03);
        if (fl > 0.002) {
          const rg = over.createRadialGradient(540, 840, 0, 540, 840, 1100);
          rg.addColorStop(0, `rgba(255,255,255,${fl})`); rg.addColorStop(1, `rgba(255,240,250,${fl * 0.4})`);
          over.fillStyle = rg; over.fillRect(0, 0, W, H);
        }
      }
      // caption scrim: a plum wash under the harness caption so the white tech/title line reads on the pale floor
      over.fillStyle = scrim; over.fillRect(0, SCRIM_Y, W, H - SCRIM_Y);
      drawCopy(over, t);
    };
  },
  frame(t) { this.draw(t); },
});

// ------------------------------------------------------------------------------------------------ ribbons
function drawRibbon(g, o, t, st) {
  const t0 = o.breaths[0][0];
  const grow = ease.outCubic(clamp((t - t0 - 0.1) / 1.1));
  if (grow <= 0) return;
  const len = 440 * grow, n = 64;
  const vy = o.cell.inkH / 2 - 14;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const sl = state(o, t - 0.42 * u);                  // the ribbon trails the balloon: each point sees an older valve
    const [vx, vyw] = toWorld(sl, 0, vy);
    const amp = (6 + 20 * u) * grow;
    const ph = TAU * 3.4 * u + (o.id === 'A' ? 0.4 : 2.1) + 0.9 * Math.sin(t * 1.3 + u * 2);
    pts.push([vx + amp * Math.sin(ph) + 18 * u * u * Math.sin(t * 0.9 + (o.id === 'A' ? 0 : 2)), vyw + u * len, Math.cos(ph)]);
  }
  const path = (dx, dy) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x + dx, y + dy) : g.moveTo(x + dx, y + dy))); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = 'rgba(86,48,112,0.13)'; g.lineWidth = 6;
  path(16 + 0.25 * st.z, 24 + 0.35 * st.z); g.stroke();
  g.strokeStyle = css(o.col, 0.82); g.lineWidth = 6;
  path(0, 0); g.stroke();
  // the ribbon twists: a highlight where it faces the light
  g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2;
  for (let i = 0; i < n; i++) {
    if (pts[i][2] < 0.35) continue;
    g.beginPath(); g.moveTo(pts[i][0] - 1.5, pts[i][1]); g.lineTo(pts[i + 1][0] - 1.5, pts[i + 1][1]); g.stroke();
  }
  // knot at the valve
  const [kx, ky] = toWorld(st, 0, vy + 4);
  g.fillStyle = css(o.col, 0.78);
  g.beginPath(); g.ellipse(kx, ky + 6, 11, 8, 0, 0, TAU); g.fill();
}

// ------------------------------------------------------------------------------------------------ the poke
function drawPoke(g, t, o, st, hand) {
  if (t < FING_IN || t > RELEASE + 0.45) return;
  // the fingertip rides the outline: contact point pushed in by the notch while pressing
  const q = t < RELEASE ? Math.max(0, pokeQ(t)) : 0;
  const [px, py] = toWorld(st, o.edge[0] - NOTCH * q * 0.9, o.edge[1]);
  const ang = 16 * DEG;                                     // finger points left and a little up; the hand is off to the lower right
  const ax = Math.cos(ang), ay = Math.sin(ang);             // tip → base direction
  let dist;
  if (t < PRESS0) dist = 520 * (1 - ease.outExpo(clamp((t - FING_IN) / (PRESS0 - FING_IN))));
  else if (t < RELEASE) dist = 0;
  else dist = 560 * ease.inCubic(clamp((t - RELEASE) / 0.3));
  const tipX = px + ax * dist, tipY = py + ay * dist;
  const k = 0.8;
  const put = (img, ox, oy) => {
    g.save();
    g.translate(tipX + ox, tipY + oy);
    g.rotate(ang);
    g.scale(k, k);
    g.drawImage(img, -TIP_X, -TIP_Y);
    g.restore();
  };
  g.globalAlpha = 0.22;
  put(hand.shadow, 20, 30);
  g.globalAlpha = 1;
  put(hand.hand, 0, 0);

  // 콕! and three impact ticks
  const pp = clamp((t - PRESS0 - 0.03) / 0.3), pa = 1 - clamp((t - RELEASE - 0.2) / 0.25);
  if (pp > 0 && pa > 0) {
    const s = ease.outBack(pp, 2.2);
    g.save();
    g.translate(px - 10, py + 165);
    g.rotate(-8 * DEG);
    g.scale(s, s);
    g.globalAlpha = pa;
    g.font = `900 92px ${KR}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = ACCENT;
    g.strokeText('콕!', 0, 0);
    g.fillStyle = '#fff';
    g.fillText('콕!', 0, 0);
    g.restore();
    g.globalAlpha = pa * (1 - clamp((t - PRESS0 - 0.25) / 0.3));
    g.strokeStyle = '#fff'; g.lineWidth = 7; g.lineCap = 'round';
    for (const a of [-118, -84, -50]) {
      const c = Math.cos(a * DEG), sn = Math.sin(a * DEG), r0 = 58 + 26 * ease.outCubic(pp), r1 = r0 + 34 * (1 - 0.5 * pp);
      g.beginPath(); g.moveTo(px + c * r0, py + sn * r0); g.lineTo(px + c * r1, py + sn * r1); g.stroke();
    }
    g.globalAlpha = 1;
  }
}

function drawGlints(g, t, glints, objs, states) {
  objs.forEach((o, i) => {
    if (!o.letter) return;
    const st = states[i];
    glints.forEach(([gx, gy], j) => {
      const [x, y] = toWorld(st, gx, gy);
      // on the final inflate, and once more as the softbox passes
      const t1 = TF + 0.12 + 0.09 * j + (o.id === 'B' ? 0.07 : 0);
      const p1 = clamp((t - t1) / 0.7);
      const t2 = 8.25 + 0.35 * j + (o.id === 'B' ? 0.45 : 0);
      const p2 = clamp((t - t2) / 0.6);
      const s = 46 * Math.sin(Math.PI * p1) * (j ? 0.7 : 1) + 30 * Math.sin(Math.PI * p2) * (j ? 0.6 : 1);
      sparkle(g, x, y, s, p1 > 0 && p1 < 1 ? 0.95 : p2 > 0 && p2 < 1 ? 0.8 : 0);
    });
  });
}
