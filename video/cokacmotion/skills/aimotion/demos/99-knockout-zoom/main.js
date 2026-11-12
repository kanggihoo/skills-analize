/*
 * 99 · 여름으로 난 창 — knockout type as windows + a zoom-through the counter (10 s, 1080×1920, Canvas 2D only).
 *
 *   0–1.2   a shaded white wall; the outlines of 여 / 름 are scored, then each letter is punched out and falls away
 *           into the summer behind it — the letters are now windows onto a sea and sky that move on their own.
 *   1.2–4.6 poster hold: the camera drifts, the wall slides over the far sky (parallax), waves / clouds / a boat and a
 *           flock crossing behind the wall live inside the letters; "그 너머로, 풍덩" is printed below.
 *   4.6–6.9 the island inside 여's ㅇ (its counter) drops away; the camera dives through the ring — exponential scale,
 *           constant perceived speed — past the thick cut faces of the hole, out into the full scene.
 *   6.9–7.95 inside the scene: a short glide while the afternoon turns to sunset (time-lapse clouds).
 *   7.95–10 the camera pulls back out through another word on the same wall — 안녕 — whose ㅇ counter flies back
 *           into place with a thud; "다음 여름까지".
 *
 * One pinhole camera (distance Z to the wall plane, lateral position c) projects everything: the wall plane z = 0, the
 * back of the wall z = TH (the cut faces are the band between the front and back outline of each hole) and the scene
 * layers far behind it at depth D. Glyphs are Pretendard Black vector outlines (opentype.js) kept as exact Path2D
 * curves, so they are re-rasterised at the current scale every frame — never a scaled bitmap.
 * Determinism: every value is a closed-form function of t; randomness only from rand(seed) in setup.
 */
import { defineDemo, rand, clamp, lerp, ease } from '../_lib/stage.js';
import { FONTS, fontReady, loadOutlineFont, flattenPath } from '../_lib/type.js';

const W = 1080, H = 1920, CX = 540, CY = 960, DUR = 10, TAU = Math.PI * 2;
const HD = Math.hypot(CX, CY);          // half diagonal of the frame
const Z0 = 2000;                        // camera ↔ wall at rest: the wall plane maps 1:1 to the stage
const TH = 46;                          // wall thickness (the depth of every cut face)
const S = 740;                          // glyph size (Pretendard Black)
const TOPS = [205, 905];                // top edge of the two stacked glyphs
const HOR = 790;                        // horizon (infinitely far: it never moves on screen)
const HCAM = 1200;                      // camera height above the sea: a sea row at depth D sits at HOR + HCAM·Z0/(Z0+D)
const PF = `"${FONTS.pretendard.family}"`;

// ------------------------------------------------------------------ timing (seconds)
const T = {
  trace: [[0.10, 0.44], [0.34, 0.72]],  // the cut is scored around 여, then 름
  punch: [0.48, 0.76],                  // …and each letter is punched out
  kicker: 0.12, line: 1.25,             // small type printed on the wall
  pop: 4.6,                             // 여's ㅇ counter drops away
  dive0: 5.0, dive1: 6.9,               // exponential dive (λ = ln scale linear in the middle)
  turn: 7.42,                           // the glide inside the scene turns into the pull-back
  swap: 7.42,                           // the wall (out of frame) now reads 안녕
  pull0: 7.95, pull1: 9.02,             // exponential pull-back out through 안's ㅇ
  seat: 9.25,                           // 안's ㅇ counter flies back into place
  endLine: 9.25,
  dusk: [6.4, 7.95],                    // noon → sunset (only while we are inside the scene)
};
const WORDS = [
  { text: '여름', kicker: '오후 2:00', line: [['그 너머로, ', 0], ['풍덩', 1]] },
  { text: '안녕', kicker: '오후 7:40', line: [['다음 ', 0], ['여름', 1], ['까지', 0]] },
];

// ------------------------------------------------------------------ palette (noon → lavender → dusk); one accent: coral
// three stops so the sky and sea stay saturated through the change (a straight blue → coral blend goes grey-green
// midway); the middle stop routes it through lavender, the way a real sky turns
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const P = (a, b, g) => { const A = hex(a), B = hex(b); return [A, g ? hex(g) : A.map((v, i) => (v + B[i]) / 2), B]; };
const PAL = {
  wallHi: P('#f7f3ec', '#f6dcc6'), wallLo: P('#e4ddd2', '#d2b2a6'),
  ink: P('#25282e', '#2d2430'), inkSoft: P('#6c6a66', '#76615f'), accent: P('#ff5b3a', '#ff5b3a'),
  faceLit: P('#fffaf0', '#ffc690'), faceDark: P('#a3a8b4', '#7d6577'), bloom: P('#fffef6', '#ffd29c'),
  skyTop: P('#3a8fe0', '#2e3483', '#3d6cc8'), skyMid: P('#86cbf2', '#ec6f6c', '#dcb6dc'), skyHor: P('#e2f5fb', '#ffcf86', '#fdeee6'),
  sun: P('#fff7dc', '#fff0c2', '#fff6d0'), sunGlow: P('#fff0b8', '#ffa45c', '#ffd47a'),
  cloud: P('#ffffff', '#ffc09a', '#fff1ee'), cloudSh: P('#d3e9f6', '#d0708a', '#e2c0d8'),
  seaFar: P('#7cc3e4', '#f39c7e', '#bdb2de'), seaNear: P('#2c7fbe', '#4b3f86', '#2f5c9e'),
  foam: P('#e9f8ff', '#ffe2a8', '#fff3f2'), island: P('#4f8f86', '#4a3160', '#4a6078'), gull: P('#2b3a4a', '#2c2238'),
  hull: P('#ff5b3a', '#ff5b3a'), sail: P('#ffffff', '#ffe6d2'),
};
const BAND_NOON = ['#5fb4de', '#4ea6d7', '#3e96cd', '#3087c3', '#2477b5', '#1b67a6', '#145894'];
const BAND_GOLD = ['#b2b0de', '#9ea6d8', '#7f95cf', '#6584c4', '#4f73b6', '#3f62a6', '#335294'];
const BAND_DUSK = ['#e08c86', '#c47584', '#a46484', '#835783', '#664b7e', '#503f76', '#3e346a'];
const mixA = (c, k) => {
  const [a, b, u] = k < 0.5 ? [c[0], c[1], k * 2] : [c[1], c[2], k * 2 - 1];
  return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
};
const rgb = (a, al = 1) => `rgba(${a[0] | 0},${a[1] | 0},${a[2] | 0},${al})`;
const col = (name, k, al = 1) => rgb(mixA(PAL[name], k), al);

// ------------------------------------------------------------------ small maths
const seg = (t, a, b) => clamp((t - a) / (b - a));
const sm = (t, a, b) => { const v = seg(t, a, b); return v * v * (3 - 2 * v); };
const fract = (x) => x - Math.floor(x);
const outExpo = ease.outExpo, inOut = ease.inOutCubic;
/** progress 0..1 with constant-acceleration ramps (fractions a at the start, d at the end) and a linear middle */
function trap(p, a, d) {
  p = clamp(p);
  const v = 1 / (1 - a / 2 - d / 2);
  if (p < a) return (0.5 * v * p * p) / a;
  if (p > 1 - d) { const q = 1 - p; return 1 - (0.5 * v * q * q) / d; }
  return v * (p - a / 2);
}
const trapV = (a, d) => 1 / (1 - a / 2 - d / 2);   // speed of the linear middle (progress per unit p)
function hermite(t, t0, t1, p0, p1, v0, v1) {
  const dt = t1 - t0, s = clamp((t - t0) / dt), s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * v0 * dt + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * v1 * dt;
}

// ------------------------------------------------------------------ state built in setup
let ctx, GRAIN, GRAIN_SCREEN;
const WD = [];          // per word: { glyphs, o, rIn, Zc, Lam }
const DUST = [];        // dust puffs: { t0, parts: Float32Array [x, y, vx, vy, r, life] }
let LINE_LAYOUT = [];   // per word: [{ ch, x, accent }] and kicker width
let CLOUDS = [], FARCLOUDS = [], GULLS = [], STARS = [];
let LAM1 = 2, LAM2 = 2, ZC1 = 200, ZC2 = 200, V1 = 0, V2 = 0;
const ZMIN = -240;      // deepest point of the glide inside the scene (past the wall plane)

// ------------------------------------------------------------------ glyphs: exact curves (Path2D) + flattened contours
function contourPath(cmds) {
  const p = new Path2D();
  for (const c of cmds) {
    if (c.type === 'M') p.moveTo(c.x, c.y);
    else if (c.type === 'L') p.lineTo(c.x, c.y);
    else if (c.type === 'Q') p.quadraticCurveTo(c.x1, c.y1, c.x, c.y);
    else if (c.type === 'C') p.bezierCurveTo(c.x1, c.y1, c.x2, c.y2, c.x, c.y);
    else if (c.type === 'Z') p.closePath();
  }
  return p;
}
function buildWord(font, text, probe) {
  const glyphs = [];
  Array.from(text).forEach((ch, gi) => {
    const g = font.charToGlyph(ch);
    const bb = g.getPath(0, 0, S).getBoundingBox();
    const x = CX - (bb.x1 + bb.x2) / 2, y = TOPS[gi] - bb.y1;
    const cmds = g.getPath(x, y, S).commands;
    // split into contours, each with its exact path and a fine polyline
    const contours = [];
    let cur = [];
    for (const c of cmds) {
      if (c.type === 'M' && cur.length) { contours.push(cur); cur = []; }
      cur.push(c);
      if (c.type === 'Z') { contours.push(cur); cur = []; }
    }
    if (cur.length) contours.push(cur);
    const cs = [];
    for (const cc of contours) {
      const fl = flattenPath(cc, 0.06)[0];
      if (!fl) continue;
      cs.push({ cmds: cc, path: contourPath(cc), pts: fl.pts, area: fl.area, hole: fl.area > 0 });
    }
    const closed = new Path2D();
    for (const c of cs) closed.addPath(c.path);
    glyphs.push({ ch, contours: cs, closed, bbox: { x0: x + bb.x1, y0: y + bb.y1, x1: x + bb.x2, y1: y + bb.y2 } });
  });
  // normals pointing into the window (the letter region): (dy, −dx) for this font's winding — verified per contour
  for (const g of glyphs) {
    for (const c of g.contours) {
      const p = c.pts, n = p.length / 2;
      const nrm = new Float32Array(n * 2);
      let agree = 0, total = 0;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, dx = p[j * 2] - p[i * 2], dy = p[j * 2 + 1] - p[i * 2 + 1], L = Math.hypot(dx, dy) || 1;
        nrm[i * 2] = dy / L; nrm[i * 2 + 1] = -dx / L;
        if (L > 1.5 && total < 400) {
          const mx = (p[i * 2] + p[j * 2]) / 2, my = (p[i * 2 + 1] + p[j * 2 + 1]) / 2;
          total++;
          if (probe.isPointInPath(g.closed, mx + nrm[i * 2] * 1.2, my + nrm[i * 2 + 1] * 1.2, 'nonzero')) agree++;
        }
      }
      if (agree < total / 2) for (let i = 0; i < nrm.length; i++) nrm[i] = -nrm[i];
      c.nrm = nrm;
    }
  }
  // the dive target: the biggest counter of the first glyph (the ㅇ), its centre and the ring's inscribed radius
  const g0 = glyphs[0];
  let counter = null;
  for (const c of g0.contours) if (c.hole && (!counter || c.area > counter.area)) counter = c;
  counter.isCounter = true;
  let ax = 0, ay = 0, A = 0;
  { const p = counter.pts, n = p.length / 2;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n, cr = p[i * 2] * p[j * 2 + 1] - p[j * 2] * p[i * 2 + 1]; A += cr; ax += (p[i * 2] + p[j * 2]) * cr; ay += (p[i * 2 + 1] + p[j * 2 + 1]) * cr; } }
  const o = { x: ax / (3 * A), y: ay / (3 * A) };
  let ring = null;
  for (const c of g0.contours) {
    if (c.hole) continue;
    if (!probe.isPointInPath(c.path, o.x, o.y, 'nonzero')) continue;
    if (!ring || Math.abs(c.area) < Math.abs(ring.area)) ring = c;
  }
  let rIn = 1e9;
  { const p = ring.pts, n = p.length / 2;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, x0 = p[i * 2] - o.x, y0 = p[i * 2 + 1] - o.y, dx = p[j * 2] - p[i * 2], dy = p[j * 2 + 1] - p[i * 2 + 1];
      const u = clamp(-(x0 * dx + y0 * dy) / (dx * dx + dy * dy || 1));
      rIn = Math.min(rIn, Math.hypot(x0 + u * dx, y0 + u * dy));
    } }
  rIn *= 0.985;
  const open = new Path2D();
  for (const c of g0.contours) if (c !== counter) open.addPath(c.path);
  g0.open = open;
  g0.counter = counter;
  const Zc = (Z0 * rIn) / (HD * 1.02) - TH;      // camera distance at which the back opening covers the frame
  return { glyphs, o, rIn, Zc, Lam: Math.log(Z0 / Zc), counter };
}

// ------------------------------------------------------------------ camera
const hand = (t) => [2.2 * Math.sin(0.83 * t + 0.4) + 1.1 * Math.sin(2.1 * t + 1.3), 1.7 * Math.sin(0.67 * t + 2.1) + 0.9 * Math.sin(1.7 * t + 0.2)];
const KICKS = [[T.punch[0], 9], [T.punch[1], 7], [T.pop, 5], [T.seat, 8]];
function shake(t) {
  let x = 0, y = 0;
  for (const [t0, A] of KICKS) {
    if (t < t0) continue;
    const u = t - t0, k = A * Math.exp(-7.5 * u);
    x += k * Math.sin(53 * u); y += k * Math.sin(47 * u + 1.3) * 0.8;
  }
  return [x, y];
}
// slow lateral drift during the poster hold (the wall slides over the far sky)
const drift = (t) => { const k = inOut(seg(t, 0.4, T.dive0)); return [lerp(50, -42, k), lerp(18, -14, k)]; };
const driftEnd = (t) => { const k = sm(t, T.pull1 - 0.3, DUR); return [lerp(-6, 10, k), lerp(-4, 4, k)]; };

/** camera at t: { Z, cx, cy, word } — Z distance to the wall plane, (cx, cy) the wall point on the optical axis */
function camera(t) {
  const C = [CX, CY];
  const o1 = WD[0].o, o2 = WD[1].o;
  const word = t < T.swap ? 0 : 1;
  const place = (o, Ps, Z) => ({ Z, cx: o.x - ((Ps[0] - CX) * Z) / Z0, cy: o.y - ((Ps[1] - CY) * Z) / Z0, word });
  const h = hand(t), sk = shake(t);
  if (t <= T.dive0) {
    const lam = 0.075 * sm(t, 0.9, T.pop) - 0.045 * sm(t, T.pop, T.dive0);
    const d = drift(t);
    return place(o1, [o1.x + d[0] + h[0] + sk[0], o1.y + d[1] + h[1] + sk[1]], Z0 * Math.exp(-lam));
  }
  if (t <= T.dive1) {
    const p = seg(t, T.dive0, T.dive1), lam0 = 0.03;
    const lam = lam0 + (LAM1 - lam0) * trap(p, 0.32, 0);
    const e = inOut(seg(t, T.dive0, T.dive1 - 0.08)), d = drift(T.dive0);
    const Ps = [lerp(o1.x + d[0] + h[0], CX, e) + sk[0] * (1 - e), lerp(o1.y + d[1] + h[1], CY, e) + sk[1] * (1 - e)];
    return place(o1, Ps, Z0 * Math.exp(-lam));
  }
  if (t <= T.pull0) {
    // inside the scene: the wall is out of frame; the camera glides on and turns back (velocities matched at both ends)
    const Z = t <= T.turn ? hermite(t, T.dive1, T.turn, ZC1, ZMIN, V1, 0) : hermite(t, T.turn, T.pull0, ZMIN, ZC2, 0, V2);
    const k = sm(t, T.dive1, T.pull0);
    return { Z, cx: lerp(o1.x, o2.x, k), cy: lerp(o1.y, o2.y, k), word };
  }
  const d = driftEnd(t);
  if (t <= T.pull1) {
    const p = seg(t, T.pull0, T.pull1);
    const lam = LAM2 * (1 - trap(p, 0, 0.42));
    const e = inOut(seg(t, T.pull0 + 0.05, T.pull1));
    return place(o2, [lerp(CX, o2.x + d[0] + h[0], e), lerp(CY, o2.y + d[1] + h[1], e)], Z0 * Math.exp(-lam));
  }
  const lam = 0.012 * sm(t, T.pull1, DUR);
  return place(o2, [o2.x + d[0] + h[0] + sk[0], o2.y + d[1] + h[1] + sk[1]], Z0 * Math.exp(-lam));
}

// ------------------------------------------------------------------ plugs: the cut-out pieces of wall
/** a punched piece: pushed back and falling (tau seconds after the push) */
const plugMotion = (tau) => ({ z: 14 * tau + 1150 * tau * tau, dy: 1500 * tau * tau, alpha: 1 - sm(tau, 0.3, 0.56) });

/** which glyphs are windows at t, how deep their faces are and which pieces are in flight */
function windowState(t, word) {
  const out = [];
  WD[word].glyphs.forEach((g, gi) => {
    let open = true, depth = TH, plug = null, counterOpen = false, counterPlug = null;
    if (word === 0) {
      const tp = T.punch[gi];
      if (t < tp) open = false;
      else {
        const m = plugMotion(t - tp);
        depth = Math.min(TH, m.z);
        if (t - tp < 0.9) plug = { path: g.closed, ...m };
      }
      if (gi === 0 && t >= T.pop) {
        counterOpen = true;
        const m = plugMotion(t - T.pop);
        if (t - T.pop < 1.0) counterPlug = m;
      }
    } else if (gi === 0) {
      if (t < T.seat) {
        counterOpen = true;
        const tau = T.seat - t;
        if (tau < 0.62) counterPlug = plugMotion(tau);
      }
    }
    out.push({ g, open, depth, plug, counterOpen, counterPlug });
  });
  return out;
}

// ------------------------------------------------------------------ the scene behind the wall (authored in rest-view coordinates)
/** set the transform of a scene layer at depth D; returns the visible rest-view x range */
function layer(cam, D) {
  if (!isFinite(D)) { ctx.setTransform(1, 0, 0, 1, 0, 0); return { m: 1, x0: 0, x1: W }; }
  const m = (Z0 + D) / (cam.Z + D), g = Z0 / (cam.Z + D);
  const ex = CX - CX * m + (CX - cam.cx) * g, ey = CY - CY * m + (CY - cam.cy) * g;
  ctx.setTransform(m, 0, 0, m, ex, ey);
  return { m, x0: (-ex) / m, x1: (W - ex) / m, ex, ey };
}
const rowY = (D) => HOR + (HCAM * Z0) / (Z0 + D);
const BANDS = [24000, 12000, 6000, 3000, 1600, 820, 400].map((D, i) => ({
  D, i, y: rowY(D), amp: (26 * Z0) / (Z0 + D), wl: (700 * Z0) / (Z0 + D), ph: i * 1.7,
}));

function cloudShape(c) {
  // a flat-bottomed cumulus: a row of overlapping circles on a pill
  const p = new Path2D();
  for (const [dx, dy, r] of c.puffs) { p.moveTo(c.x + dx + r, c.y + dy); p.arc(c.x + dx, c.y + dy, r, 0, TAU); }
  p.roundRect(c.x - c.w / 2, c.y - c.h, c.w, c.h, c.h / 2);
  return p;
}

function drawScene(t, cam, dk) {
  // time-lapse: clouds and boats run faster while the afternoon turns into sunset
  const tl = t + 5.5 * sm(t, T.dusk[0], T.dusk[1]);
  // sky
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const sky = ctx.createLinearGradient(0, -200, 0, HOR);
  sky.addColorStop(0, col('skyTop', dk)); sky.addColorStop(0.62, col('skyMid', dk)); sky.addColorStop(1, col('skyHor', dk));
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, HOR + 1);
  // sun: high on the right at noon, low and big over the sea at sunset
  const se = inOut(dk);
  const sx = lerp(800, 716, se), sy = lerp(292, 652, se), sr = lerp(62, 92, se);
  {
    const gr = ctx.createRadialGradient(sx, sy, sr * 0.6, sx, sy, sr * (5.2 + 1.6 * dk));
    gr.addColorStop(0, col('sunGlow', dk, 0.75)); gr.addColorStop(0.35, col('sunGlow', dk, 0.22)); gr.addColorStop(1, col('sunGlow', dk, 0));
    ctx.globalCompositeOperation = 'screen';      // a warm glow that brightens the blue instead of greying it
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, HOR + 1);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = col('sun', dk);
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, TAU); ctx.fill();
    ctx.fillStyle = col('sun', dk, 0.28);
    ctx.beginPath(); ctx.arc(sx, sy, sr * 1.22, 0, TAU); ctx.fill();
  }
  // far clouds: long flat strips just above the horizon
  {
    const L = layer(cam, 30000);
    for (const c of FARCLOUDS) {
      const x = c.x + ((c.v * tl) % 1600) - 200;
      const xx = ((x % 1600) + 1600) % 1600 - 260;
      if (xx + c.w < L.x0 - 50 || xx - c.w > L.x1 + 50) continue;
      ctx.fillStyle = col('cloud', dk, 0.72);
      ctx.beginPath(); ctx.roundRect(xx - c.w / 2, c.y - c.h / 2, c.w, c.h, c.h / 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(xx - c.w * 0.2, c.y - c.h * 1.2, c.w * 0.45, c.h * 1.1, c.h * 0.55); ctx.fill();
    }
  }
  // puffy clouds, two depths
  for (const grp of CLOUDS) {
    layer(cam, grp.D);
    for (const c of grp.items) {
      const x = c.x0 + c.v * tl;
      const cc = { ...c, x };
      ctx.fillStyle = col('cloudSh', dk);
      ctx.fill(cloudShape(cc));
      ctx.fillStyle = col('cloud', dk);
      ctx.fill(cloudShape({ ...cc, y: c.y - c.h * 0.22, puffs: c.puffs.map(([dx, dy, r]) => [dx - r * 0.06, dy - r * 0.04, r * 0.9]), w: c.w * 0.94 }));
    }
  }
  // sea: far-to-near gradient under every band; it meets the sky at the horizon, which is infinitely far and never moves
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  {
    const sea = ctx.createLinearGradient(0, HOR, 0, HOR + 400);
    sea.addColorStop(0, col('seaFar', dk)); sea.addColorStop(1, col('seaNear', dk));
    ctx.fillStyle = sea; ctx.fillRect(0, HOR, W, H - HOR);
  }
  // waves, far to near; an island and a boat sit between them at their depths
  const bandCols = BAND_NOON.map((n, i) => mixA([hex(n), hex(BAND_GOLD[i]), hex(BAND_DUSK[i])], dk));
  const foam = mixA(PAL.foam, dk);
  for (const b of BANDS) {
    const L = layer(cam, b.D);
    const step = Math.max(1.5, 9 / L.m), x0 = L.x0 - 20, x1 = L.x1 + 20;
    const k1 = TAU / b.wl, k2 = TAU / (b.wl * 0.47), w = 0.95;
    const yb = b.y + b.amp * 0.35 * Math.sin(1.3 * t + b.i);
    const yAt = (x) => yb + b.amp * (0.62 * Math.sin(k1 * x + b.ph + w * t) + 0.38 * Math.sin(k2 * x + b.ph * 2.3 - 1.4 * w * t));
    const path = new Path2D();
    path.moveTo(x0, yAt(x0));
    for (let x = x0 + step; x < x1 + step; x += step) path.lineTo(x, yAt(x));
    path.lineTo(x1 + step, b.y + 6000); path.lineTo(x0, b.y + 6000);
    // each band lighter at its crest row, deeper towards the next (nearer) row
    const yNext = b.i + 1 < BANDS.length ? BANDS[b.i + 1].y : b.y + 260, bc = bandCols[b.i];
    const bg = ctx.createLinearGradient(0, b.y - b.amp, 0, yNext + b.amp);
    bg.addColorStop(0, rgb(bc.map((v) => v + (255 - v) * 0.1)));
    bg.addColorStop(1, rgb(bc.map((v) => v * 0.9)));
    ctx.fillStyle = bg;
    ctx.fill(path);
    // crest highlight along the edge
    ctx.strokeStyle = rgb(foam, 0.55);
    ctx.lineWidth = Math.max(1.2 / L.m, b.amp * 0.16);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, yAt(x0));
    for (let x = x0 + step; x < x1 + step; x += step) ctx.lineTo(x, yAt(x));
    ctx.stroke();
    // little foam curls riding the band
    const sp = b.wl * 0.5, drift = (t * 0.11 * b.wl) % sp;
    ctx.strokeStyle = rgb(foam, 0.75);
    ctx.lineWidth = Math.max(1.2 / L.m, b.amp * 0.2);
    ctx.beginPath();
    for (let k = Math.floor((x0 - drift) / sp) - 1; k <= Math.ceil((x1 - drift) / sp) + 1; k++) {
      const hsh = fract(Math.sin(k * 127.1 + b.i * 311.7) * 43758.5453), h2 = fract(hsh * 91.7);
      const cx = k * sp + drift + hsh * sp * 0.6, cy = yAt(cx) + b.amp * (1.5 + h2 * 5.5), ww = b.wl * (0.08 + 0.1 * h2);
      ctx.moveTo(cx - ww, cy);
      ctx.quadraticCurveTo(cx, cy + b.amp * 0.9, cx + ww, cy - b.amp * 0.2);
    }
    ctx.stroke();
    // twinkles on the water (sun glitter: denser under the sun)
    for (const s of STARS[b.i]) {
      const x = s.x, y = yAt(x) + s.dy * b.amp;
      if (x < x0 || x > x1) continue;
      const near = Math.exp(-(((x - (sx - L.ex) / L.m) / (220 + 160 * dk)) ** 2)) * (0.5 + dk);
      const tw = Math.max(0, Math.sin(t * s.w + s.ph)) ** 3 * (0.25 + near);
      if (tw < 0.04) continue;
      const r = Math.min(b.amp, 8) * (0.5 + s.r) * (0.6 + 0.6 * tw);
      ctx.fillStyle = rgb(foam, Math.min(1, tw));
      ctx.beginPath();
      ctx.moveTo(x - r * 2.2, y); ctx.lineTo(x, y - r * 0.5); ctx.lineTo(x + r * 2.2, y); ctx.lineTo(x, y + r * 0.5);
      ctx.fill();
    }
    if (b.D === 24000) drawIsland(cam, dk);
    if (b.D === 12000) drawBoat(cam, t, tl, dk);
  }
  drawGulls(cam, t, tl, dk);
}

function drawIsland(cam, dk) {
  layer(cam, 20000);
  const y = rowY(20000), x = 880;
  ctx.fillStyle = col('island', dk);
  ctx.beginPath();
  ctx.moveTo(x - 150, y + 4);
  ctx.bezierCurveTo(x - 110, y - 30, x - 70, y - 62, x - 20, y - 64);
  ctx.bezierCurveTo(x + 30, y - 66, x + 50, y - 40, x + 80, y - 34);
  ctx.bezierCurveTo(x + 110, y - 28, x + 140, y - 10, x + 170, y + 4);
  ctx.fill();
  ctx.fillStyle = rgb(mixA(PAL.island, dk).map((v) => v * 0.82));
  ctx.beginPath();
  ctx.moveTo(x - 60, y + 4);
  ctx.bezierCurveTo(x - 30, y - 22, x + 10, y - 30, x + 40, y - 20);
  ctx.bezierCurveTo(x + 70, y - 10, x + 90, y - 4, x + 110, y + 4);
  ctx.fill();
}

function drawBoat(cam, t, tl, dk) {
  const D = 10000;
  const L = layer(cam, D);
  const y = rowY(D) - 2, x = 360 + 14 * tl;
  if (x < L.x0 - 80 || x > L.x1 + 80) return;
  ctx.save();
  ctx.translate(x, y + 1.5 * Math.sin(2.1 * t));
  ctx.rotate(0.05 * Math.sin(1.7 * t + 0.6));
  ctx.fillStyle = col('sail', dk);
  ctx.beginPath(); ctx.moveTo(2, -10); ctx.lineTo(2, -74); ctx.lineTo(34, -12); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-3, -12); ctx.lineTo(-3, -60); ctx.lineTo(-26, -12); ctx.fill();
  ctx.fillStyle = col('hull', dk);
  ctx.beginPath(); ctx.moveTo(-36, -9); ctx.lineTo(40, -9); ctx.quadraticCurveTo(34, 6, 22, 6); ctx.lineTo(-24, 6); ctx.quadraticCurveTo(-32, 4, -36, -9); ctx.fill();
  ctx.restore();
}

function drawGulls(cam, t, tl, dk) {
  ctx.strokeStyle = col('gull', dk);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const gl of GULLS) {
    const L = layer(cam, gl.D);
    const x = gl.x0 + gl.v * (gl.rt ? t : tl), y = gl.y + 10 * Math.sin(0.9 * t + gl.ph);
    if (gl.win && (t < gl.win[0] || t > gl.win[1])) continue;
    if (x < L.x0 - 60 || x > L.x1 + 60) continue;
    const f = Math.sin(t * gl.f + gl.ph), s = gl.s;
    ctx.lineWidth = s * 0.16;
    ctx.beginPath();
    ctx.moveTo(x - s, y - f * s * 0.45);
    ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.35 - f * s * 0.2, x, y);
    ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.35 - f * s * 0.2, x + s, y - f * s * 0.45);
    ctx.stroke();
  }
}

// ------------------------------------------------------------------ the wall
function wallXform(cam) { const s = Z0 / cam.Z; return { s, ex: CX - cam.cx * s, ey: CY - cam.cy * s }; }

function drawWall(t, cam, dk, ws) {
  const { s, ex, ey } = wallXform(cam);
  ctx.setTransform(s, 0, 0, s, ex, ey);
  const x0 = -ex / s, y0 = -ey / s, x1 = (W - ex) / s, y1 = (H - ey) / s;
  // shaded plaster (the sun is behind the wall): brighter towards the top
  const g = ctx.createLinearGradient(0, -100, 300, 2100);
  g.addColorStop(0, col('wallHi', dk)); g.addColorStop(1, col('wallLo', dk));
  ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  // plaster grain, anchored on the wall, two octaves cross-faded so it stays fine at any scale
  {
    const q = Math.log2(s), i = Math.floor(q), f = q - i;
    for (const [k, a] of [[0, 1 - f], [1, f]]) {
      if (a < 0.01) continue;
      const tex = 1.7 / 2 ** (i + k);
      GRAIN.setTransform(new DOMMatrix([tex, 0, 0, tex, 0, 0]));
      ctx.globalAlpha = a;
      ctx.fillStyle = GRAIN;
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    ctx.globalAlpha = 1;
  }
  // light bloom from the bright windows onto the wall
  const union = new Path2D();
  for (const w of ws) if (w.open) union.addPath(w.counterOpen ? w.g.open : w.g.closed);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = col('bloom', dk, 0.07 + 0.03 * dk);
  for (const lw of [54, 30, 14]) { ctx.lineWidth = lw; ctx.stroke(union); }
  ctx.lineJoin = 'miter';
  // the cut being scored before each punch
  if (cam.word === 0) {
    ctx.strokeStyle = col('ink', dk, 0.5);
    ctx.lineWidth = 2.4 / Math.max(1, s * 0.8);
    ctx.lineCap = 'round';
    WD[0].glyphs.forEach((gl, gi) => {
      const [a, b] = T.trace[gi];
      if (t < a || t >= T.punch[gi]) return;
      const p = ease.outCubic(seg(t, a, b));
      for (const c of gl.contours) strokePartial(c.pts, p);
    });
  }
  // small type printed on the wall
  drawWallType(t, cam, dk);
  return union;
}

function strokePartial(pts, p) {
  const n = pts.length / 2;
  let total = 0;
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; total += Math.hypot(pts[j * 2] - pts[i * 2], pts[j * 2 + 1] - pts[i * 2 + 1]); }
  let left = total * p;
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 0; i < n && left > 0; i++) {
    const j = (i + 1) % n, L = Math.hypot(pts[j * 2] - pts[i * 2], pts[j * 2 + 1] - pts[i * 2 + 1]);
    if (L <= left) { ctx.lineTo(pts[j * 2], pts[j * 2 + 1]); left -= L; }
    else { const u = left / L; ctx.lineTo(lerp(pts[i * 2], pts[j * 2], u), lerp(pts[i * 2 + 1], pts[j * 2 + 1], u)); left = 0; }
  }
  ctx.stroke();
}

function drawWallType(t, cam, dk) {
  const wi = cam.word, lay = LINE_LAYOUT[wi];
  // kicker (time of day) — fades in at the start; already printed when we come back out
  const kA = wi === 0 ? outExpo(seg(t, T.kicker, T.kicker + 0.7)) : 1;
  if (kA > 0.001) {
    ctx.globalAlpha = kA;
    ctx.font = `700 34px ${PF}`;
    ctx.letterSpacing = '6px';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = col('inkSoft', dk);
    ctx.fillText(WORDS[wi].kicker, CX + 3, 158 + 14 * (1 - kA));
    // two short rules either side
    ctx.fillStyle = col('accent', dk);
    const hw = lay.kw / 2 + 26;
    ctx.fillRect(CX - hw - 44 * kA, 146, 44 * kA, 3);
    ctx.fillRect(CX + hw, 146, 44 * kA, 3);
    ctx.letterSpacing = '0px';
    ctx.globalAlpha = 1;
  }
  // the line under the word: syllables rise in a stagger (expo.out)
  const t0 = wi === 0 ? T.line : T.endLine;
  ctx.font = `800 54px ${PF}`;
  ctx.textAlign = 'left';
  lay.chars.forEach((c, i) => {
    const p = outExpo(seg(t, t0 + i * 0.05, t0 + i * 0.05 + 0.65));
    if (p <= 0.001) return;
    ctx.globalAlpha = Math.min(1, p * 1.6);
    ctx.fillStyle = c.accent ? col('accent', dk) : col('ink', dk);
    // "풍덩" hops on the beat the counter drops away
    let hop = 0;
    if (wi === 0 && c.accent) { const u = seg(t, T.pop + 0.04 * i - 0.2, T.pop + 0.04 * i + 0.16); hop = -24 * Math.sin(Math.PI * u) * (u < 1 ? 1 : 0); }
    ctx.fillText(c.ch, c.x, 1634 + 34 * (1 - p) + hop);
  });
  ctx.globalAlpha = 1;
}

// cut faces: the band between the front outline (z = 0) and the back outline (z = depth) of every window
const NB = 40;
let BUCKETS = [];
function drawFaces(cam, ws, dk, sunDir) {
  for (let k = 0; k < NB; k++) BUCKETS[k] = new Path2D();
  const s = Z0 / cam.Z, cx = cam.cx, cy = cam.cy;
  const ef = 1.6, eb = 1.6, et = 0.8;
  for (const w of ws) {
    if (!w.open || w.depth < 0.3) continue;
    const sb = Z0 / (cam.Z + w.depth);
    for (const c of w.g.contours) {
      if (c.isCounter && w.counterOpen) continue;
      const p = c.pts, nr = c.nrm, n = p.length / 2;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, nx = nr[i * 2], ny = nr[i * 2 + 1];
        const mx = (p[i * 2] + p[j * 2]) / 2 - cx, my = (p[i * 2 + 1] + p[j * 2 + 1]) / 2 - cy;
        if (mx * nx + my * ny >= 0) continue;            // back-facing: hidden behind the front edge
        const ax = p[i * 2] - cx, ay = p[i * 2 + 1] - cy, bx = p[j * 2] - cx, by = p[j * 2 + 1] - cy;
        // grown a little outwards, inwards and along the edge so neighbouring quads overlap (no anti-aliased seams)
        const tx = -ny * et, ty = nx * et;
        const f0x = CX + ax * s - nx * ef - tx, f0y = CY + ay * s - ny * ef - ty, f1x = CX + bx * s - nx * ef + tx, f1y = CY + by * s - ny * ef + ty;
        const b0x = CX + ax * sb + nx * eb - tx, b0y = CY + ay * sb + ny * eb - ty, b1x = CX + bx * sb + nx * eb + tx, b1y = CY + by * sb + ny * eb + ty;
        const lit = nx * sunDir[0] + ny * sunDir[1];
        const k = Math.max(0, Math.min(NB - 1, Math.round(((lit + 1) / 2) * (NB - 1))));
        const q = BUCKETS[k];
        // keep one winding for every quad so the nonzero union never cancels
        const area = (f1x - f0x) * (b1y - f0y) - (f1y - f0y) * (b1x - f0x);
        if (area >= 0) { q.moveTo(f0x, f0y); q.lineTo(f1x, f1y); q.lineTo(b1x, b1y); q.lineTo(b0x, b0y); }
        else { q.moveTo(f0x, f0y); q.lineTo(b0x, b0y); q.lineTo(b1x, b1y); q.lineTo(f1x, f1y); }
      }
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const lit = mixA(PAL.faceLit, dk), dark = mixA(PAL.faceDark, dk);
  for (let k = 0; k < NB; k++) {
    const u = k / (NB - 1), e = u * u * (3 - 2 * u);
    ctx.fillStyle = rgb([lerp(dark[0], lit[0], e), lerp(dark[1], lit[1], e), lerp(dark[2], lit[2], e)]);
    ctx.fill(BUCKETS[k]);
  }
}

/** a wall piece in flight: back face (darker) then front face, at depth z, dropped by dy */
function drawPlug(cam, path, m, dk, shade) {
  if (m.alpha <= 0.002) return;
  ctx.globalAlpha = m.alpha;
  const lo = mixA(PAL.wallHi, dk).map((v, i) => (v + mixA(PAL.wallLo, dk)[i]) / 2), fd = mixA(PAL.faceDark, dk);
  const draw = (z, c) => {
    const s = Z0 / (cam.Z + z);
    ctx.setTransform(s, 0, 0, s, CX - cam.cx * s, CY - (cam.cy - m.dy) * s);
    ctx.fillStyle = c;
    ctx.fill(path);
  };
  draw(m.z + TH, rgb(fd.map((v) => v * (0.82 - 0.12 * shade))));
  draw(m.z + TH * 0.5, rgb(fd.map((v) => v * (0.92 - 0.12 * shade))));
  draw(m.z, rgb(lo.map((v) => v * (1 - 0.3 * shade))));
  ctx.globalAlpha = 1;
}

function drawDust(t, cam, dk) {
  const { s, ex, ey } = wallXform(cam);
  ctx.setTransform(s, 0, 0, s, ex, ey);
  const c = mixA(PAL.wallHi, dk);
  for (const d of DUST) {
    if (d.word !== cam.word) continue;
    const u = t - d.t0;
    if (u < 0 || u > 1.1) continue;
    const a = d.parts;
    for (let i = 0; i < a.length; i += 6) {
      const life = a[i + 5];
      if (u > life) continue;
      const k = 1 - u / life;
      const x = a[i] + a[i + 2] * u, y = a[i + 1] + a[i + 3] * u + 520 * u * u;
      ctx.fillStyle = rgb(c.map((v) => v * 0.97), 0.9 * k);
      ctx.beginPath(); ctx.arc(x, y, a[i + 4] * (0.6 + 0.4 * k), 0, TAU); ctx.fill();
    }
  }
}

function resetCtx() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  ctx.setLineDash([]);
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.lineWidth = 1;
  ctx.letterSpacing = '0px';
  ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
}

// ------------------------------------------------------------------ setup helpers
function makeGrain(size, seed, alpha, cpu) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d', cpu ? { willReadFrequently: true } : undefined);
  const img = g.createImageData(size, size), r = rand(seed);
  for (let i = 0; i < size * size; i++) {
    const v = r();
    const dark = v < 0.5;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = dark ? 70 : 255;
    img.data[i * 4 + 3] = Math.round(alpha * 255 * Math.abs(v - 0.5) * 2 * (0.4 + 0.6 * r()));
  }
  g.putImageData(img, 0, 0);
  return c;
}

function bakeDust(word, glyphIdx, t0, n, seed, counterOnly) {
  const r = rand(seed), g = WD[word].glyphs[glyphIdx];
  const cs = counterOnly ? [g.counter] : g.contours;
  const lens = cs.map((c) => c.pts.length / 2), total = lens.reduce((a, b) => a + b, 0);
  const a = new Float32Array(n * 6);
  for (let k = 0; k < n; k++) {
    let pick = Math.floor(r() * total), ci = 0;
    while (pick >= lens[ci]) { pick -= lens[ci]; ci++; }
    const c = cs[ci], x = c.pts[pick * 2], y = c.pts[pick * 2 + 1];
    const nx = c.nrm[pick * 2], ny = c.nrm[pick * 2 + 1];
    // out of the gap, away from the opening, with a little lift
    // out of the gap: over the opening for a counter, either way for a letter
    const sp = (60 + 240 * r()) * (counterOnly || r() < 0.55 ? 1 : -1);
    a.set([x, y, nx * sp + (r() - 0.5) * 70, ny * sp - 60 - 80 * r(), 1.2 + 3.2 * r() * r(), 0.45 + 0.55 * r()], k * 6);
  }
  DUST.push({ word, t0, parts: a });
}

// ------------------------------------------------------------------ the demo
defineDemo({
  id: '99-knockout-zoom',
  title: '여름으로 난 창',
  tech: '녹아웃 글자 · 카운터를 통과하는 줌',
  duration: DUR,
  background: '#ddd6cb',
  async setup(api) { captionScrim(api, '46,38,34');
    const cpu = api.headless;
    const allText = WORDS.map((w) => w.kicker + w.line.map((l) => l[0]).join('')).join('');
    await fontReady(`800 54px ${PF}`, allText);
    await fontReady(`700 34px ${PF}`, allText);
    const font = await loadOutlineFont('Pretendard-Black');
    const cv = api.canvas({ type: '2d', z: 0, attrs: cpu ? { willReadFrequently: true } : undefined });
    ctx = cv.ctx;

    const probe = document.createElement('canvas').getContext('2d');
    for (const w of WORDS) WD.push(buildWord(font, w.text, probe));
    ZC1 = WD[0].Zc; ZC2 = WD[1].Zc; LAM1 = WD[0].Lam; LAM2 = WD[1].Lam;
    // velocities matched where the exponential phases hand over to the glide inside the scene
    V1 = -ZC1 * ((LAM1 - 0.03) * trapV(0.32, 0)) / (T.dive1 - T.dive0);
    V2 = ZC2 * (LAM2 * trapV(0, 0.42)) / (T.pull1 - T.pull0);

    // line layouts (centred, measured once with the loaded face)
    ctx.font = `800 54px ${PF}`;
    for (const w of WORDS) {
      const chars = [];
      for (const [txt, acc] of w.line) for (const ch of Array.from(txt)) chars.push({ ch, accent: !!acc, w: ctx.measureText(ch).width - 1.1 });
      const total = chars.reduce((a, c) => a + c.w, 0);
      let x = CX - total / 2;
      for (const c of chars) { c.x = x; x += c.w; }
      ctx.font = `700 34px ${PF}`;
      ctx.letterSpacing = '6px';
      const kw = ctx.measureText(w.kicker).width;
      ctx.letterSpacing = '0px';
      ctx.font = `800 54px ${PF}`;
      LINE_LAYOUT.push({ chars, kw });
    }

    // textures: plaster grain (world-anchored) and a fine film grain (screen)
    GRAIN = ctx.createPattern(makeGrain(256, 9901, 0.17, cpu), 'repeat');
    GRAIN_SCREEN = ctx.createPattern(makeGrain(256, 9902, 0.10, cpu), 'repeat');

    // scene contents
    const r = rand(9903);
    FARCLOUDS = Array.from({ length: 6 }, (_, i) => ({ x: i * 270 + r() * 120, y: 690 + r() * 70, w: 140 + r() * 180, h: 16 + r() * 10, v: 4 + r() * 4 }));
    const cloudGroup = (D, n, yA, yB, sA, v, xs) => ({
      D,
      items: Array.from({ length: n }, (_, i) => {
        const sc = sA * (0.75 + 0.5 * r()), w = 300 * sc, h = 46 * sc;
        const k = 3 + Math.floor(r() * 3);
        const puffs = Array.from({ length: k }, (_, j) => {
          const u = (j + 0.5) / k - 0.5, rr = (60 + 50 * Math.sin(Math.PI * (j + 0.5) / k) + 20 * r()) * sc;
          return [u * w * 0.8, -h * 0.4 - rr * 0.35, rr];
        });
        return { x0: xs[i] + r() * 60, y: lerp(yA, yB, r()), w, h, puffs, v: v * (0.8 + 0.4 * r()) };
      }),
    });
    CLOUDS = [cloudGroup(14000, 4, 560, 650, 0.6, 5, [-120, 260, 560, 980]), cloudGroup(5000, 3, 230, 380, 0.82, 9, [20, 330, 1320])];
    GULLS = [
      // a flock crossing behind the wall during the poster hold: seen only through the letters
      ...[[0, 0], [46, -20], [90, -34], [-40, -16], [132, -10]].map(([dx, dy], i) => ({
        D: 2300, x0: 1760 + dx, y: 430 + dy, v: -380, s: 20 - i, f: 9 + i * 0.7, ph: i * 1.9, win: [1.2, 5.2], rt: true })),
      { D: 3200, x0: 180, y: 470, v: 16, s: 22, f: 8.5, ph: 0.3 },
      { D: 3600, x0: 300, y: 420, v: 15, s: 18, f: 9.2, ph: 2.1 },
      { D: 2800, x0: 640, y: 520, v: -9, s: 20, f: 7.9, ph: 4.0 },
      { D: 900, x0: -1384, y: 560, v: 240, s: 30, f: 6.5, ph: 1.2, win: [5.8, 8.5], rt: true },
    ];
    STARS = BANDS.map((b, i) => Array.from({ length: 70 }, () => ({
      x: -600 + r() * 2300, dy: 1.2 + r() * 6, r: r(), w: 2.5 + r() * 4, ph: r() * TAU,
    })));

    // dust puffs at each punch, at the counter drop, and when 안's counter seats again
    bakeDust(0, 0, T.punch[0], 90, 9911, false);
    bakeDust(0, 1, T.punch[1], 90, 9912, false);
    bakeDust(0, 0, T.pop, 36, 9913, true);
    bakeDust(1, 0, T.seat, 46, 9914, true);

    // one draw so every texture has been composited once before the first measured frame
    this.frame(0);
  },
  frame(t) {
    resetCtx();
    ctx.fillStyle = '#ddd6cb';                       // every pixel is painted from scratch each frame
    ctx.fillRect(0, 0, W, H);
    const cam = camera(t);
    const dk = sm(t, T.dusk[0], T.dusk[1]);
    const wd = WD[cam.word];
    const wallOn = cam.Z > wd.Zc;
    if (wallOn) {
      const ws = windowState(t, cam.word);
      const union = drawWall(t, cam, dk, ws);
      resetCtx();
      // the sun direction in the wall plane lights the cut faces (sills glow, lintels sit in shade)
      const se = inOut(dk);
      const sunDir = [lerp(0.38, -0.8, se), lerp(-0.92, -0.6, se)];
      const sl = Math.hypot(sunDir[0], sunDir[1]); sunDir[0] /= sl; sunDir[1] /= sl;
      const { s, ex, ey } = wallXform(cam);
      ctx.save();
      ctx.setTransform(s, 0, 0, s, ex, ey);
      ctx.clip(union, 'nonzero');
      // the scene, seen through the front AND the back opening of each hole
      ctx.save();
      const sb = Z0 / (cam.Z + TH);
      ctx.setTransform(sb, 0, 0, sb, CX - cam.cx * sb, CY - cam.cy * sb);
      ctx.clip(union, 'nonzero');
      drawScene(t, cam, dk);
      ctx.restore();
      // pieces of wall in flight (behind the faces)
      for (const w of ws) {
        if (w.plug) drawPlug(cam, w.plug.path, w.plug, dk, sm(w.plug.z, 0, 220));
        if (w.counterPlug) drawPlug(cam, w.g.counter.path, w.counterPlug, dk, sm(w.counterPlug.z, 0, 220));
      }
      drawFaces(cam, ws, dk, sunDir);
      ctx.restore();
      resetCtx();
      drawDust(t, cam, dk);
    } else {
      drawScene(t, cam, dk);
    }
    // finish: soft vignette + fine grain over everything
    resetCtx();
    const v = ctx.createRadialGradient(CX, CY * 0.92, 380, CX, CY, 1250);
    v.addColorStop(0, 'rgba(30,24,30,0)'); v.addColorStop(1, `rgba(30,24,30,${0.2 + 0.1 * dk})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    const gi = Math.floor(t * 12);
    GRAIN_SCREEN.setTransform(new DOMMatrix([1, 0, 0, 1, (gi * 73) % 256, (gi * 151) % 256]));
    ctx.fillStyle = GRAIN_SCREEN; ctx.fillRect(0, 0, W, H);
  },
});

/** a soft scrim under the harness caption (bottom 19 % of the stage) so the white caption reads on light scenes */
function captionScrim(api, rgb) {
  const el = api.layer('div', { z: 999 });
  el.style.background = `linear-gradient(to bottom, rgba(${rgb},0) 81%, rgba(${rgb},.34) 89%, rgba(${rgb},.58) 100%)`;
  el.style.pointerEvents = 'none';
}
