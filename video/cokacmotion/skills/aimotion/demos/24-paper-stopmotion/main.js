/*
 * 24 · 종이 인형 극장 — Canvas 2D paper cut-out stop-motion.
 * Every piece is cut ONCE in setup(): its outline is resampled into short straight scissor facets with a hand
 * wobble (cutOutline), the lighter paper core shows in a rim between the cut and a noisy inset (each facet of
 * the rim lit by the key-light direction), fibre texture is laid over it, and a blurred silhouette is baked as
 * its shadow. frame(t) quantises time to 12 poses per second ("on twos"), places the baked pieces on a
 * multiplane set (shadow offset and parallax from each layer's height above the backdrop), gives every piece
 * its own seeded hand-placement error per pose, swaps wave cut-outs (replacement animation) and varies the
 * exposure per pose.
 */
import { defineDemo, rand, track, ease, clamp, lerp } from '../_lib/stage.js';

const D = 9.5, STEP = 12, TAU = Math.PI * 2, DEG = Math.PI / 180;
const NSTEP = Math.round(D * STEP);
const LIGHT = [-0.88, -0.48];           // direction toward the key light (left and a little above the set)
const SHX = 0.5, SHY = 0.28;            // shadow offset per px of height above the receiving layer (from LIGHT)
const CORE = '#f4f0e6';                 // the paper's white core, seen on every cut edge
const K = 6, HOLD = 2, M = 190;         // wave cut-outs per row, poses each one is held, row margin
const BM = 70;                          // backdrop margin for the camera truck
const lin = (p) => p;
let TEX, CLOUDY;                        // fibre tiles (setup)
const ALL = [];                         // every baked piece (converted to ImageBitmaps at the end of setup)

// ---------------------------------------------------------------- small geometry helpers
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
function area(P) { let a = 0; for (let i = 0, n = P.length; i < n; i++) { const p = P[i], q = P[(i + 1) % n]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
function path(c, P) { c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); c.closePath(); }
function edgeN(a, b, sgn) { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [sgn * dy / l, -sgn * dx / l]; }
/** smooth periodic 1-D noise on [0,1): n random knots, smoothstep between them */
function loopNoise(rnd, n) {
  const v = Array.from({ length: n }, () => rnd() * 2 - 1);
  return (u) => { const x = (((u % 1) + 1) % 1) * n, i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f); return v[i % n] + (v[(i + 1) % n] - v[i % n]) * s; };
}
/** closed polygon → points every ~step px; a third element 1 marks a corner the scissors must keep */
function densify(P, step = 3) {
  const out = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let j = 0; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k, j === 0 ? (a[2] || 0) : 0]);
  }
  return out;
}
/** closed Catmull–Rom (Hermite) through control points; [x, y, 1] is a sharp corner (zero tangent) */
function spline(ctrl, step = 2) {
  const n = ctrl.length, out = [];
  for (let i = 0; i < n; i++) {
    const p0 = ctrl[(i - 1 + n) % n], p1 = ctrl[i], p2 = ctrl[(i + 1) % n], p3 = ctrl[(i + 2) % n];
    const m1 = p1[2] ? [0, 0] : [(p2[0] - p0[0]) * 0.5, (p2[1] - p0[1]) * 0.5];
    const m2 = p2[2] ? [0, 0] : [(p3[0] - p1[0]) * 0.5, (p3[1] - p1[1]) * 0.5];
    const k = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let j = 0; j < k; j++) {
      const u = j / k, u2 = u * u, u3 = u2 * u;
      const a = 2 * u3 - 3 * u2 + 1, b = u3 - 2 * u2 + u, c = -2 * u3 + 3 * u2, d = u3 - u2;
      out.push([a * p1[0] + b * m1[0] + c * p2[0] + d * m2[0], a * p1[1] + b * m1[1] + c * p2[1] + d * m2[1], j === 0 && p1[2] ? 1 : 0]);
    }
  }
  return out;
}
const circle = (r, step = 2) => { const n = Math.ceil(TAU * r / step); return Array.from({ length: n }, (_, i) => [r * Math.cos(TAU * i / n), r * Math.sin(TAU * i / n), 0]); };
const starPts = (R, k = 0.46) => densify(Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * k : R; return [r * Math.cos(a), r * Math.sin(a), 1]; }), 2);

// ---------------------------------------------------------------- paper
/** tileable paper: value-noise octaves (formation/cloudiness + tooth) and curved fibres, grey around `base` */
function paperTile(seed, S, octs, fibres, base = 128, contrast = 255, grain = 0.05) {
  const r = rand(seed), cv = mk(S, S), c = cv.getContext('2d', { willReadFrequently: true });
  const acc = new Float32Array(S * S);
  for (const [n, amp] of octs) {
    const g = new Float32Array(n * n);
    for (let i = 0; i < n * n; i++) g[i] = r() - 0.5;
    const k = n / S;
    for (let y = 0; y < S; y++) {
      const fy = y * k, iy = fy | 0, ty = fy - iy, sy = ty * ty * (3 - 2 * ty), y0 = (iy % n) * n, y1 = ((iy + 1) % n) * n;
      for (let x = 0; x < S; x++) {
        const fx = x * k, ix = fx | 0, tx = fx - ix, sx = tx * tx * (3 - 2 * tx), x0 = ix % n, x1 = (ix + 1) % n;
        const a = g[y0 + x0] + (g[y0 + x1] - g[y0 + x0]) * sx, b = g[y1 + x0] + (g[y1 + x1] - g[y1 + x0]) * sx;
        acc[y * S + x] += amp * (a + (b - a) * sy);
      }
    }
  }
  const img = c.createImageData(S, S), d = img.data;
  for (let i = 0; i < S * S; i++) {
    const v = clamp(base + (acc[i] + grain * (r() - 0.5)) * contrast, 0, 255);
    d[4 * i] = d[4 * i + 1] = d[4 * i + 2] = v; d[4 * i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  for (let i = 0; i < fibres; i++) {
    const x = r() * S, y = r() * S, a = r() * TAU, len = 5 + r() * r() * 46, bend = (r() - 0.5) * 0.9, light = r() < 0.62;
    c.strokeStyle = light ? `rgba(255,255,255,${(0.08 + 0.14 * r()).toFixed(3)})` : `rgba(0,0,0,${(0.05 + 0.08 * r()).toFixed(3)})`;
    c.lineWidth = 0.35 + r() * 0.9;
    const ex = Math.cos(a) * len, ey = Math.sin(a) * len, mx = ex / 2 - ey * bend * 0.5, my = ey / 2 + ex * bend * 0.5;
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {      // drawn 9× so the tile wraps
      if (x + ox > S + 50 || x + ox < -50 - len || y + oy > S + 50 || y + oy < -50 - len) continue;
      c.beginPath(); c.moveTo(x + ox, y + oy); c.quadraticCurveTo(x + ox + mx, y + oy + my, x + ox + ex, y + oy + ey); c.stroke();
    }
  }
  return cv;
}

/**
 * Scissors: walk the outline and keep a point every 4–16 px (corners always kept) → short straight facets.
 * Each kept point is pushed along the outline normal by a slow wander (the hand drifting off the drawn line)
 * plus a little jag per cut. Torn paper uses tiny facets and a strong high-frequency term instead.
 */
function cutOutline(pts, rnd, { facet = [6, 14], jag = 0.6, wander = 1.3, torn = 0 } = {}) {
  const n = pts.length, L = new Float64Array(n + 1);
  for (let i = 1; i <= n; i++) { const a = pts[i - 1], b = pts[i % n]; L[i] = L[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]); }
  const total = L[n], sgn = area(pts) > 0 ? 1 : -1;
  const w1 = loopNoise(rnd, Math.max(3, Math.round(total / 110)));
  const w2 = loopNoise(rnd, Math.max(5, Math.round(total / 16)));
  const w3 = loopNoise(rnd, Math.max(7, Math.round(total / 5)));
  const out = [];
  let next = 0;
  for (let i = 0; i < n; i++) {
    const s = L[i], corner = pts[i][2];
    if (!corner && s < next) continue;
    if (!corner && total - s < facet[0] * 0.6) continue;          // no sliver facet where the loop closes
    const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const u = s / total;
    let d = wander * w1(u) + (corner ? 0.25 : 1) * jag * (rnd() - 0.5) * 2;
    if (torn) d += torn * (0.9 * w2(u) + 0.55 * w3(u) + 0.35 * (rnd() - 0.5));
    out.push([pts[i][0] + sgn * ty * d, pts[i][1] - sgn * tx * d, corner ? 1 : 0]);
    next = s + lerp(facet[0], facet[1], rnd());
  }
  return out;
}

/** the inner edge of the visible core: every vertex moved inward by a noisy width (mitred, capped) */
function inset(P, rnd, [wmin, wmax], sgn) {
  const n = P.length, wn = loopNoise(rnd, Math.max(4, (n / 5) | 0)), out = [];
  for (let i = 0; i < n; i++) {
    const a = P[(i - 1 + n) % n], b = P[i], c = P[(i + 1) % n];
    const n1 = edgeN(a, b, sgn), n2 = edgeN(b, c, sgn);
    let mx = n1[0] + n2[0], my = n1[1] + n2[1];
    const ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
    const miter = Math.max(0.55, mx * n1[0] + my * n1[1]);
    const w = lerp(wmin, wmax, 0.5 + 0.5 * wn(i / n)) / miter;
    out.push([b[0] - mx * w, b[1] - my * w]);
  }
  return out;
}

/**
 * Cut, colour and texture one paper piece into its own canvas, plus a half-resolution blurred shadow whose
 * softness matches the height the piece will hang at. Local coordinates are kept (ox, oy = canvas origin).
 */
function makePiece(pts, o) {
  const rnd = rand(o.seed);
  const cut = o.raw ? pts : cutOutline(pts, rnd, o);
  const sgn = area(cut) > 0 ? 1 : -1;
  const inner = inset(cut, rnd, o.rim || (o.torn ? [2.2, 5.5] : [0.9, 2.6]), sgn);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of cut) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  const pad = o.torn ? 9 : 4, ox = Math.floor(x0 - pad), oy = Math.floor(y0 - pad);
  const cw = Math.ceil(x1 - ox + pad), ch = Math.ceil(y1 - oy + pad);
  const cv = mk(cw, ch), c = cv.getContext('2d');
  c.translate(-ox, -oy);
  // 1. the core, then the rim facets: lit where the cut faces the lamp, in shade on the far side
  path(c, cut); c.fillStyle = o.core || CORE; c.fill();
  const rimK = o.torn ? 0.3 : 1;
  for (let i = 0, n = cut.length; i < n; i++) {
    const j = (i + 1) % n, e = edgeN(cut[i], cut[j], sgn), lit = e[0] * LIGHT[0] + e[1] * LIGHT[1];
    c.beginPath(); c.moveTo(cut[i][0], cut[i][1]); c.lineTo(cut[j][0], cut[j][1]); c.lineTo(inner[j][0], inner[j][1]); c.lineTo(inner[i][0], inner[i][1]);
    c.fillStyle = lit > 0 ? `rgba(255,253,246,${(0.5 * lit * rimK).toFixed(3)})` : `rgba(60,54,48,${(-0.48 * lit * rimK).toFixed(3)})`;
    c.fill();
  }
  // 2. the dyed face
  path(c, inner); c.fillStyle = o.color; c.fill();
  c.save(); path(c, cut); c.clip();
  // 3. a sheet is never flat: a faint fall-off away from the lamp
  const g = c.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, 'rgba(255,246,226,0.11)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,24,0.15)');
  c.fillStyle = g; c.fillRect(ox, oy, cw, ch);
  // 4. fibres and formation, laid over face and core alike (the tile is grey 128 → overlay keeps the dye)
  const pat = c.createPattern(o.tile || TEX, 'repeat');
  pat.setTransform(new DOMMatrix().translate(rnd() * 512, rnd() * 512).rotate(rnd() * 360).scale(o.texScale || 1));
  c.globalCompositeOperation = 'overlay'; c.globalAlpha = o.tex ?? 0.75;
  c.fillStyle = pat; c.fillRect(ox, oy, cw, ch);
  c.restore();
  if (o.decorate) { c.save(); o.decorate(c, rnd, cut); c.restore(); }
  // 5. torn edges: loose fibres stick out past the tear
  if (o.torn) {
    c.lineCap = 'round';
    for (let i = 0, n = cut.length; i < n; i++) {
      if (rnd() > 0.55) continue;
      const a = cut[(i - 1 + n) % n], b = cut[(i + 1) % n], p = cut[i];
      let nx = sgn * (b[1] - a[1]), ny = -sgn * (b[0] - a[0]);
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const len = 1 + rnd() * rnd() * 5, sk = (rnd() - 0.5) * 1.2;
      c.strokeStyle = `rgba(250,247,238,${(0.35 + 0.4 * rnd()).toFixed(2)})`; c.lineWidth = 0.5 + rnd() * 0.6;
      c.beginPath(); c.moveTo(p[0] - nx * 1.5, p[1] - ny * 1.5); c.lineTo(p[0] + (nx - ny * sk) * len, p[1] + (ny + nx * sk) * len); c.stroke();
    }
  }
  // 6. the shadow: silhouette at half resolution, blurred by the height the piece hangs above what it shades
  const blur = 1 + 0.3 * (o.h ?? 10), sp = Math.ceil(blur * 2.4) + 2;
  const sw = Math.ceil((x1 - x0 + 2 * sp) / 2), shh = Math.ceil((y1 - y0 + 2 * sp) / 2);
  const s1 = mk(sw, shh), a1 = s1.getContext('2d');
  a1.scale(0.5, 0.5); a1.translate(-(x0 - sp), -(y0 - sp)); path(a1, cut); a1.fillStyle = '#0a0c1a'; a1.fill();
  const s2 = mk(sw, shh), a2 = s2.getContext('2d');
  a2.filter = `blur(${(blur / 2).toFixed(2)}px)`; a2.drawImage(s1, 0, 0);
  const P = { img: cv, ox, oy, cut, sh: s2, sox: x0 - sp, soy: y0 - sp, sw: sw * 2, shh: shh * 2 };
  if (!o.inner) ALL.push(P);   // glued details are drawn into their parent and never placed per frame
  return P;
}
/** draw a baked piece (or its shadow) at the current transform */
function drawP(c, P, shadow) { if (shadow) c.drawImage(P.sh, P.sox, P.soy, P.sw, P.shh); else c.drawImage(P.img, P.ox, P.oy); }
/** a glued detail inside a bigger piece: its own small shadow, then itself */
function glue(c, P, a = 0.3, d = 1.4) { c.save(); c.globalAlpha = a; c.translate(d * 0.6, d); drawP(c, P, 1); c.restore(); drawP(c, P, 0); }

// ---------------------------------------------------------------- the set
// four rows of waves (back → front): crest height A, wavelength, forward lean, colour, height above backdrop
const ROWS = [
  { y: 1092, A: 24, lam: 170, lean: 0.7, ph: 0.3, color: '#4d6993', h: 14, bottom: 1300, slide: 12 },
  { y: 1242, A: 32, lam: 226, lean: 0.9, ph: 1.9, color: '#375a83', h: 22, bottom: 1460, slide: 16 },
  { y: 1406, A: 42, lam: 292, lean: 1.0, ph: 4.1, color: '#26476d', h: 34, bottom: 1640, slide: 21 },
  { y: 1592, A: 56, lam: 372, lean: 1.1, ph: 0.9, color: '#173252', h: 46, bottom: 1950, slide: 26 },
];
/** the crest drawn for row R at phase phi: peaked crests (raised cosine^1.6), leaning forward, plus a slow
 *  swell that is the same in every cut-out. The 2θ term moves with 2·phi so the K cut-outs form a loop. */
function crestAt(R, u, phi) {
  const th = TAU * u / R.lam - phi + R.ph;
  const pk = Math.pow(0.5 + 0.5 * Math.cos(th), 1.6);
  return [u + R.lean * R.A * 0.5 * Math.sin(th), R.y - R.A * (pk + 0.12 * Math.sin(2 * th + 1.0) + 0.16 * Math.sin(TAU * u / (R.lam * 3.7) + R.ph * 2))];
}
const STARS = [[150, 250, 20, 0.5], [330, 160, 15, 0.8], [872, 222, 22, 1.1], [992, 430, 14, 1.45], [520, 318, 17, 1.8], [228, 600, 13, 2.2], [790, 112, 12, 2.55], [62, 790, 11, 2.9]];
const SETTLE = [[8, -11, 0.22, 26], [2, -3, 0.06, 9], [0, 0, 0, 3]];   // a star held above the set, set down, glued
const MOON_X = 650;

const CAMX = track([[0, -22], [D, 28, lin]]);
const SEA = track([[0, 0.55], [3, 0.8, lin], [5.4, 1.15], [7.4, 1.15], [D, 0.5]]);
const FRONT = track([[0, 0.3], [0.8, 1, ease.outCubic], [8.8, 1], [D, 0.8]]);
const MOONY = track([[1.0, 1290], [5.5, 600, ease.outCubic]]);
const CLA = track([[0, 150], [D, 285, lin]]), CLB = track([[0, 935], [D, 770, lin]]);
const LAMP0 = Math.round(5.5 * STEP), LAMPSEQ = [0.22, 0.06, 0.55, 0.3, 0.8, 0.66, 0.95, 1];   // a tungsten bulb catching
const LAND = 8.3;
const BIRDH = track([[7.2, 62], [LAND, 36]]);

function boatPose(tq) {
  const sea = SEA(tq), ph = TAU * tq / 1.7;
  return { x: 170 + 34 * tq, y: 1352 + 9 * sea * Math.sin(ph), a: 0.065 * sea * Math.sin(ph + 1.3) };
}
const MAST = [2, -233];                 // where the bird sits on the boat (boat-local)
const onBoat = (b, [px, py]) => [b.x + px * Math.cos(b.a) - py * Math.sin(b.a), b.y + px * Math.sin(b.a) + py * Math.cos(b.a)];
const LANDPT = onBoat(boatPose(LAND), MAST);
const BIRD = [[2.0, -170, 880], [2.8, 110, 770], [3.6, 330, 680], [4.4, 500, 590], [5.2, 610, 528], [6.0, 722, 556],
  [6.6, 850, 650], [7.2, 915, 800], [7.8, 780, 975], [LAND, LANDPT[0], LANDPT[1]]];
function birdPos(t) {
  const n = BIRD.length;
  let i = 0;
  while (i < n - 2 && t >= BIRD[i + 1][0]) i++;
  const u = clamp((t - BIRD[i][0]) / (BIRD[i + 1][0] - BIRD[i][0]));
  const p0 = BIRD[Math.max(0, i - 1)], p1 = BIRD[i], p2 = BIRD[i + 1], p3 = BIRD[Math.min(n - 1, i + 2)];
  const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  return [cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2])];
}
// wing on its split pin, degrees (0 = raised as cut; negative swings it back and down)
const FLAP = [8, -30, -78, -96, -62, -22], BOB = [2, 0, -3, -4, -2, 1];
function wingDeg(step) {
  const t = step / STEP;
  if (t >= LAND) { const k = step - Math.round(LAND * STEP); return [-20, -45, -62, -72][Math.min(k, 3)] + (k > 8 && k % 11 < 2 ? 5 : 0); }
  if (t >= 7.9) return [12, 18, 14, 16, 12][Math.min(step - Math.round(7.9 * STEP), 4)];
  if (t >= 5.3 && t < 6.5) return -36;                      // the glide across the moon
  return FLAP[step % 6];
}

// ---------------------------------------------------------------- shapes (local coordinates)
const BODY = [[64, -8], [58, 4], [40, 12], [10, 17], [-24, 13], [-60, 6], [-106, 22, 1], [-78, 2, 1], [-110, -12, 1], [-58, -10], [-20, -15], [18, -19], [40, -24], [56, -19]];
const BEAK = [[58, -12, 1], [84, -5, 1], [57, 3, 1]];
const WING = [[8, 4], [12, -14], [4, -46], [-12, -76], [-30, -96, 1], [-38, -74], [-30, -64, 1], [-46, -56], [-38, -44, 1], [-50, -36], [-40, -24, 1], [-44, -14], [-20, 2]];
const WINGTIP = [[-14, -74], [-30, -96, 1], [-38, -74], [-31, -65, 1], [-22, -62]];
const HULL = [[-130, -36, 1], [-60, -29], [0, -28], [62, -30], [130, -40, 1], [104, -8], [56, 6], [-52, 8], [-104, -6]];
const STRIPE = [[-117, -27, 1], [0, -19], [118, -31, 1], [112, -21, 1], [0, -10], [-111, -17, 1]];
const MASTP = [[-4, -26, 1], [4, -26, 1], [3, -220, 1], [-3, -220, 1]];
const SAIL = [[10, -206, 1], [58, -120], [100, -50, 1], [52, -45], [10, -42, 1]];
const JIB = [[-7, -188, 1], [-7, -48, 1], [-74, -54, 1], [-40, -110]];

function cloudPts(w, hh, rnd) {
  const ctrl = [[-w / 2, hh * 0.16], [-w * 0.18, hh * 0.24], [w * 0.2, hh * 0.2], [w / 2, hh * 0.12]];
  const n = 4;
  for (let i = 0; i <= 2 * n; i++) {
    const f = i / (2 * n), x = w * 0.46 - w * 0.92 * f, env = Math.sqrt(Math.sin(Math.PI * (0.08 + 0.84 * f)));
    ctrl.push([x, -hh * env * (i % 2 ? 0.25 + 0.2 * rnd() : 0.6 + 0.4 * rnd())]);
  }
  return spline(ctrl, 2);
}
function mariaBlobs() {
  const r = rand(77);
  return [[-52, -34, 42], [44, 18, 32], [-8, 62, 22], [58, -58, 14]].map(([cx, cy, rr]) =>
    spline(Array.from({ length: 8 }, (_, i) => { const a = TAU * i / 8, q = rr * (0.7 + 0.55 * r()); return [cx + q * Math.cos(a), cy + q * Math.sin(a) * 0.85]; }), 2));
}

// ---------------------------------------------------------------- per-frame placement
function put(c, P, x, y, a, h, sa) {
  c.save(); c.globalAlpha = sa; c.translate(x + SHX * h, y + SHY * h); c.rotate(a); drawP(c, P, 1); c.restore();
  c.save(); c.translate(x, y); c.rotate(a); drawP(c, P, 0); c.restore();
}
function drawBird(c, S, b, sa) {
  for (const pass of [1, 0]) {
    c.save();
    if (pass) { c.globalAlpha = sa; c.translate(SHX * b.h, SHY * b.h); }
    c.translate(b.x, b.y); c.rotate(b.a); if (b.flip) c.scale(-1, 1);
    c.save(); c.translate(4, -12); c.rotate(b.wf); drawP(c, S.wingFar, pass); c.restore();
    drawP(c, S.beak, pass); drawP(c, S.body, pass);
    c.save(); c.translate(10, -8); c.rotate(b.wn); drawP(c, S.wingNear, pass); if (!pass) c.drawImage(S.pin, -7, -7); c.restore();
    c.restore();
  }
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '24-paper-stopmotion',
  title: '종이 인형 극장',
  tech: 'Canvas 2D · 12fps 스톱모션 + 손으로 오린 종이',
  duration: D,
  background: '#0c1020',
  async setup({ canvas, headless }) {
    this.ctx = canvas({ type: '2d', attrs: headless ? { willReadFrequently: true } : undefined }).ctx;
    TEX = paperTile(11, 512, [[16, 0.10], [64, 0.09], [256, 0.06]], 1500, 128, 255, 0.10);
    CLOUDY = paperTile(23, 512, [[4, 0.32], [10, 0.22], [28, 0.14], [96, 0.07]], 700, 205, 240, 0.04);
    const S = (this.S = {});
    let seed = 1000;

    // --- backdrop: one sheet of dark indigo card, pricked with pin holes for the lamp behind it
    const BW = 1080 + 2 * BM, BH = 1300;
    {
      const bd = mk(BW, BH), c = bd.getContext('2d'), r = rand(5);
      c.fillStyle = '#25335c'; c.fillRect(0, 0, BW, BH);
      const p1 = c.createPattern(CLOUDY, 'repeat'); p1.setTransform(new DOMMatrix().scale(2.6));
      c.globalCompositeOperation = 'soft-light'; c.globalAlpha = 0.55; c.fillStyle = p1; c.fillRect(0, 0, BW, BH);
      const p2 = c.createPattern(TEX, 'repeat'); p2.setTransform(new DOMMatrix().rotate(7));
      c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.9; c.fillStyle = p2; c.fillRect(0, 0, BW, BH);
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
      // an old fold across the sheet: a shaded side and a lit side
      c.lineWidth = 2.2; c.strokeStyle = 'rgba(0,0,12,0.22)';
      c.beginPath(); c.moveTo(BW * 0.63, -10); c.bezierCurveTo(BW * 0.7, 400, BW * 0.8, 800, BW * 0.93, BH + 10); c.stroke();
      c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,250,235,0.08)';
      c.beginPath(); c.moveTo(BW * 0.63 - 2, -10); c.bezierCurveTo(BW * 0.7 - 2, 400, BW * 0.8 - 2, 800, BW * 0.93 - 2, BH + 10); c.stroke();
      // pin holes: a dark prick with a little raised burr; the same holes glow when the lamp behind comes on
      const gA = mk(BW, 1160), gB = mk(BW, 1160), ga = gA.getContext('2d'), gb = gB.getContext('2d');
      ga.globalCompositeOperation = gb.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 170; i++) {
        const x = r() * BW, y = 16 + r() * 1120, rr = 0.9 + r() * r() * 1.7;
        c.fillStyle = 'rgba(255,248,230,0.16)'; c.beginPath(); c.arc(x - 0.5, y - 0.6, rr + 0.9, 0, TAU); c.fill();
        c.fillStyle = '#080a14'; c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill();
        const g = i % 2 ? gb : ga, R = 5 + rr * 6;
        const gr = g.createRadialGradient(x, y, 0, x, y, R);
        gr.addColorStop(0, 'rgba(255,246,222,1)'); gr.addColorStop(0.13, 'rgba(255,230,180,0.75)'); gr.addColorStop(0.3, 'rgba(255,200,130,0.16)'); gr.addColorStop(1, 'rgba(255,190,120,0)');
        g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
      }
      S.backdrop = bd; S.glowA = gA; S.glowB = gB;
    }

    // --- gold-paper stars (a foil sheen glued across each)
    const foil = (c, rnd) => {
      c.globalCompositeOperation = 'source-atop';
      const a = rnd() * TAU, g = c.createLinearGradient(-30 * Math.cos(a), -30 * Math.sin(a), 30 * Math.cos(a), 30 * Math.sin(a));
      g.addColorStop(0.25, 'rgba(255,240,190,0)'); g.addColorStop(0.5, 'rgba(255,244,205,0.38)'); g.addColorStop(0.75, 'rgba(255,240,190,0)');
      c.fillStyle = g; c.fillRect(-40, -40, 80, 80);
    };
    S.stars = STARS.map(([, , R]) => makePiece(starPts(R), { seed: seed++, color: '#d4ac55', facet: [3, 6], jag: 0.35, wander: 0.5, rim: [0.6, 1.5], h: 12, decorate: foil }));
    S.starRot = STARS.map((_, i) => (rand(300 + i)() - 0.5) * 0.6);

    // --- the moon: torn, not cut, from cream paper; tissue maria glued on; a second, back-lit look of the same sheet
    const maria = mariaBlobs();
    S.moon = makePiece(circle(150, 2), {
      seed: seed++, color: '#efdeb1', torn: 2.6, facet: [2, 3], jag: 0.3, wander: 2.6, h: 8, tex: 0.65,
      decorate: (c) => { c.fillStyle = 'rgba(150,118,72,0.09)'; for (const B of maria) { path(c, B); c.fill(); } },
    });
    {
      const P = S.moon, cv = mk(P.img.width, P.img.height), c = cv.getContext('2d');
      c.translate(-P.ox, -P.oy);
      path(c, P.cut); c.save(); c.clip();
      const g = c.createRadialGradient(-26, -34, 8, 0, 0, 168);
      g.addColorStop(0, '#fffbea'); g.addColorStop(0.65, '#ffecbf'); g.addColorStop(1, '#f5c67a');
      c.fillStyle = g; c.fillRect(-170, -170, 340, 340);
      // light through paper shows its formation: thick flocs dark, thin places bright
      const pat = c.createPattern(CLOUDY, 'repeat'); pat.setTransform(new DOMMatrix().translate(40, 90).scale(1.15));
      c.globalCompositeOperation = 'multiply'; c.fillStyle = pat; c.fillRect(-170, -170, 340, 340);
      c.filter = 'blur(3px)'; c.fillStyle = 'rgba(206,160,104,0.85)';
      for (const B of maria) { path(c, B); c.fill(); }      // tissue maria block light only when lit from behind
      c.filter = 'none';
      c.globalCompositeOperation = 'screen'; c.lineWidth = 9; c.strokeStyle = 'rgba(255,244,214,0.55)';
      path(c, P.cut); c.stroke();                           // the thin torn edge lets more light through
      c.restore();
      S.moonLit = cv; ALL.push({ lit: true, P: S });
    }

    // --- clouds: torn strips
    S.cloudA = makePiece(cloudPts(330, 92, rand(seed)), { seed: seed++, color: '#56668f', torn: 2.2, facet: [2, 3], wander: 2, h: 10 });
    S.cloudB = makePiece(cloudPts(290, 80, rand(seed)), { seed: seed++, color: '#6b7aa1', torn: 2.2, facet: [2, 3], wander: 2, h: 18 });

    // --- the sea: K separately cut replacement pieces per row, each with its own foam cut-outs glued along the crests
    S.rows = ROWS.map((R, r) => Array.from({ length: K }, (_, v) => {
      const phi = TAU * v / K, top = [];
      for (let u = -M; u <= 1080 + M; u += 3) { const p = crestAt(R, u, phi); top.push([p[0], p[1], 0]); }
      top[0][2] = 1; top[top.length - 1][2] = 1;
      const pts = densify([...top, [top[top.length - 1][0], R.bottom, 1], [top[0][0], R.bottom, 1]], 3);
      const foams = [];
      if (r > 0) {
        for (let k = -3; k < 12; k++) {
          const uk = (TAU * k + phi - R.ph) * R.lam / TAU;
          if (uk < -M + 50 || uk > 1080 + M - 90) continue;
          const T = 4 + R.A * 0.13, up = [], lo = [];
          for (let s = 0; s <= 1.0001; s += 0.04) {
            const u = uk + R.lam * (-0.1 + 0.34 * s), p = crestAt(R, u, phi), th = T * Math.pow(Math.sin(Math.PI * s), 0.8);
            up.push([p[0], p[1] - 1.5, s === 0 ? 1 : 0]); lo.push([p[0], p[1] + th, 0]);
          }
          up[up.length - 1][2] = 1;
          foams.push(makePiece([...up, ...lo.reverse().slice(1, -1)], { seed: seed++, color: '#e8e2d0', facet: [3, 7], jag: 0.45, wander: 0.7, rim: [0.5, 1.3], h: 2, inner: true }));
        }
      }
      return makePiece(pts, { seed: seed++, color: R.color, facet: [8, 18], jag: 0.7, wander: 1.7, h: R.h, tex: 0.8,
        decorate: (c) => { for (const F of foams) glue(c, F, 0.32, 1.6); } });
    }));
    // moonlight on the water: short slivers of pale paper, laid by hand on the rows
    S.sliv = Array.from({ length: 10 }, (_, i) => {
      const r = rand(900 + i), w = 20 + r() * 46, h = 4 + r() * 3.5;
      return makePiece(spline([[-w / 2, 0, 1], [0, -h / 2], [w / 2, 0, 1], [0, h / 2]], 1.5), { seed: seed++, color: '#ecdcaa', facet: [3, 6], jag: 0.3, wander: 0.4, rim: [0.4, 1], h: 2 });
    });

    // --- the boat
    const stripe = makePiece(spline(STRIPE, 2), { seed: seed++, color: '#e9dcc0', facet: [5, 10], rim: [0.5, 1.2], h: 2, inner: true });
    S.hull = makePiece(spline(HULL, 2), { seed: seed++, color: '#b4452f', facet: [6, 13], h: 28,
      decorate: (c) => {
        glue(c, stripe, 0.3, 1.4);
        for (const x of [-62, -10, 42]) { c.fillStyle = '#3b1d18'; c.beginPath(); c.arc(x, -2, 5.2, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,240,220,0.35)'; c.lineWidth = 1; c.beginPath(); c.arc(x, -2, 5.6, Math.PI * 1.1, Math.PI * 1.7); c.stroke(); }
      } });
    S.mast = makePiece(densify(MASTP, 3), { seed: seed++, color: '#6b4a30', facet: [6, 12], jag: 0.4, rim: [0.4, 1.0], h: 28 });
    S.sail = makePiece(spline(SAIL, 2), { seed: seed++, color: '#f0e7d3', facet: [6, 14], h: 28,
      decorate: (c) => { c.strokeStyle = 'rgba(120,96,70,0.22)'; c.lineWidth = 1; for (const y of [-160, -115, -75]) { c.beginPath(); c.moveTo(12, y); c.lineTo(12 + (y + 206) * 0.52, y + 8); c.stroke(); } } });
    S.jib = makePiece(spline(JIB, 2), { seed: seed++, color: '#d9c9a6', facet: [6, 14], h: 28 });

    // --- the bird: body, beak, two wings on brass split pins
    S.body = makePiece(spline(BODY, 1.5), { seed: seed++, color: '#f2eee4', facet: [4, 8], jag: 0.45, h: 50,
      decorate: (c) => {
        c.fillStyle = '#1c1a22'; c.beginPath(); c.arc(47, -10, 3.4, 0, TAU); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.arc(46, -11.2, 1, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(80,72,64,0.25)'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(30, 8); c.quadraticCurveTo(0, 16, -34, 10); c.stroke();
      } });
    S.beak = makePiece(densify(BEAK, 2), { seed: seed++, color: '#df783c', facet: [3, 6], jag: 0.3, rim: [0.5, 1.1], h: 50 });
    const tip = makePiece(spline(WINGTIP, 1.5), { seed: seed++, color: '#5b6a87', facet: [3, 6], rim: [0.5, 1.1], h: 2, inner: true });
    S.wingNear = makePiece(spline(WING, 1.5), { seed: seed++, color: '#dfe5ec', facet: [4, 8], jag: 0.45, h: 50, decorate: (c) => glue(c, tip, 0.3, 1.2) });
    S.wingFar = makePiece(spline(WING, 1.5), { seed: seed++, color: '#a3afc1', facet: [4, 8], jag: 0.45, h: 50 });
    {
      const cv = mk(14, 14), c = cv.getContext('2d');
      c.fillStyle = 'rgba(10,10,20,0.35)'; c.beginPath(); c.arc(8, 8.6, 5.2, 0, TAU); c.fill();
      const g = c.createRadialGradient(5.6, 5.4, 0.5, 7, 7, 5.6);
      g.addColorStop(0, '#fff3c2'); g.addColorStop(0.35, '#e2bd62'); g.addColorStop(1, '#8a6424');
      c.fillStyle = g; c.beginPath(); c.arc(7, 7, 5.2, 0, TAU); c.fill();
      S.pin = cv;
    }

    // --- the key light: a pool from the lamp at upper left, falling off to the corners
    {
      const cv = mk(1080, 1920), c = cv.getContext('2d');
      const g = c.createRadialGradient(330, 560, 80, 480, 840, 1500);
      g.addColorStop(0, 'rgb(255,251,242)'); g.addColorStop(0.42, 'rgb(236,231,226)'); g.addColorStop(0.75, 'rgb(170,166,182)'); g.addColorStop(1, 'rgb(112,110,132)');
      c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
      S.light = cv;
    }

    // everything placed per frame becomes an immutable bitmap (GPU-friendly, no live canvases)
    for (const P of ALL) {
      if (P.lit) { P.P.moonLit = await createImageBitmap(P.P.moonLit); continue; }
      P.img = await createImageBitmap(P.img); P.sh = await createImageBitmap(P.sh);
    }
    S.backdrop = await createImageBitmap(S.backdrop); S.glowA = await createImageBitmap(S.glowA); S.glowB = await createImageBitmap(S.glowB);
    S.light = await createImageBitmap(S.light); S.pin = await createImageBitmap(S.pin);
  },

  frame(t) {
    const S = this.S, c = this.ctx;
    // stop motion: 12 poses a second, each held for two video frames
    const step = Math.min(NSTEP - 1, Math.floor(t * STEP + 1e-6)), tq = step / STEP;
    // every pose has its own hand error per piece: a seeded generator per (piece, pose)
    const R = (id, s = step) => rand((Math.imul(id + 1, 0x9e3779b1) ^ Math.imul(s + 7, 0x85ebca6b)) >>> 0);
    const hand = (id, amt = 1) => { const r = R(id), g = () => (r() + r() + r() - 1.5) * 0.95; return [g() * 1.25 * amt, g() * 1.25 * amt, g() * 0.0065 * amt]; };
    const cj = hand(999, 0.3), camX = CAMX(tq), sea = SEA(tq);
    const lamp = step < LAMP0 ? 0 : LAMPSEQ[Math.min(step - LAMP0, LAMPSEQ.length - 1)];
    const par = (h) => 0.2 + h / 50;                                  // multiplane parallax per layer height
    const layer = (h) => c.setTransform(1, 0, 0, 1, cj[0] - camX * par(h), cj[1]);
    const shA = (h) => 0.62 - 0.0036 * h;

    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#0c1020'; c.fillRect(0, 0, 1080, 1920);
    layer(0); c.drawImage(S.backdrop, -BM, 0);
    if (lamp > 0) {
      const r = R(77);
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = lamp * (0.65 + 0.35 * r()); c.drawImage(S.glowA, -BM, 0);
      c.globalAlpha = lamp * (0.65 + 0.35 * r()); c.drawImage(S.glowB, -BM, 0);
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }

    // stars: each is held above the set for one pose, set down, then glued (no more hand error)
    layer(3);
    STARS.forEach(([x, y, , ts], i) => {
      const k = step - Math.round(ts * STEP);
      if (k < 0) return;
      const s = SETTLE[Math.min(k, 2)], j = k < 2 ? hand(10 + i) : [0, 0, 0];
      put(c, S.stars[i], x + s[0] + j[0], y + s[1] + j[1], S.starRot[i] + s[2] + j[2], s[3], shA(s[3]));
    });

    // the moon, raised on its rod a little each pose; back-lit look fades in with the lamp
    layer(8);
    const mj = hand(400, 0.9), my = MOONY(tq), mx = MOON_X + mj[0], myy = my + mj[1];
    put(c, S.moon, mx, myy, mj[2], 8, shA(8) * (1 - 0.5 * lamp));
    if (lamp > 0) { c.save(); c.globalAlpha = lamp; c.translate(mx, myy); c.rotate(mj[2]); c.drawImage(S.moonLit, S.moon.ox, S.moon.oy); c.restore(); }
    const msx = mx - camX * par(8) + cj[0], msy = myy + cj[1];
    const moonUp = clamp((1000 - my) / 320);

    [[S.cloudA, CLA(tq), 470, 10], [S.cloudB, CLB(tq), 832, 18]].forEach(([P, x, y, h], i) => {
      layer(h); const j = hand(500 + i, 0.8); put(c, P, x + j[0], y + j[1], j[2], h, shA(h));
    });

    // the sea: replacement cut-outs, rocked by hand
    const bp = boatPose(tq), bj = hand(200, 0.9);
    const bx = bp.x + bj[0], by = bp.y + bj[1], ba = bp.a + bj[2];
    ROWS.forEach((Rw, r) => {
      const v = (Math.floor(step / HOLD) + r * 2) % K, j = hand(100 + r, 0.8);
      const sx = Rw.slide * sea * Math.sin(TAU * tq / 2.6 + r * 1.7) + j[0];
      const sy = 7 * sea * Math.sin(TAU * tq / 1.9 + r * 1.1) + j[1];
      layer(Rw.h);
      put(c, S.rows[r][v], sx, sy, j[2] * 0.3, Rw.h, shA(Rw.h));
      if (r < 3 && moonUp > 0.02) {
        const rr = R(31 + r, Math.floor(step / HOLD)), n = Math.round(moonUp * [3, 5, 6][r]);
        const spread = [80, 130, 190][r] * (0.55 + 0.45 * moonUp), depth = [80, 86, 96][r];
        for (let i = 0; i < n; i++) {
          const P = S.sliv[Math.floor(rr() * S.sliv.length)];
          const x = MOON_X + (rr() - 0.5) * spread * 2 + sx, y = Rw.y + 10 + rr() * depth + sy, a = (rr() - 0.5) * 0.08;
          put(c, P, x, y, a, 2, shA(2) * 0.6);
          if (lamp > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.4 * lamp; c.translate(x, y); c.rotate(a); drawP(c, P, 0); c.restore(); }
        }
      }
      if (r === 1) {                                            // the boat sails between rows 1 and 2
        layer(28);
        for (const pass of [1, 0]) {
          c.save();
          if (pass) { c.globalAlpha = shA(28); c.translate(SHX * 28, SHY * 28); }
          c.translate(bx, by); c.rotate(ba);
          for (const P of [S.mast, S.jib, S.sail, S.hull]) drawP(c, P, pass);
          c.restore();
        }
      }
    });

    // the bird
    if (tq >= 2.0) {
      layer(28);
      const j = hand(300, 0.8), wj = hand(301, 0.5)[2] * 3;
      let b;
      if (tq >= LAND) {
        const boat = { x: bx, y: by, a: ba }, [px, py] = onBoat(boat, MAST), [fx, fy] = onBoat(boat, [-1, -219]);
        c.strokeStyle = '#3a2a22'; c.lineWidth = 2.2; c.lineCap = 'round';
        c.beginPath(); c.moveTo(px - 3, py + 12); c.lineTo(fx - 2, fy); c.moveTo(px + 5, py + 12); c.lineTo(fx + 3, fy); c.stroke();
        b = { x: px + j[0] * 0.4, y: py + j[1] * 0.4, a: ba + j[2], flip: true, h: 36 };
      } else {
        const p = birdPos(tq), q0 = birdPos(tq - 0.04), q1 = birdPos(tq + 0.04), vx = q1[0] - q0[0], vy = q1[1] - q0[1];
        const flip = vx < 0, glide = tq >= 5.3 && tq < 6.5;
        b = { x: p[0] + j[0], y: p[1] + j[1] + (glide || tq >= 7.9 ? 0 : BOB[step % 6]), a: (flip ? -1 : 1) * clamp(Math.atan2(vy, Math.abs(vx)) * 0.55, -0.45, 0.45) + j[2], flip, h: BIRDH(tq) };
      }
      const wn = (wingDeg(step) * DEG) + wj;
      b.wn = wn; b.wf = wn + 9 * DEG;
      drawBird(c, S, b, shA(b.h));
    }

    // the exposure: key light pool, the lamp dimmer, and a slightly different exposure every pose
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'multiply'; c.drawImage(S.light, 0, 0);
    const er = R(4242), lvl = FRONT(tq) * (1 - 0.2 * lamp) * (0.975 + 0.045 * (er() - 0.5)), w = 0.018 * (er() - 0.5);
    c.fillStyle = `rgb(${Math.min(255, 255 * lvl * (1 + w)) | 0},${Math.min(255, 255 * lvl) | 0},${Math.min(255, 255 * lvl * (1 - 1.4 * w)) | 0})`;
    c.fillRect(0, 0, 1080, 1920);
    if (lamp > 0) {
      c.globalCompositeOperation = 'screen';
      const g = c.createRadialGradient(msx, msy, 110, msx, msy, 460);
      g.addColorStop(0, `rgba(255,222,160,${(0.36 * lamp).toFixed(3)})`); g.addColorStop(0.35, `rgba(255,200,130,${(0.13 * lamp).toFixed(3)})`); g.addColorStop(1, 'rgba(255,190,120,0)');
      c.fillStyle = g; c.fillRect(msx - 460, msy - 460, 920, 920);
    }
    c.globalCompositeOperation = 'source-over';
  },
});
