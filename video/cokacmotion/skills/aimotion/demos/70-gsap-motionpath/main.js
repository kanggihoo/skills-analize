/*
 * 70 · 종이비행기 편지 — Canvas 2D drawn from plain JS objects that one paused GSAP timeline tweens.
 *
 * The industry pattern: GSAP never touches the canvas. It tweens ordinary objects ({ x, y, rotation, u, … });
 * frame(t) calls tl.time(t) and then paints every object from its current properties.
 *   · MotionPathPlugin moves ~26 background planes and the hero along Bézier routes fitted through waypoints
 *     (arrayToRawPath → path string), with autoRotate writing `rotation`. The same tween also tweens `u` (the
 *     arc-length progress), so frame() can sample the route at u ± ε and bank each plane from the path curvature.
 *   · CustomWiggle eases (non-random types only) give each plane turbulence: bob (px) and wobble (deg).
 *   · Planes are real folded geometry: a dart folded from the letter sheet (keel strip + wing per side), rotated
 *     in 3D (fold angles ψ, ω; heading θ; roll ρ), projected orthographically and painter-sorted. Each side shows
 *     two paper tones (keel and wing) lit by one light.
 *   · The hero loops near the camera, lands on the parapet, opens its folds in 3D (ψ, ω → 0) to lie flat facing
 *     us, then unfolds as 2D panel transforms: each crease is a line through the nose, and a panel turning about it
 *     by α projects as a scale of cos α across the crease (an affine map), so the stationery printed on the sheet
 *     can be drawn through the same matrix and clipped to the panel.
 *   · The note (Nanum Pen Script) writes itself on with a feathered wipe whose leading edge follows a GSAP
 *     stagger over per-character objects. Petals and confetti burst from behind the letter with Physics2DPlugin
 *     (friction 0: position = p0 + v·t + ½·g·t², closed form in tween time), and a slower shower falls from above.
 * Determinism: all randomness is rand(seed) at setup; the timeline is paused and only ever seeked.
 */
import { defineDemo, rand, clamp, lerp } from '../_lib/stage.js';
import { fontReady } from '../_lib/type.js';
import { gsap } from '../node_modules/gsap/index.js';
import { MotionPathPlugin } from '../node_modules/gsap/MotionPathPlugin.js';
import { CustomEase } from '../node_modules/gsap/CustomEase.js';
import { CustomWiggle } from '../node_modules/gsap/CustomWiggle.js';
import { Physics2DPlugin } from '../node_modules/gsap/Physics2DPlugin.js';

gsap.registerPlugin(MotionPathPlugin, CustomEase, CustomWiggle, Physics2DPlugin);

const D = 10, W = 1080, H = 1920;
const DEG = Math.PI / 180;
const LEDGE = 1440;                          // top of the parapet the hero lands on
const PEN = '"Nanum Pen Script"';
const NOTE = ['잘 지내지?', '여기도 봄이 왔어', '바람 편에 보낼게'];
const SIGN = '— 봄날의 옥상에서';

// ---------------------------------------------------------------- colour
const hexRGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixRGB = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const COL = {
  ink: '#2c3a6b', paper: '#fffdf7', back: '#f3e6d4', shade: '#a6a2cc', edge: '#7d76a6',
  rule: '#bcd5ee', margin: '#f3b9c6', heart: '#ef7f8f', sky: '#cfe8f6',
};
const PAPERS = ['#ffffff', '#fff3d9', '#ffe1ea', '#e0efff', '#e3f6ea', '#f1e6ff', '#fff0c4'];
const PETALS = ['#f9c4d2', '#f6aec1', '#fbd8e2', '#f8bfd0', '#fde3ea'];
const CONFETTI = ['#bfe6d0', '#fde7a6', '#bcdcf6', '#dccbf3', '#ffd0b8'];
const RGB = { paper: hexRGB(COL.paper), back: hexRGB(COL.back), shade: hexRGB(COL.shade), edge: hexRGB(COL.edge), sky: hexRGB(COL.sky) };

// ---------------------------------------------------------------- the sheet and its folds (sheet units: width 1, top edge y = 0, nose M at (0,0))
const SH = 1.3;                                       // letter height
const T22 = Math.tan(Math.PI / 8), S22 = Math.sin(Math.PI / 8), C22 = Math.cos(Math.PI / 8);
const RY = 0.5 / T22;                                 // where the 2nd fold line meets the side edge (1.2071)
const XY = 0.5 * T22;                                 // where the 2nd fold cuts the folded-over corner (0.2071)
const KEEL = 0.14;                                    // keel strip width at the tail
const CY = 0.65;                                      // sheet y of the plane's / letter's pivot (on the centre crease)
const pM = [0, 0], pA = [-0.5, 0], pB = [0.5, 0], pP = [-0.5, 0.5], pQ = [0.5, 0.5];
const pRL = [-0.5, RY], pRR = [0.5, RY], pDL = [-0.5, SH], pDR = [0.5, SH], pXL = [-0.5, XY], pXR = [0.5, XY];
// crease axes through the nose: F1 = top corners to the centre line, F2 = the new slanted edges to the centre line
const AXIS = { F1L: [-Math.SQRT1_2, Math.SQRT1_2], F1R: [Math.SQRT1_2, Math.SQRT1_2], F2L: [-S22, C22], F2R: [S22, C22] };
// flat facets of the folded sheet (S0 = unfolded coordinates) and the folds that carry them, applied in order
const PANELS = [
  { id: 'body', poly: [pM, pRL, pDL, pDR, pRR], ops: [] },
  { id: 'Lin', poly: [pM, pA, pXL], ops: ['F1L'] },
  { id: 'Rin', poly: [pM, pXR, pB], ops: ['F1R'] },
  { id: 'Lout', poly: [pM, pXL, pP], ops: ['F1L', 'F2L'] },
  { id: 'Rout', poly: [pM, pQ, pXR], ops: ['F1R', 'F2R'] },
  { id: 'Ltri', poly: [pM, pP, pRL], ops: ['F2L'] },
  { id: 'Rtri', poly: [pM, pRR, pQ], ops: ['F2R'] },
];

/** rotate vector v about the in-plane axis e (through the nose) by angle a, lifting the w side toward +z */
function hinge(v, e, w, a) {
  const al = v[0] * e[0] + v[1] * e[1], b = v[0] * w[0] + v[1] * w[1], c = v[2];
  const ca = Math.cos(a), sa = Math.sin(a), b2 = b * ca - c * sa, c2 = b * sa + c * ca;
  return [al * e[0] + b2 * w[0], al * e[1] + b2 * w[1], c2];
}
// each panel's "lift" direction per fold: from the crease toward the panel (computed with earlier folds closed)
for (const pn of PANELS) {
  pn.w = [];
  let cx = pn.poly.reduce((s, p) => s + p[0], 0) / pn.poly.length, cy = pn.poly.reduce((s, p) => s + p[1], 0) / pn.poly.length;
  let cen = [cx, cy, 0];
  for (const op of pn.ops) {
    const e = AXIS[op], al = cen[0] * e[0] + cen[1] * e[1];
    let wx = cen[0] - al * e[0], wy = cen[1] - al * e[1];
    const l = Math.hypot(wx, wy); wx /= l; wy /= l;
    pn.w.push([wx, wy]);
    cen = hinge(cen, e, [wx, wy], Math.PI);
  }
}
/** a panel's projection as a linear map (columns = images of the x and y unit vectors) and its normal */
function panelMap(pn, k) {
  let ex = [1, 0, 0], ey = [0, 1, 0], n = [0, 0, 1];
  pn.ops.forEach((op, j) => {
    const a = Math.PI * k[op.slice(0, 2)];
    if (!a) return;
    const e = AXIS[op], w = pn.w[j];
    ex = hinge(ex, e, w, a); ey = hinge(ey, e, w, a); n = hinge(n, e, w, a);
  });
  return { m: [ex[0], ex[1], ey[0], ey[1]], n, lift: Math.max(0, ...pn.ops.map((op) => Math.sin(Math.PI * k[op.slice(0, 2)]))) };
}

// ---------------------------------------------------------------- the folded dart in 3D
// plane-local axes: X forward (nose at X = CY), Y left, Z up. Per side: the keel strip (centre crease → keel line)
// turns about the centre crease by ψ; the wing turns about the keel line by ω first. Flight: ψ = −90°, ω = −90° + dihedral.
const KL = Math.hypot(SH, KEEL), KE = [-SH / KL, KEEL / KL], KV = [KEEL / KL, SH / KL];
const DART = [
  { wing: false, poly: [pM, [-KEEL, SH], [0, SH]] },
  { wing: true, poly: [pM, pRL, pDL, [-KEEL, SH]] },
];
function dartFacets(psi, om) {
  const cp = Math.cos(psi), sp = Math.sin(psi), co = Math.cos(om), so = Math.sin(om);
  const out = [];
  for (const side of [-1, 1]) {
    for (const f of DART) {
      const pts = f.poly.map(([x, y]) => {
        let X = CY - y, s = Math.abs(x), n = 0;
        if (f.wing) {
          const rx = X - CY, al = rx * KE[0] + s * KE[1], d = rx * KV[0] + s * KV[1];
          X = CY + KE[0] * al + KV[0] * d * co; s = KE[1] * al + KV[1] * d * co; n = d * so;
        }
        const Y = s * cp + n * sp, Z = -s * sp + n * cp;
        return [X, side < 0 ? Y : -Y, Z];
      });
      let nx = 0, ns = 0, nn = 1;
      if (f.wing) { nx = -KV[0] * so; ns = -KV[1] * so; nn = co; }
      const nY = ns * cp + nn * sp, nZ = -ns * sp + nn * cp;
      out.push({ pts, n: [nx, side < 0 ? nY : -nY, nZ] });
    }
  }
  return out;
}
const DIHEDRAL = 9 * DEG;
const FLIGHT = dartFacets(-90 * DEG, -90 * DEG + DIHEDRAL);
const UNIT = 130;                                       // px per sheet unit at scale 1 (plane ≈ 170 px long)
const RHO0 = 58 * DEG;                                  // how far we look down onto the planes
const LIGHT = (() => { const v = [-0.3, -0.55, 0.78], l = Math.hypot(...v); return v.map((c) => c / l); })();

function tone(n, paper, back) {
  let [x, y, z] = n, isBack = false;
  if (z < 0) { x = -x; y = -y; z = -z; isBack = true; }
  const d = Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
  return mixRGB(RGB.shade, isBack ? back : paper, clamp(0.4 + 0.66 * d, 0, 1));
}

/** project and paint a dart: o = { cx, cy, unit, theta, rho, sdir, paper, back, alpha } */
function drawDart(ctx, facets, o) {
  const ct = Math.cos(o.theta), st = Math.sin(o.theta), cr = Math.cos(o.rho), sr = Math.sin(o.rho);
  const f = [ct, st, 0], u = [o.sdir * st * cr, -o.sdir * ct * cr, sr];
  const l = [f[1] * u[2] - f[2] * u[1], f[2] * u[0] - f[0] * u[2], f[0] * u[1] - f[1] * u[0]];   // geometric left (screen y is down)
  const list = facets.map((fc) => {
    const pts = []; let z = 0;
    for (const [X, Y, Z] of fc.pts) {
      pts.push(o.cx + o.unit * (X * f[0] + Y * l[0] + Z * u[0]), o.cy + o.unit * (X * f[1] + Y * l[1] + Z * u[1]));
      z += Y * l[2] + Z * u[2];
    }
    const [a, b, c] = fc.n;
    const N = [a * f[0] + b * l[0] + c * u[0], a * f[1] + b * l[1] + c * u[1], b * l[2] + c * u[2]];
    return { pts, z, col: tone(N, o.paper, o.back) };
  });
  list.sort((p, q) => p.z - q.z);
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(0.7, o.unit * 0.008);
  for (const fc of list) {
    const p = fc.pts;
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
    ctx.closePath();
    ctx.fillStyle = css(fc.col, o.alpha);
    ctx.fill();
    ctx.strokeStyle = css(mixRGB(fc.col, RGB.edge, 0.5), o.alpha * 0.85);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------- routes
const P2 = (pts) => MotionPathPlugin.arrayToRawPath(pts.map(([x, y]) => ({ x, y })), { curviness: 1 });
function route(pts) {
  const raw = P2(pts);
  const d = MotionPathPlugin.rawPathToString(raw);
  MotionPathPlugin.cacheRawPathMeasurements(raw);
  return { raw, d, len: raw.totalLength };
}
const probe = {};
/** bank (rad) from the curvature of the route at arc-length progress u */
function bankAt(r, u) {
  const e = 0.006;
  const a = MotionPathPlugin.getPositionOnPath(r.raw, clamp(u - e, 0, 1), true, probe).angle;
  const b = MotionPathPlugin.getPositionOnPath(r.raw, clamp(u + e, 0, 1), true, probe).angle;
  const dth = ((((b - a) % 360) + 540) % 360) - 180;
  return clamp((dth * DEG) / (2 * e * r.len) * 90, -0.42, 0.42);
}

// hero: waypoints [x, y, scale]; scale is read back by arc-length progress
const HERO = [
  [-160, 380, 0.3], [140, 420, 0.42], [330, 560, 0.62], [430, 760, 0.9], [680, 700, 1.15], [760, 470, 1.35],
  [580, 300, 1.45], [360, 380, 1.45], [330, 600, 1.38], [470, 770, 1.3], [640, 860, 1.22], [720, 1040, 1.16],
  [720, 1230, 1.13], [745, 1365, 1.12], [800, 1431, 1.12], [850, 1437, 1.12],
];
const LAND = [850, 1437];
const U0_C = [600, 1180], U0_UNIT = 230;                // where the opened dart hands over to the flat 2D letter
const LETTER_C = [540, 840], LETTER_UNIT = 690;         // the read letter: 690 × 897 px
const CS = LETTER_UNIT;                                  // stationery is pre-rendered at the read size

// ---------------------------------------------------------------- baked scenery
function bakeScene() {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const rnd = rand(70);
  // sky
  const sky = g.createLinearGradient(0, 0, 0, 1460);
  sky.addColorStop(0, '#8ccbef'); sky.addColorStop(0.42, '#c3e5f6'); sky.addColorStop(0.7, '#f7e4dc'); sky.addColorStop(1, '#fde9c8');
  g.fillStyle = sky; g.fillRect(0, 0, W, 1470);
  // sun
  const sun = [230, 300];
  const halo = g.createRadialGradient(sun[0], sun[1], 60, sun[0], sun[1], 360);
  halo.addColorStop(0, 'rgba(255,250,224,0.9)'); halo.addColorStop(1, 'rgba(255,250,224,0)');
  g.fillStyle = halo; g.fillRect(0, 0, 700, 760);
  g.fillStyle = '#fff6d6'; g.beginPath(); g.arc(sun[0], sun[1], 78, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,240,200,0.8)'; g.lineWidth = 3;
  for (const r of [104, 122]) { g.beginPath(); g.arc(sun[0], sun[1], r, 0, Math.PI * 2); g.stroke(); }
  // far skyline
  let x = -20;
  while (x < W) {
    const w = 40 + rnd() * 90, top = 1150 + rnd() * 110;
    g.fillStyle = '#cdd2ec'; g.fillRect(x, top, w + 1, 1470 - top);
    g.fillStyle = 'rgba(255,255,255,0.35)';
    for (let wy = top + 14; wy < 1400; wy += 22) for (let wx = x + 8; wx < x + w - 8; wx += 16) if (rnd() < 0.5) g.fillRect(wx, wy, 6, 8);
    x += w + rnd() * 6;
  }
  // mid city: two rows of pastel buildings with windows, side shading and roof furniture
  const pastel = ['#f6c6a8', '#bfe3cf', '#f7e2a0', '#d9c8ee', '#bcd8ef', '#f5c2cf', '#cfe7b8'];
  for (const [row, yTop, yVar, light] of [[0, 1200, 90, 0.25], [1, 1270, 90, 0]]) {
    x = -30 + row * 40;
    while (x < W + 20) {
      const w = 90 + rnd() * 110, top = yTop + rnd() * yVar;
      const base = mixRGB(hexRGB(pastel[(rnd() * pastel.length) | 0]), [255, 255, 255], light);
      g.fillStyle = css(base); g.fillRect(x, top, w, 1470 - top);
      g.fillStyle = css(mixRGB(base, [120, 110, 170], 0.18)); g.fillRect(x + w - 14, top, 14, 1470 - top);
      g.fillStyle = css(mixRGB(base, [255, 255, 255], 0.5)); g.fillRect(x - 3, top - 6, w + 6, 8);
      const win = mixRGB(base, [110, 130, 190], 0.32), lit = [255, 247, 220];
      for (let wy = top + 22; wy < 1440; wy += 34) {
        for (let wx = x + 12; wx < x + w - 26; wx += 26) {
          g.fillStyle = css(rnd() < 0.18 ? lit : win, 0.9);
          g.beginPath(); g.roundRect(wx, wy, 14, 20, 3); g.fill();
        }
      }
      const r = rnd();
      if (r < 0.28) {            // water tower
        const tx = x + w * 0.5, ty = top - 8;
        g.strokeStyle = css(mixRGB(base, [80, 70, 110], 0.45)); g.lineWidth = 3;
        g.beginPath(); g.moveTo(tx - 14, ty); g.lineTo(tx - 10, ty - 22); g.moveTo(tx + 14, ty); g.lineTo(tx + 10, ty - 22); g.stroke();
        g.fillStyle = css(mixRGB(base, [150, 110, 100], 0.35));
        g.beginPath(); g.roundRect(tx - 17, ty - 58, 34, 38, 4); g.fill();
        g.beginPath(); g.moveTo(tx - 20, ty - 56); g.lineTo(tx, ty - 72); g.lineTo(tx + 20, ty - 56); g.fill();
      } else if (r < 0.5) {      // antenna
        const tx = x + w * (0.3 + rnd() * 0.4);
        g.strokeStyle = 'rgba(110,100,150,0.7)'; g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(tx, top - 6); g.lineTo(tx, top - 70); g.moveTo(tx - 12, top - 52); g.lineTo(tx + 12, top - 52); g.moveTo(tx - 8, top - 38); g.lineTo(tx + 8, top - 38); g.stroke();
      } else if (r < 0.72) {     // rooftop trees
        for (let k = 0; k < 2; k++) {
          g.fillStyle = k ? '#8fcf9a' : '#74bd86';
          g.beginPath(); g.arc(x + w * (0.35 + k * 0.3), top - 18 - k * 4, 20 + rnd() * 6, 0, Math.PI * 2); g.fill();
        }
      }
      x += w + 4 + rnd() * 16;
    }
  }
  // foreground roof: parapet cap and the dark wall that carries the caption
  const wall = g.createLinearGradient(0, LEDGE, 0, H);
  wall.addColorStop(0, '#7b4c5e'); wall.addColorStop(0.35, '#5c3a4e'); wall.addColorStop(1, '#3a273a');
  g.fillStyle = wall; g.fillRect(0, LEDGE + 18, W, H - LEDGE);
  g.strokeStyle = 'rgba(255,220,230,0.07)'; g.lineWidth = 2;
  for (let by = LEDGE + 44, r = 0; by < H; by += 30, r++) {
    g.beginPath(); g.moveTo(0, by); g.lineTo(W, by); g.stroke();
    for (let bx = (r % 2) * 40; bx < W; bx += 80) { g.beginPath(); g.moveTo(bx, by - 30); g.lineTo(bx, by); g.stroke(); }
  }
  g.fillStyle = '#e8c9b4'; g.fillRect(0, LEDGE + 6, W, 16);         // cap front
  g.fillStyle = '#f7e9d8'; g.fillRect(0, LEDGE - 4, W, 12);         // cap top
  g.fillStyle = 'rgba(70,40,60,0.25)'; g.fillRect(0, LEDGE + 22, W, 10);
  // flag pole for the bunting
  g.fillStyle = '#6b4a63'; g.fillRect(36, 1150, 8, LEDGE - 1146);
  g.fillStyle = '#f2b6a0'; g.beginPath(); g.arc(40, 1148, 9, 0, Math.PI * 2); g.fill();
  // potted plants on the parapet
  for (const [px, s, col] of [[118, 1, '#7cc08c'], [196, 0.8, '#94cf8e'], [990, 0.9, '#7cc08c']]) {
    g.fillStyle = col;
    for (const [dx, dy, r] of [[-18, -52, 22], [14, -60, 24], [0, -80, 22], [-4, -40, 18], [20, -38, 16]]) { g.beginPath(); g.arc(px + dx * s, LEDGE + dy * s, r * s, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = 'rgba(40,90,60,0.18)';
    g.beginPath(); g.arc(px + 10 * s, LEDGE - 46 * s, 18 * s, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d9785a';
    g.beginPath(); g.moveTo(px - 26 * s, LEDGE - 34 * s); g.lineTo(px + 26 * s, LEDGE - 34 * s); g.lineTo(px + 19 * s, LEDGE - 2); g.lineTo(px - 19 * s, LEDGE - 2); g.fill();
    g.fillStyle = '#e8957a'; g.fillRect(px - 29 * s, LEDGE - 40 * s, 58 * s, 10 * s);
  }
  return c;
}

function cloudSprite(w, seed) {
  const h = w * 0.42, c = document.createElement('canvas');
  c.width = Math.ceil(w + 20); c.height = Math.ceil(h + 20);
  const g = c.getContext('2d'), rnd = rand(seed);
  const puffs = [];
  for (let i = 0; i < 6; i++) {
    const px = 10 + w * (0.15 + 0.7 * i / 5), r = h * (0.32 + 0.34 * Math.sin(Math.PI * (i + 0.5) / 6)) * (0.85 + rnd() * 0.3);
    puffs.push([px, 10 + h - r, r]);
  }
  const blob = (dy, col) => {
    g.fillStyle = col;
    g.beginPath();
    for (const [px, py, r] of puffs) { g.moveTo(px + r, py + dy); g.arc(px, py + dy, r, 0, Math.PI * 2); }
    g.roundRect(10 + w * 0.08, 10 + h * 0.55 + dy, w * 0.84, h * 0.45, h * 0.22);
    g.fill();
  };
  blob(0, '#e3e1f4');
  g.save(); g.beginPath(); g.rect(0, 0, c.width, 10 + h * 0.8); g.clip(); blob(-h * 0.1, '#ffffff'); g.restore();
  return c;
}

// petal: cherry blossom with a notched tip (unit size, tip up)
function petalPath(g, s) {
  g.beginPath();
  g.moveTo(0, 0.5 * s);
  g.bezierCurveTo(-0.6 * s, 0.25 * s, -0.5 * s, -0.38 * s, -0.13 * s, -0.5 * s);
  g.lineTo(0, -0.38 * s);
  g.lineTo(0.13 * s, -0.5 * s);
  g.bezierCurveTo(0.5 * s, -0.38 * s, 0.6 * s, 0.25 * s, 0, 0.5 * s);
  g.closePath();
}

// ---------------------------------------------------------------- stationery (front of the sheet, in S0 coordinates)
const BASE = [0.36, 0.53, 0.70];                  // baselines of the three note lines (sheet y)
const sx = (x) => (x + 0.5) * CS, sy = (y) => y * CS;
function bakeStationery() {
  const c = document.createElement('canvas'); c.width = CS; c.height = Math.round(SH * CS);
  const g = c.getContext('2d');
  g.strokeStyle = COL.rule; g.lineWidth = 2.5;
  for (let y = BASE[0]; y < SH - 0.05; y += 0.17) { g.beginPath(); g.moveTo(sx(-0.42), sy(y) + 8); g.lineTo(sx(0.44), sy(y) + 8); g.stroke(); }
  g.strokeStyle = COL.margin; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(sx(-0.36), sy(0.05)); g.lineTo(sx(-0.36), sy(SH - 0.04)); g.stroke();
  // the old creases of the flight folds, faint
  g.strokeStyle = 'rgba(120,110,160,0.10)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(sx(0), 0); g.lineTo(sx(0), sy(SH));
  g.moveTo(sx(0), 0); g.lineTo(sx(-KEEL), sy(SH)); g.moveTo(sx(0), 0); g.lineTo(sx(KEEL), sy(SH)); g.stroke();
  // stamp on the top-right corner (it sits on a nose flap, so it only appears when that flap opens)
  const s0 = [sx(0.255), sy(0.055)], sw = 0.155 * CS, sh = 0.185 * CS;
  g.fillStyle = '#ffffff';
  g.fillRect(s0[0], s0[1], sw, sh);
  g.fillStyle = COL.paper;
  for (let i = 0; i <= 8; i++) {
    for (const [px, py] of [[s0[0] + i * sw / 8, s0[1]], [s0[0] + i * sw / 8, s0[1] + sh], [s0[0], s0[1] + i * sh / 8], [s0[0] + sw, s0[1] + i * sh / 8]]) {
      g.beginPath(); g.arc(px, py, 4.5, 0, Math.PI * 2); g.fill();
    }
  }
  const ix = s0[0] + 12, iy = s0[1] + 12, iw = sw - 24, ih = sh - 24;
  const sg = g.createLinearGradient(0, iy, 0, iy + ih); sg.addColorStop(0, '#9fd3f2'); sg.addColorStop(1, '#fde4cf');
  g.fillStyle = sg; g.fillRect(ix, iy, iw, ih);
  g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(ix + iw * 0.28, iy + ih * 0.3, iw * 0.14, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f5b8c6'; g.beginPath(); g.ellipse(ix + iw * 0.5, iy + ih, iw * 0.7, ih * 0.28, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(ix + iw * 0.85, iy + ih * 0.42); g.lineTo(ix + iw * 0.45, iy + ih * 0.5); g.lineTo(ix + iw * 0.6, iy + ih * 0.56); g.closePath(); g.fill();
  g.fillStyle = '#d7d2ee'; g.beginPath(); g.moveTo(ix + iw * 0.85, iy + ih * 0.42); g.lineTo(ix + iw * 0.6, iy + ih * 0.56); g.lineTo(ix + iw * 0.6, iy + ih * 0.66); g.closePath(); g.fill();
  // postmark across the stamp's left edge
  g.strokeStyle = 'rgba(44,58,107,0.35)'; g.lineWidth = 2.5;
  const pm = [s0[0] - 8, s0[1] + sh * 0.55];
  g.beginPath(); g.arc(pm[0], pm[1], 40, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(pm[0], pm[1], 31, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 3; k++) {
    g.beginPath();
    for (let i = 0; i <= 20; i++) { const xx = pm[0] - 110 + i * 5.5, yy = pm[1] - 14 + k * 14 + Math.sin(i * 0.9) * 3.5; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
    g.stroke();
  }
  return c;
}

/** one line of handwriting pre-rendered, with the x position where each character ends (for the wipe) */
function bakeLine(text, size, align, x, base) {
  const font = `400 ${size}px ${PEN}`;
  const m = document.createElement('canvas').getContext('2d');
  m.font = font;
  const w = Math.ceil(m.measureText(text).width) + 24, h = Math.ceil(size * 1.45);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.font = font; g.fillStyle = COL.ink; g.textBaseline = 'alphabetic';
  g.fillText(text, 6, size * 1.05);
  const chars = Array.from(text);
  const cuts = chars.map((_, i) => 6 + m.measureText(chars.slice(0, i + 1).join('')).width);
  const left = align === 'right' ? sx(x) - (w - 18) : sx(x);
  return { img: c, w, h, left, top: sy(base) - size * 1.05, cuts, chars: chars.map(() => ({ r: 0 })) };
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '70-gsap-motionpath',
  title: '종이비행기 편지',
  tech: 'GSAP MotionPath(캔버스 객체) · CustomWiggle · Physics2D',
  duration: D,
  background: '#8ccbef',

  async setup(api) {
    await fontReady(`400 86px ${PEN}`, NOTE.join('') + SIGN);
    const { ctx } = api.canvas({ type: '2d' });
    const scene = bakeScene();
    const clouds = [[cloudSprite(300, 1), 700, 210, 26], [cloudSprite(220, 2), 60, 560, 18], [cloudSprite(180, 3), 860, 820, 14], [cloudSprite(140, 4), 380, 150, 10], [cloudSprite(240, 5), 520, 980, 12]];
    const paper = bakeStationery();

    // note lines: size shrinks if a line would run past the right margin
    let size = 88;
    const meas = document.createElement('canvas').getContext('2d');
    for (const s of NOTE) { meas.font = `400 ${size}px ${PEN}`; while (meas.measureText(s).width > 0.74 * CS && size > 50) { size -= 2; meas.font = `400 ${size}px ${PEN}`; } }
    const lines = NOTE.map((s, i) => bakeLine(s, size, 'left', -0.31, BASE[i]));
    const sign = bakeLine(SIGN, Math.round(size * 0.68), 'right', 0.41, 0.88);
    lines.push(sign);
    const l3 = lines[2];
    const heartAt = [l3.left + l3.cuts[l3.cuts.length - 1] + 0.05 * CS, sy(BASE[2]) - 0.05 * CS];

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut', lazy: false } });
    const wig = (n, type = 'uniform') => CustomWiggle.create(`w70_${n}_${type}`, { wiggles: n, type });

    // ---------------- background planes: seamless loops (period D or D/2), MotionPath + autoRotate + `u`
    const prnd = rand(7070);
    const planes = [];
    const N = 26;
    for (let i = 0; i < N; i++) {
      const z = 0.06 + 0.94 * ((i + prnd() * 0.8) / N);         // depth: drawn far → near
      const dir = prnd() < 0.7 ? 1 : -1;
      const y0 = 120 + prnd() * (z > 0.6 ? 820 : 900), climb = (prnd() - 0.5) * 120;
      const xs = [-220, 120, 540, 960, 1300];
      let pts = xs.map((x, k) => [x, y0 + climb * (k / 4) + (prnd() - 0.5) * 110]);
      if (i === 9 || i === 19) {                                 // a couple of show-offs loop the loop
        const [mx, my] = pts[2];
        pts.splice(2, 1, [mx - 60, my], [mx + 40, my - 30], [mx + 60, my - 120], [mx - 10, my - 170], [mx - 70, my - 110], [mx - 30, my - 30], [mx + 80, my + 10]);
      }
      if (dir < 0) pts = pts.reverse().map(([x, y]) => [x, y]);
      const r = route(pts);
      const n = z > 0.55 ? 2 : 1, P = D / n, phi = 0.03 + prnd() * 0.94;
      const st = { x: 0, y: 0, rotation: 0, u: phi, bob: 0, wob: 0 };
      const paper = mixRGB(hexRGB(PAPERS[(prnd() * PAPERS.length) | 0]), RGB.sky, (1 - z) * 0.42);
      const back = mixRGB(paper, [205, 190, 175], 0.25);
      const sub = gsap.timeline({ repeat: n - 1, defaults: { lazy: false } });
      sub.to(st, { motionPath: { path: r.d, start: phi, end: 1, autoRotate: true }, u: 1, duration: P * (1 - phi), ease: 'none' })
        .set(st, { u: 0 })
        .to(st, { motionPath: { path: r.d, start: 0, end: phi, autoRotate: true }, u: phi, duration: P * phi, ease: 'none' });
      tl.add(sub, 0);
      tl.to(st, { bob: 4 + 12 * z, duration: D, ease: wig(4 + (i % 5)) }, 0);
      tl.to(st, { wob: 3 + 4 * z, duration: D, ease: wig(5 + (i % 4), 'uniform') }, 0);
      planes.push({ st, r, z, dir, scale: 0.2 + 0.62 * z, paper, back });
    }

    // ---------------- hero: approach, near-camera loop, landing
    const hr = route(HERO);
    // arc-length progress of each waypoint (searching forward, so the loop's crossing cannot confuse it)
    const samples = 3000, hu = [0];
    let from = 0;
    for (let k = 1; k < HERO.length; k++) {
      let best = from, bd = Infinity;
      for (let s = from; s <= samples; s++) {
        const p = MotionPathPlugin.getPositionOnPath(hr.raw, s / samples, false, probe);
        const d = Math.hypot(p.x - HERO[k][0], p.y - HERO[k][1]);
        if (d < bd) { bd = d; best = s; }
        if (d > bd + 60) break;
      }
      hu.push(best / samples); from = best;
    }
    hu[hu.length - 1] = 1;
    const heroScale = (u) => {
      let k = 1;
      while (k < hu.length - 1 && u > hu[k]) k++;
      const a = hu[k - 1], b = hu[k], q = clamp((u - a) / Math.max(1e-6, b - a));
      return lerp(HERO[k - 1][2], HERO[k][2], q * q * (3 - 2 * q));
    };
    const A0 = MotionPathPlugin.getPositionOnPath(hr.raw, 0.0005, true, probe).angle;
    const Hs = { x: HERO[0][0], y: HERO[0][1], rotation: A0, hu: 0, bob: 0, wob: 0, zoom: 1, top: 0, flat: 0, on: 1, puff: 0 };
    const FLY0 = 0.2, FLY1 = 4.45;
    tl.to(Hs, { motionPath: { path: hr.d, autoRotate: true }, hu: 1, duration: FLY1 - FLY0, ease: 'sine.inOut' }, FLY0);
    tl.to(Hs, { bob: 11, duration: 3.9, ease: wig(7, 'easeInOut') }, FLY0);
    tl.to(Hs, { wob: 5, duration: 3.9, ease: wig(9, 'easeInOut') }, FLY0);
    // touchdown: skid, nose bump that settles, a puff of speed lines
    tl.to(Hs, { x: LAND[0] + 52, duration: 0.45, ease: 'power3.out' }, FLY1);
    tl.to(Hs, { wob: -7, duration: 0.5, ease: wig(3, 'easeOut') }, FLY1);
    tl.to(Hs, { puff: 1, duration: 0.42, ease: 'power1.out' }, FLY1 - 0.02);
    // 3D unfold: dip (anticipation), lift toward us, open the folds, turn nose-up, face the camera
    const U0 = 4.92, TS = 5.32;
    tl.to(Hs, { y: LAND[1] + 9, duration: 0.12, ease: 'power1.in' }, U0);
    tl.to(Hs, { x: U0_C[0], duration: TS - U0, ease: 'power2.inOut' }, U0);
    tl.to(Hs, { y: U0_C[1], duration: TS - U0 - 0.12, ease: 'power2.out' }, U0 + 0.12);
    tl.to(Hs, { rotation: -90, duration: TS - U0, ease: 'power2.inOut' }, U0);
    tl.to(Hs, { top: 1, flat: 1, zoom: U0_UNIT / (UNIT * heroScale(1)), duration: TS - U0, ease: 'power2.inOut' }, U0);
    tl.set(Hs, { on: 0 }, TS);

    // ---------------- 2D letter: panel flips, rise to the reading position, float
    const LF = { on: 0, cx: U0_C[0], cy: U0_C[1], unit: U0_UNIT, rot: 0, k: { F1: 1, F2: 1 }, content: 0, lift: 0, bob: 0, sway: 0 };
    tl.set(LF, { on: 1 }, TS);
    tl.to(LF.k, { F2: 0, duration: 0.38, ease: 'power2.inOut' }, TS + 0.02);
    tl.to(LF.k, { F1: 0, duration: 0.36, ease: 'power2.inOut' }, TS + 0.38);
    tl.to(LF, { content: 1, duration: 0.45, ease: 'power1.inOut' }, TS + 0.08);
    const RISE = CustomEase.create('rise70', 'M0,0 C0.22,0.02 0.36,0.3 0.52,0.74 0.62,1 0.72,1.04 0.82,1.018 0.9,1.004 0.95,1 1,1');
    tl.to(LF, { cx: LETTER_C[0], cy: LETTER_C[1], unit: LETTER_UNIT, duration: 1.43, ease: RISE }, TS);
    tl.to(LF, { rot: -2.4, duration: 0.75, ease: 'power2.out' }, TS + 0.68);
    tl.to(LF, { lift: 1, duration: 0.9, ease: 'power1.inOut' }, TS + 0.38);
    const FLOAT = TS + 1.43;
    tl.to(LF, { bob: 7, duration: D - FLOAT, ease: wig(3) }, FLOAT);
    tl.to(LF, { sway: 0.7, duration: D - FLOAT, ease: wig(2) }, FLOAT);

    // ---------------- handwriting: one stagger per line over per-character objects
    const HEART = { p: 0 };
    let at = TS + 0.95;                                         // starts while the letter is still settling
    for (const [i, ln] of lines.entries()) {
      const per = i === 3 ? 0.045 : 0.06;                       // seconds between characters
      tl.to(ln.chars, { r: 1, duration: 0.2, stagger: per, ease: 'power1.inOut' }, at);
      at += ln.chars.length * per + 0.2 + (i === 2 ? 0.2 : 0.1);
      if (i === 2) tl.to(HEART, { p: 1, duration: 0.42, ease: 'power1.inOut' }, at - 0.3);   // a doodle after the last line
    }

    // ---------------- petals & confetti: Physics2D (friction 0 → closed form in time)
    const rr = rand(2026);
    const petals = [];
    const BURST = TS + 0.66;
    for (let i = 0; i < 96; i++) {
      const tp = 0.85 + rr() * 0.7, hpk = 260 + rr() * 640;
      const vy = 2 * hpk / tp, g = 2 * hpk / (tp * tp), vx = (rr() - 0.5) * 1100;
      const p = { x: LETTER_C[0] + (rr() - 0.5) * 360, y: LETTER_C[1] + 120 + (rr() - 0.5) * 300, rot: rr() * 360, on: 0,
        t0: BURST + rr() * 0.12, front: i % 2 === 1, conf: rr() < 0.3, s: 13 + rr() * 12,
        fa: 10 + rr() * 22, fw: 2 + rr() * 3, tw: 3 + rr() * 5, ph: rr() * 6.28, col: 0 };
      p.col = p.conf ? CONFETTI[(rr() * CONFETTI.length) | 0] : PETALS[(rr() * PETALS.length) | 0];
      tl.set(p, { on: 1 }, p.t0);
      tl.to(p, { physics2D: { velocity: Math.hypot(vx, vy), angle: Math.atan2(-vy, vx) / DEG, gravity: g }, rot: p.rot + (rr() - 0.5) * 720, duration: D - p.t0, ease: 'none' }, p.t0);
      petals.push(p);
    }
    for (let i = 0; i < 44; i++) {
      const p = { x: -40 + rr() * 1160, y: -30 - rr() * 260, rot: rr() * 360, on: 0, t0: BURST + 0.3 + rr() * 1.6, front: rr() < 0.4, conf: rr() < 0.25,
        s: 12 + rr() * 11, fa: 14 + rr() * 26, fw: 1.5 + rr() * 2, tw: 2 + rr() * 4, ph: rr() * 6.28, col: 0 };
      p.col = p.conf ? CONFETTI[(rr() * CONFETTI.length) | 0] : PETALS[(rr() * PETALS.length) | 0];
      tl.set(p, { on: 1 }, p.t0);
      tl.to(p, { physics2D: { velocity: 60 + rr() * 90, angle: 75 + rr() * 30, gravity: 30 + rr() * 40 }, rot: p.rot + (rr() - 0.5) * 400, duration: D - p.t0, ease: 'none' }, p.t0);
      petals.push(p);
    }
    tl.to({}, { duration: 0.001 }, D - 0.001);

    // pre-roll so every tween records its start values here, in timeline order
    tl.time(D);
    tl.time(0);

    Object.assign(this, { ctx, scene, clouds, paper, lines, heartAt, tl, planes, hr, heroScale, Hs, LF, HEART, petals });
  },

  frame(t) {
    const { ctx, tl, Hs, LF } = this;
    tl.time(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.scene, 0, 0);
    for (const [img, x, y, drift] of this.clouds) ctx.drawImage(img, x + drift * t, y);

    // background planes, far → near
    for (const pl of this.planes) {
      const s = pl.st;
      drawDart(ctx, FLIGHT, {
        cx: s.x, cy: s.y + s.bob, unit: UNIT * pl.scale, theta: (s.rotation + s.wob) * DEG,
        rho: RHO0 - bankAt(pl.r, s.u) * pl.dir, sdir: pl.dir, paper: pl.paper, back: pl.back, alpha: 1,
      });
    }
    drawBunting(ctx, t);
    this.drawPetals(false, t);

    if (Hs.on) {
      const sc = this.heroScale(Hs.hu) * Hs.zoom, unit = UNIT * sc;
      // contact shadow on the parapet as it comes in to land
      const near = clamp(1 - Math.abs(LEDGE - Hs.y) / 260) * (1 - Hs.top);
      if (near > 0) {
        ctx.fillStyle = `rgba(90,50,70,${0.22 * near})`;
        ctx.beginPath(); ctx.ellipse(Hs.x - unit * 0.05, LEDGE + 1, unit * 0.62, unit * 0.06, 0, 0, Math.PI * 2); ctx.fill();
      }
      if (Hs.puff > 0 && Hs.puff < 1) {
        ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - Hs.puff)})`; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          const x0 = LAND[0] - 90 - i * 18 - Hs.puff * 50, y0 = LEDGE - 12 - i * 13;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 - 34 + i * 6, y0); ctx.stroke();
        }
      }
      const psi = lerp(-90 * DEG, 0, Hs.flat), om = lerp(-90 * DEG + DIHEDRAL, 0, Hs.flat);
      drawDart(ctx, Hs.flat > 0 ? dartFacets(psi, om) : FLIGHT, {
        cx: Hs.x, cy: Hs.y + Hs.bob, unit, theta: (Hs.rotation + Hs.wob) * DEG,
        rho: lerp(RHO0 - bankAt(this.hr, Hs.hu), 90 * DEG, Hs.top), sdir: 1, paper: RGB.paper, back: RGB.back, alpha: 1,
      });
    }
    if (LF.on) this.drawLetter();
    this.drawPetals(true, t);
  },

  /** the sheet in 2D: panels turning about their creases, stationery clipped to each front-facing panel */
  drawLetter() {
    const { ctx, LF } = this;
    const a = (LF.rot + LF.sway) * DEG, ca = Math.cos(a), sa = Math.sin(a), U = LF.unit;
    const ox = LF.cx - U * (-sa * CY), oy = LF.cy + LF.bob - U * (ca * CY);        // screen position of sheet (0, 0)
    const toScreen = (m, x, y) => {
      const px = m[0] * x + m[2] * y, py = m[1] * x + m[3] * y;
      return [ox + U * (ca * px - sa * py), oy + U * (sa * px + ca * py)];
    };
    const maps = new Map(PANELS.map((pn) => [pn, panelMap(pn, LF.k)]));
    // soft shadow under the sheet (stack of offset silhouettes) once it is lifting toward us
    if (LF.lift > 0) {
      for (const [dx, dy, al] of [[10, 16, 0.07], [18, 30, 0.05], [28, 46, 0.035]]) {
        ctx.fillStyle = `rgba(70,50,90,${al * LF.lift})`;
        for (const pn of PANELS) {
          const { m } = maps.get(pn);
          ctx.beginPath();
          pn.poly.forEach(([x, y], i) => { const [X, Y] = toScreen(m, x, y); i ? ctx.lineTo(X + dx * LF.lift, Y + dy * LF.lift) : ctx.moveTo(X + dx * LF.lift, Y + dy * LF.lift); });
          ctx.fill();
        }
      }
    }
    // layer order: the F2 stack reverses when its panels pass edge-on
    const byId = Object.fromEntries(PANELS.map((p) => [p.id, p]));
    const f2 = LF.k.F2 >= 0.5 ? ['Lout', 'Rout', 'Ltri', 'Rtri'] : ['Ltri', 'Rtri', 'Lout', 'Rout'];
    ctx.lineJoin = 'round';
    for (const id of ['body', 'Lin', 'Rin', ...f2]) {
      const pn = byId[id], { m, n, lift } = maps.get(pn);
      const pts = pn.poly.map(([x, y]) => toScreen(m, x, y));
      const path = () => { ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.closePath(); };
      if (lift > 0.02 && lift < 0.999) {                       // a turning panel shades what lies under it
        ctx.fillStyle = `rgba(70,50,90,${0.14 * lift})`;
        ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X + 10 * lift, Y + 14 * lift) : ctx.moveTo(X + 10 * lift, Y + 14 * lift))); ctx.fill();
      }
      path();
      ctx.fillStyle = css(tone(n, RGB.paper, RGB.back));
      ctx.fill();
      if (n[2] > 0 && LF.content > 0) {
        // stationery through the same affine map: image px → sheet coords → panel map → screen
        ctx.save();
        ctx.clip();
        const A = [m[0] / CS, m[1] / CS, m[2] / CS, m[3] / CS];
        const [tx, ty] = toScreen(m, -0.5, 0);
        ctx.setTransform(U * (ca * A[0] - sa * A[1]), U * (sa * A[0] + ca * A[1]), U * (ca * A[2] - sa * A[3]), U * (sa * A[2] + ca * A[3]), tx, ty);
        ctx.globalAlpha = LF.content;
        ctx.drawImage(this.paper, 0, 0);
        ctx.restore();
      }
      path();
      ctx.strokeStyle = 'rgba(125,118,166,0.38)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    // handwriting (only once the sheet is open and flat)
    if (LF.k.F1 === 0 && LF.k.F2 === 0) {
      ctx.save();
      const [tx, ty] = [ox - U * (ca * 0.5), oy - U * (sa * 0.5)];
      const k = U / CS;
      ctx.setTransform(k * ca, k * sa, -k * sa, k * ca, tx, ty);
      for (const ln of this.lines) drawWriting(ctx, ln);
      const hp = this.HEART.p;
      if (hp > 0) {
        const [hx, hy] = this.heartAt, s = 0.075 * CS;
        ctx.strokeStyle = COL.heart; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.setLineDash([400 * hp, 400]);
        ctx.beginPath();
        ctx.moveTo(hx, hy + s * 0.35);
        ctx.bezierCurveTo(hx - s * 0.9, hy - s * 0.2, hx - s * 0.45, hy - s * 0.95, hx, hy - s * 0.42);
        ctx.bezierCurveTo(hx + s * 0.45, hy - s * 0.95, hx + s * 0.9, hy - s * 0.2, hx, hy + s * 0.35);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
  },

  drawPetals(front, t) {
    const ctx = this.ctx;
    for (const p of this.petals) {
      if (!p.on || p.front !== front || p.y > H + 40) continue;
      const age = t - p.t0;
      const sway = p.fa * Math.sin(age * p.fw + p.ph) * Math.min(1, age * 1.5);
      const flip = Math.cos(age * p.tw + p.ph);
      ctx.setTransform(1, 0, 0, 1, p.x + sway, p.y);
      ctx.rotate(p.rot * DEG);
      ctx.scale(1, 0.25 + 0.75 * Math.abs(flip));
      ctx.fillStyle = p.col;
      if (p.conf) {
        ctx.fillRect(-p.s * 0.32, -p.s * 0.16, p.s * 0.64, p.s * 0.32);
      } else {
        petalPath(ctx, p.s);
        ctx.fill();
        ctx.fillStyle = 'rgba(232,130,160,0.35)';
        ctx.beginPath(); ctx.ellipse(0, p.s * 0.3, p.s * 0.1, p.s * 0.16, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  },
});

/** feathered wipe up to the leading edge of the stagger (the character most recently started) */
function drawWriting(ctx, ln) {
  let edge = -1;
  for (let i = 0; i < ln.chars.length; i++) {
    const r = ln.chars[i].r;
    if (r <= 0) break;
    edge = (i ? ln.cuts[i - 1] : 6) + (ln.cuts[i] - (i ? ln.cuts[i - 1] : 6)) * r;
  }
  if (edge < 0) return;
  const done = ln.chars[ln.chars.length - 1].r >= 1;
  const F = 16, solid = done ? ln.w : Math.max(0, edge - F);
  if (solid > 0) ctx.drawImage(ln.img, 0, 0, solid, ln.h, ln.left, ln.top, solid, ln.h);
  if (!done) {
    for (let s = 0; s < 4; s++) {
      const x0 = solid + (s * F) / 4, w = F / 4;
      if (x0 + w > ln.w) break;
      ctx.globalAlpha = 1 - (s + 0.5) / 4;
      ctx.drawImage(ln.img, x0, 0, w, ln.h, ln.left + x0, ln.top, w, ln.h);
    }
    ctx.globalAlpha = 1;
  }
}

/** string of pastel flags from the pole across the rooftops, fluttering */
function drawBunting(ctx, t) {
  const p0 = [40, 1150], p1 = [1130, 1112], c = [600, 1250];
  const at = (q) => [(1 - q) * (1 - q) * p0[0] + 2 * (1 - q) * q * c[0] + q * q * p1[0], (1 - q) * (1 - q) * p0[1] + 2 * (1 - q) * q * c[1] + q * q * p1[1]];
  ctx.strokeStyle = 'rgba(110,80,110,0.8)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.quadraticCurveTo(c[0], c[1], p1[0], p1[1]); ctx.stroke();
  const cols = ['#f7b8c8', '#fde4a0', '#b9e2cd', '#bcd6f3', '#dccbf3', '#ffc9b0'];
  for (let i = 0; i < 16; i++) {
    const q0 = 0.03 + i * 0.06, q1 = q0 + 0.035;
    const a = at(q0), b = at(q1), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const fl = 0.22 * Math.sin(t * 2.4 + i * 0.9) + 0.08 * Math.sin(t * 5.3 + i * 2.1);
    const tip = [m[0] + Math.sin(fl) * 46, m[1] + Math.cos(fl) * 46];
    ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(tip[0], tip[1]); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(120,90,140,0.12)';
    ctx.beginPath(); ctx.moveTo(m[0], m[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(tip[0], tip[1]); ctx.closePath(); ctx.fill();
  }
}
