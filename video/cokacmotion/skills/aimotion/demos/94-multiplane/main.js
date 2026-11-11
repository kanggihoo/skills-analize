/*
 * 94 · 이슬 너머 먼 불빛 — a multiplane camera over flat-illustration layers.
 *
 * A bamboo grove before sunrise. Every layer is a flat illustration card painted once, standing at a depth z;
 * a pinhole camera (focal length F) dollies, trucks and cranes through them, so each card's screen scale is
 * F / (z − camZ) — perspective-correct parallax, not a per-layer factor. Depth cues, all derived from that one d:
 *   atmospheric perspective  each card is mixed toward the haze colour by 1 − exp(−d / FOG_D)
 *   depth of field           defocus disc b = APER·F·|1/d_f − 1/d|; each card has a blur pyramid baked in setup
 *                            (σ = 0, 2, 4, 8 … texels) and two neighbouring levels are cross-faded per frame
 *   rack focus               d_f follows the dewdrop, then is pulled (in diopters) to the far house
 *   bokeh                    glints and dust are points at their own depths, drawn as discs of radius b/2
 *   light shafts             a 1/4-size buffer of the sun cut by upright silhouettes, smeared from the sun
 * Setup paints and blurs everything; frame(t) only composites (drawImage + a few fills).
 */
import { defineDemo, rand, clamp, lerp, smooth, ramp, ease } from '../_lib/stage.js';
import { FONTS, fontReady } from '../_lib/type.js';

const D = 9.5, W = 1080, H = 1920, TAU = Math.PI * 2;
const F = 1000, CX = 540, CY = 940;      // focal length (stage px at distance F) and principal point (the horizon)
const APER = 30;                          // aperture (world units): defocus disc diameter b = APER·F·|1/d_f − 1/d| px
const FOG_D = 4600, FOG_NEAR = 300;       // atmospheric perspective: fog = 1 − exp(−(d − FOG_NEAR) / FOG_D)
const NEAR = 40;                          // a card closer than this to the lens has passed the camera
const CAM0 = { x: -30, y: 0, z: 0 };      // the reference camera every card is painted for (t = 0, no handheld)
const RS = 4;                             // light-shaft buffer scale (1/4 of the stage)
const RW = W / RS, RH = H / RS;
const Z_DEW = 600, Z_HOUSE = 6500, SUN_X = 835, SUN_R = 27;
const KR = `"${FONTS.pretendard.family}"`;
const NEAR_TXT = ['가까이', '이슬', ' 한 방울'], FAR_TXT = ['멀리', '먼저 깨어난', '창 하나'];

// ---------------------------------------------------------------- colour
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixc = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const SKY0 = ['#0d1230', '#252a57', '#6c5d8e', '#3a375c'].map(hex);   // before dawn: top, mid, horizon, below
const SKY1 = ['#36578c', '#94a0c8', '#ffcf9e', '#a8877a'].map(hex);   // sunrise
const HAZE0 = ['#283060', '#6a6194', '#383a5e'].map(hex);             // haze: top, horizon, bottom
const HAZE1 = ['#8a9ec6', '#e4b39a', '#76665f'].map(hex);

// ---------------------------------------------------------------- camera, focus, light (closed forms of t)
const cosRamp = (p) => p - Math.sin(TAU * p) / TAU;                   // 0→1, zero speed at both ends
function camera(t) {
  const p = clamp(t / D), g = 0.35 * p + 0.65 * cosRamp(p);           // a glide that is already moving at t = 0
  return {
    x: CAM0.x + 110 * g + 1.4 * Math.sin(0.83 * t + 0.4) + 0.6 * Math.sin(2.1 * t + 1.3),   // truck right + handheld
    y: CAM0.y - 50 * cosRamp(p) + 1.1 * Math.sin(0.97 * t + 2.2) + 0.5 * Math.sin(2.6 * t), // crane up
    z: 520 * g,                                                                              // dolly in
  };
}
const RACK = [3.7, 5.5];
/** 1 / focus distance: the lens finds the drop (0–1.1 s), follows it, then racks to the house (in diopters) */
function focusInv(t, cam) {
  const near = Z_DEW - cam.z, far = Z_HOUSE - cam.z;
  const hunt = 1 / (near * (1 + 0.6 * (1 - ease.outCubic(clamp(t / 1.1)))));
  return lerp(hunt, 1 / far, ease.inOutCubic(clamp((t - RACK[0]) / (RACK[1] - RACK[0]))));
}
function environment(t) {
  const dawn = smooth((t - 0.3) / 8.6);
  const sunK = ramp(t, 3.8, 6.2);
  return {
    dawn, sunK,
    sun: [SUN_X, 905 - 230 * (0.5 - 0.5 * Math.cos(Math.PI * clamp((t - 1.6) / 7.5)))],   // rises through the tree line on the ridge
    sky: SKY0.map((c, i) => mixc(c, SKY1[i], dawn)),
    haze: HAZE0.map((c, i) => mixc(c, HAZE1[i], dawn)),
    light: mixc(hex('#cfd9ff'), hex('#ffd9a0'), sunK),               // colour of glints and lit dust
  };
}

// ---------------------------------------------------------------- canvases and affine maps
let CPU = false;   // headless only: CPU raster for every canvas (no GPU↔CPU copies, faster on SwiftShader)
function mk(w, h, cpu = CPU) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  return { c, ctx: c.getContext('2d', cpu ? { willReadFrequently: true } : undefined) };
}
// [a, b, c, d, e, f]: x' = a·x + c·y + e, y' = b·x + d·y + f (the canvas setTransform order)
const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

// ---------------------------------------------------------------- flat illustration primitives (reference-frame px)
function leaf(ctx, x, y, ang, L, Wd, fill, rib, rim) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(L * 0.16, -Wd * 0.95, L * 0.55, -Wd * 0.72, L, Wd * 0.08);
  ctx.bezierCurveTo(L * 0.55, Wd * 0.62, L * 0.16, Wd * 0.75, 0, 0);
  ctx.fillStyle = fill; ctx.fill();
  if (rim) {   // a thin sky-lit upper edge (backlit leaves)
    ctx.strokeStyle = rim; ctx.lineWidth = Math.max(0.8, Wd * 0.07);
    ctx.beginPath(); ctx.moveTo(L * 0.06, -Wd * 0.42); ctx.bezierCurveTo(L * 0.2, -Wd * 0.8, L * 0.55, -Wd * 0.6, L * 0.97, Wd * 0.05); ctx.stroke();
  }
  if (rib) {
    ctx.strokeStyle = rib; ctx.lineWidth = Math.max(0.6, Wd * 0.06);
    ctx.beginPath(); ctx.moveTo(L * 0.03, 0); ctx.quadraticCurveTo(L * 0.5, -Wd * 0.06, L * 0.95, Wd * 0.06); ctx.stroke();
  }
  ctx.restore();
}
/** a bamboo twig with a fan of drooping leaves; dir ±1 = which way it reaches; returns leaf tips (for glints) */
function spray(ctx, r, x, y, dir, size, pal) {
  const a0 = dir > 0 ? 0.35 + r() * 0.5 : Math.PI - 0.35 - r() * 0.5;
  const Lt = size * (0.35 + r() * 0.35), ex = x + Math.cos(a0) * Lt, ey = y + Math.sin(a0) * Lt;
  ctx.strokeStyle = pal.twig; ctx.lineWidth = Math.max(0.8, size * 0.025); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + ex) / 2, (y + ey) / 2 - Lt * 0.15, ex, ey); ctx.stroke();
  const n = 3 + Math.floor(r() * 4), tips = [];
  for (let i = 0; i < n; i++) {
    const u = 0.35 + 0.65 * (n > 1 ? i / (n - 1) : 1);
    const px = x + (ex - x) * u, py = y + (ey - y) * u - Lt * 0.15 * 4 * u * (1 - u);
    const fan = -0.55 + r() * 1.75;                                 // mostly hanging, a few lifted
    const ang = dir > 0 ? fan : Math.PI - fan;
    const L = size * (0.5 + r() * 0.4), Wd = L * (0.12 + r() * 0.03);
    leaf(ctx, px, py, ang, L, Wd, pal.leaf[Math.floor(r() * pal.leaf.length)], pal.rib, pal.rim);
    tips.push([px + Math.cos(ang) * L * 0.9, py + Math.sin(ang) * L * 0.9]);
  }
  return tips;
}
/** a culm: flat body, light and shade stripes, a sun-side rim, nodes with the pale powder band under each */
function stalk(ctx, r, x, yb, w, lean, pal, nodeGap, sunX) {
  const len = yb + 260, nodes = [];
  ctx.save(); ctx.translate(x, yb); ctx.rotate(lean);
  ctx.fillStyle = pal.stalk; ctx.fillRect(-w / 2, -len, w, len + 20);
  ctx.fillStyle = pal.lite; ctx.globalAlpha = 0.5; ctx.fillRect(-w / 2 + w * 0.13, -len, w * 0.15, len);
  ctx.fillStyle = pal.shade; ctx.globalAlpha = 0.55; ctx.fillRect(w / 2 - w * 0.3, -len, w * 0.3, len);
  ctx.globalAlpha = 0.55; ctx.fillStyle = pal.rim;
  const side = x < sunX ? 1 : -1;
  ctx.fillRect(side > 0 ? w / 2 - Math.max(1, w * 0.06) : -w / 2, -len, Math.max(1, w * 0.06), len);
  ctx.globalAlpha = 1;
  let y = -nodeGap * (0.2 + r() * 0.8);
  while (y > -len) {
    const nh = Math.max(1.2, w * 0.07);
    ctx.fillStyle = pal.band; ctx.globalAlpha = 0.28; ctx.fillRect(-w / 2, y + nh, w, Math.max(2, w * 0.35));
    ctx.globalAlpha = 1; ctx.fillStyle = pal.node;
    ctx.beginPath(); ctx.roundRect(-w / 2 - w * 0.05, y - nh / 2, w * 1.1, nh, nh / 2); ctx.fill();
    ctx.fillStyle = pal.lite; ctx.globalAlpha = 0.45; ctx.fillRect(-w / 2, y - nh / 2 - Math.max(1, w * 0.03), w, Math.max(1, w * 0.03));
    ctx.globalAlpha = 1;
    nodes.push([x - y * Math.sin(lean), yb + y * Math.cos(lean)]);
    y -= nodeGap * (0.82 + r() * 0.36);
  }
  ctx.restore();
  return nodes;
}
// the winding path to the house, as seen by the reference camera: centre x and width at stage y (a ground plane:
// width ∝ y − CY). Every floor card paints its own stretch, so the path breaks and re-joins as the planes slide.
const pathX = (y) => 600 + 110 * Math.sin((y - 1050) / 210 + 0.3), pathW = (y) => 0.37 * (y - CY);
function forestFloor(ctx, r, y, P, z) {
  const u = F / z, bh = 26 * Math.sqrt(u) + 6;                    // u: px per world unit for this card
  const ph = r() * TAU, ph2 = r() * TAU, yAt = (x) => y + bh * (0.5 * Math.sin(x * 0.006 + ph) + 0.3 * Math.sin(x * 0.017 + ph2));
  const g = ctx.createLinearGradient(0, y - bh, 0, y + 380 * u + 40);
  g.addColorStop(0, P.groundTop); g.addColorStop(1, P.ground);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-200, 2300);
  for (let x = -200; x <= 1300; x += 12) ctx.lineTo(x, yAt(x));
  ctx.lineTo(1300, 2300); ctx.fill();
  // the path: packed earth with a worn lighter middle
  const y0 = yAt(pathX(y)) + 2, ys = [];
  for (let yy = y0; yy <= 2300; yy += 20) ys.push(yy);
  const edge = (side, k) => ys.map((yy) => [pathX(yy) + side * pathW(yy) * k, yy]);
  for (const [k, col] of [[0.5, P.path], [0.22, P.pathLite]]) {
    const L = edge(-1, k), R = edge(1, k).reverse();
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]);
    for (const [px, py] of L) ctx.lineTo(px, py);
    for (const [px, py] of R) ctx.lineTo(px, py);
    ctx.fill();
  }
  // fallen leaves and stones on the floor, sized by depth
  for (let i = 0; i < 46; i++) {
    const fy = y + 8 + r() ** 1.6 * 420 * u, fx = -150 + r() * 1380, L = (16 + r() * 14) * u + 2;
    leaf(ctx, fx, fy, r() * TAU, L, L * 0.2, P.litter[Math.floor(r() * P.litter.length)]);
  }
  for (let i = 0; i < 7; i++) {
    const sy = y + 20 * u + r() * 260 * u, side = r() < 0.5 ? -1 : 1, sx = pathX(sy) + side * pathW(sy) * (0.5 + r() * 0.25), sr = (12 + r() * 16) * u + 1;
    ctx.fillStyle = P.stone; ctx.beginPath(); ctx.ellipse(sx, sy, sr, sr * 0.6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = P.stoneLite; ctx.beginPath(); ctx.ellipse(sx - sr * 0.2, sy - sr * 0.25, sr * 0.55, sr * 0.25, 0, 0, TAU); ctx.fill();
  }
  // bamboo shoots (juksun) pushing up along the bank
  if (z <= 2800) {
    for (let i = 0; i < 5; i++) {
      let sx = -100 + r() * 1300;
      if (Math.abs(sx - pathX(y)) < pathW(y) + 30) sx += 260;
      const sy = yAt(sx) + 6 * u + r() * 30 * u, sh = (70 + r() * 80) * u, sw = sh * 0.34, lean = (r() - 0.5) * 0.3;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(lean);
      ctx.fillStyle = P.shoot; ctx.beginPath(); ctx.moveTo(-sw / 2, 0); ctx.quadraticCurveTo(-sw * 0.45, -sh * 0.6, 0, -sh); ctx.quadraticCurveTo(sw * 0.45, -sh * 0.6, sw / 2, 0); ctx.fill();
      ctx.strokeStyle = P.shootLine; ctx.lineWidth = Math.max(0.8, sw * 0.06);
      ctx.beginPath(); for (let k = 1; k < 5; k++) { const yy = -sh * k / 5, ww = sw * 0.5 * (1 - k / 5.5); ctx.moveTo(-ww, yy + ww * 0.4); ctx.quadraticCurveTo(0, yy - ww * 0.3, ww, yy + ww * 0.4); } ctx.stroke();
      ctx.restore();
    }
  }
  ctx.fillStyle = P.grass;                                             // tufts of blades along the bank
  for (let x = -190; x < 1290; x += bh * (0.5 + r() * 1.2)) {
    const n = 2 + Math.floor(r() * 4), yb = yAt(x) + bh * 0.15;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const bx = x + (r() - 0.5) * bh * 0.8, h = bh * (0.6 + r() * 1.1), lean = (r() - 0.5) * bh * 0.9, bw = bh * 0.09;
      ctx.moveTo(bx - bw, yb); ctx.quadraticCurveTo(bx + lean * 0.3, yb - h * 0.6, bx + lean, yb - h); ctx.quadraticCurveTo(bx + lean * 0.3 + bw, yb - h * 0.5, bx + bw, yb);
    }
    ctx.fill();
  }
}

// ---------------------------------------------------------------- palettes (unfogged; haze is mixed in per frame)
const pal = (lift) => {
  const L = (h) => rgb(mixc(hex(h), [150, 190, 160], lift));
  return {
    stalk: L('#2b4636'), lite: L('#58805f'), shade: L('#1a2b22'), node: L('#14211a'), band: '#c9d8c4', rim: '#b8d8c0',
    leaf: [L('#22392b'), L('#2c4a36'), L('#36573f')], rib: L('#4a6d50'), rim2: '#a9cfb2', twig: L('#26392c'),
    ground: L('#101914'), groundTop: L('#26362b'), grass: L('#1d2e22'), path: L('#3a3a30'), pathLite: L('#4a473a'),
    litter: [L('#5a4a2c'), L('#4a4026'), L('#3a4a2e')], stone: L('#3c4040'), stoneLite: L('#5c615e'),
    shoot: L('#4e4030'), shootLine: L('#2e261c'),
  };
};

// ---------------------------------------------------------------- the cards
function bambooCard({ name, z, m, seed, w, step, gap, hole, nodeGap, sprayP, sprayS, xs, canopyY, fog = 1 }) {
  const P = pal(name === 'bamboo1' ? 0 : name === 'bamboo2' ? 0.04 : 0.08);
  const glints = [];
  return {
    name, z, m, fog, rect: [-150, -150, 1380, 2220], glints,
    draw(ctx, occ) {                                                   // occ: the shaft occluder (culms and leaves, no floor)
      const r = rand(seed), gy = CY + 700 * F / z;
      const list = xs ? xs.map(([x, ww]) => [x, ww]) : [];
      if (!xs) {
        for (let x = -140; x < 1240; x += step[0] + r() * (step[1] - step[0])) {
          if ((x > gap[0] && x < gap[1]) || (hole && x > hole[0] && x < hole[1])) continue;
          list.push([x, w[0] + r() * (w[1] - w[0])]);
        }
      }
      const sprays = [];
      for (const [x, ww] of list) {
        const nodes = stalk(ctx, r, x, gy + 6 + r() * 14, ww, (r() - 0.5) * 0.05, P, nodeGap * (0.85 + r() * 0.3), SUN_X);
        for (const [nx, ny] of nodes) {
          if (ny < canopyY && r() < sprayP) sprays.push([nx, ny, x < 540 ? (r() < 0.75 ? 1 : -1) : (r() < 0.75 ? -1 : 1), sprayS * (0.7 + r() * 0.6)]);
        }
      }
      for (const [x, y, dir, s] of sprays) {
        const tips = spray(ctx, r, x, y, dir, s, { ...P, rim: P.rim2 });
        if (z <= 1000) for (const [tx, ty] of tips) {                  // same draws in both modes: the occluder must match
          const keep = r() < 0.45, g = { x: tx, y: ty, r: 1.6 + r() * 1.8, a: 0.55 + r() * 0.45, ph: r() * TAU };
          if (keep && !occ) glints.push(g);
        }
      }
      if (!occ) forestFloor(ctx, r, gy, P, z);
    },
  };
}

const ridgeLine = (base, peaks) => (x) => base - peaks.reduce((s, [c, h, w]) => s + h * Math.exp(-(((x - c) / w) ** 2)), 0) + 4 * Math.sin(x * 0.05) + 3 * Math.sin(x * 0.13 + 1);
const RIDGE_NEAR = [868, [[120, 120, 170], [400, 80, 130], [690, 22, 60], [1000, 140, 170], [1220, 90, 140]]];
function ridgeCard(name, z, base, peaks, col, pines, fog) {
  return {
    name, z, m: 1, fog, rect: [-150, 520, 1380, 900], mask: pines,      // only the tree line cuts shafts
    draw(ctx, occ) {
      const r = rand(z), yAt = ridgeLine(base, peaks);
      ctx.fillStyle = col;
      if (!occ) {
        ctx.beginPath(); ctx.moveTo(-160, 1440);
        for (let x = -160; x <= 1240; x += 4) ctx.lineTo(x, yAt(x));
        ctx.lineTo(1240, 1440); ctx.fill();
      }
      if (pines) {                                                    // a tree line on the crest; the sun rises through it
        ctx.beginPath();
        for (let x = -150; x < 1230; x += 4 + r() * 7) {
          const gap = r() < 0.2, tall = 1 + 1.3 * Math.exp(-(((x - SUN_X) / 150) ** 2));
          const y = yAt(x) + 3, h = (8 + r() * 12) * tall, w = h * (0.3 + r() * 0.12);
          if (gap) continue;
          ctx.moveTo(x - w, y); ctx.lineTo(x, y - h); ctx.lineTo(x + w, y);
          ctx.moveTo(x - w * 0.75, y - h * 0.4); ctx.lineTo(x, y - h * 1.12); ctx.lineTo(x + w * 0.75, y - h * 0.4);
        }
        ctx.fill();
        if (occ) ctx.fillRect(-160, yAt(SUN_X) + 2, 1400, 3);
      }
    },
  };
}

const HX = 640, HY = 1000;     // the house (reference px, on the far hill)
function houseCard() {
  return {
    name: 'house', z: Z_HOUSE, m: 1.4, fog: 0.55, rect: [-150, 860, 1380, 640], mask: false,
    glints: [{ x: HX - 22, y: HY - 25, r: 7, a: 1, ph: 0, window: true }],
    draw(ctx) {
      const r = rand(65);
      // the hill and its terraces
      const hill = (x) => HY + 3 + 0.00016 * (x - HX) ** 2 + 6 * Math.sin(x * 0.011);
      ctx.fillStyle = '#34443e';
      ctx.beginPath(); ctx.moveTo(-160, 1500); for (let x = -160; x <= 1240; x += 6) ctx.lineTo(x, hill(x)); ctx.lineTo(1240, 1500); ctx.fill();
      ctx.strokeStyle = 'rgba(160,190,170,0.18)'; ctx.lineWidth = 2;
      for (let k = 1; k < 6; k++) { ctx.beginPath(); for (let x = -160; x <= 1240; x += 10) { const y = hill(x) + k * 16 + 4 * Math.sin(x * 0.02 + k); if (x === -160) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }
      // round trees along the crest
      for (const [tx, s] of [[HX - 150, 1], [HX - 112, 0.75], [HX + 120, 0.9], [HX + 210, 1.1], [HX + 300, 0.8], [HX - 260, 0.9], [HX + 380, 1]]) {
        const ty = hill(tx);
        ctx.fillStyle = '#3d2f26'; ctx.fillRect(tx - 2.5 * s, ty - 22 * s, 5 * s, 22 * s);
        ctx.fillStyle = '#2e463a';
        ctx.beginPath(); ctx.ellipse(tx, ty - 34 * s, 22 * s, 20 * s, 0, 0, TAU); ctx.ellipse(tx - 14 * s, ty - 24 * s, 14 * s, 12 * s, 0, 0, TAU); ctx.ellipse(tx + 13 * s, ty - 26 * s, 15 * s, 12 * s, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(190,220,190,0.22)'; ctx.beginPath(); ctx.ellipse(tx - 6 * s, ty - 44 * s, 10 * s, 6 * s, -0.4, 0, TAU); ctx.fill();
      }
      // the persimmon tree beside the house: bare branches and orange fruit
      { const tx = HX + 82, ty = HY;
        ctx.strokeStyle = '#3a2a20'; ctx.lineCap = 'round';
        const br = (x, y, a, l, wd, d) => { const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
          if (d > 0) { br(x2, y2, a - 0.45 - r() * 0.2, l * 0.72, wd * 0.68, d - 1); br(x2, y2, a + 0.4 + r() * 0.2, l * 0.7, wd * 0.68, d - 1); }
          else { ctx.fillStyle = '#f08a3a'; ctx.beginPath(); ctx.arc(x2, y2, 2.6, 0, TAU); ctx.fill(); } };
        br(tx, ty, -Math.PI / 2, 26, 5, 4); }
      // stone wall (dam) along the yard
      ctx.fillStyle = '#6f6a62'; ctx.beginPath(); ctx.roundRect(HX - 132, HY - 10, 264, 12, 6); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(HX - 128, HY - 10, 256, 2);
      // the house: stone base, cream walls, wooden posts, a lit paper window, a dark door
      ctx.fillStyle = '#857e72'; ctx.fillRect(HX - 60, HY - 14, 120, 10);
      ctx.fillStyle = '#e9d9ba'; ctx.fillRect(HX - 50, HY - 46, 100, 32);
      ctx.fillStyle = '#5b3f2c'; for (const px of [-50, -16, 18, 46]) ctx.fillRect(HX + px, HY - 46, 4, 32);
      ctx.fillStyle = '#5b3f2c'; ctx.fillRect(HX - 50, HY - 47, 100, 4);
      ctx.fillStyle = '#ffcf77'; ctx.fillRect(HX - 34, HY - 38, 26, 20);               // the window
      ctx.strokeStyle = '#b57636'; ctx.lineWidth = 1.2;
      ctx.beginPath(); for (const gx of [-27.5, -21, -14.5]) { ctx.moveTo(HX + gx, HY - 38); ctx.lineTo(HX + gx, HY - 18); } ctx.moveTo(HX - 34, HY - 28); ctx.lineTo(HX - 8, HY - 28); ctx.stroke();
      ctx.fillStyle = '#4a3326'; ctx.fillRect(HX + 24, HY - 40, 18, 26);                 // door
      // the roof: dark tiles with up-turned eaves (cheoma)
      ctx.fillStyle = '#2f3440';
      ctx.beginPath();
      ctx.moveTo(HX - 84, HY - 58); ctx.quadraticCurveTo(HX - 66, HY - 46, HX - 40, HY - 48); ctx.lineTo(HX + 40, HY - 48); ctx.quadraticCurveTo(HX + 66, HY - 46, HX + 84, HY - 58);
      ctx.quadraticCurveTo(HX + 62, HY - 60, HX + 46, HY - 74); ctx.lineTo(HX - 46, HY - 74); ctx.quadraticCurveTo(HX - 62, HY - 60, HX - 84, HY - 58);
      ctx.fill();
      ctx.fillStyle = '#4a5162'; ctx.beginPath(); ctx.roundRect(HX - 50, HY - 78, 100, 6, 3); ctx.fill();
      ctx.strokeStyle = 'rgba(120,130,150,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); for (let k = -38; k <= 38; k += 7) { ctx.moveTo(HX + k, HY - 72); ctx.lineTo(HX + k * 1.25, HY - 50); } ctx.stroke();
      ctx.fillStyle = '#857e72'; ctx.fillRect(HX - 76, HY - 30, 8, 20);                  // chimney (gulttuk)
      // the yard in front: a path down the hill
      ctx.fillStyle = 'rgba(190,170,140,0.25)';
      ctx.beginPath(); ctx.moveTo(HX + 20, HY + 2); ctx.quadraticCurveTo(HX + 60, HY + 50, HX + 20, HY + 120); ctx.lineTo(HX + 2, HY + 120); ctx.quadraticCurveTo(HX + 40, HY + 50, HX + 8, HY + 2); ctx.fill();
    },
  };
}

// the dew branch (z = 600): a sprig from the upper right; one drooping leaf holds the drop
const LEAF_BASE = [800, 470], LEAF_TIP = [470, 700], DROP_R = 46;
const BRANCH_LEAVES = [[930, 400, 200, 330, 46], [930, 400, 104, 300, 42], [1050, 300, 68, 290, 44], [1100, 250, -58, 270, 40],
  [800, 470, 76, 250, 36], [860, 440, 232, 240, 34], [1180, 190, 150, 300, 44]];
const DEW_PAL = { leaf: ['#2d5a3b', '#356644', '#2a5236'], rib: '#6c9c70', rim: '#9fd3aa', twig: '#2f4733' };
function branchCard() {
  const glints = [];
  return {
    name: 'branch', z: Z_DEW, m: 1.5, fog: 1, rect: [380, -60, 900, 900], glints,
    draw(ctx, occ) {
      const r = rand(606);
      ctx.strokeStyle = DEW_PAL.twig; ctx.lineCap = 'round';
      ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(1300, 120); ctx.quadraticCurveTo(1060, 260, 930, 400); ctx.stroke();
      ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(930, 400); ctx.quadraticCurveTo(860, 430, 800, 470); ctx.stroke();
      ctx.strokeStyle = 'rgba(170,210,170,0.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1290, 118); ctx.quadraticCurveTo(1056, 256, 928, 396); ctx.stroke();
      ctx.fillStyle = '#243a2a'; for (const [x, y] of [[930, 400], [1050, 300]]) { ctx.beginPath(); ctx.ellipse(x, y, 8, 6, -0.6, 0, TAU); ctx.fill(); }
      BRANCH_LEAVES.forEach(([x, y, deg, L, Wd], i) => {
        const a = deg * Math.PI / 180;
        leaf(ctx, x, y, a, L, Wd, DEW_PAL.leaf[i % 3], DEW_PAL.rib, DEW_PAL.rim);
        for (let k = 0; k < 2; k++) {                                  // tiny dew beads along the leaf
          const u = 0.35 + r() * 0.55, off = (r() < 0.5 ? -1 : 1) * Wd * 0.35 * Math.sin(Math.PI * u);
          const bx = x + Math.cos(a) * L * u - Math.sin(a) * off, by = y + Math.sin(a) * L * u + Math.cos(a) * off, br = 2.5 + r() * 3;
          ctx.fillStyle = 'rgba(200,225,255,0.35)'; ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(10,25,20,0.35)'; ctx.lineWidth = 1; ctx.stroke();
          const ph = r() * TAU;
          if (!occ) glints.push({ x: bx - br * 0.3, y: by - br * 0.3, r: 1.2 + br * 0.25, a: 0.8, ph });
        }
      });
    },
  };
}
const leafAngle = Math.atan2(LEAF_TIP[1] - LEAF_BASE[1], LEAF_TIP[0] - LEAF_BASE[0]), leafLen = Math.hypot(LEAF_TIP[0] - LEAF_BASE[0], LEAF_TIP[1] - LEAF_BASE[1]);
const DROP_T = 3.5;                                                     // the drop lets go
function leafRot(t) {
  const sag = 0.035 * ramp(t, 2.0, DROP_T);                            // the swelling drop bends the leaf
  if (t < DROP_T) return sag + 0.006 * Math.sin(1.3 * t);
  const u = t - DROP_T;
  return -0.03 + (sag + 0.03) * Math.exp(-3.2 * u) * Math.cos(15 * u) + 0.006 * Math.sin(1.3 * t);   // spring back, ring down
}
function dewLeafCard() {
  return {
    name: 'dewleaf', z: Z_DEW, m: 1.6, fog: 1, rect: [400, 380, 440, 380], pivot: LEAF_BASE,
    anim: (t) => ({ rot: leafRot(t) }),
    draw(ctx) { leaf(ctx, LEAF_BASE[0], LEAF_BASE[1], leafAngle, leafLen + 6, 54, '#326a43', '#78ab7a', '#a8dcb2'); },
  };
}
function dropCard() {
  const [x, y] = LEAF_TIP, cy = y + 14 + DROP_R;
  return {
    name: 'drop', z: Z_DEW, m: 1.7, fog: 0.6, rect: [x - 70, y - 12, 140, 150], pivot: [x, y],
    glints: [{ x: x - 17, y: cy - 20, r: 3.2, a: 1, ph: 1.3, spec: true }],
    anim(t) {
      const vx = LEAF_TIP[0] - LEAF_BASE[0], vy = LEAF_TIP[1] - LEAF_BASE[1];
      const tip = (th) => [LEAF_BASE[0] + Math.cos(th) * vx - Math.sin(th) * vy, LEAF_BASE[1] + Math.sin(th) * vx + Math.cos(th) * vy];
      if (t < DROP_T) {                                                 // ride the leaf tip, swell and stretch before letting go
        const [tx, ty] = tip(leafRot(t)), sx = 1 + 0.1 * ramp(t, 2.2, DROP_T);
        return { dx: tx - x, dy: ty - y, sx, sy: sx + 0.1 * ramp(t, 2.8, DROP_T) };
      }
      const [tx, ty] = tip(leafRot(DROP_T - 1e-4)), u = t - DROP_T;     // free fall (5600 ref px/s²), stretched by speed
      return { dx: tx - x, dy: ty - y + 2800 * u * u, sx: 1.1 - Math.min(0.08, u * 0.3), sy: 1.2 - Math.min(0.06, u * 0.4) + Math.min(0.12, u * 0.4),
        alpha: 1 - ramp(t, DROP_T + 0.5, DROP_T + 0.7) };
    },
    draw(ctx) {
      // a water drop is a ball lens: the world behind it appears small and upside down
      ctx.save();
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + 6, y + 8, x + DROP_R * 0.7, cy - DROP_R * 0.95, x + DROP_R * 0.95, cy - DROP_R * 0.3);
      ctx.arc(x, cy, DROP_R, -0.32, Math.PI + 0.32);
      ctx.bezierCurveTo(x - DROP_R * 0.7, cy - DROP_R * 0.95, x - 6, y + 8, x, y);
      ctx.clip();
      const g = ctx.createLinearGradient(0, cy - DROP_R, 0, cy + DROP_R);
      g.addColorStop(0, '#1a2a26'); g.addColorStop(0.42, '#253a35'); g.addColorStop(0.55, '#7a6d98'); g.addColorStop(0.82, '#e3b9a8'); g.addColorStop(1, '#ffe2bd');
      ctx.fillStyle = g; ctx.fillRect(x - 80, y - 20, 160, 160);
      // inverted ridge and hill hanging into the bright (inverted) sky
      ctx.fillStyle = '#2c3a48';
      ctx.beginPath(); ctx.moveTo(x - 60, cy - 10);
      for (let k = -60; k <= 60; k += 4) ctx.lineTo(x + k, cy + 4 + 6 * Math.exp(-(((k + 10) / 14) ** 2)) + 3 * Math.sin(k * 0.3));
      ctx.lineTo(x + 60, cy - 10); ctx.fill();
      ctx.fillStyle = '#ffd27e'; ctx.beginPath(); ctx.arc(x + 5, cy - 3, 2.6, 0, TAU); ctx.fill();         // the window, upside down
      ctx.fillStyle = 'rgba(255,210,126,0.35)'; ctx.beginPath(); ctx.arc(x + 5, cy - 3, 6, 0, TAU); ctx.fill();
      // refraction rim: dark edge, bright caustic crescent at the bottom
      const rg = ctx.createRadialGradient(x, cy, DROP_R * 0.55, x, cy, DROP_R * 1.02);
      rg.addColorStop(0, 'rgba(10,20,25,0)'); rg.addColorStop(0.75, 'rgba(10,20,25,0.18)'); rg.addColorStop(1, 'rgba(8,16,20,0.75)');
      ctx.fillStyle = rg; ctx.fillRect(x - 80, y - 20, 160, 160);
      ctx.strokeStyle = 'rgba(255,240,215,0.75)'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(x, cy, DROP_R - 6, Math.PI * 0.22, Math.PI * 0.78); ctx.stroke();
      ctx.restore();
      // specular highlight
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.beginPath(); ctx.ellipse(x - 17, cy - 21, 10, 6, -0.7, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 16, cy + 18, 2.4, 0, TAU); ctx.fill();
    },
  };
}

function sprigs(ctx, r, list, P, glints, glintP = 0.4) {
  for (const [x, y, a0, a1, n, L0, L1] of list) {
    for (let i = 0; i < n; i++) {
      const a = (a0 + (a1 - a0) * (n > 1 ? i / (n - 1) : 0.5) + (r() - 0.5) * 0.15) * Math.PI / 180;
      const L = L0 + r() * (L1 - L0), Wd = L * 0.13;
      leaf(ctx, x, y, a, L, Wd, P.leaf[i % P.leaf.length], P.rib, P.rim);
      const keep = r() < glintP, gr = 2 + r() * 2, ga = 0.7 + r() * 0.3, gp = r() * TAU;
      if (glints && keep) glints.push({ x: x + Math.cos(a) * L * 0.85, y: y + Math.sin(a) * L * 0.85, r: gr, a: ga, ph: gp });
    }
  }
}
function fg2Card() {
  const glints = [];
  const P = { leaf: ['#0f1a13', '#132119', '#17271d'], rib: '#1f3326', rim: '#3d5c46' };
  return {
    name: 'fg2', z: 820, m: 0.6, fog: 1, rect: [-200, -200, 1480, 2320], glints,
    draw(ctx, occ) {
      const r = rand(820);
      sprigs(ctx, r, [[-90, 1950, -78, -28, 6, 380, 520], [1220, 1300, 160, 228, 5, 300, 420], [-80, 40, 8, 70, 5, 300, 420], [1230, 1980, 196, 250, 4, 420, 560]], P, occ ? null : glints, 0.7);
    },
  };
}
function fgCard() {
  const glints = [];
  const P = { leaf: ['#09100c', '#0c140f'], rib: '#13201a', rim: null };
  return {
    name: 'fg', z: 260, m: 0.35, fog: 1, rect: [-300, -300, 1680, 2520], glints,
    draw(ctx, occ) {
      const r = rand(260);
      sprigs(ctx, r, [[1300, 2100, 200, 252, 4, 700, 900], [-220, -180, 28, 72, 3, 620, 820]], P, occ ? null : glints, 0.8);
    },
  };
}

// titles: text set into the world at a depth, so they focus and parallax with their plane
function textCard(name, z, m, x, y, parts, size, weight, align, t0, tOut) {
  const meas = mk(4, 4).ctx;
  meas.font = `${weight} ${size}px ${KR}`; meas.letterSpacing = size < 40 ? '6px' : '-1px';
  const widths = parts.map(([s]) => meas.measureText(s).width), tw = widths.reduce((a, b) => a + b, 0);
  const x0 = align === 'center' ? x - tw / 2 : x;
  return {
    name, z, m, fog: 0.35, mask: false, rect: [x0 - 40, y - size * 1.1, tw + 80, size * 1.6], pivot: [x0, y],
    anim(t) {
      const p = ease.outExpo(clamp((t - t0) / 1.0));
      return { dy: (1 - p) * 26, alpha: clamp((t - t0) / 0.45) * (tOut ? 1 - ramp(t, tOut, tOut + 0.9) : 1) };
    },
    draw(ctx) {
      ctx.font = `${weight} ${size}px ${KR}`; ctx.letterSpacing = size < 40 ? '6px' : '-1px'; ctx.textBaseline = 'alphabetic';
      ctx.shadowColor = 'rgba(8,10,28,0.45)'; ctx.shadowBlur = 14 * m;
      let cx = x0;
      parts.forEach(([s, col], i) => { ctx.fillStyle = col; ctx.fillText(s, cx, y); cx += widths[i]; });
    },
  };
}

// ---------------------------------------------------------------- sprites for glints, dust and bokeh
function sprite(kind, c) {
  const S = 128, { c: cv, ctx } = mk(S, S), col = c.join(',');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 63);
  if (kind === 'disc') {                       // bokeh: flat disc, a slightly brighter rim, soft edge
    g.addColorStop(0, `rgba(${col},0.62)`); g.addColorStop(0.7, `rgba(${col},0.7)`); g.addColorStop(0.88, `rgba(${col},0.95)`);
    g.addColorStop(0.95, `rgba(${col},0.5)`); g.addColorStop(1, `rgba(${col},0)`);
  } else {                                     // dot: a soft glowing point
    g.addColorStop(0, `rgba(${col},1)`); g.addColorStop(0.22, `rgba(${col},0.6)`); g.addColorStop(0.55, `rgba(${col},0.12)`); g.addColorStop(1, `rgba(${col},0)`);
  }
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  if (kind === 'star') {                       // a four-point sparkle for in-focus speculars
    ctx.fillStyle = `rgba(${col},1)`;
    ctx.beginPath(); ctx.moveTo(64, 2); ctx.quadraticCurveTo(67, 61, 126, 64); ctx.quadraticCurveTo(67, 67, 64, 126); ctx.quadraticCurveTo(61, 67, 2, 64); ctx.quadraticCurveTo(61, 61, 64, 2); ctx.fill();
  }
  return cv;
}

// ---------------------------------------------------------------- the demo
defineDemo({
  id: '94-multiplane',
  title: '이슬 너머 먼 불빛',
  tech: '멀티플레인 카메라 · 평면 일러스트의 깊이',
  duration: D,
  background: '#000',

  async setup(api) {
    CPU = api.headless;
    await fontReady(`800 64px ${KR}`, NEAR_TXT.join('') + FAR_TXT.join(''));
    await fontReady(`600 30px ${KR}`, '가까이멀리');
    const main = api.canvas({ type: '2d', attrs: CPU ? { willReadFrequently: true } : undefined });
    this.ctx = main.ctx;
    this.scratch = mk(W, H);
    this.rayA = mk(RW, RH, true); this.rayB = mk(RW, RH, true);       // tiny, read back every frame → always CPU
    this.rayS = mk(RW, RH, true);                                      // the same field as shadow beams (multiplied)

    const defs = [
      ridgeCard('ridgeFar', 18000, 820, [[230, 150, 240], [560, 90, 150], [1120, 190, 170]], '#3d4869', false, 0.9),
      ridgeCard('ridgeNear', 11000, ...RIDGE_NEAR, '#28324c', true, 0.75),
      { mist: true, z: 8000, y: 880, w: 900, h: 70, a: 0.24, x: 600 },
      houseCard(),
      { mist: true, z: 6100, y: 1050, w: 1100, h: 60, a: 0.2, x: 500 },
      textCard('farK', 5600, 1.3, 585, 384, [[FAR_TXT[0], 'rgba(255,240,220,0.85)']], 30, 600, 'center', 4.85),
      textCard('far1', 5600, 1.3, 585, 470, [[FAR_TXT[1], '#fff6ea']], 66, 800, 'center', 4.97),
      textCard('far2', 5600, 1.3, 585, 550, [[FAR_TXT[2], '#ffc46b']], 66, 800, 'center', 5.09),
      bambooCard({ name: 'bamboo4', z: 4200, m: 1.15, seed: 41, w: [9, 16], step: [24, 44], gap: [395, 780], hole: [808, 866], nodeGap: 70, sprayP: 0.35, sprayS: 70, canopyY: 300, fog: 1 }),
      { mist: true, z: 3300, y: 1150, w: 1300, h: 80, a: 0.18, x: 540 },
      bambooCard({ name: 'bamboo3', z: 2800, m: 1.0, seed: 31, w: [18, 28], step: [42, 74], gap: [330, 880], nodeGap: 105, sprayP: 0.4, sprayS: 110, canopyY: 330, fog: 0.9 }),
      { mist: true, z: 2200, y: 1290, w: 1400, h: 90, a: 0.14, x: 540 },
      bambooCard({ name: 'bamboo2', z: 1700, m: 1.0, seed: 21, w: [34, 50], step: [74, 120], gap: [262, 905], nodeGap: 170, sprayP: 0.5, sprayS: 170, canopyY: 430, fog: 0.85 }),
      bambooCard({ name: 'bamboo1', z: 1000, m: 0.9, seed: 11, xs: [[-40, 104], [118, 86], [930, 96], [1075, 112]], nodeGap: 280, sprayP: 0.7, sprayS: 270, canopyY: 700 }),
      { rays: true, z: 950 },
      fg2Card(),
      branchCard(), dewLeafCard(), dropCard(),
      textCard('nearK', Z_DEW, 1.6, 100, 900, [[NEAR_TXT[0], 'rgba(225,235,255,0.85)']], 30, 600, 'left', 0.5, 4.1),
      textCard('near1', Z_DEW, 1.6, 100, 982, [[NEAR_TXT[1], '#bfe3ff'], [NEAR_TXT[2], '#f3f1ea']], 68, 800, 'left', 0.62, 4.2),
      fgCard(),
    ];
    // bake each card: paint once at m texels per reference px, then the blur pyramid (σ = 2^k level-0 texels)
    this.items = defs.map((d) => {
      if (d.mist || d.rays) return d;
      const [x0, y0, w, h] = d.rect, m = d.m;
      const L0 = mk(w * m, h * m);
      L0.ctx.setTransform(m, 0, 0, m, -x0 * m, -y0 * m);
      d.draw(L0.ctx);
      const L1 = mk(L0.c.width, L0.c.height);
      L1.ctx.filter = 'blur(2px)'; L1.ctx.drawImage(L0.c, 0, 0);
      const levels = [L0.c, L1.c];
      for (let prev = L1.c; levels.length < 8;) {                   // each next level: half size + √3 px → σ doubles
        const cw = Math.ceil(prev.width / 2), ch = Math.ceil(prev.height / 2);
        if (cw < 6 || ch < 6) break;
        const Lk = mk(cw, ch); Lk.ctx.filter = 'blur(1.732px)'; Lk.ctx.drawImage(prev, 0, 0, cw, ch);
        levels.push(Lk.c); prev = Lk.c;
      }
      d.levels = levels;
      d.s0 = F / (d.z - CAM0.z);
      if (d.mask !== false) {                                          // occluder for the light shafts (1/RS texels per ref px)
        const M = mk(w / RS, h / RS, true);
        M.ctx.setTransform(1 / RS, 0, 0, 1 / RS, -x0 / RS, -y0 / RS);
        d.draw(M.ctx, true);
        d.maskC = M.c;
      }
      return d;
    });
    this.cards = this.items.filter((d) => d.levels);

    // dust motes, each at its own depth (log-uniform 480–7000), placed through the reference camera
    const r = rand(4242);
    this.motes = Array.from({ length: 420 }, () => {
      const Z = 480 * Math.pow(7000 / 480, r()), s0 = F / Z, xr = -120 + r() * 1320, yr = -150 + r() * 2200;
      return { Z, X: CAM0.x + (xr - CX) / s0, Y: CAM0.y + (yr - CY) / s0, r: 2.5 + r() * 3.5, vx: (r() - 0.5) * 16, vy: -(4 + r() * 12),
        sw: 5 + r() * 14, f: 0.3 + r() * 0.6, ph: r() * TAU, a: 0.35 + r() * 0.55 };
    }).sort((a, b) => b.Z - a.Z);
    const rs = rand(77);
    this.stars = Array.from({ length: 70 }, () => ({ x: rs() * W, y: rs() * 760, s: 0.6 + rs() ** 3 * 1.6, ph: rs() * TAU, w: 1 + rs() * 2.5 }));

    // sprites: cool (pre-dawn) and warm (sunlit) variants, blended per frame
    const cool = hex('#dce6ff'), warm = hex('#ffdcaa'), gold = hex('#ffbe62');
    this.spr = { dotC: sprite('dot', cool), dotW: sprite('dot', warm), discC: sprite('disc', cool), discW: sprite('disc', warm),
      starC: sprite('star', cool), starW: sprite('star', warm), dotG: sprite('dot', gold), discG: sprite('disc', gold) };
    // vignette and grain, painted once
    const V = mk(W, H), vg = V.ctx.createRadialGradient(CX, 900, 300, CX, 900, 1250);
    vg.addColorStop(0, 'rgba(4,5,14,0)'); vg.addColorStop(0.6, 'rgba(4,5,14,0.18)'); vg.addColorStop(1, 'rgba(4,5,14,0.72)');
    V.ctx.fillStyle = vg; V.ctx.fillRect(0, 0, W, H);
    this.vignette = V.c;
    const G = mk(256, 256), img = G.ctx.createImageData(256, 256), rg = rand(9);
    for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (rg() + rg() - 1) * 120; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    G.ctx.putImageData(img, 0, 0);
    this.grain = this.ctx.createPattern(G.c, 'repeat');
  },

  frame(t) {
    const ctx = this.ctx, S = this.scratch, cam = camera(t), env = environment(t);
    const invF = focusInv(t, cam);
    ctx.imageSmoothingQuality = 'high'; S.ctx.imageSmoothingQuality = 'high';   // fixed per frame: no state carried over
    const defocus = (d) => APER * F * Math.abs(invF - 1 / d);           // disc diameter on screen (px)

    // ---- where every card is this frame
    for (const c of this.cards) {
      const d = c.z - cam.z;
      if (d < NEAR) { c.st = null; continue; }
      const s = F / d, k = s / c.s0;
      let M = [k, 0, 0, k, CX * (1 - k) + (CAM0.x - cam.x) * s, CY * (1 - k) + (CAM0.y - cam.y) * s];
      const a = c.anim ? c.anim(t) : null;
      if (a) {
        const [px, py] = c.pivot, cs = Math.cos(a.rot || 0), sn = Math.sin(a.rot || 0), sx = a.sx || 1, sy = a.sy || 1;
        const A = [cs * sx, sn * sx, -sn * sy, cs * sy, 0, 0];
        A[4] = px + (a.dx || 0) - (A[0] * px + A[2] * py); A[5] = py + (a.dy || 0) - (A[1] * px + A[3] * py);
        M = mul(M, A);
      }
      const alpha = (a && a.alpha != null ? a.alpha : 1) * smooth((d - NEAR) / 140);
      c.st = alpha > 0.003 ? { d, s, k, M, alpha } : null;
    }

    // ---- light shafts: the sun's glow, cut by every upright silhouette, smeared away from the sun (1/RS size)
    const rayK = env.sunK * 0.95 + 0.05 * env.dawn;
    let rayBuf = null, rayData = null;
    if (rayK > 0.01) {
      let A = this.rayA, B = this.rayB;
      const g = A.ctx, sx = env.sun[0] / RS, sy = env.sun[1] / RS;
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, RW, RH);
      const sg = g.createRadialGradient(sx, sy, 0, sx, sy, 600 / RS);
      sg.addColorStop(0, 'rgba(255,255,255,1)'); sg.addColorStop(0.07, 'rgba(255,255,255,0.95)'); sg.addColorStop(0.18, 'rgba(255,255,255,0.2)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.04)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      const sunVis = clamp((ridgeLine(...RIDGE_NEAR)(SUN_X) - (env.sun[1] - SUN_R)) / (2 * SUN_R));   // how much of the disc has cleared the ridge
      g.globalAlpha = (0.2 + 0.8 * sunVis) * (1 - 0.35 * ramp(t, 6.4, 9.5)); g.fillStyle = sg; g.fillRect(0, 0, RW, RH);
      g.globalCompositeOperation = 'destination-out';
      for (const c of this.cards) {
        if (!c.st || !c.maskC) continue;
        const M = c.st.M;
        g.setTransform(M[0] / RS, M[1] / RS, M[2] / RS, M[3] / RS, M[4] / RS, M[5] / RS);
        g.globalAlpha = c.st.alpha;
        g.drawImage(c.maskC, c.rect[0], c.rect[1], c.rect[2], c.rect[3]);
      }
      for (let i = 0; i < 5; i++) {                                     // 5 doubling passes → 32 radial samples
        const sc = Math.pow(1.07, 2 ** i), b = B.ctx;
        b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over'; b.globalAlpha = 1; b.clearRect(0, 0, RW, RH);
        b.globalCompositeOperation = 'lighter'; b.globalAlpha = 0.5; b.drawImage(A.c, 0, 0);
        b.setTransform(sc, 0, 0, sc, sx * (1 - sc), sy * (1 - sc)); b.drawImage(A.c, 0, 0);
        [A, B] = [B, A];
      }
      // shape on the CPU (130k px): a contrast curve that keeps beams distinct from the glow, then the light's colour
      const img = A.ctx.getImageData(0, 0, RW, RH), px = img.data, lc = mixc(hex('#c9c8ff'), hex('#ffc777'), env.sunK);
      const shd = this.rayS.ctx.createImageData(RW, RH), sp = shd.data, dc = hex('#5a5878');
      rayData = new Float32Array(RW * RH);
      for (let i = 0, j = 0; i < px.length; i += 4, j++) {
        const raw = px[i + 3] / 255, v = Math.min(1, Math.pow(raw, 1.4) * 1.9), u = Math.min(1, raw * 2.2);
        rayData[j] = v; px[i] = lc[0]; px[i + 1] = lc[1]; px[i + 2] = lc[2]; px[i + 3] = v * 255;
        sp[i] = dc[0] + (255 - dc[0]) * u; sp[i + 1] = dc[1] + (255 - dc[1]) * u; sp[i + 2] = dc[2] + (255 - dc[2]) * u; sp[i + 3] = 255;
      }
      A.ctx.putImageData(img, 0, 0);
      this.rayS.ctx.putImageData(shd, 0, 0);
      rayBuf = A.c;
    }
    const rayAt = (x, y) => {
      if (!rayData || x < 0 || y < 0 || x >= W || y >= H) return 0;
      return rayK * rayData[((y / RS) | 0) * RW + ((x / RS) | 0)];
    };

    // ---- sky
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    const [sTop, sMid, sHor, sLow] = env.sky, skyG = ctx.createLinearGradient(0, 0, 0, H);
    skyG.addColorStop(0, rgb(sTop)); skyG.addColorStop(0.3, rgb(sMid)); skyG.addColorStop(CY / H, rgb(sHor)); skyG.addColorStop(1, rgb(sLow));
    ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, H);
    const starA = 1 - ramp(t, 1.5, 5);
    if (starA > 0.01) {
      for (const p of this.stars) {
        const a = starA * (0.55 + 0.45 * Math.sin(t * p.w + p.ph)) * 0.8;
        ctx.fillStyle = `rgba(235,238,255,${a.toFixed(3)})`; ctx.fillRect(p.x, p.y, p.s, p.s);
      }
    }
    const [sunX, sunY] = env.sun;
    const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 620);
    const gA = 0.22 + 0.3 * env.dawn;
    glow.addColorStop(0, `rgba(255,236,200,${gA})`); glow.addColorStop(0.18, `rgba(255,190,140,${gA * 0.55})`); glow.addColorStop(1, 'rgba(255,170,130,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = `rgba(255,246,222,${0.4 + 0.6 * env.sunK})`; ctx.beginPath(); ctx.arc(sunX, sunY, SUN_R, 0, TAU); ctx.fill();

    // ---- haze for atmospheric perspective (screen space: vertical + a warm pool around the sun)
    const [hTop, hHor, hBot] = env.haze, hazeG = ctx.createLinearGradient(0, 0, 0, H);
    hazeG.addColorStop(0, rgb(hTop)); hazeG.addColorStop(CY / H, rgb(hHor)); hazeG.addColorStop(1, rgb(hBot));
    const sunHaze = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 640);
    sunHaze.addColorStop(0, 'rgba(255,226,180,1)'); sunHaze.addColorStop(0.35, 'rgba(255,200,150,0.5)'); sunHaze.addColorStop(1, 'rgba(255,190,150,0)');
    const sunHazeA = 0.1 + 0.3 * env.sunK;

    // ---- particles: dust at its own depth, glints riding a card; both drawn as defocus discs
    const spr = this.spr, lightK = env.sunK;
    const point = (x, y, r, rho, a, warmK, star, floor = 0.08) => {
      const R = Math.max(r, Math.hypot(r, rho));
      if (x + R * 2 < 0 || x - R * 2 > W || y + R * 2 < 0 || y - R * 2 > H || a < 0.004) return;
      const q = (r / R) ** 2, sharp = 1 - smooth((R / r - 1.4) / 1.8);
      ctx.globalCompositeOperation = 'lighter';
      const draw = (img, ww, al) => {
        if (al < 0.003) return;
        if (warmK < 0.995) { ctx.globalAlpha = al * (1 - warmK); ctx.drawImage(img[0], x - ww, y - ww, ww * 2, ww * 2); }
        if (warmK > 0.005) { ctx.globalAlpha = al * warmK; ctx.drawImage(img[1], x - ww, y - ww, ww * 2, ww * 2); }
      };
      draw([spr.dotC, spr.dotW], Math.max(1.2, r * 2.4), a * sharp);
      draw([spr.discC, spr.discW], R, a * (1 - sharp) * Math.max(q, floor));
      if (star && sharp > 0.05) draw([spr.starC, spr.starW], r * (5 + 3 * star), a * sharp * star * 0.9);
    };
    const motes = this.motes;
    let mi = 0;
    const drawMotesBehind = (z) => {
      for (; mi < motes.length && motes[mi].Z > z; mi++) {
        const p = motes[mi], d = p.Z - cam.z;
        if (d < 70) continue;
        const s = F / d;
        const X = p.X + p.vx * t + p.sw * Math.sin(p.f * t + p.ph), Y = p.Y + p.vy * t + p.sw * 0.6 * Math.cos(p.f * 0.8 * t + p.ph);
        const x = CX + (X - cam.x) * s, y = CY + (Y - cam.y) * s;
        const lit = clamp(rayAt(x, y) * 2.4);                          // dust glitters where the shafts are
        const a = p.a * (0.2 + 1.1 * lit) * smooth((d - 70) / 150) * (0.45 + 0.55 * env.dawn);
        point(x, y, Math.max(0.7, p.r * s), defocus(d) * 0.5, Math.min(1, a), clamp(lit * 1.5 * (0.3 + 0.7 * lightK)), 0, 0.13);
      }
    };
    const drawGlints = (c) => {
      const st = c.st, rho = defocus(st.d) * 0.5;
      for (const g of c.glints) {
        const [x, y] = apply(st.M, g.x, g.y), r = g.r * st.k;
        if (g.window) {                                                 // the lit window: a warm light at the house's depth
          const R = Math.max(r, Math.hypot(r, rho)), swell = ramp(t, 5.0, 6.0);
          for (let i = 0; i < 7; i++) {                                 // chimney smoke (someone has lit the fire)
            const ph = (t * 0.2 + i / 7) % 1, sx = HX - 72 + ph * 70 + 6 * Math.sin(ph * 6 + i), sy = HY - 34 - ph * 170;
            const [px, py] = apply(st.M, sx, sy), pr = (5 + ph * 30) * st.k, prr = Math.hypot(pr, rho * 0.8);
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.16 * Math.sin(Math.PI * ph) * (pr / prr) * st.alpha;
            ctx.drawImage(lightK > 0.5 ? spr.dotW : spr.dotC, px - prr * 1.6, py - prr * 1.6, prr * 3.2, prr * 3.2);
          }
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = (0.28 + 0.3 * swell) * st.alpha; ctx.drawImage(spr.dotG, x - r * (6 + 4 * swell), y - r * (6 + 4 * swell), r * (12 + 8 * swell), r * (12 + 8 * swell));
          ctx.globalAlpha = 0.55 * st.alpha * Math.max((r / R) ** 2, 0.16); ctx.drawImage(spr.discG, x - R, y - R, R * 2, R * 2);
          continue;
        }
        const tw = 0.6 + 0.4 * Math.sin(t * 2.3 + g.ph) * Math.sin(t * 1.1 + g.ph * 2);
        const a = g.a * st.alpha * tw * (0.45 + 0.55 * lightK + (g.spec ? 0.3 : 0));
        point(x, y, r, rho, a, lightK, g.spec ? 1 : 0.4 * tw, 0.24);
      }
    };

    // ---- the multiplane: cards back to front through one scratch canvas
    const sc = S.ctx;
    const corners = (c) => {
      const [x0, y0, w, h] = c.rect, M = c.st.M;
      let a = Infinity, b = Infinity, e = -Infinity, f = -Infinity;
      for (const [u, v] of [[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h]]) {
        const [x, y] = apply(M, u, v); a = Math.min(a, x); b = Math.min(b, y); e = Math.max(e, x); f = Math.max(f, y);
      }
      return [a, b, e, f];
    };
    for (const it of this.items) {
      drawMotesBehind(it.z);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      if (it.rays) {
        if (rayBuf) {                                                   // shadow beams darken, light beams brighten
          ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = rayK * 0.55; ctx.drawImage(this.rayS.c, 0, 0, W, H);
          ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = Math.min(1, rayK * 0.85); ctx.drawImage(rayBuf, 0, 0, W, H);
        }
        continue;
      }
      if (it.mist) {                                                    // a soft band of ground mist at its depth
        const d = it.z - cam.z, s = F / d, k = s * it.z / F;
        const x = CX + (CAM0.x + (it.x - CX) * it.z / F - cam.x) * s, y = CY + (CAM0.y + (it.y - CY) * it.z / F - cam.y) * s;
        ctx.save(); ctx.translate(x, y); ctx.scale(it.w * k, it.h * k);
        const mg = ctx.createRadialGradient(0, 0, 0, 0, 0, 1), mc = mixc(hHor, [255, 240, 225], 0.25);
        mg.addColorStop(0, rgb(mc, it.a)); mg.addColorStop(1, rgb(mc, 0));
        ctx.fillStyle = mg; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
        continue;
      }
      const st = it.st;
      if (!st) continue;
      let [bx0, by0, bx1, by1] = corners(it);
      bx0 = Math.max(0, Math.floor(bx0) - 2); by0 = Math.max(0, Math.floor(by0) - 2); bx1 = Math.min(W, Math.ceil(bx1) + 2); by1 = Math.min(H, Math.ceil(by1) + 2);
      if (bx1 <= bx0 || by1 <= by0) continue;
      const bw = bx1 - bx0, bh = by1 - by0;
      // depth of field: σ (screen px) → σ in level-0 texels → two neighbouring pyramid levels and their mix
      const sigTex = 0.3 * defocus(st.d) / st.k * it.m, top = it.levels.length - 1;
      let i0, w;
      if (sigTex <= 2) { i0 = 0; w = sigTex / 2; } else { const lf = Math.min(top, Math.log2(sigTex)); i0 = Math.min(top - 1, Math.floor(lf)); w = lf - i0; }
      sc.setTransform(1, 0, 0, 1, 0, 0); sc.globalCompositeOperation = 'source-over'; sc.globalAlpha = 1;
      sc.clearRect(bx0, by0, bw, bh);
      const M = st.M, [x0, y0, rw, rh] = it.rect;
      sc.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
      if (w < 0.996) { sc.globalAlpha = 1 - w; sc.drawImage(it.levels[i0], x0, y0, rw, rh); }
      if (w > 0.004) { sc.globalCompositeOperation = 'lighter'; sc.globalAlpha = w; sc.drawImage(it.levels[i0 + 1], x0, y0, rw, rh); }
      // atmospheric perspective: mix toward the haze by distance (source-atop keeps the card's own alpha)
      const fog = it.fog * (1 - Math.exp(-Math.max(0, st.d - FOG_NEAR) / FOG_D));
      sc.setTransform(1, 0, 0, 1, 0, 0); sc.globalCompositeOperation = 'source-atop';
      if (fog > 0.004) {
        sc.globalAlpha = fog; sc.fillStyle = hazeG; sc.fillRect(bx0, by0, bw, bh);
        sc.globalAlpha = fog * sunHazeA; sc.fillStyle = sunHaze; sc.fillRect(bx0, by0, bw, bh);
      }
      ctx.globalAlpha = st.alpha;
      ctx.drawImage(S.c, bx0, by0, bw, bh, bx0, by0, bw, bh);
      if (it.glints) drawGlints(it);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    drawMotesBehind(-Infinity);

    // ---- grade, vignette, grain, fade in
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.16 + 0.04 * env.sunK;
    ctx.fillStyle = rgb(mixc(hex('#3a58b0'), hex('#ffad62'), smooth(env.dawn * 0.4 + env.sunK * 0.8))); ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.drawImage(this.vignette, 0, 0);
    const fi = Math.round(t * 30), rr = rand(5000 + fi);
    this.grain.setTransform(new DOMMatrix([1, 0, 0, 1, Math.floor(rr() * 256), Math.floor(rr() * 256)]));
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.09; ctx.fillStyle = this.grain; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    const fade = 1 - ease.outCubic(clamp(t / 1.0));
    if (fade > 0.002) { ctx.globalAlpha = fade; ctx.fillStyle = '#04050c'; ctx.fillRect(0, 0, W, H); }
    ctx.globalAlpha = 1;
  },
});
